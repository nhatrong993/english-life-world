/* English Life World — extra rooms module (kitchen + bedroom)
   Browser script: defines window.ELW_ROOMS and window.ELW_ROOMS_CATALOG_LIVING.
   Every room-state key is prefixed with the room id (k_ = kitchen, b_ = bedroom).
   applyState(W, rootEl) mirrors every prefixed key onto rootEl as data-<key>="<value>"
   and the room CSS reacts to those attributes. */
(function () {
"use strict";

/* ---------- shared helpers ---------- */
const mkAct = (V) => (id, obj, label, labelVi, sentence, vi, key, vk, grammar, chunks, disc, patterns, pre, seq, story, sitOk) => ({
  id, obj, label, labelVi, sentence, vi, key,
  vocab: vk.map(k => { if (!V[k]) throw new Error("vocab " + k); return V[k]; }),
  grammar, chunks, disc: { ans: disc[0], opts: disc.slice() }, patterns,
  pre, seq, sitOk: !!sitOk, story
});
const objG = (id, en, vi, base, tagX, tagY, inner, extra) =>
  `<g class="obj" id="o-${id}" data-obj="${id}" data-base="${base}" tabindex="0" aria-label="${en}, ${vi}"${extra || ""}><g class="vec">${inner}</g><text class="tag" x="${tagX}" y="${tagY}" text-anchor="middle">${en} · ${vi}</text></g>`;
const mirrorState = (W, W0, root) => { for (const k of Object.keys(W0)) root.setAttribute("data-" + k, String(W[k])); };
const cat = (prefix, rows) => rows.map(([en, ipa, vi, category]) => ({ id: prefix + en.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, ""), en, vi, ipa, category }));

/* ======================================================================
   KITCHEN
   ====================================================================== */
const KV = {
  stove: ["stove", "/stəʊv/", "bếp nấu"], turnon: ["turn on", "/tɜːn ɒn/", "bật"], turnoff: ["turn off", "/tɜːn ɒf/", "tắt"],
  fry: ["fry", "/fraɪ/", "chiên, rán"], egg: ["egg", "/eɡ/", "quả trứng"], pan: ["frying pan", "/ˈfraɪ.ɪŋ pæn/", "cái chảo"],
  kettle: ["kettle", "/ˈket.əl/", "ấm đun nước"], fill: ["fill", "/fɪl/", "đổ đầy"], water: ["water", "/ˈwɔː.tər/", "nước"],
  boil: ["boil", "/bɔɪl/", "đun sôi"], hot: ["hot", "/hɒt/", "nóng"], pour: ["pour", "/pɔːr/", "rót"], mug: ["mug", "/mʌɡ/", "cốc có quai"],
  wash: ["wash", "/wɒʃ/", "rửa"], rice: ["rice", "/raɪs/", "gạo, cơm"], cook: ["cook", "/kʊk/", "nấu"],
  ricecooker: ["rice cooker", "/ˈraɪs ˌkʊk.ər/", "nồi cơm điện"], bowl: ["bowl", "/bəʊl/", "cái bát"],
  microwave: ["microwave", "/ˈmaɪ.krə.weɪv/", "lò vi sóng"], heatup: ["heat up", "/hiːt ʌp/", "hâm nóng"], food: ["food", "/fuːd/", "đồ ăn"],
  open: ["open", "/ˈəʊ.pən/", "mở"], close: ["close", "/kləʊz/", "đóng"], faucet: ["faucet", "/ˈfɔː.sɪt/", "vòi nước"],
  dishes: ["the dishes", "/ðə ˈdɪʃ.ɪz/", "bát đĩa"], hands: ["hands", "/hændz/", "đôi tay"], sponge: ["sponge", "/spʌndʒ/", "miếng rửa bát"],
  rack: ["dish rack", "/ˈdɪʃ ræk/", "giá úp bát"], dry: ["dry", "/draɪ/", "lau khô"], plate: ["plate", "/pleɪt/", "cái đĩa"],
  towel: ["tea towel", "/ˈtiː ˌtaʊ.əl/", "khăn lau bát"], putaway: ["put away", "/pʊt əˈweɪ/", "cất đi"], cabinet: ["cabinet", "/ˈkæb.ɪ.nət/", "tủ bếp"],
  settable: ["set the table", "/set ðə ˈteɪ.bəl/", "bày bàn ăn"], table: ["table", "/ˈteɪ.bəl/", "cái bàn"], breakfast: ["breakfast", "/ˈbrek.fəst/", "bữa sáng"],
  have: ["have", "/hæv/", "ăn, dùng (bữa)"], clear: ["clear", "/klɪər/", "dọn đi"], getup: ["get up", "/ɡet ʌp/", "đứng dậy"], sit: ["sit", "/sɪt/", "ngồi"], at: ["at", "/æt/", "ở, tại"],
  toast: ["toast", "/təʊst/", "nướng; bánh mì nướng"], bread: ["bread", "/bred/", "bánh mì"], toaster: ["toaster", "/ˈtəʊ.stər/", "máy nướng bánh mì"],
  coffee: ["coffee", "/ˈkɒf.i/", "cà phê"], make: ["make", "/meɪk/", "làm, pha"], coffeemaker: ["coffee maker", "/ˈkɒf.i ˌmeɪ.kər/", "máy pha cà phê"],
  drink: ["drink", "/drɪŋk/", "uống"], trash: ["trash", "/træʃ/", "rác"], takeout: ["take out", "/teɪk aʊt/", "mang ra ngoài; lấy ra"],
  bin: ["bin", "/bɪn/", "thùng rác"], bag: ["bag", "/bæɡ/", "cái túi"], new: ["new", "/njuː/", "mới"], into: ["into", "/ˈɪn.tuː/", "vào trong"]
};
const ka = mkAct(KV);
const kOpenCab = W => W.k_cabinet === "closed" ? [["pose", "reach", 400], ["set", "k_cabinet", "open"], ["wait", 300]] : [];
const kOpenMw = W => W.k_micro !== "open" ? [["pose", "reach", 400], ["set", "k_micro", "open"], ["wait", 300]] : [];

const kitchenActions = [
  ka("turn_on_stove", "stove", "Turn on the stove", "Bật bếp", "I'm turning on the stove.", "Tôi đang bật bếp.", ["turning", "stove"], ["turnon", "stove"],
    "<b>turn on</b> = bật (máy móc, bếp, đèn). turn → turning.", ["I'm turning on", "the stove."], ["stove", "stone", "store"],
    ["I'm turning on the <b>oven</b>.", "I'm turning on the <b>light</b>."],
    W => W.k_stove === "on" ? "Bếp đang bật rồi." : null,
    W => [["walk", "k_stove"], ["pose", "reach", 450], ["set", "k_stove", "on"], ["pose", "idle", 1]],
    ["turn on the stove", "turn on the stove", "bật bếp"]),
  ka("fry_egg", "stove", "Fry an egg", "Rán trứng", "I'm frying an egg.", "Tôi đang rán một quả trứng.", ["frying", "egg"], ["fry", "egg", "pan"],
    "fry → frying: giữ nguyên <b>y</b> rồi thêm -ing. <b>an</b> egg vì egg bắt đầu bằng nguyên âm.", ["I'm frying", "an egg."], ["fry", "fly", "free"],
    ["I'm frying <b>some fish</b>.", "I'm frying <b>an onion</b>."],
    W => W.k_stove !== "on" ? "Hãy bật bếp trước (Turn on the stove)." : W.k_pan === "egg" ? "Trứng đã rán xong rồi." : null,
    W => [["walk", "k_stove"], ["spawn", "k_egg"], ["pose", "reach", 500], ["despawn"], ["set", "k_pan", "egg"], ["pose", "wipe", 1200], ["pose", "idle", 1]],
    ["fry an egg", "fry an egg in the hot pan", "rán một quả trứng"]),
  ka("turn_off_stove", "stove", "Turn off the stove", "Tắt bếp", "I'm turning off the stove.", "Tôi đang tắt bếp.", ["turning", "off", "stove"], ["turnoff", "stove"],
    "<b>turn off</b> = tắt. Ngược lại: <b>turn on</b> = bật.", ["I'm turning off", "the stove."], ["off", "of", "on"],
    ["I'm turning off the <b>tap</b>.", "Please turn off the <b>light</b>."],
    W => W.k_stove !== "on" ? "Bếp đang tắt rồi." : null,
    W => [["walk", "k_stove"], ["pose", "reach", 450], ["set", "k_stove", "off"], ["pose", "idle", 1]],
    ["turn off the stove", "turn off the stove safely", "tắt bếp"]),

  ka("fill_kettle", "kettle", "Fill the kettle", "Đổ nước vào ấm", "I'm filling the kettle with water.", "Tôi đang đổ nước vào ấm.", ["filling", "kettle", "water"], ["fill", "kettle", "water"],
    "<b>fill A with B</b> = đổ đầy B vào A. fill → filling.", ["I'm filling the kettle", "with water."], ["fill", "feel", "fall"],
    ["I'm filling the <b>bottle</b> with water.", "I'm filling the <b>glass</b> with juice."],
    W => W.k_kettle !== "empty" ? "Ấm đã có nước rồi." : null,
    W => [["walk", "k_kettle"], ["pose", "reach", 400], ["set", "k_kettle", "away"], ["spawn", "k_kettleP"], ["walk", "k_sink"], ["set", "k_faucet", "on"], ["pose", "reach", 1200], ["set", "k_faucet", "off"], ["walk", "k_kettle"], ["pose", "reach", 400], ["despawn"], ["set", "k_kettle", "full"], ["pose", "idle", 1]],
    ["fill the kettle with water", "fill the kettle with cold water", "đổ nước vào ấm"]),
  ka("boil_water", "kettle", "Boil some water", "Đun nước", "I'm boiling some water.", "Tôi đang đun nước.", ["boiling", "water"], ["boil", "water", "kettle"],
    "boil → boiling. <b>some water</b>: water không đếm được nên dùng some, không dùng a.", ["I'm boiling", "some water."], ["boil", "ball", "bowl"],
    ["I'm boiling <b>some eggs</b>.", "The water is <b>boiling</b>."],
    W => W.k_kettle === "empty" ? "Ấm chưa có nước. Hãy đổ nước vào ấm trước (Fill the kettle)." : W.k_kettle === "boiling" ? "Nước đang sôi rồi." : W.k_kettle === "hot" ? "Nước đã sôi rồi." : null,
    W => [["walk", "k_kettle"], ["pose", "point", 450], ["set", "k_kettle", "boiling"], ["pose", "idle", 1], ["wait", 1800], ["set", "k_kettle", "hot"]],
    ["boil some water", "boil some water in the kettle", "đun nước"]),
  ka("pour_hot_water", "kettle", "Pour the hot water", "Rót nước nóng", "I'm pouring hot water into a mug.", "Tôi đang rót nước nóng vào cốc.", ["pouring", "hot", "water", "mug"], ["pour", "hot", "water", "mug"],
    "<b>pour A into B</b> = rót A vào B. hot water = nước nóng (tính từ đứng trước danh từ).", ["I'm pouring hot water", "into a mug."], ["hot", "hat", "hut"],
    ["I'm pouring <b>milk</b> into a glass.", "I'm pouring <b>tea</b> into a cup."],
    W => W.k_kettle === "boiling" ? "Nước đang sôi, chờ một chút." : W.k_kettle !== "hot" ? "Nước chưa sôi. Hãy đun nước trước (Boil some water)." : null,
    W => [["walk", "k_kettle"], ["set", "k_kettle", "away"], ["spawn", "k_kettleP"], ["pose", "pour", 1100], ["despawn"], ["set", "k_kettle", "empty"], ["pose", "idle", 1]],
    ["pour the hot water into a mug", "carefully pour the hot water into a mug", "rót nước nóng vào cốc"]),

  ka("wash_rice", "ricecooker", "Wash the rice", "Vo gạo", "I'm washing the rice.", "Tôi đang vo gạo.", ["washing", "rice"], ["wash", "rice"],
    "Tiếng Anh nói <b>wash the rice</b> (rửa gạo) cho việc “vo gạo”.", ["I'm washing", "the rice."], ["rice", "rise", "race"],
    ["I'm washing <b>the vegetables</b>.", "I'm washing <b>my hands</b>."],
    W => W.k_rice === "washed" ? "Gạo đã vo rồi." : W.k_rice === "cooking" ? "Nồi cơm đang nấu." : W.k_rice === "done" ? "Cơm đã chín rồi." : null,
    W => [["walk", "k_rice"], ["spawn", "k_pot"], ["pose", "reach", 400], ["walk", "k_sink"], ["set", "k_faucet", "on"], ["pose", "wipe", 1400], ["set", "k_faucet", "off"], ["walk", "k_rice"], ["pose", "reach", 400], ["despawn"], ["set", "k_rice", "washed"], ["pose", "idle", 1]],
    ["wash the rice", "wash the rice in cold water", "vo gạo"]),
  ka("cook_rice", "ricecooker", "Cook the rice", "Nấu cơm", "I'm cooking rice in the rice cooker.", "Tôi đang nấu cơm bằng nồi cơm điện.", ["cooking", "rice", "rice cooker"], ["cook", "rice", "ricecooker"],
    "cook → cooking. Dùng <b>in</b> the rice cooker (nấu trong nồi), tiếng Việt nói “bằng nồi”.", ["I'm cooking rice", "in the rice cooker."], ["cook", "book", "cool"],
    ["I'm cooking <b>soup</b> in a pot.", "I'm cooking <b>dinner</b>."],
    W => W.k_rice === "cooking" ? "Nồi cơm đang nấu rồi." : W.k_rice === "done" ? "Cơm đã chín rồi." : W.k_rice !== "washed" ? "Hãy vo gạo trước (Wash the rice)." : null,
    W => [["walk", "k_rice"], ["pose", "point", 450], ["set", "k_rice", "cooking"], ["pose", "idle", 1], ["wait", 2000], ["set", "k_rice", "done"]],
    ["cook the rice", "cook the rice in the rice cooker", "nấu cơm"]),
  ka("serve_rice", "ricecooker", "Serve the rice", "Xới cơm ra bát", "I'm putting some rice in a bowl.", "Tôi đang xới cơm ra bát.", ["putting", "rice", "bowl"], ["rice", "bowl", "table"],
    "<b>put … in a bowl</b> = cho … vào bát. some rice: rice không đếm được.", ["I'm putting some rice", "in a bowl."], ["bowl", "ball", "bell"],
    ["I'm putting some <b>soup</b> in a bowl.", "I'm putting some <b>salad</b> on a plate."],
    W => W.k_rice === "cooking" ? "Cơm đang nấu, chờ một chút." : W.k_rice !== "done" ? "Cơm chưa nấu. Hãy nấu cơm trước (Cook the rice)." : null,
    W => [["walk", "k_rice"], ["spawn", "k_bowl"], ["pose", "reach", 700], ["set", "k_rice", "served"], ["walk", "k_table"], ["pose", "reach", 450], ["despawn"], ["set", "k_riceBowl", "table"], ["pose", "idle", 1]],
    ["put some rice in a bowl", "put some warm rice in a bowl", "xới cơm ra bát"]),

  ka("open_microwave", "microwave", "Open the microwave", "Mở lò vi sóng", "I'm opening the microwave.", "Tôi đang mở lò vi sóng.", ["opening", "microwave"], ["open", "microwave"],
    "open → opening: thêm -ing, không đổi gì.", ["I'm opening", "the microwave."], ["open", "oven", "often"],
    ["I'm opening the <b>oven</b>.", "I'm opening the <b>cabinet</b>."],
    W => W.k_micro === "open" ? "Lò vi sóng đang mở rồi." : W.k_micro === "running" ? "Lò đang chạy, chờ một chút." : null,
    W => [["walk", "k_micro"], ["pose", "reach", 450], ["set", "k_micro", "open"], ["pose", "idle", 1]],
    ["open the microwave", "open the microwave", "mở lò vi sóng"]),
  ka("heat_up_food", "microwave", "Heat up the food", "Hâm nóng đồ ăn", "I'm heating up the food in the microwave.", "Tôi đang hâm nóng đồ ăn bằng lò vi sóng.", ["heating", "up", "food", "microwave"], ["heatup", "food", "microwave"],
    "<b>heat up</b> = hâm nóng (cụm động từ). heat → heating up.", ["I'm heating up the food", "in the microwave."], ["heat", "hit", "hate"],
    ["I'm heating up <b>some soup</b>.", "I'm heating up <b>the milk</b>."],
    W => W.k_food === "hot" ? "Đồ ăn đã nóng rồi." : W.k_micro === "running" ? "Lò đang chạy rồi." : null,
    W => [["walk", "k_micro"], ...kOpenMw(W), ["spawn", "k_box"], ["pose", "reach", 500], ["despawn"], ["set", "k_food", "in"], ["pose", "reach", 350], ["set", "k_micro", "running"], ["pose", "point", 400], ["pose", "idle", 1], ["wait", 2000], ["set", "k_food", "hot"], ["set", "k_micro", "closed"]],
    ["heat up the food in the microwave", "heat up yesterday's food in the microwave", "hâm nóng đồ ăn bằng lò vi sóng"]),
  ka("close_microwave", "microwave", "Close the microwave", "Đóng lò vi sóng", "I'm closing the microwave door.", "Tôi đang đóng cửa lò vi sóng.", ["closing", "microwave", "door"], ["close", "microwave"],
    "close → closing: bỏ <b>e</b> rồi thêm -ing.", ["I'm closing", "the microwave door."], ["close", "clothes", "cloth"],
    ["I'm closing the <b>fridge</b>.", "I'm closing the <b>cabinet</b>."],
    W => W.k_micro !== "open" ? "Lò vi sóng đang đóng rồi." : null,
    W => [["walk", "k_micro"], ["pose", "reach", 450], ["set", "k_micro", "closed"], ["pose", "idle", 1]],
    ["close the microwave door", "close the microwave door", "đóng cửa lò vi sóng"]),

  ka("turn_on_faucet", "sink", "Turn on the faucet", "Mở vòi nước", "I'm turning on the faucet.", "Tôi đang mở vòi nước.", ["turning", "faucet"], ["turnon", "faucet", "water"],
    "Với vòi nước dùng <b>turn on</b> (mở) / <b>turn off</b> (khoá). Người Anh hay nói <b>tap</b>, người Mỹ nói <b>faucet</b>.", ["I'm turning on", "the faucet."], ["faucet", "forget", "facet"],
    ["I'm turning on the <b>tap</b>.", "I'm turning on the <b>water</b>."],
    W => W.k_faucet === "on" ? "Vòi nước đang mở rồi." : null,
    W => [["walk", "k_sink"], ["pose", "reach", 450], ["set", "k_faucet", "on"], ["pose", "idle", 1]],
    ["turn on the faucet", "turn on the faucet", "mở vòi nước"]),
  ka("wash_dishes", "sink", "Wash the dishes", "Rửa bát", "I'm washing the dishes.", "Tôi đang rửa bát đĩa.", ["washing", "dishes"], ["wash", "dishes", "sponge"],
    "<b>wash the dishes</b> = rửa bát (luôn dùng số nhiều dishes). wash → washing.", ["I'm washing", "the dishes."], ["dishes", "fishes", "wishes"],
    ["I'm washing <b>the cups</b>.", "I'm doing <b>the dishes</b>."],
    W => W.k_dishes !== "dirty" ? "Bát đĩa sạch rồi." : W.k_faucet !== "on" ? "Hãy mở vòi nước trước (Turn on the faucet)." : null,
    W => [["walk", "k_sink"], ["spawn", "k_sponge"], ["pose", "wipe", 2000], ["despawn"], ["set", "k_dishes", "clean"], ["pose", "idle", 1]],
    ["wash the dishes", "wash the dirty dishes", "rửa bát đĩa"]),
  ka("wash_hands", "sink", "Wash my hands", "Rửa tay", "I'm washing my hands.", "Tôi đang rửa tay.", ["washing", "hands"], ["wash", "hands", "water"],
    "Tiếng Anh dùng tính từ sở hữu: <b>my</b> hands (tay <b>của tôi</b>).", ["I'm washing", "my hands."], ["hands", "hens", "hams"],
    ["I'm washing <b>my face</b>.", "I'm washing <b>my hair</b>."],
    W => W.k_faucet !== "on" ? "Hãy mở vòi nước trước (Turn on the faucet)." : null,
    W => [["walk", "k_sink"], ["pose", "wipe", 1400], ["pose", "idle", 1]],
    ["wash my hands", "wash my hands with soap", "rửa tay"]),
  ka("turn_off_faucet", "sink", "Turn off the faucet", "Khoá vòi nước", "I'm turning off the faucet.", "Tôi đang khoá vòi nước.", ["turning", "off", "faucet"], ["turnoff", "faucet"],
    "<b>turn off</b> = tắt/khoá. Đừng để nước chảy phí nhé!", ["I'm turning off", "the faucet."], ["off", "of", "up"],
    ["I'm turning off the <b>tap</b>.", "I'm turning off the <b>stove</b>."],
    W => W.k_faucet !== "on" ? "Vòi nước đang khoá rồi." : null,
    W => [["walk", "k_sink"], ["pose", "reach", 450], ["set", "k_faucet", "off"], ["pose", "idle", 1]],
    ["turn off the faucet", "turn off the faucet", "khoá vòi nước"]),

  ka("put_dishes_in_rack", "dishrack", "Put the dishes in the rack", "Úp bát lên giá", "I'm putting the dishes in the dish rack.", "Tôi đang úp bát đĩa lên giá.", ["putting", "dishes", "dish rack"], ["dishes", "rack"],
    "<b>put … in …</b> = đặt vào trong. Giá úp bát là <b>dish rack</b>.", ["I'm putting the dishes", "in the dish rack."], ["rack", "rock", "back"],
    ["I'm putting the cups <b>in the cabinet</b>.", "I'm putting the spoons <b>in the drawer</b>."],
    W => W.k_dishes === "dirty" ? "Bát còn bẩn. Hãy rửa bát trước (Wash the dishes)." : W.k_dishes !== "clean" ? "Bát đĩa không còn trong bồn rửa." : null,
    W => [["walk", "k_sink"], ["pose", "reach", 400], ["spawn", "k_plate"], ["set", "k_dishes", "moving"], ["walk", "k_rack"], ["pose", "reach", 500], ["despawn"], ["set", "k_dishes", "wet"], ["pose", "idle", 1]],
    ["put the dishes in the dish rack", "put the clean dishes in the dish rack", "úp bát đĩa lên giá"]),
  ka("dry_plates", "dishrack", "Dry the plates", "Lau khô đĩa", "I'm drying the plates with a towel.", "Tôi đang lau khô đĩa bằng khăn.", ["drying", "plates", "towel"], ["dry", "plate", "towel"],
    "dry → drying: giữ <b>y</b>. <b>with a towel</b> = bằng khăn (with = bằng dụng cụ).", ["I'm drying the plates", "with a towel."], ["dry", "try", "cry"],
    ["I'm drying my hands <b>with a towel</b>.", "I'm drying <b>my hair</b>."],
    W => W.k_dishes !== "wet" ? (W.k_dishes === "dry" ? "Đĩa đã khô rồi." : "Chưa có đĩa ướt trên giá. (Wash the dishes → put them in the rack)") : null,
    W => [["walk", "k_rack"], ["spawn", "k_towel"], ["pose", "wipe", 1600], ["despawn"], ["set", "k_dishes", "dry"], ["pose", "idle", 1]],
    ["dry the plates with a towel", "dry the wet plates with a clean towel", "lau khô đĩa bằng khăn"]),

  ka("open_cabinet", "cabinet", "Open the cabinet", "Mở tủ bếp", "I'm opening the cabinet.", "Tôi đang mở tủ bếp.", ["opening", "cabinet"], ["open", "cabinet"],
    "cabinet = tủ có cánh (trong bếp). Mẫu câu: I'm opening + the + đồ vật.", ["I'm opening", "the cabinet."], ["cabinet", "cabin", "carpet"],
    ["I'm opening the <b>drawer</b>.", "I'm opening the <b>fridge</b>."],
    W => W.k_cabinet === "open" ? "Tủ bếp đang mở rồi." : null,
    W => [["walk", "k_cabinet"], ["pose", "reach", 450], ["set", "k_cabinet", "open"], ["pose", "idle", 1]],
    ["open the cabinet", "open the kitchen cabinet", "mở tủ bếp"]),
  ka("put_plates_away", "cabinet", "Put the plates away", "Cất đĩa vào tủ", "I'm putting the plates away in the cabinet.", "Tôi đang cất đĩa vào tủ bếp.", ["putting", "plates", "away", "cabinet"], ["putaway", "plate", "cabinet"],
    "<b>put away</b> = cất đi (về chỗ). Đồ vật có thể đứng giữa: put <b>the plates</b> away.", ["I'm putting the plates away", "in the cabinet."], ["away", "a way", "awake"],
    ["I'm putting <b>my clothes</b> away.", "I'm putting <b>the toys</b> away."],
    W => W.k_dishes === "away" ? "Đĩa đã cất rồi." : W.k_dishes === "wet" ? "Đĩa còn ướt. Hãy lau khô trước (Dry the plates)." : W.k_dishes !== "dry" ? "Hãy rửa và lau khô đĩa trước." : null,
    W => [["walk", "k_rack"], ["pose", "reach", 400], ["spawn", "k_plate"], ["set", "k_dishes", "away"], ["walk", "k_cabinet"], ...kOpenCab(W), ["pose", "reach", 600], ["despawn"], ["pose", "idle", 1]],
    ["put the plates away in the cabinet", "neatly put the plates away in the cabinet", "cất đĩa vào tủ bếp"]),
  ka("close_cabinet", "cabinet", "Close the cabinet", "Đóng tủ bếp", "I'm closing the cabinet.", "Tôi đang đóng tủ bếp.", ["closing", "cabinet"], ["close", "cabinet"],
    "close → closing: bỏ <b>e</b> rồi thêm -ing.", ["I'm closing", "the cabinet."], ["close", "clothes", "cloze"],
    ["I'm closing the <b>drawer</b>.", "I'm closing the <b>door</b>."],
    W => W.k_cabinet !== "open" ? "Tủ bếp đang đóng rồi." : null,
    W => [["walk", "k_cabinet"], ["pose", "reach", 450], ["set", "k_cabinet", "closed"], ["pose", "idle", 1]],
    ["close the cabinet", "gently close the cabinet", "đóng tủ bếp"]),

  ka("sit_at_the_table", "diningtable", "Sit at the table", "Ngồi vào bàn ăn", "I'm sitting at the table.", "Tôi đang ngồi vào bàn ăn.", ["sitting", "table"], ["sit", "table"],
    "sit → sitting: gấp đôi phụ âm <b>t</b> rồi thêm -ing. <b>at the table</b> = ngồi vào bàn ăn.", ["I'm sitting", "at the table."], ["sit", "set", "sat"],
    ["I'm sitting at the <b>dining table</b>.", "I'm sitting at <b>my desk</b>."],
    W => W.sitting ? "Bạn đang ngồi vào bàn ăn rồi." : null,
    W => [["walk", "k_seat"], ["sit"]],
    ["sit at the table", "sit down at the dining table", "ngồi vào bàn ăn"]),
  ka("set_the_table", "diningtable", "Set the table", "Bày bàn ăn", "I'm setting the table.", "Tôi đang bày bàn ăn.", ["setting", "table"], ["settable", "plate", "bowl"],
    "<b>set the table</b> = bày bát đĩa ra bàn. set → setting: gấp đôi <b>t</b>.", ["I'm setting", "the table."], ["set", "sit", "sat"],
    ["I'm setting the table <b>for dinner</b>.", "I'm <b>clearing</b> the table."],
    W => W.sitting ? "Hãy đứng dậy trước." : W.k_table === "set" ? "Bàn đã bày xong rồi." : null,
    W => [["walk", "k_cabinet"], ...kOpenCab(W), ["pose", "reach", 500], ["spawn", "k_plate"], ["walk", "k_table"], ["pose", "reach", 600], ["despawn"], ["set", "k_table", "set"], ["pose", "idle", 1]],
    ["set the table", "set the table for breakfast", "bày bàn ăn"]),
  ka("eat_breakfast", "diningtable", "Have breakfast", "Ăn sáng", "I'm having breakfast at the table.", "Tôi đang ăn sáng ở bàn.", ["having", "breakfast", "table"], ["have", "breakfast", "table"],
    "Ăn một bữa: <b>have</b> breakfast / lunch / dinner (không cần “the”). have → having: bỏ e.", ["I'm having breakfast", "at the table."], ["breakfast", "break", "fast"],
    ["I'm having <b>lunch</b>.", "I'm having <b>dinner</b> with my family."],
    W => W.k_table !== "set" ? "Hãy bày bàn ăn trước (Set the table)." : W.sitting && W.activity === "eating" ? "Bạn đang ăn rồi." : null,
    W => [...(W.sitting ? [] : [["walk", "k_seat"], ["sit"]]), ["activity", "eating"], ["pose", "drink", 900], ["pose", "idle", 1], ["wait", 600]],
    ["have breakfast at the table", "have a nice breakfast at the table", "ăn sáng ở bàn"], true),
  ka("get_up_from_table", "diningtable", "Get up from the table", "Đứng dậy khỏi bàn", "I'm getting up from the table.", "Tôi đang đứng dậy khỏi bàn ăn.", ["getting", "up", "table"], ["getup", "table"],
    "get → getting: gấp đôi <b>t</b>. <b>from</b> the table = rời khỏi bàn.", ["I'm getting up", "from the table."], ["up", "app", "cup"],
    ["I'm getting up <b>from the sofa</b>.", "I'm getting up <b>early</b>."],
    W => !W.sitting ? "Bạn đang đứng rồi. Hãy ngồi vào bàn ăn trước (Sit at the table)." : null,
    W => [["stand"], ["pose", "idle", 300]],
    ["get up from the table", "slowly get up from the table", "đứng dậy khỏi bàn"], true),
  ka("clear_the_table", "diningtable", "Clear the table", "Dọn bàn", "I'm clearing the table.", "Tôi đang dọn bàn ăn.", ["clearing", "table"], ["clear", "table", "dishes"],
    "<b>clear the table</b> = dọn bát đĩa khỏi bàn sau khi ăn. Ngược lại: set the table.", ["I'm clearing", "the table."], ["clear", "clean", "clever"],
    ["I'm clearing <b>my desk</b>.", "I'm <b>setting</b> the table."],
    W => W.sitting ? "Hãy đứng dậy trước." : W.k_table !== "set" && W.k_riceBowl !== "table" && W.k_toast !== "table" ? "Bàn trống rồi." : null,
    W => [["walk", "k_table"], ["pose", "reach", 500], ["spawn", "k_plate"], ["set", "k_table", "bare"], ["set", "k_riceBowl", "none"], ["set", "k_toast", "none"], ["walk", "k_sink"], ["pose", "reach", 450], ["despawn"], ["set", "k_dishes", "dirty"], ["pose", "idle", 1]],
    ["clear the table", "clear the table after breakfast", "dọn bàn ăn"]),

  ka("toast_bread", "toaster", "Toast some bread", "Nướng bánh mì", "I'm toasting some bread.", "Tôi đang nướng bánh mì.", ["toasting", "bread"], ["toast", "bread", "toaster"],
    "<b>toast</b> vừa là động từ (nướng bánh mì) vừa là danh từ (bánh mì nướng).", ["I'm toasting", "some bread."], ["bread", "bed", "breed"],
    ["I'm toasting <b>two slices</b> of bread.", "I'm eating <b>toast</b>."],
    W => W.k_toaster === "toasting" ? "Bánh đang nướng rồi." : W.k_toaster === "done" ? "Bánh đã nướng xong, hãy lấy ra (Take out the toast)." : null,
    W => [["walk", "k_toaster"], ["spawn", "k_bread"], ["pose", "reach", 500], ["despawn"], ["pose", "point", 350], ["set", "k_toaster", "toasting"], ["pose", "idle", 1], ["wait", 1800], ["set", "k_toaster", "done"]],
    ["toast some bread", "toast two slices of bread", "nướng bánh mì"]),
  ka("take_out_toast", "toaster", "Take out the toast", "Lấy bánh mì ra", "I'm taking the toast out of the toaster.", "Tôi đang lấy bánh mì nướng ra khỏi máy.", ["taking", "toast", "toaster"], ["takeout", "toast", "toaster"],
    "<b>take … out of …</b> = lấy … ra khỏi …", ["I'm taking the toast", "out of the toaster."], ["toast", "toes", "most"],
    ["I'm taking the milk <b>out of the fridge</b>.", "I'm taking a cake <b>out of the oven</b>."],
    W => W.k_toaster === "toasting" ? "Bánh đang nướng, chờ một chút." : W.k_toaster !== "done" ? "Chưa có bánh mì nướng. Hãy nướng bánh trước (Toast some bread)." : null,
    W => [["walk", "k_toaster"], ["pose", "reach", 500], ["spawn", "k_toast"], ["set", "k_toaster", "empty"], ["walk", "k_table"], ["pose", "reach", 450], ["despawn"], ["set", "k_toast", "table"], ["pose", "idle", 1]],
    ["take the toast out of the toaster", "take the warm toast out of the toaster", "lấy bánh mì nướng ra khỏi máy"]),

  ka("make_coffee", "coffeemaker", "Make coffee", "Pha cà phê", "I'm making coffee.", "Tôi đang pha cà phê.", ["making", "coffee"], ["make", "coffee", "coffeemaker"],
    "Pha đồ uống dùng <b>make</b>: make coffee / make tea. make → making: bỏ e.", ["I'm making", "coffee."], ["coffee", "copy", "toffee"],
    ["I'm making <b>tea</b>.", "I'm making <b>breakfast</b>."],
    W => W.k_coffee === "brewing" ? "Cà phê đang pha rồi." : W.k_coffee === "ready" ? "Cà phê pha xong rồi." : null,
    W => [["walk", "k_coffee"], ["pose", "reach", 450], ["pose", "point", 350], ["set", "k_coffee", "brewing"], ["pose", "idle", 1], ["wait", 2000], ["set", "k_coffee", "ready"]],
    ["make coffee", "make a fresh pot of coffee", "pha cà phê"]),
  ka("pour_coffee", "coffeemaker", "Pour the coffee", "Rót cà phê", "I'm pouring coffee into a mug.", "Tôi đang rót cà phê vào cốc.", ["pouring", "coffee", "mug"], ["pour", "coffee", "mug", "into"],
    "<b>mug</b> = cốc to có quai (uống cà phê, trà). pour → pouring.", ["I'm pouring coffee", "into a mug."], ["mug", "mud", "bug"],
    ["I'm pouring <b>tea</b> into a mug.", "I'm pouring <b>juice</b> into a glass."],
    W => W.k_coffee === "brewing" ? "Cà phê đang pha, chờ một chút." : W.k_coffee !== "ready" ? "Hãy pha cà phê trước (Make coffee)." : null,
    W => [["walk", "k_coffee"], ["pose", "reach", 400], ["pose", "pour", 1100], ["set", "k_coffee", "none"], ["set", "k_mug", "coffee"], ["pose", "idle", 1]],
    ["pour coffee into a mug", "pour hot coffee into a mug", "rót cà phê vào cốc"]),
  ka("drink_coffee", "coffeemaker", "Drink the coffee", "Uống cà phê", "I'm drinking my coffee.", "Tôi đang uống cà phê.", ["drinking", "coffee"], ["drink", "coffee", "mug"],
    "drink → drinking. <b>my</b> coffee = cà phê của tôi (tự nhiên hơn “the coffee”).", ["I'm drinking", "my coffee."], ["drink", "drank", "drunk"],
    ["I'm drinking <b>tea</b>.", "I'm drinking <b>a glass of water</b>."],
    W => W.k_mug !== "coffee" ? "Cốc chưa có cà phê. (Make coffee → Pour the coffee)" : null,
    W => [["walk", "k_coffee"], ["spawn", "k_mugFull"], ["set", "k_mug", "empty"], ["pose", "drink", 1400], ["despawn"], ["pose", "idle", 1]],
    ["drink my coffee", "slowly drink my hot coffee", "uống cà phê"]),

  ka("take_out_trash", "trashbin", "Take out the trash", "Đổ rác", "I'm taking out the trash.", "Tôi đang mang rác đi đổ.", ["taking", "out", "trash"], ["takeout", "trash", "bin"],
    "<b>take out the trash</b> (Mỹ) / take out the rubbish (Anh) = mang rác đi đổ.", ["I'm taking out", "the trash."], ["trash", "crash", "track"],
    ["I'm taking out <b>the recycling</b>.", "I'm taking <b>the dog</b> out."],
    W => W.sitting ? "Hãy đứng dậy trước." : W.k_trash !== "full" ? "Thùng rác trống rồi." : null,
    W => [["walk", "k_trash"], ["pose", "bend", 500], ["spawn", "k_bag"], ["set", "k_trash", "empty"], ["pose", "idle", 1], ["walk", "k_door"], ["wait", 400], ["despawn"], ["walk", "k_trash"], ["pose", "idle", 1]],
    ["take out the trash", "take out the full trash bag", "mang rác đi đổ"]),
  ka("put_in_new_bag", "trashbin", "Put in a new bag", "Thay túi rác mới", "I'm putting a new bag in the bin.", "Tôi đang lót túi mới vào thùng rác.", ["putting", "new", "bag", "bin"], ["new", "bag", "bin"],
    "<b>a new bag</b>: tính từ (new) đứng trước danh từ (bag).", ["I'm putting a new bag", "in the bin."], ["bag", "back", "big"],
    ["I'm putting a new <b>battery</b> in the clock.", "I'm putting <b>a book</b> in my bag."],
    W => W.k_trash === "full" ? "Hãy đổ rác trước (Take out the trash)." : W.k_trash === "ready" ? "Thùng rác đã có túi mới rồi." : null,
    W => [["walk", "k_trash"], ["pose", "bend", 900], ["set", "k_trash", "ready"], ["pose", "idle", 1]],
    ["put a new bag in the bin", "put a clean new bag in the bin", "lót túi mới vào thùng rác"])
];

const K_PROPS = {
  k_egg: `<ellipse cx="0" cy="-9" rx="7" ry="9" fill="#fbf3e4" stroke="#d9c6a6" stroke-width="1.2"/>`,
  k_kettleP: `<path d="M-12 0 L-10 -24 Q0 -32 10 -24 L12 0Z" fill="#5fa8a4"/><path d="M-8 -26 Q0 -40 8 -26" stroke="#3f7f7c" stroke-width="3" fill="none"/><path d="M-11 -14 L-20 -22" stroke="#5fa8a4" stroke-width="4" stroke-linecap="round"/>`,
  k_pot: `<path d="M-14 -18 L14 -18 L12 0 L-12 0Z" fill="#cfd6dc" stroke="#9aa6af" stroke-width="1.2"/><ellipse cx="0" cy="-18" rx="14" ry="3.5" fill="#f6f1e6"/>`,
  k_bowl: `<path d="M-14 -12 Q0 6 14 -12Z" fill="#f4f6f8" stroke="#8fb3cf" stroke-width="1.5"/><ellipse cx="0" cy="-13" rx="12" ry="5" fill="#fffdf6"/>`,
  k_box: `<rect x="-14" y="-16" width="28" height="16" rx="3" fill="#e9f3f7" stroke="#8fb3cf" stroke-width="1.5"/><rect x="-15" y="-19" width="30" height="5" rx="2" fill="#6fb3d9"/>`,
  k_sponge: `<rect x="-10" y="-9" width="20" height="9" rx="2" fill="#f5d34a"/><rect x="-10" y="-12" width="20" height="4" rx="1.5" fill="#5fae5a"/>`,
  k_plate: `<ellipse cx="0" cy="-4" rx="17" ry="4" fill="#fff" stroke="#c9d6df" stroke-width="1.5"/><ellipse cx="0" cy="-8" rx="17" ry="4" fill="#fff" stroke="#c9d6df" stroke-width="1.5"/>`,
  k_towel: `<rect x="-11" y="-20" width="22" height="20" rx="2" fill="#fff"/><rect x="-11" y="-16" width="22" height="3" fill="#e8743b"/><rect x="-11" y="-8" width="22" height="3" fill="#e8743b"/>`,
  k_bread: `<path d="M-9 0 L-9 -16 Q-9 -22 0 -22 Q9 -22 9 -16 L9 0Z" fill="#f3d9a4" stroke="#d1a35b" stroke-width="1.5"/>`,
  k_toast: `<path d="M-9 0 L-9 -16 Q-9 -22 0 -22 Q9 -22 9 -16 L9 0Z" fill="#c98a43" stroke="#8a5a2a" stroke-width="1.5"/>`,
  k_mugFull: `<path d="M-9 -20 L9 -20 L8 0 L-8 0Z" fill="#f4efe6" stroke="#c9b7a2" stroke-width="1.5"/><path d="M9 -16 q8 2 0 10" stroke="#c9b7a2" stroke-width="3" fill="none"/><rect x="-8" y="-18" width="16" height="3" fill="#6b4226"/>`,
  k_bag: `<path d="M-14 0 Q-18 -20 -6 -28 L-2 -36 L2 -36 L6 -28 Q18 -20 14 0Z" fill="#3b3f46"/><path d="M-3 -36 L0 -40 L3 -36" stroke="#3b3f46" stroke-width="3" fill="none"/>`
};

/* Left-wall helper: draws `inner` (local coords, x along the wall) skewed onto the receding left wall.
   The left wall's lines converge at (247.7,0); a=horizontal squash. */
const lw = (x0, y0, inner, a) => { a = a || 0.62; const b = -a * y0 / (247.7 - x0); return `<g transform="matrix(${a},${b.toFixed(3)},0,1,${x0},${y0})">${inner}</g>`; };
const D = (name, inner, base) => `<g data-detail="${name}"${base ? ` data-base="${base}"` : ""}>${inner}</g>`;

/* KITCHEN details (57, each a data-detail group): floor-tiles, baseboard, crown-molding, ceiling-beam, backsplash, wall-outlet, light-switch, left-window, cafe-curtains,
   herb-pots, window-sill-timer, notice-board, apron-hook, calendar, wall-clock, range-hood, wall-plates, hood-light,
   pendant-lights, spice-rack, hanging-pan, utensil-rail, microwave-shelf, kitchen-scale, under-cabinet-light, mug-hooks, paper-towel,
   open-shelves, canisters, cookbooks, oil-bottles, shelf-plant, countertop, lower-cabinets, drawers, cabinet-handles,
   towel-bar, bread-box, cutting-board, knife-block, fruit-bowl, broom, sink-mat, dining-rug, placemats,
   napkin-holder, salt-pepper, flower-vase, sponge-caddy, dish-soap, utensil-crock, oven-mitt, recycling-bin, floor-plant,
   cat-bowl, back-chair, dining-chair */
const kitchenShell = `
<defs>
 <linearGradient id="kWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ead6"/><stop offset="1" stop-color="#ecdcc1"/></linearGradient>
 <linearGradient id="kLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e0c7a3"/><stop offset="1" stop-color="#ead5b6"/></linearGradient>
 <linearGradient id="kFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3cfae"/><stop offset="1" stop-color="#cfb48c"/></linearGradient>
 <linearGradient id="kWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9a573"/><stop offset="1" stop-color="#bf8455"/></linearGradient>
 <linearGradient id="kTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efe7da"/><stop offset="1" stop-color="#d8cbb7"/></linearGradient>
 <linearGradient id="kChrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6ebef"/><stop offset=".5" stop-color="#fbfcfd"/><stop offset="1" stop-color="#c4cdd4"/></linearGradient>
 <linearGradient id="kTeal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#78bdb8"/><stop offset="1" stop-color="#4f9590"/></linearGradient>
 <radialGradient id="kLight" cx=".55" cy=".25" r=".75"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
 <radialGradient id="kFlameG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd36b"/><stop offset=".6" stop-color="#ff8a3c" stop-opacity=".8"/><stop offset="1" stop-color="#ff5a2a" stop-opacity="0"/></radialGradient>
 <radialGradient id="kPend" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff2c2" stop-opacity=".7"/><stop offset="1" stop-color="#fff2c2" stop-opacity="0"/></radialGradient>
 <filter id="kSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect x="120" y="0" width="880" height="330" fill="url(#kWall)"/>
<polygon points="0,0 120,0 120,330 0,640" fill="url(#kLeft)"/>
<polygon points="120,330 1000,330 1000,640 0,640" fill="url(#kFloor)"/>
${D("floor-tiles", `<g stroke="#a98a62" stroke-opacity=".28">
 <line x1="120" y1="330" x2="0" y2="640"/><line x1="290" y1="330" x2="210" y2="640"/><line x1="460" y1="330" x2="430" y2="640"/><line x1="630" y1="330" x2="650" y2="640"/><line x1="800" y1="330" x2="870" y2="640"/>
 <line x1="95" y1="390" x2="1000" y2="390"/><line x1="66" y1="465" x2="1000" y2="465"/><line x1="30" y1="555" x2="1000" y2="555"/></g>
 <g fill="#fff" opacity=".18"><polygon points="290,330 460,330 452,390 268,390"/><polygon points="630,465 800,465 840,555 650,555"/></g>`)}
${D("baseboard", `<rect x="120" y="318" width="880" height="12" fill="#c9a77c"/><polygon points="120,318 120,330 0,640 0,600" fill="#b9946a"/>`)}
${D("crown-molding", `<rect x="120" y="0" width="880" height="7" fill="#e6d2b2"/><rect x="120" y="7" width="880" height="3" fill="#d2b88f"/><polygon points="0,0 120,0 120,10 0,14" fill="#d2b88f"/>`)}
${D("ceiling-beam", `<rect x="120" y="0" width="880" height="2" fill="#a8784e" opacity=".5"/>`)}
${D("backsplash", `<rect x="140" y="156" width="850" height="82" fill="#e3ece8"/>
 <g stroke="#c7d6d0" stroke-width="1.5"><line x1="140" y1="183" x2="990" y2="183"/><line x1="140" y1="210" x2="990" y2="210"/>
 <path d="M180 156v82M220 156v82M260 156v82M300 156v82M340 156v82M380 156v82M420 156v82M460 156v82M500 156v82M540 156v82M580 156v82M620 156v82M660 156v82M700 156v82M740 156v82M780 156v82M820 156v82M860 156v82M900 156v82M940 156v82M980 156v82"/></g>
 <g fill="#9fc7c0" opacity=".55"><rect x="341" y="184" width="38" height="25"/><rect x="541" y="157" width="38" height="25"/><rect x="741" y="211" width="38" height="25"/><rect x="901" y="184" width="38" height="25"/></g>`)}
${D("wall-outlet", `<rect x="752" y="196" width="14" height="20" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><circle cx="759" cy="203" r="1.4" fill="#7a7166"/><circle cx="759" cy="210" r="1.4" fill="#7a7166"/><path d="M759 216 Q762 228 744 226" stroke="#3a3f46" stroke-width="2" fill="none"/>`)}
${D("light-switch", lw(96, 250, `<rect x="0" y="0" width="22" height="30" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><rect x="7" y="8" width="8" height="14" rx="2" fill="#e6ddd0"/>`))}
${D("left-window", lw(14, 64, `<rect x="0" y="0" width="140" height="170" rx="6" fill="#bfe3ff" stroke="#a8784e" stroke-width="9"/>
 <path d="M4 120 Q40 100 80 112 T136 108 L136 166 L4 166Z" fill="#9fd39a"/><circle cx="96" cy="44" r="14" fill="#fff3b0"/>
 <g class="k-cloud" fill="#fff" opacity=".9"><ellipse cx="40" cy="40" rx="18" ry="7"/><ellipse cx="52" cy="35" rx="10" ry="7"/></g>
 <line x1="70" y1="4" x2="70" y2="166" stroke="#a8784e" stroke-width="5"/><line x1="4" y1="84" x2="136" y2="84" stroke="#a8784e" stroke-width="4"/>`))}
${D("cafe-curtains", lw(14, 64, `<rect x="-6" y="94" width="152" height="5" rx="2" fill="#8a5432"/>
 <g class="k-sway"><path d="M0 98 L68 98 L66 150 Q50 156 34 150 Q18 156 2 150Z" fill="#f2b8a4"/><path d="M0 108 H68" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/></g>
 <g class="k-sway2"><path d="M72 98 L140 98 L138 150 Q122 156 106 150 Q90 156 74 150Z" fill="#f2b8a4"/><path d="M72 108 H140" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/></g>`))}
${D("herb-pots", lw(14, 64, `<rect x="-8" y="170" width="156" height="10" rx="3" fill="#c99668"/>
 <rect x="10" y="150" width="22" height="20" rx="3" fill="#c56b3c"/><ellipse cx="21" cy="146" rx="15" ry="10" fill="#5fae5a"/>
 <rect x="56" y="152" width="22" height="18" rx="3" fill="#e8c06a"/><path d="M60 152 q-6 -18 4 -22 M67 152 q0 -22 6 -26 M74 152 q8 -16 2 -22" stroke="#4c9a49" stroke-width="4" fill="none" stroke-linecap="round"/>
 <rect x="104" y="150" width="22" height="20" rx="3" fill="#7aa6c2"/><circle cx="110" cy="144" r="7" fill="#6fb36a"/><circle cx="120" cy="142" r="8" fill="#5fae5a"/>`))}
${D("window-sill-timer", lw(14, 64, `<g transform="translate(134,148)"><path d="M0 22 L0 6 Q0 0 7 0 Q14 0 14 6 L14 22Z" fill="#f5c45a"/><circle cx="7" cy="9" r="4" fill="#fffdf9"/><path d="M7 9 L7 6" stroke="#3a3f46" stroke-width="1.5"/></g>`))}
${D("notice-board", lw(20, 262, `<rect x="0" y="0" width="96" height="66" rx="4" fill="#d9a573" stroke="#a8784e" stroke-width="5"/>
 <rect x="10" y="8" width="26" height="22" fill="#fffbe6" transform="rotate(-6 23 19)"/><rect x="44" y="10" width="24" height="20" fill="#bfe3ff"/><rect x="18" y="36" width="30" height="20" fill="#ffd9cc" transform="rotate(5 33 46)"/><rect x="58" y="36" width="28" height="22" fill="#d7f0d0"/>
 <g><circle cx="23" cy="9" r="3.5" fill="#e8743b"/><circle cx="56" cy="11" r="3.5" fill="#5fae5a"/><circle cx="33" cy="37" r="3.5" fill="#7aa6c2"/><circle cx="72" cy="37" r="3.5" fill="#f5c45a"/></g>
 <path d="M48 16 h14 M48 21 h10 M62 44 h18 M62 49 h12" stroke="#7a7166" stroke-width="1.5"/>`))}
${D("apron-hook", `<rect x="58" y="326" width="40" height="5" rx="2.5" fill="#8a5432"/><circle cx="78" cy="333" r="3" fill="#5a361e"/><path d="M68 336 Q78 330 88 336 L90 350 L97 352 L95 360 L90 358 L91 398 Q78 404 65 398 L66 358 L61 360 L59 352 L66 350Z" fill="#e8743b"/><rect x="70" y="370" width="16" height="13" rx="2" fill="#f0884f" stroke="#c9602c"/><path d="M68 348 Q78 344 88 348" stroke="#fff" stroke-width="2" fill="none"/>`)}
${D("calendar", `<rect x="538" y="28" width="44" height="54" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><rect x="538" y="28" width="44" height="12" rx="3" fill="#e8743b"/>
 <circle cx="548" cy="28" r="2" fill="#5a636c"/><circle cx="572" cy="28" r="2" fill="#5a636c"/>
 <g fill="#c9b7a2"><rect x="543" y="46" width="6" height="5"/><rect x="552" y="46" width="6" height="5"/><rect x="561" y="46" width="6" height="5"/><rect x="570" y="46" width="6" height="5"/><rect x="543" y="55" width="6" height="5"/><rect x="552" y="55" width="6" height="5"/><rect x="570" y="55" width="6" height="5"/><rect x="543" y="64" width="6" height="5"/><rect x="552" y="64" width="6" height="5"/><rect x="561" y="64" width="6" height="5"/><rect x="570" y="64" width="6" height="5"/></g>
 <circle cx="564" cy="57.5" r="5" fill="none" stroke="#e8743b" stroke-width="1.6"/>`)}
${D("wall-clock", `<circle cx="932" cy="48" r="24" fill="#fffdf9" stroke="#7aa6c2" stroke-width="5"/><g fill="#a8784e"><circle cx="932" cy="30" r="1.8"/><circle cx="950" cy="48" r="1.8"/><circle cx="932" cy="66" r="1.8"/><circle cx="914" cy="48" r="1.8"/></g>
 <line class="k-hourH" x1="932" y1="48" x2="932" y2="36" stroke="#3a3f46" stroke-width="3" stroke-linecap="round"/><line class="k-minH" x1="932" y1="48" x2="944" y2="48" stroke="#3a3f46" stroke-width="2" stroke-linecap="round"/><circle cx="932" cy="48" r="2.5" fill="#e8743b"/>`)}
${D("range-hood", `<polygon points="430,70 490,70 528,148 392,148" fill="url(#kChrome)" stroke="#b8c2ca" stroke-width="2"/>
 <rect x="440" y="10" width="40" height="62" fill="url(#kChrome)" stroke="#b8c2ca" stroke-width="2"/>
 <rect x="392" y="146" width="136" height="8" rx="2" fill="#aeb8c0"/><g stroke="#aeb8c0" stroke-width="2"><line x1="436" y1="96" x2="484" y2="96"/><line x1="428" y1="108" x2="492" y2="108"/><line x1="420" y1="120" x2="500" y2="120"/></g>
 <g fill="#5a636c"><circle cx="502" cy="150" r="2"/><circle cx="510" cy="150" r="2"/></g>`)}
${D("wall-plates", `<circle cx="512" cy="30" r="13" fill="#fffdf9" stroke="#78bdb8" stroke-width="3"/><circle cx="512" cy="30" r="6" fill="none" stroke="#e8743b" stroke-width="2" stroke-dasharray="2 3"/><circle cx="516" cy="62" r="10" fill="#fffdf9" stroke="#e8743b" stroke-width="3"/><circle cx="516" cy="62" r="4" fill="#f5c45a"/>`)}
${D("hood-light", `<rect x="440" y="154" width="40" height="3" rx="1.5" fill="#fff2c2"/><polygon points="440,157 480,157 500,230 420,230" fill="#fff6d8" opacity=".25"/>`)}
${D("pendant-lights", `<g stroke="#5a636c" stroke-width="1.5"><line x1="618" y1="10" x2="618" y2="34"/><line x1="722" y1="10" x2="722" y2="34"/></g>
 <path d="M604 52 Q604 34 618 34 Q632 34 632 52Z" fill="#78bdb8"/><path d="M708 52 Q708 34 722 34 Q736 34 736 52Z" fill="#78bdb8"/>
 <g class="k-glow"><ellipse cx="618" cy="54" rx="9" ry="4" fill="#fff2c2"/><ellipse cx="722" cy="54" rx="9" ry="4" fill="#fff2c2"/><ellipse cx="618" cy="62" rx="22" ry="12" fill="url(#kPend)"/><ellipse cx="722" cy="62" rx="22" ry="12" fill="url(#kPend)"/></g>`)}
${D("spice-rack", `<rect x="538" y="100" width="52" height="5" rx="2" fill="#a8693e"/><rect x="538" y="128" width="52" height="5" rx="2" fill="#a8693e"/><rect x="538" y="100" width="3" height="33" fill="#8a5432"/><rect x="587" y="100" width="3" height="33" fill="#8a5432"/>
 <g><rect x="544" y="87" width="9" height="13" rx="2" fill="#c0392b" opacity=".8"/><rect x="556" y="89" width="9" height="11" rx="2" fill="#f5c45a"/><rect x="568" y="86" width="9" height="14" rx="2" fill="#5fae5a"/><rect x="579" y="89" width="7" height="11" rx="2" fill="#a8693e"/>
 <rect x="544" y="115" width="9" height="13" rx="2" fill="#e8743b"/><rect x="556" y="117" width="9" height="11" rx="2" fill="#fffdf9" stroke="#c9b7a2"/><rect x="568" y="114" width="9" height="14" rx="2" fill="#6b4226"/><rect x="579" y="117" width="7" height="11" rx="2" fill="#7aa6c2"/></g>
 <g fill="#3a3f46"><rect x="544" y="85" width="9" height="3" rx="1"/><rect x="556" y="87" width="9" height="3" rx="1"/><rect x="568" y="84" width="9" height="3" rx="1"/><rect x="544" y="113" width="9" height="3" rx="1"/><rect x="568" y="112" width="9" height="3" rx="1"/></g>`)}
${D("hanging-pan", `<circle cx="372" cy="60" r="3" fill="#5a636c"/><rect x="369" y="62" width="6" height="40" rx="3" fill="#3a3f46"/><circle cx="372" cy="118" r="18" fill="#4a4f57"/><circle cx="372" cy="118" r="13" fill="#5f666e"/><path d="M364 112 q6 -4 12 0" stroke="#7d858d" stroke-width="2" fill="none"/>`)}
${D("utensil-rail", `<rect x="758" y="58" width="96" height="4" rx="2" fill="#8a8f96"/><g fill="#5a636c"><circle cx="758" cy="60" r="3"/><circle cx="854" cy="60" r="3"/></g>
 <g stroke="#7a4a2a" stroke-width="3" stroke-linecap="round"><line x1="772" y1="62" x2="772" y2="90"/><line x1="794" y1="62" x2="794" y2="94"/><line x1="816" y1="62" x2="816" y2="88"/><line x1="838" y1="62" x2="838" y2="90"/></g>
 <ellipse cx="772" cy="96" rx="6" ry="7" fill="#a8693e"/><rect x="788" y="92" width="12" height="12" rx="2" fill="#a8693e"/><path d="M810 88 h12 v8 h-12z" fill="#9aa6af"/>
 <path d="M838 90 q-7 10 0 16 q7 -6 0 -16z" fill="none" stroke="#9aa6af" stroke-width="2"/>`)}
${D("microwave-shelf", `<rect x="590" y="170" width="160" height="8" rx="2" fill="#a8693e"/><path d="M604 178 l0 12 l12 -12Z M736 178 l0 12 l-12 -12Z" fill="#8a5432"/>`)}
${D("kitchen-scale", `<rect x="700" y="96" width="34" height="12" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><rect x="704" y="91" width="26" height="5" rx="2" fill="#dfe4e8"/><rect x="712" y="100" width="12" height="5" rx="1" fill="#2f3a2f"/>`)}
${D("under-cabinet-light", `<rect x="148" y="154" width="194" height="3" rx="1.5" fill="#fff2c2"/><polygon points="150,157 340,157 352,200 140,200" fill="#fff6d8" opacity=".22"/>`)}
${D("mug-hooks", `<rect x="292" y="156" width="52" height="3" fill="#8a5432"/><g stroke="#5a636c" stroke-width="1.5" fill="none"><path d="M300 159 v4 q0 3 3 3"/><path d="M317 159 v4 q0 3 3 3"/><path d="M334 159 v4 q0 3 3 3"/></g>
 <g><rect x="296" y="166" width="12" height="11" rx="2" fill="#e8743b"/><rect x="313" y="166" width="12" height="11" rx="2" fill="#78bdb8"/><rect x="330" y="166" width="12" height="11" rx="2" fill="#f5c45a"/></g>`)}
${D("paper-towel", `<rect x="98" y="168" width="20" height="3" fill="#8a8f96"/><rect x="100" y="171" width="16" height="34" rx="4" fill="#fffdf9" stroke="#d6c8b3"/><path d="M103 205 L103 216 L113 214 L113 205" fill="#fffdf9" stroke="#d6c8b3"/><path d="M102 180 h12 M102 192 h12" stroke="#9fc7c0" stroke-width="1.5"/>`)}
${D("open-shelves", `<rect x="876" y="116" width="114" height="6" rx="2" fill="#a8693e"/><rect x="876" y="178" width="114" height="6" rx="2" fill="#a8693e"/><path d="M886 122 l0 10 l10 -10Z M980 122 l0 10 l-10 -10Z M886 184 l0 10 l10 -10Z M980 184 l0 10 l-10 -10Z" fill="#8a5432"/>`)}
${D("canisters", `<rect x="882" y="88" width="22" height="28" rx="4" fill="#fffdf9" stroke="#c9b7a2"/><rect x="880" y="84" width="26" height="6" rx="3" fill="#78bdb8"/><rect x="908" y="94" width="20" height="22" rx="4" fill="#fffdf9" stroke="#c9b7a2"/><rect x="906" y="90" width="24" height="6" rx="3" fill="#e8743b"/>
 <rect x="886" y="100" width="14" height="8" rx="1" fill="#f6ead6"/><rect x="911" y="104" width="14" height="6" rx="1" fill="#f6ead6"/>`)}
${D("cookbooks", `<rect x="936" y="88" width="8" height="28" fill="#c0392b" opacity=".85"/><rect x="944" y="92" width="7" height="24" fill="#5fae5a"/><rect x="951" y="86" width="9" height="30" fill="#7aa6c2"/><rect x="960" y="94" width="8" height="22" fill="#f5c45a" transform="rotate(12 964 116)"/>`)}
${D("oil-bottles", `<path d="M884 178 L884 160 Q884 154 889 152 L889 144 L895 144 L895 152 Q900 154 900 160 L900 178Z" fill="#d9c25a" opacity=".85"/><rect x="888" y="140" width="8" height="5" fill="#5a3d1f"/>
 <path d="M906 178 L906 158 L910 152 L910 146 L916 146 L916 152 L920 158 L920 178Z" fill="#8c3b2a" opacity=".8"/><rect x="908" y="164" width="10" height="8" fill="#fffbe6"/>`)}
${D("shelf-plant", `<rect x="954" y="160" width="20" height="18" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><path d="M958 160 q-14 8 -10 26 M964 160 q4 -14 -2 -20 M970 160 q12 6 8 24" stroke="#5fae5a" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="964" cy="152" rx="10" ry="7" fill="#6fb36a"/>`)}
${D("countertop", `<ellipse cx="560" cy="362" rx="440" ry="9" fill="#000" opacity=".13" filter="url(#kSoft)"/><rect x="140" y="248" width="850" height="112" fill="#f1e9dc"/><rect x="134" y="234" width="862" height="16" rx="4" fill="url(#kTop)" stroke="#cbbca6"/><rect x="140" y="350" width="850" height="10" fill="#d9ccb8"/>`)}
${D("lower-cabinets", `<g fill="#f7f1e7" stroke="#d6c8b3" stroke-width="1.5"><rect x="150" y="260" width="110" height="88" rx="4"/><rect x="268" y="260" width="110" height="88" rx="4"/>
 <rect x="644" y="260" width="96" height="88" rx="4"/><rect x="748" y="260" width="104" height="88" rx="4"/><rect x="862" y="260" width="120" height="88" rx="4"/></g>
 <g fill="none" stroke="#e6dccb" stroke-width="1.5"><rect x="160" y="270" width="90" height="68" rx="3"/><rect x="278" y="270" width="90" height="68" rx="3"/><rect x="654" y="270" width="76" height="68" rx="3"/><rect x="758" y="270" width="84" height="68" rx="3"/><rect x="872" y="270" width="100" height="68" rx="3"/></g>`)}
${D("drawers", `<g fill="#f7f1e7" stroke="#d6c8b3" stroke-width="1.5"><rect x="540" y="260" width="96" height="40" rx="4"/><rect x="540" y="306" width="96" height="42" rx="4"/></g>`)}
${D("cabinet-handles", `<g fill="#a8784e"><rect x="244" y="290" width="4" height="22" rx="2"/><rect x="280" y="290" width="4" height="22" rx="2"/><rect x="572" y="278" width="32" height="4" rx="2"/><rect x="572" y="325" width="32" height="4" rx="2"/><rect x="726" y="290" width="4" height="22" rx="2"/><rect x="760" y="290" width="4" height="22" rx="2"/><rect x="906" y="282" width="32" height="4" rx="2"/></g>`)}
${D("towel-bar", `<rect x="160" y="284" width="70" height="4" rx="2" fill="#9aa6af"/><path d="M174 288 L216 288 L214 326 L176 326Z" fill="#fffdf9" stroke="#e2d4c0"/><g fill="#78bdb8"><rect x="176" y="300" width="38" height="4"/><rect x="176" y="312" width="38" height="4"/></g>`)}
${D("bread-box", `<path d="M870 248 L870 218 Q870 204 888 204 L904 204 Q918 204 918 218 L918 248Z" fill="#78bdb8"/><path d="M874 222 Q894 212 914 222" stroke="#4f9590" stroke-width="2" fill="none"/><rect x="886" y="226" width="16" height="4" rx="2" fill="#fffdf9"/><text x="894" y="242" text-anchor="middle" font-size="7" font-family="system-ui" font-weight="700" fill="#fffdf9">BREAD</text>`)}
${D("cutting-board", `<rect x="928" y="196" width="30" height="40" rx="6" fill="#d9a573" stroke="#a8784e" transform="rotate(-6 943 236)"/><circle cx="941" cy="203" r="3" fill="#e3ece8"/><path d="M928 230 L956 226" stroke="#c09060" stroke-width="2"/>`)}
${D("knife-block", `<g transform="translate(-14 0)"><path d="M948 248 L952 222 L968 222 L972 248Z" fill="#7a4a2a"/><g fill="#3a3f46"><rect x="952" y="212" width="4" height="11" rx="1.5"/><rect x="958" y="210" width="4" height="13" rx="1.5"/><rect x="964" y="213" width="4" height="10" rx="1.5"/></g></g>`)}
${D("fruit-bowl", `<g transform="translate(-8 0)"><circle cx="972" cy="234" r="6" fill="#e74c3c"/><circle cx="982" cy="233" r="6" fill="#f5a623"/><path d="M970 230 q8 -10 16 -4" stroke="#f5d34a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M964 236 Q977 252 990 236Z" fill="#fffdf9" stroke="#c9b7a2"/></g>`)}
${D("broom", `<g transform="rotate(-12 112 400)"><rect x="110" y="250" width="5" height="120" rx="2" fill="#c98f5e"/><path d="M100 368 L126 368 L132 404 L94 404Z" fill="#e8c06a"/><path d="M100 380 H126" stroke="#c99a3a" stroke-width="2"/></g>`)}
${D("sink-mat", `<rect x="170" y="408" width="200" height="40" rx="18" fill="#9fc7c0" opacity=".85"/><rect x="180" y="414" width="180" height="28" rx="13" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-dasharray="6 6"/>`)}
${D("dining-rug", `<ellipse cx="745" cy="560" rx="170" ry="42" fill="#e9b7a0" opacity=".55"/><ellipse cx="745" cy="560" rx="150" ry="32" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="4 7"/>`)}
<rect x="120" y="0" width="880" height="330" fill="url(#kLight)" pointer-events="none"/>
`;

/* world-level decor: depth-sorted, never clickable */
const kitchenDecor = [
  D("sponge-caddy", `<rect x="146" y="226" width="22" height="12" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><rect x="149" y="220" width="16" height="7" rx="2" fill="#f5d34a"/><rect x="149" y="217" width="16" height="4" rx="1.5" fill="#5fae5a"/>`, 360),
  D("dish-soap", `<rect x="278" y="216" width="12" height="22" rx="3" fill="#7fc6a4"/><rect x="281" y="209" width="6" height="8" fill="#4c9a49"/><path d="M287 210 h4" stroke="#4c9a49" stroke-width="2"/><rect x="280" y="224" width="8" height="6" rx="1" fill="#fffdf9" opacity=".7"/>`, 361.5),
  D("utensil-crock", `<rect x="372" y="218" width="16" height="20" rx="3" fill="#e8743b"/><g stroke="#7a4a2a" stroke-width="2.5" stroke-linecap="round"><line x1="376" y1="218" x2="372" y2="200"/><line x1="380" y1="218" x2="381" y2="196"/><line x1="384" y1="218" x2="390" y2="202"/></g><ellipse cx="372" cy="198" rx="3.5" ry="4.5" fill="#a8693e"/><rect x="378" y="190" width="6" height="7" rx="1.5" fill="#a8693e"/>`, 362.5),
  D("oven-mitt", `<path d="M490 268 L506 268 L508 296 Q508 306 498 306 Q486 306 486 296 L486 284 Q480 282 482 276 Q486 272 488 278Z" fill="#e79a86" stroke="#c9705d"/><rect x="487" y="266" width="20" height="5" rx="2" fill="#fffdf9"/>`, 363.5),
  D("recycling-bin", `<ellipse cx="102" cy="486" rx="24" ry="5" fill="#000" opacity=".16" filter="url(#kSoft)"/><path d="M80 438 L124 438 L120 484 L84 484Z" fill="#5fae5a"/><rect x="78" y="432" width="48" height="8" rx="3" fill="#4c9a49"/><path d="M96 452 l6 -8 l6 8 M110 462 l-4 9 l-9 0 M92 466 l-3 -6" stroke="#fffdf9" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="88" y="424" width="12" height="10" rx="2" fill="#7aa6c2" transform="rotate(-12 94 430)"/>`, 486),
  D("floor-plant", `<ellipse cx="46" cy="628" rx="30" ry="6" fill="#000" opacity=".18" filter="url(#kSoft)"/><path d="M26 586 L66 586 L60 628 L32 628Z" fill="#c56b3c"/><rect x="24" y="582" width="44" height="8" rx="3" fill="#a8562c"/>
   <g fill="#5fae5a"><path d="M46 584 Q20 560 18 520 Q40 540 46 584Z"/><path d="M46 584 Q74 556 78 512 Q54 538 46 584Z" fill="#4c9a49"/><path d="M46 584 Q42 540 52 500 Q62 540 46 584Z" fill="#6fb36a"/><path d="M46 584 Q10 580 4 556 Q30 560 46 584Z" fill="#4c9a49"/></g>`, 628),
  D("cat-bowl", `<ellipse cx="905" cy="404" rx="18" ry="5" fill="#000" opacity=".14"/><path d="M887 398 L923 398 L919 406 L891 406Z" fill="#e79a86"/><ellipse cx="905" cy="398" rx="18" ry="4" fill="#c9705d"/><g fill="#a8693e"><circle cx="900" cy="397" r="2"/><circle cx="906" cy="396" r="2"/><circle cx="911" cy="398" r="2"/></g><path d="M898 402 q3 -3 6 0 q3 -3 6 0" stroke="#fffdf9" stroke-width="1.5" fill="none"/>`, 406),
  D("back-chair", `<g fill="#a8693e"><rect x="726" y="420" width="8" height="66" rx="2"/><rect x="782" y="420" width="8" height="66" rx="2"/></g><rect x="722" y="418" width="72" height="12" rx="5" fill="#c98a55"/><rect x="732" y="438" width="52" height="7" rx="3" fill="#c98a55"/><rect x="732" y="452" width="52" height="7" rx="3" fill="#c98a55"/>`, 474),
  D("dining-chair", `<ellipse cx="590" cy="552" rx="30" ry="6" fill="#000" opacity=".16" filter="url(#kSoft)"/><g stroke="#7a4a2a" stroke-width="5" stroke-linecap="round"><line x1="570" y1="516" x2="566" y2="550"/><line x1="610" y1="516" x2="614" y2="550"/><line x1="590" y1="518" x2="590" y2="546"/></g>
   <rect x="562" y="452" width="8" height="62" rx="3" fill="#a8693e"/><rect x="558" y="450" width="16" height="10" rx="4" fill="#c98a55"/><rect x="562" y="472" width="8" height="24" rx="3" fill="#c98a55"/>
   <ellipse cx="590" cy="512" rx="28" ry="8" fill="#c98a55"/><ellipse cx="590" cy="509" rx="24" ry="6" fill="#e8743b"/><ellipse cx="590" cy="508" rx="16" ry="3" fill="#f0884f"/>`, 548)
];

const kitchenWorld = [
  objG("cabinet", "cabinet", "tủ bếp", 300, 245, 26, `
   <rect x="140" y="36" width="210" height="118" rx="6" fill="#b47a4c"/>
   <rect x="148" y="44" width="194" height="102" rx="3" fill="#f6efe4"/>
   <rect x="148" y="94" width="194" height="4" fill="#d9c7ae"/>
   <g class="k-cabPlates"><ellipse cx="185" cy="90" rx="22" ry="4" fill="#fff" stroke="#c9d6df"/><ellipse cx="185" cy="85" rx="22" ry="4" fill="#fff" stroke="#c9d6df"/><ellipse cx="185" cy="80" rx="22" ry="4" fill="#fff" stroke="#c9d6df"/></g>
   <g fill="#f4f6f8" stroke="#8fb3cf"><path d="M262 92 q14 -2 28 0 q-2 -14 -14 -14 q-12 0 -14 14z"/><path d="M296 92 q14 -2 28 0 q-2 -14 -14 -14 q-12 0 -14 14z"/></g>
   <g fill="#fffdf9" stroke="#c9b7a2"><path d="M170 144 h14 l-2 -18 h-10z"/><path d="M196 144 h14 l-2 -18 h-10z"/></g>
   <g fill="#e8743b" opacity=".85"><rect x="264" y="118" width="16" height="26" rx="3"/><rect x="288" y="124" width="14" height="20" rx="3" fill="#f5c45a"/><rect x="310" y="114" width="18" height="30" rx="3" fill="#7aa6c2"/></g>
   <g class="k-doorL"><rect x="146" y="42" width="98" height="106" rx="4" fill="url(#kWood)" stroke="#a8784e" stroke-width="2"/><rect x="156" y="52" width="78" height="86" rx="3" fill="none" stroke="#a8784e" stroke-opacity=".5" stroke-width="2"/><circle cx="234" cy="96" r="3.5" fill="#7a4a2a"/></g>
   <g class="k-doorR"><rect x="246" y="42" width="98" height="106" rx="4" fill="url(#kWood)" stroke="#a8784e" stroke-width="2"/><rect x="256" y="52" width="78" height="86" rx="3" fill="none" stroke="#a8784e" stroke-opacity=".5" stroke-width="2"/><circle cx="256" cy="96" r="3.5" fill="#7a4a2a"/></g>`),
  objG("microwave", "microwave", "lò vi sóng", 301, 670, 98, `
   <ellipse cx="670" cy="171" rx="70" ry="4" fill="#000" opacity=".15" filter="url(#kSoft)"/>
   <rect x="600" y="108" width="140" height="62" rx="7" fill="#eef0f2" stroke="#b8c2ca" stroke-width="2"/>
   <rect x="608" y="115" width="84" height="48" rx="4" fill="#3b4148"/>
   <rect class="k-mwLight" x="610" y="117" width="80" height="44" rx="3" fill="#ffe9a8"/>
   <g class="k-mwFood"><ellipse cx="650" cy="155" rx="22" ry="4" fill="#fff"/><rect x="636" y="143" width="28" height="12" rx="3" fill="#e9f3f7" stroke="#8fb3cf"/><rect x="635" y="140" width="30" height="4" rx="2" fill="#6fb3d9"/></g>
   <g class="k-mwSteam"><path d="M644 136 q-4 -6 0 -12 M656 136 q-4 -6 0 -12" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>
   <g class="k-mwDoor"><rect x="604" y="112" width="92" height="54" rx="5" fill="#cfd8de" fill-opacity=".35" stroke="#9aa6af" stroke-width="2"/><rect x="688" y="126" width="4" height="26" rx="2" fill="#8a949c"/></g>
   <rect x="700" y="116" width="34" height="46" rx="3" fill="#dfe4e8"/><rect x="704" y="120" width="26" height="9" rx="2" fill="#2f3a2f"/><text class="k-mwTime" x="717" y="128" text-anchor="middle" font-size="8" font-family="monospace" fill="#8fe28f">0:30</text>
   <g fill="#9aa6af"><circle cx="710" cy="138" r="2.5"/><circle cx="724" cy="138" r="2.5"/><circle cx="710" cy="147" r="2.5"/><circle cx="724" cy="147" r="2.5"/></g><rect x="704" y="153" width="26" height="6" rx="3" fill="#7fb2dc"/>`),
  objG("sink", "sink", "bồn rửa", 361, 215, 182, `
   <rect class="hit" x="168" y="190" width="116" height="56"/>
   <ellipse cx="225" cy="241" rx="50" ry="7" fill="#9fb3bf"/><ellipse cx="225" cy="242" rx="44" ry="5" fill="#7d93a1"/>
   <g class="k-sinkDishes"><ellipse cx="208" cy="234" rx="18" ry="5" fill="#fff" stroke="#c9d6df" transform="rotate(-18 208 234)"/><ellipse cx="236" cy="232" rx="16" ry="6" fill="#fff" stroke="#c9d6df" transform="rotate(14 236 232)"/>
    <path d="M244 238 q8 -14 16 0z" fill="#f4f6f8" stroke="#8fb3cf"/>
    <g class="k-dirt" fill="#a6773f"><circle cx="203" cy="232" r="2"/><circle cx="214" cy="236" r="1.6"/><circle cx="238" cy="230" r="2"/><circle cx="252" cy="234" r="1.5"/></g>
    <g class="k-bubbles" fill="#fff" stroke="#bcd8ea"><circle cx="220" cy="228" r="4"/><circle cx="228" cy="224" r="3"/><circle cx="246" cy="226" r="3.5"/><circle cx="212" cy="224" r="2.5"/></g></g>
   <path d="M258 241 L258 206 Q258 194 246 194 L238 194 Q232 194 232 200 L232 206" stroke="url(#kChrome)" stroke-width="7" fill="none" stroke-linecap="round"/>
   <path d="M258 241 L258 206 Q258 194 246 194 L238 194 Q232 194 232 200 L232 206" stroke="#9aa6af" stroke-width="1.5" fill="none"/>
   <rect x="264" y="222" width="12" height="5" rx="2" fill="#aeb8c0"/>
   <rect class="k-water" x="229.5" y="207" width="5" height="32" rx="2.5" fill="#8ccbf0" opacity=".85"/>
   `),
  objG("dishrack", "dish rack", "giá úp bát", 362, 318, 266, `
   <rect class="hit" x="296" y="190" width="80" height="54"/>
   <ellipse cx="336" cy="240" rx="40" ry="4" fill="#000" opacity=".12"/>
   <g class="k-rackPlates"><ellipse cx="318" cy="216" rx="5" ry="20" fill="#fff" stroke="#c9d6df" stroke-width="1.5"/><ellipse cx="330" cy="216" rx="5" ry="20" fill="#fff" stroke="#c9d6df" stroke-width="1.5"/><ellipse cx="342" cy="216" rx="5" ry="20" fill="#fff" stroke="#c9d6df" stroke-width="1.5"/>
    <path d="M350 228 q10 -14 20 0z" fill="#f4f6f8" stroke="#8fb3cf"/>
    <g class="k-drops" fill="#6fb3d9"><path d="M316 238 q2 4 0 6 q-2 -2 0 -6z"/><path d="M340 240 q2 4 0 6 q-2 -2 0 -6z"/><circle cx="356" cy="236" r="1.6"/></g></g>
   <g stroke="#9aa6af" stroke-width="2" fill="none"><rect x="302" y="216" width="70" height="22" rx="3"/><path d="M310 216v22M322 216v22M334 216v22M346 216v22M358 216v22"/></g>
   <path d="M302 238 l-2 4 M372 238 l2 4" stroke="#9aa6af" stroke-width="2"/>`),
  objG("stove", "stove", "bếp nấu", 363, 460, 190, `
   <rect class="hit" x="388" y="196" width="144" height="160"/>
   <rect x="392" y="256" width="136" height="96" rx="4" fill="#e7e2da" stroke="#c4b9a8"/>
   <rect x="402" y="278" width="116" height="60" rx="4" fill="#3b4148"/><rect x="408" y="284" width="104" height="10" rx="2" fill="#5a636c" opacity=".7"/>
   <rect x="410" y="268" width="100" height="4" rx="2" fill="#aeb8c0"/>
   <g fill="#5a636c"><circle cx="410" cy="262" r="3"/><circle cx="510" cy="262" r="3"/></g>
   <rect x="390" y="228" width="140" height="12" rx="3" fill="#3a3f46"/>
   <g fill="none" stroke="#6b737b" stroke-width="2"><ellipse cx="425" cy="232" rx="22" ry="4.5"/><ellipse cx="495" cy="232" rx="22" ry="4.5"/></g>
   <g class="k-flame"><ellipse cx="425" cy="230" rx="30" ry="9" fill="url(#kFlameG)"/><ellipse cx="495" cy="230" rx="30" ry="9" fill="url(#kFlameG)"/></g>
   <ellipse cx="495" cy="224" rx="18" ry="5" fill="#9aa6af"/><path d="M477 224 L479 210 L511 210 L513 224Z" fill="#b8c2ca"/><ellipse cx="495" cy="210" rx="16" ry="4" fill="#d5dde3"/><rect x="491" y="203" width="8" height="5" rx="2" fill="#5a636c"/>
   <path d="M401 222 L377 216" stroke="#3a3f46" stroke-width="5" stroke-linecap="round"/>
   <ellipse cx="425" cy="224" rx="26" ry="6" fill="#4a4f57"/><ellipse cx="425" cy="222" rx="22" ry="4.5" fill="#5f666e"/>
   <g class="k-egg"><ellipse cx="425" cy="221" rx="13" ry="3.6" fill="#fffaf0"/><ellipse cx="427" cy="220" rx="4.5" ry="2.4" fill="#f6b52e"/></g>
   <g class="k-sizzle"><path d="M412 212 q-3 -6 0 -10 M438 212 q-3 -6 0 -10" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g>`),
  objG("kettle", "kettle", "ấm đun nước", 364, 545, 160, `
   <rect class="hit" x="540" y="184" width="50" height="58"/>
   <ellipse cx="565" cy="241" rx="24" ry="3" fill="#000" opacity=".15"/>
   <rect x="544" y="234" width="42" height="7" rx="3" fill="#4a4f57"/>
   <g class="k-kettleBody"><path d="M549 234 L553 202 Q565 192 577 202 L581 234Z" fill="url(#kTeal)"/>
    <path d="M555 198 Q565 182 575 198" stroke="#3f7f7c" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M552 214 L540 204" stroke="#5fa8a4" stroke-width="5" stroke-linecap="round"/>
    <rect x="558" y="208" width="14" height="18" rx="3" fill="#d8f0ee" opacity=".55"/><rect class="k-kWater" x="559" y="217" width="12" height="8" rx="2" fill="#6fb3d9"/>
    <circle class="k-kLight" cx="577" cy="230" r="2.4" fill="#ff5a3c"/></g>
   <g class="k-kSteam"><path d="M540 198 q-6 -8 0 -14 q6 -6 0 -14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M548 194 q-5 -7 0 -12" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`),
  objG("ricecooker", "rice cooker", "nồi cơm điện", 365, 625, 198, `
   <rect class="hit" x="608" y="192" width="64" height="50"/>
   <ellipse cx="640" cy="241" rx="30" ry="3" fill="#000" opacity=".15"/>
   <rect x="612" y="206" width="56" height="34" rx="13" fill="#fbf7f0" stroke="#d8cdbd" stroke-width="1.5"/>
   <ellipse cx="640" cy="207" rx="27" ry="8" fill="#f2ece1" stroke="#d8cdbd" stroke-width="1.5"/><rect x="632" y="196" width="16" height="6" rx="3" fill="#e8743b"/>
   <rect x="630" y="218" width="20" height="12" rx="3" fill="#e6ddd0"/><circle class="k-rcLight" cx="640" cy="224" r="3" fill="#bdb3a5"/>
   <g class="k-rcSteam"><path d="M640 194 q-5 -7 0 -12 q5 -6 0 -12" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`),
  objG("toaster", "toaster", "máy nướng bánh mì", 366, 716, 266, `
   <rect class="hit" x="688" y="186" width="56" height="56"/>
   <ellipse cx="716" cy="241" rx="28" ry="3" fill="#000" opacity=".15"/>
   <g class="k-slices"><path d="M701 214 L701 196 Q701 191 707 191 Q713 191 713 196 L713 214Z" fill="#f3d9a4" stroke="#d1a35b"/><path d="M719 214 L719 196 Q719 191 725 191 Q731 191 731 196 L731 214Z" fill="#f3d9a4" stroke="#d1a35b"/></g>
   <rect x="692" y="206" width="48" height="34" rx="10" fill="url(#kChrome)" stroke="#aeb8c0" stroke-width="1.5"/>
   <rect x="700" y="206" width="14" height="3" rx="1.5" fill="#5a636c"/><rect x="718" y="206" width="14" height="3" rx="1.5" fill="#5a636c"/>
   <rect class="k-tGlow" x="696" y="230" width="40" height="5" rx="2" fill="#ff8a3c"/>
   <rect class="k-lever" x="738" y="214" width="6" height="5" rx="2" fill="#3a3f46"/>`),
  objG("coffeemaker", "coffee maker", "máy pha cà phê", 367, 808, 132, `
   <rect class="hit" x="772" y="140" width="88" height="102"/>
   <ellipse cx="808" cy="241" rx="40" ry="3" fill="#000" opacity=".15"/>
   <rect x="778" y="146" width="56" height="94" rx="6" fill="#3a3f46"/><rect x="778" y="146" width="56" height="22" rx="6" fill="#4a5058"/>
   <rect x="782" y="228" width="48" height="10" rx="3" fill="#2b2f35"/><circle cx="824" cy="160" r="3" class="k-cmLight" fill="#5a636c"/>
   <path d="M788 202 L824 202 L822 230 Q806 236 790 230Z" fill="#d8eef7" fill-opacity=".55" stroke="#9aa6af" stroke-width="1.5"/>
   <path class="k-cofLevel" d="M789 216 L823 216 L822 230 Q806 236 790 230Z" fill="#6b4226"/>
   <path d="M822 208 q8 2 6 14" stroke="#2b2f35" stroke-width="3" fill="none"/>
   <rect class="k-drip" x="804" y="180" width="3" height="20" rx="1.5" fill="#6b4226"/>
   <g class="k-mug"><path d="M840 240 L840 220 L856 220 L856 240Z" fill="#e8743b"/><path d="M856 224 q7 2 0 11" stroke="#e8743b" stroke-width="3" fill="none"/><rect class="k-mugCoffee" x="841" y="221" width="14" height="3" fill="#6b4226"/>
    <g class="k-mugSteam"><path d="M844 214 q-4 -6 0 -10 M852 214 q-4 -6 0 -10" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></g></g>`),
  objG("trashbin", "trash bin", "thùng rác", 470, 165, 380, `
   <rect class="hit" x="132" y="388" width="66" height="86"/>
   <ellipse cx="165" cy="471" rx="30" ry="6" fill="#000" opacity=".18" filter="url(#kSoft)"/>
   <path d="M141 412 L189 412 L185 468 Q165 474 145 468Z" fill="#8fa3ae"/><path d="M147 418 L151 464" stroke="#fff" stroke-opacity=".35" stroke-width="4"/>
   <rect x="156" y="462" width="18" height="6" rx="2" fill="#5a636c"/>
   <g class="k-binBag"><path d="M142 414 Q138 396 152 392 Q160 380 172 388 Q190 390 188 414Z" fill="#3b3f46"/><path d="M160 386 l4 -8 l4 8" stroke="#3b3f46" stroke-width="3" fill="none"/></g>
   <g class="k-binLid"><ellipse cx="165" cy="410" rx="26" ry="6" fill="#a9bac4" stroke="#8fa3ae" stroke-width="2"/></g>
   <g class="k-binNew"><ellipse cx="165" cy="412" rx="24" ry="4.5" fill="none" stroke="#3b3f46" stroke-width="3"/></g>`),
  objG("diningtable", "dining table", "bàn ăn", 575, 750, 462, `
   <rect class="hit" x="626" y="470" width="250" height="110"/>
   <ellipse cx="750" cy="576" rx="125" ry="10" fill="#000" opacity=".18" filter="url(#kSoft)"/>
   <rect x="664" y="496" width="9" height="66" fill="#6a3f22"/><rect x="828" y="496" width="9" height="66" fill="#6a3f22"/>
   <rect x="640" y="500" width="11" height="76" fill="#7a4a2a"/><rect x="850" y="500" width="11" height="76" fill="#7a4a2a"/>
   <polygon points="660,478 842,478 868,498 634,498" fill="#c98a55"/><rect x="634" y="498" width="234" height="9" fill="#a8693e"/>
   <g data-detail="placemats"><ellipse cx="700" cy="489" rx="28" ry="7" fill="#9fc7c0"/><ellipse cx="800" cy="489" rx="28" ry="7" fill="#9fc7c0"/><ellipse cx="700" cy="489" rx="23" ry="5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-dasharray="3 4"/><ellipse cx="800" cy="489" rx="23" ry="5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-dasharray="3 4"/></g>
   <g data-detail="napkin-holder"><path d="M662 492 L662 480 L668 486 L674 480 L674 492Z" fill="#a8693e"/><rect x="664" y="478" width="8" height="10" fill="#fffdf9" stroke="#e2d4c0"/></g>
   <g data-detail="salt-pepper"><path d="M834 494 L834 482 Q834 478 838 478 Q842 478 842 482 L842 494Z" fill="#fffdf9" stroke="#c9b7a2"/><path d="M846 494 L846 482 Q846 478 850 478 Q854 478 854 482 L854 494Z" fill="#3a3f46"/><g fill="#7a7166"><circle cx="837" cy="480" r=".8"/><circle cx="839.5" cy="479.5" r=".8"/></g><g fill="#fffdf9"><circle cx="849" cy="480" r=".8"/><circle cx="851.5" cy="479.5" r=".8"/></g></g>
   <g data-detail="flower-vase"><path d="M744 490 Q738 478 744 468 L756 468 Q762 478 756 490Z" fill="#7aa6c2"/><g stroke="#4c9a49" stroke-width="2" fill="none"><path d="M748 468 q-6 -10 -10 -16"/><path d="M750 468 q0 -12 0 -20"/><path d="M752 468 q6 -10 10 -14"/></g><circle cx="737" cy="451" r="5" fill="#f5c45a"/><circle cx="750" cy="446" r="5.5" fill="#e79a86"/><circle cx="763" cy="453" r="5" fill="#fffdf9" stroke="#e2d4c0"/><g fill="#e8743b"><circle cx="737" cy="451" r="1.8"/><circle cx="750" cy="446" r="2"/><circle cx="763" cy="453" r="1.8"/></g></g>
   <g class="k-setPlates"><ellipse cx="700" cy="488" rx="20" ry="5" fill="#fff" stroke="#c9d6df"/><ellipse cx="800" cy="488" rx="20" ry="5" fill="#fff" stroke="#c9d6df"/>
    <line x1="724" y1="484" x2="732" y2="494" stroke="#a8693e" stroke-width="2"/><line x1="727" y1="483" x2="735" y2="493" stroke="#a8693e" stroke-width="2"/>
    <path d="M770 490 l0 -10 h9 l0 10z" fill="#bfe3ff" stroke="#8fb3cf"/></g>
   <g class="k-riceBowl"><path d="M686 487 q14 14 28 0z" fill="#f4f6f8" stroke="#8fb3cf"/><ellipse cx="700" cy="486" rx="13" ry="5" fill="#fffdf6"/></g>
   <g class="k-toastPlate"><path d="M792 488 L792 474 Q792 469 800 469 Q808 469 808 474 L808 488Z" fill="#c98a43" stroke="#8a5a2a"/></g>`),
  ...kitchenDecor
].join("\n");

const kitchenCss = `
#room .k-doorL{transform-origin:146px 0;transition:transform .5s}#room .k-doorR{transform-origin:344px 0;transition:transform .5s}
#room [data-k_cabinet="open"] .k-doorL,#room [data-k_cabinet="open"] .k-doorR{transform:scaleX(.1)}
#room .k-cabPlates{display:none}#room [data-k_dishes="away"] .k-cabPlates{display:inline}
#room .k-mwDoor{transform-origin:604px 0;transition:transform .5s}#room [data-k_micro="open"] .k-mwDoor{transform:scaleX(.08)}
#room .k-mwLight{opacity:0;transition:opacity .3s}#room [data-k_micro="open"] .k-mwLight{opacity:.45}#room [data-k_micro="running"] .k-mwLight{opacity:1;animation:kPulse 1s ease-in-out infinite}
#room .k-mwFood{display:none}#room [data-k_food="in"] .k-mwFood,#room [data-k_food="hot"] .k-mwFood{display:inline}
#room .k-mwSteam{display:none}#room [data-k_food="hot"] .k-mwSteam{display:inline;animation:kSteam 2.4s ease-in-out infinite}
#room .k-mwTime{display:none}#room [data-k_micro="running"] .k-mwTime{display:inline}
#room .k-water{opacity:0}#room [data-k_faucet="on"] .k-water{opacity:.85;animation:kFlow .4s linear infinite}
#room .k-sinkDishes{display:none}#room [data-k_dishes="dirty"] .k-sinkDishes,#room [data-k_dishes="clean"] .k-sinkDishes{display:inline}
#room .k-bubbles{display:none}#room [data-k_dishes="clean"] .k-bubbles{display:inline}#room [data-k_dishes="clean"] .k-dirt{display:none}
#room .k-rackPlates{display:none}#room [data-k_dishes="wet"] .k-rackPlates,#room [data-k_dishes="dry"] .k-rackPlates{display:inline}
#room .k-drops{display:none}#room [data-k_dishes="wet"] .k-drops{display:inline;animation:kDrip 1.2s ease-in infinite}
#room .k-flame{opacity:0;transition:opacity .4s}#room [data-k_stove="on"] .k-flame{opacity:1;animation:kPulse .8s ease-in-out infinite}
#room .k-egg{display:none}#room [data-k_pan="egg"] .k-egg{display:inline}
#room .k-sizzle{display:none}#room [data-k_stove="on"][data-k_pan="egg"] .k-sizzle{display:inline;animation:kSteam 1.4s ease-in-out infinite}
#room .k-kettleBody{transition:opacity .3s}#room [data-k_kettle="away"] .k-kettleBody{opacity:0}
#room .k-kWater{display:none}#room [data-k_kettle="full"] .k-kWater,#room [data-k_kettle="boiling"] .k-kWater,#room [data-k_kettle="hot"] .k-kWater{display:inline}
#room .k-kLight{opacity:0}#room [data-k_kettle="boiling"] .k-kLight{opacity:1}
#room .k-kSteam{display:none}#room [data-k_kettle="boiling"] .k-kSteam{display:inline;animation:kSteam 1.2s ease-in-out infinite}#room [data-k_kettle="hot"] .k-kSteam{display:inline;opacity:.35}
#room [data-k_rice="cooking"] .k-rcLight{fill:#ff8a3c}#room [data-k_rice="done"] .k-rcLight{fill:#f5c45a}
#room .k-rcSteam{display:none}#room [data-k_rice="cooking"] .k-rcSteam{display:inline;animation:kSteam 1.6s ease-in-out infinite}#room [data-k_rice="done"] .k-rcSteam{display:inline;opacity:.35}
#room .k-slices{display:none;transition:transform .3s}#room [data-k_toaster="toasting"] .k-slices{display:inline;transform:translateY(12px)}
#room [data-k_toaster="done"] .k-slices{display:inline}#room [data-k_toaster="done"] .k-slices path{fill:#c98a43;stroke:#8a5a2a}
#room .k-tGlow{opacity:0}#room [data-k_toaster="toasting"] .k-tGlow{opacity:.9;animation:kPulse 1s ease-in-out infinite}#room [data-k_toaster="toasting"] .k-lever{transform:translateY(12px)}
#room .k-cofLevel{opacity:0;transition:opacity 1s}#room [data-k_coffee="brewing"] .k-cofLevel{opacity:.5}#room [data-k_coffee="ready"] .k-cofLevel{opacity:1}
#room .k-drip{opacity:0}#room [data-k_coffee="brewing"] .k-drip{opacity:1;animation:kFlow .5s linear infinite}#room [data-k_coffee="brewing"] .k-cmLight{fill:#ff5a3c}
#room .k-mug{display:none}#room [data-k_mug="coffee"] .k-mug,#room [data-k_mug="empty"] .k-mug{display:inline}
#room [data-k_mug="empty"] .k-mugCoffee,#room [data-k_mug="empty"] .k-mugSteam{display:none}#room .k-mugSteam{animation:kSteam 2s ease-in-out infinite}
#room .k-binBag{display:none}#room [data-k_trash="full"] .k-binBag{display:inline}#room [data-k_trash="full"] .k-binLid{transform:translate(-4px,-6px) rotate(-8deg);transform-origin:165px 410px}
#room .k-binNew{display:none}#room [data-k_trash="ready"] .k-binNew{display:inline}
#room .k-setPlates{display:none}#room [data-k_table="set"] .k-setPlates{display:inline}
#room .k-riceBowl{display:none}#room [data-k_riceBowl="table"] .k-riceBowl{display:inline}
#room .k-toastPlate{display:none}#room [data-k_toast="table"] .k-toastPlate{display:inline}
#room [data-detail]{pointer-events:none}
#room .k-hourH{transform-origin:932px 48px;animation:kSpin 600s linear infinite}#room .k-minH{transform-origin:932px 48px;animation:kSpin 50s linear infinite}
#room .k-sway,#room .k-sway2{animation:kSway 5s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 0}#room .k-sway2{animation-delay:-2.5s}
#room .k-cloud{animation:kCloud 14s ease-in-out infinite alternate}#room .k-glow{animation:kPulse 4s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){#room [data-detail] *,#room [class^="k-"]{animation:none!important;transition:none!important}}
@keyframes kSpin{to{transform:rotate(360deg)}}
@keyframes kSway{50%{transform:skewX(2.5deg)}}
@keyframes kCloud{to{transform:translateX(30px)}}
@keyframes kSteam{50%{transform:translateY(-5px);opacity:.25}}
@keyframes kPulse{50%{opacity:.6}}
@keyframes kFlow{to{transform:translateY(3px)}}
@keyframes kDrip{to{transform:translateY(4px);opacity:.3}}
`;

const K_W0 = { k_stove: "off", k_pan: "empty", k_kettle: "empty", k_rice: "none", k_riceBowl: "none", k_micro: "closed", k_food: "cold", k_faucet: "off", k_dishes: "dirty", k_cabinet: "closed", k_toaster: "empty", k_toast: "none", k_coffee: "none", k_mug: "none", k_trash: "full", k_table: "bare" };

const kitchen = {
  id: "kitchen", name: "Kitchen", nameVi: "Phòng bếp",
  shellSvg: kitchenShell, worldSvg: kitchenWorld, W0: K_W0,
  spots: {
    k_cabinet: { x: 250, y: 392, d: 1 }, k_sink: { x: 205, y: 394, d: 1 }, k_rack: { x: 335, y: 394, d: 1 }, k_stove: { x: 455, y: 394, d: 1 },
    k_kettle: { x: 555, y: 394, d: 1 }, k_rice: { x: 632, y: 394, d: 1 }, k_micro: { x: 668, y: 390, d: 1 }, k_toaster: { x: 710, y: 394, d: 1 },
    k_coffee: { x: 800, y: 394, d: 1 }, k_trash: { x: 232, y: 482, d: -1 }, k_table: { x: 600, y: 482, d: 1 }, k_seat: { x: 592, y: 556, d: 1 },
    k_door: { x: 470, y: 612, d: 1 }
  },
  obstacles: [{ x1: 628, x2: 872, y1: 492, y2: 582 }, { x1: 718, x2: 798, y1: 462, y2: 492 }, { x1: 132, x2: 196, y1: 452, y2: 474 }, { x1: 70, x2: 130, y1: 466, y2: 490 }, { x1: 0, x2: 82, y1: 596, y2: 640 }, { x1: 884, x2: 926, y1: 392, y2: 410 }],
  entry: { x: 470, y: 600, d: 1 },
  objects: {
    stove: { en: "stove", vi: "bếp nấu", ipa: "/stəʊv/", acts: ["turn_on_stove", "fry_egg", "turn_off_stove"] },
    kettle: { en: "kettle", vi: "ấm đun nước", ipa: "/ˈket.əl/", acts: ["fill_kettle", "boil_water", "pour_hot_water"] },
    ricecooker: { en: "rice cooker", vi: "nồi cơm điện", ipa: "/ˈraɪs ˌkʊk.ər/", acts: ["wash_rice", "cook_rice", "serve_rice"] },
    microwave: { en: "microwave", vi: "lò vi sóng", ipa: "/ˈmaɪ.krə.weɪv/", acts: ["open_microwave", "heat_up_food", "close_microwave"] },
    sink: { en: "sink", vi: "bồn rửa", ipa: "/sɪŋk/", acts: ["turn_on_faucet", "wash_dishes", "wash_hands", "turn_off_faucet"] },
    dishrack: { en: "dish rack", vi: "giá úp bát", ipa: "/ˈdɪʃ ræk/", acts: ["put_dishes_in_rack", "dry_plates", "put_plates_away"] },
    cabinet: { en: "cabinet", vi: "tủ bếp", ipa: "/ˈkæb.ɪ.nət/", acts: ["open_cabinet", "put_plates_away", "close_cabinet"] },
    toaster: { en: "toaster", vi: "máy nướng bánh mì", ipa: "/ˈtəʊ.stər/", acts: ["toast_bread", "take_out_toast"] },
    coffeemaker: { en: "coffee maker", vi: "máy pha cà phê", ipa: "/ˈkɒf.i ˌmeɪ.kər/", acts: ["make_coffee", "pour_coffee", "drink_coffee"] },
    trashbin: { en: "trash bin", vi: "thùng rác", ipa: "/ˈtræʃ bɪn/", acts: ["take_out_trash", "put_in_new_bag"] },
    diningtable: { en: "dining table", vi: "bàn ăn", ipa: "/ˈdaɪ.nɪŋ ˌteɪ.bəl/", acts: ["sit_at_the_table", "set_the_table", "eat_breakfast", "get_up_from_table", "clear_the_table"] }
  },
  actions: kitchenActions,
  props: K_PROPS,
  applyState(W, root) { mirrorState(W, K_W0, root); },
  css: kitchenCss,
  catalog: cat("k_", [
    ["refrigerator", "/rɪˈfrɪdʒ.ər.eɪ.tər/", "tủ lạnh", "appliance"], ["freezer", "/ˈfriː.zər/", "tủ đông, ngăn đá", "appliance"],
    ["microwave", "/ˈmaɪ.krə.weɪv/", "lò vi sóng", "appliance"], ["oven", "/ˈʌv.ən/", "lò nướng", "appliance"], ["stove", "/stəʊv/", "bếp nấu", "appliance"],
    ["range hood", "/ˈreɪndʒ hʊd/", "máy hút mùi", "appliance"], ["kettle", "/ˈket.əl/", "ấm đun nước", "appliance"], ["toaster", "/ˈtəʊ.stər/", "máy nướng bánh mì", "appliance"],
    ["rice cooker", "/ˈraɪs ˌkʊk.ər/", "nồi cơm điện", "appliance"], ["blender", "/ˈblen.dər/", "máy xay sinh tố", "appliance"], ["coffee maker", "/ˈkɒf.i ˌmeɪ.kər/", "máy pha cà phê", "appliance"],
    ["sink", "/sɪŋk/", "bồn rửa", "fixture"], ["faucet", "/ˈfɔː.sɪt/", "vòi nước", "fixture"], ["dish rack", "/ˈdɪʃ ræk/", "giá úp bát", "storage"],
    ["plates", "/pleɪts/", "những cái đĩa", "tableware"], ["bowls", "/bəʊlz/", "những cái bát", "tableware"], ["cups", "/kʌps/", "những cái cốc, tách", "tableware"],
    ["mugs", "/mʌɡz/", "những cốc có quai", "tableware"], ["spoons", "/spuːnz/", "những cái thìa", "tableware"], ["forks", "/fɔːks/", "những cái dĩa (nĩa)", "tableware"],
    ["knives", "/naɪvz/", "những con dao", "utensil"], ["chopping board", "/ˈtʃɒp.ɪŋ bɔːd/", "cái thớt", "utensil"], ["frying pan", "/ˈfraɪ.ɪŋ pæn/", "cái chảo", "cookware"],
    ["saucepan", "/ˈsɔː.spən/", "cái xoong (nồi có cán)", "cookware"], ["pot", "/pɒt/", "cái nồi", "cookware"], ["spatula", "/ˈspætʃ.ə.lə/", "cái xẻng lật", "utensil"],
    ["ladle", "/ˈleɪ.dəl/", "cái muôi (vá)", "utensil"], ["tongs", "/tɒŋz/", "cái kẹp gắp", "utensil"], ["whisk", "/wɪsk/", "cây đánh trứng", "utensil"],
    ["peeler", "/ˈpiː.lər/", "dao bào vỏ", "utensil"], ["grater", "/ˈɡreɪ.tər/", "cái nạo", "utensil"], ["colander", "/ˈkʌl.ən.dər/", "rổ lỗ (để ráo nước)", "utensil"],
    ["measuring cup", "/ˈmeʒ.ər.ɪŋ kʌp/", "cốc đong", "utensil"], ["food container", "/ˈfuːd kənˌteɪ.nər/", "hộp đựng thức ăn", "storage"], ["lunch box", "/ˈlʌntʃ bɒks/", "hộp cơm trưa", "storage"],
    ["water bottle", "/ˈwɔː.tə ˌbɒt.əl/", "bình nước", "tableware"], ["dish soap", "/ˈdɪʃ səʊp/", "nước rửa bát", "cleaning"], ["sponge", "/spʌndʒ/", "miếng rửa bát", "cleaning"],
    ["trash bin", "/ˈtræʃ bɪn/", "thùng rác", "cleaning"], ["paper towels", "/ˈpeɪ.pə ˌtaʊ.əlz/", "khăn giấy lau bếp", "cleaning"], ["kitchen towel", "/ˈkɪtʃ.ən ˌtaʊ.əl/", "khăn lau bếp", "cleaning"],
    ["apron", "/ˈeɪ.prən/", "cái tạp dề", "other"], ["dining table", "/ˈdaɪ.nɪŋ ˌteɪ.bəl/", "bàn ăn", "furniture"], ["dining chair", "/ˈdaɪ.nɪŋ tʃeər/", "ghế ăn", "furniture"],
    ["pantry", "/ˈpæn.tri/", "tủ (kho) đựng thực phẩm", "storage"], ["cabinet", "/ˈkæb.ɪ.nət/", "tủ bếp", "storage"], ["drawer", "/drɔːr/", "ngăn kéo", "storage"],
    ["salt shaker", "/ˈsɒlt ˌʃeɪ.kər/", "lọ rắc muối", "tableware"], ["pepper shaker", "/ˈpep.ə ˌʃeɪ.kər/", "lọ rắc tiêu", "tableware"], ["food scale", "/ˈfuːd skeɪl/", "cân nhà bếp", "utensil"],
    ["timer", "/ˈtaɪ.mər/", "đồng hồ hẹn giờ", "utensil"], ["oven mitt", "/ˈʌv.ən mɪt/", "găng tay chống nóng", "utensil"], ["baking tray", "/ˈbeɪ.kɪŋ treɪ/", "khay nướng", "cookware"],
    ["mixing bowl", "/ˈmɪk.sɪŋ bəʊl/", "âu trộn", "cookware"], ["strainer", "/ˈstreɪ.nər/", "cái rây, lưới lọc", "utensil"], ["dishcloth", "/ˈdɪʃ.klɒθ/", "khăn rửa bát", "cleaning"]
  ])
};

/* ======================================================================
   BEDROOM
   ====================================================================== */
const BV = {
  alarm: ["alarm", "/əˈlɑːm/", "chuông báo thức"], clock: ["alarm clock", "/əˈlɑːm klɒk/", "đồng hồ báo thức"], set: ["set", "/set/", "cài, đặt"],
  turnoff: ["turn off", "/tɜːn ɒf/", "tắt"], turnon: ["turn on", "/tɜːn ɒn/", "bật"], lie: ["lie down", "/laɪ daʊn/", "nằm xuống"], bed: ["bed", "/bed/", "cái giường"],
  sit: ["sit", "/sɪt/", "ngồi"], edge: ["edge", "/edʒ/", "mép, cạnh"], getout: ["get out of bed", "/ɡet aʊt əv bed/", "ra khỏi giường"],
  makebed: ["make the bed", "/meɪk ðə bed/", "dọn giường"], pillow: ["pillow", "/ˈpɪl.əʊ/", "cái gối"], pick: ["pick up", "/pɪk ʌp/", "nhặt lên"],
  fluff: ["fluff up", "/flʌf ʌp/", "vỗ cho phồng"], blanket: ["blanket", "/ˈblæŋ.kɪt/", "cái chăn"], fold: ["fold", "/fəʊld/", "gấp"], spread: ["spread", "/spred/", "trải ra"],
  wardrobe: ["wardrobe", "/ˈwɔː.drəʊb/", "tủ quần áo"], open: ["open", "/ˈəʊ.pən/", "mở"], close: ["close", "/kləʊz/", "đóng"], shirt: ["shirt", "/ʃɜːt/", "áo sơ mi"],
  take: ["take out", "/teɪk aʊt/", "lấy ra"], hang: ["hang up", "/hæŋ ʌp/", "treo lên"], lamp: ["lamp", "/læmp/", "cái đèn"], read: ["read", "/riːd/", "đọc"],
  book: ["book", "/bʊk/", "quyển sách"], curtains: ["curtains", "/ˈkɜː.tənz/", "rèm cửa"], window: ["window", "/ˈwɪn.dəʊ/", "cửa sổ"],
  lookout: ["look out of", "/lʊk aʊt əv/", "nhìn ra ngoài"], clothes: ["clothes", "/kləʊðz/", "quần áo"], dirty: ["dirty", "/ˈdɜː.ti/", "bẩn"],
  basket: ["laundry basket", "/ˈlɔːn.dri ˌbɑː.skɪt/", "giỏ đựng đồ giặt"], empty: ["empty", "/ˈemp.ti/", "đổ hết, làm trống"], mirror: ["mirror", "/ˈmɪr.ər/", "cái gương"],
  look: ["look", "/lʊk/", "nhìn"], brush: ["brush", "/brʌʃ/", "chải"], hair: ["hair", "/heər/", "tóc"], puton: ["put on", "/pʊt ɒn/", "mang vào, mặc vào"],
  takeoff: ["take off", "/teɪk ɒf/", "cởi ra"], slippers: ["slippers", "/ˈslɪp.əz/", "dép đi trong nhà"], charge: ["charge", "/tʃɑːdʒ/", "sạc"],
  phone: ["phone", "/fəʊn/", "điện thoại"], charger: ["charger", "/ˈtʃɑː.dʒər/", "cái sạc"], unplug: ["unplug", "/ʌnˈplʌɡ/", "rút phích cắm"],
  check: ["check", "/tʃek/", "kiểm tra, xem"], messages: ["messages", "/ˈmes.ɪ.dʒɪz/", "tin nhắn"]
};
const ba = mkAct(BV);
const bOpenWr = W => W.b_wardrobe === "closed" ? [["pose", "reach", 400], ["set", "b_wardrobe", "open"], ["wait", 300]] : [];
const lyingMsg = "Bạn đang nằm trên giường. Hãy dậy trước (Get out of bed).";

const bedroomActions = [
  ba("turn_off_alarm", "alarmclock", "Turn off the alarm", "Tắt báo thức", "I'm turning off the alarm.", "Tôi đang tắt chuông báo thức.", ["turning", "off", "alarm"], ["turnoff", "alarm", "clock"],
    "<b>turn off</b> = tắt. Cụm này dùng cho đồng hồ báo thức, đèn, ti vi…", ["I'm turning off", "the alarm."], ["alarm", "arm", "album"],
    ["I'm turning off <b>the light</b>.", "I'm turning off <b>my phone</b>."],
    W => W.b_alarm !== "ringing" ? "Báo thức không kêu." : null,
    W => W.sitting ? [["pose", "reach", 500], ["set", "b_alarm", "off"], ["pose", "idle", 1]] : [["walk", "b_bedside"], ["pose", "reach", 450], ["set", "b_alarm", "off"], ["pose", "idle", 1]],
    ["turn off the alarm", "quickly turn off the noisy alarm", "tắt chuông báo thức"], true),
  ba("set_alarm", "alarmclock", "Set the alarm", "Hẹn giờ báo thức", "I'm setting the alarm for six o'clock.", "Tôi đang hẹn giờ báo thức lúc sáu giờ.", ["setting", "alarm", "six"], ["set", "alarm", "clock"],
    "<b>set the alarm for + giờ</b> = hẹn báo thức lúc mấy giờ. set → setting: gấp đôi t.", ["I'm setting the alarm", "for six o'clock."], ["set", "sit", "sat"],
    ["I'm setting the alarm for <b>seven</b>.", "I'm setting <b>a timer</b>."],
    W => W.b_alarm === "ringing" ? "Báo thức đang kêu. Hãy tắt trước (Turn off the alarm)." : W.b_alarm === "set" ? "Báo thức đã được hẹn rồi." : null,
    W => W.sitting ? [["pose", "reach", 700], ["set", "b_alarm", "set"], ["pose", "idle", 1]] : [["walk", "b_bedside"], ["pose", "reach", 700], ["set", "b_alarm", "set"], ["pose", "idle", 1]],
    ["set the alarm for six o'clock", "set the alarm for six o'clock tomorrow", "hẹn báo thức lúc sáu giờ"], true),

  ba("lie_down", "bed", "Lie down on the bed", "Nằm xuống giường", "I'm lying down on the bed.", "Tôi đang nằm xuống giường.", ["lying", "down", "bed"], ["lie", "bed", "pillow"],
    "lie → <b>lying</b>: đổi <b>ie</b> thành <b>y</b> rồi thêm -ing (die → dying).", ["I'm lying down", "on the bed."], ["lie", "lay", "light"],
    ["I'm lying <b>on the sofa</b>.", "I'm lying <b>in bed</b>."],
    W => W.b_lying ? "Bạn đang nằm rồi." : W.b_pillow === "floor" ? "Gối đang ở dưới sàn. Hãy nhặt gối lên trước (Pick up the pillow)." : null,
    W => [...(W.sitting ? [] : [["walk", "b_bedSit"], ["sit"]]), ["set", "b_lying", true], ["wait", 500]],
    ["lie down on the bed", "lie down comfortably on the bed", "nằm xuống giường"], true),
  ba("sit_on_bed", "bed", "Sit on the bed", "Ngồi lên giường", "I'm sitting on the edge of the bed.", "Tôi đang ngồi ở mép giường.", ["sitting", "edge", "bed"], ["sit", "edge", "bed"],
    "<b>on the edge of</b> = ở mép của. sit → sitting: gấp đôi t.", ["I'm sitting", "on the edge of the bed."], ["edge", "age", "egg"],
    ["I'm sitting <b>on the sofa</b>.", "I'm standing <b>at the edge of</b> the pool."],
    W => W.sitting && !W.b_lying ? "Bạn đang ngồi trên giường rồi." : null,
    W => W.b_lying ? [["set", "b_lying", false], ["wait", 400]] : [["walk", "b_bedSit"], ["sit"]],
    ["sit on the edge of the bed", "sit sleepily on the edge of the bed", "ngồi ở mép giường"], true),
  ba("get_out_of_bed", "bed", "Get out of bed", "Ra khỏi giường", "I'm getting out of bed.", "Tôi đang ra khỏi giường.", ["getting", "out", "bed"], ["getout", "bed"],
    "<b>get out of bed</b> (không có “the”) = rời giường, thức dậy. get → getting.", ["I'm getting", "out of bed."], ["out", "at", "art"],
    ["I'm getting <b>out of the car</b>.", "I'm getting <b>up</b> early."],
    W => !W.sitting ? "Bạn không ở trên giường." : null,
    W => [["set", "b_lying", false], ["wait", 250], ["stand"], ["pose", "idle", 300]],
    ["get out of bed", "slowly get out of bed", "ra khỏi giường"], true),
  ba("make_bed", "bed", "Make the bed", "Dọn giường", "I'm making the bed.", "Tôi đang dọn giường.", ["making", "bed"], ["makebed", "blanket", "pillow"],
    "Tiếng Anh nói <b>make the bed</b> cho việc “dọn giường, gấp chăn gối”. make → making.", ["I'm making", "the bed."], ["bed", "bad", "bird"],
    ["I'm making <b>breakfast</b>.", "I'm making <b>my bed</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_pillow === "floor" ? "Gối đang ở dưới sàn. Hãy nhặt gối lên trước (Pick up the pillow)." : W.b_blanket === "spread" && W.b_pillow === "fluffed" ? "Giường đã gọn gàng rồi." : null,
    W => [["walk", "b_bedFoot"], ["pose", "bend", 500], ["set", "b_blanket", "spread"], ["pose", "wipe", 900], ["walk", "b_bedHead"], ["pose", "reach", 500], ["set", "b_pillow", "fluffed"], ["pose", "idle", 1]],
    ["make the bed", "neatly make the bed", "dọn giường"]),

  ba("pick_up_pillow", "pillow", "Pick up the pillow", "Nhặt gối lên", "I'm picking up the pillow.", "Tôi đang nhặt cái gối lên.", ["picking", "up", "pillow"], ["pick", "pillow", "bed"],
    "<b>pick up</b> = nhặt lên. Đồ vật có thể đứng sau hoặc giữa: pick <b>the pillow</b> up.", ["I'm picking up", "the pillow."], ["pillow", "pillar", "yellow"],
    ["I'm picking up <b>my socks</b>.", "I'm picking up <b>the book</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_pillow !== "floor" ? "Gối đang ở trên giường rồi." : null,
    W => [["walk", "b_pillowFloor"], ["pose", "bend", 500], ["spawn", "b_pillowP"], ["set", "b_pillow", "hand"], ["pose", "idle", 1], ["walk", "b_bedHead"], ["pose", "reach", 500], ["despawn"], ["set", "b_pillow", "bed"], ["pose", "idle", 1]],
    ["pick up the pillow", "pick up the pillow from the floor", "nhặt cái gối lên"]),
  ba("fluff_pillow", "pillow", "Fluff up the pillow", "Vỗ gối cho phồng", "I'm fluffing up the pillow.", "Tôi đang vỗ cho gối phồng lên.", ["fluffing", "pillow"], ["fluff", "pillow"],
    "<b>fluff up</b> = vỗ, giũ cho phồng (gối, chăn lông). fluff → fluffing.", ["I'm fluffing up", "the pillow."], ["pillow", "pill", "willow"],
    ["I'm fluffing up <b>the cushions</b>.", "I'm shaking <b>the blanket</b>."],
    W => W.b_lying ? lyingMsg : W.b_pillow === "floor" ? "Hãy nhặt gối lên trước (Pick up the pillow)." : W.b_pillow === "fluffed" ? "Gối đã phồng rồi." : W.sitting ? "Hãy đứng dậy trước (Get out of bed)." : null,
    W => [["walk", "b_bedHead"], ["pose", "wipe", 1000], ["set", "b_pillow", "fluffed"], ["pose", "idle", 1]],
    ["fluff up the pillow", "fluff up the soft pillow", "vỗ cho gối phồng lên"]),

  ba("fold_blanket", "blanket", "Fold the blanket", "Gấp chăn", "I'm folding the blanket.", "Tôi đang gấp chăn.", ["folding", "blanket"], ["fold", "blanket"],
    "fold → folding. Ngược lại: <b>unfold</b> / spread out = mở ra, trải ra.", ["I'm folding", "the blanket."], ["fold", "hold", "food"],
    ["I'm folding <b>my clothes</b>.", "I'm folding <b>the towels</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_blanket === "folded" ? "Chăn đã gấp rồi." : null,
    W => [["walk", "b_bedFoot"], ["pose", "bend", 600], ["pose", "reach", 600], ["set", "b_blanket", "folded"], ["pose", "idle", 1]],
    ["fold the blanket", "neatly fold the blanket", "gấp chăn"]),
  ba("spread_blanket", "blanket", "Spread the blanket", "Trải chăn ra", "I'm spreading the blanket over the bed.", "Tôi đang trải chăn lên giường.", ["spreading", "blanket", "bed"], ["spread", "blanket", "bed"],
    "<b>spread … over …</b> = trải … phủ lên … spread → spreading.", ["I'm spreading the blanket", "over the bed."], ["spread", "bread", "spray"],
    ["I'm spreading <b>butter</b> on my toast.", "I'm spreading <b>a cloth</b> over the table."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_blanket === "spread" ? "Chăn đã trải phẳng rồi." : null,
    W => [["walk", "b_bedFoot"], ["pose", "reach", 600], ["set", "b_blanket", "spread"], ["pose", "wipe", 700], ["pose", "idle", 1]],
    ["spread the blanket over the bed", "spread the warm blanket over the bed", "trải chăn lên giường"]),

  ba("open_wardrobe", "wardrobe", "Open the wardrobe", "Mở tủ quần áo", "I'm opening the wardrobe.", "Tôi đang mở tủ quần áo.", ["opening", "wardrobe"], ["open", "wardrobe"],
    "<b>wardrobe</b> (Anh) = closet (Mỹ) = tủ quần áo.", ["I'm opening", "the wardrobe."], ["wardrobe", "word", "robe"],
    ["I'm opening <b>the drawer</b>.", "I'm opening <b>the closet</b>."],
    W => W.b_wardrobe === "open" ? "Tủ quần áo đang mở rồi." : null,
    W => [["walk", "b_wardrobe"], ["pose", "reach", 450], ["set", "b_wardrobe", "open"], ["pose", "idle", 1]],
    ["open the wardrobe", "open the big wardrobe", "mở tủ quần áo"]),
  ba("take_out_shirt", "wardrobe", "Take out a shirt", "Lấy áo ra", "I'm taking a shirt out of the wardrobe.", "Tôi đang lấy một chiếc áo ra khỏi tủ.", ["taking", "shirt", "wardrobe"], ["take", "shirt", "wardrobe"],
    "<b>take … out of …</b> = lấy … ra khỏi … <b>a</b> shirt = một chiếc áo (bất kỳ).", ["I'm taking a shirt", "out of the wardrobe."], ["shirt", "short", "shut"],
    ["I'm taking <b>a jacket</b> out of the wardrobe.", "I'm taking <b>a towel</b> out of the drawer."],
    W => W.b_shirt !== "wardrobe" ? "Áo đã được lấy ra rồi." : null,
    W => [["walk", "b_wardrobe"], ...bOpenWr(W), ["pose", "reach", 500], ["spawn", "b_shirtP"], ["set", "b_shirt", "hand"], ["pose", "idle", 1], ["walk", "b_bedFoot"], ["pose", "reach", 450], ["despawn"], ["set", "b_shirt", "bed"], ["pose", "idle", 1]],
    ["take a shirt out of the wardrobe", "take a clean shirt out of the wardrobe", "lấy một chiếc áo ra khỏi tủ"]),
  ba("hang_up_shirt", "wardrobe", "Hang up the shirt", "Treo áo lên", "I'm hanging up my shirt.", "Tôi đang treo áo lên.", ["hanging", "up", "shirt"], ["hang", "shirt", "wardrobe"],
    "<b>hang up</b> = treo lên (móc áo). hang → hanging.", ["I'm hanging up", "my shirt."], ["hang", "hung", "hand"],
    ["I'm hanging up <b>my coat</b>.", "I'm hanging up <b>the towel</b>."],
    W => W.b_shirt !== "bed" ? "Không có áo nào trên giường để treo. (Take out a shirt)" : null,
    W => [["walk", "b_bedFoot"], ["pose", "bend", 400], ["spawn", "b_shirtP"], ["set", "b_shirt", "hand"], ["pose", "idle", 1], ["walk", "b_wardrobe"], ...bOpenWr(W), ["pose", "reach", 600], ["despawn"], ["set", "b_shirt", "wardrobe"], ["pose", "idle", 1]],
    ["hang up my shirt", "carefully hang up my shirt", "treo áo lên"]),
  ba("close_wardrobe", "wardrobe", "Close the wardrobe", "Đóng tủ quần áo", "I'm closing the wardrobe.", "Tôi đang đóng tủ quần áo.", ["closing", "wardrobe"], ["close", "wardrobe"],
    "close → closing: bỏ <b>e</b> rồi thêm -ing.", ["I'm closing", "the wardrobe."], ["close", "clothes", "cloth"],
    ["I'm closing <b>the drawer</b>.", "I'm closing <b>the door</b>."],
    W => W.b_wardrobe !== "open" ? "Tủ quần áo đang đóng rồi." : null,
    W => [["walk", "b_wardrobe"], ["pose", "reach", 450], ["set", "b_wardrobe", "closed"], ["pose", "idle", 1]],
    ["close the wardrobe", "close the wardrobe", "đóng tủ quần áo"]),

  ba("turn_on_lamp", "lamp", "Turn on the lamp", "Bật đèn ngủ", "I'm turning on the bedside lamp.", "Tôi đang bật đèn ngủ.", ["turning", "on", "lamp"], ["turnon", "lamp"],
    "<b>bedside lamp</b> = đèn đầu giường. turn on = bật.", ["I'm turning on", "the bedside lamp."], ["lamp", "lamb", "lump"],
    ["I'm turning on <b>the fan</b>.", "I'm turning on <b>the light</b>."],
    W => W.b_lamp === "on" ? "Đèn đang bật rồi." : null,
    W => W.sitting ? [["pose", "reach", 450], ["set", "b_lamp", "on"], ["pose", "idle", 1]] : [["walk", "b_bedside"], ["pose", "reach", 450], ["set", "b_lamp", "on"], ["pose", "idle", 1]],
    ["turn on the bedside lamp", "turn on the warm bedside lamp", "bật đèn ngủ"], true),
  ba("read_in_bed", "lamp", "Read in bed", "Đọc sách trên giường", "I'm reading a book in bed.", "Tôi đang đọc sách trên giường.", ["reading", "book", "bed"], ["read", "book", "bed"],
    "<b>in bed</b> (không có “the”) = ở trên giường (nằm/ngồi trong chăn).", ["I'm reading a book", "in bed."], ["read", "red", "ride"],
    ["I'm reading <b>a magazine</b>.", "I'm having breakfast <b>in bed</b>."],
    W => !W.sitting ? "Hãy lên giường trước (Sit on the bed / Lie down)." : W.b_lamp !== "on" ? "Tối quá! Hãy bật đèn ngủ trước (Turn on the lamp)." : W.activity === "reading" ? "Bạn đang đọc sách rồi." : null,
    W => [["spawn", "b_book"], ["activity", "reading"], ["pose", "point", 1600], ["despawn"], ["pose", "idle", 1]],
    ["read a book in bed", "read a good book in bed", "đọc sách trên giường"], true),
  ba("turn_off_lamp", "lamp", "Turn off the lamp", "Tắt đèn ngủ", "I'm turning off the lamp.", "Tôi đang tắt đèn ngủ.", ["turning", "off", "lamp"], ["turnoff", "lamp"],
    "<b>turn off</b> = tắt. Trước khi ngủ: turn off the lamp.", ["I'm turning off", "the lamp."], ["off", "of", "on"],
    ["I'm turning off <b>the TV</b>.", "I'm turning off <b>the alarm</b>."],
    W => W.b_lamp !== "on" ? "Đèn đang tắt rồi." : null,
    W => W.sitting ? [["pose", "reach", 450], ["set", "b_lamp", "off"], ["pose", "idle", 1]] : [["walk", "b_bedside"], ["pose", "reach", 450], ["set", "b_lamp", "off"], ["pose", "idle", 1]],
    ["turn off the lamp", "turn off the lamp", "tắt đèn ngủ"], true),

  ba("open_curtains", "curtains", "Open the curtains", "Kéo rèm ra", "I'm opening the curtains.", "Tôi đang kéo rèm ra.", ["opening", "curtains"], ["open", "curtains", "window"],
    "Rèm có 2 tấm nên dùng số nhiều: <b>the curtains</b>. Cũng có thể nói <b>draw back</b> the curtains.", ["I'm opening", "the curtains."], ["curtains", "certain", "cartons"],
    ["I'm opening <b>the window</b>.", "I'm <b>closing</b> the curtains."],
    W => W.b_curtains === "open" ? "Rèm đang mở rồi." : null,
    W => [["walk", "b_curtains"], ["pose", "reach", 700], ["set", "b_curtains", "open"], ["pose", "idle", 1]],
    ["open the curtains", "open the curtains to let the sunlight in", "kéo rèm ra"]),
  ba("look_out_window", "curtains", "Look out of the window", "Nhìn ra cửa sổ", "I'm looking out of the window.", "Tôi đang nhìn ra ngoài cửa sổ.", ["looking", "out", "window"], ["lookout", "window"],
    "<b>look out of the window</b> = nhìn ra ngoài cửa sổ (Mỹ: look out the window).", ["I'm looking", "out of the window."], ["window", "widow", "windy"],
    ["I'm looking <b>at the sky</b>.", "I'm looking <b>at my phone</b>."],
    W => W.b_curtains !== "open" ? "Rèm đang đóng. Hãy kéo rèm ra trước (Open the curtains)." : null,
    W => [["walk", "b_curtains"], ["face", "b_curtains"], ["pose", "point", 1400], ["pose", "idle", 1]],
    ["look out of the window", "look out of the window at the sunny morning", "nhìn ra ngoài cửa sổ"]),
  ba("close_curtains", "curtains", "Close the curtains", "Kéo rèm lại", "I'm closing the curtains.", "Tôi đang kéo rèm lại.", ["closing", "curtains"], ["close", "curtains"],
    "close → closing. Cũng có thể nói <b>draw</b> the curtains.", ["I'm closing", "the curtains."], ["close", "clothes", "clause"],
    ["I'm closing <b>the window</b>.", "I'm closing <b>the door</b>."],
    W => W.b_curtains !== "open" ? "Rèm đang đóng rồi." : null,
    W => [["walk", "b_curtains"], ["pose", "reach", 700], ["set", "b_curtains", "closed"], ["pose", "idle", 1]],
    ["close the curtains", "close the curtains for the night", "kéo rèm lại"]),

  ba("pick_up_clothes", "laundry", "Put dirty clothes in the basket", "Bỏ đồ bẩn vào giỏ", "I'm putting my dirty clothes in the laundry basket.", "Tôi đang bỏ quần áo bẩn vào giỏ đồ giặt.", ["putting", "dirty", "clothes", "laundry basket"], ["dirty", "clothes", "basket"],
    "<b>clothes</b> /kləʊðz/ luôn là số nhiều. dirty clothes = quần áo bẩn.", ["I'm putting my dirty clothes", "in the laundry basket."], ["clothes", "close", "cloth"],
    ["I'm putting my <b>shoes</b> on the rack.", "I'm putting my <b>books</b> in my bag."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_clothes !== "floor" ? "Không có quần áo bẩn dưới sàn." : null,
    W => [["walk", "b_clothes"], ["pose", "bend", 500], ["spawn", "b_clothesP"], ["set", "b_clothes", "hand"], ["pose", "idle", 1], ["walk", "b_laundry"], ["pose", "reach", 450], ["despawn"], ["set", "b_clothes", "basket"], ["pose", "idle", 1]],
    ["put my dirty clothes in the laundry basket", "put all my dirty clothes in the laundry basket", "bỏ quần áo bẩn vào giỏ đồ giặt"]),
  ba("empty_basket", "laundry", "Empty the laundry basket", "Đổ giỏ đồ giặt", "I'm emptying the laundry basket.", "Tôi đang lấy hết đồ trong giỏ ra để giặt.", ["emptying", "laundry basket"], ["empty", "basket", "clothes"],
    "<b>empty</b> vừa là tính từ (trống) vừa là động từ (làm trống). empty → emptying.", ["I'm emptying", "the laundry basket."], ["empty", "entry", "enemy"],
    ["I'm emptying <b>the bin</b>.", "I'm emptying <b>my bag</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_clothes !== "basket" ? "Giỏ đồ giặt đang trống." : null,
    W => [["walk", "b_laundry"], ["pose", "bend", 700], ["spawn", "b_clothesP"], ["set", "b_clothes", "washing"], ["pose", "idle", 1], ["walk", "b_door"], ["wait", 300], ["despawn"], ["walk", "b_laundry"], ["pose", "idle", 1]],
    ["empty the laundry basket", "empty the full laundry basket", "lấy hết đồ trong giỏ ra để giặt"]),

  ba("look_in_mirror", "mirror", "Look in the mirror", "Soi gương", "I'm looking in the mirror.", "Tôi đang soi gương.", ["looking", "mirror"], ["look", "mirror"],
    "Soi gương = <b>look in the mirror</b> (dùng <b>in</b>, không dùng at).", ["I'm looking", "in the mirror."], ["mirror", "mirage", "mere"],
    ["I'm looking <b>at the photo</b>.", "I'm looking <b>for my keys</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : null,
    W => [["walk", "b_mirror"], ["face", "b_wardrobe"], ["pose", "point", 1200], ["pose", "idle", 1]],
    ["look in the mirror", "look in the mirror and smile", "soi gương"]),
  ba("brush_hair", "mirror", "Brush my hair", "Chải tóc", "I'm brushing my hair.", "Tôi đang chải tóc.", ["brushing", "hair"], ["brush", "hair", "mirror"],
    "<b>hair</b> (tóc) không đếm được: my hair <b>is</b> long. brush → brushing.", ["I'm brushing", "my hair."], ["hair", "here", "her"],
    ["I'm brushing <b>my teeth</b>.", "I'm combing <b>my hair</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : null,
    W => [["walk", "b_mirror"], ["spawn", "b_brush"], ["pose", "drink", 1500], ["despawn"], ["pose", "idle", 1]],
    ["brush my hair", "brush my hair in front of the mirror", "chải tóc"]),

  ba("put_on_slippers", "slippers", "Put on my slippers", "Đi dép vào", "I'm putting on my slippers.", "Tôi đang đi dép vào.", ["putting", "on", "slippers"], ["puton", "slippers"],
    "<b>put on</b> = mặc/đi/đeo vào (quần áo, giày dép, kính). Ngược lại: take off.", ["I'm putting on", "my slippers."], ["slippers", "sleepers", "slip"],
    ["I'm putting on <b>my shoes</b>.", "I'm putting on <b>a jacket</b>."],
    W => W.b_lying ? "Hãy ngồi dậy trước (Sit on the bed)." : W.b_slippers === "on" ? "Bạn đang đi dép rồi." : null,
    W => W.sitting ? [["pose", "bend", 800], ["set", "b_slippers", "on"], ["pose", "idle", 1]] : [["walk", "b_slippers"], ["pose", "bend", 800], ["set", "b_slippers", "on"], ["pose", "idle", 1]],
    ["put on my slippers", "put on my soft slippers", "đi dép vào"], true),
  ba("take_off_slippers", "slippers", "Take off my slippers", "Cởi dép ra", "I'm taking off my slippers.", "Tôi đang cởi dép ra.", ["taking", "off", "slippers"], ["takeoff", "slippers"],
    "<b>take off</b> = cởi ra. take → taking: bỏ e.", ["I'm taking off", "my slippers."], ["off", "of", "if"],
    ["I'm taking off <b>my shoes</b>.", "I'm taking off <b>my glasses</b>."],
    W => W.b_lying ? "Hãy ngồi dậy trước (Sit on the bed)." : W.b_slippers !== "on" ? "Bạn đang không đi dép." : null,
    W => W.sitting ? [["pose", "bend", 800], ["set", "b_slippers", "floor"], ["pose", "idle", 1]] : [["walk", "b_slippers"], ["pose", "bend", 800], ["set", "b_slippers", "floor"], ["pose", "idle", 1]],
    ["take off my slippers", "take off my slippers", "cởi dép ra"], true),

  ba("charge_phone", "phone", "Charge my phone", "Sạc điện thoại", "I'm charging my phone.", "Tôi đang sạc điện thoại.", ["charging", "phone"], ["charge", "phone", "charger"],
    "charge → charging: bỏ <b>e</b> rồi thêm -ing.", ["I'm charging", "my phone."], ["charge", "change", "large"],
    ["I'm charging <b>my laptop</b>.", "My phone <b>is charging</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_phone === "charging" ? "Điện thoại đang sạc rồi." : W.b_phone === "full" ? "Pin đầy rồi." : null,
    W => [["walk", "b_phone"], ["pose", "reach", 600], ["set", "b_phone", "charging"], ["pose", "idle", 1]],
    ["charge my phone", "charge my phone before bed", "sạc điện thoại"]),
  ba("unplug_charger", "phone", "Unplug the charger", "Rút sạc ra", "I'm unplugging the charger.", "Tôi đang rút sạc ra.", ["unplugging", "charger"], ["unplug", "charger", "phone"],
    "<b>un-</b> + plug = ngược lại với cắm. unplug → unplugging: gấp đôi <b>g</b>.", ["I'm unplugging", "the charger."], ["charger", "charge", "chart"],
    ["I'm unplugging <b>the TV</b>.", "I'm plugging in <b>the lamp</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_phone !== "charging" ? "Điện thoại không cắm sạc." : null,
    W => [["walk", "b_phone"], ["pose", "reach", 500], ["set", "b_phone", "full"], ["pose", "idle", 1]],
    ["unplug the charger", "unplug the charger when the battery is full", "rút sạc ra"]),
  ba("check_phone", "phone", "Check my messages", "Xem tin nhắn", "I'm checking my messages.", "Tôi đang xem tin nhắn.", ["checking", "messages"], ["check", "messages", "phone"],
    "<b>check</b> = xem nhanh, kiểm tra. messages /ˈmes.ɪ.dʒɪz/: đuôi -es đọc /ɪz/.", ["I'm checking", "my messages."], ["check", "chick", "cheek"],
    ["I'm checking <b>my email</b>.", "I'm checking <b>the time</b>."],
    W => W.sitting ? (W.b_lying ? lyingMsg : "Hãy đứng dậy trước (Get out of bed).") : W.b_phone === "low" ? "Điện thoại hết pin. Hãy sạc trước (Charge my phone)." : null,
    W => [["walk", "b_phone"], ["spawn", "b_phoneP"], ["pose", "point", 1500], ["despawn"], ["pose", "idle", 1]],
    ["check my messages", "quickly check my messages", "xem tin nhắn"])
];

const B_PROPS = {
  b_pillowP: `<rect x="-20" y="-16" width="40" height="16" rx="7" fill="#fffaf2" stroke="#e2d4c0" stroke-width="1.5"/>`,
  b_shirtP: `<path d="M-14 -26 L-6 -30 Q0 -26 6 -30 L14 -26 L18 -18 L11 -16 L11 0 L-11 0 L-11 -16 L-18 -18Z" fill="#6fb3d9" stroke="#4f8fb8" stroke-width="1.2"/>`,
  b_clothesP: `<path d="M-16 0 Q-18 -12 -8 -16 Q0 -22 10 -16 Q20 -12 16 0Z" fill="#e8a25a"/><path d="M-10 -6 Q0 -14 12 -6" stroke="#7aa6c2" stroke-width="5" fill="none"/>`,
  b_book: `<rect x="-14" y="-20" width="28" height="20" rx="2" fill="#3b6ec2"/><rect x="-12" y="-18" width="24" height="16" fill="#f4efe4"/><line x1="0" y1="-18" x2="0" y2="-2" stroke="#3b6ec2"/>`,
  b_brush: `<rect x="-2.5" y="-30" width="5" height="20" rx="2" fill="#a0703a"/><rect x="-7" y="-12" width="14" height="12" rx="4" fill="#e8743b"/>`,
  b_phoneP: `<rect x="-7" y="-24" width="14" height="24" rx="3" fill="#2d2a26"/><rect x="-5.5" y="-21" width="11" height="17" rx="1" fill="#8fd1f0"/>`
};

/* BEDROOM details (56, each a data-detail group): floorboards, baseboard, chair-rail, crown-molding, ac-unit, poster, wall-mirror, ceiling-fan, ceiling-light,
   frame-landscape, frame-portrait, wall-clock, calendar, wall-shelf, shelf-books, shelf-candle, trailing-plant, reading-glasses,
   string-lights, dream-catcher, power-outlet, light-switch, bedside-table, tissue-box, bedside-books, desk, wastebasket,
   desk-chair, cardigan, desk-lamp, desk-books, notebook-pen, humidifier, water-bottle, pen-cup, dresser,
   dresser-knobs, phone-dock-mat, hairbrush, dresser-photo, jewelry-box, perfume, suitcase, storage-boxes, sun-hat,
   rug, night-light, window-plant, dresser-succulent, mirror-notes, teddy-bear, throw-cushion, floor-plant, shoe-rack,
   sneakers, backpack */
const bedroomShell = `
<defs>
 <linearGradient id="bWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e4d8"/><stop offset="1" stop-color="#ecd0c0"/></linearGradient>
 <linearGradient id="bLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2bfae"/><stop offset="1" stop-color="#edd2c3"/></linearGradient>
 <linearGradient id="bFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6a676"/><stop offset="1" stop-color="#c28a5a"/></linearGradient>
 <linearGradient id="bWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7a475"/><stop offset="1" stop-color="#b47a4c"/></linearGradient>
 <linearGradient id="bCurtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e79a86"/><stop offset=".5" stop-color="#f3b5a2"/><stop offset="1" stop-color="#d9826d"/></linearGradient>
 <linearGradient id="bGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f4fb"/><stop offset=".5" stop-color="#c9e1ee"/><stop offset="1" stop-color="#eaf5fb"/></linearGradient>
 <linearGradient id="bDuvet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c27a"/><stop offset="1" stop-color="#e9a55a"/></linearGradient>
 <radialGradient id="bLampG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2c2" stop-opacity=".9"/><stop offset="1" stop-color="#fff2c2" stop-opacity="0"/></radialGradient>
 <radialGradient id="bLight" cx=".5" cy=".25" r=".75"><stop offset="0" stop-color="#fff6d8" stop-opacity=".45"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
 <filter id="bSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect x="120" y="0" width="880" height="330" fill="url(#bWall)"/>
<polygon points="0,0 120,0 120,330 0,640" fill="url(#bLeft)"/>
<polygon points="120,330 1000,330 1000,640 0,640" fill="url(#bFloor)"/>
${D("floorboards", `<g stroke="#b77c4d" stroke-opacity=".35"><line x1="120" y1="330" x2="0" y2="640"/><line x1="300" y1="330" x2="230" y2="640"/><line x1="480" y1="330" x2="460" y2="640"/><line x1="660" y1="330" x2="690" y2="640"/><line x1="840" y1="330" x2="920" y2="640"/>
 <line x1="390" y1="400" x2="383" y2="440"/><line x1="570" y1="350" x2="567" y2="380"/><line x1="750" y1="420" x2="757" y2="470"/><line x1="930" y1="360" x2="940" y2="390"/><line x1="200" y1="560" x2="190" y2="600"/></g>`)}
${D("baseboard", `<rect x="120" y="318" width="880" height="12" fill="#c99668"/><polygon points="120,318 120,330 0,640 0,600" fill="#b9875a"/>`)}
${D("chair-rail", `<rect x="120" y="150" width="880" height="5" fill="#e3bfa9" opacity=".7"/><rect x="120" y="155" width="880" height="163" fill="#e8c4b0" opacity=".25"/>`)}
${D("crown-molding", `<rect x="120" y="0" width="880" height="7" fill="#efd6c6"/><rect x="120" y="7" width="880" height="3" fill="#d9b6a0"/><polygon points="0,0 120,0 120,10 0,14" fill="#d9b6a0"/>`)}
${D("ac-unit", lw(14, 34, `<rect x="0" y="0" width="150" height="42" rx="8" fill="#fbfaf7" stroke="#d6cbbd" stroke-width="2"/><rect x="10" y="28" width="130" height="6" rx="3" fill="#e6ddd0"/><circle cx="134" cy="12" r="3" fill="#5fae5a"/>
 <g class="b-acAir" stroke="#bfe3ff" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M30 46 q6 8 0 16"/><path d="M75 46 q6 8 0 16"/><path d="M120 46 q6 8 0 16"/></g>`))}
${D("poster", lw(24, 110, `<rect x="0" y="0" width="100" height="124" rx="3" fill="#2f4f6f"/><circle cx="50" cy="48" r="26" fill="#f5c45a"/><circle cx="60" cy="40" r="22" fill="#2f4f6f"/>
 <g fill="#fffdf9"><circle cx="20" cy="22" r="2"/><circle cx="80" cy="76" r="1.6"/><circle cx="30" cy="70" r="1.4"/><circle cx="84" cy="18" r="1.8"/></g><path d="M0 100 Q30 84 56 98 T100 92 L100 124 L0 124Z" fill="#3e6a8f"/>
 <rect x="16" y="106" width="68" height="8" rx="2" fill="#fffdf9" opacity=".85"/><g fill="#e8743b"><circle cx="4" cy="4" r="2.5"/><circle cx="96" cy="4" r="2.5"/></g>`))}
${D("wall-mirror", lw(38, 262, `<rect x="0" y="0" width="58" height="150" rx="29" fill="#c99668"/><rect x="6" y="6" width="46" height="138" rx="23" fill="url(#bGlass)"/><path d="M16 50 L36 30 M16 72 L42 46" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`))}
${D("ceiling-fan", `<rect x="298" y="0" width="4" height="14" fill="#8a5432"/><ellipse cx="300" cy="18" rx="12" ry="6" fill="#a8693e"/>
 <g class="b-fan"><ellipse cx="300" cy="18" rx="72" ry="4" fill="#c98f5e"/><ellipse cx="300" cy="18" rx="30" ry="6" fill="#b47a4c"/></g><ellipse cx="300" cy="25" rx="9" ry="5" fill="#fff2c2"/>`)}
${D("ceiling-light", `<rect x="719" y="0" width="2" height="12" fill="#8a5432"/><path d="M698 30 Q698 12 720 12 Q742 12 742 30Z" fill="#fffaf2" stroke="#e2d4c0"/><ellipse cx="720" cy="30" rx="22" ry="3" fill="#fff2c2"/>`)}
${D("frame-landscape", `<rect x="190" y="44" width="70" height="56" rx="4" fill="#fff" stroke="#a8784e" stroke-width="4"/><path d="M196 94 L216 70 L230 86 L240 76 L254 94Z" fill="#8cc08a"/><circle cx="240" cy="60" r="6" fill="#f5c45a"/>`)}
${D("frame-portrait", `<rect x="276" y="56" width="56" height="44" rx="4" fill="#fff" stroke="#a8784e" stroke-width="4"/><circle cx="304" cy="74" r="9" fill="#f3b5a2"/><path d="M290 96 q14 -16 28 0z" fill="#7aa6c2"/>`)}
${D("wall-clock", `<circle cx="380" cy="56" r="22" fill="#fffdf9" stroke="#a8784e" stroke-width="4"/><g fill="#a8784e"><circle cx="380" cy="40" r="1.6"/><circle cx="396" cy="56" r="1.6"/><circle cx="380" cy="72" r="1.6"/><circle cx="364" cy="56" r="1.6"/></g>
 <line class="b-hourH" x1="380" y1="56" x2="380" y2="44" stroke="#5a3d1f" stroke-width="2.5" stroke-linecap="round"/><line class="b-minH" x1="380" y1="56" x2="391" y2="60" stroke="#5a3d1f" stroke-width="2" stroke-linecap="round"/><circle cx="380" cy="56" r="2" fill="#e8743b"/>`)}
${D("calendar", `<rect x="356" y="92" width="44" height="50" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><rect x="356" y="92" width="44" height="11" rx="3" fill="#8a6bb3"/><circle cx="366" cy="92" r="2" fill="#5a636c"/><circle cx="390" cy="92" r="2" fill="#5a636c"/>
 <g fill="#d9c7b4"><rect x="361" y="108" width="6" height="5"/><rect x="370" y="108" width="6" height="5"/><rect x="379" y="108" width="6" height="5"/><rect x="388" y="108" width="6" height="5"/><rect x="361" y="117" width="6" height="5"/><rect x="370" y="117" width="6" height="5"/><rect x="388" y="117" width="6" height="5"/><rect x="361" y="126" width="6" height="5"/><rect x="370" y="126" width="6" height="5"/><rect x="379" y="126" width="6" height="5"/></g><path d="M378 116 l3 3 l5 -6" stroke="#e8743b" stroke-width="1.8" fill="none"/>`)}
${D("wall-shelf", `<rect x="150" y="144" width="190" height="6" rx="2" fill="#a8693e"/><path d="M162 150 l0 10 l10 -10Z M328 150 l0 10 l-10 -10Z" fill="#8a5432"/>`)}
${D("shelf-books", `<rect x="158" y="118" width="8" height="26" fill="#e8743b"/><rect x="166" y="122" width="7" height="22" fill="#7aa6c2"/><rect x="173" y="116" width="9" height="28" fill="#8cc08a"/><rect x="182" y="124" width="7" height="20" fill="#f5c45a"/><rect x="190" y="121" width="8" height="23" fill="#8a6bb3" transform="rotate(14 194 144)"/>`)}
${D("shelf-candle", `<rect x="232" y="128" width="14" height="16" rx="3" fill="#fffaf2" stroke="#e2d4c0"/><path class="b-flicker" d="M239 126 q-3 -5 0 -9 q3 4 0 9z" fill="#f5a623"/>`)}
${D("trailing-plant", `<rect x="294" y="126" width="22" height="18" rx="3" fill="#e79a86"/><ellipse cx="305" cy="124" rx="13" ry="6" fill="#6fb36a"/><path d="M298 144 q-4 20 2 40 M312 144 q6 18 0 34" stroke="#5fae5a" stroke-width="3" fill="none"/><g fill="#6fb36a"><circle cx="298" cy="158" r="3.5"/><circle cx="300" cy="172" r="3.5"/><circle cx="315" cy="160" r="3.5"/><circle cx="313" cy="174" r="3.5"/></g>`)}
${D("reading-glasses", `<g stroke="#5a3d1f" stroke-width="2" fill="#e8f4fb" fill-opacity=".6"><circle cx="262" cy="139" r="5"/><circle cx="276" cy="139" r="5"/></g><path d="M267 138 h4" stroke="#5a3d1f" stroke-width="2"/>`)}
${D("string-lights", `<path d="M136 166 Q205 196 272 172 Q340 196 410 166" stroke="#7a6a5a" stroke-width="1.5" fill="none"/>
 <g class="b-twinkle"><circle cx="156" cy="176" r="4" fill="#ffd36b"/><circle cx="196" cy="184" r="4" fill="#ff9e7a"/><circle cx="236" cy="181" r="4" fill="#9fd3f0"/><circle cx="292" cy="178" r="4" fill="#ffd36b"/><circle cx="332" cy="184" r="4" fill="#ff9e7a"/><circle cx="374" cy="178" r="4" fill="#9fd3f0"/></g>
 <g class="b-twinkle2"><circle cx="176" cy="181" r="4" fill="#b8e6a0"/><circle cx="216" cy="184" r="4" fill="#ffd36b"/><circle cx="256" cy="176" r="4" fill="#ff9e7a"/><circle cx="312" cy="182" r="4" fill="#b8e6a0"/><circle cx="352" cy="182" r="4" fill="#ffd36b"/><circle cx="394" cy="172" r="4" fill="#ff9e7a"/></g>`)}
${D("dream-catcher", `<circle cx="420" cy="112" r="11" fill="none" stroke="#a8784e" stroke-width="2.5"/><path d="M412 106 L428 118 M428 106 L412 118 M420 101 V123" stroke="#c9b7a2" stroke-width="1"/><g stroke="#c9b7a2"><line x1="413" y1="122" x2="411" y2="138"/><line x1="427" y1="122" x2="429" y2="138"/></g><g fill="#e79a86"><path d="M408 138 q3 8 6 0z"/><path d="M426 138 q3 8 6 0z"/></g>`)}
${D("power-outlet", `<rect x="618" y="292" width="14" height="20" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><circle cx="625" cy="299" r="1.5" fill="#7a7166"/><circle cx="625" cy="306" r="1.5" fill="#7a7166"/>`)}
${D("light-switch", `<rect x="788" y="194" width="11" height="17" rx="2" fill="#fffdf9" stroke="#c9b7a2"/><rect x="791" y="198" width="5" height="9" rx="1" fill="#e6ddd0"/>`)}
${D("bedside-table", `<ellipse cx="460" cy="364" rx="48" ry="6" fill="#000" opacity=".15" filter="url(#bSoft)"/>
 <rect x="418" y="292" width="84" height="70" rx="5" fill="url(#bWood)"/><rect x="414" y="286" width="92" height="9" rx="3" fill="#c98f5e"/>
 <rect x="424" y="302" width="72" height="24" rx="3" fill="#c98f5e" stroke="#a8784e"/><circle cx="460" cy="314" r="3" fill="#7a4a2a"/><rect x="424" y="332" width="72" height="26" rx="3" fill="#6f4426"/>`)}
${D("tissue-box", `<rect x="430" y="342" width="26" height="16" rx="2" fill="#9fc7c0"/><path d="M436 342 q7 -9 14 0" fill="#fffdf9" stroke="#e2d4c0"/><path d="M432 350 h22" stroke="#fff" stroke-opacity=".6" stroke-dasharray="3 3"/>`)}
${D("bedside-books", `<rect x="462" y="350" width="30" height="8" rx="1" fill="#e8743b"/><rect x="464" y="343" width="26" height="7" rx="1" fill="#7aa6c2"/><rect x="466" y="337" width="22" height="6" rx="1" fill="#f5c45a"/>`)}
${D("desk", `<ellipse cx="561" cy="364" rx="56" ry="6" fill="#000" opacity=".15" filter="url(#bSoft)"/><rect x="508" y="282" width="106" height="9" rx="3" fill="#c98f5e"/>
 <rect x="512" y="290" width="8" height="72" fill="#a8693e"/><rect x="602" y="290" width="8" height="72" fill="#a8693e"/><rect x="520" y="291" width="82" height="16" rx="2" fill="#b47a4c"/><rect x="551" y="297" width="20" height="3" rx="1.5" fill="#7a4a2a"/>`)}
${D("wastebasket", `<path d="M586 340 L606 340 L603 362 L589 362Z" fill="#9fc7c0"/><ellipse cx="596" cy="340" rx="10" ry="2.5" fill="#7fb0a8"/><path d="M590 338 q4 -6 8 -1" stroke="#fffdf9" stroke-width="3" fill="none"/>`)}
${D("desk-chair", `<rect x="538" y="296" width="44" height="34" rx="8" fill="#78bdb8"/><rect x="544" y="302" width="32" height="22" rx="5" fill="#8fd0ca"/><rect x="532" y="328" width="56" height="10" rx="4" fill="#4f9590"/><g fill="#3a3f46"><rect x="538" y="338" width="4" height="24"/><rect x="578" y="338" width="4" height="24"/></g>`)}
${D("cardigan", `<path d="M540 300 Q560 292 580 300 L582 318 L574 318 L572 308 L548 308 L546 318 L538 318Z" fill="#e79a86" opacity=".95"/><path d="M560 300 V308" stroke="#c9705d" stroke-width="1.5"/>`)}
${D("desk-lamp", `<ellipse cx="524" cy="282" rx="10" ry="3" fill="#3a3f46"/><path d="M524 282 L518 258 L536 246" stroke="#3a3f46" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M530 240 L546 248 L540 258 Z" fill="#f5c45a"/><circle cx="518" cy="258" r="2.5" fill="#5a636c"/>`)}
${D("desk-books", `<rect x="538" y="276" width="26" height="6" rx="1" fill="#8cc08a"/><rect x="540" y="270" width="22" height="6" rx="1" fill="#e8743b"/><rect x="542" y="264" width="19" height="6" rx="1" fill="#8a6bb3"/>`)}
${D("notebook-pen", `<path d="M540 282 L568 282 L566 286 L538 286Z" fill="#fffdf9" stroke="#c9b7a2"/><line x1="546" y1="284" x2="566" y2="279" stroke="#3b6ec2" stroke-width="2" stroke-linecap="round"/>`)}
${D("humidifier", `<path d="M568 282 Q566 262 578 258 Q590 262 588 282Z" fill="#fffaf2" stroke="#d6cbbd"/><circle cx="578" cy="274" r="3" fill="#9fd3f0"/><rect x="575" y="254" width="6" height="5" rx="2" fill="#d6cbbd"/>
 <g class="b-mist" fill="#fff" opacity=".7"><circle cx="578" cy="246" r="4"/><circle cx="582" cy="238" r="3"/><circle cx="576" cy="231" r="2.5"/></g>`)}
${D("water-bottle", `<rect x="591" y="262" width="9" height="20" rx="3" fill="#7aa6c2" opacity=".85"/><rect x="592" y="257" width="7" height="6" rx="1.5" fill="#3b6ec2"/>`)}
${D("pen-cup", `<rect x="602" y="270" width="9" height="12" rx="2" fill="#f5c45a"/><g stroke-width="2" stroke-linecap="round"><line x1="604" y1="270" x2="602" y2="261" stroke="#e74c3c"/><line x1="607" y1="270" x2="608" y2="259" stroke="#3b6ec2"/><line x1="609" y1="270" x2="613" y2="263" stroke="#3a3f46"/></g>`)}
${D("dresser", `<ellipse cx="715" cy="364" rx="80" ry="7" fill="#000" opacity=".15" filter="url(#bSoft)"/>
 <rect x="642" y="254" width="146" height="108" rx="5" fill="url(#bWood)"/><rect x="636" y="246" width="158" height="10" rx="3" fill="#c98f5e"/>
 <g fill="#cf9764" stroke="#a8784e"><rect x="650" y="264" width="130" height="28" rx="3"/><rect x="650" y="296" width="130" height="28" rx="3"/><rect x="650" y="328" width="130" height="28" rx="3"/></g>`)}
${D("dresser-knobs", `<g fill="#7a4a2a"><rect x="703" y="276" width="24" height="4" rx="2"/><rect x="703" y="308" width="24" height="4" rx="2"/><rect x="703" y="340" width="24" height="4" rx="2"/></g><g fill="#a8693e"><rect x="648" y="360" width="8" height="5"/><rect x="774" y="360" width="8" height="5"/></g>`)}
${D("phone-dock-mat", `<rect x="648" y="244" width="40" height="3" rx="1.5" fill="#8a6bb3" opacity=".7"/>`)}
${D("hairbrush", `<rect x="690" y="241" width="16" height="5" rx="2.5" fill="#e8743b"/><rect x="704" y="242" width="14" height="3" rx="1.5" fill="#a0703a"/><path d="M692 241 v-2 M696 241 v-2 M700 241 v-2" stroke="#5a3d1f" stroke-width="1"/>`)}
${D("dresser-photo", `<rect x="720" y="230" width="16" height="16" rx="1.5" fill="#fffdf9" stroke="#a8784e" stroke-width="2"/><circle cx="728" cy="236" r="3" fill="#f3b5a2"/><path d="M722 244 q6 -6 12 0" fill="#8cc08a"/>`)}
${D("jewelry-box", `<rect x="740" y="232" width="24" height="14" rx="3" fill="#8a6bb3"/><rect x="738" y="229" width="28" height="5" rx="2" fill="#a487c8"/><circle cx="752" cy="239" r="2" fill="#f5c45a"/><path d="M742 229 q10 -6 20 0" stroke="#f5c45a" stroke-width="1.2" fill="none"/>`)}
${D("perfume", `<rect x="770" y="226" width="12" height="20" rx="2" fill="#f3b5a2" opacity=".9"/><rect x="773" y="220" width="6" height="7" fill="#c9b7a2"/><circle cx="776" cy="218" r="2.5" fill="#e79a86"/>`)}
${D("suitcase", `<rect x="820" y="8" width="70" height="28" rx="5" fill="#e8743b"/><rect x="845" y="3" width="20" height="6" rx="3" fill="none" stroke="#a8562c" stroke-width="2.5"/><g stroke="#c9602c" stroke-width="2"><line x1="838" y1="8" x2="838" y2="36"/><line x1="872" y1="8" x2="872" y2="36"/></g>`)}
${D("storage-boxes", `<rect x="900" y="14" width="40" height="22" rx="2" fill="#f2e3c6" stroke="#c9b7a2"/><rect x="942" y="20" width="34" height="16" rx="2" fill="#9fc7c0" stroke="#7fb0a8"/><rect x="912" y="22" width="16" height="6" rx="1" fill="#fffdf9"/>`)}
${D("sun-hat", `<ellipse cx="959" cy="20" rx="20" ry="4" fill="#e8c06a"/><path d="M948 20 Q949 8 959 8 Q969 8 970 20Z" fill="#f0d07a"/><rect x="948" y="15" width="22" height="3" fill="#e79a86"/>`)}
<rect x="120" y="0" width="880" height="330" fill="url(#bLight)" pointer-events="none"/>
${D("rug", `<ellipse cx="610" cy="525" rx="220" ry="62" fill="#c9b1d6" opacity=".7"/><ellipse cx="610" cy="525" rx="192" ry="48" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-dasharray="8 8"/><ellipse cx="610" cy="525" rx="120" ry="28" fill="none" stroke="#a487c8" stroke-opacity=".45" stroke-width="3"/>`)}
`;

const bedroomDecor = [
  D("night-light", `<rect x="640" y="317" width="10" height="12" rx="3" fill="#fffdf9" stroke="#c9b7a2"/><circle class="b-nl" cx="645" cy="323" r="3" fill="#ffd36b"/><circle class="b-nl" cx="645" cy="323" r="9" fill="#fff2c2" opacity=".35"/>`, 331),
  D("window-plant", `<g class="b-winPlant"><rect x="446" y="188" width="16" height="16" rx="3" fill="#c56b3c"/><ellipse cx="454" cy="184" rx="11" ry="7" fill="#5fae5a"/><path d="M454 184 v-10" stroke="#4c9a49" stroke-width="3"/><circle cx="454" cy="173" r="4" fill="#e79a86"/></g>`, 231),
  D("dresser-succulent", `<path d="M636 246 L638 236 L650 236 L652 246Z" fill="#c56b3c" transform="translate(-6 0)"/><g fill="#6fb36a" transform="translate(-6 0)"><ellipse cx="644" cy="232" rx="3" ry="6"/><ellipse cx="639" cy="234" rx="2.5" ry="5" transform="rotate(-30 639 234)"/><ellipse cx="649" cy="234" rx="2.5" ry="5" transform="rotate(30 649 234)"/></g>`, 300.6),
  D("mirror-notes", `<rect x="668" y="196" width="16" height="16" fill="#fff3b0" transform="rotate(-8 676 204)"/><rect x="682" y="206" width="14" height="14" fill="#ffd9cc" transform="rotate(6 689 213)"/><path d="M671 202 h9 M671 206 h7" stroke="#c9b7a2" stroke-width="1.2"/>`, 300.5),
  D("teddy-bear", `<circle cx="378" cy="338" r="6" fill="#b47a4c"/><circle cx="398" cy="338" r="6" fill="#b47a4c"/><circle cx="388" cy="348" r="13" fill="#c98f5e"/><ellipse cx="388" cy="352" rx="5" ry="3.5" fill="#f2d3b0"/><circle cx="383" cy="345" r="1.6" fill="#2d2a26"/><circle cx="393" cy="345" r="1.6" fill="#2d2a26"/><circle cx="388" cy="350" r="1.6" fill="#2d2a26"/>
   <ellipse cx="388" cy="372" rx="14" ry="12" fill="#c98f5e"/><ellipse cx="388" cy="374" rx="8" ry="7" fill="#f2d3b0"/><path d="M380 360 l8 4 l8 -4 l-2 6 h-12z" fill="#e8743b"/>`, 442.6),
  D("throw-cushion", `<rect x="292" y="326" width="44" height="36" rx="10" fill="#8cc08a" stroke="#6fa56d" stroke-width="1.5" transform="rotate(-8 314 344)"/><circle cx="314" cy="344" r="7" fill="none" stroke="#fffdf9" stroke-width="2" stroke-dasharray="3 3"/><g fill="#6fa56d"><circle cx="292" cy="330" r="2.5"/><circle cx="332" cy="324" r="2.5"/></g>`, 442.5),
  D("floor-plant", `<ellipse cx="46" cy="630" rx="32" ry="6" fill="#000" opacity=".18" filter="url(#bSoft)"/><path d="M24 588 L68 588 L62 628 L30 628Z" fill="#fffaf2" stroke="#d6cbbd"/><rect x="26" y="600" width="40" height="6" fill="#9fc7c0"/>
   <g><ellipse cx="34" cy="560" rx="14" ry="26" fill="#4c9a49" transform="rotate(-25 34 560)"/><ellipse cx="58" cy="556" rx="14" ry="28" fill="#5fae5a" transform="rotate(22 58 556)"/><ellipse cx="46" cy="546" rx="13" ry="32" fill="#6fb36a"/><path d="M46 520 v64 M36 548 l10 10 M56 544 l-10 10" stroke="#3f7f3c" stroke-width="1.5"/></g>`, 630),
  D("shoe-rack", `<ellipse cx="962" cy="506" rx="36" ry="5" fill="#000" opacity=".16" filter="url(#bSoft)"/><g fill="#a8693e"><rect x="930" y="452" width="5" height="54"/><rect x="990" y="452" width="5" height="54"/></g><g fill="#c98f5e"><rect x="928" y="452" width="70" height="6" rx="2"/><rect x="928" y="476" width="70" height="5" rx="2"/><rect x="928" y="498" width="70" height="5" rx="2"/></g>`, 506),
  D("sneakers", `<path d="M936 476 Q936 466 946 466 L952 470 Q962 470 962 476Z" fill="#fffdf9" stroke="#7aa6c2"/><path d="M964 476 Q964 466 974 466 L980 470 Q990 470 990 476Z" fill="#fffdf9" stroke="#7aa6c2"/><path d="M938 498 Q938 488 950 488 Q960 490 960 498Z" fill="#3a3f46"/><path d="M964 498 Q964 488 976 488 Q986 490 986 498Z" fill="#3a3f46"/><g stroke="#e8743b" stroke-width="1.5"><line x1="944" y1="470" x2="950" y2="470"/><line x1="972" y1="470" x2="978" y2="470"/></g>`, 506.2),
  D("backpack", `<path d="M944 452 L944 422 Q944 408 962 408 Q980 408 980 422 L980 452Z" fill="#3b6ec2"/><rect x="950" y="430" width="24" height="16" rx="4" fill="#5f8fd8"/><path d="M954 408 Q962 398 970 408" stroke="#2c529a" stroke-width="3" fill="none"/><rect x="958" y="436" width="8" height="3" rx="1" fill="#f5c45a"/>`, 506.4)
];

const bedroomWorld = [
  objG("curtains", "curtains", "rèm cửa", 230, 530, 30, `
   <rect x="452" y="54" width="156" height="150" rx="6" fill="#bfe3ff" stroke="#a8784e" stroke-width="7"/>
   <path d="M456 170 Q500 150 540 162 T604 158 L604 200 L456 200Z" fill="#9fd39a"/><circle cx="575" cy="90" r="14" fill="#fff3b0"/>
   <line x1="530" y1="58" x2="530" y2="200" stroke="#a8784e" stroke-width="4"/><rect x="442" y="204" width="176" height="9" rx="3" fill="#c99668"/>
   <polygon class="b-sun" points="505,366 610,366 700,560 480,560" fill="#fff3b0"/>
   <rect x="426" y="38" width="208" height="6" rx="3" fill="#8a5432"/><circle cx="426" cy="41" r="6" fill="#8a5432"/><circle cx="634" cy="41" r="6" fill="#8a5432"/>
   <g class="b-curL"><path d="M432 44 L532 44 L530 236 Q516 240 504 236 Q492 240 480 236 Q468 240 456 236 Q444 240 434 236Z" fill="url(#bCurtain)"/><path d="M456 48 V234 M480 48 V234 M504 48 V234" stroke="#c9705d" stroke-opacity=".45" stroke-width="2"/></g>
   <g class="b-curR"><path d="M528 44 L628 44 L626 236 Q614 240 602 236 Q590 240 578 236 Q566 240 554 236 Q542 240 530 236Z" fill="url(#bCurtain)"/><path d="M554 48 V234 M578 48 V234 M602 48 V234" stroke="#c9705d" stroke-opacity=".45" stroke-width="2"/></g>`),
  objG("mirror", "mirror", "cái gương", 300, 715, 82, `
   <rect x="664" y="92" width="102" height="140" rx="40" fill="#c99668"/><rect x="672" y="100" width="86" height="124" rx="34" fill="url(#bGlass)"/>
   <path d="M690 130 L716 112 M694 150 L732 122" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
   <g class="b-mShine"><path d="M740 112 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="#fff"/></g>`),
  objG("wardrobe", "wardrobe", "tủ quần áo", 362, 892, 30, `
   <ellipse cx="892" cy="362" rx="88" ry="8" fill="#000" opacity=".16" filter="url(#bSoft)"/>
   <rect x="810" y="40" width="166" height="320" rx="6" fill="#a8693e"/><rect x="804" y="36" width="178" height="12" rx="3" fill="#8a5432"/>
   <rect x="818" y="52" width="150" height="300" rx="3" fill="#6f4426"/>
   <rect x="822" y="72" width="142" height="4" rx="2" fill="#c9b7a2"/>
   <g stroke="#c9b7a2" stroke-width="2" fill="none"><path d="M846 76 l-10 8 h20z M876 76 l-10 8 h20z M906 76 l-10 8 h20z M938 76 l-10 8 h20z"/></g>
   <path d="M832 84 L860 84 L862 170 L830 170Z" fill="#f0a63c"/><path d="M892 84 L920 84 L922 160 L890 160Z" fill="#8cc08a"/><path d="M924 84 L952 84 L954 176 L922 176Z" fill="#e79a86"/>
   <g class="b-wShirt"><path d="M864 84 L888 84 L890 166 L862 166Z" fill="#6fb3d9"/><path d="M872 84 L876 98 L880 84" stroke="#4f8fb8" stroke-width="2" fill="none"/></g>
   <g fill="#e9e1d4" stroke="#c9b7a2"><rect x="830" y="300" width="56" height="14" rx="3"/><rect x="832" y="286" width="52" height="14" rx="3" fill="#7aa6c2"/><rect x="900" y="300" width="56" height="14" rx="3" fill="#f5c45a"/><rect x="902" y="286" width="52" height="14" rx="3"/></g>
   <rect x="822" y="320" width="142" height="4" fill="#5a361e"/>
   <g class="b-wDoorL"><rect x="816" y="50" width="77" height="304" rx="3" fill="url(#bWood)" stroke="#8a5432" stroke-width="2"/><rect x="826" y="62" width="57" height="280" rx="3" fill="none" stroke="#8a5432" stroke-opacity=".45" stroke-width="2"/><rect x="884" y="180" width="4" height="34" rx="2" fill="#5a361e"/></g>
   <g class="b-wDoorR"><rect x="893" y="50" width="77" height="304" rx="3" fill="url(#bWood)" stroke="#8a5432" stroke-width="2"/><rect x="903" y="62" width="57" height="280" rx="3" fill="none" stroke="#8a5432" stroke-opacity=".45" stroke-width="2"/><rect x="898" y="180" width="4" height="34" rx="2" fill="#5a361e"/></g>`),
  objG("lamp", "bedside lamp", "đèn ngủ", 363, 438, 196, `
   <rect class="hit" x="410" y="204" width="56" height="86"/>
   <ellipse class="b-glow" cx="440" cy="250" rx="90" ry="70" fill="url(#bLampG)"/>
   <ellipse cx="440" cy="287" rx="14" ry="3.5" fill="#8a5432"/><rect x="437" y="250" width="6" height="36" rx="3" fill="#c99668"/>
   <path d="M422 252 L458 252 L452 218 L428 218Z" class="b-shade" fill="#f6e3c3" stroke="#d9b98d" stroke-width="1.5"/>`),
  objG("alarmclock", "alarm clock", "đồng hồ báo thức", 364, 510, 244, `
   <rect class="hit" x="464" y="246" width="38" height="42"/>
   <g class="b-clockBody">
    <circle cx="474" cy="256" r="5" fill="#e8743b"/><circle cx="490" cy="256" r="5" fill="#e8743b"/>
    <path d="M472 286 l-3 4 M492 286 l3 4" stroke="#5a3d1f" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="482" cy="272" r="14" fill="#e8743b"/><circle cx="482" cy="272" r="10.5" fill="#fffdf9"/>
    <path d="M482 272 L482 264 M482 272 L487 274" stroke="#2d2a26" stroke-width="1.8" stroke-linecap="round"/></g>
   <g class="b-ring" stroke="#e8743b" stroke-width="2" stroke-linecap="round" fill="none"><path d="M462 260 l-6 -4 M460 270 h-7 M502 260 l6 -4 M504 270 h7"/></g>
   <circle class="b-alarmSet" cx="496" cy="284" r="3" fill="#3a9d5d"/>`),
  objG("phone", "phone", "điện thoại", 365, 668, 226, `
   <rect class="hit" x="640" y="230" width="56" height="22"/>
   <path class="b-cable" d="M660 246 Q648 262 636 270 Q628 278 625 300" stroke="#fffdf9" stroke-width="2.5" fill="none"/>
   <rect x="652" y="240" width="32" height="7" rx="2" fill="#2d2a26"/><rect x="655" y="241" width="26" height="4" rx="1" class="b-screen" fill="#3b4148"/>
   <g transform="translate(664,228)"><rect x="0" y="0" width="16" height="8" rx="1.5" fill="#fffdf9" stroke="#7a7166"/><rect x="16" y="2.5" width="2" height="3" fill="#7a7166"/>
    <rect class="b-batt" x="1.5" y="1.5" width="4" height="5" fill="#e74c3c"/><path class="b-bolt" d="M9 0.5 L6 4.5 L8.5 4.5 L7 8 L11 3.5 L8.5 3.5Z" fill="#f5c45a"/></g>`),
  objG("bed", "bed", "cái giường", 441, 265, 210, `
   <rect class="hit" x="124" y="222" width="292" height="300"/>
   <ellipse cx="270" cy="522" rx="150" ry="10" fill="#000" opacity=".18" filter="url(#bSoft)"/>
   <path d="M132 340 L132 238 Q132 220 150 220 L390 220 Q408 220 408 238 L408 340Z" fill="url(#bWood)"/>
   <path d="M150 244 Q270 226 390 244 L390 330 L150 330Z" fill="#c98f5e" opacity=".55"/>
   <rect x="130" y="500" width="10" height="22" fill="#7a4a2a"/><rect x="400" y="500" width="10" height="22" fill="#7a4a2a"/>
   <polygon points="148,332 392,332 414,476 126,476" fill="#eef3f7"/>
   <rect x="126" y="476" width="288" height="22" fill="#e0e8ee"/><rect x="122" y="496" width="296" height="12" rx="3" fill="#a8693e"/>
   <g class="b-sheetMess" stroke="#c9d6df" stroke-width="2" fill="none"><path d="M200 380 q30 10 60 -4 M300 420 q20 12 50 0 M170 450 q30 -10 60 4"/></g>`),
  `<g id="b-shirtOnBed" data-base="443"><g class="b-shirtBed"><path d="M330 446 L342 440 Q350 446 358 440 L370 446 L376 458 L366 460 L366 476 L334 476 L334 460 L324 458Z" fill="#6fb3d9" stroke="#4f8fb8" stroke-width="1.2"/></g></g>`,
  objG("pillow", "pillow", "cái gối", 442, 220, 318, `
   <g class="b-pillowBed"><rect class="hit" x="160" y="326" width="120" height="50"/>
    <ellipse cx="220" cy="366" rx="56" ry="6" fill="#000" opacity=".1"/>
    <path class="b-pillowShape" d="M168 340 Q166 330 178 330 L262 330 Q274 330 272 340 L274 360 Q274 370 262 370 L178 370 Q166 370 166 360Z" fill="#fffaf2" stroke="#e2d4c0" stroke-width="1.5"/>
    <path d="M190 348 q30 6 60 0" stroke="#efe3d0" stroke-width="2" fill="none"/>
    <g class="b-fluff" fill="#fff"><path d="M268 326 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z"/></g></g>
   <g class="b-pillowFloor"><rect class="hit" x="180" y="540" width="110" height="44"/>
    <ellipse cx="235" cy="578" rx="52" ry="7" fill="#000" opacity=".15"/>
    <path d="M190 560 Q186 548 200 548 L272 552 Q286 554 282 566 L278 576 Q274 584 262 582 L198 578 Q186 576 188 566Z" fill="#fffaf2" stroke="#e2d4c0" stroke-width="1.5" transform="rotate(-6 235 565)"/></g>`),
  objG("blanket", "blanket", "cái chăn", 443, 300, 384, `
   <g class="b-blMessy"><rect class="hit" x="140" y="380" width="270" height="120"/>
    <path d="M150 392 Q200 376 260 398 Q320 380 400 404 L414 476 L408 500 Q360 512 300 498 Q240 516 190 500 Q150 508 132 492 L136 470 Q120 440 150 392Z" fill="url(#bDuvet)"/>
    <path d="M180 420 q40 20 80 0 M260 450 q40 18 90 -4 M170 470 q30 -14 60 6" stroke="#d98f45" stroke-width="3" fill="none" stroke-linecap="round"/></g>
   <g class="b-blSpread"><rect class="hit" x="126" y="374" width="290" height="132"/>
    <polygon points="140,380 400,380 414,476 126,476" fill="url(#bDuvet)"/><rect x="126" y="476" width="288" height="26" rx="3" fill="#e9a55a"/>
    <polygon points="140,380 400,380 403,398 137,398" fill="#fffaf2"/>
    <path d="M190 400 L178 476 M270 400 L270 476 M350 400 L362 476" stroke="#f9d49c" stroke-width="3"/></g>
   <g class="b-blFolded"><rect class="hit" x="296" y="430" width="110" height="56"/>
    <rect x="300" y="452" width="104" height="14" rx="4" fill="#e9a55a"/><rect x="302" y="440" width="100" height="14" rx="4" fill="#f6c27a"/><rect x="304" y="466" width="100" height="14" rx="4" fill="#f2b45a"/></g>`),
  objG("laundry", "laundry basket", "giỏ đồ giặt", 470, 738, 408, `
   <rect class="hit" x="560" y="414" width="214" height="196"/>
   <g class="b-floorClothes"><path d="M574 600 Q566 584 586 578 Q600 568 620 576 Q642 574 640 592 Q636 606 610 604 Q590 610 574 600Z" fill="#e8a25a"/><path d="M584 590 Q604 578 628 588" stroke="#7aa6c2" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="600" cy="600" r="5" fill="#fffdf9"/></g>
   <ellipse cx="738" cy="470" rx="34" ry="6" fill="#000" opacity=".18" filter="url(#bSoft)"/>
   <g class="b-basketFull"><path d="M712 428 Q718 410 736 414 Q750 404 762 418 Q770 424 766 430Z" fill="#e8a25a"/><path d="M722 424 Q740 412 758 424" stroke="#7aa6c2" stroke-width="6" fill="none"/></g>
   <path d="M708 428 L768 428 L762 470 L714 470Z" fill="#d9b884"/>
   <g stroke="#b8935a" stroke-width="2"><path d="M710 440 H766 M712 452 H764 M713 462 H763"/><path d="M724 428 L726 470 M738 428 V470 M752 428 L750 470"/></g>
   <ellipse cx="738" cy="428" rx="31" ry="5" fill="none" stroke="#b8935a" stroke-width="3"/>`),
  objG("slippers", "slippers", "dép đi trong nhà", 575, 470, 540, `
   <g class="b-slip"><rect class="hit" x="440" y="550" width="64" height="32"/>
    <ellipse cx="470" cy="578" rx="30" ry="4" fill="#000" opacity=".15"/>
    <path d="M446 572 Q446 560 458 560 Q468 560 466 570 L464 578 Q452 580 446 572Z" fill="#8a6bb3"/><path d="M448 566 Q456 558 464 566" stroke="#fffdf9" stroke-width="5" fill="none"/>
    <path d="M474 574 Q474 562 486 562 Q496 562 494 572 L492 580 Q480 582 474 574Z" fill="#8a6bb3"/><path d="M476 568 Q484 560 492 568" stroke="#fffdf9" stroke-width="5" fill="none"/></g>`),
  ...bedroomDecor
].join("\n");

const bedroomCss = `
#room .b-curL{transform-origin:432px 0;transition:transform .7s}#room .b-curR{transform-origin:628px 0;transition:transform .7s}
#room [data-b_curtains="open"] .b-curL,#room [data-b_curtains="open"] .b-curR{transform:scaleX(.3)}
#room .b-sun{opacity:0;transition:opacity .8s;pointer-events:none}#room [data-b_curtains="open"] .b-sun{opacity:.28}
#room .b-wDoorL{transform-origin:816px 0;transition:transform .6s}#room .b-wDoorR{transform-origin:970px 0;transition:transform .6s}
#room [data-b_wardrobe="open"] .b-wDoorL,#room [data-b_wardrobe="open"] .b-wDoorR{transform:scaleX(.12)}
#room .b-wShirt{display:none}#room [data-b_shirt="wardrobe"] .b-wShirt{display:inline}
#room .b-shirtBed{display:none}#room [data-b_shirt="bed"] .b-shirtBed{display:inline}
#room .b-glow{opacity:0;transition:opacity .4s;pointer-events:none}#room [data-b_lamp="on"] .b-glow{opacity:1}#room [data-b_lamp="on"] .b-shade{fill:#fff2b8}
#room .b-ring{display:none}#room [data-b_alarm="ringing"] .b-ring{display:inline;animation:bBlink .4s steps(2) infinite}
#room [data-b_alarm="ringing"] .b-clockBody{animation:bShake .18s linear infinite;transform-origin:482px 286px}
#room .b-alarmSet{display:none}#room [data-b_alarm="set"] .b-alarmSet{display:inline}
#room .b-cable{display:none}#room [data-b_phone="charging"] .b-cable{display:inline}
#room .b-bolt{display:none}#room [data-b_phone="charging"] .b-bolt{display:inline}
#room [data-b_phone="charging"] .b-batt{fill:#f5c45a;width:9px}#room [data-b_phone="full"] .b-batt{fill:#3a9d5d;width:13px}
#room [data-b_phone="charging"] .b-screen,#room [data-b_phone="full"] .b-screen{fill:#8fd1f0}
#room .b-pillowFloor{display:none}#room [data-b_pillow="floor"] .b-pillowFloor{display:inline}
#room [data-b_pillow="floor"] .b-pillowBed,#room [data-b_pillow="hand"] .b-pillowBed,#room [data-b_pillow="hand"] .b-pillowFloor{display:none}
#room .b-fluff{opacity:0}#room [data-b_pillow="fluffed"] .b-fluff{opacity:1}#room [data-b_pillow="fluffed"] .b-pillowShape{transform:scale(1.04,1.12);transform-origin:220px 368px}
#room .b-blMessy,#room .b-blSpread,#room .b-blFolded{display:none}
#room [data-b_blanket="messy"] .b-blMessy,#room [data-b_blanket="spread"] .b-blSpread,#room [data-b_blanket="folded"] .b-blFolded{display:inline}
#room .b-sheetMess{display:none}#room [data-b_blanket="folded"] .b-sheetMess{display:inline}
#room .b-floorClothes{display:none}#room [data-b_clothes="floor"] .b-floorClothes{display:inline}
#room .b-basketFull{display:none}#room [data-b_clothes="basket"] .b-basketFull{display:inline}
#room [data-b_slippers="on"] .b-slip{opacity:0}
#room .b-mShine{opacity:0}#room .obj:hover .b-mShine{opacity:1}
#room.b-lying #char #bob{animation:none!important;transform:translate(14px,-58px) rotate(82deg)}
#room.b-lying #char .legs,#room.b-lying #char .legF,#room.b-lying #char .legB{transform:none!important;animation:none!important}#room.b-lying #char #upper{transform:none!important}
#room.b-lying #char>ellipse{opacity:0}
#room [data-detail]{pointer-events:none}#room [data-b_lying="true"] [data-detail="throw-cushion"]{opacity:0}#room .b-winPlant{opacity:0;transition:opacity .6s}#room [data-b_curtains="open"] .b-winPlant{opacity:1}
#room .b-hourH{transform-origin:380px 56px;animation:kSpin 600s linear infinite}#room .b-minH{transform-origin:380px 56px;animation:kSpin 50s linear infinite}
#room .b-fan{transform-origin:300px 18px;animation:bFan 1.2s linear infinite}
#room .b-twinkle{animation:bTw 2.4s ease-in-out infinite}#room .b-twinkle2{animation:bTw 2.4s ease-in-out -1.2s infinite}
#room .b-mist{animation:kSteam 3s ease-in-out infinite}#room .b-flicker{transform-origin:239px 126px;animation:bFl 1.6s ease-in-out infinite}
#room .b-acAir{animation:kPulse 3s ease-in-out infinite}
#room [data-b_curtains="closed"] .b-curL,#room [data-b_curtains="closed"] .b-curR{animation:bSway 6s ease-in-out infinite}#room [data-b_curtains="closed"] .b-curR{animation-delay:-3s}
@media (prefers-reduced-motion: reduce){#room [data-detail] *,#room .b-curL,#room .b-curR{animation:none!important}}
@keyframes kSpin{to{transform:rotate(360deg)}}@keyframes kSteam{50%{transform:translateY(-5px);opacity:.25}}@keyframes kPulse{50%{opacity:.6}}
@keyframes bFan{50%{transform:scaleX(.25)}}@keyframes bTw{50%{opacity:.35}}@keyframes bFl{50%{transform:scale(.85,1.1)}}
@keyframes bSway{50%{transform:skewX(.8deg)}}
@keyframes bShake{25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
@keyframes bBlink{50%{opacity:0}}
`;

const B_W0 = { b_alarm: "ringing", b_lying: false, b_pillow: "floor", b_blanket: "messy", b_wardrobe: "closed", b_shirt: "wardrobe", b_lamp: "off", b_curtains: "closed", b_clothes: "floor", b_slippers: "floor", b_phone: "low" };

const bedroom = {
  id: "bedroom", name: "Bedroom", nameVi: "Phòng ngủ",
  shellSvg: bedroomShell, worldSvg: bedroomWorld, W0: B_W0,
  spots: {
    b_bedside: { x: 535, y: 400, d: -1 }, b_bedSit: { x: 372, y: 470, d: -1 }, b_bedFoot: { x: 452, y: 505, d: -1 }, b_bedHead: { x: 425, y: 420, d: -1 },
    b_pillowFloor: { x: 310, y: 580, d: -1 }, b_curtains: { x: 590, y: 378, d: -1 }, b_mirror: { x: 712, y: 394, d: 1 }, b_phone: { x: 650, y: 394, d: -1 },
    b_wardrobe: { x: 880, y: 400, d: 1 }, b_laundry: { x: 680, y: 486, d: 1 }, b_clothes: { x: 660, y: 606, d: -1 }, b_slippers: { x: 525, y: 585, d: -1 },
    b_door: { x: 900, y: 610, d: 1 }
  },
  obstacles: [{ x1: 120, x2: 360, y1: 330, y2: 524 }, { x1: 704, x2: 772, y1: 424, y2: 474 }, { x1: 924, x2: 1000, y1: 444, y2: 510 }, { x1: 0, x2: 84, y1: 598, y2: 640 }],
  entry: { x: 880, y: 600, d: -1 },
  objects: {
    bed: { en: "bed", vi: "cái giường", ipa: "/bed/", acts: ["lie_down", "sit_on_bed", "get_out_of_bed", "make_bed"] },
    pillow: { en: "pillow", vi: "cái gối", ipa: "/ˈpɪl.əʊ/", acts: ["pick_up_pillow", "fluff_pillow"] },
    blanket: { en: "blanket", vi: "cái chăn", ipa: "/ˈblæŋ.kɪt/", acts: ["fold_blanket", "spread_blanket", "make_bed"] },
    wardrobe: { en: "wardrobe", vi: "tủ quần áo", ipa: "/ˈwɔː.drəʊb/", acts: ["open_wardrobe", "take_out_shirt", "hang_up_shirt", "close_wardrobe"] },
    alarmclock: { en: "alarm clock", vi: "đồng hồ báo thức", ipa: "/əˈlɑːm klɒk/", acts: ["turn_off_alarm", "set_alarm"] },
    lamp: { en: "bedside lamp", vi: "đèn ngủ", ipa: "/ˈbed.saɪd læmp/", acts: ["turn_on_lamp", "read_in_bed", "turn_off_lamp"] },
    curtains: { en: "curtains", vi: "rèm cửa", ipa: "/ˈkɜː.tənz/", acts: ["open_curtains", "look_out_window", "close_curtains"] },
    laundry: { en: "laundry basket", vi: "giỏ đồ giặt", ipa: "/ˈlɔːn.dri ˌbɑː.skɪt/", acts: ["pick_up_clothes", "empty_basket"] },
    mirror: { en: "mirror", vi: "cái gương", ipa: "/ˈmɪr.ər/", acts: ["look_in_mirror", "brush_hair"] },
    slippers: { en: "slippers", vi: "dép đi trong nhà", ipa: "/ˈslɪp.əz/", acts: ["put_on_slippers", "take_off_slippers"] },
    phone: { en: "phone", vi: "điện thoại", ipa: "/fəʊn/", acts: ["charge_phone", "unplug_charger", "check_phone"] }
  },
  actions: bedroomActions,
  props: B_PROPS,
  applyState(W, root) {
    mirrorState(W, B_W0, root);
    const svg = root.ownerSVGElement || root.closest && root.closest("svg");
    if (svg) svg.classList.toggle("b-lying", !!W.b_lying && !!W.sitting);
    const p = root.querySelector("#o-pillow"); if (p) p.dataset.base = W.b_pillow === "floor" ? 578 : 442;
  },
  css: bedroomCss,
  catalog: cat("b_", [
    ["bed", "/bed/", "cái giường", "furniture"], ["pillow", "/ˈpɪl.əʊ/", "cái gối", "bedding"], ["bedsheet", "/ˈbed.ʃiːt/", "ga trải giường", "bedding"],
    ["blanket", "/ˈblæŋ.kɪt/", "cái chăn", "bedding"], ["duvet", "/ˈduː.veɪ/", "chăn lông, chăn bông", "bedding"], ["mattress", "/ˈmæt.rəs/", "cái nệm", "bedding"],
    ["headboard", "/ˈhed.bɔːd/", "đầu giường", "furniture"], ["bedside table", "/ˈbed.saɪd ˌteɪ.bəl/", "tủ đầu giường", "furniture"], ["alarm clock", "/əˈlɑːm klɒk/", "đồng hồ báo thức", "electronics"],
    ["wardrobe", "/ˈwɔː.drəʊb/", "tủ quần áo", "furniture"], ["hanger", "/ˈhæŋ.ər/", "cái móc áo", "storage"], ["dresser", "/ˈdres.ər/", "tủ ngăn kéo", "furniture"],
    ["mirror", "/ˈmɪr.ər/", "cái gương", "furniture"], ["bedside lamp", "/ˈbed.saɪd læmp/", "đèn ngủ", "lighting"], ["ceiling light", "/ˈsiː.lɪŋ laɪt/", "đèn trần", "lighting"],
    ["curtains", "/ˈkɜː.tənz/", "rèm cửa", "decor"], ["window", "/ˈwɪn.dəʊ/", "cửa sổ", "room"], ["rug", "/rʌɡ/", "tấm thảm", "decor"],
    ["slippers", "/ˈslɪp.əz/", "dép đi trong nhà", "clothing"], ["laundry basket", "/ˈlɔːn.dri ˌbɑː.skɪt/", "giỏ đựng đồ giặt", "storage"], ["T-shirt", "/ˈtiː.ʃɜːt/", "áo phông", "clothing"],
    ["trousers", "/ˈtraʊ.zəz/", "quần dài", "clothing"], ["socks", "/sɒks/", "đôi tất", "clothing"], ["shoes", "/ʃuːz/", "đôi giày", "clothing"],
    ["pajamas", "/pəˈdʒɑː.məz/", "bộ đồ ngủ", "clothing"], ["watch", "/wɒtʃ/", "đồng hồ đeo tay", "accessory"], ["phone", "/fəʊn/", "điện thoại", "electronics"],
    ["charger", "/ˈtʃɑː.dʒər/", "cái sạc", "electronics"], ["power outlet", "/ˈpaʊər ˌaʊt.let/", "ổ cắm điện", "electronics"], ["book", "/bʊk/", "quyển sách", "personal"],
    ["notebook", "/ˈnəʊt.bʊk/", "quyển vở", "personal"], ["pen", "/pen/", "cái bút", "personal"], ["water bottle", "/ˈwɔː.tə ˌbɒt.əl/", "bình nước", "personal"],
    ["tissue box", "/ˈtɪʃ.uː bɒks/", "hộp khăn giấy", "personal"], ["wastebasket", "/ˈweɪstˌbɑː.skɪt/", "sọt rác", "storage"], ["fan", "/fæn/", "cái quạt", "electronics"],
    ["air conditioner", "/ˈeə kənˌdɪʃ.ən.ər/", "máy điều hoà", "electronics"], ["wall clock", "/ˈwɔːl klɒk/", "đồng hồ treo tường", "decor"], ["photo frame", "/ˈfəʊ.təʊ freɪm/", "khung ảnh", "decor"],
    ["jewelry box", "/ˈdʒuː.əl.ri bɒks/", "hộp trang sức", "accessory"], ["backpack", "/ˈbæk.pæk/", "ba lô", "accessory"], ["suitcase", "/ˈsuːt.keɪs/", "va li", "storage"],
    ["storage box", "/ˈstɔː.rɪdʒ bɒks/", "hộp đựng đồ", "storage"], ["shelf", "/ʃelf/", "cái kệ", "furniture"], ["perfume bottle", "/ˈpɜː.fjuːm ˌbɒt.əl/", "lọ nước hoa", "personal"],
    ["hairbrush", "/ˈheə.brʌʃ/", "lược chải tóc (bàn chải)", "personal"], ["comb", "/kəʊm/", "cái lược", "personal"], ["hair dryer", "/ˈheə ˌdraɪ.ər/", "máy sấy tóc", "electronics"],
    ["full-length mirror", "/ˌfʊl.leŋθ ˈmɪr.ər/", "gương soi toàn thân", "furniture"], ["humidifier", "/hjuːˈmɪd.ɪ.faɪ.ər/", "máy tạo độ ẩm", "electronics"], ["sleep mask", "/ˈsliːp mɑːsk/", "bịt mắt ngủ", "accessory"],
    ["earplugs", "/ˈɪə.plʌɡz/", "nút bịt tai", "accessory"], ["reading glasses", "/ˈriː.dɪŋ ˌɡlɑː.sɪz/", "kính đọc sách", "accessory"], ["shoe rack", "/ˈʃuː ræk/", "kệ giày", "storage"]
  ])
};

const LIVING = cat("l_", [
  ["sofa", "/ˈsəʊ.fə/", "ghế sofa", "furniture"], ["armchair", "/ˈɑːm.tʃeər/", "ghế bành", "furniture"], ["coffee table", "/ˈkɒf.i ˌteɪ.bəl/", "bàn uống nước", "furniture"],
  ["TV", "/ˌtiːˈviː/", "ti vi", "electronics"], ["remote control", "/rɪˌməʊt kənˈtrəʊl/", "điều khiển từ xa", "electronics"], ["rug", "/rʌɡ/", "tấm thảm", "decor"],
  ["floor lamp", "/ˈflɔː læmp/", "đèn cây (đèn đứng)", "lighting"], ["ceiling light", "/ˈsiː.lɪŋ laɪt/", "đèn trần", "lighting"], ["curtains", "/ˈkɜː.tənz/", "rèm cửa", "decor"],
  ["window", "/ˈwɪn.dəʊ/", "cửa sổ", "room"], ["bookshelf", "/ˈbʊk.ʃelf/", "giá sách", "furniture"], ["books", "/bʊks/", "những quyển sách", "personal"],
  ["wall clock", "/ˈwɔːl klɒk/", "đồng hồ treo tường", "decor"], ["picture frame", "/ˈpɪk.tʃə freɪm/", "khung tranh", "decor"], ["houseplant", "/ˈhaʊs.plɑːnt/", "cây cảnh trong nhà", "decor"],
  ["cushion", "/ˈkʊʃ.ən/", "gối tựa", "decor"], ["blanket", "/ˈblæŋ.kɪt/", "cái chăn", "decor"], ["side table", "/ˈsaɪd ˌteɪ.bəl/", "bàn nhỏ cạnh ghế", "furniture"],
  ["speaker", "/ˈspiː.kər/", "cái loa", "electronics"], ["air conditioner", "/ˈeə kənˌdɪʃ.ən.ər/", "máy điều hoà", "electronics"], ["ceiling fan", "/ˈsiː.lɪŋ fæn/", "quạt trần", "electronics"],
  ["TV stand", "/ˌtiːˈviː stænd/", "kệ ti vi", "furniture"], ["fireplace", "/ˈfaɪə.pleɪs/", "lò sưởi", "room"], ["vase", "/vɑːz/", "lọ hoa", "decor"],
  ["flowers", "/ˈflaʊ.əz/", "những bông hoa", "decor"], ["candle", "/ˈkæn.dəl/", "cây nến", "decor"], ["magazine", "/ˌmæɡ.əˈziːn/", "tạp chí", "personal"],
  ["newspaper", "/ˈnjuːzˌpeɪ.pər/", "tờ báo", "personal"], ["light switch", "/ˈlaɪt swɪtʃ/", "công tắc đèn", "electronics"], ["power socket", "/ˈpaʊə ˌsɒk.ɪt/", "ổ cắm điện", "electronics"],
  ["extension cord", "/ɪkˈsten.ʃən kɔːd/", "dây nối dài (ổ điện kéo dài)", "electronics"], ["door", "/dɔːr/", "cánh cửa", "room"], ["doormat", "/ˈdɔː.mæt/", "thảm chùi chân", "decor"],
  ["shoe cabinet", "/ˈʃuː ˌkæb.ɪ.nət/", "tủ giày", "storage"], ["coat rack", "/ˈkəʊt ræk/", "giá treo áo khoác", "storage"], ["umbrella stand", "/ʌmˈbrel.ə stænd/", "ống cắm ô", "storage"],
  ["mirror", "/ˈmɪr.ər/", "cái gương", "decor"], ["wallpaper", "/ˈwɔːlˌpeɪ.pər/", "giấy dán tường", "room"], ["carpet", "/ˈkɑː.pɪt/", "thảm trải sàn", "decor"],
  ["floor", "/flɔːr/", "sàn nhà", "room"], ["ceiling", "/ˈsiː.lɪŋ/", "trần nhà", "room"], ["wall", "/wɔːl/", "bức tường", "room"],
  ["footstool", "/ˈfʊt.stuːl/", "ghế kê chân", "furniture"], ["beanbag", "/ˈbiːn.bæɡ/", "ghế lười", "furniture"], ["game console", "/ˈɡeɪm ˌkɒn.səʊl/", "máy chơi game", "electronics"],
  ["headphones", "/ˈhed.fəʊnz/", "tai nghe", "electronics"], ["laptop", "/ˈlæp.tɒp/", "máy tính xách tay", "electronics"], ["router", "/ˈruː.tər/", "bộ phát wifi", "electronics"],
  ["air purifier", "/ˈeə ˌpjʊə.rɪ.faɪ.ər/", "máy lọc không khí", "electronics"], ["heater", "/ˈhiː.tər/", "máy sưởi", "electronics"], ["photo album", "/ˈfəʊ.təʊ ˌæl.bəm/", "album ảnh", "personal"],
  ["board game", "/ˈbɔːd ɡeɪm/", "trò chơi cờ bàn", "personal"], ["tissue box", "/ˈtɪʃ.uː bɒks/", "hộp khăn giấy", "personal"], ["coaster", "/ˈkəʊ.stər/", "miếng lót cốc", "decor"],
  ["tray", "/treɪ/", "cái khay", "decor"], ["fruit bowl", "/ˈfruːt bəʊl/", "đĩa (bát) đựng hoa quả", "decor"], ["sideboard", "/ˈsaɪd.bɔːd/", "tủ búp phê", "furniture"],
  ["display cabinet", "/dɪˈspleɪ ˌkæb.ɪ.nət/", "tủ trưng bày", "furniture"], ["recliner", "/rɪˈklaɪ.nər/", "ghế ngả lưng", "furniture"], ["rocking chair", "/ˈrɒk.ɪŋ tʃeər/", "ghế bập bênh", "furniture"]
]);

const ROOMS = { kitchen, bedroom };
if (typeof window !== "undefined") { window.ELW_ROOMS = ROOMS; window.ELW_ROOMS_CATALOG_LIVING = LIVING; }
if (typeof module !== "undefined" && module.exports) module.exports = { ELW_ROOMS: ROOMS, ELW_ROOMS_CATALOG_LIVING: LIVING };
})();
