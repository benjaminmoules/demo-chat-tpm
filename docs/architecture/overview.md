<!-- markdownlint-disable-file -->
# Architecture Overview — Demo Chat TPM

A single-page chat app with two interchangeable reply engines: a canned,
deterministic engine that ships by default, and an opt-in agentic engine
backed by Azure OpenAI.

The decisions behind this architecture live as ADRs in
[`.copilot-tracking/adrs/2026-04-28/`](../../.copilot-tracking/adrs/2026-04-28).
This file is the human-readable map; the ADRs are the source of truth.

| Decision | ADR |
|---|---|
| Static stack, zero build, ES modules | [ADR-001](../../.copilot-tracking/adrs/2026-04-28/ADR-001-static-stack.md) |
| Canned, deterministic-ish replies | [ADR-002](../../.copilot-tracking/adrs/2026-04-28/ADR-002-canned-responses.md) |
| Opt-in agentic mode (Azure CLI + Azure OpenAI) | [ADR-003](../../.copilot-tracking/adrs/2026-04-28/ADR-003-azure-agentic-mode.md) |

## Components

```mermaid
flowchart LR
    subgraph Browser
        UI[index.html + styles.css]
        APP[app.js<br/>DOM glue]
        ENG[chat-engine.js<br/>pure logic]
    end

    subgraph Server["Node server.js (zero-dep)"]
        STATIC[Static files]
        PROXY[/api/agent proxy/]
        HEALTH[/api/agent/health/]
        AGENT[agent.js<br/>persona + Azure auth]
    end

    subgraph Azure["Azure (opt-in)"]
        AZCLI[az CLI<br/>local session]
        AOAI[Azure OpenAI<br/>gpt-mini deployment]
    end

    UI --> APP
    APP --> ENG
    APP -. agentic on .-> PROXY
    PROXY --> AGENT
    AGENT --> AZCLI
    AGENT --> AOAI
    APP --> STATIC
    APP -. probe .-> HEALTH
```

* `chat-engine.js` is **pure** — no DOM, no network — and is fully
  unit-tested. It owns intent classification and the no-repeat reply
  picker (ADR-002).
* `app.js` is the only DOM consumer. It calls the engine for canned
  replies and, when agentic mode is enabled and healthy, posts to
  `/api/agent` instead.
* `server.js` serves static files and, only when all three
  `AZURE_OPENAI_*` env vars are set, exposes `/api/agent` and
  `/api/agent/health`.
* `agent.js` shells out to `az account get-access-token` and proxies
  requests to Azure OpenAI with the locked TPM persona prompt.

## Reply flow — canned mode (default)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant APP as app.js
    participant ENG as chat-engine.js

    U->>APP: types message + Enter
    APP->>ENG: classify(text)
    ENG-->>APP: intent (status / blockers / …)
    APP->>ENG: botReply(intent, picker)
    ENG-->>APP: TPM-flavored string
    APP-->>U: render bot bubble
```

## Reply flow — agentic mode (opt-in)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant APP as app.js
    participant SRV as server.js
    participant AG as agent.js
    participant AZ as az CLI
    participant AOAI as Azure OpenAI

    U->>APP: types message + Enter
    APP->>SRV: POST /api/agent { message }
    SRV->>AG: agenticReply(message)
    AG->>AZ: az account get-access-token
    AZ-->>AG: bearer token
    AG->>AOAI: chat/completions (SYSTEM_PROMPT + message)
    alt success
        AOAI-->>AG: completion
        AG-->>SRV: reply text
        SRV-->>APP: 200 { reply }
        APP-->>U: render bot bubble
    else any failure (no az, throttle, network, malformed)
        AG-->>SRV: error
        SRV-->>APP: non-200
        APP->>APP: fall back to chat-engine.js
        APP-->>U: render canned bubble
    end
```

The fallback path is the safety net required by ADR-003: any failure in
the agentic path silently degrades to the canned engine, so the demo
never shows a broken state.

## Boundaries and invariants

* No secrets in the repo. The browser never sees an Azure token.
* No runtime npm dependencies. Tests use `vitest` + `jsdom` (dev only).
* `chat-engine.js` must not import the DOM. Enforced by code review and
  by the unit-test suite running it under plain Node.
* Agentic mode is **off** unless all three `AZURE_OPENAI_*` vars are set.
