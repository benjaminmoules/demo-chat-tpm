<!-- markdownlint-disable-file -->
# PR Review: PR #5 — F-006 Agentic mode (Azure CLI + Azure OpenAI gpt-mini)

| Field | Value |
|---|---|
| Branch | `feat/F-006-agentic-azure` → `main` |
| Issue | #5 |
| Date | 2026-04-28 |
| Reviewer | PR Review agent |
| HEAD | (squash-merged) |

## Summary

| Metric | Count |
|---|---|
| Files reviewed | 13 |
| Critical | 0 |
| Major (blocking) | 0 |
| Minor | 2 |
| Suggestion | 2 |
| Tests | 30/30 passing |

The plan was followed faithfully. Agentic mode is a true *opt-in*
feature: with no env vars set, the app is byte-for-byte the F-002 build
and every existing test passes unchanged. With env vars set and a
logged-in `az`, the same UI flips to a model-backed engine that picks up
the funny-smart TPM persona from a single short system prompt. Failure
modes are silent and safe — the audience always sees a TPM reply.

QA Product agent: PASS / High. **APPROVE.**

## File-by-file Notes

### `agent.js` (new, pure + `child_process`)

- ✅ `SYSTEM_PROMPT` is the whole "smart funny" surface — short, locked,
  asserted by a unit test (AC4). Persona keywords (`sprint|okr|jira|
  roadmap|blocker`) and `never break character` rule are pinned.
- ✅ Each side-effecting boundary is injectable: `runner` for `az`,
  `fetcher` for the HTTP call, `tokenProvider` for higher-level wiring.
  This is exactly the pattern required by
  `instructions/javascript.instructions.md`.
- ✅ `spawn(cmd, args, { shell: false })` with array args; no string
  interpolation goes anywhere near a shell (AC7).
- ✅ `buildEndpoint` URL-encodes the deployment and asserts on missing
  config (AC6 boundary).
- ⚠️ minor (m1): the `console.error("agent_failed:", e.message)` in
  `server.js` could echo upstream content into operator stdout. Demo-
  acceptable; documented in the impl review.
- ⚠️ minor (m2): no `AbortController` timeout on `fetcher`. Browser
  closes the tab if it ever hangs; not a demo blocker.

### `server.js` (modified)

- ✅ `MAX_BODY_BYTES = 8 * 1024` enforced via streaming length check —
  the safer pattern (we don't buffer first then measure).
- ✅ `503` when not configured; `400` on bad JSON / empty text;
  `502` on upstream/`az` errors. Distinct, debuggable status codes.
- ✅ Static-serve path unchanged; `startsWith(__dirname)` traversal
  guard preserved.
- ✅ Zero new runtime deps (still ADR-001 compliant).

### `chat-engine.js` (modified)

- ✅ `agenticReply()` and `probeAgentic()` are pure browser-side wrappers
  with injectable `fetcher` for tests.
- ✅ `probeAgentic()` swallows everything and returns `false` — exactly
  what the canned-fallback contract requires.

### `app.js` (modified)

- ✅ `send()` is now async; agentic-first with a `try/catch` that drops
  silently into the canned `setTimeout(400)` path.
- ✅ Body class `agentic` and badge are toggled only on a *successful*
  probe. No flicker.
- 💡 s1 (parking lot): on `agentic` mode, a small accent on the avatar
  would make the demo even clearer at a glance.

### `index.html`

- ✅ `<span id="agentic-badge" hidden aria-label="Agentic mode is on">`
  is hidden by default and revealed only after a positive probe. No
  layout shift in canned mode.

### `styles.css`

- ✅ Pill matches the existing `.clear` chip; `.agentic-badge[hidden]`
  hides cleanly.
- 💡 s2: `:focus-visible` improvements still parked from F-002.

### `.env.example`

- ✅ Three new variables, **no values**. AC6 verified by inspection and
  by `git diff` review.
- ✅ Comment block points at ADR-003 and reminds the reader to `az login`.

### `tests/agent.test.js` (new — 12 cases)

- ✅ One `describe` per public symbol; AC tags where applicable.
- ✅ Persona contract test (AC4 anchor).
- ✅ Negative cases on `parseReply` (empty / malformed) and
  `fetchAzureToken` (missing token / non-JSON stdout).
- ✅ Determinism via DI — no real `az`, no real `fetch`.

### `tests/dom.test.js` (modified — +3 cases)

- ✅ The 5 existing F-001/F-002 cases are unchanged and still green.
- ✅ The new "F-006 agentic mode" block stubs `globalThis.fetch` per
  test and `vi.unstubAllGlobals()` in `afterEach` — no test pollution.
- ✅ The fallback test mixes real-fetch-stubs with fake timers via
  `vi.advanceTimersByTimeAsync()` — the correct vitest 1.x pattern.

### `docs/architecture/adr/ADR-003-azure-agentic-mode.md` and canonical mirror

- ✅ Status: Accepted; explicitly **amends** ADR-002 (the canned-replies
  decision) instead of replacing it.
- ✅ "Rejected alternatives" lists API keys, SDKs, and direct browser →
  Azure calls — each with one-line rationale.
- ✅ Validation criteria are testable and tied back to the AC matrix.

### `docs/product/prd.md` and `docs/product/backlog.md`

- ✅ PRD section 9 is an addendum, not a rewrite — the original PRD
  remains the historical record of F-001/F-002.
- ✅ Backlog F-006 has 7 ACs, each tied to a test case in the changes log.

## Security Review

| Check | Result |
|-------|--------|
| Secrets in committed files | None — `.env.example` only has placeholders |
| Token in browser | No — token never leaves the server process |
| Shell injection via `az` | Mitigated — `spawn` array args, `shell:false` |
| XSS via model output | Mitigated — `textContent` only, no `innerHTML` of model output |
| Body-size DoS | Mitigated — 8 KiB cap |
| Path traversal | Mitigated — preserved from F-002 |
| Dependency surface | Unchanged — zero runtime deps |

## Decision

✅ APPROVE — squash-merge to `main`.