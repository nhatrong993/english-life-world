/* English Life World — Mission system (owner: Claude)
 * One mission system shared by manual play, hints and "Làm ngay" (auto).
 * - Mission:  steps with done(W) checks, the actions that belong to each step, and the auto plan.
 * - Validator: a step is done only when its check passes on the real WorldState.
 * - Guard:    actions of a locked step are refused (reason in Vietnamese) — same path for manual & auto.
 * - Auto:     enqueues the next valid action of the current step through the app's normal queue.
 * - Hints:    toggling hints only changes what is shown, never mission state.
 * View contract (MissionView) — see docs/COLLAB-PLAN.md (B). Rendered by ELW_UI_MISSION if present,
 * otherwise by the small fallback renderer below.
 */
(function (root) {
  "use strict";
  var KEY = "elw_mission_v1";
  var has = function (arr, x) { return Array.isArray(arr) && arr.indexOf(x) >= 0; };

  var MISSIONS = [
    {
      id: "breakfast", title_en: "Prepare breakfast", title_vi: "Chuẩn bị bữa sáng",
      desc_vi: "Mẹ nhờ bạn làm trứng chiên cho bữa sáng.",
      giver: { id: "mom", name: "Mom", avatar: "👩", voice: "adult_female" }, room: "kitchen", urgency: "medium",
      request: { en: "Could you make breakfast, please? Some fried eggs would be lovely.", vi: "Con làm bữa sáng giúp mẹ nhé? Trứng chiên là được rồi." },
      steps: [
        { n: 1, icon: "🧊", title_en: "Get the ingredients", title_vi: "Lấy trứng trong tủ lạnh",
          say_en: "Get the eggs from the fridge.", say_vi: "Lấy trứng trong tủ lạnh.",
          actions: ["open_fridge", "take_out_eggs"],
          done: function (W) { return has(W.counter, "eggs"); },
          next: function (W) { return W.fridge !== "open" ? "open_fridge" : "take_out_eggs"; },
          hint: { en: "First open the fridge, then take out the eggs.", vi: "Mở tủ lạnh trước, rồi lấy trứng ra." } },
        { n: 2, icon: "🔥", title_en: "Prepare the pan", title_vi: "Bật bếp, làm nóng chảo",
          say_en: "Turn on the stove.", say_vi: "Bật bếp lên.",
          actions: ["turn_on_stove"],
          done: function (W) { return W.k_stove === "on" || W.k_pan === "egg" || W.k_pan === "fried"; },
          next: function () { return "turn_on_stove"; },
          hint: { en: "Go to the kitchen and turn on the stove.", vi: "Vào bếp và bật bếp." } },
        { n: 3, icon: "🍳", title_en: "Cook breakfast", title_vi: "Chiên trứng",
          say_en: "Fry the eggs in the pan.", say_vi: "Chiên trứng trong chảo.",
          actions: ["fry_egg"],
          done: function (W) { return W.k_pan === "egg" || W.k_pan === "fried"; },
          next: function () { return "fry_egg"; },
          hint: { en: "The pan is hot. Fry the egg now.", vi: "Chảo đã nóng. Chiên trứng thôi." } },
        { n: 4, icon: "🍽️", title_en: "Serve breakfast", title_vi: "Tắt bếp và dọn bàn",
          say_en: "Breakfast is ready!", say_vi: "Bữa sáng xong rồi!",
          actions: ["turn_off_stove", "set_the_table"],
          done: function (W) { return W.k_stove !== "on" && W.k_table && W.k_table !== "bare"; },
          next: function (W) { return W.k_stove === "on" ? "turn_off_stove" : "set_the_table"; },
          hint: { en: "Turn off the stove, then set the table.", vi: "Tắt bếp, rồi dọn bàn ăn." } }
      ],
      result: function (log) {
        var did = log.map(function (x) { return x.id; });
        var en = "Breakfast is ready!", vi = "Bữa sáng xong rồi!";
        if (did.indexOf("fry_egg") >= 0) { en += " I fried the eggs"; vi += " Con đã chiên trứng"; }
        if (did.indexOf("set_the_table") >= 0) { en += " and set the table"; vi += " và dọn bàn"; }
        return { en: en + ".", vi: vi + "." , mom_en: "Thank you, sweetie! It smells wonderful.", mom_vi: "Cảm ơn con! Thơm quá." };
      }
    }
  ];

  var st = { id: null, hintsOn: false, auto: false, log: [], started: 0, complete: false, rejected: null };
  function load() { try { var d = JSON.parse(localStorage.getItem(KEY) || "null"); if (d && d.v === 1) Object.assign(st, d.st); } catch (e) {} }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, st: st })); } catch (e) {} }
  var host = null; // {getW, enqueue, isIdle, speak, bubble, onChange, actionExists}

  function mission() { for (var i = 0; i < MISSIONS.length; i++) if (MISSIONS[i].id === st.id) return MISSIONS[i]; return null; }
  function stepStates(W) {
    var m = mission(); if (!m) return [];
    var out = [], prevDone = true;
    st.doneSteps = st.doneSteps || [];
    m.steps.forEach(function (s) {
      // một bước đã xác nhận xong thì giữ nguyên (nguyên liệu có thể đã được dùng ở bước sau)
      var d = has(st.doneSteps, s.n) || (prevDone && !!s.done(W));
      if (d && !has(st.doneSteps, s.n)) st.doneSteps.push(s.n);
      out.push({ step: s, status: d ? "done" : (prevDone ? "active" : "locked") });
      prevDone = prevDone && d;
    });
    return out;
  }
  function current(W) { var ss = stepStates(W); for (var i = 0; i < ss.length; i++) if (ss[i].status === "active") return ss[i].step; return null; }

  // Guard: called by the app before ANY action runs (manual or auto). Returns Vietnamese reason or null.
  function guard(actionId, W) {
    var m = mission(); if (!m || st.complete) return null;
    var ss = stepStates(W);
    for (var i = 0; i < ss.length; i++) {
      var s = ss[i];
      if (s.status === "locked" && has(s.step.actions, actionId)) {
        var cur = current(W);
        return "Bước " + s.step.n + " đang khóa. Hãy hoàn thành bước " + (cur ? cur.n + " (" + cur.title_vi + ")" : "trước") + " trước.";
      }
    }
    return null;
  }

  var HOME_W0 = {
    fridge: "closed", window: "closed", chair: "in", milk: "fridge", cup: "counter",
    book: "floor", broom: "wall", hand: null, sitting: false, cupLevel: 0, tv: "off",
    activity: null, sofa: null, cat: "sleeping", catAt: "bed", catNear: null, catPet: false,
    catBowl: "empty", catWater: "empty", floorLamp: "off", livCurtains: "open", fan: "off",
    music: "off", remote: "table", "throw": "messy", cushion: "fluffy", counter: []
  };
  var autoTimer = 0;
  var runSeqId = 0;

  function getTopic(roomId) {
    if (!roomId || roomId === "living" || roomId === "kitchen" || roomId === "bedroom" || roomId === "bathroom" || roomId === "garage" || roomId === "garden") return "home";
    var R = root.ELW_ROOMS && root.ELW_ROOMS[roomId];
    if (R && R.topic) return R.topic;
    if (/^cafe/.test(roomId)) return "cafe";
    if (/^market/.test(roomId)) return "market";
    return roomId;
  }

  function resetWorldForMission(m) {
    if (!host || typeof host.getW !== "function") return;
    var W = host.getW();
    if (!W) return;
    var targetRoom = (m && m.room) ? m.room : (W.room || "living");
    if (getTopic(targetRoom) === "home" && getTopic(W.room) === "home") {
      targetRoom = W.room || "living";
    }
    W.room = targetRoom;
    W.sitting = true;
    var elw = root.ELW;
    if (elw && typeof elw.resetScene === "function") {
      try { elw.resetScene(true); } catch (e) {}
    }
    var newW = host.getW();
    if (newW) {
      Object.keys(HOME_W0).forEach(function (k) {
        newW[k] = Array.isArray(HOME_W0[k]) ? HOME_W0[k].slice() : HOME_W0[k];
      });
      if (root.ELW_ROOMS) {
        Object.keys(root.ELW_ROOMS).forEach(function (rKey) {
          var r = root.ELW_ROOMS[rKey];
          if (r && r.W0) {
            Object.keys(r.W0).forEach(function (k) {
              var v = r.W0[k];
              newW[k] = Array.isArray(v) ? v.slice() : (v && typeof v === "object" ? JSON.parse(JSON.stringify(v)) : v);
            });
          }
        });
      }
      if (root.ELW_FOOD && root.ELW_FOOD.W0) {
        try { Object.assign(newW, JSON.parse(JSON.stringify(root.ELW_FOOD.W0))); } catch (e) {}
      }
      Object.keys(newW).forEach(function (k) { if (/^lt_chat_/.test(k)) delete newW[k]; });
      newW.room = targetRoom;
      newW.sitting = false;
      newW.sofa = null;
      newW.hand = null;
      newW.activity = null;
      newW.b_lying = false;
      var rObj = root.ELW_ROOMS && root.ELW_ROOMS[targetRoom];
      var ent = targetRoom === "living" ? { x: 770, y: 440, d: -1 } : (rObj && rObj.entry ? rObj.entry : null);
      if (ent) { newW.x = ent.x; newW.y = ent.y; newW.dir = ent.d || 1; }
      if (W !== newW) {
        Object.keys(W).forEach(function (k) { delete W[k]; });
        Object.assign(W, newW);
      }
    }
    if (elw && typeof elw.queue === "function") {
      try { var q = elw.queue(); if (Array.isArray(q)) q.length = 0; } catch (e) {}
    }
    if (typeof root.renderRoom === "function") { try { root.renderRoom(); } catch (e) {} }
    if (typeof root.renderTabs === "function") { try { root.renderTabs(); } catch (e) {} }
    if (typeof root.applyState === "function") { try { root.applyState(); } catch (e) {} }
  }

  function start(id, h) {
    if (h) host = h;
    runSeqId++;
    clearTimeout(autoTimer); autoTimer = 0;
    var targetM = null;
    for (var i = 0; i < MISSIONS.length; i++) if (MISSIONS[i].id === id) { targetM = MISSIONS[i]; break; }
    resetWorldForMission(targetM);
    st = { id: id, hintsOn: false, auto: false, log: [], started: Date.now(), complete: false, rejected: null, doneSteps: [], acted: [], spoken: [] };
    save();
    var m = mission();
    if (m && host) {
      try { host.bubble && host.bubble("npc:" + m.giver.id, { who: m.giver.name, avatar: m.giver.avatar, en: m.request.en, vi: m.request.vi, kind: "request", ttlMs: 6000 }); } catch (e) {}
      try { host.speak && host.speak(m.request.en, m.giver.voice); } catch (e) {}
    }
    changed();
  }
  function stop() { runSeqId++; clearTimeout(autoTimer); autoTimer = 0; st.id = null; st.auto = false; save(); changed(); }
  function setHints(on) { st.hintsOn = !!on; save(); changed(); } // view-only (QA A4)

  // Called by the app after every completed / blocked action (manual and auto alike).
  function onAction(actionId, status, W, reason) {
    var m = mission(); if (!m || st.complete) return;
    var before = st.log.length;
    if (status === "done") st.log.push({ id: actionId, t: Date.now() });
    if (status === "blocked") st.rejected = { id: actionId, reason: reason || "" };
    var ss = stepStates(W);
    if (status === "done") { st.acted = st.acted || []; ss.forEach(function (x) { if (x.status === "done" && has(x.step.actions || [], actionId) && !has(st.acted, x.step.n)) st.acted.push(x.step.n); }); }
    // per-step feedback from what REALLY happened (QA C5)
    if (status === "done" && host && host.bubble) {
      var s = ss.find(function (x) { return has(x.step.actions, actionId); });
      if (s && s.status === "done") try { host.bubble("char", { en: "✓ " + s.step.say_en, vi: s.step.say_vi, kind: "result", ttlMs: 2500 }); } catch (e) {}
    }
    if (status === "blocked" && host && host.bubble) {
      try { host.bubble("char", { en: "I can't do that yet.", vi: reason || "Chưa làm được bước này.", kind: "error", ttlMs: 3500 }); } catch (e) {}
    }
    if (ss.length && ss.every(function (x) { return x.status === "done"; })) {
      st.complete = true; st.auto = false;
      clearTimeout(autoTimer); autoTimer = 0;
      var r = m.result(st.log);
      st.resultText = r;
      if (host) {
        try { host.bubble && host.bubble("npc:" + m.giver.id, { who: m.giver.name, avatar: m.giver.avatar, en: r.mom_en, vi: r.mom_vi, kind: "say", ttlMs: 5000 }); } catch (e) {}
        try { host.speak && host.speak(r.en, null); } catch (e) {}
        try { host.onComplete && host.onComplete(m, st.log); } catch (e) {}
      }
    }
    save(); changed();
    if (before !== st.log.length || status === "blocked") autoStep();
  }

  // "Làm ngay": enqueue ONLY the next valid action of the current step; continue after each completion.
  function auto() { if (!mission() || st.complete) return; st.auto = true; st.rejected = null; st.spoken = []; save(); changed(); autoStep(); }
  function autoStep() {
    clearTimeout(autoTimer); autoTimer = 0;
    if (!st.auto || !host || st.complete) return;
    if (host.isIdle && !host.isIdle()) {
      autoTimer = setTimeout(autoStep, 60);
      return;
    }
    var W = host.getW(), m = mission();
    if (!W || !m) return;
    if (m.room && getTopic(W.room) !== getTopic(m.room)) {
      var goAct = "go_" + m.room;
      if (!host.actionExists || host.actionExists(goAct)) {
        host.enqueue(goAct);
        return;
      }
    }
    var ss = stepStates(W);
    st.spoken = st.spoken || [];
    var myRun = runSeqId;
    // Bước đã xong sẵn: vẫn đọc lại câu (không di chuyển) để chuỗi không bị ngắt quãng
    for (var i = 0; i < ss.length; i++) {
      if (ss[i].status !== "done") break;
      if (!has(st.spoken, ss[i].step.n) && !has(st.acted || [], ss[i].step.n)) {
        st.spoken.push(ss[i].step.n); save(); changed();
        var go = function () { if (myRun === runSeqId) autoTimer = setTimeout(autoStep, 250); };
        if (host.recap) { try { host.recap(ss[i].step, W, go); return; } catch (e) {} }
        go(); return;
      }
    }
    var s = current(W); if (!s) return;
    st.activeN = s.n;
    var id = s.next(W);
    if (host.actionExists && !host.actionExists(id)) { st.auto = false; st.rejected = { id: id, reason: "Thiếu hành động " + id }; changed(); return; }
    if (st.rejected && st.rejected.id === id) { st.auto = false; changed(); return; } // don't loop on a blocked action
    host.enqueue(id);
  }
  function onIdle() { if (st.auto) { st.rejected = null; autoStep(); } }

  function view(W) {
    var m = mission(); if (!m) return null;
    var ss = stepStates(W), cur = current(W);
    return {
      id: m.id, title_en: m.title_en, title_vi: m.title_vi, desc_vi: m.desc_vi, giver: m.giver, room: m.room,
      urgency: m.urgency, remainingSec: null, totalSec: null,
      steps: ss.map(function (x) {
        var reason = null;
        if (x.status === "locked") reason = "Đang chờ bước " + (x.step.n - 1);
        if (st.rejected && has(x.step.actions, st.rejected.id) && x.status !== "done") reason = st.rejected.reason;
        return { n: x.step.n, icon: x.step.icon, title_en: x.step.title_en, title_vi: x.step.title_vi, say_en: x.step.say_en, say_vi: x.step.say_vi,
          status: reason && x.status === "active" ? "blocked" : x.status, reason_vi: reason };
      }),
      hintsOn: st.hintsOn, hint: st.hintsOn && cur ? cur.hint : null,
      canAuto: !st.complete, running: !!st.auto, complete: !!st.complete, result: st.complete ? st.resultText : null
    };
  }

  var listeners = [];
  function changed() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
  function subscribe(f) { listeners.push(f); }

  // Fallback renderer (used only if ELW_UI_MISSION from Antigravity is missing)
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var CHIP = { done: "✅ xong", active: "▶ đang làm", locked: "🔒 bị khóa", blocked: "⛔ chưa làm được" };
  function renderFallback(c, v, cb) {
    if (!v) { c.innerHTML = ""; return; }
    c.innerHTML = '<div class="msn"><div class="msn-h"><b>' + esc(v.giver.avatar) + " " + esc(v.title_en) + '</b> <span class="meta">' + esc(v.title_vi) + " · " + esc(v.giver.name) + " · " + esc(v.room) + "</span></div>" +
      '<ol class="msn-steps">' + v.steps.map(function (s) {
        return '<li class="msn-' + s.status + '"><span>' + esc(s.icon) + "</span><div><b>" + esc(s.title_en) + "</b> <small>" + esc(s.title_vi) + "</small><br><i>“" + esc(s.say_en) +
          '”</i> <button class="iconbtn" data-say="' + esc(s.say_en) + '">🔊</button><br><small>' + CHIP[s.status] + (s.reason_vi ? " — " + esc(s.reason_vi) : "") + "</small></div></li>";
      }).join("") + "</ol>" +
      (v.hint ? '<div class="note">💡 ' + esc(v.hint.en) + "<br><small>" + esc(v.hint.vi) + "</small></div>" : "") +
      (v.complete ? '<div class="note">🎉 ' + esc(v.result.en) + "<br><small>" + esc(v.result.vi) + "</small></div>" : "") +
      '<div class="ctrls"><button class="iconbtn ' + (v.hintsOn ? "on" : "") + '" data-hint>💡 Gợi ý</button>' +
      '<button class="btn" data-auto ' + (v.running || !v.canAuto ? "disabled" : "") + ">⚡ Làm ngay</button><button class=\"iconbtn\" data-close>✕</button></div></div>";
    c.querySelectorAll("[data-say]").forEach(function (b) { b.onclick = function () { cb.onSpeak(b.dataset.say); }; });
    c.querySelector("[data-hint]").onclick = function () { cb.onHintToggle(!v.hintsOn); };
    c.querySelector("[data-auto]").onclick = function () { cb.onAuto(); };
    c.querySelector("[data-close]").onclick = function () { cb.onClose(); };
  }
  var fallbackCss = ".msn-steps{list-style:none;padding:0;margin:8px 0;display:flex;flex-direction:column;gap:6px}.msn-steps li{display:flex;gap:8px;border:1px solid var(--line,#e3d6c3);border-radius:10px;padding:8px;background:#fff}.msn-steps li.msn-done{opacity:.75}.msn-steps li.msn-active{border-color:var(--accent,#e8743b)}.msn-steps li.msn-locked{background:#f6f2ec}.msn-steps li.msn-blocked{border-color:#c0392b}";

  load();
  function register(list) { (list || []).forEach(function (m) { if (m && m.id && !MISSIONS.some(function (x) { return x.id === m.id; })) MISSIONS.push(m); }); changed(); }
  function active() { return !!(mission() && !st.complete); }
  var api = { register: register, active: active, MISSIONS: MISSIONS, start: start, stop: stop, setHints: setHints, auto: auto, onAction: onAction, onIdle: onIdle, guard: guard,
    view: view, current: current, stepStates: stepStates, subscribe: subscribe, state: function () { return st; },
    setHost: function (h) { host = h; }, renderFallback: renderFallback, fallbackCss: fallbackCss };
  root.ELW_MISSION = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
