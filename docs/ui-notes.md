# English Life World — UI Architecture & Implementation Notes (P0.6 Mobile-First Refactor)

> **Phân vùng sở hữu:** Antigravity (Visual/UI Module Owner)  
> **Tài liệu tham chiếu:** `docs/COLLAB-PLAN.md`  
> **Trạng thái:** Hoàn thành P0.6 Mobile-First Refactor (`ui-mobile.js`, `ui-scene.js`, `ui-mission.js`, `docs/ui-notes.md`). Đã kiểm thử trình duyệt thực tế ở 360px, 390px và 412px, sẵn sàng để Claude gỡ bỏ `<style id="elwTopicCss">` trong `index.html`.

---

## 1. Tổng quan các thay đổi trong P0.6

| File | Module / Vai trò | Nội dung thay đổi chính trong P0.6 | Trạng thái |
|---|---|---|---|
| `modules/ui-mobile.js` | `window.ELW_UI_MOBILE` | 1. Bỏ `max-height: 42vh`, `overflow: hidden`, `sticky` của cảnh và SVG. Cảnh luôn hiển thị trọn vẹn theo tỷ lệ chuẩn `1000:640`.<br>2. Thu gọn thanh Cô Mai (`.guide`) còn 1 dòng, cao tối đa 56px (thực tế 52px), avatar 32px, text cắt bằng `…`, hỗ trợ chạm để mở.<br>3. Thêm `padding-bottom` cho `body` (128px) chống che nội dung cuối trang.<br>4. Tích hợp layout mobile: nút chủ đề "🏠 Nhà ở ▾", 6 phòng dạng lưới 6 cột, hàng thẻ nhiệm vụ `.mchip` vuốt ngang, topic sheet dialog.<br>5. Đảm bảo toàn bộ touch targets ≥ 40px. | **Đã cập nhật** |
| `modules/ui-scene.js` | `window.ELW_UI_SCENE` | Nhãn phân loại trên bong bóng thoại chuyển sang tiếng Anh thuần: `"Request"` (bỏ `"Yêu cầu"`), cùng `"Say"`, `"Result"`, `"Alert"`, `"Hint"`. Tăng diện tích chạm nút đóng bong bóng. | **Đã cập nhật** |
| `modules/ui-mission.js` | `window.ELW_UI_MISSION` | Trên mobile khi compact: chỉ hiển thị tiêu đề 1 dòng, chip các bước, bước đang làm (câu EN + nút 🔊), nút Làm ngay và Gợi ý. Mô tả và người giao việc đưa vào phần "Mở rộng". Tổng chiều cao ≤ 260px (thực tế 244px). | **Đã cập nhật** |
| `docs/ui-notes.md` | Tài liệu bàn giao | Báo cáo chi tiết kiểm thử ở 360, 390, 412px và hướng dẫn tháo gỡ CSS ghi đè cho Claude. | **Đã cập nhật** |

---

## 2. Chi tiết kỹ thuật các thành phần đã tinh chỉnh

### 2.1. Cảnh phòng hiển thị trọn vẹn (`modules/ui-mobile.js`)
- `section.scene, .leftcol .scene`: Chuyển sang `position: relative !important`, `top: auto`, `max-height: none !important`, `overflow: visible !important`.
- `#room`: Thiết lập `aspect-ratio: 1000 / 640 !important`, `width: 100% !important`, `height: auto !important`, `max-height: none !important`. Cảnh hiển thị đầy đủ, không bị cắt xén ở bất kỳ viewport nào.
- Thanh điều khiển cảnh `.scene-bar`:
  - Nút chọn chủ đề `.topicbtn`: Cao ≥ 40px, bo tròn pill, co dãn linh hoạt `flex: 1`.
  - 6 nút phòng `#roomTabs button`: Hiển thị lưới 6 cột `grid-template-columns: repeat(6, 1fr)`, icon trên + tên ngắn dưới, chiều cao ≥ 44px.
  - Hàng thẻ nhiệm vụ `.mchips`: Hỗ trợ cuộn ngang vuốt mượt mà (`scroll-snap-type: x mandatory`), thẻ `.mchip` cao ≥ 44px.

### 2.2. Thanh Cô Mai một dòng & Padding an toàn đáy (`modules/ui-mobile.js`)
- Vị trí ghim: Cố định phía trên thanh tab đáy:
  `bottom: calc(var(--uimb-bar-h) + env(safe-area-inset-bottom, 0px) + 6px)`
- Kích thước:
  - Chiều cao thanh: 52px (thỏa mãn yêu cầu tối đa 56px).
  - Avatar Cô Mai (`.face`): Kích thước chuẩn 32x32px (`flex: 0 0 32px`).
  - Text: Bọc trong container 1 dòng (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`).
- Cơ chế tương tác ("Chạm để mở"):
  - Khi có hành động nhiệm vụ: Chạm vào thanh sẽ thực thi hành động (`guideAct()`).
  - Khi muốn xem trọn vẹn câu thoại dài: Chạm vào avatar / nhãn Cô Mai sẽ toggle mở rộng hiển thị toàn bộ nội dung (`.uimb-guide-expanded`). Thuộc tính `title` cũng được cập nhật liên tục theo nội dung hướng dẫn.
- Chống che nội dung cuối trang:
  - `body` trên mobile được bổ sung:
    `padding-bottom: calc(var(--uimb-bar-h) + var(--uimb-guide-h) + env(safe-area-inset-bottom, 0px) + 20px) !important;` (tổng cộng ~128px).
  - Đảm bảo người dùng cuộn đến cuối trang luôn nhìn thấy thẻ cuối cùng mà không bị thanh Cô Mai hay tab bar che khuất.

### 2.3. Thẻ nhiệm vụ di động siêu gọn (`modules/ui-mission.js`)
- Trong trạng thái compact (mặc định trên mobile):
  1. **Tiêu đề 1 dòng:** `.uim-title-1line` hiển thị `🎯 [Tên tiếng Anh] · [Tên tiếng Việt]` kèm nút `▲ Mở rộng` (cao 40px).
  2. **Hàng chip các bước:** `.uim-step-chips` gồm 4 chip gọn gàng (cao 40px), cuộn ngang không vỡ dòng.
  3. **Bước đang làm:** Chỉ hiển thị câu tiếng Anh trọng tâm kèm nút phát âm 🔊 (cao 40px). Các bước khác và bản dịch phụ được ẩn đi để tối ưu không gian.
  4. **Hàng nút hành động:** Nút "💡 Gợi ý" (cao 42px) và nút "⚡ Làm ngay" (cao 42px) dính ở đáy thẻ.
  5. **Mô tả & Người giao việc:** Đưa vào container `.uim-expanded-section` (ẩn ở compact mode, chỉ bung ra khi chạm `▲ Mở rộng`).
- **Khống chế chiều cao:**
  - `max-height: 260px !important;` trên `.uim-card:not(.uim-expanded)`.
  - Chiều cao thực tế đo đạc trong browser: **244px** (nằm gọn dưới ngưỡng 260px).
  - Khi bấm `▲ Mở rộng`: Thẻ bung đầy đủ chi tiết với chiều cao 680px kèm toàn bộ lộ trình và thông tin người giao việc.
  - Bọc thẻ ngoài `#missionCard`: Đã tinh chỉnh để tránh double-card padding, đảm bảo chiều cao tổng thể không bị dội lên.

### 2.4. Nhãn bong bóng cảnh tiếng Anh thuần (`modules/ui-scene.js`)
- Nhãn phân loại trong `KIND_META`:
  - `request`: Đổi từ `"Yêu cầu · Request"` thành `"Request"`.
  - `say`: Đổi thành `"Say"`.
  - `result`: Đổi thành `"Result"`.
  - `error`: Đổi thành `"Alert"`.
  - `hint`: Đổi thành `"Hint"`.
- Hoàn toàn loại bỏ chữ tiếng Việt trong nhãn bong bóng trên không gian SVG cảnh, giữ cho hình ảnh tương tác chuẩn tiếng Anh.

---

## 3. Báo cáo Kết quả Kiểm thử Trình duyệt Thực tế (Automated Browser QA)

Đã chạy kiểm thử tự động trên Microsoft Edge Headless (Chromium Engine) thông qua Chrome DevTools Protocol (CDP), **đã gỡ bỏ hoàn toàn thẻ `<style id="elwTopicCss">`** để kiểm tra tính độc lập của `ui-mobile.js`:

| Hạng mục kiểm tra | 360px (Màn hình nhỏ) | 390px (iPhone chuẩn) | 412px (Android chuẩn) | Tiêu chuẩn | Kết luận |
|---|---|---|---|---|---|
| **Cảnh không bị cắt** | Tỉ lệ 1.563 (336x215.03) | Tỉ lệ 1.563 (366x234.23) | Tỉ lệ 1.563 (388x248.31) | aspect-ratio 1000:640, `max-height: none` | **ĐẠT (PASS)** |
| **Không cuộn ngang** | `scrollWidth`: 360px (`hasHScroll: false`) | `scrollWidth`: 390px (`hasHScroll: false`) | `scrollWidth`: 412px (`hasHScroll: false`) | `scrollWidth <= innerWidth` | **ĐẠT (PASS)** |
| **Thanh Cô Mai (.guide)** | Cao 52px, avatar 32x32px, 1 dòng ellipsis | Cao 52px, avatar 32x32px, 1 dòng ellipsis | Cao 52px, avatar 32x32px, 1 dòng ellipsis | Cao ≤ 56px, avatar 32px, text 1 dòng `...` | **ĐẠT (PASS)** |
| **Padding bottom body** | 128px | 128px | 128px | Chống che bởi tab bar (56px) + guide (52px) | **ĐẠT (PASS)** |
| **Thẻ nhiệm vụ compact** | **244px** | **244px** | **244px** | Tổng chiều cao ≤ 260px | **ĐẠT (PASS)** |
| **Thẻ nhiệm vụ expanded** | 680px (bung đủ mô tả + giver) | 680px (bung đủ mô tả + giver) | 680px (bung đủ mô tả + giver) | Hiện phần "Mở rộng" khi bấm | **ĐẠT (PASS)** |
| **Nhãn bong bóng thoại** | `❓ Request` | `❓ Request` | `❓ Request` | Tiếng Anh thuần, bỏ "Yêu cầu" | **ĐẠT (PASS)** |
| **Kích thước nút bấm** | Toàn bộ nút app ≥ 40px: `.topicbtn` (40px), `.iconbtn` (40px), `#roomTabs button` (44px), `.mchip` (44px), `.uim-chip-item` (40px), `.uim-btn-speak` (40px), `.uim-btn-auto` (42px), `.uim-btn-hint` (42px), `.uimb-tab-btn` (48px) | Đạt chuẩn ≥ 40px | Đạt chuẩn ≥ 40px | Chiều cao mục bấm ≥ 40px | **ĐẠT (PASS)** |

---

## 4. Biên bản Bàn giao & Hành động tiếp theo cho Claude (`claude-desktop`)

> [!IMPORTANT]
> **Claude có thể an toàn xóa bỏ thẻ ghi đè `<style id="elwTopicCss">` trong `index.html`:**
> Toàn bộ các quy tắc về cảnh 1000:640, thanh điều khiển phòng 6 cột, nút chủ đề, hàng chip nhiệm vụ vuốt ngang `.mchip` và dialog chọn chủ đề `#topicSheet` đã được chuyển vào và chuẩn hóa hoàn toàn bên trong `modules/ui-mobile.js`.
> Việc gỡ bỏ `<style id="elwTopicCss">` sẽ không gây ảnh hưởng hay xung đột giao diện.
