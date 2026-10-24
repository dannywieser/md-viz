# Fix session: tooltips flowing off screen

- **Slug:** 20261024-01-fix-tooltips-flowing-off-screen
- **Kind:** fix
- **Started:** 2026-10-24 16:37:54 MDT

---

### [2026-10-24 16:38:30] User
/fix tooltips flowing off screen

### [2026-10-24 16:38:30] Claude
Started fix session `20261024-01-fix-tooltips-flowing-off-screen` (folder `create/20261024-01-fix-tooltips-flowing-off-screen/`).

Initial finding (from code, not yet reproduced in the browser): the only tooltip is the `role="tooltip"` div in `packages/ui/src/components/note-grid.tsx` (~line 163). It is `absolute`, centred on the hovered cell (`-translate-x-1/2`, `left = cellX + cell/2`), placed above it (`-translate-y-full`, `top = cellY - 8`), `whitespace-nowrap`, with no collision handling. So it overflows the viewport horizontally for cells in the first/last columns with a long title, and vertically for cells in the top row when the grid is near the top of the page.

Questions:
1. Where do you see it: web app, Electron app, or both? Left/right edge, top, or all?
2. Expected behaviour: keep it on screen by shifting/flipping (below the cell when no room above), and/or wrap/truncate very long titles?
3. Anything out of scope (e.g. restyling the tooltip)?

### [2026-10-24 16:41:10] User
1. both, on the left and right edges
2. adjust based on the position: left edge flows to right, right edge flows to left. others can be centerd
3.  no, happy to explore other options

### [2026-10-24 16:41:10] Claude
Root-cause hypothesis (unchanged, now scoped to the horizontal axis): the tooltip is always centred on the hovered cell (`-translate-x-1/2`) with no knowledge of the viewport, so near the left/right edge half its width falls off screen. Confirm by hovering a first/last-column cell with a long title in web and Electron.

Fix options for the plan:
A. Column-based: anchor left-aligned (flows right) for the first columns, right-aligned (flows left) for the last, centred otherwise. Simple but a guess: the threshold depends on title length and the grid may not touch the viewport edge.
B. Measure-based: after render, measure the tooltip and the viewport (or the grid block) and pick start / centre / end alignment so it fits. Matches the "flows right/left, otherwise centred" rule exactly. Costs one layout effect on a single shared tooltip, which fits the per-item rule.
Leaning B. Scope: horizontal only; vertical (top row) left alone unless you say otherwise.

### [2026-10-24 16:43:00] User
B

### [2026-10-24 16:43:00] Decision
Option B (measure-based alignment of the shared tooltip against the viewport; start / centre / end; horizontal only). Next: `/create-plan`.

### [2026-10-24 16:45:00] User
/create-plan

### [2026-10-24 16:46:00] Claude
Wrote `plan.md` (fix template): hypothesis confirmed from code, option B (measure + shift the shared tooltip horizontally, pure `tooltipShift` helper in `packages/ui/src/lib`), 6 steps starting with repro and a regression test and ending with `pnpm coverage` >= 95%. Status set to `planned`. Asked how to proceed: 1. implement everything, 2. step by step (pause after each), 3. file by file, 4. custom.

### [2026-10-24 16:50:00] User
1

### [2026-10-24 16:50:00] Decision
Implement everything (option 1), following plan.md steps 1-6.

### [2026-10-24 16:58:00] Claude
Implemented the plan.
- Step 1 (repro): the design board's short fake titles and centred grid never clip, even at a narrow viewport, so a browser repro was not possible with that data. Deviation: the regression tests (stubbed tooltip rect) stand in for the repro.
- Steps 2-4: added `packages/ui/src/lib/tooltip-shift.ts` + `tests/lib/tooltip-shift.test.ts`; `note-grid.tsx` got a tooltip ref and a layout effect that measures it and sets `marginLeft` (8px window margin); 3 regression tests in `tests/components/note-grid.test.tsx` (left overflow, right overflow, fits). Without the `note-grid.tsx` change the 3 tests fail; with it they pass.
- Step 6: `pnpm format`, `pnpm lint`, `pnpm typecheck` and `pnpm coverage` all pass; every workspace is at or above 95%.
Nothing committed.

### [2026-10-24 17:05:00] User
/create-complete and post pr

### [2026-10-24 17:10:00] Decision
Session complete. Coverage re-run, summary written, CLAUDE.md updated. Opening a PR as requested.
