(function () {
  "use strict";

  const BOUND_X_MIN = 85;
  const BOUND_X_MAX = 915;
  const BOUND_Y_MIN = 342;
  const BOUND_Y_MAX = 610;

  const TABLE_BOX = { x1: 350, x2: 670, y1: 420, y2: 528 };
  const SOFA_BOX = { x1: 434, x2: 646, y1: 330, y2: 400 };

  const DEFAULT_OBSTACLES = {
    living: [TABLE_BOX, SOFA_BOX],
    kitchen: [{ x1: 230, x2: 730, y1: 340, y2: 430 }],
    bathroom: [{ x1: 540, x2: 830, y1: 340, y2: 430 }],
    bedroom: [{ x1: 270, x2: 680, y1: 340, y2: 455 }],
    study: [{ x1: 310, x2: 690, y1: 340, y2: 430 }]
  };

  const CAT_INTERACTION_ACTIONS = new Set([
    "pet_cat",
    "feed_cat",
    "give_cat_water",
    "play_with_cat",
    "brush_cat",
    "call_cat"
  ]);

  const VALID_STAGES = ["baby", "young", "teen", "adult", "elite"];
  const STAGE_BY_LEVEL = {
    1: "baby",
    2: "young",
    3: "teen",
    4: "adult",
    5: "elite"
  };

  // stageScale: baby nhỏ hơn rõ (0.72), tăng dần đều tới elite lớn nhất (1.12)
  const STAGE_SCALES = Object.freeze({
    baby: 0.72,
    young: 0.84,
    teen: 0.94,
    adult: 1.02,
    elite: 1.12
  });

  // Tốc độ theo stage: baby lon ton chậm hơn, tăng dần tới elite mượt nhanh
  const STAGE_SPEED_MULT = Object.freeze({
    baby: 0.86,
    young: 0.93,
    teen: 1.0,
    adult: 1.05,
    elite: 1.10
  });

  const state = {
    room: "living",
    x: 688,
    y: 485,
    vx: 0,
    vy: 0,
    speed: 0,
    dir: 1,
    stage: "adult",
    stageScale: STAGE_SCALES.adult,
    stageSpeedMult: STAGE_SPEED_MULT.adult,
    scale: 1.15,
    mode: "idle", // "idle" | "walk" | "run" | "stop" | "yield"
    energyMode: "normal", // "tired" | "normal" | "excited"
    targetX: 688,
    targetY: 485,
    waypoints: [],
    moving: false,
    stopTimerMs: 0,
    yieldUntil: 0,
    running: false
  };

  let rafId = null;
  let lastFrameTs = 0;
  let lastSortY = -999;
  let lastRouteTargetX = -999;
  let lastRouteTargetY = -999;
  let initialized = false;
  let manualStageOverride = null;
  let lastSeenDirectStage = null;
  let lastSeenRawV2 = null;
  let lastSeenNeedsStage = null;
  const subscribers = new Set();

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function normalizeStage(s) {
    if (typeof s === "number" && STAGE_BY_LEVEL[s]) return STAGE_BY_LEVEL[s];
    const raw = String(s || "").toLowerCase().trim();
    if (VALID_STAGES.indexOf(raw) !== -1) return raw;
    if (raw === "bonded" || raw === "legend") return "elite";
    const num = parseInt(raw, 10);
    if (STAGE_BY_LEVEL[num]) return STAGE_BY_LEVEL[num];
    return null;
  }

  function getActivePetId() {
    if (
      window.ELW_PET_NEEDS &&
      typeof window.ELW_PET_NEEDS.getActivePetId === "function"
    ) {
      try {
        const id = window.ELW_PET_NEEDS.getActivePetId();
        if (id) return String(id);
      } catch (_e) {}
    }
    const oCat = typeof document !== "undefined" ? document.getElementById("o-cat") : null;
    if (oCat) {
      const attrId = oCat.getAttribute("data-pet-id");
      if (attrId) return attrId;
    }
    return "milu";
  }

  function extractStageFromStorageObj(parsed, petId) {
    if (!parsed || typeof parsed !== "object") return null;
    const maps = [
      parsed.byPetId,
      parsed.petProgress,
      parsed.pets,
      parsed.byPet,
      parsed.progress,
      parsed.petStates
    ];
    for (let i = 0; i < maps.length; i++) {
      const m = maps[i];
      if (m && typeof m === "object" && m[petId] && typeof m[petId] === "object") {
        const entry = m[petId];
        const st = normalizeStage(entry.stage || entry.stageId || entry.level);
        if (st) return st;
      }
    }
    if (parsed.stage) {
      const topSt = normalizeStage(parsed.stage);
      if (topSt) return topSt;
    }
    if (parsed.stats && typeof parsed.stats === "object") {
      if (parsed.stats.stage) {
        const statSt = normalizeStage(parsed.stats.stage);
        if (statSt) return statSt;
      }
      if (parsed.stats.level !== undefined && parsed.stats.xp !== undefined) {
        if (Number(parsed.stats.level) > 1 || parsed.stats.stageSpecified) {
          const lvlSt = normalizeStage(parsed.stats.level);
          if (lvlSt) return lvlSt;
        }
      }
    }
    return null;
  }

  function resolveCurrentStage() {
    // 1. Detect external localStorage changes BEFORE calling ELW_PET_NEEDS methods that might save()
    try {
      if (typeof localStorage !== "undefined") {
        const directStage = localStorage.getItem("elw_pet_stage");
        const rawV2 = localStorage.getItem("elw_pet_needs_v2") || "";
        const isInitial = lastSeenRawV2 === null && lastSeenDirectStage === null;

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
            if (window.ELW_PET_NEEDS && typeof window.ELW_PET_NEEDS.load === "function") {
              try {
                window.ELW_PET_NEEDS.load();
              } catch (_eLoad) {}
            }
            lastSeenRawV2 = localStorage.getItem("elw_pet_needs_v2") || rawV2;
            try {
              const parsed = JSON.parse(rawV2);
              const pidGuess = (parsed && parsed.activePetId) || "milu";
              const fromStore = extractStageFromStorageObj(parsed, pidGuess);
              if (fromStore) {
                manualStageOverride = fromStore;
              }
            } catch (_e2) {}
          } else {
            lastSeenRawV2 = rawV2;
          }
        }
      }
    } catch (_e) {}

    const petId = getActivePetId();

    // 2. Check ELW_PET_NEEDS.getPetProgress(petId) if available
    if (window.ELW_PET_NEEDS) {
      try {
        if (typeof window.ELW_PET_NEEDS.getPetProgress === "function") {
          const prog = window.ELW_PET_NEEDS.getPetProgress(petId);
          const progStage = prog && normalizeStage(prog.stage || prog.stageId);
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
          const stGetter = normalizeStage(window.ELW_PET_NEEDS.getStage(petId));
          if (stGetter && !manualStageOverride) return stGetter;
        }
      } catch (_e) {}
    }

    if (manualStageOverride) return manualStageOverride;

    // 3. Check localStorage fallback even if unchanged
    try {
      if (typeof localStorage !== "undefined") {
        const directSt = normalizeStage(localStorage.getItem("elw_pet_stage"));
        if (directSt) return directSt;
        const rawV2 = localStorage.getItem("elw_pet_needs_v2");
        if (rawV2) {
          const parsed = JSON.parse(rawV2);
          const fromStore = extractStageFromStorageObj(parsed, petId);
          if (fromStore) return fromStore;
        }
      }
    } catch (_e) {}

    return "adult";
  }

  function notifySubscribers() {
    if (!subscribers.size) return;
    const snapshot = getPosition();
    subscribers.forEach(function (fn) {
      try {
        fn(snapshot);
      } catch (_err) {
        // Ignore subscriber error
      }
    });
  }

  function parseTransformXY(el) {
    if (!el || !el.style || !el.style.transform) return null;
    const m = el.style.transform.match(/translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/i);
    if (!m) return null;
    const x = parseFloat(m[1]);
    const y = parseFloat(m[2]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x: x, y: y };
  }

  function getCharStateSnapshot() {
    if (window.ELW_SCENE && typeof window.ELW_SCENE.getCharState === "function") {
      try {
        const cs = window.ELW_SCENE.getCharState();
        if (cs && typeof cs === "object") {
          return {
            room: cs.room || "living",
            x: Number.isFinite(cs.x) ? cs.x : 760,
            y: Number.isFinite(cs.y) ? cs.y : 475,
            dir: cs.dir === -1 ? -1 : 1,
            walk: Boolean(cs.walk),
            pose: cs.pose || "stand",
            catAt: cs.catAt || "rug",
            catFollow: cs.catFollow !== undefined ? Boolean(cs.catFollow) : true
          };
        }
      } catch (_e) {
        // Fallback below
      }
    }

    const legacy =
      window.ELW && typeof window.ELW.state === "function" ? window.ELW.state() : null;
    const charPosEl = document.getElementById("charPos");
    const parsedChar = parseTransformXY(charPosEl);
    const charWrapEl = document.getElementById("charWrap");
    const charFlipEl = document.getElementById("charFlip");
    let flipDir = 1;
    if (charFlipEl && charFlipEl.style && charFlipEl.style.transform.includes("-1")) {
      flipDir = -1;
    }

    return {
      room: (legacy && legacy.room) || "living",
      x:
        legacy && Number.isFinite(legacy.charX)
          ? legacy.charX
          : parsedChar
          ? parsedChar.x
          : 760,
      y:
        legacy && Number.isFinite(legacy.charY)
          ? legacy.charY
          : parsedChar
          ? parsedChar.y
          : 475,
      dir: legacy && (legacy.charDir === -1 || legacy.charDir === 1) ? legacy.charDir : flipDir,
      walk: Boolean(charWrapEl && charWrapEl.classList.contains("walk")),
      pose: (legacy && legacy.pose) || "stand",
      catAt: (legacy && legacy.catAt) || "rug",
      catFollow: legacy && legacy.catFollow !== undefined ? Boolean(legacy.catFollow) : true
    };
  }

  function getObstaclesForRoom(room) {
    let list = [];
    if (window.ELW_SCENE && typeof window.ELW_SCENE.getObstacles === "function") {
      try {
        const res = window.ELW_SCENE.getObstacles(room);
        if (Array.isArray(res)) list = res.slice();
      } catch (_e) {
        // Fallback below
      }
    }
    if (!list.length && DEFAULT_OBSTACLES[room]) {
      list = DEFAULT_OBSTACLES[room].slice();
    }
    if (room === "living") {
      const hasTable = list.some(function (b) {
        return Math.abs(b.x1 - TABLE_BOX.x1) < 5 && Math.abs(b.y1 - TABLE_BOX.y1) < 5;
      });
      const hasSofa = list.some(function (b) {
        return Math.abs(b.x1 - SOFA_BOX.x1) < 5 && Math.abs(b.y1 - SOFA_BOX.y1) < 5;
      });
      if (!hasTable) list.push(TABLE_BOX);
      if (!hasSofa) list.push(SOFA_BOX);
    }
    return list;
  }

  function isPointInBox(x, y, box, pad) {
    const p = pad || 0;
    return (
      x > box.x1 - p &&
      x < box.x2 + p &&
      y > box.y1 - p &&
      y < box.y2 + p
    );
  }

  function isPointBlocked(x, y, boxes, pad) {
    for (let i = 0; i < boxes.length; i++) {
      if (isPointInBox(x, y, boxes[i], pad)) return true;
    }
    return false;
  }

  function segmentIntersectsBox(p1, p2, box, pad) {
    const p = pad || 0;
    const minX = box.x1 - p;
    const maxX = box.x2 + p;
    const minY = box.y1 - p;
    const maxY = box.y2 + p;

    let t0 = 0;
    let t1 = 1;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    const checks = [
      [-dx, p1.x - minX],
      [dx, maxX - p1.x],
      [-dy, p1.y - minY],
      [dy, maxY - p1.y]
    ];

    for (let i = 0; i < 4; i++) {
      const q = checks[i][0];
      const r = checks[i][1];
      if (Math.abs(q) < 1e-8) {
        if (r < 0) return false;
      } else {
        const t = r / q;
        if (q < 0) {
          if (t > t1) return false;
          if (t > t0) t0 = t;
        } else {
          if (t < t0) return false;
          if (t < t1) t1 = t;
        }
      }
    }
    return t0 <= t1;
  }

  function isSegmentBlocked(p1, p2, boxes, pad) {
    for (let i = 0; i < boxes.length; i++) {
      if (segmentIntersectsBox(p1, p2, boxes[i], pad)) return true;
    }
    return false;
  }

  function pushOutOfObstacles(x, y, boxes, pad) {
    let nx = clamp(x, BOUND_X_MIN, BOUND_X_MAX);
    let ny = clamp(y, BOUND_Y_MIN, BOUND_Y_MAX);
    const p = pad !== undefined ? pad : 6;

    for (let pass = 0; pass < 3; pass++) {
      let adjusted = false;
      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i];
        if (nx > b.x1 - p && nx < b.x2 + p && ny > b.y1 - p && ny < b.y2 + p) {
          const dLeft = Math.abs(nx - (b.x1 - p));
          const dRight = Math.abs(b.x2 + p - nx);
          const dTop = Math.abs(ny - (b.y1 - p));
          const dBottom = Math.abs(b.y2 + p - ny);

          const candidates = [
            { x: b.x1 - p, y: ny, d: dLeft },
            { x: b.x2 + p, y: ny, d: dRight },
            { x: nx, y: b.y1 - p, d: dTop },
            { x: nx, y: b.y2 + p, d: dBottom }
          ].filter(function (c) {
            return (
              c.x >= BOUND_X_MIN &&
              c.x <= BOUND_X_MAX &&
              c.y >= BOUND_Y_MIN &&
              c.y <= BOUND_Y_MAX
            );
          });

          if (candidates.length) {
            candidates.sort(function (a, bCand) {
              return a.d - bCand.d;
            });
            nx = candidates[0].x;
            ny = candidates[0].y;
            adjusted = true;
          }
        }
      }
      if (!adjusted) break;
    }

    return {
      x: clamp(nx, BOUND_X_MIN, BOUND_X_MAX),
      y: clamp(ny, BOUND_Y_MIN, BOUND_Y_MAX)
    };
  }

  function buildInternalRoute(fromPt, toPt, boxes) {
    const safeStart = pushOutOfObstacles(fromPt.x, fromPt.y, boxes, 8);
    const safeEnd = pushOutOfObstacles(toPt.x, toPt.y, boxes, 8);

    if (!isSegmentBlocked(safeStart, safeEnd, boxes, 6)) {
      return [safeEnd];
    }

    const nodes = [safeStart, safeEnd];
    const margin = 14;
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      const corners = [
        { x: b.x1 - margin, y: b.y1 - margin },
        { x: b.x2 + margin, y: b.y1 - margin },
        { x: b.x1 - margin, y: b.y2 + margin },
        { x: b.x2 + margin, y: b.y2 + margin }
      ];
      for (let c = 0; c < corners.length; c++) {
        const pt = corners[c];
        if (
          pt.x >= BOUND_X_MIN &&
          pt.x <= BOUND_X_MAX &&
          pt.y >= BOUND_Y_MIN &&
          pt.y <= BOUND_Y_MAX &&
          !isPointBlocked(pt.x, pt.y, boxes, 6)
        ) {
          nodes.push(pt);
        }
      }
    }

    const n = nodes.length;
    const dist = new Array(n).fill(Infinity);
    const prev = new Array(n).fill(-1);
    const visited = new Array(n).fill(false);
    dist[0] = 0;

    for (let step = 0; step < n; step++) {
      let u = -1;
      let best = Infinity;
      for (let i = 0; i < n; i++) {
        if (!visited[i] && dist[i] < best) {
          best = dist[i];
          u = i;
        }
      }
      if (u === -1 || u === 1) break;
      visited[u] = true;

      for (let v = 0; v < n; v++) {
        if (visited[v] || u === v) continue;
        if (!isSegmentBlocked(nodes[u], nodes[v], boxes, 5)) {
          const w = Math.hypot(nodes[v].x - nodes[u].x, nodes[v].y - nodes[u].y);
          if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            prev[v] = u;
          }
        }
      }
    }

    if (prev[1] !== -1) {
      const path = [];
      let cur = 1;
      while (cur !== -1 && cur !== 0) {
        path.unshift(nodes[cur]);
        cur = prev[cur];
      }
      return path;
    }

    return [safeEnd];
  }

  function computeSafeRoute(fromPt, toPt, room, boxes) {
    const safeStart = pushOutOfObstacles(fromPt.x, fromPt.y, boxes, 8);
    const safeEnd = pushOutOfObstacles(toPt.x, toPt.y, boxes, 8);

    if (!isSegmentBlocked(safeStart, safeEnd, boxes, 6)) {
      return [safeEnd];
    }

    if (window.ELW_SCENE && typeof window.ELW_SCENE.route === "function") {
      try {
        const sceneWaypoints = window.ELW_SCENE.route(safeStart, safeEnd, room);
        if (Array.isArray(sceneWaypoints) && sceneWaypoints.length > 0) {
          const cleaned = sceneWaypoints.map(function (pt) {
            return pushOutOfObstacles(pt.x, pt.y, boxes, 8);
          });
          let valid = true;
          let prevPt = safeStart;
          for (let i = 0; i < cleaned.length; i++) {
            if (isSegmentBlocked(prevPt, cleaned[i], boxes, 4)) {
              valid = false;
              break;
            }
            prevPt = cleaned[i];
          }
          if (valid) return cleaned;
        }
      } catch (_e) {
        // Fallback to internal Dijkstra
      }
    }

    return buildInternalRoute(safeStart, safeEnd, boxes);
  }

  function computeFollowTarget(charState, boxes) {
    const charX = charState.x;
    const charY = charState.y;
    const charDir = charState.dir === -1 ? -1 : 1;

    const rawX = clamp(charX - charDir * 72, BOUND_X_MIN, BOUND_X_MAX);
    const rawY = clamp(charY + 10, BOUND_Y_MIN, BOUND_Y_MAX);

    const primaryDist = Math.hypot(charX - rawX, charY - rawY);
    if (
      !isPointBlocked(rawX, rawY, boxes, 10) &&
      primaryDist >= 48 &&
      primaryDist <= 105
    ) {
      return { x: rawX, y: rawY };
    }

    const candidates = [
      { x: charX - charDir * 72, y: charY + 10 },
      { x: charX + charDir * 70, y: charY + 10 },
      { x: charX - charDir * 64, y: charY + 28 },
      { x: charX - charDir * 64, y: charY - 22 },
      { x: charX + charDir * 64, y: charY + 28 },
      { x: charX + charDir * 64, y: charY - 22 },
      { x: charX, y: charY + 58 },
      { x: charX, y: charY - 58 },
      { x: charX - charDir * 82, y: charY },
      { x: charX + charDir * 82, y: charY }
    ];

    let bestPt = null;
    let bestScore = Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const cx = clamp(candidates[i].x, BOUND_X_MIN, BOUND_X_MAX);
      const cy = clamp(candidates[i].y, BOUND_Y_MIN, BOUND_Y_MAX);
      if (isPointBlocked(cx, cy, boxes, 10)) continue;
      const dChar = Math.hypot(charX - cx, charY - cy);
      if (dChar < 46 || dChar > 110) continue;
      const dRaw = Math.hypot(cx - rawX, cy - rawY) + i * 4;
      if (dRaw < bestScore) {
        bestScore = dRaw;
        bestPt = { x: cx, y: cy };
      }
    }

    if (bestPt) return bestPt;

    const pushed = pushOutOfObstacles(rawX, rawY, boxes, 10);
    const dPushed = Math.hypot(charX - pushed.x, charY - pushed.y);
    if (dPushed < 44) {
      const pushX = clamp(
        charX + (pushed.x >= charX ? 68 : -68),
        BOUND_X_MIN,
        BOUND_X_MAX
      );
      return pushOutOfObstacles(pushX, pushed.y, boxes, 10);
    }
    return pushed;
  }

  function isYieldingNow() {
    if (state.yieldUntil > Date.now()) return true;
    if (
      window.ELW_SCENE &&
      typeof window.ELW_SCENE.isCatInteractionActive === "function"
    ) {
      try {
        if (window.ELW_SCENE.isCatInteractionActive()) return true;
      } catch (_e) {
        // Ignore
      }
    }
    const curAct = window.ELW && window.ELW.curAct;
    if (curAct && CAT_INTERACTION_ACTIONS.has(curAct.id || curAct)) {
      return true;
    }
    return false;
  }

  function computeScaleForY(y, stageOverride) {
    let baseScale = 0.95 + ((y - 330) / 310) * 0.5;
    if (window.ELW_SCENE && typeof window.ELW_SCENE.charScale === "function") {
      try {
        const s = window.ELW_SCENE.charScale(y);
        if (Number.isFinite(s)) baseScale = s;
      } catch (_e) {
        // Fallback formula used
      }
    }
    const stageKey = normalizeStage(stageOverride) || resolveCurrentStage();
    const sScale = STAGE_SCALES[stageKey] || 1.0;
    state.stage = stageKey;
    state.stageScale = sScale;
    state.stageSpeedMult = STAGE_SPEED_MULT[stageKey] || 1.0;
    return baseScale * 0.92 * sScale;
  }

  function fallbackSortDepth() {
    const worldEl = document.getElementById("world");
    if (!worldEl) return;
    const items = Array.prototype.slice.call(
      worldEl.querySelectorAll(":scope > [data-base]")
    );
    items.sort(function (a, b) {
      return (parseFloat(a.dataset.base) || 0) - (parseFloat(b.dataset.base) || 0);
    });
    for (let i = 0; i < items.length; i++) {
      worldEl.appendChild(items[i]);
    }
  }

  function applyDomTransform(forceSort) {
    const catRoot = document.getElementById("o-cat");
    const catPos = document.getElementById("catPos");
    const catScale = document.getElementById("catScale");
    const catFlip = document.getElementById("catFlip");

    if (catRoot) {
      catRoot.classList.add("pet-follow-active");
      if (catRoot.style.display === "none") {
        catRoot.style.display = "";
      }
      catRoot.dataset.base = String(Math.round(state.y + 2));
    }

    if (catPos) {
      catPos.style.transform =
        "translate(" + state.x.toFixed(1) + "px," + state.y.toFixed(1) + "px)";
    }

    state.scale = computeScaleForY(state.y);
    if (catScale) {
      catScale.style.transition = "none";
      catScale.style.transformOrigin = "0px 0px";
      catScale.style.transform = "scale(" + state.scale.toFixed(3) + ")";
      catScale.setAttribute("data-stage", state.stage);
      catScale.setAttribute("data-stage-scale", state.stageScale.toFixed(2));
    }

    if (catFlip) {
      catFlip.style.transform = "scaleX(" + state.dir + ")";
    }

    if (forceSort || Math.abs(state.y - lastSortY) >= 2) {
      lastSortY = state.y;
      if (window.ELW_SCENE && typeof window.ELW_SCENE.sortDepth === "function") {
        try {
          window.ELW_SCENE.sortDepth();
        } catch (_e) {
          fallbackSortDepth();
        }
      } else {
        fallbackSortDepth();
      }
    }
  }

  function getNeedsInfo() {
    resolveCurrentStage();
    let energy = 80;
    let fun = 80;
    if (
      window.ELW_PET_NEEDS &&
      typeof window.ELW_PET_NEEDS.getNeeds === "function"
    ) {
      try {
        const needs = window.ELW_PET_NEEDS.getNeeds();
        if (needs && typeof needs === "object") {
          if (Number.isFinite(needs.energy)) energy = needs.energy;
          if (Number.isFinite(needs.fun)) fun = needs.fun;
        }
      } catch (_e) {
        // Default values
      }
    }
    return { energy: energy, fun: fun };
  }

  function resolveSpeedNeeds(distToTarget, distToChar, isCharWalking) {
    const needs = getNeedsInfo();
    const energy = needs.energy;
    const fun = needs.fun;
    const stageKey = resolveCurrentStage();
    const stageMult = STAGE_SPEED_MULT[stageKey] || 1.0;
    state.stage = stageKey;
    state.stageScale = STAGE_SCALES[stageKey] || 1.0;
    state.stageSpeedMult = stageMult;

    let maxSpeed = 185 * stageMult;
    if (energy < 25) {
      state.energyMode = "tired";
      maxSpeed = 110 * stageMult;
    } else if (fun >= 78 && energy >= 50) {
      state.energyMode = "excited";
      maxSpeed = 245 * stageMult;
    } else {
      state.energyMode = "normal";
      maxSpeed = (distToTarget > 160 ? 215 : 185) * stageMult;
    }

    if (isCharWalking || distToChar > 130) {
      const d = Math.max(distToChar || 0, distToTarget || 0);
      if (d > 150) {
        const over = clamp((d - 150) / 30, 0, 1);
        const catchupSpeed =
          energy < 25
            ? (190 + over * 95) * Math.max(0.95, stageMult)
            : state.energyMode === "excited"
            ? (360 + over * 240) * stageMult
            : (270 + over * 180) * Math.max(0.95, stageMult);
        maxSpeed = Math.max(maxSpeed, catchupSpeed);
      } else if (isCharWalking && d > 95) {
        const over = clamp((d - 95) / 55, 0, 1);
        const paceBoost =
          energy < 25
            ? (110 + over * 105) * stageMult
            : state.energyMode === "excited"
            ? (245 + over * 185) * stageMult
            : (185 + over * 135) * stageMult;
        maxSpeed = Math.max(maxSpeed, paceBoost);
      }
    }

    const slowRadius = isCharWalking ? 24 : 48;
    let desiredSpeed = maxSpeed;
    if (distToTarget < slowRadius) {
      const factor = clamp(distToTarget / slowRadius, 0.45, 1);
      desiredSpeed = maxSpeed * factor;
    }
    return desiredSpeed;
  }

  function enforceDistanceBounds(x, y, cs, boxes, isCharWalking, allowCatchupSlack) {
    const needs = getNeedsInfo();
    const minAllow = 54;
    const maxAllow = needs.energy < 25 ? 188 : 164;
    let nx = x;
    let ny = y;

    // 1. Keep outside minimum personal space (>= 30px at all times, target >= 54px)
    let dx = nx - cs.x;
    let dy = ny - cs.y;
    let dist = Math.hypot(dx, dy);

    if (dist < minAllow) {
      const charDir = cs.dir === -1 ? -1 : 1;
      const prefSideY = ny >= cs.y ? 1 : -1;
      // Candidate spots offset behind/side of character
      const candidates = [
        {
          x: cs.x - charDir * 58,
          y: cs.y + prefSideY * 24
        },
        {
          x: cs.x - charDir * 58,
          y: cs.y - prefSideY * 24
        },
        {
          x: cs.x,
          y: cs.y + prefSideY * 56
        },
        {
          x: cs.x,
          y: cs.y - prefSideY * 56
        },
        {
          x: cs.x + charDir * 58,
          y: cs.y + prefSideY * 24
        },
        {
          x: cs.x + charDir * 58,
          y: cs.y - prefSideY * 24
        }
      ];

      if (dist > 1) {
        const ux = dx / dist;
        const uy = dy / dist;
        candidates.unshift({
          x: cs.x + ux * 56,
          y: cs.y + uy * 56
        });
      }

      let picked = null;
      let bestMove = Infinity;
      for (let i = 0; i < candidates.length; i++) {
        const cx = clamp(candidates[i].x, BOUND_X_MIN, BOUND_X_MAX);
        const cy = clamp(candidates[i].y, BOUND_Y_MIN, BOUND_Y_MAX);
        if (isPointBlocked(cx, cy, boxes, 6)) continue;
        const dc = Math.hypot(cx - cs.x, cy - cs.y);
        if (dc < 50) continue;
        const dm = Math.hypot(cx - nx, cy - ny) + i * 3;
        if (dm < bestMove) {
          bestMove = dm;
          picked = { x: cx, y: cy };
        }
      }

      if (picked) {
        nx = picked.x;
        ny = picked.y;
      } else {
        const ux = dist > 1 ? dx / dist : -charDir;
        const uy = dist > 1 ? dy / dist : 0.35;
        const fallback = pushOutOfObstacles(
          cs.x + ux * 56,
          cs.y + uy * 56,
          boxes,
          6
        );
        if (Math.hypot(fallback.x - cs.x, fallback.y - cs.y) >= 46) {
          nx = fallback.x;
          ny = fallback.y;
        }
      }
    }

    // 2. Cap maximum distance when character is walking (<= ~168px normal, <= ~192px tired energy < 25)
    dx = nx - cs.x;
    dy = ny - cs.y;
    dist = Math.hypot(dx, dy);
    if (dist > maxAllow && isCharWalking && !allowCatchupSlack) {
      const ratio = maxAllow / dist;
      const pullX = cs.x + dx * ratio;
      const pullY = cs.y + dy * ratio;
      const safePull = pushOutOfObstacles(pullX, pullY, boxes, 6);
      const dSafe = Math.hypot(safePull.x - cs.x, safePull.y - cs.y);
      if (dSafe >= 50 && dSafe <= maxAllow + 4) {
        nx = safePull.x;
        ny = safePull.y;
      } else {
        // Search along ring around character within [50, maxAllow]
        const baseAng = Math.atan2(dy, dx);
        const offsets = [0, 0.25, -0.25, 0.5, -0.5, 0.8, -0.8, 1.1, -1.1];
        for (let i = 0; i < offsets.length; i++) {
          const ang = baseAng + offsets[i];
          const tx = clamp(
            cs.x + Math.cos(ang) * (maxAllow - 6),
            BOUND_X_MIN,
            BOUND_X_MAX
          );
          const ty = clamp(
            cs.y + Math.sin(ang) * (maxAllow - 6),
            BOUND_Y_MIN,
            BOUND_Y_MAX
          );
          if (!isPointBlocked(tx, ty, boxes, 6)) {
            const dtc = Math.hypot(tx - cs.x, ty - cs.y);
            if (dtc >= 50 && dtc <= maxAllow + 2) {
              nx = tx;
              ny = ty;
              break;
            }
          }
        }
      }
    }

    return { x: nx, y: ny };
  }

  function syncOnRoomChange(newRoom, charStateOrX, charYInput, charDirInput) {
    const snap = getCharStateSnapshot();
    let cs = snap;
    if (charStateOrX && typeof charStateOrX === "object") {
      cs = {
        room: charStateOrX.room || newRoom || snap.room || "living",
        x: Number.isFinite(charStateOrX.x) ? charStateOrX.x : snap.x,
        y: Number.isFinite(charStateOrX.y) ? charStateOrX.y : snap.y,
        dir: charStateOrX.dir === -1 ? -1 : 1
      };
    } else if (Number.isFinite(charStateOrX)) {
      cs = {
        room: newRoom || snap.room || "living",
        x: Number(charStateOrX),
        y: Number.isFinite(charYInput) ? Number(charYInput) : snap.y,
        dir: charDirInput === -1 ? -1 : charDirInput === 1 ? 1 : snap.dir
      };
    }
    const targetRoom = newRoom || cs.room || "living";
    const boxes = getObstaclesForRoom(targetRoom);
    const charDir = cs.dir === -1 ? -1 : 1;

    const target = computeFollowTarget(
      { x: Number.isFinite(cs.x) ? cs.x : 520, y: Number.isFinite(cs.y) ? cs.y : 495, dir: charDir },
      boxes
    );
    const bounded = enforceDistanceBounds(
      target.x,
      target.y,
      { x: Number.isFinite(cs.x) ? cs.x : 520, y: Number.isFinite(cs.y) ? cs.y : 495, dir: charDir },
      boxes,
      false
    );

    state.room = targetRoom;
    state.x = bounded.x;
    state.y = bounded.y;
    state.vx = 0;
    state.vy = 0;
    state.speed = 0;
    state.dir = charDir;
    state.targetX = bounded.x;
    state.targetY = bounded.y;
    state.waypoints = [];
    state.moving = false;
    state.stopTimerMs = 0;
    state.mode = "idle";
    state.distToChar = Math.hypot(
      (Number.isFinite(cs.x) ? cs.x : 520) - state.x,
      (Number.isFinite(cs.y) ? cs.y : 495) - state.y
    );
    lastRouteTargetX = bounded.x;
    lastRouteTargetY = bounded.y;

    applyDomTransform(true);
    notifySubscribers();
    return getPosition();
  }

  function stepFrame(dtSecInput) {
    const dt = clamp(Number.isFinite(dtSecInput) ? dtSecInput : 1 / 60, 0.001, 0.05);
    const dtMs = dt * 1000;
    const cs = getCharStateSnapshot();

    if (cs.room && cs.room !== state.room) {
      return syncOnRoomChange(cs.room, cs);
    }

    if (isYieldingNow()) {
      const catPosEl = document.getElementById("catPos");
      const domPt = parseTransformXY(catPosEl);
      if (domPt) {
        state.x = domPt.x;
        state.y = domPt.y;
      }
      state.vx = 0;
      state.vy = 0;
      state.speed = 0;
      state.moving = false;
      state.waypoints = [];
      state.mode = "yield";
      notifySubscribers();
      return getPosition();
    }

    const boxes = getObstaclesForRoom(state.room);

    // Ensure current position is never inside any obstacle
    if (isPointBlocked(state.x, state.y, boxes, 6)) {
      const pushedNow = pushOutOfObstacles(state.x, state.y, boxes, 8);
      state.x = pushedNow.x;
      state.y = pushedNow.y;
    }

    const target = computeFollowTarget(cs, boxes);
    state.targetX = target.x;
    state.targetY = target.y;

    let distToChar = Math.hypot(cs.x - state.x, cs.y - state.y);
    let distToTarget = Math.hypot(state.targetX - state.x, state.targetY - state.y);

    if (!state.moving) {
      if (
        distToChar > 98 ||
        distToChar < 46 ||
        (cs.walk && distToTarget > 20) ||
        isPointBlocked(state.x, state.y, boxes, 6)
      ) {
        state.moving = true;
        state.stopTimerMs = 0;
        lastRouteTargetX = -999;
        lastRouteTargetY = -999;
      }
    } else {
      const comfortablyParked =
        !cs.walk &&
        distToChar >= 46 &&
        distToChar <= 95 &&
        distToTarget <= 28 &&
        !isPointBlocked(state.x, state.y, boxes, 6);

      if ((!cs.walk && distToTarget <= 16) || comfortablyParked) {
        state.moving = false;
        state.vx = 0;
        state.vy = 0;
        state.speed = 0;
        state.waypoints = [];
        state.stopTimerMs = 180;
        state.mode = "stop";
      }
    }

    const prevX = state.x;
    const prevY = state.y;

    if (state.moving) {
      const targetMovedDist = Math.hypot(
        state.targetX - lastRouteTargetX,
        state.targetY - lastRouteTargetY
      );
      const curPt = { x: state.x, y: state.y };
      const goalPt = { x: state.targetX, y: state.targetY };

      if (
        !state.waypoints.length ||
        targetMovedDist > 22 ||
        isSegmentBlocked(curPt, state.waypoints[0], boxes, 4)
      ) {
        state.waypoints = computeSafeRoute(curPt, goalPt, state.room, boxes);
        lastRouteTargetX = state.targetX;
        lastRouteTargetY = state.targetY;
      }

      while (state.waypoints.length > 1) {
        const wp = state.waypoints[0];
        if (Math.hypot(wp.x - state.x, wp.y - state.y) <= 18) {
          state.waypoints.shift();
        } else {
          break;
        }
      }

      const activeWp = state.waypoints[0] || goalPt;
      let dx = activeWp.x - state.x;
      let dy = activeWp.y - state.y;
      let distWp = Math.hypot(dx, dy);

      if (distWp > 0.5) {
        const desiredSpeed = resolveSpeedNeeds(distToTarget, distToChar, cs.walk);
        const stepDist = Math.min(distWp, desiredSpeed * dt);
        let ux = dx / distWp;
        let uy = dy / distWp;

        // Lateral steering if step would pass too close (< 54px) to character
        const nextMidX = state.x + ux * (stepDist * 0.6);
        const nextMidY = state.y + uy * (stepDist * 0.6);
        const distMidChar = Math.hypot(nextMidX - cs.x, nextMidY - cs.y);
        if (distMidChar < 54) {
          const awayX = state.x - cs.x;
          const awayY = state.y - cs.y;
          const awayLen = Math.hypot(awayX, awayY) || 1;
          const ax = awayX / awayLen;
          const ay = awayY / awayLen;
          // Tangential + outward blend around character
          const cross = ux * ay - uy * ax;
          const tx = cross >= 0 ? -ay : ay;
          const ty = cross >= 0 ? ax : -ax;
          const bx = ux * 0.35 + tx * 0.45 + ax * 0.5;
          const by = uy * 0.35 + ty * 0.45 + ay * 0.5;
          const bLen = Math.hypot(bx, by) || 1;
          ux = bx / bLen;
          uy = by / bLen;
        }

        let nx = clamp(state.x + ux * stepDist, BOUND_X_MIN, BOUND_X_MAX);
        let ny = clamp(state.y + uy * stepDist, BOUND_Y_MIN, BOUND_Y_MAX);

        if (
          isPointBlocked(nx, ny, boxes, 6) ||
          isSegmentBlocked({ x: state.x, y: state.y }, { x: nx, y: ny }, boxes, 4)
        ) {
          const safeStep = pushOutOfObstacles(nx, ny, boxes, 8);
          nx = safeStep.x;
          ny = safeStep.y;
        }

        const bounded = enforceDistanceBounds(nx, ny, cs, boxes, cs.walk);
        nx = bounded.x;
        ny = bounded.y;

        const rawStepSpeed = Math.hypot(nx - prevX, ny - prevY) / dt;
        state.vx = (nx - prevX) / dt;
        state.vy = (ny - prevY) / dt;
        state.speed = Math.min(rawStepSpeed, desiredSpeed);
        state.x = nx;
        state.y = ny;

        if (Math.abs(state.vx) > 5) {
          state.dir = state.vx > 0 ? 1 : -1;
        }

        const newDistToChar = Math.hypot(cs.x - state.x, cs.y - state.y);
        if (newDistToChar > 150 || state.speed > 175) {
          state.mode = "run";
        } else if (state.energyMode === "tired") {
          state.mode = "walk";
        } else {
          state.mode = "walk";
        }
      } else {
        const bounded = enforceDistanceBounds(state.x, state.y, cs, boxes, cs.walk);
        state.x = bounded.x;
        state.y = bounded.y;
        state.vx = 0;
        state.vy = 0;
        state.speed = 0;
      }
    } else {
      const bounded = enforceDistanceBounds(state.x, state.y, cs, boxes, cs.walk);
      state.x = bounded.x;
      state.y = bounded.y;
      state.vx = 0;
      state.vy = 0;
      state.speed = 0;

      if (state.stopTimerMs > 0) {
        state.stopTimerMs = Math.max(0, state.stopTimerMs - dtMs);
        state.mode = state.stopTimerMs > 0 ? "stop" : "idle";
      } else {
        state.mode = "idle";
      }

      if (Math.abs(cs.x - state.x) > 18) {
        state.dir = cs.dir === -1 ? -1 : 1;
      }
    }

    state.distToChar = Math.hypot(cs.x - state.x, cs.y - state.y);
    state.normalizedSpeed = Math.round((state.speed / 180) * 100) / 100;

    applyDomTransform(false);
    notifySubscribers();
    return getPosition();
  }

  function loop(ts) {
    if (!state.running) return;
    if (document.hidden) {
      lastFrameTs = ts;
      rafId = window.requestAnimationFrame(loop);
      return;
    }
    const dtSec = lastFrameTs ? (ts - lastFrameTs) / 1000 : 1 / 60;
    lastFrameTs = ts;
    stepFrame(dtSec);
    rafId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (state.running) return;
    state.running = true;
    lastFrameTs = 0;
    rafId = window.requestAnimationFrame(loop);
  }

  function stop() {
    state.running = false;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function getPosition() {
    return {
      room: state.room,
      x: state.x,
      y: state.y,
      vx: state.vx,
      vy: state.vy,
      speed: state.speed,
      normalizedSpeed: Math.round((state.speed / 180) * 100) / 100,
      dir: state.dir,
      scale: state.scale,
      stage: state.stage,
      stageScale: state.stageScale,
      stageSpeedMult: state.stageSpeedMult,
      mode: state.mode,
      energyMode: state.energyMode,
      distToChar: state.distToChar || 0,
      targetX: state.targetX,
      targetY: state.targetY
    };
  }

  function getStage() {
    return resolveCurrentStage();
  }

  function getStageScale(stageArg) {
    const norm = normalizeStage(stageArg) || resolveCurrentStage();
    return STAGE_SCALES[norm] || 1.0;
  }

  function setStage(stageOrLevel, petId) {
    const norm = normalizeStage(stageOrLevel);
    if (!norm) return state.stage;
    const targetPet = petId || getActivePetId();
    manualStageOverride = norm;
    state.stage = norm;
    state.stageScale = STAGE_SCALES[norm] || 1.0;
    state.stageSpeedMult = STAGE_SPEED_MULT[norm] || 1.0;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("elw_pet_stage", norm);
        lastSeenDirectStage = norm;
        const rawV2 = localStorage.getItem("elw_pet_needs_v2");
        if (rawV2) {
          const parsed = JSON.parse(rawV2);
          if (parsed && typeof parsed === "object") {
            const lvlMap = { baby: 1, young: 2, teen: 3, adult: 4, elite: 5 };
            const lvl = lvlMap[norm] || 1;
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
            const nextRaw = JSON.stringify(parsed);
            localStorage.setItem("elw_pet_needs_v2", nextRaw);
            lastSeenRawV2 = nextRaw;
          }
        }
      }
    } catch (_e) {}
    if (window.ELW_PET_NEEDS) {
      try {
        if (typeof window.ELW_PET_NEEDS.setStage === "function") {
          window.ELW_PET_NEEDS.setStage(targetPet, norm);
        } else if (typeof window.ELW_PET_NEEDS.load === "function") {
          window.ELW_PET_NEEDS.load();
        }
      } catch (_e2) {}
    }
    applyDomTransform(false);
    notifySubscribers();
    return norm;
  }

  function syncStageScale(stageOrLevel) {
    const norm = normalizeStage(stageOrLevel);
    if (norm) {
      manualStageOverride = norm;
    }
    const resolved = norm || resolveCurrentStage();
    state.stage = resolved;
    state.stageScale = STAGE_SCALES[resolved] || 1.0;
    state.stageSpeedMult = STAGE_SPEED_MULT[resolved] || 1.0;
    applyDomTransform(false);
    return state.stageScale;
  }

  function setPosition(x, y, dir, roomOverride) {
    const targetRoom = roomOverride || state.room || "living";
    const boxes = getObstaclesForRoom(targetRoom);
    const safePt = pushOutOfObstacles(
      Number.isFinite(x) ? x : state.x,
      Number.isFinite(y) ? y : state.y,
      boxes,
      8
    );
    state.room = targetRoom;
    state.x = safePt.x;
    state.y = safePt.y;
    if (dir === 1 || dir === -1) state.dir = dir;
    state.vx = 0;
    state.vy = 0;
    state.speed = 0;
    state.waypoints = [];
    applyDomTransform(true);
    notifySubscribers();
    return getPosition();
  }

  function setYield(yieldingOrDuration, maybeDurationMs) {
    if (typeof yieldingOrDuration === "boolean") {
      if (!yieldingOrDuration) {
        state.yieldUntil = 0;
        if (state.mode === "yield") state.mode = "idle";
        return;
      }
      const ms = Number.isFinite(maybeDurationMs) ? Math.max(0, maybeDurationMs) : 1200;
      state.yieldUntil = Date.now() + ms;
      state.mode = "yield";
      state.moving = false;
      state.vx = 0;
      state.vy = 0;
      state.speed = 0;
      return;
    }
    const ms = Number.isFinite(yieldingOrDuration) ? Math.max(0, yieldingOrDuration) : 1200;
    state.yieldUntil = Date.now() + ms;
    if (ms > 0) {
      state.mode = "yield";
      state.moving = false;
      state.vx = 0;
      state.vy = 0;
      state.speed = 0;
    }
  }

  function isControlling() {
    return !isYieldingNow();
  }

  function subscribe(fn) {
    if (typeof fn !== "function") return function () {};
    subscribers.add(fn);
    return function () {
      subscribers.delete(fn);
    };
  }

  function syncImmediateCharBounds() {
    if (!state.running || isYieldingNow()) return;
    const cs = getCharStateSnapshot();
    if (cs.room && cs.room !== state.room) return;
    const dist = Math.hypot(cs.x - state.x, cs.y - state.y);
    if (dist < 34) {
      const boxes = getObstaclesForRoom(state.room);
      const bounded = enforceDistanceBounds(state.x, state.y, cs, boxes, false);
      state.x = bounded.x;
      state.y = bounded.y;
      state.distToChar = Math.hypot(cs.x - state.x, cs.y - state.y);
      applyDomTransform(false);
    }
  }

  function init() {
    if (initialized) {
      start();
      return getPosition();
    }
    initialized = true;

    const cs = getCharStateSnapshot();
    syncOnRoomChange(cs.room || "living", cs);

    if (typeof MutationObserver === "function") {
      try {
        const obs = new MutationObserver(function () {
          syncImmediateCharBounds();
        });
        const charPosEl = document.getElementById("charPos");
        if (charPosEl) {
          obs.observe(charPosEl, { attributes: true, attributeFilter: ["style"] });
        }
        const charWrapEl = document.getElementById("charWrap");
        if (charWrapEl) {
          obs.observe(charWrapEl, { attributes: true, attributeFilter: ["style", "class"] });
        }
      } catch (_e) {
        // Ignore observer errors
      }
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        lastFrameTs = 0;
      }
    });

    start();
    return getPosition();
  }

  window.ELW_PET_FOLLOW = {
    state: state,
    STAGE_SCALES: STAGE_SCALES,
    STAGE_SPEED_MULT: STAGE_SPEED_MULT,
    init: init,
    start: start,
    stop: stop,
    stepFrame: stepFrame,
    getPosition: getPosition,
    getState: getPosition,
    setPosition: setPosition,
    getStage: getStage,
    getStageScale: getStageScale,
    setStage: setStage,
    syncStageScale: syncStageScale,
    syncOnRoomChange: syncOnRoomChange,
    isControlling: isControlling,
    setYield: setYield,
    subscribe: subscribe
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
    });
  } else {
    setTimeout(init, 0);
  }
})();

