/* English Life World — family-npc.js
   Agent 5: Nhân vật trong nhà (Family NPCs)
   Simulates family members (Mom, Dad, Brother) with ambient background activities,
   event-driven dialogues, and contextual reactions to player actions. */
(function (root) {
  "use strict";

  const NPCS = {
    mom: {
      id: "mom",
      name: "Mom (Linda)",
      nameVi: "Mẹ (Linda)",
      avatar: "👩‍🦰",
      color: "#e57373",
      room: "kitchen",
      activity: "cooking",
      activities: [
        { id: "cooking", en: "Chopping fresh vegetables for soup", vi: "Đang thái rau tươi nấu canh", room: "kitchen", spot: { x: 740, y: 440, d: -1 } },
        { id: "watering", en: "Watering the flowerbeds gently", vi: "Đang tưới nước cho luống hoa", room: "garden", spot: { x: 380, y: 530, d: 1 } },
        { id: "resting", en: "Drinking warm herbal tea on the sofa", vi: "Đang uống trà thảo mộc trên ghế", room: "living", spot: { x: 500, y: 410, d: 1 } }
      ],
      reactions: {
        feed_cat: { en: "Thank you for feeding Mimi, sweetie! She was so hungry.", vi: "Cảm ơn con đã cho Mimi ăn! Nãy giờ nó đói meo đấy." },
        wipe_table: { en: "The table looks spotless! You're such a great helper.", vi: "Bàn ăn sạch bóng rồi! Con chu đáo quá." },
        k_fry_egg: { en: "Be careful around the hot stove, dear! Smells wonderful.", vi: "Cẩn thận với chảo nóng nhé con! Mùi thơm quá." },
        water_plant: { en: "The plants look much greener now! Thank you.", vi: "Cây cối xanh mướt hẳn ra rồi! Mẹ cảm ơn con." },
        k_wash_dishes: { en: "A clean sink makes everyone happy! Good job.", vi: "Bồn rửa sạch sẽ làm cả nhà vui vẻ! Con làm tốt lắm." }
      },
      idleChat: [
        { en: "It's such a lovely day today, isn't it?", vi: "Hôm nay trời thật đẹp con nhỉ?" },
        { en: "Remember to drink enough water while playing!", vi: "Nhớ uống đủ nước khi học và chơi nhé!" },
        { en: "I'm planning to make something special for dinner tonight.", vi: "Tối nay mẹ định nấu một món thật đặc biệt đấy." }
      ]
    },
    dad: {
      id: "dad",
      name: "Dad (David)",
      nameVi: "Bố (David)",
      avatar: "👨‍🦱",
      color: "#64b5f6",
      room: "living",
      activity: "reading",
      activities: [
        { id: "reading", en: "Reading the morning newspaper", vi: "Đang đọc báo buổi sáng", room: "living", spot: { x: 680, y: 480, d: -1 } },
        { id: "tinkering", en: "Fixing a bicycle brake in the garage", vi: "Đang sửa phanh xe đạp trong garage", room: "garage", spot: { x: 380, y: 450, d: 1 } },
        { id: "coffee", en: "Sipping a hot cup of black coffee", vi: "Đang nhâm nhi tách cà phê đen", room: "kitchen", spot: { x: 420, y: 460, d: 1 } }
      ],
      reactions: {
        sweep_floor: { en: "Great work sweeping the floor! Teamwork makes the dream work.", vi: "Quét nhà sạch lắm con! Cả nhà cùng làm thì việc gì cũng xong." },
        turn_off_tv: { en: "Good habit turning off the screen when not watching!", vi: "Tắt tivi khi không xem là thói quen rất tốt!" },
        pump_bicycle_tire: { en: "That tire pressure is perfect now. Ready for a weekend ride!", vi: "Lốp xe căng đều rồi đấy. Cuối tuần sẵn sàng đi dạo rồi!" },
        water_flowers: { en: "The garden is thriving thanks to your care, buddy.", vi: "Khu vườn tươi tốt hẳn lên nhờ con chăm sóc đấy." },
        inspect_car: { en: "Always check the car before long trips! Very smart.", vi: "Luôn kiểm tra xe trước mỗi chuyến đi xa! Rất thông minh." }
      },
      idleChat: [
        { en: "How is your English practice going today?", vi: "Hôm nay con luyện tiếng Anh thế nào rồi?" },
        { en: "Let me know if you need any help fixing things!", vi: "Cần bố giúp sửa đồ gì cứ bảo bố nhé!" },
        { en: "A clean and organized house gives peace of mind.", vi: "Nhà cửa gọn gàng sạch sẽ luôn cho ta sự thoải mái." }
      ]
    },
    brother: {
      id: "brother",
      name: "Tommy (Little Brother)",
      nameVi: "Tommy (Em trai)",
      avatar: "👦",
      color: "#81c784",
      room: "living",
      activity: "playing",
      activities: [
        { id: "playing", en: "Playing with toy cars on the rug", vi: "Đang chơi ô tô đồ chơi trên thảm", room: "living", spot: { x: 420, y: 580, d: 1 } },
        { id: "studying", en: "Drawing funny comic pictures", vi: "Đang vẽ tranh truyện tranh", room: "bedroom", spot: { x: 400, y: 490, d: -1 } },
        { id: "petting", en: "Petting Mimi the cat gently", vi: "Đang vuốt ve mèo Mimi", room: "living", spot: { x: 540, y: 590, d: 1 } }
      ],
      reactions: {
        turn_on_tv: { en: "Yay, TV is on! Can we watch cartoon superheroes?", vi: "A tivi bật rồi! Cho em xem phim siêu nhân hoạt hình với nhé?" },
        play_with_cat: { en: "Look how fast Mimi jumps! That's so funny!", vi: "Nhìn Mimi nhảy tít kìa! Vui quá anh/chị ơi!" },
        k_make_toast: { en: "Can I have a slice of crispy toast too, please?", vi: "Cho em một lát bánh mì nướng giòn với được không ạ?" },
        listen_to_music: { en: "I love this catchy song! Let's dance!", vi: "Bài hát này vui nhộn quá! Cùng nhún nhảy nào!" }
      },
      idleChat: [
        { en: "Mimi purred at me when I hugged her!", vi: "Mimi kêu gừ gừ khi em ôm nó đấy!" },
        { en: "I learned three new English words today!", vi: "Hôm nay em học được ba từ tiếng Anh mới rồi nè!" },
        { en: "Race you to the garden gate!", vi: "Ai chạy ra cổng vườn trước là thắng nhé!" }
      ]
    }
  };

  const css = `
.npc-overlay{position:relative}
.npc-fig{cursor:pointer;transition:transform .2s ease;filter:drop-shadow(0 2px 5px rgba(0,0,0,.15))}
.npc-fig:hover{transform:scale(1.06)}
.npc-bubble{position:absolute;background:#fff;border:2px solid #5a3d1f;border-radius:12px;padding:6px 10px;font-size:12px;box-shadow:0 3px 8px rgba(0,0,0,.12);pointer-events:none;z-index:30;max-width:220px;transition:opacity .3s ease}
.npc-bubble::after{content:'';position:absolute;bottom:-6px;left:20px;width:10px;height:10px;background:#fff;border-right:2px solid #5a3d1f;border-bottom:2px solid #5a3d1f;transform:rotate(45deg)}
.npc-card{background:#fffbf2;border:1px solid #e3d6c3;border-radius:12px;padding:10px;margin-bottom:8px}
.npc-row{display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px dashed #e3d6c3}
.npc-name{font-weight:700;font-size:13px;color:#3b2a1e}
.npc-act{font-size:12px;color:#7a5a40}
`;

  let activeMessage = null; // { npcId, en, vi, expiresAt }
  let listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }
  function notify() {
    for (const l of listeners) {
      try { l({ npcs: NPCS, message: activeMessage }); } catch (e) { console.error(e); }
    }
  }

  function getNpcsInRoom(roomId) {
    return Object.values(NPCS).filter(npc => npc.room === roomId);
  }

  function cycleActivities() {
    for (const npc of Object.values(NPCS)) {
      if (npc.activities && npc.activities.length) {
        const next = npc.activities[Math.floor(Math.random() * npc.activities.length)];
        npc.activity = next.id;
        npc.room = next.room;
      }
    }
    notify();
  }

  function speakReaction(npcId, textEn, textVi) {
    activeMessage = {
      npcId,
      en: textEn,
      vi: textVi,
      expiresAt: Date.now() + 6000
    };
    notify();
    setTimeout(() => {
      if (activeMessage && activeMessage.expiresAt <= Date.now()) {
        activeMessage = null;
        notify();
      }
    }, 6200);
    return activeMessage;
  }

  function onAction(actionId, worldState) {
    // Check if any NPC has a reaction to this action
    for (const npc of Object.values(NPCS)) {
      const r = npc.reactions && npc.reactions[actionId];
      if (r) {
        return speakReaction(npc.id, r.en, r.vi);
      }
    }
    return null;
  }

  function interactWithNpc(npcId) {
    const npc = NPCS[npcId];
    if (!npc) return null;
    const pool = npc.idleChat || [];
    const pick = pool[Math.floor(Math.random() * pool.length)] || { en: "Hello!", vi: "Xin chào!" };
    return speakReaction(npc.id, pick.en, pick.vi);
  }

  function mountHud(container, callbacks = {}) {
    if (!container || typeof document === "undefined") return;
    if (!document.getElementById("npc-css")) {
      const st = document.createElement("style");
      st.id = "npc-css";
      st.textContent = css;
      document.head.appendChild(st);
    }

    function render() {
      container.innerHTML = `
<div class="npc-card">
  <div style="font-weight:700;font-size:13px;color:#3b2a1e;margin-bottom:6px">👨‍👩‍👦 Gia đình thân yêu (Family Members):</div>
  ${Object.values(NPCS).map(npc => {
    const curAct = npc.activities.find(a => a.id === npc.activity) || npc.activities[0];
    return `
      <div class="npc-row">
        <span style="font-size:22px">${npc.avatar}</span>
        <div style="flex:1">
          <div class="npc-name">${npc.nameVi} <span style="font-size:11px;color:#8d6e63">(${npc.room})</span></div>
          <div class="npc-act">${curAct.vi}</div>
        </div>
        <button class="btn" style="padding:3px 8px;font-size:11px" data-npc="${npc.id}">Trò chuyện</button>
      </div>`;
  }).join("")}
  ${activeMessage ? `
    <div style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:8px;margin-top:8px;font-size:12px">
      <b>${(NPCS[activeMessage.npcId]||{}).nameVi}:</b> “${activeMessage.en}”
      <div style="color:#2e7d32;font-size:11px">${activeMessage.vi}</div>
    </div>` : ""}
</div>`;

      container.querySelectorAll("[data-npc]").forEach(b => {
        b.onclick = () => {
          const res = interactWithNpc(b.dataset.npc);
          if (res && callbacks.speak) callbacks.speak(res.en);
        };
      });
    }

    render();
    return subscribe(render);
  }

  const API = {
    NPCS,
    css,
    getNpcsInRoom,
    cycleActivities,
    speakReaction,
    interactWithNpc,
    onAction,
    currentMessage: () => activeMessage,
    mountHud,
    subscribe,
    reset: () => {
      activeMessage = null;
      notify();
    }
  };

  root.ELW_FAMILY = API;
  root.ELW_NPCS = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
