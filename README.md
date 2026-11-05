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
