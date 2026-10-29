# Summary: bootstrap electron app

- **Slug:** 20261016-01-bootstrap-electron-app
- **Started:** 2026.10.16
- **Completed:** 2026.10.16

## Overview

Added `apps/electron`, a new Electron desktop app built with electron-vite on the same React + Tailwind + `@md-insights/ui` stack as the web app. It is a hello world that proves the foundations: choose a folder, scan it recursively in the main process, show the number of `.md` files with live progress. Along the way it set up the typed IPC pattern (invoke calls plus a main-to-renderer event) that later work will use to load notes from disk and upload them to the planned cache service. A committed `demo/` notes folder serves as the scan target and test fixture.

## What was done

- **`apps/electron`** (`@md-insights/electron`): electron-vite config, two tsconfigs (node and web), vitest config.
  - `src/shared/ipc.ts`: channel names, `ScanProgress`, `ScanResult`, `Api` (`pickFolder`, `scanFolder`, `onScanProgress`).
  - `src/main`: `index.ts` (hardened window: contextIsolation, sandbox, no nodeIntegration; denies window.open and navigation), `ipc.ts` (handlers with absolute-path and is-directory validation), `scan.ts` (recursive `.md` count, skips dot-directories and `node_modules`, throttled progress).
  - `src/preload/index.ts`: exposes `window.api` through `contextBridge` (CommonJS output).
  - `src/renderer`: strict CSP, themed UI with header, "choose folder" button, path, progress and count.
  - `tests/main/scan.test.ts` (4 tests) and `tests/renderer/App.test.tsx` (5 tests).
- **`demo/`**: 18 counted notes in `projects/`, `journal/`, `reference/` plus wikilinks, relative links, `.txt`/`.svg` files and a `.hidden/` dir (2 uncounted notes).
- **Repo wiring**: root `pnpm dev:electron`, `out/` in `.gitignore`, lockfile.
- **Verification**: format, lint, typecheck, test and build all pass repo-wide. The running app was driven over the DevTools protocol: themed UI renders, no console or CSP errors, `window.api` exposes exactly three members, renderer has no `require`/`process`, `scanFolder(demo)` returns 18 with progress events, a relative path is rejected.

## Highlights

- electron-vite chosen after comparing it with Electron Forge and plain Vite + electron-builder; it is dev/build tooling only, so app code is unaffected if it is swapped. The first implementation served as the spike.
- Packaging deferred; electron-builder (or Forge) can be added later without restructuring.
- Scope grew deliberately: IPC foundation, folder picker, scan progress event and the demo notes folder.
- Two tsconfigs plus split test folders keep node and DOM types apart; typed ESLint works with that layout.
- Sandboxed preload scripts cannot be ESM, so the preload builds as `.cjs`.
- Worked step by step with a commit after each step.

## Deviations from the plan

- Tests split into `tests/main` and `tests/renderer` (plan had flat `tests/`), so each tsconfig sees only its environment.
- `Api` members are function-typed properties instead of methods, to satisfy the `unbound-method` lint rule.
- The plan expected `pnpm-workspace.yaml` to need `onlyBuiltDependencies` for Electron. It did not: Electron 44 downloads its binary lazily on first run. The allowlist was added in step 1 and removed again at the end.
- `README.md` of `demo/` counts as one of the 18 notes.

## Not done / follow-ups

- The native folder dialog click was not exercised by automation; try it by hand with `pnpm dev:electron`.
- Port clash: the web app and the Electron renderer dev server both use 5173, so they cannot run at the same time.
- Packaging, signing, window icon.
- Reading note contents, parsing, uploading to the cache service (and, when contents are read, restricting main to paths it handed out from the picker).
- Possibly reuse `NoteGrid` in the renderer once real notes are loaded.

## Harvest

- **`CLAUDE.md`**: intro now mentions the Electron app; added `pnpm dev:electron` (with the port 5173 clash); `apps/electron` and `demo/` in Structure; two conventions: the Electron IPC rules (shared contract, security flags, CommonJS preload, function-typed `Api`) and the two-tsconfig/test-folder split plus lazy binary download.
- **`README.md`**: intro, `pnpm dev:electron` in Getting started and Commands (with the port note and the demo count hint), and `apps/electron` and `demo/` in Layout.
