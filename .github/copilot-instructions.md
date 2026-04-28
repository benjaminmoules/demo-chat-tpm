---
description: 'Repo-wide coding rules for Demo Chat TPM. Highest-priority items override anything else.'
---

# General Instructions

Items in the *Priority Rules* section override any conflicting guidance from
other files (including language-specific instructions).

<!-- <highest-priority-rules> -->
## Priority Rules

* Conventions and styling already present in the codebase take precedence.
* Read the matching `.github/instructions/*.instructions.md` file before
  editing any file. The file's `applyTo` glob declares which files it
  governs.
* Keep changes minimal and scoped to the request. Do not add features,
  refactors, or "improvements" beyond what was asked.
* Tests, scripts, and one-off markdown docs are created or modified only
  when explicitly requested.
* Do **not** add docstrings, comments, or type annotations to code you did
  not change.
* Do **not** introduce error handling for scenarios that cannot happen.
  Validate at system boundaries only.

Rules for comments:

* Brief and factual: behavior, intent, invariants, edge cases.
* No narrative thought process, no step-by-step reasoning.
* Comments that contradict current behavior must be removed or updated.
* Temporal markers (phase numbers, dates, task IDs) are removed from code
  files during any edit.

Rules for fixing errors:

* Proactively fix problems encountered while working in the codebase, even
  when unrelated to the original request.
* Root-cause fixes are preferred over symptom-only patches.
<!-- </highest-priority-rules> -->

## Project Structure

```
.
├── README.md                         # narrative + clone-and-run
├── .env.example                      # placeholders only — never commit secrets
├── package.json  server.js           # zero-dep dev server + vitest
├── index.html  styles.css            # the chat UI
├── app.js                            # DOM glue (imports the engine)
├── chat-engine.js                    # pure logic (no DOM access)
├── tests/                            # vitest unit + jsdom integration
├── docs/
│   ├── product/                      # PRD, backlog, mockup
│   └── architecture/adr/             # human-friendly ADR mirror
├── .github/
│   ├── copilot-instructions.md       # this file
│   ├── instructions/                 # language-specific rules (applyTo glob)
│   ├── agents/                       # SDLC orchestrator + RPI + QA + PR review …
│   ├── prompts/                      # starter prompts
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
└── .copilot-tracking/                # state, plans, changes, reviews, ADRs
```

## Development

```bash
cp .env.example .env
npm install
npm test           # 15 tests
npm start          # http://localhost:5173
```

## Workflow Conventions

* One feature per branch (`feat/F-XXX-*`).
* One PR per feature, linked to its issue, with an explicit AC checklist.
* The implementation plan is validated by the *Plan Validator* agent
  before any code is written.
* `.copilot-tracking/sdlc/<feature-slug>/state.md` is updated at every
  phase transition.
