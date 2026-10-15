# English Life World — UI Cafe Assets & Integration Guide (P3)

> **Phân vùng sở hữu:** Antigravity (Visual/UI Module Owner)  
> **Người nhận bàn giao:** Claude (`claude-desktop`)  
> **Tài liệu tham chiếu:** [docs/COLLAB-PLAN.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/COLLAB-PLAN.md), [docs/TOPICS-PLAN.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/TOPICS-PLAN.md), [docs/ui-topics.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/ui-topics.md)  
> **Trạng thái:** Hoàn tất 100% (Sửa bảo mật mã `ui-topics.js`, bộ ảnh `assets/cafe/`, cập nhật `assets/manifest.json`, kiểm thử tự động).

---

## 1. Sửa gấp trong `modules/ui-topics.js` (Bảo mật mã mở khóa)

Theo yêu cầu giữ kín mã mở khóa:
- **Đã gỡ bỏ:** Chip nút bấm `"Mã thử: 6789"` (`.uit-chip-code`) và toàn bộ sự kiện click tự động điền giá trị `6789` vào ô `#tsCode`.
- **Đã thay thế bằng:** Tiêu đề sạch sẽ `<span>🔒 Nhập mã 4 số để mở khóa chủ đề</span>`, không tiết lộ bất kỳ ký tự nào của mã.
- **Bảo toàn:**
  - Logic xác thực mã 4 số của Claude trong `index.html` (mã hợp lệ là `6789`, người dùng tự nhập thủ công).
  - Hiệu ứng rung lắc (`.uit-shake`) khi nhập sai hoặc khi bấm vào chủ đề đang khóa.
  - Banner chúc mừng khi mở khóa thành công.
- **Kiểm thử tự động bằng Playwright:**
  - `Chip count (.uit-chip-code)`: **0** (PASS).
  - `Exposed code in text`: **False** (PASS).

Ảnh chụp thực tế:
- Màn hình khóa (không lộ mã): [`docs/shot-topic-locked.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/shot-topic-locked.png)
- Màn hình sau khi người dùng nhập `6789` và chọn Quán cà phê: [`docs/shot-topic-unlocked.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/shot-topic-unlocked.png)

---

## 2. Danh sách bộ ảnh Quán Cà Phê (`assets/cafe/`)

Toàn bộ hình ảnh được thiết kế theo **ĐÚNG phong cách vẽ PHẲNG (flat 2.5D, nét mềm, màu kem, gỗ ấm, cam `#e8743b`)**, hoàn toàn không dùng hiệu ứng 3D đất nặn, góc nhìn đồng nhất với các phòng hiện có trong English Life World.

### 2.1. Cảnh nền chính (Background)
| File | Kích thước | Dung lượng | Mô tả |
|---|---|---|---|
| [`assets/cafe/cafe-bg.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/cafe-bg.png) | 2000 × 1280 | 490.8 KB | Nền quán cà phê góc phối cảnh 2.5D: tường kem, gạch thẻ subway tile trắng/mint, dầm gỗ trần, đèn thả ấm cúng, sàn gỗ parquet ziczac, cửa sổ kính lớn nhìn ra hàng cây xanh và vạt nắng xiên. **Hoàn toàn không có nhân vật hay đồ vật bấm được.** |

### 2.2. 12 đồ vật tương tác (PNG trong suốt, ≤150KB)
Tất cả 12 file đều có kênh alpha trong suốt (`RGBA`, 4 góc Alpha = 0), đáy phẳng/chân đế chuẩn 2.5D:

| ID | File | Kích thước | Dung lượng | Giới hạn | Kênh Alpha | `objectId` liên kết | Mô tả chi tiết |
|---|---|---|---|---|---|---|---|
| `menuboard` | [`assets/cafe/menuboard.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/menuboard.png) | 520 × 440 | 29.8 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-menuboard` | Bảng đen khung gỗ treo xích đồng, menu phấn màu chữ COFFEE, BAKERY, giá tiền rõ nét. |
| `barista` | [`assets/cafe/barista.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/barista.png) | 360 × 600 | 29.0 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-barista` | Nhân viên pha chế mỉm cười thân thiện, áo sơ mi trắng xắn tay, tạp dề nâu, tay cầm ca đánh sữa và cốc cà phê bốc khói. |
| `cafecounter` | [`assets/cafe/cafecounter.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/cafecounter.png) | 760 × 420 | 19.8 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-cafecounter` | Quầy bar phục vụ mặt gỗ sồi ấm áp, nan gỗ sọc dọc cao cấp, chân ốp đồng. |
| `cashregister` | [`assets/cafe/cashregister.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/cashregister.png) | 380 × 420 | 22.1 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-cashregister` | Máy POS màn hình cảm ứng, hiển thị giá `$4.50`, máy in hoá đơn và đầu chạm thẻ không tiếp xúc NFC. |
| `espressomachine` | [`assets/cafe/espressomachine.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/espressomachine.png) | 512 × 440 | 56.3 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-espressomachine` | Máy pha cà phê espresso 2 cần chuyên nghiệp, thân vỏ inox sáng bóng phối ốp cam `#e8743b`, đồng hồ áp suất, vòi đánh sữa, giá sấy ly phía trên. |
| `pastrycase` | [`assets/cafe/pastrycase.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/pastrycase.png) | 520 × 440 | 113.4 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-pastrycase` | Tủ kính cong trưng bày bánh ngọt: bánh sừng bò (croissant), bánh muffin socola, bánh quế cuộn (cinnamon roll), bánh tart trái cây. |
| `cupstack` | [`assets/cafe/cupstack.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/cupstack.png) | 360 × 480 | 31.7 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-cupstack` | Chồng tách sứ cà phê nhiều màu trên đĩa lót + cột ly giấy mang đi (takeaway cups) có đai giấy kraft và nắp đậy. |
| `condiments` | [`assets/cafe/condiments.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/condiments.png) | 460 × 380 | 16.9 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-condiments` | Khay gỗ đựng đồ pha: 2 bình inox giữ nhiệt (sữa tươi MILK, sữa yến mạch OAT), lọ đường rắc, que khuấy gỗ, hộp khăn giấy. |
| `cafetable` | [`assets/cafe/cafetable.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/cafetable.png) | 560 × 500 | 45.4 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-cafetable` | Bàn tròn cafe mặt gỗ chân gang uốn, 2 ghế bistro đệm nỉ (cam & kem), trên bàn có lọ hoa cúc nhỏ và tách cà phê. |
| `windowseat` | [`assets/cafe/windowseat.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/windowseat.png) | 640 × 480 | 27.0 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-windowseat` | Ghế bục băng dài cạnh cửa sổ, đệm chần bông màu kem, gối tựa cam `#e8743b`, bàn trà thấp kèm tạp chí mở. |
| `wifisign` | [`assets/cafe/wifisign.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/wifisign.png) | 360 × 420 | 22.3 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-wifisign` | Biển gỗ để bàn hình sóng Wi-Fi cam, in tên mạng `EnglishLifeCafe`, mật khẩu `latte123` và mã QR. |
| `recyclingbin` | [`assets/cafe/recyclingbin.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/recyclingbin.png) | 460 × 520 | 19.7 KB | ≤ 150 KB | Trong suốt (RGBA) | `o-recyclingbin` | Trạm phân loại rác 3 ngăn: Ly/cốc tái chế (xanh dương), Đổ nước thừa (xanh lá), Rác thông thường (cam). Phía trên có khay để khay đựng. |

### 2.3. 6 icon hành động (128×128 PNG trong suốt)
| File | Kích thước | Dung lượng | Tên hành động | Ý nghĩa & Đồ họa |
|---|---|---|---|---|
| [`assets/cafe/order.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/order.png) | 128 × 128 | 9.6 KB | `order` | Bảng gọi món kèm dấu tích hoàn tất và tách cà phê cam. |
| [`assets/cafe/pay.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/pay.png) | 128 × 128 | 9.4 KB | `pay` | Thẻ ngân hàng không tiếp xúc và đồng xu vàng may mắn. |
| [`assets/cafe/wait.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/wait.png) | 128 × 128 | 10.8 KB | `wait` | Đồng hồ đếm thời gian chờ pha chế chuẩn 10:10. |
| [`assets/cafe/pickup.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/pickup.png) | 128 × 128 | 10.6 KB | `pickup` | Khay phục vụ sẵn tách latte art bọt sữa hình trái tim và tia lấp lánh sẵn sàng nhận. |
| [`assets/cafe/sit.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/sit.png) | 128 × 128 | 9.9 KB | `sit` | Ghế bành thư giãn thoải mái trong quán cà phê. |
| [`assets/cafe/wifi.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/cafe/wifi.png) | 128 × 128 | 11.2 KB | `wifi` | Sóng Wi-Fi phát sóng mạnh mẽ kết nối Internet miễn phí. |

---

## 3. Cập nhật `assets/manifest.json`

File [`assets/manifest.json`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/manifest.json) đã được cập nhật từ **22 mục lên 35 mục**, giữ nguyên vẹn 100% các mục cũ của `living`, `kitchen`, `garden`, `bathroom`:
- Thêm 12 mục `kind: "object"`, `room: "cafe"` với các `objectId`: `o-menuboard`, `o-barista`, `o-cafecounter`, `o-cashregister`, `o-espressomachine`, `o-pastrycase`, `o-cupstack`, `o-condiments`, `o-cafetable`, `o-windowseat`, `o-wifisign`, `o-recyclingbin`.
- Thêm 1 mục `kind: "scene"`, `room: "cafe"` cho `cafe-bg.png` (`shell-cafe`).

---

## 4. Báo cáo so sánh trực quan & Ảnh chụp thực tế (Visual Comparison)

Hình ảnh đối chiếu thực tế được tổng hợp tại:
- **Ảnh chụp cảnh SVG thực tế trong `index.html`:** [`docs/shot-cafe-actual-room.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/shot-cafe-actual-room.png) (mở `index.html`, mở khóa mã `6789`, chọn chủ đề Quán cà phê, nạp đủ 12 đồ vật SVG có hitbox và tương tác).
- **Ảnh so sánh đối chiếu đồ họa:** [`docs/cafe-scene-comparison.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/cafe-scene-comparison.png) và harness tương tác [`docs/cafe-preview.html`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/cafe-preview.html).

### So sánh cụ thể:
1. **Cảnh SVG vector hiện tại (`modules/topic-cafe.js` / `assets/topics/cafe.svg`):**
   - Đồ họa vector hình học dạng sơ khai dùng các thẻ `<rect>`, `<path>` nội tuyến, màu sắc cơ bản.
   - Thích hợp làm bộ khung logic, fallback nhẹ khi mạng yếu hoặc chế độ low-power.
   - 12 đồ vật được bố trí tại các tọa độ:
     - `menuboard` (x: 330, y: 40, w: 300, h: 130)
     - `barista` (x: 400, y: 60, w: 84, h: 210)
     - `cafecounter` (x: 262, y: 268, w: 446, h: 100)
     - `cashregister` (x: 282, y: 206, w: 96, h: 70)
     - `espressomachine` (x: 484, y: 176, w: 114, h: 100)
     - `pastrycase` (x: 382, y: 206, w: 90, h: 70)
     - `cupstack` (x: 636, y: 200, w: 70, h: 76)
     - `condiments` (x: 150, y: 236, w: 110, h: 130)
     - `cafetable` (x: 330, y: 420, w: 200, h: 140)
     - `windowseat` (x: 770, y: 40, w: 220, h: 330)
     - `wifisign` (x: 650, y: 60, w: 80, h: 80)
     - `recyclingbin` (x: 860, y: 494, w: 120, h: 132)
2. **Bộ ảnh 2.5D mới (`assets/cafe/`):**
   - Cảnh nền `cafe-bg.png` độ phân giải cao 2000×1280 (chuẩn tỉ lệ 25:16 với viewBox 1000×640), ánh sáng studio tự nhiên, tường gạch thẻ trắng/mint, dầm gỗ trần và vạt nắng xiên từ cửa sổ lớn.
   - 12 đồ vật PNG tách nền độc lập, chi tiết tinh xảo (bánh ngọt trong tủ kính, latte art trong tách sứ, đồng hồ áp suất máy pha cà phê, vệt bọt sữa, nút bấm quẹt thẻ POS).
   - Tối ưu web vượt trội: Mỗi sprite chỉ từ 16.9 KB đến 113.4 KB (hoàn toàn dưới trần 150 KB).
   - Bộ 6 icon hành động 128×128px sắc nét, đồng bộ phong cách với game.

---

## 5. Hướng dẫn tích hợp tiếp theo cho Claude (`modules/topic-cafe.js`)

Khi Claude triển khai logic và gắn ảnh trong `modules/topic-cafe.js` hoặc `index.html`:
```js
// Gắn ảnh nền
const bg = document.querySelector("#shell-cafe image") || ...;
// Nạp các sprite đồ vật từ assets/cafe/<id>.png
const item = ASSETS.find(a => a.objectId === "o-espressomachine");
```
Mọi sprite đã sẵn sàng trên đĩa và được đăng ký trong manifest.
