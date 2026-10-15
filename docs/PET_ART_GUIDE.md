# 🎨 HƯỚNG DẪN MỸ THUẬT & THIẾT KẾ NHÂN VẬT: PET SYSTEM 2.0 (5 CẤP TRƯỞNG THÀNH)

> **Dự án:** English Life World (ELW) — Nâng cấp Hệ thống Thú cưng Đồng hành (Pet System 2.0)  
> **Phụ trách:** Agent B (Art & Character Direction) — Giai đoạn 1 (Khảo sát, Định hướng Mỹ thuật & Concept)  
> **Trạng thái tài liệu:** Bản thiết kế quy chuẩn & Kế hoạch Concept (Chưa sinh ảnh mới, không tự ý sửa code/asset)  
> **Đường dẫn tài liệu:** `docs/PET_ART_GUIDE.md`

---

## MỤC LỤC
1. [Báo cáo Khảo sát Asset & Renderer Hiện tại](#1-báo-cáo-khảo-sát-asset--renderer-hiện-tại)
2. [Định hướng Mỹ thuật 5 Giai đoạn Trưởng thành cho 10 Loài Pet](#2-định-hướng-mỹ-thuật-5-giai-đoạn-trưởng-thành-cho-10-loài-pet)
3. [Danh mục Asset Chuẩn (Stage × State × Hướng nhìn 2.5D)](#3-danh-mục-asset-chuẩn-stage--state--hướng-nhìn-25d)
4. [Quy tắc Đặt tên, Kích thước, Định dạng & Quản lý Phiên bản](#4-quy-tắc-đặt-tên-kích-thước-định-dạng--quản-lý-phiên-bản)
5. [Bài toán Dung lượng & Tích hợp `build.py` + Renderer](#5-bài-toán-dung-lượng--tích-hợp-buildpy--renderer)
6. [Kế hoạch Concept Mẫu: MILU (Đủ 5 Giai đoạn Trưởng thành)](#6-kế-hoạch-concept-mẫu-milu-đủ-5-giai-đoạn-trưởng-thành)

---

## 1. BÁO CÁO KHẢO SÁT ASSET & RENDERER HIỆN TẠI

### 1.1. Tổng quan Kho Asset Hiện tại (`assets/pets/manifest.json`)
Qua khảo sát trực tiếp `assets/pets/manifest.json` và script sinh asset `tools/generate_pet_assets.py`, hệ thống hiện có chính xác **100 file ảnh PNG** (10 loài pet × 10 trạng thái), tất cả đều đạt chuẩn:
- **Kích thước:** `320 × 320 px`, hệ màu `RGBA` (32-bit), nền trong suốt hoàn toàn (`transparent: true`, kiểm tra 4 góc `(0,0)`, `(319,0)`, `(0,319)`, `(319,319)` đều có `alpha == 0`).
- **Quy tắc hiển thị:** Không chứa bất kỳ chữ viết (`<text>`) nào bên trong hình ảnh.
- **Tổng dung lượng trên đĩa:** **4,461,541 bytes** (~**4.46 MB** / **4.25 MiB**).
- **Dung lượng trung bình mỗi ảnh:** **44,615.4 bytes** (~**43.57 KB**/ảnh).
  - File nhỏ nhất: `assets/pets/aqua/eating.png` (**35,200 bytes** ~ 34.4 KB).
  - File lớn nhất: `assets/pets/boba/walking_adventure.png` (**54,841 bytes** ~ 53.6 KB).

#### Bảng 1.1: Thống kê 10 Loài Pet Hiện có trong Codebase & Manifest
*(Lưu ý đồng bộ tên gọi: Trong codebase thực tế gồm `manifest.json`, `modules/pet-needs.js`, `modules/pet-ui.js`, `modules/pet-personality.js` và `modules/pet-interaction.js`, 3 pet hiếm cuối cùng có ID chuẩn là `lumi`, `pip`, `aqua`. Trong bản đề bài thiết kế ban đầu có nhắc tới tên concept `nimbus`, `sunny`, `pixel`. Bảng dưới đây ghi nhận chính xác dữ liệu thực tế trên đĩa và ánh xạ tên alias để toàn đội phát triển nắm rõ).*

| STT | `petId` (Chuẩn Code) | Tên Alias (Đề bài) | Tên hiển thị & Loài (`pet-needs.js`) | Nhóm (`category`) | Phân hạng (`tier`) | Số file PNG | Tổng dung lượng (Bytes / KB) | Đặc trưng ngoại hình hiện tại (`generate_pet_assets.py`) |
| :--: | :--- | :--- | :--- | :--: | :--: | :--: | :---: | :--- |
| 1 | **`milu`** | — | **Milu** — Cún Lông Xù Vàng *(Golden Fluffy Puppy)* | `dog` | **Miễn phí (Free)** | 10 | 487,022 B (475.6 KB) | Lông vàng kem xù mềm (Lhasa/Golden), tai dài cụp lượn sóng, ngực lông trắng kem, vòng cổ đỏ gắn sao vàng. |
| 2 | **`boba`** | — | **Boba** — Cún Corgi Hoàng Gia *(Royal Corgi Puppy)* | `dog` | Premium | 10 | 474,525 B (463.4 KB) | Corgi cam vàng & trắng, tai dựng lớn hồng phấn, đuôi cụt tròn, đội vương miện vàng đính ngọc đỏ/xanh, vòng cổ hồng. |
| 3 | **`cookie`** | — | **Cookie** — Cún Shiba Hay Cười *(Smiling Shiba Inu)* | `dog` | Premium | 10 | 449,325 B (438.8 KB) | Shiba đỏ vừng, má & ngực kem (urajiro), 2 chấm lông mày trắng tròn, đuôi cuộn tròn, khăn bandana xanh bạc hà chấm trắng. |
| 4 | **`mochi`** | — | **Mochi** — Mèo Trắng Mochi *(Snowy Mochi Kitten)* | `cat` | **Miễn phí (Free)** | 10 | 427,941 B (417.9 KB) | Mèo trắng kem mắt xanh sapphire, tai trong hồng phấn, đuôi phớt xám nâu, vòng cổ đỏ đeo lục lạc vàng. |
| 5 | **`pepper`** | — | **Pepper** — Mèo Anh Lông Ngắn *(British Shorthair)* | `cat` | Premium | 10 | 457,289 B (446.6 KB) | Mèo xám xanh (silver-blue) má phúng phính, mắt vàng hổ phách (amber), đeo nơ cổ xanh dương kẻ sọc. |
| 6 | **`oreo`** | — | **Oreo** — Mèo Nhị Thể Tuxedo *(Tuxedo Kitty)* | `cat` | Premium | 10 | 435,413 B (425.2 KB) | Mèo đen trắng lịch lãm như mặc vest, 4 bàn chân đi tất trắng, chóp đuôi trắng, vòng cổ xám gắn mặt trái tim bạc. |
| 7 | **`ember`** | — | **Ember** — Rồng Nhỏ Lửa Ấm *(Warm Flame Dragon)* | `rare` | Premium | 10 | 448,895 B (438.4 KB) | Rồng đỏ cam hồng ngọc, mắt xanh ngọc lục bảo, sừng vàng, cánh cam nhỏ, bụng giáp vàng, chóp đuôi cháy lửa ấm. |
| 8 | **`lumi`** | *`nimbus`* | **Lumi** — Kỳ Lân Cầu Vồng *(Rainbow Star Unicorn)* | `rare` | Premium | 10 | 425,494 B (415.5 KB) | Kỳ lân trắng ngọc trai, mắt tím ngân hà, sừng xoắn cầu vồng, bờm & đuôi 4 màu pastel, móng hồng, vòng cổ tím sao vàng. |
| 9 | **`pip`** | *`sunny`* | **Pip** — Cáo Tuyết Bắc Cực *(Arctic Snow Fox)* | `rare` | Premium | 10 | 440,086 B (429.8 KB) | Cáo trắng tuyết, mắt xanh băng, chóp tai & chóp đuôi bông xù chuyển màu xanh băng giá, quàng khăn len xanh biển. |
| 10 | **`aqua`** | *`pixel`* | **Aqua** — Rái Cá Biển *(Sea Pearl Otter)* | `rare` | Premium | 10 | 415,551 B (405.8 KB) | Rái cá nâu cacao, bụng & má kem sáng, tai tròn nhỏ hai bên, mắt nâu sẫm, trước ngực ôm vỏ sò hồng pastel. |

---

### 1.2. Khảo sát 10 Trạng thái (States) & Ánh xạ Hoạt ảnh Hiện tại
Hệ thống hiện đồng bộ nghiêm ngặt **10 state chuẩn** xuyên suốt `manifest.json`, `modules/pet-needs.js`, `modules/pet-anim.js`, `modules/pet-interaction.js` và `modules/pet-ui.js`:

#### Bảng 1.2: 10 State Hiện tại và Cơ chế Điều khiển trong Codebase

| STT | Mã State (`state`) | Nhãn Tiếng Việt | `animationType` (`manifest.json`) | CSS Animation (`pet-interaction.js`) | Tư thế & Đạo cụ SVG hiện có (`generate_pet_assets.py`) | Điều kiện kích hoạt tự động (`pet-anim.js` & `pet-needs.js`) |
| :--: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `idle_happy` | 😊 Vui vẻ | `breathe` | `breathe_bob` (`2.8s`) | Đứng/ngồi thẳng, miệng cười tươi, tim hồng & sao vàng lấp lánh. | Mặc định khi đứng yên và các chỉ số nhu cầu `>= 25`. |
| 2 | `curious` | 🧐 Tò mò | `head_tilt` | `curious_tilt` (`2.2s`) | Đầu nghiêng `+15°`, chân trái giơ nhẹ, miệng tròn ngạc nhiên, sao lấp lánh. | Khi tương tác `talk` (Nói chuyện) hoặc phản ứng ngữ cảnh `neutral`/`curious`. |
| 3 | `playful` | 🎾 Tinh nghịch | `play_bounce` | `play_bounce` (`1.05s`) | Thân nghiêng `-11°`, hai chân trước tung hứng quả bóng 4 màu. | Khi tương tác `play` (Chơi) hoặc phản ứng ngữ cảnh `like`. |
| 4 | `eating` | 🍖 Đang ăn ngon | `chew_happy` | `eat_nod` (`0.85s`) | Đầu cúi `+18px` trước bát đỏ đựng hạt thưởng và bánh quy xương vàng. | Khi tương tác `feed` (`transientState === "eating"` trong 4.5s). |
| 5 | `drinking` | 💧 Đang uống nước | `lap_water` | `drink_lap` (`0.95s`) | Đầu cúi `+20px`, lưỡi liếm nước trước bát xanh có gợn sóng & giọt nước. | Khi tương tác `water` (`transientState === "drinking"` trong 4.5s). |
| 6 | `sleepy` | 😪 Buồn ngủ | `sleep_breathe` | `sleep_float` (`3.4s`) | Nằm cuộn trên đệm bông hồng (`cushionGrad`), mắt nhắm có lông mi, trăng lưỡi liềm. | Khi tương tác `rest` hoặc khi đứng yên mà `energy < 12`. |
| 7 | `tired` | 😴 Hơi mệt | `slump_droop` | `tired_droop` (`3.0s`) | Mắt sụp mí 50%, tai cụp, thân hạ thấp, có giọt mồ hôi xanh & xoáy mệt mỏi. | Ưu tiên kích hoạt khi `energy < 25` (và `>= 12`, hoặc đang di chuyển khi mệt). |
| 8 | `sad_lonely` | 🥺 Mong gặp bé | `sad_shiver` | `sad_sway` (`2.9s`) | Mắt rưng rưng lệ xanh, mày chau, miệng mếu, đám mây mưa xám trên đầu. | Khi `hunger < 25` hoặc `thirst < 25` hoặc `fun < 25`, hoặc phản ứng `dislike`. |
| 9 | `excited` | 🤩 Hào hứng | `jump_joy` | `excited_jump` (`0.95s`) | Bật nhảy cao (`body_dy: -24`), hai chân giơ cao, mắt lấp lánh sao trắng, tim đôi. | Khi tương tác `pet` (Vuốt ve), phản ứng `love`, hoặc 550ms đầu khi bắt đầu `run` (`fun >= 70`). |
| 10 | `walking_adventure` | 🎒 Đi dạo khám phá | `walk_cycle` | `walk_trot` (`0.78s`) | Đeo ba lô thám hiểm cam-xanh trên lưng, chân bước sải, la bàn nhỏ góc phải, sỏi & lá. | Khi `mode === "walk"` hoặc `"run"` trong phòng, hoặc đang bật chế độ `walk` (Pet Adventure). |

---

### 1.3. Khảo sát Kiến trúc Render `#roomPetImg` trong `#o-cat` và Phân quyền DOM
Trong `index.html` (dòng 525–535), thú cưng trong phòng 2.5D được biểu diễn bởi phần tử SVG `<g class="obj" id="o-cat">`. Các module được phân tách biên giới DOM (Strict DOM Boundary) rất rõ ràng:

```
<g class="obj" id="o-cat" data-obj="cat" data-base="604" data-pet-id="milu" data-state="idle_happy">
 └── <g id="catPos" style="transform:translate(590px,600px)">         <-- [Agent A2: modules/pet-follow.js]
      └── <g class="vec">
           ├── <rect class="hit" x="-36" y="-50" width="72" height="56"/>
           └── <g id="catScale" style="transform:scale(1.150)">       <-- [Agent A2: modules/pet-follow.js]
                ├── <ellipse cx="0" cy="0" rx="24" ry="4.5" .../>     <-- Bóng đổ mặt sàn SVG
                └── <g id="catHop" style="transform:...">             <-- [Agent A3: modules/pet-anim.js]
                     └── <g id="catFlip" style="transform:scaleX(1)"> <-- [Agent A2: modules/pet-follow.js]
                          ├── <image id="roomPetImg"
                          │          class="pet-room-sprite pet-sprite-img"
                          │          href="assets/pets/milu/idle_happy.png"
                          │          src="assets/pets/milu/idle_happy.png"
                          │          x="-38" y="-68" width="76" height="76"
                          │          preserveAspectRatio="xMidYMid meet"/>
                          └── <g id="catBody" style="display:none">   <-- Vector mèo cam cũ (đã ẩn)
```

1. **`modules/pet-follow.js` (Điều khiển vị trí, hướng nhìn & phối cảnh xa gần):**
   - Sở hữu `#catPos`, `#catScale`, `#catFlip` và thuộc tính `data-base` trên `#o-cat`.
   - Tính toán đường đi tránh vật cản (Dijkstra qua `DEFAULT_OBSTACLES`), giữ khoảng cách `[54px .. 164px]` so với nhân vật chính.
   - Đặt `catPos.style.transform = translate(x, y)`.
   - Tính tỉ lệ phối cảnh theo chiều sâu Y: `computeScaleForY(y) = baseScale * 0.92` (trong đó `baseScale = 0.95 + ((y - 330) / 310) * 0.5`) và gán vào `#catScale`.
   - Khi đổi hướng di chuyển trái/phải (`state.dir` nhận giá trị `1` hoặc `-1`), gán `#catFlip.style.transform = scaleX(state.dir)`.
   - Cập nhật `oCat.dataset.base = String(Math.round(state.y + 2))` và gọi `ELW_SCENE.sortDepth()` để sắp xếp thứ tự che khuất 2.5D.

2. **`modules/pet-anim.js` (Điều khiển chuyển động thân & đồng bộ ảnh PNG theo frame):**
   - **Chỉ biến đổi** `#catHop` (`transform-origin: 50% 88%`) và cập nhật thuộc tính `src`/`href`/`xlink:href` trên `#roomPetImg` + `#o-cat`.
   - Nội suy chuyển động theo vận tốc thực tế (`speed` từ `pet-follow.js`):
     - Khi `walk`/`run`: Tính nhịp bước `stepPhase += freq * dtSec`, độ nảy `hopY = -Math.abs(Math.sin(stepPhase)) * ampY`, độ nghiêng thân `tiltDeg`, và hiệu ứng đàn hồi `squash` (`scaleX`, `scaleY`) để chống trượt chân trên sàn (anti-ground-sliding).
     - Khi vừa dừng lại (`STOP_MOMENTUM_MS = 220ms`): Tạo quán tính nhún nhẹ trước khi về `idle`.
     - Khi `idle`: Nhịp thở hữu cơ liên tục (`breathe = Math.sin(idleClock * 2.5) * 0.032`), nhân với hệ số `idleMotionMultiplier` của từng cá tính pet.
   - Gán `catHop.style.transform = translate(0px, hopY) rotate(tiltDeg) scale(scaleX, scaleY)` và các class cảm xúc (`elw-pet-emotion-love`, `elw-pet-tired`...) tạo hiệu ứng `drop-shadow` màu tương ứng.

3. **`modules/pet-interaction.js` & `modules/pet-ui.js` (Hiển thị trên UI Card, Mini HUD, QuickBar & Modal):**
   - Trong `#room`: Ép `#room #o-cat #roomPetImg` có `width: 76px !important; height: 76px !important;` với toạ độ neo `x="-38" y="-68"` (tức điểm gốc `(0,0)` của `#catPos` nằm ở `(X giữa, Y cách đáy ảnh 8px)` — trùng khớp với tâm bóng đổ `cy="292"` trên khung `320×320`).
   - Trên giao diện HTML (`#petSurvivalCard`, `#petSceneQuickBar`, `#petCollectionGrid`, `#petMiniHud`, `#petPremiumPreviewModal`), ảnh pet được bọc trong `.pet-sprite-wrap` dùng biến CSS `--pet-sprite-size` (từ `18px`, `36px`, `42px`, `52px`, `58px`, `78px` đến `92px`) kèm cơ chế tự động fallback về `idle_happy.png` rồi đến inline SVG vector (`buildSvgFallback`) nếu lỗi nạp file.

4. **`tools/build.py` (Đóng gói bản Single-File HTML):**
   - Quét thư mục `assets/pets/<pet_id>/<fn>.png` (hiện chỉ quét 1 cấp thư mục con), đọc byte nhị phân và mã hoá Base64 thành chuỗi `data:image/png;path=assets/pets/<pet_id>/<fn>;base64,...`.
   - Nhúng toàn bộ dictionary vào `window.ELW_PET_ASSETS` ngay đầu script đầu tiên của file `english-life-world-ban-day-du.html` (hiện nặng **9,649,714 bytes** ~ 9.65 MB).
   - Ghi đè setter của `HTMLImageElement.prototype.src`, `Element.prototype.setAttribute('src'|'href'|'xlink:href')` và `SVGImageElement.prototype.src` để tự động ánh xạ mọi đường dẫn tương đối `assets/pets/...` sang chuỗi Data URI đã nhúng.

---

## 2. ĐỊNH HƯỚNG MỸ THUẬT 5 GIAI ĐOẠN TRƯỞNG THÀNH CHO 10 LOÀI PET

### 2.1. Triết lý Thiết kế Tiến hoá Hình thái (Morphological Progression)
> [!IMPORTANT]
> **NGUYÊN TẮC CỐT LÕI: TUYỆT ĐỐI KHÔNG DÙNG CHIÊU PHÓNG TO (CSS SCALE) ĐƠN THUẦN!**  
> Mỗi giai đoạn trưởng thành (`Baby` → `Young` → `Teen` → `Adult` → `Elite/Bonded`) phải là một **bản thiết kế giải phẫu độc lập** thể hiện sự phát triển sinh học và thần thái của thú cưng, đồng thời tương thích với 5 mốc Level đã có trong `modules/pet-needs.js` (`LEVEL_THRESHOLDS` từ Lv.1 đến Lv.5).

#### Bảng 2.1: Quy chuẩn Tỉ lệ Cơ thể & Cấu trúc Thị giác qua 5 Cấp Trưởng thành

| Cấp độ | Mã Stage (`stage`) | Mốc Level & XP (`pet-needs.js`) | Danh hiệu hiện tại trong UI | Tỉ lệ Đầu : Thân (Head-to-Body Ratio) | Chiều cao chiếm khung `320×320` | Đặc điểm Hình khối, Tứ chi & Thần thái Chung |
| :--: | :--- | :--- | :--- | :--: | :--: | :--- |
| **Cấp 1** | **`baby`** | **Lv.1** (`0 XP`) | 🌱 Bạn Mới Đáng Yêu *(Little Sprout Buddy)* | **1 : 0.70** *(Đầu rất to, thân tròn nhỏ)* | **~52% – 56%** *(165–180px)* | **Chibi sơ sinh mũm mĩm:** Đầu to tròn trịa, má phúng phính, mắt to chiếm ~35% diện tích mặt (con ngươi lớn, highlight tròn to), tứ chi ngắn ngủn như cục bông, tai hơi cụp/mềm, đuôi ngắn. Chưa có hoặc chỉ có phụ kiện sơ sinh tối giản (dây ruy-băng mảnh). |
| **Cấp 2** | **`young`** | **Lv.2** (`100 XP`) | 🌿 Bạn Nhỏ Thân Thiết *(Curious Companion)* | **1 : 0.85** *(Đầu lớn vừa, thân bắt đầu dài ra)* | **~60% – 64%** *(192–205px)* | **Nhi đồng hiếu động:** Chân bắt đầu rõ khớp bàn chân và cổ chân, cổ lộ rõ hơn, chùm lông ngực/bờm/sừng nhú rõ. Tai vểnh linh hoạt hơn. Phụ kiện cơ bản (vòng cổ trơn hoặc khăn nhỏ). |
| **Cấp 3** | **`teen`** | **Lv.3** (`250 XP`) | 🌸 Đôi Bạn Ăn Ý *(Playful Explorer)* | **1 : 1.05** *(Đầu và thân cân đối năng động)* | **~68% – 72%** *(218–230px)* | **Thiếu niên tinh nghịch:** Dáng vóc thon gọn, nhanh nhẹn, ngực nở vừa phải, đuôi dài và cong uyển chuyển. Đôi mắt sáng tự tin, lông hai bên má/tai có thêm lớp tỉa layer rõ nét. Phụ kiện chuẩn có gắn thẻ tên/biểu tượng loài. |
| **Cấp 4** | **`adult`** | **Lv.4** (`450 XP`) | 🌟 Tri Kỷ Tỏa Sáng *(Shining Star Partner)* | **1 : 1.25** *(Tỉ lệ trưởng thành chuẩn mực)* | **~76% – 80%** *(243–256px)* | **Trưởng thành hoàn mỹ:** Thân hình vững chãi, bờm ngực/lông đuôi/cánh/sừng phát triển đầy đặn và quý phái. Đường nét gương mặt sắc sảo nhưng vẫn giữ nét thân thiện dễ thương của ELW. Phụ kiện nâng cấp có viền kim loại/hoa văn tinh xảo. |
| **Cấp 5** | **`elite`** *(Bonded)* | **Lv.5** (`700 XP`) | 👑 Huyền Thoại Gắn Bó *(Best Friend Forever)* | **1 : 1.30** *(Dáng uy nghi + Hào quang/Trang phục)* | **~82% – 86%** *(262–275px)* | **Tinh anh Gắn kết Tối thượng:** Thần thái rạng ngời, bộ lông/vảy có độ bóng chuyển sắc cao cấp (iridescent/golden sheen), khoác **Phụ kiện Tinh Anh (Elite Gear)** đặc trưng của từng loài và **Hiệu ứng Hào quang/Hạt (Bonded Aura & Particles)** xung quanh. |

---

### 2.2. Định hướng Mỹ thuật Chi tiết cho Từng Loài trong 10 Pet

#### 🐕 1. MILU — Cún Lông Xù Vàng (`milu` · Free Dog)
- **Đặc điểm nhận dạng cốt lõi (Giữ nhất quán xuyên suốt 5 cấp):**
  - **Silhouette:** Dáng cún Lhasa/Golden lông xù tròn đầy, hai tai dài cụp lượn sóng hai bên má, chỏm tóc ngố 2 lọn nhỏ trên đỉnh đầu.
  - **Bảng màu & Đốm lông:** Lông chính vàng kem ấm (`#fff8e3` → `#f6d596` → `#d59b52`), tai màu vàng mật ong đậm (`#f0c57e` → `#a36324`), mảng lông ngực và mõm màu trắng kem (`#ffffff` → `#fff1d2`), mắt nâu ấm (`#4b2810`).
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Cún con tròn xoe như cục bông gòn, tai ngắn mới chạm ngang má, chỉ có 1 chỏm lông tơ nhỏ trên đỉnh đầu, lông ngực chỉ là 1 đốm trắng tròn nhỏ, đeo dây chỉ đỏ mảnh chưa có mặt sao.
  - **`young` (Lv.2):** Tai dài chạm vai với 2 nếp lượn sóng, lông ngực tách thành 3 múi bông nhỏ, bắt đầu đeo vòng cổ đỏ có chấm tròn vàng.
  - **`teen` (Lv.3):** Dáng cún năng động (tương đương độ chi tiết của bản hiện tại nhưng chân thon khỏe hơn), tai dài phân tầng, lông ngực xù 5 múi rõ rệt, vòng cổ đỏ gắn ngôi sao vàng 5 cánh.
  - **`adult` (Lv.4):** Bộ lông vàng óng ả nhiều lớp, bờm ngực trắng kem dày như bờm sư tử nhỏ, đuôi bông lớn uốn cong kiêu hãnh, vòng cổ da đỏ viền chỉ vàng kèm huy hiệu ngôi sao chạm nổi.
  - **`elite` / `bonded` (Lv.5):** Khoác **Áo choàng Thủ lĩnh Học đường màu Đỏ Hoàng gia viền Vàng kim (Royal Scholar Mini-Cape)** đối xứng qua vai, vòng cổ phát sáng gắn **Huy hiệu Sao Kim Cương Đôi**, kèm hiệu ứng **hạt bụi sao vàng ấm & nốt nhạc/trái tim ánh kim** bay lơ lửng quanh thân.

#### 🐶 2. BOBA — Cún Corgi Hoàng Gia (`boba` · Premium Dog)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Đôi tai Corgi dựng đứng to bản, thân tròn mập, **chân ngắn đặc trưng**, **đuôi bánh mì tròn cụt (bobtail)** không bao giờ biến thành đuôi dài.
  - **Bảng màu & Đốm lông:** Lông cam vàng (`#ffc078` → `#f08c38` → `#c25f16`), vệt trắng sống mũi kéo xuống ngực và bụng (`#ffffff` → `#fdf4ea`), 4 bàn chân đi tất trắng, mắt nâu hạt dẻ (`#3d2210`).
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Tai to quá khổ so với đầu, tai trái hơi rủ nhẹ ở chóp, bụng tròn sát đất, chưa có vương miện mà chỉ có chiếc nơ nhỏ màu kem trà sữa trên đỉnh đầu.
  - **`young` (Lv.2):** Hai tai dựng thẳng cân đối, đeo vòng cổ hồng pastel gắn viên trân châu đen bóng, đội vương miện giấy nhỏ xinh.
  - **`teen` (Lv.3):** Thân Corgi săn chắc, mông tròn rõ nét, đội vương miện vàng mini đính 3 viên ngọc (đỏ, xanh), vòng cổ hồng gắn chuông vàng.
  - **`adult` (Lv.4):** Bộ lông ngực trắng dày phồng như kem cheese, vương miện vàng chạm khắc tinh xảo hơn, đeo yếm hoàng gia nhỏ viền vàng trước ngực.
  - **`elite` / `bonded` (Lv.5):** Đội **Vương miện Hoàng gia Toàn bích lơ lửng nhẹ trên đầu (Floating Royal Crown)**, khoác **Cổ áo Choàng Nhung Đỏ đính lông trắng chấm bi đen (Royal Ermine Collar)** đối xứng 2 bên vai, xung quanh toả **hào quang vương giả vàng hồng và những viên trân châu ánh kim lấp lánh**.

#### 🐕‍🦺 3. COOKIE — Cún Shiba Hay Cười (`cookie` · Premium Dog)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Tai tam giác nhọn hướng về phía trước, má phúng phính, đuôi cuộn tròn trên lưng (sickle/curled tail).
  - **Bảng màu & Đốm lông:** Lông đỏ vừng cam nướng (`#f5a053` → `#db6d27` → `#9e4311`), mảng lông trắng kem *Urajiro* đặc trưng ở hai bên má, ngực, bụng và mặt trong tai (`#fffdf9` → `#faebd7`), **2 chấm lông mày trắng tròn trên mắt**.
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Đầu tròn như chiếc bánh quy bơ, đuôi mới chỉ cong hình dấu hỏi nhỏ chưa cuộn kín vòng, quàng khăn yếm màu xanh mint nhạt trơn.
  - **`young` (Lv.2):** Đuôi bắt đầu cuộn 1 vòng tròn nhỏ, 2 chấm mày trắng rõ nét, khăn bandana xanh bạc hà có 1 chấm trắng ở giữa.
  - **`teen` (Lv.3):** Dáng Shiba lanh lợi, đuôi cuộn dày khỏe khoắn, khăn bandana xanh bạc hà (`#52b788`) điểm 3 chấm trắng chuẩn mực.
  - **`adult` (Lv.4):** Dáng đứng oai vệ, bộ lông đỏ cam dày mượt phân tách mảng Urajiro sắc nét, khăn bandana thêu viền vàng kèm huy hiệu chiếc bánh quy vàng ở chính giữa cổ.
  - **`elite` / `bonded` (Lv.5):** Khoác **Khăn choàng Phong cách Karakusa/Bánh Quy Vàng (Golden Artisan Bandana & Dual Shoulder Straps)** kèm túi thám hiểm đôi đối xứng hai bên hông, trên đỉnh đầu có **vòng nguyệt quế lá trà xanh nhỏ**, toả **hiệu ứng ánh nắng ấm áp và hoa anh đào/ngôi sao vàng giòn tan**.

#### 🐱 4. MOCHI — Mèo Trắng Mochi (`mochi` · Free Cat)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Dáng mèo nhỏ nhắn thanh thoát, đầu tròn mềm như bánh dày Mochi, tai tam giác vừa phải, đuôi dài mềm mại.
  - **Bảng màu & Đốm lông:** Lông trắng kem sữa (`#ffffff` → `#fff6ed` → `#e6d3c3`), lòng tai hồng phấn (`#ffafcc`), **đuôi chuyển màu xám nâu pastel (`#d8c9bf` → `#9c8d85`)**, đôi mắt xanh Sapphire trong vắt (`#154c99` → `#4ea3ff`).
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Tròn trịa như viên bánh Mochi dâu tây, tứ chi ngắn, đuôi ngắn mảnh, cổ thắt dây ruy-băng hồng nhạt nhỏ xíu.
  - **`young` (Lv.2):** Dáng mèo con thanh mảnh hơn, ria mép trắng rõ nét, đeo vòng cổ đỏ gắn lục lạc nhỏ.
  - **`teen` (Lv.3):** Đuôi dài uốn chữ S duyên dáng, mắt sapphire long lanh, vòng cổ đỏ tươi gắn lục lạc vàng chạm khắc rõ nét.
  - **`adult` (Lv.4):** Bộ lông trắng muốt có lớp lông tơ mềm ở má và ngực, đuôi bông dày phớt xám bạc, vòng cổ đỏ kết nơ lụa đối xứng phía dưới lục lạc vàng.
  - **`elite` / `bonded` (Lv.5):** Đeo **Vòng cổ Lụa Hồng Đào kết Nơ Đôi & Chuông Pha lê Xanh Sapphire phát sáng**, trên trán hiện **ấn ký bông hoa anh đào/ngôi sao băng nhỏ ánh ngọc trai**, xung quanh có **bong bóng ánh sáng hồng-lam và cánh hoa đào bay lượn**.

#### 🐈 5. PEPPER — Mèo Anh Lông Ngắn (`pepper` · Premium Cat)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Thân hình tròn trịa, **hai bầu má phúng phính cực đại (chubby jowls)**, tai nhỏ đầu tròn đặt cách xa nhau, đuôi dày đầu tròn.
  - **Bảng màu & Đốm lông:** Lông xám xanh bạc dày như nhung (`#c2ceda` → `#8b9aa9` → `#566371`), ngực và bọng ria mép sáng màu hơn (`#e3ebf2`), đôi mắt tròn xoe màu vàng hổ phách rực rỡ (`#b86b00` → `#ffc425`).
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Cục bông xám tròn lăn, tai bé xíu, mắt vàng to tròn ngơ ngác, chưa đeo nơ hoặc chỉ có cúc áo xanh nhỏ ở cổ.
  - **`young` (Lv.2):** Hai phúng má bắt đầu phồng rõ, đeo nơ cổ màu xanh dương trơn nhỏ nhắn.
  - **`teen` (Lv.3):** Dáng mèo Anh mũm mĩm chuẩn mực, đeo nơ xanh dương (`#3a86ff`) kẻ sọc xanh nhạt đối xứng hai bên.
  - **`adult` (Lv.4):** Má phúng phính quý tộc, ngực nở dày, đeo nơ cổ thám tử kẻ caro xanh-vàng kèm cổ áo sơ mi trắng nhỏ lịch lãm.
  - **`elite` / `bonded` (Lv.5):** Hóa thân thành **Thám tử Quý tộc Anh Quốc (Master Detective Gentleman)** với **Áo choàng ngắn Inverness đối xứng hai vai màu Xanh Navy viền Vàng**, nơ cổ đính ngọc Hổ phách trung tâm và **Mũ Beret/Deerstalker nhỏ cân đối giữa đỉnh đầu**, kèm **hiệu ứng kính lúp ánh sáng & ký hiệu ngôi sao tri thức vàng kim**.

#### 🐈‍⬛ 6. OREO — Mèo Nhị Thể Tuxedo (`oreo` · Premium Cat)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Dáng mèo lanh lợi, thanh lịch, tai cao vừa phải, đuôi dài vểnh cao.
  - **Bảng màu & Đốm lông:** Lông đen ánh than chì (`#4d525d` → `#282b33` → `#121418`), mảng trắng tinh khôi (`#ffffff`) tạo hình chữ V ngược từ sống mũi xuống má và **mảng ngực trắng như áo sơ mi mặc kèm vest đen**, **4 bàn chân đi tất trắng**, **chóp đuôi đốm trắng tròn**, mắt cam đồng (`#8f470b` → `#f08c2b`).
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Mèo con mặc "áo yếm trắng" ngắn, tất trắng ở chân cao tới gối, chóp đuôi trắng to tròn, cổ đeo dây xám mảnh.
  - **`young` (Lv.2):** Mảng lông đen-trắng phân ranh giới sắc nét như bộ suit nhỏ, vòng cổ xám gắn mặt chấm bạc.
  - **`teen` (Lv.3):** Dáng mèo Tuxedo lịch lãm, đeo vòng cổ xám đậm gắn mặt dây chuyền **Trái tim Bạc (`#e2e8f0`)**.
  - **`adult` (Lv.4):** Lông đen bóng mượt như lụa, ngực trắng nổi khối sang trọng, vòng cổ đính trái tim bạc viền pha lê sáng và nơ đen tuxedo.
  - **`elite` / `bonded` (Lv.5):** Khoác **Cổ áo Vest Hoàng gia Trắng-Đen đính Huy hiệu Trái tim Bạch kim phát sáng** và **Vương miện/Mũ Chóp nhỏ (Mini Top-Crown) đối xứng giữa đầu**, xung quanh toả **hiệu ứng nốt nhạc ánh bạc & bụi sao lấp lánh như vũ hội âm nhạc**.

#### 🐉 7. EMBER — Rồng Nhỏ Lửa Ấm (`ember` · Premium Rare)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Loài bò sát thần thoại có 2 sừng trên đầu, đôi cánh dơi/rồng nhỏ hai bên lưng, bụng có vảy ngang, đuôi vểnh có ngọn lửa cháy ở chóp.
  - **Bảng màu & Đốm lông/Vảy:** Vảy đỏ cam hồng ngọc (`#ff824f` → `#e53e24` → `#9b1b14`), giáp bụng và sừng màu vàng kim ấm (`#ffeb8f` → `#f7b733`), cánh màu cam hổ phách (`#ff9f1c`), 2 chấm vảy vàng trên trán, mắt xanh lục bảo (`#0c6b47` → `#36d995`).
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Rồng mới nở từ trứng, đầu to tròn, sừng mới chỉ là 2 nhú tròn nhỏ xíu trên trán, cánh bé bằng bàn tay cụp sát lưng, lửa ở đuôi chỉ là một đốm sáng cam nhỏ như ngọn nến.
  - **`young` (Lv.2):** Sừng nhú dài hơn, cánh mở nhẹ thấy rõ màng cánh, bụng có 2 vạch giáp vàng, ngọn lửa đuôi cháy ổn định 2 tầng màu (cam & vàng).
  - **`teen` (Lv.3):** Sừng cong khỏe khoắn, cánh vươn rộng hai bên, bụng 3 vạch giáp vàng rõ nét, ngọn lửa đuôi có tâm sáng trắng vàng (`#fff3b0`).
  - **`adult` (Lv.4):** Sừng rồng phân đốt oai phong, đôi cánh lớn hơn có gân cánh vàng kim, gai lưng nhỏ màu vàng chạy dọc cổ xuống đuôi, ngọn lửa đuôi bùng sáng mạnh mẽ.
  - **`elite` / `bonded` (Lv.5):** **Tiến hoá Rồng Lửa Mặt Trời (Solar Flame Elder Puppy-Dragon):** Sừng vàng kim rực sáng, đeo **Giáp ngực Tinh thể Hổ phách Đỏ-Vàng đối xứng**, đôi cánh viền ánh sáng vàng rực, ngọn lửa ở đuôi chuyển sang **Lửa Hoàng Kim 3 tầng** kèm **hiệu ứng đốm lửa ấm áp (warm embers) và vòng hào quang mặt trời** bay quanh.

#### 🦄 8. LUMI *(Alias đề bài: `nimbus`)* — Kỳ Lân Cầu Vồng (`lumi` · Premium Rare)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Dáng kỳ lân nhỏ thanh tú, **1 chiếc sừng xoắn ốc chính giữa trán**, bờm nhiều lọn trên đỉnh đầu và đuôi bồng bềnh như mây. *(Đồng thời đáp ứng trọn vẹn ý tưởng mây cầu vồng của alias `nimbus`).*
  - **Bảng màu & Đốm lông:** Lông trắng ánh tím ngọc trai (`#ffffff` → `#f8f2ff` → `#dfd1f0`), sừng chuyển sắc cầu vồng (`#fff59d` → `#ffafcc` → `#a2d2ff`), bờm & đuôi 4 màu pastel (hồng `#ffafcc`, vàng `#fff3b0`, xanh mint `#b9fbc0`, tím `#cdb4db`), 4 móng guốc hồng, mắt tím ngân hà (`#59288a` → `#b57cff`).
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Sừng trên trán ngắn tròn như búp măng nhỏ, bờm chỉ có 2 lọn mây nhỏ phớt hồng-vàng, đuôi ngắn tròn như cụm mây bông.
  - **`young` (Lv.2):** Sừng bắt đầu có 1 đường vân xoắn trắng, bờm 3 lọn màu pastel, đeo dây cổ tím nhạt.
  - **`teen` (Lv.3):** Sừng xoắn 2 vòng phát sáng nhẹ, bờm 4 lọn màu cầu vồng pastel, đuôi 3 tầng mây màu, vòng cổ tím gắn ngôi sao vàng.
  - **`adult` (Lv.4):** Sừng dài thanh thoát toả ánh cầu vồng, bờm và đuôi dài bồng bềnh uốn lượn như dải ngân hà, móng guốc ánh kim hồng-vàng.
  - **`elite` / `bonded` (Lv.5):** Khoác **Vòng cổ Pha lê Ánh Sao & Đôi Cánh Mây Ánh Sáng nhỏ hai bên vai (Celestial Nimbus Wings)** đối xứng tuyệt đối, sừng kỳ lân toả **vòng cầu vồng pastel và bụi kim tuyến sao băng** lấp lánh quanh cơ thể.

#### 🦊 9. PIP *(Alias đề bài: `sunny`)* — Cáo Tuyết Bắc Cực (`pip` · Premium Rare)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Khuôn mặt hình thoi bầu bĩnh hai bên má, đôi tai cáo tam giác lớn, **chiếc đuôi bông xù khổng lồ** lớn gần bằng cơ thể.
  - **Bảng màu & Đốm lông:** Lông trắng tuyết pha lam nhạt (`#ffffff` → `#eef8ff` → `#c9e4f8`), **chóp tai và chóp đuôi chuyển màu xanh băng giá (`#5bc0ff` → `#a8dfff`)**, bàn chân xanh băng nhạt (`#bde0fe`), mắt xanh băng (`#126199` → `#6cd4ff`). *(Nếu ánh xạ theo biến thể alias `sunny`, hệ thống có thể bật palette phụ vàng nắng ấm cho hiệu ứng hạt mà vẫn giữ nguyên cấu trúc vector của `pip`).*
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Cáo con tròn trịa, tai to nhưng hơi cụp ngang, đuôi tròn xù như quả cầu tuyết nhỏ có đốm xanh ở chóp, chưa quàng khăn.
  - **`young` (Lv.2):** Tai dựng cao với mảng xanh băng ở nửa trên tai, đuôi dài ra, cổ quấn khăn len xanh da trời ngắn gọn.
  - **`teen` (Lv.3):** Đuôi cáo xù to vểnh cao kiêu hãnh, quàng khăn len xanh biển (`#48cae4` / `#0096c7`) có vạt khăn kẻ sọc trắng.
  - **`adult` (Lv.4):** Bộ lông má và ngực xù dày chống lạnh, đuôi bông lớn có vân tuyết lấp lánh, khăn choàng dệt hoa văn bông tuyết tinh xảo.
  - **`elite` / `bonded` (Lv.5):** Khoác **Áo choàng Khăn Tuyết Bắc Cực đối xứng gắn Pha lê Băng Giá (Aurora Frost Cloak)** ở chính giữa ngực, trên đầu có **ấn ký Hoa Tuyết 6 cánh phát sáng**, xung quanh toả **hiệu ứng cực quang xanh-tím dịu mắt và những bông tuyết pha lê lơ lửng**.

#### 🦦 10. AQUA *(Alias đề bài: `pixel`)* — Rái Cá Biển (`aqua` · Premium Rare)
- **Đặc điểm nhận dạng cốt lõi:**
  - **Silhouette:** Đầu tròn dẹt ngang đáng yêu, **2 tai tròn nhỏ nằm thấp hai bên thái dương**, bọng má đôi phồng tròn có ria trắng ngắn, thân thuôn dài, đuôi dẹt khỏe khoắn, **hai tay luôn nâng niu vật báu trước ngực**.
  - **Bảng màu & Đốm lông:** Lông nâu cacao ấm (`#ad7959` → `#7c4e32` → `#4e2e1a`), bụng và hai bầu má màu kem sữa (`#fff8ec` → `#f3dec1`), mắt nâu sẫm (`#2b180c`), vỏ sò màu hồng san hô pastel (`#ffafcc`). *(Với alias `pixel`, có thể gắn thêm huy hiệu ngọc trai đa diện lấp lánh như khối tinh thể ở cấp Elite).*
- **Tiến hoá qua 5 giai đoạn:**
  - **`baby` (Lv.1):** Rái cá sơ sinh lông tơ nâu sáng, bụng tròn xoe, hai tay ôm một viên sỏi biển tròn nhỏ màu hồng nhạt trước ngực.
  - **`young` (Lv.2):** Bầu má kem phồng rõ cùng 2 sợi ria ngắn mỗi bên, bắt đầu ôm chiếc vỏ sò nhỏ màu hồng phấn.
  - **`teen` (Lv.3):** Thân hình săn chắc mượt mà, ôm chiếc vỏ sò hồng có vân gân rõ nét (`#ffafcc` viền `#b55d7a`) trước ngực.
  - **`adult` (Lv.4):** Bộ lông nâu cacao bóng mượt, đeo thêm vòng cổ kết từ những hạt ngọc trai trắng nhỏ, vỏ sò trước ngực hé mở để lộ ánh sáng ngọc trai.
  - **`elite` / `bonded` (Lv.5):** Khoác **Vòng cổ Hải Vương kết San hô & Ngọc trai phát sáng**, trước ngực ôm **Vỏ Sò Hoàng Kim mở ra Viên Ngọc Trai Đại Dương (Ocean Pearl Core) toả sáng lấp lánh**, xung quanh có **bong bóng nước trong suốt ánh cầu vồng và sao biển nhỏ** bay lượn.

---

## 3. DANH MỤC ASSET CHUẨN (STAGE × STATE × HƯỚNG NHÌN 2.5D)

### 3.1. Giải quyết Thông minh Bài toán: 10 Sprite States × 12 Biểu cảm/Tư thế Yêu cầu
Yêu cầu trải nghiệm người dùng cần thể hiện đầy đủ **12 biểu cảm/tư thế**:
1. **Vui** *(Happy)*
2. **Buồn** *(Sad/Lonely)*
3. **Tò mò** *(Curious)*
4. **Phấn khích** *(Excited)*
5. **Buồn ngủ** *(Sleepy)*
6. **Mệt** *(Tired)*
7. **Ăn** *(Eating)*
8. **Uống** *(Drinking)*
9. **Chơi** *(Playful)*
10. **Đi** *(Walking)*
11. **Chạy** *(Running)*
12. **Đứng chờ** *(Waiting/Standby)*

> [!TIP]
> **GIẢI PHÁP KIẾN TRÚC TỐI ƯU:**  
> Thay vì tạo 12 file PNG/stage (làm tăng thêm **+20% dung lượng** tương đương +100 file PNG mới và phá vỡ hằng số `CANONICAL_STATES.length === 10` đang được kiểm tra trong bộ test `tools/test_pet_system.py`), chúng ta **giữ nguyên 10 Sprite State chuẩn** và sử dụng **Procedural Transform + CSS Filter/Animation trong `modules/pet-anim.js`** để tách biệt rõ ràng **12 trạng thái thị giác** trên màn hình!

#### Bảng 3.1: Ma trận Ánh xạ 12 Biểu cảm/Tư thế sang 10 Sprite States + Procedural Engine

| STT | Tư thế / Biểu cảm Yêu cầu (12) | Sprite PNG Sử dụng (10 chuẩn) | Chế độ `mode` / `emotionType` trong `pet-anim.js` | Tham số Biến đổi Procedural (`#catHop`) & CSS Hiệu ứng để Phân biệt Rõ ràng |
| :--: | :--- | :--- | :--- | :--- |
| 1 | **Đứng chờ** *(Waiting / Standby)* | `idle_happy.png` | `mode = "idle"`, `emotionType = null` | **Nhịp thở tĩnh lặng ngóng đợi:** `hopY = sin(t*2.0)*1.2px`, `scaleY = 1 + sin(t*2.0)*0.025`, `tiltDeg = sin(t*1.2)*1.5°`. Không có `drop-shadow` màu. |
| 2 | **Vui** *(Happy)* | `idle_happy.png` *(hoặc `excited.png` khi vừa vuốt ve)* | `emotionType = "happy"` hoặc `fun >= 80` | **Nhịp nhún hân hoan:** Khi `emotionType="happy"`, `hopY = -abs(sin(t*11))*11px`, `tiltDeg = sin(t*11)*6°`, `squash = cos(t*22)*0.045` kèm hào quang hồng ấm `drop-shadow(0 6px 10px rgba(255,122,162,0.35))`. |
| 3 | **Buồn** *(Sad / Lonely)* | `sad_lonely.png` | `visualState = "sad_lonely"` (`hunger/thirst/fun < 25` hoặc `dislike`) | **Rung nhẹ tủi thân (`sad_sway`):** `tiltDeg = sin(t*18)*5.5°`, `hopY = +1px`, `scaleY = 0.97` (thân co lại, mắt có giọt lệ & mây mưa trong sprite). |
| 4 | **Tò mò** *(Curious)* | `curious.png` | `visualState = "curious"` (`talk` hoặc `emotionType = "curious"`) | **Nghiêng đầu lắng nghe (`curious_tilt`):** `tiltDeg = 8.5 * sin(t*4)°`, `hopY = -2px`, `scaleY = 1.02`, kèm hào quang xanh lam `rgba(96,182,255,0.3)`. |
| 5 | **Phấn khích** *(Excited)* | `excited.png` | `visualState = "excited"` (`pet` hoặc `emotionType = "love"`) | **Bật nhảy tung tăng (`excited_jump`):** Sprite nhảy cao rời mặt đất (`shadow_rx: 46` nhỏ lại), kết hợp `hopY` biên độ lớn `-11px` và squash-and-stretch mạnh. |
| 6 | **Buồn ngủ** *(Sleepy)* | `sleepy.png` | `visualState = "sleepy"` (`rest` hoặc `energy < 12` khi idle) | **Thở sâu trên đệm ngủ (`sleep_float`):** Chu kỳ chậm `3.4s`, `translateY(-2.5px)` nhẹ nhàng, mắt nhắm nghiền trên đệm bông. |
| 7 | **Mệt** *(Tired)* | `tired.png` | `visualState = "tired"` (`energy < 25`) | **Thân rũ xuống & lọc màu trầm:** `scaleY = 0.93`, `hopY = +2.0px`, `tiltDeg = -2.2°`, kèm CSS `#catHop.elw-pet-tired #roomPetImg { filter: saturate(0.88) brightness(0.96); }`. |
| 8 | **Ăn** *(Eating)* | `eating.png` | `transientState = "eating"` (`feed`) | **Gật đầu nhai (`eat_nod`):** Chu kỳ `0.85s`, `rotate(5deg) scale(1.03, 0.96)` nhịp nhàng trước bát thức ăn. |
| 9 | **Uống** *(Drinking)* | `drinking.png` | `transientState = "drinking"` (`water`) | **Nhấp nước (`drink_lap`):** Chu kỳ `0.95s`, `translateY(2.5px) scale(1.02, 0.97)` nhịp nhàng trước bát nước. |
| 10 | **Chơi** *(Playing)* | `playful.png` | `visualState = "playful"` (`play` hoặc `emotionType = "like"`) | **Nhào lộn bắt bóng (`play_bounce`):** Chu kỳ `1.05s` `cubic-bezier(0.34, 1.56, 0.64, 1)`, nghiêng trái/phải linh hoạt cùng quả bóng. |
| 11 | **Đi bộ** *(Walking)* | `walking_adventure.png` | `mode = "walk"` (`speed <= 215`) | **Bước đi khoan thai (`walk_trot`):** Tần số bước `freq = max(5.5, speed*0.062)`, độ nảy vừa phải `ampY <= 6.5px`, lắc thân đối xứng `tiltDeg = sin(stepPhase) * min(3.2°, speed*0.016)`. |
| 12 | **Chạy** *(Running)* | `excited.png` *(550ms đầu)* → `walking_adventure.png` | `mode = "run"` (`speed > 215`, đuổi theo nhân vật) | **Chồm người phi nước đại:** 550ms đầu bật `excited.png` tạo đà phóng, sau đó chuyển sang `walking_adventure.png` với tần số cao `freq = max(8, speed*0.075)`, độ nảy lớn `ampY <= 10.5px`, và **góc chúi người về phía trước** `tiltDeg = 4.5° + cos(stepPhase)*3.8°`. |

*(Ghi chú mở rộng: Nếu ở Giai đoạn 2 muốn vẽ riêng 1 sprite cho lúc chạy nước đại mà không dùng chung `walking_adventure.png`, có thể thêm state tùy chọn `running_sprint.png` chỉ cho cấp `Teen/Adult/Elite`, nhưng phương án kết hợp `walking_adventure.png` + góc nghiêng chồm tới `tiltDeg = 4.5°` trong `pet-anim.js` hiện tại đã cực kỳ mượt và tiết kiệm 100 file PNG).*

---

### 3.2. Quy tắc Hướng nhìn 2.5D & Đối xứng khi Lật ngang (`scaleX(-1)`)

1. **Góc nhìn Chuẩn (Camera Projection):**
   - Toàn bộ sprite pet được vẽ ở **góc nhìn 2.5D (Front-3/4 nhẹ — khoảng 10°–15° so với trục chính diện)**, đầu hơi hướng về phía người xem nhưng thân và bàn chân bước có chiều sâu trước-sau.
   - **Ưu điểm của góc 2.5D nhẹ:** Vừa hiển thị trọn vẹn biểu cảm đôi mắt/miệng khi làm Avatar trong `#petSurvivalCard` (78×78px) và `#petMiniHud` (18×18px), vừa đứng tự nhiên trên mặt sàn phối cảnh của `#room` (76×76px).

2. **Cơ chế Đổi hướng Trái/Phải trong `#o-cat`:**
   - Trong `modules/pet-follow.js` (dòng 514) và `index.html` (dòng 1190), hướng di chuyển ngang được quyết định bởi `#catFlip`:
     - Khi đi sang **Phải** (`state.dir = 1`): `#catFlip { transform: scaleX(1); }`
     - Khi đi sang **Trái** (`state.dir = -1`): `#catFlip { transform: scaleX(-1); }`

3. **Quy tắc Bắt buộc khi Thiết kế Phụ kiện để Lật ngang (`scaleX(-1)`) Không bị Lỗi:**
   - **Cấm tuyệt đối chữ viết/chữ số/ký tự bất đối xứng** (như chữ `E`, `L`, `W`, số `1..5`, dấu hỏi `?`) trên mũ, áo, vòng cổ hay hiệu ứng, vì khi `scaleX(-1)` chữ sẽ bị ngược gương. (Quy tắc này cũng đã được kiểm tra nghiêm ngặt bằng lệnh cấm `<text>` trong `generate_pet_assets.py`).
   - **Phụ kiện trên đầu và cổ (Vương miện của Boba, Sừng của Lumi, Nơ của Pepper, Khăn của Cookie, Áo choàng Elite):** Nên thiết kế **đối xứng qua trục dọc chính giữa** hoặc chỉ lệch nhẹ tự nhiên (như đuôi vẫy sang một bên, ba lô đeo sau lưng) để khi lật `scaleX(-1)`, chiếc ba lô luôn nằm đúng ở phía lưng (phía sau hướng bước đi) và đuôi luôn nằm phía sau thân!
   - **Quy ước hướng mặt khi `walking_adventure`:** Trong sprite gốc (`scaleX(1)`), thân và đầu pet nghiêng nhẹ về **bên Phải (`+X`)** (`body_dx: +6, head_dx: +8, body_rot: +7°`), chiếc ba lô đặt ở **bên Trái (`x = -44`)**. Nhờ vậy:
     - Khi đi sang phải (`dir = 1`, `scaleX(1)`): Pet hướng mặt sang phải, ba lô ở bên trái (phía sau lưng).
     - Khi đi sang trái (`dir = -1`, `scaleX(-1)`): Pet tự động quay mặt sang trái, ba lô lật sang bên phải (vẫn nằm đúng phía sau lưng!).

---

## 4. QUY TẮC ĐẶT TÊN, KÍCH THƯỚC, ĐỊNH DẠNG & QUẢN LÝ PHIÊN BẢN

### 4.1. Cấu trúc Thư mục Đa cấp & Cơ chế Tương thích Ngược (Backward-Compatible Fallback)

Để nâng cấp lên 5 cấp trưởng thành mà **không làm gãy bất kỳ module hay bài kiểm thử hiện tại nào**, cấu trúc thư mục được chuẩn hoá như sau:

```
assets/
└── pets/
    ├── manifest.json                         <-- Manifest mở rộng (v2.0)
    ├── milu/
    │   ├── idle_happy.png                    <-- [GIỮ NGUYÊN] Bộ 10 ảnh gốc làm Fallback mặc định
    │   ├── ... (9 state gốc khác)
    │   ├── baby/                             <-- Stage 1 (Lv.1: 0–99 XP)
    │   │   ├── idle_happy.png
    │   │   ├── curious.png
    │   │   ├── playful.png
    │   │   ├── eating.png
    │   │   ├── drinking.png
    │   │   ├── sleepy.png
    │   │   ├── tired.png
    │   │   ├── sad_lonely.png
    │   │   ├── excited.png
    │   │   └── walking_adventure.png
    │   ├── young/                            <-- Stage 2 (Lv.2: 100–249 XP)
    │   │   └── <10 state>.png
    │   ├── teen/                             <-- Stage 3 (Lv.3: 250–449 XP)
    │   │   └── <10 state>.png
    │   ├── adult/                            <-- Stage 4 (Lv.4: 450–699 XP)
    │   │   └── <10 state>.png
    │   └── elite/                            <-- Stage 5 (Lv.5: 700+ XP — Elite/Bonded)
    │       └── <10 state>.png
    ├── boba/
    │   └── ... (tương tự)
    └── ... (8 pet còn lại)
```

#### Bảng 4.1: Ánh xạ Level (`LEVEL_THRESHOLDS`) sang Mã Thư mục `stage`

| Level (`stats.level`) | Mốc XP tối thiểu | Mã `stage` (viết thường, dùng trong đường dẫn) | Tên Giai đoạn (Tiếng Việt / Tiếng Anh) |
| :--: | :--: | :--- | :--- |
| **Lv. 1** | `0 XP` | `baby` | Sơ sinh Đáng yêu *(Baby)* |
| **Lv. 2** | `100 XP` | `young` | Nhỏ nhắn Hiếu động *(Young)* |
| **Lv. 3** | `250 XP` | `teen` | Thiếu niên Năng động *(Teen)* |
| **Lv. 4** | `450 XP` | `adult` | Trưởng thành Tỏa sáng *(Adult)* |
| **Lv. 5** | `700 XP` | `elite` | Tinh anh Gắn kết *(Elite / Bonded)* |

#### Chuỗi Fallback 4 Tầng An toàn Tuyệt đối (Zero Broken Image Guarantee):
Khi hàm `getAssetPath(petId, state, stage)` được gọi (ví dụ `getAssetPath("milu", "playful", "adult")`), trình phân giải sẽ ưu tiên theo thứ tự:
1. **Tầng 1 (Stage + State chính xác):** `assets/pets/milu/adult/playful.png`
2. **Tầng 2 (Stage + Fallback `idle_happy`):** `assets/pets/milu/adult/idle_happy.png` *(nếu state phụ của stage đó chưa nạp kịp)*
3. **Tầng 3 (Legacy Root Path — Tương thích ngược 100%):** `assets/pets/milu/playful.png` → `assets/pets/milu/idle_happy.png` *(nếu pet đó chưa có thư mục con `<stage>/`)*
4. **Tầng 4 (Inline Vector Fallback):** `buildSvgFallback(petId, state)` trong `modules/pet-interaction.js`.

---

### 4.2. Schema Mở rộng cho `assets/pets/manifest.json` (v2.0)

Mỗi phần tử trong mảng `assets/pets/manifest.json` sẽ giữ nguyên các trường cũ để vượt qua toàn bộ bài test hiện hành (`petId`, `state`, `assetPath`, `format`, `width`, `height`, `fileSize`, `transparent`, `animationType`, `fallbackState`, `verified`) và **bổ sung thêm 5 trường mới** (`stage`, `stageLevel`, `version`, `scaleHint`, `anchorY`):

```json
[
  {
    "petId": "milu",
    "stage": "baby",
    "stageLevel": 1,
    "state": "idle_happy",
    "assetPath": "assets/pets/milu/baby/idle_happy.png",
    "legacyFallbackPath": "assets/pets/milu/idle_happy.png",
    "format": "png",
    "width": 320,
    "height": 320,
    "fileSize": 39820,
    "transparent": true,
    "animationType": "breathe",
    "fallbackState": "idle_happy",
    "scaleHint": 0.88,
    "anchorY": 0.88,
    "version": "2.0.0",
    "verified": true
  }
]
```

#### Giải thích các trường mở rộng trong Schema v2.0:
- **`stage`** (`"baby" | "young" | "teen" | "adult" | "elite"`): Định danh giai đoạn trưởng thành.
- **`stageLevel`** (`1..5`): Cấp độ số nguyên tương ứng với `stats.level` trong `modules/pet-needs.js`.
- **`legacyFallbackPath`** (`string`): Đường dẫn về ảnh gốc `assets/pets/<petId>/<state>.png` để đảm bảo tương thích ngược.
- **`scaleHint`** (`number`, mặc định `0.88` → `1.08`): Hệ số gợi ý cho renderer trong `#room` nếu muốn tinh chỉnh nhẹ kích thước khung bao ngoài bên cạnh sự thay đổi tỉ lệ cơ thể đã vẽ sẵn bên trong canvas `320×320`.
- **`anchorY`** (`number`, mặc định `0.88` tương ứng `282px / 320px`): Tọa độ trục Y của bàn chân/đáy bóng đổ để đồng bộ chính xác với `transform-origin: 50% 88%` của `#catHop` trong `modules/pet-anim.js`.
- **`version`** (`string`, `"2.0.0"`): Quản lý phiên bản asset phục vụ cache-busting và kiểm tra tính toàn vẹn.

---

### 4.3. Quy chuẩn Kỹ thuật Khung vẽ (Canvas & Alpha Channel Specs)

| Thông số Kỹ thuật | Quy chuẩn Bắt buộc | Lý do Kỹ thuật |
| :--- | :--- | :--- |
| **Kích thước Canvas** | **`320 × 320 px`** (Tỉ lệ 1:1) | Đồng bộ tuyệt đối với `#roomPetImg` (`76×76`), `#petHomeSpriteImg` (`78×78`), `#petPreviewStage` (`92×92`). |
| **Vùng An toàn (Safe Margin)** | Cách mép trên/trái/phải tối thiểu **`16px`**, cách mép dưới tối thiểu **`12px`** | Đảm bảo khi `pet-anim.js` xoay nghiêng hoặc khi vương miện/sừng/tai vươn cao không bao giờ bị cắt cụt (clipping) ở rìa ảnh. |
| **Đường chuẩn Mặt đất (Ground Baseline)** | Tâm bóng đổ đặt tại **`X = 160, Y = 290..295`** (tương đương **~90% chiều cao ảnh**) | Khớp với `#roomPetImg` đặt tại `x="-38" y="-68" width="76" height="76"` (đáy bàn chân chạm đúng tâm bóng đổ `<ellipse cx="0" cy="0">` của `#catScale`). |
| **Kênh Alpha (Transparency)** | **RGBA 32-bit** (hoặc Indexed PNG-8 có Alpha mượt / WebP Lossless Alpha), 4 pixel góc `(0,0)`, `(319,0)`, `(0,319)`, `(319,319)` bắt buộc **`alpha == 0`** | Được kiểm tra tự động bởi hàm `verify_single_png()` bằng thư viện `PIL.Image` trong script kiểm thử. |
| **Quy định Chữ viết** | **0% Text** (Không dùng `<text>`, không vẽ chữ cái hay con số) | Đảm bảo hiển thị đa ngôn ngữ sạch sẽ và không bị ngược chữ khi `#catFlip` áp dụng `scaleX(-1)`. |

---

## 5. BÀI TOÁN DUNG LƯỢNG & TÍCH HỢP `build.py` + RENDERER

### 5.1. Phân tích Toán học Dung lượng Thực tế (100 Ảnh vs. 500 Ảnh)

Dựa trên số liệu đo đạc chính xác từ dự án hiện tại:
- **Hiện tại (1 Stage — 100 ảnh PNG):**
  - Dung lượng gốc trên đĩa (`assets/pets/*/*.png`): **4,461,541 bytes (~4.46 MB)**.
  - Dung lượng khi `tools/build.py` mã hoá Base64 (`× 4/3` + tiền tố JSON key): **~5,980,000 bytes (~5.98 MB)**, chiếm **62%** tổng dung lượng của file `english-life-world-ban-day-du.html` (hiện nặng **9.65 MB**).
- **Khi mở rộng lên 5 Giai đoạn (10 pet × 5 stage × 10 state = 500 ảnh) nếu giữ nguyên cách làm cũ:**
  - Dung lượng gốc trên đĩa (500 file PNG chưa nén lượng tử): `4.46 MB × 5` ≈ **22.31 MB**.
  - Dung lượng Base64 nhúng thẳng vào `english-life-world-ban-day-du.html`: `5.98 MB × 5` ≈ **29.90 MB**.
  - Tổng dung lượng file HTML đơn sẽ phình lên **~33.6 MB**!
  - **Hệ lụy:** File HTML đơn >30 MB sẽ gây chậm thời gian khởi động (JS engine phải parse một object literal `window.ELW_PET_ASSETS` dài 30 triệu ký tự ngay ở `<script>` đầu tiên), tốn RAM trên trình duyệt điện thoại cấu hình thấp và khó chia sẻ qua Zalo/Email.

---

### 5.2. Bốn Giải pháp Kỹ thuật Khả thi & Đề xuất Lộ trình Triển khai

#### Bảng 5.1: So sánh Các Giải pháp Tối ưu Dung lượng cho 500 Assets

| Giải pháp | Mô tả Kỹ thuật | Dung lượng 500 ảnh trên đĩa | Dung lượng bản `build.py` (Single-file) | Độ khó triển khai | Đánh giá & Khuyến nghị |
| :--- | :--- | :---: | :---: | :--: | :--- |
| **GP 1: Lượng tử hóa PNG-8 (PNG Quantization) / Nén WebP** | Nén ảnh PNG RGBA bằng thuật toán lượng tử hóa bảng màu 256-color có alpha mượt (`Image.quantize(method=Image.FASTOCTREE)` trong Pillow hoặc `pngquant`), hoặc xuất song song WebP (`quality=85`). | **~7.5 MB – 9.0 MB** *(Giảm 60%)* | **~10.5 MB – 12.0 MB** *(Tổng file HTML ~14 MB)* | ⭐ Dễ | **BẮT BUỘC ÁP DỤNG NGAY.** Đồ họa hoạt hình vector 2.5D chuyển sắc mượt khi lượng tử hóa PNG hoặc nén WebP gần như không giảm chất lượng mắt thường nhưng giảm ngay 60% dung lượng. |
| **GP 2: Chia sẻ State Thông minh giữa các Stage liền kề (Tiered State Sharing)** | Vẽ đủ **10/10 state** cho 3 mốc đột phá lớn (`baby` Lv.1, `teen` Lv.3, `elite` Lv.5) và vẽ **4 state chủ đạo** (`idle_happy`, `excited`, `walking_adventure`, `sleepy`) riêng cho `young` (Lv.2) & `adult` (Lv.4), còn 6 state phụ hiếm gặp (`drinking`, `tired`...) dùng cơ chế kế thừa + biến đổi tỉ lệ nhẹ. | **~10.8 MB (raw)** / **~4.5 MB (nén)** *(380 ảnh độc lập)* | **~6.0 MB Base64** *(Bằng đúng dung lượng 100 ảnh hiện tại!)* | ⭐⭐ Trung bình | **RẤT KHUYẾN NGHỊ** nếu muốn giữ file `english-life-world-ban-day-du.html` dưới ngưỡng **10 MB** như hiện nay. |
| **GP 3: Lazy-Load theo Stage ở chế độ Multi-file & Tách gói Asset Pack** | Ở chế độ chạy `index.html`, trình duyệt chỉ tải các ảnh của `activePetId` ở `currentStage` hiện tại (~10 ảnh = 180 KB). Khi pet sắp lên cấp (XP đạt 85%), tự động `<link rel="prefetch">` stage kế tiếp. | Giữ nguyên trên đĩa | Chỉ nhúng sẵn **Core Pack** (Stage hiện tại / 2 Free Pets) vào file HTML chính, các stage cao nạp từ `elw-pet-stages-pack.js` hoặc nén Gzip/Deflate. | ⭐⭐ Trung bình | Tối ưu tuyệt đối tốc độ tải trang lần đầu (First Contentful Paint). |
| **GP 4: Procedural SVG-to-Canvas / Blob Cache cho Bản Single-File** | Vì toàn bộ 10 pet của ELW được dựng từ tập hàm SVG thông số hoá trong `generate_pet_assets.py` (~62 KB code), ở bản Single-File có thể nhúng bộ generator JS gọn nhẹ (~45 KB) để dựng Blob URL theo yêu cầu, trong khi trên đĩa vẫn xuất đủ 500 file PNG tĩnh. | Đủ 500 file PNG trên đĩa | **Chỉ ~60 KB!** *(Giảm 99% dung lượng file HTML đơn xuống còn ~3.8 MB)* | ⭐⭐⭐ Nâng cao | Giải pháp tối thượng cho bản đóng gói Single-File về lâu dài. |

---

### 5.3. Thiết kế Cập nhật cho `tools/build.py` và Renderer (Chuẩn bị cho Giai đoạn 2)

1. **Cập nhật vòng lặp quét thư mục trong `tools/build.py`:**
   - Hiện tại `tools/build.py` (dòng 12–22) chỉ dùng `os.listdir(pdir)` 1 cấp nên sẽ bỏ qua các thư mục con `baby/`, `young/`, `teen/`, `adult/`, `elite/`.
   - Ở Giai đoạn 2, chỉ cần nâng cấp lên `os.walk(pdir)` để tự động thu thập cả `assets/pets/<pet_id>/<state>.png` lẫn `assets/pets/<pet_id>/<stage>/<state>.png` (chuẩn hoá dấu `/` bằng `.replace("\\", "/")`).

2. **Cập nhật hàm `resolvePetAsset(srcPath)` và `applyVisualSprite` (`modules/pet-anim.js`, `modules/pet-needs.js`):**
   - Trong `modules/pet-needs.js`, hàm `computeLevelInfo(xp)` đã trả về `level` (`1..5`). Ánh xạ trực tiếp:
     ```javascript
     var STAGE_BY_LEVEL = { 1: "baby", 2: "young", 3: "teen", 4: "adult", 5: "elite" };
     ```
   - Hàm `getAssetPath(petId, state, stage)` sẽ trả về `"assets/pets/" + validPetId + "/" + validStage + "/" + validState + ".png"`.
   - Trong `window.resolvePetAsset(p)` (`tools/build.py`) và `handleSpriteError(imgEl)` (`modules/pet-interaction.js`), nếu đường dẫn có `<stage>` chưa tồn tại trong `window.ELW_PET_ASSETS` hoặc trên đĩa, tự động rút gọn `assets/pets/<petId>/<stage>/<state>.png` về `assets/pets/<petId>/<state>.png` để đảm bảo **không bao giờ lỗi ảnh trong quá trình chuyển giao từng phần**.

---

## 6. KẾ HOẠCH CONCEPT MẪU: MILU (ĐỦ 5 GIAI ĐOẠN TRƯỞNG THÀNH)

> [!NOTE]
> **LƯU Ý QUAN TRỌNG:**  
> Toàn bộ nội dung dưới đây là **Bản Thiết kế Kỹ thuật (Visual Brief), Thông số Giải phẫu SVG và Prompt Concept mẫu** cho thú cưng mặc định đầu tiên (**Milu — Cún Lông Xù Vàng**) qua đủ 5 giai đoạn trưởng thành (`baby`, `young`, `teen`, `adult`, `elite`).  
> Tài liệu này dùng để **Chủ ứng dụng (Product Owner) phê duyệt định hướng thẩm mỹ** trước khi chạy pipeline sinh 100–500 ảnh thật ở Giai đoạn 2. **Hiện tại CHƯA sinh ảnh mới và CHƯA sửa bất kỳ file asset nào.**

---

### 6.1. Bảng Thông số Giải phẫu & Thiết kế 5 Giai đoạn của Milu

| Thuộc tính Thiết kế | Stage 1: `baby` (Lv.1) | Stage 2: `young` (Lv.2) | Stage 3: `teen` (Lv.3) | Stage 4: `adult` (Lv.4) | Stage 5: `elite` (Lv.5 - Bonded) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tên gọi Giai đoạn** | 🌱 **Milu Sơ Sinh** *(Baby Sprout Milu)* | 🌿 **Milu Nhỏ Nhắn** *(Young Buddy Milu)* | 🌸 **Milu Năng Động** *(Teen Explorer Milu)* | 🌟 **Milu Trưởng Thành** *(Adult Shining Milu)* | 👑 **Milu Tinh Anh** *(Elite Bonded Milu)* |
| **Tỉ lệ Đầu : Thân** | **1 : 0.70** (Đầu rất to, thân ngắn mũm mĩm) | **1 : 0.85** (Đầu lớn vừa, thân bắt đầu cao) | **1 : 1.05** (Cân đối, khoẻ khoắn) | **1 : 1.25** (Trưởng thành, ngực nở đầy) | **1 : 1.30** (Oai vệ, kèm áo choàng & hào quang) |
| **Kích thước Đầu (`rx × ry`)** | Rộng `118px`, cao `96px`, má phúng phính tròn trịa | Rộng `114px`, cao `92px`, cằm rõ hơn | Rộng `112px`, cao `90px`, đường viền lông sắc nét | Rộng `110px`, cao `88px`, thêm 2 lọn lông má vểnh nhẹ | Rộng `110px`, cao `88px`, lông ánh vàng kim rực rỡ |
| **Kích thước Thân (`width × height`)** | Ngắn tròn (`84 × 66px`), bụng sữa phồng tròn | Vừa phải (`90 × 78px`), bắt đầu lộ eo nhẹ | Chuẩn mực (`92 × 92px`), dáng đứng vững | Cao ráo (`98 × 106px`), vai và ngực nở | Cao ráo (`100 × 110px`), tư thế ngực ưỡn tự hào |
| **Đôi mắt (`r` & Highlight)** | Cực to (`r = 15.5px`), con ngươi chiếm 80%, 2 đốm sáng tròn to ngây thơ | To (`r = 14.5px`), ánh nhìn tò mò lanh lợi | Chuẩn (`r = 14.0px`), ánh mắt vui tươi tự tin | Sắc nét (`r = 13.5px`), mi trên dày ấm áp | Rạng ngời (`r = 13.5px`), có thêm ánh sao vàng nhỏ trong con ngươi |
| **Đôi tai cụp (`ears_svg`)** | Ngắn mềm (`dài 48px`), đầu tai tròn bầu, mới chạm ngang má | Dài vừa (`dài 60px`), có 1 nếp lượn sóng nhẹ | Dài chuẩn (`dài 74px`), 2 tầng lông lượn sóng nâu vàng | Dài thướt tha (`dài 86px`), 3 tầng lông tỉa mượt mà | Dài quý phái (`dài 90px`), chóp tai ánh sắc mật ong vàng óng |
| **Chỏm tóc & Lông ngực** | 1 chỏm lông tơ tròn nhỏ trên đỉnh đầu; ngực có 1 đốm trắng tròn | 2 lọn tóc nhỏ; lông ngực trắng tách 3 múi mềm | 2 lọn tóc vểnh rõ; lông ngực trắng xù 5 múi (như bản gốc hiện tại) | 3 lọn tóc bồng bềnh; bờm ngực trắng kem dày 2 lớp như bờm sư tử nhỏ | 3 lọn tóc ánh kim; bờm ngực trắng kem lớn viền ánh sáng vàng dịu |
| **Đuôi (`tail_svg`)** | Đuôi ngắn cụt mũm mĩm (`dài 36px`), ngoắt nhẹ | Đuôi cong vừa (`dài 50px`), có 1 khía lông | Đuôi bông cong cao (`dài 64px`), 2 khía lông xù | Đuôi cờ (plume tail) lớn (`dài 78px`), uốn cong chữ S mềm mại | Đuôi bông hoàng kim lớn (`dài 84px`), toả hạt sáng ấm áp |
| **Phụ kiện & Hiệu ứng Đặc trưng** | **Dây ruy-băng đỏ mảnh** quanh cổ (chưa có mặt ngôi sao) | **Vòng cổ đỏ** gắn **chấm tròn đồng nhỏ** | **Vòng cổ đỏ chuẩn** gắn **Ngôi sao Vàng 5 cánh** | **Vòng cổ da đỏ viền vàng** + **Huy hiệu Ngôi sao Kép chạm nổi** | **Áo choàng Đỏ Hoàng gia viền Vàng đối xứng 2 vai** + **Vương miện Học giả nhỏ / Huy hiệu Sao Kim Cương** + **Hào quang Bụi Sao Vàng** |

---

### 6.2. Visual Brief & Prompt Concept Chi tiết cho Từng Giai đoạn của Milu

Dưới đây là đặc tả chi tiết (dùng được cho cả **AI Concept Art Generator** lẫn **Procedural SVG Builder** trong `tools/generate_pet_assets.py`) cho 5 giai đoạn của Milu ở trạng thái chuẩn `idle_happy`:

#### 🌱 Giai đoạn 1: `milu / baby` (Lv.1 — Sơ sinh Đáng yêu)
- **Visual Brief (Mô tả thị giác):**
  - Hình dáng tổng thể tròn xoe như một viên kẹo bông bơ sữa. Đầu lớn hơn thân rõ rệt, hai má phúng phính đẩy nhẹ lên dưới mắt.
  - Bốn bàn chân ngắn ngủn đặt gần nhau, đệm thịt hồng lộ nhẹ khi ngồi/nhún.
  - Đôi tai cụp còn ngắn, tròn đầu, phủ nhẹ hai bên thái dương. Trước ngực chỉ có một mảng lông tơ trắng hình trái tim ngược nhỏ nhắn, cổ thắt sợi dây ruy-băng đỏ mảnh mai.
- **Prompt Concept mẫu (Tiếng Anh chuẩn cho AI Art / SVG Reference):**
  > `2.5D stylized vector game sprite of "Milu" at Stage 1 (Baby Puppy), ultra-cute newborn golden-cream fluffy Lhasa/Golden puppy, oversized round head (1:0.7 head-to-body ratio), chubby cheeks, extra-large glossy warm brown eyes with big circular catchlights, tiny button nose, short rounded floppy honey-gold ears reaching only mid-cheek, single tiny tuft of hair on top of head, stubby little paws, small heart-shaped white cream chest fluff, wearing a simple thin red ribbon around neck (no medal yet), soft warm 3D gradient shading, clean dark brown outlines, centered on 320x320 transparent PNG background, ground shadow at Y=292, zero text.`

#### 🌿 Giai đoạn 2: `milu / young` (Lv.2 — Nhỏ nhắn Hiếu động)
- **Visual Brief (Mô tả thị giác):**
  - Cơ thể bắt đầu vươn cao hơn giai đoạn sơ sinh, phần cổ và bốn chân rõ dáng cún con 3–4 tháng tuổi.
  - Đôi tai dài xuống ngang cằm với 1 đường lượn sóng mềm mại. Chỏm tóc trên đỉnh đầu tách thành 2 lọn nhỏ tinh nghịch.
  - Lông ngực trắng kem mở rộng thành 3 múi bông. Cổ đeo vòng đỏ bản vừa có gắn một mặt huy chương tròn màu vàng đồng nhỏ.
- **Prompt Concept mẫu:**
  > `2.5D stylized vector game sprite of "Milu" at Stage 2 (Young Puppy), cheerful young golden-cream fluffy puppy, 1:0.85 head-to-body ratio, bright expressive brown eyes, medium wavy floppy honey-gold ears reaching jawline, two cute hair tufts on crown, 3-lobed white cream chest ruff, slightly longer legs with defined paws, medium fluffy curled tail, wearing a red collar with a small round gold charm, soft 3D vector gradients, 320x320 transparent PNG, ground shadow at Y=292, zero text.`

#### 🌸 Giai đoạn 3: `milu / teen` (Lv.3 — Thiếu niên Năng động)
- **Visual Brief (Mô tả thị giác):**
  - Tỉ lệ cân đối, khỏe khoắn và tràn đầy sức sống (đây là mốc kế thừa và tinh chỉnh trực tiếp từ bộ sprite Milu hiện tại để giữ sự quen thuộc 100%).
  - Đôi tai dài lượn sóng nhiều tầng màu vàng mật ong đậm. Bộ lông ngực trắng kem xù 5 múi rõ rệt.
  - Đeo vòng cổ đỏ nổi bật kèm **Ngôi sao Vàng 5 cánh** biểu tượng của English Life World.
- **Prompt Concept mẫu:**
  > `2.5D stylized vector game sprite of "Milu" at Stage 3 (Teen Companion), energetic golden-cream fluffy Lhasa/Golden dog, balanced 1:1.05 head-to-body ratio, lush multi-layered wavy honey-brown floppy ears, fluffy 5-pointed white-cream chest ruff, expressive warm brown eyes, joyful open-mouth smile with pink tongue, fluffy curled tail held high, wearing signature red collar with a bright 5-pointed gold star tag, rich 3D SVG gradient shading, 320x320 transparent PNG, ground shadow at Y=292, zero text.`

#### 🌟 Giai đoạn 4: `milu / adult` (Lv.4 — Trưởng thành Tỏa sáng)
- **Visual Brief (Mô tả thị giác):**
  - Dáng đứng đĩnh đạc, trưởng thành với lồng ngực nở rộng, bờm lông trắng kem trước ngực dày thành 2 lớp bồng bềnh sang trọng.
  - Hai bên gò má có thêm lọn lông vểnh nhẹ tạo nét trưởng thành ấm áp. Đuôi dài và xù bông như chiếc quạt lông vũ uốn cong mềm mại.
  - Vòng cổ đỏ được nâng cấp thêm đường viền vàng kim (gold trim) và mặt ngôi sao có thêm vòng nguyệt quế/viền kim loại sáng bóng.
- **Prompt Concept mẫu:**
  > `2.5D stylized vector game sprite of "Milu" at Stage 4 (Adult Shining Partner), noble and friendly adult golden-cream fluffy dog, 1:1.25 head-to-body ratio, fuller double-layered white-cream lion-like chest mane, long flowing feathered honey-gold ears, majestic plume tail, warm confident brown eyes, wearing an upgraded red collar with gold trim and an embossed double-star emblem, polished 3D vector shading, 320x320 transparent PNG, ground shadow at Y=292, zero text.`

#### 👑 Giai đoạn 5: `milu / elite` (Lv.5 — Tinh anh Gắn kết / Bonded Legend)
- **Visual Brief (Mô tả thị giác):**
  - Hình thái đỉnh cao khi người chơi và Milu đạt mốc gắn kết tối đa (Lv.5 — 700+ XP).
  - Giữ nguyên toàn bộ đường nét gương mặt và màu lông đặc trưng của Milu nhưng được phủ thêm ánh vàng kim ấm áp ở viền lông (golden rim light).
  - **Phụ kiện Tinh Anh đối xứng (Flip-safe 100%):** Khoác **Áo choàng Ngắn Hoàng gia màu Đỏ Nhung viền Vàng Kim (Royal Crimson & Gold Mini-Cape)** rủ đều hai bên vai, chính giữa ngực là **Huy hiệu Ngôi Sao Pha Lê Vàng phát sáng**, trên đỉnh đầu giữa 2 tai có **Vương miện/Mũ Học giả Nhỏ màu Vàng Kim**.
  - **Hiệu ứng Hào quang Gắn kết (Bonded Aura):** Xung quanh thân có vòng sáng vàng ấm dịu nhẹ và 4–6 hạt ngôi sao 4 cánh + trái tim ánh kim nhỏ bay lơ lửng.
- **Prompt Concept mẫu:**
  > `2.5D stylized vector game sprite of "Milu" at Stage 5 (Elite Bonded Legend), majestic golden-cream fluffy dog in ultimate bonded form, 1:1.30 head-to-body ratio, radiant golden-cream fur with warm rim lighting, lush white-cream royal chest mane, wearing a symmetrical Royal Crimson mini-cape with gold trim over shoulders, a glowing Golden Star Crystal emblem at center chest, and a tiny symmetrical golden crown-circlet on top of head, surrounded by soft floating golden star particles and warm heart sparkles, 100% horizontal-flip safe (no text or asymmetric letters), 320x320 transparent PNG, ground shadow at Y=292, zero text.`

---

### 6.3. Checklist Nghiệm thu Trước khi Chuyển sang Giai đoạn 2 (Sản xuất Hàng loạt)

Để đảm bảo quy trình sản xuất ở Giai đoạn 2 diễn ra trơn tru, Chủ ứng dụng sẽ duyệt Concept của **Milu (5 giai đoạn)** dựa trên 6 tiêu chí nghiệm thu sau:
- [ ] **Tiêu chí 1 (Nhận diện tức thì):** Nhìn lướt qua ở kích thước `52×52px` (Grid) và `76×76px` (`#roomPetImg`), người học phân biệt được ngay `baby` (đầu to tròn, chân ngắn) vs. `teen` (năng động) vs. `elite` (có áo choàng & hào quang sao vàng) mà không cần đọc nhãn chữ.
- [ ] **Tiêu chí 2 (Nhất quán nhân vật):** Màu lông vàng kem, tai cụp nâu mật ong, ngực trắng kem và đôi mắt nâu ấm của Milu được giữ xuyên suốt từ Lv.1 đến Lv.5.
- [ ] **Tiêu chí 3 (An toàn khi lật ngang 2.5D):** Khi `#catFlip` áp dụng `scaleX(-1)`, toàn bộ phụ kiện (vòng cổ, ngôi sao, áo choàng Elite, ba lô đi dạo) hiển thị tự nhiên, không bị ngược hình hay lệch tâm.
- [ ] **Tiêu chí 4 (Chuẩn điểm neo mặt đất):** Tâm bàn chân của cả 5 stage đều nằm trên đường chuẩn `Y = 290..295` của canvas `320×320`, không bị "bay lơ lửng" hay "chìm xuống sàn" khi `pet-anim.js` chạy hoạt ảnh nhún nhảy.
- [ ] **Tiêu chí 5 (Chuẩn kỹ thuật file):** `320×320px`, `RGBA`, 4 góc `alpha == 0`, không chứa thẻ `<text>`, dung lượng sau tối ưu đạt `~18 KB – 35 KB/file`.
- [ ] **Tiêu chí 6 (Tương thích ngược):** Giữ nguyên bộ file `assets/pets/<petId>/<state>.png` hiện tại làm fallback tầng 3 để toàn bộ test cũ (`tools/test_pet_system.py`, `tools/test_pet25d.mjs`) luôn xanh 100%.
