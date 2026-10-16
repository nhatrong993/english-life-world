/* English Life World — rooms-expansion.js
   Agent 4: Phòng mới (Bathroom, Garage, Garden)
   Defines interactive rooms for Bathroom, Garage, and Garden with rich SVG,
   spots, hitboxes, actions, vocabulary, and catalogs. */
(function (root) {
  "use strict";

  const OPS = ["walk", "pose", "wait", "set", "spawn", "despawn", "sit", "stand", "fx", "face", "activity"];
  const POSES = ["reach", "bend", "drink", "pour", "sweep", "wipe", "water", "point", "idle"];

  const objG = (id, en, vi, base, tagX, tagY, inner, extra) =>
    `<g class="obj" id="o-${id}" data-obj="${id}" data-base="${base}" tabindex="0" aria-label="${en}, ${vi}"${extra || ""}><g class="vec">${inner}</g><text class="tag" x="${tagX}" y="${tagY}" text-anchor="middle">${en} · ${vi}</text></g>`;

  /* ======================================================================
     1. BATHROOM (Phòng tắm)
     ====================================================================== */
  const BV = {
    wash: ["wash", "/wɑʃ/", "rửa"], hands: ["hands", "/hændz/", "đôi tay"], soap: ["soap", "/soʊp/", "xà phòng"],
    brush: ["brush", "/brʌʃ/", "đánh (răng)"], teeth: ["teeth", "/tiːθ/", "răng"], toothpaste: ["toothpaste", "/ˈtuːθ.peɪst/", "kem đánh răng"],
    face: ["face", "/feɪs/", "khuôn mặt"], water: ["water", "/ˈwɔː.tər/", "nước"], mirror: ["mirror", "/ˈmɪr.ər/", "gương"],
    look: ["look into", "/lʊk ˈɪn.tuː/", "nhìn vào"], comb: ["comb", "/koʊm/", "chải (tóc)"], hair: ["hair", "/herr/", "tóc"],
    shower: ["take a shower", "/teɪk ə ˈʃaʊ.ər/", "tắm vòi sen"], bath: ["take a bath", "/teɪk ə bɑːθ/", "tắm bồn"],
    towel: ["towel", "/ˈtaʊ.əl/", "khăn tắm"], dry: ["dry", "/draɪ/", "lau khô"], scale: ["scale", "/skeɪl/", "cái cân"],
    weigh: ["weigh", "/weɪ/", "cân (trọng lượng)"], flush: ["flush", "/flʌʃ/", "xả nước"], toilet: ["toilet", "/ˈtɔɪ.lət/", "bồn cầu"],
    tap: ["tap", "/tæp/", "vòi nước"], turnoff: ["turn off", "/tɜːn ɑf/", "khóa, tắt"], mat: ["bath mat", "/ˈbɑːθ mæt/", "thảm chùi chân"],
    step: ["step on", "/step ɑn/", "bước lên"], rinse: ["rinse", "/rɪns/", "súc miệng"]
  };

  const mkActB = (id, obj, label, labelVi, sentence, vi, vk, disc, pre, seq, story, sitOk) => ({
    id, obj, label, labelVi, sentence, vi, key: vk[0],
    vocab: vk.map(k => BV[k]),
    grammar: "Thì hiện tại tiếp diễn với hành động vệ sinh cá nhân.",
    chunks: [sentence.split(" ").slice(0, 2).join(" "), sentence.split(" ").slice(2).join(" ")],
    disc: { ans: disc[0], opts: disc },
    patterns: [`I'm ${label.toLowerCase()}.`, `She's ${label.toLowerCase()}.`],
    pre, seq, sitOk: !!sitOk,
    story: story || [label.toLowerCase(), label.toLowerCase(), vi.toLowerCase()]
  });

  const bathroomActions = [
    mkActB("wash_hands", "sink_bath", "Wash hands", "Rửa tay", "I'm washing my hands.", "Tôi đang rửa tay bằng xà phòng.", ["wash", "hands", "soap"], ["wash", "wish", "watch"],
      W => W.b_hands === "clean" ? "Tay bạn đã sạch rồi." : null,
      W => [["walk", "bt_sink"], ["pose", "reach", 400], ["set", "b_hands", "clean"], ["pose", "wipe", 900], ["pose", "idle", 1]]),

    mkActB("brush_teeth", "toothbrush", "Brush teeth", "Đánh răng", "I'm brushing my teeth.", "Tôi đang đánh răng thơm tho.", ["brush", "teeth", "toothpaste"], ["brush", "blush", "bush"],
      W => W.b_teeth === "clean" ? "Răng bạn đã trắng sạch rồi." : null,
      W => [["walk", "bt_sink"], ["pose", "reach", 350], ["set", "b_teeth", "clean"], ["pose", "reach", 800], ["pose", "idle", 1]]),

    mkActB("wash_face", "sink_bath", "Wash face", "Rửa mặt", "I'm washing my face.", "Tôi đang vỗ nước mát rửa sạch mặt.", ["wash", "face", "water"], ["face", "fade", "fame"],
      () => null,
      W => [["walk", "bt_sink"], ["pose", "bend", 500], ["pose", "reach", 600], ["pose", "idle", 1]]),

    mkActB("look_in_mirror", "mirror", "Look in mirror", "Soi gương", "I'm looking in the mirror.", "Tôi đang ngắm mình trong gương.", ["look", "mirror"], ["mirror", "minor", "miller"],
      () => null,
      W => [["walk", "bt_mirror"], ["pose", "point", 700], ["pose", "idle", 1]]),

    mkActB("comb_hair", "hairbrush", "Comb hair", "Chải tóc", "I'm combing my hair.", "Tôi đang chải tóc mượt mà.", ["comb", "hair"], ["comb", "come", "cone"],
      () => null,
      W => [["walk", "bt_mirror"], ["pose", "reach", 800], ["pose", "idle", 1]]),

    mkActB("take_shower", "shower", "Take a shower", "Tắm vòi sen", "I'm taking a warm shower.", "Tôi đang tắm dưới làn nước ấm.", ["shower", "water"], ["shower", "power", "tower"],
      W => W.b_shower === "on" ? "Vòi sen đang bật rồi." : null,
      W => [["walk", "bt_shower"], ["pose", "reach", 400], ["set", "b_shower", "on"], ["wait", 600], ["set", "b_shower", "off"], ["pose", "idle", 1]]),

    mkActB("dry_with_towel", "towel_rack", "Dry with towel", "Lau khô bằng khăn", "I'm drying myself with a towel.", "Tôi đang lau khô người bằng khăn bông.", ["dry", "towel"], ["towel", "tower", "total"],
      () => null,
      W => [["walk", "bt_towel"], ["pose", "reach", 400], ["pose", "wipe", 800], ["pose", "idle", 1]]),

    mkActB("weigh_self", "scale", "Weigh myself", "Bước lên cân", "I'm weighing myself on the scale.", "Tôi đang bước lên cân đo thể trạng.", ["weigh", "scale"], ["weigh", "wait", "wave"],
      () => null,
      W => [["walk", "bt_scale"], ["pose", "idle", 700], ["pose", "idle", 1]]),

    mkActB("take_bath", "bathtub", "Take a bath", "Ngâm bồn tắm", "I'm soaking in the warm bathtub.", "Tôi đang thư giãn ngâm bồn tắm.", ["bath", "water"], ["bath", "path", "math"],
      () => null,
      W => [["walk", "bt_tub"], ["pose", "bend", 500], ["wait", 800], ["pose", "idle", 1]]),

    mkActB("flush_toilet", "toilet", "Flush the toilet", "Xả nước bồn cầu", "I'm flushing the toilet.", "Tôi đang gạt nước xả bồn cầu.", ["flush", "toilet"], ["flush", "flash", "flesh"],
      () => null,
      W => [["walk", "bt_toilet"], ["pose", "reach", 400], ["wait", 600], ["pose", "idle", 1]]),

    mkActB("turn_off_bath_tap", "bathtub", "Turn off bath tap", "Khóa vòi bồn tắm", "I'm turning off the bathtub tap.", "Tôi đang khóa vòi xả bồn tắm.", ["turnoff", "tap"], ["tap", "top", "tip"],
      () => null,
      W => [["walk", "bt_tub"], ["pose", "reach", 450], ["pose", "idle", 1]])
  ];

  const bathroomObjects = {
    bathtub: { en: "bathtub", vi: "bồn tắm", ipa: "/ˈbɑːθ.tʌb/", acts: ["take_bath", "turn_off_bath_tap"] },
    shower: { en: "shower", vi: "vòi sen", ipa: "/ˈʃaʊ.ər/", acts: ["take_shower"] },
    sink_bath: { en: "bathroom sink", vi: "bồn rửa mặt", ipa: "/sɪŋk/", acts: ["wash_hands", "wash_face"] },
    toilet: { en: "toilet", vi: "bồn cầu", ipa: "/ˈtɔɪ.lət/", acts: ["flush_toilet"] },
    mirror: { en: "mirror", vi: "gương", ipa: "/ˈmɪr.ər/", acts: ["look_in_mirror"] },
    towel_rack: { en: "towel rack", vi: "giá treo khăn", ipa: "/ˈtaʊ.əl ræk/", acts: ["dry_with_towel"] },
    scale: { en: "scale", vi: "cái cân", ipa: "/skeɪl/", acts: ["weigh_self"] },
    toothbrush: { en: "toothbrush", vi: "bàn chải", ipa: "/ˈtuːθ.brʌʃ/", acts: ["brush_teeth"] },
    hairbrush: { en: "hairbrush", vi: "lược chải tóc", ipa: "/ˈher.brʌʃ/", acts: ["comb_hair"] },
    bath_mat: { en: "bath mat", vi: "thảm chùi chân", ipa: "/ˈbɑːθ mæt/", acts: ["wash_hands"] }
  };

  const bathroomSpots = {
    bt_door: { x: 130, y: 590, d: 1 },
    bt_tub: { x: 740, y: 510, d: -1 },
    bt_shower: { x: 860, y: 460, d: -1 },
    bt_sink: { x: 380, y: 490, d: 1 },
    bt_toilet: { x: 580, y: 490, d: 1 },
    bt_mirror: { x: 380, y: 490, d: 1 },
    bt_towel: { x: 260, y: 490, d: 1 },
    bt_scale: { x: 220, y: 570, d: 1 }
  };

  const bathroomWorldSvg = `
    <!-- Tub -->
    ${objG("bathtub", "bathtub", "bồn tắm", 510, 750, 420, `
      <rect class="hit" x="650" y="440" width="220" height="90" fill="transparent"/>
      <rect x="660" y="450" width="200" height="70" rx="20" fill="#e0f2f1" stroke="#80cbc4" stroke-width="3"/>
      <ellipse cx="760" cy="485" rx="80" ry="25" fill="#b2dfdb"/>
      <circle cx="680" cy="460" r="6" fill="#78909c"/>
    `)}
    <!-- Sink -->
    ${objG("sink_bath", "sink", "bồn rửa mặt", 490, 380, 400, `
      <rect class="hit" x="330" y="420" width="100" height="90" fill="transparent"/>
      <rect x="340" y="440" width="80" height="60" rx="8" fill="#ffffff" stroke="#b0bec5" stroke-width="2"/>
      <ellipse cx="380" cy="460" rx="30" ry="12" fill="#e0f7fa"/>
      <rect x="375" y="425" width="10" height="18" fill="#78909c"/>
    `)}
    <!-- Mirror -->
    ${objG("mirror", "mirror", "gương", 360, 380, 240, `
      <rect class="hit" x="340" y="250" width="80" height="120" fill="transparent"/>
      <rect x="340" y="250" width="80" height="120" rx="40" fill="#e1f5fe" stroke="#90caf9" stroke-width="4"/>
      <line x1="355" y1="270" x2="405" y2="350" stroke="#ffffff" stroke-width="3" opacity="0.6"/>
    `)}
    <!-- Toilet -->
    ${objG("toilet", "toilet", "bồn cầu", 490, 580, 410, `
      <rect class="hit" x="540" y="430" width="80" height="90" fill="transparent"/>
      <rect x="550" y="430" width="60" height="40" rx="6" fill="#ffffff" stroke="#cfd8dc" stroke-width="2"/>
      <ellipse cx="580" cy="480" rx="25" ry="30" fill="#ffffff" stroke="#b0bec5" stroke-width="2"/>
      <ellipse cx="580" cy="480" rx="16" ry="20" fill="#e0f7fa"/>
    `)}
    <!-- Towel rack -->
    ${objG("towel_rack", "towel rack", "giá khăn", 490, 260, 420, `
      <rect class="hit" x="230" y="430" width="60" height="80" fill="transparent"/>
      <rect x="235" y="440" width="50" height="6" rx="3" fill="#90a4ae"/>
      <rect x="240" y="446" width="40" height="60" rx="4" fill="#80deea"/>
    `)}
    <!-- Scale -->
    ${objG("scale", "scale", "cái cân", 570, 220, 540, `
      <rect class="hit" x="190" y="550" width="60" height="40" fill="transparent"/>
      <rect x="195" y="555" width="50" height="30" rx="6" fill="#cfd8dc" stroke="#90a4ae" stroke-width="2"/>
      <circle cx="220" cy="565" r="6" fill="#ffffff"/>
    `)}
    <!-- Toothbrush -->
    ${objG("toothbrush", "toothbrush", "bàn chải", 490, 440, 430, `
      <rect class="hit" x="425" y="430" width="30" height="40" fill="transparent"/>
      <rect x="435" y="435" width="6" height="30" rx="2" fill="#4fc3f7"/>
      <rect x="433" y="430" width="10" height="8" rx="2" fill="#ffffff"/>
    `)}
    <!-- Hairbrush -->
    ${objG("hairbrush", "hairbrush", "lược", 490, 310, 450, `
      <rect class="hit" x="300" y="440" width="30" height="30" fill="transparent"/>
      <rect x="305" y="445" width="20" height="8" rx="3" fill="#ffb74d"/>
    `)}
    <!-- Shower -->
    ${objG("shower", "shower", "vòi sen", 460, 860, 360, `
      <rect class="hit" x="840" y="370" width="50" height="100" fill="transparent"/>
      <path d="M850 370 Q870 360 880 390" stroke="#78909c" stroke-width="4" fill="none"/>
      <circle cx="880" cy="395" r="10" fill="#90a4ae"/>
    `)}
    <!-- Bath mat -->
    ${objG("bath_mat", "bath mat", "thảm chân", 590, 750, 560, `
      <rect class="hit" x="700" y="560" width="100" height="40" fill="transparent"/>
      <rect x="710" y="565" width="80" height="30" rx="8" fill="#80cbc4"/>
    `)}
  `;

  /* ======================================================================
     2. GARAGE (Nhà để xe)
     ====================================================================== */
  const GV = {
    car: ["car", "/kɑːr/", "xe ô tô"], inspect: ["inspect", "/ɪnˈspekt/", "kiểm tra"], hood: ["hood", "/hʊd/", "nắp ca-pô"],
    oil: ["engine oil", "/ˈen.dʒɪn ɔɪl/", "dầu máy"], bike: ["bicycle", "/ˈbaɪ.sɪ.kəl/", "xe đạp"], pump: ["pump up", "/pʌmp ʌp/", "bơm căng"],
    tire: ["tire", "/taɪrr/", "lốp xe"], wrench: ["wrench", "/rentʃ/", "cờ lê"], toolbox: ["toolbox", "/ˈtuːl.bɑks/", "hộp đồ nghề"],
    sweep: ["sweep", "/swiːp/", "quét sạch"], floor: ["floor", "/flɔːr/", "sàn"], wash: ["wash", "/wɑʃ/", "rửa, lau"],
    battery: ["battery", "/ˈbæt.ər.i/", "bình ắc quy"], charge: ["charge", "/tʃɑːdʒ/", "sạc điện"], store: ["store", "/stɔːr/", "cất gọn"],
    tools: ["tools", "/tuːlz/", "dụng cụ"], light: ["light", "/laɪt/", "đèn"], ride: ["ride", "/raɪd/", "lái, đi xe"]
  };

  const mkActG = (id, obj, label, labelVi, sentence, vi, vk, disc, pre, seq, story) => ({
    id, obj, label, labelVi, sentence, vi, key: vk[0],
    vocab: vk.map(k => GV[k]),
    grammar: "Thì hiện tại tiếp diễn với các công việc sửa chữa và bảo dưỡng.",
    chunks: [sentence.split(" ").slice(0, 2).join(" "), sentence.split(" ").slice(2).join(" ")],
    disc: { ans: disc[0], opts: disc },
    patterns: [`I'm ${label.toLowerCase()}.`, `We're ${label.toLowerCase()}.`],
    pre, seq, sitOk: false,
    story: story || [label.toLowerCase(), label.toLowerCase(), vi.toLowerCase()]
  });

  const garageActions = [
    mkActG("inspect_car", "car", "Inspect the car", "Kiểm tra xe ô tô", "I'm inspecting the family car.", "Tôi đang kiểm tra quanh chiếc xe ô tô.", ["inspect", "car"], ["car", "cat", "card"],
      () => null,
      W => [["walk", "g_carSpot"], ["pose", "reach", 500], ["pose", "idle", 1]]),

    mkActG("open_car_hood", "car_hood", "Open car hood", "Mở nắp ca-pô", "I'm opening the car hood.", "Tôi đang mở nắp ca-pô xe.", ["hood", "car"], ["hood", "wood", "good"],
      () => null,
      W => [["walk", "g_hoodSpot"], ["pose", "reach", 600], ["pose", "idle", 1]]),

    mkActG("check_engine_oil", "car_hood", "Check engine oil", "Kiểm tra dầu máy", "I'm checking the engine oil level.", "Tôi đang kiểm tra que thăm dầu máy.", ["oil", "inspect"], ["oil", "boil", "soil"],
      () => null,
      W => [["walk", "g_hoodSpot"], ["pose", "bend", 600], ["pose", "reach", 400], ["pose", "idle", 1]]),

    mkActG("pump_bicycle_tire", "bicycle", "Pump bicycle tire", "Bơm lốp xe đạp", "I'm pumping up the bicycle tire.", "Tôi đang bơm căng bánh xe đạp.", ["pump", "tire", "bike"], ["pump", "jump", "lump"],
      () => null,
      W => [["walk", "g_bikeSpot"], ["pose", "bend", 800], ["pose", "idle", 1]]),

    mkActG("grab_wrench", "toolbox", "Grab a wrench", "Lấy cờ lê", "I'm grabbing a wrench from the toolbox.", "Tôi đang lấy chiếc cờ lê từ hộp đồ.", ["wrench", "toolbox", "tools"], ["wrench", "bench", "trench"],
      () => null,
      W => [["walk", "g_benchSpot"], ["pose", "reach", 500], ["pose", "idle", 1]]),

    mkActG("store_tools", "workbench", "Store tools away", "Cất gọn dụng cụ", "I'm storing tools neatly on the shelf.", "Tôi đang xếp gọn đồ nghề lên giá.", ["store", "tools"], ["store", "score", "shore"],
      () => null,
      W => [["walk", "g_benchSpot"], ["pose", "reach", 600], ["pose", "idle", 1]]),

    mkActG("sweep_garage", "garage_broom", "Sweep garage floor", "Quét sàn garage", "I'm sweeping the dusty garage floor.", "Tôi đang quét sạch bụi trên sàn nhà xe.", ["sweep", "floor"], ["sweep", "sleep", "steep"],
      () => null,
      W => [["walk", "g_floorSpot"], ["pose", "sweep", 900], ["pose", "idle", 1]]),

    mkActG("wash_car", "car", "Wash the car", "Rửa xe ô tô", "I'm washing the car windshield.", "Tôi đang lau sạch kính chắn gió xe.", ["wash", "car"], ["wash", "wish", "watch"],
      () => null,
      W => [["walk", "g_carSpot"], ["pose", "wipe", 900], ["pose", "idle", 1]]),

    mkActG("charge_battery", "charger", "Charge vehicle battery", "Sạc bình ắc quy", "I'm charging the vehicle battery.", "Tôi đang cắm sạc cho bình điện.", ["charge", "battery"], ["charge", "large", "change"],
      () => null,
      W => [["walk", "g_chargerSpot"], ["pose", "reach", 500], ["pose", "idle", 1]]),

    mkActG("ride_bicycle", "bicycle", "Ride the bicycle", "Đi thử xe đạp", "I'm riding the tuned bicycle.", "Tôi đang đạp thử chiếc xe đạp vừa bảo dưỡng.", ["ride", "bike"], ["ride", "side", "wide"],
      () => null,
      W => [["walk", "g_bikeSpot"], ["pose", "idle", 600], ["pose", "idle", 1]])
  ];

  const garageObjects = {
    car: { en: "car", vi: "xe ô tô", ipa: "/kɑːr/", acts: ["inspect_car", "wash_car"] },
    car_hood: { en: "car hood", vi: "nắp ca-pô", ipa: "/hʊd/", acts: ["open_car_hood", "check_engine_oil"] },
    bicycle: { en: "bicycle", vi: "xe đạp", ipa: "/ˈbaɪ.sɪ.kəl/", acts: ["pump_bicycle_tire", "ride_bicycle"] },
    toolbox: { en: "toolbox", vi: "hộp đồ nghề", ipa: "/ˈtuːl.bɑks/", acts: ["grab_wrench"] },
    workbench: { en: "workbench", vi: "bàn thợ", ipa: "/ˈwɜːk.bentʃ/", acts: ["store_tools"] },
    charger: { en: "battery charger", vi: "bộ sạc bình", ipa: "/ˈbæt.ər.i ˈtʃɑː.dʒər/", acts: ["charge_battery"] },
    garage_broom: { en: "heavy broom", vi: "chổi cán dài", ipa: "/bruːm/", acts: ["sweep_garage"] },
    tire_pump: { en: "floor tire pump", vi: "bơm sàn", ipa: "/pʌmp/", acts: ["pump_bicycle_tire"] },
    garage_light: { en: "overhead light", vi: "đèn trần", ipa: "/laɪt/", acts: ["inspect_car"] },
    storage_shelf: { en: "metal shelves", vi: "kệ sắt", ipa: "/ʃelf/", acts: ["store_tools"] }
  };

  const garageSpots = {
    g_door: { x: 110, y: 590, d: 1 },
    g_carSpot: { x: 620, y: 540, d: -1 },
    g_hoodSpot: { x: 480, y: 480, d: 1 },
    g_bikeSpot: { x: 260, y: 520, d: 1 },
    g_benchSpot: { x: 380, y: 450, d: 1 },
    g_floorSpot: { x: 440, y: 570, d: 1 },
    g_chargerSpot: { x: 320, y: 460, d: 1 }
  };

  const garageWorldSvg = `
    <!-- Car -->
    ${objG("car", "car", "xe ô tô", 540, 680, 430, `
      <rect class="hit" x="520" y="420" width="320" height="130" fill="transparent"/>
      <rect x="540" y="440" width="280" height="90" rx="20" fill="#37474f" stroke="#263238" stroke-width="3"/>
      <polygon points="570,440 620,380 740,380 780,440" fill="#607d8b"/>
      <circle cx="580" cy="530" r="24" fill="#212121" stroke="#757575" stroke-width="4"/>
      <circle cx="760" cy="530" r="24" fill="#212121" stroke="#757575" stroke-width="4"/>
    `)}
    <!-- Car Hood -->
    ${objG("car_hood", "hood", "nắp ca-pô", 480, 550, 420, `
      <rect class="hit" x="530" y="430" width="70" height="50" fill="transparent"/>
      <line x1="540" y1="440" x2="600" y2="440" stroke="#ffb300" stroke-width="3"/>
    `)}
    <!-- Bicycle -->
    ${objG("bicycle", "bicycle", "xe đạp", 520, 260, 440, `
      <rect class="hit" x="200" y="440" width="120" height="90" fill="transparent"/>
      <circle cx="225" cy="500" r="22" stroke="#546e7a" stroke-width="4" fill="none"/>
      <circle cx="295" cy="500" r="22" stroke="#546e7a" stroke-width="4" fill="none"/>
      <line x1="225" y1="500" x2="260" y2="470" stroke="#e53935" stroke-width="4"/>
      <line x1="260" y1="470" x2="295" y2="500" stroke="#e53935" stroke-width="4"/>
      <line x1="260" y1="470" x2="250" y2="445" stroke="#212121" stroke-width="3"/>
    `)}
    <!-- Workbench -->
    ${objG("workbench", "workbench", "bàn thợ", 450, 380, 370, `
      <rect class="hit" x="320" y="380" width="140" height="80" fill="transparent"/>
      <rect x="330" y="390" width="120" height="60" fill="#795548" stroke="#4e342e" stroke-width="2"/>
      <rect x="330" y="390" width="120" height="12" fill="#a1887f"/>
    `)}
    <!-- Toolbox -->
    ${objG("toolbox", "toolbox", "hộp đồ", 430, 390, 360, `
      <rect class="hit" x="370" y="370" width="40" height="25" fill="transparent"/>
      <rect x="375" y="375" width="30" height="18" rx="3" fill="#d32f2f" stroke="#b71c1c" stroke-width="2"/>
    `)}
    <!-- Tire pump -->
    ${objG("tire_pump", "pump", "bơm sàn", 520, 180, 460, `
      <rect class="hit" x="165" y="470" width="30" height="50" fill="transparent"/>
      <rect x="175" y="475" width="8" height="40" fill="#ffca28"/>
      <rect x="168" y="472" width="22" height="5" fill="#212121"/>
    `)}
    <!-- Broom -->
    ${objG("garage_broom", "broom", "chổi", 490, 140, 440, `
      <rect class="hit" x="125" y="420" width="30" height="90" fill="transparent"/>
      <line x1="140" y1="425" x2="140" y2="500" stroke="#8d6e63" stroke-width="4"/>
      <polygon points="130,500 150,500 145,515 135,515" fill="#fbc02d"/>
    `)}
    <!-- Battery Charger -->
    ${objG("charger", "charger", "bộ sạc", 460, 480, 370, `
      <rect class="hit" x="465" y="375" width="35" height="30" fill="transparent"/>
      <rect x="470" y="380" width="25" height="22" rx="4" fill="#3949ab"/>
    `)}
    <!-- Shelves -->
    ${objG("storage_shelf", "shelves", "giá sắt", 380, 240, 260, `
      <rect class="hit" x="180" y="260" width="110" height="140" fill="transparent"/>
      <rect x="190" y="270" width="90" height="120" fill="none" stroke="#78909c" stroke-width="3"/>
      <line x1="190" y1="310" x2="280" y2="310" stroke="#78909c" stroke-width="3"/>
      <line x1="190" y1="350" x2="280" y2="350" stroke="#78909c" stroke-width="3"/>
    `)}
    <!-- Overhead light -->
    ${objG("garage_light", "light", "đèn trần", 120, 500, 60, `
      <rect class="hit" x="440" y="50" width="120" height="40" fill="transparent"/>
      <rect x="450" y="55" width="100" height="12" rx="4" fill="#fff59d" stroke="#fbc02d" stroke-width="2"/>
    `)}
  `;

  /* ======================================================================
     3. GARDEN (Khu vườn)
     ====================================================================== */
  const GDV = {
    flower: ["flowers", "/ˈflaʊ.əz/", "những bông hoa"], water: ["water", "/ˈwɔː.tər/", "tưới nước"], rose: ["rose", "/roʊz/", "hoa hồng"],
    smell: ["smell", "/smel/", "ngửi hương"], tree: ["tree", "/triː/", "cái cây"], apple: ["apple", "/ˈæp.əl/", "quả táo"],
    pick: ["pick", "/pɪk/", "hái (quả)"], bird: ["birds", "/bɜːdz/", "những chú chim"], feed: ["feed", "/fiːd/", "cho ăn"],
    seed: ["seeds", "/siːdz/", "hạt giống"], veggie: ["vegetables", "/ˈvedʒ.tə.bəlz/", "rau củ"], harvest: ["harvest", "/ˈhɑː.vɪst/", "thu hoạch"],
    weed: ["weed", "/wiːd/", "nhổ cỏ dại"], prune: ["prune", "/pruːn/", "tỉa (cành)"], branch: ["branches", "/ˈbrɑːn.tʃɪz/", "cành cây"],
    fountain: ["fountain", "/ˈfaʊn.tɪn/", "đài phun nước"], turnon: ["turn on", "/tɜːn ɑn/", "bật"], turnoff: ["turn off", "/tɜːn ɑf/", "tắt"],
    bench: ["bench", "/bentʃ/", "ghế băng"], sit: ["sit on", "/sɪt ɑn/", "ngồi lên"], gate: ["garden gate", "/ˈɡɑː.dən ɡeɪt/", "cổng vườn"],
    open: ["open", "/ˈoʊ.pən/", "mở"], hose: ["hose", "/hoʊz/", "vòi nước tưới"]
  };

  const mkActGD = (id, obj, label, labelVi, sentence, vi, vk, disc, pre, seq, story, sitOk) => ({
    id, obj, label, labelVi, sentence, vi, key: vk[0],
    vocab: vk.map(k => GDV[k]),
    grammar: "Thì hiện tại tiếp diễn với các hoạt động thiên nhiên và làm vườn.",
    chunks: [sentence.split(" ").slice(0, 2).join(" "), sentence.split(" ").slice(2).join(" ")],
    disc: { ans: disc[0], opts: disc },
    patterns: [`I'm ${label.toLowerCase()}.`, `They're ${label.toLowerCase()}.`],
    pre, seq, sitOk: !!sitOk,
    story: story || [label.toLowerCase(), label.toLowerCase(), vi.toLowerCase()]
  });

  const gardenActions = [
    mkActGD("water_flowers", "flowerbed", "Water flowers", "Tưới hoa", "I'm watering the colorful flowers.", "Tôi đang tưới những bông hoa rực rỡ.", ["water", "flower"], ["water", "waiter", "winter"],
      () => null,
      W => [["walk", "gd_flowerSpot"], ["pose", "water", 900], ["pose", "idle", 1]]),

    mkActGD("pick_apple", "apple_tree", "Pick an apple", "Hái quả táo", "I'm picking a red ripe apple.", "Tôi đang hái một quả táo đỏ chín mọng.", ["pick", "apple", "tree"], ["apple", "ample", "apply"],
      () => null,
      W => [["walk", "gd_treeSpot"], ["pose", "reach", 700], ["pose", "idle", 1]]),

    mkActGD("feed_birds", "bird_feeder", "Feed the birds", "Cho chim ăn", "I'm feeding the cheerful birds.", "Tôi đang rải hạt cho chim ăn.", ["feed", "bird", "seed"], ["feed", "feet", "feel"],
      () => null,
      W => [["walk", "gd_birdSpot"], ["pose", "reach", 500], ["pose", "idle", 1]]),

    mkActGD("harvest_vegetables", "vegetable_patch", "Harvest vegetables", "Thu hoạch rau củ", "I'm harvesting fresh green vegetables.", "Tôi đang thu hoạch luống rau tươi xanh.", ["harvest", "veggie"], ["harvest", "hardest", "harness"],
      () => null,
      W => [["walk", "gd_vegSpot"], ["pose", "bend", 800], ["pose", "idle", 1]]),

    mkActGD("smell_rose", "rose_bush", "Smell a rose", "Ngửi hương hoa hồng", "I'm smelling a fragrant red rose.", "Tôi đang thưởng thức hương thơm hoa hồng.", ["smell", "rose"], ["rose", "nose", "hose"],
      () => null,
      W => [["walk", "gd_roseSpot"], ["pose", "bend", 500], ["pose", "idle", 1]]),

    mkActGD("weed_garden", "flowerbed", "Weed the garden", "Nhổ cỏ vườn", "I'm weeding out wild grass from soil.", "Tôi đang nhổ cỏ dại quanh gốc cây.", ["weed", "flower"], ["weed", "need", "seed"],
      () => null,
      W => [["walk", "gd_flowerSpot"], ["pose", "bend", 800], ["pose", "idle", 1]]),

    mkActGD("prune_branches", "apple_tree", "Prune tree branches", "Tỉa cành cây", "I'm pruning overgrown tree branches.", "Tôi đang cắt tỉa những cành cây rậm rạp.", ["prune", "branch", "tree"], ["branch", "brand", "brace"],
      () => null,
      W => [["walk", "gd_treeSpot"], ["pose", "reach", 800], ["pose", "idle", 1]]),

    mkActGD("turn_on_fountain", "fountain", "Turn on fountain", "Bật đài phun nước", "I'm turning on the garden fountain.", "Tôi đang mở đài phun nước róc rách.", ["turnon", "fountain", "water"], ["fountain", "mountain", "captain"],
      () => null,
      W => [["walk", "gd_fountainSpot"], ["pose", "reach", 400], ["pose", "idle", 1]]),

    mkActGD("sit_on_garden_bench", "garden_bench", "Sit on bench", "Ngồi ghế vườn", "I'm sitting on the garden bench.", "Tôi đang ngồi ngắm cảnh trên ghế băng.", ["sit", "bench"], ["bench", "beach", "bunch"],
      () => null,
      W => [["walk", "gd_benchSpot"], ["sit", "gd_benchSpot"], ["pose", "idle", 1]], null, true),

    mkActGD("turn_off_garden_hose", "garden_hose", "Turn off garden hose", "Khóa vòi tưới", "I'm turning off the garden hose valve.", "Tôi đang khóa van vòi xịt tưới cây.", ["turnoff", "hose", "water"], ["hose", "rose", "nose"],
      () => null,
      W => [["walk", "gd_hoseSpot"], ["pose", "reach", 400], ["pose", "idle", 1]])
  ];

  const gardenObjects = {
    flowerbed: { en: "flowerbed", vi: "luống hoa", ipa: "/ˈflaʊ.ə.bed/", acts: ["water_flowers", "weed_garden"] },
    garden_hose: { en: "garden hose", vi: "vòi xịt nước", ipa: "/hoʊz/", acts: ["turn_off_garden_hose"] },
    apple_tree: { en: "apple tree", vi: "cây táo", ipa: "/ˈæp.əl triː/", acts: ["pick_apple", "prune_branches"] },
    bird_feeder: { en: "bird feeder", vi: "máng chim ăn", ipa: "/bɜːd ˈfiː.dər/", acts: ["feed_birds"] },
    vegetable_patch: { en: "vegetable patch", vi: "vườn rau", ipa: "/ˈvedʒ.tə.bəl pætʃ/", acts: ["harvest_vegetables"] },
    rose_bush: { en: "rose bush", vi: "bụi hoa hồng", ipa: "/roʊz bʊʃ/", acts: ["smell_rose"] },
    fountain: { en: "fountain", vi: "đài phun nước", ipa: "/ˈfaʊn.tɪn/", acts: ["turn_on_fountain"] },
    garden_bench: { en: "garden bench", vi: "ghế băng vườn", ipa: "/ˈɡɑː.dən bentʃ/", acts: ["sit_on_garden_bench"] },
    garden_gate: { en: "garden gate", vi: "cổng rào vườn", ipa: "/ɡeɪt/", acts: ["water_flowers"] },
    watering_can_gd: { en: "watering can", vi: "bình tưới nước", ipa: "/ˈwɔː.tə.rɪŋ kæn/", acts: ["water_flowers"] }
  };

  const gardenSpots = {
    gd_door: { x: 100, y: 590, d: 1 },
    gd_flowerSpot: { x: 340, y: 540, d: 1 },
    gd_treeSpot: { x: 740, y: 480, d: -1 },
    gd_birdSpot: { x: 650, y: 470, d: 1 },
    gd_vegSpot: { x: 480, y: 560, d: 1 },
    gd_roseSpot: { x: 250, y: 500, d: 1 },
    gd_fountainSpot: { x: 550, y: 460, d: -1 },
    gd_benchSpot: { x: 620, y: 530, d: -1 },
    gd_hoseSpot: { x: 200, y: 530, d: 1 }
  };

  const gardenWorldSvg = `
    <!-- Apple tree -->
    ${objG("apple_tree", "tree", "cây táo", 480, 780, 240, `
      <rect class="hit" x="680" y="240" width="200" height="250" fill="transparent"/>
      <rect x="760" y="380" width="40" height="120" rx="8" fill="#5d4037"/>
      <circle cx="780" cy="320" r="85" fill="#43a047"/>
      <circle cx="740" cy="300" r="8" fill="#e53935"/>
      <circle cx="820" cy="330" r="8" fill="#e53935"/>
      <circle cx="770" cy="270" r="8" fill="#e53935"/>
    `)}
    <!-- Flowerbed -->
    ${objG("flowerbed", "flowerbed", "luống hoa", 540, 360, 480, `
      <rect class="hit" x="290" y="490" width="140" height="60" fill="transparent"/>
      <ellipse cx="360" cy="520" rx="65" ry="22" fill="#6d4c41"/>
      <circle cx="330" cy="510" r="10" fill="#f06292"/>
      <circle cx="360" cy="515" r="12" fill="#ffd54f"/>
      <circle cx="390" cy="510" r="10" fill="#ba68c8"/>
    `)}
    <!-- Vegetable patch -->
    ${objG("vegetable_patch", "vegetables", "vườn rau", 560, 500, 520, `
      <rect class="hit" x="430" y="520" width="140" height="50" fill="transparent"/>
      <rect x="440" y="530" width="120" height="30" rx="6" fill="#4e342e"/>
      <ellipse cx="465" cy="545" rx="14" ry="8" fill="#7cb342"/>
      <ellipse cx="500" cy="545" rx="14" ry="8" fill="#7cb342"/>
      <ellipse cx="535" cy="545" rx="14" ry="8" fill="#7cb342"/>
    `)}
    <!-- Rose bush -->
    ${objG("rose_bush", "roses", "hoa hồng", 500, 250, 440, `
      <rect class="hit" x="210" y="440" width="80" height="70" fill="transparent"/>
      <circle cx="250" cy="475" r="28" fill="#2e7d32"/>
      <circle cx="240" cy="465" r="7" fill="#d81b60"/>
      <circle cx="260" cy="475" r="8" fill="#d81b60"/>
    `)}
    <!-- Fountain -->
    ${objG("fountain", "fountain", "đài phun nước", 460, 550, 380, `
      <rect class="hit" x="500" y="380" width="100" height="90" fill="transparent"/>
      <ellipse cx="550" cy="450" rx="45" ry="18" fill="#b0bec5" stroke="#78909c" stroke-width="2"/>
      <ellipse cx="550" cy="448" rx="35" ry="12" fill="#80deea"/>
      <rect x="545" y="405" width="10" height="40" fill="#90a4ae"/>
      <path d="M550 405 q-15 -18 -8 15 q15 -18 8 15" stroke="#00e5ff" stroke-width="2" fill="none"/>
    `)}
    <!-- Garden bench -->
    ${objG("garden_bench", "bench", "ghế băng", 530, 640, 470, `
      <rect class="hit" x="580" y="470" width="110" height="70" fill="transparent"/>
      <rect x="590" y="480" width="90" height="10" rx="3" fill="#8d6e63"/>
      <rect x="590" y="500" width="90" height="14" rx="4" fill="#a1887f"/>
      <rect x="600" y="514" width="8" height="26" fill="#5d4037"/>
      <rect x="660" y="514" width="8" height="26" fill="#5d4037"/>
    `)}
    <!-- Bird feeder -->
    ${objG("bird_feeder", "bird feeder", "máng chim", 470, 660, 380, `
      <rect class="hit" x="640" y="380" width="40" height="90" fill="transparent"/>
      <line x1="660" y1="390" x2="660" y2="470" stroke="#8d6e63" stroke-width="3"/>
      <polygon points="645,410 675,410 660,390" fill="#d7ccc8"/>
      <rect x="648" y="410" width="24" height="16" fill="#efebe9"/>
    `)}
    <!-- Hose -->
    ${objG("garden_hose", "hose", "vòi nước", 530, 200, 480, `
      <rect class="hit" x="180" y="490" width="45" height="45" fill="transparent"/>
      <circle cx="200" cy="510" r="16" stroke="#43a047" stroke-width="6" fill="none"/>
    `)}
    <!-- Watering can -->
    ${objG("watering_can_gd", "can", "bình tưới", 560, 280, 520, `
      <rect class="hit" x="260" y="525" width="40" height="35" fill="transparent"/>
      <rect x="268" y="535" width="22" height="18" rx="4" fill="#00acc1"/>
      <line x1="264" y1="540" x2="272" y2="528" stroke="#00838f" stroke-width="2"/>
    `)}
    <!-- Garden gate -->
    ${objG("garden_gate", "gate", "cổng vườn", 590, 80, 500, `
      <rect class="hit" x="40" y="460" width="60" height="120" fill="transparent"/>
      <rect x="45" y="470" width="10" height="100" fill="#a1887f"/>
      <rect x="85" y="470" width="10" height="100" fill="#a1887f"/>
      <line x1="45" y1="490" x2="95" y2="490" stroke="#8d6e63" stroke-width="4"/>
      <line x1="45" y1="540" x2="95" y2="540" stroke="#8d6e63" stroke-width="4"/>
    `)}
  `;

  /* Combine into NEW_ROOMS object */
  const NEW_ROOMS = {
    bathroom: {
      id: "bathroom",
      name: "Bathroom",
      nameVi: "Phòng tắm",
      entry: { x: 140, y: 580, d: 1 },
      W0: {
        b_bathtub: "empty", b_shower: "off", b_faucet: "off", b_toilet: "ready", b_mirror: "clean",
        b_towel: "rack", b_teeth: "unbrushed", b_hands: "dry", b_scale: "0", b_bathmat: "floor"
      },
      objects: bathroomObjects,
      actions: bathroomActions,
      spots: bathroomSpots,
      obstacles: [{ x1: 650, x2: 880, y1: 440, y2: 540 }],
      shellSvg: `<rect x="0" y="0" width="1000" height="640" fill="#f0fdf4"/><rect x="0" y="460" width="1000" height="180" fill="#b2dfdb"/>`,
      worldSvg: bathroomWorldSvg,
      catalog: [
        { id: "bt_shampoo", en: "shampoo", vi: "dầu gội", ipa: "/ʃæmˈpuː/", category: "hygiene" },
        { id: "bt_conditioner", en: "conditioner", vi: "dầu xả", ipa: "/kənˈdɪʃ.ən.ər/", category: "hygiene" },
        { id: "bt_soap", en: "soap", vi: "xà phòng", ipa: "/soʊp/", category: "hygiene" },
        { id: "bt_sponge", en: "body sponge", vi: "bông tắm", ipa: "/spʌndʒ/", category: "hygiene" },
        { id: "bt_robe", en: "bathrobe", vi: "áo choàng tắm", ipa: "/ˈbɑːθ.roʊb/", category: "clothing" },
        { id: "bt_slippers", en: "slippers", vi: "dép đi trong nhà", ipa: "/ˈslɪp.əz/", category: "clothing" },
        { id: "bt_lotion", en: "body lotion", vi: "sữa dưỡng thể", ipa: "/ˈloʊ.ʃən/", category: "skincare" },
        { id: "bt_shaver", en: "razor", vi: "dao cạo râu", ipa: "/ˈreɪ.zər/", category: "hygiene" },
        { id: "bt_dryer", en: "hair dryer", vi: "máy sấy tóc", ipa: "/ˈher ˌdraɪ.ər/", category: "appliance" },
        { id: "bt_curtain", en: "shower curtain", vi: "rèm phòng tắm", ipa: "/ˈʃaʊ.ə ˌkɜː.tən/", category: "decor" }
      ]
    },
    garage: {
      id: "garage",
      name: "Garage",
      nameVi: "Nhà để xe",
      entry: { x: 120, y: 580, d: 1 },
      W0: {
        g_car: "parked", g_hood: "closed", g_oil: "normal", g_bike: "parked", g_pump: "ready",
        g_wrench: "box", g_floor: "dusty", g_tools: "shelves", g_battery: "standby", g_lights: "off"
      },
      objects: garageObjects,
      actions: garageActions,
      spots: garageSpots,
      obstacles: [{ x1: 520, x2: 840, y1: 420, y2: 560 }],
      shellSvg: `<rect x="0" y="0" width="1000" height="640" fill="#eceff1"/><rect x="0" y="440" width="1000" height="200" fill="#90a4ae"/>`,
      worldSvg: garageWorldSvg,
      catalog: [
        { id: "g_hammer", en: "hammer", vi: "cái búa", ipa: "/ˈhæm.ər/", category: "tools" },
        { id: "g_screwdriver", en: "screwdriver", vi: "tua vít", ipa: "/ˈskruːˌdraɪ.vər/", category: "tools" },
        { id: "g_pliers", en: "pliers", vi: "cái kìm", ipa: "/ˈplaɪ.əz/", category: "tools" },
        { id: "g_drill", en: "power drill", vi: "máy khoan", ipa: "/drɪl/", category: "tools" },
        { id: "g_helmet", en: "bicycle helmet", vi: "mũ bảo hiểm", ipa: "/ˈhel.mət/", category: "safety" },
        { id: "g_jack", en: "car jack", vi: "con đội xe", ipa: "/dʒæk/", category: "equipment" },
        { id: "g_rag", en: "shop rag", vi: "giẻ lau máy", ipa: "/ræɡ/", category: "cleaning" },
        { id: "g_bucket", en: "wash bucket", vi: "xô rửa xe", ipa: "/ˈbʌk.ɪt/", category: "cleaning" },
        { id: "g_gloves", en: "work gloves", vi: "găng tay bảo hộ", ipa: "/ɡlʌvz/", category: "safety" },
        { id: "g_funnel", en: "oil funnel", vi: "phễu rót dầu", ipa: "/ˈfʌn.əl/", category: "tools" }
      ]
    },
    garden: {
      id: "garden",
      name: "Garden",
      nameVi: "Khu vườn",
      entry: { x: 100, y: 590, d: 1 },
      W0: {
        gd_flowers: "blooming", gd_hose: "off", gd_tree: "fruiting", gd_birds: "fluttering",
        gd_veggies: "ripe", gd_rose: "fragrant", gd_weeds: "cleared", gd_fountain: "off",
        gd_bench: "empty", gd_gate: "closed"
      },
      objects: gardenObjects,
      actions: gardenActions,
      spots: gardenSpots,
      obstacles: [{ x1: 680, x2: 880, y1: 380, y2: 500 }],
      shellSvg: `<rect x="0" y="0" width="1000" height="640" fill="#e8f5e9"/><rect x="0" y="440" width="1000" height="200" fill="#66bb6a"/>`,
      worldSvg: gardenWorldSvg,
      catalog: [
        { id: "gd_soil", en: "potting soil", vi: "đất trồng", ipa: "/sɔɪl/", category: "nature" },
        { id: "gd_seeds", en: "flower seeds", vi: "hạt giống hoa", ipa: "/siːdz/", category: "nature" },
        { id: "gd_gloves", en: "gardening gloves", vi: "găng tay làm vườn", ipa: "/ɡlʌvz/", category: "tools" },
        { id: "gd_trowel", en: "hand trowel", vi: "xẻng nhỏ cầm tay", ipa: "/ˈtraʊ.əl/", category: "tools" },
        { id: "gd_shears", en: "pruning shears", vi: "kéo tỉa cành", ipa: "/ʃɪrz/", category: "tools" },
        { id: "gd_rake", en: "garden rake", vi: "cào lá", ipa: "/reɪk/", category: "tools" },
        { id: "gd_wheelbarrow", en: "wheelbarrow", vi: "xe cút kít", ipa: "/ˈwiːlˌbær.oʊ/", category: "equipment" },
        { id: "gd_spade", en: "spade", vi: "cái thuổng", ipa: "/speɪd/", category: "tools" },
        { id: "gd_pot", en: "terracotta pot", vi: "chậu đất nung", ipa: "/pɑt/", category: "decor" },
        { id: "gd_butterfly", en: "butterfly", vi: "bươm bướm", ipa: "/ˈbʌt.ə.flaɪ/", category: "fauna" }
      ]
    }
  };

  // Merge into ELW_ROOMS if present
  if (typeof root.ELW_ROOMS !== "undefined") {
    Object.assign(root.ELW_ROOMS, NEW_ROOMS);
  }

  const API = {
    NEW_ROOMS,
    bathroom: NEW_ROOMS.bathroom,
    garage: NEW_ROOMS.garage,
    garden: NEW_ROOMS.garden,
    attach: (roomsTarget) => {
      Object.assign(roomsTarget, NEW_ROOMS);
      return roomsTarget;
    }
  };

  root.ELW_ROOMS_EXPANSION = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
