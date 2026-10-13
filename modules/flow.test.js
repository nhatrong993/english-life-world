// Run: node modules/flow.test.js   (Playwright part uses the globally installed package)
const fs = require("fs"), path = require("path"), { execSync } = require("child_process");
const F = require("./flow.js");
const { ELW_ROOMS } = require("./rooms.js");
const LIST = JSON.parse(fs.readFileSync(path.join(__dirname, "actions-list.json"), "utf8")).actions;
const IDS = new Set(LIST.map(a => a.id));
const ROOM = Object.fromEntries(LIST.map(a => [a.id, a.room]));
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log("FAIL:", m); } };

// 1. NEXT coverage
ok(IDS.size === 107, "107 action ids, got " + IDS.size);
for (const id of IDS) {
  const nx = F.NEXT[id];
  ok(Array.isArray(nx) && nx.length >= 2 && nx.length <= 5, `${id}: 2–5 NEXT entries`);
  (nx || []).forEach(e => { ok(IDS.has(e.id), `${id} -> unknown ${e.id}`); ok(e.id !== id, `${id} self-loop`); ok(/[\u0300-\u036f]|đ/i.test(e.why_vi.normalize("NFD")), `${id}->${e.id} why_vi Vietnamese`); ok(e.weight > 0, "weight"); });
}
Object.keys(F.NEXT).forEach(k => ok(IDS.has(k), "NEXT key unknown: " + k));

// 2. Routines: ids exist + simulate from the default initial state
const W0 = { fridge: "closed", window: "closed", chair: "in", milk: "fridge", cup: "counter", book: "floor", broom: "wall", hand: null, sitting: false, cupLevel: 0, tv: "off", activity: null, room: "living",
  sofa: null, cat: "sleeping", catBowl: "empty", catWater: "empty", floorLamp: "off", livCurtains: "closed", fan: "off", music: "off",
  ...ELW_ROOMS.kitchen.W0, ...ELW_ROOMS.bedroom.W0 };
const roomAct = {}; for (const R of Object.values(ELW_ROOMS)) for (const a of R.actions) roomAct[a.id] = a;
// Living-room stubs (pre returns reason or null; eff mutates W) mirroring index.html + expected new-object logic
const L = {
  wipe_table: [W => null, W => {}], pick_up_book: [W => W.book === "hand" ? "x" : null, W => { W.book = "hand"; }],
  put_book_on_table: [W => W.book === "table" ? "x" : null, W => { W.book = "table"; }], sweep_under_table: [W => null, W => {}], sweep_floor: [W => null, W => {}],
  open_window: [W => W.window === "open" ? "x" : null, W => { W.window = "open"; }], close_window: [W => W.window === "closed" ? "x" : null, W => { W.window = "closed"; }],
  water_plant: [W => null, W => {}], turn_on_tv: [W => W.tv === "on" ? "x" : null, W => { W.tv = "on"; }], watch_tv: [W => W.tv !== "on" ? "x" : null, W => { W.activity = "watching"; }],
  turn_off_tv: [W => W.tv !== "on" ? "x" : null, W => { W.tv = "off"; W.activity = null; }],
  sit_on_sofa: [W => W.sofa === "sitting" ? "x" : null, W => { W.sofa = "sitting"; W.sitting = true; }], lie_on_sofa: [W => W.sofa === "lying" ? "x" : null, W => { W.sofa = "lying"; W.sitting = true; }],
  get_up_from_sofa: [W => !W.sofa ? "x" : null, W => { W.sofa = null; W.sitting = false; }], fluff_cushion: [W => null, W => {}], fold_throw: [W => null, W => {}],
  call_cat: [W => null, W => { W.cat = "awake"; }], pet_cat: [W => W.cat === "sleeping" ? "x" : null, W => {}], play_with_cat: [W => W.cat === "sleeping" ? "x" : null, W => { W.cat = "playing"; }],
  feed_cat: [W => W.catBowl === "full" ? "x" : null, W => { W.catBowl = "full"; }], give_cat_water: [W => W.catWater === "full" ? "x" : null, W => { W.catWater = "full"; }], brush_cat: [W => null, W => {}],
  open_living_curtains: [W => W.livCurtains === "open" ? "x" : null, W => { W.livCurtains = "open"; }], close_living_curtains: [W => W.livCurtains !== "open" ? "x" : null, W => { W.livCurtains = "closed"; }],
  turn_on_fan: [W => W.fan === "on" ? "x" : null, W => { W.fan = "on"; }], pick_up_remote: [W => null, W => { W.hand = "remote"; }], listen_to_music: [W => W.music === "on" ? "x" : null, W => { W.music = "on"; }],
  go_living: [W => W.room === "living" ? "x" : null, W => { W.room = "living"; }], go_kitchen: [W => W.room === "kitchen" ? "x" : null, W => { W.room = "kitchen"; }], go_bedroom: [W => W.room === "bedroom" ? "x" : null, W => { W.room = "bedroom"; }]
};
function run(id, W) {
  const room = ROOM[id];
  if (W.sitting && room !== "*" && room !== W.room) { W.sitting = false; W.sofa = null; W.b_lying = false; }
  if (room !== "*" && room !== W.room) W.room = room; // app auto-walks
  if (L[id]) { let why = L[id][0](W); if (why && W.sitting) { W.sitting = false; W.sofa = null; why = L[id][0](W); } if (why) return why; L[id][1](W); return null; }
  const a = roomAct[id]; if (!a) return "no sim for " + id;
  let why = a.pre(W);
  if (why && W.sitting && !a.sitOk) { W.sitting = false; W.b_lying = false; why = a.pre(W); }
  if (why) return why;
  for (const s of a.seq(W)) { if (s[0] === "set") W[s[1]] = s[2]; else if (s[0] === "sit") W.sitting = true; else if (s[0] === "stand") W.sitting = false; else if (s[0] === "activity") W.activity = s[1]; }
  return null;
}
ok(F.ROUTINES.length >= 8, "≥8 routines");
for (const r of F.ROUTINES) {
  ok(r.id && r.title && r.titleVi && r.icon && ["morning", "noon", "evening", "night"].includes(r.time), r.id + " fields");
  ok(r.ids.length >= 6 && r.ids.length <= 12, `${r.id} has 6–12 ids (${r.ids.length})`);
  const W = JSON.parse(JSON.stringify(W0));
  for (const id of r.ids) { ok(IDS.has(id), `${r.id}: unknown ${id}`); const why = run(id, W); ok(!why, `${r.id}: ${id} blocked — ${why}`); }
}

// 3. suggest()
const isPossible = id => IDS.has(id);
for (const id of IDS) {
  for (const hour of [7, 13, 20, 23]) {
    const s = F.suggest(id, W0, { isPossible, hour });
    ok(s.length >= 1 && s.length <= 3, `suggest(${id}) count ${s.length}`);
    ok(s.every(x => IDS.has(x.id) && x.id !== id && x.why_vi), `suggest(${id}) valid/non-repeating`);
    ok(new Set(s.map(x => x.id)).size === s.length, `suggest(${id}) unique`);
  }
}
const only = F.suggest("watch_tv", W0, { isPossible: id => id === "lie_on_sofa" || id === "call_cat", hour: 20 });
ok(only.length === 2 && only[0].id === "lie_on_sofa", "isPossible filter + weight order");
ok(F.suggest("nope", W0, { hour: 7 }).length === 3, "unknown id falls back to time-of-day");

// 4. greet_vi
for (const h of [6, 12, 19, 23]) { const g = F.greet_vi(h, W0); ok(typeof g === "string" && g.length > 5 && g.length < 120, "greet " + h); console.log(h, F.timeOfDay(h), "→", g); }
ok(F.timeOfDay(6) === "morning" && F.timeOfDay(12) === "noon" && F.timeOfDay(19) === "evening" && F.timeOfDay(23) === "night", "timeOfDay");

// 5. Playwright render at 390px
(async () => {
  let chromium = null;
  try {
    const { pathToFileURL } = require("url");
    const mod = await import(pathToFileURL(path.join(execSync("npm root -g").toString().trim(), "playwright/index.mjs")).href);
    chromium = mod.chromium;
  } catch (e) {}

  if (!chromium) {
    console.log("Playwright not installed, skipping browser render tests. Data assertions passed!");
    console.log(fails ? `${fails} FAILURES` : "ALL PASS");
    process.exit(fails ? 1 : 0);
  }

  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 760 } });
  const labels = Object.fromEntries(LIST.map(a => [a.id, { en: a.label, vi: a.labelVi }]));
  await p.setContent(`<!doctype html><meta name=viewport content="width=device-width"><body style="margin:0;padding:16px;font-family:system-ui;background:#f7efe4"><div id=guide><p id=g></p><div id=chips></div><h3 style="margin:14px 0 8px">Routines</h3><div id=rt></div></div></body>`);
  await p.addScriptTag({ path: path.join(__dirname, "flow.js") });
  const res = await p.evaluate(([labels, W0]) => {
    const F = window.ELW_FLOW, picked = [];
    document.getElementById("g").textContent = "Cô Mai: " + F.greet_vi(20, W0);
    F.renderChips(document.getElementById("chips"), F.suggest("watch_tv", W0, { hour: 20 }), id => labels[id], id => picked.push(id));
    F.renderRoutines(document.getElementById("rt"), F.ROUTINES, r => picked.push(r.id), 20);
    document.querySelector(".flow-chip").focus();
    return { sw: document.documentElement.scrollWidth, chips: document.querySelectorAll(".flow-chip").length, rts: document.querySelectorAll(".flow-rt").length,
      minH: Math.min(...[...document.querySelectorAll(".flow-chip,.flow-rt")].map(e => e.getBoundingClientRect().height)) };
  }, [labels, W0]);
  await p.keyboard.press("Enter");
  ok(res.sw <= 390, "no horizontal overflow (scrollWidth " + res.sw + ")");
  ok(res.chips === 3 && res.rts === F.ROUTINES.length, "chips/routines rendered");
  ok(res.minH >= 44, "tap targets ≥44px (" + res.minH + ")");
  await p.screenshot({ path: path.join(__dirname, "flow.png"), fullPage: true });
  await b.close();
  console.log(fails ? `${fails} FAILURES` : "ALL PASS");
  process.exit(fails ? 1 : 0);
})();
