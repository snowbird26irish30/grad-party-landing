// Helper to show messages in the chat box
function addChatMessage(sender, text) {
  const messages = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = `chat-message ${sender}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// RSVP form handler
document.getElementById("rsvp-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("rsvp-status");
  status.textContent = "Sending RSVP...";

  const form = e.target;
  const partyName = form.partyName.value;
  const guestCount = form.guestCount.value;

  try {
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyName, guestCount }),
    });

    if (res.ok) {
      status.textContent = "Thank you! Your RSVP has been recorded.";
      form.reset();
    } else {
      status.textContent = "Something went wrong. Please try again later.";
    }
  } catch (err) {
    status.textContent = "Network error. Please try again.";
  }
});

// Chat form handler
document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("chat-input");
  const status = document.getElementById("chat-status");
  const question = input.value.trim();
  if (!question) return;

  addChatMessage("user", question);
  input.value = "";
  status.textContent = "Thinking...";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    if (!res.ok) {
      status.textContent = "Error talking to the assistant.";
      return;
    }

    const data = await res.json();
    addChatMessage("bot", data.answer);
    status.textContent = data.escalated
      ? "I’ve also sent your question to David for a direct answer."
      : "";
  } catch (err) {
    status.textContent = "Network error. Please try again.";
  }
});

