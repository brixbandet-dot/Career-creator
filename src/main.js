// Fonts ship with the game, so they work offline. (These packages only export their
// regular weight by name, so the bold files are imported by path.)
import '@fontsource/lexend';
import '../node_modules/@fontsource/lexend/700.css';
import '@fontsource/opendyslexic';
import '../node_modules/@fontsource/opendyslexic/700.css';
import '@fontsource/atkinson-hyperlegible';
import '../node_modules/@fontsource/atkinson-hyperlegible/700.css';
import './style.css';
import Phaser from 'phaser';
import { ZONES, TRACKS, LEVEL_XP, TITLES } from './data.js';
import { loadState, saveState, totalXp, levelFor, isUnlocked, bumpStreak, liveStreak } from './progress.js';
import { loadSettings, saveSettings, applySettings, FONTS, SIZES, SPACING, TINTS } from './settings.js';
import { BootScene, LevelScene } from './game/LevelScene.js';
import { initInput, bindTouch, input, releaseAll } from './input.js';
import { h, panel, toast, readable, listenButton, useSettings } from './ui.js';
import { speak, stop, canSpeak } from './speech.js';
import { sfx, setSfx } from './sfx.js';
import { openCoach, COACH_URL, getCode, setCode } from './coach.js';

let S = loadState();
let settings = loadSettings();
applySettings(settings);
setSfx(settings.sfx);
useSettings(() => settings);
initInput();

const $ = (id) => document.getElementById(id);
const screens = $('screens');
let game = null;
let gameReady = null;
let current = null; // { track, index, zoneId }

/* ---------------- Game ---------------- */
function ensureGame() {
  if (gameReady) return gameReady;
  gameReady = new Promise((resolve) => {
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      backgroundColor: '#bfe3f2',
      scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
      physics: { default: 'arcade', arcade: { gravity: { y: 1500 }, debug: false } },
      render: { pixelArt: false, antialias: true },
      input: { keyboard: false },
      scene: [BootScene, LevelScene],
    });
    game.events.once('art-ready', resolve);
  });
  return gameReady;
}
const scene = () => game?.scene.getScene('level');

function save() { saveState(S); updateHud(); }

function addXp(fn) {
  const before = totalXp(S);
  const lb = levelFor(before);
  fn();
  bumpStreak(S);
  save();
  const after = totalXp(S);
  const la = levelFor(after);
  if (la > lb) { sfx.win(); toast(`Level up! You are now a ${TITLES[la]}`, true); }
  else if (after > before) toast(`+${after - before} XP`);
}

function updateHud() {
  const x = totalXp(S);
  $('hud-level').textContent = `Lv ${levelFor(x) + 1} · ${x} XP`;
}

function showGameUi(on) {
  $('hud').hidden = !on;
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  $('touch').hidden = !on || !touch;
  game?.registry.set('bottomPad', touch ? $('touch').offsetHeight || 96 : 0);
}

async function play(track, index) {
  const zoneId = TRACKS[track].zones[index];
  const zone = ZONES[zoneId];
  current = { track, index, zoneId };
  hideScreens();
  showGameUi(true);
  $('hud-zone').textContent = `${zone.icon} ${zone.name}`;
  updateHud();
  await ensureGame();
  showGameUi(true);
  const openGates = zone.quiz.map((q, i) => (S.quiz[q.id] ? i : -1)).filter((i) => i >= 0);
  const doneQuests = zone.quests.map((q, i) => (S.done[q.id] ? i : -1)).filter((i) => i >= 0);
  game.scene.stop('level');
  if (!S.seenHelp) {
    scene().events.once('create', () => { S.seenHelp = true; saveState(S); helpPanel(); });
  }
  game.scene.start('level', {
    zone, zoneId, seed: index, reduceMotion: settings.reduceMotion,
    bossBeaten: !!S.beaten[zoneId], openGates, doneQuests, hooks: makeHooks(zone, zoneId),
  });
  $('game').focus({ preventScroll: true });
}

function pauseGame(p) { scene()?.setPaused(p); }

/* ---------------- Coach ---------------- */
const questTitles = {};
for (const z of Object.values(ZONES)) for (const q of [...z.quests, z.boss]) questTitles[q.id] = q.t;

function askCoach(extra = {}) {
  const inGame = !!current && !screens.hasChildNodes();
  if (inGame) pauseGame(true);
  openCoach({
    context: {
      track: S.track ? TRACKS[S.track].name : undefined,
      level: TITLES[levelFor(totalXp(S))],
      zone: current ? ZONES[current.zoneId].name : undefined,
      done: Object.keys(S.done).map((id) => questTitles[id]).filter(Boolean),
      ...extra,
    },
    settings: () => settings,
    onClose: () => { if (inGame) pauseGame(false); },
    openSettings: () => showSettings(showMap),
  });
}
const coachAction = (label, extra) => ({ label, icon: '🧑‍🏫', onClick: ({ close }) => { close(); askCoach(extra); } });
const questionText = (q) => `${q.q} Choices: ${q.o.join(' / ')}`;

function helpPanel() {
  pauseGame(true);
  const touch = !$('touch').hidden;
  panel({
    icon: '🎮', kicker: 'How to play', title: 'Walk, jump and talk',
    body: touch
      ? ['Use the arrow buttons to walk. Tap the jump button to jump.', 'When you see a speech bubble, tap the talk button.', 'Robots give you real-life quests. Purple doors ask a question. Beat the boss to finish the level.']
      : ['Use the arrow keys to walk. Press space to jump.', 'When you see a speech bubble, press E to talk.', 'Robots give you real-life quests. Purple doors ask a question. Beat the boss to finish the level.'],
    actions: [{ label: 'Start playing', kind: 'primary', onClick: ({ close }) => close() }],
    onClose: () => pauseGame(false),
  });
}

function makeHooks(zone, zoneId) {
  let bossQueue = null;
  return {
    onSparks: (n, t) => { $('hud-sparks').textContent = `${n}/${t}`; },
    onNear: (near) => { document.querySelector('.tbtn.talk')?.classList.toggle('ready', near); },
    onQuest: (i) => questPanel(zone, i, () => scene()?.markQuest(i, !!S.done[zone.quests[i].id])),
    onGate: (i) => gatePanel(zone, i),
    onBoss: () => {
      if (!bossQueue) bossQueue = [...zone.quiz].sort(() => Math.random() - 0.5);
      bossPanel(zone, zoneId, bossQueue);
    },
    onFinish: (n, t) => finishPanel(zone, zoneId, n, t),
  };
}

function questPanel(zone, i, after) {
  const q = zone.quests[i];
  pauseGame(true);
  const done = !!S.done[q.id];
  panel({
    icon: '🤖', kicker: `Robot mentor · Real-life quest · +${q.xp} XP`, title: q.t,
    body: [q.d, done ? 'You already did this one. Great job!' : 'Do this in real life. Then come back and tap "I did it".'],
    actions: [
      q.link ? { label: `Open ${q.ll}`, icon: '↗', href: q.link } : null,
      { label: done ? 'Not done yet' : 'I did it', icon: done ? '↺' : '✓', kind: done ? 'ghost' : 'good',
        onClick: ({ close }) => {
          if (done) { delete S.done[q.id]; save(); } else { addXp(() => { S.done[q.id] = new Date().toISOString(); }); sfx.right(); }
          after(); close();
        } },
      coachAction('Ask the coach', { quest: `${q.t}: ${q.d}` }),
      { label: 'Back to game', kind: 'primary', onClick: ({ close }) => close() },
    ].filter(Boolean),
    onClose: () => pauseGame(false),
  });
}

function answerList(q, onPick) {
  const feedback = h('p', { class: 'feedback', 'aria-live': 'polite' });
  const list = h('div', { class: 'answers' }, q.o.map((opt, k) => {
    const pick = h('button', { class: 'btn pick', type: 'button' }, h('span', { 'aria-hidden': 'true' }, String.fromCharCode(65 + k) + '.'), ' ', opt);
    pick.addEventListener('click', () => {
      if (k === q.a) onPick(true);
      else { sfx.wrong(); pick.classList.add('wrong'); feedback.textContent = 'Not this one. Try again.'; }
    });
    const say = canSpeak() ? h('button', { class: 'btn say', type: 'button', 'aria-label': `Read answer: ${opt}` }, '🔊') : null;
    say?.addEventListener('click', () => speak(opt, { rate: settings.rate }));
    return h('div', { class: 'answer' }, pick, say);
  }));
  return h('div', {}, list, feedback);
}

function gatePanel(zone, i) {
  const q = zone.quiz[i];
  pauseGame(true);
  let p;
  const extra = answerList(q, () => {
    sfx.right();
    addXp(() => { S.quiz[q.id] = true; });
    p.close();
    pauseGame(true);
    panel({
      icon: '🎉', kicker: 'Correct!', kind: 'win', title: 'The door opens', body: [q.w],
      actions: [{ label: 'Keep going', kind: 'primary', onClick: ({ close }) => close() }],
      onClose: () => { pauseGame(false); scene()?.openGate(i); },
    });
  });
  p = panel({
    icon: '🚪', kicker: 'Quiz door · Take your time', title: q.q, body: ['Pick the right answer to open the door.'],
    extra, actions: [coachAction('Get a hint', { question: questionText(q) }), { label: 'Back to game', kind: 'ghost', onClick: ({ close }) => close() }],
    onClose: () => pauseGame(false),
  });
}

function bossPanel(zone, zoneId, queue) {
  const s = scene();
  if (!s || !queue.length) return;
  const q = queue[0];
  pauseGame(true);
  let p;
  const extra = answerList(q, () => {
    queue.shift();
    p.close();
    pauseGame(true);
    s.hitBoss();
    if (s.bossHp > 0) {
      setTimeout(() => bossPanel(zone, zoneId, queue), 650);
      return;
    }
    setTimeout(() => {
      s.removeBoss();
      sfx.win();
      addXp(() => { S.beaten[zoneId] = true; });
      const b = zone.boss;
      panel({
        icon: '🏆', kicker: `Boss defeated · ${zone.badge} badge`, kind: 'win', title: 'You beat the boss!',
        body: ['The path is open. Walk to the green flag.', `Now the real-life boss: ${b.t}.`, b.d],
        actions: [
          { label: S.done[b.id] ? 'Built it ✓' : 'I built it', icon: S.done[b.id] ? null : '✓', kind: 'good',
            onClick: ({ close }) => { if (!S.done[b.id]) addXp(() => { S.done[b.id] = new Date().toISOString(); }); close(); } },
          { label: 'Back to game', kind: 'primary', onClick: ({ close }) => close() },
        ],
        onClose: () => pauseGame(false),
      });
    }, 700);
  });
  p = panel({
    icon: '👾', kicker: `Boss battle · Hits left: ${s.bossHp}`, kind: 'boss', title: q.q,
    body: ['Each right answer hits the boss. There is no timer.'], extra,
    actions: [coachAction('Get a hint', { question: questionText(q) }), { label: 'Rest and come back', kind: 'ghost', onClick: ({ close }) => close() }],
    onClose: () => pauseGame(false),
  });
}

function finishPanel(zone, zoneId, n, t) {
  S.sparks[zoneId] = Math.max(S.sparks[zoneId] || 0, n);
  save();
  sfx.win();
  const ids = TRACKS[current.track].zones;
  const next = current.index + 1 < ids.length ? ZONES[ids[current.index + 1]] : null;
  panel({
    icon: '🏁', kicker: 'Level complete', kind: 'win', title: `${zone.name} complete!`,
    body: [`You found ${n} of ${t} sparks.`, next ? `Next level: ${next.name}.` : 'You finished every level on this path!'],
    escape: false,
    actions: [
      next ? { label: 'Next level', icon: '▶', kind: 'primary', onClick: ({ close }) => { close(); play(current.track, current.index + 1); } } : null,
      { label: 'Map', icon: '🗺️', kind: next ? '' : 'primary', onClick: ({ close }) => { close(); showMap(); } },
    ].filter(Boolean),
  });
}

/* ---------------- Screens ---------------- */
function showScreen(node) {
  stop();
  if (game) { game.scene.stop('level'); }
  showGameUi(false);
  screens.replaceChildren(node);
  screens.scrollTop = 0;
  (node.querySelector('.primary') || node.querySelector('button'))?.focus({ preventScroll: true });
}
function hideScreens() { stop(); screens.replaceChildren(); }

function readBlock(parts) {
  const r = readable(parts);
  return { nodes: r.nodes, listen: listenButton(r) };
}

function showTitle() {
  const r = readBlock([{ tag: 'h1', text: 'Career Creator' }, { tag: 'p', text: 'A game that teaches you a tech career, one level at a time. Every word can be read out loud.' }]);
  showScreen(h('main', { class: 'screen' },
    h('section', { class: 'hero' },
      h('div', { class: 'art', 'aria-hidden': 'true' }, '🧑‍🚀'),
      r.nodes, r.listen,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', type: 'button', onclick: () => (S.track ? showMap() : showTracks()) }, h('span', { 'aria-hidden': 'true' }, '▶'), ' Play'),
        h('button', { class: 'btn', type: 'button', onclick: () => showSettings(showTitle) }, h('span', { 'aria-hidden': 'true' }, '⚙️'), ' Reading settings')))));
}

function showTracks() {
  const card = (key, desc) => {
    const t = TRACKS[key];
    const r = readBlock([{ tag: 'h2', text: t.name }, { tag: 'p', text: desc }]);
    return h('div', { class: 'choice' }, h('div', { class: 'art', 'aria-hidden': 'true' }, t.icon), r.nodes,
      h('div', { class: 'row' }, h('button', { class: 'btn primary', type: 'button', onclick: () => { S.track = key; save(); showMap(); } }, 'Choose'), r.listen));
  };
  const r = readBlock([{ tag: 'h1', text: 'Pick your path' }, { tag: 'p', text: 'You can switch any time. The first two levels count for both.' }]);
  showScreen(h('main', { class: 'screen' }, r.nodes, r.listen,
    h('div', { class: 'choices' },
      card('ai', 'Build apps and helpers that use AI.'),
      card('cloud', 'Run the servers and systems that apps live on.'))));
}

function playerCard() {
  const x = totalXp(S);
  const l = levelFor(x);
  const lo = LEVEL_XP[l];
  const hi = LEVEL_XP[l + 1];
  const pct = hi ? Math.round(((x - lo) / (hi - lo)) * 100) : 100;
  return h('section', { class: 'player', 'aria-label': 'Your progress' },
    h('div', { class: 'emblem', 'aria-label': `Level ${l + 1}` }, String(l + 1)),
    h('div', { class: 'pinfo' },
      h('h2', {}, TITLES[l]),
      h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct }, h('i', { style: `width:${pct}%` })),
      h('p', { class: 'sub' }, `${x} XP${hi ? ` · ${hi - x} to next level` : ''} · 🔥 ${liveStreak(S)} day streak`)));
}

function showMap() {
  current = null;
  const track = S.track || 'ai';
  const ids = TRACKS[track].zones;
  const tabs = h('div', { class: 'tabs', role: 'group', 'aria-label': 'Career path' },
    Object.entries(TRACKS).map(([k, t]) => h('button', {
      class: 'tab', type: 'button', 'aria-pressed': String(k === track),
      onclick: () => { S.track = k; save(); showMap(); },
    }, h('span', { 'aria-hidden': 'true' }, t.icon), t.name)));

  const cards = ids.map((id, i) => {
    const z = ZONES[id];
    const open = isUnlocked(S, track, i);
    const beaten = !!S.beaten[id];
    const qs = [...z.quests, z.boss];
    const d = qs.filter((q) => S.done[q.id]).length;
    const r = readBlock([{ tag: 'h3', text: z.name }, { tag: 'p', text: `${z.months}. ${z.blurb}` }]);
    const status = beaten ? `✓ Boss beaten · ${d} of ${qs.length} real-life quests done`
      : open ? `${d} of ${qs.length} real-life quests done` : '🔒 Beat the level before to open this';
    return h('li', { class: `zcard ${open ? '' : 'locked'} ${beaten ? 'beaten' : ''}` },
      h('div', { class: 'znum', 'aria-hidden': 'true' }, z.icon, h('b', {}, String(i + 1))),
      h('div', { class: 'zbody' }, r.nodes,
        h('p', { class: `status ${beaten ? 'ok' : ''}` }, status),
        h('div', { class: 'row' },
          h('button', { class: 'btn primary small', type: 'button', disabled: !open, onclick: () => play(track, i) }, h('span', { 'aria-hidden': 'true' }, '▶'), ' Play'),
          h('button', { class: 'btn small', type: 'button', onclick: () => questList(z) }, h('span', { 'aria-hidden': 'true' }, '📋'), ' Quests'),
          r.listen ? (r.listen.classList.add('small'), r.listen) : null)));
  });

  showScreen(h('main', { class: 'screen' },
    h('div', { class: 'topbar' },
      h('div', { class: 'logo' }, h('img', { src: './icon.svg', alt: '' }), 'Career Creator'),
      h('div', { class: 'row' },
        h('button', { class: 'btn small', type: 'button', onclick: () => askCoach() }, h('span', { 'aria-hidden': 'true' }, '🧑‍🏫'), ' Coach'),
        h('button', { class: 'hudbtn', type: 'button', 'aria-label': 'Reading settings', onclick: () => showSettings(showMap) }, h('span', { 'aria-hidden': 'true' }, '⚙️')))),
    playerCard(), tabs, h('ol', { class: 'zones' }, cards)));
}

function questList(z) {
  const items = [...z.quests, z.boss].map((q) => {
    const boss = q === z.boss;
    const btn = h('button', { class: 'check', type: 'button', 'aria-pressed': String(!!S.done[q.id]), 'aria-label': `Mark done: ${q.t}` }, S.done[q.id] ? '✓' : '');
    const r = readBlock([{ tag: 'h3', text: (boss ? 'Boss project: ' : '') + q.t }, { tag: 'p', text: q.d }]);
    const li = h('li', { class: `qitem ${S.done[q.id] ? 'done' : ''}` }, btn,
      h('div', {}, r.nodes, h('div', { class: 'row' },
        h('span', { class: 'pill' }, `+${q.xp} XP`),
        q.link ? h('a', { class: 'btn small', href: q.link, target: '_blank', rel: 'noopener' }, `${q.ll} ↗`) : null,
        r.listen ? (r.listen.classList.add('small'), r.listen) : null)));
    btn.addEventListener('click', () => {
      if (S.done[q.id]) { delete S.done[q.id]; save(); } else { addXp(() => { S.done[q.id] = new Date().toISOString(); }); sfx.right(); }
      const on = !!S.done[q.id];
      btn.setAttribute('aria-pressed', String(on)); btn.textContent = on ? '✓' : ''; li.classList.toggle('done', on);
    });
    return li;
  });
  panel({
    icon: z.icon, kicker: 'Real-life quests', title: z.name, body: ['Tick each one when you do it in real life.'], wide: true,
    extra: h('ul', { class: 'qlist' }, items),
    actions: [{ label: 'Done', kind: 'primary', onClick: ({ close }) => close() }],
    onClose: () => { if (!current) showMap(); },
  });
}

function coachCodeGroup() {
  const input = h('input', { id: 'coach-code', class: 'textin', type: 'password', autocomplete: 'off', value: getCode(), 'aria-label': 'Coach code' });
  const status = h('span', { class: 'sub', 'aria-live': 'polite' });
  const btn = h('button', { class: 'btn small', type: 'button' }, 'Save code');
  btn.addEventListener('click', () => { setCode(input.value); status.textContent = 'Saved.'; });
  return h('div', { class: 'setgroup' }, h('h3', {}, 'Coach code'),
    h('p', { class: 'sub' }, 'If your coach has a code, type it here. It stays on this device.'),
    h('div', { class: 'row' }, input, btn, status));
}

function resumeFromSettings() {
  hideScreens();
  input.blocked = false;
  pauseGame(false);
  $('game').focus({ preventScroll: true });
}

function showSettings(back) {
  const group = (title, entries, key, render) => h('div', { class: 'setgroup' }, h('h3', {}, title),
    h('div', { class: 'opts' }, entries.map(([value, meta]) => {
      const b = h('button', { class: 'opt', type: 'button', 'aria-pressed': String(settings[key] === value) }, render ? render(value, meta) : meta.label);
      b.addEventListener('click', () => { settings[key] = value; saveSettings(settings); applySettings(settings); setSfx(settings.sfx); showSettings(back); });
      return b;
    })));
  const onOff = [[true, { label: 'On' }], [false, { label: 'Off' }]];
  const r = readBlock([{ tag: 'h2', text: 'Try it out' }, { tag: 'p', text: 'The robot gave Sam a quest. Sam read it, made a plan, and started to code.' }]);
  const node = h('main', { class: 'screen' },
    h('div', { class: 'topbar' }, h('h1', {}, 'Reading settings'),
      h('button', { class: 'btn primary', type: 'button', onclick: () => (current ? resumeFromSettings() : back()) }, 'Done')),
    h('section', { class: 'preview' }, r.nodes, r.listen),
    group('Font', Object.entries(FONTS), 'font', (v, m) => h('span', { style: `font-family:${m.css}` }, m.label)),
    group('Text size', Object.entries(SIZES), 'size'),
    group('Spacing', Object.entries(SPACING), 'spacing'),
    group('Background colour', Object.entries(TINTS), 'tint', (v, m) => h('span', { style: `display:inline-flex;align-items:center;gap:8px` },
      h('span', { 'aria-hidden': 'true', style: `width:24px;height:24px;border-radius:6px;background:${m.bg};border:2px solid ${m.line};display:inline-block` }), m.label)),
    canSpeak() ? group('Read out loud by itself', onOff, 'autoRead') : null,
    canSpeak() ? group('Voice speed', [[0.75, { label: 'Slow' }], [0.9, { label: 'Normal' }], [1.1, { label: 'Fast' }]], 'rate') : null,
    group('Sound effects', onOff, 'sfx'),
    group('Less movement', onOff, 'reduceMotion'),
    COACH_URL ? coachCodeGroup() : null);
  if (current) {
    // Opened from inside a level: cover the game, keep your place, and resume after.
    pauseGame(true);
    input.blocked = true;
    releaseAll();
    stop();
    screens.replaceChildren(node);
    screens.scrollTop = 0;
    node.querySelector('.topbar .btn').focus({ preventScroll: true });
  } else showScreen(node);
}

/* ---------------- HUD & touch wiring ---------------- */
$('hud-map').addEventListener('click', () => showMap());
$('hud-settings').addEventListener('click', () => showSettings(showMap));
$('hud-coach').addEventListener('click', (e) => { e.currentTarget.blur(); askCoach(); });
document.querySelectorAll('.tbtn').forEach((b) => bindTouch(b, b.dataset.ctl));
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });

showTitle();
if (import.meta.env.DEV || location.search.includes('debug')) window.__cc = { game: () => game, state: () => S };
