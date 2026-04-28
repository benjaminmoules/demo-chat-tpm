<!-- markdownlint-disable-file -->
# QA Product Validation Report: Issue #2

**Feature:** TPM Personality + Preset Prompts
**Issue:** #2
**Date:** 2026-04-28
**Branch:** `feat/F-002-tpm-personality`

## Verdict: PASS

**Confidence:** High

## Feature Summary

The bot now sounds like a TPM. Users can either type a question or click
one of 5 quick prompts; replies are picked from intent-tagged pools and
never repeat consecutively in the same pool. A Clear button resets the
thread and shows a fresh greeting.

## Implicit Expectations Identified

- Pressing the same preset twice should produce two *different* replies.
- `Clear` should not lose a draft message in the input.
- Pure logic should run in Node so the engine can be unit-tested without a
  browser (architectural expectation surfaced by ADR-001).

## Acceptance Criteria Validation

| AC | Test Coverage | Verdict |
|----|---------------|---------|
| AC1 TPM-flavored library across multiple intents | `tests/chat-engine.test.js` — `classify()` block (6 cases) | PASS |
| AC2 no two in a row from the same bucket | `tests/chat-engine.test.js` — "never returns the same reply twice in a row" with deterministic `() => 0` rng | PASS |
| AC3 ≥ 4 preset prompt buttons | `index.html` declares 5 buttons; integration test queries them by `data-prompt` | PASS |
| AC4 clicking a preset sends the prompt as if typed | `tests/dom.test.js` — "AC4: clicking a preset…" | PASS |
| AC5 Clear empties the thread | `tests/dom.test.js` — "AC5: Clear empties the thread…" | PASS |

## Regression — Issue #1

| AC | Test | Verdict |
|----|------|---------|
| AC1 input + Send + empty thread on load | `dom.test.js` "AC1: input, Send button and a greeting bubble…" | PASS |
| AC2 Enter / Send appends user bubble | `dom.test.js` "AC2 + AC3: typing a message and submitting…" | PASS |
| AC3 bot bubble after ~400 ms | same test, fake timers advance 500 ms | PASS |
| AC4 auto-scroll | manual | PASS |
| AC5 empty input ignored | `dom.test.js` "AC5: empty / whitespace input is ignored" | PASS |

## Test Results

- **New AC tests:** 5/5 passing (`tests/dom.test.js`)
- **Engine unit tests:** 10/10 passing (`tests/chat-engine.test.js`)
- **Full suite:** 15/15 (0 failures)

## User Scenarios

### Happy path

- Click each preset in turn → 5 different replies, all from the matching
  bucket. ✅
- Type "what's the status" → reply from `status` bucket. ✅

### Edge cases

- Type the same prompt twice → two different replies (AC2). ✅
- Click Clear with active typing in the input → input keeps its draft
  (verified manually; not strictly required by AC5). ✅
- Type "asdfgh" → reply comes from `default` bucket. ✅

### Failure scenarios

- No network involved; offline-equivalent. ✅

## Security Validation

| Check | Result |
|-------|--------|
| XSS via user input | Mitigated — `textContent` only; never `innerHTML` for user data |
| Prototype pollution via preset payloads | Mitigated — `data-prompt` is a string, no JSON parsing |
| Open redirect / external nav | N/A — no anchors, no fetch |

## Implementation Review Cross-Reference

The Implementation Validator found 0 Critical / 0 Major. Minor `m1` and
`m2` (keyword classifier limitations and ordering) are accepted with
documentation. No fixes required before merge.

## Blocking Issues

None.

## Sign-off

- ✅ Recommended to merge PR #4.
