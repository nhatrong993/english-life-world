const { chromium } = await import("file://" + (process.env.PW || (await import("child_process")).execSync("npm root -g").toString().trim() + "/playwright/index.mjs"));
import fs from "fs";
const code = fs.readFileSync(new URL("./voices-dialogue.js", import.meta.url), "utf8");
const mock = (voices) => `(() => { const V=${JSON.stringify(voices)}.map(([name,lang])=>({name,lang,localService:true,default:false,voiceURI:name}));
 let ls=[]; window.__spoken=[];
 window.SpeechSynthesisUtterance=function(t){this.text=t};
 Object.defineProperty(window,"speechSynthesis",{configurable:true,value:{getVoices:()=>V,cancel(){},speak(u){window.__spoken.push({v:u.voice&&u.voice.name,p:u.pitch,r:u.rate});setTimeout(()=>u.onend&&u.onend(),5)},
  addEventListener(e,f){ls.push(f)}}}); })();`;
const cases = {
  windows: [["Microsoft David - English (United States)","en-US"],["Microsoft Mark - English (United States)","en-US"],["Microsoft Zira - English (United States)","en-US"],["Microsoft Aria Online (Natural) - English (United States)","en-US"],["Microsoft Jenny Online (Natural) - English (United States)","en-US"],["Microsoft Ana Online (Natural) - English (United States)","en-US"],["Microsoft Guy Online (Natural) - English (United States)","en-US"],["Microsoft Ryan Online (Natural) - English (United Kingdom)","en-GB"],["Microsoft Natasha Online (Natural) - English (Australia)","en-AU"],["Microsoft Eric Online (Natural) - English (United States)","en-US"]],
  two: [["Google UK English Male","en-GB"],["Google US English","en-US"]],
  one: [["Google US English","en-US"]],
  none: null };
const ORDER = ["child","young_female","adult_female","young_male","adult_male","elderly"];
const b = await chromium.launch(); let fail = 0;
for (const [k, voices] of Object.entries(cases)) {
  const pg = await b.newPage(); const errs = [];
  pg.on("pageerror", e => errs.push(e.message));
  await pg.setContent("<html><body></body></html>");
  await pg.evaluate(voices ? mock(voices) : 'Object.defineProperty(window,"speechSynthesis",{configurable:true,value:undefined});');
  await pg.addScriptTag({ content: code });
  const r = await pg.evaluate(async (ORDER) => {
    const V = ELW_VOICES, out = {};
    for (const p of V.PROFILES) { out[p.id] = { v: (V.pick(p.id) || {}).name || null, pitch: p.pitch, d: V.describe(p.id) }; await V.speak("hi", p.id); await V.preview(p.id); }
    return out;
  }, ORDER);
  const names = Object.values(r).map(x => x.v), pitches = ORDER.map(id => r[id].pitch);
  const expectDistinct = Math.min(6, voices ? voices.length : 0);
  const ok = errs.length === 0 && new Set(names.filter(Boolean)).size === expectDistinct
    && new Set(pitches).size === 6 && pitches.every((p, i) => i === 0 || pitches[i - 1] > p);
  console.log(k, ok ? "PASS" : "FAIL", JSON.stringify(Object.fromEntries(Object.entries(r).map(([a, x]) => [a, x.d]))), errs);
  if (!ok) fail++;
}
await b.close(); process.exit(fail ? 1 : 0);
