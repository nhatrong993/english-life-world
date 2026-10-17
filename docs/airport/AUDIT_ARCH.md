# AUDIT KIẾN TRÚC ỨNG DỤNG CHÍNH — ENGLISH LIFE WORLD
**Tài liệu:** `docs/airport/AUDIT_ARCH.md`  
**Phụ trách:** Agent P1-A (Phase 1 — Architecture Audit)  
**Đối chiếu yêu cầu:** `docs/airport/AIRPORT_MASTER_PROMPT.md`

---

## TỔNG QUAN KIẾN TRÚC THỰC TẾ

**English Life World** là ứng dụng web tĩnh thuần Vanilla JavaScript (ES6+), SVG 2.5D và CSS3 (không dùng bundler Webpack/Vite hay framework React/Vue).
- **Entry point chính:** `index.html` (2.343 dòng) chứa toàn bộ CSS gốc, khung SVG `#room` của phòng khách (`living`), dữ liệu gốc của phòng khách, bộ điều phối chuỗi hành động, trình dựng đoạn văn, SRS và script khởi tạo.
- **Hệ thống module:** 46 file script trong `modules/*.js` gắn trực tiếp vào namespace toàn cục `window.ELW_*` theo thứ tự `<script src="...">` trong `index.html:613-661`.
- **Trạng thái thế giới (`W`):** Lưu tập trung trong biến toàn cục `W` (`index.html:1096`, khởi tạo từ `W0` tại `index.html:1093-1095`), phản chiếu ra DOM qua `applyState()` (`index.html:1143-1169`) và `ROOMS[id].applyState(W, world)` (`modules/rooms.js:18`).

---

## 1. DỰNG CẢNH SVG `viewBox="0 0 1000 640"`, ROOMS / TOPIC / ZONES & Z-ORDER `data-base`

### 1.1. Khung cảnh SVG 2.5D & cấu trúc lớp (`index.html`, `modules/world-3d.js`)
- `index.html:262`: Thẻ `<svg id="room" viewBox="0 0 1000 640">` cố định hệ tọa độ logic `1000×640` cho mọi phòng và chủ đề. Tường sau nằm ở `y ∈ [0, 330]`, sàn nhà 2.5D hình thang từ `y = 330` đến `y = 640` (`index.html:273-275`).
- Ba lớp nhóm chính bên trong `<svg id="room">`:
  1. `<g id="shell-living">` (`index.html:271-329`): Tường, sàn, phào chỉ và 33 chi tiết trang trí tĩnh (`data-detail`) của phòng khách.
  2. `<g id="shell-other">` (`index.html:330`): Vỏ phòng động (nạp `r.shellSvg` khi chuyển sang phòng khác ngoài `living`).
  3. `<g id="world">` (`index.html:331-593`): Chứa mọi đồ vật tương tác `.obj`, prop slot (`#cupSlot`, `#milkSlot`, `#bookSlot`, `#broomSlot`, `#remoteSlot`), lớp phủ tối `#livDim` (`data-base="9000"`), thú cưng `#o-cat` (`index.html:525`), nhân vật chính `#char` (`index.html:569`), và các NPC.
- `modules/world-3d.js:338-386` (`ELW_WORLD3D.init` → `setup3DStage`): Bọc `<svg id="room">` trong `.w3d-stage-wrap` với `perspective: 1350px` và nghiêng `rotateX(5.5deg) rotateY(-1.5deg)` theo chuột (`mousemove`), tạo hiệu ứng 3D Diorama.

### 1.2. Quản lý Rooms, Topics và Multi-Zone (`index.html`, `modules/rooms*.js`, `modules/topic-*.js`)
- **Nạp & hợp nhất danh sách phòng:**
  - `modules/rooms.js:1156-1158`: Khởi tạo `window.ELW_ROOMS = { kitchen, bedroom }` và hàm helper `mirrorState(W, W0, root)` (`modules/rooms.js:18`) gắn từng khóa trạng thái lên `#world` dưới dạng attribute `data-<key>="<value>"` để CSS phản ứng.
  - `modules/rooms2.js:1452-1453`: Gộp thêm `{ bathroom, garage, garden }` vào `window.ELW_ROOMS`.
  - `modules/details.js:13-426`: Bổ sung thêm các đồ vật chi tiết cho 6 phòng ở nhà vào `window.ELW_ROOMS`.
  - `modules/topic-cafe.js:1264` & `modules/topic-cafe-zones.js:2407-2425`: Xóa phòng đơn `cafe` cũ, đăng ký 4 zone: `cafe_counter`, `cafe_bar`, `cafe_seating`, `cafe_terrace` (cùng thuộc `topic: "cafe"`, sắp thứ tự bằng `zoneOrder: 1..4`).
  - `modules/topic-market.js:1178-1180` & `modules/topic-market-zones.js:4309-4321`: Xóa phòng đơn `market` cũ, đăng ký 5 zone: `market_entrance`, `market_produce`, `market_dairy`, `market_meat`, `market_checkout` (`topic: "market"`, `zoneOrder: 1..5`).
  - Các chủ đề 1 phòng (single-zone + `TOPIC_AREAS` chip): `modules/topic-park.js:1827` (`park`), `modules/topic-restaurant.js:1699` (`restaurant`), `modules/topic-outdoor.js:1705` (`outdoor`), `modules/topic-school.js:1609` (`school`).
- **Hàm điều hướng & dựng phòng trong `index.html`:**
  - `index.html:1042` (`roomTopic(id)`): Trả về `(ROOMS[id] && ROOMS[id].topic) || "home"`.
  - `index.html:1047-1051`: Vòng lặp hợp nhất `r.objects`, `r.actions`, `r.props` của mọi phòng trong `window.ELW_ROOMS` vào bảng `OBJECTS`, `ACTIONS`, `PROP_SVG`, `ROOM_OBJECTS`, `ROOM_ACTIONS`.
  - `index.html:1062-1066` & `1081-1083`: Dùng `Object.defineProperty` trên `OBJECTS[k]` và `ACT[id]` để phân giải động đồ vật/hành động trùng tên theo `W.room` hoặc `roomTopic(W.room)`.
  - `index.html:2009-2028` (`renderTabs()`): Dựng thanh chuyển phòng/zone `#roomTabs`. Nếu chủ đề có nhiều phòng/zone (`home`, `cafe`, `market`) thì dựng nút `[data-room]` kích hoạt `enqueue("go_" + room)`; nếu chủ đề chỉ có 1 phòng nhưng khai báo `TOPIC_AREAS` (`index.html:2000-2008`) thì dựng thêm các `.area-chip[data-area-obj]` để chọn và nhấp nháy (`pulse`) đồ vật đại diện khu vực.
  - `index.html:2030-2047` (`renderRoom()`): Ẩn/hiện `#shell-living` và các phần tử `[data-room="living"]`; nếu ở phòng khác thì xóa `[data-room]:not([data-room=living])`, đổ `r.shellSvg` vào `#shell-other`, parse `r.worldSvg` gắn vào `#world`, gắn sự kiện click qua `bindObj(e)`.
  - `index.html:2048-2050` (`switchRoom(id, tk)`): Làm mờ `#room` (`opacity = 0`, chờ 260ms), gán `W.room = id`, gọi `renderRoom()`, đặt nhân vật tại tọa độ cửa `ROOMS[id].entry` (hoặc `{x:120, y:600, d:1}` cho `living`), gọi `applyState()`, rồi hiện lại `#room`.
  - `index.html:2286-2312` (`window.ELW_TOPICS`): Quản lý modal chọn chủ đề `#topicSheet`, mã mở khóa `"6789"` (`index.html:2301`) và hàm `enterTopic(id)` (`index.html:2305-2307`).

### 1.3. Z-Order Painter's Algorithm với `data-base` (`index.html`)
- `index.html:1142` (`sortDepth()`):
  ```js
  function sortDepth(){
    const kids=[...world.children].filter(e=>e.dataset&&e.dataset.base);
    kids.sort((a,b)=>+a.dataset.base-+b.dataset.base);
    kids.forEach(k=>world.appendChild(k));
  }
  ```
- Cơ chế: SVG không có `z-index` CSS, nên mỗi phần tử con trực tiếp của `#world` gắn `data-base="<y_đáy>"` (ví dụ cửa sổ `100`, tủ lạnh `362`, bàn `522`, ghế `528`, lớp phủ tối `#livDim` `9000`). Mỗi khi nhân vật di chuyển (`placeChar()` tại `index.html:1140-1141`), `charG.dataset.base` được cập nhật bằng `W.y + (W.sitting ? 3 : 0)` rồi gọi `sortDepth()` để `appendChild` lại theo thứ tự tăng dần của `data-base`.

---

## 2. NHÂN VẬT: `moveTo` / `route` / `OBST` / `placeChar` / `charScale` & `pose`

### 2.1. Cấu trúc SVG nhân vật, tỷ lệ phối cảnh & đặt vị trí (`index.html`)
- `index.html:569-592`: Nhóm SVG `<g id="char" class="idle" data-base="420">` gồm bóng đổ `<ellipse>`, nhóm lật hướng `<g id="flip">`, nhóm nhún `<g id="bob">`, hai chân `.legs` (`.legB`, `.legF`), thân trên `#upper`, tay `#arm` và điểm gắn đồ cầm tay `<g id="hand">`.
- `index.html:1139` (`charScale(y)`): Tính tỷ lệ phóng theo chiều sâu phối cảnh 2.5D:
  ```js
  function charScale(y){ return 0.95 + (y - 330) / 310 * 0.5; }
  ```
- `index.html:1140-1141` (`placeChar()`): Nhân `charScale(W.y) * 1.25`, cập nhật `transform="translate(W.x, W.y) scale(s)"` trên `#char`, lật hướng ngang `scale(W.dir, 1)` trên `#flip`, cập nhật `charG.dataset.base` và gọi `sortDepth()`.

### 2.2. Vật cản `OBST`, tìm đường `route` / `routeLiving` và di chuyển `moveTo` (`index.html`)
- `index.html:1206-1208` (`OBST`): Khai báo các hình chữ nhật chặn đường `{x1, x2, y1, y2}` theo phòng:
  - Phòng khách (`living`): `[TABLE_BOX, SOFA_BOX]`.
  - Các phòng khác: chép từ `r.obstacles` trong `window.ELW_ROOMS`.
- `index.html:1209-1210` (`inBox(p, B, pad)`, `crossesBox(a, b, B, pad)`): Kiểm tra điểm nằm trong hộp vật cản hoặc đoạn thẳng `a → b` cắt qua hộp vật cản (bằng cách lấy mẫu 25 điểm với bước `t += 0.04`).
- `index.html:1212-1218` (`routeLiving(a, b)`): Thuật toán tìm đường **Dijkstra** trên đồ thị góc vật cản mở rộng biên `m = 13px` quanh tất cả hộp trong `OBST.living` (giới hạn `y ∈ [338, 630]`).
- `index.html:1219-1221` (`route(a, b, rm)`):
  - Nếu ở phòng `living`, dùng `routeLiving(a, b)`.
  - Ở các phòng khác, nếu đoạn `a → b` cắt vật cản `B`, tạo đường vòng 3 đoạn qua làn trên (`B.y1 - 14`) hoặc làn dưới (`B.y2 + 14`).
- `index.html:1224-1236` (`moveTo(spot, tk)`):
  - Nhận điểm đích `spot = {x, y, d}` từ bảng `SPOTS` (`index.html:1102-1125`) và mã phiên `tk` (`token`).
  - Bật class `.walk` trên `#char`, `W.walk = true`, chạy vòng lặp `requestAnimationFrame` nội suy mượt theo hàm easing bậc hai (`e = k < .5 ? 2*k*k : ...`) với thời lượng `dur = dist / 0.45` ms.
  - Mỗi frame kiểm tra `if (tk !== token) return res()` và gọi `alive(tk)` (`index.html:1223`) để hủy tức thì (`throw new Abort()`) nếu người chơi bấm Reset/Tạm dừng/Chuyển chuỗi.
  - Khi tới đích: gỡ `.walk`, gán hướng nhìn `W.dir = spot.d || W.dir`, gọi `placeChar()`.
- `index.html:1237-1248` (`window.ELW_SCENE`): Xuất API công khai `getW`, `getCharState`, `route`, `getObstacles`, `inBox`, `crossesBox`, `charScale`, `sortDepth`, `isCatInteractionActive`, `getWeather` cho các module phụ (như `pet-follow.js`, `life-talk.js`).

### 2.3. Tư thế `pose` & thực thi chuỗi bước nguyên tử `runSeq` (`index.html`)
- `index.html:1249-1252` (`pose(name, ms)`): Quản lý 10 class tư thế trên `#char`: `["reach", "bend", "drink", "pour", "sweep", "wipe", "water", "point", "read", "pet"]` (kèm CSS keyframe tại `index.html:30-48, 151-155`). Giữ nguyên class `.sit` / `.lie` / `.onsofa` (được điều khiển bởi `applyState()` tại `index.html:1163, 1201`).
- `index.html:1255-1274` (`runSeq(steps, tk)`): Máy thực thi 13 mã lệnh nguyên tử trong `a.seq()`:
  - `["walk", spotKey]`, `["pose", name, ms]`, `["wait", ms]`, `["set", key, val]`, `["take", propName]`, `["place", propName, locKey]`, `["spawn", tempProp]`, `["despawn"]`, `["sit"]`, `["stand"]`, `["room", roomId]`, `["sip"]`, `["face", spotKey]`, `["activity", name]`, `["fx", effectName, ms]`.

---

## 3. HÀNG ĐỢI HÀNH ĐỘNG `enqueue` → `execItem`, TRẠNG THÁI & `findFixer` / `isAlready`

### 3.1. Cấu trúc hàng đợi & vòng đời thực thi (`index.html`)
- `index.html:1282-1284`: Biến toàn cục `queue = []`, `paused = false`, `pumping = false`, `uidN = 1`, `running = false`. Mỗi phần tử tạo bởi `mkItem(id)` có cấu trúc:
  `{ uid, id, status: "pending" | "running" | "done" | "blocked" | "cancelled", why: "", ctx: null, auto: false }`.
- `index.html:1285` (`enqueue(id)`): Đẩy `mkItem(id)` vào cuối `queue`, gọi `renderSeq()`, và nếu `!paused` thì gọi `pump()`.
- `index.html:1286-1293` (`pump()`): Vòng lặp `while (!paused && tk === token)` lấy phần tử đầu tiên có `status === "pending"` và `await execItem(it, tk)`. Khi hàng đợi cạn:
  - Gọi `renderSeq()`, `renderStory()`, `renderObject()`.
  - Nếu `narr.mode === "after"`, gọi `speakStory()`.
  - Gọi `afterQueueIdle()` (`index.html:2158`) và `ELW_MISSION.onIdle()` (`modules/mission.js:256`).

### 3.2. Chi tiết luồng `execItem(it, tk)` (`index.html:1356-1394`)
1. **Chặn nhảy chủ đề tự động (`index.html:1361-1363`):** Nếu hành động không phải `go_*` mà thuộc `roomTopic` khác với phòng hiện tại thì đánh dấu `status = "blocked"`.
2. **Tự động chèn bước đứng dậy & chuyển phòng (`index.html:1365-1367`):**
   - Nếu đang ngồi (`W.sitting`) và hành động cần đi sang phòng khác hoặc không nằm trong tập `SIT_OK` (`index.html:987-992`): tự tạo `mkItem("get_up")` với `g.auto = true`, chèn vào `queue` ngay trước `it` và `await execItem(g, tk)`.
   - Nếu hành động ở phòng khác cùng chủ đề (`a.room !== W.room`): tự chèn `mkItem("go_" + a.room)` với `g.auto = true` và thực thi trước.
3. **Kiểm tra điều kiện tiên quyết (`index.html:1368-1369`):**
   - Kiểm tra khóa nhiệm vụ: `mg = (window.ELW_MISSION && !it.auto) ? ELW_MISSION.guard(a.id, W) : null`.
   - Kiểm tra điều kiện thế giới: `why = mg || a.pre()`.
4. **Nhánh `isAlready(why)` (`index.html:1354, 1371-1375`):**
   - `const isAlready = w => !!w && /rồi\.?\s*$/.test(w) && !/\(/.test(w);`
   - Nếu `why` kết thúc bằng chữ `"rồi."` và không chứa gợi ý trong ngoặc đơn `( ... )`, đồng thời không có trong `ALREADY_FIX`: đánh dấu `it.status = "done"`, `it.already = true`, chỉ hiện bong bóng + đọc câu (`sayBubble(a)`) mà không chạy lại `runSeq`.
5. **Nhánh tự động sửa điều kiện `findFixer(id, why)` (`index.html:1296-1304, 1377-1379`):**
   - Hỗ trợ tối đa 3 bước đệ quy (`(it.fixDepth || 0) < 3`):
     - Nếu `why` báo `"Tay đang cầm..."`: tra `HAND_DROP[W.hand]` (`cup → put_cup_on_table`, `book → put_book_on_table`, `milk → put_milk_back`) hoặc tìm hành động `put_/hang_/return_` trong cùng chủ đề.
     - Tra bảng `ALREADY_FIX` (`set_the_table → clear_the_table`).
     - Quét regex `/\(([A-Za-z][^()]*)\)\s*\.?\s*$/` trong chuỗi `why` (ví dụ `"Hãy mở tủ lạnh trước (Open the fridge)."` → tìm action có `label.toLowerCase() === "open the fridge"` trong cùng chủ đề).
   - Nếu tìm thấy `fx`: chèn `mkItem(fx)` với `g.helper = true`, `g.fixDepth = (it.fixDepth || 0) + 1` vào trước `it` và chạy `await execItem(g, tk)`.
6. **Thực thi chính (`index.html:1381-1393`):**
   - Đặt `it.status = "running"`, chụp snapshot `it.ctx = { watching, sitting, cupLevel, milkFromFridge }`.
   - Hiện bong bóng `charSay(a.sentence)` và phát âm song song `it.talk = narrate(a)`.
   - Chạy `await runSeq(a.seq(it.targetRoom), tk)`, đặt `it.status = "done"`, gọi `onWorldAction(it, a)` (`index.html:2145-2157`), chờ `await waitTalk(it.talk)`, hiển thị phản hồi NPC `showNpc(rp)` (`index.html:1349`) và phản hồi bạn đồng hành `ELW_LIFE.onAction(a.id, W)`.

> [!WARNING]
> **Nguyên nhân gốc rễ lỗi hành động lặp lại (đã xác minh tại `index.html:1554-1555`):**  
> Khi người chơi bấm nút hành động trong `#panel`, hàm `actClick(id)` kiểm tra `actStatus(id)` (`index.html:1554`):
> ```js
> function actStatus(id){
>   const q=queue.filter(x=>x.id===id&&!x.auto);
>   if(q.some(x=>x.status==="pending"||x.status==="running"))return"pending";
>   if(q.some(x=>x.status==="done"))return"done";
>   return null;
> }
> ```
> Vì `queue` giữ toàn bộ lịch sử hành động đã `"done"` để dựng `"Đoạn văn của tôi"`, ngay khi một hành động (ví dụ `open_fridge`) đã có 1 mục `status === "done"` trong `queue`, `actStatus("open_fridge")` luôn trả về `"done"` — kể cả sau khi người chơi đã đóng tủ lạnh (`W.fridge === "closed"`). Khi đó, bấm lại nút chính `[data-act="open_fridge"]` bị `actClick(id)` chặn ở nhánh `if (st) { charSay(a.sentence); ... return; }` (chỉ đọc lại câu thoại, không gọi `enqueue(id)`), buộc người chơi phải bấm nút phụ `↻` (`[data-redo]`, `index.html:1582, 1586`) mới chạy lại được hành động.

---

## 4. ĐỒ VẬT & BẢNG HÀNH ĐỘNG UI

### 4.1. Đăng ký đồ vật (`OBJECTS`), đạo cụ (`PROP_SVG`, `LOCS`) và hành động (`ACTIONS`)
- `index.html:689-714` (`PROP_SVG`, `LOCS`, `slotOf`, `makeProp`): Định nghĩa các đạo cụ di động (`cup`, `milk`, `book`, `broom`, `remote`, `cloth`, `can`, `catfood`, `jug`, `wand`, `brush`) và tọa độ đặt đồ theo vị trí (`counter`, `table`, `fridge`, `floor`, `wall`, `sofa`). Khi `W[name] === "hand"`, phần tử SVG của đạo cụ được `appendChild` trực tiếp vào `#hand` của nhân vật (`index.html:1151`).
- `index.html:719-736` (`OBJECTS`) & `index.html:751-985` (`A(...)`, `ACTIONS`): Mỗi đồ vật có `{ en, vi, ipa, acts: [...], room }`. Mỗi hành động tạo bởi `A(id, obj, label, labelVi, sentence, vi, key, vocab, grammar, chunks, disc, patterns, pre, seq, also)` vừa là kịch bản gameplay (`pre`, `seq`) vừa là bài học 6 bước.
- `modules/food.js:1-410` (`window.ELW_FOOD`) & `modules/fridge-cooking.js:1-277`: Mở rộng hệ thống thực phẩm trong tủ lạnh và nấu ăn trong bếp (`renderFridge`, `renderPanel`, `onActionDone`).
- `modules/inventory.js:1-168` (`window.ELW_INVENTORY.mount`): Dựng kho từ vựng 150+ đồ vật theo phòng trong `#invWrap` (`index.html:2075-2084`).

### 4.2. Luồng tương tác UI khi chọn đồ vật (`index.html`, `modules/context-engine.js`, `modules/ui-mobile.js`)
- `index.html:1663-1665` (`bindObj(o)`): Gắn sự kiện `click` và bàn phím (`Enter`/`Space`) lên mọi phần tử `.obj[data-obj]` để gọi `selectObject(o.dataset.obj)`.
- `index.html:1543-1552` (`selectObject(id)`): Đánh dấu class `.sel` trên đồ vật được chọn, gán `selObj = id`, `cur = null`, gọi `renderObject()` và phát âm tên tiếng Anh của đồ vật `say(obj.en)`.
- `index.html:1556-1598` (`renderObject()`): Dựng giao diện `#panel` gồm:
  - Header `.ohead`: Tên tiếng Anh, phiên âm IPA, nghĩa dịch (`trObj`), nút nghe `🔊`, bộ đếm số câu đã học.
  - Danh sách nút hành động `.acts`: Mỗi hành động gồm nút chính `.act[data-act]` (gọi `actClick`), nút làm lại `↻` `[data-redo]` (hiện khi `st === "done" && !busyQ && !a.pre()`, gọi `enqueue`), và nút học bài `📖` `[data-learn]` (gọi `openLesson`).
  - Khối `<details>` gợi ý 5 câu hỏi với NPC trong phòng (`[data-npcq]`, `index.html:1562-1576`).
- `index.html:1599-1659` (`openLesson(id)`, `render()`, `goNext()`, `bind()`): Giao diện bài học 6 bước (`look` 👀 Xem → `listen` 👂 Nghe → `shadow` 🔁 Nhại & thu âm `setupRec` → `disc` 🎯 Phân biệt âm → `speak` 🎤 Nói với `SpeechRecognition` `listenTo` → `recall` 🧠 Tự nhớ & ghi nhận SRS `mark(id, step)`).
- `modules/context-engine.js:1-1797` (`window.ELW_CONTEXT`): Phân tích ngữ cảnh phòng/thời tiết/cảm xúc hiện tại và dựng bảng gợi ý mẫu câu giao tiếp thông minh theo tình huống.
- `modules/ui-mobile.js:1-1388` (`window.ELW_UI_MOBILE`) & `modules/world-3d.js:138-208`: Quản lý giao diện 3 tab (`🎮 Chơi`, `📚 Học`, `🎯 Nhiệm vụ`) trên cả desktop và mobile, đồng bộ trạng thái qua `localStorage["elw_tab"]`.

---

## 5. HỘI THOẠI / TTS: `voices-dialogue`, `tts-audio` (MP3 GIỌNG C) & `speechQuiet` / `waitTalk`

### 5.1. Kiến trúc phát âm 2 tầng trong `index.html` & `modules/tts-audio.js`
- **Manifest âm thanh tĩnh:** `assets/audio-manifest.js` (sinh tự động bởi `tools/make_dist.py:25-37`) xuất `window.ELW_AUDIO_MANIFEST = new Set([...])` chứa mã băm FNV-1a 64-bit (16 ký tự hex) của hàng nghìn file `.mp3` giọng Neural C (`assets/audio/<hash>.mp3`).
- `modules/tts-audio.js:67-79` (`ELW_TTS_AUDIO.hashText(s)`): Chuẩn hóa chuỗi (`normalizeText`: bỏ thẻ HTML, ký hiệu nối âm `‿`, dấu chấm cuối, chuyển chữ thường) rồi băm kép `h1` (`0x811c9dc5`) + `h2` (`0x01000193`) thành chuỗi 16 hex.
- `index.html:1460-1515` (`say(t, rate)` → `saySimple(t, rate)` → `saySimpleTTS(t, rate)`):
  1. `saySimple` tính `h = ELW_TTS_AUDIO.hashText(t)`. Nếu `window.ELW_AUDIO_MANIFEST.has(h)`, phát trực tiếp file `assets/audio/<h>.mp3` qua `new Audio(url)` (timeout an toàn 15s).
  2. Nếu không có trong manifest hoặc lỗi mạng, rơi về `saySimpleTTS(t, numRate)` hoặc `ELW_VOICES.speak(t, narr.voice, {rate})`.
- `modules/tts-audio.js:512-632` (`ELW_TTS_AUDIO.speak(text, profileOrVoiceId, opts, fallbackSegmentFn)`):
  - Nếu là giọng nhân vật đặc thù (`CHARACTER_VOICES = ["mom","dad","grandma","grandpa","barista",...]`, dòng 529) hoặc đang chạy bản 1 file (`canUseExternalAudio() === false`, dòng 107-122): chuyển thẳng sang `fallbackSegmentFn` (Web Speech API).
  - Nếu là giọng đọc chính: thử phát MP3 của cả đoạn (`fullHash`), nếu là đoạn nhiều câu (`splitSentences`) thì phát từng câu kết hợp `preload(sents[i+1])` (dòng 579) và nghỉ giữa câu theo `computeSentencePauseMs` (dòng 499-510).
- **Cầu nối `speechSynthesis` (`modules/tts-audio.js:147-213`, `installSpeechSynthesisBridge`):** Ghi đè getter `window.speechSynthesis.speaking`, `paused` và các hàm `cancel()`, `pause()`, `resume()` để phản ánh cả trạng thái của `HTMLAudioElement` (`currentAudio`). Nhờ đó `speechQuiet()` và `speechStop()` trong `index.html` hoạt động thống nhất cho cả MP3 lẫn Web Speech API.

### 5.2. Bộ lập kế hoạch ngữ điệu & hội thoại (`modules/tts-prosody-planner.js`, `modules/voices-dialogue.js`)
- `modules/tts-prosody-planner.js:1-850` (`window.ELW_TTS_PLANNER`): Phân tích loại câu (`detectSentenceType`), cảm xúc văn bản (`detectContentEmotion`), từ khóa nhấn giọng (`extractKeywords`), tách cụm ý (`splitPhraseClauses`) và lập kế hoạch ngữ điệu đoạn văn (`planParagraph`, `planToSSML`).
- `modules/voices-dialogue.js:790-1845` (`window.ELW_VOICES`):
  - Quản lý 6 hồ sơ giọng cơ sở (`PROFILES`: `adult_male`, `adult_female`, `young_male`, `young_female`, `child`, `elderly`) và 20+ hồ sơ nhân vật (`CHARACTER_PROFILES`: `mom`, `dad`, `grandma`, `barista`, `cashier`, `waiter`...), phân bổ giọng trình duyệt tốt nhất qua `allocate()` (`dòng 1092`).
  - Cung cấp `ELW_VOICES.speak(text, profileId, opts)` kết hợp `ELW_TTS_AUDIO` và `ELW_TTS_PLANNER`.
- `modules/voices-dialogue.js:1848-2320` (`window.ELW_DIALOGUE`): Cung cấp `SCRIPTS`, `makeMom(SVGNS)` và `createPlayer(opts)` cho hội thoại tương tác.
- `modules/roleplay.js:1-1042` (`window.ELW_ROLEPLAY`): Hệ thống hội thoại nhập vai theo tình huống (`shouldTrigger`, `createPlayer`).
- `modules/life-talk.js:1-971` (`window.ELW_LIFE`): Quản lý bạn đồng hành **Linh**, thời tiết và hội thoại phản xạ theo hành động (`onAction`, `onRoomEnter`, `setCompanion`).

### 5.3. Cơ chế đồng bộ câu thoại `speechQuiet` & `waitTalk` (`index.html`)
- `index.html:1742` (`speechQuiet(max = 6000)`): Poll `speechSynthesis.speaking` mỗi 120ms cho tới khi hết tiếng đọc trước đó (hoặc tối đa `max` ms) rồi mới bắt đầu câu mới.
- `index.html:1348` (`waitTalk(p)`): `Promise.race` giữa promise âm thanh `p` và timeout 7.500ms, cộng thêm khoảng nghỉ 180ms, đảm bảo nếu trình duyệt treo TTS thì gameplay không bao giờ bị khóa cứng.
- `index.html:1308-1328` (`charSay(text)`) & `modules/ui-scene.js:1-588` (`ELW_UI_SCENE.bubble`): Vẽ bong bóng thoại bám theo nhân vật chính (`#char`) hoặc neo vào đồ vật/NPC (`anchor: "obj:..."`, `"npc:..."`).

---

## 6. “PHẦN ĐOẠN VĂN CỦA TÔI” & CHUỖI HÀNH ĐỘNG

### 6.1. Nguyên tắc kiến trúc bất biến (`index.html:1746`)
- **“Action log (sự kiện thật) → đoạn văn (biên tập). Đoạn văn KHÔNG bao giờ được dùng làm trạng thái.”**
- Nguồn dữ liệu duy nhất của đoạn văn là các mục trong `queue` có `status === "done"`:
  ```js
  const done = queue.filter(q => q.status === "done");
  ```

### 6.2. Biên tập đoạn văn đa cấp độ, ngôi kể & thì (`index.html`, `modules/levels.js`, `modules/reading.js`)
- `index.html:994-1038` (`STORY`): Từ điển ánh xạ `actionId → [cụm_động_từ_ngắn, cụm_có_trạng_từ_tính_từ, nghĩa_tiếng_Việt]`.
- `index.html:1748-1751` (`vpOf(it, rich)`): Lấy cụm động từ theo cờ `narr.rich` và kiểm tra ngữ cảnh thật lưu trong `it.ctx` (ví dụ chỉ thêm chữ `"cold milk"` nếu `it.ctx.milkFromFridge === true`).
- `index.html:1752-1772` (`buildStory()`) & `modules/levels.js:1-458` (`ELW_LEVELS.build(items, level, opts)`):
  - Nếu `narr.storyMode === "simple"`: xuất từng câu đơn `"I <vp>."`.
  - Nếu chọn cấp độ CEFR (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`): gọi `ELW_LEVELS.build` để ghép mệnh đề bằng liên từ (`First`, `Then`, `After that`, `While...`, `Finally`) và trích xuất `ELW_LEVELS.extras` (Chunks, Từ mới, Ngữ pháp tại `index.html:1979-1992`).
- `index.html:1775-1814` (`povEn`, `povVi`, `storyFinal`, `storyText`):
  - Biến đổi ngôi kể (`i` → `he`, `she`, `tom`, `anna`) và chia động từ sang thì hiện tại (`third(v)`) hoặc quá khứ (`past(v)` với bảng bất quy tắc `IRR` 60+ động từ tại `index.html:1777-1780`).
  - Tự động nối thêm câu thoại đáp lại của NPC (`q.reply`) vào cuối câu văn (`index.html:1812-1813`).
- `index.html:1827-1844` (`readAloud`, `linkify`, `speakStory`) & `modules/reading.js:1-166` (`ELW_READING`): Đánh dấu nối âm `‿` (`pick‿up`, `turn‿on`) và đọc theo cụm (`chunk`) hoặc liền mạch (`flow`).
- `index.html:1848-1867` (`reenactStory()`): Đặt lại phòng (`resetScene(false)`), sau đó duyệt từng câu trong `storyFinal()`, vừa tô sáng câu `.s.hl` vừa chạy song song `Promise.all([readAloud(sg.en), runSeq(a.seq(), tk)])`.
- `index.html:1923-1973` (`loadSeqs`, `saveSeqs`, `renderSeq`, `replay`): Quản lý thẻ `#seqCard` (“🎬 Chuỗi hành động của tôi”), cho phép Tạm dừng/Chạy, Về đầu (`#qRewind`), Phát lại từ đầu (`replay()`), đổi thứ tự `↑`/`↓`, xóa bước `✕` và lưu/tải chuỗi hành động yêu thích vào `localStorage["elw_sequences_v1"]`.

---

## 7. HỆ THỐNG THÚ CƯNG (PET SYSTEM)

Hệ thống thú cưng gồm 9 module (`modules/pet-*.js`), gắn vào phần tử SVG `#o-cat` (`index.html:525-566`) và bảng điều khiển trong tab Nhiệm vụ & Thú cưng:

### 7.1. `modules/pet-needs.js` (`window.ELW_PET_NEEDS`)
- Quản lý 10 thú cưng chuẩn (`PETS`: `milu`, `boba`, `cookie`, `mochi`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`; trong đó `milu` và `mochi` miễn phí, 8 thú cưng còn lại mở khóa theo `elw_topics_v1.unlocked`).
- Lưu trữ cô lập từng thú cưng theo cấu trúc `byPetId[petId]` trong `localStorage["elw_pet_needs_v2"]` (dòng 29): `{ stage, level, xp, needs: { energy, hunger, thirst, fun, bond }, progression, unlockedSkills, missionProgress }`.
- Hệ thống tiến hóa 5 giai đoạn (`STAGES = ["baby", "young", "teen", "adult", "elite"]`, ngưỡng XP `[0, 100, 250, 450, 700]` kết hợp điều kiện chăm sóc): `checkStageEvolution(petId)` (dòng 2831) kiểm tra và phát sự kiện `"stage-up"`.
- Giảm chỉ số ngoại tuyến có trần an toàn (`applyOfflineDecay`, `catchUp`, dòng 2769-2793): tối đa 6 giờ (`MAX_OFFLINE_DECAY_MS`), không bao giờ tụt dưới sàn `OFFLINE_FLOOR = 25` và không bao giờ trừ XP/level/stage.

### 7.2. `modules/pet-follow.js` (`window.ELW_PET_FOLLOW`)
- Điều khiển di chuyển tự động bám theo nhân vật chính ở 60fps (`loop` → `stepFrame(dtSec)`, dòng 1200-1203).
- **Ranh giới DOM nghiêm ngặt:** Chỉ cập nhật `#catPos` (`translate(x, y)`), `#catScale` (tỷ lệ theo chiều sâu `y` × `STAGE_SCALES[stage]`), `#catFlip` (`scaleX(dir)`) và `oCat.dataset.base`.
- Tránh vật cản trong phòng (`getObstaclesForRoom`, `pushOutOfObstacles`, dòng 1318-1324) và giữ khoảng cách tự nhiên với `#char` (`syncImmediateCharBounds`, dòng 1377-1390).
- Tự động nhường quyền điều khiển (`setYield`, `isControlling`, dòng 1338-1367) khi nhân vật chính đang thực hiện hành động tương tác trực tiếp với thú cưng (`isCatInteractionActive()` tại `index.html:1110-1112`).

### 7.3. `modules/pet-anim.js` (`window.ELW_PET_ANIM`)
- **Ranh giới DOM nghiêm ngặt:** Chỉ biến đổi `#catHop` (`translate`, `rotate`, `scale(scaleX, scaleY)`) và đổi ảnh sprite `#roomPetImg` (`resolveStageAssetPath`, dòng 1809) — không bao giờ chạm vào `#catPos` hay `#catFlip` của `pet-follow.js`.
- Áp dụng dáng đi riêng theo từng giai đoạn tiến hóa (`STAGE_GAIT_PROFILES`: `baby` bước ngắn lon ton, `teen` nhảy nhanh nhẹn, `adult`/`elite` bước mượt đĩnh đạc, dòng 94-150).
- Thực thi nghi thức tiến hóa 4 pha `playStageUpCeremony(petId, newStage)` (dòng 1810): phát sáng (Glow) → hạt lấp lánh (Sparkles) → biến hình đổi sprite & scale → thông báo toast.

### 7.4. `modules/pet-interaction.js` (`window.ELW_PET_INTERACTION`) & các module Pet bổ trợ
- Quản lý 10 trạng thái biểu cảm (`CANONICAL_STATES`: `idle_happy`, `curious`, `playful`, `eating`, `drinking`, `sleepy`, `tired`, `sad_lonely`, `excited`, `walking_adventure`) và 8 tương tác chuẩn (`INTERACTIONS`: `pet`, `play`, `feed`, `water`, `rest`, `talk`, `walk`, `profile`, dòng 81-162).
- Khi người chơi bấm vào `#o-cat` trong cảnh, `bindHomePetClickListener()` (dòng 2076) tự động chèn thanh tương tác nhanh `#petSceneQuickBar` vào `#panel` (`injectSceneQuickBar`, dòng 2188) và thực thi `performInteraction(actionId)` (cập nhật nhu cầu, cộng XP, phát thoại song ngữ từ `DIALOGUE_BANK`).
- Các module phối hợp: `modules/pet-adventure.js` (`ELW_PET_ADVENTURE` — nhiệm vụ phiêu lưu cùng thú cưng), `modules/pet-personality.js` (`ELW_PET_PERSONALITY` — tính cách & kỹ năng), `modules/pet-rewards.js` (`ELW_PET_REWARDS` — sổ cái chống nhận thưởng trùng `elw_pet_reward_ledger_v2`), `modules/pet-ui.js` (`ELW_PET_UI` — giao diện hồ sơ & tiến trình), `modules/pet-survival.js` (`ELW_PET` — cầu nối khởi tạo tại `index.html:2332`).

---

## 8. HỆ THỐNG NHIỆM VỤ (`mission.js`) & THỬ THÁCH (`challenge.js`)

### 8.1. Nhiệm vụ có hướng dẫn (`modules/mission.js`, `modules/ui-mission.js`, `modules/missions-pack.js`)
- `modules/mission.js:1-310` (`window.ELW_MISSION`):
  - Dùng chung 1 engine duy nhất cho cả 3 chế độ: tự chơi (Manual), bật gợi ý (`setHints(on)`), và tự động làm từng bước (`auto()` → `autoStep()`).
  - Mỗi nhiệm vụ gồm danh sách `steps`, mỗi bước định nghĩa: `actions: [...]`, hàm kiểm tra hoàn thành thực tế trên trạng thái thế giới `done(W)`, và hàm chọn hành động tiếp theo `next(W)`.
  - `guard(actionId, W)` (`modules/mission.js:80-91`): Chặn người chơi thực hiện hành động thuộc bước đang khóa (`status === "locked"`), trả về lý do tiếng Việt cho `execItem` (`index.html:1368`).
  - `start(id, h)` (`modules/mission.js:168-183`): Gọi `resetWorldForMission(targetM)` để đưa phòng về trạng thái chuẩn trước khi bắt đầu, hiển thị bong bóng giao việc của NPC (`host.bubble`) và phát giọng đọc (`host.speak`).
  - `onAction(actionId, status, W, reason)` (`modules/mission.js:188-216`): Cập nhật tiến độ sau mỗi hành động; khi mọi bước đều `done(W)`, đánh dấu `st.complete = true`, phát lời khen của NPC và cộng 30 XP (`index.html:2274`).
- `modules/missions-pack.js:1-354` (`window.ELW_MISSIONS_PACK`): Gói 10 nhiệm vụ ở nhà (nấu ăn, dọn phòng, chăm mèo, chuẩn bị đi ngủ...), đăng ký qua `ELW_MISSION.register(...)` cùng với nhiệm vụ của từng chủ đề (`ELW_CAFE.missions`, `ELW_MARKET.missions`, `ELW_PARK.missions`, `ELW_RESTAURANT.missions`, `ELW_OUTDOOR.missions`, `ELW_SCHOOL.missions`, `ELW_LIFE.missions` tại `index.html:2275, 2324`).
- `modules/ui-mission.js:1-952` (`window.ELW_UI_MISSION.render`): Giao diện thẻ `#missionCard` hiển thị các bước, nút gợi ý `💡` và nút `⚡ Làm ngay`.

### 8.2. Thử thách đời sống (`modules/challenge.js`)
- `modules/challenge.js:1-342` (`window.ELW_CHALLENGE`):
  - Quản lý các thử thách lớn nhiều mục tiêu (11 thử thách ở nhà + các thử thách theo chủ đề được gộp tại `index.html:2327`), có tính giờ (`minutes`), chế độ Dễ / Thường (`setMode`), và đánh giá 1–3 sao (`checkComplete`, dòng 239-250).
  - Theo dõi 3–5 thanh tiến độ (`bars(ctx)`, dòng 184-196): Việc cần làm (`tasks`), Luyện tiếng Anh (`speak + listen + roleplay`), Nghe câu chuyện tổng kết (`storyHeard`), xử lý sự cố (`events`) và độ gọn gàng của ngôi nhà (`homePct()`).
- **Cơ chế khóa chéo chống xung đột (`index.html:2277-2279`):** Khi bắt đầu `ELW_MISSION.start`, ứng dụng tự động `ELW_CHALLENGE.pause()`; khi xong nhiệm vụ thì `ELW_CHALLENGE.resume()`. Ngược lại, khi gọi `ELW_CHALLENGE.start`, nếu có nhiệm vụ đang chạy thì tự động `ELW_MISSION.stop()`.

---

## 9. DANH MỤC TOÀN BỘ `localStorage` KEYS

Toàn bộ dữ liệu lưu cục bộ trên trình duyệt dùng tiền tố `elw_`:

| STT | Khóa `localStorage` | File : Dòng | Module / Biến sở hữu | Nội dung lưu trữ |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `elw_world_v1` | `index.html:1092`, `topic-cafe-zones.js:2397`, `topic-market-zones.js:4299` | `W` (`saveW()`) | Trạng thái thế giới vật lý (`room`, `x`, `y`, `dir`, vị trí đồ vật, trạng thái các phòng `k_*`, `b_*`, `cf_*`, `mk_*`). |
| 2 | `elw_progress_v1` | `index.html:1414`, `pet-rewards.js:21`, `vocab-3000.js:396` | `P` (`save()`) | Điểm sao `pts`, tiến độ 6 bước `steps[actId]`, lịch ôn tập ngắt quãng SRS `items[actId] = {s, due, ok, bad}`, từ vựng kho đồ `inv`. |
| 3 | `elw_prefs_v1` | `index.html:1738` | `narr` (`savePrefs()`) | Tùy chọn đọc & đoạn văn (`mode`, `storyMode`, `rich`, `showVi`, `showLink`, `pov`, `tense`, `voice`, `speed`, `readMode`, `lang`). |
| 4 | `elw_sequences_v1` | `index.html:1923` | `loadSeqs()` / `saveSeqs()` | Danh sách chuỗi hành động do người chơi đặt tên và lưu lại `{v:1, list:[{name, ids, at}]}`. |
| 5 | `elw_topics_v1` | `index.html:1043, 2295`, `ui-topics.js:516`, `pet-needs.js:627` | `ELW_TOPICS` | Chủ đề đang chọn `current`, cờ mở khóa `unlocked` (mã `6789`), thứ tự chủ đề bình chọn `picked`. |
| 6 | `elw_welcome_v1` | `index.html:2116, 2121` | IIFE Welcome Modal | Cờ `"1"` đánh dấu đã hiển thị modal hướng dẫn lần đầu. |
| 7 | `elw_mission_v1` | `modules/mission.js:13` | `ELW_MISSION` | Trạng thái nhiệm vụ đang làm `{v:1, st:{id, hintsOn, auto, log, doneSteps, acted, spoken, complete}}`. |
| 8 | `elw_challenge_v1` | `modules/challenge.js:6` | `ELW_CHALLENGE` | Trạng thái thử thách `{v:1, unlocked, best, current}`. |
| 9 | `elw_day_v1` | `modules/day.js:5` | `ELW_DAY` | Buổi trong ngày (`morning`/`afternoon`/`evening`/`night`), thời tiết, XP ngày và nhật ký cuối ngày. |
| 10 | `elw_needs_v1` | `modules/needs.js:6` | `ELW_NEEDS` | Các chỉ số tình trạng ngôi nhà (độ sạch, cây khát, bếp bừa...) tính theo thời gian thực. |
| 11 | `elw_events_v1` | `modules/events.js:7` | `ELW_EVENTS` | Trạng thái các sự kiện ngẫu nhiên trong nhà. |
| 12 | `elw_life_v1` | `modules/life-talk.js:11` | `ELW_LIFE` | Trạng thái bật/tắt bạn đồng hành Linh (`companion`), lịch sử hội thoại theo chủ đề. |
| 13 | `elw_mistakes_v1` | `modules/grammar.js:312` | `ELW_MISTAKES` | Sổ lỗi ngữ pháp & phát âm của người học. |
| 14 | `elw_speaking_v1` | `modules/speaking-coach.js:6` | `ELW_SPEAKING` | Cấu hình endpoint AI tùy chọn cho luyện nói. |
| 15 | `elw_tts_prefs_v1` | `modules/voices-dialogue.js:870` | `ELW_VOICES` | Chế độ giọng đọc (`natural` / `learning`) và preset cảm xúc (`preset`). |
| 16 | `elw_w3d_v1` | `modules/world-3d.js:8`, `modules/ui-mobile.js:803` | `ELW_WORLD3D` | Cài đặt góc nghiêng 3D Diorama (`tilt3d`), góc camera và tab hiện tại. |
| 17 | `elw_tab` | `modules/world-3d.js:9`, `modules/ui-mobile.js:11` | `ELW_WORLD3D` / `ELW_UI_MOBILE` | Tab đang mở (`play` / `learn` / `mission`). |
| 18 | `elw_scene_collapsed` | `modules/ui-mobile.js:12` | `ELW_UI_MOBILE` | Trạng thái thu gọn khung cảnh trên màn hình mobile (`"1"` / `"0"`). |
| 19 | `elw_ctx_v1` | `modules/context-engine.js:8`, `modules/npcs.js:73` | `ELW_CONTEXT` | Dữ liệu ngữ cảnh giao tiếp và lịch sử gợi ý câu. |
| 20 | `elw_v3000_v1` | `modules/vocab-3000.js:8` | `ELW_VOCAB3000` | Tiến độ học bộ 3000 từ vựng thông dụng. |
| 21 | `elw_pro_v1` | `modules/premium.js:8` | `ELW_PREMIUM` | Trạng thái mở khóa bản PRO. |
| 22 | `elw_pet_needs_v2` | `modules/pet-needs.js:29` | `ELW_PET_NEEDS` | Dữ liệu chính thức V2 của 10 thú cưng (`activePetId`, `inventory`, `byPetId[petId]`). |
| 23 | `elw_pet_stage` | `modules/pet-needs.js:2624`, `pet-follow.js:164`, `pet-anim.js:481` | `ELW_PET_*` | Ghi đè / đồng bộ nhanh giai đoạn tiến hóa hiện tại (`baby`..`elite`). |
| 24 | `elw_pet_adventure_v2` | `modules/pet-adventure.js:5, 23` | `ELW_PET_ADVENTURE` | Tiến độ các chuyến phiêu lưu của thú cưng. |
| 25 | `elw_pet_reward_ledger_v2` | `modules/pet-rewards.js:20` | `ELW_PET_REWARDS` | Sổ cái ghi nhận các mục tiêu đã nhận thưởng (chống farm trùng). |
| 26 | `elw_pet_v1`, `elw_pet_v2`, `elw_pet_needs_v1`, `elw_pet_survival`, `elw_pet_backup_pre_v2`, `elw_pet_needs_v2_backup` | `modules/pet-needs.js:30-34`, `pet-rewards.js:23-24` | `ELW_PET_NEEDS` | Các khóa dữ liệu Pet đời cũ (v1) và bản sao lưu tự động khi nâng cấp lên schema V2. |

---

## 10. ĐÓNG GÓI (`tools/build.py`, `tools/make_dist.py`) & TRIỂN KHAI (`deploy-pages.yml`)

### 10.1. Đóng gói bản 1 file độc lập (`tools/build.py`)
- `tools/build.py:14-59`: Quét thư mục `assets/pets/<pet_id>/*.png` và các thư mục con theo stage (`baby`, `young`, `teen`, `adult`, `elite`), mã hóa Base64 thành data URI (`data:image/png;path=...;base64,...`). Nhúng toàn bộ 50 ảnh stage của `milu` và các pet khác trong ngân sách `ELW_STAGE_EMBED_BUDGET_KB` (mặc định 1800 KB).
- `tools/build.py:60-124` (`asset_bootstrap`): Bơm script khởi tạo `window.ELW_PET_ASSETS` và monkey-patch `HTMLImageElement.prototype.src`, `Element.prototype.setAttribute`, `SVGImageElement.prototype.src` để tự động chuyển đường dẫn `assets/pets/...` sang Base64; đồng thời chặn tải `assets/objects/*` để kích hoạt `onerror` về hình vẽ SVG nội tuyến.
- `tools/build.py:133-146` (`inl(m)`): Dùng regex `r'<script src="(modules/[\w-]+\.js)"></script>'` để nhúng nội tuyến toàn bộ các file `modules/*.js` vào `index.html` và xuất ra file đơn `english-life-world-ban-day-du.html` (~11 MB).

### 10.2. Tạo thư mục `dist/` sạch & Deploy Cloudflare Pages (`tools/make_dist.py`, `.github/workflows/deploy-pages.yml`)
- `tools/make_dist.py:25-37` (`build_audio_manifest()`): Quét toàn bộ `assets/audio/*.mp3`, lấy danh sách mã băm (stem) và ghi ra `assets/audio-manifest.js` (`window.ELW_AUDIO_MANIFEST = new Set([...])`).
- `tools/make_dist.py:40-71` (`main()`): Xóa và tạo mới thư mục `dist/`, chép `index.html`, chép các file `modules/*.js` (hàm `should_include_module` tại dòng 14-22 loại bỏ `*.test.*`, `*.pw.mjs`, `*harness*`), và chép toàn bộ thư mục `assets/` sang `dist/assets/`.
- `.github/workflows/deploy-pages.yml:1-34`: GitHub Actions workflow chạy khi push lên nhánh `main` hoặc `'preview-*'` (và `workflow_dispatch`):
  1. Checkout repo & cài Python 3.11.
  2. Chạy `python tools/make_dist.py`.
  3. Dùng `cloudflare/wrangler-action@v3` chạy lệnh:
     `pages deploy dist --project-name english-life-world --branch ${{ github.ref_name }}`
     - Khi push lên `main`: cập nhật bản production `https://english-life-world.pages.dev/`.
     - Khi push lên nhánh `preview-*` (ví dụ `preview-airport-demo`): Cloudflare Pages tự động xuất bản một URL preview riêng biệt (`https://<branch>.english-life-world.pages.dev/`) mà không ghi đè bản chính.

---

## 11. BẢNG ĐÁNH GIÁ: “TÁI DÙNG CHO DEMO SÂN BAY”

| Thành phần | Quyết định (`Dùng lại nguyên` / `Chép-có-chỉnh` / `Viết mới`) | Lý do kỹ thuật | Rủi ro nếu dùng sai cách |
| :--- | :--- | :--- | :--- |
| **1. Hệ thống âm thanh & TTS (`modules/tts-audio.js`, `modules/tts-prosody-planner.js`, phần `ELW_VOICES` trong `voices-dialogue.js`)** | **Dùng lại nguyên** (nạp qua `<script>` hoặc import bản sao độc lập) | Đã xử lý hoàn chỉnh băm FNV-1a 64-bit, phát MP3 giọng C, preload câu tiếp theo, chống chồng âm (`overlapCount = 0`), cầu nối `speechSynthesis.speaking` và fallback Web Speech API. | Nếu sửa trực tiếp file trong `modules/` của app chính sẽ ảnh hưởng production; nếu câu mới của sân bay chưa chạy script sinh MP3 thì sẽ fallback về giọng trình duyệt (cần bổ sung MP3 hoặc chấp nhận fallback). |
| **2. Lớp hiển thị bong bóng & nhãn trên cảnh (`modules/ui-scene.js` — `ELW_UI_SCENE`)** | **Dùng lại nguyên** (hoặc bọc qua adapter tọa độ) | Đã hỗ trợ tốt bong bóng thoại (`request`, `say`, `result`, `error`, `hint`), tự co giãn theo mobile, hỗ trợ `prefers-reduced-motion` và neo vào `[data-obj]` hoặc `#char`. | Khi bản đồ sân bay mở rộng lớn hơn `1000×640` và có camera scrolling, phép chiếu tọa độ màn hình `getScreenCTM()` trong SVG cần đồng bộ với khung nhìn (`viewBox`) đang cuộn. |
| **3. Cơ chế sắp xếp chiều sâu 2.5D (`sortDepth` theo `data-base` & `charScale(y)`)** | **Chép-có-chỉnh** | Thuật toán Painter's Algorithm phân lớp theo `data-base` (tọa độ chân `y`) đơn giản, nhẹ và rất hiệu quả cho cảnh 2.5D SVG. | App chính đang gộp chung mọi phần tử vào `#world` của 1 phòng `1000×640`. Với Open Map sân bay rộng nối liền 3–4 khu vực, cần chỉnh lại hàm `charScale(y)` theo biên sàn mới và chỉ sort các phần tử động hoặc phân vùng để tránh giật frame. |
| **4. Bộ điều phối hành động (`enqueue` → `pump` → `execItem`, `runSeq`, `token`/`Abort`)** | **Chép-có-chỉnh** | Cơ chế hủy an toàn bằng `token` + `Abort`, chạy song song animation + câu thoại (`waitTalk`), và kiểm tra điều kiện tiên quyết tại thời điểm thực thi là nền tảng tốt. | **Bắt buộc bỏ cơ chế chặn lặp lại trong `actClick`/`actStatus` (`index.html:1554-1555`) và nhánh `isAlready` (`index.html:1372`)** vốn làm hành động chỉ chạy 1 lần rồi biến thành nút phát lại âm thanh. Cần tách bạch `currentState`, `actionExecution` và `narrationHistory`. |
| **5. Trình dựng “Phần đoạn văn của tôi” (`buildStory`, `povEn`, `povVi`, `modules/levels.js`, `modules/reading.js`)** | **Chép-có-chỉnh** | Bộ chia động từ ngôi/thì (`povEn`/`povVi`), nối âm `linkify` và ghép câu theo cấp độ CEFR hoạt động rất tốt cho mục tiêu học tiếng Anh. | Cần **chống ghi trùng câu văn** khi người chơi thực hiện lặp lại cùng một hành động (ví dụ mở/đóng vali hoặc quầy check-in nhiều lần): chỉ ghi nhận lần đầu vào `narrationHistory`, các lần bấm lặp vẫn chạy `actionExecution` nhưng không nhân bản câu trong đoạn văn. |
| **6. Máy trạng thái Nhiệm vụ (`modules/mission.js` — `ELW_MISSION`)** | **Chép-có-chỉnh** | Kiến trúc `steps` kiểm tra `done(W)` trên trạng thái thật và `guard(actionId, W)` rất khớp với yêu cầu nhiệm vụ `"Check in for your flight"` của sân bay. | `mission.js:93-166` đang hard-code `HOME_W0` và gọi `window.ELW.resetScene()`. Cần tách thành `AirportMissionManager` nhận trạng thái khởi tạo riêng của sân bay (`AIRPORT_W0`), không phụ thuộc `HOME_W0`. |
| **7. Hệ thống di chuyển, tìm đường & Click-to-Move (`moveTo`, `route`, `OBST`)** | **Viết mới** (tham khảo thuật toán Dijkstra góc hộp của `routeLiving`) | App chính chỉ hỗ trợ di chuyển tới các điểm cố định `SPOTS[key]` khi chọn hành động trong menu (không có Click-to-Move trên mặt đất) và không có Camera Scrolling. | Yêu cầu bổ sung của sân bay bắt buộc có **Open 2.5D Map (3–4 khu vực liền mạch)**, **Click-to-Move** đến bất kỳ điểm hợp lệ nào trên sàn, tìm đường A*/Navigation Grid/Visibility Graph quanh vật cản và **Camera Scrolling** mượt theo nhân vật. |
| **8. Thiết kế bản đồ sân bay, Nhân vật chính, Pet & NPC sân bay** | **Viết mới 100%** | Yêu cầu `AIRPORT_MASTER_PROMPT.md` (Mục 7, 8, 9, 10) quy định rõ phải thiết kế mới toàn bộ map sân bay 2.5D (Check-in, Security, Waiting Lounge, Boarding Gate), nhân vật chính, Pet và NPC sân bay theo định hướng nghệ thuật mới. | Không được dùng lại bối cảnh phòng khách hay bê nguyên hệ thống 10 thú cưng (`pet-needs.js` 2.852 dòng) vào làm nặng demo; chỉ cần 1 Pet đồng hành gọn nhẹ đi theo nhân vật với state machine rõ ràng. |
| **9. Giao diện HUD, Bảng hành động & Lưu trữ `localStorage`** | **Viết mới** (với khóa `localStorage` riêng) | UI của app chính đang đặt nhiều thẻ dọc (`.side` gồm 10 card) mang dáng dấp dashboard. Demo sân bay yêu cầu HUD gọn gàng đồng bộ thế giới game, progressive disclosure và không tràn ngang trên mobile. | Nếu dùng chung khóa `elw_world_v1`, `elw_progress_v1`, `elw_mission_v1` sẽ làm hỏng dữ liệu đang lưu của người dùng trên ứng dụng chính khi mở cùng domain. Bắt buộc dùng namespace khóa riêng (ví dụ `elw_airport_*`). |
| **10. Quy trình đóng gói & triển khai (`tools/make_dist.py`, `deploy-pages.yml`)** | **Chép-có-chỉnh** (chỉ ở bước tích hợp cuối khi được phép) | Workflow Cloudflare Pages đã hỗ trợ sẵn nhánh `'preview-*'`, tự động tạo URL preview riêng khi deploy thư mục `dist/`. | `make_dist.py` hiện chỉ copy `index.html`, `modules/*.js`, `assets/`. Khi dựng demo trong thư mục riêng (ví dụ `airport/` hoặc `demo-airport/`), cần đảm bảo thư mục demo được copy vào `dist/` hoặc chạy preview độc lập mà không chạm vào `index.html` gốc. |

---

## 12. KẾT LUẬN NGẮN: DEMO SÂN BAY NÊN ĐỘC LẬP TỚI MỨC NÀO?

Bản **Demo Sân bay 2.5D** cần được xây dựng theo mô hình **Độc lập hoàn toàn về Entry Point, Trạng thái và Giao diện (100% Isolated Sandbox App)**, cụ thể:

1. **Thư mục và Entry Point riêng biệt (ví dụ `airport/index.html` + `airport/js/*.js` + `airport/css/*.css` + `airport/assets/*`):**
   - Tuyệt đối **không sửa `index.html` gốc**, không thêm nhánh `if (topic === "airport")` vào `index.html` hay các file `modules/*.js` hiện hữu của ứng dụng chính.
   - Không dùng chung biến toàn cục `W`, `OBJECTS`, `ACTIONS`, `queue` của `index.html`.
2. **Cô lập tuyệt đối `localStorage` và State:**
   - Mọi dữ liệu lưu trữ của bản demo (nếu có) phải dùng tiền tố riêng biệt `elw_airport_*` (ví dụ `elw_airport_state_v1`, `elw_airport_narration_v1`), không đọc/ghi vào `elw_world_v1`, `elw_progress_v1` hay `elw_pet_needs_v2` để tránh làm hỏng dữ liệu của người học trên bản chính khi chạy cùng domain `english-life-world.pages.dev`.
3. **Tái sử dụng có chọn lọc qua Adapter sạch:**
   - Chỉ tái sử dụng trực tiếp dịch vụ hạ tầng không giữ trạng thái gameplay là **TTS/Audio** (`modules/tts-audio.js`, `modules/tts-prosody-planner.js`, `assets/audio-manifest.js`) và kế thừa ý tưởng thuật toán (`sortDepth` theo `data-base`, hủy tác vụ bằng `token`, chia ngôi/thì đoạn văn), nhưng viết thành các module ES/IIFE có ranh giới API rõ ràng (`SceneManager`, `NavigationSystem`, `CharacterController`, `InteractionSystem`, `NarrationHistoryManager`, `AirportMissionManager`, `UIManager`).
   - Nhờ cấu trúc tách biệt này, nhóm 4 Agent có thể phát triển song song bản đồ sân bay mở (Open 2.5D Map + Click-to-Move + Camera Scrolling) và sửa triệt để lỗi tương tác lặp lại (`currentState` ≠ `actionExecution` ≠ `narrationHistory`) mà **rủi ro gây lỗi hồi quy cho ứng dụng chính bằng 0**.
