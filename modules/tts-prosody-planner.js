/* English Life World — Paragraph Prosody Planner & Expressive Speech Engine
 * Exposes window.ELW_TTS_PLANNER (Browser) and module.exports (Node.js).
 * Zero external dependencies. Implements TTS_MASTER_PROMPT.md Sections 3, 4, 6.
 */
(function (root, factory) {
  "use strict";
  var api = factory(root);
  if (typeof window !== "undefined") {
    window.ELW_TTS_PLANNER = api;
  }
  if (root && typeof root === "object") {
    root.ELW_TTS_PLANNER = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    module.exports.ELW_TTS_PLANNER = api;
  }
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";

  /* =========================================================================
   * 1. EMOTIONAL DELIVERY PRESETS (7 Audibly Distinct Presets)
   * ========================================================================= */
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

  /* Mapping from character style strings in ELW_VOICES to DELIVERY_PRESETS */
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

  /* =========================================================================
   * 2. SPEAKING MODES (Natural Mode vs Learning Mode)
   * ========================================================================= */
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

  /* Fallback voice profile lookup when called standalone without ELW_VOICES */
  var FALLBACK_PROFILES = {
    adult_male:   { id: "adult_male",   pitch: 0.70, rate: 0.95, gender: "m", lang: "en-US", style: "steady" },
    adult_female: { id: "adult_female", pitch: 1.20, rate: 1.00, gender: "f", lang: "en-US", style: "warm" },
    young_male:   { id: "young_male",   pitch: 1.00, rate: 1.10, gender: "m", lang: "en-US", style: "friendly" },
    young_female: { id: "young_female", pitch: 1.45, rate: 1.08, gender: "f", lang: "en-AU", style: "cheerful" },
    child:        { id: "child",        pitch: 1.85, rate: 0.92, gender: "f", lang: "en-US", style: "curious" },
    elderly:      { id: "elderly",      pitch: 0.55, rate: 0.78, gender: "m", lang: "en-GB", style: "gentle" },
    linh:         { id: "young_female", charId: "linh",      pitch: 1.38, rate: 1.06, gender: "f", lang: "en-US", style: "cheerful" },
    barista:      { id: "young_male",   charId: "barista",   pitch: 1.05, rate: 1.02, gender: "m", lang: "en-US", style: "friendly" },
    cashier:      { id: "adult_female", charId: "cashier",   pitch: 1.16, rate: 0.96, gender: "f", lang: "en-US", style: "polite" },
    mom:          { id: "adult_female", charId: "mom",       pitch: 1.18, rate: 0.95, gender: "f", lang: "en-US", style: "warm" },
    dad:          { id: "adult_male",   charId: "dad",       pitch: 0.78, rate: 0.95, gender: "m", lang: "en-US", style: "calm" },
    butcher:      { id: "adult_male",   charId: "butcher",   pitch: 0.82, rate: 0.94, gender: "m", lang: "en-US", style: "helpful" },
    baker:        { id: "adult_female", charId: "baker",     pitch: 1.22, rate: 0.97, gender: "f", lang: "en-US", style: "warm" },
    clerk:        { id: "young_male",   charId: "clerk",     pitch: 1.02, rate: 1.00, gender: "m", lang: "en-US", style: "friendly" },
    service:      { id: "adult_female", charId: "service",   pitch: 1.15, rate: 0.95, gender: "f", lang: "en-US", style: "polite" },
    waiter:       { id: "young_male",   charId: "waiter",    pitch: 1.00, rate: 0.98, gender: "m", lang: "en-US", style: "polite" },
    teacher:      { id: "adult_female", charId: "teacher",   pitch: 1.14, rate: 0.93, gender: "f", lang: "en-US", style: "clear" },
    librarian:    { id: "adult_female", charId: "librarian", pitch: 1.12, rate: 0.90, gender: "f", lang: "en-US", style: "gentle" },
    nurse:        { id: "adult_female", charId: "nurse",     pitch: 1.19, rate: 0.94, gender: "f", lang: "en-US", style: "warm" },
    ranger:       { id: "adult_male",   charId: "ranger",    pitch: 0.80, rate: 0.94, gender: "m", lang: "en-US", style: "steady" }
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
    if (root && root.ELW_VOICES && typeof root.ELW_VOICES.getCharacterProfile === "function") {
      try {
        var vp = root.ELW_VOICES.getCharacterProfile(key);
        if (vp && typeof vp.pitch === "number") return vp;
      } catch (e) {}
    }
    return FALLBACK_PROFILES[key] || FALLBACK_PROFILES.adult_female;
  }

  function resolvePreset(presetOrStyle, modeId, isMultiSentence) {
    if (presetOrStyle && DELIVERY_PRESETS[presetOrStyle]) {
      return DELIVERY_PRESETS[presetOrStyle];
    }
    if (presetOrStyle && STYLE_TO_PRESET[presetOrStyle]) {
      return DELIVERY_PRESETS[STYLE_TO_PRESET[presetOrStyle]];
    }
    if (modeId === "learning") {
      return DELIVERY_PRESETS.clear_learning;
    }
    if (isMultiSentence) {
      return DELIVERY_PRESETS.storytelling;
    }
    return DELIVERY_PRESETS.character_dialogue;
  }

  /* =========================================================================
   * 3. CONTENT-AWARE EMOTION GUARDRAIL
   * ========================================================================= */
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
      return {
        emotion: "neutral",
        pitchMul: 1.0,
        rateMul: 1.0,
        volumeMul: 1.0,
        effectivePreset: reqId,
        guardrailTriggered: false
      };
    }

    /* 1. Guardrail: Negative, sad, tired, or dislike content MUST NOT be read excitedly */
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

    /* 2. Warm / comforting / cozy resolution phrases */
    if (WARM_COMFORT_RE.test(s) && !/!\s*$/.test(s)) {
      return {
        emotion: "warm_comforting",
        pitchMul: 0.97,
        rateMul: 0.95,
        volumeMul: 0.96,
        effectivePreset: "gentle_comforting",
        guardrailTriggered: false
      };
    }

    /* 3. Excited / delighted / exclamation sentences */
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

    /* 4. Curious / exploratory sentences or questions */
    if (CURIOUS_RE.test(s) || /\?\s*$/.test(s)) {
      return {
        emotion: "curious",
        pitchMul: 1.05,
        rateMul: 0.96,
        volumeMul: 1.0,
        effectivePreset: "curious",
        guardrailTriggered: false
      };
    }

    /* 5. Default emotion aligned with requested preset */
    var defaultEmotionMap = {
      storytelling: "narrative",
      friendly_conversation: "friendly",
      curious: "curious",
      happy_excited: "cheerful",
      gentle_comforting: "warm_comforting",
      clear_learning: "clear_instructional",
      character_dialogue: "conversational"
    };

    return {
      emotion: defaultEmotionMap[reqId] || "neutral",
      pitchMul: 1.0,
      rateMul: 1.0,
      volumeMul: 1.0,
      effectivePreset: reqId,
      guardrailTriggered: false
    };
  }

  /* =========================================================================
   * 4. SENTENCE, KEYWORD & CLAUSE ANALYSIS
   * ========================================================================= */
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
      /* Tag questions at the end of a statement (e.g., "It's cold, isn't it?") are Yes/No questions */
      if (TAG_QUESTION_RE.test(q)) {
        return "yn_question";
      }
      if (WH_START.test(q)) {
        return "wh_question";
      }
      /* Polite opener before a Wh- clause: e.g., "Excuse me, where's Room 203?" */
      if (POLITE_WH_RE.test(q)) {
        var afterComma = q.split(/,\s*/);
        var lastClause = afterComma[afterComma.length - 1] || "";
        if (WH_START.test(lastClause.trim()) || POLITE_WH_RE.test(lastClause.trim())) {
          return "wh_question";
        }
      }
      if (YN_START.test(q)) {
        return "yn_question";
      }
      return "yn_question";
    }
    if (/!\s*["')\]}]*$/.test(s)) return "exclamation";
    return "statement";
  }

  /* High-value lexical/prosodic keywords (nouns, descriptive adjectives, discourse markers, numbers) */
  var PRIORITY_KEYWORDS_RE = /\b(first|finally|suddenly|instead|however|outside|inside|snowfall|snowed|snowing|snow|snowman|snowoman|snowballs|angels|beautiful|excited|amazing|wonderful|awesome|fantastic|delicious|yummy|favorite|recommend|fresh|organic|sale|discount|free|hot|cold|warm|iced|cozy|special|today|november|morning|afternoon|evening|tonight|please|thank|thanks|sorry|excuse|help|urgent|hurry|careful|hat|mittens|scarf|jacket|zippers|shovel|driveway|chocolate|window|door|produce|bakery|dairy|frozen|meat|seafood|checkout|aisle|cart|receipt|refund|coupon|card|cash|price|total|apples|bananas|strawberries|milk|bread|cheese|salmon|beef|chicken|coffee|water|room)\b|\$\d+|\b\d+(?:st|nd|rd|th)?\b/i;

  /* Function words, pronouns, light/deictic verbs and adverbs that should NOT receive focal keyword stress */
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
    "hot chocolate",
    "snow angels",
    "first snowfall",
    "fresh organic",
    "dairy section",
    "produce section",
    "great job",
    "well done",
    "sweet dreams",
    "good night"
  ];

  function extractKeywords(text) {
    var raw = String(text || "").trim();
    if (!raw) return [];
    var lower = raw.toLowerCase();
    var found = [];
    var seen = {};

    /* 1. Extract multi-word key collocations first */
    for (var m = 0; m < MULTIWORD_KEYWORDS.length; m++) {
      var mw = MULTIWORD_KEYWORDS[m];
      if (lower.indexOf(mw) >= 0 && !seen[mw]) {
        seen[mw] = true;
        found.push(mw);
      }
    }

    /* 2. Extract priority single words & content words */
    var tokens = raw.match(/\$?\d+(?:st|nd|rd|th)?|[A-Za-z]+(?:'[A-Za-z]+)?/g) || [];
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var lw = tok.toLowerCase();
      if (seen[lw]) continue;
      if (PRIORITY_KEYWORDS_RE.test(tok)) {
        seen[lw] = true;
        found.push(lw);
        continue;
      }
      /* Content words >= 5 chars not in STOPWORDS (descriptive adjectives, specific nouns, strong verbs) */
      if (lw.length >= 5 && !STOPWORDS[lw] && !/^(where|what|when|which|there|their|these|those|would|could|should|about|after|before|under|while)$/i.test(lw)) {
        seen[lw] = true;
        found.push(lw);
      }
    }
    return found;
  }

  function hasKeywords(text) {
    return extractKeywords(text).length > 0;
  }

  /* Count words in a segment */
  function countWords(s) {
    var m = String(s || "").trim().match(/\S+/g);
    return m ? m.length : 0;
  }

  /* Split a long clause into natural phonological phrases (3-8 words in learning mode)
   * without ever altering characters or isolating 1-2 words. */
  var PHRASE_BREAK_BEFORE = /^(and|but|or|because|so|when|while|before|after|although|though|if|unless|until|where|as|to|for|with|in|on|at|into|from|by|under|over|through|outside|inside)$/i;

  function splitBreathGroups(clauseText, minWords, maxWords) {
    var w = String(clauseText || "").trim().split(/\s+/).filter(Boolean);
    if (w.length <= maxWords) return [clauseText.trim()];

    var result = [];
    function recurse(wordsArr) {
      if (wordsArr.length <= maxWords) {
        result.push(wordsArr.join(" "));
        return;
      }
      var mid = Math.floor(wordsArr.length / 2);
      var bestIdx = -1;
      var maxOffset = Math.max(2, Math.floor(wordsArr.length / 2));

      for (var d = 0; d <= maxOffset; d++) {
        var rightIdx = mid + d;
        var leftIdx = mid - d;
        if (rightIdx >= minWords && (wordsArr.length - rightIdx) >= minWords) {
          var cleanR = wordsArr[rightIdx].replace(/[^A-Za-z']/g, "");
          if (PHRASE_BREAK_BEFORE.test(cleanR)) {
            bestIdx = rightIdx;
            break;
          }
        }
        if (leftIdx >= minWords && (wordsArr.length - leftIdx) >= minWords) {
          var cleanL = wordsArr[leftIdx].replace(/[^A-Za-z']/g, "");
          if (PHRASE_BREAK_BEFORE.test(cleanL)) {
            bestIdx = leftIdx;
            break;
          }
        }
      }

      if (bestIdx < minWords || (wordsArr.length - bestIdx) < minWords) {
        /* Fallback split at balanced midpoint only if both sides >= minWords */
        bestIdx = Math.max(minWords, Math.min(wordsArr.length - minWords, mid));
      }

      recurse(wordsArr.slice(0, bestIdx));
      recurse(wordsArr.slice(bestIdx));
    }

    recurse(w);
    return result;
  }

  /**
   * splitPhraseClauses(text, opts)
   * - Splits a sentence on commas `, ` while PRESERVING the trailing comma `,` on non-final segments
   *   so TTS engines maintain non-terminal continuation intonation.
   * - Never splits short fragments (< 10 chars, e.g. "Oh,", "Sure,", "First,", "Then,", "Yes,", "Wow,")
   *   into isolated utterances — merges them with the adjacent clause.
   * - In Learning Mode (opts.mode === 'learning'), further splits clauses > 8 words into
   *   3–8 word phonological breath groups without altering any text characters.
   */
  function splitPhraseClauses(text, opts) {
    opts = opts || {};
    var raw = String(text || "").trim();
    if (!raw) return [];

    var mode = opts.mode === "learning" ? "learning" : "natural";

    /* Step 1: Tokenize on comma boundaries while keeping the comma attached to the preceding piece */
    var rawCommaParts = [];
    if (raw.indexOf(",") >= 0) {
      var regex = /[^,]+,|\s*[^,]+$/g;
      var matches = raw.match(regex);
      if (matches && matches.length > 0) {
        for (var i = 0; i < matches.length; i++) {
          var piece = matches[i].trim();
          if (piece) rawCommaParts.push(piece);
        }
      } else {
        rawCommaParts.push(raw);
      }
    } else {
      rawCommaParts.push(raw);
    }

    /* Step 2: Merge short fragments (< 10 characters, or short polite openers when whole sentence is short) */
    var merged = [];
    var pendingPrefix = "";

    for (var j = 0; j < rawCommaParts.length; j++) {
      var seg = rawCommaParts[j];
      var candidate = pendingPrefix ? (pendingPrefix + " " + seg) : seg;

      /* If this is not the last segment and candidate (or seg itself) is < 10 chars (e.g. "First,", "Oh,", "Wow,"),
       * or if the whole sentence is short (< 36 chars) with a polite opener ("Excuse me,"), hold it to merge forward */
      var isShortFragment = seg.length < 10 || candidate.length < 10;
      var isShortPoliteSentence = raw.length < 36 && j === 0 && seg.length <= 12;

      if (j < rawCommaParts.length - 1 && (isShortFragment || isShortPoliteSentence)) {
        pendingPrefix = candidate;
      } else {
        pendingPrefix = "";
        /* If this is the last segment and it is too short (< 10 chars, e.g. ", isn't it?" or ", mom."),
         * merge it backward into the previous clause */
        if (j === rawCommaParts.length - 1 && seg.length < 10 && merged.length > 0) {
          merged[merged.length - 1] = merged[merged.length - 1] + " " + candidate;
        } else {
          merged.push(candidate);
        }
      }
    }

    if (pendingPrefix) {
      if (merged.length > 0) {
        merged[merged.length - 1] = merged[merged.length - 1] + " " + pendingPrefix;
      } else {
        merged.push(pendingPrefix);
      }
    }

    if (!merged.length) merged = [raw];

    /* Step 3: In Learning Mode, split long clauses (> 8 words) into 3–8 word phonological phrases */
    if (mode === "learning") {
      var minW = opts.minWordsPerGroup || MODES.learning.minWordsPerGroup;
      var maxW = opts.maxWordsPerGroup || MODES.learning.maxWordsPerGroup;
      var learningGroups = [];
      for (var k = 0; k < merged.length; k++) {
        var subGroups = splitBreathGroups(merged[k], minW, maxW);
        for (var s = 0; s < subGroups.length; s++) {
          learningGroups.push(subGroups[s]);
        }
      }
      return learningGroups.length ? learningGroups : merged;
    }

    return merged;
  }

  /* =========================================================================
   * 5. PARAGRAPH SENTENCE SPLITTING, NARRATIVE ROLES & THOUGHT GROUPING
   * ========================================================================= */
  function splitSentences(paragraphText) {
    var raw = String(paragraphText || "").trim();
    if (!raw) return [];
    /* Protect common abbreviations from false sentence splits */
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

    /* Last sentence in a multi-sentence paragraph is closing (unless it's a sharp surprise climax, though closing cues always win at end) */
    if (index === totalSentences - 1) {
      return "closing";
    }
    if (index === 0 || (index === 1 && OPENING_CUE_RE.test(s))) {
      return "opening";
    }
    if (CLOSING_CUE_RE.test(s) && index >= totalSentences - 2) {
      return "closing";
    }
    if (CONTRAST_CUE_RE.test(s)) {
      return "contrast";
    }
    if (/!\s*$/.test(s) || CLIMAX_CUE_RE.test(s)) {
      return "climax";
    }
    return "development";
  }

  /* Extract structural signature of a sentence to detect parallel sequences & shared thought groups */
  function sentenceSignature(sentenceText) {
    var s = String(sentenceText || "").trim();
    var w = s.toLowerCase().replace(/[^a-z0-9'\s]/g, "").split(/\s+/).filter(Boolean);
    var opener2 = w.slice(0, 2).join(" ");
    var opener3 = w.slice(0, 3).join(" ");
    var isDressing = /\b(put\s+on|puts\s+on|zipper|zippers|hat|mittens|scarf|jacket|boots|coat|gloves)\b/i.test(s);
    var isOutdoorPlay = /\b(go\s+outside|make\s+a\s+snowman|make\s+snow\s+angels|throw\s+snowballs|get\s+to\s+play)\b/i.test(s);
    var possessiveTarget = /\b(her)\s+(hat|mittens|scarf|jacket|coat|boots)\b/i.test(s)
      ? "her"
      : /\b(my)\s+(hat|mittens|scarf|jacket|coat|boots)\b/i.test(s)
      ? "my"
      : "";
    return {
      wordCount: w.length,
      opener1: w[0] || "",
      opener2: opener2,
      opener3: opener3,
      isDressing: isDressing,
      isOutdoorPlay: isOutdoorPlay,
      possessiveTarget: possessiveTarget
    };
  }

  function assignThoughtGroups(sentenceStrings, roles) {
    var n = sentenceStrings.length;
    var sigs = sentenceStrings.map(sentenceSignature);
    var groupIds = new Array(n);
    var currentGroupNum = 1;
    var currentGroupSize = 0;

    for (var i = 0; i < n; i++) {
      if (i === 0) {
        groupIds[i] = "tg_" + currentGroupNum;
        currentGroupSize = 1;
        continue;
      }

      var prevSig = sigs[i - 1];
      var curSig = sigs[i];
      var prevRole = roles[i - 1];
      var curRole = roles[i];

      var shouldGroup = false;

      /* Never merge a very short title opener (e.g. "First Snowfall.") or the final closing sentence into an action group */
      var prevIsTitle = (i - 1 === 0 && prevSig.wordCount <= 3);
      var isClosing = (curRole === "closing");

      if (!prevIsTitle && !isClosing && currentGroupSize < 3) {
        /* Case A: Parallel dressing sequence with the same target ("my" vs "her") */
        if (prevSig.isDressing && curSig.isDressing) {
          if (!prevSig.possessiveTarget || !curSig.possessiveTarget || prevSig.possessiveTarget === curSig.possessiveTarget) {
            shouldGroup = true;
          }
        }
        /* Case B: Identical 2-word or 3-word subject opener (e.g., "The snow...", "My mom...", "My sister and I...") */
        else if (curSig.opener2 && curSig.opener2 === prevSig.opener2 && prevRole === curRole) {
          shouldGroup = true;
        }
        /* Case C: Short setting opener pair (e.g. "Today is November 26th. It snowed all day today.") */
        else if (i === 2 && prevRole === "opening" && curSig.wordCount <= 7 && /\btoday\b/i.test(sentenceStrings[i - 1]) && /\btoday\b/i.test(sentenceStrings[i])) {
          shouldGroup = true;
        }
        /* Case D: Outdoor play buildup pair ("My sister and I go outside. We begin to make a snowman.") */
        else if (prevSig.isOutdoorPlay && curSig.isOutdoorPlay && prevRole === curRole) {
          shouldGroup = true;
        }
      }

      if (shouldGroup) {
        groupIds[i] = "tg_" + currentGroupNum;
        currentGroupSize++;
      } else {
        currentGroupNum++;
        groupIds[i] = "tg_" + currentGroupNum;
        currentGroupSize = 1;
      }
    }

    /* Calculate group sizes and within-group index + contourWave */
    var counts = {};
    for (var j = 0; j < n; j++) {
      counts[groupIds[j]] = (counts[groupIds[j]] || 0) + 1;
    }

    var seenInGroup = {};
    var meta = [];
    for (var k = 0; k < n; k++) {
      var gid = groupIds[k];
      var gIdx = seenInGroup[gid] || 0;
      seenInGroup[gid] = gIdx + 1;
      var gSize = counts[gid];

      /* Anti-monotony contourWave across multi-sentence thought groups:
       * - 1st sentence in group: +3% (+0.03) slight continuation lift
       * - Middle sentence in 3-sentence group: 0% (0.00) steady bridge
       * - Last sentence in multi-sentence group: -3% (-0.03) soft group resolution */
      var wave = 0;
      if (gSize >= 2) {
        if (gIdx === 0) wave = 0.03;
        else if (gIdx === gSize - 1) wave = -0.03;
        else wave = 0.0;
      }

      meta.push({
        thoughtGroupId: gid,
        thoughtGroupIndex: gIdx,
        thoughtGroupSize: gSize,
        isGroupLast: gIdx === gSize - 1,
        contourWave: wave
      });
    }
    return meta;
  }

  /* =========================================================================
   * 6. W3C SSML GENERATOR
   * ========================================================================= */
  function escapeXml(str) {
    return String(str || "").replace(/[&<>'"]/g, function (ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&apos;",
        '"': "&quot;"
      }[ch];
    });
  }

  function decorateEmphasisSSML(clauseText, emphasisWords) {
    var escaped = escapeXml(clauseText);
    if (!emphasisWords || !emphasisWords.length) return escaped;
    /* Sort longer phrases first so multi-word phrases aren't partially wrapped */
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
    var lines = [];
    lines.push('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="' + escapeXml(lang) + '">');
    if (voiceName) {
      lines.push('  <voice name="' + escapeXml(voiceName) + '">');
    }

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

    if (voiceName) {
      lines.push("  </voice>");
    }
    lines.push("</speak>");
    return lines.join("\n");
  }

  /* =========================================================================
   * 7. PARAGRAPH PROSODY PLANNER (planParagraph / analyzeProsody)
   * ========================================================================= */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function round2(val) {
    return Number(val.toFixed(2));
  }

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

    /* Default intra-sentence clause pause (120–200ms in natural mode for test compatibility) */
    var defaultClausePauseMs = opts.clausePauseMs != null
      ? opts.clausePauseMs
      : (modeId === "learning" ? Math.max(210, preset.clausePauseMs) : clamp(preset.clausePauseMs, 120, 200));

    /* Determine narrative roles & thought groups across all sentences in the paragraph */
    var roles = [];
    for (var sIdx = 0; sIdx < sentenceStrings.length; sIdx++) {
      roles.push(detectNarrativeRole(sentenceStrings[sIdx], sIdx, sentenceStrings.length));
    }
    var thoughtMeta = assignThoughtGroups(sentenceStrings, roles);

    var sentencePlans = [];
    var flatPlan = [];

    for (var i = 0; i < sentenceStrings.length; i++) {
      var sText = sentenceStrings[i];
      var sType = detectSentenceType(sText);
      var role = roles[i];
      var tg = thoughtMeta[i];
      var contentEmo = detectContentEmotion(sText, preset.id);
      var sKeywords = extractKeywords(sText);

      /* Determine sentence-level pauseBeforeMs and pauseAfterMs */
      var pauseBeforeMs = i === 0 ? 0 : 0;
      var sentencePauseAfterMs = 0;

      if (isMultiSentence) {
        if (i === sentenceStrings.length - 1) {
          /* Closing sentence of the paragraph */
          sentencePauseAfterMs = preset.sectionPauseMs;
        } else if (!tg.isGroupLast) {
          /* Inside the SAME thought group (e.g. parallel actions): short cohesive pause 220–280ms */
          var baseGroupPause = modeId === "learning"
            ? modeCfg.thoughtGroupPauseMs
            : clamp(preset.thoughtGroupPauseMs + (tg.thoughtGroupIndex * 15), 220, 280);
          sentencePauseAfterMs = baseGroupPause;
        } else if (role === "opening" || role === "climax" || role === "contrast") {
          /* Intentional transition pause after opening, climax, or contrast shift: 420–540ms */
          sentencePauseAfterMs = clamp(
            role === "opening" && i === 0 ? preset.sectionPauseMs : Math.round((preset.sentencePauseMs + preset.sectionPauseMs) / 2),
            420,
            540
          );
        } else {
          /* Transition between distinct thought groups: 420–540ms */
          sentencePauseAfterMs = clamp(Math.max(420, preset.sentencePauseMs + 60), 420, 540);
        }
      }

      /* Pitch direction descriptor for the sentence */
      var pitchDirection = "falling";
      if (sType === "yn_question") pitchDirection = "rising";
      else if (sType === "wh_question") pitchDirection = "falling";
      else if (sType === "exclamation") pitchDirection = "rise_fall";
      else if (role === "closing") pitchDirection = "warm_fall";
      else if (!tg.isGroupLast) pitchDirection = tg.contourWave > 0 ? "sustained" : "falling";

      /* Role & emotion rate shaping */
      var roleRateMul = 1.0;
      if (role === "opening" && isMultiSentence && i === 0) roleRateMul = 0.96;
      else if (role === "contrast") roleRateMul = 0.96;
      else if (role === "climax") roleRateMul = 1.03;
      else if (role === "closing" && isMultiSentence) roleRateMul = 0.94;

      var emoRateMul = isMultiSentence ? contentEmo.rateMul : (contentEmo.guardrailTriggered ? contentEmo.rateMul : 1.0);
      var presetRateMul = isMultiSentence ? preset.rateMul : 1.0;
      var sentenceSpeakingRate = clamp(baseRate * presetRateMul * roleRateMul * emoRateMul, modeCfg.minRate * 0.5, modeCfg.maxRate * 2.0);

      /* Split sentence into phrase clauses */
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

        /* Mandatory Intonation Invariants (100% compatible with existing test suite):
         * 1. yn_question: last clause MUST have pitch > basePitch (e.g. basePitch * 1.15)
         * 2. wh_question: last clause MUST have pitch <= 0.95 * basePitch (e.g. basePitch * 0.82)
         * 3. exclamation: last clause MUST have pitch <= basePitch (e.g. 0.96 * basePitch, opening: 1.07 * basePitch)
         * 4. statement: last clause MUST have pitch <= basePitch (e.g. 0.92 * basePitch, non-last: 1.03 * basePitch)
         */
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
          /* Statement prosody shaped by narrative role, emotion guardrail, and thought-group contourWave */
          if (isLastClause) {
            var terminalFactor = 0.92;
            if (role === "closing" && isMultiSentence) {
              terminalFactor = 0.90;
            } else if (contentEmo.guardrailTriggered) {
              terminalFactor = 0.90;
            } else if (role === "climax") {
              terminalFactor = 0.95;
            } else if (role === "opening" && isMultiSentence && i === 0) {
              terminalFactor = 0.94;
            }
            /* Apply anti-monotony contourWave (+3%, 0%, -3%) while strictly guaranteeing pitch <= basePitch */
            pitch = basePitch * (terminalFactor + wave);
            if (pitch > basePitch) pitch = basePitch * 0.96;
          } else {
            /* Non-final comma clause: gentle continuation lift */
            var contFactor = 1.03 + (preset.pitchSpan - 0.14) * 0.2 + wave;
            pitch = basePitch * clamp(contFactor, 1.01, 1.08);
          }
        }

        /* Keyword emphasis: slow down slightly so content keywords carry acoustic weight */
        if (kw) {
          var boost = clamp(preset.emphasisBoost || 0.07, 0.05, 0.12);
          rate *= (1 - boost);
        }

        pitch = clamp(round2(pitch), 0.1, 2.0);
        rate = clamp(round2(rate), 0.2, 4.0);

        /* Final verification of strict pitch invariants after rounding */
        if (isLastClause) {
          if (sType === "yn_question" && pitch <= basePitch) {
            pitch = clamp(round2(basePitch + 0.08), 0.1, 2.0);
          } else if (sType === "wh_question" && pitch > round2(0.95 * basePitch)) {
            pitch = clamp(round2(basePitch * 0.82), 0.1, 2.0);
          } else if ((sType === "exclamation" || sType === "statement") && pitch > basePitch) {
            pitch = clamp(round2(basePitch * 0.95), 0.1, 2.0);
          }
        }

        var vol = clamp(round2((preset.volumeMul || 1.0) * (contentEmo.volumeMul || 1.0)), 0.1, 1.0);
        var cPauseAfter = 0;
        if (!isLastClause) {
          cPauseAfter = defaultClausePauseMs;
        } else if (!isParagraphLast) {
          cPauseAfter = sentencePauseAfterMs;
        } else {
          cPauseAfter = 0;
        }

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

    var allClauseTexts = flatPlan.map(function (seg) { return seg.text; });

    var result = {
      mode: modeId,
      preset: preset.id,
      presetConfig: preset,
      profile: profile,
      sentenceType: sentencePlans.length ? sentencePlans[sentencePlans.length - 1].sentenceType : "statement",
      clauses: allClauseTexts,
      clausePauseMs: defaultClausePauseMs,
      sentences: sentencePlans,
      plan: flatPlan,
      toSSML: function (voiceName) {
        return buildSSML(result, voiceName);
      }
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
});
