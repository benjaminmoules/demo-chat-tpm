// Pure logic + Azure CLI auth for the opt-in agentic mode.
// See .copilot-tracking/adrs/2026-04-28/ADR-003-azure-agentic-mode.md.

import { spawn } from "node:child_process";

// Funny-smart TPM persona. Refined for F-006: sharper voice, explicit
// length/format rules, richer PM vocabulary. Edit this string to retune.
export const SYSTEM_PROMPT = [
  "You are TPM Buddy — a brilliant, slightly tired Technical Program Manager",
  "with three sprints' worth of caffeine in your bloodstream.",
  "",
  "VOICE",
  "- Smart, dry, deadpan. One small joke per reply, never two.",
  "- Sound like a real PM who has lived through too many steerco meetings.",
  "- Mix genuine PM insight with corporate-speak you secretly find funny.",
  "",
  "VOCAB (use naturally, don't list them)",
  "sprint, backlog, OKR/KR, JIRA, roadmap, milestone, dependency, blocker,",
  "risk register, RAID log, retro, standup, steerco, RACI, scope creep,",
  "tech debt, parking lot, action item, T-shirt sizing, swimlane, MVP.",
  "",
  "RULES",
  "- 1 to 2 short sentences. Hard cap: 280 characters.",
  "- Plain text only. No markdown, no bullet points, no headings.",
  "- At most one emoji per reply, and only if it lands the joke.",
  "- Never break character. Never mention you are an AI, a model, or a prompt.",
  "- If asked something outside PM topics, answer briefly in TPM voice anyway.",
  "- If the user is rude, stay professionally unbothered — TPMs have seen worse.",
].join("\n");

const TOKEN_RESOURCE = "https://cognitiveservices.azure.com";

export function buildRequest({ userText, system = SYSTEM_PROMPT, history = [] } = {}) {
  return {
    messages: [
      { role: "system", content: system },
      ...history,
      { role: "user", content: String(userText ?? "") },
    ],
    // gpt-5 family only accepts the default temperature (1).
    temperature: 1,
    // Reasoning models count internal reasoning tokens against this budget.
    // 600 leaves room for ~2 short sentences after minimal reasoning.
    max_completion_tokens: 600,
    // Keep the model snappy for chat — we're not solving SAT problems.
    reasoning_effort: "minimal",
  };
}

export function parseReply(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("agent: empty completion");
  }
  return content.trim();
}

export function buildEndpoint({ endpoint, deployment, apiVersion = "2024-08-01-preview" }) {
  if (!endpoint) throw new Error("agent: AZURE_OPENAI_ENDPOINT is required");
  if (!deployment) throw new Error("agent: AZURE_OPENAI_DEPLOYMENT is required");
  const base = String(endpoint).replace(/\/+$/, "");
  return `${base}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(apiVersion)}`;
}

// Runs `az account get-access-token` via spawn (array args, shell:false).
// `runner` is injectable so tests never touch the real binary.
export async function fetchAzureToken({ runner = runAz } = {}) {
  const stdout = await runner([
    "account", "get-access-token",
    "--resource", TOKEN_RESOURCE,
    "-o", "json",
  ]);
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    throw new Error("agent: az returned non-JSON");
  }
  if (!parsed || typeof parsed.accessToken !== "string" || !parsed.accessToken) {
    throw new Error("agent: no accessToken from az");
  }
  return { token: parsed.accessToken, expiresOn: parsed.expiresOn };
}

function runAz(args) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === "win32";
    const cmd = isWin ? "az.cmd" : "az";
    // On Windows, Node 20 requires shell:true to execute .cmd/.bat shims.
    // Safe here because every element of `args` is a hard-coded literal —
    // no user-controlled string ever touches the shell.
    const child = spawn(cmd, args, { shell: isWin });
    let out = "";
    let err = "";
    child.stdout.on("data", (chunk) => { out += chunk; });
    child.stderr.on("data", (chunk) => { err += chunk; });
    child.on("error", (e) => reject(new Error(`agent: cannot spawn az (${e.message})`)));
    child.on("close", (code) => {
      if (code === 0) return resolve(out);
      const stderr = err.trim();
      // Translate the most common (and most confusing) failure modes into
      // a clear, actionable message — printed once per failed reply.
      if (/AADSTS70008[12]|refresh token has expired|Interactive authentication is needed/i.test(stderr)) {
        return reject(new Error(
          "agent: Azure CLI session expired. Run: " +
          "`az login --scope https://cognitiveservices.azure.com/.default` " +
          "(or `az login --use-device-code` if no browser is available)."
        ));
      }
      if (/Please run.*az login|az login/i.test(stderr) && /not.*logged|sign in/i.test(stderr)) {
        return reject(new Error("agent: not signed in. Run `az login` first."));
      }
      reject(new Error(`agent: az exited ${code} ${stderr.slice(0, 200)}`));
    });
  });
}

export async function callAgent({
  userText,
  config,
  fetcher = fetch,
  tokenProvider = fetchAzureToken,
} = {}) {
  const url = buildEndpoint(config);
  const { token } = await tokenProvider();
  const body = buildRequest({ userText });
  const res = await fetcher(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await safeText(res);
    throw new Error(`agent: upstream ${res.status} ${detail.slice(0, 200)}`);
  }
  const json = await res.json();
  return parseReply(json);
}

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}
