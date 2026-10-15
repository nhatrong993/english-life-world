# ĐÁNH GIÁ ĐỀ XUẤT & KẾ HOẠCH CẢI TIẾN ƯU TIÊN (CHANGE RECOMMENDATIONS)
**Dự án:** `D:\tools\Hoc tieng anh\english-life-world`  
**Ngày lập kế hoạch:** 2026-10-14  
**Căn cứ:** Kết quả kiểm toán thực tế từ [docs/QA_FULL_AUDIT.md](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/docs/QA_FULL_AUDIT.md) và [docs/QA_TEST_MATRIX.md](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/docs/QA_TEST_MATRIX.md)

---

## 1. ĐÁNH GIÁ 12 ĐỀ XUẤT THAY ĐỔI TRƯỚC ĐÂY (MỤC 7 MASTER PROMPT)

| STT | Đề xuất trước đây | Quyết định | Lý do kỹ thuật & Trải nghiệm người dùng (UX) |
|---|---|---|---|
| 1 | **Tái cấu trúc giao diện thành 3 tab (`Chơi & Giao tiếp`, `3000 Từ & Mẫu câu`, `Nhiệm vụ & Pet`)** | **SỬA (MODIFY)** | Chia 3 tab ở cột phải (`.side`) giúp giảm rối rất tốt, **NHƯNG** tuyệt đối không được đem `#panel` ("Chọn Hành động") nhốt vào cột phải hay ẩn theo tab. `#panel` phải nằm cố định ngay dưới cảnh `#room` (trong `.leftcol`), và trên Mobile cần hợp nhất `#uimb-bar` với `#w3dModeTabs`. |
| 2 | **Nâng cấp cảnh thành 3D Diorama** | **GIỮ (KEEP)** | Hiệu ứng CSS 3D Perspective (`rotateX`, sàn, tường cạnh, bóng đổ) nhẹ, mượt, không làm lệch vùng bấm SVG và có nút bật/tắt 3D ↔ Phẳng an toàn. |
| 3 | **Gắn bong bóng thoại trực tiếp trên đầu Linh trong cảnh 3D** | **GIỮ (KEEP)** | `#lt-scene-bub` nằm trong `#room` ngay trên đầu Linh giúp người học vừa nhìn nhân vật vừa đọc câu tiếng Anh + tiếng Việt rất trực quan. |
| 4 | **Thêm thanh chọn ngữ cảnh và thời tiết (`#ctxBar`)** | **SỬA (MODIFY)** | Tính năng rất hữu ích, nhưng trên Mobile đang rớt thành 9 dòng (cao `426px`). Cần chuyển thành thanh cuộn ngang 1 dòng (`overflow-x: auto; white-space: nowrap`) hoặc có nút thu gọn trên Mobile. |
| 5 | **Làm sáng hiệu ứng trời mưa** | **GIỮ (KEEP)** | Đã loại bỏ lớp phủ tối `mix-blend-mode: multiply`, cảnh mưa sáng rõ và dễ nhìn đồ vật. |
| 6 | **Biến "Trong tủ lạnh" thành popover khi bấm vào tủ lạnh** | **SỬA (MODIFY)** | Đã ẩn mặc định và mở khi bấm `#o-fridge`, chỉ cần bổ sung phím tắt `Escape` để đóng và tự động đóng popover sau khi người dùng chọn xong hành động lấy đồ/nấu ăn trên màn hình nhỏ. |
| 7 | **Ẩn "Tình trạng ngôi nhà" khi ở ngoài nhà** | **GIỮ (KEEP)** | Hoạt động chính xác ở cả 6 chủ đề ngoài nhà (`supermarket`, `cafe`, `school`, `park`, `restaurant`, `outdoor`). |
| 8 | **Lọc thử thách theo chủ đề hiện tại** | **GIỮ (KEEP)** | `ELW_CHALLENGES.forTopic()` đã lọc đúng thử thách theo địa điểm, không còn hiện việc nhà khi đang ở siêu thị/công viên. |
| 9 | **Xây dựng hệ thống 3000 từ theo CEFR và chủ đề** | **SỬA (MODIFY)** | Cần bổ sung ô tìm kiếm tức thì (`Search`), nút phân trang / `Xem thêm` (thay vì cắt cứng `.slice(0, 24)`), hiển thị minh bạch số từ hiện có trong kho (`829+` từ thực tế đang mở rộng lên 3000) và sửa công thức đếm từ đã thuộc. |
| 10 | **Thêm Pet Corgi và đồng hồ đếm ngược cho nhiệm vụ** | **SỬA (MODIFY)** | Giao diện Pet và đồng hồ rất cuốn hút, nhưng **bắt buộc phải sửa lỗi `v.finished` → `v.complete`** để Pet nhận thưởng khi hoàn thành nhiệm vụ, và kết nối `adjustPoints()` trực tiếp với `P.pts` / `addPts()` của `index.html`. |
| 11 | **Tách tính năng Free và Premium** | **GIỮ (KEEP)** | Cơ chế Sandbox Toggle minh bạch, giúp trải nghiệm mô hình Freemium mà không thu phí thật. |
| 12 | **Nút "Làm ngay" tự động hoàn thành nhiệm vụ** | **GIỮ (KEEP)** | `ELW_MISSION.auto()` chạy tuần tự từng bước chuẩn xác 100%, khớp hoàn toàn với trạng thái chơi tay. |

---

## 2. KẾ HOẠCH SỬA LỖI & CẢI TIẾN THEO THỨ TỰ ƯU TIÊN (PRIORITIZED FIX PLAN)

### Ưu tiên P0 — Sửa ngay các lỗi chặn luồng trải nghiệm & bố cục cốt lõi

#### P0.1. Đặt phần "Chọn Hành động" (`#panel`) ngay bên dưới khung cảnh 3D (`#room`) trên cả PC và Mobile
- **File cần sửa:** [modules/world-3d.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/world-3d.js) và CSS trong [index.html](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/index.html)
- **Chi tiết thay đổi:**
  1. Trong `world-3d.js` (`initWorkspaceTabs()` và `switchTab()`): **Không** di chuyển `#panel` sang `.side` và **không** gắn `.w3d-tab-hidden` lên `#panel`. Giữ `#panel` nằm trong `.leftcol` ngay sát dưới `<section class="scene">` (`#room`).
  2. Trên Mobile (`<= 980px`): Đảm bảo `.leftcol` hiển thị `#room` rồi đến ngay `#panel` ("Chọn Hành động") ở sát bên dưới (`distanceFromRoomBottomToPanelTop <= 16px`), sau đó mới tới cột `.side` (3 tab: Giao tiếp ngữ cảnh / 3000 Từ / Nhiệm vụ & Pet).
  3. Khi người dùng click vào bất kỳ đồ vật nào trong `#room` (dù đang ở tab nào), `#panel` cập nhật ngay lập tức bên dưới hình ảnh và tự động hiệu ứng highlight nhẹ để người dùng bấm hành động dễ dàng.

#### P0.2. Hợp nhất hệ thống Tab trên Mobile & Thu gọn thanh `#ctxBar`
- **File cần sửa:** [modules/ui-mobile.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/ui-mobile.js), [modules/world-3d.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/world-3d.js), [modules/context-engine.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/context-engine.js)
- **Chi tiết thay đổi:**
  1. Đồng bộ `#uimb-bar` của `ui-mobile.js` với 3 tab của `world-3d.js` (hoặc vô hiệu hóa `.uimb-tab-hidden` cũ để nhường quyền điều khiển tab thống nhất cho `ELW_WORLD_3D.switchTab()`), đảm bảo `#ctxTalkCard`, `#vocab3000Card`, `#petSurvivalCard` không bao giờ bị ẩn nhầm.
  2. Trong `context-engine.js`: Thiết kế `#ctxBar` trên màn hình nhỏ (`<= 760px`) thành 2 hàng cuộn ngang gọn gàng (`overflow-x: auto; flex-wrap: nowrap`), giảm chiều cao `#ctxBar` trên Mobile từ **426px** xuống còn **~72px**.

#### P0.3. Sửa lỗi đồng bộ hoàn thành Nhiệm vụ (`v.complete`) & Điểm số (`#pts`) trong `pet-survival.js`
- **File cần sửa:** [modules/pet-survival.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/pet-survival.js) và [index.html](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/index.html)
- **Chi tiết thay đổi:**
  1. Trong `pet-survival.js` (`checkMissionCompletion()`): Đổi điều kiện kiểm tra từ `v && v.finished` sang `v && (v.complete || v.finished)` để khi người chơi hoàn thành nhiệm vụ (bằng tay hoặc bấm `⚡ Làm ngay`), `onMissionSuccess()` lập tức được gọi (tăng `missionsWon`, cộng Streak, hồi Hunger/Mood cho Pet Corgi).
  2. Trong `index.html`: Expose hàm `addPts(delta)` qua `window.__ELW_BRIDGE.addPts` (cập nhật trực tiếp `P.pts`, lưu `elw_progress_v2` và render lại `#pts`). Cập nhật `adjustPoints(delta)` trong `pet-survival.js` gọi `window.__ELW_BRIDGE.addPts(delta)` để điểm thưởng/phạt hiển thị tức thời trên giao diện.

---

### Ưu tiên P1 — Tinh chỉnh UX & Hoàn thiện tính năng

#### P1.1. Hoàn thiện Popover Tủ lạnh (`#fridgeCard`)
- **File cần sửa:** [modules/world-3d.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/world-3d.js)
- **Chi tiết thay đổi:**
  1. Thêm listener `keydown` (`Escape`) để đóng `#fridgeCard` (`closesOnEscape: true`).
  2. Tự động đóng popover `#fridgeCard` trên màn hình nhỏ hoặc khi chuyển phòng/chủ đề để không che khuất cảnh 3D.

#### P1.2. Nâng cấp trình duyệt từ vựng trong `vocab-3000.js` (Tìm kiếm, Phân trang & Đếm chính xác)
- **File cần sửa:** [modules/vocab-3000.js](file:///d:/tools/Hoc%20tieng%20anh/english-life-world/modules/vocab-3000.js)
- **Chi tiết thay đổi:**
  1. Bổ sung thanh tìm kiếm (`#v3kSearchInput`) tìm theo từ tiếng Anh hoặc nghĩa tiếng Việt trên toàn bộ kho từ.
  2. Thay thế giới hạn cứng `.slice(0, 24)` bằng nút `Xem thêm (+24 từ)` / phân trang để người học truy cập được toàn bộ 829+ từ vựng duy nhất đang có trong hệ thống.
  3. Sửa hàm `countMastered()` chỉ đếm số từ thực sự đã được đánh dấu thuộc/thực hành, hiển thị rõ tổng số từ đã nạp trên lộ trình 3000 từ.

---

### Ưu tiên P2 — Mở rộng dữ liệu dài hạn (Roadmap)
- Mở rộng thêm các gói từ vựng JSON theo cấp độ B1–C2 để nâng tổng số từ duy nhất từ `829` lên đủ `3.000` từ chuẩn Oxford mà không làm nặng thời gian tải trang ban đầu (lazy-load theo cấp độ).
