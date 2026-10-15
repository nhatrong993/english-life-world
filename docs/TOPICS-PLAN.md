# English Life World: Kế hoạch & Lộ trình Triển khai các Chủ đề (Topics Roadmap)

## 1. Phân quyền Thực thi Lộ trình
- **Thực thi toàn bộ (Full-stack Implementation)**: **Antigravity (chạy Gemini 4 Argon)** trực tiếp xây dựng từ A–Z (SVG/PNG bối cảnh 2.5D, đồ vật tương tác, câu hành động + IPA + ngữ pháp, hội thoại NPC, tích hợp bạn đồng hành Linh, nhiệm vụ, thử thách và nối vào `index.html`).
- **Rà soát nhiệm vụ (Roadmap & QA Reviewer)**: **Claude (`claude-desktop`)** chỉ rà soát tiến độ và kiểm tra chất lượng từng giai đoạn theo checklist để đảm bảo đi đúng lộ trình.

---

## 2. Trạng thái Tổng quan các Chủ đề

| TT | Mã Topic | Chủ đề | Module chính | Trạng thái | Quy mô nội dung |
|---|---|---|---|---|---|
| 1 | `home` | 🏠 **Nhà ở (At home)** | `index.html`, `rooms.js`, `rooms2.js`, `food.js` | ✅ **Đã hoàn thành** | 6 phòng · 150+ từ vựng · 11+ nhiệm vụ |
| 2 | `cafe` | ☕ **Quán cà phê (At the coffee shop)** | `modules/topic-cafe.js`, `modules/life-talk.js` | ✅ **Đã hoàn thành & Fix chuẩn** | 12 đồ vật · 22 hành động · Barista + Linh · 5 nhiệm vụ |
| 3 | `market` | 🛒 **Siêu thị (At the supermarket)** | `modules/topic-market.js`, `modules/life-talk.js` | ✅ **Đã hoàn thành & Fix chuẩn** | 12 đồ vật · 22 hành động · Cashier + Linh · 4 nhiệm vụ |
| 4 | `park` | 🌳 **Công viên (At the park)** | `modules/topic-park.js`, `modules/life-talk.js` | ✅ **Đã hoàn thành** | 10 đồ vật · 20 hành động · 2 NPC + Linh · 4 nhiệm vụ |
| 5 | `restaurant` | 🍜 **Quán ăn / Nhà hàng (At a restaurant)** | `modules/topic-restaurant.js`, `modules/life-talk.js` | ✅ **Đã hoàn thành** | 10 đồ vật · 22 hành động · 2 NPC + Linh · 4 nhiệm vụ |
| 6 | `outdoor` | ⛺ **Hoạt động ngoài trời (Outdoor activities)** | `modules/topic-outdoor.js`, `modules/life-talk.js` | ✅ **Đã hoàn thành** | 10 đồ vật · 22 hành động · 2 NPC + Linh · 4 nhiệm vụ |
| 7 | `school` | 🏫 **Trường học / Lớp học (At school)** | `modules/topic-school.js`, `modules/life-talk.js` | ✅ **Đã hoàn thành** | 10 đồ vật · 22 hành động · 2 NPC + Linh · 4 nhiệm vụ |
| 8 | `expansion` | ✈️🏥 **Mở rộng tiếp theo (Sân bay, Phòng khám)** | `modules/topic-*.js` | 🔜 **Kế hoạch mở rộng (Phase 6+)** | Các bối cảnh giao tiếp nâng cao |

---

## 3. Thiết kế Chi tiết các Chủ đề Tiếp theo

### Phase 2: 🌳 Chủ đề Công viên (`park` — `modules/topic-park.js`)

#### A. Bối cảnh 2.5D & Đồ vật tương tác (`1000×640`)
1. `park_gate` (Park entrance / Cổng công viên) — điểm xuất phát `entry: { x: 96, y: 605, d: 1 }`.
2. `bench` (Park bench / Ghế đá dưới tán cây) — ngồi nghỉ, đọc sách, trò chuyện cùng Linh.
3. `duck_pond` (Duck pond / Hồ vịt) — ngắm vịt bơi, cho vịt ăn vụn bánh mì.
4. `dog_spot` (Puppy & leash / Chú chó nhỏ & dây dắt) — dắt chó đi dạo, ném bóng (fetch), vuốt ve.
5. `bicycle` (Rent-a-bike stand / Xe đạp dạo công viên) — đội mũ bảo hiểm, đạp xe quanh lối đi.
6. `ice_cream_cart` (Ice cream cart / Xe bán kem) — NPC Người bán kem (`Ice Cream Vendor`), chọn vị vani/sô-cô-la/dâu, thanh toán.
7. `playground` (Slide & swing / Cầu trượt & xích đu) — ngồi xích đu, đẩy xích đu.
8. `flower_bed` (Flower garden / Luống hoa & bồn tưới) — ngắm hoa, chụp ảnh phong cảnh.
9. `water_fountain` (Drinking fountain / Vòi nước uống công cộng) — uống nước sau khi chạy bộ.
10. `trash_bin` (Recycling bin / Thùng rác phân loại) — bỏ vỏ kem/rác đúng nơi quy định.

#### B. Các cụm Hành động & Mẫu câu Giao tiếp Trọng tâm (20 hành động)
- **Vận động & Dạo chơi**:
  - `walk_the_dog`: *"I'm taking my dog for a walk in the park."*
  - `throw_the_ball`: *"Go fetch the ball, buddy!"*
  - `ride_a_bike`: *"I'm riding a bicycle along the park path."*
  - `jog_around_park`: *"I'm going for a light jog to get some fresh air."*
- **Thư giãn & Tương tác thiên nhiên**:
  - `sit_on_the_bench`: *"Let's sit on this shady bench for a while."*
  - `feed_the_ducks`: *"I'm feeding some bread crumbs to the ducks in the pond."*
  - `smell_the_flowers`: *"These blooming flowers smell wonderful!"*
  - `take_park_photo`: *"Could you take a picture of us by the pond?"*
- **Mua kem & Giao tiếp xã hội**:
  - `greet_vendor`: *"Hi there! What flavors of ice cream do you have today?"*
  - `buy_an_ice_cream`: *"Can I get one scoop of vanilla in a cone, please?"*
  - `pay_for_ice_cream`: *"Here you go. Keep the change!"*
  - `eat_ice_cream`: *"This cold ice cream is so refreshing on a sunny day."*
  - `drink_fountain_water`: *"I'm taking a sip of water from the fountain."*
  - `throw_away_wrapper`: *"I'm putting the wrapper into the recycling bin."*

#### C. Hội thoại NPC & Bạn đồng hành Linh (`ELW_LIFE`)
- **Vendor Reply (`NPC_TOPIC.park`)**: Phản hồi tự nhiên khi hỏi vị kem, báo giá và cảm ơn.
- **Linh Companion (`POS.park = { x: 210, y: 618 }`)**:
  - 10 câu hỏi lựa chọn (`TALK.park`) về sở thích đi dạo, chọn vị kem, tập thể dục buổi sáng, thời tiết ở công viên.
  - Phản ứng tự nhiên (`ON_ACT`) khi người chơi cho vịt ăn, mua kem (Linh xin 1 cây vị dâu/matcha), hoặc ngồi ghế đá.
- **4 Nhiệm vụ (`MISSIONS`)**:
  1. `park_walk_and_ducks`: *Morning in the park* (Dắt chó đi dạo → Cho vịt ăn → Ngồi ghế đá nghỉ ngơi).
  2. `park_ice_cream_treat`: *Ice cream break* (Chào người bán kem → Mua kem ốc quế → Ăn kem → Bỏ giấy gói vào thùng rác).
  3. `park_active_day`: *Stay active outdoors* (Đạp xe quanh công viên → Uống nước ở vòi → Chụp ảnh kỷ niệm).
  4. `life_park_with_linh`: *Picnic & ice cream with Linh* (Mua kem → Ngồi ghế đá → Trò chuyện cùng Linh).

---

### Phase 3: 🍜 Chủ đề Quán ăn / Nhà hàng (`restaurant` — `modules/topic-restaurant.js`)

#### A. Bối cảnh 2.5D & Đồ vật tương tác (`1000×640`)
1. `host_stand` (Reception stand / Quầy lễ tân đón khách) — xin bàn cho 1 hoặc 2 người (`Table for two, please`).
2. `dining_table` (Dining booth / Bàn ăn chính) — ngồi vào bàn, trải khăn ăn.
3. `menu_stand` (Menu / Thực đơn trên bàn) — xem món khai vị, món chính, đồ uống.
4. `waiter_station` (Waiter / Nhân viên phục vụ) — gọi món, dặn ít cay (`less spicy`), xin thêm nước/khăn giấy.
5. `kitchen_pass` (Chef's counter / Quầy bếp mở) — xem đầu bếp chế biến, nhận món ăn nóng.
6. `soup_noodles` (Steaming bowl / Tô mì/phở & món chính trên bàn) — nếm thử nước dùng, ăn món chính.
7. `condiments` (Spice rack / Khay gia vị: chanh, ớt, tiêu, nước chấm) — vắt chanh, thêm chút tiêu.
8. `water_carafe` (Water pitcher & glasses / Bình nước lọc & ly) — rót nước mời bạn.
9. `dessert_display` (Dessert tray / Quầy tráng miệng) — gọi bánh flan / trái cây tráng miệng.
10. `bill_desk` (Cashier & bill folder / Quầy thu ngân & kẹp hoá đơn) — xin hoá đơn (`Can I have the bill, please?`), chia tiền (`split the bill`), thanh toán thẻ/tiền mặt.

#### B. Các cụm Hành động & Mẫu câu Giao tiếp Trọng tâm (22 hành động)
- **Đặt bàn & Xem thực đơn**:
  - `ask_for_a_table`: *"Hi! Do you have a table for two near the window?"*
  - `sit_at_dining_table`: *"I'm taking a seat at our table."*
  - `check_the_menu`: *"Let's see what today's specials are on the menu."*
  - `ask_recommendation`: *"What do you recommend here?"*
- **Gọi món & Yêu cầu đặc biệt**:
  - `order_beef_noodles`: *"I'll have the beef noodle soup, please."*
  - `ask_not_too_spicy`: *"Could you make it mild, not too spicy, please?"*
  - `order_iced_tea`: *"And I'd like a glass of lemon iced tea."*
- **Dùng bữa & Phục vụ tại bàn**:
  - `pour_drinking_water`: *"I'm pouring some water into our glasses."*
  - `squeeze_some_lime`: *"I'm squeezing a little fresh lime into the broth."*
  - `ask_for_napkins`: *"Excuse me, could we get some extra napkins, please?"*
  - `eat_main_course`: *"This noodle soup is rich and delicious!"*
  - `order_sweet_dessert`: *"Let's share a caramel pudding for dessert."*
- **Thanh toán & Rời quán**:
  - `ask_for_the_bill`: *"Excuse me, could we have the bill, please?"*
  - `split_the_bill`: *"Let's split the bill fifty-fifty."*
  - `pay_restaurant_bill`: *"I'm paying the bill by card and leaving a tip."*
  - `thank_the_chef`: *"Thank you! The food was amazing."*

#### C. Hội thoại NPC & Bạn đồng hành Linh (`ELW_LIFE`)
- **Waiter Reply (`NPC_TOPIC.restaurant`)**: Chào đón khách, gợi ý món đặc sản (`Chef's special`), xác nhận độ cay, mang hoá đơn.
- **Linh Companion (`POS.restaurant = { x: 220, y: 620 }`)**:
  - Cùng xem menu, thảo luận món ăn cay/không cay, khen đồ ăn ngon, và đề nghị chia đôi hoá đơn (`Let's go Dutch / split it!`).
- **4 Nhiệm vụ (`MISSIONS`)**:
  1. `rest_solo_dinner`: *A warm bowl of noodles* (Xin bàn → Xem menu → Gọi mì bò ít cay → Ăn tối → Thanh toán).
  2. `rest_full_course`: *Three-course meal* (Gọi món chính & trà chanh → Dùng bữa → Gọi tráng miệng → Xin hoá đơn).
  3. `rest_polite_diner`: *Polite requests* (Hỏi món gợi ý → Xin thêm khăn giấy → Khen đầu bếp).
  4. `life_dinner_with_linh`: *Dinner date with Linh* (Lấy bàn cho 2 người → Gọi món → Trò chuyện với Linh → Chia hoá đơn).

---

### Phase 4: ⛺ Chủ đề Hoạt động ngoài trời (`outdoor` — `modules/topic-outdoor.js`)

#### A. Bối cảnh 2.5D & Đồ vật tương tác (`1000×640`)
1. `trailhead` (Trail entrance & map board / Cổng đường mòn & bảng bản đồ) — xem bản đồ, chọn cung đường leo núi.
2. `ranger_post` (Ranger station / Trạm kiểm lâm) — NPC Kiểm lâm (`Park Ranger`), hỏi thời tiết và quy tắc an toàn.
3. `campsite` (Tent spot / Khu dựng lều) — trải bạt, dựng lều, kéo khoá cửa lều.
4. `firepit` (Campfire ring / Bếp lửa trại bằng đá) — xếp củi, nhóm lửa trại, nướng kẹo marshmallow, dập lửa an toàn.
5. `picnic_spot` (Picnic blanket / Thảm dã ngoại trên cỏ) — trải thảm, bày bánh sandwich và trái cây.
6. `cooler` (Cooler box / Thùng đá dã ngoại) — lấy nước mát, cất đồ ăn.
7. `backpack` (Hiking backpack / Ba lô leo núi) — lấy đèn pin, bình nước, la bàn, ống nhòm.
8. `lookout` (Scenic viewpoint / Điểm ngắm cảnh trên đồi) — nhìn qua ống nhòm, ngắm hoàng hôn.
9. `lake_dock` (Wooden dock & kayak / Bến gỗ & thuyền kayak) — mặc áo phao, chèo thuyền trên hồ.
10. `camp_lantern` (Solar lantern / Đèn lồng cắm trại) — bật đèn khi trời tối, thu dọn trại (`Leave No Trace`).

#### B. Các cụm Hành động & Mẫu câu Giao tiếp Trọng tâm (20 hành động)
- **Chuẩn bị & Đường mòn**:
  - `check_trail_map`: *"I'm checking the trail map before we start hiking."*
  - `ask_the_ranger`: *"Excuse me, is the ridge trail safe to hike today?"*
  - `pack_water_bottle`: *"I'm putting a full water bottle into my backpack."*
  - `hike_to_lookout`: *"We're hiking up the trail to the scenic lookout."*
  - `use_binoculars`: *"I can see the whole valley through these binoculars!"*
- **Cắm trại & Dã ngoại**:
  - `set_up_the_tent`: *"I'm pitching the tent on flat ground."*
  - `spread_picnic_blanket`: *"Let's spread the picnic blanket under the pine trees."*
  - `take_cold_juice`: *"I'm grabbing two cold juices from the cooler."*
  - `eat_picnic_sandwich`: *"This homemade sandwich tastes even better outdoors!"*
- **Lửa trại & An toàn**:
  - `gather_dry_firewood`: *"I'm collecting some dry firewood for the campfire."*
  - `light_the_campfire`: *"I'm lighting a warm campfire in the stone ring."*
  - `roast_marshmallows`: *"I'm roasting a marshmallow over the campfire."*
  - `put_out_campfire`: *"I'm pouring water on the embers to put the fire completely out."*
  - `pack_up_campsite`: *"We're packing up everything so we leave no trace."*

#### C. Hội thoại NPC & Bạn đồng hành Linh (`ELW_LIFE`)
- **Ranger Reply (`NPC_TOPIC.outdoor`)**: Hướng dẫn đường mòn, nhắc nhở giữ gìn thiên nhiên và dập lửa trại trước khi rời đi.
- **Linh Companion (`POS.outdoor = { x: 225, y: 618 }`)**:
  - Cùng dựng lều, chia sẻ bánh sandwich dã ngoại, nướng marshmallow bên lửa trại và ngắm cảnh núi đồi.
- **4 Nhiệm vụ (`MISSIONS`)**:
  1. `outdoor_pitch_camp`: *Set up camp* (Xem bản đồ → Dựng lều → Gom củi → Nhóm lửa trại).
  2. `outdoor_sunny_picnic`: *Sunny picnic* (Trải thảm → Lấy nước mát từ thùng đá → Ăn bánh sandwich).
  3. `outdoor_safe_hiker`: *Trail explorer* (Hỏi kiểm lâm → Leo lên điểm ngắm cảnh → Nhìn ống nhòm → Dập lửa an toàn).
  4. `life_camping_with_linh`: *Camping with Linh* (Dựng lều → Nướng marshmallow → Trò chuyện với Linh bên lửa trại).

---

### Phase 5: 🏫 Chủ đề Trường học (`school` — `modules/topic-school.js`)

#### A. Bối cảnh 2.5D & Đồ vật tương tác (`1000×640`)
1. `classdoor` (Classroom door & schedule board / Cửa lớp & bảng thời khóa biểu) — chào giáo viên buổi sáng, xem lịch học.
2. `whiteboard` (Interactive whiteboard / Bảng trắng lớp học) — đọc bài mới, lên bảng viết đáp án bằng bút lông đỏ, lau sạch bảng.
3. `teacherdesk` (Teacher's desk / Bàn giáo viên) — NPC Cô giáo tiếng Anh (`Ms. Claire` `👩‍🏫`), hỏi cách phát âm, nộp bài tập về nhà (`hand in homework`).
4. `studentdesk` (Student desk & chair / Bàn ghế học sinh) — ngồi vào bàn đầu, mở sách giáo khoa trang 24, ghi chép bài (`take notes`), giơ tay phát biểu (`raise hand`).
5. `schoolbag` (School backpack / Cặp sách đi học) — lấy vở và bút ra, xếp gọn sách vở vào cặp cuối giờ.
6. `bookshelf` (Library corner / Góc thư viện) — NPC Thầy thủ thư (`Mr. Leo` `📚`), mượn truyện phiêu lưu tiếng Anh (`borrow a storybook`), trả sách đúng hạn.
7. `globe` (World globe / Quả địa cầu) — xoay quả địa cầu, tìm Việt Nam và Vương quốc Anh.
8. `sciencetable` (Science table / Bàn thí nghiệm khoa học) — quan sát tế bào lá qua kính hiển vi (`microscope`), tưới chậu cây của lớp.
9. `locker` (Student locker / Tủ đồ cá nhân) — mở khóa tủ đồ, treo áo khoác gọn gàng (`put away jacket`).
10. `watercooler` (Water dispenser / Bình nước uống lớp học) — uống cốc nước mát giờ giải lao (`during break time`).

#### B. Hội thoại NPC & Bạn đồng hành Linh (`ELW_LIFE`)
- **Teacher & Librarian Replies (`NPC_TOPIC.school`)**: Cô Claire (`adult_female`) và Thầy Leo (`young_male`) phản hồi khích lệ theo từng hành động.
- **Linh Companion (`POS.school = { x: 342, y: 548 }`)**: Cùng ngồi bàn đầu, ôn bài, mượn bút dự phòng và thảo luận bài tập.
- **4 Nhiệm vụ (`MISSIONS`) + 1 Thử thách (`school_model_student`)**:
  1. `school_morning_class`: *Ready for English Class* (Chào cô giáo → Ngồi vào bàn → Mở sách giáo khoa → Giơ tay phát biểu → Nộp bài tập).
  2. `school_board_star`: *Whiteboard & Notes Star* (Đọc bảng → Ghi chép vào vở → Viết đáp án lên bảng → Lau bảng sạch sẽ).
  3. `school_curious_explorer`: *Library & Science Explorer* (Xem thời khóa biểu → Tìm nước trên địa cầu → Nhìn kính hiển vi → Mượn truyện tiếng Anh).
  4. `life_study_with_linh`: *Study session with Linh* (Ngồi bàn học → Mở sách giáo khoa → Ôn bài & trò chuyện với Linh → Mượn truyện ở góc thư viện).

---

## 4. Quy chuẩn Kỹ thuật Chung cho Mọi Topic Mới
1. **Không tạo kiến trúc tách rời**: Mỗi topic là 1 file độc lập `modules/topic-<id>.js` đăng ký vào `window.ELW_ROOMS.<id>` và `window.ELW_<UPPER>`, tự động nạp đồ vật (`OBJECTS`), hành động (`ACTIONS`), câu chuyện (`STORY`), điểm đứng (`SPOTS`), vật cản (`OBST`), kho từ vựng (`catalog`) và nhiệm vụ (`ELW_MISSION.register`).
2. **Nút Reset thông minh**: Ở mọi Topic ngoài `home`, nút trên thanh cảnh (`#btnReset`) và nút trong Chuỗi hành động (`#qReset`) luôn hiển thị **"↺ Reset đoạn hội thoại"** / **"↺ Reset lại đoạn hội thoại"**, khi bấm sẽ giữ nguyên nhân vật đứng tại Topic hiện tại (`W.room` không đổi) và làm mới toàn bộ hội thoại.
3. **Chuỗi âm thanh tuần tự 100%**: Người chơi nói hết câu → Nhân viên/NPC tại Topic đáp hết câu → Bạn đồng hành Linh phản hồi hết câu → Hệ thống nhiệm vụ cập nhật.
