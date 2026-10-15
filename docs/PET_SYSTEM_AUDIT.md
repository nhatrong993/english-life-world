# BÁO CÁO KIỂM TOÁN HỆ THỐNG THÚ CƯNG HIỆN TẠI (PET SYSTEM AUDIT)

> **Dự án:** English Life World (`D:\tools\Hoc tieng anh\english-life-world`)  
> **Phụ trách:** Agent A1 (Audit & Design)  
> **Phạm vi khảo sát:** `modules/pet-survival.js`, `modules/mission.js`, `modules/context-engine.js`, `modules/world-3d.js`, `modules/premium.js`

---

## 1. Tổng quan hiện trạng

Hệ thống thú cưng hiện tại trong **English Life World** đang bị phân mảnh thành nhiều mảnh ghép rời rạc giữa các module:
1. **`modules/pet-survival.js`**: Một thẻ phụ (`#petSurvivalCard`) chỉ có 3 thú cưng dạng biểu tượng Emoji, 2 thanh chỉ số đơn giản (`hunger`, `mood`) và một cơ chế đếm ngược phạt điểm khắc nghiệt khi làm nhiệm vụ.
2. **`modules/context-engine.js`**: Một cờ `walkDog` vẽ hình SVG chú chó Corgi (`#ctx-dog` tên Milo) đi theo nhân vật nhưng hoàn toàn tách biệt với dữ liệu của `pet-survival.js` cũng như tách rời với chú mèo cảnh (`#o-cat`) trong phòng khách ở nhà.
3. **`modules/mission.js`**: Hệ thống nhiệm vụ có kiến trúc `validator` / `guard` / `auto` tốt nhưng đang bị `pet-survival.js` can thiệp thô bạo (monkey-patching `M.start` và `M.stop`) để gắn bộ đếm ngược phạt sao.
4. **`modules/world-3d.js`**: Quản lý bố cục 3 tab (`play` / `learn` / `mission`) nhưng khóa cứng `#petSurvivalCard` vào tab `mission`, khiến người học không thể tương tác trực tiếp với thú cưng ngay trong không gian sống 3D.
5. **`modules/premium.js`**: Cơ chế kiểm tra gói PRO lưu trực tiếp dưới dạng biến boolean trong `localStorage` (`elw_pro_v1`) kèm nút bật/tắt tự do trên giao diện, không có khả năng chống giả mạo phía client.

---

## 2. Phân tích chi tiết từng Module

### 2.1. `modules/pet-survival.js` — Hệ thống Pet & Nhiệm vụ Sinh tồn Cũ

| Khía cạnh | Hiện trạng trong Code (`modules/pet-survival.js`) | Vấn đề & Hạn chế |
| :--- | :--- | :--- |
| **Danh sách Thú cưng** | Chỉ định nghĩa 3 pet bằng Emoji tĩnh tại dòng `9–13`:<br>- `milo`: `🐕 Milo (Cún Corgi)` — Free<br>- `mochi`: `🐱 Mochi (Mèo Vàng)` — Free<br>- `leo`: `🦊 Leo (Cáo Tuyết PRO)` — Pro | - Chỉ dùng ký tự Emoji (`🐕`, `🐱`, `🦊`), không có hình ảnh nhân vật (PNG RGBA) theo từng trạng thái cảm xúc/hành động.<br>- Số lượng quá ít (3 pet), chưa đáp ứng danh mục chuẩn **10 Pet** (3 Chó, 3 Mèo, 4 Thú Hiếm). |
| **Hệ thống Chỉ số (Needs)** | Chỉ có 2 chỉ số trong state `S` (dòng `23–34`):<br>- `hunger` (Độ no, mặc định `78`)<br>- `mood` (Độ vui, mặc định `84`) | - Thiếu các nhu cầu thiết yếu của một hệ thống Pet Life hoàn chỉnh (`energy`, `thirst`, `fun`, `bond`).<br>- Không phản ánh được trạng thái mệt mỏi, khát nước hay mức độ gắn bó lâu dài với người học. |
| **Cơ chế Thời gian & Lưu trữ dài hạn** | Dùng `setInterval` mỗi **90 giây** (`90000ms`, dòng `629–636`) để trừ `S.hunger = clamp(S.hunger - 1)` rồi lưu vào `localStorage` (`elw_pet_v1`). Trường `lastTick` được khai báo ở dòng `33` nhưng **không bao giờ được sử dụng**. | - Phụ thuộc vào `setInterval` làm state dài hạn: nếu đóng tab thì thời gian ngừng trôi; nếu treo tab lâu thì `hunger` tụt dần về `0` mà không có sàn bảo vệ (safe floor).<br>- Không tính toán dựa trên mốc thời gian thực (`lastUpdatedAt`). |
| **Tương tác Chăm sóc** | Chỉ có 2 nút bấm trong `#petSurvivalCard` (dòng `580–587`):<br>- `#btnFeedPet` (`feedPet()`): tốn 1 `treats`, `+28 hunger`, `+10 mood`, `+12 xp`.<br>- `#btnPlayPet` (`playWithPet()`): tốn 1 `toys`, `+30 mood`, `+12 xp`. | - Nếu hết `treats` hoặc `toys` (`<= 0`), cả hai nút bị `disabled`, người chơi bị ép phải làm nhiệm vụ đếm ngược.<br>- Thiếu 6 tương tác cốt lõi khác: Vuốt ve (`pet`), Cho uống (`water`), Nghỉ ngơi (`rest`), Nói chuyện (`talk`), Dẫn đi chơi (`walk`), Hồ sơ (`profile`). |
| **Cơ chế Phạt Nặng (High-Stakes Penalty)** | Khi bắt đầu bất kỳ nhiệm vụ nào, `hookMissionEngine()` (dòng `459–506`) áp đặt thời gian `135 giây`. Khi người dùng bấm dừng nhiệm vụ (`showQuitPenaltyModal`, dòng `347–385`) hoặc khi đồng hồ về `0` (`renderTimerBanner`, dòng `452–456`), hàm `applyPenalty()` (dòng `387–401`) được kích hoạt:<br>- Trừ **-15 sao** (`adjustPoints(-15)`)<br>- Xóa sạch chuỗi **Combo Streak về 0** (`S.streak = 0`)<br>- Giảm **-20% `hunger`** và **-18% `mood`** | - **Gây ức chế tâm lý nặng nề cho người học**: Trẻ em hoặc người học đang tra cứu từ vựng, nghe phát âm chậm hoặc bận việc đột xuất đều bị phạt trừ sao đã vất vả tích lũy và mất trắng chuỗi streak.<br>- Đi ngược lại triết lý giáo dục khích lệ, ấm áp (Cozy Learning Companion). |

---

### 2.2. `modules/mission.js` — Hệ thống Nhiệm vụ (Step Validator / Guard / Auto)

* **Kiến trúc hiện tại**:
  * **Cấu trúc Mission (`MISSIONS`, dòng `16–56`)**: Mỗi nhiệm vụ gồm danh sách các bước tuần tự `steps` (`n`, `icon`, `title_en`, `title_vi`, `say_en`, `say_vi`, `actions`, hàm kiểm tra `done(W)`, hàm chọn bước kế tiếp `next(W)`, và `hint`).
  * **Step Validator (`stepStates(W)`, dòng `64–76`)**: Kiểm tra trạng thái thực tế của `WorldState` (`W`) kết hợp với mảng `st.doneSteps` (đảm bảo bước đã hoàn thành không bị mất trạng thái khi nguyên liệu được tiêu thụ ở bước sau). Phân loại bước thành 3 trạng thái: `done`, `active`, `locked`.
  * **Action Guard (`guard(actionId, W)`, dòng `80–91`)**: Được gọi trước mọi hành động (cả bấm tay và tự động). Nếu `actionId` nằm trong một bước đang `locked`, hàm trả về chuỗi lý do từ chối bằng tiếng Việt (`"Bước X đang khóa. Hãy hoàn thành bước Y trước."`).
  * **Auto Runner (`auto()` & `autoStep()`, dòng `138–160`)**: Tính năng `"⚡ Làm ngay"` chỉ đẩy duy nhất hành động hợp lệ tiếp theo (`s.next(W)`) của bước `active` vào hàng đợi (`host.enqueue(id)`), chờ `onIdle()` hoặc `onAction()` rồi mới thực hiện bước kế tiếp.
* **Đánh giá & Vấn đề khi tích hợp với Pet**:
  * Cơ chế `validator` / `guard` / `auto` của `mission.js` rất chuẩn mực và đáng tin cậy.
  * Tuy nhiên, `mission.js` hiện chỉ phục vụ các nhiệm vụ sinh hoạt gia đình/nấu ăn thông thường và bị `pet-survival.js` wrap hàm `start`/`stop`.
  * Chưa có cầu nối dữ liệu chuẩn với phiên phiêu lưu của thú cưng (`adventureSession`) và chưa có sổ cái chống cày thưởng lặp lại (`rewardLedger`) khi người chơi làm lại cùng một mục tiêu hoặc tải lại trang.

---

### 2.3. `modules/context-engine.js` — Ngữ cảnh 5 Yếu tố & Chú chó `#ctx-dog`

* **Hiện trạng biến `walkDog` và `#ctx-dog`**:
  * Lưu trạng thái `S = { walkDog: false, sit: "normal", open: false, practiced: {} }` trong `localStorage` (`elw_ctx_v1`, dòng `8–23`).
  * Khi `S.walkDog === true`, hàm `renderDogInScene()` (dòng `1067–1131`) vẽ một phần tử SVG `<g id="ctx-dog">` đi cạnh nhân vật chính và chạy vòng lặp `setInterval` mỗi `450ms` (dòng `1427–1431`) để cập nhật tọa độ theo `W.x, W.y`.
* **Sự đứt gãy & Thiếu đồng bộ nghiêm trọng**:
  1. **Tách rời hoàn toàn với `#o-cat` ở nhà**: Trong cảnh phòng khách (`living`), có sẵn đối tượng chú mèo trên sân khấu (`#o-cat`), nhưng `#ctx-dog` lại là một chú chó Corgi riêng biệt. Khi bật `walkDog` ở nhà, xuất hiện cả mèo `#o-cat` đứng yên lẫn chó `#ctx-dog` đi theo nhân vật mà không có sự liên kết nào.
  2. **Không liên kết với `ELW_PET` state**: Dù người dùng chọn nuôi mèo **Mochi** hay cáo tuyết **Leo** trong `pet-survival.js`, nút `#ctxBtnDog` trên thanh ngữ cảnh vẫn luôn ghi `"🐕 Dắt chó đi bộ"` và luôn vẽ chú chó Corgi tên `"🐕 Milo"` (dòng `1106–1129`).
  3. **Mẫu câu cố định (`PET_PHRASE_BANK`, dòng `150–157`)**: Chỉ có 4 câu thoại cứng dành cho `"Milo"`, không phản ánh đúng tên thú cưng đang chọn (`activePetId`), loài thú cưng, hay nhu cầu thực tế (`hunger`, `thirst`, `energy`, `fun`, `bond`).

---

### 2.4. `modules/world-3d.js` — Bố cục 3 Tab & Quản lý `#petSurvivalCard`

* **Hiện trạng bố cục 3 Tab (`play` / `learn` / `mission`)**:
  * `world-3d.js` chia cột bên phải (`.side`) thành 3 nhóm thẻ thông qua hàm `applyTabVisibility()` (dòng `703–707`):
    * `play`: `["ctxTalkCard", "quickCard", "evTray", "rpCard", "peopleCard", "needsCard"]`
    * `learn`: `["seqCard", "storyCard", "vocab3000Card", "invWrap", "mistakeCard", "speakingCard"]`
    * `mission`: `["missionCard", "chCard", "petSurvivalCard", "dayHud"]`
* **Hạn chế về Trải nghiệm Người dùng (UX)**:
  * `#petSurvivalCard` bị xếp cố định ở vị trí thứ 3 trong tab `mission` (`arrangeManagedCards()`, dòng `516`).
  * Khi người dùng đang ở tab `play` (tab mặc định khi vào ứng dụng để khám phá cảnh 3D), toàn bộ bảng điều khiển thú cưng bị ẩn bằng class `.w3d-tab-hidden` (`display: none !important`).
  * Bấm vào thú cưng trên sân khấu 3D chưa mở ra bảng tương tác trực tiếp (Pet Interaction Panel) gồm đầy đủ các hành động chăm sóc, trò chuyện và dẫn đi chơi.

---

### 2.5. `modules/premium.js` — Lỗ hổng Bảo mật Mở khóa PRO (`elw_pro_v1`)

* **Hiện trạng cơ chế lưu trữ và kích hoạt**:
  * Dòng `8–11`: Đọc trực tiếp `localStorage.getItem("elw_pro_v1")` và gán vào `S = { pro: false }`.
  * Dòng `134–150`: Trong hộp thoại `#modal`, nút `#proToggleBtn` (`"🎁 Kích hoạt PRO Ngay (Mở khóa toàn bộ)"`) thực thi `S.pro = !S.pro; save();` ngay lập tức mà không qua bất kỳ bước xác thực nào.
  * Dòng `160–161`: Phơi bày trực tiếp hàm `window.ELW_PREMIUM.setPro(true)` ra biến toàn cục `window`.
* **Rủi ro gian lận & Giả mạo (Client-side Tampering)**:
  * Bất kỳ người dùng nào cũng có thể bấm nút `#proToggleBtn` trên giao diện, hoặc mở DevTools Console gõ `localStorage.setItem("elw_pro_v1", '{"pro":true}')` hay `ELW_PREMIUM.setPro(true)` để mở khóa toàn bộ thú cưng hiếm (Premium Pets).
  * Chưa phân tách rõ ràng giữa **trạng thái xem trước (Preview Only)** và **quyền sở hữu thực sự (Verified Entitlement)** trong bối cảnh ứng dụng chưa có Backend xác thực thanh toán.

---

## 3. Tổng kết các yêu cầu kiến trúc cần thay thế

Từ kết quả kiểm toán trên, hệ thống thú cưng mới cần giải quyết triệt để 5 nhóm vấn đề cốt lõi:
1. **Chuẩn hóa danh mục đúng 10 Pet** (2 Free: `milu`, `mochi`; 8 Premium: `boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`) với **100 asset hình ảnh PNG RGBA** (`10 pet × 10 state`) thay cho 3 Emoji cũ.
2. **Thay thế hệ thống 2 chỉ số + `setInterval` phạt sao** bằng **Hệ thống 5 Needs (`energy`, `hunger`, `thirst`, `fun`, `bond`)** tính theo timestamp `lastUpdatedAt`, có sàn offline decay `>= 25`, `bond` không giảm khi offline, và **tuyệt đối không phạt** (không trừ sao, không mất pet/XP/streak) khi người học vắng mặt hay dừng nhiệm vụ.
3. **Xây dựng Pet Interaction Panel gồm đúng 8 tương tác**: Vuốt ve (`pet`), Chơi (`play`), Cho ăn (`feed`), Cho uống (`water`), Nghỉ (`rest`), Nói chuyện (`talk`), Dẫn đi chơi (`walk`), Hồ sơ (`profile`).
4. **Hợp nhất hệ thống Pet Adventure Quest**: Đồng bộ hoàn toàn giữa lối vào từ thanh Ngữ cảnh (`"Đi chơi cùng Pet"`) và lối vào từ click Pet ở nhà -> `"Dẫn đi chơi"`, dùng chung một state duy nhất (`activePetId`, `adventureSession`, `context`, `validator`, `needs`, `inventory`, `dialogue`, `rewardLedger`) kèm sổ cái chống farm thưởng.
5. **Bảo mật quyền Premium trung thực**: Chặn hoàn toàn việc mở khóa Pet Premium qua chỉnh sửa `localStorage` hoặc biến state; hiển thị chế độ khóa/xem trước (Preview) kèm thông báo minh bạch rằng tính năng mở khóa cần xác thực từ hệ thống Backend.
