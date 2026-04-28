// Demo Chat TPM — F-001 base chat UI
// Echo bot for now; personality + presets land in F-002.

(function () {
  const thread = document.getElementById("thread");
  const form = document.getElementById("composer");
  const input = document.getElementById("input");

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

  function botReply(userText) {
    // Echo placeholder. Replaced by TPM personality engine in F-002.
    return "You said: " + userText;
  }

  function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return; // AC5: ignore empty
    appendBubble(trimmed, "user");
    input.value = "";

    // Fake "thinking" delay (~400ms) — AC3
    const typing = appendBubble("…", "bot");
    typing.classList.add("typing");
    setTimeout(function () {
      typing.classList.remove("typing");
      typing.textContent = botReply(trimmed);
      thread.scrollTop = thread.scrollHeight;
    }, 400);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    send(input.value);
  });

  // Greet on load so the empty state isn't awkward.
  window.addEventListener("DOMContentLoaded", function () {
    appendBubble("Hey! I'm your TPM buddy. (echo mode for now — personality lands in PR #2.)", "bot");
    input.focus();
  });
})();
