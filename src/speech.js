// Read-aloud using the browser's built-in voices. Highlights each word as it is spoken.
let voice = null;
let token = 0;

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function pickVoice() {
  if (!canSpeak()) return null;
  const vs = speechSynthesis.getVoices().filter((v) => v.lang?.startsWith('en'));
  // Prefer natural-sounding voices when the device has them.
  return vs.find((v) => /natural|neural|enhanced|premium/i.test(v.name))
    || vs.find((v) => /google us english|samantha|aria|jenny/i.test(v.name))
    || vs.find((v) => v.lang === 'en-US') || vs[0] || null;
}
if (canSpeak()) {
  voice = pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', () => { voice = pickVoice(); });
}

/**
 * Speak text. onWord(charIndex) fires as each word starts; onEnd fires when finished or stopped.
 */
export function speak(text, { rate = 0.9, onWord, onEnd } = {}) {
  if (!canSpeak() || !text) { onEnd?.(); return; }
  stop();
  const my = ++token;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.lang = 'en-US';
  if (voice) u.voice = voice;
  u.onboundary = (e) => { if (my === token && (e.name === 'word' || !e.name)) onWord?.(e.charIndex); };
  u.onend = u.onerror = () => { if (my === token) onEnd?.(); };
  speechSynthesis.speak(u);
}

export function stop() {
  token++;
  if (canSpeak()) speechSynthesis.cancel();
}
