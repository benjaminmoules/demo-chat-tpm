<!-- markdownlint-disable-file -->
# ADR-002 — Canned, deterministic-ish bot replies

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-04-28 |
| Deciders | SDLC Orchestrator agent, Product Manager Advisor agent |
| Supersedes | — |
| Superseded by | — |

## Context

The bot needs to feel "TPM-flavored" without depending on a remote LLM. We
want the demo to work offline, without an API key, and produce predictable
output we can rehearse against during a live presentation.

## Decision

Use a static library of TPM-flavored responses, grouped by intent
(`status`, `blockers`, `roadmap`, `standup`, `okr`, `default`). On each user
message, classify against keyword sets per intent and pick a response from
the matching group, avoiding the immediately-previous index per bucket
(no-repeat picker). The reply picker accepts an injectable `rng` so tests
remain deterministic.

## Consequences

**Positive**

- Works fully offline — no key, no network, no cost.
- Deterministic under test via injected `rng`.
- Trivial to extend: add a row in `INTENTS` and an entry in `REPLIES`.

**Negative**

- Not "smart". This is intentional and part of the joke.

## Rejected alternatives

- **Real LLM call (OpenAI / Azure)**: requires a key, network, costs, and
  introduces non-determinism that hurts a live demo.
- **Markov / template engine**: more code than the joke deserves.

## Validation

- `tests/chat-engine.test.js` AC2 case asserts no two replies in a row from
  the same bucket, even when the rng repeats the same index.
- Determinism test asserts identical output for identical injected rng.
