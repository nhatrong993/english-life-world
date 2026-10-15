/* English Life World — ui-mobile.js
   Mobile layout module: sticky 2.5D scene across all 3 tabs, bottom tab bar,
   landscape/short-screen scene collapse toggle, compact phone typography,
   and Cô Mai guide bar repositioning.
   Exposes: window.ELW_UI_MOBILE
   No build step, no external dependencies, vanilla ES2017.
*/
(function (root) {
  "use strict";

  const STORAGE_KEY = "elw_tab";
  const SCENE_COLLAPSED_KEY = "elw_scene_collapsed";
  const BREAKPOINT_PX = 820;
  const SHORT_HEIGHT_PX = 560;

  const DEFAULT_TABS = [
    { id: "play", slug: "choi", icon: "🎮", label: "Chơi", cards: ["ctxTalkCard", "quickCard", "evTray", "peopleCard", "needsCard", "rpCard"] },
    { id: "learn", slug: "hoc", icon: "📖", label: "Học", cards: ["seqCard", "storyCard", "vocab3000Card", "invWrap", "mistakeCard", "speakingCard"] },
    { id: "mission", slug: "nhiemvu", icon: "🎯", label: "Nhiệm vụ", cards: ["missionCard", "chCard", "petSurvivalCard", "dayHud"] }
  ];

  const CSS_TEXT = `
/* ELW_UI_MOBILE (.uimb-) Styles */
:root {
  --uimb-header-h: 30px;
  --uimb-bar-h: 54px;
  --uimb-guide-h: 50px;
  --uimb-guide-offset: calc(var(--uimb-bar-h) + env(safe-area-inset-bottom, 0px) + 6px);
}

/* Prevent horizontal scrollbar while keeping root viewport as sticky scroll container */
html, body {
  overflow-x: clip !important;
  max-width: 100vw;
}

/* Hide #btnFriend on both desktop and mobile (controlled via Context Bar) */
#btnFriend, #btnFriend[hidden] {
  display: none !important;
}

/* Ensure #dayHud fits cleanly when placed inside .side */
.side > #dayHud {
  padding: 0 !important;
  margin: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
}

/* Tab bar and scene collapse button are hidden on desktop (> 820px and height >= 560px) */
.uimb-bar,
.uimb-scene-toggle {
  display: none !important;
}

@media (min-width: 821px) and (min-height: 560px) {
  header {
    position: sticky;
    top: 0;
    z-index: 65;
    background: var(--bg, #f6efe4);
  }
  .leftcol {
    position: sticky !important;
    top: 48px !important;
    align-self: start !important;
  }
  .side {
    min-height: calc(100vh + 820px);
  }
}

@media (max-width: 820px), (max-height: 559px) and (max-width: 960px) {
  body {
    font-size: 15px;
    padding-bottom: calc(var(--uimb-bar-h) + var(--uimb-guide-h) + env(safe-area-inset-bottom, 0px) + 20px) !important;
  }

  /* Compact 1-line sticky header so header + scene stay locked without any vertical shift on scroll */
  header {
    position: sticky !important;
    top: 0px !important;
    z-index: 65 !important;
    background: var(--bg, #f6efe4) !important;
    padding: 3px 8px !important;
    gap: 4px !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    max-width: 100vw !important;
    overflow: hidden !important;
    height: var(--uimb-header-h) !important;
    min-height: var(--uimb-header-h) !important;
    max-height: var(--uimb-header-h) !important;
    box-sizing: border-box !important;
  }
  header .bar {
    gap: 4px !important;
    flex-wrap: nowrap !important;
  }
  header h1 {
    font-size: 13px !important;
    line-height: 1.1 !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
  }
  header .hud,
  .hud {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    gap: 3px !important;
    overflow-x: auto !important;
    scrollbar-width: none !important;
    max-width: 100% !important;
    justify-content: flex-end !important;
    width: auto !important;
  }
  header .hud::-webkit-scrollbar,
  .hud::-webkit-scrollbar {
    display: none !important;
  }
  /* QA 2026-10-15: thanh tab Chơi/Học/Nhiệm vụ (sticky, z-index 30) bị header sticky
     (z-index 65) đè lên khi cuộn → combobox ngôn ngữ chặn mất click vào tab.
     Cho tab dính NGAY DƯỚI header thay vì chui xuống dưới nó. */
  #w3dModeTabs.w3d-mode-tabs {
    top: calc(var(--uimb-header-h, 30px) + 4px) !important;
    z-index: 64 !important;
  }
  header .stat, header .iconbtn, header #petMiniHud, header #btnProBadge {
    min-height: 22px !important;
    height: 22px !important;
    padding: 1px 5px !important;
    font-size: 10.5px !important;
    line-height: 1 !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
  }

  main {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    padding: 0 6px 14px !important;
    max-width: 100vw !important;
    overflow: visible !important;
    overflow-x: clip !important;
    box-sizing: border-box !important;
  }

  /* Unwrap .leftcol on mobile so section.scene sticks relative to <main> across all 3 tabs */
  html body main .leftcol,
  html body .leftcol,
  html body .leftcol.uimb-tab-hidden,
  html body .leftcol.w3d-tab-hidden {
    display: contents !important;
  }

  .side {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    width: 100% !important;
    min-width: 0 !important;
    order: 0 !important;
    min-height: calc(65vh + 820px) !important;
  }

  /* #panel sits directly below sticky scene in Play tab, hidden in Learn/Mission tabs */
  html body main #panel,
  html body .leftcol > #panel,
  html body #panel {
    order: -5 !important;
    margin-top: 2px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  html body[data-uimb-tab="learn"] #panel,
  html body[data-uimb-tab="mission"] #panel,
  html body[data-uimb-tab="learn"] .guide,
  html body[data-uimb-tab="mission"] .guide {
    display: none !important;
  }

  /* Compact card padding */
  .card2, .panel, .uim-card, .scene-card {
    padding: 10px 12px !important;
    border-radius: 14px !important;
    box-sizing: border-box !important;
  }

  /* Mission container card cleanly wraps .uim-card without double padding */
  #missionCard {
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
  }
  #missionCard:not(:has(.uim-card)) {
    padding: 8px 10px !important;
    background: var(--card, #fffdf9) !important;
    box-shadow: var(--shadow) !important;
    border-radius: 14px !important;
  }

  /* Touch-friendly interactive targets */
  button, .btn, .iconbtn, .act, select.iconbtn {
    min-height: 34px;
    box-sizing: border-box;
  }

  /* Sticky 2.5D Scene across ALL 3 tabs (~38-42vh on portrait, 1000x640 aspect ratio) */
  html body main .leftcol section.scene,
  html body main section.scene,
  html body .leftcol section.scene,
  html body section.scene,
  html body section.scene.uimb-tab-hidden,
  html body section.scene.w3d-tab-hidden,
  html body .leftcol section.scene.uimb-tab-hidden {
    display: block !important;
    position: sticky !important;
    top: var(--uimb-header-h, 30px) !important;
    z-index: 60 !important;
    order: -10 !important;
    max-height: none !important;
    overflow: visible !important;
    background: var(--card, #fffdf9) !important;
    padding: 3px 5px 5px !important;
    border-radius: 0 0 14px 14px !important;
    box-shadow: 0 6px 18px rgba(45, 42, 38, 0.14) !important;
    border: 1.5px solid #cbd5e1 !important;
    border-top: none !important;
    margin: 0 0 2px 0 !important;
    width: 100% !important;
    align-self: stretch !important;
    box-sizing: border-box !important;
  }

  /* Remove 3D tilt & thick bottom slab shadow on mobile so 1000x640 aspect ratio is never distorted */
  html body.w3d-iso .w3d-stage-wrap,
  html body .w3d-stage-wrap {
    transform: none !important;
    box-shadow: none !important;
  }

  html body main section.scene #room,
  html body .leftcol section.scene #room,
  html body #room {
    --uimb-room-max-h: clamp(204px, 28.5vh, 268px);
    width: min(100%, calc(var(--uimb-room-max-h) * 1.5625)) !important;
    height: auto !important;
    max-height: var(--uimb-room-max-h) !important;
    aspect-ratio: 1000 / 640 !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    display: block !important;
    overflow: visible !important;
    border-radius: 10px !important;
  }

  /* Compact Scene Bar: Row 1 (Topic + Tools/Collapse), Row 2 (1-line horizontal scroll #roomTabs) */
  html body .scene-bar {
    margin: 0 0 2px 0 !important;
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 3px !important;
    font-size: 11.5px !important;
  }

  .topicbtn {
    border: 0;
    background: #e8743b;
    color: #fff;
    font-weight: 700;
    border-radius: 999px;
    padding: 2px 8px !important;
    font-size: 11.5px !important;
    white-space: nowrap;
    min-height: 26px !important;
    height: 26px !important;
    max-width: 135px !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    cursor: pointer;
    flex: 0 1 auto !important;
    display: inline-flex !important;
    align-items: center !important;
    order: 1 !important;
    box-sizing: border-box;
  }

  .stools {
    display: flex !important;
    align-items: center !important;
    gap: 3px !important;
    flex: 0 0 auto !important;
    margin-left: auto !important;
    order: 2 !important;
  }

  .stools .iconbtn,
  .stools .w3d-cam-btn,
  #btn3DCam,
  .uimb-scene-toggle {
    min-width: 26px !important;
    min-height: 26px !important;
    height: 26px !important;
    padding: 1px 5px !important;
    font-size: 10.5px !important;
    border-radius: 7px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
  }

  .uimb-scene-toggle {
    background: #fff7ed !important;
    border: 1px solid #fdba74 !important;
    color: #9a3412 !important;
    font-weight: 700 !important;
    cursor: pointer !important;
  }

  /* Zone/Room tabs: 1-line horizontal scroll */
  html body #roomTabs,
  html body #roomTabs[data-topic-mode="home"],
  html body #roomTabs[data-topic-mode="outdoor"] {
    order: 3 !important;
    flex: 0 0 100% !important;
    width: 100% !important;
    max-width: 100% !important;
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    gap: 4px !important;
    margin-top: 1px !important;
    padding-bottom: 1px !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch;
  }
  html body #roomTabs::-webkit-scrollbar {
    display: none !important;
  }

  html body #roomTabs button,
  html body #roomTabs[data-topic-mode="home"] button,
  html body #roomTabs[data-topic-mode="outdoor"] button {
    flex: 0 0 auto !important;
    width: auto !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 3px !important;
    padding: 2px 7px !important;
    font-size: 11px !important;
    min-height: 24px !important;
    height: 24px !important;
    border-radius: 999px !important;
    white-space: nowrap !important;
    box-sizing: border-box !important;
  }

  html body #roomTabs button .rn {
    font-size: 11px !important;
    line-height: 1.1 !important;
    max-width: none !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }

  /* Compact Context Bar inside sticky scene */
  html body .ctx-bar {
    padding: 1px 6px !important;
    margin-bottom: 2px !important;
    border-radius: 8px !important;
  }
  html body .ctx-bar.is-collapsed {
    min-height: 22px !important;
    max-height: 24px !important;
    padding: 1px 6px !important;
  }
  html body .ctx-summary-btn {
    min-height: 20px !important;
    max-height: 22px !important;
    font-size: 10.5px !important;
    padding: 0 !important;
  }
  html body .ctx-bar:not(.is-collapsed) .ctx-groups {
    max-height: 100px !important;
    overflow-y: auto !important;
  }

  html body #ltCard:not(:empty) {
    max-height: 80px !important;
    overflow-y: auto !important;
    margin-top: 2px !important;
  }

  /* Collapsed scene state (toggled by ▲ Thu gọn cảnh / ▼ Hiện cảnh) */
  html body section.scene.uimb-scene-collapsed .w3d-stage-wrap,
  html body section.scene.uimb-scene-collapsed #room,
  html body section.scene.uimb-scene-collapsed #ctxBar,
  html body section.scene.uimb-scene-collapsed #ltCard {
    display: none !important;
  }
  html body section.scene.uimb-scene-collapsed {
    padding: 3px 6px !important;
  }

  /* Mission chips horizontal row */
  .mchips {
    display: flex !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding: 2px 2px 8px !important;
    scroll-snap-type: x mandatory !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch;
  }
  .mchips::-webkit-scrollbar {
    display: none;
  }
  .mchip {
    flex: 0 0 132px !important;
    scroll-snap-align: start !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 2px !important;
    text-align: left !important;
    border: 1.5px solid #f0c9ad !important;
    background: #fff7f0 !important;
    border-radius: 14px !important;
    padding: 8px 10px !important;
    cursor: pointer !important;
    font: inherit !important;
    color: #5a3d1f !important;
    min-height: 44px !important;
    box-sizing: border-box !important;
  }
  .mchip b { font-size: 20px; line-height: 1; }
  .mchip span { font-weight: 700; font-size: 13px; line-height: 1.2; }
  .mchip small { font-size: 11px; opacity: .75; line-height: 1.2; }
  .mchip:active { background: #ffe7d6 !important; }
  .mhead { margin: 0 0 6px !important; font-size: 16px !important; }

  /* Hide desktop 3-mode tab bar inside .side on mobile (bottom tab bar is used instead) */
  #w3dModeTabs,
  .w3d-mode-tabs {
    display: none !important;
  }

  /* Mobile cards hiding: only active tab's cards show */
  .side > .uimb-tab-hidden,
  .side > .w3d-tab-hidden,
  #panel.uimb-tab-hidden,
  .guide.uimb-tab-hidden {
    display: none !important;
  }

  /* Cô Mai guide bar: 1 line, max-height 56px, avatar 32px, text truncated with ... */
  .guide {
    position: fixed !important;
    left: 0 !important;
    right: 0 !important;
    bottom: var(--uimb-guide-offset) !important;
    margin: 0 auto !important;
    padding: 0 10px !important;
    max-width: 100vw !important;
    z-index: 85 !important;
    box-sizing: border-box !important;
    pointer-events: none;
  }

  .guide button {
    pointer-events: auto;
    width: 100% !important;
    min-height: 44px !important;
    height: 50px !important;
    max-height: 54px !important;
    padding: 4px 10px !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 8px !important;
    border-radius: 16px !important;
    box-shadow: 0 4px 16px rgba(45, 42, 38, 0.18) !important;
    background: rgba(255, 255, 255, 0.96) !important;
    backdrop-filter: blur(8px);
    overflow: hidden !important;
    white-space: nowrap !important;
    box-sizing: border-box !important;
    text-align: left;
    cursor: pointer;
  }

  .guide .face {
    font-size: 22px !important;
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    line-height: 1 !important;
    flex: 0 0 32px !important;
  }

  .guide button > span[style*="flex:1"],
  .guide button > span:nth-child(2) {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 6px !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
    overflow: hidden !important;
    white-space: nowrap !important;
  }

  .guide b {
    display: inline !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    color: var(--ink, #2d2a26) !important;
    flex: 0 0 auto !important;
    white-space: nowrap !important;
  }
  .guide b::after {
    content: ":";
    margin-right: 2px;
  }

  .guide #guideText {
    display: inline-block !important;
    font-size: 12.5px !important;
    color: var(--muted, #7a7166) !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }

  .guide button > span:last-child {
    font-size: 18px !important;
    color: var(--accent, #e8743b) !important;
    flex: 0 0 auto !important;
    line-height: 1 !important;
    margin-left: 2px;
  }

  .guide.uimb-guide-expanded button {
    max-height: none !important;
    height: auto !important;
    white-space: normal !important;
    padding: 8px 12px !important;
  }
  .guide.uimb-guide-expanded button > span[style*="flex:1"],
  .guide.uimb-guide-expanded button > span:nth-child(2) {
    white-space: normal !important;
    flex-wrap: wrap !important;
  }
  .guide.uimb-guide-expanded #guideText {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
  }

  /* Fixed Bottom Tab Bar */
  .uimb-bar {
    display: flex !important;
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 90 !important;
    height: calc(var(--uimb-bar-h) + env(safe-area-inset-bottom, 0px)) !important;
    padding: 0 6px env(safe-area-inset-bottom, 0px) !important;
    background: #ffffff !important;
    border-top: 1.5px solid var(--line, #e3d6c3) !important;
    box-shadow: 0 -3px 16px rgba(90, 61, 31, 0.1) !important;
    box-sizing: border-box !important;
    align-items: stretch;
    justify-content: space-around;
  }

  .uimb-tab-btn {
    flex: 1;
    min-height: 46px;
    height: 100%;
    border: none;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    cursor: pointer;
    color: var(--muted, #7a7166);
    position: relative;
    padding: 4px 2px;
    font-family: inherit;
    border-radius: 12px;
    transition: color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
  }

  .uimb-tab-btn:hover {
    color: var(--ink, #2d2a26);
  }

  .uimb-tab-btn[aria-selected="true"],
  .uimb-tab-btn.uimb-tab-active {
    color: var(--accent, #e8743b) !important;
    background: rgba(232, 116, 59, 0.12) !important;
  }

  .uimb-tab-btn[aria-selected="true"]::before,
  .uimb-tab-btn.uimb-tab-active::before {
    content: "";
    position: absolute;
    top: 0;
    left: 22%;
    right: 22%;
    height: 3px;
    border-radius: 0 0 4px 4px;
    background: var(--accent, #e8743b);
  }

  .uimb-tab-btn[aria-selected="true"] .uimb-tab-icon,
  .uimb-tab-btn.uimb-tab-active .uimb-tab-icon {
    transform: scale(1.12);
  }

  .uimb-tab-btn[aria-selected="true"] .uimb-tab-label,
  .uimb-tab-btn.uimb-tab-active .uimb-tab-label {
    font-weight: 800;
  }

  .uimb-tab-icon {
    font-size: 19px;
    line-height: 1;
    display: block;
    transition: transform 0.15s ease;
  }

  .uimb-tab-label {
    font-size: 11.5px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: 0.2px;
    display: block;
  }

  .uimb-badge {
    position: absolute;
    top: 3px;
    right: calc(50% - 18px);
    background: var(--accent, #e8743b);
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    min-width: 17px;
    height: 17px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    line-height: 1;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    border: 1.5px solid #ffffff;
    pointer-events: none;
    box-sizing: border-box;
  }

  .uimb-badge[hidden] {
    display: none !important;
  }
}

/* Landscape / Short screen (< 560px height): ~45vh compact sticky scene + single-row scene-bar */
@media (max-height: 559px) and (max-width: 960px) {
  :root {
    --uimb-header-h: 26px;
    --uimb-bar-h: 44px;
    --uimb-guide-h: 40px;
  }
  html body .scene-bar {
    flex-wrap: nowrap !important;
    gap: 4px !important;
    margin: 0 0 2px 0 !important;
  }
  html body #roomTabs,
  html body #roomTabs[data-topic-mode="home"],
  html body #roomTabs[data-topic-mode="outdoor"] {
    order: 2 !important;
    flex: 1 1 auto !important;
    width: auto !important;
    min-width: 0 !important;
    margin-top: 0 !important;
  }
  .stools {
    order: 3 !important;
  }
  html body .ctx-bar.is-collapsed {
    display: none !important;
  }
  html body main .leftcol section.scene,
  html body main section.scene,
  html body .leftcol section.scene,
  html body section.scene {
    padding: 3px 6px 4px !important;
  }
  html body main section.scene #room,
  html body .leftcol section.scene #room,
  html body #room {
    --uimb-room-max-h: 35vh;
    width: min(100%, calc(35vh * 1.5625)) !important;
    max-height: 35vh !important;
  }
}

/* High-specificity tab hiding overrides for cards (NEVER hide .leftcol or section.scene) */
html body #panel.uimb-tab-hidden,
html body .guide.uimb-tab-hidden,
html body .side > .uimb-tab-hidden,
html body .side > .w3d-tab-hidden {
  display: none !important;
}

/* Reduced motion accessibility */
@media (prefers-reduced-motion: reduce) {
  .uimb-tab-btn, .uimb-tab-icon, .uimb-badge {
    transition: none !important;
    animation: none !important;
    transform: none !important;
  }
}
`;

  let styleInjected = false;
  function injectCssOnce() {
    if (typeof document !== "undefined" && document.head) {
      let s = document.getElementById("uimb-styles");
      if (!s) {
        s = document.createElement("style");
        s.id = "uimb-styles";
        s.textContent = CSS_TEXT;
        document.head.appendChild(s);
      } else {
        if (s.textContent !== CSS_TEXT) s.textContent = CSS_TEXT;
        if (document.head.lastElementChild !== s) {
          document.head.appendChild(s);
        }
      }
      styleInjected = true;
    }
  }

  let initialized = false;
  let activeTabId = "play";
  let sceneCollapsed = false;
  let currentTabs = DEFAULT_TABS;
  let barEl = null;
  let resizeListenerAttached = false;
  let delegationAttached = false;
  let w3dHooked = false;
  let syncingTab = false;
  const badgeMap = new Map();

  function normalizeTabId(tabId) {
    if (tabId === "choi" || tabId === "more") return "play";
    if (tabId === "hoc") return "learn";
    if (tabId === "nhiemvu" || tabId === "home") return "mission";
    if (tabId === "play" || tabId === "learn" || tabId === "mission") return tabId;
    return null;
  }

  function isMobileViewport() {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= BREAKPOINT_PX || (window.innerHeight < SHORT_HEIGHT_PX && window.innerWidth <= 960);
  }

  function readStoredTab() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const norm = normalizeTabId(raw);
        if (norm) return norm;
        const w3dRaw = window.localStorage.getItem("elw_w3d_v1");
        if (w3dRaw) {
          const parsed = JSON.parse(w3dRaw);
          const normW3d = normalizeTabId(parsed && parsed.tab);
          if (normW3d) return normW3d;
        }
      }
    } catch (e) {}
    return null;
  }

  function writeStoredTab(tabId) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, tabId);
        let w3d = { tab: tabId };
        try {
          const prev = JSON.parse(window.localStorage.getItem("elw_w3d_v1") || "{}");
          if (prev && typeof prev === "object") w3d = Object.assign(prev, { tab: tabId });
        } catch (e) {}
        window.localStorage.setItem("elw_w3d_v1", JSON.stringify(w3d));
      }
    } catch (e) {}
  }

  function readSceneCollapsed() {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(SCENE_COLLAPSED_KEY) === "1";
      }
    } catch (e) {}
    return false;
  }

  function writeSceneCollapsed(collapsed) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(SCENE_COLLAPSED_KEY, collapsed ? "1" : "0");
      }
    } catch (e) {}
  }

  function getAllRegisteredCards() {
    const set = new Set();
    currentTabs.forEach(t => {
      if (Array.isArray(t.cards)) {
        t.cards.forEach(c => set.add(c));
      }
    });
    return Array.from(set);
  }

  function isHomeTopic() {
    try {
      if (root.ELW && typeof root.ELW.state === "function") {
        const w = root.ELW.state();
        if (w && w.room) {
          const r = w.room;
          if (["living", "kitchen", "bedroom", "bathroom", "garage", "garden"].indexOf(r) >= 0) return true;
          return false;
        }
      }
    } catch (e) {}
    return true;
  }

  function ensureSceneCollapseBtn() {
    if (typeof document === "undefined") return;
    const sceneEl = document.querySelector("section.scene");
    const sceneBar = sceneEl && sceneEl.querySelector(".scene-bar");
    if (!sceneEl || !sceneBar) return;

    const stools = sceneBar.querySelector(".stools");

    // Keep #btn3DCam inside .stools so .scene-bar Row 1 stays a single compact line
    const btn3d = document.getElementById("btn3DCam");
    if (btn3d && stools && btn3d.parentNode !== stools) {
      stools.insertBefore(btn3d, stools.firstChild);
    }

    let btn = document.getElementById("uimbSceneToggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "uimbSceneToggle";
      btn.className = "iconbtn uimb-scene-toggle";
      if (stools) {
        stools.insertBefore(btn, stools.firstChild);
      } else {
        sceneBar.appendChild(btn);
      }
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSceneCollapse();
      });
    }
    syncSceneCollapseState();
  }

  function syncSceneCollapseState() {
    if (typeof document === "undefined") return;
    const sceneEl = document.querySelector("section.scene");
    const btn = document.getElementById("uimbSceneToggle");
    const isMob = isMobileViewport();
    const collapsed = isMob && sceneCollapsed;
    if (sceneEl) {
      sceneEl.classList.toggle("uimb-scene-collapsed", collapsed);
    }
    if (document.body) {
      document.body.classList.toggle("uimb-scene-collapsed", collapsed);
    }
    if (btn) {
      btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      btn.textContent = collapsed ? "▼ Hiện cảnh" : "▲ Thu gọn cảnh";
      btn.title = collapsed ? "Hiện lại cảnh 2.5D" : "Thu gọn cảnh 2.5D";
    }
  }

  function toggleSceneCollapse(force) {
    sceneCollapsed = typeof force === "boolean" ? force : !sceneCollapsed;
    writeSceneCollapsed(sceneCollapsed);
    syncSceneCollapseState();
    return sceneCollapsed;
  }

  function ensureCardOrderAndLabels() {
    if (typeof document === "undefined") return;
    const leftcol = document.querySelector(".leftcol");
    const sceneEl = document.querySelector(".leftcol .scene") || document.querySelector("section.scene");
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

    // Ensure #btnFriend is always hidden on both mobile and desktop
    const btnFriend = document.getElementById("btnFriend");
    if (btnFriend) {
      btnFriend.hidden = true;
      btnFriend.style.display = "none";
    }

    // Ensure #speakingCard has "(sắp có)" note and sits at the very end of Học tab
    const speakingCard = document.getElementById("speakingCard");
    if (speakingCard) {
      const h2 = speakingCard.querySelector("h2");
      if (h2 && h2.textContent.indexOf("sắp có") < 0) {
        h2.innerHTML = '🎙️ Luyện nói & hội thoại <span class="meta">(sắp có · cần API)</span>';
      }
      const aiSum = speakingCard.querySelector(".sc-ai summary");
      if (aiSum && aiSum.textContent.indexOf("sắp có") < 0) {
        aiSum.textContent = "⚙️ Kết nối AI tùy chọn (sắp có)";
      }
    }

    const side = document.querySelector(".side");
    if (!side) return;

    const orderedIds = [
      // Tab 1: Chơi
      "ctxTalkCard", "quickCard", "evTray", "peopleCard", "needsCard", "rpCard",
      // Tab 2: Học (speakingCard MUST be last in Học)
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

    if (speakingCard && speakingCard.parentNode === side) {
      const missionEl = document.getElementById("missionCard");
      if (missionEl && missionEl.parentNode === side) {
        if (speakingCard.nextElementSibling !== missionEl) {
          side.insertBefore(speakingCard, missionEl);
        }
      } else if (side.lastElementChild !== speakingCard) {
        side.appendChild(speakingCard);
      }
    }
  }

  function applyVisibility(tabId) {
    if (typeof document === "undefined") return;
    injectCssOnce();
    const normTab = normalizeTabId(tabId) || activeTabId || "play";
    if (document.body) {
      document.body.setAttribute("data-uimb-tab", normTab);
    }

    ensureCardOrderAndLabels();
    ensureSceneCollapseBtn();

    const isMobile = isMobileViewport();
    const isHome = isHomeTopic();
    const activeTab = currentTabs.find(t => t.id === normTab) || currentTabs[0];
    const activeCards = new Set(activeTab && Array.isArray(activeTab.cards) ? activeTab.cards : []);

    // Scene (.leftcol and section.scene) is ALWAYS visible across all 3 tabs on both mobile & desktop!
    const leftcol = document.querySelector(".leftcol");
    const sceneEl = document.querySelector("section.scene");
    [leftcol, sceneEl].forEach(el => {
      if (!el) return;
      el.classList.remove("uimb-tab-hidden", "w3d-tab-hidden");
      el.hidden = false;
    });

    // #panel and .guide are shown in "play" tab on mobile, and always on desktop
    const panelEl = document.getElementById("panel");
    const guideEl = document.querySelector(".guide");
    const hidePlayOnlyExtras = isMobile && normTab !== "play";
    [panelEl, guideEl].forEach(el => {
      if (!el) return;
      el.classList.toggle("uimb-tab-hidden", hidePlayOnlyExtras);
      el.classList.remove("w3d-tab-hidden");
      if (!hidePlayOnlyExtras) el.hidden = false;
    });

    // Manage cards in .side for both Mobile and Desktop (3 unified groups)
    const allCards = getAllRegisteredCards();
    allCards.forEach(cardId => {
      if (cardId === "panel" || cardId === "fridgeCard") return;
      const el = document.getElementById(cardId);
      if (!el) return;

      // Contextual home-only cards in Chơi tab
      if ((cardId === "needsCard" || cardId === "peopleCard" || cardId === "evTray") && !isHome) {
        el.hidden = true;
        el.classList.add("uimb-tab-hidden", "w3d-tab-hidden");
        return;
      }

      const shouldShow = activeCards.has(cardId);
      el.classList.toggle("uimb-tab-hidden", !shouldShow);
      el.classList.toggle("w3d-tab-hidden", !shouldShow);
      if (shouldShow && cardId !== "rpCard") {
        el.hidden = false;
      }
    });
  }

  function hookWorld3dIfPresent() {
    if (w3dHooked || !root.ELW_WORLD3D) return;
    w3dHooked = true;
    try {
      const origSync = root.ELW_WORLD3D.sync;
      if (typeof origSync === "function") {
        const wrappedSync = function () {
          const res = origSync.apply(this, arguments);
          applyVisibility(activeTabId);
          return res;
        };
        root.ELW_WORLD3D.sync = wrappedSync;
        root.ELW_WORLD3D.syncTopic = wrappedSync;
      }
      // Also observe .leftcol and section.scene so if world-3d.js's internal timer adds uimb-tab-hidden, we strip it immediately
      if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
        const keepVisible = el => {
          if (!el) return;
          const obs = new MutationObserver(() => {
            if (el.classList.contains("uimb-tab-hidden") || el.classList.contains("w3d-tab-hidden")) {
              el.classList.remove("uimb-tab-hidden", "w3d-tab-hidden");
              el.hidden = false;
            }
          });
          obs.observe(el, { attributes: true, attributeFilter: ["class", "hidden"] });
        };
        keepVisible(document.querySelector(".leftcol"));
        keepVisible(document.querySelector("section.scene"));
      }
    } catch (e) {}
  }

  function bindCrossTabActionExecution() {
    if (delegationAttached || typeof document === "undefined") return;
    delegationAttached = true;

    // Use capture phase so we catch [data-mstart] BEFORE b.onclick replaces #missionCard.innerHTML
    document.addEventListener("click", function (e) {
      const t = e.target;
      if (!t || typeof t.closest !== "function") return;

      // 1. Clicking a mission chip [data-mstart] in #missionCard -> immediately enqueue step 1 action in sticky #room
      const mChip = t.closest("[data-mstart]");
      if (mChip) {
        const mid = mChip.getAttribute("data-mstart");
        setTimeout(() => {
          try {
            if (!root.ELW_MISSION || !root.ELW) return;
            const st = root.ELW_MISSION.state && root.ELW_MISSION.state();
            const activeMid = (st && st.id) || mid;
            const m = (root.ELW_MISSION.MISSIONS || []).find(x => x.id === activeMid);
            const W = root.ELW.state && root.ELW.state();
            if (m && W && Array.isArray(m.steps) && m.steps.length > 0) {
              const step1 = m.steps[0];
              const actId = (step1 && typeof step1.next === "function") ? step1.next(W) : (step1 && step1.actions && step1.actions[0]);
              if (actId && typeof root.ELW.enqueue === "function" && (!root.ELW.idle || root.ELW.idle())) {
                root.ELW.enqueue(actId);
              }
            }
          } catch (err) {}
        }, 35);
        return;
      }

      // 2. Clicking a step row or step chip inside #missionCard -> run mission step in sticky #room
      const stepEl = t.closest(".uim-step-row, .uim-chip-item");
      if (stepEl && !t.closest(".uim-btn-speak, .uim-btn-close, .uim-btn-collapse")) {
        setTimeout(() => {
          try {
            if (root.ELW_MISSION && typeof root.ELW_MISSION.auto === "function") {
              root.ELW_MISSION.auto();
            }
          } catch (err) {}
        }, 25);
        return;
      }

      // 3. Clicking a saved sequence [data-load] in #seqCard -> start playing in sticky #room
      const seqLoad = t.closest("#seqCard [data-load]");
      if (seqLoad) {
        setTimeout(() => {
          try {
            const playBtn = document.querySelector("#seqCard #qPlay");
            if (playBtn && playBtn.textContent.indexOf("Chạy") >= 0) {
              playBtn.click();
            }
          } catch (err) {}
        }, 35);
      }
    }, true);
  }

  function updateBarDom(tabId) {
    if (typeof document !== "undefined") {
      const bar = barEl || document.getElementById("uimb-bar");
      if (bar) {
        const btns = bar.querySelectorAll(".uimb-tab-btn");
        btns.forEach(btn => {
          const tid = btn.getAttribute("data-tab");
          const isSelected = tid === tabId;
          btn.setAttribute("aria-selected", isSelected ? "true" : "false");
          btn.classList.toggle("uimb-tab-active", isSelected);
        });
      }
      const w3dBar = document.getElementById("w3dModeTabs");
      if (w3dBar) {
        w3dBar.querySelectorAll(".w3d-mtab").forEach(b => {
          const on = b.dataset.mtab === tabId;
          b.classList.toggle("on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
      }
    }
  }

  function select(tabId) {
    const normId = normalizeTabId(tabId);
    const targetTab = currentTabs.find(t => t.id === normId);
    if (!targetTab) return false;

    activeTabId = targetTab.id;
    writeStoredTab(activeTabId);
    updateBarDom(activeTabId);
    applyVisibility(activeTabId);

    // Sync with ELW_WORLD3D 3-tab controller if present
    if (!syncingTab && root.ELW_WORLD3D && typeof root.ELW_WORLD3D.setTab === "function") {
      syncingTab = true;
      try {
        if (!root.ELW_WORLD3D.getTab || root.ELW_WORLD3D.getTab() !== activeTabId) {
          root.ELW_WORLD3D.setTab(activeTabId);
        }
      } catch (e) {}
      syncingTab = false;
    }

    if (typeof window !== "undefined") {
      try {
        if (isMobileViewport() && typeof window.scrollTo === "function") {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      } catch (e) {}
      try {
        const ev = new CustomEvent("elw-tab", {
          detail: { tabId: activeTabId, tab: targetTab }
        });
        window.dispatchEvent(ev);
      } catch (e) {}
    }
    return true;
  }

  function current() {
    return activeTabId;
  }

  function badge(tabId, count) {
    const normId = normalizeTabId(tabId) || tabId;
    badgeMap.set(normId, count);
    if (!barEl) return;
    const badgeEl = barEl.querySelector(`#uimb-badge-${normId}`);
    if (!badgeEl) return;

    const num = typeof count === "number" ? count : parseInt(count, 10);
    if (!isNaN(num) && num > 0) {
      badgeEl.textContent = num > 99 ? "99+" : String(num);
      badgeEl.removeAttribute("hidden");
      badgeEl.setAttribute("aria-label", `${num} thông báo mới`);
    } else if (typeof count === "string" && count.trim() !== "") {
      badgeEl.textContent = count;
      badgeEl.removeAttribute("hidden");
      badgeEl.setAttribute("aria-label", count);
    } else {
      badgeEl.setAttribute("hidden", "");
      badgeEl.textContent = "";
    }
  }

  function createOrUpdateBar() {
    if (typeof document === "undefined") return null;

    let bar = document.getElementById("uimb-bar");
    if (!bar) {
      bar = document.createElement("nav");
      bar.id = "uimb-bar";
      bar.className = "uimb-bar";
      bar.setAttribute("role", "tablist");
      bar.setAttribute("aria-label", "Điều hướng ứng dụng");
      document.body.appendChild(bar);
    }

    bar.innerHTML = currentTabs.map(tab => {
      const isSelected = tab.id === activeTabId;
      return `
        <button type="button"
                class="uimb-tab-btn ${isSelected ? "uimb-tab-active" : ""}"
                role="tab"
                id="uimb-tab-${tab.id}"
                data-tab="${tab.id}"
                data-slug="${tab.slug || tab.id}"
                aria-selected="${isSelected ? "true" : "false"}"
                aria-label="${tab.icon} ${tab.label}">
          <span class="uimb-tab-icon" aria-hidden="true">${tab.icon}</span>
          <span class="uimb-tab-label">${tab.label}</span>
          <span class="uimb-badge" id="uimb-badge-${tab.id}" hidden></span>
        </button>
      `;
    }).join("");

    bar.querySelectorAll(".uimb-tab-btn").forEach(btn => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const tid = btn.getAttribute("data-tab");
        select(tid);
      });
    });

    barEl = bar;

    // Reapply existing badges
    badgeMap.forEach((cnt, tid) => badge(tid, cnt));

    return bar;
  }

  function handleResize() {
    applyVisibility(activeTabId);
  }

  function bindGuideInteraction() {
    if (typeof document === "undefined") return;
    const guideEl = document.querySelector(".guide");
    const guideBtn = document.getElementById("guide");
    if (!guideEl || !guideBtn) return;
    if (guideBtn._uimbGuideBound) return;
    guideBtn._uimbGuideBound = true;

    guideBtn.addEventListener("click", function (e) {
      if (e.target && (e.target.closest(".face") || e.target.tagName === "B")) {
        guideEl.classList.toggle("uimb-guide-expanded");
      }
    });

    const guideText = document.getElementById("guideText");
    if (guideText) {
      const updateTitle = () => {
        guideBtn.setAttribute("title", guideText.textContent || "Cô Mai hướng dẫn");
      };
      updateTitle();
      try {
        const obs = new MutationObserver(updateTitle);
        obs.observe(guideText, { childList: true, characterData: true, subtree: true });
      } catch (e) {}
    }
  }

  function init(opts = {}) {
    injectCssOnce();

    if (Array.isArray(opts.tabs) && opts.tabs.length > 0) {
      currentTabs = opts.tabs;
    } else {
      currentTabs = DEFAULT_TABS;
    }

    sceneCollapsed = readSceneCollapsed();

    // Determine initial tab: opts.defaultTab || localStorage || first tab
    const stored = readStoredTab();
    const optDefault = normalizeTabId(opts.defaultTab);
    const candidateTab = (optDefault && currentTabs.find(t => t.id === optDefault))
      ? optDefault
      : (stored && currentTabs.find(t => t.id === stored))
        ? stored
        : currentTabs[0].id;

    activeTabId = candidateTab;
    writeStoredTab(activeTabId);
    createOrUpdateBar();
    applyVisibility(activeTabId);
    bindGuideInteraction();
    bindCrossTabActionExecution();
    hookWorld3dIfPresent();

    if (!resizeListenerAttached && typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      if (window.matchMedia) {
        try {
          const mq = window.matchMedia(`(max-width: ${BREAKPOINT_PX}px)`);
          if (mq.addEventListener) mq.addEventListener("change", handleResize);
          else if (mq.addListener) mq.addListener(handleResize);
        } catch (e) {}
      }
      resizeListenerAttached = true;
    }

    initialized = true;
    return API;
  }

  function destroy() {
    if (barEl && barEl.parentNode) {
      barEl.parentNode.removeChild(barEl);
      barEl = null;
    }
    const allCards = getAllRegisteredCards();
    allCards.forEach(cardId => {
      const el = document.getElementById(cardId);
      if (el) el.classList.remove("uimb-tab-hidden", "w3d-tab-hidden");
    });
    if (resizeListenerAttached && typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      resizeListenerAttached = false;
    }
    initialized = false;
  }

  const API = {
    init,
    select,
    current,
    badge,
    destroy,
    toggleSceneCollapse,
    isSceneCollapsed: () => sceneCollapsed,
    sync: () => {
      hookWorld3dIfPresent();
      applyVisibility(activeTabId);
    },
    getTabs: () => currentTabs.slice(),
    css: CSS_TEXT
  };

  root.ELW_UI_MOBILE = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
