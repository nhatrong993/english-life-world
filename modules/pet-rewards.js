/* English Life World — modules/pet-rewards.js
   Agent C (Workstream 2.1): Per-Pet Reward Ledger (One-Time Objective Claim per PetId, Anti-Farm)
   & Premium Entitlement Guard (Strictly 10 Canonical Pet IDs, Topic Code Unlock Only).
   Exposes: window.ELW_PET_REWARDS and CommonJS module.exports */
(function (root, factory) {
  "use strict";
  const api = factory(root);
  if (typeof window !== "undefined") {
    window.ELW_PET_REWARDS = api;
  }
  if (root && typeof root === "object") {
    root.ELW_PET_REWARDS = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function (root) {
  "use strict";

  const LEDGER_STORAGE_KEY = "elw_pet_reward_ledger_v2";
  const PROGRESS_STORAGE_KEY = "elw_progress_v1";
  const PET_NEEDS_STORAGE_KEY = "elw_pet_needs_v2";
  const PET_LEGACY_STORAGE_KEY = "elw_pet_v1";
  const PET_V2_STORAGE_KEY = "elw_pet_v2";

  // Strictly 10 canonical Pet IDs — NO aliases (sunny/nimbus/pixel/leo/milo removed)
  const FREE_PETS = Object.freeze(["milu", "mochi"]);
  const PREMIUM_PETS = Object.freeze([
    "boba",
    "cookie",
    "pepper",
    "oreo",
    "ember",
    "lumi",
    "pip",
    "aqua"
  ]);
  const ALL_PETS = Object.freeze(FREE_PETS.concat(PREMIUM_PETS));

  const TOPICS_STORAGE_KEY = "elw_topics_v1";

  const PREMIUM_LIMITATION_VI =
    "Nhập mã mở khoá trong bảng chọn chủ đề (Mở khoá Premium) để mở toàn bộ 6 chủ đề học và cả 8 thú cưng Premium (Boba, Cookie, Pepper, Oreo, Ember, Lumi, Pip, Aqua)! Bạn cũng có thể Xem trước (Preview) đủ 10 trạng thái hoạt ảnh của thú cưng hoặc đồng hành miễn phí cùng Milu & Mochi.";

  // In-memory backup ledger in case localStorage is unavailable: { byPetId: { [petId]: { [objectiveKey]: entry } } }
  let memoryLedgerByPet = Object.create(null);

  function getStorage() {
    try {
      if (root && root.localStorage) return root.localStorage;
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (e) {}
    return null;
  }

  function isPremiumUnlocked() {
    const store = getStorage();
    if (!store) return false;
    try {
      const raw = store.getItem(TOPICS_STORAGE_KEY);
      if (!raw) return false;
      const st = JSON.parse(raw);
      return Boolean(st && st.unlocked === true);
    } catch (e) {
      return false;
    }
  }

  function normalizePetId(petId) {
    if (typeof petId !== "string") return "";
    return petId.trim().toLowerCase();
  }

  function isValidCanonicalPetId(petId) {
    const norm = normalizePetId(petId);
    return ALL_PETS.indexOf(norm) !== -1;
  }

  function getCurrentActivePetId() {
    const needsApi =
      (root && root.ELW_PET_NEEDS) ||
      (typeof window !== "undefined" ? window.ELW_PET_NEEDS : null);
    if (needsApi && typeof needsApi.getActivePetId === "function") {
      try {
        const active = normalizePetId(needsApi.getActivePetId());
        if (isValidCanonicalPetId(active)) return active;
      } catch (e) {}
    }
    const store = getStorage();
    if (store) {
      try {
        const raw = store.getItem(PET_NEEDS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.activePetId === "string") {
            const candidate = normalizePetId(parsed.activePetId);
            if (isValidCanonicalPetId(candidate)) return candidate;
          }
        }
      } catch (e) {}
    }
    return "milu";
  }

  function parseCompositeObjectiveKey(rawKey) {
    if (typeof rawKey !== "string" && typeof rawKey !== "number") {
      return { petId: "", objectiveKey: "" };
    }
    const trimmed = String(rawKey).trim();
    if (!trimmed) return { petId: "", objectiveKey: "" };

    // Support optional "pet:<petId>:<key>" or "<petId>:<key>" prefixes
    const parts = trimmed.split(":");
    if (parts.length >= 3 && parts[0].toLowerCase() === "pet" && isValidCanonicalPetId(parts[1])) {
      return {
        petId: normalizePetId(parts[1]),
        objectiveKey: parts.slice(2).join(":").trim()
      };
    }
    if (parts.length >= 2 && isValidCanonicalPetId(parts[0])) {
      return {
        petId: normalizePetId(parts[0]),
        objectiveKey: parts.slice(1).join(":").trim()
      };
    }
    return { petId: "", objectiveKey: trimmed };
  }

  function normalizeObjectiveKey(objectiveKey) {
    const parsed = parseCompositeObjectiveKey(objectiveKey);
    return parsed.objectiveKey;
  }

  function resolvePetAndObjectiveArgs(arg1, arg2, arg3) {
    // Pattern 1: (petId, objectiveKey, rewardSpec) where arg1 is a canonical petId and arg2 is a non-pet string
    if (
      typeof arg1 === "string" &&
      isValidCanonicalPetId(arg1) &&
      typeof arg2 === "string" &&
      arg2.trim().length > 0 &&
      !isValidCanonicalPetId(arg2)
    ) {
      const parsed2 = parseCompositeObjectiveKey(arg2);
      return {
        petId: normalizePetId(arg1),
        objectiveKey: parsed2.objectiveKey,
        rewardSpec: arg3
      };
    }

    // Pattern 2: (objectiveKey, rewardSpecOrPetId, maybePetIdOrOpts)
    const parsed1 = parseCompositeObjectiveKey(arg1);
    let explicitPetId = parsed1.petId;

    if (!explicitPetId) {
      if (typeof arg3 === "string" && isValidCanonicalPetId(arg3)) {
        explicitPetId = normalizePetId(arg3);
      } else if (arg3 && typeof arg3 === "object" && isValidCanonicalPetId(arg3.petId)) {
        explicitPetId = normalizePetId(arg3.petId);
      } else if (typeof arg2 === "string" && isValidCanonicalPetId(arg2)) {
        explicitPetId = normalizePetId(arg2);
      } else if (arg2 && typeof arg2 === "object" && isValidCanonicalPetId(arg2.petId)) {
        explicitPetId = normalizePetId(arg2.petId);
      }
    }

    const resolvedPetId = isValidCanonicalPetId(explicitPetId) ? explicitPetId : getCurrentActivePetId();
    const rewardSpec = (arg2 && typeof arg2 === "object") ? arg2 : (arg3 && typeof arg3 === "object" ? arg3 : {});

    return {
      petId: resolvedPetId,
      objectiveKey: parsed1.objectiveKey,
      rewardSpec: rewardSpec
    };
  }

  function normalizeRewardSpec(rewardSpec) {
    const spec = rewardSpec && typeof rewardSpec === "object" ? rewardSpec : {};
    return {
      stars: Math.max(0, Math.floor(Number(spec.stars) || 0)),
      xp: Math.max(0, Math.floor(Number(spec.xp) || 0)),
      treats: Math.max(0, Math.floor(Number(spec.treats) || 0)),
      water: Math.max(0, Math.floor(Number(spec.water) || 0)),
      toys: Math.max(0, Math.floor(Number(spec.toys) || 0)),
      bond: Math.max(0, Math.floor(Number(spec.bond) || 0)),
      labelVi: String(spec.labelVi || spec.label || "Hoàn thành mục tiêu")
    };
  }

  function cloneEntry(entry, fallbackPetId) {
    if (!entry || typeof entry !== "object") return null;
    const petId = isValidCanonicalPetId(entry.petId)
      ? normalizePetId(entry.petId)
      : (isValidCanonicalPetId(fallbackPetId) ? normalizePetId(fallbackPetId) : "milu");
    return {
      petId: petId,
      objectiveKey: String(entry.objectiveKey || ""),
      claimed: true,
      claimedAt: Number(entry.claimedAt) || Date.now(),
      reward: normalizeRewardSpec(entry.reward)
    };
  }

  function createEmptyByPetMap() {
    const map = Object.create(null);
    ALL_PETS.forEach(function (id) {
      map[id] = Object.create(null);
    });
    return map;
  }

  function readRawLedgerByPet() {
    const store = getStorage();
    if (!store) {
      const out = createEmptyByPetMap();
      Object.keys(memoryLedgerByPet).forEach(function (petId) {
        if (!isValidCanonicalPetId(petId)) return;
        const petEntries = memoryLedgerByPet[petId];
        if (!petEntries || typeof petEntries !== "object") return;
        Object.keys(petEntries).forEach(function (k) {
          out[petId][k] = cloneEntry(petEntries[k], petId);
        });
      });
      return out;
    }

    let raw = null;
    try {
      raw = store.getItem(LEDGER_STORAGE_KEY);
    } catch (e) {
      raw = null;
    }

    if (!raw) {
      memoryLedgerByPet = createEmptyByPetMap();
      return createEmptyByPetMap();
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return createEmptyByPetMap();
      }

      const byPet = createEmptyByPetMap();
      const defaultOwnerPet = getCurrentActivePetId();

      // 1. Read structured byPetId map if present
      if (parsed.byPetId && typeof parsed.byPetId === "object" && !Array.isArray(parsed.byPetId)) {
        Object.keys(parsed.byPetId).forEach(function (rawPetKey) {
          const petId = normalizePetId(rawPetKey);
          if (!isValidCanonicalPetId(petId)) return;
          const petMap = parsed.byPetId[rawPetKey];
          if (!petMap || typeof petMap !== "object") return;
          Object.keys(petMap).forEach(function (rawObjKey) {
            const parsedKey = parseCompositeObjectiveKey(rawObjKey);
            const objKey = parsedKey.objectiveKey;
            if (!objKey) return;
            const val = petMap[rawObjKey];
            if (val && typeof val === "object") {
              byPet[petId][objKey] = {
                petId: petId,
                objectiveKey: objKey,
                claimed: true,
                claimedAt: Number(val.claimedAt) || Date.now(),
                reward: normalizeRewardSpec(val.reward)
              };
            }
          });
        });
      }

      // 2. Migrate any legacy flat entries at root or in parsed.entries
      const flatSource =
        parsed.entries && typeof parsed.entries === "object" && !Array.isArray(parsed.entries)
          ? parsed.entries
          : parsed;
      Object.keys(flatSource).forEach(function (rawKey) {
        if (
          rawKey === "schemaVersion" ||
          rawKey === "version" ||
          rawKey === "updatedAt" ||
          rawKey === "byPetId" ||
          rawKey === "entries"
        ) {
          return;
        }
        const val = flatSource[rawKey];
        if (!val || typeof val !== "object" || Array.isArray(val)) return;
        // Skip if this is actually a petId map without claimed boolean
        if (isValidCanonicalPetId(rawKey) && val.claimed === undefined && val.objectiveKey === undefined) {
          const petId = normalizePetId(rawKey);
          Object.keys(val).forEach(function (innerKey) {
            const innerVal = val[innerKey];
            const parsedInner = parseCompositeObjectiveKey(innerKey);
            if (parsedInner.objectiveKey && innerVal && typeof innerVal === "object") {
              byPet[petId][parsedInner.objectiveKey] = {
                petId: petId,
                objectiveKey: parsedInner.objectiveKey,
                claimed: true,
                claimedAt: Number(innerVal.claimedAt) || Date.now(),
                reward: normalizeRewardSpec(innerVal.reward)
              };
            }
          });
          return;
        }

        const parsedComposite = parseCompositeObjectiveKey(rawKey);
        const objKey = parsedComposite.objectiveKey;
        if (!objKey) return;
        const targetPet = isValidCanonicalPetId(val.petId)
          ? normalizePetId(val.petId)
          : (isValidCanonicalPetId(parsedComposite.petId) ? parsedComposite.petId : defaultOwnerPet);
        if (!byPet[targetPet][objKey]) {
          byPet[targetPet][objKey] = {
            petId: targetPet,
            objectiveKey: objKey,
            claimed: true,
            claimedAt: Number(val.claimedAt) || Date.now(),
            reward: normalizeRewardSpec(val.reward)
          };
        }
      });

      memoryLedgerByPet = byPet;
      return byPet;
    } catch (e) {
      return createEmptyByPetMap();
    }
  }

  function writeRawLedgerByPet(byPetMap) {
    const cleanByPet = {};
    ALL_PETS.forEach(function (petId) {
      cleanByPet[petId] = {};
      const sourcePetMap = byPetMap && byPetMap[petId];
      if (!sourcePetMap || typeof sourcePetMap !== "object") return;
      Object.keys(sourcePetMap).forEach(function (k) {
        const key = normalizeObjectiveKey(k);
        if (!key) return;
        cleanByPet[petId][key] = cloneEntry(sourcePetMap[k], petId);
      });
    });

    memoryLedgerByPet = cleanByPet;

    const payload = {
      schemaVersion: 2,
      updatedAt: Date.now(),
      byPetId: cleanByPet
    };

    const store = getStorage();
    if (store) {
      try {
        store.setItem(LEDGER_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {}
    }
    return cleanByPet;
  }

  function getLedger(petId) {
    const byPet = readRawLedgerByPet();
    const resolvedPetId = isValidCanonicalPetId(petId) ? normalizePetId(petId) : getCurrentActivePetId();
    const activePetEntries = byPet[resolvedPetId] || {};
    const result = {};

    Object.keys(activePetEntries).forEach(function (k) {
      result[k] = cloneEntry(activePetEntries[k], resolvedPetId);
    });

    const fullByPetCopy = {};
    ALL_PETS.forEach(function (id) {
      fullByPetCopy[id] = {};
      const pm = byPet[id] || {};
      Object.keys(pm).forEach(function (k) {
        fullByPetCopy[id][k] = cloneEntry(pm[k], id);
      });
    });

    Object.defineProperty(result, "entries", {
      value: result,
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(result, "byPetId", {
      value: fullByPetCopy,
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(result, "petId", {
      value: resolvedPetId,
      enumerable: false,
      configurable: true
    });

    return result;
  }

  function hasClaimed(arg1, arg2) {
    const resolved = resolvePetAndObjectiveArgs(arg1, arg2);
    if (!resolved.objectiveKey) return false;
    const byPet = readRawLedgerByPet();
    const petMap = byPet[resolved.petId];
    return Boolean(petMap && petMap[resolved.objectiveKey] && petMap[resolved.objectiveKey].claimed);
  }

  function getClaimedCount(petId) {
    const byPet = readRawLedgerByPet();
    const resolvedPetId = isValidCanonicalPetId(petId) ? normalizePetId(petId) : getCurrentActivePetId();
    const petMap = byPet[resolvedPetId] || {};
    return Object.keys(petMap).length;
  }

  function getObjectiveStatus(arg1, arg2) {
    const resolved = resolvePetAndObjectiveArgs(arg1, arg2);
    const key = resolved.objectiveKey;
    const petId = resolved.petId;
    if (!key) {
      return {
        petId: petId,
        objectiveKey: "",
        claimed: false,
        claimedAt: null,
        reward: null,
        ledgerEntry: null
      };
    }
    const byPet = readRawLedgerByPet();
    const petMap = byPet[petId] || {};
    const entry = petMap[key] ? cloneEntry(petMap[key], petId) : null;
    if (!entry) {
      return {
        petId: petId,
        objectiveKey: key,
        claimed: false,
        claimedAt: null,
        reward: null,
        ledgerEntry: null
      };
    }
    return {
      petId: petId,
      objectiveKey: key,
      claimed: true,
      claimedAt: entry.claimedAt,
      reward: normalizeRewardSpec(entry.reward),
      ledgerEntry: entry
    };
  }

  function applyStarsReward(stars) {
    const amount = Math.max(0, Math.floor(Number(stars) || 0));
    if (amount <= 0) return 0;

    const store = getStorage();
    if (store) {
      try {
        const curS = Math.max(0, Math.floor(Number(store.getItem("elw_s")) || 0));
        store.setItem("elw_s", String(curS + amount));
      } catch (e) {}
    }

    const elw = (root && root.ELW) || (typeof window !== "undefined" ? window.ELW : null);
    if (elw && typeof elw.addPts === "function") {
      try {
        elw.addPts(amount);
        return amount;
      } catch (e) {}
    }

    // Fallback: update elw_progress_v1 + #pts DOM directly if ELW.addPts is not initialized yet
    let totalPts = amount;
    if (store) {
      try {
        const raw = store.getItem(PROGRESS_STORAGE_KEY);
        const prog = raw ? JSON.parse(raw) : {};
        const safeProg = prog && typeof prog === "object" ? prog : {};
        safeProg.pts = Math.max(0, Math.floor(Number(safeProg.pts) || 0)) + amount;
        totalPts = safeProg.pts;
        store.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(safeProg));
      } catch (e) {}
    }

    try {
      const doc = (root && root.document) || (typeof document !== "undefined" ? document : null);
      if (doc && typeof doc.getElementById === "function") {
        const ptsEl = doc.getElementById("pts");
        if (ptsEl) {
          const currentDomPts = Math.floor(Number(ptsEl.textContent) || 0);
          ptsEl.textContent = String(store ? totalPts : currentDomPts + amount);
        }
      }
    } catch (e) {}

    return amount;
  }

  function applyPetNeedsReward(reward, targetPetId) {
    const xp = Math.max(0, Math.floor(Number(reward.xp) || 0));
    const treats = Math.max(0, Math.floor(Number(reward.treats) || 0));
    const water = Math.max(0, Math.floor(Number(reward.water) || 0));
    const toys = Math.max(0, Math.floor(Number(reward.toys) || 0));
    const bond = Math.max(0, Math.floor(Number(reward.bond) || 0));
    const petId = isValidCanonicalPetId(targetPetId) ? normalizePetId(targetPetId) : getCurrentActivePetId();

    if (xp === 0 && treats === 0 && water === 0 && toys === 0 && bond === 0) {
      return false;
    }

    const needsApi =
      (root && root.ELW_PET_NEEDS) ||
      (typeof window !== "undefined" ? window.ELW_PET_NEEDS : null);

    let handledByApi = false;

    if (needsApi && typeof needsApi === "object") {
      try {
        if (typeof needsApi.applyRewardPayload === "function") {
          needsApi.applyRewardPayload({
            petId: petId,
            xp: xp,
            treats: treats,
            water: water,
            toys: toys,
            bond: bond
          });
          handledByApi = true;
        } else {
          let anyMethodCalled = false;

          if (xp > 0) {
            if (typeof needsApi.addXp === "function") {
              needsApi.addXp(xp, petId);
              anyMethodCalled = true;
            } else if (typeof needsApi.gainXp === "function") {
              needsApi.gainXp(xp, petId);
              anyMethodCalled = true;
            }
          }

          if (bond > 0) {
            if (typeof needsApi.addBond === "function") {
              needsApi.addBond(bond, petId);
              anyMethodCalled = true;
            } else if (typeof needsApi.applyNeedDelta === "function" && petId === getCurrentActivePetId()) {
              needsApi.applyNeedDelta({ bond: bond });
              anyMethodCalled = true;
            }
          }

          if (treats > 0 || water > 0 || toys > 0) {
            if (typeof needsApi.addInventory === "function") {
              needsApi.addInventory({ treats: treats, water: water, toys: toys });
              anyMethodCalled = true;
            } else if (typeof needsApi.addItems === "function") {
              needsApi.addItems({ treats: treats, water: water, toys: toys });
              anyMethodCalled = true;
            }
          }

          handledByApi = anyMethodCalled;
        }
      } catch (e) {}
    }

    if (handledByApi) {
      return true;
    }

    // Fallback: persist directly into elw_pet_needs_v2 in localStorage
    const store = getStorage();
    if (!store) return false;
    try {
      const raw = store.getItem(PET_NEEDS_STORAGE_KEY);
      const state = raw ? JSON.parse(raw) : {};
      const safeState = state && typeof state === "object" ? state : {};

      if (safeState.byPetId && safeState.byPetId[petId]) {
        const rec = safeState.byPetId[petId];
        if (xp > 0) {
          rec.xp = Math.max(0, Math.floor(Number(rec.xp) || 0)) + xp;
        }
        if (bond > 0 && rec.needs && typeof rec.needs === "object") {
          rec.needs.bond = Math.min(100, Math.max(0, Math.floor(Number(rec.needs.bond) || 0)) + bond);
        }
      }

      if (!safeState.stats || typeof safeState.stats !== "object") {
        safeState.stats = { xp: 0, level: 1, streak: 1 };
      }
      if (xp > 0 && (!safeState.activePetId || safeState.activePetId === petId)) {
        safeState.stats.xp = Math.max(0, Math.floor(Number(safeState.stats.xp) || 0)) + xp;
      }

      if (!safeState.needs || typeof safeState.needs !== "object") {
        safeState.needs = { energy: 80, hunger: 80, thirst: 80, fun: 80, bond: 50 };
      }
      if (bond > 0 && (!safeState.activePetId || safeState.activePetId === petId)) {
        safeState.needs.bond = Math.min(100, Math.max(0, Math.floor(Number(safeState.needs.bond) || 0)) + bond);
      }

      if (!safeState.inventory || typeof safeState.inventory !== "object") {
        safeState.inventory = { treats: 0, water: 0, toys: 0 };
      }
      if (treats > 0) {
        safeState.inventory.treats =
          Math.max(0, Math.floor(Number(safeState.inventory.treats) || 0)) + treats;
      }
      if (water > 0) {
        safeState.inventory.water =
          Math.max(0, Math.floor(Number(safeState.inventory.water) || 0)) + water;
      }
      if (toys > 0) {
        safeState.inventory.toys =
          Math.max(0, Math.floor(Number(safeState.inventory.toys) || 0)) + toys;
      }

      store.setItem(PET_NEEDS_STORAGE_KEY, JSON.stringify(safeState));
      return true;
    } catch (e) {
      return false;
    }
  }

  function claimObjectiveReward(arg1, arg2, arg3) {
    const resolved = resolvePetAndObjectiveArgs(arg1, arg2, arg3);
    const key = resolved.objectiveKey;
    const petId = resolved.petId;

    if (!key) {
      return {
        granted: false,
        duplicate: false,
        petId: petId,
        objectiveKey: "",
        reason: "invalid_objective_key",
        ledgerEntry: null
      };
    }

    const byPet = readRawLedgerByPet();
    if (!byPet[petId]) {
      byPet[petId] = Object.create(null);
    }

    if (byPet[petId][key] && byPet[petId][key].claimed) {
      return {
        granted: false,
        duplicate: true,
        petId: petId,
        objectiveKey: key,
        reason: "already_claimed",
        ledgerEntry: cloneEntry(byPet[petId][key], petId)
      };
    }

    const reward = normalizeRewardSpec(resolved.rewardSpec);
    const entry = {
      petId: petId,
      objectiveKey: key,
      claimed: true,
      claimedAt: Date.now(),
      reward: reward
    };

    byPet[petId][key] = entry;
    writeRawLedgerByPet(byPet);

    if (reward.stars > 0) {
      applyStarsReward(reward.stars);
    }
    applyPetNeedsReward(reward, petId);

    return {
      granted: true,
      duplicate: false,
      petId: petId,
      objectiveKey: key,
      reward: Object.assign({}, reward),
      ledgerEntry: cloneEntry(entry, petId)
    };
  }

  function resetPetLedger(petId) {
    const norm = normalizePetId(petId);
    if (!isValidCanonicalPetId(norm)) return false;
    const byPet = readRawLedgerByPet();
    byPet[norm] = Object.create(null);
    writeRawLedgerByPet(byPet);
    return true;
  }

  function resetForTest() {
    memoryLedgerByPet = createEmptyByPetMap();
    const store = getStorage();
    if (store) {
      try {
        store.removeItem(LEDGER_STORAGE_KEY);
      } catch (e) {}
    }
    return true;
  }

  function getAllowedPetsList() {
    return isPremiumUnlocked() ? ALL_PETS : FREE_PETS;
  }

  function isPetUnlocked(petId) {
    const id = normalizePetId(petId);
    if (FREE_PETS.indexOf(id) !== -1) return true;
    if (PREMIUM_PETS.indexOf(id) !== -1) return isPremiumUnlocked();
    return false;
  }

  function isPremiumPet(petId) {
    const id = normalizePetId(petId);
    return PREMIUM_PETS.indexOf(id) !== -1;
  }

  function verifyPetEntitlement(petId) {
    const id = normalizePetId(petId);

    if (FREE_PETS.indexOf(id) !== -1) {
      return {
        unlocked: true,
        tier: "free",
        mode: "full",
        previewOnly: false,
        backendVerified: true
      };
    }

    if (PREMIUM_PETS.indexOf(id) !== -1) {
      if (isPremiumUnlocked()) {
        return {
          unlocked: true,
          tier: "premium",
          mode: "full",
          previewOnly: false,
          backendVerified: true
        };
      }
      return {
        unlocked: false,
        tier: "premium",
        mode: "preview_locked",
        previewOnly: true,
        backendVerified: false,
        limitationVi: PREMIUM_LIMITATION_VI
      };
    }

    return {
      unlocked: false,
      tier: "unknown",
      mode: "preview_locked",
      previewOnly: true,
      backendVerified: false,
      limitationVi: PREMIUM_LIMITATION_VI
    };
  }

  function getSafeActivePetId(candidatePetId) {
    const id = normalizePetId(candidatePetId);
    return isPetUnlocked(id) ? id : "milu";
  }

  function sanitizePetStateObject(obj, keyName, violations) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      return { modified: false, activePetId: "milu" };
    }

    const allowedPets = getAllowedPetsList();
    let modified = false;
    const idFields = ["activePetId", "petId", "selectedPetId", "currentPetId", "companionId"];
    let resolvedActivePet = "milu";

    idFields.forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(obj, field)) {
        const val = normalizePetId(obj[field]);
        if (allowedPets.indexOf(val) === -1) {
          violations.push({
            storageKey: keyName,
            field: field,
            invalidValue: obj[field],
            revertedTo: "milu"
          });
          obj[field] = "milu";
          modified = true;
        } else {
          resolvedActivePet = val;
        }
      }
    });

    if (!Object.prototype.hasOwnProperty.call(obj, "activePetId")) {
      if (Object.prototype.hasOwnProperty.call(obj, "petId") && allowedPets.indexOf(normalizePetId(obj.petId)) !== -1) {
        resolvedActivePet = normalizePetId(obj.petId);
      }
      obj.activePetId = resolvedActivePet;
      modified = true;
    }

    // Remove any non-canonical pet keys from byPetId/pets if present
    ["byPetId", "pets"].forEach(function (mapField) {
      if (obj[mapField] && typeof obj[mapField] === "object" && !Array.isArray(obj[mapField])) {
        Object.keys(obj[mapField]).forEach(function (k) {
          if (!isValidCanonicalPetId(k)) {
            delete obj[mapField][k];
            modified = true;
          }
        });
      }
    });

    const listFields = ["unlockedPets", "ownedPets"];
    listFields.forEach(function (field) {
      if (Object.prototype.hasOwnProperty.call(obj, field)) {
        const arr = Array.isArray(obj[field]) ? obj[field] : [];
        const hasUnauthorized = arr.some(function (p) {
          return allowedPets.indexOf(normalizePetId(p)) === -1;
        });
        if (hasUnauthorized || arr.length !== allowedPets.length) {
          violations.push({
            storageKey: keyName,
            field: field,
            invalidValue: obj[field],
            revertedTo: allowedPets.slice()
          });
          obj[field] = allowedPets.slice();
          modified = true;
        }
      }
    });

    if (!isPremiumUnlocked()) {
      const flagFields = ["premiumUnlocked", "proUnlocked", "isPro", "allPetsUnlocked", "entitlementBypass"];
      flagFields.forEach(function (field) {
        if (obj[field] === true || (obj[field] && obj[field] !== false)) {
          violations.push({
            storageKey: keyName,
            field: field,
            invalidValue: obj[field],
            revertedTo: false
          });
          obj[field] = false;
          modified = true;
        }
      });
    }

    return { modified: modified, activePetId: obj.activePetId || resolvedActivePet };
  }

  function enforceEntitlementIntegrity() {
    const store = getStorage();
    const violations = [];
    const sanitizedKeys = [];
    const allowedPets = getAllowedPetsList();
    let activePetId = "milu";

    if (!store) {
      return {
        valid: true,
        tampered: false,
        activePetId: activePetId,
        sanitizedKeys: sanitizedKeys,
        violations: violations,
        allowedPets: allowedPets
      };
    }

    const keysToInspect = [PET_LEGACY_STORAGE_KEY, PET_NEEDS_STORAGE_KEY, PET_V2_STORAGE_KEY];

    keysToInspect.forEach(function (storageKey) {
      let raw = null;
      try {
        raw = store.getItem(storageKey);
      } catch (e) {
        raw = null;
      }
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          violations.push({
            storageKey: storageKey,
            field: "root",
            invalidValue: raw,
            revertedTo: { activePetId: "milu", petId: "milu" }
          });
          store.setItem(storageKey, JSON.stringify({ activePetId: "milu", petId: "milu" }));
          sanitizedKeys.push(storageKey);
          return;
        }

        const result = sanitizePetStateObject(parsed, storageKey, violations);
        if (allowedPets.indexOf(normalizePetId(result.activePetId)) !== -1) {
          activePetId = normalizePetId(result.activePetId);
        }
        if (result.modified) {
          store.setItem(storageKey, JSON.stringify(parsed));
          sanitizedKeys.push(storageKey);
        }
      } catch (e) {
        violations.push({
          storageKey: storageKey,
          field: "json",
          invalidValue: raw,
          revertedTo: { activePetId: "milu", petId: "milu" }
        });
        try {
          store.setItem(storageKey, JSON.stringify({ activePetId: "milu", petId: "milu" }));
          sanitizedKeys.push(storageKey);
        } catch (err) {}
      }
    });

    return {
      valid: violations.length === 0,
      tampered: violations.length > 0,
      activePetId: activePetId,
      sanitizedKeys: sanitizedKeys,
      violations: violations,
      allowedPets: allowedPets
    };
  }

  // Run integrity enforcement automatically on module load
  enforceEntitlementIntegrity();

  return Object.freeze({
    LEDGER_STORAGE_KEY: LEDGER_STORAGE_KEY,
    TOPICS_STORAGE_KEY: TOPICS_STORAGE_KEY,
    FREE_PETS: FREE_PETS,
    PREMIUM_PETS: PREMIUM_PETS,
    ALL_PETS: ALL_PETS,
    PREMIUM_LIMITATION_VI: PREMIUM_LIMITATION_VI,
    hasClaimed: hasClaimed,
    claimObjectiveReward: claimObjectiveReward,
    getLedger: getLedger,
    getClaimedCount: getClaimedCount,
    getObjectiveStatus: getObjectiveStatus,
    resetPetLedger: resetPetLedger,
    resetForTest: resetForTest,
    verifyPetEntitlement: verifyPetEntitlement,
    isPetUnlocked: isPetUnlocked,
    isPremiumPet: isPremiumPet,
    isPremiumUnlocked: isPremiumUnlocked,
    getSafeActivePetId: getSafeActivePetId,
    enforceEntitlementIntegrity: enforceEntitlementIntegrity
  });
});
