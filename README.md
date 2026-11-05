# Career Creator

A side-scrolling game that teaches you a tech career, one level at a time.
It is built for players with dyslexia: every word can be read out loud, and nothing is timed.

## How it plays

- Pick a path: **AI Engineer** or **Cloud Engineer**. The first two levels count for both.
- Each level is a zone of the career, like Python Island or Cloud Gate.
- **Robot mentors** give you real-life quests, like "Install Python". Do them for real, then tap "I did it" for XP.
- **Purple doors** ask one quiz question. Answer it to open the door. You can try as many times as you like.
- **The boss** at the end loses a heart for each right answer. Beat it to open the next level.
- Collect **sparks** for bonus XP. Jump on bugs, or just walk around them. You can't fall or lose progress.

Controls: arrow keys or A/D to walk, Space to jump, E to talk. On a phone, use the on-screen buttons.

## Reading support

- Read aloud: every panel, quest, question and answer, with each word highlighted as it is spoken.
- Fonts: Lexend, OpenDyslexic or Atkinson Hyperlegible.
- Text size, letter and word spacing, and line spacing.
- Soft background colours (cream, blue, green, peach, dark) instead of bright white.
- Short sentences, big buttons, icons next to words.
- No timers. Less movement and sound effects can be switched off.

Settings are under the ⚙️ button.

## Run it on your computer

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev      # open the address it prints
npm test         # logic tests
npm run build    # makes the finished game in dist/
```

## Put it online (free)

This repo has a workflow that publishes the game to GitHub Pages when `main` changes.
Turn it on once: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The game then appears at `https://<your-username>.github.io/Career-creator/`.
On a phone, open that link and choose "Add to Home Screen" to use it like an app.

## Turn on the Claude coach

The coach answers questions inside the game: what a quest means, how to start, or a hint for a quiz
(it gives hints, not answers). Its replies can be read aloud, and you can talk instead of typing
(in browsers that support it, such as Chrome and Safari).

The coach runs on a small free server (a Cloudflare Worker in `coach/`) so your Anthropic API key is
never inside the game, where anyone could copy it. One-time setup:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com). Set a monthly spend limit there.
2. Make a free [Cloudflare](https://dash.cloudflare.com/sign-up) account.
3. On your computer, in the `coach` folder:
   ```bash
   npm install
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY   # paste your key when asked
   npx wrangler secret put ACCESS_CODE         # optional: a code only you (and friends) know
   npx wrangler deploy                          # prints your coach address, ending in .workers.dev
   ```
4. In GitHub: **Settings → Secrets and variables → Actions → Variables → New variable**.
   Name it `COACH_URL` and paste the address from step 3. Then re-run the **Publish game** workflow.
5. If you set an access code, open the game's ⚙️ Reading settings and type it under **Coach code**.

Cost: each answer uses Claude Opus 5.5 at low effort, usually around a cent or two. The server only
sends the last 12 messages and caps message length, and it only accepts requests from the game's own
website (`ALLOWED_ORIGINS` in `coach/wrangler.toml`). The access code stops strangers from using your key.

To try it locally: run `npx wrangler dev` in `coach/` (put `ANTHROPIC_API_KEY=...` in `coach/.dev.vars`),
then start the game with `VITE_COACH_URL=http://localhost:8787 npm run dev`.

## Where things are

| File | What it does |
| --- | --- |
| `src/data.js` | All the levels, quests, quiz questions and bosses. Edit this to change the content. |
| `src/game/LevelScene.js` | The side-scrolling game (Phaser). |
| `src/game/textures.js` | The game art, drawn in code. |
| `src/layout.js` | Where mentors, doors, sparks and the boss go in each level. |
| `src/ui.js`, `src/speech.js` | Text panels and read-aloud with word highlighting. |
| `src/settings.js` | Reading settings. |
| `src/progress.js` | XP, levels and saving progress in the browser. |
| `src/coach.js` | The coach chat in the game: read-aloud replies and voice input. |
| `coach/` | The coach server (Cloudflare Worker) that talks to Claude. |
