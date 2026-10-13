// node modules/day.test.js
const assert = require("assert");
const mem = {}; globalThis.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
const D = require("./day.js");
let n = 0; const t = (name, f) => { f(); n++; console.log("ok", name); };

t("time advance", () => {
  D.reset(); D.startDay({ seed: 1 });
  assert.equal(D.clockOf(D.state.minutes), "06:00");
  D.onAction("make_bed"); assert.equal(D.state.minutes, 3);
  D.onAction("cook_rice"); assert.equal(D.state.minutes, 28);
  D.onAction("watch_tv"); assert.equal(D.state.minutes, 58);
  D.onAction("turn_on_tv"); assert.equal(D.state.minutes, 59);
  assert.equal(D.clockOf(D.state.minutes), "06:59");
});
t("phase boundaries", () => {
  assert.equal(D.phaseOfHour(4.9), "night"); assert.equal(D.phaseOfHour(5), "dawn"); assert.equal(D.phaseOfHour(6.99), "dawn");
  assert.equal(D.phaseOfHour(7), "morning"); assert.equal(D.phaseOfHour(11), "noon"); assert.equal(D.phaseOfHour(13.5), "afternoon");
  assert.equal(D.phaseOfHour(17.5), "evening"); assert.equal(D.phaseOfHour(20), "night"); assert.equal(D.phaseOfHour(23.9), "night");
  assert.equal(D.flowBucket("afternoon"), "noon");
});
t("lie_down at night ends the day, not in morning", () => {
  D.reset(); D.startDay({ seed: 1 });
  assert.ok(!D.onAction("lie_down").endOfDay);
  D.state.minutes = 15 * 60; assert.ok(D.onAction("lie_down").endOfDay);
});
t(">=15 quests, 3 daily picks", () => {
  assert.ok(D.QUESTS.length >= 15);
  D.QUESTS.forEach(q => assert.ok(q.en && q.vi && q.goals.length));
  D.reset(); D.startDay({ seed: 2 }); assert.equal(D.state.quests.length, 3);
  assert.ok(D.state.quests.every(q => D.QUESTS.find(x => x.id === q.id).level <= 1));
});
function force(id) { D.state.quests = [{ id, progress: D.QUESTS.find(q => q.id === id).goals.map(() => ({ n: 0, done: [] })), claimed: false }]; return D.state.quests[0]; }
t("doActions with anyOf + all", () => {
  D.reset(); const qs = force("breakfast_en");
  ["fill_kettle", "toast_bread", "fry_egg", "set_the_table", "eat_breakfast"].forEach(a => D.onAction(a));
  assert.equal(qs.progress[0].n, 5); assert.ok(!D.goalDone(D.QUESTS.find(q => q.id === "breakfast_en").goals[0], qs.progress[0]));
  D.onAction("boil_water"); D.onAction("make_coffee"); D.onAction("make_coffee");
  assert.ok(D.goalDone(D.QUESTS.find(q => q.id === "breakfast_en").goals[0], qs.progress[0]));
  D.onAction("sweep_floor"); assert.equal(qs.progress[0].n, 7);
});
t("speak / listen / roleplay / useWords", () => {
  D.reset(); let qs = force("breakfast_en");
  D.onListen(); D.onListen(); D.onListen(); D.onSpeak("I'm boiling water."); D.onSpeak("Hello");
  assert.equal(qs.progress[1].n, 3); assert.equal(qs.progress[2].n, 2);
  qs = force("chat_friend"); D.onRoleplay("hi"); D.onRoleplay(); assert.equal(qs.progress[0].n, 2);
  qs = force("coffee_talk"); D.onSpeak("The coffee is hot."); assert.deepEqual(qs.progress[1].done.sort(), ["coffee", "hot"]);
  D.onSpeak("Give me a cup."); assert.ok(D.goalDone(D.QUESTS.find(q => q.id === "coffee_talk").goals[1], qs.progress[1]));
});
t("claim XP + level up", () => {
  D.reset(); const qs = force("listen_lot");
  assert.equal(D.claim("listen_lot"), null);
  for (let i = 0; i < 5; i++) D.onListen();
  assert.ok(D.questComplete(qs)); const r = D.claim("listen_lot"); assert.equal(r.gained, 20); assert.equal(D.claim("listen_lot"), null);
  const r2 = D.addXp(90); assert.ok(r2.levelUp); assert.equal(r2.level, 2); assert.ok(r2.unlock);
  assert.equal(D.levelOf(299), 2); assert.equal(D.levelOf(300), 3);
});
t("persistence round-trip", () => {
  D.reset(); D.startDay({ seed: 3 }); D.onAction("make_bed"); D.addXp(42);
  const raw = JSON.parse(mem[D.KEY]); assert.equal(raw.v, 1); assert.equal(raw.xp, 42);
  D.state = null; D.load(); assert.equal(D.state.xp, 42); assert.equal(D.state.minutes, 3);
  mem[D.KEY] = "{broken"; D.load(); assert.equal(D.state.xp, 0);
  const bad = globalThis.localStorage; globalThis.localStorage = { getItem() { throw 1 }, setItem() { throw 1 } };
  D.load(); D.save(); globalThis.localStorage = bad;
});
t("diary with fake buildFn", () => {
  D.reset(); D.startDay({ seed: 4, weather: "rainy" });
  const items = [{ uid: 1, id: "make_bed", status: "done" }, { uid: 2, id: "make_coffee", status: "done" }, { uid: 3, id: "x", status: "pending" }];
  let got; const e = D.endOfDay(items, its => { got = its; return { en: "I made my bed. Then I made coffee.", vi: "Tôi dọn giường. Rồi pha cà phê." }; });
  assert.equal(got.length, 2); assert.ok(e.en.startsWith("It rained today.")); assert.ok(e.en.includes("made coffee"));
  assert.ok(e.vi && e.title && /^\d{4}-\d\d-\d\d$/.test(e.date)); assert.ok(D.state.ended);
  D.saveDiary(Object.assign({}, e, { en: "Edited." })); assert.equal(D.state.diaries[0].en, "Edited."); assert.ok(!D.state.pending);
  const e2 = D.endOfDay([], () => { throw new Error("x"); }); assert.ok(e2.en.length > 10);
  D.startDay({ next: true }); assert.equal(D.state.day, 2);
});
t("ambient", () => {
  const a = D.ambient_en("noon", { weather: "rainy" }, () => 0); assert.equal(a.en, "It's pouring outside."); assert.ok(a.vi);
  ["dawn", "morning", "noon", "afternoon", "evening", "night"].forEach(p => D.WEATHERS.forEach(w => assert.ok(D.ambient_en(p, { weather: w }).en)));
});
console.log(n + " tests passed");
