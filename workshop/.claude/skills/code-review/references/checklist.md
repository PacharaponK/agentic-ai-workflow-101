# Code Review Checklist

Work through every item. Note each one — even "checked, no issue" confirms coverage.

---

## 1. Security & Vulnerabilities

### Input validation
- [ ] `amount` validated as a positive, finite, non-NaN number before every operation?
- [ ] `owner` guarded against empty string, non-string, and excessively long input?
- [ ] `toWalletId` validated as a UUID-format string before wallet lookup?
- [ ] Unexpected or extra body fields handled safely (ignored, not executed)?
- [ ] HTTP body size limit set to prevent memory exhaustion from large payloads?

### Authentication & access control
- [ ] Any endpoint protected by authentication?
- [ ] Can any caller read or mutate any other wallet with no restriction?
- [ ] Rate limiting applied to sensitive operations (deposit / withdraw / transfer)?

### Financial logic
- [ ] Any code path that allows `balance < 0`?
- [ ] Is `transfer` atomic? (withdraw succeeds → deposit fails = lost funds)
- [ ] Self-transfer guard in place?
- [ ] Float overflow/precision risk for very large amounts?
- [ ] Concurrent requests: two simultaneous withdrawals draining one wallet?

### Data & config exposure
- [ ] Error responses leak stack traces, internal IDs, or balances beyond what's needed?
- [ ] `toJSON()` consistently used to limit wallet data in API responses?
- [ ] Sensitive values (IDs, balances) appearing in logs?
- [ ] Secrets or tokens hardcoded in any source file?
- [ ] `NODE_ENV` guard ensures seed data never runs in production?
- [ ] `.env` in `.gitignore`?

### HTTP security headers
- [ ] Helmet or equivalent security headers set?
- [ ] CORS policy configured (not left as open `*`)?
- [ ] HTTPS enforced or expected in production config?

### Dependencies
- [ ] Parse `npm audit --json` — list every CVE with severity and affected package
- [ ] Dependency version ranges appropriate (no unbounded `*` or `>`)?

---

## 2. Naming Conventions

Project conventions (from AGENTS.md / CLAUDE.md):

| Entity | Convention | Example |
|--------|-----------|---------|
| Variables & functions | `camelCase` | `createWallet`, `toWalletId` |
| Classes | `PascalCase` | `Wallet` |
| Private/internal methods | `_` prefix | `_validateAmount`, `_recordTransaction` |
| Route handlers | verb + resource noun | `getAllWallets`, `getTransactions` |
| Test describe blocks | `ClassName - methodName` | `Wallet - deposit` |
| Constants (if any) | `UPPER_SNAKE_CASE` | `MAX_TRANSFER_AMOUNT` |

### Check for
- [ ] Any variable, function, or method violating the above table?
- [ ] Single-letter or cryptic names used outside of short loop indices (`i`, `k`)?
- [ ] Vague names: `data`, `temp`, `result`, `obj`, `item` without qualifying context?
- [ ] Misspellings or typos in identifiers?
- [ ] Handler names that don't match their HTTP action (e.g., `handleWallet` instead of `getWallet`)?
- [ ] Test `describe`/`test` strings that are vague or don't describe the behavior?

---

## 3. Test Coverage

### Coverage thresholds (flag if below)
- Statements: < 80%
- Branches: < 75%
- Functions: < 80%
- Lines: < 80%

### What to verify
- [ ] Every public method on `Wallet` class has at least one happy-path test?
- [ ] Every HTTP route in `walletController.js` has a success test and at least one error test (400/404)?
- [ ] Edge cases covered: zero balance, NaN amount, negative amount, missing required fields, non-existent wallet IDs?
- [ ] Transfer tests include: insufficient balance, self-transfer, invalid target type?
- [ ] `getTransactions` immutability test in place (mutation of returned array doesn't affect internal state)?
- [ ] Tests use fixtures from `tests/fixtures/wallets.js` rather than duplicating setup logic?
- [ ] Each `describe` block has a `beforeEach` that resets state to prevent test-to-test leakage?
- [ ] No test relies on execution order of other tests?

---

## 4. Performance & Resource

### Current known hot spots
- `GET /wallets` returns all wallets with no pagination — will degrade linearly as data grows
- `wallet.getTransactions()` shallow-copies the full array on every call — large for active wallets
- `transfer` patches transaction entries in-place after the fact — O(1) but surprising

### Check for
- [ ] Any endpoint that loads unbounded data without pagination or filtering?
- [ ] Synchronous blocking operations (file I/O, heavy crypto, large JSON.stringify) on the request path?
- [ ] Memory allocated per request that's not freed (closures holding references, growing caches)?
- [ ] `Array.from(wallets.values())` called inside request handlers — fine for now, but note scale limit
- [ ] `Number()` conversion of `req.body.amount` without parseInt/parseFloat guard — could coerce objects silently
- [ ] Any unbounded loops or recursion?
- [ ] Missing request body size limit (`express.json({ limit: '...' })`)?

---

## 5. Code Quality & Maintainability

### DRY (Don't Repeat Yourself)
- [ ] Amount parsing (`Number(req.body.amount)`) repeated in every handler — should it be middleware or a helper?
- [ ] `findWallet` helper already shared — are there other repeated lookup patterns?
- [ ] Test setup duplicated across describe blocks instead of using shared fixtures?

### Single Responsibility
- [ ] Each function does one thing? (e.g., does a handler both validate and respond?)
- [ ] `walletController.js` mixes route logic and store management — acceptable for this scale?
- [ ] `transfer` method mutates transaction entries after-the-fact — this is a known side-effectful pattern, but is it documented?

### Error handling consistency
- [ ] All thrown errors from `Wallet` methods caught and mapped to `400` in every handler?
- [ ] `findWallet` returns `null` — callers consistently check and `return` immediately?
- [ ] No unhandled promise rejections (even though this project is synchronous today)?

### Swagger / documentation sync
- [ ] Every route in `server.js` has a corresponding `@swagger` JSDoc block in `walletController.js`?
- [ ] Response schemas in Swagger match what `toJSON()` actually returns?
- [ ] New fields added to `Transaction` or `Wallet` reflected in `swagger.js` component schemas?

### General
- [ ] `wallets` Map exported from controller — is this intentional and clearly documented for test use?
- [ ] Magic numbers or hardcoded strings that should be named constants?
- [ ] Dead code: unused variables, imports, or functions?
- [ ] Any `console.log` left in production paths (beyond intentional seed output)?
- [ ] Cyclomatic complexity: functions with 3+ levels of nested conditionals?
