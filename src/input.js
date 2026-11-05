// Keyboard and touch controls, shared by the game. Ignored while a text panel is open.
export const input = { left: false, right: false, jumpQueued: false, jumpHeld: false, talkQueued: false, blocked: false };

const LEFT = ['ArrowLeft', 'KeyA'];
const RIGHT = ['ArrowRight', 'KeyD'];
const JUMP = ['Space', 'ArrowUp', 'KeyW'];
const TALK = ['KeyE', 'Enter', 'ArrowDown', 'KeyS'];

function key(e, down) {
  if (input.blocked) return;
  const tag = e.target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const c = e.code;
  let used = true;
  if (LEFT.includes(c)) input.left = down;
  else if (RIGHT.includes(c)) input.right = down;
  else if (JUMP.includes(c)) { if (down && !e.repeat) input.jumpQueued = true; input.jumpHeld = down; }
  else if (TALK.includes(c)) { if (down && !e.repeat && tag !== 'BUTTON') input.talkQueued = true; else used = tag !== 'BUTTON'; }
  else used = false;
  if (used) e.preventDefault();
}

export function initInput() {
  window.addEventListener('keydown', (e) => key(e, true));
  window.addEventListener('keyup', (e) => key(e, false));
  window.addEventListener('blur', releaseAll);
}

export function releaseAll() {
  input.left = input.right = input.jumpHeld = false;
  input.jumpQueued = input.talkQueued = false;
}

/** Wire an on-screen button to a control. */
export function bindTouch(el, control) {
  const on = (e) => {
    e.preventDefault();
    if (input.blocked) return;
    el.classList.add('down');
    if (control === 'left') input.left = true;
    if (control === 'right') input.right = true;
    if (control === 'jump') { input.jumpQueued = true; input.jumpHeld = true; }
    if (control === 'talk') input.talkQueued = true;
  };
  const off = (e) => {
    e.preventDefault();
    el.classList.remove('down');
    if (control === 'left') input.left = false;
    if (control === 'right') input.right = false;
    if (control === 'jump') input.jumpHeld = false;
  };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointercancel', off);
  el.addEventListener('pointerleave', off);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}
