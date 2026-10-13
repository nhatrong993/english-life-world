/* English Life World — level-aware paragraph generator (CEFR A1–C2).
   Turns a log of COMPLETED actions into an English paragraph + Vietnamese translation.
   Truth rules: only logged actions are described; "cold" only when milk came from the fridge;
   "while watching TV" only when ctx.watching; "Finally" only on the last segment. */
(function (root) {
  "use strict";

  var LEVELS = [
    { id: "A1", name: "A1 · Beginner", vi: "Mới bắt đầu" },
    { id: "A2", name: "A2 · Elementary", vi: "Sơ cấp" },
    { id: "B1", name: "B1 · Intermediate", vi: "Trung cấp" },
    { id: "B2", name: "B2 · Upper-intermediate", vi: "Trên trung cấp" },
    { id: "C1", name: "C1 · Advanced", vi: "Cao cấp" },
    { id: "C2", name: "C2 · Proficient", vi: "Thành thạo" }
  ];
  var TIER = { A1: 0, A2: 0, B1: 1, B2: 2, C1: 3, C2: 4 };

  // id: [vi, [tier0 (A1/A2), tier1 (B1), tier2 (B2), tier3 (C1), tier4 (C2)]]
  // Each phrase starts with its main verb (needed for -ing / past participle forms). {cold} → "cold " or "".
  var ACT = {
    open_fridge: ["mở tủ lạnh", ["open the fridge", "open the fridge door", "open the fridge", "pull open the fridge door", "swing open the fridge door"]],
    take_milk: ["lấy sữa ra khỏi tủ lạnh", ["take the milk out of the fridge", "take the cold milk out of the fridge", "grab the cold milk from the fridge", "take out the carton of cold milk", "fish the cold milk out of the fridge"]],
    put_milk_back: ["cất sữa lại vào tủ lạnh", ["put the milk back in the fridge", "put the milk back in the fridge", "put the milk back in the fridge", "return the milk to the fridge", "slip the milk back into the fridge"]],
    close_fridge: ["đóng tủ lạnh", ["close the fridge", "close the fridge door", "shut the fridge", "push the fridge door shut", "nudge the fridge door shut"]],
    pick_up_cup: ["cầm cốc lên", ["pick up the cup", "pick up the cup", "pick the cup up", "lift the cup", "take the cup in my hand"]],
    put_cup_on_table: ["đặt cốc lên bàn", ["put the cup on the table", "put the cup down on the table", "set the cup down on the table", "place the cup on the table", "set the cup down on the table"]],
    pour_milk: ["rót sữa vào cốc", ["pour milk into the cup", "pour {cold}milk into the cup", "pour myself some {cold}milk", "fill the cup with {cold}milk", "fill the cup to the brim with {cold}milk"]],
    drink_from_cup: ["uống một ngụm sữa", ["drink some milk", "take a sip of milk", "take a sip of milk", "take a sip of milk", "take a slow sip of milk"]],
    wipe_table: ["lau bàn", ["clean the table", "wipe the table", "wipe the table down", "wipe down the table", "give the table a good wipe"]],
    put_book_on_table: ["đặt quyển sách lên bàn", ["put the book on the table", "put the book on the table", "put the book down on the table", "lay the book on the table", "set the book down on the table"]],
    sweep_under_table: ["quét dưới gầm bàn", ["sweep under the table", "sweep under the table", "sweep under the table", "sweep the floor under the table", "give the floor under the table a sweep"]],
    pull_out_chair: ["kéo ghế ra", ["pull out the chair", "pull out the chair", "pull out the chair", "pull out the chair", "draw out the chair"]],
    sit_on_chair: ["ngồi xuống ghế", ["sit on the chair", "sit down on the chair", "settle comfortably on the chair", "sink into the chair", "ease myself into the chair"]],
    get_up: ["đứng dậy", ["get up", "get up from the chair", "get up from the chair", "rise from the chair", "rise from my seat"]],
    push_chair_in: ["đẩy ghế vào", ["push the chair in", "push the chair in", "push the chair back in", "tuck the chair back under the table", "tuck the chair back under the table"]],
    sweep_floor: ["quét nhà", ["sweep the floor", "sweep the floor", "sweep the floor", "run the broom across the floor", "give the floor a sweep"]],
    open_window: ["mở cửa sổ", ["open the window", "open the window", "open the window", "open the window to let in some fresh air", "throw open the window"]],
    close_window: ["đóng cửa sổ", ["close the window", "close the window", "shut the window", "close the window", "pull the window shut"]],
    water_plant: ["tưới cây", ["water the plant", "water the plant", "give the plant some water", "water the plant", "give the plant a drink"]],
    pick_up_book: ["nhặt quyển sách lên", ["pick up the book", "pick up the book", "pick the book up off the floor", "pick the book up from the floor", "retrieve the book from the floor"]],
    turn_on_tv: ["bật ti vi", ["turn on the TV", "turn on the TV", "switch on the TV", "switch on the TV", "flick on the TV"]],
    watch_tv: ["xem ti vi", ["watch TV", "watch TV", "watch TV", "turn my attention to the screen", "unwind in front of the TV"]],
    turn_off_tv: ["tắt ti vi", ["turn off the TV", "turn off the TV", "switch off the TV", "switch off the TV", "switch the TV off"]]
  };
  // watch_tv right after turn_on_tv in the same clause
  var WATCH_AFTER_ON = ["watch it", "watch it", "watch it", "turn my attention to the screen", "unwind in front of it"];

  // Related consecutive actions merged into one clause at B1+
  var MERGE = {
    "open_fridge>take_milk": 1, "take_milk>close_fridge": 1, "put_milk_back>close_fridge": 1,
    "pull_out_chair>sit_on_chair": 1, "get_up>push_chair_in": 1, "turn_on_tv>watch_tv": 1,
    "put_cup_on_table>pour_milk": 1
  };

  var VERB = {
    open: ["opening", "opened"], take: ["taking", "taken"], put: ["putting", "put"], close: ["closing", "closed"],
    pick: ["picking", "picked"], pour: ["pouring", "poured"], drink: ["drinking", "drunk"], wipe: ["wiping", "wiped"],
    sweep: ["sweeping", "swept"], pull: ["pulling", "pulled"], sit: ["sitting", "sat"], get: ["getting", "got"],
    push: ["pushing", "pushed"], water: ["watering", "watered"], turn: ["turning", "turned"], watch: ["watching", "watched"],
    switch: ["switching", "switched"], settle: ["settling", "settled"], sink: ["sinking", "sunk"], ease: ["easing", "eased"],
    give: ["giving", "given"], set: ["setting", "set"], fill: ["filling", "filled"], tuck: ["tucking", "tucked"],
    return: ["returning", "returned"], grab: ["grabbing", "grabbed"], clean: ["cleaning", "cleaned"], lift: ["lifting", "lifted"],
    run: ["running", "run"], lay: ["laying", "laid"], place: ["placing", "placed"], swing: ["swinging", "swung"],
    fish: ["fishing", "fished"], slip: ["slipping", "slipped"], nudge: ["nudging", "nudged"], shut: ["shutting", "shut"],
    rise: ["rising", "risen"], draw: ["drawing", "drawn"], throw: ["throwing", "thrown"], retrieve: ["retrieving", "retrieved"],
    flick: ["flicking", "flicked"], unwind: ["unwinding", "unwound"], nurse: ["nursing", "nursed"], stop: ["stopping", "stopped"],
    make: ["making", "made"], hang: ["hanging", "hung"], lie: ["lying", "lain"], read: ["reading", "read"], spread: ["spreading", "spread"],
    eat: ["eating", "eaten"], find: ["finding", "found"], bring: ["bringing", "brought"], hold: ["holding", "held"], leave: ["leaving", "left"],
    wake: ["waking", "woken"], go: ["going", "gone"], walk: ["walking", "walked"], plug: ["plugging", "plugged"], unplug: ["unplugging", "unplugged"],
    put_: ["putting", "put"], cut: ["cutting", "cut"], fry: ["frying", "fried"], dry: ["drying", "dried"], empty: ["emptying", "emptied"],
    shake: ["shaking", "shaken"], feed: ["feeding", "fed"], sleep: ["sleeping", "slept"], buy: ["buying", "bought"], keep: ["keeping", "kept"],
    begin: ["beginning", "begun"], choose: ["choosing", "chosen"], wear: ["wearing", "worn"], see: ["seeing", "seen"], do: ["doing", "done"]
  };
  function verbForm(vp, k) {
    // trạng từ đứng đầu (quickly turn off …) → chia động từ thứ hai
    var m = /^(\w+ly) (.*)$/.exec(vp);
    if (m && !VERB[m[1].toLowerCase()]) return m[1] + " " + verbForm(m[2], k);
    var sp = vp.indexOf(" "), w = sp < 0 ? vp : vp.slice(0, sp), rest = sp < 0 ? "" : vp.slice(sp);
    var f = VERB[w.toLowerCase()];
    if (!f) {
      var ing = /ie$/.test(w) ? w.slice(0, -2) + "ying" : /[^e]e$/.test(w) ? w.slice(0, -1) + "ing" : w + "ing";
      var pp = /e$/.test(w) ? w + "d" : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + "ied" : w + "ed";
      f = [ing, pp];
    }
    return f[k] + rest;
  }
  var ing = function (vps) { return vps.map(function (v) { return verbForm(v, 0); }).join(" and "); };
  var pp = function (vps) { return vps.map(function (v) { return verbForm(v, 1); }).join(" and "); };
  var base = function (vps) { return vps.join(" and "); };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var lowerStart = function (s) { return /^I\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); };

  function isWD(it) { return it.id === "drink_from_cup" && it.ctx && it.ctx.watching; }

  // phrase for one item: [en_vp, vi_vp] or null (unknown + no fallback)
  function phrase(it, tier, opts, prevId, drinkCount) {
    var d = ACT[it.id];
    if (!d) {
      if (opts && typeof opts.fallback === "function") {
        try { var fb = opts.fallback(it.id); if (fb && fb[0]) return [String(fb[0]), String(fb[1] || fb[0])]; } catch (e) {}
      }
      return null;
    }
    var en = d[1][tier], vi = d[0];
    if (it.id === "watch_tv" && prevId === "turn_on_tv" && !(opts && opts._a1)) en = WATCH_AFTER_ON[tier];
    if (it.id === "pour_milk" && tier >= 3 && prevId === "put_cup_on_table") en = en.replace("fill the cup", "fill it");
    if (it.id === "drink_from_cup" && drinkCount > 0) {
      if (tier === 0) en += " again"; else en = en.replace(/a (slow )?sip/, "another $1sip");
      vi = "uống thêm một ngụm sữa";
    }
    var cold = it.ctx && it.ctx.milkFromFridge && (tier > 0 || (opts && opts.rich));
    en = en.replace("{cold}", cold ? "cold " : "");
    if (it.id === "pour_milk" && cold && tier === 0) en = "pour cold milk into the cup";
    if (it.id === "take_milk" && tier === 0 && opts && opts.rich) en = "take the cold milk out of the fridge";
    return [en, vi];
  }

  // Normalise items, resolve phrases (skips unknown ids with no fallback)
  function prep(items, tier, opts) {
    var out = [], drinks = 0, prevId = null;
    (items || []).forEach(function (raw) {
      if (!raw) return;
      var it = { uid: raw.uid, id: raw.id, ctx: raw.ctx || {} };
      var p = phrase(it, tier, opts, prevId, it.id === "drink_from_cup" ? drinks : 0);
      if (it.id === "drink_from_cup") drinks++;
      prevId = it.id;
      if (!p) return;
      it.en = p[0]; it.vi = p[1];
      out.push(it);
    });
    return out;
  }

  var VI_CONN = { First: "Đầu tiên,", Then: "Sau đó,", Next: "Tiếp theo,", "After that": "Sau đó nữa,", Finally: "Cuối cùng," };

  function withConn(seg, conn) {
    if (!conn) return seg;
    var en = conn === "Then" && /^I\b/.test(seg.en) ? "Then " + seg.en : conn + ", " + lowerStart(seg.en);
    seg.en = en;
    seg.vi = VI_CONN[conn] + " " + seg.vi.charAt(0).toLowerCase() + seg.vi.slice(1);
    return seg;
  }

  /* ---------- A1: one action per sentence ---------- */
  function buildA1(its) {
    var n = its.length;
    return its.map(function (it, k) {
      var seg = { uids: [it.uid], en: "I " + it.en + ".", vi: "Tôi " + it.vi + "." };
      var conn = n === 1 ? null : k === 0 ? "First" : k === n - 1 ? "Finally" : "Then";
      return withConn(seg, conn);
    });
  }

  /* ---------- A2: pairs joined with "and" ---------- */
  function buildA2(its) {
    var groups = [];
    for (var i = 0; i < its.length; i += 2) groups.push(its.slice(i, i + 2));
    var n = groups.length, mids = ["Then", "After that", "Next"];
    return groups.map(function (g, k) {
      var seg = {
        uids: g.map(function (x) { return x.uid; }),
        en: "I " + g.map(function (x) { return x.en; }).join(" and then ") + ".",
        vi: "Tôi " + g.map(function (x) { return x.vi; }).join(" rồi ") + "."
      };
      if (g.length === 2) seg.en = "I " + g[0].en + " and " + g[1].en + ".";
      var conn = n === 1 ? null : k === 0 ? "First" : k === n - 1 ? "Finally" : mids[(k - 1) % 3];
      return withConn(seg, conn);
    });
  }

  /* ---------- B1+: units (merged related actions) → sentences ---------- */
  function units(its) {
    var us = [];
    its.forEach(function (it) {
      var last = us[us.length - 1];
      if (isWD(it)) {
        if (last && last.wd) last.items.push(it); else us.push({ wd: true, items: [it] });
        return;
      }
      var prev = last && !last.wd ? last.items[last.items.length - 1] : null;
      if (prev && last.items.length < 3 && MERGE[prev.id + ">" + it.id]) last.items.push(it);
      else us.push({ wd: false, items: [it] });
    });
    us.forEach(function (u) {
      u.vps = u.items.map(function (x) { return x.en; });
      u.vis = u.items.map(function (x) { return x.vi; });
      u.uids = u.items.map(function (x) { return x.uid; });
    });
    return us;
  }

  function wdSentence(u, tier) {
    var many = u.items.length > 1;
    var en;
    if (tier === 1) en = many ? "While watching TV, I take a sip of milk every now and then." : "While watching TV, I take a sip of milk.";
    else if (tier === 2) en = many ? "As I get caught up in the show, I occasionally take a sip of milk." : "As I watch the show, I take a sip of milk.";
    else if (tier === 3) en = many ? "Without taking my eyes off the screen, I take a sip of milk every now and then." : "Without taking my eyes off the screen, I take a sip of milk.";
    else en = many ? "Eyes on the screen, I nurse my cup of milk, sipping at it every so often." : "Eyes still on the screen, I take a slow sip of milk.";
    var vi = many ? "Trong lúc xem ti vi, thỉnh thoảng tôi lại uống một ngụm sữa." : "Trong lúc xem ti vi, tôi uống một ngụm sữa.";
    return { uids: u.uids.slice(), en: en, vi: vi, tpl: "wd" };
  }

  // pair templates per tier: function(u1,u2) -> [en, vi]
  var PAIR = {
    1: [
      function (a, b) { return ["After " + ing(a.vps) + ", I " + base(b.vps) + ".", "Sau khi " + a.vis.join(" và ") + ", tôi " + b.vis.join(" và ") + "."]; },
      function (a, b) { return ["I " + base(a.vps) + ", and then I " + base(b.vps) + ".", "Tôi " + a.vis.join(" và ") + ", rồi tôi " + b.vis.join(" và ") + "."]; },
      function (a, b) { return ["Before " + ing(b.vps) + ", I " + base(a.vps) + ".", "Tôi " + a.vis.join(" và ") + " trước khi " + b.vis.join(" và ") + "."]; }
    ],
    2: [
      function (a, b) { return ["After " + ing(a.vps) + ", I " + base(b.vps) + ".", "Sau khi " + a.vis.join(" và ") + ", tôi " + b.vis.join(" và ") + "."]; },
      function (a, b) { return ["Once I've " + pp(a.vps) + ", I " + base(b.vps) + ".", "Khi đã " + a.vis.join(" và ") + " xong, tôi " + b.vis.join(" và ") + "."]; },
      function (a, b) { return ["I " + base(a.vps) + " and then " + base(b.vps) + ".", "Tôi " + a.vis.join(" và ") + " rồi " + b.vis.join(" và ") + "."]; }
    ],
    3: [
      function (a, b) { return ["Having " + pp(a.vps) + ", I " + base(b.vps) + ".", "Sau khi " + a.vis.join(" và ") + " xong, tôi " + b.vis.join(" và ") + "."]; },
      function (a, b) { return ["I " + base(a.vps) + ", after which I " + base(b.vps) + ".", "Tôi " + a.vis.join(" và ") + ", sau đó " + b.vis.join(" và ") + "."]; },
      function (a, b) { return ["Once I have " + pp(a.vps) + ", I " + base(b.vps) + ".", "Khi đã " + a.vis.join(" và ") + " xong, tôi " + b.vis.join(" và ") + "."]; }
    ],
    4: [
      function (a, b) { return ["Having " + pp(a.vps) + ", I " + base(b.vps) + ".", "Sau khi " + a.vis.join(" và ") + " xong, tôi " + b.vis.join(" và ") + "."]; },
      function (a, b) { return ["I " + base(a.vps) + " before " + ing(b.vps) + ".", "Tôi " + a.vis.join(" và ") + " rồi mới " + b.vis.join(" và ") + "."]; },
      function (a, b) { return ["I " + base(a.vps) + ", then " + base(b.vps) + ".", "Tôi " + a.vis.join(" và ") + ", rồi " + b.vis.join(" và ") + "."]; }
    ]
  };

  function buildHigh(its, tier) {
    var us = units(its), segs = [], k = 0, i = 0;
    while (i < us.length) {
      var u = us[i];
      if (u.wd) { segs.push(wdSentence(u, tier)); i++; continue; }
      var nx = us[i + 1];
      if (nx && !nx.wd) {
        var r = PAIR[tier][k++ % 3](u, nx);
        segs.push({ uids: u.uids.concat(nx.uids), en: r[0], vi: r[1], tpl: "pair" });
        i += 2;
      } else {
        var prevSeg = segs[segs.length - 1];
        var en = "I " + base(u.vps) + ".", vi = "Tôi " + u.vis.join(" và ") + ".";
        if (tier === 4 && prevSeg && prevSeg.tpl !== "wd") { en = "With that done, I " + base(u.vps) + "."; vi = "Xong việc đó, tôi " + u.vis.join(" và ") + "."; }
        segs.push({ uids: u.uids.slice(), en: en, vi: vi, tpl: "single" });
        i++;
      }
    }
    var n = segs.length, mids = ["Then", "Next", "After that"], m = 0;
    segs.forEach(function (s, idx) {
      var conn = null;
      if (n > 1 && idx === n - 1) conn = "Finally";
      else if (n > 2 && idx === 0 && tier <= 2 && /^I\b/.test(s.en)) conn = "First";
      else if (idx > 0 && s.tpl === "single" && /^I\b/.test(s.en)) conn = mids[m++ % 3];
      withConn(s, conn);
      delete s.tpl;
    });
    return segs;
  }

  function build(items, level, opts) {
    opts = opts || {};
    var tier = TIER[level] != null ? TIER[level] : 0;
    var its = prep(items, tier, level === "A1" || TIER[level] == null ? Object.assign({}, opts, { _a1: true }) : opts);
    if (!its.length) return [];
    var segs = level === "A1" || TIER[level] == null ? buildA1(its) : level === "A2" ? buildA2(its) : buildHigh(its, tier);
    return segs.map(function (s) { return { uids: s.uids, en: cap(s.en), vi: cap(s.vi) }; });
  }

  /* ---------- extras ---------- */
  var CHUNKS = [
    ["take the milk out of the fridge", "lấy sữa ra khỏi tủ lạnh"], ["out of the fridge", "ra khỏi tủ lạnh"],
    ["put the milk back", "cất sữa lại"], ["pick up the cup", "cầm cốc lên"], ["pick the cup up", "cầm cốc lên"],
    ["on the table", "trên bàn"], ["set the cup down", "đặt cốc xuống"], ["pour milk into the cup", "rót sữa vào cốc"],
    ["pour myself some", "tự rót cho mình một ít"], ["cold milk", "sữa lạnh"], ["fill the cup with", "rót đầy cốc bằng"],
    ["to the brim", "đầy tới miệng"], ["take a sip of", "uống một ngụm"], ["another sip", "thêm một ngụm"],
    ["drink some milk", "uống chút sữa"], ["sit down on the chair", "ngồi xuống ghế"], ["sit on the chair", "ngồi lên ghế"],
    ["settle comfortably", "ngồi thoải mái"], ["sink into the chair", "ngồi lún vào ghế"], ["ease myself into", "từ từ ngồi xuống"],
    ["pull out the chair", "kéo ghế ra"], ["push the chair in", "đẩy ghế vào"], ["tuck the chair back under", "đẩy ghế vào gầm"],
    ["get up", "đứng dậy"], ["turn on the TV", "bật ti vi"], ["switch on the TV", "bật ti vi"], ["flick on the TV", "bật nhanh ti vi"],
    ["turn off the TV", "tắt ti vi"], ["switch off the TV", "tắt ti vi"], ["watch TV", "xem ti vi"],
    ["get caught up in", "bị cuốn vào"], ["without taking my eyes off the screen", "không rời mắt khỏi màn hình"],
    ["every now and then", "thỉnh thoảng"], ["every so often", "thỉnh thoảng"], ["occasionally", "đôi khi"],
    ["nurse my cup of milk", "nhâm nhi cốc sữa"], ["unwind in front of", "thư giãn trước"], ["sweep the floor", "quét nhà"],
    ["sweep under the table", "quét dưới gầm bàn"], ["wipe the table", "lau bàn"], ["wipe down the table", "lau sạch bàn"],
    ["give the table a good wipe", "lau bàn thật kỹ"], ["water the plant", "tưới cây"], ["give the plant", "cho cây"],
    ["open the window", "mở cửa sổ"], ["throw open the window", "mở toang cửa sổ"], ["let in some fresh air", "cho không khí trong lành vào"],
    ["close the window", "đóng cửa sổ"], ["shut the window", "đóng cửa sổ"], ["open the fridge", "mở tủ lạnh"],
    ["close the fridge", "đóng tủ lạnh"], ["shut the fridge", "đóng tủ lạnh"], ["pick up the book", "nhặt sách lên"],
    ["off the floor", "khỏi sàn nhà"], ["after that", "sau đó"], ["and then", "và sau đó"], ["with that done", "xong việc đó"],
    ["after which", "sau đó"]
  ];
  var WORDS = [
    ["fridge", "/frɪdʒ/", "tủ lạnh"], ["milk", "/mɪlk/", "sữa"], ["cup", "/kʌp/", "cái cốc"], ["table", "/ˈteɪ.bəl/", "cái bàn"],
    ["chair", "/tʃeər/", "cái ghế"], ["pour", "/pɔːr/", "rót"], ["sip", "/sɪp/", "ngụm, nhấp"], ["drink", "/drɪŋk/", "uống"],
    ["cold", "/kəʊld/", "lạnh"], ["window", "/ˈwɪn.dəʊ/", "cửa sổ"], ["plant", "/plɑːnt/", "cái cây"], ["floor", "/flɔːr/", "sàn nhà"],
    ["sweep", "/swiːp/", "quét"], ["wipe", "/waɪp/", "lau"], ["book", "/bʊk/", "quyển sách"], ["screen", "/skriːn/", "màn hình"],
    ["show", "/ʃəʊ/", "chương trình"], ["settle", "/ˈset.əl/", "ngồi yên vị"], ["comfortably", "/ˈkʌm.fə.tə.bli/", "thoải mái"],
    ["occasionally", "/əˈkeɪ.ʒən.əl.i/", "thỉnh thoảng"], ["switch", "/swɪtʃ/", "bật/tắt (công tắc)"], ["brim", "/brɪm/", "miệng (cốc)"],
    ["nurse", "/nɜːs/", "nhâm nhi"], ["unwind", "/ʌnˈwaɪnd/", "thư giãn"], ["carton", "/ˈkɑː.tən/", "hộp (giấy)"],
    ["retrieve", "/rɪˈtriːv/", "lấy lại"], ["tuck", "/tʌk/", "nhét, đẩy gọn"], ["first", "/fɜːst/", "đầu tiên"],
    ["finally", "/ˈfaɪ.nə.li/", "cuối cùng"], ["then", "/ðen/", "sau đó"], ["while", "/waɪl/", "trong khi"],
    ["before", "/bɪˈfɔːr/", "trước khi"], ["after", "/ˈɑːf.tər/", "sau khi"], ["water", "/ˈwɔː.tər/", "tưới; nước"]
  ];
  var GRAMMAR = {
    A1: [
      [/^(First, |Then |Finally, )?I \w+/, "Hiện tại đơn: I + động từ", "Dùng thì hiện tại đơn để kể các việc mình làm. Chủ ngữ I + động từ nguyên mẫu (I open, I drink)."],
      [/\b(First|Then|Finally)\b/, "Từ nối thứ tự: First / Then / Finally", "First = đầu tiên, Then = sau đó, Finally = cuối cùng (chỉ dùng cho câu cuối)."]
    ],
    A2: [
      [/ and /, "Nối hai hành động bằng “and”", "Dùng and để nối hai việc liên tiếp trong cùng một câu: I open the fridge and take the milk."],
      [/\b(After that|Next|Then)\b/, "Từ chỉ thời gian: Then / Next / After that", "Các từ này đứng đầu câu để nói việc tiếp theo, giúp đoạn văn liền mạch."],
      [/ again\b/, "again = lại, lần nữa", "Đặt again ở cuối câu khi làm lại một việc: I drink some milk again."]
    ],
    B1: [
      [/While watching/, "While + V-ing", "While + V-ing = trong lúc đang làm gì; hai việc xảy ra cùng lúc."],
      [/After \w+ing/, "After + V-ing", "After + V-ing = sau khi làm gì. Chủ ngữ của hai vế phải giống nhau (I)."],
      [/Before \w+ing/, "Before + V-ing", "Before + V-ing = trước khi làm gì."],
      [/and then/, "…, and then …", "Dùng and then để nối hai mệnh đề theo thứ tự thời gian."]
    ],
    B2: [
      [/After \w+ing/, "Mệnh đề phân từ: After + V-ing", "After pouring…, I… — rút gọn mệnh đề “After I pour…” khi hai vế cùng chủ ngữ."],
      [/Once I've/, "Once + hiện tại hoàn thành", "Once I've + V3 = ngay khi đã làm xong việc gì, tôi làm việc tiếp theo."],
      [/^As I|, as I|\bAs I/, "As + mệnh đề (đồng thời)", "As = trong khi/khi mà; diễn tả hai việc diễn ra song song."],
      [/switch on|switch off|settle|caught up|pick the cup up/, "Cụm động từ (phrasal verbs)", "switch on/off = bật/tắt, settle = ngồi yên vị, get caught up in = bị cuốn vào."]
    ],
    C1: [
      [/Having \w+/, "Having + V3 (phân từ hoàn thành)", "Having + V3 nhấn mạnh việc thứ nhất đã xong trước khi việc thứ hai bắt đầu."],
      [/Without taking/, "Without + V-ing", "Without + V-ing = mà không làm gì; mô tả cách thức hành động."],
      [/after which/, "Mệnh đề quan hệ “after which”", "…, after which I… = sau đó thì tôi…; which thay cho cả mệnh đề phía trước."],
      [/Once I have/, "Once + hiện tại hoàn thành", "Once I have + V3 = một khi đã làm xong…"]
    ],
    C2: [
      [/Having \w+/, "Having + V3", "Phân từ hoàn thành giúp câu văn cô đọng, trang trọng."],
      [/With that done/, "Cụm tuyệt đối “With that done”", "With + danh từ + V3 = khi việc đó đã xong; cách nối câu mang tính văn chương."],
      [/Eyes (still )?on the screen/, "Cụm tuyệt đối (absolute phrase)", "Eyes on the screen, I… = mắt dán vào màn hình, tôi… — mô tả trạng thái đi kèm."],
      [/nurse|unwind|to the brim|throw open|flick on/, "Thành ngữ / collocation giàu hình ảnh", "nurse a cup of milk = nhâm nhi; unwind = thư giãn; fill to the brim = rót đầy tới miệng."],
      [/ before \w+ing/, "before + V-ing", "I do A before doing B = làm A rồi mới làm B."]
    ]
  };

  function extras(items, level, opts) {
    var segs = build(items, level, opts);
    var para = segs.map(function (s) { return s.en; }).join(" ");
    var low = para.toLowerCase();
    var chunks = [], seen = {};
    CHUNKS.forEach(function (c) {
      if (chunks.length < 8 && low.indexOf(c[0].toLowerCase()) >= 0 && !seen[c[0]]) {
        // skip chunks fully contained in an already chosen chunk
        var dup = chunks.some(function (x) { return x.en.toLowerCase().indexOf(c[0].toLowerCase()) >= 0; });
        if (!dup) { seen[c[0]] = 1; chunks.push({ en: c[0], vi: c[1] }); }
      }
    });
    var words = WORDS.filter(function (w) { return new RegExp("\\b" + w[0] + "\\b", "i").test(para); })
      .slice(0, 10).map(function (w) { return { en: w[0], ipa: w[1], vi: w[2] }; });
    var grammar = [];
    (GRAMMAR[level] || GRAMMAR.A1).forEach(function (g) {
      if (grammar.length >= 3) return;
      var hit = null;
      for (var i = 0; i < segs.length; i++) if (g[0].test(segs[i].en)) { hit = segs[i].en; break; }
      if (hit) grammar.push({ title: g[1], vi_explain: g[2], example: hit });
    });
    if (!grammar.length && segs.length) {
      grammar.push({ title: "Hiện tại đơn: I + động từ", vi_explain: "Dùng thì hiện tại đơn để kể các việc mình làm.", example: segs[0].en });
    }
    return { chunks: chunks, words: words, grammar: grammar };
  }

  var api = { LEVELS: LEVELS, build: build, extras: extras };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ELW_LEVELS = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
