// The Claude coach chat. Answers are read aloud, and you can talk instead of type.
import { h, panel, readable, listenButton } from './ui.js';
import { canSpeak } from './speech.js';

export const COACH_URL = (import.meta.env.VITE_COACH_URL || '').replace(/\/$/, '');
const HISTORY_KEY = 'career-creator-coach';
const CODE_KEY = 'career-creator-coach-code';

let history = [];
try { history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { history = []; }
const saveHistory = () => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-30))); } catch { /* ignore */ } };

export function getCode() { try { return localStorage.getItem(CODE_KEY) || ''; } catch { return ''; } }
export function setCode(v) { try { localStorage.setItem(CODE_KEY, v.trim()); } catch { /* ignore */ } }

const Recognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

/** Split a reply into readable blocks: paragraphs, list lines, and code. */
function replyParts(text) {
  const parts = [];
  String(text).split('```').forEach((chunk, i) => {
    if (i % 2) { parts.push({ tag: 'pre', text: chunk.replace(/^[a-zA-Z0-9_+-]*\n/, '').replace(/\n$/, ''), cls: 'code' }); return; }
    for (const line of chunk.split('\n')) {
      const t = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/^#+\s*/, '').trim();
      if (t) parts.push({ tag: 'p', text: t });
    }
  });
  return parts.length ? parts : [{ tag: 'p', text: '…' }];
}

async function askServer(messages, context) {
  if (!COACH_URL) throw Object.assign(new Error('The coach is not set up yet. The README explains how to turn it on.'), { kind: 'setup' });
  let res;
  try {
    res = await fetch(`${COACH_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context, code: getCode() }),
    });
  } catch {
    throw new Error('Could not reach the coach. Check your internet and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'The coach could not answer just now.'), { kind: data.code });
  return data.reply;
}

/**
 * Open the coach.
 * opts: { context, starter, settings: () => settings, onClose, openSettings }
 */
export function openCoach(opts) {
  const log = h('div', { class: 'chatlog', 'aria-live': 'polite' });
  const field = h('textarea', { id: 'coach-input', class: 'chatinput', rows: '2', placeholder: 'Type or tap the microphone', 'aria-label': 'Your question for the coach' });
  const send = h('button', { class: 'btn primary', type: 'button' }, h('span', { 'aria-hidden': 'true' }, '➤'), ' Send');
  const mic = Recognition ? h('button', { class: 'btn mic', type: 'button', 'aria-label': 'Speak your question' }, h('span', { 'aria-hidden': 'true' }, '🎤'), ' Talk') : null;
  let busy = false;

  const addBubble = (role, text, { read = false, error = false } = {}) => {
    if (role === 'user') {
      log.append(h('div', { class: 'bubble me' }, text));
    } else {
      const r = readable(replyParts(text));
      const listen = listenButton(r);
      listen?.classList.add('small');
      log.append(h('div', { class: `bubble coach ${error ? 'error' : ''}` }, h('div', { class: 'readable' }, r.nodes), listen));
      if (read && listen && opts.settings().autoRead && canSpeak()) setTimeout(() => listen.click(), 100);
    }
    log.scrollTop = log.scrollHeight;
  };

  const chips = h('div', { class: 'chips' });
  const starters = [
    opts.context?.question ? 'Give me a hint for this question' : null,
    opts.context?.quest ? 'Help me start this quest' : null,
    'What should I do next?',
    "I'm stuck. Can you explain it simply?",
  ].filter(Boolean);
  for (const s of starters) {
    const b = h('button', { class: 'btn small', type: 'button' }, s);
    b.addEventListener('click', () => ask(s));
    chips.append(b);
  }

  async function ask(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    send.disabled = true;
    chips.hidden = true;
    field.value = '';
    history.push({ role: 'user', content: text });
    addBubble('user', text);
    const thinking = h('div', { class: 'bubble coach thinking' }, 'Thinking', h('span', { class: 'dots', 'aria-hidden': 'true' }, '…'));
    log.append(thinking);
    log.scrollTop = log.scrollHeight;
    try {
      const reply = await askServer(history.slice(-12), opts.context);
      thinking.remove();
      history.push({ role: 'assistant', content: reply });
      saveHistory();
      addBubble('coach', reply, { read: true });
    } catch (e) {
      thinking.remove();
      history.pop();
      field.value = text;
      addBubble('coach', e.message, { error: true });
      if (e.kind === 'access' && opts.openSettings) {
        const b = h('button', { class: 'btn small', type: 'button' }, 'Open settings');
        b.addEventListener('click', () => { p.close(); opts.openSettings(); });
        log.append(b);
      }
    } finally {
      busy = false;
      send.disabled = false;
      field.focus({ preventScroll: true });
    }
  }

  send.addEventListener('click', () => ask(field.value));
  field.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(field.value); }
  });

  if (mic) {
    let rec = null;
    mic.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new Recognition();
      rec.lang = 'en-US';
      rec.interimResults = true;
      mic.classList.add('on');
      mic.lastChild.textContent = ' Listening… tap to stop';
      rec.onresult = (e) => { field.value = Array.from(e.results).map((r) => r[0].transcript).join(''); };
      rec.onend = () => {
        mic.classList.remove('on');
        mic.lastChild.textContent = ' Talk';
        rec = null;
        if (field.value.trim()) ask(field.value);
      };
      rec.onerror = () => { field.placeholder = 'I could not hear that. Try again or type.'; };
      rec.start();
    });
  }

  for (const m of history.slice(-6)) addBubble(m.role === 'user' ? 'user' : 'coach', m.content);

  const clear = h('button', { class: 'btn small ghost', type: 'button' }, 'Start a new chat');
  clear.addEventListener('click', () => { history = []; saveHistory(); log.replaceChildren(); chips.hidden = false; });

  const p = panel({
    icon: '🧑‍🏫', kicker: 'Claude coach', title: 'Ask the coach', wide: true, kind: 'coachcard', autoRead: false,
    body: [opts.context?.question ? 'I can give you a hint. I will not just tell you the answer.' : 'Ask about a quest, a word, or what to do next.'],
    extra: h('div', { class: 'chat' }, log, chips, h('div', { class: 'composer' }, field, h('div', { class: 'row' }, mic, send)), history.length ? clear : null),
    actions: [{ label: 'Back', kind: 'ghost', onClick: ({ close }) => close() }],
    onClose: opts.onClose,
  });
  if (opts.starter) ask(opts.starter);
  else setTimeout(() => field.focus({ preventScroll: true }), 50);
  return p;
}
