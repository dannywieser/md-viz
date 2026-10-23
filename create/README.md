# create

A lightweight, tracked way to design and build something in this repo by talking it through with Claude first. Each piece of work is a **session**: a folder in `create/` holding the conversation, the plan and a summary, so the reasoning behind the code is never lost.

Sessions are driven by three slash commands, defined in `.claude/skills/`:

| Command | Phase | Produces |
| --- | --- | --- |
| `/create <title>` | Discuss and clarify the intent: what, why, scope, constraints. No code yet. | `log.md`, index entry (`review`) |
| `/create-plan` | Write the plan (with unit tests and a 95% coverage step), then choose how to implement it (everything, step by step, file by file). Implementation follows. | `plan.md`, status `planned` |
| `/create-complete` | Re-run and report coverage (95% per workspace), write the summary, fold lessons back into `CLAUDE.md` / `README.md`, close the session. | `summary.md`, status `complete` |

## Session folder

Each session lives in `create/YYYYMMDD-xx-<title>/` (`xx` is the day's sequence number):

- `log.md` - the full conversation and every decision, timestamped. Numbered questions keep their numbers so answers stay matched to them.
- `plan.md` - goal, scope, technologies, structure, files, ordered steps, open questions.
- `summary.md` - what was done, highlights, deviations from the plan, follow-ups and what the harvest changed in the docs.

`create/.current` (git-ignored) names the active session.

## Statuses

| Status | Meaning | Set by |
| --- | --- | --- |
| `review` | Intent is being discussed and clarified | `/create` |
| `planned` | `plan.md` written; implementation under way or ready | `/create-plan` |
| `complete` | Work done and `summary.md` written | `/create-complete` |

Status changes are made with `bash .claude/skills/create/scripts/set-status.sh <slug> <status>`; the index row is added by `new-session.sh`.

## Index

New sessions are appended to the bottom of this table.

| Session | Title | Status | Started |
| --- | --- | --- | --- |
| [20261015-01-repo-bootstrap](20261015-01-repo-bootstrap/) | repo bootstrap | complete | 2026-10-15 |
| [20261015-02-design-system-and-viewer-application](20261015-02-design-system-and-viewer-application/) | design system and viewer application | complete | 2026-10-15 |
| [20261015-03-note-visualization-grid](20261015-03-note-visualization-grid/) | note visualization grid | complete | 2026-10-15 |
| [20261015-04-app-logo-and-icon](20261015-04-app-logo-and-icon/) | app logo and icon | complete | 2026-10-15 |
| [20261015-05-notes-grid-into-web-app](20261015-05-notes-grid-into-web-app/) | notes grid into web app | complete | 2026-10-15 |
| [20261015-06-bugfix-focus-border-in-notes-grid](20261015-06-bugfix-focus-border-in-notes-grid/) | bugfix: focus border in notes grid | complete | 2026-10-15 |
| [20261016-01-bootstrap-electron-app](20261016-01-bootstrap-electron-app/) | bootstrap electron app | complete | 2026-10-16 |
| [20261016-02-note-cache-service](20261016-02-note-cache-service/) | note cache service | complete | 2026-10-16 |
| [20261016-03-generated-api-client](20261016-03-generated-api-client/) | generated api client | complete | 2026-10-16 |
| [20261016-04-rebrand-to-md-viz](20261016-04-rebrand-to-md-viz/) | rebrand to md-viz | complete | 2026-10-16 |
| [20261022-01-web-app-displays-notes-from-cache](20261022-01-web-app-displays-notes-from-cache/) | web app displays notes from cache | complete | 2026-10-22 |
| [20261022-02-electron-app-syncs-notes-to-cache](20261022-02-electron-app-syncs-notes-to-cache/) | electron app syncs notes to cache | complete | 2026-10-22 |
| [20261022-03-design-exploration-for-background](20261022-03-design-exploration-for-background/) | design exploration for background | complete | 2026-10-22 |
| [20261023-01-electron-app-ux-improvements](20261023-01-electron-app-ux-improvements/) | electron app UX improvements | complete | 2026-10-23 |
| [20261023-02-refactor-for-components-and-tests](20261023-02-refactor-for-components-and-tests/) | refactor for components and tests | complete | 2026-10-23 |
