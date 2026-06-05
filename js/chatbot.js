// n8n Webhook URL (이 값을 본인의 n8n 웹훅 주소로 변경하세요)
// 예: "https://your-n8n-domain.com/webhook/portfolio-ai-agent"
const N8N_WEBHOOK_URL = "https://su0901.app.n8n.cloud/webhook/chat";

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

    if (text === "init") {
      // Render Premium custom Welcome Message
      const welcomeHTML = `
        <div class="welcome-box">
          <p><strong>안녕하세요! 김수현 PM의 포트폴리오 AI 비서입니다. 🤖</strong></p>
          <p style="margin-top: 5px; font-size: 0.85rem; opacity: 0.8; line-height: 1.4;">
            김수현 PM이 구축한 각종 실무 프로젝트 및 기술 역량에 대해 실시간 답변을 제공합니다!
          </p>
          <div class="stitch-card-mini">
            <span class="mini-badge">Google Stitch Live</span>
            <h4>SH호텔 로봇 UI/UX 설계안</h4>
            <p>구글 Stitch AI 캔버스로 기획하고 Vercel에 단독 정적 웹으로 배포한 스마트 호텔 서비스 프로토타입입니다.</p>
            <div style="margin-top: 8px; display: flex; gap: 8px;">
              <a href="https://next-extension-blond.vercel.app/index.html" target="_blank" style="font-weight: 800; color: #0366d6;">💻 PC 배포판 ↗</a>
              <a href="https://stitch.withgoogle.com/preview/16393579884020231280?node-id=3c31bbbc06ec4d4e87c08691c1d39d48" target="_blank" style="font-weight: 800; color: #000;">📱 모바일 프리뷰 ↗</a>
            </div>
          </div>
          <p style="margin-top: 12px; font-size: 0.8rem; font-weight: bold; opacity: 0.7;">💡 궁금하신 주제를 선택해 보세요:</p>
          <div class="suggestion-chips">
            <button class="sug-chip" data-query="Stitch 프로젝트 설계안에 대해 설명해줘">🤖 Stitch 설계안</button>
            <button class="sug-chip" data-query="김수현 PM의 주요 기술 스택과 경력은?">🛠️ 기술 스택/경력</button>
            <button class="sug-chip" data-query="인스타그램 가짜 팔로워 분석 프로젝트">📊 인스타 가짜팔로워</button>
          </div>
        </div>
      `;
      appendMessage("bot", welcomeHTML);
      
      // Bind click events to dynamically generated suggestion chips
      setTimeout(() => {
        const chips = messagesContainer.querySelectorAll(".sug-chip");
        chips.forEach(chip => {
          chip.addEventListener("click", () => {
            const query = chip.getAttribute("data-query");
            sendMessage(query);
          });
        });
      }, 100);
      return;
    }

    if (!isHidden) {
      appendMessage("user", text);
      inputField.value = "";
    }

    // Check if query is about Stitch or design prototypes to give instant luxury custom card response
    const isStitchQuery = /stitch|스티치|프로토타입|디자인|hotel|호텔/i.test(text);

    appendLoading();

    try {
      if (isStitchQuery) {
        const answer = `
          <div class="stitch-card-mini" style="margin-top: 0; box-shadow: none; border-color: #0366d6;">
            <span class="mini-badge" style="background: #0366d6;">Google Stitch Live Integration</span>
            <h4 style="color: #0366d6;">SH호텔 차세대 로봇 자동화 서비스 UI/UX</h4>
            <p style="margin-bottom: 8px;">
              김수현 PM이 <strong>구글 Stitch(Design with AI)</strong> 협업 캔버스를 기반으로 완성하고 Vercel에 직접 배포한 차세대 스마트 호텔 통합 관제 및 로봇 가이드 UI 설계안입니다.
            </p>
            <ul style="padding-left: 16px; margin-bottom: 12px; font-size: 0.8rem; color: #555; line-height: 1.45;">
              <li>F&B 발주 시스템 연동 API 통신 모듈 설계</li>
              <li>현장 직원용 대화 수신 팝업 및 고가청 경보 다이얼로그 기획</li>
              <li>Google AI Studio 연계 및 IDE MCP(Model Context Protocol) 지원</li>
            </ul>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <a href="https://next-extension-blond.vercel.app/index.html" target="_blank" style="display: block; text-align: center; background: #0366d6; color: #fff; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 0.8rem;">💻 PC 대시보드 배포판 열기 ↗</a>
              <a href="https://stitch.withgoogle.com/preview/16393579884020231280?node-id=3c31bbbc06ec4d4e87c08691c1d39d48" target="_blank" style="display: block; text-align: center; background: #000; color: #fff; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 0.8rem; border: 2px solid #000;">📱 모바일용 실시간 프리뷰 ↗</a>
            </div>
          </div>
        `;
        removeLoading();
        appendMessage("bot", answer);
        return;
      }

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
      const answer = data.output || "답변을 받지 못했습니다.";
      appendMessage("bot", answer);
    } catch (error) {
      console.error("Error:", error);
      removeLoading();
      appendMessage(
        "bot",
        "서버와의 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.<br>(n8n 웹훅 상태를 확인하세요.)",
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
