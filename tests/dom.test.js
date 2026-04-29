// Integration test: load index.html into a JSDOM environment and exercise
// the composer + presets + clear button as a user would.

// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

async function loadPage() {
  const html = readFileSync(resolve(__dirname, "../index.html"), "utf8");
  document.documentElement.innerHTML = html
    .replace(/<!doctype html>/i, "")
    .replace(/<\/?html[^>]*>/gi, "");
  // Re-import the module fresh each test so listeners attach to the new DOM.
  vi.resetModules();
  await import("../app.js");
  document.dispatchEvent(new Event("DOMContentLoaded"));
  window.dispatchEvent(new Event("DOMContentLoaded"));
}

async function flushMicrotasks(times = 5) {
  for (let i = 0; i < times; i++) await Promise.resolve();
}

beforeEach(async () => {
  vi.useFakeTimers();
  await loadPage();
});

describe("F-001 base chat UI", () => {
  it("AC1: input, Send button and a greeting bubble are present on load", () => {
    expect(document.getElementById("input")).toBeTruthy();
    expect(document.querySelector("button.send")).toBeTruthy();
    const bubbles = document.querySelectorAll(".thread .bubble");
    expect(bubbles.length).toBe(1);
    expect(bubbles[0].textContent).toMatch(/TPM buddy/i);
  });

  it("AC2 + AC3: typing a message and submitting appends user then bot bubble", async () => {
    const input = document.getElementById("input");
    const form = document.getElementById("composer");
    input.value = "What's the status?";
    form.dispatchEvent(new Event("submit", { cancelable: true }));

    // user bubble + typing placeholder appear synchronously
    let rows = document.querySelectorAll(".thread .row");
    expect(rows[rows.length - 2].classList.contains("user")).toBe(true);
    expect(rows[rows.length - 1].classList.contains("bot")).toBe(true);

    // bot reply replaces typing placeholder after delay
    vi.advanceTimersByTime(500);
    rows = document.querySelectorAll(".thread .row");
    const lastBot = rows[rows.length - 1].querySelector(".bubble");
    expect(lastBot.textContent).not.toBe("typing…");
    expect(lastBot.textContent.length).toBeGreaterThan(0);
  });

  it("AC5: empty / whitespace input is ignored", () => {
    const input = document.getElementById("input");
    const form = document.getElementById("composer");
    input.value = "   ";
    const before = document.querySelectorAll(".thread .row").length;
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    const after = document.querySelectorAll(".thread .row").length;
    expect(after).toBe(before);
  });
});

describe("F-002 personality + presets", () => {
  it("AC4: clicking a preset sends the prompt as if typed", () => {
    const presetBtn = document.querySelector('.preset[data-prompt="Any blockers?"]');
    presetBtn.click();
    const userBubbles = document.querySelectorAll(".thread .row.user .bubble");
    expect(userBubbles[userBubbles.length - 1].textContent).toBe("Any blockers?");
  });

  it("AC5: Clear empties the thread and shows a fresh greeting", () => {
    document.getElementById("input").value = "hi";
    document.getElementById("composer").dispatchEvent(new Event("submit", { cancelable: true }));
    document.getElementById("clear").click();
    const rows = document.querySelectorAll(".thread .row");
    expect(rows.length).toBe(1);
    expect(rows[0].classList.contains("bot")).toBe(true);
  });
});

describe("F-006 agentic mode", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  async function loadWithAgentic({ agentReply, agentReject } = {}) {
    const fetchMock = vi.fn(async (url) => {
      if (String(url).endsWith("/api/agent/health")) {
        return { ok: true, status: 200, json: async () => ({ enabled: true }) };
      }
      if (String(url).endsWith("/api/agent")) {
        if (agentReject) throw agentReject;
        return { ok: true, status: 200, json: async () => ({ reply: agentReply }) };
      }
      throw new Error(`unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    await loadPage();
    // Let the health probe resolve and flip agenticEnabled = true.
    await flushMicrotasks(10);
    return fetchMock;
  }

  it("AC2: health probe enables agentic mode and shows the badge", async () => {
    await loadWithAgentic({ agentReply: "Status: green-ish. Standup pending." });
    expect(document.body.classList.contains("agentic")).toBe(true);
    const badge = document.getElementById("agentic-badge");
    expect(badge).toBeTruthy();
    expect(badge.hidden).toBe(false);
  });

  it("AC3: a typed message is answered by the model reply", async () => {
    await loadWithAgentic({ agentReply: "On track. For a slightly different definition of on track." });
    const input = document.getElementById("input");
    const form = document.getElementById("composer");
    input.value = "Status of the release?";
    form.dispatchEvent(new Event("submit", { cancelable: true }));

    // No fake timers in agentic mode — microtask flush is enough.
    await flushMicrotasks(20);

    const lastBot = [...document.querySelectorAll(".thread .row.bot .bubble")].pop();
    expect(lastBot.textContent).toBe("On track. For a slightly different definition of on track.");
  });

  it("AC5: agent failure falls back to a canned reply", async () => {
    vi.useFakeTimers();
    await loadWithAgentic({ agentReject: new TypeError("network boom") });
    const input = document.getElementById("input");
    const form = document.getElementById("composer");
    input.value = "any blockers?";
    form.dispatchEvent(new Event("submit", { cancelable: true }));

    // Wait for the rejected agentic promise, then advance the canned timer.
    await flushMicrotasks(20);
    await vi.advanceTimersByTimeAsync(500);

    const lastBot = [...document.querySelectorAll(".thread .row.bot .bubble")].pop();
    expect(lastBot.textContent).not.toBe("typing…");
    expect(lastBot.textContent.length).toBeGreaterThan(0);
  });
});
