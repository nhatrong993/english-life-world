/* English Life World — voices + family dialogues module.
 * Exposes window.ELW_VOICES and window.ELW_DIALOGUE. No dependencies.
 * Note: browser voices vary a lot by OS/browser. Gender is guessed from voice names;
 * child and elderly voices are approximated with pitch/rate shaping on an adult voice. */
(function () {
  "use strict";
  var MALE = /David|Guy|Daniel|Alex|Fred|Tom|Mark|George|Ryan|Aaron|Arthur|Oliver|Eric|Christopher|Roger|Brian|James|Male|\bman\b/i;
  var FEMALE = /Zira|Samantha|Aria|Jenny|Karen|Moira|Tessa|Victoria|Susan|Hazel|Libby|Sonia|Emma|Ava|Allison|Fiona|Kate|Serena|Michelle|Female|woman/i;

  var PROFILES = [
    { id: "adult_male", label: "Adult male", vi: "Nam trưởng thành", pitch: 0.95, rate: 0.95, gender: "m", prefer: [/Guy|Christopher|Eric/i, /David|Daniel|Alex|Mark|George|Ryan/i, MALE], lang: "en-US" },
    { id: "adult_female", label: "Adult female", vi: "Nữ trưởng thành", pitch: 1.05, rate: 0.95, gender: "f", prefer: [/Aria|Jenny|Michelle/i, /Samantha|Zira|Karen|Susan|Emma|Ava/i, FEMALE], lang: "en-US" },
    { id: "young_male", label: "Young man", vi: "Nam thanh niên", pitch: 1.15, rate: 1.0, gender: "m", prefer: [/Ryan|Guy|Eric|Aaron/i, MALE], lang: "en-US" },
    { id: "young_female", label: "Young woman", vi: "Nữ thanh niên", pitch: 1.25, rate: 1.0, gender: "f", prefer: [/Ava|Jenny|Emma|Allison/i, FEMALE], lang: "en-US" },
    { id: "child", label: "Child", vi: "Trẻ em", pitch: 1.6, rate: 0.85, gender: "f", prefer: [/Ana|Child|Kid/i, /Jenny|Aria|Samantha|Zira/i, FEMALE], lang: "en-US" },
    { id: "elderly", label: "Elderly", vi: "Người lớn tuổi", pitch: 0.8, rate: 0.78, gender: "m", prefer: [/George|Arthur|Fred|Roger|David/i, MALE], lang: "en-GB" }
  ];
  function prof(id) { for (var i = 0; i < PROFILES.length; i++) if (PROFILES[i].id === id) return PROFILES[i]; return PROFILES[1]; }
  function synth() { try { return window.speechSynthesis || null; } catch (e) { return null; } }
  function available() {
    var s = synth(); if (!s || !s.getVoices) return [];
    var v = []; try { v = s.getVoices() || []; } catch (e) { return []; }
    return v.filter(function (x) { return /^en([-_]|$)/i.test(x.lang || ""); });
  }
  function pick(profileId) {
    try {
      var p = prof(profileId), list = available();
      if (!list.length) return null;
      var best = null, bestScore = -1e9;
      list.forEach(function (v, idx) {
        var n = v.name || "", sc = 0;
        p.prefer.forEach(function (re, k) { if (re.test(n)) sc += 30 - k * 8; });
        var isM = MALE.test(n), isF = FEMALE.test(n);
        if (p.gender === "m") sc += isM ? 15 : isF ? -40 : 0;
        if (p.gender === "f") sc += isF ? 15 : isM ? -40 : 0;
        if ((v.lang || "").replace("_", "-").toLowerCase() === p.lang.toLowerCase()) sc += 6;
        if (/Natural|Online|Neural/i.test(n)) sc += 4;
        if (v.localService) sc += 1;
        sc -= idx * 0.01;
        if (sc > bestScore) { bestScore = sc; best = v; }
      });
      return best;
    } catch (e) { return null; }
  }
  function speak(text, profileId, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var done = false, t;
      function fin() { if (!done) { done = true; clearTimeout(t); resolve(); } }
      var s = synth();
      if (!s || typeof window.SpeechSynthesisUtterance !== "function" || !text) { setTimeout(fin, 0); return; }
      try {
        var p = prof(profileId);
        s.cancel();
        var u = new window.SpeechSynthesisUtterance(text);
        var v = pick(p.id); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = p.lang;
        u.pitch = p.pitch; u.rate = (opts.rate || 1) * p.rate;
        u.onend = fin; u.onerror = fin;
        t = setTimeout(fin, 1500 + String(text).length * 110 / (u.rate || 1));
        s.speak(u);
      } catch (e) { fin(); }
    });
  }
  window.ELW_VOICES = { PROFILES: PROFILES, pick: pick, speak: speak, available: available };

  /* ---------------- Dialogue ---------------- */
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
    ".dlg-done{margin-top:10px;font-weight:700;color:#3a9d5d}"
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
  function injectCss() { if (cssDone) return; cssDone = true; var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); }

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
      try { var s = synth(); if (s) s.cancel(); } catch (e) {}
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

  window.ELW_DIALOGUE = { makeMom: makeMom, css: css, SCRIPTS: SCRIPTS, createPlayer: createPlayer,
    ALLOWED_ACTIONS: ["open_fridge","take_milk","put_milk_back","close_fridge","pick_up_cup","put_cup_on_table","pour_milk","drink_from_cup","wipe_table","put_book_on_table","sweep_under_table","pull_out_chair","sit_on_chair","get_up","push_chair_in","sweep_floor","open_window","close_window","water_plant","pick_up_book","turn_on_tv","watch_tv","turn_off_tv"] };
})();
