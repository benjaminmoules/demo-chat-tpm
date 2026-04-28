<!-- markdownlint-disable-file -->
# Changes Log: F-001 — Base Chat UI (Issue #1)

| Field | Value |
|---|---|
| Plan | `.copilot-tracking/plans/2026-04-28/F-001-base-chat-ui-plan.instructions.md` |
| Branch | feat/F-001-base-chat-ui |
| PR | #3 (squash-merged into `main`) |
| Date | 2026-04-28 |

## Files Changed

| File | Type | Notes |
|------|------|-------|
| `index.html` | added | chat frame, header, thread (`aria-live="polite"`), composer form |
| `styles.css` | added | bubble styles, focus state, pop-in animation |
| `app.js` | added | `appendBubble`, `send`, fake 400 ms delay, greeting on load |

## Acceptance Criteria Verification

| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 input + Send + empty thread on load | PASS | `index.html` contains `#input`, `button.send`, empty `#thread` |
| AC2 Enter or Send appends user bubble | PASS | `app.js` form submit → `send()` → `appendBubble(_, "user")` |
| AC3 bot bubble after ~400 ms | PASS | `setTimeout(_, 400)` in `send()` |
| AC4 thread auto-scrolls to last message | PASS | `thread.scrollTop = thread.scrollHeight` after each append |
| AC5 empty / whitespace messages ignored | PASS | early-return on `trim() === ""` |

## Discoveries / Follow-ups

- Replied bot text is currently `"You said: <text>"` — placeholder until F-002.
- Reply logic should be moved to a pure module before F-002 (recorded in
  the F-002 plan as Phase 1).

## Test Results

- Manual run-through of AC matrix: all green.
- No automated tests on this branch (added in F-002).
