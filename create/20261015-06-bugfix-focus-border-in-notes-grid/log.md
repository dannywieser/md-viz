# Create session: bugfix: focus border in notes grid

- **Slug:** 20261015-06-bugfix-focus-border-in-notes-grid
- **Started:** 2026.10.15 19:55:19 MDT
- **Completed:** 2026.10.15 20:08:33

---

### [2026.10.15 19:55:33] User
/create bugfix: focus border in notes grid

when a grid square is on the edge of the grid, the border of the grid blends with the border focus on the square

### [2026.10.15 19:55:33] Claude
Session started: `20261015-06-bugfix-focus-border-in-notes-grid` (folder `create/20261015-06-bugfix-focus-border-in-notes-grid/`). The script produced a malformed slug from the multi-line title (newlines in the folder name), so I renamed it and fixed README, .current and this log header.

Findings: in `packages/ui/src/components/note-grid.tsx` the grid border (`.note-border`) and the hover/focus outline (`.note-hover`) are both 2px solid `#000` (globals.css), so on an edge cell the two merge into one thick line.

Questions:
1. By "focus" do you mean the hover outline (the only one that exists now), or also keyboard focus? Cells aren't focusable today.
2. Preferred fix: (a) give the focus outline a distinct colour (e.g. a theme accent) so it reads against the black border; (b) draw it inset so it never overlaps the border; (c) keep black but thicker/offset on edge cells only.
3. Should the colour follow the Solarized theme tokens (and work in dark mode, where the border is also #000)?

### [2026.10.15 19:57:01] User
1. yes, hover
2. b, and I think I want it thicker so it stands out - even escaping the grid border
3. same color as it is now

### [2026.10.15 19:57:01] Claude
Understood: hover only; keep black (#000) in both themes; outline thicker than the 2px grid border. Open question (4): "inset" and "escaping the grid border" pull in different directions. Options: (a) outline drawn fully inside the cell, thicker (e.g. 3-4px), never touching the border; (b) outline centred on the cell edge, thicker, so on edge cells it extends past the grid border to the outside; (c) mix: inset on interior cells, extends outward on edge cells. Which one? Also, the SVG would need a few px of padding so an outward outline isn't clipped.

### [2026.10.15 19:57:58] User
I think b but I'd need to see it

### [2026.10.15 19:57:58] Claude
Intent is clear enough: option (b), thicker black hover outline centred on the cell edge so it extends past the grid border on edge cells, with SVG padding to avoid clipping. Since the exact thickness needs eyeballing, the plan will implement it with a single thickness constant, run it in the dev server, and tune with the user before finishing. Told the user to type /create-plan.

### [2026.10.15 19:58:23] User
/create-plan

### [2026.10.15 19:58:23] Claude
Wrote plan.md: raise `.note-hover` stroke width (start 4px, black), add `overflow-visible` to the grid SVG so edge outlines aren't clipped, add a test, tune visually in the dev server, check guidelines, run format/lint/typecheck/test. Risk: ancestor overflow clipping on the landing-page card. Status set to planned. Asked how to proceed: (1) implement everything, (2) step by step, (3) file by file, (4) custom.

### [2026.10.15 19:58:23] Decision
Plan created (plan.md); awaiting choice of approach.

### [2026.10.15 19:58:53] User
1

### [2026.10.15 19:58:53] Decision
Implement everything (option 1), then show the result to tune thickness.

### [2026.10.15 19:59:19] Claude
Implemented plan steps 1-3, 5, 6: `.note-hover` stroke-width 2 -> 4 (globals.css), `className="overflow-visible"` on the grid svg (note-grid.tsx), new test in note-grid.test.tsx. Guidelines don't mention the outline, so no change. format/lint/typecheck/test all pass. Dev server running on :5173 for tuning (step 4); screenshots were too small to judge thickness, so user to eyeball. No deviations from plan.md.

### [2026.10.15 20:00:24] User
I like the width, but I think we'll just have the change the color so it's not exact with the grid border.

### [2026.10.15 20:00:24] Decision
Keep 4px; change `.note-hover` stroke from #000 to `var(--ring)` (Solarized blue) so it differs from the black border. Deviates from earlier "same color" answer (3) at the user's request. Colour is easy to swap if they prefer another.

### [2026.10.15 20:01:30] User
to me that's too close to the colors of the cells. I think a grey-ish color

### [2026.10.15 20:01:30] Decision
`.note-hover` stroke changed from `var(--ring)` to `var(--sol-base01)` (Solarized grey), width stays 4px.

### [2026.10.15 20:02:30] User
let's try the theme blue

### [2026.10.15 20:02:30] Decision
`.note-hover` stroke back to `var(--ring)` (theme Solarized blue), 4px.

### [2026.10.15 20:03:19] User
yeah, too close. show me what it looks like to ditch the border on the grid

### [2026.10.15 20:03:19] Decision
Experiment (not final): removed the `.note-border` rect from note-grid.tsx and set `.note-hover` back to #000, 4px. Tests asserting the border will fail until decided.

### [2026.10.15 20:04:24] User
ok, that's the ticket.

### [2026.10.15 20:04:24] Decision
Final: no grid border; hover outline 4px black. Removed `.note-border` CSS, updated note-grid tests (border test now asserts none; renamed sizing test). Deviates from plan.md (which kept the border and changed only the outline width/overflow); plan to be noted in the summary. format/lint/typecheck/test pass.

### [2026.10.15 20:04:49] User
show me a 12 px border on the card

### [2026.10.15 20:04:49] Decision
Experiment (not final): apps/web/src/App.tsx card given `border-[12px]`, CARD_INSET 25 -> 36. Revert or keep on user's call.

### [2026.10.15 20:04:54] User
show me a 12 px border on the card

### [2026.10.15 20:04:54] Decision
Experiment (not final): apps/web/src/App.tsx card given `border-[12px]`, CARD_INSET 25 -> 36. Revert or keep on user's call.

### [2026.10.15 20:05:21] User
oops, not that. I meant padding for the grid

### [2026.10.15 20:05:21] Decision
Reverted the 12px border. Experiment: card padding p-6 (24px) -> p-3 (12px), CARD_INSET 25 -> 13, in apps/web/src/App.tsx.

### [2026.10.15 20:06:31] User
I guess I meant 12 "units"

### [2026.10.15 20:06:31] Decision
Experiment: card padding p-12 (48px, Tailwind 12 units), CARD_INSET 49, in apps/web/src/App.tsx.

### [2026.10.15 20:07:20] User
try p-6

### [2026.10.15 20:07:20] Decision
p-6 is the original padding; reverted apps/web/src/App.tsx to its committed state (p-6, CARD_INSET 25). Padding experiments ended with no change to the app.

### [2026.10.15 20:07:33] User
now p-4

### [2026.10.15 20:07:33] Decision
Experiment: card padding p-4 (16px), CARD_INSET 17, in apps/web/src/App.tsx.

### [2026.10.15 20:07:53] User
ok, p-4 is right

### [2026.10.15 20:07:53] Decision
Final: card padding p-4, CARD_INSET 17. format/lint/typecheck/test pass.

### [2026.10.15 20:08:33] User
/create-complete

### [2026.10.15 20:08:33] Claude
Wrote summary.md, harvested into CLAUDE.md (NoteGrid bullet), marking the session complete.

### [2026.10.15 20:08:33] Decision
Session complete
