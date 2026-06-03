# Agentic AI Workflow 101

A hands-on workshop repository for learning how to build and work with agentic AI workflows using Claude Code. The repo includes a slide deck and a fully functional practice project.

## Contents

| Path | Description |
|---|---|
| `index.html` | Workshop slide deck (Thai language) |
| `workshop/` | Digital Wallet REST API — the practice project |

---

## Workshop Slide Deck

Open `index.html` in any modern browser to view the workshop materials. No build step required.

---

## Workshop Project — Digital Wallet API

A simple in-memory Digital Wallet REST API built with **Express.js**, used as the hands-on subject for practising agentic AI workflows with Claude Code.

### Tech stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Docs:** Swagger UI (`swagger-jsdoc` + `swagger-ui-express`)
- **Testing:** Jest + Supertest

### Getting started

```bash
cd workshop
npm install

# Start with seed data (development)
npm run dev

# Production start
npm start
```

The server runs on `http://localhost:3000`.
Swagger UI is available at `http://localhost:3000/api-docs`.

### Project structure

```
workshop/
├── src/
│   ├── server.js           # Entry point — routes & middleware
│   ├── walletController.js # Request handlers & HTTP responses
│   ├── wallet.js           # Wallet class — business logic & state
│   ├── swagger.js          # OpenAPI spec generation
│   └── seed.js             # Dev seed data
└── tests/
    └── api.test.js         # Integration tests (Jest + Supertest)
```

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/wallets` | Create a new wallet |
| `GET` | `/wallets/:id` | Get wallet details |
| `POST` | `/wallets/:id/deposit` | Deposit funds |
| `POST` | `/wallets/:id/withdraw` | Withdraw funds |
| `POST` | `/wallets/:id/transfer` | Transfer funds to another wallet |

Full interactive docs available at `/api-docs` when the server is running.

### Running tests

```bash
cd workshop
npm test          # Run all tests with coverage
```

### Key design notes

- All state is **in-memory** — data resets on restart.
- `wallet.js` is the single source of truth; methods throw on invalid input, controllers map thrown errors to HTTP 400.
- Seed data runs automatically when `NODE_ENV !== 'production'`.
- Every new route must have a corresponding `@swagger` JSDoc comment in `walletController.js`.
