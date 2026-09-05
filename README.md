# NEON RPS

A futuristic Rock Paper Scissors webapp built with Next.js. Players pick a themed arena and battle the CPU. Each theme reskins rock, paper, and scissors with its own emoji, labels, and neon color palette.

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

- `app/page.tsx` — game UI and logic (client component)
- `app/globals.css` — futuristic neon styling and animations
- `lib/themes.ts` — theme definitions, RPS rules, and the judge function
