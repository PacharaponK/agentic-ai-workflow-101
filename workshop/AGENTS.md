# Project: Digital Wallet (Basic Digital Wallet System)

This document provides instructions for AI Agents (e.g., Claude Code, Cursor, or other LLMs) regarding the project structure, development workflow, and coding guidelines.

## 🛠️ Frequent Commands
- **Development Mode:** `npm run dev` (Starts nodemon to watch file changes and restart automatically)
- **Production Mode:** `npm start` (Runs the server directly via Node.js)
- **Testing:** `npm test` (Runs Jest test suite and shows code coverage)

## 📁 Project Structure
- `src/server.js` - Main entry point of the API, registers all middlewares and routes.
- `src/walletController.js` - Route handler (handles requests, responses, and invokes Wallet class operations).
- `src/wallet.js` - `Wallet` model class that manages all logic, state, and transactions (deposit, withdraw, transfer).
- `src/swagger.js` - Swagger configuration and spec for the API documentation.
- `src/seed.js` - Mock data for testing (runs automatically in development mode).
- `tests/wallet.test.js` - Test suite using Jest and Supertest.

## 📝 Coding Guidelines
- **Language:** Use **Vanilla JavaScript (Node.js)** with the **CommonJS (`require()`)** module system.
- **State Management:** The system stores data in-memory using a `Map` within `walletController.js` (No external database is used).
- **API Responses:**
  - When returning wallet data, always use the `.toJSON()` method of the `Wallet` model to avoid leaking full transaction histories.
  - Money transfers must always return both `fromBalance` and `toBalance`.
- **Naming Conventions & Style:**
  - Variables and Functions: Use `camelCase` (e.g., `createWallet`, `toWalletId`).
  - Class Structure: Keep helper/internal methods prefixed with an underscore `_` (e.g., `_validateAmount`, `_recordTransaction`).

## 🚫 Constraints & Rules
- **Balance Safety:** Wallet balance (`balance`) must NEVER be negative (validation must be performed before any operation).
- **Swagger Documentation:** Whenever a route is added or updated in `src/walletController.js`, the corresponding `@swagger` JSDoc comment above the handler function must be updated accordingly.
- **Testing:** Any new code must have comprehensive test coverage, and `npm test` must always pass 100%.
