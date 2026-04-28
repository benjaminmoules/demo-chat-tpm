# HVE Core lifecycle — state file

> Living trace of the orchestration. Updated by the Orchestrator agent at
> every transition. Survives `/clear` and `/compact` so any chat can pick up
> where the previous one stopped.

## Project

- **Name**: Demo Chat TPM
- **Repo**: github.com/benjaminmoules/demo-chat-tpm
- **Goal**: Demo prop for HVE Core orchestration philosophy.

## Phase log

| Phase | Agent | Output | Status |
|-------|-------|--------|--------|
| Discovery | Product Advisor | `docs/product/prd.md` | ✅ |
| UX | UX/UI Designer | `docs/product/mockup.html` | ✅ |
| Architecture | Architecture Reviewer | `docs/architecture/adr/ADR-001`, `ADR-002` | ✅ |
| Schema | (skipped — no DB) | — | ➖ |
| Backlog → GitHub | Backlog Manager | issues #1, #2 with AC | ✅ |
| Implement F-001 | RPI agent (research → plan → implement) | PR #1 | ✅ |
| Test F-001 | QA Product agent | PR #1 review | ✅ |
| Merge F-001 | PR Reviewer | merged to `main` | ✅ |
| Implement F-002 | RPI agent | PR #2 | ✅ |
| Test F-002 | QA Product agent | PR #2 review | ✅ |
| Merge F-002 | PR Reviewer | merged to `main` | ✅ |

## Decisions captured

- ADR-001 — Static stack (HTML/CSS/JS), no build, no backend.
- ADR-002 — Canned TPM-flavored replies, offline, deterministic-ish.

## Conventions enforced this run

- One feature per branch (`feat/F-001-*`, `feat/F-002-*`).
- One PR per feature, linked to its issue, with explicit AC checklist.
- Implementation plan validated by a dedicated agent before any code is written.
- State file (this file) updated at every transition.

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

## Next (parked)

- F-003 localStorage persistence.
- F-004 light/dark toggle.
- F-005 export thread as Markdown.
