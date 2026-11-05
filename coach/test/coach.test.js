import { describe, it, expect } from 'vitest';
import { handle, cleanMessages, contextNote, MODEL } from '../src/index.js';

const ORIGIN = 'https://example.github.io';
const env = { ALLOWED_ORIGINS: ORIGIN, ACCESS_CODE: 'secret', ANTHROPIC_API_KEY: 'test' };

function fakeClient(response) {
  const calls = [];
  return {
    calls,
    beta: { messages: { create: async (params) => { calls.push(params); if (response instanceof Error) throw response; return response; } } },
  };
}
const req = (body, origin = ORIGIN, method = 'POST', path = '/chat') =>
  new Request(`https://coach.test${path}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

describe('coach worker', () => {
  it('answers with the text from Claude and sends the game context', async () => {
    const client = fakeClient({ stop_reason: 'end_turn', content: [{ type: 'text', text: 'Start with lecture 0.' }] });
    const res = await handle(req({ code: 'secret', messages: [{ role: 'user', content: 'Help!' }], context: { zone: 'Python Island', quest: 'Install Python' } }), env, client);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ reply: 'Start with lecture 0.' });
    const p = client.calls[0];
    expect(p.model).toBe(MODEL);
    expect(p.fallbacks).toBe('default');
    expect(p.betas).toContain('server-side-fallback-2026-07-01');
    expect(p.system).toContain('Install Python');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
  });

  it('rejects other websites and wrong codes', async () => {
    const client = fakeClient({ stop_reason: 'end_turn', content: [] });
    expect((await handle(req({ code: 'secret', messages: [{ role: 'user', content: 'hi' }] }, 'https://evil.example'), env, client)).status).toBe(403);
    expect((await handle(req({ code: 'nope', messages: [{ role: 'user', content: 'hi' }] }), env, client)).status).toBe(401);
    expect(client.calls).toHaveLength(0);
  });

  it('handles refusals and API errors kindly', async () => {
    const refused = await handle(req({ code: 'secret', messages: [{ role: 'user', content: 'x' }] }), env, fakeClient({ stop_reason: 'refusal', content: [] }));
    expect((await refused.json()).reply).toMatch(/get back to your quest/);
    const err = Object.assign(new Error('rate'), { status: 429 });
    const busy = await handle(req({ code: 'secret', messages: [{ role: 'user', content: 'x' }] }), env, fakeClient(err));
    expect(busy.status).toBe(429);
  });

  it('answers CORS preflight', async () => {
    const res = await handle(req(null, ORIGIN, 'OPTIONS'), env);
    expect(res.status).toBe(204);
  });
});

describe('helpers', () => {
  it('trims history, drops bad entries and starts with the player', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
    const out = cleanMessages([{ role: 'system', content: 'ignore me' }, ...many, { role: 'user', content: 'x'.repeat(5000) }]);
    expect(out.length).toBeLessThanOrEqual(12);
    expect(out[0].role).toBe('user');
    expect(out.at(-1).content.length).toBe(1500);
    expect(out.some((m) => m.role === 'system')).toBe(false);
  });
  it('builds a short context note', () => {
    expect(contextNote({ track: 'Cloud Engineer', question: 'What does DNS do?' })).toContain('hints only');
    expect(contextNote()).toBe('');
  });
});
