# English Life World — UI Assets Report (P1)

Tài liệu quản lý và kiểm thử hình ảnh đồ vật 2.5D được tạo bởi **Antigravity** theo hợp đồng phân vùng tại [docs/COLLAB-PLAN.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/COLLAB-PLAN.md) và hướng dẫn phong cách tại [assets/ASSET-PROMPTS.md](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/ASSET-PROMPTS.md).

---

## 1. Tiêu chuẩn kỹ thuật áp dụng (Strict Constraints)
- **Định dạng:** PNG 32-bit có kênh alpha trong suốt (`RGBA`), đã tách nền hoàn chỉnh (Corner Alpha = 0).
- **Góc nhìn & Ánh sáng thống nhất:** Góc phối cảnh 2.5D nghiêng ~20° nhìn từ trên xuống, ánh sáng dịu từ phía trên bên trái (studio lighting), viền khối mềm mại mô phỏng đất nặn 3D (soft clay render), tông màu pastel ấm (cream, peach, warm wood, #e8743b).
- **Không chữ / logo:** 100% hình ảnh không chứa text, watermark hay logo.
- **Kích thước file:** Đảm bảo **≤ 200 KB** cho mỗi file (đạt 100% tiêu chí tối ưu web). Cạnh dài chuẩn tối đa 512px (đồ nhỏ 256px).
- **Căn lề:** Đáy đồ vật đặt sát mép dưới theo quy ước căn đáy giữa (`xMidYMax meet`) của game engine SVG.

---

## 2. Danh sách tài nguyên đã tạo (22 Assets)

### Đợt 1: Đồ vật phòng khách & Đạo cụ chính (Living Room & Core Props)
| ID | Tên file | Kích thước (WxH) | Dung lượng | Kênh Alpha | Phòng | `objectId` liên kết |
|---|---|---|---|---|---|---|
| `table` | [`assets/objects/table.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/table.png) | 512 × 315 | 126.6 KB | Có (Transparent) | living | `o-table` |
| `window` | [`assets/objects/window.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/window.png) | 460 × 512 | 42.1 KB | Có (Transparent) | living | `o-window` |
| `plant` | [`assets/objects/plant.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/plant.png) | 512 × 510 | 48.1 KB | Có (Transparent) | living | `o-plant` |
| `cup` | [`assets/objects/cup.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/cup.png) | 500 × 512 | 23.9 KB | Có (Transparent) | living | `o-cup` |
| `milk` | [`assets/objects/milk.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/milk.png) | 386 × 512 | 23.1 KB | Có (Transparent) | living | `o-fridge` |
| `book` | [`assets/objects/book.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/book.png) | 512 × 408 | 177.2 KB | Có (Transparent) | living | `o-book` |
| `broom` | [`assets/objects/broom.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/broom.png) | 231 × 512 | 101.6 KB | Có (Transparent) | living | `o-broom` |

### Đợt 2: Trạng thái & Nội thất (States & Furniture)
| ID | Tên file | Kích thước (WxH) | Dung lượng | Kênh Alpha | Phòng | `objectId` liên kết |
|---|---|---|---|---|---|---|
| `fridge-closed` | [`assets/objects/fridge-closed.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/fridge-closed.png) | 282 × 512 | 159.0 KB | Có (Transparent) | living | `o-fridge` |
| `fridge-open` | [`assets/objects/fridge-open.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/fridge-open.png) | 394 × 512 | 28.7 KB | Có (Transparent) | living | `o-fridge` |
| `chair` | [`assets/objects/chair.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/chair.png) | 338 × 512 | 146.8 KB | Có (Transparent) | living | `o-chair` |

### Đồ bếp, Thực phẩm & Đồ dùng nhiệm vụ (Kitchen & Quest Items)
| ID | Tên file | Kích thước (WxH) | Dung lượng | Kênh Alpha | Phòng | `objectId` liên kết |
|---|---|---|---|---|---|---|
| `stove-off` | [`assets/objects/stove-off.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/stove-off.png) | 512 × 371 | 25.6 KB | Có (Transparent) | kitchen | `o-stove` |
| `stove-on` | [`assets/objects/stove-on.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/stove-on.png) | 512 × 395 | 31.5 KB | Có (Transparent) | kitchen | `o-stove` |
| `pan` | [`assets/objects/pan.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/pan.png) | 512 × 314 | 113.8 KB | Có (Transparent) | kitchen | `o-stove` |
| `egg` | [`assets/food/egg.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/food/egg.png) *(+ bản sao tại objects/)* | 208 × 256 | 51.9 KB | Có (Transparent) | kitchen | `o-fridge` |
| `fried-egg` | [`assets/food/fried-egg.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/food/fried-egg.png) *(+ bản sao tại objects/)* | 512 × 423 | 30.6 KB | Có (Transparent) | kitchen | `o-stove` |
| `kettle` | [`assets/objects/kettle.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/kettle.png) | 466 × 512 | 29.2 KB | Có (Transparent) | kitchen | `o-kettle` |
| `coffee-cup` | [`assets/objects/coffee-cup.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/coffee-cup.png) | 512 × 422 | 29.5 KB | Có (Transparent) | kitchen | `o-diningtable` |
| `plate` | [`assets/objects/plate.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/plate.png) | 512 × 332 | 160.0 KB | Có (Transparent) | kitchen | `o-diningtable` |
| `cat-bowl` | [`assets/objects/cat-bowl.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/cat-bowl.png) | 512 × 471 | 44.3 KB | Có (Transparent) | living | `o-cat` |
| `watering-can` | [`assets/objects/watering-can.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/watering-can.png) | 512 × 434 | 192.2 KB | Có (Transparent) | garden | `o-wateringcan` |
| `laundry-basket` | [`assets/objects/laundry-basket.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/laundry-basket.png) | 512 × 443 | 57.1 KB | Có (Transparent) | bathroom | `o-laundrybasket` |
| `dish-sponge` | [`assets/objects/dish-sponge.png`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/objects/dish-sponge.png) | 512 × 377 | 37.1 KB | Có (Transparent) | kitchen | `o-sink` |

---

## 3. Tệp Manifest trung tâm (`assets/manifest.json`)
Tệp [`assets/manifest.json`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/manifest.json) đã được khởi tạo chứa đủ 22 mục với schema:
```json
[
  {
    "id": "string",
    "file": "string",
    "kind": "object|food|icon|npc|scene",
    "room": "string",
    "objectId": "string",
    "w": number,
    "h": number
  }
]
```

---

## 4. Các tệp còn thiếu cho các giai đoạn tiếp theo (Roadmap & Pending Assets)

Dưới đây là các tài nguyên chưa được tạo trong P1 (theo ASSET-PROMPTS.md), sẽ được bổ sung ở các giai đoạn sau:

1. **Đợt 3 — Bộ phận nhân vật hoạt hình (Modular Character Parts):**
   - `assets/character/head.png` (đầu + tóc)
   - `assets/character/torso.png` (thân, áo thun cam)
   - `assets/character/arm.png` (cánh tay buông thẳng)
   - `assets/character/leg.png` (chân có giày)

2. **Đợt 4 & P2 — Đồ nội thất phòng ngủ, phòng tắm, garage & vườn:**
   - Phòng ngủ (`bedroom`): `bed.png`, `pillow.png`, `blanket.png`, `wardrobe.png`, `alarmclock.png`
   - Phòng khách mở rộng: `tv.png`, `sofa.png`, `cat.png`, `phone.png`, `floorlamp.png`, `fan.png`, `remote.png`
   - Phòng tắm (`bathroom`): `bathtub.png`, `shower.png`, `toilet.png`, `toothbrush.png`, `bathmat.png`
   - Nhà xe (`garage`): `car.png`, `toolbox.png`, `carkeys.png`, `workbench.png`
   - Vườn (`garden`): `flowerpots.png`, `rosebush.png`, `wheelbarrow.png`, `gardengate.png`
   - Cảnh nền 2000×1280 (Scenes): `assets/scenes/living-room.png`, `assets/scenes/kitchen.png`

---

## 5. Hướng dẫn tích hợp cho Claude
- `ASSETS` trong `index.html` hoặc `loadAssets()` có thể nạp động trực tiếp từ [`assets/manifest.json`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/assets/manifest.json) qua `fetch('assets/manifest.json')`.
- Các ảnh trạng thái (`fridge-closed` vs `fridge-open`, `stove-off` vs `stove-on`) có thể hoán đổi thuộc tính `href` của thẻ `<image>` SVG tương ứng khi state thay đổi.
