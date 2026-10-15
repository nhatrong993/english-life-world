# BÁO CÁO KIỂM TOÁN NHÂN VẬT PHỤ & KẾ HOẠCH KIỂM THỬ HỆ THỐNG PET 2.0 (5 CẤP TRƯỞNG THÀNH)

> **Dự án**: English Life World (`D:\tools\Hoc tieng anh\english-life-world`)  
> **Phụ trách**: Agent F — QA & Side-Character Audit (Phase 1)  
> **Phạm vi**: Kiểm toán toàn diện nguồn sinh nhân vật phụ ngoài ý muốn, thiết kế kỹ thuật cơ chế Checkbox Bật/Tắt từng nhân vật phụ trong Cấu hình Ngữ cảnh (Context Configuration) kèm cơ chế Hủy tức thì (Immediate Teardown), và lập Kế hoạch Kiểm thử 12 mục (QA Test Plan) cho Pet System 2.0.

---

## PHẦN A — BÁO CÁO TRUY VẾT TOÀN DIỆN NHÂN VẬT PHỤ BẤT NGỜ (SIDE-CHARACTER SPAWN AUDIT)

Qua rà soát toàn bộ mã nguồn (`index.html` và tất cả các module trong `modules/`), hiện tượng **"nhân vật phụ, khách ghé thăm, người lạ, hoặc thú phụ tự ý xuất hiện, bung hộp thoại, hiện bong bóng chữ và phát giọng đọc TTS dù người dùng không chọn"** xuất phát từ **5 hệ thống độc lập** chạy song song nhưng **không có một cổng kiểm soát tập trung (Central Gatekeeper)**.

---

### 1. Bảng Tổng Hợp Toàn Bộ Các Nhóm Nhân Vật Phụ / Khách / Động Vật Phụ Trong Codebase

| STT | Mã định danh (`id` / `role`) | Tên hiển thị (EN / VI) | Phân nhóm đề xuất | File định nghĩa & Dòng code | DOM Selector / Vùng hiển thị | Cơ chế kích hoạt hiện tại |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `linh` (`FRIEND`) | **Linh** (Bạn đồng hành) | `companion` (Bạn đồng hành Linh) | `modules/life-talk.js` (dòng 14–16, 340–385)<br>`modules/context-engine.js` (dòng 144) | `#lt-friend` (`g.npc[data-npc="linh"]` trong `#world`), `#lt-scene-bub`, `#ltCard` | Bật qua `#ctxBtnLinh`, nhưng bị **tự động cưỡng bức bật** khi bấm `#ctxBtnTalkNow` (`context-engine.js:1268-1273`) hoặc khi chạy nhiệm vụ `life_*` (`index.html:2132`). |
| **2** | `dad`, `mom`, `grandpa`, `grandma`, `tom`, `lily`, `baby` | **Bố, Mẹ, Ông, Bà, Anh Tom, Bé Lily, Em bé Ben** | `family` (Gia đình trong nhà) | `modules/npcs.js` (`PEOPLE` dòng 39–55, `FAMILY` dòng 63, `SCHEDULE` dòng 72–133)<br>`modules/roleplay.js` (`CHARS` dòng 5–11)<br>`modules/events.js` (`NPCN` dòng 177–180)<br>`modules/context-engine.js` (`ROLE_MOM` dòng 146) | `g.npc[data-npc="<id>"]` trong `#world`, thẻ `#peopleCard`, hộp thoại `#rpCard`, khay `#evTray`, bong bóng `#ctx-3d-bubble` / `#sceneBubble` | Luôn tự động vẽ theo `SCHEDULE[phase]` mỗi khi gọi `renderPeople()` (`index.html:2051-2055`); tự bật `#rpCard` với xác suất **60%** sau mỗi hành động (`roleplay.js:814`); tự bắn sự kiện `#evTray` mỗi 30 giây (`events.js:184, 260-280`). |
| **3** | `guest`, `delivery` (npcs.js), `mechanic` | **Aunt Mary (Cô Mary), Delivery person (Người giao hàng), Mechanic (Thợ sửa xe)** | `visitors` (Khách ghé thăm & Người lạ) | `modules/npcs.js` (`PEOPLE` dòng 56–60, `VISITORS` dòng 64, `V_ROOMS` dòng 135–139, `triggerVisitor` dòng 235–245) | `g.npc[data-npc="<id>"]` trong `#world`, `#peopleCard` | Kích hoạt qua `ELW_NPCS.triggerVisitor()` hoặc sự kiện `visitor_door` (`events.js:169-171`). |
| **4** | 11 khách ngẫu nhiên của `life-talk.js`:<br>`neighbor`, `delivery`, `oldfriend`, `tourist`, `regular`, `shopper`, `jogger`, `diner`, `hiker`, `classmate`, `monitor` | **Mrs. Park, Courier, Minh, Tourist, Sam, Shopper, Park Jogger, Food Critic, Mountain Hiker, Lan, Class Monitor** | `visitors` (Khách ghé thăm & Người lạ) | `modules/life-talk.js` (`VISITORS` dòng 265–299, `VISITOR_RULES` dòng 301–313)<br>`modules/context-engine.js` (`ROLE_STRANGER` dòng 147) | `#lt-visitor` (`g.npc[data-visitor="<id>"]` trong `#world`), hộp thoại `#ltCard`, `#ctx-3d-bubble` | **Cờ `S.visitors` mặc định `true` (`life-talk.js:21`)**! Bộ đếm `setInterval(tick, 1000)` (`life-talk.js:786, 796`) tự động gọi `visitor(false)` sau mỗi 90 giây với xác suất 40%, vẽ `#lt-visitor`, bung `#ltCard` và đọc TTS mà không hỏi người dùng. |
| **5** | Nhân viên chủ đề (Staff):<br>`barista`, `cashier`, `vendor`, `waiter`, `ranger`, `teacher` | **Barista, Cashier/Clerk, Ice Cream Vendor, Waiter/Chef, Park Ranger, English Teacher** | `staff` (Nhân viên tại các địa điểm) | `modules/life-talk.js` (`STAFF_WX` dòng 261)<br>`modules/context-engine.js` (`STAFF_BY_ZONE` dòng 46–66)<br>`index.html` (`NPC_TOPIC` dòng 1326) | Bong bóng `#lt-scene-bub`, `#ctx-3d-bubble`, `#sceneBubble` + giọng đọc TTS `ELW_VOICES.speak` | Tự động hiện bong bóng & đọc TTS sau 1500ms mỗi khi vào phòng (`life-talk.js:755-769`), sau khi thực hiện hành động (`index.html:1327, 1368`), hoặc khi đổi thời tiết/tình huống (`context-engine.js:1292, 1311`). |
| **6** | `dog` (Max) & `#ctx-dog` | **Max (Chú chó gia đình cũ)** / **Chó ngữ cảnh cũ** | `legacy_dog` (Thú phụ di sản — cần khóa hoàn toàn để nhường chỗ cho Pet 2.0) | `modules/npcs.js` (`dog` dòng 54, `FAMILY` dòng 63, `svgDog` dòng 356–367)<br>`modules/context-engine.js` (`ROLE_PET` dòng 145, `renderDogInScene` dòng 1071–1081) | `.npc.np-k-dog`, `.npc[data-npc="dog"]`, dòng trạng thái trong `#peopleCard` | Đã được `pet-interaction.js` (dòng 643–646, 1410) ẩn hình ảnh trong `#room`, nhưng **`"dog"` vẫn nằm trong mảng `FAMILY` (`npcs.js:63`)** nên vẫn xuất hiện trong danh sách `#peopleCard` (`renderPeoplePanel`, `npcs.js:439-466`) gây trùng lặp với Pet 2.0! |

---

### 2. Phân Tích Chi Tiết 5 Nguồn Kích Hoạt Nhân Vật Phụ Bất Ngờ (Exact Code Citations)

#### Nguồn 1: Hệ thống `ELW_LIFE` (`modules/life-talk.js`) — Khách ghé thăm tự động, Nhân viên tự nói & Tự bật Linh
1. **Khách ghé thăm ngẫu nhiên (`S.visitors = true` mặc định)**:
   - Tại `modules/life-talk.js` dòng 21:
     ```javascript
     let S = Object.assign({ v: 1, companion: false, score: { right: 0, total: 0 }, visitorEveryMs: 90000, visitors: true }, load());
     ```
   - Tại hàm `init` (`modules/life-talk.js` dòng 796): khởi chạy `timer = setInterval(tick, 1000);`.
   - Tại hàm `tick()` (`modules/life-talk.js` dòng 782–787):
     ```javascript
     function tick() {
       if (!host) return;
       const r = host.room();
       if (S.companion) renderFriend();
       if (S.visitors && !cardOpen && Date.now() - lastVisitor >= S.visitorEveryMs && Math.random() < .4 && !missionBusy()) visitor(false);
     }
     ```
   - Khi `visitor(false)` chạy (`modules/life-talk.js` dòng 606–626):
     - Gọi `renderVisitor(v)` (dòng 387–419) để chèn `<g id="lt-visitor" class="npc" data-visitor="...">` thẳng vào `#world`.
     - Gọi `openCard(...)` (dòng 540–576) làm bung bảng `#ltCard` (`c.hidden = false`, dòng 567) và gọi `speakLine(cfg.promptEn, cfg.who)` (dòng 575) phát âm thanh TTS ngay lập tức.
   - **Điểm mù**: Trên giao diện hoàn toàn **không có nút hay checkbox nào** để người dùng đặt `S.visitors = false`!

2. **Bình luận thời tiết tự động từ Nhân viên (`STAFF_WX`) và Linh khi chuyển phòng (`onRoomEnter`)**:
   - Tại `modules/life-talk.js` dòng 755–769 (`onRoomEnter(r)`):
     ```javascript
     clearTimeout(wxTimer);
     if (isHome(r)) return;
     wxTimer = setTimeout(() => {
       if (!host || host.room() !== r || cardOpen || missionBusy()) return;
       const w = host.weather();
       if (w && w !== "sunny" && WX[w]) {
         const l = pick(WX[w].lines);
         const staff = STAFF_WX[topicKey(r)] || "Staff";
         showSceneBubble(l.en, l.vi, staff, 4200, "staff");
         speakLine(l.en, staff);
         if (S.companion) wxTimer = setTimeout(() => {
           if (S.companion && !cardOpen) friendSay(pick(WX[w].lines));
         }, 350);
       }
     }, 1500);
     ```
   - Ngoài ra, trong `onAction(a)` (`modules/life-talk.js` dòng 719–729):
     - Khi hành động là `^go_`, tạo 2 `setTimeout(() => onRoomEnter(host.room()), 80)` và `650` **không lưu ID timer** (dòng 721).
     - Sau mọi hành động ở ngoài nhà, nếu `S.companion === true`, tạo `await new Promise(res => setTimeout(res, 220))` **không lưu ID timer** rồi gọi `friendSay(r)` (dòng 726–727).

3. **Tự động cưỡng bức bật Linh (`setCompanion(true)`) ngoài ý muốn**:
   - Tại `modules/context-engine.js` dòng 1260–1276 (sự kiện click `#ctxBtnTalkNow` — nút `"💬 Tán ngẫu ngay"`):
     - Nếu đang ở nhà (`isHomeRoom(W.room)`): gọi thẳng `root.ELW_LIFE.visitor()` (tức `visitor(true)`), ép sinh khách ghé thăm.
     - Nếu đang ở ngoài nhà: kiểm tra `if (!root.ELW_LIFE.companionOn()) { root.ELW_LIFE.setCompanion(true); ... }` rồi sau `120ms` gọi `askFriend()`. Như vậy bấm nút tán ngẫu sẽ **tự ý bật lại Linh** dù người dùng đã tắt.
   - Tại `index.html` dòng 2132:
     ```javascript
     M.start = function(id) {
       if (LIDS.includes(id) && !ELW_LIFE.companionOn()) {
         ELW_LIFE.setCompanion(true);
         const b = document.getElementById("ltBtnCompanion");
         if (b) b.dataset.on = "1";
       }
       return origStart(id);
     };
     ```
     Khi bắt đầu bất kỳ nhiệm vụ nào trong `LIDS` (`life_friend_3`, `life_visitor_2`, `life_weather_talk`, `life_politeness`, `life_streak_5`), code tự động ép bật Linh.

---

#### Nguồn 2: Hệ thống Gia đình & Khách trong nhà (`modules/npcs.js` + `index.html`)
1. **Luôn vẽ toàn bộ 8 thành viên `FAMILY` và `visitors` vào `#world` & `#peopleCard`**:
   - Tại `modules/npcs.js` dòng 63–64:
     ```javascript
     const FAMILY = ["dad", "mom", "grandpa", "grandma", "tom", "lily", "baby", "dog"];
     const VISITORS = ["guest", "delivery", "mechanic"];
     ```
   - Hàm `placements(phase, opts)` (`modules/npcs.js` dòng 204–233) duyệt toàn bộ `FAMILY` lấy lịch trình từ `SCHEDULE[ph]` (dòng 72–133) và duyệt `visitors` (dòng 210–217) để trả về danh sách NPC trong từng phòng.
   - Tại `index.html` dòng 2051–2055, hàm `renderPeople()` gọi `ELW_NPCS.render(world, W.room, ph, ...)` và `ELW_NPCS.renderPeoplePanel($id("peopleCard"), ...)`.
   - `renderPeople()` được gọi liên tục tại:
     - `index.html` dòng 2021: bên trong `onWorldAction(it, a)` sau **mọi hành động** của người chơi.
     - `index.html` dòng 2057: khi bấm nút đổi buổi `#dayPhaseBadge`.
     - `index.html` dòng 2068: `setTimeout(() => { renderFridgeCard(); renderPeople(); }, 350)` lúc mới vào trang.
     - `index.html` dòng 2089: `setInterval(..., 15000)` kiểm tra chuyển buổi mỗi 15 giây.
   - **Điểm mù**: `placements()`, `render()`, và `renderPeoplePanel()` hoàn toàn không kiểm tra xem người dùng có muốn hiển thị Gia đình (`family`) hay Khách (`visitors`) hay không. Đặc biệt `"dog"` (Max) vẫn nằm trong `FAMILY` nên luôn hiện thông tin trong `#peopleCard`.

---

#### Nguồn 3: Hệ thống Hội thoại Nhập vai tự động (`modules/roleplay.js` + `index.html`) — Thủ phạm gây gián đoạn lớn nhất
1. **Xác suất 60% tự bật hộp thoại `#rpCard` sau mỗi hành động ở nhà**:
   - Tại `index.html` dòng 2022–2024 (trong `onWorldAction`):
     ```javascript
     const sc = ELW_ROLEPLAY.shouldTrigger(a.id, { ...W, roleplayRunning: rpPlayer && rpPlayer.isRunning() }, rpHistory);
     if (sc) pendingScene = sc;
     ```
   - Tại `modules/roleplay.js` dòng 798–825 (`shouldTrigger(actionId, worldState, history)`):
     - Dòng 814: `const chance = 0.6; if (Math.random() > chance) return null;` — tới **60% cơ hội** kích hoạt sau một hành động khớp `trigger`!
     - Các bối cảnh trong `SCENES` (dòng 15–796) gắn với `dad`, `mom`, `grandpa`, `tom`, `lily`.
   - Tại `index.html` dòng 1289 (`pump()` kết thúc hàng đợi hành động) → gọi `afterQueueIdle()` (dòng 2025):
     ```javascript
     function afterQueueIdle() {
       if (pendingScene) {
         const sc = pendingScene;
         pendingScene = null;
         startScene(sc);
       }
     }
     ```
   - `startScene(sc)` (`index.html` dòng 2026–2030) lập tức mở `#rpCard` (`c.hidden = false`), gọi `rpPlayer.start(sc)`, cuộn trang xuống `#rpCard` (`c.scrollIntoView(...)`), và `rpPlayer` (`modules/roleplay.js` dòng 913) gọi `say(line.en, line.who)` phát giọng đọc TTS của nhân vật phụ!

---

#### Nguồn 4: Hệ thống Sự kiện khẩn cấp / Việc cần làm (`modules/events.js` & `modules/event-director.js` + `index.html`)
1. **Tự động phát sự kiện kèm giọng đọc NPC mỗi 30 giây (`modules/events.js`)**:
   - Tại `index.html` dòng 2058–2062: `ELW_EVENTS.init(...)` và `ELW_EVENTS.start()` được gọi tự động ngay khi mở ứng dụng.
   - Tại `modules/events.js` dòng 184: `DEF_SETTINGS = { v: 1, interval: 30, enabled: true, maxActive: 2, mode: "realtime" };` (`enabled` mặc định là `true`).
   - Tại `start()` (dòng 289–296): chạy `timer = setInterval(() => tick(), 1000);`.
   - Tại `tick(t)` (dòng 260–280): sau 20 giây đầu tiên (`t - startedAt < 20000`), cứ mỗi 30 giây gọi `spawn(pick, t)`.
   - Tại `spawn(d, t)` (dòng 222–233):
     - Hiển thị thông báo toast và thẻ sự kiện trong `#evTray` có tên & lời thoại của `mom`, `dad`, `grandpa`, `grandma`, `tom`, `lily` hoặc sự kiện khách gõ cửa `visitor_door` (dòng 169–171).
     - Dòng 231: `if (o.speak && d.npc && d.npc_line_en && o.speakLines) o.speak(d.npc_line_en, d.npc);` — tự động phát giọng nói TTS của NPC!
2. **Module dự phòng `modules/event-director.js`**:
   - Dù hiện tại chưa được gắn thẻ `<script>` trong `index.html`, file `modules/event-director.js` (dòng 316–317) cũng gán `root.ELW_EVENT_DIRECTOR = API; root.ELW_EVENTS = API;` và có hàm `scheduleNext()` (dòng 199–209) dùng `setTimeout` tự động kích hoạt sự kiện (`doorbell` — Shipper/Hàng xóm ở dòng 48–62). Cần khóa cổng cả ở file này để tránh phát sinh lỗi nếu được nạp trong tương lai.

---

#### Nguồn 5: Phản ứng NPC sau hành động & Tự phát câu thoại ngữ cảnh (`index.html`, `modules/context-engine.js`, `modules/family-npc.js`)
1. **Hàm `npcReplyOf(a)` và `showNpc(rp)` trong `index.html` (dòng 1325–1336, 1368, 1471)**:
   - Dòng 1325: `HOME_NPC_REPLIES = { sit_at_the_table: { who: "Mom", en: "Dinner is almost ready!", vi: "Bữa tối sắp xong rồi con!" } };`
   - Dòng 1326: `NPC_TOPIC` định nghĩa phản ứng của `Barista` (`cafe`), `Cashier` / `Clerk` (`market`), `Ice Cream Vendor` (`park`), `Waiter` / `Chef` (`restaurant`), `Park Ranger` / `Kayak Guide` (`outdoor`), `Teacher` / `School Librarian` (`school`).
   - Dòng 1368 (trong `execItem`): sau khi người chơi thực hiện hành động, tự động gọi `const rp = npcReplyOf(a); if (rp) await showNpc(rp);` → hiện bong bóng `#sceneBubble` và đọc TTS `ELW_VOICES.speak(rp.en, ...)`.
   - Dòng 1471 (trong `actClick`): gọi `waitTalk(t).then(() => showNpc(rp))` không kiểm tra cấu hình bật/tắt nhân vật phụ.
2. **Tự động sinh & đọc câu thoại nhân vật phụ trong `modules/context-engine.js`**:
   - Tại `getLiveContext()` (dòng 1022–1035): thuộc tính `withFamily: homeMode` (dòng 1033) bị gán cứng bằng `true` mọi lúc khi ở trong nhà.
   - Tại `pickPhrases(ctx)` (dòng 540–685): tự động trộn câu thoại của `ROLE_MOM` (dòng 558, 608), `staffRole` (`STAFF_BY_ZONE`, dòng 590–605), `ROLE_STRANGER` (dòng 619), và `ROLE_LINH` (dòng 572–586).
   - Tại sự kiện bấm đổi Thời tiết (`[data-cwx]`, dòng 1292–1293) và đổi Tình huống (`[data-csit]`, dòng 1311–1312): tự động gọi `if (picked[0]) triggerPhrase(picked[0]);`.
   - Tại `triggerPhrase(p)` (dòng 1084–1111): nếu câu đầu tiên là của `Mom`, `Linh`, `Staff`, hoặc `Stranger`, nó lập tức vẽ bong bóng 3D `#ctx-3d-bubble` và đọc TTS! Hơn nữa, ở dòng 1095 có `setTimeout(..., 250)` không lưu biến tham chiếu để hủy khi người dùng tắt nhân vật.

---

### 3. Tóm Tắt 6 Lỗ Hổng Kiến Trúc Hiện Tại Khiến Nhân Vật Phụ Vẫn Xuất Hiện Dù Không Chọn

1. **Thiếu Cổng Kiểm Soát Tập Trung (No Central Gatekeeper)**: Mỗi module (`npcs.js`, `life-talk.js`, `roleplay.js`, `events.js`, `context-engine.js`, `index.html`) tự quyết định việc vẽ SVG, bung thẻ hội thoại và phát TTS mà không hỏi một API cấu hình chung.
2. **Cờ mặc định bật ngầm (`S.visitors = true`, `events.enabled = true`, `withFamily = true`, `roleplay chance = 0.6`)**: Người dùng mới vào ứng dụng hoặc chỉ muốn tương tác với Pet đều bị `life-talk.js` (mỗi 90s), `events.js` (mỗi 30s) và `roleplay.js` (60% sau mỗi hành động) làm phiền.
3. **Hành vi "Cưỡng bức bật lại" (Forced Re-enable)**: Nút `#ctxBtnTalkNow` (`context-engine.js:1268-1273`) và hàm `M.start` (`index.html:2132`) tự ý gọi `ELW_LIFE.setCompanion(true)` mà không tôn trọng thiết lập tắt của người dùng.
4. **Timer bất đồng bộ mồ côi (Orphaned Timers & Promises)**: Các `setTimeout` trong `life-talk.js` (`wxTimer` dòng 757, `onAction` dòng 721 & 726), `context-engine.js` (`triggerPhrase` dòng 1095), `index.html` (`waitTalk(t).then(() => showNpc(rp))` dòng 1471) và biến `pendingScene` (`index.html` dòng 1179, 2023) vẫn nổ sau khi người dùng đã chuyển trạng thái hoặc tắt nhân vật.
5. **Dọn dẹp nửa vời khi tắt (Incomplete Teardown)**: `ELW_LIFE.setCompanion(false)` (`life-talk.js:801-815`) không hủy `wxTimer`, không đóng `#ltCard` nếu đang mở, và không ngắt TTS đang đọc dở.
6. **Rò rỉ nhân vật `"dog"` (Max) cũ trong `npcs.js`**: Dù hình vẽ chó cũ trên sân khấu đã bị CSS/DOM ẩn đi, `"dog"` vẫn nằm trong mảng `FAMILY` (`npcs.js:63`), khiến bảng `#peopleCard` vẫn liệt kê `"Max (Chú chó)"` bên cạnh hệ thống Pet 2.0.

---

## PHẦN B — THIẾT KẾ KỸ THUẬT: "CHECKBOX BẬT/TẮT TỪNG NHÂN VẬT PHỤ" TRONG CẤU HÌNH NGỮ CẢNH

### 1. Thiết Kế Giao Diện (UI) Trong Cấu Hình Ngữ Cảnh (`#ctxBar` & `#topicSheet`)

#### 1.1. Danh sách các Checkbox điều khiển (Đầy đủ Nhóm & Từng nhân vật)
Trong khu vực **Cấu hình Ngữ cảnh** (`#ctxBar` tại `modules/context-engine.js` dòng 1122–1182 và đồng bộ trong modal `#topicSheet` tại `index.html` dòng 604–624), bổ sung cụm điều khiển **"👥 Quản lý Nhân vật phụ (Side Characters)"** gồm:

1. **Nút/Checkbox Tổng (Master Toggle)**:
   - `[ ] Tắt hết nhân vật phụ (Chỉ mình tôi & Thú cưng)` (`muteAllSideChars`: khi bật chế độ này hoặc bỏ chọn toàn bộ, khóa sạch 100% nhân vật phụ).
2. **4 Checkbox Nhóm chính (Quick Group Checkboxes)** hiển thị trực tiếp trên thanh `#ctxBar` (gọn gàng, trực quan) kèm nút mở Popover/Drawer chi tiết từng nhân vật:
   - `[ ] 👧 Bạn đồng hành Linh` (`group_companion` → điều khiển `linh`)
   - `[ ] 👨‍👩‍👧‍👦 Gia đình trong nhà` (`group_family` → điều khiển chung & cho phép tick lẻ từng người: `mom` Mẹ, `dad` Bố, `grandpa` Ông, `grandma` Bà, `tom` Anh Tom, `lily` Bé Lily, `baby` Em bé Ben; kèm tùy chọn phụ `family_roleplay` "Tự động bắt chuyện nhập vai" và `family_events` "Sự kiện việc nhà")
   - `[ ] 🚪 Khách ghé thăm & Người lạ` (`group_visitors` → điều khiển toàn bộ khách ở nhà `guest`, `delivery`, `mechanic`, sự kiện `visitor_door` và 11 khách ngoài phố của `life-talk.js`: `neighbor`, `oldfriend`, `tourist`, `regular`, `shopper`, `jogger`, `diner`, `hiker`, `classmate`, `monitor`)
   - `[ ] 🧑‍🍳 Nhân viên địa điểm (Staff)` (`group_staff` → điều khiển phản ứng & câu thoại của `barista`, `cashier`, `vendor`, `waiter`, `ranger`, `teacher`)
3. **Quy tắc riêng cho `"dog"` (Max) cũ**:
   - Loại bỏ hoàn toàn `"dog"` khỏi mảng `FAMILY` trong `modules/npcs.js` (dòng 63) để vĩnh viễn không bao giờ sinh `.npc[data-npc="dog"]` hay hiện dòng `"Max"` trong `#peopleCard`. Mọi tương tác thú cưng do hệ thống **Pet 2.0** đảm nhiệm độc quyền.

#### 1.2. Giá trị mặc định an toàn (Safe Default)
- Чтобы tránh làm phiền người học khi chưa chủ động bật:
  - `linh` (`group_companion`): **`false`** (Tắt mặc định — chỉ bật khi người dùng tự tick chọn Checkbox Linh).
  - `group_visitors`: **`false`** (Tắt mặc định — chấm dứt hoàn toàn việc khách tự nhảy ra sau 90 giây).
  - `family_roleplay` (tự bung `#rpCard` 60% sau hành động): **`false`** (Tắt mặc định — chỉ chạy khi người dùng tick bật hoặc bấm trực tiếp vào NPC gia đình trên sân khấu).

---

### 2. Cấu Trúc Lưu Trữ `localStorage` (`elw_ctx_v1` mở rộng & tương thích ngược)

Mở rộng đối tượng `state` trong `modules/context-engine.js` (dòng 996–1019, lưu tại khóa `STORAGE_KEY = "elw_ctx_v1"`) với trường `sideChars`:

```javascript
// Trong modules/context-engine.js
const DEFAULT_SIDE_CHARS = {
  muteAll: false,          // Nếu true: khóa tuyệt đối mọi nhân vật phụ
  groups: {
    companion: false,      // Bạn đồng hành Linh (mặc định TẮT)
    family: true,          // Hiển thị thành viên gia đình trong nhà
    familyRoleplay: false, // Tự động bung #rpCard sau hành động (mặc định TẮT)
    familyEvents: false,   // Tự động bắn sự kiện NPC trong #evTray (mặc định TẮT)
    visitors: false,       // Khách ghé thăm & người lạ ngẫu nhiên (mặc định TẮT)
    staff: true            // Nhân viên tại quán cafe/siêu thị/trường học...
  },
  characters: {
    // Companion
    linh: false,
    // Family members (trong npcs.js, roleplay.js, events.js, context-engine.js)
    dad: true,
    mom: true,
    grandpa: true,
    grandma: true,
    tom: true,
    lily: true,
    baby: true,
    // Home Visitors & Life-talk Visitors
    guest: false,
    delivery: false,
    mechanic: false,
    neighbor: false,
    oldfriend: false,
    tourist: false,
    regular: false,
    shopper: false,
    jogger: false,
    diner: false,
    hiker: false,
    classmate: false,
    monitor: false,
    // Location Staff
    barista: true,
    cashier: true,
    vendor: true,
    waiter: true,
    ranger: true,
    teacher: true
  }
};
```

- **Đồng bộ hai chiều với `elw_life_talk_v1` và `elw_events_v1`**:
  - Mỗi khi `sideChars` thay đổi và gọi `saveState()`, `context-engine.js` đồng bộ ngay:
    - `ELW_LIFE.setCompanion(isSideCharacterEnabled("linh"))`
    - `ELW_LIFE.setVisitorsEnabled(isSideCharacterEnabled("group_visitors"))`
    - `ELW_EVENTS.saveSettings({ enabled: isSideCharacterEnabled("family_events") })`

---

### 3. Thiết Kế Central Gatekeeper API: `ELW_CONTEXT.isSideCharacterEnabled(idOrRole)`

Bổ sung vào `window.ELW_CONTEXT` (`modules/context-engine.js` dòng 1397–1411) bộ API kiểm soát tập trung:

```javascript
/**
 * Kiểm tra một nhân vật phụ hoặc nhóm nhân vật phụ có được phép xuất hiện/nói chuyện không.
 * @param {string} idOrRole - Mã nhân vật (vd: 'linh', 'mom', 'dad', 'neighbor', 'barista', 'dog')
 *                            hoặc mã nhóm ('group_companion', 'group_family', 'group_visitors', 'group_staff',
 *                            'family_roleplay', 'family_events')
 * @returns {boolean}
 */
function isSideCharacterEnabled(idOrRole) {
  if (!idOrRole) return false;
  const key = String(idOrRole).trim().toLowerCase();

  // 1. Chó cũ 'dog' (Max) luôn bị khóa để nhường chỗ cho Pet 2.0
  if (key === "dog" || key === "ctx-dog" || key === "legacy_dog") return false;

  // 2. Nếu bật chế độ "Tắt hết nhân vật phụ"
  if (state.sideChars && state.sideChars.muteAll) return false;

  const g = (state.sideChars && state.sideChars.groups) || DEFAULT_SIDE_CHARS.groups;
  const c = (state.sideChars && state.sideChars.characters) || DEFAULT_SIDE_CHARS.characters;

  // 3. Kiểm tra theo mã nhóm
  if (key === "group_companion" || key === "companion" || key === "linh" || key === "friend") {
    return Boolean(g.companion && c.linh);
  }
  if (key === "group_family" || key === "family") {
    return Boolean(g.family);
  }
  if (key === "family_roleplay") {
    return Boolean(g.family && g.familyRoleplay);
  }
  if (key === "family_events") {
    return Boolean(g.family && g.familyEvents);
  }
  if (key === "group_visitors" || key === "visitors" || key === "stranger" || key === "visitor_door") {
    return Boolean(g.visitors);
  }
  if (key === "group_staff" || key === "staff") {
    return Boolean(g.staff);
  }

  // 4. Kiểm tra từng thành viên gia đình
  const FAMILY_IDS = ["dad", "mom", "grandpa", "grandma", "tom", "lily", "baby", "brother"];
  if (FAMILY_IDS.includes(key)) {
    const mappedKey = key === "brother" ? "tom" : key;
    return Boolean(g.family && c[mappedKey] !== false);
  }

  // 5. Kiểm tra từng khách ghé thăm / người lạ
  const VISITOR_IDS = [
    "guest", "delivery", "mechanic", "neighbor", "oldfriend",
    "tourist", "regular", "shopper", "jogger", "diner", "hiker", "classmate", "monitor"
  ];
  if (VISITOR_IDS.includes(key)) {
    return Boolean(g.visitors && c[key] !== false);
  }

  // 6. Kiểm tra nhân viên theo tên hoặc chức danh tiếng Anh (Barista, Cashier, Clerk, Waiter, Chef...)
  const STAFF_ALIAS = {
    barista: "barista",
    cashier: "cashier",
    clerk: "cashier",
    "ice cream vendor": "vendor",
    vendor: "vendor",
    waiter: "waiter",
    chef: "waiter",
    "park ranger": "ranger",
    "kayak guide": "ranger",
    ranger: "ranger",
    teacher: "teacher",
    "english teacher": "teacher",
    "school librarian": "teacher"
  };
  if (STAFF_ALIAS[key]) {
    const staffKey = STAFF_ALIAS[key];
    return Boolean(g.staff && c[staffKey] !== false);
  }

  return false;
}
```

#### Mọi điểm sinh nhân vật phụ BẮT BUỘC gọi `ELW_CONTEXT.isSideCharacterEnabled(...)`:
1. **`modules/npcs.js`**:
   - Trong `placements(phase, opts)` (dòng 204): lọc `FAMILY` và `visitors` qua `window.ELW_CONTEXT?.isSideCharacterEnabled(id)`.
   - Trong `triggerVisitor(kind, room)` (dòng 235): nếu `!window.ELW_CONTEXT?.isSideCharacterEnabled(kind)` thì `return null`.
   - Trong `renderPeoplePanel(container, phase, currentRoom, onSelectRoom)` (dòng 439): chỉ hiển thị các nhân vật đang `isSideCharacterEnabled(p.id) === true`. Nếu danh sách rỗng, ẩn hoặc hiện thông báo nhẹ `"Đang ở chế độ yên tĩnh (Chỉ mình bạn & Thú cưng)"`.
2. **`modules/life-talk.js`**:
   - Trong `tick()` (dòng 782): kiểm tra `ELW_CONTEXT?.isSideCharacterEnabled("linh")` trước khi `renderFriend()`, và kiểm tra `ELW_CONTEXT?.isSideCharacterEnabled("group_visitors")` trước khi gọi `visitor(false)`.
   - Trong `visitor(force)` (dòng 606): kiểm tra `ELW_CONTEXT?.isSideCharacterEnabled("group_visitors")` và lọc `pool` chỉ giữ những visitor `v` thỏa `ELW_CONTEXT?.isSideCharacterEnabled(v.id)`.
   - Trong `onRoomEnter(r)` (dòng 755): kiểm tra `ELW_CONTEXT?.isSideCharacterEnabled("group_staff")` trước khi cho `STAFF_WX` hiện bong bóng/nói, và kiểm tra `ELW_CONTEXT?.isSideCharacterEnabled("linh")` trước khi gọi `friendSay`.
   - Trong `onAction(a)` (dòng 716): kiểm tra lại `ELW_CONTEXT?.isSideCharacterEnabled("linh")` cả trước và **sau** `await new Promise(...)` (dòng 726) trước khi gọi `friendSay(r)`.
3. **`modules/roleplay.js` & `index.html`**:
   - Trong `shouldTrigger(actionId, worldState, history)` (`roleplay.js` dòng 798):
     - Nếu `!window.ELW_CONTEXT?.isSideCharacterEnabled("family_roleplay")` → `return null`.
     - Khi lọc `candidates` (dòng 805): thêm điều kiện `window.ELW_CONTEXT?.isSideCharacterEnabled(sc.npc)`.
   - Trong `afterQueueIdle()` và `startScene(sc)` (`index.html` dòng 2025–2030): kiểm tra lại `ELW_CONTEXT?.isSideCharacterEnabled("family_roleplay") && ELW_CONTEXT?.isSideCharacterEnabled(sc.npc)` trước khi mở `#rpCard`.
4. **`modules/events.js` & `modules/event-director.js`**:
   - Trong `tick(t)` và `spawn(d, t)` (`events.js` dòng 222, 260):
     - Nếu sự kiện là `visitor_door`: kiểm tra `ELW_CONTEXT?.isSideCharacterEnabled("group_visitors")`.
     - Nếu sự kiện có `d.npc`: kiểm tra `ELW_CONTEXT?.isSideCharacterEnabled("family_events") && ELW_CONTEXT?.isSideCharacterEnabled(d.npc)`.
5. **`index.html` (`npcReplyOf` / `showNpc`) & `modules/context-engine.js` (`pickPhrases` / `triggerPhrase`)**:
   - Trong `npcReplyOf(a)` (`index.html` dòng 1327): kiểm tra `ELW_CONTEXT?.isSideCharacterEnabled(rp.who)` — nếu `false` thì trả về `null`.
   - Trong `showNpc(rp)` (`index.html` dòng 1329): đầu hàm kiểm tra lại `if (!window.ELW_CONTEXT?.isSideCharacterEnabled(rp.who)) return;`.
   - Trong `pickPhrases(ctx)` (`context-engine.js` dòng 540):
     - Chỉ lấy câu có `ROLE_MOM` nếu `isSideCharacterEnabled("mom")`.
     - Chỉ lấy câu có `ROLE_LINH` nếu `isSideCharacterEnabled("linh")`.
     - Chỉ lấy câu có `staffRole` nếu `isSideCharacterEnabled("group_staff")`.
     - Chỉ lấy câu có `ROLE_STRANGER` nếu `isSideCharacterEnabled("group_visitors")`.

---

### 4. Cơ Chế Huỷ Tức Thì (Immediate Teardown) Khi Người Dùng Bỏ Chọn (Untick)

Khi người dùng bỏ chọn một nhân vật hoặc một nhóm nhân vật trên giao diện, hàm `ELW_CONTEXT.teardownSideCharacter(targetIdOrGroup)` phải được gọi **ngay lập tức trong cùng chu kỳ sự kiện (synchronously)** để thực hiện 5 bước dọn dẹp triệt để:

1. **Hủy toàn bộ Timer & Hàng đợi chờ (Cancel Pending Timers/Queues)**:
   - Trong `modules/life-talk.js`: gọi hàm mới `ELW_LIFE.abortSideCharTimers(target)` để `clearTimeout(wxTimer)`, `clearTimeout(ltBubTimer)`, hủy các timer chuyển phòng `goTimers[]` và tăng `actionToken` để vô hiệu hóa mọi `await new Promise(res => setTimeout(res, 220))` đang chờ trong `onAction` (dòng 726).
   - Trong `modules/context-engine.js`: `clearTimeout(bub3DTimer)` (dòng 1040) và `clearTimeout(replyDelayTimer)` (timer 250ms tại `triggerPhrase` dòng 1095).
   - Trong `index.html`: nếu `pendingScene` (dòng 1179) thuộc về nhân vật vừa bị tắt (hoặc tắt `family_roleplay`), gán ngay `pendingScene = null`.
   - Trong `modules/events.js`: lọc mảng `active` (dòng 189), xóa ngay các sự kiện của nhân vật vừa tắt và gọi `renderTray()`.
2. **Xóa ngay phần tử SVG/HTML khỏi Sân khấu (`#world` & `#peopleCard`)**:
   - Nếu tắt `linh` (`group_companion`): xóa `#lt-friend` khỏi `#world`.
   - Nếu tắt `group_visitors` hoặc một visitor cụ thể: xóa `#lt-visitor[data-visitor="..."]` và `.npc[data-npc="..."]` khỏi `#world`.
   - Nếu tắt `group_family` hoặc thành viên gia đình (`dad`, `mom`...): xóa `.npc[data-npc="<id>"]` khỏi `#world` và gọi lại `renderPeople()` (`index.html:2051`) để cập nhật ngay `#peopleCard`.
3. **Ẩn ngay Bong bóng thoại & Đóng Hộp thoại tương tác đang mở**:
   - Ẩn `#lt-scene-bub` (`life-talk.js`), `#ctx-3d-bubble` (`context-engine.js`), `#sceneBubble` (`index.html` dòng 1295 `hideBub()`).
   - Nếu `#ltCard` đang mở (`cardOpen === true` trong `life-talk.js` dòng 23) cho nhân vật vừa bị tắt (`friend` hoặc `visitor`), gọi ngay `closeCard()` (`life-talk.js` dòng 578–582) để ẩn `#ltCard` và xóa `#lt-visitor`.
   - Nếu `#rpCard` đang chạy (`rpPlayer.isRunning()` trong `roleplay.js` dòng 899) với nhân vật vừa bị tắt, gọi `rpPlayer.stop()` và ẩn `#rpCard.hidden = true`.
4. **Ngắt ngay âm thanh TTS đang phát của nhân vật đó**:
   - Gọi `window.speechSynthesis && window.speechSynthesis.cancel()` (hoặc `ELW_VOICES.stop()`) để giọng đọc của nhân vật phụ dừng ngay lập tức, không đọc nốt câu đang nói dở.
5. **Làm mới danh sách câu gợi ý ngữ cảnh**:
   - Gọi `renderContextBar()` và `refreshContextPhrases()` (`context-engine.js` dòng 1351) để loại bỏ ngay các thẻ câu nói đóng vai nhân vật vừa bị tắt.

---

### 5. Đảm Bảo Chế Độ "Tắt Hết Tất Cả Nhân Vật Phụ" (Zero-Side-Character Safe Mode)

Khi người dùng bật **"Tắt hết nhân vật phụ"** (`muteAll = true` hoặc bỏ chọn cả 4 nhóm `companion`, `family`, `visitors`, `staff`):
1. **Không lỗi Console (`0 Console Errors`)**: Mọi lời gọi hàm từ `index.html` sang `ELW_NPCS`, `ELW_LIFE`, `ELW_ROLEPLAY`, `ELW_EVENTS`, `ELW_CONTEXT` đều rút lui an toàn (graceful no-op), không quăng lỗi `null` hay `undefined`.
2. **Sân khấu `#room` / `#world` chỉ còn Người chơi (`#char`) và Thú cưng Pet 2.0 (`#o-cat`)**:
   - Không có bất kỳ thẻ `<g class="npc">`, `#lt-friend`, `#lt-visitor`, hay `#ctx-dog` nào trong SVG.
   - Bảng `#peopleCard` hiển thị trạng thái gọn gàng hoặc tự thu gọn, không liệt kê NPC.
3. **Nút `"💬 Tán ngẫu ngay"` (`#ctxBtnTalkNow`) thích ứng thông minh**:
   - Thay vì tự ý bật lại Linh hoặc ép gọi Visitor như code cũ (`context-engine.js:1260-1276`), khi toàn bộ nhân vật phụ đang tắt, nút này sẽ chuyển thành **"🐾 Trò chuyện với Thú cưng"** (gọi `ELW_PET_INTERACTION.triggerPetTalk()` hoặc hiển thị toast hướng dẫn người dùng bật nhân vật phụ nếu muốn tán ngẫu với NPC).
4. **Hoạt động học tiếng Anh & chăm sóc Pet 2.0 diễn ra bình thường 100%**:
   - Người chơi bấm vào mọi đồ vật trong phòng, nghe phát âm câu hành động của bản thân (`ELW_VOICES.speak`), làm nhiệm vụ hằng ngày, cho Pet ăn/uống/chơi/ngủ/dạo phố mà không bị bất kỳ hộp thoại `#ltCard`, `#rpCard` hay `#evTray` nào nhảy ra cắt ngang.

---

### 6. Danh Sách Chính Xác Các File & Hàm Cần Sửa Ở Giai Đoạn Triển Khai

| STT | File cần sửa | Các hàm / Vị trí dòng cần chỉnh sửa | Nội dung thay đổi cụ thể |
| :--- | :--- | :--- | :--- |
| **1** | `modules/context-engine.js` | - `loadState` / `saveState` (dòng 996–1019)<br>- `getLiveContext` (dòng 1022–1035)<br>- `pickPhrases` (dòng 540–685)<br>- `triggerPhrase` (dòng 1084–1111)<br>- `renderContextBar` (dòng 1122–1349)<br>- Export `window.ELW_CONTEXT` (dòng 1397–1411) | - Thêm `DEFAULT_SIDE_CHARS` vào `state.sideChars`.<br>- Thêm `isSideCharacterEnabled(id)`, `setSideCharacterEnabled(id, bool)`, `setMuteAllSideChars(bool)`, `teardownSideCharacter(id)`.<br>- Sửa `getLiveContext()` để `withFamily` phụ thuộc vào `isSideCharacterEnabled("group_family")`.<br>- Lọc `pickPhrases()` theo `isSideCharacterEnabled`.<br>- Lưu `replyDelayTimer` ở dòng 1095 để hủy được khi teardown.<br>- Bổ sung UI Checkboxes bật/tắt nhóm & từng nhân vật phụ vào `#ctxBar`, sửa `#ctxBtnTalkNow` (dòng 1260–1276) không tự ý gọi `setCompanion(true)` hay `visitor()`. |
| **2** | `modules/life-talk.js` | - Khởi tạo `S` (dòng 21)<br>- `visitor` (dòng 606–626)<br>- `onAction` (dòng 716–730)<br>- `onRoomEnter` (dòng 755–769)<br>- `tick` (dòng 782–787)<br>- `setCompanion` (dòng 801–815)<br>- Export `ELW_LIFE` (dòng 836–850) | - Đổi mặc định `visitors: false` (dòng 21).<br>- Thêm cổng `ELW_CONTEXT.isSideCharacterEnabled(...)` vào `tick`, `visitor`, `onRoomEnter`, `onAction`.<br>- Lưu mảng `pendingTimers` cho các `setTimeout` trong `onAction` (dòng 721, 726) và thêm hàm `teardown(target)` xóa `#lt-friend`/`#lt-visitor`, ẩn `#lt-scene-bub`, đóng `#ltCard`, hủy `wxTimer` và dừng TTS. |
| **3** | `modules/npcs.js` | - `FAMILY` (dòng 63)<br>- `placements` (dòng 204–233)<br>- `triggerVisitor` (dòng 235–245)<br>- `render` (dòng 394–430)<br>- `renderPeoplePanel` (dòng 439–466) | - Xóa `"dog"` khỏi mảng `FAMILY` (dòng 63).<br>- Trong `placements()`, lọc `FAMILY` và `visitors` qua `ELW_CONTEXT.isSideCharacterEnabled(id)`.<br>- Trong `triggerVisitor()`, chặn nếu `!isSideCharacterEnabled(kind)`.<br>- Trong `renderPeoplePanel()`, lọc danh sách hiển thị và hỗ trợ xóa tức thì `.npc[data-npc="<id>"]`. |
| **4** | `modules/roleplay.js` | - `shouldTrigger` (dòng 798–825)<br>- `RoleplayPlayer` (dòng 888–945) | - Chặn đầu hàm `shouldTrigger` nếu `!ELW_CONTEXT.isSideCharacterEnabled("family_roleplay")`; lọc `candidates` theo `isSideCharacterEnabled(sc.npc)`.<br>- Bổ sung phương thức `rpPlayer.abortIfNpcDisabled(npcId)` để đóng `#rpCard` và ngắt TTS ngay khi người dùng bỏ tick NPC. |
| **5** | `modules/events.js` & `modules/event-director.js` | - `DEF_SETTINGS` (`events.js` dòng 184)<br>- `spawn` & `tick` (`events.js` dòng 222–280)<br>- `scheduleNext` (`event-director.js` dòng 199) | - Kiểm tra `ELW_CONTEXT.isSideCharacterEnabled` cho `d.npc` và `visitor_door` trước khi `spawn`.<br>- Thêm hàm `purgeDisabledNpcEvents()` để xóa ngay các thẻ sự kiện trong `#evTray` của NPC vừa bị tắt. |
| **6** | `index.html` | - `npcReplyOf` & `showNpc` (dòng 1327–1336)<br>- `actClick` (dòng 1471)<br>- `onWorldAction`, `afterQueueIdle`, `startScene` (dòng 2020–2030)<br>- `M.start` wrapper (dòng 2131–2136) | - Chặn `npcReplyOf` và `showNpc` nếu `!ELW_CONTEXT.isSideCharacterEnabled(rp.who)`.<br>- Trong `afterQueueIdle` và `startScene`, kiểm tra lại `isSideCharacterEnabled` trước khi mở `#rpCard`.<br>- Xóa bỏ đoạn tự động gọi `ELW_LIFE.setCompanion(true)` trong `M.start` (dòng 2132). |

---

## PHẦN C — KẾ HOẠCH KIỂM THỬ 12 MỤC (QA TEST PLAN — MỤC 11 GIAI ĐOẠN 4)

Dưới đây là đặc tả kiểm thử chi tiết cho toàn bộ **12 hạng mục bắt buộc** tại Mục 11 (Giai đoạn 4) của Master Prompt. Kế hoạch này được thiết kế để có thể chạy tự động bằng **Playwright** kết hợp kiểm tra trực quan trên trình duyệt.

---

### Test 01 — Kiểm thử Di trú Dữ liệu (Storage Migration & Backward Compatibility)
- **Test ID**: `PET2-QA-01`
- **Mục tiêu**: Đảm bảo dữ liệu người dùng cũ từ `elw_pet_needs_v1`, `elw_pet_v1`, và `elw_pet_needs_v2` được di trú (migrate) sang cấu trúc lưu trữ Pet 2.0 mới mà không mất cấp độ, XP, tên thú cưng, thú cưng đang chọn hay lịch sử chăm sóc.
- **Các bước thực hiện / Playwright Check**:
  1. Dùng `page.evaluate()` bơm dữ liệu giả lập của phiên bản cũ vào `localStorage`:
     ```javascript
     localStorage.removeItem("elw_pet_needs_v2");
     localStorage.setItem("elw_pet_needs_v1", JSON.stringify({
       activePetId: "mochi",
       pets: { mochi: { xp: 380, level: 4, hunger: 85, thirst: 90, mood: 80, energy: 75, bond: 45, streakDays: 5 } }
     }));
     ```
  2. Reload trang (`await page.reload()`).
  3. Đọc lại trạng thái từ `window.ELW_PET_NEEDS.getState()` và `localStorage.getItem("elw_pet_needs_v2")`.
  4. Lặp lại bài test với khóa cổ điển `elw_pet_v1` và khóa `elw_pet_needs_v2` có sẵn dữ liệu.
- **Kết quả kỳ vọng**:
  - `activePetId` giữ nguyên là `"mochi"`.
  - Điểm `xp` (`380`), `hunger` (`85`), `thirst` (`90`), `mood` (`80`), `energy` (`75`), `bond` (`45`), `streakDays` (`5`) được bảo toàn 100%.
  - Cấp trưởng thành (Stage 1→5) được ánh xạ chính xác từ `level` / `xp` cũ (`xp: 380` → Stage 4 `Adult`).
- **Tiêu chí Pass/Fail**: **PASS** nếu không mất bất kỳ trường dữ liệu nào và không phát sinh lỗi `SyntaxError`/`TypeError` khi parse JSON cũ; **FAIL** nếu bị reset về Pet mặc định (`milu` cấp 1, `xp: 0`).

---

### Test 02 — Kiểm thử Tiến hóa 5 Cấp Trưởng Thành (`Baby` → `Young` → `Teen` → `Adult` → `Elite/Bonded`)
- **Test ID**: `PET2-QA-02`
- **Mục tiêu**: Xác minh thú cưng tiến hóa chính xác qua 5 cấp trưởng thành (`Stage 1: Baby`, `Stage 2: Young`, `Stage 3: Teen`, `Stage 4: Adult`, `Stage 5: Elite/Bonded`) khi đạt mốc XP/Bond quy định, đồng thời kích hoạt hiệu ứng ăn mừng tiến hóa (Evolution Celebration Modal/Toast + Particle + Âm thanh).
- **Các bước thực hiện / Playwright Check**:
  1. Khởi tạo Pet ở `Stage 1 (Baby)` (`xp = 0`).
  2. Lần lượt tăng XP qua API `ELW_PET_NEEDS.addXp(...)` hoặc thực hiện hành động học/chăm sóc để vượt qua từng ngưỡng:
     - Cấp 1 (`Baby`): `0 XP`
     - Cấp 2 (`Young`): `50 XP`
     - Cấp 3 (`Teen`): `150 XP`
     - Cấp 4 (`Adult`): `350 XP`
     - Cấp 5 (`Elite/Bonded`): `700 XP`
  3. Tại mỗi lần vượt ngưỡng, kiểm tra sự kiện `elw:pet-stage-up` / `elw:pet-level-up`, kiểm tra hiển thị huy hiệu cấp độ trên Pet Bar / Care Modal, và kiểm tra kích thước/hình ảnh tiến hóa trên sân khấu `#room`.
- **Kết quả kỳ vọng**:
  - Tên giai đoạn (`Baby` / `Young` / `Teen` / `Adult` / `Elite`), thanh tiến trình XP, tỉ lệ scale (`#catScale`) và phụ kiện/hào quang tiến hóa trên `#o-cat` cập nhật tức thì ở cả 5 mốc.
- **Tiêu chí Pass/Fail**: **PASS** nếu cả 5 cấp chuyển đổi đúng mốc XP, hiển thị hiệu ứng tiến hóa và cập nhật hình ảnh; **FAIL** nếu kẹt cấp, sai mốc XP hoặc không cập nhật giao diện.

---

### Test 03 — Kiểm thử Khác biệt Hình ảnh 5 Cấp × 10 Thú Cưng (50 Biến thể Visual/SVG/Sprite)
- **Test ID**: `PET2-QA-03`
- **Mục tiêu**: Đảm bảo toàn bộ 10 thú cưng (`milu`, `mochi`, `boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`) đều có sự khác biệt thị giác rõ rệt giữa 5 cấp trưởng thành (tổng cộng 50 tổ hợp `10 pets × 5 stages`): thay đổi tỉ lệ cơ thể (`scale`), chi tiết ngoại hình/vương miện/khăn quàng/vòng cổ/hiệu ứng hào quang (`stage visual traits`), không bị lỗi ảnh vỡ (`broken image` / `404`).
- **Các bước thực hiện / Playwright Check**:
  1. Viết vòng lặp Playwright duyệt qua 10 `petId` × 5 `stage` (1→5).
  2. Ở mỗi tổ hợp `(petId, stage)`:
     - Kiểm tra phần tử `#o-cat` trong `#room` và avatar trong Pet Panel.
     - Kiểm tra `naturalWidth > 0` (nếu dùng `<img>`) hoặc sự tồn tại của các lớp/nhóm SVG đặc trưng cấp độ (`data-pet-stage="1..5"`, phụ kiện cấp `Teen`/`Adult`/`Elite`).
     - Chụp/so sánh chữ ký DOM/SVG hoặc bounding box scale giữa cấp `n` và cấp `n+1` của cùng một thú cưng.
- **Kết quả kỳ vọng**:
  - Tất cả 50 tổ hợp đều render thành công, không có bất kỳ request ảnh nào bị `404`.
  - Mỗi cấp `1 → 2 → 3 → 4 → 5` của cùng một pet có thuộc tính hình ảnh / scale / trang sức tiến hóa khác biệt nhau rõ ràng (`signature(stage_i) !== signature(stage_i+1)`).
- **Tiêu chí Pass/Fail**: **PASS** nếu 50/50 tổ hợp hiển thị đầy đủ và phân biệt được 5 cấp; **FAIL** nếu có bất kỳ cấp nào giống hệt cấp trước hoặc lỗi mất hình.

---

### Test 04 — Kiểm thử 10 Trạng thái Cảm xúc & Hành vi (10 States Verification)
- **Test ID**: `PET2-QA-04`
- **Mục tiêu**: Xác minh cả 10 trạng thái trong `STATES` (`idle_happy`, `curious`, `playful`, `eating`, `drinking`, `sleepy`, `tired`, `sad_lonely`, `excited`, `walking_adventure`) hoạt động đúng logic chuyển đổi và hiển thị đúng animation/biểu cảm.
- **Các bước thực hiện / Playwright Check**:
  1. Dùng `ELW_PET_NEEDS` và `ELW_PET_INTERACTION` kích hoạt tuần tự từng trạng thái trong 10 trạng thái:
     - Cho ăn → `eating`; Cho uống → `drinking`; Chơi đùa → `playful` / `excited`; Đi sang phòng ngoài trời/công viên → `walking_adventure`; Khám phá đồ vật → `curious`; Hạ `energy < 25` → `tired` / `sleepy`; Hạ `mood < 25` hoặc bỏ bê lâu → `sad_lonely`; Chỉ số cân bằng cao → `idle_happy`.
  2. Kiểm tra `data-pet-state` trên `#o-cat` và biểu cảm/animation tương ứng trong `modules/pet-anim.js`.
- **Kết quả kỳ vọng**:
  - Cả 10 trạng thái đều được kích hoạt đúng điều kiện, cập nhật nhãn trạng thái song ngữ EN/VI trên UI và thay đổi animation trên `#o-cat`.
- **Tiêu chí Pass/Fail**: **PASS** khi 10/10 trạng thái hoạt động trơn tru; **FAIL** nếu thiếu trạng thái hoặc animation bị đơ.

---

### Test 05 — Kiểm thử Đi theo Người chơi & Tương tác Đồ vật trong Phòng (`pet-follow.js`)
- **Test ID**: `PET2-QA-05`
- **Mục tiêu**: Kiểm tra thú cưng di chuyển mượt mà theo nhân vật chính (`#char`) trong không gian `#room` (`1000×640`), biết quay mặt (`#catFlip`) đúng hướng di chuyển, và phản ứng khi người chơi tương tác với các đồ vật trong từng phòng (`living`, `kitchen`, `bedroom`, `bathroom`, `garden`, `cafe`, `park`...).
- **Các bước thực hiện / Playwright Check**:
  1. Ghi nhận tọa độ ban đầu `(x0, y0)` của `#catPos` trong `#room`.
  2. Click vào một đồ vật ở xa nhân vật chính (ví dụ: tủ lạnh ở `kitchen` hoặc ghế sofa ở `living`).
  3. Đợi `600ms–1200ms`, đọc lại tọa độ `(x1, y1)` của `#catPos` và hướng lật của `#catFlip`.
  4. Chuyển sang phòng khác (`kitchen` → `garden` → `park`) và kiểm tra vị trí spawn hợp lệ của `#o-cat` trong viewBox `1000×640`.
- **Kết quả kỳ vọng**:
  - `(x1, y1)` dịch chuyển về phía nhân vật chính với khoảng cách hợp lý (không đè lên người chơi, không văng ra ngoài khung `0..1000, 0..640`).
  - Khi người chơi làm hành động (nấu ăn, ngủ, tắm, đọc sách), thú cưng có phản ứng phụ họa tương ứng.
- **Tiêu chí Pass/Fail**: **PASS** nếu Pet đi theo mượt, tọa độ luôn nằm trong biên an toàn của phòng; **FAIL** nếu Pet đứng im một chỗ hoặc bay ra ngoài khung SVG.

---

### Test 06 — Kiểm thử Chu kỳ Ngày/Đêm & Thời tiết Ảnh hưởng đến Thú Cưng
- **Test ID**: `PET2-QA-06`
- **Mục tiêu**: Kiểm tra thú cưng phản ứng tự nhiên với buổi trong ngày (`morning`, `noon`, `afternoon`, `evening`, `night` từ `ELW_DAY`) và thời tiết (`sunny`, `rainy`, `cold`, `hot` từ `ELW_CONTEXT`).
- **Các bước thực hiện / Playwright Check**:
  1. Chuyển buổi sang `night` (`ELW_DAY` / `#dayPhaseBadge`) → kiểm tra Pet chuyển sang trạng thái ngáp/buồn ngủ (`sleepy`) hoặc giảm tốc độ tiêu hao năng lượng khi ngủ.
  2. Chuyển thời tiết sang `hot` (Nóng) khi ở ngoài trời → kiểm tra chỉ số khát (`thirst`) giảm nhanh hơn hoặc Pet hiện bong bóng nhắc uống nước (`"I'm thirsty!"`).
  3. Chuyển thời tiết sang `rainy` (Mưa) hoặc `cold` (Lạnh) → kiểm tra câu thoại/biểu cảm phản ứng thời tiết của Pet.
- **Kết quả kỳ vọng**:
  - Pet thay đổi hành vi, câu thoại song ngữ EN/VI và tốc độ biến thiên chỉ số hợp lý theo buổi và thời tiết.
- **Tiêu chí Pass/Fail**: **PASS** nếu có phản ứng rõ ràng với cả thay đổi buổi (`night`/`morning`) và thời tiết (`hot`/`rainy`/`cold`); **FAIL** nếu Pet hoàn toàn vô cảm với thời gian và thời tiết.

---

### Test 07 — Kiểm thử Cơ chế Offline Decay nhân văn (Giới hạn 6 giờ & Sàn an toàn 25, Không chết)
- **Test ID**: `PET2-QA-07`
- **Mục tiêu**: Đảm bảo khi người chơi tắt web đi ngủ hoặc vắng mặt nhiều ngày, thú cưng **không bao giờ chết hoặc về 0 điểm**, thời gian tính suy giảm tối đa chỉ **6 giờ (`MAX_OFFLINE_DECAY_MS = 21,600,000 ms`)** và mọi chỉ số dừng lại ở **mức sàn tối thiểu `25` (`OFFLINE_FLOOR = 25`)**.
- **Các bước thực hiện / Playwright Check**:
  1. Đặt chỉ số hiện tại của Pet là `hunger: 60, thirst: 60, mood: 60, energy: 60` và chỉnh `lastTickAt = Date.now() - (72 * 3600 * 1000)` (giả lập người chơi vắng mặt **72 giờ / 3 ngày**).
  2. Reload trang hoặc gọi hàm tính toán offline decay.
  3. Kiểm tra lại 4 chỉ số `hunger`, `thirst`, `mood`, `energy` của Pet.
  4. Kiểm tra trường hợp Pet vốn đang có chỉ số thấp hơn 25 (ví dụ `hunger: 15`) trước khi offline 48 giờ.
- **Kết quả kỳ vọng**:
  - Với Pet có chỉ số `60` sau 72 giờ offline: tất cả các chỉ số đều `>= 25` (`OFFLINE_FLOOR`), tuyệt đối không bị tụt về `0`.
  - Với Pet vốn có `hunger: 15 < 25`: giữ nguyên `15` (không bị tụt sâu thêm và cũng không bị lỗi tăng ngược).
  - Không có trạng thái "Pet chết" hay mất cấp độ/XP.
- **Tiêu chí Pass/Fail**: **PASS** nếu mọi chỉ số tuân thủ tuyệt đối trần 6 giờ và sàn `25`; **FAIL** nếu bất kỳ chỉ số nào tụt xuống `< 25` do offline decay.

---

### Test 08 — Kiểm thử Mở khóa Toàn bộ 8 Pet Premium bằng Mã `"6789"`
- **Test ID**: `PET2-QA-08`
- **Mục tiêu**: Xác minh luồng mở khóa 2 Pet miễn phí (`milu`, `mochi`) mặc định và mở khóa toàn bộ 8 Pet Premium (`boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`) khi người dùng nhập mã `"6789"` (hoặc đủ thành tích học tập).
- **Các bước thực hiện / Playwright Check**:
  1. Xóa khóa `elw_topics_v1` và `elw_pet_reward_ledger_v2` trong `localStorage`, reload trang.
  2. Kiểm tra `milu` và `mochi` ở trạng thái mở khóa (`unlocked`), 8 pet còn lại có biểu tượng khóa (`locked`).
  3. Mở hộp thoại `#topicSheet` (hoặc ô nhập mã `#tsCode`), nhập `"6789"` và bấm `#tsUnlockBtn` (`index.html` dòng 2108–2119).
  4. Mở lại bảng chọn Pet và thử chọn lần lượt cả 8 Pet Premium (`boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`).
- **Kết quả kỳ vọng**:
  - Sau khi nhập `"6789"`, `ELW_PET_REWARDS.isPremiumUnlocked()` trả về `true`.
  - Toàn bộ 10/10 Pet đều cho phép bấm chọn làm thú cưng đồng hành ngay lập tức mà không bị chặn.
- **Tiêu chí Pass/Fail**: **PASS** nếu mã `"6789"` mở khóa tức thì cả 8 Pet Premium và chọn được từng con; **FAIL** nếu vẫn bị khóa hoặc phải reload thủ công mới nhận.

---

### Test 09 — Kiểm thử Bật/Tắt Từng Nhân Vật Phụ & Hủy Tức Thì (Side-Character Checkboxes & Immediate Teardown)
- **Test ID**: `PET2-QA-09`
- **Mục tiêu**: Kiểm tra cơ chế Checkbox bật/tắt từng nhóm và từng nhân vật phụ trong Cấu hình Ngữ cảnh (`#ctxBar`), đảm bảo nhân vật bị bỏ chọn **biến mất ngay lập tức** và **không bao giờ tự xuất hiện lại**.
- **Các bước thực hiện / Playwright Check**:
  1. **Kiểm thử tắt Linh (`linh`)**:
     - Tick bật Checkbox `Linh` → xác nhận `#lt-friend` xuất hiện trên sân khấu khi ở ngoài nhà (`cafe`/`park`).
     - Bỏ tick Checkbox `Linh` ngay khi Linh đang hiện bong bóng thoại → xác nhận `#lt-friend` bị xóa khỏi DOM trong `< 50ms`, bong bóng `#lt-scene-bub` ẩn ngay, `#ltCard` (nếu đang mở) đóng ngay.
     - Bấm nút `#ctxBtnTalkNow` hoặc bắt đầu nhiệm vụ `life_friend_3` → xác nhận Linh **không bị tự động bật lại**.
  2. **Kiểm thử tắt Khách ghé thăm (`group_visitors`)**:
     - Bỏ tick `Khách ghé thăm & Người lạ` → tua nhanh thời gian hoặc gọi thử `ELW_LIFE.visitor(false)` và `ELW_NPCS.triggerVisitor("delivery", "living")` → xác nhận `#lt-visitor` không được sinh ra và `#ltCard` không mở.
  3. **Kiểm thử bật/tắt lẻ từng thành viên Gia đình (`dad`, `mom`, `grandpa`, `grandma`, `tom`, `lily`, `baby`)**:
     - Ở phòng `living`/`kitchen`, bỏ tick riêng `Mom` nhưng giữ `Dad` → xác nhận `.npc[data-npc="mom"]` biến mất ngay khỏi `#world` và `#peopleCard`, trong khi `.npc[data-npc="dad"]` vẫn hiển thị bình thường.
  4. **Kiểm thử Chế độ "Tắt hết nhân vật phụ" (`muteAll`)**:
     - Bật `Tắt hết nhân vật phụ`, thực hiện 20 hành động liên tiếp ở cả trong nhà và ngoài phố, đổi thời tiết, đổi tình huống → xác nhận không có bất kỳ NPC, Visitor, Roleplay `#rpCard`, hay Event `#evTray` nào xuất hiện.
- **Kết quả kỳ vọng**:
  - Mọi thao tác tick/untick có hiệu lực tức thì trên DOM, âm thanh và bộ đếm hẹn giờ; lưu bền vững qua `localStorage` khi reload trang.
- **Tiêu chí Pass/Fail**: **PASS** nếu không có bất kỳ nhân vật phụ nào lọt qua cổng `isSideCharacterEnabled` khi đã tắt; **FAIL** nếu còn sót hình SVG, còn sót bong bóng chữ hoặc timer nổ muộn sau khi đã bỏ chọn.

---

### Test 10 — Kiểm thử Tương thích Giao diện Mobile & Desktop (Responsive UI Layout)
- **Test ID**: `PET2-QA-10`
- **Mục tiêu**: Đảm bảo thanh Pet 2.0, Modal chăm sóc/tiến hóa Pet, thanh Cấu hình Ngữ cảnh chứa Checkboxes nhân vật phụ và sân khấu `#room` hiển thị chuẩn xác, không tràn màn hình (no horizontal overflow), không che khuất nút bấm trên cả Desktop và Mobile.
- **Các bước thực hiện / Playwright Check**:
  1. Đặt viewport Desktop (`1280×800`) và kiểm tra:
     - `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
     - Các nút chăm sóc Pet (Ăn, Uống, Chơi, Ngủ, Đổi Pet) và Checkboxes nhân vật phụ có thể click được (`isVisible()`, không bị phần tử khác đè lên).
  2. Đặt viewport Mobile (`390×844` — iPhone 14) và Tablet (`768×1024`):
     - Mở Pet Care Modal, Evolution Preview và bảng Checkboxes nhân vật phụ.
     - Kiểm tra các nút bấm có kích thước vùng chạm tối thiểu hợp lý và đóng/mở mượt mà.
- **Kết quả kỳ vọng**:
  - Giao diện hiển thị cân đối, chữ tiếng Việt có dấu không bị lỗi font hay cắt dòng mất chữ ở mọi kích thước màn hình.
- **Tiêu chí Pass/Fail**: **PASS** nếu không bị tràn ngang và mọi nút chức năng đều bấm được trên cả `1280×800` và `390×844`; **FAIL** nếu hộp thoại bị khuất nút đóng hoặc vỡ khung trên mobile.

---

### Test 11 — Kiểm thử Hiệu năng (60fps, Quản lý Bộ nhớ & Timer)
- **Test ID**: `PET2-QA-11`
- **Mục tiêu**: Đảm bảo hệ thống Pet 2.0 (với 5 cấp tiến hóa, animation idle/follow, particle) và hệ thống kiểm soát nhân vật phụ không gây rò rỉ bộ nhớ (memory leak), không nhân đôi `setInterval`/`requestAnimationFrame`, giữ tốc độ khung hình mượt mà.
- **Các bước thực hiện / Playwright Check**:
  1. Chuyển đổi liên tục giữa 10 thú cưng và 5 cấp độ (50 lần đổi), chuyển qua lại 8 phòng (20 lần) và bật/tắt checkbox nhân vật phụ 20 lần.
  2. Đếm số lượng node DOM trong `#world` và `#room` trước và sau chuỗi thao tác.
  3. Đo thời gian phản hồi frame (`requestAnimationFrame` delta) trong 3 giây khi Pet đang di chuyển theo người chơi.
- **Kết quả kỳ vọng**:
  - Số lượng node `<g class="npc">` hoặc phần tử con của `#o-cat` không bị tích tụ tăng dần sau mỗi lần chuyển phòng/đổi pet.
  - Không có hiện tượng giật lag (frame drop nặng) khi Pet di chuyển.
- **Tiêu chí Pass/Fail**: **PASS** nếu số lượng DOM node ổn định và animation mượt; **FAIL** nếu nhân bản DOM node hoặc rò rỉ timer sau mỗi lần chuyển phòng.

---

### Test 12 — Kiểm thử Không Lỗi Console & Không Lỗi Mạng (Zero Console Error & Zero 404 Asset Check)
- **Test ID**: `PET2-QA-12`
- **Mục tiêu**: Đảm bảo toàn bộ quá trình khởi động, di trú dữ liệu, tiến hóa 5 cấp, đổi 10 thú cưng, tương tác đồ vật và bật/tắt nhân vật phụ đạt chuẩn **0 Console Error, 0 Uncaught Page Error, 0 Failed Network Request (404/500)**.
- **Các bước thực hiện / Playwright Check**:
  1. Gắn listener ngay từ đầu kịch bản Playwright:
     ```javascript
     const errors = [];
     page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
     page.on("pageerror", err => errors.push(err.message));
     page.on("response", res => { if (res.status() >= 400) errors.push(`${res.status()} ${res.url()}`); });
     ```
  2. Chạy xuyên suốt các kịch bản từ `PET2-QA-01` đến `PET2-QA-11`.
  3. Kiểm tra mảng `errors.length === 0`.
- **Kết quả kỳ vọng**:
  - `errors` hoàn toàn trống (`[]`).
- **Tiêu chí Pass/Fail**: **PASS** khi `errors.length === 0`; **FAIL** nếu xuất hiện dù chỉ 1 lỗi `ReferenceError`, `TypeError`, `console.error` hoặc `404 Not Found`.
