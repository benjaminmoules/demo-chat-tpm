<!-- markdownlint-disable-file -->
# Implementation Plan: F-001 — Base Chat UI (Issue #1)

| Field | Value |
|---|---|
| Issue | #1 — F-001 — Base chat UI (input, bubbles, echo bot) |
| Branch | feat/F-001-base-chat-ui |
| Author | RPI Agent |
| Validated by | Plan Validator agent (no findings) |
| Date | 2026-04-28 |

## User Requests

1. Page shows an input, a Send button, and an empty thread on load.
2. Pressing Enter or clicking Send appends the message as a "user" bubble.
3. After ~400 ms a "bot" bubble is appended (echo only — personality lands
   in F-002).
4. Thread auto-scrolls to the latest message.
5. Empty / whitespace-only messages are ignored.

## Overview and Objectives

Stand up a single-page static chat with no build step, structured for the
incoming F-002 work. Pure DOM glue in `app.js`; pure logic (placeholder)
ready to be moved to `chat-engine.js` in F-002.

### Derived Objectives

- Create `index.html` with `frame > header > thread > composer` structure.
- Create `styles.css` with bubble styles, focus state, and a pop-in animation.
- Create `app.js` with `appendBubble()`, `send()`, fake 400 ms delay, and an
  initial greeting bubble on `DOMContentLoaded`.
- Wire `submit` and `Enter` through the form's native submit event.
- Add `aria-live="polite"` on the thread region for assistive tech.

## Context Summary

- Mockup: [`docs/product/mockup.html`](../../../docs/product/mockup.html)
- Architecture: [ADR-001](../../adrs/2026-04-28/ADR-001-static-stack.md)
- Conventions: [`.github/instructions/javascript.instructions.md`](../../../.github/instructions/javascript.instructions.md)

## Implementation Checklist

### Phase 1: Markup and styles <!-- parallelizable: true -->

- [ ] 1.1 `index.html` skeleton with frame, header, thread, composer.
- [ ] 1.2 `styles.css` variables, bubble styles, focus and pop-in animation.

### Phase 2: Behavior <!-- parallelizable: false -->

- [ ] 2.1 `appendBubble(text, who)` helper that returns the bubble node.
- [ ] 2.2 `send(text)` with trim, ignore-empty, fake 400 ms delay.
- [ ] 2.3 Greeting bubble on `DOMContentLoaded`, focus the input.

### Phase 3: Validation <!-- parallelizable: false -->

- [ ] 3.1 Manual: open `index.html` in a browser, run the AC matrix.
- [ ] 3.2 Hand off to QA Product agent for AC validation.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Module/inline-script confusion when adding a build later | Keep `<script>` plain for now; F-002 will switch to `type="module"` once a real ESM import is needed |
| Thread overflow on long messages | `word-wrap: break-word` on `.bubble` |
| Accessibility regressions | `aria-live="polite"` on thread; explicit `aria-label`s |

## Success Criteria

- All 5 acceptance criteria from issue #1 are demonstrably met.
- No build step required.
- Page loads and is interactive in <1 s on a modern browser.
