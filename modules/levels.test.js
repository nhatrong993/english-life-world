const assert = require("assert");
const L = require("./levels.js");
const LV = L.LEVELS.map(l => l.id);
let uid = 0;
const it = (id, ctx = {}) => ({ uid: ++uid, id, ctx: Object.assign({ watching: false, sitting: false, cupLevel: 0, milkFromFridge: false }, ctx) });
let pass = 0;
const t = (name, fn) => { fn(); pass++; };

function check(items, lvl, opts) {
  const segs = L.build(items, lvl, opts);
  const all = segs.flatMap(s => s.uids).sort((a, b) => a - b);
  assert.deepStrictEqual(all, items.map(i => i.uid).sort((a, b) => a - b), `uids ${lvl}`);
  segs.forEach((s, k) => {
    assert.ok(s.en && s.vi, "en/vi present");
    if (k < segs.length - 1) assert.ok(!/\bFinally\b/.test(s.en), `Finally not last ${lvl}: ${s.en}`);
  });
  const p = segs.map(s => s.en).join(" ");
  assert.ok(!/\bglass\b/.test(p), "no glass");
  assert.ok(!/favou?rite/.test(p), "no favorite");
  return segs;
}

const main = [it("put_cup_on_table"), it("pour_milk", { milkFromFridge: true, cupLevel: 2 }), it("pick_up_cup"),
  it("sit_on_chair", { sitting: true }), it("turn_on_tv", { sitting: true }), it("watch_tv", { sitting: true, watching: true }),
  it("drink_from_cup", { watching: true, sitting: true }), it("drink_from_cup", { watching: true, sitting: true }),
  it("put_cup_on_table", { sitting: true, watching: true })];
const out = {};
t("main scenario all levels", () => LV.forEach(l => {
  const segs = check(main, l);
  out[l] = segs;
  const p = segs.map(s => s.en).join(" ");
  assert.ok(/Finally/.test(segs[segs.length - 1].en), "last has Finally " + l);
  if (["B1", "B2", "C1", "C2"].includes(l)) assert.ok(/while watching|as i|without taking|eyes/i.test(p), "watching phrasing " + l);
  for (const m of [false, true]) check(main, l, { rich: m });
  const ex = L.extras(main, l);
  assert.ok(ex.chunks.length >= 4 && ex.chunks.length <= 8, "chunks count " + l + " " + ex.chunks.length);
  ex.chunks.forEach(c => assert.ok(p.toLowerCase().includes(c.en.toLowerCase()) && c.vi));
  assert.ok(ex.words.length > 0 && ex.words.every(w => w.ipa && w.vi));
  assert.ok(ex.grammar.length >= 1 && ex.grammar.length <= 3 && ex.grammar.every(g => p.includes(g.example)));
}));
t("cleaning scenario", () => {
  const c = [it("sweep_floor"), it("wipe_table"), it("water_plant"), it("open_window")];
  LV.forEach(l => { const s = check(c, l); assert.ok(!/TV|milk|cup/.test(s.map(x => x.en).join(" ")), "no invented actions " + l); });
});
t("single item", () => LV.forEach(l => {
  const s = check([it("open_window")], l);
  assert.strictEqual(s.length, 1); assert.ok(!/Finally|First/.test(s[0].en));
}));
t("no cold when not from fridge", () => LV.forEach(l => [false, true].forEach(r => {
  const s = check([it("put_cup_on_table"), it("pour_milk", { milkFromFridge: false }), it("drink_from_cup")], l, { rich: r });
  assert.ok(!/cold/i.test(s.map(x => x.en).join(" ")), "cold " + l);
})));
t("no while watching when not watching", () => LV.forEach(l => {
  const s = check([it("pour_milk"), it("drink_from_cup"), it("drink_from_cup")], l);
  assert.ok(!/watch|screen|show/i.test(s.map(x => x.en).join(" ")));
}));
t("all ids covered", () => {
  const ids = "open_fridge take_milk put_milk_back close_fridge pick_up_cup put_cup_on_table pour_milk drink_from_cup wipe_table put_book_on_table sweep_under_table pull_out_chair sit_on_chair get_up push_chair_in sweep_floor open_window close_window water_plant pick_up_book turn_on_tv watch_tv turn_off_tv".split(" ");
  const items = ids.map(id => it(id));
  LV.forEach(l => check(items, l));
});
t("unknown ids", () => {
  LV.forEach(l => {
    const s = L.build([it("dance"), it("open_window")], l);
    assert.strictEqual(s.flatMap(x => x.uids).length, 1);
    const f = check([it("dance"), it("open_window")], l, { fallback: id => ["dance a little", "nhảy một chút"] });
    assert.ok(/danc/.test(f.map(x => x.en).join(" ")));
  });
  assert.deepStrictEqual(L.build([], "B2"), []);
});

console.log(`All ${pass} test groups passed.\n`);
LV.forEach(l => { console.log(`[${l}] ` + out[l].map(s => s.en).join(" ")); console.log(`     ` + out[l].map(s => s.vi).join(" ")); });
console.log("\n[B2 extras]", JSON.stringify(L.extras(main, "B2"), null, 1).slice(0, 900));
