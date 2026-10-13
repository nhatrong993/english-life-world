import { chromium } from "/home/claude/.npm-global/lib/node_modules/playwright/index.mjs";
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = []; p.on("pageerror", e => errs.push(e.message)); p.on("console", m => m.type()==="error" && errs.push(m.text()));
await p.goto("file:///mnt/user-data/outputs/english-life-world/modules/roleplay-harness.html");
async function play(id, mode) {
  await p.evaluate(id => player.start(id), id);
  for (let k = 0; k < 20; k++) {
    if (!(await p.evaluate(() => player.isRunning()))) break;
    const c = p.locator(".rp-choice");
    if (await c.count() === 0) { await p.waitForTimeout(60); continue; }
    if (mode === "free") {
      const sample = await p.evaluate(() => { const l = [...document.querySelectorAll(".rp-choice")]; return l[0].firstChild.textContent; });
      await p.fill(".rp-input", "banana");
      await p.press(".rp-input", "Enter");
      if (!(await p.locator(".rp-fb.rp-bad").count())) throw "no hint for wrong free";
      await p.click(".rp-hint");
      await p.fill(".rp-input", sample.replace(/[.!]/g, "").toLowerCase());
      await p.press(".rp-input", "Enter");
    } else {
      const t = await c.allTextContents(); const bad = await p.evaluate(t => { for (const s of Object.values(ELW_ROLEPLAY.SCENES)) for (const l of s.lines) if (l.choices) for (const ch of l.choices) if (!ch.ok && t.some(x => x.startsWith(ch.en))) return t.findIndex(x => x.startsWith(ch.en)); return -1; }, t); if (bad >= 0) { await c.nth(bad).click(); if (!(await p.locator(".rp-fb.rp-bad").count())) throw "no feedback"; }
      await c.first().click();
    }
    await p.waitForTimeout(120);
  }
  if (await p.evaluate(() => player.isRunning())) throw "scene stuck " + id;
}
for (const s of ["tv_dad", "coffee_mom", "feed_cat_lily"]) await play(s, "choice");
for (const s of ["wake_mom", "kettle_grandpa"]) await play(s, "free");
const ended = await p.evaluate(() => ended.map(e => e[0]));
const enq = await p.evaluate(() => enqueued);
// final screenshot mid-scene
await p.evaluate(() => player.start("sofa_grandpa")); await p.waitForTimeout(300);
await p.locator(".rp-hint").click();
const ow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
await p.screenshot({ path: "/mnt/user-data/outputs/english-life-world/modules/roleplay.png", fullPage: true });
console.log({ ended, enq, overflow: ow, errs }); await b.close();
