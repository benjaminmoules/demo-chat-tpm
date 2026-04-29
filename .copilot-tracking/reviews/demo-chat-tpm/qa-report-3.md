<!-- markdownlint-disable-file -->
# QA Product Validation Report: Issue #5

**Feature:** F-006 — Agentic mode via Azure CLI + Azure OpenAI gpt-mini
**Issue:** #5
**Date:** 2026-04-28
**Branch:** `feat/F-006-agentic-azure`

## Verdict: PASS

**Confidence:** High

## Feature Summary

The chat now has *two* engines behind the same UI: the canned TPM library
from F-002 (default) and a real `gpt-*-mini` deployment on Azure OpenAI
(opt-in). Switching between them is a `.env` + `az login` away — no UI
change, no rebuild, no secret rotation. The funny smart system prompt
locks the TPM persona so the model still sounds like a tired-but-clever
program manager. Any failure of the agentic path silently falls back to
a canned reply, so the audience never sees an error bubble.

## Implicit Expectations Identified

- The audience must *not* be able to tell that mode-switching is happening,
  except for the discreet "⚡ agentic" badge in the header.
- A presenter losing wifi mid-demo should still get a reply, just a
  canned one — no broken UX, no "🤖 sorry, I errored" bubble.
- Setting only one of the two required env vars must not half-enable
  agentic mode.
- Repository must remain safe to fork / clone publicly: no secrets, no
  tokens, no API keys.

## Acceptance Criteria Validation

| AC | Test Coverage | Verdict |
|----|---------------|---------|
| AC1 zero-config behavior identical to F-002 | F-001/F-002 dom + engine suites unchanged and green | PASS |
| AC2 health probe enables agentic mode + badge | `dom.test.js` — "AC2: health probe enables agentic mode" | PASS |
| AC3 model reply replaces the typing bubble | `dom.test.js` — "AC3: a typed message is answered by the model reply" | PASS |
| AC4 system prompt enforces TPM persona | `agent.test.js` — "SYSTEM_PROMPT locks the TPM persona keywords"; manual read of `SYSTEM_PROMPT` | PASS |
| AC5 any failure → canned fallback | `dom.test.js` — "AC5: agent failure falls back to a canned reply"; `agent.test.js` — "throws agent_failed on non-2xx" | PASS |
| AC6 no API keys / secrets | `.env.example` grep ⇒ only `AZURE_OPENAI_*` placeholders; `agent.js` calls `az` for the bearer token | PASS |
| AC7 bounded body + no shell interpolation | `server.js` `MAX_BODY_BYTES = 8 * 1024`; `agent.js` uses `spawn(cmd, args, { shell:false })` | PASS |

## Regression — Issues #1 / #2

| AC | Test | Verdict |
|----|------|---------|
| F-001 AC1 input + Send + greeting on load | unchanged dom test | PASS |
| F-001 AC2 Enter / Send appends user bubble | unchanged dom test | PASS |
| F-001 AC3 bot bubble after ~400 ms | unchanged dom test (fake timers) | PASS |
| F-001 AC4 auto-scroll | manual | PASS |
| F-001 AC5 empty input ignored | unchanged dom test | PASS |
| F-002 AC1–AC5 personality + presets | unchanged engine + dom tests | PASS |

## Test Results

- **New AC tests:** 3/3 passing (`tests/dom.test.js` F-006 block) + 12/12
  (`tests/agent.test.js`).
- **Regression:** 15/15 of F-001 + F-002 still passing.
- **Full suite:** 30/30 (0 failures).

## User Scenarios

### Happy path

- Run `az login`, set the two env vars, `npm start` → header shows
  "⚡ agentic"; messages reply through the model with a TPM voice. ✅
- Click presets → same agentic path; persona consistent across replies. ✅

### Edge cases

- Set only `AZURE_OPENAI_ENDPOINT` (deployment missing) → health returns
  `{enabled:false}`, app stays canned. ✅
- `az account get-access-token` returns an error (not logged in) →
  `/api/agent` 502 → silent canned fallback. ✅
- Send a 16 KiB message → 400 `bad_request` (body cap), browser falls
  back to canned. ✅
- Send `""` / whitespace → ignored on the client (existing F-001 AC5),
  never reaches the server. ✅

### Failure scenarios

- Network drop mid-call → `agenticReply()` throws → canned fallback. ✅
- Upstream returns malformed JSON → `parseReply()` throws → 502 →
  canned fallback. ✅

## Security Validation

| Check | Result |
|-------|--------|
| Secrets in repo | Mitigated — only env-var placeholders in `.env.example` |
| Token exposure to browser | Mitigated — token lives only in `server.js`'s memory |
| Shell injection via `az` | Mitigated — `spawn` array args, `shell:false`, literal flags only |
| XSS via model output | Mitigated — `textContent` everywhere; model output never reaches `innerHTML` |
| Body abuse / DoS | Mitigated — 8 KiB request cap |
| Path traversal in static server | Unchanged from F-002 — explicit `startsWith(__dirname)` check |

## Implementation Review Cross-Reference

The Implementation Validator found 0 Critical / 0 Major. Minor `m1`
(operator log line) and `m2` (no `fetcher` timeout) are acknowledged
and parked. No fixes required before merge.

## Blocking Issues

None.

## Sign-off

- ✅ Recommended to merge PR #5.