const { chromium } = await import(process.env.PWROOT + "/playwright/index.mjs");
import path from "path"; const dir = path.resolve("modules");
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 760 } });
const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto("file://" + path.resolve("index.html")); await p.waitForTimeout(800);
await p.addScriptTag({ path: path.join(dir, "day.js") });
await p.evaluate(() => { const h = document.createElement("div"); h.id = "dayHudTest"; document.body.prepend(h); ELW_DAY.reset(); ELW_DAY.startDay({ seed: 1, weather: "sunny" }); ELW_DAY.renderHud(h, {});  });
for (const [ph, wx] of [["morning", "sunny"], ["evening", "sunny"], ["night", "sunny"], ["noon", "rainy"]]) {
  await p.evaluate(([ph, wx]) => { ELW_DAY.state.weather = wx; ELW_DAY.applyLighting(document.getElementById("room"), ph, { weather: wx }); }, [ph, wx]);
  await p.waitForTimeout(1400);
  await p.locator("#room").screenshot({ path: path.join(dir, `day-${wx === "rainy" ? "rain" : ph}.png`) });
}
const hit = await p.evaluate(() => { document.getElementById("room").scrollIntoView(); return [...document.querySelectorAll("#world .obj")].filter(o=>getComputedStyle(o).display!=="none").map(o => { const r = o.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return o.id + ":" + (e && e.closest("#dayFx") ? "OVERLAY" : e && o.contains(e) ? "ok" : (e && e.tagName)); }).join(" ") + " fxCount=" + document.querySelectorAll("#dayFx").length; });
console.log(JSON.stringify(hit), errs);
await b.close();
