# ADR-002 — Canned, deterministic-ish bot replies

- **Status**: Accepted
- **Date**: 2026-04-28
- **Deciders**: Orchestrator agent, Product advisor agent

## Context

The bot needs to feel "TPM-flavored" without depending on a remote LLM. We
want the demo to work offline, with no API key, and produce predictable
output we can rehearse against.

## Decision

Use a static library of TPM-flavored responses, grouped by intent
(`status`, `blockers`, `roadmap`, `standup`, `okr`, `default`). On each user
message, classify against a few keyword sets and pick a response from the
matching group, avoiding the immediately previous one to keep variety.

## Consequences

**Positive**
- Works fully offline, no key management.
- Reproducible — easy to rehearse and screenshot.
- Trivial to extend (just add strings to the library).

**Negative**
- Not "smart". This is fine and even part of the joke.

## Rejected alternatives

- **Real LLM call (OpenAI / Azure)**: requires a key, network, costs, and
  introduces non-determinism that hurts a live demo.
- **Markov / template engine**: more code than the joke deserves.
