# Job Hunt Tracker

> Personal application tracker built to organize my own job search.
> React 18 · TypeScript · Redux Toolkit · Vite

## Why

Trello and spreadsheets weren't capturing tech-stack details, salary ranges, and interview history in one structured place. Built this to fix that.

## Features

- Kanban board with drag & drop between stages
- List view with search, filters, URL state sync
- Stats: response rate, conversion per stage, applications per week
- Dark / light mode
- Export / import JSON
- Keyboard accessible

## Tech stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Build    | Vite                                 |
| Language | TypeScript (strict)                  |
| UI       | React 18                             |
| State    | Redux Toolkit + redux-persist        |
| Forms    | React Hook Form + Zod                |
| Styles   | TailwindCSS + CSS variables          |
| DnD      | @dnd-kit                             |
| Charts   | Recharts                             |
| Routing  | React Router v6                      |
| Tests    | Vitest + React Testing Library + MSW |

## Local development

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm test       # watch mode
pnpm test:run   # single run
pnpm coverage   # coverage report
pnpm lint       # ESLint
pnpm build      # production build
```

## Architecture decisions

- **Redux Toolkit over Zustand** — RTK is the most common production choice; wanted to demonstrate that pattern
- **Feature-based over FSD** — FSD adds overhead for a project this size; would migrate at 50+ features
- **@dnd-kit over react-beautiful-dnd** — rbd was archived by Atlassian in 2024
- **Vitest over Jest** — native ESM + Vite config, 2–4× faster, compatible API

## What I'd add next

- Real backend (Supabase) + auth
- Cross-device sync
- LinkedIn API import
- Web Push follow-up reminders
