<!-- markdownlint-disable-file -->
# PR Review: PR #4 — F-002 TPM Personality + Preset Prompts

| Field | Value |
|---|---|
| Branch | `feat/F-002-tpm-personality` → `main` |
| Issue | #2 |
| Date | 2026-04-28 |
| Reviewer | PR Review agent |
| HEAD | `bf5e555` (squash-merged) |

## Summary

| Metric | Count |
|---|---|
| Files reviewed | 9 |
| Critical | 0 |
| Major (blocking) | 0 |
| Minor | 2 |
| Suggestion | 2 |
| Tests | 15/15 passing |

The plan was executed faithfully: pure logic was extracted to
`chat-engine.js` *before* personality was added, the DOM glue was rewritten
as a module, and a complete test stack (`vitest` + `jsdom`) was introduced
with 15 cases covering all current ACs and regressing all F-001 ACs.
QA Product agent: PASS / High. **APPROVE.**

## File-by-file Notes

### `chat-engine.js` (new, pure logic)

- ✅ Zero DOM imports; safe in Node.
- ✅ `createReplyPicker()` accepts an injectable `rng` — exact pattern
  required by `instructions/javascript.instructions.md` for testability.
- ⚠️ minor (m1): keyword classifier matches substrings (`block` matches
  inside `unblock`). Acceptable for demo; documented.
- ⚠️ minor (m2): `INTENTS` order matters (first-match-wins). Tests pin
  current order. Documented.

### `app.js` (rewritten)

- ✅ Now strictly DOM glue.
- ✅ Preset click handler delegates through the same `send()` — no code
  duplication.
- ✅ `window.__demo` exposed for devtools-only usage; not relied on by tests.

### `index.html`

- ✅ `<script type="module" src="app.js">`.
- ✅ Presets use `data-prompt` payload, not inline `onclick`.
- ✅ Clear button has `aria-label`.

### `styles.css`

- ✅ Pill style for `.preset` matches the mockup.
- 💡 s1: focus-visible style on `.preset` and `.clear` would improve
  keyboard UX. Routed to a future iteration.

### `package.json` / `server.js`

- ✅ No runtime deps; dev deps are limited to vitest + jsdom.
- ✅ `server.js` performs explicit path-traversal protection
  (`!target.startsWith(__dirname)` ⇒ 403).
- 💡 s2: could add `vitest --coverage` script.

### `tests/chat-engine.test.js`

- ✅ One `describe` per behavior; AC tags in test names.
- ✅ Negative test ("returns 'default' when no keyword matches").
- ✅ Determinism test (same rng → same output).

### `tests/dom.test.js`

- ✅ Uses `vi.useFakeTimers()` to advance the 400 ms typing delay
  deterministically.
- ✅ Re-imports the module per test (`vi.resetModules()`) so DOM listeners
  attach to a fresh document.

## Security Review

| Check | Result |
|-------|--------|
| XSS via user input | Mitigated — `textContent` everywhere, no `innerHTML` on user data |
| Path traversal in `server.js` | Mitigated — explicit `startsWith(__dirname)` check |
| Dependency surface | Dev-only; no runtime deps |

## Decision

✅ APPROVE — squash-merge to `main`.
