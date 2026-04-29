<!-- markdownlint-disable-file -->
# SDLC State: Demo Chat TPM

## Feature

- **Name**: Demo Chat TPM
- **Slug**: demo-chat-tpm
- **Branch**: main
- **Started**: 2026-04-28
- **PRD Path**: docs/product/prd.md
- **Mockup**: yes (docs/product/mockup.html)
- **DB**: no (pure client-side state)

## Current Phase

- **Phase**: 9 — Release Gate (looping for next feature parking lot)
- **Status**: idle
- **Active Issue**: —
- **Active Branch**: —

## Feature Progress

| Issue | Title | Branch | Status | PR | Date |
|-------|-------|--------|--------|----|------|
| #1 | F-001 — Base chat UI (input, bubbles, echo bot) | feat/F-001-base-chat-ui (deleted) | done | #3 (merged) | 2026-04-28 |
| #2 | F-002 — TPM personality + preset prompts | feat/F-002-tpm-personality (deleted) | done | #4 (merged) | 2026-04-28 |
| #5 | F-006 — Agentic mode via Azure CLI + Azure OpenAI gpt-mini | feat/F-006-agentic-azure (deleted) | done | #5 (merged) | 2026-04-28 |

## Phase Log

| Phase | Name | Status | Artifact | Completed |
|-------|------|--------|----------|-----------|
| 1 | Discovery | done (human) | — | 2026-04-28 |
| 2 | PRD Definition | done | docs/product/prd.md | 2026-04-28 |
| 3 | Backlog Planning | done | docs/product/backlog.md · GitHub issues #1, #2 | 2026-04-28 |
| 4 | Mockup | done | docs/product/mockup.html | 2026-04-28 |
| 5 | Architecture and ADRs | done | .copilot-tracking/adrs/2026-04-28/ (ADR-001..ADR-003) · docs/architecture/adr/ (mirror) | 2026-04-28 |
| 6 | DB Schema | skipped | no DB in scope | 2026-04-28 |
| 7 | RPI Implementation | done | .copilot-tracking/plans/2026-04-28/ · .copilot-tracking/changes/2026-04-28/ (F-001, F-002, F-006) | 2026-04-28 |
| 8 | PR Review | done | .copilot-tracking/reviews/demo-chat-tpm/pr-review-1.md · pr-review-2.md · pr-review-3.md | 2026-04-28 |
| 9 | Release Gate | done | merged into main; tags pending | 2026-04-28 |

## Tracking Artifacts

| Kind | Path |
|------|------|
| State (this file) | `.copilot-tracking/sdlc/demo-chat-tpm/state.md` |
| ADRs | `.copilot-tracking/adrs/2026-04-28/` |
| Plans | `.copilot-tracking/plans/2026-04-28/` |
| Changes Logs | `.copilot-tracking/changes/2026-04-28/` |
| Implementation Reviews | `.copilot-tracking/reviews/demo-chat-tpm/implementation-review-*.md` |
| QA Reports | `.copilot-tracking/reviews/demo-chat-tpm/qa-report-*.md` |
| PR Reviews | `.copilot-tracking/reviews/demo-chat-tpm/pr-review-*.md` |

## Conventions Enforced This Run

- One feature per branch (`feat/F-XXX-*`).
- One PR per feature, linked to its issue, with explicit AC checklist.
- Implementation plan validated by a dedicated agent before any code is written.
- State file (this file) updated at every phase transition.
- All comments in code remain brief and factual; no narrative commentary.

## Lessons (carry-over from previous projects)

- Too many features at once → the agent loses context and runs collapse.
  Limit to 1 in-flight feature.
- Always produce, then *verify*, an implementation plan. Coding without a
  plan correlates strongly with rework.
- When the token budget gets tight, use `/clear` or `/compact`. Don't push
  through.
- One chat per request. If a request is complex, ask a planning chat to
  draft the next prompt precisely, then send it from a fresh chat.
- Verify outputs at every important step — agent output quality decays
  silently as context fills up.
- A clean `.github/instructions/<lang>.instructions.md` per language is the
  single highest-leverage piece of agent setup.

## Parking Lot

- F-003 — localStorage persistence
- F-004 — light/dark theme toggle
- F-005 — export thread as Markdown
- Follow-ups from F-006: token cache until `expiresOn`; `AbortController`
  timeout in `callAgent()`; deployment-aware persona variants.

## 2026-04-29 — F-006 post-merge fix

- Live Azure resources provisioned: `rg-demo-chat-tpm` (eastus2) →
  `aif-tpm-oyfrh` AIServices account → `gpt-5-mini` deployment
  (GlobalStandard, capacity 50). RBAC: current user granted
  `Cognitive Services OpenAI User` on the account scope.
- Auth fix in `agent.js`: `--resource` takes a bare URI
  (`https://cognitiveservices.azure.com`); the `/.default` suffix is
  `--scope` syntax. The mismatch surfaced as `AADSTS500011` against the
  resource tenant once we ran the smoke test against live infra. Test
  in `tests/agent.test.js` updated to match.
- gpt-5 model quirks captured in `buildRequest`: only `temperature: 1`
  is accepted; reasoning tokens count toward the budget so we use
  `max_completion_tokens: 600` and `reasoning_effort: "minimal"`.
- Better error translation in `runAz` for stale `az` sessions
  (`AADSTS700082` etc.) so the operator gets a one-line remediation.
- Live verification: `npm run smoke:agent` passes; `POST /api/agent`
  on the running server returns model-backed replies. See post-merge
  section in `.copilot-tracking/changes/2026-04-28/F-006-agentic-azure-changes.md`.
