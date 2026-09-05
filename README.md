# NEON RPS

A futuristic Rock Paper Scissors webapp built with Next.js. Two modes: Player vs Computer and online Player vs Player. Players pick a themed arena, select their move, and press GO. Each theme reskins rock, paper, and scissors with its own emoji, labels, and neon color palette.

## Modes

- **Player vs Computer** — select a move, press GO, and the CPU reveals its choice.
- **Online: Player vs Player** — create a room to get a 4-character code, or join with a code. Both players pick a move and press GO; moves stay hidden until both have locked in, then the result is revealed. State syncs via short-polling against a serverless API.

## Themes

Military · Halloween · Asian · Tribal · Jungle · Party · Disco

Each theme maps the three classic moves to themed icons (for example, Halloween uses Pumpkin / Ghost / Bat) while keeping standard RPS rules.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this folder to a Git repository (GitHub/GitLab/Bitbucket).
2. Import the repo at https://vercel.com/new — Vercel auto-detects Next.js, no config needed.
3. Deploy.

Or from the CLI:

```bash
npm i -g vercel
vercel
```

## Structure

- `app/page.tsx` — mode router (menu / PvC / online)
- `components/Menu.tsx` — mode selection screen
- `components/PvCGame.tsx` — Player vs Computer game
- `components/OnlineGame.tsx` — online PvP lobby + game with polling
- `components/ThemePicker.tsx` — shared theme selector
- `app/api/room/route.ts` — serverless API for online rooms
- `lib/rooms.ts` — in-memory room store and match logic
- `lib/themes.ts` — theme definitions, RPS rules, and the judge function
- `app/globals.css` — futuristic neon styling and animations

## Note on online mode and Vercel

Room state is held in memory on the serverless instance. This works for a live match, but Vercel serverless functions are stateless and can cold-start or scale to multiple instances, so rooms are not guaranteed to persist across those events. For production-grade durability, back the room store with a shared store such as Vercel KV / Upstash Redis (swap the `Map` in `lib/rooms.ts`).
