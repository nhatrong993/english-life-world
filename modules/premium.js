/* English Life World 2.0 — modules/premium.js
   Freemium vs. Premium (PRO) Architecture: Top Bar Badge, Feature Comparison Modal,
   and 1-Click Free Trial / Pro Toggle for testing & monetization.
   Exposes: window.ELW_PREMIUM */
(function (root) {
  "use strict";

  const KEY = "elw_pro_v1";
  let S = { pro: false };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const CSS = `
#btnProBadge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1.5px solid #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fde68a 100%);
  color: #92400e;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(245, 158, 11, 0.22);
  transition: transform 0.16s ease;
}
#btnProBadge.is-pro {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border-color: #b45309;
}
#btnProBadge:hover {
  transform: translateY(-1px);
}
.pro-modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 12px 0;
  text-align: left;
}
@media (max-width: 600px) {
  .pro-modal-grid { grid-template-columns: 1fr; }
}
.pro-col {
  border-radius: 16px;
  padding: 14px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
}
.pro-col.vip {
  border-color: #f59e0b;
  background: linear-gradient(145deg, #fffdf9 0%, #fef3c7 100%);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.18);
}
.pro-col h3 {
  margin: 0 0 8px;
  font-size: 16px;
}
.pro-col ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.55;
  color: #334155;
}
`;

  function injectCss() {
    if (document.getElementById("elw-pro-css")) return;
    const st = document.createElement("style");
    st.id = "elw-pro-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function renderBadge() {
    const bar = document.querySelector("header .hud, header .bar, .bar");
    if (!bar) return;
    let btn = document.getElementById("btnProBadge");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "btnProBadge";
      btn.type = "button";
      btn.onclick = () => openModal();
      bar.appendChild(btn);
    }
    const vCount = (root.ELW_VOCAB3000 && root.ELW_VOCAB3000.totalCount) ? root.ELW_VOCAB3000.totalCount() : 0;
    btn.classList.toggle("is-pro", !!S.pro);
    btn.innerHTML = S.pro ? `👑 Đã mở PRO${vCount ? ` (${vCount} Từ)` : ""}` : `👑 Nâng cấp PRO`;
  }

  function openModal(featureReason) {
    const modal = document.getElementById("modal");
    const mbox = document.getElementById("mbox");
    if (!modal || !mbox) return;
    const vCount = (root.ELW_VOCAB3000 && root.ELW_VOCAB3000.totalCount) ? root.ELW_VOCAB3000.totalCount() : 1000;

    mbox.innerHTML = `
      <div style="padding:4px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h2 style="margin:0;color:#92400e">👑 English Life World PRO — Mở khóa Toàn bộ ${vCount} Từ & Ngữ cảnh 3D</h2>
          <button type="button" class="iconbtn" id="proCloseBtn">✕</button>
        </div>
        ${featureReason ? `<p style="background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:8px 12px;color:#92400e;font-weight:700;margin:8px 0">🔒 Tính năng bạn vừa chọn: ${esc(featureReason)}</p>` : `<p style="color:#475569;font-size:13.5px;margin:6px 0">Phân bổ hợp lý giữa chế độ Miễn phí (Free) và Trả phí (Premium PRO):</p>`}

        <div class="pro-modal-grid">
          <div class="pro-col">
            <h3>🌱 Gói FREE (Miễn phí)</h3>
            <ul>
              <li>✅ Trải nghiệm các chủ đề nền tảng (Nhà ở, Cà phê, Công viên, Siêu thị, Quán ăn, Ngoài trời, Trường học)</li>
              <li>✅ 750 từ vựng giao tiếp cơ bản (A1–A2)</li>
              <li>✅ Ngữ cảnh cơ bản: <b>🐕 Dắt chó đi bộ</b>, <b>🧑‍🦱 Đi cùng Linh</b>, <b>☀️/🌧️ Chỉnh thời tiết</b></li>
              <li>✅ Nuôi thú cưng <b>🐕 Cún Milo</b> & <b>🐱 Mèo Mochi</b></li>
              <li>✅ Làm nhiệm vụ đếm ngược kịch tính hằng ngày</li>
            </ul>
          </div>
          <div class="pro-col vip">
            <h3 style="color:#b45309">👑 Gói PREMIUM PRO (Trả phí)</h3>
            <ul>
              <li>🔥 <b>Mở khóa trọn bộ ${vCount} Từ thông dụng (A1 → B2)</b> theo 12 Chủ đề</li>
              <li>🔥 <b>Mở khóa Chủ đề Chuyên sâu:</b> ✈️ Sân bay & Khách sạn, 🏥 Bệnh viện, 💼 Công sở, 🛍️ Thời trang</li>
              <li>🔥 <b>Mở khóa toàn bộ Ngữ cảnh Đặc biệt:</b> 💸 Săn giảm giá, 🧳 Hỏi đường Du lịch, 🔍 Tìm đồ thất lạc</li>
              <li>🔥 <b>Thú cưng Hiếm 3D:</b> 🦊 Cáo Tuyết Leo + 🛡️ Khiên Bảo vệ Streak</li>
              <li>🔥 <b>Luyện nói AI & Sửa lỗi Ngữ pháp không giới hạn</b></li>
            </ul>
          </div>
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end;align-items:center;flex-wrap:wrap;margin-top:12px">
          <button type="button" class="btn" id="proToggleBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);font-size:14.5px;padding:10px 18px">
            ${S.pro ? "🔄 Chuyển về chế độ FREE (Để kiểm thử)" : "🎁 Kích hoạt PRO Ngay (Mở khóa toàn bộ)"}
          </button>
        </div>
      </div>
    `;

    modal.hidden = false;
    mbox.querySelector("#proCloseBtn").onclick = () => { modal.hidden = true; };
    mbox.querySelector("#proToggleBtn").onclick = () => {
      S.pro = !S.pro;
      save();
      renderBadge();
      try { if (root.ELW_CONTEXT && root.ELW_CONTEXT.sync) root.ELW_CONTEXT.sync(); } catch (e) {}
      try { if (root.ELW_VOCAB3000 && root.ELW_VOCAB3000.renderCard) root.ELW_VOCAB3000.renderCard(); } catch (e) {}
      modal.hidden = true;
    };
  }

  function init() {
    injectCss();
    renderBadge();
  }

  root.ELW_PREMIUM = {
    init,
    isPro: () => !!S.pro,
    setPro: v => { S.pro = !!v; save(); renderBadge(); },
    openModal
  };
})(typeof window !== "undefined" ? window : globalThis);
