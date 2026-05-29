// Supabase 접속 설정
const SUPABASE_URL = "https://vixymoouogqwyjbtlync.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpeHltb291b2dxd3lqYnRseW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTE1NTAsImV4cCI6MjA5NTU2NzU1MH0.Mwwv_vMUDWAEF8dENolNc9ljQXh13dLrvzZXjPC4O3U";

// Supabase 클라이언트 초기화 (CDN으로 로드된 supabase 객체 사용)
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const statusDiv = document.getElementById("form-status");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("user-name").value.trim();
    const email = document.getElementById("user-email").value.trim();
    const message = document.getElementById("user-message").value.trim();

    // 입력 검증
    if (!name || !email || !message) {
      showStatus("error", "⚠️ 모든 필드를 올바르게 입력해 주세요!");
      return;
    }

    // 전송 상태 UI 활성화
    submitBtn.disabled = true;
    submitBtn.innerText = "전송 중...";
    statusDiv.style.display = "none";

    try {
      // Supabase 'inquiries' 테이블에 데이터 적재
      const { data, error } = await _supabase
        .from("inquiries")
        .insert([{ name, email, message }]);

      if (error) throw error;

      // 성공 메시지 출력 및 폼 리셋
      showStatus("success", "🎉 문의사항이 성공적으로 접수되었습니다!");
      form.reset();
    } catch (err) {
      console.error("Supabase 전송 중 오류 발생:", err);
      showStatus("error", "⚠️ 문의 등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "보내기 ⚡";
    }
  });

  // 상태 메시지 렌더링 헬퍼 함수
  function showStatus(type, text) {
    statusDiv.style.display = "block";
    statusDiv.innerText = text;

    if (type === "success") {
      statusDiv.style.backgroundColor = "rgba(16, 185, 129, 0.15)";
      statusDiv.style.color = "#10b981";
      statusDiv.style.border = "1px solid rgba(16, 185, 129, 0.3)";
    } else {
      statusDiv.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
      statusDiv.style.color = "#ef4444";
      statusDiv.style.border = "1px solid rgba(239, 68, 68, 0.3)";
    }
  }
});
