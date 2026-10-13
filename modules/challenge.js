/* English Life World — challenge.js
   Agent 2: Chế độ thử thách (Challenge Engine)
   10 rich challenges (~10 tasks each), live metric bars, and strict completion
   condition: challenge completes only when ALL required bars are green. */
(function (root) {
  "use strict";

  const CHALLENGES = [
    {
      id: "pet_care",
      title: "Caring for Mimi the Cat",
      titleVi: "Chăm sóc mèo cưng Mimi",
      desc: "Complete 10 pet care tasks and get all pet welfare bars to green!",
      descVi: "Thực hiện 10 nhiệm vụ chăm mèo và đưa tất cả các thanh chỉ số lên màu xanh!",
      tasks: [
        { id: "call_cat", en: "Call the cat", vi: "Gọi mèo lại gần", action: "call_cat" },
        { id: "pet_cat", en: "Pet the cat gently", vi: "Vuốt ve mèo", action: "pet_cat" },
        { id: "feed_cat", en: "Feed the cat", vi: "Cho mèo ăn", action: "feed_cat" },
        { id: "give_cat_water", en: "Give the cat fresh water", vi: "Cho mèo uống nước", action: "give_cat_water" },
        { id: "play_with_cat", en: "Play with feather wand", vi: "Chơi cần câu mèo", action: "play_with_cat" },
        { id: "brush_cat", en: "Brush the cat's fur", vi: "Chải lông cho mèo", action: "brush_cat" },
        { id: "fluff_cushion", en: "Fluff the sofa cushion for Mimi", vi: "Làm phồng đệm sofa cho mèo nằm", action: "fluff_cushion" },
        { id: "sweep_floor", en: "Sweep the cat hair from the floor", vi: "Quét sạch lông mèo trên sàn", action: "sweep_floor" },
        { id: "wipe_table", en: "Wipe down the dining table", vi: "Lau sạch bàn ăn", action: "wipe_table" },
        { id: "put_cup_on_table", en: "Put the warm milk cup on the table", vi: "Đặt cốc sữa lên bàn", action: "put_cup_on_table" }
      ],
      bars: [
        { id: "petHappiness", label: "Cat Happiness", labelVi: "Độ vui của mèo", start: 20, target: 80, step: 20, required: true },
        { id: "petHunger", label: "Cat Satiety", labelVi: "Độ no của mèo", start: 15, target: 80, step: 25, required: true },
        { id: "petCleanliness", label: "Home Hygiene", labelVi: "Vệ sinh xung quanh", start: 25, target: 80, step: 20, required: true }
      ],
      actionBars: {
        call_cat: { petHappiness: 15 },
        pet_cat: { petHappiness: 25 },
        feed_cat: { petHunger: 40, petHappiness: 10 },
        give_cat_water: { petHunger: 25, petHappiness: 10 },
        play_with_cat: { petHappiness: 30 },
        brush_cat: { petHappiness: 20, petCleanliness: 15 },
        fluff_cushion: { petHappiness: 15 },
        sweep_floor: { petCleanliness: 35 },
        wipe_table: { petCleanliness: 30 },
        put_cup_on_table: { petCleanliness: 10 }
      }
    },
    {
      id: "morning_routine",
      title: "Energizing Morning Routine",
      titleVi: "Thói quen buổi sáng tràn đầy năng lượng",
      desc: "Wake up, prepare healthy food, and greet the new morning.",
      descVi: "Thức dậy, chuẩn bị đồ ăn dinh dưỡng và đón chào ngày mới.",
      tasks: [
        { id: "b_turn_off_alarm", en: "Turn off the morning alarm", vi: "Tắt chuông báo thức", action: "b_turn_off_alarm" },
        { id: "get_up", en: "Get up from bed", vi: "Rời khỏi giường", action: "get_up" },
        { id: "open_living_curtains", en: "Open the curtains for sunshine", vi: "Mở rèm đón ánh nắng", action: "open_living_curtains" },
        { id: "open_window", en: "Open window for fresh morning breeze", vi: "Mở cửa sổ đón gió lành", action: "open_window" },
        { id: "wash_hands", en: "Wash hands cleanly", vi: "Rửa tay sạch sẽ", action: "wash_hands" },
        { id: "brush_teeth", en: "Brush teeth thoroughly", vi: "Đánh răng thơm tho", action: "brush_teeth" },
        { id: "k_boil_kettle", en: "Boil water in the kettle", vi: "Đun nước sôi trong ấm", action: "k_boil_kettle" },
        { id: "k_fry_egg", en: "Fry a sunny-side egg", vi: "Rán một quả trứng", action: "k_fry_egg" },
        { id: "k_make_toast", en: "Toast crispy bread slices", vi: "Nướng bánh mì giòn", action: "k_make_toast" },
        { id: "pour_milk", en: "Pour fresh cold milk into a cup", vi: "Rót sữa tươi mát vào cốc", action: "pour_milk" }
      ],
      bars: [
        { id: "freshness", label: "Freshness", labelVi: "Độ sảng khoái", start: 20, target: 80, step: 20, required: true },
        { id: "energy", label: "Morning Energy", labelVi: "Năng lượng sáng", start: 10, target: 80, step: 25, required: true },
        { id: "routineReadiness", label: "Readiness", labelVi: "Sẵn sàng làm việc", start: 20, target: 80, step: 20, required: true }
      ],
      actionBars: {
        b_turn_off_alarm: { freshness: 15 },
        get_up: { energy: 15 },
        open_living_curtains: { freshness: 25 },
        open_window: { freshness: 25 },
        wash_hands: { freshness: 20, routineReadiness: 15 },
        brush_teeth: { freshness: 25, routineReadiness: 20 },
        k_boil_kettle: { energy: 20 },
        k_fry_egg: { energy: 30 },
        k_make_toast: { energy: 20 },
        pour_milk: { energy: 15, routineReadiness: 25 }
      }
    },
    {
      id: "chef_breakfast",
      title: "Master Chef Breakfast",
      titleVi: "Bữa sáng siêu đầu bếp",
      desc: "Cook a delicious hot breakfast and set up the dining table.",
      descVi: "Nấu một bữa sáng nóng hổi thơm ngon và chuẩn bị bàn ăn tươm tất.",
      tasks: [
        { id: "open_fridge", en: "Open fridge to inspect ingredients", vi: "Mở tủ lạnh xem nguyên liệu", action: "open_fridge" },
        { id: "take_milk", en: "Take fresh milk out", vi: "Lấy sữa tươi ra", action: "take_milk" },
        { id: "k_turn_on_stove", en: "Turn on the gas stove", vi: "Bật bếp gas", action: "k_turn_on_stove" },
        { id: "k_fry_egg", en: "Fry an egg in the hot pan", vi: "Rán trứng trên chảo nóng", action: "k_fry_egg" },
        { id: "k_cook_rice", en: "Cook fragrant white rice", vi: "Nấu nồi cơm trắng thơm", action: "k_cook_rice" },
        { id: "k_make_toast", en: "Toast golden bread", vi: "Nướng bánh mì vàng ruộm", action: "k_make_toast" },
        { id: "k_make_coffee", en: "Brew rich morning coffee", vi: "Pha cà phê đậm đà", action: "k_make_coffee" },
        { id: "k_set_table", en: "Set plates, cups and utensils", vi: "Bày đĩa, cốc và thìa dĩa", action: "k_set_table" },
        { id: "k_have_breakfast", en: "Enjoy the hot breakfast", vi: "Thưởng thức bữa sáng", action: "k_have_breakfast" },
        { id: "k_clear_table", en: "Clear and clean the dining table", vi: "Dọn dẹp bàn ăn sau bữa", action: "k_clear_table" }
      ],
      bars: [
        { id: "cookingSkill", label: "Culinary Quality", labelVi: "Chất lượng món ăn", start: 10, target: 80, step: 20, required: true },
        { id: "tableElegance", label: "Table Elegance", labelVi: "Bày biện bàn ăn", start: 15, target: 80, step: 25, required: true },
        { id: "kitchenTidy", label: "Kitchen Cleanliness", labelVi: "Bếp núc gọn gàng", start: 20, target: 80, step: 20, required: true }
      ],
      actionBars: {
        open_fridge: { cookingSkill: 10 },
        take_milk: { cookingSkill: 15 },
        k_turn_on_stove: { cookingSkill: 15 },
        k_fry_egg: { cookingSkill: 30 },
        k_cook_rice: { cookingSkill: 25 },
        k_make_toast: { cookingSkill: 20 },
        k_make_coffee: { cookingSkill: 20, tableElegance: 15 },
        k_set_table: { tableElegance: 40 },
        k_have_breakfast: { tableElegance: 25 },
        k_clear_table: { kitchenTidy: 50, tableElegance: 20 }
      }
    },
    {
      id: "house_cleaning",
      title: "Spring House Cleaning",
      titleVi: "Tổng vệ sinh nhà cửa",
      desc: "Clean floors, wipe surfaces, and take out the trash.",
      descVi: "Quét sạch sàn, lau bụi bàn ghế và đổ rác thải sinh hoạt.",
      tasks: [
        { id: "sweep_floor", en: "Sweep the living room floor", vi: "Quét sàn phòng khách", action: "sweep_floor" },
        { id: "sweep_under_table", en: "Sweep dust under the dining table", vi: "Quét dưới gầm bàn", action: "sweep_under_table" },
        { id: "wipe_table", en: "Wipe dust off table top", vi: "Lau sạch mặt bàn", action: "wipe_table" },
        { id: "k_wash_dishes", en: "Wash dirty dishes in the sink", vi: "Rửa bát đĩa bẩn trong bồn", action: "k_wash_dishes" },
        { id: "k_dry_dishes", en: "Dry dishes with clean towel", vi: "Lau khô bát đĩa bằng khăn", action: "k_dry_dishes" },
        { id: "k_put_dishes_away", en: "Put dry dishes in the cabinet", vi: "Cất bát đĩa vào tủ bếp", action: "k_put_dishes_away" },
        { id: "empty_trash", en: "Empty and take out the trash", vi: "Đổ thùng rác", action: "empty_trash" },
        { id: "k_wipe_counter", en: "Wipe down the kitchen counter", vi: "Lau sạch mặt bếp", action: "k_wipe_counter" },
        { id: "fluff_cushion", en: "Fluff up the sofa cushions", vi: "Vỗ phồng gối sofa", action: "fluff_cushion" },
        { id: "fold_throw", en: "Fold the throw blanket neatly", vi: "Gấp gọn chăn trên ghế", action: "fold_throw" }
      ],
      bars: [
        { id: "floorClean", label: "Floor Cleanliness", labelVi: "Độ sạch của sàn", start: 20, target: 80, step: 25, required: true },
        { id: "dishHygiene", label: "Dishes & Kitchen", labelVi: "Bát đĩa & Bếp", start: 10, target: 80, step: 25, required: true },
        { id: "tidyOrder", label: "Room Order", labelVi: "Gọn gàng ngăn nắp", start: 15, target: 80, step: 20, required: true }
      ],
      actionBars: {
        sweep_floor: { floorClean: 35 },
        sweep_under_table: { floorClean: 35 },
        wipe_table: { tidyOrder: 25 },
        k_wash_dishes: { dishHygiene: 35 },
        k_dry_dishes: { dishHygiene: 25 },
        k_put_dishes_away: { dishHygiene: 30, tidyOrder: 20 },
        empty_trash: { dishHygiene: 25, floorClean: 20 },
        k_wipe_counter: { dishHygiene: 25 },
        fluff_cushion: { tidyOrder: 25 },
        fold_throw: { tidyOrder: 30 }
      }
    },
    {
      id: "relax_evening",
      title: "Cozy Evening Relaxation",
      titleVi: "Buổi tối thư giãn ấm cúng",
      desc: "Unwind on the soft sofa with a good book, music and gentle lighting.",
      descVi: "Nghỉ ngơi trên ghế sofa êm ái cùng cuốn sách hay, bản nhạc và ánh đèn dịu mát.",
      tasks: [
        { id: "turn_on_floor_lamp", en: "Turn on the warm floor lamp", vi: "Bật đèn cây ấm cúng", action: "turn_on_floor_lamp" },
        { id: "pick_up_book", en: "Pick up the interesting book", vi: "Cầm quyển sách hay lên", action: "pick_up_book" },
        { id: "sit_on_sofa", en: "Sit comfortably on the sofa", vi: "Ngồi thư thái trên ghế sofa", action: "sit_on_sofa" },
        { id: "read_on_sofa", en: "Read exciting pages on the sofa", vi: "Đọc sách trên ghế sofa", action: "read_on_sofa" },
        { id: "pick_up_remote", en: "Pick up the TV remote", vi: "Cầm điều khiển tivi", action: "pick_up_remote" },
        { id: "turn_on_tv", en: "Turn on the living room TV", vi: "Bật tivi phòng khách", action: "turn_on_tv" },
        { id: "watch_tv", en: "Watch an entertaining TV show", vi: "Xem chương trình tivi", action: "watch_tv" },
        { id: "listen_to_music", en: "Listen to relaxing stereo music", vi: "Nghe nhạc thư giãn", action: "listen_to_music" },
        { id: "turn_off_tv", en: "Turn off the TV when done", vi: "Tắt tivi khi xem xong", action: "turn_off_tv" },
        { id: "turn_off_floor_lamp", en: "Turn off the lamp before bed", vi: "Tắt đèn trước khi ngủ", action: "turn_off_floor_lamp" }
      ],
      bars: [
        { id: "relaxationLevel", label: "Mind Relaxation", labelVi: "Độ thư giãn tâm trí", start: 15, target: 80, step: 20, required: true },
        { id: "comfortLevel", label: "Body Comfort", labelVi: "Độ thoải mái cơ thể", start: 20, target: 80, step: 20, required: true },
        { id: "eveningPeace", label: "Evening Peace", labelVi: "Yên bình buổi tối", start: 10, target: 80, step: 25, required: true }
      ],
      actionBars: {
        turn_on_floor_lamp: { eveningPeace: 25 },
        pick_up_book: { relaxationLevel: 20 },
        sit_on_sofa: { comfortLevel: 30 },
        read_on_sofa: { relaxationLevel: 35, comfortLevel: 20 },
        pick_up_remote: { relaxationLevel: 10 },
        turn_on_tv: { relaxationLevel: 20 },
        watch_tv: { relaxationLevel: 25, comfortLevel: 25 },
        listen_to_music: { eveningPeace: 35, relaxationLevel: 20 },
        turn_off_tv: { eveningPeace: 20 },
        turn_off_floor_lamp: { eveningPeace: 30 }
      }
    },
    {
      id: "garden_tender",
      title: "Green Garden Caretaker",
      titleVi: "Người chăm sóc vườn xanh",
      desc: "Water plants, pick fresh fruit and nurture the garden ecosystem.",
      descVi: "Tưới cây hoa, hái quả chín và chăm sóc khu vườn xanh tươi.",
      tasks: [
        { id: "water_plant", en: "Water the living room potted plant", vi: "Tưới chậu cây phòng khách", action: "water_plant" },
        { id: "water_flowers", en: "Water colorful garden flowerbeds", vi: "Tưới luống hoa rực rỡ", action: "water_flowers" },
        { id: "pick_apple", en: "Pick sweet ripe apple from tree", vi: "Hái táo chín trên cành", action: "pick_apple" },
        { id: "feed_birds", en: "Put seeds into bird feeder", vi: "Cho chim ăn hạt", action: "feed_birds" },
        { id: "harvest_vegetables", en: "Harvest fresh leafy greens", vi: "Thu hoạch rau tươi", action: "harvest_vegetables" },
        { id: "smell_rose", en: "Smell fragrant blooming roses", vi: "Ngửi hương hoa hồng thơm", action: "smell_rose" },
        { id: "weed_garden", en: "Weed out wild grass from soil", vi: "Nhổ sạch cỏ dại", action: "weed_garden" },
        { id: "prune_branches", en: "Prune dead tree branches", vi: "Tỉa cành cây khô", action: "prune_branches" },
        { id: "turn_on_fountain", en: "Turn on the bubbling fountain", vi: "Bật đài phun nước róc rách", action: "turn_on_fountain" },
        { id: "sit_on_garden_bench", en: "Sit peacefully on wooden garden bench", vi: "Ngồi nghỉ trên ghế đá vườn", action: "sit_on_garden_bench" }
      ],
      bars: [
        { id: "plantVigor", label: "Plant Vigor", labelVi: "Sức sống cây cối", start: 20, target: 80, step: 25, required: true },
        { id: "harvestYield", label: "Garden Harvest", labelVi: "Thu hoạch nông sản", start: 10, target: 80, step: 30, required: true },
        { id: "natureZen", label: "Garden Beauty", labelVi: "Cảnh sắc thiên nhiên", start: 15, target: 80, step: 20, required: true }
      ],
      actionBars: {
        water_plant: { plantVigor: 20 },
        water_flowers: { plantVigor: 30, natureZen: 20 },
        pick_apple: { harvestYield: 40 },
        feed_birds: { natureZen: 25 },
        harvest_vegetables: { harvestYield: 45 },
        smell_rose: { natureZen: 25 },
        weed_garden: { plantVigor: 25 },
        prune_branches: { plantVigor: 25 },
        turn_on_fountain: { natureZen: 35 },
        sit_on_garden_bench: { natureZen: 20 }
      }
    },
    {
      id: "garage_diy",
      title: "Garage Workshop & Bicycle Tune-Up",
      titleVi: "Bảo dưỡng garage & xe đạp",
      desc: "Organize tools, inspect the family car and pump bicycle tires.",
      descVi: "Sắp xếp đồ nghề, kiểm tra xe hơi và bơm căng lốp xe đạp.",
      tasks: [
        { id: "inspect_car", en: "Inspect car body and lights", vi: "Kiểm tra thân xe và đèn xe", action: "inspect_car" },
        { id: "open_car_hood", en: "Open car engine hood", vi: "Mở nắp ca-pô ô tô", action: "open_car_hood" },
        { id: "check_engine_oil", en: "Check engine oil dipstick", vi: "Kiểm tra mức dầu máy", action: "check_engine_oil" },
        { id: "pump_bicycle_tire", en: "Pump up bicycle tires with floor pump", vi: "Bơm căng lốp xe đạp", action: "pump_bicycle_tire" },
        { id: "grab_wrench", en: "Pick up wrench from toolbox", vi: "Lấy cờ lê từ hộp đồ nghề", action: "grab_wrench" },
        { id: "store_tools", en: "Return tools to metal shelves", vi: "Cất dụng cụ lên giá kim loại", action: "store_tools" },
        { id: "sweep_garage", en: "Sweep garage concrete floor", vi: "Quét sạch sàn garage bê tông", action: "sweep_garage" },
        { id: "wash_car", en: "Wash dirt off car windshield", vi: "Lau sạch kính chắn gió xe", action: "wash_car" },
        { id: "charge_battery", en: "Plug in vehicle battery charger", vi: "Cắm sạc bình ắc quy", action: "charge_battery" },
        { id: "ride_bicycle", en: "Test ride bicycle smoothly", vi: "Đi thử xe đạp vòng quanh", action: "ride_bicycle" }
      ],
      bars: [
        { id: "vehicleHealth", label: "Vehicles Status", labelVi: "Tình trạng xe cộ", start: 20, target: 80, step: 25, required: true },
        { id: "toolOrganization", label: "Tool Order", labelVi: "Ngăn nắp đồ nghề", start: 15, target: 80, step: 25, required: true },
        { id: "garageSafety", label: "Safety & Cleanliness", labelVi: "An toàn & Vệ sinh", start: 10, target: 80, step: 25, required: true }
      ],
      actionBars: {
        inspect_car: { vehicleHealth: 20 },
        open_car_hood: { vehicleHealth: 15 },
        check_engine_oil: { vehicleHealth: 30 },
        pump_bicycle_tire: { vehicleHealth: 30 },
        grab_wrench: { toolOrganization: 20 },
        store_tools: { toolOrganization: 45, garageSafety: 20 },
        sweep_garage: { garageSafety: 35 },
        wash_car: { vehicleHealth: 25, garageSafety: 20 },
        charge_battery: { vehicleHealth: 25, garageSafety: 20 },
        ride_bicycle: { vehicleHealth: 20 }
      }
    },
    {
      id: "bathroom_hygiene",
      title: "Daily Hygiene & Self-Care",
      titleVi: "Chăm sóc vệ sinh cá nhân",
      desc: "Wash face, brush teeth, shower and keep the bathroom sparkling clean.",
      descVi: "Rửa mặt, đánh răng, tắm gội và giữ phòng tắm luôn sáng bóng.",
      tasks: [
        { id: "wash_hands", en: "Wash hands with foaming soap", vi: "Rửa tay bằng xà phòng", action: "wash_hands" },
        { id: "brush_teeth", en: "Brush teeth for two minutes", vi: "Đánh răng đủ hai phút", action: "brush_teeth" },
        { id: "wash_face", en: "Splash cold water to wash face", vi: "Vỗ nước mát rửa sạch mặt", action: "wash_face" },
        { id: "look_in_mirror", en: "Check smile in bathroom mirror", vi: "Soi gương và cười tươi", action: "look_in_mirror" },
        { id: "comb_hair", en: "Comb and neaten messy hair", vi: "Chải tóc gọn gàng", action: "comb_hair" },
        { id: "take_shower", en: "Enjoy warm refreshing shower", vi: "Tắm dưới vòi sen ấm áp", action: "take_shower" },
        { id: "dry_with_towel", en: "Dry off with soft cotton towel", vi: "Lau khô người bằng khăn bông", action: "dry_with_towel" },
        { id: "weigh_self", en: "Step on bathroom health scale", vi: "Bước lên cân kiểm tra sức khỏe", action: "weigh_self" },
        { id: "take_bath", en: "Soak in pleasant bathtub", vi: "Ngâm mình trong bồn tắm", action: "take_bath" },
        { id: "flush_toilet", en: "Flush toilet and sanitize", vi: "Xả nước bồn cầu sạch sẽ", action: "flush_toilet" }
      ],
      bars: [
        { id: "personalGlow", label: "Cleanliness Glow", labelVi: "Độ sạch cá nhân", start: 10, target: 80, step: 25, required: true },
        { id: "freshFragrance", label: "Fragrance", labelVi: "Mùi hương dễ chịu", start: 15, target: 80, step: 25, required: true },
        { id: "bathroomSanitary", label: "Sanitary State", labelVi: "Vệ sinh phòng tắm", start: 20, target: 80, step: 20, required: true }
      ],
      actionBars: {
        wash_hands: { personalGlow: 25, bathroomSanitary: 15 },
        brush_teeth: { personalGlow: 30, freshFragrance: 25 },
        wash_face: { personalGlow: 25 },
        look_in_mirror: { personalGlow: 15 },
        comb_hair: { personalGlow: 20 },
        take_shower: { personalGlow: 40, freshFragrance: 35 },
        dry_with_towel: { personalGlow: 20 },
        weigh_self: { personalGlow: 15 },
        take_bath: { personalGlow: 35, freshFragrance: 30 },
        flush_toilet: { bathroomSanitary: 50 }
      }
    },
    {
      id: "energy_saver",
      title: "Eco Guardian: Save Energy & Water",
      titleVi: "Hiệp sĩ bảo vệ môi trường: Tiết kiệm điện nước",
      desc: "Turn off idle lights, appliances, taps and conserve home resources.",
      descVi: "Tắt thiết bị không dùng, khóa vòi nước và tiết kiệm tài nguyên gia đình.",
      tasks: [
        { id: "turn_off_tv", en: "Turn off idle television screen", vi: "Tắt màn hình tivi khi không xem", action: "turn_off_tv" },
        { id: "turn_off_floor_lamp", en: "Switch off bright floor lamp", vi: "Tắt đèn cây chiếu sáng", action: "turn_off_floor_lamp" },
        { id: "turn_off_fan", en: "Turn off electric standing fan", vi: "Tắt quạt đứng", action: "turn_off_fan" },
        { id: "close_living_curtains", en: "Close curtains to keep heat inside", vi: "Kéo rèm che giữ nhiệt", action: "close_living_curtains" },
        { id: "close_window", en: "Shut open window tight", vi: "Đóng kín cửa sổ", action: "close_window" },
        { id: "k_turn_off_stove", en: "Turn off kitchen gas burner", vi: "Khóa bếp gas nhà bếp", action: "k_turn_off_stove" },
        { id: "turn_off_faucet", en: "Shut kitchen faucet dripping water", vi: "Khóa chặt vòi nước nhỏ giọt", action: "turn_off_faucet" },
        { id: "turn_off_bath_tap", en: "Shut bathroom tub tap", vi: "Khóa vòi xả bồn tắm", action: "turn_off_bath_tap" },
        { id: "turn_off_garden_hose", en: "Close garden watering valve", vi: "Khóa van tưới cây ngoài vườn", action: "turn_off_garden_hose" },
        { id: "close_fridge", en: "Ensure fridge door is sealed tight", vi: "Đóng chặt cánh cửa tủ lạnh", action: "close_fridge" }
      ],
      bars: [
        { id: "electricitySaved", label: "Electricity Saved", labelVi: "Điện năng tiết kiệm", start: 10, target: 80, step: 25, required: true },
        { id: "waterPreserved", label: "Water Preserved", labelVi: "Nước sạch bảo tồn", start: 15, target: 80, step: 25, required: true },
        { id: "greenFootprint", label: "Eco Rating", labelVi: "Chỉ số sống xanh", start: 20, target: 80, step: 20, required: true }
      ],
      actionBars: {
        turn_off_tv: { electricitySaved: 25, greenFootprint: 20 },
        turn_off_floor_lamp: { electricitySaved: 25, greenFootprint: 15 },
        turn_off_fan: { electricitySaved: 25, greenFootprint: 15 },
        close_living_curtains: { greenFootprint: 25 },
        close_window: { greenFootprint: 25 },
        k_turn_off_stove: { electricitySaved: 30, greenFootprint: 20 },
        turn_off_faucet: { waterPreserved: 35, greenFootprint: 20 },
        turn_off_bath_tap: { waterPreserved: 35, greenFootprint: 20 },
        turn_off_garden_hose: { waterPreserved: 40, greenFootprint: 25 },
        close_fridge: { electricitySaved: 25, greenFootprint: 15 }
      }
    },
    {
      id: "family_helper",
      title: "Helpful Family Member",
      titleVi: "Thành viên gương mẫu trong gia đình",
      desc: "Share chores, help parents, take care of siblings and pet.",
      descVi: "Chia sẻ việc nhà, giúp đỡ bố mẹ, chăm sóc thú cưng và em nhỏ.",
      tasks: [
        { id: "k_set_table", en: "Set plates and cups for dinner", vi: "Dọn bát đĩa cho bữa tối", action: "k_set_table" },
        { id: "k_clear_table", en: "Clear bowls after everyone finishes", vi: "Dọn dẹp bát sau khi ăn xong", action: "k_clear_table" },
        { id: "empty_trash", en: "Take garbage bag out to roadside bin", vi: "Đem túi rác ra thùng rác lớn", action: "empty_trash" },
        { id: "sweep_floor", en: "Sweep dust bunnies from living room", vi: "Quét sạch bụi sàn nhà", action: "sweep_floor" },
        { id: "wipe_table", en: "Wipe dining table sparkling clean", vi: "Lau bàn ăn sạch bóng", action: "wipe_table" },
        { id: "water_plant", en: "Water mother's favorite indoor plant", vi: "Tưới chậu cây mẹ thích nhất", action: "water_plant" },
        { id: "feed_cat", en: "Pour crunchy cat food into bowl", vi: "Đổ hạt thức ăn cho mèo", action: "feed_cat" },
        { id: "k_put_dishes_away", en: "Stack dry plates back into cabinet", vi: "Cất đĩa khô ráo vào chạn", action: "k_put_dishes_away" },
        { id: "fold_throw", en: "Fold the living room sofa blanket", vi: "Gấp gọn chăn trên ghế sofa", action: "fold_throw" },
        { id: "k_have_breakfast", en: "Eat breakfast together happily", vi: "Cùng cả nhà ăn sáng vui vẻ", action: "k_have_breakfast" }
      ],
      bars: [
        { id: "helpfulness", label: "Helpfulness", labelVi: "Chỉ số giúp ích", start: 10, target: 80, step: 25, required: true },
        { id: "responsibility", label: "Responsibility", labelVi: "Tính tự giác", start: 15, target: 80, step: 25, required: true },
        { id: "familyWarmth", label: "Family Warmth", labelVi: "Ấm áp gia đình", start: 20, target: 80, step: 20, required: true }
      ],
      actionBars: {
        k_set_table: { helpfulness: 30, familyWarmth: 20 },
        k_clear_table: { helpfulness: 30, responsibility: 25 },
        empty_trash: { responsibility: 35 },
        sweep_floor: { helpfulness: 25, responsibility: 20 },
        wipe_table: { helpfulness: 25 },
        water_plant: { helpfulness: 20, familyWarmth: 25 },
        feed_cat: { responsibility: 30, familyWarmth: 25 },
        k_put_dishes_away: { responsibility: 30, helpfulness: 25 },
        fold_throw: { responsibility: 20, helpfulness: 20 },
        k_have_breakfast: { familyWarmth: 40 }
      }
    }
  ];

  const css = `
.ch-card{background:#fffdfa;border:2px solid #2e7d32;border-radius:12px;padding:12px 14px;box-shadow:0 3px 12px rgba(46,125,50,.15);box-sizing:border-box}
.ch-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;border-bottom:1px solid #e0e0e0;padding-bottom:6px}
.ch-badge{display:inline-flex;align-items:center;gap:4px;font-weight:700;font-size:12px;color:#2e7d32;background:#e8f5e9;padding:3px 8px;border-radius:999px;border:1px solid #c8e6c9}
.ch-mode{font-size:12px;color:#616161;font-weight:600}
.ch-title{font-size:16px;font-weight:700;color:#1b5e20;margin:0 0 4px}
.ch-desc{font-size:13px;color:#424242;margin-bottom:10px}
.ch-desc .vi{color:#616161;font-size:12px;margin-top:2px}
.ch-bars{display:flex;flex-direction:column;gap:8px;margin-bottom:12px;background:#f9fbe7;padding:8px 10px;border-radius:8px;border:1px solid #dce775}
.ch-bar-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px}
.ch-bar-name{font-weight:700;color:#2e7d32;flex:1 1 120px;display:flex;align-items:center;gap:4px}
.ch-bar-track{flex:2 1 160px;background:#e0e0e0;height:12px;border-radius:6px;overflow:hidden;position:relative}
.ch-bar-fill{height:100%;background:#e57373;transition:width .4s ease, background-color .4s ease}
.ch-bar-fill.green{background:#2e7d32 !important}
.ch-bar-val{font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;min-width:40px;text-align:right;color:#212121}
.ch-tasks{display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;padding-right:4px}
.ch-task-item{display:flex;align-items:center;gap:8px;background:#fff;padding:6px 10px;border-radius:8px;border:1px solid #eeeeee;font-size:13px}
.ch-task-item.done{background:#f1f8e9;border-color:#a5d6a7;color:#2e7d32}
.ch-task-check{font-size:14px}
.ch-task-txt{flex:1}
.ch-task-txt .vi{font-size:11px;color:#757575}
.ch-task-act button{border:0;background:#2e7d32;color:#fff;border-radius:6px;padding:3px 8px;font-size:11px;cursor:pointer}
.ch-congrats{background:#e8f5e9;border:2px solid #43a047;border-radius:10px;padding:10px;text-align:center;font-weight:700;color:#1b5e20;margin-top:8px}
`;

  let currentChallenge = null;
  let activeMode = "practice"; // "practice" | "ranked"
  let currentBarState = {}; // { barId: number }
  let completedTasks = new Set();
  let listeners = [];

  function subscribe(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }
  function notify() {
    for (const l of listeners) {
      try { l(currentChallenge); } catch (e) { console.error(e); }
    }
  }

  function start(challengeId, options = {}) {
    const def = CHALLENGES.find(c => c.id === challengeId);
    if (!def) return null;
    activeMode = options.mode || "practice";
    completedTasks.clear();
    currentBarState = {};
    for (const b of def.bars) {
      currentBarState[b.id] = b.start || 0;
    }

    currentChallenge = {
      id: def.id,
      def: { ...def },
      mode: activeMode,
      startedAt: Date.now(),
      done: false,
      completed: false,
      tasks: def.tasks.map(t => ({ ...t, done: false }))
    };

    updateStatus();
    notify();
    return current();
  }

  function bars() {
    if (!currentChallenge) return [];
    return currentChallenge.def.bars.map(b => {
      const cur = Math.min(100, Math.max(0, currentBarState[b.id] || 0));
      const target = b.target || 80;
      const ok = cur >= target;
      return {
        id: b.id,
        label: b.label,
        labelVi: b.labelVi,
        value: cur,
        cur: cur,
        target: target,
        required: b.required !== false,
        ok: ok,
        green: ok
      };
    });
  }

  function checkAllRequiredBarsGreen() {
    const barList = bars();
    if (!barList.length) return false;
    return barList.filter(b => b.required).every(b => b.green);
  }

  function updateStatus() {
    if (!currentChallenge) return;
    const allGreen = checkAllRequiredBarsGreen();
    const allTasksDone = currentChallenge.tasks.every(t => t.done);
    // CRITICAL: challenge completes ONLY when EVERY required bar is green!
    const isFinished = allGreen && allTasksDone;
    currentChallenge.done = isFinished;
    currentChallenge.completed = isFinished;
  }

  function onAction(actionId, worldState) {
    if (!currentChallenge || currentChallenge.done) return false;
    let progressed = false;

    // 1. Check if action completes any task in the challenge
    for (const t of currentChallenge.tasks) {
      if (t.action === actionId && !t.done) {
        t.done = true;
        completedTasks.add(t.id);
        progressed = true;
      }
    }

    // 2. Update bars corresponding to this action
    const actionBars = currentChallenge.def.actionBars && currentChallenge.def.actionBars[actionId];
    if (actionBars) {
      for (const [barId, delta] of Object.entries(actionBars)) {
        if (currentBarState[barId] !== undefined) {
          currentBarState[barId] = Math.min(100, Math.max(0, currentBarState[barId] + delta));
          progressed = true;
        }
      }
    } else {
      // General boost on valid actions
      for (const b of currentChallenge.def.bars) {
        if (currentBarState[b.id] !== undefined && currentBarState[b.id] < 100) {
          currentBarState[b.id] = Math.min(100, currentBarState[b.id] + (b.step || 10));
          progressed = true;
        }
      }
    }

    if (progressed) {
      updateStatus();
      notify();
    }

    return progressed;
  }

  function current() {
    if (!currentChallenge) return null;
    const barList = bars();
    const allGreen = barList.filter(b => b.required).every(b => b.green);
    return {
      id: currentChallenge.id,
      title: currentChallenge.def.title,
      titleVi: currentChallenge.def.titleVi,
      mode: currentChallenge.mode,
      tasks: currentChallenge.tasks,
      done: currentChallenge.done,
      completed: currentChallenge.completed,
      bars: barList,
      allBarsGreen: allGreen,
      progress: {
        tasksDone: currentChallenge.tasks.filter(t => t.done).length,
        tasksTotal: currentChallenge.tasks.length,
        barsGreen: barList.filter(b => b.green).length,
        barsTotal: barList.length
      }
    };
  }

  function mountHud(container, callbacks = {}) {
    if (!container || typeof document === "undefined") return;
    if (!document.getElementById("ch-css")) {
      const st = document.createElement("style");
      st.id = "ch-css";
      st.textContent = css;
      document.head.appendChild(st);
    }

    function render() {
      const cur = current();
      if (!cur) {
        container.innerHTML = `
<div class="ch-card">
  <div class="ch-head">
    <span class="ch-badge">🏆 CHẾ ĐỘ THỬ THÁCH</span>
  </div>
  <div style="font-size:13px;color:#616161">Chọn một thử thách để bắt đầu rèn luyện!</div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
    ${CHALLENGES.map(c => `<button class="btn" style="padding:4px 8px;font-size:12px" data-ch="${c.id}">${c.titleVi}</button>`).join("")}
  </div>
</div>`;
        container.querySelectorAll("[data-ch]").forEach(b => {
          b.onclick = () => { start(b.dataset.ch, { mode: "practice" }); };
        });
        return;
      }

      const barList = cur.bars;
      container.innerHTML = `
<div class="ch-card">
  <div class="ch-head">
    <span class="ch-badge">🏆 ${cur.titleVi}</span>
    <span class="ch-mode">Chế độ: ${cur.mode === "practice" ? "Luyện tập" : "Thi đấu"}</span>
  </div>
  <div class="ch-desc">
    <div class="en">${cur.def ? cur.def.desc : ""}</div>
    <div class="vi">${cur.def ? cur.def.descVi : ""}</div>
  </div>
  <div class="ch-bars">
    ${barList.map(b => `
      <div class="ch-bar-row">
        <span class="ch-bar-name">${b.green ? "🟢" : "🔴"} ${b.labelVi}:</span>
        <div class="ch-bar-track">
          <div class="ch-bar-fill ${b.green ? "green" : ""}" style="width:${b.cur}%"></div>
        </div>
        <span class="ch-bar-val" style="color:${b.green ? "#2e7d32" : "#c62828"}">${b.cur}%</span>
      </div>`).join("")}
  </div>
  <div class="ch-tasks">
    ${cur.tasks.map(t => `
      <div class="ch-task-item ${t.done ? "done" : ""}">
        <span class="ch-task-check">${t.done ? "✅" : "⬜"}</span>
        <div class="ch-task-txt">
          <div class="en">${t.en}</div>
          <div class="vi">${t.vi}</div>
        </div>
        ${!t.done ? `<div class="ch-task-act"><button data-act="${t.action}">Làm</button></div>` : ""}
      </div>`).join("")}
  </div>
  ${cur.done ? `<div class="ch-congrats">🎉 CHÚC MỪNG! BẠN ĐÃ HOÀN THÀNH THỬ THÁCH VỚI 100% THANH XANH!</div>` : ""}
</div>`;

      container.querySelectorAll("[data-act]").forEach(b => {
        b.onclick = () => {
          if (callbacks.enqueue) callbacks.enqueue(b.dataset.act);
        };
      });
    }

    render();
    return subscribe(render);
  }

  const API = {
    CHALLENGES,
    css,
    start,
    current,
    bars,
    onAction,
    subscribe,
    mountHud,
    reset: () => {
      currentChallenge = null;
      completedTasks.clear();
      currentBarState = {};
      notify();
    }
  };

  root.ELW_CHALLENGE = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
