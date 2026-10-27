#!/usr/bin/env bash
# Creates a new /create session folder: create/YYYYMMDD-xx-<title>/
# Usage: new-session.sh [--kind create|fix] <title words...>
# Prints the slug on stdout. Records it as the active session in create/.current
# It also creates and switches to the branch <kind>/<slug> (cut from origin/main).
# A fix session gets a "fix-" slug prefix and a "Kind: fix" line in its log header.
set -euo pipefail

kind=create
if [ "${1:-}" = "--kind" ]; then
  kind="${2:-}"
  shift 2 || true
fi
case "$kind" in
  create | fix) ;;
  *)
    echo "usage: new-session.sh [--kind create|fix] <title>" >&2
    exit 1
    ;;
esac

title="$*"
if [ -z "${title// /}" ]; then
  echo "usage: new-session.sh [--kind create|fix] <title>" >&2
  exit 1
fi

root="$(git rev-parse --show-toplevel)"
base="$root/create"
mkdir -p "$base"

title_slug="$(printf '%s' "$title" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
day="$(date +%Y%m%d)"
[ "$kind" = fix ] && title_slug="fix-$title_slug"

# xx = next two-digit sequence number for today
n="$(find "$base" -mindepth 1 -maxdepth 1 -type d -name "$day-*" | wc -l | tr -d ' ')"
while :; do
  n=$((n + 1))
  slug="$day-$(printf '%02d' "$n")-$title_slug"
  [ -e "$base/$slug" ] || break
done

# work happens on its own branch, cut from main so the PR holds only this session
branch="$kind/$slug"
git fetch -q origin main 2>/dev/null || true
if git rev-parse -q --verify origin/main >/dev/null; then start=origin/main; else start=main; fi
git switch -q -c "$branch" --no-track "$start"

mkdir -p "$base/$slug"
printf '%s\n' "$slug" > "$base/.current"
# .current is local state about which session is active
[ -f "$base/.gitignore" ] || printf '.current\n' > "$base/.gitignore"

kind_line=""
[ "$kind" = fix ] && kind_line="- **Kind:** fix"
heading="Create session"
[ "$kind" = fix ] && heading="Fix session"

cat > "$base/$slug/log.md" <<EOF
# $heading: $title

- **Slug:** $slug
${kind_line:+$kind_line
}- **Started:** $(date '+%Y-%m-%d %H:%M:%S %Z')

---
EOF

# add the session to the index in create/README.md (status starts as "review")
readme="$base/README.md"
if [ -f "$readme" ]; then
  index_title="$title"
  [ "$kind" = fix ] && index_title="fix: $title"
  printf '| [%s](%s/) | %s | review | %s |\n' "$slug" "$slug" "$index_title" "$(date +%Y-%m-%d)" >> "$readme"
fi

printf '%s\n' "$slug"
