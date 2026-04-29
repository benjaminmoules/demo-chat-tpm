// Pure logic for the TPM Buddy chat. No DOM access — directly testable.
// See .copilot-tracking/adrs/2026-04-28/ADR-002-canned-responses.md for the decision.

export const REPLIES = {
  status: [
    "We're 87% green, which in TPM dialect means 'two fires away from red'.",
    "Status: trending positive. Trending in which direction? Yes.",
    "On track for a slightly different definition of 'on track'.",
    "Green on the dashboard, amber in my heart, red in the retro.",
  ],
  blockers: [
    "The blocker is the dependency on the team that depends on us. Classic.",
    "No blockers. Just 14 'risks' that look suspiciously like blockers.",
    "Only one blocker: vendor onboarding. ETA: when the sun expands.",
    "Unblocked! …pending one final approval from someone on PTO.",
  ],
  roadmap: [
    "Q3 roadmap is locked. Q4 roadmap is locked. Q3 deliverables moved to Q4. Roadmap is locked.",
    "Roadmap updated. Same scope, same date, slightly more optimistic font.",
    "Added a swimlane for 'tech debt'. It is, unsurprisingly, very wide.",
    "Roadmap status: 60% milestones, 40% emojis.",
  ],
  standup: [
    "Yesterday: meetings about meetings. Today: meetings. Blockers: the meetings.",
    "Engineering: shipping. Design: refining. PM: re-prioritizing. Me: scribing.",
    "Three updates, two action items, one circle-back. Standard standup.",
    "We agreed to disagree, then agreed to revisit, then agreed to ship anyway.",
  ],
  okr: [
    "KR1: 80%. KR2: 65%. KR3: 'in progress' since 2024.",
    "OKRs are healthy if you squint and ignore the trailing indicators.",
    "Let's add a stretch KR so the current ones look reasonable by comparison.",
    "Hitting all KRs. Possibly because we redefined them last Tuesday.",
  ],
  default: [
    "Let's take it offline and circle back in the Tiger Team.",
    "Great point — adding it to the parking lot.",
    "Let me sync with the stakeholder and triple-confirm.",
    "Can we put a slide together for the steerco about that?",
    "Let's align on the alignment before we align with leadership.",
    "Acknowledged. Action item assigned to 'TBD'.",
  ],
};

export const INTENTS = [
  { bucket: "status",   keywords: ["status", "release", "ship", "track", "progress", "eta"] },
  { bucket: "blockers", keywords: ["blocker", "block", "stuck", "dependency", "risk"] },
  { bucket: "roadmap",  keywords: ["roadmap", "plan", "quarter", "q1", "q2", "q3", "q4", "milestone"] },
  { bucket: "standup",  keywords: ["standup", "stand-up", "daily", "scrum"] },
  { bucket: "okr",      keywords: ["okr", "kr", "objective", "goal", "metric"] },
];

/**
 * Classify a user message into one of the known intent buckets.
 * Falls back to `"default"` when no keyword matches.
 */
export function classify(text) {
  const lower = String(text || "").toLowerCase();
  for (const intent of INTENTS) {
    if (intent.keywords.some((k) => lower.includes(k))) return intent.bucket;
  }
  return "default";
}

/**
 * Build a reply picker that avoids returning two replies in a row from the
 * same bucket (AC2 of F-002). `rng` is injectable for deterministic tests.
 */
export function createReplyPicker(replies = REPLIES, rng = Math.random) {
  const lastByBucket = {};
  return function pickReply(bucket) {
    const pool = replies[bucket] || replies.default;
    let idx = Math.floor(rng() * pool.length);
    if (pool.length > 1 && idx === lastByBucket[bucket]) {
      idx = (idx + 1) % pool.length;
    }
    lastByBucket[bucket] = idx;
    return pool[idx];
  };
}

export function botReply(userText, picker) {
  return picker(classify(userText));
}

/**
 * Browser-side caller for the opt-in agentic proxy (ADR-003).
 * Throws on any error so app.js can fall back to the canned engine.
 * `fetcher` is injectable for tests.
 */
export async function agenticReply(userText, { fetcher } = {}) {
  const f = fetcher || (typeof fetch === "function" ? fetch : null);
  if (!f) throw new Error("agent: no fetch available");
  const res = await f("/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: String(userText ?? "") }),
  });
  if (!res.ok) throw new Error(`agent: http ${res.status}`);
  const data = await res.json();
  if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
    throw new Error("agent: empty reply");
  }
  return data.reply.trim();
}

/**
 * Probe the server-side health endpoint to decide which engine to use.
 * Resolves to `false` on any error (canned mode).
 */
export async function probeAgentic({ fetcher } = {}) {
  const f = fetcher || (typeof fetch === "function" ? fetch : null);
  if (!f) return false;
  try {
    const res = await f("/api/agent/health");
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data && data.enabled);
  } catch {
    return false;
  }
}
