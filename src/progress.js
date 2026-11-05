// Player progress: what is done, XP, levels, and which zones are open.
import { ZONES, TRACKS, LEVEL_XP } from './data.js';

export const QUIZ_XP = 15;
export const BOSS_GAME_XP = 100;
export const SPARK_XP = 5;
const KEY = 'career-creator-progress';

export function freshState() {
  return { track: null, done: {}, quiz: {}, beaten: {}, sparks: {}, streak: 0, best: 0, last: null };
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (raw) return { ...freshState(), ...JSON.parse(raw) };
  } catch { /* storage blocked: start fresh */ }
  return freshState();
}

export function saveState(state, storage = globalThis.localStorage) {
  try { storage?.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

const questIndex = {};
for (const z of Object.values(ZONES)) for (const q of [...z.quests, z.boss]) questIndex[q.id] = q;

export function totalXp(s) {
  let xp = 0;
  for (const id of Object.keys(s.done)) if (questIndex[id]) xp += questIndex[id].xp;
  xp += Object.keys(s.quiz).length * QUIZ_XP;
  xp += Object.keys(s.beaten).filter((id) => ZONES[id]).length * BOSS_GAME_XP;
  for (const n of Object.values(s.sparks)) xp += (n || 0) * SPARK_XP;
  return xp;
}

export function levelFor(xp) {
  let l = 0;
  while (l + 1 < LEVEL_XP.length && xp >= LEVEL_XP[l + 1]) l++;
  return l;
}

/** A zone opens once the boss of the zone before it (on this track) is beaten in the game. */
export function isUnlocked(s, track, index) {
  if (index === 0) return true;
  const prev = TRACKS[track].zones[index - 1];
  return !!s.beaten[prev];
}

function dayStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Count days in a row with any progress. */
export function bumpStreak(s, now = new Date()) {
  const today = dayStr(now);
  if (s.last === today) return s;
  const y = new Date(now); y.setDate(y.getDate() - 1);
  s.streak = s.last === dayStr(y) ? s.streak + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best || 0, s.streak);
  return s;
}

export function liveStreak(s, now = new Date()) {
  const y = new Date(now); y.setDate(y.getDate() - 1);
  return s.last === dayStr(now) || s.last === dayStr(y) ? s.streak : 0;
}
