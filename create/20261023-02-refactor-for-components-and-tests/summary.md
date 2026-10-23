# Summary: refactor for components and tests

- **Slug:** 20261023-02-refactor-for-components-and-tests
- **Started:** 2026-10-23 08:01 · **Completed:** 2026-10-23 08:59:43

## Overview

Enforced two standards across the code (one React component per file; unit tests that treat a file as the unit and mock only at the boundaries) and made 95% test coverage a rule that fails the build and is checked at the end of every create session. The session grew from there: kebab-case file names everywhere, a self-contained explorations structure for the design app, shared UI pieces for duplicated code, and a consistent `components/`, `hooks/` and `lib/` layout. Work is on branch `refactor-components-and-tests`, [PR 2](https://github.com/dannywieser/md-viz/pull/2).

## What was done

- **One component per file.** Split web `Message`, design `GlyphSheet`, `ColorSwatch`, `NoteBlock`, `MockCard`, `BackgroundSwatch`, and the Electron `App` into `use-scan`, `use-sync`, `FolderCard`, `StatusGrid` (the error card was later replaced by the shared `Message`). `react/no-multi-comp` enforces it; exceptions are shadcn `card.tsx`, `Cells` in `note-grid.tsx` and stub components in tests.
- **Tests.** One unit test per source file, mocking at the boundaries (react-query and SDK hooks, `window.api`, `electron`, `node:fs/promises`); `App` tests only check composition. Existing gaps closed in cache, ui, Electron main (new `ipc.test.ts`), web and design.
- **Coverage.** `@vitest/coverage-v8` with 95% thresholds in every workspace, a root `pnpm coverage` (serial, `--no-bail`), entry files and generated code excluded.
- **Create skills.** `/create-plan` requires per-file tests and a coverage step; `/create-complete` re-runs and double-checks coverage and reports it.
- **Naming.** All PascalCase source and test files renamed to kebab-case; `unicorn/filename-case` enforces it.
- **Design explorations.** `apps/design/src/explorations/<slug>/` is self-contained (components, data, an `index.ts` with slug, title, description and a lazy `Page`); `registry.ts`, `route.ts` and a new index page serve `/explorations` and `/explorations/<slug>`. The old `/background` URL was dropped.
- **Shared UI.** `Message` (tone, fill, action) replaced four near-duplicates, `useGridLattice` replaced two copies of the ref/cell/lattice wiring, `DEFAULT_NOTE_COLOR` replaced two constants; `Message` is shown on the design board.
- **Layout.** web, the Electron renderer and `packages/ui` use `components/`, `hooks/`, `lib/` with mirrored tests; `./hooks/*` is exported from `@md-viz/ui` for shadcn. `apps/design` and Electron's `src/main` are exempt.

## Highlights

- Boundary-only mocking is a trial. App-level tests in design and Electron still mock their heavy neighbours (route pages, sections, the two hooks); revisit if tests get brittle.
- `react/no-multi-comp` also flags stub components inside `vi.mock` factories, so it is off under `**/tests/**` (agreed).
- `eslint-plugin-react` needs `settings.react.version: '19'`; `'detect'` crashes under ESLint 10.
- The React hooks lint refuses components created during render, so each exploration exports a module-level `lazy` `Page` instead of a `load` function, and the web grid destructures the lattice hook's result before passing its ref.
- Parallel vitest runs race on `node_modules/.vitest-cache`, hence serial coverage.
- Vitest's "jsdom created N times" hint was deliberately left alone: `isolate: false` and `vmThreads` would weaken the per-file isolation the mocks rely on.

## Coverage

Fresh `pnpm coverage` at completion, exit 0, all six workspaces ran, thresholds (95% on lines, statements, branches, functions) unchanged in every config.

| Workspace | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| apps/cache | 100% | 100% | 100% | 100% |
| packages/api-client | 100% | 100% | 100% | 100% |
| packages/ui | 99.4% | 98.07% | 100% | 100% |
| apps/design | 100% | 100% | 100% | 100% |
| apps/electron | 100% | 98.13% | 100% | 100% |
| apps/web | 100% | 100% | 100% | 100% |

## Deviations from the plan

- Scope grew beyond the plan: file renames, explorations, shared components and the folder layout were added during implementation at the user's request.
- Electron kept a single `error` state in `App`, passed to both hooks as `onError`, instead of one error per hook.
- Explorations export a lazy `Page` rather than a `load` function (lint, see highlights).
- The planned "discuss other lint exceptions" step found none beyond the tests override.

## Not done / follow-ups

- Boundary-only mocking trial to be revisited.
- PR 2's description still covers only the first commit.
- Design keeps its own structure (`sections/`, `explorations/`) on purpose; the `components`/`hooks`/`lib` layout is not applied there.

## Harvest

- `CLAUDE.md`: already updated during the session (commands, conventions for file naming, one component per file, boundary tests, coverage, React version pin, source layout, `Message`, explorations, Electron renderer layout); read again at completion, nothing further needed.
- `README.md`: added the `pnpm coverage` command and a sentence on the 95% coverage rule and the `components`/`hooks`/`lib` layout.
