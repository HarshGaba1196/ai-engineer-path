# AI Career Paths

Gamified learning paths for moving into AI from your current role:

| From | To |
|---|---|
| Backend engineer | AI engineer |
| Frontend engineer | AI product engineer |
| Full-stack developer | AI engineer |
| DevOps / SRE engineer | LLMOps engineer |
| QA / test engineer | AI evals engineer |
| Data analyst | Data scientist |
| Data engineer | ML engineer |
| Data scientist | LLM engineer |
| UX / UI designer | AI UX designer |
| Security engineer | AI security engineer |
| Mobile developer | On-device AI engineer |
| Business analyst | AI solutions consultant |
| Product manager | AI product manager |
| Project manager / Scrum master | AI program lead |
| Technical writer | AI knowledge designer |
| Database administrator | AI database engineer |
| IT support / sysadmin | AI automation engineer |
| Scrum master / agile coach | AI automation engineer |
| Student / career switcher | Junior AI engineer |
| Customer support | AI support operations specialist |
| Marketing | AI marketing specialist |
| Sales | AI sales specialist |
| HR / recruiter | AI talent partner |
| Teacher / trainer | AI educator |
| Finance / accounting | AI finance analyst |
| Legal / compliance | AI governance specialist |
| Manager / team lead | AI-ready leader |
| Any non-technical role | AI-powered professional |

- 56 modules shared between paths; each path keeps its own progress, XP and badges
- 336 short lessons with examples and 10-minute exercises
- Phase quizzes, build projects, a daily challenge and a boss battle
- XP, ranks, day streaks, a daily XP goal, an activity heatmap and badges
- Search across roles, skills, tools and lesson topics

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
| `src/modules5.js` | Modules and lessons for the data scientist, project manager and technical writer paths |
| `src/modules6.js` | Modules and lessons for DBA, IT, support, marketing, sales, HR and teacher paths |
| `src/modules7.js` | Modules and lessons for finance, legal, team lead and student paths |
| `src/modules8.js` | Automating agile workflows (Scrum master path) |
| `src/tracks.js` | Career paths: which modules each uses, plus role-specific bridges and builds |
| `src/paths.js` | Home page, path cards, path finder and detail page |
| `src/home.js` | Streak and goals panel, path search, role showcase |
| `src/game.js` | XP, ranks, streaks, badges, daily challenge |
| `src/dash.js` | Dashboard |
| `src/app.js` | Routing, lessons, quizzes, storage |
| `src/head.html` | Styles and page shell |

After editing, run `./build.sh` to regenerate `index.html`, then commit and push.

## Deploy

GitHub Pages: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
