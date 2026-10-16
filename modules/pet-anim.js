/* ==========================================================================
   English Life World — Pet Animation, Stage Visuals & Ceremony Engine (Agent B)
   File: modules/pet-anim.js
   Scope:
     - STRICT DOM boundary: ONLY mutates classes & inline transform on #catHop
       (and optional helper attributes on #catScale), plus sprite state/stage
       attributes on #roomPetImg / #o-cat, and non-blocking ceremony overlays.
     - NEVER mutates #catPos or #catFlip (owned by modules/pet-follow.js).
     - Stage-aware sprite selection (5 stages: baby, young, teen, adult, elite)
       via ELW_PET_NEEDS.getAssetPath(petId, state, stage) or stage fallback.
     - Stage-coupled gait & cadence (baby short wobbly steps, teen agile bouncy,
       adult/elite smooth composed stride).
     - 4-phase playStageUpCeremony(petId, newStage):
         1) Glow (sáng lên)
         2) Sparkle particles (hạt lấp lánh)
         3) Sprite & scale morph (đổi hình theo stage mới)
         4) Non-blocking toast ("Milu đã lớn lên: Teen!")
     - Subscribes to 'stage-up' from ELW_PET_NEEDS.subscribe & window events.
     - Full prefers-reduced-motion compliance.
   ========================================================================== */
(function () {
  "use strict";

  var STYLE_ID = "elw-pet-anim-a3-styles";

  var VALID_STATES = [
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
  ];

  var VALID_STAGES = ["baby", "young", "teen", "adult", "elite"];

  var STAGE_BY_LEVEL = {
    1: "baby",
    2: "young",
    3: "teen",
    4: "adult",
    5: "elite"
  };

  var LEVEL_BY_STAGE = {
    baby: 1,
    young: 2,
    teen: 3,
    adult: 4,
    elite: 5
  };

  var STAGE_SCALES = Object.freeze({
    baby: 0.78,
    young: 0.88,
    teen: 0.96,
    adult: 1.04,
    elite: 1.12
  });

  var failedStageAssets = Object.create(null);

  var STAGE_TITLES = {
    baby: "Baby",
    young: "Young",
    teen: "Teen",
    adult: "Adult",
    elite: "Elite"
  };

  var PET_DISPLAY_NAMES = {
    milu: "Milu",
    boba: "Boba",
    cookie: "Cookie",
    mochi: "Mochi",
    pepper: "Pepper",
    oreo: "Oreo",
    ember: "Ember",
    lumi: "Lumi",
    pip: "Pip",
    aqua: "Aqua"
  };

  // Stage-specific gait profiles:
  // - baby: short wobbly rapid steps (bước ngắn lon ton)
  // - young: lively curious trot
  // - teen: agile energetic bounce (nhanh nhẹn)
  // - adult: smooth balanced stride (mượt)
  // - elite: regal composed glide (mượt & uy nghi)
  var STAGE_GAIT_PROFILES = {
    baby: {
      id: "baby",
      label: "wobbly-short",
      freqMult: 1.35,
      ampMult: 0.76,
      tiltMult: 1.38,
      squashMult: 1.24,
      waddleSway: 2.1,
      idleFreqMult: 1.22,
      idleAmpMult: 1.12
    },
    young: {
      id: "young",
      label: "lively-trot",
      freqMult: 1.16,
      ampMult: 0.92,
      tiltMult: 1.14,
      squashMult: 1.1,
      waddleSway: 1.0,
      idleFreqMult: 1.1,
      idleAmpMult: 1.05
    },
    teen: {
      id: "teen",
      label: "agile-bouncy",
      freqMult: 1.12,
      ampMult: 1.18,
      tiltMult: 1.12,
      squashMult: 1.15,
      waddleSway: 0.4,
      idleFreqMult: 1.08,
      idleAmpMult: 1.08
    },
    adult: {
      id: "adult",
      label: "smooth-stride",
      freqMult: 0.94,
      ampMult: 0.95,
      tiltMult: 0.84,
      squashMult: 0.86,
      waddleSway: 0.0,
      idleFreqMult: 0.95,
      idleAmpMult: 0.96
    },
    elite: {
      id: "elite",
      label: "regal-glide",
      freqMult: 0.9,
      ampMult: 0.92,
      tiltMult: 0.76,
      squashMult: 0.8,
      waddleSway: 0.0,
      idleFreqMult: 0.92,
      idleAmpMult: 0.94
    }
  };

  var DEFAULT_PET_ID = "milu";
  var STOP_MOMENTUM_MS = 220;

  var initialized = false;
  var rafId = 0;
  var unsubscribeFollow = null;
  var unsubscribeNeedsStageUp = null;
  var unsubscribeNeedsAll = null;
  var unsubscribeInteraction = null;
  var stageAssetsRegistered = false;
  var lastFollowTickTs = 0;
  var lastFallbackTickTs = 0;

  var stepPhase = 0;
  var idleClock = 0;
  var lastMode = "idle";
  var stopStartTs = 0;
  var runStartTs = 0;

  var reducedMotionOverride = null;
  var manualStageOverride = null;
  var lastSeenDirectStage = null;
  var lastSeenRawV2 = null;
  var lastSeenNeedsStage = null;
  var lastCeremonyDedupeKey = "";
  var lastCeremonyTs = 0;
  var ceremonyTimers = [];

  var activeEmotion = {
    type: null,
    startTs: 0,
    untilTs: 0,
    durationMs: 0
  };

  var activeCeremony = {
    active: false,
    petId: "milu",
    stage: "adult",
    phase: 0,
    startTs: 0,
    untilTs: 0,
    toastText: ""
  };

  var currentAnimState = {
    mode: "idle",
    speed: 0,
    hopY: 0,
    tiltDeg: 0,
    scaleX: 1,
    scaleY: 1,
    stepPhase: 0,
    idleClock: 0,
    visualState: "idle_happy",
    activePetId: DEFAULT_PET_ID,
    stage: "adult",
    gait: "smooth-stride",
    srcPath: "assets/pets/milu/adult/idle_happy.png",
    emotionType: null,
    ceremonyActive: false,
    reducedMotion: false,
    transform: "translate(0px, 0px) rotate(0deg) scale(1, 1)"
  };

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function round2(val) {
    return Math.round((Number(val) || 0) * 100) / 100;
  }

  function round3(val) {
    return Math.round((Number(val) || 0) * 1000) / 1000;
  }

  function normalizeStage(s) {
    if (typeof s === "number" && STAGE_BY_LEVEL[s]) return STAGE_BY_LEVEL[s];
    var raw = String(s || "").toLowerCase().trim();
    if (VALID_STAGES.indexOf(raw) !== -1) return raw;
    if (raw === "bonded" || raw === "legend") return "elite";
    var num = parseInt(raw, 10);
    if (STAGE_BY_LEVEL[num]) return STAGE_BY_LEVEL[num];
    return null;
  }

  function ensureMiluStageAssetsRegistered() {
    if (stageAssetsRegistered) return;
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_NEEDS &&
      typeof window.ELW_PET_NEEDS.registerStageAssets === "function"
    ) {
      try {
        var paths = [];
        for (var i = 0; i < VALID_STAGES.length; i++) {
          var stg = VALID_STAGES[i];
          for (var j = 0; j < VALID_STATES.length; j++) {
            var st = VALID_STATES[j];
            paths.push("assets/pets/milu/" + stg + "/" + st + ".png");
          }
        }
        window.ELW_PET_NEEDS.registerStageAssets(paths);
        stageAssetsRegistered = true;
      } catch (_err) {}
    }
  }

  function injectStyles() {
    if (typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#catHop {",
      "  transform-box: fill-box;",
      "  transform-origin: 50% 88%;",
      "  will-change: transform;",
      "}",
      "#catHop.elw-pet-anim-reduced {",
      "  transform: translate(0px, 0px) rotate(0deg) scale(1, 1) !important;",
      "  transition: none !important;",
      "  animation: none !important;",
      "}",
      "#catHop.elw-pet-mode-walk,",
      "#catHop.elw-pet-mode-run,",
      "#catHop.elw-pet-mode-stop,",
      "#catHop.elw-pet-mode-idle {",
      "  transition: filter 180ms ease;",
      "}",
      "#catHop.elw-pet-emotion-love #roomPetImg,",
      "#catHop.elw-pet-emotion-happy #roomPetImg,",
      "#catHop.elw-pet-emotion-play #roomPetImg {",
      "  filter: drop-shadow(0 6px 10px rgba(255, 122, 162, 0.35));",
      "}",
      "#catHop.elw-pet-emotion-like #roomPetImg {",
      "  filter: drop-shadow(0 5px 8px rgba(255, 196, 86, 0.32));",
      "}",
      "#catHop.elw-pet-emotion-curious #roomPetImg {",
      "  filter: drop-shadow(0 5px 8px rgba(96, 182, 255, 0.3));",
      "}",
      "#catHop.elw-pet-tired #roomPetImg {",
      "  filter: saturate(0.88) brightness(0.96);",
      "}",
      "#catHop.elw-pet-ceremony-glow #roomPetImg {",
      "  filter: drop-shadow(0 0 14px rgba(255, 212, 59, 0.95)) drop-shadow(0 0 26px rgba(255, 168, 0, 0.65)) brightness(1.14) !important;",
      "}",
      ".elw-pet-stage-sparkles {",
      "  position: fixed;",
      "  pointer-events: none !important;",
      "  z-index: 9998;",
      "  width: 140px;",
      "  height: 140px;",
      "  transform: translate(-50%, -65%);",
      "}",
      ".elw-pet-stage-sparkle {",
      "  position: absolute;",
      "  pointer-events: none !important;",
      "  font-size: 16px;",
      "  line-height: 1;",
      "  color: #FFD43B;",
      "  text-shadow: 0 0 8px rgba(255, 212, 59, 0.95), 0 0 14px rgba(255, 138, 0, 0.8);",
      "  animation: elwPetSparkleFloat 1100ms ease-out forwards;",
      "}",
      ".elw-pet-stage-sparkles.is-reduced .elw-pet-stage-sparkle {",
      "  animation: none !important;",
      "  opacity: 0.95;",
      "}",
      "@keyframes elwPetSparkleFloat {",
      "  0% { transform: translate(0, 0) scale(0.5); opacity: 0; }",
      "  25% { opacity: 1; transform: translate(calc(var(--dx, 0px) * 0.4), calc(var(--dy, -20px) * 0.4)) scale(1.18); }",
      "  100% { opacity: 0; transform: translate(var(--dx, 0px), var(--dy, -36px)) scale(0.75); }",
      "}",
      ".elw-pet-stage-toast {",
      "  position: fixed;",
      "  top: 16px;",
      "  left: 50%;",
      "  transform: translateX(-50%);",
      "  pointer-events: none !important;",
      "  z-index: 9999;",
      "  background: linear-gradient(135deg, #FFF9DB 0%, #FFF3BF 55%, #FFE066 100%);",
      "  color: #5C3C00;",
      "  border: 2px solid #FAB005;",
      "  border-radius: 999px;",
      "  padding: 8px 18px;",
      "  font-family: inherit;",
      "  font-size: 15px;",
      "  font-weight: 800;",
      "  box-shadow: 0 8px 24px rgba(245, 159, 0, 0.32), 0 2px 6px rgba(0, 0, 0, 0.12);",
      "  display: inline-flex;",
      "  align-items: center;",
      "  gap: 8px;",
      "  max-width: min(92vw, 360px);",
      "  white-space: nowrap;",
      "  animation: elwPetToastPop 260ms cubic-bezier(0.2, 0.9, 0.3, 1.15);",
      "}",
      ".elw-pet-stage-toast.is-mission-safe {",
      "  top: 10px;",
      "  font-size: 14px;",
      "  padding: 6px 14px;",
      "}",
      ".elw-pet-stage-toast.is-reduced {",
      "  animation: none !important;",
      "  transition: none !important;",
      "}",
      "@keyframes elwPetToastPop {",
      "  0% { opacity: 0; transform: translate(-50%, -10px) scale(0.92); }",
      "  100% { opacity: 1; transform: translate(-50%, 0px) scale(1); }",
      "}"
    ].join("\n");

    (document.head || document.documentElement).appendChild(style);
  }

  function isReducedMotion() {
    if (typeof reducedMotionOverride === "boolean") {
      return reducedMotionOverride;
    }
    if (typeof window !== "undefined") {
      if (window.__ELW_FORCE_REDUCED_MOTION === true) return true;
      if (window.__ELW_FORCE_REDUCED_MOTION === false) return false;
      if (
        window.ELW_PET_INTERACTION &&
        typeof window.ELW_PET_INTERACTION.isReducedMotion === "function"
      ) {
        try {
          if (window.ELW_PET_INTERACTION.isReducedMotion()) return true;
        } catch (_err) {}
      }
      if (typeof window.matchMedia === "function") {
        try {
          return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (_err2) {}
      }
    }
    return false;
  }

  function isMissionActive() {
    if (typeof window === "undefined") return false;
    try {
      if (window.ELW && window.ELW.curAct) return true;
      if (
        window.ELW_ROLEPLAY &&
        typeof window.ELW_ROLEPLAY.isActive === "function" &&
        window.ELW_ROLEPLAY.isActive()
      ) {
        return true;
      }
      if (typeof document !== "undefined") {
        var rpModal = document.getElementById("rpModal") || document.getElementById("ltModal");
        if (rpModal && rpModal.offsetParent !== null) return true;
      }
    } catch (_err) {}
    return false;
  }

  function getActivePetId() {
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_NEEDS &&
      typeof window.ELW_PET_NEEDS.getActivePetId === "function"
    ) {
      try {
        var nid = window.ELW_PET_NEEDS.getActivePetId();
        if (nid) return String(nid);
      } catch (_e) {}
    }
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_PERSONALITY &&
      typeof window.ELW_PET_PERSONALITY.getActivePetId === "function"
    ) {
      try {
        var id = window.ELW_PET_PERSONALITY.getActivePetId();
        if (id) return String(id);
      } catch (_e2) {}
    }
    var oCat = typeof document !== "undefined" ? document.getElementById("o-cat") : null;
    if (oCat) {
      var attrPet = oCat.getAttribute("data-pet-id");
      if (attrPet) return attrPet;
    }
    return "milu";
  }

  function extractStageFromStorageObj(parsed, petId) {
    if (!parsed || typeof parsed !== "object") return null;
    var maps = [
      parsed.byPetId,
      parsed.petProgress,
      parsed.pets,
      parsed.byPet,
      parsed.progress,
      parsed.petStates
    ];
    for (var i = 0; i < maps.length; i++) {
      var m = maps[i];
      if (m && typeof m === "object" && m[petId] && typeof m[petId] === "object") {
        var entry = m[petId];
        var st = normalizeStage(entry.stage || entry.stageId || entry.level);
        if (st) return st;
      }
    }
    if (parsed.stage) {
      var topSt = normalizeStage(parsed.stage);
      if (topSt) return topSt;
    }
    if (parsed.stats && typeof parsed.stats === "object") {
      if (parsed.stats.stage) {
        var statSt = normalizeStage(parsed.stats.stage);
        if (statSt) return statSt;
      }
      if (parsed.stats.level !== undefined && parsed.stats.xp !== undefined) {
        if (Number(parsed.stats.level) > 1 || parsed.stats.stageSpecified) {
          var lvlSt = normalizeStage(parsed.stats.level);
          if (lvlSt) return lvlSt;
        }
      }
    }
    return null;
  }

  function resolveCurrentStage(petIdArg) {
    // 1. Detect external localStorage changes BEFORE calling ELW_PET_NEEDS methods that might save()
    try {
      if (typeof localStorage !== "undefined") {
        var directStage = localStorage.getItem("elw_pet_stage");
        var rawV2 = localStorage.getItem("elw_pet_needs_v2") || "";
        var isInitial = lastSeenRawV2 === null && lastSeenDirectStage === null;

        if (directStage !== lastSeenDirectStage) {
          lastSeenDirectStage = directStage;
          if (directStage && normalizeStage(directStage)) {
            manualStageOverride = normalizeStage(directStage);
          } else {
            manualStageOverride = null;
          }
        }

        if (rawV2 !== lastSeenRawV2) {
          if (!isInitial && rawV2) {
            if (
              typeof window !== "undefined" &&
              window.ELW_PET_NEEDS &&
              typeof window.ELW_PET_NEEDS.load === "function"
            ) {
              try {
                window.ELW_PET_NEEDS.load();
              } catch (_eLoad) {}
            }
            lastSeenRawV2 = localStorage.getItem("elw_pet_needs_v2") || rawV2;
            try {
              var parsed = JSON.parse(rawV2);
              var pidGuess = petIdArg || (parsed && parsed.activePetId) || "milu";
              var fromStore = extractStageFromStorageObj(parsed, pidGuess);
              if (fromStore) {
                manualStageOverride = fromStore;
              }
            } catch (_eParse) {}
          } else {
            lastSeenRawV2 = rawV2;
          }
        }
      }
    } catch (_eStorage) {}

    var petId = petIdArg || getActivePetId();

    // 2. Check ELW_PET_NEEDS.getPetProgress(petId) if available
    if (typeof window !== "undefined" && window.ELW_PET_NEEDS) {
      try {
        if (typeof window.ELW_PET_NEEDS.getPetProgress === "function") {
          var prog = window.ELW_PET_NEEDS.getPetProgress(petId);
          var progStage = prog && normalizeStage(prog.stage || prog.stageId);
          if (progStage) {
            if (progStage !== lastSeenNeedsStage) {
              lastSeenNeedsStage = progStage;
              if (!localStorage.getItem("elw_pet_stage")) {
                manualStageOverride = null;
              }
            }
            if (!manualStageOverride) return progStage;
          }
        }
        if (typeof window.ELW_PET_NEEDS.getStage === "function") {
          var stGetter = normalizeStage(window.ELW_PET_NEEDS.getStage(petId));
          if (stGetter && !manualStageOverride) return stGetter;
        }
      } catch (_eNeeds) {}
    }

    if (manualStageOverride) return manualStageOverride;

    // 3. Check ELW_PET_FOLLOW stage if set
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_FOLLOW &&
      typeof window.ELW_PET_FOLLOW.getStage === "function"
    ) {
      try {
        var followSt = normalizeStage(window.ELW_PET_FOLLOW.getStage());
        if (followSt) return followSt;
      } catch (_eFollow) {}
    }

    // 4. LocalStorage fallback
    try {
      if (typeof localStorage !== "undefined") {
        var directSt = normalizeStage(localStorage.getItem("elw_pet_stage"));
        if (directSt) return directSt;
        var rawV2Fallback = localStorage.getItem("elw_pet_needs_v2");
        if (rawV2Fallback) {
          var parsedFallback = JSON.parse(rawV2Fallback);
          var fromStoreFallback = extractStageFromStorageObj(parsedFallback, petId);
          if (fromStoreFallback) return fromStoreFallback;
        }
      }
    } catch (_eFallback) {}

    return "adult";
  }

  function hasStageAssetAvailable(petId, stage, stateName) {
    var stagePath = "assets/pets/" + petId + "/" + stage + "/" + stateName + ".png";
    if (failedStageAssets[stagePath]) return false;

    if (typeof window !== "undefined") {
      var assets = window.ELW_PET_ASSETS || window.ELW_EMBEDDED_PET_ASSETS;
      if (assets && typeof assets === "object") {
        if (Object.prototype.hasOwnProperty.call(assets, stagePath) && assets[stagePath]) {
          return true;
        }
        if (assets[petId] && typeof assets[petId] === "object" && assets[petId][stage] && assets[petId][stage][stateName]) {
          return true;
        }
      }

      var manifest = window.ELW_PET_MANIFEST || window.PET_MANIFEST;
      if (Array.isArray(manifest)) {
        for (var i = 0; i < manifest.length; i++) {
          var e = manifest[i];
          if (e && (e === stagePath || e.assetPath === stagePath || (e.petId === petId && e.stage === stage && e.state === stateName))) {
            return true;
          }
        }
      } else if (manifest && typeof manifest === "object") {
        if (manifest[stagePath]) return true;
        if (Array.isArray(manifest.entries)) {
          for (var j = 0; j < manifest.entries.length; j++) {
            var it = manifest.entries[j];
            if (it && (it === stagePath || it.assetPath === stagePath || (it.petId === petId && it.stage === stage && it.state === stateName))) {
              return true;
            }
          }
        }
      }

      if (!assets && window.location && /^https?:$/i.test(window.location.protocol || "")) {
        return true;
      }
    }

    if (petId === "milu") return true;
    return false;
  }

  function resolveStageAssetPath(petId, stateName, stageName) {
    ensureMiluStageAssetsRegistered();
    var validState = VALID_STATES.indexOf(stateName) !== -1 ? stateName : "idle_happy";
    var validStage = normalizeStage(stageName) || resolveCurrentStage(petId) || "adult";
    var cleanPetId = String(petId || "milu").toLowerCase().trim();
    var stagePath = "assets/pets/" + cleanPetId + "/" + validStage + "/" + validState + ".png";

    if (hasStageAssetAvailable(cleanPetId, validStage, validState)) {
      return stagePath;
    }

    // Check ELW_PET_NEEDS.getAssetPath(petId, state, stage) if available
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_NEEDS &&
      typeof window.ELW_PET_NEEDS.getAssetPath === "function"
    ) {
      try {
        var fromNeeds = window.ELW_PET_NEEDS.getAssetPath(cleanPetId, validState, validStage);
        if (typeof fromNeeds === "string" && fromNeeds.length > 0 && !failedStageAssets[fromNeeds]) {
          return fromNeeds;
        }
      } catch (_err) {}
    }

    return "assets/pets/" + cleanPetId + "/" + validState + ".png";
  }

  function applyStageScaleToCatScale(stageArg) {
    if (typeof document === "undefined") return 1.04;
    var stage = normalizeStage(stageArg) || resolveCurrentStage() || "adult";
    var sScale = STAGE_SCALES[stage] || 1.04;
    var y = 485;
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_FOLLOW &&
      window.ELW_PET_FOLLOW.state &&
      Number.isFinite(window.ELW_PET_FOLLOW.state.y)
    ) {
      y = window.ELW_PET_FOLLOW.state.y;
    } else {
      var catPos = document.getElementById("catPos");
      if (catPos && catPos.style && catPos.style.transform) {
        var m = catPos.style.transform.match(/translate\(\s*[-\d.]+px\s*,\s*([-\d.]+)px\s*\)/i);
        if (m && Number.isFinite(parseFloat(m[1]))) y = parseFloat(m[1]);
      }
    }
    var baseScale = 0.95 + ((y - 330) / 310) * 0.5;
    if (typeof window !== "undefined" && window.ELW_SCENE && typeof window.ELW_SCENE.charScale === "function") {
      try {
        var cs = window.ELW_SCENE.charScale(y);
        if (Number.isFinite(cs)) baseScale = cs;
      } catch (_e) {}
    }
    var finalScale = baseScale * 0.92 * sScale;
    var catScale = document.getElementById("catScale");
    if (catScale) {
      catScale.style.transition = "none";
      catScale.style.transformOrigin = "0px 0px";
      catScale.style.transform = "scale(" + finalScale.toFixed(3) + ")";
      catScale.setAttribute("data-stage", stage);
      catScale.setAttribute("data-stage-scale", sScale.toFixed(2));
    }
    if (typeof window !== "undefined" && window.ELW_PET_FOLLOW && window.ELW_PET_FOLLOW.state) {
      window.ELW_PET_FOLLOW.state.stage = stage;
      window.ELW_PET_FOLLOW.state.stageScale = sScale;
      window.ELW_PET_FOLLOW.state.scale = finalScale;
    }
    return sScale;
  }

  function getNeedsSnapshot() {
    resolveCurrentStage();
    var fallback = {
      hunger: 80,
      thirst: 80,
      fun: 80,
      energy: 80,
      transientState: null
    };
    if (typeof window !== "undefined" && window.ELW_PET_NEEDS) {
      try {
        var rawNeeds =
          typeof window.ELW_PET_NEEDS.getNeeds === "function"
            ? window.ELW_PET_NEEDS.getNeeds()
            : null;
        var fullState =
          typeof window.ELW_PET_NEEDS.getState === "function"
            ? window.ELW_PET_NEEDS.getState()
            : null;
        var st = rawNeeds || (fullState && fullState.needs) || fullState;
        if (st && typeof st === "object") {
          return {
            hunger: Number.isFinite(Number(st.hunger)) ? Number(st.hunger) : 80,
            thirst: Number.isFinite(Number(st.thirst)) ? Number(st.thirst) : 80,
            fun: Number.isFinite(Number(st.fun)) ? Number(st.fun) : 80,
            energy: Number.isFinite(Number(st.energy)) ? Number(st.energy) : 80,
            transientState:
              (fullState && (fullState.temporaryState || fullState.transientState)) ||
              st.transientState ||
              null
          };
        }
      } catch (_err) {}
    }
    return fallback;
  }

  function getPersonalityProfile() {
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_PERSONALITY &&
      typeof window.ELW_PET_PERSONALITY.getActiveProfile === "function"
    ) {
      try {
        return window.ELW_PET_PERSONALITY.getActiveProfile() || null;
      } catch (_err) {}
    }
    return null;
  }

  function getActiveEmotionType(nowTs) {
    if (!activeEmotion.type) return null;
    if (nowTs >= activeEmotion.untilTs) {
      activeEmotion.type = null;
      activeEmotion.startTs = 0;
      activeEmotion.untilTs = 0;
      activeEmotion.durationMs = 0;
      return null;
    }
    return activeEmotion.type;
  }

  function resolveDesiredVisualState(mode, speed, nowTs) {
    var needs = getNeedsSnapshot();
    var emotionType = getActiveEmotionType(nowTs);

    // Preserve active feeding/drinking transient states when standing still
    if (
      (needs.transientState === "eating" || needs.transientState === "drinking") &&
      mode !== "run"
    ) {
      return needs.transientState;
    }

    // Energy < 25 priority: tired (or sleepy if energy < 12 and idle)
    if (needs.energy < 25) {
      if (needs.energy < 12 && (mode === "idle" || mode === "stop")) {
        return "sleepy";
      }
      return "tired";
    }

    // Moving states (walk or run)
    if (mode === "walk" || mode === "run") {
      if (needs.energy < 25) {
        return "tired";
      }
      if (mode === "run") {
        if (nowTs - runStartTs < 550 && needs.fun >= 70) {
          return "excited";
        }
        return "walking_adventure";
      }
      return "walking_adventure";
    }

    // Idle / Stop with active emotion animation
    if (emotionType) {
      if (emotionType === "love" || emotionType === "happy") return "excited";
      if (emotionType === "like" || emotionType === "play") return "playful";
      if (emotionType === "curious") return "curious";
      if (emotionType === "dislike") return "sad_lonely";
    }

    // Fallback to ELW_PET_NEEDS.getVisualState()
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_NEEDS &&
      typeof window.ELW_PET_NEEDS.getVisualState === "function"
    ) {
      try {
        var needsVisual = window.ELW_PET_NEEDS.getVisualState();
        if (VALID_STATES.indexOf(needsVisual) !== -1) {
          return needsVisual;
        }
      } catch (_err) {}
    }

    if (needs.hunger < 25 || needs.thirst < 25 || needs.fun < 25) {
      return "sad_lonely";
    }
    return "idle_happy";
  }

  function resolvePetAssetUrl(srcPath, fallbackPath) {
    if (typeof window !== "undefined") {
      if (
        window.ELW_EMBEDDED_PET_ASSETS &&
        typeof window.ELW_EMBEDDED_PET_ASSETS[srcPath] === "string"
      ) {
        return window.ELW_EMBEDDED_PET_ASSETS[srcPath];
      }
      if (
        window.ELW_PET_ASSETS &&
        typeof window.ELW_PET_ASSETS[srcPath] === "string"
      ) {
        return window.ELW_PET_ASSETS[srcPath];
      }
      if (typeof window.resolvePetAsset === "function") {
        try {
          var resolved = window.resolvePetAsset(srcPath);
          if (typeof resolved === "string" && resolved.length > 0) {
            return resolved;
          }
        } catch (_err) {}
      }
      if (
        fallbackPath &&
        window.ELW_EMBEDDED_PET_ASSETS &&
        typeof window.ELW_EMBEDDED_PET_ASSETS[fallbackPath] === "string"
      ) {
        return window.ELW_EMBEDDED_PET_ASSETS[fallbackPath];
      }
    }
    return srcPath;
  }

  function applyVisualSprite(desiredState, force) {
    if (typeof document === "undefined") return;
    var state = VALID_STATES.indexOf(desiredState) !== -1 ? desiredState : "idle_happy";
    var petId = getActivePetId();
    var stage = resolveCurrentStage(petId);
    var legacyFallbackPath = "assets/pets/" + petId + "/" + state + ".png";
    var srcPath = resolveStageAssetPath(petId, state, stage);
    var resolvedSrc = resolvePetAssetUrl(srcPath, legacyFallbackPath);

    // Keep ELW_PET_FOLLOW and #catScale stageScale synchronized
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_FOLLOW &&
      typeof window.ELW_PET_FOLLOW.syncStageScale === "function"
    ) {
      try {
        if (
          force ||
          currentAnimState.stage !== stage ||
          (window.ELW_PET_FOLLOW.state && window.ELW_PET_FOLLOW.state.stage !== stage)
        ) {
          window.ELW_PET_FOLLOW.syncStageScale(stage);
        }
      } catch (_eSync) {}
    }
    applyStageScaleToCatScale(stage);

    var changed =
      force ||
      currentAnimState.visualState !== state ||
      currentAnimState.activePetId !== petId ||
      currentAnimState.stage !== stage ||
      currentAnimState.srcPath !== srcPath;

    currentAnimState.visualState = state;
    currentAnimState.activePetId = petId;
    currentAnimState.stage = stage;
    currentAnimState.srcPath = srcPath;

    var roomPetImg = document.getElementById("roomPetImg");
    var oCat = document.getElementById("o-cat");

    if (roomPetImg) {
      var curDataState = roomPetImg.getAttribute("data-state");
      var curDataStage = roomPetImg.getAttribute("data-stage");
      var curSrcPath = roomPetImg.getAttribute("data-src-path");
      var curHref = roomPetImg.getAttribute("href") || roomPetImg.getAttribute("src") || "";

      if (
        changed ||
        curDataState !== state ||
        curDataStage !== stage ||
        curSrcPath !== srcPath ||
        curHref !== resolvedSrc
      ) {
        roomPetImg.setAttribute("data-state", state);
        roomPetImg.setAttribute("data-stage", stage);
        roomPetImg.setAttribute("data-src-path", srcPath);
        roomPetImg.setAttribute("data-fallback-src", legacyFallbackPath);
        roomPetImg.setAttribute("data-pet-id", petId);
        roomPetImg.setAttribute("href", resolvedSrc);
        roomPetImg.setAttribute("src", resolvedSrc);
        if (typeof roomPetImg.setAttributeNS === "function") {
          try {
            roomPetImg.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", resolvedSrc);
          } catch (_err) {}
        }
        if (!roomPetImg.__elwStageFallbackBound) {
          roomPetImg.__elwStageFallbackBound = true;
          roomPetImg.addEventListener("error", function () {
            var attempted = roomPetImg.getAttribute("data-src-path");
            if (attempted && attempted.indexOf("/" + (roomPetImg.getAttribute("data-stage") || "") + "/") !== -1) {
              failedStageAssets[attempted] = true;
            }
            var fb = roomPetImg.getAttribute("data-fallback-src");
            if (fb) {
              var resolvedFb = resolvePetAssetUrl(fb, fb);
              if (roomPetImg.getAttribute("href") !== resolvedFb) {
                roomPetImg.setAttribute("data-src-path", fb);
                roomPetImg.setAttribute("href", resolvedFb);
                roomPetImg.setAttribute("src", resolvedFb);
              }
            }
          });
        }
      }
    }

    if (oCat) {
      if (
        changed ||
        oCat.getAttribute("data-state") !== state ||
        oCat.getAttribute("data-stage") !== stage ||
        oCat.getAttribute("data-src-path") !== srcPath
      ) {
        oCat.setAttribute("data-pet-id", petId);
        oCat.setAttribute("data-stage", stage);
        oCat.setAttribute("data-state", state);
        oCat.setAttribute("data-visual-state", state);
        oCat.setAttribute("data-src-path", srcPath);
        oCat.setAttribute("src", resolvedSrc);
      }
    }
  }

  function syncCatHopClasses(catHop, mode, emotionType, isTired, reduced, stage, ceremonyActive) {
    if (!catHop || !catHop.classList) return;

    var modes = ["walk", "run", "stop", "idle"];
    for (var i = 0; i < modes.length; i++) {
      var m = modes[i];
      if (m === mode) {
        catHop.classList.add("elw-pet-mode-" + m);
      } else {
        catHop.classList.remove("elw-pet-mode-" + m);
      }
    }

    for (var s = 0; s < VALID_STAGES.length; s++) {
      var stg = VALID_STAGES[s];
      if (stg === stage) {
        catHop.classList.add("elw-pet-stage-" + stg);
      } else {
        catHop.classList.remove("elw-pet-stage-" + stg);
      }
    }

    var emotions = ["love", "happy", "play", "like", "curious", "dislike"];
    for (var j = 0; j < emotions.length; j++) {
      var emo = emotions[j];
      if (emo === emotionType) {
        catHop.classList.add("elw-pet-emotion-" + emo);
      } else {
        catHop.classList.remove("elw-pet-emotion-" + emo);
      }
    }

    if (isTired) {
      catHop.classList.add("elw-pet-tired");
    } else {
      catHop.classList.remove("elw-pet-tired");
    }

    if (ceremonyActive) {
      catHop.classList.add("elw-pet-ceremony-glow");
    } else {
      catHop.classList.remove("elw-pet-ceremony-glow");
    }

    if (reduced) {
      catHop.classList.add("elw-pet-anim-reduced");
    } else {
      catHop.classList.remove("elw-pet-anim-reduced");
    }
  }

  function updateFrame(followState, dtSecInput) {
    var nowTs =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();

    var dtSec = Number(dtSecInput);
    if (!Number.isFinite(dtSec) || dtSec <= 0) {
      dtSec = 0.016;
    } else if (dtSec > 0.1) {
      dtSec = 0.1;
    }

    var rawMode =
      followState && typeof followState.mode === "string"
        ? followState.mode
        : currentAnimState.mode || "idle";
    var speed =
      followState && Number.isFinite(Number(followState.speed))
        ? Math.max(0, Number(followState.speed))
        : 0;

    var mode = rawMode;
    if (mode !== "walk" && mode !== "run" && mode !== "stop" && mode !== "idle") {
      mode = speed > 4 ? "walk" : "idle";
    }

    // Track mode transitions for run start and stop momentum
    if (mode === "run" && lastMode !== "run") {
      runStartTs = nowTs;
    }
    if (
      (lastMode === "walk" || lastMode === "run") &&
      (mode === "stop" || mode === "idle")
    ) {
      stopStartTs = nowTs;
    }
    lastMode = mode;

    var needs = getNeedsSnapshot();
    var isTired = needs.energy < 25;
    var emotionType = getActiveEmotionType(nowTs);
    var reduced = isReducedMotion();

    if (activeCeremony.active && nowTs >= activeCeremony.untilTs) {
      activeCeremony.active = false;
      activeCeremony.phase = 0;
    }

    // Always update PNG sprite state & stage regardless of prefers-reduced-motion
    var desiredVisualState = resolveDesiredVisualState(mode, speed, nowTs);
    applyVisualSprite(desiredVisualState, false);

    var stage = currentAnimState.stage || "adult";
    var gait = STAGE_GAIT_PROFILES[stage] || STAGE_GAIT_PROFILES.adult;
    currentAnimState.gait = gait.label;

    var hopY = 0;
    var tiltDeg = 0;
    var scaleX = 1;
    var scaleY = 1;

    if (!reduced) {
      var inStopWindow =
        mode === "stop" ||
        (mode === "idle" && stopStartTs > 0 && nowTs - stopStartTs < STOP_MOMENTUM_MS);

      if ((mode === "walk" || mode === "run") && speed > 4) {
        // Stage-coupled velocity gait:
        // baby = higher cadence short steps with wobbly sway;
        // teen = agile bouncy stride;
        // adult/elite = smooth composed stride.
        var baseFreq =
          mode === "run"
            ? Math.max(8, speed * 0.075)
            : Math.max(5.5, speed * 0.062);
        var freq = baseFreq * gait.freqMult;
        stepPhase += freq * dtSec;

        var baseAmpY =
          mode === "run"
            ? Math.min(10.5, Math.max(3.5, speed * 0.038))
            : Math.min(6.5, Math.max(1.8, speed * 0.028));
        var ampY = baseAmpY * gait.ampMult;

        hopY = -Math.abs(Math.sin(stepPhase)) * ampY;

        if (mode === "run") {
          tiltDeg = (4.2 + Math.cos(stepPhase) * 3.6) * gait.tiltMult;
        } else {
          tiltDeg =
            Math.sin(stepPhase) * Math.min(3.2, speed * 0.016) * gait.tiltMult +
            Math.cos(stepPhase * 0.5) * gait.waddleSway;
        }

        var squash = Math.sin(stepPhase * 2) * 0.03 * gait.squashMult;
        scaleX = 1 - squash;
        scaleY = 1 + squash;

        if (isTired) {
          hopY = -Math.abs(Math.sin(stepPhase)) * (1.8 * gait.ampMult) + 1.5;
          scaleY = 0.94;
          scaleX = 1.02 - squash * 0.5;
          tiltDeg = tiltDeg * 0.5 - 1.5;
        }
      } else if (inStopWindow) {
        // Stop momentum (~220ms)
        var elapsedStop = stopStartTs > 0 ? clamp(nowTs - stopStartTs, 0, STOP_MOMENTUM_MS) : 0;
        var progress = clamp(elapsedStop / STOP_MOMENTUM_MS, 0, 1);
        var decay = 1 - progress;

        tiltDeg = 3.5 * decay * gait.tiltMult;
        scaleY = 0.94 + 0.06 * progress;
        scaleX = 1.03 - 0.03 * progress;
        hopY = -1.2 * Math.sin(progress * Math.PI) * decay * gait.ampMult;
      } else {
        // Continuous Idle (never static over any 5s window)
        var profile = getPersonalityProfile();
        var idleMult =
          profile && Number.isFinite(Number(profile.idleMotionMultiplier))
            ? clamp(Number(profile.idleMotionMultiplier), 0.75, 1.35)
            : 1.0;

        idleClock += dtSec * idleMult * gait.idleFreqMult;

        if (isTired) {
          hopY = 2.0 + Math.sin(idleClock * 1.4) * 0.9;
          scaleY = 0.93 + Math.sin(idleClock * 1.4) * 0.02;
          scaleX = 1.02 - Math.sin(idleClock * 1.4) * 0.01;
          tiltDeg = -2.2 + Math.sin(idleClock * 0.8) * 1.0;
        } else {
          var breathe = Math.sin(idleClock * 2.5) * 0.032 * gait.idleAmpMult;
          scaleY = 1 + breathe;
          scaleX = 1 - breathe * 0.5;
          tiltDeg =
            (Math.sin(idleClock * 1.7) * 2.4 + Math.cos(idleClock * 0.9) * 1.2) *
            gait.idleAmpMult;
          hopY =
            (Math.sin(idleClock * 2.5) * 1.6 + Math.cos(idleClock * 1.3) * 0.8) *
            gait.idleAmpMult;
        }
      }

      // Overlay emotion animation when triggered
      if (emotionType) {
        var t = Math.max(0, (nowTs - activeEmotion.startTs) / 1000);
        if (
          emotionType === "love" ||
          emotionType === "play" ||
          emotionType === "happy"
        ) {
          hopY = -Math.abs(Math.sin(t * 11)) * 11 * gait.ampMult;
          tiltDeg = Math.sin(t * 11) * 6;
          var joySquash = Math.sin(t * 22) * 0.045;
          scaleX = 1 - joySquash;
          scaleY = 1 + joySquash;
        } else if (emotionType === "like") {
          hopY = -Math.abs(Math.sin(t * 8)) * 6.5 * gait.ampMult;
          tiltDeg = Math.sin(t * 8) * 4;
          var likeSquash = Math.sin(t * 16) * 0.028;
          scaleX = 1 - likeSquash;
          scaleY = 1 + likeSquash;
        } else if (emotionType === "curious") {
          tiltDeg = 8.5 * Math.sin(t * 4);
          hopY = -2;
          scaleX = 1;
          scaleY = 1.02;
        } else if (emotionType === "dislike") {
          tiltDeg = Math.sin(t * 18) * 5.5;
          hopY = 1;
          scaleX = 1.02;
          scaleY = 0.97;
        }
      }
    }

    var transformStr = reduced
      ? "translate(0px, 0px) rotate(0deg) scale(1, 1)"
      : "translate(0px, " +
        round2(hopY) +
        "px) rotate(" +
        round2(tiltDeg) +
        "deg) scale(" +
        round3(scaleX) +
        ", " +
        round3(scaleY) +
        ")";

    currentAnimState.mode = mode;
    currentAnimState.speed = round2(speed);
    currentAnimState.hopY = reduced ? 0 : round2(hopY);
    currentAnimState.tiltDeg = reduced ? 0 : round2(tiltDeg);
    currentAnimState.scaleX = reduced ? 1 : round3(scaleX);
    currentAnimState.scaleY = reduced ? 1 : round3(scaleY);
    currentAnimState.stepPhase = round2(stepPhase);
    currentAnimState.idleClock = round2(idleClock);
    currentAnimState.emotionType = emotionType;
    currentAnimState.ceremonyActive = Boolean(activeCeremony.active);
    currentAnimState.reducedMotion = reduced;
    currentAnimState.transform = transformStr;

    if (typeof document !== "undefined") {
      var catHop = document.getElementById("catHop");
      if (catHop) {
        catHop.style.transform = transformStr;
        catHop.setAttribute("data-anim-mode", mode);
        catHop.setAttribute("data-stage", stage);
        catHop.setAttribute("data-gait", gait.label);
        catHop.setAttribute("data-visual-state", currentAnimState.visualState);
        syncCatHopClasses(
          catHop,
          mode,
          emotionType,
          isTired,
          reduced,
          stage,
          activeCeremony.active
        );
      }
    }

    return currentAnimState;
  }

  function clearCeremonyTimers() {
    for (var i = 0; i < ceremonyTimers.length; i++) {
      clearTimeout(ceremonyTimers[i]);
    }
    ceremonyTimers = [];
  }

  function spawnCeremonySparkles(reduced) {
    if (typeof document === "undefined") return null;

    // 1. SVG sparkles inside #catScale so they anchor to the pet in scene space
    var catScale = document.getElementById("catScale");
    if (catScale) {
      var oldSvgSparkles = document.getElementById("elwPetCeremonySparkles");
      if (oldSvgSparkles && oldSvgSparkles.parentNode) {
        oldSvgSparkles.parentNode.removeChild(oldSvgSparkles);
      }
      var ns = "http://www.w3.org/2000/svg";
      var g = document.createElementNS(ns, "g");
      g.setAttribute("id", "elwPetCeremonySparkles");
      g.setAttribute("class", "elw-pet-ceremony-sparkles");
      g.setAttribute("pointer-events", "none");

      var pts = [
        { x: -34, y: -62, r: 4.5, c: "#FFD43B" },
        { x: 34, y: -60, r: 4.2, c: "#FFE066" },
        { x: -42, y: -34, r: 3.6, c: "#74C0FC" },
        { x: 42, y: -32, r: 3.8, c: "#FFD43B" },
        { x: 0, y: -76, r: 5.0, c: "#FFF3BF" },
        { x: -22, y: -72, r: 3.4, c: "#FFD43B" },
        { x: 24, y: -70, r: 3.4, c: "#74C0FC" },
        { x: -30, y: -16, r: 3.2, c: "#FFE066" },
        { x: 30, y: -16, r: 3.2, c: "#FFD43B" }
      ];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var star = document.createElementNS(ns, "circle");
        star.setAttribute("cx", String(p.x));
        star.setAttribute("cy", String(p.y));
        star.setAttribute("r", String(p.r));
        star.setAttribute("fill", p.c);
        star.setAttribute("opacity", "0.95");
        g.appendChild(star);
      }
      catScale.appendChild(g);
    }

    // 2. Screen-space floating sparkle particles overlay (non-blocking)
    var existingOverlay = document.getElementById("elwPetStageSparkles");
    if (existingOverlay && existingOverlay.parentNode) {
      existingOverlay.parentNode.removeChild(existingOverlay);
    }

    var container = document.createElement("div");
    container.id = "elwPetStageSparkles";
    container.className = "elw-pet-stage-sparkles" + (reduced ? " is-reduced" : "");
    container.style.pointerEvents = "none";
    container.setAttribute("aria-hidden", "true");
    container.setAttribute("data-phase", "sparkles");

    var cx = window.innerWidth ? window.innerWidth * 0.5 : 195;
    var cy = window.innerHeight ? window.innerHeight * 0.55 : 360;
    var targetEl = document.getElementById("roomPetImg") || document.getElementById("o-cat");
    if (targetEl && typeof targetEl.getBoundingClientRect === "function") {
      var rect = targetEl.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height / 2;
      }
    }
    container.style.left = Math.round(cx) + "px";
    container.style.top = Math.round(cy) + "px";

    var glyphs = ["✨", "✦", "★", "✧", "✨", "✦", "★", "✧", "✨", "✦"];
    for (var k = 0; k < glyphs.length; k++) {
      var angle = (Math.PI * 2 * k) / glyphs.length;
      var dist = 28 + (k % 3) * 14;
      var dx = Math.round(Math.cos(angle) * dist);
      var dy = Math.round(Math.sin(angle) * dist - 14);
      var sp = document.createElement("span");
      sp.className = "elw-pet-stage-sparkle";
      sp.style.pointerEvents = "none";
      sp.textContent = glyphs[k];
      sp.style.left = 70 + Math.round(Math.cos(angle) * 18) + "px";
      sp.style.top = 70 + Math.round(Math.sin(angle) * 18) + "px";
      sp.style.setProperty("--dx", dx + "px");
      sp.style.setProperty("--dy", dy + "px");
      container.appendChild(sp);
    }

    (document.body || document.documentElement).appendChild(container);
    return container;
  }

  function showCeremonyToast(petId, stage, reduced, missionActive) {
    if (typeof document === "undefined") return "";
    var cleanId = String(petId || getActivePetId() || "milu").toLowerCase().trim();
    var petName = PET_DISPLAY_NAMES[cleanId] || "Milu";
    var stageTitle = STAGE_TITLES[stage] || "Teen";
    var coreMessage = petName + " đã lớn lên: " + stageTitle + "!";

    var oldToast = document.getElementById("elwPetStageToast");
    if (oldToast && oldToast.parentNode) {
      oldToast.parentNode.removeChild(oldToast);
    }

    var toast = document.createElement("div");
    toast.id = "elwPetStageToast";
    toast.className =
      "elw-pet-stage-toast" +
      (reduced ? " is-reduced" : "") +
      (missionActive ? " is-mission-safe" : "");
    toast.style.pointerEvents = "none";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("data-pet-id", cleanId);
    toast.setAttribute("data-stage", stage);
    toast.setAttribute("data-ceremony-phases", "glow,sparkles,morph,toast");
    toast.textContent = "✨ " + coreMessage;

    (document.body || document.documentElement).appendChild(toast);
    return coreMessage;
  }

  function setStage(stageOrLevel, petId) {
    var norm = normalizeStage(stageOrLevel);
    if (!norm) return resolveCurrentStage(petId);
    var targetPet = String(petId || getActivePetId() || "milu").toLowerCase().trim();
    manualStageOverride = norm;
    currentAnimState.stage = norm;

    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("elw_pet_stage", norm);
        lastSeenDirectStage = norm;
        var rawV2 = localStorage.getItem("elw_pet_needs_v2");
        if (rawV2) {
          var parsed = JSON.parse(rawV2);
          if (parsed && typeof parsed === "object") {
            var lvl = LEVEL_BY_STAGE[norm] || 1;
            if (parsed.byPetId && parsed.byPetId[targetPet]) {
              parsed.byPetId[targetPet].stage = norm;
              parsed.byPetId[targetPet].level = lvl;
            }
            if (parsed.pets && parsed.pets[targetPet]) {
              parsed.pets[targetPet].stage = norm;
              parsed.pets[targetPet].level = lvl;
            }
            if (parsed.stats && typeof parsed.stats === "object") {
              parsed.stats.stage = norm;
              parsed.stats.level = lvl;
            }
            var nextRaw = JSON.stringify(parsed);
            localStorage.setItem("elw_pet_needs_v2", nextRaw);
            lastSeenRawV2 = nextRaw;
          }
        }
      }
    } catch (_e) {}

    if (typeof window !== "undefined" && window.ELW_PET_FOLLOW) {
      try {
        if (typeof window.ELW_PET_FOLLOW.setStage === "function") {
          window.ELW_PET_FOLLOW.setStage(norm, targetPet);
        } else if (typeof window.ELW_PET_FOLLOW.syncStageScale === "function") {
          window.ELW_PET_FOLLOW.syncStageScale(norm);
        }
      } catch (_e2) {}
    }

    stepPhase = 0;
    idleClock = 0;
    applyStageScaleToCatScale(norm);
    refreshVisualSprite(true);
    updateFrame(getLatestFollowState(), 0);
    return norm;
  }

  function playStageUpCeremony(petIdOrStage, maybeNewStage) {
    var targetPetId = getActivePetId();
    var targetStage = "teen";

    if (maybeNewStage !== undefined) {
      if (petIdOrStage) targetPetId = String(petIdOrStage).toLowerCase().trim();
      targetStage = normalizeStage(maybeNewStage) || "teen";
    } else if (normalizeStage(petIdOrStage)) {
      targetStage = normalizeStage(petIdOrStage);
    } else if (petIdOrStage && typeof petIdOrStage === "object") {
      targetPetId = String(petIdOrStage.petId || targetPetId).toLowerCase().trim();
      targetStage =
        normalizeStage(petIdOrStage.newStage || petIdOrStage.to || petIdOrStage.stage) ||
        resolveCurrentStage(targetPetId);
    }

    clearCeremonyTimers();

    var nowTs =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    var reduced = isReducedMotion();
    var missionActive = isMissionActive();
    var durationMs = reduced ? 900 : 2200;

    activeCeremony.active = true;
    activeCeremony.petId = targetPetId;
    activeCeremony.stage = targetStage;
    activeCeremony.phase = 1;
    activeCeremony.startTs = nowTs;
    activeCeremony.untilTs = nowTs + durationMs;

    // Phase 1: Glow (Sáng lên)
    var catHop = typeof document !== "undefined" ? document.getElementById("catHop") : null;
    var oCat = typeof document !== "undefined" ? document.getElementById("o-cat") : null;
    if (catHop) {
      catHop.classList.add("elw-pet-ceremony-glow");
      catHop.setAttribute("data-ceremony-phase", "1-glow");
    }
    if (oCat) {
      oCat.setAttribute("data-ceremony-active", "true");
    }

    // Phase 2: Sparkle particles (Hạt lấp lánh)
    activeCeremony.phase = 2;
    spawnCeremonySparkles(reduced);
    if (catHop) {
      catHop.setAttribute("data-ceremony-phase", "2-sparkles");
    }

    // Phase 3: Morph sprite & stage scale (Đổi hình theo stage mới)
    activeCeremony.phase = 3;
    setStage(targetStage, targetPetId);
    if (!reduced && !missionActive) {
      triggerEmotionAnim("happy", 1200);
    } else {
      updateFrame(getLatestFollowState(), 0);
    }
    if (catHop) {
      catHop.setAttribute("data-ceremony-phase", "3-morph");
    }

    // Phase 4: Non-blocking Toast ("Milu đã lớn lên: Teen!")
    activeCeremony.phase = 4;
    var toastMsg = showCeremonyToast(targetPetId, targetStage, reduced, missionActive);
    activeCeremony.toastText = toastMsg;
    if (catHop) {
      catHop.setAttribute("data-ceremony-phase", "4-toast");
    }

    // Cleanup ceremony visual artifacts after completion without blocking gameplay
    ceremonyTimers.push(
      setTimeout(function () {
        var sp = typeof document !== "undefined" ? document.getElementById("elwPetStageSparkles") : null;
        if (sp && sp.parentNode) sp.parentNode.removeChild(sp);
        var svgSp = typeof document !== "undefined" ? document.getElementById("elwPetCeremonySparkles") : null;
        if (svgSp && svgSp.parentNode) svgSp.parentNode.removeChild(svgSp);
        if (catHop) {
          catHop.classList.remove("elw-pet-ceremony-glow");
          catHop.removeAttribute("data-ceremony-phase");
        }
        if (oCat) {
          oCat.removeAttribute("data-ceremony-active");
        }
        activeCeremony.active = false;
      }, durationMs)
    );

    ceremonyTimers.push(
      setTimeout(function () {
        var tEl = typeof document !== "undefined" ? document.getElementById("elwPetStageToast") : null;
        if (tEl && tEl.parentNode) tEl.parentNode.removeChild(tEl);
      }, durationMs + 900)
    );

    return {
      ok: true,
      petId: targetPetId,
      stage: targetStage,
      phases: ["glow", "sparkles", "morph", "toast"],
      toastText: toastMsg,
      reducedMotion: reduced,
      missionActive: missionActive
    };
  }

  function handleStageUpNotification(payload) {
    if (!payload || typeof payload !== "object") return;
    var petId = String(payload.petId || payload.activePetId || getActivePetId() || "milu")
      .toLowerCase()
      .trim();
    var newStage = normalizeStage(payload.newStage || payload.to || payload.stage || payload.level);
    if (!newStage) return;

    var now = Date.now();
    var dedupeKey = petId + ":" + newStage;
    if (dedupeKey === lastCeremonyDedupeKey && now - lastCeremonyTs < 800) {
      setStage(newStage, petId);
      return;
    }
    lastCeremonyDedupeKey = dedupeKey;
    lastCeremonyTs = now;
    playStageUpCeremony(petId, newStage);
  }

  function triggerEmotionAnim(type, durationMs) {
    var normalized = String(type || "like").toLowerCase().trim();
    if (
      normalized !== "love" &&
      normalized !== "play" &&
      normalized !== "happy" &&
      normalized !== "like" &&
      normalized !== "curious" &&
      normalized !== "dislike"
    ) {
      normalized = "like";
    }

    var dur = Number(durationMs);
    if (!Number.isFinite(dur) || dur <= 0) {
      dur = normalized === "love" || normalized === "happy" ? 1400 : 1100;
    }

    var nowTs =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();

    activeEmotion.type = normalized;
    activeEmotion.startTs = nowTs;
    activeEmotion.durationMs = dur;
    activeEmotion.untilTs = nowTs + dur;

    var followState = getLatestFollowState();
    updateFrame(followState, 0);
    return getState();
  }

  function getLatestFollowState() {
    if (
      typeof window !== "undefined" &&
      window.ELW_PET_FOLLOW &&
      typeof window.ELW_PET_FOLLOW.getState === "function"
    ) {
      try {
        var st = window.ELW_PET_FOLLOW.getState();
        if (st && typeof st === "object") return st;
      } catch (_err) {}
    }
    return {
      mode: currentAnimState.mode || "idle",
      speed: currentAnimState.speed || 0
    };
  }

  function onFollowUpdate(followState) {
    var nowTs =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    var dtSec =
      followState && Number.isFinite(Number(followState.dtSec))
        ? Number(followState.dtSec)
        : lastFollowTickTs > 0
        ? (nowTs - lastFollowTickTs) / 1000
        : 0.016;
    lastFollowTickTs = nowTs;
    updateFrame(followState, dtSec);
  }

  function trySubscribeFollow() {
    ensureMiluStageAssetsRegistered();

    if (!unsubscribeFollow) {
      if (
        typeof window !== "undefined" &&
        window.ELW_PET_FOLLOW &&
        typeof window.ELW_PET_FOLLOW.subscribe === "function"
      ) {
        try {
          unsubscribeFollow = window.ELW_PET_FOLLOW.subscribe(onFollowUpdate);
        } catch (_err) {}
      }
    }

    if (!unsubscribeNeedsStageUp) {
      if (
        typeof window !== "undefined" &&
        window.ELW_PET_NEEDS &&
        typeof window.ELW_PET_NEEDS.subscribe === "function"
      ) {
        try {
          unsubscribeNeedsStageUp = window.ELW_PET_NEEDS.subscribe(
            "stage-up",
            function (detail) {
              handleStageUpNotification(detail);
            }
          );
          unsubscribeNeedsAll = window.ELW_PET_NEEDS.subscribe(function (snap, evtName, detail) {
            if (
              evtName === "stage-up" ||
              (snap && (snap.event === "stage-up" || snap.type === "stage-up"))
            ) {
              handleStageUpNotification(detail || snap);
              return;
            }
            var stg = (detail && normalizeStage(detail.stage || detail.to)) || (snap && normalizeStage(snap.stage)) || resolveCurrentStage();
            if (stg) {
              applyStageScaleToCatScale(stg);
            }
            refreshVisualSprite(true);
            updateFrame(getLatestFollowState(), 0);
          });
        } catch (_err2) {}
      }
    }

    if (!unsubscribeInteraction) {
      if (
        typeof window !== "undefined" &&
        window.ELW_PET_INTERACTION &&
        typeof window.ELW_PET_INTERACTION.subscribe === "function"
      ) {
        try {
          unsubscribeInteraction = window.ELW_PET_INTERACTION.subscribe(function () {
            refreshVisualSprite(true);
          });
        } catch (_err3) {}
      }
    }
  }

  function startFallbackLoop() {
    if (rafId || typeof window === "undefined") return;
    var reqAnim =
      window.requestAnimationFrame ||
      function (cb) {
        return window.setTimeout(function () {
          cb(Date.now());
        }, 16);
      };

    function loop(now) {
      var nowTs =
        typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : Number(now) || Date.now();

      trySubscribeFollow();

      // Run fallback update if ELW_PET_FOLLOW hasn't emitted a frame within 36ms
      if (nowTs - lastFollowTickTs > 36) {
        var dtSec =
          lastFallbackTickTs > 0 ? (nowTs - lastFallbackTickTs) / 1000 : 0.016;
        lastFallbackTickTs = nowTs;
        updateFrame(getLatestFollowState(), dtSec);
      } else {
        lastFallbackTickTs = nowTs;
      }

      rafId = reqAnim(loop);
    }

    rafId = reqAnim(loop);
  }

  function bindGlobalEvents() {
    if (typeof window === "undefined") return;

    window.addEventListener("elw:pet-reaction", function (e) {
      var detail = (e && e.detail) || {};
      var reaction = detail.reaction || detail.type || "like";
      triggerEmotionAnim(reaction, detail.durationMs);
    });

    window.addEventListener("elw:pet-needs-updated", function () {
      refreshVisualSprite(false);
    });

    window.addEventListener("elw:pet-switched", function () {
      refreshVisualSprite(true);
    });

    window.addEventListener("elw:pet-stage-up", function (e) {
      handleStageUpNotification((e && e.detail) || {});
    });

    window.addEventListener("stage-up", function (e) {
      handleStageUpNotification((e && e.detail) || {});
    });

    window.addEventListener("storage", function () {
      refreshVisualSprite(true);
    });

    if (typeof window.matchMedia === "function") {
      try {
        var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        var onMqChange = function () {
          updateFrame(getLatestFollowState(), 0.016);
        };
        if (typeof mq.addEventListener === "function") {
          mq.addEventListener("change", onMqChange);
        } else if (typeof mq.addListener === "function") {
          mq.addListener(onMqChange);
        }
      } catch (_err) {}
    }
  }

  function refreshVisualSprite(force) {
    var nowTs =
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now();
    var followState = getLatestFollowState();
    var mode = (followState && followState.mode) || currentAnimState.mode || "idle";
    var speed = Number(followState && followState.speed) || 0;
    var desired = resolveDesiredVisualState(mode, speed, nowTs);
    applyVisualSprite(desired, Boolean(force));
    return desired;
  }

  function setReducedMotionOverride(val) {
    if (typeof val === "boolean") {
      reducedMotionOverride = val;
    } else {
      reducedMotionOverride = null;
    }
    updateFrame(getLatestFollowState(), 0.016);
    return isReducedMotion();
  }

  function getState() {
    return {
      mode: currentAnimState.mode,
      motionMode:
        currentAnimState.emotionType ||
        (currentAnimState.visualState === "tired" ? "tired" : currentAnimState.mode),
      speed: currentAnimState.speed,
      hopY: currentAnimState.hopY,
      tiltDeg: currentAnimState.tiltDeg,
      scaleX: currentAnimState.scaleX,
      scaleY: currentAnimState.scaleY,
      breatheScaleY: currentAnimState.scaleY,
      stepPhase: currentAnimState.stepPhase,
      idleClock: currentAnimState.idleClock,
      visualState: currentAnimState.visualState,
      activePetId: currentAnimState.activePetId,
      stage: currentAnimState.stage,
      gait: currentAnimState.gait,
      srcPath: currentAnimState.srcPath,
      emotionType: currentAnimState.emotionType,
      ceremonyActive: currentAnimState.ceremonyActive,
      reducedMotion: currentAnimState.reducedMotion,
      transform: currentAnimState.transform
    };
  }

  function init() {
    injectStyles();
    ensureMiluStageAssetsRegistered();
    if (!initialized) {
      initialized = true;
      bindGlobalEvents();
    }
    trySubscribeFollow();
    refreshVisualSprite(true);
    updateFrame(getLatestFollowState(), 0.016);
    startFallbackLoop();
    return getState();
  }

  var api = {
    STAGE_SCALES: STAGE_SCALES,
    STAGE_GAIT_PROFILES: STAGE_GAIT_PROFILES,
    init: init,
    getState: getState,
    getStage: resolveCurrentStage,
    setStage: setStage,
    applyStageScaleToCatScale: applyStageScaleToCatScale,
    resolveStageAssetPath: resolveStageAssetPath,
    playStageUpCeremony: playStageUpCeremony,
    triggerEmotionAnim: triggerEmotionAnim,
    updateFrame: updateFrame,
    refreshVisualSprite: refreshVisualSprite,
    setReducedMotionOverride: setReducedMotionOverride
  };

  if (typeof window !== "undefined") {
    window.ELW_PET_ANIM = api;
    ensureMiluStageAssetsRegistered();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        init();
      });
    } else {
      init();
    }
  }
})();
