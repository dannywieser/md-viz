---
name: create
description: Start a "create" session - a tracked, conversational design discussion about something to build in this repo. Invoke as /create <title>.
argument-hint: <title>
disable-model-invocation: true
---

# /create

Starts a create session for: **$ARGUMENTS**

A create session has three phases, each driven by the user typing a command:

1. `/create <title>` - discuss and clarify the intent (this skill)
2. `/create-plan` - write `plan.md`, then decide how to implement
3. `/create-complete` - write `summary.md` and close the session

## Steps

1. If `$ARGUMENTS` is empty, ask the user for a title and stop.
2. Run `bash .claude/skills/create/scripts/new-session.sh $ARGUMENTS`. It prints the slug (`YYYYMMDD-xx-<title>`), creates `create/<slug>/` with a `log.md` header, adds the session to the index in `create/README.md` with status `review`, and records the slug in `create/.current`. It also creates and switches to the branch `create/<slug>` (cut from `origin/main`), so everything in the session lands on that branch.
3. Tell the user the slug and folder, then ask them to explain what they want to create in the repo.
4. Facilitate a back-and-forth conversation about the specifics. Ask focused questions (a few at a time, not a wall), reflect back what you understand, surface trade-offs and open questions, and keep the discussion at the level of intent: what, why, scope, constraints, preferred technologies. Do not write implementation code or plan files in this phase. Reading the repo for context is fine.
5. When the intent seems clear, say so briefly and tell the user they can type `/create-plan`.

`/fix <title>` starts the same session with `--kind fix` (branch `fix/<slug>`, slug `YYYYMMDD-xx-fix-<title>`, a `- **Kind:** fix` line in the log header) and has its own discussion prompts; `/create-plan` and `/create-complete` switch to fix templates when they see that line.

`create/README.md` explains the workflow and indexes all sessions. Statuses are `review` (set here), `planned` (set by `/create-plan`) and `complete` (set by `/create-complete`); change one with `bash .claude/skills/create/scripts/set-status.sh <slug> <status>`.

## Git (applies to the whole session)

The session runs on its branch `<kind>/<slug>` and commits itself; the user never has to ask. `bash .claude/skills/create/scripts/session-git.sh` does the git work (`commit "<message>"` stages everything and commits, `push`, `draft-pr`, `ready`); commit messages end with the usual attribution trailer. The moments:

1. `/create-plan` starts: commit the discussion so far, push and open a draft PR (`draft-pr`).
2. The plan is final and the approach chosen: commit `plan.md` and the log, push.
3. Implementation: one commit per plan step, each pushed at once so the PR can be reviewed during this phase (see `/create-plan`).
4. `/create-complete`: final commit, push, `summary.md` becomes the PR description and the PR is marked ready (`ready`).

No commits happen during the first phase, only the log grows.

## Logging (applies to the whole session, all three phases)

The full conversation is preserved in `create/<slug>/log.md`. The active slug is in `create/.current`.

After **every** turn of the session, append to `log.md` (use `date '+%Y-%m-%d %H:%M:%S'` for the timestamp):

```markdown
### [2026-10-15 14:03:22] User
<the user's message, verbatim>

### [2026-10-15 14:03:41] Claude
<your reply, verbatim or faithfully condensed if very long>
```

**Keep numbering in the log.** When you ask questions as a numbered (or lettered) list, the user often answers by number ("1: yes, 2: no"). Condense the text if you must, but keep every question's number or letter label exactly as shown to the user, so each answer in the log can be matched to its question. The same goes for numbered options and steps the user may refer to.

Log the first exchange too (the `/create <title>` command and your opening question). Decisions about how to proceed (e.g. "implement everything", "file by file", step boundaries, steps completed) must be logged under a heading like `### [timestamp] Decision` so the progress trail is recoverable.

If a later user message arrives in this session without a slash command (e.g. answers to your questions, instructions during implementation), keep logging it until `/create-complete` runs.
