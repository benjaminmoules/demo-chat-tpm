// DOM glue for the TPM Buddy chat. Pure logic lives in chat-engine.js.
import { classify, createReplyPicker, botReply } from "./chat-engine.js";

const thread = document.getElementById("thread");
const form = document.getElementById("composer");
const input = document.getElementById("input");
const presets = document.getElementById("presets");
const clearBtn = document.getElementById("clear");

const pickReply = createReplyPicker();

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
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  appendBubble(trimmed, "user");
  input.value = "";

  const typing = appendBubble("typing…", "bot");
  typing.classList.add("typing");
  setTimeout(() => {
    typing.classList.remove("typing");
    typing.textContent = botReply(trimmed, pickReply);
    thread.scrollTop = thread.scrollHeight;
  }, 400);
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
});

// Exposed for ad-hoc debugging from the devtools console.
window.__demo = { classify, pickReply, send, clearThread };
