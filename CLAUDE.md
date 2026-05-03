# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Job Hunt Tracker — a portfolio React app for tracking job applications through a Kanban board, list view, and stats page. Data lives in localStorage (no backend). Built to demonstrate middle-level React skills.

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm test         # run all tests (Vitest)
pnpm test --run   # run tests once (no watch)
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
- `ApplicationEvent` — append-only log (`status_change | note | interview_scheduled | email`)
- `FilterState` — `{ search, statuses[], dateFrom?, dateTo?, techStack? }`

### Forms

React Hook Form + Zod. The Zod schema in `src/features/applications/schemas/applicationSchema.ts` is the single source of truth for both runtime validation and TypeScript types. Connect via `@hookform/resolvers/zod`.

### Routing

React Router v6 data router (`createBrowserRouter`). Routes: `/` → `/board`, `/list`, `/stats`, `/applications/:id`. Filter state syncs to URL via `useSearchParams` so filtered views are shareable.

### Drag & drop

`@dnd-kit` with `DndContext` + `SortableContext`. Dragging a card between Kanban columns dispatches `changeStatus` to the slice — optimistic, no async needed since everything is local.

### Theming

CSS variables defined in `:root` and `[data-theme="dark"]` in `index.css`. Tailwind config maps to those variables. `ThemeProvider` reads/writes `localStorage` and sets the `data-theme` attribute on `<html>`.

### Testing

- Unit tests on reducers, selectors, utils, Zod schemas — target 100% coverage for `src/features/*/api/` and `src/shared/lib/`
- Component tests via RTL with a custom `render` wrapper from `src/test/test-utils.tsx` (includes Redux Provider)
- MSW handlers in `src/test/mocks/` for any future network layer
- Overall coverage target: 60%+

## Key constraints

- TypeScript strict mode, no `any` in production code
- No backend, no auth — data is localStorage only
- `shared/ui/` components must have zero business logic
