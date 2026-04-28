<!-- markdownlint-disable-file -->
# ADR-001 — Static stack (HTML + CSS + ES modules), zero build

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-04-28 |
| Deciders | SDLC Orchestrator agent, System Architecture Reviewer agent |
| Supersedes | — |
| Superseded by | — |

## Context

Demo Chat TPM is a 15-minute presentation prop. It must open instantly in any
browser, with no install steps, no auth, no API keys, and ideally be hostable
on GitHub Pages. A `npm install && npm test` path is required so the agentic
test artifacts (vitest + jsdom) remain runnable, but the application itself
must work without any build pipeline.

## Decision

Ship a single-page app made of `index.html` + `styles.css` + two ES module
files: `chat-engine.js` (pure logic, no DOM access) and `app.js` (DOM glue).
A tiny zero-dependency `server.js` serves the static files for `npm start`.
Tests use `vitest` + `jsdom`.

State is in memory only. No framework, no bundler, no backend.

## Consequences

**Positive**

- Zero runtime dependencies; trivial supply-chain surface.
- Trivial to read live during the demo.
- Hostable as-is on GitHub Pages without configuration.
- Pure logic in `chat-engine.js` is unit-testable without DOM.

**Negative**

- No componentization — acceptable given the scope (~200 LOC).
- No type safety — acceptable for a demo prop. A real project would add
  TypeScript per its `instructions/typescript.instructions.md`.

## Rejected alternatives

- **React + Vite** — more representative of a modern frontend, but tooling
  setup would dominate the demo time.
- **Express backend** — unnecessary; canned replies live happily client-side.

## Validation

- `npm test` ⇒ 15/15 passing on the chat engine and DOM integration suites.
- `npm start` ⇒ static server on `$PORT`.
- Manual: opening `index.html` directly without a server also works.
