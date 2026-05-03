# Job Hunt Tracker — Project Spec

**Цель проекта:** Production-ready React приложение для портфолио, которое демонстрирует middle-уровень и реально полезно тебе в процессе поиска работы.

**Тайминг:** 14 дней при 2–3 часах в день. Можно ужать до 10 при 4 ч/день.

**Что покажу на собеседовании:** "Сделала для собственного job search, потому что Trello и таблицы не давали трекать технические детали по вакансиям и стадии собеседований."

---

## Содержание

1. [Tech Stack и обоснование](#tech-stack-и-обоснование)
2. [Доменная модель](#доменная-модель)
3. [Архитектура и структура папок](#архитектура-и-структура-папок)
4. [Фичи по приоритетам (MoSCoW)](#фичи-по-приоритетам-moscow)
5. [День за днём — план на 14 дней](#день-за-днём--план-на-14-дней)
6. [Архитектурные решения для интервью](#архитектурные-решения-для-интервью)
7. [Чек-лист готовности](#чек-лист-готовности)
8. [README — структура](#readme--структура)

---

## Tech Stack и обоснование

| Слой            | Технология                                                   | Почему именно это                                                                               |
| --------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Сборка          | **Vite**                                                     | Быстрый HMR, ESM-native, индустриальный стандарт. Уже знакомо.                                  |
| Язык            | **TypeScript** (strict)                                      | Без TS на middle React сейчас не берут.                                                         |
| UI              | **React 18**                                                 | Concurrent features, Suspense, useTransition.                                                   |
| Стейт           | **Redux Toolkit** + **redux-persist**                        | Самый распространённый в продакшене. Мидл должен уметь RTK.                                     |
| Серверный стейт | **RTK Query** _(симулируем API через setTimeout, потом MSW)_ | Демонстрирует понимание серверного стейта.                                                      |
| Формы           | **React Hook Form** + **Zod**                                | RHF — быстрые формы без перерендеров. Zod — runtime валидация + TS типы из схемы.               |
| Стили           | **TailwindCSS** + CSS variables                              | Быстрая разработка, консистентные токены, тёмная тема через CSS variables.                      |
| Drag & drop     | **@dnd-kit**                                                 | Современный, accessible. react-beautiful-dnd мёртв.                                             |
| Тесты           | **Vitest** + **React Testing Library** + **MSW**             | Vitest быстрее Jest, ESM-native. RTL — стандарт. MSW — для интеграционных тестов сетевого слоя. |
| Графики         | **Recharts**                                                 | Простой API, декларативный, хватает для базовой статы.                                          |
| Роутинг         | **React Router v6** (data router)                            | loaders, actions, defer — современный паттерн.                                                  |
| Линт/формат     | **ESLint** + **Prettier** + **Husky** + **lint-staged**      | Pre-commit хуки. Видно, что знаешь DX.                                                          |
| Деплой          | **Vercel** + **GitHub Actions**                              | CI запускает lint + tests на каждый PR.                                                         |

---

## Доменная модель

```ts
// src/features/applications/types.ts

export type ApplicationStatus =
  | 'wishlist' // Хочу подать
  | 'applied' // Подала
  | 'screening' // HR-скрининг
  | 'tech_interview' // Техническое
  | 'final_interview' // Финал
  | 'offer' // Оффер
  | 'rejected' // Отказ
  | 'withdrawn' // Сама отозвала

export type WorkMode = 'onsite' | 'hybrid' | 'remote'

export interface Application {
  id: string
  company: string
  position: string
  status: ApplicationStatus
  appliedAt: string // ISO date
  url?: string
  location?: string
  workMode?: WorkMode
  salary?: {
    min?: number
    max?: number
    currency: 'EUR' | 'PLN' | 'USD'
  }
  techStack?: string[] // ['React', 'TypeScript', 'Redux']
  notes?: string // Markdown поддерживается
  contactName?: string
  contactEmail?: string
  tags?: string[]
  events: ApplicationEvent[]
  createdAt: string
  updatedAt: string
}

export interface ApplicationEvent {
  id: string
  applicationId: string
  date: string
  type: 'status_change' | 'note' | 'interview_scheduled' | 'email'
  description: string
  metadata?: Record<string, unknown>
}

export interface FilterState {
  search: string
  statuses: ApplicationStatus[]
  dateFrom?: string
  dateTo?: string
  techStack?: string[]
}
```

---

## Архитектура и структура папок

Используем **feature-based** организацию (не FSD — для проекта такого размера это overkill, но в README объяснишь, что знаешь FSD).

```
job-hunt-tracker/
├── .github/
│   └── workflows/
│       └── ci.yml                    # lint + test на каждый PR
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── store.ts                  # configureStore
│   │   ├── router.tsx                # createBrowserRouter
│   │   └── providers/
│   │       ├── ThemeProvider.tsx
│   │       └── StoreProvider.tsx
│   │
│   ├── pages/
│   │   ├── BoardPage.tsx             # Канбан
│   │   ├── ListPage.tsx              # Таблица
│   │   ├── StatsPage.tsx             # Графики
│   │   ├── ApplicationDetailPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── features/
│   │   ├── applications/
│   │   │   ├── api/
│   │   │   │   └── applicationsSlice.ts
│   │   │   ├── components/
│   │   │   │   ├── ApplicationCard.tsx
│   │   │   │   ├── ApplicationForm.tsx
│   │   │   │   ├── ApplicationList.tsx
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   └── DeleteConfirmDialog.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useApplications.ts
│   │   │   │   └── useApplicationStats.ts
│   │   │   ├── schemas/
│   │   │   │   └── applicationSchema.ts   # Zod
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── filters/
│   │   │   ├── components/
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   ├── StatusFilter.tsx
│   │   │   │   └── SearchInput.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useFiltersFromUrl.ts
│   │   │   ├── slice.ts
│   │   │   └── selectors.ts
│   │   │
│   │   ├── theme/
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── slice.ts
│   │   │
│   │   └── data-export/
│   │       ├── components/
│   │       │   ├── ExportButton.tsx
│   │       │   └── ImportButton.tsx
│   │       └── utils.ts
│   │
│   ├── shared/
│   │   ├── ui/                       # Reusable примитивы
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── lib/
│   │   │   ├── format.ts             # formatDate, formatSalary
│   │   │   ├── storage.ts            # localStorage wrapper
│   │   │   └── id.ts                 # nanoid
│   │   ├── config/
│   │   │   └── constants.ts          # STATUS_LABELS, etc.
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── test/
│   │   ├── setup.ts                  # Vitest setup
│   │   ├── test-utils.tsx            # render with providers
│   │   ├── mocks/
│   │   │   ├── handlers.ts           # MSW handlers
│   │   │   └── server.ts
│   │   └── fixtures/
│   │       └── applications.ts
│   │
│   ├── index.css                     # Tailwind directives + CSS vars
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── .husky/
│   └── pre-commit
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

**Принципы организации:**

- `features/` — изолированные доменные единицы. Внутри — всё про эту фичу.
- `shared/ui/` — переиспользуемые примитивы без бизнес-логики.
- `pages/` — тонкие компоненты, собирают features в страницу.
- `app/` — конфигурация приложения (store, router, providers).
- Никаких циклических зависимостей: pages → features → shared. Никогда наоборот.

---

## Фичи по приоритетам (MoSCoW)

### MUST HAVE (MVP — без этого не отгружаем)

- Добавить / редактировать / удалить вакансию (CRUD)
- Список вакансий (таблица или карточки)
- Статусы из enum
- Persistence через localStorage
- TypeScript strict mode везде
- Юнит-тесты бизнес-логики (slice, utils)
- Деплой на Vercel
- Solid README

### SHOULD HAVE (must-have для middle-впечатления)

- Канбан-доска с drag & drop
- Поиск и фильтры с синхронизацией в URL
- Тёмная тема
- Валидация форм через Zod
- Страница статистики с графиками
- Export / Import JSON
- Error boundaries
- Loading и empty states
- CI на GitHub Actions

### COULD HAVE (если успеваешь)

- Теги / лейблы для вакансий
- Markdown в заметках
- Напоминания о follow-up
- Timeline view (events history)
- Печать резюме сопровождения для конкретной вакансии
- Импорт из CSV
- MSW + RTK Query (вместо чистого RTK с localStorage)

### WON'T HAVE (явно исключаем — рассказать на интервью почему)

- Реальный бэкенд / база данных
- Аутентификация
- Multi-user / collaboration
- Mobile native приложение

---

## День за днём — план на 14 дней

### День 1 — Setup (3 ч)

- `pnpm create vite` → React + TS template
- Установка зависимостей: RTK, RTK Query, RHF, Zod, Tailwind, dnd-kit, recharts, react-router-dom, @testing-library/react, vitest, msw
- Настройка Tailwind + CSS variables для темы
- ESLint + Prettier + Husky + lint-staged
- Vitest config + RTL setup
- GitHub repo + первый коммит
- Скелет README (заполним детально на день 12)

**Definition of done:** `pnpm dev` показывает Hello World, `pnpm test` проходит, `pnpm lint` чистый, репо на GitHub.

### День 2 — Domain & Store (3 ч)

- Файл `types.ts` с интерфейсами Application, ApplicationStatus и т.д.
- `applicationsSlice.ts` с reducers: addApplication, updateApplication, deleteApplication, changeStatus
- redux-persist middleware (localStorage)
- Тесты на slice (минимум 5 тестов на reducers)
- Seed-функция для генерации тестовых данных

**Definition of done:** Тесты на slice проходят, в Redux DevTools видны actions, после рефреша данные сохраняются.

### День 3 — Базовый UI Shell + List View (3 ч)

- App layout: header (логотип, nav, theme toggle), main, footer
- React Router setup: `/`, `/board`, `/list`, `/stats`, `/applications/:id`
- Базовые `shared/ui/` компоненты: Button, Input, Card, Badge
- Страница ListPage — простая таблица всех вакансий

**Definition of done:** Можно ходить по роутам, видно тестовые данные в виде таблицы.

### День 4 — CRUD UI (3 ч)

- Form компонент через RHF + Zod
- Модалка добавления вакансии
- Редактирование (та же форма, prefilled)
- Удаление с confirmation dialog
- Toast-уведомления (можно react-hot-toast)

**Definition of done:** Полный CRUD работает, валидация показывает ошибки, данные персистятся.

### День 5 — Theme + Polish (2 ч)

- ThemeProvider с переключением dark/light
- CSS variables в `:root` и `[data-theme="dark"]`
- Tailwind config настроен на CSS variables
- Сохранение выбора темы в localStorage
- Иконки (lucide-react)

**Definition of done:** Тёмная тема выглядит хорошо, переключатель в хедере, выбор сохраняется.

### День 6 — Filters & Search (3 ч)

- `filtersSlice` с состоянием фильтров
- FilterBar компонент с фильтрами по статусам, поиск по компании/позиции
- Селектор `selectFilteredApplications` (использует createSelector из RTK)
- Синхронизация фильтров в URL через `useSearchParams`
- Debounce на поиск (300мс)

**Definition of done:** Фильтры работают, ссылка на отфильтрованный список можно скопировать и открыть — фильтры применятся.

### День 7 — Канбан-доска с DnD (4 ч)

- BoardPage с колонками по статусам
- @dnd-kit DndContext, SortableContext, useDraggable / useDroppable
- Drag карточки между колонками меняет статус в store
- Optimistic UI обновление
- Анимации перехода

**Definition of done:** Можно перетаскивать карточки между колонками, статус обновляется, выглядит плавно.

### День 8 — Stats Page (2 ч)

- StatsPage с метриками: total, по статусам, response rate, conversion rate
- Recharts: bar chart по статусам, line chart по неделям
- Hook `useApplicationStats` (мемоизация)

**Definition of done:** Страница статистики показывает осмысленные данные, графики не ломаются на пустом state.

### День 9 — Export / Import (2 ч)

- Кнопка Export JSON — скачивает файл `applications-2026-05-15.json`
- Кнопка Import JSON — file input + парсинг + валидация Zod-схемой
- Replace mode и merge mode
- Обработка ошибок (битый JSON, неправильная схема)

**Definition of done:** Можно экспортировать, удалить всё, импортировать обратно — данные восстанавливаются.

### День 10 — Тесты часть 1: Бизнес-логика (3 ч)

- Тесты всех reducers и selectors
- Тесты utility функций (formatSalary, dateHelpers)
- Тесты Zod схем
- Coverage по slices: 100%

**Definition of done:** `pnpm test` зелёный, coverage по `src/features/*/api/` и `src/shared/lib/` — 100%.

### День 11 — Тесты часть 2: Компоненты (3 ч)

- RTL тесты на ApplicationForm (заполнение, валидация, сабмит)
- RTL тесты на ApplicationCard
- RTL интеграционный тест: добавить вакансию через UI → видна в списке
- Тесты на FilterBar (фильтрация работает)
- Custom render с Redux Provider в `test-utils.tsx`

**Definition of done:** Общий coverage 60%+, есть минимум 3 интеграционных теста.

### День 12 — Polish & A11y (3 ч)

- ErrorBoundary вокруг страниц
- Empty states для пустого списка/доски
- Loading states (хотя данные локальные, симулируем)
- Keyboard navigation (Tab, Enter, Esc в модалках)
- ARIA-атрибуты на интерактивных элементах
- Lighthouse audit → 90+ по всем метрикам

**Definition of done:** Lighthouse Performance 90+, Accessibility 95+, можно работать только с клавиатуры.

### День 13 — README + Deploy (3 ч)

- Полный README (структура ниже)
- Скриншоты / GIF демо
- Архитектурные решения в отдельном `docs/architecture.md`
- Deploy на Vercel
- GitHub Actions: lint + test + build на каждый PR
- README badge: build status, coverage, license

**Definition of done:** Демка живая по vercel-ссылке, README выглядит профессионально, CI зелёный.

### День 14 — Buffer + Promo (2 ч)

- Финальные багфиксы
- Запись короткого видео (Loom, 2 минуты) — обзор фич
- LinkedIn-пост о проекте (используй промт из claude-guide-margo.md)
- Добавить в раздел Projects в CV

**Definition of done:** Проект задеплоен, репозиторий публичный, есть промо-материалы.

---

## Архитектурные решения для интервью

Готовь честные ответы на эти вопросы. Их **обязательно** спросят.

### "Почему Redux Toolkit, а не Zustand / Jotai / Context?"

> RTK даёт предсказуемые паттерны (slices, immer, middleware), отличные devtools и серверный стейт через RTK Query из коробки. На рынке middle-вакансий RTK встречается чаще всего — мне важно было показать, что я работаю с тем, что используют команды. Для меньших проектов я бы взяла Zustand, но здесь хотела продемонстрировать продакшен-патерн.

### "Почему feature-based, а не FSD?"

> FSD — отличная методология, но для приложения такого размера она вводит лишние слои абстракции. Feature-based проще и быстрее. Если бы проект рос до 50+ фич, я бы рефакторила в FSD. В README я отдельно описала, что знаю FSD и почему сейчас выбрала проще.

### "Почему @dnd-kit, а не react-beautiful-dnd?"

> react-beautiful-dnd архивирован Atlassian в 2024. @dnd-kit — современная замена: меньше bundle size, нативная accessibility, работает с любыми layout (не только списки), поддержка touch.

### "Почему Vitest, а не Jest?"

> Vitest нативно работает с ESM и Vite-конфигом — нет необходимости поддерживать отдельный jest.config с трансформерами. API совместим с Jest, миграция тривиальна. Скорость в 2–4 раза выше на больших тест-сьютах.

### "Почему Zod + RHF?"

> RHF делает формы быстрыми (использует uncontrolled inputs), Zod даёт runtime-валидацию и автоматически выводит TS-типы из схемы — одна источник правды для типов формы и валидации. Связка через `@hookform/resolvers/zod`.

### "Как ты обрабатываешь ошибки?"

> Три уровня: (1) Zod-схема ловит ошибки валидации форм; (2) try/catch в async thunks с понятными ошибочными состояниями в стейте; (3) ErrorBoundary вокруг страниц для непойманных runtime-ошибок. Toast-уведомления для пользователя.

### "Как тестируешь?"

> Пирамида: много юнит-тестов на reducers/selectors/utils (быстрые, 100% coverage критичной логики). Меньше — интеграционных через RTL (рендерим страницу с Redux Provider, симулируем user interactions). E2E не делала, но рассказала бы про Playwright если будет следующая итерация.

### "Что бы добавила, будь больше времени?"

> 1. Реальный бэкенд (Supabase/собственный Node-сервис) с auth. 2) Sync между устройствами. 3) Интеграция с LinkedIn API для автоматического импорта вакансий. 4) Уведомления о follow-up через Web Push API.

### "Что было самым сложным?"

> Подобрать правильную доменную модель ApplicationEvent, чтобы можно было строить timeline и одновременно делать осмысленную статистику без дублирования данных. Решила хранить events отдельным массивом, status в Application — для быстрого фильтра, а полная история — в events.

---

## Чек-лист готовности

### Технический

- [ ] TypeScript strict mode, без `any` в продакшен-коде
- [ ] ESLint + Prettier настроены, репо чистое
- [ ] Husky pre-commit запускает lint + test
- [ ] GitHub Actions CI проходит
- [ ] Lighthouse: Performance 90+, A11y 95+, Best Practices 100, SEO 100
- [ ] Тесты: общий coverage 60%+, бизнес-логика 100%
- [ ] Нет console.error / console.warn в проде
- [ ] Нет упавших промисов (все await обёрнуты)

### Презентационный

- [ ] README с скриншотами и GIF-демо
- [ ] Раздел "Tech decisions" в README
- [ ] Live-демо на Vercel
- [ ] LICENSE (MIT)
- [ ] Описание в LinkedIn featured

### Контент в репозитории

- [ ] `docs/architecture.md` — архитектурные решения
- [ ] `docs/screenshots/` — картинки для README
- [ ] CHANGELOG.md (опционально)

---

## README — структура

```markdown
# Job Hunt Tracker

> Personal application tracker built to organize my own job search.
> React 18 · TypeScript · Redux Toolkit · Vite

[Live demo](https://...) · [Screenshots](#screenshots)

## Why

Trello and spreadsheets weren't capturing tech-stack details, salary ranges,
and interview history in one structured place. Built this to fix that.

## Features

- Kanban board with drag & drop between stages
- List view with search, filters, URL state sync
- Stats: response rate, conversion per stage, applications per week
- Dark mode
- Export / import JSON
- Keyboard accessible, Lighthouse 95+

## Tech stack

[таблица]

## Architecture decisions

- Why Redux Toolkit over Zustand → ...
- Why feature-based over FSD → ...
- Why @dnd-kit → ...
- [link to docs/architecture.md for full version]

## Local development

[команды pnpm i, pnpm dev, pnpm test, pnpm build]

## Tests

[как запустить, coverage badge]

## Deployment

[Vercel, CI]

## What I'd add next

[список could-have фич с обоснованием]

## Screenshots

[скриншоты + GIF]
```

---

## Полезные ссылки

- [Redux Toolkit docs](https://redux-toolkit.js.org/)
- [@dnd-kit docs](https://docs.dndkit.com/)
- [React Hook Form + Zod guide](https://react-hook-form.com/get-started#SchemaValidation)
- [Vitest + RTL recipes](https://vitest.dev/guide/testing-types)
- [Tailwind dark mode + CSS variables](https://tailwindcss.com/docs/dark-mode)

---

## Ритуал ежедневной работы

1. Открыть этот файл, посмотреть план на день.
2. Создать ветку `feat/day-N-описание` от main.
3. Кодить с тестами с самого начала, не "потом допишу".
4. В конце дня — PR в main, мерж после зелёного CI (даже если ты одна — это хорошая привычка).
5. Обновить чек-лист готовности (отметить выполненное).
6. Записать в `claude-guide-margo.md` если узнала что-то важное про React.

---

_Создано: 2026-05-01_
