<!-- markdownlint-disable-file -->
# Implementation Review — Issue #2: TPM Personality + Preset Prompts

| Field | Value |
|---|---|
| Date | 2026-04-28 |
| Plan | `.copilot-tracking/plans/2026-04-28/F-002-tpm-personality-plan.instructions.md` |
| Changes Log | `.copilot-tracking/changes/2026-04-28/F-002-tpm-personality-changes.md` |
| Branch | `feat/F-002-tpm-personality` |
| Reviewer | Implementation Validator (subagent of RPI) |
| Test Results | 15/15 passing (10 unit + 5 integration) |

## Severity Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| Major | 0 |
| Minor | 2 |
| Suggestion | 2 |

## Acceptance Criteria Coverage

| AC | Status | Evidence |
|---|---|---|
| AC1 TPM-flavored library across multiple intents | ✅ Covered | `chat-engine.js` `REPLIES` keys; `tests/chat-engine.test.js` `classify()` block |
| AC2 no two replies in a row from the same bucket | ✅ Covered | `createReplyPicker()` rotation; deterministic test asserts rotation |
| AC3 ≥ 4 preset prompt buttons | ✅ Covered | 5 buttons in `index.html` |
| AC4 clicking a preset sends the prompt | ✅ Covered | `tests/dom.test.js` "AC4: clicking a preset…" |
| AC5 Clear empties the thread | ✅ Covered | `tests/dom.test.js` "AC5: Clear empties…" |

## Regression — F-001 ACs

| AC | Status |
|---|---|
| AC1–AC5 of F-001 | ✅ All covered by `tests/dom.test.js` |

## Findings

### Minor — m1: classifier is keyword-based, not lemma-based

**File:** `chat-engine.js`
**Issue:** "blocked" matches `blockers` because of the `block` substring,
but "deblock" would also match. Acceptable for a demo; documented as a
known limitation.
**Recommendation:** Keep as-is. A real product would use a token-based
classifier or an LLM intent layer.
**Disposition:** ACCEPTED.

### Minor — m2: the `INTENTS` order matters

**File:** `chat-engine.js`
**Issue:** First-match-wins on the `INTENTS` array, so reordering changes
behavior. Tests pin the current order.
**Recommendation:** Add a code comment in the file. Consider
priority-based scoring in a future iteration.
**Disposition:** ACCEPTED.

### Suggestion — s1: expose engine for ad-hoc debugging

Already done: `window.__demo` is set in `app.js`. Not used by tests.
**Disposition:** SHIPPED.

### Suggestion — s2: add an `OKR` preset button

Initial draft had 4 presets; we shipped 5 (status, blockers, roadmap,
standup, OKR) to overshoot AC3 cheaply.
**Disposition:** SHIPPED.

## Architectural Conformance

- ✅ Honors ADR-001 (zero-dep runtime; deps are dev-only for tests).
- ✅ Honors ADR-002 (canned, deterministic-via-injection).
- ✅ Conforms to `.github/instructions/javascript.instructions.md`:
  pure logic separated from DOM, ESM, brief factual comments.
- ✅ Tests follow the prescribed pattern: one `describe` per behavior, AC
  tags in test names.

## Verdict

✅ APPROVED for QA Product validation.
