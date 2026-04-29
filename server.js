// Tiny static file server + opt-in agentic proxy.
// Reads PORT and Azure OpenAI vars from the environment (.env via the user).
// Zero dependency on purpose — keeps the demo self-contained.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { callAgent } from "./agent.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT) || 5173;

const AGENT_CONFIG = {
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
};
const AGENT_ENABLED = Boolean(AGENT_CONFIG.endpoint && AGENT_CONFIG.deployment);

const MAX_BODY_BYTES = 8 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  const urlPath = (req.url || "/").split("?")[0];

  if (req.method === "GET" && urlPath === "/api/agent/health") {
    return sendJson(res, 200, { enabled: AGENT_ENABLED });
  }

  if (req.method === "POST" && urlPath === "/api/agent") {
    return handleAgentPost(req, res);
  }

  return serveStatic(req, res);
});

async function handleAgentPost(req, res) {
  if (!AGENT_ENABLED) {
    return sendJson(res, 503, { error: "agent_not_configured" });
  }
  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    return sendJson(res, 400, { error: "bad_request", detail: String(e.message || e) });
  }
  const text = typeof body?.text === "string" ? body.text : "";
  if (!text.trim()) {
    return sendJson(res, 400, { error: "empty_text" });
  }
  try {
    const reply = await callAgent({ userText: text, config: AGENT_CONFIG });
    return sendJson(res, 200, { reply });
  } catch (e) {
    console.error("agent_failed:", e.message || e);
    return sendJson(res, 502, { error: "agent_failed" });
  }
}

async function readJson(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error("payload too large");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function serveStatic(req, res) {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const safe = normalize(urlPath).replace(/^([/\\])+/, "");
    const target = join(__dirname, safe || "index.html");
    if (!target.startsWith(__dirname)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    const body = await readFile(target);
    res.writeHead(200, { "content-type": MIME[extname(target)] || "application/octet-stream" });
    res.end(body);
  } catch {
    try {
      const body = await readFile(join(__dirname, "index.html"));
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  }
}

server.listen(PORT, () => {
  const mode = AGENT_ENABLED ? "agentic mode ON" : "canned mode";
  console.log(`Demo Chat TPM listening on http://localhost:${PORT} (${mode})`);
});
