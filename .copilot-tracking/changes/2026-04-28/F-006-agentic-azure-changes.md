<!-- markdownlint-disable-file -->
# Changes Log: F-006 — Agentic mode (Azure CLI + Azure OpenAI gpt-mini) (Issue #5)

| Field | Value |
|---|---|
| Plan | `.copilot-tracking/plans/2026-04-28/F-006-agentic-azure-plan.instructions.md` |
| Branch | feat/F-006-agentic-azure |
| PR | #5 (squash-merged into `main`) |
| Date | 2026-04-28 |

## Files Changed

| File | Type | Notes |
|------|------|-------|
| `agent.js` | added | pure logic + Azure CLI auth: `SYSTEM_PROMPT`, `buildRequest`, `parseReply`, `buildEndpoint`, `fetchAzureToken`, `callAgent`; all DI-friendly |
| `server.js` | modified | adds `GET /api/agent/health` and `POST /api/agent` (8 KiB body cap, 503 when not configured, 502 on upstream/`az` failure); zero new deps |
| `chat-engine.js` | modified | exports `agenticReply()` (browser → `/api/agent`) and `probeAgentic()` (browser → `/api/agent/health`); both DI-friendly |
| `app.js` | modified | probes health on load; agentic-first `send()` with silent canned fallback; toggles `body.agentic` and the header badge |
| `index.html` | modified | adds `<span id="agentic-badge" hidden>⚡ agentic</span>` slot in the header |
| `styles.css` | modified | `.agentic-badge` pill matching the existing `.clear` chip |
| `.env.example` | modified | adds `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION` placeholders (no values) |
| `tests/agent.test.js` | added | 12 unit cases covering persona, request shape, parse, endpoint, az token, callAgent happy + error |
| `tests/dom.test.js` | modified | adds 3 F-006 cases (badge, model reply, fallback) without touching the 5 existing cases |
| `docs/architecture/adr/ADR-003-azure-agentic-mode.md` | added | mirror of the canonical ADR |
| `.copilot-tracking/adrs/2026-04-28/ADR-003-azure-agentic-mode.md` | added | canonical ADR — amends ADR-002 |
| `docs/product/prd.md` | modified | section 9 addendum (US-3 + relaxed non-goal) |
| `docs/product/backlog.md` | modified | adds F-006 with 7 ACs |

## Acceptance Criteria Verification

| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 no-config build identical to F-002 | PASS | `server.js` `AGENT_ENABLED=false` → health returns `{enabled:false}`; existing 15 tests untouched and green |
| AC2 health probe enables agentic mode + badge | PASS | `tests/dom.test.js` "AC2: health probe enables agentic mode" |
| AC3 model reply replaces typing bubble | PASS | `tests/dom.test.js` "AC3: a typed message is answered by the model reply" |
| AC4 system prompt enforces TPM persona | PASS | `tests/agent.test.js` "SYSTEM_PROMPT locks the TPM persona keywords" |
| AC5 any failure falls back to canned | PASS | `tests/dom.test.js` "AC5: agent failure falls back to a canned reply" + `agent.test.js` "throws agent_failed on non-2xx" |
| AC6 no API keys / secrets | PASS | `.env.example` only has `AZURE_OPENAI_*` placeholders; auth uses `az account get-access-token` |
| AC7 bounded body + no shell interpolation | PASS | `MAX_BODY_BYTES = 8 * 1024` in `server.js`; `spawn(cmd, args, { shell: false })` in `agent.js` |

## Regression — F-001 / F-002 AC matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| F-001 AC1–AC5 | PASS | `tests/dom.test.js` block "F-001 base chat UI" — unchanged, green |
| F-002 AC1–AC5 | PASS | `tests/chat-engine.test.js` (10) + `tests/dom.test.js` block "F-002 personality + presets" — unchanged, green |

## Test Results

- `npm test` ⇒ **30 passing / 0 failing** (10 engine + 12 agent + 8 dom).
- No regression detected on F-001 / F-002 AC matrices.

## Discoveries / Follow-ups

- The `gpt-*-mini` family supports `max_completion_tokens` (rather than the
  legacy `max_tokens`); the request shape uses the new key — no fallback.
- A simple in-memory token cache (until `expiresOn`) is an easy follow-up
  if latency becomes a demo concern. Skipped for now.
- The persona could be made deployment-aware (e.g. tighter for `gpt-4o-mini`,
  more verbose for larger models) — also out of scope.

## Post-merge fix (2026-04-29)

| Change | Reason |
|---|---|
| `agent.js` `TOKEN_RESOURCE` switched from `https://cognitiveservices.azure.com/.default` to bare `https://cognitiveservices.azure.com` (matching test in `tests/agent.test.js`) | `az account get-access-token --resource X` requires a bare resource URI; the `/.default` suffix is `--scope` syntax and produced `AADSTS500011` against the resource tenant |
| `agent.js` `runAz` now translates `AADSTS70008[12]` / `refresh token has expired` / `Interactive authentication is needed` into a clear remediation message | Surfacing actionable guidance instead of a raw stack trace when the Azure CLI session is stale |
| `agent.js` `runAz` uses `{ shell: isWin }` for `spawn` | Windows `az.cmd` shim cannot be invoked without a shell; safe because all args are hard-coded literals |
| `buildRequest` parameters: `temperature: 1`, `max_completion_tokens: 600`, `reasoning_effort: "minimal"` | gpt-5 family rejects custom temperatures and reasoning tokens count toward the budget |
| `scripts/smoke-agent.js` added; `npm run smoke:agent` script | Live verification harness that hits `callAgent` with three TPM prompts using the current env config |
| `.env` `PORT` moved from 5173 to 5180 (gitignored — `.env.example` left at 5173) | VS Code's Live Preview / Simple Browser extension squats 5173 on this machine |

Smoke test against live Azure resources (rg-demo-chat-tpm / aif-tpm-oyfrh / gpt-5-mini) returns three Fun-TPM replies; end-to-end `POST /api/agent` on the running server confirmed model-backed answer.