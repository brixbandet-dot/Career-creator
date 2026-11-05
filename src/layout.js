// Builds the shape of a level (in tiles) from a zone's content.
// Every zone gets one mentor per real-world quest, a quiz door for each quiz question,
// and a boss at the end. There are no pits, so you can never fall and lose progress.

export const TILE = 48;
export const ROWS = 12;
export const GROUND_ROW = 10;

export function gateAfter(questCount, quizCount) {
  // Spread the quiz doors evenly between the mentors.
  const out = [];
  for (let g = 0; g < quizCount; g++) out.push(Math.min(questCount - 1, Math.round(((g + 1) * questCount) / quizCount) - 1));
  return out;
}

export function buildLayout(zone, seed = 0) {
  const platforms = [];
  const sparks = [];
  const npcs = [];
  const gates = [];
  const enemies = [];
  const gateSpots = gateAfter(zone.quests.length, zone.quiz.length);
  let cx = 6;

  const sparkRow = (x0, n, row) => { for (let k = 0; k < n; k++) sparks.push({ x: x0 + k, y: row }); };

  zone.quests.forEach((_, i) => {
    const kind = (i + seed) % 3;
    if (kind === 0) {
      platforms.push({ x: cx + 2, y: 7, w: 4 });
      sparkRow(cx + 2, 4, 6);
      sparkRow(cx + 8, 2, 9);
    } else if (kind === 1) {
      platforms.push({ x: cx + 1, y: 8, w: 3 });
      platforms.push({ x: cx + 5, y: 6, w: 3 });
      sparkRow(cx + 5, 3, 5);
    } else {
      enemies.push({ x: cx + 5, min: cx + 1, max: cx + 9 });
      sparkRow(cx + 3, 4, 8);
    }
    cx += 11;
    npcs.push({ x: cx, quest: i });
    cx += 4;
    gateSpots.forEach((after, g) => {
      if (after === i) { gates.push({ x: cx, quiz: g }); cx += 4; }
    });
  });

  cx += 4;
  const boss = { x: cx + 8 };
  const flag = { x: cx + 14 };
  const width = cx + 18;
  return { width, platforms, sparks, npcs, gates, enemies, boss, flag, start: { x: 2 } };
}
