#!/usr/bin/env bash
# Git steps of a create/fix session, on its own branch (<kind>/<slug>).
# Usage: session-git.sh commit "<message>"   stage everything and commit (skips when nothing changed)
#        session-git.sh push                 push the branch (sets upstream)
#        session-git.sh draft-pr             push and open a draft PR against main (once)
#        session-git.sh ready [body-file]    push, set the PR description from body-file (if given) and mark the PR ready
# The active session is the slug in create/.current.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"
slug="$(cat create/.current 2>/dev/null || true)"
[ -n "$slug" ] || {
  echo "no active session (create/.current is missing)" >&2
  exit 1
}

cmd="${1:-}"
case "$cmd" in
  commit)
    msg="${2:-}"
    [ -n "$msg" ] || {
      echo "usage: session-git.sh commit <message>" >&2
      exit 1
    }
    git add -A
    if git diff --cached --quiet; then
      echo "nothing to commit"
    else
      git commit -q -m "$msg"
      git log -1 --format='committed %h %s'
    fi
    ;;
  push)
    git push -q -u origin HEAD
    ;;
  draft-pr)
    git push -q -u origin HEAD
    if gh pr view >/dev/null 2>&1; then
      gh pr view --json url --jq .url
    else
      title="$(sed -n '1s/^# //p' "create/$slug/log.md" | sed -E 's/^Create session: /create: /; s/^Fix session: /fix: /')"
      gh pr create --draft --base main --title "$title" --body "Session [\`$slug\`](create/$slug/): the discussion so far; the plan and implementation follow on this branch."
    fi
    ;;
  ready)
    git push -q -u origin HEAD
    [ -z "${2:-}" ] || gh pr edit --body-file "$2"
    gh pr ready
    gh pr view --json url --jq .url
    ;;
  *)
    echo "usage: session-git.sh commit <message> | push | draft-pr | ready [body-file]" >&2
    exit 1
    ;;
esac
