# ADR-003 — Opt-in agentic mode via Azure CLI + Azure OpenAI gpt-mini

- **Status**: Accepted (amends ADR-002)
- **Date**: 2026-04-28
- **Deciders**: Orchestrator agent, Architecture reviewer agent, Product advisor agent

## Context

ADR-002 chose canned, deterministic replies to keep the demo offline, key-free,
and reproducible. The follow-up demo asks for a *truly agentic* moment: a
real LLM reply, with a strong TPM persona, to show that the same SDLC scales
from a static prop to a real model-backed feature. Constraints from ADR-001
still apply (zero runtime dependencies, no bundler, no auth flows in the
browser).

## Decision

Add an **opt-in agentic mode**, off by default, that wires the existing chat
to Azure OpenAI's chat-completions API for a `gpt-*-mini` deployment.

- **Auth**: the dev's local **Azure CLI** session. The server shells out to
  `az account get-access-token --resource https://cognitiveservices.azure.com`
  and uses the bearer token. No API keys, no secrets in `.env`, nothing in
  the browser.
- **Configuration**: three env vars in `.env`:
  `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`
  (with a sensible default). When any are missing, agentic mode is *disabled*
  and the canned engine from ADR-002 is used unchanged.
- **Topology**: a thin endpoint on the existing zero-dep `server.js`:
  - `GET  /api/agent/health` → `{ enabled: boolean }`
  - `POST /api/agent`        → `{ reply: string }`
  The browser probes `/health` on load; on success it calls `/api/agent`
  for each message. On any error (network, 4xx/5xx, timeout, malformed
  payload) it falls back to the canned reply silently.
- **Persona**: a single short system prompt — "over-caffeinated TPM, 1–2
  sentences, dry humour, never breaks character, never reveals it is an
  AI". The funny smart prompt is the whole point of the demo.

## Consequences

**Positive**
- The demo can show two modes side-by-side: canned (offline) and agentic
  (real model) without changing a line of UI code.
- No secrets in the repo; auth is a developer's existing `az login`.
- Still zero runtime npm dependencies — `node:child_process`, `node:http`,
  and native `fetch` are enough.
- Failure modes are safe: if anything goes wrong server-side, the user
  still sees a TPM reply (the canned one).

**Negative**
- Requires the developer to have the Azure CLI installed and logged in
  with access to a `gpt-*-mini` deployment.
- Replies are non-deterministic in agentic mode — rehearsal must use the
  canned mode for screenshot reproducibility.
- Adds an HTTP surface to `server.js`. Mitigated with strict request
  validation, body-size cap, and zero shell-string interpolation.

## Rejected alternatives

- **API keys in `.env`**: works, but the whole point of using `az` is to
  avoid shipping or rotating secrets for a demo.
- **`@azure/identity` + `@azure/openai` SDKs**: adds a runtime dep tree
  to a repo that explicitly has none (ADR-001). Token + `fetch` is enough.
- **Calling Azure OpenAI directly from the browser**: would expose a
  short-lived token to the page; unnecessary and a footgun. Server-side
  proxy stays.
- **Always-on agentic mode**: would break the offline-first demo and the
  rehearsal workflow. Opt-in keeps both modes valid.

## Validation criteria

- With no env vars set, behavior is byte-identical to the F-002 build
  (`/api/agent/health` returns `{enabled:false}`, all 15 existing tests
  pass).
- With env vars set and a logged-in `az`, the bot's reply on a typed
  message comes from the model and is replaced in-place of the
  "typing…" bubble.
- Killing the network mid-call still produces a TPM reply (canned
  fallback).
- No secret values appear in any committed file or test fixture.
