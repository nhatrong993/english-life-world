# ĐỊNH HƯỚNG NGHỆ THUẬT & QUY CHUẨN ASSET — SÂN BAY 2.5D (ART DIRECTION)

> **Dự án:** English Life World — Bản Demo Sân Bay 2.5D Độc Lập (`airport-demo/`)
> **Phụ trách:** Agent P1-C (World Visual Direction, Asset Pipeline & Phase Planning)
> **Tài liệu liên quan:**
> - Yêu cầu gốc: [`docs/airport/AIRPORT_MASTER_PROMPT.md`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/airport/AIRPORT_MASTER_PROMPT.md)
> - Báo cáo lỗi lặp hành động: [`docs/airport/AUDIT_REPEAT_ACTION_BUG.md`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/airport/AUDIT_REPEAT_ACTION_BUG.md)
> - Moodboard tổng hợp: [`docs/airport/art-moodboard.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/airport/art-moodboard.png)

---

## 1. Xác Minh Nguồn Tham Khảo & Phân Tích Thị Giác 2 Ảnh Gốc

### 1.1. Trạng thái truy cập tài liệu tham khảo
1. **Link ArtStation trong Master Prompt (`https://dshiredoodles.artstation.com/projects/6b3Pe0`)**:
   - **Ghi nhận trung thực:** Khi truy cập tự động qua công cụ HTTP từ môi trường máy trạm, máy chủ ArtStation chặn bằng lớp bảo vệ Cloudflare Anti-Bot và trả về mã lỗi **`HTTP 403 Forbidden`**.
   - Do đó, không giả vờ đã đọc trang HTML của ArtStation; toàn bộ phân tích dưới đây được thực hiện bằng cách **mở và kiểm tra trực tiếp 2 bức ảnh render gốc độ phân giải cao (`1920×1080 px`)** của dự án *Mother 3 Tribute – Tazmilly Props* đã được lưu cục bộ trong kho mã nguồn:
     - Ảnh 1 (Ngoại cảnh quảng trường): [`docs/ref/airport/ref-town-square.jpg`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/ref/airport/ref-town-square.jpg)
     - Ảnh 2 (Nội thất cabin cắt lớp): [`docs/ref/airport/ref-cabin-interior.jpg`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/ref/airport/ref-cabin-interior.jpg)

---

### 1.2. Phân tích chi tiết 2 ảnh tham khảo (`ref-town-square.jpg` & `ref-cabin-interior.jpg`)

| Tiêu chí phân tích | Quan sát từ `ref-town-square.jpg` (Ngoại cảnh Quảng trường) | Quan sát từ `ref-cabin-interior.jpg` (Nội thất Cabin gỗ) | Quy tắc rút ra cho Sân bay 2.5D |
|---|---|---|---|
| **1. Góc Camera (Camera Projection & Pitch)** | Góc nhìn **High-Angle Oblique 2.5D chúc xuống ~`38°–40°`** (tương tự *The Legend of Zelda: Link's Awakening Switch*). Trục ngang song song mặt phẳng màn hình, hai tòa nhà tiền cảnh (*Thomas' Bazaar* bên trái, *YADO* bên phải) đóng vai trò khung viền tiền cảnh (foreground framing), mở ra quảng trường tròn ở trung cảnh và dãy nhà gỗ Tudor + cổng vòm nhìn xuyên ra thảm cỏ xanh ở hậu cảnh. | Góc nhìn **Cutaway Diorama chúc xuống ~`40°–42°`**. Tường trước và trần nhà được cắt bỏ hoàn toàn, lộ rõ **mặt cắt sàn gỗ dày có vát cạnh (beveled stage edge)** và phần bục bát giác nhô ra ở tiền cảnh. Tường hậu và tường trái tạo cảm giác không gian hộp 3D ấm cúng mà không che khuất tầm nhìn. | Cố định góc camera **Oblique 2.5D `38°`** cho toàn bộ Open Map sân bay. Dùng mặt cắt sàn vát cạnh ở rìa dưới bản đồ và vách kính lớn ở tường hậu nhìn xuyên ra đường băng + máy bay để tạo 4 lớp chiều sâu (Tiền cảnh → Trung cảnh đi lại → Tường hậu kính → Ngoại cảnh sân đỗ). |
| **2. Tỉ lệ Nhân vật Chibi (`~2.0–2.5 đầu`)** | Đám đông 13 nhân vật + 1 chú khỉ nhỏ tụ tập quanh nhân vật mặc áo choàng trắng đứng trên bục giếng giữa quảng trường. Chiều cao toàn thân đạt **~`2.1–2.3 đầu`** (đầu tròn to chiếm ~`45%` chiều cao, thân hình trụ/hạt đậu ngắn ~`30%`, chân ngắn mập ~`25%`). | Nhân vật cao bồi (Flint) đứng ở tiền cảnh trái, cao đúng **~`2.2 đầu`**. Tay chân hình ống tròn mềm mại, bàn tay dạng nắm tròn (mitten hand) đang chạm vành mũ rất rõ cử chỉ dù tay ngắn. | Chuẩn hóa nhân vật chính và NPC ở tỉ lệ **`2.2 đầu` (`160×200 px` khung sprite)**, Pet ở tỉ lệ **`1.8 đầu` (`96×96 px`)**. Silhouette phải nhận diện ngay nhờ kiểu tóc/mũ (mũ phi công, mũ lưỡi trai, tai nghe, khăn quàng) và mảng màu áo rõ ràng. |
| **3. Bảng màu Ấm / Pastel & Độ tương phản** | Tông nắng ấm chủ đạo: tường vữa kem vàng (`#F3E5AB`), mái ngói vàng tươi (`#FFEE4A`), mái ngói đỏ đất nung (`#C85A32`), mái hiên tím pastel (`#D9A7EB`), chữ bảng hiệu xanh ngọc (`#59BBA6`). Đá lát quảng trường dùng màu **xanh lam phấn dịu (`#D6ECF3` / `#BCE0EE`)** để làm nổi bật hoàn toàn các nhân vật mặc đồ màu ấm đứng bên trên. | Tông gỗ mật ong ấm (`#C9976B`) và thảm cam đất (`#D96B27` viền vàng `#E69F45`), điểm xuyết đỏ táo bóng (`#D6323A`), vàng hoa hướng dương (`#FFD014`). Tạo tương phản mạnh nhưng êm dịu bằng **màu xanh đêm (`#0E215B`) ngoài cửa sổ** và **gối xanh coban (`#1E40FF`)** trên giường. | Sân bay không được dùng màu xám bê tông lạnh lẽo. Phải dùng **nền sàn kem ngà ấm (`#F6F1E6`) kết hợp xanh mây dịu (`#E3EFF5`)**, nội thất ốp **gỗ sồi mật ong (`#D89B64`)**, điểm nhấn **xanh ngọc Wayfinding (`#2FA89E`)**, **vàng nắng (`#FFD13B`)** và **cam Coral (`#FF7849`)**. |
| **4. Chất liệu Gỗ / Đá (Tactile Toy Materials)** | Chất liệu giống **đồ chơi gỗ sơn mờ và đất sét nung mịn (Soft Clay & Beveled Wood)**. Mọi thanh gỗ khung nhà, ghế băng, thùng rượu đều có cạnh vát dày (chunky bevel) và chỉ khắc 2–3 đường vân gỗ lớn. Đá lát đường là các khối bo tròn phồng nhẹ, không dùng texture nhiễu hạt (noise). | Ván sàn gỗ có khe ghép thưa vừa phải, bề mặt bóng mờ như sáp ong. Lò sưởi gạch tím nâu (`#6E4752`) có các viên gạch bo góc mềm; ấm sắt đen, giỏ mây và thùng gỗ đều có độ dày thành vật thể lớn hơn thực tế ~1.5 lần. | Mọi quầy kệ, cổng từ, ghế chờ, bảng điện tử trong sân bay đều phải **bo tròn góc (`border-radius` lớn) và có cạnh vát dày 3D (extruded bevel)**, bề mặt sạch mịn có độ bóng satin nhẹ, tuyệt đối không dùng ảnh chụp texture kim loại/bê tông thật. |
| **5. Ánh sáng mềm & Đổ bóng (Soft Lighting & Shadows)** | Nguồn sáng mặt trời chiếu xiên từ **trên-trái xuống dưới-phải** (~`45°` ngang, `50°` cao). Bóng đổ có màu **tím-xám ấm (`#6E6A7C`, `opacity ~0.35`)** với biên mờ mềm (`soft penumbra`), kết hợp bóng tiếp xúc (contact AO) đậm hơn ngay dưới gầm ghế, bồn hoa và bàn chân nhân vật. | Kết hợp 2 nguồn sáng ấm cục bộ (lửa lò sưởi `#FF7A1A` và đèn bàn `#FFF3C4`) tạo quầng sáng (light pools) mềm trên sàn và thảm, hòa cùng ánh sáng môi trường ấm áp. Vùng khuất sáng vẫn giữ nguyên sắc độ màu ấm, không bị xỉn đen. | Dùng hướng sáng chuẩn **Trên-Trái (`45°`)** xuyên qua vách kính sân bay tạo **vệt nắng ấm (`#FFF4CC`)** trên sàn bóng. Mỗi nhân vật và đồ vật có **Contact Shadow elip mềm (`rgba(38, 28, 50, 0.32)`)** ngay dưới chân. |
| **6. Độ dày chi tiết & Cá tính Đồ vật ("Hero Props with Character")** | **Quy tắc "Sàn sạch – Viền giàu chi tiết"**: Toàn bộ lòng quảng trường tròn ở giữa rất thoáng để người chơi nhìn rõ đám đông và lối đi; trong khi các rìa cảnh cực kỳ sống động nhờ dây phơi quần áo đung đưa, xe đẩy hàng mái sọc đỏ-trắng, bồn hoa nhiều màu, biển chỉ dẫn gỗ hơi nghiêng, bảng hiệu chữ nổi dày *Thomas' Bazaar*. | Mỗi đồ vật đều có dáng điệu riêng như nhân vật hoạt hình: lưng ghế ăn khoét lỗ tròn mũm mĩm, giỏ táo đỏ xếp nghiêng tràn đầy, củi thò đầu ngẫu nhiên khỏi thùng, chổi và xẻng tựa hờ vào xô gỗ, gương dựa tường phản chiếu chiếc ghế bập bênh, chậu hướng dương đặt cạnh chiếc lược nhỏ. | Giữ hành lang di chuyển Check-in → Security → Gate **thông thoáng 100%** cho Click-to-Move; tập trung cá tính vào các cụm tương tác: quầy check-in có mô hình máy bay mini, vali dán sticker ngộ nghĩnh, màn hình máy soi hiện hình X-quang gấu bông/quả táo, bảng FIDS chữ lật sống động. |

---

## 2. Chuyển Hóa Phong Cách Sang Sân Bay Hiện Đại Thân Thiện ("Cozy Modern Toy-Diorama Airport")

### 2.1. Bảng màu chuẩn của Sân bay 2.5D (kèm Mã Hex)

Để giữ trọn vẹn cảm giác ấm áp, thân thiện của *Tazmilly Props* trong bối cảnh nhà ga hàng không hiện đại, bảng màu được quy chuẩn như sau:

| Nhóm màu | Tên màu chuẩn | Mã Hex chính | Mã Hex phụ / Bóng | Ứng dụng cụ thể trong Sân bay 2.5D |
|---|---|---|---|---|
| **1. Mặt sàn & Tường (Base Surfaces)** | **Warm Terrazzo Cream** (Kem đá mài ấm) | `#F6F1E6` | `#E5DCCB` (vạch gạch) | Sàn chính khu vực Check-in Hall và Waiting Lounge — ấm áp, làm nổi bật nhân vật và đường dẫn hướng. |
| | **Cool Cloud Tile** (Xanh mây dịu) | `#E3EFF5` | `#C8DPE8` / `#BCE0EE` | Sàn khu vực Security Check & Hành lang chuyển tiếp — kế thừa trực tiếp sắc xanh đá lát quảng trường `ref-town-square.jpg`. |
| | **Sunlit Stucco Wall** (Trắng kem nắng) | `#FBF7EE` | `#EADBC6` | Tường nội thất, cột trụ bo tròn và vách ngăn khu vực làm thủ tục. |
| **2. Chất liệu Gỗ & Viền 3D (Warm Wood & Bevels)** | **Honey Oak Wood** (Gỗ sồi mật ong) | `#D89B64` | `#C9976B` | Thân quầy Check-in, khung ghế chờ, cổng vòm phân khu, viền bảng điện tử FIDS (kế thừa gỗ sàn/bàn của `ref-cabin-interior.jpg`). |
| | **Caramel Bevel Trim** (Gỗ caramel đậm) | `#B87A44` | `#7E4830` | Mặt cắt sàn cutaway ở đáy bản đồ, cạnh vát 3D dưới chân quầy và tay vịn. |
| **3. Kính, Bầu trời & Ánh sáng (Glass & Atmosphere)** | **Apron Sky Glass** (Xanh kính bầu trời) | `#B8E4F9` | `#E6F6FF` | Vách kính toàn cảnh nhìn ra sân đỗ máy bay, cửa kính tự động. |
| | **Sunbeam Warm Glow** (Vệt nắng vàng kem) | `#FFF4CC` | `rgba(255,244,204,0.35)` | Các dải nắng chiếu xiên `45°` từ vách kính xuống sàn bóng và quầng sáng đèn trần. |
| | **Window Mullion Slate** (Khung kính xanh xám) | `#5C768D` | `#3E5366` | Khung thép bo tròn của vách kính lớn, lan can và khung cổng an ninh. |
| **4. Điểm nhấn Định hướng & Đồ vật (Wayfinding & Props)** | **Wayfinding Sky-Teal** (Xanh ngọc sân bay) | `#2FA89E` | `#59BBA6` | Biển hiệu `CHECK-IN`, `GATE 12`, đồng phục nhân viên mặt đất, đệm ghế chờ (kế thừa màu chữ *Bazaar*). |
| | **Boarding Pass Gold** (Vàng nắng ấm) | `#FFD13B` | `#FFEE4A` | Chữ nổi trên bảng FIDS, khay nhựa an ninh, vạch đứng chờ an toàn, cánh máy bay ngoài sân đỗ. |
| | **Cozy Coral Orange** (Cam đào năng động) | `#FF7849` | `#D96B27` | Áo khoác nhân vật chính, vali kéo nổi bật, đệm ghế chờ xen kẽ, nút tương tác quan trọng. |
| | **FIDS Deep Navy** (Xanh tím than bảng điện) | `#232B42` | `#161C2E` | Nền màn hình bảng thông tin chuyến bay (FIDS), màn hình máy soi X-quang và biển chỉ dẫn treo trần. |
| **5. Phản hồi Trạng thái (Semantic Feedback)** | **Clear Pass Green** (Xanh lá hợp lệ) | `#3BB273` | `#68A84E` | Đèn cổng từ an ninh báo qua cửa, chữ `BOARDING` / `ON TIME`, hiệu ứng hoàn thành bước nhiệm vụ. |
| | **Security Alert Red** (Đỏ cam cảnh báo) | `#E84855` | `#D6323A` | Đèn cổng từ báo kiểm tra lại, dây đai phân luồng đang đóng (`CLOSED`), thông báo điều kiện chưa đủ. |

---

### 2.2. Thiết kế chi tiết 9 Hạng mục Đặc trưng của Sân bay 2.5D

1. **Vách kính lớn toàn cảnh (Panoramic Apron Glass Walls)**:
   - Chiếm phần tường hậu của Check-in Hall và Waiting Lounge/Gate. Khung kính dùng các cột bo tròn màu `#5C768D` kết hợp bệ cửa ốp gỗ `#D89B64`.
   - Mặt kính có các dải phản quang trắng chéo mềm (`opacity 0.25`) và truyền sáng xuống sàn nhà tạo vệt nắng `#FFF4CC`.
2. **Sàn bóng (Polished Terrazzo & Cloud Tile Floor)**:
   - Chia thành các ô gạch vuông lớn (`120×75 px` theo tỉ lệ nén góc nhìn `38°`) có khe gạch mảnh màu ấm `#E5DCCB`.
   - Bề mặt có lớp bóng gương mờ (subtle floor reflection `opacity 0.14`) phản chiếu nhẹ chân quầy gỗ và ánh đèn trần. Trên mặt sàn có **hàng chấm tròn/dải màu pastel dẫn đường** từ Cổng vào → Quầy Check-in → Cổng An ninh → Phòng chờ để định hướng trực quan cho người mới học tiếng Anh.
3. **Quầy Check-in (Check-in Counter)**:
   - Thiết kế khối hộp bo tròn mũm mĩm (chunky rounded box): thân trước ốp gỗ sồi `#D89B64` có 2 đường chỉ nổi, mặt bàn đá kem `#FAF6EE` dày dặn.
   - Trên quầy đặt màn hình máy tính dày kiểu toy-monitor, máy đọc hộ chiếu có đèn LED nhỏ, lọ hoa hướng dương mini (gợi nhắc `ref-cabin-interior.jpg`) và bảng hiệu nổi **`CHECK-IN 01`** màu xanh ngọc `#2FA89E` chữ trắng kem dày.
4. **Băng chuyền & Cân hành lý (Baggage Drop & Scale Conveyor)**:
   - Đặt liền kề bên phải quầy Check-in. Khung kim loại bo tròn sơn kem-xám, mặt thảm cao su màu `#343846` gồm các thanh lăn tròn.
   - Tích hợp màn hình cân điện tử hiển thị con số lớn dễ đọc (`0.0 kg` khi trống → `18.5 kg` màu xanh `#4ECDC4` khi đặt vali lên).
5. **Máy soi X-quang & Cổng từ An ninh (Security Scanner & Archway)**:
   - **Cổng từ (Walk-through Archway)**: Dáng cổng vòm dày bo tròn thân thiện (không sắc nhọn kiểu công nghiệp), đỉnh vòm có cụm đèn tròn lớn đổi màu rõ rệt giữa `IDLE` (vàng `#FFD13B`), `PASS` (xanh `#3BB273`) và `ALERT` (đỏ `#E84855`).
   - **Máy soi & Băng chuyền khay (X-Ray Belt & Tray Table)**: Bàn đặt khay nhựa màu vàng `#FFD13B` (đựng hộ chiếu, đồng hồ, balo); hộp máy soi có rèm cao su cắt vạt tròn và **màn hình phía trên hiển thị hình X-quang hoạt hình dễ thương** (thấy rõ hình chú gấu bông hoặc quả táo bên trong vali khi vali đi qua).
6. **Ghế chờ (Waiting Lounge Seating)**:
   - Băng ghế 3 chỗ đặt trên khung dầm gỗ sồi `#D89B64`, phần đệm ngồi và tựa lưng làm phồng tròn như chiếc gối bánh mì (plump cushion) phối xen kẽ màu xanh ngọc `#59BBA6` và cam đào `#FF7849`.
   - Hai đầu băng ghế đặt chậu cây lá tròn trong chậu đất nung `#C85A32` và bàn gỗ tròn nhỏ để hành khách đặt ly nước/sách.
7. **Bảng thông tin chuyến bay FIDS (Flight Information Display System)**:
   - Khung gỗ-kim loại dày bo góc (`#D89B64` viền ngoài, `#232B42` mặt bảng), chữ hiển thị lớn, rõ nét, tối đa 3–4 chuyến bay (`ELW-101 LONDON - GATE 12 - BOARDING`) để người chơi dễ đọc khi làm nhiệm vụ `"What time does my flight leave?"` hoặc `"Where is Gate 12?"`.
   - Có animation lật thẻ (split-flap flip) hoặc nháy sáng nhẹ ở dòng chuyến bay mục tiêu khi người chơi tương tác.
8. **Cửa lên máy bay (Boarding Gate 12)**:
   - Gồm trụ quét thẻ lên máy bay (Boarding Pass Scanner có nắp kính phát sáng xanh khi quẹt thẻ), quầy nhân viên Gate Attendant, bảng chữ nổi 3D **`GATE 12`** (thiết kế chữ khối dày như biển *Thomas' Bazaar* và *YADO* trong `ref-town-square.jpg`) và cửa kính trượt tự động dẫn vào ống lồng.
9. **Máy bay ngoài cửa kính (Toy-Style Airliner on Apron)**:
   - Đậu bên ngoài vách kính khu vực Lounge/Gate: thân máy bay tỉ lệ chibi ngắn tròn mũm mĩm, mũi tròn thân thiện, sơn trắng kem `#FFFDF7` với đường kẻ sọc xanh ngọc `#2FA89E` và cánh màu vàng nắng `#FFD13B`. Phía dưới có xe kéo hành lý nhỏ màu cam giúp cảnh nền luôn sống động.

---

## 3. Quy Chuẩn Kỹ Thuật Asset (Asset Technical Specifications)

### 3.1. Kích thước chuẩn & Hệ tọa độ Open Map 2.5D (Đồng bộ `DEMO_ARCHITECTURE.md`)
- **Không gian bản đồ liên thông (Open Map Canvas)**: **`3200 × 1800 px`** (`WORLD_HEIGHT = 1792 px` làm tròn hiển thị `1800 px`, khớp chính xác với lưới điều hướng **`100 cột × 56 hàng`**, mỗi ô `Tile = 32 × 32 px`). Kết nối liền mạch 4 khu vực chính và 2 hành lang trên cùng một mặt phẳng điều hướng: *Zone 1: Check-in Hall & Baggage Drop* → *Corridor West* → *Zone 2: Security Check* → *Corridor East* → *Zone 3: Waiting Lounge* & *Zone 4: Boarding Gate 12*.
- **Khung nhìn Camera (Viewport chuẩn)**: `1280 × 720 px` đến `1600 × 900 px` (tự động co giãn tỉ lệ `16:9` trên desktop với `devicePixelRatio` tối đa `2x` và hỗ trợ pan/zoom `[0.65, 1.30]` mượt trên mobile).
- **Bảng kích thước khung Asset (Bounding Box `@1x` Logic & `@2x` HiDPI Source)**:

| Nhóm Asset | Khung chuẩn `@1x` (World px) | Khung nguồn `@2x` / HiDPI | Chiều cao hiển thị thực tế | Điểm neo (`anchorX, anchorY`) & Hộp va chạm (`footprint`) |
|---|---|---|---|---|
| **Ô lưới điều hướng (`Tile`)** | `32 × 32 px` | `64 × 64 px` | `32 px` | `(0.0, 0.0)` — Lưới `100 × 56` ô |
| **Mặt sàn & Tường nền (Zone Chunks)** | Chunks `512 × 512 px` trên bản đồ `3200 × 1800 px` | Pre-rendered Offscreen Atlas | Toàn cảnh (`3200 × 1800 px`) | Layer 0 (`OffscreenCanvas` / WebP `≤ 350 KB`) |
| **Đồ vật Kiến trúc Lớn (Hero Props: Quầy Check-in, Máy soi X-Ray, Bảng FIDS, Gate 12)** | `256 × 192 px` đến `448 × 240 px` | `512 × 384 px` | `130 – 210 px` | Anchor `(0.50, 0.90)` — Footprint bội số `32 px` (khai báo trong `data/objects.json`) |
| **Đồ vật Tương tác Vừa (Ghế chờ, Ki-ốt, Xe đẩy, Cổng từ, Cây nước)** | `128 × 128 px` | `256 × 256 px` | `72 – 110 px` | Anchor `(0.50, 0.88)` — Footprint `64 × 32 px` đến `128 × 48 px` |
| **Đồ vật Nhỏ & Vật phẩm Cầm tay (Vali kéo, Khay an ninh, Chậu cây, Hộ chiếu)** | `64 × 64 px` | `128 × 128 px` | `36 – 52 px` | Anchor `(0.50, 0.85)` — Footprint `32 × 32 px` (hoặc gắn trên quầy/tay) |
| **Nhân vật chính & NPC (Chibi `2.2 đầu`)** | **`96 × 128 px` / frame** | **`160 × 200 px` (hoặc `192 × 256 px`)** | **`88 – 92 px`** (`@1x`) | Anchor **`(0.50, 0.88–0.92)`** (giữa 2 bàn chân) — Footprint `28 × 20 px` |
| **Thú cưng (`Airport Pet` — `1.8 đầu`)** | **`64 × 64 px` / frame** | **`96 × 96 px` (hoặc `128 × 128 px`)** | **`46 – 56 px`** (`@1x`) | Anchor **`(0.50, 0.86)`** — Không chặn đường nhân vật |

### 3.2. Góc nhìn cố định, Điểm neo chân (Anchor Point) & Đổ bóng
1. **Góc nhìn cố định (`35°–38°` Top-Down Oblique 2.5D)**:
   - Mọi vật thể được vẽ với góc nhìn từ trên chúc xuống `~35°–38°`: mặt đứng phía trước (front face) chiếm `~65%` chiều cao sprite và mặt phẳng phía trên (top face) chiếm `~35%` chiều cao sprite, có đường viền nâu ấm (`#3A2E2B`, dày `2px`) và cạnh vát 3D sáng rõ.
   - Quy ước mặt phẳng sàn: hình tròn đường kính `100 px` trên mặt sàn được vẽ thành hình elip `100 × 62 px`.
2. **Điểm neo chân (Foot / Ground Anchor Point) phục vụ Y-Sorting (`world/ysort.js`)**:
   - Mọi nhân vật, NPC, Pet và đồ vật đặt trên sàn đều thống nhất **Điểm neo tiếp đất `footY`** tại chính giữa hai bàn chân / đáy chân đế (`anchorX = 0.50, anchorY = 0.88..0.92`), chừa `8–12%` đáy khung cho viền dưới của bóng tiếp xúc (contact shadow) và mũi giày để bóng không bao giờ bị cắt cụt.
   - **Thứ tự vẽ chiều sâu (Depth Sorting trên Layer 2)**:
     - $\text{sortKey} = \text{Math.round}(\text{entity.footY} \times 100) + \text{entity.zBias}$ (nếu trùng `sortKey` thì so sánh `entity.id` để chống nhấp nháy z-fighting).
     - **Tách thân và mái cho vật thể dạng cổng (`Archway Split`)**: Với Cổng từ an ninh (`metal_detector`) hoặc Cửa quét thẻ (`boarding_scanner_gate`), hai trụ bên nằm ở **Layer 2** (Y-sort theo chân trụ), còn thanh ngang/mái vòm trên đỉnh nằm ở **Layer 3 (Overhead Foreground)** để nhân vật đi xuyên qua dưới cổng tự nhiên (tự động hạ `globalAlpha = 0.45` khi che nhân vật).
3. **Quy chuẩn Bóng đổ (Shadow Standard — Layer 1)**:
   - **Bóng tiếp xúc động (Dynamic Contact Shadow)**: Mỗi nhân vật/NPC/Pet có 1 hình elip mềm màu `rgba(38, 28, 50, 0.32)` vẽ ở **Layer 1** ngay tại `(x, footY)`, tự động thu nhỏ `scale(0.85)` khi bước chân nhấc cao hoặc dịch chuyển theo tư thế ngồi.
   - **Bóng đồ vật tĩnh (Prop Ambient & Cast Shadow)**: Nướng sẵn (baked) hoặc vẽ ở Layer 1 một lớp bóng elip lệch nhẹ về hướng Đông-Nam (`dx = +5 px, dy = +7 px`, `blur = 8 px`, màu `rgba(38, 28, 50, 0.26)`), không nướng cứng vào ảnh nền sàn để có thể đổi trạng thái đồ vật linh hoạt.

### 3.3. Quy ước Đặt tên & Cấu trúc Sprite Sheet Nhân vật (Khớp `MODULE_CONTRACT.md`)
- **Quy ước đặt tên file (`kebab-case`, chữ thường, phân quyền đúng thư mục Agent 1 & Agent 2)**:
  - Môi trường & Đồ vật (Agent 1 sở hữu): `airport-demo/assets/env/<zone-or-prop-id>-<state>.png` (hoặc `.webp`/`.svg`, ví dụ: `airport-demo/assets/env/zone-checkin-floor.webp`, `airport-demo/assets/env/prop-checkin-counter-idle.png`, `airport-demo/assets/env/prop-suitcase-closed.png`, `airport-demo/assets/env/prop-suitcase-open.png`).
  - Nhân vật, Thú cưng & NPC (Agent 2 sở hữu): `airport-demo/assets/actors/<actor-id>-sheet.png` kèm metadata `airport-demo/assets/actors/<actor-id>-atlas.json` (ví dụ: `char-player-sheet.png`, `pet-milu-airport-sheet.png`, `npc-checkin-agent-sheet.png`).
  - Âm thanh câu thoại & SFX (Agent 3 sở hữu): `airport-demo/assets/audio/<line-hash-or-sfx>.mp3`.
- **Quy chuẩn Sprite Sheet Animation cho Nhân vật (`96×128 px` `@1x` / `160×200 px` `@2x` mỗi frame)**:
  - Hỗ trợ đầy đủ **4 hướng di chuyển (`down` / Nam, `up` / Bắc, `right` / Đông, `left` / Tây)**:
    - Hàng 0 (`row 0`): `idle` — **4 khung × 4 hướng** (tổng 16 frame, chạy ở `8 FPS`, đầu và vai nhấp nhô nhịp thở `2 px`, mắt chớp tự nhiên ở frame 3).
    - Hàng 1–4 (`rows 1..4`): `walk` — **6 đến 8 khung × 4 hướng** (chạy ở `12 FPS`, chu kỳ bước đi có độ nảy thân trên `3 px`, tay đánh ngược chiều chân).
    - Hàng 5–8 (`rows 5..8`): `run` — **6 đến 8 khung × 4 hướng** (chạy ở `15 FPS`, khi người chơi click điểm ở xa; thân hơi đổ về trước `6°`, bước chân sải rộng).
    - Hàng 9 (`row 9`): `interact` / `pick_up` / `put_down` — **6 khung** (đưa hộ chiếu/vé máy bay ra phía trước, nhặt/đặt vali lên băng chuyền, kéo vali đi kèm theo `carryState`).
    - Hàng 10 (`row 10`): `sit` & `stand` — **4 khung** (ngồi xuống băng ghế phòng chờ và đứng dậy mượt mà, khớp với `CharacterFSM`).

---

## 4. Danh Mục Asset Cho Vertical Slice (Check-in Hall + Hành Lang Tới Security)

Bảng dưới đây liệt kê toàn bộ danh mục asset bắt buộc cho **Phase 2 (Prototype hình ảnh)** và **Phase 3 (Vertical Slice)**, bao gồm các đồ vật có **cặp trạng thái Đóng/Mở hoặc Bật/Tắt** để kiểm chứng triệt để việc sửa lỗi hành động lặp lại:

| STT | Mã Asset (`id`) | Tên hiển thị & Vai trò | Khu vực | Kích thước | Các Trạng thái (`currentState`) | Câu Tiếng Anh / Từ vựng gắn kèm |
|---|---|---|---|---|---|---|
| **1** | `env_checkin_hall` | Mặt sàn đá Terrazzo kem ấm + Vách kính sân đỗ + Hành lang Security | Check-in → Security | `2800×1600` | `daylight` (mặc định) | *airport terminal, check-in hall, security corridor* |
| **2** | `prop_sliding_door` | **Cửa kính trượt Cổng vào Sân bay** *(Test lặp Mở/Đóng #1)* | Airport Entrance | `384×384` | `closed` ↔ `open` (2 cánh kính trượt sang hai bên + đèn báo xanh) | *"I'm entering the airport."* / *"Open the automatic door."* / *"Close the door."* |
| **3** | `prop_stanchion_belt` | **Trụ dây đai phân luồng xếp hàng** *(Test lặp Mở/Đóng #2)* | Check-in Queue | `256×256` | `closed` (dây đỏ `#E84855` căng ngang) ↔ `open` (dây thu vào trụ, mở lối đi) | *"Excuse me, may I enter the check-in line?"* / *"Open the queue barrier."* / *"Close the barrier."* |
| **4** | `prop_checkin_kiosk` | **Máy Check-in Tự động (Self-Service Kiosk)** *(Test lặp Bật/Tắt #3)* | Check-in Hall | `256×256` | `standby` (màn hình tối dịu) ↔ `active` (màn hình sáng hiện sơ đồ ghế + khe in vé) | *"I'm using the self-check-in kiosk."* / *"Turn on the kiosk screen."* / *"Finish using the kiosk."* |
| **5** | `prop_checkin_desk` | **Quầy Thủ tục Check-in 01** (Gỗ sồi `#D89B64` + Mặt đá kem) | Check-in Counter | `512×384` | `idle` → `processing` (máy đọc hộ chiếu sáng đèn) → `checked_in` (xuất thẻ lên máy bay trên mặt quầy) | *"Hello, I'd like to check in for my flight."* / *"Here is my passport."* |
| **6** | `prop_baggage_scale` | **Băng chuyền & Cân hành lý** *(Test lặp Đặt/Lấy #4)* | Baggage Drop | `256×256` | `empty` (`0.0 kg`) ↔ `weighed` (có vali trên băng, màn hình hiện `18.5 kg` xanh `#4ECDC4`) ↔ `dispatched` (vali chạy vào trong) | *"I'd like to check this bag."* / *"Put the suitcase on the scale."* / *"Take the suitcase off the scale."* |
| **7** | `prop_fids_board` | **Bảng Điện tử Thông tin Chuyến bay (FIDS)** | Check-in / Corridor | `384×384` | `normal` ↔ `highlighted` (dòng `ELW-101 LONDON - GATE 12` lật thẻ và sáng viền vàng `#FFD13B`) | *"What time does my flight leave?"* / *"Where is Gate 12?"* |
| **8** | `prop_suitcase_player` | **Vali kéo của Người chơi** (Màu cam Coral `#FF7849` dán sticker) | Theo nhân vật / Sàn | `128×128` | `on_floor_closed` ↔ `on_floor_open` (mở nắp kiểm tra đồ) ↔ `following_player` (kéo theo sau) ↔ `on_scale` | *"Open my suitcase."* / *"Close my suitcase."* / *"Pull my suitcase."* |
| **9** | `prop_lounge_bench` | **Băng ghế chờ Gỗ sồi & Đệm xanh ngọc** *(Test lặp Ngồi/Đứng #5)* | Corridor / Lounge | `256×256` | `empty` ↔ `occupied` (nhân vật ngồi trên ghế) + chậu cây trang trí | *"Is this seat taken?"* / *"Sit on the bench."* / *"Stand up from the bench."* |
| **10** | `prop_security_tray` | **Bàn Khay nhựa An ninh màu vàng nắng** | Security Entry | `256×256` | `empty_tray` ↔ `loaded_tray` (có balo/hộ chiếu trong khay) | *"Put my bag in the tray."* / *"Take my items from the tray."* |
| **11** | `prop_security_arch` | **Cổng từ Kiểm tra An ninh** | Security Entry | `256×384` | `ready` (đèn vàng) → `pass_green` (đèn xanh `#3BB273` + âm báo bip nhẹ) / `alert_red` (`#E84855`) | *"May I walk through the security gate?"* |
| **12** | `prop_apron_plane` | **Máy bay Chibi đậu ngoài vách kính** | Ngoài cửa kính | `512×256` | `parked_idle` (đèn cảnh báo ở cánh nhấp nháy nhẹ, xe hành lý đỗ cạnh) | *"Look at the airplane outside the window!"* |
| **13** | `char_player_traveler` | **Nhân vật chính (Du khách học tiếng Anh)** — Chibi `2.2 đầu` | Toàn map | `160×200` / frame | `idle`, `walk`, `run`, `hand_over_passport`, `pull_suitcase`, `sit`, `celebrate` (× 4 hướng) | Nhân vật do người chơi điều khiển bằng Click-to-Move. |
| **14** | `char_pet_companion` | **Thú cưng Đồng hành (Cún/Mèo du lịch đeo khăn phi công)** | Đi theo nhân vật | `96×96` / frame | `idle_happy`, `walk_follow`, `sit_wait`, `look_around`, `excited_jump` | Tự động bám theo nhân vật ở khoảng cách hợp lý, dừng trước cổng an ninh khi cần. |
| **15** | `npc_checkin_agent` | **Nhân viên Quầy Check-in (Mia)** — Đồng phục xanh ngọc `#2FA89E` | Quầy Check-in 01 | `160×200` / frame | `idle_smile`, `talking`, `scanning_passport`, `handing_boarding_pass` | *"Good morning! May I see your passport, please?"* / *"Here is your boarding pass for Gate 12."* |
| **16** | `npc_security_officer` | **Nhân viên An ninh (Officer Ben)** — Đứng tại đầu hành lang Security | Security Entry | `160×200` / frame | `idle_watch`, `wave_through`, `talking`, `check_boarding_pass` | *"Please place your carry-on bag in the yellow tray."* |
| **17** | `ui_items_pack` | **Bộ vật phẩm Nhiệm vụ**: Hộ chiếu (`passport`), Thẻ lên máy bay (`boarding_pass`), Thẻ hành lý (`baggage_tag`) | HUD / Popover | `128×128` | `locked` → `in_hand` → `verified` (có dấu mộc/tick xanh) | Hiển thị trực quan khi thực hiện chuỗi nhiệm vụ Check-in. |

---

## 5. Đánh Giá Trung Thực Khả Năng Sản Xuất Asset Trên Máy Này & Chất Lượng Kỳ Vọng

Thực hiện đúng yêu cầu của Master Prompt (*"NÓI THẬT khả năng sản xuất asset trên máy này: công cụ nào có, vẽ thủ tục bằng code SVG/canvas→PNG, có công cụ sinh ảnh hay không, và chất lượng kỳ vọng"*), dưới đây là báo cáo kiểm chứng thực tế trên máy trạm hiện tại:

### 5.1. Công cụ thực tế đang có sẵn trên máy (`D:\tools\Hoc tieng anh\english-life-world`)
Qua kiểm tra trực tiếp môi trường hệ thống, máy hiện có **2 nhóm công cụ sản xuất asset hoạt động 100%**:

1. **Pipeline Vẽ Thủ tục Đa lớp (Procedural Multi-Layer SVG / HTML5 Canvas → Headless Chromium → PNG/WebP)**:
   - **Đã cài đặt và xác minh chạy tốt**:
     - `Python 3.11.9` + `Playwright (sync_playwright + Chromium)` + `Pillow (PIL)` + `OpenCV (cv2)` + `NumPy` + `Matplotlib`.
     - `Node.js v24.13.1` + `Wrangler 4.151.1`.
   - Đây chính là pipeline đã tạo thành công bộ asset hiện tại của dự án trong `tools/generate_cafe_assets.py`, `tools/generate_people_assets.py`, `tools/generate_pet_assets.py`: dùng code Python sinh cấu trúc SVG phức tạp (có `linearGradient`, `radialGradient`, `feDropShadow`, `feGaussianBlur`, lớp bóng vát cạnh bevel 3D), sau đó dựng bằng **Headless Chromium của Playwright** và xuất ra file **PNG/WebP RGBA nền trong suốt** sắc nét tuyệt đối.
2. **Công cụ Sinh ảnh AI (Image Generation Subagent)**:
   - **Máy local KHÔNG có** card đồ họa chạy Stable Diffusion / ComfyUI hay phần mềm 3D Blender CLI cục bộ.
   - **Tuy nhiên**, môi trường agent Antigravity hiện tại **CÓ tích hợp subagent `image-generator`** (công cụ sinh/chỉnh sửa ảnh AI từ mô tả văn bản và lưu trực tiếp ra file ảnh).

### 5.2. Phân tích Ưu/Nhược điểm & Chiến lược Kết hợp Thực tế (Hybrid Pipeline)

| Phương pháp sản xuất | Điểm mạnh thực tế | Giới hạn thực tế (Nói thật) | Quyết định áp dụng cho Sân bay 2.5D |
|---|---|---|---|
| **A. Vẽ thủ tục bằng Code (SVG / Canvas 2.5D → Playwright PNG/WebP)** | - **Độ chính xác kỹ thuật 100%**: Kiểm soát tuyệt đối kích thước khung (`160×200`), điểm neo chân `(0.5, 0.92)`, bảng màu mã Hex và nền trong suốt RGBA.<br>- **Đồng bộ hoàn hảo giữa các trạng thái Đóng/Mở & Animation**: Khi vẽ cửa trượt mở/đóng, cân hành lý có/không có vali, hoặc 8 khung bước đi (`walk cycle`) × 4 hướng, thân quầy và tỷ lệ nhân vật khớp nhau từng pixel, không bao giờ bị biến dạng.<br>- Có thể dựng trực tiếp bằng lớp SVG/Canvas tương tác trong trình duyệt kết hợp sprite sheet PNG. | Không thể tạo ra bề mặt điêu khắc đất sét nung thủ công phức tạp hay ánh sáng Global Illumination ray-tracing 100% giống bức render 3D Blender/Octane trong `ref-town-square.jpg`. | **Dùng làm xương sống chính (Core Pipeline)** cho:<br>1. Sprite sheet Nhân vật chính, Pet, NPC (4 hướng × 6–8 frame mượt mà).<br>2. Các đồ vật có trạng thái tương tác Đóng/Mở, Bật/Tắt (Quầy Check-in, Cân hành lý, Cổng phân luồng, Bảng FIDS, Cổng an ninh).<br>3. Sàn chia ô 2.5D, vách kính, vệt nắng và hệ thống đổ bóng động. |
| **B. Sinh ảnh AI qua Subagent (`image-generator`) + Hậu kỳ bằng Python (`Pillow`/`OpenCV`)** | - Tạo được chất liệu shading mềm mại, độ phồng 3D (clay/toy render) rất bắt mắt cho các vật thể tĩnh đơn lẻ hoặc bức tranh concept/backdrop. | - AI sinh ảnh **không thể giữ đồng nhất 100% pixel** qua 24–32 khung hình liên tiếp của một sprite sheet đi bộ 4 hướng.<br>- Thường sinh kèm nền hoặc bóng đổ lệch chuẩn, bắt buộc phải dùng script Python (`OpenCV`/`Pillow`) tách nền, căn lại tâm neo `(0.5, 0.92)` và chuẩn hóa kích thước. | **Dùng bổ trợ có chọn lọc** cho:<br>1. Ảnh nền ngoại cảnh sân đỗ/máy bay phía sau vách kính hoặc prop trang trí tĩnh 1 trạng thái (chậu cây, tượng trang trí, poster du lịch).<br>2. Luôn chạy qua script chuẩn hóa kích thước & alpha của Python trước khi đưa vào game. |

### 5.3. Chất lượng Kỳ vọng Thực tế (Realistic Visual Target)
- **Cam kết trung thực với Chủ dự án**:
  - Bản demo trên máy này sẽ **không phải là một bản render 3D pre-rendered bằng Blender nặng hàng chục MB**, mà là một **thế giới 2.5D Vector/Raster Hybrid sắc nét, ấm áp, mang đậm tinh thần "Cozy Toy-Diorama"**:
    1. **Về màu sắc, góc nhìn và bố cục**: Đạt **90–95%** cảm giác ấm cúng, thân thiện của ảnh tham khảo nhờ áp dụng đúng góc nhìn `38°`, bảng màu Kem Terrazzo – Gỗ Sồi Mật Ong – Xanh Mây – Xanh Ngọc, các khối bo tròn dày (chunky bevels) và ánh sáng chiếu xiên từ vách kính.
    2. **Về độ chi tiết bề mặt vật liệu**: Đạt **~75–80%** so với ảnh render 3D tĩnh trên ArtStation (bề mặt sẽ theo hướng *Clean Stylized Toy Vector/Clay Shading* giống game 2.5D trên web/mobile hiện đại, sạch sẽ và đọc chữ tiếng Anh cực kỳ rõ ràng).
    3. **Về chuyển động & tương tác**: Đạt **100%** độ mượt (`60 FPS` di chuyển Click-to-Move, Y-sorting chuẩn xác khi đi trước/sau quầy, animation nhân vật bước đi/đưa hộ chiếu/kéo vali không bị giật hay lệch khung giữa các trạng thái).

---

## 6. Nguyên Tắc Bản Quyền & Sáng Tạo Độc Lập

1. **Không sao chép tài sản độc quyền**:
   - Hai bức ảnh `ref-town-square.jpg` và `ref-cabin-interior.jpg` (*Mother 3 Tribute – Tazmilly Props* của nghệ sĩ DshireDoodles) **chỉ được dùng để phân tích ngôn ngữ thị giác** (góc độ camera, tỉ lệ đầu-thân chibi, cách phối màu ấm-lạnh và cách bo tròn khối đồ vật).
   - **Tuyệt đối không cắt ghép, đồ lại (trace) hay sử dụng bất kỳ nhân vật, trang phục, tòa nhà, biển hiệu (*Thomas' Bazaar*, *YADO*) hoặc đồ vật nào** từ *Mother 3* / bộ ảnh tham khảo.
2. **Thiết kế nguyên bản 100% cho English Life World**:
   - Toàn bộ nhân vật (Traveler, Check-in Agent Mia, Security Officer Ben, Pet đồng hành), kiến trúc nhà ga, quầy thủ tục, bảng điện tử FIDS (`ELW-101`), máy soi an ninh và máy bay ngoài sân đỗ đều được thiết kế mới hoàn toàn, phục vụ trực tiếp ngữ cảnh học giao tiếp tiếng Anh tại sân bay và thuộc toàn quyền sử dụng của dự án *English Life World*.
