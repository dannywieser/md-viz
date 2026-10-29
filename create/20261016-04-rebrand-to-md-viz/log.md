# Create session: rebrand to md-viz

- **Slug:** 20261016-04-rebrand-to-md-viz
- **Started:** 2026.10.16 18:13:25 MDT
- **Completed:** 2026.10.16 18:23:26

---

### [2026.10.16 18:13:33] User
/create rebrand to md-viz

### [2026.10.16 18:13:33] Claude
Session 20261016-04-rebrand-to-md-viz created (create/20261016-04-rebrand-to-md-viz/). The repo currently says "md-insights" in ~45 files (package scope @md-insights/*, CLAUDE.md, READMEs, wordmark/logo, titles, openapi.json, demo notes). Asked: 1) scope of rename (everything vs. keep history logs), 2) wordmark text/pixel glyphs, 3) package scope @md-viz/*, 4) demo content, 5) cache DB filename/other runtime names.

### [2026.10.16 18:14:45] User
1. package name yes
2. no, leave it
3. yes, I want to explore this
4. leave it
5. don't think so

### [2026.10.16 18:14:45] Claude
Noted: rename package scope to @md-viz/*; leave old create/ logs and demo/ untouched; nothing external. Wordmark/logo to be explored (current wordmark is ".md|insights" from glyphs in pixel-glyphs.ts; new needs v and z glyphs). Asking what direction for wordmark/logo.

### [2026.10.16 18:16:11] User
1. I want to explore using `md-viz` with slightly larger grid-filled blocks
2. this can stay
3. need to explore

### [2026.10.16 18:16:11] Claude
Logo icon stays `.md`. Wordmark text `md-viz` (hyphen needs a '-' glyph; v, z too). Asked to clarify "grid-filled blocks": A) each block is a larger cell filled with a mini-grid like the NoteGrid squares, B) blocks with grid-paper lines/hard shadow, C) just bigger cells (6x9 -> larger glyph grid). Proposed doing the exploration as a temporary variants row on the design board (varying block style and accent placement: all-accent, hyphen-only, viz-only) during implementation, then picking one and removing the rest. Asked whether that works and what the hyphen/accent should be.

### [2026.10.16 18:17:03] User
[image: mockup of ".md-viz" as pixel blocks, each block a light-blue diagonal-hatched square with a white outline, on a dark-blue grid whose cells match the block size; hyphen 4 blocks wide at mid x-height; leading dot kept; glyphs narrower than the current 5-wide ones (m is an arch, i has a dot, z is 4 wide with a bottom-left tail)]

### [2026.10.16 18:17:03] Claude
Read the mockup as the target block style (answers 1 as a variant of A/B: hatched, outlined blocks sitting on a grid of the same cell size). Asked: is this the intended look; are colours the mock's blue or the Solarized theme tokens; is the grid part of the wordmark (a framed tile) or just the page grid; keep leading dot and drop the cursor bar; narrower glyph set OK; accent placement still open.

### [2026.10.16 18:17:41] User
that's just an idea, I like your suggestion of having a card on the design board

### [2026.10.16 18:17:41] Claude
Understood: the mockup is only an idea, not the target. Intent: (1) rename @md-insights/* to @md-viz/* and all user-facing "md-insights" text (CLAUDE.md, READMEs, titles, wordmark/logo aria-labels, openapi.json, etc.), leaving create/ history and demo/ untouched; (2) Logo icon keeps ".md"; (3) wordmark text becomes md-viz (new -, v, z glyphs); (4) add a temporary "wordmark variants" card on the design board with several candidates (block style incl. hatched/grid-filled blocks, accent placement, light/dark) for the user to pick from, then keep the chosen one, remove the rest, update guidelines and favicons, and regenerate pnpm-lock. Suggested /create-plan.

### [2026.10.16 18:18:34] User
/create-plan

### [2026.10.16 18:18:34] Claude
Wrote create/20261016-04-rebrand-to-md-viz/plan.md (9 steps: mechanical rename, pnpm install/generate/openapi, new glyphs, temporary wordmark-variants card, pause for choice, implement choice, docs, full checks). Status set to planned. Asked how to proceed: 1) implement everything, pausing only at the variant choice (step 6); 2) step by step; 3) file by file; 4) custom.

### [2026.10.16 18:18:48] User
1

### [2026.10.16 18:18:48] Decision
Implement everything, pausing only at plan step 6 (variant choice).

### [2026.10.16 18:20:11] Claude
Steps 1-5 done. Step 1: sed rename of md-insights -> md-viz in 44 tracked files outside create/, demo/, lockfile. Step 2: pnpm install (lockfile rewritten, no md-insights left), pnpm generate, pnpm openapi. Step 3: typecheck and tests green. Step 4: pixel-glyphs.ts gets -, v, z and drops the unused n, s, g, h, t (kept '|' for variants); wordmark is '.md-viz' with dot and hyphen accented (pixel-logo.ts); tests and Logo section text and guideline wording updated. Step 5: apps/design/src/sections/WordmarkVariants.tsx (temporary) added to App.tsx with six variants a-f (plain/hatched/subdivided blocks x accent placement) on card, grid and dark; verified in the browser. Deviation: removed unused glyphs (not in plan). Paused at step 6 for the user's pick.

### [2026.10.16 18:21:21] User
I really like f

### [2026.10.16 18:21:21] Decision
Variant f: wordmark "md-viz", subdivided 2x2 blocks, viz in primary, no dot.

### [2026.10.16 18:22:35] Claude
Steps 6-9 done. Implemented variant f in packages/ui Wordmark ('md-viz', each cell a 2x2 block of small squares, viz in primary); pixelFill takes an accent string (Logo passes '.'); removed the '|' glyph and its gap rule, and the temporary WordmarkVariants card; updated wordmark/glyph tests, design Logo section text, the pixel logo guideline (example now '.md · md-viz') and CLAUDE.md. format, lint, typecheck and tests all pass; design board checked in the browser (console errors seen were transient HMR from mid-edit states). Deviation: removed '|' glyph (unused after choice). Nothing committed. Ready for /create-complete.

### [2026.10.16 18:23:26] User
commit and /create-complete

### [2026.10.16 18:23:26] Decision
Session complete. Writing summary.md, harvest (CLAUDE.md logo bullet already updated during the session; README needed nothing), then committing everything including the session folder.
