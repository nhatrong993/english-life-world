#!/usr/bin/env node
/**
 * G1 — Extract all fixed English sentences across English Life World
 * into docs/tts/sentences.json, keyed by normalized text hash, with:
 * - text: original display/spoken text
 * - norm: normalized lookup key
 * - sentenceType: "statement" | "yes-no" | "wh" | "exclaim"
 * - character: character / speaker id
 * - gender: "female" | "male" | "child"
 * - profileId: ELW_VOICES / ELW_TTS_PLANNER profile id
 * - voice: Microsoft Neural voice ("en-US-AriaNeural" | "en-US-JennyNeural" | "en-US-GuyNeural" | "en-US-AnaNeural")
 * - rate: edge-tts rate string (e.g. "-4%")
 * - pitch: edge-tts pitch string (e.g. "+10Hz")
 * - volume: edge-tts volume string (e.g. "+2%")
 * - pauseAfterMs: planner pause after sentence (ms)
 * - category: source category
 */

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT_JSON = path.join(ROOT, "docs", "tts", "sentences.json");

const PLANNER = require(path.join(ROOT, "modules", "tts-prosody-planner.js"));

function normalizeText(s) {
  if (s == null) return "";
  return String(s)
    .replace(/<[^>]*>/g, "")
    .replace(/‿/g, " ")
    .replace(/\*[^*]+\*/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/[\u2018\u2019\u201B\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\.+$/, "")
    .trim();
}

function cleanSpokenText(s) {
  if (s == null) return "";
  return String(s)
    .replace(/<[^>]*>/g, "")
    .replace(/‿/g, " ")
    .replace(/\*[^*]+\*/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/[\u2018\u2019\u201B\u0060\u00B4]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function hashText(s) {
  const norm = normalizeText(s);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < norm.length; i++) {
    const c = norm.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= (c * 31) & 0xffff;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

function resolveCharacterMeta(whoOrVoice) {
  const raw = String(whoOrVoice || "narrator").toLowerCase().trim();
  if (/lily|baby|child|pet|milo|milu|mochi|puppy|cat|dog|kid/.test(raw)) {
    return {
      character: raw || "child",
      gender: "child",
      profileId: "child",
      voice: "en-US-AnaNeural"
    };
  }
  if (/dad|grandpa|tom|adult_male|young_male|elderly\b|barista|butcher|clerk|waiter|ranger|chef|mechanic|delivery|courier|stranger|shopper|regular|sam|diner|critic|hiker|jogger|tourist|monitor|leo|mr\./.test(raw)) {
    const isElderly = /grandpa|elderly/.test(raw);
    const isYoung = /tom|young_male|barista|waiter|courier|delivery|monitor/.test(raw);
    return {
      character: raw || "adult_male",
      gender: "male",
      profileId: isElderly ? "elderly" : (isYoung ? "young_male" : "adult_male"),
      voice: "en-US-GuyNeural"
    };
  }
  if (/linh|young_female|cashier|service|guest|mary|sister|lan|classmate|friend/.test(raw)) {
    return {
      character: raw || "young_female",
      gender: "female",
      profileId: "young_female",
      voice: "en-US-JennyNeural"
    };
  }
  return {
    character: raw || "narrator",
    gender: "female",
    profileId: "adult_female",
    voice: "en-US-AriaNeural"
  };
}

function mapSentenceType(plannerType) {
  if (plannerType === "yn_question") return "yes-no";
  if (plannerType === "wh_question") return "wh";
  if (plannerType === "exclamation") return "exclaim";
  return "statement";
}

function computeProsodyFromPlanner(text, profileId) {
  const plan = PLANNER.planParagraph(text, profileId || "adult_female", { mode: "natural" });
  const clauses = (plan && plan.clauses) || [];
  const lastClause = clauses[clauses.length - 1] || {};
  const firstSent = (plan && plan.sentences && plan.sentences[0]) || {};
  const rawStype = lastClause.sentenceType || firstSent.sentenceType || PLANNER.detectSentenceType(text);
  const sentenceType = mapSentenceType(rawStype);

  const emotion = lastClause.emotion || "neutral";
  const role = lastClause.narrativeRole || "body";
  const baseRate = lastClause.rate || 0.96;
  const basePitch = lastClause.pitch || 1.0;
  const baseVol = lastClause.volume || 0.95;

  let ratePct = Math.round((baseRate / 0.96 - 1.0) * 100);
  let pitchHz = Math.round((basePitch - 1.0) * 55);
  let volPct = Math.round((baseVol - 0.95) * 100);

  if (emotion === "warm_greeting") {
    pitchHz += 6; ratePct += 2; volPct += 4;
  } else if (emotion === "happy") {
    pitchHz += 7; ratePct += 3; volPct += 5;
  } else if (emotion === "reassuring") {
    pitchHz += 2; ratePct -= 3; volPct += 2;
  } else if (emotion === "gentle_request") {
    pitchHz += 4; ratePct -= 2;
  } else if (emotion === "curious") {
    pitchHz += 5;
  } else if (emotion === "warning") {
    pitchHz += 3; ratePct -= 4; volPct += 6;
  } else if (emotion === "apologetic") {
    pitchHz -= 3; ratePct -= 4; volPct -= 2;
  } else if (emotion === "calm_closing") {
    pitchHz -= 2; ratePct -= 4;
  }

  if (rawStype === "yn_question") {
    pitchHz += 10;
    ratePct += 2;
  } else if (rawStype === "wh_question") {
    pitchHz -= 4;
    ratePct += 1;
  } else if (rawStype === "exclamation") {
    pitchHz += 8;
    volPct += 6;
    ratePct += 3;
  }

  if (role === "opening") {
    pitchHz += 2;
  } else if (role === "climax") {
    pitchHz += 4; volPct += 4;
  } else if (role === "closing") {
    ratePct -= 4; pitchHz -= 2;
  }

  ratePct = Math.max(-18, Math.min(16, ratePct));
  pitchHz = Math.max(-16, Math.min(22, pitchHz));
  volPct = Math.max(-10, Math.min(14, volPct));

  const fmtSign = n => (n >= 0 ? `+${n}` : `${n}`);
  return {
    sentenceType,
    plannerSentenceType: rawStype,
    emotion,
    rate: `${fmtSign(ratePct)}%`,
    pitch: `${fmtSign(pitchHz)}Hz`,
    volume: `${fmtSign(volPct)}%`,
    pauseAfterMs: lastClause.pauseAfterMs || 280
  };
}

// Synthetic test sentences used in modules/voices.test.mjs to test browser speechSynthesis mock directly
const EXCLUDE_SYNTHETIC_TESTS = new Set([
  normalizeText("First I open the door, and then I look outside."),
  normalizeText("Do you want to build a snowman today?"),
  normalizeText("Where is my warm scarf?")
]);

async function loadPlaywrightChromium() {
  const candidates = [
    "C:/Users/Nhat/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs",
    "C:/Users/Nhat/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs"
  ];
  for (const c of candidates) {
    try {
      const mod = await import(pathToFileURL(c).href);
      if (mod && mod.chromium) return mod.chromium;
    } catch (e) {}
  }
  const mod = await import("playwright");
  return mod.chromium;
}

async function main() {
  const chromium = await loadPlaywrightChromium();
  const exePath = "C:/Users/Nhat/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
  const launchOpts = fs.existsSync(exePath) ? { executablePath: exePath } : {};
  const browser = await chromium.launch(launchOpts);
  const page = await browser.newPage();

  const indexUrl = pathToFileURL(path.join(ROOT, "index.html")).href;
  await page.goto(indexUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(300);

  const rawItems = await page.evaluate(() => {
    const out = [];
    const push = (text, who, category) => {
      if (!text || typeof text !== "string") return;
      out.push({ text, who: who || "adult_female", category: category || "general" });
    };

    // 1. ELW.ACTIONS (sentence)
    for (const a of (window.ELW && window.ELW.ACTIONS ? window.ELW.ACTIONS : [])) {
      push(a.sentence, "adult_female", "action_sentence");
    }

    // 2. NPC replies across all topics & zones
    const topicMods = [
      ["cafe", window.ELW_CAFE, "barista"],
      ["market", window.ELW_MARKET, "cashier"],
      ["park", window.ELW_PARK, "young_male"],
      ["restaurant", window.ELW_RESTAURANT, "waiter"],
      ["outdoor", window.ELW_OUTDOOR, "ranger"],
      ["school", window.ELW_SCHOOL, "teacher"]
    ];
    for (const a of (window.ELW && window.ELW.ACTIONS ? window.ELW.ACTIONS : [])) {
      for (const [, mod, defVoice] of topicMods) {
        if (mod && typeof mod.reply === "function") {
          try {
            const rp = mod.reply(a.id);
            if (rp && rp.en) {
              push(rp.en, rp.voice || rp.who || defVoice, "npc_reply");
            }
          } catch (e) {}
        }
      }
    }
    if (typeof HOME_NPC_REPLIES !== "undefined") {
      for (const rp of Object.values(HOME_NPC_REPLIES)) {
        if (rp && rp.en) push(rp.en, rp.voice || rp.who || "mom", "npc_reply");
      }
    }
    if (window.ELW_NPCS) {
      for (const ph of ["dawn", "morning", "noon", "afternoon", "evening", "night"]) {
        const list = window.ELW_NPCS.describe(null, ph, { roomExists: () => true }) || [];
        for (const d of list) {
          push(d.en, "adult_female", "npcs");
          push(d.ask_en, "young_female", "npcs");
          push(d.answer_en, d.npc || "adult_female", "npcs");
        }
      }
      for (const l of (window.ELW_NPCS.EVENT_LINES || [])) {
        push(l.en, l.npc || "adult_female", "npcs");
      }
    }

    // 3. ELW_CONTEXT (all places, zones, weathers, situations, companions)
    if (window.ELW_CONTEXT && typeof window.ELW_CONTEXT.pickPhrases === "function") {
      const zones = [
        "living", "kitchen", "bedroom", "bathroom", "garage", "garden",
        "cafe", "cafe_counter", "cafe_bar", "cafe_seating", "cafe_terrace",
        "park", "market", "market_entrance", "market_produce", "market_dairy",
        "market_meat", "market_checkout", "restaurant", "school", "camping", "outdoor"
      ];
      const wxs = ["sunny", "rainy", "cold", "windy", "hot"];
      const sits = ["normal", "rush", "weekend", "sick", "bargain", "traveler", "lost"];
      for (const zone of zones) {
        for (const weather of wxs) {
          for (const situation of sits) {
            for (const withLinh of [false, true]) {
              for (const withPet of [false, true]) {
                const phrases = window.ELW_CONTEXT.pickPhrases({ zone, weather, situation, withLinh, withPet }) || [];
                for (const p of phrases) {
                  push(p.en, "adult_female", "context");
                  if (p.replyEn && p.responder !== "Milo") {
                    push(p.replyEn, p.voice || p.responder || "adult_female", "context_reply");
                  }
                }
              }
            }
          }
        }
      }
    }

    // 4. Cô Mai, Missions, Challenges, Events, Needs, Day
    if (window.ELW_MISSION && Array.isArray(window.ELW_MISSION.MISSIONS)) {
      for (const ms of window.ELW_MISSION.MISSIONS) {
        const giverVoice = (ms.giver && (ms.giver.voice || ms.giver.id || ms.giver.name)) || "adult_female";
        push(ms.title_en, "adult_female", "mission");
        if (ms.intro && ms.intro.en) push(ms.intro.en, giverVoice, "mission");
        if (ms.complete && ms.complete.en) push(ms.complete.en, giverVoice, "mission");
        for (const st of (ms.steps || [])) {
          push(st.title_en, "adult_female", "mission");
          push(st.say_en, "adult_female", "mission");
          if (st.request && st.request.en) push(st.request.en, giverVoice, "mission");
          if (st.done && st.done.en) push(st.done.en, giverVoice, "mission");
        }
      }
    }
    if (window.ELW_CHALLENGE && Array.isArray(window.ELW_CHALLENGE.CHALLENGES)) {
      for (const ch of window.ELW_CHALLENGE.CHALLENGES) {
        push(ch.title_en, "adult_female", "challenge");
        for (const t of (ch.tasks || [])) {
          push(t.title_en, "adult_female", "challenge");
          push(t.learn_en, "adult_female", "challenge");
        }
      }
    }
    if (window.ELW_EVENTS && Array.isArray(window.ELW_EVENTS.DEFS)) {
      for (const e of window.ELW_EVENTS.DEFS) {
        push(e.title_en, "adult_female", "events");
        push(e.npc_line_en, e.npc || "adult_female", "events");
        push(e.learn_en, "adult_female", "events");
      }
    }
    if (window.ELW_NEEDS && window.ELW_NEEDS.LINES) {
      for (const d of Object.values(window.ELW_NEEDS.LINES)) {
        if (d.me && d.me[0]) push(d.me[0], "adult_female", "needs");
        for (const k of [1, 2, 3]) {
          for (const p of (d[k] || [])) {
            if (p && p[0]) push(p[0], "adult_female", "needs");
            if (d.me && d.me[0] && p && p[0]) push(p[0] + " " + d.me[0], "adult_female", "needs");
          }
        }
      }
    }
    if (window.ELW_DAY) {
      for (const q of (window.ELW_DAY.QUESTS || [])) {
        push(q.en, "adult_female", "day");
      }
      for (const ph of ["dawn", "morning", "noon", "afternoon", "evening", "night"]) {
        for (const wx of ["sunny", "cloudy", "rainy"]) {
          for (let r = 0; r < 4; r++) {
            const amb = window.ELW_DAY.ambient_en(ph, { weather: wx }, () => r * 0.25);
            if (amb && amb.en) push(amb.en, "adult_female", "day");
          }
        }
      }
    }

    // 5. Dialogue & Roleplay & Life Talk
    if (window.ELW_DIALOGUE) {
      for (const sc of (window.ELW_DIALOGUE.SCRIPTS || [])) {
        for (const l of (sc.lines || [])) {
          push(l.en, l.who || "mom", "dialogue");
          for (const ch of (l.choices || [])) {
            if (ch.ok !== false) push(ch.en, "adult_female", "dialogue");
          }
        }
      }
    }
    if (window.ELW_ROLEPLAY) {
      for (const sc of Object.values(window.ELW_ROLEPLAY.SCENES || {})) {
        for (const l of (sc.lines || [])) {
          push(l.en, l.who === "me" ? "adult_female" : (l.who || sc.who || "adult_female"), "roleplay");
          for (const ch of (l.choices || [])) {
            if (ch.ok !== false) push(ch.en, "adult_female", "roleplay");
          }
        }
      }
    }
    if (window.ELW_LIFE) {
      for (const arr of Object.values(window.ELW_LIFE.lines || {})) {
        for (const it of arr) {
          push(it.en, it.kind === "answer" ? "adult_female" : "linh", "life_talk");
        }
      }
      for (const arr of Object.values(window.ELW_LIFE.talk || {})) {
        for (const x of arr) {
          push(x.q, "linh", "life_talk");
          push(x.r, "linh", "life_talk");
          for (const a of (x.answers || [])) {
            if (a.ok !== false) push(a.en, "adult_female", "life_talk");
          }
        }
      }
      for (const v of (window.ELW_LIFE.visitors || [])) {
        const vWho = v.id || v.name || "stranger";
        for (const x of (v.items || [])) {
          push(x.q, vWho, "life_talk");
          push(x.r, vWho, "life_talk");
          for (const a of (x.answers || [])) {
            if (a.ok !== false) push(a.en, "adult_female", "life_talk");
          }
        }
      }
    }

    // 6. Pet (ELW_PET_INTERACTION & ELW_PET_ADVENTURE)
    if (window.ELW_PET_INTERACTION && typeof window.ELW_PET_INTERACTION.performInteraction === "function") {
      for (const actId of ["pet", "play", "feed", "water", "rest", "talk", "walk", "profile"]) {
        for (let i = 0; i < 3; i++) {
          try {
            const res = window.ELW_PET_INTERACTION.performInteraction(actId, { silent: true, switchTab: false });
            if (res && res.dialogue) {
              push(res.dialogue.playerEn, "adult_female", "pet");
              push(res.dialogue.petReplyEn, "pet", "pet");
            }
          } catch (e) {}
        }
      }
    }
    if (window.ELW_PET_ADVENTURE && typeof window.ELW_PET_ADVENTURE.buildObjectivesForContext === "function") {
      const places = ["home", "park", "cafe", "market", "restaurant", "outdoor", "camping", "school"];
      const zones = ["living", "park", "cafe", "market", "market_produce", "market_checkout", "restaurant", "outdoor", "school"];
      const wxs = ["sunny", "rainy", "cold", "windy", "hot"];
      for (const place of places) {
        for (const zone of zones) {
          for (const weather of wxs) {
            for (const petId of ["milu", "mochi"]) {
              try {
                const objs = window.ELW_PET_ADVENTURE.buildObjectivesForContext({ place, zone, weather, situation: "normal", petId }) || [];
                for (const o of objs) {
                  push(o.sentenceEn || o.en, "adult_female", "pet");
                  push(o.replyEn, o.responder ? o.responder : "pet", "pet");
                }
              } catch (e) {}
            }
          }
        }
      }
    }

    // 7. Story / Levels / Voice preview
    push("Hello! This is my voice.", "adult_female", "story");
    push("Today I was busy at home.", "adult_female", "story");
    push("Today was a quiet day.", "adult_female", "story");
    push("It was a sunny day.", "adult_female", "story");
    push("It was a cloudy day.", "adult_female", "story");
    push("It rained today.", "adult_female", "story");
    if (typeof STORY !== "undefined") {
      const storyEntries = Object.entries(STORY).slice(0, 60);
      for (const [, d] of storyEntries) {
        if (Array.isArray(d)) {
          if (d[0]) push("I " + d[0] + ".", "adult_female", "story");
          if (d[1]) push("I " + d[1] + ".", "adult_female", "story");
        }
      }
    }
    if (window.ELW_LEVELS && typeof window.ELW_LEVELS.build === "function") {
      const sampleSeq = [{ uid: 1, id: "open_fridge", ctx: {} }, { uid: 2, id: "take_milk", ctx: {} }, { uid: 3, id: "pour_milk", ctx: { milkFromFridge: true } }, { uid: 4, id: "drink_from_cup", ctx: {} }];
      for (const lv of ["simple", "A1", "A2", "B1", "B2", "C1", "C2"]) {
        try {
          const built = window.ELW_LEVELS.build(sampleSeq, lv, { rich: true }) || [];
          for (const seg of built) {
            if (seg && seg.en) {
              for (const s of (seg.en.match(/[^.!?]+[.!?]*/g) || [seg.en])) {
                push(s.trim(), "adult_female", "story");
              }
            }
          }
        } catch (e) {}
      }
    }

    // 8. Vocab 3000 (pattern spinner frames + examples + words)
    if (window.ELW_VOCAB3000) {
      for (const f of (window.ELW_VOCAB3000.FRAMES || [])) {
        if (typeof f.template === "function") {
          for (const a of (f.slotA || [])) {
            for (const b of (f.slotB || [])) {
              push(f.template(a[0], b[0]), "adult_female", "vocab3000_frame");
            }
          }
        }
      }
      const words = window.ELW_VOCAB3000.words ? window.ELW_VOCAB3000.words() : [];
      for (const w of words) {
        push(w.ex, "adult_female", "vocab3000_ex");
      }
      for (const w of words) {
        push(w.en, "adult_female", "vocab3000_word");
      }
    }

    return out;
  });

  await browser.close();

  const sentences = {};
  const statsByCat = {};
  const statsByVoice = {};
  const statsByType = {};

  for (const item of rawItems) {
    const spoken = cleanSpokenText(item.text);
    const norm = normalizeText(spoken);
    if (!norm || !/[a-z]/.test(norm)) continue;
    if (EXCLUDE_SYNTHETIC_TESTS.has(norm)) continue;

    const hash = hashText(spoken);
    if (sentences[hash]) continue;

    const charMeta = resolveCharacterMeta(item.who);
    const prosody = computeProsodyFromPlanner(spoken, charMeta.profileId);

    sentences[hash] = {
      hash,
      text: spoken,
      norm,
      sentenceType: prosody.sentenceType,
      character: charMeta.character,
      gender: charMeta.gender,
      profileId: charMeta.profileId,
      voice: charMeta.voice,
      rate: prosody.rate,
      pitch: prosody.pitch,
      volume: prosody.volume,
      pauseAfterMs: prosody.pauseAfterMs,
      category: item.category
    };

    statsByCat[item.category] = (statsByCat[item.category] || 0) + 1;
    statsByVoice[charMeta.voice] = (statsByVoice[charMeta.voice] || 0) + 1;
    statsByType[prosody.sentenceType] = (statsByType[prosody.sentenceType] || 0) + 1;
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  const output = {
    version: 1,
    generatedAt: new Date().toISOString(),
    totalSentences: Object.keys(sentences).length,
    statsByCategory: statsByCat,
    statsByVoice,
    statsBySentenceType: statsByType,
    sentences
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2), "utf8");
  console.log(`Extracted ${output.totalSentences} unique sentences -> ${OUT_JSON}`);
  console.log("By category:", statsByCat);
  console.log("By voice:", statsByVoice);
  console.log("By sentenceType:", statsByType);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
