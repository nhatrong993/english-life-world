# BÁO CÁO AUDIT TOÀN DIỆN — ENGLISH LIFE WORLD 2.0
**Dự án:** `D:\tools\Hoc tieng anh\english-life-world`  
**Ngày kiểm toán:** 2026-10-14  
**Chế độ kiểm toán:** Read-Only Code Inspection + Automated Playwright E2E Browser Verification (Desktop `1440×900` & Mobile `390×844`)  
**Dữ liệu thô đối chiếu:** [docs/audit_raw_results.json](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/docs/audit_raw_results.json)

---

## 1. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

| Hạng mục | Kết quả | Chi tiết cốt lõi |
|---|---|---|
| **Runtime / Console / Network** | **PASS** | `0` lỗi Console Error, `0` Page Exception, `0` lỗi tải tài nguyên mạng (`failed_requests: []`). |
| **Bố cục `#panel` ("Chọn Hành động")** | **FAIL (P0)** | Đúng như phản ánh của người dùng: [modules/world-3d.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/world-3d.js#L513-L519) đã di chuyển `#panel` từ dưới cảnh 3D (`.leftcol`) sang cột phải (`.side`) và đặt dưới `#ctxTalkCard`. Trên Desktop (`1440×900`), `#panel` lệch sang phải (`x: 870, y: 1170` so với `#room` ở `x: 109, y: 346..815`). Trên Mobile (`390×844`), `#panel` bị đẩy xuống cách đáy cảnh 3D tới **715px** (`distanceFromRoomBottomToPanelTop: 715`). Ngoài ra, khi đang ở tab `📚 3000 Từ` hoặc `🔥 Nhiệm vụ & Pet`, bấm vào đồ vật trong cảnh 3D không hiện `#panel` vì bị khóa bởi `.w3d-tab-hidden`. |
| **Xung đột 2 hệ thống Tab trên Mobile** | **FAIL (P0)** | [modules/ui-mobile.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-mobile.js#L13-L18) tạo thanh bottom bar `#uimb-bar` (4 tab: `Chơi`, `Học`, `Nhà`, `Thêm` dùng `.uimb-tab-hidden`), trong khi [modules/world-3d.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/world-3d.js#L482-L570) tạo `#w3dModeTabs` (3 tab: `play`, `learn`, `mission` dùng `.w3d-tab-hidden`). Hai hệ thống ẩn/hiện chồng chéo lên nhau. |
| **Đồng bộ Nhiệm vụ → Pet Survival & Điểm số** | **FAIL (P0)** | [modules/mission.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/mission.js#L177) trả về `v.complete` (`boolean`), nhưng [modules/pet-survival.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/pet-survival.js#L487) lại kiểm tra `v.finished` (không tồn tại) → hoàn thành nhiệm vụ không cộng thưởng cho Pet (`petMissionsWonAfterComplete: 0`). Đồng thời `adjustPoints()` ghi vào `localStorage["elw_progress_v1"]` nhưng không cập nhật biến `P.pts` trong bộ nhớ của `index.html`. |
| **Popover Tủ lạnh (`#fridgeCard`)** | **PARTIAL / FAIL (P1)** | Chỉ xuất hiện khi bấm vào `#o-fridge` (`opensOnClick: true`) và đóng khi bấm `✕` hoặc bên ngoài, nhưng **không đóng khi nhấn phím `Escape`** (`closesOnEscape: false`) và chưa tự đóng sau khi chọn một hành động bên trong. |
| **Hệ thống 3000 Từ & Mẫu câu (`vocab-3000.js`)** | **PARTIAL / FAIL (P1)** | Dữ liệu thực tế toàn ứng dụng hiện có **1.830 mục từ vựng thô / 829 từ duy nhất** (trong đó `vocab-3000.js` chứa 144 từ chọn lọc chia 6 cấp độ CEFR A1–C2), chưa đủ 3.000 bản ghi thực. UI hiện cắt `.slice(0, 24)` từ mỗi domain, thiếu ô tìm kiếm (`hasSearchInput: false`) và phân trang. |
| **So sánh Chơi tay (Lượt A) vs "Làm ngay" (Lượt B)** | **PASS** | Kiểm thử nhiệm vụ 4 bước `breakfast` cho kết quả trạng thái cuối (`W`) **đồng nhất 100%** giữa chơi tay từng bước và nút `⚡ Làm ngay` (`complete: true`, `eggsInFridge: 5`, `eggsOnCounter: 0`, `k_stove: "off"`, `k_pan: "egg"`, `k_table: "set"`). |
| **Bong bóng thoại 3D (`#lt-scene-bub`) & Thời tiết** | **PASS** | Bong bóng thoại của Linh nằm trực tiếp trong `#room` ngay phía trên `#linh`, đồng bộ EN + VI, nút `🔊` hoạt động. Trời mưa (`rainy`) sáng rõ, không có lớp phủ tối `multiply`. |

---

## 2. GIẢI THÍCH LỖI DỄ HIỂU (`/awf-error-translator`)

Để dễ hình dung nguyên nhân các bất cập bạn vừa gặp trên cả PC và Mobile:

1. **Tại sao bảng "Chọn Hành động" (`#panel`) lại bị đẩy đi xa khỏi khung hình 3D?**
   - **Giải thích đời thường:** Ban đầu trong `index.html`, bảng "Chọn Hành động" nằm ngay dưới chân khung cảnh căn phòng (giống như bảng điều khiển gắn liền dưới màn hình TV). Nhưng khi nâng cấp lên giao diện 3 tab ở `world-3d.js`, đoạn code sắp xếp tab đã "bê" bảng này sang cột bên phải và xếp nó nằm dưới cả bảng Hội thoại ngữ cảnh. Hệ quả là trên máy tính bạn phải đảo mắt sang cột phải và cuộn xuống mới thấy nút bấm; còn trên điện thoại bạn phải cuộn qua thanh thời tiết (dài 9 dòng) + thanh tab + bảng hội thoại (tổng cộng hơn **715px**) mới tới nơi chọn hành động!
   - **Cách khắc phục:** Trả `#panel` ("Chọn Hành động") về đúng vị trí vàng **ngay bên dưới khung cảnh `#room`** trong `.leftcol`, luôn hiển thị ở mọi tab để hễ bấm vào đồ vật trên hình là thấy ngay danh sách hành động ở sát bên dưới (trên cả PC lẫn Mobile), đồng thời thu gọn thanh thời tiết/ngữ cảnh trên Mobile thành dạng cuộn ngang 1 dòng.

2. **Tại sao làm xong Nhiệm vụ mà Pet Corgi không nhận được thưởng?**
   - **Giải thích đời thường:** Bộ phận Nhiệm vụ (`mission.js`) khi báo cáo kết quả thì ghi vào tờ giấy chữ `complete: true` ("Đã hoàn thành"). Nhưng chú cún Corgi (`pet-survival.js`) lại đứng chờ chữ `finished: true` ("Đã kết thúc"). Vì hai bên dùng hai từ khóa khác nhau nên dù bạn tự làm hay bấm "Làm ngay" xong 100%, chú cún vẫn tưởng bạn chưa làm xong.

3. **Tại sao trên điện thoại có lúc các khung bị ẩn mất khi bấm chuyển tab?**
   - **Giải thích đời thường:** Trên điện thoại đang có "hai người gác cổng" cùng lúc: thanh 3 tab mới ở trên (`world-3d.js`) và thanh 4 tab cũ ở đáy màn hình (`ui-mobile.js`). Khi người này mở cửa thì người kia lại khóa cửa bằng lệnh `display: none !important`.

---

## 3. KIỂM KÊ KIẾN TRÚC VÀ ĐỘ BAO PHỦ MODULE (MỤC 3 MASTER PROMPT)

### 3.1. Xác minh các file trong danh sách khởi điểm của Master Prompt
Lưu ý quan trọng từ kiểm tra cây thư mục thực tế (`modules/`):
- **Hai file `modules/life-shell.js` và `modules/life-core.js` KHÔNG TỒN TẠI** trong thư mục dự án. Kiến trúc thực tế đặt core loop và shell trực tiếp trong [index.html](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/index.html) kết hợp với [modules/ui-scene.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-scene.js), [modules/ui-mission.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-mission.js), [modules/ui-companion.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-companion.js), [modules/ui-mobile.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-mobile.js), [modules/ui- polish.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-polish.js) và [modules/world-3d.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/world-3d.js).

### 3.2. Bảng kiểm kê toàn bộ 34 file JS trong `modules/` + `index.html`

| STT | File / Module | Global Symbol | Trách nhiệm thực tế | Điểm tích hợp & Phụ thuộc | Timer / Listener / Storage | Rủi ro khi re-init / Đổi chủ đề |
|---|---|---|---|---|---|---|
| 1 | [index.html](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/index.html) | `W`, `P`, `ELW`, `renderWorld`, `pickObj`, `runAct` | Core state (`W`), tiến độ (`P`), render SVG phòng & nhân vật Linh, xử lý chuỗi câu tiếng Anh, speech synthesis. | Điểm vào chính của toàn bộ app. Expose `window.__ELW_BRIDGE`. | `localStorage` (`elw_progress_v2`, `elw_world_v2`), click listeners. | `P.pts` lưu trong closure, các module ngoài sửa `localStorage` trực tiếp sẽ bị lệch với `P.pts`. |
| 2 | [modules/world-3d.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/world-3d.js) | `ELW_WORLD_3D` | Chuyển đổi góc nhìn 3D Diorama CSS (`perspective: 1100px`, `rotateX`), quản lý 3 tab (`#w3dModeTabs`), popover `#fridgeCard`, lọc `#needsCard` theo chủ đề. | Khởi tạo ở `DOMContentLoaded`. Đọc `ELW_Topics`, `W`. | `MutationObserver` trên `#room`, `setInterval(1200ms)`, `localStorage["elw_3d_mode"]`. | **LỖI P0:** Di chuyển `#panel` sang `.side` và ẩn `#panel` khi khác tab `play`. Thiếu listener `Escape` cho `#fridgeCard`. |
| 3 | [modules/context-engine.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/context-engine.js) | `ELW_CONTEXT` | Quản lý 5 thời tiết (`sunny`, `rainy`, `sunset`, `night`, `snowy`) và 8 ngữ cảnh giao tiếp (`solo`, `walk_dog`, `hangout_friend`, `rainy_chat`, `Ordering`, `picnic`, `workout`, `study_group`). | Gắn `#ctxBar` trên `#room` và `#ctxTalkCard` trong `.side`. Gọi `ELW_LifeTalk` & `speak()`. | `localStorage["elw_context_v2"]`, click listeners. | Trên Mobile, `#ctxBar` hiển thị toàn bộ nút khiến chiều cao chiếm **426px** (9 dòng). |
| 4 | [modules/pet-survival.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/pet-survival.js) | `ELW_PET_SURVIVAL` | Nuôi Pet Corgi (`buddy`), thanh HP/Hunger/Mood/Streak, đồng hồ đếm ngược 180s ép hoàn thành nhiệm vụ, phạt điểm khi hết giờ. | Gắn `#petSurvivalCard` (tab `mission`) và `#petMiniHud` (trong `#room`), render `#petBuddy3d`. | `setInterval(1000ms)`, `localStorage["elw_pet_survival_v2"]`. | **LỖI P0:** Kiểm tra `v.finished` thay vì `v.complete` của `ELW_MISSION.view(W)`. Ghi điểm vào `elw_progress_v1` (cũ) thay vì cập nhật `P.pts`. |
| 5 | [modules/vocab-3000.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/vocab-3000.js) | `ELW_VOCAB_3000` | Ngân hàng từ vựng phân tầng CEFR (`A1`–`C2`) và 10 chủ đề Oxford, SRS Mastery, tích hợp nút mở khóa Premium. | Gắn `#vocab3000Card` trong `.side` (tab `learn`), tổng hợp thêm từ `ELW.ACTIONS` & `ELW_ROOMS`. | `localStorage["elw_vocab3000_v2"]`. | Chỉ hiển thị `.slice(0, 24)` từ/chủ đề, không có thanh tìm kiếm hay phân trang. Tổng từ thực tế là 829 từ duy nhất (chưa đủ 3000). |
| 6 | [modules/premium.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/premium.js) | `ELW_PREMIUM` | Quản lý trạng thái Free vs Pro, hiển thị modal nâng cấp (`#elwPremiumModal`), công tắc dùng thử 7 ngày (Sandbox Toggle). | Gắn nút `👑 Nâng cấp Pro` trên `.top` bar, cung cấp `canAccess()`, `requirePro()`. | `localStorage["elw_premium_v2"]`. | Hoạt động an toàn, 100% client-side sandbox, không gọi API thanh toán thật. |
| 7 | [modules/life-talk.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/life-talk.js) | `ELW_LifeTalk` | Hệ thống hội thoại sống động của Linh & NPC, render bong bóng thoại `#lt-scene-bub` ngay trên đầu Linh trong `#room`, hỗ trợ chế độ nghe tuần tự EN → VI. | Hook vào `ELW_Routine`, `ELW_Needs`, `ELW_Topics`, `ELW_Day`, `ELW_Events`. | `setInterval`, `setTimeout`, `speechSynthesis`, `localStorage["elw_lifetalk_seq_audio"]`. | Đã có cờ chống chồng giọng (`_seqPlaying`). Bong bóng tự co giãn và nằm trong `#room`. |
| 8 | [modules/mission.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/mission.js) | `ELW_MISSION` | Engine nhiệm vụ đa bước có thứ tự (7 nhiệm vụ: `breakfast`, `laundry_fold`, `water_plants`, `make_tea`, `clean_spill`, `air_room`, `sleep_prep`), kiểm tra `guard()` và tự động chạy `auto()`. | Tích hợp vào `index.html` và [modules/ui-mission.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-mission.js). | Không dùng timer nền riêng (`auto()` dùng async loop). | Logic `apply()` và `auto()` chuẩn xác 100%, nhưng thuộc tính trả về là `complete` (cần đồng bộ với `pet-survival.js`). |
| 9 | [modules/ui-mission.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-mission.js) | `ELW_UI_Mission` | Render giao diện danh sách nhiệm vụ nhiều bước, nút `⚡ Làm ngay` và trạng thái từng bước trong `#seqCard`. | Phụ thuộc `ELW_MISSION`, `__ELW_BRIDGE`. | Click listeners. | Hoạt động tốt khi chọn nhiệm vụ và bấm `⚡ Làm ngay`. |
| 10 | [modules/ui-scene.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-scene.js) | `ELW_UI_Scene` | Hiển thị nhãn đồ vật (pill label), chấm trạng thái và gợi ý bước tiếp theo trong `#room`. | Đọc `ELW_MISSION`, `W`. | `MutationObserver`, click listeners. | Không bị nhân đôi listener khi đổi phòng. |
| 11 | [modules/ui-companion.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-companion.js) | `ELW_Companion` | Quản lý bảng hội thoại phụ, nhật ký hành động và gom nhóm thẻ phụ. | Đọc `__ELW_BRIDGE`. | Click listeners. | Hoạt động ổn định. |
| 12 | [modules/ui-mobile.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-mobile.js) | `ELW_UI_Mobile` | Thanh điều hướng đáy màn hình `#uimb-bar` cho màn hình `<= 760px`. | Tự chạy khi `window.innerWidth <= 760`. | `resize` listener, click listeners. | **LỖI P0:** Xung đột trực tiếp với `#w3dModeTabs` của `world-3d.js` vì cả hai cùng ẩn/hiện các card trong `.side`. |
| 13 | [modules/ui-polish.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-polish.js) | `ELW_UI_Polish` | Tinh chỉnh giao diện, thu gọn các khối ít dùng. | Chạy sau khi khởi tạo DOM. | Click listeners. | Hoạt động ổn định. |
| 14 | [modules/challenge.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/challenge.js) | `ELW_CHALLENGES` | Danh sách thử thách nhanh (`#chCard`), đã gắn thuộc tính `topic` và hàm `forTopic(topicId)`. | Được gọi trong `index.html` (`nextCh()`). | Không có timer. | Đã lọc đúng thử thách theo chủ đề ngoài nhà (`supermarket`, `cafe`, `park`, `restaurant`, `outdoor`). |
| 15 | [modules/day.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/day.js) | `ELW_Day` | Chu kỳ thời gian trong ngày (Sáng/Trưa/Chiều/Tối/Đêm) và thời tiết cơ bản (`#dayBar`). | Gắn trong `.top` bar. | `setInterval`, click listeners. | Đã bỏ lớp phủ `mix-blend-mode: multiply` gây tối cảnh khi trời mưa. |
| 16 | [modules/food.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/food.js) | `ELW_Food` | Quản lý thực phẩm trong tủ lạnh (`#fridgeCard`), nấu ăn, ăn uống. | Tích hợp vào `#fridgeCard`. | Click listeners. | Khi kết hợp với popover `#fridgeCard` của `world-3d.js`, chỉ hiện khi bấm vào `#o-fridge`. |
| 17 | [modules/needs.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/needs.js) | `ELW_Needs` | Quản lý 5 chỉ số tình trạng ngôi nhà & nhu cầu (`#needsCard`). | Gắn trong `.side`. | `setInterval`. | Được `world-3d.js` tự động ẩn khi chuyển sang chủ đề ngoài nhà (`home` only). |
| 18 | [modules/topics.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/topics.js) | `ELW_Topics` | Bộ chuyển đổi chủ đề (`#topicSwitcher`: `home`, `supermarket`, `cafe`, `school`, `park`, `restaurant`, `outdoor`). | Gắn trên đầu trang, điều phối `ELW_ROOMS`. | Click listeners, `localStorage`. | Chuyển chủ đề mượt, phát sự kiện `elw:topicchange`. |
| 19–35 | Các module dữ liệu & phụ trợ (`rooms.js`, `rooms-catalog.js`, `rooms-catalog-living.js`, `rooms-render.js`, `topic-supermarket.js`, `topic-cafe.js`, `topic-school.js`, `topic-park.js`, `topic-restaurant.js`, `topic-outdoor.js`, `routine.js`, `events.js`, `practice.js`, `character.js`, `fixer.js`, `progress.js`, `scenes.js`) | `ELW_ROOMS`, `ELW_Routine`, `ELW_Events`, `ELW_Practice`, v.v. | Cung cấp dữ liệu đồ vật, hành động, SVG cảnh ngoài nhà, sự kiện ngẫu nhiên và luyện phát âm. | Được nạp tuần tự trong `index.html`. | `ELW_Events` và `ELW_Routine` có timer kiểm tra định kỳ. | Toàn bộ 35 globals đều nạp thành công (`100% loaded`). |

---

## 4. KẾT QUẢ KIỂM THỬ CHI TIẾT TỪNG HẠNG MỤC (MỤC 4 MASTER PROMPT)

### A. Giao diện tổng thể & Bố cục Desktop / Mobile
- **3 Tab chế độ (`🎮 Chơi & Giao tiếp`, `📚 3000 Từ & Mẫu câu`, `🔥 Nhiệm vụ & Pet`):**
  - Chuyển tab liên tục hoạt động không gây lỗi JS.
  - **FAIL (Bố cục `#panel` "Chọn Hành động"):**
    - **Quan sát của User:** *"Tôi đã thấy có 1 chút bất cập trong phần Chọn Hành động, nó nên phải là ở dưới video hình ảnh, để dễ sử dụng, cả mobile lẫn pc"*.
    - **Bằng chứng đo đạc (`docs/audit_raw_results.json`):**
      - Trên **Desktop (`1440×900`)**: Khung cảnh `#room` nằm ở cột trái (`x: 109, y: 346, width: 747, height: 470, bottom: 815`), nhưng `#panel` ("Chọn Hành động") lại bị `world-3d.js` di chuyển sang cột phải `.side` ở tọa độ (`x: 870, y: 1170, width: 461, height: 590`) — nằm tít bên dưới `#ctxTalkCard`, buộc người dùng trên PC phải cuộn trang mới thấy nút hành động!
      - Trên **Mobile (`390×844`)**: Khung cảnh `#room` kết thúc ở `bottom: 707px`, nhưng `#panel` nằm ở `y: 1422px` (cách đáy khung hình 3D **715px**). Nguyên nhân là `#ctxBar` (thanh chọn thời tiết + ngữ cảnh) bị rớt dòng thành 9 hàng (chiếm chiều cao **426px**) và `#ctxTalkCard` (chiếm **657px**) chèn lên trước `#panel`.
      - Ngoài ra, khi người dùng đang mở tab `📚 3000 Từ` hoặc `🔥 Nhiệm vụ & Pet` và click vào một đồ vật trong `#room` (ví dụ bấm vào giường `#o-bed`), `#panel` vẫn bị ẩn (`panel_visible_when_clicking_obj_in_other_tab: false`).
  - **FAIL (Xung đột 2 thanh Tab trên Mobile `<= 760px`):**
    - Trên viewport `390×844`, cả `#w3dModeTabs` (ở giữa trang) và `#uimb-bar` (thanh cố định dưới đáy màn hình của `ui-mobile.js`) cùng hiển thị (`uimb_bar_exists: true`, `w3d_tabs_exists: true`). Khi bấm tab trên `#uimb-bar`, class `.uimb-tab-hidden` được gắn độc lập với `.w3d-tab-hidden`, làm ẩn các card mới (`#ctxTalkCard`, `#vocab3000Card`, `#petSurvivalCard`).

### B. Cảnh 3D Diorama (`modules/world-3d.js`)
- **PASS:**
  - Nút `🎲 Góc 3D` (`#w3dToggleBtn`) bật/tắt class `.elw-3d-active` trên `document.body` mượt mà qua nhiều lần bấm liên tiếp.
  - Khi bật 3D: `#room` áp dụng `transform: matrix3d(...)` (`rotateX(6deg)`), có sàn gỗ/gạch và tường cạnh tạo hiệu ứng hộp Diorama CSS giả lập 3D (CSS 2.5D/3D perspective, không phải WebGL/Three.js).
  - Khi tắt 3D (chế độ Phẳng): `transform` trở về `none`, toàn bộ vùng bấm SVG (`#o-bed`, `#o-fridge`, `#o-stove`, `#o-table`, v.v.) vẫn click chính xác 100%.

### C. Hội thoại và Bong bóng thoại của Linh (`modules/life-talk.js`)
- **PASS:**
  - Phần tử `#lt-scene-bub` được chèn trực tiếp vào bên trong `#room` (`parentId: "room"`), định vị theo tọa độ phần trăm (`left: 48%`, `top: 52%`) ngay phía trên nhân vật `#linh`.
  - Hiển thị đồng bộ câu tiếng Anh (`.lt-sb-en`: *"Good morning! Let's air out the room."*) và nghĩa tiếng Việt bên dưới (`.lt-sb-vi`: *"Chào buổi sáng! Hãy mở cửa thông gió phòng nào."*).
  - Không bị cắt xén hay tràn ra ngoài khung `#room` trên cả Desktop (`width: 248px, height: 112px`) và Mobile (`width: 229px, height: 112px`).
  - Nút `🔊` phát âm thanh hoạt động và chế độ nghe tuần tự EN → VI có cờ khóa `_seqPlaying` chống đọc chồng âm.

### D. Chủ đề và Trạng thái ngôi nhà (`modules/needs.js` & `modules/challenge.js`)
- **PASS:**
  - Đã kiểm tra chuyển qua toàn bộ 7 chủ đề (`home`, `supermarket`, `cafe`, `school`, `park`, `restaurant`, `outdoor`):
    - Tại `home`: `#needsCard` hiển thị (`needsVisible: true`), thử thách thuộc chủ đề `home`.
    - Tại `supermarket`, `cafe`, `school`, `park`, `restaurant`, `outdoor`: `#needsCard` tự động ẩn hoàn toàn (`needsVisible: false`), và thử thách (`#chCard`) lọc đúng theo từng địa điểm (ví dụ ở `supermarket` hiện *"Take a shopping basket"*, ở `cafe` hiện *"Order an iced latte"*).

### E. Tủ lạnh và Quản lý không gian (`#fridgeCard`)
- **PASS (Ẩn mặc định & Mở khi click):** Khi mới vào trang hoặc đổi phòng, `#fridgeCard` ẩn (`initialHidden: true`). Khi click vào `#o-fridge` trong cảnh 3D, `#fridgeCard` hiện lên dạng modal/popover nổi (`opensOnClick: true`, `hasPopoverClass: true`). Click nút `✕` (`#w3dFridgeClose`) hoặc vùng trống bên ngoài đều đóng lại.
- **FAIL (Phím `Escape` & Tự đóng sau thao tác):** Nhấn phím `Escape` chưa đóng `#fridgeCard` (`closesOnEscape: false`). Trên màn hình nhỏ, sau khi bấm một hành động lấy đồ trong tủ lạnh, popover vẫn giữ nguyên trên màn hình che khuất cảnh 3D cho tới khi người dùng tự bấm `✕`.

### F. Ngữ cảnh và Thời tiết (`modules/context-engine.js` & `modules/day.js`)
- **PASS (Ánh sáng & Nội dung ngữ cảnh):**
  - Đã kiểm thử cả 5 chế độ thời tiết (`sunny`, `rainy`, `sunset`, `night`, `snowy`). Chế độ `rainy` sử dụng hiệu ứng hạt mưa rơi sáng rõ, không còn lớp phủ tối `mix-blend-mode: multiply` (`hasDarkMultiplyRain: false`).
  - Đã kiểm thử 8 ngữ cảnh (`solo`, `walk_dog`, `hangout_friend`, `rainy_chat`, `Ordering`, `picnic`, `workout`, `study_group`). Mỗi ngữ cảnh cập nhật đúng danh sách mẫu câu giao tiếp thực tế và khi bấm vào mẫu câu sẽ phát câu thoại lên bong bóng 3D của Linh.

### G. Hệ thống 3000 Từ & Mẫu câu (`modules/vocab-3000.js`)
- **FAIL / PARTIAL:**
  - **Số lượng từ thực tế:** Kiểm đếm tự động toàn bộ cơ sở dữ liệu trong runtime cho thấy có **1.830 mục từ thô** (gộp từ `ELW.ACTIONS`, `ELW_ROOMS`, `ELW_ROOMS_CATALOG_LIVING`) tương ứng với **829 từ tiếng Anh duy nhất**, cộng với **144 từ chọn lọc** có gắn nhãn CEFR A1–C2 trong `vocab-3000.js`. Như vậy con số "3000 từ" hiện mới là cấu trúc khung 6 cấp độ CEFR (500 từ/cấp trên thanh tiến độ), chưa nạp đủ 3.000 từ thực tế.
  - **Giới hạn hiển thị & Tìm kiếm:** Hàm render hiện đang cắt `.slice(0, 24)` (`displayedChipsPerView: 24`), không có ô tìm kiếm (`hasSearchInput: false`) và không có nút "Xem thêm / Phân trang" để người học duyệt hết 829+ từ hiện có.
  - **Công thức tính từ đã thuộc:** `countMastered()` cộng thêm `Object.keys(P.items).length * 2`, có thể làm lệch số lượng từ thực sự được người dùng đánh dấu thuộc.

### H. Nhiệm vụ & Pet Sinh tồn (`modules/pet-survival.js`)
- **PASS (Hiển thị & Timer):** Pet Corgi (`#petBuddy3d`) xuất hiện trong cảnh 3D, HUD mini (`#petMiniHud`) hiển thị trên góc cảnh, đồng hồ đếm ngược 03:00 (`#petTimerClock`) hoạt động chính xác từng giây.
- **FAIL (Lỗi kết nối kết quả nhiệm vụ & Điểm số):**
  1. Trong [modules/pet-survival.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/pet-survival.js#L487), hàm `checkMissionCompletion()` kiểm tra `if (v && v.finished)`, trong khi `ELW_MISSION.view(W)` trả về `v.complete`. Do đó khi người học hoàn thành nhiệm vụ, hàm `onMissionSuccess()` **không bao giờ được kích hoạt** (`petMissionsWonAfterComplete: 0`).
  2. Hàm `adjustPoints(delta)` đọc/ghi vào khóa `localStorage.getItem("elw_progress_v1")` (khóa cũ, trong khi `index.html` dùng `elw_progress_v2` và giữ biến `P.pts` trong closure). Do đó khi hết giờ hoặc hoàn thành nhiệm vụ, điểm số hiển thị trên thanh `#pts` (`⭐ 0`) không hề thay đổi!

### I. Chế độ Premium (`modules/premium.js`)
- **PASS:**
  - Nút `👑 Nâng cấp Pro` mở modal giới thiệu quyền lợi rõ ràng, đóng bằng nút `✕` hoặc phím `Escape`.
  - Ở chế độ Free: B1–C2 trong tab 3000 từ và các ngữ cảnh `picnic`, `workout`, `study_group` có biểu tượng `🔒 PRO`. Khi click vào sẽ mở modal nâng cấp.
  - Khi bật công tắc Sandbox `Chế độ Dùng thử Pro (Sandbox Toggle)`: trạng thái chuyển sang `👑 PRO`, toàn bộ nội dung khóa được mở ngay lập tức (`unlockedAfterToggle: true`).

---

## 5. KIỂM THỬ CHUYÊN SÂU: CHƠI TAY (LƯỢT A) VS "LÀM NGAY" (LƯỢT B) (MỤC 5 MASTER PROMPT)

Đã thực thi kịch bản kiểm thử tự động đối chiếu trên nhiệm vụ 4 bước **Làm bữa sáng (`breakfast`)** từ cùng một trạng thái khởi đầu (`reset_state`):

### Bảng đối chiếu từng bước và trạng thái cuối (`W`)

| Tiêu chí đối chiếu | Lượt A — Chơi tay từng bước (Manual Play) | Lượt B — Bấm nút `⚡ Làm ngay` (`ELW_MISSION.auto()`) | Đánh giá |
|---|---|---|---|
| **Trạng thái khởi đầu** | `room: "living"`, `eggsInFridge: 6`, `eggsOnCounter: 0`, `k_stove: "off"`, `k_pan: "empty"`, `k_table: "empty"` | `room: "living"`, `eggsInFridge: 6`, `eggsOnCounter: 0`, `k_stove: "off"`, `k_pan: "empty"`, `k_table: "empty"` | Đồng nhất 100% |
| **Kiểm tra khóa thứ tự (`guard`)** | Thử gọi sớm `fry_egg` khi chưa lấy trứng → Bị chặn với thông báo: *"Bước 3 đang khóa. Hãy hoàn thành bước 1 (Lấy trứng trong tủ lạnh) trước."* | Tự động chạy tuần tự từ bước đầu tiên chưa hoàn thành | **PASS** |
| **Bước 1: Lấy trứng trong tủ lạnh** | Click sang phòng `kitchen` → `open_fridge` → `take_out_eggs` (`eggsInFridge: 5`, `eggsOnCounter: 1`, `step 1: done`) | `auto()` chuyển sang `kitchen` → chạy `open_fridge` → `take_out_eggs` (`step 1: done`) | Đồng nhất 100% |
| **Bước 2: Bật bếp ga** | Chạy `turn_on_stove` (`k_stove: "on"`, `step 2: done`) | `auto()` chạy `turn_on_stove` (`k_stove: "on"`, `step 2: done`) | Đồng nhất 100% |
| **Bước 3: Chiên trứng trên chảo** | Chạy `fry_egg` (`eggsOnCounter: 0`, `k_pan: "egg"`, `step 3: done`) | `auto()` chạy `fry_egg` (`eggsOnCounter: 0`, `k_pan: "egg"`, `step 3: done`) | Đồng nhất 100% |
| **Bước 4: Tắt bếp và dọn bàn** | Chạy `turn_off_stove` → `set_the_table` (`k_stove: "off"`, `k_table: "set"`, `step 4: done`) | `auto()` chạy `turn_off_stove` → `set_the_table` (`k_stove: "off"`, `k_table: "set"`, `step 4: done`) | Đồng nhất 100% |
| **Trạng thái hoàn thành (`view.complete`)** | `true` (4/4 bước `done`) | `true` (4/4 bước `done`) | **PASS (Khớp 100%)** |
| **Hiệu ứng phụ sang Pet Survival** | `petMissionsWon: 0` (Do lỗi `v.finished` vs `v.complete` ở `pet-survival.js`) | `petMissionsWon: 0` (Do lỗi `v.finished` vs `v.complete` ở `pet-survival.js`) | **FAIL (Cần sửa ở `pet-survival.js`)** |

---

## 6. KIỂM TRA HỒI QUY (REGRESSION) & BẰNG CHỨNG HÌNH ẢNH

Các ảnh chụp màn hình thực tế từ trình duyệt kiểm thử đã được lưu tại:
- Desktop (`1440×900` - Trời mưa + Cảnh 3D + Bong bóng thoại): [docs/audit-desktop-rainy.png](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/docs/audit-desktop-rainy.png)
- Mobile (`390×844` - Bố cục tổng thể & Xung đột 2 thanh tab): [docs/audit-mobile-390x844.png](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/docs/audit-mobile-390x844.png)
- Mobile (`390×844` - Popover Tủ lạnh): [docs/audit-mobile-fridge-popover.png](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/docs/audit-mobile-fridge-popover.png)
