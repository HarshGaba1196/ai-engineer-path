# AI Career Paths

Gamified learning paths for moving into AI from your current role:

| From | To |
|---|---|
| Backend engineer | AI engineer |
| Frontend engineer | AI product engineer |
| DevOps / SRE engineer | LLMOps engineer |
| QA / test engineer | AI evals engineer |
| Data analyst | Data scientist |
| Data engineer | ML engineer |
| UX / UI designer | AI UX designer |
| Security engineer | AI security engineer |
| Mobile developer | On-device AI engineer |
| Business analyst | AI solutions consultant |
| Product manager | AI product manager |
| Any non-technical role | AI-powered professional |

- 38 modules shared between paths; each path keeps its own progress, XP and badges
- 228 short lessons with examples and 10-minute exercises
- Phase quizzes, build projects, a daily challenge and a boss battle
- XP, ranks, day streaks and badges

It's a single static page with no backend. Progress is saved in your browser (localStorage), so each person and each browser has its own progress.

## Run locally

Open `index.html` in a browser.

## Edit content

| File | What it holds |
|---|---|
| `src/phases.js` | Original 10 modules: concepts, resources, build tasks and quiz questions |
| `src/lessons.js` | Lessons for those modules |
| `src/modules2.js` | Modules and lessons for the first batch of extra paths |
| `src/modules3.js` | Modules and lessons for the data analyst, data engineer and UX paths |
| `src/modules4.js` | Modules and lessons for the security, mobile and business analyst paths |
| `src/tracks.js` | Career paths: which modules each uses, plus role-specific bridges and builds |
| `src/paths.js` | Path picker |
| `src/game.js` | XP, ranks, streaks, badges, daily challenge |
| `src/dash.js` | Dashboard |
| `src/app.js` | Routing, lessons, quizzes, storage |
| `src/head.html` | Styles and page shell |

After editing, run `./build.sh` to regenerate `index.html`, then commit and push.

## Deploy

GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
