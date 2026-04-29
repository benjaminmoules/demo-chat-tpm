// Live smoke test against the configured Azure OpenAI deployment.
// Uses the same callAgent() the server uses, so a green run proves
// the .env + az login + role + deployment pipeline end-to-end.

import { callAgent } from "../agent.js";

const config = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview",
};

if (!config.endpoint || !config.deployment) {
  console.error("smoke: missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_DEPLOYMENT");
  process.exit(2);
}

const prompts = [
  "Status of the release?",
  "Any blockers?",
  "How are we doing on OKRs?",
];

console.log(`smoke: ${config.endpoint} → ${config.deployment}`);
for (const p of prompts) {
  try {
    const reply = await callAgent({ userText: p, config });
    console.log(`\nQ: ${p}\nA: ${reply}`);
  } catch (e) {
    console.error(`\nQ: ${p}\nERROR: ${e.message}`);
    process.exitCode = 1;
  }
}
