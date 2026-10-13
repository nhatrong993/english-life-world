const assert = require("assert");
const RP = require("./roleplay.js");
const ids = new Set(require("./actions-list.json").actions.map(a => a.id));
const { SCENES, TRIGGERS, CHARACTERS } = RP;
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const trig = Object.keys(TRIGGERS);
ok(trig.length >= 30, "≥30 triggers: " + trig.length);
ok(Object.keys(SCENES).length >= 40, "≥40 scenes");
for (const ch of ["dad","mom","grandpa","tom","lily"]) ok(CHARACTERS[ch] && CHARACTERS[ch].voice && CHARACTERS[ch].avatar, ch);
for (const a of trig) { ok(ids.has(a), "trigger id " + a); for (const s of TRIGGERS[a]) ok(SCENES[s], "scene " + s); }
for (const [id, sc] of Object.entries(SCENES)) {
  ok(/^(A1|A2|B1|B2)$/.test(sc.level) && ["living","kitchen","bedroom"].includes(sc.room) && CHARACTERS[sc.who], id + " meta");
  ok(sc.lines.length >= 3 && sc.lines.length <= 8, id + " length");
  sc.lines.forEach((l, i) => {
    ok(l && CHARACTERS[l.who] && l.en && l.vi, id + " line " + i);
    if (l.action) ok(ids.has(l.action), id + " action");
    if (l.who === "me") {
      ok(l.choices.length >= 2 && l.choices.length <= 3 && l.choices.some(c => c.ok), id + " choices " + i);
      ok(l.expect && l.expect.keywords.length && l.expect.sample_en, id + " expect");
      l.choices.forEach(c => { if (c.action) ok(ids.has(c.action), id + " choice action " + c.action); ok(c.feedback_vi && c.vi, id + " fb"); });
    }
  });
  // reachability: BFS from 0, every reachable state must reach end
  const L = sc.lines, nexts = i => {
    const l = L[i];
    const res = x => x === "end" ? "end" : (x == null ? (i + 1 >= L.length ? "end" : i + 1) : (x >= L.length ? "end" : x));
    if (l.who !== "me") return [res(l.next)];
    return [...l.choices.filter(c => c.ok).map(c => res(c.next)), res(l.expect.next)];
  };
  const seen = new Set([0]), q = [0]; let ends = false;
  while (q.length) { const i = q.shift(); for (const j of nexts(i)) { if (j === "end") { ends = true; continue; } ok(Number.isInteger(j) && j > i, id + " forward edge"); if (!seen.has(j)) { seen.add(j); q.push(j); } } }
  ok(ends, id + " reaches end");
}
// free-answer matching
const free = [["tv_dad",1,"I am watching a movie"],["coffee_mom",1,"yes of course mom"],["feed_cat_lily",1,"sure you can help"],["wake_mom",1,"I slept well thanks"],
  ["kettle_grandpa",1,"of course grandpa"],["alarm_tom",1,"sorry about that"],["set_alarm_dad",1,"at seven"],["window_grandpa",1,"it is cloudy today"],
  ["rice_mom",1,"I used two cups"],["breakfast_mom",1,"it's yummy"],["plant_grandpa",3,"every morning"],["wardrobe_mom",1,"I'll wear my red dress"]];
for (const [s, i, t] of free) ok(RP.matchFree(SCENES[s].lines[i], t).ok, "match " + s + ": " + t);
ok(!RP.matchFree(SCENES.tv_dad.lines[1], "I am eight years old.").ok, "wrong choice text rejected");
ok(!RP.matchFree(SCENES.set_alarm_dad.lines[1], "banana").ok, "nonsense rejected");
ok(!RP.matchFree(SCENES.wake_mom.lines[1], "").ok, "empty rejected");
// cooldown & chance
const always = { random: () => 0 };
ok(RP.shouldTrigger("turn_on_tv", {}, [], always) === "tv_dad", "fires");
ok(RP.shouldTrigger("turn_on_tv", {}, [], { random: () => 0.99 }) === null, "chance gate");
ok(RP.shouldTrigger("open_fridge_x", {}, [], always) === null, "unknown");
ok(RP.shouldTrigger("turn_on_tv", { roleplayRunning: true }, [], always) === null, "running blocks");
const h = ["scene:tv_dad", "a","b","c","d","e","f","g"];
ok(RP.shouldTrigger("turn_on_tv", {}, h, always) === null, "cooldown blocks within 10");
ok(RP.shouldTrigger("turn_on_tv", {}, h.concat(["h","i","j"]), always) === "tv_dad", "cooldown expires");
ok(RP.shouldTrigger("make_coffee", {}, ["x","scene:tv_dad"], always) === null, "no back-to-back scenes");
let fired = 0; for (let i = 0; i < 2000; i++) if (RP.shouldTrigger("make_coffee", {}, [])) fired++;
ok(fired > 1000 && fired < 1400, "~60% rate " + fired);
ok(RP.escape("<b>&") === "&lt;b&gt;&amp;", "escape");
console.log("roleplay tests passed:", n, "assertions,", trig.length, "triggers,", Object.keys(SCENES).length, "scenes");
