# Kế hoạch Triển khai A4: Integration, Scene Bridge & Playwright QA (`docs/PET25D_PLAN_A4.md`)

## 1. File Dự kiến Sửa / Tạo mới
1. `index.html` — Expose `window.ELW_SCENE`, sửa hiển thị `#o-cat` đa phòng, tắt transition `1.1s` của `#catPos` khi `ELW_PET_FOLLOW` điều khiển, nhường quyền trong `applyLiving()`, và nhúng `<script>` 3 module mới đúng thứ tự.
2. `modules/pet-interaction.js` — Cập nhật `syncScenePet()` để ủy quyền vị trí cho `ELW_PET_FOLLOW` khi module này hoạt động (tránh giật pet về tọa độ cứng).
3. `tools/test_pet25d.mjs` — Script kiểm thử tự động toàn diện bằng Playwright trên bản build thực tế, chụp chuỗi ảnh `docs/pet25d-*.png`.
4. `docs/PET25D_REPORT.md` — Báo cáo nghiệm thu chi tiết kèm số liệu thực tế.

## 2. Giải pháp Kỹ thuật Chi tiết

### 2.1. Sửa `index.html`
1. **Đảm bảo `#o-cat` tồn tại trong mọi room/zone**:
   - Tại dòng ~1851 của `index.html`:
     ```js
     [...world.children].forEach(e=>{if(e.id!=="char"&&e.id!=="o-cat")e.dataset.room="living"});
     ```
     Nhờ đó khi chuyển sang `kitchen`, `bathroom`, `bedroom`, `cafe_counter`, `market_produce`, `market_meat`, `park`, `restaurant`, `outdoor`, `school`, phần tử `#o-cat` không bị `renderRoom()` ẩn đi (`display: none`).
2. **Tắt transition `1.1s` của `#catPos` khi follow chạy**:
   - Thêm CSS rule: `#o-cat.pet-follow-active #catPos { transition: none !important; }`.
3. **Tương thích `catPosNow()` và `applyLiving()`**:
   - Trong `catPosNow()`: nếu `window.ELW_PET_FOLLOW && ELW_PET_FOLLOW.isControlling && ELW_PET_FOLLOW.isControlling()`, trả về vị trí thực của pet từ `ELW_PET_FOLLOW.getPosition()` để khi người chơi bấm vào các hành động tương tác với pet (`catSpot`), nhân vật sẽ đi tới đúng vị trí hiện tại của pet.
   - Trong `applyLiving()`: khi `ELW_PET_FOLLOW.isControlling()` là `true`, không ghi đè `#catPos.style.transform`, `#catScale.style.transform`, `#catFlip.style.transform` và `c.dataset.base` bằng tọa độ tĩnh cũ.
4. **Expose `window.ELW_SCENE`**:
   - Cung cấp `getW`, `getCharState`, `route`, `getObstacles`, `inBox`, `crossesBox`, `charScale`, `sortDepth`, `isCatInteractionActive`, `getWeather`.
   - Trong `route(a, b, roomId)`: hỗ trợ tìm đường cho cả phòng `living` (`routeLiving`) và các phòng khác (`OBST[roomId]`).
5. **Nhúng `<script>` 3 module mới**:
   ```html
   <script src="modules/pet-personality.js"></script>
   <script src="modules/pet-follow.js"></script>
   <script src="modules/pet-anim.js"></script>
   ```
   Ngay sau `modules/pet-interaction.js` và trước `modules/pet-survival.js`.

### 2.2. Sửa `modules/pet-interaction.js`
- Trong `syncScenePet()`:
  - Nếu `window.ELW_PET_FOLLOW && typeof window.ELW_PET_FOLLOW.isControlling === "function" && window.ELW_PET_FOLLOW.isControlling()`, không ghi đè `catPos.style.transform` và `catFlip.style.transform` bằng vị trí cố định `(W.x +- 68, W.y + 12)` mà gọi `window.ELW_PET_FOLLOW.syncOnRoomChange(W.room, W.x, W.y, W.dir)` nếu đổi phòng.

### 2.3. Đóng gói & Kiểm thử Thực tế (`tools/build.py` & `tools/test_pet25d.mjs`)
- Chạy `python tools/build.py D:\tools\Hoc tieng anh\english-life-world-ban-day-du.html` để đóng gói toàn bộ module vào file bundle.
- Viết `tools/test_pet25d.mjs` chạy Chromium qua Playwright trên bundle và kiểm tra tất cả tiêu chí bắt buộc:
  1. Di chuyển qua lại trong `living`: khoảng cách `40–120px`, không xuyên qua `TABLE_BOX` / `SOFA_BOX`, z-order `data-base` đúng, lật hướng `#catFlip`, dừng trong deadzone và đi tiếp khi nhân vật đi.
  2. Đổi room/zone (`kitchen`, `cafe_counter`, `market_produce`, `park`): `#o-cat` hiển thị cạnh nhân vật và tiếp tục đi theo.
  3. Needs & Idle: `energy < 25` đi chậm hơn & đổi ảnh `tired.png`; `fun` cao đi nhanh hơn; đứng yên 5s vẫn có chuyển động (`#catHop` transform thay đổi theo thời gian).
  4. Sở thích (`ELW_PET_PERSONALITY`): `mochi` ở `market_meat` mua cá → `love`/`like` + `fun` tăng + câu phản ứng; `milu` ở `park` ném bóng → `love`; `mochi` gặp nước/tắm → `dislike`.
  5. Chống farm thưởng (lần 2 `duplicate: true`, không cộng sao) & khoá pet premium (`boba`, `ember`... `unlocked: false`).
  6. Hiệu suất 300 frames (FPS, bộ nhớ heap, 0 lỗi JS), mobile 390px không cuộn ngang, `prefers-reduced-motion: reduce` hoạt động đúng.
  7. Hồi quy: 3 tab Chơi/Học/Nhiệm vụ, hoàn thành nhiệm vụ `cafe_order_latte` & `market_weekly_shopping`, Linh chỉ xuất hiện ngoài nhà, âm thanh không chồng.
  8. Xuất ảnh minh chứng `docs/pet25d-*.png`.
