<!-- markdownlint-disable-file -->
# Implementation Plan: F-002 — TPM Personality + Preset Prompts (Issue #2)

| Field | Value |
|---|---|
| Issue | #2 — F-002 — TPM personality + preset prompts |
| Branch | feat/F-002-tpm-personality |
| Author | RPI Agent |
| Validated by | Plan Validator agent (1 minor: extract pure logic before touching the DOM glue — addressed below) |
| Date | 2026-04-28 |

## User Requests

1. Replies are picked from a TPM-flavored library (sprints, OKRs, JIRA,
   roadmaps, standups, dependencies, blockers).
2. No two replies in a row from the same bucket.
3. At least 4 preset prompt buttons are visible above the input.
4. Clicking a preset sends that prompt as if typed.
5. A "Clear" button empties the thread.

## Overview and Objectives

Extract the reply logic from `app.js` into a pure ES module (`chat-engine.js`)
with no DOM access, then add the personality library, classifier, no-repeat
picker, preset bar, and Clear button. Preserve all F-001 acceptance criteria
(regression-tested via the new DOM integration suite).

### Derived Objectives

- Create `chat-engine.js` exporting `INTENTS`, `REPLIES`, `classify()`,
  `createReplyPicker()`, `botReply()`. The picker accepts an injectable
  `rng` for deterministic tests.
- Convert `app.js` to a module that imports from `chat-engine.js`.
- Switch `<script>` to `<script type="module">` in `index.html`.
- Add presets bar in markup with `data-prompt` payloads.
- Add Clear button in the header; empty `thread` and re-add greeting.
- Add unit tests `tests/chat-engine.test.js` covering all six buckets,
  case-insensitivity, no-repeat behavior, and determinism.
- Add integration tests `tests/dom.test.js` (jsdom) covering AC1–AC5 of
  F-001 (regression) and AC4–AC5 of F-002.

## Context Summary

- ADR-002 (canned replies) — [`.copilot-tracking/adrs/2026-04-28/ADR-002-canned-responses.md`](../../adrs/2026-04-28/ADR-002-canned-responses.md)
- F-001 plan & changes log
- Conventions: [`.github/instructions/javascript.instructions.md`](../../../.github/instructions/javascript.instructions.md)

## Implementation Checklist

### Phase 1: Pure logic extraction <!-- parallelizable: false -->

- [ ] 1.1 Create `chat-engine.js` with `INTENTS`, `REPLIES`, `classify()`,
      `createReplyPicker(replies = REPLIES, rng = Math.random)`, `botReply()`.
- [ ] 1.2 No DOM imports; safe to run in Node.

### Phase 2: DOM glue refactor <!-- parallelizable: false -->

- [ ] 2.1 Rewrite `app.js` as a module importing from `chat-engine.js`.
- [ ] 2.2 Switch `<script>` tag to `type="module"`.

### Phase 3: New UI affordances <!-- parallelizable: true -->

- [ ] 3.1 Presets bar in `index.html` with 5 buttons (≥ 4 required by AC3).
- [ ] 3.2 Clear button in header.
- [ ] 3.3 Styles for `.presets`, `.preset`, `.clear`.

### Phase 4: Tests <!-- parallelizable: true -->

- [ ] 4.1 `tests/chat-engine.test.js` — 10 unit cases.
- [ ] 4.2 `tests/dom.test.js` — 5 integration cases via jsdom.
- [ ] 4.3 Add `package.json` with `vitest`, `jsdom`, `npm test`, `npm start`.

### Phase 5: Validation <!-- parallelizable: false -->

- [ ] 5.1 `npm test` green.
- [ ] 5.2 Manual run-through of AC matrices for #1 and #2.
- [ ] 5.3 QA Product agent report.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| ESM imports break direct file:// open in Chrome | Document the trade-off in README; demo opens fine via `npm start` and works in Firefox via file:// |
| No-repeat picker drifts when rng is biased | Inject rng in tests; force-collision case asserts rotation |
| Regression of F-001 AC during refactor | DOM integration suite re-asserts AC1–AC5 of F-001 |

## Success Criteria

- All 5 acceptance criteria from issue #2 met.
- All 5 acceptance criteria from issue #1 still met (regression).
- 15/15 tests passing locally and in CI.
