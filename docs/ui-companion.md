# English Life World — UI Companion Architecture & Verification (P6)

> **Phân vùng sở hữu:** Antigravity (Visual/UI Module Owner)  
> **Tài liệu tham chiếu:** `docs/COLLAB-PLAN.md`, `docs/ui-notes.md`  
> **Trạng thái:** Hoàn thành P6 Giao diện Bạn đồng hành (`modules/ui-companion.js`, `docs/ui-companion.md`). Đã kiểm thử trình duyệt thực tế Chromium Headless qua Playwright ở 360px, 390px và 412px, sẵn sàng để Claude tích hợp vào `index.html`.

---

## 1. Tổng quan Thiết kế Giao diện Bạn đồng hành (P6)

Module `modules/ui-companion.js` (Namespace `window.ELW_UI_COMPANION`) đảm nhận nâng cấp trải nghiệm thị giác cho tính năng bạn đồng hành "Linh" (`window.ELW_LIFE`) theo chuẩn Mobile-First:

1. **Công tắc bạn đồng hành `#btnFriend` trên thanh điều khiển cảnh (`.scene-bar .stools`):**
   - Thiết kế công tắc pill cao **44px** (chuẩn cảm ứng ngón tay cái).
   - Tích hợp avatar chân dung thật của Linh từ `assets/people/linh-smiling.png` (bo tròn 32px).
   - Hai trạng thái hiển thị khác biệt rõ rệt, **không chỉ dựa vào màu sắc** (thân thiện với người mù màu và điều kiện ánh sáng ngoài trời):
     - **BẬT (`aria-pressed="true"` — Đi cùng):** Avatar có màu sắc tươi sáng, viền xanh ngọc `#10b981` dày 2px đổ bóng glow; viền nút nét liền (solid); chữ in đậm nổi bật `"Linh · ✓ Đi cùng"`; nền xanh mint mát mắt `#ecfdf5`.
     - **TẮT (`aria-pressed="false"` — Đi một mình):** Avatar được lọc xám (grayscale 85%, contrast 85%), giảm độ đậm; viền nút nét đứt (dashed `#94a3b8`); chữ màu xám `"Linh · ✕ Một mình"`; nền xám phẳng `#f1f5f9` không đổ bóng.
   - Thao tác chạm trực quan, phản hồi tức thì với logic `syncFriendBtn()` và `ELW_LIFE.setCompanion()`.

2. **Công tắc switch `.tsfriend` trong Bảng chọn chủ đề (`#topicSheet`):**
   - Biến thẻ chọn thành khối switch cao **≥ 52px** (thực tế 97px bao gồm dòng mô tả phụ rõ ràng).
   - Avatar Linh nổi bật bên trái (`assets/people/linh-smiling.png`, 40x40px).
   - Nút gạt switch chuẩn iOS/Material bên phải (track 48x28px, thumb tròn 22px trượt mượt mà kèm biểu tượng `✓` / `✕`).
   - Giữ nguyên native checkbox `<input type="checkbox" id="tsFriend">` và sự kiện `onchange` của Claude, đảm bảo 100% tương thích logic.

3. **Thẻ hỏi đáp `#ltCard` (.lt-card) siêu gọn trên điện thoại 360–412px:**
   - **Khống chế chiều cao:** `max-height: 300px` (đo đạc thực tế: **298.5px**).
   - **3 đáp án dạng nút lớn:** Chiều cao mỗi nút đáp án đạt chuẩn **≥ 44px** (thực tế 44.0px), hiển thị câu tiếng Anh cỡ chữ 13.5px và bản dịch tiếng Việt 11px.
   - **Không che cảnh:** Nằm ngay dưới SVG `#room` theo luồng tài liệu tự nhiên (`cardTop > roomBottom`), khoảng cách 8px, hoàn toàn không đè lên không gian tương tác trong phòng.
   - **Ảnh chân dung thật:** Thay emoji `🧑‍🦱` bằng chân dung tươi cười `assets/people/linh-smiling.png` của Linh (và hỗ trợ map ảnh khách ghé thăm Mrs. Park, Minh, Tourist, Courier).

---

## 2. Báo cáo Kết quả Kiểm thử Tự động (Playwright Browser QA)

Đã chạy kiểm thử tự động trên Microsoft Chromium Engine thông qua Playwright test script (`tools/test_ui_companion.py`), đo đạc kích thước bounding box và chụp màn hình thực tế:

| Tiêu chí kiểm tra | 360px (Màn hình nhỏ) | 390px (iPhone chuẩn) | 412px (Android chuẩn) | Tiêu chuẩn đặt ra | Kết luận |
|---|---|---|---|---|---|
| **Nút `#btnFriend` chiều cao** | **44.0px** (168x44px) | **44.0px** (168x44px) | **44.0px** (168x44px) | Chiều cao ≥ 44px | **ĐẠT (PASS)** |
| **Nút `#btnFriend` avatar** | Ảnh `linh-smiling.png` (32px) | Ảnh `linh-smiling.png` (32px) | Ảnh `linh-smiling.png` (32px) | Có avatar thật Linh | **ĐẠT (PASS)** |
| **Phân biệt BẬT / TẮT `#btnFriend`** | Bật: `Linh · ✓ Đi cùng` (solid/color)<br>Tắt: `Linh · ✕ Một mình` (dashed/grayscale) | Bật: `Linh · ✓ Đi cùng`<br>Tắt: `Linh · ✕ Một mình` | Bật: `Linh · ✓ Đi cùng`<br>Tắt: `Linh · ✕ Một mình` | Khác nhau cả Icon, Chữ, Viền, Ảnh | **ĐẠT (PASS)** |
| **Switch `.tsfriend` trong dialog** | Cao 97px, track 48px, avatar 40px | Cao 97px, track 48px, avatar 40px | Cao 97px, track 48px, avatar 40px | Dạng switch, ≥ 44px, có avatar | **ĐẠT (PASS)** |
| **Thẻ `#ltCard` chiều cao** | **298.5px** | **298.5px** | **298.5px** | Tối đa ≤ 300px | **ĐẠT (PASS)** |
| **3 nút đáp án `.lt-opt`** | 3 nút đều đạt **44.0px** | 3 nút đều đạt **44.0px** | 3 nút đều đạt **44.0px** | 3 nút lớn ≥ 44px | **ĐẠT (PASS)** |
| **Không che cảnh `#room`** | `cardTop`: 461.0px > `roomBottom`: 453.0px | `cardTop`: 430.2px > `roomBottom`: 422.2px | `cardTop`: 444.3px > `roomBottom`: 436.3px | `coversScene = false` | **ĐẠT (PASS)** |
| **Avatar Linh trong `#ltCard`** | `linh-smiling.png` | `linh-smiling.png` | `linh-smiling.png` | Dùng ảnh thật Linh | **ĐẠT (PASS)** |

### Ảnh chụp kiểm thử lưu trữ tại `docs/`:
- `docs/shot-companion-topicsheet.png`: Bảng chọn chủ đề với switch `.tsfriend` có avatar Linh và nút trượt gạt.
- `docs/shot-companion-360.png`: Màn hình 360px hiển thị công tắc `#btnFriend` và thẻ `#ltCard` gọn 298.5px.
- `docs/shot-companion-390.png`: Màn hình 390px (iPhone).
- `docs/shot-companion-412.png`: Màn hình 412px (Android).

---

## 3. Hướng dẫn Tích hợp dành cho Claude (`claude-desktop`)

> [!IMPORTANT]
> **Các bước Claude cần thực hiện trong `index.html`:**
> 1. Thêm thẻ script nạp module vào `index.html` (đặt ngay sau `modules/life-talk.js`):
>    ```html
>    <script src="modules/life-talk.js"></script>
>    <script src="modules/ui-companion.js"></script>
>    ```
> 2. Module `ui-companion.js` tự động khởi chạy (`init()`), tự nạp CSS có tiền tố cách ly và trang trí trực tiếp các phần tử giao diện mà **không thay đổi bất kỳ logic JavaScript nào** của `window.ELW_LIFE` hay `syncFriendBtn()`.
> 3. Nếu Claude gọi `syncFriendBtn()`, CSS và selector `aria-pressed="true|false"` sẽ tự động cập nhật hiển thị ngay lập tức.
