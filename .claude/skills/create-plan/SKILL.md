---
name: create-plan
description: Turn the intent discussed in the current /create session into plan.md, then ask how to proceed with implementation.
disable-model-invocation: true
---

# /create-plan

Writes the plan for the active create session and decides how implementation proceeds.

## Steps

1. Read `create/.current` to get the slug. If it is missing or the folder doesn't exist, tell the user to run `/create <title>` first and stop.
2. Read `create/<slug>/log.md` (the full conversation so far) and any other documents in the session folder. Append this `/create-plan` invocation to the log (format in the `create` skill, including keeping the numbering of any questions or options).
3. Look at the current repo structure so the plan fits what exists.
4. Write `create/<slug>/plan.md` containing:
   - **Goal** - one short paragraph of the intent
   - **Scope** - what is in and explicitly out
   - **Technologies** - languages, frameworks, libraries, tools, and why
   - **Repository structure** - the directory tree to be created or changed
   - **Files** - every file to create or modify, with a one-line purpose each
   - **Steps** - an ordered, numbered implementation sequence, each small enough to review. For any session that adds or changes code the plan must include: a unit test for every new or changed source file (per the testing conventions in `CLAUDE.md`), and a final step that runs `pnpm coverage` and brings every workspace to at least 95% (lines, statements, branches, functions). A plan without these steps is incomplete.
   - **Open questions / risks** - anything unresolved (ask the user before writing if it blocks the plan)
5. Run `bash .claude/skills/create/scripts/set-status.sh <slug> planned` to mark the session in the `create/README.md` index.
6. Summarize the plan to the user in a few lines and point at `plan.md`. Let them request changes; revise `plan.md` and log each revision.
7. Then ask how to proceed. Offer options such as: implement everything; step by step (pause after each numbered step); file by file; or a custom approach.
8. Log the plan creation and the chosen approach as `### [timestamp] Decision` entries in `log.md`.

## During implementation

Follow the chosen approach exactly. After each step or file, append to `log.md` what was done (files touched) and any deviations from `plan.md`. If you deviate or the user changes direction, log the decision and update `plan.md` if the change is material. Keep logging every user/Claude exchange as described in the `create` skill, including its rule to keep the numbering of questions and options so the user's answers by number stay matched to them.

Before declaring the work done, run `pnpm coverage` yourself and fix any workspace under 95%; `/create-complete` re-checks and reports it. When the work is done, tell the user they can type `/create-complete`.
