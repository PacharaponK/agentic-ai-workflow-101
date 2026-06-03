---
name: auto-commit-push
description: Stage, commit with a conventional commit message, and push. Use this skill whenever the user says "commit", "push", "commit and push", "save my changes", "ship it", "push to remote", or any intent to persist local changes to git — even if they don't say "conventional commit" explicitly.
---

## Steps

Run these in parallel first:

```
git status
git diff HEAD
git log --oneline -5
```

Then:

1. Pick type and scope from the diff (see table below)
2. `git add <changed files>` — list files explicitly, not `-A`
3. `git commit -m "<message>"`
4. `git push` (use `-u origin <branch>` if remote branch is new)

## Conventional commit format

```
<type>(<scope>): <description>
```

- **description**: imperative mood, lowercase, no trailing period, ≤72 chars
- **scope**: the affected module/file — omit if changes span >3 unrelated areas

| Type       | When                                |
| ---------- | ----------------------------------- |
| `feat`     | new capability                      |
| `fix`      | bug correction                      |
| `docs`     | docs only                           |
| `refactor` | restructure without behavior change |
| `test`     | add/fix tests                       |
| `chore`    | deps, config, tooling               |
| `perf`     | performance improvement             |
| `style`    | formatting, whitespace              |
| `ci`       | CI/CD pipeline                      |
| `build`    | build system                        |

Add a `BREAKING CHANGE:` footer line when public APIs are removed or renamed.

## Hard rules

- Never `--no-verify`, never `--force` push (unless user explicitly asked)
- If push is rejected (non-fast-forward) → report it and stop; do not auto-rebase
- Never commit `.env`, credential files, or large binaries

## Examples

| Diff                                | Message                                              |
| ----------------------------------- | ---------------------------------------------------- |
| New POST /wallets/:id/lock route    | `feat(wallet): add lock endpoint`                    |
| Balance allowed to go negative      | `fix(wallet): prevent negative balance on withdraw`  |
| README updated with setup steps     | `docs: add setup instructions to README`             |
| jest upgraded 29→30 in package.json | `chore(deps): upgrade jest to 30`                    |
| Extract validateAmount into helper  | `refactor(wallet): extract amount validation helper` |
