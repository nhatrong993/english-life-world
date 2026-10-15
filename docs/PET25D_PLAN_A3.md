# Kế hoạch Triển khai A3: Animation & Emotion (`docs/PET25D_PLAN_A3.md`)

## 1. File Dự kiến Sửa / Tạo mới
- **Tạo mới**: `modules/pet-anim.js` (DUY NHẤT file này do A3 phụ trách, tự inject CSS).

## 2. Giải pháp Kỹ thuật

### 2.1. Nguyên tắc Sở hữu DOM
- **CHỈ** thao tác `style.transform` và `classList` trên `#catHop` (và class phụ trợ trên `#catScale` nếu cần).
- **TUYỆT ĐỐI KHÔNG** chạm vào `#catPos` (thuộc A2) hay `#catFlip` (thuộc A2).

### 2.2. Hoạt ảnh Gắn với Vận tốc Thực (Chống "Trượt trên mặt đất")
- Nhận trạng thái mỗi frame từ `ELW_PET_FOLLOW.subscribe(onFollowFrame)`:
  - **Đi bộ (`walk`)**:
    - Tần số bước tỉ lệ thuận với tốc độ thực `speed`: `stepPhase += (speed * 0.085) * dt`.
    - Độ nảy dọc: `hopY = -Math.abs(Math.sin(stepPhase)) * clamp(speed * 0.032, 1.5, 6.5)`.
    - Độ nghiêng nhịp bước: `tiltDeg = Math.sin(stepPhase) * clamp(speed * 0.018, 1.0, 3.8)`.
    - Độ co giãn nhẹ khi chạm đất: `squash = Math.cos(stepPhase * 2) * 0.025` → `scaleX = 1 - squash`, `scaleY = 1 + squash`.
  - **Chạy (`run` / hào hứng)**:
    - Nhịp nhanh hơn: `stepPhase += (speed * 0.105) * dt`.
    - Độ nảy cao hơn: `hopY = -Math.abs(Math.sin(stepPhase)) * clamp(speed * 0.042, 4.0, 10.5)`.
    - Nghiêng người về phía trước theo hướng chạy: `tiltDeg = (followState.dir * 4.5) + Math.sin(stepPhase) * 4.2`.
  - **Đà dừng (`stop`)**:
    - Khi vừa chuyển từ `walk`/`run` sang `stop` (trong ~220ms): nghiêng nhẹ về phía trước rồi đàn hồi về `0`, nhún nhẹ `scaleY = 0.94 -> 1.0`, `hopY = 0`.
  - **Chờ / Đứng yên (`idle` - không đứng bất động)**:
    - Nhịp thở liên tục: `breathePhase += 2.4 * dt` → `scaleY = 1 + Math.sin(breathePhase) * 0.028`, `scaleX = 1 - Math.sin(breathePhase) * 0.016`.
    - Vẫy đuôi giả / nghiêng người nhẹ: `tiltDeg = Math.sin(idleTime * 1.6) * 2.1 + Math.cos(idleTime * 0.7) * 1.1`.
    - Nhịp nhún sống động nhẹ: `hopY = Math.sin(idleTime * 2.1) * 1.35`.
    - Chu kỳ mỗi 2.8s thực hiện một nhịp "nghiêng đầu tò mò / nhấp nhổm" nhẹ để trong bất kỳ khoảng 5s idle nào, `transform` của `#catHop` luôn biến thiên rõ rệt.
  - **Mệt (`energy < 25`)**:
    - Khi đứng yên hoặc đi chậm: thân hơi sụp xuống (`hopY = +2.2`, `scaleY = 0.93 + Math.sin(breathePhase * 0.7) * 0.018`, `tiltDeg = Math.sin(idleTime * 0.9) * 1.2`), bước chân chậm và thấp.
  - **Cảm xúc đặc biệt (`play`, `love`, `like`, `curious`, `dislike`)**:
    - `love` / `play`: nhảy bật vui vẻ (`hopY` nảy lên `-12px`, lắc nhẹ).
    - `curious`: nghiêng đầu `tiltDeg = 8deg`.
    - `dislike`: lùi/rùng mình nhẹ (`tiltDeg` lắc nhanh `±5deg`).

### 2.3. Đồng bộ Ảnh State PNG (`#roomPetImg`)
- Kết hợp trạng thái chuyển động của A2 + Needs (`ELW_PET_NEEDS`) + Cảm xúc (`ELW_PET_PERSONALITY`):
  - Nếu `energy < 25`:
    - Đổi sang state `"tired"` (hoặc `"sleepy"` nếu `energy < 12` và đang `idle`).
  - Nếu đang di chuyển (`walk` hoặc `run`):
    - Nếu `energy < 25`: dùng `"tired"`.
    - Nếu `mode === "run"` hoặc `fun >= 82`: dùng `"excited"` hoặc `"walking_adventure"`.
    - Mặc định khi đi: dùng `"walking_adventure"`.
  - Khi dừng lại (`idle`):
    - Nếu đang có temporary emotion state từ hành động/phản ứng (`excited`, `playful`, `curious`, `eating`, `drinking`, `sad_lonely`): giữ state đó.
    - Ngược lại trả về state từ `ELW_PET_NEEDS.getVisualState()`.
- Cập nhật ảnh qua `ELW_PET_INTERACTION` / `#roomPetImg` với debounce hợp lý để không tải lại cùng một URL ảnh.

### 2.4. Tôn trọng `prefers-reduced-motion: reduce`
- Kiểm tra `window.matchMedia("(prefers-reduced-motion: reduce)").matches` hoặc `ELW_PET_INTERACTION.isReducedMotion()`.
- Nếu bật `reduced-motion`:
  - Đặt `#catHop.style.transform = "translate(0px, 0px) rotate(0deg) scale(1, 1)"` (tắt toàn bộ nhún/nghiêng).
  - **Vẫn đổi ảnh PNG state** (`tired`, `walking_adventure`, `excited`, `idle_happy`...) bình thường.

## 3. Phụ thuộc
- Đọc: `window.ELW_PET_FOLLOW`, `window.ELW_PET_NEEDS`, `window.ELW_PET_PERSONALITY`, `window.ELW_PET_INTERACTION`.
- Ghi DOM: `#catHop` (`style.transform`, `className`), `#roomPetImg` (`href`).

## 4. Cách Kiểm thử
- Kiểm tra khi pet đi/chạy: `hopY` và `tiltDeg` thay đổi theo `speed`, ảnh `#roomPetImg` chuyển sang `walking_adventure.png` (hoặc `excited.png` / `tired.png`).
- Khi `energy < 25`: ảnh `#roomPetImg` là `tired.png`, bước đi chậm hơn.
- Khi đứng yên 5s: đọc `#catHop.style.transform` ở 5 thời điểm cách nhau 1s → các giá trị khác nhau (có nhịp thở & nghiêng nhẹ).
- Khi bật `prefers-reduced-motion: reduce`: `#catHop.style.transform` giữ cố định không nhún, nhưng `#roomPetImg` vẫn đổi ảnh theo state.
