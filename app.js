// Demo Chat TPM — F-002 TPM personality + preset prompts.
// See ADR-002 for the canned-replies decision.

(function () {
  const thread = document.getElementById("thread");
  const form = document.getElementById("composer");
  const input = document.getElementById("input");
  const presets = document.getElementById("presets");
  const clearBtn = document.getElementById("clear");

  // Personality library, grouped by intent.
  const REPLIES = {
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

  const INTENTS = [
    { bucket: "status",   keywords: ["status", "release", "ship", "track", "progress", "eta"] },
    { bucket: "blockers", keywords: ["blocker", "block", "stuck", "dependency", "risk"] },
    { bucket: "roadmap",  keywords: ["roadmap", "plan", "quarter", "q1", "q2", "q3", "q4", "milestone"] },
    { bucket: "standup",  keywords: ["standup", "stand-up", "daily", "scrum"] },
    { bucket: "okr",      keywords: ["okr", "kr", "objective", "goal", "metric"] },
  ];

  function classify(text) {
    const lower = text.toLowerCase();
    for (const intent of INTENTS) {
      if (intent.keywords.some((k) => lower.includes(k))) return intent.bucket;
    }
    return "default";
  }

  const lastIndexByBucket = {};
  function pickReply(bucket) {
    const pool = REPLIES[bucket] || REPLIES.default;
    let idx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && idx === lastIndexByBucket[bucket]) {
      idx = (idx + 1) % pool.length; // AC2: avoid two in a row from the same bucket
    }
    lastIndexByBucket[bucket] = idx;
    return pool[idx];
  }

  function botReply(userText) {
    return pickReply(classify(userText));
  }

  function appendBubble(text, who) {
    const row = document.createElement("div");
    row.className = "row " + who;
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    row.appendChild(bubble);
    thread.appendChild(row);
    thread.scrollTop = thread.scrollHeight;
    return bubble;
  }

  function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    appendBubble(trimmed, "user");
    input.value = "";

    const typing = appendBubble("typing…", "bot");
    typing.classList.add("typing");
    setTimeout(function () {
      typing.classList.remove("typing");
      typing.textContent = botReply(trimmed);
      thread.scrollTop = thread.scrollHeight;
    }, 400);
  }

  function clearThread() {
    thread.innerHTML = "";
    appendBubble("Conversation cleared. Fresh roadmap, same chaos. 🚀", "bot");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send(input.value);
  });

  presets.addEventListener("click", function (e) {
    const btn = e.target.closest(".preset");
    if (!btn) return;
    send(btn.dataset.prompt);
  });

  clearBtn.addEventListener("click", clearThread);

  window.addEventListener("DOMContentLoaded", function () {
    appendBubble("Hey! I'm your TPM buddy. Pick a quick prompt or ask me anything roadmap-y. 🗺️", "bot");
    input.focus();
  });
})();
