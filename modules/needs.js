/* English Life World — needs.js
   The world remembers and changes over time: the cat gets hungry, the plant gets thirsty,
   dishes pile up… creating natural reasons to speak.  window.ELW_NEEDS */
(function (root) {
  "use strict";
  const KEY = "elw_needs_v1";
  const MAX_CATCHUP_MIN = 24 * 60; // real-time catch-up cap (1 day)

  // value 0..100. "bad:'high'" → high value is a problem; "bad:'low'" → low value is a problem.
  // perMin: change per simulated minute; perAction: change per completed action (any action).
  const NEEDS = {
    catHunger:    { icon: "🍽️", vi: "Mèo đói",          bad: "high", start: 30, perMin: 0.10, perAction: 0.6, obj: "cat" },
    catThirst:    { icon: "🥛", vi: "Mèo khát",         bad: "high", start: 25, perMin: 0.12, perAction: 0.5, obj: "cat" },
    catBowlDirty: { icon: "🥣", vi: "Bát mèo bẩn",      bad: "high", start: 10, perMin: 0.01, perAction: 0,   obj: "cat" },
    plantThirst:  { icon: "💧", vi: "Cây khát nước",    bad: "high", start: 35, perMin: 0.05, perAction: 0.3, obj: "plant" },
    laundryPile:  { icon: "🧺", vi: "Giỏ đồ giặt",      bad: "high", start: 40, perMin: 0.03, perAction: 0.3, obj: "laundry" },
    dirtyDishes:  { icon: "🍽", vi: "Bát đĩa bẩn",      bad: "high", start: 50, perMin: 0.02, perAction: 0.2, obj: "sink" },
    trashFull:    { icon: "🗑️", vi: "Thùng rác đầy",    bad: "high", start: 60, perMin: 0.02, perAction: 0.3, obj: "trashbin" },
    roomDust:     { icon: "🧹", vi: "Sàn nhà bụi",      bad: "high", start: 30, perMin: 0.04, perAction: 0.2, obj: "table" },
    energy:       { icon: "⚡", vi: "Năng lượng",       bad: "low",  start: 80, perMin: -0.03, perAction: -1.5, obj: "char" },
    mood:         { icon: "😺", vi: "Mèo vui vẻ",       bad: "low",  start: 60, perMin: -0.04, perAction: 0,   obj: "cat" }
  };
  const NAMES = Object.keys(NEEDS);

  // {actionId: {need: delta | {set:n}}}  — only ids from actions-list.json
  const S = n => ({ set: n });
  const EFFECTS = {
    feed_cat: { catHunger: S(0), catBowlDirty: +40, mood: +10, energy: -1 },
    give_cat_water: { catThirst: S(0), mood: +5, energy: -1 },
    pet_cat: { mood: +20, energy: +2 },
    play_with_cat: { mood: +30, energy: -4, catHunger: +5 },
    brush_cat: { mood: +15 },
    call_cat: { mood: +3 },
    water_plant: { plantThirst: S(0), energy: -1 },
    sweep_floor: { roomDust: S(0), energy: -5 },
    sweep_under_table: { roomDust: -50, energy: -4 },
    wipe_table: { roomDust: -15, energy: -2 },
    wash_dishes: { dirtyDishes: -60, catBowlDirty: S(0), energy: -4 },
    put_dishes_in_rack: { dirtyDishes: -15, energy: -1 },
    dry_plates: { dirtyDishes: -10, energy: -1 },
    put_plates_away: { dirtyDishes: S(0), energy: -1 },
    clear_the_table: { dirtyDishes: +20, energy: -2 },
    eat_breakfast: { dirtyDishes: +15, trashFull: +5, energy: +10 },
    serve_rice: { dirtyDishes: +5 },
    fry_egg: { dirtyDishes: +10, trashFull: +5, energy: -2 },
    cook_rice: { dirtyDishes: +5, energy: -1 },
    toast_bread: { trashFull: +3 },
    take_out_trash: { trashFull: S(0), energy: -4 },
    put_in_new_bag: { trashFull: S(0) },
    pick_up_clothes: { laundryPile: +15, energy: -2 },
    empty_basket: { laundryPile: S(0), energy: -4 },
    hang_up_shirt: { laundryPile: -10, energy: -1 },
    make_bed: { energy: -3, roomDust: +2 },
    fold_blanket: { energy: -2 },
    lie_down: { energy: +25 },
    sit_on_bed: { energy: +8 },
    read_in_bed: { energy: +10 },
    sit_on_sofa: { energy: +10 },
    lie_on_sofa: { energy: +20 },
    read_on_sofa: { energy: +8 },
    sit_on_chair: { energy: +5 },
    watch_tv: { energy: +5 },
    listen_to_music: { energy: +5 },
    make_coffee: { energy: +5, trashFull: +3 },
    drink_coffee: { energy: +20 },
    drink_from_cup: { energy: +8 },
    get_out_of_bed: { energy: -2 },
    turn_off_alarm: { energy: -2 }
  };

  const clamp = v => Math.max(0, Math.min(100, Math.round(v * 10) / 10));
  const fresh = () => { const s = {}; for (const n of NAMES) s[n] = NEEDS[n].start; return s; };
  let N = fresh(), lastSeen = Date.now(), realTime = false;
  let store = null; try { store = root.localStorage || null; } catch (e) { store = null; }

  function save() {
    try { store && store.setItem(KEY, JSON.stringify({ v: 1, needs: N, lastSeen, realTime })); } catch (e) {}
  }
  function load(opt) {
    opt = opt || {};
    try {
      const d = store && JSON.parse(store.getItem(KEY));
      if (d && d.v === 1 && d.needs) {
        N = fresh(); for (const n of NAMES) if (typeof d.needs[n] === "number") N[n] = clamp(d.needs[n]);
        realTime = !!d.realTime; if (typeof d.lastSeen === "number") lastSeen = d.lastSeen;
      }
    } catch (e) {}
    if (realTime || opt.realTime) catchUp(opt.now);
    return state();
  }
  // real-time mode: advance by real elapsed minutes since last visit (capped)
  function catchUp(now) {
    now = now == null ? Date.now() : now;
    const mins = Math.max(0, Math.min(MAX_CATCHUP_MIN, (now - lastSeen) / 60000));
    lastSeen = now; if (mins > 0) tick(mins, true); else save();
    return mins;
  }
  function setRealTime(on, now) { realTime = !!on; lastSeen = now == null ? Date.now() : now; save(); }

  function state() { return Object.assign({}, N); }
  function set(patch) { for (const k in patch) if (k in NEEDS) N[k] = clamp(patch[k]); save(); return state(); }
  function tick(minutes, noStamp) {
    const m = Math.max(0, +minutes || 0);
    for (const n of NAMES) N[n] = clamp(N[n] + NEEDS[n].perMin * m);
    if (!noStamp && realTime) lastSeen = Date.now();
    save(); return state();
  }
  function onAction(id) {
    for (const n of NAMES) if (NEEDS[n].perAction) N[n] = clamp(N[n] + NEEDS[n].perAction);
    const e = EFFECTS[id];
    if (e) for (const n in e) { const v = e[n]; N[n] = clamp(typeof v === "object" ? v.set : N[n] + v); }
    save(); return state();
  }
  function reset() { N = fresh(); lastSeen = Date.now(); save(); return state(); }

  // badness 0..100 (high = needs attention)
  const bad = (n, s) => NEEDS[n].bad === "high" ? s[n] : 100 - s[n];
  const sev = b => b >= 85 ? 3 : b >= 65 ? 2 : b >= 45 ? 1 : 0;

  // lines per need per severity: [en, vi]; graded A1 → B2 via index (pick by level)
  const L = {
    catHunger: {
      suggest: "feed_cat", obj: "cat",
      1: [["The cat looks hungry.", "Con mèo trông có vẻ đói."], ["Mochi is sniffing her empty bowl.", "Mochi đang ngửi cái bát trống."]],
      2: [["Mochi keeps meowing at her bowl.", "Mochi cứ kêu meo meo bên bát ăn."], ["The cat is following me around — she must be hungry.", "Con mèo cứ đi theo tôi — chắc nó đói rồi."]],
      3: [["The cat is very hungry!", "Con mèo đói lắm rồi!"], ["Poor Mochi hasn't eaten for ages; she's practically begging for food.", "Tội Mochi, lâu lắm rồi chưa ăn; nó gần như đang xin ăn."]],
      me: ["I need to feed the cat.", "Tôi cần cho mèo ăn."] },
    catThirst: {
      suggest: "give_cat_water", obj: "cat",
      1: [["The cat's water bowl is low.", "Bát nước của mèo sắp cạn."], ["Mochi might be thirsty.", "Mochi có thể đang khát."]],
      2: [["The cat is thirsty.", "Con mèo đang khát."], ["Mochi keeps licking the empty water bowl.", "Mochi cứ liếm cái bát nước trống."]],
      3: [["The water bowl is empty!", "Bát nước trống trơn rồi!"], ["The water bowl has been bone-dry for hours — she really needs a drink.", "Bát nước khô cong mấy tiếng rồi — nó thật sự cần uống nước."]],
      me: ["I need to give the cat some water.", "Tôi cần cho mèo uống nước."] },
    catBowlDirty: {
      suggest: "wash_dishes", obj: "cat",
      1: [["The cat bowl is a bit dirty.", "Bát mèo hơi bẩn."], ["There's dried food stuck to the cat bowl.", "Có thức ăn khô dính trên bát mèo."]],
      2: [["The cat bowl is dirty.", "Bát mèo bẩn rồi."], ["Mochi won't eat from that sticky bowl.", "Mochi không chịu ăn từ cái bát dính nhớp đó."]],
      3: [["The cat bowl is really dirty!", "Bát mèo bẩn quá!"], ["That bowl is getting smelly; it should have been washed yesterday.", "Cái bát bắt đầu bốc mùi; lẽ ra phải rửa từ hôm qua."]],
      me: ["I need to wash the cat bowl.", "Tôi cần rửa bát của mèo."] },
    plantThirst: {
      suggest: "water_plant", obj: "plant",
      1: [["The soil looks dry.", "Đất trông khô."], ["The plant could use a little water.", "Cái cây cần một chút nước."]],
      2: [["The plant's leaves are drooping.", "Lá cây đang rủ xuống."], ["The leaves are starting to droop because the soil is dry.", "Lá bắt đầu rủ vì đất khô."]],
      3: [["The plant is dying!", "Cái cây sắp chết rồi!"], ["Some leaves have turned brown; if I don't water it soon, it won't survive.", "Vài chiếc lá đã ngả nâu; nếu không tưới sớm, nó sẽ không sống nổi."]],
      me: ["I need to water the plant.", "Tôi cần tưới cây."] },
    laundryPile: {
      suggest: "empty_basket", obj: "laundry",
      1: [["The laundry basket is getting full.", "Giỏ đồ giặt sắp đầy."], ["There are quite a few clothes in the basket.", "Có khá nhiều quần áo trong giỏ."]],
      2: [["The laundry basket is full.", "Giỏ đồ giặt đầy rồi."], ["I'm running out of clean clothes.", "Tôi sắp hết quần áo sạch."]],
      3: [["The laundry basket is overflowing.", "Giỏ đồ giặt tràn ra ngoài."], ["Clothes are spilling over the sides of the basket — laundry day can't wait.", "Quần áo tràn khỏi giỏ — không thể hoãn ngày giặt nữa."]],
      me: ["I need to do the laundry.", "Tôi cần giặt đồ."] },
    dirtyDishes: {
      suggest: "wash_dishes", obj: "sink",
      1: [["There are some dirty dishes.", "Có vài cái bát đĩa bẩn."], ["A few plates are waiting in the sink.", "Vài cái đĩa đang chờ trong bồn rửa."]],
      2: [["There's a pile of dirty dishes in the sink.", "Có một chồng bát đĩa bẩn trong bồn rửa."], ["The dishes are piling up in the sink.", "Bát đĩa đang chất đống trong bồn."]],
      3: [["The sink is full of dirty dishes!", "Bồn rửa đầy bát đĩa bẩn!"], ["There isn't a single clean plate left — the sink is overflowing with dishes.", "Không còn cái đĩa sạch nào — bồn rửa ngập bát đĩa."]],
      me: ["I need to wash the dishes.", "Tôi cần rửa bát."] },
    trashFull: {
      suggest: "take_out_trash", obj: "trashbin",
      1: [["The trash can is almost full.", "Thùng rác gần đầy."], ["The bin is filling up.", "Thùng rác đang đầy dần."]],
      2: [["The trash is full.", "Thùng rác đầy rồi."], ["I can't fit anything else in the bin.", "Không nhét thêm gì vào thùng được nữa."]],
      3: [["The trash smells bad!", "Rác bốc mùi quá!"], ["The bin is overflowing and the kitchen is starting to smell.", "Thùng rác tràn ra và nhà bếp bắt đầu có mùi."]],
      me: ["I need to take out the trash.", "Tôi cần đi đổ rác."] },
    roomDust: {
      suggest: "sweep_floor", obj: "table",
      1: [["The floor is a bit dusty.", "Sàn nhà hơi bụi."], ["I can see a few crumbs on the floor.", "Tôi thấy vài vụn bánh trên sàn."]],
      2: [["The floor is dusty.", "Sàn nhà bụi bặm."], ["There's dust and cat hair all over the floor.", "Bụi và lông mèo khắp sàn."]],
      3: [["The floor is very dirty!", "Sàn nhà bẩn quá!"], ["The floor hasn't been swept in days; my socks are turning grey.", "Sàn mấy ngày chưa quét; tất của tôi ngả màu xám rồi."]],
      me: ["I need to sweep the floor.", "Tôi cần quét nhà."] },
    energy: {
      suggest: "lie_on_sofa", obj: "char",
      1: [["I'm a little tired.", "Tôi hơi mệt."], ["I could do with a short rest.", "Tôi muốn nghỉ một chút."]],
      2: [["I'm tired. I need a break.", "Tôi mệt. Tôi cần nghỉ."], ["I've been on my feet all day; a coffee would be nice.", "Tôi đứng cả ngày rồi; một ly cà phê thì tuyệt."]],
      3: [["I'm exhausted. I need a break.", "Tôi kiệt sức. Tôi cần nghỉ."], ["I'm so worn out I can barely keep my eyes open.", "Tôi mệt rã rời, gần như không mở mắt nổi."]],
      me: ["I need to lie down for a while.", "Tôi cần nằm nghỉ một lúc."] },
    mood: {
      suggest: "pet_cat", obj: "cat",
      1: [["The cat wants attention.", "Con mèo muốn được chú ý."], ["Mochi keeps rubbing against my legs.", "Mochi cứ cọ vào chân tôi."]],
      2: [["The cat looks bored.", "Con mèo trông chán."], ["Mochi seems lonely — she hasn't been played with all day.", "Mochi có vẻ cô đơn — cả ngày chưa ai chơi với nó."]],
      3: [["The cat is sad.", "Con mèo buồn."], ["Mochi is sulking under the sofa and ignoring me completely.", "Mochi dỗi trốn dưới sofa và phớt lờ tôi hoàn toàn."]],
      me: ["I need to play with the cat.", "Tôi cần chơi với mèo."] }
  };
  const ADV = { A1: 0, A2: 0, B1: 1, B2: 1, C1: 1, C2: 1 };

  // observations(W, {level}) → sorted list (most severe first)
  function observations(W, opt) {
    opt = opt || {}; const lv = ADV[opt.level || "A2"] || 0; const s = opt.state || N; const out = [];
    for (const n of NAMES) {
      const b = bad(n, s), v = sev(b); if (!v) continue;
      const d = L[n]; const pair = d[v][lv] || d[v][0];
      let suggest = d.suggest;
      if (n === "energy" && W && W.sitting) suggest = "drink_coffee";
      out.push({ need: n, severity: v, score: b, en: pair[0], vi: pair[1], level: lv ? "B2" : "A1",
        simple: { en: d[v][0][0], vi: d[v][0][1] }, rich: { en: d[v][1][0], vi: d[v][1][1] },
        me: { en: d.me[0], vi: d.me[1] }, suggest, objectId: d.obj });
    }
    return out.sort((a, b) => b.severity - a.severity || b.score - a.score);
  }

  /* ---------------- visuals ---------------- */
  const css = `
.nd-layer{pointer-events:none}
.nd-layer *{pointer-events:none}
.nd-ind{transition:opacity .45s ease;opacity:0}
.nd-ind.nd-on{opacity:1}
.nd-bub{fill:#fff;stroke:#e3d6c3;stroke-width:2}
.nd-ind.s3 .nd-bub{stroke:#e8743b;stroke-width:3}
.nd-emo{font-size:22px;dominant-baseline:central;text-anchor:middle}
.nd-float{animation:nd-bob 2.4s ease-in-out infinite}
@keyframes nd-bob{50%{transform:translateY(-4px)}}
.nd-dust{fill:#a08a6a;opacity:.55}
.nd-ebar-bg{fill:#fff;stroke:#e3d6c3;stroke-width:1.5}
#o-plant.nd-droop .vec{transform-box:fill-box;transform-origin:50% 100%;transform:scaleY(.93) skewX(-3deg);filter:saturate(.6);transition:transform .6s,filter .6s}
#o-plant.nd-brown .vec{filter:sepia(.7) saturate(.8) hue-rotate(-20deg)}
@media (prefers-reduced-motion:reduce){.nd-ind,#o-plant .vec{transition:none!important}.nd-float{animation:none!important}}
.nd-card h2{margin:0 0 8px;font-size:16px}
.nd-bars{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 10px;margin-bottom:8px}
.nd-bar{display:flex;align-items:center;gap:4px;font-size:12px;min-width:0}
.nd-bar span.l{flex:0 0 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px}
.nd-track{flex:1;height:7px;border-radius:4px;background:#f3ece2;border:1px solid var(--line,#e3d6c3);overflow:hidden;min-width:30px}
.nd-fill{height:100%;background:#7bb36a}
.nd-fill.w{background:#e9b949}.nd-fill.d{background:var(--accent,#e8743b)}
.nd-obs{border-top:1px solid var(--line,#e3d6c3);padding:6px 0;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.nd-obs .t{flex:1 1 180px;min-width:0}
.nd-obs .en{font-weight:600}.nd-obs .vi,.nd-obs .me{font-size:12px;opacity:.75}
.nd-obs button{border:1px solid var(--line,#e3d6c3);background:#fff;border-radius:8px;padding:4px 8px;font:inherit;font-size:13px;cursor:pointer}
.nd-obs button.go{background:var(--accent,#e8743b);color:#fff;border-color:var(--accent,#e8743b)}
.nd-ok{font-size:13px;opacity:.75}`;

  const SVGNS = "http://www.w3.org/2000/svg";
  function svgBox(el, svg) { // bbox of el in svg user coords, null if hidden
    try {
      if (!el || !el.isConnected) return null;
      const r = el.getBoundingClientRect(); if (!r.width && !r.height) return null;
      const m = svg.getScreenCTM(); if (!m) return null; const inv = m.inverse();
      const p1 = new DOMPoint(r.left, r.top).matrixTransform(inv), p2 = new DOMPoint(r.right, r.bottom).matrixTransform(inv);
      return { x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y };
    } catch (e) { return null; }
  }
  function mk(tag, attrs, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function bubble(layer, b, emo, s, key) {
    const g = mk("g", { class: "nd-ind s" + s, "data-nd": key }, layer);
    const f = mk("g", { class: "nd-float" }, g);
    const cx = b.x + b.width / 2, cy = Math.max(20, b.y - 22);
    mk("circle", { class: "nd-bub", cx: cx + 12, cy: cy + 18, r: 3 }, f);
    mk("circle", { class: "nd-bub", cx, cy, r: 17 }, f);
    const t = mk("text", { class: "nd-emo", x: cx, y: cy + 1 }, f); t.textContent = s >= 3 ? emo + "" : emo;
    return g;
  }
  function decorate(svgWorld, W, opt) {
    if (!svgWorld || typeof document === "undefined") return;
    const svg = svgWorld.ownerSVGElement || svgWorld; const s = (opt && opt.state) || N;
    if (!document.getElementById("nd-css")) { const st = document.createElement("style"); st.id = "nd-css"; st.textContent = css; document.head.appendChild(st); }
    let layer = svg.querySelector(":scope > g.nd-layer");
    if (!layer) { layer = mk("g", { class: "nd-layer", "aria-hidden": "true" }); svgWorld.parentNode.insertBefore(layer, svgWorld.nextSibling); }
    const prev = new Set([...layer.children].map(c => c.getAttribute("data-nd")));
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    const byId = id => svg.querySelector("#o-" + id) || (id === "sink" ? svg.querySelector("#o-dishrack") : null);
    const add = (n, objId, emo) => {
      if (objId === "cat" || n === "catHunger" || n === "catThirst" || n === "mood" || n === "catBowlDirty") return;
      const v = sev(bad(n, s)); if (!v) return;
      const el = byId(objId); if (!el) return;
      if (W && W.room && el.dataset && el.dataset.room && el.dataset.room !== W.room) return;
      let b = svgBox(el, svg); if (!b) return;
      const g = bubble(layer, b, emo, v, n);
      if (n === "dirtyDishes" && v >= 2) for (let i = 0; i < v + 1; i++) mk("ellipse", { cx: b.x + b.width / 2, cy: b.y + 6 - i * 5, rx: 14, ry: 3.5, fill: "#f6f1e8", stroke: "#b9a68a", "stroke-width": 1.5 }, g);
      if (n === "laundryPile" && v >= 3) ["#7aa3d6", "#e58a8a", "#9bc48a"].forEach((c, i) => mk("rect", { x: b.x + 4 + i * 12, y: b.y - 6 + (i % 2) * 3, width: 14, height: 8, rx: 3, fill: c }, g));
    };
    add("plantThirst", "plant", "💧");
    add("laundryPile", "laundry", "🧺"); add("dirtyDishes", "sink", "🍽️"); add("trashFull", "trashbin", "🗑️");
    // plant droop
    const pl = svg.querySelector("#o-plant");
    if (pl) { const v = sev(bad("plantThirst", s)); pl.classList.toggle("nd-droop", v >= 2); pl.classList.toggle("nd-brown", v >= 3); }
    // dust specks on living floor
    const dv = sev(bad("roomDust", s));
    if (dv && (!W || !W.room || W.room === "living")) {
      const g = mk("g", { class: "nd-ind", "data-nd": "roomDust" }, layer);
      let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < dv * 12; i++) mk("circle", { class: "nd-dust", cx: 120 + rnd() * 720, cy: 540 + rnd() * 90, r: 1.2 + rnd() * 2.2 }, g);
    }
    // energy bar above #char
    const cb = svgBox(svg.querySelector("#char"), svg);
    if (cb) {
      const g = mk("g", { class: "nd-ind", "data-nd": "energy" }, layer); const w = 44, x = cb.x + cb.width / 2 - w / 2, y = Math.max(4, cb.y - 14), e = s.energy;
      mk("rect", { class: "nd-ebar-bg", x, y, width: w, height: 7, rx: 3.5 }, g);
      mk("rect", { x: x + 1, y: y + 1, width: Math.max(0, (w - 2) * e / 100), height: 5, rx: 2.5, fill: e < 35 ? "#e8743b" : e < 55 ? "#e9b949" : "#7bb36a" }, g);
      const t = mk("text", { x: x - 4, y: y + 4, "font-size": 11, "text-anchor": "end", "dominant-baseline": "central" }, g); t.textContent = "⚡";
    }
    const reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = [...layer.children];
    items.forEach(c => { if (prev.has(c.getAttribute("data-nd")) || reduce) c.classList.add("nd-on"); });
    const on = () => items.forEach(c => c.classList.add("nd-on"));
    if (root.requestAnimationFrame) root.requestAnimationFrame(() => root.requestAnimationFrame(on)); else on();
    return layer;
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }
  function renderPanel(container, h) {
    if (!container) return; h = h || {};
    const s = N, W = h.W || null, obs = observations(W, { level: h.level }).slice(0, 3);
    if (typeof document !== "undefined" && !document.getElementById("nd-css")) { const st = document.createElement("style"); st.id = "nd-css"; st.textContent = css; document.head.appendChild(st); }
    container.classList.add("nd-card");
    container.innerHTML = `<h2>🏠 Tình trạng ngôi nhà</h2><div class="nd-bars">${NAMES.map(n => {
      const d = NEEDS[n], b = bad(n, s), pct = d.bad === "high" ? 100 - s[n] : s[n]; // fullness of "good"
      return `<div class="nd-bar" title="${esc(d.vi)}: ${Math.round(s[n])}"><span>${d.icon}</span><span class="l">${esc(d.vi)}</span><div class="nd-track"><div class="nd-fill ${b >= 65 ? "d" : b >= 45 ? "w" : ""}" style="width:${Math.round(pct)}%"></div></div></div>`;
    }).join("")}</div>${obs.length ? obs.map((o, i) => `<div class="nd-obs"><div class="t"><div class="en">${esc(o.en)}</div><div class="vi">${esc(o.vi)}</div><div class="me">🗣 ${esc(o.me.en)}</div></div><button data-say="${i}" aria-label="Nghe">🔊</button><button class="go" data-go="${i}">Làm ngay</button></div>`).join("") : `<div class="nd-ok">Mọi thứ đều ổn! Everything looks fine.</div>`}`;
    container.querySelectorAll("[data-say]").forEach(b => b.onclick = () => { const o = obs[+b.dataset.say]; h.speak && h.speak(o.en + " " + o.me.en); });
    container.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { const o = obs[+b.dataset.go]; h.enqueue && h.enqueue(o.suggest); });
    return obs;
  }

  const API = { KEY, MAX_CATCHUP_MIN, NEEDS, EFFECTS, LINES: L, css, state, set, tick, onAction, reset, load, save, catchUp, setRealTime,
    isRealTime: () => realTime, observations, decorate, renderPanel, severity: (n, s) => sev(bad(n, s || N)),
    _setStorage: st => { store = st; } };
  root.ELW_NEEDS = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
