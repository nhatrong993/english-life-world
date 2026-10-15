# KẾ HOẠCH KIỂM THỬ TỰ ĐỘNG & NGHIỆM THU (PET QA PLAN — PLAYWRIGHT)

> **Dự án:** English Life World (`D:\tools\Hoc tieng anh\english-life-world`)  
> **Phụ trách:** Agent A1 (Audit & Design) — Đặc tả cho Agent A8 (QA & Verification)  
> **Công cụ kiểm thử:** Playwright + Node.js Assertion Suite

---

## 1. Mục tiêu Kiểm thử

Đảm bảo toàn bộ bản nâng cấp **Pet Life & Pet Adventure Quest** (từ Agent A2 đến Agent A7) đáp ứng 100% yêu cầu thiết kế kỹ thuật, không phát sinh lỗi `console.error` / `pageerror`, không làm hỏng các tính năng hiện có của **English Life World** (Regression = 0), và vượt qua mọi bài kiểm thử tự động bằng Playwright trên cả giao diện **Desktop (`1366×820`)** lẫn **Mobile (`390×844`)**.

---

## 2. Ma trận Kiểm thử theo từng Hạng mục (A2 → A8 Verification Matrix)

### 2.1. Kiểm thử A2 & A3 — Danh mục 10 Pet, 100 Assets & `assets/pets/manifest.json`

| Mã Test | Nội dung kiểm tra | Tiêu chí đạt (Pass Criteria) |
| :--- | :--- | :--- |
| **QA-ASSET-01** | Kiểm tra số lượng và định danh Pet | Có **đúng 10 Pet** (`milu`, `boba`, `cookie`, `mochi`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`). Tuyệt đối không phải 3 pet cũ hay 12 pet. |
| **QA-ASSET-02** | Kiểm tra phân nhóm Free vs Premium | - **2 Pet Free**: `milu`, `mochi`<br>- **8 Pet Premium**: `boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua` |
| **QA-ASSET-03** | Kiểm tra `assets/pets/manifest.json` | File JSON hợp lệ, có đủ `100` phần tử trong mảng `assets` (`10 pet × 10 state`). Mỗi phần tử có đủ **11 trường bắt buộc**: `petId`, `state`, `assetPath`, `format`, `width`, `height`, `fileSize`, `transparent`, `animationType`, `fallbackState`, `verified`. |
| **QA-ASSET-04** | Kiểm tra tồn tại tệp vật lý & PNG RGBA | Cả 100 file tại `assetPath` đều tồn tại thực tế trên đĩa, header đúng PNG (`89 50 4E 47`), `colorType === 6` (RGBA), `transparent === true`, `verified === true`, `fileSize > 1024`. |
| **QA-ASSET-05** | Kiểm tra hiển thị thực tế trên DOM (`naturalWidth > 0`) | Khi render thẻ Pet hoặc Pet trên sân khấu, thẻ `<img>` tải thành công (`complete === true && naturalWidth > 0`), và có cơ chế chuyển sang `fallbackState` (`idle_happy`) nếu đường dẫn ảnh bị lỗi. |

---

### 2.2. Kiểm thử A4 — Hệ thống 5 Needs, Timestamp Decay & Chính sách Không Phạt

| Mã Test | Nội dung kiểm tra | Tiêu chí đạt (Pass Criteria) |
| :--- | :--- | :--- |
| **QA-NEEDS-01** | Kiểm tra cấu trúc 5 Needs (`0–100`) | State của Pet chứa đủ 5 chỉ số `energy`, `hunger`, `thirst`, `fun`, `bond`, tất cả đều là số nguyên nằm trong đoạn `[0, 100]`. |
| **QA-NEEDS-02** | Tính toán theo `lastUpdatedAt` (Không dùng `setInterval` làm state dài hạn) | Giả lập lùi `lastUpdatedAt` về 3 giờ trước (`Date.now() - 3 * 3600 * 1000`) và gọi đồng bộ/reload trang: các chỉ số `energy`, `hunger`, `thirst`, `fun` giảm đúng theo công thức thời gian thực. |
| **QA-NEEDS-03** | Trần bảo vệ Offline Decay (`Floor >= 25`) & `bond` bất biến khi offline | Giả lập lùi `lastUpdatedAt` về **30 ngày trước** (`Date.now() - 30 * 86400 * 1000`) rồi reload trang:<br>- `energy >= 25`, `hunger >= 25`, `thirst >= 25`, `fun >= 25` (không bao giờ tụt về 0).<br>- Chỉ số `bond` **giữ nguyên 100% giá trị trước khi offline** (không giảm dù chỉ 1 điểm). |
| **QA-NOPNL-01** | Tuyệt đối không phạt khi thoát/dừng nhiệm vụ hoặc vắng mặt | Bắt đầu một nhiệm vụ (`ELW_MISSION.start(...)` hoặc Adventure Quest), sau đó bấm dừng/thoát nhiệm vụ hoặc để trôi thời gian:<br>- Điểm sao (`#pts` / `elw_progress_v1.pts`) **không bị trừ** (không còn `-15⭐`).<br>- Chuỗi `streak` **không bị reset về 0**.<br>- `xp` và danh sách Pet **không bị mất**.<br>- Không xuất hiện modal đe dọa phạt điểm (`#petAcceptPenaltyBtn` không tồn tại). |

---

### 2.3. Kiểm thử A5 — Pet Interaction Panel & 8 Tương tác Chuẩn

| Mã Test | Nội dung kiểm tra | Tiêu chí đạt (Pass Criteria) |
| :--- | :--- | :--- |
| **QA-PANEL-01** | Hiển thị đủ 8 nút tương tác chuẩn | Trong Pet Interaction Panel có đủ 8 nút tương tác với `data-pet-action` (hoặc ID tương ứng):<br>1. `pet` (Vuốt ve)<br>2. `play` (Chơi)<br>3. `feed` (Cho ăn)<br>4. `water` (Cho uống)<br>5. `rest` (Nghỉ)<br>6. `talk` (Nói chuyện)<br>7. `walk` (Dẫn đi chơi)<br>8. `profile` (Hồ sơ) |
| **QA-PANEL-02** | Kiểm tra hiệu lực của từng tương tác chăm sóc (`pet`, `play`, `feed`, `water`, `rest`) | Bấm lần lượt từng nút:<br>- `pet`: tăng `bond` & `fun`, đổi ảnh state sang `excited`/`idle_happy`.<br>- `play`: tăng `fun` & `bond`, đổi ảnh state sang `playful`.<br>- `feed`: tăng `hunger` & `energy`, đổi ảnh state sang `eating` (hoạt động ngay cả khi `treats === 0`).<br>- `water`: tăng `thirst` & `energy`, đổi ảnh state sang `drinking`.<br>- `rest`: tăng `energy`, đổi ảnh state sang `sleepy`. |
| **QA-PANEL-03** | Kiểm tra tương tác `talk` & `profile` | - Bấm `talk`: hiển thị câu thoại tiếng Anh + nghĩa tiếng Việt theo ngữ cảnh/nhu cầu của Pet, phát âm hoặc hiện bong bóng thoại 3D, tăng `bond`.<br>- Bấm `profile`: mở giao diện Hồ sơ chi tiết của Pet hiện tại và bộ sưu tập 10 Pet. |

---

### 2.4. Kiểm thử A6 — Hệ thống Adventure Quest Hợp nhất (2 Lối vào — 1 Session)

| Mã Test | Nội dung kiểm tra | Tiêu chí đạt (Pass Criteria) |
| :--- | :--- | :--- |
| **QA-ADV-01** | Lối vào 1: Bấm từ thanh Ngữ cảnh (`#ctxBar` -> "Đi chơi cùng Pet") | Bấm nút dẫn Pet trên `#ctxBar`:<br>- `UnifiedPetState.context.withPet === true` và `adventureSession.active === true`.<br>- Pet xuất hiện trong cảnh 3D với đúng loài `activePetId` đang chọn (`milu` hoặc `mochi`) ở trạng thái `walking_adventure`.<br>- Trạng thái nút `walk` trong Pet Interaction Panel đồng bộ ngay lập tức. |
| **QA-ADV-02** | Lối vào 2: Click Pet ở nhà -> Bấm "Dẫn đi chơi (`walk`)" | Từ cảnh phòng ở nhà, click vào Pet trên sân khấu (hoặc mở Pet Panel) -> bấm nút `walk`:<br>- Kích hoạt đúng cùng một phiên `adventureSession` như Lối vào 1.<br>- Thanh `#ctxBar` tự động cập nhật trạng thái đang đi cùng Pet.<br>- Không xảy ra hiện tượng nhân đôi Pet (không vừa vẽ mèo `#o-cat` tĩnh vừa vẽ chó `#ctx-dog` lệch loài). |
| **QA-ADV-03** | Kiểm tra cấu trúc Session hợp nhất & Validator | Đối tượng state của Pet chứa đầy đủ các nhánh: `activePetId`, `adventureSession`, `context`, `validator`, `needs`, `inventory`, `dialogue`, `rewardLedger`. Hoàn thành các bước của Adventure Quest thông qua hành động thực tế được `validator` xác nhận chính xác. |

---

### 2.5. Kiểm thử A7 — Chống Farm Thưởng (`rewardLedger`) & Bảo mật Premium

| Mã Test | Nội dung kiểm tra | Tiêu chí đạt (Pass Criteria) |
| :--- | :--- | :--- |
| **QA-LEDGER-01** | Mỗi `objectiveKey` chỉ cộng thưởng đúng 1 lần trong phiên | Hoàn thành một mục tiêu nhiệm vụ (`objectiveKey`): sao (`pts`) và `xp` tăng đúng định mức, `rewardLedger[objectiveKey]` được ghi nhận. Kích hoạt lại cùng mục tiêu đó lần thứ 2: `pts` và `xp` **không tăng thêm**. |
| **QA-LEDGER-02** | Reload trang (`page.reload()`) không cộng thưởng lại | Sau khi đã nhận thưởng một `objectiveKey`, gọi `await page.reload()` và thực hiện lại mục tiêu đó: hệ thống phát hiện `rewardLedger[objectiveKey]` đã tồn tại, không cộng thêm sao hay XP. |
| **QA-PREM-01** | Không thể mở khóa Pet Premium qua UI hoặc sửa `localStorage` | 1. Thử chọn một trong 8 Pet Premium (`boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`) trên UI -> `activePetId` vẫn giữ nguyên là Pet Free (`milu` hoặc `mochi`), hiển thị thông báo khóa/xem trước trung thực.<br>2. Chạy script tiêm vào trình duyệt: `localStorage.setItem("elw_pro_v1", '{"pro":true}')` và sửa `activePetId: "ember"` trong `localStorage` rồi `page.reload()` -> Hệ thống tự động chặn và khôi phục `activePetId` về `"milu"`, không cho phép dùng Pet Premium trái phép. |
| **QA-PREM-02** | Thông báo giới hạn trung thực & Không giả thanh toán | Khi bấm vào Pet Premium hoặc mở modal PRO: hiển thị rõ trạng thái Xem trước (Preview) và giải thích trung thực rằng tính năng mở khóa cần xác thực bản quyền từ Backend; không có nút bấm giả lập thanh toán hay nút tự bật PRO miễn phí. |

---

### 2.6. Kiểm thử Hồi quy Toàn diện (Full Regression Suite)

| Mã Test | Nội dung kiểm tra | Tiêu chí đạt (Pass Criteria) |
| :--- | :--- | :--- |
| **QA-REG-01** | Bố cục 3 Tab (`play` / `learn` / `mission`) trên Desktop & Mobile | Chuyển đổi mượt mà giữa 3 tab `🎮 Chơi`, `📖 Học`, `🎯 Nhiệm vụ`. Ở Mobile (`390×844`), sân khấu `.scene` và `#panel` chỉ hiện ở tab `play`, ẩn ở tab `learn` và `mission`. |
| **QA-REG-02** | Ngăn kéo Tủ lạnh 3D (`#fridgeCard`) | Mặc định ẩn khi mới vào trang; mở ra khi click `#o-fridge` ở bếp và đóng lại khi bấm nút `✕` hoặc phím `Escape`. |
| **QA-REG-03** | Hệ thống Nhiệm vụ gốc (`modules/mission.js`) | Nhiệm vụ `"breakfast"` (Chuẩn bị bữa sáng) vẫn hoạt động đúng cơ chế `guard`, `validator`, `setHints` và `"⚡ Làm ngay"` (`auto`). |
| **QA-REG-04** | Ngữ cảnh Giao tiếp (`modules/context-engine.js`) | Đổi thời tiết (`sunny`, `rainy`, `cold`, `windy`, `hot`) và tình huống (`normal`, `rush`, `weekend`, `sick`) cập nhật đúng mẫu câu trong `#ctxTalkCard`. |
| **QA-REG-05** | Sạch lỗi Console & PageError | Trong suốt quá trình chạy toàn bộ kịch bản kiểm thử Playwright, mảng `consoleErrors` và `pageErrors` bằng `0`. |

---

## 3. Hướng dẫn Thực thi Kiểm thử Tự động (Cho Agent A8)

Agent A8 sẽ cài đặt và thực thi bộ kiểm thử Playwright (ví dụ `qa-pet-system.spec.js` hoặc `qa-pet-verify.js`) theo trình tự:
1. Khởi chạy HTTP server tĩnh phục vụ thư mục `D:\tools\Hoc tieng anh\english-life-world`.
2. Chạy bộ kiểm tra Node.js trực tiếp trên `assets/pets/manifest.json` và 100 tệp PNG trong `assets/pets/<petId>/<state>.png` (**QA-ASSET-01** → **QA-ASSET-04**).
3. Mở trình duyệt Chromium qua Playwright ở độ phân giải Desktop (`1366×820`) và Mobile (`390×844`), gắn listener bắt mọi `console.error` và `pageerror`.
4. Thực thi tuần tự các test case từ **QA-ASSET-05** đến **QA-REG-05**.
5. Xuất báo cáo kết quả chi tiết từng tiêu chí (`PASS` / `FAIL`) trước khi đóng tác vụ.
