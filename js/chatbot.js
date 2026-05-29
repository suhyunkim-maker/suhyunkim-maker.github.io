// n8n Webhook URL (이 값을 본인의 n8n 웹훅 주소로 변경하세요)
// 예: "https://your-n8n-domain.com/webhook/portfolio-ai-agent"
const N8N_WEBHOOK_URL = "https://my-n8n-server.com/webhook/portfolio-ai-agent";

document.addEventListener("DOMContentLoaded", () => {
  // Inject Chatbot HTML
  const chatbotHTML = `
    <div id="chatbot-container">
      <div id="chatbot-window">
        <div id="chatbot-header">
          <span>🤖 포트폴리오 AI 어시스턴트</span>
          <button id="chatbot-close">✕</button>
        </div>
        <div id="chatbot-messages"></div>
        <div id="chatbot-input-container">
          <input type="text" id="chatbot-input" placeholder="궁금한 점을 물어보세요..." autocomplete="off">
          <button id="chatbot-send">➤</button>
        </div>
      </div>
      <button id="chatbot-toggle">💬</button>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", chatbotHTML);

  const toggleBtn = document.getElementById("chatbot-toggle");
  const closeBtn = document.getElementById("chatbot-close");
  const chatWindow = document.getElementById("chatbot-window");
  const messagesContainer = document.getElementById("chatbot-messages");
  const inputField = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");

  // Generate a unique session ID for the user
  let sessionId = localStorage.getItem("chatbot_session_id");
  if (!sessionId) {
    sessionId = "session_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("chatbot_session_id", sessionId);
  }

  let hasInitialized = false;

  function toggleChat() {
    const isHidden =
      chatWindow.style.display === "none" || chatWindow.style.display === "";
    chatWindow.style.display = isHidden ? "flex" : "none";

    if (isHidden && !hasInitialized) {
      // Send initial greeting request
      sendMessage("init", true);
      hasInitialized = true;
    }
  }

  toggleBtn.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  function appendMessage(sender, text) {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-message ${sender}`;
    // Convert newlines to br tags for markdown-like formatting
    msgEl.innerHTML = text.replace(/\\n/g, "<br>");
    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function appendLoading() {
    const msgEl = document.createElement("div");
    msgEl.className = `chat-message bot loading`;
    msgEl.id = "chatbot-loading";
    msgEl.innerText = "입력중...";
    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeLoading() {
    const loadingEl = document.getElementById("chatbot-loading");
    if (loadingEl) loadingEl.remove();
  }

  async function sendMessage(text, isHidden = false) {
    if (!text.trim()) return;

    if (!isHidden) {
      appendMessage("user", text);
      inputField.value = "";
    }

    appendLoading();

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sendMessage",
          chatInput: text,
          sessionId: sessionId,
        }),
      });

      removeLoading();

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // n8n returns { output: "answer" } based on the Webhook response node configuration
      const answer = data.output || "답변을 가져오지 못했습니다.";
      appendMessage("bot", answer);
    } catch (error) {
      console.error("Error:", error);
      removeLoading();
      appendMessage(
        "bot",
        "오류가 발생했습니다. 나중에 다시 시도해주세요.<br>(n8n 웹훅 주소가 올바른지 확인해주세요.)",
      );
    }
  }

  sendBtn.addEventListener("click", () => {
    sendMessage(inputField.value);
  });

  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage(inputField.value);
    }
  });
});
