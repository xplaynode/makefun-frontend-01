# Lucky Frontend — makefun-frontend-01

![Competition](https://img.shields.io/badge/make.fun-makefun--frontend--01-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Runtime](https://img.shields.io/badge/node-22-orange)

A fast, lightweight alternative frontend for [make.fun](https://make.fun), built for the **makefun-frontend-01** bounty: [https://make.fun/bounty/makefun-frontend-01](https://make.fun/bounty/makefun-frontend-01)

## What it is

A static frontend with no build step and no framework. It reads only the make.fun public API (GET requests, CORS open) and renders four surfaces, each reachable by an in-app link and by its own hash URL:

- `#/` — live bounty board: each bounty's live pot, entry fee, time left and entry count, with text search, category filter chips and sorting (ending soon / biggest pot / most entries)
- `#/bounty/<slug>` — bounty page: pot, fee, deadline countdown, submissions, category and skills, full description, rewards breakdown, and links to the leaderboard and the bounty on make.fun
- `#/bounty/<slug>/leaderboard` — leaderboard table with paid places highlighted
- `#/u/<handle>` — public profile with avatar, bio, stats and recent entries

All API shapes are normalized defensively (string, array, object and null variants), so a field whose shape changes never crashes a view. Every surface has loading, error-with-retry and empty states.

## How to run

```sh
node serve.ts --port 8091
```

Then open `http://localhost:8091` in a browser. No install step: Node 22 runs the TypeScript server directly, and the app itself is plain HTML, CSS and ES modules under `app/`.

To hand the entry in (what the grader runs):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` using the kit's vendored `buildDossier` (`vendor/makefun-frontend.ts`, kept byte-identical).

## Design and performance notes

- First load (index.html + style.css + all JS) stays well under 25 KB raw: one small CSS file, vanilla JS only, system font stack, no CDN and no external origins at runtime.
- The API layer (`app/api.js`) keeps an in-memory cache with ETag / If-None-Match revalidation, and concurrent identical requests share a single fetch.
- Accessibility: semantic landmarks (header / nav / main / footer), labelled controls, visible focus styles and keyboard-friendly navigation.
- Responsive: single column under 640 px, card grid above; tap targets at least 40 px; countdowns use tabular numbers so they never shift layout.

## License

MIT — see `LICENSE`.
