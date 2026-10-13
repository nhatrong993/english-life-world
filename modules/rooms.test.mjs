// Run: node rooms.test.mjs   (uses globally installed playwright)
import { createRequire } from "module";
import { execSync } from "child_process";
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const pwPath = path.join(execSync("npm root -g").toString().trim(), "playwright/index.mjs");
const { chromium } = await import(pwPath);
const require = createRequire(import.meta.url);
const { ELW_ROOMS, ELW_ROOMS_CATALOG_LIVING } = require("./rooms.js");
const index = fs.readFileSync(path.join(here, "../index.html"), "utf8");

let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log("FAIL:", m); } };
const OPS = new Set(["walk", "pose", "wait", "set", "spawn", "despawn", "sit", "stand", "fx", "face", "activity"]);
const POSES = new Set(["reach", "bend", "drink", "pour", "sweep", "wipe", "water", "point", "idle"]);
const existingIds = new Set([...index.matchAll(/\bA\("([a-z_]+)"/g)].map(m => m[1]));
ok(existingIds.size >= 20, "parsed existing action ids from index.html");
const existingObj = new Set([...index.matchAll(/data-obj="([a-z]+)"/g)].map(m => m[1]));
const viRe = /[ăâđêôơưàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i;
const allIds = new Set();
for (const [rid, R] of Object.entries(ELW_ROOMS)) {
  const W0 = { ...R.W0, sitting: false, hand: null, activity: null };
  for (const k of Object.keys(R.W0)) ok(k.startsWith(rid[0] + "_"), `${rid} key prefix ${k}`);
  const nObj = Object.keys(R.objects).length; ok(nObj >= 10 && nObj <= 12, `${rid} object count ${nObj}`);
  for (const o of Object.keys(R.objects)) ok(!existingObj.has(o), `${rid} obj ${o} clashes with living room`);
  for (const [oid, o] of Object.entries(R.objects)) for (const a of o.acts) ok(R.actions.some(x => x.id === a && (x.obj === oid || true)), `${rid} ${oid} act ${a} exists`);
  ok(R.catalog.length >= 50, `${rid} catalog ${R.catalog.length}`);
  for (const a of R.actions) {
    ok(!allIds.has(a.id), `duplicate action id ${a.id}`); allIds.add(a.id);
    ok(!existingIds.has(a.id), `action id ${a.id} clashes with index.html`);
    ok(R.objects[a.obj], `${a.id} obj ${a.obj} exists`);
    ok(R.objects[a.obj] && R.objects[a.obj].acts.includes(a.id), `${a.id} listed under its object`);
    ok(a.disc.opts.length === 3 && a.disc.opts.includes(a.disc.ans), `${a.id} disc`);
    ok(a.patterns.length === 2 && a.story.length === 3 && a.vocab.length > 0, `${a.id} fields`);
    ok(/^I'm .+\.$/.test(a.sentence), `${a.id} sentence present continuous`);
    // test pre/seq on W0 and on a few states
    for (const W of [W0, { ...W0, sitting: true }]) {
      const p = a.pre(W); ok(p === null || (typeof p === "string" && viRe.test(p)), `${a.id} pre -> ${p}`);
      const s = a.seq({ ...W });
      ok(Array.isArray(s) && s.length > 0, `${a.id} seq array`);
      for (const st of s) {
        ok(Array.isArray(st) && OPS.has(st[0]), `${a.id} op ${st && st[0]}`);
        if (st[0] === "walk" || st[0] === "face") ok(R.spots[st[1]], `${a.id} spot ${st[1]}`);
        if (st[0] === "pose") ok(POSES.has(st[1]), `${a.id} pose ${st[1]}`);
        if (st[0] === "set") ok(st[1] in R.W0, `${a.id} sets unknown key ${st[1]}`);
        if (st[0] === "spawn") ok(R.props && R.props[st[1]], `${a.id} prop ${st[1]}`);
      }
    }
  }
  for (const [n, s] of Object.entries(R.spots)) ok(s.y >= 360 && s.y <= 620 && Math.abs(s.d) === 1, `${rid} spot ${n}`);
}
ok(ELW_ROOMS_CATALOG_LIVING.length >= 50, "living catalog");

// ---- browser render ----
const charSvg = (index.match(/<g id="char"[\s\S]*?<\/g>\s*<\/g><\/g>\s*<\/g>\s*<\/g>/) || [""])[0];
const baseCss = index.match(/<style>([\s\S]*?)<\/style>/)[1];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
const errs = []; page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
await page.goto("file://" + path.join(here, "rooms-harness.html"));
await page.evaluate(css => { document.getElementById("baseCss").textContent = css + "\n.tag{opacity:1}"; }, baseCss);
const mut = {
  kitchen: { k_stove: "on", k_pan: "egg", k_kettle: "boiling", k_rice: "cooking", k_micro: "open", k_food: "hot", k_faucet: "on", k_dishes: "wet", k_cabinet: "open", k_toaster: "done", k_coffee: "ready", k_mug: "coffee", k_trash: "ready", k_table: "set", k_riceBowl: "table", k_toast: "table" },
  bedroom: { b_alarm: "set", b_lying: true, b_pillow: "fluffed", b_blanket: "spread", b_wardrobe: "open", b_shirt: "bed", b_lamp: "on", b_curtains: "open", b_clothes: "basket", b_slippers: "on", b_phone: "charging" }
};
const charAt = { kitchen: [455, 394, 1], bedroom: [372, 470, -1] };
for (const [rid, R] of Object.entries(ELW_ROOMS)) {
  for (const [label, W] of [["init", { ...R.W0, sitting: false }], ["mut", { ...R.W0, ...mut[rid], sitting: rid === "bedroom" }]]) {
    const [x, y, d] = charAt[rid]; const sc = (0.95 + (y - 330) / 310 * 0.5) * 1.25;
    const ch = charSvg.replace(/transform="translate\(560,420\)"/, `transform="translate(${x},${y}) scale(${sc})"`).replace('data-base="420"', `data-base="${y}"`).replace('class="idle"', `class="${W.sitting ? "sit" : "idle"}"`).replace('<g id="flip">', `<g id="flip" transform="scale(${d},1)">`);
    await page.evaluate(([id, W, c]) => window.renderRoom(id, W, c), [rid, W, ch]);
    const missing = await page.evaluate(ids => ids.filter(i => !document.getElementById("o-" + i)), Object.keys(R.objects));
    ok(missing.length === 0, `${rid} missing elements ${missing}`);
    const det = await page.evaluate(() => { const els = [...document.querySelectorAll("#room [data-detail]")]; return { names: [...new Set(els.map(e => e.dataset.detail))], inObj: els.filter(e => e.closest(".obj") && !e.closest(".obj").querySelector(".hit")).map(e => e.dataset.detail), hidden: els.filter(e => { const b = e.getBBox(); return b.width < 1 || b.height < 1; }).map(e => e.dataset.detail) }; });
    ok(det.names.length >= 50, `${rid} distinct details ${det.names.length}`);
    ok(det.inObj.length === 0, `${rid} details inside obj without hit area: ${det.inObj}`);
    ok(det.hidden.length === 0, `${rid} invisible details: ${det.hidden}`);
    if (label === "init") console.log(rid, "details:", det.names.length);
    // every spot must be outside obstacles
    for (const [n, sp] of Object.entries(R.spots)) ok(!R.obstacles.some(o => sp.x > o.x1 && sp.x < o.x2 && sp.y > o.y1 && sp.y < o.y2), `${rid} spot ${n} inside obstacle`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(here, `${rid}${label === "init" ? "" : "-state"}.png`) });
  }
}
ok(errs.length === 0, "JS errors: " + errs.join(" | "));
ok(charSvg.length > 100, "character extracted");
await browser.close();
console.log(fails ? `${fails} FAILURES` : `ALL PASSED (${allIds.size} actions)`);
process.exit(fails ? 1 : 0);
