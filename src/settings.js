// Reading settings. Applied to the page as data attributes and CSS variables.
const KEY = 'career-creator-settings';

export const FONTS = {
  lexend: { label: 'Lexend', css: "'Lexend', system-ui, sans-serif" },
  opendyslexic: { label: 'OpenDyslexic', css: "'OpenDyslexic', 'Lexend', system-ui, sans-serif" },
  atkinson: { label: 'Atkinson', css: "'Atkinson Hyperlegible', system-ui, sans-serif" },
};
export const SIZES = { m: { label: 'Medium', px: 20 }, l: { label: 'Large', px: 24 }, xl: { label: 'Extra large', px: 28 } };
export const SPACING = {
  normal: { label: 'Normal', letter: '0.02em', word: '0.08em', line: 1.6 },
  wide: { label: 'Wide', letter: '0.06em', word: '0.2em', line: 1.8 },
  wider: { label: 'Extra wide', letter: '0.1em', word: '0.3em', line: 2.0 },
};
export const TINTS = {
  cream: { label: 'Cream', bg: '#fbf5e6', panel: '#fffaf0', ink: '#2a2620', soft: '#6b6355', line: '#e2d7bd' },
  blue: { label: 'Blue', bg: '#e4ecf7', panel: '#f1f5fb', ink: '#1f2733', soft: '#56627a', line: '#c4d1e4' },
  green: { label: 'Green', bg: '#e5f1e3', panel: '#f2f8f0', ink: '#1f2a1f', soft: '#566b55', line: '#c5dbc1' },
  peach: { label: 'Peach', bg: '#fbe9dc', panel: '#fdf3ec', ink: '#2c231e', soft: '#76604f', line: '#ebcfba' },
  dark: { label: 'Dark', bg: '#1d2127', panel: '#262b33', ink: '#ece8df', soft: '#a7a294', line: '#3b424d' },
};

export function defaults() {
  const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  return { font: 'lexend', size: 'l', spacing: 'wide', tint: 'cream', autoRead: true, rate: 0.9, sfx: true, reduceMotion: reduce };
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaults();
}

export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function applySettings(s) {
  const r = document.documentElement.style;
  const t = TINTS[s.tint] || TINTS.cream;
  const sp = SPACING[s.spacing] || SPACING.wide;
  r.setProperty('--font', (FONTS[s.font] || FONTS.lexend).css);
  r.setProperty('--size', `${(SIZES[s.size] || SIZES.l).px}px`);
  r.setProperty('--letter', sp.letter);
  r.setProperty('--word', sp.word);
  r.setProperty('--line-h', String(sp.line));
  r.setProperty('--bg', t.bg);
  r.setProperty('--panel', t.panel);
  r.setProperty('--ink', t.ink);
  r.setProperty('--soft', t.soft);
  r.setProperty('--line', t.line);
  document.documentElement.dataset.tint = s.tint;
  document.documentElement.dataset.motion = s.reduceMotion ? 'reduce' : 'full';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg);
}
