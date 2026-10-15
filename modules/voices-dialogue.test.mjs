import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import fs from "node:fs";
const root = execSync("npm root -g").toString().trim();
let chromium = null;
const candidates = [
  path.join(root, "playwright/index.mjs"),
  "C:/Users/Nhat/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs",
  "C:/Users/Nhat/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs"
];
for (const c of candidates) {
  try {
    const mod = await import(pathToFileURL(c).href);
    if (mod && mod.chromium) { chromium = mod.chromium; break; }
  } catch (e) {}
}
const dir = path.dirname(fileURLToPath(import.meta.url));
const url = "file://" + path.join(dir, "dialogue-harness.html");
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };

if (!chromium) {
  const vd = require("./voices-dialogue.js");
  const { ELW_VOICES, ELW_DIALOGUE } = vd;
  ok(ELW_DIALOGUE.SCRIPTS.length >= 8, `${ELW_DIALOGUE.SCRIPTS.length} scripts`);
  const allowed = ELW_DIALOGUE.ALLOWED_ACTIONS;
  const used = ELW_DIALOGUE.SCRIPTS.flatMap(s => s.lines.filter(l => l.action).map(l => l.action));
  ok(used.every(a => allowed.includes(a)), "all action ids allowed: " + [...new Set(used)].length + " distinct");
  const pitches = Object.fromEntries(ELW_VOICES.PROFILES.map(p => [p.id, p.pitch]));
  ok(pitches.child > pitches.adult_female && pitches.adult_female > pitches.adult_male, "child pitch highest");
  console.log(fails ? `${fails} FAILED` : "ALL PASSED (data mode)");
  process.exit(fails ? 1 : 0);
}

const exeFallback = "C:/Users/Nhat/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const browser = await chromium.launch(fs.existsSync(exeFallback) ? { executablePath: exeFallback } : {});
const page = await browser.newPage({ viewport: { width: 900, height: 620 } });
const errors = []; page.on("pageerror", e => errors.push(e.message));
await page.goto(url);

const ids = await page.evaluate(() => ELW_DIALOGUE.SCRIPTS.map(s => s.id));
ok(ids.length >= 8, `${ids.length} scripts`);
const allowed = await page.evaluate(() => ELW_DIALOGUE.ALLOWED_ACTIONS);
const used = await page.evaluate(() => ELW_DIALOGUE.SCRIPTS.flatMap(s => s.lines.filter(l => l.action).map(l => l.action)));
ok(used.every(a => allowed.includes(a)), "all action ids allowed: " + [...new Set(used)].length + " distinct");

const picks = await page.evaluate(() => ["adult_male", "adult_female", "child", "elderly"].map(p => ELW_VOICES.pick(p)?.name));
console.log("  picks", picks);
ok(picks[0] !== picks[1] && /David|Male/.test(picks[0]) && /Zira|Samantha/.test(picks[1]), "male vs female voices differ");
const pitches = await page.evaluate(() => Object.fromEntries(ELW_VOICES.PROFILES.map(p => [p.id, p.pitch])));
ok(pitches.child > pitches.adult_female && pitches.adult_female > pitches.adult_male, "child pitch highest");
ok((await page.evaluate(() => ELW_VOICES.available().length)) === 4, "available() filters English");

let wrongDone = false;
for (const id of ids) {
  const before = await page.evaluate(() => __actions.length);
  await page.evaluate(id => { window.__done = false; player.start(id).then(r => window.__done = r); }, id);
  for (let k = 0; k < 200; k++) {
    if (await page.evaluate(() => __done)) break;
    const n = await page.locator(".dlg-choice:not(:disabled)").count();
    if (n) {
      if (!wrongDone) {
        await page.locator('.dlg-choice[data-correct="0"]').first().click();
        ok((await page.locator(".dlg-fb").textContent()).length > 3, "wrong choice shows feedback");
        wrongDone = true;
        await page.screenshot({ path: path.join(dir, "dialogue.png") });
      }
      await page.locator('.dlg-choice[data-correct="1"]').click();
    }
    await page.waitForTimeout(30);
  }
  const done = await page.evaluate(() => __done);
  const acts = await page.evaluate(b => __actions.slice(b), before);
  ok(done === true, `script ${id} completes (actions: ${acts.join(",")})`);
}
await page.evaluate(() => document.querySelector(".mom").classList.add("talk"));
await page.screenshot({ path: path.join(dir, "dialogue-end.png") });

const p2 = await browser.newPage(); p2.on("pageerror", e => errors.push(e.message));
await p2.goto(url + "?nosynth");
const r = await p2.evaluate(async () => { const t = Date.now(); await ELW_VOICES.speak("Hello there", "child"); return { ms: Date.now() - t, pick: ELW_VOICES.pick("adult_male"), av: ELW_VOICES.available().length }; });
ok(r.ms < 500 && r.pick === null && r.av === 0, "speak resolves w/o speechSynthesis " + JSON.stringify(r));
ok(errors.length === 0, "no page errors " + errors.join("|"));
await browser.close();
console.log(fails ? `${fails} FAILED` : "ALL PASSED"); process.exit(fails ? 1 : 0);
