/* English Life World — modules/pet-interaction.js
   Agent A4: Pet Interaction & Animation Engine (8 Mandatory Interactions,
   10-State CSS Animation System with prefers-reduced-motion & Fallback Sprite/SVG,
   Home Scene #o-cat / #pet-home-avatar Quick Bar Integration & Unified Adventure Bridge).
   Exposes: window.ELW_PET_INTERACTION and CommonJS module.exports */
(function (root, factory) {
  "use strict";
  const api = factory(root);
  if (typeof window !== "undefined") {
    window.ELW_PET_INTERACTION = api;
  }
  if (root && typeof root === "object") {
    root.ELW_PET_INTERACTION = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : this), function (root) {
  "use strict";

  const STYLE_ID = "elw-pet-interaction-css";
  const QUICK_BAR_ID = "petSceneQuickBar";
  const FALLBACK_STATE = "idle_happy";
  const DEFAULT_TEMP_DURATION_MS = 4500;

  /* ---------- 10 Canonical States & 10 Animation Types ---------- */
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

  const STATE_ANIMATION_MAP = Object.freeze({
    idle_happy:        { state: "idle_happy",        animation: "breathe_bob",  alias: "breathe_soft",   fallbackState: "idle_happy", labelVi: "Vui vẻ" },
    curious:           { state: "curious",           animation: "curious_tilt", alias: "head_tilt",      fallbackState: "idle_happy", labelVi: "Tò mò lắng nghe" },
    playful:           { state: "playful",           animation: "play_bounce",  alias: "bounce_play",    fallbackState: "idle_happy", labelVi: "Hào hứng chơi đùa" },
    eating:            { state: "eating",            animation: "eat_nod",      alias: "munch_bob",      fallbackState: "idle_happy", labelVi: "Đang măm măm" },
    drinking:          { state: "drinking",          animation: "drink_lap",    alias: "sip_pulse",      fallbackState: "idle_happy", labelVi: "Đang uống nước" },
    sleepy:            { state: "sleepy",            animation: "sleep_float",  alias: "sleep_float",    fallbackState: "idle_happy", labelVi: "Ngủ ngon lành" },
    tired:             { state: "tired",             animation: "tired_droop",  alias: "slow_sway",      fallbackState: "idle_happy", labelVi: "Hơi thấm mệt" },
    sad_lonely:        { state: "sad_lonely",        animation: "sad_sway",     alias: "gentle_shiver",  fallbackState: "idle_happy", labelVi: "Mong bạn chơi cùng" },
    excited:           { state: "excited",           animation: "excited_jump", alias: "jump_celebrate", fallbackState: "idle_happy", labelVi: "Phấn khích tột độ" },
    walking_adventure: { state: "walking_adventure", animation: "walk_trot",    alias: "walk_trot",      fallbackState: "idle_happy", labelVi: "Đang đi phiêu lưu" }
  });

  const ANIMATION_TYPES = Object.freeze([
    "breathe_bob",
    "curious_tilt",
    "play_bounce",
    "eat_nod",
    "drink_lap",
    "sleep_float",
    "tired_droop",
    "sad_sway",
    "excited_jump",
    "walk_trot"
  ]);

  /* ---------- Fallback Roster for the 10 Canonical Pets ---------- */
  const FALLBACK_PETS = Object.freeze({
    milu:   { id: "milu",   petId: "milu",   name: "Milu",   speciesVi: "Cún Vàng",             group: "dog",  tier: "free",    icon: "🐕", sound: "Woof! Woof!",   color: "#f59e0b" },
    boba:   { id: "boba",   petId: "boba",   name: "Boba",   speciesVi: "Cún Corgi Trà Sữa",    group: "dog",  tier: "premium", icon: "🐶", sound: "Arf! Arf!",     color: "#d97706" },
    cookie: { id: "cookie", petId: "cookie", name: "Cookie", speciesVi: "Cún Shiba Bánh Quy",   group: "dog",  tier: "premium", icon: "🐕", sound: "Woof~ Yip!",    color: "#ea580c" },
    mochi:  { id: "mochi",  petId: "mochi",  name: "Mochi",  speciesVi: "Mèo Trắng Kem",        group: "cat",  tier: "free",    icon: "🐱", sound: "Meow~ Purr!",   color: "#ec4899" },
    pepper: { id: "pepper", petId: "pepper", name: "Pepper", speciesVi: "Mèo Anh Lông Ngắn",    group: "cat",  tier: "premium", icon: "🐈", sound: "Purr~ Meow!",   color: "#64748b" },
    oreo:   { id: "oreo",   petId: "oreo",   name: "Oreo",   speciesVi: "Mèo Tuxedo Lịch Lãm",  group: "cat",  tier: "premium", icon: "🐈‍⬛", sound: "Mew! Purr~",    color: "#334155" },
    ember:  { id: "ember",  petId: "ember",  name: "Ember",  speciesVi: "Rồng Nhỏ Ấm Áp",       group: "rare", tier: "premium", icon: "🐉", sound: "Roar-squeak!",  color: "#ef4444" },
    lumi:   { id: "lumi",   petId: "lumi",   name: "Lumi",   speciesVi: "Kỳ Lân Ánh Sao",       group: "rare", tier: "premium", icon: "🦄", sound: "Sparkle~ Neigh!", color: "#a855f7" },
    pip:    { id: "pip",    petId: "pip",    name: "Pip",    speciesVi: "Cáo Tuyết Bắc Cực",    group: "rare", tier: "premium", icon: "🦊", sound: "Yip! Yip!",     color: "#0ea5e9" },
    aqua:   { id: "aqua",   petId: "aqua",   name: "Aqua",   speciesVi: "Rái Cá Biển Xanh",     group: "rare", tier: "premium", icon: "🦦", sound: "Chirp-splash!", color: "#14b8a6" }
  });

  /* ---------- 8 Mandatory Interactions (Exact A4 Specification) ---------- */
  const INTERACTIONS_LIST = [
    {
      id: "pet",
      actionId: "pet",
      labelVi: "Vuốt ve",
      labelEn: "Pet & Cuddle",
      icon: "🤗",
      targetState: "excited",
      needsDelta: Object.freeze({ fun: 14, bond: 8, energy: 2 }),
      xp: 8
    },
    {
      id: "play",
      actionId: "play",
      labelVi: "Chơi",
      labelEn: "Play Together",
      icon: "🎾",
      targetState: "playful",
      needsDelta: Object.freeze({ fun: 22, bond: 10, energy: -5, hunger: -3, thirst: -4 }),
      xp: 12
    },
    {
      id: "feed",
      actionId: "feed",
      labelVi: "Cho ăn",
      labelEn: "Feed Treat",
      icon: "🍖",
      targetState: "eating",
      needsDelta: Object.freeze({ hunger: 28, energy: 10, fun: 6, bond: 6 }),
      xp: 10
    },
    {
      id: "water",
      actionId: "water",
      labelVi: "Cho uống",
      labelEn: "Give Water",
      icon: "💧",
      targetState: "drinking",
      needsDelta: Object.freeze({ thirst: 30, energy: 8, bond: 5 }),
      xp: 8
    },
    {
      id: "rest",
      actionId: "rest",
      labelVi: "Nghỉ",
      labelEn: "Rest & Nap",
      icon: "😴",
      targetState: "sleepy",
      needsDelta: Object.freeze({ energy: 32, fun: 6, bond: 4 }),
      xp: 8
    },
    {
      id: "talk",
      actionId: "talk",
      labelVi: "Nói chuyện",
      labelEn: "Talk in English",
      icon: "🗣️",
      targetState: "curious",
      needsDelta: Object.freeze({ bond: 12, fun: 12 }),
      xp: 12
    },
    {
      id: "walk",
      actionId: "walk",
      labelVi: "Dẫn đi chơi",
      labelEn: "Take for a Walk",
      icon: "🦮",
      targetState: "walking_adventure",
      needsDelta: Object.freeze({ fun: 15, bond: 10, energy: -3 }),
      xp: 15
    },
    {
      id: "profile",
      actionId: "profile",
      labelVi: "Hồ sơ",
      labelEn: "Pet Profile",
      icon: "📋",
      targetState: "idle_happy",
      needsDelta: Object.freeze({ bond: 2 }),
      xp: 2
    }
  ];

  const INTERACTIONS_BY_ID = {};
  INTERACTIONS_LIST.forEach(function (item) {
    Object.freeze(item);
    INTERACTIONS_BY_ID[item.id] = item;
    // Allow both array indexing INTERACTIONS[0] and property access INTERACTIONS.pet
    Object.defineProperty(INTERACTIONS_LIST, item.id, {
      value: item,
      writable: false,
      enumerable: false,
      configurable: false
    });
  });
  Object.freeze(INTERACTIONS_BY_ID);
  const INTERACTIONS = Object.freeze(INTERACTIONS_LIST);

  /* ---------- Bilingual Dialogue Templates per Interaction ---------- */
  const DIALOGUE_BANK = Object.freeze({
    pet: [
      {
        playerEn: "Good job, {name}! You are such a sweet and loyal friend!",
        playerVi: "Giỏi lắm {name}! Cậu đúng là một người bạn đáng yêu và trung thành!",
        petReplyEn: "{sound} I love warm cuddles with you! Let's keep learning English!",
        petReplyVi: "{sound} Mình thích được bạn vuốt ve lắm! Cùng học tiếng Anh tiếp nhé!"
      },
      {
        playerEn: "Come here, {name}! Let me give you a gentle pat on the head.",
        playerVi: "Lại đây nào {name}! Để mình xoa đầu cậu thật êm nhé.",
        petReplyEn: "{sound} *wags happily* Your kindness makes my heart so warm!",
        petReplyVi: "{sound} *vẫy đuôi mừng rỡ* Sự dịu dàng của bạn làm mình ấm áp quá!"
      }
    ],
    play: [
      {
        playerEn: "Catch the ball, {name}! Let's play together and have some fun!",
        playerVi: "Bắt lấy bóng nào {name}! Cùng chơi đùa thật vui nhé!",
        petReplyEn: "{sound} *bounces joyfully* Playing fetch with you is the best part of my day!",
        petReplyVi: "{sound} *nhún nhảy vui sướng* Chơi ném bóng cùng bạn là lúc vui nhất trong ngày!"
      },
      {
        playerEn: "Ready, set, go, {name}! Jump and catch the toy!",
        playerVi: "Chuẩn bị, sẵn sàng, chạy nào {name}! Nhảy lên bắt đồ chơi nhé!",
        petReplyEn: "{sound} Look how high I can jump! Let's play one more round!",
        petReplyVi: "{sound} Nhìn mình nhảy cao chưa này! Chơi thêm một hiệp nữa đi!"
      }
    ],
    feed: [
      {
        playerEn: "Here is a delicious, nutritious meal for you, {name}! Eat up!",
        playerVi: "Bữa ăn thơm ngon và bổ dưỡng cho {name} đây! Ăn ngon miệng nhé!",
        petReplyEn: "{sound} *munch, munch* Yummy! Thank you for feeding me, I feel full and energized!",
        petReplyVi: "{sound} *măm măm* Ngon tuyệt! Cảm ơn bạn đã cho mình ăn, mình no bụng và khỏe hẳn lên!"
      },
      {
        playerEn: "Time for a tasty snack, {name}! You earned this treat today!",
        playerVi: "Đến giờ ăn bánh thưởng ngon lành rồi {name} ơi! Hôm nay cậu xứng đáng lắm!",
        petReplyEn: "{sound} Crunch, crunch! That was delicious! Now I'm ready to study with you!",
        petReplyVi: "{sound} Giòn rụm thơm ngon quá! Giờ mình đã sẵn sàng học bài cùng bạn rồi!"
      }
    ],
    water: [
      {
        playerEn: "Here is some cool, fresh water for you, {name}. Stay hydrated!",
        playerVi: "Nước mát lành cho {name} đây. Uống nước để luôn khỏe khoắn nhé!",
        petReplyEn: "{sound} *slurp, slurp* Ahh, so refreshing! Thank you for taking care of me!",
        petReplyVi: "{sound} *chẹp chẹp* A, mát sảng khoái quá! Cảm ơn bạn đã chăm sóc mình chu đáo!"
      },
      {
        playerEn: "Drink some clean water, {name}, especially after playing!",
        playerVi: "Uống chút nước sạch đi {name}, nhất là sau khi vận động nhé!",
        petReplyEn: "{sound} Fresh water tastes wonderful! My thirst is all gone!",
        petReplyVi: "{sound} Nước mát ngon quá! Mình hết khát hoàn toàn rồi!"
      }
    ],
    rest: [
      {
        playerEn: "Take a cozy nap on your soft cushion, {name}. Rest well!",
        playerVi: "Nằm nghỉ một giấc êm ái trên đệm mềm đi {name}. Ngủ ngon nhé!",
        petReplyEn: "{sound} *yawns softly* Zzz... Resting beside you while you read is so peaceful...",
        petReplyVi: "{sound} *ngáp nhẹ* Khò khò... Nằm nghỉ bên cạnh nghe bạn đọc bài thật bình yên..."
      },
      {
        playerEn: "Close your eyes and recharge your energy, sweet {name}.",
        playerVi: "Nhắm mắt lại và nạp đầy năng lượng nhé {name} ngoan.",
        petReplyEn: "{sound} *curls up warmly* A short nap gives me full power for our next adventure!",
        petReplyVi: "{sound} *cuộn tròn ấm áp* Một giấc nghỉ ngắn giúp mình tràn đầy sức lực cho chuyến đi tiếp theo!"
      }
    ],
    talk: [
      {
        playerEn: "Hey {name}, let's practice speaking English together today! Can you listen to me?",
        playerVi: "Này {name} ơi, hôm nay mình cùng luyện nói tiếng Anh nhé! Cậu lắng nghe mình nha?",
        petReplyEn: "{sound} *tilts head curiously* My ears are wide open! I love your clear English voice!",
        petReplyVi: "{sound} *nghiêng đầu chăm chú* Đôi tai mình đang lắng nghe đây! Mình rất thích giọng đọc tiếng Anh rõ ràng của bạn!"
      },
      {
        playerEn: "{name}, what is your favorite thing to do when we go outside?",
        playerVi: "{name} ơi, cậu thích làm gì nhất mỗi khi chúng mình ra ngoài đi dạo?",
        petReplyEn: "{sound} I love walking to the park, meeting friendly people, and learning new English phrases with you!",
        petReplyVi: "{sound} Mình thích đi dạo ra công viên, gặp gỡ mọi người và học thêm nhiều câu tiếng Anh mới cùng bạn!"
      },
      {
        playerEn: "Every day I practice a few English sentences with you, {name}!",
        playerVi: "Mỗi ngày mình đều luyện tập vài câu tiếng Anh cùng cậu đấy, {name} ạ!",
        petReplyEn: "{sound} Step by step, you are getting more confident every single day! Proud of you!",
        petReplyVi: "{sound} Từng bước một, bạn đang tự tin hơn mỗi ngày đấy! Mình tự hào về bạn lắm!"
      }
    ],
    walk: [
      {
        playerEn: "Come on, {name}! Let's go for a walk and start our Pet Adventure Quest!",
        playerVi: "Đi thôi nào {name}! Cùng ra ngoài đi dạo và bắt đầu chuyến phiêu lưu Pet Adventure nhé!",
        petReplyEn: "{sound} *trots excitedly* Yay! Adventure time! Let's explore and practice English together!",
        petReplyVi: "{sound} *bước đi đầy hào hứng* Tuyệt quá! Đến giờ phiêu lưu rồi! Cùng khám phá và luyện tiếng Anh thôi!"
      }
    ],
    profile: [
      {
        playerEn: "Let's check your pet profile and our friendship album, {name}!",
        playerVi: "Cùng xem hồ sơ thú cưng và sổ tay tình bạn của chúng mình nào {name}!",
        petReplyEn: "{sound} Look how strong our bond has grown! Thank you for being my best friend!",
        petReplyVi: "{sound} Nhìn xem tình bạn của chúng mình đã gắn kết biết bao! Cảm ơn bạn vì luôn là bạn thân nhất của mình!"
      }
    ]
  });

  /* ---------- Internal Runtime State ---------- */
  let localTempState = null;
  let localTempTimer = null;
  let talkRotationIdx = 0;
  let lastInteractionResult = null;
  let walkSyncGuard = false;
  let domHooked = false;
  let panelObserver = null;
  const listeners = [];

  /* ---------- Helper Utilities ---------- */
  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c;
    });
  }

  function normalizePetId(petId) {
    const raw = String(petId || "milu").trim().toLowerCase();
    if (raw === "milo") return "milu";
    if (raw === "leo") return "pip";
    return FALLBACK_PETS[raw] ? raw : "milu";
  }

  function normalizeState(state) {
    const raw = String(state || "").trim().toLowerCase();
    return STATE_ANIMATION_MAP[raw] ? raw : FALLBACK_STATE;
  }

  function getAnimationForState(state) {
    const valid = normalizeState(state);
    return STATE_ANIMATION_MAP[valid] || STATE_ANIMATION_MAP[FALLBACK_STATE];
  }

  /* ---------- Reduced Motion Check ---------- */
  function isReducedMotion() {
    try {
      const win = (root && root.window) || (typeof window !== "undefined" ? window : root);
      if (win && typeof win.matchMedia === "function") {
        const mql = win.matchMedia("(prefers-reduced-motion: reduce)");
        if (mql && mql.matches) return true;
      }
      const doc = (win && win.document) || (typeof document !== "undefined" ? document : null);
      if (doc) {
        if (doc.body && doc.body.classList && doc.body.classList.contains("reduced-motion")) {
          return true;
        }
        if (doc.documentElement && doc.documentElement.classList && doc.documentElement.classList.contains("reduced-motion")) {
          return true;
        }
      }
      if (win && win.reduceMotion === true) return true;
    } catch (e) {}
    return false;
  }

  /* ---------- CSS Keyframes for 10 Animations + Reduced Motion ---------- */
  const ANIMATION_CSS = `
/* =====================================================================
   ELW_PET_INTERACTION — 10-State Pet Sprite Animations & Scene QuickBar
   ===================================================================== */
.pet-sprite-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--pet-sprite-size, 76px);
  height: var(--pet-sprite-size, 76px);
  user-select: none;
  flex-shrink: 0;
}
.pet-sprite-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transform-origin: 50% 85%;
  will-change: transform;
  filter: drop-shadow(0 6px 12px rgba(15, 23, 42, 0.14));
}
.pet-sprite-svg-fallback {
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}
.pet-sprite-svg-fallback svg {
  width: 88%;
  height: 88%;
  overflow: visible;
}

/* 1. breathe_bob (idle_happy) */
@keyframes breathe_bob {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  50% { transform: translateY(-3px) scale(1.02, 0.985); }
}
.pet-anim-breathe_bob, .pet-anim-breathe_soft {
  animation: breathe_bob 2.8s ease-in-out infinite;
}

/* 2. curious_tilt (curious) */
@keyframes curious_tilt {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  30% { transform: rotate(-7deg) translateY(-2px); }
  70% { transform: rotate(6deg) translateY(-1px); }
}
.pet-anim-curious_tilt, .pet-anim-head_tilt {
  animation: curious_tilt 2.2s ease-in-out infinite;
}

/* 3. play_bounce (playful) */
@keyframes play_bounce {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  25% { transform: translateY(-9px) scale(0.97, 1.04) rotate(-3deg); }
  50% { transform: translateY(0) scale(1.05, 0.95); }
  75% { transform: translateY(-6px) scale(0.98, 1.03) rotate(3deg); }
}
.pet-anim-play_bounce, .pet-anim-bounce_play {
  animation: play_bounce 1.05s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}

/* 4. eat_nod (eating) */
@keyframes eat_nod {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  35% { transform: translateY(3px) rotate(5deg) scale(1.03, 0.96); }
  70% { transform: translateY(-1px) rotate(-2deg) scale(0.99, 1.02); }
}
.pet-anim-eat_nod, .pet-anim-munch_bob {
  animation: eat_nod 0.85s ease-in-out infinite;
}

/* 5. drink_lap (drinking) */
@keyframes drink_lap {
  0%, 100% { transform: translateY(0) scale(1); }
  40% { transform: translateY(2.5px) scale(1.02, 0.97); }
  80% { transform: translateY(-1.5px) scale(0.99, 1.02); }
}
.pet-anim-drink_lap, .pet-anim-sip_pulse {
  animation: drink_lap 0.95s ease-in-out infinite;
}

/* 6. sleep_float (sleepy) */
@keyframes sleep_float {
  0%, 100% { transform: translateY(1px) scale(1, 0.98); opacity: 0.96; }
  50% { transform: translateY(-2.5px) scale(1.025, 1.01); opacity: 1; }
}
.pet-anim-sleep_float {
  animation: sleep_float 3.4s ease-in-out infinite;
}

/* 7. tired_droop (tired) */
@keyframes tired_droop {
  0%, 100% { transform: translateY(2px) scale(1, 0.97); }
  50% { transform: translateY(4px) scale(1.015, 0.955); }
}
.pet-anim-tired_droop, .pet-anim-slow_sway {
  animation: tired_droop 3.0s ease-in-out infinite;
}

/* 8. sad_sway (sad_lonely) */
@keyframes sad_sway {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  33% { transform: translateX(-2px) rotate(-2.5deg); }
  66% { transform: translateX(2px) rotate(2.5deg); }
}
.pet-anim-sad_sway, .pet-anim-gentle_shiver {
  animation: sad_sway 2.9s ease-in-out infinite;
}

/* 9. excited_jump (excited) */
@keyframes excited_jump {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  20% { transform: translateY(2px) scale(1.06, 0.93); }
  45% { transform: translateY(-12px) scale(0.96, 1.06) rotate(-4deg); }
  70% { transform: translateY(-5px) scale(1.02, 0.99) rotate(4deg); }
}
.pet-anim-excited_jump, .pet-anim-jump_celebrate {
  animation: excited_jump 0.95s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}

/* 10. walk_trot (walking_adventure) */
@keyframes walk_trot {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(-3deg); }
  50% { transform: translateY(0) rotate(0deg); }
  75% { transform: translateY(-5px) rotate(3deg); }
}
.pet-anim-walk_trot {
  animation: walk_trot 0.78s ease-in-out infinite;
}

/* Respect prefers-reduced-motion & .reduced-motion class */
@media (prefers-reduced-motion: reduce) {
  .pet-sprite-wrap,
  .pet-sprite-img,
  .pet-anim-breathe_bob,
  .pet-anim-breathe_soft,
  .pet-anim-curious_tilt,
  .pet-anim-head_tilt,
  .pet-anim-play_bounce,
  .pet-anim-bounce_play,
  .pet-anim-eat_nod,
  .pet-anim-munch_bob,
  .pet-anim-drink_lap,
  .pet-anim-sip_pulse,
  .pet-anim-sleep_float,
  .pet-anim-tired_droop,
  .pet-anim-slow_sway,
  .pet-anim-sad_sway,
  .pet-anim-gentle_shiver,
  .pet-anim-excited_jump,
  .pet-anim-jump_celebrate,
  .pet-anim-walk_trot {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
body.reduced-motion .pet-sprite-wrap,
body.reduced-motion .pet-sprite-img,
.is-reduced-motion .pet-sprite-img,
.is-reduced-motion {
  animation: none !important;
  transition: none !important;
  transform: none !important;
}

/* Scene QuickBar (#petSceneQuickBar) inside #panel */
#petSceneQuickBar {
  background: linear-gradient(145deg, #fffdf7 0%, #fef3c7 100%);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 11px 12px;
  margin-bottom: 12px;
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.14);
  color: #1e293b;
}
.psqb-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.psqb-info {
  flex: 1;
  min-width: 0;
}
.psqb-title {
  font-size: 14px;
  font-weight: 800;
  color: #78350f;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.psqb-state-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #fcd34d;
  color: #b45309;
}
.psqb-needs-mini {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
}
.psqb-need-pill {
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 1px 6px;
}
.psqb-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}
@media (max-width: 520px) {
  .psqb-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.psqb-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 7px 6px;
  border-radius: 11px;
  border: 1.5px solid #fcd34d;
  background: #ffffff;
  color: #78350f;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  text-align: center;
}
.psqb-btn:hover {
  background: #fffbeb;
  border-color: #f59e0b;
  box-shadow: 0 3px 8px rgba(245, 158, 11, 0.18);
}
.psqb-btn[data-pet-action="walk"] {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
  color: #065f46;
}
.psqb-btn .psqb-ico {
  font-size: 17px;
  line-height: 1.1;
}
.psqb-btn .psqb-vi {
  font-size: 11.5px;
  font-weight: 800;
  line-height: 1.15;
}
.psqb-btn .psqb-en {
  font-size: 9.5px;
  font-weight: 600;
  color: #64748b;
  line-height: 1.1;
}
.psqb-feedback {
  margin-top: 8px;
  padding: 6px 9px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px dashed #f59e0b;
  font-size: 12px;
  line-height: 1.35;
  color: #1e293b;
}
.psqb-feedback small {
  display: block;
  color: #64748b;
  margin-top: 2px;
}

/* Single Companion Pet in #room (#o-cat): hide legacy orange cat SVG vectors & legacy NPC dog */
#room #o-cat #catBody,
#room #o-cat #catCurl,
#room #ctx-dog,
#room .npc.np-k-dog,
#room .npc[data-npc="dog"] {
  display: none !important;
}
#room #o-cat #roomPetImg {
  width: 76px !important;
  height: 76px !important;
  pointer-events: all;
  cursor: pointer;
}

/* Suppress legacy static floor cat need bubbles in g.nd-layer (needs.js) & hide nd-layer outside home rooms */
#room g.nd-layer[data-room-hidden="1"],
#room g.nd-layer [data-nd="catHunger"],
#room g.nd-layer [data-nd="catThirst"],
#room g.nd-layer [data-nd="mood"],
#room g.nd-layer [data-nd="catBowlDirty"] {
  display: none !important;
}

/* Dynamic Pet Need Cluster (#petNeedCluster) mounted above pet head */
#room #o-cat #petNeedCluster {
  pointer-events: none;
  transition: opacity 0.18s ease;
}
#room #o-cat #petNeedCluster[hidden],
#room #o-cat #petNeedCluster[data-low-count="0"] {
  display: none !important;
}
#room #o-cat #petNeedCluster .pet-need-badge circle {
  fill: rgba(255, 253, 245, 0.96);
  stroke: #f59e0b;
  stroke-width: 1.6px;
  filter: drop-shadow(0 2px 4px rgba(15, 23, 42, 0.18));
}
#room #o-cat #petNeedCluster .pet-need-badge[data-urgent="1"] circle {
  stroke: #ef4444;
  fill: rgba(254, 242, 242, 0.97);
}
#room #o-cat #petNeedCluster .pet-need-badge text {
  font-size: 11px;
  text-anchor: middle;
  dominant-baseline: central;
  user-select: none;
}
`;

  function resolvePetAsset(relPath) {
    const p = String(relPath || "").replace(/^\.\//, "");
    try {
      const win = (root && root.window) || (typeof window !== "undefined" ? window : root);
      if (win && typeof win.resolvePetAsset === "function") {
        return win.resolvePetAsset(p);
      }
      if (win && win.ELW_PET_ASSETS && win.ELW_PET_ASSETS[p]) {
        return win.ELW_PET_ASSETS[p];
      }
    } catch (e) {}
    return p;
  }

  function injectAnimationCss() {
    try {
      const doc = (root && root.document) || (typeof document !== "undefined" ? document : null);
      if (!doc || !doc.head) return false;
      let styleEl = doc.getElementById(STYLE_ID);
      if (!styleEl) {
        styleEl = doc.createElement("style");
        styleEl.id = STYLE_ID;
        styleEl.textContent = ANIMATION_CSS;
        doc.head.appendChild(styleEl);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- Inline SVG Vector Fallback Generator ---------- */
  function buildSvgFallback(petId, state) {
    const id = normalizePetId(petId);
    const meta = FALLBACK_PETS[id] || FALLBACK_PETS.milu;
    const primary = meta.color || "#f59e0b";
    const isCat = meta.group === "cat";
    const earsSvg = isCat
      ? `<polygon points="16,24 22,8 30,20" fill="${primary}"/><polygon points="48,24 42,8 34,20" fill="${primary}"/>`
      : `<ellipse cx="16" cy="24" rx="6" ry="10" fill="${primary}" transform="rotate(-18 16 24)"/><ellipse cx="48" cy="24" rx="6" ry="10" fill="${primary}" transform="rotate(18 48 24)"/>`;
    const eyesSvg = state === "sleepy" || state === "tired"
      ? `<path d="M22 30 Q25 33 28 30" stroke="#1e293b" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M36 30 Q39 33 42 30" stroke="#1e293b" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
      : `<circle cx="25" cy="29" r="3" fill="#1e293b"/><circle cx="39" cy="29" r="3" fill="#1e293b"/><circle cx="26" cy="28" r="1" fill="#ffffff"/><circle cx="40" cy="28" r="1" fill="#ffffff"/>`;

    return (
      `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(meta.name)}">` +
      `<ellipse cx="32" cy="56" rx="18" ry="4" fill="rgba(15,23,42,0.14)"/>` +
      `<ellipse cx="32" cy="43" rx="14" ry="11" fill="${primary}"/>` +
      earsSvg +
      `<circle cx="32" cy="30" r="14" fill="${primary}"/>` +
      `<ellipse cx="32" cy="34" rx="7" ry="5" fill="#fff7ed"/>` +
      eyesSvg +
      `<ellipse cx="32" cy="32" rx="2.2" ry="1.6" fill="#e11d48"/>` +
      `<path d="M29 36 Q32 39 35 36" stroke="#1e293b" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
      `</svg>`
    );
  }

  /* ---------- Sprite Error Handler & Renderer ---------- */
  function handleSpriteError(imgEl) {
    if (!imgEl) return;
    try {
      const rawPetId =
        imgEl.getAttribute("data-pet-id") ||
        imgEl.getAttribute("data-pet-sprite-id") ||
        (imgEl.closest && imgEl.closest("[data-pet-id]") && imgEl.closest("[data-pet-id]").getAttribute("data-pet-id")) ||
        "milu";
      const petId = normalizePetId(rawPetId);
      const fallbackState = normalizeState(imgEl.getAttribute("data-fallback-state") || FALLBACK_STATE);
      const fallbackSrc = resolvePetAsset(`assets/pets/${petId}/${fallbackState}.png`);
      const currentSrc = String(imgEl.getAttribute("src") || imgEl.src || "");
      const alreadyAtFallback =
        imgEl.hasAttribute("data-fallback-applied") ||
        new RegExp(`/${fallbackState}\\.png(?:;base64,|$)`).test(currentSrc);

      if (!alreadyAtFallback) {
        imgEl.dataset.triedFallback = "1";
        imgEl.dataset.fallbackApplied = "1";
        imgEl.setAttribute("data-fallback-applied", "1");
        imgEl.dataset.state = fallbackState;
        imgEl.src = fallbackSrc;
        return;
      }

      // Second failure or already at idle_happy: hide broken img and show inline SVG fallback
      imgEl.dataset.fallbackActive = "svg";
      imgEl.style.display = "none";
      const nextEl = imgEl.nextElementSibling;
      if (nextEl && nextEl.classList && nextEl.classList.contains("pet-sprite-svg-fallback")) {
        nextEl.style.display = "inline-flex";
      } else if (imgEl.parentNode) {
        const span = imgEl.ownerDocument.createElement("span");
        span.className = "pet-sprite-svg-fallback";
        span.style.display = "inline-flex";
        span.innerHTML = buildSvgFallback(petId, fallbackState);
        imgEl.parentNode.appendChild(span);
      }
    } catch (e) {}
  }

  function renderPetSprite(petId, state, options) {
    injectAnimationCss();
    const opts = options && typeof options === "object" ? options : {};
    const safePetId = normalizePetId(petId || getActivePet().id);
    const validState = normalizeState(state || getCurrentVisualState());
    const animInfo = getAnimationForState(validState);
    const fallbackState = animInfo.fallbackState || FALLBACK_STATE;
    const reduced = opts.reducedMotion !== undefined ? Boolean(opts.reducedMotion) : isReducedMotion();
    const animClass = reduced
      ? "is-reduced-motion"
      : `pet-anim-${animInfo.animation} pet-anim-${animInfo.alias}`;
    const sizePx = Math.max(28, Number(opts.size) || 72);
    const petMeta = getPetMetadata(safePetId);
    const srcPath = resolvePetAsset(`assets/pets/${safePetId}/${validState}.png`);
    const fallbackPath = resolvePetAsset(`assets/pets/${safePetId}/${fallbackState}.png`);
    const extraClass = opts.className ? " " + esc(opts.className) : "";
    const extraImgClass = opts.imgClass ? " " + esc(opts.imgClass) : "";
    const imgIdAttr = opts.imgId ? ` id="${esc(opts.imgId)}"` : "";

    const onerrorAttr =
      `if(window.ELW_PET_INTERACTION&&window.ELW_PET_INTERACTION.handleSpriteError){window.ELW_PET_INTERACTION.handleSpriteError(this);}` +
      `else if(!this.hasAttribute('data-fallback-applied')){this.dataset.triedFallback='1';this.dataset.fallbackApplied='1';this.setAttribute('data-fallback-applied','1');this.src='${fallbackPath}';}` +
      `else{this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';}`;

    const html =
      `<div class="pet-sprite-wrap pet-sprite-stage ${animClass}${extraClass}" style="--pet-sprite-size:${sizePx}px" ` +
      `data-pet-id="${esc(safePetId)}" data-state="${esc(validState)}" data-fallback-state="${esc(fallbackState)}" ` +
      `data-animation="${esc(animInfo.animation)}" data-reduced-motion="${reduced ? "true" : "false"}">` +
      `<img${imgIdAttr} class="pet-sprite-img ${animClass}${extraImgClass}" src="${esc(srcPath)}" ` +
      `alt="${esc(petMeta.name)} - ${esc(animInfo.labelVi)}" ` +
      `data-pet-id="${esc(safePetId)}" data-state="${esc(validState)}" ` +
      `data-fallback-state="${esc(fallbackState)}" data-animation="${esc(animInfo.animation)}" ` +
      `onerror="${onerrorAttr}" />` +
      `<span class="pet-sprite-svg-fallback" style="display:none" aria-hidden="true">${buildSvgFallback(safePetId, validState)}</span>` +
      `</div>`;

    if (opts.container && typeof opts.container === "object" && "innerHTML" in opts.container) {
      opts.container.innerHTML = html;
    }
    return html;
  }

  /* ---------- Bridge to ELW_PET_NEEDS ---------- */
  function getNeedsEngine() {
    return (
      (root && root.ELW_PET_NEEDS) ||
      (typeof window !== "undefined" ? window.ELW_PET_NEEDS : null) ||
      null
    );
  }

  function getPetMetadata(petId) {
    const id = normalizePetId(petId);
    const needsApi = getNeedsEngine();
    if (needsApi) {
      try {
        if (typeof needsApi.getPetById === "function") {
          const p = needsApi.getPetById(id);
          if (p && typeof p === "object") return Object.assign({}, FALLBACK_PETS[id] || FALLBACK_PETS.milu, p, { id: id, petId: id });
        }
        if (typeof needsApi.getPet === "function") {
          const p = needsApi.getPet(id);
          if (p && typeof p === "object") return Object.assign({}, FALLBACK_PETS[id] || FALLBACK_PETS.milu, p, { id: id, petId: id });
        }
        const roster = needsApi.PETS || needsApi.PET_ROSTER || needsApi.ROSTER;
        if (Array.isArray(roster)) {
          const found = roster.find(function (x) { return x && (x.id === id || x.petId === id); });
          if (found) return Object.assign({}, FALLBACK_PETS[id] || FALLBACK_PETS.milu, found, { id: id, petId: id });
        } else if (roster && typeof roster === "object" && roster[id]) {
          return Object.assign({}, FALLBACK_PETS[id] || FALLBACK_PETS.milu, roster[id], { id: id, petId: id });
        }
      } catch (e) {}
    }
    return Object.assign({}, FALLBACK_PETS[id] || FALLBACK_PETS.milu);
  }

  function getActivePet() {
    const needsApi = getNeedsEngine();
    let activeId = "milu";
    let customPetObj = null;

    if (needsApi) {
      try {
        if (typeof needsApi.getActivePet === "function") {
          const p = needsApi.getActivePet();
          if (p && typeof p === "object") {
            customPetObj = p;
            activeId = normalizePetId(p.id || p.petId || "milu");
          } else if (typeof p === "string") {
            activeId = normalizePetId(p);
          }
        } else if (typeof needsApi.getActivePetId === "function") {
          activeId = normalizePetId(needsApi.getActivePetId());
        } else if (typeof needsApi.getState === "function") {
          const st = needsApi.getState();
          if (st && (st.activePetId || st.petId)) {
            activeId = normalizePetId(st.activePetId || st.petId);
          }
        } else if (typeof needsApi.state === "function") {
          const st = needsApi.state();
          if (st && (st.activePetId || st.petId)) {
            activeId = normalizePetId(st.activePetId || st.petId);
          }
        }
      } catch (e) {}
    }

    // Enforce entitlement guard if ELW_PET_REWARDS is loaded
    const rewardsApi =
      (root && root.ELW_PET_REWARDS) ||
      (typeof window !== "undefined" ? window.ELW_PET_REWARDS : null);
    if (rewardsApi && typeof rewardsApi.getSafeActivePetId === "function") {
      activeId = rewardsApi.getSafeActivePetId(activeId);
    }

    const base = getPetMetadata(activeId);
    return customPetObj ? Object.assign({}, base, customPetObj, { id: activeId, petId: activeId }) : base;
  }

  function getCurrentNeedsSnapshot() {
    const needsApi = getNeedsEngine();
    const defaults = { energy: 85, hunger: 80, thirst: 82, fun: 85, bond: 20 };
    if (!needsApi) return defaults;
    try {
      if (typeof needsApi.getNeeds === "function") {
        const n = needsApi.getNeeds();
        if (n && typeof n === "object") return Object.assign({}, defaults, n);
      }
      const st =
        typeof needsApi.getState === "function"
          ? needsApi.getState()
          : typeof needsApi.state === "function"
          ? needsApi.state()
          : null;
      if (st && st.needs && typeof st.needs === "object") {
        return Object.assign({}, defaults, st.needs);
      }
      if (st && typeof st.hunger === "number") {
        return Object.assign({}, defaults, {
          energy: st.energy !== undefined ? st.energy : defaults.energy,
          hunger: st.hunger,
          thirst: st.thirst !== undefined ? st.thirst : defaults.thirst,
          fun: st.fun !== undefined ? st.fun : (st.mood !== undefined ? st.mood : defaults.fun),
          bond: st.bond !== undefined ? st.bond : defaults.bond
        });
      }
    } catch (e) {}
    return defaults;
  }

  function getCurrentVisualState() {
    const needsApi = getNeedsEngine();
    if (needsApi) {
      try {
        if (typeof needsApi.getVisualState === "function") {
          const vs = needsApi.getVisualState();
          if (vs && STATE_ANIMATION_MAP[vs]) return vs;
        }
        if (typeof needsApi.resolveVisualState === "function") {
          const vs = needsApi.resolveVisualState();
          if (vs && STATE_ANIMATION_MAP[vs]) return vs;
        }
        if (typeof needsApi.getCurrentState === "function") {
          const vs = needsApi.getCurrentState();
          if (vs && STATE_ANIMATION_MAP[vs]) return vs;
        }
        const st =
          typeof needsApi.getState === "function"
            ? needsApi.getState()
            : typeof needsApi.state === "function"
            ? needsApi.state()
            : null;
        if (st) {
          const candidate = st.temporaryState || st.transientState || st.visualState || st.currentState;
          if (candidate && STATE_ANIMATION_MAP[candidate]) return candidate;
        }
      } catch (e) {}
    }
    if (localTempState && STATE_ANIMATION_MAP[localTempState]) {
      return localTempState;
    }
    return FALLBACK_STATE;
  }

  function tryConsumeOptionalItem(actionId) {
    const itemMap = { feed: "treats", water: "water", play: "toys" };
    const itemKey = itemMap[actionId];
    if (!itemKey) return { consumed: false, itemKey: null, fallbackFree: true };

    const needsApi = getNeedsEngine();
    if (!needsApi) return { consumed: false, itemKey: itemKey, fallbackFree: true };

    try {
      if (typeof needsApi.consumeInventory === "function") {
        const ok = needsApi.consumeInventory(itemKey, 1);
        return { consumed: Boolean(ok), itemKey: itemKey, fallbackFree: !ok };
      }
      if (typeof needsApi.consumeItem === "function") {
        const ok = needsApi.consumeItem(itemKey, 1);
        return { consumed: Boolean(ok), itemKey: itemKey, fallbackFree: !ok };
      }
      if (typeof needsApi.useItem === "function") {
        const ok = needsApi.useItem(itemKey, 1);
        return { consumed: Boolean(ok), itemKey: itemKey, fallbackFree: !ok };
      }
      const inv =
        typeof needsApi.getInventory === "function"
          ? needsApi.getInventory()
          : (typeof needsApi.getState === "function" && needsApi.getState() && needsApi.getState().inventory) || {};
      const altKey = itemKey === "water" && inv.water === undefined && inv.waterBottles !== undefined ? "waterBottles" : itemKey;
      const currentCount = Number(inv[altKey]) || 0;
      if (currentCount > 0) {
        if (typeof needsApi.addInventory === "function") {
          const deltaObj = {};
          deltaObj[altKey] = -1;
          needsApi.addInventory(deltaObj);
          return { consumed: true, itemKey: altKey, fallbackFree: false };
        }
        if (typeof needsApi.addItems === "function") {
          const deltaObj = {};
          deltaObj[altKey] = -1;
          needsApi.addItems(deltaObj);
          return { consumed: true, itemKey: altKey, fallbackFree: false };
        }
      }
    } catch (e) {}

    // Even if item count is 0, interaction always succeeds (basic meal / fresh water / free play)
    return { consumed: false, itemKey: itemKey, fallbackFree: true };
  }

  /* ---------- Dialogue Formatting & Speech Dispatch ---------- */
  function buildDialogueForAction(actionId, pet) {
    const list = DIALOGUE_BANK[actionId] || DIALOGUE_BANK.pet;
    const idx = actionId === "talk" ? (talkRotationIdx++ % list.length) : 0;
    const tpl = list[idx] || list[0];
    const petName = (pet && pet.name) || "Milu";
    const petSound = (pet && pet.sound) || "Woof! 🐾";

    const fill = function (s) {
      return String(s || "")
        .replace(/\{name\}/g, petName)
        .replace(/\{sound\}/g, petSound);
    };

    return {
      playerEn: fill(tpl.playerEn),
      playerVi: fill(tpl.playerVi),
      petReplyEn: fill(tpl.petReplyEn),
      petReplyVi: fill(tpl.petReplyVi)
    };
  }

  function dispatchSpeechAndBubble(pet, dialogue, opts) {
    const options = opts && typeof opts === "object" ? opts : {};
    if (options.silent === true) return;

    const win = (root && root.window) || (typeof window !== "undefined" ? window : root);
    try {
      if (win && typeof win.charSay === "function") {
        win.charSay(dialogue.playerEn);
      }
    } catch (e) {}

    try {
      if (win && typeof win.say === "function") {
        win.say(dialogue.playerEn, 0.95);
      }
    } catch (e) {}

    try {
      const life = (win && win.ELW_LIFE) || (root && root.ELW_LIFE);
      if (life && typeof life.draw3DSpeechBubble === "function") {
        life.draw3DSpeechBubble(
          "char",
          pet.name || "Milu",
          pet.icon || "🐕",
          dialogue.petReplyEn,
          dialogue.petReplyVi,
          "result",
          DEFAULT_TEMP_DURATION_MS
        );
      }
    } catch (e) {}
  }

  /* ---------- Fallback Profile Modal (When ELW_PET_UI is not mounted) ---------- */
  function openFallbackProfileModal() {
    const doc = (root && root.document) || (typeof document !== "undefined" ? document : null);
    if (!doc) return false;

    const pet = getActivePet();
    const needs = getCurrentNeedsSnapshot();
    const visualState = getCurrentVisualState();
    const rewardsApi =
      (root && root.ELW_PET_REWARDS) ||
      (typeof window !== "undefined" ? window.ELW_PET_REWARDS : null);
    const limitationNote =
      (rewardsApi && rewardsApi.PREMIUM_LIMITATION_VI) ||
      "Ứng dụng đang chạy ở chế độ ngoại tuyến (Client-side), chưa kết nối máy chủ xác thực bản quyền. Bạn có thể Xem trước (Preview) 8 Pet Premium hoặc đồng hành miễn phí trọn vẹn cùng Milu & Mochi!";

    let modal = doc.getElementById("modal");
    let mbox = doc.getElementById("mbox");
    if (!modal || !mbox) {
      modal = doc.createElement("div");
      modal.id = "modal";
      mbox = doc.createElement("div");
      mbox.id = "mbox";
      modal.appendChild(mbox);
      doc.body.appendChild(modal);
    }

    const rosterHtml = Object.keys(FALLBACK_PETS).map(function (pid) {
      const p = getPetMetadata(pid);
      const isFree = p.tier === "free" || p.free === true;
      const isCurrent = p.id === pet.id;
      return (
        `<div style="border:1.5px solid ${isCurrent ? "#f59e0b" : "#e2e8f0"};border-radius:12px;padding:8px;background:${isCurrent ? "#fffbeb" : "#ffffff"};display:flex;align-items:center;gap:8px">` +
        renderPetSprite(p.id, "idle_happy", { size: 44 }) +
        `<div style="flex:1;min-width:0">` +
        `<div style="font-weight:800;font-size:13px;color:#0f172a">${esc(p.name)} <small style="color:#64748b">(${esc(p.speciesVi)})</small></div>` +
        `<div style="font-size:11px;font-weight:700;color:${isFree ? "#059669" : "#b45309"}">` +
        `${isFree ? "✅ Miễn phí (Free)" : "🔒 Premium (Xem trước)"}` +
        `</div>` +
        `</div>` +
        `</div>`
      );
    }).join("");

    mbox.innerHTML =
      `<div class="pet-profile-fallback" style="font-family:system-ui,sans-serif;color:#1e293b">` +
      `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">` +
      `<h2 style="margin:0;font-size:18px">📋 Hồ sơ Thú cưng & Bộ sưu tập (10 Pets)</h2>` +
      `<button type="button" class="iconbtn" data-close-pet-profile style="cursor:pointer;border:none;background:#f1f5f9;border-radius:8px;padding:4px 10px;font-weight:800">✕</button>` +
      `</div>` +
      `<div style="display:flex;align-items:center;gap:14px;padding:12px;border-radius:14px;background:#fffbeb;border:1.5px solid #fcd34d;margin-bottom:12px">` +
      renderPetSprite(pet.id, visualState, { size: 78 }) +
      `<div>` +
      `<div style="font-size:16px;font-weight:800">${esc(pet.name)} · <span style="color:#b45309">${esc(pet.speciesVi)}</span></div>` +
      `<div style="font-size:12.5px;color:#475569;margin-top:4px">` +
      `⚡ Năng lượng: <b>${Math.round(needs.energy)}%</b> · 🍖 Độ no: <b>${Math.round(needs.hunger)}%</b> · 💧 Độ khát: <b>${Math.round(needs.thirst)}%</b> · 🎾 Độ vui: <b>${Math.round(needs.fun)}%</b> · 💖 Gắn kết: <b>${Math.round(needs.bond)}%</b>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin-bottom:10px">${rosterHtml}</div>` +
      `<div style="font-size:11.5px;color:#78350f;background:#fef3c7;padding:8px 10px;border-radius:10px;line-height:1.4">ℹ️ ${esc(limitationNote)}</div>` +
      `</div>`;

    modal.hidden = false;
    const closeBtn = mbox.querySelector("[data-close-pet-profile]");
    if (closeBtn) {
      closeBtn.onclick = function () {
        modal.hidden = true;
      };
    }
    return true;
  }

  /* ---------- Core Action Executor: performInteraction(actionId, opts) ---------- */
  function performInteraction(actionId, opts) {
    injectAnimationCss();
    const key = String(actionId || "").trim().toLowerCase();
    const interaction = INTERACTIONS_BY_ID[key];
    if (!interaction) {
      return {
        ok: false,
        actionId: key,
        reason: "unknown_interaction"
      };
    }

    const options = opts && typeof opts === "object" ? opts : {};
    const source = String(options.source || options.entrySource || "home_pet_panel");
    const activePet = getActivePet();
    const needsApi = getNeedsEngine();

    // 1. Optional item consumption (feed -> treats, water -> water, play -> toys)
    //    NEVER blocks or starves the pet when item count === 0!
    const itemConsumption = tryConsumeOptionalItem(interaction.id);

    // 2. Apply needsDelta via ELW_PET_NEEDS.applyNeedDelta(needsDelta)
    let updatedNeeds = null;
    if (needsApi) {
      try {
        if (typeof needsApi.applyNeedDelta === "function") {
          updatedNeeds = Number.isFinite(options.nowMs)
            ? needsApi.applyNeedDelta(interaction.needsDelta, options.nowMs)
            : needsApi.applyNeedDelta(interaction.needsDelta);
        } else if (typeof needsApi.applyNeedsDelta === "function") {
          updatedNeeds = needsApi.applyNeedsDelta(interaction.needsDelta);
        } else if (typeof needsApi.updateNeeds === "function") {
          updatedNeeds = needsApi.updateNeeds(interaction.needsDelta);
        }
      } catch (e) {}
    }

    // 3. Add XP via ELW_PET_NEEDS.addXp(xp)
    let updatedXp = null;
    if (needsApi && interaction.xp > 0) {
      try {
        if (typeof needsApi.addXp === "function") {
          updatedXp = needsApi.addXp(interaction.xp);
        } else if (typeof needsApi.gainXp === "function") {
          updatedXp = needsApi.gainXp(interaction.xp);
        }
      } catch (e) {}
    }

    // 4. Transition Pet animation state to targetState via ELW_PET_NEEDS.setTemporaryState(targetState, 4500)
    const durationMs = Number(options.durationMs) > 0 ? Number(options.durationMs) : DEFAULT_TEMP_DURATION_MS;
    const targetState = normalizeState(interaction.targetState);
    localTempState = targetState;
    if (localTempTimer) clearTimeout(localTempTimer);
    localTempTimer = setTimeout(function () {
      localTempState = null;
      refreshSceneQuickBar();
    }, durationMs);
    if (localTempTimer && typeof localTempTimer.unref === "function") {
      localTempTimer.unref();
    }

    if (needsApi) {
      try {
        if (typeof needsApi.setTemporaryState === "function") {
          needsApi.setTemporaryState(targetState, durationMs);
        } else if (typeof needsApi.setTransientState === "function") {
          needsApi.setTransientState(targetState, durationMs);
        }
      } catch (e) {}
    }

    // 5. Generate natural English + Vietnamese dialogue and speak/show bubble
    const dialogue = buildDialogueForAction(interaction.id, activePet);
    dispatchSpeechAndBubble(activePet, dialogue, options);

    // 6. Special Action Handlers: walk & profile
    let adventureSession = null;
    let profileOpened = false;

    if (interaction.id === "walk") {
      const advApi =
        (root && root.ELW_PET_ADVENTURE) ||
        (typeof window !== "undefined" ? window.ELW_PET_ADVENTURE : null);
      if (advApi) {
        try {
          if (typeof advApi.enterAdventure === "function") {
            adventureSession = advApi.enterAdventure({ entrySource: source, petId: activePet.id });
          } else if (typeof advApi.startAdventure === "function") {
            adventureSession = advApi.startAdventure({ entrySource: source, petId: activePet.id });
          }
        } catch (e) {}
      }

      // Sync ELW_CONTEXT.setWalkDog(true) with re-entrancy guard
      if (!walkSyncGuard) {
        walkSyncGuard = true;
        try {
          const ctxApi =
            (root && root.ELW_CONTEXT) ||
            (typeof window !== "undefined" ? window.ELW_CONTEXT : null);
          if (ctxApi && typeof ctxApi.setWalkDog === "function") {
            ctxApi.setWalkDog(true);
          }
        } catch (e) {}
        walkSyncGuard = false;
      }

      // Open Mission tab / display Adventure HUD if available
      try {
        const w3d =
          (root && root.ELW_WORLD3D) ||
          (typeof window !== "undefined" ? window.ELW_WORLD3D : null);
        if (w3d && typeof w3d.setTab === "function" && options.switchTab !== false) {
          w3d.setTab("mission");
        }
      } catch (e) {}
    } else if (interaction.id === "profile") {
      const uiApi =
        (root && root.ELW_PET_UI) ||
        (typeof window !== "undefined" ? window.ELW_PET_UI : null);
      if (uiApi && typeof uiApi.openProfileModal === "function") {
        try {
          uiApi.openProfileModal({ petId: activePet.id, source: source });
          profileOpened = true;
        } catch (e) {
          profileOpened = openFallbackProfileModal();
        }
      } else {
        profileOpened = openFallbackProfileModal();
      }
    }

    // Notify Adventure Engine about care/talk interaction so active quest objectives can auto-validate
    if (interaction.id !== "walk") {
      try {
        const advApi =
          (root && root.ELW_PET_ADVENTURE) ||
          (typeof window !== "undefined" ? window.ELW_PET_ADVENTURE : null);
        if (advApi) {
          if (typeof advApi.onPetInteraction === "function") {
            advApi.onPetInteraction(interaction.id, { petId: activePet.id, source: source, dialogue: dialogue });
          } else if (typeof advApi.recordInteraction === "function") {
            advApi.recordInteraction(interaction.id, { petId: activePet.id, source: source });
          } else if (typeof advApi.onAction === "function") {
            advApi.onAction(interaction.id, { petId: activePet.id, source: source });
          }
        }
      } catch (e) {}
    }

    // Notify Pet UI if loaded
    try {
      const uiApi =
        (root && root.ELW_PET_UI) ||
        (typeof window !== "undefined" ? window.ELW_PET_UI : null);
      if (uiApi && typeof uiApi.refresh === "function") {
        uiApi.refresh();
      }
    } catch (e) {}

    const result = {
      ok: true,
      actionId: interaction.id,
      source: source,
      pet: activePet,
      targetState: targetState,
      animation: getAnimationForState(targetState).animation,
      needsDelta: Object.assign({}, interaction.needsDelta),
      xpAdded: interaction.xp,
      itemConsumption: itemConsumption,
      dialogue: dialogue,
      needs: updatedNeeds || getCurrentNeedsSnapshot(),
      xp: updatedXp,
      adventureSession: adventureSession,
      profileOpened: profileOpened,
      timestamp: Date.now()
    };

    lastInteractionResult = result;
    refreshSceneQuickBar();
    notifySubscribers(result);
    return result;
  }

  /* ---------- Home Scene QuickBar (#petSceneQuickBar) in #panel ---------- */
  function buildSceneQuickBarHtml(opts) {
    const options = opts && typeof opts === "object" ? opts : {};
    const source = String(options.source || "home_pet_click");
    const activePet = getActivePet();
    const currentState = getCurrentVisualState();
    const animMeta = getAnimationForState(currentState);
    const needs = getCurrentNeedsSnapshot();

    const buttonsHtml = INTERACTIONS.map(function (act) {
      return (
        `<button type="button" class="psqb-btn" data-pet-action="${esc(act.id)}" data-pet-act="${esc(act.id)}" data-pet-source="${esc(source)}" ` +
        `title="${esc(act.labelVi)} (${esc(act.labelEn)})">` +
        `<span class="psqb-ico">${act.icon}</span>` +
        `<span class="psqb-vi">${esc(act.labelVi)}</span>` +
        `<span class="psqb-en">${esc(act.labelEn)}</span>` +
        `</button>`
      );
    }).join("");

    const feedbackHtml = lastInteractionResult && lastInteractionResult.dialogue
      ? `<div class="psqb-feedback">` +
        `<b>${esc(activePet.name)}:</b> “${esc(lastInteractionResult.dialogue.petReplyEn)}”` +
        `<small>${esc(lastInteractionResult.dialogue.petReplyVi)}</small>` +
        `</div>`
      : "";

    return (
      `<div class="psqb-head">` +
      renderPetSprite(activePet.id, currentState, { size: 58 }) +
      `<div class="psqb-info">` +
      `<div class="psqb-title">` +
      `<span>🐾 Tương tác cùng ${esc(activePet.name)}</span>` +
      `<span class="psqb-state-badge">${esc(animMeta.labelVi)}</span>` +
      `</div>` +
      `<div class="psqb-needs-mini">` +
      `<span class="psqb-need-pill">⚡ ${Math.round(needs.energy)}%</span>` +
      `<span class="psqb-need-pill">🍖 ${Math.round(needs.hunger)}%</span>` +
      `<span class="psqb-need-pill">💧 ${Math.round(needs.thirst)}%</span>` +
      `<span class="psqb-need-pill">🎾 ${Math.round(needs.fun)}%</span>` +
      `<span class="psqb-need-pill">💖 ${Math.round(needs.bond)}%</span>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `<div class="psqb-grid" role="group" aria-label="8 tương tác cùng Pet">` +
      buttonsHtml +
      `</div>` +
      feedbackHtml
    );
  }

  function bindQuickBarEvents(barEl, defaultSource) {
    if (!barEl || typeof barEl.querySelectorAll !== "function") return;
    const buttons = barEl.querySelectorAll("[data-pet-action], [data-pet-act]");
    buttons.forEach(function (btn) {
      btn.onclick = function (ev) {
        if (ev && typeof ev.stopPropagation === "function") ev.stopPropagation();
        const actId = btn.getAttribute("data-pet-action") || btn.getAttribute("data-pet-act");
        const src = btn.getAttribute("data-pet-source") || defaultSource || "home_pet_click";
        performInteraction(actId, { source: src });
      };
    });
  }

  function injectSceneQuickBar(targetPanel, opts) {
    injectAnimationCss();
    const doc = (root && root.document) || (typeof document !== "undefined" ? document : null);
    const panelEl = targetPanel || (doc && doc.getElementById("panel"));
    if (!panelEl) return null;

    const source = (opts && opts.source) || "home_pet_click";
    let barEl = doc ? doc.getElementById(QUICK_BAR_ID) : null;
    if (!barEl || barEl.parentNode !== panelEl) {
      if (barEl && barEl.parentNode) barEl.parentNode.removeChild(barEl);
      barEl = doc.createElement("section");
      barEl.id = QUICK_BAR_ID;
      barEl.setAttribute("aria-label", "🐾 Tương tác cùng Pet");
      if (panelEl.firstChild) {
        panelEl.insertBefore(barEl, panelEl.firstChild);
      } else {
        panelEl.appendChild(barEl);
      }
    }

    barEl.innerHTML = buildSceneQuickBarHtml({ source: source });
    bindQuickBarEvents(barEl, source);
    return barEl;
  }

  function clearVisualOverride() {
    localTempState = null;
    if (localTempTimer) {
      clearTimeout(localTempTimer);
      localTempTimer = null;
    }
    const needsApi = getNeedsEngine();
    if (needsApi && typeof needsApi.setTemporaryState === "function") {
      try {
        needsApi.setTemporaryState("clear");
      } catch (e) {}
    }
  }

  const HOME_ROOMS = new Set(["living", "kitchen", "bedroom", "bathroom", "garage", "garden"]);
  let lastSyncedFollowRoom = null;
  let followSubscribed = false;
  let needsSubscribed = false;

  function isHomeRoomId(roomId, win) {
    const r = String(roomId || "living").trim();
    if (HOME_ROOMS.has(r)) return true;
    try {
      const rooms = (win && win.ELW_ROOMS) || (root && root.ELW_ROOMS);
      if (rooms && rooms[r] && rooms[r].topic) {
        return rooms[r].topic === "home";
      }
    } catch (e) {}
    return false;
  }

  function getLowPetNeeds() {
    const needs = getCurrentNeedsSnapshot();
    const candidates = [
      { key: "hunger", icon: "🍽️", val: Number(needs.hunger), threshold: 45, urgentAt: 25 },
      { key: "thirst", icon: "💧", val: Number(needs.thirst), threshold: 45, urgentAt: 25 },
      { key: "fun", icon: "💔", val: Number(needs.fun), threshold: 45, urgentAt: 25 },
      { key: "energy", icon: "💤", val: Number(needs.energy), threshold: 35, urgentAt: 20 }
    ];
    return candidates
      .filter(function (c) {
        return Number.isFinite(c.val) && c.val < c.threshold;
      })
      .sort(function (a, b) {
        return a.val - b.val;
      })
      .slice(0, 3)
      .map(function (c) {
        return {
          key: c.key,
          icon: c.icon,
          val: Math.round(c.val),
          urgent: c.val < c.urgentAt
        };
      });
  }

  function syncLegacyNeedsLayer(doc, win) {
    try {
      const d = doc || (root && root.document) || (typeof document !== "undefined" ? document : null);
      const w = win || (root && root.window) || (typeof window !== "undefined" ? window : root);
      if (!d) return;

      // Patch ELW_NEEDS.decorate once so any subsequent decorate() call immediately cleans up stale bubbles
      if (w && w.ELW_NEEDS && typeof w.ELW_NEEDS.decorate === "function" && !w.ELW_NEEDS.__elwPetDecoratePatched) {
        const origDecorate = w.ELW_NEEDS.decorate;
        const patchedDecorate = function () {
          const res = origDecorate.apply(this, arguments);
          try {
            syncLegacyNeedsLayer(d, w);
            syncPetNeedCluster(d, w);
          } catch (e) {}
          return res;
        };
        patchedDecorate.__elwPetDecoratePatched = true;
        w.ELW_NEEDS.decorate = patchedDecorate;
      }

      // Keep legacy ELW_NEEDS cat counters aligned with Pet 2.0 needs so needsCard doesn't report false starvation
      if (w && w.ELW_NEEDS && typeof w.ELW_NEEDS.state === "function" && typeof w.ELW_NEEDS.set === "function") {
        try {
          const petNeeds = getCurrentNeedsSnapshot();
          const legacyState = w.ELW_NEEDS.state();
          const nextCatHunger = Math.max(0, Math.min(100, Math.round(100 - Number(petNeeds.hunger || 80))));
          const nextCatThirst = Math.max(0, Math.min(100, Math.round(100 - Number(petNeeds.thirst || 80))));
          const nextMood = Math.max(0, Math.min(100, Math.round(Math.max(Number(petNeeds.fun || 80), Number(petNeeds.bond || 50)))));
          if (
            legacyState &&
            (Math.abs((legacyState.catHunger || 0) - nextCatHunger) > 10 ||
              Math.abs((legacyState.catThirst || 0) - nextCatThirst) > 10 ||
              (legacyState.catBowlDirty || 0) > 50)
          ) {
            w.ELW_NEEDS.set({
              catHunger: nextCatHunger,
              catThirst: nextCatThirst,
              mood: nextMood,
              catBowlDirty: 0
            });
          }
        } catch (e) {}
      }

      const W = w && w.ELW && typeof w.ELW.state === "function" ? w.ELW.state() : null;
      const currentRoom = (W && W.room) || "living";
      const inHome = isHomeRoomId(currentRoom, w);
      const layers = d.querySelectorAll("#room g.nd-layer");

      layers.forEach(function (layer) {
        if (!inHome) {
          layer.setAttribute("data-room-hidden", "1");
          layer.style.display = "none";
          if (layer.innerHTML) layer.innerHTML = "";
          return;
        }
        layer.removeAttribute("data-room-hidden");
        layer.style.display = "";

        // Always remove static floor cat need bubbles from g.nd-layer (handled dynamically by #petNeedCluster)
        layer
          .querySelectorAll('[data-nd="catHunger"], [data-nd="catThirst"], [data-nd="mood"], [data-nd="catBowlDirty"]')
          .forEach(function (bub) {
            if (bub && bub.parentNode) bub.parentNode.removeChild(bub);
          });

        // Remove object need bubbles whose target object is not in the current room or is hidden;
        // otherwise fix their SVG coordinates using getBBox() so CSS 3D stage never distorts them onto the character
        const objMap = {
          plantThirst: "o-plant",
          trashFull: "o-trashbin",
          dirtyDishes: "o-sink",
          laundryPile: "o-washer"
        };
        Object.keys(objMap).forEach(function (ndKey) {
          const targetEl = d.getElementById(objMap[ndKey]);
          const targetRoomAttr = targetEl && targetEl.dataset ? targetEl.dataset.room : null;
          const targetHidden =
            !targetEl ||
            targetEl.style.display === "none" ||
            (targetRoomAttr && targetRoomAttr !== currentRoom);
          if (targetHidden) {
            layer.querySelectorAll('[data-nd="' + ndKey + '"]').forEach(function (bub) {
              if (bub && bub.parentNode) bub.parentNode.removeChild(bub);
            });
          } else if (targetEl && typeof targetEl.getBBox === "function") {
            const bub = layer.querySelector('[data-nd="' + ndKey + '"]');
            if (bub) {
              try {
                const vecEl = targetEl.querySelector(".vec") || targetEl;
                const bb = vecEl.getBBox();
                if (bb && bb.width > 0 && bb.height > 0) {
                  const cx = Math.round(bb.x + bb.width / 2);
                  const cy = Math.max(24, Math.round(bb.y - 22));
                  const circles = bub.querySelectorAll("circle.nd-bub");
                  const txt = bub.querySelector("text.nd-emo");
                  if (circles.length >= 2 && txt) {
                    circles[0].setAttribute("cx", String(cx + 12));
                    circles[0].setAttribute("cy", String(cy + 18));
                    circles[1].setAttribute("cx", String(cx));
                    circles[1].setAttribute("cy", String(cy));
                    txt.setAttribute("x", String(cx));
                    txt.setAttribute("y", String(cy + 1));
                  }
                }
              } catch (e) {}
            }
          }
        });

        // Ensure character energy bar/bubble (if any) uses true SVG coords above character head and never overlaps character face
        const energyBub = layer.querySelector('[data-nd="energy"]');
        if (energyBub && W && Number.isFinite(W.x) && Number.isFinite(W.y)) {
          const charS = (0.95 + ((W.y - 330) / 310) * 0.5) * 1.25;
          const safeTopY = Math.max(18, Math.round(W.y - 190 * charS));
          const rects = energyBub.querySelectorAll("rect");
          const txt = energyBub.querySelector("text");
          if (rects.length >= 2) {
            const barW = 44;
            const bx = Math.round(W.x - barW / 2);
            rects[0].setAttribute("x", String(bx));
            rects[0].setAttribute("y", String(safeTopY));
            rects[1].setAttribute("x", String(bx + 1));
            rects[1].setAttribute("y", String(safeTopY + 1));
            if (txt) {
              txt.setAttribute("x", String(bx - 4));
              txt.setAttribute("y", String(safeTopY + 4));
            }
          }
        }
      });
    } catch (e) {}
  }

  function syncPetNeedCluster(doc, win, posOverride) {
    try {
      const d = doc || (root && root.document) || (typeof document !== "undefined" ? document : null);
      const w = win || (root && root.window) || (typeof window !== "undefined" ? window : root);
      if (!d) return null;

      const oCat = d.getElementById("o-cat");
      if (!oCat) return null;

      const SVGNS = "http://www.w3.org/2000/svg";
      const catScale = d.getElementById("catScale") || d.getElementById("catPos") || oCat;
      let cluster = d.getElementById("petNeedCluster");
      if (!cluster) {
        cluster = d.createElementNS(SVGNS, "g");
        cluster.id = "petNeedCluster";
        cluster.setAttribute("class", "pet-need-cluster");
        cluster.setAttribute("aria-hidden", "true");
        catScale.appendChild(cluster);
      } else if (cluster.parentNode !== catScale) {
        catScale.appendChild(cluster);
      }

      // If #petReactBubble (from pet-personality.js) is present inside #catScale, keep it above #petNeedCluster so it never covers pet face
      const reactBub = d.getElementById("petReactBubble");
      if (reactBub && reactBub.getAttribute("transform") === "translate(30, -28)") {
        reactBub.setAttribute("transform", "translate(54, -98)");
      }

      const followCtrl = w && w.ELW_PET_FOLLOW;
      const pos =
        posOverride ||
        (followCtrl && typeof followCtrl.getPosition === "function" ? followCtrl.getPosition() : null);
      const W = w && w.ELW && typeof w.ELW.state === "function" ? w.ELW.state() : null;

      let petX = pos && Number.isFinite(pos.x) ? pos.x : (W && Number.isFinite(W.x) ? W.x - 64 : 590);
      let petY = pos && Number.isFinite(pos.y) ? pos.y : (W && Number.isFinite(W.y) ? W.y + 12 : 600);
      let petScale = pos && Number.isFinite(pos.scale) && pos.scale > 0 ? pos.scale : 1;

      const roomPetImg = d.getElementById("roomPetImg");
      const oCatHidden =
        oCat.style.display === "none" ||
        oCat.getAttribute("hidden") !== null ||
        (pos && pos.visible === false) ||
        (roomPetImg && roomPetImg.style.display === "none");

      // Compute head-mounted local coordinates inside #catScale (roomPetImg top is y = -68)
      let offX = 0;
      let offY = -77;

      // Avoid intersecting character face bbox if pet happens to stand directly behind character
      if (W && Number.isFinite(W.x) && Number.isFinite(W.y)) {
        const charS = (0.95 + ((W.y - 330) / 310) * 0.5) * 1.25;
        const faceX = W.x;
        const faceY = W.y - 134 * charS;
        const faceRadius = 34 * charS;
        const clusterWorldX = petX + offX * petScale;
        const clusterWorldY = petY + offY * petScale;
        if (
          Math.abs(clusterWorldX - faceX) < faceRadius + 24 &&
          Math.abs(clusterWorldY - faceY) < faceRadius + 18
        ) {
          offX = petX >= faceX ? 24 : -24;
          offY = -72;
        }
      }

      cluster.setAttribute("transform", `translate(${offX.toFixed(1)},${offY.toFixed(1)})`);
      cluster.setAttribute("data-pet-x", petX.toFixed(1));
      cluster.setAttribute("data-pet-y", petY.toFixed(1));
      cluster.setAttribute("data-pet-scale", petScale.toFixed(3));

      const lowItems = oCatHidden ? [] : getLowPetNeeds();
      cluster.setAttribute("data-low-count", String(lowItems.length));

      if (oCatHidden || lowItems.length === 0) {
        cluster.setAttribute("hidden", "hidden");
        cluster.style.display = "none";
        if (cluster.innerHTML) cluster.innerHTML = "";
        cluster.setAttribute("data-sig", "");
        return cluster;
      }

      cluster.removeAttribute("hidden");
      cluster.style.display = "";

      const sig = lowItems
        .map(function (it) {
          return it.key + ":" + (it.urgent ? 1 : 0);
        })
        .join(",");
      if (cluster.getAttribute("data-sig") !== sig) {
        cluster.setAttribute("data-sig", sig);
        const stepX = 21;
        const startX = -((lowItems.length - 1) * stepX) / 2;
        cluster.innerHTML = lowItems
          .map(function (it, idx) {
            const bx = (startX + idx * stepX).toFixed(1);
            return (
              `<g class="pet-need-badge" data-need-key="${esc(it.key)}" data-urgent="${it.urgent ? "1" : "0"}" transform="translate(${bx},0)">` +
              `<circle r="9.5" cx="0" cy="0"></circle>` +
              `<text x="0" y="0.5">${it.icon}</text>` +
              `</g>`
            );
          })
          .join("");
      }

      return cluster;
    } catch (e) {
      return null;
    }
  }

  function bindFollowAndNeedsSubscriptions() {
    const win = (root && root.window) || (typeof window !== "undefined" ? window : root);
    const doc = (root && root.document) || (typeof document !== "undefined" ? document : null);
    if (!win) return;

    if (!followSubscribed && win.ELW_PET_FOLLOW && typeof win.ELW_PET_FOLLOW.subscribe === "function") {
      try {
        followSubscribed = true;
        win.ELW_PET_FOLLOW.subscribe(function (pos) {
          syncPetNeedCluster(doc, win, pos);
        });
      } catch (e) {
        followSubscribed = false;
      }
    }

    if (!needsSubscribed && win.ELW_PET_NEEDS && typeof win.ELW_PET_NEEDS.subscribe === "function") {
      try {
        needsSubscribed = true;
        win.ELW_PET_NEEDS.subscribe(function () {
          syncLegacyNeedsLayer(doc, win);
          syncPetNeedCluster(doc, win);
        });
      } catch (e) {
        needsSubscribed = false;
      }
    }
  }

  function syncScenePet() {
    try {
      const doc = (root && root.document) || (typeof document !== "undefined" ? document : null);
      const win = (root && root.window) || (typeof window !== "undefined" ? window : root);
      if (!doc) return null;
      injectAnimationCss();
      bindFollowAndNeedsSubscriptions();
      syncLegacyNeedsLayer(doc, win);

      // Remove any duplicate #ctx-dog or legacy NPC dog element so #room has strictly 1 companion pet element (#o-cat)
      doc.querySelectorAll('#room #ctx-dog, #room .npc.np-k-dog, #room .npc[data-npc="dog"]').forEach(function (el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });

      const oCat = doc.getElementById("o-cat");
      if (!oCat) return null;

      const activePet = getActivePet();
      const visualState = getCurrentVisualState();
      const fallbackRelPath = `assets/pets/${activePet.id}/${visualState}.png`;
      let relPath = fallbackRelPath;
      const needsApi = getNeedsEngine();
      if (activePet.id === "milu" && needsApi && typeof needsApi.getAssetPath === "function") {
        try {
          const candidatePath = needsApi.getAssetPath(activePet.id, visualState);
          if (typeof candidatePath === "string" && candidatePath.length > 0) {
            relPath = candidatePath;
          }
        } catch (e) {}
      }
      const resolvedSrc = resolvePetAsset(relPath);

      // Hide legacy orange cat SVG vectors inside #o-cat
      const catBody = doc.getElementById("catBody");
      const catCurl = doc.getElementById("catCurl");
      if (catBody) catBody.style.display = "none";
      if (catCurl) catCurl.style.display = "none";

      // Ensure single <image id="roomPetImg"> inside #o-cat
      const SVGNS = "http://www.w3.org/2000/svg";
      let roomPetImg = doc.getElementById("roomPetImg");
      const flipG = doc.getElementById("catFlip") || doc.getElementById("catHop") || oCat.querySelector(".vec") || oCat;
      if (!roomPetImg) {
        roomPetImg = doc.createElementNS(SVGNS, "image");
        roomPetImg.id = "roomPetImg";
        roomPetImg.setAttribute("class", "pet-room-sprite pet-sprite-img");
        roomPetImg.setAttribute("x", "-38");
        roomPetImg.setAttribute("y", "-68");
        roomPetImg.setAttribute("width", "76");
        roomPetImg.setAttribute("height", "76");
        roomPetImg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        flipG.appendChild(roomPetImg);
      }
      if (!roomPetImg.__elwFallbackBound) {
        roomPetImg.__elwFallbackBound = true;
        roomPetImg.addEventListener("error", function () {
          const fb = roomPetImg.getAttribute("data-fallback-src") || `assets/pets/${getActivePet().id}/idle_happy.png`;
          const resolvedFb = resolvePetAsset(fb);
          if (roomPetImg.getAttribute("href") !== resolvedFb) {
            roomPetImg.setAttribute("src", resolvedFb);
            roomPetImg.setAttribute("href", resolvedFb);
          }
        });
      }
      if (!Object.getOwnPropertyDescriptor(roomPetImg, "src") && !(typeof window !== "undefined" && window.SVGImageElement && Object.getOwnPropertyDescriptor(window.SVGImageElement.prototype, "src"))) {
        try {
          Object.defineProperty(roomPetImg, "src", {
            configurable: true,
            enumerable: true,
            get: function () { return this.getAttribute("src") || this.getAttribute("href") || ""; },
            set: function (v) {
              const r = resolvePetAsset(v);
              this.setAttribute("src", r);
              this.setAttribute("href", r);
            }
          });
        } catch (e) {}
      }
      if (!Object.getOwnPropertyDescriptor(oCat, "src")) {
        try {
          Object.defineProperty(oCat, "src", {
            configurable: true,
            enumerable: true,
            get: function () { return this.getAttribute("src") || (roomPetImg && roomPetImg.src) || ""; },
            set: function (v) {
              const r = resolvePetAsset(v);
              this.setAttribute("src", r);
              if (roomPetImg) {
                roomPetImg.setAttribute("src", r);
                roomPetImg.setAttribute("href", r);
              }
            }
          });
        } catch (e) {}
      }

      roomPetImg.setAttribute("data-pet-sprite-id", activePet.id);
      roomPetImg.setAttribute("data-state", visualState);
      roomPetImg.setAttribute("data-src-path", relPath);
      roomPetImg.setAttribute("data-fallback-src", fallbackRelPath);
      roomPetImg.setAttribute("src", resolvedSrc);
      roomPetImg.setAttribute("href", resolvedSrc);
      roomPetImg.style.display = "";

      oCat.setAttribute("data-pet-id", activePet.id);
      oCat.setAttribute("data-state", visualState);
      oCat.setAttribute("data-visual-state", visualState);
      oCat.setAttribute("data-src-path", relPath);
      oCat.setAttribute("src", resolvedSrc);
      oCat.setAttribute("aria-label", `${activePet.name}, ${activePet.speciesVi || "thú cưng"}`);
      oCat.style.display = "";

      const tagEl = oCat.querySelector(".tag");
      if (tagEl) {
        tagEl.textContent = `${activePet.name} · ${activePet.speciesVi || "thú cưng"}`;
      }

      // Position #o-cat in non-living rooms or when walking with pet (yield to ELW_PET_FOLLOW if active)
      const W = win && win.ELW && typeof win.ELW.state === "function" ? win.ELW.state() : null;
      const followCtrl = win && win.ELW_PET_FOLLOW;
      if (followCtrl && typeof followCtrl.isControlling === "function" && followCtrl.isControlling()) {
        if (W && typeof followCtrl.syncOnRoomChange === "function") {
          let fPos = typeof followCtrl.getPosition === "function" ? followCtrl.getPosition() : null;
          if (lastSyncedFollowRoom !== W.room || (fPos && fPos.room !== W.room)) {
            lastSyncedFollowRoom = W.room;
            followCtrl.syncOnRoomChange(W.room, W.x, W.y, W.dir);
            fPos = typeof followCtrl.getPosition === "function" ? followCtrl.getPosition() : null;
          }
          // When character is idle near the left entry (x <= 165), place pet clearly to the right of character's feet
          if (
            fPos &&
            !fPos.moving &&
            Number.isFinite(W.x) &&
            W.x <= 165 &&
            (Math.abs(fPos.x - W.x) < 42 || fPos.x <= 92) &&
            typeof followCtrl.setPosition === "function"
          ) {
            followCtrl.setPosition(W.x + 68, Math.min(618, (W.y || 520) + 6), 1, W.room);
          }
        }
      } else {
        const ctxState = win && win.ELW_CONTEXT && typeof win.ELW_CONTEXT.state === "function" ? win.ELW_CONTEXT.state() : null;
        const isWalking = Boolean(ctxState && ctxState.walkDog);
        if (W && (W.room !== "living" || isWalking)) {
          const dx = Math.max(80, Math.min(920, (W.x || 500) + (W.dir === -1 ? 68 : -68)));
          const dy = Math.max(390, Math.min(625, (W.y || 500) + 12));
          const catPos = doc.getElementById("catPos");
          if (catPos) {
            catPos.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px)`;
          }
          oCat.dataset.base = String(Math.round(dy));
        }
      }

      syncPetNeedCluster(doc, win);
      return oCat;
    } catch (e) {
      return null;
    }
  }

  function refreshSceneQuickBar() {
    syncScenePet();
    const doc = (root && root.document) || (typeof document !== "undefined" ? document : null);
    if (!doc) return;
    const barEl = doc.getElementById(QUICK_BAR_ID);
    if (barEl) {
      barEl.innerHTML = buildSceneQuickBarHtml({ source: "home_pet_click" });
      bindQuickBarEvents(barEl, "home_pet_click");
    }
  }

  function isCatSelectedInPanel(panelEl, doc) {
    if (!panelEl) return false;
    const oCat = doc && doc.getElementById("o-cat");
    if (oCat && oCat.classList && oCat.classList.contains("sel")) return true;
    const headB = panelEl.querySelector && panelEl.querySelector(".ohead b");
    if (headB && String(headB.textContent || "").trim().toLowerCase() === "cat") return true;
    return false;
  }

  function bindHomePetClickListener() {
    const doc = (root && root.document) || (typeof document !== "undefined" ? document : null);
    if (!doc || domHooked) return false;
    domHooked = true;

    const onHomePetActivate = function () {
      const panelEl = doc.getElementById("panel");
      if (panelEl) {
        injectSceneQuickBar(panelEl, { source: "home_pet_click" });
      }
      setTimeout(function () {
        const p2 = doc.getElementById("panel");
        if (p2) injectSceneQuickBar(p2, { source: "home_pet_click" });
      }, 0);
    };

    // Direct listener on #o-cat & #pet-home-avatar if already in DOM
    const oCat = doc.getElementById("o-cat");
    if (oCat) {
      oCat.addEventListener("click", onHomePetActivate);
    }
    const homeAvatar = doc.getElementById("pet-home-avatar");
    if (homeAvatar) {
      homeAvatar.addEventListener("click", onHomePetActivate);
    }

    // Delegated capture listener so dynamically re-rendered #o-cat or #pet-home-avatar always works
    doc.addEventListener(
      "click",
      function (ev) {
        const tgt = ev && ev.target;
        if (!tgt || typeof tgt.closest !== "function") return;
        const hit = tgt.closest("#o-cat, #pet-home-avatar, [data-obj='cat']");
        if (hit) {
          onHomePetActivate();
        }
      },
      true
    );

    // Observe #panel re-renders (e.g. renderObject() in index.html) while #o-cat is selected
    const panelEl = doc.getElementById("panel");
    if (panelEl && typeof MutationObserver === "function") {
      panelObserver = new MutationObserver(function () {
        if (isCatSelectedInPanel(panelEl, doc) && !doc.getElementById(QUICK_BAR_ID)) {
          injectSceneQuickBar(panelEl, { source: "home_pet_click" });
        }
      });
      panelObserver.observe(panelEl, { childList: true });
    }

    return true;
  }

  /* ---------- Subscription Helper ---------- */
  function subscribe(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function unsubscribe() {
      const i = listeners.indexOf(fn);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  function notifySubscribers(payload) {
    listeners.slice().forEach(function (fn) {
      try {
        fn(payload);
      } catch (e) {}
    });
  }

  /* ---------- Initialization ---------- */
  function init() {
    injectAnimationCss();
    bindHomePetClickListener();
    bindFollowAndNeedsSubscriptions();
    syncScenePet();
    return api;
  }

  // Auto-init if DOM is already available
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  const api = Object.freeze({
    INTERACTIONS: INTERACTIONS,
    INTERACTIONS_BY_ID: INTERACTIONS_BY_ID,
    CANONICAL_STATES: CANONICAL_STATES,
    ANIMATION_TYPES: ANIMATION_TYPES,
    STATE_ANIMATION_MAP: STATE_ANIMATION_MAP,
    FALLBACK_STATE: FALLBACK_STATE,
    QUICK_BAR_ID: QUICK_BAR_ID,
    init: init,
    isReducedMotion: isReducedMotion,
    injectAnimationCss: injectAnimationCss,
    getAnimationForState: getAnimationForState,
    renderPetSprite: renderPetSprite,
    resolvePetAsset: resolvePetAsset,
    clearVisualOverride: clearVisualOverride,
    syncScenePet: syncScenePet,
    syncPetNeedCluster: syncPetNeedCluster,
    syncLegacyNeedsLayer: syncLegacyNeedsLayer,
    getLowPetNeeds: getLowPetNeeds,
    handleSpriteError: handleSpriteError,
    buildSvgFallback: buildSvgFallback,
    performInteraction: performInteraction,
    injectSceneQuickBar: injectSceneQuickBar,
    refreshSceneQuickBar: refreshSceneQuickBar,
    openFallbackProfileModal: openFallbackProfileModal,
    getActivePet: getActivePet,
    getCurrentVisualState: getCurrentVisualState,
    subscribe: subscribe
  });

  return api;
});
