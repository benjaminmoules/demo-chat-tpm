# ADR-003 — Opt-in agentic mode via Azure CLI + Azure OpenAI gpt-mini

- **Status**: Accepted (amends ADR-002)
- **Date**: 2026-04-28
- **Deciders**: Orchestrator agent, Architecture reviewer agent, Product advisor agent

> Canonical copy. Mirror lives at `docs/architecture/adr/ADR-003-azure-agentic-mode.md`.

## Context

ADR-002 chose canned, deterministic replies to keep the demo offline, key-free,
and reproducible. A follow-up demo asks for a real, model-backed reply with
a strong TPM persona — without giving up the static-stack promises of
ADR-001.

## Decision

Add an **opt-in agentic mode**, off by default. Auth via local Azure CLI
session (`az account get-access-token`), called from `server.js`. Browser
hits a `/api/agent` proxy. Config via three `.env` vars; missing vars =
agentic disabled = canned replies (ADR-002) unchanged.

A single short system prompt drives the persona: an over-caffeinated TPM,
1–2 sentences, dry humour, never breaks character.

## Consequences

- Zero runtime npm deps preserved (native `fetch`, `child_process`, `http`).
- No secrets in the repo. No tokens in the browser.
- Failure mode is safe: any server-side error → canned fallback.
- Replies become non-deterministic in agentic mode; rehearse with canned.

## Rejected alternatives

- API keys in `.env` (avoids `az` but reintroduces secrets).
- `@azure/identity` + `@azure/openai` SDKs (violates ADR-001 zero-dep).
- Direct browser → Azure OpenAI calls (token exposure).
- Always-on agentic (breaks offline rehearsal).

## Validation

- Tests green with mode disabled (regression: 15/15 of F-001 + F-002).
- Health endpoint reports correct `{enabled}`.
- Network failure during `/api/agent` produces a canned reply.
- No secret-shaped strings in fixtures or committed files.
