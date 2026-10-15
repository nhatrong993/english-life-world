/* English Life World — Topic "Quán cà phê / At the coffee shop" (room id "cafe", prefix cf_)
   Browser script, load AFTER rooms2.js / details.js. Same room format as rooms2.js:
     window.ELW_ROOMS = Object.assign(window.ELW_ROOMS || {}, { cafe })
   Also exposes window.ELW_CAFE = { topic, rooms, missions, reply, npcs }.
   Realistic flow: read menu → order → (size / to go) → pay → (receipt) → wait → pick up
                   → milk / sugar / lid → find a seat → drink → clean up → goodbye.
   Prerequisite chains are kept ≤ 3 deep (the app's auto-fix limit): actions that need the drink
   point at "Pay by card" and pick the drink up inline in their own seq. */
(function () {
"use strict";

const mkAct = (V) => (id, obj, label, labelVi, sentence, vi, key, vk, grammar, chunks, disc, patterns, pre, rawSeq, story, sitOk) => {
  const vocab = vk.map(k => { if (!V[k]) throw new Error("vocab " + k); return V[k]; });
  const words = vocab.map(v => [v[0], v[1], v[3] || "n", v[2]]);
  const seq = (W, ctx) => {
    const steps = rawSeq(W || { ...CF_W0 });
    if (ctx || typeof document === "undefined") {
      for (const s of steps) {
        if (s[0] === "set") {
          if (ctx && typeof ctx.set === "function") ctx.set(s[1], s[2]);
          if (W) W[s[1]] = s[2];
        } else if (s[0] === "walk") {
          if (ctx && typeof ctx.walk === "function") ctx.walk(s[1]);
          if (ctx && typeof ctx.moveTo === "function") ctx.moveTo(s[1]);
        } else if (s[0] === "pose") {
          if (ctx && typeof ctx.pose === "function") ctx.pose(s[1], s[2]);
        } else if (s[0] === "wait") {
          if (ctx && typeof ctx.wait === "function") ctx.wait(s[1]);
        } else if (s[0] === "sit" && W) {
          W.sitting = true;
        } else if (s[0] === "stand" && W) {
          W.sitting = false;
        }
      }
    }
    return steps;
  };
  const done = W => {
    const steps = rawSeq({ ...CF_W0 });
    const finalSets = new Map();
    for (const s of steps) if (s[0] === "set") finalSets.set(s[1], s[2]);
    const allEntries = [...finalSets.entries()];
    const diff = allEntries.filter(([k, v]) => CF_W0[k] !== v);
    const target = diff.length ? diff : allEntries;
    if (target.length) return target.every(([k, v]) => W && W[k] === v);
    if (steps.some(s => s[0] === "sit")) return !!(W && W.sitting);
    return true;
  };
  return {
    id, obj, label, labelVi, sentence, vi, key,
    vocab, words,
    grammar, chunks, disc: { ans: disc[0], opts: disc.slice() }, patterns,
    pre, seq, done, sitOk: !!sitOk, story
  };
};
const objG = (id, en, vi, base, tagX, tagY, inner, extra) =>
  `<g class="obj" id="o-${id}" data-obj="${id}" data-base="${base}" tabindex="0" aria-label="${en}, ${vi}"${extra || ""}><g class="vec">${inner}</g><text class="tag" x="${tagX}" y="${tagY}" text-anchor="middle">${en} · ${vi}</text></g>`;
const mirrorState = (W, W0, root) => { for (const k of Object.keys(W0)) root.setAttribute("data-" + k, String(W[k])); };
const cat = (prefix, rows) => rows.map(([en, ipa, vi, category]) => ({ id: prefix + en.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, ""), en, vi, ipa, category }));
const D = (name, inner, base) => `<g data-detail="${name}"${base ? ` data-base="${base}"` : ""}>${inner}</g>`;

/* ---------- vocabulary ---------- */
const CFV = {
  menu: ["menu", "/ˈmen.juː/", "thực đơn"], read: ["read", "/riːd/", "đọc"], price: ["price", "/praɪs/", "giá tiền"],
  hello: ["hello", "/həˈləʊ/", "xin chào"], barista: ["barista", "/bəˈriː.stə/", "nhân viên pha chế"],
  canihave: ["Can I have …?", "/kæn aɪ hæv/", "Cho tôi … được không?"], latte: ["latte", "/ˈlɑː.teɪ/", "cà phê sữa kiểu Ý (latte)"],
  please: ["please", "/pliːz/", "làm ơn, vui lòng"], medium: ["medium", "/ˈmiː.di.əm/", "cỡ vừa"], size: ["size", "/saɪz/", "cỡ, kích cỡ"],
  large: ["large", "/lɑːdʒ/", "cỡ lớn"], small: ["small", "/smɔːl/", "cỡ nhỏ"], togo: ["to go", "/tə ɡəʊ/", "mang đi"],
  takeaway: ["takeaway", "/ˈteɪk.ə.weɪ/", "mang đi (Anh-Anh)"], pay: ["pay", "/peɪ/", "trả tiền"], card: ["card", "/kɑːd/", "thẻ ngân hàng"],
  cash: ["cash", "/kæʃ/", "tiền mặt"], change: ["change", "/tʃeɪndʒ/", "tiền thối lại"], receipt: ["receipt", "/rɪˈsiːt/", "hoá đơn, biên lai"],
  wait: ["wait", "/weɪt/", "chờ, đợi"], order: ["order", "/ˈɔː.dər/", "món đã gọi; gọi món"], pickup: ["pick up", "/pɪk ʌp/", "lấy, nhận"],
  drink: ["drink", "/drɪŋk/", "đồ uống; uống"], sugar: ["sugar", "/ˈʃʊɡ.ər/", "đường"], milk: ["milk", "/mɪlk/", "sữa"],
  lid: ["lid", "/lɪd/", "nắp"], cup: ["cup", "/kʌp/", "cốc, ly"], seat: ["seat", "/siːt/", "chỗ ngồi"], find: ["find", "/faɪnd/", "tìm"],
  window: ["window", "/ˈwɪn.dəʊ/", "cửa sổ"], wifi: ["Wi-Fi", "/ˈwaɪ.faɪ/", "mạng Wi-Fi"], password: ["password", "/ˈpɑːs.wɜːd/", "mật khẩu"],
  coffee: ["coffee", "/ˈkɒf.i/", "cà phê"], hot: ["hot", "/hɒt/", "nóng"], croissant: ["croissant", "/ˈkwæs.ɒ̃/", "bánh sừng bò"],
  buy: ["buy", "/baɪ/", "mua"], eat: ["eat", "/iːt/", "ăn"], clean: ["clean", "/kliːn/", "lau sạch"], table: ["table", "/ˈteɪ.bəl/", "cái bàn"],
  throwaway: ["throw away", "/θrəʊ əˈweɪ/", "vứt đi"], bin: ["recycling bin", "/riːˈsaɪ.klɪŋ bɪn/", "thùng rác tái chế"],
  goodbye: ["goodbye", "/ɡʊdˈbaɪ/", "tạm biệt"], thanks: ["thanks", "/θæŋks/", "cảm ơn"], niceday: ["Have a nice day!", "/hæv ə naɪs deɪ/", "Chúc một ngày tốt lành!"],
  canIget: ["Can I get …?", "/kæn aɪ ɡet/", "Cho tôi … được không?"], couldi: ["Could I …?", "/kʊd aɪ/", "Tôi có thể … không? (lịch sự)"], idlike: ["I'd like …", "/aɪd laɪk/", "Tôi muốn … (lịch sự)"],
  americano: ["americano", "/əˌmer.ɪˈkɑː.nəʊ/", "cà phê americano"], cappuccino: ["cappuccino", "/ˌkæp.əˈtʃiː.nəʊ/", "cà phê cappuccino"], flatwhite: ["flat white", "/ˌflæt ˈwaɪt/", "cà phê flat white"],
  mocha: ["mocha", "/ˈmɒk.ə/", "cà phê mocha (có sô-cô-la)"], matcha: ["matcha", "/ˈmætʃ.ə/", "bột trà xanh matcha"], hotchoc: ["hot chocolate", "/ˌhɒt ˈtʃɒk.lət/", "sô-cô-la nóng"],
  espresso: ["espresso", "/eˈspres.əʊ/", "cà phê espresso"], tea: ["tea", "/tiː/", "trà"], lemonade: ["lemonade", "/ˌlem.əˈneɪd/", "nước chanh"], smoothie: ["smoothie", "/ˈsmuː.ði/", "sinh tố"],
  mango: ["mango", "/ˈmæŋ.ɡəʊ/", "quả xoài"], iced: ["iced", "/aɪst/", "có đá, lạnh"], ice: ["ice", "/aɪs/", "đá viên"], oat: ["oat milk", "/ˈəʊt mɪlk/", "sữa yến mạch"], soy: ["soy milk", "/ˈsɔɪ mɪlk/", "sữa đậu nành"],
  instead: ["instead", "/ɪnˈsted/", "thay vào đó"], shot: ["shot", "/ʃɒt/", "một phần espresso"], extra: ["extra", "/ˈek.strə/", "thêm"], less: ["less", "/les/", "ít hơn"],
  cream: ["whipped cream", "/wɪpt kriːm/", "kem tươi đánh bông"], ontop: ["on top", "/ɒn tɒp/", "ở bên trên"], recommend: ["recommend", "/ˌrek.əˈmend/", "gợi ý, giới thiệu"],
  caffeine: ["caffeine", "/ˈkæf.iːn/", "chất caffeine"], decaf: ["decaf", "/ˈdiː.kæf/", "cà phê khử caffeine"], doyouhave: ["Do you have …?", "/duː juː hæv/", "Bạn có … không?"],
  forhere: ["for here", "/fər hɪər/", "dùng tại quán"], name: ["name", "/neɪm/", "tên"], spell: ["spell", "/spel/", "đánh vần"], phone: ["phone", "/fəʊn/", "điện thoại"],
  loyalty: ["loyalty card", "/ˈlɔɪ.əl.ti kɑːd/", "thẻ tích điểm"], stamp: ["stamp", "/stæmp/", "con dấu; đóng dấu"], tip: ["tip", "/tɪp/", "tiền boa"], jar: ["jar", "/dʒɑː/", "cái hũ"],
  howmuch: ["How much …?", "/haʊ mʌtʃ/", "… bao nhiêu tiền?"], straw: ["straw", "/strɔː/", "ống hút"], napkin: ["napkin", "/ˈnæp.kɪn/", "khăn giấy"], grab: ["grab", "/ɡræb/", "lấy nhanh"],
  refill: ["refill", "/ˈriː.fɪl/", "rót thêm, ly thêm"], mine: ["mine", "/maɪn/", "của tôi"], photo: ["photo", "/ˈfəʊ.təʊ/", "bức ảnh"], latteart: ["latte art", "/ˈlɑː.teɪ ɑːt/", "hình vẽ bọt sữa"],
  charge: ["charge", "/tʃɑːdʒ/", "sạc (pin)"], outlet: ["outlet", "/ˈaʊt.let/", "ổ cắm điện"], unplug: ["unplug", "/ʌnˈplʌɡ/", "rút phích cắm"],
  outside: ["outside", "/ˌaʊtˈsaɪd/", "bên ngoài"], terrace: ["terrace", "/ˈter.əs/", "sân hiên"], borrow: ["borrow", "/ˈbɒr.əʊ/", "mượn"], book: ["book", "/bʊk/", "quyển sách"],
  putback: ["put back", "/pʊt bæk/", "để lại chỗ cũ"], shelf: ["shelf", "/ʃelf/", "kệ, giá"], umbrella: ["umbrella", "/ʌmˈbrel.ə/", "cái ô"], leave: ["leave", "/liːv/", "để lại"],
  forget: ["forget", "/fəˈɡet/", "quên"], line: ["line", "/laɪn/", "hàng (người xếp hàng)"], queue: ["queue", "/kjuː/", "hàng chờ (Anh-Anh)"], bottle: ["bottle", "/ˈbɒt.əl/", "cái chai"],
  water: ["water", "/ˈwɔː.tər/", "nước"], juice: ["juice", "/dʒuːs/", "nước ép"], muffin: ["muffin", "/ˈmʌf.ɪn/", "bánh nướng xốp"], slice: ["slice", "/slaɪs/", "miếng, lát"],
  cheesecake: ["cheesecake", "/ˈtʃiːz.keɪk/", "bánh phô mai"], bananabread: ["banana bread", "/bəˈnɑː.nə bred/", "bánh chuối nướng"], try: ["try", "/traɪ/", "thử"],
  heat: ["heat up", "/hiːt ʌp/", "hâm nóng"], warm: ["warm", "/wɔːm/", "ấm"], good: ["so good", "/səʊ ɡʊd/", "ngon quá, tuyệt quá"], restroom: ["restroom", "/ˈrest.ruːm/", "nhà vệ sinh"],
  connect: ["connect", "/kəˈnekt/", "kết nối"], deadline: ["deadline", "/ˈded.laɪn/", "hạn chót"], laptop: ["laptop", "/ˈlæp.tɒp/", "máy tính xách tay"], work: ["work on", "/wɜːk ɒn/", "làm (việc gì)"],
  glass: ["glass", "/ɡlɑːs/", "cái ly (thuỷ tinh)"], box: ["box", "/bɒks/", "cái hộp"], takehome: ["take home", "/teɪk həʊm/", "mang về nhà"], close: ["close", "/kləʊz/", "đóng cửa"], time: ["time", "/taɪm/", "giờ, thời gian"],
  seasonal: ["seasonal", "/ˈsiː.zən.əl/", "theo mùa", "adj"], chilly: ["chilly", "/ˈtʃɪl.i/", "se lạnh", "adj"], cinnamon: ["cinnamon", "/ˈsɪn.ə.mən/", "quế", "n"],
  healthy: ["healthy", "/ˈhel.θi/", "tốt cho sức khỏe", "adj"], pouring: ["pouring rain", "/ˈpɔː.rɪŋ reɪn/", "mưa tầm tã", "n"], cozy: ["cozy", "/ˈkəʊ.zi/", "ấm cúng, dễ chịu", "adj"],
  playlist: ["playlist", "/ˈpleɪ.lɪst/", "danh sách nhạc", "n"], relaxing: ["relaxing", "/rɪˈlæk.sɪŋ/", "thư giãn", "adj"], almond: ["almond milk", "/ˈɑː.mənd mɪlk/", "sữa hạnh nhân", "n"],
  stomach: ["stomach", "/ˈstʌm.ək/", "dạ dày, bụng", "n"], freezing: ["freezing", "/ˈfriː.zɪŋ/", "lạnh cóng", "adj"], separately: ["separately", "/ˈsep.ər.ət.li/", "riêng biệt", "adv"],
  creamy: ["creamy", "/ˈkriː.mi/", "béo mịn", "adj"], steam: ["steam", "/stiːm/", "đánh nóng bằng hơi nước", "v"], aroma: ["aroma", "/əˈrəʊ.mə/", "hương thơm", "n"],
  beans: ["coffee beans", "/ˈkɒf.i biːnz/", "hạt cà phê", "n"], tray: ["cup tray", "/kʌp treɪ/", "khay đựng cốc", "n"], carry: ["carry", "/ˈkær.i/", "bê, mang", "v"],
  cloudy: ["cloudy", "/ˈklaʊ.di/", "nhiều mây", "adj"], wonderful: ["wonderful", "/ˈwʌn.də.fəl/", "tuyệt vời", "adj"], allergic: ["allergic", "/əˈlɜː.dʒɪk/", "bị dị ứng", "adj"],
  peanut: ["peanut", "/ˈpiː.nʌt/", "đậu phộng", "n"], bagel: ["bagel", "/ˈbeɪ.ɡəl/", "bánh mì vòng", "n"], toasted: ["toasted", "/ˈtəʊ.stɪd/", "nướng giòn", "adj"],
  sleeve: ["cup sleeve", "/kʌp sliːv/", "vòng giấy cách nhiệt", "n"], boiling: ["boiling hot", "/ˈbɔɪ.lɪŋ hɒt/", "nóng bỏng", "adj"], thermos: ["thermos", "/ˈθɜː.məs/", "bình giữ nhiệt", "n"],
  reusable: ["reusable", "/ˌriːˈjuː.zə.bəl/", "tái sử dụng", "adj"], sprinkle: ["sprinkle", "/ˈsprɪŋ.kəl/", "rắc nhẹ", "v"], fragrant: ["fragrant", "/ˈfreɪ.ɡrənt/", "thơm lừng", "adj"],
  honey: ["honey", "/ˈhʌn.i/", "mật ong", "n"], throat: ["sore throat", "/sɔː θrəʊt/", "đau họng", "n"], spill: ["spill", "/spɪl/", "làm đổ, làm sánh", "v"],
  stirrer: ["wooden stirrer", "/ˈwʊd.ən ˈstɜː.rər/", "que khuấy gỗ", "n"], friendly: ["friendly", "/ˈfrend.li/", "thân thiện", "adj"], coins: ["spare coins", "/speər kɔɪnz/", "tiền xu lẻ", "n"],
  redeem: ["redeem", "/rɪˈdiːm/", "đổi điểm thưởng", "v"], rush: ["in a rush", "/ɪn ə rʌʃ/", "đang vội", "phr"], ahead: ["go ahead", "/ɡəʊ əˈhed/", "lên trước, cứ tự nhiên", "phr"],
  humid: ["humid", "/ˈhjuː.mɪd/", "oi bức, ẩm ướt", "adj"], sparkling: ["sparkling water", "/ˈspɑː.klɪŋ ˈwɔː.tər/", "nước khoáng có ga", "n"], ingredients: ["ingredients", "/ɪnˈɡriː.di.ənts/", "thành phần", "n"],
  ginger: ["ginger", "/ˈdʒɪn.dʒər/", "gừng", "n"], magazine: ["magazine", "/ˌmæɡ.əˈziːn/", "tạp chí", "n"], raindrops: ["raindrops", "/ˈreɪn.drɒps/", "những hạt mưa", "n"],
  charger: ["charger", "/ˈtʃɑː.dʒər/", "bộ sạc", "n"], battery: ["battery", "/ˈbæt.ər.i/", "pin", "n"], journal: ["journal", "/ˈdʒɜː.nəl/", "sổ nhật ký", "n"],
  quiet: ["quiet", "/ˈkwaɪ.ət/", "yên tĩnh", "adj"], sunny: ["sunny", "/ˈsʌn.i/", "nắng đẹp", "adj"], breeze: ["breeze", "/briːz/", "làn gió nhẹ", "n"],
  reconnect: ["reconnect", "/ˌriː.kəˈnekt/", "kết nối lại", "v"], separate: ["separate", "/ˈsep.ə.reɪt/", "tách riêng, phân loại", "v"]
};
const cfA = mkAct(CFV);

/* inline helpers */
const PAID = W => W.cf_paid !== "no";
// pick the drink up inside another action's seq (keeps auto-fix chains short)
const getDrink = W => W.cf_drink !== "none" ? [] : [
  ...(W.sitting ? [["stand"]] : []),
  ...(W.cf_order !== "ready" ? [["walk", "cf_pickup"], ["wait", 900], ["set", "cf_order", "ready"]] : [["walk", "cf_pickup"]]),
  ["pose", "reach", 400], ["set", "cf_order", "picked"], ["set", "cf_drink", "full"], ["pose", "idle", 1]];
const needDrink = W => !PAID(W) ? "Bạn chưa có đồ uống. Hãy trả tiền trước (Pay by card)." :
  (W.cf_drink === "empty" || W.cf_drink === "trash") ? "Cốc đã uống hết rồi." : null;
const SEAT_SPOT = { window: "cf_window", terrace: "cf_terrace", table: "cf_table" };
const goSeat = W => W.cf_seat !== "none" && !W.sitting ? [["walk", SEAT_SPOT[W.cf_seat] || "cf_table"], ["sit"]] : [];
// sit somewhere (table if no seat chosen yet) — used by actions that make sense sitting down
const ensureSeat = W => W.sitting ? [] : W.cf_seat !== "none" ? goSeat(W) : [["walk", "cf_table"], ["set", "cf_seat", "table"], ["sit"]];
// one order = a fresh set of options (size, milk, extras…)
const ORDER_RESET = [["set", "cf_order", "ordered"], ["set", "cf_size", "medium"], ["set", "cf_paid", "no"], ["set", "cf_drink", "none"], ["set", "cf_togo", "here"],
  ["set", "cf_milk", "no"], ["set", "cf_sugar", "no"], ["set", "cf_lid", "no"], ["set", "cf_receipt", "no"], ["set", "cf_milktype", "regular"], ["set", "cf_shot", "no"],
  ["set", "cf_sweet", "normal"], ["set", "cf_cream", "no"], ["set", "cf_forhere", "no"], ["set", "cf_name", "no"], ["set", "cf_asked", "no"], ["set", "cf_stamp", "no"],
  ["set", "cf_tip", "no"], ["set", "cf_straw", "no"], ["set", "cf_refill", "no"], ["set", "cf_mine", "no"], ["set", "cf_photo", "no"]];
const orderSeq = (item, temp, extra) => W => [["walk", "cf_counter"], ["pose", "point", 700], ...ORDER_RESET, ["set", "cf_item", item], ["set", "cf_temp", temp], ...(extra || []), ["pose", "idle", 1]];
const orderPre = item => W => {
  if (W.cf_order !== "none" && W.cf_drink !== "empty" && W.cf_drink !== "trash") {
    if (PAID(W)) return "Bạn đã gọi đồ uống rồi.";
    if (W.cf_item === item) return "Bạn đã gọi món này rồi.";
  }
  return null;
};
const notOrdered = W => W.cf_order === "none" ? "Bạn chưa gọi đồ. Hãy gọi đồ trước (Order a latte)." : null;
const modPre = (k, v, msg) => W => notOrdered(W) || (W[k] === v ? msg : null) || (PAID(W) ? "Bạn đã trả tiền rồi." : null);
const at = (spot, pz, ms, sets) => W => [["walk", spot], ["pose", pz, ms], ...sets.map(s => ["set", s[0], s[1]]), ["pose", "idle", 1]];
const once = (k, v, msg) => W => W[k] === v ? msg : null;
const hasSnack = W => W.cf_snack === "bought" || W.cf_croissant === "bought";
const needSnack = W => hasSnack(W) ? null : "Bạn chưa có bánh. Hãy mua bánh trước (Buy a muffin).";

const cafeActions = [
  cfA("greet_barista", "barista", "Say hello", "Chào nhân viên", "Hi! Good morning.", "Chào bạn! Chào buổi sáng.", ["Hi", "morning"], ["hello", "barista"],
    "Chào hỏi lịch sự khi tới quầy: <b>Hi!</b> / <b>Good morning.</b> / <b>Hello there.</b>", ["Hi!", "Good morning."], ["morning", "mourning", "moving"],
    ["Hi! Good <b>afternoon</b>.", "Hello! <b>How are you?</b>"],
    W => W.cf_greet === "yes" ? "Bạn đã chào nhân viên rồi." : null,
    W => [["walk", "cf_counter"], ["pose", "point", 500], ["set", "cf_greet", "yes"], ["pose", "idle", 1]],
    ["say hello to the barista", "say hi to the barista at the counter", "chào nhân viên pha chế"]),
  cfA("read_the_menu", "menuboard", "Read the menu", "Đọc thực đơn", "I'm reading the menu.", "Tôi đang đọc thực đơn.", ["reading", "menu"], ["read", "menu", "price"],
    "<b>menu</b> đọc /ˈmen.juː/. Hỏi thêm: <b>What do you recommend?</b> (Bạn gợi ý món gì?)", ["I'm reading", "the menu."], ["menu", "many", "money"],
    ["I'm reading <b>the prices</b>.", "I'm looking at <b>the menu board</b>."],
    W => W.cf_menu === "read" ? "Bạn đã đọc thực đơn rồi." : null,
    W => [["walk", "cf_menu"], ["pose", "read", 1600], ["set", "cf_menu", "read"], ["pose", "idle", 1]],
    ["read the menu", "read the menu on the board", "đọc thực đơn trên bảng"]),
  cfA("order_a_latte", "cashregister", "Order a latte", "Gọi một ly latte", "Can I have a medium latte, please?", "Cho tôi một ly latte cỡ vừa nhé.", ["Can", "have", "latte"], ["canihave", "latte", "medium", "please"],
    "Gọi món lịch sự: <b>Can I have</b> + món + <b>, please?</b> Có thể nói <b>I'd like</b> a latte, please.", ["Can I have", "a medium latte, please?"], ["latte", "later", "lady"],
    ["Can I have <b>a cappuccino</b>, please?", "Can I have <b>an iced tea</b>, please?"],
    orderPre("latte"), orderSeq("latte", "hot"),
    ["order a latte", "order a medium latte at the counter", "gọi một ly latte"]),
  cfA("choose_size", "cashregister", "Choose a large size", "Chọn cỡ lớn", "Actually, can I get a large one?", "À, cho tôi cỡ lớn được không?", ["large", "one"], ["size", "large", "small"],
    "Cỡ đồ uống: <b>small</b> – <b>medium</b> – <b>large</b>. Dùng <b>one</b> thay cho danh từ đã nói: a large <b>one</b> = a large latte.", ["Actually,", "can I get a large one?"], ["large", "launch", "lodge"],
    ["Can I get a <b>small</b> one?", "<b>Medium</b>, please."],
    W => W.cf_order === "none" ? "Bạn chưa gọi đồ. Hãy gọi đồ trước (Order a latte)." : W.cf_size === "large" ? "Bạn đã chọn cỡ lớn rồi." : PAID(W) ? "Bạn đã trả tiền rồi." : null,
    W => [["walk", "cf_counter"], ["pose", "point", 600], ["set", "cf_size", "large"], ["pose", "idle", 1]],
    ["choose a large size", "change my latte to a large one", "chọn cỡ lớn"]),
  cfA("ask_for_takeaway", "cashregister", "Ask for it to go", "Xin mang đi", "Can I get it to go, please?", "Cho tôi mang đi nhé.", ["get", "to", "go"], ["togo", "takeaway", "please"],
    "<b>to go</b> (Anh-Mỹ) = <b>takeaway</b> (Anh-Anh) = mang đi. Uống tại quán: <b>for here</b>.", ["Can I get it", "to go, please?"], ["go", "goal", "glow"],
    ["Is it <b>for here</b> or <b>to go</b>?", "<b>Takeaway</b>, please."],
    W => W.cf_order === "none" ? "Bạn chưa gọi đồ. Hãy gọi đồ trước (Order a latte)." : W.cf_togo === "togo" ? "Bạn đã xin mang đi rồi." : W.cf_order === "picked" ? "Bạn đã nhận đồ uống rồi." : null,
    W => [["walk", "cf_counter"], ["pose", "point", 600], ["set", "cf_togo", "togo"], ["pose", "idle", 1]],
    ["ask for it to go", "ask for my latte to go", "xin mang đồ uống đi"]),
  cfA("pay_by_card", "cashregister", "Pay by card", "Trả bằng thẻ", "Can I pay by card?", "Tôi trả bằng thẻ được không?", ["pay", "card"], ["pay", "card"],
    "<b>pay by card</b> (trả bằng thẻ) nhưng <b>pay in cash</b> (trả tiền mặt). Chạm thẻ: <b>tap my card</b>.", ["Can I", "pay by card?"], ["card", "cart", "cold"],
    ["Can I pay <b>with my phone</b>?", "Can I pay <b>in cash</b>?"],
    W => W.cf_order === "none" ? "Bạn chưa gọi đồ. Hãy gọi đồ trước (Order a latte)." : PAID(W) ? "Bạn đã trả tiền rồi." : null,
    W => [["walk", "cf_register"], ["spawn", "cf_card"], ["pose", "reach", 900], ["despawn"], ["set", "cf_paid", "card"], ["pose", "idle", 1]],
    ["pay by card", "tap my card on the card reader", "trả tiền bằng thẻ"]),
  cfA("pay_in_cash", "cashregister", "Pay in cash", "Trả tiền mặt", "Here you are. I'll pay in cash.", "Tiền đây ạ. Tôi trả bằng tiền mặt.", ["pay", "cash"], ["pay", "cash", "change"],
    "<b>Here you are.</b> = Của bạn đây (khi đưa tiền/đồ). Nhận tiền thừa: <b>Keep the change.</b> = Không cần thối.", ["Here you are.", "I'll pay in cash."], ["cash", "catch", "cast"],
    ["<b>Keep the change.</b>", "Here's <b>five dollars</b>."],
    W => W.cf_order === "none" ? "Bạn chưa gọi đồ. Hãy gọi đồ trước (Order a latte)." : PAID(W) ? "Bạn đã trả tiền rồi." : null,
    W => [["walk", "cf_register"], ["spawn", "cf_cash"], ["pose", "reach", 900], ["despawn"], ["set", "cf_paid", "cash"], ["pose", "idle", 1]],
    ["pay in cash", "pay for my latte in cash", "trả bằng tiền mặt"]),
  cfA("take_the_receipt", "cashregister", "Take the receipt", "Lấy hoá đơn", "Can I have the receipt, please?", "Cho tôi xin hoá đơn nhé.", ["receipt"], ["receipt", "please"],
    "<b>receipt</b> đọc /rɪˈsiːt/ — chữ <b>p</b> câm!", ["Can I have", "the receipt, please?"], ["receipt", "recipe", "receive"],
    ["Can I have <b>a bag</b>, please?", "Can I have <b>a napkin</b>, please?"],
    W => !PAID(W) ? "Chưa có hoá đơn. Hãy trả tiền trước (Pay by card)." : W.cf_receipt === "yes" ? "Bạn đã lấy hoá đơn rồi." : null,
    W => [["walk", "cf_register"], ["pose", "reach", 500], ["spawn", "cf_receiptP"], ["wait", 500], ["despawn"], ["set", "cf_receipt", "yes"], ["pose", "idle", 1]],
    ["take the receipt", "take the receipt from the barista", "lấy hoá đơn"]),
  cfA("wait_for_order", "espressomachine", "Wait for my order", "Chờ đồ uống", "I'm waiting for my latte.", "Tôi đang chờ ly latte của mình.", ["waiting", "latte"], ["wait", "order"],
    "<b>wait for</b> + thứ đang chờ: I'm waiting <b>for</b> my latte (không bỏ <b>for</b>).", ["I'm waiting", "for my latte."], ["wait", "weight", "white"],
    ["I'm waiting <b>for my friend</b>.", "I'm waiting <b>for the bus</b>."],
    W => !PAID(W) ? "Hãy trả tiền trước (Pay by card)." : W.cf_order === "ready" || W.cf_order === "picked" ? "Đồ uống của bạn đã xong rồi." : null,
    W => [["walk", "cf_pickup"], ["wait", 1600], ["set", "cf_order", "ready"], ["pose", "idle", 1]],
    ["wait for my order", "wait for my latte at the pickup counter", "chờ đồ uống"]),
  cfA("pick_up_drink", "espressomachine", "Pick up my drink", "Nhận đồ uống", "Thank you! I'm picking up my latte.", "Cảm ơn! Tôi đang nhận ly latte.", ["picking", "up", "latte"], ["pickup", "drink", "thanks"],
    "<b>pick up</b> = nhận, lấy (đồ đã gọi). Nhân viên gọi tên bạn: <b>A latte for Nam!</b>", ["Thank you!", "I'm picking up my latte."], ["pick", "peak", "pack"],
    ["I'm picking up <b>my order</b>.", "I'm picking up <b>my sandwich</b>."],
    W => !PAID(W) ? "Hãy trả tiền trước (Pay by card)." : W.cf_drink !== "none" ? "Bạn đã nhận đồ uống rồi." : null,
    W => [...getDrink(W)],
    ["pick up my drink", "pick up my latte at the counter", "nhận đồ uống"]),
  cfA("add_milk", "condiments", "Add some milk", "Thêm sữa", "I'm adding some milk to my coffee.", "Tôi đang thêm chút sữa vào cà phê.", ["adding", "milk"], ["milk", "coffee"],
    "<b>milk</b> không đếm được: <b>some</b> milk, <b>a little</b> milk (không nói “a milk”).", ["I'm adding some milk", "to my coffee."], ["milk", "mill", "melt"],
    ["I'm adding <b>some honey</b> to my tea.", "I'm adding <b>a little cream</b>."],
    W => needDrink(W) || (W.cf_milk === "yes" ? "Bạn đã thêm sữa rồi." : W.cf_lid === "yes" ? "Cốc đã đậy nắp rồi." : null),
    W => [...getDrink(W), ["walk", "cf_station"], ["pose", "pour", 1000], ["set", "cf_milk", "yes"], ["pose", "idle", 1]],
    ["add some milk", "add some milk to my coffee", "thêm sữa vào cà phê"]),
  cfA("add_sugar", "condiments", "Add sugar", "Thêm đường", "I'm adding a little sugar.", "Tôi đang thêm một chút đường.", ["adding", "sugar"], ["sugar", "coffee"],
    "<b>sugar</b> đọc /ˈʃʊɡ.ər/ (âm “sh”). Hỏi: <b>Where's the sugar?</b>", ["I'm adding", "a little sugar."], ["sugar", "soccer", "shooter"],
    ["I'm adding <b>two sugars</b>.", "<b>No sugar</b>, thanks."],
    W => needDrink(W) || (W.cf_sugar === "yes" ? "Bạn đã thêm đường rồi." : W.cf_lid === "yes" ? "Cốc đã đậy nắp rồi." : null),
    W => [...getDrink(W), ["walk", "cf_station"], ["pose", "pour", 900], ["set", "cf_sugar", "yes"], ["pose", "idle", 1]],
    ["add sugar", "add a little sugar to my coffee", "thêm đường"]),
  cfA("put_on_lid", "cupstack", "Put on a lid", "Đậy nắp cốc", "I'm putting a lid on my cup.", "Tôi đang đậy nắp lên cốc.", ["putting", "lid", "cup"], ["lid", "cup", "hot"],
    "<b>put a lid on</b> + cốc = đậy nắp. An toàn: đồ uống nóng mang đi nên đậy nắp.", ["I'm putting a lid", "on my cup."], ["lid", "lead", "lit"],
    ["I'm putting <b>a sleeve</b> on my cup.", "I'm putting <b>a straw</b> in my drink."],
    W => needDrink(W) || (W.cf_lid === "yes" ? "Cốc đã có nắp rồi." : null),
    W => [...getDrink(W), ["walk", "cf_cups"], ["pose", "reach", 800], ["set", "cf_lid", "yes"], ["pose", "idle", 1]],
    ["put on a lid", "put a lid on my hot cup", "đậy nắp cốc"]),
  cfA("find_a_seat", "cafetable", "Find a seat", "Tìm chỗ ngồi", "Is this seat free?", "Chỗ này còn trống không?", ["seat", "free"], ["find", "seat", "table"],
    "Hỏi chỗ trống: <b>Is this seat free?</b> / <b>Is anyone sitting here?</b> free ở đây = còn trống.", ["Is this seat", "free?"], ["seat", "sit", "set"],
    ["Is this <b>table</b> free?", "Can I <b>sit here</b>?"],
    W => W.cf_seat === "table" && W.sitting ? "Bạn đang ngồi ở bàn rồi." : null,
    W => [["walk", "cf_table"], ["set", "cf_seat", "table"], ["sit"], ["wait", 400]],
    ["find a seat", "find a free seat at a table", "tìm chỗ ngồi"]),
  cfA("sit_by_window", "windowseat", "Sit by the window", "Ngồi cạnh cửa sổ", "I'm sitting by the window.", "Tôi đang ngồi cạnh cửa sổ.", ["sitting", "window"], ["seat", "window"],
    "<b>by the window</b> = cạnh cửa sổ. sit → si<b>tt</b>ing (gấp đôi t).", ["I'm sitting", "by the window."], ["window", "widow", "winter"],
    ["I'm sitting <b>by the door</b>.", "I'm sitting <b>near the counter</b>."],
    W => W.cf_seat === "window" && W.sitting ? "Bạn đang ngồi cạnh cửa sổ rồi." : null,
    W => [["walk", "cf_window"], ["set", "cf_seat", "window"], ["sit"], ["wait", 400]],
    ["sit by the window", "sit at the window seat", "ngồi cạnh cửa sổ"]),
  cfA("ask_wifi_password", "wifisign", "Ask for the Wi-Fi password", "Hỏi mật khẩu Wi-Fi", "Excuse me, what's the Wi-Fi password?", "Xin lỗi, mật khẩu Wi-Fi là gì vậy?", ["Wi-Fi", "password"], ["wifi", "password"],
    "<b>Excuse me</b> để gây chú ý lịch sự. <b>What's</b> = What is. Wi-Fi đọc /ˈwaɪ.faɪ/.", ["Excuse me,", "what's the Wi-Fi password?"], ["password", "passport", "pass word"],
    ["Excuse me, where's <b>the restroom</b>?", "Excuse me, <b>do you have</b> Wi-Fi?"],
    W => W.cf_wifi === "yes" ? "Bạn đã có mật khẩu Wi-Fi rồi." : null,
    W => [["walk", "cf_counter"], ["pose", "point", 800], ["set", "cf_wifi", "yes"], ["pose", "idle", 1]],
    ["ask for the Wi-Fi password", "ask the barista for the Wi-Fi password", "hỏi mật khẩu Wi-Fi"]),
  cfA("drink_coffee_cafe", "cafetable", "Drink my latte", "Uống latte", "Mmm, this latte is delicious!", "Ừm, ly latte này ngon quá!", ["latte", "delicious"], ["drink", "coffee", "hot"],
    "Khen đồ ăn uống: <b>This is delicious!</b> / <b>It's really good.</b>", ["Mmm,", "this latte is delicious!"], ["delicious", "delicate", "dangerous"],
    ["This <b>cake</b> is delicious!", "This coffee is <b>too hot</b>!"],
    W => needDrink(W),
    W => [...getDrink(W), ...goSeat(W), ["pose", "drink", 1800], ["set", "cf_drink", "empty"], ["pose", "idle", 1]],
    ["drink my latte", "drink my latte slowly", "uống ly latte"], true),
  cfA("buy_a_croissant", "pastrycase", "Buy a croissant", "Mua bánh sừng bò", "Can I have a croissant, too?", "Cho tôi thêm một cái bánh sừng bò nhé.", ["croissant", "too"], ["buy", "croissant", "canihave"],
    "<b>too</b> ở cuối câu = cũng, thêm. croissant đọc kiểu Anh /ˈkwæs.ɒ̃/ hoặc kiểu Mỹ /krəˈsɑːnt/.", ["Can I have", "a croissant, too?"], ["croissant", "crescent", "constant"],
    ["Can I have <b>a muffin</b>, too?", "Can I have <b>a cookie</b>, please?"],
    W => W.cf_croissant !== "none" && W.cf_croissant !== "eaten" ? "Bạn đã mua bánh rồi." : null,
    W => [["walk", "cf_pastry"], ["pose", "point", 600], ["spawn", "cf_croissantP"], ["pose", "reach", 500], ["despawn"], ["set", "cf_croissant", "bought"], ["pose", "idle", 1]],
    ["buy a croissant", "buy a warm croissant", "mua bánh sừng bò"]),
  cfA("eat_croissant", "pastrycase", "Eat my croissant", "Ăn bánh sừng bò", "I'm eating my croissant.", "Tôi đang ăn bánh sừng bò.", ["eating", "croissant"], ["eat", "croissant"],
    "eat → eat<b>ing</b>. Ăn kèm đồ uống: a croissant <b>with</b> my latte.", ["I'm eating", "my croissant."], ["eat", "it", "heat"],
    ["I'm eating <b>a muffin</b>.", "I'm eating <b>a sandwich</b>."],
    W => W.cf_croissant === "eaten" ? "Bạn đã ăn bánh rồi." : W.cf_croissant !== "bought" ? "Bạn chưa có bánh. Hãy mua bánh trước (Buy a croissant)." : null,
    W => [...goSeat(W), ["spawn", "cf_croissantP"], ["pose", "drink", 1600], ["despawn"], ["set", "cf_croissant", "eaten"], ["set", "cf_tablemess", "crumbs"], ["pose", "idle", 1]],
    ["eat my croissant", "eat my croissant at the table", "ăn bánh sừng bò"], true),
  cfA("clean_your_table", "cafetable", "Clean my table", "Lau bàn", "I'm cleaning my table.", "Tôi đang lau bàn của mình.", ["cleaning", "table"], ["clean", "table"],
    "Thói quen lịch sự ở quán: lau bàn, dọn cốc trước khi đi. clean → clean<b>ing</b>.", ["I'm cleaning", "my table."], ["table", "cable", "label"],
    ["I'm cleaning <b>the counter</b>.", "I'm <b>wiping</b> my table."],
    W => W.cf_tablemess === "clean" ? "Bàn đã sạch rồi." : null,
    W => [["walk", SEAT_SPOT[W.cf_seat] || "cf_table"], ["pose", "wipe", 1300], ["set", "cf_tablemess", "clean"], ["pose", "idle", 1]],
    ["clean my table", "clean my table before I leave", "lau bàn"]),
  cfA("throw_away_cup", "recyclingbin", "Throw away my cup", "Vứt cốc vào thùng rác", "I'm throwing away my cup.", "Tôi đang vứt cốc vào thùng rác.", ["throwing", "away", "cup"], ["throwaway", "cup", "bin"],
    "<b>throw away</b> = vứt đi. Phân loại rác: cốc giấy vào <b>recycling</b> (tái chế), thức ăn thừa vào <b>trash</b>.", ["I'm throwing away", "my cup."], ["throw", "throat", "through"],
    ["I'm throwing away <b>the napkin</b>.", "I'm <b>recycling</b> my cup."],
    W => W.cf_drink === "trash" ? "Bạn đã vứt cốc rồi." : W.cf_drink !== "empty" ? "Cốc vẫn còn đồ uống. Hãy uống hết trước (Drink my latte)." : null,
    W => [...(W.sitting ? [["stand"]] : []), ["walk", "cf_bin"], ["pose", "bend", 600], ["set", "cf_drink", "trash"], ["pose", "idle", 1]],
    ["throw away my cup", "throw my empty cup in the recycling bin", "vứt cốc vào thùng rác"]),
  cfA("say_goodbye", "barista", "Say goodbye", "Chào tạm biệt", "Thanks! Bye! Have a nice day!", "Cảm ơn! Tạm biệt! Chúc một ngày tốt lành!", ["Thanks", "Bye", "nice", "day"], ["goodbye", "thanks", "niceday"],
    "Rời quán: <b>Thanks! Bye!</b> Đáp lại lời chúc: <b>You too!</b> (Bạn cũng vậy!)", ["Thanks! Bye!", "Have a nice day!"], ["bye", "buy", "boy"],
    ["Thanks! <b>See you tomorrow!</b>", "Have a <b>great weekend</b>!"],
    W => W.cf_bye === "yes" ? "Bạn đã chào tạm biệt rồi." : null,
    W => [...(W.sitting ? [["stand"]] : []), ["walk", "cf_counter"], ["pose", "point", 700], ["set", "cf_bye", "yes"], ["walk", "cf_door"], ["pose", "idle", 1]],
    ["say goodbye", "say thank you and goodbye to the barista", "chào tạm biệt nhân viên"]),

  /* ===== v2: real menu ===== */
  cfA("order_iced_americano", "menuboard", "Order an iced americano", "Gọi americano đá sữa yến mạch", "Can I get an iced americano with oat milk?", "Cho mình một ly americano đá với sữa yến mạch nhé?", ["iced", "americano", "oat milk"], ["canIget", "iced", "americano", "oat"],
    "<b>Can I get …?</b> là cách gọi món rất tự nhiên. <b>iced</b> = có đá; <b>with oat milk</b> = với sữa yến mạch.", ["Can I get an iced americano", "with oat milk?"], ["iced", "ice", "eyes"],
    ["Can I get an iced <b>latte</b> with oat milk?", "Can I get <b>a hot americano</b>, please?"],
    orderPre("americano"), orderSeq("americano", "iced", [["set", "cf_milktype", "oat"]]),
    ["order an iced americano with oat milk", "order an iced americano with oat milk at the counter", "gọi americano đá sữa yến mạch"]),
  cfA("order_cappuccino", "menuboard", "Order a cappuccino", "Gọi cappuccino", "Could I get a cappuccino, please?", "Cho mình một ly cappuccino nhé.", ["Could", "cappuccino"], ["couldi", "cappuccino", "please"],
    "<b>Could I get …?</b> lịch sự hơn <b>Can I get …?</b>. cappuccino đọc /ˌkæp.əˈtʃiː.nəʊ/ (âm “chi”).", ["Could I get", "a cappuccino, please?"], ["cappuccino", "cappuccinos", "capital"],
    ["Could I get <b>a small cappuccino</b>, please?", "Could I get <b>two cappuccinos</b>, please?"],
    orderPre("cappuccino"), orderSeq("cappuccino", "hot"),
    ["order a cappuccino", "order a hot cappuccino", "gọi cappuccino"]),
  cfA("order_flat_white", "menuboard", "Order a flat white", "Gọi flat white", "I'd like a flat white, please.", "Cho mình một ly flat white nhé.", ["I'd like", "flat white"], ["idlike", "flatwhite"],
    "<b>I'd like</b> = I would like: gọi món lịch sự mà vẫn tự nhiên. <b>flat white</b> = espresso với sữa nóng mịn, ít bọt hơn latte.", ["I'd like", "a flat white, please."], ["white", "wide", "what"],
    ["I'd like <b>a large flat white</b>, please.", "I'd like <b>a cup of tea</b>, please."],
    orderPre("flat_white"), orderSeq("flat_white", "hot"),
    ["order a flat white", "order a smooth flat white", "gọi flat white"]),
  cfA("order_mocha", "menuboard", "Order a mocha", "Gọi mocha kem tươi", "Can I get a mocha with whipped cream?", "Cho mình một ly mocha có kem tươi nhé?", ["mocha", "whipped cream"], ["canIget", "mocha", "cream"],
    "<b>mocha</b> = cà phê + sô-cô-la. <b>whipped cream</b> /wɪpt kriːm/ = kem tươi đánh bông (chữ <b>h</b> không đọc).", ["Can I get a mocha", "with whipped cream?"], ["whipped", "wiped", "whip"],
    ["Can I get a mocha <b>without</b> whipped cream?", "Can I get <b>a hot chocolate</b> with whipped cream?"],
    orderPre("mocha"), orderSeq("mocha", "hot", [["set", "cf_cream", "yes"]]),
    ["order a mocha with whipped cream", "order a mocha with whipped cream on top", "gọi mocha kem tươi"]),
  cfA("order_matcha_latte", "menuboard", "Order an iced matcha latte", "Gọi matcha latte đá", "Could I have an iced matcha latte?", "Cho mình một ly matcha latte đá được không?", ["iced", "matcha"], ["couldi", "matcha", "iced"],
    "<b>Could I have …?</b> = lịch sự. <b>matcha</b> = bột trà xanh Nhật. Đồ uống lạnh: thêm <b>iced</b> phía trước.", ["Could I have", "an iced matcha latte?"], ["matcha", "match", "matter"],
    ["Could I have a <b>hot</b> matcha latte?", "Could I have <b>a green tea</b>?"],
    orderPre("matcha"), orderSeq("matcha", "iced"),
    ["order an iced matcha latte", "order an iced matcha latte at the counter", "gọi matcha latte đá"]),
  cfA("order_hot_chocolate", "menuboard", "Order a hot chocolate", "Gọi sô-cô-la nóng", "Can I get a hot chocolate, please?", "Cho mình một ly sô-cô-la nóng nhé.", ["hot chocolate"], ["canIget", "hotchoc"],
    "<b>hot chocolate</b> /ˌhɒt ˈtʃɒk.lət/ — âm <b>o</b> ở giữa gần như không đọc: CHOK-lət. Không có caffeine nhiều như cà phê.", ["Can I get", "a hot chocolate, please?"], ["chocolate", "chocolates", "collect"],
    ["Can I get a hot chocolate <b>with marshmallows</b>?", "Can I get <b>a small</b> hot chocolate?"],
    orderPre("hot_chocolate"), orderSeq("hot_chocolate", "hot"),
    ["order a hot chocolate", "order a warm hot chocolate", "gọi sô-cô-la nóng"]),
  cfA("order_espresso", "menuboard", "Order an espresso", "Gọi espresso", "Just an espresso for me, please.", "Cho mình một ly espresso thôi nhé.", ["espresso"], ["espresso", "please"],
    "<b>Just … for me</b> = cho tôi … thôi. espresso đọc /eˈspres.əʊ/ — không có âm “x” (không nói “ex-presso”).", ["Just an espresso", "for me, please."], ["espresso", "express", "expresso"],
    ["Just <b>a double espresso</b> for me, please.", "Just <b>a black coffee</b> for me, please."],
    orderPre("espresso"), orderSeq("espresso", "hot"),
    ["order an espresso", "order a quick espresso", "gọi espresso"]),
  cfA("order_iced_tea", "menuboard", "Order an iced tea", "Gọi trà đá", "I'll have an iced tea, please.", "Cho mình một ly trà đá nhé.", ["I'll have", "iced tea"], ["iced", "tea"],
    "<b>I'll have …</b> = Tôi lấy … (quyết định ngay lúc gọi món). Rất hay dùng ở quán.", ["I'll have", "an iced tea, please."], ["tea", "tee", "tie"],
    ["I'll have a <b>peach</b> iced tea, please.", "I'll have <b>a lemonade</b>, please."],
    orderPre("iced_tea"), orderSeq("iced_tea", "iced"),
    ["order an iced tea", "order a cold iced tea", "gọi trà đá"]),
  cfA("order_lemonade", "menuboard", "Order a lemonade", "Gọi nước chanh", "Could I get a lemonade with no ice?", "Cho mình một ly nước chanh không đá nhé?", ["lemonade", "no ice"], ["couldi", "lemonade", "ice"],
    "<b>with no ice</b> = không đá; <b>with less ice</b> = ít đá. lemonade /ˌlem.əˈneɪd/ nhấn âm cuối.", ["Could I get a lemonade", "with no ice?"], ["lemonade", "lemons", "lemony"],
    ["Could I get a lemonade <b>with less ice</b>?", "Could I get <b>an iced tea</b> with no ice?"],
    orderPre("lemonade"), orderSeq("lemonade", "cold"),
    ["order a lemonade", "order a lemonade with no ice", "gọi nước chanh không đá"]),
  cfA("order_smoothie", "menuboard", "Order a mango smoothie", "Gọi sinh tố xoài", "I'll have a mango smoothie, please.", "Cho mình một ly sinh tố xoài nhé.", ["mango smoothie"], ["smoothie", "mango"],
    "<b>smoothie</b> /ˈsmuː.ði/ = sinh tố. Âm <b>th</b> ở đây là /ð/ — đặt nhẹ đầu lưỡi giữa hai răng.", ["I'll have", "a mango smoothie, please."], ["smoothie", "smoothly", "smooth"],
    ["I'll have a <b>strawberry</b> smoothie, please.", "I'll have a mango smoothie <b>to go</b>."],
    orderPre("smoothie"), orderSeq("smoothie", "cold"),
    ["order a mango smoothie", "order a cold mango smoothie", "gọi sinh tố xoài"]),
  cfA("ask_recommendation", "menuboard", "Ask what's good", "Hỏi món gợi ý", "What do you recommend?", "Bạn gợi ý món nào?", ["recommend"], ["recommend"],
    "Chưa biết chọn gì? Hỏi <b>What do you recommend?</b> hoặc <b>What's popular here?</b> (Món nào được gọi nhiều?)", ["What do you", "recommend?"], ["recommend", "remember", "recommit"],
    ["What's <b>popular</b> here?", "What's <b>your favorite</b>?"],
    once("cf_rec", "yes", "Bạn đã hỏi món gợi ý rồi."), at("cf_counter", "point", 700, [["cf_rec", "yes"]]),
    ["ask what the barista recommends", "ask the barista what's good here", "hỏi món gợi ý"]),
  cfA("ask_no_caffeine", "menuboard", "Ask for something caffeine-free", "Hỏi món không caffeine", "Do you have anything without caffeine?", "Quán có món nào không có caffeine không?", ["without", "caffeine"], ["doyouhave", "caffeine", "decaf"],
    "<b>anything</b> trong câu hỏi = món nào đó. <b>decaf</b> = cà phê đã khử caffeine — vẫn có vị cà phê.", ["Do you have anything", "without caffeine?"], ["caffeine", "coffee", "captain"],
    ["Do you have <b>decaf</b>?", "Do you have anything <b>without sugar</b>?"],
    once("cf_decaf", "yes", "Bạn đã hỏi về đồ uống không caffeine rồi."), at("cf_counter", "point", 700, [["cf_decaf", "yes"]]),
    ["ask for something without caffeine", "ask if they have anything without caffeine", "hỏi món không caffeine"]),

  /* ===== v2: customise the order ===== */
  cfA("choose_small", "cafecounter", "Make it a small", "Đổi sang cỡ nhỏ", "Actually, could I make it a small?", "À, cho mình đổi sang cỡ nhỏ được không?", ["small"], ["small", "size"],
    "<b>make it a small</b> = đổi thành cỡ nhỏ. <b>Actually</b> ở đầu câu = à, thật ra (đổi ý nhẹ nhàng).", ["Actually,", "could I make it a small?"], ["small", "smell", "smile"],
    ["Could I make it <b>a large</b>?", "Could I make it <b>iced</b>?"],
    modPre("cf_size", "small", "Bạn đã chọn cỡ nhỏ rồi."), at("cf_counter", "point", 600, [["cf_size", "small"]]),
    ["make it a small", "change my drink to a small", "đổi sang cỡ nhỏ"]),
  cfA("make_it_iced", "cafecounter", "Make it iced", "Làm đồ uống đá", "Could you make it iced, please?", "Bạn làm đá giúp mình được không?", ["iced"], ["iced", "please"],
    "<b>Could you …?</b> = nhờ ai làm gì một cách lịch sự. <b>make it iced</b> = làm thành đồ uống đá.", ["Could you make it", "iced, please?"], ["iced", "nice", "ice"],
    ["Could you make it <b>extra hot</b>, please?", "Could you make it <b>a bit sweeter</b>?"],
    modPre("cf_temp", "iced", "Đồ uống của bạn đã là loại đá rồi."), at("cf_counter", "point", 600, [["cf_temp", "iced"]]),
    ["make it iced", "ask the barista to make it iced", "làm đồ uống đá"]),
  cfA("switch_oat_milk", "cafecounter", "Switch to oat milk", "Đổi sang sữa yến mạch", "Can I have that with oat milk?", "Cho mình dùng sữa yến mạch nhé?", ["oat milk"], ["oat", "milk"],
    "<b>with</b> + loại sữa: with <b>oat</b> milk (yến mạch), with <b>soy</b> milk (đậu nành), with <b>almond</b> milk (hạnh nhân).", ["Can I have that", "with oat milk?"], ["oat", "out", "oak"],
    ["Can I have that with <b>almond</b> milk?", "Can I have that with <b>skim</b> milk?"],
    modPre("cf_milktype", "oat", "Bạn đã chọn sữa yến mạch rồi."), at("cf_counter", "point", 600, [["cf_milktype", "oat"]]),
    ["switch to oat milk", "ask for oat milk in my drink", "đổi sang sữa yến mạch"]),
  cfA("switch_soy_milk", "cafecounter", "Switch to soy milk", "Đổi sang sữa đậu nành", "Could I get soy milk instead?", "Cho mình đổi sang sữa đậu nành được không?", ["soy", "instead"], ["soy", "instead"],
    "<b>instead</b> ở cuối câu = thay vào đó. Nhiều quán tính thêm tiền cho sữa thực vật (+$0.50).", ["Could I get", "soy milk instead?"], ["soy", "sigh", "see"],
    ["Could I get <b>oat milk</b> instead?", "Could I get <b>a tea</b> instead?"],
    modPre("cf_milktype", "soy", "Bạn đã chọn sữa đậu nành rồi."), at("cf_counter", "point", 600, [["cf_milktype", "soy"]]),
    ["switch to soy milk", "ask for soy milk instead", "đổi sang sữa đậu nành"]),
  cfA("add_extra_shot", "cafecounter", "Add an extra shot", "Thêm một shot espresso", "Can you add an extra shot?", "Bạn thêm một shot espresso nữa giúp mình nhé?", ["extra shot"], ["shot", "extra"],
    "<b>an extra shot</b> = thêm một phần espresso (đậm hơn, tỉnh hơn). <b>a double</b> = hai shot.", ["Can you add", "an extra shot?"], ["shot", "short", "shut"],
    ["Can you add <b>an extra pump of vanilla</b>?", "Can you <b>make it a double</b>?"],
    modPre("cf_shot", "yes", "Bạn đã thêm shot rồi."), at("cf_counter", "point", 600, [["cf_shot", "yes"]]),
    ["add an extra shot", "add an extra shot of espresso", "thêm một shot espresso"]),
  cfA("ask_less_sugar", "cafecounter", "Ask for less sugar", "Xin ít đường", "Could I have that with less sugar?", "Cho mình ít đường thôi được không?", ["less sugar"], ["less", "sugar"],
    "<b>less</b> + danh từ không đếm được = ít … hơn: less sugar, less ice. Không đường: <b>no sugar</b>.", ["Could I have that", "with less sugar?"], ["less", "lace", "lass"],
    ["Could I have that with <b>less ice</b>?", "Could I have that with <b>no sugar</b>?"],
    modPre("cf_sweet", "less", "Bạn đã xin ít đường rồi."), at("cf_counter", "point", 600, [["cf_sweet", "less"]]),
    ["ask for less sugar", "ask for my drink with less sugar", "xin ít đường"]),
  cfA("add_whipped_cream", "cafecounter", "Add whipped cream", "Thêm kem tươi", "Can I get whipped cream on top?", "Cho mình thêm kem tươi bên trên nhé?", ["whipped cream", "top"], ["cream", "ontop"],
    "<b>on top</b> = ở trên cùng. Từ chối lịch sự: <b>No whipped cream, thanks.</b>", ["Can I get", "whipped cream on top?"], ["top", "tap", "tub"],
    ["Can I get <b>cinnamon</b> on top?", "Can I get <b>caramel sauce</b> on top?"],
    modPre("cf_cream", "yes", "Bạn đã thêm kem tươi rồi."), at("cf_counter", "point", 600, [["cf_cream", "yes"]]),
    ["add whipped cream", "get whipped cream on top of my drink", "thêm kem tươi"]),
  cfA("say_for_here", "cafecounter", "Say it's for here", "Nói dùng tại quán", "It's for here, thanks.", "Mình dùng ở đây nhé, cảm ơn.", ["for here"], ["forhere", "thanks"],
    "Nhân viên hỏi <b>For here or to go?</b> → đáp <b>For here, thanks.</b> (dùng tại quán) hoặc <b>To go, please.</b>", ["It's for here,", "thanks."], ["here", "hair", "hire"],
    ["It's <b>to go</b>, thanks.", "It's for here, <b>please</b>."],
    W => notOrdered(W) || (W.cf_forhere === "yes" ? "Bạn đã nói dùng tại quán rồi." : W.cf_order === "picked" ? "Bạn đã nhận đồ uống rồi." : null),
    at("cf_counter", "point", 600, [["cf_togo", "here"], ["cf_forhere", "yes"]]),
    ["say it's for here", "tell the barista it's for here", "nói dùng tại quán"]),
  cfA("give_my_name", "barista", "Give my name", "Cho biết tên", "Sure, it's Lan. L-A-N.", "Dạ, mình tên Lan. L-A-N.", ["Lan"], ["name", "spell"],
    "Quán thường ghi tên lên cốc: <b>Can I get a name for that?</b> → <b>It's Lan.</b> Đánh vần tên để tránh nhầm.", ["Sure, it's Lan.", "L-A-N."], ["Lan", "land", "lane"],
    ["Sure, it's <b>Minh</b>. M-I-N-H.", "<b>It's for Mai.</b>"],
    W => notOrdered(W) || (W.cf_name === "yes" ? "Bạn đã cho biết tên rồi." : null), at("cf_counter", "point", 600, [["cf_name", "yes"]]),
    ["give my name for the order", "give my name and spell it for the cup", "cho biết tên"]),

  /* ===== v2: paying ===== */
  cfA("pay_with_phone", "cashregister", "Pay with my phone", "Trả bằng điện thoại", "Can I pay with my phone?", "Mình trả bằng điện thoại được không?", ["pay", "phone"], ["pay", "phone"],
    "<b>pay with my phone</b> = trả bằng điện thoại. Nhớ giới từ: pay <b>with</b> my phone / pay <b>by</b> card / pay <b>in</b> cash.", ["Can I pay", "with my phone?"], ["phone", "fun", "foam"],
    ["Can I pay <b>with Apple Pay</b>?", "Can I pay <b>by card</b>?"],
    W => notOrdered(W) || (PAID(W) ? "Bạn đã trả tiền rồi." : null),
    W => [["walk", "cf_register"], ["spawn", "cf_phoneP"], ["pose", "reach", 900], ["despawn"], ["set", "cf_paid", "phone"], ["pose", "idle", 1]],
    ["pay with my phone", "pay with my phone at the card reader", "trả bằng điện thoại"]),
  cfA("ask_how_much", "cashregister", "Ask how much", "Hỏi bao nhiêu tiền", "Sorry, how much is that?", "Xin lỗi, bao nhiêu tiền vậy?", ["how much"], ["howmuch", "price"],
    "<b>How much is that?</b> = cái đó bao nhiêu tiền? (hỏi tổng). Nghe không rõ thì nói <b>Sorry?</b>", ["Sorry,", "how much is that?"], ["much", "match", "mush"],
    ["How much is <b>a large latte</b>?", "How much is <b>the croissant</b>?"],
    W => notOrdered(W) || (W.cf_asked === "yes" ? "Bạn đã hỏi giá rồi." : null), at("cf_register", "point", 600, [["cf_asked", "yes"]]),
    ["ask how much it is", "ask the barista how much my drink is", "hỏi giá"]),
  cfA("use_loyalty_card", "loyaltysign", "Use my loyalty card", "Dùng thẻ tích điểm", "Here's my loyalty card. Could you stamp it?", "Thẻ tích điểm của mình đây. Bạn đóng dấu giúp nhé?", ["loyalty card", "stamp"], ["loyalty", "stamp"],
    "<b>loyalty card</b> = thẻ tích điểm. Đủ 10 dấu (<b>stamps</b>) thường được một ly miễn phí: <b>the 10th one is free</b>.", ["Here's my loyalty card.", "Could you stamp it?"], ["stamp", "stump", "stomp"],
    ["Here's my <b>membership card</b>.", "Could you <b>scan</b> it?"],
    W => notOrdered(W) || (W.cf_stamp === "yes" ? "Thẻ đã được đóng dấu rồi." : null),
    W => [["walk", "cf_register"], ["spawn", "cf_loyaltyP"], ["pose", "reach", 800], ["despawn"], ["set", "cf_stamp", "yes"], ["pose", "idle", 1]],
    ["use my loyalty card", "get a stamp on my loyalty card", "dùng thẻ tích điểm"]),
  cfA("leave_a_tip", "tipjar", "Leave a tip", "Để lại tiền boa", "I'll leave a little tip. Thank you!", "Mình để lại chút tiền boa. Cảm ơn nhé!", ["tip"], ["tip", "jar"],
    "<b>tip</b> = tiền boa. <b>tip jar</b> = hũ tiền boa ở quầy. <b>a little</b> = một chút.", ["I'll leave a little tip.", "Thank you!"], ["tip", "top", "type"],
    ["I'll leave <b>a dollar</b> in the tip jar.", "<b>Keep the change</b>, thank you!"],
    W => !PAID(W) ? "Bạn chưa trả tiền. Hãy trả tiền trước (Pay by card)." : W.cf_tip === "yes" ? "Bạn đã để lại tiền boa rồi." : null,
    W => [["walk", "cf_tipspot"], ["spawn", "cf_cash"], ["pose", "reach", 700], ["despawn"], ["set", "cf_tip", "yes"], ["pose", "idle", 1]],
    ["leave a tip", "leave a little tip in the tip jar", "để lại tiền boa"]),

  /* ===== v2: pick-up & extras ===== */
  cfA("check_if_mine", "pickup", "Ask if it's mine", "Hỏi có phải của mình", "Sorry, is this one mine?", "Xin lỗi, ly này của mình phải không?", ["mine"], ["mine"],
    "<b>mine</b> = của tôi (đại từ sở hữu, đứng một mình). <b>this one</b> = cái này.", ["Sorry,", "is this one mine?"], ["mine", "mind", "mean"],
    ["Is this one <b>yours</b>?", "Is this <b>my order</b>?"],
    W => !PAID(W) ? "Hãy trả tiền trước (Pay by card)." : W.cf_mine === "yes" ? "Bạn đã hỏi rồi." : null,
    W => [["walk", "cf_pickup"], ["pose", "point", 700], ...(W.cf_order === "ordered" ? [["set", "cf_order", "ready"]] : []), ["set", "cf_mine", "yes"], ["pose", "idle", 1]],
    ["ask if the drink is mine", "ask the barista if this drink is mine", "hỏi ly có phải của mình"]),
  cfA("ask_for_refill", "pickup", "Ask for a refill", "Xin rót thêm", "Excuse me, can I get a refill?", "Xin lỗi, mình được rót thêm không?", ["refill"], ["refill"],
    "<b>refill</b> = rót thêm (ly thứ hai). Nhiều quán có <b>free refills</b> cho cà phê đen và trà.", ["Excuse me,", "can I get a refill?"], ["refill", "refuel", "feel"],
    ["Can I get a refill <b>of iced tea</b>?", "<b>Are refills free</b>?"],
    W => W.cf_refill === "yes" ? "Bạn đã được rót thêm rồi." : W.cf_drink === "trash" ? "Bạn đã vứt cốc rồi." : W.cf_drink !== "empty" ? "Cốc còn đồ uống. Hãy uống hết trước (Drink my latte)." : null,
    W => [["walk", "cf_pickup"], ["pose", "reach", 800], ["wait", 500], ["set", "cf_drink", "full"], ["set", "cf_refill", "yes"], ["pose", "idle", 1]],
    ["ask for a refill", "ask for a refill at the counter", "xin rót thêm"]),
  cfA("ask_for_straw", "straws", "Ask for a straw", "Xin ống hút", "Could I get a straw, please?", "Cho mình xin một cái ống hút nhé.", ["straw"], ["straw", "please"],
    "<b>straw</b> /strɔː/ = ống hút. Ống hút giấy: <b>paper straw</b>. Không cần: <b>No straw, thanks.</b>", ["Could I get", "a straw, please?"], ["straw", "stray", "strong"],
    ["Could I get <b>a paper straw</b>, please?", "Could I get <b>a spoon</b>, please?"],
    W => needDrink(W) || (W.cf_straw === "yes" ? "Bạn đã có ống hút rồi." : null),
    W => [...getDrink(W), ["walk", "cf_station"], ["pose", "reach", 700], ["set", "cf_straw", "yes"], ["pose", "idle", 1]],
    ["ask for a straw", "get a straw for my drink", "xin ống hút"]),
  cfA("grab_napkins", "napkins", "Grab some napkins", "Lấy khăn giấy", "Can I grab a few napkins?", "Mình lấy vài tờ khăn giấy nhé?", ["napkins"], ["napkin", "grab"],
    "<b>grab</b> = lấy nhanh (thân mật). <b>a few</b> + danh từ số nhiều = vài: a few napkin<b>s</b>.", ["Can I grab", "a few napkins?"], ["napkins", "napkin", "nephews"],
    ["Can I grab <b>a spoon</b>?", "Can I grab <b>some sugar</b>?"],
    once("cf_napkin", "yes", "Bạn đã lấy khăn giấy rồi."), at("cf_station", "reach", 700, [["cf_napkin", "yes"]]),
    ["grab some napkins", "grab a few napkins from the holder", "lấy khăn giấy"]),
  cfA("photo_latte_art", "cafetable", "Take a photo of the latte art", "Chụp ảnh latte art", "Wow, I have to take a photo of this latte art!", "Ôi, phải chụp ảnh hình vẽ trên ly này mới được!", ["photo", "latte art"], ["photo", "latteart"],
    "<b>have to</b> = phải. <b>latte art</b> = hình vẽ bằng bọt sữa trên mặt cà phê (trái tim, chiếc lá…).", ["Wow, I have to take a photo", "of this latte art!"], ["photo", "photos", "photon"],
    ["I have to take a photo of <b>this cake</b>!", "<b>Can you take a photo of us</b>?"],
    W => needDrink(W) || (W.cf_photo === "yes" ? "Bạn đã chụp ảnh rồi." : null),
    W => [...getDrink(W), ...ensureSeat(W), ["spawn", "cf_phoneP"], ["pose", "read", 1000], ["despawn"], ["set", "cf_photo", "yes"], ["pose", "idle", 1]],
    ["take a photo of the latte art", "take a photo of the pretty latte art", "chụp ảnh latte art"], true),
  cfA("charge_phone_at_cafe", "chargebar", "Charge my phone", "Sạc điện thoại", "Excuse me, can I charge my phone here?", "Xin lỗi, mình sạc điện thoại ở đây được không?", ["charge", "phone"], ["charge", "outlet", "phone"],
    "<b>charge</b> = sạc pin. Hỏi ổ cắm: <b>Is there an outlet near here?</b> (outlet = ổ cắm; Anh-Anh: <b>socket</b>).", ["Excuse me,", "can I charge my phone here?"], ["charge", "change", "church"],
    ["Can I charge <b>my laptop</b> here?", "<b>Is there an outlet</b> near here?"],
    once("cf_charge", "yes", "Điện thoại đang sạc rồi."),
    W => [["walk", "cf_charge"], ["spawn", "cf_phoneP"], ["pose", "reach", 800], ["despawn"], ["set", "cf_charge", "yes"], ["pose", "idle", 1]],
    ["charge my phone", "charge my phone at the charging bar", "sạc điện thoại"]),
  cfA("unplug_at_cafe", "chargebar", "Unplug my phone", "Rút sạc điện thoại", "Okay, my phone's charged. I'm unplugging it.", "Được rồi, điện thoại đầy pin. Mình rút sạc đây.", ["unplugging"], ["unplug", "charge"],
    "<b>unplug</b> = rút phích cắm. <b>phone's charged</b> = phone is charged (đã sạc đầy).", ["Okay, my phone's charged.", "I'm unplugging it."], ["unplug", "unpack", "unlock"],
    ["I'm unplugging <b>my laptop</b>.", "<b>My battery's full</b>."],
    W => W.cf_charge !== "yes" ? "Bạn chưa sạc. Hãy sạc điện thoại trước (Charge my phone)." : null,
    W => [["walk", "cf_charge"], ["pose", "reach", 700], ["spawn", "cf_phoneP"], ["wait", 300], ["despawn"], ["set", "cf_charge", "done"], ["pose", "idle", 1]],
    ["unplug my phone", "unplug my phone when it's charged", "rút sạc điện thoại"]),
  cfA("sit_on_terrace", "terrace", "Sit on the terrace", "Ngồi ngoài sân hiên", "Is it okay if I sit outside on the terrace?", "Mình ngồi ngoài sân hiên được không?", ["outside", "terrace"], ["outside", "terrace"],
    "<b>Is it okay if I …?</b> = xin phép nhẹ nhàng. <b>outside</b> = bên ngoài; <b>terrace</b> /ˈter.əs/ = sân hiên.", ["Is it okay if I sit", "outside on the terrace?"], ["terrace", "terrible", "tennis"],
    ["Is it okay if I sit <b>by the window</b>?", "Is it okay if I sit <b>here</b>?"],
    W => W.cf_seat === "terrace" && W.sitting ? "Bạn đang ngồi ở sân hiên rồi." : null,
    W => [["walk", "cf_terrace"], ["set", "cf_seat", "terrace"], ["sit"], ["wait", 400]],
    ["sit on the terrace", "sit outside on the sunny terrace", "ngồi ngoài sân hiên"]),
  cfA("borrow_a_book", "cafebooks", "Borrow a book", "Mượn sách", "Can I borrow one of these books?", "Mình mượn một cuốn sách ở đây được không?", ["borrow", "books"], ["borrow", "book"],
    "<b>borrow</b> = mượn (về phía mình); <b>lend</b> = cho mượn. <b>one of these</b> + danh từ số nhiều.", ["Can I borrow", "one of these books?"], ["borrow", "barrow", "bureau"],
    ["Can I borrow <b>your pen</b>?", "Can I borrow <b>this magazine</b>?"],
    W => W.cf_book === "hand" ? "Bạn đã mượn sách rồi." : null, at("cf_books", "reach", 800, [["cf_book", "hand"]]),
    ["borrow a book", "borrow a book from the café shelf", "mượn sách"]),
  cfA("return_the_book", "cafebooks", "Put the book back", "Trả sách lên kệ", "I'm putting the book back on the shelf.", "Mình để sách lại lên kệ.", ["putting", "back"], ["putback", "shelf"],
    "<b>put … back</b> = để lại chỗ cũ. <b>on the shelf</b> = trên kệ.", ["I'm putting the book back", "on the shelf."], ["shelf", "self", "shell"],
    ["I'm putting <b>the cup</b> back.", "I'm putting the book back <b>where it was</b>."],
    W => W.cf_book !== "hand" ? "Bạn chưa mượn sách. Hãy mượn sách trước (Borrow a book)." : null, at("cf_books", "reach", 800, [["cf_book", "shelf"]]),
    ["put the book back", "put the book back on the shelf", "trả sách lên kệ"]),
  cfA("leave_umbrella", "umbrellastand", "Leave my umbrella", "Để ô ở giá", "It's raining! I'll leave my umbrella here.", "Trời mưa! Mình để ô ở đây nhé.", ["umbrella"], ["umbrella", "leave"],
    "<b>leave</b> = để lại. <b>It's raining</b> = trời đang mưa (hiện tại tiếp diễn).", ["It's raining!", "I'll leave my umbrella here."], ["umbrella", "umbrellas", "Cinderella"],
    ["I'll leave my <b>coat</b> here.", "I'll leave my umbrella <b>by the door</b>."],
    once("cf_umbrella", "stand", "Ô đã để ở giá rồi."), at("cf_umb", "bend", 700, [["cf_umbrella", "stand"]]),
    ["leave my umbrella", "leave my wet umbrella in the stand", "để ô ở giá"]),
  cfA("take_my_umbrella", "umbrellastand", "Take my umbrella", "Lấy lại ô", "Oh, I almost forgot my umbrella!", "Ôi, suýt nữa thì quên ô!", ["forgot", "umbrella"], ["umbrella", "forget"],
    "<b>almost</b> = suýt, gần như. forget → <b>forgot</b> (quá khứ bất quy tắc).", ["Oh, I almost forgot", "my umbrella!"], ["forgot", "forget", "forgo"],
    ["Oh, I almost forgot <b>my keys</b>!", "Oh, I almost forgot <b>my phone</b>!"],
    W => W.cf_umbrella !== "stand" ? "Ô không ở giá. Hãy để ô ở giá trước (Leave my umbrella)." : null, at("cf_umb", "bend", 700, [["cf_umbrella", "taken"]]),
    ["take my umbrella", "take my umbrella before I leave", "lấy lại ô"]),
  cfA("join_the_queue", "queuestand", "Join the line", "Xếp hàng", "Excuse me, is this the line?", "Xin lỗi, đây là hàng chờ phải không?", ["line"], ["line", "queue"],
    "<b>Is this the line?</b> (Mỹ) = <b>Is this the queue?</b> (Anh). Hỏi người phía trước: <b>Are you in line?</b>", ["Excuse me,", "is this the line?"], ["line", "lane", "lime"],
    ["Is this the line <b>for ordering</b>?", "<b>Are you in line</b>?"],
    once("cf_queue", "yes", "Bạn đang xếp hàng rồi."), W => [["walk", "cf_queue"], ["wait", 800], ["set", "cf_queue", "yes"], ["pose", "idle", 1]],
    ["join the line", "join the line to order", "xếp hàng"]),
  cfA("grab_bottled_water", "drinkfridge", "Grab a bottle of water", "Lấy chai nước", "I'll grab a bottle of water, too.", "Mình lấy thêm một chai nước nữa.", ["bottle", "water"], ["bottle", "water", "grab"],
    "<b>a bottle of</b> water = một chai nước. <b>too</b> cuối câu = cũng, thêm.", ["I'll grab", "a bottle of water, too."], ["bottle", "battle", "bottom"],
    ["I'll grab <b>a can of soda</b>, too.", "I'll grab <b>a sparkling water</b>, too."],
    W => W.cf_fridge !== "none" ? "Bạn đã lấy đồ uống trong tủ rồi." : null, at("cf_fridge", "reach", 800, [["cf_fridge", "water"]]),
    ["grab a bottle of water", "grab a bottle of water from the fridge", "lấy chai nước"]),
  cfA("grab_a_juice", "drinkfridge", "Grab an orange juice", "Lấy nước cam", "Ooh, this orange juice looks good. I'll take one.", "Ồ, nước cam này trông ngon. Mình lấy một chai.", ["orange juice"], ["juice", "grab"],
    "<b>looks good</b> = trông ngon. <b>I'll take one</b> = tôi lấy một chai.", ["Ooh, this orange juice looks good.", "I'll take one."], ["juice", "just", "choose"],
    ["This <b>sandwich</b> looks good.", "I'll take <b>two</b>."],
    W => W.cf_fridge !== "none" ? "Bạn đã lấy đồ uống trong tủ rồi." : null, at("cf_fridge", "reach", 800, [["cf_fridge", "juice"]]),
    ["grab an orange juice", "grab a cold orange juice from the fridge", "lấy nước cam"]),

  /* ===== v2: pastries ===== */
  cfA("buy_a_muffin", "pastrycase", "Buy a muffin", "Mua bánh muffin", "And a blueberry muffin, please.", "Thêm một bánh muffin việt quất nhé.", ["muffin"], ["muffin", "please"],
    "<b>And …, please.</b> = gọi thêm món ngắn gọn. muffin /ˈmʌf.ɪn/ = bánh nướng xốp.", ["And a blueberry muffin,", "please."], ["muffin", "muffins", "mutton"],
    ["And <b>a chocolate</b> muffin, please.", "And <b>a cookie</b>, please."],
    W => W.cf_snack === "bought" ? "Bạn đã mua bánh rồi." : null,
    W => [["walk", "cf_pastry"], ["pose", "point", 600], ["spawn", "cf_muffinP"], ["pose", "reach", 500], ["despawn"], ["set", "cf_snack", "bought"], ["set", "cf_snackName", "muffin"], ["set", "cf_warm", "no"], ["set", "cf_box", "no"], ["pose", "idle", 1]],
    ["buy a muffin", "buy a blueberry muffin", "mua bánh muffin"]),
  cfA("buy_cheesecake", "pastrycase", "Buy some cheesecake", "Mua bánh phô mai", "Could I get a slice of cheesecake?", "Cho mình một miếng bánh phô mai nhé?", ["slice", "cheesecake"], ["slice", "cheesecake"],
    "<b>a slice of</b> = một miếng/lát (bánh, pizza). <b>cheesecake</b> = bánh phô mai.", ["Could I get", "a slice of cheesecake?"], ["slice", "slide", "sly"],
    ["Could I get a slice of <b>carrot cake</b>?", "Could I get <b>two slices</b>?"],
    W => W.cf_snack === "bought" ? "Bạn đã mua bánh rồi." : null,
    W => [["walk", "cf_pastry"], ["pose", "point", 600], ["spawn", "cf_muffinP"], ["pose", "reach", 500], ["despawn"], ["set", "cf_snack", "bought"], ["set", "cf_snackName", "cheesecake"], ["set", "cf_warm", "no"], ["set", "cf_box", "no"], ["pose", "idle", 1]],
    ["buy a slice of cheesecake", "buy a slice of creamy cheesecake", "mua bánh phô mai"]),
  cfA("buy_banana_bread", "pastrycase", "Try the banana bread", "Thử bánh chuối", "I'll try the banana bread.", "Mình thử bánh chuối nướng xem sao.", ["banana bread"], ["bananabread", "try"],
    "<b>I'll try …</b> = tôi thử món … (lần đầu). <b>banana bread</b> = bánh chuối nướng.", ["I'll try", "the banana bread."], ["bread", "bred", "breed"],
    ["I'll try <b>the cheesecake</b>.", "I'll try <b>something new</b>."],
    W => W.cf_snack === "bought" ? "Bạn đã mua bánh rồi." : null,
    W => [["walk", "cf_pastry"], ["pose", "point", 600], ["spawn", "cf_muffinP"], ["pose", "reach", 500], ["despawn"], ["set", "cf_snack", "bought"], ["set", "cf_snackName", "banana_bread"], ["set", "cf_warm", "no"], ["set", "cf_box", "no"], ["pose", "idle", 1]],
    ["try the banana bread", "buy a slice of banana bread", "thử bánh chuối"]),
  cfA("ask_to_heat_up", "pastrycase", "Ask to heat it up", "Nhờ hâm nóng bánh", "Could you heat this up, please?", "Bạn hâm nóng cái này giúp mình nhé?", ["heat", "up"], ["heat", "warm"],
    "<b>heat … up</b> = hâm nóng; tân ngữ đứng giữa: heat <b>this</b> up / heat <b>it</b> up.", ["Could you heat this up,", "please?"], ["heat", "hit", "hate"],
    ["Could you <b>warm</b> this up, please?", "Could you heat <b>my croissant</b> up?"],
    W => needSnack(W) || (W.cf_warm === "yes" ? "Bánh đã được hâm nóng rồi." : null),
    W => [["walk", "cf_pastry"], ["pose", "point", 600], ["wait", 900], ["set", "cf_warm", "yes"], ["pose", "idle", 1]],
    ["ask to heat it up", "ask the barista to heat my pastry up", "nhờ hâm nóng bánh"]),
  cfA("ask_for_a_box", "pastrycase", "Ask for a box", "Xin hộp mang về", "Could I get a box to take this home?", "Cho mình xin hộp để mang về nhé?", ["box", "home"], ["box", "takehome"],
    "<b>to take this home</b> = để mang về nhà (<b>to</b> + động từ chỉ mục đích).", ["Could I get a box", "to take this home?"], ["box", "books", "fox"],
    ["Could I get <b>a bag</b> to take this home?", "Could I get a box <b>for the cake</b>?"],
    W => needSnack(W) || (W.cf_box === "yes" ? "Bạn đã có hộp rồi." : null),
    W => [["walk", "cf_pastry"], ["pose", "reach", 700], ["set", "cf_box", "yes"], ["pose", "idle", 1]],
    ["ask for a box", "ask for a box to take my pastry home", "xin hộp mang về"]),
  cfA("eat_my_snack", "pastrycase", "Eat my cake", "Ăn bánh", "Mmm, this is so good!", "Ừm, ngon quá đi!", ["so good"], ["good", "eat"],
    "<b>so</b> + tính từ = rất, quá: so good, so sweet. Thân mật hơn <b>very good</b>.", ["Mmm,", "this is so good!"], ["good", "goods", "could"],
    ["This is <b>so sweet</b>!", "This is <b>amazing</b>!"],
    W => W.cf_snack === "eaten" ? "Bạn đã ăn bánh rồi." : W.cf_snack !== "bought" ? "Bạn chưa có bánh. Hãy mua bánh trước (Buy a muffin)." : null,
    W => [...ensureSeat(W), ["spawn", "cf_muffinP"], ["pose", "drink", 1500], ["despawn"], ["set", "cf_snack", "eaten"], ["set", "cf_tablemess", "crumbs"], ["pose", "idle", 1]],
    ["eat my cake", "eat my cake at the table", "ăn bánh"], true),

  /* ===== v2: little requests ===== */
  cfA("ask_restroom", "barista", "Ask for the restroom", "Hỏi nhà vệ sinh", "Excuse me, where's the restroom?", "Xin lỗi, nhà vệ sinh ở đâu vậy?", ["restroom"], ["restroom"],
    "<b>restroom</b> (Mỹ, lịch sự) = <b>toilet</b> (Anh) = nhà vệ sinh. <b>where's</b> = where is.", ["Excuse me,", "where's the restroom?"], ["restroom", "restaurant", "bedroom"],
    ["Excuse me, where's <b>the exit</b>?", "Excuse me, <b>is there a restroom</b>?"],
    once("cf_restroom", "yes", "Bạn đã hỏi nhà vệ sinh rồi."), at("cf_counter", "point", 600, [["cf_restroom", "yes"]]),
    ["ask for the restroom", "ask the barista where the restroom is", "hỏi nhà vệ sinh"]),
  cfA("connect_to_wifi", "wifisign", "Connect to the Wi-Fi", "Kết nối Wi-Fi", "Okay, I'm connected to the Wi-Fi.", "Được rồi, mình đã kết nối Wi-Fi.", ["connected", "Wi-Fi"], ["connect", "wifi"],
    "<b>be connected to</b> = đã kết nối với. Mất mạng: <b>The Wi-Fi isn't working.</b>", ["Okay,", "I'm connected to the Wi-Fi."], ["connected", "collected", "corrected"],
    ["I'm connected to <b>the internet</b>.", "<b>The Wi-Fi isn't working</b>."],
    W => W.cf_wifi !== "yes" ? "Bạn chưa có mật khẩu. Hãy hỏi mật khẩu trước (Ask for the Wi-Fi password)." : W.cf_online === "yes" ? "Bạn đã kết nối Wi-Fi rồi." : null,
    W => [["spawn", "cf_phoneP"], ["pose", "read", 1000], ["despawn"], ["set", "cf_online", "yes"], ["pose", "idle", 1]],
    ["connect to the Wi-Fi", "connect my phone to the café Wi-Fi", "kết nối Wi-Fi"], true),
  cfA("work_on_laptop", "chargebar", "Work on my laptop", "Làm việc trên laptop", "I've got a deadline, so I'm working on my laptop.", "Mình sắp tới hạn nộp nên đang làm việc trên laptop.", ["deadline", "laptop"], ["deadline", "laptop", "work"],
    "<b>I've got</b> = I have (thân mật). <b>deadline</b> = hạn chót. <b>work on</b> + việc/thiết bị.", ["I've got a deadline,", "so I'm working on my laptop."], ["deadline", "headline", "dateline"],
    ["I've got <b>an exam</b>, so I'm studying.", "I'm working on <b>my report</b>."],
    W => W.cf_online !== "yes" ? "Bạn chưa kết nối mạng. Hãy kết nối Wi-Fi trước (Connect to the Wi-Fi)." : W.cf_work === "yes" ? "Bạn đã làm xong việc rồi." : null,
    W => [...ensureSeat(W), ["spawn", "cf_laptopP"], ["pose", "read", 1800], ["despawn"], ["set", "cf_work", "yes"], ["pose", "idle", 1]],
    ["work on my laptop", "work on my laptop to meet my deadline", "làm việc trên laptop"], true),
  cfA("ask_for_water_glass", "barista", "Ask for a glass of water", "Xin ly nước lọc", "Could I get a glass of water, please?", "Cho mình xin một ly nước lọc nhé.", ["glass", "water"], ["glass", "water"],
    "<b>a glass of water</b> = một ly nước lọc, thường miễn phí. Nước có ga: <b>sparkling water</b>.", ["Could I get", "a glass of water, please?"], ["glass", "grass", "class"],
    ["Could I get <b>some ice</b>, please?", "Could I get <b>a cup of hot water</b>?"],
    once("cf_glass", "yes", "Bạn đã có ly nước rồi."), at("cf_counter", "point", 600, [["cf_glass", "yes"]]),
    ["ask for a glass of water", "ask the barista for a glass of water", "xin ly nước lọc"]),
  cfA("ask_closing_time", "barista", "Ask what time they close", "Hỏi giờ đóng cửa", "What time do you close today?", "Hôm nay quán đóng cửa lúc mấy giờ?", ["time", "close"], ["close", "time"],
    "<b>What time do you close?</b> = mấy giờ đóng cửa? Trả lời: <b>We close at nine.</b> Mở cửa: <b>open</b>.", ["What time", "do you close today?"], ["close", "clothes", "cloth"],
    ["What time do you <b>open</b> tomorrow?", "<b>Are you open</b> on Sunday?"],
    once("cf_hours", "yes", "Bạn đã hỏi giờ đóng cửa rồi."), at("cf_counter", "point", 600, [["cf_hours", "yes"]]),
    ["ask what time they close", "ask the barista what time the café closes", "hỏi giờ đóng cửa"]),

  /* ===== v3: expanded everyday interactions (weather, health, Q&A, rich adjectives) ===== */
  cfA("check_seasonal_specials", "menuboard", "Check seasonal specials", "Xem món đặc biệt theo mùa", "Look at the seasonal specials! A hot cinnamon latte sounds perfect for this chilly morning.", "Nhìn các món đặc biệt theo mùa kìa! Một ly latte quế nóng nghe hợp với buổi sáng se lạnh này quá.", ["seasonal", "cinnamon", "chilly"], ["seasonal", "cinnamon", "chilly"],
    "<b>sounds perfect for …</b> = nghe thật hợp với … <b>chilly</b> = se lạnh.", ["Look at the seasonal specials!", "A hot cinnamon latte sounds perfect for this chilly morning."], ["chilly", "chili", "silly"],
    ["Hot tea sounds perfect for <b>a rainy afternoon</b>.", "I love <b>seasonal</b> drinks."],
    once("cf_seasonal", "yes", "Bạn đã xem thực đơn theo mùa rồi."), at("cf_menu", "read", 900, [["cf_seasonal", "yes"]]),
    ["check the seasonal specials", "check the seasonal specials on the menu board", "xem món đặc biệt theo mùa"]),
  cfA("ask_about_calories", "menuboard", "Ask if smoothies are healthy", "Hỏi sinh tố có tốt cho sức khỏe không", "Do you know if the fruit smoothies are low in sugar and healthy?", "Bạn có biết sinh tố trái cây có ít đường và tốt cho sức khỏe không?", ["smoothies", "sugar", "healthy"], ["smoothie", "sugar", "healthy"],
    "<b>low in sugar</b> = ít đường; <b>high in vitamin C</b> = giàu vitamin C.", ["Do you know if the fruit smoothies", "are low in sugar and healthy?"], ["healthy", "wealthy", "heavy"],
    ["Is this drink <b>low in sugar</b>?", "Fruit smoothies are <b>very healthy</b>."],
    once("cf_calories", "yes", "Bạn đã hỏi về lượng đường của sinh tố rồi."), at("cf_menu", "point", 700, [["cf_calories", "yes"]]),
    ["ask if the smoothies are healthy", "ask if the fruit smoothies are low in sugar", "hỏi sinh tố có ít đường không"]),
  cfA("chat_about_weather_cafe", "barista", "Chat about the rainy weather", "Trò chuyện về thời tiết mưa", "It's pouring rain outside today, isn't it? Your warm café feels so cozy!", "Hôm nay bên ngoài mưa tầm tã nhỉ? Quán cà phê ấm áp của bạn thật dễ chịu!", ["pouring", "warm", "cozy"], ["pouring", "warm", "cozy"],
    "Câu hỏi đuôi <b>isn't it?</b> dùng để bắt chuyện tự nhiên về thời tiết. <b>pouring rain</b> = mưa như trút nước.", ["It's pouring rain outside today, isn't it?", "Your warm café feels so cozy!"], ["cozy", "crazy", "lazy"],
    ["It's <b>freezing</b> outside today, isn't it?", "This corner feels <b>so cozy</b>."],
    once("cf_weatherchat", "yes", "Bạn đã trò chuyện về thời tiết rồi."), at("cf_counter", "point", 800, [["cf_weatherchat", "yes"]]),
    ["chat about the rainy weather", "chat with the barista about the pouring rain", "trò chuyện về thời tiết mưa"]),
  cfA("compliment_the_music", "barista", "Compliment the café playlist", "Khen nhạc trong quán", "What a relaxing jazz playlist! Who picks the music here?", "Danh sách nhạc jazz thư giãn thật đấy! Ai chọn nhạc ở quán vậy?", ["relaxing", "playlist"], ["relaxing", "playlist"],
    "Câu cảm thán: <b>What a + tính từ + danh từ!</b> (What a relaxing playlist!).", ["What a relaxing jazz playlist!", "Who picks the music here?"], ["playlist", "playtime", "player"],
    ["What a <b>lovely song</b>!", "This jazz music is <b>so relaxing</b>."],
    once("cf_musicchat", "yes", "Bạn đã khen nhạc trong quán rồi."), at("cf_counter", "point", 700, [["cf_musicchat", "yes"]]),
    ["compliment the café playlist", "compliment the relaxing jazz playlist", "khen nhạc trong quán"]),
  cfA("ask_for_almond_milk", "cafecounter", "Ask for almond milk", "Xin đổi sữa hạnh nhân vì đau bụng", "Could I get almond milk in my coffee? Regular dairy upsets my stomach.", "Cho mình dùng sữa hạnh nhân trong cà phê nhé? Sữa bò thông thường làm mình đau bụng.", ["almond milk", "stomach"], ["almond", "stomach", "coffee"],
    "<b>upset my stomach</b> = làm đau bụng / khó tiêu. Rất hữu ích khi nói về sức khỏe ăn uống.", ["Could I get almond milk in my coffee?", "Regular dairy upsets my stomach."], ["stomach", "stomachs", "spinach"],
    ["Spicy food <b>upsets my stomach</b>.", "Do you have <b>almond milk</b>?"],
    once("cf_almond", "yes", "Bạn đã xin đổi sữa hạnh nhân rồi."), at("cf_counter", "point", 700, [["cf_almond", "yes"]]),
    ["ask for almond milk", "ask for almond milk for my sensitive stomach", "xin đổi sữa hạnh nhân"]),
  cfA("order_extra_hot", "cafecounter", "Ask for an extra-hot drink", "Xin làm đồ uống thật nóng", "Could you make my latte extra hot, please? My hands are freezing!", "Bạn làm ly latte thật nóng giúp mình nhé? Tay mình đang lạnh cóng!", ["extra hot", "freezing"], ["extra", "hot", "freezing"],
    "<b>extra hot</b> = nóng già / thật nóng. <b>My hands are freezing!</b> = Tay mình lạnh cóng rồi!", ["Could you make my latte extra hot, please?", "My hands are freezing!"], ["freezing", "freezes", "breezy"],
    ["Could you make my tea <b>extra hot</b>?", "It's <b>freezing</b> outside this morning!"],
    once("cf_extrahot", "yes", "Bạn đã dặn làm đồ uống thật nóng rồi."), at("cf_counter", "point", 700, [["cf_extrahot", "yes"]]),
    ["ask for an extra-hot drink", "ask the barista to make my latte extra hot", "xin làm đồ uống thật nóng"]),
  cfA("ask_to_split_bill", "cashregister", "Ask to pay separately", "Hỏi trả tiền riêng", "Can we pay separately, please? I'll pay for the coffee and the muffin.", "Tụi mình trả tiền riêng được không? Mình sẽ trả tiền cà phê và bánh muffin.", ["pay", "separately", "muffin"], ["pay", "separately", "muffin"],
    "<b>pay separately</b> = trả tiền riêng từng người; <b>split the bill</b> = chia đôi hoá đơn.", ["Can we pay separately, please?", "I'll pay for the coffee and the muffin."], ["separately", "separate", "certainly"],
    ["Can we <b>split the bill</b>?", "I'll <b>pay for</b> the pastries."],
    once("cf_splitbill", "yes", "Bạn đã hỏi trả tiền riêng rồi."), at("cf_register", "point", 700, [["cf_splitbill", "yes"]]),
    ["ask to pay separately", "ask the cashier if we can pay separately", "hỏi trả tiền riêng"]),
  cfA("check_change_at_register", "cashregister", "Return extra change", "Trả lại tiền thối thừa", "Excuse me, I think you gave me a dollar too much in change.", "Xin lỗi, hình như bạn thối thừa cho mình một đô rồi.", ["change", "dollar"], ["change", "cash"],
    "Lịch sự báo nhầm tiền thối: <b>I think you gave me … too much in change.</b>", ["Excuse me,", "I think you gave me a dollar too much in change."], ["change", "charge", "chance"],
    ["Here's <b>your change</b>.", "You gave me <b>too much change</b>."],
    once("cf_extrachange", "yes", "Bạn đã kiểm tra tiền thối rồi."), at("cf_register", "reach", 700, [["cf_extrachange", "yes"]]),
    ["check my change at the register", "return extra change to the cashier", "trả lại tiền thối thừa"]),
  cfA("watch_barista_steam_milk", "espressomachine", "Watch the barista steam milk", "Xem đánh bọt sữa", "I love watching the barista steam the creamy milk for the cappuccino.", "Mình rất thích nhìn nhân viên đánh nóng lớp sữa béo mịn cho ly cappuccino.", ["steam", "creamy", "cappuccino"], ["steam", "creamy", "cappuccino"],
    "<b>watch + ai + động từ nguyên mẫu</b>: watch the barista <b>steam</b> the milk.", ["I love watching the barista", "steam the creamy milk for the cappuccino."], ["creamy", "cream", "dreamy"],
    ["The milk foam is <b>so creamy</b>.", "She is <b>steaming</b> the milk."],
    once("cf_watchsteam", "yes", "Bạn đã xem đánh bọt sữa rồi."), at("cf_pickup", "read", 900, [["cf_watchsteam", "yes"]]),
    ["watch the barista steam milk", "watch the barista steam creamy milk", "xem nhân viên đánh bọt sữa"]),
  cfA("smell_fresh_espresso", "espressomachine", "Smell the fresh coffee beans", "Ngửi hương cà phê mới xay", "Mmm, the rich aroma of fresh coffee beans wakes me right up!", "Ừm, hương thơm đậm đà của hạt cà phê mới xay làm mình tỉnh cả người!", ["aroma", "beans"], ["aroma", "beans", "espresso"],
    "<b>wake someone right up</b> = làm ai tỉnh táo ngay lập tức. <b>rich aroma</b> = hương thơm nồng đậm.", ["Mmm, the rich aroma of fresh coffee beans", "wakes me right up!"], ["aroma", "around", "armor"],
    ["Strong coffee <b>wakes me right up</b>.", "I love the <b>aroma</b> of roasted beans."],
    once("cf_smellbeans", "yes", "Bạn đã thưởng thức hương cà phê rồi."), at("cf_pickup", "reach", 800, [["cf_smellbeans", "yes"]]),
    ["smell the fresh coffee beans", "enjoy the rich aroma of fresh espresso", "ngửi hương cà phê mới xay"]),
  cfA("ask_for_cup_tray", "pickup", "Ask for a cup tray", "Xin khay đựng cốc", "Could I have a cardboard cup tray to carry these four hot drinks?", "Cho mình xin một khay giấy để bê bốn ly đồ uống nóng này được không?", ["cup tray", "carry", "hot"], ["tray", "carry", "hot"],
    "<b>a cup tray / drink carrier</b> = khay đựng nhiều ly mang đi.", ["Could I have a cardboard cup tray", "to carry these four hot drinks?"], ["carry", "hurry", "marry"],
    ["Do you need <b>a cup tray</b>?", "It's easier <b>to carry</b> with a tray."],
    once("cf_cuptray", "yes", "Bạn đã lấy khay đựng cốc rồi."), at("cf_pickup", "reach", 700, [["cf_cuptray", "yes"]]),
    ["ask for a cup tray", "ask for a cardboard cup tray at the pickup counter", "xin khay đựng cốc"]),
  cfA("thank_barista_at_pickup", "pickup", "Wish a wonderful afternoon", "Chúc buổi chiều tốt lành", "Thanks a lot! Have a wonderful afternoon, even though it's cloudy.", "Cảm ơn nhiều nhé! Chúc bạn buổi chiều tuyệt vời dù trời hơi nhiều mây.", ["wonderful", "cloudy"], ["wonderful", "cloudy", "thanks"],
    "<b>even though</b> = mặc dù. <b>Have a wonderful afternoon!</b> = Chúc một buổi chiều tuyệt vời!", ["Thanks a lot!", "Have a wonderful afternoon, even though it's cloudy."], ["cloudy", "loudly", "crowd"],
    ["Have a <b>wonderful</b> day!", "It's <b>cloudy</b> but pleasant outside."],
    once("cf_thankpickup", "yes", "Bạn đã cảm ơn và chúc nhân viên rồi."), at("cf_pickup", "point", 700, [["cf_thankpickup", "yes"]]),
    ["thank the barista at pickup", "wish the barista a wonderful afternoon", "chúc nhân viên buổi chiều tốt lành"]),
  cfA("ask_about_nuts", "pastrycase", "Ask about peanut allergies", "Hỏi bánh có đậu phộng không", "Excuse me, does this chocolate brownie contain any peanuts? I'm allergic.", "Xin lỗi, bánh brownie sô-cô-la này có đậu phộng không? Mình bị dị ứng.", ["peanuts", "allergic"], ["peanut", "allergic"],
    "Báo dị ứng thực phẩm: <b>I'm allergic to …</b> (peanuts, dairy, gluten).", ["Excuse me, does this chocolate brownie contain any peanuts?", "I'm allergic."], ["allergic", "energetic", "electric"],
    ["I'm <b>allergic to</b> peanuts.", "Does this pastry contain <b>nuts</b>?"],
    once("cf_nutcheck", "yes", "Bạn đã hỏi về thành phần gây dị ứng rồi."), at("cf_pastry", "point", 800, [["cf_nutcheck", "yes"]]),
    ["ask about peanut allergies", "ask if the pastry contains any peanuts", "hỏi bánh có đậu phộng không"]),
  cfA("order_warm_bagel", "pastrycase", "Order a toasted bagel", "Gọi bánh mì vòng nướng", "Can I get a toasted bagel with cream cheese for breakfast?", "Cho mình một chiếc bánh mì vòng nướng phết phô mai kem cho bữa sáng nhé?", ["toasted", "bagel"], ["toasted", "bagel", "canIget"],
    "<b>toasted bagel</b> = bánh mì vòng nướng giòn; thường phết <b>cream cheese</b>.", ["Can I get a toasted bagel", "with cream cheese for breakfast?"], ["toasted", "tasted", "tested"],
    ["Would you like your bagel <b>toasted</b>?", "I'll have a bagel <b>for breakfast</b>."],
    once("cf_bagel", "yes", "Bạn đã gọi bánh mì vòng nướng rồi."), at("cf_pastry", "point", 800, [["cf_bagel", "yes"]]),
    ["order a toasted bagel", "order a toasted bagel with cream cheese", "gọi bánh mì vòng nướng"]),
  cfA("put_on_cup_sleeve", "cupstack", "Put on a cup sleeve", "Lồng vòng giấy cách nhiệt", "This paper cup is boiling hot, so I'm putting on a cardboard cup sleeve.", "Chiếc cốc giấy này nóng bỏng tay nên mình đang lồng thêm vòng giấy cách nhiệt.", ["boiling hot", "cup sleeve"], ["boiling", "sleeve", "cup"],
    "<b>boiling hot</b> = nóng bỏng. <b>cup sleeve</b> = vòng bìa cứng bọc quanh cốc giấy nóng.", ["This paper cup is boiling hot,", "so I'm putting on a cardboard cup sleeve."], ["sleeve", "sleep", "slice"],
    ["Grab a <b>cup sleeve</b> so you don't burn your hand.", "Be careful, the tea is <b>boiling hot</b>."],
    once("cf_sleeve", "yes", "Bạn đã lồng vòng giấy cách nhiệt rồi."), at("cf_cups", "reach", 700, [["cf_sleeve", "yes"]]),
    ["put on a cup sleeve", "put a cardboard sleeve on my boiling hot cup", "lồng vòng giấy cách nhiệt"]),
  cfA("ask_for_reusable_mug", "cupstack", "Use my reusable thermos", "Dùng bình giữ nhiệt cá nhân", "Can you put my coffee in my own reusable thermos to save paper?", "Bạn đựng cà phê vào bình giữ nhiệt tái sử dụng của mình để tiết kiệm giấy được không?", ["reusable", "thermos"], ["reusable", "thermos", "coffee"],
    "<b>reusable thermos / tumbler</b> = bình giữ nhiệt dùng nhiều lần, bảo vệ môi trường.", ["Can you put my coffee", "in my own reusable thermos to save paper?"], ["reusable", "reasonable", "usable"],
    ["You get a discount for bringing a <b>reusable cup</b>.", "This <b>thermos</b> keeps coffee hot for hours."],
    once("cf_thermos", "yes", "Bạn đã đưa bình giữ nhiệt cá nhân rồi."), at("cf_cups", "reach", 700, [["cf_thermos", "yes"]]),
    ["use my reusable thermos", "ask the barista to fill my reusable thermos", "dùng bình giữ nhiệt cá nhân"]),
  cfA("sprinkle_cinnamon_powder", "condiments", "Sprinkle cinnamon powder", "Rắc bột quế thơm", "I'm sprinkling a pinch of fragrant cinnamon powder on my foam.", "Mình đang rắc một chút bột quế thơm lừng lên lớp bọt sữa.", ["sprinkling", "fragrant", "cinnamon"], ["sprinkle", "fragrant", "cinnamon"],
    "<b>a pinch of …</b> = một nhúm nhỏ (quế, muối). <b>sprinkle … on …</b> = rắc … lên …", ["I'm sprinkling a pinch", "of fragrant cinnamon powder on my foam."], ["fragrant", "frequent", "fragment"],
    ["Sprinkle some <b>cinnamon</b> on top.", "The spice smells so <b>fragrant</b>."],
    once("cf_cinnamon", "yes", "Bạn đã rắc bột quế rồi."), at("cf_station", "pour", 800, [["cf_cinnamon", "yes"]]),
    ["sprinkle cinnamon powder", "sprinkle fragrant cinnamon powder on my drink", "rắc bột quế thơm"]),
  cfA("add_raw_honey", "condiments", "Add honey for my sore throat", "Thêm mật ong dịu cổ họng", "A spoonful of natural honey is soothing for my sore throat today.", "Một thìa mật ong tự nhiên thật dịu nhẹ cho cái cổ họng đang đau của mình hôm nay.", ["honey", "sore throat"], ["honey", "throat", "tea"],
    "<b>sore throat</b> = đau/rát họng. <b>a spoonful of honey</b> = một thìa đầy mật ong.", ["A spoonful of natural honey", "is soothing for my sore throat today."], ["throat", "throw", "float"],
    ["Warm tea with <b>honey</b> helps a <b>sore throat</b>.", "I have a slight <b>sore throat</b> today."],
    once("cf_honey", "yes", "Bạn đã thêm mật ong rồi."), at("cf_station", "pour", 800, [["cf_honey", "yes"]]),
    ["add honey for my sore throat", "add a spoonful of honey to soothe my sore throat", "thêm mật ong dịu cổ họng"]),
  cfA("wipe_spilled_coffee", "napkins", "Wipe up a coffee spill", "Lau giọt cà phê bị sánh", "Oops, I spilled a few drops! Let me wipe it up with a clean napkin.", "Ối, mình làm sánh vài giọt rồi! Để mình lau khô bằng tờ khăn giấy sạch.", ["spilled", "napkin"], ["spill", "napkin", "clean"],
    "<b>Oops!</b> = Ối! (khi lỡ tay). <b>wipe it up</b> = lau sạch chỗ nước đổ.", ["Oops, I spilled a few drops!", "Let me wipe it up with a clean napkin."], ["spilled", "spelled", "spoiled"],
    ["I accidentally <b>spilled</b> some milk.", "Grab a <b>napkin</b> to wipe it up."],
    once("cf_spillwipe", "yes", "Bạn đã lau sạch chỗ cà phê sánh rồi."), at("cf_station", "wipe", 800, [["cf_spillwipe", "yes"]]),
    ["wipe up a coffee spill", "wipe up spilled coffee drops with a napkin", "lau giọt cà phê bị sánh"]),
  cfA("take_wooden_stirrer", "straws", "Take a wooden stirrer", "Lấy que khuấy gỗ", "I'm taking a wooden stirrer to mix the sugar at the bottom of my cup.", "Mình lấy một que khuấy gỗ để khuấy tan đường ở dưới đáy cốc.", ["wooden stirrer", "sugar"], ["stirrer", "sugar", "cup"],
    "<b>wooden stirrer</b> = que khuấy bằng gỗ; <b>at the bottom</b> = ở dưới đáy.", ["I'm taking a wooden stirrer", "to mix the sugar at the bottom of my cup."], ["bottom", "button", "bottle"],
    ["Use a <b>wooden stirrer</b> to mix your coffee.", "The syrup settled <b>at the bottom</b>."],
    once("cf_stirrer", "yes", "Bạn đã lấy que khuấy gỗ rồi."), at("cf_station", "reach", 700, [["cf_stirrer", "yes"]]),
    ["take a wooden stirrer", "take a wooden stirrer to mix my drink", "lấy que khuấy gỗ"]),
  cfA("drop_coins_in_tipjar", "tipjar", "Drop spare coins in the jar", "Bỏ tiền xu lẻ vào hũ boa", "The service here is always so friendly! I'll drop my spare coins in the jar.", "Phục vụ ở đây lúc nào cũng thân thiện! Mình sẽ bỏ tiền xu lẻ vào hũ boa.", ["friendly", "spare coins", "jar"], ["friendly", "coins", "jar"],
    "<b>spare coins / spare change</b> = tiền xu lẻ còn dư. <b>friendly</b> = thân thiện.", ["The service here is always so friendly!", "I'll drop my spare coins in the jar."], ["friendly", "freely", "freshly"],
    ["The staff here are super <b>friendly</b>.", "I put my <b>spare coins</b> in the tip jar."],
    once("cf_coinsjar", "yes", "Bạn đã bỏ tiền xu vào hũ boa rồi."), at("cf_tipspot", "reach", 700, [["cf_coinsjar", "yes"]]),
    ["drop spare coins in the jar", "drop my spare coins in the tip jar", "bỏ tiền xu lẻ vào hũ boa"]),
  cfA("redeem_free_coffee", "loyaltysign", "Redeem a free coffee", "Đổi ly cà phê miễn phí", "Hooray, my loyalty card has ten stamps! Can I redeem my free drink today?", "Tuyệt quá, thẻ tích điểm của mình đủ mười dấu rồi! Hôm nay mình đổi đồ uống miễn phí được không?", ["loyalty card", "stamps", "redeem"], ["loyalty", "stamp", "redeem"],
    "<b>redeem</b> = quy đổi (điểm thưởng, phiếu quà tặng). <b>ten stamps</b> = 10 con dấu.", ["Hooray, my loyalty card has ten stamps!", "Can I redeem my free drink today?"], ["redeem", "remain", "remind"],
    ["Can I <b>redeem</b> my points today?", "You have enough <b>stamps</b> for a free latte!"],
    once("cf_redeem", "yes", "Bạn đã đổi đồ uống miễn phí rồi."), at("cf_register", "point", 800, [["cf_redeem", "yes"]]),
    ["redeem a free coffee", "redeem my ten stamps for a free drink", "đổi ly cà phê miễn phí"]),
  cfA("let_hurried_customer_ahead", "queuestand", "Let someone in a rush go ahead", "Nhường người đang vội lên trước", "You look like you're in a rush—please go ahead of me in line!", "Trông bạn có vẻ đang vội — cứ lên trước mình trong hàng đi nhé!", ["in a rush", "go ahead", "line"], ["rush", "ahead", "line"],
    "<b>be in a rush / in a hurry</b> = đang vội. <b>go ahead of me</b> = lên trước tôi.", ["You look like you're in a rush—", "please go ahead of me in line!"], ["rush", "brush", "crush"],
    ["I'm not <b>in a rush</b>, go ahead!", "Thanks for letting me <b>go ahead</b>."],
    once("cf_letahead", "yes", "Bạn đã nhường khách đang vội lên trước rồi."), at("cf_queue", "point", 700, [["cf_letahead", "yes"]]),
    ["let someone go ahead in line", "let a hurried customer go ahead of me", "nhường người đang vội lên trước"]),
  cfA("grab_sparkling_water", "drinkfridge", "Grab cold sparkling water", "Lấy nước khoáng có ga lạnh", "It's so humid today! An ice-cold bottle of sparkling water will be refreshing.", "Hôm nay trời oi bức quá! Một chai nước khoáng có ga lạnh buốt sẽ sảng khoái lắm đây.", ["humid", "sparkling water"], ["humid", "sparkling", "bottle"],
    "<b>humid</b> = ẩm ướt, oi bức. <b>sparkling water</b> = nước có ga; <b>still water</b> = nước không ga.", ["It's so humid today!", "An ice-cold bottle of sparkling water will be refreshing."], ["humid", "human", "humor"],
    ["Summer afternoons are very <b>humid</b>.", "Would you like still or <b>sparkling water</b>?"],
    once("cf_sparkling", "yes", "Bạn đã lấy chai nước khoáng có ga rồi."), at("cf_fridge", "reach", 800, [["cf_sparkling", "yes"]]),
    ["grab cold sparkling water", "grab an ice-cold bottle of sparkling water", "lấy nước khoáng có ga lạnh"]),
  cfA("check_juice_ingredients", "drinkfridge", "Check the juice ingredients", "Xem thành phần nước ép", "Let me read the label—this cold-pressed green juice has kale, apple, and ginger.", "Để mình đọc nhãn xem — chai nước ép xanh này có cải xoăn, táo và gừng.", ["ingredients", "ginger", "juice"], ["ingredients", "ginger", "juice"],
    "<b>ingredients</b> = thành phần nguyên liệu. <b>ginger</b> /ˈdʒɪn.dʒər/ = củ gừng (tốt cho sức khỏe).", ["Let me read the label—", "this cold-pressed green juice has kale, apple, and ginger."], ["ginger", "finger", "singer"],
    ["Always check the <b>ingredients</b> on the bottle.", "Fresh <b>ginger</b> is great for digestion."],
    once("cf_ingredients", "yes", "Bạn đã xem thành phần nước ép rồi."), at("cf_fridge", "read", 900, [["cf_ingredients", "yes"]]),
    ["check the juice ingredients", "read the ingredients label on the green juice", "xem thành phần nước ép"]),
  cfA("read_travel_magazine", "cafebooks", "Read a travel magazine", "Đọc tạp chí du lịch", "I'm flipping through an interesting travel magazine while I rest my eyes.", "Mình đang lật xem cuốn tạp chí du lịch thú vị trong lúc cho mắt nghỉ ngơi.", ["magazine", "read"], ["magazine", "read"],
    "<b>flip through</b> = lật xem qua các trang sách/tạp chí. <b>rest my eyes</b> = cho mắt nghỉ ngơi.", ["I'm flipping through an interesting travel magazine", "while I rest my eyes."], ["magazine", "machine", "imagine"],
    ["She is reading a <b>travel magazine</b>.", "Take a break and <b>rest your eyes</b>."],
    once("cf_magazine", "yes", "Bạn đã đọc tạp chí du lịch rồi."), at("cf_books", "read", 1000, [["cf_magazine", "yes"]]),
    ["read a travel magazine", "flip through a travel magazine from the shelf", "đọc tạp chí du lịch"]),
  cfA("shake_off_raindrops", "umbrellastand", "Shake raindrops off my umbrella", "Giũ nước mưa trên ô", "Let me shake the heavy raindrops off my umbrella before stepping inside.", "Để mình giũ bớt những hạt mưa nặng trĩu trên ô trước khi bước vào quán.", ["raindrops", "umbrella"], ["raindrops", "umbrella"],
    "<b>shake … off …</b> = giũ … ra khỏi … (shake raindrops off my umbrella).", ["Let me shake the heavy raindrops", "off my umbrella before stepping inside."], ["raindrops", "rainbows", "raincoats"],
    ["Shake the <b>raindrops</b> off your coat.", "Don't forget your <b>umbrella</b> on a rainy day."],
    once("cf_shakerain", "yes", "Bạn đã giũ nước mưa trên ô rồi."), at("cf_umb", "bend", 700, [["cf_shakerain", "yes"]]),
    ["shake raindrops off my umbrella", "shake the raindrops off my wet umbrella", "giũ nước mưa trên ô"]),
  cfA("plug_in_laptop_charger", "chargebar", "Plug in my laptop charger", "Cắm sạc laptop", "My laptop battery is down to ten percent; I need to plug in my charger.", "Pin laptop của mình chỉ còn mười phần trăm; mình cần cắm bộ sạc vào ngay.", ["battery", "charger", "laptop"], ["battery", "charger", "laptop"],
    "<b>down to 10%</b> = tụt xuống còn 10%. <b>plug in</b> = cắm phích điện vào ổ.", ["My laptop battery is down to ten percent;", "I need to plug in my charger."], ["charger", "chapter", "chatter"],
    ["My <b>battery</b> is almost dead.", "Where can I <b>plug in</b> my charger?"],
    once("cf_laptopcharge", "yes", "Bạn đã cắm sạc laptop rồi."), at("cf_charge", "reach", 800, [["cf_laptopcharge", "yes"]]),
    ["plug in my laptop charger", "plug in my laptop charger at the charging bar", "cắm sạc laptop"]),
  cfA("write_in_journal", "cafetable", "Write in my daily journal", "Viết nhật ký ở bàn", "Sitting at a quiet corner table is my favorite way to write in my daily journal.", "Ngồi ở chiếc bàn góc yên tĩnh là cách yêu thích của mình để viết nhật ký hằng ngày.", ["quiet", "journal", "table"], ["quiet", "journal", "table"],
    "<b>quiet corner</b> = góc yên tĩnh. <b>write in a journal</b> = viết nhật ký.", ["Sitting at a quiet corner table", "is my favorite way to write in my daily journal."], ["journal", "journey", "general"],
    ["This café is nice and <b>quiet</b> in the morning.", "I write in my English <b>journal</b> every day."],
    once("cf_journal", "yes", "Bạn đã viết nhật ký rồi."), at("cf_table", "read", 1100, [["cf_journal", "yes"]]),
    ["write in my daily journal", "write in my journal at a quiet café table", "viết nhật ký ở bàn"], true),
  cfA("watch_people_outside", "windowseat", "Watch people from the window", "Ngắm phố phường qua cửa sổ", "I love sitting by the sunny window and watching people walk past in the street.", "Mình thích ngồi cạnh khung cửa sổ đầy nắng và ngắm dòng người qua lại trên phố.", ["sunny", "window"], ["sunny", "window"],
    "<b>walk past</b> = đi ngang qua. <b>sunny window</b> = khung cửa sổ ngập nắng.", ["I love sitting by the sunny window", "and watching people walk past in the street."], ["sunny", "funny", "Sunday"],
    ["It's a bright, <b>sunny</b> morning.", "Let's sit by the <b>window</b> and relax."],
    once("cf_peoplewatch", "yes", "Bạn đã ngắm phố phường qua cửa sổ rồi."), at("cf_window", "read", 1000, [["cf_peoplewatch", "yes"]]),
    ["watch people from the window", "watch people walk past from the window seat", "ngắm phố phường qua cửa sổ"], true),
  cfA("enjoy_morning_breeze", "terrace", "Enjoy the cool breeze", "Tận hưởng gió mát ngoài sân hiên", "The cool morning breeze on the terrace feels wonderful after a long week.", "Làn gió sáng mát lành ngoài sân hiên thật dễ chịu sau một tuần dài làm việc.", ["breeze", "terrace", "wonderful"], ["breeze", "terrace", "wonderful"],
    "<b>breeze</b> /briːz/ = làn gió nhẹ mát mẻ. <b>feel + tính từ</b> = cảm thấy như thế nào.", ["The cool morning breeze on the terrace", "feels wonderful after a long week."], ["breeze", "freeze", "trees"],
    ["There's a nice cool <b>breeze</b> outside.", "The weather on the <b>terrace</b> is lovely."],
    once("cf_breeze", "yes", "Bạn đã tận hưởng làn gió mát ngoài sân hiên rồi."), at("cf_terrace", "idle", 900, [["cf_breeze", "yes"]]),
    ["enjoy the cool breeze", "enjoy the cool morning breeze on the terrace", "tận hưởng gió mát ngoài sân hiên"], true),
  cfA("ask_why_wifi_slow", "wifisign", "Reconnect to the Wi-Fi", "Kết nối lại khi Wi-Fi chậm", "Excuse me, the Wi-Fi connection seems a little slow—should I reconnect?", "Xin lỗi, mạng Wi-Fi có vẻ hơi chậm — mình có nên kết nối lại không nhỉ?", ["Wi-Fi", "reconnect"], ["wifi", "reconnect"],
    "<b>seem + tính từ</b> = có vẻ … (seems a little slow). <b>reconnect</b> = kết nối lại.", ["Excuse me, the Wi-Fi connection seems a little slow—", "should I reconnect?"], ["reconnect", "recommend", "recollect"],
    ["Try to <b>reconnect</b> to the network.", "The <b>Wi-Fi</b> signal is stronger near the counter."],
    once("cf_wifireconnect", "yes", "Bạn đã hỏi và kết nối lại Wi-Fi rồi."), at("cf_counter", "point", 700, [["cf_wifireconnect", "yes"]]),
    ["reconnect to the Wi-Fi", "ask if I should reconnect to the slow Wi-Fi", "kết nối lại khi Wi-Fi chậm"]),
  cfA("sort_paper_and_plastic", "recyclingbin", "Separate plastic lid and cup", "Phân loại nắp nhựa và cốc giấy", "I'm separating the plastic lid from the paper cup before recycling them.", "Mình đang tách nắp nhựa ra khỏi cốc giấy trước khi bỏ vào thùng tái chế.", ["separating", "lid", "cup"], ["separate", "lid", "bin"],
    "<b>separate A from B</b> = tách riêng A khỏi B để phân loại rác tái chế.", ["I'm separating the plastic lid", "from the paper cup before recycling them."], ["separating", "celebrating", "decorating"],
    ["Please <b>separate</b> plastic from paper.", "Put the lid in the <b>recycling bin</b>."],
    once("cf_sorttrash", "yes", "Bạn đã phân loại nắp nhựa và cốc giấy rồi."), at("cf_bin", "bend", 700, [["cf_sorttrash", "yes"]]),
    ["separate plastic lid and cup", "separate the lid from the cup at the recycling bin", "phân loại nắp nhựa và cốc giấy"])
];

/* ---------- props carried by the player ---------- */
const CF_PROPS = {
  cf_card: `<rect x="-11" y="-30" width="22" height="14" rx="2" fill="#3b6ec2"/><rect x="-11" y="-26" width="22" height="3" fill="#2a3a5a"/><rect x="-7" y="-21" width="6" height="3" rx="1" fill="#f5d34a"/>`,
  cf_cash: `<rect x="-13" y="-28" width="26" height="13" rx="1.5" fill="#8fc98a" stroke="#5c9a58"/><circle cx="0" cy="-21.5" r="3.5" fill="none" stroke="#5c9a58"/>`,
  cf_receiptP: `<path d="M-7 -36 h14 v24 l-3.5 -2 l-3.5 2 l-3.5 -2 l-3.5 2z" fill="#fff" stroke="#c9b9a0"/><g stroke="#b7a68c"><path d="M-4 -31 h8 M-4 -27 h8 M-4 -23 h5"/></g>`,
  cf_croissantP: `<path d="M-14 -16 Q-8 -30 0 -30 Q8 -30 14 -16 Q6 -20 0 -19 Q-6 -20 -14 -16z" fill="#e3a24a" stroke="#b9772d"/><path d="M-6 -27 q2 6 0 9 M0 -30 v10 M6 -27 q-2 6 0 9" stroke="#b9772d" fill="none"/>`,
  cf_phoneP: `<rect x="-7" y="-36" width="14" height="24" rx="3" fill="#2d2a26"/><rect x="-5" y="-33" width="10" height="17" rx="1" fill="#9fd3f0"/>`,
  cf_loyaltyP: `<rect x="-12" y="-30" width="24" height="15" rx="2" fill="#fff8ec" stroke="#e8743b" stroke-width="1.5"/><g fill="#e8743b"><circle cx="-6" cy="-22.5" r="2.2"/><circle cx="0" cy="-22.5" r="2.2"/><circle cx="6" cy="-22.5" r="2.2" fill="none" stroke="#e8743b"/></g>`,
  cf_muffinP: `<path d="M-9 -16 L-11 -26 H11 L9 -16Z" fill="#c56a3a"/><ellipse cx="0" cy="-27" rx="12" ry="7" fill="#e3a24a" stroke="#b9772d"/><g fill="#4a3a8a"><circle cx="-4" cy="-28" r="1.6"/><circle cx="3" cy="-26" r="1.6"/></g>`,
  cf_laptopP: `<rect x="-16" y="-36" width="32" height="20" rx="2" fill="#5b5f66"/><rect x="-14" y="-34" width="28" height="15" fill="#9fd3f0"/><rect x="-19" y="-16" width="38" height="4" rx="1.5" fill="#3a3f46"/>`
};

/* ---------- scene ---------- */
const cafeShell = `
<defs>
 <linearGradient id="cfWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ead6"/><stop offset="1" stop-color="#ecdcc1"/></linearGradient>
 <linearGradient id="cfLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e0c7a3"/><stop offset="1" stop-color="#ead5b6"/></linearGradient>
 <linearGradient id="cfFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b88d"/><stop offset="1" stop-color="#c49d6e"/></linearGradient>
 <linearGradient id="cfWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9a573"/><stop offset="1" stop-color="#bf8455"/></linearGradient>
 <linearGradient id="cfDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a3a"/><stop offset="1" stop-color="#6e4428"/></linearGradient>
 <linearGradient id="cfChrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6ebef"/><stop offset=".5" stop-color="#fbfcfd"/><stop offset="1" stop-color="#c4cdd4"/></linearGradient>
 <linearGradient id="cfGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f6fb"/><stop offset=".55" stop-color="#cbe6f2"/><stop offset="1" stop-color="#b4d8e8"/></linearGradient>
 <radialGradient id="cfLamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff2c2" stop-opacity=".7"/><stop offset="1" stop-color="#fff2c2" stop-opacity="0"/></radialGradient>
 <filter id="cfSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect x="120" y="0" width="880" height="330" fill="url(#cfWall)"/>
<polygon points="0,0 120,0 120,330 0,640" fill="url(#cfLeft)"/>
<polygon points="120,330 1000,330 1000,640 0,640" fill="url(#cfFloor)"/>
${D("floor-boards", `<g stroke="#b88f60" stroke-width="1.2" opacity=".55"><path d="M90 400 H1000 M60 460 H1000 M35 520 H1000 M12 580 H1000"/><path d="M300 330 L260 640 M520 330 L520 640 M740 330 L780 640"/></g>`)}
${D("wainscot", `<rect x="120" y="230" width="880" height="100" fill="#e7cfa9"/><g stroke="#d6b88c" stroke-width="2"><path d="M120 230 H1000"/></g><g stroke="#dcc097" stroke-width="1.5"><path d="M180 240 V320 M260 240 V320 M340 240 V320 M700 240 V320 M760 240 V320"/></g>`)}
${D("left-door", `<polygon points="38,536 98,388 98,190 38,290" fill="url(#cfDark)" stroke="#5a3d1f" stroke-width="2"/><polygon points="48,500 88,402 88,226 48,300" fill="url(#cfGlass)" opacity=".85"/><circle cx="90" cy="330" r="4" fill="#f5d34a"/><text x="68" y="360" font-size="13" font-weight="800" fill="#e8743b" transform="rotate(-62 68 360)">OPEN</text>`)}
${D("pendant-lamps", `<g><path d="M330 0 V40 M520 0 V40 M710 0 V40" stroke="#5a3d1f" stroke-width="2"/><g fill="#e8743b"><path d="M314 56 Q330 34 346 56Z"/><path d="M504 56 Q520 34 536 56Z"/><path d="M694 56 Q710 34 726 56Z"/></g><g fill="url(#cfLamp)"><ellipse cx="330" cy="110" rx="70" ry="60"/><ellipse cx="520" cy="110" rx="70" ry="60"/><ellipse cx="710" cy="110" rx="70" ry="60"/></g></g>`)}
${D("plant", `<rect x="975" y="560" width="22" height="60" fill="#e8743b"/><g fill="#5f9e5a"><ellipse cx="986" cy="545" rx="12" ry="24"/><ellipse cx="972" cy="552" rx="9" ry="18" transform="rotate(-25 972 552)"/></g>`)}
${D("other-customer", `<g transform="translate(700,560) scale(2)"><rect x="-2" y="-60" width="34" height="48" rx="12" fill="#4aa58c"/><circle cx="15" cy="-74" r="15" fill="#f2c9a0"/><path d="M0 -78 Q15 -96 30 -78 Q30 -88 15 -90 Q2 -90 0 -78z" fill="#2f2018"/><rect x="4" y="-14" width="26" height="30" rx="6" fill="#3d5a80"/><rect x="-26" y="-30" width="30" height="20" rx="2" fill="#5b5f66"/><rect x="-24" y="-28" width="26" height="15" fill="#9fd3f0"/></g>`, 520)}
`;

const cafeWorld = [
  objG("menuboard", "menu board", "bảng thực đơn", 200, 470, 30, `
   <rect class="hit" x="330" y="40" width="300" height="130"/>
   <rect x="330" y="40" width="300" height="130" rx="6" fill="#3a2f2a" stroke="url(#cfWood)" stroke-width="8"/>
   <text x="480" y="62" font-size="15" font-weight="800" fill="#f6ead6" text-anchor="middle">MENU</text>
   <g font-size="10.5" fill="#f6ead6" font-weight="600"><text x="344" y="86">Espresso</text><text x="458" y="86" fill="#f5d34a">$2.50</text><text x="488" y="86">Matcha latte</text><text x="612" y="86" fill="#f5d34a" text-anchor="end">$5.00</text><text x="344" y="100">Americano</text><text x="458" y="100" fill="#f5d34a">$3.50</text><text x="488" y="100">Hot chocolate</text><text x="612" y="100" fill="#f5d34a" text-anchor="end">$4.00</text><text x="344" y="114">Latte</text><text x="458" y="114" fill="#f5d34a">$4.50</text><text x="488" y="114">Iced tea</text><text x="612" y="114" fill="#f5d34a" text-anchor="end">$3.00</text><text x="344" y="128">Cappuccino</text><text x="458" y="128" fill="#f5d34a">$4.00</text><text x="488" y="128">Lemonade</text><text x="612" y="128" fill="#f5d34a" text-anchor="end">$3.25</text><text x="344" y="142">Flat white</text><text x="458" y="142" fill="#f5d34a">$4.25</text><text x="488" y="142">Smoothie</text><text x="612" y="142" fill="#f5d34a" text-anchor="end">$5.50</text><text x="344" y="156">Mocha</text><text x="458" y="156" fill="#f5d34a">$4.75</text><text x="488" y="156">Oat/soy milk</text><text x="612" y="156" fill="#f5d34a" text-anchor="end">+.50</text></g>
   <text x="480" y="166" font-size="9" font-weight="700" fill="#e8c9a0" text-anchor="middle">S −.50 · M · L +.50 · extra shot +.75 · iced/hot</text>
   <path class="cf-menuTick" d="M606 52 l6 6 l12 -14" stroke="#7fd07a" stroke-width="4" fill="none" stroke-linecap="round"/>`),
  objG("wifisign", "Wi-Fi sign", "biển Wi-Fi", 200, 690, 50, `
   <rect class="hit" x="650" y="60" width="80" height="80"/>
   <rect x="655" y="64" width="70" height="72" rx="8" fill="#fff8ec" stroke="#e8743b" stroke-width="3"/>
   <g fill="none" stroke="#e8743b" stroke-width="4" stroke-linecap="round"><path d="M674 96 Q690 82 706 96"/><path d="M680 103 Q690 95 700 103"/></g><circle cx="690" cy="110" r="3.5" fill="#e8743b"/>
   <text x="690" y="128" font-size="10" font-weight="700" fill="#5a3d1f" text-anchor="middle">FREE Wi-Fi</text>
   <text class="cf-pass" x="690" y="152" font-size="11" font-weight="800" fill="#3a9d5d" text-anchor="middle">COFFEE123</text>`),
  objG("windowseat", "window seat", "chỗ ngồi cạnh cửa sổ", 372, 880, 30, `
   <rect class="hit" x="770" y="40" width="220" height="330"/>
   <rect x="775" y="44" width="210" height="190" rx="4" fill="url(#cfWood)"/><rect x="785" y="54" width="190" height="170" fill="url(#cfGlass)"/>
   <g fill="#fff" opacity=".85"><ellipse cx="830" cy="90" rx="26" ry="9"/><ellipse cx="925" cy="120" rx="22" ry="8"/></g>
   <rect x="785" y="160" width="190" height="64" fill="#9cc58f" opacity=".7"/><path d="M880 54 V224 M785 140 H975" stroke="url(#cfWood)" stroke-width="6"/>
   <rect x="772" y="236" width="216" height="14" rx="3" fill="url(#cfWood)"/>
   <rect x="784" y="300" width="194" height="34" rx="8" fill="#e8743b"/><rect x="784" y="330" width="194" height="34" fill="url(#cfDark)"/>
   <rect x="826" y="250" width="110" height="10" rx="3" fill="url(#cfWood)"/><rect x="876" y="260" width="10" height="40" fill="#8a5a3a"/>
   <g class="cf-cupW"><rect x="842" y="230" width="16" height="20" rx="3" fill="#fff" stroke="#c9b9a0"/><rect x="842" y="238" width="16" height="6" fill="#e8743b"/></g>`),
  objG("condiments", "sugar & milk station", "quầy đường và sữa", 360, 205, 384, `
   <rect class="hit" x="150" y="236" width="110" height="130"/>
   <ellipse cx="205" cy="364" rx="58" ry="6" fill="#000" opacity=".14" filter="url(#cfSoft)"/>
   <rect x="152" y="290" width="106" height="72" rx="4" fill="url(#cfWood)" stroke="#a87048"/><rect x="148" y="284" width="114" height="10" rx="3" fill="#8a5a3a"/>
   <rect x="182" y="254" width="18" height="30" rx="4" fill="#fff" stroke="#c9b9a0"/><text x="191" y="273" font-size="6.5" font-weight="800" fill="#5a3d1f" text-anchor="middle">MILK</text>
   <path d="M204 284 V264 Q213 255 222 264 V284Z" fill="#fff8ec" stroke="#c9b9a0"/><text x="213" y="278" font-size="6" font-weight="800" fill="#5a3d1f" text-anchor="middle">SUGAR</text>`),
  objG("cashregister", "cash register & card reader", "máy tính tiền và máy quẹt thẻ", 380, 330, 200, `
   <rect class="hit" x="282" y="206" width="96" height="70"/>
   <rect x="290" y="236" width="70" height="36" rx="4" fill="#4b4f57"/><rect x="298" y="212" width="54" height="26" rx="3" fill="#2d2a26"/><rect x="302" y="216" width="46" height="18" fill="#7fd0c8"/>
   <text class="cf-total" x="325" y="229" font-size="11" font-weight="800" fill="#1f3a36" text-anchor="middle">$4.50</text>
   <rect x="358" y="240" width="18" height="30" rx="3" fill="#3a3f46"/><rect x="361" y="244" width="12" height="9" fill="#9fd3f0"/><circle class="cf-paidLed" cx="367" cy="262" r="3" fill="#7fd07a"/>
   <path class="cf-receiptOut" d="M308 236 h20 v-22 h-20z" fill="#fff" stroke="#c9b9a0" transform="translate(0,-8)"/>`),
  objG("pastrycase", "pastry display", "tủ bánh ngọt", 382, 425, 298, `
   <rect class="hit" x="382" y="206" width="90" height="70"/>
   <rect x="384" y="214" width="86" height="56" rx="5" fill="url(#cfGlass)" stroke="#9aa6af" stroke-width="1.5" opacity=".95"/>
   <path d="M384 244 H470" stroke="#9aa6af"/>
   <g class="cf-crois"><path d="M392 240 Q398 228 406 228 Q414 228 420 240 Q406 234 392 240z" fill="#e3a24a" stroke="#b9772d"/></g>
   <path d="M424 240 Q430 228 438 228 Q446 228 452 240 Q438 234 424 240z" fill="#e3a24a" stroke="#b9772d"/>
   <g fill="#c56a3a"><rect x="394" y="252" width="18" height="12" rx="3"/><rect x="420" y="252" width="18" height="12" rx="3"/></g><g fill="#f2b8a4"><circle cx="452" cy="258" r="7"/></g>`),
  objG("espressomachine", "espresso machine", "máy pha cà phê espresso", 384, 540, 170, `
   <rect class="hit" x="484" y="176" width="114" height="100"/>
   <rect x="490" y="196" width="104" height="70" rx="8" fill="url(#cfChrome)" stroke="#9aa6af" stroke-width="1.5"/><rect x="490" y="186" width="104" height="14" rx="4" fill="#e8743b"/>
   <g fill="#4b4f57"><rect x="506" y="226" width="22" height="8" rx="2"/><rect x="556" y="226" width="22" height="8" rx="2"/></g>
   <circle cx="542" cy="214" r="7" fill="#fff" stroke="#9aa6af"/><path d="M542 214 L546 210" stroke="#e8743b" stroke-width="1.5"/>
   <g class="cf-brew" stroke="#8a5a3a" stroke-width="2"><path d="M515 234 V250 M567 234 V250"/></g>
   <g class="cf-steam" fill="#fff" opacity=".8"><ellipse cx="520" cy="172" rx="9" ry="5"/><ellipse cx="560" cy="166" rx="8" ry="5"/></g>
`),
  objG("cupstack", "cups & lids", "cốc và nắp", 386, 668, 196, `
   <rect class="hit" x="636" y="200" width="70" height="76"/>
   <g fill="#fff" stroke="#c9b9a0"><path d="M644 270 L648 222 H664 L668 270Z"/><path d="M644 230 H668"/><path d="M644 240 H668"/></g>
   <g fill="#5b5f66"><ellipse cx="688" cy="268" rx="12" ry="3"/><ellipse cx="688" cy="263" rx="12" ry="3"/><ellipse cx="688" cy="258" rx="12" ry="3"/><ellipse cx="688" cy="253" rx="12" ry="3"/></g>
   <text x="672" y="214" font-size="9" font-weight="800" fill="#5a3d1f" text-anchor="middle">LIDS</text>`),
  objG("barista", "barista", "nhân viên pha chế", 300, 440, 120, `
   <rect class="hit" x="400" y="60" width="84" height="210"/>
   <g transform="translate(442,268) scale(1.7) translate(-442,-250)"><rect x="418" y="176" width="48" height="74" rx="14" fill="#3a9d5d"/><rect x="426" y="196" width="32" height="54" rx="4" fill="#5a3d1f"/>
   <circle cx="442" cy="158" r="20" fill="#f2c9a0"/><path d="M422 154 Q442 128 462 154 Q456 142 442 142 Q428 142 422 154z" fill="#2a1d14"/>
   <rect x="422" y="138" width="40" height="8" rx="3" fill="#e8743b"/>
   <circle cx="435" cy="160" r="2" fill="#2d2a26"/><circle cx="449" cy="160" r="2" fill="#2d2a26"/><path d="M436 168 Q442 173 448 168" stroke="#8a2f3c" stroke-width="2" fill="none"/></g>`),
  /* counter front is drawn as part of the counter object group so it covers the barista's legs */
  objG("cafecounter", "counter", "quầy", 372, 360, 324, `
   <rect class="hit" x="262" y="276" width="440" height="94"/>
   <ellipse cx="482" cy="372" rx="226" ry="7" fill="#000" opacity=".16" filter="url(#cfSoft)"/>
   <rect x="262" y="268" width="446" height="14" rx="4" fill="#efe7da" stroke="#d8cbb7"/>
   <rect x="268" y="282" width="434" height="86" fill="url(#cfWood)" stroke="#a87048"/>
   <g stroke="#a87048" stroke-width="1.5" opacity=".7"><path d="M340 282 V368 M412 282 V368 M484 282 V368 M556 282 V368 M628 282 V368"/></g>
   <rect x="268" y="296" width="434" height="6" fill="#e8743b"/><text x="485" y="340" font-size="20" font-weight="800" fill="#fff8ec" text-anchor="middle">☕ ORDER HERE</text>`),
  objG("cafetable", "café table", "bàn cà phê", 556, 430, 456, `
   <rect class="hit" x="340" y="460" width="180" height="110"/>
   <ellipse cx="430" cy="560" rx="96" ry="10" fill="#000" opacity=".16" filter="url(#cfSoft)"/>
   <rect x="330" y="470" width="42" height="10" rx="3" fill="#8a5a3a"/><rect x="334" y="480" width="6" height="68" fill="#6e4428"/><rect x="364" y="480" width="6" height="68" fill="#6e4428"/><rect x="330" y="420" width="8" height="56" rx="3" fill="#8a5a3a"/>
   <ellipse cx="430" cy="492" rx="68" ry="16" fill="url(#cfWood)" stroke="#a87048" stroke-width="1.5"/><rect x="425" y="506" width="10" height="46" fill="#5a3d1f"/><ellipse cx="430" cy="552" rx="28" ry="5" fill="#5a3d1f"/>
   <rect x="488" y="470" width="42" height="10" rx="3" fill="#8a5a3a"/><rect x="490" y="480" width="6" height="68" fill="#6e4428"/><rect x="520" y="480" width="6" height="68" fill="#6e4428"/><rect x="522" y="420" width="8" height="56" rx="3" fill="#8a5a3a"/>
   <g class="cf-crumbs" fill="#b9772d"><circle cx="410" cy="490" r="2"/><circle cx="420" cy="494" r="1.6"/><circle cx="446" cy="488" r="2"/><circle cx="452" cy="495" r="1.5"/></g>
   <g class="cf-cupT"><rect x="438" y="472" width="16" height="20" rx="3" fill="#fff" stroke="#c9b9a0"/><rect x="438" y="480" width="16" height="6" fill="#e8743b"/></g>`),
  objG("recyclingbin", "recycling bin", "thùng rác tái chế", 626, 892, 486, `
   <rect class="hit" x="860" y="494" width="120" height="132"/>
   <ellipse cx="920" cy="624" rx="60" ry="6" fill="#000" opacity=".16" filter="url(#cfSoft)"/>
   <path d="M866 520 H912 L908 622 H870Z" fill="#3b6ec2"/><rect x="862" y="512" width="54" height="10" rx="3" fill="#2f5ba3"/>
   <path d="M924 520 H970 L966 622 H928Z" fill="#5b5f66"/><rect x="920" y="512" width="54" height="10" rx="3" fill="#3a3f46"/>
   <g fill="none" stroke="#fff" stroke-width="2.5"><path d="M880 560 l9 -14 l9 14z"/></g><text x="947" y="572" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">TRASH</text>
   <g class="cf-cupBin"><rect x="880" y="498" width="14" height="16" rx="2" fill="#fff" stroke="#c9b9a0"/><rect x="880" y="504" width="14" height="5" fill="#e8743b"/></g>`),
  /* ---- v2 objects ---- */
  objG("cafebooks", "bookshelf", "kệ sách", 228, 189, 62, `
   <rect class="hit" x="130" y="68" width="118" height="160"/>
   <rect x="134" y="72" width="110" height="152" rx="3" fill="url(#cfWood)" stroke="#a87048"/>
   <g fill="#8a5a3a"><rect x="138" y="120" width="102" height="5"/><rect x="138" y="170" width="102" height="5"/><rect x="138" y="216" width="102" height="5"/></g>
   <g><rect class="cf-book1" x="144" y="88" width="10" height="32" fill="#3b6ec2"/><rect x="156" y="92" width="9" height="28" fill="#e8743b"/><rect x="167" y="86" width="11" height="34" fill="#3a9d5d"/><rect x="180" y="94" width="8" height="26" fill="#c2453b"/><path d="M196 120 L204 92 L212 94 L204 120Z" fill="#f5d34a"/>
   <rect x="146" y="140" width="11" height="30" fill="#c2453b"/><rect x="159" y="136" width="9" height="34" fill="#5b5f66"/><rect x="170" y="142" width="12" height="28" fill="#3b6ec2"/><rect x="200" y="146" width="30" height="24" rx="3" fill="#fff8ec"/><path d="M206 160 q9 -10 18 0" stroke="#5f9e5a" stroke-width="3" fill="none"/>
   <rect x="146" y="190" width="40" height="26" rx="2" fill="#e7cfa9"/><rect x="196" y="186" width="10" height="30" fill="#3a9d5d"/><rect x="208" y="190" width="9" height="26" fill="#e8743b"/></g>`),
  objG("loyaltysign", "loyalty card", "thẻ tích điểm", 230, 289, 142, `
   <rect class="hit" x="252" y="146" width="74" height="62"/>
   <rect x="256" y="150" width="66" height="54" rx="5" fill="#fff8ec" stroke="#e8743b" stroke-width="2.5"/>
   <text x="289" y="166" font-size="9" font-weight="800" fill="#5a3d1f" text-anchor="middle">STAMP CARD</text>
   <g fill="#e8743b"><circle cx="268" cy="179" r="4"/><circle cx="280" cy="179" r="4"/><circle cx="292" cy="179" r="4"/></g><g fill="none" stroke="#e8743b"><circle cx="304" cy="179" r="4"/><circle cx="268" cy="192" r="4"/><circle cx="280" cy="192" r="4"/></g>
   <text x="300" y="196" font-size="7" font-weight="800" fill="#3a9d5d" text-anchor="middle">10th FREE</text>
   <circle class="cf-stamped" cx="304" cy="179" r="4" fill="#3a9d5d"/>`),
  objG("napkins", "napkins", "khăn giấy", 362, 156, 236, `
   <rect class="hit" x="146" y="236" width="34" height="52"/>
   <rect x="156" y="264" width="22" height="20" rx="2" fill="#c4cdd4" stroke="#9aa6af"/>
   <g class="cf-napk" fill="#fff" stroke="#d8d2c4"><rect x="158" y="254" width="18" height="12"/><path d="M160 254 l7 -6 l7 6"/></g>`),
  objG("straws", "straws", "ống hút", 362, 250, 302, `
   <rect class="hit" x="226" y="236" width="36" height="52"/>
   <g stroke-width="2.5" stroke-linecap="round"><path d="M240 266 L236 242" stroke="#e8743b"/><path d="M244 266 L244 240" stroke="#3a9d5d"/><path d="M248 266 L252 243" stroke="#3b6ec2"/></g>
   <rect x="234" y="262" width="20" height="22" rx="3" fill="#fff" stroke="#c9b9a0"/>`),
  objG("tipjar", "tip jar", "hũ tiền boa", 372, 300, 252, `
   <rect class="hit" x="258" y="232" width="26" height="44"/>
   <path d="M262 248 h16 v20 q0 4 -4 4 h-8 q-4 0 -4 -4z" fill="#e9f6fb" stroke="#9aa6af" stroke-width="1.5" opacity=".95"/><rect x="261" y="244" width="18" height="5" rx="1.5" fill="#9aa6af"/>
   <g fill="#f5d34a"><circle cx="267" cy="267" r="2.5"/><circle cx="273" cy="268" r="2.5"/></g><rect x="266" y="258" width="9" height="5" fill="#8fc98a"/>
   <g class="cf-tipped"><rect x="267" y="252" width="8" height="5" fill="#8fc98a"/><circle cx="270" cy="262" r="2.5" fill="#f5d34a"/></g>
   <text x="270" y="241" font-size="6.5" font-weight="800" fill="#5a3d1f" text-anchor="middle">TIPS</text>`),
  objG("pickup", "pickup counter", "quầy nhận đồ", 380, 617, 300, `
   <rect class="hit" x="598" y="214" width="38" height="62"/>
   <rect x="600" y="262" width="34" height="6" rx="2" fill="#3a9d5d"/>
   <text x="617" y="226" font-size="7.5" font-weight="800" fill="#3a9d5d" text-anchor="middle">PICK-UP</text>
   <g class="cf-ready"><rect x="608" y="238" width="18" height="24" rx="3" fill="#fff" stroke="#c9b9a0"/><rect x="608" y="246" width="18" height="7" fill="#e8743b"/></g>`),
  objG("queuestand", "queue rope", "dây xếp hàng", 446, 282, 472, `
   <rect class="hit" x="230" y="400" width="100" height="54"/>
   <ellipse cx="280" cy="448" rx="48" ry="4" fill="#000" opacity=".12" filter="url(#cfSoft)"/>
   <g fill="#c9a33a"><rect x="242" y="412" width="5" height="34"/><rect x="313" y="412" width="5" height="34"/><ellipse cx="244.5" cy="446" rx="8" ry="3"/><ellipse cx="315.5" cy="446" rx="8" ry="3"/><circle cx="244.5" cy="411" r="4"/><circle cx="315.5" cy="411" r="4"/></g>
   <path d="M247 416 Q280 432 313 416" stroke="#c2453b" stroke-width="4" fill="none"/>
   <rect x="262" y="402" width="36" height="12" rx="2" fill="#3a2f2a"/><text x="280" y="411" font-size="7" font-weight="800" fill="#f6ead6" text-anchor="middle">LINE ▸</text>`),
  objG("drinkfridge", "drinks fridge", "tủ nước", 544, 178, 564, `
   <rect class="hit" x="138" y="416" width="80" height="132"/>
   <ellipse cx="178" cy="546" rx="44" ry="5" fill="#000" opacity=".14" filter="url(#cfSoft)"/>
   <rect x="142" y="420" width="72" height="124" rx="5" fill="#dfe3e6" stroke="#9aa6af" stroke-width="2"/>
   <rect x="148" y="434" width="60" height="102" fill="url(#cfGlass)"/><rect x="142" y="420" width="72" height="12" rx="4" fill="#3a9d5d"/><text x="178" y="430" font-size="8" font-weight="800" fill="#fff" text-anchor="middle">COLD DRINKS</text>
   <g fill="#9aa6af"><rect x="148" y="468" width="60" height="3"/><rect x="148" y="502" width="60" height="3"/></g>
   <g class="cf-water"><rect x="153" y="446" width="8" height="22" rx="3" fill="#cfe9f7" stroke="#7fb3d0"/></g><rect x="164" y="446" width="8" height="22" rx="3" fill="#cfe9f7" stroke="#7fb3d0"/><rect x="175" y="446" width="8" height="22" rx="3" fill="#cfe9f7" stroke="#7fb3d0"/>
   <g class="cf-juice"><rect x="153" y="480" width="9" height="22" rx="2" fill="#f5a623"/></g><rect x="165" y="480" width="9" height="22" rx="2" fill="#f5a623"/><rect x="186" y="480" width="9" height="22" rx="2" fill="#c2453b"/>
   <g fill="#5f9e5a"><rect x="154" y="512" width="12" height="22" rx="3"/><rect x="170" y="512" width="12" height="22" rx="3"/></g><rect x="206" y="456" width="3" height="40" rx="1.5" fill="#9aa6af"/>`),
  objG("umbrellastand", "umbrella stand", "giá để ô", 600, 113, 520, `
   <rect class="hit" x="94" y="526" width="40" height="80"/>
   <path d="M103 572 L120 552 M110 572 L106 548" stroke="#5a3d1f" stroke-width="2"/>
   <g class="cf-myUmb"><path d="M116 570 L128 534" stroke="#3b6ec2" stroke-width="5" stroke-linecap="round"/><path d="M128 534 q4 -6 0 -9" stroke="#2d2a26" stroke-width="2" fill="none"/></g>
   <rect x="100" y="566" width="26" height="34" rx="4" fill="#5b5f66"/><rect x="98" y="564" width="30" height="6" rx="2" fill="#3a3f46"/>`),
  objG("chargebar", "charging bar", "bàn sạc điện thoại", 486, 812, 396, `
   <rect class="hit" x="766" y="402" width="92" height="86"/>
   <ellipse cx="812" cy="484" rx="42" ry="4" fill="#000" opacity=".14" filter="url(#cfSoft)"/>
   <rect x="770" y="420" width="84" height="9" rx="3" fill="url(#cfWood)" stroke="#a87048"/><rect x="778" y="429" width="6" height="54" fill="#6e4428"/><rect x="840" y="429" width="6" height="54" fill="#6e4428"/>
   <rect x="784" y="412" width="40" height="8" rx="2" fill="#fff" stroke="#9aa6af"/><g fill="#5b5f66"><rect x="789" y="414" width="4" height="4"/><rect x="799" y="414" width="4" height="4"/><rect x="809" y="414" width="4" height="4"/></g>
   <text x="812" y="444" font-size="8" font-weight="800" fill="#5a3d1f" text-anchor="middle">⚡ CHARGE</text>
   <g class="cf-phoneCh"><path d="M816 416 q10 -2 14 -6" stroke="#2d2a26" stroke-width="1.5" fill="none"/><rect x="830" y="404" width="9" height="15" rx="2" fill="#2d2a26"/><rect x="831.5" y="406" width="6" height="10" fill="#7fd07a"/></g>`),
  objG("terrace", "terrace", "sân hiên", 640, 592, 456, `
   <rect class="hit" x="540" y="462" width="104" height="176"/>
   <path d="M592 482 V590" stroke="#5a3d1f" stroke-width="3"/>
   <path d="M548 486 Q592 452 636 486Z" fill="#e8743b"/><path d="M570 486 Q592 452 592 470 M614 486 Q592 452 592 470" stroke="#fff8ec" stroke-width="5" fill="none"/>
   <ellipse cx="592" cy="574" rx="30" ry="8" fill="#fff8ec" stroke="#c9b9a0"/><rect x="589" y="580" width="6" height="30" fill="#5b5f66"/>
   <g class="cf-cupTr"><rect x="585" y="556" width="12" height="15" rx="2" fill="#fff" stroke="#c9b9a0"/><rect x="585" y="561" width="12" height="4" fill="#e8743b"/></g>
   <g fill="#5f9e5a"><ellipse cx="552" cy="626" rx="12" ry="9"/><ellipse cx="632" cy="626" rx="12" ry="9"/></g><rect x="544" y="626" width="96" height="12" rx="3" fill="#8a5a3a"/>`)
].join("\n");

const cafeCss = `
#room .cf-menuTick{display:none}#room [data-cf_menu="read"] .cf-menuTick{display:inline}
#room .cf-pass{display:none}#room [data-cf_wifi="yes"] .cf-pass{display:inline}
#room .cf-total{display:none}#room [data-cf_order="ordered"] .cf-total{display:inline}
#room .cf-paidLed{opacity:.15}#room :not([data-cf_paid="no"]) .cf-paidLed{opacity:1}
#room .cf-receiptOut{display:none}#room [data-cf_receipt="no"]:not([data-cf_paid="no"]) .cf-receiptOut{display:inline}
#room .cf-brew,#room .cf-steam{display:none}
#room [data-cf_order="ordered"]:not([data-cf_paid="no"]) .cf-brew{display:inline;animation:r2Drip .5s linear infinite}
#room [data-cf_order="ordered"]:not([data-cf_paid="no"]) .cf-steam{display:inline;animation:r2Steam 1.6s ease-in-out infinite}
#room .cf-ready{display:none}#room [data-cf_order="ready"] .cf-ready{display:inline}
#room .cf-crois{display:inline}#room [data-cf_croissant="bought"] .cf-crois,#room [data-cf_croissant="eaten"] .cf-crois{display:none}
#room .cf-crumbs{display:none}#room [data-cf_tablemess="crumbs"] .cf-crumbs{display:inline}
#room .cf-cupT,#room .cf-cupW{display:none}
#room [data-cf_seat="table"][data-cf_drink="full"] .cf-cupT,#room [data-cf_seat="table"][data-cf_drink="empty"] .cf-cupT{display:inline}
#room [data-cf_seat="window"][data-cf_drink="full"] .cf-cupW,#room [data-cf_seat="window"][data-cf_drink="empty"] .cf-cupW{display:inline}
#room .cf-cupBin{display:none}#room [data-cf_drink="trash"] .cf-cupBin{display:inline}
#room .cf-cupTr{display:none}#room [data-cf_seat="terrace"][data-cf_drink="full"] .cf-cupTr,#room [data-cf_seat="terrace"][data-cf_drink="empty"] .cf-cupTr{display:inline}
#room [data-cf_book="hand"] .cf-book1{display:none}
#room .cf-stamped{display:none}#room [data-cf_stamp="yes"] .cf-stamped{display:inline}
#room [data-cf_napkin="yes"] .cf-napk{opacity:.35}
#room .cf-tipped{display:none}#room [data-cf_tip="yes"] .cf-tipped{display:inline}
#room [data-cf_fridge="water"] .cf-water,#room [data-cf_fridge="juice"] .cf-juice{display:none}
#room .cf-myUmb{display:none}#room [data-cf_umbrella="stand"] .cf-myUmb{display:inline}
#room .cf-phoneCh{display:none}#room [data-cf_charge="yes"] .cf-phoneCh{display:inline}
`;

const CF_W0 = { cf_menu: "unread", cf_greet: "no", cf_order: "none", cf_size: "none", cf_togo: "here", cf_paid: "no", cf_receipt: "no", cf_drink: "none",
  cf_milk: "no", cf_sugar: "no", cf_lid: "no", cf_seat: "none", cf_wifi: "no", cf_croissant: "none", cf_tablemess: "crumbs", cf_bye: "no",
  cf_item: "none", cf_temp: "hot", cf_milktype: "regular", cf_shot: "no", cf_sweet: "normal", cf_cream: "no", cf_forhere: "no", cf_name: "no", cf_rec: "no", cf_decaf: "no",
  cf_asked: "no", cf_stamp: "no", cf_tip: "no", cf_straw: "no", cf_napkin: "no", cf_refill: "no", cf_mine: "no", cf_photo: "no", cf_charge: "no", cf_book: "shelf",
  cf_umbrella: "none", cf_queue: "no", cf_fridge: "none", cf_snack: "none", cf_snackName: "none", cf_warm: "no", cf_box: "no", cf_restroom: "no", cf_online: "no",
  cf_work: "no", cf_glass: "no", cf_hours: "no",
  cf_seasonal: "no", cf_calories: "no", cf_weatherchat: "no", cf_musicchat: "no", cf_almond: "no", cf_extrahot: "no", cf_splitbill: "no", cf_extrachange: "no",
  cf_watchsteam: "no", cf_smellbeans: "no", cf_cuptray: "no", cf_thankpickup: "no", cf_nutcheck: "no", cf_bagel: "no", cf_sleeve: "no", cf_thermos: "no",
  cf_cinnamon: "no", cf_honey: "no", cf_spillwipe: "no", cf_stirrer: "no", cf_coinsjar: "no", cf_redeem: "no", cf_letahead: "no", cf_sparkling: "no",
  cf_ingredients: "no", cf_magazine: "no", cf_shakerain: "no", cf_laptopcharge: "no", cf_journal: "no", cf_peoplewatch: "no", cf_breeze: "no", cf_wifireconnect: "no", cf_sorttrash: "no" };

/* ---------- prices (menu board) ---------- */
const BASE = { latte: 4.5, americano: 3.5, cappuccino: 4, flat_white: 4.25, mocha: 4.75, matcha: 5, hot_chocolate: 4, espresso: 2.5, iced_tea: 3, lemonade: 3.25, smoothie: 5.5 };
const DN = { latte: "latte", americano: "americano", cappuccino: "cappuccino", flat_white: "flat white", mocha: "mocha", matcha: "matcha latte", hot_chocolate: "hot chocolate",
  espresso: "espresso", iced_tea: "iced tea", lemonade: "lemonade", smoothie: "mango smoothie" };
function priceOf(W) {
  const it = BASE[W.cf_item] != null ? W.cf_item : "latte";
  let p = BASE[it] + (W.cf_size === "small" ? -0.5 : W.cf_size === "large" ? 0.5 : 0);
  if (W.cf_milktype && W.cf_milktype !== "regular") p += 0.5;
  if (W.cf_shot === "yes") p += 0.75;
  if (W.cf_cream === "yes" && it !== "mocha") p += 0.5;
  if (W.cf_fridge === "water") p += 1.5; else if (W.cf_fridge === "juice") p += 3;
  return Math.round(p * 100) / 100;
}
const money = p => "$" + p.toFixed(2);
const moneyVi = p => { const d = Math.floor(p + 1e-9), c = Math.round((p - d) * 100); return d + " đô" + (c ? " " + c : ""); };
function drinkName(W) {
  const it = DN[W.cf_item] ? W.cf_item : "latte";
  const size = W.cf_size === "small" || W.cf_size === "large" ? W.cf_size + " " : "";
  const iced = W.cf_temp === "iced" && !/iced|matcha|lemonade|smoothie/.test(it) ? "iced " : "";
  return size + iced + DN[it];
}

const cafeObjectsAll = {
  menuboard: { en: "menu board", vi: "bảng thực đơn", ipa: "/ˈmen.juː bɔːd/", acts: ["read_the_menu", "ask_recommendation", "ask_no_caffeine", "order_a_latte", "order_iced_americano", "order_cappuccino",
    "order_flat_white", "order_mocha", "order_matcha_latte", "order_hot_chocolate", "order_espresso", "order_iced_tea", "order_lemonade", "order_smoothie", "check_seasonal_specials", "ask_about_calories"] },
  barista: { en: "barista", vi: "nhân viên pha chế", ipa: "/bəˈriː.stə/", acts: ["greet_barista", "order_a_latte", "give_my_name", "ask_wifi_password", "ask_restroom", "ask_for_water_glass", "ask_closing_time", "say_goodbye", "chat_about_weather_cafe", "compliment_the_music"] },
  cafecounter: { en: "counter", vi: "quầy", ipa: "/ˈkaʊn.tər/", acts: ["greet_barista", "order_a_latte", "choose_size", "choose_small", "make_it_iced", "switch_oat_milk", "switch_soy_milk",
    "add_extra_shot", "ask_less_sugar", "add_whipped_cream", "ask_for_takeaway", "say_for_here", "give_my_name", "ask_for_almond_milk", "order_extra_hot"] },
  cashregister: { en: "cash register", vi: "máy tính tiền", ipa: "/ˈkæʃ ˌredʒ.ɪ.stər/", acts: ["order_a_latte", "choose_size", "ask_for_takeaway", "ask_how_much", "pay_by_card", "pay_in_cash", "pay_with_phone", "take_the_receipt", "ask_to_split_bill", "check_change_at_register"] },
  espressomachine: { en: "espresso machine", vi: "máy pha cà phê", ipa: "/eˈspres.əʊ məˌʃiːn/", acts: ["wait_for_order", "pick_up_drink", "add_extra_shot", "watch_barista_steam_milk", "smell_fresh_espresso"] },
  pickup: { en: "pickup counter", vi: "quầy nhận đồ", ipa: "/ˈpɪk.ʌp ˌkaʊn.tər/", acts: ["wait_for_order", "check_if_mine", "pick_up_drink", "ask_for_refill", "ask_for_cup_tray", "thank_barista_at_pickup"] },
  pastrycase: { en: "pastry display", vi: "tủ bánh ngọt", ipa: "/ˈpeɪ.stri dɪˌspleɪ/", acts: ["buy_a_croissant", "buy_a_muffin", "buy_cheesecake", "buy_banana_bread", "ask_to_heat_up", "ask_for_a_box", "eat_croissant", "eat_my_snack", "ask_about_nuts", "order_warm_bagel"] },
  cupstack: { en: "cups & lids", vi: "cốc và nắp", ipa: "/kʌps ən lɪdz/", acts: ["put_on_lid", "pick_up_drink", "put_on_cup_sleeve", "ask_for_reusable_mug"] },
  condiments: { en: "sugar & milk station", vi: "quầy đường và sữa", ipa: "/ˈʃʊɡ.ər ən mɪlk ˈsteɪ.ʃən/", acts: ["add_milk", "add_sugar", "ask_for_straw", "grab_napkins", "sprinkle_cinnamon_powder", "add_raw_honey"] },
  napkins: { en: "napkins", vi: "khăn giấy", ipa: "/ˈnæp.kɪnz/", acts: ["grab_napkins", "wipe_spilled_coffee"] },
  straws: { en: "straws", vi: "ống hút", ipa: "/strɔːz/", acts: ["ask_for_straw", "take_wooden_stirrer"] },
  tipjar: { en: "tip jar", vi: "hũ tiền boa", ipa: "/ˈtɪp dʒɑː/", acts: ["leave_a_tip", "drop_coins_in_tipjar"] },
  loyaltysign: { en: "loyalty card", vi: "thẻ tích điểm", ipa: "/ˈlɔɪ.əl.ti kɑːd/", acts: ["use_loyalty_card", "redeem_free_coffee"] },
  queuestand: { en: "queue rope", vi: "dây xếp hàng", ipa: "/kjuː rəʊp/", acts: ["join_the_queue", "let_hurried_customer_ahead"] },
  drinkfridge: { en: "drinks fridge", vi: "tủ nước", ipa: "/drɪŋks frɪdʒ/", acts: ["grab_bottled_water", "grab_a_juice", "grab_sparkling_water", "check_juice_ingredients"] },
  cafebooks: { en: "bookshelf", vi: "kệ sách", ipa: "/ˈbʊk.ʃelf/", acts: ["borrow_a_book", "return_the_book", "read_travel_magazine"] },
  umbrellastand: { en: "umbrella stand", vi: "giá để ô", ipa: "/ʌmˈbrel.ə stænd/", acts: ["leave_umbrella", "take_my_umbrella", "shake_off_raindrops"] },
  chargebar: { en: "charging bar", vi: "bàn sạc điện thoại", ipa: "/ˈtʃɑː.dʒɪŋ bɑː/", acts: ["charge_phone_at_cafe", "unplug_at_cafe", "work_on_laptop", "plug_in_laptop_charger"] },
  cafetable: { en: "café table", vi: "bàn cà phê", ipa: "/ˈkæf.eɪ ˌteɪ.bəl/", acts: ["find_a_seat", "drink_coffee_cafe", "photo_latte_art", "eat_croissant", "eat_my_snack", "work_on_laptop", "clean_your_table", "write_in_journal"] },
  windowseat: { en: "window seat", vi: "chỗ ngồi cạnh cửa sổ", ipa: "/ˈwɪn.dəʊ siːt/", acts: ["sit_by_window", "drink_coffee_cafe", "photo_latte_art", "watch_people_outside"] },
  terrace: { en: "terrace", vi: "sân hiên", ipa: "/ˈter.əs/", acts: ["sit_on_terrace", "drink_coffee_cafe", "eat_my_snack", "enjoy_morning_breeze"] },
  wifisign: { en: "Wi-Fi sign", vi: "biển Wi-Fi", ipa: "/ˈwaɪ.faɪ saɪn/", acts: ["ask_wifi_password", "connect_to_wifi", "ask_why_wifi_slow"] },
  recyclingbin: { en: "recycling bin", vi: "thùng rác tái chế", ipa: "/riːˈsaɪ.klɪŋ bɪn/", acts: ["throw_away_cup", "sort_paper_and_plastic"] }
};

const COUNTER_OBJS = new Set(["menuboard", "barista", "cafecounter", "cashregister", "pastrycase", "tipjar", "loyaltysign", "queuestand"]);
const BAR_OBJS     = new Set(["espressomachine", "pickup", "cupstack", "condiments", "napkins", "straws", "drinkfridge"]);
const SEATING_OBJS = new Set(["cafetable", "windowseat", "cafebooks", "umbrellastand", "recyclingbin"]);
const TERRACE_OBJS = new Set(["terrace", "chargebar", "wifisign"]);

const cafeCatalog = cat("cf_", [
  ["coffee shop", "/ˈkɒf.i ʃɒp/", "quán cà phê", "place"], ["café", "/ˈkæf.eɪ/", "quán cà phê", "place"], ["counter", "/ˈkaʊn.tər/", "quầy", "furniture"],
  ["barista", "/bəˈriː.stə/", "nhân viên pha chế", "people"], ["customer", "/ˈkʌs.tə.mər/", "khách hàng", "people"], ["menu", "/ˈmen.juː/", "thực đơn", "other"],
  ["espresso", "/eˈspres.əʊ/", "cà phê espresso", "drink"], ["latte", "/ˈlɑː.teɪ/", "cà phê latte", "drink"], ["cappuccino", "/ˌkæp.əˈtʃiː.nəʊ/", "cà phê cappuccino", "drink"],
  ["americano", "/əˌmer.ɪˈkɑː.nəʊ/", "cà phê americano", "drink"], ["iced coffee", "/ˌaɪst ˈkɒf.i/", "cà phê đá", "drink"], ["tea", "/tiː/", "trà", "drink"],
  ["hot chocolate", "/ˌhɒt ˈtʃɒk.lət/", "sô-cô-la nóng", "drink"], ["croissant", "/ˈkwæs.ɒ̃/", "bánh sừng bò", "food"], ["muffin", "/ˈmʌf.ɪn/", "bánh nướng xốp", "food"],
  ["cookie", "/ˈkʊk.i/", "bánh quy", "food"], ["sandwich", "/ˈsæn.wɪdʒ/", "bánh mì kẹp", "food"], ["small", "/smɔːl/", "cỡ nhỏ", "size"],
  ["medium", "/ˈmiː.di.əm/", "cỡ vừa", "size"], ["large", "/lɑːdʒ/", "cỡ lớn", "size"], ["cup", "/kʌp/", "cốc", "other"], ["lid", "/lɪd/", "nắp", "other"],
  ["straw", "/strɔː/", "ống hút", "other"], ["napkin", "/ˈnæp.kɪn/", "khăn giấy", "other"], ["sugar", "/ˈʃʊɡ.ər/", "đường", "food"], ["milk", "/mɪlk/", "sữa", "drink"],
  ["cash register", "/ˈkæʃ ˌredʒ.ɪ.stər/", "máy tính tiền", "equipment"], ["card reader", "/ˈkɑːd ˌriː.dər/", "máy quẹt thẻ", "equipment"], ["receipt", "/rɪˈsiːt/", "hoá đơn", "other"],
  ["cash", "/kæʃ/", "tiền mặt", "money"], ["change", "/tʃeɪndʒ/", "tiền thối", "money"], ["tip jar", "/ˈtɪp dʒɑː/", "hũ tiền boa", "money"],
  ["espresso machine", "/eˈspres.əʊ məˌʃiːn/", "máy pha cà phê", "equipment"], ["coffee beans", "/ˈkɒf.i biːnz/", "hạt cà phê", "food"], ["pastry display", "/ˈpeɪ.stri dɪˌspleɪ/", "tủ bánh", "furniture"],
  ["window seat", "/ˈwɪn.dəʊ siːt/", "chỗ ngồi cạnh cửa sổ", "furniture"], ["table", "/ˈteɪ.bəl/", "cái bàn", "furniture"], ["chair", "/tʃeər/", "cái ghế", "furniture"],
  ["Wi-Fi password", "/ˈwaɪ.faɪ ˈpɑːs.wɜːd/", "mật khẩu Wi-Fi", "other"], ["recycling bin", "/riːˈsaɪ.klɪŋ bɪn/", "thùng rác tái chế", "other"], ["to go", "/tə ɡəʊ/", "mang đi", "other"],
  ["flat white", "/ˌflæt ˈwaɪt/", "cà phê flat white", "drink"], ["mocha", "/ˈmɒk.ə/", "cà phê mocha", "drink"], ["matcha latte", "/ˈmætʃ.ə ˈlɑː.teɪ/", "matcha latte", "drink"],
  ["lemonade", "/ˌlem.əˈneɪd/", "nước chanh", "drink"], ["smoothie", "/ˈsmuː.ði/", "sinh tố", "drink"], ["iced tea", "/ˌaɪst ˈtiː/", "trà đá", "drink"],
  ["oat milk", "/ˈəʊt mɪlk/", "sữa yến mạch", "drink"], ["soy milk", "/ˈsɔɪ mɪlk/", "sữa đậu nành", "drink"], ["whipped cream", "/wɪpt kriːm/", "kem tươi", "food"],
  ["extra shot", "/ˈek.strə ʃɒt/", "thêm một shot espresso", "other"], ["decaf", "/ˈdiː.kæf/", "cà phê khử caffeine", "drink"], ["cheesecake", "/ˈtʃiːz.keɪk/", "bánh phô mai", "food"],
  ["banana bread", "/bəˈnɑː.nə bred/", "bánh chuối nướng", "food"], ["loyalty card", "/ˈlɔɪ.əl.ti kɑːd/", "thẻ tích điểm", "money"], ["stamp", "/stæmp/", "con dấu", "other"],
  ["refill", "/ˈriː.fɪl/", "ly rót thêm", "drink"], ["latte art", "/ˈlɑː.teɪ ɑːt/", "hình vẽ bọt sữa", "other"], ["power outlet", "/ˈpaʊ.ər ˌaʊt.let/", "ổ cắm điện", "equipment"],
  ["terrace", "/ˈter.əs/", "sân hiên", "place"], ["bookshelf", "/ˈbʊk.ʃelf/", "kệ sách", "furniture"], ["umbrella stand", "/ʌmˈbrel.ə stænd/", "giá để ô", "furniture"],
  ["queue", "/kjuː/", "hàng chờ", "other"], ["drinks fridge", "/drɪŋks frɪdʒ/", "tủ nước", "equipment"], ["pickup counter", "/ˈpɪk.ʌp ˌkaʊn.tər/", "quầy nhận đồ", "furniture"]
]);

/* ---------- NPCs + barista replies ---------- */
// {drink} / {price} / {price_vi} are filled from the live world state (size, milk, extras…)
const NPCS = {
  barista: { id: "barista", name: "Barista", role_vi: "Nhân viên pha chế", avatar: "🧑‍🍳", voice: "young_female", room: "cafe_counter",
    lines: {
      greet_barista: { en: "Hi there! What can I get for you?", vi: "Chào bạn! Bạn muốn dùng gì?" },
      read_the_menu: { en: "Take your time. Our latte's really popular.", vi: "Bạn cứ từ từ chọn. Latte ở đây được gọi nhiều lắm." },
      ask_recommendation: { en: "Our flat white's amazing, and the hot ginger tea is so soothing!", vi: "Flat white bên mình ngon lắm, còn trà gừng mật ong nóng thì rất ấm bụng!" },
      ask_no_caffeine: { en: "Sure! We've got hot chocolate, warm chamomile tea, or a decaf latte.", vi: "Có chứ! Có sô-cô-la nóng, trà hoa cúc ấm — hoặc latte khử caffeine." },
      order_a_latte: { en: "Sure! One {drink}. For here or to go?", vi: "Vâng! Một ly {drink}. Dùng ở đây hay mang đi ạ?" },
      order_iced_americano: { en: "Iced americano with oat milk, got it. What size?", vi: "Americano đá sữa yến mạch, mình nhớ rồi. Cỡ nào ạ?" },
      order_cappuccino: { en: "Of course! One cappuccino coming up.", vi: "Dĩ nhiên rồi! Một cappuccino có ngay." },
      order_flat_white: { en: "Good choice! One flat white. Anything else?", vi: "Chọn hay đấy! Một flat white. Bạn cần gì thêm không?" },
      order_mocha: { en: "One mocha with whipped cream. Yum!", vi: "Một mocha kem tươi. Ngon đấy!" },
      order_matcha_latte: { en: "Sure — one matcha latte. Any milk preference?", vi: "Vâng — một matcha latte. Bạn muốn loại sữa nào không?" },
      order_hot_chocolate: { en: "One hot chocolate. Would you like whipped cream on that?", vi: "Một sô-cô-la nóng. Bạn có muốn thêm kem tươi không?" },
      order_espresso: { en: "One espresso. Single or double?", vi: "Một espresso. Một shot hay hai shot ạ?" },
      order_iced_tea: { en: "One tea. Sweetened or unsweetened?", vi: "Một ly trà. Có đường hay không đường ạ?" },
      order_lemonade: { en: "No problem, one lemonade with no ice.", vi: "Không sao, một nước chanh không đá." },
      order_smoothie: { en: "One mango smoothie! It takes a couple of minutes.", vi: "Một sinh tố xoài! Mất vài phút nhé." },
      choose_size: { en: "No problem. One {drink}.", vi: "Không sao ạ. Một ly {drink}." },
      choose_small: { en: "Sure, I'll make it a small. That's {price}.", vi: "Vâng, đổi cỡ nhỏ nhé. Của bạn {price_vi}." },
      make_it_iced: { en: "You got it — one {drink}.", vi: "Được luôn — một ly {drink}." },
      switch_oat_milk: { en: "Oat milk is fifty cents extra. Is that okay?", vi: "Sữa yến mạch thêm 50 xu. Được không ạ?" },
      switch_soy_milk: { en: "Sure, soy milk instead. That's fifty cents extra.", vi: "Vâng, đổi sang sữa đậu nành. Thêm 50 xu nhé." },
      add_extra_shot: { en: "An extra shot — that'll wake you up!", vi: "Thêm một shot — tỉnh cả ngày luôn!" },
      ask_less_sugar: { en: "Sure, I'll go easy on the sugar.", vi: "Vâng, mình cho ít đường thôi." },
      add_whipped_cream: { en: "Whipped cream on top, no problem.", vi: "Thêm kem tươi bên trên, không vấn đề gì." },
      ask_for_takeaway: { en: "Sure, I'll make it to go.", vi: "Vâng, mình làm mang đi nhé." },
      say_for_here: { en: "Great, I'll bring it in a mug.", vi: "Tuyệt, mình sẽ đựng bằng cốc sứ nhé." },
      give_my_name: { en: "Thanks, Lan! I'll call you when it's ready.", vi: "Cảm ơn Lan! Xong mình sẽ gọi bạn nhé." },
      ask_how_much: { en: "That comes to {price}.", vi: "Tổng cộng {price_vi} ạ." },
      pay_by_card: { en: "That's {price}. Just tap your card here.", vi: "Của bạn {price_vi}. Bạn chạm thẻ vào đây nhé." },
      pay_in_cash: { en: "That's {price}. Here's your change.", vi: "Của bạn {price_vi}. Tiền thối của bạn đây." },
      pay_with_phone: { en: "Sure! That's {price}. Hold your phone near the reader.", vi: "Được ạ! {price_vi}. Bạn đưa điện thoại gần máy nhé." },
      use_loyalty_card: { en: "There you go — one more stamp! Two more and the next one's free.", vi: "Xong rồi — thêm một dấu! Thêm hai dấu nữa là ly sau miễn phí." },
      leave_a_tip: { en: "Aw, thank you so much!", vi: "Ôi, cảm ơn bạn nhiều lắm!" },
      take_the_receipt: { en: "Here's your receipt.", vi: "Hoá đơn của bạn đây." },
      wait_for_order: { en: "Your {drink} will be ready in a minute.", vi: "Ly {drink} của bạn sắp xong rồi." },
      check_if_mine: { en: "Yep, that one's yours! Enjoy!", vi: "Đúng rồi, ly đó của bạn! Chúc ngon miệng!" },
      pick_up_drink: { en: "Here's your {drink}! Enjoy!", vi: "{drink} của bạn đây! Chúc ngon miệng!" },
      ask_for_refill: { en: "Sure, refills are free. Here you go!", vi: "Được chứ, rót thêm miễn phí. Của bạn đây!" },
      put_on_lid: { en: "Careful, it's hot!", vi: "Cẩn thận, nóng đấy!" },
      ask_for_straw: { en: "Straws are right next to the napkins.", vi: "Ống hút ở ngay cạnh khăn giấy." },
      ask_wifi_password: { en: "The password is COFFEE123.", vi: "Mật khẩu là COFFEE123." },
      charge_phone_at_cafe: { en: "Sure! There's an outlet on the charging bar.", vi: "Được chứ! Có ổ cắm ở bàn sạc." },
      sit_on_terrace: { en: "Of course! It's lovely out there today.", vi: "Dĩ nhiên rồi! Hôm nay ngoài đó dễ chịu lắm." },
      borrow_a_book: { en: "Go ahead! Just put it back when you're done.", vi: "Cứ tự nhiên! Đọc xong để lại kệ giúp mình nhé." },
      join_the_queue: { en: "Yes, this is the line. I'll be with you in a sec!", vi: "Đúng rồi, đây là hàng. Mình phục vụ bạn ngay!" },
      buy_a_croissant: { en: "One croissant. That's $3.50.", vi: "Một bánh sừng bò. Của bạn 3 đô 50." },
      buy_a_muffin: { en: "Blueberry muffin — that's $3.25.", vi: "Muffin việt quất — 3 đô 25 ạ." },
      buy_cheesecake: { en: "One slice of cheesecake. That's $4.50.", vi: "Một miếng bánh phô mai. 4 đô 50 ạ." },
      buy_banana_bread: { en: "Good choice, it's homemade! That's $3.75.", vi: "Chọn hay đấy, bánh nhà làm! 3 đô 75 ạ." },
      ask_to_heat_up: { en: "Sure, give me thirty seconds.", vi: "Được ạ, chờ mình 30 giây nhé." },
      ask_for_a_box: { en: "Here's a box for you.", vi: "Hộp của bạn đây." },
      ask_restroom: { en: "It's just down the hall, on the left.", vi: "Đi thẳng hành lang, bên tay trái ạ." },
      ask_for_water_glass: { en: "Of course. Here's some water.", vi: "Dĩ nhiên. Nước của bạn đây." },
      ask_closing_time: { en: "We close at nine tonight.", vi: "Tối nay quán đóng cửa lúc 9 giờ." },
      grab_bottled_water: { en: "I'll add that to your order.", vi: "Mình tính chung vào hoá đơn nhé." },
      grab_a_juice: { en: "Good pick! I'll add it to your order.", vi: "Chọn hay đấy! Mình tính chung nhé." },
      say_goodbye: { en: "Thanks! Have a nice day!", vi: "Cảm ơn bạn! Chúc một ngày tốt lành!" }
    } },
  customer: { id: "customer", name: "Customer", role_vi: "Khách hàng", avatar: "🧑‍💻", voice: "young_male", room: "cafe_seating",
    lines: {
      find_a_seat: { en: "Sure, this seat is free.", vi: "Được chứ, chỗ này trống." },
      clean_your_table: { en: "That's nice of you!", vi: "Bạn tốt bụng quá!" },
      photo_latte_art: { en: "Ha, it's too pretty to drink!", vi: "Haha, đẹp quá không nỡ uống!" }
    } }
};
function liveState() {
  try { const E = window.ELW; return E && (typeof E.state === "function" ? E.state() : E.state); } catch (e) { return null; }
}
function fill(text, W, vi) {
  if (!/\{/.test(text)) return text;
  const S = W || CF_W0, p = priceOf(S);
  return text.replace(/\{drink\}/g, drinkName(S)).replace(/\{price\}/g, money(p)).replace(/\{price_vi\}/g, moneyVi(p));
}
function reply(actionId, Wopt) {
  for (const k of Object.keys(NPCS)) {
    const npc = NPCS[k];
    const l = npc && npc.lines && npc.lines[actionId];
    if (l) {
      const W = Wopt || liveState();
      return { who: npc.name, en: fill(l.en, W), vi: fill(l.vi, W, true) };
    }
  }
  return null;
}

/* ---------- missions (ELW_MISSION.register format) ---------- */
const BAR = { id: "barista", name: "Barista", avatar: "🧑‍🍳", voice: "young_female" };
const ids = log => (log || []).map(x => x.id);
function story(log, headEn, headVi, parts, thEn, thVi) {
  const did = ids(log), en = [], vi = [];
  parts.forEach(p => { if (did.includes(p[0])) { en.push(p[1]); vi.push(p[2]); } });
  const j = (a, and) => a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " " + and + " " + a[a.length - 1];
  return { en: headEn + (en.length ? " I " + j(en, "and") + "." : ""), vi: headVi + (vi.length ? " Bạn đã " + j(vi, "và") + "." : ""), mom_en: thEn, mom_vi: thVi };
}
const st = (n, icon, ten, tvi, actions, done, next, hen, hvi) => ({ n, icon, title_en: ten, title_vi: tvi, say_en: ten + ".", say_vi: tvi + ".", actions, done, next: typeof next === "function" ? next : () => next, hint: { en: hen, vi: hvi } });
const ordered = W => W.cf_order !== "none";
const paid = W => W.cf_paid !== "no";
const MISSIONS = [
  { id: "cafe_order_latte", title_en: "Order a latte", title_vi: "Gọi một ly latte", room: "cafe_counter", topic: "cafe", urgency: "normal", giver: BAR,
    desc_vi: "Lần đầu vào quán: đọc thực đơn, gọi latte, trả tiền và nhận đồ uống.",
    request: { en: "Hi! What would you like today?", vi: "Chào bạn! Hôm nay bạn muốn uống gì?" },
    steps: [
      st(1, "📋", "Read the menu", "Đọc thực đơn", ["read_the_menu"], W => W.cf_menu === "read", "read_the_menu", "Look at the menu board.", "Nhìn bảng thực đơn trên tường."),
      st(2, "☕", "Order a latte", "Gọi một ly latte", ["order_a_latte"], ordered, "order_a_latte", "Say: Can I have a medium latte, please?", "Nói: Can I have a medium latte, please?"),
      st(3, "💳", "Pay for it", "Trả tiền", ["pay_by_card", "pay_in_cash", "pay_with_phone"], paid, "pay_by_card", "Pay by card or in cash.", "Trả bằng thẻ hoặc tiền mặt."),
      st(4, "🥤", "Pick up my drink", "Nhận đồ uống", ["pick_up_drink"], W => W.cf_drink !== "none", "pick_up_drink", "Get your latte at the pickup counter.", "Nhận latte ở quầy lấy đồ.")
    ],
    result: log => story(log, "I ordered my first latte!", "Bạn đã gọi ly latte đầu tiên!", [["read_the_menu", "read the menu", "đọc thực đơn"], ["order_a_latte", "ordered a latte", "gọi latte"], ["pay_by_card", "paid by card", "trả bằng thẻ"], ["pay_in_cash", "paid in cash", "trả tiền mặt"], ["pay_with_phone", "paid with my phone", "trả bằng điện thoại"], ["pick_up_drink", "picked up my drink", "nhận đồ uống"]], "Enjoy your latte!", "Chúc bạn ngon miệng!") },
  { id: "cafe_coffee_to_go", title_en: "Coffee to go", title_vi: "Cà phê mang đi", room: "cafe_counter", topic: "cafe", urgency: "high", giver: BAR,
    desc_vi: "Bạn đang vội: gọi đồ mang đi, trả bằng thẻ, đậy nắp và chào tạm biệt.",
    request: { en: "In a hurry? I can make it to go!", vi: "Bạn đang vội à? Mình làm mang đi nhé!" },
    steps: [
      st(1, "🥡", "Order to go", "Gọi đồ mang đi", ["order_a_latte", "ask_for_takeaway"], W => ordered(W) && W.cf_togo === "togo",
        W => ordered(W) ? "ask_for_takeaway" : "order_a_latte", "Order a latte, then say: Can I get it to go?", "Gọi latte rồi nói: Can I get it to go?"),
      st(2, "💳", "Pay by card", "Trả bằng thẻ", ["pay_by_card"], W => W.cf_paid === "card", "pay_by_card", "Tap your card on the card reader.", "Chạm thẻ vào máy quẹt thẻ."),
      st(3, "🥤", "Put on a lid", "Đậy nắp cốc", ["put_on_lid"], W => W.cf_lid === "yes", "put_on_lid", "Lids are next to the cups.", "Nắp ở cạnh chồng cốc."),
      st(4, "👋", "Say goodbye", "Chào tạm biệt", ["say_goodbye"], W => W.cf_bye === "yes", "say_goodbye", "Say: Thanks! Bye! Have a nice day!", "Nói: Thanks! Bye! Have a nice day!")
    ],
    result: log => story(log, "Coffee to go, done!", "Mua cà phê mang đi xong!", [["ask_for_takeaway", "ordered it to go", "gọi đồ mang đi"], ["pay_by_card", "paid by card", "trả bằng thẻ"], ["put_on_lid", "put on a lid", "đậy nắp"], ["say_goodbye", "said goodbye", "chào tạm biệt"]], "See you tomorrow!", "Hẹn gặp lại ngày mai!") },
  { id: "cafe_study", title_en: "Study at the café", title_vi: "Học bài ở quán cà phê", room: "cafe_counter", topic: "cafe", urgency: "normal", giver: BAR,
    desc_vi: "Ngồi học ở quán: gọi đồ, trả tiền, ngồi cạnh cửa sổ, hỏi Wi-Fi và thưởng thức latte.",
    request: { en: "Want to study here? The window seat is quiet.", vi: "Bạn muốn ngồi học à? Chỗ cạnh cửa sổ yên tĩnh lắm." },
    steps: [
      st(1, "☕", "Order a latte", "Gọi một ly latte", ["order_a_latte"], ordered, "order_a_latte", "Order at the counter.", "Gọi đồ ở quầy."),
      st(2, "💳", "Pay for it", "Trả tiền", ["pay_by_card", "pay_in_cash", "pay_with_phone"], paid, "pay_by_card", "Pay by card or in cash.", "Trả bằng thẻ hoặc tiền mặt."),
      st(3, "🪟", "Sit by the window", "Ngồi cạnh cửa sổ", ["sit_by_window"], W => W.cf_seat === "window", "sit_by_window", "Go to the window seat.", "Tới chỗ ngồi cạnh cửa sổ."),
      st(4, "📶", "Ask for the Wi-Fi password", "Hỏi mật khẩu Wi-Fi", ["ask_wifi_password"], W => W.cf_wifi === "yes", "ask_wifi_password", "Say: Excuse me, what's the Wi-Fi password?", "Nói: Excuse me, what's the Wi-Fi password?"),
      st(5, "😋", "Drink my latte", "Uống latte", ["drink_coffee_cafe"], W => W.cf_drink === "empty" || W.cf_drink === "trash", "drink_coffee_cafe", "Enjoy your latte by the window.", "Thưởng thức latte cạnh cửa sổ.")
    ],
    result: log => story(log, "A great study break!", "Một buổi học thật tuyệt!", [["order_a_latte", "ordered a latte", "gọi latte"], ["sit_by_window", "sat by the window", "ngồi cạnh cửa sổ"], ["ask_wifi_password", "got the Wi-Fi password", "hỏi mật khẩu Wi-Fi"], ["drink_coffee_cafe", "drank my latte", "uống latte"]], "Good luck with your studies!", "Chúc bạn học tốt!") },
  /* ---- v2 missions ---- */
  { id: "cafe_my_way", title_en: "Order it your way", title_vi: "Gọi món theo ý mình", room: "cafe_counter", topic: "cafe", urgency: "normal", giver: BAR,
    desc_vi: "Gọi americano đá sữa yến mạch, thêm shot, trả bằng điện thoại và xin ống hút.",
    request: { en: "Morning! Want the usual, or something different today?", vi: "Chào buổi sáng! Như mọi khi hay hôm nay đổi món?" },
    steps: [
      st(1, "🧊", "Order an iced americano", "Gọi americano đá", ["order_iced_americano"], W => ordered(W) && W.cf_item === "americano", "order_iced_americano", "Say: Can I get an iced americano with oat milk?", "Nói: Can I get an iced americano with oat milk?"),
      st(2, "➕", "Add an extra shot", "Thêm một shot", ["add_extra_shot"], W => W.cf_shot === "yes", "add_extra_shot", "Say: Can you add an extra shot?", "Nói: Can you add an extra shot?"),
      st(3, "📱", "Pay with my phone", "Trả bằng điện thoại", ["pay_with_phone"], W => W.cf_paid === "phone", "pay_with_phone", "Say: Can I pay with my phone?", "Nói: Can I pay with my phone?"),
      st(4, "🥤", "Ask for a straw", "Xin ống hút", ["ask_for_straw"], W => W.cf_straw === "yes", "ask_for_straw", "Straws are at the milk & sugar station.", "Ống hút ở quầy đường và sữa.")
    ],
    result: log => story(log, "My perfect iced americano!", "Ly americano đá chuẩn ý mình!", [["order_iced_americano", "ordered an iced americano with oat milk", "gọi americano đá sữa yến mạch"], ["add_extra_shot", "added an extra shot", "thêm một shot"], ["pay_with_phone", "paid with my phone", "trả bằng điện thoại"], ["ask_for_straw", "got a straw", "lấy ống hút"]], "See you tomorrow!", "Mai gặp lại nhé!") },
  { id: "cafe_deadline", title_en: "Café with deadlines", title_vi: "Chạy deadline ở quán", room: "cafe_terrace", topic: "cafe", urgency: "high", giver: BAR,
    desc_vi: "Có hạn nộp bài: hỏi Wi-Fi, sạc điện thoại, gọi flat white, trả tiền rồi làm việc trên laptop.",
    request: { en: "Busy day? The charging bar is free.", vi: "Hôm nay bận à? Bàn sạc đang trống đấy." },
    steps: [
      st(1, "📶", "Ask for the Wi-Fi password", "Hỏi mật khẩu Wi-Fi", ["ask_wifi_password"], W => W.cf_wifi === "yes", "ask_wifi_password", "Say: Excuse me, what's the Wi-Fi password?", "Nói: Excuse me, what's the Wi-Fi password?"),
      st(2, "🔌", "Charge my phone", "Sạc điện thoại", ["charge_phone_at_cafe"], W => W.cf_charge !== "no", "charge_phone_at_cafe", "Say: Can I charge my phone here?", "Nói: Can I charge my phone here?"),
      st(3, "☕", "Order a flat white", "Gọi flat white", ["order_flat_white"], W => ordered(W) && W.cf_item === "flat_white", "order_flat_white", "Say: I'd like a flat white, please.", "Nói: I'd like a flat white, please."),
      st(4, "💳", "Pay for it", "Trả tiền", ["pay_by_card", "pay_in_cash", "pay_with_phone"], paid, "pay_by_card", "Pay by card, cash or phone.", "Trả bằng thẻ, tiền mặt hoặc điện thoại."),
      st(5, "💻", "Work on my laptop", "Làm việc trên laptop", ["work_on_laptop"], W => W.cf_work === "yes", "work_on_laptop", "Connect to the Wi-Fi and get to work!", "Kết nối Wi-Fi rồi làm việc thôi!")
    ],
    result: log => story(log, "Deadline: done!", "Xong deadline rồi!", [["ask_wifi_password", "got the Wi-Fi password", "hỏi mật khẩu Wi-Fi"], ["charge_phone_at_cafe", "charged my phone", "sạc điện thoại"], ["order_flat_white", "ordered a flat white", "gọi flat white"], ["work_on_laptop", "finished my work", "làm xong việc"]], "Great job — take a break!", "Giỏi lắm — nghỉ chút đi!") },
  { id: "cafe_terrace_treat", title_en: "A treat on the terrace", title_vi: "Ăn bánh ngoài sân hiên", room: "cafe_counter", topic: "cafe", urgency: "normal", giver: BAR,
    desc_vi: "Gọi sô-cô-la nóng, mua muffin, nhờ hâm nóng rồi ra sân hiên thưởng thức.",
    request: { en: "It's sunny out — perfect for the terrace!", vi: "Trời nắng đẹp — ngồi sân hiên là nhất!" },
    steps: [
      st(1, "🍫", "Order a hot chocolate", "Gọi sô-cô-la nóng", ["order_hot_chocolate"], W => ordered(W) && W.cf_item === "hot_chocolate", "order_hot_chocolate", "Say: Can I get a hot chocolate, please?", "Nói: Can I get a hot chocolate, please?"),
      st(2, "💵", "Pay for it", "Trả tiền", ["pay_in_cash", "pay_by_card", "pay_with_phone"], paid, "pay_in_cash", "Pay in cash: Here you are.", "Trả tiền mặt: Here you are."),
      st(3, "🧁", "Buy a muffin", "Mua bánh muffin", ["buy_a_muffin", "buy_cheesecake", "buy_banana_bread"], W => W.cf_snack !== "none", "buy_a_muffin", "Say: And a blueberry muffin, please.", "Nói: And a blueberry muffin, please."),
      st(4, "🔥", "Ask to heat it up", "Nhờ hâm nóng", ["ask_to_heat_up"], W => W.cf_warm === "yes", "ask_to_heat_up", "Say: Could you heat this up, please?", "Nói: Could you heat this up, please?"),
      st(5, "☀️", "Sit on the terrace", "Ngồi ngoài sân hiên", ["sit_on_terrace"], W => W.cf_seat === "terrace", "sit_on_terrace", "Ask: Is it okay if I sit outside?", "Hỏi: Is it okay if I sit outside?"),
      st(6, "😋", "Eat my cake", "Ăn bánh", ["eat_my_snack"], W => W.cf_snack === "eaten", "eat_my_snack", "Say: Mmm, this is so good!", "Nói: Mmm, this is so good!")
    ],
    result: log => story(log, "What a sweet break!", "Một buổi nghỉ thật ngọt ngào!", [["order_hot_chocolate", "ordered a hot chocolate", "gọi sô-cô-la nóng"], ["buy_a_muffin", "bought a muffin", "mua muffin"], ["ask_to_heat_up", "had it warmed up", "nhờ hâm nóng"], ["sit_on_terrace", "sat on the terrace", "ngồi sân hiên"], ["eat_my_snack", "enjoyed every bite", "ăn ngon lành"]], "Enjoy the sunshine!", "Tận hưởng nắng đẹp nhé!") }
];

/* ---------- Life Challenges (same format as modules/challenge.js CHALLENGES) ---------- */
const T = (id, en, vi, anyOf, len, lvi, o) => Object.assign({ id, title_en: en, title_vi: vi, anyOf, learn_en: len, learn_vi: lvi }, o || {});
const CHALLENGES = [
  { id: "cafe_morning_run", icon: "☕", title_en: "Morning Coffee Run", title_vi: "Ghé quán cà phê buổi sáng", goal_vi: "Chào, gọi món, trả tiền, nhận đồ uống mang đi và đi làm đúng giờ.", minutes: 6,
    requires: ["go_cafe_counter", "order_a_latte", "pay_by_card"], tasks: [
      T("queue", "Join the line", "Xếp hàng", ["join_the_queue"], "line", "hàng chờ", { free: true }),
      T("hi", "Say hello", "Chào nhân viên", ["greet_barista"], "Good morning", "chào buổi sáng"),
      T("menu", "Check the menu", "Xem thực đơn", ["read_the_menu", "ask_recommendation"], "menu", "thực đơn"),
      T("order", "Order a coffee", "Gọi cà phê", ["order_a_latte", "order_cappuccino", "order_flat_white", "order_iced_americano", "order_espresso"], "Can I get …?", "Cho tôi …"),
      T("size", "Choose a size", "Chọn cỡ", ["choose_size", "choose_small"], "size", "cỡ", { free: true }),
      T("togo", "Ask for it to go", "Xin mang đi", ["ask_for_takeaway"], "to go", "mang đi"),
      T("pay", "Pay for it", "Trả tiền", ["pay_by_card", "pay_with_phone", "pay_in_cash"], "pay by card", "trả bằng thẻ"),
      T("stamp", "Use your loyalty card", "Dùng thẻ tích điểm", ["use_loyalty_card"], "loyalty card", "thẻ tích điểm", { free: true }),
      T("pick", "Pick up your drink", "Nhận đồ uống", ["pick_up_drink", "check_if_mine"], "pick up", "nhận"),
      T("lid", "Put on a lid", "Đậy nắp", ["put_on_lid"], "lid", "nắp"),
      T("bye", "Say goodbye", "Chào tạm biệt", ["say_goodbye"], "Have a nice day!", "Chúc một ngày tốt lành!")] },
  { id: "cafe_deadlines", icon: "💻", title_en: "Café with Deadlines", title_vi: "Chạy deadline ở quán cà phê", goal_vi: "Gọi đồ uống, lên mạng, sạc pin và làm việc cho xong.", minutes: 10,
    requires: ["go_cafe_counter", "work_on_laptop"], tasks: [
      T("order", "Order a strong coffee", "Gọi cà phê đậm", ["order_flat_white", "order_iced_americano", "order_espresso", "order_a_latte"], "I'd like …", "Tôi muốn …"),
      T("shot", "Add an extra shot", "Thêm shot", ["add_extra_shot"], "extra shot", "thêm shot", { free: true }),
      T("pay", "Pay for it", "Trả tiền", ["pay_by_card", "pay_with_phone", "pay_in_cash"], "pay", "trả tiền"),
      T("pick", "Pick up your drink", "Nhận đồ uống", ["pick_up_drink"], "pick up", "nhận"),
      T("seat", "Find a seat", "Tìm chỗ ngồi", ["find_a_seat", "sit_by_window"], "Is this seat free?", "Chỗ này trống không?"),
      T("wifi", "Ask for the Wi-Fi password", "Hỏi mật khẩu Wi-Fi", ["ask_wifi_password"], "password", "mật khẩu"),
      T("online", "Connect to the Wi-Fi", "Kết nối Wi-Fi", ["connect_to_wifi"], "connected", "đã kết nối"),
      T("charge", "Charge your phone", "Sạc điện thoại", ["charge_phone_at_cafe"], "charge", "sạc"),
      T("work", "Work on your laptop", "Làm việc trên laptop", ["work_on_laptop"], "deadline", "hạn chót"),
      T("refill", "Get a refill", "Xin rót thêm", ["ask_for_refill"], "refill", "rót thêm", { free: true }),
      T("unplug", "Unplug your phone", "Rút sạc", ["unplug_at_cafe"], "unplug", "rút phích")] },
  { id: "cafe_sweet_break", icon: "🧁", optional: true, title_en: "A Sweet Break on the Terrace", title_vi: "Giờ nghỉ ngọt ngào ở sân hiên", goal_vi: "Chọn bánh, gọi đồ uống không caffeine, ngồi sân hiên và dọn dẹp lịch sự.", minutes: 8,
    requires: ["go_cafe_counter", "sit_on_terrace"], tasks: [
      T("ask", "Ask for something caffeine-free", "Hỏi đồ không caffeine", ["ask_no_caffeine"], "caffeine", "caffeine"),
      T("drink", "Order a drink", "Gọi đồ uống", ["order_hot_chocolate", "order_smoothie", "order_lemonade", "order_iced_tea", "order_matcha_latte"], "I'll have …", "Tôi lấy …"),
      T("sugar", "Ask for less sugar", "Xin ít đường", ["ask_less_sugar"], "less sugar", "ít đường", { free: true }),
      T("cake", "Choose a pastry", "Chọn bánh", ["buy_a_muffin", "buy_cheesecake", "buy_banana_bread"], "a slice of", "một miếng"),
      T("heat", "Ask to heat it up", "Nhờ hâm nóng", ["ask_to_heat_up"], "heat up", "hâm nóng"),
      T("pay", "Pay for it", "Trả tiền", ["pay_in_cash", "pay_by_card", "pay_with_phone"], "Here you are.", "Của bạn đây."),
      T("terrace", "Sit on the terrace", "Ngồi sân hiên", ["sit_on_terrace"], "outside", "bên ngoài"),
      T("eat", "Enjoy your cake", "Thưởng thức bánh", ["eat_my_snack"], "so good", "ngon quá"),
      T("photo", "Take a photo", "Chụp ảnh", ["photo_latte_art"], "photo", "bức ảnh", { free: true }),
      T("napkin", "Grab some napkins", "Lấy khăn giấy", ["grab_napkins"], "napkins", "khăn giấy"),
      T("tip", "Leave a tip", "Để lại tiền boa", ["leave_a_tip"], "tip", "tiền boa"),
      T("clean", "Clean your table", "Lau bàn", ["clean_your_table"], "clean", "lau sạch")] }
];

/* ---------- export shared foundation for topic-cafe-zones.js ---------- */
if (typeof window !== "undefined") {
  window.ELW_CAFE_SHARED = {
    CF_W0, CFV, mkAct, cfA, objG, mirrorState, cat, D,
    once, at, PAID, getDrink, needDrink, SEAT_SPOT, goSeat, ensureSeat,
    ORDER_RESET, orderSeq, orderPre, notOrdered, modPre, hasSnack, needSnack,
    COUNTER_OBJS, BAR_OBJS, SEATING_OBJS, TERRACE_OBJS,
    allObjects: cafeObjectsAll, allActions: cafeActions,
    NPCS, reply, MISSIONS, CHALLENGES,
    priceOf, drinkName, money, moneyVi, fill, liveState,
    CF_PROPS, cafeCss, cafeCatalog, cafeShell, cafeWorld
  };
}
})();

