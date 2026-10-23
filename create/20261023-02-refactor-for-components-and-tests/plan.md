# Plan: refactor for components and tests

## Goal

Make the code easier to work with by enforcing two standards: every React component definition lives in its own file, and unit tests treat a file as a unit and mock its dependencies at the boundaries. Today the web and Electron tests all run through `App`, so they behave like integration tests. Add 95% coverage enforcement and make the create skills plan for, verify and report it.

## Scope

In:
- Split multi-component files into one component per file (web, design, ui; Electron `App.tsx` into child components and hooks).
- Rewrite tests so each source file has its own unit test mocking at the boundaries (hooks, the generated cache SDK / react-query helpers, `window.api`, `@md-viz/ui` where it is a boundary). Real small children render. `App` tests become thin composition tests.
- Vitest v8 coverage with 95% thresholds (lines, statements, branches, functions) per workspace, root `pnpm coverage`; fix existing gaps.
- ESLint `react/no-multi-comp` trial; record the exception count.
- `CLAUDE.md` conventions; update `/create-plan` and `/create-complete` skills.

Out:
- shadcn-generated components in `packages/ui/src/components` (exempt, e.g. `card.tsx`, `button.tsx`).
- `Cells` in `note-grid.tsx` (agreed exception). Any other exception is raised with the user, not decided alone.
- Behavior or visual changes.
- Coverage of entry files: `main.tsx` files, `apps/electron/src/main/index.ts`, `apps/electron/src/preload/index.ts`, `apps/cache/src/index.ts`, `vite-env.d.ts`/`env.d.ts`, generated code.

## Technologies

- Vitest + `@vitest/coverage-v8` (already on Vitest; v8 is fast and needs no instrumentation). Same version as the installed vitest.
- Testing Library + jsdom (existing), `vi.mock` for boundaries.
- `eslint-plugin-react` for `react/no-multi-comp` (the rule lives there; not currently installed). Pin an exact version like the other devDependencies.

## Repository structure

```
apps/electron/src/renderer/src/
  App.tsx                 (composes only)
  FolderCard.tsx          (chosen folder, last sync time, scan/count/sync status lines)
  ErrorCard.tsx
  use-scan.ts             (folder, progress, count, scanning, error; selectFolder)
  use-sync.ts             (syncProgress, syncing, lastSync; sync)
  SyncGrids.tsx           (unchanged)
apps/web/src/
  CacheNoteGrid.tsx
  Message.tsx             (new)
apps/design/src/sections/
  GlyphSheet.tsx          (new, from Logo.tsx)
  Swatch.tsx              (new, from Palette.tsx)
apps/design/src/routes/
  NoteBlock.tsx, MockCard.tsx, Swatch.tsx (new, from Background.tsx; background Swatch name may collide, pick distinct name)
<each workspace>/tests/   one test file per source file
<each workspace>/vitest.config.ts   coverage block
```

The exact Electron split is settled when reading the code in step 5; hook boundaries follow the state that changes together (scan state, sync state).

## Files

Create:
- `apps/web/src/Message.tsx` - loading/error message card moved out of `CacheNoteGrid`.
- `apps/design/src/sections/GlyphSheet.tsx`, `Swatch.tsx` (sections), `apps/design/src/routes/NoteBlock.tsx`, `MockCard.tsx`, background swatch - one component each.
- `apps/electron/src/renderer/src/FolderCard.tsx`, `ErrorCard.tsx`, `use-scan.ts`, `use-sync.ts` - extracted from `App.tsx`.
- Unit tests for every new file and for source files lacking one (web `CacheNoteGrid`, `query-client`; design sections; Electron `SyncGrids`, hooks, cards; ui gaps found by coverage).

Modify:
- `apps/electron/src/renderer/src/App.tsx`, `apps/web/src/CacheNoteGrid.tsx`, `apps/design/src/sections/Logo.tsx`, `Palette.tsx`, `routes/Background.tsx` - remove inlined components.
- `apps/web/tests/App.test.tsx`, `apps/electron/tests/renderer/App.test.tsx`, `apps/design/tests/*` - thin composition tests; behavior assertions move to unit tests.
- `apps/*/vitest.config.ts`, `packages/ui/vitest.config.ts` - v8 coverage, include `src/**`, exclude entry/generated files, thresholds 95.
- Root and workspace `package.json` - `coverage` scripts; devDependencies `@vitest/coverage-v8`, `eslint-plugin-react`.
- `eslint.config.js` - `react/no-multi-comp` (ignoreStateless false), override off for `packages/ui/src/components/**` (shadcn) and `note-grid.tsx`.
- `.gitignore` - `coverage/` if missing.
- `CLAUDE.md` - conventions: one component per file, boundary-only mocking, 95% coverage and `pnpm coverage` in the pre-finish checklist, "raise exceptions with the user".
- `.claude/skills/create-plan/SKILL.md` - plans must include coverage (95%) as a step and a test step per changed file.
- `.claude/skills/create-complete/SKILL.md` - run `pnpm coverage`, double-check the numbers (re-run if stale, confirm thresholds enforce), report per-workspace figures to the user and in `summary.md`, flag anything under 95%.

## Steps

1. Add coverage tooling: install `@vitest/coverage-v8`, configure every workspace's `vitest.config.ts` (thresholds 95, exclusions), add `coverage` scripts and root `pnpm coverage`, ignore `coverage/`. Run once to record the baseline per workspace.
2. Add `eslint-plugin-react` and `react/no-multi-comp`; run `pnpm lint` and record the violations. Add the agreed exemptions (shadcn dir, `Cells`); list any other violation for discussion.
3. Split the multi-component files in web and design (`Message`, `GlyphSheet`, `Swatch`, `NoteBlock`, `MockCard`, background swatch). Behavior unchanged; existing tests still pass.
4. Review any other violations the lint turned up with the user before touching them.
5. Refactor Electron `App.tsx` into `use-scan`, `use-sync`, `FolderCard`, `ErrorCard`; `App` only composes. Keep existing tests green.
6. Write unit tests per file, mocking at the boundaries only: components mock their hooks / SDK / `window.api`; hooks mock `window.api`; render real small children. Thin the `App` tests to composition. Do web, then Electron renderer, then design, then ui.
7. Close coverage gaps in every workspace (including Electron main, cache and api-client usage where measured) until each is at or above 95%.
8. Update `CLAUDE.md` and the `/create-plan` and `/create-complete` skills as described above.
9. Run `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm coverage`; report the per-workspace numbers.

## Open questions / risks

- The boundary-only mocking style is a trial; if tests become brittle or noisy we revisit (log the outcome).
- `react/no-multi-comp` may flag more than expected (e.g. test files with helper components, forwardRef wrappers); exceptions go to the user.
- Branch coverage at 95% may need tests for defensive branches in Electron main (`sync.ts`, `walk.ts`); if a branch is unreachable, discuss rather than lowering the threshold.
- Electron `main/ipc.ts` and `index.ts` touch Electron APIs; `ipc.ts` needs an `electron` mock to be covered. `index.ts` stays excluded.
- `apps/cache` runs on Node's type stripping and `node:sqlite`; the v8 provider should work but verify in step 1.
