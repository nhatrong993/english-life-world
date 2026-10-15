/* English Life World — ui-mission.js
   Minimal mission card for absolute beginners.
   Contract B: window.ELW_UI_MISSION
   No build step, no frameworks, vanilla ES2017.
*/
(function (root) {
  "use strict";

  const CSS_TEXT = `
/* ELW_UI_MISSION Styles */
.uim-card {
  box-sizing: border-box;
  background: #fffdf9;
  border: 1.5px solid #e3d6c3;
  border-radius: 18px;
  padding: 14px 16px;
  box-shadow: 0 6px 24px rgba(90, 61, 31, 0.1);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #2d2a26;
  max-width: 100%;
  position: relative;
}

/* Header */
.uim-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #f0e6d8;
  padding-bottom: 10px;
}
.uim-title-wrap {
  flex: 1;
  min-width: 0;
}
.uim-title-1line {
  font-size: 16px;
  font-weight: 800;
  color: #1e1c1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}
.uim-title-en {
  font-size: 16px;
  font-weight: 800;
  color: #1e1c1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.uim-title-sep {
  color: #c4b5a3;
  font-weight: 400;
}
.uim-title-vi {
  font-size: 13px;
  color: #7a7166;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.uim-expanded-section {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0e6d8;
  animation: uimFadeIn 0.2s ease;
}

.uim-giver-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.uim-avatar {
  font-size: 20px;
  line-height: 1;
}
.uim-giver-name {
  font-weight: 700;
  color: #5a3d1f;
}
.uim-room-badge {
  font-size: 11.5px;
  background: #f3ebe0;
  color: #6b5847;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}
.uim-urgency-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.uim-urgency-high { background: #ffebeb; color: #c0392b; border: 1px solid #f5c2bc; }
.uim-urgency-medium { background: #fff8e6; color: #b87c12; border: 1px solid #fae1a6; }
.uim-urgency-low { background: #eaf8ee; color: #2d824c; border: 1px solid #bce6c8; }

.uim-desc-vi {
  font-size: 12.5px;
  color: #706659;
  line-height: 1.35;
  margin-top: 4px;
}

.uim-head-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}
.uim-btn-collapse, .uim-btn-close {
  min-height: 40px;
  border: 1px solid #e3d6c3;
  background: #ffffff;
  border-radius: 12px;
  padding: 0 10px;
  font-size: 12.5px;
  font-weight: 700;
  color: #5a3d1f;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  box-sizing: border-box;
}
.uim-btn-collapse:hover, .uim-btn-close:hover {
  background: #fbf5ee;
  border-color: #d8c3ac;
}
.uim-btn-close {
  min-width: 40px;
  font-size: 16px;
}
.uim-btn-collapse:focus-visible, .uim-btn-close:focus-visible {
  outline: 2px solid #e8743b;
  outline-offset: 2px;
}

/* Steps List */
.uim-steps {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.uim-step-row {
  border: 1.5px solid #eadecf;
  background: #ffffff;
  border-radius: 12px;
  padding: 9px 12px;
  transition: border-color 0.15s, background-color 0.15s;
  cursor: pointer;
}
.uim-step-row:hover {
  border-color: #d1bda6;
  background: #fffdfb;
}
.uim-step-row.uim-st-active {
  border-color: #e8743b;
  background: #fffaf5;
  box-shadow: 0 2px 8px rgba(232, 116, 59, 0.12);
}
.uim-step-row.uim-st-done {
  border-color: #c9e8d2;
  background: #f9fdfa;
}
.uim-step-row.uim-st-blocked {
  border-color: #f7d2cb;
  background: #fffbfb;
}
.uim-step-row.uim-st-locked {
  opacity: 0.68;
  background: #faf6f0;
}

.uim-step-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.uim-step-icon {
  font-size: 16px;
  line-height: 1;
}
.uim-step-titles {
  flex: 1;
  min-width: 0;
}
.uim-step-title-en {
  font-size: 14px;
  font-weight: 700;
  color: #2d2a26;
  line-height: 1.25;
}
.uim-step-title-vi {
  font-size: 12px;
  color: #7a7166;
  line-height: 1.2;
}

/* Status Chips: Multi-channel Icon + Text */
.uim-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-width: 1px;
  border-style: solid;
}
.uim-chip-done {
  background: #def4e5;
  color: #246d3e;
  border-color: #bce6c8;
}
.uim-chip-active {
  background: #ffe6d6;
  color: #b84c17;
  border-color: #ffd0b5;
}
.uim-chip-locked {
  background: #ede6dc;
  color: #756a5c;
  border-color: #ddd4c6;
}
.uim-chip-blocked {
  background: #fcdcd9;
  color: #96261a;
  border-color: #f8b8b3;
}

/* Say Sentence & Speak Button */
.uim-step-say {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f2e9;
  border-radius: 10px;
  padding: 6px 10px;
  margin-top: 4px;
}
.uim-say-texts {
  flex: 1;
  min-width: 0;
}
.uim-say-en {
  font-size: 13.5px;
  font-weight: 700;
  color: #1e1c1a;
  line-height: 1.3;
}
.uim-say-vi {
  font-size: 11.5px;
  color: #706659;
  line-height: 1.25;
}
.uim-btn-speak {
  min-height: 44px;
  min-width: 44px;
  border: 1px solid #decbb4;
  background: #ffffff;
  border-radius: 10px;
  color: #e8743b;
  font-size: 17px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.uim-btn-speak:hover {
  background: #ffe3d1;
  border-color: #e8743b;
}
.uim-btn-speak:focus-visible {
  outline: 2px solid #e8743b;
  outline-offset: 1px;
}

/* Compact Progress Indicators in Collapsed View */
.uim-collapsed-mini {
  display: flex;
  gap: 5px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.uim-mini-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: #f0e6d8;
  color: #5a4b3d;
}
.uim-mini-chip.uim-st-done { background: #def4e5; color: #246d3e; }
.uim-mini-chip.uim-st-active { background: #ffe6d6; color: #b84c17; border: 1px solid #e8743b; }
.uim-mini-chip.uim-st-blocked { background: #fcdcd9; color: #96261a; }

/* Hint Box */
.uim-hint-box {
  background: #fffdf2;
  border: 1.5px dotted #e0a03a;
  border-radius: 12px;
  padding: 9px 12px;
  margin-bottom: 12px;
  animation: uimFadeIn 0.2s ease;
}
.uim-hint-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #8c5d12;
  margin-bottom: 2px;
}
.uim-hint-en {
  font-size: 13.5px;
  font-weight: 700;
  color: #2d2a26;
  line-height: 1.3;
}
.uim-hint-vi {
  font-size: 12px;
  color: #7a7166;
  margin-top: 1px;
}

/* Actions Footer: Hint Toggle + Big Auto Button */
.uim-actions {
  display: flex;
  gap: 10px;
  align-items: stretch;
}
.uim-btn-hint {
  min-height: 46px;
  border: 1px solid #e3d6c3;
  background: #ffffff;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 700;
  color: #5a3d1f;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  transition: all 0.15s ease;
}
.uim-btn-hint:hover {
  background: #fffbf0;
  border-color: #e0a03a;
}
.uim-btn-hint.uim-hint-on {
  background: #fff8e6;
  border-color: #e0a03a;
  color: #8c5d12;
}
.uim-btn-hint:focus-visible {
  outline: 2px solid #e0a03a;
  outline-offset: 1px;
}

.uim-btn-auto {
  flex: 1;
  min-height: 46px;
  border: none;
  background: #e8743b;
  color: #ffffff;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 3px 8px rgba(232, 116, 59, 0.3);
  transition: all 0.15s ease;
}
.uim-btn-auto:hover:not(:disabled) {
  background: #d4632b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232, 116, 59, 0.4);
}
.uim-btn-auto:active:not(:disabled) {
  transform: translateY(0);
}
.uim-btn-auto:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  background: #a89a8c;
}
.uim-btn-auto:focus-visible {
  outline: 2px solid #2d2a26;
  outline-offset: 2px;
}

/* Complete Banner */
.uim-complete-banner {
  background: #f4fbf6;
  border: 2px solid #3a9d5d;
  border-radius: 14px;
  padding: 12px 14px;
  text-align: center;
  margin-bottom: 12px;
}
.uim-complete-title {
  font-size: 15px;
  font-weight: 800;
  color: #246d3e;
}
.uim-complete-subtitle {
  font-size: 12px;
  color: #557a60;
  margin-top: 2px;
}
.uim-result-box {
  background: #ffffff;
  border: 1px solid #c9e8d2;
  border-radius: 10px;
  padding: 8px 10px;
  margin-top: 8px;
}
.uim-result-en {
  font-size: 13.5px;
  font-weight: 700;
  color: #1e1c1a;
}
.uim-result-vi {
  font-size: 12px;
  color: #5a5349;
  margin-top: 2px;
}

/* Collapsed Height Constraints: Max ~340px */
.uim-card.uim-collapsed {
  max-height: 330px;
  overflow: hidden;
}

@keyframes uimFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Step chips container (hidden on desktop, active on mobile) */
.uim-step-chips {
  display: none;
}

@media (max-width: 760px) {
  .uim-card {
    padding: 8px 10px !important;
    border-radius: 14px !important;
    box-sizing: border-box !important;
    max-width: 100% !important;
  }

  /* Compact mode constraint: strictly max 260px total height */
  .uim-card:not(.uim-expanded) {
    max-height: 260px !important;
    overflow: hidden !important;
  }

  .uim-card.uim-expanded {
    max-height: 85vh !important;
    overflow-y: auto !important;
  }

  .uim-head {
    margin-bottom: 6px !important;
    padding-bottom: 6px !important;
    gap: 6px !important;
  }

  .uim-title-1line {
    font-size: 14.5px !important;
  }
  .uim-title-en {
    font-size: 14.5px !important;
  }
  .uim-title-vi {
    font-size: 12px !important;
  }

  /* On mobile: Giver & Description are hidden in compact mode, only shown in Expanded mode */
  .uim-card:not(.uim-expanded) .uim-expanded-section {
    display: none !important;
  }

  /* Compact one-line step chips row */
  .uim-step-chips {
    display: flex !important;
    gap: 6px;
    margin-bottom: 6px;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    padding: 1px 0 3px;
    scrollbar-width: none;
  }
  .uim-step-chips::-webkit-scrollbar {
    display: none;
  }
  .uim-chip-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    border: 1.5px solid #e2d4c2;
    background: #ffffff;
    color: #5a4b3d;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
    min-height: 40px !important;
    box-sizing: border-box !important;
    font-family: inherit;
    -webkit-tap-highlight-color: transparent;
  }
  .uim-chip-item:hover {
    border-color: #e8743b;
    background: #fffdf9;
  }
  .uim-chip-item.uim-st-active,
  .uim-chip-item.uim-chip-active {
    border-color: #e8743b;
    background: #ffe6d6;
    color: #b84c17;
    box-shadow: 0 1px 4px rgba(232, 116, 59, 0.2);
  }
  .uim-chip-item.uim-st-done {
    border-color: #bce6c8;
    background: #def4e5;
    color: #246d3e;
  }
  .uim-chip-item.uim-st-blocked {
    border-color: #f8b8b3;
    background: #fcdcd9;
    color: #96261a;
  }
  .uim-chip-item.uim-st-locked {
    background: #f0e6d8;
    color: #8c7c6d;
    opacity: 0.85;
  }

  /* In compact mode on mobile: show ONLY active step, and inside active step show ONLY EN sentence + 🔊 button */
  .uim-card:not(.uim-expanded) .uim-steps .uim-step-row:not(.uim-st-active) {
    display: none !important;
  }
  .uim-card:not(.uim-expanded) .uim-step-top {
    display: none !important;
  }
  .uim-card:not(.uim-expanded) .uim-say-vi {
    display: none !important;
  }
  .uim-card:not(.uim-expanded) .uim-step-say {
    margin-top: 0 !important;
    padding: 4px 8px !important;
  }
  .uim-card:not(.uim-expanded) .uim-step-row {
    padding: 4px 6px !important;
    margin-bottom: 0 !important;
  }
  .uim-card:not(.uim-expanded) .uim-steps {
    margin: 0 0 6px !important;
  }

  /* Compact hint box if shown */
  .uim-hint-box {
    padding: 4px 8px !important;
    margin-bottom: 6px !important;
    border-radius: 8px !important;
  }
  .uim-hint-label {
    font-size: 11px !important;
  }
  .uim-hint-en {
    font-size: 12px !important;
  }
  .uim-hint-vi {
    font-size: 11px !important;
  }

  /* Sticky "⚡ Làm ngay" + "💡 Gợi ý" row on mobile */
  .uim-actions {
    position: sticky !important;
    bottom: 0 !important;
    background: #fffdf9 !important;
    padding: 6px 0 0 !important;
    margin-top: 4px !important;
    border-top: 1px solid #f0e6d8 !important;
    z-index: 10 !important;
    gap: 8px !important;
  }
  .uim-btn-hint, .uim-btn-auto {
    min-height: 42px !important;
  }
  .uim-btn-speak {
    min-height: 40px !important;
    min-width: 40px !important;
  }
}
`;

  let styleInjected = false;
  function injectCssOnce() {
    if (styleInjected) return;
    if (typeof document !== "undefined") {
      let s = document.getElementById("uim-styles");
      if (!s) {
        s = document.createElement("style");
        s.id = "uim-styles";
        s.textContent = CSS_TEXT;
        document.head.appendChild(s);
      }
      styleInjected = true;
    }
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const ROOM_LABELS = {
    living: "Phòng khách · living",
    kitchen: "Phòng bếp · kitchen",
    bedroom: "Phòng ngủ · bedroom",
    bathroom: "Phòng tắm · bathroom",
    garage: "Nhà xe · garage",
    garden: "Sân vườn · garden"
  };

  const STATUS_META = {
    done: { icon: "✅", label: "Xong", chipClass: "uim-chip-done" },
    active: { icon: "▶", label: "Đang làm", chipClass: "uim-chip-active" },
    locked: { icon: "🔒", label: "Bị khóa", chipClass: "uim-chip-locked" },
    blocked: { icon: "⛔", label: "Chưa sẵn sàng", chipClass: "uim-chip-blocked" }
  };

  function render(container, view, cb = {}) {
    injectCssOnce();
    if (!container) return;
    if (!view) {
      container.innerHTML = "";
      return;
    }

    const isCollapsed = !!container._uimCollapsed;
    const isExpandedAll = !!container._uimExpandedAll;
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 760;
    const giver = view.giver || { name: "Gia đình", avatar: "👤" };
    const roomText = ROOM_LABELS[view.room] || view.room || "";
    const urgency = view.urgency === "high" || view.urgency === "low" ? view.urgency : "medium";
    const urgencyText = urgency === "high" ? "Khẩn cấp" : urgency === "medium" ? "Quan trọng" : "Thư thả";
    const urgencyIcon = urgency === "high" ? "🚨" : urgency === "medium" ? "⚡" : "ℹ️";

    let countdownHtml = "";
    if (typeof view.remainingSec === "number") {
      countdownHtml = `⏱️ ${view.remainingSec}s${typeof view.totalSec === "number" ? ` / ${view.totalSec}s` : ""}`;
    }

    const steps = Array.isArray(view.steps) ? view.steps : [];
    const activeStep = steps.find(s => s.status === "active") || steps[0] || null;

    let miniChipsHtml = "";
    if (isCollapsed) {
      miniChipsHtml = `
        <div class="uim-collapsed-mini" aria-label="Tiến độ các bước">
          ${steps.map(s => {
            const stMeta = STATUS_META[s.status] || STATUS_META.locked;
            return `<span class="uim-mini-chip uim-st-${escapeHtml(s.status)}">${stMeta.icon} B${s.n}: ${escapeHtml(stMeta.label)}</span>`;
          }).join("")}
        </div>
      `;
    }

    let stepChipsHtml = "";
    if (steps.length > 0) {
      stepChipsHtml = `
        <div class="uim-step-chips" role="tablist" aria-label="Tiến độ các bước">
          ${steps.map(s => {
            const stMeta = STATUS_META[s.status] || STATUS_META.locked;
            const isActive = s.status === "active";
            return `
              <button type="button"
                      class="uim-chip-item uim-st-${escapeHtml(s.status)} ${isActive ? "uim-chip-active" : ""}"
                      data-step-n="${s.n}"
                      role="tab"
                      aria-selected="${isActive ? "true" : "false"}"
                      aria-label="Bước ${s.n}: ${escapeHtml(s.title_vi || s.title_en || stMeta.label)}">
                <span aria-hidden="true">${s.icon || stMeta.icon}</span>
                <span>B${s.n}: ${escapeHtml(stMeta.label)}</span>
              </button>
            `;
          }).join("")}
        </div>
      `;
    }

    let stepsHtml = "";
    if (isCollapsed && activeStep) {
      // Show only active step in collapsed mode to strictly stay under 340px
      const stMeta = STATUS_META[activeStep.status] || STATUS_META.active;
      const statusLabel = activeStep.status === "blocked" && activeStep.reason_vi ? activeStep.reason_vi : stMeta.label;
      stepsHtml = `
        <div class="uim-step-row uim-st-${escapeHtml(activeStep.status)}" data-step-n="${activeStep.n}">
          <div class="uim-step-top">
            <span class="uim-step-icon">${escapeHtml(activeStep.icon || "📌")}</span>
            <div class="uim-step-titles">
              <div class="uim-step-title-en">Bước ${activeStep.n}: ${escapeHtml(activeStep.title_en || "")}</div>
              <div class="uim-step-title-vi">${escapeHtml(activeStep.title_vi || "")}</div>
            </div>
            <span class="uim-chip ${stMeta.chipClass}">${stMeta.icon} ${escapeHtml(statusLabel)}</span>
          </div>
          <div class="uim-step-say">
            <div class="uim-say-texts">
              <div class="uim-say-en">“${escapeHtml(activeStep.say_en || "")}”</div>
              <div class="uim-say-vi">${escapeHtml(activeStep.say_vi || "")}</div>
            </div>
            <button type="button" class="uim-btn-speak" data-say="${escapeHtml(activeStep.say_en || "")}" aria-label="Nghe câu phát âm tiếng Anh: ${escapeHtml(activeStep.say_en || "")}" title="Nghe phát âm">🔊</button>
          </div>
        </div>
      `;
    } else {
      stepsHtml = `
        <ul class="uim-steps" role="list">
          ${steps.map(s => {
            const stMeta = STATUS_META[s.status] || STATUS_META.locked;
            const statusLabel = s.status === "blocked" && s.reason_vi ? s.reason_vi : stMeta.label;
            return `
              <li class="uim-step-row uim-st-${escapeHtml(s.status)}" data-step-n="${s.n}" tabindex="0" role="button" aria-label="Bước ${s.n}: ${escapeHtml(s.title_vi || s.title_en)} - Trạng thái: ${escapeHtml(statusLabel)}">
                <div class="uim-step-top">
                  <span class="uim-step-icon">${escapeHtml(s.icon || "📌")}</span>
                  <div class="uim-step-titles">
                    <div class="uim-step-title-en">${escapeHtml(s.title_en || "")}</div>
                    <div class="uim-step-title-vi">${escapeHtml(s.title_vi || "")}</div>
                  </div>
                  <span class="uim-chip ${stMeta.chipClass}">${stMeta.icon} ${escapeHtml(statusLabel)}</span>
                </div>
                <div class="uim-step-say">
                  <div class="uim-say-texts">
                    <div class="uim-say-en">“${escapeHtml(s.say_en || "")}”</div>
                    <div class="uim-say-vi">${escapeHtml(s.say_vi || "")}</div>
                  </div>
                  <button type="button" class="uim-btn-speak" data-say="${escapeHtml(s.say_en || "")}" aria-label="Nghe câu phát âm tiếng Anh: ${escapeHtml(s.say_en || "")}" title="Nghe phát âm">🔊</button>
                </div>
              </li>
            `;
          }).join("")}
        </ul>
      `;
    }

    let hintHtml = "";
    if (view.hintsOn && view.hint) {
      hintHtml = `
        <div class="uim-hint-box" role="region" aria-label="Gợi ý">
          <div class="uim-hint-label">💡 Gợi ý thực hiện:</div>
          ${view.hint.en ? `<div class="uim-hint-en">${escapeHtml(view.hint.en)}</div>` : ""}
          ${view.hint.vi ? `<div class="uim-hint-vi">${escapeHtml(view.hint.vi)}</div>` : ""}
        </div>
      `;
    }

    let completeHtml = "";
    if (view.complete) {
      completeHtml = `
        <div class="uim-complete-banner" role="status">
          <div class="uim-complete-title">🎉 HOÀN THÀNH NHIỆM VỤ!</div>
          <div class="uim-complete-subtitle">Bạn đã hoàn thành xuất sắc!</div>
          ${
            view.result
              ? `
          <div class="uim-result-box">
            ${view.result.en ? `<div class="uim-result-en">${escapeHtml(view.result.en)}</div>` : ""}
            ${view.result.vi ? `<div class="uim-result-vi">${escapeHtml(view.result.vi)}</div>` : ""}
          </div>`
              : ""
          }
        </div>
      `;
    }

    const autoDisabled = view.running || !view.canAuto || view.complete;
    if (container._uimExpanded === undefined) {
      container._uimExpanded = !isMobile;
    }
    const isExpanded = !!container._uimExpanded;

    container.innerHTML = `
      <section class="uim-card ${isExpanded ? "uim-expanded" : ""}" aria-label="Nhiệm vụ: ${escapeHtml(view.title_vi || view.title_en || "")}">
        <header class="uim-head">
          <div class="uim-title-wrap">
            <div class="uim-title-1line">
              <span class="uim-title-icon" aria-hidden="true">🎯</span>
              <span class="uim-title-en">${escapeHtml(view.title_en || "")}</span>
              ${view.title_vi ? `<span class="uim-title-sep">·</span><span class="uim-title-vi">${escapeHtml(view.title_vi)}</span>` : ""}
            </div>
          </div>
          <div class="uim-head-actions">
            <button type="button" class="uim-btn-collapse" aria-expanded="${isExpanded ? "true" : "false"}" aria-label="${isExpanded ? "Thu gọn thẻ" : "Mở rộng thẻ"}">
              ${isExpanded ? "▼ Thu gọn" : "▲ Mở rộng"}
            </button>
            ${typeof cb.onClose === "function" ? `<button type="button" class="uim-btn-close" aria-label="Đóng nhiệm vụ" title="Đóng">×</button>` : ""}
          </div>
        </header>

        <div class="uim-expanded-section">
          <div class="uim-giver-row">
            <span class="uim-avatar" aria-hidden="true">${escapeHtml(giver.avatar || "👤")}</span>
            <span class="uim-giver-name">${escapeHtml(giver.name || "Gia đình")}</span>
            ${roomText ? `<span class="uim-room-badge">📍 ${escapeHtml(roomText)}</span>` : ""}
            <span class="uim-urgency-badge uim-urgency-${urgency}">
              ${urgencyIcon} ${escapeHtml(urgencyText)} ${countdownHtml ? `· ${escapeHtml(countdownHtml)}` : ""}
            </span>
          </div>
          ${view.desc_vi ? `<div class="uim-desc-vi">${escapeHtml(view.desc_vi)}</div>` : ""}
        </div>

        ${completeHtml}
        ${miniChipsHtml}
        ${stepChipsHtml}
        ${stepsHtml}
        ${hintHtml}

        <footer class="uim-actions">
          <button type="button" class="uim-btn-hint ${view.hintsOn ? "uim-hint-on" : ""}" aria-pressed="${view.hintsOn ? "true" : "false"}" aria-label="Bật tắt gợi ý">
            💡 Gợi ý ${view.hintsOn ? "▲" : "▼"}
          </button>
          <button type="button" class="uim-btn-auto" ${autoDisabled ? "disabled" : ""} aria-label="Làm ngay nhiệm vụ này">
            <span aria-hidden="true">${view.running ? "⏳" : "⚡"}</span>
            <span>${view.running ? "Đang thực hiện..." : "Làm ngay"}</span>
          </button>
        </footer>
      </section>
    `;

    // Event Bindings
    const collapseBtn = container.querySelector(".uim-btn-collapse");
    if (collapseBtn) {
      collapseBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        container._uimExpanded = !container._uimExpanded;
        render(container, view, cb);
      });
    }

    const closeBtn = container.querySelector(".uim-btn-close");
    if (closeBtn && typeof cb.onClose === "function") {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        cb.onClose();
      });
    }

    const hintBtn = container.querySelector(".uim-btn-hint");
    if (hintBtn && typeof cb.onHintToggle === "function") {
      hintBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        cb.onHintToggle(!view.hintsOn);
      });
    }

    const autoBtn = container.querySelector(".uim-btn-auto");
    if (autoBtn && typeof cb.onAuto === "function") {
      autoBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        cb.onAuto();
      });
    }

    container.querySelectorAll(".uim-btn-speak").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const text = btn.getAttribute("data-say") || "";
        if (typeof cb.onSpeak === "function") {
          cb.onSpeak(text);
        }
      });
    });

    container.querySelectorAll(".uim-chip-item").forEach(function (chip) {
      chip.addEventListener("click", function (e) {
        e.stopPropagation();
        const nStr = chip.getAttribute("data-step-n");
        const n = parseInt(nStr, 10);
        if (!isNaN(n) && typeof cb.onStep === "function") {
          cb.onStep(n);
        }
      });
    });

    container.querySelectorAll(".uim-step-row").forEach(function (row) {
      row.addEventListener("click", function (e) {
        const nStr = row.getAttribute("data-step-n");
        const n = parseInt(nStr, 10);
        if (!isNaN(n) && typeof cb.onStep === "function") {
          cb.onStep(n);
        }
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          row.click();
        }
      });
    });
  }

  const API = {
    render,
    css: CSS_TEXT
  };

  root.ELW_UI_MISSION = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
