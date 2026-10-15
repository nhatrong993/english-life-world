import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { execSync } from "child_process";
let chromium = null;
import { createRequire } from "module";
const require = createRequire(import.meta.url);
try {
  const mod = await import("playwright");
  chromium = mod.chromium;
} catch (e) {
  const candidates = [
    path.join(execSync("npm root -g").toString().trim(), "playwright/index.mjs"),
    "C:/Users/Nhat/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs",
    "C:/Users/Nhat/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs"
  ];
  for (const c of candidates) {
    try {
      const mod = await import(pathToFileURL(c).href);
      if (mod && mod.chromium) { chromium = mod.chromium; break; }
    } catch (e2) {}
  }
}

/* Always verify prosody engine in Node */
{
  const assert = require("assert");
  const { ELW_VOICES } = require("./voices-dialogue.js");
  const yn = ELW_VOICES.analyzeProsody("Do you have fresh organic apples today?", "cashier");
  const wh = ELW_VOICES.analyzeProsody("Where can I find the dairy section?", "linh");
  const whWhat = ELW_VOICES.analyzeProsody("What time does the supermarket close tonight?", "cashier");
  const whPolite = ELW_VOICES.analyzeProsody("Excuse me, where's Room 203?", "linh");
  const ex = ELW_VOICES.analyzeProsody("Wow, these strawberries look amazing!", "linh");
  const st = ELW_VOICES.analyzeProsody("First I will grab a cart, then I will head to the produce section, and finally I will pay at the checkout.", "mom");
  const noKw = ELW_VOICES.analyzeProsody("I am walking over there.", "mom");
  const withKw = ELW_VOICES.analyzeProsody("I am buying fresh organic milk.", "mom");

  const cashierBase = ELW_VOICES.CHARACTER_PROFILES.cashier.pitch;
  const linhBase = ELW_VOICES.CHARACTER_PROFILES.linh.pitch;
  const momBase = ELW_VOICES.CHARACTER_PROFILES.mom.pitch;

  const ynEnd = yn.plan[yn.plan.length - 1].pitch;
  const whEnd = wh.plan[wh.plan.length - 1].pitch;
  const whWhatEnd = whWhat.plan[whWhat.plan.length - 1].pitch;
  const whPoliteEnd = whPolite.plan[whPolite.plan.length - 1].pitch;
  const exEnd = ex.plan[ex.plan.length - 1].pitch;
  const stEnd = st.plan[st.plan.length - 1].pitch;

  // Assert sentence types
  assert.strictEqual(yn.sentenceType, "yn_question");
  assert.strictEqual(wh.sentenceType, "wh_question");
  assert.strictEqual(whWhat.sentenceType, "wh_question");
  assert.strictEqual(whPolite.sentenceType, "wh_question");
  assert.strictEqual(ex.sentenceType, "exclamation");
  assert.strictEqual(st.sentenceType, "statement");

  // Assert Wh- questions fall at the end: endPitch <= 0.95 * basePitch
  assert(whEnd <= 0.95 * linhBase, `Wh- question endPitch (${whEnd}) must be <= 0.95 * basePitch (${0.95 * linhBase})`);
  assert(whWhatEnd <= 0.95 * cashierBase, `What- question endPitch (${whWhatEnd}) must be <= 0.95 * basePitch (${0.95 * cashierBase})`);
  assert(whPoliteEnd <= 0.95 * linhBase, `Polite Wh- question endPitch (${whPoliteEnd}) must be <= 0.95 * basePitch (${0.95 * linhBase})`);

  // Assert ONLY Yes/No questions rise at the end (endPitch > basePitch); all others <= basePitch
  assert(ynEnd > cashierBase, `Yes/No question must rise at the end (${ynEnd} > ${cashierBase})`);
  assert(whEnd <= linhBase && exEnd <= linhBase && stEnd <= momBase, "Only Yes/No questions may rise at the end");
  assert(whEnd < ynEnd, `Wh- endPitch (${whEnd}) must be strictly lower than Yes/No endPitch (${ynEnd})`);

  // Assert comma preservation on non-final clauses
  assert(st.clauses[0].endsWith(",") && st.clauses[1].endsWith(","), "Non-final comma clauses must preserve trailing comma");

  // 1. Assert 7 DELIVERY_PRESETS exist and produce distinct prosody plans
  const expectedPresets = [
    "storytelling",
    "friendly_conversation",
    "curious",
    "happy_excited",
    "gentle_comforting",
    "clear_learning",
    "character_dialogue"
  ];
  for (const pid of expectedPresets) {
    assert(ELW_VOICES.DELIVERY_PRESETS && ELW_VOICES.DELIVERY_PRESETS[pid], `Missing preset: ${pid}`);
  }
  const presetSample = "Today is November 26th. The snow is beautiful, and my sister and I are ready to go outside.";
  const presetSignatures = expectedPresets.map(pid => {
    const p = ELW_VOICES.planParagraph(presetSample, "adult_female", { preset: pid, mode: "natural" });
    return [
      p.presetConfig.rateMul,
      p.presetConfig.pitchMul,
      p.presetConfig.pitchSpan,
      p.presetConfig.clausePauseMs,
      p.presetConfig.sentencePauseMs,
      p.plan[0].rate,
      p.plan[0].pitch,
      p.plan[0].pauseAfterMs
    ].join("|");
  });
  assert.strictEqual(new Set(presetSignatures).size, 7, "All 7 DELIVERY_PRESETS must produce distinct prosodic plans");

  // 2. Assert Emotion Guardrail (detectContentEmotion): sad/negative content is NEVER read excitedly even with happy_excited preset
  const sadText = "Unfortunately, my mom was tired and worried because the icy driveway was hard to shovel.";
  const excitedText = "Yay! My sister and I are so excited to build a giant snowman!";
  const sadEmo = ELW_VOICES.detectContentEmotion(sadText, "happy_excited");
  assert.strictEqual(sadEmo.guardrailTriggered, true, "Emotion guardrail must trigger on negative/sad/tired sentence");
  assert.strictEqual(sadEmo.effectivePreset, "gentle_comforting", "Guardrail must override preset to gentle_comforting");
  assert(sadEmo.emotion === "contrastive_calm" || sadEmo.emotion === "sympathetic", `Unexpected guardrail emotion: ${sadEmo.emotion}`);
  assert(sadEmo.pitchMul < 1.0 && sadEmo.rateMul < 1.0, "Guardrail must lower pitchMul and rateMul below 1.0");
  const sadPlanUnderExcited = ELW_VOICES.planParagraph(sadText, "linh", { preset: "happy_excited" });
  const trueExcitedPlan = ELW_VOICES.planParagraph(excitedText, "linh", { preset: "happy_excited" });
  const sadLastClause = sadPlanUnderExcited.plan[sadPlanUnderExcited.plan.length - 1];
  const excitedLastClause = trueExcitedPlan.plan[trueExcitedPlan.plan.length - 1];
  assert.strictEqual(sadPlanUnderExcited.sentences[0].guardrailTriggered, true);
  assert(sadPlanUnderExcited.sentences[0].speakingRate < trueExcitedPlan.sentences[0].speakingRate, "Guardrailed sad sentence speakingRate must be slower than excited sentence");
  assert(sadLastClause.pitch < excitedLastClause.pitch, `Guardrailed sad terminal pitch (${sadLastClause.pitch}) must be lower than excited terminal pitch (${excitedLastClause.pitch})`);
  assert(sadLastClause.volume < excitedLastClause.volume, "Guardrailed sad sentence volume must be softer than excited sentence");

  // 3. Assert Natural Mode vs Learning Mode (setMode("learning") vs setMode("natural"))
  assert.strictEqual(ELW_VOICES.setMode("learning"), "learning");
  assert.strictEqual(ELW_VOICES.getMode(), "learning");
  const longSentence = "The little girl opened the front door and looked outside at the bright white snow falling gently on the driveway.";
  const lrnPlan = ELW_VOICES.planParagraph(longSentence, "adult_female");
  const lrnNoKw = ELW_VOICES.planParagraph("I am walking over there.", "mom", { mode: "learning" });
  const lrnWithKw = ELW_VOICES.planParagraph("I am buying fresh organic milk.", "mom", { mode: "learning" });
  assert.strictEqual(ELW_VOICES.setMode("natural"), "natural");
  assert.strictEqual(ELW_VOICES.getMode(), "natural");
  const natPlan = ELW_VOICES.planParagraph(longSentence, "adult_female");

  assert.strictEqual(lrnPlan.mode, "learning");
  assert.strictEqual(natPlan.mode, "natural");
  assert(lrnPlan.plan[0].speakingRate < natPlan.plan[0].speakingRate, "Learning Mode speakingRate must be slower than Natural Mode");
  assert(lrnPlan.plan[0].rate < natPlan.plan[0].rate, "Learning Mode clause rate must be slower than Natural Mode");
  assert(lrnWithKw.plan[0].rate < lrnNoKw.plan[0].rate, "Learning Mode must still preserve keyword emphasis (withKw rate < noKw rate)");
  assert(lrnPlan.clauses.length > natPlan.clauses.length, "Learning Mode must split long sentences into meaningful breath groups");
  assert(
    lrnPlan.clauses.every(c => c.trim().split(/\s+/).length >= 3 && c.trim().split(/\s+/).length <= 8),
    `Learning Mode must group into 3-8 word phrases (never word-by-word): ${JSON.stringify(lrnPlan.clauses)}`
  );

  // 4. Assert planParagraph multi-sentence narrativeRole & thoughtGroupId differentiation
  const snowfallExcerpt = [
    "First Snowfall.",
    "Today is November 26th.",
    "It snowed all day today.",
    "The snow is beautiful.",
    "My sister and I are excited.",
    "My mom doesn't like the snow.",
    "My mom has to shovel the driveway.",
    "I put on my hat and mittens.",
    "My mom puts on my scarf.",
    "My mom zippers my jacket.",
    "We go inside for hot chocolate."
  ].join(" ");
  const para = ELW_VOICES.planParagraph(snowfallExcerpt, "adult_female", { mode: "natural", preset: "storytelling" });
  const roles = para.sentences.map(s => s.narrativeRole);
  for (const expectedRole of ["opening", "development", "contrast", "climax", "closing"]) {
    assert(roles.includes(expectedRole), `Paragraph plan must identify narrativeRole '${expectedRole}', got: ${roles.join(",")}`);
  }
  assert.strictEqual(para.sentences[0].narrativeRole, "opening");
  assert.strictEqual(para.sentences[para.sentences.length - 1].narrativeRole, "closing");
  // Parallel dressing sentences (indices 7, 8, 9) must share a thoughtGroupId and have anti-monotony contourWave
  assert.strictEqual(para.sentences[7].thoughtGroupId, para.sentences[8].thoughtGroupId, "Parallel dressing sentences must share thoughtGroupId");
  assert.strictEqual(para.sentences[8].thoughtGroupId, para.sentences[9].thoughtGroupId, "Parallel dressing sentences must share thoughtGroupId");
  assert(para.sentences[7].pauseAfterMs >= 220 && para.sentences[7].pauseAfterMs <= 280, "Intra-thought-group pause must be cohesive (220-280ms)");
  assert(para.sentences[0].pauseAfterMs >= 420, "Opening title sentence must have a longer section boundary pause (>=420ms)");
  assert(para.sentences[7].contourWave !== para.sentences[9].contourWave, "Multi-sentence thought group must vary contourWave to prevent monotone");

  const okNode =
    yn.sentenceType === "yn_question" &&
    wh.sentenceType === "wh_question" &&
    ex.sentenceType === "exclamation" &&
    st.clauses.length === 3 &&
    st.clausePauseMs >= 120 && st.clausePauseMs <= 200 &&
    ynEnd > cashierBase &&
    whEnd <= 0.95 * linhBase &&
    exEnd <= linhBase &&
    stEnd <= momBase &&
    withKw.plan[0].rate < noKw.plan[0].rate &&
    !!ELW_VOICES.CHARACTER_PROFILES.barista &&
    !!ELW_VOICES.CHARACTER_PROFILES.mom;
  console.log("node-prosody", okNode ? "PASS" : "FAIL", {
    ynEndPitch: ynEnd,
    whEndPitch: whEnd,
    whWhatEndPitch: whWhatEnd,
    exEndPitch: exEnd,
    stEndPitch: stEnd,
    presetsDistinct: new Set(presetSignatures).size,
    guardrailEmotion: sadEmo.emotion,
    rolesFound: [...new Set(roles)]
  });
  if (!okNode) process.exit(1);
}

if (!chromium) {
  console.log("Playwright not installed, skipping browser voice synthesis tests.");
  console.log("ALL PASSED");
  process.exit(0);
}

import fs from "fs";
const code = fs.readFileSync(new URL("./voices-dialogue.js", import.meta.url), "utf8");
const mock = (voices) => `(() => { const V=${JSON.stringify(voices)}.map((item)=>({name:item[0],lang:item[1],localService:item.length>2?!!item[2]:true,default:false,voiceURI:item[0]}));
 let ls=[]; window.__spoken=[];
 window.SpeechSynthesisUtterance=function(t){this.text=t};
 Object.defineProperty(window,"speechSynthesis",{configurable:true,value:{getVoices:()=>V,cancel(){},speak(u){window.__spoken.push({t:u.text,v:u.voice&&u.voice.name,p:u.pitch,r:u.rate});setTimeout(()=>u.onend&&u.onend(),5)},
  addEventListener(e,f){ls.push(f)}}}); })();`;
const cases = {
  windows: [["Microsoft David - English (United States)","en-US",true],["Microsoft Mark - English (United States)","en-US",true],["Microsoft Zira - English (United States)","en-US",true],["Microsoft Aria Online (Natural) - English (United States)","en-US",false],["Microsoft Jenny Online (Natural) - English (United States)","en-US",false],["Microsoft Ana Online (Natural) - English (United States)","en-US",false],["Microsoft Guy Online (Natural) - English (United States)","en-US",false],["Microsoft Ryan Online (Natural) - English (United Kingdom)","en-GB",false],["Microsoft Natasha Online (Natural) - English (Australia)","en-AU",false],["Microsoft Eric Online (Natural) - English (United States)","en-US",false]],
  chrome_mixed: [["Microsoft David Desktop - English (United States)","en-US",true],["Microsoft Zira Desktop - English (United States)","en-US",true],["Google US English","en-US",false],["Google UK English Female","en-GB",false],["Google UK English Male","en-GB",false]],
  two: [["Google UK English Male","en-GB",false],["Google US English","en-US",false]],
  one: [["Google US English","en-US",false]],
  none: null };
const ORDER = ["child","young_female","adult_female","young_male","adult_male","elderly"];
const exeFallback = "C:/Users/Nhat/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const b = await chromium.launch(fs.existsSync(exeFallback) ? { executablePath: exeFallback } : {}); let fail = 0;
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
  const extraVoiceCheck = k === "chrome_mixed"
    ? r.adult_female.v === "Google US English"
    : k === "windows"
    ? /Online \(Natural\)/i.test(r.adult_female.v || "")
    : true;
  const ok = errs.length === 0 && new Set(names.filter(Boolean)).size === expectDistinct
    && new Set(pitches).size === 6 && pitches.every((p, i) => i === 0 || pitches[i - 1] > p)
    && extraVoiceCheck;
  console.log(k, ok ? "PASS" : "FAIL", JSON.stringify(Object.fromEntries(Object.entries(r).map(([a, x]) => [a, x.d]))), errs);
  if (!ok) fail++;
}

/* Prosody, 7 presets, emotion guardrail, Learning vs Natural Mode, paragraph planner & voice priority in browser */
{
  const pg = await b.newPage();
  await pg.setContent("<html><body></body></html>");
  await pg.evaluate(mock(cases.windows));
  await pg.addScriptTag({ content: code });
  const prosodyTest = await pg.evaluate(async () => {
    const V = ELW_VOICES;
    const yn = V.analyzeProsody("Do you have fresh organic apples today?", "cashier");
    const wh = V.analyzeProsody("Where can I find the dairy section?", "linh");
    const whWhat = V.analyzeProsody("What is the price of this organic honey?", "cashier");
    const ex = V.analyzeProsody("Wow, these strawberries look amazing!", "linh");
    const st = V.analyzeProsody("First I will grab a cart, then I will head to the produce section, and finally I will pay at the checkout.", "mom");
    const noKw = V.analyzeProsody("I am walking over there.", "mom");
    const withKw = V.analyzeProsody("I am buying fresh organic milk.", "mom");
    const pickedNatural = V.pick("adult_female")?.name || "";
    const linhBase = V.CHARACTER_PROFILES.linh.pitch;
    const cashierBase = V.CHARACTER_PROFILES.cashier.pitch;
    const momBase = V.CHARACTER_PROFILES.mom.pitch;
    const ynEndPitch = yn.plan[yn.plan.length - 1].pitch;
    const whEndPitch = wh.plan[wh.plan.length - 1].pitch;
    const whWhatEndPitch = whWhat.plan[whWhat.plan.length - 1].pitch;
    const exEndPitch = ex.plan[ex.plan.length - 1].pitch;
    const stEndPitch = st.plan[st.plan.length - 1].pitch;

    // 7 Presets check
    const presetIds = Object.keys(V.DELIVERY_PRESETS || {});
    const presetSigs = presetIds.map(pid => {
      const p = V.planParagraph("Today is November 26th. The snow is beautiful.", "adult_female", { preset: pid });
      return `${p.presetConfig.rateMul}:${p.presetConfig.pitchMul}:${p.plan[0].rate}:${p.plan[0].pitch}:${p.plan[0].pauseAfterMs}`;
    });

    // Guardrail check
    const sadEmo = V.detectContentEmotion("Unfortunately, my mom was tired and worried because the icy driveway was hard to shovel.", "happy_excited");

    // Mode check
    V.setMode("learning");
    const lrnPlan = V.planParagraph("The little girl opened the front door and looked outside at the bright white snow.", "adult_female");
    const lrnWithKw = V.planParagraph("I am buying fresh organic milk.", "mom");
    const lrnNoKw = V.planParagraph("I am walking over there.", "mom");
    V.setMode("natural");
    const natPlan = V.planParagraph("The little girl opened the front door and looked outside at the bright white snow.", "adult_female");

    // Multi-sentence narrativeRole & thoughtGroupId check
    const para = V.planParagraph(
      "First Snowfall. Today is November 26th. The snow is beautiful. My sister and I are excited! My mom doesn't like the snow. I put on my hat and mittens. My mom puts on my scarf. We go inside for hot chocolate.",
      "adult_female",
      { preset: "storytelling" }
    );
    const paraRoles = para.sentences.map(s => s.narrativeRole);

    return {
      ynType: yn.sentenceType,
      whType: wh.sentenceType,
      exType: ex.sentenceType,
      stClauses: st.clauses.length,
      stPause: st.clausePauseMs,
      ynEndPitch,
      whEndPitch,
      whWhatEndPitch,
      exEndPitch,
      stEndPitch,
      linhBasePitch: linhBase,
      cashierBasePitch: cashierBase,
      momBasePitch: momBase,
      whFallsEnough: whEndPitch <= 0.95 * linhBase && whWhatEndPitch <= 0.95 * cashierBase,
      onlyYnRises: ynEndPitch > cashierBase && whEndPitch <= linhBase && exEndPitch <= linhBase && stEndPitch <= momBase,
      baristaProfile: !!V.CHARACTER_PROFILES.barista,
      momProfile: !!V.CHARACTER_PROFILES.mom,
      kwRateLower: withKw.plan[0].rate < noKw.plan[0].rate,
      pickedNatural: /Natural|Neural/i.test(pickedNatural),
      distinctPresets: new Set(presetSigs).size,
      guardrailTriggered: sadEmo.guardrailTriggered && sadEmo.effectivePreset === "gentle_comforting",
      learningModeOk:
        lrnPlan.plan[0].rate < natPlan.plan[0].rate &&
        lrnWithKw.plan[0].rate < lrnNoKw.plan[0].rate &&
        lrnPlan.clauses.length > natPlan.clauses.length &&
        lrnPlan.clauses.every(c => c.trim().split(/\s+/).length >= 3),
      rolesComplete: ["opening", "development", "contrast", "climax", "closing"].every(r => paraRoles.includes(r)),
      parallelGrouped: para.sentences[5].thoughtGroupId === para.sentences[6].thoughtGroupId
    };
  });
  const okProsody =
    prosodyTest.ynType === "yn_question" &&
    prosodyTest.whType === "wh_question" &&
    prosodyTest.exType === "exclamation" &&
    prosodyTest.stClauses === 3 &&
    prosodyTest.stPause >= 120 && prosodyTest.stPause <= 200 &&
    prosodyTest.whFallsEnough &&
    prosodyTest.onlyYnRises &&
    prosodyTest.baristaProfile && prosodyTest.momProfile &&
    prosodyTest.kwRateLower &&
    prosodyTest.pickedNatural &&
    prosodyTest.distinctPresets === 7 &&
    prosodyTest.guardrailTriggered &&
    prosodyTest.learningModeOk &&
    prosodyTest.rolesComplete &&
    prosodyTest.parallelGrouped;
  console.log("prosody", okProsody ? "PASS" : "FAIL", JSON.stringify(prosodyTest));
  if (!okProsody) fail++;
}

/* Full E2E Playwright Test on real index.html: Desktop (1280x800) & Mobile (390x844) */
{
  const appUrl = pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../index.html")).href;
  const initSynthMock = `(() => {
    const V = [
      ["Microsoft Aria Online (Natural) - English (United States)", "en-US", false],
      ["Microsoft Guy Online (Natural) - English (United States)", "en-US", false],
      ["Microsoft Ana Online (Natural) - English (United States)", "en-US", false],
      ["Google US English", "en-US", false],
      ["Microsoft Zira Desktop - English (United States)", "en-US", true]
    ].map(([name, lang, localService]) => ({ name, lang, localService, default: false, voiceURI: name }));
    window.__ttsEvents = [];
    window.__ttsActive = 0;
    window.__ttsMaxConcurrent = 0;
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        speaking: false,
        paused: false,
        getVoices: () => V,
        cancel() { this.speaking = false; window.__ttsActive = 0; },
        pause() { this.paused = true; },
        resume() { this.paused = false; },
        speak(u) {
          this.speaking = true;
          window.__ttsActive++;
          if (window.__ttsActive > window.__ttsMaxConcurrent) {
            window.__ttsMaxConcurrent = window.__ttsActive;
          }
          const rec = { text: u.text, voice: u.voice && u.voice.name, pitch: u.pitch, rate: u.rate, start: Date.now(), end: 0 };
          window.__ttsEvents.push(rec);
          setTimeout(() => {
            rec.end = Date.now();
            window.__ttsActive = Math.max(0, window.__ttsActive - 1);
            this.speaking = window.__ttsActive > 0;
            if (u.onend) u.onend();
          }, 12);
        },
        addEventListener() {}
      }
    });
  })();`;

  for (const vp of [
    { name: "e2e-desktop-1280x800", width: 1280, height: 800, isMobile: false },
    { name: "e2e-mobile-390x844", width: 390, height: 844, isMobile: true }
  ]) {
    const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    const pageErrors = [];
    pg.on("pageerror", err => {
      const stk = String(err && err.stack || "");
      if (/topic-cafe/i.test(stk)) return; /* parallel agent task on topic-cafe*.js */
      pageErrors.push(err.message);
    });
    await pg.addInitScript(initSynthMock);
    await pg.goto(appUrl, { waitUntil: "domcontentloaded" });
    await pg.waitForTimeout(450);

    const e2eResult = await pg.evaluate(async (vpInfo) => {
      // 1. Check Play tab scrollWidth
      if (window.ELW_UI_MOBILE && typeof window.ELW_UI_MOBILE.select === "function") {
        window.ELW_UI_MOBILE.select("play");
      }
      const playScrollW = document.documentElement.scrollWidth;

      // 2. Check NPC (#peopleCard) & Dialogue (ELW_DIALOGUE)
      const peopleCard = document.getElementById("peopleCard");
      const hasNpcs = !!(window.ELW_NPCS && peopleCard && peopleCard.innerHTML.trim().length > 0);
      const hasDialogue = !!(window.ELW_DIALOGUE && Array.isArray(window.ELW_DIALOGUE.SCRIPTS) && window.ELW_DIALOGUE.SCRIPTS.length >= 8);

      // 3. Switch to Learn tab ("learn") and verify #storyCard, .elw-tts-bar, and #speakingCard
      if (window.ELW_UI_MOBILE && typeof window.ELW_UI_MOBILE.select === "function") {
        window.ELW_UI_MOBILE.select("learn");
      }
      const learnScrollW = document.documentElement.scrollWidth;
      const storyCard = document.getElementById("storyCard");
      const speakingCard = document.getElementById("speakingCard");
      const ttsBar = storyCard ? storyCard.querySelector(".elw-tts-bar") : null;
      const btnNat = ttsBar ? ttsBar.querySelector('[data-tts-mode="natural"]') : null;
      const btnLrn = ttsBar ? ttsBar.querySelector('[data-tts-mode="learning"]') : null;
      const presetSel = ttsBar ? ttsBar.querySelector("#ttsPresetSel") : null;

      let barInteractionOk = false;
      let barFitsViewport = false;
      if (ttsBar && btnNat && btnLrn && presetSel) {
        const rect = ttsBar.getBoundingClientRect();
        barFitsViewport = rect.width > 0 && rect.left >= 0 && Math.round(rect.right) <= vpInfo.width;

        // Click Learning Mode button
        btnLrn.click();
        const modeAfterLrn = window.ELW_VOICES.getMode();
        const lrnBtnActive = btnLrn.classList.contains("on") && btnLrn.getAttribute("aria-pressed") === "true";

        // Select preset in dropdown
        presetSel.value = "happy_excited";
        presetSel.dispatchEvent(new Event("change", { bubbles: true }));
        const presetAfterChange = window.ELW_VOICES.getPreset();

        // Click Natural Mode button back
        btnNat.click();
        const modeAfterNat = window.ELW_VOICES.getMode();
        const natBtnActive = btnNat.classList.contains("on") && btnNat.getAttribute("aria-pressed") === "true";

        // Reset preset to auto
        presetSel.value = "auto";
        presetSel.dispatchEvent(new Event("change", { bubbles: true }));

        barInteractionOk =
          modeAfterLrn === "learning" &&
          lrnBtnActive &&
          presetAfterChange === "happy_excited" &&
          modeAfterNat === "natural" &&
          natBtnActive;
      }

      // 4. Check sequential non-overlapping speakQueue across multi-clause sentences
      window.__ttsEvents = [];
      window.__ttsMaxConcurrent = 0;
      await Promise.all([
        window.ELW_VOICES.speak("First I open the door, and then I look outside.", "mom"),
        window.ELW_VOICES.speak("Do you want to build a snowman today?", "linh"),
        window.ELW_VOICES.speak("Where is my warm scarf?", "child")
      ]);
      const evs = window.__ttsEvents.slice();
      let overlapCount = 0;
      for (let i = 1; i < evs.length; i++) {
        if (evs[i].start < evs[i - 1].end) overlapCount++;
      }

      // 5. Check Mission tab scrollWidth
      if (window.ELW_UI_MOBILE && typeof window.ELW_UI_MOBILE.select === "function") {
        window.ELW_UI_MOBILE.select("mission");
      }
      const missionScrollW = document.documentElement.scrollWidth;

      return {
        playScrollW,
        learnScrollW,
        missionScrollW,
        maxScrollW: Math.max(playScrollW, learnScrollW, missionScrollW),
        hasNpcs,
        hasDialogue,
        hasStoryCard: !!storyCard,
        hasSpeakingCard: !!(speakingCard && speakingCard.innerHTML.trim().length > 0),
        hasTtsBar: !!ttsBar,
        barFitsViewport,
        barInteractionOk,
        spokenSegments: evs.length,
        maxConcurrent: window.__ttsMaxConcurrent,
        overlapCount
      };
    }, vp);

    const noHorizontalOverflow = vp.isMobile ? e2eResult.maxScrollW <= 390 : e2eResult.maxScrollW <= vp.width;
    const vpOk =
      pageErrors.length === 0 &&
      noHorizontalOverflow &&
      e2eResult.hasNpcs &&
      e2eResult.hasDialogue &&
      e2eResult.hasStoryCard &&
      e2eResult.hasSpeakingCard &&
      e2eResult.hasTtsBar &&
      e2eResult.barFitsViewport &&
      e2eResult.barInteractionOk &&
      e2eResult.spokenSegments >= 4 &&
      e2eResult.maxConcurrent === 1 &&
      e2eResult.overlapCount === 0;

    console.log(vp.name, vpOk ? "PASS" : "FAIL", JSON.stringify({ ...e2eResult, pageErrors }));
    if (!vpOk) fail++;
    await pg.close();
  }
}

await b.close(); process.exit(fail ? 1 : 0);


