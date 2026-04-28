# Backlog — Demo Chat TPM

Translated from the PRD into prioritized features. For the demo, only the
top 2 are shipped — the rest are intentionally parked.

| Rank | ID | Feature | Status |
|------|----|---------|--------|
| 1 | F-001 | Base chat UI (input, bubbles, echo bot) | ✅ Shipped (PR #1) |
| 2 | F-002 | TPM personality + preset prompts | ✅ Shipped (PR #2) |
| 3 | F-003 | Conversation persistence (localStorage) | 🅿️ Parked |
| 4 | F-004 | Light/dark theme toggle | 🅿️ Parked |
| 5 | F-005 | Export chat as Markdown | 🅿️ Parked |

## F-001 — Base chat UI

**As a** visitor
**I want** to type a message and see it appear in a chat thread with a bot reply
**So that** I can interact with the demo.

**Acceptance criteria**
- AC1. The page shows an input, a send button, and an empty thread on load.
- AC2. Pressing Enter or clicking Send appends my message as a "user" bubble.
- AC3. After ~400ms a "bot" bubble appears containing a reply.
- AC4. The thread auto-scrolls to the latest message.
- AC5. Empty messages are ignored.

## F-002 — TPM personality + presets

**As a** visitor
**I want** the bot to sound like a TPM and offer one-click prompts
**So that** the demo is fun and easy to drive without typing.

**Acceptance criteria**
- AC1. Replies are picked from a TPM-flavored library (sprints, OKRs, JIRA,
  roadmaps, standups, dependencies, blockers).
- AC2. Replies vary across consecutive identical questions (no two in a row).
- AC3. At least 4 preset prompt buttons are visible above the input.
- AC4. Clicking a preset sends that prompt as if typed.
- AC5. A "Clear" button empties the thread.
