/* English Life World — ui-topics.js
   Visual/UI Topics Enhancer & Decorator (Mobile-first 360px–412px)
   Contract: window.ELW_UI_TOPICS
   - Only visual and CSS decoration: preserves all unlocking and topic selection logic
   - Responsive card redesign with 2.5D artwork from assets/topics/
   - High-contrast, touch-friendly lock input and unlock celebration feedback
   - CSS adjustments for 20 new object labels to prevent overlap on mobile 390px
*/
(function (root) {
  "use strict";

  const CSS_TEXT = `
/* ===== English Life World: UI Topics & Tag Polish (.uit-) ===== */

/* Backdrop overlay with modern blur */
#topicSheet {
  position: fixed !important;
  inset: 0 !important;
  z-index: 350 !important;
  background: rgba(30, 20, 10, 0.58) !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
  display: flex !important;
  align-items: flex-end !important;
  justify-content: center !important;
  animation: uitFadeIn 0.22s ease-out;
}
#topicSheet[hidden] {
  display: none !important;
}

/* Bottom Sheet Container */
#topicSheet .ts {
  background: radial-gradient(circle at top right, #fffaf4 0%, #fffdf9 45%) !important;
  width: 100% !important;
  max-width: 480px !important;
  border-radius: 26px 26px 0 0 !important;
  padding: 12px 14px 22px !important;
  max-height: 88vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  box-shadow: 0 -8px 32px rgba(35, 20, 10, 0.28) !important;
  border: 1px solid rgba(232, 116, 59, 0.18) !important;
  border-bottom: none !important;
  animation: uitSlideUp 0.26s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box !important;
}

/* Grab Handle on Mobile */
#topicSheet .ts::before {
  content: "" !important;
  display: block !important;
  width: 42px !important;
  height: 4.5px !important;
  border-radius: 999px !important;
  background: #ded0c0 !important;
  margin: 0 auto 10px !important;
}

@media (min-width: 761px) {
  #topicSheet {
    align-items: center !important;
    padding: 20px !important;
  }
  #topicSheet .ts {
    max-width: 720px !important;
    border-radius: 24px !important;
    border-bottom: 1px solid rgba(232, 116, 59, 0.18) !important;
    padding: 18px 22px 24px !important;
    box-shadow: 0 18px 48px rgba(35, 20, 10, 0.32) !important;
  }
  #topicSheet .ts::before {
    display: none !important;
  }
  #topicSheet .tgrid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 12px !important;
  }
}

#topicSheet .tcard .tareas {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 3px !important;
  margin-top: 6px !important;
}
#topicSheet .tcard .tarea-chip {
  font-size: 10px !important;
  font-weight: 700 !important;
  background: #f8efe6 !important;
  color: #6e4f35 !important;
  border: 1px solid #ead5c3 !important;
  border-radius: 999px !important;
  padding: 1px 6px !important;
  line-height: 1.25 !important;
  white-space: nowrap !important;
}

/* Header & Subtitle */
#topicSheet h3 {
  margin: 0 0 4px !important;
  font-size: 19px !important;
  font-weight: 800 !important;
  color: #3b2412 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
#topicSheet .sub {
  margin: 0 0 12px !important;
  font-size: 12.5px !important;
  line-height: 1.42 !important;
  color: #7d6550 !important;
}

/* Unlock Form Box (.tslock) */
#topicSheet .tslock {
  background: #fff6ef !important;
  border: 1.5px solid #f2ceb8 !important;
  border-radius: 18px !important;
  padding: 12px 12px 10px !important;
  margin: 0 0 14px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  box-shadow: inset 0 1px 3px rgba(232, 116, 59, 0.06) !important;
}

.uit-lock-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  color: #5a3d1f;
}

.uit-input-row {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: stretch;
}

#topicSheet .tslock input {
  flex: 1 !important;
  width: auto !important;
  min-width: 0 !important;
  min-height: 48px !important;
  font-size: 22px !important;
  font-weight: 800 !important;
  font-family: system-ui, -apple-system, monospace !important;
  letter-spacing: 8px !important;
  text-align: center !important;
  border: 2px solid #debca3 !important;
  border-radius: 14px !important;
  background: #ffffff !important;
  color: #4a2d15 !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04) !important;
  transition: border-color 0.18s, box-shadow 0.18s !important;
  padding: 0 8px !important;
}
#topicSheet .tslock input:focus {
  border-color: #e8743b !important;
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(232, 116, 59, 0.22) !important;
}
#topicSheet .tslock input::placeholder {
  font-size: 13.5px !important;
  letter-spacing: 1px !important;
  font-weight: 500 !important;
  color: #ab9784 !important;
}

#topicSheet .tslock button {
  min-height: 48px !important;
  border: 0 !important;
  border-radius: 14px !important;
  background: linear-gradient(135deg, #e8743b, #d35c24) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  font-size: 14px !important;
  padding: 0 16px !important;
  cursor: pointer !important;
  box-shadow: 0 3px 8px rgba(232, 116, 59, 0.35) !important;
  transition: transform 0.15s, background 0.15s !important;
  white-space: nowrap !important;
  flex: 0 0 auto !important;
}
#topicSheet .tslock button:active {
  transform: scale(0.96) !important;
  background: #c44f19 !important;
}

#tsMsg {
  font-size: 12.5px !important;
  font-weight: 700 !important;
  color: #c0392b !important;
  line-height: 1.3 !important;
}

/* Shake Animation on Wrong Code */
@keyframes uitShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.uit-shake {
  animation: uitShake 0.4s ease-in-out !important;
}

/* Unlock Celebration Toast */
.uit-celebrate-banner {
  background: linear-gradient(135deg, #f0fdf4, #e8f9ed);
  border: 1.5px solid #86efac;
  border-radius: 14px;
  padding: 8px 12px;
  margin-bottom: 12px;
  color: #166534;
  font-size: 12.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 3px 10px rgba(34, 197, 94, 0.15);
  animation: uitFadeIn 0.3s ease;
}

.uit-unlock-toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  background: linear-gradient(135deg, #166534, #15803d);
  color: #ffffff;
  border: 1.5px solid #86efac;
  border-radius: 999px;
  padding: 10px 18px;
  font-size: 13.5px;
  font-weight: 800;
  box-shadow: 0 8px 24px rgba(22, 101, 52, 0.35);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  animation: uitFadeIn 0.25s ease-out;
}

/* Topic Cards Grid (.tgrid) */
#topicSheet .tgrid {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 10px !important;
}
@media (max-width: 365px) {
  #topicSheet .tgrid {
    gap: 8px !important;
  }
}

/* Topic Card Redesign (.tcard) */
#topicSheet .tcard {
  position: relative !important;
  border: 2px solid #ecd9c6 !important;
  border-radius: 18px !important;
  padding: 8px !important;
  background: #ffffff !important;
  text-align: left !important;
  font: inherit !important;
  color: #4a2e16 !important;
  cursor: pointer !important;
  min-height: 160px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  overflow: hidden !important;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease !important;
  -webkit-tap-highlight-color: transparent !important;
}
#topicSheet .tcard:active {
  transform: scale(0.97) !important;
}

/* Hide old default emoji inside decorated cards */
#topicSheet .tcard.uit-decorated .ti {
  display: none !important;
}

/* Illustration Box in Card */
.uit-card-illus {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  min-height: 84px;
  max-height: 110px;
  border-radius: 12px;
  overflow: hidden;
  background: #fdf5ec;
  margin-bottom: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(238, 220, 201, 0.7);
}
.uit-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}
.tcard:hover .uit-card-img {
  transform: scale(1.04);
}

/* Lock Overlay inside Illustration */
.uit-card-lock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(35, 22, 12, 0.46);
  backdrop-filter: blur(1.5px);
  -webkit-backdrop-filter: blur(1.5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #ffffff;
  pointer-events: none;
}
.uit-card-lock-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}
.uit-card-lock-text {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

/* Card Badge (.tb) */
#topicSheet .tcard .tb {
  position: absolute !important;
  top: 7px !important;
  right: 7px !important;
  z-index: 3 !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  border-radius: 999px !important;
  padding: 3px 8px !important;
  line-height: 1.2 !important;
  background: rgba(45, 30, 18, 0.75) !important;
  color: #ffffff !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
}

/* Live Card (Currently Playing) */
#topicSheet .tcard.live {
  border-color: #e8743b !important;
  background: linear-gradient(180deg, #fffaf5 0%, #ffffff 100%) !important;
  box-shadow: 0 4px 14px rgba(232, 116, 59, 0.18) !important;
}
#topicSheet .tcard.live .tb {
  background: #e8743b !important;
  color: #ffffff !important;
}

/* Picked Card (Selected) */
#topicSheet .tcard.picked {
  border-color: #3b8de8 !important;
  background: linear-gradient(180deg, #f2f7ff 0%, #ffffff 100%) !important;
  box-shadow: 0 4px 14px rgba(59, 141, 232, 0.18) !important;
}
#topicSheet .tcard.picked .tb {
  background: #3b8de8 !important;
  color: #ffffff !important;
}

/* Locked Card Dimming */
#topicSheet .tcard.uit-locked:not(.live) {
  opacity: 0.72 !important;
  filter: grayscale(0.2) !important;
  background: #fbf9f6 !important;
  border-color: #e3dacd !important;
}
#topicSheet .tcard.uit-locked:not(.live):active {
  border-color: #e8743b !important;
}

/* Typography inside Card */
#topicSheet .tcard .tn {
  font-size: 14.5px !important;
  font-weight: 800 !important;
  color: #3a2210 !important;
  line-height: 1.25 !important;
  margin-top: 1px !important;
}
#topicSheet .tcard .te {
  font-size: 11.5px !important;
  font-weight: 600 !important;
  color: #806854 !important;
  line-height: 1.2 !important;
  margin-top: 1px !important;
}
#topicSheet .tcard .tw {
  font-size: 10.5px !important;
  color: #a48c77 !important;
  line-height: 1.25 !important;
  margin-top: 4px !important;
  display: -webkit-box !important;
  -webkit-line-clamp: 2 !important;
  -webkit-box-orient: vertical !important;
  overflow: hidden !important;
}

/* Footer Close Button */
#topicSheet .tsfoot {
  margin-top: 14px !important;
}
#topicSheet .tsfoot button,
#tsClose {
  width: 100% !important;
  min-height: 48px !important;
  border-radius: 15px !important;
  border: 0 !important;
  font-size: 15px !important;
  font-weight: 800 !important;
  background: #e8743b !important;
  color: #ffffff !important;
  cursor: pointer !important;
  box-shadow: 0 4px 12px rgba(232, 116, 59, 0.3) !important;
  transition: transform 0.15s, background 0.15s !important;
}
#topicSheet .tsfoot button:active,
#tsClose:active {
  transform: scale(0.98) !important;
  background: #cf5e28 !important;
}

/* Animations */
@keyframes uitFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes uitSlideUp {
  from { transform: translateY(30px); opacity: 0.8; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes uitPulseBadge {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

/* ===== 20 New Detail Objects Tag Offset Rules (Prevent Overlap on 390px) ===== */
/* 1. Living room ceiling light: move up-right into clear ceiling space away from window (510,50) */
#room #o-ceilinglight .tag {
  transform: translate(52px, -36px) !important;
}
/* 2. Living room vase: move down-right away from speaker tag (822,462) */
#room #o-vase .tag {
  transform: translate(26px, 22px) !important;
}
/* 3. Living room hanging plant: move down into open space away from fridge tag (905,100) */
#room #o-hangingplant .tag {
  transform: translate(0px, 46px) !important;
}
/* 4. Bedroom fairy lights: move up away from bed tag (265,210) to where lights hang */
#room #o-fairylights .tag {
  transform: translate(0px, -55px) !important;
}
/* 5. Kitchen recycling bin: shift left-down away from kitchen trashbin (165,380) */
#room #o-recyclingbin .tag {
  transform: translate(-32px, 32px) !important;
}

/* Mobile 360–412px Crisp Tag Contrast & Readability */
@media (max-width: 760px) {
  #room .tag {
    font-size: 14.5px !important;
    font-weight: 800 !important;
    paint-order: stroke fill !important;
    stroke: #ffffff !important;
    stroke-width: 4.5px !important;
    stroke-linejoin: round !important;
    fill: #452a14 !important;
    filter: drop-shadow(0 1px 2px rgba(45, 30, 18, 0.45)) !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  #topicSheet, #topicSheet .ts, .uit-shake {
    animation: none !important;
    transition: none !important;
  }
}
`;

  // Fallback SVGs in case image file path is unavailable
  const FALLBACK_SVGS = {
    home: `<svg viewBox="0 0 100 66" width="100%" height="100%"><rect width="100" height="66" fill="#fff5e8"/><ellipse cx="50" cy="54" rx="34" ry="10" fill="#fedac2"/><rect x="36" y="24" width="28" height="24" rx="5" fill="#e8743b"/><polygon points="28,24 50,8 72,24" fill="#d35c24"/><circle cx="50" cy="34" r="5" fill="#fcdb77"/></svg>`,
    park: `<svg viewBox="0 0 100 66" width="100%" height="100%"><rect width="100" height="66" fill="#e3f4fd"/><path d="M0 45 Q50 35 100 45 L100 66 L0 66 Z" fill="#80be75"/><circle cx="80" cy="30" r="16" fill="#4d9443"/><ellipse cx="35" cy="54" rx="20" ry="8" fill="#4ea9d6"/></svg>`,
    restaurant: `<svg viewBox="0 0 100 66" width="100%" height="100%"><rect width="100" height="66" fill="#f5e4d3"/><ellipse cx="50" cy="46" rx="32" ry="10" fill="#fffaf0" stroke="#a45f31" stroke-width="2"/><path d="M38 42 C38 28 62 28 62 42 Z" fill="#cbd5e1"/><circle cx="50" cy="27" r="2.5" fill="#df9a24"/></svg>`,
    cafe: `<svg viewBox="0 0 100 66" width="100%" height="100%"><rect width="100" height="66" fill="#edf5f4"/><rect y="44" width="100" height="22" fill="#8c532b"/><path d="M38 34 C38 50 62 50 62 34 Z" fill="#e8743b"/><ellipse cx="50" cy="34" rx="12" ry="5" fill="#5a3418"/><circle cx="50" cy="34" r="2.5" fill="#fff"/></svg>`,
    supermarket: `<svg viewBox="0 0 100 66" width="100%" height="100%"><rect width="100" height="66" fill="#f0f7fb"/><rect x="25" y="24" width="46" height="24" rx="4" fill="none" stroke="#64748b" stroke-width="2.5"/><rect x="22" y="20" width="8" height="6" rx="2" fill="#e8743b"/><circle cx="36" cy="54" r="4" fill="#334155"/><circle cx="62" cy="54" r="4" fill="#334155"/></svg>`,
    outdoor: `<svg viewBox="0 0 100 66" width="100%" height="100%"><rect width="100" height="66" fill="#243348"/><polygon points="0,50 35,28 70,50 100,32 100,66 0,66" fill="#1d2736"/><polygon points="45,34 30,58 60,58" fill="#e8743b"/><circle cx="20" cy="20" r="4" fill="#fef08a"/></svg>`
  };

  let wasUnlocked = false;

  function isUnlocked() {
    try {
      const K = "elw_topics_v1";
      const raw = localStorage.getItem(K);
      if (!raw) return false;
      const st = JSON.parse(raw);
      return !!(st && st.unlocked);
    } catch (e) {
      return false;
    }
  }

  function injectStyles() {
    if (document.getElementById("uitTopicCss")) return;
    const style = document.createElement("style");
    style.id = "uitTopicCss";
    style.textContent = CSS_TEXT;
    document.head.appendChild(style);
  }

  let attachedSheet = null;

  function showUnlockToast(msgText) {
    try {
      if (typeof root.toastG === "function") {
        root.toastG(msgText);
      } else {
        const gt = document.getElementById("guideText");
        if (gt) gt.textContent = msgText;
      }
    } catch (e) {}

    try {
      let existing = document.getElementById("uitUnlockToast");
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      const t = document.createElement("div");
      t.id = "uitUnlockToast";
      t.className = "uit-unlock-toast";
      t.setAttribute("role", "status");
      t.innerHTML = `<span>🎉</span><span>${msgText}</span>`;
      if (document.body) {
        document.body.appendChild(t);
        setTimeout(function () {
          if (t && t.parentNode) t.parentNode.removeChild(t);
        }, 4200);
      }
    } catch (e) {}
  }

  function decorateSheet(sh) {
    if (!sh) return;
    const unlocked = isUnlocked();

    // Check if we just unlocked in this session
    if (!wasUnlocked && unlocked) {
      const ts = sh.querySelector(".ts");
      if (ts && !ts.querySelector(".uit-celebrate-banner")) {
        const banner = document.createElement("div");
        banner.className = "uit-celebrate-banner";
        banner.innerHTML = "<span>🎉</span><span><b>Đã mở khoá toàn bộ chủ đề và thú cưng Premium!</b> Tích chọn chủ đề bạn muốn ưu tiên học tiếp.</span>";
        const grid = ts.querySelector(".tgrid");
        if (grid) ts.insertBefore(banner, grid);
      }
      showUnlockToast("Đã mở khoá toàn bộ chủ đề và thú cưng Premium");
      try {
        if (root.ELW_PET_UI && typeof root.ELW_PET_UI.refresh === "function") {
          root.ELW_PET_UI.refresh();
        } else if (root.ELW_PET && typeof root.ELW_PET.renderCard === "function") {
          root.ELW_PET.renderCard();
        }
      } catch (e) {}
    }
    wasUnlocked = unlocked;

    // Decorate Lock Form (#tsLock)
    const lk = sh.querySelector("#tsLock");
    if (lk && !lk.classList.contains("uit-decorated-form")) {
      lk.classList.add("uit-decorated-form");

      // Add clean header without revealing unlock code
      const head = document.createElement("div");
      head.className = "uit-lock-header";
      head.innerHTML = `<span>🔒 Nhập mã 4 số để mở khoá chủ đề & thú cưng Premium</span>`;
      lk.insertBefore(head, lk.firstChild);

      // Wrap input & button in nice row
      const inp = lk.querySelector("#tsCode");
      const btn = lk.querySelector("button[type='submit']");
      if (inp && btn && inp.parentElement === lk) {
        const row = document.createElement("div");
        row.className = "uit-input-row";
        inp.parentElement.insertBefore(row, inp);
        row.appendChild(inp);
        row.appendChild(btn);
      }

      // Add shake on wrong code submission
      lk.addEventListener("submit", function () {
        setTimeout(function () {
          const msg = sh.querySelector("#tsMsg");
          if (msg && msg.textContent.includes("Sai mã")) {
            lk.classList.remove("uit-shake");
            void lk.offsetWidth; // retrigger reflow
            lk.classList.add("uit-shake");
          }
        }, 30);
      });
    }

    // Decorate Cards in .tgrid
    const cards = sh.querySelectorAll(".tcard[data-topic]");
    cards.forEach(function (card) {
      const topicId = card.dataset.topic;
      const isLive = card.classList.contains("live");
      const isPicked = card.classList.contains("picked");
      const isLocked = !unlocked && !isLive;

      card.classList.add("uit-decorated");
      if (isLocked) {
        card.classList.add("uit-locked");
      } else {
        card.classList.remove("uit-locked");
      }

      // Insert illustration if not already present
      let illus = card.querySelector(".uit-card-illus");
      if (!illus) {
        illus = document.createElement("div");
        illus.className = "uit-card-illus";

        const img = document.createElement("img");
        img.className = "uit-card-img";
        img.src = `assets/topics/${topicId}.png`;
        img.alt = topicId;
        img.loading = "lazy";

        // Fallback to inline SVG or .svg if PNG fails
        img.onerror = function () {
          this.style.display = "none";
          if (!illus.querySelector(".uit-card-fallback")) {
            const fb = document.createElement("div");
            fb.className = "uit-card-fallback";
            fb.style.width = "100%";
            fb.style.height = "100%";
            fb.innerHTML = FALLBACK_SVGS[topicId] || `<img src="assets/topics/${topicId}.svg" style="width:100%;height:100%;object-fit:cover;">`;
            illus.appendChild(fb);
          }
        };

        illus.appendChild(img);

        // If locked, overlay lock badge
        if (isLocked) {
          const lockOverlay = document.createElement("div");
          lockOverlay.className = "uit-card-lock-overlay";
          lockOverlay.innerHTML = `<span class="uit-card-lock-icon">🔒</span><span class="uit-card-lock-text">Chưa mở</span>`;
          illus.appendChild(lockOverlay);
        }

        // Insert at top of card (before title)
        const tn = card.querySelector(".tn");
        if (tn) {
          card.insertBefore(illus, tn);
        } else {
          card.appendChild(illus);
        }
      } else {
        // Update lock overlay
        let lockOverlay = illus.querySelector(".uit-card-lock-overlay");
        if (isLocked) {
          if (!lockOverlay) {
            lockOverlay = document.createElement("div");
            lockOverlay.className = "uit-card-lock-overlay";
            lockOverlay.innerHTML = `<span class="uit-card-lock-icon">🔒</span><span class="uit-card-lock-text">Chưa mở</span>`;
            illus.appendChild(lockOverlay);
          }
        } else if (lockOverlay) {
          lockOverlay.remove();
        }
      }

      // Add tactile shake on clicking a locked card
      card.addEventListener("click", function () {
        if (!isUnlocked() && !isLive) {
          const form = sh.querySelector("#tsLock");
          if (form) {
            form.classList.remove("uit-shake");
            void form.offsetWidth;
            form.classList.add("uit-shake");
          }
        }
      });
    });
  }

  function bindSheetObservers(sh) {
    if (!sh || attachedSheet === sh) return;
    attachedSheet = sh;
    decorateSheet(sh);

    // Observe DOM replacements inside #topicSheet (draw() overwrites sh.innerHTML)
    const observer = new MutationObserver(function () {
      decorateSheet(sh);
    });
    observer.observe(sh, { childList: true, subtree: false });

    // Also observe hidden attribute toggle
    const attrObserver = new MutationObserver(function () {
      if (!sh.hidden) {
        decorateSheet(sh);
      }
    });
    attrObserver.observe(sh, { attributes: true, attributeFilter: ["hidden"] });
  }

  function init() {
    injectStyles();

    wasUnlocked = isUnlocked();
    const sh = document.getElementById("topicSheet");
    if (sh) {
      bindSheetObservers(sh);
    } else if (document.body && typeof MutationObserver === "function") {
      const bodyObs = new MutationObserver(function () {
        const found = document.getElementById("topicSheet");
        if (found) {
          bodyObs.disconnect();
          bindSheetObservers(found);
        }
      });
      bodyObs.observe(document.body, { childList: true });
    }

    // Attach to #btnTopic if available
    const b = document.getElementById("btnTopic");
    if (b && !b.dataset.uitHooked) {
      b.dataset.uitHooked = "1";
      b.addEventListener("click", function () {
        setTimeout(function () {
          const sheet = document.getElementById("topicSheet");
          if (sheet) {
            bindSheetObservers(sheet);
            decorateSheet(sheet);
          }
        }, 15);
      });
    }

    return {
      version: "1.1.0",
      decorate: function () {
        const s = document.getElementById("topicSheet");
        if (s) {
          bindSheetObservers(s);
          decorateSheet(s);
        }
      }
    };
  }

  // Export to window
  root.ELW_UI_TOPICS = {
    init: init,
    decorate: function () {
      const s = document.getElementById("topicSheet");
      if (s) {
        bindSheetObservers(s);
        decorateSheet(s);
      }
    },
    css: CSS_TEXT,
    version: "1.1.0"
  };

  // Auto-init if DOM is already loaded
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { init(); });
    } else {
      init();
    }
  }
})(typeof window !== "undefined" ? window : this);
