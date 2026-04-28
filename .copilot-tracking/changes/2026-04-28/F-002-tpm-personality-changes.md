<!-- markdownlint-disable-file -->
# Changes Log: F-002 — TPM Personality + Preset Prompts (Issue #2)

| Field | Value |
|---|---|
| Plan | `.copilot-tracking/plans/2026-04-28/F-002-tpm-personality-plan.instructions.md` |
| Branch | feat/F-002-tpm-personality |
| PR | #4 (squash-merged into `main`) |
| Date | 2026-04-28 |

## Files Changed

| File | Type | Notes |
|------|------|-------|
| `chat-engine.js` | added | pure logic: `INTENTS`, `REPLIES`, `classify()`, `createReplyPicker()`, `botReply()`; injectable `rng` |
| `app.js` | rewritten | DOM glue only; imports engine; adds preset and Clear handlers |
| `index.html` | modified | presets bar (5 buttons), Clear button, `<script type="module">` |
| `styles.css` | modified | pill style for `.preset`, ghost button for `.clear`, `.header-text` |
| `package.json` | added | scripts: `start`, `test`, `test:watch`; dev deps: `vitest`, `jsdom` |
| `server.js` | added | zero-dep static file server for `npm start` |
| `tests/chat-engine.test.js` | added | 10 unit cases |
| `tests/dom.test.js` | added | 5 integration cases via jsdom |
| `.env.example` | added | `PORT=5173` placeholder |

## Acceptance Criteria Verification

| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 TPM-flavored library across multiple intents | PASS | `REPLIES` covers `status`, `blockers`, `roadmap`, `standup`, `okr`, `default` |
| AC2 no two replies in a row from the same bucket | PASS | `createReplyPicker()` rotates index when `rng` repeats; unit-tested with deterministic `() => 0` |
| AC3 ≥ 4 preset prompt buttons | PASS | 5 buttons in `index.html` |
| AC4 clicking a preset sends the prompt as if typed | PASS | preset click delegates to the same `send()` |
| AC5 Clear empties the thread | PASS | `clearThread()` sets `thread.innerHTML = ""` and re-adds greeting |

## Regression — F-001 AC matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| AC1 input + Send + empty thread on load | PASS | covered by `dom.test.js` |
| AC2 Enter or Send appends user bubble | PASS | covered by `dom.test.js` |
| AC3 bot bubble after ~400 ms | PASS | covered by `dom.test.js` (vi fake timers) |
| AC4 thread auto-scrolls | PASS | manual |
| AC5 empty input ignored | PASS | covered by `dom.test.js` |

## Test Results

- `npm test` ⇒ **15 passing / 0 failing** (10 unit + 5 integration).
- No regression detected on F-001 AC matrix.

## Discoveries / Follow-ups

- ESM modules require serving over HTTP in Chrome — `npm start` documented.
- Parking-lot items appended to the state file: localStorage persistence,
  light/dark toggle, Markdown export.
