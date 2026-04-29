// Unit tests for the agentic backend (ADR-003).
// No real `az` calls and no real network — every dependency is injected.

import { describe, it, expect, vi } from "vitest";
import {
  SYSTEM_PROMPT,
  buildRequest,
  parseReply,
  buildEndpoint,
  fetchAzureToken,
  callAgent,
} from "../agent.js";

describe("SYSTEM_PROMPT", () => {
  it("locks the TPM persona keywords (AC4)", () => {
    expect(SYSTEM_PROMPT).toMatch(/TPM Buddy/);
    expect(SYSTEM_PROMPT.toLowerCase()).toMatch(/never break character/);
    expect(SYSTEM_PROMPT.toLowerCase()).toMatch(/sprint|okr|jira|roadmap|blocker/);
  });
});

describe("buildRequest()", () => {
  it("places system + user messages with sane defaults", () => {
    const r = buildRequest({ userText: "any blockers?" });
    expect(r.messages[0]).toEqual({ role: "system", content: SYSTEM_PROMPT });
    expect(r.messages[r.messages.length - 1]).toEqual({ role: "user", content: "any blockers?" });
    expect(r.temperature).toBeGreaterThan(0);
    expect(r.max_completion_tokens).toBeGreaterThan(0);
  });

  it("interleaves history between system and the new user message", () => {
    const history = [
      { role: "user", content: "earlier" },
      { role: "assistant", content: "earlier reply" },
    ];
    const r = buildRequest({ userText: "now", history });
    expect(r.messages.map((m) => m.role)).toEqual(["system", "user", "assistant", "user"]);
  });
});

describe("parseReply()", () => {
  it("returns the trimmed assistant content", () => {
    expect(parseReply({ choices: [{ message: { content: "  hi  " } }] })).toBe("hi");
  });

  it("throws on empty / malformed payloads", () => {
    expect(() => parseReply({})).toThrow(/empty completion/);
    expect(() => parseReply({ choices: [{ message: { content: "   " } }] })).toThrow();
    expect(() => parseReply(null)).toThrow();
  });
});

describe("buildEndpoint()", () => {
  it("builds a correct Azure OpenAI URL and url-encodes the deployment", () => {
    const url = buildEndpoint({
      endpoint: "https://my-aoai.openai.azure.com/",
      deployment: "gpt-4o mini",
      apiVersion: "2024-08-01-preview",
    });
    expect(url).toBe(
      "https://my-aoai.openai.azure.com/openai/deployments/gpt-4o%20mini/chat/completions?api-version=2024-08-01-preview"
    );
  });

  it("rejects missing config (AC6 boundary)", () => {
    expect(() => buildEndpoint({ deployment: "x" })).toThrow(/ENDPOINT/);
    expect(() => buildEndpoint({ endpoint: "https://x" })).toThrow(/DEPLOYMENT/);
  });
});

describe("fetchAzureToken()", () => {
  it("parses az output and returns the access token", async () => {
    const runner = vi.fn().mockResolvedValue(JSON.stringify({
      accessToken: "abc.def.ghi",
      expiresOn: "2099-01-01 00:00:00.000000",
    }));
    const out = await fetchAzureToken({ runner });
    expect(out.token).toBe("abc.def.ghi");
    expect(runner).toHaveBeenCalledWith([
      "account", "get-access-token",
      "--resource", "https://cognitiveservices.azure.com",
      "-o", "json",
    ]);
  });

  it("throws when az returns no token", async () => {
    const runner = vi.fn().mockResolvedValue(JSON.stringify({ expiresOn: "2099" }));
    await expect(fetchAzureToken({ runner })).rejects.toThrow(/accessToken/);
  });

  it("throws when az returns non-JSON", async () => {
    const runner = vi.fn().mockResolvedValue("ERROR: please run az login");
    await expect(fetchAzureToken({ runner })).rejects.toThrow(/non-JSON/);
  });
});

describe("callAgent()", () => {
  const config = {
    endpoint: "https://x.openai.azure.com",
    deployment: "gpt-mini",
    apiVersion: "2024-08-01-preview",
  };

  it("returns the model reply on a 200 response", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: "  on track 🙂  " } }] }),
    });
    const tokenProvider = vi.fn().mockResolvedValue({ token: "T" });
    const reply = await callAgent({ userText: "status?", config, fetcher, tokenProvider });
    expect(reply).toBe("on track 🙂");

    const [url, init] = fetcher.mock.calls[0];
    expect(url).toContain("/chat/completions?api-version=");
    expect(init.headers.authorization).toBe("Bearer T");
    const body = JSON.parse(init.body);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages.at(-1).content).toBe("status?");
  });

  it("throws agent_failed on non-2xx (AC5)", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "throttled",
    });
    const tokenProvider = vi.fn().mockResolvedValue({ token: "T" });
    await expect(callAgent({ userText: "x", config, fetcher, tokenProvider })).rejects.toThrow(/upstream 503/);
  });
});
