import { execSync } from "node:child_process";
import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const root = execSync("npm root -g").toString().trim();
let chromium = null;
try {
  const mod = await import(pathToFileURL(path.join(root, "playwright/index.mjs")).href);
  chromium = mod.chromium;
} catch (e) {}
const dir = path.dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(path.join(dir, "inventory-harness.html")).href;
let fails = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };

if (!chromium) {
  const inv = require("./inventory.js");
  ok(typeof inv.mount === "function", "inventory.mount is function");
  ok(typeof inv.quiz === "function", "inventory.quiz is function");
  ok(typeof inv.normalize === "function", "inventory.normalize is function");
  console.log(fails ? `${fails} FAILED` : "ALL PASSED (data mode)");
  process.exit(fails ? 1 : 0);
}
const browser = await chromium.launch();
for (const [name, vp, shot] of [["desktop", { width: 1100, height: 900 }, "inventory.png"], ["mobile", { width: 390, height: 844 }, "inventory-m.png"]]) {
  const page = await browser.newPage({ viewport: vp }); const errs = [];
  page.on("pageerror", e => errs.push(e.message)); page.on("console", m => m.type() === "error" && errs.push(m.text()));
  await page.goto(url);
  const tiles = () => page.locator(".inv-tile").count();
  const meta = async () => parseInt(await page.locator(".inv-meta").first().textContent());
  ok((await page.locator(".inv-head").textContent()).includes("64 món"), name + " header count");
  ok(await meta() === 60 && await tiles() === 24, name + " living room default 60 results, 24 shown");
  if (name === "desktop") {
    await page.click(".inv-more"); ok(await tiles() === 48, "Xem thêm -> 48");
    await page.click(".inv-more"); ok(await tiles() === 60 && await page.locator(".inv-more").count() === 0, "Xem thêm -> 60, button gone");
    await page.fill(".inv-search", "sofa"); ok(await meta() === 1 && (await page.locator(".inv-en").first().textContent()) === "sofa", "search sofa");
    await page.fill(".inv-search", "ghe"); const vis = await page.locator(".inv-vi").allTextContents();
    ok(vis.length >= 5 && vis.every(v => v.startsWith("ghế")), "search ghe -> ghế items (" + vis.length + ")");
    await page.fill(".inv-search", "tu lanh"); ok(await meta() === 0, "tu lanh not in living room");
    await page.click('[data-room="all"]'); ok(await meta() === 1 && (await page.locator(".inv-vi").first().textContent()) === "tủ lạnh", "tu lanh -> tủ lạnh in Tất cả");
    await page.fill(".inv-search", "dieu hoa"); ok((await page.locator(".inv-en").allTextContents()).includes("air conditioner"), "dieu hoa -> air conditioner");
    await page.fill(".inv-search", "xyzxyz"); ok((await page.locator(".inv-empty").textContent()).includes("Không tìm thấy"), "empty state VI");
    await page.fill(".inv-search", "");
    await page.click('[data-room="kitchen"]'); ok(await meta() === 2, "room filter kitchen");
    await page.click('[data-room="living"]'); await page.click('[data-cat="lighting"]');
    const n = await meta(); ok(n === 6 && await tiles() === 6, "category lighting = 6");
    await page.click('[data-cat="all"]');
    await page.locator('.inv-tile[data-id="tv"] .inv-star').click();
    ok((await page.evaluate(() => LOG.toggle)).join() === "tv", "star toggles");
    ok(await page.locator('.inv-tile[data-id="tv"] .inv-star').getAttribute("aria-pressed") === "true", "star pressed state");
    await page.locator('.inv-tile[data-id="tv"] .inv-go').click();
    ok((await page.evaluate(() => LOG.select)).join() === "tv", "interactive badge -> onSelectInteractive");
    ok(await page.locator(".inv-go").count() === 3, "3 interactive badges on page 1");
    await page.locator('.inv-tile[data-id="sofa"] .inv-say').click();
    ok((await page.evaluate(() => LOG.speak)).includes("sofa"), "speak");
    // keyboard
    await page.locator('[data-room="all"]').focus(); await page.keyboard.press("Enter");
    ok(await page.evaluate(() => document.activeElement.dataset.room) === "all", "keyboard focus kept after Enter");
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
    ok(outline !== "none", "visible focus (" + outline + ")");
    // quiz helper
    const q = await page.evaluate(() => ELW_INVENTORY.quiz(ELW_CATALOG_SAMPLE.catalog, 8));
    ok(q.length === 8 && q.every(x => x.options.length === 4 && new Set(x.options).size === 4 && x.options.filter(o => o === x.answer_en).length === 1), "quiz() 4 unique options, one correct");
  }
  await page.click('[data-tab="quiz"]');
  ok(await page.locator(".inv-qopt").count() === 4, name + " quiz renders 4 options");
  const ans = await page.evaluate(() => { const p = document.querySelector(".inv-qprompt").textContent; return ELW_CATALOG_SAMPLE.catalog.filter(c => c.vi === p).map(c => c.en); });
  const opts = await page.locator(".inv-qopt").allTextContents();
  ok(opts.filter(o => ans.includes(o)).length === 1, name + " exactly one correct option");
  if (name === "mobile") {
    await page.screenshot({ path: path.join(dir, "inventory-m-quiz.png") });
    await page.locator(".inv-qopt", { hasText: new RegExp("^" + ans[0] + "$") }).click();
    ok(await page.locator(".inv-score").textContent() === "1" && await page.locator(".inv-right").count() === 1, "quiz scoring + reveal");
    ok((await page.evaluate(() => LOG.speak)).length === 1, "speak on reveal");
    await page.click('[data-tab="list"]');
  } else await page.click('[data-tab="list"]');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(sw <= 0, name + " no horizontal scroll (" + sw + ")");
  await page.screenshot({ path: path.join(dir, shot), fullPage: name === "desktop" });
  ok(errs.length === 0, name + " no page errors " + errs.join("|"));
  await page.close();
}
await browser.close();
console.log(fails ? fails + " FAILED" : "ALL PASSED"); process.exit(fails ? 1 : 0);
