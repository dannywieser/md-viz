# Plan: design board cleanup and optimize

## Goal

Split the one-page design board into pages behind a top nav, with real routes from react-router, and give the components section a side nav with one richer demo page per shared component (the theme picker included). The design viewer's own light/dark toggle goes; instead the nav carries the shared `ThemeSelect`, so every page can be seen in all nine themes. Pages use more of the window width, and the page-wide dot background goes: demos that need the dots sit on a `bg-dots` box.

## Scope

In:
- `apps/design`: routing (react-router), top nav, page split, colors page, components section with side nav and one page per component, wider layout, plain page background, removal of `theme.ts` and the dark toggle, tests, board guideline wording where it mentions dots or dark mode.
- Dropping `max-w-5xl` from the explorations index / not-found pages too, for consistency.

Out:
- Performance work (bundle size, rendering).
- Changes to `packages/ui` components or tokens. The `.dark` tokens stay in `globals.css`; the viewer just stops using them. The logo page's "dark" wordmark sample is replaced by a theme-switchable one (see risks).
- Restructuring the explorations themselves (folders, registry shape); only their links change to router links.
- Page-level SSR / production hosting of the design app (still a dev tool; the Vite dev server already falls back to `index.html`).

## Technologies

- `react-router` (v7, declarative mode: `BrowserRouter`, `Routes`, `NavLink`, `Outlet`, `Link`; the version is pinned exactly when added): already decided, replaces the hand-written `route.ts`.
- `@md-viz/ui` `useTheme` + `ThemeSelect`, the same pair and `md-viz-theme` storage the apps use.
- Existing stack: React 19, Vite, Tailwind v4, Vitest + Testing Library.

## Routes

| path | page |
| --- | --- |
| `/` | redirect to `/guidelines` |
| `/guidelines`, `/logo`, `/typography`, `/spacing`, `/grid` | one section each |
| `/colors` | palette + all themes (no theme switcher in effect: it shows every theme) |
| `/components` | redirect to the first component |
| `/components/:slug` | one component page; unknown slug shows the not-found card |
| `/explorations`, `/explorations/:slug` | as today |
| anything else | not-found card |

Top nav (`NavLink`s in the app header area): guidelines, logo, colors, typography, spacing, grid, components, explorations; `ThemeSelect` at the right. Components layout: a side nav listing the components next to an `Outlet`.

Components (one page each, in this order): theme-select, button, select, card, app-header, loader, empty-state, error-state, state-block, progress-bar, note-grid. Each page has a heading, a sentence about what it is and demos that cover its variants / states (the note-grid page takes over `note-grid-demo.tsx`).

## Repository structure (`apps/design`)

```
src/
  main.tsx                      BrowserRouter around App
  app.tsx                       layout + <Routes>
  nav.tsx                       top nav (links + ThemeSelect)
  pages/                        one thin page per top-nav entry
    colors-page.tsx
  component-pages/
    registry.ts                 slug, title, lazy-free Page for each component
    components-layout.tsx       side nav + Outlet
    components-redirect.tsx     /components -> first component
    component-route.tsx         :slug -> page or not found
    theme-select-page.tsx  button-page.tsx  select-page.tsx  card-page.tsx
    app-header-page.tsx  loader-page.tsx  empty-state-page.tsx  error-state-page.tsx
    state-block-page.tsx  progress-bar-page.tsx  note-grid-page.tsx
    demo-box.tsx                bg-dots box components sit on
    page-heading.tsx            shared title + description
  sections/                     stays (guidelines, logo, palette, themes, typography, spacing, grid)
  explorations/                 unchanged except links
  route.ts, theme.ts, board.tsx removed
tests/                          mirrors src
```

## Files

Create: everything listed above under `src/pages`, `src/component-pages`, `src/nav.tsx`, with a test file each in `tests/` mirroring `src/`.

Modify:
- `package.json` - add `react-router`.
- `src/main.tsx`, `src/app.tsx` - router and layout; no dark toggle; `useTheme` from `@md-viz/ui` called once in `App`.
- `src/index.css` - plain page background (override the body's `bg-dots` from `globals.css`).
- `src/sections/*.tsx` - drop the `Section` card wrapper width assumptions if needed; logo page: replace the `dark` wordmark with theme-following samples; move `components.tsx` demos into the component pages and delete it; `note-grid-demo.tsx` becomes `note-grid-page.tsx`.
- `src/sections/guidelines.tsx` - wording for the dot grid / dark mode if it describes the viewer.
- `src/explorations/explorations-index.tsx`, `exploration-not-found.tsx`, `exploration-page.tsx` - router `Link`s, wider layout; registry unchanged.
- `src/explorations/*` pages using `min-h-screen bg-background` keep working on a plain background.
- `tests/app.test.tsx`, `tests/explorations/*.test.tsx`, section tests - updated for the router.

Delete: `src/route.ts`, `src/theme.ts`, `src/board.tsx`, `src/sections/components.tsx`, and their tests (`route.test.ts`, `theme.test.ts`, `board.test.tsx`, `components.test.tsx`).

## Steps

1. Add `react-router`; wrap `App` in `BrowserRouter` in `main.tsx`; build `nav.tsx` (top nav + `ThemeSelect` via `useTheme` from `@md-viz/ui`) and the new `app.tsx` with `<Routes>` for the section pages, redirects, explorations and not found. Remove `theme.ts` and the dark toggle. Tests: `nav`, `app` (routes render the right page, active link, theme change wired).
2. Move the explorations onto the router: `Link`s in the index and not-found card, `useParams` for the slug (replaces `findExploration` routing in `route.ts`). Delete `route.ts` and `board.tsx`. Tests updated.
3. Colors page: palette + themes together; the other section pages stay as they are. Test for the page.
4. Layout and background: drop `max-w-5xl` for a wider content area (small side padding, matches the header's `mx-4`), plain page background in `index.css`, `DemoBox` (`bg-dots bg-background` box) for demos that need the dots; logo page samples use it and follow the theme instead of the `dark` class. Tests for `demo-box` and the changed pages.
5. Components section: `registry.ts`, `components-layout.tsx` (side nav), `components-redirect.tsx`, `component-route.tsx` (unknown slug -> not found), `page-heading.tsx`. Tests for each.
6. Component pages, in registry order, each with richer demos and a test: theme-select (with the nine themes, live switching of a local preview via `ThemeSelect` and the current theme), button, select, card, app-header, loader (every fill), empty-state (full, compact), error-state (with detail, retry, action), state-block (floating, `fill`), progress-bar (several values, empty, full), note-grid (the existing demo: presets, slider, label, states, tag stripes). Delete `sections/components.tsx` and `note-grid-demo.tsx` with their tests.
7. Update the design board guidelines text and `CLAUDE.md` (`apps/design` description: router, pages, component pages, no dark toggle, how to add a component page) to match.
8. Final: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm coverage`; every workspace at 95% or above (design included, since it loses and gains many files). Check the pages in the browser at `pnpm dev:design` (all themes, narrow and wide windows).

## Tests

One test file per new or changed source file, mirroring `src/` (convention in `CLAUDE.md`); mock only boundaries (`@md-viz/ui` hooks where needed), rendering small real children otherwise; routing tests use `MemoryRouter`. `App` tests only check composition.

## Open questions / risks

- Typography, spacing and grid are three top-nav items; with the other five that makes eight, which should still fit. If it gets crowded they merge into one "foundations" page later.
- The logo page currently shows a wordmark on a `dark` card. With the toggle gone it shows the wordmark on the card and on the dots in the current theme instead; the dark-mode `.dark` tokens in `globals.css` are left unused by the viewer (not removed, as out of scope).
- The nav and the floating `AppHeader` both want to be sticky at the top: the plan puts the nav inside the header's children area; if eight links plus the select are too wide for the header on narrow windows, the nav moves to a row of its own below it. Decided during step 1 when seen in the browser.
- react-router version: pinned when added in step 1 to the latest 7.x; `unicorn`/lint rules for the new `.tsx` files are checked in step 8.
