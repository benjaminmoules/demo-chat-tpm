// Unit tests for the pure chat engine.
// See .github/instructions/javascript.instructions.md for the testing conventions.

import { describe, it, expect } from "vitest";
import { classify, createReplyPicker, REPLIES } from "../chat-engine.js";

describe("classify()", () => {
  it("returns 'status' for release/track/eta keywords", () => {
    expect(classify("What's the status of the release?")).toBe("status");
    expect(classify("are we on track")).toBe("status");
    expect(classify("ETA?")).toBe("status");
  });

  it("returns 'blockers' for blocker/risk/dependency keywords", () => {
    expect(classify("Any blockers today?")).toBe("blockers");
    expect(classify("we have a dependency issue")).toBe("blockers");
  });

  it("returns 'roadmap' for roadmap/quarter/milestone keywords", () => {
    expect(classify("Roadmap update please")).toBe("roadmap");
    expect(classify("what's planned for Q3")).toBe("roadmap");
  });

  it("returns 'standup' / 'okr' for their respective keywords", () => {
    expect(classify("standup summary")).toBe("standup");
    expect(classify("OKR check-in")).toBe("okr");
  });

  it("returns 'default' when no keyword matches", () => {
    expect(classify("hello there")).toBe("default");
    expect(classify("")).toBe("default");
    expect(classify(null)).toBe("default");
  });

  it("is case-insensitive", () => {
    expect(classify("ROADMAP")).toBe("roadmap");
    expect(classify("Standup")).toBe("standup");
  });
});

describe("createReplyPicker()", () => {
  it("returns a string from the requested bucket", () => {
    const pick = createReplyPicker();
    const reply = pick("blockers");
    expect(REPLIES.blockers).toContain(reply);
  });

  it("falls back to 'default' bucket for unknown intents", () => {
    const pick = createReplyPicker();
    const reply = pick("not-a-bucket");
    expect(REPLIES.default).toContain(reply);
  });

  it("never returns the same reply twice in a row from the same bucket (AC2)", () => {
    // Force the rng to repeat the same index — picker must rotate.
    const pick = createReplyPicker(REPLIES, () => 0);
    const a = pick("status");
    const b = pick("status");
    expect(a).not.toBe(b);
  });

  it("is deterministic when given a deterministic rng", () => {
    const pick1 = createReplyPicker(REPLIES, () => 0.5);
    const pick2 = createReplyPicker(REPLIES, () => 0.5);
    expect(pick1("roadmap")).toBe(pick2("roadmap"));
  });
});
