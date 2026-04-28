# Demo Chat TPM 🤖💬

> A tiny "Hello TPM Buddy" chat used as a **live demo** of how I build software in
> the [`smart-cv-generator`](https://github.com/benjaminmoules/) repo using the
> **HVE Core orchestration approach**.

The app itself is intentionally trivial — a single static page with a chat
input and canned, slightly-too-real responses for TPM life (sprints, JIRA,
roadmaps, standups, OKRs…). The interesting part is **how it was built**, not
what it does.

## Try it

Just open `index.html` in a browser. No build, no backend, no API keys.

Or browse the live version on GitHub Pages once enabled.

## Why this repo exists

It demonstrates the orchestration philosophy I follow on real projects:

1. **PRD** iterated with a *Product Advisor* agent → [`docs/product/prd.md`](docs/product/prd.md)
2. **Mockup** designed with a *UX/UI Designer* agent → [`docs/product/mockup.html`](docs/product/mockup.html)
3. An **Orchestrator** agent then dispatches each step to the best HVE Core
   specialist:
   - **Architecture & ADRs** → [`docs/architecture/adr/`](docs/architecture/adr/)
   - **Schema / data model** (N/A here — pure client state)
   - **Backlog translation into GitHub Issues** with Acceptance Criteria
   - **Implementation** via the *RPI* agent (Research → Plan → Implement)
   - **Test** with a custom *QA Product* agent (unit / integration / functional)
   - **Refactor + PR review + merge** to `main`
   - **Next feature** → loop

The whole journey is traced in [`/.copilot-tracking/state.md`](.copilot-tracking/state.md).

## Demo features (only 2 — on purpose)

| # | Feature | Issue | PR |
|---|---------|-------|----|
| 1 | Base chat UI (input + bubbles + echo) | [#1](../../issues/1) | [#?](../../pulls) |
| 2 | TPM personality + quick-prompt presets | [#2](../../issues/2) | [#?](../../pulls) |

## Key learnings I want to share with my TPM buddies

- **Don't fire too many features at once** → the agent burns out and the run
  collapses. One feature at a time.
- **Always generate (and verify) an implementation plan** before coding —
  there is now a dedicated agent that validates the plan against the research.
- **Verify outputs at every important step**, especially when getting close
  to the token budget. `/clear` or `/compact` are your friends.
- **One chat per request.** Optionally, ask the model to draft the *next*
  request precisely before sending it.
- **Keep traces in a state file** so the orchestration is reproducible and
  resumable after a reset.

## Layout

```
.
├── README.md
├── index.html              # the chat (added in PR #1, enriched in PR #2)
├── styles.css
├── app.js
├── docs/
│   ├── product/
│   │   ├── prd.md
│   │   ├── backlog.md
│   │   └── mockup.html
│   └── architecture/
│       └── adr/
│           ├── ADR-001-static-stack.md
│           └── ADR-002-canned-responses.md
└── .copilot-tracking/
    └── state.md            # HVE Core lifecycle trace
```

---

*Built as a demo. The fun is in the process, not the chatbot.*
