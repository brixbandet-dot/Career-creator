// Text panels drawn as normal web page elements, so fonts, spacing and read-aloud all work well.
import { speak, stop, canSpeak } from './speech.js';
import { input, releaseAll } from './input.js';

let settingsRef = () => ({ autoRead: true, rate: 0.9 });
export function useSettings(fn) { settingsRef = fn; }

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return el;
}

/**
 * A group of text blocks that can be read aloud as one, with word highlighting.
 * parts: [{tag:'h2'|'p', text}]
 */
export function readable(parts) {
  const spans = [];
  let full = '';
  const nodes = parts.map(({ tag = 'p', text, cls }) => {
    const el = h(tag, { class: cls });
    const words = String(text).split(/(\s+)/);
    for (const w of words) {
      if (!w) continue;
      if (/^\s+$/.test(w)) { el.append(document.createTextNode(w)); full += w; continue; }
      const s = h('span', { class: 'w' }, w);
      spans.push({ start: full.length, end: full.length + w.length, el: s });
      el.append(s);
      full += w;
    }
    full += '. ';
    return el;
  });
  let current = null;
  const mark = (ci) => {
    const hit = spans.find((s) => ci >= s.start && ci < s.end) || spans.find((s) => s.start >= ci);
    if (current) current.classList.remove('reading');
    current = hit?.el || null;
    current?.classList.add('reading');
  };
  const clear = () => { current?.classList.remove('reading'); current = null; };
  return {
    nodes,
    text: full.replace(/\.\s*\.\s/g, '. '),
    play(onEnd) { speak(full, { rate: settingsRef().rate, onWord: mark, onEnd: () => { clear(); onEnd?.(); } }); },
    clear,
  };
}

export function listenButton(r, label = 'Listen') {
  if (!canSpeak()) return null;
  const b = h('button', { class: 'btn listen', type: 'button', 'aria-label': `${label}: read this out loud` }, h('span', { 'aria-hidden': 'true' }, '🔊'), ' ', label);
  b.addEventListener('click', () => {
    if (b.classList.contains('on')) { stop(); r.clear(); b.classList.remove('on'); return; }
    b.classList.add('on');
    r.play(() => b.classList.remove('on'));
  });
  return b;
}

const layer = () => document.getElementById('layer');
let openCount = 0;

/**
 * Show a panel over the game.
 * opts: { icon, kicker, title, body: string[], extra: Node, actions: [{label, icon, kind, onClick, href}], onClose, wide }
 * Returns { close, root, read }.
 */
export function panel(opts) {
  const parts = [{ tag: 'h2', text: opts.title }, ...(opts.body || []).map((t) => ({ tag: 'p', text: t }))];
  const r = readable(parts);
  const listen = listenButton(r);
  const actions = h('div', { class: 'actions' });
  const root = h('div', { class: 'scrim', role: 'dialog', 'aria-modal': 'true', 'aria-label': opts.title },
    h('div', { class: `card ${opts.wide ? 'wide' : ''} ${opts.kind || ''}` },
      h('div', { class: 'cardtop' },
        opts.icon ? h('div', { class: 'bigicon', 'aria-hidden': 'true' }, opts.icon) : null,
        opts.kicker ? h('div', { class: 'kicker' }, opts.kicker) : null),
      h('div', { class: 'readable' }, r.nodes),
      opts.extra || null,
      listen ? h('div', { class: 'listenrow' }, listen) : null,
      actions));

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    stop();
    root.remove();
    openCount = Math.max(0, openCount - 1);
    if (!openCount) { input.blocked = false; document.getElementById('game')?.focus({ preventScroll: true }); }
    opts.onClose?.();
  };
  for (const a of opts.actions || []) {
    const btn = a.href
      ? h('a', { class: `btn ${a.kind || ''}`, href: a.href, target: '_blank', rel: 'noopener' }, a.icon ? h('span', { 'aria-hidden': 'true' }, a.icon) : null, a.icon ? ' ' : '', a.label)
      : h('button', { class: `btn ${a.kind || ''}`, type: 'button' }, a.icon ? h('span', { 'aria-hidden': 'true' }, a.icon) : null, a.icon ? ' ' : '', a.label);
    if (!a.href) btn.addEventListener('click', () => a.onClick?.({ close, btn }));
    actions.append(btn);
  }
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && opts.escape !== false) close(); });

  input.blocked = true;
  releaseAll();
  openCount++;
  layer().append(root);
  (actions.querySelector('.primary') || actions.querySelector('button,a'))?.focus({ preventScroll: true });
  if (settingsRef().autoRead && canSpeak() && listen) setTimeout(() => { if (!closed) listen.click(); }, 250);
  return { close, root, read: r };
}

let toastTimer;
export function toast(msg, big = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${big ? 'big' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = `toast ${big ? 'big' : ''}`; }, big ? 3000 : 1600);
}
