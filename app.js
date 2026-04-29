// DOM glue for the TPM Buddy chat. Pure logic lives in chat-engine.js.
// Agentic mode is opt-in (ADR-003) — see .copilot-tracking/adrs/2026-04-28/ADR-003-azure-agentic-mode.md.
import {
  classify,
  createReplyPicker,
  botReply,
  agenticReply,
  probeAgentic,
} from "./chat-engine.js";

const thread = document.getElementById("thread");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const presets = document.getElementById("presets");
const clearBtn = document.getElementById("clear");
const agenticBadge = document.getElementById("agentic-badge");

const pickReply = createReplyPicker();

let agenticEnabled = false;

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

function finalizeTyping(typing, text) {
  typing.classList.remove("typing");
  typing.textContent = text;
  thread.scrollTop = thread.scrollHeight;
}

function cannedReplyAfterDelay(typing, trimmed) {
  setTimeout(() => finalizeTyping(typing, botReply(trimmed, pickReply)), 400);
}

async function send(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  appendBubble(trimmed, "user");
  input.value = "";

  const typing = appendBubble("typing…", "bot");
  typing.classList.add("typing");

  if (agenticEnabled) {
    try {
      const reply = await agenticReply(trimmed);
      finalizeTyping(typing, reply);
      return;
    } catch {
      // fall through to canned mode
    }
  }
  cannedReplyAfterDelay(typing, trimmed);
}

function clearThread() {
  thread.innerHTML = "";
  appendBubble("Conversation cleared. Fresh roadmap, same chaos. 🚀", "bot");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  send(input.value);
});

presets.addEventListener("click", (e) => {
  const btn = e.target.closest(".preset");
  if (!btn) return;
  send(btn.dataset.prompt);
});

clearBtn.addEventListener("click", clearThread);

window.addEventListener("DOMContentLoaded", () => {
  appendBubble("Hey! I'm your TPM buddy. Pick a quick prompt or ask me anything roadmap-y. 🗺️", "bot");
  input.focus();
  probeAgentic().then((enabled) => {
    agenticEnabled = enabled;
    if (enabled) {
      document.body.classList.add("agentic");
      if (agenticBadge) agenticBadge.hidden = false;
    }
  });
});

// Exposed for ad-hoc debugging from the devtools console.
window.__demo = { classify, pickReply, send, clearThread, isAgentic: () => agenticEnabled };
