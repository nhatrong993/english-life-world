# Kế hoạch Triển khai A2: 2.5D Movement & Follow Controller (`docs/PET25D_PLAN_A2.md`)

## 1. File Dự kiến Sửa / Tạo mới
- **Tạo mới**: `modules/pet-follow.js` (DUY NHẤT file này do A2 phụ trách).

## 2. Giải pháp Kỹ thuật

### 2.1. Vòng lặp `requestAnimationFrame` & Quản lý Tab ẩn
- Sử dụng `requestAnimationFrame(tick)` duy nhất, tính `dt = clamp((now - lastTime) / 1000, 0.004, 0.06)`.
- Lắng nghe `document.addEventListener("visibilitychange", ...)`: khi `document.hidden === true`, tạm dừng rAF; khi quay lại tab, reset `lastTime = performance.now()` và chạy tiếp để tránh bước nhảy `dt` lớn.
- Không dùng `setInterval` dài hạn.

### 2.2. Tính toán Mục tiêu Đứng sau Nhân vật & Deadzone
- Đọc trạng thái nhân vật mỗi frame từ `window.ELW_SCENE.getCharState()` (hoặc fallback `window.W`):
  - Vị trí mục tiêu lý tưởng phía sau/cạnh nhân vật:
    - `offsetX = -charDir * 72` (khoảng cách 60–90px phía sau hướng nhân vật đang nhìn).
    - `offsetY = +10` (đứng lệch nhẹ по trục Y để tạo chiều sâu 2.5D tự nhiên).
    - Giới hạn trong biên phòng: `x ∈ [90, 910]`, `y ∈ [342, 608]`.
  - Nếu điểm mục tiêu rơi vào trong hộp vật cản (`ELW_SCENE.inBox(pt, box, 10)`), tự động thử các góc lệch (`+72px` phía đối diện, `y + 24`, `y - 24`) để chọn điểm đứng hợp lệ ngoài vật cản.
- **Deadzone & Hysteresis**:
  - Khoảng cách từ pet tới nhân vật `distToChar = hypot(charX - petX, charY - petY)`.
  - Khoảng cách tới điểm mục tiêu `distToTarget = hypot(targetX - petX, targetY - petY)`.
  - Khi đang đứng yên (`mode === "idle"`): chỉ bắt đầu di chuyển khi `distToChar > 96` hoặc `distToChar < 38` (nếu đứng quá sát thì lùi nhẹ ra `65px`) hoặc `distToTarget > 34` khi nhân vật đang bước đi (`char.walk === true`).
  - Khi đang di chuyển (`walk` / `run`): dừng lại (`mode = "stop"` → `"idle"`) khi `distToTarget <= 14` và nhân vật đã dừng (`!char.walk`), giữ khoảng cách tới nhân vật luôn nằm trong `40–120px` (trung bình `~72px`).

### 2.3. Tránh Vật cản (`route()` & `OBST`)
- Khi cần di chuyển từ `petPos = {x, y}` tới `target = {x: targetX, y: targetY}`:
  - Kiểm tra danh sách vật cản `obstacles = ELW_SCENE.getObstacles(room)` (trong phòng `living` bao gồm `TABLE_BOX` `{350..670, 420..528}` và `SOFA_BOX` `{434..646, 330..400}`).
  - Nếu đoạn thẳng `(petPos, target)` cắt bất kỳ box nào (`ELW_SCENE.crossesBox`) hoặc `target` thay đổi lớn (> 22px): gọi `waypoints = ELW_SCENE.route(petPos, target, room)`.
  - Di chuyển tuần tự qua từng waypoint trong `waypoints`. Tại mỗi frame, kiểm tra thêm va chạm đẩy nhẹ (bounding box repulsion) để đảm bảo tọa độ `(petX, petY)` **không bao giờ nằm trong `TABLE_BOX` hay `SOFA_BOX`**.

### 2.4. Tốc độ theo Needs (`energy` / `fun`)
- Đọc `needs = ELW_PET_NEEDS.getNeeds()`:
  - **Mệt (`energy < 25`)**: `energyMode = "tired"`, tốc độ tối đa `baseSpeed = 112 px/s` (nhân vật đi `~175 px/s` nên pet tụt lại một chút rồi đi từ từ tới đích), `mode = "walk"`.
  - **Hào hứng (`fun >= 78 && energy >= 55`)**: `energyMode = "excited"`, tốc độ tối đa `baseSpeed = 230 px/s` (chạy nhanh hơn nhân vật một chút rồi dừng chờ khi vào deadzone), `mode = "run"` khi `speed > 185`.
  - **Bình thường**: `energyMode = "normal"`, tốc độ `baseSpeed = 182 px/s`, nếu khoảng cách xa (`distToTarget > 150`) tăng nhẹ lên `210 px/s` (`mode = "run"`), khi gần đích giảm tốc mượt mà (`mode = "walk"`).

### 2.5. Chiều sâu 2.5D, Z-Order & Lật hướng
- **Vị trí (`#catPos`)**: `catPosEl.style.transform = "translate(" + petX.toFixed(1) + "px," + petY.toFixed(1) + "px)"`.
- **Chiều sâu (`#catScale`)**: `scale = ELW_SCENE.charScale(petY) * 1.04` → `catScaleEl.style.transform = "scale(" + scale.toFixed(3) + ")"`.
- **Z-Order (`#o-cat.dataset.base`)**: Cập nhật `oCatEl.dataset.base = String(Math.round(petY + 4))` và gọi `ELW_SCENE.sortDepth()` để pet đi phía trước hoặc phía sau sofa/bàn/nhân vật chính xác theo trục Y.
- **Lật hướng (`#catFlip`)**:
  - Khi đang đi (`Math.abs(vx) > 6`): `dir = vx < 0 ? -1 : 1`.
  - Khi dừng cạnh nhân vật: hướng về phía nhân vật hoặc cùng hướng nhân vật.
  - Gán `catFlipEl.style.transform = "scaleX(" + dir + ")"`.

### 2.6. Chuyển Phòng/Zone & Nhường Điều khiển (`catSpot`)
- Khi phát hiện `room !== state.room` (hoặc qua `syncOnRoomChange`):
  - Đặt ngay vị trí pet cạnh nhân vật `(clamp(charX - charDir * 68, 95, 905), clamp(charY + 10, 345, 605))` (kiểm tra tránh `OBST[room]`), xóa waypoints cũ, đảm bảo `#o-cat` hiển thị (`style.display = ""`).
- Khi `ELW_SCENE.isCatInteractionActive()` là `true` (nhân vật đang chạy action `pet_cat`, `feed_cat`, `give_cat_water`, `play_with_cat`, `brush_cat`, `call_cat`):
  - `state.mode = "yield"`, `isControlling()` trả về `false` để nhường `#catPos` cho logic cũ. Ngay khi action kết thúc, đồng bộ lại `(x, y)` hiện tại từ `#catPos` và tiếp tục đi theo.

## 3. Phụ thuộc
- Đọc: `window.ELW_SCENE`, `window.ELW_PET_NEEDS`.
- Ghi DOM: `#o-cat` (`dataset.base`, class `pet-follow-active`), `#catPos` (`style.transform`), `#catScale` (`style.transform`), `#catFlip` (`style.transform`).
- Phát sự kiện mỗi frame cho A3 qua `ELW_PET_FOLLOW.subscribe(fn)`.

## 4. Cách Kiểm thử
- Cho nhân vật đi từ `(240, 520)` sang `(800, 480)` và ngược lại trong phòng `living`: kiểm tra pet bám theo ở khoảng cách `40–120px`, không có điểm `(x, y)` nào xuyên qua `TABLE_BOX` hay `SOFA_BOX`, `#catFlip` đổi dấu khi đổi chiều, `dataset.base` cập nhật theo `y`.
- Chuyển qua `kitchen`, `cafe_counter`, `market_produce`, `park`: pet xuất hiện ngay cạnh nhân vật và tiếp tục đi theo.
