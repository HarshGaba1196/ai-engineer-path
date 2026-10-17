# Backend to AI Engineer

A gamified learning path for backend engineers (Java, Spring Boot, microservices) who want to become AI engineers.

- 10 phases, from Python and math through LLM APIs, RAG, agents, evals and production
- 60 short lessons with code examples and 10-minute exercises
- Phase quizzes, build projects, a daily challenge and a boss battle
- XP, ranks, day streaks and badges

It's a single static page with no backend. Progress is saved in your browser (localStorage), so each person and each browser has its own progress.

## Run locally

Open `index.html` in a browser.

## Edit content

| File | What it holds |
|---|---|
| `src/phases.js` | Phases, concepts, resources, build tasks and quiz questions |
| `src/lessons.js` | Lesson text, code examples and exercises |
| `src/game.js` | XP, ranks, streaks, badges, daily challenge |
| `src/dash.js` | Dashboard |
| `src/app.js` | Routing, lessons, quizzes, storage |
| `src/head.html` | Styles and page shell |

After editing, run `./build.sh` to regenerate `index.html`, then commit and push.

## Deploy

GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
