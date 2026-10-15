/* English Life World 2.0 — modules/vocab-3000.js
   3,000 Common Words Mastery Roadmap (12 Life Domains × CEFR A1–B2) +
   Interactive Sentence Pattern Spinner (Khung Mẫu Câu Biến Thiên) + Active Recall Flash Quiz.
   Exposes: window.ELW_VOCAB3000 */
(function (root) {
  "use strict";

  const KEY = "elw_v3000_v1";
  let S = { mastered: {}, patternsUsed: {}, activeDomain: "all", activeFrame: 0, slotA: 0, slotB: 0, quizScore: 0 };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- 12 Domains of the 3,000 Common Words Roadmap ---------- */
  const DOMAINS = [
    { id: "home",       icon: "🏠", vi: "Nhà ở & Sinh hoạt",     en: "Home & Daily Routines", target: 250, free: true },
    { id: "cafe",       icon: "☕", vi: "Quán cà phê & Đồ uống", en: "Coffee Shop & Drinks",  target: 250, free: true },
    { id: "park",       icon: "🌳", vi: "Công viên & Thú cưng",  en: "Park, Nature & Pets",   target: 250, free: true },
    { id: "market",     icon: "🛒", vi: "Siêu thị & Mua sắm",    en: "Supermarket & Grocery", target: 250, free: true },
    { id: "restaurant", icon: "🍜", vi: "Nhà hàng & Ẩm thực",    en: "Restaurant & Dining",   target: 250, free: true },
    { id: "outdoor",    icon: "⛺", vi: "Cắm trại & Dã ngoại",   en: "Outdoor & Camping",     target: 250, free: true },
    { id: "school",     icon: "🏫", vi: "Trường học & Giáo dục", en: "School & Classroom",    target: 250, free: true },
    { id: "travel",     icon: "✈️", vi: "Sân bay & Du lịch",     en: "Airport & Hotel",       target: 250, pro: true },
    { id: "health",     icon: "🏥", vi: "Sức khỏe & Y tế",       en: "Health & Pharmacy",     target: 250, pro: true },
    { id: "work",       icon: "💼", vi: "Công sở & Sự nghiệp",   en: "Office & Career",       target: 250, pro: true },
    { id: "shopping",   icon: "🛍️", vi: "Thời trang & Dịch vụ",  en: "Fashion & City Mall",   target: 250, pro: true },
    { id: "social",     icon: "🎬", vi: "Giải trí & Cảm xúc",    en: "Social & Hobbies",      target: 250, pro: true }
  ];

  /* ---------- Extra High-Frequency Core Words for Expansion Domains ---------- */
  const EXTRA_WORDS = [
    { id: "v_passport", domain: "travel", lv: "A2", en: "passport", ipa: "/ˈpɑːs.pɔːt/", vi: "hộ chiếu", ex: "Please show your passport and boarding pass at the gate." },
    { id: "v_boarding", domain: "travel", lv: "A2", en: "boarding pass", ipa: "/ˈbɔː.dɪŋ pɑːs/", vi: "thẻ lên máy bay", ex: "My seat number is printed on the boarding pass." },
    { id: "v_luggage",  domain: "travel", lv: "A2", en: "luggage", ipa: "/ˈlʌɡ.ɪdʒ/", vi: "hành lý", ex: "I only brought one piece of carry-on luggage." },
    { id: "v_customs",  domain: "travel", lv: "B1", en: "customs", ipa: "/ˈkʌs.təmz/", vi: "hải quan", ex: "It took twenty minutes to go through customs." },
    { id: "v_symptom",  domain: "health", lv: "B1", en: "symptom", ipa: "/ˈsɪmp.təm/", vi: "triệu chứng", ex: "A sore throat and fever are common flu symptoms." },
    { id: "v_pharmacy", domain: "health", lv: "A2", en: "pharmacy", ipa: "/ˈfɑː.mə.si/", vi: "hiệu thuốc", ex: "I stopped by the pharmacy to pick up some painkillers." },
    { id: "v_deadline", domain: "work",   lv: "B1", en: "deadline", ipa: "/ˈded.laɪn/", vi: "hạn chót", ex: "We need to finish this report before Friday's deadline." },
    { id: "v_colleague",domain: "work",   lv: "A2", en: "colleague", ipa: "/ˈkɒl.iːɡ/", vi: "đồng nghiệp", ex: "My colleagues are very supportive and friendly." },
    { id: "v_fitting",  domain: "shopping",lv:"A2", en: "fitting room", ipa: "/ˈfɪt.ɪŋ ruːm/", vi: "phòng thử đồ", ex: "Excuse me, where is the fitting room?" },
    { id: "v_refund",   domain: "shopping",lv:"B1", en: "refund", ipa: "/ˈriː.fʌnd/", vi: "hoàn tiền", ex: "Can I get a refund if the jacket doesn't fit?" },
    { id: "v_confident",domain: "social", lv: "B1", en: "confident", ipa: "/ˈkɒn.fɪ.dənt/", vi: "tự tin", ex: "Practicing every day makes me feel confident speaking English." },
    { id: "v_exhausted",domain: "social", lv: "B1", en: "exhausted", ipa: "/ɪɡˈzɔː.stɪd/", vi: "kiệt sức", ex: "I was exhausted after hiking up the mountain trail." }
  ];

  /* ---------- Interactive Sentence Pattern Spinner (Khung Mẫu Câu Biến Thiên) ---------- */
  const FRAMES = [
    {
      titleVi: "☕ Gọi món & Yêu cầu Lịch sự",
      template: (a, b) => `Could I get ${a} ${b}, please?`,
      templateVi: (aVi, bVi) => `Cho tôi gọi ${aVi} ${bVi} nhé ạ?`,
      slotA: [
        ["an iced latte", "một ly latte đá"],
        ["a hot green tea", "một ly trà xanh nóng"],
        ["the beef noodle soup", "món phở/mì bò"],
        ["two fresh croissants", "hai chiếc bánh sừng bò tươi"],
        ["a scoop of vanilla ice cream", "một viên kem vị va-ni"]
      ],
      slotB: [
        ["for here", "dùng tại quán"],
        ["to go", "mang đi"],
        ["with less sugar", "ít đường"],
        ["not too spicy", "đừng làm cay quá"],
        ["with extra napkins", "kèm thêm khăn giấy"]
      ]
    },
    {
      titleVi: "👫 Rủ Bạn Bè & Lên Kế Hoạch",
      template: (a, b) => `Do you feel like ${a} ${b}?`,
      templateVi: (aVi, bVi) => `Bạn có hứng ${aVi} ${bVi} không?`,
      slotA: [
        ["grabbing a cup of coffee", "đi uống một ly cà phê"],
        ["taking my dog for a walk in the park", "dắt cún đi dạo ở công viên"],
        ["going camping in Pine Valley", "đi cắm trại ở Thung lũng Thông"],
        ["reviewing our English notes together", "cùng ôn lại vở ghi tiếng Anh"],
        ["splitting a caramel pudding", "gọi chung một bánh flan caramel"]
      ],
      slotB: [
        ["this afternoon", "chiều nay"],
        ["after class", "sau giờ học"],
        ["this weekend", "cuối tuần này"],
        ["right now", "ngay bây giờ"],
        ["when the rain stops", "khi trời tạnh mưa"]
      ]
    },
    {
      titleVi: "🛒 Mua Sắm & Hỏi Giá Cả",
      template: (a, b) => `Excuse me, is ${a} ${b}?`,
      templateVi: (aVi, bVi) => `Xin lỗi, ${aVi} có ${bVi} không ạ?`,
      slotA: [
        ["this bag of red apples", "túi táo đỏ này"],
        ["this carton of fresh milk", "hộp sữa tươi này"],
        ["that winter jacket", "chiếc áo khoác mùa đông kia"],
        ["this adventure storybook", "cuốn truyện phiêu lưu này"]
      ],
      slotB: [
        ["on sale today", "đang giảm giá hôm nay"],
        ["still fresh until Friday", "còn hạn tươi đến thứ Sáu"],
        ["cheaper than the other brand", "rẻ hơn nhãn hiệu kia"],
        ["available in a medium size", "còn cỡ vừa (size M)"]
      ]
    },
    {
      titleVi: "🌦️ Thời Tiết & Phản Ứng Tự Nhiên",
      template: (a, b) => `It's ${a} outside, so let's ${b}!`,
      templateVi: (aVi, bVi) => `Bên ngoài trời đang ${aVi}, nên mình cùng ${bVi} nhé!`,
      slotA: [
        ["bright and sunny", "nắng đẹp rực rỡ"],
        ["raining lightly", "mưa nhẹ"],
        ["a bit chilly and windy", "hơi se lạnh và có gió"],
        ["boiling hot", "nóng như đổ lửa"]
      ],
      slotB: [
        ["sit in the shade under the oak tree", "ngồi dưới bóng râm gốc cây sồi"],
        ["share an umbrella and grab hot tea", "đi chung ô và uống trà nóng"],
        ["zip up our jackets and stay warm", "kéo khóa áo khoác cho ấm"],
        ["order two large lemon iced teas", "gọi hai ly trà chanh đá cỡ lớn"]
      ]
    },
    {
      titleVi: "🧳 Hỏi Đường & Giao Tiếp Xã Hội",
      template: (a, b) => `Excuse me, could you tell me ${a} ${b}?`,
      templateVi: (aVi, bVi) => `Xin lỗi, bạn có thể chỉ giúp tôi ${aVi} ${bVi} được không?`,
      slotA: [
        ["how to get to the train station", "đường đi đến ga tàu"],
        ["what the Wi-Fi password is", "mật khẩu Wi-Fi là gì"],
        ["where the dairy section is", "quầy bơ sữa nằm ở đâu"],
        ["which trail leads to the scenic lookout", "đường mòn nào dẫn lên điểm ngắm cảnh"]
      ],
      slotB: [
        ["from here", "từ chỗ này"],
        ["around this corner", "quanh góc phố này"],
        ["before it closes", "trước giờ đóng cửa"],
        ["if you have a moment", "nếu bạn có chút thời gian"]
      ]
    }
  ];

  const CSS = `
/* =====================================================================
   ELW_VOCAB3000 (.v3k-) Styles — 3000 Words & Sentence Pattern Spinner
   ===================================================================== */
#vocab3000Card {
  background: #ffffff;
  border: 2px solid #bfdbfe;
  border-radius: 18px;
  padding: 14px 16px;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.1);
  font-family: system-ui, -apple-system, sans-serif;
  color: #0f172a;
}
.v3k-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.v3k-hd h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #1e3a8a;
}
.v3k-prog-box {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1.5px solid #93c5fd;
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 12px;
}
.v3k-prog-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  color: #1e40af;
  margin-bottom: 6px;
}
.v3k-prog-bar {
  height: 10px;
  background: #ffffff;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid #bfdbfe;
}
.v3k-prog-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #10b981);
  border-radius: 999px;
  transition: width 0.4s ease;
}

/* Sentence Pattern Spinner */
.v3k-spinner-box {
  background: #fffbeb;
  border: 1.5px solid #fcd34d;
  border-radius: 14px;
  padding: 11px 12px;
  margin-bottom: 12px;
}
.v3k-spin-tabs {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 8px;
}
.v3k-spin-tab {
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid #fde68a;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  color: #92400e;
}
.v3k-spin-tab.on {
  background: #f59e0b;
  color: #ffffff;
  border-color: #d97706;
}
.v3k-live-sent {
  background: #ffffff;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 9px 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.v3k-live-en {
  font-size: 14.5px;
  font-weight: 800;
  color: #0f172a;
}
.v3k-live-vi {
  font-size: 12px;
  color: #b45309;
  font-weight: 600;
  margin-top: 2px;
}
.v3k-slots-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.v3k-slot-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.v3k-slot-btn {
  text-align: left;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  color: #334155;
}
.v3k-slot-btn.on {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

/* 12 Domains Grid */
.v3k-dom-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}
.v3k-dom-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  color: #1e293b;
}
.v3k-dom-btn.on {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}
.v3k-dom-btn small {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
}

.v3k-wlist {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 2px;
}
.v3k-wchip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
}
.v3k-wchip.known {
  background: #f0fdf4;
  border-color: #86efac;
}
.v3k-wchip b {
  font-size: 12.5px;
  color: #0f172a;
  display: block;
}
.v3k-wchip small {
  font-size: 11px;
  color: #64748b;
}
`;

  function injectCss() {
    if (document.getElementById("v3k-css")) return;
    const st = document.createElement("style");
    st.id = "v3k-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function collectAllWords() {
    const map = new Map();
    const roomDomain = rk => {
      const rm = root.ELW_ROOMS && root.ELW_ROOMS[rk];
      const tp = (rm && rm.topic) || (/^market/.test(rk) ? "market" : /^cafe/.test(rk) ? "cafe" : rk);
      return ["cafe", "market", "park", "restaurant", "outdoor", "school"].indexOf(tp) >= 0 ? tp : "home";
    };
    // 1. Collect from ACTIONS vocab
    try {
      const acts = (root.ELW && root.ELW.ACTIONS) || [];
      acts.forEach(a => {
        const dom = roomDomain(a.room);
        (a.vocab || []).forEach(v => {
          const en = String(v[0] || "").trim();
          if (!en || map.has(en.toLowerCase())) return;
          map.set(en.toLowerCase(), { id: "w_" + en.toLowerCase().replace(/\W+/g, "_"), domain: dom, en, ipa: v[1] || "", vi: v[2] || "", ex: a.sentence || "" });
        });
      });
    } catch (e) {}

    // 2. Collect from ROOMS catalogs
    try {
      const rooms = root.ELW_ROOMS || {};
      Object.keys(rooms).forEach(rk => {
        const dom = roomDomain(rk);
        const cat = (rooms[rk] && rooms[rk].catalog) || [];
        cat.forEach(c => {
          const en = String(c.en || "").trim();
          if (!en || map.has(en.toLowerCase())) return;
          map.set(en.toLowerCase(), { id: c.id || ("w_" + en.toLowerCase()), domain: dom, en, ipa: c.ipa || "", vi: c.vi || "", ex: c.ex || "" });
        });
      });
    } catch (e) {}

    // 3. Add expansion words
    EXTRA_WORDS.forEach(w => {
      if (!map.has(w.en.toLowerCase())) map.set(w.en.toLowerCase(), w);
    });

    return Array.from(map.values());
  }

  function countMastered(words) {
    const total = (words && words.length) ? words.length : 1000;
    let n = Object.keys(S.mastered).filter(k => S.mastered[k]).length;
    try {
      const raw = localStorage.getItem("elw_progress_v1");
      if (raw) {
        const P = JSON.parse(raw);
        if (P && P.items) n += Object.keys(P.items).length;
        if (P && P.inv) n += Object.keys(P.inv).filter(k => P.inv[k]).length;
      }
    } catch (e) {}
    return Math.min(total, Math.max(n, Object.keys(S.mastered).filter(k => S.mastered[k]).length));
  }

  let searchQuery = "";
  let visibleLimit = 24;

  function syncModeTabLabel(totalWords) {
    try {
      const learnTabSpan = document.querySelector('#w3dModeTabs [data-mtab="learn"] span');
      if (learnTabSpan && totalWords) {
        learnTabSpan.textContent = `📚 Kho ${totalWords} Từ & Mẫu câu`;
      }
      if (root.ELW_PREMIUM && root.ELW_PREMIUM.sync) root.ELW_PREMIUM.sync();
    } catch (e) {}
  }

  function renderCard() {
    let card = document.getElementById("vocab3000Card");
    if (!card) {
      card = document.createElement("section");
      card.id = "vocab3000Card";
      card.className = "card2";
      card.setAttribute("aria-label", "Kho từ vựng thông dụng & Mẫu câu giao tiếp");
      const side = document.querySelector(".side");
      if (side) side.appendChild(card);
    }

    const words = collectAllWords();
    const totalWords = words.length;
    syncModeTabLabel(totalWords);
    const masteredCount = countMastered(words);
    const pct = Math.min(100, Math.max(2, Math.round((masteredCount / Math.max(1, totalWords)) * 100)));
    const fr = FRAMES[S.activeFrame] || FRAMES[0];
    const sA = fr.slotA[S.slotA % fr.slotA.length] || fr.slotA[0];
    const sB = fr.slotB[S.slotB % fr.slotB.length] || fr.slotB[0];
    const liveEn = fr.template(sA[0], sB[0]);
    const liveVi = fr.templateVi(sA[1], sB[1]);
    const pro = !!(root.ELW_PREMIUM && root.ELW_PREMIUM.isPro && root.ELW_PREMIUM.isPro());

    const q = searchQuery.trim().toLowerCase();
    const domainPool = S.activeDomain === "all"
      ? words
      : words.filter(w => w.domain === S.activeDomain);
    const matchingWords = q
      ? domainPool.filter(w => w.en.toLowerCase().includes(q) || (w.vi && w.vi.toLowerCase().includes(q)))
      : domainPool;
    const filteredWords = matchingWords.slice(0, visibleLimit);

    card.innerHTML = `
      <div class="v3k-hd">
        <h2>🎯 Kho ${totalWords} Từ Vựng & Khung Mẫu Câu</h2>
        <span class="meta">Kho hiện tại: ${totalWords} từ không trùng</span>
      </div>

      <div class="v3k-prog-box">
        <div class="v3k-prog-top">
          <span>📈 Đã thuộc: <b>${masteredCount} từ</b> <small style="color:#64748b">(${totalWords} từ thực tế đã nạp)</small></span>
          <span>Cấp độ: <b>${masteredCount < 300 ? "A1 Starter" : masteredCount < 700 ? "A2 Explorer" : "B1 Communicator"}</b></span>
        </div>
        <div class="v3k-prog-bar"><div class="v3k-prog-fill" style="width:${pct}%"></div></div>
      </div>

      <!-- Interactive Sentence Pattern Spinner -->
      <div class="v3k-spinner-box">
        <div style="font-size:12.5px;font-weight:800;color:#92400e;margin-bottom:6px">
          🎛️ Khung Mẫu Câu Biến Thiên (Học 1 mẫu — Nói 25 câu tự nhiên)
        </div>
        <div class="v3k-spin-tabs">
          ${FRAMES.map((f, i) => `
            <button type="button" class="v3k-spin-tab ${S.activeFrame === i ? "on" : ""}" data-fidx="${i}">
              ${esc(f.titleVi)}
            </button>
          `).join("")}
        </div>
        <div class="v3k-live-sent">
          <div>
            <div class="v3k-live-en">“${esc(liveEn)}”</div>
            <div class="v3k-live-vi">${esc(liveVi)}</div>
          </div>
          <button type="button" class="btn" id="v3kSpeakFrameBtn" style="padding:7px 12px;font-size:12.5px;white-space:nowrap">
            🔊 Nói trong cảnh 3D
          </button>
        </div>
        <div class="v3k-slots-grid">
          <div class="v3k-slot-col">
            <small style="font-size:10.5px;font-weight:800;color:#78350f">1. Chọn cụm từ A:</small>
            ${fr.slotA.map((item, idx) => `
              <button type="button" class="v3k-slot-btn ${(S.slotA % fr.slotA.length) === idx ? "on" : ""}" data-slota="${idx}">
                <b>${esc(item[0])}</b> <small>(${esc(item[1])})</small>
              </button>
            `).join("")}
          </div>
          <div class="v3k-slot-col">
            <small style="font-size:10.5px;font-weight:800;color:#78350f">2. Chọn cụm từ B:</small>
            ${fr.slotB.map((item, idx) => `
              <button type="button" class="v3k-slot-btn ${(S.slotB % fr.slotB.length) === idx ? "on" : ""}" data-slotb="${idx}">
                <b>${esc(item[0])}</b> <small>(${esc(item[1])})</small>
              </button>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- 12 Domains Selector -->
      <div style="font-size:12.5px;font-weight:800;color:#1e3a8a;margin-bottom:6px">
        🗂️ 12 Chủ đề Từ vựng Cốt lõi (Bấm từ để nghe & đánh dấu thuộc):
      </div>
      <div class="v3k-dom-grid">
        ${DOMAINS.map(d => {
          const domCount = words.filter(w => w.domain === d.id).length;
          return `
          <button type="button" class="v3k-dom-btn ${S.activeDomain === d.id ? "on" : ""}" data-dom="${d.id}">
            <span>${d.icon} ${esc(d.vi)} ${d.pro && !pro ? "👑" : ""}</span>
            <small>${domCount} từ thực tế</small>
          </button>
        `;
        }).join("")}
      </div>

      <div style="display:flex;gap:6px;align-items:center;margin:8px 0">
        <input type="search" id="v3kSearchInput" value="${esc(searchQuery)}" placeholder="🔍 Tìm từ tiếng Anh hoặc nghĩa tiếng Việt (${matchingWords.length} từ)..." aria-label="Tìm kiếm từ vựng" style="flex:1;padding:7px 11px;border-radius:10px;border:1.5px solid #cbd5e1;font-size:12.5px">
        ${searchQuery ? `<button type="button" class="iconbtn" id="v3kClearSearchBtn" title="Xóa tìm kiếm">✕</button>` : ""}
      </div>

      <div class="v3k-wlist">
        ${filteredWords.map((w, idx) => {
          const isKnown = !!S.mastered[w.en.toLowerCase()];
          return `
            <button type="button" class="v3k-wchip ${isKnown ? "known" : ""}" data-wen="${esc(w.en)}" data-wex="${esc(w.ex || w.en)}">
              <div>
                <b>${isKnown ? "✅ " : "🔊 "}${esc(w.en)} <span style="font-weight:400;color:#64748b;font-size:11px">${esc(w.ipa || "")}</span></b>
                <small>${esc(w.vi)}</small>
              </div>
              <span style="font-size:11px;font-weight:700;color:${isKnown ? "#15803d" : "#2563eb"}">${isKnown ? "Đã nhớ" : "+Thuộc"}</span>
            </button>
          `;
        }).join("")}
      </div>
      ${matchingWords.length > visibleLimit ? `
        <div style="text-align:center;margin-top:8px">
          <button type="button" class="btn sec" id="v3kLoadMoreBtn" style="font-size:12px;padding:6px 14px;width:100%">
            ➕ Xem thêm từ vựng (Đang hiện ${filteredWords.length} / ${matchingWords.length} từ)
          </button>
        </div>
      ` : ""}
    `;

    const sInp = card.querySelector("#v3kSearchInput");
    if (sInp) {
      sInp.oninput = e => {
        searchQuery = e.target.value;
        visibleLimit = 24;
        renderCard();
        const nextInp = card.querySelector("#v3kSearchInput");
        if (nextInp) {
          nextInp.focus();
          nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
        }
      };
    }
    const clrBtn = card.querySelector("#v3kClearSearchBtn");
    if (clrBtn) {
      clrBtn.onclick = () => {
        searchQuery = "";
        visibleLimit = 24;
        renderCard();
      };
    }
    const moreBtn = card.querySelector("#v3kLoadMoreBtn");
    if (moreBtn) {
      moreBtn.onclick = () => {
        visibleLimit += 24;
        renderCard();
      };
    }

    card.querySelectorAll("[data-fidx]").forEach(b => {
      b.onclick = () => {
        S.activeFrame = +b.dataset.fidx;
        S.slotA = 0;
        S.slotB = 0;
        save();
        renderCard();
      };
    });

    const speakLiveFrame = () => {
      const f = FRAMES[S.activeFrame] || FRAMES[0];
      const a = f.slotA[S.slotA % f.slotA.length] || f.slotA[0];
      const b = f.slotB[S.slotB % f.slotB.length] || f.slotB.length ? f.slotB[0] : ["", ""];
      const sent = f.template(a[0], b[0]);
      try { if (typeof window.charSay === "function") window.charSay(sent); } catch (e) {}
      try { if (typeof window.say === "function") window.say(sent, 0.94); } catch (e) {}
      try { if (root.ELW_PET && root.ELW_PET.onPractice) root.ELW_PET.onPractice(2); } catch (e) {}
    };

    card.querySelector("#v3kSpeakFrameBtn").onclick = speakLiveFrame;

    card.querySelectorAll("[data-slota]").forEach(b => {
      b.onclick = () => {
        S.slotA = +b.dataset.slota;
        save();
        renderCard();
        speakLiveFrame();
      };
    });

    card.querySelectorAll("[data-slotb]").forEach(b => {
      b.onclick = () => {
        S.slotB = +b.dataset.slotb;
        save();
        renderCard();
        speakLiveFrame();
      };
    });

    card.querySelectorAll("[data-dom]").forEach(b => {
      b.onclick = () => {
        const domId = b.dataset.dom;
        const domObj = DOMAINS.find(x => x.id === domId);
        if (domObj && domObj.pro && !pro) {
          if (root.ELW_PREMIUM && root.ELW_PREMIUM.openModal) {
            root.ELW_PREMIUM.openModal(`Bộ 250 từ vựng chủ đề “${domObj.icon} ${domObj.vi}”`);
            return;
          }
        }
        S.activeDomain = S.activeDomain === domId ? "all" : domId;
        visibleLimit = 24;
        save();
        renderCard();
      };
    });

    card.querySelectorAll("[data-wen]").forEach(b => {
      b.onclick = () => {
        const wEn = b.dataset.wen;
        const wEx = b.dataset.wex;
        const k = wEn.toLowerCase();
        S.mastered[k] = !S.mastered[k];
        save();
        try { if (typeof window.say === "function") window.say(wEn + ". " + wEx, 0.92); } catch (e) {}
        try { if (typeof window.charSay === "function") window.charSay(wEx || wEn); } catch (e) {}
        renderCard();
      };
    });
  }

  function init() {
    injectCss();
    renderCard();
  }

  root.ELW_VOCAB3000 = {
    init,
    renderCard,
    totalCount: () => collectAllWords().length,
    words: collectAllWords,
    DOMAINS,
    FRAMES
  };
})(typeof window !== "undefined" ? window : globalThis);
