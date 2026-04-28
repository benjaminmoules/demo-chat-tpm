---
applyTo: '**/*.js'
description: 'JavaScript conventions for the Demo Chat TPM repo. Mirrors the per-language instructions pattern used for C#, Python, Bash, Terraform, etc.'
---

# JavaScript Instructions

Conventions for JavaScript (ES2022+) in this repo. Read this file before
editing any `.js`. The repo is intentionally bundler-free; keep it that way
unless an ADR explicitly changes the decision.

## Module System

* All JS files are **ES modules**. Use `import` / `export`. Never
  `require()` or CommonJS-only idioms.
* Use **explicit `.js` extensions** in import specifiers
  (`import { x } from "./chat-engine.js"`). Browsers and Node both require
  this without a bundler.
* Avoid implicit globals. The browser entry point is `app.js`, loaded as
  `<script type="module">`.

## Project Layout

* **Pure logic lives in modules with no DOM access.** Anything that
  accesses `document`, `window`, `localStorage`, or browser APIs goes into
  a glue module (e.g. `app.js`). This keeps the logic unit-testable in
  Node.
* One module per concern. Pure logic, DOM glue, and the dev server are
  three different files.

## Code Style

* `const` everywhere except where reassignment is required, then `let`.
  Never `var`.
* Arrow functions for callbacks; named `function` declarations for
  exported top-level helpers.
* Prefer early returns to nested conditionals.
* No unused imports, parameters, or variables.
* Strings: double quotes; backticks only for templates that interpolate.

## Testability Patterns

* Inject side-effectful dependencies (timers, randomness, fetch, the DOM)
  rather than reaching for them globally. Example: `createReplyPicker(_,
  rng = Math.random)` lets tests pass `() => 0` for deterministic output.
* Functions that produce data (classifiers, pickers, formatters) must be
  pure: same input → same output.
* No singletons in pure modules.

## DOM Glue

* All event listeners attach inside the entry-point module. Do not bind
  listeners inside pure modules.
* Use `textContent`, never `innerHTML`, for user-supplied data
  (XSS hygiene).
* Prefer delegated event handlers (`presets.addEventListener("click", …)`)
  over per-element listeners.
* Use `dataset.*` attributes for payloads carried by DOM nodes; no
  inline `onclick`.

## Comments

* Brief, factual, describing behavior, intent, invariants, or edge cases.
* No phase numbers, dates, or task IDs in code files.
* No narrative thought-process comments.

## Testing

* Framework: `vitest` for unit tests, `vitest` + `jsdom` for integration.
* Test files live under `tests/` mirroring the source name
  (`chat-engine.test.js`, `dom.test.js`).
* One `describe()` per behavior or feature. Test names start with the AC
  tag they verify (`"AC4: clicking a preset…"`) when applicable.
* Cover at minimum: happy path, one negative case, and one boundary or
  determinism case per pure function.
* Use `vi.useFakeTimers()` instead of real `setTimeout` waits.
* Re-import modules per test (`vi.resetModules()`) when DOM listeners
  must attach to a fresh document.

## Security

* `textContent` for any user input rendered into the DOM.
* Path-traversal protection in any file-serving code
  (`target.startsWith(rootDir)`).
* No `eval`, `Function()`, or dynamic `import()` of untrusted strings.
* No secrets in code or fixtures. Secrets come from `.env`.

## Forbidden

* Bundlers / transpilers (`webpack`, `rollup`, `esbuild`, `babel`) unless
  an ADR explicitly changes the decision.
* Polyfills for evergreen browser features.
* `console.log` in committed code (use `console.error` for genuine
  error paths only).
* Disabling lint rules inline; fix the underlying issue.
