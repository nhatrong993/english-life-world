# PET 2.5D Companion Architecture (`docs/PET25D_ARCH.md`)

## 1. Mục tiêu & Nguyên tắc Thiết kế
Nâng cấp hệ thống Pet trong **English Life World** thành người bạn đồng hành 2.5D sống động:
- **Có cá tính & sở thích riêng (A1 - `modules/pet-personality.js`)**: 10 hồ sơ tính cách cho 10 pet (`milu`, `boba`, `cookie`, `mochi`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`), phản ứng theo hành động (`actionId`), phòng/khu vực (`room`), vật phẩm (`item`), và thời tiết (`weather`).
- **Đi theo nhân vật mượt mà trong không gian 2.5D (A2 - `modules/pet-follow.js`)**: Bám theo nhân vật ở khoảng cách 60–90px (deadzone 40–120px), tránh vật cản bằng `route()` & `OBST`, điều chỉnh tốc độ theo `energy`/`fun`, cập nhật chiều sâu (`charScale` & `data-base` z-order), lật hướng theo vận tốc, và nhường quyền khi nhân vật tương tác trực tiếp với pet (`catSpot`).
- **Hoạt ảnh & Cảm xúc gắn với vận tốc thực (A3 - `modules/pet-anim.js`)**: Nhún bước theo tốc độ thực (chống trượt chân), nghiêng người khi chạy, đà dừng nhẹ, thở/vẫy đuôi/nghiêng đầu khi đứng chờ (không bất động), đổi ảnh PNG theo trạng thái di chuyển + cảm xúc, tôn trọng `prefers-reduced-motion`.
- **Tích hợp không phá vỡ kiến trúc cũ (A4 - `index.html`, `modules/pet-interaction.js`, `tools/test_pet25d.mjs`)**: Tái sử dụng hoàn toàn `ELW_PET_NEEDS`, `ELW_PET_REWARDS`, `ELW_PET_ADVENTURE`, `ELW_PET_INTERACTION`, và slot SVG `#o-cat` trong `#world`.

---

## 2. Bản đồ Phụ thuộc & Thứ tự Nạp Script (`index.html`)

Thứ tự nạp script bắt buộc ở cuối `index.html` (và được `tools/build.py` tự động đóng gói):
1. `modules/pet-needs.js` (`window.ELW_PET_NEEDS` + `window.ELW_PET`) — *Giữ nguyên, không sửa*
2. `modules/pet-rewards.js` (`window.ELW_PET_REWARDS`) — *Giữ nguyên, không sửa*
3. `modules/pet-adventure.js` (`window.ELW_PET_ADVENTURE`) — *Giữ nguyên, không sửa*
4. `modules/pet-interaction.js` (`window.ELW_PET_INTERACTION`, `window.ELW_PET_UI`) — *A4 cập nhật `syncScenePet()` để tương thích với `ELW_PET_FOLLOW`*
5. `modules/pet-personality.js` (`window.ELW_PET_PERSONALITY`) — **Mới (A1)**
6. `modules/pet-follow.js` (`window.ELW_PET_FOLLOW`) — **Mới (A2)**
7. `modules/pet-anim.js` (`window.ELW_PET_ANIM`) — **Mới (A3)**
8. `modules/pet-survival.js` (`window.ELW_PET_SURVIVAL`) — *Giữ nguyên*

---

## 3. Ranh giới Sở hữu DOM (`#o-cat` trong `#world`)

Cấu trúc SVG của `#o-cat` trong `index.html`:
```xml
<g class="obj" id="o-cat" data-obj="cat" data-base="604">
  <g id="catPos" style="transform:translate(590px,600px)">
    <g class="vec">
      <rect class="hit" x="-52" y="-128" width="104" height="142"/>
      <g id="catScale">
        <ellipse cx="0" cy="-2" rx="34" ry="9" fill="#000" opacity=".18"/>
        <g id="catHop">
          <g id="catFlip">
            <image id="roomPetImg" ... />
          </g>
        </g>
        <g id="catHeart" opacity="0">...</g>
        <g id="catZzz" opacity="0">...</g>
      </g>
    </g>
  </g>
</g>
```

| Phần tử DOM | Module sở hữu | Thuộc tính được phép ghi | Cấm đụng |
|---|---|---|---|
| `#o-cat` | **A4 & A2** | `dataset.base` (z-order y), class `pet-follow-active`, `style.display` | Không gán `data-room="living"` (để hiển thị ở mọi room/zone) |
| `#catPos` | **A2 (`pet-follow.js`)** | `style.transform = translate(x, y)` mỗi frame rAF (khi `isControlling() === true`) | **A1, A3** cấm sửa `#catPos`; `applyLiving()` và `syncScenePet()` nhường quyền khi `ELW_PET_FOLLOW.isControlling()` |
| `#catScale` | **A2 (`pet-follow.js`)** | `style.transform = scale(depthScale)` theo `ELW_SCENE.charScale(y)` | **A3** không ghi đè `style.transform` trực tiếp lên `#catScale` (chỉ thao tác `#catHop` hoặc class trên `#catScale`) |
| `#catHop` | **A3 (`pet-anim.js`)** | `style.transform` (bobbing, tilt, hop, breathe, stop-lean) và class `pet25d-anim-*` | **A1, A2** không ghi `style.transform` lên `#catHop` (trừ khi legacy cat action chạy và A3 nhường) |
| `#catFlip` | **A2 (`pet-follow.js`)** | `style.transform = scaleX(dir)` (`dir` ∈ `{1, -1}`) | **A1, A3** không sửa `#catFlip` |
| `#roomPetImg` | **A3 & `ELW_PET_INTERACTION`** | Đổi ảnh state thông qua `ELW_PET_NEEDS.setTemporaryState()` / `ELW_PET_INTERACTION.syncScenePet()` hoặc cập nhật `href` theo state hợp lệ | Chỉ dùng 10 state chuẩn trong `assets/pets/<id>/<state>.png` |
| Bong bóng cảm xúc | **A1 (`pet-personality.js`)** | Tạo/cập nhật `<g id="petReactBubble">` bên trong `#catScale` (không bị ngược chữ khi `#catFlip` lật `scaleX(-1)`) hoặc qua `ELW_PET_ADVENTURE.showPetToast` | Không làm lệch hit-box hoặc chặn click |

---

## 4. Đặc tả API Dùng chung giữa A1 – A4

### 4.1. `window.ELW_SCENE` (Do A4 expose từ `index.html`)
Cung cấp truy cập an toàn vào trạng thái cảnh 2.5D:
```js
window.ELW_SCENE = {
  getW: () => W, // Trạng thái thế giới: { room, x, y, dir, walk, pose, catAt, catFollow, catMood, ... }
  getCharState: () => ({
    room: W.room || "living",
    x: Number(W.x) || 520,
    y: Number(W.y) || 495,
    dir: W.dir === -1 ? -1 : 1,
    walk: Boolean(W.walk),
    pose: W.pose || "stand",
    catAt: W.catAt || "rug",
    catFollow: Boolean(W.catFollow)
  }),
  route: (fromPt, toPt, roomId) => Array<{x, y}>, // Tìm đường tránh OBST (bao gồm TABLE_BOX, SOFA_BOX ở living và OBST[roomId] ở các phòng khác)
  getObstacles: (roomId) => Array<{x1, x2, y1, y2}>, // Danh sách hộp vật cản của phòng hiện tại
  inBox: (p, box, pad) => Boolean,
  crossesBox: (a, b, box) => Boolean,
  charScale: (y) => Number, // Hệ số scale theo chiều sâu y: 0.78 + ((y - 310) / 310) * 0.30
  sortDepth: () => void, // Sắp xếp lại thứ tự DOM trong #world theo dataset.base
  isCatInteractionActive: () => Boolean, // true khi nhân vật đang thực hiện hành động trực tiếp với pet (pet_cat, feed_cat, give_cat_water, play_with_cat, brush_cat, call_cat)
  getWeather: () => String // Thời tiết hiện tại (sunny, rainy, cold, warm, snowy...)
};
```

### 4.2. `window.ELW_PET_PERSONALITY` (Do A1 cung cấp trong `modules/pet-personality.js`)
```js
window.ELW_PET_PERSONALITY = {
  // Hồ sơ 10 pet
  PROFILES: { milu, boba, cookie, mochi, pepper, oreo, ember, lumi, pip, aqua },
  getProfile: (petId) => Object,

  // Hàm tính phản ứng chính (Pure evaluation hoặc kèm tùy chọn apply)
  react: (petId, context = { actionId, room, item, weather }, options = { apply: false }) => ({
    petId: String,
    mood: "love" | "like" | "neutral" | "dislike",
    funDelta: Number,          // love: +12..+18, like: +6..+10, neutral: 0..+2, dislike: -8..-4
    bondDelta: Number,         // love: +6..+10, like: +3..+5, neutral: 0..+1, dislike: -2..0
    rewardMultiplier: Number,  // love: 1.5, like: 1.25, neutral: 1.0, dislike: 1.0
    emotionState: String,      // 1 trong 10 state chuẩn: "excited" | "playful" | "curious" | "eating" | "drinking" | "idle_happy" | "sad_lonely" | "tired" | "sleepy"
    lineEn: String,            // Câu tiếng Anh ngắn đúng ngữ cảnh (vd: "Fresh salmon! Purr, my favorite!")
    lineVi: String,            // Nghĩa tiếng Việt ngắn gọn
    matchedTags: Array<String>
  }),

  // Xử lý sự kiện thế giới thực tế (áp dụng funDelta/bondDelta qua ELW_PET_NEEDS, hiển thị bong bóng, thưởng 1 lần qua ELW_PET_REWARDS)
  triggerWorldReaction: (context) => Object,
  showReactionBubble: (reaction, durationMs) => void,
  getLastReaction: () => Object | null,
  subscribe: (listener) => unsubscribeFn
};
```
**Cơ chế thưởng & chống farm (Anti-farm)**:
- Khi `mood` là `'love'` hoặc `'like'` (`rewardMultiplier > 1`), `ELW_PET_PERSONALITY` tính điểm thưởng cộng thêm cho lần đầu thực hiện hành động thông qua `ELW_PET_REWARDS.claimObjectiveReward("pet_react_bonus:" + petId + ":" + actionKey, bonusSpec)`.
- Vì `ELW_PET_REWARDS.claimObjectiveReward` kiểm tra ledger `claimedObjectives`, lần thứ 2 trở đi trả về `{ granted: false, duplicate: true }`, đảm bảo **không bao giờ farm được thưởng**.

### 4.3. `window.ELW_PET_FOLLOW` (Do A2 cung cấp trong `modules/pet-follow.js`)
```js
window.ELW_PET_FOLLOW = {
  state: {
    x: Number,
    y: Number,
    vx: Number,
    vy: Number,
    speed: Number,        // Tốc độ thực (px/s) trong frame hiện tại
    normalizedSpeed: Number, // 0..1.5 (tỉ lệ so với tốc độ đi chuẩn)
    dir: 1 | -1,          // Hướng nhìn của pet
    mode: "idle" | "walk" | "run" | "stop" | "yield", // Trạng thái chuyển động
    room: String,
    distToChar: Number,
    targetX: Number,
    targetY: Number,
    energyMode: "excited" | "normal" | "tired"
  },
  getPosition: () => ({ x: Number, y: Number, dir: Number }),
  setPosition: (x, y, dir) => void,
  syncOnRoomChange: (roomId, charX, charY, charDir) => void,
  isControlling: () => Boolean, // true khi pet-follow đang điều khiển #catPos, false khi nhường cho catSpot action
  setYield: (yielding, durationMs) => void,
  subscribe: (listener) => unsubscribeFn,
  start: () => void,
  stop: () => void,
  stepFrame: (dtSec) => void // Cho phép test hoặc rAF bước từng frame
};
```
**Quy tắc vật lý & 2.5D của A2**:
- **Vị trí mục tiêu (Target Offset)**: Đứng phía sau/cạnh nhân vật theo `W.dir`:
  - `targetX = clamp(W.x - W.dir * 72, 95, 905)`
  - `targetY = clamp(W.y + 10, 342, 608)` (đứng hơi lệch chiều sâu để nhìn tự nhiên).
  - Nếu `(targetX, targetY)` nằm trong vật cản (`OBST[W.room]`), tự động chọn điểm lân cận hợp lệ ngoài hộp vật cản.
- **Deadzone & Hysteresis**:
  - Khi đang đi (`walk`/`run`): dừng lại (`stop` → `idle`) khi khoảng cách tới target `<= 18px` (tức khoảng cách tới nhân vật nằm trong khoảng `55–90px`).
  - Khi đang đứng yên (`idle`): bắt đầu đi lại khi khoảng cách tới nhân vật `> 98px` hoặc `< 38px` hoặc khi nhân vật di chuyển xa khỏi vùng deadzone.
- **Tránh vật cản**: Kiểm tra đoạn thẳng `(petPos -> target)` bằng `ELW_SCENE.crossesBox` với mọi box trong `ELW_SCENE.getObstacles(W.room)` (bao gồm `TABLE_BOX` và `SOFA_BOX` ở `living`). Nếu vướng vật cản, gọi `ELW_SCENE.route(petPos, target, W.room)` để đi theo danh sách waypoints vòng qua vật cản.
- **Tốc độ theo Needs**:
  - Chuẩn nhân vật: `~175 px/s`.
  - Hào hứng (`fun >= 80 && energy >= 60`): `215–235 px/s` (chạy nhanh hơn nhân vật một chút rồi dừng chờ).
  - Bình thường: `175–190 px/s`.
  - Mệt (`energy < 25`): `105–120 px/s` (đi chậm tụt lại phía sau nhưng vẫn tới đích khi nhân vật dừng).
- **Chiều sâu & Z-Order**:
  - `depthScale = ELW_SCENE.charScale(petY) * 1.04` → gán cho `#catScale`.
  - `#o-cat.dataset.base = String(Math.round(petY + 4))` và gọi `ELW_SCENE.sortDepth()` khi `Math.abs(petY - lastSortedY) >= 3`.

### 4.4. `window.ELW_PET_ANIM` (Do A3 cung cấp trong `modules/pet-anim.js`)
```js
window.ELW_PET_ANIM = {
  getState: () => ({
    motionMode: "idle" | "walk" | "run" | "stop" | "play" | "curious" | "happy" | "tired",
    visualState: String,  // 1 trong 10 state PNG
    stepPhase: Number,
    hopY: Number,
    tiltDeg: Number,
    breatheScaleY: Number,
    reducedMotion: Boolean
  }),
  triggerEmotionAnim: (emotionType, durationMs) => void, // "love" | "like" | "dislike" | "curious" | "play"
  updateFrame: (followState, dtSec) => void,
   refreshVisualSprite: () => void
};
```
**Quy tắc hoạt ảnh của A3**:
- Chỉ thao tác trên `#catHop` (và class trên `#catScale` nếu cần), **tuyệt đối không đụng `#catPos`**.
- **Chống trượt chân (Velocity-coupled bobbing)**:
  - Khi `mode === "walk"` hoặc `"run"`, tần số bước `freq` và biên độ nhún `ampY` tỉ lệ thuận với `followState.speed`:
    - `phase += (speed / 28) * dtSec`
    - `hopY = -Math.abs(Math.sin(phase)) * clamp(speed / 26, 1.5, 9.5)`
    - `tiltDeg = Math.cos(phase) * clamp(speed / 45, 1.2, 6.5)` (khi chạy nhanh thêm độ nghiêng về phía trước).
  - Khi `speed === 0`, `hopY` về `0` mượt mà (không nhún khi đứng yên).
- **Đà dừng (`stop`)**: Khi chuyển từ `walk`/`run` sang `stop`, nghiêng nhẹ về phía trước (`tiltDeg` giảm dần về 0 trong 180ms) và nhún nhẹ `scaleY(0.95) -> 1`.
- **Idle sống động (`idle`)**: Khi đứng yên (và không bật `prefers-reduced-motion`), mỗi frame cập nhật nhịp thở nhẹ + nghiêng đầu/vẫy đuôi giả theo sóng sin chậm (`breatheScaleY = 1 + Math.sin(t * 2.2) * 0.025`, `idleTilt = Math.sin(t * 1.4) * 1.8`, thỉnh thoảng nhích nhẹ `hopY = Math.sin(t * 1.1) * 1.2`) để trong 5s đứng yên `transform` trên `#catHop` luôn biến thiên tự nhiên.
- **Đổi ảnh PNG (`#roomPetImg`)**:
  - Khi `energy < 25`: ưu tiên state `"tired"` (hoặc `"sleepy"` nếu `energy < 12` và đứng yên).
  - Khi đang di chuyển (`walk`/`run`): nếu hào hứng (`fun >= 85 && energy >= 60`) dùng `"excited"` hoặc `"walking_adventure"`, bình thường dùng `"walking_adventure"`, nếu mệt (`energy < 25`) dùng `"tired"`.
  - Khi đứng yên (`idle`): phản ánh cảm xúc vừa xảy ra (`emotionState` từ A1) hoặc `ELW_PET_NEEDS.getVisualState()`.
- **Accessibility (`prefers-reduced-motion: reduce`)**:
  - Khi `ELW_PET_INTERACTION.isReducedMotion()` là `true`: đặt `#catHop.style.transform = "translate(0px, 0px) rotate(0deg) scale(1, 1)"` (không nhún/nghiêng), nhưng **vẫn cập nhật ảnh PNG state** bình thường.

---

## 5. Ràng buộc Cấm sửa (Strict Constraints)
Các module sau **TUYỆT ĐỐI KHÔNG ĐƯỢC SỬA**:
- `modules/topic-*.js`
- `modules/mission.js`
- `modules/voices-dialogue.js`
- `modules/tts-*.js`
- `modules/pet-needs.js`
- `modules/pet-rewards.js`
- `modules/pet-adventure.js`
