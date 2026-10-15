# Kế hoạch Triển khai A1: Pet Personality (`docs/PET25D_PLAN_A1.md`)

## 1. File Dự kiến Sửa / Tạo mới
- **Tạo mới**: `modules/pet-personality.js` (DUY NHẤT file này do A1 phụ trách).

## 2. Giải pháp Kỹ thuật

### 2.1. Hồ sơ Tính cách 10 Pet (`PROFILES`)
Mỗi pet trong 10 pet (`milu`, `boba`, `cookie`, `mochi`, `pepper`, `oreo`, `ember`, `lumi`, `pip`, `aqua`) có cấu trúc:
- `id`, `name`, `species` (`dog`, `cat`, `dragon`, `unicorn`, `fox`, `otter`)
- `loves`: `{ actions: [], rooms: [], items: [], weather: [] }`
- `likes`: `{ actions: [], rooms: [], items: [], weather: [] }`
- `dislikes`: `{ actions: [], rooms: [], items: [], weather: [] }`
- `lines`: Bộ câu thoại ngắn tiếng Anh (`lineEn`) và tiếng Việt (`lineVi`) theo ngữ cảnh (`fish`, `milk`, `park_ball`, `water_bath`, `warm_food`, `cold_snow`, `sweet_cafe`, `default_love`, `default_like`, `default_neutral`, `default_dislike`).

Chi tiết nổi bật theo yêu cầu:
1. **`mochi` (Mèo trắng kem)**:
   - **Love**: cá/hải sản (`fish`, `salmon`, `tuna`, `shrimp`, `order_fresh_salmon`, `buy_some_fish`, `check_meat_price`, `grill_the_fish`), sữa (`milk`, `buy_fresh_milk`, `warm_milk`), ngủ/chỗ ấm (`sofa`, ` fireplace`, `sunny`).
   - **Like**: `market_meat`, `market_dairy`, `living`, `bedroom`, vuốt ve (`pet_cat`, `brush_cat`).
   - **Dislike**: nước/tắm/mưa (`water`, `bath`, `shower`, `take_a_shower`, `wash_hair`, `rain`, `rainy`, `swim`, `puddle`).
2. **`pepper` (Mèo mướp cam)** & **`oreo` (Mèo tuxedo)**:
   - Thích cá, sữa, thịt ở `market_meat`/`market_dairy`, thích chỗ ấm áp; ghét bị ướt/tắm nước (`bath`, `shower`, `water`, `rainy`).
3. **`milu` (Chó Corgi vàng)**:
   - **Love**: công viên (`park`), ném bóng / bắt bóng (`throw_the_ball`, `play_fetch`, `ball`, `frisbee`, `run_in_park`, `walk_the_dog`), đi dạo ngoài trời (`outdoor`).
   - **Like**: thịt/xương (`meat`, `beef`, `chicken`, `market_meat`), chạy nhảy.
   - **Dislike**: bị nhốt lâu / cô đơn (`lonely`, `thunder`, `storm`).
4. **`boba` (Poodle nâu)** & **`cookie` (Shiba Inu)**:
   - Thích công viên (`park`), đi dạo (`outdoor`), ném bóng (`ball`, `throw_the_ball`), tiệm bánh/cafe (`cafe_counter`, `bakery`).
5. **`ember` (Rồng con lửa)**:
   - **Love**: nơi ấm áp (`warm`, `sunny`, `kitchen`, `fireplace`), đồ nướng/cay/nóng (`bbq`, `grill`, `roasted`, `steak`, `hot_soup`, `restaurant`, `bake`).
   - **Dislike**: trời lạnh/băng tuyết/mưa (`cold`, `snow`, `snowy`, `ice`, `freezer`, `market_frozen`).
6. **`lumi` (Kỳ lân sao)**:
   - **Love**: hoa quả/ngọt/cầu vồng (`fruit`, `apple`, `strawberry`, `market_produce`, `park`, `star`, `flowers`, `sweet`).
   - **Dislike**: ồn ào/bẩn (`trash`, `mud`, `storm`).
7. **`pip` (Cáo tuyết Bắc Cực)**:
   - **Love**: trời lạnh/tuyết/đồ đông lạnh (`cold`, `snow`, `snowy`, `winter`, `ice`, `ice_cream`, `market_frozen`, `market_dairy`).
   - **Dislike**: nóng bức/lửa (`hot`, `heat`, `grill`, `oven`, `fireplace`).
8. **`aqua` (Rái cá biển)**:
   - **Love**: nước/bơi/tắm/mưa (`water`, `bath`, `shower`, `take_a_shower`, `rain`, `rainy`, `pond`, `fountain`, `drink_water`) và cá/hải sản (`fish`, `salmon`, `market_meat`).
   - **Dislike**: khô nóng (`dry`, `hot`, `desert`).

### 2.2. Hàm `ELW_PET_PERSONALITY.react(petId, ctx, opts)`
- Chuẩn hóa đầu vào: `petId` (mặc định `ELW_PET_NEEDS.getActivePetId()`), `actionId`, `room`, `item`, `weather`.
- Tự động suy luận từ khóa từ `actionId` (ví dụ `order_fresh_salmon` → khớp token `salmon`, `fish`; `take_a_shower` → khớp `shower`, `water`, `bath`; `throw_the_ball` → khớp `ball`, `throw_the_ball`).
- Trả về:
  ```js
  {
    petId,
    mood: 'love' | 'like' | 'neutral' | 'dislike',
    funDelta,          // love: +15, like: +8, neutral: +1, dislike: -6
    bondDelta,         // love: +6, like: +3, neutral: +1, dislike: -1
    rewardMultiplier,  // love: 1.5, like: 1.25, neutral: 1.0, dislike: 1.0
    emotionState,      // love: 'excited', like: 'playful', neutral: 'curious', dislike: 'sad_lonely'
    lineEn,
    lineVi
  }
  ```

### 2.3. Tích hợp Sự kiện & Thưởng Chống Farm
- Đăng ký lắng nghe:
  - Wrap hoặc hook `ELW_PET_ADVENTURE.onWorldAction` và `ELW_PET_ADVENTURE.onAction` (hoặc `ELW_PET_ADVENTURE.subscribe`) để khi nhân vật thực hiện hành động trong phòng/khu vực, tự động gọi `triggerWorldReaction({ actionId, room, item, weather })`.
- Áp dụng Needs:
  - Gọi `ELW_PET_NEEDS.applyNeedDelta({ fun: reaction.funDelta, bond: reaction.bondDelta })` và `ELW_PET_NEEDS.setTemporaryState(reaction.emotionState, 3800)`.
- Áp dụng Hệ số Thưởng (Anti-farm):
  - Khi `reaction.rewardMultiplier > 1`, gọi `ELW_PET_REWARDS.claimObjectiveReward("pet_personality_bonus:" + activePetId + ":" + actionKey, { stars: bonusStars, xp: bonusXp, bond: 0, label: ... })`.
  - Vì `ELW_PET_REWARDS.claimObjectiveReward` lưu `objectiveKey` vào `claimedObjectives`, lần thứ 2 thực hiện cùng hành động sẽ trả về `{ granted: false, duplicate: true }` — tuyệt đối không cộng thưởng lần 2.
- Bong bóng cảm xúc gần Pet:
  - Hiển thị bong bóng SVG `<g id="petReactBubble">` gắn vào `#catScale` (ngay phía trên đầu pet) kèm icon mood (`❤️`, `😊`, `💧`, `🐾`) và câu `lineEn` ngắn gọn, tự ẩn sau `3.2s`, đồng thời gọi `ELW_PET_ANIM.triggerEmotionAnim(reaction.mood)` nếu A3 đã nạp.

## 3. Phụ thuộc
- Đọc: `window.ELW_PET_NEEDS`, `window.ELW_PET_REWARDS`, `window.ELW_PET_ADVENTURE`, `window.ELW_SCENE`.
- Ghi DOM: `#catScale` (chỉ thêm/cập nhật `<g id="petReactBubble">`).

## 4. Cách Kiểm thử
- Gọi `ELW_PET_PERSONALITY.react('mochi', { room: 'market_meat', item: 'fish', actionId: 'order_fresh_salmon' })` → `mood` là `'love'` hoặc `'like'`, `funDelta > 0`, `lineEn` có nội dung tiếng Anh phù hợp.
- Gọi `ELW_PET_PERSONALITY.react('milu', { room: 'park', item: 'ball', actionId: 'throw_the_ball' })` → `mood === 'love'`, `funDelta > 0`.
- Gọi `ELW_PET_PERSONALITY.react('mochi', { room: 'bathroom', item: 'water', actionId: 'take_a_shower' })` → `mood === 'dislike'`, `funDelta < 0`.
- Kiểm tra thực hiện hành động 2 lần liên tiếp: lần 2 không cộng thêm sao/XP.
