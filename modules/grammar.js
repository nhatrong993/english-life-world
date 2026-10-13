/* English Life World — offline grammar checker (ELW_GRAMMAR) + personal mistakes notebook (ELW_MISTAKES).
 * Rule-based, tuned to common errors of Vietnamese learners. No network. */
(function (root) {
  "use strict";

  /* ---------------- verb morphology ---------------- */
  const IRR = {
    // base: [past, pp]
    be: ["was", "been"], have: ["had", "had"], do: ["did", "done"], go: ["went", "gone"],
    eat: ["ate", "eaten"], drink: ["drank", "drunk"], make: ["made", "made"], take: ["took", "taken"],
    buy: ["bought", "bought"], see: ["saw", "seen"], sleep: ["slept", "slept"], come: ["came", "come"],
    get: ["got", "got"], give: ["gave", "given"], write: ["wrote", "written"], read: ["read", "read"],
    run: ["ran", "run"], swim: ["swam", "swum"], sit: ["sat", "sat"], stand: ["stood", "stood"],
    find: ["found", "found"], think: ["thought", "thought"], bring: ["brought", "brought"],
    feel: ["felt", "felt"], know: ["knew", "known"], leave: ["left", "left"], meet: ["met", "met"],
    pay: ["paid", "paid"], put: ["put", "put"], say: ["said", "said"], sell: ["sold", "sold"],
    send: ["sent", "sent"], speak: ["spoke", "spoken"], tell: ["told", "told"], wake: ["woke", "woken"],
    wear: ["wore", "worn"], begin: ["began", "begun"], break: ["broke", "broken"], feed: ["fed", "fed"],
    forget: ["forgot", "forgotten"], lose: ["lost", "lost"], sing: ["sang", "sung"], teach: ["taught", "taught"],
    win: ["won", "won"], fly: ["flew", "flown"], fall: ["fell", "fallen"], cut: ["cut", "cut"],
    hear: ["heard", "heard"], keep: ["kept", "kept"], sweep: ["swept", "swept"], hang: ["hung", "hung"],
    drive: ["drove", "driven"], ride: ["rode", "ridden"], choose: ["chose", "chosen"], spend: ["spent", "spent"],
    understand: ["understood", "understood"], set: ["set", "set"], let: ["let", "let"], shut: ["shut", "shut"],
    hit: ["hit", "hit"], pour: ["poured", "poured"], build: ["built", "built"], lend: ["lent", "lent"],
    become: ["became", "become"], grow: ["grew", "grown"], throw: ["threw", "thrown"], catch: ["caught", "caught"],
    fight: ["fought", "fought"], hold: ["held", "held"], blow: ["blew", "blown"], draw: ["drew", "drawn"]
  };
  const REG = ("watch cook play open close clean wash want like need live work study walk talk listen turn pick wait visit " +
    "help start stay use love call finish brush water fold dance jump look climb carry try cry hurry enjoy relax fix miss " +
    "kiss push pull touch move change smile laugh ask answer learn remember hope plan stop shop drop prepare share order " +
    "arrive decide dress fill boil fry heat check charge comb dry empty iron rest switch travel return discuss explain " +
    "marry hate prefer agree believe cross fetch reach chat hug jog mop wipe tidy bake toast pack unpack paint draw " +
    "borrow clear lock unlock kick decide wonder practise practice copy feed").split(" ");
  const DOUBLE = new Set("stop plan shop drop chat hug jog nod skip step tap mop run swim sit get put cut begin set let hit shut win dig".split(" "));
  const BASE = new Set([...Object.keys(IRR), ...REG].filter(v => v !== "be"));
  const s3 = v => v === "have" ? "has" : v === "be" ? "is" : /(s|sh|ch|x|z|o)$/.test(v) ? v + "es" : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + "ies" : v + "s";
  const past = v => IRR[v] ? IRR[v][0] : /e$/.test(v) ? v + "d" : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + "ied" : DOUBLE.has(v) ? v + v.slice(-1) + "ed" : v + "ed";
  const pp = v => IRR[v] ? IRR[v][1] : past(v);
  const ing = v => /ie$/.test(v) ? v.slice(0, -2) + "ying" : (/[^e]e$/.test(v) && v !== "be" && !/(ee|ye|oe)$/.test(v)) ? v.slice(0, -1) + "ing" : DOUBLE.has(v) ? v + v.slice(-1) + "ing" : v + "ing";
  const FORM = {}; // word -> {base, kinds:Set}
  function addForm(w, base, kind) { (FORM[w] = FORM[w] || { base, kinds: new Set() }).kinds.add(kind); }
  for (const v of BASE) { addForm(v, v, "base"); addForm(s3(v), v, "s3"); addForm(ing(v), v, "ing"); addForm(past(v), v, "past"); addForm(pp(v), v, "pp"); }
  const isForm = (w, kind) => { const f = FORM[String(w).toLowerCase()]; return !!(f && f.kinds.has(kind)); };
  const baseOf = w => (FORM[String(w).toLowerCase()] || {}).base;

  /* ---------------- helpers ---------------- */
  const PRON_SG = "he|she|it";
  const SG_NOUNS = "cat|dog|baby|boy|girl|man|woman|teacher|mom|mum|dad|mother|father|sister|brother|friend|kettle|kid|child|grandma|grandpa|neighbour|neighbor";
  const SUBJ3 = `(?:${PRON_SG}|everyone|everybody|someone|somebody|nobody|mom|mum|dad|(?:my|the|his|her|our|your) (?:${SG_NOUNS}))`;
  const SUBJ_PL = "(?:I|you|we|they)";
  const MODALS = "can|could|will|would|should|must|might|may";
  const AUX_SKIP = new Set(("does do did doesn't don't didn't can could will would should must might may can't couldn't won't wouldn't shouldn't mustn't to let " +
    "am is are was were not if wish").split(" "));
  const keepCase = (orig, rep) => orig && /^[A-Z]/.test(orig) && rep ? rep[0].toUpperCase() + rep.slice(1) : rep;
  function prevWord(str, off) { const m = /([A-Za-z']+)\W*$/.exec(str.slice(0, off)); return m ? m[1].toLowerCase() : ""; }
  function objectContext(str, off) { // subject-looking word is actually an object / after aux
    const p = prevWord(str, off);
    return AUX_SKIP.has(p) || (!!FORM[p] && p !== "and");
  }
  const NUMS = "two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|many|several|few|these|those|both|[2-9]|\\d{2,}";
  const IRR_PL = { child: "children", person: "people", man: "men", woman: "women", foot: "feet", tooth: "teeth", knife: "knives", mouse: "mice" };
  const plural = n => IRR_PL[n] || (/(s|sh|ch|x|z)$/.test(n) || n === "tomato" || n === "potato" ? n + "es" : /[^aeiou]y$/.test(n) ? n.slice(0, -1) + "ies" : n + "s");
  const COUNT_NOUNS = "cup|glass|plate|bowl|egg|apple|banana|orange|book|chair|cat|dog|minute|hour|day|week|month|year|child|person|box|dish|tomato|potato|knife|man|woman|foot|tooth|slice|piece|room|window|table|spoon|friend|time|bottle|pillow|towel|shirt|sock|shoe|toy|game|song|student|brother|sister|cushion|biscuit|cookie|sandwich|candle|plant|flower|lamp|key|phone|bag";
  const HOUSE = "fridge|door|window|table|sofa|cat|dog|cup|glass|light|lamp|microwave|oven|stove|sink|tap|kitchen|bathroom|bedroom|living room|chair|fan|kettle|TV|remote|wardrobe|drawer|floor|plate|bowl|bin|cupboard|cabinet|toaster|washing machine|balcony|garden|shower|mirror|curtain|alarm|teapot|pot|pan";
  const ADJ = "hungry|thirsty|tired|sleepy|happy|sad|busy|cold|hot|full|ready|sick|bored|angry|late|sorry|fine|okay|ok|afraid|scared|excited|nervous|hungry|free|right|wrong|sure|worried|good|bad|well";
  const PAST_MARK = /\b(yesterday|last (?:night|week|month|year|weekend|summer|winter|spring|autumn|fall|monday|tuesday|wednesday|thursday|friday|saturday|sunday|time)|ago|in (?:19|20)\d\d)\b/i;
  const DAYS = "monday|tuesday|wednesday|thursday|friday|saturday|sunday";
  const isQuestionStart = s => /^\s*(what|where|when|why|how|who|which|whose|do|does|did|is|are|am|was|were|can|could|will|would|should|have|has|may|shall)\b/i.test(s);

  /* ---------------- rules ----------------
   * Each rule: {id, type, re, fn(ctx, m...) -> replacement | null, msg, ex}
   * Applied in order to each sentence. */
  const R = [];
  const rule = (id, type, re, fn, msg, ex, opt) => R.push(Object.assign({ id, type, re, fn, msg, ex }, opt || {}));

  // --- word order / questions (run early) ---
  rule("wh-be-order", "word-order", new RegExp(`^(\\s*(?:what|where|when|why|how|who|which)(?: time| kind of \\w+)?)\\s+(I|you|we|they|he|she|it)\\s+(am|is|are|was|were|can|could|will|would|should)\\b`, "i"),
    (c, m, wh, p, aux) => c.q ? `${wh} ${aux.toLowerCase()} ${p === "I" ? "I" : p.toLowerCase()}` : null,
    "Câu hỏi có từ để hỏi: đảo trợ động từ/động từ to be lên trước chủ ngữ (What ARE you doing?).", "What are you doing?");
  rule("wh-missing-aux", "word-order", new RegExp(`^(\\s*(?:what|where|when|why|how|who|which)(?: time)?)\\s+(I|you|we|they|he|she|it)\\s+([a-z]+)\\b`, "i"),
    (c, m, wh, p, v) => {
      if (!c.q) return null; const lv = v.toLowerCase(); const sg = /^(he|she|it)$/i.test(p); const pr = p === "I" ? "I" : p.toLowerCase();
      if (isForm(lv, "ing") && !isForm(lv, "base")) return `${wh} ${p === "I" ? "am" : sg ? "is" : "are"} ${pr} ${lv}`;
      if (isForm(lv, "base") || (sg && isForm(lv, "s3"))) return `${wh} ${sg ? "does" : "do"} ${pr} ${baseOf(lv)}`;
      return null;
    }, "Câu hỏi với động từ thường cần trợ động từ do/does (hoặc am/is/are + V-ing) đứng trước chủ ngữ.", "What do you want?");
  rule("more-number-order", "word-order", new RegExp(`\\bmore (one|two|three|four|five|six|seven|eight|nine|ten|\\d+)\\b`, "i"),
    (c, m, n) => `${n} more`, "Số đứng trước 'more': five more minutes (thêm 5 phút), không nói 'more five'.", "Can I watch five more minutes?");

  // --- word choice (Vietnamese calques) ---
  rule("open-light", "word-choice", /\b(open|opens|opened|opening|close|closes|closed|closing)( the| my)? (lights?|TV|television|fan|radio|lamp|computer|air conditioner)\b/i,
    (c, m, v, det, n) => { const on = /^open/i.test(v); const t = { open: "turn", opens: "turns", opened: "turned", opening: "turning", close: "turn", closes: "turns", closed: "turned", closing: "turning" }[v.toLowerCase()]; return `${keepCase(v, t)} ${on ? "on" : "off"}${det || " the"} ${n}`; },
    "Với đèn/TV/quạt dùng turn on / turn off (bật/tắt), không dùng open/close như 'mở/đóng đèn' trong tiếng Việt.", "I turn on the light.");
  rule("say-me", "word-choice", /\b(say|says|said|saying) (me|him|her|us|them)\b/i,
    (c, m, v, o) => `${keepCase(v, { say: "tell", says: "tells", said: "told", saying: "telling" }[v.toLowerCase()])} ${o}`,
    "'Nói với ai' dùng tell + người (tell me), say không đi trực tiếp với người.", "Tell me your name.");
  rule("very-like", "naturalness", /\bvery (like|likes|liked|love|loves|loved|enjoy|enjoys|enjoyed|want|wants|wanted)\b/i,
    (c, m, v) => `really ${v}`, "Không dùng 'very' trước động từ. Dùng really like / like ... very much.", "I really like milk.");
  rule("make-homework", "word-choice", /\b(make|makes|made|making) (my |your |his |her |the )?homework\b/i,
    (c, m, v, d) => `${keepCase(v, { make: "do", makes: "does", made: "did", making: "doing" }[v.toLowerCase()])} ${d || ""}homework`,
    "Làm bài tập về nhà: do homework, không dùng make.", "I do my homework after dinner.");

  // --- redundant prepositions ---
  rule("discuss-about", "preposition", /\b(discuss|discusses|discussed|discussing) about\b/i, (c, m, v) => v,
    "discuss không cần 'about' (discuss something).", "We discussed the plan.");
  rule("return-back", "naturalness", /\b(return|returns|returned|returning) back\b/i, (c, m, v) => v,
    "return đã có nghĩa là 'quay lại', không cần thêm back.", "I returned home at six.");
  rule("go-to-home", "preposition", /\b(go|goes|went|going|gone|come|comes|came|coming|get|gets|got|getting|arrive|arrives|arrived|arriving) to home\b/i,
    (c, m, v) => `${v} home`, "Với home không dùng 'to': go home, come home.", "I go home at five.");
  rule("explain-me", "preposition", /\b(explain|explains|explained|explaining) (me|him|her|us|them)\b/i,
    (c, m, v, o) => `${v} to ${o}`, "explain something TO someone: explain to me.", "Can you explain it to me?");
  rule("married-with", "preposition", /\b(married|marry) with\b/i, (c, m, v) => v.toLowerCase() === "marry" ? v : `${v} to`,
    "Kết hôn với ai: married to someone / marry someone (không dùng with).", "She is married to a doctor.");
  rule("listen-to", "preposition", /\b(listen|listens|listened|listening) (?!to\b)(music|me|him|her|us|them|it|the|my|your|his|our|their|this|that|a|songs?|radio|podcasts?)\b/i,
    (c, m, v, o) => `${v} to ${o}`, "listen luôn đi với 'to' trước tân ngữ: listen to music.", "I'm listening to music.");
  rule("time-in-morning", "preposition", /\b(at|on) the (morning|afternoon|evening)\b/i, (c, m, p, t) => `in the ${t}`,
    "Buổi trong ngày: in the morning / in the afternoon / in the evening (nhưng at night).", "I drink milk in the morning.");
  rule("time-at-night", "preposition", /\bin (the )?night\b(?! of)/i, () => "at night",
    "'Vào ban đêm' là at night.", "I read at night.");
  rule("day-on", "preposition", new RegExp(`\\b(in|at) (${DAYS})s?\\b`, "i"), (c, m, p, d) => `on ${m.slice(p.length + 1)}`,
    "Trước thứ trong tuần dùng on: on Monday.", "I clean the house on Sunday.");
  rule("clock-at", "preposition", /\b(in|on) (\d{1,2}(?::\d\d)?\s*(?:o'clock|a\.m\.|p\.m\.|am|pm)|noon|midnight)/i, (c, m, p, t) => `at ${t}`,
    "Trước giờ cụ thể dùng at: at 7 o'clock.", "I get up at 6 a.m.");
  rule("since-years", "preposition", /\bsince (\d+|two|three|four|five|six|seven|eight|nine|ten|many) (minutes|hours|days|weeks|months|years)\b/i,
    (c, m, n, u) => `for ${n} ${u}`, "Khoảng thời gian dùng for (for 3 years); since + mốc thời gian (since 2020).", "I have lived here for three years.");

  // --- articles / determiners ---
  rule("the-my", "article", /\b(the|a|an) (my|your|his|her|our|their)\b/i, (c, m, a, p) => p,
    "Không dùng mạo từ cùng tính từ sở hữu: my cup, không phải the my cup.", "This is my cup.");
  rule("a-an", "article", /\b(a|an) ([A-Za-z][\w-]*)/i, (c, m, a, w) => {
    if (a === "A" && c.start === 0 && false) return null;
    const lw = w.toLowerCase();
    const vowelSound = /^(hour|honest|honou?r|heir)/.test(lw) || (/^[aeiou]/.test(lw) && !/^(uni|use|usu|uti|ure|eu|one|once|ewe)/.test(lw)) || /^[aefhilmnorsx]$/.test(lw);
    const want = vowelSound ? "an" : "a"; if (a.toLowerCase() === want) return null; return `${keepCase(a, want)} ${w}`;
  }, "Dùng an trước âm nguyên âm (an apple, an hour), a trước âm phụ âm (a university, a cup).", "I eat an apple.");
  rule("missing-article", "article", new RegExp(`\\b(open|opens|opened|opening|close|closes|closed|closing|clean|cleans|cleaned|cleaning|wash|washes|washed|washing|feed|feeds|fed|feeding|use|uses|used|using|fill|fills|filled|filling|empty|empties|emptied|emptying|pick up|picks up|picked up|picking up|turn on|turns on|turned on|turning on|turn off|turns off|turned off|turning off|switch on|switch off|go to|goes to|went to|going to|come to|into|in|on|under|from|near|behind|next to)( )(${HOUSE})\\b(?!s)(?! (?:of|food|bowl|door|table)\\b)`, "i"),
    (c, m, v, sp, n) => {
      if (/^(on|in|from|near|under|behind|next to)$/i.test(v) && /^TV$/i.test(n)) return null;
      if (/^(go to|goes to|went to|going to|come to)$/i.test(v) && /^(bed|school|work)$/i.test(n)) return null;
      return `${v} the ${n}`;
    }, "Danh từ đếm được số ít (fridge, cup, table…) cần mạo từ/từ hạn định: the fridge, a cup, my cup.", "I open the fridge.");

  // --- plural / uncountable ---
  rule("plural-number", "plural", new RegExp(`\\b(${NUMS})( more)? (${COUNT_NOUNS})\\b(?!['-])`, "i"),
    (c, m, n, more, w) => `${n}${more || ""} ${plural(w.toLowerCase())}`, "Sau số đếm từ 2 trở lên (hoặc many/several), danh từ phải ở số nhiều: two cups.", "I have two cups.");
  const UNC = { milks: "milk", furnitures: "furniture", informations: "information", advices: "advice", homeworks: "homework", breads: "bread", rices: "rice", luggages: "luggage", equipments: "equipment", knowledges: "knowledge", moneys: "money", musics: "music", housework: "housework", houseworks: "housework", sugars: "sugar", butters: "butter" };
  rule("uncountable", "plural", new RegExp(`\\b(${Object.keys(UNC).filter(k => UNC[k] !== k).join("|")})\\b`, "i"),
    (c, m, w) => keepCase(w, UNC[w.toLowerCase()]), "Danh từ không đếm được (milk, furniture, information, advice…) không thêm -s.", "I drink some milk.");

  // --- comparatives / negatives ---
  rule("double-comparative", "grammar", /\b(more|most) (better|worse|bigger|smaller|easier|harder|faster|cheaper|older|younger|happier|hotter|colder|best|worst|biggest|easiest)\b/i,
    (c, m, a, b) => b, "Không dùng more/most với tính từ đã có -er/-est hoặc better/best.", "This tea is better.");
  rule("double-negative", "grammar", /\b(don't|doesn't|didn't|can't|won't|not|never|isn't|aren't|wasn't)((?: [a-z']+){1,3}?) (nothing|nobody|no one|nowhere|none)\b/i,
    (c, m, n, mid, w) => `${n}${mid} ${{ nothing: "anything", nobody: "anybody", "no one": "anyone", nowhere: "anywhere", none: "any" }[w.toLowerCase()]}`,
    "Tiếng Anh không dùng hai từ phủ định trong một câu: don't ... anything.", "I don't want anything.");

  // --- perfect: have/has + base verb ---
  const PERF_OK = new Set([...Object.keys(IRR).filter(v => v !== "have" && v !== "be" && pp(v) !== v), "finish", "clean", "wash", "watch", "visit", "open", "close", "live", "study", "brush", "start", "fold", "empty", "prepare", "fry", "boil", "fix"]);
  rule("perfect-base", "tense", new RegExp(`\\b(${SUBJ3}|I|you|we|they) (have|has)( not| never| already| just)? ([a-z]+)\\b`, "i"),
    (c, m, s, h, adv, v) => {
      const lv = v.toLowerCase(); if (!PERF_OK.has(lv)) return null;
      if (objectContext(c.str, c.off)) return null;
      if (c.past && !adv) return `${s} ${past(lv)}`;
      const sg = new RegExp(`^${SUBJ3}$`, "i").test(s); return `${s} ${sg ? "has" : "have"}${adv || ""} ${pp(lv)}`;
    }, "Thì hiện tại hoàn thành: have/has + V3 (I have drunk). Nếu có mốc quá khứ (yesterday, last night) thì dùng quá khứ đơn: I drank.", "I drank milk yesterday. / I have drunk my milk.");

  // --- agreement ---
  rule("has-have", "agreement", /\b(I|you|we|they) has\b/i, (c, m, s) => objectContext(c.str, c.off) ? null : `${s} have`,
    "I/you/we/they đi với have, chỉ he/she/it mới dùng has.", "I have a cat.");
  rule("have-has", "agreement", new RegExp(`\\b(${SUBJ3}) have\\b`, "i"), (c, m, s) => objectContext(c.str, c.off) ? null : `${s} has`,
    "He/she/it (ngôi 3 số ít) đi với has.", "She has a dog.");
  rule("dont-doesnt", "agreement", new RegExp(`\\b(${SUBJ3}) (don't|do not)\\b`, "i"), (c, m, s, d) => objectContext(c.str, c.off) ? null : `${s} ${/not/i.test(d) ? "does not" : "doesn't"}`,
    "He/she/it phủ định dùng doesn't (does not), không dùng don't.", "He doesn't like coffee.");
  rule("doesnt-dont", "agreement", /\b(I|you|we|they) (doesn't|does not)\b/i, (c, m, s, d) => `${s} ${/not/i.test(d) ? "do not" : "don't"}`,
    "I/you/we/they phủ định dùng don't.", "I don't like tea.");
  rule("i-am", "agreement", /\b(I) (is|are|be)\b/, (c, m, s, b) => objectContext(c.str, c.off) ? null : "I am",
    "Với I dùng am: I am (I'm).", "I am hungry.");
  rule("sg-is", "agreement", new RegExp(`\\b(${SUBJ3}) (are|am)\\b`, "i"), (c, m, s) => objectContext(c.str, c.off) ? null : `${s} is`,
    "He/she/it và everybody/everyone đi với is.", "Everybody is here.");
  rule("pl-are", "agreement", /\b(you|we|they|people) (is|am)\b/i, (c, m, s) => objectContext(c.str, c.off) ? null : `${s} are`,
    "You/we/they và people (số nhiều) đi với are.", "People are friendly here.");
  rule("was-were", "agreement", /\b(you|we|they|people) was\b/i, (c, m, s) => `${s} were`,
    "You/we/they đi với were (quá khứ).", "They were at home.");
  rule("were-was", "agreement", new RegExp(`\\b(I|${SUBJ3}) were\\b`, "i"), (c, m, s) => objectContext(c.str, c.off) ? null : `${s} was`,
    "I/he/she/it đi với was (trừ câu điều kiện 'If I were').", "I was tired.");
  rule("am-agree", "grammar", /\b(I am|I'm|we are|we're|you are|they are|he is|she is|he's|she's) (agree|disagree)\b/i,
    (c, m, s, v) => { const sub = s.split(/ |'/)[0]; return /^(he|she)$/i.test(sub) ? `${sub} ${v}s` : `${sub} ${v}`; },
    "agree là động từ, không cần am/is/are: I agree.", "I agree with you.");

  // --- modals ---
  rule("modal-to", "grammar", new RegExp(`\\b(${MODALS}|can't|cannot|won't) to ([a-z]+)\\b`, "i"),
    (c, m, md, v) => isForm(v, "base") ? `${md} ${v}` : null, "Sau động từ khuyết thiếu (can, must, should…) dùng động từ nguyên mẫu không 'to'.", "I can swim.");
  rule("modal-form", "grammar", new RegExp(`\\b(${MODALS}|can't|cannot|won't|couldn't|shouldn't|wouldn't)( not)?( I| you| we| they| he| she| it)? ([a-z]+)\\b`, "i"),
    (c, m, md, nt, p, v) => {
      const lv = v.toLowerCase(); if (lv === "be" || isForm(lv, "base")) return null;
      if (!(isForm(lv, "s3") || isForm(lv, "ing") || isForm(lv, "past"))) return null;
      if (isForm(lv, "pp") && !isForm(lv, "s3") && !isForm(lv, "ing")) return null;
      return `${md}${nt || ""}${p || ""} ${baseOf(lv)}`;
    }, "Sau can/will/must… động từ ở dạng nguyên mẫu (không -s, -ing, -ed).", "Can I watch five more minutes?");
  rule("do-form", "grammar", /\b(do|does|did|don't|doesn't|didn't)( not)?( I| you| we| they| he| she| it)? ([a-z]+)\b/i,
    (c, m, d, nt, p, v) => {
      const lv = v.toLowerCase(); if (!FORM[lv] || isForm(lv, "base")) return null;
      if (!p && !/n't|not/i.test(d + (nt || ""))) return null;
      if (!(isForm(lv, "past") || isForm(lv, "s3"))) return null;
      return `${d}${nt || ""}${p || ""} ${baseOf(lv)}`;
    }, "Sau do/does/did (kể cả don't/didn't) động từ trở về nguyên mẫu: didn't go, does he like.", "I didn't go out yesterday.");

  // --- verb patterns ---
  const NOT_AFTER_WANT = new Set("help water drink sleep rest work love call walk cook play turn use wash change smile dance study answer order plan fix iron empty dry clean open close check charge".split(" "));
  rule("want-to", "grammar", /\b(want|wants|wanted|wanting|need|needs|needed|like|likes|liked|try|tries|tried|decide|decides|decided|hope|hopes|hoped|forget|forgot|learn|learns|learned|plan|plans|planned|would like|'d like)( not)? ([a-z]+)\b/i,
    (c, m, v, nt, w) => {
      const lw = w.toLowerCase(); if (!isForm(lw, "base") || NOT_AFTER_WANT.has(lw) || lw === "to") return null;
      if (/^lik/i.test(v) && !/^(I|you|we|they|he|she|it|don't|doesn't|didn't|really|also|would|'d)$/i.test(prevWord(c.str, c.off))) return null;
      return `${v}${nt || ""} to ${lw}`;
    }, "want/need/like/try… + to + động từ: want to go.", "I want to go to the kitchen.");

  // --- be + verb forms ---
  rule("missing-be-ing", "grammar", /\b(I|you|we|they|he|she|it) ([a-z]+ing)\b/i,
    (c, m, p, v) => {
      if (!isForm(v, "ing") || isForm(v, "base") || objectContext(c.str, c.off)) return null;
      const be = p === "I" ? "am" : /^(he|she|it)$/i.test(p) ? "is" : "are"; return `${p} ${be} ${v}`;
    }, "Thì hiện tại tiếp diễn cần am/is/are + V-ing: I am watching TV.", "I am watching TV.");
  const BE_ADJ_OK = new Set("like open close clean dry empty free water love help work cut put read set shut hit let come run become change answer plan order play dress call rest iron".split(" "));
  rule("be-base", "grammar", /\b(I am|I'm|you are|you're|we are|we're|they are|they're|he is|he's|she is|she's|it is|it's)( not)? ([a-z]+)\b/i,
    (c, m, s, nt, v) => {
      const lv = v.toLowerCase(); if (!isForm(lv, "base") || BE_ADJ_OK.has(lv) || lv === "agree" || lv === "disagree") return null;
      if (/'s$/i.test(s) && isForm(lv, "pp")) return null;
      return `${s}${nt || ""} ${ing(lv)}`;
    }, "Sau am/is/are không dùng động từ nguyên mẫu. Muốn nói 'đang làm' dùng V-ing: I am watching.", "I am watching TV.");
  rule("missing-be-adj", "grammar", new RegExp(`\\b(I|you|we|they|he|she|it)( very| so| too| really)? (${ADJ})\\b`, "i"),
    (c, m, p, adv, a) => {
      if (objectContext(c.str, c.off)) return null;
      const be = p === "I" ? "am" : /^(he|she|it)$/i.test(p) ? "is" : "are"; return `${p} ${be}${adv || ""} ${a}`;
    }, "Trước tính từ (hungry, tired…) cần động từ to be: I am hungry (tiếng Việt không có 'là' ở đây).", "I am very hungry.");

  // --- past time markers ---
  rule("past-marker", "tense", new RegExp(`\\b(${SUBJ3}|I|you|we|they) (don't|doesn't|am|is|are|have|has|[a-z]+)\\b`, "i"),
    (c, m, s, v) => {
      if (!c.past || objectContext(c.str, c.off)) return null;
      const lv = v.toLowerCase();
      if (lv === "don't" || lv === "doesn't") return `${s} didn't`;
      if (lv === "am" || lv === "is") return `${s} was`;
      if (lv === "are") return `${s} were`;
      if (lv === "have" || lv === "has") { const nx = c.str.slice(c.off + m.length).match(/^\s+([a-z]+)/i); if (nx && isForm(nx[1], "pp") && !isForm(nx[1], "base")) return null; return `${s} had`; }
      if (MODALS.split("|").includes(lv)) return null;
      if (isForm(lv, "base") || isForm(lv, "s3")) { const b = baseOf(lv); if (past(b) === lv) return null; return `${s} ${past(b)}`; }
      return null;
    }, "Có từ chỉ quá khứ (yesterday, last night, ... ago) nên động từ chia ở quá khứ đơn: I drank, I went.", "I drank milk yesterday.");

  rule("sv-3sg", "agreement", new RegExp(`\\b(${SUBJ3}) ([a-z]+)\\b`, "i"),
    (c, m, s, v) => {
      const lv = v.toLowerCase(); if (!isForm(lv, "base") || isForm(lv, "past") && !isForm(lv, "base")) return null;
      if (objectContext(c.str, c.off)) return null;
      if (/^(it)$/i.test(s) && /^(up|down)$/.test(lv)) return null;
      return `${s} ${s3(lv)}`;
    }, "Chủ ngữ ngôi 3 số ít (he/she/it, my mom…) ở hiện tại đơn: động từ thêm -s/-es (he likes).", "He likes coffee.");
  rule("sv-plural", "agreement", /\b(I|you|we|they) ([a-z]+s)\b/i,
    (c, m, s, v) => {
      const lv = v.toLowerCase(); if (!isForm(lv, "s3") || isForm(lv, "base")) return null;
      if (objectContext(c.str, c.off)) return null; return `${s} ${baseOf(lv)}`;
    }, "I/you/we/they: động từ hiện tại đơn không thêm -s.", "I like milk.");

  // --- capitalization & punctuation (last) ---
  rule("cap-i", "punctuation", /(^|[^A-Za-z'])i(?=\b(?:'m|'ve|'d|'ll)?(?![A-Za-z]))/,
    (c, m, pre) => `${pre}I`, "Đại từ I luôn viết hoa.", "I am happy.", { global: true });
  rule("cap-start", "punctuation", /^(\s*)([a-z])/, (c, m, sp, ch) => `${sp}${ch.toUpperCase()}`,
    "Chữ cái đầu câu phải viết hoa.", "My cat is sleeping.");

  /* ---------------- engine ---------------- */
  function applyRule(r, sentence, ctx, issues) {
    let out = sentence, guard = 0, from = 0;
    const re = new RegExp(r.re.source, r.re.flags.replace("g", "") + "g");
    while (guard++ < 10) {
      re.lastIndex = from; const m = re.exec(out); if (!m) break;
      const c = Object.assign({}, ctx, { str: out, off: m.index });
      // offset of subject start for objectContext: use start of match plus leading non-word
      const rep = r.fn(c, ...m);
      if (rep == null || rep === m[0]) { from = m.index + Math.max(1, m[0].length > 1 ? 1 : 1); continue; }
      out = out.slice(0, m.index) + rep + out.slice(m.index + m[0].length);
      issues.push({ id: r.id, type: r.type, from: m[0].trim(), to: rep.trim(), msg_vi: r.msg, example_en: r.ex });
      from = m.index + rep.length;
    }
    return out;
  }
  function splitSentences(text) { return String(text).match(/(?:\b[ap]\.m\.|[^.!?])+[.!?]*|[.!?]+/gi) || []; }

  function check(text) {
    const original = String(text == null ? "" : text);
    const issues = [];
    const parts = splitSentences(original.replace(/[’‘]/g, "'"));
    const outParts = parts.map(part => {
      const lead = part.match(/^\s*/)[0];
      let s = part.slice(lead.length).replace(/\s+$/, ""); const trail = part.slice(lead.length + s.length);
      if (!s.trim()) return part;
      const abbr = /\b[ap]\.m\.$/i.test(s); const punct = abbr ? "" : (s.match(/[.!?]+$/) || [""])[0];
      let body = s.slice(0, s.length - punct.length).replace(/\s{2,}/g, " ");
      const ctx = { past: PAST_MARK.test(body), q: punct.includes("?") || (!punct && isQuestionStart(body)) };
      for (const r of R) body = applyRule(r, body, ctx, issues);
      let end = punct;
      if (!end && !abbr) { end = isQuestionStart(body) ? "?" : "."; issues.push({ id: "end-punct", type: "punctuation", from: body.split(" ").slice(-1)[0] || "", to: (body.split(" ").slice(-1)[0] || "") + end, msg_vi: "Câu cần có dấu kết thúc: dấu chấm (.) hoặc dấu hỏi (?).", example_en: "I am hungry." }); }
      return lead + body + end + trail;
    });
    const corrected = outParts.join("").replace(/\s+$/, "") || original;
    const g = issues.filter(i => i.type !== "punctuation").length, p = issues.length - g;
    const score = original.trim() ? Math.max(0, 100 - g * 15 - p * 4) : 0;
    return { original, corrected, issues, score };
  }

  const ELW_GRAMMAR = { check, RULES: R.map(r => ({ id: r.id, type: r.type, msg_vi: r.msg, example_en: r.ex })).concat([{ id: "end-punct", type: "punctuation" }]), forms: { s3, past, pp, ing } };

  /* ================= Mistakes notebook ================= */
  const KEY = "elw_mistakes_v1";
  let mem = { v: 1, items: [] };
  const TYPE_VI = { grammar: "Ngữ pháp", "word-choice": "Dùng từ", tense: "Thì", article: "Mạo từ", preposition: "Giới từ", plural: "Số nhiều", agreement: "Hòa hợp chủ–vị", "word-order": "Trật tự từ", punctuation: "Dấu câu", naturalness: "Tự nhiên" };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function load() {
    try { const ls = root.localStorage; if (!ls) return mem; const d = JSON.parse(ls.getItem(KEY) || "null"); if (d && d.v === 1 && Array.isArray(d.items)) mem = d; } catch (e) { /* ignore */ }
    return mem;
  }
  function save() { try { if (root.localStorage) root.localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* quota / private mode */ } }
  const uid = () => "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  function add(res, context) {
    load();
    if (typeof res === "string") res = check(res);
    if (!res || !Array.isArray(res.issues)) return [];
    const added = [];
    const gi = res.issues.filter(i => i.type !== "punctuation");
    const list = gi.length ? gi : res.issues;
    for (const is of list) {
      const key = (is.id + "|" + String(is.from).toLowerCase());
      let it = mem.items.find(x => x.key === key);
      if (it) { it.count++; it.ts = Date.now(); it.wrong = res.original; it.right = res.corrected; }
      else { it = { id: uid(), key, rule: is.id, type: is.type, from: is.from, to: is.to, msg_vi: is.msg_vi, example_en: is.example_en, wrong: String(res.original).trim(), right: res.corrected, context: context || "", count: 1, ts: Date.now() }; mem.items.unshift(it); }
      added.push(it);
    }
    if (mem.items.length > 300) mem.items.length = 300;
    save(); return added;
  }
  function list() { return load().items.slice(); }
  function remove(id) { load(); const n = mem.items.length; mem.items = mem.items.filter(x => x.id !== id); save(); return mem.items.length !== n; }
  function clear() { mem = { v: 1, items: [] }; save(); }
  function stats() {
    const items = list(); const byType = {};
    items.forEach(i => { byType[i.type] = (byType[i.type] || 0) + i.count; });
    const top = items.slice().sort((a, b) => b.count - a.count || b.ts - a.ts).slice(0, 5).map(i => ({ id: i.id, rule: i.rule, type: i.type, from: i.from, to: i.to, count: i.count }));
    const mostType = Object.keys(byType).sort((a, b) => byType[b] - byType[a])[0] || null;
    return { total: items.length, occurrences: items.reduce((s, i) => s + i.count, 0), byType, mostType, top };
  }
  function shuffle(a, seed) { a = a.slice(); let x = seed || 7; for (let i = a.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; const j = Math.floor(x / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function practice(n) {
    n = n || 5; const items = list().sort((a, b) => b.count - a.count || b.ts - a.ts);
    const out = [];
    for (let k = 0; k < Math.min(n, items.length * 3) && out.length < n; k++) {
      const it = items[k % items.length]; const kind = ["fix-the-sentence", "choose-correct", "fill-gap"][(k + Math.floor(k / items.length)) % 3];
      if (kind === "fix-the-sentence") out.push({ type: kind, itemId: it.id, prompt_vi: "Sửa lại câu sau cho đúng:", wrong: it.wrong, answer: it.right, hint_vi: it.msg_vi });
      else if (kind === "choose-correct") {
        const alt = it.right.replace(it.to, it.from) === it.right ? it.wrong + "" : it.right.replace(it.to, it.from);
        const opts = Array.from(new Set([it.right, it.wrong, alt, it.wrong.replace(/[.!?]?$/, "") === it.wrong ? it.wrong + "." : it.wrong.replace(/[.!?]$/, "")])).slice(0, 3);
        out.push({ type: kind, itemId: it.id, prompt_vi: "Chọn câu đúng:", wrong: it.wrong, answer: it.right, options: shuffle(opts, k + 3), hint_vi: it.msg_vi });
      } else {
        const idx = it.right.indexOf(it.to);
        if (idx < 0) { out.push({ type: "fix-the-sentence", itemId: it.id, prompt_vi: "Sửa lại câu sau cho đúng:", wrong: it.wrong, answer: it.right, hint_vi: it.msg_vi }); continue; }
        const gap = it.right.slice(0, idx) + "____" + it.right.slice(idx + it.to.length);
        out.push({ type: kind, itemId: it.id, prompt_vi: "Điền vào chỗ trống: " + gap, wrong: it.wrong, gap, answer: it.to, options: shuffle([it.to, it.from], k), hint_vi: it.msg_vi });
      }
    }
    return out;
  }
  const norm = s => String(s || "").toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'\s]/g, " ").replace(/\s+/g, " ").trim();
  const isRight = (ex, ans) => norm(ex.answer) === norm(ans);

  const css = `.gm-book{--accent:#e8743b;--line:#e3d6c3;--ink:#2d2a26;--muted:#7a7166;--ok:#3a9d5d;--bad:#c94a3a;font:15px/1.45 system-ui,"Segoe UI",Roboto,sans-serif;color:var(--ink);max-width:100%;box-sizing:border-box}
.gm-book *{box-sizing:border-box}.gm-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.gm-head h3{margin:0;font-size:18px}.gm-stat{font-size:13px;color:var(--muted)}
.gm-btn{border:1px solid var(--line);background:#fff;border-radius:10px;padding:7px 12px;cursor:pointer;font-size:14px;color:var(--ink)}
.gm-btn:hover{border-color:var(--accent)}.gm-btn.gm-primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
.gm-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}.gm-chip{border:1px solid var(--line);background:#fff;border-radius:999px;padding:4px 10px;font-size:13px;cursor:pointer;color:var(--ink)}
.gm-chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
.gm-list{display:flex;flex-direction:column;gap:8px;margin:0;padding:0;list-style:none}
.gm-item{background:#fffdf9;border:1px solid var(--line);border-radius:14px;padding:10px 12px;overflow-wrap:anywhere}
.gm-wrong{color:var(--bad);text-decoration:line-through;text-decoration-thickness:1px}.gm-right{color:var(--ok);font-weight:700}
.gm-row{display:flex;gap:6px;align-items:flex-start;justify-content:space-between}.gm-acts{display:flex;gap:4px;flex:none}
.gm-icon{border:1px solid var(--line);background:#fff;border-radius:8px;padding:3px 7px;cursor:pointer;font-size:14px}
.gm-tag{display:inline-block;font-size:11px;background:#fff6ef;border:1px solid var(--line);border-radius:999px;padding:1px 8px;color:var(--accent);margin-right:4px}
.gm-msg{font-size:13px;color:var(--muted);margin-top:4px}.gm-empty{color:var(--muted);text-align:center;padding:18px;border:1px dashed var(--line);border-radius:14px}
.gm-quiz{background:#fffdf9;border:1px solid var(--line);border-radius:16px;padding:14px}.gm-q{font-weight:700;margin:6px 0}
.gm-quiz input{width:100%;padding:9px 10px;border:1px solid var(--line);border-radius:10px;font-size:15px}
.gm-opts{display:flex;flex-direction:column;gap:6px;margin:8px 0}.gm-opt{text-align:left;border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 10px;cursor:pointer;font-size:15px;color:var(--ink)}
.gm-opt.ok{border-color:var(--ok);background:#eef8f1}.gm-opt.no{border-color:var(--bad);background:#fdeeee}
.gm-fb{margin-top:8px;font-size:14px}.gm-bar{height:6px;background:#f3e8da;border-radius:99px;overflow:hidden;margin:6px 0}.gm-bar i{display:block;height:100%;background:var(--accent)}
.gm-foot{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}`;

  function renderBook(container, opts) {
    if (!container) return null; opts = opts || {};
    const doc = container.ownerDocument || root.document;
    if (doc && !doc.getElementById("gm-css")) { const st = doc.createElement("style"); st.id = "gm-css"; st.textContent = css; doc.head.appendChild(st); }
    const speak = opts.speak || (t => { try { const u = new root.SpeechSynthesisUtterance(t); u.lang = "en-US"; root.speechSynthesis.cancel(); root.speechSynthesis.speak(u); } catch (e) { } });
    let filter = "all", quiz = null;
    container.classList.add("gm-book");
    function drawList() {
      const st = stats(); const items = list().filter(i => filter === "all" || i.type === filter);
      const types = Object.keys(st.byType);
      container.innerHTML = `<div class="gm-head"><h3>📒 Sổ lỗi của tôi</h3><span class="gm-stat">${st.total} lỗi · ${st.occurrences} lần mắc${st.mostType ? " · hay sai nhất: <b>" + esc(TYPE_VI[st.mostType] || st.mostType) + "</b>" : ""}</span></div>
      <div class="gm-chips" role="group" aria-label="Lọc theo loại lỗi"><button class="gm-chip ${filter === "all" ? "on" : ""}" data-f="all">Tất cả</button>${types.map(t => `<button class="gm-chip ${filter === t ? "on" : ""}" data-f="${esc(t)}">${esc(TYPE_VI[t] || t)} (${st.byType[t]})</button>`).join("")}</div>
      ${st.total ? `<div class="gm-foot" style="margin:0 0 10px"><button class="gm-btn gm-primary" data-act="quiz">🎯 Luyện lại lỗi của tôi</button><button class="gm-btn" data-act="clear">🗑️ Xóa hết</button></div>` : ""}
      ${items.length ? `<ul class="gm-list">${items.map(i => `<li class="gm-item" data-id="${esc(i.id)}"><div class="gm-row"><div><span class="gm-tag">${esc(TYPE_VI[i.type] || i.type)}</span>${i.count > 1 ? `<span class="gm-tag">×${i.count}</span>` : ""}<div class="gm-wrong">${esc(i.wrong)}</div><div class="gm-right">→ ${esc(i.right)}</div></div><div class="gm-acts"><button class="gm-icon" data-act="speak" aria-label="Nghe câu đúng">🔊</button><button class="gm-icon" data-act="del" aria-label="Xóa lỗi">✕</button></div></div><div class="gm-msg">💡 ${esc(i.msg_vi)} <i>(${esc(i.from)} → ${esc(i.to)})</i>${i.context ? " · " + esc(i.context) : ""}</div></li>`).join("")}</ul>`
        : `<div class="gm-empty">Chưa có lỗi nào được lưu. Khi bạn nói/viết sai, lỗi sẽ xuất hiện ở đây để ôn lại. ✨</div>`}`;
    }
    function drawQuiz() {
      const q = quiz; const ex = q.list[q.i];
      if (!ex) {
        container.innerHTML = `<div class="gm-quiz"><h3 style="margin:0">🎉 Hoàn thành!</h3><p class="gm-q">Điểm của bạn: ${q.score}/${q.list.length}</p><div class="gm-bar"><i style="width:${Math.round(q.score / q.list.length * 100)}%"></i></div><p class="gm-msg">${q.score === q.list.length ? "Tuyệt vời, bạn đã sửa hết lỗi của mình!" : "Hãy xem lại các lỗi trong sổ và luyện thêm nhé."}</p><div class="gm-foot"><button class="gm-btn gm-primary" data-act="quiz">Luyện lại</button><button class="gm-btn" data-act="back">← Về sổ lỗi</button></div></div>`; return;
      }
      container.innerHTML = `<div class="gm-quiz"><div class="gm-row"><b>🎯 Luyện lại lỗi của tôi</b><span class="gm-stat">Câu ${q.i + 1}/${q.list.length} · Điểm ${q.score}</span></div><div class="gm-bar"><i style="width:${Math.round(q.i / q.list.length * 100)}%"></i></div>
      <div class="gm-msg">${esc(ex.prompt_vi)}</div>${ex.type === "fix-the-sentence" ? `<p class="gm-q gm-wrong">${esc(ex.wrong)}</p><input class="gm-in" aria-label="Câu đã sửa" placeholder="Gõ câu đúng…" autocomplete="off"><div class="gm-foot"><button class="gm-btn gm-primary" data-act="check">Kiểm tra</button><button class="gm-btn" data-act="hint">💡 Gợi ý</button></div>`
        : `${ex.type === "fill-gap" ? `<p class="gm-q">${esc(ex.gap)}</p>` : ""}<div class="gm-opts">${ex.options.map((o, k) => `<button class="gm-opt" data-act="pick" data-k="${k}">${esc(o)}</button>`).join("")}</div>`}
      <div class="gm-fb" aria-live="polite"></div><div class="gm-foot"><button class="gm-btn" data-act="back">← Thoát</button></div></div>`;
    }
    function answer(val, btn) {
      const q = quiz, ex = q.list[q.i]; if (q.done) return; q.done = true;
      const ok = isRight(ex, val); if (ok) q.score++;
      const fb = container.querySelector(".gm-fb");
      if (btn) { container.querySelectorAll(".gm-opt").forEach(b => { if (isRight(ex, b.textContent)) b.classList.add("ok"); }); if (!ok) btn.classList.add("no"); }
      fb.innerHTML = (ok ? `✅ <b>Chính xác!</b>` : `❌ <b>Chưa đúng.</b> Đáp án: <span class="gm-right">${esc(ex.answer)}</span>`) + `<div class="gm-msg">${esc(ex.hint_vi)}</div><div class="gm-foot"><button class="gm-btn gm-primary" data-act="next">Tiếp →</button><button class="gm-icon" data-act="speakq">🔊</button></div>`;
    }
    container.onclick = e => {
      const b = e.target.closest("[data-act],[data-f]"); if (!b) return;
      if (b.dataset.f) { filter = b.dataset.f; return drawList(); }
      const act = b.dataset.act, li = b.closest(".gm-item"), id = li && li.dataset.id;
      if (act === "speak") { const it = list().find(x => x.id === id); if (it) speak(it.right); }
      else if (act === "del") { remove(id); drawList(); }
      else if (act === "clear") { if (!root.confirm || root.confirm("Xóa toàn bộ sổ lỗi?")) { clear(); drawList(); } }
      else if (act === "quiz") { const l = practice(Math.min(8, Math.max(3, list().length * 2))); if (!l.length) return; quiz = { list: l, i: 0, score: 0, done: false }; drawQuiz(); }
      else if (act === "back") { quiz = null; drawList(); }
      else if (act === "check") { const inp = container.querySelector(".gm-in"); answer(inp ? inp.value : ""); }
      else if (act === "hint") { const fb = container.querySelector(".gm-fb"); fb.innerHTML = `<div class="gm-msg">💡 ${esc(quiz.list[quiz.i].hint_vi)}</div>`; }
      else if (act === "pick") answer(b.textContent, b);
      else if (act === "next") { quiz.i++; quiz.done = false; drawQuiz(); }
      else if (act === "speakq") speak(quiz.list[quiz.i].answer.replace(/____/, ""));
    };
    container.onkeydown = e => { if (e.key === "Enter" && e.target.classList && e.target.classList.contains("gm-in")) { e.preventDefault(); quiz && !quiz.done ? answer(e.target.value) : null; } };
    drawList();
    return { refresh: drawList };
  }

  const ELW_MISTAKES = { add, list, stats, remove, clear, practice, renderBook, isCorrect: isRight, KEY, css, TYPE_VI };
  root.ELW_GRAMMAR = ELW_GRAMMAR; root.ELW_MISTAKES = ELW_MISTAKES;
  if (typeof module !== "undefined" && module.exports) module.exports = { ELW_GRAMMAR, ELW_MISTAKES };
})(typeof window !== "undefined" ? window : globalThis);
