# ADR-001 — Static stack (HTML + CSS + vanilla JS)

- **Status**: Accepted
- **Date**: 2026-04-28
- **Deciders**: Orchestrator agent, Architecture reviewer agent

## Context

Demo Chat TPM is a 15-minute presentation prop. It must open instantly in any
browser, with no install steps, no auth, no API keys, and ideally be hostable
on GitHub Pages.

## Decision

Ship a single-page app made of `index.html` + `styles.css` + `app.js`. No
framework, no bundler, no backend. State lives in memory only.

## Consequences

**Positive**
- Zero build, zero dependency surface, zero supply-chain risk.
- Trivial to read live during the demo.
- Hostable as-is on GitHub Pages.

**Negative**
- No componentization — acceptable given the scope (~150 LOC).
- No type safety — acceptable for a demo prop.

## Rejected alternatives

- **React + Vite** — more representative of a modern frontend, but the
  audience would spend time on tooling instead of on the orchestration
  philosophy.
- **Express backend** — unnecessary; canned replies live happily in JS.
