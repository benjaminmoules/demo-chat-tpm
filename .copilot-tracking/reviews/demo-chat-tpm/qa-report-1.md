<!-- markdownlint-disable-file -->
# QA Product Validation Report: Issue #1

**Feature:** Base Chat UI (input, bubbles, echo bot)
**Issue:** #1
**Date:** 2026-04-28
**Branch:** `feat/F-001-base-chat-ui`

## Verdict: PASS

**Confidence:** High

## Feature Summary

A visitor types a message, sees their bubble appear, and a bot reply follows
shortly after. The page is interactive immediately on load. This delivers
the *foundation* of the demo; personality is intentionally deferred to #2.

## Implicit Expectations Identified

- Input is focused on load so users can type immediately.
- Whitespace-only messages should be silently ignored (no error toast).
- Long messages should wrap rather than overflow.
- The thread region should be announced by assistive tech.

## Acceptance Criteria Validation

| AC | Verdict | Justification |
|----|---------|---------------|
| AC1 | PASS | `index.html` declares `#input`, `button.send`, and an empty `#thread`. Greeting bubble appears on `DOMContentLoaded`. |
| AC2 | PASS | Form `submit` event triggered by Enter or click both run `send()`, which calls `appendBubble(_, "user")`. |
| AC3 | PASS | `setTimeout(..., 400)` → `appendBubble(_, "bot")`. |
| AC4 | PASS | `thread.scrollTop = thread.scrollHeight` after each append. |
| AC5 | PASS | Early return on `String(text).trim() === ""`. |

## User Scenarios

### Happy path

- Open page → greeting visible, input focused → type "hi" → Enter → user
  bubble + bot echo. ✅

### Edge cases

- Send 50 messages → thread keeps scrolling to bottom, no jank. ✅
- Send a 1 000-char message → bubble wraps inside the frame (`word-wrap`). ✅
- Tab order: input → Send → presets (added in #2). ✅

### Failure scenarios

- Disable JS → empty page (acceptable for a demo prop, not blocking).
- Resize window very narrow → frame stays at `max-width`, content shrinks.

### Misuse

- Click Send 10× rapidly with empty input → nothing appears. ✅

## Implementation Review Cross-Reference

The Implementation Validator found 0 Critical / 0 Major. Minor `m1` and
suggestion `s1` are routed to F-002 (placeholder text and engine
extraction). Neither blocks shipping #1.

## Blocking Issues

None.

## Sign-off

- ✅ Recommended to merge PR #3.
