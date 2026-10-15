# English Life World — UI Topics & Object Tags Integration Guide

> **Phân vùng sở hữu:** Antigravity (Visual/UI Module Owner)  
> **Tài liệu tham chiếu:** `docs/COLLAB-PLAN.md`, `docs/TOPICS-PLAN.md`, `docs/ui-notes.md`  
> **Trạng thái:** Hoàn thành toàn diện (`modules/ui-topics.js`, `assets/topics/`, `docs/ui-topics.md`).  
> **Người nhận bàn giao:** Claude (`claude-desktop`)

---

## 1. Tổng quan các file bàn giao

| Đường dẫn file | Định dạng / Kích thước | Mô tả & Trách nhiệm |
|---|---|---|
| `modules/ui-topics.js` | JS Module (`window.ELW_UI_TOPICS`) | Nâng cấp giao diện `#topicSheet`: thẻ chủ đề kèm ảnh minh họa, màn khóa thân thiện mobile, hiệu ứng mở khóa và điều chỉnh nhãn đồ vật chống đè chữ. |
| `assets/topics/home.png` + `.svg` | PNG 600×400 (17.8 KB) + SVG (7.6 KB) | Ảnh chủ đề "Nhà ở" (Cozy living room, armchair, lamp, coffee table). |
| `assets/topics/park.png` + `.svg` | PNG 600×400 (23.5 KB) + SVG (7.3 KB) | Ảnh chủ đề "Công viên" (Green lawn, pond with duck, oak tree, bench, kite). |
| `assets/topics/restaurant.png` + `.svg` | PNG 600×400 (21.0 KB) + SVG (8.5 KB) | Ảnh chủ đề "Quán ăn" (Warm bistro, cloche with steam, wine glass, candle). |
| `assets/topics/cafe.png` + `.svg` | PNG 600×400 (24.1 KB) + SVG (9.1 KB) | Ảnh chủ đề "Quán cà phê" (Espresso machine, ceramic latte art cup, takeaway cup). |
| `assets/topics/supermarket.png` + `.svg` | PNG 600×400 (26.1 KB) + SVG (9.8 KB) | Ảnh chủ đề "Siêu thị" (Shopping cart with fresh baguette, apple, milk, vegetables). |
| `assets/topics/outdoor.png` + `.svg` | PNG 600×400 (20.5 KB) + SVG (9.5 KB) | Ảnh chủ đề "Hoạt động ngoài trời" (Camping tent, campfire, backpack, pine trees, starry sky). |
| `docs/ui-topics.md` | Tài liệu Markdown | Bản hướng dẫn tích hợp & kết quả QA trình duyệt thực tế. |

---

## 2. Hướng dẫn tích hợp cho Claude (`claude-desktop`)

### 2.1. Thêm script vào `index.html`
Trong `index.html`, Claude chỉ cần chèn thẻ script nạp `modules/ui-topics.js` (khuyến nghị đặt trước `</body>` hoặc sau các module UI):

```html
<script src="modules/ui-topics.js"></script>
```

### 2.2. Khởi tạo
Module có cơ chế **tự động khởi tạo** khi `DOMContentLoaded`.  
Nếu cần khởi tạo thủ công hoặc gọi lại sau khi render động, Claude có thể gọi:

```js
window.ELW_UI_TOPICS.init();
```

Module hoàn toàn **không can thiệp logic khóa**:
- Giữ nguyên `localStorage` key `elw_topics_v1`.
- Giữ nguyên mã mở khóa `6789`, mảng `TOPICS`, hàm `draw()`, `askCode()`.
- Tự động bắt sự kiện `MutationObserver` khi Claude gọi `draw()` hoặc cập nhật DOM `#topicSheet`.

---

## 3. Các cải tiến giao diện chính

### 3.1. Thiết kế lại bảng chọn chủ đề `#topicSheet` (Mobile-First 360–412px)
- **Backdrop Blur & Card Shape:** Nền mờ kính hiện đại `backdrop-filter: blur(6px)`, góc bo tròn mềm mại (`26px 26px 0 0`), tay nắm kéo chuẩn mobile.
- **Thẻ chủ đề 2 cột (.tgrid):**
  - Khung ảnh minh họa tỉ lệ 3:2 chuẩn game 2.5D, góc bo tròn 12px, tải ảnh sắc nét từ `assets/topics/<id>.png` (fallback SVG nội tuyến nếu mạng lỗi).
  - Trạng thái khóa rõ ràng: phủ mờ, biểu tượng ổ khóa 🔒 cùng nhãn "Chưa mở" trên ảnh; thẻ giảm opacity còn 72% chống gây phân tâm.
  - Thẻ đang chơi (`live`): viền cam nổi bật `#e8743b`, nền gradient ấm, badge "Đang học".
  - Thẻ đã chọn (`picked`): viền xanh dương `#3b8de8`, badge "✓ Đã chọn #N".
- **Ô nhập mã to & dễ bấm:**
  - Chiều cao ô nhập và nút bấm đạt **48px** (chuẩn cảm ứng mobile).
  - Phông chữ số 22px, `letter-spacing: 8px`, căn giữa rõ ràng.
  - Bổ sung chip tiện ích **"Mã thử: 6789"**: người dùng/tester chỉ cần chạm 1 chạm là tự điền mã 6789.
  - Hiệu ứng rung lắc (`.uit-shake`) khi nhập sai mã hoặc khi chạm vào chủ đề đang khóa.
- **Phản hồi mở khóa thành công:**
  - Banner chúc mừng màu xanh lá `"🎉 Đã mở khóa thành công! Tích chọn chủ đề bạn muốn ưu tiên học tiếp."` hiển thị ngay khi mở khóa.
  - 5 thẻ chủ đề lập tức gỡ bỏ lớp phủ khóa, chuyển sang trạng thái sẵn sàng chọn.

### 3.2. Ảnh minh họa 2.5D trong `assets/topics/`
- Tất cả 6 chủ đề đều có cả 2 định dạng:
  - `.png`: 600×400 px, dung lượng từ **17.8 KB đến 26.1 KB** (thấp hơn rất nhiều so với ngưỡng 150KB).
  - `.svg`: định dạng vector sắc nét vô hạn, dung lượng < 10 KB.
- Đúng bảng màu ấm cúng của game: cam `#e8743b`, gỗ ấm `#5a3d1f`, kem `#fffdf9`, kết hợp màu sắc nhận diện đặc trưng cho từng chủ đề (xanh lá công viên, vàng ấm quán ăn, nâu cà phê, xanh siêu thị, hoàng hôn ngoài trời).

### 3.3. Xử lý triệt để xung đột nhãn (Tags) của 20 đồ vật mới
Kiểm tra toạ độ phát hiện 5 điểm xung đột chữ nghiêm trọng trên màn hình 390px, đã được giải quyết hoàn toàn bằng CSS rules trong `ui-topics.js`:

1. **Đèn trần (`o-ceilinglight`) vs Cửa sổ (`o-window`)** (Phòng khách):  
   *Nguyên nhân:* Nhãn đèn trần `[540, 64]` nằm đè lên nhãn cửa sổ `[510, 50]`.  
   *Giải pháp:* `transform: translate(52px, -36px)` đưa nhãn đèn trần lên sát trần nhà thoáng đãng.
2. **Lọ hoa (`o-vase`) vs Loa (`o-speaker`)** (Phòng khách):  
   *Nguyên nhân:* Nhãn lọ hoa `[852, 470]` đè nhãn loa `[822, 462]`.  
   *Giải pháp:* `transform: translate(26px, 22px)` đưa nhãn lọ hoa xuống góc phải dưới bình hoa.
3. **Chậu cây treo (`o-hangingplant`) vs Tủ lạnh (`o-fridge`)** (Phòng khách):  
   *Nguyên nhân:* Chuỗi chữ "hanging plant · chậu cây treo" quá dài tràn sang tủ lạnh `[905, 100]`.  
   *Giải pháp:* `transform: translate(0px, 46px)` đưa nhãn chậu cây xuống dưới vùng lá cây.
4. **Dây đèn (`o-fairylights`) vs Giường (`o-bed`)** (Phòng ngủ):  
   *Nguyên nhân:* Nhãn dây đèn `[272, 214]` trùng toạ độ giường `[265, 210]`.  
   *Giải pháp:* `transform: translate(0px, -55px)` đưa nhãn dây đèn lên vị trí dây đèn treo trên tường.
5. **Thùng rác tái chế (`o-recyclingbin`) vs Thùng rác (`o-trashbin`)** (Nhà bếp):  
   *Nguyên nhân:* Chuỗi chữ dài 33 ký tự đè lên nhãn thùng rác thường `[165, 380]`.  
   *Giải pháp:* `transform: translate(-32px, 32px)` tách riêng hai thùng rác.
6. **Độ tương phản trên mobile 360–412px:**  
   Bổ sung `font-size: 14.5px`, `stroke-width: 4.5px`, viền trắng `#ffffff` và `filter: drop-shadow` giúp chữ cực kỳ rõ ràng, không bị chìm vào nền phòng khi co nhỏ.

---

## 4. Báo cáo Kết quả Kiểm thử Trình duyệt Thực tế (Automated QA Report)

Đã chạy tự động thông qua **Playwright Chromium/Edge Headless**:

| Hạng mục kiểm tra | 360px (Small Mobile) | 390px (iPhone 12/13/14) | 412px (Android Pixel/Galaxy) | Kết luận |
|---|---|---|---|---|
| **Kích thước nút chọn chủ đề** | 242 × 40 px | 272 × 40 px | 294 × 40 px | **ĐẠT (PASS)** |
| **Mở `#topicSheet`** | Hiển thị trọn vẹn, không tràn màn hình | Hiển thị trọn vẹn, không tràn màn hình | Hiển thị trọn vẹn, không tràn màn hình | **ĐẠT (PASS)** |
| **Chiều cao ô nhập mã (`#tsCode`)** | 48.0 px (≥ 44px) | 48.0 px (≥ 44px) | 48.0 px (≥ 44px) | **ĐẠT (PASS)** |
| **Chiều cao nút mở khóa** | 48.0 px (≥ 44px) | 48.0 px (≥ 44px) | 48.0 px (≥ 44px) | **ĐẠT (PASS)** |
| **Chiều cao nút Xong (`#tsClose`)** | 48.0 px (≥ 44px) | 48.0 px (≥ 44px) | 48.0 px (≥ 44px) | **ĐẠT (PASS)** |
| **Chip tự điền mã ("Mã thử: 6789")** | Nhận click, tự điền 6789 | Nhận click, tự điền 6789 | Nhận click, tự điền 6789 | **ĐẠT (PASS)** |
| **Hiển thị 6 thẻ chủ đề kèm ảnh** | Đủ 6 ảnh (naturalWidth 600) | Đủ 6 ảnh (naturalWidth 600) | Đủ 6 ảnh (naturalWidth 600) | **ĐẠT (PASS)** |
| **Lớp phủ khóa khi chưa mở** | 5 thẻ bị khóa (trừ Nhà ở) | 5 thẻ bị khóa (trừ Nhà ở) | 5 thẻ bị khóa (trừ Nhà ở) | **ĐẠT (PASS)** |
| **Mở khóa thành công với 6789** | Hiện banner chúc mừng, 0 thẻ khóa | Hiện banner chúc mừng, 0 thẻ khóa | Hiện banner chúc mừng, 0 thẻ khóa | **ĐẠT (PASS)** |
| **Không đè nhãn `ceilinglight` vs `window`** | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | **ĐẠT (PASS)** |
| **Không đè nhãn `vase` vs `speaker`** | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | **ĐẠT (PASS)** |
| **Không đè nhãn `hangingplant` vs `fridge`** | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | **ĐẠT (PASS)** |
| **Không đè nhãn `recyclingbin` vs `trashbin`** | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | **ĐẠT (PASS)** |
| **Không đè nhãn `fairylights` vs `bed`** | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | Khoảng cách an toàn (`OVERLAP=False`) | **ĐẠT (PASS)** |
