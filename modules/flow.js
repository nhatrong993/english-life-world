/* English Life World — Cô Mai quick-suggestion flow.
   window.ELW_FLOW = { NEXT, ROUTINES, suggest, timeOfDay, greet_vi, renderChips, renderRoutines }
   Pure data + tiny DOM helpers; no dependency on index.html internals. */
(function () {
"use strict";

// n(id, why, weight, when) — compact entry builder; every reason starts with "Vì ..."
const ensureViReason = why => {
  const s = String(why || "").trim();
  if (!s) return "Vì hành động này phù hợp lúc này.";
  if (/^Vì(\s|…)/i.test(s)) return s;
  return "Vì " + s.charAt(0).toLowerCase() + s.slice(1);
};
const n = (id, why_vi, weight, when) => {
  const w = ensureViReason(why_vi);
  return when ? { id, why_vi: w, weight: weight || 1, when } : { id, why_vi: w, weight: weight || 1 };
};
const cupFull = W => (W.cupLevel || 0) > 0;
const catAwake = W => W.cat && W.cat !== "sleeping";
const lightsLow = W => W.floorLamp !== "on";

const NEXT = {
  // ---------- Living room: fridge / milk / cup / table ----------
  open_fridge: [n("take_milk", "Lấy hộp sữa ra uống nào.", 3, W => W.milk === "fridge"), n("put_milk_back", "Cất sữa vào cho khỏi hỏng.", 2, W => W.milk !== "fridge"), n("close_fridge", "Nhớ đóng tủ lạnh để giữ lạnh nhé.", 2)],
  take_milk: [n("close_fridge", "Lấy xong rồi, đóng tủ lạnh lại thôi.", 3, W => W.fridge === "open"), n("put_cup_on_table", "Đặt cốc lên bàn để rót sữa.", 3, W => W.cup !== "table"), n("pour_milk", "Rót sữa vào cốc nào!", 3, W => W.cup === "table")],
  put_milk_back: [n("close_fridge", "Đóng tủ lạnh lại nhé.", 3, W => W.fridge === "open"), n("pick_up_cup", "Cầm cốc sữa lên uống thôi.", 2, cupFull), n("wipe_table", "Lau bàn cho sạch sẽ.", 1)],
  close_fridge: [n("pour_milk", "Rót sữa ra cốc nào.", 3, W => W.milk !== "fridge" && W.cup === "table" && (W.cupLevel || 0) < 2), n("put_cup_on_table", "Đặt cốc lên bàn trước nhé.", 2, W => W.cup !== "table" && W.milk !== "fridge"), n("pick_up_cup", "Cầm cốc lên uống sữa.", 2, cupFull), n("wipe_table", "Tranh thủ lau bàn.", 1)],
  pick_up_cup: [n("drink_from_cup", "Uống một ngụm cho mát nào.", 3, cupFull), n("sit_on_chair", "Ngồi xuống uống cho thoải mái.", 2, W => !W.sitting && cupFull(W)), n("put_cup_on_table", "Đặt cốc lên bàn để rót sữa.", 2, W => !cupFull(W))],
  put_cup_on_table: [n("pour_milk", "Cốc đã trên bàn, rót sữa thôi!", 3, W => (W.cupLevel || 0) < 2), n("take_milk", "Lấy sữa trong tủ lạnh ra nhé.", 2, W => W.milk === "fridge"), n("pull_out_chair", "Kéo ghế ra ngồi nào.", 1, W => W.chair === "in")],
  pour_milk: [n("put_milk_back", "Cất sữa vào tủ lạnh cho khỏi hỏng.", 2), n("pick_up_cup", "Cầm cốc lên nào.", 3), n("sit_on_chair", "Ngồi xuống thưởng thức sữa.", 2, W => !W.sitting)],
  drink_from_cup: [n("put_cup_on_table", "Đặt cốc xuống bàn đã.", 2, W => W.cup === "hand"), n("wipe_table", "Uống xong lau bàn cho sạch.", 2), n("get_up", "Đứng dậy vận động chút nhé.", 1, W => W.sitting), n("pick_up_book", "Vừa uống vừa đọc sách thì tuyệt.", 1, W => W.book === "floor")],
  wipe_table: [n("put_book_on_table", "Bàn sạch rồi, đặt sách lên.", 2, W => W.book !== "table"), n("sweep_under_table", "Quét luôn dưới gầm bàn nhé.", 2), n("water_plant", "Tưới cây cho xanh tốt.", 1)],
  put_book_on_table: [n("pull_out_chair", "Kéo ghế ra ngồi đọc sách.", 2, W => W.chair === "in" && !W.sitting), n("sit_on_chair", "Ngồi xuống đọc nào.", 2, W => !W.sitting), n("wipe_table", "Lau bàn một chút.", 1)],
  sweep_under_table: [n("sweep_floor", "Quét nốt cả sàn nhà.", 3), n("push_chair_in", "Đẩy ghế vào cho gọn.", 2, W => W.chair === "out"), n("wipe_table", "Lau bàn nữa là sạch bong.", 1)],
  pull_out_chair: [n("sit_on_chair", "Ghế ra rồi, ngồi xuống thôi.", 3, W => !W.sitting), n("sweep_under_table", "Ghế ra rồi, quét gầm bàn dễ hơn.", 2), n("put_book_on_table", "Đặt sách lên bàn trước nhé.", 1, W => W.book !== "table")],
  sit_on_chair: [n("drink_from_cup", "Ngồi rồi, uống sữa thôi.", 3, cupFull), n("get_up", "Ngồi đủ rồi thì đứng dậy nhé.", 1), n("watch_tv", "Ngồi xem ti vi chút nhé.", 2, W => W.tv === "on")],
  get_up: [n("push_chair_in", "Đẩy ghế vào cho gọn.", 3, W => W.chair === "out"), n("wipe_table", "Lau bàn sau khi dùng.", 2), n("open_window", "Mở cửa sổ cho thoáng.", 1, W => W.window === "closed"), n("go_kitchen", "Xuống bếp kiếm gì ăn nào.", 1)],
  push_chair_in: [n("sweep_floor", "Quét nhà cho sạch.", 2), n("water_plant", "Đi tưới cây nhé.", 1), n("sit_on_sofa", "Ra sofa nghỉ chút.", 2, W => !W.sofa)],
  sweep_floor: [n("sweep_under_table", "Đừng quên dưới gầm bàn nhé.", 2), n("water_plant", "Quét xong tưới cây.", 2), n("open_window", "Mở cửa sổ cho bụi bay ra.", 2, W => W.window === "closed"), n("fluff_cushion", "Vỗ lại gối tựa sofa.", 1)],
  open_window: [n("water_plant", "Nắng gió vào rồi, tưới cây thôi.", 2), n("sweep_floor", "Mở cửa cho thoáng rồi quét nhà.", 2), n("turn_off_fan", "Có gió trời rồi, tắt quạt đi.", 2, W => W.fan === "on"), n("open_living_curtains", "Kéo rèm ra cho sáng hơn.", 2, W => W.livCurtains !== "open")],
  close_window: [n("turn_on_fan", "Đóng cửa rồi, bật quạt cho mát.", 2, W => W.fan !== "on"), n("close_living_curtains", "Kéo rèm lại luôn nhé.", 2, W => W.livCurtains === "open"), n("turn_on_floor_lamp", "Bật đèn cho ấm cúng.", 1, lightsLow)],
  water_plant: [n("open_window", "Cho cây đón nắng gió nhé.", 2, W => W.window === "closed"), n("sweep_floor", "Quét chỗ nước rơi.", 1), n("sit_on_sofa", "Xong việc rồi, nghỉ chút.", 2, W => !W.sofa)],
  pick_up_book: [n("read_on_sofa", "Mang sách ra sofa đọc thôi.", 3, W => W.sofa !== "lying"), n("put_book_on_table", "Đặt sách lên bàn cho gọn.", 2), n("sit_on_chair", "Ngồi ghế đọc sách.", 1, W => !W.sitting)],
  turn_on_tv: [n("watch_tv", "Ti vi bật rồi, xem thôi!", 3), n("pick_up_remote", "Cầm điều khiển để đổi kênh.", 2), n("sit_on_sofa", "Ngồi sofa xem cho thoải mái.", 3, W => !W.sofa)],
  watch_tv: [n("lie_on_sofa", "Xem xong nằm sofa thư giãn nhé.", 3, W => W.sofa !== "lying"), n("call_cat", "Gọi mèo lại xem cùng nào.", 2), n("turn_off_tv", "Xem đủ rồi, tắt ti vi nhé.", 2)],
  turn_off_tv: [n("lie_on_sofa", "Nằm sofa nghỉ ngơi chút.", 2, W => W.sofa !== "lying"), n("listen_to_music", "Đổi sang nghe nhạc nhé.", 2, W => W.music !== "on"), n("call_cat", "Gọi mèo lại chơi.", 2), n("go_bedroom", "Muộn rồi, về phòng ngủ thôi.", 1)],
  // ---------- Kitchen ----------
  turn_on_stove: [n("fry_egg", "Chảo nóng rồi, rán trứng thôi.", 3), n("fill_kettle", "Tranh thủ đổ nước đun luôn.", 1)],
  fry_egg: [n("turn_off_stove", "Trứng chín rồi, tắt bếp nhé.", 3), n("toast_bread", "Nướng bánh mì ăn kèm trứng.", 2, W => W.k_toaster === "empty"), n("set_the_table", "Bày bàn để ăn sáng.", 2, W => W.k_table !== "set")],
  turn_off_stove: [n("set_the_table", "Bày bàn ra ăn thôi.", 3, W => W.k_table !== "set"), n("eat_breakfast", "Ăn sáng cho nóng nào.", 3, W => W.k_table === "set"), n("wash_hands", "Rửa tay trước khi ăn.", 1, W => W.k_faucet === "on")],
  fill_kettle: [n("boil_water", "Đun sôi nước nào.", 3), n("turn_off_faucet", "Khoá vòi nước lại nhé.", 2, W => W.k_faucet === "on")],
  boil_water: [n("pour_hot_water", "Nước sôi rồi, rót ra nhé.", 3), n("make_coffee", "Pha cà phê trong lúc chờ.", 2, W => W.k_coffee === "none"), n("wash_rice", "Tranh thủ vo gạo.", 1, W => W.k_rice === "none")],
  pour_hot_water: [n("make_coffee", "Có nước nóng rồi, pha cà phê.", 2, W => W.k_coffee === "none"), n("sit_on_chair", "Ngồi xuống thưởng thức.", 1, W => !W.sitting), n("set_the_table", "Bày bàn ăn sáng.", 2, W => W.k_table !== "set")],
  wash_rice: [n("cook_rice", "Gạo sạch rồi, nấu cơm thôi.", 3), n("turn_off_faucet", "Khoá vòi nước nhé.", 2, W => W.k_faucet === "on")],
  cook_rice: [n("serve_rice", "Cơm chín rồi, xới cơm nào.", 3), n("fry_egg", "Rán trứng ăn với cơm.", 2, W => W.k_stove === "on"), n("turn_on_stove", "Bật bếp nấu thêm món.", 1, W => W.k_stove !== "on")],
  serve_rice: [n("set_the_table", "Bày bàn để ăn.", 2, W => W.k_table !== "set"), n("eat_breakfast", "Ăn cơm thôi!", 3, W => W.k_table === "set"), n("heat_up_food", "Hâm nóng thức ăn ăn kèm.", 1, W => W.k_food !== "hot")],
  open_microwave: [n("heat_up_food", "Cho đồ ăn vào hâm nóng.", 3), n("close_microwave", "Đóng lò lại nhé.", 2)],
  heat_up_food: [n("close_microwave", "Đóng cửa lò lại.", 2, W => W.k_micro === "open"), n("set_the_table", "Bày bàn để ăn.", 3, W => W.k_table !== "set"), n("eat_breakfast", "Đồ ăn nóng rồi, ăn thôi.", 2, W => W.k_table === "set")],
  close_microwave: [n("set_the_table", "Bày bàn ăn thôi.", 2, W => W.k_table !== "set"), n("eat_breakfast", "Ăn khi còn nóng.", 2, W => W.k_table === "set"), n("wash_hands", "Rửa tay trước khi ăn.", 1, W => W.k_faucet === "on")],
  turn_on_faucet: [n("wash_hands", "Rửa tay sạch sẽ nào.", 3), n("wash_dishes", "Rửa bát luôn nhé.", 3, W => W.k_dishes === "dirty"), n("fill_kettle", "Đổ nước vào ấm.", 2, W => W.k_kettle === "empty")],
  wash_dishes: [n("put_dishes_in_rack", "Úp bát lên giá cho ráo.", 3), n("turn_off_faucet", "Khoá vòi tiết kiệm nước.", 2), n("wash_hands", "Rửa tay cho sạch.", 1)],
  wash_hands: [n("turn_off_faucet", "Khoá vòi nước lại nhé.", 3), n("set_the_table", "Tay sạch rồi, bày bàn ăn.", 2, W => W.k_table !== "set"), n("eat_breakfast", "Tay sạch rồi, ăn thôi.", 2, W => W.k_table === "set")],
  turn_off_faucet: [n("put_dishes_in_rack", "Úp bát lên giá.", 2, W => W.k_dishes === "clean"), n("boil_water", "Đun nước thôi.", 2, W => W.k_kettle === "full"), n("dry_plates", "Lau khô đĩa nhé.", 2, W => W.k_dishes === "wet"), n("make_coffee", "Pha một cốc cà phê.", 1, W => W.k_coffee === "none")],
  put_dishes_in_rack: [n("dry_plates", "Lau khô đĩa nào.", 3), n("turn_off_faucet", "Khoá vòi nước nhé.", 2, W => W.k_faucet === "on")],
  dry_plates: [n("open_cabinet", "Mở tủ để cất đĩa.", 3, W => W.k_cabinet !== "open"), n("put_plates_away", "Cất đĩa vào tủ.", 3, W => W.k_cabinet === "open")],
  open_cabinet: [n("put_plates_away", "Cất đĩa vào tủ.", 3, W => W.k_dishes === "dry"), n("set_the_table", "Lấy bát đĩa bày bàn.", 2, W => W.k_table !== "set"), n("close_cabinet", "Đóng tủ lại nhé.", 1)],
  put_plates_away: [n("close_cabinet", "Cất xong rồi, đóng tủ nhé.", 3), n("take_out_trash", "Đổ rác cho bếp sạch.", 1, W => W.k_trash === "full")],
  close_cabinet: [n("take_out_trash", "Đổ rác nốt nhé.", 2, W => W.k_trash === "full"), n("make_coffee", "Xong việc, pha cà phê thưởng.", 2, W => W.k_coffee === "none"), n("go_living", "Ra phòng khách nghỉ ngơi.", 1)],
  set_the_table: [n("sit_at_the_table", "Bàn bày xong rồi, ngồi vào bàn ăn nhé!", 3, W => !W.sitting), n("eat_breakfast", "Bàn bày xong, ăn sáng thôi!", 3), n("toast_bread", "Nướng thêm bánh mì.", 1, W => W.k_toaster === "empty"), n("pour_coffee", "Rót cà phê ra cốc.", 1, W => W.k_coffee === "ready")],
  sit_at_the_table: [n("eat_breakfast", "Ngồi vào bàn rồi, ăn sáng thôi!", 3, W => W.k_table === "set"), n("set_the_table", "Bày bàn ăn trước nhé.", 2, W => W.k_table !== "set"), n("drink_coffee", "Nhâm nhi tách cà phê nóng.", 2, W => W.k_mug === "coffee"), n("get_up_from_table", "Ngồi nghỉ đủ rồi, đứng dậy nhé.", 1)],
  eat_breakfast: [n("drink_coffee", "Ăn xong nhâm nhi cà phê.", 2, W => W.k_mug === "coffee"), n("get_up_from_table", "No rồi, đứng dậy nhé.", 3), n("clear_the_table", "Dọn bàn sau khi ăn.", 1, W => !W.sitting)],
  get_up_from_table: [n("clear_the_table", "Dọn bàn cho gọn.", 3), n("wash_dishes", "Rửa bát luôn nhé.", 2, W => W.k_dishes === "dirty" && W.k_faucet === "on"), n("turn_on_faucet", "Mở vòi để rửa bát.", 2, W => W.k_faucet !== "on")],
  clear_the_table: [n("turn_on_faucet", "Mở vòi để rửa bát.", 3, W => W.k_faucet !== "on"), n("wash_dishes", "Rửa bát thôi.", 3, W => W.k_faucet === "on" && W.k_dishes === "dirty"), n("take_out_trash", "Đổ rác luôn nhé.", 1, W => W.k_trash === "full")],
  toast_bread: [n("take_out_toast", "Bánh giòn rồi, lấy ra nhé.", 3), n("make_coffee", "Pha cà phê ăn kèm.", 2, W => W.k_coffee === "none"), n("fry_egg", "Rán trứng ăn kèm.", 1, W => W.k_stove === "on")],
  take_out_toast: [n("set_the_table", "Bày bàn ăn sáng.", 3, W => W.k_table !== "set"), n("eat_breakfast", "Ăn bánh mì nóng giòn.", 3, W => W.k_table === "set"), n("make_coffee", "Thêm cốc cà phê nữa.", 1, W => W.k_coffee === "none")],
  make_coffee: [n("pour_coffee", "Cà phê xong, rót ra cốc nào.", 3), n("toast_bread", "Nướng bánh mì trong lúc chờ.", 1, W => W.k_toaster === "empty")],
  pour_coffee: [n("drink_coffee", "Nhâm nhi cà phê thôi.", 3), n("sit_on_chair", "Ngồi xuống uống cho thong thả.", 2, W => !W.sitting && W.room === "living"), n("set_the_table", "Bày bàn để ngồi uống.", 1, W => W.k_table !== "set")],
  drink_coffee: [n("wash_dishes", "Rửa cốc sau khi uống.", 1, W => W.k_faucet === "on" && W.k_dishes === "dirty"), n("go_living", "Ra phòng khách thư giãn.", 2), n("sit_on_sofa", "Ra sofa ngồi cho thoải mái.", 2, W => !W.sofa), n("check_phone", "Xem điện thoại một chút.", 1, W => W.b_phone && W.b_phone !== "low")],
  take_out_trash: [n("put_in_new_bag", "Lồng túi rác mới vào nhé.", 3), n("wash_hands", "Đổ rác xong rửa tay nhé.", 2, W => W.k_faucet === "on"), n("turn_on_faucet", "Mở vòi rửa tay.", 2, W => W.k_faucet !== "on")],
  put_in_new_bag: [n("turn_on_faucet", "Mở vòi rửa tay nào.", 3, W => W.k_faucet !== "on"), n("wash_hands", "Rửa tay cho sạch.", 3, W => W.k_faucet === "on"), n("go_living", "Ra phòng khách nghỉ.", 1)],
  // ---------- Bedroom ----------
  turn_off_alarm: [n("sit_on_bed", "Ngồi dậy cho tỉnh ngủ.", 3, W => !W.sitting), n("get_out_of_bed", "Dậy thôi, ngày mới rồi!", 3, W => W.sitting), n("check_phone", "Xem giờ trên điện thoại.", 1, W => W.b_phone !== "low")],
  set_alarm: [n("turn_off_lamp", "Tắt đèn đi ngủ thôi.", 3, W => W.b_lamp === "on"), n("lie_down", "Nằm xuống ngủ ngon nhé.", 3, W => !W.b_lying && W.b_pillow !== "floor"), n("charge_phone", "Cắm sạc điện thoại qua đêm.", 2, W => W.b_phone === "low")],
  lie_down: [n("turn_off_lamp", "Tắt đèn cho dễ ngủ.", 3, W => W.b_lamp === "on"), n("read_in_bed", "Đọc vài trang sách trước khi ngủ.", 2, W => W.b_lamp === "on"), n("sit_on_bed", "Ngồi dậy nào.", 1)],
  sit_on_bed: [n("get_out_of_bed", "Ra khỏi giường thôi.", 3), n("put_on_slippers", "Xỏ dép vào cho ấm chân.", 2, W => W.b_slippers !== "on"), n("read_in_bed", "Đọc sách trên giường.", 1, W => W.b_lamp === "on")],
  get_out_of_bed: [n("open_curtains", "Kéo rèm đón nắng sớm.", 3, W => W.b_curtains !== "open"), n("put_on_slippers", "Đi dép vào nhé.", 2, W => W.b_slippers !== "on"), n("make_bed", "Dọn giường cho gọn.", 2, W => W.b_pillow !== "floor"), n("pick_up_pillow", "Nhặt gối dưới sàn lên.", 2, W => W.b_pillow === "floor")],
  make_bed: [n("go_kitchen", "Xuống bếp đun nước thôi.", 3), n("open_wardrobe", "Chọn quần áo mặc hôm nay.", 2, W => W.b_wardrobe !== "open"), n("pick_up_clothes", "Nhặt quần áo bẩn dưới sàn.", 2, W => W.b_clothes === "floor"), n("look_in_mirror", "Soi gương chút nào.", 1)],
  pick_up_pillow: [n("fluff_pillow", "Vỗ gối cho phồng.", 3), n("make_bed", "Dọn giường luôn nhé.", 3), n("lie_down", "Nằm nghỉ chút.", 1, W => W.activity !== "morning")],
  fluff_pillow: [n("spread_blanket", "Trải chăn cho phẳng.", 3, W => W.b_blanket !== "spread"), n("make_bed", "Dọn nốt giường.", 2), n("lie_down", "Gối êm rồi, nằm thử nhé.", 1)],
  fold_blanket: [n("pick_up_pillow", "Nhặt gối lên nữa.", 2, W => W.b_pillow === "floor"), n("fluff_pillow", "Vỗ gối cho phồng.", 2, W => W.b_pillow === "bed"), n("open_curtains", "Kéo rèm cho sáng phòng.", 1, W => W.b_curtains !== "open")],
  spread_blanket: [n("make_bed", "Dọn nốt cho gọn gàng.", 2), n("lie_down", "Chăn êm rồi, nằm xuống nhé.", 2, W => W.b_pillow !== "floor"), n("open_wardrobe", "Mở tủ lấy quần áo.", 1, W => W.b_wardrobe !== "open")],
  open_wardrobe: [n("take_out_shirt", "Lấy áo ra mặc nào.", 3, W => W.b_shirt === "wardrobe"), n("hang_up_shirt", "Treo áo lại vào tủ.", 3, W => W.b_shirt === "bed"), n("close_wardrobe", "Đóng tủ lại nhé.", 1)],
  take_out_shirt: [n("close_wardrobe", "Đóng tủ lại.", 2), n("look_in_mirror", "Ướm thử áo trước gương.", 3), n("hang_up_shirt", "Đổi ý? Treo lại vào tủ.", 1)],
  hang_up_shirt: [n("close_wardrobe", "Treo xong rồi, đóng tủ nhé.", 3), n("pick_up_clothes", "Nhặt quần áo dưới sàn.", 2, W => W.b_clothes === "floor")],
  close_wardrobe: [n("look_in_mirror", "Soi gương xem đẹp chưa.", 2), n("brush_hair", "Chải tóc cho gọn.", 2), n("pick_up_clothes", "Dọn quần áo dưới sàn.", 1, W => W.b_clothes === "floor")],
  turn_on_lamp: [n("sit_on_bed", "Ngồi lên giường đọc sách.", 2, W => !W.sitting), n("read_in_bed", "Đọc sách dưới ánh đèn.", 3, W => W.sitting), n("close_curtains", "Kéo rèm lại cho riêng tư.", 1, W => W.b_curtains === "open")],
  read_in_bed: [n("turn_off_lamp", "Buồn ngủ rồi, tắt đèn thôi.", 3), n("lie_down", "Đặt sách xuống, nằm ngủ.", 2), n("set_alarm", "Hẹn báo thức cho sáng mai.", 2, W => W.b_alarm === "off")],
  turn_off_lamp: [n("lie_down", "Nằm xuống ngủ ngon nhé.", 3, W => !W.b_lying && W.b_pillow !== "floor"), n("set_alarm", "Đừng quên hẹn báo thức.", 2, W => W.b_alarm === "off"), n("close_curtains", "Kéo rèm lại.", 1, W => W.b_curtains === "open")],
  open_curtains: [n("look_out_window", "Ngắm trời hôm nay thế nào.", 3), n("make_bed", "Phòng sáng rồi, dọn giường.", 2, W => W.b_pillow !== "floor"), n("pick_up_pillow", "Nhặt gối lên nhé.", 2, W => W.b_pillow === "floor"), n("turn_off_lamp", "Có nắng rồi, tắt đèn đi.", 1, W => W.b_lamp === "on")],
  look_out_window: [n("pick_up_pillow", "Nhặt gối dưới sàn lên.", 2, W => W.b_pillow === "floor"), n("make_bed", "Dọn giường thôi.", 2, W => W.b_pillow !== "floor"), n("close_curtains", "Kéo rèm lại nhé.", 1)],
  close_curtains: [n("turn_on_lamp", "Phòng tối rồi, bật đèn ngủ.", 3, W => W.b_lamp !== "on"), n("charge_phone", "Sạc điện thoại qua đêm.", 2, W => W.b_phone === "low"), n("sit_on_bed", "Ngồi lên giường nào.", 1, W => !W.sitting)],
  pick_up_clothes: [n("empty_basket", "Mang giỏ đồ đi giặt.", 3), n("open_wardrobe", "Mở tủ cất quần áo.", 1, W => W.b_wardrobe !== "open")],
  empty_basket: [n("open_wardrobe", "Mở tủ sắp xếp quần áo.", 2, W => W.b_wardrobe !== "open"), n("make_bed", "Dọn giường cho phòng gọn.", 2, W => W.b_pillow !== "floor"), n("pick_up_pillow", "Nhặt gối lên nhé.", 2, W => W.b_pillow === "floor")],
  look_in_mirror: [n("brush_hair", "Chải tóc cho gọn gàng.", 3), n("go_kitchen", "Ổn rồi, xuống bếp ăn sáng.", 2)],
  brush_hair: [n("look_in_mirror", "Soi gương lần nữa.", 1), n("go_kitchen", "Gọn gàng rồi, xuống bếp nhé.", 3), n("check_phone", "Xem tin nhắn sáng nay.", 1, W => W.b_phone && W.b_phone !== "low")],
  put_on_slippers: [n("get_out_of_bed", "Xỏ dép rồi, đứng dậy nhé.", 3, W => W.sitting), n("open_curtains", "Ra kéo rèm đón nắng.", 2, W => W.b_curtains !== "open"), n("go_kitchen", "Xuống bếp thôi.", 1)],
  take_off_slippers: [n("lie_down", "Lên giường nằm nghỉ.", 3, W => !W.b_lying && W.b_pillow !== "floor"), n("sit_on_bed", "Ngồi lên giường nào.", 2, W => !W.sitting)],
  charge_phone: [n("turn_on_lamp", "Bật đèn ngủ nhé.", 2, W => W.b_lamp !== "on"), n("sit_on_bed", "Ngồi lên giường nghỉ.", 2, W => !W.sitting), n("unplug_charger", "Pin đầy thì rút sạc.", 1, W => W.b_phone === "full")],
  unplug_charger: [n("check_phone", "Pin đầy rồi, xem điện thoại.", 3), n("go_kitchen", "Mang điện thoại xuống bếp.", 1)],
  check_phone: [n("set_alarm", "Hẹn báo thức luôn nhé.", 2, W => W.b_alarm === "off"), n("charge_phone", "Pin yếu, cắm sạc đi.", 2, W => W.b_phone === "low"), n("listen_to_music", "Mở nhạc nghe chút.", 1, W => W.music !== "on"), n("go_kitchen", "Xuống bếp kiếm gì uống.", 1)],
  // ---------- Moving between rooms ----------
  go_living: [n("sit_on_sofa", "Ngồi sofa nghỉ ngơi.", 3, W => !W.sofa), n("turn_on_tv", "Bật ti vi xem tin tức.", 2, W => W.tv !== "on"), n("call_cat", "Gọi mèo ra chào nào.", 2), n("open_window", "Mở cửa sổ cho thoáng.", 1, W => W.window === "closed")],
  go_kitchen: [n("fill_kettle", "Đổ nước đun sôi nhé.", 3, W => W.k_kettle === "empty"), n("make_coffee", "Pha cà phê nào.", 2, W => W.k_coffee === "none"), n("toast_bread", "Nướng bánh mì ăn sáng.", 2, W => W.k_toaster === "empty"), n("turn_on_faucet", "Mở vòi rửa tay trước.", 1, W => W.k_faucet !== "on")],
  go_bedroom: [n("close_curtains", "Kéo rèm lại cho ấm cúng.", 2, W => W.b_curtains === "open"), n("open_curtains", "Kéo rèm cho sáng phòng.", 2, W => W.b_curtains !== "open"), n("pick_up_pillow", "Nhặt gối dưới sàn lên.", 2, W => W.b_pillow === "floor"), n("turn_on_lamp", "Bật đèn ngủ nhé.", 1, W => W.b_lamp !== "on")],
  // ---------- Living room: new (sofa, cat, lamp, curtains, fan, remote, speaker) ----------
  sit_on_sofa: [n("pick_up_remote", "Cầm điều khiển bật ti vi.", 2, W => W.tv !== "on"), n("watch_tv", "Ngồi xem ti vi nào.", 3, W => W.tv === "on"), n("call_cat", "Gọi mèo lên ngồi cùng.", 2), n("read_on_sofa", "Đọc sách trên sofa.", 1)],
  lie_on_sofa: [n("call_cat", "Gọi mèo lại nằm cùng nào.", 3), n("listen_to_music", "Nằm nghe nhạc thư giãn.", 2, W => W.music !== "on"), n("get_up_from_sofa", "Nghỉ đủ rồi, dậy thôi.", 1)],
  get_up_from_sofa: [n("fluff_cushion", "Vỗ lại gối tựa cho phồng.", 3), n("fold_throw", "Gấp chăn mỏng cho gọn.", 2), n("turn_off_tv", "Tắt ti vi khi không xem.", 2, W => W.tv === "on"), n("go_kitchen", "Xuống bếp uống nước.", 1)],
  fluff_cushion: [n("fold_throw", "Gấp luôn chăn mỏng.", 3), n("sit_on_sofa", "Gối êm rồi, ngồi xuống thử.", 2, W => !W.sofa), n("sweep_floor", "Quét sàn nữa là sạch.", 1)],
  fold_throw: [n("fluff_cushion", "Vỗ gối tựa nữa nhé.", 2), n("sweep_floor", "Quét nhà cho sạch.", 2), n("open_living_curtains", "Kéo rèm cho sáng phòng.", 1, W => W.livCurtains !== "open")],
  read_on_sofa: [n("turn_on_floor_lamp", "Bật đèn đọc cho đỡ mỏi mắt.", 3, lightsLow), n("lie_on_sofa", "Đọc mỏi rồi thì nằm nghỉ.", 2), n("pet_cat", "Vuốt ve mèo đang nằm cạnh.", 1, catAwake)],
  pet_cat: [n("play_with_cat", "Mèo thích lắm, chơi cùng nó nhé.", 3), n("brush_cat", "Chải lông cho mèo.", 2), n("feed_cat", "Mèo đói rồi, cho ăn nhé.", 2, W => W.catBowl !== "full")],
  feed_cat: [n("give_cat_water", "Cho mèo nước uống nữa.", 3, W => W.catWater !== "full"), n("pet_cat", "Vuốt ve mèo khi nó ăn.", 2), n("go_kitchen", "Rửa tay ở bếp nhé.", 1)],
  give_cat_water: [n("pet_cat", "Vuốt ve mèo một chút.", 2), n("brush_cat", "Chải lông cho mèo.", 2), n("feed_cat", "Cho mèo ăn luôn nhé.", 2, W => W.catBowl !== "full")],
  play_with_cat: [n("give_cat_water", "Chơi mệt rồi, cho mèo uống nước.", 3, W => W.catWater !== "full"), n("feed_cat", "Mèo đói rồi, cho ăn nhé.", 2, W => W.catBowl !== "full"), n("brush_cat", "Chải lông cho mèo.", 2), n("lie_on_sofa", "Nằm sofa nghỉ cùng mèo.", 1, W => W.sofa !== "lying")],
  brush_cat: [n("pet_cat", "Vuốt ve mèo cho nó vui.", 2), n("sweep_floor", "Quét lông mèo rơi trên sàn.", 3), n("play_with_cat", "Chơi với mèo nào.", 1)],
  call_cat: [n("pet_cat", "Mèo đến rồi, vuốt ve nó nhé.", 3), n("play_with_cat", "Chơi với mèo thôi!", 3), n("feed_cat", "Cho mèo ăn nhé.", 1, W => W.catBowl !== "full")],
  turn_on_floor_lamp: [n("read_on_sofa", "Có đèn rồi, đọc sách nhé.", 3), n("close_living_curtains", "Kéo rèm lại cho ấm cúng.", 2, W => W.livCurtains === "open"), n("listen_to_music", "Bật nhạc nhẹ nhàng.", 1, W => W.music !== "on")],
  turn_off_floor_lamp: [n("open_living_curtains", "Kéo rèm lấy ánh sáng tự nhiên.", 2, W => W.livCurtains !== "open"), n("go_bedroom", "Về phòng ngủ thôi.", 2), n("get_up_from_sofa", "Đứng dậy nhé.", 1, W => !!W.sofa)],
  open_living_curtains: [n("open_window", "Mở cửa sổ cho thoáng.", 3, W => W.window === "closed"), n("water_plant", "Có nắng rồi, tưới cây nhé.", 2), n("turn_off_floor_lamp", "Đủ sáng rồi, tắt đèn đi.", 2, W => W.floorLamp === "on")],
  close_living_curtains: [n("turn_on_floor_lamp", "Bật đèn cho phòng ấm.", 3, lightsLow), n("turn_on_tv", "Phòng tối xem ti vi rõ hơn.", 2, W => W.tv !== "on"), n("close_window", "Đóng cửa sổ luôn nhé.", 1, W => W.window === "open")],
  turn_on_fan: [n("sit_on_sofa", "Ngồi hóng mát nào.", 2, W => !W.sofa), n("close_window", "Đóng cửa sổ cho đỡ bụi.", 1, W => W.window === "open"), n("pick_up_remote", "Cầm điều khiển bật ti vi.", 2, W => W.tv !== "on")],
  turn_off_fan: [n("open_window", "Mở cửa sổ đón gió trời.", 2, W => W.window === "closed"), n("go_bedroom", "Về phòng ngủ thôi.", 1), n("turn_off_floor_lamp", "Tắt đèn tiết kiệm điện.", 1, W => W.floorLamp === "on")],
  pick_up_remote: [n("turn_on_tv", "Bấm nút bật ti vi.", 3, W => W.tv !== "on"), n("watch_tv", "Chọn kênh hay để xem.", 3, W => W.tv === "on"), n("turn_off_tv", "Tắt ti vi đi.", 1, W => W.tv === "on")],
  listen_to_music: [n("lie_on_sofa", "Nằm nghe nhạc cho thư thái.", 3, W => W.sofa !== "lying"), n("play_with_cat", "Chơi với mèo theo điệu nhạc.", 2), n("water_plant", "Vừa nghe nhạc vừa tưới cây.", 1)]
};

const ROUTINES = [
  { id: "morning", title: "Morning routine", titleVi: "Buổi sáng thức dậy", icon: "🌅", time: "morning",
    ids: ["turn_off_alarm", "sit_on_bed", "put_on_slippers", "get_out_of_bed", "open_curtains", "look_out_window", "pick_up_pillow", "make_bed", "brush_hair", "go_kitchen", "fill_kettle", "boil_water"] },
  { id: "breakfast", title: "Breakfast", titleVi: "Ăn sáng", icon: "🍳", time: "morning",
    ids: ["go_kitchen", "turn_on_stove", "fry_egg", "turn_off_stove", "toast_bread", "take_out_toast", "set_the_table", "sit_at_the_table", "eat_breakfast", "get_up_from_table", "clear_the_table"] },
  { id: "coffee", title: "Coffee break", titleVi: "Nghỉ uống cà phê", icon: "☕", time: "noon",
    ids: ["go_kitchen", "make_coffee", "pour_coffee", "set_the_table", "drink_coffee", "go_living", "sit_on_sofa", "listen_to_music"] },
  { id: "tidy_living", title: "Tidy the living room", titleVi: "Dọn phòng khách", icon: "🧹", time: "noon",
    ids: ["open_living_curtains", "open_window", "wipe_table", "pick_up_book", "put_book_on_table", "sweep_under_table", "sweep_floor", "fluff_cushion", "fold_throw", "water_plant"] },
  { id: "dishes", title: "Wash up the kitchen", titleVi: "Rửa bát, dọn bếp", icon: "🧽", time: "noon",
    ids: ["go_kitchen", "turn_on_faucet", "wash_dishes", "put_dishes_in_rack", "turn_off_faucet", "dry_plates", "open_cabinet", "put_plates_away", "close_cabinet", "take_out_trash", "put_in_new_bag"] },
  { id: "relax", title: "Relax after work", titleVi: "Thư giãn sau giờ làm", icon: "📺", time: "evening",
    ids: ["turn_on_fan", "sit_on_sofa", "pick_up_remote", "turn_on_tv", "watch_tv", "turn_off_tv", "lie_on_sofa", "call_cat", "play_with_cat"] },
  { id: "cat_care", title: "Cat care", titleVi: "Chăm sóc mèo", icon: "🐱", time: "evening",
    ids: ["call_cat", "pet_cat", "feed_cat", "give_cat_water", "brush_cat", "play_with_cat", "sweep_floor"] },
  { id: "laundry", title: "Laundry & bedroom tidy", titleVi: "Giặt đồ & dọn phòng ngủ", icon: "🧺", time: "noon",
    ids: ["go_bedroom", "open_curtains", "pick_up_clothes", "empty_basket", "pick_up_pillow", "fluff_pillow", "spread_blanket", "open_wardrobe", "take_out_shirt", "hang_up_shirt", "close_wardrobe"] },
  { id: "bedtime", title: "Bedtime", titleVi: "Đi ngủ", icon: "🌙", time: "night",
    ids: ["go_bedroom", "pick_up_clothes", "empty_basket", "charge_phone", "pick_up_pillow", "brush_hair", "turn_on_lamp", "sit_on_bed", "read_in_bed", "turn_off_lamp", "lie_down"] }
];

function timeOfDay(hour) {
  const h = ((Number(hour) % 24) + 24) % 24;
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "noon";
  if (h >= 17 && h < 22) return "evening";
  return "night";
}

const TIME_IDS = {
  morning: ["turn_off_alarm", "get_out_of_bed", "open_curtains", "make_bed", "fill_kettle", "make_coffee", "toast_bread", "open_living_curtains", "open_window"],
  noon: ["wash_dishes", "wipe_table", "sweep_floor", "water_plant", "feed_cat", "make_coffee", "turn_on_fan", "heat_up_food"],
  evening: ["turn_on_tv", "sit_on_sofa", "call_cat", "play_with_cat", "turn_on_floor_lamp", "listen_to_music", "close_living_curtains", "feed_cat"],
  night: ["close_curtains", "turn_on_lamp", "read_in_bed", "set_alarm", "charge_phone", "turn_off_lamp", "lie_down", "go_bedroom"]
};
const TIME_WHY = {
  morning: "Vì buổi sáng rồi, bắt đầu ngày mới nhé.",
  noon: "Vì đang giữa ngày, làm chút việc nhà nào.",
  evening: "Vì đã buổi tối, thư giãn một chút nhé.",
  night: "Vì khuya rồi, chuẩn bị đi ngủ nhé."
};

function suggest(lastActionId, W, opts) {
  W = W || {}; opts = opts || {};
  const can = typeof opts.isPossible === "function" ? opts.isPossible : () => true;
  const max = Math.min(3, opts.max || 3);
  const hour = opts.hour != null ? opts.hour : new Date().getHours();
  const out = [], seen = new Set([lastActionId]);
  const push = (id, why_vi) => {
    if (out.length >= max || seen.has(id) || !NEXT[id]) return;
    let ok = false; try { ok = !!can(id); } catch (e) { ok = false; }
    if (!ok) return; seen.add(id); out.push({ id, why_vi: ensureViReason(why_vi) });
  };
  const cands = (NEXT[lastActionId] || []).filter(e => { try { return !e.when || e.when(W); } catch (x) { return false; } })
    .sort((a, b) => (b.weight || 1) - (a.weight || 1));
  cands.forEach(e => push(e.id, e.why_vi));
  // unguarded entries whose guard failed are skipped; fall back to time-of-day + routines
  const tod = timeOfDay(hour);
  if (out.length < max) TIME_IDS[tod].forEach(id => push(id, TIME_WHY[tod]));
  if (out.length < max) ROUTINES.filter(r => r.time === tod).concat(ROUTINES).forEach(r => r.ids.forEach(id => push(id, "Vì đây là một bước trong “" + r.titleVi + "”.")));
  return out;
}

function greet_vi(hour, W) {
  W = W || {};
  const tod = timeOfDay(hour);
  if (W.b_alarm === "ringing" && tod === "morning") return "Chào buổi sáng! ⏰ Báo thức đang kêu kìa — tắt đi rồi dậy nhé!";
  if (W.cat === "awake" && tod === "evening") return "Chào buổi tối! Bé mèo đang đợi bạn chơi cùng đấy 🐱";
  return {
    morning: "Chào buổi sáng! ☀️ Mình cùng bắt đầu ngày mới bằng tiếng Anh nhé.",
    noon: "Chào buổi trưa! Làm chút việc nhà rồi nghỉ ngơi nào.",
    evening: "Chào buổi tối! Thư giãn sau một ngày dài nhé.",
    night: "Khuya rồi đó! 🌙 Chuẩn bị đi ngủ thôi, ngủ ngon nhé."
  }[tod];
}

// ---------- DOM ----------
const CSS = `
.flow-wrap{--accent:#e8743b;--line:#e3d6c3;display:flex;flex-wrap:wrap;gap:8px;max-width:100%;box-sizing:border-box;font:inherit}
.flow-chip{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:48px;max-width:100%;box-sizing:border-box;padding:8px 14px;border:1.5px solid var(--line);border-radius:14px;background:#fffaf3;color:#3b2f25;cursor:pointer;text-align:left;font:inherit;line-height:1.25;flex:1 1 150px;transition:border-color .15s,transform .1s,background .15s}
.flow-chip:hover{border-color:var(--accent);background:#fff2e6}
.flow-chip:active{transform:scale(.97)}
.flow-chip:focus-visible,.flow-rt:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.flow-en{font-weight:700;font-size:15px;overflow-wrap:anywhere}
.flow-en::before{content:"→ ";color:var(--accent)}
.flow-vi{font-size:12.5px;color:#7a6654;overflow-wrap:anywhere}
.flow-why{font-size:12px;color:#a0522d;font-style:italic;overflow-wrap:anywhere}
.flow-routines{--accent:#e8743b;--line:#e3d6c3;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;max-width:100%;box-sizing:border-box}
.flow-rt{display:flex;align-items:center;gap:10px;min-height:56px;padding:8px 12px;border:1.5px solid var(--line);border-radius:14px;background:#fff;cursor:pointer;text-align:left;font:inherit;color:#3b2f25;box-sizing:border-box;min-width:0}
.flow-rt:hover{border-color:var(--accent)}
.flow-rt[data-now="1"]{border-color:var(--accent);background:#fff2e6}
.flow-ico{font-size:24px;flex:none}
.flow-rtxt{display:flex;flex-direction:column;min-width:0}
.flow-rt b{font-size:14px;overflow-wrap:anywhere}
.flow-rt small{font-size:12px;color:#7a6654;overflow-wrap:anywhere}
@media (prefers-color-scheme:dark){.flow-chip,.flow-rt{background:#2b241e;color:#f3e7da;border-color:#5a4a3c}.flow-chip:hover,.flow-rt[data-now="1"]{background:#3a2a1f}.flow-vi,.flow-rt small{color:#c9b6a3}.flow-why{color:#f0a070}}
`;
function injectCss(doc) {
  if (doc.getElementById("flow-css")) return;
  const s = doc.createElement("style"); s.id = "flow-css"; s.textContent = CSS; doc.head.appendChild(s);
}
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function renderChips(container, suggestions, labelFor, onPick) {
  if (!container) return;
  injectCss(container.ownerDocument || document);
  container.innerHTML = "";
  const wrap = container.ownerDocument.createElement("div");
  wrap.className = "flow-wrap"; wrap.setAttribute("role", "group"); wrap.setAttribute("aria-label", "Gợi ý của Cô Mai");
  (suggestions || []).forEach(s => {
    const L = (labelFor && labelFor(s.id)) || { en: s.id, vi: "" };
    const b = container.ownerDocument.createElement("button");
    b.type = "button"; b.className = "flow-chip"; b.dataset.flow = s.id;
    b.setAttribute("aria-label", L.en + (L.vi ? " — " + L.vi : "") + (s.why_vi ? ". " + s.why_vi : ""));
    b.innerHTML = `<span class="flow-en">${esc(L.en)}</span>${L.vi ? `<span class="flow-vi">${esc(L.vi)}</span>` : ""}${s.why_vi ? `<span class="flow-why">${esc(s.why_vi)}</span>` : ""}`;
    b.addEventListener("click", () => onPick && onPick(s.id));
    wrap.appendChild(b);
  });
  container.appendChild(wrap);
}

function renderRoutines(container, routines, onRun, hour) {
  if (!container) return;
  injectCss(container.ownerDocument || document);
  container.innerHTML = "";
  const now = timeOfDay(hour != null ? hour : new Date().getHours());
  const grid = container.ownerDocument.createElement("div");
  grid.className = "flow-routines"; grid.setAttribute("role", "list");
  (routines || ROUTINES).forEach(r => {
    const b = container.ownerDocument.createElement("button");
    b.type = "button"; b.className = "flow-rt"; b.dataset.routine = r.id; b.setAttribute("role", "listitem");
    if (r.time === now) b.dataset.now = "1";
    b.setAttribute("aria-label", `${r.title} — ${r.titleVi}, ${r.ids.length} bước`);
    b.innerHTML = `<span class="flow-ico" aria-hidden="true">${esc(r.icon)}</span><span class="flow-rtxt"><b>${esc(r.title)}</b><small>${esc(r.titleVi)} · ${r.ids.length} bước</small></span>`;
    b.addEventListener("click", () => onRun && onRun(r));
    grid.appendChild(b);
  });
  container.appendChild(grid);
}

/* =====================================================================
 * RULE ENGINE FOR CÔ MAI: guideByRules(ctx)
 * Strict deterministic priority order (NO random):
 *   1. safety    (an toàn)
 *   2. mission   (nhiệm vụ đang làm)
 *   3. needs     (nhu cầu: đói, khát, mệt)
 *   4. weather   (thời tiết: nóng, lạnh, mưa, gió)
 *   5. situation (tình huống: đang vội, săn sale, buổi sáng, tối muộn, mệt)
 *   6. explore   (khám phá khu vực hiện tại)
 * ===================================================================== */
const PRIORITY_ORDER = ["safety", "mission", "needs", "weather", "situation", "explore"];
const PRIORITY_RANK = { safety: 1, mission: 2, needs: 3, weather: 4, situation: 5, explore: 6 };

function normPlace(ctx) {
  const r = String((ctx && (ctx.zone || ctx.room || ctx.place)) || "living").toLowerCase().trim();
  if (["living", "kitchen", "bedroom", "bathroom", "garden", "garage", "home"].indexOf(r) >= 0) {
    return { place: "home", zone: r === "home" ? "living" : r };
  }
  if (r === "market" || r.indexOf("market_") === 0) return { place: "market", zone: r };
  if (r.indexOf("cafe") === 0) return { place: "cafe", zone: r };
  if (r.indexOf("park") === 0) return { place: "park", zone: r };
  if (r.indexOf("restaurant") === 0) return { place: "restaurant", zone: r };
  if (r.indexOf("school") === 0) return { place: "school", zone: r };
  if (r.indexOf("camping") === 0) return { place: "camping", zone: r };
  return { place: r, zone: r };
}

function guideByRules(ctx) {
  ctx = ctx || {};
  const pz = normPlace(ctx);
  const place = pz.place;
  const zone = pz.zone;
  const wx = String(ctx.weather || "sunny").toLowerCase().trim();
  const sit = String(ctx.situation || ctx.sit || "normal").toLowerCase().trim();
  const tod = ctx.timeOfDay || timeOfDay(ctx.hour != null ? ctx.hour : 9);
  const lastId = ctx.lastActionId || ctx.lastId || null;
  const recentSet = new Set(Array.isArray(ctx.recentActs) ? ctx.recentActs : []);
  if (lastId) recentSet.add(lastId);
  const isPossible = typeof ctx.isPossible === "function" ? ctx.isPossible : () => true;
  const max = ctx.max || 3;

  const rawCandidates = [];
  function pushRule(id, category, why_vi) {
    if (!id) return;
    const why = ensureViReason(why_vi);
    rawCandidates.push({
      id: id,
      category: category,
      priority: PRIORITY_RANK[category] || 6,
      why_vi: why
    });
  }

  /* ---- 1. SAFETY (An toàn) ---- */
  const safety = ctx.safety || {};
  if (safety.stoveOn || ctx.stoveOn) {
    pushRule("turn_off_stove", "safety", "Vì bếp đang bật rất nguy hiểm, em hãy tắt bếp ngay nhé!");
  }
  if (safety.kettleBoiling || ctx.kettleBoiling) {
    pushRule("unplug_kettle", "safety", "Vì ấm nước đang sôi, em hãy rút phích cắm điện cho an toàn nhé!");
  }
  if (safety.waterRunning || ctx.waterRunning) {
    pushRule("turn_off_faucet", "safety", "Vì vòi nước đang chảy tràn, em hãy khóa vòi lại ngay nhé!");
    pushRule("turn_off_bath_tap", "safety", "Vì vòi nước phòng tắm đang mở, em hãy khóa lại kẻo tràn nước nhé!");
  }
  if (safety.fridgeOpen || ctx.fridgeOpen) {
    pushRule("close_fridge", "safety", "Vì cửa tủ lạnh đang mở lâu, em hãy đóng lại để tiết kiệm điện nhé!");
  }
  if (ctx.urgentActionId) {
    pushRule(ctx.urgentActionId, "safety", "Vì đang có sự cố khẩn cấp trong nhà, em cần xử lý ngay lập tức!");
  }

  /* ---- 2. MISSION (Nhiệm vụ đang làm) ---- */
  const missionList = Array.isArray(ctx.missionNext) ? ctx.missionNext : (ctx.missionNext ? [ctx.missionNext] : []);
  missionList.forEach(mId => {
    pushRule(mId, "mission", "Vì đây là bước tiếp theo trong nhiệm vụ em đang thực hiện!");
  });
  if (ctx.followChain && lastId && NEXT[lastId] && NEXT[lastId].length) {
    NEXT[lastId].forEach(n => {
      pushRule(n.id, "mission", n.why_vi);
    });
  }

  /* ---- 3. NEEDS (Nhu cầu: đói, khát, mệt) ---- */
  const needs = ctx.needs || {};
  const isHungry = !!(ctx.hungry || (needs.hunger != null && needs.hunger < 45));
  const isThirsty = !!(ctx.thirsty || (needs.thirst != null && needs.thirst < 45));
  const isTired = !!(ctx.tired || (needs.energy != null && needs.energy < 35));

  if (isHungry) {
    if (place === "home") {
      pushRule("cook_eggs", "needs", "Vì bụng đang đói, em hãy chiên trứng làm bữa ăn nhé!");
      pushRule("eat_at_counter", "needs", "Vì đang đói bụng, em hãy ngồi ăn tại quầy bếp để nạp năng lượng nhé!");
      pushRule("slice_bread", "needs", "Vì đang đói bụng, em hãy cắt bánh mì để ăn lót dạ nhé!");
      pushRule("open_fridge", "needs", "Vì đang đói bụng, em hãy mở tủ lạnh lấy đồ ăn nhé!");
    } else if (place === "cafe") {
      pushRule("order_a_croissant", "needs", "Vì đang đói bụng, em hãy gọi một chiếc bánh sừng bò tại quầy nhé!");
      pushRule("eat_a_pastry", "needs", "Vì bụng đang đói, em hãy thưởng thức bánh ngọt để nạp năng lượng nhé!");
    } else if (place === "park") {
      pushRule("open_the_picnic_basket", "needs", "Vì đang đói bụng ở công viên, em hãy mở giỏ đồ ăn picnic nhé!");
      pushRule("eat_a_sandwich", "needs", "Vì đang đói bụng, em hãy ăn bánh sandwich trên thảm picnic nhé!");
    } else if (place === "market") {
      pushRule("pick_a_baguette", "needs", "Vì đang đói bụng, em hãy chọn một ổ bánh mì Pháp mới ra lò nhé!");
      pushRule("pick_some_apples", "needs", "Vì đang đói bụng, em hãy chọn vài quả táo tươi ngon nhé!");
      pushRule("pick_some_bananas", "needs", "Vì đang đói bụng, em hãy lấy một nải chuối chín nhé!");
    } else if (place === "restaurant") {
      pushRule("order_pasta", "needs", "Vì bụng đang đói, em hãy gọi món mì Ý nóng hổi nhé!");
      pushRule("eat_the_main_course", "needs", "Vì đang đói bụng, em hãy thưởng thức món chính ngay nhé!");
    } else if (place === "school") {
      pushRule("line_up_at_the_cafeteria", "needs", "Vì đang đói bụng, em hãy xếp hàng ở căng tin trường để lấy suất ăn nhé!");
    } else if (place === "camping") {
      pushRule("roast_marshmallows", "needs", "Vì đang đói bụng ở khu cắm trại, em hãy nướng kẹo dẻo trên lửa trại nhé!");
    }
  }

  if (isThirsty) {
    if (place === "home") {
      pushRule("pick_up_cup", "needs", "Vì đang khát nước, em hãy cầm cốc lên để rót nước uống nhé!");
      pushRule("pour_water_k", "needs", "Vì đang khát nước, em hãy rót một cốc nước mát nhé!");
      pushRule("drink_from_cup", "needs", "Vì đang khát nước, em hãy uống nước từ cốc ngay nhé!");
    } else if (place === "cafe") {
      pushRule("order_a_coffee", "needs", "Vì đang khát nước, em hãy gọi đồ uống tại quầy cà phê nhé!");
      pushRule("sip_my_coffee", "needs", "Vì đang khát, em hãy nhấp một ngụm đồ uống thơm ngon nhé!");
    } else if (place === "park") {
      pushRule("drink_from_the_fountain", "needs", "Vì đang khát nước ở công viên, em hãy uống nước tại vòi nước công cộng nhé!");
      pushRule("buy_an_ice_cream_cone", "needs", "Vì đang khát, em hãy mua một cây kem mát lạnh nhé!");
    } else if (place === "market") {
      pushRule("grab_orange_juice", "needs", "Vì đang khát nước, em hãy lấy một chai nước cam ép tươi mát nhé!");
      pushRule("take_a_carton_of_milk", "needs", "Vì đang khát, em hãy lấy một hộp sữa tươi trong tủ mát nhé!");
    }
  }

  if (isTired) {
    if (place === "home") {
      pushRule("sit_on_sofa", "needs", "Vì cơ thể đang mệt, em hãy ngồi nghỉ trên ghế sofa nhé!");
      pushRule("lie_on_bed", "needs", "Vì đang mệt mỏi, em hãy nằm nghỉ trên giường để lấy lại sức nhé!");
    } else if (place === "park") {
      pushRule("sit_on_the_bench", "needs", "Vì đi dạo đã mỏi chân, em hãy ngồi nghỉ trên ghế dài công viên nhé!");
    } else if (place === "cafe") {
      pushRule("sit_at_a_corner_table", "needs", "Vì đang mệt, em hãy ngồi nghỉ ở bàn góc yên tĩnh nhé!");
    }
  }

  /* ---- 4. WEATHER (Thời tiết) ---- */
  if (wx === "hot") {
    if (place === "park") {
      pushRule("buy_an_ice_cream_cone", "weather", "Vì trời đang nóng ở công viên, em hãy mua một cây kem ốc quế giải nhiệt nhé!");
      pushRule("drink_from_the_fountain", "weather", "Vì trời đang nóng bức, em hãy uống nước mát ở vòi phun nhé!");
      pushRule("sit_on_the_bench", "weather", "Vì trời đang nắng nóng, em hãy ngồi nghỉ dưới bóng râm tán cây nhé!");
    } else if (place === "cafe") {
      pushRule("drink_iced_latte", "weather", "Vì trời đang nóng bức, em hãy gọi một ly latte đá mát lạnh nhé!");
      pushRule("order_a_coffee", "weather", "Vì trời đang nóng, em hãy gọi một món đồ uống giải nhiệt ở quầy nhé!");
    } else if (place === "market") {
      pushRule("grab_orange_juice", "weather", "Vì trời đang nóng, em hãy lấy một chai nước cam ướp lạnh nhé!");
      pushRule("open_the_freezer_door", "weather", "Vì trời đang nóng bức, em hãy mở tủ đông chọn kem mát lạnh nhé!");
      pushRule("pick_a_tub_of_ice_cream", "weather", "Vì trời đang nóng, mua một hộp kem mát lạnh là hợp nhất!");
    } else if (place === "home") {
      pushRule("open_window", "weather", "Vì trời đang nóng, em hãy mở cửa sổ đón gió mát vào phòng nhé!");
      pushRule("pour_water_k", "weather", "Vì trời đang nóng bức, em hãy rót một cốc nước mát để giải nhiệt nhé!");
    }
  } else if (wx === "cold") {
    if (place === "cafe") {
      pushRule("order_a_coffee", "weather", "Vì trời đang lạnh, em hãy gọi một tách cà phê nóng ấm nhé!");
      pushRule("sip_my_coffee", "weather", "Vì trời đang lạnh, nhâm nhi tách cà phê nóng sẽ giúp ấm người hơn!");
      pushRule("order_a_croissant", "weather", "Vì trời đang lạnh, ăn kèm một chiếc bánh nướng nóng giòn rất tuyệt!");
    } else if (place === "market") {
      pushRule("pick_a_baguette", "weather", "Vì trời đang lạnh, em hãy chọn một ổ bánh mì mới ra lò còn ấm nóng nhé!");
      pushRule("take_a_carton_of_milk", "weather", "Vì trời đang lạnh, em hãy mua sữa về hâm nóng uống nhé!");
    } else if (place === "home") {
      pushRule("close_window", "weather", "Vì ngoài trời đang lạnh, em hãy đóng cửa sổ lại cho ấm nhà nhé!");
      pushRule("boil_water", "weather", "Vì trời đang lạnh, em hãy đun nước sôi để pha trà nóng nhé!");
      pushRule("brew_tea", "weather", "Vì trời đang lạnh, một ấm trà nóng sẽ giúp cả nhà ấm áp hơn!");
    } else if (place === "camping") {
      pushRule("light_the_campfire", "weather", "Vì trời đang lạnh ở khu cắm trại, em hãy nhóm lửa trại để sưởi ấm nhé!");
    }
  } else if (wx === "rainy" || wx === "rain") {
    if (place === "home") {
      pushRule("close_window", "weather", "Vì ngoài trời đang mưa, em hãy đóng cửa sổ kẻo mưa hắt vào phòng nhé!");
      pushRule("read_book", "weather", "Vì ngoài trời đang mưa, ngồi trong nhà đọc sách là hợp nhất!");
    } else if (place === "cafe") {
      pushRule("sit_at_a_corner_table", "weather", "Vì ngoài trời đang mưa, em hãy chọn bàn trong nhà ngồi trú mưa ấm cúng nhé!");
      pushRule("order_a_coffee", "weather", "Vì trời đang mưa, gọi một cốc đồ uống ấm nóng ngồi ngắm mưa rất tuyệt!");
    } else if (place === "market") {
      pushRule("wipe_wet_cart_handle", "weather", "Vì trời đang mưa ẩm, em hãy lau khô tay cầm xe đẩy trước khi mua sắm nhé!");
      pushRule("grab_a_cart", "weather", "Vì ngoài trời đang mưa, em hãy thong thả đẩy xe mua sắm trong siêu thị khô ráo nhé!");
    }
  } else if (wx === "windy") {
    if (place === "home") {
      pushRule("close_window", "weather", "Vì ngoài trời đang có gió mạnh, em hãy đóng cửa sổ lại nhé!");
    } else if (place === "park") {
      pushRule("fly_a_kite", "weather", "Vì trời đang có gió mát ở công viên, thả diều lúc này là lý tưởng nhất!");
    }
  }

  /* ---- 5. SITUATION (Tình huống) ---- */
  if (sit === "rush" || sit === "hurry") {
    if (place === "market") {
      pushRule("use_the_self_checkout", "situation", "Vì đang vội ở siêu thị, em hãy đi quầy tự thanh toán để không phải xếp hàng nhé!");
      pushRule("tap_my_card", "situation", "Vì đang vội, em hãy chạm thẻ thanh toán một chạm thật nhanh nhé!");
      pushRule("take_the_receipt", "situation", "Vì đang vội, em hãy lấy hóa đơn nhanh để kịp giờ nhé!");
      pushRule("grab_a_hand_basket", "situation", "Vì đang vội mua ít đồ, xách giỏ tay sẽ nhanh hơn đẩy xe lớn!");
    } else if (place === "cafe") {
      pushRule("order_a_coffee", "situation", "Vì đang vội, em hãy gọi nhanh cà phê mang đi tại quầy nhé!");
      pushRule("pay_by_card", "situation", "Vì đang vội, thanh toán bằng thẻ chạm là nhanh nhất!");
    } else if (place === "home") {
      pushRule("grab_keys_g", "situation", "Vì đang vội ra ngoài, em nhớ cầm theo chìa khóa kẻo quên nhé!");
      pushRule("put_on_shoes_g", "situation", "Vì đang vội, em hãy xỏ giày nhanh để kịp giờ xuất phát nhé!");
    }
  } else if (sit === "bargain" || sit === "sale") {
    if (place === "market") {
      pushRule("read_the_sale_flyer", "situation", "Vì đang săn giảm giá, em hãy đọc tờ rơi khuyến mãi ngay lối vào nhé!");
      pushRule("check_the_price_tag", "situation", "Vì đang săn sale, em hãy kiểm tra kỹ bảng giá ưu đãi trên kệ nhé!");
      pushRule("scan_a_discount_coupon", "situation", "Vì đang săn giảm giá, em đừng quên quét mã coupon để được trừ tiền nhé!");
    }
  } else if (sit === "sick" || sit === "tired") {
    if (place === "home") {
      pushRule("lie_on_bed", "situation", "Vì đang cảm thấy hơi mệt, em hãy nằm nghỉ trên giường nhé!");
      pushRule("drink_from_cup", "situation", "Vì đang mệt trong người, em hãy uống chút nước ấm cho dễ chịu nhé!");
    } else if (place === "school") {
      pushRule("visit_the_school_nurse", "situation", "Vì đang thấy không khỏe ở trường, em hãy xuống phòng y tế gặp cô y tá nhé!");
    }
  } else if (sit === "weekend") {
    if (place === "market") {
      pushRule("taste_free_cheese_sample", "situation", "Vì đang đi chơi cuối tuần, em hãy thử mẫu phô mai miễn phí ở quầy nhé!");
      pushRule("pick_a_tub_of_ice_cream", "situation", "Vì là cuối tuần, tự thưởng một hộp kem ngon lành là tuyệt nhất!");
    } else if (place === "park") {
      pushRule("spread_the_picnic_mat", "situation", "Vì đang là cuối tuần đẹp trời, em hãy trải thảm picnic thư giãn nhé!");
    }
  }

  /* Time-of-day situation at home */
  if (place === "home" && tod === "morning") {
    pushRule("wake_up", "situation", "Vì đã đến buổi sáng, em hãy thức dậy đón ngày mới nhé!");
    pushRule("get_out_of_bed", "situation", "Vì trời đã sáng, em hãy bước ra khỏi giường và khởi động ngày mới nhé!");
    pushRule("make_bed", "situation", "Vì mới ngủ dậy buổi sáng, em hãy gấp chăn màn gọn gàng nhé!");
    pushRule("brush_teeth", "situation", "Vì đang là buổi sáng, em hãy đánh răng sạch sẽ trước khi ăn sáng nhé!");
    pushRule("cook_eggs", "situation", "Vì buổi sáng cần nhiều năng lượng, em hãy chiên trứng làm bữa sáng nhé!");
    pushRule("eat_at_counter", "situation", "Vì đang là giờ ăn sáng, em hãy thưởng thức bữa sáng ngon miệng nhé!");
  } else if (place === "home" && tod === "night") {
    pushRule("turn_off_tv", "situation", "Vì đã khuya rồi, em hãy tắt TV để chuẩn bị đi ngủ nhé!");
    pushRule("brush_teeth", "situation", "Vì đã đến giờ đi ngủ, em hãy đánh răng sạch sẽ buổi tối nhé!");
    pushRule("get_under_covers", "situation", "Vì đã muộn, em hãy đắp chăn ấm và nghỉ ngơi nhé!");
    pushRule("go_to_sleep", "situation", "Vì đã đến đêm khuya, em hãy đi ngủ sớm để mai dậy khỏe khoắn nhé!");
  }

  /* ---- 6. EXPLORE (Khám phá theo khu vực) ---- */
  const EXPLORE_BY_ZONE = {
    market: [
      ["grab_a_cart", "Vì mới bước vào lối vào siêu thị, em hãy lấy một chiếc xe đẩy trước nhé!"],
      ["grab_a_hand_basket", "Vì đang ở khu lối vào, em có thể lấy một chiếc giỏ xách tay gọn nhẹ nhé!"],
      ["read_the_sale_flyer", "Vì đang ở cổng siêu thị, em hãy xem tờ rơi ưu đãi tuần này nhé!"],
      ["check_the_shopping_list", "Vì chuẩn bị mua sắm, em hãy kiểm tra lại danh sách đồ cần mua nhé!"]
    ],
    market_produce: [
      ["pick_some_apples", "Vì đang ở khu Rau quả & Tiệm bánh, em hãy chọn vài quả táo tươi giòn nhé!"],
      ["pick_some_bananas", "Vì đang ở quầy trái cây, em hãy chọn một nải chuối chín vàng nhé!"],
      ["weigh_the_fruit", "Vì đã chọn trái cây, em hãy đặt lên cân điện tử để xem trọng lượng nhé!"],
      ["pick_a_baguette", "Vì đang đứng cạnh quầy bánh mì, em hãy lấy một ổ bánh mì Pháp thơm phức nhé!"]
    ],
    market_dairy: [
      ["open_the_fridge_door", "Vì đang ở khu Sữa & Đông lạnh, em hãy mở cửa tủ mát để chọn sữa nhé!"],
      ["take_a_carton_of_milk", "Vì đang ở quầy sữa, em hãy lấy một hộp sữa tươi nguyên kem nhé!"],
      ["pick_a_block_of_cheese", "Vì đang ở tủ bơ sữa, em hãy chọn thêm một miếng phô mai cheddar nhé!"],
      ["grab_orange_juice", "Vì đang ở dãy đồ uống mát, em hãy lấy một chai nước cam tươi nhé!"]
    ],
    market_meat: [
      ["order_fresh_salmon", "Vì đang ở quầy Thịt cá tươi sống, em hãy nhờ đầu bếp cắt phi-lê cá hồi nhé!"],
      ["pick_a_pack_of_beef", "Vì đang ở quầy thịt, em hãy chọn một khay thịt bò tươi ngon nhé!"],
      ["grab_a_box_of_cereal", "Vì đang ở dãy kệ khô & gia dụng, em hãy lấy một hộp ngũ cốc ăn sáng nhé!"],
      ["pick_laundry_detergent", "Vì đang ở kệ hàng gia dụng, em hãy lấy thêm một chai nước giặt nhé!"]
    ],
    market_checkout: [
      ["place_items_on_the_belt", "Vì đang ở khu Thu ngân, em hãy đặt hàng hóa lên băng chuyền thanh toán nhé!"],
      ["use_the_self_checkout", "Vì đang ở khu thanh toán, em có thể quét mã tại máy tự thanh toán nhé!"],
      ["tap_my_card", "Vì đã quét xong hàng, em hãy chạm thẻ để thanh toán hóa đơn nhé!"],
      ["take_the_receipt", "Vì đã thanh toán xong, em hãy nhận lại hóa đơn từ thu ngân nhé!"]
    ],
    cafe: [
      ["read_the_menu_board", "Vì mới vào quán cà phê, em hãy nhìn lên bảng thực đơn để chọn món nhé!"],
      ["order_a_coffee", "Vì đang ở quầy order, em hãy gọi một tách cà phê thơm lừng nhé!"],
      ["order_a_croissant", "Vì đang ở tủ bánh, em hãy gọi thêm một chiếc bánh sừng bò giòn rụm nhé!"],
      ["sit_at_a_corner_table", "Vì đã gọi đồ xong, em hãy chọn một chiếc bàn ấm cúng để ngồi nhé!"]
    ],
    park: [
      ["walk_through_the_park_gate", "Vì mới tới công viên, em hãy đi bộ qua cổng chính ngập tràn cây xanh nhé!"],
      ["feed_the_ducks", "Vì đang đứng cạnh hồ nước, em hãy cho đàn vịt bơi dưới hồ ăn nhé!"],
      ["sit_on_the_bench", "Vì khung cảnh công viên rất đẹp, em hãy ngồi trên ghế dài ngắm cảnh nhé!"],
      ["buy_an_ice_cream_cone", "Vì xe kem đang mở bán, em hãy ghé mua một cây kem ốc quế nhé!"]
    ],
    restaurant: [
      ["ask_for_a_table", "Vì mới vào nhà hàng, em hãy nhờ lễ tân sắp xếp bàn ngồi nhé!"],
      ["read_the_menu", "Vì đã ngồi vào bàn, em hãy mở thực đơn xem các món ngon hôm nay nhé!"],
      ["order_pasta", "Vì đang chọn món, em hãy gọi thử món mì Ý đặc biệt của bếp trưởng nhé!"]
    ],
    school: [
      ["sit_at_the_student_desk", "Vì đã vào lớp học, em hãy ngồi ngay ngắn vào bàn học của mình nhé!"],
      ["open_the_textbook", "Vì tiết học bắt đầu rồi, em hãy mở sách giáo khoa tiếng Anh ra nhé!"],
      ["raise_my_hand", "Vì cô giáo đang đặt câu hỏi, em hãy giơ tay phát biểu xây dựng bài nhé!"]
    ],
    camping: [
      ["pitch_the_tent", "Vì mới đến bãi cắm trại, em hãy dựng lều trước khi trời tối nhé!"],
      ["gather_firewood", "Vì chuẩn bị đốt lửa trại, em hãy đi nhặt củi khô quanh bãi nhé!"],
      ["light_the_campfire", "Vì đã có đủ củi, em hãy nhóm bếp lửa trại ấm áp nhé!"]
    ]
  };

  if (EXPLORE_BY_ZONE[zone]) {
    EXPLORE_BY_ZONE[zone].forEach(pair => pushRule(pair[0], "explore", pair[1]));
  } else if (EXPLORE_BY_ZONE[place]) {
    EXPLORE_BY_ZONE[place].forEach(pair => pushRule(pair[0], "explore", pair[1]));
  } else {
    const todList = TIME_IDS[tod] || TIME_IDS.morning;
    todList.forEach(item => {
      if (typeof item === "string") pushRule(item, "explore", TIME_WHY[tod] || "Vì hành động này phù hợp lúc này.");
      else if (item && item.id) pushRule(item.id, "explore", item.why_vi || TIME_WHY[tod]);
    });
  }

  /* Sort strictly by priority rank (1..6), preserving deterministic declaration order within each tier */
  const indexed = rawCandidates.map((c, idx) => ({ c, idx }));
  indexed.sort((a, b) => (a.c.priority - b.c.priority) || (a.idx - b.idx));

  /* Filter out impossible actions, recently executed actions, and duplicates */
  const seen = new Set();
  const out = [];
  for (let i = 0; i < indexed.length; i++) {
    const item = indexed[i].c;
    if (seen.has(item.id)) continue;
    if (recentSet.has(item.id)) continue;
    if (!isPossible(item.id)) continue;
    seen.add(item.id);
    out.push(item);
    if (out.length >= max) break;
  }

  return out;
}

const ELW_FLOW = { NEXT, ROUTINES, TIME_IDS, PRIORITY_ORDER, suggest, guideByRules, timeOfDay, greet_vi, renderChips, renderRoutines };
if (typeof window !== "undefined") window.ELW_FLOW = ELW_FLOW;
if (typeof module !== "undefined" && module.exports) module.exports = ELW_FLOW;
})();
