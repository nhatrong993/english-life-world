# MA TRẬN KIỂM THỬ QA (QA TEST MATRIX) — ENGLISH LIFE WORLD 2.0 (SAU KHI SỬA P0 & P1)
**Dự án:** `D:\tools\Hoc tieng anh\english-life-world`  
**Ngày kiểm chứng:** 2026-10-14  
**Công cụ:** Playwright Chromium (`1440×900` Desktop & `390×844` Mobile)  
**File kết quả JSON:** [docs/audit_raw_results.json](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/docs/audit_raw_results.json)

---

## 1. BẢNG TỔNG HỢP TRẠNG THÁI SAU KHI SỬA P0 & P1 (14/14 TEST CASES KHẢ THI ĐẠT PASS 100%)

| Mã Test | Hạng mục | Kịch bản kiểm thử | Kết quả trước khi sửa | Kết quả sau khi sửa & Bằng chứng (`audit_raw_results.json`) | Trạng thái |
|---|---|---|---|---|---|
| **TC-01** | **Giao diện & Bố cục (`#panel`)** | Vị trí bảng "Chọn Hành động" (`#panel`) trên Desktop (`1440×900`) và Mobile (`390×844`) | `FAIL`: `#panel` bị đẩy sang cột `.side` (`x: 870, y: 1170` trên PC; cách đáy `#room` `715px` trên Mobile). | `panelParentClass: "leftcol"`, `isInsideLeftCol: true`, `isBelowSceneHorizontallyAligned: true`.<br>**Desktop:** `#room` (`bottom: 815`) → `#panel` ngay bên dưới (`x: 96, y: 853`).<br>**Mobile:** `#room` (`bottom: 735`) → `#panel` ngay bên dưới (`top: 768`, khoảng cách chỉ **33px**, chiều cao gọn `469px`). | **PASS** |
| **TC-02** | **Giao diện & Tương tác 3 Tab** | Click đồ vật trong `#room` khi đang ở tab `📚 3000 Từ` hoặc `🔥 Nhiệm vụ & Pet` | `FAIL`: `#panel` bị ẩn bởi `.w3d-tab-hidden` khi ở tab `learn` hoặc `mission`. | `panel_visible_when_clicking_obj_in_other_tab: true`. `#panel` luôn hiển thị ngay dưới `#room` ở mọi tab. | **PASS** |
| **TC-03** | **Mobile UI (`<= 760px`)** | Đồng bộ điều hướng tab giữa `#w3dModeTabs` và `#uimb-bar` trên màn hình `390×844` | `FAIL`: `.uimb-tab-hidden` xung đột với `.w3d-tab-hidden` làm ẩn nhầm thẻ. | Đã hợp nhất điều hướng trong [modules/ui-mobile.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-mobile.js) và [modules/world-3d.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/world-3d.js). Không tràn ngang (`hasHorizontalOverflow: false`, `390 === 390`). | **PASS** |
| **TC-04** | **Mobile UI (`#ctxBar`)** | Chiều cao thanh Thời tiết & Ngữ cảnh (`#ctxBar`) trên màn hình di động `390×844` | `FAIL`: Rớt thành 9 dòng, cao `426px`. | Đã chuyển thành 2 hàng cuộn ngang mượt mà trên Mobile, chiều cao giảm từ `426px` xuống **`82px`** (`ctxBarHeight: 82`). | **PASS** |
| **TC-05** | **Cảnh 3D Diorama** | Bật / tắt nút `🧊 Góc 3D` nhiều lần liên tiếp | `PASS` | Hoạt động mượt mà, giữ nguyên vùng tương tác đồ vật SVG. | **PASS** |
| **TC-06** | **Hội thoại & Bong bóng 3D** | Vị trí bong bóng thoại `#lt-scene-bub` trên đầu Linh và phát âm thanh | `PASS` | Hiển thị đồng bộ EN + VI ngay trên đầu Linh trong `#room`, không tràn khung. | **PASS** |
| **TC-07** | **Chủ đề & Tình trạng ngôi nhà** | Ẩn `#needsCard` và lọc thử thách ở 7 chủ đề (`home` + 6 chủ đề ngoài nhà) | `PASS` | Đạt 7/7 chủ đề: `#needsCard` chỉ hiện ở `home` và ẩn hoàn toàn khi ra ngoài. | **PASS** |
| **TC-08** | **Tủ lạnh (`#fridgeCard`)** | Ẩn mặc định, mở popover khi click `#o-fridge`, đóng bằng `✕`, click ngoài hoặc phím `Escape` | `FAIL`: Nhấn phím `Escape` không đóng (`closesOnEscape: false`). | `opensOnClick: true`, `closesOnEscape: true`, tự động đóng sau khi chọn hành động trên màn hình nhỏ. | **PASS** |
| **TC-09** | **Thời tiết & Ánh sáng** | Chuyển 5 chế độ thời tiết (`sunny`, `rainy`, `sunset`, `night`, `snowy`) | `PASS` | `hasDarkMultiplyRain: false` ở cả 5 chế độ, cảnh mưa sáng rõ. | **PASS** |
| **TC-10** | **Ngữ cảnh giao tiếp** | Chuyển 8 ngữ cảnh trên `#ctxBar` và bấm mẫu câu phát thoại 3D | `PASS` | Hoạt động trơn tru trên toàn bộ ngữ cảnh và mẫu câu. | **PASS** |
| **TC-11** | **Hệ thống 3000 Từ (`vocab-3000.js`)** | Tìm kiếm từ vựng (`#v3kSearchInput`), phân trang (`#v3kLoadMoreBtn`) và đếm từ chính xác | `FAIL`: Thiếu ô tìm kiếm (`hasSearchInput: false`), cắt cứng 24 từ, nhân đôi điểm `P.items`. | `hasSearchInput: true`, có nút `➕ Xem thêm từ vựng (+24 từ)` để duyệt toàn bộ 829+ từ trong kho, bộ đếm chuẩn xác. | **PASS** |
| **TC-12** | **Nhiệm vụ: Lượt A (Chơi tay) vs Lượt B (`⚡ Làm ngay`)** | Thực hiện nhiệm vụ 4 bước `breakfast` bằng tay (Lượt A) và bằng nút `⚡ Làm ngay` (Lượt B) | `PASS` (riêng đồng bộ sang Pet bị `FAIL`). | Cả Lượt A và Lượt B đều hoàn thành 4/4 bước với state `W` cuối cùng đồng nhất 100% (`complete: true`, `eggsInFridge: 5`, `eggsOnCounter: 0`, `k_stove: "off"`, `k_pan: "egg"`, `k_table: "set"`, `pts: "⭐ 20"`). | **PASS** |
| **TC-13** | **Pet Survival & Đồng bộ Nhiệm vụ / Điểm số** | Thưởng Pet + cộng điểm khi hoàn thành nhiệm vụ; trừ điểm khi bị phạt | `FAIL`: `petMissionsWonAfterComplete: 0`, điểm `#pts` không đổi (`⭐ 0`). | **Khi bị phạt (-15⭐):** `beforePtsText: "⭐ 30"` → `afterPenaltyPtsText: "⭐ 15"` (`pointsDeductedCorrectly: true`).<br>**Khi hoàn thành nhiệm vụ:** `pts: "⭐ 20"`, `petStreakAfterComplete: 2`, `petMissionsWonAfterComplete: 1`, `timerBannerStillPresent: false`. | **PASS** |
| **TC-14** | **Chế độ Premium (Sandbox)** | Khóa nội dung Pro ở chế độ Free và mở khóa bằng Sandbox Toggle | `PASS` | Hoạt động 100% client-side, mở khóa tức thì. | **PASS** |
| **TC-15** | **Voice Input (Web Speech Recognition)** | Nhận diện giọng nói qua microphone vật lý | `BLOCKED` | Môi trường trình duyệt tự động hóa headless không gắn mic phần cứng; nút tự đánh giá (`#selfok`) hoạt động an toàn. | **BLOCKED (Môi trường)** |
