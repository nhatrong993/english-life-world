/* ELW_DAY — "A whole day in English": simulated clock, lighting, weather, daily quests, XP, diary.
   Browser: window.ELW_DAY. Node: module.exports. No dependencies. */
(function (root) {
"use strict";
const KEY = "elw_day_v1";
const START = 6 * 60; // clock 0 = 06:00
const NS = "http://www.w3.org/2000/svg";

/* ---------- durations (minutes) ---------- */
const DUR = {
  make_bed: 3, cook_rice: 25, wash_rice: 5, watch_tv: 30, boil_water: 5, fill_kettle: 1, make_coffee: 5, drink_coffee: 10,
  eat_breakfast: 20, fry_egg: 6, toast_bread: 4, heat_up_food: 3, wash_dishes: 12, sweep_floor: 10, sweep_under_table: 4,
  wipe_table: 3, water_plant: 3, read_in_bed: 20, read_on_sofa: 25, listen_to_music: 15, play_with_cat: 10, brush_cat: 6,
  feed_cat: 2, take_out_trash: 4, brush_hair: 3, lie_on_sofa: 15, set_the_table: 3, clear_the_table: 4, dry_plates: 5,
  serve_rice: 2, check_phone: 5, look_out_window: 2, hang_up_shirt: 2, empty_basket: 4, drink_from_cup: 3
};
const CAT = [[/^go_/, 1], [/^(turn_on|turn_off|open|close|pick_up|put|take|get_|sit|push|pull|set_alarm|unplug|charge|call)/, 1], [/./, 2]];
const SLEEP_IDS = ["lie_down"];
function duration(id) { if (id in DUR) return DUR[id]; for (const [re, m] of CAT) if (re.test(id)) return m; return 2; }

/* ---------- phases ---------- */
const PHASES = [ // [name, startHour] in absolute 24h clock
  ["dawn", 5], ["morning", 7], ["noon", 11], ["afternoon", 13.5], ["evening", 17.5], ["night", 20]
];
const PHASE_VI = { dawn: "Bình minh", morning: "Buổi sáng", noon: "Buổi trưa", afternoon: "Buổi chiều", evening: "Chiều tối", night: "Ban đêm" };
const PHASE_ICON = { dawn: "🌅", morning: "☀️", noon: "🌞", afternoon: "🌤️", evening: "🌇", night: "🌙" };
function phaseOfHour(h) { h = ((h % 24) + 24) % 24; if (h < 5) return "night"; let p = "night"; for (const [n, s] of PHASES) if (h >= s) p = n; return p; }
function clockOf(minutes) { const t = START + minutes; const h = Math.floor(t / 60) % 24, m = t % 60; return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function hourOf(minutes) { return ((START + minutes) / 60) % 24; }
/* flow.js time bucket (morning/noon/evening/night) for routine suggestions */
function flowBucket(phase) { return { dawn: "morning", morning: "morning", noon: "noon", afternoon: "noon", evening: "evening", night: "night" }[phase]; }

/* ---------- weather ---------- */
const WEATHERS = ["sunny", "cloudy", "rainy"];
const WEATHER_UI = { sunny: ["☀️", "Nắng"], cloudy: ["☁️", "Nhiều mây"], rainy: ["🌧️", "Mưa"] };
function rngFor(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function weatherFor(day, seed) { const r = rngFor(day * 97 + (seed || 0))(); return r < .45 ? "sunny" : r < .75 ? "cloudy" : "rainy"; }

/* ---------- ambient sentences ---------- */
const AMB = {
  dawn: { any: [["The sun is coming up.", "Mặt trời đang mọc."], ["It's still a little dark outside.", "Bên ngoài trời vẫn còn hơi tối."]],
    rainy: [["It's drizzling this early morning.", "Sáng sớm trời mưa phùn."]], cloudy: [["The sky is grey this morning.", "Sáng nay trời xám xịt."]] },
  morning: { sunny: [["It's a bright, sunny morning.", "Một buổi sáng nắng đẹp."], ["The sunlight is coming through the window.", "Ánh nắng chiếu qua cửa sổ."]],
    cloudy: [["It's a bit cloudy this morning.", "Sáng nay trời hơi nhiều mây."]], rainy: [["It's raining this morning.", "Sáng nay trời mưa."], ["I can hear the rain on the window.", "Tôi nghe tiếng mưa rơi trên cửa sổ."]] },
  noon: { sunny: [["It's really hot at noon.", "Buổi trưa trời rất nóng."], ["The sun is high in the sky.", "Mặt trời lên cao."]],
    cloudy: [["It's cool and cloudy today.", "Hôm nay trời mát và nhiều mây."]], rainy: [["It's pouring outside.", "Bên ngoài trời mưa như trút."]] },
  afternoon: { sunny: [["It's a warm, lazy afternoon.", "Một buổi chiều ấm áp, lười biếng."]], cloudy: [["The clouds are getting thicker.", "Mây đang dày hơn."]],
    rainy: [["It's still raining this afternoon.", "Chiều nay trời vẫn mưa."]] },
  evening: { any: [["It's getting dark.", "Trời đang tối dần."], ["The sun is going down.", "Mặt trời đang lặn."]],
    rainy: [["It's a wet, rainy evening.", "Một buổi tối ẩm ướt, mưa rơi."]] },
  night: { any: [["It's late. Time to relax.", "Muộn rồi. Đến lúc thư giãn."], ["It's dark and quiet outside.", "Bên ngoài tối và yên tĩnh."]],
    sunny: [["The stars are out tonight.", "Tối nay trời có sao."]], rainy: [["The rain is tapping on the window.", "Mưa gõ lách tách trên cửa sổ."]] }
};
function ambient_en(phase, W, rnd) {
  const wx = (W && W.weather) || (api.state && api.state.weather) || "sunny";
  const t = AMB[phase] || AMB.morning;
  const pool = (t[wx] || []).concat(t.any || []);
  const pick = pool[Math.floor((rnd || Math.random)() * pool.length)] || ["Good day!", "Chúc một ngày tốt lành!"];
  return { en: pick[0], vi: pick[1], phase, weather: wx };
}

/* ---------- quests ---------- */
// goal: {type:"doActions", ids?:[], anyOf?:[], all?:[], count} | {type:"speak",count} | listen | roleplay | {type:"useWords", list:[]}
const Q = (id, time, level, en, vi, goals, xp) => ({ id, time, level, en, vi, goals, xp: xp || 30 });
const QUESTS = [
  Q("breakfast_en", ["dawn", "morning"], 2, "Prepare breakfast without using Vietnamese", "Chuẩn bị bữa sáng mà không dùng tiếng Việt",
    [{ type: "doActions", anyOf: ["fill_kettle", "boil_water", "make_coffee", "pour_coffee", "toast_bread", "take_out_toast", "fry_egg", "turn_on_stove", "turn_off_stove", "set_the_table", "eat_breakfast", "open_fridge", "take_milk", "pour_milk"], all: ["boil_water", "make_coffee"], count: 5 },
     { type: "listen", count: 3 }, { type: "speak", count: 2 }], 60),
  Q("wake_up", ["dawn", "morning"], 1, "Wake up and start the day", "Thức dậy và bắt đầu ngày mới",
    [{ type: "doActions", anyOf: ["turn_off_alarm", "get_out_of_bed", "open_curtains", "make_bed", "put_on_slippers", "brush_hair"], count: 4 }], 30),
  Q("make_bed_q", ["dawn", "morning"], 1, "Make your bed neatly", "Dọn giường gọn gàng",
    [{ type: "doActions", ids: ["make_bed", "fluff_pillow", "fold_blanket"], count: 2 }, { type: "speak", count: 1 }], 25),
  Q("coffee_talk", ["morning", "noon"], 2, "Coffee time: say it out loud", "Giờ cà phê: nói thành tiếng",
    [{ type: "doActions", ids: ["make_coffee", "pour_coffee", "drink_coffee"], count: 3 }, { type: "useWords", list: ["coffee", "hot", "cup"] }], 40),
  Q("cat_care", ["morning", "noon", "afternoon", "evening"], 1, "Take care of the cat", "Chăm sóc con mèo",
    [{ type: "doActions", anyOf: ["call_cat", "pet_cat", "feed_cat", "give_cat_water", "brush_cat", "play_with_cat"], all: ["feed_cat"], count: 3 }, { type: "speak", count: 1 }], 35),
  Q("tidy_living", ["noon", "afternoon"], 1, "Tidy the living room", "Dọn phòng khách",
    [{ type: "doActions", anyOf: ["wipe_table", "sweep_floor", "sweep_under_table", "fluff_cushion", "fold_throw", "water_plant", "put_book_on_table", "open_window"], count: 4 }], 35),
  Q("lunch_rice", ["noon"], 2, "Cook rice for lunch", "Nấu cơm trưa",
    [{ type: "doActions", ids: ["wash_rice", "cook_rice", "serve_rice"], count: 3 }, { type: "listen", count: 2 }], 40),
  Q("wash_up", ["noon", "afternoon", "evening"], 1, "Wash up after the meal", "Rửa bát sau bữa ăn",
    [{ type: "doActions", anyOf: ["turn_on_faucet", "wash_dishes", "put_dishes_in_rack", "dry_plates", "put_plates_away", "turn_off_faucet"], count: 4 }], 35),
  Q("plants", ["morning", "afternoon"], 1, "Water the plants and open the window", "Tưới cây và mở cửa sổ",
    [{ type: "doActions", ids: ["water_plant", "open_window", "open_living_curtains"], count: 2 }, { type: "useWords", list: ["plant", "window"] }], 25),
  Q("laundry", ["noon", "afternoon"], 2, "Sort out the laundry", "Xử lý đồ giặt",
    [{ type: "doActions", anyOf: ["pick_up_clothes", "empty_basket", "open_wardrobe", "hang_up_shirt", "take_out_shirt", "close_wardrobe"], count: 4 }, { type: "roleplay", count: 1 }], 45),
  Q("chat_friend", ["afternoon", "evening"], 2, "Have a short conversation in English", "Trò chuyện ngắn bằng tiếng Anh",
    [{ type: "roleplay", count: 2 }, { type: "speak", count: 3 }], 50),
  Q("listen_lot", ["morning", "noon", "afternoon", "evening"], 1, "Train your ears", "Luyện tai nghe",
    [{ type: "listen", count: 5 }], 20),
  Q("relax_tv", ["evening"], 1, "Relax in the evening", "Thư giãn buổi tối",
    [{ type: "doActions", anyOf: ["sit_on_sofa", "pick_up_remote", "turn_on_tv", "watch_tv", "listen_to_music", "turn_on_floor_lamp", "lie_on_sofa"], count: 3 }, { type: "useWords", list: ["relax", "tired"] }], 30),
  Q("close_house", ["evening", "night"], 1, "Close up the house for the night", "Đóng cửa nhà cho buổi tối",
    [{ type: "doActions", anyOf: ["close_window", "close_living_curtains", "close_curtains", "turn_off_tv", "turn_off_fan", "turn_off_floor_lamp", "take_out_trash"], count: 3 }], 30),
  Q("bedtime", ["evening", "night"], 1, "Get ready for bed", "Chuẩn bị đi ngủ",
    [{ type: "doActions", anyOf: ["go_bedroom", "charge_phone", "set_alarm", "brush_hair", "turn_on_lamp", "read_in_bed", "turn_off_lamp", "take_off_slippers", "sit_on_bed"], all: ["set_alarm"], count: 4 }, { type: "speak", count: 1 }], 40),
  Q("describe_day", ["evening", "night"], 3, "Describe your day using past tense", "Kể lại ngày hôm nay bằng thì quá khứ",
    [{ type: "speak", count: 3 }, { type: "useWords", list: ["today", "then", "after"] }], 60),
  Q("weather_talk", ["dawn", "morning", "noon", "afternoon"], 2, "Talk about the weather", "Nói về thời tiết",
    [{ type: "doActions", ids: ["look_out_window", "open_window", "open_curtains", "open_living_curtains"], count: 1 }, { type: "useWords", list: ["weather", "today"] }], 30),
  Q("phone_free", ["afternoon", "evening"], 3, "Read for a while instead of the phone", "Đọc sách thay vì xem điện thoại",
    [{ type: "doActions", ids: ["read_on_sofa", "read_in_bed", "pick_up_book"], count: 2 }, { type: "speak", count: 2 }, { type: "listen", count: 2 }], 45)
];
const QBY = Object.fromEntries(QUESTS.map(q => [q.id, q]));

/* ---------- XP / levels ---------- */
const UNLOCKS = { 2: "Mở khoá: nhiệm vụ cấp 2 🍳", 3: "Mở khoá: nhiệm vụ cấp 3 & nhật ký nâng cao ✍️", 4: "Mở khoá: huy hiệu “Early bird” 🐦", 5: "Mở khoá: chế độ thử thách 🔥" };
function xpForLevel(l) { return 50 * l * (l - 1); } // total xp to reach level l: 0,100,300,600...
function levelOf(xp) { let l = 1; while (xp >= xpForLevel(l + 1)) l++; return l; }

/* ---------- state + persistence ---------- */
function fresh() { return { v: 1, minutes: 0, day: 1, weather: weatherFor(1), xp: 0, quests: [], diaries: [], log: [], ended: false }; }
function storage() { try { return root && root.localStorage ? root.localStorage : (typeof localStorage !== "undefined" ? localStorage : null); } catch (e) { return null; } }
function load() { try { const s = storage(); const raw = s && s.getItem(KEY); if (raw) { const o = JSON.parse(raw); if (o && o.v === 1) return Object.assign(fresh(), o); } } catch (e) { } return fresh(); }
function save() { try { const s = storage(); s && s.setItem(KEY, JSON.stringify(api.state)); } catch (e) { } emit(); }

const listeners = [];
function emit() { listeners.forEach(f => { try { f(api.state); } catch (e) { } }); }

function phase() { return phaseOfHour(hourOf(api.state.minutes)); }

function pickQuests(day, level, n, seed) {
  n = n || 3; const rnd = rngFor(day * 31 + (seed || 7));
  const ok = QUESTS.filter(q => q.level <= Math.max(1, level));
  const buckets = [["dawn", "morning"], ["noon", "afternoon"], ["evening", "night"]];
  const out = [];
  buckets.forEach(b => { const c = ok.filter(q => q.time.some(t => b.includes(t)) && !out.includes(q.id)); if (c.length) out.push(c[Math.floor(rnd() * c.length)].id); });
  while (out.length < n) { const c = ok.filter(q => !out.includes(q.id)); if (!c.length) break; out.push(c[Math.floor(rnd() * c.length)].id); }
  return out.slice(0, n).map(id => ({ id, progress: QBY[id].goals.map(() => ({ n: 0, done: [] })), claimed: false }));
}

function goalDone(g, p) {
  if (g.type === "doActions") return p.n >= g.count && (!g.all || g.all.every(x => p.done.includes(x)));
  if (g.type === "useWords") return g.list.every(w => p.done.includes(w));
  return p.n >= g.count;
}
function goalFrac(g, p) {
  if (g.type === "useWords") return p.done.length / g.list.length;
  if (g.type === "doActions") { const need = g.count + (g.all ? g.all.filter(x => !(g.anyOf || g.ids || []).includes(x)).length : 0); const allMissing = g.all ? g.all.filter(x => !p.done.includes(x)).length : 0; return Math.min(1, Math.min(p.n, g.count) / g.count) * (allMissing ? .9 : 1) * (need ? 1 : 1); }
  return Math.min(1, p.n / g.count);
}
function questComplete(qs) { const q = QBY[qs.id]; return !!q && q.goals.every((g, i) => goalDone(g, qs.progress[i])); }
function goalLabel(g, p) {
  const prog = g.type === "useWords" ? p.done.length + "/" + g.list.length : Math.min(p.n, g.count) + "/" + g.count;
  const txt = { doActions: "Làm " + g.count + " hành động" + (g.all ? " (gồm " + g.all.join(", ") + ")" : ""), speak: "Nói " + g.count + " câu", listen: "Nghe " + g.count + " lần", roleplay: "Hội thoại " + g.count + " lượt", useWords: "Dùng từ: " + (g.list || []).join(", ") }[g.type];
  return txt + " · " + prog;
}

function bump(type, val) {
  const st = api.state; let changed = false;
  st.quests.forEach(qs => {
    if (qs.claimed) return; const q = QBY[qs.id]; if (!q) return;
    q.goals.forEach((g, i) => {
      const p = qs.progress[i]; if (g.type !== type) return;
      if (type === "doActions") {
        const pool = g.ids || g.anyOf || []; if (!pool.includes(val) && !(g.all || []).includes(val)) return;
        if (!p.done.includes(val)) { p.done.push(val); p.n++; changed = true; }
      } else if (type === "useWords") {
        const words = String(val || "").toLowerCase().match(/[a-z']+/g) || [];
        g.list.forEach(w => { if (!p.done.includes(w) && words.some(x => x === w || x.startsWith(w))) { p.done.push(w); changed = true; } });
      } else { p.n++; changed = true; }
    });
  });
  return changed;
}

/* ---------- hooks ---------- */
function advance(min) { api.state.minutes += min; if (START + api.state.minutes >= 24 * 60 + 5 * 60) api.state.minutes = 23 * 60 - START; }
function onAction(id, opts) {
  const st = api.state; if (!id) return null;
  st.log.push({ id, t: st.minutes }); if (st.log.length > 200) st.log.shift();
  const h = hourOf(st.minutes);
  const sleeping = SLEEP_IDS.includes(id) && (h >= 20 || h < 5);
  advance(duration(id)); bump("doActions", id);
  let res = { minutes: st.minutes, phase: phase(), sleep: sleeping };
  save();
  if (sleeping && !(opts && opts.noAutoEnd)) res.endOfDay = true;
  return res;
}
function onSpeak(text) { bump("speak"); if (text) bump("useWords", text); save(); }
function onListen() { bump("listen"); save(); }
function onRoleplay(text) { bump("roleplay"); if (text) bump("useWords", text); save(); }

function addXp(n) {
  const st = api.state; const before = levelOf(st.xp); st.xp += n; const after = levelOf(st.xp);
  const out = { xp: st.xp, gained: n, level: after, levelUp: after > before, unlock: null };
  if (out.levelUp) out.unlock = UNLOCKS[after] || ("Lên cấp " + after + "! 🎉");
  save(); return out;
}
function claim(qid) {
  const qs = api.state.quests.find(q => q.id === qid);
  if (!qs || qs.claimed || !questComplete(qs)) return null;
  qs.claimed = true; return addXp(QBY[qid].xp);
}

function startDay(opts) {
  const st = api.state; opts = opts || {};
  if (st.ended || opts.next) { st.day++; }
  st.minutes = opts.minutes || 0; st.ended = false; st.log = [];
  st.weather = opts.weather || weatherFor(st.day, opts.seed);
  st.quests = pickQuests(st.day, levelOf(st.xp), 3, opts.seed);
  save(); return st;
}

/* ---------- diary ---------- */
function endOfDay(items, buildFn) {
  const st = api.state;
  const done = (items || []).filter(it => !it.status || it.status === "done");
  let built = null;
  try { built = buildFn ? buildFn(done) : null; } catch (e) { built = null; }
  let en = "", vi = "";
  if (built && typeof built === "object") { en = built.en || ""; vi = built.vi || ""; }
  else if (typeof built === "string") en = built;
  const wx = { sunny: ["It was a sunny day.", "Hôm nay trời nắng."], cloudy: ["It was a cloudy day.", "Hôm nay trời nhiều mây."], rainy: ["It rained today.", "Hôm nay trời mưa."] }[st.weather] || ["", ""];
  if (!en) { en = done.length ? "Today I was busy at home." : "Today was a quiet day."; vi = done.length ? "Hôm nay tôi bận rộn ở nhà." : "Hôm nay là một ngày yên tĩnh."; }
  const entry = { title: "Day " + st.day + " — My diary", en: (wx[0] + " " + en).trim(), vi: (wx[1] + " " + vi).trim(), date: new Date().toISOString().slice(0, 10), day: st.day, saved: false };
  st.ended = true; st.pending = entry; save();
  return entry;
}
function saveDiary(entry) { const st = api.state; entry = Object.assign({}, entry, { saved: true }); st.diaries.unshift(entry); st.diaries = st.diaries.slice(0, 60); delete st.pending; save(); return entry; }

/* ---------- lighting ---------- */
const LIGHT = { // overlay color, overlay opacity, blend, sky color, sky opacity
  dawn: ["#ffb98a", .12, "soft-light", "#ffc7a1", .65],
  morning: ["#fff8e6", .04, "soft-light", "#bfe3ff", 0],
  noon: ["#fffbe8", .03, "soft-light", "#a6dbff", .2],
  afternoon: ["#ffe4b5", .07, "soft-light", "#ffe0a8", .35],
  evening: ["#ff9e6d", .14, "soft-light", "#f08a5a", .65],
  night: ["#283b7a", .24, "multiply", "#16204a", .88]
};
function el(tag, attrs, parent) { const e = (parent && parent.ownerDocument || root.document).createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function findWindows(svg) {
  const out = []; const sb = svg.getBoundingClientRect(); const vb = svg.viewBox && svg.viewBox.baseVal;
  const sx = vb && vb.width ? vb.width / sb.width : 1, sy = vb && vb.height ? vb.height / sb.height : 1;
  svg.querySelectorAll('rect[fill="#bfe3ff"]').forEach(r => {
    if (r.closest("#dayFx")) return; const b = r.getBoundingClientRect(); if (!b.width || !b.height) return;
    if (getComputedStyle(r).display === "none" || r.closest('[style*="display: none"],[display="none"]')) return;
    out.push({ x: (b.left - sb.left) * sx, y: (b.top - sb.top) * sy, w: b.width * sx, h: b.height * sy });
  });
  return out;
}
function applyLighting(svg, ph, opts) {
  if (!svg) return null; opts = opts || {};
  ph = ph || phase(); const wx = opts.weather || api.state.weather; const L = LIGHT[ph] || LIGHT.morning;
  const reduce = !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
  let g = svg.querySelector("#dayFx");
  if (!g) { g = el("g", { id: "dayFx", "pointer-events": "none", "aria-hidden": "true" }); g.style.pointerEvents = "none"; svg.appendChild(g); }
  else svg.appendChild(g); // keep on top
  while (g.firstChild) g.removeChild(g.firstChild);
  const tr = reduce ? "none" : "opacity 1.2s ease, fill 1.2s ease";
  // sky in windows
  const wins = findWindows(svg);
  wins.forEach((w, i) => {
    const cid = "dayClip" + i; const cp = el("clipPath", { id: cid }, g); el("rect", { x: w.x, y: w.y, width: w.w, height: w.h, rx: 6 }, cp);
    const wg = el("g", { "clip-path": "url(#" + cid + ")" }, g);
    const sky = wx === "rainy" ? (ph === "night" ? "#24355c" : "#8fb8de") : wx === "cloudy" && ph !== "night" ? "#c8d8e8" : L[3];
    const skyOp = wx === "sunny" ? L[4] : Math.max(L[4], .65);
    const s = el("rect", { x: w.x, y: w.y, width: w.w, height: w.h, fill: sky, "fill-opacity": skyOp }, wg); s.style.transition = tr;
    const cx = w.x + w.w * .72, cy = w.y + w.h * .25;
    if (ph === "night") {
      if (wx !== "rainy") { const r = rngFor(i + 3); for (let k = 0; k < 9; k++) el("circle", { cx: w.x + r() * w.w, cy: w.y + r() * w.h * .55, r: .8 + r() * 1.3, fill: "#fffbe0", class: "day-star" }, wg); }
      if (wx !== "rainy") { el("circle", { cx, cy, r: 11, fill: "#f4f1d0" }, wg); el("circle", { cx: cx + 5, cy: cy - 3, r: 10, fill: sky }, wg); }
    } else if (wx === "sunny" || ph === "dawn" || ph === "evening") {
      const sunY = ph === "dawn" || ph === "evening" ? w.y + w.h * .62 : cy;
      el("circle", { cx, cy: sunY, r: 15, fill: ph === "evening" ? "#ff9a4d" : ph === "dawn" ? "#ffcf7a" : "#fff3b0", opacity: wx === "sunny" ? 1 : .5 }, wg);
    }
    if (wx === "cloudy" || wx === "rainy") { [[.25, .2], [.6, .32]].forEach(([fx, fy]) => { const c = el("g", { fill: wx === "rainy" ? "#d6e6f5" : "#eef2f6", opacity: .92 }, wg); el("ellipse", { cx: w.x + w.w * fx, cy: w.y + w.h * fy, rx: 26, ry: 9 }, c); el("ellipse", { cx: w.x + w.w * fx + 10, cy: w.y + w.h * fy - 6, rx: 15, ry: 9 }, c); }); }
    if (wx === "rainy") {
      const r = rngFor(i + 11); const rg = el("g", { class: "day-rain", stroke: "#ffffff", "stroke-width": 1.8, "stroke-linecap": "round", opacity: .9 }, wg);
      for (let k = 0; k < 22; k++) { const x = w.x + r() * w.w, y = w.y + r() * w.h; el("line", { x1: x, y1: y, x2: x - 3, y2: y + 10 }, rg); }
      for (let k = 0; k < 8; k++) el("ellipse", { cx: w.x + r() * w.w, cy: w.y + r() * w.h, rx: 2, ry: 3, fill: "#ffffff", opacity: .85, class: "day-drop" }, wg);
    }
  });
  // room tint overlay (kept bright and vivid; no murky multiply on rainy days)
  const ov = el("rect", { x: 0, y: 0, width: 1000, height: 640, fill: L[0], opacity: L[1], class: "day-ov" }, g);
  ov.style.mixBlendMode = L[2]; ov.style.transition = tr;
  if (wx === "rainy" && ph !== "night") {
    // Cozy warm indoor glow during rain instead of darkening the scene
    const rg = el("radialGradient", { id: "dayRainWarm", cx: "50%", cy: "45%", r: "60%" }, g);
    el("stop", { offset: "0%", "stop-color": "#fff8e7", "stop-opacity": "0.14" }, rg);
    el("stop", { offset: "100%", "stop-color": "#dbeeff", "stop-opacity": "0.04" }, rg);
    el("rect", { x: 0, y: 0, width: 1000, height: 640, fill: "url(#dayRainWarm)" }, g);
  }
  if (ph === "night") { // warm lamp-ish vignette so the room stays readable
    el("rect", { x: 0, y: 0, width: 1000, height: 640, fill: "url(#gLight)", opacity: .42 }, g);
  }
  if (!reduce && !svg.querySelector("#dayFxStyle")) {
    const st = el("style", { id: "dayFxStyle" }, svg);
    st.textContent = "#dayFx .day-rain{animation:dayRain .6s linear infinite}@keyframes dayRain{from{transform:translateY(-6px)}to{transform:translateY(6px)}}#dayFx .day-star{animation:dayTw 2.4s ease-in-out infinite alternate}@keyframes dayTw{from{opacity:.4}to{opacity:1}}";
  }
  g.setAttribute("data-phase", ph); g.setAttribute("data-weather", wx);
  // Keep #uis-overlay and #cbG above #dayFx so speech bubbles are never dimmed
  const uis = svg.querySelector("#uis-overlay"); if (uis) svg.appendChild(uis);
  const cbg = svg.querySelector(".cbub"); if (cbg) svg.appendChild(cbg);
  return g;
}

/* ---------- UI ---------- */
const css = `
.day-hud{--accent:#e8743b;--line:#e3d6c3;--cream:#fffaf2;--ink:#3b2a1e;font:13px/1.35 system-ui,sans-serif;color:var(--ink);background:var(--cream);border:1px solid var(--line);border-radius:12px;padding:6px 10px;box-sizing:border-box;max-width:100%}
.day-hud *{box-sizing:border-box}
.day-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.day-clock{font-weight:700;font-variant-numeric:tabular-nums}
.day-wx{color:#7a5a40}
.day-xp{flex:1 1 110px;min-width:90px;display:flex;align-items:center;gap:6px}
.day-bar{flex:1;height:7px;border-radius:9px;background:#f1e6d6;overflow:hidden}
.day-bar>i{display:block;height:100%;background:var(--accent);transition:width .4s}
.day-btn{border:1px solid var(--line);background:#fff;border-radius:8px;padding:4px 8px;font:inherit;cursor:pointer;color:var(--ink)}
.day-btn.day-pri{background:var(--accent);border-color:var(--accent);color:#fff}
.day-btn:disabled{opacity:.45;cursor:default}
.day-amb{margin-top:4px;font-size:12px;color:#7a5a40}.day-amb b{color:var(--ink);font-weight:600}
.day-quests{margin-top:6px;border-top:1px dashed var(--line);padding-top:6px;display:grid;gap:6px}
.day-quests[hidden]{display:none}
.day-q{border:1px solid var(--line);border-radius:10px;padding:6px 8px;background:#fff}
.day-q.day-ok{border-color:var(--accent)}
.day-q h4{margin:0 0 2px;font-size:13px}.day-q small{color:#8a6b52;display:block}
.day-g{display:flex;align-items:center;gap:6px;font-size:12px;margin-top:3px}.day-g span{flex:0 0 58%}
.day-toast{margin-top:6px;background:#fff1e6;border:1px solid var(--accent);border-radius:8px;padding:5px 8px}
.day-diary{font:14px/1.45 system-ui,sans-serif;color:#3b2a1e;display:grid;gap:8px}
.day-diary textarea{width:100%;min-height:110px;border:1px solid #e3d6c3;border-radius:10px;padding:8px;font:inherit;background:#fffaf2}
.day-entry{border:1px solid #e3d6c3;border-radius:10px;padding:8px;background:#fff}.day-entry p{margin:4px 0}.day-entry .day-vi{color:#8a6b52;font-size:13px}
@media (max-width:420px){.day-hud{font-size:12px}.day-g span{flex-basis:62%}}
`;
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }
function injectCss(doc) { if (doc && !doc.getElementById("day-css")) { const s = doc.createElement("style"); s.id = "day-css"; s.textContent = css; doc.head.appendChild(s); } }

function renderHud(container, o) {
  o = o || {}; if (!container) return; injectCss(container.ownerDocument);
  let open = false, toast = "";
  function draw() {
    const st = api.state, ph = phase(), lv = levelOf(st.xp), lo = xpForLevel(lv), hi = xpForLevel(lv + 1);
    const amb = ambient_en(ph, st, () => ((st.minutes / 7) % 1));
    const qs = st.quests.map(qs => {
      const q = QBY[qs.id]; if (!q) return ""; const ok = questComplete(qs);
      return `<div class="day-q ${ok ? "day-ok" : ""}"><h4>${esc(q.en)}</h4><small>${esc(q.vi)} · +${q.xp} XP</small>` +
        q.goals.map((g, i) => `<div class="day-g"><span>${esc(goalLabel(g, qs.progress[i]))}</span><div class="day-bar"><i style="width:${Math.round(100 * (goalDone(g, qs.progress[i]) ? 1 : goalFrac(g, qs.progress[i])))}%"></i></div></div>`).join("") +
        `<div style="margin-top:5px"><button class="day-btn ${ok && !qs.claimed ? "day-pri" : ""}" data-claim="${q.id}" ${ok && !qs.claimed ? "" : "disabled"}>${qs.claimed ? "Đã nhận ✓" : "Nhận thưởng"}</button></div></div>`;
    }).join("") || `<small>Chưa có nhiệm vụ. Bấm “Bắt đầu ngày”.</small>`;
    const wxu = WEATHER_UI[st.weather] || WEATHER_UI.sunny;
    container.innerHTML = `<div class="day-hud" role="region" aria-label="Một ngày bằng tiếng Anh">
<div class="day-row"><span class="day-clock">${clockOf(st.minutes)} · ${PHASE_VI[ph]} ${PHASE_ICON[ph]} · Ngày ${st.day}</span><span class="day-wx" title="Thời tiết">${wxu[0]} ${wxu[1]}</span>
<span class="day-xp" title="${st.xp} XP"><b>Lv ${lv}</b><span class="day-bar"><i style="width:${Math.round(100 * (st.xp - lo) / (hi - lo))}%"></i></span></span>
<button class="day-btn" data-act="toggle" aria-expanded="${open}">📋 ${st.quests.filter(q => questComplete(q)).length}/${st.quests.length}</button>
${st.quests.length && !st.ended ? `<button class="day-btn" data-act="end">🌙 Kết thúc</button>` : `<button class="day-btn day-pri" data-act="start">☀️ Bắt đầu ngày</button>`}</div>
<div class="day-amb">${amb.en ? `<b>${esc(amb.en)}</b> <button class="day-btn" data-act="say" aria-label="Nghe">🔊</button> ${esc(amb.vi)}` : ""}</div>
${toast ? `<div class="day-toast" role="status">${esc(toast)}</div>` : ""}
<div class="day-quests" ${open ? "" : "hidden"}>${qs}</div></div>`;
  }
  container.onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    const a = b.dataset.act;
    if (a === "toggle") open = !open;
    else if (a === "start") { startDay({ next: api.state.ended }); toast = ""; o.onStartDay && o.onStartDay(api.state); }
    else if (a === "end") { o.onEndDay && o.onEndDay(api.state); }
    else if (a === "say") { o.speak && o.speak(ambient_en(phase(), api.state, () => ((api.state.minutes / 7) % 1)).en); return; }
    else if (b.dataset.claim) { const r = claim(b.dataset.claim); if (r) toast = "+" + r.gained + " XP!" + (r.levelUp ? " Lên cấp " + r.level + "! " + r.unlock : ""); }
    draw();
  };
  const f = () => draw(); listeners.push(f); draw();
  return { refresh: draw, destroy() { const i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); } };
}

function renderDiary(container, o) {
  o = o || {}; if (!container) return; injectCss(container.ownerDocument);
  function draw() {
    const st = api.state, p = st.pending;
    container.innerHTML = `<div class="day-diary">` +
      (p ? `<h3 style="margin:0">✍️ ${esc(p.title)}</h3><small>Sửa đoạn văn nếu muốn, rồi bấm Lưu.</small>
<textarea data-f="en" aria-label="Nhật ký tiếng Anh">${esc(p.en)}</textarea><div class="day-vi" style="color:#8a6b52;font-size:13px">${esc(p.vi)}</div>
<div class="day-row"><button class="day-btn" data-act="say">🔊 Nghe</button><button class="day-btn day-pri" data-act="save">💾 Lưu nhật ký</button></div>` : `<small>Chưa có nhật ký mới hôm nay.</small>`) +
      `<h4 style="margin:6px 0 0">📖 Nhật ký cũ</h4>` +
      (st.diaries.map((d, i) => `<div class="day-entry"><b>${esc(d.title)}</b> <small>${esc(d.date)}</small> <button class="day-btn" data-say="${i}" aria-label="Nghe">🔊</button><p>${esc(d.en)}</p><p class="day-vi">${esc(d.vi)}</p></div>`).join("") || `<small>Chưa có.</small>`) + `</div>`;
  }
  container.onclick = e => {
    const b = e.target.closest("button"); if (!b) return; const ta = container.querySelector("textarea");
    if (b.dataset.act === "say") o.speak && o.speak(ta ? ta.value : "");
    else if (b.dataset.act === "save" && api.state.pending) { const ent = Object.assign({}, api.state.pending, { en: ta.value.trim() || api.state.pending.en }); saveDiary(ent); o.onSave && o.onSave(ent); draw(); }
    else if (b.dataset.say != null) { const d = api.state.diaries[+b.dataset.say]; d && o.speak && o.speak(d.en); }
  };
  draw(); return { refresh: draw };
}

const api = {
  KEY, QUESTS, DUR, PHASES, PHASE_VI, WEATHERS, UNLOCKS, LIGHT, css,
  state: null, load() { api.state = load(); return api.state; }, save, reset() { api.state = fresh(); save(); return api.state; },
  duration, phaseOfHour, phase, clockOf, hourOf, flowBucket, weatherFor, ambient_en,
  onAction, onSpeak, onListen, onRoleplay, advance(m) { advance(m); save(); },
  pickQuests, questComplete, goalDone, claim, addXp, levelOf, xpForLevel, startDay,
  endOfDay, saveDiary, applyLighting, renderHud, renderDiary,
  subscribe(f) { listeners.push(f); return () => { const i = listeners.indexOf(f); if (i >= 0) listeners.splice(i, 1); }; }
};
api.state = load();
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") window.ELW_DAY = api;
})(typeof window !== "undefined" ? window : globalThis);
