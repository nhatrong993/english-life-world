/* English Life World — ui-companion.js
   Visual companion module: Linh companion toggle switch (#btnFriend),
   topic sheet switch (.tsfriend), and compact responsive choice card (#ltCard).
   Exposes: window.ELW_UI_COMPANION
   Adheres to docs/COLLAB-PLAN.md & docs/ui-notes.md (P6 Companion UI).
   Pure visual/CSS enhancement: zero logic modification, no breaking DOM mutations.
*/
(function (root) {
  "use strict";

  const CSS_ID = "uic-companion-css";

  const CSS_TEXT = `
/* ==========================================================================
   ELW_UI_COMPANION (.uic-) Styles
   ========================================================================== */

/* 1. COMPANION BUTTON (#btnFriend) IN SCENE BAR — Hidden on both Mobile & Desktop (controlled via Context Bar) */
#btnFriend,
#btnFriend[hidden],
#btnFriend[aria-pressed="true"],
#btnFriend[aria-pressed="false"] {
  display: none !important;
}

/* Hide original child elements to let pseudo-elements render the switch */
#btnFriend > * {
  display: none !important;
}

/* Avatar circular icon with Linh photo */
#btnFriend::before {
  content: "" !important;
  width: 32px !important;
  min-width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: #e6f7f2 url("assets/people/linh-smiling.png") no-repeat center / cover !important;
  display: inline-block !important;
  flex-shrink: 0 !important;
  transition: all 0.22s ease !important;
  box-sizing: border-box !important;
}

/* ON STATE (aria-pressed="true"): Đi cùng bạn Linh */
#btnFriend[aria-pressed="true"] {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
  border: 1.5px solid #10b981 !important;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.22), 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  opacity: 1 !important;
}
#btnFriend[aria-pressed="true"]::before {
  border: 2px solid #10b981 !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25) !important;
  filter: none !important;
}
#btnFriend[aria-pressed="true"]::after {
  content: "Linh · ✓ Đi cùng" !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  color: #065f46 !important;
  margin-left: 7px !important;
  white-space: nowrap !important;
  letter-spacing: 0.1px !important;
}

/* OFF STATE (aria-pressed="false"): Đi một mình */
#btnFriend[aria-pressed="false"] {
  background: #f1f5f9 !important;
  border: 1.5px dashed #94a3b8 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  opacity: 0.9 !important;
}
#btnFriend[aria-pressed="false"]::before {
  border: 2px solid #cbd5e1 !important;
  filter: grayscale(85%) contrast(85%) !important;
  opacity: 0.75 !important;
  box-shadow: none !important;
}
#btnFriend[aria-pressed="false"]::after {
  content: "Linh · ✕ Một mình" !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #64748b !important;
  margin-left: 7px !important;
  white-space: nowrap !important;
  letter-spacing: 0.1px !important;
}

#btnFriend:hover {
  transform: translateY(-1px);
}
#btnFriend:active {
  transform: translateY(0);
}


/* 2. TOPIC SHEET COMPANION SWITCH (.tsfriend) */
.tsfriend {
  display: flex !important;
  align-items: center !important;
  position: relative !important;
  min-height: 52px !important;
  padding: 10px 14px !important;
  margin-top: 14px !important;
  background: #ffffff !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 16px !important;
  box-sizing: border-box !important;
  cursor: pointer !important;
  user-select: none !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03) !important;
  transition: all 0.2s ease !important;
  gap: 12px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
}

.tsfriend:hover {
  background: #fafaf9 !important;
  border-color: #cbd5e1 !important;
}

.tsfriend:has(#tsFriend:checked),
.tsfriend.uic-active {
  background: #f0fdf4 !important;
  border-color: #a7f3d0 !important;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.12) !important;
}

/* Avatar Linh in .tsfriend */
.tsfriend::before {
  content: "" !important;
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  background: #e6f7f2 url("assets/people/linh-smiling.png") no-repeat center / cover !important;
  border: 2px solid #3a9484 !important;
  box-shadow: 0 2px 6px rgba(58, 148, 132, 0.25) !important;
  flex-shrink: 0 !important;
  order: 1 !important;
}

/* Text label and sub */
.tsfriend small {
  display: block !important;
  font-size: 11.5px !important;
  font-weight: 400 !important;
  color: #64748b !important;
  margin-top: 2px !important;
  flex-basis: auto !important;
  padding-left: 0 !important;
}

/* Switch styling directly on input#tsFriend */
.tsfriend input[type="checkbox"]#tsFriend,
.tsfriend input[type="checkbox"] {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: 48px !important;
  min-width: 48px !important;
  height: 28px !important;
  border-radius: 14px !important;
  background: #cbd5e1 !important;
  position: relative !important;
  cursor: pointer !important;
  outline: none !important;
  transition: background-color 0.24s cubic-bezier(0.4, 0, 0.2, 1) !important;
  flex-shrink: 0 !important;
  margin: 0 0 0 auto !important;
  order: 3 !important;
  border: none !important;
}

/* Switch thumb */
.tsfriend input[type="checkbox"]#tsFriend::after,
.tsfriend input[type="checkbox"]::after {
  content: "✕" !important;
  position: absolute !important;
  top: 3px !important;
  left: 3px !important;
  width: 22px !important;
  height: 22px !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) !important;
  transition: transform 0.24s cubic-bezier(0.4, 0, 0.2, 1) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  color: #94a3b8 !important;
  line-height: 1 !important;
}

/* Switch Checked state */
.tsfriend input[type="checkbox"]#tsFriend:checked,
.tsfriend input[type="checkbox"]:checked {
  background: #10b981 !important;
}

.tsfriend input[type="checkbox"]#tsFriend:checked::after,
.tsfriend input[type="checkbox"]:checked::after {
  transform: translateX(20px) !important;
  content: "✓" !important;
  color: #10b981 !important;
}


/* 3. COMPACT CHOICE CARD (#ltCard & .lt-card) FOR 360-412px SCREENS */
#ltCard {
  position: relative !important;
  width: 100% !important;
  box-sizing: border-box !important;
  margin-top: 8px !important;
  z-index: 15 !important;
}

.lt-host:empty {
  display: none !important;
}

.lt-card {
  box-sizing: border-box !important;
  max-width: 100% !important;
  max-height: 300px !important;
  background: #ffffff !important;
  border: 1.5px solid #3a9484 !important;
  border-radius: 16px !important;
  padding: 8px 12px 10px !important;
  box-shadow: 0 6px 20px rgba(36, 69, 63, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04) !important;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  color: #1e293b !important;
  display: flex !important;
  flex-direction: column !important;
  overflow-y: auto !important;
  -webkit-overflow-scrolling: touch;
}

/* Header: compact 34px height */
.lt-head {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-bottom: 4px !important;
  flex-shrink: 0 !important;
}

.lt-head b {
  font-size: 14.5px !important;
  font-weight: 700 !important;
  color: #0f172a !important;
}

.lt-head small {
  font-size: 11px !important;
  color: #64748b !important;
  background: #f1f5f9 !important;
  padding: 2px 7px !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
}

/* Avatar in .lt-head */
.lt-av {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  border-radius: 50% !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 20px !important;
  overflow: hidden !important;
  border: 1.5px solid #3a9484 !important;
  background: #e6f7f2 !important;
  flex-shrink: 0 !important;
  box-sizing: border-box !important;
}

/* Real photo mapping for Linh & visitors */
.lt-card[aria-label="Linh"] .lt-av {
  background: #e6f7f2 url("assets/people/linh-smiling.png") no-repeat center / cover !important;
  font-size: 0 !important;
}
.lt-card[aria-label="Mrs. Park"] .lt-av {
  background: #fef3c7 url("assets/people/visitor-elderly-neighbor.png") no-repeat center / cover !important;
  font-size: 0 !important;
}
.lt-card[aria-label="Minh"] .lt-av {
  background: #e0f2fe url("assets/people/visitor-old-friend.png") no-repeat center / cover !important;
  font-size: 0 !important;
}
.lt-card[aria-label="Courier"] .lt-av {
  background: #ffedd5 url("assets/people/visitor-shipper.png") no-repeat center / cover !important;
  font-size: 0 !important;
}
.lt-card[aria-label="Tourist"] .lt-av {
  background: #fce7f3 url("assets/people/visitor-tourist.png") no-repeat center / cover !important;
  font-size: 0 !important;
}

/* Close button: 40px touch area, compact 32px visual */
.lt-x {
  margin-left: auto !important;
  min-width: 40px !important;
  min-height: 40px !important;
  width: 40px !important;
  height: 40px !important;
  border: 0 !important;
  background: #f1f5f9 !important;
  border-radius: 10px !important;
  font-size: 15px !important;
  color: #64748b !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background 0.15s ease, color 0.15s ease !important;
  flex-shrink: 0 !important;
}
.lt-x:hover {
  background: #e2e8f0 !important;
  color: #0f172a !important;
}

/* Question line & audio replay button */
.lt-q {
  font-size: 15px !important;
  font-weight: 700 !important;
  margin: 1px 0 !important;
  display: flex !important;
  gap: 6px !important;
  align-items: center !important;
  justify-content: space-between !important;
  color: #0f172a !important;
  line-height: 1.25 !important;
  flex-shrink: 0 !important;
}

.lt-say {
  border: 1px solid #bbf7d0 !important;
  background: #f0fdf4 !important;
  font-size: 15px !important;
  min-width: 36px !important;
  min-height: 36px !important;
  width: 36px !important;
  height: 36px !important;
  border-radius: 8px !important;
  cursor: pointer !important;
  margin-left: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  transition: all 0.15s ease !important;
}
.lt-say:active {
  background: #dcfce7 !important;
}

/* Vietnamese translation hint */
.lt-hint {
  font-size: 11.5px !important;
  color: #64748b !important;
  margin: 0 0 6px 0 !important;
  line-height: 1.2 !important;
  flex-shrink: 0 !important;
}

/* 3 Large options with >= 44px touch targets */
.lt-opts {
  display: grid !important;
  gap: 5px !important;
  margin: 0 !important;
  flex-shrink: 0 !important;
}

.lt-opt {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  justify-content: center !important;
  text-align: left !important;
  min-height: 44px !important;
  padding: 5px 11px !important;
  border: 1.5px solid #e2e8f0 !important;
  border-radius: 11px !important;
  background: #f8fafc !important;
  font: inherit !important;
  cursor: pointer !important;
  color: inherit !important;
  word-break: break-word !important;
  box-sizing: border-box !important;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.lt-opt span {
  font-size: 13.5px !important;
  font-weight: 600 !important;
  color: #0f172a !important;
  line-height: 1.2 !important;
}

.lt-opt small {
  font-size: 11px !important;
  color: #64748b !important;
  margin-top: 1px !important;
  line-height: 1.15 !important;
}

.lt-opt:hover {
  border-color: #cbd5e1 !important;
  background: #f1f5f9 !important;
}

.lt-opt:active {
  transform: scale(0.99);
}

.lt-opt.lt-good {
  border-color: #10b981 !important;
  background: #ecfdf5 !important;
  color: #065f46 !important;
}
.lt-opt.lt-good span {
  color: #047857 !important;
}

.lt-opt.lt-bad {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
  opacity: 0.85 !important;
}
.lt-opt.lt-bad span {
  color: #b91c1c !important;
}

/* Footer: feedback message & score on single compact row */
.lt-fb {
  min-height: 1.1em !important;
  margin: 4px 0 0 0 !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #047857 !important;
  line-height: 1.2 !important;
}

.lt-score {
  font-size: 11.5px !important;
  color: #64748b !important;
  text-align: right !important;
  white-space: nowrap !important;
  margin-top: 2px !important;
  font-weight: 500 !important;
}

/* Custom scrollbar for .lt-card if text overflows */
.lt-card::-webkit-scrollbar {
  width: 4px;
}
.lt-card::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}
`;

  /* Helper to inject CSS once */
  function injectCss() {
    if (document.getElementById(CSS_ID)) return;
    const style = document.createElement("style");
    style.id = CSS_ID;
    style.textContent = CSS_TEXT;
    document.head.appendChild(style);
  }

  function syncBtnFriend() {
    const btn = document.getElementById("btnFriend");
    if (!btn) return;
    btn.hidden = true;
    btn.style.display = "none";
    if (window.ELW_LIFE && typeof window.ELW_LIFE.companionOn === "function") {
      const isOn = !!window.ELW_LIFE.companionOn();
      btn.setAttribute("aria-pressed", isOn ? "true" : "false");
      btn.title = isOn
        ? "Linh đang đi cùng (bấm để đi một mình)"
        : "Đi một mình (bấm để rủ Linh đi cùng)";
    }
  }

  /* Public API */
  const api = {
    init: function () {
      injectCss();
      syncBtnFriend();
    },
    refresh: function () {
      syncBtnFriend();
    },
    syncButton: syncBtnFriend,
    css: CSS_TEXT
  };

  // Auto-init on script load
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", api.init);
    } else {
      api.init();
    }
  }

  root.ELW_UI_COMPANION = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : this);
