# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Job Hunt Tracker — a portfolio React app for tracking job applications through a Kanban board, list view, and stats page. Data lives in localStorage (no backend). Built to demonstrate middle-level React skills.

## Commands

```bash
pnpm dev          # start dev server (http://localhost:5173)
pnpm build        # production build
pnpm lint         # ESLint
pnpm test         # run all tests (Vitest watch mode)
pnpm test:run     # run tests once (no watch)
pnpm test src/features/applications  # run tests for a specific feature
pnpm coverage     # test coverage report
```

Pre-commit hook (Husky + lint-staged) runs lint + test automatically.

## Architecture

Feature-based organization — not FSD (too much overhead for this project size).

```
src/
  app/          # store, router, providers — app-level config only
  pages/        # thin page components that compose features
  features/     # domain units (applications, filters, theme, data-export)
  shared/       # ui primitives, lib utils, constants — no business logic
  test/         # setup, test-utils with providers, MSW mocks, fixtures
```

Dependency direction is strict: `pages → features → shared`. Never reversed, never circular.

### State

- **Redux Toolkit** slices for client state (`applicationsSlice`, `filtersSlice`, `themeSlice`)
- **redux-persist** writes to localStorage — no manual serialization needed
- Selectors use `createSelector` (RTK re-exports it) for memoization
- `selectFilteredApplications` is the key composed selector: applies search + status filters to all applications

### Domain model

Core types live in `src/features/applications/types.ts`:

- `Application` — the main entity; `status` field is always current, `events[]` is the full history
- `ApplicationStatus` — `wishlist | applied | screening | tech_interview | final_interview | offer | rejected | withdrawn`
- `WorkMode` — `onsite | hybrid | remote`
- `ApplicationEvent` — append-only log (`status_change | note | interview_scheduled | email`)
- `FilterState` — `{ search, statuses[], dateFrom?, dateTo?, techStack? }`
- `salary` — `{ min?, max?, currency: 'EUR' | 'PLN' | 'USD' }`

### Forms

React Hook Form + Zod. The Zod schema in `src/features/applications/schemas/applicationSchema.ts` is the single source of truth for both runtime validation and TypeScript types. Connect via `@hookform/resolvers/zod`.

### Routing

React Router v6 data router (`createBrowserRouter`). Routes: `/` → `/board`, `/list`, `/stats`, `/applications/:id`. Filter state syncs to URL via `useSearchParams` so filtered views are shareable.

### Drag & drop

`@dnd-kit` with `DndContext` + `SortableContext`. Dragging a card between Kanban columns dispatches `changeStatus` to the slice — optimistic, no async needed since everything is local.

### Theming

CSS variables defined in `:root` and `[data-theme="dark"]` in `index.css`. `darkMode` in `tailwind.config.ts` uses `['class', '[data-theme="dark"]']`. `ThemeProvider` reads/writes `localStorage` and sets the `data-theme` attribute on `<html>`.

Tailwind extends these semantic color tokens (all map to CSS variables):

- `background`, `foreground` — page surface and text
- `primary` / `primary-foreground` — action color
- `muted` / `muted-foreground` — subdued surfaces and labels
- `border`, `card` / `card-foreground`, `destructive` / `destructive-foreground`
- Border radii: `lg` → `--radius`, `md` → `calc(--radius - 2px)`, `sm` → `calc(--radius - 4px)`

Always use these tokens instead of raw hex or arbitrary Tailwind colors.

### Key UI libraries

- `recharts` — charts on the stats page
- `lucide-react` — icon set
- `react-hot-toast` — toast notifications
- `nanoid` — generate `Application` and `ApplicationEvent` IDs

### Testing

- Unit tests on reducers, selectors, utils, Zod schemas — target 100% coverage for `src/features/*/api/` and `src/shared/lib/`
- Component tests via RTL with the custom `render` wrapper from `src/test/test-utils.tsx`
- The `AllProviders` wrapper in `test-utils.tsx` starts empty — extend it with Redux `Provider` and `MemoryRouter` as those are added to `src/app/`
- MSW handlers in `src/test/mocks/` for any future network layer
- Overall coverage target: 60%+

## Key constraints

- TypeScript strict mode, no `any` in production code
- No backend, no auth — data is localStorage only
- `shared/ui/` components must have zero business logic

## Architecture decisions

- **RTK over Zustand** — RTK is the dominant production pattern; chosen to demonstrate it
- **@dnd-kit over react-beautiful-dnd** — rbd was archived by Atlassian in 2024
- **Vitest over Jest** — native ESM + Vite config, faster, compatible API

## Day prompts & specs

@instructions/job-hunt-tracker.md
@instructions/day-2-prompt.md
@instructions/day-2-agent-prompt.md
