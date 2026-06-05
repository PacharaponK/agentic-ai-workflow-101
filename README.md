# Agentic AI Workflow 101

A hands-on workshop repository for learning how to build and work with agentic AI workflows using Claude Code. The repo includes a slide deck, a demo project, and reference resources.

## Contents

| Path | Description |
|---|---|
| `resources/index.html` | Workshop slide deck (Thai language) |
| `demo/` | Investment analysis multi-agent demo |
| `resources/` | Skills, design references, and citations |

---

## Workshop Slide Deck

Open `resources/index.html` in any modern browser to view the workshop materials. No build step required.

---

## Demo — Investment Analysis Multi-Agent System

The `demo/` directory contains a working example of a multi-agent orchestration system that produces an investment research report for any company or stock ticker.

### Architecture

The system uses one **Orchestrator** agent that decomposes the task and dispatches three **Subagents** in parallel:

| Agent | Role |
|---|---|
| `orchestrator` | Coordinates the workflow, waits for all subagents, and synthesises the final report |
| `stock-analyst` | Equity price trends, market sentiment, and consensus recommendations |
| `industry-analyst` | Sector dynamics, competitive landscape, and moat analysis |
| `financial-analyst` | Financial statements, key ratios, and financial health scoring |

See [demo/SUBAGENTS.md](demo/SUBAGENTS.md) for full descriptions of each agent's responsibilities, and [demo/AGENTS.md](demo/AGENTS.md) for Claude Code custom instructions.

### Agent configuration

Agent definitions live under `demo/.agents/agents/<name>/agent.json` using the standard `customAgentSpec` schema. Skills are defined under `demo/.agents/skills/`.

### Demo app

`demo/app.js` is a minimal Node.js HTTP server used as a live target during the workshop.

```bash
node demo/app.js
# Server running at http://localhost:3000/
```

---

## Resources

| Path | Description |
|---|---|
| `resources/cite.txt` | Citation references for all workshop topics |
| `resources/design/DESIGN.md` | Design system documentation |
| `resources/skills/code-reviewer/` | Example code-review skill with security and maintainability rules |
| `resources/skills/skill-creator/` | Skill packaging, validation, and evaluation scripts |
| `resources/skills/impeccable/` | Impeccable frontend design skill |
| `resources/skills/frontend-design/` | Frontend design skill |
| `resources/stitch/` | UI mockup stitch files (screenshots + DESIGN.md) |
