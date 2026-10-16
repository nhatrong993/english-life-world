/* English Life World — voices, paragraph prosody planner integration + family dialogues module.
 * Exposes window.ELW_TTS_PLANNER, window.ELW_VOICES and window.ELW_DIALOGUE.
 * Self-contained in browser builds while remaining modular in Node.js.
 */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this;

  /* =========================================================================
   * PART 0: PARAGRAPH PROSODY PLANNER (ELW_TTS_PLANNER)
   * Loads ./tts-prosody-planner.js in Node if available, with full self-contained
   * embedded fallback so browser and single-file builds work with 0 extra script tags.
   * ========================================================================= */
  var planner = root.ELW_TTS_PLANNER || null;
  if (!planner && typeof require === "function") {
    try {
      planner = require("./tts-prosody-planner.js");
    } catch (e) {}
  }

  if (!planner) {
    planner = (function createEmbeddedPlanner(globalRoot) {
      var DELIVERY_PRESETS = {
        storytelling: {
          id: "storytelling",
          label: "Storytelling",
          vi: "Kể chuyện có nhịp điệu, giàu biểu cảm",
          rateMul: 0.96,
          pitchMul: 1.03,
          pitchSpan: 0.16,
          clausePauseMs: 170,
          sentencePauseMs: 380,
          thoughtGroupPauseMs: 250,
          sectionPauseMs: 520,
          emphasisBoost: 0.08,
          volumeMul: 1.0
        },
        friendly_conversation: {
          id: "friendly_conversation",
          label: "Friendly Conversation",
          vi: "Thân thiện, tự nhiên",
          rateMul: 1.03,
          pitchMul: 1.05,
          pitchSpan: 0.14,
          clausePauseMs: 140,
          sentencePauseMs: 280,
          thoughtGroupPauseMs: 210,
          sectionPauseMs: 380,
          emphasisBoost: 0.06,
          volumeMul: 1.0
        },
        curious: {
          id: "curious",
          label: "Curious & Exploring",
          vi: "Tò mò, tạo cảm giác khám phá",
          rateMul: 0.95,
          pitchMul: 1.10,
          pitchSpan: 0.18,
          clausePauseMs: 180,
          sentencePauseMs: 350,
          thoughtGroupPauseMs: 260,
          sectionPauseMs: 460,
          emphasisBoost: 0.09,
          volumeMul: 1.0
        },
        happy_excited: {
          id: "happy_excited",
          label: "Happy & Excited",
          vi: "Vui vẻ, hào hứng nhưng không quá mức",
          rateMul: 1.07,
          pitchMul: 1.12,
          pitchSpan: 0.20,
          clausePauseMs: 130,
          sentencePauseMs: 250,
          thoughtGroupPauseMs: 190,
          sectionPauseMs: 350,
          emphasisBoost: 0.10,
          volumeMul: 1.0
        },
        gentle_comforting: {
          id: "gentle_comforting",
          label: "Gentle & Comforting",
          vi: "Nhẹ nhàng, an ủi",
          rateMul: 0.90,
          pitchMul: 0.94,
          pitchSpan: 0.10,
          clausePauseMs: 200,
          sentencePauseMs: 420,
          thoughtGroupPauseMs: 300,
          sectionPauseMs: 540,
          emphasisBoost: 0.05,
          volumeMul: 0.92
        },
        clear_learning: {
          id: "clear_learning",
          label: "Clear Learning",
          vi: "Rõ ràng cho người học nghe và bắt chước",
          rateMul: 0.86,
          pitchMul: 1.00,
          pitchSpan: 0.12,
          clausePauseMs: 210,
          sentencePauseMs: 440,
          thoughtGroupPauseMs: 340,
          sectionPauseMs: 550,
          emphasisBoost: 0.09,
          volumeMul: 1.0
        },
        character_dialogue: {
          id: "character_dialogue",
          label: "Character Dialogue",
          vi: "Hội thoại có cá tính",
          rateMul: 1.00,
          pitchMul: 1.02,
          pitchSpan: 0.15,
          clausePauseMs: 150,
          sentencePauseMs: 300,
          thoughtGroupPauseMs: 220,
          sectionPauseMs: 400,
          emphasisBoost: 0.07,
          volumeMul: 1.0
        }
      };

      var STYLE_TO_PRESET = {
        storytelling: "storytelling",
        narrative: "storytelling",
        cheerful: "happy_excited",
        excited: "happy_excited",
        happy: "happy_excited",
        friendly: "friendly_conversation",
        helpful: "friendly_conversation",
        polite: "character_dialogue",
        warm: "gentle_comforting",
        calm: "gentle_comforting",
        gentle: "gentle_comforting",
        caring: "gentle_comforting",
        clear: "clear_learning",
        learning: "clear_learning",
        steady: "storytelling",
        curious: "curious",
        dialogue: "character_dialogue"
      };

      var MODES = {
        natural: {
          id: "natural",
          label: "Natural Mode",
          vi: "Tự nhiên, liền mạch theo mạch cảm xúc",
          modeRateMul: 1.0,
          minRate: 0.78,
          maxRate: 1.35,
          minWordsPerGroup: 4,
          maxWordsPerGroup: 14,
          thoughtGroupPauseMs: 220,
          transitionPauseMs: 380,
          sectionPauseMs: 520,
          preserveProsodyContinuity: true
        },
        learning: {
          id: "learning",
          label: "Learning Mode",
          vi: "Rõ ràng theo cụm ý, giữ nguyên trọng âm và ngữ điệu",
          modeRateMul: 0.86,
          minRate: 0.76,
          maxRate: 1.06,
          minWordsPerGroup: 3,
          maxWordsPerGroup: 8,
          thoughtGroupPauseMs: 300,
          transitionPauseMs: 440,
          sectionPauseMs: 550,
          preserveProsodyContinuity: true
        }
      };

      var FALLBACK_PROFILES = {
        adult_male:   { id: "adult_male",   pitch: 0.70, rate: 0.95, gender: "m", lang: "en-US", style: "steady" },
        adult_female: { id: "adult_female", pitch: 1.20, rate: 1.00, gender: "f", lang: "en-US", style: "warm" },
        young_male:   { id: "young_male",   pitch: 1.00, rate: 1.10, gender: "m", lang: "en-US", style: "friendly" },
        young_female: { id: "young_female", pitch: 1.45, rate: 1.08, gender: "f", lang: "en-AU", style: "cheerful" },
        child:        { id: "child",        pitch: 1.85, rate: 0.92, gender: "f", lang: "en-US", style: "curious" },
        elderly:      { id: "elderly",      pitch: 0.55, rate: 0.78, gender: "m", lang: "en-GB", style: "gentle" }
      };

      function resolveProfile(profileOrId) {
        if (profileOrId && typeof profileOrId === "object") {
          return {
            id: profileOrId.id || "adult_female",
            charId: profileOrId.charId || profileOrId.id || "adult_female",
            pitch: typeof profileOrId.pitch === "number" ? profileOrId.pitch : 1.0,
            rate: typeof profileOrId.rate === "number" ? profileOrId.rate : 1.0,
            gender: profileOrId.gender || "f",
            lang: profileOrId.lang || "en-US",
            style: profileOrId.style || "storytelling"
          };
        }
        var key = String(profileOrId || "adult_female");
        if (globalRoot && globalRoot.ELW_VOICES && typeof globalRoot.ELW_VOICES.getCharacterProfile === "function") {
          try {
            var vp = globalRoot.ELW_VOICES.getCharacterProfile(key);
            if (vp && typeof vp.pitch === "number") return vp;
          } catch (e) {}
        }
        return FALLBACK_PROFILES[key] || FALLBACK_PROFILES.adult_female;
      }

      function resolvePreset(presetOrStyle, modeId, isMultiSentence) {
        if (presetOrStyle && DELIVERY_PRESETS[presetOrStyle]) return DELIVERY_PRESETS[presetOrStyle];
        if (presetOrStyle && STYLE_TO_PRESET[presetOrStyle]) return DELIVERY_PRESETS[STYLE_TO_PRESET[presetOrStyle]];
        if (modeId === "learning") return DELIVERY_PRESETS.clear_learning;
        if (isMultiSentence) return DELIVERY_PRESETS.storytelling;
        return DELIVERY_PRESETS.character_dialogue;
      }

      var NEGATIVE_SAD_RE = /\b(sorry|sad|tired|exhausted|hurt|badly|unfortunately|worried|lonely|cry|crying|doesn't like|don't like|hate|miss|cold and wet|sick|pain|afraid)\b/i;
      var CONTRAST_DISLIKE_RE = /\b(doesn't like|don't like|cold and wet|has to shovel|have to shovel|unfortunately)\b/i;
      var EXCITED_DELIGHT_RE = /\b(excited|amazing|wonderful|awesome|yay|hooray|fantastic|love|beautiful|delicious|yummy|snowmen|snowman|snowoman|snowballs|snow angels|great job|well done)\b/i;
      var WARM_DELIGHT_RE = /\b(beautiful|delicious|yummy|love|snowmen|snowman|snowoman|great job|well done)\b/i;
      var CURIOUS_RE = /\b(wonder|curious|maybe|look at|what if|discover|secret|strange|interesting)\b/i;
      var WARM_COMFORT_RE = /\b(sweetie|sweet dreams|good night|hot chocolate|cozy|warm|gentle|careful|thank you|thanks|kind)\b/i;

      function detectContentEmotion(text, requestedPreset) {
        var s = String(text || "").trim();
        var reqId = typeof requestedPreset === "string"
          ? requestedPreset
          : (requestedPreset && requestedPreset.id) || "storytelling";

        if (!s) {
          return { emotion: "neutral", pitchMul: 1.0, rateMul: 1.0, volumeMul: 1.0, effectivePreset: reqId, guardrailTriggered: false };
        }
        if (NEGATIVE_SAD_RE.test(s)) {
          var isContrastCalm = CONTRAST_DISLIKE_RE.test(s);
          return {
            emotion: isContrastCalm ? "contrastive_calm" : "sympathetic",
            pitchMul: isContrastCalm ? 0.96 : 0.95,
            rateMul: isContrastCalm ? 0.94 : 0.93,
            volumeMul: 0.94,
            effectivePreset: "gentle_comforting",
            guardrailTriggered: true
          };
        }
        if (WARM_COMFORT_RE.test(s) && !/!\s*$/.test(s)) {
          return { emotion: "warm_comforting", pitchMul: 0.97, rateMul: 0.95, volumeMul: 0.96, effectivePreset: "gentle_comforting", guardrailTriggered: false };
        }
        if (EXCITED_DELIGHT_RE.test(s) || /!\s*$/.test(s)) {
          var isWarmDelight = WARM_DELIGHT_RE.test(s) && !/!\s*$/.test(s) && !/\b(excited|amazing|awesome|yay|hooray|fantastic|snowballs|snow angels)\b/i.test(s);
          return {
            emotion: isWarmDelight ? "warm_delight" : "excited",
            pitchMul: isWarmDelight ? 1.04 : 1.07,
            rateMul: isWarmDelight ? 0.98 : 1.02,
            volumeMul: 1.0,
            effectivePreset: isWarmDelight ? "storytelling" : "happy_excited",
            guardrailTriggered: false
          };
        }
        if (CURIOUS_RE.test(s) || /\?\s*$/.test(s)) {
          return { emotion: "curious", pitchMul: 1.05, rateMul: 0.96, volumeMul: 1.0, effectivePreset: "curious", guardrailTriggered: false };
        }
        var defaultEmotionMap = {
          storytelling: "narrative",
          friendly_conversation: "friendly",
          curious: "curious",
          happy_excited: "cheerful",
          gentle_comforting: "warm_comforting",
          clear_learning: "clear_instructional",
          character_dialogue: "conversational"
        };
        return { emotion: defaultEmotionMap[reqId] || "neutral", pitchMul: 1.0, rateMul: 1.0, volumeMul: 1.0, effectivePreset: reqId, guardrailTriggered: false };
      }

      var WH_START = /^(what|where|when|why|who|whom|whose|which|how)\b/i;
      var YN_START = /^(do|does|did|is|are|am|was|were|can|could|will|would|shall|should|may|might|must|have|has|had)\b/i;
      var TAG_QUESTION_RE = /,\s*(isn't|aren't|wasn't|weren't|don't|doesn't|didn't|won't|wouldn't|can't|couldn't|shouldn't|haven't|hasn't|hadn't|is|are|was|were|do|does|did|can|could|will|would|should|have|has)\s+(it|he|she|they|we|you|I|there|that|this)\s*\?\s*$|,\s*(right|okay|ok|correct|huh|no|yes)\s*\?\s*$/i;
      var POLITE_WH_RE = /\b(where|what|when|why|who|whom|whose|which|how)('s|'re|'d|'ll|'ve|\s+(is|are|am|was|were|do|does|did|can|could|will|would|shall|should|may|might|must|have|has|had|much|many|long|far|often|old|come|about|to))\b/i;

      function detectSentenceType(text) {
        var s = String(text || "").trim();
        if (!s) return "statement";
        if (/\?\s*["')\]}]*$/.test(s)) {
          var parts = s.split(/[.!]\s+/);
          var q = (parts[parts.length - 1] || s).trim().replace(/^["'([{\s]+|["')\]}\s]+$/g, "");
          if (TAG_QUESTION_RE.test(q)) return "yn_question";
          if (WH_START.test(q)) return "wh_question";
          if (POLITE_WH_RE.test(q)) {
            var afterComma = q.split(/,\s*/);
            var lastClause = afterComma[afterComma.length - 1] || "";
            if (WH_START.test(lastClause.trim()) || POLITE_WH_RE.test(lastClause.trim())) return "wh_question";
          }
          if (YN_START.test(q)) return "yn_question";
          return "yn_question";
        }
        if (/!\s*["')\]}]*$/.test(s)) return "exclamation";
        return "statement";
      }

      var PRIORITY_KEYWORDS_RE = /\b(first|finally|suddenly|instead|however|outside|inside|snowfall|snowed|snowing|snow|snowman|snowoman|snowballs|angels|beautiful|excited|amazing|wonderful|awesome|fantastic|delicious|yummy|favorite|recommend|fresh|organic|sale|discount|free|hot|cold|warm|iced|cozy|special|today|november|morning|afternoon|evening|tonight|please|thank|thanks|sorry|excuse|help|urgent|hurry|careful|hat|mittens|scarf|jacket|zippers|shovel|driveway|chocolate|window|door|produce|bakery|dairy|frozen|meat|seafood|checkout|aisle|cart|receipt|refund|coupon|card|cash|price|total|apples|bananas|strawberries|milk|bread|cheese|salmon|beef|chicken|coffee|water|room)\b|\$\d+|\b\d+(?:st|nd|rd|th)?\b/i;
      var STOPWORDS = {
        "a": 1, "an": 1, "the": 1, "and": 1, "or": 1, "but": 1, "nor": 1, "so": 1, "yet": 1, "for": 1,
        "in": 1, "on": 1, "at": 1, "to": 1, "from": 1, "with": 1, "by": 1, "of": 1, "into": 1, "onto": 1,
        "up": 1, "down": 1, "out": 1, "off": 1, "over": 1, "under": 1, "about": 1, "after": 1, "before": 1,
        "between": 1, "through": 1, "during": 1, "without": 1, "around": 1, "among": 1, "near": 1,
        "i": 1, "me": 1, "my": 1, "mine": 1, "myself": 1, "you": 1, "your": 1, "yours": 1, "yourself": 1,
        "he": 1, "him": 1, "his": 1, "himself": 1, "she": 1, "her": 1, "hers": 1, "herself": 1,
        "it": 1, "its": 1, "itself": 1, "we": 1, "us": 1, "our": 1, "ours": 1, "ourselves": 1,
        "they": 1, "them": 1, "their": 1, "theirs": 1, "themselves": 1,
        "this": 1, "that": 1, "these": 1, "those": 1, "there": 1, "here": 1, "where": 1, "when": 1,
        "what": 1, "which": 1, "who": 1, "whom": 1, "whose": 1, "why": 1, "how": 1,
        "am": 1, "is": 1, "are": 1, "was": 1, "were": 1, "be": 1, "been": 1, "being": 1,
        "have": 1, "has": 1, "had": 1, "having": 1, "do": 1, "does": 1, "did": 1, "doing": 1,
        "will": 1, "would": 1, "shall": 1, "should": 1, "can": 1, "could": 1, "may": 1, "might": 1, "must": 1,
        "don't": 1, "doesn't": 1, "didn't": 1, "isn't": 1, "aren't": 1, "wasn't": 1, "weren't": 1,
        "won't": 1, "wouldn't": 1, "can't": 1, "couldn't": 1, "shouldn't": 1, "I'm": 1, "i'm": 1,
        "walking": 1, "going": 1, "coming": 1, "getting": 1, "making": 1, "taking": 1, "putting": 1,
        "looking": 1, "saying": 1, "telling": 1, "asking": 1, "giving": 1, "using": 1, "trying": 1,
        "go": 1, "goes": 1, "went": 1, "gone": 1, "get": 1, "gets": 1, "got": 1, "make": 1, "makes": 1, "made": 1,
        "put": 1, "puts": 1, "take": 1, "takes": 1, "took": 1, "come": 1, "comes": 1, "came": 1,
        "look": 1, "looks": 1, "looked": 1, "see": 1, "sees": 1, "saw": 1, "say": 1, "says": 1, "said": 1,
        "know": 1, "knows": 1, "knew": 1, "think": 1, "thinks": 1, "thought": 1, "want": 1, "wants": 1,
        "need": 1, "needs": 1, "like": 1, "likes": 1, "begin": 1, "begins": 1, "began": 1,
        "start": 1, "starts": 1, "started": 1, "let": 1, "lets": 1, "let's": 1, "find": 1, "pay": 1, "head": 1, "grab": 1, "buying": 1,
        "very": 1, "really": 1, "just": 1, "now": 1, "then": 1, "also": 1, "too": 1, "only": 1, "even": 1,
        "still": 1, "already": 1, "always": 1, "never": 1, "often": 1, "sometimes": 1, "well": 1,
        "some": 1, "any": 1, "all": 1, "many": 1, "much": 1, "more": 1, "most": 1, "other": 1, "another": 1,
        "each": 1, "every": 1, "both": 1, "either": 1, "neither": 1, "such": 1, "own": 1, "same": 1,
        "oh": 1, "wow": 1, "hey": 1, "hi": 1, "hello": 1, "yes": 1, "no": 1, "ok": 1, "okay": 1, "sure": 1,
        "mom": 1, "dad": 1, "sister": 1, "brother": 1, "girl": 1, "boy": 1, "little": 1, "day": 1
      };
      var MULTIWORD_KEYWORDS = [
        "hot chocolate", "snow angels", "first snowfall", "fresh organic",
        "dairy section", "produce section", "great job", "well done", "sweet dreams", "good night"
      ];

      function extractKeywords(text) {
        var raw = String(text || "").trim();
        if (!raw) return [];
        var lower = raw.toLowerCase();
        var found = [], seen = {};
        for (var m = 0; m < MULTIWORD_KEYWORDS.length; m++) {
          var mw = MULTIWORD_KEYWORDS[m];
          if (lower.indexOf(mw) >= 0 && !seen[mw]) { seen[mw] = true; found.push(mw); }
        }
        var tokens = raw.match(/\$?\d+(?:st|nd|rd|th)?|[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
        for (var i = 0; i < tokens.length; i++) {
          var tok = tokens[i], lw = tok.toLowerCase();
          if (seen[lw]) continue;
          if (PRIORITY_KEYWORDS_RE.test(tok)) { seen[lw] = true; found.push(lw); continue; }
          if (lw.length >= 5 && !STOPWORDS[lw] && !/^(where|what|when|which|there|their|these|those|would|could|should|about|after|before|under|while)$/i.test(lw)) {
            seen[lw] = true;
            found.push(lw);
          }
        }
        return found;
      }

      function hasKeywords(text) { return extractKeywords(text).length > 0; }

      var PHRASE_BREAK_BEFORE = /^(and|but|or|because|so|when|while|before|after|although|though|if|unless|until|where|as|to|for|with|in|on|at|into|from|by|under|over|through|outside|inside)$/i;

      function splitBreathGroups(clauseText, minWords, maxWords) {
        var w = String(clauseText || "").trim().split(/\s+/).filter(Boolean);
        if (w.length <= maxWords) return [clauseText.trim()];
        var result = [];
        function recurse(wordsArr) {
          if (wordsArr.length <= maxWords) { result.push(wordsArr.join(" ")); return; }
          var mid = Math.floor(wordsArr.length / 2), bestIdx = -1;
          var maxOffset = Math.max(2, Math.floor(wordsArr.length / 2));
          for (var d = 0; d <= maxOffset; d++) {
            var rightIdx = mid + d, leftIdx = mid - d;
            if (rightIdx >= minWords && (wordsArr.length - rightIdx) >= minWords) {
              if (PHRASE_BREAK_BEFORE.test(wordsArr[rightIdx].replace(/[^A-Za-z']/g, ""))) { bestIdx = rightIdx; break; }
            }
            if (leftIdx >= minWords && (wordsArr.length - leftIdx) >= minWords) {
              if (PHRASE_BREAK_BEFORE.test(wordsArr[leftIdx].replace(/[^A-Za-z']/g, ""))) { bestIdx = leftIdx; break; }
            }
          }
          if (bestIdx < minWords || (wordsArr.length - bestIdx) < minWords) {
            bestIdx = Math.max(minWords, Math.min(wordsArr.length - minWords, mid));
          }
          recurse(wordsArr.slice(0, bestIdx));
          recurse(wordsArr.slice(bestIdx));
        }
        recurse(w);
        return result;
      }

      function splitPhraseClauses(text, opts) {
        opts = opts || {};
        var raw = String(text || "").trim();
        if (!raw) return [];
        var mode = opts.mode === "learning" ? "learning" : "natural";
        var rawCommaParts = [];
        if (raw.indexOf(",") >= 0) {
          var matches = raw.match(/[^,]+,|\s*[^,]+$/g);
          if (matches && matches.length > 0) {
            for (var i = 0; i < matches.length; i++) {
              var piece = matches[i].trim();
              if (piece) rawCommaParts.push(piece);
            }
          } else rawCommaParts.push(raw);
        } else rawCommaParts.push(raw);

        var merged = [], pendingPrefix = "";
        for (var j = 0; j < rawCommaParts.length; j++) {
          var seg = rawCommaParts[j];
          var candidate = pendingPrefix ? (pendingPrefix + " " + seg) : seg;
          var isShortFragment = seg.length < 10 || candidate.length < 10;
          var isShortPoliteSentence = raw.length < 36 && j === 0 && seg.length <= 12;
          if (j < rawCommaParts.length - 1 && (isShortFragment || isShortPoliteSentence)) {
            pendingPrefix = candidate;
          } else {
            pendingPrefix = "";
            if (j === rawCommaParts.length - 1 && seg.length < 10 && merged.length > 0) {
              merged[merged.length - 1] = merged[merged.length - 1] + " " + candidate;
            } else {
              merged.push(candidate);
            }
          }
        }
        if (pendingPrefix) {
          if (merged.length > 0) merged[merged.length - 1] = merged[merged.length - 1] + " " + pendingPrefix;
          else merged.push(pendingPrefix);
        }
        if (!merged.length) merged = [raw];

        if (mode === "learning") {
          var minW = opts.minWordsPerGroup || MODES.learning.minWordsPerGroup;
          var maxW = opts.maxWordsPerGroup || MODES.learning.maxWordsPerGroup;
          var learningGroups = [];
          for (var k = 0; k < merged.length; k++) {
            var subGroups = splitBreathGroups(merged[k], minW, maxW);
            for (var s = 0; s < subGroups.length; s++) learningGroups.push(subGroups[s]);
          }
          return learningGroups.length ? learningGroups : merged;
        }
        return merged;
      }

      function splitSentences(paragraphText) {
        var raw = String(paragraphText || "").trim();
        if (!raw) return [];
        var protectedText = raw.replace(/\b(Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|vs|etc)\.\s+/gi, "$1\u0000 ");
        var parts = protectedText.match(/[^.!?]+(?:[.!?]+["')\]}]*|$)/g) || [protectedText];
        var out = [];
        for (var i = 0; i < parts.length; i++) {
          var s = parts[i].replace(/\u0000/g, ".").trim();
          if (s) out.push(s);
        }
        return out.length ? out : [raw];
      }

      var OPENING_CUE_RE = /^(first\s+snowfall|today\s+is\b|once\s+upon\b|one\s+(day|morning|afternoon|evening|night)\b|it\s+was\b|first,\s+i\b)/i;
      var CONTRAST_CUE_RE = /\b(but\b|however\b|instead\b|although\b|though\b|yet\b|unfortunately\b|doesn't\s+like|don't\s+like|has\s+to\s+shovel|have\s+to\s+shovel|cold\s+and\s+wet)\b/i;
      var CLIMAX_CUE_RE = /\b(excited|amazing|wonderful|awesome|suddenly|starts\s+to\s+snow\s+again|snow\s+again|throw\s+snowballs|make\s+snow\s+angels|finally\s+stopped|hooray|yay|fantastic)\b/i;
      var CLOSING_CUE_RE = /\b(finally\b|in\s+the\s+end\b|at\s+last\b|go\s+inside\s+for\s+hot\s+chocolate|for\s+hot\s+chocolate|sweet\s+dreams|good\s+night)\b/i;

      function detectNarrativeRole(sentenceText, index, totalSentences) {
        var s = String(sentenceText || "").trim();
        if (totalSentences <= 1) {
          if (CONTRAST_CUE_RE.test(s)) return "contrast";
          if (/!\s*$/.test(s) || CLIMAX_CUE_RE.test(s)) return "climax";
          if (OPENING_CUE_RE.test(s)) return "opening";
          return "development";
        }
        if (index === totalSentences - 1) return "closing";
        if (index === 0 || (index === 1 && OPENING_CUE_RE.test(s))) return "opening";
        if (CLOSING_CUE_RE.test(s) && index >= totalSentences - 2) return "closing";
        if (CONTRAST_CUE_RE.test(s)) return "contrast";
        if (/!\s*$/.test(s) || CLIMAX_CUE_RE.test(s)) return "climax";
        return "development";
      }

      function sentenceSignature(sentenceText) {
        var s = String(sentenceText || "").trim();
        var w = s.toLowerCase().replace(/[^a-z0-9'\s]/g, "").split(/\s+/).filter(Boolean);
        return {
          wordCount: w.length,
          opener2: w.slice(0, 2).join(" "),
          isDressing: /\b(put\s+on|puts\s+on|zipper|zippers|hat|mittens|scarf|jacket|boots|coat|gloves)\b/i.test(s),
          isOutdoorPlay: /\b(go\s+outside|make\s+a\s+snowman|make\s+snow\s+angels|throw\s+snowballs|get\s+to\s+play)\b/i.test(s),
          possessiveTarget: /\b(her)\s+(hat|mittens|scarf|jacket|coat|boots)\b/i.test(s) ? "her" : /\b(my)\s+(hat|mittens|scarf|jacket|coat|boots)\b/i.test(s) ? "my" : ""
        };
      }

      function assignThoughtGroups(sentenceStrings, roles) {
        var n = sentenceStrings.length, sigs = sentenceStrings.map(sentenceSignature);
        var groupIds = new Array(n), currentGroupNum = 1, currentGroupSize = 0;
        for (var i = 0; i < n; i++) {
          if (i === 0) { groupIds[i] = "tg_" + currentGroupNum; currentGroupSize = 1; continue; }
          var prevSig = sigs[i - 1], curSig = sigs[i], prevRole = roles[i - 1], curRole = roles[i];
          var shouldGroup = false;
          var prevIsTitle = (i - 1 === 0 && prevSig.wordCount <= 3);
          var isClosing = (curRole === "closing");
          if (!prevIsTitle && !isClosing && currentGroupSize < 3) {
            if (prevSig.isDressing && curSig.isDressing) {
              if (!prevSig.possessiveTarget || !curSig.possessiveTarget || prevSig.possessiveTarget === curSig.possessiveTarget) shouldGroup = true;
            } else if (curSig.opener2 && curSig.opener2 === prevSig.opener2 && prevRole === curRole) {
              shouldGroup = true;
            } else if (i === 2 && prevRole === "opening" && curSig.wordCount <= 7 && /\btoday\b/i.test(sentenceStrings[i - 1]) && /\btoday\b/i.test(sentenceStrings[i])) {
              shouldGroup = true;
            } else if (prevSig.isOutdoorPlay && curSig.isOutdoorPlay && prevRole === curRole) {
              shouldGroup = true;
            }
          }
          if (shouldGroup) { groupIds[i] = "tg_" + currentGroupNum; currentGroupSize++; }
          else { currentGroupNum++; groupIds[i] = "tg_" + currentGroupNum; currentGroupSize = 1; }
        }
        var counts = {};
        for (var j = 0; j < n; j++) counts[groupIds[j]] = (counts[groupIds[j]] || 0) + 1;
        var seenInGroup = {}, meta = [];
        for (var k = 0; k < n; k++) {
          var gid = groupIds[k], gIdx = seenInGroup[gid] || 0;
          seenInGroup[gid] = gIdx + 1;
          var gSize = counts[gid], wave = 0;
          if (gSize >= 2) {
            if (gIdx === 0) wave = 0.03;
            else if (gIdx === gSize - 1) wave = -0.03;
          }
          meta.push({ thoughtGroupId: gid, thoughtGroupIndex: gIdx, thoughtGroupSize: gSize, isGroupLast: gIdx === gSize - 1, contourWave: wave });
        }
        return meta;
      }

      function escapeXml(str) {
        return String(str || "").replace(/[&<>'"]/g, function (ch) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[ch];
        });
      }

      function decorateEmphasisSSML(clauseText, emphasisWords) {
        var escaped = escapeXml(clauseText);
        if (!emphasisWords || !emphasisWords.length) return escaped;
        var sorted = emphasisWords.slice().sort(function (a, b) { return b.length - a.length; });
        var result = escaped;
        for (var i = 0; i < sorted.length; i++) {
          var kw = sorted[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          var re = new RegExp("\\b(" + kw + ")\\b", "i");
          result = result.replace(re, '<emphasis level="moderate">$1</emphasis>');
        }
        return result;
      }

      function buildSSML(planObj, voiceName) {
        var lang = (planObj.profile && planObj.profile.lang) || "en-US";
        var basePitch = (planObj.profile && planObj.profile.pitch) || 1.0;
        var lines = ['<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="' + escapeXml(lang) + '">'];
        if (voiceName) lines.push('  <voice name="' + escapeXml(voiceName) + '">');
        var items = planObj.plan || [];
        for (var i = 0; i < items.length; i++) {
          var seg = items[i];
          var ratePct = Math.round((seg.rate || 1.0) * 100) + "%";
          var relPitch = Math.round(((seg.pitch / basePitch) - 1.0) * 100);
          var pitchStr = (relPitch >= 0 ? "+" : "") + relPitch + "%";
          var preBreak = seg.pauseBeforeMs > 0 ? '<break time="' + seg.pauseBeforeMs + 'ms"/>' : "";
          var postBreak = seg.pauseAfterMs > 0 ? '<break time="' + seg.pauseAfterMs + 'ms"/>' : "";
          var inner = decorateEmphasisSSML(seg.text, seg.emphasisWords);
          var indent = voiceName ? "    " : "  ";
          lines.push(indent + preBreak + '<prosody rate="' + ratePct + '" pitch="' + pitchStr + '">' + inner + "</prosody>" + postBreak);
        }
        if (voiceName) lines.push("  </voice>");
        lines.push("</speak>");
        return lines.join("\n");
      }

      function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
      function round2(val) { return Number(val.toFixed(2)); }

      function planParagraph(text, profileOrId, opts) {
        opts = opts || {};
        var rawText = String(text || "").trim();
        var modeId = opts.mode === "learning" ? "learning" : "natural";
        var modeCfg = MODES[modeId];
        var profile = resolveProfile(profileOrId);
        var sentenceStrings = splitSentences(rawText);
        if (!sentenceStrings.length) sentenceStrings = [rawText];

        var isMultiSentence = sentenceStrings.length > 1;
        var preset = resolvePreset(opts.preset || opts.deliveryStyle || profile.style, modeId, isMultiSentence);
        var basePitch = profile.pitch;
        var userRate = typeof opts.rate === "number" ? opts.rate : 1.0;
        var baseRate = userRate * profile.rate * modeCfg.modeRateMul;
        var defaultClausePauseMs = opts.clausePauseMs != null
          ? opts.clausePauseMs
          : (modeId === "learning" ? Math.max(210, preset.clausePauseMs) : clamp(preset.clausePauseMs, 120, 200));

        var roles = [];
        for (var sIdx = 0; sIdx < sentenceStrings.length; sIdx++) {
          roles.push(detectNarrativeRole(sentenceStrings[sIdx], sIdx, sentenceStrings.length));
        }
        var thoughtMeta = assignThoughtGroups(sentenceStrings, roles);
        var sentencePlans = [], flatPlan = [];

        for (var i = 0; i < sentenceStrings.length; i++) {
          var sText = sentenceStrings[i];
          var sType = detectSentenceType(sText);
          var role = roles[i];
          var tg = thoughtMeta[i];
          var contentEmo = detectContentEmotion(sText, preset.id);
          var sKeywords = extractKeywords(sText);
          var pauseBeforeMs = 0;
          var sentencePauseAfterMs = 0;

          if (isMultiSentence) {
            if (i === sentenceStrings.length - 1) {
              sentencePauseAfterMs = preset.sectionPauseMs;
            } else if (!tg.isGroupLast) {
              sentencePauseAfterMs = modeId === "learning"
                ? modeCfg.thoughtGroupPauseMs
                : clamp(preset.thoughtGroupPauseMs + (tg.thoughtGroupIndex * 15), 220, 280);
            } else if (role === "opening" || role === "climax" || role === "contrast") {
              sentencePauseAfterMs = clamp(
                role === "opening" && i === 0 ? preset.sectionPauseMs : Math.round((preset.sentencePauseMs + preset.sectionPauseMs) / 2),
                420,
                540
              );
            } else {
              sentencePauseAfterMs = clamp(Math.max(420, preset.sentencePauseMs + 60), 420, 540);
            }
          }

          var pitchDirection = "falling";
          if (sType === "yn_question") pitchDirection = "rising";
          else if (sType === "wh_question") pitchDirection = "falling";
          else if (sType === "exclamation") pitchDirection = "rise_fall";
          else if (role === "closing") pitchDirection = "warm_fall";
          else if (!tg.isGroupLast) pitchDirection = tg.contourWave > 0 ? "sustained" : "falling";

          var roleRateMul = 1.0;
          if (role === "opening" && isMultiSentence && i === 0) roleRateMul = 0.96;
          else if (role === "contrast") roleRateMul = 0.96;
          else if (role === "climax") roleRateMul = 1.03;
          else if (role === "closing" && isMultiSentence) roleRateMul = 0.94;

          var emoRateMul = isMultiSentence ? contentEmo.rateMul : (contentEmo.guardrailTriggered ? contentEmo.rateMul : 1.0);
          var presetRateMul = isMultiSentence ? preset.rateMul : 1.0;
          var sentenceSpeakingRate = clamp(baseRate * presetRateMul * roleRateMul * emoRateMul, modeCfg.minRate * 0.5, modeCfg.maxRate * 2.0);

          var clauses = splitPhraseClauses(sText, { mode: modeId });
          if (!clauses.length) clauses = [sText];

          var clausePlans = [];
          for (var cIdx = 0; cIdx < clauses.length; cIdx++) {
            var clText = clauses[cIdx];
            var isLastClause = cIdx === clauses.length - 1;
            var isParagraphLast = (i === sentenceStrings.length - 1) && isLastClause;
            var cKeywords = extractKeywords(clText);
            var kw = cKeywords.length > 0;
            var pitch = basePitch;
            var rate = sentenceSpeakingRate;
            var wave = tg.contourWave || 0;

            if (sType === "yn_question") {
              if (isLastClause) {
                pitch = basePitch * (1.15 + (preset.pitchSpan - 0.14) * 0.25);
                if (pitch <= basePitch) pitch = basePitch * 1.15;
                rate *= 0.97;
              } else {
                pitch = basePitch * (1.03 + wave);
              }
            } else if (sType === "wh_question") {
              if (isLastClause) {
                pitch = basePitch * 0.82;
                if (pitch > basePitch * 0.95) pitch = basePitch * 0.82;
              } else {
                pitch = basePitch * (1.03 + wave);
              }
              rate *= 0.96;
            } else if (sType === "exclamation") {
              if (isLastClause) {
                pitch = basePitch * 0.96;
                if (pitch > basePitch) pitch = basePitch * 0.96;
              } else {
                pitch = basePitch * 1.07;
              }
              rate *= 1.03;
            } else {
              if (isLastClause) {
                var terminalFactor = 0.92;
                if (role === "closing" && isMultiSentence) terminalFactor = 0.90;
                else if (contentEmo.guardrailTriggered) terminalFactor = 0.90;
                else if (role === "climax") terminalFactor = 0.95;
                else if (role === "opening" && isMultiSentence && i === 0) terminalFactor = 0.94;
                pitch = basePitch * (terminalFactor + wave);
                if (pitch > basePitch) pitch = basePitch * 0.96;
              } else {
                var contFactor = 1.03 + (preset.pitchSpan - 0.14) * 0.2 + wave;
                pitch = basePitch * clamp(contFactor, 1.01, 1.08);
              }
            }

            if (kw) {
              var boost = clamp(preset.emphasisBoost || 0.07, 0.05, 0.12);
              rate *= (1 - boost);
            }

            pitch = clamp(round2(pitch), 0.1, 2.0);
            rate = clamp(round2(rate), 0.2, 4.0);

            if (isLastClause) {
              if (sType === "yn_question" && pitch <= basePitch) pitch = clamp(round2(basePitch + 0.08), 0.1, 2.0);
              else if (sType === "wh_question" && pitch > round2(0.95 * basePitch)) pitch = clamp(round2(basePitch * 0.82), 0.1, 2.0);
              else if ((sType === "exclamation" || sType === "statement") && pitch > basePitch) pitch = clamp(round2(basePitch * 0.95), 0.1, 2.0);
            }

            var vol = clamp(round2((preset.volumeMul || 1.0) * (contentEmo.volumeMul || 1.0)), 0.1, 1.0);
            var cPauseAfter = !isLastClause ? defaultClausePauseMs : (!isParagraphLast ? sentencePauseAfterMs : 0);

            var segPlan = {
              text: clText,
              sentenceType: sType,
              sentenceIndex: i,
              clauseIndex: cIdx,
              narrativeRole: role,
              thoughtGroupId: tg.thoughtGroupId,
              contourWave: wave,
              emotion: contentEmo.emotion,
              deliveryStyle: preset.id,
              mode: modeId,
              isLast: isLastClause,
              isParagraphLast: isParagraphLast,
              hasKeyword: kw,
              emphasisWords: cKeywords,
              pitchDirection: isLastClause ? pitchDirection : "sustained",
              pitch: pitch,
              speakingRate: round2(sentenceSpeakingRate),
              rate: rate,
              volume: vol,
              pauseBeforeMs: cIdx === 0 ? pauseBeforeMs : 0,
              pauseAfterMs: cPauseAfter
            };
            clausePlans.push(segPlan);
            flatPlan.push(segPlan);
          }

          sentencePlans.push({
            index: i,
            text: sText,
            sentenceType: sType,
            narrativeRole: role,
            emotion: contentEmo.emotion,
            guardrailTriggered: contentEmo.guardrailTriggered,
            thoughtGroupId: tg.thoughtGroupId,
            thoughtGroupIndex: tg.thoughtGroupIndex,
            thoughtGroupSize: tg.thoughtGroupSize,
            contourWave: tg.contourWave,
            speakingRate: round2(sentenceSpeakingRate),
            pitchDirection: pitchDirection,
            emphasisWords: sKeywords,
            pauseBeforeMs: pauseBeforeMs,
            pauseAfterMs: sentencePauseAfterMs,
            clauses: clausePlans
          });
        }

        var result = {
          mode: modeId,
          preset: preset.id,
          presetConfig: preset,
          profile: profile,
          sentenceType: sentencePlans.length ? sentencePlans[sentencePlans.length - 1].sentenceType : "statement",
          clauses: flatPlan.map(function (seg) { return seg.text; }),
          clausePauseMs: defaultClausePauseMs,
          sentences: sentencePlans,
          plan: flatPlan,
          toSSML: function (voiceName) { return buildSSML(result, voiceName); }
        };
        return result;
      }

      return {
        DELIVERY_PRESETS: DELIVERY_PRESETS,
        MODES: MODES,
        STYLE_TO_PRESET: STYLE_TO_PRESET,
        resolveProfile: resolveProfile,
        resolvePreset: resolvePreset,
        detectContentEmotion: detectContentEmotion,
        detectSentenceType: detectSentenceType,
        extractKeywords: extractKeywords,
        hasKeywords: hasKeywords,
        splitPhraseClauses: splitPhraseClauses,
        splitClauses: splitPhraseClauses,
        splitSentences: splitSentences,
        detectNarrativeRole: detectNarrativeRole,
        assignThoughtGroups: assignThoughtGroups,
        planParagraph: planParagraph,
        analyzeProsody: planParagraph,
        planToSSML: buildSSML
      };
    })(root);
  }

  root.ELW_TTS_PLANNER = planner;
  if (typeof window !== "undefined") {
    window.ELW_TTS_PLANNER = planner;
  }

  /* =========================================================================
   * PART 1: VOICE PROFILES, NEURAL VOICE SCORING & ALLOCATION
   * ========================================================================= */
  var MALE = /David|Guy|Daniel|Alex\b|Fred|Tom\b|Mark|George|Ryan|Aaron|Arthur|Oliver|Eric|Christopher|Roger|Brian|James|Steffan|Ralph|Albert|Rishi|Thomas|Lee\b|Gordon|William|Prabhat|Ravi|Junior|Male|\bman\b|x-(iom|iob|tpd|iol|gbd|gbb|rjs)/i;
  var FEMALE = /Zira|Samantha|Aria|Jenny|Karen|Moira|Tessa|Victoria|Susan|Hazel|Libby|Sonia|Emma|Ava\b|Allison|Fiona|Kate|Serena|Michelle|Natasha|Ana\b|Kathy|Catherine|Heera|Neerja|Clara|Female|woman|Google US English|x-(tpf|sfg|tpc|iog|gba|gbc|gbg|fis)/i;
  var CHILD = /\bAna\b|Junior|Child|Kid|Ivy|Maisie/i;
  function vGender(n) { return CHILD.test(n) && /Junior/i.test(n) ? "m" : FEMALE.test(n) && !/Male/i.test(n) ? "f" : MALE.test(n) ? "m" : "u"; }
  function vLang(v) { return String(v.lang || "").replace("_", "-").toLowerCase(); }

  var PROFILES = [
    { id: "adult_male", label: "Adult male", vi: "Nam trưởng thành", pitch: 0.7, rate: 0.95, gender: "m", lang: "en-US", line: "Hi, I'm Dad.",
      prefer: [/Guy|Christopher|David|Mark|Alex\b|x-iom/i, /Eric|Daniel|Ralph|Ryan|Steffan/i, MALE] },
    { id: "adult_female", label: "Adult female", vi: "Nữ trưởng thành", pitch: 1.2, rate: 1.0, gender: "f", lang: "en-US", line: "Hi, I'm Mom.",
      prefer: [/Aria|Jenny|Zira|Samantha|Google US English|x-tpf/i, /Michelle|Karen|Susan|Kathy|Emma/i, FEMALE] },
    { id: "young_male", label: "Young man", vi: "Nam thanh niên", pitch: 1.0, rate: 1.1, gender: "m", lang: "en-US", line: "Hey, I'm a teenager!",
      prefer: [/Eric|Steffan|Ryan|Aaron|Mark|Fred|x-iob/i, /Guy|Christopher|Daniel|Tom\b/i, MALE] },
    { id: "young_female", label: "Young woman", vi: "Nữ thanh niên", pitch: 1.45, rate: 1.08, gender: "f", lang: "en-AU", line: "Hi! Nice to meet you!",
      prefer: [/Natasha|Libby|Ava\b|Allison|Tessa|Karen|Emma|x-sfg/i, /Jenny|Michelle|Sonia|Google UK English Female/i, FEMALE] },
    { id: "child", label: "Child", vi: "Trẻ em", pitch: 1.85, rate: 0.92, gender: "f", lang: "en-US", line: "Hi! I'm seven years old!",
      prefer: [/\bAna\b|Junior|Child|Kid|Ivy|Maisie/i, /Jenny|Samantha|Google US English/i, FEMALE] },
    { id: "elderly", label: "Elderly", vi: "Người lớn tuổi", pitch: 0.55, rate: 0.78, gender: "m", lang: "en-GB", line: "Hello dear, I'm Grandpa.",
      prefer: [/Ryan|George|Arthur|Albert|Fred|Daniel|Thomas|Google UK English Male|x-gbd|x-rjs/i, /Roger|David|Ralph/i, MALE] }
  ];

  /* Character-specific prosody profiles (mapped onto base voice allocation) */
  var CHARACTER_PROFILES = {
    linh:      { id: "linh",      baseId: "young_female", label: "Linh (Young & Cheerful)", vi: "Linh (Trẻ & vui vẻ)",     pitch: 1.38, rate: 1.06, gender: "f", lang: "en-US", style: "cheerful", line: "Hey! Let's check this out together!" },
    barista:   { id: "barista",   baseId: "young_male",   label: "Barista (Friendly)",      vi: "Barista (Thân thiện)",    pitch: 1.05, rate: 1.02, gender: "m", lang: "en-US", style: "friendly", line: "Welcome in! What can I brew for you today?" },
    cashier:   { id: "cashier",   baseId: "adult_female", label: "Cashier (Polite)",        vi: "Thu ngân (Lịch sự)",      pitch: 1.16, rate: 0.96, gender: "f", lang: "en-US", style: "polite",   line: "Did you find everything okay today? Cash or card, please?" },
    mom:       { id: "mom",       baseId: "adult_female", label: "Mom (Warm)",              vi: "Mẹ (Ấm áp)",              pitch: 1.18, rate: 0.95, gender: "f", lang: "en-US", style: "warm",     line: "Good morning, sweetie! Have a wonderful day." },
    dad:       { id: "dad",       baseId: "adult_male",   label: "Dad (Calm)",              vi: "Bố (Điềm đạm)",           pitch: 0.78, rate: 0.95, gender: "m", lang: "en-US", style: "calm",     line: "Hey kiddo, take your time." },
    grandma:   { id: "grandma",   baseId: "adult_female", label: "Grandma (Gentle)",        vi: "Bà (Dịu dàng)",           pitch: 1.05, rate: 0.85, gender: "f", lang: "en-US", style: "gentle",   line: "Come here, my dear. Grandma has a story for you." },
    grandpa:   { id: "grandpa",   baseId: "elderly",      label: "Grandpa (Kind)",          vi: "Ông (Hiền từ)",           pitch: 0.60, rate: 0.80, gender: "m", lang: "en-US", style: "kind",     line: "Well now, let me tell you something." },
    butcher:   { id: "butcher",   baseId: "adult_male",   label: "Butcher (Helpful)",       vi: "Đầu bếp quầy thịt",       pitch: 0.82, rate: 0.94, gender: "m", lang: "en-US", style: "helpful",  line: "Fresh salmon and prime beef cut to order today!" },
    baker:     { id: "baker",     baseId: "adult_female", label: "Baker (Warm)",            vi: "Thợ bánh (Ấm áp)",        pitch: 1.22, rate: 0.97, gender: "f", lang: "en-US", style: "warm",     line: "Careful, the sourdough just came out of the oven!" },
    clerk:     { id: "clerk",     baseId: "young_male",   label: "Store Clerk (Friendly)",  vi: "Nhân viên siêu thị",      pitch: 1.02, rate: 1.00, gender: "m", lang: "en-US", style: "friendly", line: "Right down aisle three on your left!" },
    service:   { id: "service",   baseId: "adult_female", label: "Service Desk (Polite)",   vi: "Chăm sóc khách hàng",     pitch: 1.15, rate: 0.95, gender: "f", lang: "en-US", style: "polite",   line: "I'd be happy to help you with that refund right away." },
    waiter:    { id: "waiter",    baseId: "young_male",   label: "Waiter (Attentive)",      vi: "Phục vụ bàn (Chu đáo)",   pitch: 1.00, rate: 0.98, gender: "m", lang: "en-US", style: "polite",   line: "Here is our menu. Today's chef special is grilled salmon." },
    teacher:   { id: "teacher",   baseId: "adult_female", label: "Teacher (Clear)",         vi: "Giáo viên (Rõ ràng)",     pitch: 1.14, rate: 0.93, gender: "f", lang: "en-US", style: "clear",    line: "Good question! Let's look at the board together." },
    librarian: { id: "librarian", baseId: "adult_female", label: "Librarian (Gentle)",      vi: "Thủ thư (Nhẹ nhàng)",     pitch: 1.12, rate: 0.90, gender: "f", lang: "en-US", style: "gentle",   line: "You can borrow this book for two weeks." },
    nurse:     { id: "nurse",     baseId: "adult_female", label: "School Nurse (Caring)",   vi: "Y tá (Ân cần)",           pitch: 1.19, rate: 0.94, gender: "f", lang: "en-US", style: "warm",     line: "Lie down on the cot and drink some warm water." },
    ranger:    { id: "ranger",    baseId: "adult_male",   label: "Park Ranger (Steady)",    vi: "Kiểm lâm (Vững vàng)",    pitch: 0.80, rate: 0.94, gender: "m", lang: "en-US", style: "steady",   line: "Stay on the marked trail and keep your campsite clean." }
  };

  /* allocation order: most important / most specific first */
  var ORDER = ["adult_female", "adult_male", "child", "elderly", "young_male", "young_female"];
  function baseProf(id) {
    for (var i = 0; i < PROFILES.length; i++) if (PROFILES[i].id === id) return PROFILES[i];
    return PROFILES[1];
  }
  function prof(id) {
    if (id && CHARACTER_PROFILES[id]) {
      var cp = CHARACTER_PROFILES[id];
      var bp = baseProf(cp.baseId);
      return {
        id: bp.id,
        charId: cp.id,
        label: cp.label,
        vi: cp.vi,
        pitch: cp.pitch,
        rate: cp.rate,
        gender: cp.gender || bp.gender,
        lang: cp.lang || bp.lang,
        line: cp.line || bp.line,
        style: cp.style,
        prefer: bp.prefer
      };
    }
    return baseProf(id);
  }
  function getCharacterProfile(id) { return CHARACTER_PROFILES[id] || prof(id); }

  /* =========================================================================
   * PART 2: SPEAKING MODE & EMOTIONAL PRESET STATE ("elw_tts_prefs_v1")
   * ========================================================================= */
  var TTS_PREFS_KEY = "elw_tts_prefs_v1";
  var ttsPrefs = { mode: "natural", preset: "auto" };
  try {
    if (root.localStorage) {
      var rawPrefs = root.localStorage.getItem(TTS_PREFS_KEY);
      if (rawPrefs) {
        var parsedPrefs = JSON.parse(rawPrefs);
        if (parsedPrefs && (parsedPrefs.mode === "natural" || parsedPrefs.mode === "learning")) {
          ttsPrefs.mode = parsedPrefs.mode;
        }
        if (parsedPrefs && typeof parsedPrefs.preset === "string") {
          ttsPrefs.preset = parsedPrefs.preset;
        }
      }
    }
  } catch (e) {}

  function saveTtsPrefs() {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(TTS_PREFS_KEY, JSON.stringify(ttsPrefs));
      }
    } catch (e) {}
  }

  function getMode() {
    return ttsPrefs.mode === "learning" ? "learning" : "natural";
  }

  function setMode(m) {
    if (m === "learning" || m === "natural") {
      ttsPrefs.mode = m;
      saveTtsPrefs();
      syncStoryCardTtsBar();
    }
    return ttsPrefs.mode;
  }

  function getPreset() {
    return ttsPrefs.preset || "auto";
  }

  function setPreset(p) {
    if (p === "auto" || (planner.DELIVERY_PRESETS && planner.DELIVERY_PRESETS[p])) {
      ttsPrefs.preset = p;
      saveTtsPrefs();
      syncStoryCardTtsBar();
    }
    return ttsPrefs.preset;
  }

  /* =========================================================================
   * PART 3: PROSODY ANALYSIS & PARAGRAPH PLANNING DELEGATION
   * ========================================================================= */
  function detectSentenceType(text) {
    return planner.detectSentenceType(text);
  }

  function splitClauses(text, opts) {
    return planner.splitPhraseClauses(text, opts);
  }

  function detectContentEmotion(text, requestedPreset) {
    return planner.detectContentEmotion(text, requestedPreset);
  }

  function extractKeywords(text) {
    return planner.extractKeywords(text);
  }

  function analyzeProsody(text, profileId, opts) {
    opts = opts || {};
    var p = prof(profileId);
    var planOpts = {};
    for (var k in opts) planOpts[k] = opts[k];
    if (!planOpts.mode) planOpts.mode = "natural";
    if (planOpts.preset === "auto") delete planOpts.preset;
    return planner.planParagraph(text, p, planOpts);
  }

  function planParagraph(text, profileId, opts) {
    opts = opts || {};
    var p = prof(profileId);
    var planOpts = {};
    for (var k in opts) planOpts[k] = opts[k];
    if (!planOpts.mode) planOpts.mode = getMode();
    var activePreset = planOpts.preset || getPreset();
    if (activePreset && activePreset !== "auto") {
      planOpts.preset = activePreset;
    } else {
      delete planOpts.preset;
    }
    return planner.planParagraph(text, p, planOpts);
  }

  function toSSML(textOrPlan, profileId, opts) {
    if (textOrPlan && typeof textOrPlan === "object" && Array.isArray(textOrPlan.plan)) {
      var v0 = pick((textOrPlan.profile && textOrPlan.profile.id) || profileId);
      return planner.planToSSML(textOrPlan, v0 ? v0.name : undefined);
    }
    var planObj = planParagraph(textOrPlan, profileId, opts);
    var v = pick(planObj.profile.id);
    return planObj.toSSML(v ? v.name : undefined);
  }

  /* =========================================================================
   * PART 4: CLOUD NEURAL TTS EVALUATION & SAFE PROXY ADAPTER (OPTION C)
   * Zero API keys in client code; disabled by default; automatic fallback.
   * ========================================================================= */
  var CLOUD_TTS_EVALUATION = {
    recommendedDefault: "browser_neural_with_prosody_planner",
    securityPolicy: "NO_CLIENT_API_KEYS — Never embed API keys in frontend JavaScript. Cloud Neural TTS must only be called through a user-owned backend proxy.",
    providers: {
      browser_edge_natural: {
        id: "browser_edge_natural",
        name: "Browser Web Speech API (Microsoft Edge Online Natural / Google Voices)",
        voices: ["Microsoft Aria Online (Natural)", "Microsoft Jenny Online (Natural)", "Microsoft Guy Online (Natural)", "Microsoft Ana Online (Natural)", "Google US English"],
        prosodySupport: "Paragraph Prosody Planner (pitch/rate/volume contour + preserved comma continuation + variable thought-group pauses)",
        costPer1MCharsUsd: 0,
        latencyMs: "10–60ms",
        requiresBackendProxy: false,
        verdictVi: "Mặc định tối ưu cho ứng dụng client-only: miễn phí 100%, không cần server, giọng Microsoft Natural trên Edge và Google trên Chrome rất tự nhiên khi kết hợp Paragraph Prosody Planner."
      },
      azure_neural_ssml: {
        id: "azure_neural_ssml",
        name: "Azure AI Speech (Neural TTS + mstts:express-as SSML)",
        voices: ["en-US-AriaNeural", "en-US-JennyNeural", "en-US-GuyNeural", "en-US-AnaNeural"],
        prosodySupport: "Full W3C SSML + <mstts:express-as style='cheerful|empathetic|chat|narration-relaxed'> + <prosody> + <break>",
        costPer1MCharsUsd: 16,
        freeTierMonthlyChars: 500000,
        latencyMs: "180–350ms",
        requiresBackendProxy: true,
        verdictVi: "Lựa chọn số 1 nếu triển khai Cloud Proxy: hỗ trợ trực tiếp đầu ra ELW_VOICES.toSSML() và nhãn cảm xúc mstts:express-as."
      },
      openai_mini_tts: {
        id: "openai_mini_tts",
        name: "OpenAI Audio Speech (gpt-4o-mini-tts)",
        voices: ["coral", "nova", "alloy", "ash", "sage", "shimmer"],
        prosodySupport: "Steerable natural-language delivery instructions (tone, emotion, pacing) without raw SSML tags",
        costPer1MCharsUsd: 15,
        latencyMs: "250–500ms",
        requiresBackendProxy: true,
        verdictVi: "Biểu cảm kể chuyện rất tự nhiên qua chỉ dẫn giọng đọc, nhưng không điều khiển được độ trễ <break> chính xác từng mili-giây như SSML."
      },
      google_cloud_neural2: {
        id: "google_cloud_neural2",
        name: "Google Cloud Text-to-Speech (Neural2 / Journey)",
        voices: ["en-US-Journey-F", "en-US-Journey-D", "en-US-Neural2-F", "en-US-Neural2-J"],
        prosodySupport: "W3C SSML (<prosody>, <break>, <emphasis>) on Neural2 voices",
        costPer1MCharsUsd: 16,
        freeTierMonthlyChars: 1000000,
        latencyMs: "180–320ms",
        requiresBackendProxy: true,
        verdictVi: "Ổn định, tương thích tốt với chuẩn W3C SSML từ ELW_VOICES.toSSML()."
      },
      elevenlabs_flash: {
        id: "elevenlabs_flash",
        name: "ElevenLabs (Flash v2.5 / Multilingual v2)",
        voices: ["Rachel", "Sarah", "Charlie", "River"],
        prosodySupport: "Context-aware neural prosody with stability & style exaggeration parameters",
        costPer1MCharsUsd: 100,
        latencyMs: "150–400ms",
        requiresBackendProxy: true,
        verdictVi: "Giàu cảm xúc nhất cho kể chuyện, nhưng chi phí cao gấp ~6 lần Azure/Google/OpenAI."
      }
    }
  };

  var cloudEndpointCfg = {
    enabled: false,
    provider: "azure_neural_ssml",
    endpointUrl: "",
    headers: {},
    timeoutMs: 6000,
    synthesize: null
  };

  function configureCloudEndpoint(cfg) {
    cfg = cfg || {};
    cloudEndpointCfg.enabled = Boolean(cfg.enabled && (cfg.endpointUrl || typeof cfg.synthesize === "function"));
    if (typeof cfg.provider === "string") cloudEndpointCfg.provider = cfg.provider;
    if (typeof cfg.endpointUrl === "string") cloudEndpointCfg.endpointUrl = cfg.endpointUrl.trim();
    if (cfg.headers && typeof cfg.headers === "object") cloudEndpointCfg.headers = cfg.headers;
    if (typeof cfg.timeoutMs === "number" && cfg.timeoutMs > 0) cloudEndpointCfg.timeoutMs = cfg.timeoutMs;
    if (typeof cfg.synthesize === "function") cloudEndpointCfg.synthesize = cfg.synthesize;
    return getCloudConfig();
  }

  function getCloudConfig() {
    return {
      enabled: cloudEndpointCfg.enabled,
      provider: cloudEndpointCfg.provider,
      endpointUrl: cloudEndpointCfg.endpointUrl,
      timeoutMs: cloudEndpointCfg.timeoutMs,
      hasCustomSynthesizer: typeof cloudEndpointCfg.synthesize === "function"
    };
  }

  /* =========================================================================
   * PART 5: BROWSER SPEECH SYNTHESIS & VOICE SELECTION
   * ========================================================================= */
  function synth() { try { return root.speechSynthesis || null; } catch (e) { return null; } }
  function available() {
    var s = synth(); if (!s || !s.getVoices) return [];
    var v = []; try { v = s.getVoices() || []; } catch (e) { return []; }
    return v.filter(function (x) { return /^en([-_]|$)/i.test(x.lang || ""); });
  }
  function score(p, v, idx) {
    var n = v.name || "", sc = 0, g = vGender(n), l = vLang(v);
    p.prefer.forEach(function (re, k) { if (re.test(n)) sc += 30 - k * 8; });
    if (p.gender === "m") sc += g === "m" ? 20 : g === "f" ? -50 : 0;
    if (p.gender === "f") sc += g === "f" ? 20 : g === "m" ? -50 : 0;
    if (CHILD.test(n)) sc += p.id === "child" ? 40 : -25;
    if (l === p.lang.toLowerCase()) sc += 8; else if (l.slice(0, 2) === "en") sc += 2;
    /* Strongly prefer Natural / Neural / Google / Online browser voices over legacy desktop SAPI5 */
    if (/Natural|Neural/i.test(n)) sc += 32;
    else if (/\bGoogle\b/i.test(n)) sc += 22;
    else if (/Online|Enhanced|Premium|Siri/i.test(n)) sc += 16;
    if (v.localService) sc += 1;
    return sc - idx * 0.01;
  }
  var cache = null, cacheKey = "";
  function allocate() {
    var list = available(), key = list.map(function (v) { return v.name + "|" + v.lang; }).join(";");
    if (cache && key === cacheKey) return cache;
    var map = {}, used = [];
    if (list.length) ORDER.forEach(function (id) {
      var p = baseProf(id), best = null, bs = -1e9;
      list.forEach(function (v, i) {
        var sc = score(p, v, i);
        if (used.indexOf(v) >= 0) sc -= 1000; /* reuse only if unavoidable */
        if (sc > bs) { bs = sc; best = v; }
      });
      map[id] = best; if (best && used.indexOf(best) < 0) used.push(best);
    });
    cache = map; cacheKey = key; return map;
  }
  (function hook() {
    var s = synth(); if (!s) return;
    var reset = function () { cache = null; allocate(); };
    try { if (s.addEventListener) s.addEventListener("voiceschanged", reset); else s.onvoiceschanged = reset; } catch (e) {}
  })();
  function pick(profileId) { try { return allocate()[prof(profileId).id] || null; } catch (e) { return null; } }
  function describe(profileId) {
    var p = prof(profileId), v = pick(p.id);
    return (v ? v.name : "Default voice") + " · pitch " + p.pitch + " · rate " + p.rate;
  }

  var ttsAudio = (root && root.ELW_TTS_AUDIO) || null;
  if (!ttsAudio && typeof require === "function") {
    try { ttsAudio = require("./tts-audio.js"); } catch (e) {}
  }
  if (!ttsAudio) {
    ttsAudio = (function (globalRoot) {
      var DEFAULT_BASE_DIR = "assets/audio";
      var SYNTHETIC_TEST_NORMS = new Set([
        "first i open the door, and then i look outside",
        "do you want to build a snowman today?",
        "where is my warm scarf?",
        "hi"
      ]);
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
        var norm = normalizeText(s);
        var h1 = 0x811c9dc5;
        var h2 = 0x01000193;
        for (var i = 0; i < norm.length; i++) {
          var c = norm.charCodeAt(i);
          h1 ^= c;
          h1 = Math.imul(h1, 0x01000193);
          h2 ^= (c * 31) & 0xffff;
          h2 = Math.imul(h2, 0x85ebca6b);
        }
        return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
      }
      function splitSentences(text) {
        var cleaned = cleanSpokenText(text);
        if (!cleaned) return [];
        if (planner && typeof planner.splitSentences === "function") {
          var res = planner.splitSentences(cleaned);
          if (Array.isArray(res) && res.length) return res;
        }
        return (cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned]).map(function (x) { return x.trim(); }).filter(Boolean);
      }
      function getBaseDir() {
        var win = (typeof window !== "undefined" ? window : globalRoot) || {};
        return win.ELW_AUDIO_BASE_DIR || DEFAULT_BASE_DIR;
      }
      function audioUrlForHash(hash, opts) {
        var base = (opts && opts.baseDir) || getBaseDir();
        var suffix = opts && opts.slowFile ? "_slow.mp3" : ".mp3";
        return base.replace(/\/+$/, "") + "/" + hash + suffix;
      }
      function audioUrlForText(text, opts) {
        return audioUrlForHash(hashText(text), opts);
      }
      function canUseExternalAudio() {
        var win = (typeof window !== "undefined" ? window : globalRoot) || {};
        if (typeof Audio === "undefined") return false;
        if (win.ELW_NO_EXTERNAL_AUDIO === true || win.ELW_SINGLE_FILE === true) return false;
        if (win.ELW_FORCE_EXTERNAL_AUDIO === true) return true;
        if (typeof location !== "undefined" && /^about:/i.test(String(location.href || ""))) return false;
        if (win.ELW_PET_ASSETS && typeof win.ELW_PET_ASSETS === "object") return false;
        if (typeof document !== "undefined") {
          var hasExternalModuleScript = !!document.querySelector('script[src*="modules/"]');
          if (!hasExternalModuleScript && document.scripts && document.scripts.length > 0) {
            return false;
          }
        }
        return true;
      }
      var currentAudio = null;
      var currentSettle = null;
      var currentPauseTimer = null;
      var activeGeneration = 0;
      var activeAudioCount = 0;
      var maxConcurrentAudio = 0;
      var overlapCount = 0;
      var playedMp3Count = 0;
      var fallbackCount = 0;
      var lastPlayedHash = null;
      var lastPlayedUrl = null;
      var lastCurrentTime = 0;
      var playHistory = [];
      var preloadCache = new Map();
      var missingHashes = new Set();
      var origSynthCancel = null, origSynthPause = null, origSynthResume = null, origSpeakingGetter = null, origPausedGetter = null;

      function installSpeechSynthesisBridge() {
        if (typeof window === "undefined" || !("speechSynthesis" in window) || !window.speechSynthesis) return;
        var s = window.speechSynthesis;
        if (s.__elwAudioBridgeInstalled) return;
        try {
          var proto = Object.getPrototypeOf(s) || s;
          var spkDesc = Object.getOwnPropertyDescriptor(s, "speaking") || Object.getOwnPropertyDescriptor(proto, "speaking");
          var psdDesc = Object.getOwnPropertyDescriptor(s, "paused") || Object.getOwnPropertyDescriptor(proto, "paused");
          origSpeakingGetter = spkDesc && spkDesc.get ? spkDesc.get.bind(s) : null;
          origPausedGetter = psdDesc && psdDesc.get ? psdDesc.get.bind(s) : null;
          origSynthCancel = typeof s.cancel === "function" ? s.cancel.bind(s) : null;
          origSynthPause = typeof s.pause === "function" ? s.pause.bind(s) : null;
          origSynthResume = typeof s.resume === "function" ? s.resume.bind(s) : null;
          Object.defineProperty(s, "speaking", {
            configurable: true,
            enumerable: true,
            get: function () {
              var nativeSpk = false;
              try { if (origSpeakingGetter) nativeSpk = !!origSpeakingGetter(); } catch (e) {}
              return nativeSpk || isSpeaking();
            }
          });
          Object.defineProperty(s, "paused", {
            configurable: true,
            enumerable: true,
            get: function () {
              var nativePsd = false;
              try { if (origPausedGetter) nativePsd = !!origPausedGetter(); } catch (e) {}
              return nativePsd || isPaused();
            }
          });
          s.cancel = function () {
            cancelAudioOnly();
            try { if (origSynthCancel) origSynthCancel(); } catch (e) {}
          };
          s.pause = function () {
            pause();
            try { if (origSynthPause) origSynthPause(); } catch (e) {}
          };
          s.resume = function () {
            resume();
            try { if (origSynthResume) origSynthResume(); } catch (e) {}
          };
          s.__elwAudioBridgeInstalled = true;
        } catch (e) {}
      }
      function rawSynthCancel() {
        if (origSynthCancel) {
          try { origSynthCancel(); } catch (e) {}
        }
      }
      function isSpeaking() { return !!(currentAudio || currentPauseTimer); }
      function isPaused() { return !!(currentAudio && currentAudio.paused && currentAudio.currentTime > 0 && !currentAudio.ended); }
      function stopCurrentAudioElement() {
        if (currentPauseTimer) { clearTimeout(currentPauseTimer); currentPauseTimer = null; }
        if (currentAudio) {
          var a = currentAudio;
          currentAudio = null;
          try {
            if (a.currentTime > 0) lastCurrentTime = a.currentTime;
            a.onended = null; a.onerror = null; a.ontimeupdate = null;
            a.pause();
          } catch (e) {}
          activeAudioCount = Math.max(0, activeAudioCount - 1);
        }
        if (currentSettle) {
          var fn = currentSettle;
          currentSettle = null;
          try { fn("cancelled"); } catch (e) {}
        }
      }
      function cancelAudioOnly() { activeGeneration++; stopCurrentAudioElement(); }
      function cancelAll() { cancelAudioOnly(); rawSynthCancel(); }
      function pause() { if (currentAudio && !currentAudio.paused) { try { currentAudio.pause(); } catch (e) {} } }
      function resume() { if (currentAudio && currentAudio.paused) { try { currentAudio.play(); } catch (e) {} } }
      function preloadByHash(hash, opts) {
        if (!hash || !canUseExternalAudio() || missingHashes.has(hash)) return null;
        if (!isHashInManifest(hash, opts && opts.slowFile)) return null;
        if (preloadCache.has(hash)) return preloadCache.get(hash);
        try {
          var url = audioUrlForHash(hash, opts);
          var audio = new Audio();
          audio.preload = "auto";
          audio.src = url;
          if (preloadCache.size >= 40) {
            var oldestKey = preloadCache.keys().next().value;
            preloadCache.delete(oldestKey);
          }
          preloadCache.set(hash, audio);
          return audio;
        } catch (e) { return null; }
      }
      function preload(text, opts) {
        var norm = normalizeText(text);
        if (!norm || SYNTHETIC_TEST_NORMS.has(norm)) return null;
        return preloadByHash(hashText(text), opts);
      }
      function resolvePlaybackRate(opts) {
        var o = opts || {};
        var mode = o.mode || getMode();
        if (typeof o.playbackRate === "number" && o.playbackRate > 0) return Math.max(0.7, Math.min(1.25, o.playbackRate));
        if (mode === "learning") {
          if (typeof o.rate === "number" && o.rate < 0.88) return Math.max(0.75, Math.min(0.9, o.rate));
          return 0.85;
        }
        if (typeof o.rate === "number" && o.rate > 0) {
          if (o.rate <= 0.82) return 0.85;
          if (o.rate >= 1.08) return 1.06;
        }
        return 1.0;
      }
      function applyPreservesPitch(audio, rate) {
        try {
          audio.defaultPlaybackRate = rate;
          audio.playbackRate = rate;
          if ("preservesPitch" in audio) audio.preservesPitch = true;
          if ("mozPreservesPitch" in audio) audio.mozPreservesPitch = true;
          if ("webkitPreservesPitch" in audio) audio.webkitPreservesPitch = true;
        } catch (e) {}
      }
      // Manifest check: skip mp3 attempt if hash not in build manifest (avoids
      // NotSupportedError delay from server returning HTML for missing files).
      function isHashInManifest(hash, slowFile) {
        try {
          var w = (typeof window !== "undefined" ? window : (typeof root !== "undefined" ? root : {})) || {};
          var m = w.ELW_AUDIO_MANIFEST;
          if (!m || typeof m.has !== "function") return true;
          return m.has(slowFile ? hash + "_slow" : hash);
        } catch (e) { return true; }
      }

      function playSingleHashMp3(hash, text, opts, gen) {
        return new Promise(function (resolve) {
          if (gen !== activeGeneration) return resolve({ ok: false, reason: "cancelled" });
          if (!hash || missingHashes.has(hash) || !canUseExternalAudio()) return resolve({ ok: false, reason: "unavailable" });
          if (!isHashInManifest(hash, opts && opts.slowFile)) return resolve({ ok: false, reason: "not_in_manifest" });
          if (currentAudio) stopCurrentAudioElement();
          var url = audioUrlForHash(hash, opts);
          var audio = preloadCache.get(hash);
          if (audio) {
            preloadCache.delete(hash);
            try { audio.currentTime = 0; } catch (e) { audio = new Audio(url); }
          } else {
            audio = new Audio(url);
          }
          var pbRate = resolvePlaybackRate(opts);
          applyPreservesPitch(audio, pbRate);
          var settled = false;
          var startedAt = Date.now();
          var maxTimeObserved = 0;
          var finish = function (ok, reason) {
            if (settled) return;
            settled = true;
            clearTimeout(loadTimer);
            clearTimeout(playCapTimer);
            if (currentSettle === onCancel) currentSettle = null;
            if (currentAudio === audio) {
              currentAudio = null;
              activeAudioCount = Math.max(0, activeAudioCount - 1);
            }
            try {
              if (audio.currentTime > maxTimeObserved) maxTimeObserved = audio.currentTime;
              if (maxTimeObserved > 0) lastCurrentTime = maxTimeObserved;
              audio.onended = null; audio.onerror = null; audio.ontimeupdate = null;
            } catch (e) {}
            if (ok) {
              playedMp3Count++;
              lastPlayedHash = hash;
              lastPlayedUrl = url;
              playHistory.push({ type: "mp3", hash: hash, text: text, url: url, playbackRate: pbRate, start: startedAt, end: Date.now(), currentTime: maxTimeObserved });
              if (playHistory.length > 60) playHistory.shift();
            }
            resolve({ ok: ok, reason: reason, hash: hash, url: url, currentTime: maxTimeObserved });
          };
          var onCancel = function () { finish(false, "cancelled"); };
          currentSettle = onCancel;
          currentAudio = audio;
          activeAudioCount++;
          if (activeAudioCount > 1) overlapCount++;
          if (activeAudioCount > maxConcurrentAudio) maxConcurrentAudio = activeAudioCount;
          var loadTimer = setTimeout(function () {
            if (maxTimeObserved <= 0) { missingHashes.add(hash); finish(false, "load_timeout"); }
          }, 2800);
          var playCapTimer = setTimeout(function () { finish(maxTimeObserved > 0, "max_duration_cap"); }, 25000);
          audio.ontimeupdate = function () {
            try { if (audio.currentTime > maxTimeObserved) { maxTimeObserved = audio.currentTime; lastCurrentTime = maxTimeObserved; } } catch (e) {}
          };
          audio.onended = function () {
            try { if (audio.duration && Number.isFinite(audio.duration) && audio.duration > maxTimeObserved) maxTimeObserved = audio.duration; } catch (e) {}
            finish(true, "ended");
          };
          audio.onerror = function () { missingHashes.add(hash); finish(false, "error"); };
          try {
            startedAt = Date.now();
            var playPromise = audio.play();
            if (playPromise && typeof playPromise.then === "function") {
              playPromise.catch(function (err) {
                var msg = String((err && err.name) || (err && err.message) || err || "");
                if (/NotSupportedError|NotFoundError/i.test(msg)) missingHashes.add(hash);
                finish(false, "play_rejected:" + msg);
              });
            }
          } catch (err) { finish(false, "play_throw"); }
        });
      }
      function waitPause(ms, gen) {
        var dur = Math.max(0, Math.min(2000, Number(ms) || 0));
        if (!dur || gen !== activeGeneration) return Promise.resolve();
        return new Promise(function (resolve) {
          currentPauseTimer = setTimeout(function () { currentPauseTimer = null; resolve(); }, dur);
        });
      }
      function computeSentencePauseMs(sentText, profileId, opts) {
        if (planner && typeof planner.planParagraph === "function") {
          try {
            var p = planner.planParagraph(sentText, profileId || "adult_female", opts || {});
            if (p && p.clauses && p.clauses.length) return p.clauses[p.clauses.length - 1].pauseAfterMs || 260;
          } catch (e) {}
        }
        return /\?$/.test(sentText) ? 320 : /!$/.test(sentText) ? 300 : 250;
      }
      async function speakAudio(text, profileOrVoiceId, opts, fallbackSegmentFn) {
        installSpeechSynthesisBridge();
        var o = typeof opts === "number" ? { rate: opts } : Object.assign({}, opts || {});
        var cleaned = cleanSpokenText(text);
        var norm = normalizeText(cleaned);
        if (!norm || !/[a-z]/i.test(norm)) {
          if (typeof o.onend === "function") { try { o.onend(); } catch (e) {} }
          return { mode: "empty", hashes: [] };
        }
        var gen = activeGeneration;
        // Character-specific voices must use browser TTS — pre-generated MP3s use a generic voice
        var CHARACTER_VOICES = ["mom","dad","grandma","grandpa","barista","cashier","waiter","teacher","librarian","nurse","ranger","clerk","service","butcher","baker","linh"];
        var profId = String(profileOrVoiceId||"").toLowerCase();
        var isCharacterVoice = false;
        for (var ci=0; ci<CHARACTER_VOICES.length; ci++) { if (profId===CHARACTER_VOICES[ci] || profId.indexOf(CHARACTER_VOICES[ci])>=0) { isCharacterVoice=true; break; } }
        if (!canUseExternalAudio() || SYNTHETIC_TEST_NORMS.has(norm) || isCharacterVoice) {
          fallbackCount++;
          if (typeof fallbackSegmentFn === "function") await fallbackSegmentFn(cleaned, profileOrVoiceId, o);
          if (typeof o.onend === "function") { try { o.onend(); } catch (e) {} }
          return { mode: "fallback", hashes: [] };
        }
        var fullHash = hashText(cleaned);
        var sents = splitSentences(cleaned);
        if (sents.length > 1) {
          preload(sents[0], o);
          if (sents[1]) preload(sents[1], o);
        }
        var fullTry = await playSingleHashMp3(fullHash, cleaned, o, gen);
        if (fullTry.ok) {
          if (typeof o.onend === "function" && gen === activeGeneration) { try { o.onend(); } catch (e) {} }
          return { mode: "mp3", hashes: [fullHash] };
        }
        if (gen !== activeGeneration || fullTry.reason === "cancelled") return { mode: "cancelled", hashes: [] };
        if (sents.length > 1) {
          var playedHashes = [];
          var usedMp3 = false, usedFallback = false;
          for (var i = 0; i < sents.length; i++) {
            if (gen !== activeGeneration) return { mode: "cancelled", hashes: playedHashes };
            var sText = sents[i];
            var sNorm = normalizeText(sText);
            if (!sNorm) continue;
            if (i + 1 < sents.length) preload(sents[i + 1], o);
            var sHash = hashText(sText);
            var sTry = await playSingleHashMp3(sHash, sText, o, gen);
            if (gen !== activeGeneration || sTry.reason === "cancelled") return { mode: "cancelled", hashes: playedHashes };
            if (sTry.ok) {
              usedMp3 = true;
              playedHashes.push(sHash);
            } else {
              usedFallback = true;
              fallbackCount++;
              if (typeof fallbackSegmentFn === "function") {
                await fallbackSegmentFn(sText, profileOrVoiceId, Object.assign({}, o, { onend: null }));
              }
            }
            if (i + 1 < sents.length && gen === activeGeneration) {
              var pauseMs = computeSentencePauseMs(sText, profileOrVoiceId, o);
              await waitPause(pauseMs, gen);
            }
          }
          if (typeof o.onend === "function" && gen === activeGeneration) { try { o.onend(); } catch (e) {} }
          return { mode: usedMp3 && usedFallback ? "mixed" : (usedMp3 ? "mp3" : "fallback"), hashes: playedHashes };
        }
        fallbackCount++;
        playHistory.push({ type: "fallback", hash: fullHash, text: cleaned, start: Date.now() });
        if (playHistory.length > 60) playHistory.shift();
        if (typeof fallbackSegmentFn === "function" && gen === activeGeneration) {
          await fallbackSegmentFn(cleaned, profileOrVoiceId, Object.assign({}, o, { onend: null }));
        }
        if (typeof o.onend === "function" && gen === activeGeneration) { try { o.onend(); } catch (e) {} }
        return { mode: "fallback", hashes: [] };
      }
      function getStats() {
        return {
          playedMp3Count: playedMp3Count,
          fallbackCount: fallbackCount,
          overlapCount: overlapCount,
          maxConcurrentAudio: maxConcurrentAudio,
          activeAudioCount: activeAudioCount,
          lastPlayedHash: lastPlayedHash,
          lastPlayedUrl: lastPlayedUrl,
          lastCurrentTime: currentAudio && currentAudio.currentTime > 0 ? currentAudio.currentTime : lastCurrentTime,
          history: playHistory.slice()
        };
      }
      function resetStats() {
        playedMp3Count = 0; fallbackCount = 0; overlapCount = 0; maxConcurrentAudio = 0;
        lastPlayedHash = null; lastPlayedUrl = null; lastCurrentTime = 0;
        playHistory.length = 0; missingHashes.clear();
      }
      installSpeechSynthesisBridge();
      return {
        normalizeText: normalizeText,
        cleanSpokenText: cleanSpokenText,
        hashText: hashText,
        splitSentences: splitSentences,
        audioUrlForHash: audioUrlForHash,
        audioUrlForText: audioUrlForText,
        canUseExternalAudio: canUseExternalAudio,
        installSpeechSynthesisBridge: installSpeechSynthesisBridge,
        rawSynthCancel: rawSynthCancel,
        isSpeaking: isSpeaking,
        isPaused: isPaused,
        getCurrentAudio: function () { return currentAudio; },
        preload: preload,
        preloadByHash: preloadByHash,
        speak: speakAudio,
        cancel: cancelAll,
        cancelAudioOnly: cancelAudioOnly,
        pause: pause,
        resume: resume,
        getStats: getStats,
        resetStats: resetStats
      };
    })(root);
  }
  root.ELW_TTS_AUDIO = ttsAudio;
  if (typeof window !== "undefined") {
    window.ELW_TTS_AUDIO = ttsAudio;
  }

  // Hook ELW_READING.play so default "auto" mode reads full sentences with Voice C MP3s instead of 2-word fragments
  (function hookReadingModule() {
    var rd = (root && root.ELW_READING) || (typeof window !== "undefined" ? window.ELW_READING : null);
    if (!rd || rd.__elwVoiceCHooked || typeof rd.play !== "function") return;
    var origPlay = rd.play;
    rd.play = function (text, level, o, speakFn, isCancelled, onChunk) {
      var opts = Object.assign({}, o || {});
      if (ttsAudio && ttsAudio.canUseExternalAudio() && (!opts.mode || opts.mode === "auto")) {
        opts.mode = "flow";
      }
      return origPlay.call(this, text, level, opts, speakFn, isCancelled, onChunk);
    };
    rd.__elwVoiceCHooked = true;
  })();

  var activeUtterance = null;
  var speakQueue = Promise.resolve();
  var cancelToken = 0;
  var lastClauseElapsedMs = 100;

  function cancel() {
    cancelToken++;
    activeUtterance = null;
    try {
      if (ttsAudio && typeof ttsAudio.cancelAudioOnly === "function") ttsAudio.cancelAudioOnly();
    } catch (e) {}
    try {
      var s = synth();
      if (s && typeof s.cancel === "function") s.cancel();
    } catch (e) {}
  }

  function isSpeaking() {
    var s = synth();
    var busy = false;
    try { busy = !!(s && s.speaking); } catch (e) {}
    var audioBusy = false;
    try { audioBusy = !!(ttsAudio && ttsAudio.isSpeaking()); } catch (e) {}
    return Boolean(activeUtterance || busy || audioBusy);
  }

  function waitSynthQuiet(s, maxMs, myToken) {
    maxMs = maxMs || 6000;
    return new Promise(function (r) {
      var t0 = Date.now();
      function ck() {
        if (myToken != null && myToken !== cancelToken) { r(); return; }
        var busy = false;
        try { busy = !!(s && s.speaking); } catch (e) {}
        if (!busy || Date.now() - t0 > maxMs) r();
        else setTimeout(ck, 60);
      }
      ck();
    });
  }

  function speakOneClause(s, segPlan, p, v, opts, myToken) {
    return new Promise(function (resolve) {
      if ((myToken != null && myToken !== cancelToken) || (opts && typeof opts.isCancelled === "function" && opts.isCancelled())) {
        resolve();
        return;
      }

      function startUtterance() {
        if ((myToken != null && myToken !== cancelToken) || (opts && typeof opts.isCancelled === "function" && opts.isCancelled())) {
          resolve();
          return;
        }
        var done = false, t, u = null, tStart = Date.now();
        function fin() {
          if (!done) {
            done = true;
            clearTimeout(t);
            if (activeUtterance === u) activeUtterance = null;
            var elapsed = Date.now() - tStart;
            lastClauseElapsedMs = elapsed;
            if ((myToken != null && myToken !== cancelToken) || (opts && typeof opts.isCancelled === "function" && opts.isCancelled())) {
              resolve();
              return;
            }
            /* Pause between clauses/sentences in real speech; stay fast (10ms) in unit-test mocks */
            var pause = segPlan.pauseAfterMs || 0;
            if (pause > 0) {
              var actualPause = (elapsed < 25 && !opts.forceRealPause) ? 10 : pause;
              setTimeout(resolve, actualPause);
            } else {
              resolve();
            }
          }
        }
        try {
          if (opts && typeof opts.onClause === "function") {
            try { opts.onClause(segPlan); } catch (e) {}
          }
          u = new root.SpeechSynthesisUtterance(segPlan.text);
          activeUtterance = u;
          if (v) { u.voice = v; u.lang = v.lang; } else u.lang = p.lang;
          u.pitch = segPlan.pitch;
          u.rate = segPlan.rate;
          u.volume = segPlan.volume != null ? segPlan.volume : (opts.volume != null ? opts.volume : 1);
          u.onend = fin;
          u.onerror = fin;
          t = setTimeout(fin, 3200 + String(segPlan.text).length * 145 / (u.rate || 1));
          s.speak(u);
        } catch (e) { fin(); }
      }

      var prePause = segPlan.pauseBeforeMs || 0;
      if (prePause > 0) {
        var actualPrePause = (lastClauseElapsedMs < 25 && !opts.forceRealPause) ? 8 : prePause;
        setTimeout(startUtterance, actualPrePause);
      } else {
        startUtterance();
      }
    });
  }

  function tryCloudSpeak(text, prosodyPlan, v, opts, myToken) {
    if (!cloudEndpointCfg.enabled) return Promise.resolve(false);
    var payload = {
      text: String(text || ""),
      ssml: prosodyPlan.toSSML(v ? v.name : undefined),
      profileId: prosodyPlan.profile && prosodyPlan.profile.charId ? prosodyPlan.profile.charId : (prosodyPlan.profile ? prosodyPlan.profile.id : "adult_female"),
      mode: prosodyPlan.mode,
      preset: prosodyPlan.preset,
      provider: cloudEndpointCfg.provider,
      plan: prosodyPlan.plan
    };
    if (typeof cloudEndpointCfg.synthesize === "function") {
      return Promise.resolve().then(function () {
        if (myToken !== cancelToken) return true;
        return cloudEndpointCfg.synthesize(payload, opts);
      }).then(function (ok) {
        return ok !== false;
      }).catch(function () {
        return false;
      });
    }
    if (cloudEndpointCfg.endpointUrl && typeof root.fetch === "function" && typeof root.Audio === "function") {
      return root.fetch(cloudEndpointCfg.endpointUrl, {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, cloudEndpointCfg.headers || {}),
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res || !res.ok) throw new Error("Cloud TTS HTTP " + (res ? res.status : "error"));
        return res.blob();
      }).then(function (blob) {
        if (myToken !== cancelToken) return true;
        return new Promise(function (resolve) {
          var url = URL.createObjectURL(blob);
          var audio = new root.Audio(url);
          var cleanup = function () { try { URL.revokeObjectURL(url); } catch (e) {} resolve(true); };
          audio.onended = cleanup;
          audio.onerror = function () { try { URL.revokeObjectURL(url); } catch (e) {} resolve(false); };
          audio.play().catch(function () { resolve(false); });
        });
      }).catch(function () {
        return false;
      });
    }
    return Promise.resolve(false);
  }

  function fallbackBrowserSpeak(segText, segProfileId, segOpts, myToken) {
    segOpts = segOpts || {};
    if (myToken !== cancelToken || (typeof segOpts.isCancelled === "function" && segOpts.isCancelled())) {
      return Promise.resolve();
    }
    var s = synth();
    if (!s || typeof root.SpeechSynthesisUtterance !== "function" || !segText) {
      return Promise.resolve();
    }
    return waitSynthQuiet(s, 6000, myToken).then(function () {
      if (myToken !== cancelToken || (typeof segOpts.isCancelled === "function" && segOpts.isCancelled())) {
        return Promise.resolve();
      }
      var prosody = segOpts._useCurrentPrefs
        ? planParagraph(segText, segProfileId, segOpts)
        : analyzeProsody(segText, segProfileId, segOpts);
      var p = prosody.profile;
      var v = pick(p.id);

      return tryCloudSpeak(segText, prosody, v, segOpts, myToken).then(function (handledByCloud) {
        if (handledByCloud) return;
        var chain = Promise.resolve();
        var lastSentenceIdx = -1;
        prosody.plan.forEach(function (segPlan) {
          chain = chain.then(function () {
            if (myToken !== cancelToken || (typeof segOpts.isCancelled === "function" && segOpts.isCancelled())) {
              return;
            }
            if (typeof segOpts.onSentence === "function" && segPlan.sentenceIndex !== lastSentenceIdx) {
              lastSentenceIdx = segPlan.sentenceIndex;
              var sentObj = prosody.sentences && prosody.sentences[segPlan.sentenceIndex];
              try { segOpts.onSentence(sentObj || segPlan, segPlan.sentenceIndex); } catch (e) {}
            }
            return speakOneClause(s, segPlan, p, v, segOpts, myToken);
          });
        });
        return chain;
      });
    });
  }

  function speak(text, profileId, opts) {
    opts = typeof opts === "number" ? { rate: opts } : (opts || {});
    var myToken = cancelToken;
    var run = function () {
      if (myToken !== cancelToken || (typeof opts.isCancelled === "function" && opts.isCancelled())) {
        return Promise.resolve();
      }
      if (!text) return Promise.resolve();
      var audioRuntime = (root && root.ELW_TTS_AUDIO) || ttsAudio;
      if (audioRuntime && typeof audioRuntime.speak === "function" && !cloudEndpointCfg.enabled && audioRuntime.canUseExternalAudio()) {
        return audioRuntime.speak(text, profileId, opts, function (segText, segProf, segOpts) {
          return fallbackBrowserSpeak(segText, segProf || profileId, segOpts || opts, myToken);
        });
      }
      return fallbackBrowserSpeak(text, profileId, opts, myToken).then(function () {
        if (typeof opts.onend === "function" && myToken === cancelToken) {
          try { opts.onend(); } catch (e) {}
        }
        return { mode: "fallback", hashes: [] };
      });
    };
    speakQueue = speakQueue.then(run, run);
    return speakQueue;
  }

  function speakParagraph(text, profileId, opts) {
    opts = opts || {};
    var merged = { _useCurrentPrefs: true };
    for (var k in opts) merged[k] = opts[k];
    if (!merged.mode) merged.mode = getMode();
    if (!merged.preset && getPreset() !== "auto") merged.preset = getPreset();
    return speak(text, profileId, merged);
  }

  function speakPhrase(text, profileId, opts) {
    opts = opts || {};
    var merged = { mode: opts.mode || "learning", preset: opts.preset || "clear_learning" };
    for (var k in opts) if (k !== "mode" && k !== "preset") merged[k] = opts[k];
    return speak(text, profileId, merged);
  }

  function preview(profileId) { return speak(prof(profileId).line, profileId); }

  root.ELW_VOICES = {
    PROFILES: PROFILES,
    CHARACTER_PROFILES: CHARACTER_PROFILES,
    DELIVERY_PRESETS: planner.DELIVERY_PRESETS,
    MODES: planner.MODES,
    CLOUD_TTS_EVALUATION: CLOUD_TTS_EVALUATION,
    AUDIO: ttsAudio,
    getCharacterProfile: getCharacterProfile,
    getMode: getMode,
    setMode: setMode,
    getPreset: getPreset,
    setPreset: setPreset,
    detectSentenceType: detectSentenceType,
    detectContentEmotion: detectContentEmotion,
    extractKeywords: extractKeywords,
    splitClauses: splitClauses,
    analyzeProsody: analyzeProsody,
    planParagraph: planParagraph,
    toSSML: toSSML,
    pick: pick,
    speak: speak,
    speakParagraph: speakParagraph,
    speakPhrase: speakPhrase,
    cancel: cancel,
    isSpeaking: isSpeaking,
    available: available,
    describe: describe,
    preview: preview,
    allocate: allocate,
    configureCloudEndpoint: configureCloudEndpoint,
    getCloudConfig: getCloudConfig
  };

  /* =========================================================================
   * PART 6: DIALOGUE PLAYER & MOM SVG (ELW_DIALOGUE)
   * ========================================================================= */
  var NS = "http://www.w3.org/2000/svg";
  function makeMom(svgNS) {
    var ns = svgNS || NS, g = document.createElementNS(ns, "g");
    g.setAttribute("class", "mom idle");
    g.innerHTML =
      '<ellipse cx="0" cy="0" rx="26" ry="7" fill="#000" opacity=".2"/>' +
      '<g class="mom-bob">' +
      '<rect x="-10" y="-50" width="10" height="48" rx="5" fill="#f2c9a0"/><rect x="1" y="-50" width="10" height="48" rx="5" fill="#ecc095"/>' +
      '<ellipse cx="-5" cy="-2" rx="9" ry="5" fill="#8a2f3c"/><ellipse cx="6" cy="-2" rx="9" ry="5" fill="#9c3646"/>' +
      '<g transform="translate(0,-56)">' +
      '<path d="M-22 10 L22 10 L16 -40 L-16 -40Z" fill="#3f8f7a"/>' +            /* skirt/dress */
      '<rect x="-17" y="-52" width="34" height="44" rx="12" fill="#4aa58c"/>' +
      '<rect x="-12" y="-14" width="24" height="26" rx="4" fill="#fff3e3" opacity=".9"/>' + /* apron */
      '<rect x="-5" y="-60" width="10" height="10" fill="#f2c9a0"/>' +
      '<path d="M-26 -78 Q-30 -40 -14 -46 L-14 -78Z" fill="#2f2018"/>' +          /* long hair back */
      '<circle cx="0" cy="-78" r="23" fill="#f2c9a0"/>' +
      '<path d="M-24 -78 Q-24 -108 2 -106 Q26 -104 24 -80 Q12 -98 -6 -90 Q-16 -86 -24 -78Z" fill="#2f2018"/>' +
      '<circle cx="-4" cy="-108" r="9" fill="#2f2018"/>' +                        /* bun */
      '<circle cx="11" cy="-77" r="2.8" fill="#2d2a26"/><circle cx="-1" cy="-77" r="2.5" fill="#2d2a26"/>' +
      '<path d="M8 -83 q3 -2.5 6 0 M-4 -83 q2.5 -2 5 0" fill="none" stroke="#2d2a26" stroke-width="1.4" stroke-linecap="round"/>' +
      '<ellipse class="mom-mouth" cx="7" cy="-66" rx="4.5" ry="1.6" fill="#c0584a"/>' +
      '<circle cx="16" cy="-70" r="4" fill="#f7a8a0" opacity=".7"/>' +
      '<circle cx="-22" cy="-74" r="2.2" fill="#f2c94c"/>' +                      /* earring */
      '<g transform="translate(4,-44)"><rect x="-5" y="0" width="11" height="40" rx="5.5" fill="#4aa58c"/><circle cx="0.5" cy="42" r="6.5" fill="#f2c9a0"/></g>' +
      '</g></g>';
    return g;
  }
  var css = [
    ".mom .mom-bob{transform-box:fill-box;transform-origin:50% 100%}",
    ".mom.idle .mom-bob{animation:momBreathe 3s ease-in-out infinite}",
    ".mom.talk .mom-bob{animation:momBob .5s ease-in-out infinite}",
    ".mom .mom-mouth{transform-box:fill-box;transform-origin:center}",
    ".mom.talk .mom-mouth{animation:momTalk .22s ease-in-out infinite alternate}",
    "@keyframes momBreathe{50%{transform:scaleY(1.012)}}",
    "@keyframes momBob{50%{transform:translateY(-2px)}}",
    "@keyframes momTalk{from{transform:scaleY(.6)}to{transform:scaleY(2.2)}}",
    ".dlg-box{--accent:#e8743b;--line:#e3d6c3;font-family:inherit;background:#fffdf9;border:1px solid var(--line);border-radius:16px;padding:12px;color:#2d2a26;box-shadow:0 6px 24px #5a3d1f1a;max-width:520px}",
    ".dlg-head{display:flex;align-items:center;gap:8px;margin-bottom:8px}",
    ".dlg-title{font-weight:800;flex:1}.dlg-title small{display:block;font-weight:500;color:#7a7166}",
    ".dlg-lvl{background:#fff6ef;color:var(--accent);border:1px solid var(--accent);border-radius:999px;font-size:12px;padding:1px 8px;font-weight:700}",
    ".dlg-btn{border:1px solid var(--line);background:#fff;border-radius:10px;padding:5px 9px;cursor:pointer;font-size:13px;color:#2d2a26}",
    ".dlg-btn:hover{border-color:var(--accent)}",
    ".dlg-log{display:flex;flex-direction:column;gap:8px;max-height:300px;overflow:auto;padding:2px}",
    ".dlg-row{display:flex;gap:8px;align-items:flex-end}.dlg-row.me{flex-direction:row-reverse}",
    ".dlg-av{width:34px;height:34px;flex:none;border-radius:50%;background:#e9f5f1;border:1px solid var(--line);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:18px}",
    ".dlg-row.me .dlg-av{background:#fff1e0}",
    ".dlg-bub{background:#f6efe4;border:1px solid var(--line);border-radius:14px 14px 14px 4px;padding:7px 10px;max-width:78%;line-height:1.35}",
    ".dlg-row.me .dlg-bub{background:#fff1e6;border-color:#f3c3a3;border-radius:14px 14px 4px 14px}",
    ".dlg-vi{display:block;color:#7a7166;font-size:13px;margin-top:2px}.dlg-box.novi .dlg-vi{display:none}",
    ".dlg-say{border:0;background:none;cursor:pointer;font-size:14px;padding:0 0 0 4px}",
    ".dlg-act{font-size:12px;color:#3a9d5d;font-style:italic;align-self:center}",
    ".dlg-choices{display:flex;flex-direction:column;gap:6px;margin-top:10px}",
    ".dlg-choice{text-align:left;border:1px solid var(--line);background:#fff;border-radius:12px;padding:8px 11px;cursor:pointer;font-size:15px;color:#2d2a26}",
    ".dlg-choice:hover:not(:disabled){border-color:var(--accent);background:#fff6ef}",
    ".dlg-choice.bad{border-color:#d9534f;background:#fdeeee}",
    ".dlg-choice small{display:block;color:#7a7166;font-size:12px}.dlg-box.novi .dlg-choice small{display:none}",
    ".dlg-fb{color:#b33b2e;font-size:14px;margin-top:6px}",
    ".dlg-wait{color:#7a7166;font-size:13px;margin-top:8px}",
    ".dlg-done{margin-top:10px;font-weight:700;color:#3a9d5d}",
    ".elw-tts-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px;padding:7px 10px;background:#fffaf2;border:1px solid #e3d6c3;border-radius:12px;font-size:13px;max-width:100%;box-sizing:border-box}",
    ".elw-tts-grp{display:flex;flex-wrap:wrap;align-items:center;gap:4px;min-width:0;max-width:100%}",
    ".elw-tts-lbl{color:#7a7166;font-size:12px;font-weight:600;margin-right:2px}",
    ".elw-tts-mode-btn{border:1px solid #e3d6c3;background:#fff;color:#2d2a26;border-radius:999px;padding:4px 9px;font-size:12.5px;cursor:pointer;line-height:1.2;max-width:100%;box-sizing:border-box}",
    ".elw-tts-mode-btn.on{background:#e8743b;color:#fff;border-color:#e8743b;font-weight:700}",
    ".elw-tts-sel{border:1px solid #e3d6c3;background:#fff;color:#2d2a26;border-radius:8px;padding:4px 7px;font-size:12.5px;max-width:100%;min-width:0;box-sizing:border-box}"
  ].join("\n");

  function L(who, en, vi, extra) { var o = { who: who, en: en, vi: vi }; for (var k in extra || {}) o[k] = extra[k]; return o; }
  function C(en, vi, correct, feedbackVi) { return { en: en, vi: vi, correct: !!correct, feedbackVi: feedbackVi || "" }; }

  var SCRIPTS = [
    { id: "breakfast", title: "Breakfast time", titleVi: "Giờ ăn sáng", level: "A1", lines: [
      L("mom", "Good morning, sweetie! Can you get the milk from the fridge?", "Chào buổi sáng con yêu! Con lấy giúp mẹ sữa trong tủ lạnh được không?"),
      L("me", "Sure, Mom!", "Vâng ạ, mẹ!", { choices: [
        C("Sure, Mom!", "Vâng ạ, mẹ!", true),
        C("No, I am a fridge.", "Không, con là cái tủ lạnh.", false, "Câu này không hợp lý. Hãy đồng ý giúp mẹ một cách lịch sự."),
        C("Good night!", "Chúc ngủ ngon!", false, "Đang là buổi sáng mà! Mẹ đang nhờ con lấy sữa.")] }),
      L("me", "I'm opening the fridge.", "Con đang mở tủ lạnh.", { action: "open_fridge" }),
      L("me", "Here's the milk.", "Sữa đây ạ.", { action: "take_milk" }),
      L("mom", "Thanks, sweetie! Please close the fridge.", "Cảm ơn con yêu! Con đóng tủ lạnh lại nhé."),
      L("me", "OK!", "Vâng!", { action: "close_fridge" })] },
    { id: "tidy", title: "Tidy up", titleVi: "Dọn dẹp", level: "A1", lines: [
      L("mom", "The floor is dirty. Could you sweep the floor, please?", "Sàn nhà bẩn rồi. Con quét nhà giúp mẹ được không?"),
      L("me", "Of course!", "Tất nhiên rồi ạ!", { choices: [
        C("Of course!", "Tất nhiên rồi ạ!", true),
        C("I'm eating the floor.", "Con đang ăn sàn nhà.", false, "Nghe buồn cười quá! Hãy trả lời là con sẽ giúp."),
        C("It's blue.", "Nó màu xanh.", false, "Mẹ không hỏi màu sắc. Mẹ nhờ con quét nhà.")] }),
      L("me", "I'm sweeping the floor.", "Con đang quét nhà.", { action: "sweep_floor" }),
      L("mom", "Great job! And can you wipe the table too?", "Giỏi lắm! Con lau bàn luôn được không?"),
      L("me", "No problem.", "Không vấn đề gì ạ.", { action: "wipe_table" }),
      L("mom", "Wow, it's so clean now. Thank you!", "Ồ, giờ sạch quá. Cảm ơn con!")] },
    { id: "movie", title: "Movie night", titleVi: "Tối xem phim", level: "A2", lines: [
      L("mom", "Do you want to watch a movie tonight?", "Tối nay con có muốn xem phim không?"),
      L("me", "Yes, I'd love to!", "Có ạ, con rất thích!", { choices: [
        C("Yes, I'd love to!", "Có ạ, con rất thích!", true),
        C("Yes, I'd love to the TV.", "Có, con muốn tới cái TV.", false, "Sai ngữ pháp. Nói: \"I'd love to!\" là đủ."),
        C("I'm a movie.", "Con là bộ phim.", false, "Câu này không đúng nghĩa. Hãy nói con muốn xem.")] }),
      L("mom", "Could you turn on the TV?", "Con bật TV lên được không?"),
      L("me", "Sure.", "Vâng ạ.", { action: "turn_on_tv" }),
      L("mom", "Pull out a chair and sit down, sweetie.", "Kéo ghế ra và ngồi xuống đi con."),
      L("me", "OK, I'm pulling out the chair.", "Vâng, con đang kéo ghế ra.", { action: "pull_out_chair" }),
      L("me", "This is comfy.", "Thoải mái quá.", { action: "sit_on_chair" }),
      L("mom", "Enjoy the movie!", "Xem phim vui nhé!", { action: "watch_tv" })] },
    { id: "thirsty", title: "Thirsty", titleVi: "Khát nước", level: "A1", lines: [
      L("mom", "You look thirsty. Would you like some milk?", "Trông con khát nước. Con có muốn uống sữa không?"),
      L("me", "Yes, please.", "Vâng, con muốn ạ.", { choices: [
        C("Yes, please.", "Vâng, con muốn ạ.", true),
        C("Yes, I'm hungry milk.", "Có, con đói sữa.", false, "Không tự nhiên. Câu lịch sự là \"Yes, please.\""),
        C("Please yes milk give.", "Làm ơn có sữa đưa.", false, "Sai trật tự từ. Hãy nói \"Yes, please.\"")] }),
      L("mom", "Pick up a cup first.", "Con lấy cái cốc trước nhé."),
      L("me", "Got it.", "Con lấy rồi ạ.", { action: "pick_up_cup" }),
      L("me", "I'm pouring the milk.", "Con đang rót sữa.", { action: "pour_milk" }),
      L("me", "Mmm, it's yummy!", "Ừm, ngon quá!", { action: "drink_from_cup" }),
      L("mom", "Good! Don't forget to put the milk back.", "Tốt lắm! Đừng quên cất sữa lại nhé."),
      L("me", "I won't.", "Con không quên đâu ạ.", { action: "put_milk_back" })] },
    { id: "fresh_air", title: "Fresh air", titleVi: "Không khí trong lành", level: "A1", lines: [
      L("mom", "It's hot in here, isn't it?", "Trong này nóng quá, phải không con?"),
      L("me", "Yes, it is. Should I open the window?", "Vâng ạ. Con mở cửa sổ nhé?", { choices: [
        C("Yes, it is. Should I open the window?", "Vâng ạ. Con mở cửa sổ nhé?", true),
        C("Yes, it is cold. Let's close the fridge.", "Vâng, lạnh quá. Đóng tủ lạnh đi.", false, "Mẹ nói trời nóng, không phải lạnh."),
        C("No, it is a window.", "Không, nó là cái cửa sổ.", false, "Câu này không trả lời câu hỏi của mẹ.")] }),
      L("mom", "Yes, please. Thank you!", "Ừ, con mở đi. Cảm ơn con!"),
      L("me", "There you go.", "Xong rồi ạ.", { action: "open_window" }),
      L("mom", "Ah, that's much better.", "À, dễ chịu hơn nhiều rồi.")] },
    { id: "plants", title: "Plants", titleVi: "Cây xanh", level: "A2", lines: [
      L("mom", "The plant looks a little dry.", "Cái cây trông hơi khô."),
      L("me", "I can water it for you.", "Con có thể tưới cho mẹ.", { choices: [
        C("I can water it for you.", "Con có thể tưới cho mẹ.", true),
        C("I can drink it for you.", "Con có thể uống nó cho mẹ.", false, "Mình tưới cây (water), không uống cây!"),
        C("The plant is sleeping.", "Cái cây đang ngủ.", false, "Cái cây cần nước, hãy đề nghị tưới cây.")] }),
      L("mom", "That's so kind of you.", "Con thật ngoan."),
      L("me", "I'm watering the plant.", "Con đang tưới cây.", { action: "water_plant" }),
      L("mom", "It looks happy now!", "Giờ nó trông vui hẳn!")] },
    { id: "lost_book", title: "Lost book", titleVi: "Quyển sách bị rơi", level: "A2", lines: [
      L("mom", "Is that your book on the floor?", "Có phải sách của con ở trên sàn không?"),
      L("me", "Oh, yes! Sorry, Mom.", "Ồ, đúng rồi! Con xin lỗi mẹ.", { choices: [
        C("Oh, yes! Sorry, Mom.", "Ồ, đúng rồi! Con xin lỗi mẹ.", true),
        C("Yes, it's your floor.", "Vâng, đó là sàn của mẹ.", false, "Mẹ hỏi về quyển sách, không phải sàn nhà."),
        C("No, I am a book.", "Không, con là quyển sách.", false, "Câu này không hợp lý. Hãy nhận là sách của con.")] }),
      L("mom", "Could you pick it up and put it on the table?", "Con nhặt lên và để lên bàn được không?"),
      L("me", "Sure.", "Vâng ạ.", { action: "pick_up_book" }),
      L("me", "It's on the table now.", "Giờ nó ở trên bàn rồi ạ.", { action: "put_book_on_table" }),
      L("mom", "Thanks, sweetie. Now nobody will step on it.", "Cảm ơn con yêu. Giờ không ai giẫm lên nó nữa.")] },
    { id: "bedtime", title: "Bedtime", titleVi: "Giờ đi ngủ", level: "B1", lines: [
      L("mom", "It's getting late. Time for bed, sweetie.", "Muộn rồi. Đến giờ đi ngủ rồi con yêu."),
      L("me", "Can I watch five more minutes?", "Con xem thêm năm phút được không ạ?", { choices: [
        C("Can I watch five more minutes?", "Con xem thêm năm phút được không ạ?", true),
        C("Can I watching more five minute?", "Con đang xem thêm năm phút?", false, "Sai ngữ pháp: sau \"Can I\" dùng động từ nguyên thể, và nói \"five more minutes\"."),
        C("Good morning, Mom!", "Chào buổi sáng mẹ!", false, "Đang là buổi tối mà!")] }),
      L("mom", "No, not tonight. Please turn off the TV.", "Tối nay thì không. Con tắt TV đi nhé."),
      L("me", "OK, Mom.", "Vâng, mẹ.", { action: "turn_off_tv" }),
      L("mom", "And could you close the window? It's cold at night.", "Và con đóng cửa sổ được không? Ban đêm trời lạnh."),
      L("me", "Sure. Good night, Mom!", "Vâng ạ. Chúc mẹ ngủ ngon!", { action: "close_window" }),
      L("mom", "Good night. Sweet dreams!", "Chúc ngủ ngon. Mơ đẹp nhé!")] }
  ];

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var cssDone = false;
  function injectCss() {
    if (cssDone || typeof document === "undefined" || !document.head) return;
    cssDone = true;
    var s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  }

  function createPlayer(o) {
    o = o || {}; injectCss();
    var container = o.container, speakFn = o.speak || speak, enqueue = o.enqueue || function () {}, onLine = o.onLine || function () {};
    var meVoice = o.meVoice || "young_male", momVoice = "adult_female";
    var token = 0, waiting = null, box = null, showVi = true;
    function say(line) { return Promise.resolve(speakFn(line.en, line.voice || (line.who === "mom" ? momVoice : (api.meVoice || meVoice)))).catch(function () {}); }
    function bubble(line, log) {
      var row = el("div", "dlg-row " + line.who);
      row.appendChild(el("div", "dlg-av", line.who === "mom" ? "👩" : "🧒"));
      var b = el("div", "dlg-bub", esc(line.en) + '<button class="dlg-say" title="Nghe lại" aria-label="replay">🔊</button><span class="dlg-vi">' + esc(line.vi) + "</span>");
      b.querySelector(".dlg-say").onclick = function () { say(line); };
      row.appendChild(b); log.appendChild(row); log.scrollTop = log.scrollHeight;
      return row;
    }
    function stop() {
      token++; if (waiting) { waiting.resolve(false); waiting = null; }
      cancel();
      if (container) container.innerHTML = "";
    }
    function start(scriptId) {
      stop(); var my = token;
      var sc = SCRIPTS.filter(function (s) { return s.id === scriptId; })[0];
      if (!sc || !container) return Promise.resolve(false);
      box = el("div", "dlg-box" + (showVi ? "" : " novi"));
      var head = el("div", "dlg-head", '<span class="dlg-lvl">' + sc.level + '</span><div class="dlg-title">' + esc(sc.title) + "<small>" + esc(sc.titleVi) + '</small></div><button class="dlg-btn dlg-vt">VI</button><button class="dlg-btn dlg-x" aria-label="close">✕</button>');
      head.querySelector(".dlg-vt").onclick = function () { showVi = !showVi; box.classList.toggle("novi", !showVi); };
      head.querySelector(".dlg-x").onclick = stop;
      var log = el("div", "dlg-log"), foot = el("div");
      box.appendChild(head); box.appendChild(log); box.appendChild(foot); container.appendChild(box);
      function alive() { return my === token; }
      function choose(line) {
        return new Promise(function (res) {
          var wrap = el("div", "dlg-choices"), fb = el("div", "dlg-fb");
          line.choices.forEach(function (c) {
            var bt = el("button", "dlg-choice", esc(c.en) + "<small>" + esc(c.vi) + "</small>");
            bt.dataset.correct = c.correct ? "1" : "0";
            bt.onclick = function () {
              if (c.correct) { foot.innerHTML = ""; res(c); }
              else { bt.classList.add("bad"); bt.disabled = true; fb.textContent = "✗ " + (c.feedbackVi || "Chưa đúng, thử lại nhé!"); }
            };
            wrap.appendChild(bt);
          });
          foot.innerHTML = ""; foot.appendChild(wrap); foot.appendChild(fb);
        });
      }
      function act(id) {
        return new Promise(function (res) {
          waiting = { id: id, resolve: res };
          foot.innerHTML = '<div class="dlg-wait">⏳ ' + esc(id.replace(/_/g, " ")) + "…</div>";
          try { enqueue(id); } catch (e) { waiting = null; res(false); }
        });
      }
      return (async function () {
        for (var i = 0; i < sc.lines.length; i++) {
          if (!alive()) return false;
          var line = sc.lines[i];
          if (line.choices) { var c = await choose(line); if (!alive()) return false; line = Object.assign({}, line, { en: c.en, vi: c.vi }); }
          bubble(line, log); onLine(line, i, sc);
          await say(line); if (!alive()) return false;
          if (line.action) {
            var okAct = await act(line.action); if (!alive()) return false;
            foot.innerHTML = ""; log.appendChild(el("div", "dlg-act", (okAct ? "✓ " : "⚠ Không làm được (xem chuỗi hành động): ") + esc(line.action.replace(/_/g, " "))));
          }
        }
        foot.innerHTML = '<div class="dlg-done">🎉 Hoàn thành! Well done!</div>';
        if (o.onDone) o.onDone(sc);
        return true;
      })();
    }
    var api = {
      start: start, stop: stop, meVoice: meVoice,
      actionDone: function (id, ok) { if (waiting && (!id || waiting.id === id)) { var w = waiting; waiting = null; w.resolve(ok !== false); } }
    };
    return api;
  }

  root.ELW_DIALOGUE = {
    makeMom: makeMom,
    css: css,
    SCRIPTS: SCRIPTS,
    createPlayer: createPlayer,
    ALLOWED_ACTIONS: ["open_fridge","take_milk","put_milk_back","close_fridge","pick_up_cup","put_cup_on_table","pour_milk","drink_from_cup","wipe_table","put_book_on_table","sweep_under_table","pull_out_chair","sit_on_chair","get_up","push_chair_in","sweep_floor","open_window","close_window","water_plant","pick_up_book","turn_on_tv","watch_tv","turn_off_tv"]
  };

  /* =========================================================================
   * PART 7: AUTOMATIC INTEGRATION WITH ELW_READING & #storyCard UI BAR
   * ========================================================================= */
  var PRESET_UI_OPTIONS = [
    { id: "auto",                  label: "✨ Tự động theo ngữ cảnh" },
    { id: "storytelling",          label: "📖 Kể chuyện (Storytelling)" },
    { id: "friendly_conversation", label: "💬 Trò chuyện thân thiện" },
    { id: "curious",               label: "🔍 Tò mò khám phá" },
    { id: "happy_excited",         label: "🌟 Vui vẻ hào hứng" },
    { id: "gentle_comforting",     label: "🌿 Nhẹ nhàng ấm áp" },
    { id: "clear_learning",        label: "🎯 Học phát âm rõ" },
    { id: "character_dialogue",    label: "🎭 Nhập vai nhân vật" }
  ];

  function patchReadingModule() {
    var R = root.ELW_READING;
    if (!R || R.__prosodyPatched) return;
    R.__prosodyPatched = true;
    var origDescribe = R.describe;

    R.speakPlan = function (text, level, o) {
      o = o || {};
      var c = R.cfg ? R.cfg(level, o) : { rate: 0.9, mode: "flow", pauseMs: 300, level: level || "A2" };
      /* Determine whether to plan in Natural Mode or Learning Mode */
      var effMode = getMode();
      if (o.mode === "chunk") effMode = "learning";
      else if (o.mode === "flow") effMode = "natural";

      var speedFactor = 1.0;
      if (o.speed === "slow") speedFactor = 0.82;
      else if (o.speed === "medium") speedFactor = 0.94;
      else if (o.speed === "natural") speedFactor = 1.02;
      else if (typeof o.rate === "number") speedFactor = o.rate;

      var activePreset = (o.preset && o.preset !== "auto") ? o.preset : (getPreset() !== "auto" ? getPreset() : undefined);
      var pObj = planParagraph(text, o.voice || "adult_female", {
        mode: effMode,
        preset: activePreset,
        rate: speedFactor
      });

      if (effMode === "learning") {
        return pObj.plan.map(function (seg) {
          return {
            text: seg.text,
            rate: seg.rate,
            pitch: seg.pitch,
            pauseBeforeMs: seg.pauseBeforeMs || 0,
            pauseAfterMs: seg.pauseAfterMs,
            narrativeRole: seg.narrativeRole,
            thoughtGroupId: seg.thoughtGroupId,
            emotion: seg.emotion,
            pitchDirection: seg.pitchDirection,
            emphasisWords: seg.emphasisWords,
            mode: "learning",
            preset: pObj.preset
          };
        });
      }

      /* Natural Mode: plan sentence-by-sentence with thought-group cohesion (220–280ms)
       * and narrative transitions (420–540ms), while each sentence preserves internal comma prosody. */
      return pObj.sentences.map(function (s) {
        return {
          text: s.text,
          rate: s.speakingRate,
          pauseBeforeMs: s.pauseBeforeMs || 0,
          pauseAfterMs: s.pauseAfterMs,
          narrativeRole: s.narrativeRole,
          thoughtGroupId: s.thoughtGroupId,
          emotion: s.emotion,
          pitchDirection: s.pitchDirection,
          emphasisWords: s.emphasisWords,
          clauses: s.clauses,
          mode: "natural",
          preset: pObj.preset
        };
      });
    };

    if (typeof origDescribe === "function") {
      R.describe = function (level, st) {
        var base = origDescribe.call(R, level, st);
        var mLbl = getMode() === "learning" ? "🎓 Học rõ cụm ý" : "🎭 Tự nhiên";
        var pId = getPreset();
        var pDef = planner.DELIVERY_PRESETS && planner.DELIVERY_PRESETS[pId];
        var pLbl = pId === "auto" ? "cảm xúc tự động" : (pDef ? pDef.label : pId);
        return base + " · " + mLbl + " (" + pLbl + ")";
      };
    }
  }

  function updateReadInfoInStoryCard(storyCard) {
    if (!storyCard || !root.ELW_READING || typeof root.ELW_READING.describe !== "function") return;
    var infoEl = storyCard.querySelector("#readInfo");
    if (!infoEl) return;
    try {
      var activeSmBtn = storyCard.querySelector("[data-sm].on");
      var lv = activeSmBtn ? activeSmBtn.getAttribute("data-sm") : "A2";
      var spEl = storyCard.querySelector("#speedSel");
      var rmEl = storyCard.querySelector("#rmodeSel");
      var over = {
        speed: spEl ? spEl.value : "auto",
        mode: rmEl ? rmEl.value : "auto"
      };
      infoEl.textContent = "(" + root.ELW_READING.describe(lv, over) + ")";
    } catch (e) {}
  }

  function syncStoryCardTtsBar() {
    if (typeof document === "undefined") return;
    var storyCard = document.getElementById("storyCard");
    if (!storyCard) return;
    var bar = storyCard.querySelector(".elw-tts-bar");
    if (!bar) return;
    var curMode = getMode();
    var curPreset = getPreset();
    var btns = bar.querySelectorAll("[data-tts-mode]");
    for (var i = 0; i < btns.length; i++) {
      var isOn = btns[i].getAttribute("data-tts-mode") === curMode;
      btns[i].classList.toggle("on", isOn);
      btns[i].setAttribute("aria-pressed", isOn ? "true" : "false");
    }
    var sel = bar.querySelector("#ttsPresetSel");
    if (sel && sel.value !== curPreset) {
      sel.value = curPreset;
    }
    updateReadInfoInStoryCard(storyCard);
  }

  function mountTtsBarIntoStoryCard(storyCard) {
    if (!storyCard || storyCard.querySelector(".elw-tts-bar")) return;
    injectCss();
    patchReadingModule();
    var curMode = getMode();
    var curPreset = getPreset();
    var bar = document.createElement("div");
    bar.className = "elw-tts-bar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Chế độ diễn cảm giọng đọc");

    var optsHtml = PRESET_UI_OPTIONS.map(function (opt) {
      return '<option value="' + opt.id + '"' + (opt.id === curPreset ? " selected" : "") + ">" + opt.label + "</option>";
    }).join("");

    bar.innerHTML =
      '<div class="elw-tts-grp">' +
        '<span class="elw-tts-lbl">Ngữ điệu:</span>' +
        '<button type="button" class="elw-tts-mode-btn' + (curMode === "natural" ? " on" : "") + '" data-tts-mode="natural" aria-pressed="' + (curMode === "natural" ? "true" : "false") + '" title="Đọc liền mạch theo mạch cảm xúc câu chuyện">🎭 Tự nhiên (Natural)</button>' +
        '<button type="button" class="elw-tts-mode-btn' + (curMode === "learning" ? " on" : "") + '" data-tts-mode="learning" aria-pressed="' + (curMode === "learning" ? "true" : "false") + '" title="Đọc chậm vừa phải theo cụm ý 3–8 từ, giữ nguyên trọng âm">🎓 Học rõ (Learning)</button>' +
      "</div>" +
      '<label class="elw-tts-grp">' +
        '<span class="elw-tts-lbl">Cảm xúc:</span>' +
        '<select id="ttsPresetSel" class="elw-tts-sel" aria-label="Phong cách diễn cảm">' + optsHtml + "</select>" +
      "</label>";

    var modeBtns = bar.querySelectorAll("[data-tts-mode]");
    for (var i = 0; i < modeBtns.length; i++) {
      modeBtns[i].onclick = function (ev) {
        var m = ev.currentTarget.getAttribute("data-tts-mode");
        setMode(m);
        var rmEl = storyCard.querySelector("#rmodeSel");
        if (rmEl) {
          rmEl.value = m === "learning" ? "chunk" : "flow";
        }
        updateReadInfoInStoryCard(storyCard);
      };
    }

    var presetSel = bar.querySelector("#ttsPresetSel");
    if (presetSel) {
      presetSel.onchange = function (ev) {
        setPreset(ev.target.value);
        updateReadInfoInStoryCard(storyCard);
      };
    }

    var sRes = storyCard.querySelector("#sRes");
    if (sRes && sRes.parentNode === storyCard) {
      storyCard.insertBefore(bar, sRes);
    } else {
      storyCard.appendChild(bar);
    }
    updateReadInfoInStoryCard(storyCard);
  }

  var storyCardObserver = null;
  function initBrowserIntegration() {
    if (typeof document === "undefined") return;
    patchReadingModule();
    var storyCard = document.getElementById("storyCard");
    if (!storyCard) return;
    if (storyCard.children && storyCard.children.length > 0) {
      mountTtsBarIntoStoryCard(storyCard);
    }
    if (!storyCardObserver && typeof MutationObserver === "function") {
      storyCardObserver = new MutationObserver(function () {
        patchReadingModule();
        if (storyCard.children && storyCard.children.length > 0 && !storyCard.querySelector(".elw-tts-bar")) {
          mountTtsBarIntoStoryCard(storyCard);
        }
      });
      storyCardObserver.observe(storyCard, { childList: true });
    }
  }

  if (typeof document !== "undefined") {
    initBrowserIntegration();
    if (document.readyState === "loading" && document.addEventListener) {
      document.addEventListener("DOMContentLoaded", initBrowserIntegration);
    }
    setTimeout(initBrowserIntegration, 0);
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      ELW_TTS_PLANNER: root.ELW_TTS_PLANNER,
      ELW_VOICES: root.ELW_VOICES,
      ELW_DIALOGUE: root.ELW_DIALOGUE
    };
  }
})();
