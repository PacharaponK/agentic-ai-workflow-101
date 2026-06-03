---
name: code-review
description: Run a full code review covering security vulnerabilities, naming conventions, test coverage, performance/resource issues, and code quality/maintainability — then produce a prioritized findings report. Trigger whenever the user says "review my code", "code review", "review this PR", "check my code", "look for issues", "what's wrong with this", "review the changes", or any request to evaluate code quality across one or more dimensions. Also trigger for partial reviews like "check naming" or "is test coverage good?".
---

## Gather context

Run in parallel:

```bash
npm test -- --coverage --coverageReporters=text 2>&1
npm audit --json 2>&1
git diff HEAD~1 --stat 2>&1
git log --oneline -5
```

Then read all files in `src/` and `tests/`.

> Read `references/checklist.md` for the full per-dimension checklist. Use it as your working list — tick through every item and note findings as you go.

---

## Five review dimensions

| # | Dimension | What to catch |
|---|-----------|---------------|
| 1 | **Security** | Vulnerabilities, missing auth, input gaps, CVEs |
| 2 | **Naming** | Convention violations, vague or misspelled names |
| 3 | **Test coverage** | Uncovered paths, missing edge cases, state leakage |
| 4 | **Performance & Resources** | Unbounded operations, blocking I/O, memory risk |
| 5 | **Quality & Maintainability** | DRY, SRP, error handling consistency, dead code |

---

## Report format

```
# Code Review Report
**Date:** <ISO date>
**Scope:** <files reviewed / git diff summary>

## Coverage snapshot
<paste Jest per-file coverage table>

## Summary
| Dimension        | Issues |
|------------------|--------|
| Security         | N (C/H/M/L) |
| Naming           | N |
| Test coverage    | N |
| Performance      | N |
| Quality          | N |

## Findings

### [SEVERITY] [DIMENSION] <Title>
**Location:** `file.js:line`
**Issue:** What's wrong and why it matters.
**Fix:** Concrete recommendation — include a code snippet when it makes the fix unambiguous.

(group findings by dimension; within each group, order Critical → Low)

## Confirmed OK
Bullet list of areas reviewed and found clean.
```

## Severity guide

| Level | Meaning |
|---|---|
| Critical | Exploitable flaw or broken core behavior |
| High | Significant risk or serious maintenance burden |
| Medium | Real issue but requires specific conditions |
| Low | Minor gap, style, or best-practice miss |
| Info | Observation, no action needed |

Be specific: "rename `w` to `wallet` at `walletController.js:90`" beats "improve variable names".
