# Create session: refactor: extract syncing logic into package

- **Slug:** 20261027-02-refactor-extract-syncing-logic-into-package
- **Started:** 2026-10-27 08:04:24 MDT

---

### [2026-10-27 08:04:32] User
/create refactor: extract syncing logic into package

### [2026-10-27 08:04:32] Claude
Started the session (slug 20261027-02-refactor-extract-syncing-logic-into-package). I read apps/electron/src/main: sync.ts (syncNotes pipeline), notes.ts (Note, noteToFields), note-sets.ts, the loaders (load-file-notes, load-bear-notes, bearcli, walk) and ipc.ts. Asked the user to explain the intent, with focused questions: 1 what the package is for (reuse by another app, e.g. a CLI/headless sync or the cache service?), 2 scope (only syncNotes/Note/note-sets, or the loaders too), 3 name and Electron-free requirement, 4 what stays in Electron (state.ts, ipc, scan), 5 build/tests/coverage conventions.

### [2026-10-27 08:07:55] User
1. a CLI is the goal, but implementation of that is not in scope here. Primarily I would like to keep the logic directly in the electron app as light as possible.
2. probably b? does the goal of a CLI app which does the same thing help with this decision?
3. this is correct
4. package owns types
5. if we have another app like a CLI, it would also need state so I think that belongs with the package
6. tests follow code into package

### [2026-10-27 08:07:55] Claude
Yes, the CLI goal settles 2: option b (loaders, bearcli, walk, scan), since a CLI needs to load and count notes too. Read state.ts, scan.ts, ipc.ts. Proposed: (1) the orchestration in ipc.ts (target validation, load per source, syncNotes, record state, selectionOf) moves into the package as a few functions taking a state file path and cache URL, so Electron's ipc.ts only forwards and sends progress events; (2) types owned by the package: Source, SyncTarget, Scan*, Sync*, NoteRef, LastSync, LastSelection; shared/ipc.ts keeps IPC channels and Api and re-exports; (3) package packages/sync as @md-viz/sync, TS source no build step, Node-only, depends on @md-viz/api-client; electron.vite bundles it into main; (4) state file path is a parameter (Electron passes userData/state.json; CLI default location out of scope); (5) pure move, behavior identical; tests move, package gets 95% thresholds. Open questions: A confirm (1), B confirm (4), C CACHE_URL env default read in package or by caller, D anything else Electron-side to leave.

### [2026-10-27 08:10:21] User
A. moving orchestration makes sense
B. caller should pass in environment
C. let's see what the outcome looks like for the electron client

the plan should include some solid documentation in a README for the new package on the types and workflow that the package implements.

### [2026-10-27 08:10:21] Claude
Intent is clear: A orchestration moves into packages/sync; B caller passes the cache URL (package exports DEFAULT_CACHE_URL, does not read env); C revisit what else moves after seeing Electron's result. The plan must include a solid package README documenting the types and the workflow. Told the user to type /create-plan.

### [2026-10-27 08:10:33] User
/create-plan

### [2026-10-27 08:11:19] Claude
Committed the discussion and opened draft PR https://github.com/dannywieser/md-viz/pull/13. Wrote create/20261027-02-refactor-extract-syncing-logic-into-package/plan.md (10 steps): new packages/sync with exports "." and "./types" (types entry so the web tsconfig never type-checks node sources); move leaf modules, then target.ts and run.ts (orchestration), slim ipc.ts, README step (types + workflow), CLAUDE.md, review of what else could move, final format/lint/typecheck/coverage. Asked how to proceed: 1 implement everything, 2 step by step (pause after each), 3 file by file, 4 custom.

### [2026-10-27 08:12:54] User
1

### [2026-10-27 08:12:54] Decision
Implement everything (all 10 plan steps), one commit per step, no pause between steps.

### [2026-10-27 08:14:32] Claude
Steps 1-3 done. Created packages/sync (package.json, tsconfig, vitest.config, exports "." and "./types"); types.ts holds the moved types, apps/electron/src/shared/ipc.ts re-exports them; electron depends on @md-viz/sync and electron.vite bundles it. git mv'd notes, note-sets, walk, scan, scan-bear, bearcli, load-file-notes, load-bear-notes, state, sync and their tests (walk never had its own test; it is covered via scan) into the package, imports fixed (the scan test's demo path went from four to three levels up). ipc.ts temporarily imports from @md-viz/sync; ipc.test.ts mocks the package at that boundary. Typecheck, lint and tests pass in both workspaces. Deviation: steps 1 and 2 share one commit.
