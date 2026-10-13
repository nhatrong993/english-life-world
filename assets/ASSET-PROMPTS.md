# English Life World — Prompt tạo ảnh cho Antigravity

App **tự dùng ảnh thật nếu tìm thấy file đúng tên**. Chưa có thì vẫn dùng hình vẽ tạm,
nên bạn có thể tạo dần từng ảnh. Không cần sửa code.

## Quy tắc chung (dán kèm MỌI prompt)

> STYLE: cozy 2.5D cartoon life-simulation game asset, soft clay-like 3D render,
> pastel warm palette (cream, peach, warm wood, soft orange #e8743b accents),
> soft studio lighting from the upper left, gentle ambient occlusion, rounded friendly shapes,
> clean silhouette, three-quarter front view seen slightly from above (about 20°),
> object facing the viewer, centered, full object visible, TRANSPARENT BACKGROUND (PNG with alpha),
> no text, no logo, no watermark, no people unless asked, no floor shadow baked in
> (or only a very soft contact shadow directly under the object).

- Định dạng: **PNG nền trong suốt**, cạnh dài khoảng 512 px (đồ nhỏ thì 256 px là đủ).
- Mỗi đồ vật nằm sát khung ảnh, đáy đồ vật chạm mép dưới. App căn ảnh theo đáy giữa.
- Tất cả ảnh dùng **cùng một hướng ánh sáng và cùng góc nhìn** để ghép vào phòng không bị lệch.
- Lưu vào đúng thư mục và tên file dưới đây (chữ thường, có gạch ngang).

## Đợt 1 — app đã đọc sẵn (thả file vào là thấy ngay)

| Tên file | Prompt (sau phần STYLE) |
|---|---|
| `assets/objects/table.png` | a low rectangular wooden coffee table, warm medium-brown wood, four legs, empty top |
| `assets/objects/window.png` | a closed wooden window with two glass panes and a small sill, light blue sky and green hill seen through the glass, front view |
| `assets/objects/plant.png` | a leafy green potted plant in a terracotta pot, medium size |
| `assets/objects/cup.png` | a simple white ceramic mug with a handle on the right, empty, small |
| `assets/objects/milk.png` | a small milk carton, white with a light blue band, gable top |
| `assets/objects/book.png` | a closed blue hardcover book lying flat, seen from above at 20° |
| `assets/objects/broom.png` | a household broom standing upright, wooden handle, yellow straw bristles at the bottom |

## Đợt 2 — cần mình nối thêm code (gửi ảnh xong báo mình)

Những đồ vật này có **nhiều trạng thái**, nên mỗi trạng thái cần một ảnh riêng với cùng kích thước khung và cùng vị trí:

| Tên file | Prompt |
|---|---|
| `assets/objects/fridge-closed.png` | a tall white two-door refrigerator, doors closed, rounded corners, a small sticky note on the door |
| `assets/objects/fridge-open.png` | the SAME refrigerator with the main door swung open to the right, interior visible: white shelves, a milk carton, eggs, an apple, an orange |
| `assets/objects/chair.png` | a simple wooden dining chair with an orange seat cushion and backrest, side three-quarter view facing left |
| `assets/scenes/living-room.png` | an EMPTY cozy living room and kitchen corner, isometric-like three-quarter view, cream walls, warm wooden floor, a pink round rug in the middle, a kitchen counter with cabinets at the back right, NO furniture in the center, NO people. Size 2000×1280, not transparent |

## Đợt 3 — nhân vật (để nhân vật đẹp như game)

Nhân vật hiện được ghép từ các bộ phận (thân, tay, chân) để cử động được. Muốn thay bằng ảnh thật thì cần **mỗi bộ phận một file**, cùng phong cách:

> a friendly young Vietnamese adult cartoon character, short dark-brown hair, orange t-shirt, dark-blue trousers, brown shoes, side three-quarter view facing RIGHT, same character in every image

| Tên file | Nội dung |
|---|---|
| `assets/character/head.png` | chỉ phần đầu và tóc |
| `assets/character/torso.png` | chỉ phần thân, không có tay |
| `assets/character/arm.png` | một cánh tay buông thẳng xuống, có bàn tay |
| `assets/character/leg.png` | một cái chân có giày |

## Đợt 4 — 6 đồ vật tiếp theo

Thêm sau khi bạn duyệt lát cắt đầu tiên:
`cat.png`, `cat-bowl.png`, `phone.png`, `door-closed.png`, `door-open.png`, `shirt.png`, `bed.png`, `pillow.png`, `blanket.png`.

## Kiểm tra sau khi thả ảnh vào

Mở app, bấm F12 và xem tab Console. Dòng `[assets]` cho biết từng ảnh là `ok` (đã dùng) hay `missing` (chưa thấy file, kiểm tra lại tên).
