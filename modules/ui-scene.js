/* English Life World — ui-scene.js
   Visual/UI in-scene overlays: speech bubbles, object labels, highlights, alert banners.
   Contract A: window.ELW_UI_SCENE
*/
(function (root) {
  "use strict";

  const CSS_TEXT = `
.uis-layer{pointer-events:none}
.uis-interactive{pointer-events:auto}
.uis-bubble-fo{overflow:visible;pointer-events:none}
.uis-bubble{box-sizing:border-box;background:#fff;border-radius:14px;padding:8px 12px 9px;box-shadow:0 6px 20px rgba(45,42,38,.18),0 2px 6px rgba(45,42,38,.1);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#2d2a26;position:relative;border-width:2px;border-style:solid;pointer-events:none;transition:opacity .2s ease,transform .2s ease}
.uis-bubble-header{display:flex;align-items:center;gap:6px;font-size:11px;margin-bottom:4px}
.uis-avatar{font-size:15px;line-height:1}
.uis-who{font-weight:700;color:#2d2a26}
.uis-kind-tag{font-size:10px;font-weight:700;padding:1px 6px;border-radius:999px;letter-spacing:.3px;display:inline-flex;align-items:center;gap:3px}
.uis-bubble-close{margin-left:auto;background:none;border:none;font-size:16px;line-height:1;color:#7a7166;cursor:pointer;padding:0 4px;pointer-events:auto;border-radius:4px}
.uis-bubble-close:hover{color:#2d2a26;background:rgba(0,0,0,.06)}
.uis-bubble-close:focus{outline:2px solid #e8743b}
.uis-text-en{font-size:13.5px;font-weight:700;color:#1e1c1a;line-height:1.35;margin-bottom:2px}
.uis-text-vi{font-size:11.5px;color:#7a7166;line-height:1.3}
.uis-kind-say{border-color:#5a3d1f;background:#fff}
.uis-kind-say .uis-kind-tag{background:#f3ebe0;color:#5a3d1f}
.uis-kind-request{border-color:#e8743b;border-style:dashed;background:#fffdf9}
.uis-kind-request .uis-kind-tag{background:#ffe6d6;color:#b84c17}
.uis-kind-result{border-color:#3a9d5d;border-style:solid;border-bottom:4px double #3a9d5d;background:#f8fdf9}
.uis-kind-result .uis-kind-tag{background:#def4e5;color:#246d3e}
.uis-kind-error{border-color:#c0392b;border-style:solid;border-top-width:4px;background:#fff7f6}
.uis-kind-error .uis-kind-tag{background:#fcdcd9;color:#96261a}
.uis-kind-hint{border-color:#e0a03a;border-style:dotted;border-width:2.5px;background:#fffdf2}
.uis-kind-hint .uis-kind-tag{background:#fff0d1;color:#8c5d12}
.uis-tail{position:absolute;width:10px;height:10px;background:#fff;transform:rotate(45deg);pointer-events:none}
.uis-tail-down{bottom:-6px;left:28px;border-right:2px solid;border-bottom:2px solid;border-color:inherit}
.uis-tail-up{top:-6px;left:28px;border-left:2px solid;border-top:2px solid;border-color:inherit}
.uis-label-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(255,253,249,.94);border:1.5px solid #e3d6c3;border-radius:999px;padding:3px 9px;box-shadow:0 3px 8px rgba(45,42,38,.12);font-family:system-ui,-apple-system,sans-serif;font-size:11px;color:#2d2a26;white-space:nowrap;pointer-events:none}
.uis-label-en{font-weight:700;color:#5a3d1f}
.uis-label-sep{color:#b7a998}
.uis-label-vi{color:#7a7166}
.uis-label-state{background:#e8743b;color:#fff;font-weight:700;font-size:9.5px;padding:1px 6px;border-radius:999px;margin-left:2px}
.uis-hl-box{pointer-events:none;fill-opacity:.15;transition:opacity .2s ease}
.uis-hl-target .uis-hl-box{stroke:#e8743b;stroke-width:3.5;fill:#e8743b;animation:uisPulseTarget 1.4s ease-in-out infinite alternate}
.uis-hl-done .uis-hl-box{stroke:#3a9d5d;stroke-width:3.5;fill:#3a9d5d;animation:uisGlowDone 1.8s ease-in-out infinite alternate}
.uis-hl-blocked .uis-hl-box{stroke:#c0392b;stroke-width:3.5;stroke-dasharray:8 5;fill:#c0392b;animation:uisAlertBlocked 1.1s ease-in-out infinite alternate}
.uis-hl-badge-bg{rx:9px;stroke-width:1.5}
.uis-hl-target .uis-hl-badge-bg{fill:#fff2e9;stroke:#e8743b}
.uis-hl-done .uis-hl-badge-bg{fill:#eef8f1;stroke:#3a9d5d}
.uis-hl-blocked .uis-hl-badge-bg{fill:#fdf0ee;stroke:#c0392b}
.uis-hl-badge-text{font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:700;text-anchor:middle;dominant-baseline:central}
.uis-hl-target .uis-hl-badge-text{fill:#b84c17}
.uis-hl-done .uis-hl-badge-text{fill:#246d3e}
.uis-hl-blocked .uis-hl-badge-text{fill:#96261a}
@keyframes uisPulseTarget{0%{stroke-width:3;filter:drop-shadow(0 0 3px rgba(232,116,59,.4))}100%{stroke-width:5;filter:drop-shadow(0 0 10px rgba(232,116,59,.8))}}
@keyframes uisGlowDone{0%{stroke-width:3;filter:drop-shadow(0 0 2px rgba(58,157,93,.3))}100%{stroke-width:4.5;filter:drop-shadow(0 0 8px rgba(58,157,93,.7))}}
@keyframes uisAlertBlocked{0%{stroke-width:3;opacity:.85}100%{stroke-width:4.5;opacity:1;filter:drop-shadow(0 0 6px rgba(192,57,43,.6))}}
.uis-alert-fo{overflow:visible;pointer-events:none}
.uis-alert{box-sizing:border-box;border-radius:12px;padding:6px 14px;box-shadow:0 4px 16px rgba(45,42,38,.16);font-family:system-ui,-apple-system,sans-serif;pointer-events:none;border-width:2px;border-style:solid}
.uis-alert-head{display:flex;align-items:center;gap:8px;font-size:13px}
.uis-alert-icon{font-size:16px;line-height:1}
.uis-alert-urgency-tag{font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;letter-spacing:.4px;text-transform:uppercase}
.uis-alert-title-en{font-weight:700;color:#1e1c1a}
.uis-alert-sep{color:#b7a998}
.uis-alert-title-vi{color:#5a5349}
.uis-alert-close{margin-left:auto;background:none;border:none;font-size:18px;color:#7a7166;cursor:pointer;padding:0 4px;pointer-events:auto;border-radius:4px}
.uis-alert-close:hover{color:#2d2a26;background:rgba(0,0,0,.08)}
.uis-alert-close:focus{outline:2px solid #e8743b}
.uis-alert-countdown-row{display:flex;align-items:center;gap:8px;margin-top:4px}
.uis-alert-bar-track{flex:1;height:6px;background:rgba(0,0,0,.1);border-radius:999px;overflow:hidden}
.uis-alert-bar-fill{height:100%;border-radius:999px;transition:width .4s linear}
.uis-alert-timer-text{font-size:11px;font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums}
.uis-urgency-high{background:#fff4f3;border-color:#c0392b}
.uis-urgency-high .uis-alert-urgency-tag{background:#c0392b;color:#fff}
.uis-urgency-high .uis-alert-bar-fill{background:#c0392b}
.uis-urgency-high .uis-alert-timer-text{color:#96261a}
.uis-urgency-medium{background:#fffbf0;border-color:#e0a03a}
.uis-urgency-medium .uis-alert-urgency-tag{background:#e0a03a;color:#fff}
.uis-urgency-medium .uis-alert-bar-fill{background:#e0a03a}
.uis-urgency-medium .uis-alert-timer-text{color:#8c5d12}
.uis-urgency-low{background:#f4fbf6;border-color:#3a9d5d}
.uis-urgency-low .uis-alert-urgency-tag{background:#3a9d5d;color:#fff}
.uis-urgency-low .uis-alert-bar-fill{background:#3a9d5d}
.uis-urgency-low .uis-alert-timer-text{color:#246d3e}
@media (prefers-reduced-motion:reduce){.uis-hl-box{animation:none!important}.uis-bubble{transition:none!important}.uis-alert-bar-fill{transition:none!important}}
.uis-reduced-motion .uis-hl-box{animation:none!important}
.uis-reduced-motion .uis-bubble{transition:none!important}
.uis-reduced-motion .uis-alert-bar-fill{transition:none!important}
@media (max-width: 760px) {
  .uis-bubble-phone .uis-bubble {
    padding: 10px 14px 12px !important;
    border-radius: 18px !important;
    border-width: 3px !important;
    box-shadow: 0 8px 24px rgba(45,42,38,.22) !important;
  }
  .uis-bubble-phone .uis-bubble-header {
    gap: 8px !important;
    font-size: 20px !important;
    margin-bottom: 6px !important;
  }
  .uis-bubble-phone .uis-avatar {
    font-size: 28px !important;
  }
  .uis-bubble-phone .uis-who {
    font-size: 22px !important;
  }
  .uis-bubble-phone .uis-kind-tag {
    font-size: 18px !important;
    padding: 2px 8px !important;
  }
  .uis-bubble-phone .uis-bubble-close {
    font-size: 32px !important;
    min-width: 48px !important;
    min-height: 48px !important;
    padding: 2px 8px !important;
    touch-action: manipulation;
  }
  .uis-bubble-phone .uis-text-en {
    font-size: 37px !important;
    line-height: 1.3 !important;
    margin-bottom: 4px !important;
  }
  .uis-bubble-phone .uis-text-vi {
    font-size: 26px !important;
    line-height: 1.3 !important;
  }
  .uis-bubble-phone .uis-tail {
    width: 16px !important;
    height: 16px !important;
  }
  .uis-bubble-phone .uis-tail-down {
    bottom: -9px !important;
  }
  .uis-bubble-phone .uis-tail-up {
    top: -9px !important;
  }
}
`;

  let styleInjected = false;
  function injectCssOnce() {
    if (styleInjected) return;
    if (typeof document !== "undefined") {
      let s = document.getElementById("uis-styles");
      if (!s) {
        s = document.createElement("style");
        s.id = "uis-styles";
        s.textContent = CSS_TEXT;
        document.head.appendChild(s);
      }
      styleInjected = true;
    }
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  const KIND_META = {
    say: { icon: "💬", tag: "Say", border: "#5a3d1f" },
    request: { icon: "❓", tag: "Request", border: "#e8743b" },
    result: { icon: "✅", tag: "Result", border: "#3a9d5d" },
    error: { icon: "⛔", tag: "Alert", border: "#c0392b" },
    hint: { icon: "💡", tag: "Hint", border: "#e0a03a" }
  };

  const URGENCY_META = {
    high: { icon: "🚨", tag: "Khẩn cấp · Urgent" },
    medium: { icon: "⚡", tag: "Quan trọng · Important" },
    low: { icon: "ℹ️", tag: "Lưu ý · Notice" }
  };

  function createSvgEl(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
      for (const k in attrs) {
        if (attrs[k] != null) el.setAttribute(k, attrs[k]);
      }
    }
    return el;
  }

  function rectsIntersect(r1, r2) {
    return !(r1.x + r1.w < r2.x || r1.x > r2.x + r2.w || r1.y + r1.h < r2.y || r1.y > r2.y + r2.h);
  }

  let svgEl = null, reducedMotion = false, globalShowVi = false;
  let overlayGroup = null, highlightsGroup = null, labelsGroup = null, bubblesGroup = null, alertsGroup = null;
  const activeBubbles = new Map(), activeAlerts = new Map(), activeHighlights = new Map();
  let bubbleSeq = 0;

  function setShowVi(bool) {
    globalShowVi = !!bool;
  }

  function getShowVi() {
    return globalShowVi;
  }

  function init(svgRoot, opts = {}) {
    injectCssOnce();
    svgEl = typeof svgRoot === "string" ? document.querySelector(svgRoot) : (svgRoot || (typeof document !== "undefined" ? document.getElementById("room") : null));
    reducedMotion = !!opts.reducedMotion;
    if (!reducedMotion && typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reducedMotion = true;
    }
    if (!svgEl) return;
    if (reducedMotion) svgEl.classList.add("uis-reduced-motion");
    else svgEl.classList.remove("uis-reduced-motion");

    const old = svgEl.querySelector("#uis-overlay");
    if (old) old.remove();

    overlayGroup = createSvgEl("g", { id: "uis-overlay", class: "uis-layer" });
    highlightsGroup = createSvgEl("g", { class: "uis-highlights-layer" });
    labelsGroup = createSvgEl("g", { class: "uis-labels-layer" });
    bubblesGroup = createSvgEl("g", { class: "uis-bubbles-layer" });
    alertsGroup = createSvgEl("g", { class: "uis-alerts-layer" });

    overlayGroup.appendChild(highlightsGroup);
    overlayGroup.appendChild(labelsGroup);
    overlayGroup.appendChild(bubblesGroup);
    overlayGroup.appendChild(alertsGroup);
    svgEl.appendChild(overlayGroup);
  }

  function getElementViewBoxBounds(el) {
    if (!el || !svgEl) return null;
    try {
      if (typeof el.getCTM === "function" && typeof svgEl.getScreenCTM === "function") {
        const svgCTM = svgEl.getScreenCTM();
        if (svgCTM) {
          const rel = svgCTM.inverse().multiply(el.getCTM());
          const bb = el.getBBox();
          if (bb && bb.width > 0 && bb.height > 0) {
            const p1 = svgEl.createSVGPoint(); p1.x = bb.x; p1.y = bb.y;
            const r1 = p1.matrixTransform(rel);
            const p2 = svgEl.createSVGPoint(); p2.x = bb.x + bb.width; p2.y = bb.y + bb.height;
            const r2 = p2.matrixTransform(rel);
            const minX = Math.min(r1.x, r2.x), maxX = Math.max(r1.x, r2.x);
            const minY = Math.min(r1.y, r2.y), maxY = Math.max(r1.y, r2.y);
            return { x: minX, y: minY, w: Math.max(20, maxX - minX), h: Math.max(20, maxY - minY), cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, topY: minY };
          }
        }
      }
    } catch (e) {}

    let x = 500, y = 320, w = 60, h = 60;
    const tr = el.getAttribute("transform");
    if (tr) {
      const m = /translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/i.exec(tr);
      if (m) { x = parseFloat(m[1]); y = parseFloat(m[2]); }
    } else {
      const rx = el.getAttribute("x") || el.getAttribute("cx");
      const ry = el.getAttribute("y") || el.getAttribute("cy");
      if (rx != null) x = parseFloat(rx);
      if (ry != null) y = parseFloat(ry);
      const rw = el.getAttribute("width"), rh = el.getAttribute("height");
      if (rw != null) w = parseFloat(rw);
      if (rh != null) h = parseFloat(rh);
    }
    if (el.id === "char" || el.dataset?.obj === "char") return { x: x - 30, y: y - 100, w: 60, h: 100, cx: x, cy: y - 50, topY: y - 100 };
    if (el.classList && el.classList.contains("npc")) return { x: x - 25, y: y - 90, w: 50, h: 90, cx: x, cy: y - 45, topY: y - 90 };
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, topY: y };
  }

  function resolveAnchor(anchor) {
    if (!anchor) return { x: 500, y: 300, topY: 300 };
    if (typeof anchor === "object" && typeof anchor.x === "number" && typeof anchor.y === "number") {
      return { x: anchor.x, y: anchor.y, topY: anchor.y };
    }
    let targetEl = null;
    if (typeof anchor === "string") {
      if (anchor === "char") targetEl = svgEl ? svgEl.querySelector("#char") : null;
      else if (anchor.startsWith("npc:")) targetEl = svgEl ? svgEl.querySelector(`.npc[data-npc="${anchor.slice(4)}"], #npc-${anchor.slice(4)}, [data-npc="${anchor.slice(4)}"]`) : null;
      else if (anchor.startsWith("obj:")) targetEl = svgEl ? svgEl.querySelector(`#o-${anchor.slice(4)}, [data-obj="${anchor.slice(4)}"]`) : null;
      else if (svgEl) targetEl = svgEl.querySelector(anchor);
    }
    if (!targetEl) return { x: 500, y: 300, topY: 300 };
    const b = getElementViewBoxBounds(targetEl);
    return b ? { x: b.cx, y: b.topY, topY: b.topY } : { x: 500, y: 300, topY: 300 };
  }

  function findObj(objectId) {
    if (!svgEl || !objectId) return null;
    const cid = String(objectId).replace(/^o-/, "");
    return svgEl.querySelector(`#o-${cid}`) || svgEl.querySelector(`[data-obj="${cid}"]`) || svgEl.querySelector(`#${cid}`);
  }

  function bubble(anchor, opts = {}) {
    if (!svgEl || !bubblesGroup) init();
    if (!bubblesGroup) return null;

    const id = "uis-b-" + (++bubbleSeq);
    const kind = KIND_META[opts.kind] ? opts.kind : "say";
    const meta = KIND_META[kind];
    const avatar = opts.avatar || (opts.who === "Mom" ? "👩" : opts.who === "Dad" ? "👨" : "💬");
    const who = opts.who || "English Life";
    const en = opts.en || "";
    const vi = opts.vi || "";
    const ttlMs = typeof opts.ttlMs === "number" ? opts.ttlMs : 4000;
    const showVi = typeof opts.showVi === "boolean" ? opts.showVi : globalShowVi;
    const isPhone = (typeof window !== "undefined" && window.innerWidth <= 760) || (svgEl && svgEl.clientWidth > 0 && svgEl.clientWidth <= 760);
    const anchorPt = resolveAnchor(anchor);
    const BW = isPhone ? Math.min(580, en.length > 30 ? 580 : 460) : 250;
    const BH = isPhone
      ? ((showVi && vi) ? 148 : 106)
      : ((showVi && vi) ? (en.length > 50 || vi.length > 50 ? 116 : 96) : (en.length > 50 ? 92 : 74));

    let bx = anchorPt.x - BW / 2;
    let by = anchorPt.topY - BH - 16;
    let tailPos = "down";

    if (by < 56) {
      by = anchorPt.topY + 24;
      tailPos = "up";
    }

    bx = Math.max(12, Math.min(1000 - BW - 12, bx));
    by = Math.max(56, Math.min(640 - BH - 12, by));

    let attempts = 0;
    while (attempts < 8) {
      let coll = false;
      for (const b of activeBubbles.values()) {
        if (rectsIntersect({ x: bx, y: by, w: BW, h: BH }, { x: b.x, y: b.y, w: b.w, h: b.h })) {
          coll = true;
          by = by > 200 ? b.y - BH - 10 : b.y + b.h + 10;
          break;
        }
      }
      if (!coll) break;
      attempts++;
    }
    bx = Math.max(12, Math.min(1000 - BW - 12, bx));
    by = Math.max(56, Math.min(640 - BH - 12, by));

    const foClass = "uis-bubble-fo" + (isPhone ? " uis-bubble-phone" : "");
    const fo = createSvgEl("foreignObject", { id, class: foClass, x: bx, y: by, width: BW, height: BH });
    const tailX = Math.max(18, Math.min(BW - 26, anchorPt.x - bx));

    const viBlock = (showVi && vi) ? `<div class="uis-text-vi">${escapeHtml(vi)}</div>` : "";

    fo.innerHTML = `
      <div xmlns="http://www.w3.org/1999/xhtml" class="uis-bubble uis-kind-${kind}" style="border-color:${meta.border};">
        <div class="uis-bubble-header">
          <span class="uis-avatar" aria-hidden="true">${escapeHtml(avatar)}</span>
          <span class="uis-who">${escapeHtml(who)}</span>
          <span class="uis-kind-tag" aria-label="${escapeHtml(meta.tag)}">${meta.icon} ${escapeHtml(meta.tag)}</span>
          <button type="button" class="uis-bubble-close" aria-label="Đóng lời thoại" title="Đóng">×</button>
        </div>
        <div class="uis-bubble-body">
          <div class="uis-text-en">${escapeHtml(en)}</div>
          ${viBlock}
        </div>
        <div class="uis-tail uis-tail-${tailPos}" style="left:${tailX}px;border-color:${meta.border};"></div>
      </div>
    `;

    const closeBtn = fo.querySelector(".uis-bubble-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) { e.stopPropagation(); clearBubble(id); });
      closeBtn.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    }

    bubblesGroup.appendChild(fo);

    let timer = null;
    if (ttlMs > 0) {
      timer = setTimeout(function () { clearBubble(id); }, ttlMs);
    }

    activeBubbles.set(id, { id, el: fo, x: bx, y: by, w: BW, h: BH, timer });
    return id;
  }

  function clearBubble(id) {
    const item = activeBubbles.get(id);
    if (!item) return;
    if (item.timer) clearTimeout(item.timer);
    if (item.el && item.el.parentNode) item.el.parentNode.removeChild(item.el);
    activeBubbles.delete(id);
  }

  function clearAllBubbles() {
    for (const id of Array.from(activeBubbles.keys())) clearBubble(id);
  }

  function labels(on) {
    if (!svgEl || !labelsGroup) init();
    if (!on) {
      labelsGroup.innerHTML = "";
      svgEl.classList.remove("uis-labels-on", "show-tags");
      return;
    }
    svgEl.classList.add("uis-labels-on", "show-tags");
    labelsGroup.innerHTML = "";

    const objs = svgEl.querySelectorAll("#world .obj, .obj");
    objs.forEach(function (obj) {
      const objId = obj.getAttribute("data-obj") || obj.id.replace(/^o-/, "");
      const aria = obj.getAttribute("aria-label") || "";
      const tagText = obj.querySelector(".tag")?.textContent || "";
      let en = objId, vi = "";

      if (aria.includes(",")) {
        const p = aria.split(","); en = p[0].trim(); vi = p[1].trim();
      } else if (tagText.includes("·")) {
        const p = tagText.split("·"); en = p[0].trim(); vi = p[1].trim();
      }

      let stateVi = obj.getAttribute("data-state") || "";
      if (!stateVi) {
        if (objId === "fridge" && svgEl.classList.contains("fridge-open")) stateVi = "đang mở";
        else if (objId === "tv" && svgEl.classList.contains("tv-on")) stateVi = "đang bật";
        else if (objId === "window" && svgEl.classList.contains("win-open")) stateVi = "đang mở";
        else if (objId === "cat" && svgEl.classList.contains("cat-sleeping")) stateVi = "đang ngủ";
      }

      const bounds = getElementViewBoxBounds(obj);
      if (!bounds) return;

      const foW = 190, foH = 34;
      const fo = createSvgEl("foreignObject", {
        class: "uis-label-fo",
        "data-for": objId,
        x: Math.max(4, Math.min(1000 - foW - 4, bounds.cx - foW / 2)),
        y: Math.max(4, bounds.topY - 26),
        width: foW,
        height: foH
      });

      fo.innerHTML = `
        <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;justify-content:center;">
          <div class="uis-label-chip">
            <span class="uis-label-en">${escapeHtml(en)}</span>
            <span class="uis-label-sep">·</span>
            <span class="uis-label-vi">${escapeHtml(vi || en)}</span>
            ${stateVi ? `<span class="uis-label-state">${escapeHtml(stateVi)}</span>` : ""}
          </div>
        </div>
      `;
      labelsGroup.appendChild(fo);
    });
  }

  function highlight(objectId, kind) {
    if (!svgEl || !highlightsGroup) init();
    if (!highlightsGroup) return;

    if (!objectId) {
      for (const id of Array.from(activeHighlights.keys())) highlight(id, null);
      return;
    }

    const cleanId = String(objectId).replace(/^o-/, "");
    if (activeHighlights.has(cleanId)) {
      const old = activeHighlights.get(cleanId);
      if (old.el && old.el.parentNode) old.el.parentNode.removeChild(old.el);
      if (old.targetEl) old.targetEl.classList.remove("uis-hl-target", "uis-hl-done", "uis-hl-blocked");
      activeHighlights.delete(cleanId);
    }

    if (!kind) return;
    const targetEl = findObj(cleanId);
    if (!targetEl) return;
    const b = getElementViewBoxBounds(targetEl);
    if (!b) return;

    const pad = 10;
    const x = b.x - pad, y = b.y - pad, w = b.w + pad * 2, h = b.h + pad * 2;
    const HL = { target: { icon: "🎯", text: "Mục tiêu · Target" }, done: { icon: "✅", text: "Xong · Done" }, blocked: { icon: "⛔", text: "Bị khóa · Blocked" } };
    const info = HL[kind] || HL.target;

    const g = createSvgEl("g", { class: `uis-highlight uis-hl-${kind}`, "data-obj-id": cleanId });
    const rect = createSvgEl("rect", { class: "uis-hl-box", x, y, width: w, height: h, rx: 14 });
    const badgeG = createSvgEl("g", { class: "uis-hl-badge", transform: `translate(${x + w / 2}, ${Math.max(14, y - 4)})` });
    const badgeBg = createSvgEl("rect", { class: "uis-hl-badge-bg", x: -60, y: -11, width: 120, height: 22 });
    const badgeText = createSvgEl("text", { class: "uis-hl-badge-text", x: 0, y: 0 });
    badgeText.textContent = `${info.icon} ${info.text}`;

    badgeG.appendChild(badgeBg);
    badgeG.appendChild(badgeText);
    g.appendChild(rect);
    g.appendChild(badgeG);
    highlightsGroup.appendChild(g);

    targetEl.classList.add(`uis-hl-${kind}`);
    activeHighlights.set(cleanId, { objectId: cleanId, kind, el: g, targetEl });
  }

  function alert(opts = {}) {
    if (!svgEl || !alertsGroup) init();
    if (!alertsGroup) return null;

    const id = opts.id || "uis-alert-default";
    clearAlert(id);

    const urgency = opts.urgency === "high" || opts.urgency === "low" ? opts.urgency : "medium";
    const uMeta = URGENCY_META[urgency];
    const icon = opts.icon || uMeta.icon;
    const title_en = opts.title_en || "";
    const title_vi = opts.title_vi || "";
    let remainingSec = typeof opts.remainingSec === "number" ? opts.remainingSec : null;
    const totalSec = typeof opts.totalSec === "number" ? opts.totalSec : (remainingSec || 60);

    const AW = 700, AH = remainingSec !== null ? 56 : 44;
    const fo = createSvgEl("foreignObject", { id, class: "uis-alert-fo", x: (1000 - AW) / 2, y: 10, width: AW, height: AH });

    function getPercent() {
      if (remainingSec === null || totalSec <= 0) return 100;
      return Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));
    }

    function renderAlertHtml() {
      const pct = getPercent();
      return `
        <div xmlns="http://www.w3.org/1999/xhtml" class="uis-alert uis-urgency-${urgency}">
          <div class="uis-alert-head">
            <span class="uis-alert-icon" aria-hidden="true">${escapeHtml(icon)}</span>
            <span class="uis-alert-urgency-tag" aria-label="Mức độ: ${escapeHtml(uMeta.tag)}">${escapeHtml(uMeta.tag)}</span>
            <span class="uis-alert-title-en">${escapeHtml(title_en)}</span>
            <span class="uis-alert-sep">·</span>
            <span class="uis-alert-title-vi">${escapeHtml(title_vi)}</span>
            <button type="button" class="uis-alert-close" aria-label="Đóng thông báo" title="Đóng">×</button>
          </div>
          ${remainingSec !== null ? `
          <div class="uis-alert-countdown-row">
            <div class="uis-alert-bar-track" role="progressbar" aria-valuenow="${remainingSec}" aria-valuemin="0" aria-valuemax="${totalSec}">
              <div class="uis-alert-bar-fill" style="width:${pct}%;"></div>
            </div>
            <span class="uis-alert-timer-text">⏱️ ${remainingSec}s / ${totalSec}s</span>
          </div>` : ""}
        </div>
      `;
    }

    fo.innerHTML = renderAlertHtml();
    function bindClose() {
      const b = fo.querySelector(".uis-alert-close");
      if (b) b.addEventListener("click", function (e) { e.stopPropagation(); clearAlert(id); });
    }
    bindClose();
    alertsGroup.appendChild(fo);

    let timer = null;
    if (remainingSec !== null && remainingSec > 0) {
      timer = setInterval(function () {
        remainingSec -= 1;
        if (remainingSec <= 0) {
          remainingSec = 0;
          clearInterval(timer);
          timer = null;
        }
        fo.innerHTML = renderAlertHtml();
        bindClose();
      }, 1000);
    }

    activeAlerts.set(id, { id, el: fo, timer });
    return id;
  }

  function clearAlert(id) {
    const alertId = id || "uis-alert-default";
    const item = activeAlerts.get(alertId);
    if (!item) return;
    if (item.timer) clearInterval(item.timer);
    if (item.el && item.el.parentNode) item.el.parentNode.removeChild(item.el);
    activeAlerts.delete(alertId);
  }

  const API = {
    init,
    bubble,
    clearBubble,
    clearAll: clearAllBubbles,
    labels,
    highlight,
    alert,
    clearAlert,
    setShowVi,
    getShowVi,
    css: CSS_TEXT
  };

  root.ELW_UI_SCENE = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
