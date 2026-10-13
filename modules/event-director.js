/* English Life World — event-director.js
   Agent 1: Bộ điều phối sự kiện (Event Director)
   Manages random urgent tasks with countdown timers, auto-resolution on matching actions,
   and visual countdown alerts. */
(function (root) {
  "use strict";

  const EVENTS = [
    {
      id: "kettle_boiling",
      title: "Boiling Kettle!",
      titleVi: "Ấm nước đang sôi!",
      en: "The kettle is whistling loudly! Turn off the stove before it boils dry.",
      vi: "Ấm nước đang réo sôi sùng sục! Mau tắt bếp kẻo cháy ấm!",
      action: "turn_off_stove",
      room: "kitchen",
      duration: 45,
      xp: 25,
      icon: "🫖"
    },
    {
      id: "cat_crying",
      title: "Hungry Kitty!",
      titleVi: "Mèo Mimi kêu đói!",
      en: "The cat is meowing at the empty bowl! Feed the cat now.",
      vi: "Mèo Mimi đang đói cồn cào và gõ bát! Cho mèo ăn ngay!",
      action: "feed_cat",
      room: "living",
      duration: 60,
      xp: 20,
      icon: "🐱"
    },
    {
      id: "plant_drooping",
      title: "Thirsty Plant!",
      titleVi: "Cây cảnh héo khô!",
      en: "The indoor plant is drooping! Water the plant before the leaves turn brown.",
      vi: "Cây xanh đang rũ xuống vì khát! Tưới nước cho cây ngay!",
      action: "water_plant",
      room: "living",
      duration: 55,
      xp: 20,
      icon: "🪴"
    },
    {
      id: "milk_left_out",
      title: "Milk on the Table!",
      titleVi: "Hộp sữa để quên!",
      en: "The cold milk is warming up on the table! Put the milk back in the fridge.",
      vi: "Hộp sữa tươi để ngoài bàn sẽ bị chua! Cất sữa vào tủ lạnh ngay!",
      action: "put_milk_back",
      room: "living",
      duration: 50,
      xp: 15,
      icon: "🥛"
    },
    {
      id: "faucet_running",
      title: "Faucet Leaking!",
      titleVi: "Vòi nước chảy tràn!",
      en: "The kitchen tap is running at full blast! Turn off the faucet.",
      vi: "Vòi nước chậu rửa đang chảy xối xả! Mau khóa vòi nước lại!",
      action: "turn_off_faucet",
      room: "kitchen",
      duration: 40,
      xp: 25,
      icon: "🚰"
    },
    {
      id: "trash_overflowing",
      title: "Full Trash Bin!",
      titleVi: "Thùng rác đầy tràn!",
      en: "The kitchen trash can is overflowing! Take out the trash.",
      vi: "Thùng rác nhà bếp đã đầy ứ! Mau đem rác đi đổ!",
      action: "empty_trash",
      room: "kitchen",
      duration: 65,
      xp: 20,
      icon: "🗑️"
    },
    {
      id: "phone_ringing",
      title: "Phone Ringing!",
      titleVi: "Điện thoại đổ chuông!",
      en: "Someone is calling on the bedroom phone! Pick up and answer.",
      vi: "Có người đang gọi đến phòng ngủ! Mau nhấc máy trả lời!",
      action: "answer_phone",
      room: "bedroom",
      duration: 40,
      xp: 30,
      icon: "☎️"
    },
    {
      id: "wind_blowing",
      title: "Sudden Gust!",
      titleVi: "Gió to đập cửa sổ!",
      en: "Strong wind is blowing dust into the living room! Close the window.",
      vi: "Cơn gió lốc đang thổi bụi vào phòng khách! Đóng cửa sổ lại!",
      action: "close_window",
      room: "living",
      duration: 45,
      xp: 20,
      icon: "🪟"
    },
    {
      id: "bath_overflow",
      title: "Bathtub Overflowing!",
      titleVi: "Bồn tắm sắp tràn!",
      en: "The water level in the bathtub is rising too high! Turn off the bath tap.",
      vi: "Nước trong bồn tắm đang dâng sắp tràn ra sàn! Khóa vòi bồn tắm ngay!",
      action: "turn_off_bath_tap",
      room: "bathroom",
      duration: 45,
      xp: 25,
      icon: "🛁"
    },
    {
      id: "garden_hose",
      title: "Garden Hose Leaking!",
      titleVi: "Vòi tưới vườn chảy mạnh!",
      en: "The garden hose is flooding the flowerbed! Turn off the hose.",
      vi: "Vòi tưới nước đang làm ngập luống hoa! Mau khóa vòi tưới!",
      action: "turn_off_garden_hose",
      room: "garden",
      duration: 50,
      xp: 25,
      icon: "🌱"
    }
  ];

  const css = `
.ed-card{background:#fffaf2;border:2px solid #e8743b;border-radius:12px;padding:10px 14px;margin-bottom:10px;box-shadow:0 3px 10px rgba(232,116,59,.18);animation:ed-pulse 2s infinite ease-in-out;box-sizing:border-box}
@keyframes ed-pulse{0%,100%{box-shadow:0 2px 8px rgba(232,116,59,.15)}50%{box-shadow:0 4px 14px rgba(232,116,59,.35)}}
.ed-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.ed-badge{display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:13px;color:#d32f2f;background:#ffebee;padding:3px 8px;border-radius:999px;border:1px solid #ffcdd2}
.ed-timer{font-variant-numeric:tabular-nums;font-weight:700;font-size:14px;color:#d32f2f}
.ed-title{font-size:15px;font-weight:700;color:#3b2a1e;margin:0 0 4px}
.ed-desc{font-size:13px;line-height:1.4;color:#4a3728;margin-bottom:8px}
.ed-desc .vi{color:#7a5a40;font-size:12px;margin-top:2px}
.ed-bar{background:#e3d6c3;height:6px;border-radius:3px;overflow:hidden;margin-bottom:8px}
.ed-fill{height:100%;background:#e8743b;transition:width .4s linear}
.ed-fill.warn{background:#d32f2f}
.ed-act{display:flex;gap:6px}
.ed-btn{border:0;background:#e8743b;color:#fff;font-weight:700;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px}
.ed-btn:hover{background:#d35d26}
.ed-btn.sub{background:#f3ebe0;color:#5a3d1f}
`;

  let activeEvent = null; // { def, remaining, total, timerId, onResolved, onFailed }
  let intervalId = null;
  let listeners = [];
  let history = [];
  let autoTimerSec = 120;
  let lastActionTime = Date.now();

  function subscribe(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }
  function notify() {
    for (const l of listeners) {
      try { l(activeEvent); } catch (e) { console.error(e); }
    }
  }

  function trigger(idOrObj) {
    const def = typeof idOrObj === "string" ? EVENTS.find(e => e.id === idOrObj) : idOrObj;
    if (!def) return null;
    if (activeEvent && activeEvent.timerId) clearInterval(activeEvent.timerId);

    activeEvent = {
      id: def.id,
      def: { ...def },
      remaining: def.duration,
      total: def.duration,
      startTime: Date.now(),
      status: "active"
    };

    activeEvent.timerId = setInterval(() => {
      tick(1);
    }, 1000);

    notify();
    return activeEvent;
  }

  function tick(seconds = 1) {
    if (!activeEvent || activeEvent.status !== "active") return;
    activeEvent.remaining = Math.max(0, activeEvent.remaining - seconds);
    if (activeEvent.remaining <= 0) {
      fail("timeout");
    } else {
      notify();
    }
  }

  function fail(reason = "timeout") {
    if (!activeEvent) return;
    if (activeEvent.timerId) clearInterval(activeEvent.timerId);
    activeEvent.status = "failed";
    activeEvent.failReason = reason;
    history.push({ ...activeEvent, endedAt: Date.now() });
    const ev = activeEvent;
    activeEvent = null;
    notify();
    return ev;
  }

  function resolve(actionId) {
    if (!activeEvent || activeEvent.status !== "active") return false;
    if (activeEvent.def.action === actionId) {
      if (activeEvent.timerId) clearInterval(activeEvent.timerId);
      activeEvent.status = "resolved";
      history.push({ ...activeEvent, endedAt: Date.now() });
      const ev = activeEvent;
      activeEvent = null;
      notify();
      return { resolved: true, event: ev, xp: ev.def.xp };
    }
    return false;
  }

  function onAction(actionId, worldState) {
    lastActionTime = Date.now();
    if (activeEvent && activeEvent.status === "active") {
      const res = resolve(actionId);
      if (res) return res;
    }
    return false;
  }

  function triggerRandom(worldState = {}) {
    if (activeEvent && activeEvent.status === "active") return null;
    // Prefer events that match current room or world conditions
    const pool = EVENTS.slice();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return trigger(pick.id);
  }

  function mountHud(container, callbacks = {}) {
    if (!container || typeof document === "undefined") return;
    if (!document.getElementById("ed-css")) {
      const st = document.createElement("style");
      st.id = "ed-css";
      st.textContent = css;
      document.head.appendChild(st);
    }

    function render() {
      if (!activeEvent || activeEvent.status !== "active") {
        container.innerHTML = "";
        container.hidden = true;
        return;
      }
      container.hidden = false;
      const ev = activeEvent;
      const pct = Math.max(0, Math.min(100, (ev.remaining / ev.total) * 100));
      const isWarn = ev.remaining <= 15;
      container.innerHTML = `
<div class="ed-card">
  <div class="ed-head">
    <span class="ed-badge">🚨 KHẨN CẤP · URGENT</span>
    <span class="ed-timer ${isWarn ? "warn" : ""}">${ev.remaining}s</span>
  </div>
  <div class="ed-title">${ev.def.icon} ${ev.def.title} · ${ev.def.titleVi}</div>
  <div class="ed-desc">
    <div class="en">${ev.def.en}</div>
    <div class="vi">${ev.def.vi}</div>
  </div>
  <div class="ed-bar"><div class="ed-fill ${isWarn ? "warn" : ""}" style="width:${pct}%"></div></div>
  <div class="ed-act">
    <button class="ed-btn" id="edGoBtn">Làm ngay (${ev.def.action})</button>
    <button class="ed-btn sub" id="edSayBtn">🔊 Nghe</button>
  </div>
</div>`;
      const go = container.querySelector("#edGoBtn");
      if (go) {
        go.onclick = () => {
          if (callbacks.enqueue) callbacks.enqueue(ev.def.action);
        };
      }
      const sayBtn = container.querySelector("#edSayBtn");
      if (sayBtn) {
        sayBtn.onclick = () => {
          if (callbacks.speak) callbacks.speak(ev.def.en);
        };
      }
    }

    render();
    return subscribe(render);
  }

  const API = {
    EVENTS,
    css,
    current: () => activeEvent,
    trigger,
    tick,
    fail,
    resolve,
    onAction,
    triggerRandom,
    mountHud,
    subscribe,
    history: () => history.slice(),
    reset: () => {
      if (activeEvent && activeEvent.timerId) clearInterval(activeEvent.timerId);
      activeEvent = null;
      history = [];
      notify();
    }
  };

  root.ELW_EVENT_DIRECTOR = API;
  root.ELW_EVENTS = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
