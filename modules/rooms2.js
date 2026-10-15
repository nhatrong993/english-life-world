/* English Life World — extra rooms module 2 (bathroom + garage + garden)
   Browser script, load AFTER rooms.js. Merges into window.ELW_ROOMS:
     window.ELW_ROOMS = Object.assign(window.ELW_ROOMS || {}, { bathroom, garage, garden })
   Same room format as rooms.js. Every room-state key is prefixed (ba_ = bathroom, ga_ = garage, gd_ = garden).
   applyState(W, rootEl) mirrors every prefixed key onto rootEl as data-<key>="<value>"; the room CSS reacts to it.
   Safety: dangerous garage work (engine, fuel, electrics) is never done by the player — call_mechanic instead. */
(function () {
"use strict";

/* ---------- shared helpers (same contract as rooms.js) ---------- */
const mkAct = (V) => (id, obj, label, labelVi, sentence, vi, key, vk, grammar, chunks, disc, patterns, pre, seq, story, sitOk) => ({
  id, obj, label, labelVi, sentence, vi, key,
  vocab: vk.map(k => { if (!V[k]) throw new Error("vocab " + k); return V[k]; }),
  grammar, chunks, disc: { ans: disc[0], opts: disc.slice() }, patterns,
  pre, seq, sitOk: !!sitOk, story
});
const objG = (id, en, vi, base, tagX, tagY, inner, extra) =>
  `<g class="obj" id="o-${id}" data-obj="${id}" data-base="${base}" tabindex="0" aria-label="${en}, ${vi}"${extra || ""}><g class="vec">${inner}</g><text class="tag" x="${tagX}" y="${tagY}" text-anchor="middle">${en} · ${vi}</text></g>`;
const mirrorState = (W, W0, root) => { for (const k of Object.keys(W0)) root.setAttribute("data-" + k, String(W[k])); };
const cat = (prefix, rows) => rows.map(([en, ipa, vi, category]) => ({ id: prefix + en.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, ""), en, vi, ipa, category }));
/* left wall helper: lines converge at (247.7,0) */
const lw = (x0, y0, inner, a) => { a = a || 0.62; const b = -a * y0 / (247.7 - x0); return `<g transform="matrix(${a},${b.toFixed(3)},0,1,${x0},${y0})">${inner}</g>`; };
const D = (name, inner, base) => `<g data-detail="${name}"${base ? ` data-base="${base}"` : ""}>${inner}</g>`;
const sparkle = (x, y, s, cls) => `<path class="${cls || ""}" d="M${x} ${y - s} l${s * .3} ${s * .7} l${s * .7} ${s * .3} l${-s * .7} ${s * .3} l${-s * .3} ${s * .7} l${-s * .3} ${-s * .7} l${-s * .7} ${-s * .3} l${s * .7} ${-s * .3}z" fill="#fff"/>`;
const sharedKeyframes = `
@keyframes r2Spin{to{transform:rotate(360deg)}}@keyframes r2Steam{50%{transform:translateY(-6px);opacity:.25}}@keyframes r2Pulse{50%{opacity:.55}}
@keyframes r2Flow{to{stroke-dashoffset:-16}}@keyframes r2Drip{to{transform:translateY(5px);opacity:.2}}@keyframes r2Sway{50%{transform:rotate(2.5deg)}}
@keyframes r2Bob{50%{transform:translateY(-3px)}}@keyframes r2Twinkle{50%{opacity:.2}}@keyframes r2Cloud{to{transform:translateX(40px)}}`;

/* ======================================================================
   BATHROOM  (prefix ba_)
   ====================================================================== */
const BAV = {
  turnon: ["turn on", "/tɜːn ɒn/", "bật, mở"], turnoff: ["turn off", "/tɜːn ɒf/", "tắt, khoá"], light: ["light", "/laɪt/", "đèn"],
  switch: ["light switch", "/ˈlaɪt swɪtʃ/", "công tắc đèn"], tap: ["tap", "/tæp/", "vòi nước (Anh-Anh)"], faucet: ["faucet", "/ˈfɔː.sɪt/", "vòi nước (Anh-Mỹ)"],
  water: ["water", "/ˈwɔː.tər/", "nước"], save: ["save", "/seɪv/", "tiết kiệm"], wash: ["wash", "/wɒʃ/", "rửa, gội"], face: ["face", "/feɪs/", "khuôn mặt"],
  hands: ["hands", "/hændz/", "đôi tay"], soap: ["soap", "/səʊp/", "xà phòng"], rinse: ["rinse", "/rɪns/", "tráng, súc (bằng nước sạch)"],
  mouth: ["mouth", "/maʊθ/", "miệng"], clean: ["clean", "/kliːn/", "lau chùi; sạch"], sink: ["sink", "/sɪŋk/", "bồn rửa mặt"], sponge: ["sponge", "/spʌndʒ/", "miếng bọt biển"],
  toothpaste: ["toothpaste", "/ˈtuːθ.peɪst/", "kem đánh răng"], toothbrush: ["toothbrush", "/ˈtuːθ.brʌʃ/", "bàn chải đánh răng"], squeeze: ["squeeze", "/skwiːz/", "nặn, bóp"],
  brush: ["brush", "/brʌʃ/", "chải, đánh (răng)"], teeth: ["teeth", "/tiːθ/", "răng (số nhiều của tooth)"], wipe: ["wipe", "/waɪp/", "lau"],
  mirror: ["mirror", "/ˈmɪr.ər/", "cái gương"], foggy: ["foggy", "/ˈfɒɡ.i/", "mờ hơi nước"], comb: ["comb", "/kəʊm/", "chải (bằng lược); cái lược"],
  hair: ["hair", "/heər/", "tóc"], hairbrush: ["hairbrush", "/ˈheə.brʌʃ/", "lược chải tóc"], dry: ["dry", "/draɪ/", "làm khô, sấy; khô"],
  hairdryer: ["hair dryer", "/ˈheə ˌdraɪ.ər/", "máy sấy tóc"], shower: ["shower", "/ʃaʊər/", "vòi sen; tắm vòi sen"], take: ["take a shower", "/teɪk ə ʃaʊər/", "tắm vòi sen"],
  shampoo: ["shampoo", "/ʃæmˈpuː/", "dầu gội"], towel: ["towel", "/ˈtaʊ.əl/", "khăn tắm"], myself: ["myself", "/maɪˈself/", "bản thân tôi"],
  pickup: ["pick up", "/pɪk ʌp/", "nhặt lên"], floor: ["floor", "/flɔːr/", "sàn nhà"], hangup: ["hang up", "/hæŋ ʌp/", "treo lên"], rail: ["towel rail", "/ˈtaʊ.əl reɪl/", "giá treo khăn"],
  clothes: ["clothes", "/kləʊðz/", "quần áo"], dirty: ["dirty", "/ˈdɜː.ti/", "bẩn"], basket: ["laundry basket", "/ˈlɔːn.dri ˌbɑː.skɪt/", "giỏ đồ giặt"],
  open: ["open", "/ˈəʊ.pən/", "mở"], close: ["close", "/kləʊz/", "đóng"], cabinet: ["bathroom cabinet", "/ˈbɑːθ.ruːm ˌkæb.ɪ.nət/", "tủ phòng tắm"],
  replace: ["replace", "/rɪˈpleɪs/", "thay (cái mới)"], toiletpaper: ["toilet paper", "/ˈtɔɪ.lət ˌpeɪ.pər/", "giấy vệ sinh"], roll: ["roll", "/rəʊl/", "cuộn"],
  flush: ["flush", "/flʌʃ/", "xả nước (bồn cầu)"], toilet: ["toilet", "/ˈtɔɪ.lət/", "bồn cầu"], toiletbrush: ["toilet brush", "/ˈtɔɪ.lət brʌʃ/", "chổi cọ bồn cầu"],
  straighten: ["straighten", "/ˈstreɪ.tən/", "làm cho thẳng, kéo phẳng"], bathmat: ["bath mat", "/ˈbɑːθ mæt/", "thảm nhà tắm"], scrub: ["scrub", "/skrʌb/", "cọ, chà"],
  bathtub: ["bathtub", "/ˈbɑːθ.tʌb/", "bồn tắm"]
};
const baA = mkAct(BAV);
const baTapOn = W => W.ba_tap !== "on" ? [["walk", "ba_sink"], ["pose", "reach", 350], ["set", "ba_tap", "on"]] : [];

const bathroomActions = [
  baA("turn_on_bathroom_light", "bathlight", "Turn on the light", "Bật đèn", "I'm turning on the bathroom light.", "Tôi đang bật đèn phòng tắm.", ["turning", "light"], ["turnon", "light", "switch"],
    "<b>turn on</b> = bật (đèn, máy). Có thể nói <b>switch on</b> the light — nghĩa giống nhau.", ["I'm turning on", "the bathroom light."], ["light", "late", "right"],
    ["I'm turning on the <b>fan</b>.", "I'm turning on the <b>heater</b>."],
    W => W.ba_light === "on" ? "Đèn phòng tắm đang bật rồi." : null,
    W => [["walk", "ba_switch"], ["pose", "point", 450], ["set", "ba_light", "on"], ["pose", "idle", 1]],
    ["turn on the light", "switch on the bathroom light", "bật đèn phòng tắm"]),
  baA("turn_off_bathroom_light", "bathlight", "Turn off the light", "Tắt đèn", "I'm turning off the bathroom light.", "Tôi đang tắt đèn phòng tắm.", ["turning", "off", "light"], ["turnoff", "light", "switch"],
    "<b>turn off</b> ↔ <b>turn on</b>. Ra khỏi phòng nhớ tắt đèn để <b>save electricity</b> (tiết kiệm điện).", ["I'm turning off", "the bathroom light."], ["off", "of", "oft"],
    ["I'm turning off the <b>radio</b>.", "I'm turning off the <b>computer</b>."],
    W => W.ba_light === "off" ? "Đèn phòng tắm đang tắt." : null,
    W => [["walk", "ba_switch"], ["pose", "point", 450], ["set", "ba_light", "off"], ["pose", "idle", 1]],
    ["turn off the light", "switch off the bathroom light", "tắt đèn phòng tắm"]),
  baA("turn_on_tap", "washbasin", "Turn on the tap", "Mở vòi nước", "I'm turning on the tap.", "Tôi đang mở vòi nước.", ["turning", "tap"], ["turnon", "tap", "faucet"],
    "<b>tap</b> (Anh-Anh) = <b>faucet</b> (Anh-Mỹ) = vòi nước. Tiếng Việt nói “mở vòi”, tiếng Anh dùng <b>turn on</b> the tap.", ["I'm turning on", "the tap."], ["tap", "top", "tip"],
    ["I'm turning on the <b>shower</b>.", "I'm turning on the <b>hot water</b>."],
    W => W.ba_tap === "on" ? "Vòi nước đang chảy rồi." : null,
    W => [["walk", "ba_sink"], ["pose", "reach", 450], ["set", "ba_tap", "on"], ["pose", "idle", 1]],
    ["turn on the tap", "turn on the tap at the sink", "mở vòi nước ở bồn rửa"]),
  baA("turn_off_tap", "washbasin", "Turn off the tap", "Khoá vòi nước", "I'm turning off the tap.", "Tôi đang khoá vòi nước.", ["turning", "off", "tap"], ["turnoff", "tap", "save"],
    "<b>turn off</b> the tap = khoá vòi. Thói quen tốt: <b>turn off the tap while you brush your teeth</b> để <b>save water</b>.", ["I'm turning off", "the tap."], ["tap", "tab", "tape"],
    ["I'm turning off the <b>shower</b>.", "I'm turning off the <b>water</b>."],
    W => W.ba_tap !== "on" ? "Vòi nước đang khoá rồi." : null,
    W => [["walk", "ba_sink"], ["pose", "reach", 450], ["set", "ba_tap", "off"], ["pose", "idle", 1]],
    ["turn off the tap", "turn off the tap to save water", "khoá vòi nước"]),
  baA("wash_face", "washbasin", "Wash my face", "Rửa mặt", "I'm washing my face.", "Tôi đang rửa mặt.", ["washing", "face"], ["wash", "face", "water"],
    "Dùng tính từ sở hữu: wash <b>my</b> face (không nói “wash the face”). wash → washing.", ["I'm washing", "my face."], ["face", "faith", "phase"],
    ["I'm washing my <b>hands</b>.", "I'm washing my <b>hair</b>."],
    W => W.ba_face === "washed" ? "Bạn vừa rửa mặt xong rồi." : null,
    W => [...baTapOn(W), ["walk", "ba_sink"], ["pose", "bend", 500], ["pose", "wipe", 1300], ["set", "ba_face", "washed"], ["pose", "idle", 1]],
    ["wash my face", "wash my face with cool water", "rửa mặt"]),
  baA("rinse_mouth", "washbasin", "Rinse my mouth", "Súc miệng", "I'm rinsing my mouth.", "Tôi đang súc miệng.", ["rinsing", "mouth"], ["rinse", "mouth", "water"],
    "<b>rinse</b> = tráng/súc bằng nước sạch. rinse → rins<b>ing</b> (bỏ e rồi thêm -ing).", ["I'm rinsing", "my mouth."], ["rinse", "rice", "rains"],
    ["I'm rinsing <b>the cup</b>.", "I'm rinsing <b>my toothbrush</b>."],
    W => W.ba_mouth !== "foamy" ? "Bạn cần đánh răng trước rồi mới súc miệng (Brush my teeth)." : null,
    W => [...baTapOn(W), ["walk", "ba_sink"], ["pose", "drink", 700], ["pose", "bend", 700], ["set", "ba_mouth", "clean"], ["pose", "idle", 1]],
    ["rinse my mouth", "rinse my mouth with water", "súc miệng"]),
  baA("clean_sink", "washbasin", "Clean the sink", "Lau bồn rửa mặt", "I'm cleaning the sink.", "Tôi đang lau bồn rửa mặt.", ["cleaning", "sink"], ["clean", "sink", "sponge"],
    "<b>clean</b> vừa là động từ (lau chùi) vừa là tính từ (sạch): <i>The sink is clean now.</i>", ["I'm cleaning", "the sink."], ["sink", "think", "sing"],
    ["I'm cleaning <b>the mirror</b>.", "I'm cleaning <b>the bathtub</b>."],
    W => W.ba_sink === "clean" ? "Bồn rửa mặt đã sạch rồi." : null,
    W => [["walk", "ba_sink"], ["spawn", "ba_sponge"], ["pose", "bend", 400], ["pose", "wipe", 1400], ["despawn"], ["set", "ba_sink", "clean"], ["pose", "idle", 1]],
    ["clean the sink", "clean the sink with a sponge", "lau bồn rửa mặt"]),
  baA("wash_hands_with_soap", "soap", "Wash my hands with soap", "Rửa tay bằng xà phòng", "I'm washing my hands with soap.", "Tôi đang rửa tay bằng xà phòng.", ["washing", "hands", "soap"], ["wash", "hands", "soap"],
    "<b>with</b> + dụng cụ/chất: with soap = bằng xà phòng. hand → hand<b>s</b> (hai bàn tay).", ["I'm washing my hands", "with soap."], ["soap", "soup", "sope"],
    ["I'm washing my hands with <b>warm water</b>.", "I'm washing my face with <b>soap</b>."],
    W => W.ba_hands === "clean" ? "Tay bạn vừa được rửa sạch rồi." : null,
    W => [...baTapOn(W), ["walk", "ba_soap"], ["pose", "reach", 400], ["pose", "wipe", 1500], ["set", "ba_hands", "clean"], ["pose", "idle", 1]],
    ["wash my hands", "wash my hands with soap", "rửa tay bằng xà phòng"]),
  baA("put_toothpaste", "toothbrush", "Put toothpaste on my toothbrush", "Nặn kem lên bàn chải", "I'm putting toothpaste on my toothbrush.", "Tôi đang nặn kem đánh răng lên bàn chải.", ["putting", "toothpaste", "toothbrush"], ["toothpaste", "toothbrush", "squeeze"],
    "<b>put … on …</b> = cho/đặt … lên …. toothpaste là danh từ không đếm được: <b>some</b> toothpaste (không nói “a toothpaste”).", ["I'm putting toothpaste", "on my toothbrush."], ["paste", "past", "pace"],
    ["I'm putting <b>butter</b> on my <b>bread</b>.", "I'm putting <b>cream</b> on my <b>face</b>."],
    W => W.ba_brush === "paste" ? "Bàn chải đã có kem đánh răng rồi." : null,
    W => [["walk", "ba_toothbrush"], ["pose", "reach", 400], ["spawn", "ba_brushP"], ["pose", "pour", 800], ["set", "ba_brush", "paste"], ["despawn"], ["pose", "idle", 1]],
    ["put toothpaste on my toothbrush", "squeeze some toothpaste onto my toothbrush", "nặn kem đánh răng lên bàn chải"]),
  baA("brush_teeth", "toothbrush", "Brush my teeth", "Đánh răng", "I'm brushing my teeth.", "Tôi đang đánh răng.", ["brushing", "teeth"], ["brush", "teeth", "toothbrush"],
    "tooth → <b>teeth</b> (số nhiều bất quy tắc, giống foot → feet). Nói brush <b>my</b> teeth.", ["I'm brushing", "my teeth."], ["teeth", "tease", "tea"],
    ["I'm brushing my <b>hair</b>.", "I'm brushing <b>the dog</b>."],
    W => W.ba_brush !== "paste" ? "Hãy nặn kem lên bàn chải trước (Put toothpaste on my toothbrush)." : null,
    W => [["walk", "ba_toothbrush"], ["pose", "reach", 350], ["spawn", "ba_brushP"], ["walk", "ba_sink"], ["pose", "drink", 1800], ["despawn"], ["set", "ba_brush", "plain"], ["set", "ba_teeth", "brushed"], ["set", "ba_mouth", "foamy"], ["set", "ba_sink", "dirty"], ["pose", "idle", 1]],
    ["brush my teeth", "brush my teeth for two minutes", "đánh răng"]),
  baA("wipe_mirror", "bathmirror", "Wipe the mirror", "Lau gương", "I'm wiping the foggy mirror.", "Tôi đang lau chiếc gương bị mờ hơi nước.", ["wiping", "foggy", "mirror"], ["wipe", "mirror", "foggy"],
    "<b>foggy</b> = mờ (vì hơi nước). wipe → wip<b>ing</b> (bỏ e). Tính từ đứng trước danh từ: the <b>foggy</b> mirror.", ["I'm wiping", "the foggy mirror."], ["foggy", "froggy", "funny"],
    ["I'm wiping the <b>window</b>.", "I'm wiping the <b>wet counter</b>."],
    W => W.ba_mirror === "clean" ? "Gương đang sạch, không bị mờ." : null,
    W => [["walk", "ba_mirror"], ["spawn", "ba_cloth"], ["pose", "reach", 300], ["pose", "wipe", 1400], ["despawn"], ["set", "ba_mirror", "clean"], ["pose", "idle", 1]],
    ["wipe the mirror", "wipe the steam off the mirror", "lau gương bị mờ"]),
  baA("comb_hair", "hairbrush", "Comb my hair", "Chải tóc", "I'm combing my hair.", "Tôi đang chải tóc.", ["combing", "hair"], ["comb", "hair", "hairbrush"],
    "<b>comb</b> đọc /kəʊm/ — chữ <b>b</b> câm (giống thumb, climb). hair là danh từ không đếm được: my hair <b>is</b> neat.", ["I'm combing", "my hair."], ["comb", "come", "calm"],
    ["I'm combing <b>my beard</b>.", "I'm combing <b>my sister's hair</b>."],
    W => W.ba_hair === "wet" ? "Tóc còn ướt — hãy sấy khô trước (Dry my hair)." : W.ba_hair === "neat" ? "Tóc đã gọn gàng rồi." : null,
    W => [["walk", "ba_hairbrush"], ["pose", "reach", 350], ["spawn", "ba_comb"], ["walk", "ba_mirror"], ["pose", "drink", 1500], ["despawn"], ["set", "ba_hair", "neat"], ["pose", "idle", 1]],
    ["comb my hair", "comb my hair in front of the mirror", "chải tóc"]),
  baA("dry_hair", "hairdryer", "Dry my hair", "Sấy tóc", "I'm drying my hair with the hair dryer.", "Tôi đang sấy tóc bằng máy sấy.", ["drying", "hair", "dryer"], ["dry", "hair", "hairdryer"],
    "dry → dry<b>ing</b> (giữ y, thêm -ing). An toàn điện: lau khô người và tay trước khi cầm <b>hair dryer</b>.", ["I'm drying my hair", "with the hair dryer."], ["dry", "try", "die"],
    ["I'm drying my <b>hands</b>.", "I'm drying <b>the dishes</b>."],
    W => W.ba_hair !== "wet" ? "Tóc đang khô, không cần sấy." : W.ba_body === "wet" ? "Hãy lau khô người trước khi dùng máy sấy (an toàn điện) — Dry myself with a towel." : null,
    W => [["walk", "ba_dryer"], ["pose", "reach", 400], ["spawn", "ba_dryerP"], ["pose", "drink", 1800], ["despawn"], ["set", "ba_hair", "messy"], ["pose", "idle", 1]],
    ["dry my hair", "dry my hair with the hair dryer", "sấy tóc"]),
  baA("take_a_shower", "shower", "Take a shower", "Tắm vòi sen", "I'm taking a shower.", "Tôi đang tắm vòi sen.", ["taking", "shower"], ["take", "shower", "water"],
    "Cụm cố định: <b>take a shower</b> = tắm vòi sen (Anh-Anh cũng nói <b>have a shower</b>). take → tak<b>ing</b>.", ["I'm taking", "a shower."], ["shower", "flower", "power"],
    ["I'm taking <b>a bath</b>.", "I'm taking <b>a quick shower</b>."],
    W => W.ba_shower === "on" ? "Vòi sen đang chạy rồi." : null,
    W => [["walk", "ba_shower"], ["pose", "reach", 450], ["set", "ba_shower", "on"], ["wait", 900], ["pose", "drink", 900], ["set", "ba_body", "wet"], ["set", "ba_mirror", "foggy"], ["pose", "idle", 1]],
    ["take a shower", "take a warm shower", "tắm vòi sen"]),
  baA("wash_hair", "shower", "Wash my hair", "Gội đầu", "I'm washing my hair with shampoo.", "Tôi đang gội đầu bằng dầu gội.", ["washing", "hair", "shampoo"], ["wash", "hair", "shampoo"],
    "Tiếng Việt “gội đầu” → tiếng Anh <b>wash my hair</b> (không nói “wash my head”).", ["I'm washing my hair", "with shampoo."], ["shampoo", "champion", "shampain"],
    ["I'm washing my hair with <b>conditioner</b>.", "I'm washing my <b>face</b> with <b>soap</b>."],
    W => W.ba_shower !== "on" ? "Hãy mở vòi sen trước (Take a shower)." : W.ba_hair === "wet" ? "Bạn vừa gội đầu xong rồi." : null,
    W => [["walk", "ba_shower"], ["spawn", "ba_shampoo"], ["pose", "reach", 400], ["despawn"], ["pose", "drink", 1700], ["set", "ba_hair", "wet"], ["pose", "idle", 1]],
    ["wash my hair", "wash my hair with shampoo", "gội đầu"]),
  baA("turn_off_shower", "shower", "Turn off the shower", "Tắt vòi sen", "I'm turning off the shower.", "Tôi đang tắt vòi sen.", ["turning", "off", "shower"], ["turnoff", "shower", "save"],
    "<b>turn off</b> the shower = tắt vòi sen. Câu khuyên: <b>Don't leave the shower running.</b>", ["I'm turning off", "the shower."], ["shower", "show", "sure"],
    ["I'm turning off the <b>tap</b>.", "I'm turning off the <b>hair dryer</b>."],
    W => W.ba_shower !== "on" ? "Vòi sen đang tắt." : null,
    W => [["walk", "ba_shower"], ["pose", "reach", 450], ["set", "ba_shower", "off"], ["pose", "idle", 1]],
    ["turn off the shower", "turn off the shower to save water", "tắt vòi sen"]),
  baA("dry_off_with_towel", "towel", "Dry myself with a towel", "Lau khô người", "I'm drying myself with a towel.", "Tôi đang lau khô người bằng khăn tắm.", ["drying", "myself", "towel"], ["dry", "myself", "towel"],
    "<b>myself</b> là đại từ phản thân: tự làm cho chính mình. dry <b>myself</b> = lau khô người tôi.", ["I'm drying myself", "with a towel."], ["towel", "tower", "tool"],
    ["I'm drying <b>my hands</b> with a towel.", "I'm drying <b>my face</b> with a <b>small towel</b>."],
    W => W.ba_body !== "wet" ? "Người bạn đang khô rồi." : W.ba_shower === "on" ? "Hãy tắt vòi sen trước (Turn off the shower)." : W.ba_towel === "floor" ? "Khăn đang nằm dưới sàn — hãy nhặt lên trước (Pick up the towel)." : null,
    W => [...(W.ba_towel === "rail" ? [["walk", "ba_towelRail"], ["pose", "reach", 400], ["spawn", "ba_towelP"]] : []), ["pose", "wipe", 1500], ["despawn"], ["set", "ba_body", "dry"], ["set", "ba_towel", "rail"], ["walk", "ba_towelRail"], ["pose", "reach", 350], ["pose", "idle", 1]],
    ["dry myself with a towel", "dry myself with a soft towel", "lau khô người bằng khăn"]),
  baA("pick_up_towel", "towel", "Pick up the towel", "Nhặt khăn lên", "I'm picking up the towel from the floor.", "Tôi đang nhặt chiếc khăn dưới sàn lên.", ["picking", "up", "towel"], ["pickup", "towel", "floor"],
    "<b>pick up</b> = nhặt lên. Tân ngữ có thể đứng giữa: pick <b>it</b> up / pick up <b>the towel</b>.", ["I'm picking up the towel", "from the floor."], ["pick", "peak", "pack"],
    ["I'm picking up <b>my socks</b> from the floor.", "I'm picking up <b>the soap</b>."],
    W => W.ba_towel !== "floor" ? "Khăn không nằm dưới sàn." : null,
    W => [["walk", "ba_towelFloor"], ["pose", "bend", 600], ["set", "ba_towel", "hand"], ["spawn", "ba_towelP"], ["pose", "idle", 1]],
    ["pick up the towel", "pick up the wet towel from the floor", "nhặt khăn dưới sàn lên"]),
  baA("hang_up_towel", "towel", "Hang up the towel", "Treo khăn lên", "I'm hanging up the towel on the towel rail.", "Tôi đang treo khăn lên giá treo khăn.", ["hanging", "up", "towel"], ["hangup", "towel", "rail"],
    "<b>hang up</b> = treo lên. hang → hang<b>ing</b>. Treo lên giá dùng giới từ <b>on</b>: on the towel rail.", ["I'm hanging up the towel", "on the towel rail."], ["hang", "hung", "hand"],
    ["I'm hanging up <b>my coat</b>.", "I'm hanging up <b>the shirt</b> in the wardrobe."],
    W => W.ba_towel === "rail" ? "Khăn đã ở trên giá treo rồi." : W.ba_towel !== "hand" ? "Hãy nhặt khăn lên trước (Pick up the towel)." : null,
    W => [["walk", "ba_towelRail"], ["pose", "reach", 600], ["despawn"], ["set", "ba_towel", "rail"], ["pose", "idle", 1]],
    ["hang up the towel", "hang up the towel so it can dry", "treo khăn lên"]),
  baA("put_clothes_in_basket", "laundrybasket", "Put dirty clothes in the basket", "Bỏ đồ bẩn vào giỏ", "I'm putting my dirty clothes in the laundry basket.", "Tôi đang bỏ quần áo bẩn vào giỏ đồ giặt.", ["putting", "clothes", "basket"], ["clothes", "dirty", "basket"],
    "<b>clothes</b> luôn ở dạng số nhiều (my clothes <b>are</b> dirty). Đọc /kləʊðz/, gần giống “close”.", ["I'm putting my dirty clothes", "in the laundry basket."], ["clothes", "cloths", "close"],
    ["I'm putting my <b>socks</b> in the <b>washing machine</b>.", "I'm putting the <b>towels</b> in the laundry basket."],
    W => W.ba_clothes === "basket" ? "Quần áo bẩn đã ở trong giỏ rồi." : null,
    W => [["walk", "ba_clothes"], ["pose", "bend", 600], ["spawn", "ba_clothesP"], ["set", "ba_clothes", "hand"], ["walk", "ba_basket"], ["pose", "reach", 500], ["despawn"], ["set", "ba_clothes", "basket"], ["pose", "idle", 1]],
    ["put my dirty clothes in the basket", "put my dirty clothes in the laundry basket", "bỏ quần áo bẩn vào giỏ"]),
  baA("open_bathroom_cabinet", "bathcabinet", "Open the cabinet", "Mở tủ", "I'm opening the bathroom cabinet.", "Tôi đang mở tủ phòng tắm.", ["opening", "cabinet"], ["open", "cabinet"],
    "open → open<b>ing</b> (trọng âm ở âm đầu nên không gấp đôi n).", ["I'm opening", "the bathroom cabinet."], ["cabinet", "cabin", "carpet"],
    ["I'm opening <b>the drawer</b>.", "I'm opening <b>the window</b>."],
    W => W.ba_cabinet === "open" ? "Tủ đang mở rồi." : null,
    W => [["walk", "ba_cabinet"], ["pose", "reach", 500], ["set", "ba_cabinet", "open"], ["pose", "idle", 1]],
    ["open the cabinet", "open the bathroom cabinet", "mở tủ phòng tắm"]),
  baA("close_bathroom_cabinet", "bathcabinet", "Close the cabinet", "Đóng tủ", "I'm closing the bathroom cabinet.", "Tôi đang đóng tủ phòng tắm.", ["closing", "cabinet"], ["close", "cabinet"],
    "close → clos<b>ing</b> (bỏ e). close (động từ) đọc /kləʊz/ với âm /z/.", ["I'm closing", "the bathroom cabinet."], ["close", "clothes", "cross"],
    ["I'm closing <b>the door</b>.", "I'm closing <b>the shower curtain</b>."],
    W => W.ba_cabinet !== "open" ? "Tủ đang đóng." : null,
    W => [["walk", "ba_cabinet"], ["pose", "reach", 500], ["set", "ba_cabinet", "closed"], ["pose", "idle", 1]],
    ["close the cabinet", "close the bathroom cabinet", "đóng tủ phòng tắm"]),
  baA("replace_toilet_paper", "toiletpaper", "Replace the toilet paper", "Thay cuộn giấy vệ sinh", "I'm replacing the toilet paper.", "Tôi đang thay cuộn giấy vệ sinh.", ["replacing", "toilet", "paper"], ["replace", "toiletpaper", "roll"],
    "<b>replace</b> = thay cái cũ bằng cái mới. replace → replac<b>ing</b>. a new <b>roll</b> of toilet paper = một cuộn giấy mới.", ["I'm replacing", "the toilet paper."], ["replace", "replay", "repeat"],
    ["I'm replacing <b>the light bulb</b>.", "I'm replacing <b>the old towel</b>."],
    W => W.ba_paper === "full" ? "Cuộn giấy vẫn còn, chưa cần thay." : W.ba_spare !== "cabinet" ? "Hết giấy dự trữ trong tủ rồi." : W.ba_cabinet !== "open" ? "Cuộn giấy mới để trong tủ — hãy mở tủ trước (Open the cabinet)." : null,
    W => [["walk", "ba_cabinet"], ["pose", "reach", 500], ["spawn", "ba_roll"], ["set", "ba_spare", "used"], ["walk", "ba_paper"], ["pose", "bend", 700], ["despawn"], ["set", "ba_paper", "full"], ["pose", "idle", 1]],
    ["replace the toilet paper", "put a new roll of toilet paper on the holder", "thay cuộn giấy vệ sinh mới"]),
  baA("flush_toilet", "toilet", "Flush the toilet", "Xả nước bồn cầu", "I'm flushing the toilet.", "Tôi đang xả nước bồn cầu.", ["flushing", "toilet"], ["flush", "toilet"],
    "<b>flush</b> = xả nước (bồn cầu). flush → flush<b>ing</b>. Lịch sự: <b>Please flush the toilet.</b>", ["I'm flushing", "the toilet."], ["flush", "flash", "blush"],
    ["I'm <b>cleaning</b> the toilet.", "I'm <b>closing the lid</b> of the toilet."],
    W => W.ba_flush === "on" ? "Bồn cầu đang xả nước." : null,
    W => [["walk", "ba_toilet"], ["pose", "reach", 450], ["set", "ba_flush", "on"], ["wait", 1300], ["set", "ba_flush", "off"], ["pose", "idle", 1]],
    ["flush the toilet", "press the button and flush the toilet", "xả nước bồn cầu"]),
  baA("clean_toilet", "toilet", "Clean the toilet", "Cọ bồn cầu", "I'm cleaning the toilet with a toilet brush.", "Tôi đang cọ bồn cầu bằng chổi cọ.", ["cleaning", "toilet", "brush"], ["clean", "toilet", "toiletbrush"],
    "<b>with a toilet brush</b> = bằng chổi cọ bồn cầu. Mạo từ <b>a</b> vì nhắc lần đầu.", ["I'm cleaning the toilet", "with a toilet brush."], ["toilet", "towel", "tablet"],
    ["I'm cleaning the <b>sink</b> with a <b>sponge</b>.", "I'm cleaning the <b>floor</b> with a <b>mop</b>."],
    W => W.ba_toilet === "clean" ? "Bồn cầu đã sạch sẽ rồi." : null,
    W => [["walk", "ba_toilet"], ["spawn", "ba_tbrush"], ["pose", "bend", 400], ["pose", "sweep", 1400], ["despawn"], ["set", "ba_toilet", "clean"], ["set", "ba_flush", "on"], ["wait", 700], ["set", "ba_flush", "off"], ["pose", "idle", 1]],
    ["clean the toilet", "clean the toilet with a toilet brush", "cọ bồn cầu"]),
  baA("straighten_bath_mat", "bathmat", "Straighten the bath mat", "Kéo phẳng thảm", "I'm straightening the bath mat.", "Tôi đang kéo phẳng tấm thảm nhà tắm.", ["straightening", "mat"], ["straighten", "bathmat"],
    "Hậu tố <b>-en</b> biến tính từ thành động từ: straight (thẳng) → <b>straighten</b> (làm thẳng); short → shorten.", ["I'm straightening", "the bath mat."], ["mat", "mad", "mud"],
    ["I'm straightening <b>the rug</b>.", "I'm straightening <b>the picture</b> on the wall."],
    W => W.ba_mat === "flat" ? "Thảm đã phẳng rồi." : null,
    W => [["walk", "ba_mat"], ["pose", "bend", 1000], ["set", "ba_mat", "flat"], ["pose", "idle", 1]],
    ["straighten the bath mat", "straighten the bath mat so nobody slips", "kéo phẳng thảm nhà tắm"]),
  baA("clean_bathtub", "bathtub", "Scrub the bathtub", "Cọ bồn tắm", "I'm scrubbing the bathtub.", "Tôi đang cọ bồn tắm.", ["scrubbing", "bathtub"], ["scrub", "bathtub", "sponge"],
    "scrub → scrub<b>b</b>ing: một nguyên âm + một phụ âm cuối → gấp đôi phụ âm (run → running).", ["I'm scrubbing", "the bathtub."], ["scrub", "club", "scrap"],
    ["I'm scrubbing <b>the floor</b>.", "I'm scrubbing <b>the pan</b>."],
    W => W.ba_tub === "clean" ? "Bồn tắm đã sạch bóng rồi." : W.ba_shower === "on" ? "Hãy tắt vòi sen trước (Turn off the shower)." : null,
    W => [["walk", "ba_tub"], ["spawn", "ba_sponge"], ["pose", "bend", 400], ["pose", "wipe", 1500], ["despawn"], ["set", "ba_tub", "clean"], ["pose", "idle", 1]],
    ["scrub the bathtub", "scrub the bathtub with a sponge", "cọ bồn tắm"])
];

const BA_PROPS = {
  ba_brushP: `<rect x="-2" y="-30" width="4" height="30" rx="2" fill="#6fb3d9"/><rect x="-3" y="-38" width="6" height="9" rx="2" fill="#fff" stroke="#9fc7e0"/><path d="M-3 -40 q3 -4 6 0" stroke="#7fd0c8" stroke-width="3" fill="none"/>`,
  ba_sponge: `<rect x="-10" y="-9" width="20" height="9" rx="2" fill="#f5d34a"/><rect x="-10" y="-12" width="20" height="4" rx="1.5" fill="#6fb3d9"/>`,
  ba_cloth: `<path d="M-11 0 L-9 -18 L10 -20 L11 0Z" fill="#9fd3f0" stroke="#6fb3d9"/><path d="M-8 -6 h16" stroke="#fff" stroke-width="1.5"/>`,
  ba_comb: `<rect x="-3" y="-30" width="6" height="16" rx="3" fill="#e8743b"/><rect x="-6" y="-44" width="12" height="15" rx="4" fill="#f0884f"/><g stroke="#5a3d1f" stroke-width="1"><path d="M-4 -42 v10 M-1 -42 v10 M2 -42 v10"/></g>`,
  ba_dryerP: `<rect x="-3" y="-22" width="7" height="22" rx="3" fill="#8a6bb3"/><rect x="-6" y="-34" width="28" height="13" rx="6" fill="#a487c8"/><rect x="20" y="-32" width="5" height="9" rx="2" fill="#3a3f46"/><g class="ba-hot" stroke="#fff" stroke-width="1.5"><path d="M28 -30 h6 M28 -27 h8"/></g>`,
  ba_shampoo: `<rect x="-7" y="-26" width="14" height="26" rx="4" fill="#f2b8a4"/><rect x="-3" y="-32" width="6" height="7" fill="#c9705d"/><rect x="-5" y="-16" width="10" height="8" rx="1" fill="#fff" opacity=".8"/>`,
  ba_towelP: `<rect x="-12" y="-26" width="24" height="26" rx="3" fill="#f2a08a"/><rect x="-12" y="-20" width="24" height="3" fill="#fff"/><rect x="-12" y="-8" width="24" height="3" fill="#fff"/>`,
  ba_clothesP: `<path d="M-14 0 Q-16 -14 -8 -20 L8 -22 Q16 -14 14 0Z" fill="#6fb3d9"/><path d="M-10 -8 Q0 -14 10 -8" stroke="#e8743b" stroke-width="4" fill="none"/>`,
  ba_roll: `<ellipse cx="0" cy="-10" rx="10" ry="11" fill="#fff" stroke="#d6dde2"/><ellipse cx="0" cy="-10" rx="3" ry="4" fill="#c9a77c"/>`,
  ba_tbrush: `<rect x="-2" y="-34" width="4" height="34" rx="2" fill="#9aa6af"/><ellipse cx="0" cy="2" rx="7" ry="5" fill="#7fc4c0"/>`
};

/* --- BATHROOM drawing.  Back wall row: tub+shower (140-410), switch (425), vanity (430-630), cabinet/shelf/dryer (640-735),
   toilet (742-832), paper holder (850), towel rail (880-980). Floor: bath mat, floor towel, clothes, basket. --- */
const bathroomShell = `
<defs>
 <linearGradient id="baWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf5f3"/><stop offset="1" stop-color="#dcecea"/></linearGradient>
 <linearGradient id="baLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9e0de"/><stop offset="1" stop-color="#d9ebe9"/></linearGradient>
 <linearGradient id="baFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9ecef"/><stop offset="1" stop-color="#d3d9de"/></linearGradient>
 <linearGradient id="baChrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfe6ea"/><stop offset=".5" stop-color="#fbfcfd"/><stop offset="1" stop-color="#bcc7cf"/></linearGradient>
 <linearGradient id="baPorc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2ebef"/></linearGradient>
 <linearGradient id="baGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f6fb"/><stop offset=".55" stop-color="#cbe6f2"/><stop offset="1" stop-color="#b4d8e8"/></linearGradient>
 <linearGradient id="baWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7c9a0"/><stop offset="1" stop-color="#cfa678"/></linearGradient>
 <radialGradient id="baGlow" cx=".5" cy=".2" r=".8"><stop offset="0" stop-color="#fff6d0" stop-opacity=".75"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>
 <filter id="baSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
 <filter id="baBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5"/></filter>
</defs>
<rect x="120" y="0" width="880" height="330" fill="url(#baWall)"/>
<polygon points="0,0 120,0 120,330 0,640" fill="url(#baLeft)"/>
<polygon points="120,330 1000,330 1000,640 0,640" fill="url(#baFloor)"/>
${D("wall-tiles", `<rect x="120" y="150" width="880" height="170" fill="#f4fbfa"/><g stroke="#cfe3e0" stroke-width="1.5">
 <path d="M120 180H1000M120 210H1000M120 240H1000M120 270H1000M120 300H1000"/>
 <path d="M150 150v170M180 150v170M210 150v170M240 150v170M270 150v170M300 150v170M330 150v170M360 150v170M390 150v170M420 150v170M450 150v170M480 150v170M510 150v170M540 150v170M570 150v170M600 150v170M630 150v170M660 150v170M690 150v170M720 150v170M750 150v170M780 150v170M810 150v170M840 150v170M870 150v170M900 150v170M930 150v170M960 150v170M990 150v170"/></g>`)}
${D("tile-border", `<rect x="120" y="144" width="880" height="8" fill="#7fc4c0"/><g fill="#fffdf9"><circle cx="160" cy="148" r="1.6"/><circle cx="260" cy="148" r="1.6"/><circle cx="360" cy="148" r="1.6"/><circle cx="460" cy="148" r="1.6"/><circle cx="560" cy="148" r="1.6"/><circle cx="660" cy="148" r="1.6"/><circle cx="760" cy="148" r="1.6"/><circle cx="860" cy="148" r="1.6"/><circle cx="960" cy="148" r="1.6"/></g>`)}
${D("floor-tiles", `<g stroke="#b9c3ca" stroke-opacity=".6"><line x1="120" y1="330" x2="0" y2="640"/><line x1="260" y1="330" x2="190" y2="640"/><line x1="400" y1="330" x2="380" y2="640"/><line x1="540" y1="330" x2="570" y2="640"/><line x1="680" y1="330" x2="760" y2="640"/><line x1="820" y1="330" x2="950" y2="640"/>
 <line x1="96" y1="385" x2="1000" y2="385"/><line x1="70" y1="450" x2="1000" y2="450"/><line x1="40" y1="530" x2="1000" y2="530"/><line x1="8" y1="620" x2="1000" y2="620"/></g>
 <g fill="#9fd3cf" opacity=".22"><polygon points="260,330 400,330 396,385 245,385"/><polygon points="540,385 680,385 702,450 548,450"/><polygon points="380,450 548,450 556,530 360,530"/><polygon points="702,450 860,450 890,530 724,530"/></g>`)}
${D("baseboard", `<rect x="120" y="320" width="880" height="10" fill="#bcd8d4"/><polygon points="120,320 120,330 0,640 0,605" fill="#a9cbc6"/>`)}
${D("crown-molding", `<rect x="120" y="0" width="880" height="8" fill="#d6ebe8"/><rect x="120" y="8" width="880" height="3" fill="#b9d6d2"/><polygon points="0,0 120,0 120,11 0,15" fill="#b9d6d2"/>`)}
${D("ceiling-lamp", `<rect x="776" y="0" width="4" height="14" fill="#9aa6af"/><path d="M754 30 Q754 14 778 14 Q802 14 802 30Z" fill="#fffdf9" stroke="#c9d6df"/><ellipse cx="778" cy="31" rx="18" ry="3" fill="#fff6d0"/>`)}
${D("vent-fan", `<rect x="900" y="24" width="44" height="34" rx="4" fill="#fffdf9" stroke="#c9d6df" stroke-width="1.5"/><g stroke="#c9d6df" stroke-width="2"><line x1="906" y1="32" x2="938" y2="32"/><line x1="906" y1="38" x2="938" y2="38"/><line x1="906" y1="44" x2="938" y2="44"/><line x1="906" y1="50" x2="938" y2="50"/></g>`)}
${D("small-window", lw(18, 46, `<rect x="0" y="0" width="120" height="100" rx="8" fill="#d8eef5" stroke="#fffdf9" stroke-width="8"/>
 <g fill="#fff" opacity=".7"><circle cx="24" cy="24" r="10"/><circle cx="60" cy="40" r="14"/><circle cx="92" cy="22" r="9"/><circle cx="34" cy="68" r="12"/><circle cx="86" cy="70" r="13"/></g>
 <line x1="60" y1="4" x2="60" y2="96" stroke="#fffdf9" stroke-width="5"/>`))}
${D("window-plant", lw(18, 46, `<rect x="-6" y="100" width="132" height="8" rx="3" fill="#fffdf9"/><rect x="14" y="84" width="20" height="16" rx="3" fill="#e79a86"/><path d="M18 84 q-8 -14 0 -22 M24 84 q2 -20 8 -24 M30 84 q10 -10 6 -20" stroke="#5fae5a" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="82" y="86" width="16" height="14" rx="3" fill="#7fc4c0"/><ellipse cx="90" cy="82" rx="10" ry="7" fill="#6fb36a"/>`))}
${D("towel-hooks", lw(30, 220, `<rect x="0" y="0" width="110" height="10" rx="4" fill="#cfa678"/><g fill="#9aa6af"><circle cx="20" cy="5" r="4"/><circle cx="55" cy="5" r="4"/><circle cx="90" cy="5" r="4"/></g>`))}
${D("bathrobe", lw(30, 220, `<path d="M8 8 Q20 2 32 8 L40 40 L36 100 Q20 106 4 100 L0 40Z" fill="#fffdf9" stroke="#d6dde2"/><path d="M14 10 L20 40 L26 10" stroke="#d6dde2" stroke-width="2" fill="none"/><rect x="2" y="54" width="36" height="5" fill="#7fc4c0"/>
 <path d="M80 8 Q90 4 100 8 L104 70 Q90 74 76 70Z" fill="#f2a08a"/><rect x="77" y="40" width="26" height="4" fill="#fff"/>`))}
${D("wall-art", `<rect x="868" y="66" width="104" height="70" rx="4" fill="#fffdf9" stroke="#cfa678" stroke-width="5"/><path d="M876 120 Q900 96 922 116 T964 108 L964 128 L876 128Z" fill="#9fd3f0"/><circle cx="944" cy="88" r="8" fill="#f5c45a"/>
 <path d="M898 102 q8 -8 16 0 q-8 8 -16 0z M914 102 l6 -4 v8z" fill="#e8743b"/>`)}
${D("over-toilet-shelf", `<rect x="742" y="148" width="96" height="6" rx="2" fill="#cfa678"/><path d="M752 154 l0 8 l8 -8Z M828 154 l0 8 l-8 -8Z" fill="#b48a5a"/>`)}
${D("folded-towels", `<rect x="748" y="134" width="34" height="7" rx="3" fill="#7fc4c0"/><rect x="750" y="127" width="32" height="7" rx="3" fill="#fffdf9" stroke="#d6dde2"/><rect x="748" y="141" width="34" height="7" rx="3" fill="#f2a08a"/>`)}
${D("candle-jar", `<rect x="790" y="132" width="14" height="16" rx="3" fill="#f6e6c8" stroke="#d9c39a"/><path d="M797 132 v-4" stroke="#3a3f46" stroke-width="1.2"/><path class="ba-flame" d="M797 120 q4 5 0 8 q-4 -3 0 -8z" fill="#ffb347"/>`)}
${D("small-cactus", `<rect x="810" y="136" width="16" height="12" rx="2" fill="#c56b3c"/><rect x="814" y="118" width="8" height="20" rx="4" fill="#5fae5a"/><rect x="808" y="124" width="5" height="9" rx="2.5" fill="#5fae5a"/><rect x="823" y="122" width="5" height="9" rx="2.5" fill="#5fae5a"/><circle cx="818" cy="117" r="2.5" fill="#f2a08a"/>`)}
${D("shower-niche", `<rect x="334" y="164" width="64" height="58" rx="4" fill="#d6ebe8" stroke="#bcd8d4" stroke-width="2"/><rect x="334" y="194" width="64" height="4" fill="#bcd8d4"/>`)}
${D("shampoo-bottles", `<rect x="340" y="172" width="12" height="22" rx="3" fill="#f2b8a4"/><rect x="343" y="167" width="6" height="6" fill="#c9705d"/><rect x="356" y="176" width="11" height="18" rx="3" fill="#8cc08a"/><rect x="358" y="171" width="7" height="6" fill="#4c9a49"/><rect x="372" y="174" width="12" height="20" rx="3" fill="#9fc7e0"/><rect x="375" y="168" width="6" height="7" fill="#3b6ec2"/>
 <rect x="342" y="204" width="20" height="18" rx="4" fill="#fffdf9" stroke="#d6dde2"/><ellipse cx="380" cy="217" rx="12" ry="5" fill="#f5d34a"/>`)}
${D("grab-bar", `<rect x="196" y="230" width="90" height="6" rx="3" fill="url(#baChrome)" stroke="#9aa6af"/><rect x="192" y="226" width="8" height="14" rx="3" fill="#9aa6af"/><rect x="282" y="226" width="8" height="14" rx="3" fill="#9aa6af"/>`)}
${D("power-outlet", `<rect x="606" y="196" width="14" height="20" rx="3" fill="#fffdf9" stroke="#c9d6df"/><circle cx="613" cy="203" r="1.4" fill="#7a7166"/><circle cx="613" cy="210" r="1.4" fill="#7a7166"/>`)}
${D("wall-clock", `<circle cx="420" cy="62" r="20" fill="#fffdf9" stroke="#7fc4c0" stroke-width="4"/><line class="ba-hourH" x1="420" y1="62" x2="420" y2="51" stroke="#3a3f46" stroke-width="2.5" stroke-linecap="round"/><line class="ba-minH" x1="420" y1="62" x2="430" y2="62" stroke="#3a3f46" stroke-width="2" stroke-linecap="round"/><circle cx="420" cy="62" r="2" fill="#e8743b"/><path d="M412 82 h16" stroke="#9fc7e0" stroke-width="3" stroke-linecap="round"/>`)}
${D("fish-decals", `<g fill="#7fc4c0" opacity=".8"><path d="M640 262 q8 -7 16 0 q-8 7 -16 0z M656 262 l6 -4 v8z"/><path d="M690 290 q7 -6 14 0 q-7 6 -14 0z M704 290 l5 -4 v8z"/></g><g fill="#f2a08a" opacity=".8"><path d="M860 232 q8 -7 16 0 q-8 7 -16 0z M876 232 l6 -4 v8z"/></g><g fill="#fff" stroke="#9fc7e0"><circle cx="664" cy="250" r="2.5"/><circle cx="668" cy="242" r="1.8"/></g>`)}
${D("floor-drain", `<ellipse cx="452" cy="374" rx="12" ry="4" fill="#bcc7cf"/><g stroke="#8a949c" stroke-width="1.2"><line x1="444" y1="374" x2="460" y2="374"/><line x1="447" y1="371.5" x2="457" y2="371.5"/><line x1="447" y1="376.5" x2="457" y2="376.5"/></g>`)}
<rect x="120" y="0" width="880" height="330" fill="url(#baGlow)" opacity=".35" pointer-events="none"/>
`;

const bathroomDecor = [
  D("rubber-duck", `<ellipse cx="380" cy="246" rx="11" ry="8" fill="#f5d34a"/><circle cx="388" cy="238" r="6" fill="#f5d34a"/><path d="M393 238 l6 1 l-6 2z" fill="#e8743b"/><circle cx="389" cy="236" r="1.2" fill="#2d2a26"/>`, 353.2),
  D("bath-candles", `<rect x="146" y="238" width="10" height="16" rx="2" fill="#fbe8d0"/><rect x="158" y="242" width="9" height="12" rx="2" fill="#f2b8a4"/><path d="M151 238 v-3 M162 242 v-3" stroke="#3a3f46" stroke-width="1"/><path class="ba-flame" d="M151 229 q3 4 0 6 q-3 -2 0 -6z M162 233 q3 4 0 6 q-3 -2 0 -6z" fill="#ffb347"/>`, 353.3),
  D("loofah", `<path d="M300 186 v14" stroke="#9aa6af" stroke-width="1.5"/><circle cx="300" cy="208" r="10" fill="#f2a08a"/><g stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"><path d="M292 204 q8 6 16 0 M292 212 q8 -6 16 0"/></g>`, 301),
  D("bath-salts", `<rect x="172" y="236" width="18" height="18" rx="4" fill="#e7f2fb" stroke="#9fc7e0"/><rect x="172" y="244" width="18" height="10" rx="3" fill="#c9b1d6"/><rect x="170" y="232" width="22" height="5" rx="2" fill="#cfa678"/>`, 353.4),
  D("soap-dish-tub", `<path d="M200 252 Q214 260 228 252Z" fill="#7fc4c0"/><ellipse cx="214" cy="249" rx="10" ry="4" fill="#fbe8d0"/>`, 353.5),
  D("vanity-cabinet", `<ellipse cx="528" cy="356" rx="104" ry="6" fill="#000" opacity=".14" filter="url(#baSoft)"/>
   <rect x="436" y="248" width="186" height="104" rx="4" fill="url(#baWood)"/><rect x="426" y="236" width="206" height="14" rx="4" fill="#fbfdfe" stroke="#c9d6df"/>
   <g fill="#e9cfa8" stroke="#b48a5a" stroke-width="1.5"><rect x="446" y="258" width="166" height="20" rx="3"/><rect x="446" y="284" width="80" height="60" rx="3"/><rect x="532" y="284" width="80" height="60" rx="3"/></g>`, 361.5),
  D("vanity-handles", `<g fill="#9aa6af"><rect x="514" y="266" width="30" height="4" rx="2"/><rect x="518" y="302" width="4" height="22" rx="2"/><rect x="536" y="302" width="4" height="22" rx="2"/></g><g fill="#b48a5a"><rect x="440" y="350" width="8" height="5"/><rect x="610" y="350" width="8" height="5"/></g>`, 361.6),
  D("glass-shelf", `<rect x="636" y="196" width="94" height="5" rx="2" fill="#cbe6f2" stroke="#9fc7e0"/><g fill="#9aa6af"><rect x="640" y="200" width="4" height="7" rx="1"/><rect x="722" y="200" width="4" height="7" rx="1"/></g>`, 302),
  D("mouthwash", `<rect x="676" y="176" width="12" height="20" rx="3" fill="#7fd0c8" opacity=".9"/><rect x="678" y="170" width="8" height="7" rx="1" fill="#3f8f87"/><rect x="678" y="182" width="8" height="6" fill="#fff" opacity=".7"/>`, 302.1),
  D("cotton-jar", `<rect x="692" y="180" width="14" height="16" rx="3" fill="#e7f2fb" stroke="#9fc7e0"/><g fill="#fff"><circle cx="696" cy="184" r="3"/><circle cx="702" cy="183" r="3"/><circle cx="699" cy="189" r="3"/></g><rect x="691" y="177" width="16" height="4" rx="1.5" fill="#cfa678"/>`, 302.2),
  D("perfume", `<rect x="710" y="182" width="12" height="14" rx="3" fill="#f3b5a2" opacity=".9"/><rect x="713" y="177" width="6" height="6" fill="#c9b7a2"/><circle cx="716" cy="175" r="2.5" fill="#e79a86"/>`, 302.3),
  D("hand-towel-ring", `<circle cx="446" cy="214" r="9" fill="none" stroke="#9aa6af" stroke-width="2.5"/><path d="M438 220 L454 220 L452 236 L440 236Z" fill="#7fc4c0"/>`, 300.2),
  D("bathroom-scale", `<rect x="372" y="580" width="60" height="16" rx="6" fill="#fffdf9" stroke="#c9d6df" stroke-width="1.5"/><rect x="390" y="583" width="24" height="7" rx="2" fill="#3a3f46"/><text x="402" y="589" text-anchor="middle" font-size="6" font-family="monospace" fill="#8fe28f">55.0</text>`, 596),
  D("pedal-bin", `<ellipse cx="868" cy="384" rx="16" ry="4" fill="#000" opacity=".14"/><path d="M854 352 L882 352 L879 382 L857 382Z" fill="#c9d6df"/><path d="M852 346 Q868 338 884 346 L884 352 L852 352Z" fill="#aeb8c0"/><rect x="862" y="380" width="12" height="4" rx="2" fill="#7a7166"/>`, 384),
  D("toilet-brush-holder", `<path d="M716 350 L734 350 L732 374 L718 374Z" fill="#fffdf9" stroke="#c9d6df"/><rect x="723" y="326" width="4" height="26" rx="2" fill="#7fc4c0"/><circle cx="725" cy="324" r="4" fill="#7fc4c0"/>`, 375),
  D("toilet-rug", `<path d="M736 384 Q786 370 838 384 Q840 402 786 404 Q732 402 736 384Z" fill="#c9b1d6" opacity=".75"/><path d="M748 390 Q786 380 826 390" stroke="#fff" stroke-opacity=".6" stroke-dasharray="4 5" fill="none"/>`, 370),
  D("floor-plant", `<ellipse cx="46" cy="630" rx="30" ry="6" fill="#000" opacity=".18" filter="url(#baSoft)"/><path d="M26 588 L66 588 L60 628 L32 628Z" fill="#fffdf9" stroke="#c9d6df"/><rect x="28" y="600" width="36" height="6" fill="#7fc4c0"/>
   <g><ellipse cx="34" cy="560" rx="12" ry="26" fill="#4c9a49" transform="rotate(-25 34 560)"/><ellipse cx="58" cy="556" rx="12" ry="28" fill="#5fae5a" transform="rotate(22 58 556)"/><ellipse cx="46" cy="548" rx="11" ry="30" fill="#6fb36a"/></g>`, 628),
  D("bath-slippers", `<ellipse cx="404" cy="452" rx="14" ry="6" fill="#f2a08a"/><ellipse cx="430" cy="456" rx="14" ry="6" fill="#f2a08a"/><path d="M394 450 q10 -6 20 0 M420 454 q10 -6 20 0" stroke="#fff" stroke-width="3" fill="none"/>`, 457),
  D("spare-towel-basket", `<ellipse cx="660" cy="370" rx="30" ry="4" fill="#000" opacity=".14"/><path d="M632 338 L688 338 L684 368 L636 368Z" fill="#d9b27a"/><g stroke="#b48a5a" stroke-width="1.2"><path d="M634 346 H686 M635 354 H685 M636 362 H684"/></g>
   <ellipse cx="646" cy="334" rx="9" ry="7" fill="#7fc4c0"/><ellipse cx="662" cy="333" rx="9" ry="7" fill="#fffdf9" stroke="#d6dde2"/><ellipse cx="677" cy="334" rx="9" ry="7" fill="#f2a08a"/>`, 369),
  D("air-freshener", `<rect x="826" y="300" width="12" height="18" rx="3" fill="#c9b1d6"/><rect x="828" y="296" width="8" height="5" rx="1.5" fill="#8a6bb3"/>`, 300.5),
  D("electric-toothbrush", `<rect x="612" y="222" width="12" height="14" rx="3" fill="#fffdf9" stroke="#c9d6df"/><rect x="616" y="196" width="5" height="28" rx="2.5" fill="#fffdf9" stroke="#9fc7e0"/><circle cx="618.5" cy="230" r="1.5" fill="#5fd38a"/>`, 363.8)
];

const bathroomWorld = [
  objG("shower", "shower", "vòi sen", 300, 260, 30, `
   <rect class="hit" x="176" y="40" width="150" height="200"/>
   <rect x="134" y="30" width="282" height="5" rx="2.5" fill="url(#baChrome)" stroke="#9aa6af"/><circle cx="134" cy="32" r="5" fill="#9aa6af"/><circle cx="416" cy="32" r="5" fill="#9aa6af"/>
   <g fill="none" stroke="#9aa6af" stroke-width="1.5"><circle cx="146" cy="36" r="4"/><circle cx="156" cy="36" r="4"/><circle cx="166" cy="36" r="4"/><circle cx="176" cy="36" r="4"/></g>
   <path d="M140 40 L182 40 Q186 120 178 248 Q166 254 156 248 Q148 254 140 248Z" fill="#cfe9f0" opacity=".95"/><path d="M152 42 Q156 140 150 246 M166 42 Q172 140 166 246" stroke="#9fd3e0" stroke-width="2" fill="none"/>
   <g fill="#7fc4c0" opacity=".7"><circle cx="150" cy="80" r="3"/><circle cx="168" cy="110" r="3"/><circle cx="152" cy="150" r="3"/><circle cx="170" cy="190" r="3"/><circle cx="154" cy="220" r="3"/></g>
   <path d="M300 160 L300 66 Q300 56 290 56 L262 56" stroke="url(#baChrome)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M300 160 L300 66 Q300 56 290 56 L262 56" stroke="#9aa6af" stroke-width="1.2" fill="none"/>
   <path d="M266 50 L236 66 L250 82 L272 60Z" fill="#c4cdd4" stroke="#9aa6af"/><ellipse cx="244" cy="76" rx="15" ry="5" fill="#dfe6ea" stroke="#9aa6af" transform="rotate(-32 244 76)"/>
   <circle cx="300" cy="172" r="12" fill="url(#baChrome)" stroke="#9aa6af" stroke-width="1.5"/><rect x="296" y="160" width="8" height="12" rx="2" fill="#9aa6af" class="ba-knob"/><circle cx="292" cy="172" r="2" fill="#e8743b"/><circle cx="308" cy="172" r="2" fill="#3b6ec2"/>
   <g class="ba-showerWater" stroke="#8ccbf0" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="6 10"><path d="M232 84 L214 244"/><path d="M240 86 L230 246"/><path d="M248 86 L246 246"/><path d="M255 82 L262 244"/><path d="M226 80 L200 240"/></g>
   <g class="ba-steam" fill="#fff" opacity=".7" filter="url(#baBlur)"><ellipse cx="220" cy="140" rx="34" ry="16"/><ellipse cx="270" cy="110" rx="30" ry="14"/><ellipse cx="320" cy="140" rx="36" ry="16"/><ellipse cx="250" cy="190" rx="40" ry="16"/></g>`),
  objG("bathtub", "bathtub", "bồn tắm", 352, 275, 238, `
   <rect class="hit" x="134" y="248" width="284" height="110"/>
   <ellipse cx="276" cy="358" rx="140" ry="6" fill="#000" opacity=".14" filter="url(#baSoft)"/>
   <path d="M142 262 L410 262 L403 338 Q400 352 384 352 L166 352 Q150 352 147 338Z" fill="url(#baPorc)" stroke="#c3d3db" stroke-width="1.5"/>
   <rect x="134" y="252" width="284" height="14" rx="7" fill="#fbfdfe" stroke="#c3d3db" stroke-width="1.5"/>
   <path d="M160 300 Q276 314 392 300" stroke="#e2ebef" stroke-width="3" fill="none"/>
   <g fill="#d9b25a"><path d="M160 350 q-6 10 4 10 l6 -10z"/><path d="M392 350 q6 10 -4 10 l-6 -10z"/></g>
   <g class="ba-tubDirt" fill="#b9a98a" opacity=".55"><ellipse cx="200" cy="286" rx="16" ry="3"/><ellipse cx="300" cy="292" rx="22" ry="3"/><ellipse cx="360" cy="284" rx="12" ry="2.5"/><circle cx="246" cy="318" r="3"/><circle cx="330" cy="326" r="2.5"/></g>
   <g class="ba-tubShine">${sparkle(190, 290, 7)}${sparkle(350, 300, 6)}${sparkle(280, 330, 5)}</g>`),
  objG("bathlight", "bathroom light", "đèn phòng tắm", 300.1, 400, 136, `
   <rect class="hit" x="414" y="146" width="36" height="46"/><rect class="hit" x="470" y="34" width="110" height="24"/>
   <rect x="416" y="152" width="22" height="32" rx="3" fill="#fffdf9" stroke="#c9d6df" stroke-width="1.5"/><rect class="ba-toggle" x="423" y="158" width="8" height="10" rx="2" fill="#e6ddd0" stroke="#b9aea0"/>
   <rect x="472" y="40" width="106" height="10" rx="5" fill="url(#baChrome)" stroke="#9aa6af"/>
   <g class="ba-bulbs"><circle cx="490" cy="54" r="6" fill="#efe8d8"/><circle cx="525" cy="54" r="6" fill="#efe8d8"/><circle cx="560" cy="54" r="6" fill="#efe8d8"/></g>
   <g class="ba-lightGlow"><circle cx="490" cy="54" r="6" fill="#fff3b8"/><circle cx="525" cy="54" r="6" fill="#fff3b8"/><circle cx="560" cy="54" r="6" fill="#fff3b8"/><ellipse cx="525" cy="110" rx="120" ry="80" fill="url(#baGlow)"/></g>`),
  objG("bathmirror", "mirror", "cái gương", 301, 525, 98, `
   <rect class="hit" x="468" y="60" width="114" height="122"/>
   <rect x="470" y="62" width="110" height="118" rx="18" fill="#cfa678"/><rect x="477" y="69" width="96" height="104" rx="13" fill="url(#baGlass)"/>
   <path d="M492 104 L516 84 M496 126 L538 92" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75"/>
   <g class="ba-fog"><rect x="477" y="69" width="96" height="104" rx="13" fill="#f4f8fa" opacity=".82"/><g fill="#fff" opacity=".9" filter="url(#baBlur)"><circle cx="500" cy="96" r="14"/><circle cx="546" cy="120" r="18"/><circle cx="510" cy="150" r="14"/></g>
    <g fill="#d6e6ee"><circle cx="492" cy="160" r="1.6"/><circle cx="560" cy="88" r="1.6"/><circle cx="534" cy="158" r="1.4"/><circle cx="552" cy="146" r="1.6"/></g></g>
   <g class="ba-mirrorShine">${sparkle(558, 90, 7)}</g>`),
  objG("bathcabinet", "bathroom cabinet", "tủ phòng tắm", 302.5, 680, 46, `
   <rect class="hit" x="638" y="58" width="86" height="120"/>
   <ellipse cx="680" cy="176" rx="40" ry="3" fill="#000" opacity=".12"/>
   <rect x="640" y="60" width="82" height="114" rx="5" fill="#fffdf9" stroke="#c9d6df" stroke-width="1.5"/><rect x="646" y="66" width="70" height="102" rx="3" fill="#e7f2f2"/>
   <g fill="#c9d6df"><rect x="646" y="98" width="70" height="3"/><rect x="646" y="132" width="70" height="3"/></g>
   <g><rect x="652" y="80" width="10" height="18" rx="2" fill="#e8743b"/><rect x="666" y="84" width="12" height="14" rx="3" fill="#8cc08a"/><rect x="684" y="78" width="8" height="20" rx="2" fill="#9fc7e0"/><rect x="698" y="86" width="12" height="12" rx="2" fill="#f5d34a"/>
    <rect x="652" y="116" width="22" height="16" rx="3" fill="#fffdf9" stroke="#e8743b"/><path d="M660 124 h6 M663 121 v6" stroke="#e8743b" stroke-width="2"/><rect x="680" y="118" width="10" height="14" rx="2" fill="#c9b1d6"/></g>
   <g class="ba-spareRoll"><ellipse cx="702" cy="152" rx="10" ry="11" fill="#fff" stroke="#d6dde2"/><ellipse cx="702" cy="152" rx="3" ry="4" fill="#c9a77c"/></g>
   <rect x="652" y="152" width="16" height="12" rx="2" fill="#7fc4c0"/>
   <g class="ba-cabDoor"><rect x="640" y="60" width="82" height="114" rx="5" fill="url(#baGlass)" stroke="#c9d6df" stroke-width="2"/><rect x="646" y="66" width="70" height="102" rx="3" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
    <path d="M654 90 L670 76 M656 108 L682 84" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/><rect x="712" y="108" width="4" height="18" rx="2" fill="#9aa6af"/></g>`),
  objG("hairbrush", "hairbrush", "lược chải tóc", 302.6, 656, 214, `
   <rect class="hit" x="638" y="172" width="34" height="30"/>
   <rect x="642" y="190" width="18" height="6" rx="3" fill="#e8743b"/><rect x="658" y="191" width="12" height="4" rx="2" fill="#a0703a"/><path d="M644 190 v-3 M648 190 v-3 M652 190 v-3 M656 190 v-3" stroke="#5a3d1f" stroke-width="1"/>
   <rect x="642" y="182" width="26" height="4" rx="1" fill="#3a3f46"/><path d="M644 182 v-3 M648 182 v-3 M652 182 v-3 M656 182 v-3 M660 182 v-3 M664 182 v-3" stroke="#3a3f46" stroke-width="1"/>`),
  objG("hairdryer", "hair dryer", "máy sấy tóc", 303, 690, 300, `
   <rect class="hit" x="690" y="208" width="50" height="58"/>
   <circle cx="714" cy="216" r="7" fill="none" stroke="#9aa6af" stroke-width="3"/>
   <rect x="696" y="222" width="38" height="16" rx="8" fill="#a487c8"/><rect x="732" y="224" width="6" height="12" rx="2" fill="#3a3f46"/><circle cx="702" cy="230" r="5" fill="#8a6bb3"/>
   <rect x="708" y="236" width="10" height="24" rx="4" fill="#8a6bb3"/><rect x="710" y="244" width="6" height="4" rx="1" fill="#fffdf9"/>
   <path d="M713 260 q-4 10 6 12 q10 2 4 10" stroke="#3a3f46" stroke-width="2" fill="none"/>`),
  objG("toothbrush", "toothbrush", "bàn chải đánh răng", 364, 470, 272, `
   <rect class="hit" x="452" y="190" width="56" height="48"/>
   <path d="M456 216 L474 216 L472 236 L458 236Z" fill="#7fc4c0"/><ellipse cx="465" cy="216" rx="9" ry="2.5" fill="#9fd3cf"/>
   <rect x="460" y="198" width="3.5" height="22" rx="1.7" fill="#e8743b" transform="rotate(-8 462 220)"/><rect x="466" y="196" width="3.5" height="24" rx="1.7" fill="#6fb3d9" transform="rotate(6 468 220)"/>
   <rect x="463" y="190" width="5" height="7" rx="1.5" fill="#fff" stroke="#9fc7e0" transform="rotate(6 468 220)"/>
   <g class="ba-paste"><path d="M465 189 q3 -4 7 -1" stroke="#7fd0c8" stroke-width="3.5" fill="none" stroke-linecap="round" transform="rotate(6 468 220)"/></g>
   <path d="M478 236 L478 228 Q478 225 482 225 L500 227 L506 231 L500 235 L482 237Z" fill="#fffdf9" stroke="#9fc7e0"/><rect x="484" y="228" width="10" height="6" rx="1" fill="#e8743b"/><rect x="503" y="229" width="4" height="4" fill="#3b6ec2"/>`),
  objG("washbasin", "sink", "bồn rửa mặt", 363, 528, 178, `
   <rect class="hit" x="486" y="186" width="94" height="62"/>
   <path d="M488 234 Q490 250 528 250 Q566 250 568 234Z" fill="url(#baPorc)" stroke="#c3d3db" stroke-width="1.5"/><ellipse cx="528" cy="234" rx="40" ry="6" fill="#fbfdfe" stroke="#c3d3db"/><ellipse cx="528" cy="235" rx="32" ry="3.5" fill="#d6e6ee"/>
   <path d="M546 236 L546 204 Q546 194 536 194 L528 194 Q522 194 522 200 L522 206" stroke="url(#baChrome)" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M546 236 L546 204 Q546 194 536 194 L528 194 Q522 194 522 200 L522 206" stroke="#9aa6af" stroke-width="1.2" fill="none"/>
   <rect x="550" y="214" width="14" height="5" rx="2" fill="#aeb8c0" class="ba-lever"/>
   <rect class="ba-water" x="519.5" y="207" width="5" height="28" rx="2.5" fill="#8ccbf0"/>
   <g class="ba-sinkDirt" fill="#9fd3cf"><circle cx="506" cy="232" r="2.2"/><circle cx="548" cy="233" r="1.8"/><ellipse cx="530" cy="236" rx="4" ry="1.4"/><circle cx="560" cy="236" r="1.5"/></g>
   <g class="ba-sinkShine">${sparkle(500, 226, 5)}${sparkle(556, 228, 4)}</g>`),
  objG("soap", "soap", "xà phòng", 365, 598, 268, `
   <rect class="hit" x="572" y="198" width="44" height="42"/>
   <path d="M576 236 Q590 244 604 236Z" fill="#7fc4c0"/><rect x="580" y="228" width="20" height="8" rx="4" fill="#f2b8a4"/><path d="M584 230 h10" stroke="#fff" stroke-width="1.5" opacity=".7"/>
   <rect x="596" y="210" width="14" height="24" rx="4" fill="#fbe8d0" stroke="#d9c39a"/><rect x="600" y="202" width="6" height="9" fill="#9aa6af"/><path d="M606 204 h6" stroke="#9aa6af" stroke-width="2.5"/>`),
  objG("toilet", "toilet", "bồn cầu", 372, 787, 196, `
   <rect class="hit" x="738" y="204" width="100" height="172"/>
   <ellipse cx="788" cy="374" rx="40" ry="5" fill="#000" opacity=".15" filter="url(#baSoft)"/>
   <rect x="752" y="214" width="72" height="76" rx="10" fill="url(#baPorc)" stroke="#c3d3db" stroke-width="1.5"/><rect x="748" y="208" width="80" height="10" rx="5" fill="#fbfdfe" stroke="#c3d3db"/>
   <ellipse cx="788" cy="207" rx="9" ry="3" fill="#c9d6df"/><ellipse cx="788" cy="205" rx="6" ry="2" fill="url(#baChrome)" class="ba-flushBtn"/>
   <path d="M760 296 Q764 290 776 289 L800 289 Q812 290 816 296 L812 330 Q806 346 788 346 Q770 346 764 330Z" fill="url(#baPorc)" stroke="#c3d3db" stroke-width="1.5"/>
   <path d="M772 344 L804 344 L808 372 L768 372Z" fill="url(#baPorc)" stroke="#c3d3db" stroke-width="1.5"/>
   <ellipse cx="788" cy="292" rx="34" ry="7" fill="#fbfdfe" stroke="#c3d3db" stroke-width="1.5"/><ellipse cx="788" cy="293" rx="24" ry="4" fill="#d6e6ee"/>
   <g class="ba-swirl" stroke="#6fb3d9" stroke-width="2" fill="none"><path d="M770 293 q18 -6 36 0"/><path d="M776 295 q12 -4 24 0"/></g>
   <g class="ba-toiletDust" fill="#b9b2a2" opacity=".6"><circle cx="768" cy="236" r="2"/><circle cx="806" cy="252" r="1.8"/><circle cx="774" cy="318" r="2"/><circle cx="800" cy="330" r="1.6"/><ellipse cx="788" cy="300" rx="8" ry="1.5"/></g>
   <g class="ba-toiletShine">${sparkle(770, 240, 6)}${sparkle(804, 318, 5)}</g>`),
  objG("toiletpaper", "toilet paper", "giấy vệ sinh", 305, 912, 330, `
   <rect class="hit" x="844" y="268" width="50" height="46"/>
   <rect x="848" y="272" width="6" height="22" rx="2" fill="#9aa6af"/><rect x="852" y="280" width="34" height="4" rx="2" fill="url(#baChrome)" stroke="#9aa6af"/>
   <g class="ba-rollFull"><ellipse cx="872" cy="282" rx="14" ry="13" fill="#fff" stroke="#d6dde2"/><ellipse cx="872" cy="282" rx="4" ry="4" fill="#c9a77c"/><path d="M884 286 L886 310 L874 312 L874 294" fill="#fff" stroke="#d6dde2"/></g>
   <g class="ba-rollEmpty"><ellipse cx="872" cy="282" rx="5" ry="6" fill="#c9a77c" stroke="#a8855a"/><ellipse cx="872" cy="282" rx="2.5" ry="3" fill="#8a6a44"/></g>`),
  objG("towel", "towel", "khăn tắm", 306, 930, 140, `
   <rect x="878" y="146" width="104" height="6" rx="3" fill="url(#baChrome)" stroke="#9aa6af"/><rect x="876" y="142" width="6" height="14" rx="2" fill="#9aa6af"/><rect x="978" y="142" width="6" height="14" rx="2" fill="#9aa6af"/>
   <g class="ba-towelRail"><rect class="hit" x="890" y="146" width="80" height="100"/><path d="M896 150 L964 150 L966 242 L894 242Z" fill="#f2a08a"/><path d="M896 150 L964 150 L963 170 L897 170Z" fill="#e8846c"/>
    <rect x="895" y="200" width="70" height="6" fill="#fff"/><rect x="895" y="212" width="70" height="3" fill="#fff"/><path d="M900 242 v5 M910 242 v5 M920 242 v5 M930 242 v5 M940 242 v5 M950 242 v5 M960 242 v5" stroke="#e8846c" stroke-width="2"/></g>
   <g class="ba-towelFloor"><rect class="hit" x="556" y="552" width="100" height="44"/><ellipse cx="606" cy="590" rx="48" ry="7" fill="#000" opacity=".12"/>
    <path d="M562 586 Q566 562 590 566 Q602 552 618 562 Q646 560 650 584 Q620 596 562 586Z" fill="#f2a08a"/><path d="M572 578 Q600 568 640 578" stroke="#fff" stroke-width="4" fill="none"/><path d="M590 566 Q600 574 618 562" stroke="#e8846c" stroke-width="2" fill="none"/></g>`),
  objG("laundrybasket", "laundry basket", "giỏ đồ giặt", 522, 900, 426, `
   <rect class="hit" x="874" y="430" width="96" height="94"/>
   <ellipse cx="920" cy="522" rx="46" ry="7" fill="#000" opacity=".16" filter="url(#baSoft)"/>
   <g class="ba-clothesIn"><path d="M884 448 Q896 428 912 438 Q926 424 940 436 Q956 432 958 450Z" fill="#6fb3d9"/><path d="M900 444 Q916 432 934 444" stroke="#e8743b" stroke-width="5" fill="none"/><path d="M944 440 l10 -8 l4 6z" fill="#fffdf9"/></g>
   <path d="M878 446 L962 446 L954 520 L886 520Z" fill="#e2c08e"/><rect x="874" y="440" width="92" height="10" rx="4" fill="#cfa678"/>
   <g stroke="#b48a5a" stroke-width="1.5" fill="none"><path d="M881 462 H959 M883 478 H957 M885 494 H955 M886 508 H954"/><path d="M896 450 L898 520 M912 450 L913 520 M928 450 L928 520 M944 450 L942 520"/></g>
   <path d="M904 456 q16 -10 32 0" stroke="#b48a5a" stroke-width="3" fill="none"/>
   <g class="ba-clothesFloor"><rect class="hit" x="696" y="536" width="100" height="42"/><ellipse cx="744" cy="574" rx="48" ry="6" fill="#000" opacity=".1"/>
    <path d="M704 570 L708 548 L724 542 L736 548 L752 544 L758 566 L744 570 L742 556 L720 558 L718 572Z" fill="#6fb3d9"/><path d="M724 542 Q730 550 736 548" stroke="#4f8fb8" stroke-width="2" fill="none"/>
    <path d="M762 566 L770 546 L778 548 L774 562 L790 566 L788 574 L766 574Z" fill="#fffdf9" stroke="#c9d6df"/><path d="M768 556 h8" stroke="#e8743b" stroke-width="2"/></g>`),
  objG("bathmat", "bath mat", "thảm nhà tắm", 381, 270, 368, `
   <rect class="hit" x="176" y="372" width="190" height="48"/>
   <g class="ba-matFlat"><rect x="186" y="378" width="172" height="36" rx="16" fill="#9fd3cf"/><rect x="196" y="384" width="152" height="24" rx="11" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-dasharray="6 6"/>
    <path d="M190 414 v5 M200 414 v5 M210 414 v5 M220 414 v5 M230 414 v5 M240 414 v5 M250 414 v5 M260 414 v5 M270 414 v5 M280 414 v5 M290 414 v5 M300 414 v5 M310 414 v5 M320 414 v5 M330 414 v5 M340 414 v5 M350 414 v5" stroke="#7fc4c0" stroke-width="2"/></g>
   <g class="ba-matCrumpled"><path d="M190 400 Q196 380 220 386 Q240 372 262 392 Q282 378 300 394 Q326 380 352 398 Q350 414 320 410 Q296 420 272 408 Q246 420 222 410 Q196 416 190 400Z" fill="#9fd3cf"/>
    <path d="M220 386 Q232 400 262 392 M300 394 Q306 404 320 410" stroke="#7fc4c0" stroke-width="2.5" fill="none"/></g>`),
  `<g class="ba-dim" data-base="5000" pointer-events="none"><rect x="0" y="0" width="1000" height="640" fill="#1d2a3a"/></g>`,
  ...bathroomDecor
].join("\n");

const bathroomCss = `
#room .ba-water{opacity:0}#room [data-ba_tap="on"] .ba-water{opacity:.9;animation:r2Drip .35s linear infinite}
#room [data-ba_tap="on"] .ba-lever{transform:rotate(-18deg);transform-origin:550px 216px}
#room .ba-paste{display:none}#room [data-ba_brush="paste"] .ba-paste{display:inline}
#room .ba-fog{opacity:0;transition:opacity .8s}#room [data-ba_mirror="foggy"] .ba-fog{opacity:1}
#room .ba-mirrorShine{display:none}#room [data-ba_mirror="clean"] .ba-mirrorShine{display:inline;animation:r2Twinkle 1.6s ease-in-out infinite}
#room .ba-sinkDirt{display:none}#room [data-ba_sink="dirty"] .ba-sinkDirt{display:inline}
#room .ba-sinkShine{display:none}#room [data-ba_sink="clean"] .ba-sinkShine{display:inline;animation:r2Twinkle 1.8s ease-in-out infinite}
#room .ba-showerWater,#room .ba-steam{display:none}#room [data-ba_shower="on"] .ba-showerWater{display:inline;animation:r2Flow .4s linear infinite}
#room [data-ba_shower="on"] .ba-steam{display:inline;animation:r2Steam 2.6s ease-in-out infinite}#room [data-ba_mirror="foggy"][data-ba_shower="off"] .ba-steam{display:inline;opacity:.25}
#room [data-ba_shower="on"] .ba-knob{transform:rotate(60deg);transform-origin:300px 172px}
#room .ba-towelRail,#room .ba-towelFloor{display:none}#room [data-ba_towel="rail"] .ba-towelRail{display:inline}#room [data-ba_towel="floor"] .ba-towelFloor{display:inline}
#room .ba-clothesFloor,#room .ba-clothesIn{display:none}#room [data-ba_clothes="floor"] .ba-clothesFloor{display:inline}#room [data-ba_clothes="basket"] .ba-clothesIn{display:inline}
#room .ba-cabDoor{transform-origin:640px 0;transition:transform .5s}#room [data-ba_cabinet="open"] .ba-cabDoor{transform:scaleX(.08)}
#room .ba-spareRoll{display:none}#room [data-ba_spare="cabinet"] .ba-spareRoll{display:inline}
#room .ba-rollFull{display:none}#room [data-ba_paper="full"] .ba-rollFull{display:inline}#room [data-ba_paper="full"] .ba-rollEmpty{display:none}
#room .ba-swirl{display:none}#room [data-ba_flush="on"] .ba-swirl{display:inline;animation:r2Pulse .4s ease-in-out infinite}
#room [data-ba_flush="on"] .ba-flushBtn{fill:#7fc4c0}
#room .ba-toiletDust{display:none}#room [data-ba_toilet="dusty"] .ba-toiletDust{display:inline}
#room .ba-toiletShine{display:none}#room [data-ba_toilet="clean"] .ba-toiletShine{display:inline;animation:r2Twinkle 1.7s ease-in-out infinite}
#room .ba-matFlat{display:none}#room [data-ba_mat="flat"] .ba-matFlat{display:inline}#room [data-ba_mat="flat"] .ba-matCrumpled{display:none}
#room .ba-tubDirt{display:none}#room [data-ba_tub="dirty"] .ba-tubDirt{display:inline}
#room .ba-tubShine{display:none}#room [data-ba_tub="clean"] .ba-tubShine{display:inline;animation:r2Twinkle 1.9s ease-in-out infinite}
#room .ba-lightGlow{opacity:0;transition:opacity .3s}#room [data-ba_light="on"] .ba-lightGlow{opacity:1}
#room [data-ba_light="on"] .ba-toggle{transform:translateY(8px)}
#room .ba-dim{opacity:.16;transition:opacity .4s;pointer-events:none}#room [data-ba_light="on"] .ba-dim{opacity:0}
#room [data-detail]{pointer-events:none}
#room .ba-hourH{transform-origin:420px 62px;animation:r2Spin 600s linear infinite}#room .ba-minH{transform-origin:420px 62px;animation:r2Spin 50s linear infinite}
#room .ba-flame{animation:r2Pulse 1.2s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){#room [data-detail] *,#room [class^="ba-"]{animation:none!important;transition:none!important}}
${sharedKeyframes}
`;

const BA_W0 = { ba_light: "off", ba_tap: "off", ba_mirror: "foggy", ba_brush: "plain", ba_teeth: "unbrushed", ba_mouth: "clean", ba_face: "sleepy", ba_hands: "dirty",
  ba_sink: "dirty", ba_shower: "off", ba_body: "dry", ba_hair: "messy", ba_towel: "floor", ba_clothes: "floor", ba_cabinet: "closed", ba_paper: "empty",
  ba_spare: "cabinet", ba_flush: "off", ba_toilet: "dusty", ba_mat: "crumpled", ba_tub: "dirty" };

const bathroom = {
  id: "bathroom", name: "Bathroom", nameVi: "Phòng tắm",
  shellSvg: bathroomShell, worldSvg: bathroomWorld, W0: BA_W0,
  spots: {
    ba_shower: { x: 250, y: 398, d: -1 }, ba_tub: { x: 330, y: 396, d: -1 }, ba_switch: { x: 405, y: 396, d: -1 }, ba_toothbrush: { x: 470, y: 396, d: -1 },
    ba_sink: { x: 525, y: 398, d: 1 }, ba_mirror: { x: 530, y: 396, d: 1 }, ba_soap: { x: 590, y: 396, d: 1 }, ba_cabinet: { x: 662, y: 396, d: 1 },
    ba_hairbrush: { x: 648, y: 398, d: 1 }, ba_dryer: { x: 700, y: 398, d: 1 }, ba_toilet: { x: 716, y: 404, d: 1 }, ba_paper: { x: 852, y: 402, d: 1 },
    ba_towelRail: { x: 928, y: 398, d: 1 }, ba_towelFloor: { x: 540, y: 600, d: 1 }, ba_clothes: { x: 680, y: 584, d: 1 }, ba_basket: { x: 846, y: 500, d: 1 },
    ba_mat: { x: 280, y: 452, d: -1 }, ba_door: { x: 470, y: 612, d: 1 }
  },
  obstacles: [{ x1: 736, x2: 840, y1: 340, y2: 398 }, { x1: 872, x2: 972, y1: 432, y2: 528 }, { x1: 0, x2: 82, y1: 596, y2: 640 }, { x1: 364, x2: 440, y1: 574, y2: 600 }],
  entry: { x: 470, y: 600, d: -1 },
  objects: {
    washbasin: { en: "sink", vi: "bồn rửa mặt", ipa: "/sɪŋk/", acts: ["turn_on_tap", "turn_off_tap", "wash_face", "rinse_mouth", "clean_sink", "wash_hands_with_soap"] },
    soap: { en: "soap", vi: "xà phòng", ipa: "/səʊp/", acts: ["wash_hands_with_soap"] },
    toothbrush: { en: "toothbrush", vi: "bàn chải đánh răng", ipa: "/ˈtuːθ.brʌʃ/", acts: ["put_toothpaste", "brush_teeth", "rinse_mouth"] },
    bathmirror: { en: "mirror", vi: "cái gương", ipa: "/ˈmɪr.ər/", acts: ["wipe_mirror", "comb_hair"] },
    hairbrush: { en: "hairbrush", vi: "lược chải tóc", ipa: "/ˈheə.brʌʃ/", acts: ["comb_hair"] },
    hairdryer: { en: "hair dryer", vi: "máy sấy tóc", ipa: "/ˈheə ˌdraɪ.ər/", acts: ["dry_hair"] },
    shower: { en: "shower", vi: "vòi sen", ipa: "/ʃaʊər/", acts: ["take_a_shower", "wash_hair", "turn_off_shower"] },
    bathtub: { en: "bathtub", vi: "bồn tắm", ipa: "/ˈbɑːθ.tʌb/", acts: ["clean_bathtub"] },
    towel: { en: "towel", vi: "khăn tắm", ipa: "/ˈtaʊ.əl/", acts: ["pick_up_towel", "hang_up_towel", "dry_off_with_towel"] },
    toilet: { en: "toilet", vi: "bồn cầu", ipa: "/ˈtɔɪ.lət/", acts: ["flush_toilet", "clean_toilet"] },
    toiletpaper: { en: "toilet paper", vi: "giấy vệ sinh", ipa: "/ˈtɔɪ.lət ˌpeɪ.pər/", acts: ["replace_toilet_paper"] },
    bathcabinet: { en: "bathroom cabinet", vi: "tủ phòng tắm", ipa: "/ˈbɑːθ.ruːm ˌkæb.ɪ.nət/", acts: ["open_bathroom_cabinet", "close_bathroom_cabinet", "replace_toilet_paper"] },
    laundrybasket: { en: "laundry basket", vi: "giỏ đồ giặt", ipa: "/ˈlɔːn.dri ˌbɑː.skɪt/", acts: ["put_clothes_in_basket"] },
    bathmat: { en: "bath mat", vi: "thảm nhà tắm", ipa: "/ˈbɑːθ mæt/", acts: ["straighten_bath_mat"] },
    bathlight: { en: "bathroom light", vi: "đèn phòng tắm", ipa: "/ˈbɑːθ.ruːm laɪt/", acts: ["turn_on_bathroom_light", "turn_off_bathroom_light"] }
  },
  actions: bathroomActions,
  props: BA_PROPS,
  applyState(W, root) {
    mirrorState(W, BA_W0, root);
    const t = root.querySelector("#o-towel"); if (t) t.dataset.base = W.ba_towel === "floor" ? 596 : 306;
  },
  css: bathroomCss,
  catalog: cat("ba_", [
    ["sink", "/sɪŋk/", "bồn rửa mặt", "fixture"], ["tap", "/tæp/", "vòi nước", "fixture"], ["mirror", "/ˈmɪr.ər/", "cái gương", "fixture"],
    ["toothbrush", "/ˈtuːθ.brʌʃ/", "bàn chải đánh răng", "personal care"], ["toothpaste", "/ˈtuːθ.peɪst/", "kem đánh răng", "personal care"], ["toothbrush holder", "/ˈtuːθ.brʌʃ ˌhəʊl.dər/", "cốc đựng bàn chải", "storage"],
    ["mouthwash", "/ˈmaʊθ.wɒʃ/", "nước súc miệng", "personal care"], ["dental floss", "/ˈden.təl flɒs/", "chỉ nha khoa", "personal care"], ["soap", "/səʊp/", "xà phòng", "personal care"],
    ["soap dispenser", "/ˈsəʊp dɪˌspen.sər/", "bình xà phòng nước", "personal care"], ["hand towel", "/ˈhænd ˌtaʊ.əl/", "khăn lau tay", "linen"], ["bath towel", "/ˈbɑːθ ˌtaʊ.əl/", "khăn tắm", "linen"],
    ["towel rail", "/ˈtaʊ.əl reɪl/", "giá treo khăn", "fixture"], ["bathrobe", "/ˈbɑːθ.rəʊb/", "áo choàng tắm", "linen"], ["shower", "/ʃaʊər/", "vòi sen", "fixture"],
    ["shower head", "/ˈʃaʊə hed/", "đầu vòi sen", "fixture"], ["shower curtain", "/ˈʃaʊə ˌkɜː.tən/", "rèm phòng tắm", "fixture"], ["bathtub", "/ˈbɑːθ.tʌb/", "bồn tắm", "fixture"],
    ["shampoo", "/ʃæmˈpuː/", "dầu gội", "personal care"], ["conditioner", "/kənˈdɪʃ.ən.ər/", "dầu xả", "personal care"], ["body wash", "/ˈbɒd.i wɒʃ/", "sữa tắm", "personal care"],
    ["loofah", "/ˈluː.fə/", "bông tắm", "personal care"], ["bath mat", "/ˈbɑːθ mæt/", "thảm nhà tắm", "linen"], ["toilet", "/ˈtɔɪ.lət/", "bồn cầu", "fixture"],
    ["toilet paper", "/ˈtɔɪ.lət ˌpeɪ.pər/", "giấy vệ sinh", "supplies"], ["toilet paper holder", "/ˈtɔɪ.lət ˌpeɪ.pə ˌhəʊl.dər/", "giá treo giấy vệ sinh", "fixture"], ["toilet brush", "/ˈtɔɪ.lət brʌʃ/", "chổi cọ bồn cầu", "cleaning"],
    ["flush button", "/ˈflʌʃ ˌbʌt.ən/", "nút xả nước", "fixture"], ["bathroom cabinet", "/ˈbɑːθ.ruːm ˌkæb.ɪ.nət/", "tủ phòng tắm", "storage"], ["first aid kit", "/ˌfɜːst ˈeɪd kɪt/", "hộp sơ cứu", "supplies"],
    ["hairbrush", "/ˈheə.brʌʃ/", "lược chải tóc", "personal care"], ["comb", "/kəʊm/", "cái lược", "personal care"], ["hair dryer", "/ˈheə ˌdraɪ.ər/", "máy sấy tóc", "electronics"],
    ["razor", "/ˈreɪ.zər/", "dao cạo", "personal care"], ["shaving cream", "/ˈʃeɪ.vɪŋ kriːm/", "kem cạo râu", "personal care"], ["cotton buds", "/ˈkɒt.ən bʌdz/", "tăm bông", "personal care"],
    ["cotton pads", "/ˈkɒt.ən pædz/", "bông tẩy trang", "personal care"], ["face wash", "/ˈfeɪs wɒʃ/", "sữa rửa mặt", "personal care"], ["moisturizer", "/ˈmɔɪs.tʃər.aɪ.zər/", "kem dưỡng ẩm", "personal care"],
    ["sunscreen", "/ˈsʌn.skriːn/", "kem chống nắng", "personal care"], ["perfume", "/ˈpɜː.fjuːm/", "nước hoa", "personal care"], ["nail clippers", "/ˈneɪl ˌklɪp.əz/", "cái bấm móng tay", "personal care"],
    ["tweezers", "/ˈtwiː.zəz/", "cái nhíp", "personal care"], ["laundry basket", "/ˈlɔːn.dri ˌbɑː.skɪt/", "giỏ đồ giặt", "storage"], ["washing machine", "/ˈwɒʃ.ɪŋ məˌʃiːn/", "máy giặt", "appliance"],
    ["bathroom scale", "/ˈbɑːθ.ruːm skeɪl/", "cân sức khoẻ", "other"], ["pedal bin", "/ˈped.əl bɪn/", "thùng rác đạp chân", "cleaning"], ["air freshener", "/ˈeə ˌfreʃ.ən.ər/", "nước xịt thơm phòng", "cleaning"],
    ["drain", "/dreɪn/", "lỗ thoát nước", "fixture"], ["tiles", "/taɪlz/", "gạch ốp", "room"], ["exhaust fan", "/ɪɡˈzɔːst fæn/", "quạt thông gió", "fixture"],
    ["rubber duck", "/ˌrʌb.ə ˈdʌk/", "vịt cao su", "other"], ["bath bomb", "/ˈbɑːθ bɒm/", "viên sủi bồn tắm", "personal care"], ["mop", "/mɒp/", "cây lau nhà", "cleaning"],
    ["bucket", "/ˈbʌk.ɪt/", "cái xô", "cleaning"], ["bleach", "/bliːtʃ/", "thuốc tẩy", "cleaning"], ["slippers", "/ˈslɪp.əz/", "dép đi trong nhà", "other"]
  ])
};

/* ======================================================================
   GARAGE  (prefix ga_)
   Safety rules built into pre(): the player never repairs the engine, fuel or electrics;
   only plugs in a battery charger / pumps a tyre. A car that will not start → call_mechanic.
   The engine may only run with the garage door OPEN (exhaust fumes).
   ====================================================================== */
const GAV = {
  open: ["open", "/ˈəʊ.pən/", "mở"], close: ["close", "/kləʊz/", "đóng"], garagedoor: ["garage door", "/ˈɡær.ɑːʒ dɔːr/", "cửa ga-ra"],
  remote: ["button", "/ˈbʌt.ən/", "nút bấm"], pickup: ["pick up", "/pɪk ʌp/", "cầm lên, lấy"], keys: ["car keys", "/kɑː kiːz/", "chìa khoá xe"],
  hangup: ["hang up", "/hæŋ ʌp/", "treo lên"], hook: ["hook", "/hʊk/", "cái móc"], inspect: ["inspect", "/ɪnˈspekt/", "kiểm tra kỹ"], car: ["car", "/kɑːr/", "xe ô tô"],
  check: ["check", "/tʃek/", "kiểm tra"], tire: ["tire", "/taɪər/", "lốp xe (Anh-Mỹ; Anh-Anh: tyre)"], pressure: ["pressure", "/ˈpreʃ.ər/", "áp suất"],
  gauge: ["pressure gauge", "/ˈpreʃ.ə ɡeɪdʒ/", "đồng hồ đo áp suất"], flat: ["flat", "/flæt/", "xẹp (lốp)"], pump: ["air pump", "/ˈeə pʌmp/", "máy bơm hơi"],
  inflate: ["inflate", "/ɪnˈfleɪt/", "bơm căng"], hood: ["hood", "/hʊd/", "nắp ca-pô (Anh-Mỹ; Anh-Anh: bonnet)"], battery: ["battery", "/ˈbæt.ər.i/", "ắc quy, pin"],
  charge: ["charge", "/tʃɑːdʒ/", "sạc"], charger: ["battery charger", "/ˈbæt.ər.i ˌtʃɑː.dʒər/", "bộ sạc ắc quy"], plugin: ["plug in", "/plʌɡ ɪn/", "cắm điện"],
  unplug: ["unplug", "/ʌnˈplʌɡ/", "rút phích cắm"], call: ["call", "/kɔːl/", "gọi điện"], mechanic: ["mechanic", "/məˈkæn.ɪk/", "thợ sửa xe"],
  start: ["start", "/stɑːt/", "khởi động, nổ máy"], wont: ["won't start", "/wəʊnt stɑːt/", "không nổ máy"], fill: ["fill", "/fɪl/", "đổ đầy"],
  bucket: ["bucket", "/ˈbʌk.ɪt/", "cái xô"], soapy: ["soapy water", "/ˈsəʊ.pi ˈwɔː.tər/", "nước xà phòng"], hose: ["hose", "/həʊz/", "vòi tưới, ống nước"],
  wash: ["wash", "/wɒʃ/", "rửa"], sponge: ["sponge", "/spʌndʒ/", "miếng bọt biển"], wipe: ["wipe", "/waɪp/", "lau"], windshield: ["windshield", "/ˈwɪnd.ʃiːld/", "kính chắn gió"],
  clean: ["clean", "/kliːn/", "lau sạch"], dashboard: ["dashboard", "/ˈdæʃ.bɔːd/", "bảng đồng hồ (táp-lô)"], sweep: ["sweep", "/swiːp/", "quét"],
  broom: ["broom", "/bruːm/", "cái chổi"], floor: ["floor", "/flɔːr/", "sàn nhà"], empty: ["empty", "/ˈemp.ti/", "đổ (cho rỗng); rỗng"], bin: ["bin", "/bɪn/", "thùng rác"],
  organize: ["organize", "/ˈɔː.ɡən.aɪz/", "sắp xếp"], toolbox: ["toolbox", "/ˈtuːl.bɒks/", "hộp đồ nghề"], tools: ["tools", "/tuːlz/", "dụng cụ"],
  putaway: ["put away", "/pʊt əˈweɪ/", "cất đi"], workbench: ["workbench", "/ˈwɜːk.bentʃ/", "bàn thợ"], turnon: ["turn on", "/tɜːn ɒn/", "bật"],
  turnoff: ["turn off", "/tɜːn ɒf/", "tắt"], flashlight: ["flashlight", "/ˈflæʃ.laɪt/", "đèn pin (Anh-Mỹ; Anh-Anh: torch)"], engine: ["engine", "/ˈen.dʒɪn/", "động cơ"],
  park: ["park", "/pɑːk/", "đỗ xe"], straight: ["straight", "/streɪt/", "thẳng"], fumes: ["exhaust fumes", "/ɪɡˈzɔːst fjuːmz/", "khí thải"]
};
const gaA = mkAct(GAV);
const gaOpenHood = W => W.ga_hood !== "open" ? [["walk", "ga_hood"], ["pose", "reach", 500], ["set", "ga_hood", "open"], ["wait", 300]] : [];
const gaCloseHood = W => W.ga_hood === "open" ? [["walk", "ga_hood"], ["pose", "reach", 500], ["set", "ga_hood", "closed"], ["wait", 200]] : [];

const garageActions = [
  gaA("open_garage_door", "garagedoor", "Open the garage door", "Mở cửa ga-ra", "I'm opening the garage door.", "Tôi đang mở cửa ga-ra.", ["opening", "garage", "door"], ["open", "garagedoor", "remote"],
    "<b>garage</b> có hai cách đọc: /ˈɡær.ɑːʒ/ (Anh-Anh) và /ɡəˈrɑːʒ/ (Anh-Mỹ). open → opening.", ["I'm opening", "the garage door."], ["garage", "garbage", "gorgeous"],
    ["I'm opening <b>the gate</b>.", "I'm opening <b>the car door</b>."],
    W => W.ga_door === "open" ? "Cửa ga-ra đang mở rồi." : null,
    W => [["walk", "ga_doorBtn"], ["pose", "point", 500], ["set", "ga_door", "open"], ["wait", 900], ["pose", "idle", 1]],
    ["open the garage door", "press the button to open the garage door", "mở cửa ga-ra"]),
  gaA("close_garage_door", "garagedoor", "Close the garage door", "Đóng cửa ga-ra", "I'm closing the garage door.", "Tôi đang đóng cửa ga-ra.", ["closing", "garage", "door"], ["close", "garagedoor", "fumes"],
    "close → closing. An toàn: <b>Never close the garage door with the engine running.</b> (khí thải rất độc).", ["I'm closing", "the garage door."], ["close", "clothes", "cloze"],
    ["I'm closing <b>the window</b>.", "I'm closing <b>the hood</b>."],
    W => W.ga_door !== "open" ? "Cửa ga-ra đang đóng." : W.ga_engine === "on" ? "Không đóng cửa khi máy xe đang chạy — khí thải rất nguy hiểm! Hãy tắt máy trước (Turn off the engine)." : null,
    W => [["walk", "ga_doorBtn"], ["pose", "point", 500], ["set", "ga_door", "closed"], ["wait", 900], ["pose", "idle", 1]],
    ["close the garage door", "close the garage door for the night", "đóng cửa ga-ra"]),
  gaA("pick_up_car_keys", "carkeys", "Pick up the car keys", "Lấy chìa khoá xe", "I'm picking up the car keys.", "Tôi đang lấy chìa khoá xe.", ["picking", "up", "keys"], ["pickup", "keys", "hook"],
    "<b>keys</b> số nhiều vì chùm chìa khoá: the car keys <b>are</b> on the hook.", ["I'm picking up", "the car keys."], ["keys", "kiss", "keeps"],
    ["I'm picking up <b>my wallet</b>.", "I'm picking up <b>the house keys</b>."],
    W => W.ga_keys === "hand" ? "Bạn đang cầm chìa khoá rồi." : null,
    W => [["walk", "ga_keys"], ["pose", "reach", 500], ["set", "ga_keys", "hand"], ["spawn", "ga_keysP"], ["pose", "idle", 1]],
    ["pick up the car keys", "pick up the car keys from the hook", "lấy chìa khoá xe trên móc"]),
  gaA("hang_up_car_keys", "carkeys", "Hang up the car keys", "Treo chìa khoá lên", "I'm hanging the car keys on the hook.", "Tôi đang treo chìa khoá xe lên móc.", ["hanging", "keys", "hook"], ["hangup", "keys", "hook"],
    "hang … <b>on</b> the hook = treo … lên móc. Thói quen tốt giúp không làm mất chìa khoá.", ["I'm hanging the car keys", "on the hook."], ["hook", "book", "hug"],
    ["I'm hanging <b>my bag</b> on the hook.", "I'm hanging <b>my jacket</b> on the hook."],
    W => W.ga_keys !== "hand" ? "Chìa khoá đang treo trên móc." : W.ga_engine === "on" ? "Máy xe đang chạy — hãy tắt máy trước (Turn off the engine)." : null,
    W => [["walk", "ga_keys"], ["pose", "reach", 500], ["despawn"], ["set", "ga_keys", "hook"], ["pose", "idle", 1]],
    ["hang up the car keys", "hang the car keys on the hook", "treo chìa khoá lên móc"]),
  gaA("inspect_car", "car", "Inspect the car", "Kiểm tra quanh xe", "I'm inspecting the car.", "Tôi đang kiểm tra quanh chiếc xe.", ["inspecting", "car"], ["inspect", "car", "flat"],
    "<b>inspect</b> = xem xét kỹ (trang trọng hơn <b>look at</b>). Khi kiểm tra, nói: <i>One of the tires looks flat.</i>", ["I'm inspecting", "the car."], ["inspect", "expect", "insect"],
    ["I'm inspecting <b>the bike</b>.", "I'm inspecting <b>the tires</b>."],
    W => W.ga_inspected === "yes" ? "Bạn vừa kiểm tra xe rồi." : null,
    W => [["walk", "ga_carDoor"], ["pose", "point", 600], ["walk", "ga_windshield"], ["pose", "point", 500], ["walk", "ga_tire"], ["pose", "bend", 700], ["set", "ga_inspected", "yes"], ["pose", "idle", 1]],
    ["inspect the car", "walk around and inspect the car", "kiểm tra quanh xe"]),
  gaA("check_tire", "cartire", "Check the tire pressure", "Đo áp suất lốp", "I'm checking the tire pressure.", "Tôi đang đo áp suất lốp xe.", ["checking", "tire", "pressure"], ["check", "tire", "gauge"],
    "Danh từ ghép: <b>tire pressure</b> = áp suất (của) lốp — danh từ đứng trước bổ nghĩa cho danh từ sau.", ["I'm checking", "the tire pressure."], ["tire", "tired", "tie"],
    ["I'm checking <b>the oil level</b>.", "I'm checking <b>the air in the tires</b>."],
    W => W.ga_tirechecked === "yes" ? "Bạn đã đo áp suất lốp rồi." : null,
    W => [["walk", "ga_tire"], ["spawn", "ga_gaugeP"], ["pose", "bend", 1300], ["despawn"], ["set", "ga_tirechecked", "yes"], ["pose", "idle", 1]],
    ["check the tire pressure", "check the tire pressure with a gauge", "đo áp suất lốp"]),
  gaA("inflate_tire", "airpump", "Pump up the tire", "Bơm lốp xe", "I'm pumping up the flat tire.", "Tôi đang bơm chiếc lốp bị xẹp.", ["pumping", "flat", "tire"], ["inflate", "pump", "flat"],
    "<b>pump up</b> = bơm căng (thân mật); <b>inflate</b> = bơm (trang trọng). a <b>flat tire</b> = lốp xẹp.", ["I'm pumping up", "the flat tire."], ["flat", "flight", "fat"],
    ["I'm pumping up <b>my bike tire</b>.", "I'm pumping up <b>the ball</b>."],
    W => W.ga_tire === "ok" ? "Lốp xe đã đủ hơi rồi." : W.ga_tirechecked !== "yes" ? "Hãy đo áp suất lốp trước (Check the tire pressure)." : null,
    W => [["walk", "ga_pump"], ["pose", "reach", 400], ["set", "ga_pump", "on"], ["walk", "ga_tire"], ["pose", "bend", 1600], ["set", "ga_tire", "ok"], ["walk", "ga_pump"], ["pose", "reach", 400], ["set", "ga_pump", "off"], ["pose", "idle", 1]],
    ["pump up the flat tire", "pump up the flat tire with the air pump", "bơm lốp xe bị xẹp"]),
  gaA("open_car_hood", "car", "Open the hood", "Mở nắp ca-pô", "I'm opening the hood of the car.", "Tôi đang mở nắp ca-pô xe.", ["opening", "hood"], ["open", "hood", "car"],
    "<b>hood</b> (Mỹ) = <b>bonnet</b> (Anh) = nắp ca-pô. the hood <b>of</b> the car = nắp ca-pô của xe.", ["I'm opening", "the hood of the car."], ["hood", "food", "good"],
    ["I'm opening <b>the trunk</b> of the car.", "I'm opening <b>the door</b> of the car."],
    W => W.ga_hood === "open" ? "Nắp ca-pô đang mở rồi." : W.ga_engine === "on" ? "Không mở ca-pô khi máy đang chạy — hãy tắt máy trước." : null,
    W => [["walk", "ga_hood"], ["pose", "reach", 600], ["set", "ga_hood", "open"], ["pose", "idle", 1]],
    ["open the hood", "open the hood of the car", "mở nắp ca-pô"]),
  gaA("check_battery", "car", "Check the battery", "Kiểm tra ắc quy", "I'm checking the car battery.", "Tôi đang kiểm tra ắc quy xe.", ["checking", "battery"], ["check", "battery", "hood"],
    "Chỉ <b>nhìn</b> đèn báo trên ắc quy — không chạm vào cực điện. Kết quả: <i>The battery is <b>dead</b>/<b>low</b>.</i> (ắc quy hết điện/yếu).", ["I'm checking", "the car battery."], ["battery", "battle", "bakery"],
    ["I'm checking <b>the oil</b>.", "I'm checking <b>the lights</b>."],
    W => W.ga_batchecked === "yes" ? "Bạn đã kiểm tra ắc quy rồi." : W.ga_engine === "on" ? "Hãy tắt máy trước khi kiểm tra ắc quy." : null,
    W => [...gaOpenHood(W), ["walk", "ga_hood"], ["spawn", "ga_flashP"], ["pose", "point", 1200], ["despawn"], ["set", "ga_batchecked", "yes"], ["pose", "idle", 1]],
    ["check the battery", "look at the car battery light", "kiểm tra ắc quy"]),
  gaA("charge_battery", "batterycharger", "Charge the battery", "Sạc ắc quy", "I'm charging the car battery.", "Tôi đang sạc ắc quy xe.", ["charging", "battery"], ["charge", "charger", "plugin"],
    "charge → charg<b>ing</b>. Chỉ làm phần an toàn: <b>plug in the battery charger</b>. Việc khác về điện → nhờ thợ (mechanic).", ["I'm charging", "the car battery."], ["charge", "change", "chair"],
    ["I'm charging <b>my phone</b>.", "I'm charging <b>the laptop</b>."],
    W => W.ga_battery === "ok" ? "Ắc quy đã đầy rồi." : W.ga_batchecked !== "yes" ? "Hãy kiểm tra ắc quy trước (Check the battery)." : W.ga_engine === "on" ? "Hãy tắt máy trước." : null,
    W => [...gaOpenHood(W), ["walk", "ga_charger"], ["pose", "reach", 500], ["set", "ga_charger", "plugged"], ["set", "ga_battery", "charging"], ["walk", "ga_hood"], ["pose", "point", 600], ["wait", 1800], ["set", "ga_battery", "ok"], ["pose", "idle", 1]],
    ["charge the battery", "plug in the charger and charge the battery", "cắm sạc và sạc ắc quy"]),
  gaA("unplug_battery_charger", "batterycharger", "Unplug the charger", "Rút sạc ắc quy", "I'm unplugging the battery charger.", "Tôi đang rút bộ sạc ắc quy.", ["unplugging", "charger"], ["unplug", "charger"],
    "Tiền tố <b>un-</b> = làm ngược lại: plug → <b>unplug</b>, lock → unlock. unplug → unplug<b>g</b>ing.", ["I'm unplugging", "the battery charger."], ["unplug", "unpack", "unlock"],
    ["I'm unplugging <b>the toaster</b>.", "I'm unplugging <b>my phone charger</b>."],
    W => W.ga_charger !== "plugged" ? "Bộ sạc chưa được cắm." : null,
    W => [["walk", "ga_charger"], ["pose", "reach", 600], ["set", "ga_charger", "off"], ["pose", "idle", 1]],
    ["unplug the charger", "unplug the battery charger", "rút bộ sạc ắc quy"]),
  gaA("close_car_hood", "car", "Close the hood", "Đóng nắp ca-pô", "I'm closing the hood.", "Tôi đang đóng nắp ca-pô.", ["closing", "hood"], ["close", "hood"],
    "close the hood = đóng ca-pô. Nhắc nhau: <b>Mind your fingers!</b> (Cẩn thận kẹp tay!)", ["I'm closing", "the hood."], ["hood", "hat", "who'd"],
    ["I'm closing <b>the trunk</b>.", "I'm closing <b>the toolbox</b>."],
    W => W.ga_hood !== "open" ? "Nắp ca-pô đang đóng." : W.ga_charger === "plugged" ? "Hãy rút bộ sạc trước khi đóng ca-pô (Unplug the charger)." : null,
    W => [["walk", "ga_hood"], ["pose", "reach", 600], ["set", "ga_hood", "closed"], ["pose", "idle", 1]],
    ["close the hood", "close the hood carefully", "đóng nắp ca-pô"]),
  gaA("call_mechanic", "wallphone", "Call the mechanic", "Gọi thợ sửa xe", "I'm calling the mechanic.", "Tôi đang gọi điện cho thợ sửa xe.", ["calling", "mechanic"], ["call", "mechanic", "wont"],
    "<b>call</b> + người (không có “to”): call <b>the mechanic</b>. Nói vấn đề: <i>My car <b>won't start</b>.</i> (won't = will not). Việc sửa máy, xăng, điện → luôn nhờ thợ.", ["I'm calling", "the mechanic."], ["mechanic", "machine", "magic"],
    ["I'm calling <b>my dad</b>.", "I'm calling <b>the repair shop</b>."],
    W => W.ga_mechanic === "called" ? "Bạn đã gọi thợ rồi — thợ sẽ đến sau." : null,
    W => [["walk", "ga_phone"], ["pose", "reach", 400], ["spawn", "ga_phoneP"], ["pose", "drink", 1800], ["despawn"], ["set", "ga_mechanic", "called"], ["pose", "idle", 1]],
    ["call the mechanic", "call the mechanic because the car won't start", "gọi thợ sửa xe"]),
  gaA("fill_bucket", "bucket", "Fill the bucket with soapy water", "Pha xô nước xà phòng", "I'm filling the bucket with soapy water.", "Tôi đang đổ đầy xô nước xà phòng.", ["filling", "bucket", "soapy"], ["fill", "bucket", "soapy"],
    "<b>fill A with B</b> = đổ đầy A bằng B. soap → <b>soapy</b> (tính từ: có xà phòng).", ["I'm filling the bucket", "with soapy water."], ["bucket", "basket", "bracket"],
    ["I'm filling the <b>kettle</b> with <b>water</b>.", "I'm filling the <b>watering can</b>."],
    W => W.ga_bucket === "soapy" ? "Xô đã có nước xà phòng rồi." : null,
    W => [["walk", "ga_bucket"], ["pose", "bend", 500], ["set", "ga_hose", "on"], ["wait", 900], ["set", "ga_hose", "off"], ["spawn", "ga_soapP"], ["pose", "pour", 600], ["despawn"], ["set", "ga_bucket", "soapy"], ["pose", "idle", 1]],
    ["fill the bucket", "fill the bucket with soapy water", "pha xô nước xà phòng"]),
  gaA("wash_car", "bucket", "Wash the car", "Rửa xe", "I'm washing the car with a sponge.", "Tôi đang rửa xe bằng miếng bọt biển.", ["washing", "car", "sponge"], ["wash", "car", "sponge"],
    "wash the car = rửa xe. Để rửa xe cần <b>a bucket of soapy water</b> (một xô nước xà phòng) và <b>a sponge</b>.", ["I'm washing the car", "with a sponge."], ["wash", "watch", "wish"],
    ["I'm washing <b>my bike</b> with a sponge.", "I'm washing <b>the windows</b> with a cloth."],
    W => W.ga_car === "clean" ? "Xe đã sạch bóng rồi." : W.ga_bucket !== "soapy" ? "Hãy pha xô nước xà phòng trước (Fill the bucket with soapy water)." : W.ga_engine === "on" ? "Hãy tắt máy trước khi rửa xe." : null,
    W => [["walk", "ga_bucket"], ["pose", "bend", 400], ["spawn", "ga_spongeP"], ["walk", "ga_carDoor"], ["set", "ga_car", "soapy"], ["pose", "wipe", 1300], ["walk", "ga_windshield"], ["pose", "wipe", 1000], ["despawn"], ["walk", "ga_bucket"], ["set", "ga_hose", "on"], ["pose", "water", 900], ["set", "ga_hose", "off"], ["set", "ga_car", "clean"], ["set", "ga_bucket", "dirty"], ["pose", "idle", 1]],
    ["wash the car", "wash the car with soapy water", "rửa xe bằng nước xà phòng"]),
  gaA("wipe_windshield", "car", "Wipe the windshield", "Lau kính chắn gió", "I'm wiping the windshield.", "Tôi đang lau kính chắn gió.", ["wiping", "windshield"], ["wipe", "windshield"],
    "<b>windshield</b> (Mỹ) = <b>windscreen</b> (Anh) = wind (gió) + shield (tấm chắn).", ["I'm wiping", "the windshield."], ["windshield", "window", "windmill"],
    ["I'm wiping <b>the mirror</b>.", "I'm wiping <b>the headlights</b>."],
    W => W.ga_glass === "clean" ? "Kính chắn gió đã sạch rồi." : null,
    W => [["walk", "ga_windshield"], ["spawn", "ga_clothP"], ["pose", "reach", 300], ["pose", "wipe", 1400], ["despawn"], ["set", "ga_glass", "clean"], ["pose", "idle", 1]],
    ["wipe the windshield", "wipe the dusty windshield", "lau kính chắn gió"]),
  gaA("clean_dashboard", "car", "Clean the dashboard", "Lau táp-lô", "I'm cleaning the dashboard.", "Tôi đang lau bảng táp-lô.", ["cleaning", "dashboard"], ["clean", "dashboard", "wipe"],
    "<b>dashboard</b> = bảng đồng hồ phía trước ghế lái. Cũng dùng cho “bảng điều khiển” trên máy tính.", ["I'm cleaning", "the dashboard."], ["dashboard", "skateboard", "cardboard"],
    ["I'm cleaning <b>the car seats</b>.", "I'm cleaning <b>the steering wheel</b>."],
    W => W.ga_dash === "clean" ? "Táp-lô đã sạch rồi." : null,
    W => [["walk", "ga_carDoor"], ["set", "ga_cardoor", "yes"], ["spawn", "ga_clothP"], ["pose", "bend", 400], ["pose", "wipe", 1400], ["despawn"], ["set", "ga_dash", "clean"], ["set", "ga_cardoor", "no"], ["pose", "idle", 1]],
    ["clean the dashboard", "clean the dusty dashboard", "lau táp-lô"]),
  gaA("sweep_garage", "garagebroom", "Sweep the garage floor", "Quét sàn ga-ra", "I'm sweeping the garage floor.", "Tôi đang quét sàn ga-ra.", ["sweeping", "floor"], ["sweep", "broom", "floor"],
    "sweep → sweep<b>ing</b>; quá khứ bất quy tắc: <b>swept</b>. sweep <b>up</b> the leaves = quét gom lá.", ["I'm sweeping", "the garage floor."], ["sweep", "sweet", "sleep"],
    ["I'm sweeping <b>the kitchen floor</b>.", "I'm sweeping <b>up the leaves</b>."],
    W => W.ga_floor === "clean" ? "Sàn ga-ra đã sạch rồi." : null,
    W => [["walk", "ga_broom"], ["pose", "reach", 400], ["spawn", "ga_broomP"], ["walk", "ga_floorDirt"], ["pose", "sweep", 1600], ["set", "ga_floor", "clean"], ["walk", "ga_broom"], ["despawn"], ["pose", "idle", 1]],
    ["sweep the garage floor", "sweep the dust and leaves off the floor", "quét sàn ga-ra"]),
  gaA("empty_garage_bin", "garagebin", "Empty the bin", "Đổ thùng rác", "I'm emptying the garage bin.", "Tôi đang đổ thùng rác trong ga-ra.", ["emptying", "bin"], ["empty", "bin"],
    "<b>empty</b> vừa là tính từ (rỗng) vừa là động từ (đổ cho rỗng). empty → empt<b>y</b>ing (giữ y).", ["I'm emptying", "the garage bin."], ["empty", "entry", "eighty"],
    ["I'm emptying <b>the dishwasher</b>.", "I'm emptying <b>my bag</b>."],
    W => W.ga_bin === "empty" ? "Thùng rác đã rỗng rồi." : null,
    W => [["walk", "ga_bin"], ["pose", "bend", 500], ["spawn", "ga_bagP"], ["set", "ga_bin", "empty"], ["walk", "ga_door"], ["pose", "reach", 400], ["despawn"], ["pose", "idle", 1]],
    ["empty the bin", "empty the garage bin and take the bag out", "đổ thùng rác"]),
  gaA("organize_toolbox", "toolbox", "Organize the toolbox", "Sắp xếp hộp đồ nghề", "I'm organizing the toolbox.", "Tôi đang sắp xếp lại hộp đồ nghề.", ["organizing", "toolbox"], ["organize", "toolbox", "tools"],
    "organize (Mỹ) = organise (Anh). organize → organiz<b>ing</b> (bỏ e). Tính từ: <b>organized</b> (ngăn nắp) ↔ <b>messy</b> (bừa bộn).", ["I'm organizing", "the toolbox."], ["toolbox", "toolkit", "tool belt"],
    ["I'm organizing <b>my desk</b>.", "I'm organizing <b>the drawers</b>."],
    W => W.ga_toolbox === "tidy" ? "Hộp đồ nghề đã gọn gàng rồi." : null,
    W => [["walk", "ga_toolbox"], ["pose", "reach", 500], ["pose", "wipe", 1200], ["set", "ga_toolbox", "tidy"], ["pose", "idle", 1]],
    ["organize the toolbox", "organize the messy toolbox", "sắp xếp hộp đồ nghề"]),
  gaA("put_tools_away", "workbench", "Put the tools away", "Cất dụng cụ", "I'm putting the tools away.", "Tôi đang cất dụng cụ đi.", ["putting", "tools", "away"], ["putaway", "tools", "workbench"],
    "<b>put away</b> = cất vào chỗ. Đại từ phải đứng giữa: put <b>them</b> away (không nói “put away them”).", ["I'm putting", "the tools away."], ["tools", "tolls", "tales"],
    ["I'm putting <b>the toys</b> away.", "I'm putting <b>my clothes</b> away."],
    W => W.ga_tools === "away" ? "Dụng cụ đã được cất rồi." : W.ga_toolbox !== "tidy" ? "Hộp đồ nghề đang bừa bộn — hãy sắp xếp trước (Organize the toolbox)." : null,
    W => [["walk", "ga_bench"], ["pose", "reach", 500], ["spawn", "ga_wrenchP"], ["walk", "ga_toolbox"], ["pose", "reach", 500], ["despawn"], ["set", "ga_tools", "away"], ["pose", "idle", 1]],
    ["put the tools away", "put the tools away in the toolbox", "cất dụng cụ vào hộp"]),
  gaA("turn_on_flashlight", "flashlight", "Turn on the flashlight", "Bật đèn pin", "I'm turning on the flashlight.", "Tôi đang bật đèn pin.", ["turning", "flashlight"], ["turnon", "flashlight"],
    "<b>flashlight</b> (Mỹ) = <b>torch</b> (Anh) = đèn pin.", ["I'm turning on", "the flashlight."], ["flashlight", "flash", "highlight"],
    ["I'm turning on <b>the lamp</b>.", "I'm turning on <b>the headlights</b>."],
    W => W.ga_flash === "on" ? "Đèn pin đang bật rồi." : null,
    W => [["walk", "ga_flash"], ["pose", "reach", 500], ["set", "ga_flash", "on"], ["pose", "idle", 1]],
    ["turn on the flashlight", "turn on the flashlight to see better", "bật đèn pin"]),
  gaA("turn_off_flashlight", "flashlight", "Turn off the flashlight", "Tắt đèn pin", "I'm turning off the flashlight.", "Tôi đang tắt đèn pin.", ["turning", "off", "flashlight"], ["turnoff", "flashlight"],
    "turn off ↔ turn on. Tắt đèn pin để <b>save the batteries</b> (tiết kiệm pin).", ["I'm turning off", "the flashlight."], ["off", "of", "often"],
    ["I'm turning off <b>the radio</b>.", "I'm turning off <b>the engine</b>."],
    W => W.ga_flash !== "on" ? "Đèn pin đang tắt." : null,
    W => [["walk", "ga_flash"], ["pose", "reach", 500], ["set", "ga_flash", "off"], ["pose", "idle", 1]],
    ["turn off the flashlight", "turn off the flashlight to save the batteries", "tắt đèn pin"]),
  gaA("start_car", "car", "Start the car", "Nổ máy xe", "I'm starting the car.", "Tôi đang nổ máy xe.", ["starting", "car"], ["start", "engine", "keys"],
    "<b>start the car</b> = nổ máy. Nếu không được: <i>The car <b>won't start</b>.</i> → gọi thợ. Luôn mở cửa ga-ra trước khi nổ máy.", ["I'm starting", "the car."], ["start", "star", "smart"],
    ["I'm starting <b>the engine</b>.", "I'm starting <b>the motorbike</b>."],
    W => W.ga_engine === "on" ? "Máy xe đang chạy rồi." : W.ga_keys !== "hand" ? "Bạn cần chìa khoá xe (Pick up the car keys)." : W.ga_door !== "open" ? "Hãy mở cửa ga-ra trước khi nổ máy — khí thải rất nguy hiểm (Open the garage door)." : W.ga_charger === "plugged" ? "Hãy rút bộ sạc ắc quy trước (Unplug the charger)." : W.ga_battery !== "ok" ? "Xe không nổ máy (The car won't start): ắc quy yếu. Hãy kiểm tra ắc quy hoặc gọi thợ (Call the mechanic)." : null,
    W => [...gaCloseHood(W), ["walk", "ga_carDoor"], ["set", "ga_cardoor", "yes"], ["pose", "reach", 600], ["set", "ga_cardoor", "no"], ["set", "ga_engine", "on"], ["wait", 600], ["pose", "idle", 1]],
    ["start the car", "turn the key and start the car", "nổ máy xe"]),
  gaA("turn_off_engine", "car", "Turn off the engine", "Tắt máy xe", "I'm turning off the engine.", "Tôi đang tắt máy xe.", ["turning", "off", "engine"], ["turnoff", "engine"],
    "<b>engine</b> = động cơ (của xe); <b>machine</b> = máy móc nói chung. turn off the engine = tắt máy.", ["I'm turning off", "the engine."], ["engine", "engineer", "angel"],
    ["I'm turning off <b>the radio</b>.", "I'm turning off <b>the headlights</b>."],
    W => W.ga_engine !== "on" ? "Máy xe đang tắt." : null,
    W => [["walk", "ga_carDoor"], ["set", "ga_cardoor", "yes"], ["pose", "reach", 600], ["set", "ga_engine", "off"], ["set", "ga_cardoor", "no"], ["pose", "idle", 1]],
    ["turn off the engine", "turn off the engine and take the key", "tắt máy xe"]),
  gaA("park_car", "car", "Park the car straight", "Đỗ xe cho ngay ngắn", "I'm parking the car.", "Tôi đang đỗ xe cho ngay ngắn.", ["parking", "car"], ["park", "car", "straight"],
    "<b>park</b> = đỗ xe; <b>parking</b> = việc đỗ xe / bãi đỗ. Nói: park <b>straight</b> (đỗ thẳng) / park <b>between the lines</b>.", ["I'm parking", "the car."], ["park", "pack", "bark"],
    ["I'm parking <b>my bike</b>.", "I'm parking the car <b>in the garage</b>."],
    W => W.ga_parked === "straight" ? "Xe đã đỗ ngay ngắn rồi." : W.ga_engine !== "on" ? "Hãy nổ máy trước (Start the car)." : W.ga_tire !== "ok" ? "Lốp đang xẹp, không nên lái xe — hãy bơm lốp trước (Pump up the tire)." : null,
    W => [["walk", "ga_carDoor"], ["pose", "reach", 500], ["set", "ga_parked", "straight"], ["wait", 900], ["set", "ga_engine", "off"], ["pose", "idle", 1]],
    ["park the car", "park the car straight between the lines", "đỗ xe ngay ngắn"])
];

const GA_PROPS = {
  ga_keysP: `<circle cx="0" cy="-8" r="5" fill="none" stroke="#9aa6af" stroke-width="2"/><rect x="2" y="-10" width="14" height="4" rx="1" fill="#c9a77c"/><rect x="-8" y="-6" width="9" height="14" rx="3" fill="#3a3f46"/>`,
  ga_gaugeP: `<rect x="-3" y="-8" width="6" height="16" rx="2" fill="#3a3f46"/><circle cx="0" cy="-16" r="9" fill="#fffdf9" stroke="#3a3f46" stroke-width="2"/><path d="M0 -16 L5 -21" stroke="#e74c3c" stroke-width="2"/>`,
  ga_flashP: `<rect x="-4" y="-24" width="8" height="24" rx="3" fill="#f5c45a"/><rect x="-6" y="-30" width="12" height="7" rx="2" fill="#3a3f46"/><path d="M-6 -30 L-16 -52 L16 -52 L6 -30Z" fill="#fff3b0" opacity=".55"/>`,
  ga_phoneP: `<rect x="-5" y="-22" width="10" height="22" rx="3" fill="#3a3f46"/><rect x="-3" y="-19" width="6" height="12" rx="1" fill="#9fd3f0"/>`,
  ga_soapP: `<rect x="-7" y="-26" width="14" height="26" rx="4" fill="#7fd0c8"/><rect x="-3" y="-32" width="6" height="7" fill="#3f8f87"/><rect x="-5" y="-16" width="10" height="8" rx="1" fill="#fff" opacity=".8"/>`,
  ga_spongeP: `<rect x="-12" y="-11" width="24" height="11" rx="3" fill="#f5d34a"/><g fill="#fff" stroke="#bcd8ea"><circle cx="-6" cy="-14" r="3"/><circle cx="2" cy="-16" r="3.5"/><circle cx="9" cy="-13" r="2.5"/></g>`,
  ga_clothP: `<path d="M-11 0 L-9 -18 L10 -20 L11 0Z" fill="#e8743b"/><path d="M-8 -6 h16" stroke="#fff" stroke-width="1.5"/>`,
  ga_broomP: `<rect x="-2" y="-60" width="4" height="64" rx="2" fill="#c98f5e"/><path d="M-12 2 L12 2 L16 22 L-16 22Z" fill="#e8c06a"/>`,
  ga_bagP: `<path d="M-14 0 Q-18 -20 -6 -28 L-2 -36 L2 -36 L6 -28 Q18 -20 14 0Z" fill="#3b3f46"/>`,
  ga_wrenchP: `<rect x="-2" y="-30" width="4" height="30" rx="2" fill="#9aa6af"/><path d="M-7 -38 a7 7 0 1 0 14 0 l-4 0 l0 4 l-6 0 l0 -4z" fill="#9aa6af"/>`
};

/* --- GARAGE drawing. Back wall: broom corner (128-150), roll-up door (170-520), button + key hook (535-600), phone (630),
   workbench + pegboard (740-990). Floor: car (250-735 × 400-560), pump (840-890), bucket/hose (left front), bin (left). --- */
const garageShell = `
<defs>
 <linearGradient id="gaWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e4da"/><stop offset="1" stop-color="#d9d2c4"/></linearGradient>
 <linearGradient id="gaLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfc7b8"/><stop offset="1" stop-color="#ddd6c9"/></linearGradient>
 <linearGradient id="gaFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd2d4"/><stop offset="1" stop-color="#b7bcc0"/></linearGradient>
 <linearGradient id="gaCar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb3d9"/><stop offset="1" stop-color="#3f86b5"/></linearGradient>
 <linearGradient id="gaGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6f4fb"/><stop offset="1" stop-color="#a9d2e8"/></linearGradient>
 <linearGradient id="gaChrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfe6ea"/><stop offset=".5" stop-color="#fbfcfd"/><stop offset="1" stop-color="#bcc7cf"/></linearGradient>
 <linearGradient id="gaWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9a573"/><stop offset="1" stop-color="#b47a4c"/></linearGradient>
 <linearGradient id="gaSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcf7"/><stop offset="1" stop-color="#e3f4fc"/></linearGradient>
 <radialGradient id="gaBeam" cx="0" cy=".5" r="1"><stop offset="0" stop-color="#fff3b0" stop-opacity=".8"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>
 <radialGradient id="gaLamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".6"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
 <filter id="gaSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect x="120" y="0" width="880" height="330" fill="url(#gaWall)"/>
<polygon points="0,0 120,0 120,330 0,640" fill="url(#gaLeft)"/>
<polygon points="120,330 1000,330 1000,640 0,640" fill="url(#gaFloor)"/>
${D("concrete-blocks", `<g stroke="#c9c0b0" stroke-width="1.2" fill="none"><path d="M520 40H1000M520 80H1000M520 120H1000M520 160H1000M520 200H1000M520 240H1000M520 280H1000"/>
 <path d="M560 0v40M640 0v40M720 0v40M800 0v40M880 0v40M960 0v40M600 40v40M680 40v40M760 40v40M840 40v40M920 40v40M560 80v40M640 80v40M720 80v40M800 80v40M880 80v40M960 80v40M600 120v40M680 120v40M760 120v40M840 120v40M920 120v40M560 160v40M640 160v40M720 160v40M800 160v40M880 160v40M960 160v40M600 200v40M680 200v40M760 200v40M840 200v40M920 200v40M560 240v40M640 240v40M720 240v40M800 240v40M880 240v40M960 240v40M600 280v40M680 280v40"/></g>`)}
${D("floor-joints", `<g stroke="#9aa1a7" stroke-opacity=".5" stroke-width="1.5"><line x1="120" y1="330" x2="0" y2="640"/><line x1="560" y1="330" x2="560" y2="640"/><line x1="70" y1="460" x2="1000" y2="460"/></g>`)}
${D("parking-lines", `<g fill="#f5d34a" opacity=".85"><polygon points="226,580 238,580 254,640 240,640"/><polygon points="760,580 772,580 792,640 778,640"/><polygon points="250,350 258,350 262,372 254,372"/><polygon points="736,350 744,350 750,372 742,372"/></g>`)}
${D("oil-stain", `<ellipse cx="520" cy="590" rx="58" ry="12" fill="#6b6f74" opacity=".25"/><ellipse cx="548" cy="596" rx="22" ry="5" fill="#4e5257" opacity=".25"/>`)}
${D("baseboard", `<rect x="120" y="322" width="880" height="8" fill="#b9b09f"/><polygon points="120,322 120,330 0,640 0,615" fill="#a99f8d"/>`)}
${D("ceiling-beam", `<rect x="120" y="0" width="880" height="12" fill="#b9a68a"/><rect x="120" y="12" width="880" height="3" fill="#9c8a70"/><polygon points="0,0 120,0 120,15 0,20" fill="#9c8a70"/>`)}
${D("ceiling-lamp", `<rect x="757" y="12" width="4" height="10" fill="#5a636c"/><path d="M736 34 L782 34 L772 22 L746 22Z" fill="#3a3f46"/><rect x="742" y="34" width="34" height="5" rx="2" fill="#fff6d8"/><polygon points="742,39 776,39 820,140 698,140" fill="url(#gaLamp)" opacity=".5"/>`)}
${D("door-rails", `<g stroke="#8a949c" stroke-width="4"><line x1="168" y1="16" x2="168" y2="330"/><line x1="522" y1="16" x2="522" y2="330"/></g><rect x="160" y="16" width="370" height="18" rx="3" fill="#8a949c"/>`)}
${D("small-window", lw(20, 70, `<rect x="0" y="0" width="110" height="80" rx="4" fill="url(#gaSky)" stroke="#fffdf9" stroke-width="7"/><line x1="55" y1="3" x2="55" y2="77" stroke="#fffdf9" stroke-width="4"/><path d="M4 60 Q30 46 55 56 T106 52 L106 77 L4 77Z" fill="#9fd39a"/>`))}
${D("wall-shelf-left", lw(16, 190, `<rect x="0" y="0" width="120" height="8" rx="2" fill="#a8693e"/><rect x="8" y="-26" width="22" height="26" rx="3" fill="#e74c3c"/><rect x="34" y="-20" width="26" height="20" rx="3" fill="#5fae5a"/><rect x="66" y="-30" width="18" height="30" rx="3" fill="#3b6ec2"/><rect x="88" y="-16" width="26" height="16" rx="2" fill="#f2e3c6" stroke="#c9b7a2"/>`))}
${D("hose-reel", lw(20, 290, `<circle cx="40" cy="40" r="34" fill="#3a3f46"/><circle cx="40" cy="40" r="26" fill="none" stroke="#5fae5a" stroke-width="9"/><circle cx="40" cy="40" r="8" fill="#9aa6af"/><rect x="34" y="-4" width="12" height="12" rx="2" fill="#8a949c"/>`))}
${D("pegboard", `<rect x="752" y="56" width="236" height="140" rx="4" fill="#d9b88a" stroke="#b48a5a" stroke-width="3"/><g fill="#b48a5a" opacity=".6">${Array.from({ length: 11 }, (_, i) => Array.from({ length: 6 }, (_, j) => `<circle cx="${768 + i * 20}" cy="${70 + j * 22}" r="1.6"/>`).join("")).join("")}</g>`)}
${D("hanging-hammer", `<rect x="776" y="78" width="6" height="56" rx="3" fill="#a8693e"/><rect x="762" y="70" width="34" height="12" rx="3" fill="#5a636c"/>`)}
${D("hanging-saw", `<path d="M808 78 L846 78 L846 92 L812 140 L808 140Z" fill="#cfd6dc" stroke="#9aa6af"/><rect x="800" y="70" width="16" height="22" rx="5" fill="#e8743b"/><path d="M812 140 l4 -4 l4 4 l4 -4 l4 4" stroke="#9aa6af" fill="none"/>`)}
${D("screwdrivers", `<g><rect x="862" y="72" width="7" height="18" rx="3" fill="#e74c3c"/><rect x="864.5" y="90" width="2" height="22" fill="#9aa6af"/><rect x="876" y="72" width="7" height="18" rx="3" fill="#f5c45a"/><rect x="878.5" y="90" width="2" height="26" fill="#9aa6af"/><rect x="890" y="72" width="7" height="18" rx="3" fill="#3b6ec2"/><rect x="892.5" y="90" width="2" height="18" fill="#9aa6af"/></g>`)}
${D("tape-measure", `<rect x="912" y="74" width="26" height="24" rx="6" fill="#f5c45a" stroke="#c99a3a"/><circle cx="925" cy="86" r="5" fill="#3a3f46"/><rect x="936" y="92" width="10" height="3" fill="#c9b7a2"/>`)}
${D("extension-cord", `<circle cx="966" cy="96" r="14" fill="none" stroke="#f0884f" stroke-width="5"/><circle cx="966" cy="96" r="7" fill="none" stroke="#f0884f" stroke-width="4"/><rect x="956" y="106" width="18" height="10" rx="2" fill="#3a3f46"/>`)}
${D("pliers-wrenches", `<g stroke="#9aa6af" stroke-width="4" stroke-linecap="round"><line x1="864" y1="140" x2="864" y2="180"/><line x1="880" y1="138" x2="880" y2="182"/><line x1="896" y1="140" x2="896" y2="176"/></g><g fill="none" stroke="#9aa6af" stroke-width="3"><circle cx="864" cy="136" r="5"/><circle cx="880" cy="134" r="5"/><circle cx="896" cy="136" r="5"/></g><path d="M920 140 L930 180 M936 140 L926 180" stroke="#e74c3c" stroke-width="4" stroke-linecap="round"/>`)}
${D("safety-goggles", `<path d="M948 146 Q962 140 976 146 L976 158 Q962 162 948 158Z" fill="#9fd3f0" stroke="#3a3f46" stroke-width="2"/><path d="M962 146 v14" stroke="#3a3f46" stroke-width="1.5"/>`)}
${D("work-gloves", `<path d="M948 170 L956 168 L960 188 L946 190Z M964 170 L972 168 L976 188 L962 190Z" fill="#f5c45a" stroke="#c99a3a"/>`)}
${D("wall-calendar", `<rect x="680" y="30" width="44" height="54" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><rect x="680" y="30" width="44" height="12" rx="3" fill="#3b6ec2"/><g fill="#c9b7a2"><rect x="685" y="48" width="6" height="5"/><rect x="694" y="48" width="6" height="5"/><rect x="703" y="48" width="6" height="5"/><rect x="712" y="48" width="6" height="5"/><rect x="685" y="57" width="6" height="5"/><rect x="694" y="57" width="6" height="5"/><rect x="712" y="57" width="6" height="5"/><rect x="685" y="66" width="6" height="5"/><rect x="703" y="66" width="6" height="5"/></g><circle cx="706" cy="59" r="5" fill="none" stroke="#e74c3c" stroke-width="1.6"/>`)}
${D("license-plate", `<rect x="560" y="40" width="70" height="26" rx="4" fill="#fffdf9" stroke="#3a3f46" stroke-width="2"/><text x="595" y="58" text-anchor="middle" font-size="12" font-family="monospace" font-weight="700" fill="#3a3f46">ELW-26</text>`)}
${D("power-outlet", `<rect x="726" y="250" width="14" height="20" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><circle cx="733" cy="257" r="1.4" fill="#7a7166"/><circle cx="733" cy="264" r="1.4" fill="#7a7166"/>`)}
${D("fire-extinguisher", `<rect x="696" y="236" width="20" height="44" rx="8" fill="#e74c3c"/><rect x="700" y="226" width="12" height="12" rx="2" fill="#3a3f46"/><path d="M712 230 q12 2 10 20" stroke="#3a3f46" stroke-width="3" fill="none"/><rect x="700" y="252" width="12" height="10" rx="1" fill="#fffdf9"/><rect x="692" y="270" width="28" height="4" rx="2" fill="#8a949c"/>`)}
${D("first-aid-box", `<rect x="640" y="236" width="40" height="30" rx="4" fill="#fffdf9" stroke="#c9b7a2"/><path d="M656 251 h8 M660 247 v8" stroke="#e74c3c" stroke-width="3"/>`)}
${D("safety-sign", `<path d="M600 210 L622 248 L578 248Z" fill="#f5d34a" stroke="#3a3f46" stroke-width="2"/><rect x="598" y="222" width="4" height="14" rx="1" fill="#3a3f46"/><circle cx="600" cy="241" r="2" fill="#3a3f46"/>`)}
${D("light-switch", `<rect x="132" y="196" width="16" height="24" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><rect x="137" y="201" width="6" height="12" rx="1.5" fill="#e6ddd0"/>`)}
${D("tire-marks", `<g stroke="#8a9096" stroke-opacity=".28" stroke-width="10" fill="none" stroke-dasharray="4 6"><path d="M300 640 Q320 600 330 566"/><path d="M640 640 Q650 600 652 566"/></g>`)}
${D("ladder", `<g stroke="#9aa6af" stroke-width="5" stroke-linecap="round"><line x1="44" y1="300" x2="22" y2="540"/><line x1="72" y1="304" x2="54" y2="532"/></g><g stroke="#9aa6af" stroke-width="3.5"><line x1="41" y1="334" x2="68" y2="338"/><line x1="38" y1="374" x2="65" y2="377"/><line x1="34" y1="414" x2="61" y2="416"/><line x1="30" y1="454" x2="58" y2="455"/><line x1="26" y1="494" x2="55" y2="494"/></g>`)}
${D("wall-clock", `<circle cx="596" cy="102" r="17" fill="#fffdf9" stroke="#3a3f46" stroke-width="4"/><line class="ga-hourH" x1="596" y1="102" x2="596" y2="93" stroke="#3a3f46" stroke-width="2.5" stroke-linecap="round"/><line class="ga-minH" x1="596" y1="102" x2="605" y2="102" stroke="#3a3f46" stroke-width="2" stroke-linecap="round"/><circle cx="596" cy="102" r="2" fill="#e74c3c"/>`)}
<rect x="120" y="0" width="880" height="330" fill="url(#gaLamp)" opacity=".2" pointer-events="none"/>
`;

const garageDecor = [
  D("wheel-stop", `<rect x="736" y="392" width="40" height="10" rx="3" fill="#f5d34a"/><g fill="#3a3f46"><rect x="744" y="392" width="6" height="10"/><rect x="760" y="392" width="6" height="10"/></g>`, 402),
  D("paint-cans", `<ellipse cx="604" cy="372" rx="30" ry="4" fill="#000" opacity=".14"/><rect x="580" y="342" width="22" height="28" rx="3" fill="#7aa6c2"/><ellipse cx="591" cy="342" rx="11" ry="3" fill="#9aa6af"/><rect x="606" y="350" width="20" height="20" rx="3" fill="#e8743b"/><ellipse cx="616" cy="350" rx="10" ry="3" fill="#9aa6af"/><path d="M584 352 h14" stroke="#fff" stroke-width="2" opacity=".7"/>`, 372),
  D("storage-boxes", `<ellipse cx="672" cy="372" rx="40" ry="4" fill="#000" opacity=".14"/><rect x="636" y="320" width="70" height="50" rx="3" fill="#d9b27a" stroke="#b48a5a"/><rect x="644" y="292" width="54" height="30" rx="3" fill="#e2c08e" stroke="#b48a5a"/><path d="M636 334 H706 M644 304 H698" stroke="#b48a5a"/><rect x="660" y="342" width="24" height="10" rx="1" fill="#fffdf9"/>`, 372.5),
  D("spare-tire", `<ellipse cx="985" cy="380" rx="10" ry="4" fill="#000" opacity=".15"/><ellipse cx="985" cy="350" rx="14" ry="32" fill="#2f3439"/><ellipse cx="985" cy="350" rx="6" ry="16" fill="#8a949c"/>`, 382),
  D("shop-stool", `<ellipse cx="840" cy="420" rx="24" ry="5" fill="#000" opacity=".14"/><ellipse cx="840" cy="372" rx="20" ry="6" fill="#e74c3c"/><g stroke="#5a636c" stroke-width="3"><line x1="826" y1="376" x2="822" y2="418"/><line x1="854" y1="376" x2="858" y2="418"/><line x1="840" y1="378" x2="840" y2="420"/></g><line x1="826" y1="400" x2="854" y2="400" stroke="#5a636c" stroke-width="2"/>`, 421),
  D("traffic-cone", `<ellipse cx="972" cy="560" rx="18" ry="5" fill="#000" opacity=".16"/><path d="M962 556 L970 510 L974 510 L982 556Z" fill="#f0884f"/><rect x="964" y="526" width="16" height="6" fill="#fffdf9"/><rect x="956" y="554" width="32" height="6" rx="2" fill="#e8743b"/>`, 560),
  D("rubber-boots", `<path d="M202 394 L214 394 L214 418 L226 418 Q230 424 222 426 L202 426Z" fill="#f5d34a" stroke="#c99a3a"/><path d="M218 390 L230 390 L230 414 L242 414 Q246 420 238 422 L218 422Z" fill="#f5d34a" stroke="#c99a3a"/>`, 426),
  D("shop-vac", `<ellipse cx="563" cy="372" rx="18" ry="4" fill="#000" opacity=".14"/><rect x="548" y="326" width="30" height="44" rx="8" fill="#5fae5a"/><rect x="550" y="318" width="26" height="10" rx="4" fill="#3a3f46"/><path d="M576 330 q16 -10 10 -30" stroke="#3a3f46" stroke-width="4" fill="none"/><circle cx="554" cy="370" r="3" fill="#3a3f46"/><circle cx="572" cy="370" r="3" fill="#3a3f46"/>`, 372.2),
  D("car-wash-soap", `<rect x="160" y="604" width="16" height="24" rx="4" fill="#7fd0c8"/><rect x="164" y="598" width="8" height="7" fill="#3f8f87"/><rect x="162" y="612" width="12" height="7" rx="1" fill="#fff" opacity=".8"/>`, 628),
  D("hose", `<path d="M54 380 Q70 470 96 520 Q130 560 110 590 Q90 610 120 616" stroke="#5fae5a" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="114" y="610" width="16" height="8" rx="3" fill="#f5d34a"/>`, 598),
  D("drain-grate", `<rect x="380" y="610" width="80" height="12" rx="3" fill="#8a949c"/><g stroke="#5a636c" stroke-width="2"><line x1="390" y1="612" x2="390" y2="620"/><line x1="400" y1="612" x2="400" y2="620"/><line x1="410" y1="612" x2="410" y2="620"/><line x1="420" y1="612" x2="420" y2="620"/><line x1="430" y1="612" x2="430" y2="620"/><line x1="440" y1="612" x2="440" y2="620"/><line x1="450" y1="612" x2="450" y2="620"/></g>`, 590),
  D("house-door", `<rect x="884" y="560" width="96" height="10" rx="3" fill="#a99f8d"/><rect x="896" y="566" width="72" height="6" rx="2" fill="#8a7a62"/><path d="M904 570 q28 -8 56 0" stroke="#c9b7a2" stroke-width="2" fill="none"/>`, 571),
  D("doormat", `<rect x="884" y="582" width="96" height="22" rx="6" fill="#a8693e"/><text x="932" y="597" text-anchor="middle" font-size="9" font-family="system-ui" font-weight="700" fill="#f6ead6">HOME</text>`, 580)
];

const garageWorld = [
  objG("garagedoor", "garage door", "cửa ga-ra", 300, 345, 50, `
   <rect class="hit" x="170" y="30" width="352" height="300"/><rect class="hit" x="532" y="200" width="30" height="40"/>
   <rect x="170" y="34" width="352" height="296" fill="url(#gaSky)"/>
   <path d="M170 250 Q260 220 346 236 T522 228 L522 330 L170 330Z" fill="#9fd39a"/><path d="M290 330 L320 260 L372 260 L402 330Z" fill="#cfc7b8"/>
   <circle cx="460" cy="90" r="20" fill="#fff3b0"/><g fill="#fff" opacity=".9"><ellipse cx="240" cy="80" rx="26" ry="9"/><ellipse cx="258" cy="73" rx="14" ry="9"/></g>
   <g fill="#5fae5a"><circle cx="210" cy="226" r="20"/><circle cx="486" cy="214" r="24"/></g><rect x="206" y="236" width="6" height="22" fill="#8a5432"/><rect x="482" y="226" width="7" height="26" fill="#8a5432"/>
   <g class="ga-panels"><rect x="170" y="34" width="352" height="296" fill="#eef0f2" stroke="#b8c2ca" stroke-width="2"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="176" y="${40 + i * 48}" width="340" height="44" rx="3" fill="#f6f7f8" stroke="#c9d1d8"/><rect x="190" y="${50 + i * 48}" width="312" height="24" rx="2" fill="none" stroke="#dde3e8"/>`).join("")}
    <rect x="320" y="300" width="52" height="8" rx="4" fill="#8a949c"/></g>
   <rect x="534" y="204" width="24" height="34" rx="4" fill="#fffdf9" stroke="#9aa6af"/><circle cx="546" cy="216" r="5" fill="#5fae5a"/><circle cx="546" cy="230" r="4" fill="#e74c3c"/>`),
  objG("carkeys", "car keys", "chìa khoá xe", 300.2, 556, 200, `
   <rect class="hit" x="566" y="140" width="40" height="52"/>
   <rect x="568" y="144" width="36" height="10" rx="3" fill="#a8693e"/><g fill="#5a636c"><circle cx="578" cy="152" r="2.5"/><circle cx="594" cy="152" r="2.5"/></g>
   <g class="ga-keysHook"><circle cx="578" cy="164" r="6" fill="none" stroke="#9aa6af" stroke-width="2"/><rect x="571" y="168" width="12" height="18" rx="4" fill="#3a3f46"/><circle cx="577" cy="174" r="2" fill="#e74c3c"/><rect x="580" y="162" width="16" height="4" rx="1" fill="#c9a77c"/></g>
   <path d="M594 154 v8 q0 4 4 4" stroke="#5a636c" stroke-width="1.5" fill="none"/><rect x="590" y="166" width="10" height="14" rx="2" fill="#f5d34a"/>`),
  objG("wallphone", "phone", "điện thoại", 300.3, 630, 104, `
   <rect class="hit" x="612" y="110" width="40" height="70"/>
   <rect x="614" y="114" width="34" height="58" rx="6" fill="#fffdf9" stroke="#9aa6af" stroke-width="1.5"/><rect x="618" y="118" width="10" height="50" rx="5" fill="#3a3f46"/>
   <g fill="#c9d1d8"><circle cx="636" cy="128" r="2"/><circle cx="642" cy="128" r="2"/><circle cx="636" cy="136" r="2"/><circle cx="642" cy="136" r="2"/><circle cx="636" cy="144" r="2"/><circle cx="642" cy="144" r="2"/></g>
   <path d="M623 168 q-8 18 6 24 q12 4 4 14" stroke="#3a3f46" stroke-width="2" fill="none"/>
   <g class="ga-note"><rect x="652" y="122" width="34" height="30" fill="#fff3b0" transform="rotate(5 669 137)"/><text x="669" y="134" text-anchor="middle" font-size="7" font-family="system-ui" font-weight="700" fill="#5a3d1f" transform="rotate(5 669 137)">Mechanic</text><text x="669" y="145" text-anchor="middle" font-size="7" font-family="system-ui" fill="#5a3d1f" transform="rotate(5 669 137)">2 p.m. ✓</text></g>`),
  objG("workbench", "workbench", "bàn thợ", 362, 870, 316, `
   <rect class="hit" x="744" y="226" width="250" height="138"/>
   <ellipse cx="868" cy="364" rx="122" ry="6" fill="#000" opacity=".16" filter="url(#gaSoft)"/>
   <rect x="744" y="228" width="248" height="14" rx="3" fill="url(#gaWood)"/><rect x="752" y="242" width="10" height="120" fill="#8a5432"/><rect x="974" y="242" width="10" height="120" fill="#8a5432"/>
   <rect x="762" y="300" width="212" height="8" fill="#a8693e"/><rect x="772" y="262" width="96" height="34" rx="3" fill="#b47a4c" stroke="#8a5432"/><rect x="812" y="276" width="16" height="4" rx="2" fill="#5a361e"/>
   <rect x="884" y="316" width="44" height="36" rx="4" fill="#3b6ec2"/><rect x="884" y="316" width="44" height="8" rx="3" fill="#2c529a"/><rect x="934" y="324" width="34" height="28" rx="3" fill="#5fae5a"/>
   <rect x="776" y="320" width="50" height="34" rx="3" fill="#e9e1d4" stroke="#c9b7a2"/><path d="M780 330 h42" stroke="#c9b7a2"/>
   <g class="ga-toolsOut"><g transform="rotate(-20 900 224)"><rect x="880" y="220" width="40" height="5" rx="2" fill="#9aa6af"/><circle cx="878" cy="222" r="6" fill="none" stroke="#9aa6af" stroke-width="3"/></g>
    <rect x="928" y="220" width="22" height="7" rx="3" fill="#e74c3c"/><rect x="948" y="222" width="18" height="3" fill="#9aa6af"/><g fill="#8a949c"><circle cx="964" cy="236" r="2"/><circle cx="970" cy="235" r="2"/><circle cx="958" cy="236" r="1.6"/></g></g>`),
  objG("toolbox", "toolbox", "hộp đồ nghề", 363, 782, 176, `
   <rect class="hit" x="754" y="186" width="72" height="46"/>
   <g class="ga-tbMessy"><path d="M760 202 L752 186 L790 182 L794 200Z" fill="#c0392b"/><rect x="766" y="188" width="6" height="18" rx="2" fill="#f5c45a" transform="rotate(-24 769 206)"/><rect x="784" y="186" width="5" height="20" fill="#9aa6af" transform="rotate(18 786 206)"/><rect x="798" y="190" width="18" height="6" rx="2" fill="#3b6ec2" transform="rotate(-12 806 194)"/></g>
   <rect x="760" y="202" width="62" height="26" rx="3" fill="#e74c3c"/><rect x="760" y="210" width="62" height="3" fill="#c0392b"/>
   <g class="ga-tbTidy"><rect x="760" y="196" width="62" height="8" rx="3" fill="#c0392b"/><path d="M780 196 Q791 186 802 196" stroke="#3a3f46" stroke-width="3" fill="none"/></g>
   <rect x="786" y="214" width="10" height="6" rx="1" fill="#9aa6af"/>`),
  objG("flashlight", "flashlight", "đèn pin", 364, 870, 196, `
   <rect class="hit" x="852" y="206" width="44" height="26"/>
   <rect x="856" y="214" width="26" height="12" rx="4" fill="#f5c45a"/><rect x="880" y="211" width="12" height="18" rx="3" fill="#3a3f46"/><rect x="866" y="212" width="6" height="3" rx="1" fill="#3a3f46" class="ga-flBtn"/>
   <g class="ga-beam"><path d="M892 212 L1000 186 L1000 256 L892 228Z" fill="url(#gaBeam)"/><ellipse cx="892" cy="220" rx="3" ry="8" fill="#fff3b0"/></g>`),
  objG("batterycharger", "battery charger", "bộ sạc ắc quy", 365, 880, 254, `
   <rect class="hit" x="926" y="190" width="58" height="42"/>
   <rect x="930" y="196" width="48" height="32" rx="4" fill="#3a3f46"/><rect x="936" y="202" width="24" height="12" rx="2" fill="#2f3a2f"/>
   <circle class="ga-chLed" cx="968" cy="208" r="3.5" fill="#5a636c"/><rect x="936" y="218" width="36" height="5" rx="2" fill="#f5c45a"/>
   <g class="ga-cableCoil"><path d="M954 228 q-6 10 6 12 q12 2 4 12" stroke="#e74c3c" stroke-width="2.5" fill="none"/><path d="M960 228 q6 10 -4 14" stroke="#3a3f46" stroke-width="2.5" fill="none"/></g>
   <g class="ga-cable"><path d="M948 228 C930 330 840 340 760 430" stroke="#e74c3c" stroke-width="3" fill="none"/><path d="M956 228 C944 340 850 350 770 436" stroke="#3a3f46" stroke-width="3" fill="none"/></g>`),
  objG("garagebroom", "broom", "cái chổi", 440, 140, 290, `
   <rect class="hit" x="122" y="300" width="36" height="146"/>
   <g transform="rotate(-6 140 440)"><rect x="137" y="300" width="6" height="110" rx="3" fill="#c98f5e"/><path d="M126 406 L154 406 L160 444 L120 444Z" fill="#e8c06a"/><path d="M126 418 H154" stroke="#c99a3a" stroke-width="2"/></g>
   <g class="ga-dirt"><rect class="hit" x="760" y="586" width="130" height="40"/><g fill="#a68a64"><ellipse cx="800" cy="604" rx="10" ry="4" opacity=".6"/><ellipse cx="840" cy="612" rx="14" ry="4" opacity=".5"/><circle cx="820" cy="598" r="2"/><circle cx="866" cy="606" r="2"/><circle cx="782" cy="614" r="1.6"/></g>
    <g fill="#d98c3c"><path d="M812 612 q6 -8 12 0 q-6 4 -12 0z"/><path d="M856 596 q6 -8 12 0 q-6 4 -12 0z" fill="#c56b3c"/></g></g>`),
  objG("garagebin", "trash bin", "thùng rác", 516, 100, 446, `
   <rect class="hit" x="70" y="452" width="62" height="68"/>
   <ellipse cx="100" cy="516" rx="28" ry="5" fill="#000" opacity=".18" filter="url(#gaSoft)"/>
   <path d="M76 466 L124 466 L120 514 L80 514Z" fill="#5a636c"/><rect x="72" y="460" width="56" height="8" rx="3" fill="#3a3f46"/><path d="M84 474 L86 508 M100 474 V508 M116 474 L114 508" stroke="#7a838c" stroke-width="2"/>
   <g class="ga-binFull"><path d="M78 462 Q76 444 90 442 Q100 432 112 440 Q126 442 124 462Z" fill="#3b3f46"/><rect x="104" y="436" width="14" height="10" rx="2" fill="#d9b27a" transform="rotate(14 111 441)"/></g>`),
  objG("bucket", "bucket", "cái xô", 620, 124, 548, `
   <rect class="hit" x="90" y="564" width="66" height="58"/>
   <ellipse cx="123" cy="620" rx="30" ry="5" fill="#000" opacity=".18" filter="url(#gaSoft)"/>
   <path d="M98 576 L148 576 L144 618 L102 618Z" fill="#3b6ec2"/><ellipse cx="123" cy="576" rx="25" ry="6" fill="#5f8fd8"/><path d="M98 578 Q123 548 148 578" stroke="#9aa6af" stroke-width="2.5" fill="none"/>
   <g class="ga-bWater"><ellipse cx="123" cy="577" rx="21" ry="4" fill="#9fd3f0"/></g>
   <g class="ga-bSoap" fill="#fff" stroke="#bcd8ea"><circle cx="110" cy="574" r="5"/><circle cx="120" cy="571" r="6"/><circle cx="132" cy="573" r="5"/><circle cx="140" cy="575" r="3.5"/></g>
   <g class="ga-bDirty"><ellipse cx="123" cy="577" rx="21" ry="4" fill="#a68a64"/></g>
   <rect x="128" y="566" width="18" height="8" rx="2" fill="#f5d34a" transform="rotate(-10 137 570)"/>
   <g class="ga-hoseWater" stroke="#8ccbf0" stroke-width="3" stroke-dasharray="5 6" fill="none"><path d="M120 614 Q140 590 128 578"/></g>`),
  objG("car", "car", "xe ô tô", 540, 640, 392, `
   <rect class="hit" x="246" y="396" width="500" height="160"/>
   <ellipse cx="490" cy="548" rx="250" ry="12" fill="#000" opacity=".2" filter="url(#gaSoft)"/>
   <g class="ga-carBody">
    <path d="M256 500 L258 468 Q262 450 286 446 L360 440 L404 404 Q414 396 430 396 L566 396 Q584 396 596 406 L640 444 L712 452 Q736 456 738 478 L740 506 Q740 520 724 520 L270 520 Q256 520 256 500Z" fill="url(#gaCar)" stroke="#2c6a92" stroke-width="2"/>
    <path d="M378 444 L414 410 Q420 404 430 404 L488 404 L488 444Z" fill="url(#gaGlass)" stroke="#2c6a92" stroke-width="2"/>
    <path d="M498 404 L560 404 Q574 404 582 412 L612 444 L498 444Z" fill="url(#gaGlass)" stroke="#2c6a92" stroke-width="2"/>
    <g class="ga-glassDust" fill="#c9b79a" opacity=".55"><ellipse cx="560" cy="424" rx="18" ry="6"/><circle cx="530" cy="430" r="4"/><circle cx="590" cy="434" r="3"/></g>
    <g class="ga-dash"><rect x="560" y="430" width="40" height="10" rx="2" fill="#3a3f46"/><circle cx="574" cy="435" r="3" fill="#8fe28f" class="ga-dashLed"/><g class="ga-dashDust" fill="#c9b79a"><circle cx="586" cy="434" r="1.6"/><circle cx="592" cy="436" r="1.4"/></g></g>
    <path d="M492 444 L492 516" stroke="#2c6a92" stroke-width="2"/><rect x="460" y="458" width="20" height="5" rx="2" fill="#2c6a92"/><rect x="548" y="458" width="20" height="5" rx="2" fill="#2c6a92"/>
    <g class="ga-door"><path d="M494 446 L612 446 L610 516 L494 516Z" fill="#2c6a92" opacity=".35"/></g>
    <rect x="256" y="478" width="18" height="12" rx="3" fill="#e74c3c"/><rect x="722" y="470" width="18" height="12" rx="4" fill="#fff3b0"/>
    <g class="ga-headlight"><ellipse cx="760" cy="478" rx="40" ry="14" fill="#fff3b0" opacity=".5"/></g>
    <rect x="252" y="502" width="40" height="10" rx="4" fill="#9aa6af"/><rect x="704" y="502" width="40" height="10" rx="4" fill="#9aa6af"/>
    <path d="M300 470 Q490 462 700 474" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none"/>
    <g class="ga-mud" fill="#8a6a44" opacity=".6"><ellipse cx="300" cy="500" rx="16" ry="6"/><ellipse cx="420" cy="506" rx="22" ry="5"/><circle cx="560" cy="490" r="5"/><ellipse cx="680" cy="504" rx="18" ry="5"/><circle cx="460" cy="478" r="3.5"/><circle cx="640" cy="470" r="3"/></g>
    <g class="ga-soap" fill="#fff" stroke="#bcd8ea"><circle cx="330" cy="476" r="8"/><circle cx="344" cy="470" r="6"/><circle cx="440" cy="488" r="9"/><circle cx="520" cy="474" r="7"/><circle cx="600" cy="490" r="9"/><circle cx="680" cy="480" r="7"/><circle cx="560" cy="420" r="6"/></g>
    <g class="ga-shine">${sparkle(330, 466, 8)}${sparkle(560, 418, 7)}${sparkle(690, 470, 6)}</g>
    <g class="ga-hoodLid"><path d="M640 444 L712 452 Q730 454 736 466 L644 456Z" fill="#5fa3cd" stroke="#2c6a92" stroke-width="2"/></g>
    <g class="ga-engineBay"><path d="M644 444 L734 456 L736 470 L644 470Z" fill="#3a3f46"/><rect x="666" y="446" width="30" height="18" rx="2" fill="#2f3439"/><rect x="670" y="442" width="6" height="5" fill="#e74c3c"/><rect x="686" y="442" width="6" height="5" fill="#3a3f46" stroke="#9aa6af"/>
     <circle class="ga-batLed" cx="681" cy="455" r="3.5" fill="#e74c3c"/><path d="M704 450 h22 M704 458 h20" stroke="#5a636c" stroke-width="3"/>
     <path class="ga-hoodUp" d="M644 444 L668 372 L736 380 L712 452Z" fill="#5fa3cd" stroke="#2c6a92" stroke-width="2"/></g>
    <g class="ga-exhaust" fill="#d6d9dc" opacity=".8"><circle cx="242" cy="508" r="7"/><circle cx="226" cy="500" r="10"/><circle cx="206" cy="492" r="12"/></g>
   </g>
   <g class="ga-wheelR"><circle cx="340" cy="520" r="30" fill="#2f3439"/><circle cx="340" cy="520" r="15" fill="url(#gaChrome)"/><circle cx="340" cy="520" r="4" fill="#5a636c"/></g>`),
  objG("cartire", "tire", "lốp xe", 541, 650, 566, `
   <rect class="hit" x="612" y="486" width="76" height="70"/>
   <g class="ga-tireOk"><circle cx="650" cy="520" r="30" fill="#2f3439"/><circle cx="650" cy="520" r="15" fill="url(#gaChrome)"/><circle cx="650" cy="520" r="4" fill="#5a636c"/></g>
   <g class="ga-tireFlat"><path d="M606 550 Q602 534 614 520 Q630 504 650 504 Q670 504 686 520 Q698 534 694 550Z" fill="#2f3439"/><path d="M612 550 L688 550" stroke="#1f2327" stroke-width="3"/><ellipse cx="650" cy="530" rx="15" ry="12" fill="url(#gaChrome)"/><path d="M622 546 q6 -8 12 -2 M666 544 q6 -6 12 2" stroke="#4a5058" stroke-width="2" fill="none"/><circle cx="650" cy="530" r="4" fill="#5a636c"/></g>
   <g class="ga-tireTag"><rect x="672" y="560" width="58" height="16" rx="4" fill="#fffdf9" stroke="#e74c3c"/><text x="701" y="571" text-anchor="middle" font-size="9" font-family="system-ui" font-weight="700" fill="#e74c3c">18 PSI ↓</text></g>
   <g class="ga-tireTagOk"><rect x="672" y="560" width="58" height="16" rx="4" fill="#fffdf9" stroke="#5fae5a"/><text x="701" y="571" text-anchor="middle" font-size="9" font-family="system-ui" font-weight="700" fill="#4c9a49">32 PSI ✓</text></g>`),
  objG("airpump", "air pump", "máy bơm hơi", 546, 864, 456, `
   <rect class="hit" x="834" y="464" width="62" height="86"/>
   <ellipse cx="864" cy="546" rx="30" ry="5" fill="#000" opacity=".18" filter="url(#gaSoft)"/>
   <rect x="842" y="490" width="44" height="54" rx="6" fill="#e74c3c"/><rect x="846" y="494" width="36" height="8" rx="2" fill="#c0392b"/>
   <circle cx="864" cy="520" r="11" fill="#fffdf9" stroke="#3a3f46" stroke-width="2"/><path class="ga-needle" d="M864 520 L857 514" stroke="#3a3f46" stroke-width="2" stroke-linecap="round"/>
   <rect x="852" y="472" width="24" height="20" rx="4" fill="#3a3f46"/><circle class="ga-pumpLed" cx="870" cy="480" r="3" fill="#5a636c"/>
   <path class="ga-pumpHose" d="M846 530 Q820 560 790 548 Q760 538 740 556" stroke="#3a3f46" stroke-width="3.5" fill="none"/>
   <path class="ga-pumpHoseOn" d="M846 530 Q800 580 700 560 Q680 556 676 540" stroke="#3a3f46" stroke-width="3.5" fill="none"/>`),
  ...garageDecor
].join("\n");

const garageCss = `
#room .ga-panels{transition:transform .9s ease-in-out;transform-origin:0 34px}#room [data-ga_door="open"] .ga-panels{transform:scaleY(.06)}
#room .ga-keysHook{display:none}#room [data-ga_keys="hook"] .ga-keysHook{display:inline}
#room .ga-note{display:none}#room [data-ga_mechanic="called"] .ga-note{display:inline}
#room .ga-toolsOut{display:none}#room [data-ga_tools="out"] .ga-toolsOut{display:inline}
#room .ga-tbTidy{display:none}#room [data-ga_toolbox="tidy"] .ga-tbTidy{display:inline}#room [data-ga_toolbox="tidy"] .ga-tbMessy{display:none}
#room .ga-beam{display:none}#room [data-ga_flash="on"] .ga-beam{display:inline}#room [data-ga_flash="on"] .ga-flBtn{fill:#5fae5a}
#room .ga-cable{display:none}#room [data-ga_charger="plugged"] .ga-cable{display:inline}#room [data-ga_charger="plugged"] .ga-cableCoil{display:none}
#room [data-ga_battery="charging"] .ga-chLed{fill:#f5a623;animation:r2Pulse .9s ease-in-out infinite}#room [data-ga_charger="plugged"][data-ga_battery="ok"] .ga-chLed{fill:#5fd38a}
#room [data-ga_battery="charging"] .ga-batLed{fill:#f5a623;animation:r2Pulse .9s ease-in-out infinite}#room [data-ga_battery="ok"] .ga-batLed{fill:#5fd38a}
#room .ga-dirt{display:none}#room [data-ga_floor="dirty"] .ga-dirt{display:inline}
#room .ga-binFull{display:none}#room [data-ga_bin="full"] .ga-binFull{display:inline}
#room .ga-bWater,#room .ga-bSoap,#room .ga-bDirty{display:none}#room [data-ga_bucket="soapy"] .ga-bWater,#room [data-ga_bucket="soapy"] .ga-bSoap{display:inline}#room [data-ga_bucket="dirty"] .ga-bDirty{display:inline}
#room .ga-hoseWater{display:none}#room [data-ga_hose="on"] .ga-hoseWater{display:inline;animation:r2Flow .4s linear infinite}
#room .ga-mud{display:none}#room [data-ga_car="dirty"] .ga-mud{display:inline}
#room .ga-soap{display:none}#room [data-ga_car="soapy"] .ga-soap{display:inline}
#room .ga-shine{display:none}#room [data-ga_car="clean"] .ga-shine{display:inline;animation:r2Twinkle 1.6s ease-in-out infinite}
#room .ga-glassDust{display:none}#room [data-ga_glass="dusty"] .ga-glassDust{display:inline}
#room .ga-dashDust{display:none}#room [data-ga_dash="dusty"] .ga-dashDust{display:inline}
#room .ga-door{display:none}#room [data-ga_cardoor="yes"] .ga-door{display:inline}
#room .ga-engineBay{display:none}#room [data-ga_hood="open"] .ga-engineBay{display:inline}#room [data-ga_hood="open"] .ga-hoodLid{display:none}
#room .ga-headlight,#room .ga-exhaust,#room .ga-dashLed{display:none}#room [data-ga_engine="on"] .ga-headlight{display:inline}#room [data-ga_engine="on"] .ga-dashLed{display:inline}
#room [data-ga_engine="on"] .ga-exhaust{display:inline;animation:r2Steam 1.2s ease-in-out infinite}
#room [data-ga_engine="on"] .ga-carBody{animation:r2Bob .25s ease-in-out infinite}
#room #o-car .vec,#room #o-cartire .vec{transition:transform 1s ease-in-out}
#room [data-ga_parked="crooked"] #o-car .vec,#room [data-ga_parked="crooked"] #o-cartire .vec{transform:translate(-26px,6px) rotate(-1.6deg);transform-origin:490px 520px}
#room .ga-tireFlat{display:none}#room [data-ga_tire="flat"] .ga-tireFlat{display:inline}#room [data-ga_tire="flat"] .ga-tireOk{display:none}
#room .ga-tireTag,#room .ga-tireTagOk{display:none}#room [data-ga_tirechecked="yes"][data-ga_tire="flat"] .ga-tireTag{display:inline}#room [data-ga_tirechecked="yes"][data-ga_tire="ok"] .ga-tireTagOk{display:inline}
#room .ga-pumpHoseOn{display:none}#room [data-ga_pump="on"] .ga-pumpHoseOn{display:inline}#room [data-ga_pump="on"] .ga-pumpHose{display:none}
#room [data-ga_pump="on"] .ga-pumpLed{fill:#5fd38a}#room [data-ga_pump="on"] .ga-needle{transform:rotate(90deg);transform-origin:864px 520px;transition:transform 1.4s}
#room [data-detail]{pointer-events:none}
#room .ga-hourH{transform-origin:596px 102px;animation:r2Spin 600s linear infinite}#room .ga-minH{transform-origin:596px 102px;animation:r2Spin 50s linear infinite}
@media (prefers-reduced-motion: reduce){#room [data-detail] *,#room [class^="ga-"]{animation:none!important;transition:none!important}}
${sharedKeyframes}
`;

const GA_W0 = { ga_door: "closed", ga_keys: "hook", ga_car: "dirty", ga_glass: "dusty", ga_dash: "dusty", ga_cardoor: "no", ga_hood: "closed", ga_battery: "dead",
  ga_batchecked: "no", ga_charger: "off", ga_engine: "off", ga_parked: "crooked", ga_tire: "flat", ga_tirechecked: "no", ga_pump: "off", ga_inspected: "no",
  ga_mechanic: "none", ga_bucket: "empty", ga_hose: "off", ga_floor: "dirty", ga_bin: "full", ga_toolbox: "messy", ga_tools: "out", ga_flash: "off" };

const garage = {
  id: "garage", name: "Garage", nameVi: "Nhà để xe",
  shellSvg: garageShell, worldSvg: garageWorld, W0: GA_W0,
  spots: {
    ga_doorBtn: { x: 548, y: 398, d: 1 }, ga_keys: { x: 590, y: 398, d: 1 }, ga_phone: { x: 636, y: 398, d: 1 }, ga_bench: { x: 900, y: 398, d: 1 },
    ga_toolbox: { x: 790, y: 398, d: 1 }, ga_flash: { x: 868, y: 398, d: 1 }, ga_charger: { x: 948, y: 398, d: 1 }, ga_hood: { x: 778, y: 512, d: -1 },
    ga_tire: { x: 700, y: 588, d: -1 }, ga_pump: { x: 812, y: 560, d: 1 }, ga_carDoor: { x: 470, y: 590, d: 1 }, ga_windshield: { x: 590, y: 588, d: 1 },
    ga_bucket: { x: 196, y: 604, d: -1 }, ga_broom: { x: 186, y: 450, d: -1 }, ga_floorDirt: { x: 752, y: 608, d: 1 }, ga_bin: { x: 166, y: 520, d: -1 },
    ga_door: { x: 930, y: 610, d: 1 }
  },
  obstacles: [{ x1: 236, x2: 744, y1: 420, y2: 562 }, { x1: 834, x2: 896, y1: 470, y2: 548 }, { x1: 64, x2: 134, y1: 456, y2: 522 }, { x1: 86, x2: 160, y1: 566, y2: 626 }, { x1: 816, x2: 864, y1: 406, y2: 424 }, { x1: 954, x2: 992, y1: 520, y2: 562 }],
  entry: { x: 920, y: 600, d: -1 },
  objects: {
    car: { en: "car", vi: "xe ô tô", ipa: "/kɑːr/", acts: ["inspect_car", "open_car_hood", "check_battery", "close_car_hood", "start_car", "turn_off_engine", "park_car", "wipe_windshield", "clean_dashboard", "wash_car"] },
    cartire: { en: "tire", vi: "lốp xe", ipa: "/taɪər/", acts: ["check_tire", "inflate_tire"] },
    airpump: { en: "air pump", vi: "máy bơm hơi", ipa: "/ˈeə pʌmp/", acts: ["inflate_tire"] },
    batterycharger: { en: "battery charger", vi: "bộ sạc ắc quy", ipa: "/ˈbæt.ər.i ˌtʃɑː.dʒər/", acts: ["charge_battery", "unplug_battery_charger"] },
    carkeys: { en: "car keys", vi: "chìa khoá xe", ipa: "/kɑː kiːz/", acts: ["pick_up_car_keys", "hang_up_car_keys"] },
    garagedoor: { en: "garage door", vi: "cửa ga-ra", ipa: "/ˈɡær.ɑːʒ dɔːr/", acts: ["open_garage_door", "close_garage_door"] },
    wallphone: { en: "phone", vi: "điện thoại", ipa: "/fəʊn/", acts: ["call_mechanic"] },
    toolbox: { en: "toolbox", vi: "hộp đồ nghề", ipa: "/ˈtuːl.bɒks/", acts: ["organize_toolbox", "put_tools_away"] },
    workbench: { en: "workbench", vi: "bàn thợ", ipa: "/ˈwɜːk.bentʃ/", acts: ["put_tools_away"] },
    flashlight: { en: "flashlight", vi: "đèn pin", ipa: "/ˈflæʃ.laɪt/", acts: ["turn_on_flashlight", "turn_off_flashlight"] },
    bucket: { en: "bucket", vi: "cái xô", ipa: "/ˈbʌk.ɪt/", acts: ["fill_bucket", "wash_car"] },
    garagebroom: { en: "broom", vi: "cái chổi", ipa: "/bruːm/", acts: ["sweep_garage"] },
    garagebin: { en: "trash bin", vi: "thùng rác", ipa: "/ˈtræʃ bɪn/", acts: ["empty_garage_bin"] }
  },
  actions: garageActions,
  props: GA_PROPS,
  applyState(W, root) { mirrorState(W, GA_W0, root); },
  css: garageCss,
  catalog: cat("ga_", [
    ["car", "/kɑːr/", "xe ô tô", "vehicle"], ["tire", "/taɪər/", "lốp xe", "car part"], ["spare tire", "/ˌspeə ˈtaɪər/", "lốp dự phòng", "car part"],
    ["wheel", "/wiːl/", "bánh xe", "car part"], ["hood", "/hʊd/", "nắp ca-pô", "car part"], ["trunk", "/trʌŋk/", "cốp xe", "car part"],
    ["windshield", "/ˈwɪnd.ʃiːld/", "kính chắn gió", "car part"], ["windshield wipers", "/ˈwɪnd.ʃiːld ˌwaɪ.pəz/", "cần gạt nước", "car part"], ["headlights", "/ˈhed.laɪts/", "đèn pha", "car part"],
    ["dashboard", "/ˈdæʃ.bɔːd/", "táp-lô", "car part"], ["steering wheel", "/ˈstɪə.rɪŋ wiːl/", "vô lăng", "car part"], ["seat belt", "/ˈsiːt belt/", "dây an toàn", "car part"],
    ["engine", "/ˈen.dʒɪn/", "động cơ", "car part"], ["car battery", "/ˈkɑː ˌbæt.ər.i/", "ắc quy xe", "car part"], ["license plate", "/ˈlaɪ.səns pleɪt/", "biển số xe", "car part"],
    ["side mirror", "/ˈsaɪd ˌmɪr.ər/", "gương chiếu hậu", "car part"], ["bumper", "/ˈbʌm.pər/", "cản xe", "car part"], ["exhaust pipe", "/ɪɡˈzɔːst paɪp/", "ống xả", "car part"],
    ["car keys", "/kɑː kiːz/", "chìa khoá xe", "personal"], ["garage door", "/ˈɡær.ɑːʒ dɔːr/", "cửa ga-ra", "room"], ["battery charger", "/ˈbæt.ər.i ˌtʃɑː.dʒər/", "bộ sạc ắc quy", "tool"],
    ["air pump", "/ˈeə pʌmp/", "máy bơm hơi", "tool"], ["pressure gauge", "/ˈpreʃ.ə ɡeɪdʒ/", "đồng hồ đo áp suất", "tool"], ["toolbox", "/ˈtuːl.bɒks/", "hộp đồ nghề", "tool"],
    ["hammer", "/ˈhæm.ər/", "cái búa", "tool"], ["screwdriver", "/ˈskruːˌdraɪ.vər/", "tua vít", "tool"], ["wrench", "/rentʃ/", "cờ lê", "tool"],
    ["pliers", "/ˈplaɪ.əz/", "cái kìm", "tool"], ["saw", "/sɔː/", "cái cưa", "tool"], ["drill", "/drɪl/", "máy khoan", "tool"],
    ["tape measure", "/ˈteɪp ˌmeʒ.ər/", "thước dây", "tool"], ["nails", "/neɪlz/", "đinh", "tool"], ["screws", "/skruːz/", "đinh vít", "tool"],
    ["flashlight", "/ˈflæʃ.laɪt/", "đèn pin", "tool"], ["extension cord", "/ɪkˈsten.ʃən kɔːd/", "dây điện nối dài", "tool"], ["ladder", "/ˈlæd.ər/", "cái thang", "tool"],
    ["workbench", "/ˈwɜːk.bentʃ/", "bàn thợ", "furniture"], ["pegboard", "/ˈpeɡ.bɔːd/", "bảng treo dụng cụ", "storage"], ["shelf", "/ʃelf/", "cái kệ", "storage"],
    ["storage box", "/ˈstɔː.rɪdʒ bɒks/", "thùng đựng đồ", "storage"], ["bucket", "/ˈbʌk.ɪt/", "cái xô", "cleaning"], ["sponge", "/spʌndʒ/", "miếng bọt biển", "cleaning"],
    ["hose", "/həʊz/", "ống nước", "cleaning"], ["car wash soap", "/ˈkɑː wɒʃ səʊp/", "xà phòng rửa xe", "cleaning"], ["broom", "/bruːm/", "cái chổi", "cleaning"],
    ["dustpan", "/ˈdʌst.pæn/", "cái hốt rác", "cleaning"], ["rag", "/ræɡ/", "giẻ lau", "cleaning"], ["trash bin", "/ˈtræʃ bɪn/", "thùng rác", "cleaning"],
    ["fire extinguisher", "/ˈfaɪər ɪkˌstɪŋ.ɡwɪ.ʃər/", "bình chữa cháy", "safety"], ["first aid kit", "/ˌfɜːst ˈeɪd kɪt/", "hộp sơ cứu", "safety"], ["safety goggles", "/ˈseɪf.ti ˌɡɒɡ.əlz/", "kính bảo hộ", "safety"],
    ["work gloves", "/ˈwɜːk ɡlʌvz/", "găng tay lao động", "safety"], ["traffic cone", "/ˈtræf.ɪk kəʊn/", "cọc tiêu giao thông", "safety"], ["paint can", "/ˈpeɪnt kæn/", "thùng sơn", "storage"],
    ["bicycle", "/ˈbaɪ.sɪ.kəl/", "xe đạp", "vehicle"], ["helmet", "/ˈhel.mət/", "mũ bảo hiểm", "safety"], ["motorbike", "/ˈməʊ.tə.baɪk/", "xe máy", "vehicle"]
  ])
};

/* ======================================================================
   GARDEN  (prefix gd_)
   Fence row: tap+can (165-260), bird feeder (318), flower pots (400-590), rose bush (615-715), compost (728-800), gate (836-944).
   Left: house wall with back door + outdoor light. Front: patio table/chair, veg bed, soil bag, wheelbarrow, leaves, branches.
   ====================================================================== */
const GDV = {
  fill: ["fill", "/fɪl/", "đổ đầy"], can: ["watering can", "/ˈwɔː.tər.ɪŋ kæn/", "bình tưới cây"], tap: ["outdoor tap", "/ˈaʊt.dɔː tæp/", "vòi nước ngoài trời"],
  water: ["water", "/ˈwɔː.tər/", "tưới nước; nước"], plants: ["plants", "/plɑːnts/", "cây cối"], thirsty: ["thirsty", "/ˈθɜː.sti/", "khát nước (héo)"],
  dig: ["dig", "/dɪɡ/", "đào"], hole: ["hole", "/həʊl/", "cái hố"], shovel: ["shovel", "/ˈʃʌv.əl/", "cái xẻng"], plant: ["plant", "/plɑːnt/", "trồng; cây"],
  seeds: ["seeds", "/siːdz/", "hạt giống"], soil: ["soil", "/sɔɪl/", "đất trồng"], cover: ["cover", "/ˈkʌv.ər/", "phủ, che"], pull: ["pull", "/pʊl/", "kéo, nhổ"],
  weeds: ["weeds", "/wiːdz/", "cỏ dại"], rake: ["rake", "/reɪk/", "cào; cái cào"], leaves: ["leaves", "/liːvz/", "lá cây (số nhiều của leaf)"],
  compost: ["compost bin", "/ˈkɒm.pɒst bɪn/", "thùng ủ phân"], sweep: ["sweep", "/swiːp/", "quét"], patio: ["patio", "/ˈpæt.i.əʊ/", "sân lát đá (hiên)"],
  broom: ["broom", "/bruːm/", "cái chổi"], pickup: ["pick up", "/pɪk ʌp/", "nhặt lên"], branches: ["branches", "/ˈbrɑːn.tʃɪz/", "cành cây"],
  trim: ["trim", "/trɪm/", "tỉa"], shears: ["pruning shears", "/ˈpruː.nɪŋ ʃɪəz/", "kéo tỉa cành"], bush: ["rose bush", "/ˈrəʊz bʊʃ/", "bụi hoa hồng"],
  feed: ["feed", "/fiːd/", "cho ăn"], birds: ["birds", "/bɜːdz/", "những con chim"], feeder: ["bird feeder", "/ˈbɜːd ˌfiː.dər/", "máng ăn cho chim"],
  clean: ["clean", "/kliːn/", "rửa sạch"], bowl: ["pet bowl", "/ˈpet bəʊl/", "bát ăn của thú cưng"], fresh: ["fresh water", "/freʃ ˈwɔː.tər/", "nước sạch"],
  open: ["open", "/ˈəʊ.pən/", "mở"], close: ["close", "/kləʊz/", "đóng"], gate: ["gate", "/ɡeɪt/", "cổng"], puton: ["put on", "/pʊt ɒn/", "đeo, mặc vào"],
  takeoff: ["take off", "/teɪk ɒf/", "tháo, cởi ra"], gloves: ["gardening gloves", "/ˈɡɑː.dən.ɪŋ ɡlʌvz/", "găng tay làm vườn"], bring: ["bring", "/brɪŋ/", "mang (đến)"],
  inside: ["inside", "/ɪnˈsaɪd/", "vào trong (nhà)"], outside: ["outside", "/ˌaʊtˈsaɪd/", "ra ngoài"], tools: ["tools", "/tuːlz/", "dụng cụ"],
  sit: ["sit", "/sɪt/", "ngồi"], garden: ["garden", "/ˈɡɑː.dən/", "khu vườn"], relax: ["relax", "/rɪˈlæks/", "thư giãn"], turnon: ["turn on", "/tɜːn ɒn/", "bật"],
  turnoff: ["turn off", "/tɜːn ɒf/", "tắt"], light: ["garden light", "/ˈɡɑː.dən laɪt/", "đèn sân vườn"], wheelbarrow: ["wheelbarrow", "/ˈwiːlˌbær.əʊ/", "xe cút kít"]
};
const gdA = mkAct(GDV);

const gardenActions = [
  gdA("fill_watering_can", "wateringcan", "Fill the watering can", "Đổ đầy bình tưới", "I'm filling the watering can at the tap.", "Tôi đang hứng nước vào bình tưới ở vòi.", ["filling", "watering", "can"], ["fill", "can", "tap"],
    "fill → fill<b>ing</b>. <b>at the tap</b> = ở chỗ vòi nước (at + địa điểm cụ thể).", ["I'm filling the watering can", "at the tap."], ["fill", "feel", "fall"],
    ["I'm filling <b>the bucket</b> at the tap.", "I'm filling <b>my water bottle</b>."],
    W => W.gd_can === "full" ? "Bình tưới đã đầy nước rồi." : null,
    W => [["walk", "gd_tap"], ["pose", "bend", 500], ["set", "gd_tap", "on"], ["wait", 1200], ["set", "gd_can", "full"], ["pose", "reach", 400], ["set", "gd_tap", "off"], ["pose", "idle", 1]],
    ["fill the watering can", "fill the watering can with water", "đổ đầy nước vào bình tưới"]),
  gdA("water_garden_plants", "flowerpots", "Water the plants", "Tưới cây", "I'm watering the plants.", "Tôi đang tưới cây.", ["watering", "plants"], ["water", "plants", "thirsty"],
    "<b>water</b> vừa là danh từ (nước) vừa là động từ (tưới): water <b>the plants</b>. Cây héo = the plants look <b>thirsty</b>.", ["I'm watering", "the plants."], ["water", "waiter", "winter"],
    ["I'm watering <b>the flowers</b>.", "I'm watering <b>the lawn</b>."],
    W => W.gd_can !== "full" ? "Bình tưới đang rỗng — hãy đổ đầy nước trước (Fill the watering can)." : (W.gd_plants === "watered" && W.gd_hole !== "covered") ? "Cây đã được tưới rồi." : null,
    W => [["walk", "gd_tap"], ["pose", "bend", 400], ["set", "gd_canat", "hand"], ["spawn", "gd_canP"], ...(W.gd_plants !== "watered" ? [["walk", "gd_pots"], ["pose", "water", 1700], ["set", "gd_plants", "watered"]] : []),
      ...(W.gd_hole === "covered" ? [["walk", "gd_bed"], ["pose", "water", 1100], ["set", "gd_hole", "sprout"]] : []), ["walk", "gd_tap"], ["pose", "bend", 400], ["despawn"], ["set", "gd_can", "empty"], ["set", "gd_canat", "ground"], ["pose", "idle", 1]],
    ["water the plants", "water the thirsty plants", "tưới những cây đang héo"]),
  gdA("dig_hole", "vegbed", "Dig a hole", "Đào hố", "I'm digging a hole with a shovel.", "Tôi đang đào một cái hố bằng xẻng.", ["digging", "hole", "shovel"], ["dig", "hole", "shovel"],
    "dig → dig<b>g</b>ing (gấp đôi g). Quá khứ bất quy tắc: <b>dug</b>. Nói <b>a</b> hole vì là lần đầu nhắc tới.", ["I'm digging a hole", "with a shovel."], ["dig", "big", "dog"],
    ["I'm digging <b>in the garden</b>.", "I'm digging <b>a small hole for the tree</b>."],
    W => W.gd_tools !== "out" ? "Xẻng đang cất trong nhà — hãy mang dụng cụ ra (Take the tools outside)." : W.gd_hole !== "none" ? "Luống đất đã có hố rồi." : null,
    W => [["walk", "gd_barrow"], ["pose", "reach", 400], ["spawn", "gd_shovelP"], ["walk", "gd_bed"], ["pose", "bend", 500], ["pose", "reach", 350], ["pose", "bend", 500], ["pose", "reach", 350], ["set", "gd_hole", "dug"], ["walk", "gd_barrow"], ["pose", "reach", 300], ["despawn"], ["pose", "idle", 1]],
    ["dig a hole", "dig a small hole in the vegetable bed", "đào một cái hố trong luống rau"]),
  gdA("plant_seed", "seedpacket", "Plant the seeds", "Gieo hạt", "I'm planting the seeds in the hole.", "Tôi đang gieo hạt giống vào hố.", ["planting", "seeds", "hole"], ["plant", "seeds", "hole"],
    "<b>plant</b> vừa là động từ (trồng, gieo) vừa là danh từ (cái cây). <b>in</b> the hole = vào trong hố.", ["I'm planting the seeds", "in the hole."], ["seeds", "sits", "seats"],
    ["I'm planting <b>a tree</b> in the garden.", "I'm planting <b>tomatoes</b> in the bed."],
    W => W.gd_hole === "none" ? "Hãy đào hố trước (Dig a hole)." : W.gd_hole !== "dug" ? "Hạt giống đã được gieo rồi." : null,
    W => [["walk", "gd_table"], ["pose", "reach", 450], ["spawn", "gd_seedsP"], ["walk", "gd_bed"], ["pose", "bend", 1200], ["despawn"], ["set", "gd_hole", "seeded"], ["pose", "idle", 1]],
    ["plant the seeds", "plant the seeds in the hole", "gieo hạt vào hố"]),
  gdA("add_soil", "soilbag", "Cover the seeds with soil", "Phủ đất lên hạt", "I'm covering the seeds with soil.", "Tôi đang phủ đất lên hạt giống.", ["covering", "seeds", "soil"], ["cover", "soil", "seeds"],
    "<b>cover A with B</b> = phủ A bằng B. <b>soil</b> là danh từ không đếm được: <b>some</b> soil, a bag <b>of</b> soil.", ["I'm covering the seeds", "with soil."], ["soil", "soul", "oil"],
    ["I'm covering the table <b>with a cloth</b>.", "I'm covering the pot <b>with a lid</b>."],
    W => W.gd_hole === "dug" ? "Hãy gieo hạt vào hố trước (Plant the seeds)." : W.gd_hole !== "seeded" ? "Chưa có hạt giống nào cần phủ đất." : null,
    W => [["walk", "gd_soil"], ["pose", "bend", 500], ["spawn", "gd_soilP"], ["walk", "gd_bed"], ["pose", "pour", 1000], ["despawn"], ["set", "gd_hole", "covered"], ["pose", "idle", 1]],
    ["cover the seeds with soil", "add some soil and cover the seeds", "phủ đất lên hạt giống"]),
  gdA("pull_weed", "vegbed", "Pull the weeds", "Nhổ cỏ dại", "I'm pulling the weeds out of the vegetable bed.", "Tôi đang nhổ cỏ dại khỏi luống rau.", ["pulling", "weeds"], ["pull", "weeds", "gloves"],
    "<b>pull … out of …</b> = nhổ/kéo … ra khỏi …. weed → weed<b>s</b> (số nhiều).", ["I'm pulling the weeds", "out of the vegetable bed."], ["weeds", "words", "woods"],
    ["I'm pulling <b>a carrot</b> out of the ground.", "I'm pulling the <b>grass</b> out of the path."],
    W => W.gd_weeds === "none" ? "Luống rau không còn cỏ dại." : W.gd_gloves !== "on" ? "Hãy đeo găng tay trước để bảo vệ tay (Put on the gloves)." : null,
    W => [["walk", "gd_bed"], ["pose", "bend", 700], ["spawn", "gd_weedP"], ["pose", "reach", 400], ["set", "gd_weeds", "none"], ["walk", "gd_compost"], ["pose", "reach", 500], ["despawn"], ["pose", "idle", 1]],
    ["pull the weeds", "pull the weeds out of the bed", "nhổ cỏ dại"]),
  gdA("rake_leaves", "leaves", "Rake the leaves", "Cào lá", "I'm raking the leaves into a pile.", "Tôi đang cào lá thành một đống.", ["raking", "leaves", "pile"], ["rake", "leaves"],
    "leaf → <b>leaves</b> (f → ves, giống knife → knives). <b>into a pile</b> = thành một đống.", ["I'm raking the leaves", "into a pile."], ["leaves", "lives", "lips"],
    ["I'm sweeping the dust <b>into a pile</b>.", "I'm raking <b>the grass</b>."],
    W => W.gd_tools !== "out" ? "Cái cào đang cất trong nhà — hãy mang dụng cụ ra (Take the tools outside)." : W.gd_leaves !== "scattered" ? "Lá đã được cào gọn rồi." : null,
    W => [["walk", "gd_barrow"], ["pose", "reach", 400], ["spawn", "gd_rakeP"], ["walk", "gd_leaves"], ["pose", "sweep", 1900], ["set", "gd_leaves", "pile"], ["walk", "gd_barrow"], ["pose", "reach", 300], ["despawn"], ["pose", "idle", 1]],
    ["rake the leaves", "rake the fallen leaves into a pile", "cào lá rụng thành đống"]),
  gdA("put_leaves_in_compost", "compostbin", "Put the leaves in the compost bin", "Bỏ lá vào thùng ủ phân", "I'm putting the leaves in the compost bin.", "Tôi đang bỏ lá vào thùng ủ phân.", ["putting", "leaves", "compost"], ["leaves", "compost"],
    "<b>compost</b> = phân ủ từ lá, vỏ rau. put … <b>in</b> the bin = bỏ vào thùng.", ["I'm putting the leaves", "in the compost bin."], ["compost", "compass", "complete"],
    ["I'm putting <b>the peels</b> in the compost bin.", "I'm putting <b>the bottles</b> in the recycling bin."],
    W => W.gd_leaves === "scattered" ? "Hãy cào lá thành đống trước (Rake the leaves)." : W.gd_leaves === "compost" ? "Lá đã ở trong thùng ủ phân rồi." : null,
    W => [["walk", "gd_leaves"], ["pose", "bend", 600], ["spawn", "gd_leavesP"], ["set", "gd_leaves", "carried"], ["walk", "gd_compost"], ["pose", "reach", 600], ["despawn"], ["set", "gd_leaves", "compost"], ["pose", "idle", 1]],
    ["put the leaves in the compost bin", "carry the leaves to the compost bin", "bỏ lá vào thùng ủ phân"]),
  gdA("sweep_patio", "yardbroom", "Sweep the patio", "Quét sân hiên", "I'm sweeping the patio.", "Tôi đang quét sân hiên.", ["sweeping", "patio"], ["sweep", "patio", "broom"],
    "<b>patio</b> = khoảng sân lát đá cạnh nhà. sweep → sweep<b>ing</b>.", ["I'm sweeping", "the patio."], ["patio", "potato", "radio"],
    ["I'm sweeping <b>the path</b>.", "I'm sweeping <b>the steps</b>."],
    W => W.gd_patio === "clean" ? "Sân hiên đã sạch rồi." : null,
    W => [["walk", "gd_broom"], ["pose", "reach", 400], ["spawn", "gd_broomP"], ["walk", "gd_patio"], ["pose", "sweep", 1700], ["set", "gd_patio", "clean"], ["walk", "gd_broom"], ["pose", "reach", 300], ["despawn"], ["pose", "idle", 1]],
    ["sweep the patio", "sweep the dusty patio", "quét sân hiên"]),
  gdA("pick_up_branches", "branches", "Pick up the branches", "Nhặt cành cây", "I'm picking up the fallen branches.", "Tôi đang nhặt những cành cây bị gãy rơi.", ["picking", "branches"], ["pickup", "branches", "gloves"],
    "<b>fallen</b> (rơi, đổ) là quá khứ phân từ của fall, dùng như tính từ: <b>fallen</b> branches/leaves.", ["I'm picking up", "the fallen branches."], ["branches", "benches", "brushes"],
    ["I'm picking up <b>the fallen leaves</b>.", "I'm picking up <b>the toys</b> on the grass."],
    W => W.gd_branches !== "lawn" ? "Cành cây đã được dọn rồi." : W.gd_gloves !== "on" ? "Hãy đeo găng tay để tránh dằm gỗ (Put on the gloves)." : null,
    W => [["walk", "gd_branches"], ["pose", "bend", 700], ["spawn", "gd_branchP"], ["set", "gd_branches", "carried"], ["walk", "gd_compost"], ["pose", "reach", 500], ["despawn"], ["set", "gd_branches", "compost"], ["pose", "idle", 1]],
    ["pick up the branches", "pick up the fallen branches", "nhặt cành cây gãy"]),
  gdA("trim_plant", "rosebush", "Trim the rose bush", "Tỉa bụi hồng", "I'm trimming the rose bush with pruning shears.", "Tôi đang tỉa bụi hồng bằng kéo tỉa cành.", ["trimming", "bush", "shears"], ["trim", "bush", "shears"],
    "trim → trim<b>m</b>ing (gấp đôi m). <b>shears</b> luôn số nhiều, giống scissors: a pair of shears.", ["I'm trimming the rose bush", "with pruning shears."], ["trim", "tram", "team"],
    ["I'm trimming <b>the hedge</b>.", "I'm trimming <b>my nails</b>."],
    W => W.gd_trim === "trimmed" ? "Bụi hồng đã được tỉa gọn rồi." : W.gd_tools !== "out" ? "Kéo tỉa cành đang cất trong nhà — hãy mang dụng cụ ra (Take the tools outside)." : W.gd_gloves !== "on" ? "Bụi hồng có gai — hãy đeo găng tay trước (Put on the gloves)." : null,
    W => [["walk", "gd_barrow"], ["pose", "reach", 400], ["spawn", "gd_shearsP"], ["walk", "gd_rose"], ["pose", "reach", 500], ["pose", "wipe", 1300], ["set", "gd_trim", "trimmed"], ["walk", "gd_barrow"], ["pose", "reach", 300], ["despawn"], ["pose", "idle", 1]],
    ["trim the rose bush", "trim the overgrown rose bush", "tỉa bụi hồng"]),
  gdA("feed_birds", "birdfeeder", "Feed the birds", "Cho chim ăn", "I'm feeding the birds.", "Tôi đang cho chim ăn.", ["feeding", "birds"], ["feed", "birds", "feeder"],
    "<b>feed</b> + con vật = cho … ăn. feed → feed<b>ing</b>; quá khứ: <b>fed</b>.", ["I'm feeding", "the birds."], ["feed", "food", "fit"],
    ["I'm feeding <b>the cat</b>.", "I'm feeding <b>the fish</b>."],
    W => W.gd_feeder === "full" ? "Máng ăn của chim đã đầy hạt rồi." : null,
    W => [["walk", "gd_feeder"], ["spawn", "gd_birdseedP"], ["pose", "reach", 400], ["pose", "pour", 1000], ["despawn"], ["set", "gd_feeder", "full"], ["pose", "idle", 1]],
    ["feed the birds", "fill the bird feeder and feed the birds", "cho chim ăn"]),
  gdA("clean_pet_bowl", "petbowl", "Clean the pet bowl", "Rửa bát của thú cưng", "I'm cleaning the pet bowl.", "Tôi đang rửa bát nước của thú cưng.", ["cleaning", "bowl"], ["clean", "bowl", "fresh"],
    "<b>pet</b> = thú cưng (chó, mèo...). Sau khi rửa, đổ <b>fresh water</b> (nước sạch).", ["I'm cleaning", "the pet bowl."], ["bowl", "ball", "bell"],
    ["I'm cleaning <b>the cat's bowl</b>.", "I'm cleaning <b>the bird bath</b>."],
    W => W.gd_bowl === "clean" ? "Bát của thú cưng đã sạch và có nước mới rồi." : null,
    W => [["walk", "gd_bowl"], ["pose", "bend", 500], ["spawn", "gd_bowlP"], ["set", "gd_bowl", "hand"], ["walk", "gd_tap"], ["pose", "bend", 400], ["set", "gd_tap", "on"], ["pose", "wipe", 900], ["set", "gd_tap", "off"], ["walk", "gd_bowl"], ["pose", "bend", 500], ["despawn"], ["set", "gd_bowl", "clean"], ["pose", "idle", 1]],
    ["clean the pet bowl", "clean the pet bowl and add fresh water", "rửa bát và thay nước cho thú cưng"]),
  gdA("open_garden_gate", "gardengate", "Open the gate", "Mở cổng vườn", "I'm opening the garden gate.", "Tôi đang mở cổng vườn.", ["opening", "gate"], ["open", "gate"],
    "<b>gate</b> = cổng (ngoài trời, ở hàng rào); <b>door</b> = cửa (của nhà, phòng).", ["I'm opening", "the garden gate."], ["gate", "get", "great"],
    ["I'm opening <b>the front door</b>.", "I'm opening <b>the garage door</b>."],
    W => W.gd_gate === "open" ? "Cổng vườn đang mở rồi." : null,
    W => [["walk", "gd_gate"], ["pose", "reach", 500], ["set", "gd_gate", "open"], ["pose", "idle", 1]],
    ["open the gate", "open the garden gate", "mở cổng vườn"]),
  gdA("close_garden_gate", "gardengate", "Close the gate", "Đóng cổng vườn", "I'm closing the garden gate.", "Tôi đang đóng cổng vườn.", ["closing", "gate"], ["close", "gate"],
    "Lời nhắc: <b>Please close the gate</b> so the dog can't get out. (để chó không chạy ra ngoài)", ["I'm closing", "the garden gate."], ["close", "clothes", "cloud"],
    ["I'm closing <b>the window</b>.", "I'm closing <b>the shed door</b>."],
    W => W.gd_gate !== "open" ? "Cổng vườn đang đóng." : null,
    W => [["walk", "gd_gate"], ["pose", "reach", 500], ["set", "gd_gate", "closed"], ["pose", "idle", 1]],
    ["close the gate", "close the garden gate behind me", "đóng cổng vườn"]),
  gdA("put_on_gloves", "gloves", "Put on the gloves", "Đeo găng tay", "I'm putting on my gardening gloves.", "Tôi đang đeo găng tay làm vườn.", ["putting", "on", "gloves"], ["puton", "gloves"],
    "<b>put on</b> = mặc/đeo vào (hành động); <b>wear</b> = đang mặc (trạng thái). gloves luôn số nhiều: a pair of gloves.", ["I'm putting on", "my gardening gloves."], ["gloves", "loves", "clothes"],
    ["I'm putting on <b>my hat</b>.", "I'm putting on <b>my boots</b>."],
    W => W.gd_gloves === "on" ? "Bạn đang đeo găng tay rồi." : null,
    W => [["walk", "gd_table"], ["pose", "reach", 500], ["set", "gd_gloves", "on"], ["pose", "wipe", 700], ["pose", "idle", 1]],
    ["put on the gloves", "put on my gardening gloves", "đeo găng tay làm vườn"]),
  gdA("take_off_gloves", "gloves", "Take off the gloves", "Tháo găng tay", "I'm taking off my gloves.", "Tôi đang tháo găng tay.", ["taking", "off", "gloves"], ["takeoff", "gloves"],
    "<b>take off</b> ↔ <b>put on</b>. take → tak<b>ing</b> (bỏ e).", ["I'm taking off", "my gloves."], ["off", "of", "oven"],
    ["I'm taking off <b>my shoes</b>.", "I'm taking off <b>my jacket</b>."],
    W => W.gd_gloves !== "on" ? "Bạn đâu có đeo găng tay." : null,
    W => [["walk", "gd_table"], ["pose", "wipe", 600], ["pose", "reach", 400], ["set", "gd_gloves", "table"], ["pose", "idle", 1]],
    ["take off the gloves", "take off my gloves and put them on the table", "tháo găng tay"]),
  gdA("bring_tools_inside", "wheelbarrow", "Bring the tools inside", "Mang dụng cụ vào nhà", "I'm bringing the garden tools inside.", "Tôi đang mang dụng cụ làm vườn vào nhà.", ["bringing", "tools", "inside"], ["bring", "tools", "inside"],
    "<b>bring</b> = mang (về phía người nói / vào chỗ của mình); quá khứ: <b>brought</b>. <b>inside</b> = vào trong nhà.", ["I'm bringing the garden tools", "inside."], ["bring", "bridge", "brick"],
    ["I'm bringing <b>the chairs</b> inside.", "I'm bringing <b>the washing</b> inside before it rains."],
    W => W.gd_tools !== "out" ? "Dụng cụ đã được cất trong nhà rồi." : null,
    W => [["walk", "gd_barrow"], ["pose", "bend", 500], ["spawn", "gd_toolsP"], ["set", "gd_tools", "hand"], ["walk", "gd_door"], ["pose", "reach", 500], ["despawn"], ["set", "gd_tools", "inside"], ["pose", "idle", 1]],
    ["bring the tools inside", "bring the garden tools inside", "mang dụng cụ làm vườn vào nhà"]),
  gdA("take_tools_outside", "wheelbarrow", "Take the tools outside", "Mang dụng cụ ra vườn", "I'm taking the garden tools outside.", "Tôi đang mang dụng cụ làm vườn ra ngoài.", ["taking", "tools", "outside"], ["tools", "outside"],
    "<b>take</b> = mang (đi xa khỏi chỗ người nói) ↔ <b>bring</b> = mang lại. <b>outside</b> = ra ngoài.", ["I'm taking the garden tools", "outside."], ["outside", "inside", "upside"],
    ["I'm taking <b>the dog</b> outside.", "I'm taking <b>the trash</b> outside."],
    W => W.gd_tools !== "inside" ? "Dụng cụ đang ở ngoài vườn rồi." : null,
    W => [["walk", "gd_door"], ["pose", "reach", 500], ["spawn", "gd_toolsP"], ["set", "gd_tools", "hand"], ["walk", "gd_barrow"], ["pose", "bend", 500], ["despawn"], ["set", "gd_tools", "out"], ["pose", "idle", 1]],
    ["take the tools outside", "take the garden tools out to the wheelbarrow", "mang dụng cụ ra vườn"]),
  gdA("sit_in_garden", "gardenchair", "Sit in the garden", "Ngồi nghỉ trong vườn", "I'm sitting in the garden.", "Tôi đang ngồi nghỉ trong vườn.", ["sitting", "garden"], ["sit", "garden", "relax"],
    "sit → sit<b>t</b>ing (gấp đôi t). <b>in</b> the garden (trong vườn) — không dùng “on”.", ["I'm sitting", "in the garden."], ["sit", "seat", "set"],
    ["I'm sitting <b>on the bench</b>.", "I'm sitting <b>in the shade</b>."],
    W => W.sitting ? "Bạn đang ngồi rồi." : null,
    W => [["walk", "gd_seat"], ["sit"], ["wait", 500]],
    ["sit in the garden", "sit and relax in the garden", "ngồi thư giãn trong vườn"], true),
  gdA("turn_on_garden_light", "gardenlight", "Turn on the garden light", "Bật đèn sân vườn", "I'm turning on the garden light.", "Tôi đang bật đèn sân vườn.", ["turning", "light"], ["turnon", "light"],
    "Khi trời tối: <b>It's getting dark, so I'm turning on the light.</b> (so = nên).", ["I'm turning on", "the garden light."], ["light", "night", "right"],
    ["I'm turning on <b>the porch light</b>.", "I'm turning on <b>the sprinkler</b>."],
    W => W.gd_light === "on" ? "Đèn sân vườn đang bật rồi." : null,
    W => [["walk", "gd_light"], ["pose", "point", 500], ["set", "gd_light", "on"], ["pose", "idle", 1]],
    ["turn on the garden light", "turn on the garden light at night", "bật đèn sân vườn"]),
  gdA("turn_off_garden_light", "gardenlight", "Turn off the garden light", "Tắt đèn sân vườn", "I'm turning off the garden light.", "Tôi đang tắt đèn sân vườn.", ["turning", "off", "light"], ["turnoff", "light"],
    "turn off the light = tắt đèn. Ban ngày nên tắt đèn để <b>save energy</b> (tiết kiệm năng lượng).", ["I'm turning off", "the garden light."], ["off", "of", "oath"],
    ["I'm turning off <b>the tap</b>.", "I'm turning off <b>the music</b>."],
    W => W.gd_light !== "on" ? "Đèn sân vườn đang tắt." : null,
    W => [["walk", "gd_light"], ["pose", "point", 500], ["set", "gd_light", "off"], ["pose", "idle", 1]],
    ["turn off the garden light", "turn off the garden light in the morning", "tắt đèn sân vườn"])
];

const GD_PROPS = {
  gd_canP: `<path d="M-12 -2 L-10 -24 L12 -24 L12 -2Z" fill="#5fae5a"/><path d="M12 -20 L28 -32" stroke="#4c9a49" stroke-width="4" stroke-linecap="round"/><path d="M-6 -24 Q0 -36 8 -24" stroke="#4c9a49" stroke-width="3" fill="none"/><g class="gd-pourDrops" fill="#8ccbf0"><circle cx="31" cy="-26" r="2"/><circle cx="34" cy="-20" r="2"/><circle cx="31" cy="-14" r="1.8"/></g>`,
  gd_shovelP: `<rect x="-2" y="-56" width="4" height="56" rx="2" fill="#a8693e"/><rect x="-8" y="-62" width="16" height="6" rx="3" fill="#a8693e"/><path d="M-9 0 L9 0 L7 18 Q0 24 -7 18Z" fill="#9aa6af"/>`,
  gd_seedsP: `<rect x="-9" y="-22" width="18" height="22" rx="2" fill="#f5c45a"/><circle cx="0" cy="-12" r="5" fill="#e8743b"/><g fill="#8a5a2a"><circle cx="-4" cy="2" r="1.4"/><circle cx="2" cy="4" r="1.4"/></g>`,
  gd_soilP: `<path d="M-12 0 L-14 -24 L14 -24 L12 0Z" fill="#8a6a44"/><ellipse cx="0" cy="-24" rx="14" ry="4" fill="#5a3d1f"/>`,
  gd_weedP: `<path d="M0 0 q-6 -14 -2 -24 M0 0 q4 -16 10 -20 M0 0 q-10 -6 -14 -14" stroke="#7aa34a" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="3" rx="5" ry="3" fill="#8a6a44"/>`,
  gd_rakeP: `<rect x="-2" y="-60" width="4" height="64" rx="2" fill="#a8693e"/><rect x="-16" y="4" width="32" height="4" rx="1" fill="#5a636c"/><path d="M-14 8 v8 M-7 8 v8 M0 8 v8 M7 8 v8 M14 8 v8" stroke="#5a636c" stroke-width="2"/>`,
  gd_leavesP: `<ellipse cx="0" cy="-12" rx="18" ry="12" fill="#d98c3c"/><g fill="#c56b3c"><path d="M-12 -18 q6 -8 12 0 q-6 4 -12 0z"/><path d="M2 -10 q6 -8 12 0 q-6 4 -12 0z"/></g><path d="M-8 -6 q6 -8 12 0 q-6 4 -12 0z" fill="#e8b04a"/>`,
  gd_broomP: `<rect x="-2" y="-60" width="4" height="64" rx="2" fill="#c98f5e"/><path d="M-12 2 L12 2 L16 22 L-16 22Z" fill="#e8c06a"/>`,
  gd_branchP: `<path d="M-20 -4 L20 -14 M-6 -8 L-12 -20 M8 -11 L12 -24" stroke="#8a5a2a" stroke-width="4" stroke-linecap="round"/><g fill="#7aa34a"><circle cx="-12" cy="-21" r="4"/><circle cx="12" cy="-25" r="4"/></g>`,
  gd_shearsP: `<path d="M-6 0 L2 -26 M6 0 L-2 -26" stroke="#9aa6af" stroke-width="3"/><circle cx="-6" cy="4" r="5" fill="none" stroke="#e74c3c" stroke-width="3"/><circle cx="6" cy="4" r="5" fill="none" stroke="#e74c3c" stroke-width="3"/>`,
  gd_birdseedP: `<path d="M-10 0 L-12 -22 L12 -22 L10 0Z" fill="#e9d3b0" stroke="#c9a77c"/><g fill="#8a6a44"><circle cx="-4" cy="-24" r="1.6"/><circle cx="2" cy="-25" r="1.6"/><circle cx="6" cy="-23" r="1.4"/></g>`,
  gd_bowlP: `<path d="M-14 -8 L14 -8 L10 0 L-10 0Z" fill="#3b6ec2"/><ellipse cx="0" cy="-8" rx="14" ry="3.5" fill="#5f8fd8"/>`,
  gd_toolsP: `<rect x="-10" y="-60" width="4" height="64" rx="2" fill="#a8693e"/><rect x="6" y="-56" width="4" height="60" rx="2" fill="#a8693e"/><path d="M-16 4 L0 4 L-2 18 L-14 18Z" fill="#9aa6af"/><rect x="0" y="4" width="22" height="4" fill="#5a636c"/>`
};

const garden_leaf = (x, y, r, c) => `<path d="M${x - 7} ${y} q7 -9 14 0 q-7 5 -14 0z" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`;
const leafColors = ["#d98c3c", "#c56b3c", "#e8b04a", "#b8743a"];
const scatteredLeaves = [[400, 596, 20], [430, 612, -30], [470, 600, 60], [520, 622, 10], [560, 596, -50], [600, 614, 30], [640, 600, 80], [690, 620, -20], [730, 604, 40], [770, 616, -60], [810, 600, 15], [450, 628, 70], [590, 630, -10], [700, 594, 25], [840, 620, 50], [760, 632, -35], [500, 606, 45], [620, 626, -70]]
  .map(([x, y, r], i) => garden_leaf(x, y, r, leafColors[i % 4])).join("");

const gardenShell = `
<defs>
 <linearGradient id="gdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd6f5"/><stop offset="1" stop-color="#e3f4fc"/></linearGradient>
 <linearGradient id="gdHouse" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8cfa8"/><stop offset="1" stop-color="#f2dfc0"/></linearGradient>
 <linearGradient id="gdLawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d48a"/><stop offset="1" stop-color="#86bf68"/></linearGradient>
 <linearGradient id="gdFence" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1dfc2"/><stop offset="1" stop-color="#ddc29b"/></linearGradient>
 <linearGradient id="gdWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c98f5e"/><stop offset="1" stop-color="#9c6a3e"/></linearGradient>
 <radialGradient id="gdGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2b0" stop-opacity=".85"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/></radialGradient>
 <filter id="gdSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect x="120" y="0" width="880" height="330" fill="url(#gdSky)"/>
<polygon points="120,330 1000,330 1000,640 0,640" fill="url(#gdLawn)"/>
${D("sun", `<circle cx="560" cy="60" r="30" fill="#fff3b0"/><circle cx="560" cy="60" r="44" fill="#fff3b0" opacity=".35"/>`)}
${D("clouds", `<g class="gd-cloud" fill="#fff" opacity=".92"><ellipse cx="300" cy="56" rx="38" ry="12"/><ellipse cx="322" cy="46" rx="22" ry="13"/><ellipse cx="840" cy="40" rx="34" ry="10"/><ellipse cx="858" cy="32" rx="18" ry="11"/></g>`)}
${D("distant-hills", `<path d="M120 190 Q260 120 420 170 T740 150 T1000 160 L1000 230 L120 230Z" fill="#b9dca0"/><path d="M120 214 Q300 170 520 200 T1000 196 L1000 240 L120 240Z" fill="#a3cf88"/>`)}
${D("distant-trees", `<g fill="#7fbf6a"><circle cx="180" cy="176" r="18"/><circle cx="200" cy="168" r="14"/><circle cx="440" cy="168" r="16"/><circle cx="460" cy="178" r="13"/><circle cx="980" cy="164" r="18"/></g><g fill="#8a5a2a"><rect x="188" y="186" width="4" height="12"/><rect x="448" y="182" width="4" height="12"/></g>`)}
${D("neighbor-roof", `<path d="M846 150 L896 116 L950 150Z" fill="#c56b3c"/><rect x="856" y="150" width="84" height="50" fill="#f2e3c6"/><rect x="886" y="164" width="18" height="18" fill="#bfe3ff" stroke="#fffdf9" stroke-width="2"/>`)}
${D("apple-tree", `<rect x="690" y="110" width="18" height="100" fill="#8a5a2a"/><path d="M699 140 L670 112 M700 130 L734 104" stroke="#8a5a2a" stroke-width="7" stroke-linecap="round"/>
 <g fill="#6fb36a"><circle cx="700" cy="84" r="56"/><circle cx="650" cy="104" r="34"/><circle cx="752" cy="100" r="36"/></g><g fill="#5fae5a" opacity=".7"><circle cx="680" cy="70" r="24"/><circle cx="730" cy="80" r="22"/></g>
 <g fill="#e74c3c"><circle cx="668" cy="96" r="5"/><circle cx="706" cy="62" r="5"/><circle cx="742" cy="108" r="5"/><circle cx="690" cy="118" r="5"/><circle cx="728" cy="76" r="4.5"/></g>`)}
${D("birdhouse", `<rect x="742" y="128" width="22" height="22" fill="#e8743b"/><path d="M738 130 L753 116 L768 130Z" fill="#c0392b"/><circle cx="753" cy="140" r="4" fill="#3a3f46"/><rect x="751" y="147" width="4" height="6" fill="#8a5a2a"/>`)}
${D("clothesline", `<g stroke="#8a5a2a" stroke-width="4"><line x1="376" y1="104" x2="376" y2="200"/><line x1="612" y1="104" x2="612" y2="200"/></g><path d="M376 110 Q494 128 612 110" stroke="#7a7166" stroke-width="1.5" fill="none"/>
 <g class="gd-sway"><path d="M410 116 L440 118 L442 150 L412 150Z" fill="#6fb3d9"/><path d="M470 121 L500 122 L498 160 L486 160 L484 140 L482 160 L470 160Z" fill="#e79a86"/><path d="M528 121 L560 119 L562 146 L530 148Z" fill="#fffdf9" stroke="#c9b7a2"/></g>`)}
${D("fence-boards", `<g fill="url(#gdFence)" stroke="#c9a77c" stroke-width="1.2">${Array.from({ length: 34 }, (_, i) => { const x = 120 + i * 26; return x >= 832 && x < 944 ? "" : `<path d="M${x} 330 L${x} 212 L${x + 12} 200 L${x + 24} 212 L${x + 24} 330Z"/>`; }).join("")}</g>`)}
${D("fence-rails", `<g fill="#c9a77c"><rect x="120" y="236" width="712" height="6"/><rect x="120" y="296" width="712" height="6"/><rect x="944" y="236" width="56" height="6"/><rect x="944" y="296" width="56" height="6"/></g>`)}
${D("lane-beyond-gate", `<rect x="832" y="200" width="112" height="130" fill="url(#gdSky)"/><path d="M832 230 Q888 214 944 228 L944 330 L832 330Z" fill="#a3cf88"/><path d="M870 330 L880 236 L898 236 L912 330Z" fill="#e2d1b4"/><circle cx="846" cy="236" r="14" fill="#6fb36a"/><circle cx="934" cy="240" r="12" fill="#5fae5a"/>`)}
${D("mailbox", `<rect x="922" y="250" width="4" height="40" fill="#8a5a2a"/><path d="M908 236 L940 236 L940 254 L908 254Z" fill="#3b6ec2"/><path d="M908 236 Q924 226 940 236" fill="#3b6ec2"/><rect x="936" y="230" width="3" height="12" fill="#e74c3c"/>`)}
${D("sunflowers", `<g stroke="#4c9a49" stroke-width="4"><line x1="962" y1="330" x2="962" y2="190"/><line x1="984" y1="330" x2="986" y2="212"/></g><g fill="#5fae5a"><ellipse cx="954" cy="270" rx="10" ry="5"/><ellipse cx="994" cy="260" rx="10" ry="5"/></g>
 <g fill="#f5c45a"><circle cx="962" cy="184" r="16"/><circle cx="986" cy="206" r="13"/></g><g fill="#8a5a2a"><circle cx="962" cy="184" r="7"/><circle cx="986" cy="206" r="6"/></g>`)}
${D("string-lights", `<path d="M124 212 Q190 232 252 214 Q316 232 376 212" stroke="#5a636c" stroke-width="1.5" fill="none"/><g class="gd-twinkle"><circle cx="146" cy="222" r="4" fill="#ffd36b"/><circle cx="188" cy="226" r="4" fill="#ff9e7a"/><circle cx="228" cy="220" r="4" fill="#9fd3f0"/><circle cx="276" cy="222" r="4" fill="#ffd36b"/><circle cx="318" cy="226" r="4" fill="#b8e6a0"/><circle cx="356" cy="218" r="4" fill="#ff9e7a"/></g>`)}
${D("hanging-planter", `<path d="M260 236 L250 262 M260 236 L270 262" stroke="#7a7166" stroke-width="1.2"/><path d="M246 262 L274 262 L270 278 L250 278Z" fill="#e8743b"/><g fill="#5fae5a"><path d="M250 264 q-8 14 -4 24"/><circle cx="252" cy="258" r="6"/><circle cx="266" cy="258" r="7"/></g><path d="M248 270 q-4 14 0 24 M272 270 q4 12 2 22" stroke="#5fae5a" stroke-width="3" fill="none"/><g fill="#e79a86"><circle cx="258" cy="252" r="3"/><circle cx="268" cy="254" r="2.6"/></g>`)}
${D("fence-vine", `<path d="M620 330 Q640 270 660 250 T720 220 T790 240" stroke="#4c9a49" stroke-width="3" fill="none"/><g fill="#6fb36a"><ellipse cx="640" cy="276" rx="7" ry="4"/><ellipse cx="664" cy="246" rx="7" ry="4"/><ellipse cx="700" cy="230" rx="7" ry="4"/><ellipse cx="740" cy="226" rx="7" ry="4"/><ellipse cx="778" cy="236" rx="7" ry="4"/></g><g fill="#c9b1d6"><circle cx="652" cy="262" r="4"/><circle cx="722" cy="222" r="4"/><circle cx="762" cy="232" r="4"/></g>`)}
<polygon points="0,0 120,0 120,330 0,640" fill="url(#gdHouse)"/>
${D("house-siding", `<g stroke="#d4b48a" stroke-width="1.5">${Array.from({ length: 13 }, (_, i) => { const y = 60 + i * 44; return `<line x1="0" y1="${y}" x2="120" y2="${(y * 127.7 / 247.7).toFixed(1)}"/>`; }).join("")}</g>`)}
${D("roof-eave", `<polygon points="0,0 130,0 130,16 0,30" fill="#c56b3c"/><polygon points="0,30 130,16 130,22 0,38" fill="#a8562c"/>`)}
${D("downpipe", lw(104, 30, `<rect x="0" y="0" width="10" height="340" fill="#9aa6af"/>`, 0.62))}
${D("back-door", lw(30, 372, `<rect x="0" y="0" width="84" height="190" rx="4" fill="#78bdb8" stroke="#4f9590" stroke-width="5"/><rect x="14" y="16" width="56" height="60" rx="3" fill="#bfe3ff" stroke="#4f9590" stroke-width="3"/><rect x="14" y="96" width="56" height="74" rx="3" fill="none" stroke="#4f9590" stroke-width="3"/><circle cx="70" cy="104" r="5" fill="#f5c45a"/>`))}
${D("kitchen-window", lw(8, 170, `<rect x="0" y="0" width="80" height="80" rx="4" fill="#bfe3ff" stroke="#fffdf9" stroke-width="7"/><line x1="40" y1="3" x2="40" y2="77" stroke="#fffdf9" stroke-width="4"/><path d="M4 60 h72" stroke="#f2b8a4" stroke-width="10"/>`))}
${D("window-box", lw(8, 252, `<rect x="-4" y="0" width="88" height="16" rx="3" fill="#a8693e"/><g fill="#e74c3c"><circle cx="12" cy="-4" r="6"/><circle cx="44" cy="-6" r="6"/><circle cx="72" cy="-4" r="6"/></g><g fill="#f5c45a"><circle cx="28" cy="-4" r="5"/><circle cx="58" cy="-5" r="5"/></g>`))}
${D("wind-chime", `<path d="M112 26 v20" stroke="#7a7166" stroke-width="1.5"/><ellipse cx="112" cy="48" rx="10" ry="3" fill="#a8693e"/><g class="gd-chime" stroke="#9aa6af" stroke-width="3" stroke-linecap="round"><line x1="104" y1="52" x2="104" y2="74"/><line x1="110" y1="52" x2="110" y2="80"/><line x1="116" y1="52" x2="116" y2="70"/><line x1="121" y1="52" x2="121" y2="76"/></g>`)}
${D("lawn-texture", `<g stroke="#6fa956" stroke-width="2" stroke-linecap="round" fill="none">${[[160, 360], [380, 372], [620, 368], [880, 380], [940, 520], [420, 440], [680, 452], [880, 470], [360, 560], [960, 620], [600, 560]].map(([x, y]) => `<path d="M${x} ${y} l-3 -8 M${x + 4} ${y} l0 -10 M${x + 8} ${y} l3 -8"/>`).join("")}</g>`)}
${D("patio-stones", `<polygon points="70,460 380,460 404,640 0,640 0,600" fill="#d9cfbf"/><g stroke="#b9ab96" stroke-width="2" fill="none"><path d="M60 500 H392 M40 550 H398 M14 600 H402"/><path d="M150 460 L140 500 M260 460 L264 500 M100 500 L84 550 M210 500 L206 550 M320 500 L330 550 M60 550 L40 600 M170 550 L164 600 M290 550 L292 600 M110 600 L100 640 M230 600 L232 640 M350 600 L356 640"/></g>`)}
${D("stepping-stones", `<g fill="#d9cfbf" stroke="#b9ab96" stroke-width="1.5"><ellipse cx="420" cy="420" rx="20" ry="7"/><ellipse cx="480" cy="430" rx="20" ry="7"/><ellipse cx="545" cy="424" rx="20" ry="7"/><ellipse cx="610" cy="432" rx="20" ry="7"/><ellipse cx="676" cy="424" rx="20" ry="7"/><ellipse cx="742" cy="430" rx="20" ry="7"/><ellipse cx="808" cy="420" rx="20" ry="7"/><ellipse cx="872" cy="408" rx="18" ry="6"/></g>`)}
${D("butterflies", `<g class="gd-flutter"><path d="M520 150 q-10 -10 -12 2 q4 8 12 -2z M520 150 q10 -10 12 2 q-4 8 -12 -2z" fill="#f2b8a4"/><path d="M880 300 q-8 -8 -10 2 q4 6 10 -2z M880 300 q8 -8 10 2 q-4 6 -10 -2z" fill="#c9b1d6"/></g>`)}
${D("bee", `<g class="gd-flutter"><ellipse cx="452" cy="232" rx="6" ry="4" fill="#f5c45a"/><path d="M450 229 v6 M454 229 v6" stroke="#3a3f46" stroke-width="1.5"/><ellipse cx="452" cy="226" rx="4" ry="2.5" fill="#fff" opacity=".8"/></g>`)}
`;

const gardenDecor = [
  D("garden-tap", `<rect x="164" y="262" width="10" height="84" rx="3" fill="#9aa6af"/><path d="M168 276 L186 276 L186 286" stroke="#9aa6af" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="168" cy="268" r="7" fill="#e74c3c"/><rect x="160" y="342" width="18" height="6" rx="2" fill="#7a838c"/>
   <rect class="gd-tapWater" x="184" y="288" width="4" height="46" rx="2" fill="#8ccbf0"/>`, 348),
  D("hose-reel", `<ellipse cx="286" cy="352" rx="20" ry="4" fill="#000" opacity=".14"/><circle cx="286" cy="326" r="20" fill="#3a3f46"/><circle cx="286" cy="326" r="14" fill="none" stroke="#5fae5a" stroke-width="7"/><circle cx="286" cy="326" r="5" fill="#9aa6af"/><path d="M274 348 L298 348" stroke="#3a3f46" stroke-width="4"/>`, 351),
  D("garden-gnome", `<ellipse cx="376" cy="560" rx="14" ry="4" fill="#000" opacity=".16"/><path d="M366 556 Q376 534 386 556Z" fill="#3b6ec2"/><circle cx="376" cy="532" r="7" fill="#f3c6a5"/><path d="M366 536 Q376 548 386 536 Q382 546 376 550 Q370 546 366 536Z" fill="#fffdf9"/><path d="M368 530 L376 506 L384 530Z" fill="#e74c3c"/>`, 560),
  D("bird-bath", `<ellipse cx="978" cy="470" rx="22" ry="5" fill="#000" opacity=".16"/><path d="M972 468 L974 432 L982 432 L984 468Z" fill="#c9c0b0"/><path d="M956 430 Q978 446 1000 430Z" fill="#d9cfbf"/><ellipse cx="978" cy="430" rx="22" ry="5" fill="#9fd3f0"/><rect x="964" y="466" width="28" height="6" rx="2" fill="#b9ab96"/>`, 472),
  D("solar-lights", `<g>${[[392, 452], [460, 458], [880, 452], [930, 440]].map(([x, y]) => `<rect x="${x - 1.5}" y="${y - 22}" width="3" height="22" fill="#5a636c"/><rect x="${x - 6}" y="${y - 30}" width="12" height="9" rx="2" fill="#3a3f46"/><rect x="${x - 5}" y="${y - 22}" width="10" height="5" fill="#fff3b0" opacity=".8"/>`).join("")}</g>`, 459),
  D("plant-labels", `<g><rect x="430" y="474" width="14" height="10" fill="#fffdf9" stroke="#c9b7a2"/><rect x="436" y="484" width="2" height="8" fill="#a8693e"/><rect x="570" y="474" width="14" height="10" fill="#fffdf9" stroke="#c9b7a2"/><rect x="576" y="484" width="2" height="8" fill="#a8693e"/><path d="M433 478 h8 M573 478 h8" stroke="#5fae5a" stroke-width="1.5"/></g>`, 549),
  D("lantern", `<rect x="276" y="440" width="18" height="24" rx="3" fill="#3a3f46"/><rect x="279" y="444" width="12" height="16" rx="2" fill="#fff3b0" class="gd-lanternGlow"/><path d="M280 440 Q285 432 290 440" stroke="#3a3f46" stroke-width="2" fill="none"/>`, 551),
  D("potted-herbs", `<rect x="178" y="452" width="16" height="14" rx="2" fill="#c56b3c"/><g fill="#6fb36a"><circle cx="182" cy="448" r="5"/><circle cx="190" cy="446" r="5"/><circle cx="186" cy="442" r="4"/></g>`, 551.5),
  D("snail", `<ellipse cx="626" cy="572" rx="10" ry="3" fill="#b9ab96"/><circle cx="628" cy="566" r="6" fill="#c98f5e"/><path d="M628 566 m-3 0 a3 3 0 1 0 3 -3" stroke="#8a5a2a" fill="none"/><path d="M618 570 l-3 -6 M621 570 l-1 -7" stroke="#b9ab96" stroke-width="1.5"/>`, 573),
  D("lawn-sprinkler", `<ellipse cx="920" cy="388" rx="12" ry="3" fill="#000" opacity=".14"/><rect x="912" y="376" width="16" height="10" rx="3" fill="#f5c45a"/><rect x="918" y="366" width="4" height="12" fill="#5a636c"/><path d="M906 364 h28" stroke="#5a636c" stroke-width="3"/>`, 389),
  D("flower-border", `<g>${[[150, 352], [205, 360], [612, 358], [810, 356], [870, 362], [935, 356]].map(([x, y], i) => `<path d="M${x} ${y} v-10" stroke="#4c9a49" stroke-width="2"/><circle cx="${x}" cy="${y - 12}" r="4" fill="${["#e79a86", "#f5c45a", "#c9b1d6", "#fffdf9", "#e74c3c", "#9fd3f0"][i]}"/>`).join("")}</g>`, 362.5),
  D("doormat", `<path d="M58 520 L104 506 L118 530 L70 546Z" fill="#a8693e"/><path d="M68 524 L104 513" stroke="#c98f5e" stroke-width="3"/>`, 470.5),
  D("daisies", `<g>${[[900, 618], [924, 628], [948, 614], [972, 626]].map(([x, y]) => `<path d="M${x} ${y} v-8" stroke="#4c9a49" stroke-width="2"/><g fill="#fffdf9"><circle cx="${x - 3}" cy="${y - 10}" r="2.6"/><circle cx="${x + 3}" cy="${y - 10}" r="2.6"/><circle cx="${x}" cy="${y - 13}" r="2.6"/><circle cx="${x}" cy="${y - 7}" r="2.6"/></g><circle cx="${x}" cy="${y - 10}" r="1.8" fill="#f5c45a"/>`).join("")}</g>`, 630),
  D("ladybug", `<ellipse cx="706" cy="326" rx="5" ry="4" fill="#e74c3c"/><circle cx="702" cy="323" r="2.2" fill="#2d2a26"/><path d="M706 322 v8" stroke="#2d2a26" stroke-width="1"/><circle cx="708" cy="327" r="1" fill="#2d2a26"/>`, 349.5),
  D("watering-hose", `<path d="M186 348 Q240 380 220 410 Q196 440 240 446" stroke="#5fae5a" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="238" y="440" width="14" height="8" rx="3" fill="#f5c45a"/>`, 380)
];

const gardenWorld = [
  objG("gardenlight", "garden light", "đèn sân vườn", 300.5, 150, 270, `
   <rect class="hit" x="80" y="290" width="30" height="60"/>
   ${lw(86, 300, `<rect x="4" y="-4" width="16" height="8" rx="2" fill="#3a3f46"/><rect x="10" y="4" width="4" height="10" fill="#3a3f46"/><path d="M-4 14 L28 14 L22 56 L2 56Z" fill="#3a3f46"/><rect class="gd-bulb" x="3" y="19" width="18" height="32" rx="3" fill="#efe8d8"/><path d="M-6 14 L30 14 L24 8 L0 8Z" fill="#5a636c"/>`)}
   <g class="gd-glow"><ellipse cx="100" cy="326" rx="44" ry="40" fill="url(#gdGlow)"/><ellipse cx="170" cy="500" rx="140" ry="50" fill="url(#gdGlow)" opacity=".7"/></g>`),
  objG("gardengate", "garden gate", "cổng vườn", 300, 890, 186, `
   <rect class="hit" x="832" y="196" width="112" height="136"/>
   <rect x="828" y="200" width="8" height="132" fill="#9c6a3e"/><rect x="940" y="200" width="8" height="132" fill="#9c6a3e"/><circle cx="832" cy="198" r="6" fill="#9c6a3e"/><circle cx="944" cy="198" r="6" fill="#9c6a3e"/>
   <g class="gd-gateLeaf"><path d="M838 330 L838 214 Q889 196 938 214 L938 330Z" fill="url(#gdFence)" stroke="#9c6a3e" stroke-width="2"/>
    <g stroke="#c9a77c" stroke-width="1.5"><path d="M862 208 V330 M888 204 V330 M914 208 V330"/></g><rect x="838" y="250" width="100" height="6" fill="#c9a77c"/><rect x="838" y="304" width="100" height="6" fill="#c9a77c"/>
    <path d="M840 306 L936 254" stroke="#c9a77c" stroke-width="5"/><rect x="926" y="270" width="10" height="16" rx="3" fill="#5a636c"/></g>`),
  objG("wateringcan", "watering can", "bình tưới cây", 364, 232, 384, `
   <rect class="hit" x="194" y="312" width="72" height="54"/>
   <g class="gd-canGround"><ellipse cx="226" cy="363" rx="28" ry="4" fill="#000" opacity=".16"/><path d="M206 362 L208 328 L244 328 L246 362Z" fill="#5fae5a"/><path d="M244 336 L264 318" stroke="#4c9a49" stroke-width="5" stroke-linecap="round"/><ellipse cx="266" cy="316" rx="5" ry="3" fill="#4c9a49" transform="rotate(-40 266 316)"/>
    <path d="M214 328 Q226 310 238 328" stroke="#4c9a49" stroke-width="4" fill="none"/><g class="gd-canWater"><ellipse cx="226" cy="330" rx="16" ry="3" fill="#8ccbf0"/><path d="M240 344 q2 5 0 8 q-2 -3 0 -8z" fill="#8ccbf0"/></g>
    <rect x="214" y="340" width="22" height="4" rx="2" fill="#fff" opacity=".35"/></g>`),
  objG("birdfeeder", "bird feeder", "máng ăn cho chim", 352, 318, 132, `
   <rect class="hit" x="288" y="140" width="62" height="214"/>
   <ellipse cx="318" cy="352" rx="18" ry="4" fill="#000" opacity=".16"/><rect x="315" y="200" width="6" height="152" fill="#5a636c"/>
   <path d="M294 168 L318 146 L342 168Z" fill="#c0392b"/><rect x="298" y="168" width="40" height="34" fill="#e9d3b0" stroke="#c9a77c"/><rect x="292" y="200" width="52" height="5" rx="2" fill="#a8693e"/>
   <rect x="304" y="174" width="28" height="22" fill="#fff" opacity=".45"/><g class="gd-seed" fill="#8a6a44"><rect x="304" y="184" width="28" height="12"/><circle cx="300" cy="199" r="1.6"/><circle cx="336" cy="199" r="1.6"/></g>
   <g class="gd-birds"><g transform="translate(286 196)"><ellipse cx="0" cy="0" rx="8" ry="6" fill="#6fb3d9"/><circle cx="-6" cy="-5" r="4.5" fill="#6fb3d9"/><path d="M-11 -5 l-4 1 l4 1z" fill="#f5a623"/><circle cx="-7" cy="-6" r="1" fill="#2d2a26"/><path d="M6 0 l6 -3" stroke="#3b6ec2" stroke-width="3"/></g>
    <g transform="translate(352 194) scale(-1 1)"><ellipse cx="0" cy="0" rx="8" ry="6" fill="#e74c3c"/><circle cx="-6" cy="-5" r="4.5" fill="#e74c3c"/><path d="M-11 -5 l-4 1 l4 1z" fill="#f5a623"/><circle cx="-7" cy="-6" r="1" fill="#2d2a26"/></g></g>`),
  objG("flowerpots", "flower pots", "chậu hoa", 346, 495, 232, `
   <rect class="hit" x="396" y="240" width="200" height="108"/>
   <ellipse cx="495" cy="346" rx="100" ry="5" fill="#000" opacity=".14" filter="url(#gdSoft)"/>
   ${[[425, "#c56b3c"], [495, "#e8c06a"], [565, "#7aa6c2"]].map(([x, c]) => `<path d="M${x - 24} 306 L${x + 24} 306 L${x + 18} 346 L${x - 18} 346Z" fill="${c}"/><rect x="${x - 27}" y="300" width="54" height="9" rx="3" fill="${c}" stroke="#000" stroke-opacity=".1"/><ellipse cx="${x}" cy="302" rx="22" ry="3" fill="#6b4a2a"/>`).join("")}
   <g class="gd-thirsty" stroke="#9c9a4a" stroke-width="4" fill="none" stroke-linecap="round">${[425, 495, 565].map(x => `<path d="M${x} 302 Q${x - 2} 280 ${x - 16} 284"/><path d="M${x} 302 Q${x + 4} 282 ${x + 18} 290"/><path d="M${x} 302 Q${x} 278 ${x - 4} 272 Q${x - 10} 270 ${x - 12} 280"/>`).join("")}
    <g fill="#c9a86a" stroke="none"><circle cx="409" cy="285" r="4"/><circle cx="513" cy="290" r="4"/><circle cx="553" cy="280" r="4"/></g></g>
   <g class="gd-happy">${[[425, "#e74c3c"], [495, "#f5c45a"], [565, "#c9b1d6"]].map(([x, c]) => `<g stroke="#4c9a49" stroke-width="4" fill="none" stroke-linecap="round"><path d="M${x} 302 V262"/><path d="M${x} 290 Q${x - 14} 280 ${x - 18} 268"/><path d="M${x} 286 Q${x + 14} 276 ${x + 18} 262"/></g>
     <g fill="#6fb36a"><ellipse cx="${x - 12}" cy="276" rx="8" ry="4" transform="rotate(-30 ${x - 12} 276)"/><ellipse cx="${x + 12}" cy="272" rx="8" ry="4" transform="rotate(30 ${x + 12} 272)"/></g>
     <g fill="${c}"><circle cx="${x}" cy="256" r="9"/><circle cx="${x - 18}" cy="264" r="6"/><circle cx="${x + 18}" cy="258" r="6"/></g><circle cx="${x}" cy="256" r="3.5" fill="#fff3b0"/>`).join("")}
    <g class="gd-drops" fill="#8ccbf0"><circle cx="440" cy="296" r="2"/><circle cx="510" cy="294" r="2"/><circle cx="580" cy="296" r="2"/></g></g>`),
  objG("rosebush", "rose bush", "bụi hoa hồng", 348, 665, 214, `
   <rect class="hit" x="612" y="222" width="108" height="128"/>
   <ellipse cx="665" cy="348" rx="52" ry="5" fill="#000" opacity=".16" filter="url(#gdSoft)"/>
   <g fill="#4c9a49"><ellipse cx="665" cy="306" rx="48" ry="42"/></g><g fill="#5fae5a"><circle cx="640" cy="296" r="22"/><circle cx="688" cy="300" r="24"/><circle cx="664" cy="280" r="22"/></g>
   <g fill="#e74c3c"><circle cx="642" cy="286" r="6"/><circle cx="672" cy="272" r="6"/><circle cx="692" cy="300" r="6"/><circle cx="656" cy="316" r="5"/></g><g fill="#c0392b"><circle cx="642" cy="286" r="2.5"/><circle cx="672" cy="272" r="2.5"/><circle cx="692" cy="300" r="2.5"/></g>
   <g class="gd-overgrown" stroke="#4c9a49" stroke-width="3" fill="none" stroke-linecap="round"><path d="M640 280 Q620 250 618 228"/><path d="M670 268 Q676 236 664 222"/><path d="M700 290 Q720 262 716 236"/><path d="M626 312 Q606 300 614 278"/>
    <g fill="#6fb36a" stroke="none"><circle cx="618" cy="232" r="6"/><circle cx="664" cy="226" r="6"/><circle cx="716" cy="240" r="6"/><circle cx="612" cy="282" r="5"/><circle cx="628" cy="252" r="4"/><circle cx="708" cy="262" r="4"/></g></g>
   <g class="gd-trimmedShine">${sparkle(700, 270, 6)}</g>`),
  objG("compostbin", "compost bin", "thùng ủ phân", 352.5, 764, 250, `
   <rect class="hit" x="724" y="258" width="82" height="96"/>
   <ellipse cx="764" cy="352" rx="40" ry="4" fill="#000" opacity=".16"/>
   <g class="gd-compostFill"><ellipse cx="764" cy="276" rx="34" ry="10" fill="#d98c3c"/>${garden_leaf(748, 272, 20, "#c56b3c")}${garden_leaf(774, 270, -30, "#e8b04a")}</g>
   <g class="gd-compostBranch"><path d="M738 272 L790 260" stroke="#8a5a2a" stroke-width="4" stroke-linecap="round"/></g>
   <rect x="730" y="276" width="68" height="74" fill="#7a5a3a"/><g fill="#9c6a3e"><rect x="728" y="278" width="72" height="12" rx="2"/><rect x="728" y="296" width="72" height="12" rx="2"/><rect x="728" y="314" width="72" height="12" rx="2"/><rect x="728" y="332" width="72" height="12" rx="2"/></g>
   <rect x="726" y="272" width="8" height="80" fill="#8a5a2a"/><rect x="794" y="272" width="8" height="80" fill="#8a5a2a"/><path d="M752 304 l6 -8 l6 8 M766 318 l-4 8 l-8 0" stroke="#d9cfbf" stroke-width="2" fill="none"/>`),
  objG("yardbroom", "broom", "cái chổi", 470, 108, 334, `
   <rect class="hit" x="90" y="336" width="34" height="136"/>
   <g transform="rotate(8 108 470)"><rect x="105" y="340" width="6" height="96" rx="3" fill="#c98f5e"/><path d="M94 432 L122 432 L128 470 L88 470Z" fill="#e8c06a"/><path d="M94 444 H122" stroke="#c99a3a" stroke-width="2"/></g>
   <g class="gd-patioDirt"><rect class="hit" x="180" y="582" width="160" height="46"/><g fill="#a68a64"><ellipse cx="210" cy="604" rx="12" ry="4" opacity=".6"/><ellipse cx="270" cy="616" rx="16" ry="4" opacity=".5"/><circle cx="240" cy="598" r="2"/><circle cx="310" cy="606" r="2"/><circle cx="196" cy="618" r="1.8"/></g>${garden_leaf(232, 610, 30, "#c56b3c")}${garden_leaf(300, 594, -20, "#e8b04a")}</g>`),
  objG("petbowl", "pet bowl", "bát của thú cưng", 628, 112, 598, `
   <rect class="hit" x="36" y="604" width="52" height="28"/>
   <ellipse cx="62" cy="628" rx="24" ry="4" fill="#000" opacity=".16"/><path d="M40 616 L84 616 L80 628 L44 628Z" fill="#3b6ec2"/><ellipse cx="62" cy="616" rx="22" ry="5" fill="#5f8fd8"/>
   <g class="gd-bowlDirty"><ellipse cx="62" cy="617" rx="17" ry="3.5" fill="#a68a64"/>${garden_leaf(58, 616, 20, "#c56b3c")}</g>
   <g class="gd-bowlClean"><ellipse cx="62" cy="617" rx="17" ry="3.5" fill="#9fd3f0"/>${sparkle(74, 610, 5)}</g>
   <text x="62" y="626" text-anchor="middle" font-size="6" font-family="system-ui" font-weight="700" fill="#fffdf9">PET</text>`),
  objG("vegbed", "vegetable bed", "luống rau", 548, 505, 458, `
   <rect class="hit" x="396" y="462" width="218" height="90"/>
   <ellipse cx="505" cy="550" rx="112" ry="6" fill="#000" opacity=".18" filter="url(#gdSoft)"/>
   <polygon points="410,470 600,470 612,500 398,500" fill="#6b4a2a"/><g fill="#5a3d1f" opacity=".6"><circle cx="430" cy="482" r="2"/><circle cx="470" cy="490" r="2"/><circle cx="540" cy="480" r="2"/><circle cx="580" cy="492" r="2"/></g>
   <rect x="398" y="500" width="214" height="46" fill="url(#gdWood)"/><rect x="398" y="500" width="214" height="6" fill="#9c6a3e"/><g stroke="#8a5a2a" stroke-width="1.5"><path d="M398 522 H612"/><path d="M470 506 V546 M540 506 V546"/></g>
   <g fill="#5fae5a"><path d="M426 480 q-6 -14 0 -20 q6 6 0 20z"/><path d="M434 482 q4 -14 12 -16 q-2 10 -12 16z"/><path d="M580 482 q-6 -14 0 -20 q6 6 0 20z"/><path d="M588 484 q4 -14 12 -16 q-2 10 -12 16z"/></g>
   <g class="gd-weeds" stroke="#7aa34a" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M456 488 l-4 -12 M458 488 l2 -14 M460 488 l6 -10"/><path d="M532 494 l-4 -10 M534 494 l1 -13 M536 494 l5 -9"/><path d="M560 484 l-3 -9 M562 484 l3 -10"/><g fill="#f5d34a" stroke="none"><circle cx="458" cy="472" r="2.5"/><circle cx="535" cy="479" r="2.5"/></g></g>
   <g class="gd-hole"><ellipse cx="505" cy="486" rx="20" ry="6" fill="#3d2814"/><path d="M482 486 q8 -8 16 -6 M514 480 q10 0 14 6" stroke="#8a6a44" stroke-width="3" fill="none"/></g>
   <g class="gd-seeds" fill="#f2e3c6"><circle cx="498" cy="486" r="2"/><circle cx="505" cy="488" r="2"/><circle cx="512" cy="485" r="2"/></g>
   <g class="gd-mound"><ellipse cx="505" cy="484" rx="20" ry="7" fill="#7a5a3a"/><g fill="#5a3d1f"><circle cx="498" cy="482" r="1.6"/><circle cx="510" cy="484" r="1.6"/></g></g>
   <g class="gd-sprout"><path d="M505 482 v-12" stroke="#4c9a49" stroke-width="3"/><ellipse cx="499" cy="470" rx="6" ry="3.5" fill="#6fb36a" transform="rotate(-25 499 470)"/><ellipse cx="511" cy="468" rx="6" ry="3.5" fill="#6fb36a" transform="rotate(25 511 468)"/><g class="gd-drops" fill="#8ccbf0"><circle cx="494" cy="480" r="1.8"/><circle cx="518" cy="482" r="1.8"/></g></g>`),
  objG("soilbag", "bag of soil", "bao đất trồng", 556, 652, 492, `
   <rect class="hit" x="624" y="498" width="58" height="62"/>
   <ellipse cx="653" cy="556" rx="28" ry="4" fill="#000" opacity=".16"/><path d="M628 556 L630 510 Q652 498 676 510 L678 556Z" fill="#5fae5a"/><path d="M630 510 Q652 518 676 510 L674 504 Q652 494 632 504Z" fill="#4c9a49"/>
   <ellipse cx="652" cy="508" rx="16" ry="4" fill="#5a3d1f"/><rect x="638" y="526" width="30" height="18" rx="2" fill="#fffdf9" opacity=".85"/><text x="653" y="538" text-anchor="middle" font-size="7" font-family="system-ui" font-weight="700" fill="#4c9a49">SOIL</text>`),
  objG("wheelbarrow", "wheelbarrow", "xe cút kít", 556.5, 770, 452, `
   <rect class="hit" x="696" y="460" width="148" height="100"/>
   <ellipse cx="770" cy="556" rx="68" ry="5" fill="#000" opacity=".16" filter="url(#gdSoft)"/>
   <g class="gd-tools"><rect x="736" y="452" width="5" height="60" rx="2" fill="#a8693e" transform="rotate(-18 738 512)"/><path d="M720 446 L740 446 L738 462 L722 462Z" fill="#9aa6af" transform="rotate(-18 738 512)"/>
    <rect x="790" y="444" width="5" height="68" rx="2" fill="#a8693e" transform="rotate(14 792 512)"/><rect x="776" y="440" width="34" height="5" rx="1" fill="#5a636c" transform="rotate(14 792 512)"/>
    <g transform="rotate(-6 768 490)"><path d="M760 494 L770 470 M776 494 L766 470" stroke="#9aa6af" stroke-width="3"/><circle cx="760" cy="498" r="4" fill="none" stroke="#e74c3c" stroke-width="2.5"/><circle cx="776" cy="498" r="4" fill="none" stroke="#e74c3c" stroke-width="2.5"/></g></g>
   <path d="M712 494 L832 494 L812 530 L728 530Z" fill="#e74c3c"/><path d="M712 494 L832 494 L828 502 L716 502Z" fill="#c0392b"/>
   <path d="M820 520 L846 534 M728 528 L716 552 M800 528 L812 552" stroke="#5a636c" stroke-width="4" stroke-linecap="round"/>
   <circle cx="700" cy="534" r="14" fill="#3a3f46"/><circle cx="700" cy="534" r="5" fill="#9aa6af"/><path d="M712 524 L700 534" stroke="#5a636c" stroke-width="4"/>`),
  objG("branches", "fallen branches", "cành cây gãy", 590, 902, 538, `
   <rect class="hit" x="852" y="546" width="104" height="48"/>
   <g class="gd-branchLawn"><ellipse cx="904" cy="588" rx="48" ry="5" fill="#000" opacity=".12"/><path d="M860 584 L948 566 M884 579 L874 558 M914 573 L928 552 M930 569 L944 584" stroke="#8a5a2a" stroke-width="5" stroke-linecap="round"/>
    <path d="M872 590 L932 588" stroke="#9c6a3e" stroke-width="4" stroke-linecap="round"/><g fill="#7aa34a"><circle cx="874" cy="556" r="5"/><circle cx="928" cy="550" r="5"/><circle cx="946" cy="586" r="4"/></g></g>`),
  objG("leaves", "fallen leaves", "lá rụng", 401, 620, 586, `
   <g class="gd-leavesScattered"><rect class="hit" x="380" y="584" width="480" height="52"/>${scatteredLeaves}</g>
   <g class="gd-leavesPile"><rect class="hit" x="560" y="590" width="90" height="44"/><ellipse cx="604" cy="624" rx="42" ry="8" fill="#000" opacity=".1"/><ellipse cx="604" cy="612" rx="38" ry="16" fill="#d98c3c"/>${garden_leaf(586, 604, 20, "#c56b3c")}${garden_leaf(612, 600, -30, "#e8b04a")}${garden_leaf(626, 614, 60, "#b8743a")}${garden_leaf(596, 618, -10, "#e8b04a")}</g>`),
  objG("patiotable", "patio table", "bàn ngoài trời", 548, 236, 504, `
   <rect class="hit" x="164" y="430" width="140" height="122"/>
   <ellipse cx="236" cy="548" rx="58" ry="7" fill="#000" opacity=".18" filter="url(#gdSoft)"/>
   <rect x="232" y="470" width="8" height="74" fill="#5a636c"/><ellipse cx="236" cy="544" rx="28" ry="5" fill="#5a636c"/>
   <ellipse cx="236" cy="466" rx="70" ry="14" fill="#fffdf9" stroke="#c9b7a2" stroke-width="2"/><ellipse cx="236" cy="470" rx="70" ry="14" fill="none" stroke="#e2d4c0" stroke-width="3"/>
   <ellipse cx="236" cy="463" rx="52" ry="8" fill="#9fc7c0" opacity=".55"/>`),
  objG("gloves", "gardening gloves", "găng tay làm vườn", 551.2, 196, 438, `
   <rect class="hit" x="196" y="448" width="40" height="22"/>
   <g class="gd-glovesTable"><path d="M200 466 L204 452 L210 452 L212 458 L216 450 L220 452 L218 466Z" fill="#f5c45a" stroke="#c99a3a"/><path d="M216 468 L220 454 L226 454 L228 460 L232 452 L236 454 L234 468Z" fill="#f5c45a" stroke="#c99a3a"/></g>`),
  objG("seedpacket", "seed packet", "gói hạt giống", 551.3, 300, 422, `
   <rect class="hit" x="244" y="440" width="32" height="30"/>
   <rect x="248" y="444" width="22" height="24" rx="2" fill="#f5c45a" stroke="#c99a3a" transform="rotate(8 259 456)"/><circle cx="259" cy="454" r="6" fill="#e74c3c" transform="rotate(8 259 456)"/><path d="M256 452 q3 -4 6 0" stroke="#4c9a49" stroke-width="2" fill="none"/>`),
  objG("gardenchair", "garden chair", "ghế ngoài trời", 579, 344, 488, `
   <rect class="hit" x="312" y="494" width="58" height="88"/>
   <ellipse cx="342" cy="580" rx="30" ry="5" fill="#000" opacity=".16"/>
   <g stroke="#9c6a3e" stroke-width="5" stroke-linecap="round"><line x1="322" y1="548" x2="318" y2="578"/><line x1="362" y1="548" x2="366" y2="578"/></g>
   <rect x="356" y="498" width="10" height="56" rx="4" fill="#c98f5e"/><rect x="314" y="540" width="56" height="12" rx="4" fill="#c98f5e"/><rect x="318" y="534" width="48" height="8" rx="4" fill="#78bdb8"/>
   <g stroke="#9c6a3e" stroke-width="2"><line x1="358" y1="508" x2="364" y2="508"/><line x1="358" y1="520" x2="364" y2="520"/></g>`),
  ...gardenDecor
].join("\n");

const gardenCss = `
#room .gd-glow{opacity:0;transition:opacity .4s}#room [data-gd_light="on"] .gd-glow{opacity:1}#room [data-gd_light="on"] .gd-bulb{fill:#fff3b0}
#room .gd-gateLeaf{transform-origin:838px 0;transition:transform .6s}#room [data-gd_gate="open"] .gd-gateLeaf{transform:scaleX(.14)}
#room .gd-canGround{display:none}#room [data-gd_canat="ground"] .gd-canGround{display:inline}
#room .gd-canWater{display:none}#room [data-gd_can="full"] .gd-canWater{display:inline}
#room .gd-tapWater{display:none}#room [data-gd_tap="on"] .gd-tapWater{display:inline;animation:r2Drip .35s linear infinite}
#room .gd-happy{display:none}#room [data-gd_plants="watered"] .gd-happy{display:inline}#room [data-gd_plants="watered"] .gd-thirsty{display:none}
#room .gd-drops{animation:r2Drip 1.4s ease-in infinite}
#room .gd-overgrown{display:inline}#room [data-gd_trim="trimmed"] .gd-overgrown{display:none}#room .gd-trimmedShine{display:none}#room [data-gd_trim="trimmed"] .gd-trimmedShine{display:inline;animation:r2Twinkle 1.6s ease-in-out infinite}
#room .gd-compostFill{display:none}#room [data-gd_leaves="compost"] .gd-compostFill{display:inline}
#room .gd-compostBranch{display:none}#room [data-gd_branches="compost"] .gd-compostBranch{display:inline}
#room .gd-leavesScattered,#room .gd-leavesPile{display:none}#room [data-gd_leaves="scattered"] .gd-leavesScattered{display:inline}#room [data-gd_leaves="pile"] .gd-leavesPile{display:inline}
#room .gd-branchLawn{display:none}#room [data-gd_branches="lawn"] .gd-branchLawn{display:inline}
#room .gd-patioDirt{display:none}#room [data-gd_patio="dirty"] .gd-patioDirt{display:inline}
#room .gd-seed{display:none}#room [data-gd_feeder="full"] .gd-seed{display:inline}
#room .gd-birds{display:none}#room [data-gd_feeder="full"] .gd-birds{display:inline;animation:r2Bob 1.2s ease-in-out infinite}
#room .gd-bowlClean{display:none}#room [data-gd_bowl="clean"] .gd-bowlClean{display:inline}#room [data-gd_bowl="clean"] .gd-bowlDirty{display:none}
#room [data-gd_bowl="hand"] #o-petbowl .vec{opacity:0}
#room .gd-weeds{display:none}#room [data-gd_weeds="many"] .gd-weeds{display:inline}
#room .gd-hole,#room .gd-seeds,#room .gd-mound,#room .gd-sprout{display:none}
#room [data-gd_hole="dug"] .gd-hole,#room [data-gd_hole="seeded"] .gd-hole,#room [data-gd_hole="seeded"] .gd-seeds{display:inline}
#room [data-gd_hole="covered"] .gd-mound,#room [data-gd_hole="sprout"] .gd-mound,#room [data-gd_hole="sprout"] .gd-sprout{display:inline}
#room .gd-tools{display:none}#room [data-gd_tools="out"] .gd-tools{display:inline}
#room .gd-glovesTable{display:none}#room [data-gd_gloves="table"] .gd-glovesTable{display:inline}
#room [data-detail]{pointer-events:none}
#room .gd-cloud{animation:r2Cloud 16s ease-in-out infinite alternate}#room .gd-twinkle{animation:r2Twinkle 2.4s ease-in-out infinite}
#room .gd-sway{animation:r2Sway 4s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}#room .gd-chime{animation:r2Sway 3s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}
#room .gd-flutter{animation:r2Bob 1s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){#room [data-detail] *,#room [class^="gd-"]{animation:none!important;transition:none!important}}
${sharedKeyframes}
`;

const GD_W0 = { gd_can: "empty", gd_canat: "ground", gd_tap: "off", gd_plants: "thirsty", gd_hole: "none", gd_weeds: "many", gd_trim: "overgrown", gd_gloves: "table",
  gd_leaves: "scattered", gd_patio: "dirty", gd_branches: "lawn", gd_feeder: "empty", gd_bowl: "dirty", gd_gate: "closed", gd_tools: "out", gd_light: "off" };

const garden = {
  id: "garden", name: "Garden", nameVi: "Khu vườn",
  shellSvg: gardenShell, worldSvg: gardenWorld, W0: GD_W0,
  spots: {
    gd_tap: { x: 212, y: 398, d: -1 }, gd_feeder: { x: 352, y: 398, d: -1 }, gd_pots: { x: 495, y: 398, d: 1 }, gd_rose: { x: 640, y: 400, d: 1 },
    gd_compost: { x: 764, y: 400, d: 1 }, gd_gate: { x: 830, y: 400, d: 1 }, gd_light: { x: 150, y: 432, d: -1 }, gd_broom: { x: 140, y: 482, d: -1 },
    gd_patio: { x: 258, y: 612, d: 1 }, gd_bowl: { x: 104, y: 618, d: -1 }, gd_table: { x: 236, y: 586, d: -1 }, gd_seat: { x: 336, y: 584, d: -1 },
    gd_bed: { x: 505, y: 580, d: 1 }, gd_soil: { x: 690, y: 586, d: -1 }, gd_barrow: { x: 770, y: 588, d: 1 }, gd_leaves: { x: 540, y: 612, d: 1 },
    gd_branches: { x: 846, y: 604, d: 1 }, gd_door: { x: 96, y: 522, d: -1 }
  },
  obstacles: [{ x1: 162, x2: 308, y1: 452, y2: 556 }, { x1: 392, x2: 618, y1: 460, y2: 556 }, { x1: 622, x2: 682, y1: 496, y2: 562 }, { x1: 690, x2: 850, y1: 464, y2: 560 },
    { x1: 952, x2: 1000, y1: 420, y2: 476 }, { x1: 360, x2: 392, y1: 540, y2: 566 }],
  entry: { x: 120, y: 528, d: 1 },
  objects: {
    flowerpots: { en: "flower pots", vi: "chậu hoa", ipa: "/ˈflaʊə pɒts/", acts: ["water_garden_plants"] },
    wateringcan: { en: "watering can", vi: "bình tưới cây", ipa: "/ˈwɔː.tər.ɪŋ kæn/", acts: ["fill_watering_can", "water_garden_plants"] },
    vegbed: { en: "vegetable bed", vi: "luống rau", ipa: "/ˈvedʒ.tə.bəl bed/", acts: ["dig_hole", "plant_seed", "add_soil", "pull_weed", "water_garden_plants"] },
    seedpacket: { en: "seed packet", vi: "gói hạt giống", ipa: "/ˈsiːd ˌpæk.ɪt/", acts: ["plant_seed"] },
    soilbag: { en: "bag of soil", vi: "bao đất trồng", ipa: "/bæɡ əv sɔɪl/", acts: ["add_soil"] },
    leaves: { en: "fallen leaves", vi: "lá rụng", ipa: "/ˈfɔː.lən liːvz/", acts: ["rake_leaves", "put_leaves_in_compost"] },
    compostbin: { en: "compost bin", vi: "thùng ủ phân", ipa: "/ˈkɒm.pɒst bɪn/", acts: ["put_leaves_in_compost"] },
    yardbroom: { en: "broom", vi: "cái chổi", ipa: "/bruːm/", acts: ["sweep_patio"] },
    branches: { en: "fallen branches", vi: "cành cây gãy", ipa: "/ˈfɔː.lən ˈbrɑːn.tʃɪz/", acts: ["pick_up_branches"] },
    rosebush: { en: "rose bush", vi: "bụi hoa hồng", ipa: "/ˈrəʊz bʊʃ/", acts: ["trim_plant"] },
    birdfeeder: { en: "bird feeder", vi: "máng ăn cho chim", ipa: "/ˈbɜːd ˌfiː.dər/", acts: ["feed_birds"] },
    petbowl: { en: "pet bowl", vi: "bát của thú cưng", ipa: "/ˈpet bəʊl/", acts: ["clean_pet_bowl"] },
    gardengate: { en: "garden gate", vi: "cổng vườn", ipa: "/ˈɡɑː.dən ɡeɪt/", acts: ["open_garden_gate", "close_garden_gate"] },
    gloves: { en: "gardening gloves", vi: "găng tay làm vườn", ipa: "/ˈɡɑː.dən.ɪŋ ɡlʌvz/", acts: ["put_on_gloves", "take_off_gloves"] },
    wheelbarrow: { en: "wheelbarrow", vi: "xe cút kít", ipa: "/ˈwiːlˌbær.əʊ/", acts: ["bring_tools_inside", "take_tools_outside"] },
    gardenchair: { en: "garden chair", vi: "ghế ngoài trời", ipa: "/ˈɡɑː.dən tʃeər/", acts: ["sit_in_garden"] },
    patiotable: { en: "patio table", vi: "bàn ngoài trời", ipa: "/ˈpæt.i.əʊ ˌteɪ.bəl/", acts: ["put_on_gloves", "plant_seed", "sit_in_garden"] },
    gardenlight: { en: "garden light", vi: "đèn sân vườn", ipa: "/ˈɡɑː.dən laɪt/", acts: ["turn_on_garden_light", "turn_off_garden_light"] }
  },
  actions: gardenActions,
  props: GD_PROPS,
  applyState(W, root) { mirrorState(W, GD_W0, root); },
  css: gardenCss,
  catalog: cat("gd_", [
    ["garden", "/ˈɡɑː.dən/", "khu vườn", "place"], ["lawn", "/lɔːn/", "bãi cỏ", "place"], ["patio", "/ˈpæt.i.əʊ/", "sân hiên lát đá", "place"],
    ["fence", "/fens/", "hàng rào", "structure"], ["gate", "/ɡeɪt/", "cổng", "structure"], ["path", "/pɑːθ/", "lối đi", "place"],
    ["flower bed", "/ˈflaʊə bed/", "bồn hoa", "place"], ["vegetable bed", "/ˈvedʒ.tə.bəl bed/", "luống rau", "place"], ["flower pot", "/ˈflaʊə pɒt/", "chậu hoa", "container"],
    ["watering can", "/ˈwɔː.tər.ɪŋ kæn/", "bình tưới", "tool"], ["hose", "/həʊz/", "vòi tưới", "tool"], ["sprinkler", "/ˈsprɪŋ.klər/", "bình phun tưới tự động", "tool"],
    ["outdoor tap", "/ˈaʊt.dɔː tæp/", "vòi nước ngoài trời", "structure"], ["shovel", "/ˈʃʌv.əl/", "cái xẻng", "tool"], ["spade", "/speɪd/", "cái thuổng", "tool"],
    ["rake", "/reɪk/", "cái cào", "tool"], ["hoe", "/həʊ/", "cái cuốc", "tool"], ["trowel", "/ˈtraʊ.əl/", "cái bay xúc đất", "tool"],
    ["pruning shears", "/ˈpruː.nɪŋ ʃɪəz/", "kéo tỉa cành", "tool"], ["lawn mower", "/ˈlɔːn ˌməʊ.ər/", "máy cắt cỏ", "tool"], ["wheelbarrow", "/ˈwiːlˌbær.əʊ/", "xe cút kít", "tool"],
    ["gardening gloves", "/ˈɡɑː.dən.ɪŋ ɡlʌvz/", "găng tay làm vườn", "tool"], ["seeds", "/siːdz/", "hạt giống", "plant"], ["soil", "/sɔɪl/", "đất trồng", "material"],
    ["fertilizer", "/ˈfɜː.tɪ.laɪ.zər/", "phân bón", "material"], ["compost bin", "/ˈkɒm.pɒst bɪn/", "thùng ủ phân", "container"], ["weeds", "/wiːdz/", "cỏ dại", "plant"],
    ["leaves", "/liːvz/", "lá cây", "plant"], ["branch", "/brɑːntʃ/", "cành cây", "plant"], ["tree", "/triː/", "cái cây", "plant"],
    ["bush", "/bʊʃ/", "bụi cây", "plant"], ["rose", "/rəʊz/", "hoa hồng", "plant"], ["sunflower", "/ˈsʌnˌflaʊ.ər/", "hoa hướng dương", "plant"],
    ["grass", "/ɡrɑːs/", "cỏ", "plant"], ["herbs", "/hɜːbz/", "rau thơm", "plant"], ["sprout", "/spraʊt/", "mầm cây", "plant"],
    ["apple tree", "/ˈæp.əl triː/", "cây táo", "plant"], ["bird feeder", "/ˈbɜːd ˌfiː.dər/", "máng ăn cho chim", "animal"], ["birdhouse", "/ˈbɜːd.haʊs/", "nhà chim", "animal"],
    ["bird bath", "/ˈbɜːd bɑːθ/", "bồn tắm cho chim", "animal"], ["pet bowl", "/ˈpet bəʊl/", "bát của thú cưng", "animal"], ["butterfly", "/ˈbʌt.ə.flaɪ/", "con bướm", "animal"],
    ["bee", "/biː/", "con ong", "animal"], ["snail", "/sneɪl/", "con ốc sên", "animal"], ["worm", "/wɜːm/", "con giun", "animal"],
    ["patio table", "/ˈpæt.i.əʊ ˌteɪ.bəl/", "bàn ngoài trời", "furniture"], ["garden chair", "/ˈɡɑː.dən tʃeər/", "ghế ngoài trời", "furniture"], ["parasol", "/ˈpær.ə.sɒl/", "ô che nắng", "furniture"],
    ["bench", "/bentʃ/", "ghế dài", "furniture"], ["garden light", "/ˈɡɑː.dən laɪt/", "đèn sân vườn", "light"], ["solar light", "/ˈsəʊ.lə laɪt/", "đèn năng lượng mặt trời", "light"],
    ["lantern", "/ˈlæn.tən/", "đèn lồng", "light"], ["garden gnome", "/ˈɡɑː.dən nəʊm/", "tượng chú lùn trang trí", "decor"], ["wind chime", "/ˈwɪnd tʃaɪm/", "chuông gió", "decor"],
    ["clothesline", "/ˈkləʊðz.laɪn/", "dây phơi quần áo", "structure"], ["mailbox", "/ˈmeɪl.bɒks/", "hộp thư", "structure"], ["shed", "/ʃed/", "nhà kho nhỏ", "structure"]
  ])
};

/* ---------- merge into the shared registry ---------- */
const NEW_ROOMS = { bathroom, garage, garden };
if (typeof window !== "undefined") window.ELW_ROOMS = Object.assign(window.ELW_ROOMS || {}, NEW_ROOMS);
if (typeof module !== "undefined" && module.exports) module.exports = { ELW_ROOMS2: NEW_ROOMS };
})();
