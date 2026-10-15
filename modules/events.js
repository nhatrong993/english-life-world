/* ELW_EVENTS — Event Director: small real-life "something needs doing" events.
   Browser: window.ELW_EVENTS. Node: module.exports. No dependencies.
   One central timer; every event is validated at runtime (actions exist in ACT, object exists in room,
   when(W,ctx) true) so events for rooms/actions that don't exist yet are silently skipped. */
(function () {
"use strict";
const LSKEY = "elw_events_v1";
const URG = { high: 3, medium: 2, low: 1 };
const BADGE = { high: ["🔴", "Gấp"], medium: ["🟡", "Cần chú ý"], low: ["⚪", "Thường"] };
const DEADLINE = { high: 60, medium: 180, low: 0 };

/* ---------- definitions ---------- */
// E(id, category, room, obj, urgency, [title_en,title_vi], npc, [line_en,line_vi], [learn_en,learn_vi], vocab, xp, when, solve, hint_vi, actions, extra)
function E(id, category, room, obj, urgency, t, npc, line, learn, vocab, xp, when, solve, hint_vi, actions, extra) {
  return Object.assign({ id, category, room, obj, urgency, title_en: t[0], title_vi: t[1], npc: npc || null,
    npc_line_en: line ? line[0] : "", npc_line_vi: line ? line[1] : "", learn_en: learn[0], learn_vi: learn[1], vocab, xp,
    deadlineSec: DEADLINE[urgency], when, solve, hint_vi, actions, cooldownSec: 300 }, extra || {});
}
const has = k => W => W[k] !== undefined;
const is = (k, v) => W => W[k] === v;
const not = (k, v) => W => W[k] !== undefined && W[k] !== v;

const DEFS = [
 /* household emergency */
 E("stove_left_on", "household", "kitchen", "stove", "high", ["The stove is still on", "Bếp vẫn đang bật"], "mom",
   ["The stove is still on! Turn it off, please.", "Bếp vẫn bật kìa! Tắt đi con."], ["The stove is on. I need to turn it off.", "Bếp đang bật. Tôi cần tắt nó."],
   [["stove", "bếp"], ["turn off", "tắt"]], 25, is("k_stove", "on"), { anyActions: ["turn_off_stove"], check: is("k_stove", "off") },
   "Vào bếp và chọn “Turn off the stove”.", ["turn_off_stove"]),
 E("kettle_boiling", "household", "kitchen", "kettle", "high", ["The kettle is boiling", "Ấm nước đang sôi"], "grandma",
   ["The kettle is boiling! Can you turn it off?", "Ấm sôi rồi! Cháu tắt giúp bà nhé?"], ["The kettle is boiling. I need to turn it off.", "Ấm nước đang sôi. Tôi cần tắt nó."],
   [["kettle", "ấm đun nước"], ["boiling", "đang sôi"]], 20, is("k_kettle", "boiling"), { anyActions: ["turn_off_kettle"], check: not("k_kettle", "boiling") },
   "Chọn “Turn off the kettle” trong bếp.", ["turn_off_kettle"]),
 E("smoke_alarm", "household", "kitchen", "smokealarm", "high", ["The smoke alarm is beeping", "Chuông báo khói đang kêu"], "dad",
   ["The smoke alarm is going off! Leave the kitchen and call for help!", "Chuông báo khói kêu! Ra khỏi bếp và gọi người giúp!"],
   ["The smoke alarm is going off. I leave the kitchen and call for help.", "Chuông báo khói đang kêu. Tôi ra khỏi bếp và gọi người giúp đỡ."],
   [["smoke alarm", "chuông báo khói"], ["call for help", "gọi người giúp"], ["leave", "rời khỏi"]], 30,
   is("k_smoke", "beeping"), { anyActions: ["call_for_help"] },
   "An toàn trước tiên: KHÔNG tự sửa. Ra khỏi bếp rồi gọi người lớn giúp.", ["go_living", "call_for_help"]),
 E("tap_running", "household", "bathroom", "tap", "high", ["The tap is running", "Vòi nước đang chảy"], "dad",
   ["Someone left the tap running! Turn it off, quick!", "Ai để vòi nước chảy kìa! Tắt nhanh lên!"], ["The tap is running. I need to turn it off.", "Vòi nước đang chảy. Tôi cần khoá nó lại."],
   [["tap", "vòi nước"], ["running", "đang chảy"]], 20, is("ba_tap", "on"), { anyActions: ["turn_off_tap"], check: not("ba_tap", "on") },
   "Vào phòng tắm, chọn “Turn off the tap”.", ["turn_off_tap"]),
 E("window_rain", "household", "living", "window", "high", ["The window is open in the rain", "Cửa sổ mở khi trời mưa"], "grandpa",
   ["It's raining! Could you close the window?", "Trời mưa rồi! Cháu đóng cửa sổ giúp ông nhé?"], ["It's raining. I need to close the window.", "Trời đang mưa. Tôi cần đóng cửa sổ."],
   [["rain", "mưa"], ["close", "đóng"], ["window", "cửa sổ"]], 20, (W, c) => W.window === "open" && /rain/.test(c.weather || ""),
   { anyActions: ["close_window"], check: is("window", "closed") }, "Chọn “Close the window”.", ["close_window"]),
 E("fridge_open", "household", "living", "fridge", "medium", ["The fridge is open", "Tủ lạnh đang mở"], "mom",
   ["You left the fridge open. Close it, please.", "Con để tủ lạnh mở kìa. Đóng lại nhé."], ["The fridge is open. I need to close it.", "Tủ lạnh đang mở. Tôi cần đóng nó lại."],
   [["fridge", "tủ lạnh"], ["open", "mở"]], 12, is("fridge", "open"), { anyActions: ["close_fridge"], check: is("fridge", "closed") },
   "Chọn “Close the fridge”.", ["close_fridge"], { setup: { if: is("fridge", "closed"), patch: { fridge: "open" } } }),
 E("car_wont_start", "garage", "garage", "car", "medium", ["The car won't start", "Ô tô không nổ máy"], "dad",
   ["The car won't start. Can you call the mechanic?", "Xe không nổ máy. Con gọi thợ sửa xe giúp bố nhé?"], ["The car won't start. I'll call the mechanic.", "Xe không nổ máy. Tôi sẽ gọi thợ sửa xe."],
   [["car", "ô tô"], ["mechanic", "thợ sửa xe"], ["start", "nổ máy"]], 20, is("g_car", "broken"), { anyActions: ["call_mechanic"] },
   "Đừng tự sửa — vào gara và chọn “Call the mechanic”.", ["call_mechanic"]),
 /* daily chores */
 E("dishes_dirty", "chores", "kitchen", "sink", "medium", ["Dirty dishes in the sink", "Bát bẩn trong bồn"], "mom",
   ["Could you wash the dishes, please?", "Con rửa bát giúp mẹ nhé?"], ["The dishes are dirty. I need to wash them.", "Bát đĩa bẩn. Tôi cần rửa chúng."],
   [["dishes", "bát đĩa"], ["dirty", "bẩn"], ["wash", "rửa"]], 15, is("k_dishes", "dirty"), { anyActions: ["wash_dishes"], check: not("k_dishes", "dirty") },
   "Mở vòi nước → rửa bát → khoá vòi.", ["turn_on_faucet", "wash_dishes", "turn_off_faucet"]),
 E("trash_full", "chores", "kitchen", "trashbin", "medium", ["The trash bin is full", "Thùng rác đầy"], "dad",
   ["The trash is full. Can you take it out?", "Rác đầy rồi. Con đổ rác nhé?"], ["The trash is full. I need to take it out.", "Thùng rác đầy. Tôi cần đổ rác."],
   [["trash", "rác"], ["take out", "mang ra ngoài"]], 12, is("k_trash", "full"), { anyActions: ["take_out_trash"], check: not("k_trash", "full") },
   "Chọn “Take out the trash”, rồi lồng túi mới.", ["take_out_trash", "put_in_new_bag"]),
 E("laundry_floor", "chores", "bedroom", "laundry", "low", ["Clothes on the floor", "Quần áo vứt dưới sàn"], "mom",
   ["Please pick up your clothes.", "Nhặt quần áo lên đi con."], ["My clothes are on the floor. I need to pick them up.", "Quần áo của tôi ở dưới sàn. Tôi cần nhặt chúng lên."],
   [["clothes", "quần áo"], ["pick up", "nhặt lên"], ["floor", "sàn nhà"]], 10, is("b_clothes", "floor"), { anyActions: ["pick_up_clothes"], check: not("b_clothes", "floor") },
   "Vào phòng ngủ, chọn “Pick up the clothes”.", ["pick_up_clothes"]),
 E("plates_away", "chores", "kitchen", "dishrack", "low", ["Dry plates on the rack", "Đĩa khô trên giá"], null, null,
   ["The plates are dry. I'll put them away.", "Đĩa đã khô. Tôi sẽ cất chúng đi."], [["put away", "cất đi"], ["plate", "cái đĩa"]], 8,
   is("k_dishes", "dry"), { anyActions: ["put_plates_away"], check: is("k_dishes", "away") }, "Chọn “Put the plates away”.", ["put_plates_away"]),
 E("clear_table", "chores", "kitchen", "diningtable", "low", ["Clear the table", "Dọn bàn ăn"], "grandma",
   ["We've finished eating. Can you clear the table?", "Ăn xong rồi. Cháu dọn bàn nhé?"], ["We've finished eating. I'll clear the table.", "Chúng tôi ăn xong rồi. Tôi sẽ dọn bàn."],
   [["clear the table", "dọn bàn"]], 10, (W) => !W.sitting && (W.k_table === "set" || W.k_riceBowl === "table" || W.k_toast === "table"),
   { anyActions: ["clear_the_table"], check: W => W.k_table === "bare" && W.k_riceBowl !== "table" }, "Chọn “Clear the table”.", ["clear_the_table"]),
 /* cleaning */
 E("floor_dusty", "cleaning", "living", "broom", "low", ["The floor is dusty", "Sàn nhà bụi"], "grandma",
   ["The floor is a bit dusty. Could you sweep it?", "Sàn hơi bụi. Cháu quét giúp bà nhé?"], ["The floor is dusty. I need to sweep it.", "Sàn nhà bụi. Tôi cần quét nó."],
   [["dusty", "bụi bặm"], ["sweep", "quét"], ["broom", "cái chổi"]], 10, has("broom"), { anyActions: ["sweep_floor", "sweep_under_table"] }, "Chọn “Sweep the floor”.", ["sweep_floor"]),
 E("table_sticky", "cleaning", "living", "table", "low", ["The table is sticky", "Bàn bị dính"], "lily",
   ["Eww, the table is sticky!", "Ối, bàn dính quá!"], ["The table is sticky. I'll clean it.", "Cái bàn bị dính. Tôi sẽ lau nó."],
   [["sticky", "dính"], ["clean", "lau sạch"]], 8, has("cup"), { anyActions: ["wipe_table"] }, "Chọn “Clean the table”.", ["wipe_table"]),
 E("towel_floor", "cleaning", "bathroom", "towel", "low", ["A towel is on the floor", "Khăn tắm rơi dưới sàn"], "mom",
   ["Please hang up your towel.", "Treo khăn lên đi con."], ["My towel is on the floor. I need to hang it up.", "Khăn của tôi ở dưới sàn. Tôi cần treo nó lên."],
   [["towel", "khăn tắm"], ["hang up", "treo lên"]], 8, is("ba_towel", "floor"), { anyActions: ["hang_up_towel"], check: not("ba_towel", "floor") }, "Vào phòng tắm, chọn “Hang up the towel”.", ["hang_up_towel"]),
 E("tidy_sofa", "cleaning", "living", "sofa", "low", ["The blanket is messy", "Chăn trên sofa bừa bộn"], "mom",
   ["Could you fold the blanket on the sofa?", "Con gấp cái chăn trên sofa nhé?"], ["The blanket is messy. I'll fold it.", "Cái chăn bừa bộn. Tôi sẽ gấp nó."],
   [["fold", "gấp"], ["blanket", "chăn mỏng"]], 8, is("throw", "messy"), { anyActions: ["fold_throw"], check: is("throw", "folded") }, "Chọn “Fold the throw”.", ["fold_throw"]),
 /* family */
 E("fan_left_on", "family", "living", "fan", "medium", ["The fan is still on", "Quạt vẫn đang bật"], "dad",
   ["Could you turn off the fan? It's a bit cold.", "Con tắt quạt giúp bố nhé? Hơi lạnh."], ["The fan is on. I need to turn it off.", "Quạt đang bật. Tôi cần tắt nó."],
   [["fan", "quạt"], ["turn off", "tắt"], ["cold", "lạnh"]], 12, is("fan", "on"), { anyActions: ["turn_off_fan"], check: is("fan", "off") }, "Chọn “Turn off the fan”.", ["turn_off_fan"]),
 E("tv_left_on", "family", "living", "tv", "medium", ["Nobody is watching the TV", "TV bật mà không ai xem"], "mom",
   ["Nobody is watching. Turn off the TV, please.", "Không ai xem cả. Tắt TV đi con."], ["Nobody is watching TV. I'll turn it off.", "Không ai xem TV. Tôi sẽ tắt nó."],
   [["TV", "ti vi"], ["nobody", "không ai"]], 10, W => W.tv === "on" && W.activity !== "watching", { anyActions: ["turn_off_tv"], check: is("tv", "off") }, "Chọn “Turn off the TV”.", ["turn_off_tv"]),
 E("floorlamp_day", "family", "living", "floorlamp", "low", ["The lamp is on in the daytime", "Đèn bật giữa ban ngày"], "grandpa",
   ["It's bright outside. Turn off the lamp to save power.", "Trời sáng rồi. Tắt đèn cho đỡ tốn điện."], ["It's bright. I'll turn off the lamp to save electricity.", "Trời sáng. Tôi sẽ tắt đèn để tiết kiệm điện."],
   [["lamp", "đèn"], ["save electricity", "tiết kiệm điện"]], 8, (W, c) => W.floorLamp === "on" && !/night|evening/.test(c.phase || ""),
   { anyActions: ["turn_off_floor_lamp"], check: is("floorLamp", "off") }, "Chọn “Turn off the floor lamp”.", ["turn_off_floor_lamp"]),
 E("grandpa_tea", "family", "kitchen", "kettle", "low", ["Grandpa wants tea", "Ông muốn uống trà"], "grandpa",
   ["The water is hot. Could you pour it for my tea?", "Nước nóng rồi. Cháu rót nước pha trà cho ông nhé?"], ["The water is hot. I'll pour it into the teapot.", "Nước đã nóng. Tôi sẽ rót vào ấm trà."],
   [["pour", "rót"], ["hot water", "nước nóng"], ["tea", "trà"]], 10, is("k_kettle", "hot"), { anyActions: ["pour_hot_water"], check: is("k_kettle", "empty") }, "Chọn “Pour the hot water”.", ["pour_hot_water"]),
 E("mom_set_table", "family", "kitchen", "diningtable", "medium", ["Dinner is soon", "Sắp đến bữa ăn"], "mom",
   ["Dinner is almost ready. Can you set the table?", "Sắp ăn rồi. Con bày bàn ăn nhé?"], ["Dinner is almost ready. I'll set the table.", "Bữa tối sắp xong. Tôi sẽ bày bàn ăn."],
   [["set the table", "bày bàn ăn"], ["dinner", "bữa tối"]], 12, is("k_table", "bare"), { anyActions: ["set_the_table"], check: is("k_table", "set") }, "Chọn “Set the table”.", ["set_the_table"]),
 E("baby_crying", "family", "living", "baby", "high", ["The baby is crying", "Em bé đang khóc"], "mom",
   ["The baby is crying. Can you check on her?", "Em bé khóc kìa. Con xem em thế nào nhé?"], ["The baby is crying. I'll comfort her.", "Em bé đang khóc. Tôi sẽ dỗ em."],
   [["baby", "em bé"], ["crying", "đang khóc"], ["comfort", "dỗ dành"]], 20, is("baby", "crying"), { anyActions: ["comfort_baby"], check: not("baby", "crying") }, "Chọn “Comfort the baby”.", ["comfort_baby"]),
 E("lily_book", "family", "living", "book", "low", ["Lily's book is on the floor", "Sách của Lily rơi dưới sàn"], "lily",
   ["Where's my book? Can you put it on the table?", "Sách của em đâu? Anh/chị để lên bàn giúp em nhé?"], ["The book is on the floor. I'll put it on the table.", "Quyển sách ở dưới sàn. Tôi sẽ đặt nó lên bàn."],
   [["book", "quyển sách"], ["on the table", "trên bàn"]], 8, is("book", "floor"), { anyActions: ["put_book_on_table"], check: is("book", "table") }, "Chọn “Put the book on the table”.", ["put_book_on_table"]),
 /* pet care */
 E("cat_hungry", "pet", "living", "cat", "medium", ["The cat is hungry", "Con mèo đói"], "lily",
   ["The cat is meowing. I think she's hungry!", "Mèo kêu meo meo. Chắc nó đói rồi!"], ["The cat is hungry. I need to feed her.", "Con mèo đói. Tôi cần cho nó ăn."],
   [["hungry", "đói"], ["feed", "cho ăn"], ["bowl", "bát"]], 12, is("catBowl", "empty"), { anyActions: ["feed_cat"], check: is("catBowl", "full") }, "Chọn “Feed the cat”.", ["feed_cat"]),
 E("cat_thirsty", "pet", "living", "cat", "medium", ["The cat is thirsty", "Con mèo khát nước"], "tom",
   ["Hey, the cat's water bowl is empty.", "Này, bát nước của mèo hết rồi."], ["The cat is thirsty. I'll give her some water.", "Con mèo khát. Tôi sẽ cho nó uống nước."],
   [["thirsty", "khát"], ["water", "nước"]], 12, is("catWater", "empty"), { anyActions: ["give_cat_water"], check: is("catWater", "full") }, "Chọn “Give the cat water”.", ["give_cat_water"]),
 E("cat_bored", "pet", "living", "cat", "low", ["The cat is bored", "Con mèo buồn chán"], "lily",
   ["The cat wants to play with you!", "Mèo muốn chơi với anh/chị kìa!"], ["The cat is bored. I'll play with her.", "Con mèo buồn chán. Tôi sẽ chơi với nó."],
   [["bored", "buồn chán"], ["play with", "chơi với"]], 8, W => W.cat !== undefined && W.cat !== "playing", { anyActions: ["play_with_cat"] }, "Chọn “Play with the cat”.", ["play_with_cat"]),
 /* cooking */
 E("rice_cooked", "cooking", "kitchen", "ricecooker", "medium", ["The rice is ready", "Cơm chín rồi"], "mom",
   ["The rice is cooked. Can you serve it?", "Cơm chín rồi. Con xới cơm nhé?"], ["The rice is cooked. I'll serve it.", "Cơm đã chín. Tôi sẽ xới cơm."],
   [["rice", "cơm"], ["cooked", "đã chín"], ["serve", "xới, dọn ra"]], 12, is("k_rice", "done"), { anyActions: ["serve_rice"], check: is("k_rice", "served") }, "Chọn “Serve the rice”.", ["serve_rice"]),
 E("microwave_done", "cooking", "kitchen", "microwave", "medium", ["The microwave beeped", "Lò vi sóng kêu bíp"], "tom",
   ["The microwave beeped. Your food is ready!", "Lò vi sóng kêu rồi. Đồ ăn xong rồi đấy!"], ["The microwave beeped. I'll take out my food.", "Lò vi sóng kêu bíp. Tôi sẽ lấy đồ ăn ra."],
   [["microwave", "lò vi sóng"], ["beep", "kêu bíp"]], 10, W => W.k_food === "hot" && W.k_micro === "closed", { anyActions: ["open_microwave"], check: is("k_micro", "open") }, "Chọn “Open the microwave”.", ["open_microwave"]),
 E("milk_left_out", "cooking", "living", "fridge", "medium", ["The milk is left out", "Sữa để ngoài"], "mom",
   ["The milk will go bad. Put it back in the fridge.", "Sữa sẽ hỏng mất. Cất lại vào tủ lạnh đi."], ["The milk is out. I need to put it back in the fridge.", "Sữa đang để ngoài. Tôi cần cất lại vào tủ lạnh."],
   [["milk", "sữa"], ["go bad", "bị hỏng"], ["put back", "cất lại"]], 12, W => W.milk !== undefined && W.milk !== "fridge" && W.milk !== "hand",
   { anyActions: ["put_milk_back"], check: is("milk", "fridge") }, "Chọn “Put the milk back”.", ["put_milk_back"]),
 E("dad_coffee", "cooking", "kitchen", "coffeemaker", "low", ["Dad wants coffee", "Bố muốn uống cà phê"], "dad",
   ["Could you make me a cup of coffee?", "Con pha cho bố một cốc cà phê nhé?"], ["Dad wants coffee. I'll make some.", "Bố muốn uống cà phê. Tôi sẽ pha một ít."],
   [["coffee", "cà phê"], ["make", "pha"]], 8, is("k_coffee", "none"), { anyActions: ["make_coffee"] }, "Chọn “Make coffee”.", ["make_coffee"]),
 E("fridge_snack", "cooking", "kitchen", "fridge", "low", ["Tom is hungry", "Anh Tom đói bụng"], "tom",
   ["I'm starving. Can you grab something from the fridge?", "Anh đói quá. Lấy gì đó trong tủ lạnh đi?"], ["Tom is hungry. I'll get some food from the fridge.", "Tom đói. Tôi sẽ lấy đồ ăn trong tủ lạnh."],
   [["starving", "đói meo"], ["grab", "lấy nhanh"]], 8, has("k_fridge"), { anyActions: ["take_food_from_fridge"] }, "Mở tủ lạnh trong bếp và lấy đồ ăn.", ["take_food_from_fridge"]),
 /* personal care */
 E("alarm_ringing", "personal", "bedroom", "alarmclock", "high", ["The alarm is ringing", "Đồng hồ báo thức đang kêu"], "tom",
   ["Your alarm is so loud! Turn it off!", "Báo thức của em to quá! Tắt đi!"], ["My alarm is ringing. I need to turn it off.", "Báo thức đang kêu. Tôi cần tắt nó."],
   [["alarm", "báo thức"], ["ringing", "đang reo"], ["loud", "to, ồn"]], 15, is("b_alarm", "ringing"), { anyActions: ["turn_off_alarm"], check: not("b_alarm", "ringing") }, "Vào phòng ngủ, chọn “Turn off the alarm”.", ["turn_off_alarm"]),
 E("lamp_night", "personal", "bedroom", "lamp", "low", ["The bedroom lamp is on at night", "Đèn phòng ngủ bật lúc đêm"], "mom",
   ["It's late. Turn off the lamp and go to sleep.", "Khuya rồi. Tắt đèn đi ngủ thôi."], ["It's late. I'll turn off the lamp.", "Muộn rồi. Tôi sẽ tắt đèn."],
   [["late", "muộn"], ["go to sleep", "đi ngủ"]], 8, (W, c) => W.b_lamp === "on" && c.phase === "night", { anyActions: ["turn_off_lamp"], check: is("b_lamp", "off") }, "Chọn “Turn off the lamp”.", ["turn_off_lamp"]),
 E("phone_low", "personal", "bedroom", "phone", "low", ["Your phone battery is low", "Điện thoại sắp hết pin"], null, null,
   ["My phone battery is low. I need to charge it.", "Điện thoại của tôi sắp hết pin. Tôi cần sạc nó."], [["battery", "pin"], ["charge", "sạc"]], 8,
   is("b_phone", "low"), { anyActions: ["charge_phone"], check: not("b_phone", "low") }, "Chọn “Charge the phone”.", ["charge_phone"]),
 E("wash_hands", "personal", "kitchen", "sink", "low", ["Wash your hands before eating", "Rửa tay trước khi ăn"], "grandma",
   ["Wash your hands before you eat, dear.", "Rửa tay trước khi ăn nhé cháu."], ["I wash my hands before I eat.", "Tôi rửa tay trước khi ăn."],
   [["wash", "rửa"], ["hands", "tay"], ["before", "trước khi"]], 8, has("k_faucet"), { anyActions: ["wash_hands"] }, "Chọn “Wash your hands”.", ["wash_hands"]),
 E("brush_teeth", "personal", "bathroom", "toothbrush", "low", ["Time to brush your teeth", "Đến giờ đánh răng"], "mom",
   ["Don't forget to brush your teeth!", "Đừng quên đánh răng nhé!"], ["I brush my teeth twice a day.", "Tôi đánh răng hai lần một ngày."],
   [["brush", "chải, đánh"], ["teeth", "răng"]], 8, has("ba_tap"), { anyActions: ["brush_teeth"] }, "Vào phòng tắm, chọn “Brush your teeth”.", ["brush_teeth"]),
 /* garage / garden */
 E("garage_door_open", "garage", "garage", "garagedoor", "medium", ["The garage door is open", "Cửa gara đang mở"], "dad",
   ["The garage door is open. Please close it.", "Cửa gara mở kìa. Đóng lại giúp bố."], ["The garage door is open. I'll close it.", "Cửa gara đang mở. Tôi sẽ đóng nó."],
   [["garage", "nhà để xe"], ["door", "cửa"]], 10, is("g_door", "open"), { anyActions: ["close_garage_door"], check: is("g_door", "closed") }, "Chọn “Close the garage door”.", ["close_garage_door"]),
 E("garden_thirsty", "garden", "garden", "flowerbed", "low", ["The garden plants are dry", "Cây ngoài vườn bị khô"], "grandpa",
   ["It hasn't rained for days. Can you water the garden?", "Mấy hôm không mưa. Cháu tưới vườn nhé?"], ["The plants are dry. I'll water the garden.", "Cây bị khô. Tôi sẽ tưới vườn."],
   [["garden", "khu vườn"], ["dry", "khô"], ["water", "tưới"]], 10, (W, c) => !/rain/.test(c.weather || ""), { anyActions: ["water_garden"] }, "Ra vườn, chọn “Water the garden”.", ["water_garden"]),
 E("plant_thirsty", "garden", "living", "plant", "low", ["The plant looks thirsty", "Cây cảnh trông khát nước"], "grandma",
   ["The plant looks thirsty. Could you water it?", "Cây trông khát nước. Cháu tưới giúp bà?"], ["The plant is thirsty. I'll water it.", "Cái cây khát nước. Tôi sẽ tưới nó."],
   [["plant", "cái cây"], ["thirsty", "khát"]], 8, has("window"), { anyActions: ["water_plant"] }, "Chọn “Water the plant”.", ["water_plant"]),
 /* social */
 E("curtains_morning", "social", "living", "livcurtains", "low", ["Let the sunshine in", "Mở rèm đón nắng"], "grandma",
   ["Good morning! Open the curtains, it's a lovely day.", "Chào buổi sáng! Mở rèm ra đi cháu, hôm nay đẹp trời."], ["Good morning! I'll open the curtains.", "Chào buổi sáng! Tôi sẽ mở rèm."],
   [["curtains", "rèm cửa"], ["lovely", "đẹp, dễ chịu"]], 8, (W, c) => W.livCurtains === "closed" && /dawn|morning/.test(c.phase || ""),
   { anyActions: ["open_living_curtains"], check: is("livCurtains", "open") }, "Chọn “Open the curtains”.", ["open_living_curtains"]),
 E("visitor_door", "social", "living", "frontdoor", "medium", ["Someone is at the door", "Có người gõ cửa"], "dad",
   ["Someone's at the door. Can you answer it?", "Có người ở cửa. Con ra mở cửa nhé?"], ["Someone is at the door. I'll answer it.", "Có người ở cửa. Tôi sẽ ra mở cửa."],
   [["answer the door", "ra mở cửa"], ["knock", "gõ cửa"]], 12, has("frontdoor"), { anyActions: ["answer_door"] }, "Chọn “Answer the door”.", ["answer_door"]),
 E("tom_cushion", "social", "living", "sofa", "low", ["Movie night with Tom", "Tối xem phim với Tom"], "tom",
   ["Movie time! Can you fluff the cushions?", "Đến giờ xem phim! Vỗ gối cho phồng lên nhé?"], ["It's movie time. I'll fluff the cushions.", "Đến giờ xem phim. Tôi sẽ vỗ gối cho phồng."],
   [["cushion", "gối tựa"], ["fluff", "vỗ cho phồng"]], 8, is("cushion", "flat"), { anyActions: ["fluff_cushion"], check: is("cushion", "fluffy") }, "Chọn “Fluff the cushion”.", ["fluff_cushion"]),
];
const BYID = {}; DEFS.forEach(d => { BYID[d.id] = d; });

/* ---------- storage ---------- */
const mem = {};
const store = {
  get(k) { try { if (typeof localStorage !== "undefined") return localStorage.getItem(k); } catch (e) {} return mem[k] || null; },
  set(k, v) { try { if (typeof localStorage !== "undefined") { localStorage.setItem(k, v); return; } } catch (e) {} mem[k] = v; }
};
const DEF_SETTINGS = { v: 1, interval: 30, enabled: true, maxActive: 2, mode: "realtime" };

/* ---------- director ---------- */
let pausedAt = 0; let o = {}, S = null, timer = null, paused = false, startedAt = 0, lastSpawnTry = 0, trays = [], uid = 1;
const now = () => (o.now ? o.now() : Date.now());
const rnd = () => (o.random ? o.random() : Math.random());
function fresh() { return { ...DEF_SETTINGS, active: [], history: [], cooldown: {}, stats: {}, savedAt: 0 }; }
function load() {
  S = fresh();
  try { const j = JSON.parse(store.get(LSKEY) || "null"); if (j && j.v === 1) Object.assign(S, j); } catch (e) {}
  S.maxActive = Math.max(1, Math.min(3, S.maxActive | 0 || 2));
  S.interval = Math.max(5, +S.interval || 30);
  if (!["practice", "realtime", "pause"].includes(S.mode)) S.mode = "realtime";
}
function save() { S.savedAt = now(); S.history = S.history.slice(-60); store.set(LSKEY, JSON.stringify(S)); }
function W() { try { return (o.getW && o.getW()) || {}; } catch (e) { return {}; } }
function ctx() {
  if (o.getCtx) try { return o.getCtx() || {}; } catch (e) {}
  const D = typeof window !== "undefined" && window.ELW_DAY; const c = {};
  try { if (D && D.state) { c.weather = D.state.weather; if (D.phaseOfHour && D.state.minutes != null) c.phase = D.phaseOfHour(D.state.minutes / 60); else c.phase = D.state.phase; } } catch (e) {}
  return c;
}
const actionExists = id => { try { return o.actionExists ? !!o.actionExists(id) : true; } catch (e) { return false; } };
const objectExists = (id, room) => { try { return o.objectExists ? !!o.objectExists(id, room) : true; } catch (e) { return false; } };
function available(d) { // registry validation: all needed actions exist + object exists in room
  const ids = new Set([...(d.solve.anyActions || []), ...(d.actions || []).filter(a => !a.startsWith("go_"))]);
  for (const a of ids) if (!actionExists(a)) return false;
  return objectExists(d.obj, d.room);
}
function eligible(d, w, c, t) {
  if (!available(d)) return false;
  if (S.active.some(a => a.id === d.id)) return false;
  if ((S.cooldown[d.id] || 0) > t) return false;
  let ok = false; try { ok = !!d.when(w, c); } catch (e) {}
  if (!ok && d.setup && o.setState) { try { ok = !!d.setup.if(w); } catch (e) {} }
  return ok;
}
function isSurpriseEnabled() {
  try {
    if (typeof window !== "undefined" && window.ELW_CONTEXT && typeof window.ELW_CONTEXT.isSideCharacterEnabled === "function") {
      return !!window.ELW_CONTEXT.isSideCharacterEnabled("surprise");
    }
  } catch (e) {}
  return true;
}
function deadlineFor(d) { if (!d.deadlineSec) return null; return d.deadlineSec * (S.mode === "practice" ? 2 : 1) * 1000; }
function spawn(d, t) {
  if (!isSurpriseEnabled()) return null;
  const w = W();
  let natural = false; try { natural = !!d.when(w, ctx()); } catch (e) {}
  if (!natural && d.setup && o.setState) o.setState({ ...d.setup.patch });
  const dl = deadlineFor(d);
  const ev = { uid: uid++, id: d.id, spawnedAt: t, deadline: dl ? t + dl : null, status: "active" };
  S.active.push(ev); S.cooldown[d.id] = t + d.cooldownSec * 1000;
  save();
  if (o.toast) o.toast(`${BADGE[d.urgency][0]} ${d.title_vi} — ${d.title_en}`);
  if (o.speak && d.npc && d.npc_line_en && o.speakLines) o.speak(d.npc_line_en, d.npc);
  refresh(); return ev;
}
function bump(cat, key) { const s = S.stats[cat] || (S.stats[cat] = { completed: 0, missed: 0 }); s[key]++; }
function finish(ev, status, t, extra) {
  const d = BYID[ev.id]; S.active = S.active.filter(a => a !== ev);
  const h = { uid: ev.uid, id: ev.id, status, at: t, xp: 0, ...(extra || {}) };
  if (status === "completed") { h.xp = d.xp; try { o.addXp && o.addXp(d.xp); } catch (e) {} if (o.toast) o.toast(`✅ ${d.title_vi} (+${d.xp} XP)`); }
  if (status === "missed") { h.explain_vi = `Bạn chưa kịp xử lý: “${d.title_vi}”. ${d.hint_vi} Câu cần nhớ: “${d.learn_en}”`; if (!h.quiet && o.toast) o.toast(`⌛ Lỡ mất: ${d.title_vi}. Không sao — bấm “Học lại” để luyện câu.`); }
  bump(d.category, status === "completed" ? "completed" : "missed");
  S.history.push(h); save(); refresh(); return h;
}
function solvedByState(d, w) { return d.solve.check ? (() => { try { return !!d.solve.check(w); } catch (e) { return false; } })() : false; }
function onAction(actionId, w) {
  w = w || W(); const t = now(); const done = [];
  for (const ev of S.active.slice()) {
    const d = BYID[ev.id]; const any = d.solve.anyActions || [];
    if (!any.includes(actionId)) continue;
    if (d.solve.check && !solvedByState(d, w)) continue; // action alone is not enough when a real state check exists
    done.push(finish(ev, "completed", t, { by: actionId }));
  }
  return done;
}
function onState(w) {
  w = w || W(); const t = now(); const done = [];
  for (const ev of S.active.slice()) { const d = BYID[ev.id]; if (d.solve.check && ev.spawnedAt < t && solvedByState(d, w)) done.push(finish(ev, "completed", t, { by: "state" })); }
  return done;
}
function busy() { try { return !!(o.isBusy && o.isBusy()); } catch (e) { return false; } }
function tick(t) {
  t = t == null ? now() : t;
  if (!S) load();
  if (!isSurpriseEnabled()) {
    if (S.active && S.active.length) { S.active = []; save(); }
    lastSpawnTry = Math.max(lastSpawnTry, t - S.interval * 1000 + 5000);
    refresh();
    return null;
  }
  if (paused || !S.enabled || S.mode === "pause") { lastSpawnTry = Math.max(lastSpawnTry, t - S.interval * 1000 + 5000); refresh(); return null; }
  for (const ev of S.active.slice()) if (ev.deadline && t >= ev.deadline) finish(ev, "missed", t);
  onState();
  let spawned = null;
  if (t - startedAt >= 20000 && t - lastSpawnTry >= S.interval * 1000) {
    lastSpawnTry = t;
    if (S.active.length < S.maxActive && !busy() && rnd() < (S.active.length ? 0.4 : 0.6)) {
      const w = W(), c = ctx(), hasHigh = S.active.some(a => BYID[a.id].urgency === "high");
      const cands = DEFS.filter(d => !(hasHigh && d.urgency === "high") && eligible(d, w, c, t));
      if (cands.length) {
        const tot = cands.reduce((s, d) => s + URG[d.urgency], 0); let r = rnd() * tot, pick = cands[0];
        for (const d of cands) { r -= URG[d.urgency]; if (r <= 0) { pick = d; break; } }
        spawned = spawn(pick, t);
      }
    }
  }
  refresh(); return spawned;
}
function catchUp(t) { // after reload: expire stale events quietly, never flood
  if (!isSurpriseEnabled()) { S.active = []; return; }
  const away = t - (S.savedAt || t);
  for (const ev of S.active.slice()) {
    if ((ev.deadline && t >= ev.deadline) || away > 10 * 60000) finish(ev, "missed", t, { quiet: true });
    else if (ev.deadline && away > 0) ev.deadline = Math.max(ev.deadline, t + 15000); // grace after reload
  }
}
function init(opts) { o = Object.assign({}, opts || {}); load(); return api; }
function start(opts) {
  if (opts) Object.assign(o, opts); if (!S) load();
  const t = now(); startedAt = t; lastSpawnTry = t - S.interval * 1000; paused = false;
  catchUp(t); save();
  if (timer) clearInterval(timer);
  if (!o.manual && typeof setInterval !== "undefined") timer = setInterval(() => tick(), 1000);
  refresh(); return api;
}
function stop() { if (timer) clearInterval(timer); timer = null; }
function pause() { if (!paused) { paused = true; pausedAt = now(); } refresh(); }
function resume() { if (!paused) return; paused = false; const t = now(); shiftDeadlines(t - pausedAt); lastSpawnTry = Math.max(lastSpawnTry, t - S.interval * 1000 + 10000); refresh(); }
function shiftDeadlines(ms) { if (ms > 0) S.active.forEach(ev => { if (ev.deadline) { ev.deadline += ms; ev.spawnedAt += ms; } }); save(); }
function forceSpawn(id) { if (!isSurpriseEnabled()) return null; if (!S) load(); const d = BYID[id]; if (!d || S.active.some(a => a.id === id) || !available(d)) return null; return spawn(d, now()); }
function setSettings(p) { if (!S) load(); for (const k of ["interval", "enabled", "maxActive", "mode"]) if (p && p[k] !== undefined) S[k] = p[k]; const keep = { active: S.active, history: S.history, cooldown: S.cooldown, stats: S.stats }; save(); load(); Object.assign(S, keep); save(); refresh(); return settings(); }
function settings() { if (!S) load(); return { v: 1, interval: S.interval, enabled: S.enabled, maxActive: S.maxActive, mode: S.mode }; }
function active() { if (!S) load(); if (!isSurpriseEnabled()) return []; return S.active.map(ev => ({ ...ev, def: BYID[ev.id] })).sort((a, b) => URG[b.def.urgency] - URG[a.def.urgency] || a.spawnedAt - b.spawnedAt); }
function history() { if (!S) load(); return S.history.slice(); }
function stats() { if (!S) load(); const by = JSON.parse(JSON.stringify(S.stats)); let c = 0, m = 0; for (const k in by) { c += by[k].completed; m += by[k].missed; } return { completed: c, missed: m, byCategory: by }; }
function doNow(evUid) { const ev = S.active.find(a => a.uid === evUid); if (!ev || !o.enqueue) return; for (const a of BYID[ev.id].actions) o.enqueue(a); }
function reset() { S = fresh(); save(); refresh(); }
function teardown(target) {
  var k = String(target || "all").toLowerCase();
  if (k === "linh" || k === "friend" || k === "companion") return;
  if (!S) load();
  S.active = [];
  if (Array.isArray(S.history)) {
    S.history.forEach(h => { if (h) h.quiet = true; });
  }
  save();
  refresh();
}

/* ---------- UI ---------- */
const css = `
.ev-tray{--accent:#e8743b;--line:#e3d6c3;--red:#c0392b;--amber:#e0a03a;--green:#3a9d5d;--cream:#fffaf2;--ink:#3b2f25;font:14px/1.35 system-ui,sans-serif;color:var(--ink);max-width:100%;box-sizing:border-box}
.ev-tray *{box-sizing:border-box}
.ev-head{display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--cream);border:1px solid var(--line);border-radius:12px;cursor:pointer;width:100%;font:inherit;color:inherit;text-align:left}
.ev-head b{flex:1}.ev-count{background:var(--accent);color:#fff;border-radius:999px;padding:0 8px;font-size:12px}
.ev-list{display:flex;flex-direction:column;gap:8px;margin-top:8px}.ev-tray.ev-collapsed .ev-list{display:none}
.ev-card{background:var(--cream);border:1px solid var(--line);border-left:5px solid #b9ad9c;border-radius:12px;padding:8px 10px;overflow-wrap:anywhere}
.ev-card.ev-high{border-left-color:var(--red)}.ev-card.ev-medium{border-left-color:var(--amber)}
.ev-top{display:flex;gap:6px;align-items:baseline;flex-wrap:wrap}
.ev-badge{font-size:11px;font-weight:700;border-radius:999px;padding:1px 7px;border:1px solid currentColor;white-space:nowrap}
.ev-high .ev-badge{color:var(--red)}.ev-medium .ev-badge{color:#9a6a12}.ev-low .ev-badge{color:#6b6157}
.ev-title{font-weight:700}.ev-vi{color:#7a6a5a;font-size:12.5px}
.ev-npc{margin:4px 0;font-style:italic;font-size:13px}
.ev-bar{height:5px;background:var(--line);border-radius:4px;overflow:hidden;margin:6px 0}.ev-bar i{display:block;height:100%;background:var(--amber);transition:width 1s linear}
.ev-high .ev-bar i{background:var(--red)}
.ev-btns{display:flex;gap:6px;flex-wrap:wrap}
.ev-btn{border:1px solid var(--line);background:#fff;border-radius:999px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer;color:inherit;min-height:32px}
.ev-btn.ev-go{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
.ev-empty{padding:6px 10px;color:#7a6a5a;font-size:13px}
.ev-missed{border-left-color:#8a8076;opacity:.92}.ev-done{border-left-color:var(--green)}
.ev-set{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;font:14px system-ui,sans-serif;max-width:100%}
.ev-set select,.ev-set input{font:inherit;max-width:9em}
@media (prefers-reduced-motion:reduce){.ev-bar i{transition:none}}
`;
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }
const NPCN = { dad: "Bố", mom: "Mẹ", grandpa: "Ông", grandma: "Bà", tom: "Tom", lily: "Lily", baby: "Em bé" };
function cardHtml(ev, t) {
  const d = BYID[ev.id], [ic, lb] = BADGE[d.urgency];
  const pct = ev.deadline ? Math.max(0, Math.min(100, (ev.deadline - t) / (ev.deadline - ev.spawnedAt) * 100)) : null;
  const left = ev.deadline ? Math.max(0, Math.ceil((ev.deadline - t) / 1000)) : null;
  return `<div class="ev-card ev-${d.urgency}" data-uid="${ev.uid}"><div class="ev-top"><span class="ev-badge">${ic} ${lb}</span><span class="ev-title">${esc(d.title_en)}</span></div>
<div class="ev-vi">${esc(d.title_vi)}${left != null ? ` · còn ${left}s` : ""}</div>
${d.npc ? `<div class="ev-npc">${esc(NPCN[d.npc] || d.npc)}: “${esc(d.npc_line_en)}” <span class="ev-vi">${esc(d.npc_line_vi)}</span></div>` : ""}
${pct != null ? `<div class="ev-bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-label="Thời gian còn lại"><i style="width:${pct}%"></i></div>` : ""}
<div class="ev-btns"><button class="ev-btn ev-go" data-go="${ev.uid}">▶ Làm ngay</button><button class="ev-btn" data-say="${esc(d.id)}" title="${esc(d.learn_vi)}">🔊 ${esc(d.learn_en)}</button></div></div>`;
}
function missedHtml(h) {
  const d = BYID[h.id];
  return `<div class="ev-card ev-missed"><div class="ev-top"><span class="ev-badge">⌛ Lỡ mất</span><span class="ev-title">${esc(d.title_en)}</span></div>
<div class="ev-vi">${esc(h.explain_vi || d.hint_vi)}</div><div class="ev-btns"><button class="ev-btn" data-say="${esc(d.id)}">🔁 Học lại</button><button class="ev-btn" data-dismiss="${h.uid}">✕</button></div></div>`;
}
let collapsed = false, dismissed = new Set();
function draw(c) {
  const t = now(), list = active();
  const missed = S.history.filter(h => h.status === "missed" && !h.quiet && !dismissed.has(h.uid) && t - h.at < 120000).slice(-1);
  c.innerHTML = `<div class="ev-tray${collapsed ? " ev-collapsed" : ""}"><button class="ev-head" data-toggle aria-expanded="${!collapsed}"><span>🔔</span><b>Việc cần làm</b>${paused || S.mode === "pause" ? "<span>⏸</span>" : ""}<span class="ev-count">${list.length}</span><span>${collapsed ? "▸" : "▾"}</span></button>
<div class="ev-list">${list.map(e => cardHtml(e, t)).join("") || '<div class="ev-empty">Không có việc gấp. 🙂</div>'}${missed.map(missedHtml).join("")}</div></div>`;
}
function renderTray(c) {
  if (!S) load(); if (!c) return;
  if (!trays.includes(c)) {
    trays.push(c);
    c.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-toggle")) { collapsed = !collapsed; draw(c); }
      else if (b.dataset.go) doNow(+b.dataset.go);
      else if (b.dataset.say) { const d = BYID[b.dataset.say]; if (o.speak) o.speak(d.learn_en, "narrator"); }
      else if (b.dataset.dismiss) { dismissed.add(+b.dataset.dismiss); draw(c); }
    });
  }
  draw(c);
}
function refresh() { trays = trays.filter(c => c.isConnected !== false); trays.forEach(draw); }
function renderSettings(c) {
  if (!S) load(); const s = settings();
  c.innerHTML = `<div class="ev-set"><label for="evOn">Bật sự kiện</label><input id="evOn" type="checkbox" ${s.enabled ? "checked" : ""}>
<label for="evInt">Khoảng thời gian (giây)</label><input id="evInt" type="number" min="5" max="600" value="${s.interval}">
<label for="evMax">Tối đa cùng lúc</label><select id="evMax">${[1, 2, 3].map(n => `<option ${n === s.maxActive ? "selected" : ""}>${n}</option>`).join("")}</select>
<label for="evMode">Chế độ</label><select id="evMode">${[["practice", "Luyện tập (chậm)"], ["realtime", "Thời gian thực"], ["pause", "Tạm dừng"]].map(([v, l]) => `<option value="${v}" ${v === s.mode ? "selected" : ""}>${l}</option>`).join("")}</select></div>`;
  c.onchange = () => setSettings({ enabled: c.querySelector("#evOn").checked, interval: Math.max(5, +c.querySelector("#evInt").value || 30), maxActive: +c.querySelector("#evMax").value, mode: c.querySelector("#evMode").value });
}

const api = { DEFS, BYID, init, start, stop, pause, resume, tick, onAction, onState, active, history, stats, forceSpawn, setSettings, settings, renderTray, renderSettings, css, available, reset, doNow, teardown, LSKEY };
if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof window !== "undefined") window.ELW_EVENTS = api;
})();
