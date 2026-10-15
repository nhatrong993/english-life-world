/* English Life World — Topic "Siêu thị / At the supermarket" (room id "market", prefix mk_)
   Browser script, load AFTER rooms2.js / details.js / topic-cafe.js. Same room format as rooms2.js:
     window.ELW_ROOMS = Object.assign(window.ELW_ROOMS || {}, { market })
   Also exposes window.ELW_MARKET = { topic, rooms, missions, reply, npcs }.
   Realistic flow: grab a cart / basket → check prices & discounts → pick fruit → weigh it
                   → find the milk / bread / snacks → queue → put items on the counter
                   → ask for a bag → tap card → receipt → pack the bags → return the cart → leave.
   Prerequisite chains are kept ≤ 3 deep: queueing and putting items on the counter happen
   inline inside later actions' seq, so "Tap my card" only needs items in the cart. */
(function () {
"use strict";

const mkAct = (V) => (id, obj, label, labelVi, sentence, vi, key, vk, grammar, chunks, disc, patterns, pre, rawSeq, story, sitOk) => {
  const vocab = vk.map(k => { if (!V[k]) throw new Error("vocab " + k); return V[k]; });
  const words = vocab.map(v => [v[0], v[1], v[3] || "n", v[2]]);
  const seq = (W, ctx) => {
    const steps = rawSeq(W || { ...MK_W0 });
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
    const steps = rawSeq({ ...MK_W0 });
    const finalSets = new Map();
    for (const s of steps) if (s[0] === "set") finalSets.set(s[1], s[2]);
    const allEntries = [...finalSets.entries()];
    const diff = allEntries.filter(([k, v]) => MK_W0[k] !== v);
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
const MKV = {
  cart: ["shopping cart", "/ˈʃɒp.ɪŋ kɑːt/", "xe đẩy mua hàng"], basket: ["basket", "/ˈbɑː.skɪt/", "giỏ"], take: ["take", "/teɪk/", "lấy"],
  price: ["price", "/praɪs/", "giá tiền"], howmuch: ["How much …?", "/haʊ mʌtʃ/", "… bao nhiêu tiền?"], sale: ["on sale", "/ɒn seɪl/", "đang giảm giá"],
  discount: ["discount", "/ˈdɪs.kaʊnt/", "sự giảm giá"], apple: ["apple", "/ˈæp.əl/", "quả táo"], banana: ["banana", "/bəˈnɑː.nə/", "quả chuối"],
  pick: ["pick", "/pɪk/", "chọn, lựa"], weigh: ["weigh", "/weɪ/", "cân"], scale: ["scale", "/skeɪl/", "cái cân"], kilo: ["kilo", "/ˈkiː.ləʊ/", "ki-lô-gam"],
  where: ["Where is …?", "/weər ɪz/", "… ở đâu?"], milk: ["milk", "/mɪlk/", "sữa"], aisle: ["aisle", "/aɪl/", "lối đi giữa các kệ"],
  find: ["find", "/faɪnd/", "tìm"], fridge: ["fridge", "/frɪdʒ/", "tủ lạnh"], date: ["expiry date", "/ɪkˈspaɪə.ri deɪt/", "hạn sử dụng"],
  check: ["check", "/tʃek/", "kiểm tra"], bread: ["bread", "/bred/", "bánh mì"], loaf: ["loaf", "/ləʊf/", "ổ (bánh mì)"], fresh: ["fresh", "/freʃ/", "tươi, mới"],
  chips: ["chips", "/tʃɪps/", "khoai tây chiên (gói)"], cheap: ["cheaper", "/ˈtʃiː.pər/", "rẻ hơn"], expensive: ["expensive", "/ɪkˈspen.sɪv/", "đắt"],
  line: ["line", "/laɪn/", "hàng (người xếp hàng)"], queue: ["queue", "/kjuː/", "xếp hàng; hàng người"], checkout: ["checkout", "/ˈtʃek.aʊt/", "quầy thanh toán"],
  counter: ["counter", "/ˈkaʊn.tər/", "quầy"], put: ["put", "/pʊt/", "đặt, để"], bag: ["bag", "/bæɡ/", "túi"], doyouhave: ["Do you have …?", "/duː juː hæv/", "Bạn có … không?"],
  pay: ["pay", "/peɪ/", "trả tiền"], card: ["card", "/kɑːd/", "thẻ ngân hàng"], tap: ["tap", "/tæp/", "chạm (thẻ)"], receipt: ["receipt", "/rɪˈsiːt/", "hoá đơn"],
  pack: ["pack", "/pæk/", "xếp đồ, đóng gói"], return: ["return", "/rɪˈtɜːn/", "trả lại"], exit: ["exit", "/ˈek.sɪt/", "lối ra"],
  thanks: ["thank you", "/ˈθæŋk juː/", "cảm ơn"], goodbye: ["goodbye", "/ɡʊdˈbaɪ/", "tạm biệt"], cashier: ["cashier", "/kæʃˈɪər/", "thu ngân"],
  orange: ["orange", "/ˈɒr.ɪndʒ/", "quả cam"], mango: ["mango", "/ˈmæŋ.ɡəʊ/", "quả xoài"], ripe: ["ripe", "/raɪp/", "chín"], carrot: ["carrot", "/ˈkær.ət/", "cà rốt"],
  lettuce: ["lettuce", "/ˈlet.ɪs/", "xà lách"], vegetables: ["vegetables", "/ˈvedʒ.tə.bəlz/", "rau củ"], fish: ["fish", "/fɪʃ/", "cá"], halfkilo: ["half a kilo", "/hɑːf ə ˈkiː.ləʊ/", "nửa ký"],
  pork: ["pork", "/pɔːk/", "thịt heo"], slice: ["slice", "/slaɪs/", "thái lát"], thin: ["thinly", "/ˈθɪn.li/", "(một cách) mỏng"], salmon: ["salmon", "/ˈsæm.ən/", "cá hồi"],
  chicken: ["chicken", "/ˈtʃɪk.ɪn/", "thịt gà"], frozen: ["frozen", "/ˈfrəʊ.zən/", "đông lạnh"], dumpling: ["dumplings", "/ˈdʌm.plɪŋz/", "bánh xếp, sủi cảo"],
  icecream: ["ice cream", "/ˌaɪs ˈkriːm/", "kem"], dessert: ["dessert", "/dɪˈzɜːt/", "món tráng miệng"], pack: ["six-pack", "/ˈsɪks.pæk/", "lốc 6 chai"], water: ["water", "/ˈwɔː.tər/", "nước"],
  juice: ["juice", "/dʒuːs/", "nước ép"], nosugar: ["no added sugar", "/nəʊ ˈæd.ɪd ˈʃʊɡ.ər/", "không thêm đường"], inback: ["in the back", "/ɪn ðə bæk/", "trong kho"],
  cake: ["cake", "/keɪk/", "bánh ngọt"], birthday: ["birthday", "/ˈbɜːθ.deɪ/", "sinh nhật"], detergent: ["detergent", "/dɪˈtɜː.dʒənt/", "nước giặt, bột giặt"],
  laundry: ["laundry", "/ˈlɔːn.dri/", "đồ giặt"], tissue: ["tissues", "/ˈtɪʃ.uːz/", "khăn giấy"], box: ["box", "/bɒks/", "cái hộp"], reach: ["reach", "/riːtʃ/", "với tới"],
  help: ["help", "/help/", "giúp đỡ"], shampoo: ["shampoo", "/ʃæmˈpuː/", "dầu gội"], hair: ["hair", "/heər/", "tóc"], toothpaste: ["toothpaste", "/ˈtuːθ.peɪst/", "kem đánh răng"],
  outof: ["be out of", "/biː aʊt əv/", "hết sạch"], wherefind: ["Where can I find …?", "/weər kən aɪ faɪnd/", "Tôi tìm … ở đâu?"], rice: ["rice", "/raɪs/", "gạo"],
  egg: ["eggs", "/eɡz/", "trứng"], dozen: ["a dozen", "/ə ˈdʌz.ən/", "một tá (12)"], broken: ["broken", "/ˈbrəʊ.kən/", "bị vỡ"], sample: ["sample", "/ˈsɑːm.pəl/", "mẫu thử"],
  try: ["try", "/traɪ/", "thử"], promotion: ["promotion", "/prəˈməʊ.ʃən/", "khuyến mãi"], buyone: ["buy one, get one free", "/baɪ wʌn ɡet wʌn friː/", "mua 1 tặng 1"],
  qrcode: ["QR code", "/ˌkjuː ˈɑː kəʊd/", "mã QR"], cash: ["cash", "/kæʃ/", "tiền mặt"], change: ["change", "/tʃeɪndʒ/", "tiền thối"], coupon: ["coupon", "/ˈkuː.pɒn/", "phiếu giảm giá"],
  points: ["points", "/pɔɪnts/", "điểm tích lũy"], member: ["member card", "/ˈmem.bər kɑːd/", "thẻ thành viên"], ecobag: ["eco bag", "/ˈiː.kəʊ bæɡ/", "túi vải dùng nhiều lần"],
  bring: ["bring", "/brɪŋ/", "mang theo"], buy: ["buy", "/baɪ/", "mua"], selfcheckout: ["self-checkout", "/ˌself ˈtʃek.aʊt/", "quầy tự thanh toán"], scan: ["scan", "/skæn/", "quét"],
  machine: ["machine", "/məˈʃiːn/", "máy"], unexpected: ["unexpected", "/ˌʌn.ɪkˈspek.tɪd/", "không mong đợi, bất ngờ"], refund: ["refund", "/ˈriː.fʌnd/", "hoàn tiền"],
  signup: ["sign up", "/saɪn ʌp/", "đăng ký"], loyalty: ["loyalty card", "/ˈlɔɪ.əl.ti kɑːd/", "thẻ thành viên"], deliver: ["deliver", "/dɪˈlɪv.ər/", "giao hàng"],
  heavy: ["heavy", "/ˈhev.i/", "nặng"], close: ["close", "/kləʊz/", "đóng cửa"], tonight: ["tonight", "/təˈnaɪt/", "tối nay"], putback: ["put back", "/pʊt bæk/", "để lại chỗ cũ"],
  need: ["need", "/niːd/", "cần"],
  sanitize: ["sanitizing wipe", "/ˈsæn.ɪ.taɪ.zɪŋ waɪp/", "khăn khử trùng", "n"], healthy: ["healthy", "/ˈhel.θi/", "khỏe mạnh, tốt cho sức khỏe", "adj"],
  wheel: ["wheel", "/wiːl/", "bánh xe", "n"], smooth: ["smooth", "/smuːð/", "êm ái, trơn tru", "adj"], neatly: ["neatly", "/ˈniːt.li/", "gọn gàng", "adv"],
  entrance: ["entrance", "/ˈen.trəns/", "lối vào", "n"], flyer: ["weekly flyer", "/ˈwiːk.li ˈflaɪ.ər/", "tờ rơi khuyến mãi tuần", "n"],
  organic: ["organic", "/ɔːˈɡæn.ɪk/", "hữu cơ", "adj"], save: ["save", "/seɪv/", "tiết kiệm", "v"], avocado: ["avocado", "/ˌæv.əˈkɑː.dəʊ/", "quả bơ", "n"],
  soft: ["soft", "/sɒft/", "mềm", "adj"], strawberry: ["strawberries", "/ˈstrɔː.bər.iz/", "dâu tây", "n"], sweet: ["sweet", "/swiːt/", "ngọt ngào", "adj"],
  broccoli: ["broccoli", "/ˈbrɒk.əl.i/", "bông cải xanh", "n"], soup: ["soup", "/suːp/", "món súp, canh", "n"], sticker: ["barcode sticker", "/ˈbɑː.kəʊd ˈstɪk.ər/", "nhãn mã vạch", "n"],
  grapes: ["seedless grapes", "/ˈsiːd.ləs ɡreɪps/", "nho không hạt", "n"], baguette: ["baguette", "/bæˈɡet/", "bánh mì dài kiểu Pháp", "n"],
  crispy: ["crispy", "/ˈkrɪs.pi/", "giòn rụm", "adj"], wholewheat: ["whole-wheat", "/ˌhəʊlˈwiːt/", "nguyên cám", "adj"], fiber: ["fiber", "/ˈfaɪ.bər/", "chất xơ", "n"],
  yogurt: ["Greek yogurt", "/ɡriːk ˈjɒɡ.ət/", "sữa chua Hy Lạp", "n"], cheddar: ["cheddar cheese", "/ˈtʃed.ər tʃiːz/", "phô mai cheddar", "n"],
  almonds: ["roasted almonds", "/ˈrəʊ.stɪd ˈɑː.məndz/", "hạnh nhân rang", "n"], unsalted: ["unsalted", "/ʌnˈsɔːl.tɪd/", "không ướp muối", "adj"],
  cocoa: ["dark chocolate", "/dɑːk ˈtʃɒk.lət/", "sô-cô-la đen", "n"], shift: ["shift", "/ʃɪft/", "ca làm việc", "n"], busy: ["busy", "/ˈbɪz.i/", "đông đúc, bận rộn", "adj"],
  divider: ["divider bar", "/dɪˈvaɪ.dər bɑː/", "thanh phân cách hàng", "n"], belt: ["conveyor belt", "/kənˈveɪ.ər belt/", "băng chuyền", "n"],
  pin: ["PIN number", "/ˈpɪn ˌnʌm.bər/", "mã PIN", "n"], approved: ["approved", "/əˈpruːvd/", "đã được duyệt", "adj"],
  insulated: ["insulated bag", "/ˈɪn.sjə.leɪ.tɪd bæɡ/", "túi giữ nhiệt", "n"], doublebag: ["double-bag", "/ˈdʌb.əl bæɡ/", "lồng hai lớp túi", "v"],
  leanbeef: ["lean beef", "/liːn biːf/", "thịt bò nạc ít mỡ", "n"], juicy: ["juicy", "/ˈdʒuː.si/", "mềm mọng nước", "adj"],
  berries: ["frozen berries", "/ˈfrəʊ.zən ˈber.iz/", "quả mọng đông lạnh", "n"], melt: ["melt", "/melt/", "tan chảy", "v"],
  herbaltea: ["herbal tea", "/ˈhɜː.bəl tiː/", "trà thảo mộc", "n"], coconut: ["coconut water", "/ˈkəʊ.kə.nʌt ˈwɔː.tər/", "nước dừa", "n"],
  dishsoap: ["dish soap", "/dɪʃ səʊp/", "nước rửa chén", "n"], sponge: ["sponge", "/spʌndʒ/", "miếng bọt biển rửa chén", "n"],
  sunscreen: ["sunscreen", "/ˈsʌn.skriːn/", "kem chống nắng", "n"], sensitive: ["sensitive skin", "/ˈsen.sɪ.tɪv skɪn/", "da nhạy cảm", "n"],
  brownrice: ["brown rice", "/braʊn raɪs/", "gạo lứt", "n"], jasmine: ["jasmine rice", "/ˈdʒæz.mɪn raɪs/", "gạo thơm lài", "n"],
  freerange: ["free-range eggs", "/ˌfriːˈreɪndʒ eɡz/", "trứng gà thả vườn", "n"], dressing: ["sesame dressing", "/ˈses.ə.mi ˈdres.ɪŋ/", "sốt mè rang", "n"],
  allergy: ["allergy", "/ˈæl.ə.dʒi/", "dị ứng", "n"], language: ["language", "/ˈlæŋ.ɡwɪdʒ/", "ngôn ngữ", "n"],
  wallet: ["wallet", "/ˈwɒl.ɪt/", "cái ví", "n"], giftwrap: ["gift bag", "/ɡɪft bæɡ/", "túi đựng quà", "n"], drizzle: ["drizzle", "/ˈdrɪz.əl/", "mưa phùn", "v"]
};
const mkA = mkAct(MKV);

/* ---------- inline helpers ---------- */
const hasBox = W => W.mk_cart === "have" || W.mk_basket === "have";
const needBox = W => hasBox(W) ? null : "Bạn chưa có xe đẩy. Hãy lấy xe đẩy trước (Grab a cart).";
const ITEMS = ["mk_milk", "mk_apples", "mk_bananas", "mk_bread", "mk_chips", "mk_oranges", "mk_mangoes", "mk_veg", "mk_pork", "mk_fish", "mk_chicken",
  "mk_dumplings", "mk_icecream", "mk_water", "mk_juice", "mk_cake", "mk_detergent", "mk_tissues", "mk_shampoo", "mk_toothpaste", "mk_rice", "mk_eggs"];
const hasItems = W => ITEMS.some(k => W[k] !== "none");
const PAID = W => W.mk_paid === "yes";
const needItems = W => PAID(W) ? "Bạn đã trả tiền rồi." :
  !hasItems(W) ? "Giỏ hàng còn trống. Hãy lấy bim bim trước (Grab some chips)." :
  W.mk_apples === "picked" ? "Táo chưa được cân. Hãy cân táo trước (Weigh the apples)." : null;
const needPaid = W => PAID(W) ? null : "Bạn chưa trả tiền. Hãy trả tiền trước (Tap my card).";
// queue + unload the cart inline (keeps auto-fix chains short)
const doQueue = W => W.mk_queue === "yes" ? [] : [["walk", "mk_line"], ["wait", 700], ["set", "mk_queue", "yes"]];
const doUnload = W => W.mk_counter === "yes" ? [] : [...doQueue(W), ["walk", "mk_checkout"], ["pose", "bend", 900], ["set", "mk_counter", "yes"], ["pose", "idle", 1]];
const takePre = (k, msg) => W => W[k] !== "none" ? msg : PAID(W) ? "Bạn đã trả tiền rồi." : null;
const takeProducePre = (k, msg) => W => W[k] !== "none" ? msg : PAID(W) ? "Bạn đã trả tiền rồi." : null;
const take = (spot, k, ms) => W => [["walk", spot], ["pose", "reach", ms || 900], ["set", k, "have"], ["pose", "idle", 1]];
const once = (k, v, msg) => W => W[k] === v ? msg : null;
const at = (spot, pz, ms, sets) => W => [["walk", spot], ["pose", pz, ms], ...sets.map(x => ["set", x[0], x[1]]), ["pose", "idle", 1]];
const reset = () => [["set", "mk_paid", "no"], ["set", "mk_receipt", "no"], ["set", "mk_packed", "no"], ["set", "mk_queue", "no"], ["set", "mk_counter", "no"]];

const marketActions = [
  mkA("grab_a_cart", "shopcart", "Grab a cart", "Lấy xe đẩy", "I'm taking a shopping cart.", "Tôi đang lấy một chiếc xe đẩy.", ["taking", "cart"], ["cart", "take"],
    "<b>shopping cart</b> (Anh-Mỹ) = <b>trolley</b> (Anh-Anh) = xe đẩy siêu thị.", ["I'm taking", "a shopping cart."], ["cart", "card", "cut"],
    ["I'm taking <b>a basket</b>.", "I'm pushing <b>the cart</b>."],
    W => W.mk_cart === "have" ? "Bạn đã có xe đẩy rồi." : null,
    W => [["walk", "mk_carts"], ["pose", "reach", 700], ["set", "mk_cart", "have"], ["pose", "idle", 1]],
    ["grab a cart", "take a shopping cart at the entrance", "lấy xe đẩy"]),
  mkA("take_a_basket", "shopbasket", "Take a basket", "Lấy giỏ", "I only need a few things. I'll take a basket.", "Tôi chỉ cần vài món. Tôi sẽ lấy giỏ.", ["take", "basket"], ["basket", "take"],
    "<b>a few things</b> = vài món. <b>I'll</b> = I will, dùng khi vừa quyết định làm gì.", ["I only need a few things.", "I'll take a basket."], ["basket", "biscuit", "bucket"],
    ["I'll take <b>a cart</b>.", "I only need <b>some milk</b>."],
    W => W.mk_basket === "have" ? "Bạn đã có giỏ rồi." : W.mk_cart === "have" ? "Bạn đã có xe đẩy rồi, không cần giỏ." : null,
    W => [["walk", "mk_baskets"], ["pose", "bend", 700], ["set", "mk_basket", "have"], ["pose", "idle", 1]],
    ["take a basket", "take a small shopping basket", "lấy giỏ mua hàng"]),
  mkA("check_the_price", "pricesign", "Check the price", "Xem giá", "How much are the apples?", "Táo giá bao nhiêu vậy?", ["How", "much", "apples"], ["howmuch", "price", "apple"],
    "<b>How much is</b> + 1 món / <b>How much are</b> + nhiều món (apples). Giá theo cân: <b>per kilo</b>.", ["How much", "are the apples?"], ["much", "match", "march"],
    ["How much is <b>the milk</b>?", "How much are <b>the bananas</b>?"],
    W => W.mk_price === "yes" ? "Bạn đã xem giá rồi." : null,
    W => [["walk", "mk_sign"], ["pose", "read", 1200], ["set", "mk_price", "yes"], ["pose", "idle", 1]],
    ["check the price", "check the price of the apples", "xem giá táo"]),
  mkA("look_for_discount", "pricesign", "Look for a discount", "Tìm hàng giảm giá", "Look! Bananas are on sale today.", "Nhìn kìa! Hôm nay chuối đang giảm giá.", ["Bananas", "on", "sale"], ["sale", "discount", "banana"],
    "<b>on sale</b> = đang giảm giá. <b>20% off</b> = giảm 20%. Hỏi: <b>Is this on sale?</b>", ["Look!", "Bananas are on sale today."], ["sale", "sell", "sail"],
    ["<b>Milk</b> is on sale today.", "Bread is <b>20% off</b>."],
    W => W.mk_sale === "yes" ? "Bạn đã thấy biển giảm giá rồi." : null,
    W => [["walk", "mk_sign"], ["pose", "point", 900], ["set", "mk_sale", "yes"], ["pose", "idle", 1]],
    ["look for a discount", "look at the discount sign", "tìm hàng giảm giá"]),
  mkA("pick_some_apples", "produce", "Pick some apples", "Chọn táo", "I'm picking some red apples.", "Tôi đang chọn mấy quả táo đỏ.", ["picking", "apples"], ["pick", "apple"],
    "<b>some</b> + danh từ số nhiều: some apple<b>s</b>. Tính từ đứng trước danh từ: <b>red</b> apples.", ["I'm picking", "some red apples."], ["apples", "ample", "able"],
    ["I'm picking some <b>green</b> apples.", "I'm picking some <b>oranges</b>."],
    W => W.mk_apples !== "none" ? "Bạn đã chọn táo rồi." : PAID(W) ? "Bạn đã trả tiền rồi." : null,
    W => [["walk", "mk_produce"], ["pose", "reach", 1000], ["set", "mk_apples", "picked"], ["pose", "idle", 1]],
    ["pick some apples", "pick some fresh red apples", "chọn táo"]),
  mkA("weigh_the_apples", "fruitscale", "Weigh the apples", "Cân táo", "I'm weighing the apples. One kilo!", "Tôi đang cân táo. Một ký!", ["weighing", "kilo"], ["weigh", "scale", "kilo"],
    "<b>weigh</b> đọc /weɪ/ giống <b>way</b> — chữ <b>gh</b> câm. Ở siêu thị, rau quả phải cân và dán tem giá.", ["I'm weighing the apples.", "One kilo!"], ["weigh", "way", "white"],
    ["I'm weighing <b>the bananas</b>.", "<b>Half a kilo</b>, please."],
    W => W.mk_apples === "none" ? "Bạn chưa có táo. Hãy chọn táo trước (Pick some apples)." : W.mk_apples === "weighed" ? "Bạn đã cân táo rồi." : null,
    W => [["walk", "mk_scale"], ["pose", "reach", 600], ["wait", 700], ["set", "mk_apples", "weighed"], ["pose", "idle", 1]],
    ["weigh the apples", "weigh the apples on the scale", "cân táo"]),
  mkA("take_some_bananas", "produce", "Take some bananas", "Lấy chuối", "They're on sale, so I'll take some bananas.", "Đang giảm giá nên tôi sẽ lấy ít chuối.", ["on sale", "bananas"], ["banana", "sale", "take"],
    "<b>so</b> = nên, vì vậy (nối nguyên nhân → kết quả). Chuối bán theo nải: <b>a bunch of</b> bananas.", ["They're on sale,", "so I'll take some bananas."], ["bananas", "bandanas", "banners"],
    ["I'll take <b>a bunch of</b> bananas.", "I'll take <b>some grapes</b>."],
    W => W.mk_bananas !== "none" ? "Bạn đã lấy chuối rồi." : PAID(W) ? "Bạn đã trả tiền rồi." : null,
    W => [["walk", "mk_produce"], ["pose", "reach", 900], ["set", "mk_bananas", "have"], ["pose", "idle", 1]],
    ["take some bananas", "take a bunch of bananas on sale", "lấy chuối"]),
  mkA("ask_where_milk", "dairy", "Ask where the milk is", "Hỏi sữa ở đâu", "Excuse me, where is the milk?", "Xin lỗi, sữa ở đâu vậy?", ["where", "milk"], ["where", "milk", "aisle"],
    "Hỏi đường trong siêu thị: <b>Excuse me, where is</b> + món? Trả lời: <b>It's in aisle 3.</b> (ở lối số 3).", ["Excuse me,", "where is the milk?"], ["milk", "mill", "meal"],
    ["Excuse me, where is <b>the bread</b>?", "Excuse me, where are <b>the eggs</b>?"],
    W => W.mk_askmilk === "yes" ? "Bạn đã hỏi rồi: sữa ở tủ lạnh lối 3." : null,
    W => [["walk", "mk_dairy"], ["pose", "point", 800], ["set", "mk_askmilk", "yes"], ["pose", "idle", 1]],
    ["ask where the milk is", "ask the clerk where the milk is", "hỏi sữa ở đâu"]),
  mkA("find_the_milk", "dairy", "Find the milk", "Tìm sữa", "Here's the milk! I'll take one bottle.", "Sữa đây rồi! Tôi lấy một chai.", ["milk", "bottle"], ["find", "milk", "fridge"],
    "<b>Here's</b> = Here is: đây rồi. Sữa không đếm được → đếm bằng vật chứa: <b>a bottle of</b> milk, <b>a carton of</b> milk.", ["Here's the milk!", "I'll take one bottle."], ["bottle", "battle", "button"],
    ["Here's <b>the yogurt</b>!", "I'll take <b>a carton of</b> milk."],
    takeProducePre("mk_milk", "Bạn đã lấy sữa rồi."),
    W => [["walk", "mk_dairy"], ["pose", "reach", 1000], ["set", "mk_milk", "have"], ["pose", "idle", 1]],
    ["find the milk", "find the milk in the dairy fridge", "tìm sữa"]),
  mkA("check_the_date", "dairy", "Check the expiry date", "Xem hạn sử dụng", "I'm checking the date. It's fresh.", "Tôi đang xem hạn sử dụng. Còn mới.", ["checking", "date"], ["check", "date", "fresh"],
    "Trên bao bì: <b>Best before</b> / <b>Use by</b> + ngày = hạn sử dụng. <b>expired</b> = hết hạn.", ["I'm checking the date.", "It's fresh."], ["date", "data", "day"],
    ["<b>Is it fresh?</b>", "Oh no, it's <b>expired</b>."],
    W => W.mk_milk === "none" ? "Bạn chưa có sữa. Hãy tìm sữa trước (Find the milk)." : W.mk_date === "yes" ? "Bạn đã xem hạn sử dụng rồi." : null,
    W => [["walk", "mk_dairy"], ["pose", "read", 1200], ["set", "mk_date", "yes"], ["pose", "idle", 1]],
    ["check the expiry date", "check the date on the milk", "xem hạn sử dụng của sữa"]),
  mkA("get_some_bread", "bakery", "Get some bread", "Lấy bánh mì", "I'm getting a loaf of bread.", "Tôi đang lấy một ổ bánh mì.", ["loaf", "bread"], ["bread", "loaf", "fresh"],
    "<b>bread</b> không đếm được: <b>a loaf of</b> bread (một ổ), <b>a slice of</b> bread (một lát).", ["I'm getting", "a loaf of bread."], ["bread", "bred", "bride"],
    ["I'm getting <b>some rolls</b>.", "I'm getting <b>a cake</b>."],
    W => W.mk_bread !== "none" ? "Bạn đã lấy bánh mì rồi." : PAID(W) ? "Bạn đã trả tiền rồi." : null,
    W => [["walk", "mk_bakery"], ["pose", "reach", 900], ["set", "mk_bread", "have"], ["pose", "idle", 1]],
    ["get some bread", "get a fresh loaf of bread", "lấy bánh mì"]),
  mkA("grab_some_chips", "snacks", "Grab some chips", "Lấy bim bim", "I'm grabbing a bag of chips.", "Tôi đang lấy một gói khoai tây chiên.", ["bag", "chips"], ["chips", "bag"],
    "<b>chips</b> (Mỹ) = <b>crisps</b> (Anh) = khoai tây lát chiên giòn. <b>a bag of</b> = một gói.", ["I'm grabbing", "a bag of chips."], ["chips", "cheap", "ships"],
    ["I'm grabbing <b>a box of cookies</b>.", "I'm grabbing <b>a bar of chocolate</b>."],
    takePre("mk_chips", "Bạn đã lấy bim bim rồi."),
    W => [["walk", "mk_snacks"], ["pose", "reach", 800], ["set", "mk_chips", "have"], ["pose", "idle", 1]],
    ["grab some chips", "grab a bag of chips in the snack aisle", "lấy bim bim"]),
  mkA("compare_prices", "snacks", "Compare prices", "So sánh giá", "This one is cheaper than that one.", "Gói này rẻ hơn gói kia.", ["cheaper", "than"], ["cheap", "expensive", "price"],
    "So sánh hơn: tính từ ngắn + <b>-er than</b>: cheap → <b>cheaper than</b>. Tính từ dài: <b>more expensive than</b>.", ["This one is cheaper", "than that one."], ["cheaper", "chapter", "keeper"],
    ["This one is <b>bigger</b> than that one.", "This one is <b>more expensive</b>."],
    W => W.mk_compare === "yes" ? "Bạn đã so sánh giá rồi." : null,
    W => [["walk", "mk_snacks"], ["pose", "read", 1300], ["set", "mk_compare", "yes"], ["pose", "idle", 1]],
    ["compare prices", "compare the prices of two snacks", "so sánh giá"]),
  mkA("queue_at_checkout", "checkout", "Queue at the checkout", "Xếp hàng thanh toán", "I'm waiting in line at the checkout.", "Tôi đang xếp hàng ở quầy thanh toán.", ["waiting", "line"], ["line", "queue", "checkout"],
    "<b>wait in line</b> (Mỹ) = <b>queue</b> (Anh) = xếp hàng. Hỏi: <b>Are you in line?</b> (Bạn đang xếp hàng à?)", ["I'm waiting in line", "at the checkout."], ["line", "lane", "lion"],
    ["<b>Are you in line?</b>", "I'm waiting in line <b>at the bank</b>."],
    W => needItems(W) || (W.mk_queue === "yes" ? "Bạn đang xếp hàng rồi." : null),
    W => [...doQueue(W), ["pose", "idle", 1]],
    ["queue at the checkout", "wait in line at the checkout", "xếp hàng ở quầy thanh toán"]),
  mkA("put_items_on_counter", "checkout", "Put my items on the counter", "Đặt hàng lên quầy", "I'm putting my things on the counter.", "Tôi đang đặt đồ lên quầy.", ["putting", "counter"], ["put", "counter", "checkout"],
    "<b>put</b> + đồ + <b>on</b> + chỗ: put my things <b>on</b> the counter. <b>things</b> = đồ đạc, món hàng.", ["I'm putting my things", "on the counter."], ["counter", "country", "center"],
    ["I'm putting <b>the milk</b> on the counter.", "I'm putting my things <b>in the bag</b>."],
    W => needItems(W) || (W.mk_counter === "yes" ? "Bạn đã đặt hàng lên quầy rồi." : null),
    W => [...doUnload(W)],
    ["put my items on the counter", "put everything on the checkout counter", "đặt hàng lên quầy"]),
  mkA("ask_for_a_bag", "checkout", "Ask for a bag", "Xin túi", "Do you have a bag?", "Bạn có túi không?", ["have", "bag"], ["doyouhave", "bag"],
    "Hỏi có hay không: <b>Do you have</b> + món? Trả lời: <b>Yes, it's 10 cents.</b> Nhiều siêu thị tính tiền túi nilon.", ["Do you have", "a bag?"], ["bag", "back", "big"],
    ["Do you have <b>a paper bag</b>?", "Do you have <b>a bigger bag</b>?"],
    W => W.mk_bag !== "none" ? "Bạn đã có túi rồi." : null,
    W => [["walk", "mk_checkout"], ["pose", "point", 700], ["set", "mk_bag", "have"], ["pose", "idle", 1]],
    ["ask for a bag", "ask the cashier for a shopping bag", "xin túi đựng"]),
  mkA("tap_my_card", "cardreader", "Tap my card", "Chạm thẻ thanh toán", "Can I pay by card? I'll just tap it.", "Tôi trả bằng thẻ được không? Tôi chạm thẻ nhé.", ["pay", "card", "tap"], ["pay", "card", "tap"],
    "<b>pay by card</b> = trả bằng thẻ. <b>tap</b> = chạm thẻ không tiếp xúc; <b>insert</b> = cắm thẻ; <b>PIN</b> = mã số.", ["Can I pay by card?", "I'll just tap it."], ["tap", "top", "tape"],
    ["Can I pay <b>with my phone</b>?", "Can I pay <b>in cash</b>?"],
    W => needItems(W),
    W => [...doUnload(W), ["walk", "mk_reader"], ["spawn", "mk_cardP"], ["pose", "reach", 900], ["despawn"], ["set", "mk_paid", "yes"], ["pose", "idle", 1]],
    ["tap my card", "pay by card at the card reader", "trả bằng thẻ"]),
  mkA("get_the_receipt", "checkout", "Get my receipt", "Nhận hoá đơn", "Could I have the receipt, please?", "Cho tôi xin hoá đơn được không?", ["receipt", "please"], ["receipt"],
    "<b>Could I have …?</b> lịch sự hơn <b>Can I have …?</b>. <b>receipt</b> /rɪˈsiːt/ — chữ <b>p</b> câm.", ["Could I have", "the receipt, please?"], ["receipt", "recipe", "reset"],
    ["Could I have <b>a bag</b>, please?", "Could I have <b>a pen</b>, please?"],
    W => needPaid(W) || (W.mk_receipt === "yes" ? "Bạn đã nhận hoá đơn rồi." : null),
    W => [["walk", "mk_checkout"], ["pose", "reach", 500], ["spawn", "mk_receiptP"], ["wait", 500], ["despawn"], ["set", "mk_receipt", "yes"], ["pose", "idle", 1]],
    ["get my receipt", "get the receipt from the cashier", "nhận hoá đơn"]),
  mkA("pack_the_bags", "bags", "Pack the bags", "Xếp đồ vào túi", "I'm packing my groceries into the bags.", "Tôi đang xếp đồ vào túi.", ["packing", "bags"], ["pack", "bag"],
    "<b>groceries</b> = đồ mua ở siêu thị (thực phẩm). Mẹo: đồ nặng xếp dưới, <b>bread</b> và trứng để trên.", ["I'm packing my groceries", "into the bags."], ["pack", "back", "pick"],
    ["I'm packing <b>the heavy things</b> first.", "I'm putting <b>the bread on top</b>."],
    W => needPaid(W) || (W.mk_packed === "yes" ? "Bạn đã xếp đồ vào túi rồi." : null),
    W => [["walk", "mk_bags"], ...(W.mk_bag === "none" ? [["pose", "reach", 500], ["set", "mk_bag", "have"]] : []), ["pose", "bend", 1300], ["set", "mk_packed", "yes"], ["pose", "idle", 1]],
    ["pack the bags", "pack my groceries into the bags", "xếp đồ vào túi"]),
  mkA("return_the_cart", "shopcart", "Return the cart", "Trả xe đẩy", "I'm returning the cart.", "Tôi đang trả xe đẩy về chỗ cũ.", ["returning", "cart"], ["return", "cart"],
    "<b>return</b> = trả lại, đưa về chỗ cũ. Lịch sự ở siêu thị: luôn trả xe đẩy về chỗ để xe.", ["I'm returning", "the cart."], ["return", "retire", "turn"],
    ["I'm returning <b>the basket</b>.", "I'm putting <b>the cart</b> back."],
    W => W.mk_cart === "returned" ? "Bạn đã trả xe đẩy rồi." : W.mk_cart !== "have" ? "Bạn chưa có xe đẩy. Hãy lấy xe đẩy trước (Grab a cart)." : null,
    W => [["walk", "mk_carts"], ["pose", "reach", 800], ["set", "mk_cart", "returned"], ["pose", "idle", 1]],
    ["return the cart", "return the shopping cart to the cart area", "trả xe đẩy"]),
  mkA("leave_the_store", "exitdoor", "Leave the store", "Ra về", "Thank you! Goodbye!", "Cảm ơn! Tạm biệt!", ["Thank", "Goodbye"], ["thanks", "goodbye", "exit"],
    "Chào thu ngân khi ra về: <b>Thank you! Goodbye!</b> hoặc <b>Thanks, have a good one!</b>", ["Thank you!", "Goodbye!"], ["goodbye", "good buy", "good boy"],
    ["Thanks, <b>see you next week</b>!", "Thanks, <b>have a good one</b>!"],
    W => W.mk_left === "yes" ? "Bạn đã ra về rồi." : hasItems(W) && !PAID(W) ? "Bạn chưa trả tiền! Hãy trả tiền trước (Tap my card)." : null,
    W => [["walk", "mke_greeter"], ["pose", "point", 600], ["walk", "mke_door"], ["set", "mk_left", "yes"], ["pose", "idle", 1]],
    ["leave the store", "say goodbye and leave the supermarket", "chào và ra về"]),

  /* ===== v2: fruit & veg ===== */
  mkA("pick_some_oranges", "produce", "Pick some oranges", "Lấy cam", "I'll take a few of these oranges.", "Mình lấy vài quả cam này.", ["oranges"], ["orange", "take"],
    "<b>a few of these</b> + danh từ số nhiều = vài cái trong số này.", ["I'll take a few", "of these oranges."], ["oranges", "orange", "arrange"],
    ["I'll take a few of these <b>lemons</b>.", "I'll take <b>a bag of</b> oranges."],
    takeProducePre("mk_oranges", "Bạn đã lấy cam rồi."), take("mk_produce", "mk_oranges"),
    ["pick some oranges", "pick a few juicy oranges", "lấy cam"]),
  mkA("ask_mangoes_ripe", "produce", "Choose some mangoes", "Chọn xoài", "Are these mangoes ripe? I'll take two.", "Xoài này chín chưa? Mình lấy hai quả.", ["mangoes", "ripe"], ["mango", "ripe"],
    "<b>ripe</b> = chín (trái cây). Chưa chín: <b>not ripe yet</b>; chín quá: <b>overripe</b>.", ["Are these mangoes ripe?", "I'll take two."], ["ripe", "rope", "rip"],
    ["Are these <b>avocados</b> ripe?", "Are these mangoes <b>sweet</b>?"],
    takeProducePre("mk_mangoes", "Bạn đã lấy xoài rồi."), take("mk_produce", "mk_mangoes", 1100),
    ["choose some ripe mangoes", "choose two ripe mangoes", "chọn xoài chín"]),
  mkA("get_some_vegetables", "produce", "Get some vegetables", "Lấy rau củ", "I'll grab some carrots and a head of lettuce.", "Mình lấy ít cà rốt và một cây xà lách.", ["carrots", "lettuce"], ["carrot", "lettuce", "vegetables"],
    "<b>a head of</b> lettuce/cabbage = một cây xà lách/bắp cải. carrot<b>s</b> đếm được nên thêm s.", ["I'll grab some carrots", "and a head of lettuce."], ["lettuce", "letters", "let us"],
    ["I'll grab some <b>tomatoes</b> and <b>an onion</b>.", "I'll grab <b>a head of cabbage</b>."],
    takeProducePre("mk_veg", "Bạn đã lấy rau rồi."), take("mk_produce", "mk_veg"),
    ["get some vegetables", "get some carrots and lettuce", "lấy rau củ"]),

  /* ===== v2: meat & fish counter ===== */
  mkA("ask_if_fresh", "meatcounter", "Ask if it's fresh", "Hỏi có tươi không", "Is the fish fresh today?", "Cá hôm nay có tươi không ạ?", ["fresh", "today"], ["fresh", "fish"],
    "<b>Is … fresh today?</b> = hôm nay … có tươi không? Đáp: <b>Yes, it came in this morning.</b>", ["Is the fish", "fresh today?"], ["fresh", "flesh", "French"],
    ["Is the <b>bread</b> fresh today?", "<b>When did it come in</b>?"],
    once("mk_askfresh", "yes", "Bạn đã hỏi rồi: cá mới về sáng nay."), at("mk_meat", "point", 700, [["mk_askfresh", "yes"]]),
    ["ask if the fish is fresh", "ask the butcher if the fish is fresh today", "hỏi cá có tươi không"]),
  mkA("order_some_pork", "meatcounter", "Order some pork", "Mua thịt heo", "Could I get half a kilo of pork, please?", "Cho mình nửa ký thịt heo nhé.", ["half a kilo", "pork"], ["halfkilo", "pork"],
    "<b>half a kilo</b> = nửa ký (không nói “a half kilo”). <b>pork</b> = thịt heo, <b>beef</b> = thịt bò.", ["Could I get half a kilo", "of pork, please?"], ["pork", "park", "poke"],
    ["Could I get half a kilo of <b>beef</b>, please?", "Could I get <b>300 grams</b> of pork?"],
    takePre("mk_pork", "Bạn đã mua thịt heo rồi."), W => [["walk", "mk_meat"], ["pose", "point", 700], ["wait", 700], ["pose", "reach", 600], ["set", "mk_pork", "have"], ["pose", "idle", 1]],
    ["order some pork", "order half a kilo of pork at the meat counter", "mua nửa ký thịt heo"]),
  mkA("ask_to_slice", "meatcounter", "Ask to slice it", "Nhờ thái mỏng", "Could you slice it thinly for me?", "Bạn thái mỏng giúp mình nhé?", ["slice", "thinly"], ["slice", "thin"],
    "<b>thinly</b> = mỏng (trạng từ: thin + ly). <b>Could you … for me?</b> = nhờ làm giúp.", ["Could you slice it", "thinly for me?"], ["slice", "slight", "sly"],
    ["Could you <b>mince</b> it for me?", "Could you cut it <b>into cubes</b>?"],
    W => W.mk_pork === "none" ? "Bạn chưa có thịt. Hãy mua thịt trước (Order some pork)." : W.mk_sliced === "yes" ? "Thịt đã được thái rồi." : null,
    at("mk_meat", "point", 900, [["mk_sliced", "yes"]]),
    ["ask to slice the pork", "ask the butcher to slice the pork thinly", "nhờ thái mỏng thịt"]),
  mkA("buy_fresh_fish", "meatcounter", "Buy some salmon", "Mua cá hồi", "I'll have the salmon fillet, please.", "Cho mình miếng phi lê cá hồi nhé.", ["salmon"], ["salmon", "fish"],
    "<b>salmon</b> /ˈsæm.ən/ — chữ <b>l</b> câm! <b>fillet</b> = miếng phi lê (không xương).", ["I'll have the salmon fillet,", "please."], ["salmon", "sermon", "salon"],
    ["I'll have <b>the shrimp</b>, please.", "I'll have <b>two fillets</b>, please."],
    takePre("mk_fish", "Bạn đã mua cá rồi."), W => [["walk", "mk_meat"], ["pose", "point", 700], ["wait", 600], ["pose", "reach", 600], ["set", "mk_fish", "have"], ["pose", "idle", 1]],
    ["buy some salmon", "buy a salmon fillet at the fish counter", "mua cá hồi"]),
  mkA("buy_chicken", "meatcounter", "Buy some chicken", "Mua thịt gà", "Two chicken breasts, please.", "Cho mình hai miếng ức gà nhé.", ["chicken"], ["chicken"],
    "Gọi nhanh ở quầy thịt: số lượng + món + <b>please</b>. <b>breast</b> = ức; <b>thigh</b> = đùi; <b>wings</b> = cánh.", ["Two chicken breasts,", "please."], ["breasts", "breaths", "brats"],
    ["<b>A whole chicken</b>, please.", "Two chicken <b>thighs</b>, please."],
    takePre("mk_chicken", "Bạn đã mua gà rồi."), W => [["walk", "mk_meat"], ["pose", "point", 600], ["pose", "reach", 600], ["set", "mk_chicken", "have"], ["pose", "idle", 1]],
    ["buy some chicken", "buy two chicken breasts", "mua ức gà"]),

  /* ===== v2: frozen & drinks ===== */
  mkA("get_frozen_dumplings", "freezer", "Get frozen dumplings", "Lấy bánh xếp đông lạnh", "These frozen dumplings are perfect for a quick dinner.", "Bánh xếp đông lạnh này hợp cho bữa tối nhanh gọn.", ["frozen", "dumplings"], ["frozen", "dumpling"],
    "<b>frozen</b> = đông lạnh (V3 của freeze). <b>perfect for</b> = rất hợp cho.", ["These frozen dumplings are perfect", "for a quick dinner."], ["frozen", "chosen", "broken"],
    ["These <b>frozen peas</b> are perfect for soup.", "This is perfect for <b>a quick lunch</b>."],
    takePre("mk_dumplings", "Bạn đã lấy bánh xếp rồi."), take("mk_freezer", "mk_dumplings"),
    ["get frozen dumplings", "get a bag of frozen dumplings", "lấy bánh xếp đông lạnh"]),
  mkA("get_ice_cream", "freezer", "Get some ice cream", "Lấy kem", "Let's get some ice cream for dessert!", "Mua ít kem tráng miệng đi!", ["ice cream", "dessert"], ["icecream", "dessert"],
    "<b>Let's</b> = Let us: rủ rê. <b>dessert</b> /dɪˈzɜːt/ (tráng miệng) khác <b>desert</b> /ˈdez.ət/ (sa mạc).", ["Let's get some ice cream", "for dessert!"], ["dessert", "desert", "deserve"],
    ["Let's get some <b>cake</b> for dessert!", "Let's get <b>a tub of</b> ice cream!"],
    takePre("mk_icecream", "Bạn đã lấy kem rồi."), take("mk_freezer", "mk_icecream"),
    ["get some ice cream", "get a tub of ice cream for dessert", "lấy kem"]),
  mkA("get_a_pack_of_water", "drinksaisle", "Get a pack of water", "Lấy lốc nước", "I'll grab a six-pack of water.", "Mình lấy một lốc 6 chai nước.", ["six-pack", "water"], ["pack", "water"],
    "<b>a six-pack</b> = lốc 6 chai/lon. <b>a case of</b> water = một thùng nước.", ["I'll grab", "a six-pack of water."], ["pack", "back", "peck"],
    ["I'll grab <b>a case of</b> water.", "I'll grab <b>a six-pack of soda</b>."],
    takePre("mk_water", "Bạn đã lấy nước rồi."), take("mk_drinks", "mk_water"),
    ["get a pack of water", "get a six-pack of water", "lấy lốc nước"]),
  mkA("get_some_juice", "drinksaisle", "Get some juice", "Lấy nước ép", "This apple juice has no added sugar. Perfect!", "Nước táo này không thêm đường. Tuyệt!", ["juice", "sugar"], ["juice", "nosugar"],
    "<b>no added sugar</b> = không thêm đường — nhãn hay gặp trên bao bì.", ["This apple juice has no added sugar.", "Perfect!"], ["added", "adder", "odd"],
    ["This <b>yogurt</b> has no added sugar.", "This juice has <b>no preservatives</b>."],
    takePre("mk_juice", "Bạn đã lấy nước ép rồi."), take("mk_drinks", "mk_juice"),
    ["get some juice", "get a bottle of apple juice", "lấy nước ép"]),
  mkA("ask_more_in_back", "drinksaisle", "Ask if there's more in the back", "Hỏi trong kho còn không", "Do you have any more of these in the back?", "Trong kho còn loại này nữa không ạ?", ["more", "back"], ["inback", "doyouhave"],
    "<b>in the back</b> = trong kho (phía sau cửa hàng). <b>any more</b> = thêm nữa (trong câu hỏi).", ["Do you have any more of these", "in the back?"], ["back", "bag", "black"],
    ["Do you have any more <b>eggs</b>?", "<b>When will you restock</b>?"],
    once("mk_askstock", "yes", "Bạn đã hỏi rồi."), at("mk_drinks", "point", 700, [["mk_askstock", "yes"]]),
    ["ask if there's more in the back", "ask a staff member if there's more in the back", "hỏi trong kho còn hàng không"]),

  /* ===== v2: bakery, household, personal care ===== */
  mkA("buy_birthday_cake", "bakery", "Get a birthday cake", "Mua bánh sinh nhật", "Could I get this birthday cake, please?", "Cho mình lấy bánh sinh nhật này nhé?", ["birthday cake"], ["cake", "birthday"],
    "Bánh sinh nhật: có thể nhờ viết chữ: <b>Could you write “Happy Birthday” on it?</b>", ["Could I get this birthday cake,", "please?"], ["cake", "Kate", "cage"],
    ["Could you write <b>“Happy Birthday, Mai”</b> on it?", "Could I get <b>some candles</b>, too?"],
    takeProducePre("mk_cake", "Bạn đã lấy bánh sinh nhật rồi."), take("mk_bakery", "mk_cake", 1000),
    ["get a birthday cake", "get a birthday cake from the bakery", "mua bánh sinh nhật"]),
  mkA("get_detergent", "household", "Get some detergent", "Lấy nước giặt", "I need some laundry detergent.", "Mình cần nước giặt.", ["detergent"], ["detergent", "laundry"],
    "<b>laundry detergent</b> = bột/nước giặt; <b>dish soap</b> = nước rửa chén.", ["I need", "some laundry detergent."], ["detergent", "determined", "deterrent"],
    ["I need some <b>dish soap</b>.", "I need some <b>fabric softener</b>."],
    takePre("mk_detergent", "Bạn đã lấy nước giặt rồi."), take("mk_house", "mk_detergent"),
    ["get some detergent", "get a bottle of laundry detergent", "lấy nước giặt"]),
  mkA("get_tissues", "household", "Get some tissues", "Lấy khăn giấy", "I'll grab a box of tissues.", "Mình lấy một hộp khăn giấy.", ["tissues"], ["tissue", "box"],
    "<b>a box of tissues</b> = hộp khăn giấy; <b>toilet paper</b> = giấy vệ sinh; <b>paper towels</b> = giấy lau bếp.", ["I'll grab", "a box of tissues."], ["tissues", "issues", "tissue"],
    ["I'll grab <b>a pack of toilet paper</b>.", "I'll grab <b>some paper towels</b>."],
    takePre("mk_tissues", "Bạn đã lấy khăn giấy rồi."), take("mk_house", "mk_tissues"),
    ["get some tissues", "get a box of tissues", "lấy khăn giấy"]),
  mkA("ask_help_reach", "household", "Ask for help reaching", "Nhờ lấy đồ trên cao", "Excuse me, could you help me reach that?", "Xin lỗi, bạn lấy giúp mình món trên cao kia được không?", ["reach"], ["reach", "help"],
    "<b>reach</b> = với tới. <b>Could you help me</b> + động từ = nhờ giúp làm gì.", ["Excuse me,", "could you help me reach that?"], ["reach", "rich", "reaches"],
    ["Could you help me <b>find</b> the rice?", "Could you help me <b>carry</b> this?"],
    once("mk_reach", "yes", "Bạn đã nhờ rồi."), at("mk_house", "point", 800, [["mk_reach", "yes"]]),
    ["ask for help reaching the top shelf", "ask a staff member to help me reach the top shelf", "nhờ lấy đồ trên cao"]),
  mkA("get_shampoo", "personalcare", "Get some shampoo", "Lấy dầu gội", "This shampoo is for dry hair. I'll take it.", "Dầu gội này dành cho tóc khô. Mình lấy chai này.", ["shampoo", "dry hair"], ["shampoo", "hair"],
    "<b>for dry hair</b> = dành cho tóc khô; tóc dầu: <b>oily hair</b>.", ["This shampoo is for dry hair.", "I'll take it."], ["shampoo", "champion", "shampoos"],
    ["This <b>conditioner</b> is for dry hair.", "This shampoo is for <b>oily hair</b>."],
    takePre("mk_shampoo", "Bạn đã lấy dầu gội rồi."), take("mk_care", "mk_shampoo"),
    ["get some shampoo", "get a bottle of shampoo", "lấy dầu gội"]),
  mkA("get_toothpaste", "personalcare", "Get some toothpaste", "Lấy kem đánh răng", "I'm out of toothpaste. I'll get this one.", "Nhà hết kem đánh răng rồi. Mình lấy tuýp này.", ["out of", "toothpaste"], ["toothpaste", "outof"],
    "<b>be out of</b> + thứ gì = hết sạch cái gì. I'm <b>out of</b> milk = nhà hết sữa rồi.", ["I'm out of toothpaste.", "I'll get this one."], ["toothpaste", "toothbrush", "toothpick"],
    ["I'm out of <b>shampoo</b>.", "I'm out of <b>soap</b>."],
    takePre("mk_toothpaste", "Bạn đã lấy kem đánh răng rồi."), take("mk_care", "mk_toothpaste"),
    ["get some toothpaste", "get a tube of toothpaste", "lấy kem đánh răng"]),

  /* ===== v2: rice & eggs ===== */
  mkA("ask_where_rice", "ricebags", "Ask where the rice is", "Hỏi gạo ở đâu", "Excuse me, where can I find the rice?", "Xin lỗi, gạo để ở đâu vậy?", ["find", "rice"], ["wherefind", "rice"],
    "<b>Where can I find …?</b> = tìm … ở đâu? Lịch sự, rất hay dùng trong siêu thị.", ["Excuse me,", "where can I find the rice?"], ["rice", "rise", "race"],
    ["Where can I find <b>the eggs</b>?", "Where can I find <b>cooking oil</b>?"],
    once("mk_askrice", "yes", "Bạn đã hỏi rồi: gạo ở cạnh quầy thịt."), at("mk_rice", "point", 700, [["mk_askrice", "yes"]]),
    ["ask where the rice is", "ask where the rice is", "hỏi gạo ở đâu"]),
  mkA("get_bag_of_rice", "ricebags", "Get a bag of rice", "Lấy bao gạo", "I'll take a five-kilo bag of rice.", "Mình lấy bao gạo 5 ký.", ["five-kilo", "rice"], ["rice", "kilo"],
    "Số + đơn vị làm tính từ thì không thêm s: a <b>five-kilo</b> bag (không nói five-kilos).", ["I'll take", "a five-kilo bag of rice."], ["five", "fight", "fine"],
    ["I'll take <b>a ten-kilo</b> bag of rice.", "I'll take <b>a small bag</b> of rice."],
    takeProducePre("mk_rice", "Bạn đã lấy gạo rồi."),
    W => [["walk", "mk_rice"], ["pose", "bend", 1100], ["set", "mk_rice", "have"], ["pose", "idle", 1]],
    ["get a bag of rice", "lift a five-kilo bag of rice into the cart", "lấy bao gạo"]),
  mkA("get_some_eggs", "eggs", "Get some eggs", "Lấy trứng", "I'll take a dozen eggs.", "Mình lấy một chục trứng.", ["dozen", "eggs"], ["egg", "dozen"],
    "<b>a dozen</b> = một tá (12 quả). <b>half a dozen</b> = 6 quả.", ["I'll take", "a dozen eggs."], ["dozen", "doesn't", "cousin"],
    ["I'll take <b>half a dozen</b> eggs.", "I'll take <b>a tray of</b> eggs."],
    takePre("mk_eggs", "Bạn đã lấy trứng rồi."), take("mk_eggs", "mk_eggs"),
    ["get some eggs", "get a dozen eggs", "lấy trứng"]),
  mkA("check_eggs", "eggs", "Check the eggs", "Kiểm tra trứng", "Let me check none of them are broken.", "Để mình xem có quả nào bị vỡ không.", ["check", "broken"], ["check", "broken"],
    "<b>Let me</b> + động từ = để tôi… <b>broken</b> = vỡ (V3 của break).", ["Let me check", "none of them are broken."], ["broken", "brokers", "bacon"],
    ["Let me check <b>the date</b>.", "Let me check <b>the price</b>."],
    W => W.mk_eggs === "none" ? "Bạn chưa có trứng. Hãy lấy trứng trước (Get some eggs)." : W.mk_eggcheck === "yes" ? "Bạn đã kiểm tra trứng rồi." : null,
    W => [["walk", "mk_eggs"], ["pose", "read", 1000], ["set", "mk_eggcheck", "yes"], ["pose", "idle", 1]],
    ["check the eggs", "check that none of the eggs are broken", "kiểm tra trứng"]),

  /* ===== v2: promo & samples ===== */
  mkA("try_a_sample", "samplestand", "Try a sample", "Ăn thử", "Can I try a sample?", "Mình ăn thử được không?", ["try", "sample"], ["sample", "try"],
    "<b>sample</b> = mẫu thử. <b>try</b> = nếm/thử. Khen: <b>Mmm, that's tasty!</b>", ["Can I try", "a sample?"], ["sample", "simple", "samba"],
    ["Can I try <b>a piece</b>?", "Can I try <b>this one</b>?"],
    once("mk_sample", "yes", "Bạn đã ăn thử rồi."), W => [["walk", "mk_sample"], ["pose", "reach", 600], ["pose", "drink", 900], ["set", "mk_sample", "yes"], ["pose", "idle", 1]],
    ["try a sample", "try a free sample at the promo stand", "ăn thử"]),
  mkA("ask_about_promo", "samplestand", "Ask about the promotion", "Hỏi khuyến mãi", "So what's the promotion today?", "Vậy hôm nay có khuyến mãi gì?", ["promotion"], ["promotion", "buyone"],
    "<b>promotion / deal</b> = khuyến mãi. <b>Buy one, get one free</b> = mua 1 tặng 1.", ["So what's", "the promotion today?"], ["promotion", "promise", "motion"],
    ["What's <b>the deal</b> today?", "<b>Is it buy one, get one free</b>?"],
    once("mk_promo", "yes", "Bạn đã hỏi khuyến mãi rồi."), at("mk_sample", "point", 700, [["mk_promo", "yes"]]),
    ["ask about the promotion", "ask about today's promotion", "hỏi khuyến mãi"]),
  mkA("ask_if_on_sale", "pricesign", "Ask if they're on sale", "Hỏi có giảm giá không", "Excuse me, are these on sale?", "Xin lỗi, mấy món này có giảm giá không?", ["on sale"], ["sale"],
    "<b>Are these on sale?</b> = mấy món này có giảm giá không? <b>these</b> = những cái này (số nhiều, ở gần).", ["Excuse me,", "are these on sale?"], ["sale", "sell", "sail"],
    ["Is <b>this</b> on sale?", "Are these <b>buy one, get one free</b>?"],
    once("mk_asksale", "yes", "Bạn đã hỏi rồi."), at("mk_sign", "point", 700, [["mk_asksale", "yes"]]),
    ["ask if they're on sale", "ask a staff member if the fruit is on sale", "hỏi có giảm giá không"]),

  /* ===== v2: paying ===== */
  mkA("pay_with_qr", "checkout", "Pay with a QR code", "Trả bằng mã QR", "Can I pay with a QR code?", "Mình trả bằng mã QR được không?", ["QR code"], ["qrcode", "pay"],
    "<b>QR code</b> đọc /ˌkjuː ˈɑː kəʊd/. Quét mã: <b>scan the code</b>.", ["Can I pay", "with a QR code?"], ["code", "coat", "cold"],
    ["Can I pay <b>with my banking app</b>?", "Can I <b>scan</b> the code?"],
    W => needItems(W),
    W => [...doUnload(W), ["walk", "mk_reader"], ["spawn", "mk_phoneP"], ["pose", "reach", 900], ["despawn"], ["set", "mk_paid", "yes"], ["set", "mk_paidBy", "qr"], ["pose", "idle", 1]],
    ["pay with a QR code", "pay by scanning the QR code", "trả bằng mã QR"]),
  mkA("pay_cash_market", "checkout", "Pay in cash", "Trả tiền mặt", "I'll pay in cash. Here you go.", "Mình trả tiền mặt. Của bạn đây.", ["cash"], ["cash", "change"],
    "<b>Here you go.</b> = Của bạn đây (khi đưa tiền/đồ, thân mật). Nhận tiền thối: <b>Thanks!</b>", ["I'll pay in cash.", "Here you go."], ["cash", "catch", "cast"],
    ["I'll pay <b>by card</b>.", "Here you go. <b>Keep the change</b>."],
    W => needItems(W),
    W => [...doUnload(W), ["walk", "mk_checkout"], ["spawn", "mk_cashP"], ["pose", "reach", 900], ["despawn"], ["set", "mk_paid", "yes"], ["set", "mk_paidBy", "cash"], ["pose", "idle", 1]],
    ["pay in cash", "pay the cashier in cash", "trả tiền mặt"]),
  mkA("use_a_coupon", "checkout", "Use a coupon", "Dùng phiếu giảm giá", "I have a coupon. Can I use it?", "Mình có phiếu giảm giá. Dùng được không?", ["coupon"], ["coupon"],
    "<b>coupon</b> /ˈkuː.pɒn/ = phiếu giảm giá. Hết hạn: <b>The coupon has expired.</b>", ["I have a coupon.", "Can I use it?"], ["coupon", "cartoon", "coupe"],
    ["I have <b>a voucher</b>. Can I use it?", "I have <b>a discount code</b>."],
    W => needItems(W) || (W.mk_coupon === "yes" ? "Bạn đã dùng phiếu giảm giá rồi." : null),
    W => [...doUnload(W), ["walk", "mk_checkout"], ["spawn", "mk_couponP"], ["pose", "reach", 700], ["despawn"], ["set", "mk_coupon", "yes"], ["pose", "idle", 1]],
    ["use a coupon", "use a two-dollar coupon at the checkout", "dùng phiếu giảm giá"]),
  mkA("use_loyalty_points", "checkout", "Use my points", "Dùng điểm tích lũy", "Can I use my points, please?", "Cho mình dùng điểm tích lũy nhé.", ["points"], ["points", "member"],
    "<b>points</b> = điểm tích lũy. <b>member card</b> = thẻ thành viên. Hỏi: <b>How many points do I have?</b>", ["Can I use", "my points, please?"], ["points", "pints", "paints"],
    ["Can I use <b>my member card</b>?", "<b>How many points</b> do I have?"],
    W => needItems(W) || (W.mk_points === "yes" ? "Bạn đã dùng điểm rồi." : null),
    W => [...doUnload(W), ["walk", "mk_checkout"], ["spawn", "mk_memberP"], ["pose", "reach", 700], ["despawn"], ["set", "mk_points", "yes"], ["pose", "idle", 1]],
    ["use my points", "use my loyalty points at the checkout", "dùng điểm tích lũy"]),
  mkA("ask_price_check", "checkout", "Ask for a price check", "Nhờ kiểm tra giá", "Could you check this price? The sign said $1.99.", "Bạn kiểm tra giá món này giúp mình nhé? Biển ghi 1 đô 99.", ["check", "price"], ["check", "price"],
    "<b>The sign said …</b> = biển ghi… (say → said). Lịch sự khi thấy giá tính sai.", ["Could you check this price?", "The sign said $1.99."], ["said", "sad", "side"],
    ["Could you check <b>this item</b>?", "The sign said <b>20% off</b>."],
    W => needItems(W) || (W.mk_pricecheck === "yes" ? "Bạn đã nhờ kiểm tra giá rồi." : null),
    W => [...doUnload(W), ["walk", "mk_checkout"], ["pose", "point", 800], ["set", "mk_pricecheck", "yes"], ["pose", "idle", 1]],
    ["ask for a price check", "ask the cashier to check a price", "nhờ kiểm tra giá"]),
  mkA("bring_own_bag", "bags", "Use my own bag", "Dùng túi của mình", "It's okay, I brought my own bag.", "Không sao, mình có mang túi riêng.", ["brought", "own bag"], ["ecobag", "bring"],
    "bring → <b>brought</b> (quá khứ). <b>my own</b> + danh từ = của riêng tôi.", ["It's okay,", "I brought my own bag."], ["brought", "bought", "bright"],
    ["I brought my own <b>basket</b>.", "<b>No bag, thanks.</b>"],
    W => W.mk_bag !== "none" ? "Bạn đã có túi rồi." : null,
    W => [["walk", "mk_bags"], ["spawn", "mk_ecoP"], ["pose", "reach", 600], ["despawn"], ["set", "mk_bag", "own"], ["pose", "idle", 1]],
    ["use my own bag", "use my own reusable bag", "dùng túi của mình"]),
  mkA("buy_eco_bag", "bags", "Buy an eco bag", "Mua túi vải", "Can I buy one of those eco bags?", "Mình mua một cái túi vải được không?", ["eco bags"], ["ecobag", "buy"],
    "<b>eco bag / reusable bag</b> = túi dùng nhiều lần. <b>one of those</b> + số nhiều = một trong mấy cái kia.", ["Can I buy", "one of those eco bags?"], ["eco", "echo", "ego"],
    ["Can I buy <b>a paper bag</b>?", "Can I buy one of those <b>cooler bags</b>?"],
    W => W.mk_bag === "eco" ? "Bạn đã mua túi vải rồi." : W.mk_bag === "own" ? "Bạn đã mang túi riêng rồi." : null,
    W => [["walk", "mk_bags"], ["pose", "reach", 700], ["set", "mk_bag", "eco"], ["pose", "idle", 1]],
    ["buy an eco bag", "buy a reusable eco bag", "mua túi vải"]),

  /* ===== v2: self-checkout ===== */
  mkA("scan_my_items", "selfcheckout", "Scan my items", "Tự quét hàng", "I'll use the self-checkout and scan everything myself.", "Mình dùng quầy tự thanh toán và tự quét hết.", ["self-checkout", "scan"], ["selfcheckout", "scan"],
    "<b>myself</b> = tự mình. <b>scan</b> = quét mã vạch (<b>barcode</b>).", ["I'll use the self-checkout", "and scan everything myself."], ["scan", "scam", "skin"],
    ["I'll scan <b>the barcode</b>.", "I'll <b>bag</b> everything myself."],
    W => needItems(W) || (W.mk_scanned === "yes" ? "Bạn đã quét hết rồi." : null),
    W => [["walk", "mk_self"], ["pose", "reach", 1300], ["set", "mk_scanned", "yes"], ["pose", "idle", 1]],
    ["scan my items", "scan my items at the self-checkout", "tự quét hàng"]),
  mkA("pay_at_self_checkout", "selfcheckout", "Pay at the machine", "Trả tiền ở máy", "Done! I'm paying by card at the machine.", "Xong! Mình trả bằng thẻ ở máy.", ["paying", "machine"], ["pay", "machine"],
    "<b>Done!</b> = Xong! <b>at the machine</b> = ở máy. Màn hình hỏi: <b>Do you need a receipt?</b>", ["Done!", "I'm paying by card at the machine."], ["machine", "magazine", "marine"],
    ["I'm paying <b>with my phone</b> at the machine.", "<b>Yes, I need a receipt.</b>"],
    W => PAID(W) ? "Bạn đã trả tiền rồi." : W.mk_scanned !== "yes" ? "Bạn chưa quét hàng. Hãy quét hàng trước (Scan my items)." : needItems(W),
    W => [["walk", "mk_self"], ["spawn", "mk_cardP"], ["pose", "reach", 900], ["despawn"], ["set", "mk_paid", "yes"], ["set", "mk_paidBy", "self"], ["pose", "idle", 1]],
    ["pay at the machine", "pay by card at the self-checkout machine", "trả tiền ở máy tự thanh toán"]),
  mkA("self_checkout_help", "selfcheckout", "Ask for help at the machine", "Nhờ giúp ở máy", "Excuse me, it says “unexpected item”. Could you help?", "Xin lỗi, máy báo “hàng không xác định”. Bạn giúp mình được không?", ["help"], ["help", "unexpected"],
    "<b>It says …</b> = (màn hình) ghi là… Nhờ nhân viên: <b>Could you help?</b>", ["Excuse me, it says “unexpected item”.", "Could you help?"], ["unexpected", "expected", "unexplained"],
    ["Excuse me, it says <b>“wait for assistance”</b>.", "<b>The scanner isn't working.</b>"],
    W => W.mk_scanned !== "yes" ? "Bạn chưa dùng máy. Hãy quét hàng trước (Scan my items)." : W.mk_selfhelp === "yes" ? "Nhân viên đã giúp bạn rồi." : null,
    at("mk_self", "point", 900, [["mk_selfhelp", "yes"]]),
    ["ask for help at the machine", "ask a staff member for help at the self-checkout", "nhờ giúp ở máy tự thanh toán"]),

  /* ===== v2: customer service ===== */
  mkA("return_an_item", "servicedesk", "Return an item", "Trả lại hàng", "I'd like to return this, please. Here's the receipt.", "Mình muốn trả lại món này. Hoá đơn đây ạ.", ["return", "receipt"], ["return", "receipt", "refund"],
    "<b>I'd like to return this</b> = tôi muốn trả hàng. Hoàn tiền: <b>refund</b>; đổi hàng: <b>exchange</b>.", ["I'd like to return this, please.", "Here's the receipt."], ["return", "retain", "returns"],
    ["I'd like to <b>exchange</b> this, please.", "<b>Can I get a refund</b>?"],
    W => needPaid(W) || (W.mk_returned === "yes" ? "Bạn đã trả hàng rồi." : null),
    W => [["walk", "mk_service"], ["spawn", "mk_receiptP"], ["pose", "reach", 900], ["despawn"], ["set", "mk_receipt", "yes"], ["set", "mk_returned", "yes"], ["pose", "idle", 1]],
    ["return an item", "return an item at the customer service desk", "trả lại hàng"]),
  mkA("sign_up_membership", "servicedesk", "Sign up for a loyalty card", "Đăng ký thẻ thành viên", "How do I sign up for a loyalty card?", "Làm thẻ thành viên thế nào vậy?", ["sign up", "loyalty card"], ["signup", "loyalty"],
    "<b>sign up for</b> = đăng ký. <b>How do I …?</b> = Tôi làm … thế nào?", ["How do I sign up", "for a loyalty card?"], ["sign", "sing", "sin"],
    ["How do I sign up for <b>the app</b>?", "How do I <b>get points</b>?"],
    once("mk_member", "yes", "Bạn đã đăng ký thẻ rồi."), at("mk_service", "point", 900, [["mk_member", "yes"]]),
    ["sign up for a loyalty card", "sign up for a loyalty card at the service desk", "đăng ký thẻ thành viên"]),
  mkA("ask_about_delivery", "servicedesk", "Ask about delivery", "Hỏi giao hàng", "Do you deliver? These bags are pretty heavy.", "Siêu thị có giao hàng không? Mấy túi này nặng quá.", ["deliver", "heavy"], ["deliver", "heavy"],
    "<b>deliver</b> = giao hàng; <b>delivery</b> = việc giao hàng. <b>pretty</b> + tính từ = khá.", ["Do you deliver?", "These bags are pretty heavy."], ["deliver", "delivery", "liver"],
    ["Do you deliver <b>to my area</b>?", "<b>Is delivery free</b>?"],
    once("mk_delivery", "yes", "Bạn đã hỏi về giao hàng rồi."), at("mk_service", "point", 700, [["mk_delivery", "yes"]]),
    ["ask about delivery", "ask if the store delivers", "hỏi giao hàng"]),
  mkA("ask_store_hours", "servicedesk", "Ask what time they close", "Hỏi giờ đóng cửa", "What time do you close tonight?", "Tối nay siêu thị đóng cửa lúc mấy giờ?", ["close", "tonight"], ["close", "tonight"],
    "<b>tonight</b> = tối nay. Hỏi giờ mở cửa: <b>What time do you open tomorrow?</b>", ["What time", "do you close tonight?"], ["tonight", "tonic", "tomato"],
    ["What time do you <b>open</b> tomorrow?", "<b>Are you open 24 hours</b>?"],
    once("mk_hours", "yes", "Bạn đã hỏi giờ đóng cửa rồi."), at("mk_service", "point", 700, [["mk_hours", "yes"]]),
    ["ask what time they close", "ask what time the supermarket closes", "hỏi giờ đóng cửa"]),
  mkA("put_item_back", "snacks", "Put something back", "Để lại món không cần", "Actually, I don't need these. I'll put them back.", "Thật ra mình không cần mấy cái này. Mình để lại chỗ cũ.", ["put", "back"], ["putback", "need"],
    "<b>put … back</b> = để lại chỗ cũ; với đại từ: put <b>them</b> back (đại từ đứng giữa).", ["Actually, I don't need these.", "I'll put them back."], ["back", "bag", "black"],
    ["I don't need <b>this</b>. I'll put <b>it</b> back.", "<b>Never mind</b>, I'll put them back."],
    W => W.mk_chips === "none" ? "Bạn chưa lấy bim bim. Hãy lấy bim bim trước (Grab some chips)." : PAID(W) ? "Bạn đã trả tiền rồi." : null,
    W => [["walk", "mk_snacks"], ["pose", "reach", 800], ["set", "mk_chips", "none"], ["pose", "idle", 1]],
    ["put something back", "put the chips back on the shelf", "để lại món không cần"]),

  /* ===== v3: expanded everyday interactions (weather, health, Q&A, rich adjectives) ===== */
  mkA("wipe_cart_handle", "shopcart", "Wipe the cart handle", "Lau khử trùng tay cầm xe đẩy", "I'm wiping the shopping cart handle with a sanitizing wipe to stay healthy.", "Tôi đang lau tay cầm xe đẩy bằng khăn khử trùng để bảo vệ sức khỏe.", ["wiping", "sanitizing wipe", "healthy"], ["cart", "sanitize", "healthy"],
    "<b>to stay healthy</b> = để giữ gìn sức khỏe. <b>sanitizing wipe</b> = khăn ướt khử trùng.", ["I'm wiping the shopping cart handle", "with a sanitizing wipe to stay healthy."], ["healthy", "wealthy", "heavy"],
    ["Use a <b>sanitizing wipe</b> on the handle.", "Wash your hands <b>to stay healthy</b>."],
    once("mk_wipecart", "yes", "Bạn đã lau khử trùng tay cầm xe đẩy rồi."), at("mk_carts", "wipe", 800, [["mk_wipecart", "yes"]]),
    ["wipe the cart handle", "wipe the shopping cart handle with a sanitizing wipe", "lau khử trùng tay cầm xe đẩy"]),
  mkA("check_cart_wheels", "shopcart", "Swap a squeaky cart", "Đổi xe đẩy có bánh xe êm hơn", "This cart has a squeaky wheel—let me swap it for a smoother one.", "Chiếc xe đẩy này có bánh xe kêu cót két — để mình đổi sang chiếc khác êm hơn.", ["wheel", "smoother", "cart"], ["cart", "wheel", "smooth"],
    "<b>swap A for B</b> = đổi A lấy B. <b>smoother</b> = trơn tru / êm hơn.", ["This cart has a squeaky wheel—", "let me swap it for a smoother one."], ["wheel", "well", "whale"],
    ["This cart rolls <b>very smoothly</b>.", "Let me <b>swap</b> this cart for another one."],
    once("mk_swapcart", "yes", "Bạn đã kiểm tra và chọn xe đẩy êm rồi."), at("mk_carts", "reach", 700, [["mk_swapcart", "yes"]]),
    ["swap a squeaky cart", "swap the squeaky cart for a smoother one", "đổi xe đẩy có bánh xe êm hơn"]),
  mkA("stack_empty_basket", "shopbasket", "Stack my empty basket", "Xếp gọn giỏ trống ở lối vào", "I'll stack my empty basket neatly by the entrance before I leave.", "Mình sẽ xếp chiếc giỏ trống gọn gàng cạnh lối vào trước khi ra về.", ["basket", "neatly", "entrance"], ["basket", "neatly", "entrance"],
    "<b>neatly</b> = một cách gọn gàng, ngăn nắp. <b>by the entrance</b> = ở cạnh lối vào.", ["I'll stack my empty basket neatly", "by the entrance before I leave."], ["neatly", "nearly", "newly"],
    ["Please put your <b>basket</b> back neatly.", "The baskets are stacked <b>by the entrance</b>."],
    once("mk_stackbasket", "yes", "Bạn đã xếp gọn giỏ mua hàng rồi."), at("mk_baskets", "bend", 700, [["mk_stackbasket", "yes"]]),
    ["stack my empty basket", "stack my empty basket neatly by the entrance", "xếp gọn giỏ trống ở lối vào"]),
  mkA("switch_basket_to_cart", "shopbasket", "Switch from basket to cart", "Đổi từ giỏ xách sang xe đẩy", "My basket is getting way too heavy for my arm—I should grab a cart instead.", "Giỏ hàng đang trở nên quá nặng cho cánh tay mình — mình nên đổi sang xe đẩy thì hơn.", ["basket", "heavy", "cart"], ["basket", "heavy", "cart"],
    "<b>way too heavy</b> = quá sức nặng (<b>way</b> nhấn mạnh cho <b>too</b>).", ["My basket is getting way too heavy for my arm—", "I should grab a cart instead."], ["heavy", "healthy", "happy"],
    ["This bag is <b>way too heavy</b>.", "Let's grab a <b>shopping cart</b> instead."],
    once("mk_switchcart", "yes", "Bạn đã quyết định đổi sang xe đẩy rồi."), at("mk_baskets", "reach", 700, [["mk_switchcart", "yes"]]),
    ["switch from basket to cart", "switch my heavy basket for a shopping cart", "đổi từ giỏ xách sang xe đẩy"]),
  mkA("read_weekly_flyer", "pricesign", "Read the weekly flyer", "Xem tờ rơi khuyến mãi tuần", "Let's check the weekly flyer to see which organic fruits are discounted today.", "Hãy xem tờ rơi tuần này để biết loại trái cây hữu cơ nào đang giảm giá hôm nay.", ["weekly flyer", "organic", "discounted"], ["flyer", "organic", "discount"],
    "<b>weekly flyer</b> = tờ rơi quảng cáo hằng tuần của siêu thị. <b>organic</b> = hữu cơ.", ["Let's check the weekly flyer", "to see which organic fruits are discounted today."], ["organic", "organize", "orange"],
    ["<b>Organic</b> apples are on sale this week.", "Grab a <b>weekly flyer</b> at the door."],
    once("mk_flyer", "yes", "Bạn đã xem tờ rơi khuyến mãi tuần rồi."), at("mk_sign", "read", 900, [["mk_flyer", "yes"]]),
    ["read the weekly flyer", "check the weekly flyer for organic fruit deals", "xem tờ rơi khuyến mãi tuần"]),
  mkA("calculate_unit_price", "pricesign", "Check the family-size savings", "Tính mức tiết kiệm gói gia đình", "Buying the family-size pack saves almost three dollars per kilo!", "Mua gói cỡ gia đình tiết kiệm được gần ba đô mỗi ký đấy!", ["saves", "kilo", "price"], ["save", "kilo", "price"],
    "<b>save + số tiền</b> = tiết kiệm được bao nhiêu tiền. <b>per kilo</b> = mỗi ki-lô-gam.", ["Buying the family-size pack", "saves almost three dollars per kilo!"], ["saves", "safe", "waves"],
    ["Buying in bulk <b>saves money</b>.", "It costs four dollars <b>per kilo</b>."],
    once("mk_unitprice", "yes", "Bạn đã tính giá theo ký rồi."), at("mk_sign", "read", 800, [["mk_unitprice", "yes"]]),
    ["check the family-size savings", "calculate how much the family-size pack saves", "tính mức tiết kiệm gói gia đình"]),
  mkA("pick_ripe_avocados", "produce", "Check if avocados are ripe", "Chọn quả bơ chín vừa", "How do you tell if an avocado is ripe? This one feels slightly soft.", "Làm sao biết bơ đã chín nhỉ? Quả này cầm thấy hơi mềm tay.", ["avocado", "ripe", "soft"], ["avocado", "ripe", "soft"],
    "<b>How do you tell if …?</b> = Làm sao để nhận biết liệu …? <b>slightly soft</b> = hơi mềm một chút.", ["How do you tell if an avocado is ripe?", "This one feels slightly soft."], ["soft", "sort", "salt"],
    ["Press gently to see if the <b>avocado</b> is <b>ripe</b>.", "This peach feels nice and <b>soft</b>."],
    once("mk_avocado", "yes", "Bạn đã chọn được bơ chín vừa rồi."), at("mk_produce", "reach", 800, [["mk_avocado", "yes"]]),
    ["check if avocados are ripe", "pick a slightly soft, ripe avocado", "chọn quả bơ chín vừa"]),
  mkA("smell_fresh_strawberries", "produce", "Smell the sweet strawberries", "Ngửi hương dâu tây chín mọng", "These sweet red strawberries smell amazing, especially on a warm spring day!", "Những quả dâu tây đỏ mọng ngọt ngào này thơm tuyệt vời, nhất là vào ngày xuân ấm áp!", ["sweet", "strawberries", "fresh"], ["strawberry", "sweet", "fresh"],
    "<b>smell + tính từ</b> = có mùi thơm như thế nào (smell amazing / smell sweet).", ["These sweet red strawberries smell amazing,", "especially on a warm spring day!"], ["sweet", "sweat", "street"],
    ["Fresh <b>strawberries</b> are in season now.", "They taste so <b>sweet</b> and juicy!"],
    once("mk_strawberries", "yes", "Bạn đã chọn dâu tây thơm ngọt rồi."), at("mk_produce", "reach", 800, [["mk_strawberries", "yes"]]),
    ["smell the sweet strawberries", "smell the sweet red strawberries at the stand", "ngửi hương dâu tây chín mọng"]),
  mkA("choose_broccoli_for_soup", "produce", "Pick broccoli for hot soup", "Chọn bông cải xanh nấu súp", "It's chilly and rainy tonight, so I'm picking fresh green broccoli for hot soup.", "Tối nay trời mưa lạnh nên mình đang chọn bông cải xanh tươi để nấu súp nóng.", ["broccoli", "soup", "fresh"], ["broccoli", "soup", "fresh"],
    "Kết hợp thời tiết + món ăn ấm bụng: <b>hot soup</b> cho buổi tối <b>chilly and rainy</b>.", ["It's chilly and rainy tonight,", "so I'm picking fresh green broccoli for hot soup."], ["soup", "soap", "shop"],
    ["Warm vegetable <b>soup</b> is great on a rainy night.", "<b>Broccoli</b> is full of vitamins."],
    once("mk_broccoli", "yes", "Bạn đã chọn bông cải xanh nấu súp rồi."), at("mk_produce", "reach", 800, [["mk_broccoli", "yes"]]),
    ["pick broccoli for hot soup", "pick fresh green broccoli for soup", "chọn bông cải xanh nấu súp"]),
  mkA("print_weight_sticker", "fruitscale", "Print the barcode sticker", "In nhãn mã vạch trên cân", "I'm pressing the button on the scale to print the barcode sticker.", "Tôi đang nhấn nút trên cân để in nhãn mã vạch.", ["scale", "barcode sticker"], ["scale", "sticker"],
    "Sau khi cân trái cây, nhấn nút để lấy <b>barcode sticker / price label</b> dán lên túi.", ["I'm pressing the button on the scale", "to print the barcode sticker."], ["sticker", "stricter", "sister"],
    ["Stick the <b>barcode sticker</b> on the bag.", "Put the fruit on the <b>scale</b> first."],
    once("mk_sticker", "yes", "Bạn đã in nhãn mã vạch rồi."), at("mk_scale", "reach", 700, [["mk_sticker", "yes"]]),
    ["print the barcode sticker", "press the button to print the barcode sticker", "in nhãn mã vạch trên cân"]),
  mkA("weigh_bunch_of_grapes", "fruitscale", "Weigh seedless green grapes", "Cân chùm nho xanh không hạt", "Let's see how much these seedless green grapes weigh—just over half a kilo.", "Xem chùm nho xanh không hạt này nặng bao nhiêu nào — hơn nửa ký một chút.", ["seedless grapes", "weigh", "half a kilo"], ["grapes", "weigh", "halfkilo"],
    "<b>seedless grapes</b> = nho không hạt. <b>just over half a kilo</b> = nhỉnh hơn nửa ký một chút.", ["Let's see how much these seedless green grapes weigh—", "just over half a kilo."], ["grapes", "grades", "gloves"],
    ["Do you prefer red or green <b>seedless grapes</b>?", "It weighs <b>just over</b> a kilo."],
    once("mk_grapes", "yes", "Bạn đã cân chùm nho xanh rồi."), at("mk_scale", "reach", 800, [["mk_grapes", "yes"]]),
    ["weigh seedless green grapes", "weigh a bunch of seedless green grapes", "cân chùm nho xanh không hạt"]),
  mkA("smell_warm_baguettes", "bakery", "Smell the crispy baguettes", "Ngửi mùi bánh mì Pháp giòn rụm", "Nothing beats the smell of crispy French baguettes straight from the oven!", "Không gì tuyệt bằng mùi bánh mì dài kiểu Pháp giòn rụm vừa ra lò!", ["crispy", "baguettes", "bread"], ["crispy", "baguette", "bread"],
    "<b>Nothing beats …!</b> = Không gì sánh bằng …! <b>straight from the oven</b> = vừa mới ra lò.", ["Nothing beats the smell", "of crispy French baguettes straight from the oven!"], ["crispy", "creamy", "chilly"],
    ["The crust is golden and <b>crispy</b>.", "I'll buy a warm French <b>baguette</b>."],
    once("mk_baguette", "yes", "Bạn đã chọn bánh mì Pháp giòn nóng rồi."), at("mk_bakery", "reach", 800, [["mk_baguette", "yes"]]),
    ["smell the crispy baguettes", "enjoy the smell of warm crispy baguettes", "ngửi mùi bánh mì Pháp giòn rụm"]),
  mkA("pick_whole_wheat_rolls", "bakery", "Pick whole-wheat rolls", "Chọn bánh mì nguyên cám giàu chất xơ", "I'm choosing whole-wheat dinner rolls because they have more fiber and are healthier.", "Mình chọn bánh mì nguyên cám vì chúng giàu chất xơ và tốt cho sức khỏe hơn.", ["whole-wheat", "fiber", "healthier"], ["wholewheat", "fiber", "healthy"],
    "<b>whole-wheat / whole-grain</b> = nguyên cám; giàu <b>fiber</b> (chất xơ) tốt cho tiêu hóa.", ["I'm choosing whole-wheat dinner rolls", "because they have more fiber and are healthier."], ["fiber", "fever", "five"],
    ["<b>Whole-wheat</b> bread is very filling.", "Oats and brown bread are high in <b>fiber</b>."],
    once("mk_wheatrolls", "yes", "Bạn đã chọn bánh mì nguyên cám rồi."), at("mk_bakery", "reach", 800, [["mk_wheatrolls", "yes"]]),
    ["pick whole-wheat rolls", "choose healthy whole-wheat dinner rolls", "chọn bánh mì nguyên cám"]),
  mkA("pick_greek_yogurt", "dairy", "Pick plain Greek yogurt", "Lấy sữa chua Hy Lạp lành mạnh", "Plain Greek yogurt with berries is my favorite healthy breakfast.", "Sữa chua Hy Lạp nguyên vị ăn kèm quả mọng là bữa sáng lành mạnh yêu thích của mình.", ["Greek yogurt", "healthy"], ["yogurt", "healthy"],
    "<b>plain yogurt</b> = sữa chua không đường / nguyên vị; giàu đạm và lợi khuẩn.", ["Plain Greek yogurt with berries", "is my favorite healthy breakfast."], ["yogurt", "younger", "yellow"],
    ["I eat <b>Greek yogurt</b> every morning.", "It's a quick and <b>healthy</b> breakfast."],
    once("mk_yogurt", "yes", "Bạn đã lấy sữa chua Hy Lạp rồi."), at("mk_dairy", "reach", 800, [["mk_yogurt", "yes"]]),
    ["pick plain Greek yogurt", "pick a tub of plain Greek yogurt", "lấy sữa chua Hy Lạp"]),
  mkA("choose_cheddar_cheese", "dairy", "Choose sharp cheddar cheese", "Chọn phô mai cheddar đậm vị", "Could you pass me that block of sharp cheddar cheese on the middle shelf?", "Bạn lấy giúp mình khối phô mai cheddar đậm vị ở ngăn giữa được không?", ["cheddar cheese", "fridge"], ["cheddar", "fridge"],
    "<b>a block of cheese</b> = một khối phô mai; <b>sharp cheddar</b> = cheddar ủ lâu, vị đậm.", ["Could you pass me that block", "of sharp cheddar cheese on the middle shelf?"], ["cheddar", "chatter", "chapter"],
    ["We need some <b>cheddar cheese</b> for sandwiches.", "It's on the middle shelf in the <b>fridge</b>."],
    once("mk_cheddar", "yes", "Bạn đã lấy phô mai cheddar rồi."), at("mk_dairy", "reach", 800, [["mk_cheddar", "yes"]]),
    ["choose sharp cheddar cheese", "get a block of sharp cheddar cheese", "chọn phô mai cheddar"]),
  mkA("pick_roasted_almonds", "snacks", "Grab unsalted roasted almonds", "Lấy hạnh nhân rang không muối", "Instead of salty chips, I'm grabbing a bag of unsalted roasted almonds.", "Thay vì khoai tây chiên mặn, mình lấy một gói hạnh nhân rang không muối.", ["unsalted", "roasted almonds", "chips"], ["unsalted", "almonds", "chips"],
    "<b>Instead of + danh từ/V-ing</b> = Thay vì … <b>unsalted</b> = không ướp muối.", ["Instead of salty chips,", "I'm grabbing a bag of unsalted roasted almonds."], ["almonds", "islands", "diamonds"],
    ["<b>Roasted almonds</b> are a great afternoon snack.", "I prefer <b>unsalted</b> nuts."],
    once("mk_almonds", "yes", "Bạn đã lấy gói hạnh nhân rang rồi."), at("mk_snacks", "reach", 800, [["mk_almonds", "yes"]]),
    ["grab unsalted roasted almonds", "grab a bag of unsalted roasted almonds", "lấy hạnh nhân rang không muối"]),
  mkA("choose_dark_chocolate", "snacks", "Choose 70% dark chocolate", "Chọn sô-cô-la đen 70% ca cao", "Dark chocolate with seventy percent cocoa is rich in antioxidants and not too sweet.", "Sô-cô-la đen với bảy mươi phần trăm ca cao giàu chất chống oxy hóa và không quá ngọt.", ["dark chocolate", "sweet"], ["cocoa", "sweet"],
    "<b>dark chocolate</b> = sô-cô-la đen; <b>milk chocolate</b> = sô-cô-la sữa.", ["Dark chocolate with seventy percent cocoa", "is rich in antioxidants and not too sweet."], ["dark", "park", "bark"],
    ["I love bitter <b>dark chocolate</b>.", "It's delicious and not too <b>sweet</b>."],
    once("mk_darkchoc", "yes", "Bạn đã chọn sô-cô-la đen rồi."), at("mk_snacks", "reach", 800, [["mk_darkchoc", "yes"]]),
    ["choose 70% dark chocolate", "choose a bar of dark chocolate", "chọn sô-cô-la đen"]),
  mkA("greet_the_cashier", "checkout", "Greet the busy cashier", "Chào hỏi thu ngân", "Hi! How's your shift going today? It's pretty busy in here!", "Chào bạn! Ca làm hôm nay thế nào? Trong siêu thị đông khách ghê nhỉ!", ["shift", "busy"], ["shift", "busy", "cashier"],
    "<b>How's your shift going?</b> = Ca làm của bạn hôm nay thế nào? Câu hỏi thăm rất thân thiện.", ["Hi! How's your shift going today?", "It's pretty busy in here!"], ["shift", "ship", "shirt"],
    ["The supermarket is really <b>busy</b> on weekends.", "Have a good <b>shift</b>!"],
    once("mk_greetcashier", "yes", "Bạn đã chào hỏi thu ngân rồi."), at("mk_checkout", "point", 700, [["mk_greetcashier", "yes"]]),
    ["greet the busy cashier", "ask the cashier how their shift is going", "chào hỏi thu ngân"]),
  mkA("put_divider_on_belt", "checkout", "Put the divider bar on the belt", "Đặt thanh phân cách lên băng chuyền", "I'm placing the plastic divider bar on the conveyor belt behind my groceries.", "Tôi đang đặt thanh chắn nhựa lên băng chuyền phía sau chỗ hàng của mình.", ["divider bar", "conveyor belt"], ["divider", "belt", "checkout"],
    "<b>divider bar</b> = thanh chắn phân cách hàng của hai khách trên <b>conveyor belt</b> (băng chuyền).", ["I'm placing the plastic divider bar", "on the conveyor belt behind my groceries."], ["belt", "bell", "melt"],
    ["Put your basket items on the <b>conveyor belt</b>.", "Thanks for putting down the <b>divider bar</b>."],
    once("mk_divider", "yes", "Bạn đã đặt thanh phân cách lên băng chuyền rồi."), at("mk_checkout", "reach", 700, [["mk_divider", "yes"]]),
    ["put the divider bar on the belt", "place the divider bar on the checkout belt", "đặt thanh phân cách lên băng chuyền"]),
  mkA("enter_pin_number", "cardreader", "Enter my four-digit PIN", "Nhập mã PIN trên máy quẹt thẻ", "The card reader is asking me to insert my card and enter my four-digit PIN number.", "Máy quẹt thẻ yêu cầu mình cắm thẻ vào và nhập mã PIN bốn chữ số.", ["card", "PIN number"], ["card", "pin"],
    "<b>four-digit PIN</b> = mật mã 4 chữ số. Che tay khi bấm: <b>cover the keypad</b>.", ["The card reader is asking me", "to insert my card and enter my four-digit PIN number."], ["insert", "inside", "insist"],
    ["Please enter your <b>PIN number</b>.", "Insert or tap your <b>card</b>."],
    once("mk_enterpin", "yes", "Bạn đã nhập mã PIN rồi."), at("mk_reader", "reach", 800, [["mk_enterpin", "yes"]]),
    ["enter my four-digit PIN", "enter my PIN number on the card reader", "nhập mã PIN trên máy quẹt thẻ"]),
  mkA("check_payment_approved", "cardreader", "Check that payment is approved", "Kiểm tra màn hình báo Đã duyệt", "Great, the screen says 'Approved'—my contactless payment went through!", "Tuyệt, màn hình báo 'Đã duyệt' — thanh toán không tiếp xúc của mình thành công rồi!", ["Approved", "pay"], ["approved", "pay", "tap"],
    "<b>go through</b> (went through) = (giao dịch thanh toán) được xử lý thành công.", ["Great, the screen says 'Approved'—", "my contactless payment went through!"], ["approved", "improved", "arrived"],
    ["Wait until the screen says <b>Approved</b>.", "Your card payment <b>went through</b>."],
    once("mk_approved", "yes", "Bạn đã xác nhận thanh toán thành công rồi."), at("mk_reader", "read", 700, [["mk_approved", "yes"]]),
    ["check that payment is approved", "see the Approved message on the card reader", "kiểm tra màn hình báo Đã duyệt"]),
  mkA("separate_cold_items", "bags", "Pack cold items in an insulated bag", "Xếp đồ lạnh vào túi giữ nhiệt", "I'm packing the frozen food and cold milk together in an insulated bag.", "Tôi đang xếp đồ đông lạnh và sữa lạnh chung vào một chiếc túi giữ nhiệt.", ["frozen", "insulated bag"], ["frozen", "milk", "insulated"],
    "<b>insulated bag / cooler bag</b> = túi giữ nhiệt giúp đồ đông lạnh không bị rã đông trên đường về.", ["I'm packing the frozen food and cold milk", "together in an insulated bag."], ["frozen", "chosen", "spoken"],
    ["Keep ice cream in an <b>insulated bag</b>.", "Put all the <b>cold items</b> together."],
    once("mk_insulated", "yes", "Bạn đã xếp đồ lạnh vào túi giữ nhiệt rồi."), at("mk_bags", "bend", 800, [["mk_insulated", "yes"]]),
    ["pack cold items in an insulated bag", "pack frozen food into an insulated bag", "xếp đồ lạnh vào túi giữ nhiệt"]),
  mkA("double_bag_heavy_bottles", "bags", "Double-bag the heavy bottles", "Lồng hai lớp túi cho đồ nặng", "Let's double-bag these heavy glass bottles so the handles don't rip.", "Hãy lồng hai lớp túi cho mấy chai thủy tinh nặng này để quai túi không bị đứt.", ["double-bag", "heavy"], ["doublebag", "heavy", "bag"],
    "<b>double-bag</b> (động từ) = lồng hai chiếc túi vào nhau cho chắc chắn.", ["Let's double-bag these heavy glass bottles", "so the handles don't rip."], ["heavy", "ready", "steady"],
    ["Could you <b>double-bag</b> the milk and juice?", "These bottles are quite <b>heavy</b>."],
    once("mk_doublebag", "yes", "Bạn đã lồng hai lớp túi cho đồ nặng rồi."), at("mk_bags", "bend", 800, [["mk_doublebag", "yes"]]),
    ["double-bag the heavy bottles", "double-bag the heavy bottles so the bag won't rip", "lồng hai lớp túi cho đồ nặng"]),
  mkA("ask_for_lean_beef", "meatcounter", "Ask for lean ground beef", "Hỏi mua thịt bò xay ít mỡ", "Do you have lean ground beef? I'm making homemade burgers tonight.", "Quầy mình có thịt bò xay ít mỡ không ạ? Tối nay mình làm burger tại nhà.", ["lean beef", "tonight"], ["leanbeef", "doyouhave", "tonight"],
    "<b>lean meat / lean beef</b> = thịt nạc, ít mỡ; <b>ground beef</b> (Mỹ) = <b>minced beef</b> (Anh) = thịt bò xay.", ["Do you have lean ground beef?", "I'm making homemade burgers tonight."], ["lean", "clean", "mean"],
    ["I prefer <b>lean beef</b> because it's healthier.", "What are you cooking <b>tonight</b>?"],
    once("mk_leanbeef", "yes", "Bạn đã hỏi mua thịt bò xay ít mỡ rồi."), at("mk_meat", "point", 800, [["mk_leanbeef", "yes"]]),
    ["ask for lean ground beef", "ask the butcher for lean ground beef", "hỏi mua thịt bò xay ít mỡ"]),
  mkA("ask_cooking_tip_butcher", "meatcounter", "Ask how to cook the salmon", "Hỏi mẹo áp chảo cá hồi", "How long should I pan-sear this salmon fillet so it stays juicy?", "Mình nên áp chảo miếng phi lê cá hồi này bao lâu để cá vẫn mềm mọng nước nhỉ?", ["salmon", "juicy"], ["salmon", "juicy"],
    "<b>stay juicy / tender</b> = giữ được độ mềm mọng nước, không bị khô khi nấu.", ["How long should I pan-sear this salmon fillet", "so it stays juicy?"], ["juicy", "juice", "joyful"],
    ["Cook it for three minutes per side so it stays <b>juicy</b>.", "Fresh <b>salmon</b> cooks very quickly."],
    once("mk_cooktip", "yes", "Bạn đã hỏi mẹo chế biến cá hồi rồi."), at("mk_meat", "point", 800, [["mk_cooktip", "yes"]]),
    ["ask how to cook the salmon", "ask the butcher how to keep salmon juicy", "hỏi mẹo áp chảo cá hồi"]),
  mkA("pick_frozen_berries", "freezer", "Pick frozen blueberries", "Lấy việt quất đông lạnh làm sinh tố", "Frozen berries are great for blending into a cold morning smoothie.", "Quả mọng đông lạnh rất hợp để xay sinh tố mát lạnh vào buổi sáng.", ["frozen berries", "frozen"], ["berries", "frozen"],
    "<b>be great for + V-ing</b> = rất tuyệt/hợp để làm gì (great for blending into a smoothie).", ["Frozen berries are great", "for blending into a cold morning smoothie."], ["berries", "ferries", "cherries"],
    ["I always keep <b>frozen berries</b> in my freezer.", "They are great for <b>making smoothies</b>."],
    once("mk_berries", "yes", "Bạn đã lấy quả mọng đông lạnh rồi."), at("mk_freezer", "reach", 800, [["mk_berries", "yes"]]),
    ["pick frozen blueberries", "pick a bag of frozen berries for smoothies", "lấy việt quất đông lạnh"]),
  mkA("check_freezer_door_closed", "freezer", "Close the freezer door tightly", "Đóng kín cửa kính tủ đông", "I'm making sure the glass freezer door is shut tightly so nothing melts.", "Mình kiểm tra chắc chắn cửa kính tủ đông đã đóng kín để đồ không bị chảy.", ["freezer", "melts"], ["melt", "frozen"],
    "<b>make sure + mệnh đề</b> = đảm bảo chắc chắn rằng … <b>melt</b> = tan chảy.", ["I'm making sure the glass freezer door is shut tightly", "so nothing melts."], ["melts", "belts", "pelts"],
    ["Close the freezer door so the ice cream doesn't <b>melt</b>.", "Keep <b>frozen</b> food cold."],
    once("mk_freezerdoor", "yes", "Bạn đã đóng kín cửa tủ đông rồi."), at("mk_freezer", "reach", 700, [["mk_freezerdoor", "yes"]]),
    ["close the freezer door tightly", "make sure the freezer door is shut tightly", "đóng kín cửa kính tủ đông"]),
  mkA("pick_herbal_tea_boxes", "drinksaisle", "Pick chamomile herbal tea", "Chọn trà thảo mộc hoa cúc dễ ngủ", "Chamomile herbal tea helps me sleep soundly when the weather turns cold.", "Trà thảo mộc hoa cúc giúp mình ngủ ngon giấc khi thời tiết chuyển lạnh.", ["herbal tea", "cold"], ["herbaltea", "healthy"],
    "<b>sleep soundly</b> = ngủ ngon và sâu giấc. <b>when the weather turns cold</b> = khi trời trở lạnh.", ["Chamomile herbal tea helps me sleep soundly", "when the weather turns cold."], ["herbal", "verbal", "global"],
    ["Drink warm <b>herbal tea</b> before bed.", "It's caffeine-free and very <b>healthy</b>."],
    once("mk_herbaltea", "yes", "Bạn đã lấy hộp trà thảo mộc hoa cúc rồi."), at("mk_drinks", "reach", 800, [["mk_herbaltea", "yes"]]),
    ["pick chamomile herbal tea", "pick a box of chamomile herbal tea", "chọn trà thảo mộc hoa cúc"]),
  mkA("grab_coconut_water", "drinksaisle", "Grab natural coconut water", "Lấy nước dừa tự nhiên bù nước", "After jogging in the sun, natural coconut water is the best way to rehydrate.", "Sau khi chạy bộ dưới nắng, nước dừa tự nhiên là cách bù nước tuyệt vời nhất.", ["coconut water", "water"], ["coconut", "water"],
    "<b>rehydrate</b> = bù nước cho cơ thể (sau khi vận động hoặc trời nắng nóng).", ["After jogging in the sun,", "natural coconut water is the best way to rehydrate."], ["coconut", "cocoa", "peanut"],
    ["Chilled <b>coconut water</b> is so refreshing.", "Drink plenty of <b>water</b> on hot days."],
    once("mk_coconut", "yes", "Bạn đã lấy nước dừa tự nhiên rồi."), at("mk_drinks", "reach", 800, [["mk_coconut", "yes"]]),
    ["grab natural coconut water", "grab a bottle of natural coconut water", "lấy nước dừa tự nhiên"]),
  mkA("pick_dishwashing_liquid", "household", "Pick lemon dish soap", "Lấy nước rửa chén hương chanh", "This lemon-scented dish soap is gentle on my hands and cuts grease well.", "Nước rửa chén hương chanh này dịu nhẹ với da tay và tẩy dầu mỡ rất tốt.", ["dish soap", "gentle"], ["dishsoap", "laundry"],
    "<b>gentle on my hands</b> = dịu nhẹ, không làm khô da tay; <b>cut grease</b> = đánh bay dầu mỡ.", ["This lemon-scented dish soap", "is gentle on my hands and cuts grease well."], ["soap", "soup", "soak"],
    ["We need a bottle of <b>dish soap</b>.", "This formula is <b>gentle</b> on skin."],
    once("mk_dishsoap", "yes", "Bạn đã lấy nước rửa chén hương chanh rồi."), at("mk_house", "reach", 800, [["mk_dishsoap", "yes"]]),
    ["pick lemon dish soap", "pick a bottle of lemon-scented dish soap", "lấy nước rửa chén hương chanh"]),
  mkA("grab_kitchen_sponges", "household", "Grab a pack of sponges", "Lấy gói miếng bọt biển rửa chén", "We need a new pack of scrub sponges to clean the kitchen sink.", "Nhà mình cần một gói miếng rửa chén mới để cọ rửa bồn bếp.", ["sponges", "need"], ["sponge", "need"],
    "<b>a pack of sponges</b> = một gói miếng bọt biển rửa bát.", ["We need a new pack of scrub sponges", "to clean the kitchen sink."], ["sponges", "spoons", "springs"],
    ["Replace your kitchen <b>sponge</b> regularly.", "I <b>need</b> some cleaning supplies."],
    once("mk_sponges", "yes", "Bạn đã lấy gói miếng rửa chén rồi."), at("mk_house", "reach", 700, [["mk_sponges", "yes"]]),
    ["grab a pack of sponges", "grab a new pack of kitchen sponges", "lấy gói miếng bọt biển rửa chén"]),
  mkA("choose_sunscreen_lotion", "personalcare", "Choose SPF 50 sunscreen", "Chọn kem chống nắng SPF 50", "The UV index is high this week, so I need a waterproof SPF 50 sunscreen.", "Chỉ số tia UV tuần này khá cao nên mình cần một tuýp kem chống nắng SPF 50 chống nước.", ["sunscreen", "need"], ["sunscreen", "need"],
    "<b>UV index</b> = chỉ số tia cực tím; <b>put on sunscreen</b> = thoa kem chống nắng.", ["The UV index is high this week,", "so I need a waterproof SPF 50 sunscreen."], ["sunscreen", "sunshine", "sunglasses"],
    ["Don't forget to wear <b>sunscreen</b> outdoors.", "This lotion is <b>waterproof</b>."],
    once("mk_sunscreen", "yes", "Bạn đã chọn kem chống nắng rồi."), at("mk_care", "reach", 800, [["mk_sunscreen", "yes"]]),
    ["choose SPF 50 sunscreen", "choose a bottle of waterproof sunscreen", "chọn kem chống nắng SPF 50"]),
  mkA("pick_gentle_face_wash", "personalcare", "Pick face wash for sensitive skin", "Chọn sữa rửa mặt cho da nhạy cảm", "Does this foaming face wash work well for sensitive skin?", "Sữa rửa mặt tạo bọt này dùng có hợp với làn da nhạy cảm không nhỉ?", ["sensitive skin", "work well"], ["sensitive", "healthy"],
    "<b>work well for …</b> = có hiệu quả tốt / hợp với … <b>sensitive skin</b> = làn da nhạy cảm.", ["Does this foaming face wash", "work well for sensitive skin?"], ["sensitive", "sensible", "selective"],
    ["This cleanser is made for <b>sensitive skin</b>.", "It's fragrance-free and very <b>gentle</b>."],
    once("mk_facewash", "yes", "Bạn đã chọn sữa rửa mặt dịu nhẹ rồi."), at("mk_care", "read", 800, [["mk_facewash", "yes"]]),
    ["pick face wash for sensitive skin", "pick a gentle foaming face wash", "chọn sữa rửa mặt cho da nhạy cảm"]),
  mkA("choose_brown_rice", "ricebags", "Choose organic brown rice", "Chọn gạo lứt hữu cơ", "I'm picking a bag of organic brown rice—it has a lovely nutty flavor.", "Mình đang chọn một túi gạo lứt hữu cơ — loại này có vị bùi rất thơm ngon.", ["organic", "brown rice"], ["organic", "brownrice", "rice"],
    "<b>brown rice</b> = gạo lứt (giữ lớp cám, giàu dinh dưỡng); <b>white rice</b> = gạo trắng.", ["I'm picking a bag of organic brown rice—", "it has a lovely nutty flavor."], ["brown", "crown", "frown"],
    ["<b>Brown rice</b> takes a little longer to cook.", "We buy <b>organic</b> grains here."],
    once("mk_brownrice", "yes", "Bạn đã chọn túi gạo lứt hữu cơ rồi."), at("mk_rice", "bend", 800, [["mk_brownrice", "yes"]]),
    ["choose organic brown rice", "pick a bag of organic brown rice", "chọn gạo lứt hữu cơ"]),
  mkA("compare_jasmine_rice", "ricebags", "Pick fragrant jasmine rice", "Chọn gạo thơm lài dẻo mềm", "This fragrant Thai jasmine rice cooks up so soft and fluffy every time.", "Gạo thơm lài Thái Lan này lần nào nấu lên hạt cơm cũng mềm và dẻo thơm.", ["jasmine rice", "soft"], ["jasmine", "soft", "rice"],
    "<b>soft and fluffy</b> = mềm và tơi xốp (khen cơm ngon).", ["This fragrant Thai jasmine rice", "cooks up so soft and fluffy every time."], ["soft", "salt", "sort"],
    ["<b>Jasmine rice</b> smells wonderful when cooking.", "The rice is warm and <b>fluffy</b>."],
    once("mk_jasmine", "yes", "Bạn đã chọn gạo thơm lài rồi."), at("mk_rice", "reach", 800, [["mk_jasmine", "yes"]]),
    ["pick fragrant jasmine rice", "pick a bag of fragrant jasmine rice", "chọn gạo thơm lài dẻo mềm"]),
  mkA("choose_free_range_eggs", "eggs", "Choose free-range brown eggs", "Chọn trứng gà thả vườn", "I prefer buying free-range brown eggs from local farms.", "Mình thích mua trứng gà thả vườn vỏ nâu từ các nông trại địa phương hơn.", ["free-range eggs", "eggs"], ["freerange", "egg"],
    "<b>free-range eggs</b> = trứng gà chăn thả tự nhiên. <b>prefer + V-ing</b> = thích làm gì hơn.", ["I prefer buying free-range brown eggs", "from local farms."], ["prefer", "prepare", "pretend"],
    ["<b>Free-range eggs</b> have bright orange yolks.", "I bought a carton of <b>eggs</b>."],
    once("mk_freerange", "yes", "Bạn đã chọn trứng gà thả vườn rồi."), at("mk_eggs", "reach", 800, [["mk_freerange", "yes"]]),
    ["choose free-range brown eggs", "choose a carton of free-range eggs", "chọn trứng gà thả vườn"]),
  mkA("check_egg_carton_date", "eggs", "Check the pack date on the carton", "Xem ngày đóng gói trên vỉ trứng", "Always check the pack date on the egg carton before putting it in the basket.", "Luôn kiểm tra ngày đóng gói trên vỉ trứng trước khi cho vào giỏ hàng nhé.", ["check", "date", "egg"], ["check", "date", "egg"],
    "<b>Always + động từ nguyên mẫu</b> = Hãy luôn … (lời khuyên hữu ích khi đi siêu thị).", ["Always check the pack date on the egg carton", "before putting it in the basket."], ["carton", "cartoon", "cotton"],
    ["Check the <b>expiry date</b> on the carton.", "Put the <b>eggs</b> on top of the basket."],
    once("mk_eggdate", "yes", "Bạn đã xem ngày đóng gói trên vỉ trứng rồi."), at("mk_eggs", "read", 800, [["mk_eggdate", "yes"]]),
    ["check the pack date on the carton", "check the date printed on the egg carton", "xem ngày đóng gói trên vỉ trứng"]),
  mkA("compliment_sample_taste", "samplestand", "Compliment the sesame dressing", "Khen nước sốt mè rang ăn thử", "Mmm, this roasted sesame dressing is delicious! Where is it on the shelf?", "Ừm, sốt mè rang này ngon tuyệt! Chai này để ở kệ nào vậy bạn?", ["sesame dressing", "where"], ["dressing", "sample", "where"],
    "Nếm thử thấy ngon và hỏi chỗ mua: <b>Where is it on the shelf? / Which aisle is it in?</b>", ["Mmm, this roasted sesame dressing is delicious!", "Where is it on the shelf?"], ["dressing", "pressing", "blessing"],
    ["This salad <b>dressing</b> tastes amazing!", "Thanks for the free <b>sample</b>."],
    once("mk_complimentsample", "yes", "Bạn đã khen món ăn thử và hỏi kệ hàng rồi."), at("mk_sample", "point", 800, [["mk_complimentsample", "yes"]]),
    ["compliment the sesame dressing", "compliment the sample and ask where to buy it", "khen nước sốt mè rang ăn thử"]),
  mkA("ask_sample_ingredients", "samplestand", "Ask about food allergies", "Hỏi thành phần dị ứng của mẫu thử", "Is there any dairy or gluten in this cracker sample? I have a mild allergy.", "Mẫu bánh quy giòn này có sữa hay gluten không ạ? Mình bị dị ứng nhẹ.", ["sample", "allergy"], ["sample", "allergy"],
    "<b>have a mild allergy (to …)</b> = bị dị ứng nhẹ (với …). Rất quan trọng khi ăn thử đồ lạ.", ["Is there any dairy or gluten in this cracker sample?", "I have a mild allergy."], ["allergy", "energy", "apology"],
    ["Do you have any food <b>allergies</b>?", "This <b>sample</b> is gluten-free."],
    once("mk_sampleallergy", "yes", "Bạn đã hỏi thành phần dị ứng của mẫu thử rồi."), at("mk_sample", "point", 700, [["mk_sampleallergy", "yes"]]),
    ["ask about food allergies", "ask if the sample contains dairy or gluten", "hỏi thành phần dị ứng của mẫu thử"]),
  mkA("select_english_language", "selfcheckout", "Switch the screen to English", "Chuyển màn hình máy sang tiếng Anh", "I'm tapping the flag icon on the screen to switch the machine to English.", "Tôi đang chạm vào biểu tượng lá cờ trên màn hình để chuyển máy sang tiếng Anh.", ["machine", "English"], ["machine", "language", "selfcheckout"],
    "<b>switch … to English</b> = chuyển ngôn ngữ sang tiếng Anh trên máy tự thanh toán.", ["I'm tapping the flag icon on the screen", "to switch the machine to English."], ["language", "luggage", "message"],
    ["Choose your preferred <b>language</b> on the screen.", "The <b>self-checkout</b> machine is easy to use."],
    once("mk_selflang", "yes", "Bạn đã chuyển màn hình sang tiếng Anh rồi."), at("mk_self", "reach", 700, [["mk_selflang", "yes"]]),
    ["switch the screen to English", "switch the self-checkout screen to English", "chuyển màn hình máy sang tiếng Anh"]),
  mkA("weigh_produce_at_self", "selfcheckout", "Weigh bananas at self-checkout", "Cân chuối ở máy tự thanh toán", "Place your loose fruit on the self-checkout scale and select 'bananas' on the screen.", "Đặt trái cây rời lên bàn cân tự thanh toán và chọn 'chuối' trên màn hình.", ["self-checkout", "scale", "bananas"], ["selfcheckout", "scale", "banana"],
    "Ở máy tự thanh toán, trái cây rời (<b>loose fruit</b>) được cân trực tiếp trên mặt cân của máy.", ["Place your loose fruit on the self-checkout scale", "and select 'bananas' on the screen."], ["select", "collect", "connect"],
    ["Put the <b>bananas</b> on the <b>scale</b>.", "Tap the picture of the fruit on the screen."],
    once("mk_selfweigh", "yes", "Bạn đã cân trái cây ở máy tự thanh toán rồi."), at("mk_self", "reach", 800, [["mk_selfweigh", "yes"]]),
    ["weigh bananas at self-checkout", "weigh fruit on the self-checkout scale", "cân chuối ở máy tự thanh toán"]),
  mkA("ask_about_lost_wallet", "servicedesk", "Ask about a lost wallet", "Hỏi tìm chiếc ví đánh rơi", "Excuse me, has anyone turned in a brown leather wallet at the service desk?", "Xin lỗi, có ai nhặt được và gửi lại chiếc ví da màu nâu ở quầy dịch vụ không ạ?", ["wallet", "help"], ["wallet", "help"],
    "<b>turn in</b> = nộp lại / gửi lại đồ nhặt được cho quầy dịch vụ khách hàng (<b>Lost and Found</b>).", ["Excuse me, has anyone turned in", "a brown leather wallet at the service desk?"], ["wallet", "wall", "walk"],
    ["I left my <b>wallet</b> near the checkout.", "Someone <b>turned in</b> your keys at the desk!"],
    once("mk_lostwallet", "yes", "Bạn đã hỏi quầy dịch vụ về chiếc ví rồi."), at("mk_service", "point", 800, [["mk_lostwallet", "yes"]]),
    ["ask about a lost wallet", "ask at the service desk if anyone turned in a wallet", "hỏi tìm chiếc ví đánh rơi"]),
  mkA("request_gift_wrapping", "servicedesk", "Ask for a gift bag", "Hỏi xin túi đựng quà", "Do you offer gift bags or wrapping paper at the customer service counter?", "Ở quầy dịch vụ khách hàng có túi quà hay giấy gói quà không ạ?", ["gift bags", "counter"], ["giftwrap", "counter", "doyouhave"],
    "<b>gift bag</b> = túi đựng quà; <b>wrapping paper</b> = giấy gói quà.", ["Do you offer gift bags or wrapping paper", "at the customer service counter?"], ["wrapping", "tapping", "clapping"],
    ["Could you put this in a <b>gift bag</b>?", "Ask at the customer service <b>counter</b>."],
    once("mk_giftwrap", "yes", "Bạn đã hỏi về túi đựng quà ở quầy dịch vụ rồi."), at("mk_service", "point", 700, [["mk_giftwrap", "yes"]]),
    ["ask for a gift bag", "ask if they offer gift bags at the service desk", "hỏi xin túi đựng quà"]),
  mkA("check_receipt_before_exit", "exitdoor", "Check my receipt by the exit", "Kiểm tra lại hoá đơn trước khi ra", "Let me glance at my receipt one last time before walking out the exit.", "Để mình nhìn lướt lại hoá đơn lần cuối trước khi bước ra khỏi lối ra.", ["receipt", "exit"], ["receipt", "exit", "check"],
    "<b>glance at</b> = nhìn lướt qua nhanh. <b>one last time</b> = thêm một lần cuối.", ["Let me glance at my receipt one last time", "before walking out the exit."], ["exit", "exist", "exact"],
    ["Keep your <b>receipt</b> until you leave the <b>exit</b>.", "Everything on the bill looks right."],
    once("mk_checkexit", "yes", "Bạn đã kiểm tra lại hoá đơn ở lối ra rồi."), at("mke_door", "read", 800, [["mk_checkexit", "yes"]]),
    ["check my receipt by the exit", "glance at my receipt before walking out the exit", "kiểm tra lại hoá đơn trước khi ra"]),
  mkA("open_umbrella_at_exit", "exitdoor", "Open my umbrella for the rain", "Mở ô vì bên ngoài mưa phùn", "Oh, it started drizzling outside! Good thing I brought my folding umbrella.", "Ồ, bên ngoài bắt đầu mưa phùn rồi! May mà mình có mang theo chiếc ô gấp.", ["drizzling", "brought"], ["drizzle", "bring", "exit"],
    "<b>drizzle</b> = mưa phùn lất phất. <b>Good thing + mệnh đề!</b> = May mà …!", ["Oh, it started drizzling outside!", "Good thing I brought my folding umbrella."], ["drizzling", "drinking", "driving"],
    ["It's <b>drizzling</b>, so take an umbrella.", "<b>Good thing</b> I brought my jacket!"],
    once("mk_umbrellaexit", "yes", "Bạn đã chuẩn bị ô để ra ngoài trời mưa phùn rồi."), at("mke_door", "reach", 800, [["mk_umbrellaexit", "yes"]]),
    ["open my umbrella for the rain", "open my umbrella at the exit because it's drizzling", "mở ô vì bên ngoài mưa phùn"])
];


/* ---------- props carried by the player ---------- */
const MK_PROPS = {
  mk_cardP: `<rect x="-11" y="-30" width="22" height="14" rx="2" fill="#3b6ec2"/><rect x="-11" y="-26" width="22" height="3" fill="#2a3a5a"/><rect x="-7" y="-21" width="6" height="3" rx="1" fill="#f5d34a"/>`,
  mk_receiptP: `<path d="M-7 -36 h14 v24 l-3.5 -2 l-3.5 2 l-3.5 -2 l-3.5 2z" fill="#fff" stroke="#c9b9a0"/><g stroke="#b7a68c"><path d="M-4 -31 h8 M-4 -27 h8 M-4 -23 h5"/></g>`,
  mk_phoneP: `<rect x="-7" y="-36" width="14" height="24" rx="3" fill="#2d2a26"/><rect x="-5" y="-33" width="10" height="17" rx="1" fill="#fff"/><g fill="#2d2a26"><rect x="-4" y="-31" width="3" height="3"/><rect x="1" y="-31" width="3" height="3"/><rect x="-4" y="-26" width="3" height="3"/><rect x="1" y="-24" width="2" height="2"/></g>`,
  mk_cashP: `<rect x="-13" y="-28" width="26" height="13" rx="1.5" fill="#8fc98a" stroke="#5c9a58"/><circle cx="0" cy="-21.5" r="3.5" fill="none" stroke="#5c9a58"/>`,
  mk_couponP: `<rect x="-13" y="-30" width="26" height="14" rx="1.5" fill="#f5d34a" stroke="#c99a1d" stroke-dasharray="3 2"/><text x="0" y="-20" font-size="7" font-weight="800" fill="#c2453b" text-anchor="middle">-$2</text>`,
  mk_memberP: `<rect x="-11" y="-30" width="22" height="14" rx="2" fill="#3a9d5d"/><rect x="-11" y="-26" width="22" height="3" fill="#2f7f4b"/><circle cx="6" cy="-20" r="2.5" fill="#f5d34a"/>`,
  mk_ecoP: `<path d="M-10 -14 h20 l-2 -18 h-16z" fill="#bfa77a" stroke="#8a7550"/><path d="M-5 -32 q5 -8 10 0" stroke="#8a7550" stroke-width="2" fill="none"/>`
};

/* ---------- scene ---------- */
const marketShell = `
<defs>
 <linearGradient id="mkWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f0e4"/><stop offset="1" stop-color="#e6e2cf"/></linearGradient>
 <linearGradient id="mkLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9d4bb"/><stop offset="1" stop-color="#e4dfc8"/></linearGradient>
 <linearGradient id="mkFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2ddd0"/><stop offset="1" stop-color="#cfc8b6"/></linearGradient>
 <linearGradient id="mkWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9a573"/><stop offset="1" stop-color="#bf8455"/></linearGradient>
 <linearGradient id="mkShelf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f7f5"/><stop offset="1" stop-color="#dfe3e6"/></linearGradient>
 <linearGradient id="mkChrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6ebef"/><stop offset=".5" stop-color="#fbfcfd"/><stop offset="1" stop-color="#c4cdd4"/></linearGradient>
 <linearGradient id="mkGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f6fb"/><stop offset=".55" stop-color="#cbe6f2"/><stop offset="1" stop-color="#b4d8e8"/></linearGradient>
 <filter id="mkSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect x="120" y="0" width="880" height="330" fill="url(#mkWall)"/>
<polygon points="0,0 120,0 120,330 0,640" fill="url(#mkLeft)"/>
<polygon points="120,330 1000,330 1000,640 0,640" fill="url(#mkFloor)"/>
${D("floor-tiles", `<g stroke="#c4bca8" stroke-width="1.2" opacity=".6"><path d="M90 400 H1000 M60 460 H1000 M35 520 H1000 M12 580 H1000"/><path d="M260 330 L200 640 M420 330 L400 640 M580 330 L600 640 M740 330 L800 640 M900 330 L990 640"/></g>`)}
${D("wall-stripe", `<rect x="120" y="20" width="880" height="18" fill="#3a9d5d"/><text x="560" y="34" font-size="13" font-weight="800" fill="#fff" text-anchor="middle" letter-spacing="3">FRESH MARKET</text>`)}
${D("ceiling-lights", `<g fill="#fffbe6" stroke="#e0dccb"><rect x="230" y="4" width="120" height="8" rx="3"/><rect x="500" y="4" width="120" height="8" rx="3"/><rect x="770" y="4" width="120" height="8" rx="3"/></g>`)}
${D("aisle-signs", `<g font-size="11" font-weight="800" text-anchor="middle"><rect x="545" y="48" width="70" height="22" rx="4" fill="#e8743b"/><text x="580" y="63" fill="#fff">AISLE 2</text><rect x="695" y="48" width="70" height="22" rx="4" fill="#3b6ec2"/><text x="730" y="63" fill="#fff">AISLE 3</text><rect x="865" y="48" width="70" height="22" rx="4" fill="#c2453b"/><text x="900" y="63" fill="#fff">AISLE 4</text></g>`)}
${D("plant", `<rect x="975" y="560" width="22" height="60" fill="#e8743b"/><g fill="#5f9e5a"><ellipse cx="986" cy="545" rx="12" ry="24"/><ellipse cx="972" cy="552" rx="9" ry="18" transform="rotate(-25 972 552)"/></g>`)}
`;

const ENTRANCE_OBJS = new Set(["shopcart", "shopbasket", "pricesign", "samplestand", "exitdoor"]);
const PRODUCE_OBJS = new Set(["produce", "fruitscale", "bakery"]);
const DAIRY_OBJS = new Set(["dairy", "eggs", "freezer", "drinksaisle"]);
const MEAT_OBJS = new Set(["meatcounter", "ricebags", "household", "personalcare"]);

const marketWorld = [
  objG("snacks", "snacks", "đồ ăn vặt", 380, 861, 84, `
   <rect class="hit" x="820" y="90" width="82" height="282"/>
   <rect x="822" y="92" width="78" height="276" fill="url(#mkShelf)" stroke="#9aa6af"/>
   <g fill="#9aa6af"><rect x="822" y="166" width="78" height="5"/><rect x="822" y="236" width="78" height="5"/><rect x="822" y="306" width="78" height="5"/></g>
   <g class="mk-chips"><path d="M828 166 l2 -36 h20 l2 36z" fill="#e8743b"/></g><path d="M856 166 l2 -36 h18 l2 36z" fill="#c2453b"/><path d="M880 166 l2 -32 h14 l2 32z" fill="#3a9d5d"/>
   <g fill="#3b6ec2"><rect x="828" y="204" width="30" height="32" rx="2"/></g><g fill="#f5d34a"><rect x="864" y="210" width="28" height="26" rx="2"/></g>
   <g fill="#8a5a3a"><rect x="828" y="282" width="32" height="24" rx="2"/><rect x="866" y="282" width="28" height="24" rx="2"/></g>
   <g font-size="8" font-weight="800" fill="#2d2a26"><rect x="830" y="168" width="24" height="10" fill="#fff"/><text x="842" y="176" text-anchor="middle">$2.50</text><rect x="862" y="168" width="24" height="10" fill="#f5d34a"/><text x="874" y="176" text-anchor="middle">$1.99</text></g>`),
  objG("checkout", "checkout counter & cashier", "quầy thanh toán và thu ngân", 560, 650, 400, `
   <rect class="hit" x="560" y="410" width="250" height="176"/>
   <g transform="translate(690,500) scale(1.6) translate(-690,-500)"><rect x="668" y="430" width="44" height="66" rx="13" fill="#3a9d5d"/><rect x="676" y="446" width="28" height="44" rx="4" fill="#f3f0e4"/>
   <circle cx="690" cy="414" r="18" fill="#c99470"/><path d="M672 410 Q690 384 708 410 Q704 398 690 398 Q676 398 672 410z" fill="#2a1d14"/>
   <circle cx="684" cy="416" r="2" fill="#2d2a26"/><circle cx="696" cy="416" r="2" fill="#2d2a26"/><path d="M684 424 Q690 428 696 424" stroke="#8a2f3c" stroke-width="2" fill="none"/>
   <rect x="678" y="452" width="10" height="6" rx="1" fill="#fff"/></g>
   <ellipse cx="690" cy="588" rx="130" ry="7" fill="#000" opacity=".16" filter="url(#mkSoft)"/>
   <rect x="562" y="500" width="256" height="12" rx="3" fill="#2d2a26"/>
   <rect x="566" y="512" width="248" height="72" fill="#3a9d5d" stroke="#2f7f4b"/><rect x="566" y="524" width="248" height="5" fill="#f5d34a"/>
   <text x="690" y="560" font-size="16" font-weight="800" fill="#fff" text-anchor="middle">CHECKOUT 1</text>
   <rect x="600" y="476" width="54" height="24" rx="3" fill="#4b4f57"/><rect x="606" y="480" width="42" height="12" fill="#7fd0c8"/>
   <text class="mk-total" x="627" y="490" font-size="9" font-weight="800" fill="#1f3a36" text-anchor="middle">$12.40</text>
   <g class="mk-onBelt"><rect x="720" y="484" width="12" height="18" rx="2" fill="#fff" stroke="#9fb7c9"/><circle cx="744" cy="494" r="7" fill="#d8453a"/><path d="M756 500 Q766 482 780 500z" fill="#d9944a"/></g>
   <path class="mk-receiptOut" d="M612 476 h18 v-18 h-18z" fill="#fff" stroke="#c9b9a0"/>
   <g class="mk-lineDots" fill="#3b6ec2"><circle cx="560" cy="604" r="4"/><circle cx="545" cy="604" r="4"/></g>`),
  objG("cardreader", "card reader", "máy quẹt thẻ", 562, 800, 446, `
   <rect class="hit" x="780" y="456" width="44" height="50"/>
   <rect x="788" y="466" width="28" height="38" rx="4" fill="#3a3f46"/><rect x="792" y="470" width="20" height="12" fill="#9fd3f0"/>
   <g fill="#c4cdd4"><rect x="793" y="486" width="5" height="4"/><rect x="800" y="486" width="5" height="4"/><rect x="807" y="486" width="5" height="4"/><rect x="793" y="493" width="5" height="4"/><rect x="800" y="493" width="5" height="4"/><rect x="807" y="493" width="5" height="4"/></g>
   <circle class="mk-paidLed" cx="802" cy="462" r="3" fill="#7fd07a"/>`),
  objG("bags", "shopping bags", "túi đựng đồ", 600, 880, 500, `
   <rect class="hit" x="836" y="508" width="90" height="94"/>
   <rect x="842" y="520" width="78" height="76" rx="3" fill="#dfe3e6" stroke="#9aa6af"/>
   <g class="mk-bagStack"><path d="M852 560 h26 l-3 32 h-20z" fill="#f3f0e4" stroke="#c9b9a0"/><path d="M858 560 q7 -12 14 0" stroke="#c9b9a0" stroke-width="2" fill="none"/></g>
   <g class="mk-packedBags"><path d="M884 556 h28 l-3 36 h-22z" fill="#3a9d5d"/><path d="M890 556 q8 -14 16 0" stroke="#2f7f4b" stroke-width="2" fill="none"/>
   <g><rect x="888" y="546" width="8" height="14" fill="#fff"/><path d="M898 552 Q904 540 910 552z" fill="#d9944a"/></g></g>
   <text x="881" y="534" font-size="9" font-weight="800" fill="#5a3d1f" text-anchor="middle">BAGS 10¢</text>`),
  objG("selfcheckout", "self-checkout", "quầy tự thanh toán", 622, 505, 636, `
   <rect class="hit" x="462" y="518" width="86" height="104"/>
   <ellipse cx="505" cy="620" rx="40" ry="4" fill="#000" opacity=".14" filter="url(#mkSoft)"/>
   <rect x="472" y="566" width="62" height="52" rx="3" fill="#4b4f57"/><rect x="466" y="562" width="74" height="8" rx="2" fill="#3a3f46"/>
   <rect x="501" y="546" width="6" height="18" fill="#3a3f46"/><rect x="480" y="522" width="48" height="30" rx="3" fill="#2d2a26"/><rect x="484" y="526" width="40" height="22" fill="#7fd0c8"/>
   <text x="504" y="540" font-size="8" font-weight="800" fill="#1f3a36" text-anchor="middle">SCAN</text>
   <rect x="478" y="574" width="20" height="3" fill="#c2453b"/><text x="505" y="604" font-size="7" font-weight="800" fill="#fff" text-anchor="middle">SELF</text>
   <path class="mk-scanTick" d="M512 542 l4 4 l8 -10" stroke="#3a9d5d" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  objG("servicedesk", "service desk", "quầy dịch vụ", 494, 912, 380, `
   <rect class="hit" x="836" y="398" width="158" height="96"/>
   <ellipse cx="915" cy="492" rx="78" ry="5" fill="#000" opacity=".14" filter="url(#mkSoft)"/>
   <g transform="translate(940,430) scale(1.3) translate(-940,-430)"><rect x="928" y="418" width="24" height="26" rx="8" fill="#3b6ec2"/><circle cx="940" cy="408" r="10" fill="#f2c9a0"/><path d="M930 405 Q940 392 950 405 Q946 398 940 398 Q934 398 930 405z" fill="#5a3d1f"/><circle cx="936" cy="409" r="1.4" fill="#2d2a26"/><circle cx="944" cy="409" r="1.4" fill="#2d2a26"/></g>
   <rect x="838" y="434" width="154" height="10" rx="3" fill="#2d2a26"/><rect x="842" y="444" width="146" height="46" fill="url(#mkWood)" stroke="#a87048"/>
   <rect x="852" y="452" width="96" height="16" rx="3" fill="#3b6ec2"/><text x="900" y="464" font-size="8" font-weight="800" fill="#fff" text-anchor="middle">CUSTOMER SERVICE</text>
   <circle cx="968" cy="468" r="10" fill="#f5d34a"/><text x="968" y="472" font-size="11" font-weight="900" fill="#5a3d1f" text-anchor="middle">?</text>`)
].join("\n");

const marketCss = `
#room .mk-saleTick{display:none}#room [data-mk_sale="yes"] .mk-saleTick{display:inline}
#room .mk-dateTick{display:none}#room [data-mk_date="yes"] .mk-dateTick{display:inline}
#room [data-mk_cart="have"] .mk-cartP{opacity:.25}
#room [data-mk_basket="have"] .mk-baskets{display:none}
#room :not([data-mk_apples="none"]) .mk-apples{opacity:.55}
#room :not([data-mk_bananas="none"]) .mk-bananas{display:none}
#room :not([data-mk_milk="none"]) .mk-milk{display:none}
#room :not([data-mk_bread="none"]) .mk-loaf{display:none}
#room :not([data-mk_chips="none"]) .mk-chips{display:none}
#room .mk-w1,#room .mk-scaleApples{display:none}
#room [data-mk_apples="weighed"] .mk-w1{display:inline}#room [data-mk_apples="weighed"] .mk-w0{display:none}
#room [data-mk_apples="picked"] .mk-scaleApples{display:inline}
#room .mk-lineDots{display:none}#room [data-mk_queue="yes"][data-mk_paid="no"] .mk-lineDots{display:inline}
#room .mk-total,#room .mk-onBelt{display:none}#room [data-mk_counter="yes"] .mk-total{display:inline}#room [data-mk_counter="yes"][data-mk_packed="no"] .mk-onBelt{display:inline}
#room .mk-paidLed{opacity:.15}#room [data-mk_paid="yes"] .mk-paidLed{opacity:1}
#room .mk-receiptOut{display:none}#room [data-mk_paid="yes"][data-mk_receipt="no"] .mk-receiptOut{display:inline}
#room .mk-packedBags{display:none}#room [data-mk_packed="yes"] .mk-packedBags{display:inline}
#room [data-mk_bag="have"] .mk-bagStack{opacity:.4}
#room .mk-bye{display:none}#room [data-mk_left="yes"] .mk-bye{display:inline}
#room :not([data-mk_detergent="none"]) .mk-det,#room :not([data-mk_tissues="none"]) .mk-tis,#room :not([data-mk_shampoo="none"]) .mk-shamp,#room :not([data-mk_toothpaste="none"]) .mk-paste{display:none}
#room :not([data-mk_eggs="none"]) .mk-eggBox,#room :not([data-mk_water="none"]) .mk-waterP,#room :not([data-mk_juice="none"]) .mk-juiceP{display:none}
#room :not([data-mk_pork="none"]) .mk-porkP,#room :not([data-mk_fish="none"]) .mk-fishP,#room :not([data-mk_chicken="none"]) .mk-chickP{display:none}
#room :not([data-mk_dumplings="none"]) .mk-dumpP,#room :not([data-mk_icecream="none"]) .mk-iceP,#room :not([data-mk_rice="none"]) .mk-riceTop{display:none}
#room .mk-eggTick{display:none}#room [data-mk_eggcheck="yes"] .mk-eggTick{display:inline}
#room [data-mk_sample="yes"] .mk-samples g{opacity:.3}
#room .mk-scanTick{display:none}#room [data-mk_scanned="yes"] .mk-scanTick{display:inline}
`;

const MK_W0 = { mk_cart: "none", mk_basket: "none", mk_price: "no", mk_sale: "no", mk_apples: "none", mk_bananas: "none", mk_askmilk: "no",
  mk_milk: "none", mk_date: "no", mk_bread: "none", mk_chips: "none", mk_compare: "no", mk_queue: "no", mk_counter: "no", mk_bag: "none",
  mk_paid: "no", mk_receipt: "no", mk_packed: "no", mk_left: "no",
  mk_oranges: "none", mk_mangoes: "none", mk_veg: "none", mk_pork: "none", mk_fish: "none", mk_chicken: "none", mk_dumplings: "none", mk_icecream: "none",
  mk_water: "none", mk_juice: "none", mk_cake: "none", mk_detergent: "none", mk_tissues: "none", mk_shampoo: "none", mk_toothpaste: "none", mk_rice: "none", mk_eggs: "none",
  mk_askfresh: "no", mk_sliced: "no", mk_askstock: "no", mk_reach: "no", mk_askrice: "no", mk_eggcheck: "no", mk_sample: "no", mk_promo: "no", mk_asksale: "no",
  mk_paidBy: "none", mk_coupon: "no", mk_points: "no", mk_pricecheck: "no", mk_scanned: "no", mk_selfhelp: "no", mk_returned: "no", mk_member: "no", mk_delivery: "no", mk_hours: "no",
  mk_wipecart: "no", mk_swapcart: "no", mk_stackbasket: "no", mk_switchcart: "no", mk_flyer: "no", mk_unitprice: "no",
  mk_avocado: "no", mk_strawberries: "no", mk_broccoli: "no", mk_sticker: "no", mk_grapes: "no", mk_baguette: "no", mk_wheatrolls: "no",
  mk_yogurt: "no", mk_cheddar: "no", mk_almonds: "no", mk_darkchoc: "no", mk_greetcashier: "no", mk_divider: "no",
  mk_enterpin: "no", mk_approved: "no", mk_insulated: "no", mk_doublebag: "no", mk_leanbeef: "no", mk_cooktip: "no",
  mk_berries: "no", mk_freezerdoor: "no", mk_herbaltea: "no", mk_coconut: "no", mk_dishsoap: "no", mk_sponges: "no",
  mk_sunscreen: "no", mk_facewash: "no", mk_brownrice: "no", mk_jasmine: "no", mk_freerange: "no", mk_eggdate: "no",
  mk_complimentsample: "no", mk_sampleallergy: "no", mk_selflang: "no", mk_selfweigh: "no", mk_lostwallet: "no", mk_giftwrap: "no",
  mk_checkexit: "no", mk_umbrellaexit: "no" };

/* ---------- prices (cart total for the cashier) ---------- */
const MK_PRICE = { mk_milk: 1.8, mk_apples: 3, mk_bananas: 1.2, mk_bread: 2.5, mk_chips: 2.5, mk_oranges: 2.4, mk_mangoes: 3.5, mk_veg: 2.2, mk_pork: 4.5, mk_fish: 6,
  mk_chicken: 5, mk_dumplings: 4, mk_icecream: 3.5, mk_water: 3, mk_juice: 2.8, mk_cake: 12, mk_detergent: 6.5, mk_tissues: 2, mk_shampoo: 5.5, mk_toothpaste: 2.3, mk_rice: 9, mk_eggs: 3.2 };
function totalOf(W) {
  let t = 0; for (const k of ITEMS) if (W[k] && W[k] !== "none") t += MK_PRICE[k] || 0;
  if (W.mk_bag === "have") t += 0.1; else if (W.mk_bag === "eco") t += 1.5;
  if (W.mk_coupon === "yes") t -= 2; if (W.mk_points === "yes") t -= 1;
  return Math.max(0, Math.round(t * 100) / 100);
}
const money = p => "$" + p.toFixed(2);
const moneyVi = p => { const d = Math.floor(p + 1e-9), c = Math.round((p - d) * 100); return d + " đô" + (c ? " " + c : ""); };

const marketObjectsAll = {
  shopcart: { en: "shopping cart", vi: "xe đẩy mua hàng", ipa: "/ˈʃɒp.ɪŋ kɑːt/", acts: ["grab_a_cart", "return_the_cart", "wipe_cart_handle", "check_cart_wheels"] },
  shopbasket: { en: "shopping basket", vi: "giỏ mua hàng", ipa: "/ˈʃɒp.ɪŋ ˈbɑː.skɪt/", acts: ["take_a_basket", "stack_empty_basket", "switch_basket_to_cart"] },
  pricesign: { en: "discount sign", vi: "biển giảm giá", ipa: "/ˈdɪs.kaʊnt saɪn/", acts: ["check_the_price", "look_for_discount", "ask_if_on_sale", "read_weekly_flyer", "calculate_unit_price"] },
  produce: { en: "fruit & vegetable stand", vi: "quầy rau quả", ipa: "/fruːt ən ˈvedʒ.tə.bəl stænd/", acts: ["pick_some_apples", "take_some_bananas", "pick_some_oranges", "ask_mangoes_ripe", "get_some_vegetables", "pick_ripe_avocados", "smell_fresh_strawberries", "choose_broccoli_for_soup"] },
  fruitscale: { en: "scale", vi: "cái cân", ipa: "/skeɪl/", acts: ["weigh_the_apples", "print_weight_sticker", "weigh_bunch_of_grapes"] },
  bakery: { en: "bakery shelf", vi: "kệ bánh mì", ipa: "/ˈbeɪ.kər.i ʃelf/", acts: ["get_some_bread", "buy_birthday_cake", "smell_warm_baguettes", "pick_whole_wheat_rolls"] },
  dairy: { en: "dairy fridge", vi: "tủ lạnh sữa", ipa: "/ˈdeə.ri frɪdʒ/", acts: ["find_the_milk", "check_the_date", "ask_where_milk", "pick_greek_yogurt", "choose_cheddar_cheese"] },
  snacks: { en: "snack aisle", vi: "kệ đồ ăn vặt", ipa: "/snæk aɪl/", acts: ["grab_some_chips", "compare_prices", "put_item_back", "pick_roasted_almonds", "choose_dark_chocolate"] },
  checkout: { en: "checkout counter", vi: "quầy thanh toán", ipa: "/ˈtʃek.aʊt ˌkaʊn.tər/", acts: ["queue_at_checkout", "put_items_on_counter", "use_a_coupon", "use_loyalty_points", "ask_price_check",
    "ask_for_a_bag", "tap_my_card", "pay_with_qr", "pay_cash_market", "get_the_receipt", "greet_the_cashier", "put_divider_on_belt"] },
  cardreader: { en: "card reader", vi: "máy quẹt thẻ", ipa: "/ˈkɑːd ˌriː.dər/", acts: ["tap_my_card", "enter_pin_number", "check_payment_approved"] },
  bags: { en: "shopping bags", vi: "túi đựng đồ", ipa: "/ˈʃɒp.ɪŋ bæɡz/", acts: ["ask_for_a_bag", "bring_own_bag", "buy_eco_bag", "pack_the_bags", "separate_cold_items", "double_bag_heavy_bottles"] },
  meatcounter: { en: "meat & fish counter", vi: "quầy thịt cá", ipa: "/miːt ən fɪʃ ˈkaʊn.tər/", acts: ["ask_if_fresh", "order_some_pork", "ask_to_slice", "buy_fresh_fish", "buy_chicken", "ask_for_lean_beef", "ask_cooking_tip_butcher"] },
  freezer: { en: "freezer", vi: "tủ đông", ipa: "/ˈfriː.zər/", acts: ["get_frozen_dumplings", "get_ice_cream", "pick_frozen_berries", "check_freezer_door_closed"] },
  drinksaisle: { en: "drinks aisle", vi: "kệ đồ uống", ipa: "/drɪŋks aɪl/", acts: ["get_a_pack_of_water", "get_some_juice", "ask_more_in_back", "pick_herbal_tea_boxes", "grab_coconut_water"] },
  household: { en: "household goods", vi: "đồ gia dụng", ipa: "/ˈhaʊs.həʊld ɡʊdz/", acts: ["get_detergent", "get_tissues", "ask_help_reach", "pick_dishwashing_liquid", "grab_kitchen_sponges"] },
  personalcare: { en: "personal care", vi: "đồ chăm sóc cá nhân", ipa: "/ˈpɜː.sən.əl keər/", acts: ["get_shampoo", "get_toothpaste", "choose_sunscreen_lotion", "pick_gentle_face_wash"] },
  ricebags: { en: "rice bags", vi: "bao gạo", ipa: "/raɪs bæɡz/", acts: ["ask_where_rice", "get_bag_of_rice", "choose_brown_rice", "compare_jasmine_rice"] },
  eggs: { en: "eggs", vi: "trứng", ipa: "/eɡz/", acts: ["get_some_eggs", "check_eggs", "choose_free_range_eggs", "check_egg_carton_date"] },
  samplestand: { en: "free samples", vi: "quầy ăn thử", ipa: "/friː ˈsɑːm.pəlz/", acts: ["try_a_sample", "ask_about_promo", "compliment_sample_taste", "ask_sample_ingredients"] },
  selfcheckout: { en: "self-checkout", vi: "quầy tự thanh toán", ipa: "/ˌself ˈtʃek.aʊt/", acts: ["scan_my_items", "self_checkout_help", "pay_at_self_checkout", "select_english_language", "weigh_produce_at_self"] },
  servicedesk: { en: "customer service desk", vi: "quầy dịch vụ khách hàng", ipa: "/ˈkʌs.tə.mər ˈsɜː.vɪs desk/", acts: ["return_an_item", "sign_up_membership", "ask_about_delivery", "ask_store_hours", "ask_about_lost_wallet", "request_gift_wrapping"] },
  exitdoor: { en: "exit", vi: "lối ra", ipa: "/ˈek.sɪt/", acts: ["leave_the_store", "check_receipt_before_exit", "open_umbrella_at_exit"] }
};

const CHECKOUT_OBJS = new Set(["snacks", "checkout", "cardreader", "bags", "selfcheckout", "servicedesk"]);
const marketObjects = Object.fromEntries(Object.entries(marketObjectsAll).filter(([k]) => CHECKOUT_OBJS.has(k)));
const marketMainActions = marketActions.filter(a => CHECKOUT_OBJS.has(a.obj));

const market_checkout = {
  id: "market_checkout", topic: "market", icon: "💳", zoneOrder: 5,
  name: "Checkout & Customer Service", nameVi: "Quầy thu ngân & dịch vụ", names: ["Checkout & Customer Service", "Quầy thu ngân & dịch vụ"],
  go: {
    label: "Head to checkout & customer service",
    labelVi: "Qua khu quầy thu ngân & dịch vụ",
    sentence: "I'm heading to the checkout counter and customer service desk.",
    vi: "Tôi đang đi sang quầy thu ngân và quầy dịch vụ khách hàng.",
    key: ["heading", "checkout", "service"],
    chunks: ["I'm heading to the checkout counter", "and customer service desk."],
    grammar: "<b>head to …</b> = đi về phía / chuyển sang khu … trong siêu thị.",
    patterns: ["I'm heading to <b>the checkout counter</b>.", "I'm heading to <b>the customer service desk</b>."],
    vocab: [["checkout", "/ˈtʃek.aʊt/", "quầy thanh toán"], ["customer service", "/ˈkʌs.tə.mər ˈsɜː.vɪs/", "dịch vụ khách hàng"]],
    story: ["head to the checkout counter", "walk to the checkout and customer service desk", "đi sang khu quầy thu ngân & dịch vụ"]
  },
  shellSvg: marketShell, worldSvg: marketWorld, W0: MK_W0,
  spots: {
    mk_door: { x: 120, y: 520, d: -1 }, mk_dairy: { x: 730, y: 392, d: 1 },
    mk_snacks: { x: 158, y: 374, d: 1 }, mk_line: { x: 420, y: 534, d: 1 }, mk_checkout: { x: 520, y: 524, d: 1 }, mk_reader: { x: 696, y: 512, d: 1 },
    mk_bags: { x: 716, y: 618, d: -1 },
    mk_house: { x: 165, y: 392, d: -1 }, mk_care: { x: 128, y: 400, d: -1 }, mk_eggs: { x: 467, y: 392, d: 1 }, mk_drinks: { x: 948, y: 396, d: 1 },
    mk_meat: { x: 362, y: 526, d: 1 }, mk_freezer: { x: 496, y: 526, d: 1 }, mk_rice: { x: 330, y: 548, d: 1 },
    mk_self: { x: 184, y: 512, d: 1 }, mk_service: { x: 456, y: 368, d: 1 }
  },
  obstacles: [],
  entry: { x: 150, y: 590, d: 1 },
  objects: marketObjects,
  actions: marketMainActions,
  props: MK_PROPS,
  applyState(W, root) {
    mirrorState(W, MK_W0, root);
    try { const t = root.querySelector && root.querySelector(".mk-total"); if (t) t.textContent = money(totalOf(W)); } catch (e) { /* ignore */ }
  },
  css: marketCss,
  catalog: cat("mk_", [
    ["supermarket", "/ˈsuː.pəˌmɑː.kɪt/", "siêu thị", "place"], ["aisle", "/aɪl/", "lối đi giữa các kệ", "place"], ["checkout", "/ˈtʃek.aʊt/", "quầy thanh toán", "place"],
    ["cashier", "/kæʃˈɪər/", "thu ngân", "people"], ["customer", "/ˈkʌs.tə.mər/", "khách hàng", "people"], ["shopping cart", "/ˈʃɒp.ɪŋ kɑːt/", "xe đẩy", "equipment"],
    ["basket", "/ˈbɑː.skɪt/", "giỏ", "equipment"], ["scale", "/skeɪl/", "cái cân", "equipment"], ["card reader", "/ˈkɑːd ˌriː.dər/", "máy quẹt thẻ", "equipment"],
    ["shelf", "/ʃelf/", "kệ hàng", "furniture"], ["fridge", "/frɪdʒ/", "tủ lạnh", "furniture"], ["price tag", "/ˈpraɪs tæɡ/", "nhãn giá", "other"],
    ["discount", "/ˈdɪs.kaʊnt/", "giảm giá", "money"], ["on sale", "/ɒn seɪl/", "đang giảm giá", "money"], ["receipt", "/rɪˈsiːt/", "hoá đơn", "money"],
    ["cash", "/kæʃ/", "tiền mặt", "money"], ["change", "/tʃeɪndʒ/", "tiền thối", "money"], ["apple", "/ˈæp.əl/", "quả táo", "food"],
    ["banana", "/bəˈnɑː.nə/", "quả chuối", "food"], ["orange", "/ˈɒr.ɪndʒ/", "quả cam", "food"], ["carrot", "/ˈkær.ət/", "cà rốt", "food"],
    ["milk", "/mɪlk/", "sữa", "drink"], ["yogurt", "/ˈjɒɡ.ət/", "sữa chua", "food"], ["cheese", "/tʃiːz/", "phô mai", "food"], ["eggs", "/eɡz/", "trứng", "food"],
    ["bread", "/bred/", "bánh mì", "food"], ["chips", "/tʃɪps/", "khoai tây chiên gói", "food"], ["cookies", "/ˈkʊk.iz/", "bánh quy", "food"],
    ["shopping bag", "/ˈʃɒp.ɪŋ bæɡ/", "túi mua hàng", "other"], ["groceries", "/ˈɡrəʊ.sər.iz/", "đồ mua ở siêu thị", "other"], ["exit", "/ˈek.sɪt/", "lối ra", "place"],
    ["mango", "/ˈmæŋ.ɡəʊ/", "quả xoài", "food"], ["lettuce", "/ˈlet.ɪs/", "xà lách", "food"], ["pork", "/pɔːk/", "thịt heo", "food"], ["beef", "/biːf/", "thịt bò", "food"],
    ["chicken breast", "/ˈtʃɪk.ɪn brest/", "ức gà", "food"], ["salmon", "/ˈsæm.ən/", "cá hồi", "food"], ["butcher", "/ˈbʊtʃ.ər/", "người bán thịt", "people"],
    ["meat counter", "/ˈmiːt ˌkaʊn.tər/", "quầy thịt", "place"], ["freezer", "/ˈfriː.zər/", "tủ đông", "equipment"], ["frozen food", "/ˈfrəʊ.zən fuːd/", "đồ đông lạnh", "food"],
    ["dumplings", "/ˈdʌm.plɪŋz/", "bánh xếp", "food"], ["ice cream", "/ˌaɪs ˈkriːm/", "kem", "food"], ["juice", "/dʒuːs/", "nước ép", "drink"], ["bottled water", "/ˌbɒt.əld ˈwɔː.tər/", "nước đóng chai", "drink"],
    ["rice", "/raɪs/", "gạo", "food"], ["detergent", "/dɪˈtɜː.dʒənt/", "nước giặt", "other"], ["tissues", "/ˈtɪʃ.uːz/", "khăn giấy", "other"], ["shampoo", "/ʃæmˈpuː/", "dầu gội", "other"],
    ["toothpaste", "/ˈtuːθ.peɪst/", "kem đánh răng", "other"], ["free sample", "/friː ˈsɑːm.pəl/", "mẫu ăn thử", "other"], ["coupon", "/ˈkuː.pɒn/", "phiếu giảm giá", "money"],
    ["loyalty points", "/ˈlɔɪ.əl.ti pɔɪnts/", "điểm tích lũy", "money"], ["QR code", "/ˌkjuː ˈɑː kəʊd/", "mã QR", "money"], ["self-checkout", "/ˌself ˈtʃek.aʊt/", "quầy tự thanh toán", "place"],
    ["customer service", "/ˈkʌs.tə.mər ˈsɜː.vɪs/", "dịch vụ khách hàng", "place"], ["refund", "/ˈriː.fʌnd/", "hoàn tiền", "money"], ["eco bag", "/ˈiː.kəʊ bæɡ/", "túi vải", "other"],
    ["barcode", "/ˈbɑː.kəʊd/", "mã vạch", "other"], ["delivery", "/dɪˈlɪv.ər.i/", "giao hàng", "other"]
  ])
};

/* ---------- NPCs + staff replies ---------- */
// {total} / {total_vi} are filled from the live cart (items, coupon, points, bags)
const NPCS = {
  cashier: { id: "cashier", name: "Cashier", role_vi: "Thu ngân", avatar: "🧑‍💼", voice: "young_female", room: "market_checkout",
    lines: {
      ask_where_milk: { en: "It's in aisle 3, in the big fridge.", vi: "Ở lối số 3, trong tủ lạnh lớn ạ." },
      check_the_price: { en: "Apples are three dollars a kilo.", vi: "Táo giá ba đô một ký ạ." },
      weigh_the_apples: { en: "One kilo. That's three dollars.", vi: "Một ký. Giá ba đô ạ." },
      queue_at_checkout: { en: "Next, please!", vi: "Mời người tiếp theo!" },
      put_items_on_counter: { en: "Hi there! Did you find everything okay?", vi: "Chào bạn! Bạn tìm đủ đồ chưa?" },
      ask_for_a_bag: { en: "Sure, bags are ten cents each.", vi: "Có ạ, mỗi túi mười xu." },
      tap_my_card: { en: "That's {total}. Go ahead and tap your card.", vi: "Của bạn {total_vi}. Bạn chạm thẻ nhé." },
      pay_with_qr: { en: "Sure! That's {total}. Just scan the code on the screen.", vi: "Được ạ! {total_vi}. Bạn quét mã trên màn hình nhé." },
      pay_cash_market: { en: "That's {total}. Here's your change and your receipt.", vi: "Của bạn {total_vi}. Tiền thối và hoá đơn đây ạ." },
      use_a_coupon: { en: "No problem — that's two dollars off.", vi: "Được ạ — giảm hai đô nhé." },
      use_loyalty_points: { en: "You've got enough points for a dollar off!", vi: "Bạn đủ điểm để giảm một đô rồi!" },
      ask_price_check: { en: "Oh, you're right. Sorry about that — I've fixed it.", vi: "Ồ, bạn nói đúng. Xin lỗi nhé — mình sửa rồi." },
      get_the_receipt: { en: "Here's your receipt.", vi: "Hoá đơn của bạn đây." },
      bring_own_bag: { en: "Great, thanks for bringing your own bag!", vi: "Tuyệt, cảm ơn bạn đã mang túi riêng!" },
      buy_eco_bag: { en: "Sure, eco bags are a dollar fifty.", vi: "Vâng, túi vải giá một đô rưỡi." },
      leave_the_store: { en: "Thank you! See you next time!", vi: "Cảm ơn bạn! Hẹn gặp lại!" }
    } },
  clerk: { id: "clerk", name: "Shop assistant", role_vi: "Nhân viên siêu thị", avatar: "🧑‍🌾", voice: "young_male", room: "market_entrance",
    lines: {
      look_for_discount: { en: "Yes, bananas are 20% off today!", vi: "Đúng rồi, hôm nay chuối giảm 20%!" },
      ask_if_on_sale: { en: "Yep, all the fruit on that stand is 20% off.", vi: "Có ạ, trái cây ở quầy đó đều giảm 20%." },
      ask_mangoes_ripe: { en: "These ones are perfect — eat them today or tomorrow.", vi: "Mấy quả này chín vừa — ăn trong hôm nay hoặc mai nhé." },
      get_some_bread: { en: "It's fresh. We bake it every morning.", vi: "Bánh mới đấy. Sáng nào tụi mình cũng nướng." },
      buy_birthday_cake: { en: "Would you like us to write a name on it?", vi: "Bạn có muốn bọn mình viết tên lên bánh không?" },
      ask_more_in_back: { en: "Let me check in the back for you. One sec!", vi: "Để mình vào kho xem giúp bạn. Chờ chút nhé!" },
      ask_help_reach: { en: "Sure, here you go!", vi: "Được chứ, của bạn đây!" },
      try_a_sample: { en: "Go ahead! It's our new mango cake.", vi: "Bạn cứ thử! Bánh xoài mới của bọn mình đấy." },
      ask_about_promo: { en: "It's buy one, get one free on all juices today!", vi: "Hôm nay nước ép mua 1 tặng 1!" },
      self_checkout_help: { en: "No worries, I'll fix that for you.", vi: "Không sao, mình xử lý giúp bạn nhé." },
      return_the_cart: { en: "Thanks for bringing it back!", vi: "Cảm ơn bạn đã trả xe!" }
    } },
  butcher: { id: "butcher", name: "Butcher", role_vi: "Nhân viên quầy thịt", avatar: "🧑‍🍳", voice: "adult_male", room: "market_meat",
    lines: {
      ask_if_fresh: { en: "Yes, it came in this morning.", vi: "Có ạ, cá mới về sáng nay." },
      order_some_pork: { en: "Half a kilo of pork. Anything else?", vi: "Nửa ký thịt heo. Bạn cần gì nữa không?" },
      ask_to_slice: { en: "Sure, I'll slice it nice and thin.", vi: "Được, mình thái thật mỏng cho bạn." },
      buy_fresh_fish: { en: "Great choice. Here's your salmon.", vi: "Chọn chuẩn đấy. Cá hồi của bạn đây." },
      buy_chicken: { en: "Two chicken breasts — here you are.", vi: "Hai miếng ức gà — của bạn đây." }
    } },
  service: { id: "service", name: "Customer Service Agent", role_vi: "Nhân viên dịch vụ khách hàng", avatar: "🙋", voice: "young_female", room: "market_checkout",
    lines: {
      ask_where_rice: { en: "The rice is right next to the meat counter.", vi: "Gạo ở ngay cạnh quầy thịt ạ." },
      return_an_item: { en: "No problem. I'll give you a full refund.", vi: "Không vấn đề gì. Mình hoàn tiền đầy đủ cho bạn." },
      sign_up_membership: { en: "Just fill out this form — it only takes a minute.", vi: "Bạn điền mẫu này nhé — chỉ mất một phút thôi." },
      ask_about_delivery: { en: "Yes, we deliver for free on orders over fifty dollars.", vi: "Có, đơn trên 50 đô được giao miễn phí." },
      ask_store_hours: { en: "We're open until ten tonight.", vi: "Tối nay mở cửa đến 10 giờ." }
    } },
  security: { id: "security", name: "Security Guard", role_vi: "Nhân viên bảo vệ", avatar: "👮", voice: "adult_male", room: "market_checkout",
    lines: {} }
};
function liveState() {
  try { const E = window.ELW; return E && (typeof E.state === "function" ? E.state() : E.state); } catch (e) { return null; }
}
function fill(text, W) {
  if (!/\{/.test(text)) return text;
  const t = totalOf(W || MK_W0);
  return text.replace(/\{total\}/g, money(t)).replace(/\{total_vi\}/g, moneyVi(t));
}
function reply(actionId, Wopt) {
  for (const k of ["cashier", "clerk", "butcher", "service", "security"]) {
    const l = NPCS[k] && NPCS[k].lines[actionId];
    if (l) { const W = Wopt || liveState(); return { who: NPCS[k].name, en: fill(l.en, W), vi: fill(l.vi, W) }; }
  }
  return null;
}

/* ---------- missions (ELW_MISSION.register format) ---------- */
const CASH = { id: "cashier", name: "Cashier", avatar: "🧑‍💼", voice: "young_female" };
const CLERK = { id: "clerk", name: "Shop assistant", avatar: "🧑‍🌾", voice: "young_male" };
const ids = log => (log || []).map(x => x.id);
function story(log, headEn, headVi, parts, thEn, thVi) {
  const did = ids(log), en = [], vi = [];
  parts.forEach(p => { if (did.includes(p[0])) { en.push(p[1]); vi.push(p[2]); } });
  const j = (a, and) => a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " " + and + " " + a[a.length - 1];
  return { en: headEn + (en.length ? " I " + j(en, "and") + "." : ""), vi: headVi + (vi.length ? " Bạn đã " + j(vi, "và") + "." : ""), mom_en: thEn, mom_vi: thVi };
}
const st = (n, icon, ten, tvi, actions, done, next, hen, hvi) => ({ n, icon, title_en: ten, title_vi: tvi, say_en: ten + ".", say_vi: tvi + ".", actions, done, next: typeof next === "function" ? next : () => next, hint: { en: hen, vi: hvi } });
const MISSIONS = [
  { id: "market_weekly_shopping", title_en: "Weekly shopping", title_vi: "Đi chợ cả tuần", room: "market_entrance", topic: "market", urgency: "normal", giver: CASH,
    desc_vi: "Mua đồ cho cả tuần: lấy xe đẩy, tìm sữa, lấy bánh mì và bim bim.",
    request: { en: "Welcome! Carts are by the door.", vi: "Chào mừng bạn! Xe đẩy ở cạnh cửa nhé." },
    steps: [
      st(1, "🛒", "Grab a cart", "Lấy xe đẩy", ["grab_a_cart"], W => W.mk_cart !== "none", "grab_a_cart", "Carts are next to the entrance.", "Xe đẩy ở cạnh lối vào."),
      st(2, "🥛", "Find the milk", "Tìm sữa", ["ask_where_milk", "find_the_milk"], W => W.mk_milk !== "none", "find_the_milk", "Ask: Where is the milk? It's in the dairy fridge.", "Hỏi: Where is the milk? Sữa ở tủ lạnh."),
      st(3, "🍞", "Get some bread", "Lấy bánh mì", ["get_some_bread"], W => W.mk_bread !== "none", "get_some_bread", "Go to the bakery shelf.", "Tới kệ bánh mì."),
      st(4, "🍟", "Grab some chips", "Lấy bim bim", ["grab_some_chips"], W => W.mk_chips !== "none", "grab_some_chips", "Snacks are in the checkout zone.", "Đồ ăn vặt ở khu thu ngân.")
    ],
    result: log => story(log, "My cart is full!", "Xe đẩy đầy đồ rồi!", [["grab_a_cart", "grabbed a cart", "lấy xe đẩy"], ["find_the_milk", "found the milk", "tìm sữa"], ["get_some_bread", "got some bread", "lấy bánh mì"], ["grab_some_chips", "grabbed some chips", "lấy bim bim"]], "Don't forget to pay!", "Đừng quên thanh toán nhé!") },
  { id: "market_buy_fruit", title_en: "Buy fruit", title_vi: "Mua trái cây", room: "market_produce", topic: "market", urgency: "normal", giver: CASH,
    desc_vi: "Mua trái cây: lấy giỏ, xem giảm giá, chọn táo, cân táo và lấy chuối.",
    request: { en: "The fruit is very fresh today!", vi: "Hôm nay trái cây tươi lắm!" },
    steps: [
      st(1, "🧺", "Take a basket", "Lấy giỏ", ["take_a_basket", "grab_a_cart"], W => W.mk_basket === "have" || W.mk_cart !== "none", "take_a_basket", "Baskets are near the door.", "Giỏ ở gần cửa."),
      st(2, "🏷️", "Look for a discount", "Tìm hàng giảm giá", ["look_for_discount"], W => W.mk_sale === "yes", "look_for_discount", "Read the yellow SALE sign.", "Đọc biển SALE màu vàng."),
      st(3, "🍎", "Pick some apples", "Chọn táo", ["pick_some_apples"], W => W.mk_apples !== "none", "pick_some_apples", "Apples are at the fruit stand.", "Táo ở quầy rau quả."),
      st(4, "⚖️", "Weigh the apples", "Cân táo", ["weigh_the_apples"], W => W.mk_apples === "weighed", "weigh_the_apples", "Put the apples on the scale.", "Đặt táo lên cân."),
      st(5, "🍌", "Take some bananas", "Lấy chuối", ["take_some_bananas"], W => W.mk_bananas !== "none", "take_some_bananas", "Bananas are on sale!", "Chuối đang giảm giá!")
    ],
    result: log => story(log, "I bought some fruit!", "Bạn đã mua trái cây!", [["take_a_basket", "took a basket", "lấy giỏ"], ["look_for_discount", "found a discount", "tìm được hàng giảm giá"], ["pick_some_apples", "picked some apples", "chọn táo"], ["weigh_the_apples", "weighed them", "cân táo"], ["take_some_bananas", "took some bananas", "lấy chuối"]], "Fruit is good for you!", "Trái cây tốt cho sức khoẻ!") },
  { id: "market_checkout_pay", title_en: "Checkout and pay", title_vi: "Thanh toán", room: "market_checkout", topic: "market", urgency: "high", giver: CASH,
    desc_vi: "Ra quầy: xếp hàng, xin túi, trả bằng thẻ, nhận hoá đơn và xếp đồ vào túi.",
    request: { en: "Ready to pay? Checkout 1 is open.", vi: "Bạn thanh toán chưa? Quầy số 1 đang mở." },
    steps: [
      st(1, "🚶", "Queue at the checkout", "Xếp hàng thanh toán", ["queue_at_checkout", "put_items_on_counter"], W => W.mk_queue === "yes" || PAID(W), "queue_at_checkout", "Wait in line at Checkout 1.", "Xếp hàng ở quầy số 1."),
      st(2, "🛍️", "Ask for a bag", "Xin túi", ["ask_for_a_bag"], W => W.mk_bag !== "none", "ask_for_a_bag", "Say: Do you have a bag?", "Nói: Do you have a bag?"),
      st(3, "💳", "Tap my card", "Chạm thẻ thanh toán", ["tap_my_card"], PAID, "tap_my_card", "Say: Can I pay by card? Then tap it.", "Nói: Can I pay by card? Rồi chạm thẻ."),
      st(4, "🧾", "Get my receipt", "Nhận hoá đơn", ["get_the_receipt"], W => W.mk_receipt === "yes", "get_the_receipt", "Say: Could I have the receipt, please?", "Nói: Could I have the receipt, please?"),
      st(5, "📦", "Pack the bags", "Xếp đồ vào túi", ["pack_the_bags"], W => W.mk_packed === "yes", "pack_the_bags", "Heavy things first, bread on top.", "Đồ nặng xếp trước, bánh mì để trên.")
    ],
    result: log => story(log, "Shopping done!", "Mua sắm xong rồi!", [["queue_at_checkout", "waited in line", "xếp hàng"], ["ask_for_a_bag", "asked for a bag", "xin túi"], ["tap_my_card", "paid by card", "trả bằng thẻ"], ["get_the_receipt", "got my receipt", "nhận hoá đơn"], ["pack_the_bags", "packed my bags", "xếp đồ vào túi"]], "Have a nice day!", "Chúc một ngày tốt lành!") },
  /* ---- v2 missions ---- */
  { id: "market_party_shopping", title_en: "Party shopping", title_vi: "Mua đồ cho bữa tiệc", room: "market_entrance", topic: "market", urgency: "high", giver: CLERK,
    desc_vi: "Tối nay có tiệc sinh nhật: lấy xe đẩy, mua bánh kem, kem, nước ép và bim bim.",
    request: { en: "Having a party? The cakes are fresh today!", vi: "Có tiệc à? Bánh kem hôm nay mới lắm!" },
    steps: [
      st(1, "🛒", "Grab a cart", "Lấy xe đẩy", ["grab_a_cart"], W => W.mk_cart === "have", "grab_a_cart", "Carts are next to the entrance.", "Xe đẩy ở cạnh lối vào."),
      st(2, "🎂", "Get a birthday cake", "Mua bánh sinh nhật", ["buy_birthday_cake"], W => W.mk_cake !== "none", "buy_birthday_cake", "The cakes are on the bakery shelf.", "Bánh kem ở kệ bánh mì."),
      st(3, "🍨", "Get some ice cream", "Lấy kem", ["get_ice_cream"], W => W.mk_icecream !== "none", "get_ice_cream", "Ice cream is in the freezer.", "Kem ở tủ đông."),
      st(4, "🧃", "Get some juice", "Lấy nước ép", ["get_some_juice"], W => W.mk_juice !== "none", "get_some_juice", "Juice is in the drinks fridge.", "Nước ép ở tủ đồ uống."),
      st(5, "🍟", "Grab some chips", "Lấy bim bim", ["grab_some_chips"], W => W.mk_chips !== "none", "grab_some_chips", "Snacks are by the checkout.", "Đồ ăn vặt ở cạnh quầy thu ngân.")
    ],
    result: log => story(log, "Ready for the party!", "Sẵn sàng cho bữa tiệc!", [["buy_birthday_cake", "got a birthday cake", "mua bánh sinh nhật"], ["get_ice_cream", "picked up some ice cream", "lấy kem"], ["get_some_juice", "grabbed some juice", "lấy nước ép"], ["grab_some_chips", "got some chips", "lấy bim bim"]], "Have a great party!", "Chúc bữa tiệc vui vẻ!") },
  { id: "market_meat_counter", title_en: "At the meat counter", title_vi: "Ở quầy thịt cá", room: "market_meat", topic: "market", urgency: "normal", giver: CLERK,
    desc_vi: "Mua thịt cá cho bữa tối: hỏi cá có tươi không, mua nửa ký thịt, nhờ thái mỏng và mua cá hồi.",
    request: { en: "The butcher's counter is open — just ask!", vi: "Quầy thịt đang mở — cứ hỏi nhé!" },
    steps: [
      st(1, "🧺", "Take a basket", "Lấy giỏ", ["take_a_basket", "grab_a_cart"], W => W.mk_basket === "have" || W.mk_cart === "have", "take_a_basket", "Baskets are near the door.", "Giỏ ở gần cửa."),
      st(2, "🐟", "Ask if it's fresh", "Hỏi có tươi không", ["ask_if_fresh"], W => W.mk_askfresh === "yes", "ask_if_fresh", "Say: Is the fish fresh today?", "Nói: Is the fish fresh today?"),
      st(3, "🥩", "Order some pork", "Mua thịt heo", ["order_some_pork"], W => W.mk_pork !== "none", "order_some_pork", "Say: Could I get half a kilo of pork, please?", "Nói: Could I get half a kilo of pork, please?"),
      st(4, "🔪", "Ask to slice it", "Nhờ thái mỏng", ["ask_to_slice"], W => W.mk_sliced === "yes", "ask_to_slice", "Say: Could you slice it thinly for me?", "Nói: Could you slice it thinly for me?"),
      st(5, "🍣", "Buy some salmon", "Mua cá hồi", ["buy_fresh_fish"], W => W.mk_fish !== "none", "buy_fresh_fish", "Say: I'll have the salmon fillet, please.", "Nói: I'll have the salmon fillet, please.")
    ],
    result: log => story(log, "Dinner is sorted!", "Bữa tối đã đủ đồ!", [["ask_if_fresh", "asked if the fish was fresh", "hỏi cá có tươi không"], ["order_some_pork", "bought half a kilo of pork", "mua nửa ký thịt heo"], ["ask_to_slice", "had it sliced", "nhờ thái mỏng"], ["buy_fresh_fish", "got a salmon fillet", "mua cá hồi"]], "Enjoy your dinner!", "Chúc bữa tối ngon miệng!") },
  { id: "market_self_checkout", title_en: "Use the self-checkout", title_vi: "Tự thanh toán", room: "market_checkout", topic: "market", urgency: "normal", giver: CLERK,
    desc_vi: "Mua nhanh vài món: lấy giỏ, lấy kem đánh răng, mang túi riêng, tự quét và trả tiền ở máy.",
    request: { en: "Only a few things? Try the self-checkout!", vi: "Chỉ vài món à? Thử quầy tự thanh toán nhé!" },
    steps: [
      st(1, "🧺", "Take a basket", "Lấy giỏ", ["take_a_basket", "grab_a_cart"], W => W.mk_basket === "have" || W.mk_cart === "have", "take_a_basket", "Baskets are near the door.", "Giỏ ở gần cửa."),
      st(2, "🪥", "Get some toothpaste", "Lấy kem đánh răng", ["get_toothpaste", "get_shampoo"], W => W.mk_toothpaste !== "none" || W.mk_shampoo !== "none", "get_toothpaste", "Personal care is in the household zone.", "Đồ chăm sóc cá nhân ở khu gia dụng."),
      st(3, "👜", "Use my own bag", "Dùng túi của mình", ["bring_own_bag", "buy_eco_bag"], W => W.mk_bag === "own" || W.mk_bag === "eco", "bring_own_bag", "Say: It's okay, I brought my own bag.", "Nói: It's okay, I brought my own bag."),
      st(4, "📟", "Scan my items", "Tự quét hàng", ["scan_my_items"], W => W.mk_scanned === "yes", "scan_my_items", "Scan every barcode yourself.", "Tự quét mã vạch từng món."),
      st(5, "💳", "Pay at the machine", "Trả tiền ở máy", ["pay_at_self_checkout"], PAID, "pay_at_self_checkout", "Tap your card on the machine.", "Chạm thẻ vào máy.")
    ],
    result: log => story(log, "Quick and easy!", "Nhanh gọn ghê!", [["get_toothpaste", "got some toothpaste", "lấy kem đánh răng"], ["bring_own_bag", "used my own bag", "dùng túi riêng"], ["scan_my_items", "scanned everything myself", "tự quét hàng"], ["pay_at_self_checkout", "paid at the machine", "trả tiền ở máy"]], "Nice — no line at all!", "Tuyệt — chẳng phải xếp hàng!") }
];

/* ---------- Life Challenges (same format as modules/challenge.js CHALLENGES) ---------- */
const T = (id, en, vi, anyOf, len, lvi, o) => Object.assign({ id, title_en: en, title_vi: vi, anyOf, learn_en: len, learn_vi: lvi }, o || {});
const CHALLENGES = [
  { id: "market_weekly_budget", icon: "🛒", title_en: "Weekly Groceries on a Budget", title_vi: "Đi chợ cả tuần tiết kiệm", goal_vi: "Mua gạo, trứng, thịt, rau; săn giảm giá, dùng phiếu giảm giá và thanh toán gọn gàng.", minutes: 12,
    requires: ["go_market_entrance", "get_bag_of_rice", "use_a_coupon"], tasks: [
      T("cart", "Grab a cart", "Lấy xe đẩy", ["grab_a_cart"], "shopping cart", "xe đẩy"),
      T("sale", "Check what's on sale", "Xem hàng giảm giá", ["look_for_discount", "ask_if_on_sale"], "on sale", "đang giảm giá"),
      T("askrice", "Ask where the rice is", "Hỏi gạo ở đâu", ["ask_where_rice"], "Where can I find …?", "… ở đâu?", { free: true }),
      T("rice", "Get a bag of rice", "Lấy bao gạo", ["get_bag_of_rice"], "five-kilo bag", "bao 5 ký"),
      T("eggs", "Get some eggs", "Lấy trứng", ["get_some_eggs"], "a dozen", "một tá"),
      T("check", "Check the eggs", "Kiểm tra trứng", ["check_eggs"], "broken", "vỡ", { free: true }),
      T("veg", "Get some vegetables", "Lấy rau củ", ["get_some_vegetables"], "a head of lettuce", "một cây xà lách"),
      T("meat", "Order some pork", "Mua thịt heo", ["order_some_pork", "buy_chicken"], "half a kilo", "nửa ký"),
      T("compare", "Compare prices", "So sánh giá", ["compare_prices"], "cheaper than", "rẻ hơn", { free: true }),
      T("coupon", "Use a coupon", "Dùng phiếu giảm giá", ["use_a_coupon"], "coupon", "phiếu giảm giá"),
      T("pay", "Pay for everything", "Thanh toán", ["tap_my_card", "pay_with_qr", "pay_cash_market"], "pay by card", "trả bằng thẻ"),
      T("receipt", "Get your receipt", "Nhận hoá đơn", ["get_the_receipt"], "receipt", "hoá đơn"),
      T("pack", "Pack the bags", "Xếp đồ vào túi", ["pack_the_bags"], "groceries", "đồ đi chợ"),
      T("return", "Return the cart", "Trả xe đẩy", ["return_the_cart"], "return", "trả lại")] },
  { id: "market_party", icon: "🎉", title_en: "Party Shopping", title_vi: "Mua đồ cho bữa tiệc", goal_vi: "Mua bánh sinh nhật, kem, nước và đồ ăn vặt cho bữa tiệc tối nay.", minutes: 10,
    requires: ["go_market_entrance", "buy_birthday_cake"], tasks: [
      T("cart", "Grab a cart", "Lấy xe đẩy", ["grab_a_cart"], "cart", "xe đẩy"),
      T("sample", "Try a sample", "Ăn thử", ["try_a_sample"], "sample", "mẫu thử", { free: true }),
      T("promo", "Ask about the promotion", "Hỏi khuyến mãi", ["ask_about_promo"], "buy one, get one free", "mua 1 tặng 1"),
      T("cake", "Get a birthday cake", "Mua bánh sinh nhật", ["buy_birthday_cake"], "birthday cake", "bánh sinh nhật"),
      T("ice", "Get some ice cream", "Lấy kem", ["get_ice_cream"], "dessert", "tráng miệng"),
      T("water", "Get a pack of water", "Lấy lốc nước", ["get_a_pack_of_water"], "six-pack", "lốc 6 chai"),
      T("juice", "Get some juice", "Lấy nước ép", ["get_some_juice"], "juice", "nước ép"),
      T("chips", "Grab some chips", "Lấy bim bim", ["grab_some_chips"], "a bag of chips", "một gói bim bim"),
      T("queue", "Queue at the checkout", "Xếp hàng", ["queue_at_checkout"], "wait in line", "xếp hàng"),
      T("points", "Use your points", "Dùng điểm tích lũy", ["use_loyalty_points"], "points", "điểm"),
      T("pay", "Pay", "Thanh toán", ["tap_my_card", "pay_with_qr", "pay_cash_market"], "QR code", "mã QR"),
      T("bag", "Buy an eco bag", "Mua túi vải", ["buy_eco_bag", "bring_own_bag"], "eco bag", "túi vải"),
      T("pack", "Pack the bags", "Xếp đồ", ["pack_the_bags"], "pack", "xếp đồ"),
      T("leave", "Leave the store", "Ra về", ["leave_the_store"], "Thank you!", "Cảm ơn!")] },
  { id: "market_self_care", icon: "🧴", optional: true, title_en: "Quick Self-Care Run", title_vi: "Ghé mua đồ dùng cá nhân", goal_vi: "Mua đồ gia dụng và đồ cá nhân, tự thanh toán và đăng ký thẻ thành viên.", minutes: 8,
    requires: ["go_market_entrance", "scan_my_items"], tasks: [
      T("basket", "Take a basket", "Lấy giỏ", ["take_a_basket"], "basket", "giỏ"),
      T("shampoo", "Get some shampoo", "Lấy dầu gội", ["get_shampoo"], "shampoo", "dầu gội"),
      T("paste", "Get some toothpaste", "Lấy kem đánh răng", ["get_toothpaste"], "I'm out of …", "hết …"),
      T("reach", "Ask for help reaching", "Nhờ lấy đồ trên cao", ["ask_help_reach"], "reach", "với tới", { free: true }),
      T("tissues", "Get some tissues", "Lấy khăn giấy", ["get_tissues"], "tissues", "khăn giấy"),
      T("det", "Get some detergent", "Lấy nước giặt", ["get_detergent"], "detergent", "nước giặt"),
      T("bag", "Use your own bag", "Dùng túi của mình", ["bring_own_bag"], "my own bag", "túi của tôi"),
      T("scan", "Scan your items", "Tự quét hàng", ["scan_my_items"], "scan", "quét"),
      T("help", "Ask for help at the machine", "Nhờ giúp ở máy", ["self_checkout_help"], "Could you help?", "Bạn giúp được không?", { free: true }),
      T("pay", "Pay at the machine", "Trả tiền ở máy", ["pay_at_self_checkout"], "machine", "máy"),
      T("member", "Sign up for a loyalty card", "Đăng ký thẻ thành viên", ["sign_up_membership"], "sign up", "đăng ký")] }
];

/* ---------- register ---------- */
const NEW_ROOMS = { market_checkout };
if (typeof window !== "undefined") {
  window.ELW_ROOMS = Object.assign(window.ELW_ROOMS || {}, NEW_ROOMS);
  window.ELW_MARKET = { topic: "market", rooms: ["market_checkout"], missions: MISSIONS, challenges: CHALLENGES, reply, npcs: NPCS, room: market_checkout, total: totalOf };
  window.ELW_MARKET_SHARED = { MK_W0, MKV, mkAct, mkA, objG, mirrorState, cat, D, once, at, takePre, takeProducePre, take, ENTRANCE_OBJS, PRODUCE_OBJS, DAIRY_OBJS, MEAT_OBJS, CHECKOUT_OBJS, allObjects: marketObjectsAll, allActions: marketActions, NPCS, reply, MISSIONS, CHALLENGES, totalOf, money, moneyVi, fill, MK_PROPS, marketCss };
}
if (typeof module !== "undefined" && module.exports) module.exports = { ELW_MARKET_ROOMS: NEW_ROOMS, missions: MISSIONS, challenges: CHALLENGES, reply, npcs: NPCS, total: totalOf };
})();
