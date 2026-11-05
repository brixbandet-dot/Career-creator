// One zone, played as a side-scrolling level.
import Phaser from 'phaser';
import { buildLayout, TILE, ROWS, GROUND_ROW } from '../layout.js';
import { input } from '../input.js';
import { sfx } from '../sfx.js';

const SPEED = 250;
const JUMP = -690;
const COYOTE_MS = 120;
const BUFFER_MS = 140;
const REACH = 70;

export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }
  create() {
    import('./textures.js').then(({ makeTextures }) => {
      makeTextures(this);
      this.game.events.emit('art-ready');
    });
  }
}

export class LevelScene extends Phaser.Scene {
  constructor() { super('level'); }

  init(data) {
    this.zone = data.zone;
    this.zoneId = data.zoneId;
    this.hooks = data.hooks;
    this.seed = data.seed || 0;
    this.reduceMotion = !!data.reduceMotion;
    this.bossDown = !!data.bossBeaten;
    this.openGates = new Set(data.openGates || []);
    this.doneQuests = new Set(data.doneQuests || []);
    this.sparkCount = 0;
    this.lastGround = 0;
    this.lastJumpPress = -1000;
    this.hurtUntil = 0;
    this.finished = false;
  }

  create() {
    const L = buildLayout(this.zone, this.seed);
    this.L = L;
    const W = L.width * TILE;
    const H = ROWS * TILE;
    this.physics.world.setBounds(0, 0, W, H + 200);

    // Sky and parallax.
    const sky = Phaser.Display.Color.IntegerToColor(this.zone.color);
    this.cameras.main.setBackgroundColor(Phaser.Display.Color.GetColor(
      Math.round(sky.red * 0.35 + 255 * 0.65), Math.round(sky.green * 0.35 + 255 * 0.65), Math.round(sky.blue * 0.35 + 255 * 0.65)));
    for (let i = 0; i < Math.ceil(W / 380) + 2; i++) {
      this.add.image(i * 380 + (i % 2) * 90, 70 + (i % 3) * 40, 'cloud').setScrollFactor(0.2).setAlpha(0.85);
    }
    const hills = this.add.graphics().setScrollFactor(0.45);
    hills.fillStyle(this.zone.color, 0.45);
    for (let x = -200; x < W * 0.45 + 800; x += 260) hills.fillEllipse(x, GROUND_ROW * TILE + 10, 420, 260 + ((x / 260) % 3) * 50);

    // Solid ground (no pits).
    this.solids = this.physics.add.staticGroup();
    this.add.tileSprite(0, (GROUND_ROW + 1) * TILE, W, 600, 'dirt').setOrigin(0, 0);
    const ground = this.add.tileSprite(0, GROUND_ROW * TILE, W, TILE, 'ground').setOrigin(0, 0);
    this.physics.add.existing(ground, true);
    this.solids.add(ground);
    for (const p of L.platforms) {
      const plat = this.add.tileSprite(p.x * TILE, p.y * TILE, p.w * TILE, 20, 'platform').setOrigin(0, 0);
      this.physics.add.existing(plat, true);
      plat.body.checkCollision.down = false;
      plat.body.checkCollision.left = false;
      plat.body.checkCollision.right = false;
      this.solids.add(plat);
    }

    // Sparks to collect.
    this.sparks = this.physics.add.staticGroup();
    for (const s of L.sparks) {
      const sp = this.sparks.create(s.x * TILE + TILE / 2, s.y * TILE + TILE / 2, 'spark');
      if (!this.reduceMotion) this.tweens.add({ targets: sp, y: sp.y - 6, duration: 700 + (s.x % 3) * 90, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    this.sparkTotal = L.sparks.length;

    // Mentors (real-world quests).
    this.talkables = [];
    for (const n of L.npcs) {
      const x = n.x * TILE + TILE / 2;
      const img = this.add.image(x, GROUND_ROW * TILE, 'mentor').setOrigin(0.5, 1);
      const bubble = this.add.text(x, GROUND_ROW * TILE - 96, '!', { fontFamily: 'Lexend, sans-serif', fontSize: '28px', color: '#ffffff', backgroundColor: '#ff8a5c', padding: { x: 12, y: 4 } }).setOrigin(0.5);
      if (!this.reduceMotion) this.tweens.add({ targets: bubble, y: bubble.y - 6, duration: 600, yoyo: true, repeat: -1 });
      this.talkables.push({ kind: 'quest', index: n.quest, x, img, bubble });
      if (this.doneQuests.has(n.quest)) bubble.setText('✓').setBackgroundColor('#3fa36b');
    }

    // Quiz doors.
    this.doors = this.physics.add.staticGroup();
    for (const g of L.gates) {
      const x = g.x * TILE + TILE / 2;
      if (this.openGates.has(g.quiz)) continue;
      const door = this.doors.create(x, GROUND_ROW * TILE - 72, 'door');
      const t = { kind: 'gate', index: g.quiz, x: x - TILE, door };
      door.talk = t;
      this.talkables.push(t);
    }

    // Enemies.
    this.bugs = this.physics.add.group({ allowGravity: true });
    for (const e of L.enemies) {
      const b = this.bugs.create(e.x * TILE, GROUND_ROW * TILE - 20, 'bug');
      b.min = e.min * TILE; b.max = e.max * TILE;
      b.setVelocityX(70).setCollideWorldBounds(true);
      b.body.setSize(34, 28).setOffset(3, 6);
    }

    // Boss and flag.
    this.bossX = L.boss.x * TILE;
    this.boss = this.physics.add.staticImage(this.bossX, GROUND_ROW * TILE - 70, 'boss');
    this.boss.body.setSize(120, 140);
    this.bossTalk = { kind: 'boss', x: this.bossX - 110 };
    this.talkables.push(this.bossTalk);
    this.hpBar = this.add.graphics();
    this.bossHp = 3;
    if (this.bossDown) this.removeBoss(true); else this.drawHp();
    if (!this.reduceMotion && !this.bossDown) this.tweens.add({ targets: this.boss, scaleY: 1.04, duration: 900, yoyo: true, repeat: -1 });

    this.flag = this.physics.add.staticImage(L.flag.x * TILE, GROUND_ROW * TILE - 72, 'flag');

    // Player.
    this.player = this.physics.add.sprite(L.start.x * TILE, GROUND_ROW * TILE - 40, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(26, 44).setOffset(8, 4);

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.doors);
    this.bossCollider = this.physics.add.collider(this.player, this.boss);
    this.physics.add.collider(this.bugs, this.solids);
    this.physics.add.collider(this.bugs, this.doors);
    this.physics.add.overlap(this.player, this.sparks, (_, sp) => this.collect(sp));
    this.physics.add.overlap(this.player, this.bugs, (_, b) => this.touchBug(b));
    this.physics.add.overlap(this.player, this.flag, () => this.finish());

    // "Talk" prompt that floats over whatever is in reach.
    this.prompt = this.add.text(0, 0, '💬', { fontSize: '30px' }).setOrigin(0.5).setVisible(false).setDepth(5);

    const cam = this.cameras.main;
    cam.startFollow(this.player, true, 0.12, 0.12, 0, 40);
    this.fitZoom();
    this.scale.on('resize', this.fitZoom, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fitZoom, this));

    this.hooks.onSparks?.(this.sparkCount, this.sparkTotal);
  }

  fitZoom() {
    const w = this.scale.width;
    // On touch screens, leave a strip of ground under the player for the buttons to sit on.
    const pad = this.registry.get('bottomPad') || 0;
    const h = this.scale.height - pad;
    // Show the full height of the level, and at least about 7 tiles across.
    const zoom = Math.max(0.4, Math.min(h / (ROWS * TILE), w / (7 * TILE), 1.6));
    const cam = this.cameras.main;
    cam.setZoom(zoom);
    cam.setBounds(0, 0, this.L.width * TILE, ROWS * TILE + pad / zoom);
  }

  drawHp() {
    this.hpBar.clear();
    if (this.bossDown) return;
    const x = this.bossX - 60;
    const y = GROUND_ROW * TILE - 170;
    this.hpBar.fillStyle(0x222222, 0.6).fillRoundedRect(x - 4, y - 4, 128, 22, 8);
    for (let i = 0; i < 3; i++) this.hpBar.fillStyle(i < this.bossHp ? 0xff5c5c : 0x555555).fillRoundedRect(x + i * 41, y, 37, 14, 5);
  }

  hitBoss() {
    this.bossHp = Math.max(0, this.bossHp - 1);
    sfx.hit();
    if (!this.reduceMotion) this.cameras.main.shake(200, 0.008);
    this.boss.setTint(0xffffff);
    this.time.delayedCall(150, () => this.boss.clearTint());
    this.drawHp();
  }

  removeBoss(instant = false) {
    this.bossDown = true;
    this.hpBar.clear();
    this.bossCollider?.destroy();
    this.boss.body.enable = false;
    this.talkables = this.talkables.filter((t) => t !== this.bossTalk);
    if (instant || this.reduceMotion) { this.boss.setVisible(false); return; }
    this.tweens.add({ targets: this.boss, alpha: 0, scale: 0.2, angle: 200, duration: 700, onComplete: () => this.boss.setVisible(false) });
  }

  openGate(index) {
    const t = this.talkables.find((x) => x.kind === 'gate' && x.index === index);
    if (!t) return;
    this.talkables = this.talkables.filter((x) => x !== t);
    t.door.body.enable = false;
    if (this.reduceMotion) t.door.destroy();
    else this.tweens.add({ targets: t.door, y: t.door.y - 160, alpha: 0, duration: 600, onComplete: () => t.door.destroy() });
  }

  markQuest(index, done) {
    const t = this.talkables.find((x) => x.kind === 'quest' && x.index === index);
    if (!t) return;
    t.bubble.setText(done ? '✓' : '!').setBackgroundColor(done ? '#3fa36b' : '#ff8a5c');
  }

  collect(sp) {
    sp.destroy();
    this.sparkCount++;
    sfx.spark();
    this.hooks.onSparks?.(this.sparkCount, this.sparkTotal);
  }

  touchBug(b) {
    const p = this.player;
    if (p.body.velocity.y > 0 && p.body.bottom <= b.body.top + 14) {
      b.destroy();
      p.setVelocityY(JUMP * 0.6);
      sfx.stomp();
      return;
    }
    if (this.time.now < this.hurtUntil) return;
    this.hurtUntil = this.time.now + 1000;
    const dir = p.x < b.x ? -1 : 1;
    p.setVelocity(dir * 320, -320);
    sfx.bump();
    p.setTint(0xff9999);
    this.time.delayedCall(400, () => p.clearTint());
  }

  finish() {
    if (this.finished || !this.bossDown) return;
    this.finished = true;
    this.physics.pause();
    this.hooks.onFinish?.(this.sparkCount, this.sparkTotal);
  }

  setPaused(paused) {
    if (paused) this.physics.pause(); else if (!this.finished) this.physics.resume();
  }

  nearest() {
    const px = this.player.x;
    let best = null;
    for (const t of this.talkables) {
      const d = Math.abs(t.x - px);
      if (d < REACH && (!best || d < best.d)) best = { t, d };
    }
    return best?.t || null;
  }

  update(time) {
    if (this.physics.world.isPaused) return;
    const p = this.player;
    const onGround = p.body.blocked.down || p.body.touching.down;
    if (onGround) this.lastGround = time;

    if (time > this.hurtUntil - 700) {
      const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      p.setVelocityX(dir * SPEED);
      if (dir) p.setFlipX(dir < 0);
    }

    if (input.jumpQueued) { this.lastJumpPress = time; input.jumpQueued = false; }
    if (time - this.lastJumpPress < BUFFER_MS && time - this.lastGround < COYOTE_MS) {
      p.setVelocityY(JUMP);
      this.lastJumpPress = -1000;
      this.lastGround = -1000;
      sfx.jump();
    }
    // Short hop when jump is released early.
    if (!input.jumpHeld && p.body.velocity.y < -250) p.setVelocityY(p.body.velocity.y * 0.85);

    const moving = Math.abs(p.body.velocity.x) > 10 && onGround;
    p.setTexture(moving && Math.floor(time / 140) % 2 ? 'player-walk' : 'player');

    for (const b of this.bugs.getChildren()) {
      if (b.x <= b.min) b.setVelocityX(70);
      else if (b.x >= b.max) b.setVelocityX(-70);
      b.setFlipX(b.body.velocity.x < 0);
      b.setTexture(Math.floor(time / 200) % 2 ? 'bug2' : 'bug');
    }

    const near = this.nearest();
    this.prompt.setVisible(!!near);
    if (near) this.prompt.setPosition(p.x, p.y - 56);
    this.hooks.onNear?.(!!near);
    if (input.talkQueued) {
      input.talkQueued = false;
      if (near) {
        p.setVelocityX(0);
        if (near.kind === 'quest') this.hooks.onQuest(near.index);
        else if (near.kind === 'gate') this.hooks.onGate(near.index);
        else if (near.kind === 'boss') this.hooks.onBoss();
      }
    }
  }
}
