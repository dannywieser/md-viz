---
name: create-complete
description: Close the current /create session by writing a concise summary.md of the work done and session highlights.
disable-model-invocation: true
---

# /create-complete

Finishes the active create session.

## Steps

1. Read `create/.current` to get the slug. If it is missing or the folder doesn't exist, tell the user there is no active create session and stop.
2. Read `create/<slug>/log.md` and `create/<slug>/plan.md` (if present). Check the repo (`git status`, `git diff --stat`) to confirm what actually changed rather than trusting the plan alone.
3. Append this `/create-complete` invocation to `log.md` (format in the `create` skill, including keeping the numbering of any questions or options).
4. **Coverage check.** Run `pnpm coverage` fresh (never reuse an earlier run) and read the per-workspace figures (statements, branches, functions, lines). Double-check them: confirm every workspace ran (apps/cache, apps/design, apps/electron, apps/web, packages/api-client, packages/ui), that the command exited 0, and that the 95% thresholds in the vitest configs are still in place. If any figure is under 95%, or a threshold was lowered or an exclusion added to dodge it, fix it (add tests) and re-run, or tell the user plainly why not and stop for their decision. Keep the table for `summary.md` and the final message. Sessions that changed no code still run it and report the numbers.
5. Write `create/<slug>/summary.md`, clear and concise, with:
   - **Title and slug**, start and completion dates
   - **Overview** - what was created and why, in a short paragraph
   - **What was done** - files and structures created or changed (grouped, not exhaustive prose)
   - **Highlights** - key decisions, trade-offs, notable discussion points from the session
   - **Coverage** - the table of per-workspace statements / branches / functions / lines from step 4, and the 95% threshold
   - **Deviations from the plan** - if any
   - **Not done / follow-ups** - anything left open
6. **Harvest.** Review the finished output (summary, log, plan and the actual repo changes) and decide whether `CLAUDE.md` or `README.md` needs updating. This always runs; the outcome may be "no changes".
   - Read both files first. Look for things a future session or contributor would need that the files don't already say: new or changed commands, workspaces or directory structure, conventions and tooling decisions, pinned versions and the reason, gotchas hit during the session, setup steps, or statements that are now stale or wrong.
   - Apply the updates directly, keeping each file's existing style and brevity. `CLAUDE.md` holds instructions and conventions for working in the repo; `README.md` holds what the project is and how to set it up and use it. Don't duplicate what the code or git history already records, and don't record session-specific detail (that belongs in `summary.md`).
   - Add a **Harvest** section to `summary.md` listing what was changed in each file and why, or stating that nothing needed updating. Run `pnpm format` if any file was edited.
7. Append a final `### [timestamp] Decision` entry to `log.md`: "Session complete", then add a `- **Completed:** <timestamp>` line to the log header.
8. Run `bash .claude/skills/create/scripts/set-status.sh <slug> complete` to mark the session in the `create/README.md` index, then delete `create/.current` so no session is active.
9. Tell the user the session is complete and link `summary.md`. Report the coverage figures per workspace (from step 4) in the message itself, not only in the summary. Note any `CLAUDE.md` / `README.md` updates from the harvest. Do not commit unless asked.
