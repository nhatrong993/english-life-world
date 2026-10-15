# English Life World — UI People, Weather & Menu Assets Guide (P5)

> **Phân vùng sở hữu:** Antigravity (Visual/UI Module Owner)  
> **Người nhận bàn giao:** Claude (`claude-desktop`)  
> **Tài liệu tham chiếu:** [docs/COLLAB-PLAN.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/COLLAB-PLAN.md), [docs/TOPICS-PLAN.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/TOPICS-PLAN.md), [docs/ui-cafe.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/ui-cafe.md)  
> **Trạng thái:** Hoàn tất 100% (12 nhân vật PNG, 4 lớp phủ thời tiết SVG 1000×640, 5 icon thời tiết 96px, 27 icon đồ ăn/uống & siêu thị 128px, cập nhật `assets/manifest.json` lên 83 mục, kiểm thử tự động).

---

## 1. Tổng quan thiết kế & Quy chuẩn đồ họa (Visual Style)

Toàn bộ tài nguyên đồ họa mới tuân thủ nghiêm ngặt **phong cách PHẲNG 2.5D (flat 2.5D, nét mềm, màu kem, gỗ ấm, cam `#e8743b`, xanh mint `#5bb698`)** giống bộ giao diện Quán Cà Phê trong [docs/ui-cafe.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/ui-cafe.md) và `modules/topic-cafe.js`:
- **Độ phân giải & định dạng:** PNG chuẩn 32-bit trong suốt (`RGBA`, 4 góc Alpha = 0) và SVG vector siêu nhẹ.
- **Giới hạn dung lượng:** 100% file đều **dưới 30 KB** (trần tối đa cho phép là 150 KB).
- **Tương thích phối cảnh:** Đáy phẳng hoặc chân đế tiếp xúc mặt sàn chuẩn 2.5D, góc nhìn 3/4 ấm áp thân thiện, tích hợp hiệu ứng đổ bóng mềm (`feDropShadow`).

---

## 2. Danh mục 12 Nhân vật (`assets/people/`)

Kích thước chuẩn: **360 × 600 px**, định dạng PNG trong suốt (RGBA), bóng chân tích hợp sẵn.

| ID | File | Kích thước | Dung lượng | Alpha | Mô tả & Biểu cảm |
|---|---|---|---|---|---|
| `linh-standing` | [`assets/people/linh-standing.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/linh-standing.png) | 360 × 600 | 28.4 KB | RGBA (Trong suốt) | **Bạn đồng hành Linh** đứng chờ: tóc ngắn hạt dẻ, kẹp tóc cam `#e8743b`, áo sơ mi xanh mint cổ Peter-Pan trắng, quần jeans xắn gấu, sneaker trắng viền cam, nụ cười nhẹ nhàng chào đón. |
| `linh-talking` | [`assets/people/linh-talking.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/linh-talking.png) | 360 × 600 | 29.0 KB | RGBA (Trong suốt) | **Bạn Linh đang nói/hướng dẫn**: tay đưa ra phía trước cử chỉ giải thích từ vựng tiếng Anh, miệng hé mở nói chuyện sinh động, có tia cảm xúc nhẹ. |
| `linh-smiling` | [`assets/people/linh-smiling.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/linh-smiling.png) | 360 × 600 | 28.4 KB | RGBA (Trong suốt) | **Bạn Linh cười rạng rỡ**: mắt híp hình trăng khuyết vui mừng ("Great job!"), tay giơ cao vẫy chào vui vẻ, tay kia đặt lên ngực chúc mừng người học hoàn thành nhiệm vụ. |
| `linh-holding-cup` | [`assets/people/linh-holding-cup.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/linh-holding-cup.png) | 360 × 600 | 26.3 KB | RGBA (Trong suốt) | **Bạn Linh cầm ly cà phê**: hai tay nâng tách cà phê gốm sứ màu cam ấm `#e8743b`, làn khói trắng bốc lên thơm ngát, biểu cảm thư thái nhâm nhi đồ uống trong quán. |
| `visitor-elderly-neighbor` | [`assets/people/visitor-elderly-neighbor.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/visitor-elderly-neighbor.png) | 360 × 600 | 27.0 KB | RGBA (Trong suốt) | **Hàng xóm lớn tuổi**: ông/bà cụ hiền hậu, tóc bạc xoăn mềm, kính gọng tròn vàng kim, áo len dệt vặn thừng màu nâu caramel ấm áp, tay cầm giỏ mây đựng bánh mì baguette và hoa tươi, tay kia chống gậy gỗ. |
| `visitor-old-friend` | [`assets/people/visitor-old-friend.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/visitor-old-friend.png) | 360 × 600 | 23.5 KB | RGBA (Trong suốt) | **Bạn cũ bất ngờ ghé thăm**: bạn trẻ năng động, áo khoác bomber thể thao phối cam `#e8743b` và xanh navy, đeo balo một bên vai, tay giơ cao vẫy chào mừng rỡ ("Long time no see!"). |
| `visitor-shipper` | [`assets/people/visitor-shipper.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/visitor-shipper.png) | 360 × 600 | 22.5 KB | RGBA (Trong suốt) | **Shipper giao bưu kiện**: áo khoác đồng phục xanh lục phối dải phản quang vàng, mũ lưỡi trai cam năng động, túi đeo chéo, hai tay ôm hộp bưu kiện bọc giấy kraft dán tem vận chuyển. |
| `visitor-tourist` | [`assets/people/visitor-tourist.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/visitor-tourist.png) | 360 × 600 | 26.9 KB | RGBA (Trong suốt) | **Khách du lịch quốc tế**: mũ vành dã ngoại màu kem be, áo phông sọc ngang thủy thủ xanh-trắng, máy ảnh da đeo cổ, hai tay giở rộng tấm bản đồ thành phố có ghim đỏ hỏi đường. |
| `barista-brewing` | [`assets/people/barista-brewing.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/barista-brewing.png) | 360 × 600 | 27.1 KB | RGBA (Trong suốt) | **Barista đang pha chế**: đứng nghiêng tại quầy bar, sơ mi trắng xắn tay, tạp dề barista nâu da bò sẫm, một tay cầm ca đánh sữa inox tạo bọt microfoam, một tay cầm tay cầm portafilter máy espresso. |
| `barista-serving` | [`assets/people/barista-serving.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/barista-serving.png) | 360 × 600 | 24.9 KB | RGBA (Trong suốt) | **Barista đang phục vụ**: hai tay nâng khay gỗ tròn trên có tách latte art hình trái tim bốc khói và bánh sừng bò nướng vàng, nụ cười thân thiện trao đồ cho khách ("Here is your latte!"). |
| `cashier-greeting` | [`assets/people/cashier-greeting.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/cashier-greeting.png) | 360 × 600 | 21.2 KB | RGBA (Trong suốt) | **Thu ngân chào khách**: áo polo đồng phục kem viền cam lịch sự, bảng tên ngực, cử chỉ tay mở rộng chào đón ("Welcome! Can I take your order?"). |
| `cashier-pos` | [`assets/people/cashier-pos.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/people/cashier-pos.png) | 360 × 600 | 22.7 KB | RGBA (Trong suốt) | **Thu ngân tính tiền**: một tay thao tác chạm màn hình máy POS cảm ứng, tay kia cầm hóa đơn in ra đưa cho khách, hiển thị giá tiền cần thanh toán. |

### Gợi ý vị trí đặt trong cảnh 1000 × 640 (Coordinate Placement Guide):

| Nhân vật | Cảnh phù hợp | Tọa độ gợi ý (x, y, w, h) | Depth (z-index / DOM order) | Ghi chú tương tác |
|---|---|---|---|---|
| `linh-standing` | `cafe`, `living`, `market`, `park` | `x: 640, y: 340, w: 140, h: 233` | Trên sàn, trước bàn ghế | Bạn đồng hành đứng cạnh người học để hỗ trợ |
| `linh-talking` | Bất kỳ cảnh nào | `x: 640, y: 340, w: 140, h: 233` | Cùng slot với standing | Đổi sprite khi hiển thị bong bóng thoại ELW_UI_SCENE.bubble |
| `linh-smiling` | Bất kỳ cảnh nào | `x: 640, y: 340, w: 140, h: 233` | Cùng slot | Hiện khi người học hoàn thành nhiệm vụ hoặc trả lời đúng |
| `linh-holding-cup` | `cafe` (ghế bục cửa sổ hoặc bàn) | `x: 770, y: 220, w: 150, h: 250` | Ngồi ở khu vực windowseat | Thưởng thức đồ uống sau khi đã nhận món |
| `visitor-elderly-neighbor` | `living` (cửa vào hoặc sô-pha), `market` | `x: 180, y: 360, w: 140, h: 233` | Góc trái phòng khách | Ghé thăm nhà hỏi thăm hoặc mua sắm tại siêu thị |
| `visitor-old-friend` | `cafe`, `living` | `x: 200, y: 350, w: 145, h: 242` | Gần cửa ra vào | Kích hoạt hội thoại gặp gỡ bạn cũ |
| `visitor-shipper` | `living` (cửa chính), `cafe` | `x: 140, y: 350, w: 140, h: 233` | Cửa ra vào phòng khách | Giao kiện hàng đồ ăn hoặc bưu phẩm |
| `visitor-tourist` | `cafe`, `park`, `street` | `x: 220, y: 360, w: 140, h: 233` | Trước quầy bar hoặc ghế đá | Hỏi đường hoặc hỏi mật khẩu Wi-Fi |
| `barista-brewing` | `cafe` (khu vực máy espresso) | `x: 480, y: 90, w: 120, h: 200` | Sau quầy bar, cạnh máy espresso | Đang đánh sữa pha cà phê |
| `barista-serving` | `cafe` (khu vực nhận đồ pickup) | `x: 410, y: 90, w: 120, h: 200` | Sau quầy bar, cạnh quầy lấy đồ | Đang mang ly đồ uống ra cho người học |
| `cashier-greeting` | `cafe` (khu vực máy POS), `market` | `x: 270, y: 90, w: 120, h: 200` | Sau quầy thu ngân | Chào khách và nhận gọi món |
| `cashier-pos` | `cafe` (máy POS), `market` (quầy cân/thanh toán) | `x: 270, y: 90, w: 120, h: 200` | Sau quầy thu ngân | Xuất hóa đơn và quẹt thẻ ngân hàng |

---

## 3. Danh mục Lớp phủ & Icon Thời tiết (`assets/weather/`)

### 3.1. 4 Lớp phủ toàn cảnh 1000 × 640 SVG (Overlays)
Mọi file overlay đều có `style="pointer-events: none;"` để không ngăn cản thao tác bấm vào đồ vật bên dưới:

| File | Kích thước | Dung lượng | Mô tả hiệu ứng đồ họa |
|---|---|---|---|
| [`assets/weather/rain.svg`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/rain.svg) | 1000 × 640 | 20.0 KB | Lớp mưa rào: 120 vệt mưa xiên đa tầng độ sâu, các vòng tròn gợn sóng nước bắn nhẹ trên sàn (splash ripples), lớp màu ám xanh mờ tạo cảm giác ngày mưa mát mẻ. |
| [`assets/weather/cold.svg`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/cold.svg) | 1000 × 640 | 6.7 KB | Lớp trời lạnh: viền sương giá băng tuyết mờ ở 4 góc màn hình, những bông tuyết tinh thể 6 cánh lấp lánh rơi chậm, các cụm hơi thở sương khói ngưng tụ mềm mại trong không khí. |
| [`assets/weather/sunny.svg`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/sunny.svg) | 1000 × 640 | 2.4 KB | Lớp trời nắng gắt: vạt nắng vàng xiên lung linh từ góc trên bên phải chiếu xuống sàn phòng, hiệu ứng hào quang lóa nhẹ (sun flare) và các hạt bụi nắng lấp lánh (sparkles). |
| [`assets/weather/windy.svg`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/windy.svg) | 1000 × 640 | 4.6 KB | Lớp gió lộng: các dải gió khí động học uốn lượn mềm mại kèm lốc xoáy nhỏ, 10 chiếc lá cây vàng thu và xanh lá rụng bay xoay vòng theo làn gió. |

### 3.2. 5 Icon thời tiết (96 × 96 px PNG trong suốt)

| ID | File | Kích thước | Dung lượng | Mô tả biểu tượng |
|---|---|---|---|---|
| `weather-sunny-icon` | [`assets/weather/weather-sunny.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/weather-sunny.png) | 96 × 96 | 6.1 KB | Mặt trời vàng cam 2.5D ấm áp với các tia nắng tròn đều rạng rỡ. |
| `weather-rainy-icon` | [`assets/weather/weather-rainy.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/weather-rainy.png) | 96 × 96 | 4.2 KB | Đám mây xám xanh ngậm mưa cùng các hạt mưa xanh biếc rơi xuống. |
| `weather-cold-icon` | [`assets/weather/weather-cold.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/weather-cold.png) | 96 × 96 | 5.8 KB | Tinh thể bông tuyết 6 cánh màu xanh băng tuyết lấp lánh sắc sảo. |
| `weather-windy-icon` | [`assets/weather/weather-windy.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/weather-windy.png) | 96 × 96 | 5.0 KB | Luồng gió xoáy xanh dương cuốn theo chiếc lá phong vàng cam bay lượn. |
| `weather-cloudy-icon` | [`assets/weather/weather-cloudy.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/weather/weather-cloudy.png) | 96 × 96 | 3.9 KB | Mặt trời lấp ló sau đám mây trắng xốp bồng bềnh dịu mát. |

---

## 4. Danh mục 27 Icon Đồ uống, Đồ ăn & Siêu thị (`assets/menu/`)

Kích thước chuẩn: **128 × 128 px**, PNG nền trong suốt (RGBA), bóng đổ 2.5D tự nhiên (`feDropShadow`).

### 4.1. Đồ uống & Bánh ngọt Quán Cà Phê (14 món)
| ID | File | Dung lượng | Tên tiếng Anh | Mô tả chi tiết đồ họa |
|---|---|---|---|---|
| `menu-espresso` | [`assets/menu/espresso.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/espresso.png) | 7.4 KB | Espresso | Tách demitasse gốm cam viền đĩa sứ, lớp bọt crema vàng nâu sánh mịn bốc khói. |
| `menu-americano` | [`assets/menu/americano.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/americano.png) | 5.4 KB | Americano | Ly cà phê đen đá trong suốt với những viên đá vuông óng ánh. |
| `menu-cappuccino` | [`assets/menu/cappuccino.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/cappuccino.png) | 7.0 KB | Cappuccino | Tách sứ xanh mint, bọt sữa trắng muốt rắc bột quế & cacao nâu thơm phức. |
| `menu-latte` | [`assets/menu/latte.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/latte.png) | 6.7 KB | Latte | Tách cafe kem miệng rộng với latte art hình trái tim trắng tinh tế. |
| `menu-mocha` | [`assets/menu/mocha.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/mocha.png) | 4.0 KB | Mocha | Ly thủy tinh chân cao phân tầng socola, cafe và ngọn kem tươi phủ sốt socola. |
| `menu-matcha-latte` | [`assets/menu/matcha-latte.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/matcha-latte.png) | 3.5 KB | Matcha Latte | Ly gốm mộc với lớp trà xanh matcha Nhật Bản tươi mát và nghệ thuật tạo bọt lá cây. |
| `menu-hot-chocolate` | [`assets/menu/hot-chocolate.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/hot-chocolate.png) | 6.9 KB | Hot Chocolate | Ly sứ đỏ ấm cúng chứa socola nóng bốc khói cùng các viên kẹo dẻo marshmallow trắng. |
| `menu-iced-tea` | [`assets/menu/iced-tea.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/iced-tea.png) | 5.7 KB | Iced Tea | Ly trà đào/trà chanh đá màu hổ phách, lát chanh vàng tươi viền miệng ly và lá bạc hà. |
| `menu-lemonade` | [`assets/menu/lemonade.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/lemonade.png) | 4.3 KB | Lemonade | Ly nước chanh vàng ươm mọng nước, lát chanh tươi và ống hút sọc cam-trắng. |
| `menu-smoothie` | [`assets/menu/smoothie.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/smoothie.png) | 4.3 KB | Smoothie | Ly sinh tố dâu tây màu hồng san hô, kem tươi đánh bông và quả dâu tươi trang trí. |
| `menu-croissant` | [`assets/menu/croissant.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/croissant.png) | 3.8 KB | Croissant | Bánh sừng bò nướng phồng vàng ruộm, xếp nhiều nếp bơ thơm giòn. |
| `menu-muffin` | [`assets/menu/muffin.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/muffin.png) | 4.6 KB | Muffin | Bánh muffin socola nở bung trong cup giấy xếp ly, đính những hạt chocolate chip nâu. |
| `menu-cheesecake` | [`assets/menu/cheesecake.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/cheesecake.png) | 2.7 KB | Cheesecake | Miếng bánh phô mai New York tam giác mềm mịn, đế bánh quy bơ và sốt dâu đỏ mọng. |
| `menu-banana-bread` | [`assets/menu/banana-bread.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/banana-bread.png) | 3.2 KB | Banana Bread | Lát bánh mì chuối nướng màu nâu mật ong, thớ bánh ẩm mịn đính hạt óc chó giòn. |

### 4.2. Hàng hóa Siêu thị (13 mặt hàng)
| ID | File | Dung lượng | Tên tiếng Anh | Mô tả chi tiết đồ họa |
|---|---|---|---|---|
| `market-apple` | [`assets/menu/apple.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/apple.png) | 5.5 KB | Apple | Quả táo đỏ tươi căng mọng, cuống nâu và chiếc lá xanh non điểm xuyết. |
| `market-banana` | [`assets/menu/banana.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/banana.png) | 5.3 KB | Banana | Nải chuối vàng ươm cong vút, đầu cuống xanh tươi mới hái. |
| `market-mango` | [`assets/menu/mango.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/mango.png) | 5.0 KB | Mango | Quả xoài cát chín vàng ửng hồng cam ngọt ngào. |
| `market-orange` | [`assets/menu/orange.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/orange.png) | 6.6 KB | Orange | Quả cam mọng nước tròn trịa kèm nửa lát cam cắt lộ rõ tép cam mọng. |
| `market-rice` | [`assets/menu/rice.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/rice.png) | 4.8 KB | Rice | Bao gạo vải bố mộc mạc thắt dây gai, in hình bông lúa và chữ RICE rõ nét. |
| `market-egg` | [`assets/menu/egg.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/egg.png) | 4.1 KB | Eggs | Vỉ đựng 4 quả trứng gà tươi màu nâu hồng tự nhiên. |
| `market-milk` | [`assets/menu/milk.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/milk.png) | 2.7 KB | Fresh Milk | Hộp sữa tươi tiệt trùng hình khối đứng màu xanh dương-trắng có nắp vặn. |
| `market-bread` | [`assets/menu/bread.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/bread.png) | 5.4 KB | Baguette Bread | Ổ bánh mì baguette Pháp dài nướng vàng giòn, rắc bột mì trắng trên các khía rạch. |
| `market-snack` | [`assets/menu/snack.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/snack.png) | 4.8 KB | Potato Chips Snack | Gói snack khoai tây chiên phồng màu cam rực rỡ, miệng dập răng cưa giòn tan. |
| `market-laundry-detergent` | [`assets/menu/laundry-detergent.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/laundry-detergent.png) | 3.7 KB | Laundry Detergent | Bình nước giặt đậm đặc màu xanh ngọc có quai xách công thái học và nắp đong trong suốt. |
| `market-tissue-paper` | [`assets/menu/tissue-paper.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/tissue-paper.png) | 5.1 KB | Facial Tissues | Hộp khăn giấy rút tiện lợi màu xanh bạc hà pastel, tờ khăn giấy trắng mềm mại nhô ra. |
| `market-meat` | [`assets/menu/meat.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/meat.png) | 5.1 KB | Fresh Meat | Khay xốp đựng miếng thịt bò tươi màu đỏ thẫm vân mỡ cẩm thạch bọc màng co và tem mã vạch. |
| `market-fish` | [`assets/menu/fish.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/menu/fish.png) | 5.1 KB | Fresh Fish | Cá biển tươi nguyên con màu xanh bạc óng ánh trên đá lạnh kèm lát chanh tươi. |

---

## 5. Cập nhật `assets/manifest.json`

File [`assets/manifest.json`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/manifest.json) đã được mở rộng từ **35 mục lên 83 mục**:
- **Bảo toàn nguyên vẹn 100%:** 35 mục cũ thuộc các phòng `living`, `kitchen`, `garden`, `bathroom`, `cafe`.
- **48 mục mới bổ sung:**
  - 12 mục `kind: "npc"` cho nhân vật bạn Linh, khách ghé thăm, barista và thu ngân.
  - 4 mục `kind: "scene"` cho các lớp phủ thời tiết toàn cảnh SVG (`weather-rain`, `weather-cold`, `weather-sunny`, `weather-windy`).
  - 5 mục `kind: "icon"` cho các biểu tượng thời tiết 96px.
  - 27 mục `kind: "icon"` cho menu đồ uống, bánh ngọt quán cafe và hàng hóa siêu thị.

---

## 6. Hướng dẫn tích hợp cho Claude

### 6.1. Hiển thị bạn Linh và khách ghé thăm trong cảnh SVG
```html
<!-- Bạn đồng hành Linh trong quán cafe hoặc phòng khách -->
<g id="npc-linh" class="npc-group" data-base="420">
  <image id="linh-sprite" href="assets/people/linh-standing.png" 
         x="640" y="340" width="140" height="233" 
         preserveAspectRatio="xMidYMid meet" style="pointer-events:none;"/>
  <!-- Hitbox nhỏ ở phần đầu/ngực để bắt sự kiện click nói chuyện -->
  <circle class="np-hit" cx="710" cy="400" r="35" fill="transparent" cursor="pointer"
          onclick="ELW_UI_SCENE.bubble('npc:linh', { who:'Linh', en:'What would you like to drink today?', vi:'Hôm nay bạn muốn uống gì nào?' })"/>
</g>
```

### 6.2. Kích hoạt hiệu ứng thời tiết toàn cảnh
```js
// Bật lớp phủ thời tiết (ví dụ: trời mưa)
function setWeather(weatherId) {
  let overlay = document.querySelector("#weather-overlay");
  if (!overlay) {
    overlay = document.createElementNS("http://www.w3.org/2000/svg", "image");
    overlay.setAttribute("id", "weather-overlay");
    overlay.setAttribute("x", "0");
    overlay.setAttribute("y", "0");
    overlay.setAttribute("width", "1000");
    overlay.setAttribute("height", "640");
    overlay.setAttribute("style", "pointer-events: none; z-index: 100;");
    document.querySelector("#world").appendChild(overlay);
  }
  overlay.setAttribute("href", `assets/weather/${weatherId}.svg`);
}
// Ví dụ: setWeather("rain"); setWeather("sunny"); setWeather("cold"); setWeather("windy");
```

### 6.3. Nạp Icon Menu vào giao diện chọn món / Thẻ nhiệm vụ
```js
// Lấy icon từ manifest
const latteIcon = ASSETS.find(a => a.id === "menu-latte").file; // "assets/menu/latte.png"
const appleIcon = ASSETS.find(a => a.id === "market-apple").file; // "assets/menu/apple.png"
```

---

## 7. Kết quả kiểm thử & Trang xem trước trực quan (Visual Harness)

- **Trang HTML xem trước tương tác:** [`docs/people-preview.html`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/people-preview.html)  
  Hiển thị đầy đủ lưới 12 nhân vật, 5 icon thời tiết, cảnh ghép thử thực tế (Nền quán cà phê + Lớp phủ Mưa `rain.svg` + Bạn Linh cầm ly + Barista phục vụ + Khách du lịch), 14 món cafe và 13 mặt hàng siêu thị.
- **Ảnh chụp kiểm thử toàn bộ giao diện:** [`docs/shot-people-preview.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/shot-people-preview.png)
- **Kiểm thử tự động bằng script Python:**
  - 100% 83 file trong manifest tồn tại trên đĩa.
  - 100% 48 file mới có dung lượng $\le 29$ KB (vượt xa giới hạn 150 KB).
  - 100% file PNG có kênh Alpha trong suốt ở các góc.
