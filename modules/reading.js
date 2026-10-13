/* English Life World — level-aware read-aloud (CEFR): rate, chunking, connected speech (nối âm). */
(function (root) {
  "use strict";
  var LEVEL_CFG = {
    simple: { rate: 0.72, mode: "chunk", pauseMs: 900, linking: "none", weakForms: false },
    A1: { rate: 0.72, mode: "chunk", pauseMs: 900, linking: "none", weakForms: false },
    A2: { rate: 0.8, mode: "chunk", pauseMs: 650, linking: "none", weakForms: false },
    B1: { rate: 0.9, mode: "chunk", pauseMs: 350, linking: "basic", weakForms: false },
    B2: { rate: 1.0, mode: "flow", pauseMs: 250, linking: "basic", weakForms: true },
    C1: { rate: 1.08, mode: "flow", pauseMs: 180, linking: "full", weakForms: true },
    C2: { rate: 1.15, mode: "flow", pauseMs: 120, linking: "full", weakForms: true }
  };
  var SPEED = { slow: 0.75, medium: 0.9, natural: 1.05 };
  var LINK_VI = { none: "không nối âm", basic: "nối âm cơ bản", full: "nối âm đầy đủ" };

  function cfg(level, o) {
    o = o || {};
    var b = LEVEL_CFG[level] || LEVEL_CFG.A2, c = {};
    for (var k in b) c[k] = b[k];
    if (o.speed && SPEED[o.speed]) c.rate = SPEED[o.speed];
    if (o.mode === "chunk" || o.mode === "flow") {
      c.mode = o.mode;
      if (o.mode === "flow" && c.linking === "none") c.linking = "basic";
    }
    c.level = LEVEL_CFG[level] ? level : "A2";
    return c;
  }

  var CONNECT = ["and then", "and", "then", "while", "after", "before", "as", "once", "without", "which", "so", "because"];
  function words(s) { return s.trim().split(/\s+/).filter(Boolean); }
  function chunks(text) {
    var out = [];
    String(text || "").split(/(?<=[,.;:!?])\s+/).forEach(function (seg) {
      var w = words(seg), cur = [];
      for (var i = 0; i < w.length; i++) {
        var lw = w[i].toLowerCase().replace(/[^a-z']/g, "");
        var two = lw + " " + (w[i + 1] || "").toLowerCase().replace(/[^a-z']/g, "");
        var isConn = CONNECT.indexOf(two) >= 0 || CONNECT.indexOf(lw) >= 0;
        if (lw === "and" && two === "and then") isConn = true;
        if (isConn && cur.length >= 2 && (w.length - i) >= 2) { out.push(cur.join(" ")); cur = []; }
        cur.push(w[i]);
      }
      if (cur.length) {
        if (cur.length === 1 && out.length && !/[.!?]$/.test(out[out.length - 1])) out[out.length - 1] += " " + cur[0];
        else out.push(cur.join(" "));
      }
    });
    var res = [];
    out.forEach(function (ch) { splitLong(words(ch), res); });
    return res;
  }
  var PREP = /^(on|in|at|to|from|with|into|onto|for|of|by|under|over)$/i;
  function splitLong(w, res) {
    if (w.length <= 6) { res.push(w.join(" ")); return; }
    var mid = Math.round(w.length / 2), best = mid;
    for (var d = 0; d <= 2; d++) {
      if (mid + d < w.length - 1 && PREP.test(w[mid + d])) { best = mid + d; break; }
      if (mid - d > 1 && PREP.test(w[mid - d])) { best = mid - d; break; }
    }
    splitLong(w.slice(0, best), res); splitLong(w.slice(best), res);
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var WEAK = { to: "tə", and: "ən", a: "ə", of: "əv", for: "fə", the: "ðə", can: "kən", at: "ət", from: "frəm", some: "səm" };
  var VOW = /^[aeiou]/i, CONS_END = /([bcdfgjklmnpqstvxz]|[cst]h)$/i;
  var LEGEND = '<div class="rd-legend"><span><span class="rd-link">‿</span> nối âm</span><span><span class="rd-elide">t</span> âm bị nuốt</span><span><span class="rd-weak">ə</span> dạng yếu</span></div>';

  function linkify(text, level) {
    var c = cfg(level), lk = c.linking, toks = String(text || "").split(/(\s+)/), html = "";
    if (lk === "none") return esc(text);
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (/^\s+$/.test(t)) {
        var prev = toks[i - 1] || "", next = toks[i + 1] || "";
        var pw = prev.toLowerCase(), nw = next.toLowerCase();
        var link = false;
        if (/[a-z]$/i.test(prev) && /^[a-z]/i.test(next)) {
          if (VOW.test(nw) && !/^(u[ns]|one|eu|use)/.test(nw) && (CONS_END.test(pw) || /(r|re)$/.test(pw))) link = true;
          if (lk === "full" && VOW.test(nw) && /(e|y|o|w)$/.test(pw) && !/r$/.test(pw)) link = true;
          if (/^(the)$/.test(pw)) link = false;
        }
        html += link ? '<span class="rd-link">‿</span>' : t;
        continue;
      }
      var m = t.match(/^([^A-Za-z']*)([A-Za-z']+)([^A-Za-z']*)$/);
      if (!m) { html += esc(t); continue; }
      var w = m[2], lw = w.toLowerCase(), nx = (toks[i + 2] || "").toLowerCase(), body = esc(w);
      if (!m[3] && /[^aeiou][td]$/i.test(w) && w.length > 3 && /^[bcdfgjklmnpqrstvwz]/.test(nx) && !/^[hy]/.test(nx) && /[sn]t$|xt$|ct$|pt$/i.test(w))
        body = esc(w.slice(0, -1)) + '<span class="rd-elide">' + esc(w.slice(-1)) + "</span>";
      if (c.weakForms && WEAK[lw] && !m[3]) body += '<sup class="rd-weak">/' + WEAK[lw] + "/</sup>";
      html += esc(m[1]) + body + esc(m[3]);
    }
    return html;
  }

  var CONTR = [[/\bI am\b/g, "I'm"], [/\b(I|you|we|they) have (been|got|just|already)\b/g, "$1've $2"], [/\b(it|that|there) is\b/gi, "$1's"],
    [/\b(I|you|we|they) will\b/g, "$1'll"], [/\bdo not\b/g, "don't"], [/\bdoes not\b/g, "doesn't"], [/\bis not\b/g, "isn't"], [/\bcannot\b/g, "can't"]];
  function contract(s) { CONTR.forEach(function (r) { s = s.replace(r[0], r[1]); }); return s; }

  function speakPlan(text, level, o) {
    var c = cfg(level, o), plan = [];
    if (c.mode === "chunk") {
      chunks(text).forEach(function (ch) {
        plan.push({ text: ch, rate: c.rate, pauseAfterMs: /[.!?]$/.test(ch) ? c.pauseMs * 1.6 | 0 : c.pauseMs });
      });
    } else {
      (String(text || "").match(/[^.!?]+[.!?]*/g) || []).forEach(function (s) {
        s = s.trim(); if (!s) return;
        if (c.level === "C1" || c.level === "C2") s = contract(s);
        plan.push({ text: s, rate: c.rate, pauseAfterMs: c.pauseMs });
      });
    }
    return plan;
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function play(text, level, o, speakFn, isCancelled, onChunk) {
    var p = speakPlan(text, level, o); isCancelled = isCancelled || function () { return false; };
    for (var i = 0; i < p.length; i++) {
      if (isCancelled()) return false;
      if (onChunk) onChunk(i, p[i].text);
      await speakFn(p[i].text, p[i].rate);
      if (isCancelled()) return false;
      if (i < p.length - 1) await sleep(p[i].pauseAfterMs);
    }
    return true;
  }

  function describe(level, st) {
    var c = cfg(level, st), lv = level === "simple" ? "Từng câu" : c.level;
    var m = c.mode === "flow" ? "liền mạch" : (c.pauseMs >= 600 ? "ngắt cụm dài" : "ngắt cụm ngắn");
    return lv + ": ×" + c.rate + " · " + m + " · " + LINK_VI[c.linking] + (c.weakForms ? " · dạng yếu" : "");
  }

  function renderSettings(container, state, onChange, level) {
    state = state || {}; var s = { speed: state.speed || "auto", mode: state.mode || "auto", showLinking: !!state.showLinking };
    var lv = level || state.level || "A2";
    function opt(v, l, cur) { return '<option value="' + v + '"' + (v === cur ? " selected" : "") + ">" + l + "</option>"; }
    container.innerHTML = '<div class="rd-set"><label class="rd-f">Tốc độ <select data-k="speed">' +
      opt("auto", "theo cấp độ", s.speed) + opt("slow", "chậm", s.speed) + opt("medium", "vừa", s.speed) + opt("natural", "tự nhiên", s.speed) +
      '</select></label><label class="rd-f">Cách đọc <select data-k="mode">' +
      opt("auto", "theo cấp độ", s.mode) + opt("chunk", "ngắt từng cụm", s.mode) + opt("flow", "liền mạch nối âm", s.mode) +
      '</select></label><button type="button" class="rd-tg' + (s.showLinking ? " on" : "") + '" aria-pressed="' + s.showLinking + '">‿ Hiện nối âm</button>' +
      '<div class="rd-eff">' + esc(describe(lv, s)) + "</div></div>";
    container.querySelectorAll("select").forEach(function (el) {
      el.onchange = function () { s[el.dataset.k] = el.value; renderSettings(container, Object.assign({}, s, { level: lv }), onChange, lv); onChange && onChange(Object.assign({}, s)); };
    });
    container.querySelector(".rd-tg").onclick = function () { s.showLinking = !s.showLinking; renderSettings(container, Object.assign({}, s, { level: lv }), onChange, lv); onChange && onChange(Object.assign({}, s)); };
  }

  var css = [
    ".rd-link{color:#e8743b;font-weight:700;margin:0 -1px;}",
    ".rd-elide{opacity:.35;}",
    ".rd-weak{font-size:.6em;color:#a0876b;margin-left:1px;}",
    ".rd-legend{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:#7a6650;margin-top:6px;}",
    ".rd-set{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fffaf2;border:1px solid #e3d6c3;border-radius:12px;padding:8px 10px;font-size:13px;max-width:100%;box-sizing:border-box;}",
    ".rd-f{display:flex;align-items:center;gap:4px;min-width:0;}",
    ".rd-f select{font:inherit;border:1px solid #e3d6c3;border-radius:8px;background:#fff;padding:3px 4px;max-width:140px;}",
    ".rd-tg{font:inherit;border:1px solid #e3d6c3;border-radius:999px;background:#fff;padding:3px 10px;cursor:pointer;}",
    ".rd-tg.on{background:#e8743b;border-color:#e8743b;color:#fff;}",
    ".rd-eff{flex-basis:100%;font-size:12px;color:#7a6650;}"
  ].join("\n");

  var api = { LEVEL_CFG: LEVEL_CFG, cfg: cfg, chunks: chunks, linkify: linkify, legend: LEGEND, speakPlan: speakPlan, play: play, describe: describe, renderSettings: renderSettings, css: css };
  root.ELW_READING = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
