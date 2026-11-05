import { describe, it, expect } from 'vitest';
import { ZONES, TRACKS } from '../src/data.js';
import { freshState, totalXp, levelFor, isUnlocked, bumpStreak, liveStreak, QUIZ_XP, BOSS_GAME_XP, SPARK_XP } from '../src/progress.js';
import { buildLayout, gateAfter } from '../src/layout.js';

describe('content', () => {
  it('every track zone exists and every quiz answer is a real option', () => {
    for (const t of Object.values(TRACKS)) for (const id of t.zones) expect(ZONES[id]).toBeTruthy();
    for (const z of Object.values(ZONES)) for (const q of z.quiz) expect(q.o[q.a]).toBeTruthy();
  });
  it('ids are unique', () => {
    const ids = Object.values(ZONES).flatMap((z) => [...z.quests, z.boss, ...z.quiz].map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('progress', () => {
  it('adds up XP from quests, quizzes, bosses and sparks', () => {
    const s = freshState();
    s.done.py1 = 'x'; s.quiz.pyq1 = true; s.beaten.py = true; s.sparks.py = 4;
    expect(totalXp(s)).toBe(25 + QUIZ_XP + BOSS_GAME_XP + 4 * SPARK_XP);
  });
  it('maps XP to levels', () => {
    expect(levelFor(0)).toBe(0);
    expect(levelFor(100)).toBe(1);
    expect(levelFor(99999)).toBe(11);
  });
  it('opens a zone after the previous boss is beaten', () => {
    const s = freshState();
    expect(isUnlocked(s, 'cloud', 0)).toBe(true);
    expect(isUnlocked(s, 'cloud', 1)).toBe(false);
    s.beaten.py = true;
    expect(isUnlocked(s, 'cloud', 1)).toBe(true);
  });
  it('counts a streak of days', () => {
    const s = freshState();
    bumpStreak(s, new Date(2026, 0, 1));
    bumpStreak(s, new Date(2026, 0, 2));
    bumpStreak(s, new Date(2026, 0, 2));
    expect(s.streak).toBe(2);
    expect(liveStreak(s, new Date(2026, 0, 5))).toBe(0);
    bumpStreak(s, new Date(2026, 0, 5));
    expect(s.streak).toBe(1);
    expect(s.best).toBe(2);
  });
});

describe('layout', () => {
  it('places one mentor per quest and one door per quiz question, in order', () => {
    for (const z of Object.values(ZONES)) {
      const L = buildLayout(z);
      expect(L.npcs).toHaveLength(z.quests.length);
      expect(L.gates).toHaveLength(z.quiz.length);
      const xs = [...L.npcs.map((n) => n.x), ...L.gates.map((g) => g.x), L.boss.x, L.flag.x];
      expect(new Set(xs).size).toBe(xs.length);
      expect(L.boss.x).toBeGreaterThan(Math.max(...L.gates.map((g) => g.x)));
      expect(L.flag.x).toBeGreaterThan(L.boss.x);
      expect(L.width).toBeGreaterThan(L.flag.x);
    }
  });
  it('spreads quiz doors across the level', () => {
    expect(gateAfter(5, 3)).toEqual([1, 2, 4]);
    expect(gateAfter(4, 3)).toEqual([0, 2, 3]);
  });
});
