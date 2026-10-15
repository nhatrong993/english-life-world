/* English Life World — modules/pet-survival.js
   Agent A6: Unified Pet Companion & Adventure Facade (window.ELW_PET & module.exports).
   Connects ELW_PET_REWARDS, ELW_PET_NEEDS, ELW_PET_INTERACTION, ELW_PET_ADVENTURE, and ELW_PET_UI.
   Guarantees:
   - Zero countdown penalty (-15⭐ removed completely)
   - Zero background setInterval decay (purely timestamp-driven with capped offline floor)
   - Full 10 Pets & 10 States roster exposed */
(function (root, factory) {
  "use strict";
  const api = factory(root);
  if (typeof window !== "undefined") {
    window.ELW_PET = api;
  }
  if (root && typeof root === "object") {
    root.ELW_PET = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function (root) {
  "use strict";

  function getRewards() {
    return (root && root.ELW_PET_REWARDS) || (typeof window !== "undefined" ? window.ELW_PET_REWARDS : null);
  }

  function getNeedsEngine() {
    return (root && root.ELW_PET_NEEDS) || (typeof window !== "undefined" ? window.ELW_PET_NEEDS : null);
  }

  function getInteractionEngine() {
    return (root && root.ELW_PET_INTERACTION) || (typeof window !== "undefined" ? window.ELW_PET_INTERACTION : null);
  }

  function getAdventureEngine() {
    return (root && root.ELW_PET_ADVENTURE) || (typeof window !== "undefined" ? window.ELW_PET_ADVENTURE : null);
  }

  function getUiEngine() {
    return (root && root.ELW_PET_UI) || (typeof window !== "undefined" ? window.ELW_PET_UI : null);
  }

  function refreshUi() {
    const ui = getUiEngine();
    if (ui && typeof ui.render === "function") {
      try {
        ui.render();
      } catch (e) {}
    }
  }

  function renderCard() {
    const ui = getUiEngine();
    if (ui && typeof ui.renderCard === "function") {
      return ui.renderCard();
    }
    return null;
  }

  function renderTopPill() {
    const ui = getUiEngine();
    if (ui && typeof ui.renderTopPill === "function") {
      return ui.renderTopPill();
    }
    return null;
  }

  function performAction(actionId, opts) {
    const inter = getInteractionEngine();
    const options = Object.assign({ source: "pet_facade" }, opts || {});
    let res = null;
    if (inter && typeof inter.performInteraction === "function") {
      res = inter.performInteraction(actionId, options);
    }
    refreshUi();
    return res;
  }

  function feedPet(opts) {
    return performAction("feed", opts);
  }

  function playWithPet(opts) {
    return performAction("play", opts);
  }

  function waterPet(opts) {
    return performAction("water", opts);
  }

  function restPet(opts) {
    return performAction("rest", opts);
  }

  function talkPet(opts) {
    return performAction("talk", opts);
  }

  function petCuddle(opts) {
    return performAction("pet", opts);
  }

  function walkPet(opts) {
    return performAction("walk", opts);
  }

  function openProfile(petId) {
    const ui = getUiEngine();
    if (ui && typeof ui.openProfileModal === "function") {
      return ui.openProfileModal(petId || getActivePetId());
    }
    return performAction("profile", { petId: petId });
  }

  function onPractice(xpGain) {
    const needs = getNeedsEngine();
    const amount = Math.max(1, Math.floor(Number(xpGain) || 2));
    if (needs) {
      try {
        if (typeof needs.addXp === "function") needs.addXp(amount);
        if (typeof needs.applyNeedDelta === "function") needs.applyNeedDelta({ fun: 2, bond: 1 });
      } catch (e) {}
    }
    renderTopPill();
  }

  function selectPet(petId) {
    const ui = getUiEngine();
    if (ui && typeof ui.selectPet === "function") {
      return ui.selectPet(petId);
    }
    const needs = getNeedsEngine();
    if (needs && typeof needs.setActivePetId === "function") {
      const ok = needs.setActivePetId(petId);
      refreshUi();
      return { selected: ok, unlocked: ok, petId: getActivePetId() };
    }
    return { selected: false, unlocked: false, petId: "milu" };
  }

  function getActivePetId() {
    const needs = getNeedsEngine();
    if (needs && typeof needs.getActivePetId === "function") {
      return needs.getActivePetId();
    }
    return "milu";
  }

  function getActivePet() {
    const needs = getNeedsEngine();
    if (needs && typeof needs.getActivePet === "function") {
      return needs.getActivePet();
    }
    return { id: "milu", name: "Milu", speciesVi: "Cún Lông Xù Vàng", icon: "🐕", tier: "free", free: true };
  }

  function getNeeds(nowMs) {
    const needs = getNeedsEngine();
    if (needs && typeof needs.getNeeds === "function") {
      return needs.getNeeds(nowMs);
    }
    return { energy: 80, hunger: 80, thirst: 80, fun: 80, bond: 50, lastUpdatedAt: Date.now() };
  }

  function simulateElapsed(ms) {
    const needs = getNeedsEngine();
    let updated = null;
    if (needs && typeof needs.simulateElapsed === "function") {
      updated = needs.simulateElapsed(ms);
    }
    refreshUi();
    return updated;
  }

  function enterAdventure(opts) {
    const adv = getAdventureEngine();
    let session = null;
    if (adv && typeof adv.enterAdventure === "function") {
      session = adv.enterAdventure(opts);
    }
    refreshUi();
    return session;
  }

  function leaveAdventure(opts) {
    const adv = getAdventureEngine();
    let session = null;
    if (adv && typeof adv.leaveAdventure === "function") {
      session = adv.leaveAdventure(opts);
    }
    refreshUi();
    return session;
  }

  function completeObjective(objId, payload) {
    const adv = getAdventureEngine();
    let res = null;
    if (adv && typeof adv.completeObjective === "function") {
      res = adv.completeObjective(objId, payload);
    }
    refreshUi();
    return res;
  }

  function getUnifiedState(ctxOverride) {
    const adv = getAdventureEngine();
    if (adv && typeof adv.getUnifiedSystemState === "function") {
      return adv.getUnifiedSystemState(ctxOverride);
    }
    const snap = getStateSnapshot();
    return {
      activePetId: snap.activePetId,
      adventureSession: null,
      context: { place: "home", zone: "living", weather: "sunny", situation: "normal", withPet: false },
      validator: null,
      needs: snap.needs,
      inventory: snap.inventory,
      dialogue: [],
      rewardLedger: {}
    };
  }

  function verifyPetEntitlement(petId) {
    const rewards = getRewards();
    if (rewards && typeof rewards.verifyPetEntitlement === "function") {
      return rewards.verifyPetEntitlement(petId);
    }
    const norm = String(petId || "").trim().toLowerCase();
    const isFree = norm === "milu" || norm === "mochi";
    return {
      unlocked: isFree,
      tier: isFree ? "free" : "premium",
      mode: isFree ? "full" : "preview_locked",
      previewOnly: !isFree,
      backendVerified: isFree
    };
  }

  function isPetUnlocked(petId) {
    const rewards = getRewards();
    if (rewards && typeof rewards.isPetUnlocked === "function") {
      return rewards.isPetUnlocked(petId);
    }
    const norm = String(petId || "").trim().toLowerCase();
    return norm === "milu" || norm === "mochi";
  }

  function claimObjectiveReward(objectiveKey, rewardSpec) {
    const rewards = getRewards();
    let res = { granted: false, duplicate: false, objectiveKey: String(objectiveKey || "") };
    if (rewards && typeof rewards.claimObjectiveReward === "function") {
      res = rewards.claimObjectiveReward(objectiveKey, rewardSpec);
    }
    refreshUi();
    return res;
  }

  function onMissionSuccess() {
    // Positive-only reward when a story mission finishes (no countdown lock or penalty)
    const needs = getNeedsEngine();
    if (needs) {
      try {
        if (typeof needs.addInventory === "function") needs.addInventory({ treats: 1, water: 1 });
        if (typeof needs.addXp === "function") needs.addXp(15);
        if (typeof needs.applyNeedDelta === "function") needs.applyNeedDelta({ fun: 8, bond: 4 });
      } catch (e) {}
    }
    refreshUi();
  }

  function applyPenalty() {
    // Strictly a safe no-op: no star deduction, no need reduction, no punishment for quitting!
    return { penalized: false, reason: "penalties_disabled_by_design" };
  }

  function getStateSnapshot() {
    const needs = getNeedsEngine();
    const snap = (needs && typeof needs.getSnapshot === "function")
      ? needs.getSnapshot()
      : {
          activePetId: "milu",
          activePet: getActivePet(),
          needs: getNeeds(),
          visualState: "idle_happy",
          inventory: { treats: 5, water: 5, toys: 4 },
          stats: { xp: 0, level: 1, streak: 1, stageBadge: "🌱 Lv.1 Bạn Mới Đáng Yêu" }
        };

    const adv = getAdventureEngine();
    const session = (adv && typeof adv.getSharedSession === "function") ? adv.getSharedSession() : null;

    return {
      activePetId: snap.activePetId,
      petId: snap.activePetId,
      activePet: snap.activePet,
      needs: snap.needs,
      energy: snap.needs.energy,
      hunger: snap.needs.hunger,
      thirst: snap.needs.thirst,
      fun: snap.needs.fun,
      bond: snap.needs.bond,
      mood: snap.needs.fun,
      visualState: snap.visualState,
      inventory: snap.inventory,
      treats: snap.inventory.treats,
      water: snap.inventory.water,
      toys: snap.inventory.toys,
      stats: snap.stats,
      xp: snap.stats.xp,
      level: snap.stats.level,
      streak: snap.stats.streak,
      adventureSession: session
    };
  }

  function init() {
    const rewards = getRewards();
    if (rewards && typeof rewards.enforceEntitlementIntegrity === "function") {
      try {
        rewards.enforceEntitlementIntegrity();
      } catch (e) {}
    }

    const needs = getNeedsEngine();
    if (needs && typeof needs.load === "function") {
      try {
        needs.load();
      } catch (e) {}
    }

    const inter = getInteractionEngine();
    if (inter && typeof inter.init === "function") {
      try {
        inter.init();
      } catch (e) {}
    }

    const adv = getAdventureEngine();
    if (adv && typeof adv.init === "function") {
      try {
        adv.init();
      } catch (e) {}
    }

    const ui = getUiEngine();
    if (ui && typeof ui.init === "function") {
      try {
        ui.init();
      } catch (e) {}
    }

    return api;
  }

  const api = {
    get PETS() {
      const n = getNeedsEngine();
      return (n && n.PETS) || {};
    },
    get PET_LIST() {
      const n = getNeedsEngine();
      return (n && n.PET_LIST) || [];
    },
    get STATES() {
      const n = getNeedsEngine();
      return (n && n.STATES) || [];
    },
    init: init,
    feedPet: feedPet,
    playWithPet: playWithPet,
    waterPet: waterPet,
    restPet: restPet,
    talkPet: talkPet,
    petCuddle: petCuddle,
    walkPet: walkPet,
    openProfile: openProfile,
    onPractice: onPractice,
    onMissionSuccess: onMissionSuccess,
    applyPenalty: applyPenalty,
    selectPet: selectPet,
    getActivePetId: getActivePetId,
    getActivePet: getActivePet,
    getNeeds: getNeeds,
    simulateElapsed: simulateElapsed,
    enterAdventure: enterAdventure,
    leaveAdventure: leaveAdventure,
    completeObjective: completeObjective,
    getUnifiedState: getUnifiedState,
    verifyPetEntitlement: verifyPetEntitlement,
    isPetUnlocked: isPetUnlocked,
    claimObjectiveReward: claimObjectiveReward,
    renderCard: renderCard,
    renderTopPill: renderTopPill,
    state: getStateSnapshot
  };

  return api;
});
