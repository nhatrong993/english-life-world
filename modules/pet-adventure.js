/* English Life World — modules/pet-adventure.js
   Agent A5: Pet Adventure Quest Unified Engine
   Unifies Entry Point 1 (Context Bar "Đi chơi cùng Pet" -> entrySource: "context_bar")
   and Entry Point 2 (Home Pet Click -> "Dẫn đi chơi" -> entrySource: "home_pet")
   into ONE shared adventure session ("elw_pet_adventure_v2") and ONE 8-part unified state:
   activePetId, adventureSession, context, validator, needs, inventory, dialogue, rewardLedger.
   Exposes: window.ELW_PET_ADVENTURE and CommonJS module.exports */
(function (root, factory) {
  "use strict";
  const api = factory(root);
  if (typeof window !== "undefined") {
    window.ELW_PET_ADVENTURE = api;
  }
  if (root && typeof root === "object") {
    root.ELW_PET_ADVENTURE = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function (root) {
  "use strict";

  const STORAGE_KEY = "elw_pet_adventure_v2";
  const HOME_ROOMS = ["living", "kitchen", "bedroom", "bathroom", "garage", "garden"];
  const OBJECTIVE_IDS = Object.freeze(["greet_context", "care_bond", "contextual_practice"]);
  const VALID_WEATHERS = Object.freeze(["sunny", "rainy", "cold", "windy", "hot"]);
  const VALID_SITUATIONS = Object.freeze(["normal", "rush", "weekend", "sick", "bargain", "traveler", "lost"]);

  /* Fallback 10-Pet Roster Metadata when ELW_PET_NEEDS / ELW_PET_DATA is not yet initialized */
  const FALLBACK_PETS = Object.freeze({
    milu:   { id: "milu",   name: "Milu",   icon: "🐕", species: "dog",  speciesVi: "Cún Corgi Vàng",         tier: "free",    sound: "Woof! Woof! 🐾" },
    mochi:  { id: "mochi",  name: "Mochi",  icon: "🐱", species: "cat",  speciesVi: "Mèo Trắng Kem",          tier: "free",    sound: "Meow~ Purr! 🐾" },
    boba:   { id: "boba",   name: "Boba",   icon: "🐶", species: "dog",  speciesVi: "Cún Corgi Trà Sữa",      tier: "premium", sound: "Arf arf! 🧋🐾" },
    cookie: { id: "cookie", name: "Cookie", icon: "🐕", species: "dog",  speciesVi: "Cún Shiba Bánh Quy",     tier: "premium", sound: "Woof~ 🍪🐾" },
    pepper: { id: "pepper", name: "Pepper", icon: "🐈", species: "cat",  speciesVi: "Mèo Anh Lông Ngắn",      tier: "premium", sound: "Purr... 🐾" },
    oreo:   { id: "oreo",   name: "Oreo",   icon: "🐈‍⬛", species: "cat",  speciesVi: "Mèo Tuxedo Lịch Lãm",    tier: "premium", sound: "Mew! 🎩🐾" },
    ember:  { id: "ember",  name: "Ember",  icon: "🐉", species: "rare", speciesVi: "Rồng Nhỏ Ấm Áp",         tier: "premium", sound: "Roar-squeak! 🔥" },
    lumi:   { id: "lumi",   name: "Lumi",   icon: "🦄", species: "rare", speciesVi: "Kỳ Lân Ánh Sao",         tier: "premium", sound: "Sparkle~ ✨" },
    pip:    { id: "pip",    name: "Pip",    icon: "🦊", species: "rare", speciesVi: "Cáo Tuyết Bắc Cực",      tier: "premium", sound: "Yip yip! ❄️" },
    aqua:   { id: "aqua",   name: "Aqua",   icon: "🦦", species: "rare", speciesVi: "Rái Cá Ngọc Biển",       tier: "premium", sound: "Chirp-splash! 🌊" }
  });

  const PLACE_META = Object.freeze({
    home:       { id: "home",       nameVi: "nhà",                     nameEn: "Home",                npcName: "Mom",           npcLabel: "Mom 👩",            npcIcon: "👩",   voice: "mom" },
    park:       { id: "park",       nameVi: "Công viên",              nameEn: "Greenwood Park",      npcName: "Park Staff",    npcLabel: "Park Staff 🌳",     npcIcon: "🌳",   voice: "clerk" },
    cafe:       { id: "cafe",       nameVi: "Quán cà phê",            nameEn: "Cozy Café",           npcName: "Barista",       npcLabel: "Barista 🧑‍🍳",      npcIcon: "🧑‍🍳", voice: "barista" },
    market:     { id: "market",     nameVi: "Siêu thị",               nameEn: "Fresh Supermarket",   npcName: "Store Greeter", npcLabel: "Store Greeter 💁",  npcIcon: "💁",   voice: "clerk" },
    restaurant: { id: "restaurant", nameVi: "Nhà hàng",               nameEn: "Bistro Restaurant",   npcName: "Waiter",        npcLabel: "Waiter 🍽️",        npcIcon: "🍽️",  voice: "waiter" },
    outdoor:    { id: "outdoor",    nameVi: "Khu dã ngoại & Cắm trại",nameEn: "Pine Valley Camp",    npcName: "Park Ranger",   npcLabel: "Park Ranger 🏕️",   npcIcon: "🏕️",  voice: "ranger" },
    camping:    { id: "camping",    nameVi: "Khu cắm trại",           nameEn: "Pine Valley Camp",    npcName: "Park Ranger",   npcLabel: "Park Ranger 🏕️",   npcIcon: "🏕️",  voice: "ranger" },
    school:     { id: "school",     nameVi: "Trường học",             nameEn: "Sunshine School",     npcName: "Teacher",       npcLabel: "Teacher 👩‍🏫",      npcIcon: "👩‍🏫", voice: "teacher" }
  });

  const WEATHER_META = Object.freeze({
    sunny: { id: "sunny", icon: "☀️", vi: "Nắng đẹp", en: "Sunny" },
    rainy: { id: "rainy", icon: "🌧️", vi: "Trời mưa", en: "Rainy" },
    cold:  { id: "cold",  icon: "❄️", vi: "Trời lạnh", en: "Cold" },
    windy: { id: "windy", icon: "🌬️", vi: "Gió mát",  en: "Windy" },
    hot:   { id: "hot",   icon: "🥵", vi: "Nóng bức", en: "Hot" }
  });

  const SITUATION_META = Object.freeze({
    normal:   { id: "normal",   icon: "😊", vi: "Bình thường",            en: "Everyday Chill" },
    rush:     { id: "rush",     icon: "🏃", vi: "Đang vội",               en: "In a Hurry" },
    weekend:  { id: "weekend",  icon: "🎉", vi: "Đi chơi cuối tuần",      en: "Weekend Hangout" },
    sick:     { id: "sick",     icon: "🤒", vi: "Hơi mệt / Cảm nhẹ",      en: "Under the Weather" },
    bargain:  { id: "bargain",  icon: "💸", vi: "Săn giảm giá",           en: "Bargain Hunting" },
    traveler: { id: "traveler", icon: "🧳", vi: "Khách du lịch / Hỏi đường", en: "Traveler Mode" },
    lost:     { id: "lost",     icon: "🔍", vi: "Tìm đồ thất lạc",        en: "Lost & Found" }
  });

  let memorySession = null;
  let lastObservedEngineCtx = null;
  let validatorState = {
    lastCheckedAction: null,
    lastVerifiedAt: 0,
    lastPracticedPhrase: null,
    lastPetInteraction: null
  };
  const subscribers = [];
  let isSyncingWalkDog = false;

  function getStorage() {
    try {
      if (root && root.localStorage) return root.localStorage;
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (e) {}
    return null;
  }

  function getNeedsEngine() {
    return (root && root.ELW_PET_NEEDS) || (typeof window !== "undefined" ? window.ELW_PET_NEEDS : null);
  }

  function getContextEngine() {
    return (root && root.ELW_CONTEXT) || (typeof window !== "undefined" ? window.ELW_CONTEXT : null);
  }

  function getRewardsEngine() {
    return (root && root.ELW_PET_REWARDS) || (typeof window !== "undefined" ? window.ELW_PET_REWARDS : null);
  }

  /* ---------- Normalization Helpers ---------- */
  function normalizePlaceAndZone(rawInput) {
    const input = rawInput && typeof rawInput === "object" ? rawInput : { place: rawInput };
    const rawPlace = String(input.place || input.room || input.zone || "home").toLowerCase().trim();
    const rawZone = String(input.zone || input.room || rawPlace || "living").toLowerCase().trim();

    if (HOME_ROOMS.indexOf(rawPlace) !== -1 || rawPlace === "home") {
      const z = HOME_ROOMS.indexOf(rawZone) !== -1 ? rawZone : (HOME_ROOMS.indexOf(rawPlace) !== -1 ? rawPlace : "living");
      return { place: "home", zone: z };
    }
    if (
      rawPlace === "market" ||
      rawPlace.indexOf("market_") === 0 ||
      rawZone.indexOf("market_") === 0 ||
      ["entrance", "produce", "bakery", "dairy", "frozen", "meat", "seafood", "checkout", "service"].indexOf(rawZone) !== -1
    ) {
      let mz = "market";
      const zStr = rawZone + " " + rawPlace;
      if (/produce|bakery|fruit|veg/.test(zStr)) mz = "market_produce";
      else if (/dairy|frozen|drink|milk/.test(zStr)) mz = "market_dairy";
      else if (/meat|seafood|fish|butcher|household/.test(zStr)) mz = "market_meat";
      else if (/checkout|cashier|pay|service/.test(zStr)) mz = "market_checkout";
      return { place: "market", zone: mz };
    }
    if (rawPlace.indexOf("park") === 0 || rawZone.indexOf("park") === 0) {
      return { place: "park", zone: rawZone || "park" };
    }
    if (rawPlace.indexOf("cafe") === 0 || rawZone.indexOf("cafe") === 0) {
      return { place: "cafe", zone: rawZone || "cafe" };
    }
    if (rawPlace.indexOf("restaurant") === 0 || rawZone.indexOf("restaurant") === 0) {
      return { place: "restaurant", zone: rawZone || "restaurant" };
    }
    if (rawPlace.indexOf("school") === 0 || rawZone.indexOf("school") === 0) {
      return { place: "school", zone: rawZone || "school" };
    }
    if (rawPlace === "camping" || rawZone === "camping") {
      return { place: "camping", zone: "camping" };
    }
    if (rawPlace.indexOf("outdoor") === 0 || rawZone.indexOf("outdoor") === 0) {
      return { place: "outdoor", zone: "outdoor" };
    }
    if (PLACE_META[rawPlace]) {
      return { place: rawPlace, zone: rawZone || rawPlace };
    }
    return { place: "home", zone: "living" };
  }

  function normalizeWeather(w) {
    const s = String(w || "sunny").toLowerCase().trim();
    if (s === "rain" || s === "rainy") return "rainy";
    if (VALID_WEATHERS.indexOf(s) !== -1) return s;
    return "sunny";
  }

  function normalizeSituation(sit) {
    const s = String(sit || "normal").toLowerCase().trim();
    if (s === "tired" || s === "sick") return "sick";
    if (s === "hurry" || s === "rush") return "rush";
    if (s === "sale" || s === "discount" || s === "bargain") return "bargain";
    if (VALID_SITUATIONS.indexOf(s) !== -1) return s;
    return "normal";
  }

  function normalizeObjectiveId(objId) {
    const raw = String(objId || "").trim();
    if (!raw) return "";
    if (OBJECTIVE_IDS.indexOf(raw) !== -1) return raw;
    const parts = raw.split(":");
    const tail = parts[parts.length - 1];
    if (OBJECTIVE_IDS.indexOf(tail) !== -1) return tail;
    if (raw === "step_1" || raw === "1" || raw === "greet") return "greet_context";
    if (raw === "step_2" || raw === "2" || raw === "care") return "care_bond";
    if (raw === "step_3" || raw === "3" || raw === "practice") return "contextual_practice";
    return raw;
  }

  function makeObjectiveKey(place, objId) {
    const normPlace = normalizePlaceAndZone({ place: place }).place;
    const normObj = normalizeObjectiveId(objId);
    return "adv:" + normPlace + ":" + normObj;
  }

  /* ---------- Direct Readers from Shared Engines ---------- */
  function readActivePetId() {
    const needsApi = getNeedsEngine();
    if (needsApi && typeof needsApi.getActivePetId === "function") {
      try {
        const id = String(needsApi.getActivePetId() || "").toLowerCase().trim();
        if (id) return id;
      } catch (e) {}
    }
    const rewardsApi = getRewardsEngine();
    if (rewardsApi && typeof rewardsApi.getSafeActivePetId === "function") {
      try {
        return rewardsApi.getSafeActivePetId("milu");
      } catch (e) {}
    }
    return "milu";
  }

  function readActivePetProfile(petIdOverride) {
    const pid = String(petIdOverride || readActivePetId() || "milu").toLowerCase().trim();
    const needsApi = getNeedsEngine();
    if (needsApi) {
      try {
        if (typeof needsApi.getPetProfile === "function") {
          const p = needsApi.getPetProfile(pid);
          if (p && p.name) return Object.assign({}, FALLBACK_PETS[pid] || FALLBACK_PETS.milu, p);
        }
        if (typeof needsApi.getActivePet === "function" && !petIdOverride) {
          const p = needsApi.getActivePet();
          if (p && p.name) return Object.assign({}, FALLBACK_PETS[pid] || FALLBACK_PETS.milu, p);
        }
        if (typeof needsApi.getPet === "function") {
          const p = needsApi.getPet(pid);
          if (p && p.name) return Object.assign({}, FALLBACK_PETS[pid] || FALLBACK_PETS.milu, p);
        }
      } catch (e) {}
    }
    return Object.assign({}, FALLBACK_PETS[pid] || FALLBACK_PETS.milu);
  }

  function readNeeds() {
    const needsApi = getNeedsEngine();
    if (needsApi && typeof needsApi.getNeeds === "function") {
      try {
        const n = needsApi.getNeeds();
        if (n && typeof n === "object") {
          return {
            energy: Number.isFinite(Number(n.energy)) ? Number(n.energy) : 85,
            hunger: Number.isFinite(Number(n.hunger)) ? Number(n.hunger) : 80,
            thirst: Number.isFinite(Number(n.thirst)) ? Number(n.thirst) : 82,
            fun: Number.isFinite(Number(n.fun)) ? Number(n.fun) : 85,
            bond: Number.isFinite(Number(n.bond)) ? Number(n.bond) : 20
          };
        }
      } catch (e) {}
    }
    return { energy: 85, hunger: 80, thirst: 82, fun: 85, bond: 20 };
  }

  function readInventory() {
    const needsApi = getNeedsEngine();
    if (needsApi && typeof needsApi.getInventory === "function") {
      try {
        const inv = needsApi.getInventory();
        if (inv && typeof inv === "object") {
          const waterVal = Number.isFinite(Number(inv.water))
            ? Number(inv.water)
            : (Number.isFinite(Number(inv.waterBottles)) ? Number(inv.waterBottles) : 3);
          return Object.assign({}, inv, {
            treats: Number.isFinite(Number(inv.treats)) ? Number(inv.treats) : 3,
            water: waterVal,
            toys: Number.isFinite(Number(inv.toys)) ? Number(inv.toys) : 2
          });
        }
      } catch (e) {}
    }
    return { treats: 3, water: 3, toys: 2 };
  }

  function readRawEngineContext() {
    const ctxApi = getContextEngine();
    let raw = {};
    if (ctxApi && typeof ctxApi.getLiveContext === "function") {
      try {
        raw = ctxApi.getLiveContext() || {};
      } catch (e) {
        raw = {};
      }
    } else if (root && root.ELW && typeof root.ELW.state === "function") {
      try {
        const w = root.ELW.state() || {};
        raw = { room: w.room || "living", zone: w.room || "living", weather: "sunny", situation: "normal" };
      } catch (e) {}
    }
    const pz = normalizePlaceAndZone(raw);
    return {
      raw: raw,
      place: pz.place,
      zone: pz.zone,
      weather: normalizeWeather(raw.weather),
      situation: normalizeSituation(raw.situation),
      withPet: Boolean(raw.withPet),
      withLinh: Boolean(raw.withLinh),
      withFamily: Boolean(raw.withFamily !== undefined ? raw.withFamily : (pz.place === "home"))
    };
  }

  function readLiveContext(ctxOverride) {
    const eng = readRawEngineContext();
    const hasExplicitOverride = Boolean(
      ctxOverride &&
      typeof ctxOverride === "object" &&
      (ctxOverride.place !== undefined ||
        ctxOverride.room !== undefined ||
        ctxOverride.zone !== undefined ||
        ctxOverride.weather !== undefined ||
        ctxOverride.situation !== undefined)
    );

    if (hasExplicitOverride) {
      lastObservedEngineCtx = {
        place: eng.place,
        zone: eng.zone,
        weather: eng.weather,
        situation: eng.situation
      };
    }

    const engineChangedPlace =
      !lastObservedEngineCtx ||
      eng.place !== lastObservedEngineCtx.place ||
      eng.zone !== lastObservedEngineCtx.zone;
    const engineChangedWeather =
      !lastObservedEngineCtx || eng.weather !== lastObservedEngineCtx.weather;
    const engineChangedSituation =
      !lastObservedEngineCtx || eng.situation !== lastObservedEngineCtx.situation;

    if (engineChangedPlace || engineChangedWeather || engineChangedSituation) {
      lastObservedEngineCtx = {
        place: eng.place,
        zone: eng.zone,
        weather: eng.weather,
        situation: eng.situation
      };
    }

    const basePlace = !engineChangedPlace && memorySession && memorySession.place ? memorySession.place : eng.place;
    const baseZone = !engineChangedPlace && memorySession && memorySession.zone ? memorySession.zone : eng.zone;
    const baseWeather = !engineChangedWeather && memorySession && memorySession.weather ? memorySession.weather : eng.weather;
    const baseSituation = !engineChangedSituation && memorySession && memorySession.situation ? memorySession.situation : eng.situation;

    const merged = Object.assign(
      {},
      eng.raw,
      {
        place: basePlace,
        zone: baseZone,
        weather: baseWeather,
        situation: baseSituation
      },
      ctxOverride || {}
    );

    const pz = (ctxOverride && (ctxOverride.place || ctxOverride.room || ctxOverride.zone))
      ? normalizePlaceAndZone(ctxOverride)
      : { place: basePlace, zone: baseZone };
    const weather = (ctxOverride && ctxOverride.weather) ? normalizeWeather(ctxOverride.weather) : baseWeather;
    const situation = (ctxOverride && ctxOverride.situation) ? normalizeSituation(ctxOverride.situation) : baseSituation;
    const withPet = Boolean(
      ctxOverride && ctxOverride.withPet !== undefined
        ? ctxOverride.withPet
        : (eng.withPet || (memorySession && memorySession.active))
    );
    const withLinh = Boolean(
      ctxOverride && ctxOverride.withLinh !== undefined ? ctxOverride.withLinh : eng.withLinh
    );
    const withFamily = Boolean(
      ctxOverride && ctxOverride.withFamily !== undefined ? ctxOverride.withFamily : (pz.place === "home")
    );

    return Object.assign({}, eng.raw, {
      place: pz.place,
      zone: pz.zone,
      room: (ctxOverride && ctxOverride.room) || eng.raw.room || pz.zone || pz.place,
      weather: weather,
      situation: situation,
      withPet: withPet,
      withLinh: withLinh,
      withFamily: withFamily
    });
  }

  function readRewardLedger() {
    const rewardsApi = getRewardsEngine();
    if (rewardsApi && typeof rewardsApi.getLedger === "function") {
      try {
        return rewardsApi.getLedger();
      } catch (e) {}
    }
    return {};
  }

  function isObjectiveClaimedInLedger(objectiveKey) {
    const rewardsApi = getRewardsEngine();
    if (rewardsApi && typeof rewardsApi.hasClaimed === "function") {
      try {
        return Boolean(rewardsApi.hasClaimed(objectiveKey));
      } catch (e) {}
    }
    const ledger = readRewardLedger();
    return Boolean(ledger && ledger[objectiveKey] && ledger[objectiveKey].claimed);
  }

  /* ---------- Contextual Sentence & Dialogue Builders ---------- */
  function buildGreetSentenceForContext(place, zone, weather, situation, petProfile) {
    const petName = (petProfile && petProfile.name) || "Milu";
    const petSound = (petProfile && petProfile.sound) || "Woof! Woof! 🐾";

    if (place === "park") {
      if (weather === "sunny") {
        return {
          en: `Look at the bright sunshine in the park, ${petName}! Let's walk along the trail.`,
          vi: `Nhìn ánh nắng rực rỡ trong công viên kìa, ${petName}! Cùng đi dạo dọc đường mòn nhé.`,
          replyEn: `${petSound} *trots happily along the sunny park trail beside you*`,
          replyVi: `${petSound} *chạy lon ton vui vẻ dọc đường mòn nắng đẹp bên cạnh bạn*`,
          chunk: "walk along the trail"
        };
      }
      if (weather === "rainy") {
        return {
          en: `It's raining lightly in the park, ${petName}! Let's stay under the umbrella by the pavilion.`,
          vi: `Trời đang mưa nhẹ trong công viên kìa, ${petName}! Mình đi dưới ô gần chòi nghỉ mát nhé.`,
          replyEn: `${petSound} *steps carefully past the raindrops and stays dry under your umbrella*`,
          replyVi: `${petSound} *bước khéo léo qua các giọt mưa và nép gọn dưới ô của bạn*`,
          chunk: "under the umbrella"
        };
      }
      if (weather === "cold") {
        return {
          en: `The park air is chilly today, ${petName}! Let's jog along the park path to warm up.`,
          vi: `Không khí công viên hôm nay se lạnh quá, ${petName}! Mình chạy bộ nhẹ dọc lối đi cho ấm người nhé.`,
          replyEn: `${petSound} *jogs briskly beside you with a cozy scarf*`,
          replyVi: `${petSound} *chạy bộ hào hứng bên cạnh bạn*`,
          chunk: "jog to warm up"
        };
      }
      if (weather === "windy") {
        return {
          en: `Feel the cool breeze across the park lawn, ${petName}! Stay close by the lake path.`,
          vi: `Cảm nhận làn gió mát qua bãi cỏ công viên kìa, ${petName}! Đi sát bên mình dọc lối ven hồ nhé.`,
          replyEn: `${petSound} *ears flutter in the park breeze while walking right beside you*`,
          replyVi: `${petSound} *đôi tai rung rinh trong gió mát công viên khi đi sát bên bạn*`,
          chunk: "cool breeze in the park"
        };
      }
      /* hot */
      return {
        en: `It's a hot day in the park, ${petName}! Let's walk in the cool shade under the oak trees.`,
        vi: `Hôm nay công viên nắng nóng quá, ${petName}! Mình đi bộ dưới bóng râm mát mẻ của hàng cây sồi nhé.`,
        replyEn: `${petSound} *relaxes happily in the cool tree shade with you*`,
        replyVi: `${petSound} *vui vẻ đi dưới bóng cây mát rượi cùng bạn*`,
        chunk: "in the cool shade"
      };
    }

    if (place === "cafe") {
      if (weather === "rainy") {
        return {
          en: `It's raining outside, ${petName}! Let's stay dry by the café table.`,
          vi: `Ngoài trời đang mưa kìa, ${petName}! Mình ngồi khô ráo ấm áp cạnh bàn cà phê nhé.`,
          replyEn: `${petSound} *curls up cozily beside the café table while watching the rain*`,
          replyVi: `${petSound} *nằm cuộn tròn ấm áp cạnh bàn cà phê ngắm mưa rơi*`,
          chunk: "stay dry by the café table"
        };
      }
      if (weather === "sunny") {
        return {
          en: `What a bright sunny day at the café, ${petName}! Let's sit by the sunny window table.`,
          vi: `Một ngày nắng đẹp tại quán cà phê, ${petName} nhỉ! Mình ngồi ở bàn cạnh cửa sổ ngập nắng nhé.`,
          replyEn: `${petSound} *sits politely beside your chair at the sunny café table*`,
          replyVi: `${petSound} *ngồi ngoan ngoãn cạnh ghế của bạn bên bàn cà phê nắng ấm*`,
          chunk: "sunny window table"
        };
      }
      if (weather === "cold") {
        return {
          en: `It's chilly outside, ${petName}! Let's warm up inside this cozy café together.`,
          vi: `Ngoài trời đang lạnh đấy, ${petName}! Mình vào trong quán cà phê ấm cúng này sưởi ấm nhé.`,
          replyEn: `${petSound} *enjoys the warm aroma of roasted coffee and bakery treats*`,
          replyVi: `${petSound} *thích thú tận hưởng hương cà phê ấm áp và bánh nướng thơm lừng*`,
          chunk: "warm up inside the café"
        };
      }
      if (weather === "windy") {
        return {
          en: `The wind is blowing outside, ${petName}! Let's relax at this sheltered café corner.`,
          vi: `Ngoài trời đang nổi gió kìa, ${petName}! Mình thư giãn ở góc quán cà phê kín gió này nhé.`,
          replyEn: `${petSound} *rests calmly by your feet in the cozy café corner*`,
          replyVi: `${petSound} *nằm thư giãn ngoan ngoãn dưới chân bạn ở góc quán ấm cúng*`,
          chunk: "sheltered café corner"
        };
      }
      /* hot */
      return {
        en: `Phew, it's hot outside, ${petName}! Let's cool down by the café table with some cold water.`,
        vi: `Phù, ngoài trời nóng quá, ${petName} ơi! Mình ngồi mát cạnh bàn cà phê và uống chút nước mát nhé.`,
        replyEn: `${petSound} *wags happily in the cool café breeze*`,
        replyVi: `${petSound} *vui vẻ tận hưởng không khí mát lạnh trong quán cà phê*`,
        chunk: "cool down at the café"
      };
    }

    if (place === "market") {
      if (weather === "rainy") {
        return {
          en: `Stay close to the shopping cart, ${petName}, while we pick fresh food on this rainy day.`,
          vi: `Đi sát bên xe đẩy siêu thị nhé, ${petName}, trong lúc mình chọn đồ ăn tươi ngon ngày mưa này.`,
          replyEn: `${petSound} *walks neatly right beside the shopping cart aisle*`,
          replyVi: `${petSound} *đi ngay ngắn sát cạnh chiếc xe đẩy trong dãy siêu thị*`,
          chunk: "stay close to the shopping cart"
        };
      }
      if (weather === "hot") {
        return {
          en: `Stay close to the shopping cart, ${petName}, while we pick fresh food and chilled fruit.`,
          vi: `Đi sát bên xe đẩy nhé, ${petName}, trong lúc mình chọn thực phẩm tươi và trái cây mát lạnh.`,
          replyEn: `${petSound} *trots politely beside the cart near the cool produce aisle*`,
          replyVi: `${petSound} *đi ngoan ngoãn cạnh xe đẩy gần quầy rau quả mát mẻ*`,
          chunk: "pick fresh food"
        };
      }
      if (weather === "cold") {
        return {
          en: `Stay close to the shopping cart, ${petName}, while we pick fresh food for a warm dinner.`,
          vi: `Đi sát bên xe đẩy nhé, ${petName}, trong lúc mình chọn thực phẩm tươi nấu bữa tối ấm áp.`,
          replyEn: `${petSound} *watches the grocery shelves curiously beside you*`,
          replyVi: `${petSound} *tò mò ngắm nhìn các kệ hàng siêu thị bên cạnh bạn*`,
          chunk: "stay close to the shopping cart"
        };
      }
      return {
        en: `Stay close to the shopping cart, ${petName}, while we pick fresh food.`,
        vi: `Đi sát bên xe đẩy siêu thị nhé, ${petName}, trong lúc mình chọn thực phẩm tươi ngon.`,
        replyEn: `${petSound} *stays right beside the shopping cart and wags happily*`,
        replyVi: `${petSound} *đi sát cạnh xe đẩy siêu thị và vẫy đuôi vui vẻ*`,
        chunk: "stay close to the shopping cart"
      };
    }

    if (place === "restaurant") {
      if (weather === "rainy") {
        return {
          en: `It's raining outside, ${petName}! Sit politely under our restaurant table while we order a warm meal.`,
          vi: `Ngoài trời đang mưa kìa, ${petName}! Ngồi ngoan dưới bàn nhà hàng trong lúc mình gọi món nóng nhé.`,
          replyEn: `${petSound} *sits quietly beside your table at the cozy restaurant*`,
          replyVi: `${petSound} *ngồi ngoan ngoãn cạnh bàn ăn trong nhà hàng ấm cúng*`,
          chunk: "order a warm meal"
        };
      }
      if (weather === "hot") {
        return {
          en: `It's hot outside today, ${petName}! Let's rest at this cool restaurant table by the window.`,
          vi: `Hôm nay ngoài trời nóng quá, ${petName}! Mình nghỉ ngơi ở bàn nhà hàng mát mẻ cạnh cửa sổ nhé.`,
          replyEn: `${petSound} *relaxes happily beside the restaurant window table*`,
          replyVi: `${petSound} *thư giãn vui vẻ cạnh bàn cửa sổ nhà hàng*`,
          chunk: "restaurant table by the window"
        };
      }
      return {
        en: `Good job, ${petName}! Sit politely by our restaurant table while we look at the menu.`,
        vi: `Ngoan lắm, ${petName}! Ngồi lịch sự cạnh bàn nhà hàng trong lúc mình xem thực đơn nhé.`,
        replyEn: `${petSound} *sits politely like a five-star companion at the restaurant*`,
        replyVi: `${petSound} *ngồi ngoan chuẩn người bạn đồng hành 5 sao tại nhà hàng*`,
        chunk: "look at the menu"
      };
    }

    if (place === "outdoor" || place === "camping") {
      if (weather === "rainy") {
        return {
          en: `It's raining at the campsite, ${petName}! Let's stay dry under the waterproof camping tent.`,
          vi: `Ở khu cắm trại đang mưa kìa, ${petName}! Mình trú khô ráo dưới chiếc lều chống thấm nhé.`,
          replyEn: `${petSound} *snuggles happily inside the dry camping tent with you*`,
          replyVi: `${petSound} *rúc vào trong lều cắm trại khô ráo cùng bạn*`,
          chunk: "waterproof camping tent"
        };
      }
      if (weather === "cold") {
        return {
          en: `It's chilly in the forest tonight, ${petName}! Let's sit safely near the warm campfire.`,
          vi: `Trong rừng tối nay se lạnh quá, ${petName}! Mình ngồi an toàn gần bếp lửa trại ấm áp nhé.`,
          replyEn: `${petSound} *warms up happily near the glowing campfire ring*`,
          replyVi: `${petSound} *sưởi ấm vui vẻ gần vòng lửa trại rực hồng*`,
          chunk: "near the warm campfire"
        };
      }
      if (weather === "windy") {
        return {
          en: `The mountain breeze is strong today, ${petName}! Let's hike along the sheltered pine trail.`,
          vi: `Gió núi hôm nay thổi mạnh đấy, ${petName}! Mình đi bộ dọc đường mòn đồi thông kín gió nhé.`,
          replyEn: `${petSound} *leads the way eagerly along the pine forest trail*`,
          replyVi: `${petSound} *hào hứng dẫn đường dọc lối mòn rừng thông*`,
          chunk: "sheltered pine trail"
        };
      }
      if (weather === "hot") {
        return {
          en: `It's a hot day at the campsite, ${petName}! Let's rest in the cool shade by the mountain stream.`,
          vi: `Hôm nay khu cắm trại nắng nóng quá, ${petName}! Mình nghỉ dưới bóng mát bên bờ suối núi nhé.`,
          replyEn: `${petSound} *splashes paws happily in the cool mountain stream*`,
          replyVi: `${petSound} *vui vẻ chạm chân xuống dòng suối mát lạnh*`,
          chunk: "by the mountain stream"
        };
      }
      return {
        en: `What a sunny day at Pine Valley Camp, ${petName}! Let's explore the nature trail together.`,
        vi: `Một ngày nắng đẹp ở khu cắm trại Thung lũng Thông, ${petName} ơi! Cùng khám phá đường mòn thiên nhiên nhé.`,
        replyEn: `${petSound} *sniffs the pine cones and trots along the nature trail*`,
        replyVi: `${petSound} *đánh hơi những quả thông và chạy lon ton trên đường mòn*`,
        chunk: "explore the nature trail"
      };
    }

    if (place === "school") {
      if (weather === "rainy") {
        return {
          en: `It's raining outside the schoolyard, ${petName}! Let's review our English flashcards in the hallway.`,
          vi: `Ngoài sân trường đang mưa kìa, ${petName}! Mình ôn thẻ từ vựng tiếng Anh ở hành lang nhé.`,
          replyEn: `${petSound} *listens attentively to every English word you read*`,
          replyVi: `${petSound} *chăm chú lắng nghe từng từ tiếng Anh bạn đọc*`,
          chunk: "review English flashcards"
        };
      }
      return {
        en: `Welcome to the school courtyard, ${petName}! Let's practice our English lesson together today.`,
        vi: `Chào mừng tới sân trường, ${petName}! Hôm nay mình cùng ôn bài học tiếng Anh nhé.`,
        replyEn: `${petSound} *perks up ears eagerly to practice English with you*`,
        replyVi: `${petSound} *vểnh tai hào hứng cùng bạn luyện tập tiếng Anh*`,
        chunk: "practice our English lesson"
      };
    }

    /* home (default) */
    if (weather === "rainy") {
      return {
        en: `Come here, ${petName}! Are you ready to go out for an adventure together after this cozy rain?`,
        vi: `Lại đây nào, ${petName}! Bạn đã sẵn sàng cho một chuyến phiêu lưu cùng mình trong ngày mưa ấm cúng này chưa?`,
        replyEn: `${petSound} *runs over excitedly and wags tail by the living room door*`,
        replyVi: `${petSound} *chạy tới hào hứng và vẫy đuôi cạnh cửa phòng khách*`,
        chunk: "go out for an adventure"
      };
    }
    if (weather === "cold") {
      return {
        en: `Come here, ${petName}! It's chilly today—are you ready to go out for an adventure together?`,
        vi: `Lại đây nào, ${petName}! Hôm nay trời se lạnh—bạn đã sẵn sàng đi phiêu lưu cùng mình chưa?`,
        replyEn: `${petSound} *bounces happily, ready to head out with you*`,
        replyVi: `${petSound} *nhảy lên vui vẻ, sẵn sàng lên đường cùng bạn*`,
        chunk: "go out for an adventure"
      };
    }
    return {
      en: `Come here, ${petName}! Are you ready to go out for an adventure together?`,
      vi: `Lại đây nào, ${petName}! Bạn đã sẵn sàng ra ngoài phiêu lưu cùng mình chưa?`,
      replyEn: `${petSound} *spins around happily and waits by your side for the adventure*`,
      replyVi: `${petSound} *xoay vòng mừng rỡ và đứng cạnh bạn sẵn sàng cho chuyến phiêu lưu*`,
      chunk: "go out for an adventure"
    };
  }

  function buildCareSentenceForContext(place, weather, petProfile, needs) {
    const petName = (petProfile && petProfile.name) || "Milu";
    const petSound = (petProfile && petProfile.sound) || "Woof! Woof! 🐾";
    const n = needs || { energy: 85, hunger: 80, thirst: 82, fun: 85, bond: 20 };

    if (weather === "hot" || n.thirst < 60) {
      return {
        en: `Here is some fresh cool water and a tasty treat for you, ${petName}! Stay hydrated!`,
        vi: `Nước mát trong lành và bánh thưởng ngon cho ${petName} đây! Uống cho đỡ khát nhé!`,
        replyEn: `${petSound} *drinks the cool water happily and feels refreshed* 💧`,
        replyVi: `${petSound} *uống nước mát ngon lành và tràn đầy sảng khoái* 💧`,
        chunk: "stay hydrated",
        recommendedActions: ["water", "feed", "pet", "play"]
      };
    }
    if (weather === "cold" || n.hunger < 60) {
      return {
        en: `Here is a warm, yummy snack and a gentle pat for you, ${petName}! Good job staying energized!`,
        vi: `Bánh thưởng thơm ngon và cái xoa đầu ấm áp cho ${petName} đây! Giữ năng lượng thật tốt nhé!`,
        replyEn: `${petSound} *munches the treat happily and nuzzles your hand* 🍖`,
        replyVi: `${petSound} *nhai bánh thưởng ngon lành và dụi đầu vào tay bạn* 🍖`,
        chunk: "staying energized",
        recommendedActions: ["feed", "pet", "water", "play"]
      };
    }
    if (n.energy < 55) {
      return {
        en: `You did great, ${petName}! Let's take a cozy rest and have some water to recharge your energy.`,
        vi: `Làm tốt lắm, ${petName}! Cùng nghỉ ngơi một lát và uống nước để nạp lại năng lượng nhé.`,
        replyEn: `${petSound} *stretches comfortably and feels recharged* ⚡`,
        replyVi: `${petSound} *vươn vai dễ chịu và hồi phục năng lượng* ⚡`,
        chunk: "recharge your energy",
        recommendedActions: ["rest", "water", "feed", "pet"]
      };
    }
    return {
      en: `Good job, ${petName}! Here's a gentle pat, some water, and a fun treat for being such a great companion!`,
      vi: `Giỏi lắm, ${petName}! Thưởng cho bạn cái vuốt ve, chút nước mát và bánh ngon vì đã đồng hành thật tuyệt!`,
      replyEn: `${petSound} *beams with joy as your bond grows stronger* 💖`,
      replyVi: `${petSound} *rạng rỡ hạnh phúc khi tình cảm gắn kết thêm bền chặt* 💖`,
      chunk: "great companion",
      recommendedActions: ["pet", "feed", "water", "play", "rest"]
    };
  }

  function buildPracticeSentenceForContext(place, zone, weather, situation, petProfile) {
    const petName = (petProfile && petProfile.name) || "Milu";
    const meta = PLACE_META[place] || PLACE_META.home;

    if (place === "park") {
      if (weather === "hot") {
        return {
          en: `Excuse me, where is the nearest shaded bench and drinking fountain in the park for ${petName} and me?`,
          vi: `Xin lỗi, ghế dài dưới bóng râm và vòi nước uống gần nhất trong công viên cho tôi và ${petName} ở đâu ạ?`,
          replyEn: `Right past the rose garden! There's a cool water bowl for ${petName} by the fountain too.`,
          replyVi: `Ngay qua vườn hoa hồng nhé! Ở cạnh vòi nước cũng có khay nước mát cho ${petName} đấy.`,
          chunk: "nearest drinking fountain",
          responder: meta.npcName,
          who: meta.npcLabel,
          icon: meta.npcIcon
        };
      }
      if (weather === "rainy") {
        return {
          en: `Excuse me, can ${petName} and I wait under the park pavilion until the rain stops?`,
          vi: `Xin lỗi, tôi và ${petName} có thể đứng trú mưa dưới chòi nghỉ công viên cho tới khi tạnh mưa không ạ?`,
          replyEn: `Of course! The park pavilion is dry and pet-friendly—take your time!`,
          replyVi: `Tất nhiên rồi! Chòi nghỉ công viên rất khô ráo và thân thiện với thú cưng—bạn cứ thoải mái nhé!`,
          chunk: "until the rain stops",
          responder: meta.npcName,
          who: meta.npcLabel,
          icon: meta.npcIcon
        };
      }
      return {
        en: `Excuse me, is this scenic jogging path around the park lake open for walking with ${petName} today?`,
        vi: `Xin lỗi, đường chạy bộ ngắm cảnh quanh hồ công viên hôm nay có mở cho đi dạo cùng ${petName} không ạ?`,
        replyEn: `Yes, the lakeside trail is open and lovely today! Enjoy your walk with ${petName}!`,
        replyVi: `Dạ có, đường mòn ven hồ hôm nay rất đẹp và thoáng đãng! Chúc bạn đi dạo vui vẻ cùng ${petName}!`,
        chunk: "walking with " + petName,
        responder: meta.npcName,
        who: meta.npcLabel,
        icon: meta.npcIcon
      };
    }

    if (place === "cafe") {
      if (weather === "rainy" || weather === "cold") {
        return {
          en: `Hi! Could I get a warm oat milk latte and a cup of fresh water for ${petName} at our patio table, please?`,
          vi: `Chào bạn! Cho mình một ly latte sữa yến mạch ấm và một cốc nước sạch cho ${petName} ở bàn hiên nhé?`,
          replyEn: `Coming right up! I'll bring your warm oat latte and a pet water bowl for ${petName} right away.`,
          replyVi: `Có ngay ạ! Mình sẽ mang latte ấm của bạn và bát nước cho ${petName} ra ngay.`,
          chunk: "warm oat milk latte",
          responder: meta.npcName,
          who: meta.npcLabel,
          icon: meta.npcIcon
        };
      }
      return {
        en: `Hi! Could I order an iced oat milk latte and a butter croissant while sitting with ${petName}, please?`,
        vi: `Chào bạn! Cho mình gọi một ly latte sữa yến mạch đá và bánh sừng bò bơ khi ngồi cùng ${petName} nhé?`,
        replyEn: `Certainly! Pets are welcome at our outdoor tables—your latte and croissant will be ready in a moment!`,
        replyVi: `Dạ được ngay! Quán rất hoan nghênh thú cưng ở bàn ngoài trời—latte và bánh của bạn có liền đây!`,
        chunk: "iced oat milk latte",
        responder: meta.npcName,
        who: meta.npcLabel,
        icon: meta.npcIcon
      };
    }

    if (place === "market") {
      if (zone === "market_produce") {
        return {
          en: `Excuse me, are these organic apples and sweet carrots in the produce section fresh today?`,
          vi: `Xin lỗi, táo hữu cơ và cà rốt ngọt ở quầy rau quả hôm nay mới nhập về phải không ạ?`,
          replyEn: `Yes! They arrived from the farm this morning—super crisp and fresh!`,
          replyVi: `Dạ đúng rồi! Rau quả vừa chuyển từ nông trại về sáng nay—tươi giòn lắm ạ!`,
          chunk: "produce section",
          responder: "Produce Clerk",
          who: "Produce Clerk 🧑‍🌾",
          icon: "🧑‍🌾"
        };
      }
      if (zone === "market_checkout") {
        return {
          en: `Hi! Can I pay by contactless card at this checkout counter and pack these pet treats in my reusable bag?`,
          vi: `Chào bạn! Tôi thanh toán bằng thẻ chạm ở quầy thu ngân này và xếp bánh thưởng thú cưng vào túi vải được không ạ?`,
          replyEn: `Of course! Just tap your card right here—${petName} is going to love those treats!`,
          replyVi: `Dạ được chứ ạ! Bạn chạm thẻ ngay đây nhé—chắc chắn ${petName} sẽ mê món bánh thưởng này lắm!`,
          chunk: "contactless card",
          responder: "Cashier",
          who: "Cashier 💁‍♀️",
          icon: "💁‍♀️"
        };
      }
      return {
        en: `Excuse me, which aisle has healthy pet treats and fresh groceries while ${petName} waits by the cart?`,
        vi: `Xin lỗi, dãy kệ nào có bánh thưởng cho thú cưng và thực phẩm tươi trong lúc ${petName} đợi cạnh xe đẩy ạ?`,
        replyEn: `Fresh produce is right ahead in Zone 2, and pet treats are on the middle shelf!`,
        replyVi: `Rau quả tươi ở ngay phía trước tại Khu 2, còn bánh thưởng thú cưng ở kệ giữa nhé!`,
        chunk: "which aisle has",
        responder: meta.npcName,
        who: meta.npcLabel,
        icon: meta.npcIcon
      };
    }

    if (place === "restaurant") {
      return {
        en: `Excuse me, could we have a patio table for two where ${petName} can sit beside us, and see the menu please?`,
        vi: `Xin lỗi, cho chúng tôi một bàn ngoài hiên nơi ${petName} có thể ngồi cạnh, và cho xem thực đơn được không ạ?`,
        replyEn: `Right this way! Our garden patio is pet-friendly—here are your menus and fresh water.`,
        replyVi: `Mời đi lối này ạ! Khu hiên sân vườn của nhà hàng rất thân thiện với thú cưng—thực đơn và nước của quý khách đây.`,
        chunk: "patio table for two",
        responder: meta.npcName,
        who: meta.npcLabel,
        icon: meta.npcIcon
      };
    }

    if (place === "outdoor" || place === "camping") {
      return {
        en: `Excuse me, Ranger, which nature trail leads up to the scenic lookout where I can hike safely with ${petName}?`,
        vi: `Xin lỗi chú kiểm lâm, đường mòn tự nhiên nào dẫn lên đài ngắm cảnh để tôi đi bộ an toàn cùng ${petName} ạ?`,
        replyEn: `Take the Pine Ridge Trail on the left—it's a gentle, pet-friendly twenty-minute hike to the lookout!`,
        replyVi: `Bạn đi theo đường mòn Đồi Thông bên trái nhé—đường thoải, rất hợp đi cùng ${petName} khoảng 20 phút là tới đài ngắm cảnh!`,
        chunk: "nature trail to the lookout",
        responder: meta.npcName,
        who: meta.npcLabel,
        icon: meta.npcIcon
      };
    }

    if (place === "school") {
      return {
        en: `Excuse me, teacher, may I share my short English story about my companion ${petName} with the class today?`,
        vi: `Thưa cô, hôm nay em có thể chia sẻ bài kể chuyện tiếng Anh ngắn về người bạn nhỏ ${petName} trước lớp được không ạ?`,
        replyEn: `That sounds wonderful! Everyone would love to hear your English story about ${petName}!`,
        replyVi: `Nghe tuyệt vời lắm! Cả lớp sẽ rất hào hứng nghe câu chuyện tiếng Anh của em về ${petName} đấy!`,
        chunk: "share my English story",
        responder: meta.npcName,
        who: meta.npcLabel,
        icon: meta.npcIcon
      };
    }

    /* home */
    return {
      en: `Mom, I'm taking ${petName} out for a walk and practicing my English sentences along the way!`,
      vi: `Mẹ ơi, con dẫn ${petName} đi dạo và luyện nói các mẫu câu tiếng Anh trên đường nhé ạ!`,
      replyEn: `Have a great time, sweetie! Remember to bring water for ${petName} and stay safe!`,
      replyVi: `Đi vui vẻ nhé con yêu! Nhớ mang theo nước cho ${petName} và đi đường cẩn thận nhé!`,
      chunk: "taking " + petName + " out for a walk",
      responder: meta.npcName,
      who: meta.npcLabel,
      icon: meta.npcIcon
    };
  }

  /* ---------- Build 3 Contextual Objectives & Dialogue List ---------- */
  function attachCompletedObjectivesHelpers(arr, place) {
    const cleanIds = Array.isArray(arr) ? arr.slice() : [];
    cleanIds.forEach(function (id) {
      const normId = normalizeObjectiveId(id);
      const key = makeObjectiveKey(place, normId);
      try {
        Object.defineProperty(cleanIds, normId, {
          value: true,
          enumerable: false,
          configurable: true,
          writable: true
        });
        Object.defineProperty(cleanIds, key, {
          value: true,
          enumerable: false,
          configurable: true,
          writable: true
        });
      } catch (e) {}
    });
    return cleanIds;
  }

  function extractCompletedList(rawCompleted, place) {
    const set = new Set();
    if (Array.isArray(rawCompleted)) {
      rawCompleted.forEach(function (item) {
        const id = normalizeObjectiveId(item);
        if (OBJECTIVE_IDS.indexOf(id) !== -1) set.add(id);
      });
    } else if (rawCompleted && typeof rawCompleted === "object") {
      Object.keys(rawCompleted).forEach(function (k) {
        if (rawCompleted[k]) {
          const id = normalizeObjectiveId(k);
          if (OBJECTIVE_IDS.indexOf(id) !== -1) set.add(id);
        }
      });
    }
    // Also sync with rewardLedger if already claimed for this place in persistent ledger
    OBJECTIVE_IDS.forEach(function (objId) {
      const key = makeObjectiveKey(place, objId);
      if (isObjectiveClaimedInLedger(key)) {
        set.add(objId);
      }
    });
    return OBJECTIVE_IDS.filter(function (id) {
      return set.has(id);
    });
  }

  function buildObjectivesForContext(ctx, petProfile, completedList) {
    const place = (ctx && ctx.place) || "home";
    const zone = (ctx && ctx.zone) || place;
    const weather = (ctx && ctx.weather) || "sunny";
    const situation = (ctx && ctx.situation) || "normal";
    const pet = petProfile || readActivePetProfile();
    const needs = readNeeds();
    const placeInfo = PLACE_META[place] || PLACE_META.home;
    const wxInfo = WEATHER_META[weather] || WEATHER_META.sunny;

    const doneSet = new Set(extractCompletedList(completedList, place));

    const greetLine = buildGreetSentenceForContext(place, zone, weather, situation, pet);
    const careLine = buildCareSentenceForContext(place, weather, pet, needs);
    const practiceLine = buildPracticeSentenceForContext(place, zone, weather, situation, pet);

    const obj1Key = makeObjectiveKey(place, "greet_context");
    const obj2Key = makeObjectiveKey(place, "care_bond");
    const obj3Key = makeObjectiveKey(place, "contextual_practice");

    const obj1Done = doneSet.has("greet_context") || isObjectiveClaimedInLedger(obj1Key);
    const obj2Done = doneSet.has("care_bond") || isObjectiveClaimedInLedger(obj2Key);
    const obj3Done = doneSet.has("contextual_practice") || isObjectiveClaimedInLedger(obj3Key);

    return [
      {
        id: "greet_context",
        objectiveKey: obj1Key,
        stepNumber: 1,
        icon: "💬",
        place: place,
        zone: zone,
        weather: weather,
        situation: situation,
        titleEn: `Greet ${pet.name} (${placeInfo.nameEn} · ${wxInfo.en})`,
        titleVi: `Trò chuyện mở đầu cùng ${pet.name} (${placeInfo.nameVi} · ${wxInfo.vi})`,
        descVi: `Bấm nói câu chào mở đầu chuyến đi cùng ${pet.name} phù hợp với bối cảnh ${placeInfo.nameVi} khi trời ${wxInfo.vi.toLowerCase()}.`,
        sentenceEn: greetLine.en,
        sentenceVi: greetLine.vi,
        en: greetLine.en,
        vi: greetLine.vi,
        replyEn: greetLine.replyEn,
        replyVi: greetLine.replyVi,
        chunk: greetLine.chunk,
        speaker: "You",
        responder: pet.name,
        who: `${pet.name} ${pet.icon}`,
        listener: "pet",
        status: obj1Done ? "done" : "active",
        done: obj1Done,
        rewardClaimed: isObjectiveClaimedInLedger(obj1Key),
        rewardSpec: {
          stars: 10,
          xp: 12,
          treats: 1,
          water: 0,
          toys: 0,
          bond: 3,
          labelVi: `Trò chuyện mở đầu cùng ${pet.name} tại ${placeInfo.nameVi}`
        },
        needDelta: {
          fun: 8,
          bond: 3
        }
      },
      {
        id: "care_bond",
        objectiveKey: obj2Key,
        stepNumber: 2,
        icon: "💖",
        place: place,
        zone: zone,
        weather: weather,
        situation: situation,
        titleEn: `Care for ${pet.name}'s Needs on the Trip`,
        titleVi: `Chăm sóc nhu cầu của ${pet.name} trong chuyến đi`,
        descVi: `Vuốt ve, cho ăn, cho uống nước hoặc chơi đùa để giữ năng lượng và độ gắn kết của ${pet.name} luôn tràn đầy.`,
        sentenceEn: careLine.en,
        sentenceVi: careLine.vi,
        en: careLine.en,
        vi: careLine.vi,
        replyEn: careLine.replyEn,
        replyVi: careLine.replyVi,
        chunk: careLine.chunk,
        recommendedActions: careLine.recommendedActions,
        speaker: "You",
        responder: pet.name,
        who: `${pet.name} ${pet.icon}`,
        listener: "pet",
        status: obj2Done ? "done" : "active",
        done: obj2Done,
        rewardClaimed: isObjectiveClaimedInLedger(obj2Key),
        rewardSpec: {
          stars: 10,
          xp: 15,
          treats: 1,
          water: 1,
          toys: 0,
          bond: 4,
          labelVi: `Chăm sóc ${pet.name} trong chuyến phiêu lưu tại ${placeInfo.nameVi}`
        },
        needDelta: {
          energy: 8,
          hunger: 10,
          thirst: 12,
          fun: 10,
          bond: 4
        }
      },
      {
        id: "contextual_practice",
        objectiveKey: obj3Key,
        stepNumber: 3,
        icon: "🗣️",
        place: place,
        zone: zone,
        weather: weather,
        situation: situation,
        titleEn: `Practice English with ${practiceLine.responder} at ${placeInfo.nameEn}`,
        titleVi: `Thực hành giao tiếp tiếng Anh tại ${placeInfo.nameVi}`,
        descVi: `Thực hành mẫu câu giao tiếp thực tế với ${practiceLine.who} (hoặc trên thẻ Ngữ cảnh) tại ${placeInfo.nameVi}.`,
        sentenceEn: practiceLine.en,
        sentenceVi: practiceLine.vi,
        en: practiceLine.en,
        vi: practiceLine.vi,
        replyEn: practiceLine.replyEn,
        replyVi: practiceLine.replyVi,
        chunk: practiceLine.chunk,
        speaker: "You",
        responder: practiceLine.responder,
        who: practiceLine.who,
        listener: "staff",
        status: obj3Done ? "done" : "active",
        done: obj3Done,
        rewardClaimed: isObjectiveClaimedInLedger(obj3Key),
        rewardSpec: {
          stars: 15,
          xp: 20,
          treats: 1,
          water: 0,
          toys: 1,
          bond: 5,
          labelVi: `Thực hành giao tiếp tiếng Anh tại ${placeInfo.nameVi}`
        },
        needDelta: {
          fun: 10,
          bond: 5
        }
      }
    ];
  }

  function buildContextualDialogue(ctxOverride, petProfileOverride) {
    const ctx = readLiveContext(ctxOverride);
    const pet = petProfileOverride || readActivePetProfile();
    const objectives = buildObjectivesForContext(ctx, pet, []);

    const dialogueList = objectives.map(function (obj, idx) {
      return {
        id: "dlg_" + obj.id,
        index: idx,
        objectiveId: obj.id,
        objectiveKey: obj.objectiveKey,
        place: ctx.place,
        zone: ctx.zone,
        weather: ctx.weather,
        situation: ctx.situation,
        petId: pet.id,
        petName: pet.name,
        en: obj.sentenceEn,
        vi: obj.sentenceVi,
        replyEn: obj.replyEn,
        replyVi: obj.replyVi,
        chunk: obj.chunk,
        who: obj.who,
        responder: obj.responder,
        listener: obj.listener,
        icon: obj.icon
      };
    });

    // Pull additional matching phrases from ELW_CONTEXT.pickPhrases if available
    const ctxApi = getContextEngine();
    if (ctxApi && typeof ctxApi.pickPhrases === "function") {
      try {
        const extra = ctxApi.pickPhrases(Object.assign({}, ctx, { withPet: true, walkDog: true })) || [];
        extra.forEach(function (p, i) {
          if (!p || !p.en) return;
          // Adapt Milo -> activePet.name so pet identity is 100% unified
          const adaptedEn = String(p.en).replace(/\bMilo\b/g, pet.name);
          const adaptedVi = String(p.vi || "").replace(/\bMilo\b/g, pet.name);
          const alreadyExists = dialogueList.some(function (d) {
            return d.en === adaptedEn;
          });
          if (!alreadyExists && dialogueList.length < 6) {
            dialogueList.push({
              id: "dlg_ctx_" + i,
              index: dialogueList.length,
              objectiveId: p.listener === "pet" ? "greet_context" : "contextual_practice",
              objectiveKey: makeObjectiveKey(ctx.place, p.listener === "pet" ? "greet_context" : "contextual_practice"),
              place: ctx.place,
              zone: ctx.zone,
              weather: ctx.weather,
              situation: ctx.situation,
              petId: pet.id,
              petName: pet.name,
              en: adaptedEn,
              vi: adaptedVi,
              replyEn: String(p.replyEn || "").replace(/\bMilo\b/g, pet.name),
              replyVi: String(p.replyVi || "").replace(/\bMilo\b/g, pet.name),
              chunk: p.chunk || "daily phrase",
              who: p.listener === "pet" ? `${pet.name} ${pet.icon}` : (p.who || "Staff"),
              responder: p.listener === "pet" ? pet.name : (p.responder || "Staff"),
              listener: p.listener || "staff",
              icon: p.listener === "pet" ? pet.icon : (p.icon || "💬")
            });
          }
        });
      } catch (e) {}
    }

    const lead = dialogueList[0] || null;
    try {
      Object.defineProperty(dialogueList, "lines", { value: dialogueList, enumerable: false, configurable: true });
      Object.defineProperty(dialogueList, "items", { value: dialogueList, enumerable: false, configurable: true });
      Object.defineProperty(dialogueList, "lead", { value: lead, enumerable: false, configurable: true });
      Object.defineProperty(dialogueList, "lastLineEn", {
        value: (validatorState.lastPracticedPhrase && validatorState.lastPracticedPhrase.en) || (lead ? lead.en : ""),
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(dialogueList, "lastLineVi", {
        value: (validatorState.lastPracticedPhrase && validatorState.lastPracticedPhrase.vi) || (lead ? lead.vi : ""),
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(dialogueList, "petName", { value: pet.name, enumerable: false, configurable: true });
      Object.defineProperty(dialogueList, "place", { value: ctx.place, enumerable: false, configurable: true });
      Object.defineProperty(dialogueList, "weather", { value: ctx.weather, enumerable: false, configurable: true });
      Object.defineProperty(dialogueList, "situation", { value: ctx.situation, enumerable: false, configurable: true });
    } catch (e) {}

    return dialogueList;
  }

  /* ---------- Session Persistence & Sync ---------- */
  function createDefaultSession(ctx, activePetId) {
    const c = ctx || readLiveContext();
    const pid = activePetId || readActivePetId();
    const pet = readActivePetProfile(pid);
    const completed = extractCompletedList([], c.place);
    const objectives = buildObjectivesForContext(c, pet, completed);
    const isComplete = completed.length >= OBJECTIVE_IDS.length;

    return {
      sessionId: "adv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      active: false,
      petId: pid,
      activePetId: pid,
      entrySources: [],
      lastEntrySource: null,
      place: c.place,
      zone: c.zone,
      weather: c.weather,
      situation: c.situation,
      objectives: objectives,
      completedObjectives: attachCompletedObjectivesHelpers(completed, c.place),
      completedByPlace: {
        [c.place]: completed.slice()
      },
      isComplete: isComplete,
      resultSummary: isComplete ? buildResultSummary(c, pet, objectives, "adv_default") : null,
      startedAt: 0,
      updatedAt: Date.now()
    };
  }

  function buildResultSummary(ctx, petProfile, objectives, sessionId) {
    const placeInfo = PLACE_META[ctx.place] || PLACE_META.home;
    const wxInfo = WEATHER_META[ctx.weather] || WEATHER_META.sunny;
    const totals = { stars: 0, xp: 0, treats: 0, water: 0, toys: 0, bond: 0 };

    (objectives || []).forEach(function (o) {
      if (o && o.rewardSpec) {
        totals.stars += Number(o.rewardSpec.stars) || 0;
        totals.xp += Number(o.rewardSpec.xp) || 0;
        totals.treats += Number(o.rewardSpec.treats) || 0;
        totals.water += Number(o.rewardSpec.water) || 0;
        totals.toys += Number(o.rewardSpec.toys) || 0;
        totals.bond += Number(o.rewardSpec.bond) || 0;
      }
    });

    return {
      sessionId: sessionId || "adv_session",
      petId: petProfile.id,
      petName: petProfile.name,
      petIcon: petProfile.icon,
      place: ctx.place,
      placeNameVi: placeInfo.nameVi,
      placeNameEn: placeInfo.nameEn,
      zone: ctx.zone,
      weather: ctx.weather,
      weatherNameVi: wxInfo.vi,
      situation: ctx.situation,
      completedCount: OBJECTIVE_IDS.length,
      totalCount: OBJECTIVE_IDS.length,
      objectivesCompleted: OBJECTIVE_IDS.slice(),
      rewards: totals,
      headlineEn: `Adventure Quest Complete with ${petProfile.name} at ${placeInfo.nameEn}!`,
      headlineVi: `Hoàn thành Nhiệm vụ Phiêu lưu cùng ${petProfile.name} tại ${placeInfo.nameVi}!`,
      summaryVi: `Xuất sắc! Bạn và ${petProfile.name} đã hoàn thành 3/3 mục tiêu tại ${placeInfo.nameVi} (${wxInfo.vi}).`,
      completedAt: Date.now()
    };
  }

  function readRawSessionFromStorage() {
    const store = getStorage();
    if (!store) return memorySession;
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) {
        memorySession = null;
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch (e) {
      return memorySession;
    }
  }

  function writeSessionToStorage(session) {
    if (!session || typeof session !== "object") return;
    const cleanCompleted = Array.isArray(session.completedObjectives)
      ? session.completedObjectives.slice()
      : extractCompletedList(session.completedObjectives, session.place);

    const serializable = {
      sessionId: String(session.sessionId || ("adv_" + Date.now())),
      active: Boolean(session.active),
      petId: String(session.petId || readActivePetId()),
      activePetId: String(session.petId || readActivePetId()),
      entrySources: Array.isArray(session.entrySources) ? session.entrySources.slice() : [],
      lastEntrySource: session.lastEntrySource || null,
      place: session.place || "home",
      zone: session.zone || "living",
      weather: session.weather || "sunny",
      situation: session.situation || "normal",
      objectives: Array.isArray(session.objectives) ? session.objectives : [],
      completedObjectives: cleanCompleted,
      completedByPlace: session.completedByPlace && typeof session.completedByPlace === "object"
        ? session.completedByPlace
        : { [session.place || "home"]: cleanCompleted },
      isComplete: Boolean(session.isComplete),
      resultSummary: session.resultSummary || null,
      startedAt: Number(session.startedAt) || 0,
      updatedAt: Number(session.updatedAt) || Date.now()
    };

    memorySession = Object.assign({}, serializable, {
      completedObjectives: attachCompletedObjectivesHelpers(cleanCompleted, serializable.place)
    });

    const store = getStorage();
    if (store) {
      try {
        store.setItem(STORAGE_KEY, JSON.stringify(serializable));
      } catch (e) {}
    }
    return memorySession;
  }

  function notifySubscribers() {
    const state = getUnifiedSystemState();
    subscribers.slice().forEach(function (fn) {
      try {
        fn(state);
      } catch (e) {}
    });
    try {
      const uiApi = (root && root.ELW_PET_UI) || (typeof window !== "undefined" ? window.ELW_PET_UI : null);
      if (uiApi && typeof uiApi.refresh === "function") {
        uiApi.refresh();
      }
    } catch (e) {}
  }

  /* ---------- Synchronize Shared Session with Live Context & Pet ---------- */
  function getSharedSession(ctxOverride) {
    const raw = readRawSessionFromStorage();
    const activePetId = readActivePetId();
    const petProfile = readActivePetProfile(activePetId);
    const liveCtx = readLiveContext(ctxOverride);

    if (!raw) {
      const fresh = createDefaultSession(liveCtx, activePetId);
      memorySession = fresh;
      return fresh;
    }

    const place = (ctxOverride && ctxOverride.place)
      ? normalizePlaceAndZone(ctxOverride).place
      : (liveCtx.place || raw.place || "home");
    const zone = (ctxOverride && ctxOverride.zone)
      ? normalizePlaceAndZone(ctxOverride).zone
      : (liveCtx.zone || raw.zone || place);
    const weather = (ctxOverride && ctxOverride.weather)
      ? normalizeWeather(ctxOverride.weather)
      : (liveCtx.weather || raw.weather || "sunny");
    const situation = (ctxOverride && ctxOverride.situation)
      ? normalizeSituation(ctxOverride.situation)
      : (liveCtx.situation || raw.situation || "normal");

    const completedByPlace = (raw.completedByPlace && typeof raw.completedByPlace === "object")
      ? Object.assign({}, raw.completedByPlace)
      : {};

    const rawPlaceCompleted = raw.place === place
      ? (completedByPlace[place] || raw.completedObjectives || [])
      : (completedByPlace[place] || []);

    const completedList = extractCompletedList(rawPlaceCompleted, place);
    completedByPlace[place] = completedList.slice();

    const syncCtx = {
      place: place,
      zone: zone,
      weather: weather,
      situation: situation,
      withPet: Boolean(raw.active || liveCtx.withPet),
      withLinh: Boolean(liveCtx.withLinh)
    };

    const objectives = buildObjectivesForContext(syncCtx, petProfile, completedList);
    const isComplete = completedList.length >= OBJECTIVE_IDS.length;

    const syncedSession = {
      sessionId: raw.sessionId || ("adv_" + Date.now()),
      active: Boolean(raw.active),
      petId: activePetId,
      activePetId: activePetId,
      entrySources: Array.isArray(raw.entrySources) ? raw.entrySources.slice() : [],
      lastEntrySource: raw.lastEntrySource || null,
      place: place,
      zone: zone,
      weather: weather,
      situation: situation,
      objectives: objectives,
      completedObjectives: attachCompletedObjectivesHelpers(completedList, place),
      completedByPlace: completedByPlace,
      isComplete: isComplete,
      resultSummary: isComplete
        ? (raw.resultSummary && raw.resultSummary.place === place && raw.resultSummary.petId === activePetId
            ? raw.resultSummary
            : buildResultSummary(syncCtx, petProfile, objectives, raw.sessionId))
        : null,
      startedAt: Number(raw.startedAt) || (raw.active ? Date.now() : 0),
      updatedAt: Number(raw.updatedAt) || Date.now()
    };

    memorySession = syncedSession;
    return syncedSession;
  }

  /* ---------- Unified Entry Point: enterAdventure(opts) ---------- */
  function enterAdventure(opts) {
    const options = typeof opts === "string" ? { entrySource: opts } : (opts && typeof opts === "object" ? opts : {});
    const entrySource = String(options.entrySource || options.source || "context_bar").trim() || "context_bar";
    const forceNew = Boolean(options.forceNew);

    // 1. Activate WalkDog on ELW_CONTEXT so scene + context bar reflect withPet === true
    const ctxApi = getContextEngine();
    if (ctxApi && typeof ctxApi.setWalkDog === "function" && !isSyncingWalkDog) {
      try {
        isSyncingWalkDog = true;
        ctxApi.setWalkDog(true);
      } catch (e) {
      } finally {
        isSyncingWalkDog = false;
      }
    }

    // 2. Sync activePetId and set temporary state "walking_adventure" on ELW_PET_NEEDS
    const activePetId = readActivePetId();
    const petProfile = readActivePetProfile(activePetId);
    const needsApi = getNeedsEngine();
    if (needsApi) {
      try {
        if (typeof needsApi.setTemporaryState === "function") {
          needsApi.setTemporaryState("walking_adventure", 60000);
        } else if (typeof needsApi.setTransientState === "function") {
          needsApi.setTransientState("walking_adventure", 60000);
        }
      } catch (e) {}
    }

    // 3. Read current live context (allowing optional place/weather/situation overrides in opts)
    const liveCtx = readLiveContext(options);
    const current = getSharedSession(liveCtx);

    let session;
    if (current && current.active === true && !forceNew) {
      // Reuse the exact same active session (same sessionId!), merge entrySources
      const sources = Array.isArray(current.entrySources) ? current.entrySources.slice() : [];
      if (sources.indexOf(entrySource) === -1) {
        sources.push(entrySource);
      }
      if (entrySource === "home_pet_click" && sources.indexOf("home_pet") === -1) {
        sources.push("home_pet");
      } else if (entrySource === "home_pet" && sources.indexOf("home_pet_click") === -1) {
        sources.push("home_pet_click");
      }
      const completedList = extractCompletedList(
        (current.completedByPlace && current.completedByPlace[liveCtx.place]) || current.completedObjectives,
        liveCtx.place
      );
      const completedByPlace = Object.assign({}, current.completedByPlace || {}, {
        [liveCtx.place]: completedList.slice()
      });
      const objectives = buildObjectivesForContext(liveCtx, petProfile, completedList);
      const isComplete = completedList.length >= OBJECTIVE_IDS.length;

      session = {
        sessionId: current.sessionId,
        active: true,
        petId: activePetId,
        activePetId: activePetId,
        entrySources: sources,
        lastEntrySource: entrySource,
        place: liveCtx.place,
        zone: liveCtx.zone,
        weather: liveCtx.weather,
        situation: liveCtx.situation,
        objectives: objectives,
        completedObjectives: attachCompletedObjectivesHelpers(completedList, liveCtx.place),
        completedByPlace: completedByPlace,
        isComplete: isComplete,
        resultSummary: isComplete
          ? buildResultSummary(liveCtx, petProfile, objectives, current.sessionId)
          : null,
        startedAt: current.startedAt || Date.now(),
        updatedAt: Date.now()
      };
    } else {
      // Initialize a new active adventure session
      const newSessionId = "adv_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      const completedList = forceNew
        ? extractCompletedList([], liveCtx.place)
        : extractCompletedList(
            (current && current.completedByPlace && current.completedByPlace[liveCtx.place]) || [],
            liveCtx.place
          );
      const completedByPlace = forceNew
        ? { [liveCtx.place]: completedList.slice() }
        : Object.assign({}, (current && current.completedByPlace) || {}, {
            [liveCtx.place]: completedList.slice()
          });
      const objectives = buildObjectivesForContext(liveCtx, petProfile, completedList);
      const isComplete = completedList.length >= OBJECTIVE_IDS.length;
      const initSources = [entrySource];
      if (entrySource === "home_pet_click") initSources.push("home_pet");
      else if (entrySource === "home_pet") initSources.push("home_pet_click");

      session = {
        sessionId: newSessionId,
        active: true,
        petId: activePetId,
        activePetId: activePetId,
        entrySources: initSources,
        lastEntrySource: entrySource,
        place: liveCtx.place,
        zone: liveCtx.zone,
        weather: liveCtx.weather,
        situation: liveCtx.situation,
        objectives: objectives,
        completedObjectives: attachCompletedObjectivesHelpers(completedList, liveCtx.place),
        completedByPlace: completedByPlace,
        isComplete: isComplete,
        resultSummary: isComplete
          ? buildResultSummary(liveCtx, petProfile, objectives, newSessionId)
          : null,
        startedAt: Date.now(),
        updatedAt: Date.now()
      };
    }

    writeSessionToStorage(session);
    notifySubscribers();
    return session;
  }

  function leaveAdventure(opts) {
    const options = opts && typeof opts === "object" ? opts : {};
    const current = getSharedSession();
    current.active = false;
    current.updatedAt = Date.now();
    writeSessionToStorage(current);

    if (!options.keepContextWalk) {
      const ctxApi = getContextEngine();
      if (ctxApi && typeof ctxApi.setWalkDog === "function" && !isSyncingWalkDog) {
        try {
          isSyncingWalkDog = true;
          ctxApi.setWalkDog(false);
        } catch (e) {
        } finally {
          isSyncingWalkDog = false;
        }
      }
    }

    notifySubscribers();
    return current;
  }

  function toggleAdventure(opts) {
    const options = typeof opts === "string" ? { entrySource: opts } : (opts && typeof opts === "object" ? opts : {});
    const current = getSharedSession();
    if (current.active && options.allowToggleOff) {
      return leaveAdventure(options);
    }
    return enterAdventure(options);
  }

  /* ---------- Validator Component ---------- */
  function buildValidatorComponent(session, ctx) {
    const s = session || getSharedSession(ctx);
    const objectives = Array.isArray(s.objectives) ? s.objectives : [];
    const byId = {};

    const objValidators = objectives.map(function (obj) {
      const isDone = Boolean(obj.done || obj.status === "done");
      const item = {
        id: obj.id,
        objectiveKey: obj.objectiveKey,
        titleEn: obj.titleEn,
        titleVi: obj.titleVi,
        sentenceEn: obj.sentenceEn,
        sentenceVi: obj.sentenceVi,
        status: isDone ? "done" : "active",
        done: isDone,
        rewardClaimed: Boolean(obj.rewardClaimed || isObjectiveClaimedInLedger(obj.objectiveKey)),
        rewardSpec: obj.rewardSpec
      };
      byId[obj.id] = item;
      byId[obj.objectiveKey] = item;
      return item;
    });

    function validateObjective(objId, payload) {
      const normId = normalizeObjectiveId(objId);
      if (OBJECTIVE_IDS.indexOf(normId) === -1) {
        return {
          valid: false,
          objId: normId,
          reason: "unknown_objective_id"
        };
      }
      const target = byId[normId];
      validatorState.lastVerifiedAt = Date.now();
      validatorState.lastCheckedAction = (payload && (payload.actionId || payload.type)) || normId;

      return {
        valid: true,
        objId: normId,
        objectiveKey: target ? target.objectiveKey : makeObjectiveKey(s.place, normId),
        alreadyDone: Boolean(target && target.done),
        status: target ? target.status : "active",
        verifiedAt: validatorState.lastVerifiedAt
      };
    }

    const completedCount = objValidators.filter(function (o) { return o.done; }).length;

    return {
      objectives: objValidators,
      byId: byId,
      completedCount: completedCount,
      totalCount: OBJECTIVE_IDS.length,
      isComplete: completedCount >= OBJECTIVE_IDS.length,
      lastCheckedAction: validatorState.lastCheckedAction,
      lastVerifiedAt: validatorState.lastVerifiedAt,
      validateObjective: validateObjective,
      checkObjective: validateObjective,
      canComplete: function (objId, payload) {
        return validateObjective(objId, payload).valid;
      },
      isAllComplete: function () {
        return completedCount >= OBJECTIVE_IDS.length;
      }
    };
  }

  /* ---------- Complete Objective (Validator + One-Time Reward Ledger + Needs Delta) ---------- */
  function completeObjective(objId, payload) {
    const normId = normalizeObjectiveId(objId);
    if (OBJECTIVE_IDS.indexOf(normId) === -1) {
      return {
        ok: false,
        completed: false,
        objId: normId,
        reason: "invalid_objective_id"
      };
    }

    let session = getSharedSession();
    if (!session.active) {
      session = enterAdventure({
        entrySource: (payload && payload.entrySource) || session.lastEntrySource || "context_bar"
      });
    }

    const validator = buildValidatorComponent(session);
    const check = validator.validateObjective(normId, payload);
    if (!check.valid) {
      return {
        ok: false,
        completed: false,
        objId: normId,
        reason: check.reason || "validation_failed"
      };
    }

    const place = session.place || "home";
    const objectiveKey = makeObjectiveKey(place, normId);
    const targetObj = (session.objectives || []).find(function (o) {
      return o.id === normId;
    }) || buildObjectivesForContext(session, readActivePetProfile(session.petId), session.completedObjectives).find(function (o) {
      return o.id === normId;
    });

    const rewardSpec = (targetObj && targetObj.rewardSpec) || {
      stars: 10,
      xp: 15,
      treats: 1,
      water: 0,
      toys: 0,
      bond: 4,
      labelVi: "Hoàn thành mục tiêu phiêu lưu"
    };

    // 1. Claim one-time reward via ELW_PET_REWARDS.claimObjectiveReward (anti-farm, reload-proof)
    let rewardResult = { granted: false, duplicate: false, objectiveKey: objectiveKey };
    const rewardsApi = getRewardsEngine();
    if (rewardsApi && typeof rewardsApi.claimObjectiveReward === "function") {
      try {
        rewardResult = rewardsApi.claimObjectiveReward(objectiveKey, rewardSpec);
      } catch (e) {}
    }

    // 2. Apply Need Delta via ELW_PET_NEEDS.applyNeedDelta (only when newly completed/claimed to prevent stat farming)
    const wasAlreadyDone = session.completedObjectives.indexOf(normId) !== -1;
    const needsApi = getNeedsEngine();
    if (needsApi && (!wasAlreadyDone || rewardResult.granted)) {
      const delta = (targetObj && targetObj.needDelta) || { fun: 8, bond: 4 };
      try {
        if (typeof needsApi.applyNeedDelta === "function") {
          needsApi.applyNeedDelta(delta);
        } else if (typeof needsApi.updateNeeds === "function") {
          needsApi.updateNeeds(delta);
        }
        if (typeof needsApi.setTemporaryState === "function") {
          needsApi.setTemporaryState("excited", 3500);
        }
      } catch (e) {}
    }

    // 3. Mark done in session.completedObjectives
    const completedList = extractCompletedList(session.completedObjectives, place);
    if (completedList.indexOf(normId) === -1) {
      completedList.push(normId);
    }
    const orderedCompleted = OBJECTIVE_IDS.filter(function (id) {
      return completedList.indexOf(id) !== -1;
    });

    session.completedByPlace = Object.assign({}, session.completedByPlace || {}, {
      [place]: orderedCompleted.slice()
    });

    const petProfile = readActivePetProfile(session.petId);
    session.objectives = buildObjectivesForContext(session, petProfile, orderedCompleted);
    session.completedObjectives = attachCompletedObjectivesHelpers(orderedCompleted, place);
    session.isComplete = orderedCompleted.length >= OBJECTIVE_IDS.length;
    session.updatedAt = Date.now();

    if (session.isComplete) {
      session.resultSummary = buildResultSummary(session, petProfile, session.objectives, session.sessionId);
    }

    writeSessionToStorage(session);
    notifySubscribers();

    return {
      ok: true,
      completed: true,
      objId: normId,
      objectiveKey: objectiveKey,
      rewardResult: rewardResult,
      isComplete: session.isComplete,
      resultSummary: session.resultSummary,
      session: session
    };
  }

  /* ---------- Automatic Event Listeners ---------- */
  function onPetInteraction(actId, payload) {
    const action = String(actId || "").toLowerCase().trim();
    if (!action) return null;
    validatorState.lastPetInteraction = action;
    validatorState.lastCheckedAction = "pet:" + action;
    validatorState.lastVerifiedAt = Date.now();

    if (action === "walk") {
      return enterAdventure({
        entrySource: (payload && (payload.entrySource || payload.source)) || "home_pet"
      });
    }

    const session = getSharedSession();
    if (!session.active && !(payload && payload.autoCompleteInInactive)) {
      // Even if session wasn't explicitly started yet, if withPet is true in context, sync it
      const liveCtx = readLiveContext();
      if (liveCtx.withPet) {
        enterAdventure({ entrySource: "home_pet" });
      } else {
        return null;
      }
    }

    if (action === "talk") {
      const cur = getSharedSession();
      if (cur.completedObjectives.indexOf("greet_context") === -1) {
        return completeObjective("greet_context", { actionId: "pet:talk", payload: payload });
      }
      return completeObjective("contextual_practice", { actionId: "pet:talk", payload: payload });
    }

    if (["pet", "feed", "water", "play", "rest"].indexOf(action) !== -1) {
      return completeObjective("care_bond", { actionId: "pet:" + action, payload: payload });
    }

    return null;
  }

  function onPhrasePracticed(phraseObj) {
    const p = typeof phraseObj === "string" ? { en: phraseObj } : (phraseObj && typeof phraseObj === "object" ? phraseObj : null);
    if (!p) return null;

    validatorState.lastPracticedPhrase = p;
    validatorState.lastCheckedAction = "phrase:" + String(p.en || "").slice(0, 40);
    validatorState.lastVerifiedAt = Date.now();

    if (p.objectiveId && OBJECTIVE_IDS.indexOf(normalizeObjectiveId(p.objectiveId)) !== -1) {
      return completeObjective(p.objectiveId, { actionId: "phrase", phrase: p });
    }

    const session = getSharedSession();
    const liveCtx = readLiveContext();
    if (!session.active && !liveCtx.withPet) {
      return null;
    }

    const textEn = String(p.en || p.sentenceEn || "").toLowerCase();
    const petProfile = readActivePetProfile(session.petId);
    const mentionsPet =
      p.listener === "pet" ||
      textEn.indexOf(petProfile.name.toLowerCase()) !== -1 ||
      textEn.indexOf("milo") !== -1 ||
      textEn.indexOf("milu") !== -1 ||
      textEn.indexOf("mochi") !== -1;

    if (mentionsPet && session.completedObjectives.indexOf("greet_context") === -1) {
      return completeObjective("greet_context", { actionId: "phrase_greet", phrase: p });
    }

    if (session.completedObjectives.indexOf("contextual_practice") === -1) {
      return completeObjective("contextual_practice", { actionId: "phrase_practice", phrase: p });
    }

    if (session.completedObjectives.indexOf("greet_context") === -1) {
      return completeObjective("greet_context", { actionId: "phrase_fallback_greet", phrase: p });
    }

    return completeObjective("contextual_practice", { actionId: "phrase_practice", phrase: p });
  }

  function onWorldAction(actionId, W) {
    const act = String(actionId || "").trim();
    if (!act) return null;

    validatorState.lastCheckedAction = "world:" + act;
    validatorState.lastVerifiedAt = Date.now();

    const roomHint = W && W.room ? { room: W.room, zone: W.room } : undefined;
    const session = getSharedSession(roomHint);
    const liveCtx = readLiveContext(roomHint);

    if (!session.active && !liveCtx.withPet) {
      return null;
    }

    // Room transition actions (go_park, go_cafe, go_market, etc.) sync the session context
    if (/^go_/.test(act)) {
      const targetRoom = act === "go_home" ? "living" : act.slice(3);
      const updatedSession = getSharedSession({ room: targetRoom, zone: targetRoom });
      writeSessionToStorage(updatedSession);
      notifySubscribers();
      return updatedSession;
    }

    // Pet care actions in world scene
    if (/cat_pet|cat_feed|dog_pet|pet_care|pet_feed|pet_water|pet_play/.test(act)) {
      return completeObjective("care_bond", { actionId: act, world: W });
    }

    // Social / speaking / contextual actions in world scene
    if (session.completedObjectives.indexOf("greet_context") === -1) {
      return completeObjective("greet_context", { actionId: act, world: W });
    }
    return completeObjective("contextual_practice", { actionId: act, world: W });
  }

  /* ---------- Practice Objective Dialogue Line Directly ---------- */
  function practiceObjective(objId) {
    const normId = normalizeObjectiveId(objId || "greet_context");
    const session = getSharedSession();
    const obj = (session.objectives || []).find(function (o) {
      return o.id === normId;
    });

    if (obj) {
      validatorState.lastPracticedPhrase = {
        en: obj.sentenceEn,
        vi: obj.sentenceVi,
        replyEn: obj.replyEn,
        replyVi: obj.replyVi,
        objectiveId: obj.id
      };

      try {
        if (root && typeof root.charSay === "function") {
          root.charSay(obj.sentenceEn);
        }
        if (root && typeof root.say === "function") {
          Promise.resolve(root.say(obj.sentenceEn, 0.95)).catch(function () {});
        }
        if (root && root.ELW_LIFE && typeof root.ELW_LIFE.draw3DSpeechBubble === "function") {
          const anchor = obj.listener === "pet" ? "#o-cat" : "char";
          root.ELW_LIFE.draw3DSpeechBubble(anchor, obj.responder, "🐾", obj.replyEn, obj.replyVi, "say", 4500);
        }
      } catch (e) {}
    }

    return completeObjective(normId, { actionId: "practice_objective:" + normId });
  }

  /* ---------- Core Requirement: getUnifiedSystemState() (8 Shared Components) ---------- */
  function getUnifiedSystemState(ctxOverride) {
    const activePetId = readActivePetId();
    const petProfile = readActivePetProfile(activePetId);
    const context = readLiveContext(ctxOverride);
    const adventureSession = getSharedSession(context);
    // Keep context.withPet synced with adventureSession.active
    context.withPet = Boolean(context.withPet || adventureSession.active);

    const validator = buildValidatorComponent(adventureSession, context);
    const needs = readNeeds();
    const inventory = readInventory();
    const dialogue = buildContextualDialogue(context, petProfile);
    const rewardLedger = readRewardLedger();

    return {
      activePetId: activePetId,
      adventureSession: adventureSession,
      context: context,
      validator: validator,
      needs: needs,
      inventory: inventory,
      dialogue: dialogue,
      rewardLedger: rewardLedger
    };
  }

  /* ---------- Hook into ELW_CONTEXT for Automatic Two-Way Sync ---------- */
  function bindContextEngineHooks() {
    const ctxApi = getContextEngine();
    if (!ctxApi || ctxApi.__petAdventureHooked) return;
    ctxApi.__petAdventureHooked = true;

    if (typeof ctxApi.setWalkDog === "function") {
      const origSetWalkDog = ctxApi.setWalkDog;
      ctxApi.setWalkDog = function (on) {
        const res = origSetWalkDog.apply(this, arguments);
        if (!isSyncingWalkDog) {
          isSyncingWalkDog = true;
          try {
            if (on) {
              enterAdventure({ entrySource: "context_bar" });
            } else {
              leaveAdventure({ keepContextWalk: true });
            }
          } catch (e) {
          } finally {
            isSyncingWalkDog = false;
          }
        }
        return res;
      };
    }

    if (typeof ctxApi.setSituation === "function") {
      const origSetSit = ctxApi.setSituation;
      ctxApi.setSituation = function (id) {
        const res = origSetSit.apply(this, arguments);
        try {
          const s = getSharedSession({ situation: id });
          if (s.active) writeSessionToStorage(s);
          notifySubscribers();
        } catch (e) {}
        return res;
      };
    }
  }

  function resetForTest() {
    memorySession = null;
    lastObservedEngineCtx = null;
    validatorState = {
      lastCheckedAction: null,
      lastVerifiedAt: 0,
      lastPracticedPhrase: null,
      lastPetInteraction: null
    };
    const store = getStorage();
    if (store) {
      try {
        store.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
    return getUnifiedSystemState();
  }

  function subscribe(fn) {
    if (typeof fn === "function" && subscribers.indexOf(fn) === -1) {
      subscribers.push(fn);
    }
    return function unsubscribe() {
      const idx = subscribers.indexOf(fn);
      if (idx !== -1) subscribers.splice(idx, 1);
    };
  }

  function init() {
    bindContextEngineHooks();
    const session = getSharedSession();
    if (session && session.active) {
      const ctxApi = getContextEngine();
      if (ctxApi && typeof ctxApi.setWalkDog === "function" && !isSyncingWalkDog) {
        try {
          isSyncingWalkDog = true;
          ctxApi.setWalkDog(true);
        } catch (e) {
        } finally {
          isSyncingWalkDog = false;
        }
      }
    }
    return getUnifiedSystemState();
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    OBJECTIVE_IDS: OBJECTIVE_IDS,
    PLACE_META: PLACE_META,
    WEATHER_META: WEATHER_META,
    SITUATION_META: SITUATION_META,
    init: init,
    enterAdventure: enterAdventure,
    startAdventure: enterAdventure,
    leaveAdventure: leaveAdventure,
    exitAdventure: leaveAdventure,
    stopAdventure: leaveAdventure,
    toggleAdventure: toggleAdventure,
    getSharedSession: getSharedSession,
    getSession: getSharedSession,
    syncWithContext: getSharedSession,
    getUnifiedSystemState: getUnifiedSystemState,
    buildObjectivesForContext: buildObjectivesForContext,
    buildContextualDialogue: buildContextualDialogue,
    completeObjective: completeObjective,
    practiceObjective: practiceObjective,
    onPetInteraction: onPetInteraction,
    recordInteraction: onPetInteraction,
    onAction: onPetInteraction,
    onPhrasePracticed: onPhrasePracticed,
    onWorldAction: onWorldAction,
    makeObjectiveKey: makeObjectiveKey,
    resetForTest: resetForTest,
    subscribe: subscribe
  };
});
