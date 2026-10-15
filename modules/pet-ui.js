/* English Life World — modules/pet-ui.js
   Agent A6: Pet UI (Home Card #petSurvivalCard, 5 Needs Bars, 8 Interactions Panel,
   Unified Adventure HUD #petAdventureHud, Adventure Result #petAdventureResult,
   10-Pet Collection Grid #petCollectionGrid, Profile Modal & Honest Premium Preview Modal).
   Exposes: window.ELW_PET_UI and CommonJS module.exports */
(function (root, factory) {
  "use strict";
  const api = factory(root);
  if (typeof window !== "undefined") {
    window.ELW_PET_UI = api;
  }
  if (root && typeof root === "object") {
    root.ELW_PET_UI = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function (root) {
  "use strict";

  const STYLE_ID = "elw-pet-ui-css";
  const CARD_ID = "petSurvivalCard";
  const MINI_HUD_ID = "petMiniHud";
  const ADV_HUD_ID = "petAdventureHud";
  const ADV_RESULT_ID = "petAdventureResult";
  const COLLECTION_GRID_ID = "petCollectionGrid";

  const CANONICAL_PET_IDS = Object.freeze([
    "milu",
    "boba",
    "cookie",
    "mochi",
    "pepper",
    "oreo",
    "ember",
    "lumi",
    "pip",
    "aqua"
  ]);

  const CANONICAL_STATES = Object.freeze([
    "idle_happy",
    "curious",
    "playful",
    "eating",
    "drinking",
    "sleepy",
    "tired",
    "sad_lonely",
    "excited",
    "walking_adventure"
  ]);

  const NEEDS_META = Object.freeze([
    { key: "energy", icon: "⚡", labelVi: "Năng lượng", labelEn: "Energy", color: "#f59e0b" },
    { key: "hunger", icon: "🍖", labelVi: "Độ no",      labelEn: "Hunger", color: "#10b981" },
    { key: "thirst", icon: "💧", labelVi: "Độ khát",    labelEn: "Thirst", color: "#0ea5e9" },
    { key: "fun",    icon: "🎾", labelVi: "Độ vui",     labelEn: "Fun",    color: "#8b5cf6" },
    { key: "bond",   icon: "💖", labelVi: "Gắn kết",    labelEn: "Bond",   color: "#ec4899" }
  ]);

  const INTERACTION_BUTTONS = Object.freeze([
    { id: "pet",     icon: "🤗", labelVi: "Vuốt ve",      labelEn: "Pet & Cuddle" },
    { id: "play",    icon: "🎾", labelVi: "Chơi",         labelEn: "Play" },
    { id: "feed",    icon: "🍖", labelVi: "Cho ăn",       labelEn: "Feed" },
    { id: "water",   icon: "💧", labelVi: "Cho uống",     labelEn: "Water" },
    { id: "rest",    icon: "😴", labelVi: "Nghỉ",         labelEn: "Rest" },
    { id: "talk",    icon: "🗣️", labelVi: "Nói chuyện",   labelEn: "Talk" },
    { id: "walk",    icon: "🦮", labelVi: "Dẫn đi chơi",  labelEn: "Walk" },
    { id: "profile", icon: "📋", labelVi: "Hồ sơ",        labelEn: "Profile" }
  ]);

  const UI_CSS = `
/* =====================================================================
   ELW_PET_UI — Responsive Pet Home Card, Adventure HUD & 10-Pet Grid
   Mobile-safe 360px–430px (Zero horizontal overflow guaranteed)
   ===================================================================== */
#petSurvivalCard,
#petSurvivalCard *,
#petSurvivalCard *::before,
#petSurvivalCard *::after,
#mbox .pet-modal-wrap,
#mbox .pet-modal-wrap * {
  box-sizing: border-box;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
}

#petSurvivalCard {
  background: linear-gradient(145deg, #fffdf9 0%, #fef3c7 100%);
  border: 2px solid #f59e0b;
  border-radius: 18px;
  padding: 12px 13px;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.14);
  font-family: system-ui, -apple-system, sans-serif;
  color: #1e293b;
  width: 100%;
  overflow-x: hidden;
}

/* Header */
.pet-home-header {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.86);
  border: 1.5px solid #fde68a;
  border-radius: 15px;
  padding: 9px 10px;
}
.pet-home-avatar-box {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 45%, #ffffff 0%, #fef3c7 100%);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 3px;
  cursor: pointer;
}
.pet-home-meta {
  flex: 1;
  min-width: 0;
}
.pet-home-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}
.pet-home-name {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.25;
}
.pet-state-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eff6ff;
  border: 1px solid #93c5fd;
  color: #1d4ed8;
}
.pet-level-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 4px;
  font-size: 11.5px;
  font-weight: 700;
  color: #92400e;
}
.pet-xp-track {
  height: 7px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
  margin-top: 4px;
}
.pet-xp-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f59e0b 0%, #10b981 100%);
  transition: width 0.3s ease;
}
.pet-inv-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
}
.pet-inv-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #fcd34d;
  color: #78350f;
}

/* 5 Needs Bars */
.pet-needs-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  margin-bottom: 10px;
}
.pet-need-item {
  background: #ffffff;
  border: 1px solid #fde68a;
  border-radius: 11px;
  padding: 6px 8px;
}
.pet-need-item[data-need-bar="bond"] {
  grid-column: 1 / -1;
}
.pet-need-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 800;
  margin-bottom: 4px;
  color: #1e293b;
}
.pet-need-track {
  height: 7px;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
}
.pet-need-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

/* 8 Interaction Buttons */
.pet-section-lbl {
  font-size: 12px;
  font-weight: 800;
  color: #78350f;
  margin: 8px 0 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}
.pet-interact-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}
@media (max-width: 480px) {
  .pet-interact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.pet-interact-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 7px 5px;
  border-radius: 12px;
  border: 1.5px solid #fcd34d;
  background: #ffffff;
  color: #78350f;
  font-family: inherit;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.pet-interact-btn:hover {
  background: #fffbeb;
  border-color: #f59e0b;
}
.pet-interact-btn[data-pet-interact="walk"] {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
  color: #065f46;
}
.pet-interact-btn .pi-ico {
  font-size: 17px;
  line-height: 1.1;
}
.pet-interact-btn .pi-vi {
  font-size: 11.5px;
  font-weight: 800;
  line-height: 1.15;
}
.pet-interact-btn .pi-en {
  font-size: 9.5px;
  font-weight: 600;
  color: #64748b;
  line-height: 1.1;
}

.pet-dialogue-box {
  background: #ffffff;
  border: 1.5px dashed #f59e0b;
  border-radius: 12px;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 12px;
  line-height: 1.38;
}
.pet-dialogue-box .pdb-en {
  font-weight: 800;
  color: #0f172a;
}
.pet-dialogue-box .pdb-vi {
  color: #475569;
  font-size: 11.5px;
  margin-top: 2px;
}

/* Adventure HUD (#petAdventureHud) */
#petAdventureHud {
  background: linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #10b981;
  border-radius: 15px;
  padding: 10px 11px;
  margin-bottom: 10px;
  color: #064e3b;
}
.pet-adv-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 7px;
}
.pet-adv-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #065f46;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.pet-adv-toggle-btn {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1.5px solid #059669;
  background: #10b981;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
}
.pet-adv-toggle-btn.is-active {
  background: #ffffff;
  color: #047857;
}
.pet-adv-meta-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 8px;
}
.pet-adv-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #6ee7b7;
  color: #065f46;
}
.pet-adv-objectives {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.pet-adv-obj {
  background: #ffffff;
  border: 1.5px solid #a7f3d0;
  border-radius: 12px;
  padding: 8px 9px;
}
.pet-adv-obj.is-done {
  border-color: #10b981;
  background: #f0fdf4;
}
.pet-adv-obj-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.pet-adv-obj-title {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}
.pet-adv-obj-title small {
  display: block;
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
}
.pet-obj-reward {
  font-size: 10.5px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 999px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  color: #92400e;
}
.pet-obj-reward.is-claimed {
  background: #dcfce7;
  border-color: #10b981;
  color: #047857;
}
.pet-adv-sentence {
  background: #f8fafc;
  border-left: 3px solid #10b981;
  padding: 5px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
}
.pet-adv-sentence .pas-en {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}
.pet-adv-sentence .pas-vi {
  font-size: 11px;
  color: #475569;
  margin-top: 2px;
}
.pet-adv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pet-adv-btn {
  padding: 5px 9px;
  border-radius: 9px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #1e293b;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
}
.pet-adv-btn.primary {
  background: #10b981;
  border-color: #059669;
  color: #ffffff;
}
.pet-adv-btn.primary.is-done {
  background: #059669;
}

/* Adventure Result (#petAdventureResult) */
.pet-adventure-result {
  background: linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #f59e0b;
  border-radius: 14px;
  padding: 10px 11px;
  margin-bottom: 10px;
  color: #78350f;
}
.pet-adv-res-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #92400e;
  margin-bottom: 4px;
}
.pet-adv-res-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 6px 0;
}
.pet-adv-res-pill {
  background: #ffffff;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 2px 7px;
  font-size: 11px;
  font-weight: 800;
  color: #78350f;
}
.pet-adv-res-Quotes {
  font-size: 11px;
  color: #334155;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 9px;
  padding: 6px 8px;
  margin-bottom: 8px;
}
.pet-adv-res-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pet-adv-res-btn {
  flex: 1;
  min-width: 120px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1.5px solid #d97706;
  background: #ffffff;
  color: #92400e;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  text-align: center;
}
.pet-adv-res-btn.primary {
  background: #f59e0b;
  color: #ffffff;
}

/* 10-Pet Collection Grid (#petCollectionGrid) */
.pet-collection-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}
@media (max-width: 640px) {
  .pet-collection-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.pet-col-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 3px;
  padding: 7px 5px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.pet-col-card:hover {
  border-color: #f59e0b;
  background: #fffdf7;
}
.pet-col-card.is-active {
  border: 2px solid #d97706;
  background: #fffbeb;
  box-shadow: 0 3px 10px rgba(217, 119, 6, 0.18);
}
.pet-col-name {
  font-size: 11.5px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.15;
}
.pet-col-species {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  line-height: 1.15;
}
.pet-tier-badge {
  display: inline-block;
  font-size: 9.5px;
  font-weight: 800;
  padding: 1.5px 6px;
  border-radius: 999px;
  line-height: 1.2;
}
.pet-tier-badge.is-free {
  background: #dcfce7;
  color: #047857;
  border: 1px solid #6ee7b7;
}
.pet-tier-badge.is-premium {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fcd34d;
}

/* Top Bar Mini Pill (#petMiniHud) */
.pet-top-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 999px;
  background: #fef3c7;
  border: 1.5px solid #f59e0b;
  color: #92400e;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}
@media (max-width: 480px) {
  .pet-top-pill {
    font-size: 10.5px;
    padding: 3px 6px;
    gap: 3px;
  }
}

/* Modals (Profile & Premium Preview) */
.pet-modal-wrap {
  font-family: system-ui, -apple-system, sans-serif;
  color: #1e293b;
}
.pet-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #e2e8f0;
}
.pet-modal-hd h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
}
.pet-modal-close {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  border-radius: 9px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}
.pet-preview-hero {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%);
  border: 1.5px solid #fcd34d;
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 10px;
}
.pet-states-gallery {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}
@media (max-width: 560px) {
  .pet-states-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.pet-state-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  text-align: center;
}
.pet-state-chip.is-selected {
  border-color: #f59e0b;
  background: #fffbeb;
}
.pet-limitation-banner {
  background: #fff7ed;
  border: 1.5px solid #fb923c;
  border-radius: 12px;
  padding: 9px 11px;
  font-size: 12px;
  line-height: 1.45;
  color: #9a3412;
  margin-bottom: 10px;
}
.pet-modal-roster-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  margin-top: 6px;
}
@media (max-width: 560px) {
  .pet-modal-roster-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.pet-modal-roster-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  text-align: center;
  font-size: 11px;
}
.pet-modal-roster-item.is-current {
  border-color: #d97706;
  background: #fffbeb;
}
`;

  let lastDialogueFeedback = null;
  let forceShowResult = false;
  let subscribedEngines = false;

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c;
    });
  }

  function getDoc() {
    return (root && root.document) || (typeof document !== "undefined" ? document : null);
  }

  function getNeedsApi() {
    return (root && root.ELW_PET_NEEDS) || (typeof window !== "undefined" ? window.ELW_PET_NEEDS : null);
  }

  function getRewardsApi() {
    return (root && root.ELW_PET_REWARDS) || (typeof window !== "undefined" ? window.ELW_PET_REWARDS : null);
  }

  function getInteractionApi() {
    return (root && root.ELW_PET_INTERACTION) || (typeof window !== "undefined" ? window.ELW_PET_INTERACTION : null);
  }

  function getAdventureApi() {
    return (root && root.ELW_PET_ADVENTURE) || (typeof window !== "undefined" ? window.ELW_PET_ADVENTURE : null);
  }

  function getContextApi() {
    return (root && root.ELW_CONTEXT) || (typeof window !== "undefined" ? window.ELW_CONTEXT : null);
  }

  function injectCss() {
    const doc = getDoc();
    if (!doc || !doc.head) return false;
    if (!doc.getElementById(STYLE_ID)) {
      const st = doc.createElement("style");
      st.id = STYLE_ID;
      st.textContent = UI_CSS;
      doc.head.appendChild(st);
    }
    return true;
  }

  /* ---------- Safe Data Readers ---------- */
  function getRosterList() {
    const needsApi = getNeedsApi();
    if (needsApi && Array.isArray(needsApi.PET_LIST) && needsApi.PET_LIST.length === 10) {
      return needsApi.PET_LIST;
    }
    return CANONICAL_PET_IDS.map(function (id) {
      const isFree = id === "milu" || id === "mochi";
      return {
        id: id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        category: ["milu", "boba", "cookie"].indexOf(id) !== -1 ? "dog" : (["mochi", "pepper", "oreo"].indexOf(id) !== -1 ? "cat" : "rare"),
        speciesVi: id === "milu" ? "Cún Lông Xù Vàng" : (id === "mochi" ? "Mèo Trắng Mochi" : "Thú Cưng Đặc Biệt"),
        speciesEn: "Companion Pet",
        tier: isFree ? "free" : "premium",
        free: isFree,
        pro: !isFree,
        icon: id === "mochi" || id === "pepper" || id === "oreo" ? "🐱" : "🐕",
        sound: "Woof! 🐾",
        personalityVi: "Đáng yêu, thân thiện và thích học tiếng Anh cùng bé!",
        personalityEn: "Friendly and loves learning English with you!",
        favFoodVi: "Bánh thưởng thơm ngon",
        favFoodEn: "Yummy Pet Treat"
      };
    });
  }

  function getPetById(petId) {
    const rawId = typeof petId === "object" && petId !== null ? (petId.petId || petId.id) : petId;
    const norm = String(rawId || "milu").trim().toLowerCase();
    const list = getRosterList();
    return list.find(function (p) { return p.id === norm; }) || list[0];
  }

  function getSnapshotData() {
    const needsApi = getNeedsApi();
    if (needsApi && typeof needsApi.getSnapshot === "function") {
      try {
        return needsApi.getSnapshot();
      } catch (e) {}
    }
    const activePet = getPetById("milu");
    return {
      activePetId: activePet.id,
      activePet: activePet,
      needs: { energy: 80, hunger: 80, thirst: 80, fun: 80, bond: 50 },
      visualState: "idle_happy",
      stateMeta: { id: "idle_happy", labelVi: "Vui vẻ", labelEn: "Happy & Relaxed", emoji: "😊" },
      assetPath: "assets/pets/" + activePet.id + "/idle_happy.png",
      inventory: { treats: 5, water: 5, toys: 4 },
      stats: { xp: 0, level: 1, maxLevel: 5, nextLevelXp: 100, progressPct: 0, stageBadge: "🌱 Lv.1 Bạn Mới Đáng Yêu", streak: 1 }
    };
  }

  function resolveAsset(relPath) {
    const p = String(relPath || "").replace(/^\.\//, "");
    try {
      const win = (root && root.window) || (typeof window !== "undefined" ? window : root);
      if (win && typeof win.resolvePetAsset === "function") return win.resolvePetAsset(p);
      if (win && win.ELW_PET_ASSETS && win.ELW_PET_ASSETS[p]) return win.ELW_PET_ASSETS[p];
    } catch (e) {}
    return p;
  }

  function renderSpriteHtml(petId, state, sizePx, extraOpts) {
    const interApi = getInteractionApi();
    const opts = Object.assign({ size: sizePx || 72 }, extraOpts || {});
    if (interApi && typeof interApi.renderPetSprite === "function") {
      try {
        return interApi.renderPetSprite(petId, state, opts);
      } catch (e) {}
    }
    const safeId = String(petId || "milu").toLowerCase();
    const safeState = CANONICAL_STATES.indexOf(state) !== -1 ? state : "idle_happy";
    const sz = Number(sizePx) || 72;
    const imgIdAttr = opts.imgId ? ` id="${esc(opts.imgId)}"` : "";
    const extraImgClass = opts.imgClass ? " " + esc(opts.imgClass) : "";
    const resolvedSrc = resolveAsset(`assets/pets/${safeId}/${safeState}.png`);
    const resolvedFallback = resolveAsset(`assets/pets/${safeId}/idle_happy.png`);
    return (
      `<div class="pet-sprite-wrap" style="--pet-sprite-size:${sz}px" data-pet-id="${esc(safeId)}" data-state="${esc(safeState)}">` +
      `<img${imgIdAttr} class="pet-sprite-img${extraImgClass}" src="${esc(resolvedSrc)}" alt="${esc(safeId)} - ${esc(safeState)}" ` +
      `onerror="this.src='${esc(resolvedFallback)}'" />` +
      `</div>`
    );
  }

  /* ---------- Top Bar Mini HUD (#petMiniHud) ---------- */
  function renderTopPill() {
    const doc = getDoc();
    if (!doc) return null;
    injectCss();

    const bar = doc.querySelector("header .hud, header .bar, .bar");
    if (!bar) return null;

    let pill = doc.getElementById(MINI_HUD_ID);
    if (!pill) {
      pill = doc.createElement("button");
      pill.id = MINI_HUD_ID;
      pill.type = "button";
      pill.className = "pet-top-pill";
      pill.title = "Thú cưng đồng hành & Pet Adventure (Bấm để mở tab Nhiệm vụ & Nuôi Pet)";
      pill.onclick = function () {
        try {
          if (root.ELW_WORLD3D && typeof root.ELW_WORLD3D.setTab === "function") {
            root.ELW_WORLD3D.setTab("mission");
          }
          const card = doc.getElementById(CARD_ID);
          if (card && typeof card.scrollIntoView === "function") {
            card.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        } catch (e) {}
      };
      const pts = doc.getElementById("pts");
      if (pts && pts.parentNode) {
        pts.parentNode.insertBefore(pill, pts);
      } else {
        bar.appendChild(pill);
      }
    }

    const snap = getSnapshotData();
    const pet = snap.activePet || getPetById(snap.activePetId);
    const lv = (snap.stats && snap.stats.level) || 1;
    const hunger = Math.round((snap.needs && snap.needs.hunger) || 80);
    const bond = Math.round((snap.needs && snap.needs.bond) || 50);
    const vState = snap.visualState || "idle_happy";
    const miniSrc = resolveAsset(`assets/pets/${pet.id}/${vState}.png`);

    pill.setAttribute("data-active-pet-id", pet.id);
    pill.innerHTML =
      `<img id="petMiniSpriteImg" src="${esc(miniSrc)}" alt="${esc(pet.name)}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;margin-right:3px" />` +
      `${pet.icon || "🐕"} ${esc(pet.name)} Lv.${lv} · 🍖${hunger}% · 💖${bond}%`;
    return pill;
  }

  /* ---------- Build Adventure HUD HTML (#petAdventureHud) ---------- */
  function buildAdventureHudHtml(snap) {
    const advApi = getAdventureApi();
    const rewardsApi = getRewardsApi();
    const pet = snap.activePet || getPetById(snap.activePetId);

    const unified = (advApi && typeof advApi.getUnifiedSystemState === "function")
      ? advApi.getUnifiedSystemState()
      : {
          activePetId: pet.id,
          adventureSession: {
            sessionId: "adv_default",
            active: false,
            petId: pet.id,
            entrySources: [],
            place: "home",
            zone: "living",
            weather: "sunny",
            situation: "normal",
            objectives: [],
            completedObjectives: [],
            isComplete: false,
            resultSummary: null
          },
          context: { place: "home", zone: "living", weather: "sunny", situation: "normal", withPet: false }
        };

    const session = unified.adventureSession || {};
    const ctx = unified.context || {};
    const placeMeta = (advApi && advApi.PLACE_META && advApi.PLACE_META[ctx.place]) || { nameVi: "nhà", nameEn: "Home" };
    const wxMeta = (advApi && advApi.WEATHER_META && advApi.WEATHER_META[ctx.weather]) || { icon: "☀️", vi: "Nắng đẹp", en: "Sunny" };
    const sitMeta = (advApi && advApi.SITUATION_META && advApi.SITUATION_META[ctx.situation]) || { icon: "😊", vi: "Bình thường", en: "Normal" };

    const entrySources = Array.isArray(session.entrySources) && session.entrySources.length
      ? session.entrySources
      : ["chưa kích hoạt"];
    const objectives = Array.isArray(session.objectives) ? session.objectives : [];
    const doneCount = objectives.filter(function (o) { return o && o.done; }).length;

    const objectivesHtml = objectives.map(function (obj) {
      const objStatus = (rewardsApi && typeof rewardsApi.getObjectiveStatus === "function")
        ? rewardsApi.getObjectiveStatus(obj.objectiveKey)
        : { claimed: Boolean(obj.rewardClaimed) };
      const isClaimed = Boolean(objStatus && objStatus.claimed);
      const stars = (obj.rewardSpec && obj.rewardSpec.stars) || 10;
      const xp = (obj.rewardSpec && obj.rewardSpec.xp) || 20;

      const rewardBadgeHtml = isClaimed
        ? `<span class="pet-obj-reward is-claimed" data-reward-claimed="true" data-objective-key="${esc(obj.objectiveKey)}">✓ Đã nhận thưởng 1 lần (Chống farm)</span>`
        : `<span class="pet-obj-reward is-unclaimed" data-reward-claimed="false" data-objective-key="${esc(obj.objectiveKey)}">+${stars}⭐ +${xp}XP</span>`;

      return (
        `<div class="pet-adv-obj ${obj.done ? "is-done" : ""}" ` +
        `data-objective-id="${esc(obj.id)}" data-objective-key="${esc(obj.objectiveKey)}" data-objective-done="${obj.done ? "true" : "false"}">` +
        `<div class="pet-adv-obj-top">` +
        `<div class="pet-adv-obj-title">` +
        `${obj.done ? "✅" : obj.icon || "🎯"} Bước ${obj.stepNumber || 1}: ${esc(obj.titleVi)}` +
        `<small>${esc(obj.titleEn)}</small>` +
        `</div>` +
        rewardBadgeHtml +
        `</div>` +
        `<div class="pet-adv-sentence">` +
        `<div class="pas-en">“${esc(obj.sentenceEn || obj.en)}”</div>` +
        `<div class="pas-vi">${esc(obj.sentenceVi || obj.vi)}</div>` +
        `</div>` +
        `<div class="pet-adv-actions">` +
        `<button type="button" class="pet-adv-btn" data-adv-speak="${esc(obj.id)}">🔊 Nghe</button>` +
        `<button type="button" class="pet-adv-btn primary ${obj.done ? "is-done" : ""}" data-adv-complete="${esc(obj.id)}">` +
        `${obj.done ? "✓ Thực hành lại câu (Không cộng trùng thưởng)" : "✅ Thực hành câu & Hoàn thành bước"}` +
        `</button>` +
        `</div>` +
        `</div>`
      );
    }).join("");

    const resultSummary = session.resultSummary || {
      headlineVi: `Hoàn thành Nhiệm vụ Phiêu lưu cùng ${pet.name} tại ${placeMeta.nameVi}!`,
      summaryVi: `Bạn và ${pet.name} đã thực hành các câu giao tiếp tiếng Anh theo ngữ cảnh tại ${placeMeta.nameVi} (${wxMeta.vi}).`,
      rewards: { stars: 35, xp: 47, treats: 3, water: 1, toys: 1, bond: 12 }
    };
    const showResult = Boolean(session.isComplete || forceShowResult);

    const practicedSentencesHtml = objectives.map(function (o) {
      return `<li><b>${esc(o.sentenceEn)}</b> — <i>${esc(o.sentenceVi)}</i></li>`;
    }).join("");

    const resultHtml =
      `<div id="${ADV_RESULT_ID}" class="pet-adventure-result ${showResult ? "is-visible" : ""}" ` +
      `data-adventure-complete="${session.isComplete ? "true" : "false"}" ${showResult ? "" : "hidden"}>` +
      `<div class="pet-adv-res-title">🏆 ${esc(resultSummary.headlineVi)} (${doneCount}/${objectives.length || 3})</div>` +
      `<div style="font-size:11.5px;margin-bottom:4px">${esc(resultSummary.summaryVi)}</div>` +
      `<div class="pet-adv-res-stats">` +
      `<span class="pet-adv-res-pill">⭐ Tổng thưởng: +${(resultSummary.rewards && resultSummary.rewards.stars) || 35}⭐</span>` +
      `<span class="pet-adv-res-pill">✨ +${(resultSummary.rewards && resultSummary.rewards.xp) || 47} XP</span>` +
      `<span class="pet-adv-res-pill">💖 Gắn kết: ${Math.round((snap.needs && snap.needs.bond) || 50)}%</span>` +
      `<span class="pet-adv-res-pill">🍖 Độ no: ${Math.round((snap.needs && snap.needs.hunger) || 80)}%</span>` +
      `</div>` +
      `<ul class="pet-adv-res-Quotes" style="margin:0 0 8px;padding-left:16px">${practicedSentencesHtml}</ul>` +
      `<div class="pet-adv-res-btns">` +
      `<button type="button" class="pet-adv-res-btn primary" id="btnAdvExploreOther" data-adv-result-action="explore">🔄 Khám phá chủ đề khác</button>` +
      `<button type="button" class="pet-adv-res-btn" id="btnAdvRestHome" data-adv-result-action="rest">🏠 Nghỉ ngơi tại nhà</button>` +
      `</div>` +
      `</div>`;

    const hudHtml =
      `<div id="${ADV_HUD_ID}" class="pet-adventure-hud" ` +
      `data-adventure-session-id="${esc(session.sessionId)}" ` +
      `data-adventure-active="${session.active ? "true" : "false"}" ` +
      `data-active-pet-id="${esc(unified.activePetId)}" ` +
      `data-entry-sources="${esc((session.entrySources || []).join(","))}">` +
      `<div class="pet-adv-head">` +
      `<div class="pet-adv-title">` +
      renderSpriteHtml(pet.id, snap.visualState || "idle_happy", 36, { imgId: "petAdvSpriteImg" }) +
      `<span>🎒 Pet Adventure Quest (${doneCount}/${objectives.length || 3})</span>` +
      `</div>` +
      `<button type="button" class="pet-adv-toggle-btn ${session.active ? "is-active" : ""}" id="btnTogglePetAdventure">` +
      `${session.active ? "🟢 Đang đi chơi (Bấm để nghỉ)" : "🦮 Bắt đầu Đi chơi cùng " + esc(pet.name)}` +
      `</button>` +
      `</div>` +
      `<div class="pet-adv-meta-badges">` +
      (window.ELW_DEBUG ? `<span class="pet-adv-badge" data-badge-session>🆔 Phiên: <code>${esc(session.sessionId)}</code></span>` : "") +
      `<span class="pet-adv-badge" data-badge-pet>${pet.icon || "🐕"} Pet: <b>${esc(pet.name)} (${esc(unified.activePetId)})</b></span>` +
      `<span class="pet-adv-badge" data-badge-sources>🚪 Nguồn vào: <b>${esc(entrySources.join(", "))}</b></span>` +
      `<span class="pet-adv-badge" data-badge-place>📍 ${esc(placeMeta.nameVi)} (${esc(ctx.place)}/${esc(ctx.zone)})</span>` +
      `<span class="pet-adv-badge" data-badge-weather>${wxMeta.icon} ${esc(wxMeta.vi)} (${esc(ctx.weather)})</span>` +
      `<span class="pet-adv-badge" data-badge-situation>${sitMeta.icon} ${esc(sitMeta.vi)} (${esc(ctx.situation)})</span>` +
      `</div>` +
      `<div class="pet-adv-objectives">${objectivesHtml}</div>` +
      `</div>` +
      resultHtml;

    return hudHtml;
  }

  function openTopicUnlockSheet() {
    const doc = getDoc();
    if (!doc) return false;
    closeModals();
    try {
      const btnTopic = doc.getElementById("btnTopic");
      if (btnTopic && typeof btnTopic.click === "function") {
        btnTopic.click();
      } else {
        const sh = doc.getElementById("topicSheet");
        if (sh) sh.hidden = false;
      }
      setTimeout(function () {
        const sh = doc.getElementById("topicSheet");
        if (!sh) return;
        sh.hidden = false;
        const inp = sh.querySelector("#tsCode");
        const msg = sh.querySelector("#tsMsg");
        if (msg && !msg.textContent) {
          msg.textContent = "Nhập mã mở khoá để mở toàn bộ chủ đề và 8 thú cưng Premium.";
        }
        if (inp) {
          try {
            inp.focus();
            if (typeof inp.scrollIntoView === "function") {
              inp.scrollIntoView({ block: "center", behavior: "smooth" });
            }
          } catch (e) {}
        }
      }, 30);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- Build 10-Pet Collection Grid HTML (#petCollectionGrid) ---------- */
  function buildCollectionGridHtml(activePetId) {
    const rewardsApi = getRewardsApi();
    const roster = getRosterList(); // Guaranteed 10 pets
    const premiumUnlocked = rewardsApi && typeof rewardsApi.isPremiumUnlocked === "function"
      ? Boolean(rewardsApi.isPremiumUnlocked())
      : Boolean(rewardsApi && typeof rewardsApi.isPetUnlocked === "function" && rewardsApi.isPetUnlocked("ember"));

    const cardsHtml = roster.slice(0, 10).map(function (pet) {
      const isFreeTier = pet.id === "milu" || pet.id === "mochi" || pet.tier === "free" || pet.free === true;
      const isUnlocked = rewardsApi && typeof rewardsApi.isPetUnlocked === "function"
        ? Boolean(rewardsApi.isPetUnlocked(pet.id))
        : isFreeTier;
      const isActive = pet.id === activePetId;
      const tierLabel = isUnlocked
        ? (isFreeTier
            ? (isActive ? "✓ Đang đi cùng · MIỄN PHÍ" : "Chọn đi cùng · MIỄN PHÍ")
            : (isActive ? "✓ Đang đi cùng · PREMIUM" : "Chọn đi cùng · PREMIUM"))
        : "🔒 Mở khoá Premium";

      return (
        `<button type="button" class="pet-col-card ${isActive ? "is-active" : ""} ${isFreeTier ? "is-free-pet" : "is-premium-pet"} ${isUnlocked ? "is-unlocked" : "is-locked"}" ` +
        `data-pet-card="${esc(pet.id)}" ` +
        `data-pet-select="${esc(pet.id)}" ` +
        `data-pet-tier="${isFreeTier ? "free" : "premium"}" ` +
        `data-pet-category="${esc(pet.category || "dog")}" ` +
        `data-pet-unlocked="${isUnlocked ? "true" : "false"}" ` +
        `title="${esc(pet.name)} (${esc(pet.speciesVi)}) — ${isUnlocked ? "Đã mở khoá, bấm để chọn đi cùng" : "Chưa mở khoá, bấm để Xem trước hoặc Mở khoá Premium"}">` +
        renderSpriteHtml(pet.id, "idle_happy", 52, { imgClass: "pet-col-img" }) +
        `<span class="pet-col-name">${pet.icon || "🐾"} ${esc(pet.name)}</span>` +
        `<span class="pet-col-species">${esc(pet.speciesVi)}</span>` +
        `<span class="pet-tier-badge ${isUnlocked ? "is-free" : "is-premium"}">${tierLabel}</span>` +
        `</button>`
      );
    }).join("");

    const unlockActionHtml = !premiumUnlocked
      ? `<button type="button" class="pet-adv-btn primary" data-open-premium-unlock style="padding:3px 9px;font-size:11px">🔑 Mở khoá Premium</button>`
      : `<span class="pet-tier-badge is-free">👑 Đã mở khoá 10/10 Pet</span>`;

    return (
      `<div class="pet-section-lbl">` +
      `<span>🐾 Bộ sưu tập 10 Thú cưng (${premiumUnlocked ? "Đã mở khoá 10/10 Pet" : "2 Miễn phí · 8 Premium"})</span>` +
      unlockActionHtml +
      `</div>` +
      `<div id="${COLLECTION_GRID_ID}" class="pet-collection-grid" role="list" aria-label="Bộ sưu tập 10 thú cưng">` +
      cardsHtml +
      `</div>`
    );
  }

  /* ---------- Render Main Pet Home Card (#petSurvivalCard) ---------- */
  function renderCard() {
    const doc = getDoc();
    if (!doc) return null;
    injectCss();

    const side = doc.querySelector(".side");
    const mc = doc.getElementById("missionCard");
    let card = doc.getElementById(CARD_ID);
    if (!card) {
      card = doc.createElement("section");
      card.id = CARD_ID;
      card.className = "card2";
      card.setAttribute("aria-label", "Nuôi thú cưng & Nhiệm vụ Pet Adventure");
      if (side) side.appendChild(card);
    }
    if (side && mc && mc.parentNode === side && card.previousElementSibling !== mc) {
      side.insertBefore(card, mc.nextSibling);
    }

    const snap = getSnapshotData();
    const activePet = snap.activePet || getPetById(snap.activePetId);
    const visualState = snap.visualState || "idle_happy";
    const stateMeta = snap.stateMeta || { id: visualState, labelVi: "Vui vẻ", emoji: "😊" };
    const stats = snap.stats || { xp: 0, level: 1, nextLevelXp: 100, progressPct: 0, stageBadge: "🌱 Lv.1 Bạn Mới Đáng Yêu" };
    const inv = snap.inventory || { treats: 5, water: 5, toys: 4 };
    const needs = snap.needs || { energy: 80, hunger: 80, thirst: 80, fun: 80, bond: 50 };

    // 5 Needs Bars
    const needsBarsHtml = NEEDS_META.map(function (meta) {
      const val = Math.max(0, Math.min(100, Math.round(Number(needs[meta.key]) || 0)));
      const barColor = val < 35 ? "#ef4444" : meta.color;
      return (
        `<div class="pet-need-item" data-need-bar="${esc(meta.key)}" data-need-value="${val}">` +
        `<div class="pet-need-top">` +
        `<span>${meta.icon} ${esc(meta.labelVi)}</span>` +
        `<span style="color:${barColor}">${val}%</span>` +
        `</div>` +
        `<div class="pet-need-track">` +
        `<div class="pet-need-fill" style="width:${val}%;background:${barColor}"></div>` +
        `</div>` +
        `</div>`
      );
    }).join("");

    // 8 Interaction Buttons
    const interactionBtnsHtml = INTERACTION_BUTTONS.map(function (btn) {
      return (
        `<button type="button" class="pet-interact-btn" data-pet-interact="${esc(btn.id)}" data-pet-care="${esc(btn.id)}" data-pet-action="${esc(btn.id)}" data-pet-act="${esc(btn.id)}" ` +
        `title="${esc(btn.labelVi)} (${esc(btn.labelEn)})">` +
        `<span class="pi-ico">${btn.icon}</span>` +
        `<span class="pi-vi">${esc(btn.labelVi)}</span>` +
        `<span class="pi-en">${esc(btn.labelEn)}</span>` +
        `</button>`
      );
    }).join("");

    const dialogueBoxHtml = lastDialogueFeedback
      ? `<div class="pet-dialogue-box" data-pet-dialogue>` +
        `<div class="pdb-en">🗣️ You: “${esc(lastDialogueFeedback.playerEn)}”</div>` +
        `<div class="pdb-vi">${esc(activePet.name)}: “${esc(lastDialogueFeedback.petReplyEn)}” (${esc(lastDialogueFeedback.petReplyVi)})</div>` +
        `</div>`
      : "";

    const advApi = getAdventureApi();
    const advSession = advApi && typeof advApi.getSharedSession === "function" ? advApi.getSharedSession() : null;
    card.setAttribute("data-active-pet-id", activePet.id);
    card.setAttribute("data-visual-state", visualState);
    card.setAttribute("data-adventure-active", advSession && advSession.active ? "true" : "false");
    if (advSession && advSession.active) {
      card.classList.remove("w3d-tab-hidden");
    }

    card.innerHTML =
      `<div class="pet-home-header">` +
      `<div class="pet-home-avatar-box" id="petHomeAvatarBox" title="Bấm để mở Hồ sơ của ${esc(activePet.name)}">` +
      renderSpriteHtml(activePet.id, visualState, 78, { imgId: "petHomeSpriteImg" }) +
      `</div>` +
      `<div class="pet-home-meta">` +
      `<div class="pet-home-title-row">` +
      `<span class="pet-home-name" id="petActiveName" data-active-pet-name="${esc(activePet.name)}">${esc(activePet.name)} (${esc(activePet.speciesVi)})</span>` +
      `<span class="pet-state-badge" data-visual-state="${esc(visualState)}">${stateMeta.emoji || "🐾"} ${esc(stateMeta.labelVi)} · ${esc(visualState)}</span>` +
      `</div>` +
      `<div class="pet-level-row">` +
      `<span>${esc(stats.stageBadge || ("Lv." + stats.level))}</span>` +
      `<span>Lv.${stats.level} · ${stats.xp}/${stats.nextLevelXp} XP</span>` +
      `</div>` +
      `<div class="pet-xp-track" title="Tiến độ cấp độ thú cưng: ${stats.progressPct}%">` +
      `<div class="pet-xp-fill" style="width:${stats.progressPct}%"></div>` +
      `</div>` +
      `<div class="pet-inv-row">` +
      `<span class="pet-inv-pill" data-inv-item="treats">🍖 Treats: <b>${inv.treats}</b></span>` +
      `<span class="pet-inv-pill" data-inv-item="water">💧 Water: <b>${inv.water}</b></span>` +
      `<span class="pet-inv-pill" data-inv-item="toys">🎾 Toys: <b>${inv.toys}</b></span>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `<div class="pet-needs-grid" role="group" aria-label="5 thanh nhu cầu của thú cưng">` +
      needsBarsHtml +
      `</div>` +
      `<div class="pet-section-lbl"><span>🤗 8 Tương tác & Chăm sóc ${esc(activePet.name)}</span></div>` +
      `<div class="pet-interact-grid" role="group" aria-label="8 nút tương tác thú cưng">` +
      interactionBtnsHtml +
      `</div>` +
      dialogueBoxHtml +
      buildCollectionGridHtml(activePet.id) +
      buildAdventureHudHtml(snap);

    bindCardEvents(card, activePet);
    return card;
  }

  /* ---------- Bind Interactive Events on #petSurvivalCard ---------- */
  function bindCardEvents(card, activePet) {
    if (!card) return;
    const interApi = getInteractionApi();
    const advApi = getAdventureApi();

    const avatarBox = card.querySelector("#petHomeAvatarBox");
    if (avatarBox) {
      avatarBox.onclick = function () {
        openProfileModal(activePet.id);
      };
    }

    // 8 Interaction Buttons
    card.querySelectorAll("[data-pet-interact]").forEach(function (btn) {
      btn.onclick = function (ev) {
        if (ev && typeof ev.stopPropagation === "function") ev.stopPropagation();
        const actId = btn.getAttribute("data-pet-interact");
        if (!actId) return;

        if (interApi && typeof interApi.performInteraction === "function") {
          const res = interApi.performInteraction(actId, { source: "pet_home_card" });
          if (res && res.dialogue) {
            lastDialogueFeedback = res.dialogue;
          }
        } else if (actId === "profile") {
          openProfileModal(activePet.id);
        }
        render();
      };
    });

    // Adventure Toggle Button (#btnTogglePetAdventure)
    const toggleAdvBtn = card.querySelector("#btnTogglePetAdventure");
    if (toggleAdvBtn && advApi) {
      toggleAdvBtn.onclick = function () {
        const curSession = advApi.getSharedSession ? advApi.getSharedSession() : null;
        if (curSession && curSession.active) {
          advApi.leaveAdventure();
        } else {
          advApi.enterAdventure({ entrySource: "pet_home_card" });
        }
        render();
      };
    }

    // Adventure Speak Buttons ([data-adv-speak])
    card.querySelectorAll("[data-adv-speak]").forEach(function (btn) {
      btn.onclick = function () {
        const objId = btn.getAttribute("data-adv-speak");
        const session = advApi && advApi.getSharedSession ? advApi.getSharedSession() : null;
        const obj = session && Array.isArray(session.objectives)
          ? session.objectives.find(function (o) { return o.id === objId; })
          : null;
        if (obj && obj.sentenceEn) {
          try {
            if (root && typeof root.charSay === "function") root.charSay(obj.sentenceEn);
            if (root && typeof root.say === "function") root.say(obj.sentenceEn, 0.94);
          } catch (e) {}
        }
      };
    });

    // Adventure Complete Buttons ([data-adv-complete])
    card.querySelectorAll("[data-adv-complete]").forEach(function (btn) {
      btn.onclick = function () {
        const objId = btn.getAttribute("data-adv-complete");
        if (!objId || !advApi) return;
        if (typeof advApi.practiceObjective === "function") {
          advApi.practiceObjective(objId);
        } else if (typeof advApi.completeObjective === "function") {
          advApi.completeObjective(objId, { entrySource: "pet_home_card" });
        }
        render();
      };
    });

    // Adventure Result Buttons
    const exploreBtn = card.querySelector("#btnAdvExploreOther");
    if (exploreBtn) {
      exploreBtn.onclick = function () {
        const doc = getDoc();
        const topicBtn = doc && doc.getElementById("btnTopic");
        if (topicBtn && typeof topicBtn.click === "function") {
          topicBtn.click();
        } else if (advApi && typeof advApi.enterAdventure === "function") {
          advApi.enterAdventure({ entrySource: "adventure_result", forceNew: true });
          render();
        }
      };
    }

    const restHomeBtn = card.querySelector("#btnAdvRestHome");
    if (restHomeBtn) {
      restHomeBtn.onclick = function () {
        forceShowResult = false;
        if (advApi && typeof advApi.leaveAdventure === "function") {
          advApi.leaveAdventure();
        }
        if (interApi && typeof interApi.performInteraction === "function") {
          const res = interApi.performInteraction("rest", { source: "adventure_result" });
          if (res && res.dialogue) lastDialogueFeedback = res.dialogue;
        }
        render();
      };
    }

    // 10-Pet Collection Grid Cards ([data-pet-card])
    card.querySelectorAll(".pet-col-card[data-pet-card]").forEach(function (colBtn) {
      colBtn.onclick = function () {
        const petId = colBtn.getAttribute("data-pet-card");
        handleSelectOrPreviewPet(petId);
      };
    });

    // Open Topic Unlock Sheet button ([data-open-premium-unlock])
    card.querySelectorAll("[data-open-premium-unlock]").forEach(function (uBtn) {
      uBtn.onclick = function (ev) {
        if (ev && typeof ev.stopPropagation === "function") ev.stopPropagation();
        openTopicUnlockSheet();
      };
    });
  }

  /* ---------- Select Free Pet or Open Honest Premium Preview Modal ---------- */
  function handleSelectOrPreviewPet(petId) {
    const normId = String(petId || "milu").trim().toLowerCase();
    const rewardsApi = getRewardsApi();
    const needsApi = getNeedsApi();
    const advApi = getAdventureApi();
    const ctxApi = getContextApi();
    const interApi = getInteractionApi();

    const isUnlocked = rewardsApi && typeof rewardsApi.isPetUnlocked === "function"
      ? Boolean(rewardsApi.isPetUnlocked(normId))
      : (normId === "milu" || normId === "mochi");

    if (!isUnlocked) {
      // Premium Pet: DO NOT UNLOCK! Open Honest Preview Modal instead.
      openPremiumPreviewModal(normId);
      render();
      return {
        selected: false,
        unlocked: false,
        previewOpened: true,
        petId: normId,
        activePetId: needsApi && needsApi.getActivePetId ? needsApi.getActivePetId() : "milu"
      };
    }

    if (interApi && typeof interApi.clearVisualOverride === "function") {
      try {
        interApi.clearVisualOverride();
      } catch (e) {}
    }
    if (needsApi && typeof needsApi.setActivePetId === "function") {
      needsApi.setActivePetId(normId);
    }
    if (advApi && typeof advApi.getSharedSession === "function") {
      try {
        advApi.getSharedSession();
      } catch (e) {}
    }
    if (ctxApi && typeof ctxApi.sync === "function") {
      try {
        ctxApi.sync();
      } catch (e) {}
    }
    if (interApi && typeof interApi.refreshSceneQuickBar === "function") {
      try {
        interApi.refreshSceneQuickBar();
      } catch (e) {}
    }
    render();
    return {
      selected: true,
      unlocked: true,
      previewOpened: false,
      petId: normId,
      activePetId: normId
    };
  }

  /* ---------- Modal Helper ---------- */
  function ensureModalElements() {
    const doc = getDoc();
    if (!doc) return null;
    injectCss();
    let modal = doc.getElementById("modal");
    let mbox = doc.getElementById("mbox");
    if (!modal || !mbox) {
      modal = doc.createElement("div");
      modal.id = "modal";
      modal.className = "modal";
      mbox = doc.createElement("div");
      mbox.id = "mbox";
      mbox.className = "box";
      modal.appendChild(mbox);
      if (doc.body) doc.body.appendChild(modal);
    }
    return { doc: doc, modal: modal, mbox: mbox };
  }

  /* ---------- Premium Preview Modal (openPremiumPreviewModal) ---------- */
  function openPremiumPreviewModal(petIdOrOpts, previewStateOverride) {
    const m = ensureModalElements();
    if (!m) return false;

    const rawId = typeof petIdOrOpts === "object" && petIdOrOpts !== null
      ? (petIdOrOpts.petId || petIdOrOpts.id)
      : petIdOrOpts;
    const pet = getPetById(rawId || "boba");
    const currentState = CANONICAL_STATES.indexOf(previewStateOverride) !== -1
      ? previewStateOverride
      : "idle_happy";

    const rewardsApi = getRewardsApi();
    const needsApi = getNeedsApi();
    const entitlement = rewardsApi && typeof rewardsApi.verifyPetEntitlement === "function"
      ? rewardsApi.verifyPetEntitlement(pet.id)
      : {
          unlocked: false,
          tier: "premium",
          mode: "preview_locked",
          previewOnly: true,
          backendVerified: false,
          limitationVi: "Nhập mã mở khoá trong bảng chọn chủ đề (Mở khoá Premium) để mở toàn bộ 6 chủ đề học và cả 8 thú cưng Premium!"
        };

    const limitationText = (rewardsApi && rewardsApi.PREMIUM_LIMITATION_VI) || entitlement.limitationVi ||
      "Nhập mã mở khoá trong bảng chọn chủ đề (Mở khoá Premium) để mở toàn bộ 6 chủ đề học và cả 8 thú cưng Premium (Boba, Cookie, Pepper, Oreo, Ember, Lumi, Pip, Aqua)! Bạn cũng có thể Xem trước (Preview) đủ 10 trạng thái hoạt ảnh của thú cưng hoặc đồng hành miễn phí cùng Milu & Mochi.";

    const stateMeta = (needsApi && typeof needsApi.getStateMeta === "function")
      ? needsApi.getStateMeta(currentState)
      : { id: currentState, labelVi: currentState, emoji: "✨" };

    const statesGalleryHtml = CANONICAL_STATES.map(function (st) {
      const sm = (needsApi && typeof needsApi.getStateMeta === "function")
        ? needsApi.getStateMeta(st)
        : { id: st, labelVi: st, emoji: "🐾" };
      const isSel = st === currentState;
      return (
        `<button type="button" class="pet-state-chip ${isSel ? "is-selected" : ""}" data-preview-state="${esc(st)}">` +
        renderSpriteHtml(pet.id, st, 42) +
        `<span style="font-size:10.5px;font-weight:800;color:#0f172a">${sm.emoji || "🐾"} ${esc(sm.labelVi)}</span>` +
        `<span style="font-size:9.5px;color:#64748b">${esc(st)}</span>` +
        `</button>`
      );
    }).join("");

    m.mbox.innerHTML =
      `<div id="petPremiumPreviewModal" class="pet-modal-wrap is-open" data-pet-modal="premium_preview" data-preview-pet-id="${esc(pet.id)}" data-preview-mode="${esc(entitlement.mode || "preview_locked")}">` +
      `<div class="pet-modal-hd">` +
      `<h2>🔒 Xem trước Pet Premium: ${pet.icon || "🐾"} ${esc(pet.name)} (${esc(pet.speciesVi)})</h2>` +
      `<button type="button" class="pet-modal-close" data-close-pet-modal>✕ Đóng</button>` +
      `</div>` +
      `<div class="pet-limitation-banner" data-entitlement-guard="premium_code_unlock">` +
      `<b>👑 Mở khoá Premium (Toàn bộ Chủ đề & 8 Thú cưng Premium):</b><br>` +
      `${esc(limitationText)}` +
      `<div style="margin-top:8px">` +
      `<button type="button" class="pet-adv-btn primary" data-open-premium-unlock style="background:linear-gradient(135deg,#e8743b,#d35c24);border-color:#c44f19;font-size:12.5px;padding:7px 14px">` +
      `🔑 Mở khoá Premium (Nhập mã chủ đề)` +
      `</button>` +
      `</div>` +
      `</div>` +
      `<div class="pet-preview-hero" id="petPreviewStage">` +
      renderSpriteHtml(pet.id, currentState, 92) +
      `<div style="flex:1;min-width:180px">` +
      `<div style="font-size:16px;font-weight:800;color:#0f172a">${pet.icon || "🐾"} ${esc(pet.name)} · <span style="color:#b45309">${esc(pet.speciesVi)}</span></div>` +
      `<div style="font-size:12px;color:#475569;margin-top:3px">💬 Tính cách: ${esc(pet.personalityVi || "")}</div>` +
      `<div style="font-size:12px;color:#475569;margin-top:2px">🍖 Món yêu thích: <b>${esc(pet.favFoodVi || "")}</b> (${esc(pet.favFoodEn || "")})</div>` +
      `<div style="margin-top:6px">` +
      `<span class="pet-tier-badge is-premium">🔒 PREMIUM · CHẾ ĐỘ XEM TRƯỚC</span> ` +
      `<span class="pet-state-badge">Đang xem: ${esc(stateMeta.labelVi)} (${esc(currentState)})</span>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `<div class="pet-section-lbl"><span>🎬 Bấm để xem thử đủ 10 Trạng thái Hoạt ảnh của ${esc(pet.name)}</span></div>` +
      `<div class="pet-states-gallery">${statesGalleryHtml}</div>` +
      `<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">` +
      `<button type="button" class="pet-adv-btn primary" data-open-premium-unlock style="background:#e8743b;border-color:#d35c24">🔑 Mở khoá Premium</button>` +
      `<button type="button" class="pet-adv-btn primary" data-switch-free-pet="milu">🐕 Đồng hành cùng Milu (Miễn phí)</button>` +
      `<button type="button" class="pet-adv-btn primary" data-switch-free-pet="mochi">🐱 Đồng hành cùng Mochi (Miễn phí)</button>` +
      `<button type="button" class="pet-modal-close" data-close-pet-modal>Đóng xem trước</button>` +
      `</div>` +
      `</div>`;

    m.modal.hidden = false;

    m.mbox.querySelectorAll("[data-close-pet-modal]").forEach(function (b) {
      b.onclick = function () {
        closeModals();
      };
    });

    m.mbox.querySelectorAll("[data-open-premium-unlock]").forEach(function (b) {
      b.onclick = function () {
        openTopicUnlockSheet();
      };
    });

    m.mbox.querySelectorAll("[data-preview-state]").forEach(function (b) {
      b.onclick = function () {
        const nextSt = b.getAttribute("data-preview-state");
        openPremiumPreviewModal(pet.id, nextSt);
      };
    });

    m.mbox.querySelectorAll("[data-switch-free-pet]").forEach(function (b) {
      b.onclick = function () {
        const freeId = b.getAttribute("data-switch-free-pet");
        closeModals();
        handleSelectOrPreviewPet(freeId);
      };
    });

    return true;
  }

  /* ---------- Detailed Pet Profile Modal (openProfileModal) ---------- */
  function openProfileModal(petIdOrOpts, previewStateOverride) {
    const m = ensureModalElements();
    if (!m) return false;

    const snap = getSnapshotData();
    const rawId = typeof petIdOrOpts === "object" && petIdOrOpts !== null
      ? (petIdOrOpts.petId || petIdOrOpts.id)
      : petIdOrOpts;
    const pet = getPetById(rawId || snap.activePetId || "milu");
    const currentState = CANONICAL_STATES.indexOf(previewStateOverride) !== -1
      ? previewStateOverride
      : (snap.visualState || "idle_happy");

    const needsApi = getNeedsApi();
    const rewardsApi = getRewardsApi();
    const isFree = rewardsApi && typeof rewardsApi.isPetUnlocked === "function"
      ? Boolean(rewardsApi.isPetUnlocked(pet.id))
      : (pet.id === "milu" || pet.id === "mochi");
    const needs = snap.needs || { energy: 80, hunger: 80, thirst: 80, fun: 80, bond: 50 };
    const stats = snap.stats || { xp: 0, level: 1, nextLevelXp: 100, stageBadge: "🌱 Lv.1 Bạn Mới Đáng Yêu" };

    const statesGalleryHtml = CANONICAL_STATES.map(function (st) {
      const sm = (needsApi && typeof needsApi.getStateMeta === "function")
        ? needsApi.getStateMeta(st)
        : { id: st, labelVi: st, emoji: "🐾" };
      const isSel = st === currentState;
      return (
        `<button type="button" class="pet-state-chip ${isSel ? "is-selected" : ""}" data-profile-state="${esc(st)}">` +
        renderSpriteHtml(pet.id, st, 40) +
        `<span style="font-size:10px;font-weight:800;color:#0f172a">${sm.emoji || "🐾"} ${esc(sm.labelVi)}</span>` +
        `<span style="font-size:9px;color:#64748b">${esc(st)}</span>` +
        `</button>`
      );
    }).join("");

    const rosterHtml = getRosterList().slice(0, 10).map(function (p) {
      const pFreeTier = p.id === "milu" || p.id === "mochi";
      const pUnlocked = rewardsApi && typeof rewardsApi.isPetUnlocked === "function"
        ? Boolean(rewardsApi.isPetUnlocked(p.id))
        : pFreeTier;
      const isCur = p.id === pet.id;
      const badgeLabel = pUnlocked
        ? (pFreeTier ? "MIỄN PHÍ" : "✓ PREMIUM")
        : "🔒 Mở khoá Premium";
      return (
        `<button type="button" class="pet-modal-roster-item ${isCur ? "is-current" : ""}" data-modal-pet="${esc(p.id)}">` +
        renderSpriteHtml(p.id, "idle_happy", 38) +
        `<b style="color:#0f172a">${esc(p.name)}</b>` +
        `<span class="pet-tier-badge ${pUnlocked ? "is-free" : "is-premium"}">${badgeLabel}</span>` +
        `</button>`
      );
    }).join("");

    m.mbox.innerHTML =
      `<div id="petProfileModal" class="pet-modal-wrap is-open" data-pet-modal="profile" data-profile-pet-id="${esc(pet.id)}">` +
      `<div class="pet-modal-hd">` +
      `<h2>📋 Hồ sơ Thú cưng: ${pet.icon || "🐾"} ${esc(pet.name)} (${esc(pet.speciesVi)})</h2>` +
      `<button type="button" class="pet-modal-close" data-close-pet-modal>✕ Đóng</button>` +
      `</div>` +
      `<div class="pet-preview-hero">` +
      renderSpriteHtml(pet.id, currentState, 90) +
      `<div style="flex:1;min-width:180px">` +
      `<div style="font-size:16px;font-weight:800;color:#0f172a">${esc(pet.name)} · <span style="color:#b45309">${esc(pet.speciesVi)} (${esc(pet.speciesEn || "")})</span></div>` +
      `<div style="font-size:12px;color:#334155;margin-top:3px">🌟 Cấp độ: <b>${esc(stats.stageBadge)}</b> (${stats.xp}/${stats.nextLevelXp} XP)</div>` +
      `<div style="font-size:12px;color:#475569;margin-top:2px">💬 Tính cách: ${esc(pet.personalityVi || "")}</div>` +
      `<div style="font-size:11.5px;color:#64748b;font-style:italic">“${esc(pet.personalityEn || "")}”</div>` +
      `<div style="font-size:12px;color:#475569;margin-top:2px">🍖 Món ăn yêu thích: <b>${esc(pet.favFoodVi || "")}</b> (${esc(pet.favFoodEn || "")}) · Tiếng kêu: <b>${esc(pet.sound || "Woof!")}</b></div>` +
      `<div style="font-size:11.5px;color:#0f172a;margin-top:5px">` +
      `⚡ ${Math.round(needs.energy)}% · 🍖 ${Math.round(needs.hunger)}% · 💧 ${Math.round(needs.thirst)}% · 🎾 ${Math.round(needs.fun)}% · 💖 ${Math.round(needs.bond)}%` +
      `</div>` +
      `<div style="margin-top:5px">` +
      `<span class="pet-tier-badge ${isFree ? "is-free" : "is-premium"}">${isFree ? ((pet.id === "milu" || pet.id === "mochi") ? "MIỄN PHÍ · ĐÃ MỞ KHÓA" : "PREMIUM · ĐÃ MỞ KHÓA") : "🔒 Mở khoá Premium"}</span>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `<div class="pet-section-lbl"><span>🎬 10 Trạng thái Hoạt ảnh của ${esc(pet.name)} (Bấm để xem thử)</span></div>` +
      `<div class="pet-states-gallery">${statesGalleryHtml}</div>` +
      `<div class="pet-section-lbl"><span>🐾 Bộ sưu tập 10 Thú cưng trong Hồ sơ</span></div>` +
      `<div class="pet-modal-roster-grid">${rosterHtml}</div>` +
      `</div>`;

    m.modal.hidden = false;

    m.mbox.querySelectorAll("[data-close-pet-modal]").forEach(function (b) {
      b.onclick = function () {
        closeModals();
      };
    });

    m.mbox.querySelectorAll("[data-profile-state]").forEach(function (b) {
      b.onclick = function () {
        const nextSt = b.getAttribute("data-profile-state");
        openProfileModal(pet.id, nextSt);
      };
    });

    m.mbox.querySelectorAll("[data-modal-pet]").forEach(function (b) {
      b.onclick = function () {
        const targetId = b.getAttribute("data-modal-pet");
        const unlocked = rewardsApi && typeof rewardsApi.isPetUnlocked === "function"
          ? Boolean(rewardsApi.isPetUnlocked(targetId))
          : (targetId === "milu" || targetId === "mochi");
        if (unlocked) {
          handleSelectOrPreviewPet(targetId);
          openProfileModal(targetId, "idle_happy");
        } else {
          openPremiumPreviewModal(targetId, "idle_happy");
        }
      };
    });

    return true;
  }

  function closeModals() {
    const doc = getDoc();
    if (!doc) return;
    const modal = doc.getElementById("modal");
    const mbox = doc.getElementById("mbox");
    if (modal) modal.hidden = true;
    if (mbox) {
      const wrap = mbox.querySelector(".pet-modal-wrap");
      if (wrap) wrap.classList.remove("is-open");
    }
  }

  /* ---------- Render Both Home Card & Top Bar Pill ---------- */
  function render() {
    renderCard();
    renderTopPill();
    const interApi = getInteractionApi();
    if (interApi && typeof interApi.syncScenePet === "function") {
      try {
        interApi.syncScenePet();
      } catch (e) {}
    }
    return api;
  }

  let topicUnlockHooked = false;
  let lastTopicUnlockState = false;

  function showPremiumUnlockToast(msgText) {
    const doc = getDoc();
    if (!doc) return;
    try {
      if (typeof root.toastG === "function") {
        root.toastG(msgText);
      } else {
        const gt = doc.getElementById("guideText");
        if (gt) gt.textContent = msgText;
      }
    } catch (e) {}

    try {
      if (doc.getElementById("uitUnlockToast")) return;
      const t = doc.createElement("div");
      t.id = "uitUnlockToast";
      t.setAttribute("role", "status");
      t.style.cssText =
        "position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;" +
        "background:linear-gradient(135deg,#166534,#15803d);color:#fff;border:1.5px solid #86efac;" +
        "border-radius:999px;padding:10px 18px;font-size:13.5px;font-weight:800;" +
        "box-shadow:0 8px 24px rgba(22,101,52,0.35);display:inline-flex;align-items:center;gap:8px;pointer-events:none;";
      t.innerHTML = `<span>🎉</span><span>${esc(msgText)}</span>`;
      if (doc.body) {
        doc.body.appendChild(t);
        setTimeout(function () {
          if (t && t.parentNode) t.parentNode.removeChild(t);
        }, 4200);
      }
    } catch (e) {}
  }

  function checkAndSyncTopicUnlock() {
    const rewardsApi = getRewardsApi();
    const isNowUnlocked = rewardsApi && typeof rewardsApi.isPremiumUnlocked === "function"
      ? Boolean(rewardsApi.isPremiumUnlocked())
      : false;
    if (!lastTopicUnlockState && isNowUnlocked) {
      lastTopicUnlockState = true;
      if (root && root.ELW_UI_TOPICS && typeof root.ELW_UI_TOPICS.decorate === "function") {
        try {
          root.ELW_UI_TOPICS.decorate();
        } catch (e) {}
      }
      showPremiumUnlockToast("Đã mở khoá toàn bộ chủ đề và thú cưng Premium");
      render();
    } else {
      lastTopicUnlockState = isNowUnlocked;
    }
  }

  function bindTopicSheetUnlockWatcher() {
    if (topicUnlockHooked) return;
    const doc = getDoc();
    if (!doc) return;
    topicUnlockHooked = true;

    const rewardsApi = getRewardsApi();
    lastTopicUnlockState = rewardsApi && typeof rewardsApi.isPremiumUnlocked === "function"
      ? Boolean(rewardsApi.isPremiumUnlocked())
      : false;

    const attachToSheet = function (sh) {
      if (!sh || sh.dataset.petUiUnlockWatched === "1") return;
      sh.dataset.petUiUnlockWatched = "1";
      if (typeof MutationObserver === "function") {
        const obs = new MutationObserver(function () {
          checkAndSyncTopicUnlock();
        });
        obs.observe(sh, { childList: true, subtree: false });
      }
      sh.addEventListener("submit", function () {
        setTimeout(checkAndSyncTopicUnlock, 10);
      });
    };

    const existingSheet = doc.getElementById("topicSheet");
    if (existingSheet) {
      attachToSheet(existingSheet);
    } else if (doc.body && typeof MutationObserver === "function") {
      const bodyObs = new MutationObserver(function () {
        const found = doc.getElementById("topicSheet");
        if (found) {
          bodyObs.disconnect();
          attachToSheet(found);
        }
      });
      bodyObs.observe(doc.body, { childList: true });
    }
  }

  function bindEngineSubscriptions() {
    bindTopicSheetUnlockWatcher();
    if (subscribedEngines) return;
    subscribedEngines = true;

    const needsApi = getNeedsApi();
    if (needsApi && typeof needsApi.subscribe === "function") {
      try {
        needsApi.subscribe(function () {
          renderTopPill();
          const interApi = getInteractionApi();
          if (interApi && typeof interApi.syncScenePet === "function") {
            interApi.syncScenePet();
          }
        });
      } catch (e) {}
    }

    const followApi = (root && root.ELW_PET_FOLLOW) || (typeof window !== "undefined" ? window.ELW_PET_FOLLOW : null);
    if (followApi && typeof followApi.subscribe === "function") {
      try {
        followApi.subscribe(function (pos) {
          const interApi = getInteractionApi();
          if (interApi && typeof interApi.syncPetNeedCluster === "function") {
            interApi.syncPetNeedCluster(getDoc(), root, pos);
          }
        });
      } catch (e) {}
    }
  }

  function enrichFacade() {
    const petFacade = (root && root.ELW_PET) || (typeof window !== "undefined" ? window.ELW_PET : null);
    if (!petFacade) return;
    if (typeof petFacade.getRoster !== "function") {
      petFacade.getRoster = function () {
        return getRosterList().slice();
      };
    }
    if (typeof petFacade.getInventory !== "function") {
      petFacade.getInventory = function () {
        const n = getNeedsApi();
        return n && typeof n.getInventory === "function" ? n.getInventory() : { treats: 5, water: 5, toys: 4 };
      };
    }
    if (typeof petFacade.interact !== "function") {
      petFacade.interact = function (actId, opts) {
        if (actId === "profile") {
          openProfileModal((opts && opts.petId) || (petFacade.getActivePetId ? petFacade.getActivePetId() : "milu"));
          return { ok: true, actionId: "profile", visualState: "idle_happy" };
        }
        const inter = getInteractionApi();
        const res = inter && typeof inter.performInteraction === "function"
          ? inter.performInteraction(actId, opts)
          : { ok: true, actionId: actId };
        render();
        return res;
      };
    }
    if (typeof petFacade.performAction !== "function") {
      petFacade.performAction = petFacade.interact;
    }
    if (root && typeof root.pickTopic !== "function") {
      root.pickTopic = function (topicId) {
        const roomsObj = (root && root.ELW_ROOMS) || (typeof window !== "undefined" ? window.ELW_ROOMS : null) || {};
        const roomMap = {
          home: "living",
          park: "park",
          cafe: roomsObj.cafe_counter ? "cafe_counter" : "cafe",
          market: roomsObj.market_entrance ? "market_entrance" : "market",
          restaurant: "restaurant",
          outdoor: "outdoor",
          school: "school"
        };
        const targetRoom = roomMap[topicId] || topicId || "living";
        try {
          if (root.ELW && typeof root.ELW.state === "function") {
            const w = root.ELW.state();
            if (w) {
              w.room = targetRoom;
              w.activity = null;
              const entry =
                targetRoom === "living"
                  ? { x: 120, y: 600, d: 1 }
                  : (roomsObj[targetRoom] && roomsObj[targetRoom].entry) || null;
              if (entry) {
                w.x = entry.x;
                w.y = entry.y;
                w.dir = entry.d || 1;
              }
            }
          }
          if (typeof root.renderRoom === "function") {
            root.renderRoom();
          }
          if (typeof root.applyState === "function") {
            root.applyState();
          }
          if (root.ELW_PET_FOLLOW && typeof root.ELW_PET_FOLLOW.syncOnRoomChange === "function") {
            const w = root.ELW && typeof root.ELW.state === "function" ? root.ELW.state() : null;
            root.ELW_PET_FOLLOW.syncOnRoomChange(targetRoom, w ? w.x : undefined, w ? w.y : undefined, w ? w.dir : undefined);
          }
          if (root.ELW_TOPICS && typeof root.ELW_TOPICS.sync === "function") {
            root.ELW_TOPICS.sync();
          }
          if (root.ELW_CONTEXT && typeof root.ELW_CONTEXT.refresh === "function") {
            root.ELW_CONTEXT.refresh();
          }
          const adv = getAdventureApi();
          if (adv && typeof adv.onWorldAction === "function") {
            adv.onWorldAction("go_" + (topicId === "home" ? "home" : targetRoom), { room: targetRoom });
          }
        } catch (e) {}
        render();
        return targetRoom;
      };
    }
  }

  function init() {
    injectCss();
    enrichFacade();
    bindEngineSubscriptions();
    render();
    return api;
  }

  const api = Object.freeze({
    CARD_ID: CARD_ID,
    MINI_HUD_ID: MINI_HUD_ID,
    ADV_HUD_ID: ADV_HUD_ID,
    ADV_RESULT_ID: ADV_RESULT_ID,
    COLLECTION_GRID_ID: COLLECTION_GRID_ID,
    CANONICAL_PET_IDS: CANONICAL_PET_IDS,
    CANONICAL_STATES: CANONICAL_STATES,
    NEEDS_META: NEEDS_META,
    INTERACTION_BUTTONS: INTERACTION_BUTTONS,
    init: init,
    render: render,
    refresh: render,
    renderCard: renderCard,
    renderTopPill: renderTopPill,
    openProfileModal: openProfileModal,
    openPremiumPreviewModal: openPremiumPreviewModal,
    openTopicUnlockSheet: openTopicUnlockSheet,
    closeModals: closeModals,
    selectPet: handleSelectOrPreviewPet
  });

  return api;
});
