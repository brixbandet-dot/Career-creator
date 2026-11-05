// The Claude coach for Career Creator.
// A tiny Cloudflare Worker that keeps your Anthropic API key secret and talks to Claude for the game.
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-opus-5-5';
const MAX_TURNS = 12; // only the latest messages are sent, to keep each answer cheap
const MAX_CHARS = 1500; // per message from the player

export const SYSTEM = `You are the coach inside Career Creator, a side-scrolling game that teaches a tech career (AI Engineer or Cloud Engineer) to beginners with no tech experience. Many players have dyslexia.

How to write:
- Use short sentences and common words. One idea per sentence.
- Keep answers under about 80 words unless the player asks for more.
- Give one step at a time. Use a short numbered list only for real steps.
- No tables, no headings, no italics, no long code. If code helps, show at most 5 lines in a fenced code block.
- Explain any tech word the first time you use it, in a few plain words.
- Be warm and encouraging, but not over the top.

What to do:
- Help with real-life quests: what the task means, how to start, and how to get unstuck.
- For quiz doors and boss questions, give a hint that helps the player think. Do not give the answer letter or the answer itself, even if asked. If they are stuck after two hints, explain the idea so the answer becomes clear.
- Prefer free resources. Be honest about hype, like expensive bootcamps or "six figures with no experience" ads.
- If a question is not about learning tech or careers, answer briefly and steer back to the game.`;

const cors = (origin, env) => {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ok = !allowed.length || allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin || '*' : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
};

const json = (body, status, headers) => new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });

/** Turn the game's state into a short note for Claude. */
export function contextNote(ctx = {}) {
  const lines = [];
  const s = (v, n = 200) => String(v ?? '').slice(0, n);
  if (ctx.track) lines.push(`Career path: ${s(ctx.track, 40)}.`);
  if (ctx.level) lines.push(`Player level: ${s(ctx.level, 60)}.`);
  if (ctx.zone) lines.push(`Current level in the game: ${s(ctx.zone, 80)}.`);
  if (ctx.quest) lines.push(`They are looking at this real-life quest: ${s(ctx.quest, 300)}.`);
  if (ctx.question) lines.push(`They are looking at this quiz question (give hints only): ${s(ctx.question, 400)}.`);
  if (Array.isArray(ctx.done) && ctx.done.length) lines.push(`Quests they finished: ${ctx.done.slice(-10).map((d) => s(d, 80)).join('; ')}.`);
  return lines.join('\n');
}

/** Keep only well-formed, recent, size-limited messages that start with the player. */
export function cleanMessages(raw) {
  if (!Array.isArray(raw)) return [];
  let msgs = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, m.role === 'user' ? MAX_CHARS : 4000) }))
    .slice(-MAX_TURNS);
  while (msgs.length && msgs[0].role !== 'user') msgs = msgs.slice(1);
  return msgs;
}

export async function handle(request, env, client) {
  const origin = request.headers.get('Origin') || '';
  const headers = cors(origin, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  const url = new URL(request.url);
  if (request.method === 'GET' && url.pathname === '/') return json({ ok: true, coach: 'Career Creator' }, 200, headers);
  if (request.method !== 'POST' || url.pathname !== '/chat') return json({ error: 'Not found' }, 404, headers);

  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(origin)) return json({ error: 'This coach only works inside Career Creator.' }, 403, headers);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad request.' }, 400, headers); }

  if (env.ACCESS_CODE && body.code !== env.ACCESS_CODE) {
    return json({ error: 'The coach code is missing or wrong. Add it in Reading settings.', code: 'access' }, 401, headers);
  }

  const messages = cleanMessages(body.messages);
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'Ask the coach a question first.' }, 400, headers);

  const note = contextNote(body.context);
  const ai = client || new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  try {
    const response = await ai.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      // Chat answers are short; low effort keeps them quick and cheap.
      output_config: { effort: 'low' },
      // If Claude declines a request, retry it on Anthropic's recommended fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: note ? `${SYSTEM}\n\nWhat the game knows right now:\n${note}` : SYSTEM,
      messages,
    });
    if (response.stop_reason === 'refusal') {
      return json({ reply: "I can't help with that one. Let's get back to your quest. What are you working on?" }, 200, headers);
    }
    const reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    return json({ reply: reply || "Sorry, I didn't catch that. Can you ask again?" }, 200, headers);
  } catch (err) {
    const status = err?.status;
    if (status === 429) return json({ error: 'The coach is busy. Wait a minute and try again.' }, 429, headers);
    if (status === 401 || status === 403) return json({ error: 'The coach is not set up correctly (API key).' }, 500, headers);
    return json({ error: 'The coach could not answer just now. Try again soon.' }, 502, headers);
  }
}

export default {
  fetch: (request, env) => handle(request, env),
};
