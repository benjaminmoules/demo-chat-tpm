# Backlog — Demo Chat TPM

Translated from the PRD into prioritized features. For the demo, only the
top 2 are shipped — the rest are intentionally parked.

| Rank | ID | Feature | Status |
|------|----|---------|--------|
| 1 | F-001 | Base chat UI (input, bubbles, echo bot) | ✅ Shipped (PR #1) |
| 2 | F-002 | TPM personality + preset prompts | ✅ Shipped (PR #2) |
| 3 | F-006 | Agentic mode via Azure CLI + Azure OpenAI gpt-mini | ✅ Shipped (PR #5) |
| 4 | F-003 | Conversation persistence (localStorage) | 🅿️ Parked |
| 5 | F-004 | Light/dark theme toggle | 🅿️ Parked |
| 6 | F-005 | Export chat as Markdown | 🅿️ Parked |

## F-001 — Base chat UI

**As a** visitor
**I want** to type a message and see it appear in a chat thread with a bot reply
**So that** I can interact with the demo.

**Acceptance criteria**
- AC1. The page shows an input, a send button, and an empty thread on load.
- AC2. Pressing Enter or clicking Send appends my message as a "user" bubble.
- AC3. After ~400ms a "bot" bubble appears containing a reply.
- AC4. The thread auto-scrolls to the latest message.
- AC5. Empty messages are ignored.

## F-002 — TPM personality + presets

**As a** visitor
**I want** the bot to sound like a TPM and offer one-click prompts
**So that** the demo is fun and easy to drive without typing.

**Acceptance criteria**
- AC1. Replies are picked from a TPM-flavored library (sprints, OKRs, JIRA,
  roadmaps, standups, dependencies, blockers).
- AC2. Replies vary across consecutive identical questions (no two in a row).
- AC3. At least 4 preset prompt buttons are visible above the input.
- AC4. Clicking a preset sends that prompt as if typed.
- AC5. A "Clear" button empties the thread.

## F-006 — Agentic mode (Azure CLI + Azure OpenAI gpt-mini)

**As a** presenter
**I want** to flip on a real LLM-backed reply, authenticated via my
existing `az login`, without changing the UI or breaking the canned demo
**So that** the same SDLC ships from "static prop" to "model-backed
feature" in one feature, with a funny smart TPM persona.

**Acceptance criteria**

- AC1. With `AZURE_OPENAI_ENDPOINT` and `AZURE_OPENAI_DEPLOYMENT` unset,
  the app behaves exactly as the F-002 build (15/15 existing tests pass,
  no regressions).
- AC2. With both env vars set and a valid `az` session, `GET
  /api/agent/health` returns `{ enabled: true }` and the UI shows an
  "agentic" indicator.
- AC3. In agentic mode, a user message produces a reply from
  `POST /api/agent` (mocked in tests) that replaces the "typing…"
  bubble in place — same UX as canned mode.
- AC4. The system prompt enforces the TPM persona (1–2 sentences, dry
  humour, never breaks character) — verified via the prompt fixture.
- AC5. Any failure (network, non-2xx, malformed body, missing config)
  silently falls back to the canned reply. The user always gets *a*
  reply.
- AC6. Auth uses Azure CLI (`az account get-access-token`) — no API
  keys, no secrets in `.env`. Verified by grep over committed files.
- AC7. Server input is bounded (request body cap) and `az` is invoked
  via `spawn` with array args (no shell interpolation).
