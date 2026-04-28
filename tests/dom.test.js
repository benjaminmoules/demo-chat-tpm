// Integration test: load index.html into a JSDOM environment and exercise
// the composer + presets + clear button as a user would.

// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";
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
