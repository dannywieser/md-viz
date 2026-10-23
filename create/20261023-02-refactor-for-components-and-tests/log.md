# Create session: refactor for components and tests

- **Slug:** 20261023-02-refactor-for-components-and-tests
- **Started:** 2026-10-23 08:01:29 MDT
- **Completed:** 2026-10-23 08:59:43

---

### [2026-10-23 08:01:29] User
/create refactor for components and tests

### [2026-10-23 08:01:45] Claude
Started session `20261023-02-refactor-for-components-and-tests` (folder `create/20261023-02-refactor-for-components-and-tests/`). Asked the user to explain what they want:
1. What is the pain point: components too big or duplicated, or tests hard to write or brittle?
2. Which apps or packages (web, electron, ui, cache, design) are in scope?
3. Should behavior and visuals stay identical (pure refactor), or may things change?
4. Any target for tests: more coverage, or just reorganising?

### [2026-10-23 08:05:10] User
just a couple standards I want to enforce to make the code easier to work with:

* any definition of a React component should always live in it's own file
* along with that for the most part, unit tests should be striving to test the file as a unit and mocking dependencies.

So the pain point I'm trying to address is that for the web and electron app, we're ending up with all tests flowing through the App component and acting a bit more like an integration test. 

I'd also like to update the create skillset to enforce code coverage of 95% and report this to me after completion

### [2026-10-23 08:06:00] Claude
Read the repo. Findings: one-component-per-file is already mostly true; violations are `CacheNoteGrid.tsx` (Message), `design/sections/Logo.tsx` (GlyphSheet), `Palette.tsx` (Swatch), `routes/Background.tsx` (NoteBlock, MockCard, Swatch), `ui/components/card.tsx` (7 components), and `Cells` inside `note-grid.tsx`. Web `App.test.tsx` and electron `App.test.tsx` (221 lines) drive everything through App; electron main already has per-file tests. No coverage tooling is installed yet.

Questions:
1. Card (shadcn): split `card.tsx` into 7 files, or exempt shadcn-generated components in `packages/ui`? Same for `Cells` in `note-grid.tsx` (a memo'd internal).
2. For Electron, App.tsx is ~120 lines of folder pick, scan, sync, grids. Extract into child components and hooks (e.g. a folder picker, a sync panel, a `useSync` hook) so App just composes them and App tests become thin?
3. Mocking style: `vi.mock` of module dependencies (children, hooks, the generated cache SDK, `window.api`), with components tested via shallow-style stubs? Is that what you picture, or only mock at boundaries (hooks, API) and render real small children?
4. Enforcement: just a CLAUDE.md convention, or also an ESLint rule (e.g. `react/no-multi-comp`) so it is checked by `pnpm lint`?
5. Coverage: Vitest v8 provider, 95% on lines/statements/branches/functions, per workspace with thresholds that fail `pnpm test`, plus a root `pnpm coverage` report? Should the threshold apply to everything or exclude entry files (`main.tsx`, Electron main `index.ts`, preload, `apps/cache/src/index.ts`)?
6. Create skillset: add to `/create-plan` that the plan must include coverage, and to `/create-complete` a step that runs coverage and reports the numbers (and fails the session if under 95%)? Or should it be only reporting?
7. Should the existing coverage gaps get fixed as part of this session, or just the structure and App tests?

### [2026-10-23 08:12:00] User
1. exempt shadcn, cells is an exception. maybe just make a note to discuss with me cases like this as we encounter them
2. yes
3. let's try at the boundaries only
4. let's try with lint to see how many exceptions it triggers
5. yes, exclude those files
6. the plan should dictate that this will be included, double checked and reported in complete
7. yes, let's do the fixes here

### [2026-10-23 08:12:20] Claude
Intent is clear. Summary of decisions:
- One component per file; shadcn components in `packages/ui` exempt, `Cells` stays as an exception; add a CLAUDE.md note: raise any other exception cases with the user instead of deciding alone.
- Electron `App.tsx` split into child components plus hooks; App tests become thin.
- Unit tests mock at boundaries only (hooks, generated SDK, `window.api`), real small children rendered. Trial run, revisit.
- ESLint rule (`react/no-multi-comp`) tried to see how many exceptions it triggers.
- Vitest v8 coverage, 95% thresholds per workspace, root `pnpm coverage`; exclude entry files (`main.tsx`, electron main `index.ts`, preload, cache `index.ts`).
- Create skills: `/create-plan` must include coverage; `/create-complete` re-runs, double-checks and reports coverage.
- Fix existing coverage gaps in this session.
Told the user to type `/create-plan`.

### [2026-10-23 08:13:01] User
/create-plan

### [2026-10-23 08:13:01] Claude
Wrote `plan.md` (9 steps: coverage tooling, lint trial, split web/design files, discuss lint findings, Electron App split, per-file unit tests with boundary mocking, close coverage gaps, CLAUDE.md and skill updates, final checks and report). Status set to planned. Asked how to proceed: (a) implement everything, (b) step by step pausing after each numbered step, (c) file by file, (d) custom.

### [2026-10-23 08:13:01] Decision
Plan created; awaiting choice of approach.

### [2026-10-23 08:13:30] User
1

### [2026-10-23 08:13:30] Decision
Implement everything (option 1), then report. Starting with step 1 (coverage tooling).

### [2026-10-23 08:16:33] Decision
Steps 1-3 and 5 done. Step 1: added `@vitest/coverage-v8` 5.0.4 and `eslint-plugin-react` 7.37.5 (root devDependencies); coverage block (v8, include `src/**/*.{ts,tsx}`, entry-file exclusions, 95% thresholds) in every workspace vitest/vite config; `coverage` script per workspace and root `pnpm coverage` (runs workspaces serially, `--no-bail`, since parallel runs race on the vitest cache dir). Baseline before fixes: cache 94.7/83.3 br, ui 95.6/88.2 br/92.3 fn, design 95.1/97.2/93.3 fn, electron 80.1/66.7 br/78.8 fn (ipc.ts 0%), web 93.8 stmts/83.3 fn (query-client.ts 0%), api-client ok.
Step 2: `react/no-multi-comp` flagged 7 files (Background x3, Logo, Palette, SyncGrids, CacheNoteGrid) plus card.tsx and note-grid.tsx. Fixed all; exceptions: card.tsx (shadcn, config override) and note-grid.tsx (`Cells`, file-level disable with reason). React version must be pinned to '19' in the plugin settings: 'detect' crashes under ESLint 10.
Step 3: split web `Message`; design `GlyphSheet`, `ColorSwatch` (sections), `NoteBlock`, `MockCard`, `BackgroundSwatch` (routes), `Layout` type moved to background-variants.ts.
Step 5: Electron App split into `use-scan`, `use-sync`, `error-message`, `FolderCard`, `ErrorCard`, `StatusGrid`, `sync-layout`; SyncGrids trimmed. Deviation: a single `error` state stays in App and is passed to both hooks as `onError`, so a scan or sync start clears the other's error like before. Lint, typecheck and the existing tests are green.

### [2026-10-23 08:22:26] Decision
Steps 6-7 done. Wrote per-file unit tests mocking only at boundaries (react-query/SDK hooks, `window.api`, `electron`, `node:fs/promises` for failure paths, `@md-viz/ui` NoteGrid/useDotLattice where the unit is the file calling them). Web: Message, CacheNoteGrid, query-client; thin App. Design: tests/sections/*, tests/routes/*, theme, App (mocks Board, Background and the theme hook), Board (mocks the sections). Electron renderer: App (mocks use-scan/use-sync), hooks, FolderCard, ErrorCard, StatusGrid, SyncGrids, error-message; main: ipc.test.ts (mocks electron and the sibling modules), shared-ipc, extra sync/scan/state cases. UI: button, card, use-dot-lattice, use-element-size, note-grid gaps. Cache: 500 handler, body-level 400, rollback.
Deviation from "render real small children": App-level tests in design (Board, App) and electron (App) mock the heavy neighbours (route pages, sections, the two hooks); web App renders the real CacheNoteGrid with react-query mocked. To revisit.

### [2026-10-23 08:25:21] Decision
Steps 8-9 done. CLAUDE.md: new conventions (one component per file and its exceptions, boundary-only unit tests, 95% coverage, React version pin, Electron renderer layout), `pnpm coverage` command, pre-finish checklist now format/lint/typecheck/coverage. `/create-plan` requires per-file unit tests and a coverage step; `/create-complete` gained a fresh-run, double-checked coverage step reported in summary and message; create/README updated.
Lint finding to discuss: `react/no-multi-comp` also flags inline stub components inside `vi.mock` factories in tests (design App/Board tests); added a `**/tests/**` override, to confirm with the user.
Final: format, lint, typecheck, coverage (exit 0) and build all green. Per workspace (stmts/branches/funcs/lines): cache 100/100/100/100, api-client 100/100/100/100, ui 99.37/97.84/100/100, design 100/100/100/100, electron 100/98.16/100/100, web 100/100/100/100. Work finished; user can run /create-complete.

### [2026-10-23 08:29:28] User
Asked about mixed PascalCase/kebab-case file names; chose consistency, leaning kebab-case ("let's just pull off the bandaid").

### [2026-10-23 08:29:28] Decision
Renamed every PascalCase source and test file in apps/* to kebab-case (app.tsx, cache-note-grid.tsx, sync-grids.tsx, ...), updated imports and vi.mock paths, and added the file-naming rule to CLAUDE.md. No lint rule enforces it yet. Format, lint, typecheck, build and coverage all green after the rename.

### [2026-10-23 08:30:21] Decision
Added `eslint-plugin-unicorn` 78.0.0 (root devDependency) with `unicorn/filename-case` set to kebab-case for ts/tsx files; verified it flags a `BadName.ts`; lint is clean on the repo. CLAUDE.md notes the rule.

### [2026-10-23 08:31:56] User
yes, that makes sense

### [2026-10-23 08:31:56] Decision
Keep the `**/tests/**` override for `react/no-multi-comp`: stub components in `vi.mock` factories are not component definitions. Branch refactor-components-and-tests committed and PR dannywieser/md-viz#2 opened; log update not yet committed.

### [2026-10-23 08:37:24] User
For the design board, move the background exploration into "explorations/background"; suggest how to make explorations self-contained, including routing. Then: 1. drop the old /background URL, 2. build the index page, 3. leave the lint boundary rule out.

### [2026-10-23 08:37:24] Decision
Implemented explorations in apps/design: `src/explorations/<slug>/` folders (background moved from `routes/`, tests under `tests/explorations/<slug>/`), each exporting an `Exploration` (slug, title, description, lazy `Page`) from `index.ts`; `registry.ts` lists them; `route.ts` resolves `/` (board), `/explorations` (index), `/explorations/<slug>`, unknown slug shows not-found; new files explorations-index, exploration-page, exploration-not-found. `/background` dropped. No lint boundary rule. Deviation from the proposal: `Exploration` carries a module-level `lazy` `Page` instead of a `load` function because react-hooks lint forbids creating the lazy component during render. CLAUDE.md updated. Verified in the browser; format, lint, typecheck, coverage (design 100%) and build green.

### [2026-10-23 08:44:20] User
Shared-component question (ErrorMessage, Message duplicates; others?), then "take care of all 3".

### [2026-10-23 08:44:20] Decision
Added to packages/ui: `Message` (tone muted|error, fill, action; lowercases its text; replaces web `Message`, Electron `ErrorCard`, design not-found card and the loading fallback), `useGridLattice` (ref + cell + onCellChange, `enabled` flag; used by web cache-note-grid and electron sync-grids) and `DEFAULT_NOTE_COLOR` (replaces the NOTE_COLOR copies). Deleted web message.tsx and electron error-card.tsx with their tests; added ui tests for Message and useGridLattice; updated web/electron/design tests and CLAUDE.md. Lint rule `react-hooks/refs` needed the hook result destructured before passing ref. Format, lint, typecheck, build and coverage green.

### [2026-10-23 08:55:17] User
Wants components/ and hooks/ used consistently with tests mirroring. Answers: 1. yes, lib for the rest; 2. exclude design entirely; 3. just record the layout in CLAUDE.md.

### [2026-10-23 08:55:17] Decision
Moved files (git mv, imports and vi.mock paths rewritten by script): web cache-note-grid -> components/, query-client -> lib/; Electron renderer folder-card, status-grid, sync-grids -> components/, use-scan, use-sync -> hooks/, error-message, sync-layout -> lib/; ui use-dot-lattice, use-element-size, use-grid-lattice -> hooks/ (lib keeps fake-notes, note-grid-layout, pixel-glyphs, pixel-logo, utils). Tests mirror under tests/{components,hooks,lib} (Electron's under tests/renderer/). apps/design and Electron src/main untouched. CLAUDE.md records the layout; no lint rule. Format, lint, typecheck, build and coverage green.

### [2026-10-23 08:59:07] User
/create-complete

### [2026-10-23 08:59:43] Decision
Session complete. Fresh pnpm coverage passed in all six workspaces (all at or above 95%); summary.md written; README.md updated in the harvest.
