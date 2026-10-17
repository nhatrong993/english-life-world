# BÁO CÁO SỬA LỖI HÀNH ĐỘNG LẶP LẠI (FIX REPEAT ACTION REPORT)

> **Trạng thái:** Đã sửa triệt để trong `index.html` và `modules/world-3d.js` (thay đổi tối thiểu, đúng phạm vi), đã đóng gói qua `python tools/build.py` và kiểm chứng 100% bằng Playwright E2E (`tools/test_repeat_actions.mjs`).

---

## 1. Tóm tắt Kiến trúc Sửa lỗi (Tách Bạch 3 Luồng + Đồng bộ Popover 3D)

| Luồng / Hạng mục | Trước khi sửa (Nguyên nhân lỗi) | Sau khi sửa (Giải pháp đã áp dụng) |
|---|---|---|
| **Luồng A: Thực thi hành động (`actClick` & `enqueue`)** | `actClick(id)` kiểm tra `if (actStatus(id))` (bao gồm `"done"` trong lịch sử `queue`) rồi chỉ phát lại câu và `return`, không gọi `enqueue(id)` ở lần bấm thứ 2+. | `actClick(id)` chỉ chặn double-click khi hành động cùng `id` đang `"pending"`/`"running"`. Nếu `a.pre()` trả lý do (khi hàng đợi rảnh) thì hiển thị rõ qua `toastG` và nhãn `.why`; nếu hợp lệ (`!a.pre()`), **luôn gọi `enqueue(id)`** bất kể đã làm bao nhiêu lần trước đó. `enqueue(id)` cũng chặn đẩy trùng khi cùng `id` đang `pending`/`running`. |
| **Luồng B: Thoại & Âm thanh (`sayAct` / `[data-say-sent]`)** | Gộp chung vào nút hành động chính `[data-act]` khi `st === "done"`. | Tách hàm `sayAct(id)` gắn vào nút phụ `🔊` riêng (`button.iconbtn[data-say-sent="${a.id}"]`) nằm cạnh nút hành động chính để nghe lại câu + hiện bong bóng thoại mà **không đổi trạng thái `W` và không chạy hành động**. |
| **Luồng C: Lịch sử Đoạn văn (`narrationHistory` / `buildStory`)** | `buildStory()` lấy toàn bộ `queue.filter(q => q.status === "done")` không lọc trùng; lặp lại hành động hoặc bấm chip Cô Mai làm nhân bản câu trong *"Đoạn văn của tôi"*. | Thêm `narrationHistory()` lọc `Set` theo `q.id` (mỗi `id` chỉ ghi nhận lần đầu vào đoạn văn) dùng trong `buildStory()` và `renderExtras()`. Đồng thời gộp bản ghi `done` trùng `id` trong `execItem` (`prev.count++`) và chống ghi trùng `dayItems`. |
| **Trạng thái nút trong `renderObject()`** | `why = (busyQ || st) ? null : a.pre()` khiến nút đã từng làm (`st === "done"`) bị xóa `why = null`, mất trạng thái `disabled` và mất nhãn lý do khi đang ở trạng thái đích. | Đổi thành `why = busyQ ? null : a.pre()` (bỏ `|| st`). Class `.act-done` chỉ mang tính trang trí (`✓ đã làm`), còn trạng thái `disabled` và nhãn `<span class="why">` phản ánh đúng `W` hiện tại. |
| **Đồng bộ Popover `#fridgeCard` (`modules/world-3d.js`)** | `closeFridge()` chỉ ẩn `#fridgeCard` (`fc.hidden = true`) mà không cập nhật `W.fridge`, gây lệch state giữa popover và `W.fridge`. Click vào `#panel` cũng bị listener `document` hiểu nhầm là click ra ngoài `#fridgeCard`. | `closeFridge(opts)` đồng bộ `W.fridge = "closed"`, gỡ `.fridge-open` trên `#o-fridge`, gọi `applyState()` và `renderObject()` (trừ khi `opts.uiOnly` trên mobile). Listener click ngoài bỏ qua `#panel` (`e.target.closest("#panel")`), và khi `close_fridge` hoàn tất trong `onWorldAction` cũng gọi `ELW_WORLD3D.closeFridge({uiOnly:true})`. |

---

## 2. Tóm tắt Diff theo Tọa độ `file:dòng`

### 2.1. `index.html`

| Tọa độ (`file:dòng`) | Hàm / Khu vực | Nội dung thay đổi |
|---|---|---|
| `index.html:1285` | `enqueue(id)` | Thêm khóa chống double-click khi cùng `id` đang chờ/chạy: `if(!paused&&queue.some(q=>q.id===id&&(q.status==="pending"||q.status==="running")))return;` |
| `index.html:1372` & `1392` | `execItem(it, tk)` | Khi hành động hoàn tất (`status === "done"`, cả nhánh `isAlready` lẫn `finally`), nếu trong `queue` đã có mục `done` cùng `id` trước đó (`prev`) thì tăng `prev.count` và gộp lại để `#seqCard` và `queue` không phình bản sao. |
| `index.html:1554-1556` | `actStatus(id)`, `sayAct(id)`, `actClick(id)` | Tách `sayAct(id)` cho nút `🔊` (`[data-say-sent]`). Sửa `actClick(id)`: chỉ chặn khi `actStatus(id)==="pending"`; nếu `why = busyQ ? null : a.pre()` có lý do thì báo `toastG(\`💡 “${a.label}”: ${why}\`)`; nếu hợp lệ luôn gọi `enqueue(id)`. |
| `index.html:1578-1585` | `renderObject()` | Đổi `why = busyQ ? null : a.pre()` (bỏ `|| st`); thay nút phụ `data-redo` bằng nút nghe lại riêng `<button class="iconbtn" data-say-sent="${a.id}">🔊</button>`. |
| `index.html:1753-1755` | `narrationHistory()`, `buildStory()` | Thêm `function narrationHistory(){const seen=new Set();return queue.filter(q=>q.status==="done"&&!seen.has(q.id)&&seen.add(q.id))}` và dùng trong `buildStory()`. |
| `index.html:1985` | `renderExtras(st)` | Dùng `narrationHistory()` thay cho `queue.filter(q=>q.status==="done")`. |
| `index.html:2147-2154` | `onWorldAction(it, a)` | Chống ghi trùng `dayItems` (`!dayItems.some(d=>d.id===it.id)`) và đóng `#fridgeCard` (`ELW_WORLD3D.closeFridge({uiOnly:true})`) khi thực hiện `close_fridge`. |
| `index.html:2180` | Khởi tạo `ELW_NEEDS` | Định nghĩa getter `__elwPetDecoratePatched` trên `ELW_NEEDS` (đọc từ `this.decorate.__elwPetDecoratePatched`) để khi thực hiện lặp nhiều hành động liên tiếp (>14 lượt) gọi `decorateNeeds()` không bị bọc đệ quy hàm `ELW_NEEDS.decorate`. |

### 2.2. `modules/world-3d.js`

| Tọa độ (`file:dòng`) | Hàm / Khu vực | Nội dung thay đổi |
|---|---|---|
| `modules/world-3d.js:422` | `setupFridgePopover()` (click ngoài) | Thêm `\|\| e.target.closest("#panel")` để khi người dùng bấm nút hành động trong `#panel` không làm đóng nhầm `#fridgeCard`. |
| `modules/world-3d.js:429` | `setupFridgePopover()` (mobile) | Đổi thành `closeFridge({ uiOnly: true })` khi tự ẩn bảng trên màn hình nhỏ để không đóng cửa tủ lạnh khi nhân vật đang lấy đồ. |
| `modules/world-3d.js:480-497` | `closeFridge(opts)` | Khi đóng `#fridgeCard` (nút `#btnCloseFridge`, phím `Esc`, click ngoài), nếu `!opts?.uiOnly` và `W.fridge === "open"` thì đồng bộ `W.fridge = "closed"`, gỡ class `.fridge-open`, gọi `applyState()` và `renderObject()`. |

---

## 3. Số liệu Kiểm thử Thực tế (Playwright E2E — `tools/test_repeat_actions.mjs`)

Đã chạy `python tools/build.py` (xuất `english-life-world-ban-day-du.html`, `10709 KB`, `missing: []`) và thực thi `node tools/test_repeat_actions.mjs` trên Chromium Headless:

| # | Kịch bản kiểm thử (Qua đúng đường UI) | Số vòng / Lượt | Kết quả trạng thái `W` & Animation DOM | Kết quả |
|---|---|---|---|---|
| **1** | **Tủ lạnh (`#o-fridge`)**: Mở → Đóng × 10 vòng | **10 vòng** (20 lần bấm UI) | `W.fridge` đổi `"open"` ↔ `"closed"` đúng 20/20 lần; `#o-fridge.fridge-open` & `getComputedStyle(.door).transform` (`matrix(0.12, 0, 0, 1, 0, 0)` ↔ `none`) đổi đúng mỗi lần; nút đang ở trạng thái đích tự `disabled` kèm `.why`. | **PASS (10/10)** |
| **2** | **Đoạn văn của tôi (`#storyCard`) sau 10 vòng** | Sau 20 lượt thực thi | Chế độ `simple`: đúng **2 câu duy nhất** (`"I opened the fridge."`, `"I closed the fridge."`). Chế độ `A2`: đúng **1 câu ghép** (`"I opened the fridge and closed the fridge."`). **0 câu trùng lặp**. | **PASS** |
| **3** | **Nút `🔊` (`[data-say-sent]`) nghe lại câu** | `open_fridge` & `close_fridge` | Phát âm thanh (`spokenDelta === 2`) + hiện bong bóng `.cbub` (`"💬 I'm opening the fridge."` / `"💬 I'm closing the fridge."`), `W.fridge` giữ nguyên `"closed"`, không thêm vào `queue`. | **PASS** |
| **4** | **Đồng bộ `#fridgeCard` (`#btnCloseFridge`)** | Mở tủ → bấm `#btnCloseFridge` | `#fridgeCard.hidden === true`, `W.fridge` chuyển từ `"open"` → `"closed"`, `#o-fridge` gỡ `.fridge-open`, nút `Open the fridge` mở khóa ngay. | **PASS** |
| **5a** | **Ti vi (`#o-tv`, `living`)**: Bật → Tắt × 5 vòng | **5 vòng** (10 lần bấm UI) | `W.tv` đổi `"on"` ↔ `"off"` 10/10 lần; `#o-tv.tv-on` & màu `.tvscreen` đổi đúng mỗi lần. | **PASS (5/5)** |
| **5b** | **Đèn cây (`#o-floorlamp`, `living`)**: Bật → Tắt × 5 vòng | **5 vòng** (10 lần bấm UI) | `W.floorLamp` đổi `"on"` ↔ `"off"` 10/10 lần; `#room.lamp-on` & `.lampglow` opacity đổi đúng mỗi lần. | **PASS (5/5)** |
| **5c** | **Cửa sổ (`#o-window`, `living`)**: Mở → Đóng × 5 vòng | **5 vòng** (10 lần bấm UI) | `W.window` đổi `"open"` ↔ `"closed"` 10/10 lần; `#o-window.win-open` & `#paneL` transform đổi đúng mỗi lần. | **PASS (5/5)** |
| **5d** | **Vòi nước (`#o-sink`, `kitchen`)**: Mở → Khóa × 5 vòng | **5 vòng** (10 lần bấm UI) | `W.k_faucet` đổi `"on"` ↔ `"off"` 10/10 lần; `#world[data-k_faucet]` & `.k-water` opacity đổi đúng mỗi lần. | **PASS (5/5)** |
| **5e** | **Lò vi sóng (`#o-microwave`, `kitchen`)**: Mở → Đóng × 5 vòng | **5 vòng** (10 lần bấm UI) | `W.k_micro` đổi `"open"` ↔ `"closed"` 10/10 lần; `#world[data-k_micro]` & `.k-mwDoor` transform đổi đúng mỗi lần. | **PASS (5/5)** |
| **6** | **Bấm nhanh liên tục & Đổi phòng quay lại** | Burst 6 lần + `kitchen` → `living` | Chỉ 1 mục `open_fridge` chạy (`pendingOrRunningDuringBurst === 1`), không lệch state; bấm khi đã mở hiện toast `"💡 “Open the fridge”: Tủ lạnh đang mở rồi."`. | **PASS** |
| **7** | **Chip Cô Mai / `enqueue` trực tiếp** | Gọi lặp `open_fridge` | Không sinh câu trùng trong `#storyCard` (`totalSentences === uniqueSentences === 14`). | **PASS** |
| **8** | **Nhiệm vụ (`breakfast`, `cafe_order_latte`, `market_weekly_shopping`)** | 3 nhiệm vụ (Auto) | Cả 3 nhiệm vụ hoàn thành 100% (`4/4` bước mỗi nhiệm vụ, `complete: true`). | **PASS (3/3)** |
| **9** | **Giao diện Mobile `390×844` (3 Tab)** | `play`, `learn`, `mission` | Chuyển tab mượt qua `#uimb-bar`, ẩn/hiện đúng `#quickCard`, `#storyCard`, `#missionCard`, `overflowX === 0`. | **PASS (3/3)** |
| **10** | **Lỗi Runtime JavaScript (`pageerror` / `console.error`)** | Toàn bộ phiên test | **`0` lỗi JS**. | **PASS (0 lỗi)** |
