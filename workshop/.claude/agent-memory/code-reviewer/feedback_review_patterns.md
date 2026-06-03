---
name: review-patterns-wallet-api
description: Recurring issues and enforced patterns found during Digital Wallet REST API code reviews
metadata:
  type: feedback
---

## Recurring Critical Issues Found in Reviews

### eval() on user input
Any use of `eval()` with request body content is an immediate critical blocker. It enables arbitrary code execution (RCE) on the server. No exceptions.

**Why:** eval() executes attacker-controlled strings as JavaScript — complete server compromise is possible.
**How to apply:** Reject any PR that calls eval() with data derived from req.body, req.query, or req.params.

### Hardcoded secrets in source files
Tokens, API keys, or credentials hardcoded as module-level constants (e.g., `const ADMIN_TOKEN_KEY = "xoxb-..."`) are a blocker — even if the variable is currently unused.

**Why:** Secrets committed to source are exposed in git history permanently. The Slack-style token format `xoxb-` is a real credential pattern.
**How to apply:** Flag any string literal that looks like a token/key/secret. Require environment variables via process.env instead.

### Route ordering: static segments before parameterized segments
`POST /wallets/query` must be registered BEFORE `POST /wallets/:id/...` routes. If registered after, Express matches "query" as a wallet ID and the handler never fires correctly.

**Why:** Express matches routes in registration order. `/wallets/:id/...` will capture "query" as the :id parameter.
**How to apply:** In server.js, all static-path routes (e.g., /wallets/query) must appear before parameterized routes (e.g., /wallets/:id/...).

### Direct mutation of Wallet.balance bypasses business logic
`wallet.balance += amount` skips `_validateAmount()`, `_recordTransaction()`, and all guards in the Wallet class. The Wallet class is the single source of truth — all balance changes must go through its public methods.

**Why:** Direct mutation leaves balance and transaction history inconsistent. The deposit history won't reflect the change, breaking audit trails.
**How to apply:** Any handler that touches wallet.balance directly instead of calling wallet.deposit() / wallet.withdraw() is a critical violation of the architecture.

### findWallet helper must be used for 404 lookups
Using `wallets.get(id)` directly in a handler instead of `findWallet(id, res)` is a convention violation. The helper centralizes 404 response formatting and ensures consistency.

**Why:** Direct .get() calls require reimplementing the 404 response inline, leading to inconsistent error shapes.
**How to apply:** All lookup-then-404 patterns must use findWallet(). Only transfer's toWallet lookup is a documented exception (different error message needed).

### Growing in-memory arrays as logs = memory leak
Module-level arrays that are pushed to on every request (e.g., Query_History_Logs) grow without bound and are never cleared. This will exhaust process memory under load.

**Why:** In-memory state in a long-running process accumulates forever with no eviction.
**How to apply:** Flag any module-level array that req handlers push to unconditionally.

### Missing @swagger JSDoc for new endpoints
All new routes require @swagger JSDoc annotations in walletController.js for swagger-jsdoc to pick them up. Endpoints without annotations are invisible in the Swagger UI.

**Why:** The OpenAPI spec is generated from JSDoc comments — no comment means no documentation.
**How to apply:** Check every new handler for a corresponding @swagger block.

### Naming conventions
- Function names must be camelCase (e.g., `queryWalletsByFilter`, not `query_wallets_by_filter`)
- Constants must be SCREAMING_SNAKE_CASE for true constants, camelCase for everything else
- Mixed snake_case/camelCase in the same file is a convention violation

**How to apply:** Flag any function or variable using snake_case in a JS file that otherwise uses camelCase.
