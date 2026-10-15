# 🐾 Báo Cáo Tổng Kết Hệ Thống Thú Cưng & Pet Adventure v2.0 (`PET_REPORT.md`)

**Dự án:** English Life World (`D:\tools\Hoc tieng anh\english-life-world`)  
**Ngày hoàn tất:** 14/10/2026  
**Phụ trách QA & Báo cáo tổng hợp:** Agent A8 (Playwright QA Engineer & Final Report Author)  
**Trạng thái kiểm thử:** ✅ **100% PASS** (`38/38` kiểm thử Playwright Chromium T1–T8 + `12/12` `context-engine.test.js` + `20/20` `qa-20-scenarios.test.js` = **70/70 PASS**)

---

## 1. Tổng Quan Kiến Trúc & Giá Trị Mang Lại

Hệ thống **Pet Companion & Unified Pet Adventure v2.0** nâng cấp toàn diện trải nghiệm nuôi thú cưng và học tiếng Anh theo ngữ cảnh trong **English Life World**:

1. **Bộ sưu tập Đúng 10 Thú cưng × 10 Trạng thái = 100 Sprite PNG RGBA (320×320, không bao giờ 12):**
   - **3 Chó (`dog`):** `milu` (Milu — Cún Lông Xù Vàng, **Free**), `boba` (Boba — Cún Corgi Hoàng Gia, **Premium**), `cookie` (Cookie — Cún Shiba Hay Cười, **Premium**).
   - **3 Mèo (`cat`):** `mochi` (Mochi — Mèo Trắng Mochi, **Free**), `pepper` (Pepper — Mèo Anh Lông Ngắn, **Premium**), `oreo` (Oreo — Mèo Nhị Thể Tuxedo, **Premium**).
   - **4 Hiếm (`rare`):** `ember` (Ember — Rồng Nhỏ Lửa Ấm, **Premium**), `lumi` (Lumi — Kỳ Lân Cầu Vồng, **Premium**), `pip` (Pip — Cáo Tuyết Bắc Cực, **Premium**), `aqua` (Aqua — Rái Cá Biển, **Premium**).
   - **10 Trạng thái chuẩn (`STATES`):** `idle_happy`, `curious`, `playful`, `eating`, `drinking`, `sleepy`, `tired`, `sad_lonely`, `excited`, `walking_adventure`.
   - Tất cả 100 tệp PNG đều có kênh alpha trong suốt thực sự (`alpha min = 0, max = 255`), không chữ, không recolor giả, kích thước chuẩn `320×320`, được quản lý tập trung qua `assets/pets/manifest.json` (11 trường dữ liệu thật từ đĩa).

2. **Hệ thống 5 Nhu cầu (Needs Engine) Nhân văn — Không Phạt Người Học:**
   - Theo dõi 5 chỉ số `0..100`: `energy` (Năng lượng), `hunger` (Độ no), `thirst` (Độ khát), `fun` (Niềm vui), `bond` (Gắn kết).
   - Giảm tự nhiên theo thời gian thực (`lastUpdatedAt` / `Date.now()`, không dùng `setInterval` làm state dài hạn) với trần giảm tối đa 6 giờ (`MAX_OFFLINE_DECAY_MS = 6h`) và **ngưỡng sàn an toàn `OFFLINE_FLOOR = 25`** (không bao giờ tụt về `0`).
   - Chỉ số `bond` (Gắn kết) **không bao giờ giảm** khi người học vắng mặt; **0 trừ sao (`elw_s`)**, **0 mất chuỗi ngày học (`elw_str`)**, không mất pet hay tiến độ khi thoát nhiệm vụ.

3. **8 Hành động Tương tác & Hoạt ảnh CSS Keyframes:**
   - 8 nút tương tác trực tiếp (`pet`: Vuốt ve, `play`: Chơi, `feed`: Cho ăn, `water`: Cho uống, `rest`: Nghỉ, `talk`: Nói chuyện, `walk`: Dẫn đi chơi, `profile`: Hồ sơ) hoạt động đồng nhất trên cả thẻ `#petSurvivalCard` lẫn thanh tương tác nhanh `#petSceneQuickBar` (mở khi bấm vào thú cưng `#o-cat` trong phòng khách).
   - Hỗ trợ đầy đủ `prefers-reduced-motion: reduce` (tự động tắt vòng lặp animation chuyển động cho người dùng nhạy cảm) và cơ chế tự phục hồi ảnh lỗi (`onerror` chuyển về `idle_happy.png` kèm `data-fallback-applied="1"` và SVG dự phòng).

4. **Hệ thống Phiêu lưu Hợp nhất (Unified Pet Adventure Engine):**
   - Hợp nhất hoàn toàn **Điểm vào 1** (nút `#ctxBtnDog` — *"🐕 Đi chơi cùng Pet"* trên thanh ngữ cảnh `#ctxBar`) và **Điểm vào 2** (bấm `#o-cat` trong phòng → chọn *"🦮 Dẫn đi chơi"* `[data-pet-act="walk"]` trên `#petSceneQuickBar`) vào **cùng một phiên `adventureSession` duy nhất** (`sessionId` chung, hợp nhất `entrySources`).
   - Cung cấp hàm `ELW_PET_ADVENTURE.getUnifiedSystemState()` trả về đủ **8 thành phần dùng chung**: `activePetId`, `adventureSession`, `context`, `validator`, `needs`, `inventory`, `dialogue`, `rewardLedger`.
   - Tự động sinh 3 mục tiêu nhiệm vụ (`greet_context`, `care_bond`, `contextual_practice`) và mẫu câu hội thoại tiếng Anh thích ứng linh hoạt theo **Chủ đề** (`home`, `park`, `cafe`, `market`, `restaurant`, `outdoor`, `school`), **Thời tiết** (`sunny`, `rainy`, `cold`, `hot`, `windy`), **Tình huống** và **Thú cưng đang chọn**.

5. **Sổ cái Thưởng 1 Lần Chống Farm & Mở khoá Chung Chủ đề + Thú cưng Premium:**
   - Mỗi mục tiêu (`<place>:<objectiveId>`) chỉ được nhận thưởng đúng 1 lần duy nhất thông qua sổ cái bền vững `elw_pet_reward_ledger_v2` (chống bấm lặp và chống tải lại trang để cày sao/vật phẩm).
   - Khi chưa mở khoá Premium (`elw_topics_v1.unlocked !== true`), 8 thú cưng Premium hiển thị ở chế độ Xem trước kèm nút **"Mở khoá Premium"** dẫn tới ô nhập mã của bảng chọn chủ đề (`#tsCode` — không lộ mã trên UI/console), đồng thời chặn việc tự sửa `localStorage` (`elw_pet_needs_v2`, `elw_pet_v1`) để ép chọn pet Premium. Khi người dùng nhập đúng mã mở khoá chủ đề, hệ thống mở khoá đồng thời toàn bộ 6 chủ đề học VÀ cả 8 thú cưng Premium (`boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`), cập nhật ngay Collection để người dùng chọn bất kỳ pet nào đi cùng.

---

## 2. Bảng Chi Tiết Công Việc Của Các Agent (A1 → A8)

| Agent | Vai trò | Tệp tạo mới / cập nhật | Nội dung công việc đã hoàn thành |
| :--- | :--- | :--- | :--- |
| **Agent A1** | System Auditor & Game Architect | `docs/PET_SYSTEM_AUDIT.md`<br>`docs/PET_GAME_DESIGN.md`<br>`docs/PET_ASSET_PLAN.md`<br>`docs/PET_QA_PLAN.md` | Khảo sát hiện trạng mã nguồn, thiết kế kiến trúc hợp nhất 6 mô-đun Pet v2.0, quy hoạch danh sách 10 thú cưng × 10 trạng thái (100 sprites), định nghĩa công thức 5 nhu cầu (`OFFLINE_FLOOR = 25`), quy tắc chống farm thưởng và kế hoạch kiểm thử tự động T1–T8. |
| **Agent A2** | Pet Asset & Manifest Generator | `tools/generate_pet_assets.py`<br>`assets/pets/<petId>/<state>.png` (100 tệp)<br>`assets/pets/manifest.json` | Sinh đủ 10 trạng thái của **Milu trước**, sau đó sinh 9 thú cưng còn lại, xuất đủ **100 ảnh PNG RGBA `320×320`** có nền trong suốt thực sự, không chữ, không recolor giả, kèm tệp `assets/pets/manifest.json` chứa đủ 11 trường metadata thật từ đĩa. |
| **Agent A3** | Pet Needs & Roster Engine Author | `modules/pet-needs.js` (`window.ELW_PET_NEEDS`) | Hiện thực hóa danh sách đúng 10 thú cưng (3 chó, 3 mèo, 4 hiếm; 2 Free: `milu`, `mochi`; 8 Premium), 10 trạng thái cảm xúc, bộ máy 5 nhu cầu (`energy`, `hunger`, `thirst`, `fun`, `bond`) tính theo mốc thời gian thực, sàn giảm ngoại tuyến `25`, giữ nguyên `bond`, và 0 hình phạt âm. |
| **Agent A4** | Pet Interaction & Animation Engine Author | `modules/pet-interaction.js` (`window.ELW_PET_INTERACTION`) | Hiện thực hóa 8 hành động tương tác (`pet`, `play`, `feed`, `water`, `rest`, `talk`, `walk`, `profile`), 10 hoạt ảnh CSS Keyframes, hỗ trợ `prefers-reduced-motion: reduce`, xử lý lỗi ảnh tự động chuyển về `idle_happy.png` (`data-fallback-applied="1"`), và thanh `#petSceneQuickBar` khi bấm `#o-cat`. |
| **Agent A5** | Unified Pet Adventure Quest Engine Author | `modules/pet-adventure.js` (`window.ELW_PET_ADVENTURE`) | Hợp nhất 2 điểm vào (`#ctxBtnDog` trên thanh ngữ cảnh và `#o-cat` → `walk` trong phòng) vào chung 1 phiên `adventureSession` (`elw_pet_adventure_v2`), xuất trạng thái 8 thành phần qua `getUnifiedSystemState()`, và xây dựng hệ thống 3 bước nhiệm vụ + hội thoại động theo Chủ đề × Thời tiết × Tình huống. |
| **Agent A6** | Pet UI, Modals & Facade Integrator | `modules/pet-ui.js` (`window.ELW_PET_UI`)<br>`modules/pet-survival.js` (`window.ELW_PET`)<br>`modules/context-engine.js`<br>`index.html` | Xây dựng giao diện thẻ `#petSurvivalCard`, huy hiệu `#petMiniHud` trên thanh tiêu đề, bảng nhiệm vụ `#petAdventureHud`, biểu ngữ kết quả `#petAdventureResult`, lưới đúng 10 thú cưng `#petCollectionGrid` có nhãn Free/Premium, hộp thoại Hồ sơ `#petProfileModal` & Xem trước `#petPremiumPreviewModal` (kèm nút "Mở khoá Premium" dẫn tới `#tsCode`), và tích hợp tối thiểu vào `context-engine.js` & `index.html`. |
| **Agent A7** | Reward Ledger & Entitlement Security Engineer | `modules/pet-rewards.js` (`window.ELW_PET_REWARDS`)<br>`modules/ui-topics.js` | Xây dựng sổ cái nhận thưởng 1 lần `elw_pet_reward_ledger_v2` (`claimObjectiveReward`) chống nhận trùng qua reload, đồng bộ điểm thưởng vào cả `ELW.addPts` lẫn `elw_s`, kết nối trạng thái mở khoá chung `elw_topics_v1.unlocked` để mở khoá toàn bộ chủ đề + 8 pet Premium khi nhập đúng mã, và cơ chế `enforceEntitlementIntegrity()` ngăn chặn chỉnh sửa `localStorage` pet khi chưa mở khoá. |
| **Agent A8** | Playwright QA Engineer & Final Report Author | `tools/test_pet_system.py`<br>`modules/qa-20-scenarios.test.js`<br>`docs/PET_REPORT.md`<br>`english-life-world-ban-day-du.html` | Viết và chạy bộ kiểm thử tự động Playwright Chromium (`tools/test_pet_system.py`) kiểm chứng toàn bộ T1–T8 trên trình duyệt thật, sửa lỗi TDZ trong `pet-interaction.js` cùng đồng bộ DOM/facade trong `pet-ui.js`, `pet-needs.js`, `pet-rewards.js`, cập nhật bộ test Node, đóng gói lại bundle 1 file và biên soạn báo cáo tổng kết `docs/PET_REPORT.md`. |

---

## 3. Kết Quả Kiểm Thử Tự Động Thực Tế (Real Verification Metrics)

### 3.1. Bộ Kiểm Thử E2E Trình Duyệt Thật Playwright Chromium (`python tools/test_pet_system.py`)
- **Môi trường:** Headless Chromium tải trực tiếp `index.html` và bản đóng gói `english-life-world-ban-day-du.html`.
- **Tổng số phép kiểm tra:** **100% PASS (0 FAIL)**

| Nhóm Test | Mã Kiểm Tra | Nội dung kiểm chứng trên Chromium & Hệ thống tệp | Kết quả |
| :--- | :--- | :--- | :---: |
| **T1: Asset & Manifest** | `T1.1` – `T1.7` | `assets/pets/manifest.json` tồn tại, đúng 100 mục, đủ 11 trường schema; 100 tệp PNG tồn tại (`> 500 bytes`), chuẩn `320×320` RGBA có vùng alpha trong suốt thực sự (`min=0, max=255`); cả 100 ảnh giải mã thành công trong Chromium (`naturalWidth=320, naturalHeight=320`). | **7/7 PASS** |
| **T2: Roster & Persistence** | `T2.1` – `T2.5` | `ELW_PET.getRoster()` trả về đúng 10 thú cưng (2 Free: `milu`, `mochi` + 8 Premium); `#petCollectionGrid` hiển thị đủ 10 thẻ; mặc định là `milu`; bấm chọn `mochi` đổi ảnh đại diện sang `assets/pets/mochi/*.png` và giữ nguyên `mochi` sau khi `page.reload()`. | **5/5 PASS** |
| **T3: Needs & Decay Floor** | `T3.1` – `T3.4` | 5 thanh nhu cầu (`energy`, `hunger`, `thirst`, `fun`, `bond`) hiển thị đầy đủ trong khoảng `0..100`; giả lập 48 giờ offline xác nhận nhu cầu chạm sàn `OFFLINE_FLOOR = 25` (không bao giờ về `0`), `bond` không giảm (`50 -> 50`), sao (`250`) và chuỗi ngày học (`9`) không bị trừ; `deriveVisualState` ánh xạ chính xác các trạng thái. | **4/4 PASS** |
| **T4: 8 Actions & Fallback** | `T4.1` – `T4.4` | Bấm `#o-cat` mở `#petSceneQuickBar` với đủ 8 nút `[data-pet-act]`; thực thi cả 8 hành động (`pet, play, feed, water, rest, talk, walk, profile`) thành công và mở `#petProfileModal`; bật `prefers-reduced-motion: reduce` tắt animation liên tục; gán đường dẫn ảnh hỏng tự động chuyển về `idle_happy.png` với `data-fallback-applied="1"`. | **4/4 PASS** |
| **T5: Unified Adventure** | `T5.1` – `T5.5` | `getUnifiedSystemState()` trả về đủ 8 khóa bắt buộc; Điểm vào 1 (`#ctxBtnDog`) và Điểm vào 2 (`#o-cat` → `[data-pet-act="walk"]`) dùng chung chính xác một `sessionId` và gộp `entrySources` (`['context_bar', 'home_pet_click', 'home_pet']`); đổi chủ đề sang `park` + thời tiết `rainy` cập nhật tức thì 3 mục tiêu và lời thoại; hoàn thành 3/3 bước bật `#petAdventureResult`. | **5/5 PASS** |
| **T6: Anti-Farm Rewards** | `T6.1` – `T6.3` | Lần nhận đầu tiên của `cafe:contextual_practice` cộng chính xác `+15⭐` (`300 -> 315`) và `+2 treats` (`13 -> 15`); lần gọi thứ hai liên tiếp bị chặn (`granted=false, duplicate=true`); sau khi `page.reload()`, gọi lại vẫn bị chặn (`granted=false, duplicate=true`, sao giữ nguyên `315`). | **3/3 PASS** |
| **T7: Premium & Tamper Guard** | `T7.1` – `T7.2` | Trước khi mở khoá: bấm vào thẻ Pet Premium đang khóa (`boba`/`ember`) không đổi thú cưng đang dùng (vẫn là `milu`) và mở hộp thoại `#petPremiumPreviewModal` có nút `"Mở khoá Premium"` dẫn tới `#tsCode`; giả mạo `localStorage` (`activePetId: "ember"`) khi chưa mở khoá rồi `page.reload()` tự động khôi phục về `"milu"`. Khi nhập đúng mã mở khoá chủ đề: cả 6 chủ đề và 8 pet Premium đều mở khoá (`isPetUnlocked` = `true` cho cả 10 pet), chọn được `ember`/`lumi`, ảnh trong cảnh đổi đúng và bền vững sau `page.reload()`. | **PASS** |
| **T8: Zero Regression, Mobile & Bundle** | `T8.1` – `T8.8` | 7 chủ đề chuyển mượt mà; 3 tab (`Chơi`/`Học`/`Nhiệm vụ`) và bộ Mission (`42`)/Challenge (`22`) cũ hoạt động nguyên vẹn; nhân vật phụ Linh ẩn ở `home` và chỉ hiển thị ngoài nhà (`park`/`cafe`); mã mở khóa chủ đề không lộ trên UI `#topicSheet` hay console; màn hình Mobile `360px`, `390px`, `430px` qua cả 3 tab **0 tràn ngang (`scrollWidth <= innerWidth`)**; **0 lỗi JS (`pageerror`)**; bundle 1 tệp `english-life-world-ban-day-du.html` nạp đủ 6 mô-đun Pet và 10 thẻ thú cưng với 0 lỗi. | **8/8 PASS** |

### 3.2. Bộ Kiểm Thử Đơn Vị Node.js (`node modules/*.test.js`)
- `node modules/context-engine.test.js`: **12/12 PASS (0 FAIL)**
- `node modules/qa-20-scenarios.test.js`: **20/20 PASS (0 FAIL)**

---

## 4. Các Lỗi Thực Tế Đã Phát Hiện & Khắc Phục Trong Quá Trình QA

Trong quá trình chạy Playwright thật trên Chromium, Agent A8 đã phát hiện và xử lý triệt để các vấn đề sau:
1. **Lỗi TDZ (`ReferenceError: Cannot access 'options' before initialization`) trong `modules/pet-interaction.js`:**
   - Tại hàm `buildSceneQuickBarHtml(opts)`, biểu thức `const options = opts && typeof options === "object" ? opts : {};` tham chiếu nhầm biến `options` khi chưa khởi tạo xong. Đã sửa thành `typeof opts === "object"`, giúp `#petSceneQuickBar` hiển thị mượt mà khi bấm `#o-cat`.
2. **Đồng bộ hiển thị `#petSurvivalCard` khi bắt đầu Pet Adventure (`modules/pet-ui.js`):**
   - Khi người học đang ở tab *"Chơi & Khám phá"* (`play`) và bấm `#ctxBtnDog` hoặc `#o-cat -> walk`, thẻ `#petSurvivalCard` trước đó bị ẩn bởi lớp `.w3d-tab-hidden`. Đã cập nhật `renderCard()` để tự động gỡ `.w3d-tab-hidden` khi `adventureSession.active === true`, giúp bảng nhiệm vụ `#petAdventureHud` xuất hiện ngay lập tức.
3. **Đồng bộ khóa điểm thưởng `elw_s` trong `modules/pet-rewards.js`:**
   - Cập nhật `applyStarsReward()` để đồng bộ cả `window.ELW.addPts()` (`elw_progress_v1`) lẫn khóa `localStorage["elw_s"]`, đảm bảo mọi thành phần trong ứng dụng đều đọc số sao nhất quán.

---

## 5. Giới Hạn Hiện Tại & Minh Bạch Kỹ Thuật (Remaining Limitations)

1. **Cơ chế Mở khoá Premium Phía Client (Client-Side Premium Unlock Policy):**
   - Theo quyết định của chủ ứng dụng, gói **Premium** bao gồm toàn bộ các chủ đề học chuyên sâu VÀ cả 8 thú cưng Premium (`boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`), sử dụng chung một trạng thái mở khoá duy nhất (`elw_topics_v1.unlocked`) được kích hoạt khi người dùng nhập đúng mã vào ô `#tsCode` trong bảng chọn chủ đề (mã không được hiển thị/gợi ý trên giao diện hay in ra console).
   - Đây là **khoá phía client (client-side lock)** theo quyết định thiết kế hiện tại của chủ app (bất kỳ ai được cấp/biết mã mở khoá đều có thể nhập để mở toàn bộ chủ đề và pet Premium trên trình duyệt của mình). Khi ứng dụng tích hợp cổng thanh toán thật trong tương lai, cơ chế này sẽ được chuyển sang xác thực máy chủ (server-side entitlement verification).
2. **Phát âm Giọng nói (Web Speech API):**
   - Hệ thống phát âm câu thoại tiếng Anh khi trò chuyện và làm nhiệm vụ cùng thú cưng sử dụng `window.speechSynthesis` của trình duyệt; chất lượng giọng đọc phụ thuộc vào gói giọng nói có sẵn trên hệ điều hành của người dùng.
