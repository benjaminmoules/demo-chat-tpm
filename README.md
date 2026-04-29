# Demo Chat TPM 🤖💬

> A tiny "Hello TPM Buddy" chat used as a **live demo** of an agentic SDLC.
> The app itself is intentionally trivial — a single-page chat with canned,
> slightly-too-real TPM replies (sprints, JIRA, OKRs…). The interesting part
> is **how it was built**, not what it does.

---

## Prerequisites

- **Node.js ≥ 20** (LTS recommended) — includes `npm`. Check with `node -v`.
  - Windows: `winget install OpenJS.NodeJS.LTS`
  - macOS: `brew install node`
  - Linux: see [nodejs.org/download](https://nodejs.org/en/download)
- **Git** (only if you're cloning the repo).
- A modern browser (Chrome, Edge, Firefox, Safari).

> ⚠️ After installing Node.js, **close and reopen your terminal** so the new
> `PATH` is picked up. Otherwise `npm` will report "command not found".

---

## TL;DR — clone and run

**macOS / Linux (bash/zsh):**
```bash
git clone https://github.com/benjaminmoules/demo-chat-tpm.git
cd demo-chat-tpm
cp .env.example .env       # only one variable: PORT (defaults to 5173)
npm install
npm start                  # → http://localhost:5173
npm test                   # 15 unit + integration tests
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/benjaminmoules/demo-chat-tpm.git
cd demo-chat-tpm
Copy-Item .env.example .env
npm install
npm start                  # → http://localhost:5173
npm test                   # 15 unit + integration tests
```

Stop the server with `Ctrl+C` in the terminal where it's running.

Or just open [`index.html`](index.html) directly in a browser — there is no
build step (the only thing `server.js` adds is serving the files over HTTP
so ES module imports work without `file://` quirks).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `npm : The term 'npm' is not recognized` (Windows) | You opened the terminal **before** installing Node.js. Close it, open a new one. |
| `EADDRINUSE: address already in use :::5173` | Another process owns the port. Either stop it, or change `PORT` in `.env` (e.g. `PORT=5180`) and rerun `npm start`. |
| Page loads but is blank / module errors in console | You opened `index.html` from the file system. Use `npm start` and visit `http://localhost:5173`. |
| `npm install` shows audit warnings | Safe to ignore for this demo — they come from dev-only deps (`vitest`, `jsdom`). Don't run `npm audit fix --force`. |
| Tests fail with "jsdom not found" | Run `npm install` first. The repo doesn't commit `node_modules/`. |

---

## Why this repo exists

To show TPM peers **the orchestration approach I follow** for real
projects, end-to-end, on a 2-feature toy. Every artifact a real run would
produce is committed here, so you can read the whole story in the file tree.

### The cycle

1. **PRD** — iterated with a *Product Manager Advisor* agent
   → [`docs/product/prd.md`](docs/product/prd.md)
2. **Mockup** — produced by a *UX/UI Designer* agent
   → [`docs/product/mockup.html`](docs/product/mockup.html)
3. An **SDLC Orchestrator** agent then dispatches each step to a
   specialist agent:
   - **Architecture & ADRs** → [`.copilot-tracking/adrs/2026-04-28/`](.copilot-tracking/adrs/2026-04-28)
   - **Schema / data model** *(skipped — no DB here)*
   - **Backlog → GitHub** (issues + project board) — *Backlog Manager* agent
   - **Implementation** — *RPI agent* (Research → Plan → Implement →
     Review → Discover) with subagents
   - **Test** — custom *QA Product agent* doing strict AC validation
   - **Refactor + PR review + merge** — *PR Review* agent
   - **Next feature** → loop
4. State, plans, changes, and reviews are kept in [`.copilot-tracking/`](.copilot-tracking)
   so the workflow survives `/clear` and `/compact` and any chat can pick up
   where the previous one stopped.

### Where to look

| You want to see… | Open this |
|---|---|
| The product brief (PM Advisor) | [`docs/product/prd.md`](docs/product/prd.md) |
| The mockup (UX/UI Designer) | [`docs/product/mockup.html`](docs/product/mockup.html) |
| The architecture decisions | [`.copilot-tracking/adrs/2026-04-28/`](.copilot-tracking/adrs/2026-04-28) |
| The lifecycle state file | [`.copilot-tracking/sdlc/demo-chat-tpm/state.md`](.copilot-tracking/sdlc/demo-chat-tpm/state.md) |
| An implementation plan (RPI) | [`.copilot-tracking/plans/2026-04-28/F-001-base-chat-ui-plan.instructions.md`](.copilot-tracking/plans/2026-04-28/F-001-base-chat-ui-plan.instructions.md) |
| A changes log (RPI) | [`.copilot-tracking/changes/2026-04-28/F-001-base-chat-ui-changes.md`](.copilot-tracking/changes/2026-04-28/F-001-base-chat-ui-changes.md) |
| A QA Product report | [`.copilot-tracking/reviews/demo-chat-tpm/qa-report-1.md`](.copilot-tracking/reviews/demo-chat-tpm/qa-report-1.md) |
| An implementation review | [`.copilot-tracking/reviews/demo-chat-tpm/implementation-review-1.md`](.copilot-tracking/reviews/demo-chat-tpm/implementation-review-1.md) |
| A PR review | [`.copilot-tracking/reviews/demo-chat-tpm/pr-review-1.md`](.copilot-tracking/reviews/demo-chat-tpm/pr-review-1.md) |
| The agents driving the cycle | [`.github/agents/`](.github/agents) |
| The starter prompts | [`.github/prompts/`](.github/prompts) |

---

## Important: language-specific copilot instructions

A clean **`.github/instructions/<language>.instructions.md`** file is the
single biggest lever for making agentic coding actually predictable. Without
it the agents drift — naming conventions slip, idioms shift between files,
testing patterns are improvised, and review loops explode.

The pattern I use is the same one you'll find in real-world agent setups
(C#, Python, Bash, Bicep, Terraform…): **one file per language, scoped via
`applyTo`, declaring entry-point conventions, dependency hygiene, error
handling, logging, testing style, and security defaults**. The agents read
that file before touching any code in the matching glob.

For this demo I shipped **one example** for the language actually used
here:

> [`.github/instructions/javascript.instructions.md`](.github/instructions/javascript.instructions.md)

It declares: ESM-only, no build step, pure logic in `chat-engine.js` (no DOM
imports), DOM glue isolated in `app.js`, `vitest` + `jsdom` for tests, one
`describe` per feature with AC-tagged tests, comments brief and factual.

For a real project you'd add one such file per language (`typescript`,
`python`, `bash`, `terraform`, …). They are short, opinionated, and
mandatory reading for any agent working in that file type.

---

## Demo features (only 3 — on purpose)

| # | Feature | Issue | PR |
|---|---------|-------|----|
| 1 | Base chat UI (input + bubbles + echo) | [#1](../../issues/1) | [#3](../../pull/3) |
| 2 | TPM personality + quick-prompt presets | [#2](../../issues/2) | [#4](../../pull/4) |
| 3 | Agentic mode (Azure CLI + Azure OpenAI gpt-mini) | [#5](../../issues/5) | [#5](../../pull/5) |

Tracked on the **[Demo Chat TPM Project board](https://github.com/users/benjaminmoules/projects/1)**.

---

## Optional: agentic mode (real `gpt-*-mini` reply)

F-006 adds a *truly agentic* moment to the demo. It is **off by default** —
the canned engine still ships unchanged. To turn it on, in your `.env`:

```bash
AZURE_OPENAI_ENDPOINT=https://<your-aoai>.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=<your-gpt-mini-deployment-name>
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

Then, in the same shell:

```bash
az login            # the only auth step — no API key, ever
npm start
```

The header now shows a discreet `⚡ agentic` badge. Each message is sent
to `POST /api/agent`; the server shells `az account get-access-token` and
proxies to your Azure OpenAI deployment with a short, locked TPM persona.
If anything fails (no `az`, throttled, network down, malformed reply…),
the app silently falls back to the canned engine — so the audience always
sees a TPM bubble.

See [`docs/architecture/adr/ADR-003-azure-agentic-mode.md`](docs/architecture/adr/ADR-003-azure-agentic-mode.md)
for the decision and trade-offs.

### Live demo resources (already provisioned)

A throwaway environment is provisioned in subscription
`78fe4846-8b13-459a-8797-898cfb7d0c88`:

| Kind | Name | Notes |
|---|---|---|
| Resource group | `rg-demo-chat-tpm` (eastus2) | tagged `project=demo-chat-tpm` |
| Foundry / AIServices account | `aif-tpm-oyfrh` | `S0`, system-assigned identity, custom subdomain |
| Model deployment | `gpt-5-mini` (v `2025-08-07`) | `GlobalStandard` SKU, capacity `50` |
| RBAC | `Cognitive Services OpenAI User` on the account, granted to the signed-in dev | data-plane access for `az` token |

Endpoint: `https://aif-tpm-oyfrh.cognitiveservices.azure.com`. The
matching values are in [`.env`](.env) (gitignored; placeholders only in
[`.env.example`](.env.example)).

### Running it locally

```powershell
# one-time, interactive (browser flow)
az login --scope https://cognitiveservices.azure.com/.default

# verify the wiring talks to the real model with the Fun TPM persona
npm run smoke:agent

# start the chat — header shows "⚡ agentic" once the probe succeeds
npm start
```

### Tuning the Fun TPM persona

The persona lives in a single constant — `SYSTEM_PROMPT` in [agent.js](agent.js).
Edit it in place, save, restart `npm start`. The unit test
*"SYSTEM_PROMPT locks the TPM persona keywords"* enforces a small contract
(persona name + "never break character" + at least one PM keyword) so
edits stay on-brand.

> **Cost:** `gpt-5-mini` on `GlobalStandard` is per-token. We cap each
> reply at `max_completion_tokens=600` and use `reasoning_effort:"minimal"`,
> so a 15-minute live demo costs well under one cent.

---

## Layout

```
.
├── README.md
├── .env.example                      # PORT only — copy to .env
├── package.json                      # vitest + jsdom for tests, node http for serve
├── server.js                         # zero-dep static file server
├── index.html  styles.css            # the chat UI
├── app.js                            # DOM glue
├── chat-engine.js                    # pure, testable logic (no DOM)
├── tests/
│   ├── chat-engine.test.js           # unit tests
│   └── dom.test.js                   # integration tests via jsdom
├── docs/
│   ├── product/
│   │   ├── prd.md  backlog.md  mockup.html
│   └── architecture/
│       └── adr/                      # human-friendly mirror of the canonical ADRs
├── .github/
│   ├── copilot-instructions.md       # repo-wide rules (highest priority)
│   ├── instructions/
│   │   └── javascript.instructions.md
│   ├── agents/                       # SDLC orchestrator + RPI + QA + PR review …
│   ├── prompts/                      # starter prompts (start-feature, run-feature)
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/feature.md
└── .copilot-tracking/                # state, plans, changes, reviews, ADRs
    ├── sdlc/demo-chat-tpm/state.md
    ├── adrs/2026-04-28/
    ├── plans/2026-04-28/
    ├── changes/2026-04-28/
    └── reviews/demo-chat-tpm/
```

---

## Key learnings I want to share

- **Don't fire too many features at once** → the agent burns out and the
  run collapses. One feature at a time. Always.
- **Always generate (and verify) an implementation plan** before coding.
  A *Plan Validator* agent re-reads the plan against the research before
  any code is written.
- **Verify outputs at every important step**, especially when getting
  close to the token budget. `/clear` or `/compact` are your friends.
- **One chat per request.** For complex requests, use a planning chat to
  draft the next prompt precisely, then send it from a fresh chat.
- **Keep traces in a state file** so the orchestration is reproducible
  and resumable after a reset.
- **Have a clean per-language instructions file.** This is the single
  highest-leverage piece of agent setup. Copy the pattern from
  established sets (C#, Python, Bash, Terraform).

---

*Built as a demo. The fun is in the process, not the chatbot.*
