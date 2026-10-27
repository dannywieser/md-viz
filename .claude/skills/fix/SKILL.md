---
name: fix
description: Start a "fix" session - a tracked, conversational investigation of a bug in existing functionality. Same flow as /create, aimed at reproducing and diagnosing. Invoke as /fix <title>.
argument-hint: <title>
disable-model-invocation: true
---

# /fix

Starts a fix session for: **$ARGUMENTS**

A fix session is a create session with `Kind: fix`. It uses the same three phases, folder (`create/`), log, index and scripts; only the content differs. The rules for logging (every turn, numbering kept) are in the `create` skill and apply here.

1. `/fix <title>` - reproduce the bug and find the cause (this skill)
2. `/create-plan` - writes a fix-shaped `plan.md` (it reads the kind from the log header)
3. `/create-complete` - writes a fix-shaped `summary.md`

## Steps

1. If `$ARGUMENTS` is empty, ask the user for a title and stop.
2. Run `bash .claude/skills/create/scripts/new-session.sh --kind fix $ARGUMENTS`. It prints the slug (`YYYYMMDD-xx-fix-<title>`), creates the folder and log (header has `- **Kind:** fix`), adds the index row (`fix: <title>`, status `review`) and records the slug in `create/.current`, and creates and switches to the branch `fix/<slug>`.
3. Tell the user the slug and folder, then ask them to describe the bug.
4. Facilitate the investigation. Ask a few focused questions at a time, covering:
   - the symptom: what was expected and what happens instead (error text, screenshot, log)
   - reproduction: steps, whether it is every time, which app/workspace/data
   - when it started: last known good, a suspect commit or session (`create/` summaries and `git log` help)
   - the likely area of code
   - what is out of scope (fix the bug, no drive-by refactors)
5. Unlike `/create`, do dig into the code in this phase: read the suspect files and `git log`/`git blame`, and reproduce the bug where possible (run the app, the failing test or a small script). Do not change source or write the plan yet.
6. Reflect back a root-cause finding: confirmed, or a hypothesis with how it would be confirmed. When the bug is reproduced (or reproduction is blocked and the user accepts that) and there is a root cause or a testable hypothesis, say so briefly and tell the user they can type `/create-plan`.
