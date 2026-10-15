# KẾ HOẠCH TÀI NGUYÊN HÌNH ẢNH THÚ CƯNG (PET ASSET PLAN — 100 ASSETS)

> **Dự án:** English Life World (`D:\tools\Hoc tieng anh\english-life-world`)  
> **Phụ trách:** Agent A1 (Audit & Design)  
> ** Nguồn tham chiếu gốc:** `D:\tools\Hoc tieng anh\Pet`  
> **Đích lưu trữ:** `D:\tools\Hoc tieng anh\english-life-world\assets\pets\` và `assets/pets/manifest.json`

---

## 1. Quy mô & Cấu trúc Ma trận 100 Assets (`10 Pet × 10 State`)

Hệ thống sử dụng **đúng 100 tệp hình ảnh** tương ứng với **10 Thú cưng × 10 Trạng thái (States)**. Không sử dụng Emoji thay thế và không dùng chung ảnh giữa các loài.

### 1.1. Danh sách 10 Thú cưng & Ánh xạ Thiết kế Gốc từ `D:\tools\Hoc tieng anh\Pet`

Mỗi thú cưng phải giữ đúng thiết kế nhân vật (character design, bảng màu lông, tỷ lệ đầu/thân, phụ kiện đặc trưng) từ thư mục mẫu `D:\tools\Hoc tieng anh\Pet`:

| STT | `petId` | Tên nhân vật | Nhóm | Gói | Tệp tham chiếu gốc trong `D:\tools\Hoc tieng anh\Pet` | Đặc điểm nhận diện cốt lõi (Visual Identity) |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `milu` | **Milu** | Chó | Free | `imgi_67_cachorro-dançando-gif-png-preview.png`, `imgi_77_cachorro-lhasa-png-preview.png` | Cún con lông vàng kem ấm áp, đôi mắt tròn đen láy, tai cụp mềm, đeo vòng cổ đỏ nhỏ. |
| 2 | `boba` | **Boba Corgi** | Chó | Premium | `imgi_68_a2d3721e-1f4c-441f-b450-260b9eb95eec.png`, `imgi_70_1774106870799f_800x800.webp` | Cún Corgi chân ngắn mũm mĩm, lông cam vàng & ngực trắng phau, tai dựng tam giác lớn. |
| 3 | `cookie` | **Cookie Shiba** | Chó | Premium | `imgi_73_1680327644315_800x800.webp`, `imgi_78_1778260608928z_800x800.webp` | Cún Shiba Inu lông vàng nướng (toasted gold), má trắng phúng phính, đuôi cuộn tròn. |
| 4 | `mochi` | **Mochi** | Mèo | Free | `imgi_5_LACaNpmTkQN0WmiDkZi3mt0R_jwN5cNy29QxcwFZQ8IJ1u1VIEjDQ0SK4CsEsuo_aqSQpetIMUZYu5YRJrNcgBFFHf3nqkcZ1IuSEYAh1pIzm...` | Mèo con trắng kem pha vệt cam pastel mềm mịn như bánh Mochi, mắt long lanh, má ửng hồng. |
| 5 | `pepper` | **Pepper British Shorthair** | Mèo | Premium | `imgi_72_cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI1LTAxL3Jhd3BpeGVsb2ZmaWNlNF8zZF9pbGx1c3RyYXRpb25fb2ZfYV9icml0aXNoX3No...` | Mèo Anh lông ngắn màu xám xanh (blue-gray) dày mượt, mặt bầu bĩnh, mắt tròn màu hổ phách. |
| 6 | `oreo` | **Oreo Tuxedo** | Mèo | Premium | `imgi_6_38URyCweGwZo1DCQe-oXqcgwAP3onbmX20YZK0P1pmfhBTj4yR9sfnOSBQKnOWYA8qmFmUjY2FeU58d3xksk1Ae5OUTgZkG1wO44FsGB56pAe...` | Mèo nhị thể đen-trắng kiểu Tuxedo (lưng đen, ngực và 4 bàn chân trắng như đi tất), mắt xanh lá. |
| 7 | `ember` | **Ember Rồng nhỏ** | Hiếm | Premium | `imgi_75_DALLE_IMAGES%2FHWS3asZhTHceGI8Wj0CMWdc3eX03%2Fresized%2F1721698658368h_1000x1000.webp` | Rồng nhỏ 3D dễ thương vảy cam đỏ ấm áp, bụng vàng nhạt, cánh nhỏ xinh và đốm lửa ở chóp đuôi. |
| 8 | `lumi` | **Lumi Kỳ lân** | Hiếm | Premium | `imgi_76_aHR0cHM6Ly9iLnN0YWJsZWNvZy5jb20vZTE5NGRmZDItM2JkZS00NDgyLWJhYmYtOTA0Yzk5Mzg5YTkxLmpwZWc.webp` | Kỳ lân nhỏ màu trắng ngọc trai, bờm và đuôi pastel tím-hồng-xanh, sừng nhỏ phát sáng dịu. |
| 9 | `pip` | **Pip Cáo tuyết** | Hiếm | Premium | `imgi_10_xcdzlxr8J3_...`, `imgi_14_X23117ilb-...` | Cáo tuyết Bắc Cực lông trắng bông xù điểm sắc xanh băng ở chóp tai và đuôi lớn. |
| 10 | `aqua` | **Aqua Rái cá** | Hiếm | Premium | `imgi_18_WcyTZGapgrb...`, `imgi_81_treasure-trail-v4.webp` | Rái cá nhỏ màu xanh lam ngọc pha nâu kem ở bụng, má tròn có ria ngắn, đeo vỏ sò nhỏ. |

### 1.2. Danh sách 10 Trạng thái Chuẩn (10 Canonical States)

Mỗi thú cưng bắt buộc có đủ 10 tệp ảnh theo 10 trạng thái sau:

| STT | Mã `state` | Ý nghĩa biểu cảm & Tư thế (Pose & Expression Spec) | Loại hoạt ảnh CSS/Canvas (`animationType`) | `fallbackState` |
| :-: | :--- | :--- | :--- | :--- |
| 1 | `idle_happy` | Ngồi hoặc đứng thoải mái, mắt sáng tươi tắn, mỉm cười nhẹ nhàng, nhìn thẳng thân thiện. | `breathe_soft` | `idle_happy` |
| 2 | `curious` | Nghiêng đầu sang một bên, tai vểnh lên lắng nghe, mắt mở to tò mò khi học sinh đang phát âm. | `head_tilt` | `idle_happy` |
| 3 | `playful` | Tư thế nhún nhảy rủ chơi (play bow / vờn bóng), biểu cảm hào hứng năng động. | `bounce_play` | `idle_happy` |
| 4 | `eating` | Cúi bên bát thức ăn xinh xắn hoặc cầm bánh thưởng, hai má phúng phính vui vẻ thưởng thức. | `munch_bob` | `idle_happy` |
| 5 | `drinking` | Đang uống nước mát từ bát nước / bình nước nhỏ, vẻ mặt sảng khoái. | `sip_pulse` | `idle_happy` |
| 6 | `sleepy` | Nằm cuộn tròn trên đệm êm hoặc nhắm mắt lim dim ngáp nhẹ, thư giãn bình yên. | `sleep_float` | `idle_happy` |
| 7 | `tired` | Ngồi hơi rũ vai/tai, thở phì phò nhẹ sau khi vận động, cần được nghỉ ngơi hoặc tiếp nước. | `slow_sway` | `sleepy` |
| 8 | `sad_lonely` | Ngồi thu mình, mắt long lanh mong chờ người học quay lại chơi cùng (vẫn dễ thương, không bi kịch). | `gentle_shiver` | `curious` |
| 9 | `excited` | Nhảy lên vui sướng hoặc giơ hai chân trước ăn mừng khi người học hoàn thành bài học/nhiệm vụ. | `jump_celebrate` | `playful` |
| 10 | `walking_adventure` | Tư thế bước đi tự tin (trotting/walking pose), đeo khăn quàng hoặc túi nhỏ phiêu lưu cùng nhân vật. | `walk_trot` | `playful` |

---

## 2. Quy chuẩn Kỹ thuật Hình ảnh (Strict Technical Standards)

1. **Định dạng & Kênh Alpha (PNG RGBA)**:
   * Bắt buộc định dạng `.png` chuẩn **RGBA (32-bit color with Alpha channel)**.
   * Nền phải **trong suốt thực sự (`transparent: true`)** — các pixel ở vùng biên ngoài nhân vật phải có `alpha === 0`.
   * **Cấm tuyệt đối** nền trắng đặc (`#FFFFFF`), nền đen đặc, hoặc họa tiết ô vuông bàn cờ (checkerboard) bị vẽ dính vào điểm ảnh.
2. **Không chứa Chữ (Zero Embedded Text)**:
   * Trong hình ảnh tuyệt đối không có chữ tiếng Anh/tiếng Việt, không có watermark, không có số hiệu hay nhãn trạng thái.
3. **Không Recolor Giả (No Fake Hue-Shift / Recolor)**:
   * Cấm lấy ảnh của Pet này rồi chỉ đổi màu (hue-shift/tint) thành Pet khác. Mỗi loài trong 10 Pet phải có hình dáng giải phẫu (silhouette, tai, đuôi, thân) riêng biệt.
   * Giữa 10 state của cùng 1 Pet, phải thể hiện rõ sự khác biệt về tư thế/biểu cảm/đạo cụ (bát ăn, bát nước, tư thế ngủ, tư thế bước đi...), không được copy nguyên 1 ảnh tĩnh trùng byte (`fileSize` và hash phải phản ánh đúng nội dung).
4. **Kích thước & Tối ưu Dung lượng**:
   * Độ phân giải chuẩn khuyến nghị: `256×256` hoặc `512×512` pixels (tỉ lệ vuông `1:1`, nhân vật căn giữa và chiếm khoảng `75%–88%` khung hình để không bị cắt mất tai/đuôi khi nhún nhảy).
   * Dung lượng mỗi tệp: từ `8 KB` đến `350 KB` (nén lossless/quantized hợp lý để tải nhanh trên trình duyệt).
5. **Quy ước Đường dẫn Lưu trữ (`assetPath`)**:
   * Cấu trúc thư mục chuẩn:
     `assets/pets/<petId>/<state>.png`
   * Ví dụ:
     * `assets/pets/milu/idle_happy.png`
     * `assets/pets/milu/walking_adventure.png`
     * `assets/pets/mochi/eating.png`

---

## 3. Quy trình Triển khai 2 Giai đoạn (Phased Production Pipeline)

Để đảm bảo chất lượng đồng bộ cao nhất:
* **Giai đoạn 1 — Hoàn thiện Chuẩn Vàng cho `milu` (10 States trước tiên)**:
  * Tạo và xử lý tách nền RGBA chuẩn cho trọn bộ **10 state của `milu`**: `idle_happy`, `curious`, `playful`, `eating`, `drinking`, `sleepy`, `tired`, `sad_lonely`, `excited`, `walking_adventure`.
  * Kiểm tra hiển thị thực tế của `milu` trong cả Pet Interaction Panel lẫn trên sân khấu 3D (`#ctx-dog` / `#pet-companion-sprite`).
* **Giai đoạn 2 — Triển khai 9 Pet còn lại (90 States)**:
  * Áp dụng đúng quy chuẩn khung hình, độ trong suốt RGBA và chất lượng biểu cảm từ `milu` cho 9 Pet tiếp theo: `boba`, `cookie`, `mochi`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`.
  * Chạy script kiểm định tự động toàn bộ 100 tệp PNG và xuất `assets/pets/manifest.json`.

---

## 4. Đặc tả Schema `assets/pets/manifest.json`

Tệp `D:\tools\Hoc tieng anh\english-life-world\assets\pets\manifest.json` là nguồn chân lý duy nhất (Single Source of Truth) để hệ thống UI và bộ kiểm thử QA tra cứu asset.

### 4.1. Cấu trúc Tổng thể của `manifest.json`

```json
{
  "version": "2.0.0",
  "generatedAt": "2026-10-14T14:00:00.000Z",
  "totalPets": 10,
  "statesPerPet": 10,
  "totalAssets": 100,
  "pets": [
    {
      "petId": "milu",
      "name": "Milu",
      "group": "dog",
      "tier": "free",
      "defaultState": "idle_happy"
    }
  ],
  "states": [
    "idle_happy",
    "curious",
    "playful",
    "eating",
    "drinking",
    "sleepy",
    "tired",
    "sad_lonely",
    "excited",
    "walking_adventure"
  ],
  "assets": [
    {
      "petId": "milu",
      "state": "idle_happy",
      "assetPath": "assets/pets/milu/idle_happy.png",
      "format": "png",
      "width": 512,
      "height": 512,
      "fileSize": 84320,
      "transparent": true,
      "animationType": "breathe_soft",
      "fallbackState": "idle_happy",
      "verified": true
    }
  ]
}
```

### 4.2. Đặc tả Bắt buộc cho 11 Trường của mỗi Asset Entry

Mỗi phần tử trong mảng `assets` (gồm đúng 100 phần tử) **bắt buộc** có đầy đủ 11 trường sau:

| Tên trường | Kiểu dữ liệu | Ràng buộc hợp lệ (Validation Rules) | Mô tả chi tiết |
| :--- | :--- | :--- | :--- |
| `petId` | `string` | Thuộc tập 10 ID: `milu`, `boba`, `cookie`, `mochi`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua` | Mã định danh duy nhất của thú cưng. |
| `state` | `string` | Thuộc tập 10 state: `idle_happy`, `curious`, `playful`, `eating`, `drinking`, `sleepy`, `tired`, `sad_lonely`, `excited`, `walking_adventure` | Mã trạng thái biểu cảm/hành động của thú cưng. |
| `assetPath` | `string` | Khớp mẫu `assets/pets/<petId>/<state>.png` và tệp tồn tại thực tế trên ổ đĩa | Đường dẫn tương đối tính từ thư mục gốc của ứng dụng. |
| `format` | `string` | Bắt buộc bằng `"png"` (chữ thường) | Định dạng tệp ảnh (kiểm tra magic bytes `89 50 4E 47`). |
| `width` | `number` | Số nguyên dương `>= 128` (chuẩn `256` hoặc `512`) | Chiều rộng thực tế đọc từ IHDR chunk của tệp PNG. |
| `height` | `number` | Số nguyên dương `>= 128` (chuẩn `256` hoặc `512`) | Chiều cao thực tế đọc từ IHDR chunk của tệp PNG. |
| `fileSize` | `number` | Số nguyên dương `> 1024` (bytes) | Kích thước tệp thực tế trên đĩa (`fs.statSync(path).size`). |
| `transparent` | `boolean` | Bắt buộc `true` (PNG colorType `6` RGBA và có pixel alpha `= 0` ở các góc biên) | Xác nhận ảnh có nền trong suốt thực sự. |
| `animationType` | `string` | Chuỗi không rỗng (`breathe_soft`, `head_tilt`, `bounce_play`, `munch_bob`, `sip_pulse`, `sleep_float`, `slow_sway`, `gentle_shiver`, `jump_celebrate`, `walk_trot`) | Kiểu hiệu ứng chuyển động CSS/SVG đi kèm khi hiển thị state này. |
| `fallbackState` | `string` | Thuộc tập 10 state chuẩn (thường là `"idle_happy"`) | Trạng thái dự phòng an toàn nếu tệp ảnh đang tải hoặc gặp lỗi mạng. |
| `verified` | `boolean` | Bắt buộc `true` sau khi vượt qua script kiểm tra tự động | Cờ xác nhận asset đã đạt chuẩn kỹ thuật & mỹ thuật. |
