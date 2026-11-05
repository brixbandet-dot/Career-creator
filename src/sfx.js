// Tiny sound effects made in code, so there are no audio files to load.
let ctx = null;
let enabled = true;

export function setSfx(on) { enabled = on; }

function tone(freq, dur, type = 'square', vol = 0.06, slide = 0) {
  if (!enabled) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch { /* no audio available */ }
}

export const sfx = {
  jump: () => tone(380, 0.12, 'square', 0.04, 1.8),
  spark: () => { tone(880, 0.08, 'triangle', 0.06); setTimeout(() => tone(1320, 0.1, 'triangle', 0.05), 60); },
  stomp: () => tone(220, 0.15, 'square', 0.06, 0.5),
  bump: () => tone(140, 0.18, 'sawtooth', 0.04, 0.7),
  right: () => { tone(660, 0.1, 'triangle', 0.07); setTimeout(() => tone(990, 0.16, 'triangle', 0.07), 90); },
  wrong: () => tone(260, 0.2, 'triangle', 0.05, 0.8),
  hit: () => tone(160, 0.25, 'sawtooth', 0.07, 0.4),
  win: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, 'triangle', 0.07), i * 120)),
};
