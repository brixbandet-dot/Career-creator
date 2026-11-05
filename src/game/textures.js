// All game art is drawn in code, so there are no image files to load.
export function makeTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const done = (key, w, h) => { g.generateTexture(key, w, h); g.clear(); };

  // Player: a friendly round explorer with a backpack.
  const player = (key, legShift) => {
    g.fillStyle(0x2b3a67); g.fillRoundedRect(4, 14, 10, 22, 4); // backpack
    g.fillStyle(0x3f6fd8); g.fillRoundedRect(8, 10, 26, 30, 10); // body
    g.fillStyle(0x5a3a22); g.fillCircle(21, 12, 11); // head (dark brown skin)
    g.fillStyle(0x2b3a67); g.fillRoundedRect(9, 1, 24, 8, 4); // cap
    g.fillRect(26, 6, 10, 4);
    g.fillStyle(0xffffff); g.fillCircle(25, 13, 3); // eye
    g.fillStyle(0x1b1b1b); g.fillCircle(26, 13, 1.6);
    g.fillStyle(0x8a5a3b); g.fillRect(28, 17, 3, 1.5); // smile
    g.fillStyle(0x2b3a67);
    g.fillRoundedRect(11 + legShift, 38, 7, 10, 3);
    g.fillRoundedRect(24 - legShift, 38, 7, 10, 3);
    done(key, 40, 48);
  };
  player('player', 0);
  player('player-walk', 3);

  // Ground and platforms.
  g.fillStyle(0x8a6a4a); g.fillRect(0, 0, 48, 48);
  g.fillStyle(0x7a5c3f); g.fillRect(6, 20, 10, 6); g.fillRect(28, 34, 12, 6);
  g.fillStyle(0x6fbf73); g.fillRect(0, 0, 48, 12);
  g.fillStyle(0x5aa860); g.fillRect(0, 10, 48, 3);
  done('ground', 48, 48);

  g.fillStyle(0x8a6a4a); g.fillRect(0, 0, 48, 48);
  g.fillStyle(0x7a5c3f); g.fillRect(30, 8, 10, 6); g.fillRect(8, 30, 12, 6);
  done('dirt', 48, 48);

  g.fillStyle(0xb98d5f); g.fillRoundedRect(0, 0, 48, 20, 6);
  g.fillStyle(0x6fbf73); g.fillRoundedRect(0, 0, 48, 8, 4);
  done('platform', 48, 20);

  // Skill spark: a glowing star.
  g.fillStyle(0xffe9a3); g.fillCircle(14, 14, 13);
  g.fillStyle(0xffc531);
  const pts = [];
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 11; const a = -Math.PI / 2 + (i * Math.PI) / 5; pts.push({ x: 14 + r * Math.cos(a), y: 14 + r * Math.sin(a) }); }
  g.fillPoints(pts, true);
  done('spark', 28, 28);

  // Mentor: a robot guide on a little stand.
  g.fillStyle(0x5b6b7f); g.fillRoundedRect(10, 60, 36, 12, 4);
  g.fillStyle(0xe8eef5); g.fillRoundedRect(8, 18, 40, 44, 12);
  g.fillStyle(0x31414f); g.fillRoundedRect(14, 26, 28, 18, 8);
  g.fillStyle(0x7ff0c8); g.fillCircle(22, 35, 4); g.fillCircle(34, 35, 4);
  g.fillStyle(0x5b6b7f); g.fillRect(26, 6, 4, 12);
  g.fillStyle(0xff8a5c); g.fillCircle(28, 6, 6);
  done('mentor', 56, 72);

  // Quiz door.
  g.fillStyle(0x6c4ab6); g.fillRoundedRect(0, 0, 48, 144, 10);
  g.fillStyle(0x8a6ad4); g.fillRoundedRect(6, 6, 36, 132, 8);
  g.fillStyle(0xffd34d); g.fillCircle(24, 64, 12);
  g.fillStyle(0x6c4ab6); g.fillRect(21, 64, 6, 16); g.fillCircle(24, 62, 5);
  done('door', 48, 144);

  // Small bug enemy.
  const bug = (key, legs) => {
    g.fillStyle(0x3a2e2a);
    g.fillRect(6, 26 + legs, 4, 8 - legs); g.fillRect(18, 26 - legs + 2, 4, 6 + legs); g.fillRect(30, 26 + legs, 4, 8 - legs);
    g.fillStyle(0xd9534f); g.fillEllipse(20, 18, 38, 26);
    g.fillStyle(0x3a2e2a); g.fillRect(19, 6, 2, 24); g.fillCircle(11, 15, 3); g.fillCircle(28, 21, 3);
    g.fillStyle(0xffffff); g.fillCircle(34, 12, 4); g.fillStyle(0x111111); g.fillCircle(35, 12, 2);
    done(key, 40, 36);
  };
  bug('bug', 0); bug('bug2', 2);

  // Boss: a giant bug.
  g.fillStyle(0x3a2e2a);
  for (let i = 0; i < 4; i++) g.fillRect(24 + i * 30, 112, 8, 28);
  g.fillStyle(0x8e3b8f); g.fillEllipse(80, 80, 150, 110);
  g.fillStyle(0xb256b3); g.fillEllipse(80, 70, 110, 70);
  g.fillStyle(0xffffff); g.fillCircle(46, 62, 16); g.fillCircle(84, 56, 16);
  g.fillStyle(0x111111); g.fillCircle(42, 64, 7); g.fillCircle(80, 58, 7);
  g.fillStyle(0x3a2e2a); g.fillRect(40, 10, 5, 30); g.fillRect(90, 8, 5, 30);
  g.fillStyle(0xffd34d); g.fillCircle(42, 10, 7); g.fillCircle(92, 8, 7);
  g.fillStyle(0x3a2e2a); g.fillRoundedRect(46, 90, 50, 10, 5);
  done('boss', 160, 140);

  // Goal flag.
  g.fillStyle(0x5b4636); g.fillRect(4, 0, 6, 144);
  g.fillStyle(0x3fbf7f); g.fillTriangle(10, 6, 60, 26, 10, 46);
  done('flag', 64, 144);

  // Background hills and clouds.
  g.fillStyle(0xffffff, 1); g.fillCircle(30, 30, 22); g.fillCircle(60, 24, 26); g.fillCircle(92, 32, 20); g.fillRect(30, 30, 64, 22);
  done('cloud', 120, 56);
  g.destroy();
}
