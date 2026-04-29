<!-- markdownlint-disable-file -->
# Implementation Plan: F-006 — Agentic mode (Azure CLI + Azure OpenAI gpt-mini) (Issue #5)

| Field | Value |
|---|---|
| Issue | #5 — F-006 — Agentic mode via Azure CLI + Azure OpenAI gpt-mini |
| Branch | feat/F-006-agentic-azure |
| Author | RPI Agent |
| Validated by | Plan Validator agent (1 minor: cap request body and assert no shell interpolation in the `az` invocation — both addressed below) |
| Date | 2026-04-28 |

## User Requests

1. The chat must be able to call a real `gpt-*-mini` deployment on Azure
   OpenAI, with a funny-smart TPM system prompt.
2. Authentication must use the Azure CLI (`az login`) — no API keys.
3. Existing offline canned-reply behavior must remain the default and
   must not regress (15/15 tests still pass).

## Overview and Objectives

Add a thin **server-side proxy** in the existing `server.js` that, when
configured, exchanges an Azure CLI access token for a chat-completion
against the configured deployment. The browser probes a `/health`
endpoint on load, then either calls the proxy or falls back to the
canned engine (ADR-002). All new logic is pure and testable without
touching the network or the `az` binary.

### Derived Objectives

- New module `agent.js` exporting:
  - `SYSTEM_PROMPT` (the funny smart TPM persona).
  - `buildRequest({ userText, system, history })` — pure.
  - `parseReply(payload)` — pure; throws on empty.
  - `buildEndpoint({ endpoint, deployment, apiVersion })` — pure.
  - `fetchAzureToken({ runner })` — runs `az account get-access-token …`
    via `child_process.spawn` (array args, `shell:false`).
  - `callAgent({ userText, config, fetcher, tokenProvider })` — wires
    the four pure pieces.
- `server.js`:
  - `GET /api/agent/health` → `{ enabled: !!endpoint && !!deployment }`.
  - `POST /api/agent` → `{ reply }` on 200, `{ error }` on 5xx.
  - Body cap = 8 KiB; reject larger.
- `chat-engine.js`:
  - `agenticReply(userText, { fetcher })` — calls `/api/agent`, throws on
    non-2xx or empty payload.
- `app.js`:
  - On `DOMContentLoaded`, probe `/api/agent/health`; on failure or
    `enabled:false`, mode = canned (= today's behavior).
  - In `send()`, if mode = agentic, await `agenticReply`; on any throw,
    silently fall back to the canned 400 ms path.
- `.env.example` adds `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`,
  `AZURE_OPENAI_API_VERSION` placeholders.
- `index.html` adds a discreet "agentic" indicator slot in the header
  (toggled by a body class set after a successful probe).
- `styles.css` styles the indicator pill.

## Context Summary

- ADR-001 (static stack, zero deps) — keep.
- ADR-002 (canned replies) — kept as the default fallback path.
- ADR-003 (this feature) — opt-in agentic mode.
- Conventions: [`.github/instructions/javascript.instructions.md`](../../../.github/instructions/javascript.instructions.md)

## Implementation Checklist

### Phase 1: Pure logic — `agent.js` <!-- parallelizable: false -->

- [ ] 1.1 `SYSTEM_PROMPT` constant — TPM persona, ≤ 5 lines.
- [ ] 1.2 `buildRequest()`, `parseReply()`, `buildEndpoint()` — pure.
- [ ] 1.3 `fetchAzureToken({ runner })` — runner-injectable for tests.
- [ ] 1.4 `callAgent({ fetcher, tokenProvider })` — DI for tests.

### Phase 2: Server endpoints <!-- parallelizable: false -->

- [ ] 2.1 Add `GET /api/agent/health`.
- [ ] 2.2 Add `POST /api/agent` with 8 KiB body cap and JSON parsing.
- [ ] 2.3 503 when not configured, 502 on upstream/`az` failure.

### Phase 3: Browser glue <!-- parallelizable: true -->

- [ ] 3.1 `chat-engine.js` exports `agenticReply()`.
- [ ] 3.2 `app.js` probes `/api/agent/health`; mode = agentic on success.
- [ ] 3.3 `send()` becomes async; agentic-first with canned fallback.
- [ ] 3.4 Body class `agentic` toggles header indicator.

### Phase 4: Surface (markup + styles + env) <!-- parallelizable: true -->

- [ ] 4.1 `index.html` adds an `<span id="agentic-badge">` slot.
- [ ] 4.2 `styles.css` indicator pill, hidden by default.
- [ ] 4.3 `.env.example` adds the three Azure variables, placeholders only.

### Phase 5: Tests <!-- parallelizable: true -->

- [ ] 5.1 `tests/agent.test.js` unit cases:
      - `buildRequest()` shape (system + user + injected history).
      - `parseReply()` happy + empty + malformed.
      - `buildEndpoint()` builds correct URL, encodes deployment.
      - `fetchAzureToken()` parses fake stdout, errors on missing token.
      - `callAgent()` happy path (mocked fetcher + tokenProvider).
      - `callAgent()` non-2xx → throws agent_failed.
      - `SYSTEM_PROMPT` mentions TPM persona keywords (anchor test).
- [ ] 5.2 `tests/dom.test.js` add cases:
      - regression: 5 existing cases still pass unchanged
        (canned-mode default).
      - `F-006 AC3`: with mocked `fetch` health=enabled and `/api/agent`
        returning a payload, the typing bubble is replaced by the model
        reply (no 400 ms wait needed).
      - `F-006 AC5`: with health enabled but `/api/agent` rejecting,
        the canned fallback still produces a reply after 400 ms.

### Phase 6: Validation <!-- parallelizable: false -->

- [ ] 6.1 `npm test` green (target: 22 tests = 15 existing + 7 new).
- [ ] 6.2 `grep -r "key\|secret\|api[-_]key" .env.example tests/` returns
       nothing semantic (AC6).
- [ ] 6.3 `grep "shell:\s*true" agent.js server.js` returns nothing (AC7).
- [ ] 6.4 QA Product agent report.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `az` not installed / not logged in | `/api/agent` returns 502 with `agent_failed`, browser falls back to canned silently |
| Azure OpenAI quota or throttling | Same fallback path; demo never crashes |
| Latency above patience threshold | 8 s timeout in browser, then canned fallback |
| Token exposure | Token never crosses the wire to the browser; lives only inside `server.js` for the duration of one upstream call |
| Shell injection via env vars | `spawn` with array args, `shell:false`, and only literal flags |
| Body abuse | 8 KiB request cap, JSON parse in try/catch |

## Success Criteria

- All 7 acceptance criteria from F-006 met.
- 0 regressions on F-001 / F-002 ACs.
- 22/22 tests passing locally.
- No secret values committed.
