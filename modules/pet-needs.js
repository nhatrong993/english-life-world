/**
 * English Life World — Pet Needs Engine, Multi-Pet Schema V2 & 5-Stage Evolution (modules/pet-needs.js)
 *
 * Key Guarantees (Workstream 2.1):
 * 1. Strictly 10 Canonical Pets (3 Dogs, 3 Cats, 4 Rare) — NO aliases (sunny/nimbus/pixel/leo removed):
 *    ["milu", "boba", "cookie", "mochi", "pepper", "oreo", "ember", "lumi", "pip", "aqua"]
 *    Free pets: "milu" (Dog) & "mochi" (Cat). All other 8 pets are Premium (unlocked via elw_topics_v1.unlocked).
 * 2. Multi-Pet Isolated Schema (byPetId[petId]):
 *    byPetId[petId] = {
 *      stage, level, xp, needs,
 *      progression: { care, interaction, stageMissions, skillUses, ... },
 *      unlockedSkills, missionProgress, createdAt, lastSeen
 *    }
 *    activePetId stored separately; inventory ({ treats, water, toys }) is shared across all pets.
 * 3. First-Select & Switch Isolation:
 *    - Unraised pet -> initialized at stage "baby" / level 1 / 0 XP on first selection.
 *    - Switching pets NEVER transfers XP/skills and NEVER deletes old pet data; switching back restores exact progress.
 *    - Resetting a pet's progress only happens when explicitly calling resetPetProgress(petId, { confirm: true }).
 * 4. Multi-Gate 5-Stage Evolution (baby -> young -> teen -> adult -> elite):
 *    - XP thresholds: [0, 100, 250, 450, 700] + care + interaction + stageMissions for that stage.
 *    - checkStageEvolution(petId) returns { evolved, from, to, missing: [...] } and emits subscribe 'stage-up'.
 * 5. Capped Offline Decay & Zero Penalty:
 *    - Max offline decay window: 6 hours (MAX_OFFLINE_DECAY_MS = 6 * 3600 * 1000), floor = 25 (OFFLINE_FLOOR).
 *    - Tired pet or long absence (e.g., 30 days) NEVER deducts XP, stage, level, skills, or bond.
 */
(function (root) {
  "use strict";

  var STORAGE_KEY_V2 = "elw_pet_needs_v2";
  var STORAGE_KEY_NEEDS_V1 = "elw_pet_needs_v1";
  var STORAGE_KEY_V1 = "elw_pet_v1";
  var STORAGE_KEY_SURVIVAL = "elw_pet_survival";
  var BACKUP_STORAGE_KEY = "elw_pet_backup_pre_v2";
  var BACKUP_STORAGE_KEY_ALT = "elw_pet_needs_v2_backup";

  var MAX_OFFLINE_DECAY_MS = 6 * 3600 * 1000; // 6 hours max offline decay cap
  var OFFLINE_FLOOR = 25; // Natural decay never drops needs below 25
  var NEED_MIN = 0;
  var NEED_MAX = 100;

  var DECAY_RATES_PER_HOUR = Object.freeze({
    hunger: 4,
    thirst: 5,
    energy: 3,
    fun: 4,
    bond: 0
  });

  var DEFAULT_NEEDS = Object.freeze({
    energy: 80,
    hunger: 80,
    thirst: 80,
    fun: 80,
    bond: 50
  });

  var DEFAULT_INVENTORY = Object.freeze({
    treats: 5,
    water: 5,
    toys: 4
  });

  var STAGES = Object.freeze(["baby", "young", "teen", "adult", "elite"]);

  var STAGE_BY_LEVEL = Object.freeze({
    1: "baby",
    2: "young",
    3: "teen",
    4: "adult",
    5: "elite"
  });

  var LEVEL_BY_STAGE = Object.freeze({
    baby: 1,
    young: 2,
    teen: 3,
    adult: 4,
    elite: 5
  });

  var STAGE_SCALE_MULTIPLIERS = Object.freeze({
    baby: 0.88,
    young: 0.95,
    teen: 1.0,
    adult: 1.06,
    elite: 1.12
  });

  var LEVEL_THRESHOLDS = Object.freeze([
    Object.freeze({
      level: 1,
      stage: "baby",
      minXp: 0,
      scaleMultiplier: 0.88,
      stageBadge: "🌱 Lv.1 Bạn Mới Đáng Yêu",
      stageNameVi: "Bạn Mới Đáng Yêu",
      stageNameEn: "Little Sprout Buddy"
    }),
    Object.freeze({
      level: 2,
      stage: "young",
      minXp: 100,
      scaleMultiplier: 0.95,
      stageBadge: "🌿 Lv.2 Bạn Nhỏ Thân Thiết",
      stageNameVi: "Bạn Nhỏ Thân Thiết",
      stageNameEn: "Curious Companion"
    }),
    Object.freeze({
      level: 3,
      stage: "teen",
      minXp: 250,
      scaleMultiplier: 1.0,
      stageBadge: "🌸 Lv.3 Đôi Bạn Ăn Ý",
      stageNameVi: "Đôi Bạn Ăn Ý",
      stageNameEn: "Playful Explorer"
    }),
    Object.freeze({
      level: 4,
      stage: "adult",
      minXp: 450,
      scaleMultiplier: 1.06,
      stageBadge: "🌟 Lv.4 Tri Kỷ Tỏa Sáng",
      stageNameVi: "Tri Kỷ Tỏa Sáng",
      stageNameEn: "Shining Star Partner"
    }),
    Object.freeze({
      level: 5,
      stage: "elite",
      minXp: 700,
      scaleMultiplier: 1.12,
      stageBadge: "👑 Lv.5 Huyền Thoại Gắn Bó",
      stageNameVi: "Huyền Thoại Gắn Bó",
      stageNameEn: "Best Friend Forever"
    })
  ]);

  var STAGE_REQUIREMENTS = Object.freeze({
    baby: Object.freeze({ level: 1, minXp: 0, care: 0, interaction: 0, stageMissions: 0 }),
    young: Object.freeze({ level: 2, minXp: 100, care: 1, interaction: 1, stageMissions: 1 }),
    teen: Object.freeze({ level: 3, minXp: 250, care: 2, interaction: 2, stageMissions: 2 }),
    adult: Object.freeze({ level: 4, minXp: 450, care: 3, interaction: 3, stageMissions: 3 }),
    elite: Object.freeze({ level: 5, minXp: 700, care: 4, interaction: 4, stageMissions: 4 })
  });

  // =========================================================================
  // 1. EXACTLY 10 CANONICAL PETS (3 Dogs, 3 Cats, 4 Rare) — NO ALIASES
  // =========================================================================
  var PET_LIST = Object.freeze([
    // --- 3 DOGS ---
    Object.freeze({
      id: "milu",
      name: "Milu",
      category: "dog",
      speciesEn: "Golden Fluffy Puppy",
      speciesVi: "Cún Lông Xù Vàng",
      tier: "free",
      free: true,
      pro: false,
      icon: "🐕",
      sound: "Woof! Woof! 🐾",
      personalityEn: "Cheerful, loyal, and loves learning new English words with you!",
      personalityVi: "Vui vẻ, trung thành và rất thích học từ tiếng Anh mới cùng bé!",
      favFoodEn: "Crunchy Honey Bone",
      favFoodVi: "Xương Mật Ong Giòn Tan",
      voice: Object.freeze({ pitch: 1.15, rate: 1.0, lang: "en-US" })
    }),
    Object.freeze({
      id: "boba",
      name: "Boba",
      category: "dog",
      speciesEn: "Royal Corgi Puppy",
      speciesVi: "Cún Corgi Hoàng Gia",
      tier: "premium",
      free: false,
      pro: true,
      icon: "🐶",
      sound: "Arf! Yap! 👑",
      personalityEn: "Playful short-legged royal buddy who wiggles happily when you speak!",
      personalityVi: "Chú cún chân ngắn hoàng gia tinh nghịch, lắc mông vui nhộn khi bé đọc bài!",
      favFoodEn: "Brown Sugar Milk Tea Biscuit",
      favFoodVi: "Bánh Quy Trà Sữa Trân Châu",
      voice: Object.freeze({ pitch: 1.2, rate: 1.02, lang: "en-US" })
    }),
    Object.freeze({
      id: "cookie",
      name: "Cookie",
      category: "dog",
      speciesEn: "Smiling Shiba Inu",
      speciesVi: "Cún Shiba Hay Cười",
      tier: "premium",
      free: false,
      pro: true,
      icon: "🐕‍🦺",
      sound: "Wan! Wan! 🍪",
      personalityEn: "Smart, adventurous, and always wears a big sunny smile!",
      personalityVi: "Thông minh, thích khám phá và luôn nở nụ cười tỏa nắng!",
      favFoodEn: "Crispy Butter Cookie",
      favFoodVi: "Bánh Quy Bơ Giòn Rụm",
      voice: Object.freeze({ pitch: 1.12, rate: 1.0, lang: "en-US" })
    }),

    // --- 3 CATS ---
    Object.freeze({
      id: "mochi",
      name: "Mochi",
      category: "cat",
      speciesEn: "Snowy Mochi Kitten",
      speciesVi: "Mèo Trắng Mochi",
      tier: "free",
      free: true,
      pro: false,
      icon: "🐱",
      sound: "Meow~ Purr! 🐾",
      personalityEn: "Sweet, gentle, and loves curling up while listening to your stories!",
      personalityVi: "Dịu dàng, ngọt ngào và thích cuộn tròn lắng nghe bé kể chuyện!",
      favFoodEn: "Strawberry Cream Fish Cake",
      favFoodVi: "Bánh Cá Kem Dâu Tây",
      voice: Object.freeze({ pitch: 1.3, rate: 0.96, lang: "en-US" })
    }),
    Object.freeze({
      id: "pepper",
      name: "Pepper",
      category: "cat",
      speciesEn: "British Shorthair Cat",
      speciesVi: "Mèo Anh Lông Ngắn",
      tier: "premium",
      free: false,
      pro: true,
      icon: "🐈",
      sound: "Mrrr~ Meow! 🎩",
      personalityEn: "Calm little detective with chubby cheeks who loves word puzzles!",
      personalityVi: "Thám tử mèo má phúng phính điềm tĩnh, cực mê giải đố từ vựng!",
      favFoodEn: "Golden Salmon Tart",
      favFoodVi: "Bánh Tart Cá Hồi Vàng",
      voice: Object.freeze({ pitch: 1.05, rate: 0.95, lang: "en-GB" })
    }),
    Object.freeze({
      id: "oreo",
      name: "Oreo",
      category: "cat",
      speciesEn: "Tuxedo Kitty",
      speciesVi: "Mèo Nhị Thể Tuxedo",
      tier: "premium",
      free: false,
      pro: true,
      icon: "🐈‍⬛",
      sound: "Mew! Purrrr~ 🖤",
      personalityEn: "Curious, dapper, and loves dancing to English songs!",
      personalityVi: "Tò mò, lịch lãm như mặc vest và mê nhún nhảy theo nhạc tiếng Anh!",
      favFoodEn: "Vanilla Cream Sandwich Treat",
      favFoodVi: "Bánh Kẹp Kem Vani",
      voice: Object.freeze({ pitch: 1.22, rate: 1.0, lang: "en-US" })
    }),

    // --- 4 RARE ---
    Object.freeze({
      id: "ember",
      name: "Ember",
      category: "rare",
      speciesEn: "Warm Flame Baby Dragon",
      speciesVi: "Rồng Nhỏ Lửa Ấm",
      tier: "premium",
      free: false,
      pro: true,
      icon: "🐉",
      sound: "Rawr~ Spark! 🔥",
      personalityEn: "Brave, warm-hearted, and puffs happy sparkles when you ace a quest!",
      personalityVi: "Dũng cảm, ấm áp và phun pháo hoa lấp lánh mỗi khi bé hoàn thành nhiệm vụ!",
      favFoodEn: "Roasted Starberry",
      favFoodVi: "Quả Sao Nướng Thơm Lừng",
      voice: Object.freeze({ pitch: 1.08, rate: 0.98, lang: "en-US" })
    }),
    Object.freeze({
      id: "lumi",
      name: "Lumi",
      category: "rare",
      speciesEn: "Rainbow Star Unicorn",
      speciesVi: "Kỳ Lân Cầu Vồng",
      tier: "premium",
      free: false,
      pro: true,
      icon: "🦄",
      sound: "Chime~ Neigh! ✨",
      personalityEn: "Magical, kind, and lights up the sky with rainbow words!",
      personalityVi: "Kỳ diệu, tốt bụng và thắp sáng bầu trời bằng những từ vựng cầu vồng!",
      favFoodEn: "Cloud Cotton Candy",
      favFoodVi: "Kẹo Bông Gòn Mây Hồng",
      voice: Object.freeze({ pitch: 1.35, rate: 0.97, lang: "en-US" })
    }),
    Object.freeze({
      id: "pip",
      name: "Pip",
      category: "rare",
      speciesEn: "Arctic Snow Fox",
      speciesVi: "Cáo Tuyết Bắc Cực",
      tier: "premium",
      free: false,
      pro: true,
      icon: "🦊",
      sound: "Yip! Yip! ❄️",
      personalityEn: "Quick-witted, fluffy, and loves hopping through snowy word trails!",
      personalityVi: "Nhanh trí, lông bông trắng muốt và thích nhảy chân sáo trên đường mòn từ vựng!",
      favFoodEn: "Sweet Blueberry Frost Tart",
      favFoodVi: "Bánh Việt Quất Tuyết Ngọt",
      voice: Object.freeze({ pitch: 1.28, rate: 1.04, lang: "en-US" })
    }),
    Object.freeze({
      id: "aqua",
      name: "Aqua",
      category: "rare",
      speciesEn: "Sea Pearl Otter",
      speciesVi: "Rái Cá Biển",
      tier: "premium",
      free: false,
      pro: true,
      icon: "🦦",
      sound: "Chirp! Splash! 🐚",
      personalityEn: "Relaxed, friendly, and carries a lucky seashell everywhere!",
      personalityVi: "Thư thái, thân thiện và luôn ôm chiếc vỏ sò may mắn bên mình!",
      favFoodEn: "Crunchy Kelp & Pearl Clam",
      favFoodVi: "Rong Biển Giòn & Sò Ngọc",
      voice: Object.freeze({ pitch: 1.18, rate: 1.0, lang: "en-US" })
    })
  ]);

  var PETS = {};
  var PET_IDS = [];
  for (var i = 0; i < PET_LIST.length; i++) {
    PETS[PET_LIST[i].id] = PET_LIST[i];
    PET_IDS.push(PET_LIST[i].id);
  }
  Object.freeze(PETS);
  Object.freeze(PET_IDS);

  // =========================================================================
  // 2. EXACTLY 10 STATES & STAGE-AWARE ASSET PATH RESOLVER
  // =========================================================================
  var STATES = Object.freeze([
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

  var STATE_META = Object.freeze({
    idle_happy: Object.freeze({
      id: "idle_happy",
      labelVi: "Vui vẻ",
      labelEn: "Happy & Relaxed",
      animationType: "float",
      fallbackState: "idle_happy",
      emoji: "😊"
    }),
    curious: Object.freeze({
      id: "curious",
      labelVi: "Tò mò",
      labelEn: "Curious",
      animationType: "tilt",
      fallbackState: "idle_happy",
      emoji: "🧐"
    }),
    playful: Object.freeze({
      id: "playful",
      labelVi: "Tinh nghịch",
      labelEn: "Playful",
      animationType: "bounce",
      fallbackState: "idle_happy",
      emoji: "🎾"
    }),
    eating: Object.freeze({
      id: "eating",
      labelVi: "Đang ăn ngon",
      labelEn: "Eating Yummy Food",
      animationType: "munch",
      fallbackState: "idle_happy",
      emoji: "🍖"
    }),
    drinking: Object.freeze({
      id: "drinking",
      labelVi: "Đang uống nước",
      labelEn: "Drinking Fresh Water",
      animationType: "sip",
      fallbackState: "idle_happy",
      emoji: "💧"
    }),
    sleepy: Object.freeze({
      id: "sleepy",
      labelVi: "Buồn ngủ",
      labelEn: "Sleepy",
      animationType: "sway",
      fallbackState: "idle_happy",
      emoji: "😪"
    }),
    tired: Object.freeze({
      id: "tired",
      labelVi: "Hơi mệt",
      labelEn: "A Little Tired",
      animationType: "slow-breathe",
      fallbackState: "idle_happy",
      emoji: "😴"
    }),
    sad_lonely: Object.freeze({
      id: "sad_lonely",
      labelVi: "Mong gặp bé",
      labelEn: "Missing You",
      animationType: "droop",
      fallbackState: "idle_happy",
      emoji: "🥺"
    }),
    excited: Object.freeze({
      id: "excited",
      labelVi: "Hào hứng",
      labelEn: "Super Excited",
      animationType: "jump",
      fallbackState: "idle_happy",
      emoji: "🤩"
    }),
    walking_adventure: Object.freeze({
      id: "walking_adventure",
      labelVi: "Đi dạo khám phá",
      labelEn: "Walking Adventure",
      animationType: "walk",
      fallbackState: "idle_happy",
      emoji: "🎒"
    })
  });

  var registeredStageAssets = Object.create(null);

  function isValidState(stateName) {
    return typeof stateName === "string" && STATES.indexOf(stateName) !== -1;
  }

  function normalizeCanonicalPetId(petId) {
    if (typeof petId !== "string") return "";
    var clean = petId.trim().toLowerCase();
    return PETS[clean] ? clean : "";
  }

  function normalizeStage(stageOrLevel, fallbackStage) {
    if (typeof stageOrLevel === "number" && STAGE_BY_LEVEL[stageOrLevel]) {
      return STAGE_BY_LEVEL[stageOrLevel];
    }
    if (typeof stageOrLevel === "string") {
      var s = stageOrLevel.trim().toLowerCase();
      if (STAGES.indexOf(s) !== -1) return s;
      var asNum = Number(s);
      if (STAGE_BY_LEVEL[asNum]) return STAGE_BY_LEVEL[asNum];
    }
    return fallbackStage && STAGES.indexOf(fallbackStage) !== -1 ? fallbackStage : "baby";
  }

  function registerStageAssets(pathsOrManifest) {
    if (!pathsOrManifest) return;
    if (Array.isArray(pathsOrManifest)) {
      for (var i = 0; i < pathsOrManifest.length; i++) {
        var item = pathsOrManifest[i];
        if (typeof item === "string") {
          registeredStageAssets[item.replace(/^\.\//, "")] = true;
        } else if (item && typeof item === "object" && typeof item.assetPath === "string") {
          registeredStageAssets[item.assetPath.replace(/^\.\//, "")] = true;
        }
      }
    } else if (typeof pathsOrManifest === "object") {
      var keys = Object.keys(pathsOrManifest);
      for (var j = 0; j < keys.length; j++) {
        if (pathsOrManifest[keys[j]]) {
          registeredStageAssets[keys[j].replace(/^\.\//, "")] = true;
        }
      }
    }
  }

  function hasStageAssetInManifestOrBundle(petId, stage, stateName) {
    var stagePath = "assets/pets/" + petId + "/" + stage + "/" + stateName + ".png";
    if (registeredStageAssets[stagePath]) {
      return true;
    }

    var assetsMap =
      (typeof root !== "undefined" && root && root.ELW_PET_ASSETS) ||
      (typeof window !== "undefined" && window && window.ELW_PET_ASSETS) ||
      (typeof globalThis !== "undefined" && globalThis && globalThis.ELW_PET_ASSETS) ||
      null;

    if (assetsMap && typeof assetsMap === "object") {
      if (Object.prototype.hasOwnProperty.call(assetsMap, stagePath) && assetsMap[stagePath]) {
        return true;
      }
      if (
        assetsMap[petId] &&
        typeof assetsMap[petId] === "object" &&
        assetsMap[petId][stage] &&
        assetsMap[petId][stage][stateName]
      ) {
        return true;
      }
    }

    var manifest =
      (typeof root !== "undefined" && root && (root.ELW_PET_MANIFEST || root.PET_MANIFEST)) ||
      (typeof window !== "undefined" && window && (window.ELW_PET_MANIFEST || window.PET_MANIFEST)) ||
      (typeof globalThis !== "undefined" && globalThis && (globalThis.ELW_PET_MANIFEST || globalThis.PET_MANIFEST)) ||
      null;

    if (Array.isArray(manifest)) {
      for (var i = 0; i < manifest.length; i++) {
        var entry = manifest[i];
        if (!entry) continue;
        if (entry === stagePath || entry.assetPath === stagePath) return true;
        if (entry.petId === petId && entry.stage === stage && entry.state === stateName) return true;
      }
    } else if (manifest && typeof manifest === "object") {
      if (manifest[stagePath]) return true;
      if (Array.isArray(manifest.entries)) {
        for (var k = 0; k < manifest.entries.length; k++) {
          var item = manifest.entries[k];
          if (!item) continue;
          if (item === stagePath || item.assetPath === stagePath) return true;
          if (item.petId === petId && item.stage === stage && item.state === stateName) return true;
        }
      }
    }

    return false;
  }

  function getAssetPath(petId, stateName, stage) {
    var validPetId = normalizeCanonicalPetId(petId) || "milu";
    var validState = isValidState(stateName) ? stateName : "idle_happy";
    var petRec = state && state.byPetId && state.byPetId[validPetId] ? state.byPetId[validPetId] : null;
    var defaultStage = petRec && petRec.stage ? petRec.stage : "baby";
    var validStage = normalizeStage(stage, defaultStage);
    var stagePath = "assets/pets/" + validPetId + "/" + validStage + "/" + validState + ".png";

    if (hasStageAssetInManifestOrBundle(validPetId, validStage, validState)) {
      return stagePath;
    }
    return "assets/pets/" + validPetId + "/" + validState + ".png";
  }

  function getStateMeta(stateName) {
    var validState = isValidState(stateName) ? stateName : "idle_happy";
    return STATE_META[validState];
  }

  // =========================================================================
  // 3. INTERNAL STATE, PER-PET RECORDS & STORAGE HELPERS
  // =========================================================================
  var memoryStorage = {};
  var listeners = []; // Array of { event: "*" | "stage-up" | string, fn: function }
  var temporaryStateObj = null; // { state: string, expiresAt: number }

  function getStorage() {
    try {
      if (typeof root !== "undefined" && root && root.localStorage) {
        return root.localStorage;
      }
      if (typeof localStorage !== "undefined") {
        return localStorage;
      }
    } catch (e) {
      // Ignore security errors in sandboxed environments
    }
    return {
      getItem: function (k) {
        return Object.prototype.hasOwnProperty.call(memoryStorage, k) ? memoryStorage[k] : null;
      },
      setItem: function (k, v) {
        memoryStorage[k] = String(v);
      },
      removeItem: function (k) {
        delete memoryStorage[k];
      }
    };
  }

  function safeParseJson(raw) {
    if (!raw || typeof raw !== "string") return null;
    try {
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function clampNeed(val, fallback) {
    var n = Number(val);
    if (!Number.isFinite(n)) {
      n = Number.isFinite(fallback) ? fallback : 80;
    }
    if (n < NEED_MIN) return NEED_MIN;
    if (n > NEED_MAX) return NEED_MAX;
    return Math.round(n * 100) / 100;
  }

  function isPetUnlockedAndValid(petId) {
    var norm = normalizeCanonicalPetId(petId);
    if (!norm) {
      return false;
    }
    var rewardsApi =
      (typeof root !== "undefined" && root && root.ELW_PET_REWARDS) ||
      (typeof window !== "undefined" && window && window.ELW_PET_REWARDS) ||
      (typeof globalThis !== "undefined" && globalThis && globalThis.ELW_PET_REWARDS) ||
      null;

    if (rewardsApi && typeof rewardsApi.isPetUnlocked === "function") {
      try {
        return Boolean(rewardsApi.isPetUnlocked(norm));
      } catch (e) {
        // Fallback to free tier check on error
      }
    }

    // Fallback check against elw_topics_v1.unlocked
    if (PETS[norm].free === true) return true;
    try {
      var storage = getStorage();
      var rawTopics = storage.getItem("elw_topics_v1");
      if (rawTopics) {
        var parsedTopics = safeParseJson(rawTopics);
        if (parsedTopics && parsedTopics.unlocked === true) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function sanitizePetId(petId) {
    var norm = normalizeCanonicalPetId(petId);
    return norm && isPetUnlockedAndValid(norm) ? norm : "milu";
  }

  function getThresholdForLevel(level) {
    var lv = Math.max(1, Math.min(5, Math.floor(Number(level) || 1)));
    return LEVEL_THRESHOLDS[lv - 1] || LEVEL_THRESHOLDS[0];
  }

  function computeLevelInfoByXp(xpValue) {
    var xp = Math.max(0, Math.floor(Number(xpValue) || 0));
    var current = LEVEL_THRESHOLDS[0];
    var next = null;
    for (var i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (xp >= LEVEL_THRESHOLDS[i].minXp) {
        current = LEVEL_THRESHOLDS[i];
        next = LEVEL_THRESHOLDS[i + 1] || null;
      }
    }
    var nextLevelXp = next ? next.minXp : current.minXp;
    var progressPct = 100;
    if (next) {
      var span = Math.max(1, next.minXp - current.minXp);
      progressPct = Math.min(100, Math.max(0, Math.round(((xp - current.minXp) / span) * 100)));
    }
    return {
      xp: xp,
      level: current.level,
      stage: current.stage,
      maxLevel: 5,
      nextLevelXp: nextLevelXp,
      progressPct: progressPct,
      scaleMultiplier: current.scaleMultiplier,
      stageBadge: current.stageBadge,
      stageNameVi: current.stageNameVi,
      stageNameEn: current.stageNameEn
    };
  }

  function computeStageLevelInfo(xpValue, currentLevelOrStage) {
    var xp = Math.max(0, Math.floor(Number(xpValue) || 0));
    var lv = 1;
    if (typeof currentLevelOrStage === "string" && LEVEL_BY_STAGE[currentLevelOrStage]) {
      lv = LEVEL_BY_STAGE[currentLevelOrStage];
    } else if (Number.isFinite(Number(currentLevelOrStage)) && Number(currentLevelOrStage) >= 1) {
      lv = Math.max(1, Math.min(5, Math.floor(Number(currentLevelOrStage))));
    }
    var current = getThresholdForLevel(lv);
    var next = LEVEL_THRESHOLDS[lv] || null;
    var nextLevelXp = next ? next.minXp : current.minXp;
    var progressPct = 100;
    if (next) {
      var span = Math.max(1, next.minXp - current.minXp);
      progressPct = Math.min(100, Math.max(0, Math.round(((xp - current.minXp) / span) * 100)));
    }
    return {
      xp: xp,
      level: current.level,
      stage: current.stage,
      maxLevel: 5,
      nextLevelXp: nextLevelXp,
      progressPct: progressPct,
      scaleMultiplier: current.scaleMultiplier,
      stageBadge: current.stageBadge,
      stageNameVi: current.stageNameVi,
      stageNameEn: current.stageNameEn
    };
  }

  function buildUnlockedSkillsForLevel(petId, level) {
    var id = normalizeCanonicalPetId(petId) || "milu";
    var lv = Math.max(1, Math.min(5, Math.floor(Number(level) || 1)));
    var skills = [];
    for (var i = 1; i <= lv; i++) {
      skills.push(id + "_s" + i);
    }
    return skills;
  }

  function normalizeProgression(rawProg) {
    var src = rawProg && typeof rawProg === "object" ? rawProg : {};
    var care = Math.max(
      0,
      Math.floor(Number(src.care !== undefined ? src.care : src.careCount) || 0)
    );
    var interaction = Math.max(
      0,
      Math.floor(Number(src.interaction !== undefined ? src.interaction : src.interactionCount) || 0)
    );
    var stageMissions = Math.max(
      0,
      Math.floor(Number(src.stageMissions !== undefined ? src.stageMissions : src.stageMissionsDone) || 0)
    );
    var skillUses = Math.max(
      0,
      Math.floor(Number(src.skillUses !== undefined ? src.skillUses : src.skillsActivatedCount) || 0)
    );

    return {
      care: care,
      interaction: interaction,
      stageMissions: stageMissions,
      skillUses: skillUses,
      careCount: care,
      interactionCount: interaction,
      stageMissionsDone: stageMissions,
      skillsActivatedCount: skillUses,
      stageCare: Math.max(0, Math.floor(Number(src.stageCare !== undefined ? src.stageCare : care) || 0)),
      stageInteraction: Math.max(
        0,
        Math.floor(Number(src.stageInteraction !== undefined ? src.stageInteraction : interaction) || 0)
      ),
      stageMissionsCurrent: Math.max(
        0,
        Math.floor(Number(src.stageMissionsCurrent !== undefined ? src.stageMissionsCurrent : stageMissions) || 0)
      ),
      stageSkillUses: Math.max(
        0,
        Math.floor(Number(src.stageSkillUses !== undefined ? src.stageSkillUses : skillUses) || 0)
      ),
      totalFed: Math.max(0, Math.floor(Number(src.totalFed) || 0)),
      totalWatered: Math.max(0, Math.floor(Number(src.totalWatered) || 0)),
      totalPlayed: Math.max(0, Math.floor(Number(src.totalPlayed) || 0)),
      totalRested: Math.max(0, Math.floor(Number(src.totalRested) || 0)),
      totalPetted: Math.max(0, Math.floor(Number(src.totalPetted) || 0)),
      totalTalked: Math.max(0, Math.floor(Number(src.totalTalked) || 0)),
      totalWalked: Math.max(0, Math.floor(Number(src.totalWalked) || 0)),
      completedStageMissions: Array.isArray(src.completedStageMissions) ? src.completedStageMissions.slice() : [],
      usedSkills: Array.isArray(src.usedSkills) ? src.usedSkills.slice() : []
    };
  }

  function syncProgressionAliases(prog) {
    if (!prog || typeof prog !== "object") return;
    prog.care = Math.max(0, Math.floor(Number(prog.care) || 0));
    prog.interaction = Math.max(0, Math.floor(Number(prog.interaction) || 0));
    prog.stageMissions = Math.max(0, Math.floor(Number(prog.stageMissions) || 0));
    prog.skillUses = Math.max(0, Math.floor(Number(prog.skillUses) || 0));
    prog.careCount = prog.care;
    prog.interactionCount = prog.interaction;
    prog.stageMissionsDone = prog.stageMissions;
    prog.skillsActivatedCount = prog.skillUses;
  }

  function normalizeMissionProgress(rawMp) {
    var src = rawMp && typeof rawMp === "object" ? rawMp : {};
    return {
      activeMissionId: typeof src.activeMissionId === "string" ? src.activeMissionId : null,
      currentStepIndex: Math.max(0, Math.floor(Number(src.currentStepIndex) || 0)),
      completedMissionIds: Array.isArray(src.completedMissionIds) ? src.completedMissionIds.slice() : [],
      completedByPlace:
        src.completedByPlace && typeof src.completedByPlace === "object" && !Array.isArray(src.completedByPlace)
          ? JSON.parse(JSON.stringify(src.completedByPlace))
          : {},
      seenVariants: Array.isArray(src.seenVariants) ? src.seenVariants.slice() : [],
      activeCheckpoint:
        src.activeCheckpoint && typeof src.activeCheckpoint === "object"
          ? JSON.parse(JSON.stringify(src.activeCheckpoint))
          : null
    };
  }

  function createPetRecord(petId, nowMs, isInitialized) {
    var id = normalizeCanonicalPetId(petId) || "milu";
    var now = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();
    var lvl = getThresholdForLevel(1);
    return {
      petId: id,
      initialized: Boolean(isInitialized),
      stage: "baby",
      level: 1,
      xp: 0,
      stageBadge: lvl.stageBadge,
      needs: {
        energy: DEFAULT_NEEDS.energy,
        hunger: DEFAULT_NEEDS.hunger,
        thirst: DEFAULT_NEEDS.thirst,
        fun: DEFAULT_NEEDS.fun,
        bond: DEFAULT_NEEDS.bond,
        lastUpdatedAt: now
      },
      progression: normalizeProgression({}),
      unlockedSkills: [id + "_s1"],
      missionProgress: normalizeMissionProgress({}),
      createdAt: now,
      lastSeen: now,
      bondStats: {
        firstMetAt: now,
        lastInteractedAt: now,
        favFoodFedCount: 0,
        levelUpHistory: []
      }
    };
  }

  function normalizeExistingPetRecord(petId, rawRec, nowMs) {
    var id = normalizeCanonicalPetId(petId) || "milu";
    var now = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();
    if (!rawRec || typeof rawRec !== "object") {
      return createPetRecord(id, now, false);
    }

    var xp = Math.max(0, Math.floor(Number(rawRec.xp) || 0));
    var stage = "baby";
    var level = 1;

    if (typeof rawRec.stage === "string" && LEVEL_BY_STAGE[rawRec.stage.trim().toLowerCase()]) {
      stage = rawRec.stage.trim().toLowerCase();
      level = LEVEL_BY_STAGE[stage];
    } else if (Number.isFinite(Number(rawRec.level)) && Number(rawRec.level) >= 1) {
      level = Math.max(1, Math.min(5, Math.floor(Number(rawRec.level))));
      stage = STAGE_BY_LEVEL[level] || "baby";
    }

    var lvlInfo = computeStageLevelInfo(xp, level);
    var rawNeeds = rawRec.needs && typeof rawRec.needs === "object" ? rawRec.needs : rawRec;
    var lastUpdatedAt = Number(rawNeeds.lastUpdatedAt !== undefined ? rawNeeds.lastUpdatedAt : now);
    if (!Number.isFinite(lastUpdatedAt) || lastUpdatedAt <= 0) {
      lastUpdatedAt = now;
    }

    var createdAt = Number(
      rawRec.createdAt !== undefined
        ? rawRec.createdAt
        : (rawRec.bondStats && rawRec.bondStats.firstMetAt ? rawRec.bondStats.firstMetAt : now)
    );
    if (!Number.isFinite(createdAt) || createdAt <= 0) createdAt = now;

    var lastSeen = Number(
      rawRec.lastSeen !== undefined
        ? rawRec.lastSeen
        : (rawRec.bondStats && rawRec.bondStats.lastInteractedAt ? rawRec.bondStats.lastInteractedAt : lastUpdatedAt)
    );
    if (!Number.isFinite(lastSeen) || lastSeen <= 0) lastSeen = now;

    var prog = normalizeProgression(rawRec.progression);
    var defaultSkills = buildUnlockedSkillsForLevel(id, level);
    var unlockedSkills = Array.isArray(rawRec.unlockedSkills) && rawRec.unlockedSkills.length > 0
      ? rawRec.unlockedSkills.slice()
      : defaultSkills;
    for (var sIdx = 0; sIdx < defaultSkills.length; sIdx++) {
      if (unlockedSkills.indexOf(defaultSkills[sIdx]) === -1) {
        unlockedSkills.push(defaultSkills[sIdx]);
      }
    }

    var initialized =
      rawRec.initialized !== undefined
        ? Boolean(rawRec.initialized)
        : (xp > 0 || level > 1 || prog.care > 0 || prog.interaction > 0 || prog.stageMissions > 0);

    var rec = {
      petId: id,
      initialized: initialized,
      stage: stage,
      level: level,
      xp: xp,
      stageBadge: lvlInfo.stageBadge,
      needs: {
        energy: clampNeed(rawNeeds.energy, DEFAULT_NEEDS.energy),
        hunger: clampNeed(rawNeeds.hunger, DEFAULT_NEEDS.hunger),
        thirst: clampNeed(rawNeeds.thirst, DEFAULT_NEEDS.thirst),
        fun: clampNeed(rawNeeds.fun !== undefined ? rawNeeds.fun : rawNeeds.mood, DEFAULT_NEEDS.fun),
        bond: clampNeed(rawNeeds.bond, DEFAULT_NEEDS.bond),
        lastUpdatedAt: lastUpdatedAt
      },
      progression: prog,
      unlockedSkills: unlockedSkills,
      missionProgress: normalizeMissionProgress(rawRec.missionProgress),
      createdAt: createdAt,
      lastSeen: lastSeen,
      bondStats: {
        firstMetAt: createdAt,
        lastInteractedAt: lastSeen,
        favFoodFedCount:
          rawRec.bondStats && Number.isFinite(Number(rawRec.bondStats.favFoodFedCount))
            ? Math.max(0, Math.floor(Number(rawRec.bondStats.favFoodFedCount)))
            : 0,
        levelUpHistory:
          rawRec.bondStats && Array.isArray(rawRec.bondStats.levelUpHistory)
            ? rawRec.bondStats.levelUpHistory.slice()
            : []
      }
    };

    return rec;
  }

  function createDefaultState(nowMs) {
    var now = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();
    var byPetId = {};
    for (var i = 0; i < PET_IDS.length; i++) {
      var pid = PET_IDS[i];
      byPetId[pid] = createPetRecord(pid, now, pid === "milu");
    }
    var activeRec = byPetId.milu;
    var lvl = computeStageLevelInfo(activeRec.xp, activeRec.level);
    return {
      schemaVersion: 2,
      activePetId: "milu",
      byPetId: byPetId,
      pets: byPetId,
      needs: {
        energy: activeRec.needs.energy,
        hunger: activeRec.needs.hunger,
        thirst: activeRec.needs.thirst,
        fun: activeRec.needs.fun,
        bond: activeRec.needs.bond,
        lastUpdatedAt: activeRec.needs.lastUpdatedAt
      },
      inventory: {
        treats: DEFAULT_INVENTORY.treats,
        water: DEFAULT_INVENTORY.water,
        toys: DEFAULT_INVENTORY.toys
      },
      stats: {
        xp: activeRec.xp,
        level: activeRec.level,
        stage: activeRec.stage,
        stageBadge: lvl.stageBadge,
        streak: 1
      }
    };
  }

  var state = createDefaultState(Date.now());
  var lastSavedJsonV2 = "";

  function ensurePetRecord(petId, nowMs) {
    var id = normalizeCanonicalPetId(petId) || "milu";
    var now = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();
    if (!state.byPetId || typeof state.byPetId !== "object") {
      state.byPetId = {};
    }
    state.pets = state.byPetId;
    if (!state.byPetId[id] || typeof state.byPetId[id] !== "object") {
      state.byPetId[id] = createPetRecord(id, now, id === state.activePetId);
    }
    return state.byPetId[id];
  }

  function syncActivePetFromRootMirrorsIfEdited() {
    var activeId = normalizeCanonicalPetId(state.activePetId) || "milu";
    var rec = ensurePetRecord(activeId);
    if (state.needs && typeof state.needs === "object") {
      rec.needs.energy = clampNeed(state.needs.energy, rec.needs.energy);
      rec.needs.hunger = clampNeed(state.needs.hunger, rec.needs.hunger);
      rec.needs.thirst = clampNeed(state.needs.thirst, rec.needs.thirst);
      rec.needs.fun = clampNeed(state.needs.fun, rec.needs.fun);
      rec.needs.bond = clampNeed(state.needs.bond, rec.needs.bond);
      if (Number.isFinite(state.needs.lastUpdatedAt) && state.needs.lastUpdatedAt > 0) {
        rec.needs.lastUpdatedAt = state.needs.lastUpdatedAt;
      }
    }
  }

  function syncRootMirrorsFromActivePet() {
    var activeId = sanitizePetId(state.activePetId);
    state.activePetId = activeId;
    var rec = ensurePetRecord(activeId);
    rec.initialized = true;
    var lvl = computeStageLevelInfo(rec.xp, rec.level);
    rec.stageBadge = lvl.stageBadge;

    state.needs = {
      energy: clampNeed(rec.needs.energy, DEFAULT_NEEDS.energy),
      hunger: clampNeed(rec.needs.hunger, DEFAULT_NEEDS.hunger),
      thirst: clampNeed(rec.needs.thirst, DEFAULT_NEEDS.thirst),
      fun: clampNeed(rec.needs.fun, DEFAULT_NEEDS.fun),
      bond: clampNeed(rec.needs.bond, DEFAULT_NEEDS.bond),
      lastUpdatedAt: Number.isFinite(rec.needs.lastUpdatedAt) ? rec.needs.lastUpdatedAt : Date.now()
    };

    var currentStreak =
      state.stats && Number.isFinite(Number(state.stats.streak))
        ? Math.max(1, Math.floor(Number(state.stats.streak)))
        : 1;

    state.stats = {
      xp: rec.xp,
      level: rec.level,
      stage: rec.stage,
      stageBadge: lvl.stageBadge,
      streak: currentStreak
    };
    state.pets = state.byPetId;
  }

  function extractCandidatePetId(obj) {
    if (!obj || typeof obj !== "object") return null;
    if (typeof obj.activePetId === "string") return obj.activePetId;
    if (typeof obj.petId === "string") return obj.petId;
    if (typeof obj.selectedPetId === "string") return obj.selectedPetId;
    return null;
  }

  function syncLegacyV1Storage(storage, safePetId) {
    try {
      var rawV1 = storage.getItem(STORAGE_KEY_V1);
      if (rawV1) {
        var parsedV1 = safeParseJson(rawV1) || {};
        var v1Candidate = extractCandidatePetId(parsedV1);
        if (v1Candidate !== safePetId) {
          parsedV1.activePetId = safePetId;
          if ("petId" in parsedV1) parsedV1.petId = safePetId;
          if ("selectedPetId" in parsedV1) parsedV1.selectedPetId = safePetId;
          storage.setItem(STORAGE_KEY_V1, JSON.stringify(parsedV1));
        }
      }
    } catch (e) {
      // Ignore storage write errors
    }
  }

  function serializePetRecordForStorage(rec) {
    syncProgressionAliases(rec.progression);
    var lvl = computeStageLevelInfo(rec.xp, rec.level);
    return {
      petId: rec.petId,
      initialized: Boolean(rec.initialized),
      stage: rec.stage,
      level: rec.level,
      xp: Math.max(0, Math.floor(Number(rec.xp) || 0)),
      stageBadge: lvl.stageBadge,
      needs: {
        energy: clampNeed(rec.needs.energy, DEFAULT_NEEDS.energy),
        hunger: clampNeed(rec.needs.hunger, DEFAULT_NEEDS.hunger),
        thirst: clampNeed(rec.needs.thirst, DEFAULT_NEEDS.thirst),
        fun: clampNeed(rec.needs.fun, DEFAULT_NEEDS.fun),
        bond: clampNeed(rec.needs.bond, DEFAULT_NEEDS.bond),
        lastUpdatedAt: Number.isFinite(rec.needs.lastUpdatedAt) ? rec.needs.lastUpdatedAt : Date.now()
      },
      progression: {
        care: rec.progression.care,
        interaction: rec.progression.interaction,
        stageMissions: rec.progression.stageMissions,
        skillUses: rec.progression.skillUses,
        careCount: rec.progression.care,
        interactionCount: rec.progression.interaction,
        stageMissionsDone: rec.progression.stageMissions,
        skillsActivatedCount: rec.progression.skillUses,
        stageCare: rec.progression.stageCare,
        stageInteraction: rec.progression.stageInteraction,
        stageMissionsCurrent: rec.progression.stageMissionsCurrent,
        stageSkillUses: rec.progression.stageSkillUses,
        totalFed: rec.progression.totalFed,
        totalWatered: rec.progression.totalWatered,
        totalPlayed: rec.progression.totalPlayed,
        totalRested: rec.progression.totalRested,
        totalPetted: rec.progression.totalPetted,
        totalTalked: rec.progression.totalTalked,
        totalWalked: rec.progression.totalWalked,
        completedStageMissions: rec.progression.completedStageMissions.slice(),
        usedSkills: rec.progression.usedSkills.slice()
      },
      unlockedSkills: rec.unlockedSkills.slice(),
      missionProgress: normalizeMissionProgress(rec.missionProgress),
      createdAt: rec.createdAt,
      lastSeen: rec.lastSeen,
      bondStats: {
        firstMetAt: rec.createdAt,
        lastInteractedAt: rec.lastSeen,
        favFoodFedCount:
          rec.bondStats && Number.isFinite(Number(rec.bondStats.favFoodFedCount))
            ? rec.bondStats.favFoodFedCount
            : 0,
        levelUpHistory:
          rec.bondStats && Array.isArray(rec.bondStats.levelUpHistory)
            ? rec.bondStats.levelUpHistory.slice()
            : []
      }
    };
  }

  function save() {
    var storage = getStorage();
    state.activePetId = sanitizePetId(state.activePetId);
    syncActivePetFromRootMirrorsIfEdited();
    syncRootMirrorsFromActivePet();

    var serializedByPetId = {};
    for (var i = 0; i < PET_IDS.length; i++) {
      var pid = PET_IDS[i];
      var rec = ensurePetRecord(pid);
      serializedByPetId[pid] = serializePetRecordForStorage(rec);
    }

    var activeRec = serializedByPetId[state.activePetId];
    var streakVal = Math.max(1, Math.floor(Number(state.stats && state.stats.streak) || 1));

    var payload = {
      schemaVersion: 2,
      activePetId: state.activePetId,
      byPetId: serializedByPetId,
      pets: serializedByPetId,
      needs: {
        energy: activeRec.needs.energy,
        hunger: activeRec.needs.hunger,
        thirst: activeRec.needs.thirst,
        fun: activeRec.needs.fun,
        bond: activeRec.needs.bond,
        lastUpdatedAt: activeRec.needs.lastUpdatedAt
      },
      inventory: {
        treats: Math.max(0, Math.floor(Number(state.inventory.treats) || 0)),
        water: Math.max(0, Math.floor(Number(state.inventory.water) || 0)),
        toys: Math.max(0, Math.floor(Number(state.inventory.toys) || 0))
      },
      stats: {
        xp: activeRec.xp,
        level: activeRec.level,
        stage: activeRec.stage,
        stageBadge: activeRec.stageBadge,
        streak: streakVal
      },
      _mirrorSync: {
        activePetId: state.activePetId,
        xp: activeRec.xp,
        level: activeRec.level,
        stage: activeRec.stage,
        energy: activeRec.needs.energy,
        hunger: activeRec.needs.hunger,
        thirst: activeRec.needs.thirst,
        fun: activeRec.needs.fun,
        bond: activeRec.needs.bond,
        lastUpdatedAt: activeRec.needs.lastUpdatedAt
      }
    };

    try {
      var serialized = JSON.stringify(payload);
      storage.setItem(STORAGE_KEY_V2, serialized);
      lastSavedJsonV2 = serialized;
      syncLegacyV1Storage(storage, state.activePetId);
    } catch (e) {
      // Ignore quota errors
    }
    return payload;
  }

  // =========================================================================
  // 4. MIGRATION FROM FLAT LEGACY SCHEMA TO PER-PET V2 SCHEMA
  // =========================================================================
  function isAlreadyMigratedV2(obj) {
    return Boolean(
      obj &&
        typeof obj === "object" &&
        obj.schemaVersion === 2 &&
        obj.byPetId &&
        typeof obj.byPetId === "object" &&
        !Array.isArray(obj.byPetId) &&
        Object.keys(obj.byPetId).length > 0
    );
  }

  function migrateToPerPetSchema(nowMs) {
    var storage = getStorage();
    var now = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();

    var rawV2 = storage.getItem(STORAGE_KEY_V2);
    var rawNeedsV1 = storage.getItem(STORAGE_KEY_NEEDS_V1);
    var rawPetV1 = storage.getItem(STORAGE_KEY_V1);
    var rawSurvival = storage.getItem(STORAGE_KEY_SURVIVAL);

    var parsedV2 = safeParseJson(rawV2);
    var parsedNeedsV1 = safeParseJson(rawNeedsV1);
    var parsedPetV1 = safeParseJson(rawPetV1);
    var parsedSurvival = safeParseJson(rawSurvival);

    // Case 1: Already in Per-Pet Schema V2 (Idempotent path)
    if (isAlreadyMigratedV2(parsedV2)) {
      var candidateV2 = extractCandidatePetId(parsedV2);
      var candidateV1 = extractCandidatePetId(parsedPetV1);
      var chosenId = candidateV2 || candidateV1 || "milu";
      if (candidateV1 && !isPetUnlockedAndValid(candidateV1)) {
        chosenId = "milu";
      }
      if (candidateV2 && !isPetUnlockedAndValid(candidateV2)) {
        chosenId = "milu";
      }
      var safeActiveId = sanitizePetId(chosenId);

      var byPetId = {};
      for (var i = 0; i < PET_IDS.length; i++) {
        var pid = PET_IDS[i];
        var prevMemRec = state && state.byPetId && state.byPetId[pid] ? state.byPetId[pid] : null;
        var rawPetRec = parsedV2.byPetId[pid] || (parsedV2.pets && parsedV2.pets[pid]) || null;
        var normRec = normalizeExistingPetRecord(pid, rawPetRec, now);
        if (
          prevMemRec &&
          prevMemRec._pendingEvolutionReceipt &&
          prevMemRec.stage === normRec.stage &&
          prevMemRec.level === normRec.level
        ) {
          normRec._pendingEvolutionReceipt = prevMemRec._pendingEvolutionReceipt;
        }
        byPetId[pid] = normRec;
      }

      // Reconcile if external code/test modified root parsedV2.needs or parsedV2.stats directly in localStorage
      var activeRec = byPetId[safeActiveId];
      activeRec.initialized = true;
      var syncMeta = parsedV2._mirrorSync && typeof parsedV2._mirrorSync === "object" ? parsedV2._mirrorSync : null;

      if (parsedV2.needs && typeof parsedV2.needs === "object") {
        var rootNeedsChanged =
          !syncMeta ||
          syncMeta.activePetId !== safeActiveId ||
          Number(parsedV2.needs.energy) !== Number(syncMeta.energy) ||
          Number(parsedV2.needs.hunger) !== Number(syncMeta.hunger) ||
          Number(parsedV2.needs.thirst) !== Number(syncMeta.thirst) ||
          Number(parsedV2.needs.fun) !== Number(syncMeta.fun) ||
          Number(parsedV2.needs.bond) !== Number(syncMeta.bond) ||
          Number(parsedV2.needs.lastUpdatedAt) !== Number(syncMeta.lastUpdatedAt);
        var petNeedsChanged =
          syncMeta &&
          syncMeta.activePetId === safeActiveId &&
          (Number(activeRec.needs.energy) !== Number(syncMeta.energy) ||
            Number(activeRec.needs.hunger) !== Number(syncMeta.hunger) ||
            Number(activeRec.needs.thirst) !== Number(syncMeta.thirst) ||
            Number(activeRec.needs.fun) !== Number(syncMeta.fun) ||
            Number(activeRec.needs.bond) !== Number(syncMeta.bond) ||
            Number(activeRec.needs.lastUpdatedAt) !== Number(syncMeta.lastUpdatedAt));

        if (rootNeedsChanged && !petNeedsChanged) {
          activeRec.needs.energy = clampNeed(parsedV2.needs.energy, activeRec.needs.energy);
          activeRec.needs.hunger = clampNeed(parsedV2.needs.hunger, activeRec.needs.hunger);
          activeRec.needs.thirst = clampNeed(parsedV2.needs.thirst, activeRec.needs.thirst);
          activeRec.needs.fun = clampNeed(parsedV2.needs.fun, activeRec.needs.fun);
          activeRec.needs.bond = clampNeed(parsedV2.needs.bond, activeRec.needs.bond);
          if (Number.isFinite(Number(parsedV2.needs.lastUpdatedAt)) && Number(parsedV2.needs.lastUpdatedAt) > 0) {
            activeRec.needs.lastUpdatedAt = Number(parsedV2.needs.lastUpdatedAt);
          }
        }
      }

      if (parsedV2.lastUpdatedAt !== undefined && (!parsedV2.needs || parsedV2.needs.lastUpdatedAt === undefined)) {
        var rootLastAt = Number(parsedV2.lastUpdatedAt);
        if (Number.isFinite(rootLastAt) && rootLastAt > 0) {
          activeRec.needs.lastUpdatedAt = rootLastAt;
        }
      }

      if (parsedV2.stats && typeof parsedV2.stats === "object") {
        var rootStatsChanged =
          !syncMeta ||
          syncMeta.activePetId !== safeActiveId ||
          Number(parsedV2.stats.xp) !== Number(syncMeta.xp) ||
          Number(parsedV2.stats.level) !== Number(syncMeta.level);
        var petStatsChanged =
          syncMeta &&
          syncMeta.activePetId === safeActiveId &&
          (Number(activeRec.xp) !== Number(syncMeta.xp) || Number(activeRec.level) !== Number(syncMeta.level));
        if (rootStatsChanged && !petStatsChanged) {
          if (parsedV2.stats.xp !== undefined) {
            activeRec.xp = Math.max(0, Math.floor(Number(parsedV2.stats.xp) || 0));
          }
          if (typeof parsedV2.stats.stage === "string" && LEVEL_BY_STAGE[parsedV2.stats.stage]) {
            activeRec.stage = parsedV2.stats.stage;
            activeRec.level = LEVEL_BY_STAGE[activeRec.stage];
          } else if (parsedV2.stats.level !== undefined) {
            activeRec.level = Math.max(1, Math.min(5, Math.floor(Number(parsedV2.stats.level) || 1)));
            activeRec.stage = STAGE_BY_LEVEL[activeRec.level] || "baby";
          }
        }
      }

      var rawInvV2 = parsedV2.inventory || parsedV2.sharedInventory || parsedV2.petItems || {};
      var streakV2 =
        parsedV2.stats && Number.isFinite(Number(parsedV2.stats.streak))
          ? Math.max(1, Math.floor(Number(parsedV2.stats.streak)))
          : 1;

      state = {
        schemaVersion: 2,
        activePetId: safeActiveId,
        byPetId: byPetId,
        pets: byPetId,
        needs: Object.assign({}, activeRec.needs),
        inventory: {
          treats:
            rawInvV2.treats !== undefined
              ? Math.max(0, Math.floor(Number(rawInvV2.treats) || 0))
              : DEFAULT_INVENTORY.treats,
          water:
            rawInvV2.water !== undefined
              ? Math.max(0, Math.floor(Number(rawInvV2.water) || 0))
              : DEFAULT_INVENTORY.water,
          toys:
            rawInvV2.toys !== undefined
              ? Math.max(0, Math.floor(Number(rawInvV2.toys) || 0))
              : DEFAULT_INVENTORY.toys
        },
        stats: {
          xp: activeRec.xp,
          level: activeRec.level,
          stage: activeRec.stage,
          stageBadge: activeRec.stageBadge,
          streak: streakV2
        }
      };

      syncRootMirrorsFromActivePet();
      save();
      return {
        migrated: false,
        alreadyMigrated: true,
        backupKey: BACKUP_STORAGE_KEY,
        activePetId: state.activePetId,
        byPetId: state.byPetId,
        pets: state.byPetId,
        needs: state.needs,
        stats: state.stats,
        inventory: state.inventory
      };
    }

    // Case 2: Flat Legacy Data or Fresh Install
    var legacySource = parsedV2 || parsedNeedsV1 || parsedSurvival || parsedPetV1;
    if (!legacySource) {
      state = createDefaultState(now);
      save();
      return {
        migrated: false,
        alreadyMigrated: false,
        backupKey: BACKUP_STORAGE_KEY,
        activePetId: state.activePetId,
        byPetId: state.byPetId,
        pets: state.byPetId,
        needs: state.needs,
        stats: state.stats,
        inventory: state.inventory
      };
    }

    // Backup legacy flat data BEFORE writing V2 (Zero-Data-Loss Backup)
    try {
      var backupJson = JSON.stringify(legacySource);
      storage.setItem(BACKUP_STORAGE_KEY, backupJson);
      storage.setItem(BACKUP_STORAGE_KEY_ALT, backupJson);
    } catch (e) {}

    var candV2 = extractCandidatePetId(parsedV2);
    var candNeedsV1 = extractCandidatePetId(parsedNeedsV1);
    var candPetV1 = extractCandidatePetId(parsedPetV1);
    var candSurv = extractCandidatePetId(parsedSurvival);
    var rawCandidate = candV2 || candNeedsV1 || candPetV1 || candSurv || "milu";

    if (candPetV1 && !isPetUnlockedAndValid(candPetV1)) {
      rawCandidate = "milu";
    }
    if (candV2 && !isPetUnlockedAndValid(candV2)) {
      rawCandidate = "milu";
    }
    var ownerPetId = sanitizePetId(rawCandidate);

    var rawNeeds =
      legacySource.needs && typeof legacySource.needs === "object" ? legacySource.needs : legacySource;
    var rawStats =
      legacySource.stats && typeof legacySource.stats === "object" ? legacySource.stats : legacySource;
    var rawInv =
      legacySource.inventory || legacySource.sharedInventory || legacySource.petItems || {};

    var legacyXp = Math.max(
      0,
      Math.floor(Number(rawStats.xp !== undefined ? rawStats.xp : legacySource.xp) || 0)
    );
    var xpDerived = computeLevelInfoByXp(legacyXp);

    var explicitLevel = Number(rawStats.level !== undefined ? rawStats.level : legacySource.level);
    var explicitStage =
      typeof rawStats.stage === "string"
        ? rawStats.stage.trim().toLowerCase()
        : (typeof legacySource.stage === "string" ? legacySource.stage.trim().toLowerCase() : "");

    var resolvedLevel = xpDerived.level;
    if (explicitStage && LEVEL_BY_STAGE[explicitStage]) {
      resolvedLevel = Math.max(resolvedLevel, LEVEL_BY_STAGE[explicitStage]);
    } else if (Number.isFinite(explicitLevel) && explicitLevel >= 1 && explicitLevel <= 5) {
      resolvedLevel = Math.max(resolvedLevel, Math.floor(explicitLevel));
    }
    var resolvedStage = STAGE_BY_LEVEL[resolvedLevel] || "baby";
    var stageLvlInfo = computeStageLevelInfo(legacyXp, resolvedLevel);

    var lastUpdatedAt = Number(
      rawNeeds.lastUpdatedAt !== undefined
        ? rawNeeds.lastUpdatedAt
        : (legacySource.lastUpdatedAt !== undefined ? legacySource.lastUpdatedAt : now)
    );
    if (!Number.isFinite(lastUpdatedAt) || lastUpdatedAt <= 0) {
      lastUpdatedAt = now;
    }

    var migratedByPetId = {};
    for (var j = 0; j < PET_IDS.length; j++) {
      var petKey = PET_IDS[j];
      migratedByPetId[petKey] = createPetRecord(petKey, now, petKey === ownerPetId);
    }

    var ownerRec = migratedByPetId[ownerPetId];
    ownerRec.initialized = true;
    ownerRec.xp = legacyXp;
    ownerRec.level = resolvedLevel;
    ownerRec.stage = resolvedStage;
    ownerRec.stageBadge = stageLvlInfo.stageBadge;
    ownerRec.needs = {
      energy: clampNeed(rawNeeds.energy, DEFAULT_NEEDS.energy),
      hunger: clampNeed(rawNeeds.hunger, DEFAULT_NEEDS.hunger),
      thirst: clampNeed(rawNeeds.thirst, DEFAULT_NEEDS.thirst),
      fun: clampNeed(rawNeeds.fun !== undefined ? rawNeeds.fun : rawNeeds.mood, DEFAULT_NEEDS.fun),
      bond: clampNeed(rawNeeds.bond, DEFAULT_NEEDS.bond),
      lastUpdatedAt: lastUpdatedAt
    };

    var minGateForLevel = Math.max(0, resolvedLevel - 1);
    var legacyFed = Math.max(0, Math.floor(Number(legacySource.totalFed || rawStats.totalFed) || 0));
    ownerRec.progression = normalizeProgression(legacySource.progression || {
      care: Math.max(legacyFed, minGateForLevel),
      interaction: minGateForLevel,
      stageMissions: minGateForLevel,
      skillUses: 0,
      stageCare: 0,
      stageInteraction: 0,
      stageMissionsCurrent: 0,
      stageSkillUses: 0,
      totalFed: legacyFed
    });
    ownerRec.unlockedSkills = buildUnlockedSkillsForLevel(ownerPetId, resolvedLevel);

    var streakVal = Math.max(1, Math.floor(Number(rawStats.streak || legacySource.streak) || 1));

    state = {
      schemaVersion: 2,
      activePetId: ownerPetId,
      byPetId: migratedByPetId,
      pets: migratedByPetId,
      needs: Object.assign({}, ownerRec.needs),
      inventory: {
        treats:
          rawInv.treats !== undefined
            ? Math.max(0, Math.floor(Number(rawInv.treats) || 0))
            : DEFAULT_INVENTORY.treats,
        water:
          rawInv.water !== undefined
            ? Math.max(0, Math.floor(Number(rawInv.water) || 0))
            : DEFAULT_INVENTORY.water,
        toys:
          rawInv.toys !== undefined
            ? Math.max(0, Math.floor(Number(rawInv.toys) || 0))
            : DEFAULT_INVENTORY.toys
      },
      stats: {
        xp: ownerRec.xp,
        level: ownerRec.level,
        stage: ownerRec.stage,
        stageBadge: ownerRec.stageBadge,
        streak: streakVal
      }
    };

    syncRootMirrorsFromActivePet();
    save();

    return {
      migrated: true,
      alreadyMigrated: false,
      backupKey: BACKUP_STORAGE_KEY,
      activePetId: state.activePetId,
      byPetId: state.byPetId,
      pets: state.byPetId,
      needs: state.needs,
      stats: state.stats,
      inventory: state.inventory
    };
  }

  function load() {
    var now = Date.now();
    migrateToPerPetSchema(now);
    catchUp(now);
    save();
    return getSnapshot();
  }

  // =========================================================================
  // 5. TIMESTAMP-BASED CAPPED OFFLINE DECAY (ZERO PENALTY ON XP/STAGE/BOND)
  // =========================================================================
  function applyDecayCalculation(currentValue, ratePerHour, elapsedHours) {
    var cur = clampNeed(currentValue, 80);
    if (ratePerHour <= 0 || elapsedHours <= 0) {
      return cur;
    }
    // Natural decay NEVER pulls needs below OFFLINE_FLOOR (25)
    if (cur <= OFFLINE_FLOOR) {
      return cur;
    }
    var decayed = cur - ratePerHour * elapsedHours;
    var floored = Math.max(OFFLINE_FLOOR, decayed);
    return Math.round(floored);
  }

  function catchUpPetRecord(rec, nowMs) {
    var hasExplicitNow = Number.isFinite(nowMs);
    var targetNow = hasExplicitNow ? Number(nowMs) : Date.now();
    var lastAt = Number.isFinite(rec.needs.lastUpdatedAt) ? rec.needs.lastUpdatedAt : targetNow;

    var rawElapsedMs = targetNow - lastAt;
    if (rawElapsedMs <= 0) {
      if (hasExplicitNow && targetNow > 0) {
        rec.needs.lastUpdatedAt = targetNow;
      }
      return;
    }

    // Ignore micro-reads (< 60s) unless caller explicitly passed nowMs
    if (!hasExplicitNow && rawElapsedMs < 60 * 1000) {
      return;
    }

    var effectiveElapsedMs = Math.min(rawElapsedMs, MAX_OFFLINE_DECAY_MS);
    var elapsedHours = effectiveElapsedMs / (3600 * 1000);

    rec.needs.hunger = applyDecayCalculation(rec.needs.hunger, DECAY_RATES_PER_HOUR.hunger, elapsedHours);
    rec.needs.thirst = applyDecayCalculation(rec.needs.thirst, DECAY_RATES_PER_HOUR.thirst, elapsedHours);
    rec.needs.energy = applyDecayCalculation(rec.needs.energy, DECAY_RATES_PER_HOUR.energy, elapsedHours);
    rec.needs.fun = applyDecayCalculation(rec.needs.fun, DECAY_RATES_PER_HOUR.fun, elapsedHours);
    // bond, xp, stage, level, progression NEVER decay when offline!
    rec.needs.bond = clampNeed(rec.needs.bond, DEFAULT_NEEDS.bond);
    rec.needs.lastUpdatedAt = targetNow;
    rec.lastSeen = targetNow;
  }

  function catchUp(nowMs) {
    syncActivePetFromRootMirrorsIfEdited();
    var activeRec = ensurePetRecord(state.activePetId);
    catchUpPetRecord(activeRec, nowMs);
    syncRootMirrorsFromActivePet();
    save();
    return copyNeeds();
  }

  function simulateElapsed(ms) {
    var deltaMs = Math.max(0, Number(ms) || 0);
    var now = Date.now();
    var activeRec = ensurePetRecord(state.activePetId, now);
    activeRec.needs.lastUpdatedAt = now - deltaMs;
    state.needs.lastUpdatedAt = now - deltaMs;
    var updated = catchUp(now);
    notifyListeners();
    return updated;
  }

  function copyPetNeeds(needsObj) {
    var src = needsObj && typeof needsObj === "object" ? needsObj : DEFAULT_NEEDS;
    return {
      energy: clampNeed(src.energy, DEFAULT_NEEDS.energy),
      hunger: clampNeed(src.hunger, DEFAULT_NEEDS.hunger),
      thirst: clampNeed(src.thirst, DEFAULT_NEEDS.thirst),
      fun: clampNeed(src.fun, DEFAULT_NEEDS.fun),
      bond: clampNeed(src.bond, DEFAULT_NEEDS.bond),
      lastUpdatedAt: Number.isFinite(src.lastUpdatedAt) ? src.lastUpdatedAt : Date.now()
    };
  }

  function copyNeeds() {
    var activeRec = ensurePetRecord(state.activePetId);
    return copyPetNeeds(activeRec.needs);
  }

  // =========================================================================
  // 6. MULTI-GATE 5-STAGE EVOLUTION & PROGRESSION RECORDING
  // =========================================================================
  function resolvePetAndPayload(arg1, arg2) {
    var norm1 = normalizeCanonicalPetId(arg1);
    if (norm1) {
      return { petId: norm1, payload: arg2 };
    }
    if (arg1 && typeof arg1 === "object" && normalizeCanonicalPetId(arg1.petId)) {
      return { petId: normalizeCanonicalPetId(arg1.petId), payload: arg1 };
    }
    return { petId: getActivePetId(), payload: arg1 };
  }

  function evaluateEvolutionCandidate(rec) {
    var currentStage = rec.stage || STAGE_BY_LEVEL[rec.level] || "baby";
    var currentLevel = LEVEL_BY_STAGE[currentStage] || 1;

    if (currentLevel >= 5) {
      return {
        canEvolve: false,
        from: "elite",
        to: "elite",
        fromLevel: 5,
        toLevel: 5,
        missing: []
      };
    }

    var nextLevel = currentLevel + 1;
    var nextStage = STAGE_BY_LEVEL[nextLevel] || "young";
    var nextReq = STAGE_REQUIREMENTS[nextStage];

    var hasXp = rec.xp >= nextReq.minXp;
    var hasCare = rec.progression.stageCare >= 1 || rec.progression.care >= nextReq.care;
    var hasInteraction =
      rec.progression.stageInteraction >= 1 || rec.progression.interaction >= nextReq.interaction;
    var hasStageMissions =
      rec.progression.stageMissionsCurrent >= 1 || rec.progression.stageMissions >= nextReq.stageMissions;

    var missing = [];
    if (!hasXp) missing.push("xp");
    if (!hasCare) missing.push("care");
    if (!hasInteraction) missing.push("interaction");
    if (!hasStageMissions) missing.push("stageMissions");

    if (missing.length > 0) {
      return {
        canEvolve: false,
        from: currentStage,
        to: nextStage,
        fromLevel: currentLevel,
        toLevel: nextLevel,
        missing: missing
      };
    }

    // Determine target level: if XP qualifies for a higher level (e.g., baby -> teen with >=250 XP)
    // and either cumulative gates meet that level OR pet is advancing from baby in a batch
    var xpLevel = computeLevelInfoByXp(rec.xp).level;
    var targetLevel = nextLevel;
    if (xpLevel > nextLevel) {
      var targetStageCand = STAGE_BY_LEVEL[xpLevel];
      var candReq = STAGE_REQUIREMENTS[targetStageCand];
      if (
        (rec.progression.care >= candReq.care &&
          rec.progression.interaction >= candReq.interaction &&
          rec.progression.stageMissions >= candReq.stageMissions) ||
        currentLevel === 1
      ) {
        targetLevel = xpLevel;
      }
    }

    var targetStage = STAGE_BY_LEVEL[targetLevel] || nextStage;
    return {
      canEvolve: true,
      from: currentStage,
      to: targetStage,
      fromLevel: currentLevel,
      toLevel: targetLevel,
      missing: []
    };
  }

  function applyStageEvolutionToRecord(rec, evalResult, nowMs) {
    var now = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();
    var existingReceipt = rec._pendingEvolutionReceipt || null;
    var originalFromStage =
      existingReceipt && !existingReceipt.consumed ? existingReceipt.from : evalResult.from;
    var originalFromLevel =
      existingReceipt && !existingReceipt.consumed ? existingReceipt.fromLevel : evalResult.fromLevel;

    var toLevel = evalResult.toLevel;
    var toStage = evalResult.to;
    var lvlInfo = computeStageLevelInfo(rec.xp, toLevel);

    rec.level = toLevel;
    rec.stage = toStage;
    rec.stageBadge = lvlInfo.stageBadge;
    rec.lastSeen = now;

    // Ensure cumulative progression reflects the reached stage floor and reset per-stage counters
    var floorCount = Math.max(0, toLevel - 1);
    rec.progression.care = Math.max(rec.progression.care, floorCount);
    rec.progression.interaction = Math.max(rec.progression.interaction, floorCount);
    rec.progression.stageMissions = Math.max(rec.progression.stageMissions, floorCount);
    syncProgressionAliases(rec.progression);

    rec.progression.stageCare = Math.max(0, rec.progression.care - floorCount);
    rec.progression.stageInteraction = Math.max(0, rec.progression.interaction - floorCount);
    rec.progression.stageMissionsCurrent = Math.max(0, rec.progression.stageMissions - floorCount);
    rec.progression.stageSkillUses = 0;

    // Unlock skills up to new level
    var skillsForLvl = buildUnlockedSkillsForLevel(rec.petId, toLevel);
    for (var i = 0; i < skillsForLvl.length; i++) {
      if (rec.unlockedSkills.indexOf(skillsForLvl[i]) === -1) {
        rec.unlockedSkills.push(skillsForLvl[i]);
      }
    }

    if (!rec.bondStats || typeof rec.bondStats !== "object") {
      rec.bondStats = { firstMetAt: rec.createdAt, lastInteractedAt: now, favFoodFedCount: 0, levelUpHistory: [] };
    }
    if (!Array.isArray(rec.bondStats.levelUpHistory)) {
      rec.bondStats.levelUpHistory = [];
    }
    rec.bondStats.lastInteractedAt = now;
    rec.bondStats.levelUpHistory.push({
      fromStage: originalFromStage,
      toStage: toStage,
      level: toLevel,
      at: now
    });

    var receipt = {
      evolved: true,
      petId: rec.petId,
      from: originalFromStage,
      to: toStage,
      fromLevel: originalFromLevel,
      toLevel: toLevel,
      stage: toStage,
      level: toLevel,
      xp: rec.xp,
      missing: [],
      at: now,
      consumed: false,
      notifiedFns:
        existingReceipt && !existingReceipt.consumed && Array.isArray(existingReceipt.notifiedFns)
          ? existingReceipt.notifiedFns
          : []
    };
    rec._pendingEvolutionReceipt = receipt;

    if (rec.petId === state.activePetId) {
      syncRootMirrorsFromActivePet();
    }
    save();
    emitStageUpEvent(receipt);
    return receipt;
  }

  var listenerDispatchDepth = 0;

  function emitStageUpEvent(receipt) {
    var detail = {
      type: "stage-up",
      event: "stage-up",
      evolved: true,
      petId: receipt.petId,
      from: receipt.from,
      to: receipt.to,
      oldStage: receipt.from,
      newStage: receipt.to,
      fromLevel: receipt.fromLevel,
      toLevel: receipt.toLevel,
      stage: receipt.to,
      level: receipt.toLevel,
      xp: receipt.xp,
      missing: []
    };

    listenerDispatchDepth++;
    try {
      if (listeners.length > 0) {
        var baseSnap = getSnapshot();
        var snapWithStageUp = Object.assign({}, baseSnap, detail);
        var copy = listeners.slice();
        for (var i = 0; i < copy.length; i++) {
          var entry = copy[i];
          if (!entry || typeof entry.fn !== "function") continue;
          if (receipt.notifiedFns && receipt.notifiedFns.indexOf(entry.fn) !== -1) {
            continue;
          }
          if (entry.event === "*" || entry.event === "stage-up" || entry.event === "elw:pet-stage-up") {
            try {
              if (entry.event === "stage-up" || entry.event === "elw:pet-stage-up") {
                entry.fn(detail, "stage-up", snapWithStageUp);
              } else {
                entry.fn(snapWithStageUp, "stage-up", detail);
              }
              if (receipt.notifiedFns) {
                receipt.notifiedFns.push(entry.fn);
              }
            } catch (e) {}
          }
        }
      }

      try {
        var win = (typeof window !== "undefined" && window) || (typeof root !== "undefined" && root) || null;
        if (win && typeof win.dispatchEvent === "function" && typeof win.CustomEvent === "function") {
          win.dispatchEvent(new win.CustomEvent("elw:pet-stage-up", { detail: detail }));
          win.dispatchEvent(new win.CustomEvent("elw:pet-level-up", { detail: detail }));
          win.dispatchEvent(new win.CustomEvent("stage-up", { detail: detail }));
        }
      } catch (e) {}
    } finally {
      listenerDispatchDepth = Math.max(0, listenerDispatchDepth - 1);
    }
  }

  function tryAutoEvolveRecord(rec) {
    var evalRes = evaluateEvolutionCandidate(rec);
    if (evalRes.canEvolve) {
      return applyStageEvolutionToRecord(rec, evalRes, Date.now());
    }
    if (rec._pendingEvolutionReceipt && rec._pendingEvolutionReceipt.consumed) {
      rec._pendingEvolutionReceipt = null;
    }
    return null;
  }

  function checkStageEvolution(petId) {
    var targetId = normalizeCanonicalPetId(petId) || getActivePetId();
    var rec = ensurePetRecord(targetId);

    // 1. Check if eligible to evolve right now
    var evalRes = evaluateEvolutionCandidate(rec);
    if (evalRes.canEvolve) {
      var receipt = applyStageEvolutionToRecord(rec, evalRes, Date.now());
      if (listenerDispatchDepth === 0) {
        receipt.consumed = true;
      }
      return {
        evolved: true,
        petId: targetId,
        from: receipt.from,
        to: receipt.to,
        stage: receipt.to,
        level: receipt.toLevel,
        missing: []
      };
    }

    // 2. If it just auto-evolved on the preceding record*/addXp call and hasn't been consumed by direct caller yet
    if (rec._pendingEvolutionReceipt && !rec._pendingEvolutionReceipt.consumed) {
      var pending = rec._pendingEvolutionReceipt;
      if (listenerDispatchDepth === 0) {
        pending.consumed = true;
      }
      emitStageUpEvent(pending);
      return {
        evolved: true,
        petId: targetId,
        from: pending.from,
        to: pending.to,
        stage: pending.to,
        level: pending.toLevel,
        missing: []
      };
    }

    return {
      evolved: false,
      petId: targetId,
      from: evalRes.from,
      to: evalRes.to,
      stage: rec.stage,
      level: rec.level,
      missing: evalRes.missing.slice()
    };
  }

  function recordCareAction(petIdOrType, typeOrOpts) {
    var resolved = resolvePetAndPayload(petIdOrType, typeOrOpts);
    var rec = ensurePetRecord(resolved.petId);
    rec.initialized = true;

    var payload = resolved.payload;
    var count = 1;
    var actionType = "care";
    if (typeof payload === "number" && Number.isFinite(payload)) {
      count = Math.max(1, Math.floor(payload));
    } else if (typeof payload === "string" && payload.trim()) {
      actionType = payload.trim().toLowerCase();
    } else if (payload && typeof payload === "object") {
      if (Number.isFinite(Number(payload.count))) {
        count = Math.max(1, Math.floor(Number(payload.count)));
      }
      if (typeof payload.type === "string" && payload.type.trim()) {
        actionType = payload.type.trim().toLowerCase();
      }
    }

    rec.progression.care += count;
    rec.progression.stageCare += count;
    if (actionType === "feed" || actionType === "eat") {
      rec.progression.totalFed += count;
    } else if (actionType === "water" || actionType === "drink") {
      rec.progression.totalWatered += count;
    } else if (actionType === "play") {
      rec.progression.totalPlayed += count;
    } else if (actionType === "rest" || actionType === "sleep") {
      rec.progression.totalRested += count;
    } else if (actionType === "pet" || actionType === "cuddle") {
      rec.progression.totalPetted += count;
    }
    syncProgressionAliases(rec.progression);
    rec.lastSeen = Date.now();

    tryAutoEvolveRecord(rec);
    if (resolved.petId === state.activePetId) {
      syncRootMirrorsFromActivePet();
    }
    save();
    notifyListeners();
    return getPetProgress(resolved.petId);
  }

  function recordInteraction(petIdOrType, typeOrOpts) {
    var resolved = resolvePetAndPayload(petIdOrType, typeOrOpts);
    var rec = ensurePetRecord(resolved.petId);
    rec.initialized = true;

    var payload = resolved.payload;
    var count = 1;
    var interType = "interaction";
    if (typeof payload === "number" && Number.isFinite(payload)) {
      count = Math.max(1, Math.floor(payload));
    } else if (typeof payload === "string" && payload.trim()) {
      interType = payload.trim().toLowerCase();
    } else if (payload && typeof payload === "object") {
      if (Number.isFinite(Number(payload.count))) {
        count = Math.max(1, Math.floor(Number(payload.count)));
      }
      if (typeof payload.type === "string" && payload.type.trim()) {
        interType = payload.type.trim().toLowerCase();
      }
    }

    rec.progression.interaction += count;
    rec.progression.stageInteraction += count;
    if (interType === "talk" || interType === "speak" || interType === "phrase") {
      rec.progression.totalTalked += count;
    } else if (interType === "walk" || interType === "adventure") {
      rec.progression.totalWalked += count;
    }
    syncProgressionAliases(rec.progression);
    rec.lastSeen = Date.now();

    tryAutoEvolveRecord(rec);
    if (resolved.petId === state.activePetId) {
      syncRootMirrorsFromActivePet();
    }
    save();
    notifyListeners();
    return getPetProgress(resolved.petId);
  }

  function recordSkillUse(petIdOrSkillId, skillIdOrOpts) {
    var resolved = resolvePetAndPayload(petIdOrSkillId, skillIdOrOpts);
    var rec = ensurePetRecord(resolved.petId);
    rec.initialized = true;

    var payload = resolved.payload;
    var count = 1;
    var skillId = "";
    if (typeof payload === "number" && Number.isFinite(payload)) {
      count = Math.max(1, Math.floor(payload));
    } else if (typeof payload === "string" && payload.trim()) {
      skillId = payload.trim();
    } else if (payload && typeof payload === "object") {
      if (Number.isFinite(Number(payload.count))) {
        count = Math.max(1, Math.floor(Number(payload.count)));
      }
      if (typeof payload.skillId === "string" && payload.skillId.trim()) {
        skillId = payload.skillId.trim();
      }
    }

    rec.progression.skillUses += count;
    rec.progression.stageSkillUses += count;
    if (skillId && rec.progression.usedSkills.indexOf(skillId) === -1) {
      rec.progression.usedSkills.push(skillId);
    }
    syncProgressionAliases(rec.progression);
    rec.lastSeen = Date.now();

    if (resolved.petId === state.activePetId) {
      syncRootMirrorsFromActivePet();
    }
    save();
    notifyListeners();
    return getPetProgress(resolved.petId);
  }

  function recordStageMission(petIdOrMissionId, missionIdOrOpts) {
    var resolved = resolvePetAndPayload(petIdOrMissionId, missionIdOrOpts);
    var rec = ensurePetRecord(resolved.petId);
    rec.initialized = true;

    var payload = resolved.payload;
    var count = 1;
    var missionId = "";
    if (typeof payload === "number" && Number.isFinite(payload)) {
      count = Math.max(1, Math.floor(payload));
    } else if (typeof payload === "string" && payload.trim()) {
      missionId = payload.trim();
    } else if (payload && typeof payload === "object") {
      if (Number.isFinite(Number(payload.count))) {
        count = Math.max(1, Math.floor(Number(payload.count)));
      }
      if (typeof payload.missionId === "string" && payload.missionId.trim()) {
        missionId = payload.missionId.trim();
      } else if (typeof payload.id === "string" && payload.id.trim()) {
        missionId = payload.id.trim();
      }
    }

    rec.progression.stageMissions += count;
    rec.progression.stageMissionsCurrent += count;
    if (missionId) {
      if (rec.progression.completedStageMissions.indexOf(missionId) === -1) {
        rec.progression.completedStageMissions.push(missionId);
      }
      if (rec.missionProgress.completedMissionIds.indexOf(missionId) === -1) {
        rec.missionProgress.completedMissionIds.push(missionId);
      }
    }
    syncProgressionAliases(rec.progression);
    rec.lastSeen = Date.now();

    tryAutoEvolveRecord(rec);
    if (resolved.petId === state.activePetId) {
      syncRootMirrorsFromActivePet();
    }
    save();
    notifyListeners();
    return getPetProgress(resolved.petId);
  }

  function getPetProgress(petId) {
    var targetId = normalizeCanonicalPetId(petId) || getActivePetId();
    var rec = ensurePetRecord(targetId);
    syncProgressionAliases(rec.progression);
    var lvl = computeStageLevelInfo(rec.xp, rec.level);
    var evalCheck = evaluateEvolutionCandidate(rec);

    return {
      petId: rec.petId,
      initialized: Boolean(rec.initialized),
      stage: rec.stage,
      level: rec.level,
      xp: rec.xp,
      maxLevel: lvl.maxLevel,
      nextLevelXp: lvl.nextLevelXp,
      progressPct: lvl.progressPct,
      stageBadge: lvl.stageBadge,
      stageNameVi: lvl.stageNameVi,
      stageNameEn: lvl.stageNameEn,
      scaleMultiplier: lvl.scaleMultiplier,
      needs: copyPetNeeds(rec.needs),
      progression: {
        care: rec.progression.care,
        interaction: rec.progression.interaction,
        stageMissions: rec.progression.stageMissions,
        skillUses: rec.progression.skillUses,
        careCount: rec.progression.care,
        interactionCount: rec.progression.interaction,
        stageMissionsDone: rec.progression.stageMissions,
        skillsActivatedCount: rec.progression.skillUses,
        stageCare: rec.progression.stageCare,
        stageInteraction: rec.progression.stageInteraction,
        stageMissionsCurrent: rec.progression.stageMissionsCurrent,
        stageSkillUses: rec.progression.stageSkillUses,
        totalFed: rec.progression.totalFed,
        totalWatered: rec.progression.totalWatered,
        totalPlayed: rec.progression.totalPlayed,
        totalRested: rec.progression.totalRested,
        totalPetted: rec.progression.totalPetted,
        totalTalked: rec.progression.totalTalked,
        totalWalked: rec.progression.totalWalked,
        completedStageMissions: rec.progression.completedStageMissions.slice(),
        usedSkills: rec.progression.usedSkills.slice()
      },
      unlockedSkills: rec.unlockedSkills.slice(),
      missionProgress: normalizeMissionProgress(rec.missionProgress),
      createdAt: rec.createdAt,
      lastSeen: rec.lastSeen,
      evolution: {
        canEvolve: evalCheck.canEvolve,
        from: evalCheck.from,
        to: evalCheck.to,
        missing: evalCheck.missing.slice()
      }
    };
  }

  function resetPetProgress(petId, opts) {
    var normId = normalizeCanonicalPetId(petId);
    if (!normId) {
      return {
        ok: false,
        reset: false,
        reason: "invalid_pet_id",
        petId: String(petId || "")
      };
    }
    if (!opts || typeof opts !== "object" || opts.confirm !== true) {
      return {
        ok: false,
        reset: false,
        reason: "confirm_required",
        petId: normId
      };
    }

    var now = Date.now();
    var isCurrentActive = normId === state.activePetId;
    state.byPetId[normId] = createPetRecord(normId, now, isCurrentActive);
    state.pets = state.byPetId;

    // Also clear per-pet reward ledger if available
    try {
      var rewardsApi =
        (typeof root !== "undefined" && root && root.ELW_PET_REWARDS) ||
        (typeof window !== "undefined" && window && window.ELW_PET_REWARDS) ||
        null;
      if (rewardsApi && typeof rewardsApi.resetPetLedger === "function") {
        rewardsApi.resetPetLedger(normId);
      }
    } catch (e) {}

    if (isCurrentActive) {
      syncRootMirrorsFromActivePet();
    }
    save();
    notifyListeners();

    return {
      ok: true,
      reset: true,
      petId: normId,
      progress: getPetProgress(normId)
    };
  }

  // =========================================================================
  // 7. PUBLIC API METHODS (BACKWARD-COMPATIBLE + MULTI-PET V2)
  // =========================================================================
  function getPet(petId) {
    var norm = normalizeCanonicalPetId(petId);
    if (norm && PETS[norm]) {
      return PETS[norm];
    }
    return null;
  }

  function checkExternalStorageTampering() {
    var storage = getStorage();
    var rawV2 = storage.getItem(STORAGE_KEY_V2);
    var rawV1 = storage.getItem(STORAGE_KEY_V1);

    if (rawV2 && rawV2 !== lastSavedJsonV2) {
      var parsedV2 = safeParseJson(rawV2);
      var extPetV2 = extractCandidatePetId(parsedV2);
      if (extPetV2) {
        var safeV2 = sanitizePetId(extPetV2);
        if (safeV2 !== extPetV2) {
          state.activePetId = safeV2;
          syncRootMirrorsFromActivePet();
          save();
        }
      }
    }

    if (rawV1) {
      var parsedV1 = safeParseJson(rawV1);
      var extPetV1 = extractCandidatePetId(parsedV1);
      if (extPetV1 && !isPetUnlockedAndValid(extPetV1)) {
        state.activePetId = "milu";
        syncRootMirrorsFromActivePet();
        save();
      }
    }
  }

  function getActivePetId() {
    checkExternalStorageTampering();
    var safe = sanitizePetId(state.activePetId);
    if (safe !== state.activePetId) {
      state.activePetId = safe;
      syncRootMirrorsFromActivePet();
      save();
    }
    return state.activePetId;
  }

  function getActivePet() {
    var id = getActivePetId();
    return PETS[id] || PETS.milu;
  }

  function setActivePetId(petId) {
    temporaryStateObj = null;
    var now = Date.now();
    var currentId = sanitizePetId(state.activePetId);

    // 1. Freeze & preserve current active pet's state in byPetId[currentId]
    var currentRec = ensurePetRecord(currentId, now);
    syncActivePetFromRootMirrorsIfEdited();
    currentRec.lastSeen = now;
    if (currentRec.bondStats) {
      currentRec.bondStats.lastInteractedAt = now;
    }

    // 2. Validate target petId (strictly 10 canonical IDs + unlocked check)
    var normTarget = normalizeCanonicalPetId(petId);
    if (!normTarget || !isPetUnlockedAndValid(normTarget)) {
      state.activePetId = "milu";
      var miluRec = ensurePetRecord("milu", now);
      miluRec.initialized = true;
      syncRootMirrorsFromActivePet();
      save();
      notifyListeners();
      return false;
    }

    // 3. First time selecting this pet -> initialize fresh at stage 'baby', level 1, 0 XP
    var targetRec = state.byPetId && state.byPetId[normTarget];
    if (!targetRec || !targetRec.initialized) {
      state.byPetId[normTarget] = createPetRecord(normTarget, now, true);
    } else {
      catchUpPetRecord(targetRec, now);
      targetRec.lastSeen = now;
    }

    // 4. Switch activePetId & update root mirrors without touching old pet's XP/skills
    state.activePetId = normTarget;
    syncRootMirrorsFromActivePet();
    save();
    notifyListeners();
    return true;
  }

  function getNeeds(nowMs) {
    if (Number.isFinite(nowMs)) {
      return catchUp(Number(nowMs));
    }
    return catchUp();
  }

  function setNeeds(partialNeeds, nowMs) {
    var targetNow = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();
    if (Number.isFinite(nowMs)) {
      catchUp(targetNow);
    }
    var activeRec = ensurePetRecord(state.activePetId, targetNow);
    if (partialNeeds && typeof partialNeeds === "object") {
      var keys = ["energy", "hunger", "thirst", "fun", "bond"];
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (partialNeeds[k] !== undefined) {
          activeRec.needs[k] = clampNeed(partialNeeds[k], activeRec.needs[k]);
        }
      }
    }
    activeRec.needs.lastUpdatedAt = targetNow;
    activeRec.lastSeen = targetNow;
    syncRootMirrorsFromActivePet();
    save();
    notifyListeners();
    return copyNeeds();
  }

  function applyNeedDelta(deltas, nowMs) {
    var targetNow = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();
    if (Number.isFinite(nowMs)) {
      catchUp(targetNow);
    } else {
      catchUp();
    }
    var activeRec = ensurePetRecord(state.activePetId, targetNow);
    if (deltas && typeof deltas === "object") {
      var keys = ["energy", "hunger", "thirst", "fun", "bond"];
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (deltas[k] !== undefined) {
          var d = Number(deltas[k]) || 0;
          activeRec.needs[k] = clampNeed(activeRec.needs[k] + d, activeRec.needs[k]);
        }
      }
    }
    activeRec.needs.lastUpdatedAt = targetNow;
    activeRec.lastSeen = targetNow;
    syncRootMirrorsFromActivePet();
    save();
    notifyListeners();
    return copyNeeds();
  }

  function addBond(bondDelta, petId) {
    var delta = Number(bondDelta) || 0;
    var targetId = normalizeCanonicalPetId(petId) || getActivePetId();
    var rec = ensurePetRecord(targetId);
    rec.initialized = true;
    rec.needs.bond = clampNeed(rec.needs.bond + delta, rec.needs.bond);
    rec.lastSeen = Date.now();
    if (targetId === state.activePetId) {
      syncRootMirrorsFromActivePet();
    }
    save();
    notifyListeners();
    return rec.needs.bond;
  }

  function setTemporaryState(stateName, durationMs) {
    if (!stateName || stateName === "clear") {
      temporaryStateObj = null;
      notifyListeners();
      return getVisualState();
    }
    var valid = isValidState(stateName) ? stateName : "idle_happy";
    var dur = Math.max(100, Number(durationMs) || 3500);
    temporaryStateObj = {
      state: valid,
      expiresAt: Date.now() + dur
    };
    notifyListeners();
    return valid;
  }

  function getVisualState(nowMs) {
    var now = Number.isFinite(nowMs) ? Number(nowMs) : Date.now();
    if (temporaryStateObj && temporaryStateObj.state) {
      if (now < temporaryStateObj.expiresAt) {
        return isValidState(temporaryStateObj.state) ? temporaryStateObj.state : "idle_happy";
      }
      temporaryStateObj = null;
    }

    var n = getNeeds(nowMs);

    if (n.energy <= 28) {
      return "tired";
    }
    if (n.energy <= 40) {
      return "sleepy";
    }
    if (n.hunger <= 32 || n.thirst <= 32 || n.fun <= 30) {
      return "sad_lonely";
    }
    if (n.hunger >= 85 && n.thirst >= 85 && n.energy >= 78 && n.fun >= 85 && n.bond >= 70) {
      return "excited";
    }
    if (n.fun >= 82 && n.energy >= 58) {
      return "playful";
    }
    if (n.fun <= 48) {
      return "curious";
    }
    return "idle_happy";
  }

  function getInventory() {
    return {
      treats: Math.max(0, Math.floor(Number(state.inventory.treats) || 0)),
      water: Math.max(0, Math.floor(Number(state.inventory.water) || 0)),
      toys: Math.max(0, Math.floor(Number(state.inventory.toys) || 0))
    };
  }

  function addInventory(deltasOrKey, maybeCount) {
    if (typeof deltasOrKey === "string") {
      var key = deltasOrKey;
      var deltaVal = Math.floor(Number(maybeCount) || 0);
      if (Object.prototype.hasOwnProperty.call(state.inventory, key)) {
        state.inventory[key] = Math.max(0, state.inventory[key] + deltaVal);
      }
    } else if (deltasOrKey && typeof deltasOrKey === "object") {
      var invKeys = ["treats", "water", "toys"];
      for (var i = 0; i < invKeys.length; i++) {
        var k = invKeys[i];
        if (deltasOrKey[k] !== undefined) {
          var d = Math.floor(Number(deltasOrKey[k]) || 0);
          state.inventory[k] = Math.max(0, (Number(state.inventory[k]) || 0) + d);
        }
      }
    }
    save();
    notifyListeners();
    return getInventory();
  }

  function consumeInventory(itemKey, count) {
    var amount = count === undefined ? 1 : Math.max(1, Math.floor(Number(count) || 1));
    if (typeof itemKey !== "string" || !Object.prototype.hasOwnProperty.call(state.inventory, itemKey)) {
      return false;
    }
    var current = Math.max(0, Math.floor(Number(state.inventory[itemKey]) || 0));
    if (current < amount) {
      return false;
    }
    state.inventory[itemKey] = current - amount;
    save();
    notifyListeners();
    return true;
  }

  function getStats(petId) {
    var targetId = normalizeCanonicalPetId(petId) || getActivePetId();
    var rec = ensurePetRecord(targetId);
    var lvl = computeStageLevelInfo(rec.xp, rec.level);
    rec.stageBadge = lvl.stageBadge;
    var streakVal = Math.max(1, Math.floor(Number(state.stats && state.stats.streak) || 1));

    if (targetId === state.activePetId) {
      state.stats.xp = rec.xp;
      state.stats.level = rec.level;
      state.stats.stage = rec.stage;
      state.stats.stageBadge = lvl.stageBadge;
      state.stats.streak = streakVal;
    }

    return {
      xp: rec.xp,
      level: rec.level,
      stage: rec.stage,
      maxLevel: lvl.maxLevel,
      nextLevelXp: lvl.nextLevelXp,
      progressPct: lvl.progressPct,
      scaleMultiplier: lvl.scaleMultiplier,
      stageBadge: lvl.stageBadge,
      stageNameVi: lvl.stageNameVi,
      stageNameEn: lvl.stageNameEn,
      streak: streakVal
    };
  }

  function addXp(xpDelta, petIdOrOpts) {
    var targetId = getActivePetId();
    var delta = 0;

    if (typeof xpDelta === "string" && normalizeCanonicalPetId(xpDelta)) {
      targetId = normalizeCanonicalPetId(xpDelta);
      delta = Math.max(0, Math.floor(Number(petIdOrOpts) || 0));
    } else {
      delta = Math.max(0, Math.floor(Number(xpDelta) || 0));
      if (typeof petIdOrOpts === "string" && normalizeCanonicalPetId(petIdOrOpts)) {
        targetId = normalizeCanonicalPetId(petIdOrOpts);
      } else if (petIdOrOpts && typeof petIdOrOpts === "object" && normalizeCanonicalPetId(petIdOrOpts.petId)) {
        targetId = normalizeCanonicalPetId(petIdOrOpts.petId);
      }
    }

    var rec = ensurePetRecord(targetId);
    rec.initialized = true;
    rec.xp = Math.max(0, (Number(rec.xp) || 0) + delta);
    rec.lastSeen = Date.now();

    // If a previous auto-evolution receipt was already consumed, or XP now targets a higher unfulfilled stage, clear old receipt
    var evalAfterXp = evaluateEvolutionCandidate(rec);
    if (evalAfterXp.canEvolve) {
      applyStageEvolutionToRecord(rec, evalAfterXp, Date.now());
    } else if (
      rec._pendingEvolutionReceipt &&
      (rec._pendingEvolutionReceipt.consumed ||
        (STAGE_REQUIREMENTS[evalAfterXp.to] && rec.xp >= STAGE_REQUIREMENTS[evalAfterXp.to].minXp && evalAfterXp.missing.length > 0))
    ) {
      rec._pendingEvolutionReceipt = null;
    }

    var updatedStats = getStats(targetId);
    if (targetId === state.activePetId) {
      syncRootMirrorsFromActivePet();
    }
    save();
    notifyListeners();
    return updatedStats;
  }

  function applyRewardPayload(payload) {
    if (!payload || typeof payload !== "object") return false;
    var targetId = normalizeCanonicalPetId(payload.petId) || getActivePetId();
    var rec = ensurePetRecord(targetId);
    rec.initialized = true;

    var xp = Math.max(0, Math.floor(Number(payload.xp) || 0));
    var bond = Math.max(0, Math.floor(Number(payload.bond) || 0));
    var treats = Math.max(0, Math.floor(Number(payload.treats) || 0));
    var water = Math.max(0, Math.floor(Number(payload.water) || 0));
    var toys = Math.max(0, Math.floor(Number(payload.toys) || 0));

    if (xp > 0) {
      rec.xp = Math.max(0, (Number(rec.xp) || 0) + xp);
    }
    if (bond > 0) {
      rec.needs.bond = clampNeed(rec.needs.bond + bond, rec.needs.bond);
    }
    if (treats > 0) {
      state.inventory.treats = Math.max(0, (Number(state.inventory.treats) || 0) + treats);
    }
    if (water > 0) {
      state.inventory.water = Math.max(0, (Number(state.inventory.water) || 0) + water);
    }
    if (toys > 0) {
      state.inventory.toys = Math.max(0, (Number(state.inventory.toys) || 0) + toys);
    }

    rec.lastSeen = Date.now();
    tryAutoEvolveRecord(rec);

    if (targetId === state.activePetId) {
      syncRootMirrorsFromActivePet();
    }
    save();
    notifyListeners();
    return true;
  }

  function resetForTest(nowMs) {
    temporaryStateObj = null;
    state = createDefaultState(nowMs);
    save();
    notifyListeners();
    return getSnapshot();
  }

  function buildByPetIdSnapshot() {
    var out = {};
    for (var i = 0; i < PET_IDS.length; i++) {
      var pid = PET_IDS[i];
      out[pid] = getPetProgress(pid);
    }
    return out;
  }

  function getSnapshot() {
    var petId = getActivePetId();
    var vState = getVisualState();
    var activeProgress = getPetProgress(petId);
    var byPetSnap = buildByPetIdSnapshot();
    var statsObj = getStats(petId);
    var needsObj = copyNeeds();

    return {
      schemaVersion: 2,
      activePetId: petId,
      activePet: PETS[petId] || PETS.milu,
      stage: activeProgress.stage,
      level: activeProgress.level,
      xp: activeProgress.xp,
      needs: needsObj,
      visualState: vState,
      stateMeta: getStateMeta(vState),
      assetPath: getAssetPath(petId, vState, activeProgress.stage),
      inventory: getInventory(),
      stats: statsObj,
      progression: activeProgress.progression,
      unlockedSkills: activeProgress.unlockedSkills,
      missionProgress: activeProgress.missionProgress,
      byPetId: byPetSnap,
      pets: byPetSnap
    };
  }

  function getState() {
    var snap = getSnapshot();
    return Object.assign({}, snap, {
      energy: snap.needs.energy,
      hunger: snap.needs.hunger,
      thirst: snap.needs.thirst,
      fun: snap.needs.fun,
      bond: snap.needs.bond,
      moodState: snap.visualState
    });
  }

  function subscribe(eventOrListener, maybeListener) {
    var eventName = "*";
    var fn = null;
    if (typeof eventOrListener === "string" && typeof maybeListener === "function") {
      eventName = eventOrListener.trim();
      fn = maybeListener;
    } else if (typeof eventOrListener === "function") {
      fn = eventOrListener;
    }
    if (!fn) {
      return function () {};
    }
    var entry = { event: eventName, fn: fn };
    listeners.push(entry);
    return function unsubscribe() {
      var idx = listeners.indexOf(entry);
      if (idx !== -1) {
        listeners.splice(idx, 1);
      }
    };
  }

  function notifyListeners(eventName, extraDetail) {
    if (!listeners.length) return;
    var evt = eventName || "change";
    listenerDispatchDepth++;
    try {
      var snap = getSnapshot();
      if (extraDetail && typeof extraDetail === "object") {
        snap = Object.assign({}, snap, extraDetail, { event: evt, type: evt });
      }
      var copy = listeners.slice();
      for (var i = 0; i < copy.length; i++) {
        var entry = copy[i];
        if (!entry || typeof entry.fn !== "function") continue;
        if (entry.event === "*" || entry.event === evt) {
          try {
            entry.fn(snap, evt, extraDetail || snap);
          } catch (e) {
            // Ignore subscriber errors
          }
        }
      }
    } finally {
      listenerDispatchDepth = Math.max(0, listenerDispatchDepth - 1);
    }
  }

  // Initialize from storage on module load
  load();

  function deriveVisualState(customNeeds, tempState) {
    if (tempState && isValidState(tempState)) {
      return tempState;
    }
    var n = customNeeds || getNeeds();
    if (n.energy <= 28) return "tired";
    if (n.energy <= 40) return "sleepy";
    if (n.hunger <= 32 || n.thirst <= 32 || n.fun <= 30) return "sad_lonely";
    if (n.hunger >= 85 && n.thirst >= 85 && n.energy >= 78 && n.fun >= 85 && n.bond >= 70) return "excited";
    if (n.fun >= 82 && n.energy >= 58) return "playful";
    if (n.fun <= 48) return "curious";
    return "idle_happy";
  }

  function applyOfflineDecay(nowMs) {
    load();
    return catchUp(nowMs);
  }

  var API = {
    STORAGE_KEY: STORAGE_KEY_V2,
    BACKUP_STORAGE_KEY: BACKUP_STORAGE_KEY,
    MAX_OFFLINE_DECAY_MS: MAX_OFFLINE_DECAY_MS,
    OFFLINE_FLOOR: OFFLINE_FLOOR,
    DECAY_RATES_PER_HOUR: DECAY_RATES_PER_HOUR,
    PETS: PETS,
    PET_LIST: PET_LIST,
    PET_IDS: PET_IDS,
    STATES: STATES,
    STATE_META: STATE_META,
    STAGES: STAGES,
    LEVEL_THRESHOLDS: LEVEL_THRESHOLDS,
    STAGE_REQUIREMENTS: STAGE_REQUIREMENTS,
    STAGE_SCALE_MULTIPLIERS: STAGE_SCALE_MULTIPLIERS,
    load: load,
    save: save,
    migrateToPerPetSchema: migrateToPerPetSchema,
    catchUp: catchUp,
    applyOfflineDecay: applyOfflineDecay,
    simulateElapsed: simulateElapsed,
    resetForTest: resetForTest,
    resetPetProgress: resetPetProgress,
    getRoster: function () { return PET_LIST.slice(); },
    getAllPets: function () { return PET_LIST.slice(); },
    getPet: getPet,
    getActivePetId: getActivePetId,
    getActivePet: getActivePet,
    setActivePetId: setActivePetId,
    selectPet: setActivePetId,
    isPetUnlocked: isPetUnlockedAndValid,
    getNeeds: getNeeds,
    setNeeds: setNeeds,
    applyNeedDelta: applyNeedDelta,
    addBond: addBond,
    getVisualState: getVisualState,
    deriveVisualState: deriveVisualState,
    setTemporaryState: setTemporaryState,
    getStateMeta: getStateMeta,
    getAssetPath: getAssetPath,
    registerStageAssets: registerStageAssets,
    getInventory: getInventory,
    addInventory: addInventory,
    addInventoryItem: addInventory,
    addItems: addInventory,
    consumeInventory: consumeInventory,
    getStats: getStats,
    addXp: addXp,
    applyRewardPayload: applyRewardPayload,
    getState: getState,
    getSnapshot: getSnapshot,
    getPetProgress: getPetProgress,
    recordCareAction: recordCareAction,
    recordInteraction: recordInteraction,
    recordSkillUse: recordSkillUse,
    recordStageMission: recordStageMission,
    checkStageEvolution: checkStageEvolution,
    subscribe: subscribe,
    get state() {
      return getState();
    }
  };

  if (typeof window !== "undefined") {
    window.ELW_PET_NEEDS = API;
  }
  if (typeof globalThis !== "undefined") {
    globalThis.ELW_PET_NEEDS = API;
  }
  if (typeof root !== "undefined" && root) {
    root.ELW_PET_NEEDS = API;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = API;
  }
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
