/* English Life World 2.0 — modules/world-3d.js
   Full 3D Diorama Visual Engine + 3-Tab Workspace (Play / Learn 3000 / Mission & Pet)
   + On-Demand Fridge 3D Drawer Popover + Contextual Home Status Filter.
   Exposes: window.ELW_WORLD3D */
(function (root) {
  "use strict";

  const KEY = "elw_w3d_v1";
  const TAB_KEY = "elw_tab";
  function normTab(t) {
    if (t === "choi" || t === "more") return "play";
    if (t === "hoc") return "learn";
    if (t === "nhiemvu" || t === "home") return "mission";
    return (t === "play" || t === "learn" || t === "mission") ? t : null;
  }
  let S = { tilt3d: true, tab: "play", cameraAngle: "iso" };
  try {
    Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}"));
    const storedTab = normTab(localStorage.getItem(TAB_KEY)) || normTab(S.tab) || "play";
    S.tab = storedTab;
  } catch (e) {}
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
      localStorage.setItem(TAB_KEY, S.tab);
    } catch (e) {}
  };

  const CSS = `
/* =====================================================================
   1. 3D DIORAMA STAGE & VOLUMETRIC LIGHTING
   ===================================================================== */
.scene {
  position: relative;
  perspective: 1350px;
  background: radial-gradient(circle at 50% 18%, #ffffff 0%, #f1f5f9 65%, #e2e8f0 100%) !important;
  border-radius: 22px !important;
  padding: 12px 14px 18px !important;
  box-shadow:
    0 20px 45px -15px rgba(15, 23, 42, 0.18),
    0 4px 12px rgba(15, 23, 42, 0.08),
    inset 0 2px 0 rgba(255, 255, 255, 0.9) !important;
  border: 2px solid #cbd5e1 !important;
  overflow: visible !important;
  transition: box-shadow 0.3s ease;
}

.w3d-stage-wrap {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  border-radius: 18px;
}

body.w3d-iso .w3d-stage-wrap {
  transform: rotateX(5.5deg) rotateY(-1.5deg) translateZ(0);
  box-shadow:
    0 18px 0 -4px #cbd5e1,
    0 24px 0 -6px #94a3b8,
    0 32px 48px rgba(15, 23, 42, 0.26);
}

#room {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 16px !important;
  box-shadow: inset 0 0 28px rgba(255, 255, 255, 0.35);
  filter: contrast(1.03) saturate(1.1);
  transition: filter 0.35s ease, transform 0.25s ease;
  background: #fdfaf5;
}

/* Bright & Cozy Rainy Override: never let the 3D scene look dark or murky */
#room[data-wx="rainy"] {
  filter: brightness(1.06) contrast(1.03) saturate(1.12) !important;
}

/* 3D Extrusion & Hover Pop on Interactive Objects */
#world .obj {
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.22s ease;
  transform-box: fill-box;
  transform-origin: center bottom;
}
#world .obj:hover,
#world .obj.sel {
  filter: drop-shadow(0 10px 14px rgba(15, 23, 42, 0.28)) drop-shadow(0 0 8px rgba(232, 116, 59, 0.55));
}
#world .obj.sel {
  filter: drop-shadow(0 12px 16px rgba(232, 116, 59, 0.38)) drop-shadow(0 0 10px rgba(232, 116, 59, 0.75));
}

/* 3D Character, Companion Linh & Visitors Depth Shadow */
#char, #lt-friend, #lt-visitor, #ctx-dog, #pet-3d-avatar {
  filter: drop-shadow(0 8px 10px rgba(15, 23, 42, 0.26));
}

/* 3D Camera & Stage Controls Pill */
.w3d-cam-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.w3d-cam-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 2px 5px rgba(15, 23, 42, 0.06);
}
.w3d-cam-btn.on {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #3b82f6;
  color: #1d4ed8;
}
.w3d-cam-btn:hover {
  transform: translateY(-1px);
}

/* =====================================================================
   2. 3-TAB WORKSPACE SIDEBAR (PLAY / LEARN 3000 / MISSION & PET)
   ===================================================================== */
.side {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.w3d-mode-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: #f1f5f9;
  padding: 5px;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  position: sticky;
  top: 6px;
  z-index: 30;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
}

.w3d-mtab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 6px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #475569;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
}
.w3d-mtab small {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
}
.w3d-mtab.on {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.12);
}
.w3d-mtab.on[data-mtab="play"] {
  border-bottom: 3px solid #e8743b;
  color: #c2410c;
}
.w3d-mtab.on[data-mtab="learn"] {
  border-bottom: 3px solid #2563eb;
  color: #1d4ed8;
}
.w3d-mtab.on[data-mtab="mission"] {
  border-bottom: 3px solid #10b981;
  color: #047857;
}
.w3d-mtab-badge {
  position: absolute;
  top: 4px;
  right: 6px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 999px;
  line-height: 1.2;
}

/* Hide cards that don't belong to the active tab */
.w3d-tab-hidden {
  display: none !important;
}

/* Keep #panel ("Chọn Hành động") directly below .scene in .leftcol on both PC & Mobile */
#ltCard:empty {
  display: none !important;
  margin: 0 !important;
}
.leftcol > #panel {
  margin-top: 8px !important;
  border: 2px solid #fed7aa !important;
  box-shadow: 0 8px 22px rgba(232, 116, 59, 0.1) !important;
}
.leftcol > #panel .acts {
  max-height: 285px;
  overflow-y: auto;
  padding-right: 4px;
}

/* =====================================================================
   3. ON-DEMAND FRIDGE 3D POPOVER DRAWER (Hidden until Fridge is clicked)
   ===================================================================== */
#fridgeCard.w3d-fridge-popover {
  position: fixed !important;
  right: 24px;
  bottom: 24px;
  width: min(440px, calc(100vw - 32px));
  max-height: 78vh;
  overflow-y: auto;
  z-index: 120;
  background: #ffffff !important;
  border: 2.5px solid #38bdf8 !important;
  border-radius: 20px !important;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.32), 0 0 0 4px rgba(56, 189, 248, 0.15) !important;
  padding: 14px 16px !important;
  animation: w3dPopIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes w3dPopIn {
  from { opacity: 0; transform: translateY(16px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.w3d-fridge-close-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e0f2fe;
}
.w3d-fridge-close-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 4px 10px;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  color: #334155;
}
.w3d-fridge-close-btn:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fca5a5;
}
.w3d-open-fridge-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  margin-bottom: 6px;
  padding: 8px 14px;
  border-radius: 12px;
  border: 1.5px solid #0284c7;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0369a1;
  font-weight: 800;
  font-size: 13.5px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(2, 132, 199, 0.15);
}

/* =====================================================================
   4. COMPACT HOME STATUS BAR (#needsCard only in Home topic, collapsed)
   ===================================================================== */
#needsCard.w3d-needs-compact {
  padding: 8px 12px !important;
  border-radius: 14px !important;
  background: #fffbeb !important;
  border: 1px solid #fde68a !important;
}
#needsCard.w3d-needs-compact:not(.w3d-needs-open) > *:not(:first-child) {
  display: none !important;
}
.w3d-needs-toggle {
  margin-left: auto;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 8px;
  border: 1px solid #fcd34d;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
  color: #92400e;
}
`;

  let fridgeOpen = false;

  function injectCss() {
    if (document.getElementById("w3d-css")) return;
    const st = document.createElement("style");
    st.id = "w3d-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  function currentTopic() {
    try {
      const W = root.ELW && root.ELW.state ? root.ELW.state() : null;
      const r = W ? W.room : "living";
      const rm = root.ELW_ROOMS && root.ELW_ROOMS[r];
      if (rm && rm.topic) return rm.topic;
      if (/^market/.test(r)) return "market";
      if (/^cafe/.test(r)) return "cafe";
      if (["cafe", "market", "park", "restaurant", "outdoor", "school"].indexOf(r) >= 0) return r;
    } catch (e) {}
    return "home";
  }

  function setup3DStage() {
    const svg = document.getElementById("room");
    if (!svg) return;
    const scene = svg.closest(".scene");
    if (scene && !scene.querySelector(".w3d-stage-wrap")) {
      const wrap = document.createElement("div");
      wrap.className = "w3d-stage-wrap";
      svg.parentNode.insertBefore(wrap, svg);
      wrap.appendChild(svg);

      // Subtle interactive 3D parallax tilt on mousemove
      scene.addEventListener("mousemove", e => {
        if (!S.tilt3d) return;
        const rect = scene.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
        const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
        const rx = (5.5 - ny * 4.5).toFixed(2);
        const ry = (-1.5 + nx * 5.5).toFixed(2);
        wrap.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      });
      scene.addEventListener("mouseleave", () => {
        if (!S.tilt3d) { wrap.style.transform = "none"; return; }
        wrap.style.transform = "";
      });
    }
    document.body.classList.toggle("w3d-iso", !!S.tilt3d);

    // Add 3D Camera toggle button to .stools / .scene-bar
    const sbar = document.querySelector(".stools, .scene-bar, .scenebar");
    if (sbar && !document.getElementById("btn3DCam")) {
      const btn = document.createElement("button");
      btn.id = "btn3DCam";
      btn.type = "button";
      btn.className = "w3d-cam-btn" + (S.tilt3d ? " on" : "");
      btn.innerHTML = `🧊 Góc 3D: <b>${S.tilt3d ? "Bật" : "Phẳng"}</b>`;
      btn.title = "Bật/tắt góc nhìn 3D Diorama có chiều sâu";
      btn.onclick = () => {
        S.tilt3d = !S.tilt3d;
        save();
        document.body.classList.toggle("w3d-iso", !!S.tilt3d);
        btn.classList.toggle("on", !!S.tilt3d);
        btn.innerHTML = `🧊 Góc 3D: <b>${S.tilt3d ? "Bật" : "Phẳng"}</b>`;
        const wrap = document.querySelector(".w3d-stage-wrap");
        if (wrap && !S.tilt3d) wrap.style.transform = "none";
        else if (wrap) wrap.style.transform = "";
      };
      sbar.appendChild(btn);
    }
  }

  function setupFridgePopover() {
    const fc = document.getElementById("fridgeCard");
    if (!fc) return;
    fc.classList.add("w3d-fridge-popover");
    if (!fridgeOpen) fc.hidden = true;

    // Ensure close bar inside fridgeCard whenever food.js re-renders it
    const ensureCloseBtn = () => {
      if (!fridgeOpen) { fc.hidden = true; return; }
      fc.hidden = false;
      if (!fc.querySelector(".w3d-fridge-close-bar")) {
        const bar = document.createElement("div");
        bar.className = "w3d-fridge-close-bar";
        bar.innerHTML = `<span style="font-weight:800;color:#0369a1;font-size:13.5px">🧊 Ngăn kéo Tủ lạnh 3D (Bấm món để lấy/cất)</span><button type="button" class="w3d-fridge-close-btn" id="btnCloseFridge" data-close-fridge="1">✕ Đóng tủ lạnh</button>`;
        fc.insertBefore(bar, fc.firstChild);
        bar.querySelector("#btnCloseFridge").onclick = () => closeFridge();
      }
    };

    const obs = new MutationObserver(() => ensureCloseBtn());
    obs.observe(fc, { childList: true });
    ensureCloseBtn();

    // Close fridge popover on Escape key
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && fridgeOpen) {
        closeFridge();
      }
    });

    // Close fridge popover when clicking outside on backdrop
    document.addEventListener("click", e => {
      if (!fridgeOpen) return;
      if (fc.contains(e.target)) return;
      if (e.target.closest("#o-fridge") || e.target.closest(".w3d-open-fridge-btn")) return;
      closeFridge();
    });

    // Auto-close fridge popover on mobile after clicking an action button inside it
    fc.addEventListener("click", e => {
      const actBtn = e.target.closest("button[data-act], .fd-act, .act");
      if (actBtn && !actBtn.classList.contains("w3d-fridge-close-btn") && window.innerWidth <= 760) {
        setTimeout(() => closeFridge(), 160);
      }
    });

    // Open fridge popover automatically when clicking #o-fridge in the 3D scene
    const room = document.getElementById("room");
    if (room) {
      room.addEventListener("click", e => {
        const obj = e.target.closest(".obj");
        if (!obj) return;
        const oid = obj.dataset.obj || (obj.id || "").replace(/^o-/, "");
        if (oid === "fridge") {
          openFridge();
        }
      });
    }

    // Also inject a button inside #panel when fridge object is selected
    const panel = document.getElementById("panel");
    if (panel) {
      const pObs = new MutationObserver(() => {
        const oh = panel.querySelector(".ohead b");
        if (oh && /fridge|refrigerator/i.test(oh.textContent || "") && !panel.querySelector(".w3d-open-fridge-btn")) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "w3d-open-fridge-btn";
          btn.innerHTML = `🧊 Xem & Lấy đồ trong Tủ lạnh (${fridgeOpen ? "Đang mở" : "21 thực phẩm"})`;
          btn.onclick = () => toggleFridge();
          const hint = panel.querySelector(".hint");
          if (hint) panel.insertBefore(btn, hint);
          else panel.appendChild(btn);
        }
      });
      pObs.observe(panel, { childList: true });
    }
  }

  function openFridge() {
    const fc = document.getElementById("fridgeCard");
    if (!fc) return;
    fridgeOpen = true;
    fc.hidden = false;
    fc.classList.remove("w3d-tab-hidden", "uimb-tab-hidden");
    if (!fc.querySelector(".w3d-fridge-close-bar")) {
      const bar = document.createElement("div");
      bar.className = "w3d-fridge-close-bar";
      bar.innerHTML = `<span style="font-weight:800;color:#0369a1;font-size:13.5px">🧊 Ngăn kéo Tủ lạnh 3D (Bấm món để lấy/cất)</span><button type="button" class="w3d-fridge-close-btn" id="btnCloseFridge" data-close-fridge="1">✕ Đóng tủ lạnh</button>`;
      fc.insertBefore(bar, fc.firstChild);
      bar.querySelector("#btnCloseFridge").onclick = () => closeFridge();
    }
  }

  function closeFridge() {
    const fc = document.getElementById("fridgeCard");
    fridgeOpen = false;
    if (fc) fc.hidden = true;
  }

  function toggleFridge() {
    if (fridgeOpen) closeFridge();
    else openFridge();
  }

  function ensurePanelBelowScene() {
    const leftcol = document.querySelector(".leftcol");
    const sceneEl = document.querySelector(".leftcol .scene") || document.querySelector(".scene");
    const panelEl = document.getElementById("panel");
    if (leftcol && panelEl) {
      if (panelEl.parentNode !== leftcol || panelEl.previousElementSibling !== sceneEl) {
        if (sceneEl && sceneEl.parentNode === leftcol) {
          sceneEl.insertAdjacentElement("afterend", panelEl);
        } else {
          leftcol.appendChild(panelEl);
        }
      }
    }
  }

  function arrangeManagedCards() {
    const side = document.querySelector(".side");
    if (!side) return;
    const orderedIds = [
      // Tab 1: Chơi
      "ctxTalkCard", "quickCard", "evTray", "peopleCard", "needsCard", "rpCard",
      // Tab 2: Học (speakingCard MUST be last)
      "seqCard", "storyCard", "vocab3000Card", "invWrap", "mistakeCard", "speakingCard",
      // Tab 3: Nhiệm vụ
      "missionCard", "chCard", "petSurvivalCard", "dayHud"
    ];
    orderedIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.parentNode !== side) {
        side.appendChild(el);
      }
    });
    // Guarantee #speakingCard is always after #mistakeCard / #invWrap / #vocab3000Card / #storyCard / #seqCard
    const speakingEl = document.getElementById("speakingCard");
    const missionEl = document.getElementById("missionCard");
    if (speakingEl && speakingEl.parentNode === side) {
      const h2 = speakingEl.querySelector("h2");
      if (h2 && h2.textContent.indexOf("sắp có") < 0) {
        h2.innerHTML = '🎙️ Luyện nói & hội thoại <span class="meta">(sắp có · cần API)</span>';
      }
      if (missionEl && missionEl.parentNode === side) {
        if (speakingEl.nextElementSibling !== missionEl) {
          side.insertBefore(speakingEl, missionEl);
        }
      } else {
        side.appendChild(speakingEl);
      }
    }
  }

  function syncContextualPanels() {
    const tp = currentTopic();
    const isHome = tp === "home";

    ensurePanelBelowScene();

    // Always keep #btnFriend hidden on both mobile and desktop (Linh is controlled via Context Bar)
    const bf = document.getElementById("btnFriend");
    if (bf) {
      bf.hidden = true;
      bf.style.display = "none";
    }

    // 1. Hide #needsCard ("Tình trạng ngôi nhà") completely outside "home" topic!
    const nc = document.getElementById("needsCard");
    if (nc) {
      if (!isHome) {
        nc.hidden = true;
        nc.classList.add("w3d-tab-hidden", "uimb-tab-hidden");
      } else {
        nc.classList.add("w3d-needs-compact");
        const h2 = nc.querySelector("h2, h3, .nd-hd");
        if (h2 && !h2.querySelector(".w3d-needs-toggle")) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "w3d-needs-toggle";
          btn.textContent = nc.classList.contains("w3d-needs-open") ? "Thu gọn ▴" : "Chi tiết ▾";
          btn.onclick = e => {
            e.stopPropagation();
            nc.classList.toggle("w3d-needs-open");
            btn.textContent = nc.classList.contains("w3d-needs-open") ? "Thu gọn ▴" : "Chi tiết ▾";
          };
          h2.appendChild(btn);
        }
      }
    }

    // 2. Close fridge popover automatically if leaving home
    if (!isHome && fridgeOpen) closeFridge();

    // 3. Hide #peopleCard outside home
    const pc = document.getElementById("peopleCard");
    if (pc && !isHome) pc.hidden = true;

    // 4. Sync weather attribute on #room for bright rainy styling
    const room = document.getElementById("room");
    if (room && root.ELW_LIFE && root.ELW_LIFE.weather) {
      room.setAttribute("data-wx", root.ELW_LIFE.weather());
    }

    // 5. Refresh Challenge panel so it only shows challenges for the current topic
    try {
      if (root.ELW_CHALLENGE && root.ELW_CHALLENGE.refresh) root.ELW_CHALLENGE.refresh();
    } catch (e) {}

    applyTabVisibility();
  }

  function setupModeTabs() {
    const side = document.querySelector(".side");
    if (!side || document.getElementById("w3dModeTabs")) return;

    const bar = document.createElement("div");
    bar.id = "w3dModeTabs";
    bar.className = "w3d-mode-tabs";
    bar.setAttribute("role", "tablist");
    const vCount = (root.ELW_VOCAB3000 && root.ELW_VOCAB3000.totalCount) ? root.ELW_VOCAB3000.totalCount() : 0;
    bar.setAttribute("aria-label", "Chế độ Chơi, Học, Nhiệm vụ");
    bar.innerHTML = `
      <button type="button" role="tab" class="w3d-mtab ${S.tab === "play" ? "on" : ""}" data-mtab="play" aria-selected="${S.tab === "play"}">
        <span>🎮 Chơi</span>
        <small>Ngữ cảnh · Cô Mai</small>
      </button>
      <button type="button" role="tab" class="w3d-mtab ${S.tab === "learn" ? "on" : ""}" data-mtab="learn" aria-selected="${S.tab === "learn"}">
        <span>📖 Học</span>
        <small>Đoạn văn · ${vCount ? `Kho ${vCount} từ` : "Từ vựng"}</small>
      </button>
      <button type="button" role="tab" class="w3d-mtab ${S.tab === "mission" ? "on" : ""}" data-mtab="mission" aria-selected="${S.tab === "mission"}">
        <span>🎯 Nhiệm vụ</span>
        <small>Thử thách · Pet</small>
        <span class="w3d-mtab-badge" id="w3dMissionBadge">!</span>
      </button>
    `;
    side.insertBefore(bar, side.firstChild);

    bar.querySelectorAll(".w3d-mtab").forEach(btn => {
      btn.onclick = () => setTab(btn.dataset.mtab);
    });

    ensurePanelBelowScene();

    // Move and order sidebar cards into .side so the 3-tab controller cleanly manages them
    const orderedIds = [
      "ctxTalkCard", "quickCard", "evTray", "peopleCard", "needsCard", "rpCard",
      "seqCard", "storyCard", "vocab3000Card", "invWrap", "mistakeCard", "speakingCard",
      "missionCard", "chCard", "petSurvivalCard", "dayHud"
    ];
    orderedIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        side.appendChild(el);
      }
    });

    applyTabVisibility();
  }

  function setTab(tabId) {
    const norm = normTab(tabId);
    if (!norm) return;
    S.tab = norm;
    save();
    const bar = document.getElementById("w3dModeTabs");
    if (bar) {
      bar.querySelectorAll(".w3d-mtab").forEach(b => {
        const on = b.dataset.mtab === norm;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
    }
    // Sync mobile bottom bar highlight
    try {
      const uimbBar = document.getElementById("uimb-bar");
      if (uimbBar) {
        uimbBar.querySelectorAll(".uimb-tab-btn").forEach(btn => {
          const isSel = btn.getAttribute("data-tab") === norm;
          btn.classList.toggle("uimb-tab-active", isSel);
          btn.setAttribute("aria-selected", isSel ? "true" : "false");
        });
      }
      if (root.ELW_UI_MOBILE && typeof root.ELW_UI_MOBILE.current === "function" && root.ELW_UI_MOBILE.current() !== norm) {
        root.ELW_UI_MOBILE.select(norm);
      }
    } catch (e) {}
    applyTabVisibility();
  }

  function applyTabVisibility() {
    const tp = currentTopic();
    const isHome = tp === "home";
    const tab = normTab(S.tab) || "play";
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 760;

    ensurePanelBelowScene();
    arrangeManagedCards();

    // Mobile: Scene (.leftcol, section.scene, #panel, .guide) is ONLY shown on "play" (Chơi) tab!
    // Desktop (> 760px): Scene and #panel in .leftcol are always visible alongside .side.
    const leftcol = document.querySelector(".leftcol");
    const sceneEl = document.querySelector("section.scene");
    const panelEl = document.getElementById("panel");
    const guideEl = document.querySelector(".guide");
    const hideSceneOnMobile = isMobile && tab !== "play";

    [leftcol, sceneEl, panelEl, guideEl].forEach(el => {
      if (!el) return;
      el.classList.toggle("uimb-tab-hidden", hideSceneOnMobile);
      el.classList.remove("w3d-tab-hidden");
      if (!hideSceneOnMobile) el.hidden = false;
    });

    const groups = {
      play: ["ctxTalkCard", "quickCard", "evTray", "rpCard", ...(isHome ? ["peopleCard", "needsCard"] : [])],
      learn: ["seqCard", "storyCard", "vocab3000Card", "invWrap", "mistakeCard", "speakingCard"],
      mission: ["missionCard", "chCard", "petSurvivalCard", "dayHud"]
    };

    const allManaged = [
      "ctxTalkCard", "quickCard", "evTray", "peopleCard", "needsCard", "rpCard",
      "seqCard", "storyCard", "vocab3000Card", "invWrap", "mistakeCard", "speakingCard",
      "missionCard", "chCard", "petSurvivalCard", "dayHud"
    ];
    const activeSet = new Set(groups[tab] || groups.play);

    allManaged.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if ((id === "needsCard" || id === "peopleCard") && !isHome) {
        el.hidden = true;
        el.classList.add("w3d-tab-hidden", "uimb-tab-hidden");
        return;
      }
      const show = activeSet.has(id);
      el.classList.toggle("w3d-tab-hidden", !show);
      el.classList.toggle("uimb-tab-hidden", !show);
      if (show && id !== "rpCard") el.hidden = false;
    });
  }

  function init() {
    injectCss();
    setup3DStage();
    setupModeTabs();
    setupFridgePopover();
    syncContextualPanels();
    setInterval(syncContextualPanels, 900);
  }

  const API = {
    init,
    setTab,
    getTab: () => S.tab,
    openFridge,
    closeFridge,
    toggleFridge,
    isFridgeOpen: () => fridgeOpen,
    sync: syncContextualPanels,
    syncTopic: syncContextualPanels
  };

  root.ELW_WORLD3D = API;
})(typeof window !== "undefined" ? window : globalThis);
