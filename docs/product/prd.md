# PRD — Demo Chat TPM

> Iterated with the **Product Advisor** agent. Kept deliberately tiny — this
> product is a *vehicle for a process demo*, not a real product.

## 1. Vision

A one-page browser chat that talks like an over-caffeinated TPM. It exists to
let the audience focus on **how** the codebase was assembled, not on the app.

## 2. Target user

A TPM buddy attending a 15-minute internal demo. They want to see the
orchestration philosophy applied end-to-end without being distracted by
infra, accounts, or build steps.

## 3. Goals

- G1. Show a working chat in **under 5 seconds** after opening the page.
- G2. Make the audience laugh at least once (TPM-flavored canned replies).
- G3. Demonstrate the full agentic SDLC lifecycle on **2 small features**.

## 4. Non-goals

- No real LLM call, no API key, no backend.
- No accounts, no persistence beyond the current page session.
- No mobile-specific design (desktop-first is fine for the demo).

## 5. User stories

- **US-1** — As a visitor, I can type a message, hit Enter, and see my message
  appear as a bubble followed by a bot reply.
- **US-2** — As a visitor, I can click a *preset prompt* (e.g. "Status of the
  release?", "Are we on track?") and the bot answers in TPM tone.

## 6. Functional scope (v1, the only version)

| Capability | In | Out |
|---|---|---|
| Single-page chat UI | ✅ | |
| Send on Enter / button | ✅ | |
| Bot reply (canned, TPM-flavored) | ✅ | |
| Preset prompt buttons | ✅ | |
| Clear conversation | ✅ | |
| Persistence | | ❌ |
| Auth | | ❌ |
| Streaming / typing indicator | ✅ (fake delay) | |

## 7. Success metrics (for the demo, not the product)

- The audience can read the full state file in `.copilot-tracking/state.md`
  and reconstruct the cycle that produced the code.
- Each of the 2 features ships through its own PR, with a linked issue and
  acceptance criteria.

## 8. Risks

- **Risk**: audience focuses on the chatbot quality. **Mitigation**: open by
  saying "the chatbot is intentionally dumb".
- **Risk**: live coding pressure. **Mitigation**: everything is pre-built;
  the demo is a *walkthrough* of the artifacts and Git history.
