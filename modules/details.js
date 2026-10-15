/* English Life World — interactive room details (20 decorations → real objects)
   Browser script, load AFTER rooms2.js (and before the main inline script).
   - Living room: registered as a pseudo-room entry ELW_ROOMS.living_details (id "living") so the app merges
     its objects / actions / W0 / spots / props / css exactly like other rooms. Click areas are invisible
     .obj overlays inserted into #world (data-room="living") so the app's bindObj picks them up.
   - Other rooms: objects/actions/W0/spots/props are merged into the existing room entries and the overlays
     are appended to that room's worldSvg string.
   All state keys are prefixed dt_. A small poller mirrors every dt_ key onto #room as data-dt_<key>,
   which drives the CSS (works for the living room too, whose applyState ignores module rooms). */
(function () {
"use strict";
if (typeof window === "undefined") return;
const ROOMS = window.ELW_ROOMS = window.ELW_ROOMS || {};

const mk = (id, obj, label, labelVi, sentence, vi, key, vocab, grammar, chunks, disc, patterns, pre, seq, story, sitOk) => ({
  id, obj, label, labelVi, sentence, vi, key, vocab, grammar, chunks, disc: { ans: disc[0], opts: disc.slice() }, patterns, pre, seq, story, sitOk: !!sitOk
});
const V = {
  look: ["look at", "/lʊk æt/", "nhìn vào"], clock: ["clock", "/klɒk/", "đồng hồ"], time: ["time", "/taɪm/", "thời gian, giờ"],
  straighten: ["straighten", "/ˈstreɪ.tən/", "làm cho thẳng"], picture: ["picture", "/ˈpɪk.tʃər/", "bức tranh"], crooked: ["crooked", "/ˈkrʊk.ɪd/", "bị lệch, cong"],
  turnon: ["turn on", "/tɜːn ɒn/", "bật"], turnoff: ["turn off", "/tɜːn ɒf/", "tắt"], ceiling: ["ceiling light", "/ˈsiː.lɪŋ laɪt/", "đèn trần"], switch: ["light switch", "/ˈlaɪt swɪtʃ/", "công tắc đèn"],
  ac: ["air conditioner", "/ˈeə kənˌdɪʃ.ən.ər/", "máy điều hoà"], cool: ["cool", "/kuːl/", "mát"], hot: ["hot", "/hɒt/", "nóng"],
  dust: ["dust", "/dʌst/", "phủi bụi; bụi"], frame: ["photo frame", "/ˈfəʊ.təʊ freɪm/", "khung ảnh"], family: ["family", "/ˈfæm.əl.i/", "gia đình"], photo: ["photo", "/ˈfəʊ.təʊ/", "bức ảnh"],
  light: ["light", "/laɪt/", "thắp, châm (lửa)"], candle: ["candle", "/ˈkæn.dəl/", "cây nến"], blowout: ["blow out", "/bləʊ aʊt/", "thổi tắt"], match: ["match", "/mætʃ/", "que diêm"],
  tidy: ["tidy", "/ˈtaɪ.di/", "dọn gọn gàng"], bookshelf: ["bookshelf", "/ˈbʊk.ʃelf/", "giá sách"], books: ["books", "/bʊks/", "những quyển sách"],
  spin: ["spin", "/spɪn/", "quay tròn"], globe: ["globe", "/ɡləʊb/", "quả địa cầu"], find: ["find", "/faɪnd/", "tìm"], vietnam: ["Vietnam", "/ˌvjetˈnæm/", "Việt Nam"], map: ["map", "/mæp/", "bản đồ"],
  puton: ["put on", "/pʊt ɒn/", "mặc vào, đi vào"], takeoff: ["take off", "/teɪk ɒf/", "cởi ra"], jacket: ["jacket", "/ˈdʒæk.ɪt/", "áo khoác"], hangup: ["hang up", "/hæŋ ʌp/", "treo lên"], hook: ["hook", "/hʊk/", "cái móc"],
  vacuum: ["vacuum", "/ˈvæk.juːm/", "hút bụi"], rug: ["rug", "/rʌɡ/", "tấm thảm"], crumbs: ["crumbs", "/krʌmz/", "vụn bánh"],
  slippers: ["slippers", "/ˈslɪp.əz/", "dép đi trong nhà"], feet: ["feet", "/fiːt/", "bàn chân (số nhiều)"],
  take: ["take", "/teɪk/", "lấy, mang theo"], umbrella: ["umbrella", "/ʌmˈbrel.ə/", "cái ô"], rain: ["rain", "/reɪn/", "mưa"], putback: ["put back", "/pʊt bæk/", "để lại chỗ cũ"], stand: ["umbrella stand", "/ʌmˈbrel.ə stænd/", "ống đựng ô"],
  smell: ["smell", "/smel/", "ngửi"], flowers: ["flowers", "/ˈflaʊ.əz/", "những bông hoa"], vase: ["vase", "/vɑːz/", "lọ hoa"], change: ["change", "/tʃeɪndʒ/", "thay"], fresh: ["fresh", "/freʃ/", "tươi, sạch, mới"], water: ["water", "/ˈwɔː.tər/", "nước; tưới"],
  hanging: ["hanging plant", "/ˈhæŋ.ɪŋ plɑːnt/", "chậu cây treo"], thirsty: ["thirsty", "/ˈθɜː.sti/", "khát nước"],
  open: ["open", "/ˈəʊ.pən/", "mở"], close: ["close", "/kləʊz/", "đóng"], breadbox: ["bread box", "/ˈbred bɒks/", "hộp đựng bánh mì"], bread: ["bread", "/bred/", "bánh mì"],
  recycle: ["recycle", "/ˌriːˈsaɪ.kəl/", "tái chế"], bottle: ["bottle", "/ˈbɒt.əl/", "cái chai"], bin: ["recycling bin", "/riːˈsaɪ.klɪŋ bɪn/", "thùng rác tái chế"], plastic: ["plastic", "/ˈplæs.tɪk/", "nhựa"],
  fairy: ["fairy lights", "/ˈfeə.ri laɪts/", "dây đèn trang trí"], cosy: ["cosy", "/ˈkəʊ.zi/", "ấm cúng"],
  squeeze: ["squeeze", "/skwiːz/", "bóp"], duck: ["rubber duck", "/ˈrʌb.ə dʌk/", "vịt cao su"], squeak: ["squeak", "/skwiːk/", "kêu chít chít"],
  check: ["check", "/tʃek/", "kiểm tra"], extinguisher: ["fire extinguisher", "/ˈfaɪər ɪkˌstɪŋ.ɡwɪ.ʃər/", "bình chữa cháy"], gauge: ["gauge", "/ɡeɪdʒ/", "đồng hồ đo"], safety: ["safety", "/ˈseɪf.ti/", "sự an toàn"],
  fill: ["fill", "/fɪl/", "đổ đầy"], birdbath: ["bird bath", "/ˈbɜːd bɑːθ/", "bồn nước cho chim"], birds: ["birds", "/bɜːdz/", "những con chim"]
};
const v = (...k) => k.map(x => { if (!V[x]) throw new Error("details vocab " + x); return V[x]; });
const idle = ["pose", "idle", 1];

/* ---------------- 20 objects ---------------- */
const LIV_OBJ = {
  wallclock: { en: "wall clock", vi: "đồng hồ treo tường", ipa: "/ˌwɔːl ˈklɒk/", acts: ["check_the_time"] },
  wallpicture: { en: "picture", vi: "bức tranh", ipa: "/ˈpɪk.tʃər/", acts: ["straighten_picture"] },
  ceilinglight: { en: "ceiling light", vi: "đèn trần", ipa: "/ˈsiː.lɪŋ laɪt/", acts: ["turn_on_ceiling_light", "turn_off_ceiling_light"] },
  aircon: { en: "air conditioner", vi: "máy điều hoà", ipa: "/ˈeə kənˌdɪʃ.ən.ər/", acts: ["turn_on_air_conditioner", "turn_off_air_conditioner"] },
  photoframe: { en: "photo frame", vi: "khung ảnh", ipa: "/ˈfəʊ.təʊ freɪm/", acts: ["dust_photo_frame", "look_at_family_photo"] },
  shelfcandle: { en: "candle", vi: "cây nến", ipa: "/ˈkæn.dəl/", acts: ["light_candle", "blow_out_candle"] },
  bookshelf: { en: "bookshelf", vi: "giá sách", ipa: "/ˈbʊk.ʃelf/", acts: ["tidy_bookshelf"] },
  globe: { en: "globe", vi: "quả địa cầu", ipa: "/ɡləʊb/", acts: ["spin_globe", "find_vietnam_on_globe"] },
  jacket: { en: "jacket", vi: "áo khoác", ipa: "/ˈdʒæk.ɪt/", acts: ["put_on_jacket", "hang_up_jacket"] },
  livrug: { en: "rug", vi: "tấm thảm", ipa: "/rʌɡ/", acts: ["vacuum_rug"] },
  livslippers: { en: "slippers", vi: "dép đi trong nhà", ipa: "/ˈslɪp.əz/", acts: ["put_on_slippers", "take_off_slippers"] },
  umbrella: { en: "umbrella", vi: "cái ô", ipa: "/ʌmˈbrel.ə/", acts: ["take_umbrella", "put_umbrella_back"] },
  vase: { en: "vase", vi: "lọ hoa", ipa: "/vɑːz/", acts: ["smell_flowers", "change_vase_water"] },
  hangingplant: { en: "hanging plant", vi: "chậu cây treo", ipa: "/ˈhæŋ.ɪŋ plɑːnt/", acts: ["water_hanging_plant"] }
};
const OTHER_OBJ = {
  kitchen: {
    breadbox: { en: "bread box", vi: "hộp đựng bánh mì", ipa: "/ˈbred bɒks/", acts: ["open_bread_box", "close_bread_box"] },
    recyclingbin: { en: "recycling bin", vi: "thùng rác tái chế", ipa: "/riːˈsaɪ.klɪŋ bɪn/", acts: ["recycle_bottle"] }
  },
  bedroom: { fairylights: { en: "fairy lights", vi: "dây đèn trang trí", ipa: "/ˈfeə.ri laɪts/", acts: ["turn_on_fairy_lights", "turn_off_fairy_lights"] } },
  bathroom: { rubberduck: { en: "rubber duck", vi: "vịt cao su", ipa: "/ˈrʌb.ə dʌk/", acts: ["squeeze_rubber_duck"] } },
  garage: { extinguisher: { en: "fire extinguisher", vi: "bình chữa cháy", ipa: "/ˈfaɪər ɪkˌstɪŋ.ɡwɪ.ʃər/", acts: ["check_fire_extinguisher"] } },
  garden: { birdbath: { en: "bird bath", vi: "bồn nước cho chim", ipa: "/ˈbɜːd bɑːθ/", acts: ["fill_bird_bath"] } }
};

/* ---------------- state ---------------- */
const LIV_W0 = { dt_ceil: "off", dt_ac: "off", dt_pic: "crooked", dt_frame: "dusty", dt_candle: "off", dt_shelf: "messy", dt_globe: "still",
  dt_jacket: "hook", dt_rug: "dirty", dt_slippers: "floor", dt_umbrella: "stand", dt_vase: "stale", dt_hplant: "thirsty" };
const OTHER_W0 = { kitchen: { dt_bread: "closed" }, bedroom: { dt_fairy: "off" }, bathroom: { dt_duck: "still" }, garage: { dt_ext: "unchecked" }, garden: { dt_birdbath: "empty" } };

/* ---------------- spots ---------------- */
const LIV_SPOTS = {
  dt_clock: { x: 250, y: 360, d: -1 }, dt_picture: { x: 236, y: 350, d: -1 }, dt_switch: { x: 190, y: 350, d: -1 }, dt_frame: { x: 336, y: 352, d: 1 },
  dt_candle: { x: 400, y: 352, d: 1 }, dt_shelf: { x: 124, y: 470, d: -1 }, dt_globe: { x: 120, y: 430, d: -1 }, dt_hook: { x: 168, y: 362, d: -1 },
  dt_rug: { x: 300, y: 562, d: 1 }, dt_slippers: { x: 156, y: 614, d: -1 }, dt_umbrella: { x: 74, y: 590, d: -1 }, dt_vase: { x: 790, y: 562, d: 1 },
  dt_hplant: { x: 930, y: 404, d: 1 }
};
const OTHER_SPOTS = {
  kitchen: { dt_breadbox: { x: 858, y: 396, d: 1 }, dt_recycle: { x: 150, y: 504, d: -1 } },
  bedroom: { dt_fairy: { x: 400, y: 546, d: -1 } },
  bathroom: { dt_duck: { x: 372, y: 398, d: -1 } },
  garage: { dt_ext: { x: 706, y: 400, d: 1 } },
  garden: { dt_birdbath: { x: 928, y: 474, d: 1 } }
};

/* ---------------- props (spawned into the hand) ---------------- */
const PROPS = {
  dt_duster: `<path d="M-2 0 L2 0 L2 -26 L-2 -26Z" fill="#a0703a"/><path d="M-10 -26 Q0 -44 10 -26Z" fill="#f28fa0"/><path d="M-8 -30 Q0 -40 8 -30" stroke="#e7564d" fill="none"/>`,
  dt_match: `<rect x="-1.5" y="-18" width="3" height="18" fill="#e8cfa0"/><circle cx="0" cy="-19" r="3" fill="#e7564d"/><path d="M0 -22 q-3 -6 0 -10 q3 4 0 10Z" fill="#f5c45a"/>`,
  dt_vacuum: `<rect x="-2" y="-90" width="4" height="80" rx="2" fill="#5a616b"/><rect x="-16" y="-12" width="32" height="12" rx="4" fill="#e7564d"/>`,
  dt_jug: `<path d="M-10 -26 L10 -26 L8 0 L-8 0Z" fill="#cfe9f7" stroke="#6fb3d9" stroke-width="1.5"/><path d="M10 -22 q8 2 0 12" stroke="#6fb3d9" stroke-width="2.5" fill="none"/>`,
  dt_bottle: `<path d="M-6 0 L-6 -20 Q-6 -24 -2 -26 L-2 -32 L2 -32 L2 -26 Q6 -24 6 -20 L6 0Z" fill="#9fd6f2" opacity=".9" stroke="#6fb3d9"/>`,
  dt_umb: `<path d="M0 0 L0 -40" stroke="#5a3d1f" stroke-width="2.5"/><path d="M-4 -36 L0 -62 L4 -36Z" fill="#e7564d"/><path d="M0 0 q0 5 -5 5" stroke="#5a3d1f" stroke-width="2.5" fill="none"/>`
};

/* ---------------- actions ---------------- */
const livingActions = [
  mk("check_the_time", "wallclock", "Check the time", "Xem giờ", "I'm checking the time on the wall clock.", "Tôi đang xem giờ trên đồng hồ treo tường.", ["checking", "time", "clock"], v("look", "clock", "time"),
    "<b>check the time</b> = xem giờ. Hỏi giờ: <i>What time is it?</i> — Trả lời: <i>It's seven o'clock.</i>", ["I'm checking the time", "on the wall clock."], ["clock", "cloak", "lock"],
    ["I'm checking <b>my phone</b>.", "I'm checking <b>the calendar</b>."],
    W => null,
    W => [["walk", "dt_clock"], ["pose", "point", 900], ["wait", 400], idle],
    ["check the time", "glance up and check the time", "xem giờ"], true),
  mk("straighten_picture", "wallpicture", "Straighten the picture", "Chỉnh lại bức tranh", "I'm straightening the crooked picture.", "Tôi đang chỉnh lại bức tranh bị lệch.", ["straightening", "picture"], v("straighten", "picture", "crooked"),
    "<b>straight</b> (thẳng) + <b>-en</b> → <b>straighten</b> (làm cho thẳng). Tương tự: short → shorten, bright → brighten.", ["I'm straightening", "the crooked picture."], ["picture", "pitcher", "pick sure"],
    ["I'm straightening <b>the rug</b>.", "I'm straightening <b>my tie</b>."],
    W => W.dt_pic === "straight" ? "Bức tranh đã thẳng rồi." : null,
    W => [["walk", "dt_picture"], ["pose", "reach", 700], ["set", "dt_pic", "straight"], ["wait", 300], idle],
    ["straighten the picture", "carefully straighten the crooked picture", "chỉnh lại bức tranh cho thẳng"]),
  mk("turn_on_ceiling_light", "ceilinglight", "Turn on the ceiling light", "Bật đèn trần", "I'm turning on the ceiling light.", "Tôi đang bật đèn trần.", ["turning", "ceiling", "light"], v("turnon", "ceiling", "switch"),
    "<b>ceiling</b> /ˈsiː.lɪŋ/ = trần nhà. Đèn treo trên trần: <b>ceiling light</b>. Bật bằng <b>light switch</b> (công tắc).", ["I'm turning on", "the ceiling light."], ["ceiling", "sealing", "selling"],
    ["I'm turning on <b>the fan</b>.", "I'm turning on <b>the air conditioner</b>."],
    W => W.dt_ceil === "on" ? "Đèn trần đang bật rồi." : null,
    W => [["walk", "dt_switch"], ["pose", "point", 450], ["set", "dt_ceil", "on"], idle],
    ["turn on the ceiling light", "flick the switch and turn on the ceiling light", "bật đèn trần"]),
  mk("turn_off_ceiling_light", "ceilinglight", "Turn off the ceiling light", "Tắt đèn trần", "I'm turning off the ceiling light.", "Tôi đang tắt đèn trần.", ["turning", "off", "light"], v("turnoff", "ceiling", "switch"),
    "<b>turn off</b> ↔ <b>turn on</b>. Ra khỏi phòng nhớ tắt đèn để tiết kiệm điện.", ["I'm turning off", "the ceiling light."], ["light", "right", "white"],
    ["I'm turning off <b>the TV</b>.", "I'm turning off <b>the fan</b>."],
    W => W.dt_ceil !== "on" ? "Đèn trần đang tắt rồi." : null,
    W => [["walk", "dt_switch"], ["pose", "point", 450], ["set", "dt_ceil", "off"], idle],
    ["turn off the ceiling light", "turn off the ceiling light to save electricity", "tắt đèn trần"]),
  mk("turn_on_air_conditioner", "aircon", "Turn on the air conditioner", "Bật điều hoà", "It's hot, so I'm turning on the air conditioner.", "Trời nóng nên tôi đang bật điều hoà.", ["hot", "turning", "air conditioner"], v("turnon", "ac", "hot", "cool"),
    "<b>so</b> = nên, vì vậy: <i>It's hot, <b>so</b> I'm turning on the AC.</i> Người Anh hay nói tắt: <b>the AC</b> /ˌeɪˈsiː/.", ["It's hot,", "so I'm turning on", "the air conditioner."], ["hot", "hat", "hut"],
    ["It's dark, so I'm turning on <b>the light</b>.", "It's cold, so I'm closing <b>the window</b>."],
    W => W.dt_ac === "on" ? "Điều hoà đang bật rồi." : null,
    W => [["pose", "point", 600], ["set", "dt_ac", "on"], ["wait", 400], idle],
    ["turn on the air conditioner", "turn on the air conditioner to cool down", "bật điều hoà"], true),
  mk("turn_off_air_conditioner", "aircon", "Turn off the air conditioner", "Tắt điều hoà", "It's cool now, so I'm turning off the air conditioner.", "Bây giờ mát rồi nên tôi tắt điều hoà.", ["cool", "turning", "off"], v("turnoff", "ac", "cool"),
    "<b>now</b> đặt cuối câu hoặc sau “It's …”: <i>It's cool <b>now</b>.</i>", ["It's cool now,", "so I'm turning off", "the air conditioner."], ["cool", "cold", "call"],
    ["It's quiet now, so I'm turning off <b>the music</b>.", "It's late now, so I'm turning off <b>the TV</b>."],
    W => W.dt_ac !== "on" ? "Điều hoà đang tắt rồi." : null,
    W => [["pose", "point", 600], ["set", "dt_ac", "off"], ["wait", 300], idle],
    ["turn off the air conditioner", "turn off the air conditioner", "tắt điều hoà"], true),
  mk("dust_photo_frame", "photoframe", "Dust the photo frame", "Phủi bụi khung ảnh", "I'm dusting the photo frame.", "Tôi đang phủi bụi khung ảnh.", ["dusting", "photo frame"], v("dust", "frame"),
    "<b>dust</b> vừa là danh từ (bụi) vừa là động từ (phủi bụi): <i>I'm dusting the shelf.</i>", ["I'm dusting", "the photo frame."], ["dust", "just", "dusk"],
    ["I'm dusting <b>the bookshelf</b>.", "I'm dusting <b>the TV</b>."],
    W => W.dt_frame === "clean" ? "Khung ảnh đã sạch bụi rồi." : null,
    W => [["walk", "dt_frame"], ["spawn", "dt_duster"], ["pose", "wipe", 1300], ["despawn"], ["set", "dt_frame", "clean"], idle],
    ["dust the photo frame", "gently dust the photo frame", "phủi bụi khung ảnh"]),
  mk("look_at_family_photo", "photoframe", "Look at the family photo", "Ngắm ảnh gia đình", "I'm looking at my family photo.", "Tôi đang ngắm ảnh gia đình.", ["looking", "family", "photo"], v("look", "family", "photo"),
    "<b>look at</b> + vật = nhìn/ngắm. Không bỏ <b>at</b>: ❌ look the photo → ✅ look <b>at</b> the photo.", ["I'm looking at", "my family photo."], ["photo", "phone", "forty"],
    ["I'm looking at <b>the map</b>.", "I'm looking at <b>the stars</b>."],
    W => W.dt_frame !== "clean" ? "Khung ảnh đầy bụi. Hãy phủi bụi trước (Dust the photo frame)." : null,
    W => [["walk", "dt_frame"], ["pose", "reach", 500], ["pose", "read", 1300], idle],
    ["look at the family photo", "smile and look at the family photo", "ngắm ảnh gia đình"]),
  mk("light_candle", "shelfcandle", "Light the candle", "Thắp nến", "I'm lighting the candle with a match.", "Tôi đang thắp nến bằng que diêm.", ["lighting", "candle", "match"], v("light", "candle", "match"),
    "<b>light</b> vừa là danh từ (đèn) vừa là động từ (thắp, châm lửa): light → <b>lighting</b>.", ["I'm lighting the candle", "with a match."], ["candle", "handle", "candy"],
    ["I'm lighting <b>the fire</b>.", "I'm lighting <b>the gas stove</b>."],
    W => W.dt_candle === "on" ? "Nến đang cháy rồi." : null,
    W => [["walk", "dt_candle"], ["spawn", "dt_match"], ["pose", "reach", 800], ["set", "dt_candle", "on"], ["despawn"], idle],
    ["light the candle", "light a small candle", "thắp nến"]),
  mk("blow_out_candle", "shelfcandle", "Blow out the candle", "Thổi tắt nến", "I'm blowing out the candle.", "Tôi đang thổi tắt nến.", ["blowing", "out", "candle"], v("blowout", "candle"),
    "<b>blow out</b> = thổi tắt (nến). Sinh nhật: <i>Make a wish and blow out the candles!</i>", ["I'm blowing out", "the candle."], ["blow", "blue", "below"],
    ["I'm blowing out <b>the birthday candles</b>.", "I'm blowing <b>my nose</b>."],
    W => W.dt_candle !== "on" ? "Nến chưa cháy. Hãy thắp nến trước (Light the candle)." : null,
    W => [["walk", "dt_candle"], ["pose", "drink", 700], ["set", "dt_candle", "off"], ["wait", 300], idle],
    ["blow out the candle", "gently blow out the candle", "thổi tắt nến"]),
  mk("tidy_bookshelf", "bookshelf", "Tidy the bookshelf", "Xếp gọn giá sách", "I'm tidying the books on the bookshelf.", "Tôi đang xếp gọn sách trên giá sách.", ["tidying", "books", "bookshelf"], v("tidy", "books", "bookshelf"),
    "<b>tidy</b> → tid<b>ying</b> (giữ y, thêm -ing). Tính từ: <i>The room is <b>tidy</b>.</i> (gọn gàng) ↔ <b>messy</b>.", ["I'm tidying the books", "on the bookshelf."], ["shelf", "self", "shell"],
    ["I'm tidying <b>my desk</b>.", "I'm tidying <b>the toys</b>."],
    W => W.dt_shelf === "tidy" ? "Giá sách đã gọn gàng rồi." : null,
    W => [["walk", "dt_shelf"], ["pose", "reach", 700], ["pose", "bend", 500], ["set", "dt_shelf", "tidy"], ["pose", "reach", 400], idle],
    ["tidy the bookshelf", "neatly tidy the books on the bookshelf", "xếp gọn giá sách"]),
  mk("spin_globe", "globe", "Spin the globe", "Quay quả địa cầu", "I'm spinning the globe.", "Tôi đang quay quả địa cầu.", ["spinning", "globe"], v("spin", "globe"),
    "spin → spi<b>nn</b>ing (gấp đôi phụ âm cuối: phụ âm–nguyên âm–phụ âm). Giống run → running.", ["I'm spinning", "the globe."], ["globe", "glove", "glow"],
    ["I'm spinning <b>the wheel</b>.", "I'm spinning <b>a top</b>."],
    W => null,
    W => [["walk", "dt_globe"], ["pose", "reach", 300], ["set", "dt_globe", "spin"], ["wait", 1300], ["set", "dt_globe", "still"], idle],
    ["spin the globe", "give the globe a fast spin", "quay quả địa cầu"]),
  mk("find_vietnam_on_globe", "globe", "Find Vietnam on the globe", "Tìm Việt Nam trên quả địa cầu", "I'm finding Vietnam on the globe.", "Tôi đang tìm Việt Nam trên quả địa cầu.", ["finding", "Vietnam", "globe"], v("find", "vietnam", "globe", "map"),
    "Tên nước viết hoa, không có “the”: <b>Vietnam</b>, <b>Japan</b>. Nhưng: <b>the</b> USA, <b>the</b> UK.", ["I'm finding Vietnam", "on the globe."], ["find", "fine", "fight"],
    ["I'm finding <b>Japan</b> on the <b>map</b>.", "I'm finding <b>my house</b> on the <b>map</b>."],
    W => null,
    W => [["walk", "dt_globe"], ["pose", "reach", 400], ["pose", "point", 1200], idle],
    ["find Vietnam on the globe", "proudly find Vietnam on the globe", "tìm Việt Nam trên quả địa cầu"]),
  mk("put_on_jacket", "jacket", "Put on my jacket", "Mặc áo khoác", "I'm putting on my jacket.", "Tôi đang mặc áo khoác.", ["putting", "on", "jacket"], v("puton", "jacket", "hook"),
    "<b>put on</b> = mặc/đội/đi vào (quần áo, mũ, giày). Ngược lại: <b>take off</b> = cởi ra.", ["I'm putting on", "my jacket."], ["jacket", "jack it", "racket"],
    ["I'm putting on <b>my shoes</b>.", "I'm putting on <b>my hat</b>."],
    W => W.dt_jacket === "on" ? "Bạn đang mặc áo khoác rồi." : null,
    W => [["walk", "dt_hook"], ["pose", "reach", 500], ["set", "dt_jacket", "on"], ["pose", "pet", 700], idle],
    ["put on my jacket", "quickly put on my warm jacket", "mặc áo khoác"]),
  mk("hang_up_jacket", "jacket", "Hang up my jacket", "Treo áo khoác lên", "I'm hanging up my jacket on the hook.", "Tôi đang treo áo khoác lên móc.", ["hanging", "jacket", "hook"], v("takeoff", "hangup", "jacket", "hook"),
    "<b>hang up</b> = treo lên. <b>on the hook</b> = trên cái móc. Về nhà: take off → hang up.", ["I'm hanging up my jacket", "on the hook."], ["hook", "hug", "book"],
    ["I'm hanging up <b>my coat</b>.", "I'm hanging up <b>the towel</b>."],
    W => W.dt_jacket !== "on" ? "Áo khoác đang treo trên móc. Hãy mặc áo khoác trước (Put on my jacket)." : null,
    W => [["walk", "dt_hook"], ["pose", "pet", 500], ["pose", "reach", 600], ["set", "dt_jacket", "hook"], idle],
    ["hang up my jacket", "take off my jacket and hang it up on the hook", "treo áo khoác lên móc"]),
  mk("vacuum_rug", "livrug", "Vacuum the rug", "Hút bụi tấm thảm", "I'm vacuuming the rug.", "Tôi đang hút bụi tấm thảm.", ["vacuuming", "rug"], v("vacuum", "rug", "crumbs"),
    "<b>vacuum</b> /ˈvæk.juːm/ = hút bụi (động từ) hoặc máy hút bụi (= vacuum cleaner). <b>rug</b> = thảm nhỏ, <b>carpet</b> = thảm trải kín sàn.", ["I'm vacuuming", "the rug."], ["rug", "rag", "rock"],
    ["I'm vacuuming <b>the floor</b>.", "I'm vacuuming <b>the sofa</b>."],
    W => W.dt_rug === "clean" ? "Tấm thảm đã sạch rồi." : null,
    W => [["walk", "dt_rug"], ["spawn", "dt_vacuum"], ["pose", "sweep", 1800], ["despawn"], ["set", "dt_rug", "clean"], idle],
    ["vacuum the rug", "vacuum the dusty rug", "hút bụi tấm thảm"]),
  mk("put_on_slippers", "livslippers", "Put on my slippers", "Đi dép trong nhà", "I'm putting on my slippers.", "Tôi đang đi dép trong nhà.", ["putting", "on", "slippers"], v("puton", "slippers", "feet"),
    "slippers luôn ở số nhiều (một đôi): <i>my slippers <b>are</b> here.</i> Một đôi: <b>a pair of</b> slippers.", ["I'm putting on", "my slippers."], ["slippers", "slipper", "sleepers"],
    ["I'm putting on <b>my socks</b>.", "I'm putting on <b>my sneakers</b>."],
    W => W.dt_slippers === "on" ? "Bạn đang đi dép rồi." : null,
    W => [["walk", "dt_slippers"], ["pose", "bend", 700], ["set", "dt_slippers", "on"], idle],
    ["put on my slippers", "put on my soft slippers", "đi dép trong nhà"]),
  mk("take_off_slippers", "livslippers", "Take off my slippers", "Cởi dép ra", "I'm taking off my slippers.", "Tôi đang cởi dép ra.", ["taking", "off", "slippers"], v("takeoff", "slippers"),
    "<b>take off</b> = cởi ra (giày, dép, áo, mũ). take → tak<b>ing</b> (bỏ e).", ["I'm taking off", "my slippers."], ["off", "of", "if"],
    ["I'm taking off <b>my shoes</b>.", "I'm taking off <b>my jacket</b>."],
    W => W.dt_slippers !== "on" ? "Bạn chưa đi dép. Hãy đi dép trước (Put on my slippers)." : null,
    W => [["walk", "dt_slippers"], ["pose", "bend", 700], ["set", "dt_slippers", "floor"], idle],
    ["take off my slippers", "take off my slippers by the door", "cởi dép ra"]),
  mk("take_umbrella", "umbrella", "Take an umbrella", "Lấy ô", "It's raining, so I'm taking an umbrella.", "Trời đang mưa nên tôi lấy ô.", ["raining", "taking", "umbrella"], v("take", "umbrella", "rain", "stand"),
    "<b>an</b> umbrella (vì “umbrella” bắt đầu bằng nguyên âm /ʌ/). It's raining = trời đang mưa.", ["It's raining,", "so I'm taking an umbrella."], ["umbrella", "umbrellas", "unbrella"],
    ["It's sunny, so I'm taking <b>my hat</b>.", "It's cold, so I'm taking <b>a jacket</b>."],
    W => W.dt_umbrella === "hand" ? "Bạn đã lấy ô rồi." : null,
    W => [["walk", "dt_umbrella"], ["pose", "bend", 500], ["set", "dt_umbrella", "hand"], ["spawn", "dt_umb"], ["wait", 600], ["despawn"], idle],
    ["take an umbrella", "grab an umbrella because it's raining", "lấy ô"]),
  mk("put_umbrella_back", "umbrella", "Put the umbrella back", "Cắm ô lại vào ống", "I'm putting the umbrella back in the stand.", "Tôi đang cắm ô lại vào ống đựng ô.", ["putting", "back", "stand"], v("putback", "umbrella", "stand"),
    "<b>put … back</b> = để lại chỗ cũ. <b>in</b> the stand = vào trong ống.", ["I'm putting the umbrella back", "in the stand."], ["back", "bag", "pack"],
    ["I'm putting <b>the book</b> back <b>on the shelf</b>.", "I'm putting <b>the milk</b> back <b>in the fridge</b>."],
    W => W.dt_umbrella !== "hand" ? "Ô đang ở trong ống. Hãy lấy ô trước (Take an umbrella)." : null,
    W => [["walk", "dt_umbrella"], ["spawn", "dt_umb"], ["pose", "bend", 600], ["despawn"], ["set", "dt_umbrella", "stand"], idle],
    ["put the umbrella back", "put the wet umbrella back in the stand", "cắm ô lại vào ống"]),
  mk("smell_flowers", "vase", "Smell the flowers", "Ngửi hoa", "I'm smelling the flowers in the vase.", "Tôi đang ngửi hoa trong lọ.", ["smelling", "flowers", "vase"], v("smell", "flowers", "vase"),
    "<b>smell</b> = ngửi (động từ) hoặc có mùi: <i>The flowers <b>smell</b> nice.</i>", ["I'm smelling the flowers", "in the vase."], ["smell", "small", "spell"],
    ["I'm smelling <b>the coffee</b>.", "I'm smelling <b>the soup</b>."],
    W => null,
    W => [["walk", "dt_vase"], ["pose", "bend", 400], ["pose", "drink", 1100], idle],
    ["smell the flowers", "smell the lovely flowers in the vase", "ngửi hoa"]),
  mk("change_vase_water", "vase", "Change the water in the vase", "Thay nước lọ hoa", "I'm changing the water in the vase.", "Tôi đang thay nước trong lọ hoa.", ["changing", "water", "vase"], v("change", "water", "vase", "fresh"),
    "<b>change the water</b> = thay nước. change → chang<b>ing</b> (bỏ e). <b>vase</b>: Anh-Anh /vɑːz/, Anh-Mỹ /veɪs/.", ["I'm changing the water", "in the vase."], ["vase", "face", "vast"],
    ["I'm changing <b>the sheets</b>.", "I'm changing <b>the light bulb</b>."],
    W => W.dt_vase === "fresh" ? "Nước trong lọ hoa vừa được thay rồi." : null,
    W => [["walk", "dt_vase"], ["spawn", "dt_jug"], ["pose", "pour", 1100], ["despawn"], ["set", "dt_vase", "fresh"], idle],
    ["change the water in the vase", "give the flowers some fresh water", "thay nước lọ hoa"]),
  mk("water_hanging_plant", "hangingplant", "Water the hanging plant", "Tưới chậu cây treo", "I'm watering the thirsty hanging plant.", "Tôi đang tưới chậu cây treo đang khát nước.", ["watering", "hanging", "plant"], v("water", "hanging", "thirsty"),
    "<b>water</b> là danh từ (nước) và cũng là động từ (tưới): <i>I water the plants every morning.</i>", ["I'm watering", "the thirsty hanging plant."], ["water", "waiter", "winter"],
    ["I'm watering <b>the flowers</b>.", "I'm watering <b>the garden</b>."],
    W => W.dt_hplant === "watered" ? "Chậu cây treo vừa được tưới rồi." : null,
    W => [["walk", "dt_hplant"], ["spawn", "dt_jug"], ["pose", "water", 1300], ["despawn"], ["set", "dt_hplant", "watered"], idle],
    ["water the hanging plant", "water the thirsty hanging plant", "tưới chậu cây treo"])
];
const otherActions = {
  kitchen: [
    mk("open_bread_box", "breadbox", "Open the bread box", "Mở hộp bánh mì", "I'm opening the bread box.", "Tôi đang mở hộp đựng bánh mì.", ["opening", "bread box"], v("open", "breadbox", "bread"),
      "<b>bread</b> là danh từ không đếm được: <b>some</b> bread, <b>a slice of</b> bread (một lát bánh mì).", ["I'm opening", "the bread box."], ["bread", "bred", "brad"],
      ["I'm opening <b>the cupboard</b>.", "I'm opening <b>the drawer</b>."],
      W => W.dt_bread === "open" ? "Hộp bánh mì đang mở rồi." : null,
      W => [["walk", "dt_breadbox"], ["pose", "reach", 600], ["set", "dt_bread", "open"], idle],
      ["open the bread box", "open the bread box", "mở hộp đựng bánh mì"]),
    mk("close_bread_box", "breadbox", "Close the bread box", "Đóng hộp bánh mì", "I'm closing the bread box to keep the bread fresh.", "Tôi đang đóng hộp bánh mì để giữ bánh tươi.", ["closing", "bread", "fresh"], v("close", "breadbox", "fresh"),
      "<b>to</b> + động từ = để làm gì: close it <b>to keep</b> the bread fresh.", ["I'm closing the bread box", "to keep the bread fresh."], ["fresh", "flesh", "French"],
      ["I'm closing the fridge <b>to keep the food cold</b>.", "I'm closing the window <b>to keep the room warm</b>."],
      W => W.dt_bread !== "open" ? "Hộp bánh mì đang đóng. Hãy mở hộp bánh mì trước (Open the bread box)." : null,
      W => [["walk", "dt_breadbox"], ["pose", "reach", 600], ["set", "dt_bread", "closed"], idle],
      ["close the bread box", "close the bread box to keep the bread fresh", "đóng hộp bánh mì"]),
    mk("recycle_bottle", "recyclingbin", "Recycle a plastic bottle", "Bỏ chai nhựa vào thùng tái chế", "I'm putting a plastic bottle in the recycling bin.", "Tôi đang bỏ chai nhựa vào thùng rác tái chế.", ["plastic bottle", "recycling bin"], v("recycle", "bottle", "plastic", "bin"),
      "<b>recycle</b> = tái chế (re- = lại + cycle = vòng). Tính từ đứng trước danh từ: a <b>plastic</b> bottle.", ["I'm putting a plastic bottle", "in the recycling bin."], ["bottle", "battle", "beetle"],
      ["I'm putting <b>a can</b> in the recycling bin.", "I'm putting <b>old paper</b> in the recycling bin."],
      W => null,
      W => [["walk", "dt_recycle"], ["spawn", "dt_bottle"], ["pose", "bend", 800], ["despawn"], idle],
      ["recycle a plastic bottle", "put an empty plastic bottle in the recycling bin", "bỏ chai nhựa vào thùng tái chế"])
  ],
  bedroom: [
    mk("turn_on_fairy_lights", "fairylights", "Turn on the fairy lights", "Bật dây đèn trang trí", "I'm turning on the fairy lights. The room is so cosy!", "Tôi đang bật dây đèn trang trí. Căn phòng thật ấm cúng!", ["turning", "fairy lights", "cosy"], v("turnon", "fairy", "cosy"),
      "<b>so</b> + tính từ = thật là…: <i>The room is <b>so</b> cosy!</i> (cosy: Anh-Anh, cozy: Anh-Mỹ)", ["I'm turning on the fairy lights.", "The room is so cosy!"], ["cosy", "copy", "cozy"],
      ["I'm turning on <b>the lamp</b>. The room is so <b>bright</b>!", "I'm turning on <b>the heater</b>. The room is so <b>warm</b>!"],
      W => W.dt_fairy === "on" ? "Dây đèn trang trí đang sáng rồi." : null,
      W => [["walk", "dt_fairy"], ["pose", "point", 600], ["set", "dt_fairy", "on"], ["wait", 300], idle],
      ["turn on the fairy lights", "turn on the twinkling fairy lights", "bật dây đèn trang trí"]),
    mk("turn_off_fairy_lights", "fairylights", "Turn off the fairy lights", "Tắt dây đèn trang trí", "I'm turning off the fairy lights before I sleep.", "Tôi đang tắt dây đèn trang trí trước khi ngủ.", ["turning", "off", "before", "sleep"], v("turnoff", "fairy"),
      "<b>before</b> + mệnh đề = trước khi: <i>before I sleep</i> (trước khi tôi ngủ).", ["I'm turning off the fairy lights", "before I sleep."], ["sleep", "slip", "sheep"],
      ["I'm brushing my teeth <b>before I sleep</b>.", "I'm washing my hands <b>before I eat</b>."],
      W => W.dt_fairy !== "on" ? "Dây đèn trang trí đang tắt. Hãy bật dây đèn trước (Turn on the fairy lights)." : null,
      W => [["walk", "dt_fairy"], ["pose", "point", 600], ["set", "dt_fairy", "off"], idle],
      ["turn off the fairy lights", "turn off the fairy lights before bed", "tắt dây đèn trang trí"])
  ],
  bathroom: [
    mk("squeeze_rubber_duck", "rubberduck", "Squeeze the rubber duck", "Bóp con vịt cao su", "I'm squeezing the rubber duck. It squeaks!", "Tôi đang bóp con vịt cao su. Nó kêu chít chít!", ["squeezing", "duck", "squeaks"], v("squeeze", "duck", "squeak"),
      "Hiện tại đơn ngôi thứ 3 thêm <b>-s</b>: it squeak<b>s</b>. Tiếng kêu con vật: duck → <b>quack</b>, toy → <b>squeak</b>.", ["I'm squeezing the rubber duck.", "It squeaks!"], ["duck", "dock", "dark"],
      ["I'm squeezing <b>the lemon</b>.", "I'm squeezing <b>the toothpaste</b>."],
      W => null,
      W => [["walk", "dt_duck"], ["pose", "reach", 400], ["set", "dt_duck", "squeak"], ["wait", 900], ["set", "dt_duck", "still"], idle],
      ["squeeze the rubber duck", "squeeze the funny rubber duck", "bóp con vịt cao su"])
  ],
  garage: [
    mk("check_fire_extinguisher", "extinguisher", "Check the fire extinguisher", "Kiểm tra bình chữa cháy", "I'm checking the fire extinguisher. The needle is in the green zone.", "Tôi đang kiểm tra bình chữa cháy. Kim chỉ ở vùng xanh.", ["checking", "fire extinguisher", "green"], v("check", "extinguisher", "gauge", "safety"),
      "An toàn trước hết: chỉ <b>check</b> (kiểm tra) đồng hồ áp suất — kim ở <b>green zone</b> là bình còn dùng được. Khi có cháy lớn: gọi <b>114</b>.", ["I'm checking the fire extinguisher.", "The needle is in the green zone."], ["check", "chick", "chalk"],
      ["I'm checking <b>the smoke alarm</b>.", "I'm checking <b>the first-aid box</b>."],
      W => W.dt_ext === "checked" ? "Bạn vừa kiểm tra bình chữa cháy rồi." : null,
      W => [["walk", "dt_ext"], ["pose", "bend", 500], ["pose", "point", 900], ["set", "dt_ext", "checked"], idle],
      ["check the fire extinguisher", "carefully check the fire extinguisher", "kiểm tra bình chữa cháy"])
  ],
  garden: [
    mk("fill_bird_bath", "birdbath", "Fill the bird bath", "Đổ nước vào bồn cho chim", "I'm filling the bird bath with fresh water.", "Tôi đang đổ nước sạch vào bồn tắm cho chim.", ["filling", "bird bath", "fresh water"], v("fill", "birdbath", "fresh", "birds"),
      "<b>fill … with …</b> = đổ đầy … bằng …: fill the glass <b>with</b> milk.", ["I'm filling the bird bath", "with fresh water."], ["fill", "feel", "full"],
      ["I'm filling <b>the bottle</b> with water.", "I'm filling <b>the bowl</b> with rice."],
      W => W.dt_birdbath === "full" ? "Bồn nước cho chim đã đầy rồi." : null,
      W => [["walk", "dt_birdbath"], ["spawn", "dt_jug"], ["pose", "pour", 1200], ["despawn"], ["set", "dt_birdbath", "full"], idle],
      ["fill the bird bath", "fill the bird bath with fresh water", "đổ nước vào bồn cho chim"])
  ]
};

/* ---------------- click overlays (+ small state visuals) ---------------- */
const ov = (id, en, vi, base, tag, rects, fx) => `<g class="obj dt-obj" id="o-${id}" data-obj="${id}" data-base="${base}" tabindex="0" aria-label="${en}, ${vi}"><g class="vec">${fx || ""}${rects.map(r => `<rect class="hit" x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}"/>`).join("")}</g><text class="tag" x="${tag[0]}" y="${tag[1]}" text-anchor="middle">${en} · ${vi}</text></g>`;
const LIV_OVERLAYS = [
  ov("wallclock", "wall clock", "đồng hồ treo tường", 20, [240, 86], [[214, 24, 52, 52]]),
  ov("wallpicture", "picture", "bức tranh", 20, [235, 176], [[184, 84, 102, 82]]),
  ov("ceilinglight", "ceiling light", "đèn trần", 20, [540, 64], [[512, 0, 56, 50], [178, 228, 22, 28]],
    `<g class="dt-fx dt-ceilfx"><ellipse cx="540" cy="70" rx="160" ry="60" fill="#fff3c8" opacity=".35"/><polygon points="500,40 580,40 720,320 360,320" fill="#fff6d8" opacity=".14"/></g>`),
  ov("aircon", "air conditioner", "máy điều hoà", 20, [660, 70], [[608, 12, 104, 44]],
    `<g class="dt-fx dt-acfx" stroke="#9fd6f2" stroke-width="3" fill="none" stroke-linecap="round"><path class="w1" d="M630 56 q8 10 0 20"/><path class="w2" d="M660 56 q8 10 0 20"/><path class="w3" d="M690 56 q8 10 0 20"/></g>`),
  ov("photoframe", "photo frame", "khung ảnh", 20, [333, 132], [[302, 136, 62, 32]],
    `<g class="dt-fx dt-dustfx" fill="#9a8a78" opacity=".7"><circle cx="312" cy="144" r="1.6"/><circle cx="326" cy="150" r="1.4"/><circle cx="345" cy="152" r="1.6"/><circle cx="355" cy="160" r="1.3"/><circle cx="318" cy="161" r="1.2"/></g>`),
  ov("shelfcandle", "candle", "cây nến", 20, [401, 132], [[392, 138, 18, 30]],
    `<g class="dt-fx dt-candlefx"><circle cx="400.5" cy="146" r="12" fill="#ffe7a0" opacity=".45"/></g>`),
  ov("bookshelf", "bookshelf", "giá sách", 20, [60, 90], [[14, 100, 90, 270]],
    `<g class="dt-fx dt-messyfx"><polygon points="70,256 96,236 98,242 72,262" fill="#8a6bb3"/><polygon points="40,356 62,340 64,346 42,362" fill="#e8743b"/></g>`),
  ov("globe", "globe", "quả địa cầu", 30, [80, 380], [[64, 384, 32, 34]]),
  ov("jacket", "jacket", "áo khoác", 20, [150, 140], [[124, 144, 56, 92]]),
  ov("livrug", "rug", "tấm thảm", 25, [300, 486], [[250, 452, 100, 136], [670, 452, 100, 136], [350, 528, 320, 60]],
    `<g class="dt-fx dt-rugfx" fill="#a0703a" opacity=".75"><circle cx="300" cy="530" r="2.4"/><circle cx="330" cy="545" r="2"/><circle cx="420" cy="560" r="2.6"/><circle cx="600" cy="565" r="2.2"/><circle cx="700" cy="530" r="2.5"/><circle cx="720" cy="545" r="1.8"/><circle cx="520" cy="572" r="2"/></g>`),
  ov("livslippers", "slippers", "dép đi trong nhà", 30, [122, 618], [[96, 622, 50, 18]]),
  ov("umbrella", "umbrella", "cái ô", 30, [30, 532], [[12, 538, 38, 92]]),
  ov("vase", "vase", "lọ hoa", 30, [852, 470], [[836, 478, 36, 60]],
    `<g class="dt-fx dt-vasefx"><path d="M848 528 L860 528 L861 535 L847 535Z" fill="#7a9a3a" opacity=".7"/></g>`),
  ov("hangingplant", "hanging plant", "chậu cây treo", 20, [948, 104], [[956, 30, 40, 64]])
].join("");
const OTHER_OVERLAYS = {
  kitchen: ov("breadbox", "bread box", "hộp đựng bánh mì", 250, [894, 196], [[866, 200, 56, 50]],
      `<g class="dt-fx dt-breadfx"><path d="M874 222 Q894 196 914 222" fill="#78bdb8" stroke="#4f9590" stroke-width="2"/><ellipse cx="894" cy="214" rx="14" ry="7" fill="#e0a95a"/><path d="M886 211 l3 4 M893 209 l3 4 M900 211 l3 4" stroke="#b9853f" stroke-width="1.5"/></g>`)
    + ov("recyclingbin", "recycling bin", "thùng rác tái chế", 470, [102, 414], [[74, 420, 56, 68]]),
  bedroom: ov("fairylights", "fairy lights", "dây đèn trang trí", 120, [272, 214], [[132, 160, 282, 42]],
    `<g class="dt-fx dt-fairyfx"><path d="M136 166 Q205 196 272 172 Q340 196 410 166" stroke="#ffd970" stroke-width="10" opacity=".25" fill="none"/></g>`),
  bathroom: ov("rubberduck", "rubber duck", "vịt cao su", 250, [382, 226], [[366, 230, 30, 26]],
    `<g class="dt-fx dt-duckfx"><text x="398" y="232" font-size="11" font-weight="700" fill="#e8743b">squeak!</text></g>`),
  garage: ov("extinguisher", "fire extinguisher", "bình chữa cháy", 290, [706, 220], [[692, 222, 28, 62]],
    `<g class="dt-fx dt-extfx"><circle cx="726" cy="236" r="7" fill="#3a9d5d"/><path d="M722 236 l3 3 l5 -6" stroke="#fff" stroke-width="2" fill="none"/></g>`),
  garden: ov("birdbath", "bird bath", "bồn nước cho chim", 480, [978, 418], [[954, 420, 48, 54]],
    `<g class="dt-fx dt-bbfx"><ellipse cx="978" cy="433" rx="15" ry="3.5" fill="#9fd6f2"/><path d="M970 432 h6" stroke="#fff" stroke-width="1.5"/></g>`)
};

/* ---------------- CSS (driven by data-dt_* on #room) ---------------- */
const CSS = `
#room .dt-obj .hit{fill:transparent;cursor:pointer}
#room .dt-fx{pointer-events:none;opacity:0;transition:opacity .4s}
#room [data-detail="picture-landscape"]{transform-box:fill-box;transform-origin:50% 0;transition:transform .5s}
#room[data-dt_pic="crooked"] [data-detail="picture-landscape"]{transform:rotate(-6deg)}
#room[data-dt_ceil="on"] .dt-ceilfx{opacity:1}#room[data-dt_ceil="on"] .ceilglow{opacity:.9}
#room[data-dt_ac="on"] .dt-acfx{opacity:1}#room[data-dt_ac="on"] .dt-acfx path{animation:dtWind 1.4s ease-in-out infinite}
#room .dt-acfx .w2{animation-delay:.3s!important}#room .dt-acfx .w3{animation-delay:.6s!important}
#room[data-dt_frame="dusty"] .dt-dustfx{opacity:1}
#room[data-dt_candle="off"] [data-detail="shelf-candle"] path{opacity:0}
#room[data-dt_candle="on"] [data-detail="shelf-candle"] path{animation:dtFlicker .9s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
#room[data-dt_candle="on"] .dt-candlefx{opacity:1}
#room[data-dt_shelf="messy"] .dt-messyfx{opacity:1}
#room [data-detail="bookshelf-globe"] circle,#room [data-detail="bookshelf-globe"] path{transform-box:fill-box;transform-origin:50% 50%}
#room[data-dt_globe="spin"] [data-detail="bookshelf-globe"] path{animation:dtSpinX .35s linear infinite}
#room[data-dt_jacket="on"] [data-detail="jacket"]{opacity:0;transition:opacity .4s}
#room[data-dt_jacket="on"] #char #upper>rect[fill="#f0a63c"],#room[data-dt_jacket="on"] #char #upper>rect[fill="#e39a3a"],#room[data-dt_jacket="on"] #char #arm>rect{fill:#c75b4a}
#room[data-dt_rug="dirty"] .dt-rugfx{opacity:1}
#room[data-dt_slippers="on"] [data-detail="slippers"]{opacity:0}
#room [data-detail="slippers"],#room [data-detail="umbrellas"]{transition:opacity .4s}
#room[data-dt_umbrella="hand"] [data-detail="umbrellas"]{opacity:.15}
#room[data-dt_vase="stale"] .dt-vasefx{opacity:1}
#room[data-dt_vase="stale"] [data-detail="vase-flowers"] circle{filter:saturate(.45)}
#room [data-detail="hanging-plant"] path{transition:stroke .6s}
#room[data-dt_hplant="thirsty"] [data-detail="hanging-plant"] path[stroke]{stroke:#b5a85a}
#room[data-dt_bread="open"] .dt-breadfx{opacity:1}
#room [data-detail="string-lights"]{transition:filter .5s}
#room[data-dt_fairy="off"] [data-detail="string-lights"]{filter:grayscale(.7) brightness(.85)}
#room[data-dt_fairy="on"] [data-detail="string-lights"]{filter:drop-shadow(0 0 4px #ffd970) brightness(1.25)}
#room[data-dt_fairy="on"] .dt-fairyfx{opacity:1}
#room [data-detail="rubber-duck"]{transform-box:fill-box;transform-origin:50% 100%}
#room[data-dt_duck="squeak"] [data-detail="rubber-duck"]{animation:dtSquish .3s ease-in-out infinite}
#room[data-dt_duck="squeak"] .dt-duckfx{opacity:1}
#room[data-dt_ext="checked"] .dt-extfx{opacity:1}
#room[data-dt_birdbath="full"] .dt-bbfx{opacity:1}
@keyframes dtWind{50%{transform:translateY(5px);opacity:.35}}
@keyframes dtFlicker{50%{transform:scale(.85,1.12)}}
@keyframes dtSpinX{to{transform:translateX(-6px)}}
@keyframes dtSquish{50%{transform:scale(1.15,.8)}}
@media (prefers-reduced-motion: reduce){#room .dt-acfx path,#room [data-detail]{animation:none!important}}
`;

/* ---------------- register ---------------- */
ROOMS.living_details = {
  id: "living", name: "Living room", nameVi: "Phòng khách",
  W0: LIV_W0, spots: LIV_SPOTS,
  obstacles: [{ x1: 350, x2: 670, y1: 420, y2: 528 }, { x1: 434, x2: 646, y1: 330, y2: 400 }], // = TABLE_BOX, SOFA_BOX (keeps living obstacles intact)
  objects: LIV_OBJ, actions: livingActions, props: PROPS, css: CSS, catalog: []
};
for (const [rid, objs] of Object.entries(OTHER_OBJ)) {
  const r = ROOMS[rid];
  if (!r) { console.warn("details.js: room missing", rid); continue; }
  Object.assign(r.objects, objs);
  r.actions = r.actions.concat(otherActions[rid]);
  Object.assign(r.W0, OTHER_W0[rid]);
  r.spots = Object.assign(r.spots || {}, OTHER_SPOTS[rid]);
  r.props = Object.assign(r.props || {}, PROPS);
  if (Array.isArray(r.worldSvg)) r.worldSvg.push(OTHER_OVERLAYS[rid]); else r.worldSvg = (r.worldSvg || "") + OTHER_OVERLAYS[rid];
}
const ALL_W0 = Object.assign({}, LIV_W0, ...Object.values(OTHER_W0));

/* living overlays into the static #world (bound by the app's querySelectorAll(".obj").forEach(bindObj)) */
const SVGNS = "http://www.w3.org/2000/svg";
const world = document.getElementById("world");
if (world) {
  const g = document.createElementNS(SVGNS, "g");
  g.innerHTML = LIV_OVERLAYS;
  [...g.children].forEach(e => { e.dataset.room = "living"; world.insertBefore(e, world.firstChild); });
}

/* mirror dt_* state onto #room (cheap poll; works in every room) */
const room = document.getElementById("room");
let last = "";
function mirror() {
  const E = window.ELW; if (!room || !E || !E.state) return;
  const W = E.state(); if (!W) return;
  let sig = "";
  for (const k of Object.keys(ALL_W0)) sig += (W[k] === undefined ? ALL_W0[k] : W[k]) + "|";
  if (sig === last) return; last = sig;
  for (const k of Object.keys(ALL_W0)) room.setAttribute("data-" + k, String(W[k] === undefined ? ALL_W0[k] : W[k]));
}
for (const k of Object.keys(ALL_W0)) room && room.setAttribute("data-" + k, ALL_W0[k]);
setInterval(mirror, 120);
window.ELW_DETAILS = { objects: Object.assign({}, LIV_OBJ, ...Object.values(OTHER_OBJ)), actionIds: [...livingActions, ...Object.values(otherActions).flat()].map(a => a.id), W0: ALL_W0 };
})();
