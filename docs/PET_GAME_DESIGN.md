# THIẾT KẾ KỸ THUẬT: HỆ THỐNG PET LIFE & PET ADVENTURE QUEST (PET GAME DESIGN)

> **Dự án:** English Life World (`D:\tools\Hoc tieng anh\english-life-world`)  
> **Phụ trách:** Agent A1 (Audit & Design)  
> **Phiên bản thiết kế:** 2.0 (Cozy Learning Companion & Unified Adventure Quest)

---

## 1. Triết lý Thiết kế Cốt lõi (Core Pillars)

1. **Cozy & Zero-Penalty (Ấm áp, Không Trừng phạt)**: Thú cưng là người bạn đồng hành khích lệ việc học tiếng Anh. Tuyệt đối **không phạt trừ sao (`pts`), không xóa chuỗi Streak, không làm mất Pet hay giảm XP** khi người học thoát ứng dụng, vắng mặt lâu ngày hoặc dừng nhiệm vụ giữa chừng.
2. **Timestamp-Driven State (Tính toán theo Mốc thời gian thực)**: Mọi sự thay đổi tự nhiên của các chỉ số nhu cầu (Needs) đều được tính toán thuần túy từ `lastUpdatedAt` (milliseconds timestamp), tuyệt đối không dùng `setInterval` để ghi đè/làm state dài hạn.
3. **Unified Companion Identity (Đồng nhất Thực thể Thú cưng)**: Thú cưng ở trong nhà, thú cưng trên bảng điều khiển và thú cưng đi dạo cùng nhân vật ngoài đời thực là **cùng một cá thể duy nhất** (`activePetId`), dùng chung một nguồn dữ liệu (`UnifiedPetState`).
4. **Honest Entitlement & Anti-Farm (Chống Cày thưởng & Bảo mật Premium trung thực)**: Mọi mục tiêu nhiệm vụ được ghi nhận vào `rewardLedger` để chỉ cộng thưởng đúng 1 lần; các thú cưng Premium không thể bị mở khóa trái phép qua `localStorage` hay DevTools.

---

## 2. Danh sách Chính thức 10 Thú cưng (10 Pets Roster)

> [!IMPORTANT]
> Hệ thống có **đúng 10 Pet** (không bao giờ là 12 Pet hay 3 Pet), chia làm 3 nhóm: **3 Chó, 3 Mèo, 4 Thú Hiếm**. Trong đó có **2 Pet Miễn phí (Free)** mở sẵn cho mọi người học và **8 Pet Cao cấp (Premium)** ở chế độ khóa/xem trước.

| STT | `petId` | Tên hiển thị | Nhóm | Phân loại | Mô tả ngoại hình & Tính cách | Câu chào tiếng Anh đặc trưng |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `milu` | **Milu** | Chó (Dog) | **Free** | Cún vàng lông mềm, tai cụp nhẹ, đeo khăn cổ ấm áp, trung thành và ham học hỏi. | *"Woof! Let's learn new English words together today!"* |
| 2 | `boba` | **Boba Corgi** | Chó (Dog) | **Premium** | Cún Corgi chân ngắn mũm mĩm màu trà sữa trân châu, vẫy đuôi liên tục. | *"Arf arf! My short legs are ready for a big adventure!"* |
| 3 | `cookie` | **Cookie Shiba** | Chó (Dog) | **Premium** | Cún Shiba Inu lông vàng nâu giòn như bánh quy, má phính hay cười. | *"Woof~ Did someone say crunchy treats and English practice?"* |
| 4 | `mochi` | **Mochi** | Mèo (Cat) | **Free** | Mèo trắng kem má hồng mềm mại như bánh Mochi, dịu dàng và thích nghe đọc bài. | *"Meow~ I love listening to your English pronunciation!"* |
| 5 | `pepper` | **Pepper British Shorthair** | Mèo (Cat) | **Premium** | Mèo Anh lông ngắn màu xám xanh (Blue-Gray), mắt tròn vàng đồng điềm tĩnh. | *"Purr... Let's take our time and master every sentence."* |
| 6 | `oreo` | **Oreo Tuxedo** | Mèo (Cat) | **Premium** | Mèo đen trắng khoác lễ phục Tuxedo lịch lãm, thông minh và tò mò. | *"Mew! I'm dressed up and ready to explore the town!"* |
| 7 | `ember` | **Ember Rồng nhỏ** | Hiếm (Rare) | **Premium** | Rồng lửa nhỏ màu cam đỏ ấm áp, chóp đuôi phát sáng dịu, truyền cảm hứng. | *"Roar-squeak! Your learning spark keeps my little flame bright!"* |
| 8 | `lumi` | **Lumi Kỳ lân** | Hiếm (Rare) | **Premium** | Kỳ lân nhỏ màu trắng ánh tím pastel, bờm sao lấp lánh, dịu hiền và mộng mơ. | *"Sparkle~ Every new phrase you speak is pure magic!"* |
| 9 | `pip` | **Pip Cáo tuyết** | Hiếm (Rare) | **Premium** | Cáo tuyết Bắc Cực lông trắng muốt pha xanh băng, tai lớn nhạy bén. | *"Yip yip! My ears catch every English sound you make!"* |
| 10 | `aqua` | **Aqua Rái cá** | Hiếm (Rare) | **Premium** | Rái cá nhỏ màu xanh ngọc biển, thích ôm vỏ sò và bơi lội vui nhộn. | *"Chirp-splash! Let's dive into a fun conversation!"* |

---

## 3. Hệ thống 5 Nhu cầu (5 Needs) & Cơ chế Timestamp Decay

### 3.1. Định nghĩa 5 Chỉ số Nhu cầu (`0–100`)

Mỗi thú cưng có 5 chỉ số được giới hạn trong khoảng `[0, 100]` (`clamp(val, 0, 100)`):

| Chỉ số | Tên tiếng Việt | Giá trị khởi tạo | Tốc độ giảm khi Online (Active) | Tốc độ giảm khi Offline | Sàn bảo vệ Offline (`Floor`) | Ý nghĩa Gameplay |
| :--- | :--- | :-: | :-: | :-: | :-: | :--- |
| `energy` | ⚡ Năng lượng | `85` | `-3` / giờ | `-2` / giờ | **`>= 25`** | Giảm khi chơi đùa (`play`) hoặc đi dạo (`walk`); hồi phục mạnh khi nghỉ ngơi (`rest`) hoặc ăn (`feed`). |
| `hunger` | 🍖 Độ no | `80` | `-6` / giờ | `-4` / giờ | **`>= 25`** | Giảm theo thời gian; hồi phục khi cho ăn (`feed`) hoặc hoàn thành nhiệm vụ phiêu lưu. |
| `thirst` | 💧 Độ khát | `82` | `-7` / giờ | `-4` / giờ | **`>= 25`** | Giảm nhanh hơn khi đi dạo ngoài trời nắng nóng; hồi phục khi cho uống nước (`water`). |
| `fun` | 🎾 Độ vui | `85` | `-5` / giờ | `-3` / giờ | **`>= 25`** | Hồi phục khi vuốt ve (`pet`), chơi đùa (`play`), nói chuyện (`talk`) và đi phiêu lưu (`walk`). |
| `bond` | 💖 Gắn kết | `20` | **`0` (Không giảm)** | **`0` (Không giảm)** | **Không bao giờ giảm** | Chỉ tăng lên khi người học chăm sóc, trò chuyện tiếng Anh và cùng Pet hoàn thành Adventure Quest. |

### 3.2. Thuật toán Tính toán theo Timestamp (`lastUpdatedAt`)

* **Tuyệt đối không dùng `setInterval` để trừ điểm trực tiếp vào dữ liệu lưu trữ dài hạn**.
* Mọi thời điểm cần đọc hoặc cập nhật trạng thái Pet, hàm thuần `computeNeedsAt(needs, lastUpdatedAt, nowMs)` được gọi:
  ```js
  const SAFE_FLOOR = 25;
  function applyTimeDecay(needs, lastUpdatedAt, nowMs) {
    const elapsedMs = Math.max(0, (nowMs || Date.now()) - (lastUpdatedAt || Date.now()));
    const elapsedHours = Math.min(elapsedMs / 3600000, 72); // Trần thời gian tính toán tối đa 72h
    return {
      energy: clampNeed(Math.max(Math.min(needs.energy, SAFE_FLOOR), Math.round(needs.energy - elapsedHours * 2.5))),
      hunger: clampNeed(Math.max(Math.min(needs.hunger, SAFE_FLOOR), Math.round(needs.hunger - elapsedHours * 4.0))),
      thirst: clampNeed(Math.max(Math.min(needs.thirst, SAFE_FLOOR), Math.round(needs.thirst - elapsedHours * 4.5))),
      fun:    clampNeed(Math.max(Math.min(needs.fun,    SAFE_FLOOR), Math.round(needs.fun    - elapsedHours * 3.5))),
      bond:   clampNeed(needs.bond) // Bond KHÔNG BAO GIỜ giảm khi offline hay theo thời gian
    };
  }
  ```
* **Quy tắc Sàn An toàn (`SAFE_FLOOR = 25`)**:
  * Khi suy giảm theo thời gian (`applyTimeDecay`), không chỉ số nào (`energy`, `hunger`, `thirst`, `fun`) bị giảm xuống dưới mức `25` (trừ khi trước đó nó đã thấp hơn `25`, lúc đó giữ nguyên không giảm thêm).
  * Nhờ vậy, dù học sinh nghỉ học vài ngày hay vài tuần mới mở lại ứng dụng, thú cưng vẫn ở trạng thái chờ đợi ấm áp (`curious` / `sleepy` / `sad_lonely` nhẹ ở ngưỡng 25), không bao giờ rơi vào trạng thái cạn kiệt `0%`.

### 3.3. Ánh xạ từ 5 Needs sang 10 Trạng thái Hiển thị (10 Visual States)

Hàm `resolvePetVisualState(petState)` xác định đúng 1 trong 10 state của Pet để hiển thị asset tương ứng:
1. `eating`: Đang trong hiệu ứng cho ăn (`transientState === "eating"`).
2. `drinking`: Đang trong hiệu ứng uống nước (`transientState === "drinking"`).
3. `sleepy`: Đang trong hiệu ứng nghỉ ngơi (`transientState === "sleepy"`) hoặc `energy <= 30`.
4. `playful`: Đang trong hiệu ứng chơi đùa (`transientState === "playful"`).
5. `excited`: Vừa hoàn thành mục tiêu, được vuốt ve/lên cấp (`transientState === "excited"`).
6. `walking_adventure`: Khi đang bật chế độ dẫn Pet đi chơi (`adventureSession.active === true` hoặc `context.withPet === true`).
7. `tired`: Khi `energy < 40` hoặc (`hunger < 30` và `thirst < 30`).
8. `sad_lonely`: Khi `fun <= 30` hoặc `hunger <= 28` hoặc `thirst <= 28`.
9. `curious`: Khi đang mở hộp thoại trò chuyện (`talk`) hoặc khi `fun` trong khoảng `[40, 69]`.
10. `idle_happy`: Trạng thái mặc định khi các chỉ số đều ổn định (`>= 40`).

---

## 4. Bảng Điều khiển Tương tác Thú cưng (8 Tương tác Chuẩn)

Khi người dùng bấm vào thú cưng trong phòng, bấm vào huy hiệu Pet trên thanh công cụ (`#petMiniHud`), hoặc xem thẻ Pet (`#petSurvivalCard`), **Pet Interaction Panel** cung cấp **đúng 8 tương tác**:

| STT | Mã Action | Nhãn hiển thị | Biểu tượng | Tác động lên 5 Needs & Inventory | Phản hồi Tiếng Anh & Trạng thái Hình ảnh |
| :-: | :--- | :--- | :-: | :--- | :--- |
| 1 | `pet` | **Vuốt ve** | 🤚 | `fun +8`, `bond +3`, `xp +5` | Phát câu khen ngợi (*"Good job! You're so cute!"*), chuyển state `excited` / `idle_happy` trong 3.5s. |
| 2 | `play` | **Chơi** | 🎾 | `fun +22`, `bond +5`, `energy -6`, `thirst -5`, `xp +10` (nếu có `toys > 0` thì dùng 1 bóng thưởng cộng thêm `fun +8`, nếu `toys == 0` vẫn chơi tự do bình thường!) | Phát câu rủ chơi (*"Let's play together!"*), chuyển state `playful` trong 4s. |
| 3 | `feed` | **Cho ăn** | 🍖 | `hunger +28`, `energy +10`, `bond +3`, `xp +8` (nếu có `treats > 0` thì tiêu 1 bánh thưởng đặc biệt; nếu `treats == 0` vẫn cho ăn khẩu phần cơ bản miễn phí để không bao giờ bị khóa nút). | Phát câu cho ăn (*"Here is some yummy food for you!"*), chuyển state `eating` trong 4s. |
| 4 | `water` | **Cho uống** | 💧 | `thirst +30`, `energy +6`, `bond +2`, `xp +6` (dùng bình nước `waterBottle` hoặc nước mát miễn phí). | Phát câu cho uống nước (*"Drink some fresh water, buddy!"*), chuyển state `drinking` trong 4s. |
| 5 | `rest` | **Nghỉ** | 💤 | `energy +32`, `fun +4`, `bond +2`, `xp +5` | Phát câu chúc nghỉ ngơi (*"Take a cozy nap and rest well!"*), chuyển state `sleepy` trong 4.5s. |
| 6 | `talk` | **Nói chuyện** | 💬 | `bond +4`, `fun +8`, `xp +8` | Mở hộp thoại giao tiếp song ngữ với Pet theo đúng ngữ cảnh phòng/thời tiết/nhu cầu hiện tại; chuyển state `curious`. |
| 7 | `walk` | **Dẫn đi chơi** | 🦮 | Bật/đồng bộ phiên `adventureSession`, `fun +10`, `bond +4` | Kích hoạt chế độ **Đi chơi cùng Pet (Adventure Quest)**, đồng bộ với thanh Ngữ cảnh `#ctxBar`, chuyển state `walking_adventure`. |
| 8 | `profile` | **Hồ sơ** | 📋 | Không tiêu hao chỉ số | Mở modal/drawer **Hồ sơ & Bộ sưu tập 10 Pet**: xem chi tiết cấp độ gắn kết, tính cách, và danh sách 2 Pet Free + 8 Pet Premium (Preview). |

---

## 5. Hệ thống Pet Adventure Quest Hợp nhất (Unified Adventure Session)

### 5.1. Hai Lối vào Đồng nhất — Một Phiên Duy nhất

Người học có thể bắt đầu hoặc quản lý chuyến đi chơi cùng Pet từ **2 lối vào**:
1. **Lối vào 1 (Từ Thanh Ngữ cảnh `#ctxBar`)**: Bấm nút **"🐕 Đi chơi cùng Pet"** (`#ctxBtnDog`).
2. **Lối vào 2 (Từ Thú cưng ở Nhà / Pet Interaction Panel)**: Bấm vào Pet trong cảnh 3D (`#o-cat` / `#pet-home-companion`) hoặc trong thẻ Pet rồi chọn hành động **"🦮 Dẫn đi chơi (`walk`)"**.

> [!IMPORTANT]
> Cả 2 lối vào đều gọi tới cùng một hàm điều phối `ELW_PET.toggleWalkAdventure(source)` và thao tác trên **cùng một đối tượng trạng thái hợp nhất (`UnifiedPetState`)**. Khi bật từ lối vào 1, nút ở lối vào 2 lập tức hiển thị đang đi dạo (và ngược lại). Khi đang dẫn Pet đi dạo ở nhà hoặc ngoài phố, hình ảnh Pet đi cạnh nhân vật (`#ctx-dog` / `#pet-companion-sprite`) hiển thị đúng loài Pet `activePetId` (ví dụ `milu` hoặc `mochi` với asset `walking_adventure`), không còn bị lệch giữa mèo `#o-cat` và chó `#ctx-dog`.

### 5.2. Cấu trúc Dữ liệu Hợp nhất (`UnifiedPetState`)

Lưu trữ tại key `elw_pet_v2` (có cơ chế migrate an toàn từ `elw_pet_v1`):

```json
{
  "version": 2,
  "activePetId": "milu",
  "lastUpdatedAt": 1760450000000,
  "xp": 40,
  "level": 1,
  "streak": 1,
  "needs": {
    "energy": 85,
    "hunger": 80,
    "thirst": 82,
    "fun": 85,
    "bond": 25
  },
  "inventory": {
    "treats": 3,
    "waterBottles": 3,
    "toys": 2,
    "careItems": 1
  },
  "context": {
    "withPet": false,
    "place": "home",
    "zone": "living",
    "weather": "sunny",
    "situation": "normal"
  },
  "adventureSession": {
    "active": false,
    "questId": "adv_park_picnic",
    "startedAt": 0,
    "currentStepIndex": 0,
    "completedSteps": [],
    "status": "idle"
  },
  "validator": {
    "lastCheckedAction": null,
    "lastVerifiedAt": 0
  },
  "dialogue": {
    "lastLineEn": "",
    "lastLineVi": "",
    "historyCount": 0
  },
  "rewardLedger": {
    "adv_park_picnic:step_1": { "claimedAt": 1760450100000, "pts": 10, "xp": 15 },
    "adv_park_picnic:complete": { "claimedAt": 1760450200000, "pts": 25, "xp": 40 }
  }
}
```

### 5.3. Danh sách Nhiệm vụ Phiêu lưu (Adventure Quests) & Validator

Mỗi chuyến **Pet Adventure Quest** kết hợp giữa:
- **Di chuyển ngữ cảnh** (ví dụ: từ Nhà ra Công viên, Quán Cà phê hoặc Siêu thị).
- **Chăm sóc nhu cầu thực tế của Pet** (ví dụ: trời nắng nóng `hot` khi đi bộ làm Pet khát nước -> cần bấm `water` cho Pet uống nước).
- **Thực hành giao tiếp tiếng Anh (`talk` / `context phrase`)** hoặc **tương tác đồ vật trên sân khấu (`WorldState`)**.

Mọi bước trong Adventure Quest đều được xác thực qua `validator`:
- Kiểm tra sự kiện thực tế (`actionId` từ `ELW_MISSION` / `WorldState` hoặc tương tác chăm sóc/hội thoại thực sự đã diễn ra).
- **Không có đồng hồ đếm ngược phạt điểm**: Người học có thể tạm dừng chuyến đi (`pause`/`stopWalk`) bất cứ lúc nào; tiến độ các bước đã xong vẫn được giữ nguyên và không bị trừ bất kỳ ngôi sao hay điểm streak nào.

---

## 6. Sổ cái Chống Farm Thưởng (Anti-Farm Reward Ledger)

Để ngăn chặn việc người chơi bấm lặp đi lặp lại một hành động hoặc tải lại trang (`F5` / `location.reload()`) để cộng dồn sao (`pts`), XP và vật phẩm vô hạn:

1. **Định danh Mục tiêu Duy nhất (`objectiveKey`)**:
   * Mỗi bước nhiệm vụ hoặc cột mốc thưởng có một khóa duy nhất:
     * Bước nhiệm vụ phiêu lưu: `quest:<questId>:step:<stepNo>`
     * Hoàn thành toàn bộ nhiệm vụ phiêu lưu: `quest:<questId>:complete`
     * Thưởng chăm sóc khởi đầu mỗi mốc cấp độ: `milestone:bond_lv:<level>`
2. **Quy trình Kiểm tra & Ghi nhận Bất biến (`claimObjectiveReward(objectiveKey, rewardSpec)`)**:
   ```js
   function claimObjectiveReward(objectiveKey, rewardSpec) {
     if (!objectiveKey) return { granted: false, reason: "invalid_key" };
     if (S.rewardLedger && S.rewardLedger[objectiveKey]) {
       return { granted: false, reason: "already_claimed", record: S.rewardLedger[objectiveKey] };
     }
     S.rewardLedger[objectiveKey] = {
       claimedAt: Date.now(),
       pts: rewardSpec.pts || 0,
       xp: rewardSpec.xp || 0,
       items: rewardSpec.items || null
     };
     if (rewardSpec.pts > 0) adjustPoints(rewardSpec.pts);
     if (rewardSpec.xp > 0) S.xp += rewardSpec.xp;
     if (rewardSpec.items) {
       for (const [k, v] of Object.entries(rewardSpec.items)) {
         S.inventory[k] = (S.inventory[k] || 0) + v;
       }
     }
     save();
     return { granted: true, record: S.rewardLedger[objectiveKey] };
   }
   ```
3. **Bảo toàn qua Reload**: `rewardLedger` được lưu bền vững trong `localStorage`. Sau khi reload trang, việc gọi lại hành động hoặc hoàn thành lại bước cũ sẽ trả về `{ granted: false, reason: "already_claimed" }`, số sao (`#pts`) và XP giữ nguyên tuyệt đối.

---

## 7. Kiến trúc Bảo mật Premium Trung thực (Honest Premium Entitlement)

### 7.1. Nguyên tắc Bảo mật Client-Side

Do ứng dụng hiện tại chạy hoàn toàn phía trình duyệt (Client-side Web App) và **chưa có máy chủ xác thực bản quyền (Backend Entitlement Server)**:
1. **Chặn hoàn toàn mở khóa qua `localStorage` hoặc biến State**:
   * Xóa bỏ hành vi dùng `localStorage.getItem("elw_pro_v1")` hoặc `ELW_PREMIUM.isPro()` để cấp quyền chọn 8 Pet Premium (`boba`, `cookie`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`).
   * Ngay cả khi người dùng tự gán `localStorage.setItem("elw_pro_v1", '{"pro":true}')`, sửa `elw_pet_v2` thành `"activePetId": "ember"`, hoặc gọi hàm qua Console, bộ kiểm tra `canSelectPet(petId)` vẫn chỉ cho phép `petId` thuộc danh sách `FREE_PETS = ["milu", "mochi"]`. Nếu phát hiện `activePetId` trong storage là Pet Premium khi chưa có token xác thực từ server, hệ thống tự động đưa `activePetId` về `"milu"`.
2. **Chế độ Xem trước Trung thực (Honest Preview Mode)**:
   * Trong bảng chọn Pet và Hồ sơ Pet (`profile`), cả 10 Pet đều hiển thị đầy đủ hình ảnh chuẩn (PNG RGBA), tên, loài, câu thoại mẫu và cho phép bấm **"👁️ Xem trước (Preview)"** để ngắm hoạt ảnh và nghe thử giọng của Pet.
   * Khi người dùng bấm chọn sử dụng một trong 8 Pet Premium, hệ thống hiển thị thông báo trung thực, rõ ràng:
     > 🔒 **Thú cưng Cao cấp (Chế độ Xem trước)**  
     > Nhân vật **[Tên Pet]** thuộc bộ sưu tập Premium. Hiện tại phiên bản học tập đang hoạt động ở chế độ Ngoại tuyến / Client-side (chưa kết nối máy chủ xác thực bản quyền), vì vậy tính năng thanh toán và mở khóa vĩnh viễn đang tạm khóa để đảm bảo tính minh bạch. Bạn có thể xem trước toàn bộ hình ảnh của bé hoặc đồng hành miễn phí cùng **Milu** và **Mochi** nhé!
   * **Không làm nút giả lập thanh toán (No Fake Checkout)** và **không làm nút bật PRO giả tạo cảm giác đã mua hàng**.
