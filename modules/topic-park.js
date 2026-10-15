/* English Life World — Topic "Công viên / At the park" (room id "park", prefix pk_)
   Browser script, load AFTER rooms2.js / details.js. Same room format as topic-cafe.js:
     window.ELW_ROOMS = Object.assign(window.ELW_ROOMS || {}, { park })
   Also exposes window.ELW_PARK = { topic, rooms, missions, challenges, reply, npcs, room }. */
(function () {
"use strict";

const go = spot => ["walk", spot];
const set = (k, v) => ["set", k, v];
const pose = (p, ms) => ["pose", p, ms || 650];

const mkAct = (V) => (id, obj, label, labelVi, sentence, vi, key, vk, grammar, chunks, disc, patterns, pre, seq, story, sitOk, doneFn) => {
  const vocab = vk.map(k => {
    if (!V[k]) throw new Error("vocab " + k + " in " + id);
    return [V[k][0], V[k][1], V[k][2]];
  });
  const words = vk.map(k => {
    const e = V[k];
    return [e[0], e[1], e[3] || "n", e[2]];
  });
  return {
    id, obj, room: "park", label, labelVi, sentence, vi, key,
    vocab, words,
    grammar, chunks, disc: { ans: disc[0], opts: disc.slice() }, patterns,
    pre, seq, sitOk: !!sitOk, story,
    done: doneFn || (W => false)
  };
};

/* Quick builder for expanded actions with automatic state-based pre/seq/done */
const qAct = (V, pkA) => (id, obj, spot, pz, stateKey, targetVal, label, labelVi, sentence, vi, key, vk, grammar, chunks, disc, patterns, story, sitOk) =>
  pkA(
    id, obj, label, labelVi, sentence, vi, key, vk, grammar, chunks, disc, patterns,
    W => W[stateKey] === targetVal ? `Bạn đã ${labelVi.toLowerCase()} rồi.` : null,
    W => [...(sitOk ? [] : (W.sitting ? [["stand"]] : [])), go(spot), pose(pz, 700), set(stateKey, targetVal), pose("idle", 1)],
    story, sitOk,
    W => W[stateKey] === targetVal
  );

const objG = (id, en, vi, base, tagX, tagY, inner, extra) =>
  `<g class="obj" id="o-${id}" data-obj="${id}" data-base="${base}" tabindex="0" aria-label="${en}, ${vi}"${extra || ""}><g class="vec">${inner}</g><text class="tag" x="${tagX}" y="${tagY}" text-anchor="middle">${en} · ${vi}</text></g>`;
const mirrorState = (W, W0, root) => { for (const k of Object.keys(W0)) root.setAttribute("data-" + k, String(W[k])); };
const cat = (prefix, rows) => rows.map(([en, ipa, vi, category]) => ({ id: prefix + en.toLowerCase().replace(/[^a-z]+/g, "_").replace(/^_|_$/g, ""), en, vi, ipa, category }));

/* ---------- vocabulary [word, ipa, vi, pos] ---------- */
const PKV = {
  park: ["park", "/pɑːk/", "công viên", "n"],
  map: ["map", "/mæp/", "bản đồ", "n"],
  entrance: ["entrance", "/ˈen.trəns/", "lối vào, cổng vào", "n"],
  jog: ["go for a jog", "/ɡoʊ fər ə dʒɑɡ/", "đi chạy bộ", "phr"],
  path: ["path", "/pɑːθ/", "lối đi bộ", "n"],
  freshair: ["fresh air", "/freʃ err/", "không khí trong lành", "n"],
  leash: ["leash", "/liːʃ/", "dây dắt chó", "n"],
  puton: ["put on", "/pʊt ɑn/", "đeo vào, mặc vào", "phr"],
  holdstill: ["hold still", "/hoʊld stɪl/", "đứng yên nào", "phr"],
  walkdog: ["walk the dog", "/wɔːk ðə dɑɡ/", "dắt chó đi dạo", "phr"],
  takewalk: ["take … for a walk", "/teɪk fər ə wɔːk/", "dắt … đi dạo", "phr"],
  fetch: ["fetch", "/fetʃ/", "chạy đi nhặt về", "v"],
  ball: ["ball", "/bɔːl/", "quả bóng", "n"],
  goodboy: ["Good boy!", "/ɡʊd bɔɪ/", "Ngoan lắm! (khen chó)", "phr"],
  pet: ["pet", "/pet/", "vuốt ve, thú cưng", "v"],
  puppy: ["puppy", "/ˈpʌp.i/", "chú chó con", "n"],
  cute: ["cute", "/kjuːt/", "dễ thương", "adj"],
  feed: ["feed", "/fiːd/", "cho ăn", "v"],
  duck: ["duck", "/dʌk/", "con vịt", "n"],
  crumb: ["bread crumbs", "/ˈbred krʌmz/", "vụn bánh mì", "n"],
  pond: ["pond", "/pɑnd/", "hồ nhỏ, ao", "n"],
  duckling: ["duckling", "/ˈdʌk.lɪŋ/", "vịt con", "n"],
  swim: ["swim", "/swɪm/", "bơi", "v"],
  inarow: ["in a row", "/ɪn ə roʊ/", "thành một hàng", "phr"],
  rent: ["rent", "/rent/", "thuê", "v"],
  unlock: ["unlock", "/ʌnˈlɑk/", "mở khoá", "v"],
  bicycle: ["bicycle", "/ˈbaɪ.sɪ.kəl/", "xe đạp", "n"],
  ride: ["ride a bike", "/raɪd ə baɪk/", "đạp xe", "phr"],
  helmet: ["helmet", "/ˈhel.mət/", "mũ bảo hiểm", "n"],
  around: ["around", "/əˈraʊnd/", "vòng quanh", "prep"],
  bench: ["bench", "/bentʃ/", "ghế dài, ghế đá", "n"],
  shady: ["shady", "/ˈʃeɪ.di/", "râm mát, có bóng râm", "adj"],
  relax: ["relax", "/rɪˈlæks/", "thư giãn", "v"],
  read: ["read", "/riːd/", "đọc", "v"],
  shade: ["in the shade", "/ɪn ðə ʃeɪd/", "dưới bóng mát", "phr"],
  tree: ["tree", "/triː/", "cái cây", "n"],
  swing: ["swing", "/swɪŋ/", "xích đu; đung đưa", "n"],
  high: ["high", "/haɪ/", "cao", "adv"],
  air: ["in the air", "/ɪn ði err/", "trên không", "phr"],
  smell: ["smell", "/smel/", "ngửi; có mùi", "v"],
  flower: ["flower", "/ˈflaʊ.ər/", "bông hoa", "n"],
  bloom: ["blooming", "/ˈbluː.mɪŋ/", "đang nở rộ", "adj"],
  photo: ["take a picture", "/teɪk ə ˈpɪk.tʃər/", "chụp một bức ảnh", "phr"],
  couldyou: ["Could you …?", "/kʊd juː/", "Bạn có thể … giúp tôi không?", "phr"],
  flavor: ["flavor", "/ˈfleɪ.vər/", "hương vị", "n"],
  icecream: ["ice cream", "/ˈaɪs kriːm/", "kem", "n"],
  vendor: ["vendor", "/ˈven.dər/", "người bán hàng rong", "n"],
  scoop: ["scoop", "/skuːp/", "muỗng/viên kem", "n"],
  vanilla: ["vanilla", "/vəˈnɪl.ə/", "vị va-ni", "n"],
  cone: ["cone", "/koʊn/", "bánh ốc quế", "n"],
  refreshing: ["refreshing", "/rɪˈfreʃ.ɪŋ/", "mát lạnh, sảng khoái", "adj"],
  cold: ["cold", "/koʊld/", "lạnh", "adj"],
  eat: ["eat", "/iːt/", "ăn", "v"],
  sip: ["take a sip", "/teɪk ə sɪp/", "uống một ngụm", "phr"],
  fountain: ["drinking fountain", "/ˈdrɪŋ.kɪŋ ˈfaʊn.tɪn/", "vòi nước uống công cộng", "n"],
  water: ["water", "/ˈwɔː.tər/", "nước", "n"],
  wrapper: ["wrapper", "/ˈræp.ər/", "giấy gói, vỏ bọc", "n"],
  trash: ["trash", "/træʃ/", "rác", "n"],
  bin: ["recycling bin", "/riːˈsaɪ.klɪŋ bɪn/", "thùng rác tái chế", "n"],
  /* Expanded vocabulary for 85 new park actions */
  close: ["close", "/kloʊz/", "đóng cửa", "v"],
  evening: ["evening", "/ˈiːv.nɪŋ/", "buổi tối", "n"],
  sign: ["sign", "/saɪn/", "biển báo", "n"],
  rule: ["rule", "/ruːl/", "nội quy, quy định", "n"],
  restroom: ["public restroom", "/ˈpʌb.lɪk ˈrest.ruːm/", "nhà vệ sinh công cộng", "n"],
  nearest: ["nearest", "/ˈnɪr.rɪst/", "gần nhất", "adj"],
  forecast: ["forecast", "/ˈfɔː.kɑːst/", "dự báo thời tiết", "n"],
  breezy: ["breezy", "/ˈbriː.zi/", "có gió mát, lộng gió", "adj"],
  mild: ["mild", "/maɪld/", "dịu mát, ôn hoà", "adj"],
  sunscreen: ["sunscreen", "/ˈsʌn.skriːn/", "kem chống nắng", "n"],
  uvrays: ["UV index", "/ˌjuːˈviː ˈɪn.deks/", "chỉ số tia cực tím", "n"],
  pant: ["pant", "/pænt/", "thở hổn hển", "v"],
  heat: ["heat", "/hiːt/", "cái nóng", "n"],
  treat: ["dog treat", "/dɑɡ triːt/", "bánh thưởng cho chó", "n"],
  crunchy: ["crunchy", "/ˈkrʌn.tʃi/", "giòn rụm", "adj"],
  breed: ["breed", "/briːd/", "giống (chó, mèo)", "n"],
  shiny: ["shiny", "/ˈʃaɪ.ni/", "bóng mượt", "adj"],
  brush: ["brush", "/brʌʃ/", "chải", "v"],
  fur: ["fur", "/fɜːr/", "bộ lông thú", "n"],
  turtle: ["turtle", "/ˈtɜː.təl/", "con rùa", "n"],
  sunbathe: ["sunbathe", "/ˈsʌn.beɪð/", "tắm nắng", "v"],
  koifish: ["koi fish", "/ˈkɔɪ fɪʃ/", "cá chép Nhật (koi)", "n"],
  lilypad: ["lily pad", "/ˈlɪl.i pæd/", "lá súng, lá sen", "n"],
  frog: ["frog", "/frɑɡ/", "con ếch", "n"],
  croak: ["croak", "/kroʊk/", "kêu ộp ộp", "v"],
  oats: ["oats", "/oʊts/", "yến mạch", "n"],
  wild: ["wild", "/waɪld/", "hoang dã", "adj"],
  strapon: ["strap on", "/stræp ɑn/", "cài quai đeo", "phr"],
  protective: ["protective", "/prəˈtek.tɪv/", "bảo hộ, bảo vệ", "adj"],
  tire: ["tire", "/taɪrr/", "lốp xe", "n"],
  inflate: ["inflated", "/ɪnˈfleɪ.tɪd/", "được bơm căng", "adj"],
  saddle: ["saddle", "/ˈsæd.əl/", "yên xe đạp", "n"],
  raise: ["raise", "/reɪz/", "nâng cao lên", "v"],
  dock: ["rental dock", "/ˈren.təl dɑk/", "trạm khoá xe", "n"],
  share: ["share", "/ʃerr/", "ngồi chung, chia sẻ", "v"],
  shoelace: ["shoelace", "/ˈʃuː.leɪs/", "dây giày", "n"],
  untied: ["untied", "/ʌnˈtaɪd/", "bị tuột dây", "adj"],
  podcast: ["podcast", "/ˈpɑd.kɑːst/", "chương trình âm thanh", "n"],
  sore: ["sore", "/sɔːr/", "mỏi, đau nhức", "adj"],
  chain: ["chain", "/tʃeɪn/", "dây xích", "n"],
  push: ["push", "/pʊʃ/", "đẩy", "n"],
  gentle: ["gentle", "/ˈdʒen.təl/", "nhẹ nhàng", "adj"],
  taketurns: ["take turns", "/teɪk tɜːnz/", "thay phiên nhau", "phr"],
  sturdy: ["sturdy", "/ˈstɜː.di/", "chắc chắn, vững vàng", "adj"],
  drag: ["drag", "/dræɡ/", "kéo lê, rà chân", "v"],
  slowdown: ["slow down", "/sloʊ daʊn/", "giảm tốc, chậm lại", "phr"],
  butterfly: ["butterfly", "/ˈbʌt.ə.flaɪ/", "con bướm", "n"],
  delicate: ["delicate", "/ˈdel.ɪ.kət/", "mỏng manh, thanh nhã", "adj"],
  fragrant: ["fragrant", "/ˈfreɪ.ɡrənt/", "thơm ngát", "adj"],
  lavender: ["lavender", "/ˈlæv.ɪn.dər/", "hoa oải hương", "n"],
  pollen: ["pollen", "/ˈpɑl.ən/", "phấn hoa", "n"],
  hayfever: ["hay fever", "/ˈheɪ ˌfiː.vər/", "dị ứng phấn hoa", "n"],
  rose: ["rose", "/roʊz/", "hoa hồng", "n"],
  fullbloom: ["in full bloom", "/ɪn fʊl bluːm/", "nở rộ đẹp nhất", "phr"],
  wafflecone: ["waffle cone", "/ˈwɑf.əl koʊn/", "bánh ốc quế giòn", "n"],
  sorbet: ["sorbet", "/ˈsɔː.beɪ/", "kem trái cây không sữa", "n"],
  strawberry: ["strawberry", "/ˈstrɔː.bər.i/", "dâu tây", "n"],
  melt: ["melt", "/melt/", "tan chảy", "v"],
  napkin: ["napkin", "/ˈnæp.kɪn/", "khăn giấy", "n"],
  cash: ["cash", "/kæʃ/", "tiền mặt", "n"],
  change: ["keep the change", "/kiːp ðə tʃeɪndʒ/", "giữ lại tiền thừa", "phr"],
  refill: ["refill", "/ˌriːˈfɪl/", "lấy thêm đầy nước", "v"],
  hydrated: ["stay hydrated", "/steɪ ˈhaɪ.dreɪ.tɪd/", "đủ nước cho cơ thể", "phr"],
  sticky: ["sticky", "/ˈstɪk.i/", "dính nhớp", "adj"],
  rinse: ["rinse off", "/rɪns ɑf/", "rửa sạch bằng nước", "phr"],
  splash: ["splash", "/splæʃ/", "vỗ nước, té nước", "v"],
  cooldown: ["cool down", "/kuːl daʊn/", "hạ nhiệt, làm mát", "phr"],
  button: ["button", "/ˈbʌt.ən/", "nút bấm", "n"],
  plastic: ["plastic bottle", "/ˈplæs.tɪk ˈbɑt.əl/", "chai nhựa", "n"],
  slot: ["slot", "/slɑt/", "khe bỏ rác", "n"],
  litter: ["litter", "/ˈlɪt.ər/", "rác xả bừa bãi", "n"],
  pickup: ["pick up", "/pɪk ʌp/", "nhặt lên", "phr"],
  wastebag: ["waste bag", "/weɪst bæɡ/", "túi đựng chất thải", "n"],
  cardboard: ["cardboard", "/ˈkɑːd.bɔːd/", "bìa cứng, hộp giấy", "n"],
  checkered: ["checkered", "/ˈtʃek.əd/", "kẻ ca-rô", "adj"],
  blanket: ["picnic blanket", "/ˈpɪk.nɪk ˈblæŋ.kɪt/", "thảm dã ngoại", "n"],
  basket: ["picnic basket", "/ˈpɪk.nɪk ˈbɑː.skɪt/", "giỏ đồ dã ngoại", "n"],
  crisp: ["crisp", "/krɪsp/", "giòn ngọt", "adj"],
  cloud: ["cloud", "/klaʊd/", "đám mây", "n"],
  shakeoff: ["shake off", "/ʃeɪk ɑf/", "giũ sạch", "phr"],
  drizzle: ["drizzle", "/ˈdrɪz.əl/", "mưa phùn nhẹ", "v"],
  shelter: ["take shelter", "/teɪk ˈʃel.tər/", "trú mưa, trú nắng", "phr"],
  gazebo: ["gazebo", "/ɡəˈziː.boʊ/", "chòi nghỉ mát", "n"],
  yoga: ["yoga", "/ˈjoʊ.ɡə/", "tập yoga", "n"],
  stretch: ["stretch", "/stretʃ/", "kéo giãn cơ", "v"],
  panoramic: ["panoramic", "/ˌpæn.əˈræm.ɪk/", "toàn cảnh", "adj"],
  humid: ["humid", "/ˈhjuː.mɪd/", "ẩm ướt, oi bức", "adj"],
  sketch: ["sketch", "/sketʃ/", "vẽ phác hoạ", "v"],
  scenery: ["scenery", "/ˈsiː.nər.i/", "phong cảnh", "n"],
  handrail: ["handrail", "/ˈhænd.reɪl/", "tay vịn cầu thang", "n"],
  ladder: ["ladder", "/ˈlæd.ər/", "thang trèo", "n"],
  slide: ["slide", "/slaɪd/", "cầu trượt; trượt xuống", "n"],
  smooth: ["smooth", "/smuːð/", "trơn láng, mượt", "adj"],
  dew: ["morning dew", "/ˈmɔː.nɪŋ djuː/", "sương sớm", "n"],
  wipe: ["wipe", "/waɪp/", "lau khô", "v"],
  hamstring: ["hamstring", "/ˈhæm.strɪŋ/", "cơ gân kheo chân", "n"],
  pullup: ["pull-up", "/ˈpʊl.ʌp/", "động tác hít xà đơn", "n"],
  strength: ["strength", "/streŋθ/", "sức mạnh cơ bắp", "n"],
  pushup: ["push-up", "/ˈpʊʃ.ʌp/", "động tác chống đẩy", "n"],
  heartrate: ["heart rate", "/ˈhɑːt reɪt/", "nhịp tim", "n"],
  energized: ["energized", "/ˈen.ə.dʒaɪzd/", "tràn đầy năng lượng", "adj"],
  exhale: ["exhale", "/eksˈheɪl/", "thở ra", "v"],
  sparrow: ["sparrow", "/ˈspær.oʊ/", "chim sẻ", "n"],
  chirp: ["chirp", "/tʃɜːp/", "hót líu lo", "v"],
  feeder: ["bird feeder", "/ˈbɜːd ˌfiː.dər/", "khay cho chim ăn", "n"],
  sunflower: ["sunflower seed", "/ˈsʌn.flaʊ.ər siːd/", "hạt hướng dương", "n"],
  birdhouse: ["birdhouse", "/ˈbɜːd.haʊs/", "nhà chim gỗ", "n"],
  branch: ["branch", "/brɑːntʃ/", "cành cây", "n"],
  robin: ["robin", "/ˈrɑb.ɪn/", "chim cổ đỏ", "n"],
  plaque: ["plaque", "/plæk/", "tấm biển đồng khắc chữ", "n"],
  statue: ["statue", "/ˈstætʃ.uː/", "bức tượng", "n"],
  monument: ["monument", "/ˈmɑn.jə.mənt/", "đài tưởng niệm", "n"],
  carving: ["carving", "/ˈkɑː.vɪŋ/", "nét chạm khắc", "n"],
  pedestal: ["pedestal", "/ˈped.ɪ.stəl/", "bệ tượng bằng đá", "n"],
  bridge: ["wooden bridge", "/ˈwʊd.ən brɪdʒ/", "cây cầu gỗ", "n"],
  railing: ["railing", "/ˈreɪ.lɪŋ/", "lan can cầu", "n"],
  ripple: ["ripple", "/ˈrɪp.əl/", "gợn sóng lăn tăn", "v"],
  breeze: ["breeze", "/briːz/", "làn gió nhẹ", "n"],
  reflection: ["reflection", "/rɪˈflek.ʃən/", "bóng phản chiếu", "n"],
  selfie: ["selfie", "/ˈsel.fi/", "ảnh chụp tự sướng", "n"],
  kite: ["kite", "/kaɪt/", "con diều", "n"],
  string: ["string", "/strɪŋ/", "dây diều", "n"],
  soar: ["soar", "/sɔːr/", "bay vút lên cao", "v"],
  spool: ["spool", "/spuːl/", "cuộn dây diều", "n"],
  frisbee: ["frisbee", "/ˈfrɪz.bi/", "đĩa bay ném bắt", "n"],
  chess: ["chess", "/tʃes/", "cờ vua", "n"],
  knight: ["knight", "/naɪt/", "quân mã (cờ vua)", "n"],
  checkmate: ["checkmate", "/ˈtʃek.meɪt/", "chiếu tướng hết cờ", "n"],
  solar: ["solar panel", "/ˈsoʊ.lər ˈpæn.əl/", "tấm pin mặt trời", "n"],
  lamppost: ["lamppost", "/ˈlæmp.poʊst/", "cột đèn đường", "n"],
  dusk: ["dusk", "/dʌsk/", "lúc hoàng hôn chạng vạng", "n"]
};
const pkA = mkAct(PKV);
const pkQ = qAct(PKV, pkA);

const standIfSit = W => W.sitting ? [["stand"]] : [];

const parkActions = [
  /* ==================== ORIGINAL 20 ACTIONS (id & obj preserved) ==================== */
  pkA("enter_the_park", "parkgate", "Check the park map", "Xem bản đồ công viên", "Let's check the park map at the entrance.", "Hãy xem bản đồ công viên ở ngay cổng vào nhé.", ["check", "map", "entrance"], ["park", "map", "entrance"],
    "<b>Let's</b> + động từ nguyên mẫu = Hãy cùng … <b>at the entrance</b> = ở cổng vào.", ["Let's check the park map", "at the entrance."], ["map", "mat", "cap"],
    ["Let's check <b>the trail map</b>.", "Meet me <b>at the entrance</b>."],
    W => W.pk_map === "read" ? "Bạn đã xem bản đồ công viên rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_door"], ["pose", "read", 1100], ["set", "pk_map", "read"], ["pose", "idle", 1]],
    ["check the park map", "check the park map at the entrance", "xem bản đồ công viên"], false, W => W.pk_map === "read"),

  pkA("jog_around_park", "parkgate", "Go for a jog", "Chạy bộ quanh công viên", "I'm going for a jog along the park path.", "Tôi đang chạy bộ dọc theo lối đi trong công viên.", ["going", "jog", "path"], ["jog", "path", "freshair"],
    "<b>go for a jog / a walk / a run</b> = đi chạy bộ / đi dạo. <b>along the path</b> = dọc theo lối đi.", ["I'm going for a jog", "along the park path."], ["jog", "dog", "log"],
    ["I'm going for <b>a morning walk</b>.", "I'm running <b>along the river</b>."],
    W => W.pk_jog === "yes" ? "Bạn vừa chạy bộ xong rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_door"], ["walk", "pk_pond"], ["walk", "pk_bench"], ["set", "pk_jog", "yes"], ["pose", "idle", 1]],
    ["go for a jog", "go for a jog along the park path", "chạy bộ quanh công viên"], false, W => W.pk_jog === "yes"),

  pkA("put_on_leash", "puppy", "Put on the leash", "Đeo dây dắt cho chó", "Hold still, buddy! I'm putting on your leash.", "Đứng yên nào bạn nhỏ! Tôi đang đeo dây dắt cho bạn đây.", ["putting", "on", "leash"], ["leash", "puton", "holdstill"],
    "Cụm động từ <b>put on</b> = đeo vào / mặc vào. <b>Hold still!</b> = Đứng yên nào!", ["Hold still, buddy!", "I'm putting on your leash."], ["leash", "leaf", "least"],
    ["I'm putting on <b>my shoes</b>.", "I'm putting on <b>a helmet</b>."],
    W => W.pk_leash === "on" ? "Chú chó đã được đeo dây dắt rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_dog"], ["pose", "bend", 700], ["set", "pk_leash", "on"], ["pose", "idle", 1]],
    ["put on the leash", "put the leash on my puppy", "đeo dây dắt cho chú chó"], false, W => W.pk_leash === "on"),

  pkA("walk_the_dog", "puppy", "Walk the dog", "Dắt chó đi dạo", "I'm taking my dog for a walk in the park.", "Tôi đang dắt chú chó của mình đi dạo trong công viên.", ["taking", "dog", "walk"], ["walkdog", "takewalk", "park"],
    "Hai cách nói tự nhiên: <b>walk the dog</b> hoặc <b>take my dog for a walk</b>.", ["I'm taking my dog", "for a walk in the park."], ["walk", "work", "woke"],
    ["I <b>walk my dog</b> every morning.", "Let's take the puppy <b>for a walk</b>."],
    W => W.pk_walked === "yes" ? "Bạn đã dắt chó đi dạo rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_dog"], ["set", "pk_leash", "on"], ["pose", "reach", 400], ["walk", "pk_flowers"], ["walk", "pk_dog"], ["set", "pk_walked", "yes"], ["pose", "idle", 1]],
    ["walk the dog", "take my dog for a walk in the park", "dắt chó đi dạo"], false, W => W.pk_walked === "yes"),

  pkA("throw_the_ball", "puppy", "Play fetch with the dog", "Ném bóng cho chó bắt", "Go fetch the ball! Good boy!", "Chạy đi nhặt bóng nào! Ngoan lắm!", ["fetch", "ball", "Good"], ["fetch", "ball", "goodboy"],
    "<b>play fetch</b> = chơi trò ném đồ cho chó nhặt về. Khen chú chó: <b>Good boy!</b> / <b>Good girl!</b>", ["Go fetch the ball!", "Good boy!"], ["fetch", "catch", "match"],
    ["Let's <b>play fetch</b> in the grass.", "<b>Throw the ball</b> to me!"],
    W => W.pk_fetch === "yes" ? "Bạn vừa chơi ném bóng với chú chó rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_dog"], ["spawn", "pk_ballP"], ["pose", "point", 600], ["despawn"], ["set", "pk_fetch", "yes"], ["set", "pk_doghappy", "yes"], ["pose", "idle", 1]],
    ["play fetch with the dog", "throw a tennis ball for my dog", "ném bóng cho chó bắt"], false, W => W.pk_fetch === "yes"),

  pkA("pet_the_puppy", "puppy", "Pet the puppy", "Vuốt ve chú chó", "Who's a good boy? You're so cute!", "Ai ngoan thế nhỉ? Cưng quá đi!", ["good", "boy", "cute"], ["pet", "puppy", "cute"],
    "<b>pet</b> vừa là danh từ (thú cưng) vừa là động từ (vuốt ve): Can I <b>pet</b> your dog?", ["Who's a good boy?", "You're so cute!"], ["cute", "cut", "coat"],
    ["Can I <b>pet your dog</b>?", "The puppy is <b>so friendly</b>!"],
    W => W.pk_pet === "yes" ? "Bạn vừa vuốt ve chú chó rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_dog"], ["pose", "pet", 900], ["set", "pk_pet", "yes"], ["set", "pk_doghappy", "yes"], ["pose", "idle", 1]],
    ["pet the puppy", "gently pet the happy puppy", "vuốt ve chú chó"], false, W => W.pk_pet === "yes"),

  pkA("feed_the_ducks", "duckpond", "Feed the ducks", "Cho vịt ăn", "I'm feeding some bread crumbs to the ducks.", "Tôi đang cho mấy chú vịt ăn vụn bánh mì.", ["feeding", "bread", "ducks"], ["feed", "duck", "crumb", "pond"],
    "<b>feed A to B</b> hoặc <b>feed B (some) A</b>: I'm feeding the ducks / feeding bread crumbs <b>to</b> the ducks.", ["I'm feeding some bread crumbs", "to the ducks."], ["duck", "dark", "luck"],
    ["Don't <b>feed the wild animals</b>.", "I'm feeding <b>the fish in the pond</b>."],
    W => W.pk_ducks === "fed" ? "Mấy chú vịt đã ăn no rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_pond"], ["spawn", "pk_crumbsP"], ["pose", "pour", 900], ["despawn"], ["set", "pk_ducks", "fed"], ["pose", "idle", 1]],
    ["feed the ducks", "feed some bread crumbs to the ducks in the pond", "cho vịt ăn bên hồ"], false, W => W.pk_ducks === "fed"),

  pkA("watch_the_ducks", "duckpond", "Watch the ducks swim", "Ngắm vịt bơi", "Look! The little ducklings are swimming in a row.", "Nhìn kìa! Mấy chú vịt con đang bơi nối đuôi nhau thành hàng.", ["ducklings", "swimming", "row"], ["duckling", "swim", "inarow"],
    "swim → swim<b>m</b>ing (gấp đôi m). <b>in a row</b> = thành một hàng nối tiếp nhau.", ["Look! The little ducklings", "are swimming in a row."], ["row", "low", "raw"],
    ["The ducks are <b>swimming across the pond</b>.", "Three benches <b>in a row</b>."],
    W => W.pk_watchducks === "yes" ? "Bạn đã ngắm đàn vịt bơi rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_pond"], ["pose", "point", 800], ["set", "pk_watchducks", "yes"], ["pose", "idle", 1]],
    ["watch the ducks swim", "watch the cute ducklings swimming in the pond", "ngắm đàn vịt bơi"], false, W => W.pk_watchducks === "yes"),

  pkA("unlock_a_bike", "bikestand", "Rent a bicycle", "Thuê xe đạp", "I'm unlocking a bicycle at the rental stand.", "Tôi đang mở khoá một chiếc xe đạp ở trạm thuê xe.", ["unlocking", "bicycle", "rental"], ["rent", "unlock", "bicycle"],
    "Tiền tố <b>un-</b> mang nghĩa ngược lại: lock (khoá) → <b>unlock</b> (mở khoá).", ["I'm unlocking a bicycle", "at the rental stand."], ["bike", "back", "bake"],
    ["How much is it to <b>rent a bike</b>?", "Let's <b>rent two bicycles</b> for an hour."],
    W => W.pk_bike !== "locked" ? "Bạn đã mở khoá xe đạp rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_bike"], ["pose", "reach", 650], ["set", "pk_bike", "unlocked"], ["pose", "idle", 1]],
    ["rent a bicycle", "unlock a bicycle at the rental stand", "thuê một chiếc xe đạp"], false, W => W.pk_bike === "unlocked" || W.pk_bike === "ridden"),

  pkA("ride_a_bike", "bikestand", "Ride a bike", "Đạp xe dạo công viên", "I'm riding a bike around the park.", "Tôi đang đạp xe vòng quanh công viên.", ["riding", "bike", "around"], ["ride", "helmet", "around"],
    "ride → rid<b>ing</b> (bỏ e thêm ing). Nhớ dùng <b>ride a bike / a bicycle</b>.", ["I'm riding a bike", "around the park."], ["ride", "right", "wide"],
    ["I love <b>riding my bike</b> on weekends.", "Always wear <b>a helmet</b> when you ride."],
    W => W.pk_bike === "ridden" ? "Bạn đã đạp xe quanh công viên rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_bike"], ["set", "pk_bike", "unlocked"], ["pose", "reach", 500], ["walk", "pk_pond"], ["walk", "pk_bike"], ["set", "pk_bike", "ridden"], ["pose", "idle", 1]],
    ["ride a bike", "ride a bicycle around the shady park", "đạp xe vòng quanh công viên"], false, W => W.pk_bike === "ridden"),

  pkA("sit_on_bench", "parkbench", "Sit on the bench", "Ngồi ghế đá", "Let's sit on this shady bench and relax.", "Mình ngồi xuống chiếc ghế đá râm mát này nghỉ ngơi nhé.", ["sit", "shady", "bench"], ["bench", "shady", "relax"],
    "<b>sit on a bench</b> = ngồi trên ghế dài/ghế đá. <b>shady</b> = có bóng râm mát mẻ (từ danh từ shade).", ["Let's sit on this shady bench", "and relax."], ["bench", "beach", "bunch"],
    ["Is this <b>bench</b> free?", "Let's sit <b>in the shade</b>."],
    W => W.pk_seat === "bench" && W.sitting ? "Bạn đang ngồi trên ghế đá rồi." : null,
    W => [["walk", "pk_bench"], ["set", "pk_seat", "bench"], ["sit"], ["wait", 350]],
    ["sit on the bench", "sit down on a shady park bench", "ngồi nghỉ trên ghế đá"], false, W => W.pk_seat === "bench"),

  pkA("read_on_bench", "parkbench", "Read a book in the shade", "Đọc sách dưới bóng mát", "I'm reading my favorite book under the tree.", "Tôi đang đọc cuốn sách yêu thích dưới bóng cây.", ["reading", "book", "tree"], ["read", "shade", "tree"],
    "<b>under the tree</b> = dưới tán cây; <b>in the shade</b> = trong bóng râm.", ["I'm reading my favorite book", "under the tree."], ["shade", "shake", "shape"],
    ["It's nice and cool <b>under the tree</b>.", "I like <b>reading</b> in the park."],
    W => W.pk_read === "yes" ? "Bạn vừa đọc sách trên ghế đá rồi." : null,
    W => [...(W.sitting && W.pk_seat === "bench" ? [] : [["walk", "pk_bench"], ["set", "pk_seat", "bench"], ["sit"]]), ["pose", "read", 1100], ["set", "pk_read", "yes"], ["pose", "idle", 1]],
    ["read a book in the shade", "read a book on the bench under the tree", "đọc sách dưới bóng cây"], true, W => W.pk_read === "yes"),

  pkA("sit_on_swing", "swing", "Swing on the swings", "Chơi xích đu", "I'm swinging high up in the air!", "Tôi đang đung đưa xích đu thật cao trên không!", ["swinging", "high", "air"], ["swing", "high", "air"],
    "<b>swing</b> vừa là cái xích đu vừa là động từ đung đưa. <b>high up in the air</b> = thật cao trên không trung.", ["I'm swinging", "high up in the air!"], ["swing", "sing", "wing"],
    ["Push me on <b>the swing</b>!", "The kids are playing on <b>the swings</b>."],
    W => W.pk_swing === "yes" ? "Bạn vừa chơi xích đu rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_swing"], ["pose", "reach", 900], ["set", "pk_swing", "yes"], ["pose", "idle", 1]],
    ["swing on the swings", "play happily on the park swing", "chơi xích đu"], false, W => W.pk_swing === "yes"),

  pkA("smell_the_flowers", "flowerbed", "Smell the flowers", "Ngửi hương hoa", "These blooming flowers smell amazing!", "Những bông hoa đang nở rộ này thơm tuyệt vời!", ["blooming", "flowers", "smell"], ["smell", "flower", "bloom"],
    "Động từ giác quan <b>smell / look / taste + tính từ</b>: These flowers <b>smell amazing</b> (không dùng trạng từ amazingly).", ["These blooming flowers", "smell amazing!"], ["smell", "smile", "small"],
    ["The roses <b>smell so sweet</b>!", "The garden <b>looks beautiful</b> in spring."],
    W => W.pk_flowers === "smelled" ? "Bạn đã thưởng thức hương hoa rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_flowers"], ["pose", "bend", 750], ["set", "pk_flowers", "smelled"], ["pose", "idle", 1]],
    ["smell the flowers", "stop to smell the colorful blooming flowers", "ngửi hương hoa thơm ngát"], false, W => W.pk_flowers === "smelled"),

  pkA("take_park_photo", "flowerbed", "Take a photo", "Chụp ảnh kỷ niệm", "Could you take a picture of us by the flowers?", "Bạn chụp giúp tụi mình một bức ảnh bên luống hoa được không?", ["take", "picture", "flowers"], ["photo", "couldyou", "flower"],
    "Nhờ ai chụp ảnh lịch sự: <b>Could you take a picture / photo of us?</b>", ["Could you take a picture of us", "by the flowers?"], ["photo", "phone", "follow"],
    ["Could you take a photo of me <b>by the pond</b>?", "Let's <b>take a selfie</b> together!"],
    W => W.pk_photo === "yes" ? "Bạn đã chụp ảnh kỷ niệm rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_flowers"], ["pose", "point", 750], ["set", "pk_photo", "yes"], ["pose", "idle", 1]],
    ["take a photo", "take a nice photo by the flower bed", "chụp ảnh bên luống hoa"], false, W => W.pk_photo === "yes"),

  pkA("greet_icecream_vendor", "icecreamcart", "Ask about flavors", "Hỏi các vị kem", "Hi! What flavors of ice cream do you have today?", "Chào anh! Hôm nay xe mình có những vị kem nào vậy ạ?", ["What", "flavors", "ice cream"], ["flavor", "icecream", "vendor"],
    "Hỏi các loại/vị có sẵn: <b>What flavors do you have?</b> (Bạn có những vị nào?).", ["Hi! What flavors of ice cream", "do you have today?"], ["flavor", "favor", "flower"],
    ["What <b>flavors of smoothie</b> do you have?", "Do you have <b>strawberry</b> flavor?"],
    W => W.pk_vendor === "asked" ? "Bạn đã hỏi các vị kem rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_icecream"], ["pose", "point", 650], ["set", "pk_vendor", "asked"], ["pose", "idle", 1]],
    ["ask about ice cream flavors", "ask the vendor what flavors of ice cream he has", "hỏi các vị kem"], false, W => W.pk_vendor === "asked"),

  pkA("buy_an_ice_cream", "icecreamcart", "Buy an ice cream cone", "Mua kem ốc quế", "Can I get one scoop of vanilla in a cone, please?", "Cho tôi một viên kem va-ni trong bánh ốc quế nhé?", ["scoop", "vanilla", "cone"], ["scoop", "vanilla", "cone", "icecream"],
    "Cách gọi kem chuẩn: <b>one scoop / two scoops of + vị kem + in a cone (ốc quế) / in a cup (cốc giấy)</b>.", ["Can I get one scoop of vanilla", "in a cone, please?"], ["cone", "coin", "comb"],
    ["Can I get <b>two scoops of chocolate</b> in a cup?", "One <b>strawberry cone</b>, please."],
    W => W.pk_icecream === "have" ? "Trên tay bạn đang có cây kem rồi. Hãy ăn kem trước nhé!" : null,
    W => [...standIfSit(W), ["walk", "pk_icecream"], ["pose", "reach", 750], ["set", "pk_icecream", "have"], ["pose", "idle", 1]],
    ["buy an ice cream cone", "buy a scoop of vanilla ice cream in a cone", "mua một cây kem ốc quế"], false, W => W.pk_icecream === "have" || W.pk_icecream === "eaten"),

  pkA("eat_ice_cream", "icecreamcart", "Eat my ice cream", "Ăn kem", "Mmm, this cold vanilla ice cream is so refreshing!", "Ừm, cây kem va-ni mát lạnh này sảng khoái quá!", ["cold", "vanilla", "refreshing"], ["refreshing", "cold", "eat"],
    "<b>refreshing</b> /rɪˈfreʃ.ɪŋ/ = làm tỉnh người, mát lạnh sảng khoái (rất hợp dùng cho đồ ăn/thức uống ngày nắng).", ["Mmm, this cold vanilla ice cream", "is so refreshing!"], ["cold", "coal", "code"],
    ["This cold lemonade is <b>so refreshing</b>!", "Eat it quickly before <b>it melts</b>!"],
    W => W.pk_icecream === "eaten" ? "Bạn đã ăn hết kem rồi." : W.pk_icecream !== "have" ? "Bạn chưa mua kem. Hãy mua kem trước (Buy an ice cream cone)." : null,
    W => [...(W.pk_icecream !== "have" ? [["walk", "pk_icecream"], ["pose", "reach", 400], ["set", "pk_icecream", "have"]] : []), ["spawn", "pk_coneP"], ["pose", "drink", 1200], ["despawn"], ["set", "pk_icecream", "eaten"], ["set", "pk_wrapper", "have"], ["pose", "idle", 1]],
    ["eat my ice cream", "happily eat my cold vanilla ice cream cone", "thưởng thức cây kem mát lạnh"], true, W => W.pk_icecream === "eaten"),

  pkA("drink_from_fountain", "fountain", "Drink from the fountain", "Uống nước ở vòi", "I'm taking a sip of cool water from the fountain.", "Tôi đang uống một ngụm nước mát từ vòi nước công cộng.", ["sip", "cool", "fountain"], ["sip", "fountain", "water"],
    "<b>take a sip (of …)</b> = uống một ngụm nhỏ. <b>drinking fountain / water fountain</b> = vòi nước uống nơi công cộng.", ["I'm taking a sip of cool water", "from the fountain."], ["sip", "ship", "tip"],
    ["Take <b>a sip of water</b> after jogging.", "Where is the <b>drinking fountain</b>?"],
    W => W.pk_water === "drank" ? "Bạn vừa uống nước ở vòi rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_fountain"], ["pose", "bend", 850], ["set", "pk_water", "drank"], ["pose", "idle", 1]],
    ["drink from the fountain", "take a sip of cool water from the fountain", "uống nước mát ở vòi"], false, W => W.pk_water === "drank"),

  pkA("throw_away_wrapper", "parkbin", "Throw away the wrapper", "Bỏ giấy gói vào thùng rác", "I'm putting my trash into the recycling bin.", "Tôi đang bỏ rác của mình vào thùng rác tái chế.", ["putting", "trash", "bin"], ["wrapper", "trash", "bin"],
    "Giữ công viên sạch đẹp: <b>put trash in the bin</b> / <b>Don't litter!</b> (Không xả rác bừa bãi!).", ["I'm putting my trash", "into the recycling bin."], ["trash", "crash", "flash"],
    ["Always <b>put your trash in the bin</b>.", "Please <b>keep the park clean</b>."],
    W => W.pk_trash === "binned" && W.pk_wrapper !== "have" ? "Bạn đã bỏ rác vào thùng gọn gàng rồi." : null,
    W => [...standIfSit(W), ["walk", "pk_bin"], ["pose", "reach", 600], ["set", "pk_wrapper", "none"], ["set", "pk_trash", "binned"], ["pose", "idle", 1]],
    ["throw away the wrapper", "put the wrapper into the park recycling bin", "bỏ giấy gói vào thùng rác"], false, W => W.pk_trash === "binned"),

  /* ==================== 85 NEW PARK ACTIONS ==================== */
  /* 1. parkgate (+5) */
  pkQ("check_opening_hours", "parkgate", "pk_door", "read", "pk_hours", "checked",
    "Check park closing time", "Xem giờ đóng cửa công viên",
    "Excuse me, what time does the park close in the evening?",
    "Xin lỗi, buổi tối công viên đóng cửa lúc mấy giờ vậy ạ?",
    ["what", "time", "close", "evening"], ["park", "close", "evening"],
    "Hỏi giờ đóng/mở cửa: <b>What time does + địa điểm + close / open?</b>",
    ["Excuse me, what time", "does the park close in the evening?"], ["close", "clothes", "clock"],
    ["What time does <b>the gate open</b>?", "The park closes <b>at nine in the evening</b>."],
    ["check the park closing time", "check what time the park closes in the evening", "xem giờ đóng cửa công viên"]),

  pkQ("read_park_rules", "parkgate", "pk_door", "read", "pk_rules", "read",
    "Read the park rules", "Đọc nội quy công viên",
    "The sign says dogs must stay on a leash at all times.",
    "Biển báo ghi rằng chó phải được đeo dây dắt mọi lúc.",
    ["sign", "dogs", "leash"], ["sign", "rule", "leash"],
    "<b>The sign says (that) …</b> = Biển báo ghi rằng …; <b>at all times</b> = mọi lúc.",
    ["The sign says", "dogs must stay on a leash at all times."], ["sign", "shine", "fine"],
    ["The sign says <b>keep off the grass</b>.", "Please follow <b>the park rules</b>."],
    ["read the park rules", "read the park rules on the entrance sign", "đọc bảng nội quy công viên"]),

  pkQ("ask_restroom_way", "parkgate", "pk_door", "point", "pk_restroom_way", "asked",
    "Ask where the restroom is", "Hỏi đường đi nhà vệ sinh",
    "Could you tell me where the nearest public restroom is?",
    "Bạn chỉ giúp tôi nhà vệ sinh công cộng gần nhất ở đâu được không?",
    ["where", "nearest", "restroom"], ["couldyou", "nearest", "restroom"],
    "Câu hỏi gián tiếp lịch sự: <b>Could you tell me where + S + is?</b> (động từ <i>is</i> đứng cuối).",
    ["Could you tell me", "where the nearest public restroom is?"], ["nearest", "neatly", "nearly"],
    ["Where is <b>the nearest bus stop</b>?", "The public restroom is <b>behind the gazebo</b>."],
    ["ask where the restroom is", "ask for directions to the nearest public restroom", "hỏi đường tới nhà vệ sinh công cộng"]),

  pkQ("check_weather_board", "parkgate", "pk_door", "read", "pk_weather_board", "checked",
    "Check the weather board", "Xem bảng thời tiết hôm nay",
    "Today's forecast is sunny and breezy with a mild temperature.",
    "Dự báo hôm nay trời nắng đẹp, có gió mát và nhiệt độ dịu nhẹ.",
    ["forecast", "sunny", "breezy", "mild"], ["forecast", "breezy", "mild"],
    "Miêu tả thời tiết dễ chịu: <b>sunny and breezy</b> (nắng và có gió nhẹ), <b>mild temperature</b> (nhiệt độ ôn hoà).",
    ["Today's forecast is sunny and breezy", "with a mild temperature."], ["breezy", "busy", "freezing"],
    ["It's <b>warm and breezy</b> in the park.", "We have <b>mild weather</b> all week."],
    ["check the weather board", "check today's sunny and breezy weather forecast", "xem bảng dự báo thời tiết"]),

  pkQ("apply_sunscreen_gate", "parkgate", "pk_door", "reach", "pk_sunscreen", "applied",
    "Put on sunscreen", "Thoa kem chống nắng",
    "The UV index is high today, so I'm putting on sunscreen.",
    "Chỉ số tia UV hôm nay khá cao nên tôi đang thoa kem chống nắng.",
    ["UV", "high", "putting", "sunscreen"], ["uvrays", "puton", "sunscreen"],
    "Bảo vệ sức khoẻ ngoài trời: <b>put on / apply sunscreen</b> (thoa kem chống nắng).",
    ["The UV index is high today,", "so I'm putting on sunscreen."], ["sunscreen", "sunshine", "sunglasses"],
    ["Don't forget to <b>put on sunscreen</b>.", "Wear a hat when <b>the UV index is high</b>."],
    ["put on sunscreen", "apply sunscreen before walking in the sun", "thoa kem chống nắng"]),

  /* 2. puppy (+4) */
  pkQ("give_puppy_water", "puppy", "pk_dog", "bend", "pk_dog_water", "given",
    "Give the puppy water", "Cho chú chó uống nước",
    "My puppy is panting in the heat, so I'm giving him fresh water.",
    "Chú chó con đang thở hổn hển vì trời nóng nên tôi cho nó uống nước mát.",
    ["puppy", "panting", "heat", "water"], ["puppy", "pant", "heat", "water"],
    "<b>pant</b> = thở hổn hển (thường dùng cho chó khi nóng hoặc chạy mệt).",
    ["My puppy is panting in the heat,", "so I'm giving him fresh water."], ["pant", "paint", "plant"],
    ["The dog is <b>panting after playing fetch</b>.", "Give your pet <b>plenty of fresh water</b>."],
    ["give the puppy water", "give my thirsty puppy a bowl of fresh water", "cho chú chó uống nước mát"]),

  pkQ("give_dog_treat", "puppy", "pk_dog", "bend", "pk_dog_treat", "given",
    "Give the dog a treat", "Thưởng bánh cho chó",
    "Sit and shake hands! Here is a crunchy dog treat for you.",
    "Ngồi xuống và bắt tay nào! Đây là miếng bánh thưởng giòn rụm cho cưng.",
    ["Sit", "crunchy", "treat"], ["treat", "crunchy", "goodboy"],
    "Lệnh dạy cún cưng: <b>Sit!</b> (Ngồi xuống!), <b>Stay!</b> (Đứng yên!), <b>Shake hands!</b> (Bắt tay!).",
    ["Sit and shake hands!", "Here is a crunchy dog treat for you."], ["treat", "tree", "street"],
    ["My dog loves <b>crunchy treats</b>.", "Give the puppy <b>a small treat</b>."],
    ["give the dog a treat", "reward the clever puppy with a crunchy treat", "thưởng bánh cho chú chó"]),

  pkQ("ask_dog_breed", "puppy", "pk_dog", "point", "pk_dog_breed", "asked",
    "Ask about the dog's breed", "Hỏi giống chó",
    "What breed is your dog? He has such a shiny golden coat!",
    "Chú chó của bạn thuộc giống gì thế? Bộ lông vàng của nó bóng mượt quá!",
    ["What", "breed", "shiny", "coat"], ["breed", "shiny", "puppy"],
    "Hỏi giống thú cưng: <b>What breed is your dog?</b>; <b>coat / fur</b> = bộ lông.",
    ["What breed is your dog?", "He has such a shiny golden coat!"], ["breed", "bread", "breathe"],
    ["He is a <b>Golden Retriever</b>.", "Brushing keeps his <b>coat shiny</b>."],
    ["ask about the dog's breed", "ask what breed the golden puppy is", "hỏi xem chú chó thuộc giống gì"]),

  pkQ("brush_puppy_fur", "puppy", "pk_dog", "pet", "pk_dog_brushed", "yes",
    "Brush the puppy's fur", "Chải lông cho chó",
    "I'm gently brushing the loose fur off my puppy's back.",
    "Tôi đang nhẹ nhàng chải lớp lông rụng trên lưng chú chó nhỏ.",
    ["gently", "brushing", "fur", "puppy"], ["brush", "fur", "gentle"],
    "<b>brush + something + off</b> = chải sạch cái gì đi; <b>loose fur</b> = lông rụng.",
    ["I'm gently brushing", "the loose fur off my puppy's back."], ["fur", "far", "four"],
    ["I <b>brush my dog's fur</b> every week.", "Be <b>gentle</b> when brushing the puppy."],
    ["brush the puppy's fur", "gently brush my puppy's soft golden fur", "chải lông cho chú chó"]),

  /* 3. duckpond (+4) */
  pkQ("spot_pond_turtle", "duckpond", "pk_pond", "point", "pk_turtle", "spotted",
    "Spot a turtle on the rock", "Ngắm rùa phơi nắng trên đá",
    "Look closely! A small green turtle is sunbathing on that flat rock.",
    "Nhìn kỹ kìa! Một chú rùa xanh nhỏ đang phơi nắng trên tảng đá phẳng đó.",
    ["closely", "turtle", "sunbathing", "rock"], ["turtle", "sunbathe", "pond"],
    "<b>sunbathe</b> = tắm nắng, phơi nắng; <b>look closely</b> = nhìn kỹ.",
    ["Look closely!", "A small green turtle is sunbathing on that flat rock."], ["turtle", "purple", "circle"],
    ["Two <b>turtles</b> are sitting on a log.", "We love <b>sunbathing</b> on warm mornings."],
    ["spot a turtle on the rock", "spot a small green turtle sunbathing by the pond", "ngắm chú rùa phơi nắng bên hồ"]),

  pkQ("watch_koi_fish", "duckpond", "pk_pond", "bend", "pk_koifish", "watched",
    "Watch the koi fish", "Ngắm đàn cá koi bơi",
    "Bright orange koi fish are swimming beneath the green lily pads.",
    "Những chú cá koi màu cam rực rỡ đang bơi lội dưới những tán lá súng xanh.",
    ["orange", "koi", "swimming", "lily"], ["koifish", "swim", "lilypad"],
    "<b>beneath / under</b> = ở bên dưới; <b>lily pad</b> = lá bông súng / lá sen trên mặt hồ.",
    ["Bright orange koi fish", "are swimming beneath the green lily pads."], ["fish", "dish", "wish"],
    ["The <b>koi fish</b> came up to the surface.", "A frog is sitting on a <b>lily pad</b>."],
    ["watch the koi fish", "watch the colorful koi fish under the lily pads", "ngắm đàn cá koi dưới lá súng"]),

  pkQ("listen_to_frogs", "duckpond", "pk_pond", "point", "pk_frogs", "listened",
    "Listen to the frogs croak", "Lắng nghe tiếng ếch kêu",
    "Can you hear the frogs croaking near the tall pond reeds?",
    "Bạn có nghe thấy tiếng ếch kêu ộp ộp gần bụi sậy cao bên hồ không?",
    ["hear", "frogs", "croaking", "pond"], ["frog", "croak", "pond"],
    "Động từ giác quan: <b>hear + đối tượng + V-ing</b> (nghe thấy ai/con gì đang làm gì).",
    ["Can you hear the frogs", "croaking near the tall pond reeds?"], ["frog", "fog", "log"],
    ["I can hear <b>the frogs croaking</b> after the rain.", "A green <b>frog</b> jumped into the pond."],
    ["listen to the frogs croak", "listen to the frogs croaking by the pond", "lắng nghe tiếng ếch kêu bên hồ"]),

  pkQ("ask_feeding_ducks_ok", "duckpond", "pk_pond", "point", "pk_duck_ask", "asked",
    "Ask what ducks can eat", "Hỏi thức ăn tốt cho vịt",
    "Is it okay to feed oats and seeds to the wild ducks here?",
    "Ở đây mình cho vịt trời ăn yến mạch và các loại hạt có được không ạ?",
    ["okay", "feed", "oats", "ducks"], ["feed", "oats", "wild", "duck"],
    "Xin phép hoặc hỏi điều gì có ổn không: <b>Is it okay to + V …?</b>",
    ["Is it okay to feed", "oats and seeds to the wild ducks here?"], ["oats", "boats", "coats"],
    ["<b>Is it okay to</b> sit on the grass?", "<b>Oats and seeds</b> are healthy for ducks."],
    ["ask what ducks can eat", "ask if it is okay to feed oats to the ducks", "hỏi xem cho vịt ăn yến mạch được không"]),

  /* 4. bikestand (+4) */
  pkQ("put_on_bike_helmet", "bikestand", "pk_bike", "reach", "pk_helmet_on", "yes",
    "Put on a bike helmet", "Đội mũ bảo hiểm xe đạp",
    "Safety first! I'm strapping on my protective bike helmet.",
    "An toàn là trên hết! Tôi đang cài quai chiếc mũ bảo hiểm xe đạp.",
    ["Safety", "strapping", "protective", "helmet"], ["strapon", "protective", "helmet"],
    "<b>Safety first!</b> = An toàn là trên hết! <b>strap on a helmet</b> = đội và cài quai mũ bảo hiểm.",
    ["Safety first!", "I'm strapping on my protective bike helmet."], ["helmet", "healthy", "velvet"],
    ["Always wear a <b>protective helmet</b>.", "Make sure the <b>chin strap</b> fits snugly."],
    ["put on a bike helmet", "strap on a protective bike helmet safely", "đội mũ bảo hiểm xe đạp"]),

  pkQ("check_bike_tires", "bikestand", "pk_bike", "bend", "pk_tires", "checked",
    "Check the bicycle tires", "Kiểm tra lốp xe đạp",
    "Let me check if both bicycle tires are firm and properly inflated.",
    "Để tôi kiểm tra xem cả hai lốp xe đạp đã căng đều chưa.",
    ["check", "bicycle", "tires", "inflated"], ["bicycle", "tire", "inflate"],
    "<b>check if / whether + mệnh đề</b> = kiểm tra xem liệu …; <b>inflated</b> = được bơm căng hơi.",
    ["Let me check if both bicycle tires", "are firm and properly inflated."], ["tire", "fire", "wire"],
    ["The front <b>tire</b> needs more air.", "Keep your <b>tires properly inflated</b>."],
    ["check the bicycle tires", "check if the bicycle tires are properly inflated", "kiểm tra lốp xe đạp"]),

  pkQ("adjust_bike_seat", "bikestand", "pk_bike", "reach", "pk_saddle", "adjusted",
    "Adjust the bike seat", "Chỉnh độ cao yên xe",
    "The saddle is a bit too low, so I'm raising the bike seat.",
    "Yên xe hơi thấp một chút nên tôi đang nâng cao yên xe đạp lên.",
    ["saddle", "low", "raising", "seat"], ["saddle", "raise", "bicycle"],
    "<b>a bit too + tính từ</b> = hơi quá (thấp/cao/chật…); <b>raise</b> (ngoại động từ) = nâng cái gì lên.",
    ["The saddle is a bit too low,", "so I'm raising the bike seat."], ["raise", "race", "rice"],
    ["Can you help me <b>adjust the bike seat</b>?", "I <b>raised the saddle</b> by two inches."],
    ["adjust the bike seat", "raise the bicycle saddle to a comfortable height", "chỉnh lại độ cao yên xe đạp"]),

  pkQ("return_rental_bike", "bikestand", "pk_bike", "reach", "pk_bike_returned", "yes",
    "Return the rental bike", "Trả xe đạp vào trạm",
    "I'm locking the bicycle back into the rental dock.",
    "Tôi đang khoá chiếc xe đạp trả lại vào trạm thuê xe.",
    ["locking", "bicycle", "rental", "dock"], ["bicycle", "rent", "dock"],
    "<b>lock … back into …</b> = khoá trả lại vào khớp/trạm.",
    ["I'm locking the bicycle", "back into the rental dock."], ["dock", "lock", "clock"],
    ["Please return the bike to <b>any rental dock</b>.", "Wait for the green light on <b>the dock</b>."],
    ["return the rental bike", "lock the rental bicycle back into the dock", "trả xe đạp vào trạm thuê"]),

  /* 5. parkbench (+4) */
  pkQ("ask_share_bench", "parkbench", "pk_bench", "point", "pk_bench_shared", "asked",
    "Ask to share the bench", "Xin ngồi chung ghế đá",
    "Excuse me, is anyone sitting here? May I share this bench?",
    "Xin lỗi, chỗ này có ai ngồi không ạ? Tôi ngồi chung ghế đá này được không?",
    ["sitting", "May", "share", "bench"], ["share", "bench", "relax"],
    "Câu hỏi lịch sự khi muốn ngồi: <b>Is anyone sitting here?</b> / <b>Is this seat taken?</b>",
    ["Excuse me, is anyone sitting here?", "May I share this bench?"], ["share", "chair", "care"],
    ["<b>Is anyone sitting here</b>?", "Of course, <b>feel free to share the bench</b>!"],
    ["ask to share the bench", "politely ask to share the shady park bench", "hỏi xin ngồi chung ghế đá"]),

  pkQ("tie_running_shoelace", "parkbench", "pk_bench", "bend", "pk_shoelace", "tied",
    "Tie my running shoelace", "Buộc lại dây giày chạy bộ",
    "My left shoelace came untied, so I'm tying a double knot.",
    "Dây giày bên trái của tôi bị tuột nên tôi đang buộc thắt nút đôi.",
    ["shoelace", "untied", "tying", "knot"], ["shoelace", "untied", "jog"],
    "<b>come untied / undone</b> = bị tuột dây; <b>tie a double knot</b> = buộc nút đôi cho chắc.",
    ["My left shoelace came untied,", "so I'm tying a double knot."], ["knot", "not", "note"],
    ["Be careful, your <b>shoelace is untied</b>!", "I stopped by the bench to <b>tie my shoes</b>."],
    ["tie my running shoelace", "stop at the bench to tie my shoelace", "buộc lại dây giày thể thao"]),

  pkQ("listen_podcast_bench", "parkbench", "pk_bench", "read", "pk_podcast", "listened",
    "Listen to a podcast", "Nghe podcast tiếng Anh",
    "I'm sitting in the cool shade and listening to an English podcast.",
    "Tôi đang ngồi dưới bóng mát và nghe một tập podcast tiếng Anh.",
    ["sitting", "shade", "listening", "podcast"], ["shade", "podcast", "relax"],
    "Nhớ giới từ <b>to</b> sau <b>listen</b>: <i>listening <b>to</b> an English podcast</i>.",
    ["I'm sitting in the cool shade", "and listening to an English podcast."], ["shade", "shed", "said"],
    ["I listen to <b>a daily English podcast</b>.", "It's relaxing to sit <b>in the cool shade</b>."],
    ["listen to a podcast", "listen to an English podcast on the shady bench", "nghe podcast trên ghế đá"], true),

  pkQ("rest_tired_legs", "parkbench", "pk_bench", "reach", "pk_rest_legs", "rested",
    "Rest my tired legs", "Nghỉ cho đỡ mỏi chân",
    "My legs feel sore after running, so I'm resting for ten minutes.",
    "Chân tôi hơi mỏi sau khi chạy bộ nên tôi đang ngồi nghỉ mười phút.",
    ["legs", "sore", "running", "resting"], ["sore", "relax", "bench"],
    "Miêu tả sức khoẻ/cơ bắp: <b>feel sore / tired / stiff</b> = cảm thấy đau mỏi, căng cơ.",
    ["My legs feel sore after running,", "so I'm resting for ten minutes."], ["sore", "saw", "shore"],
    ["My calves <b>feel a bit sore</b> today.", "Sit down and <b>rest your legs</b>."],
    ["rest my tired legs", "rest my sore legs on the park bench", "ngồi nghỉ cho đỡ mỏi chân"], true),

  /* 6. swing (+4) */
  pkQ("push_friend_swing", "swing", "pk_swing", "reach", "pk_swing_push", "pushed",
    "Give a gentle push", "Đẩy xích đu nhẹ nhàng",
    "Hold on tight to the chains! I'll give you a gentle push.",
    "Bám chắc vào dây xích nhé! Mình sẽ đẩy nhẹ cho bạn đung đưa.",
    ["Hold", "chains", "gentle", "push"], ["chain", "gentle", "push"],
    "<b>Hold on tight!</b> = Bám chắc vào nhé! <b>give someone a push</b> = đẩy ai đó một nhịp.",
    ["Hold on tight to the chains!", "I'll give you a gentle push."], ["chain", "train", "rain"],
    ["Can you <b>give me a push</b> on the swing?", "<b>Hold on tight</b> with both hands!"],
    ["give a gentle push", "give my friend a gentle push on the swing", "đẩy nhẹ xích đu"]),

  pkQ("take_turns_swing", "swing", "pk_swing", "point", "pk_swing_turns", "agreed",
    "Take turns on the swing", "Thay phiên nhau chơi xích đu",
    "Why don't we take turns on the swing every five minutes?",
    "Hay là tụi mình thay phiên nhau chơi xích đu cứ mỗi năm phút nhé?",
    ["take", "turns", "swing", "minutes"], ["taketurns", "swing", "share"],
    "<b>Why don't we + V?</b> = Hay là chúng mình … nhé? <b>take turns</b> = thay phiên, luân phiên nhau.",
    ["Why don't we take turns", "on the swing every five minutes?"], ["turn", "burn", "learn"],
    ["The children <b>took turns</b> on the slide.", "Let's <b>take turns</b> riding the bike."],
    ["take turns on the swing", "politely take turns on the playground swing", "thay phiên nhau chơi xích đu"]),

  pkQ("check_swing_chains", "swing", "pk_swing", "reach", "pk_swing_safe", "checked",
    "Check the swing chains", "Kiểm tra dây xích đu",
    "The metal chains on this swing feel sturdy and safe.",
    "Dây xích kim loại của chiếc xích đu này rất chắc chắn và an toàn.",
    ["metal", "chains", "sturdy", "safe"], ["chain", "sturdy", "swing"],
    "<b>sturdy</b> /ˈstɜː.di/ = chắc chắn, cứng cáp (dùng cho đồ vật, bàn ghế, cầu, xích đu).",
    ["The metal chains on this swing", "feel sturdy and safe."], ["safe", "save", "shape"],
    ["This wooden bench is very <b>sturdy</b>.", "Always check if the playground equipment is <b>safe</b>."],
    ["check the swing chains", "check that the metal swing chains are sturdy", "kiểm tra độ chắc chắn của xích đu"]),

  pkQ("slow_down_swing", "swing", "pk_swing", "bend", "pk_swing_slow", "slowed",
    "Slow the swing down", "Hãm chậm xích đu lại",
    "I'm dragging my feet on the ground to slow the swing down.",
    "Tôi đang rà chân xuống mặt đất để hãm chiếc xích đu chậm lại.",
    ["dragging", "feet", "slow", "down"], ["drag", "slowdown", "swing"],
    "Cụm động từ <b>slow down</b> = chậm lại, giảm tốc độ.",
    ["I'm dragging my feet on the ground", "to slow the swing down."], ["slow", "snow", "show"],
    ["Wait until the swing <b>slows down</b> completely.", "<b>Slow down</b> around the corner!"],
    ["slow the swing down", "slow the swing down safely before getting off", "hãm chậm xích đu lại"]),

  /* 7. flowerbed (+4) */
  pkQ("spot_yellow_butterfly", "flowerbed", "pk_flowers", "point", "pk_butterfly", "spotted",
    "Spot a yellow butterfly", "Ngắm bướm vàng đậu trên hoa",
    "A delicate yellow butterfly just landed on that purple flower!",
    "Một chú bướm vàng mỏng manh vừa mới đậu xuống bông hoa màu tím kia!",
    ["delicate", "butterfly", "landed", "flower"], ["delicate", "butterfly", "flower"],
    "<b>just + V-ed</b> = vừa mới làm gì; <b>land on …</b> = đáp xuống, đậu lên.",
    ["A delicate yellow butterfly", "just landed on that purple flower!"], ["land", "hand", "sand"],
    ["Two colorful <b>butterflies</b> are flying over the flowers.", "The bee <b>landed on a rose</b>."],
    ["spot a yellow butterfly", "watch a delicate yellow butterfly on a flower", "ngắm bướm vàng đậu trên hoa"]),

  pkQ("read_plant_label", "flowerbed", "pk_flowers", "read", "pk_plant_tag", "read",
    "Read the plant name tag", "Đọc bảng tên loài hoa",
    "This little wooden tag says these fragrant flowers are lavender.",
    "Tấm thẻ gỗ nhỏ này ghi rằng những bông hoa thơm ngát này là hoa oải hương.",
    ["wooden", "fragrant", "flowers", "lavender"], ["fragrant", "lavender", "flower"],
    "<b>fragrant</b> /ˈfreɪ.ɡrənt/ = có hương thơm dịu mát (thường dùng cho hoa, trà, thảo mộc).",
    ["This little wooden tag says", "these fragrant flowers are lavender."], ["tag", "bag", "flag"],
    ["<b>Lavender</b> has a calming, <b>fragrant</b> scent.", "Read the botanical name on <b>the plant tag</b>."],
    ["read the plant name tag", "read the wooden label in the flower bed", "đọc bảng tên hoa oải hương"]),

  pkQ("sneeze_from_pollen", "flowerbed", "pk_flowers", "point", "pk_pollen", "sneezed",
    "Talk about spring pollen", "Nói về dị ứng phấn hoa",
    "Achoo! Spring pollen always gives me mild hay fever.",
    "Hắt xì! Phấn hoa mùa xuân lúc nào cũng làm tôi bị dị ứng nhẹ.",
    ["pollen", "mild", "hay", "fever"], ["pollen", "mild", "hayfever"],
    "Từ vựng sức khoẻ mùa xuân: <b>pollen</b> (phấn hoa), <b>hay fever</b> (chứng viêm mũi dị ứng phấn hoa).",
    ["Achoo! Spring pollen", "always gives me mild hay fever."], ["pollen", "fallen", "calling"],
    ["Do you have <b>allergies to pollen</b>?", "My <b>hay fever</b> is mild today."],
    ["talk about spring pollen", "sneeze from the spring flower pollen", "nói về chứng dị ứng phấn hoa"]),

  pkQ("admire_blooming_roses", "flowerbed", "pk_flowers", "bend", "pk_roses", "admired",
    "Admire the blooming roses", "Ngắm hoa hồng nở rộ",
    "The red and pink roses are in full bloom this week.",
    "Những bông hoa hồng đỏ và hồng phấn đang nở rộ đẹp nhất trong tuần này.",
    ["red", "pink", "roses", "bloom"], ["rose", "fullbloom", "flower"],
    "Thành ngữ thiên nhiên: <b>be in full bloom</b> = đang độ nở rộ rực rỡ nhất.",
    ["The red and pink roses", "are in full bloom this week."], ["rose", "road", "rope"],
    ["The cherry blossoms are <b>in full bloom</b>.", "These <b>pink roses</b> look gorgeous."],
    ["admire the blooming roses", "admire the red and pink roses in full bloom", "ngắm những đóa hồng nở rộ"]),

  /* 8. icecreamcart (+4) */
  pkQ("ask_icecream_price", "icecreamcart", "pk_icecream", "point", "pk_ic_price", "asked",
    "Ask the price of two scoops", "Hỏi giá kem hai viên",
    "How much is a double scoop of chocolate in a waffle cone?",
    "Một cây kem sô-cô-la hai viên trong bánh ốc quế giòn giá bao nhiêu vậy anh?",
    ["How", "much", "double", "scoop", "cone"], ["scoop", "wafflecone", "icecream"],
    "<b>a single scoop</b> = 1 viên; <b>a double scoop</b> = 2 viên; <b>waffle cone</b> = ốc quế nướng giòn.",
    ["How much is a double scoop of chocolate", "in a waffle cone?"], ["scoop", "soup", "group"],
    ["<b>How much is</b> a single scoop?", "I'd love a <b>crispy waffle cone</b>."],
    ["ask the price of two scoops", "ask how much a double scoop cone costs", "hỏi giá kem ốc quế hai viên"]),

  pkQ("order_strawberry_cup", "icecreamcart", "pk_icecream", "reach", "pk_sorbet", "ordered",
    "Order strawberry sorbet", "Gọi kem dâu trong cốc",
    "Could I get a small cup of strawberry sorbet, please?",
    "Cho tôi một cốc nhỏ kem dâu tây thanh mát nhé ạ?",
    ["small", "cup", "strawberry", "sorbet"], ["strawberry", "sorbet", "couldyou"],
    "<b>sorbet</b> /ˈsɔː.beɪ/ = kem làm từ trái cây nghiền (không có sữa), rất hợp cho người không dùng sữa.",
    ["Could I get a small cup", "of strawberry sorbet, please?"], ["cup", "cap", "cut"],
    ["Do you prefer <b>a cone or a cup</b>?", "This <b>strawberry sorbet</b> is dairy-free and fruity."],
    ["order strawberry sorbet", "order a small cup of fruity strawberry sorbet", "gọi một cốc kem dâu tây"]),

  pkQ("ask_for_extra_napkin_pk", "icecreamcart", "pk_icecream", "reach", "pk_napkin", "got",
    "Ask for a paper napkin", "Xin thêm khăn giấy lau tay",
    "My ice cream is melting fast! Could I have a paper napkin?",
    "Kem của tôi đang tan nhanh quá! Cho tôi xin một tờ khăn giấy được không?",
    ["melting", "fast", "paper", "napkin"], ["melt", "napkin", "icecream"],
    "<b>melt</b> = tan chảy (kem, đá, tuyết); <b>paper napkin / tissue</b> = khăn giấy.",
    ["My ice cream is melting fast!", "Could I have a paper napkin?"], ["melt", "belt", "felt"],
    ["Eat your cone before <b>it melts in the sun</b>!", "Here are two <b>clean napkins</b>."],
    ["ask for a paper napkin", "ask the vendor for a clean paper napkin", "xin khăn giấy vì kem tan nhanh"]),

  pkQ("pay_vendor_cash", "icecreamcart", "pk_icecream", "reach", "pk_vendor_paid", "yes",
    "Pay the vendor in cash", "Trả tiền mặt cho người bán kem",
    "Here is five dollars in cash. Keep the change!",
    "Đây là năm đô-la tiền mặt. Anh cứ giữ lại tiền thừa nhé!",
    ["five", "cash", "Keep", "change"], ["cash", "change", "vendor"],
    "Khi mua hàng muốn boa luôn tiền lẻ thừa: <b>Keep the change!</b> (Cứ giữ tiền thối nhé!).",
    ["Here is five dollars in cash.", "Keep the change!"], ["cash", "catch", "wash"],
    ["Do you take <b>cash or card</b>?", "Thank you! <b>Keep the change</b>."],
    ["pay the vendor in cash", "pay the ice cream vendor in cash", "trả tiền mặt mua kem"]),

  /* 9. fountain (+4) */
  pkQ("refill_water_bottle", "fountain", "pk_fountain", "reach", "pk_bottle_refill", "yes",
    "Refill my water bottle", "Lấy đầy bình nước cá nhân",
    "I'm refilling my reusable bottle with cold water to stay hydrated.",
    "Tôi đang lấy đầy nước mát vào bình cá nhân để giữ cơ thể đủ nước.",
    ["refilling", "bottle", "water", "hydrated"], ["refill", "water", "hydrated"],
    "Cụm từ sức khoẻ rất hay: <b>stay hydrated</b> = giữ cho cơ thể đủ nước (đặc biệt khi trời nắng hoặc tập thể thao).",
    ["I'm refilling my reusable bottle", "with cold water to stay hydrated."], ["water", "waiter", "winter"],
    ["Drink plenty of water to <b>stay hydrated</b>.", "You can <b>refill your bottle</b> at the fountain."],
    ["refill my water bottle", "refill my reusable water bottle at the fountain", "lấy đầy bình nước cá nhân"]),

  pkQ("rinse_sticky_hands", "fountain", "pk_fountain", "bend", "pk_hands_rinsed", "yes",
    "Rinse my sticky hands", "Rửa sạch tay bị dính kem",
    "My hands are sticky from the ice cream, so I'm rinsing them off.",
    "Tay tôi bị dính kem nên tôi đang tráng sạch tay dưới vòi nước.",
    ["hands", "sticky", "rinsing", "off"], ["sticky", "rinse", "water"],
    "<b>sticky</b> = dính nhớp (do đường, kem, kẹo); <b>rinse off</b> = tráng sạch bằng nước.",
    ["My hands are sticky from the ice cream,", "so I'm rinsing them off."], ["rinse", "since", "prince"],
    ["My fingers are <b>sticky with honey</b>.", "Let's <b>rinse our hands</b> at the fountain."],
    ["rinse my sticky hands", "rinse my sticky hands with clean water", "rửa sạch tay dưới vòi nước"]),

  pkQ("splash_cool_water_face", "fountain", "pk_fountain", "bend", "pk_face_cooled", "yes",
    "Splash cool water on my face", "Vỗ nước mát lên mặt",
    "I'm splashing cool water on my warm face to cool down.",
    "Tôi đang vỗ chút nước mát lên khuôn mặt đang nóng để hạ nhiệt.",
    ["splashing", "cool", "water", "cool down"], ["splash", "water", "cooldown"],
    "<b>splash water on …</b> = vỗ/té nước lên …; <b>cool down</b> = làm mát, hạ nhiệt sau khi vận động.",
    ["I'm splashing cool water", "on my warm face to cool down."], ["cool", "pool", "tool"],
    ["Let's find some shade to <b>cool down</b>.", "He <b>splashed cold water</b> on his face."],
    ["splash cool water on my face", "splash cool water on my face after jogging", "vỗ nước mát lên mặt"]),

  pkQ("check_water_pressure", "fountain", "pk_fountain", "reach", "pk_fountain_btn", "pressed",
    "Press the fountain button", "Nhấn nút vòi nước uống",
    "Press the silver button to make the water arc higher.",
    "Hãy nhấn giữ nút bạc này để tia nước phun vòng cao hơn nhé.",
    ["Press", "button", "water", "higher"], ["button", "fountain", "water"],
    "Câu mệnh lệnh hướng dẫn cách dùng: <b>Press the button to + V</b> (Nhấn nút để làm gì).",
    ["Press the silver button", "to make the water arc higher."], ["press", "dress", "guess"],
    ["<b>Press the button</b> on the side of the fountain.", "The water is <b>clean and cold</b>."],
    ["press the fountain button", "press the silver button on the drinking fountain", "nhấn nút mở vòi nước uống"]),

  /* 10. parkbin (+4) */
  pkQ("sort_plastic_bottle", "parkbin", "pk_bin", "reach", "pk_plastic_sorted", "yes",
    "Recycle a plastic bottle", "Phân loại chai nhựa tái chế",
    "Plastic bottles go into the blue recycling slot, not general waste.",
    "Chai nhựa phải bỏ vào ngăn tái chế màu xanh chứ không bỏ vào rác thường.",
    ["Plastic", "bottles", "recycling", "slot"], ["plastic", "slot", "bin"],
    "Nói vật gì thuộc ngăn/thùng nào: <b>Plastic bottles go into the recycling bin</b>.",
    ["Plastic bottles go into", "the blue recycling slot, not general waste."], ["slot", "spot", "shot"],
    ["Glass and cans <b>go into the recycling bin</b>.", "Always <b>sort your waste</b>."],
    ["recycle a plastic bottle", "sort an empty plastic bottle into the recycling bin", "phân loại chai nhựa vào thùng tái chế"]),

  pkQ("pick_up_stray_litter", "parkbin", "pk_bin", "bend", "pk_litter_picked", "yes",
    "Pick up litter on the grass", "Nhặt rác rơi trên bãi cỏ",
    "Someone dropped a paper cup on the grass, so I'm picking it up.",
    "Ai đó đã làm rơi chiếc cốc giấy trên cỏ nên tôi đang nhặt lên bỏ thùng rác.",
    ["dropped", "paper", "picking", "up"], ["litter", "pickup", "trash"],
    "Cụm động từ tách được: <b>pick up the cup</b> = <b>pick it up</b> (đại từ <i>it</i> luôn đứng giữa <i>pick</i> và <i>up</i>).",
    ["Someone dropped a paper cup on the grass,", "so I'm picking it up."], ["pick", "pack", "peak"],
    ["Thank you for <b>picking up the litter</b>!", "Let's keep our neighborhood <b>clean and green</b>."],
    ["pick up litter on the grass", "pick up a stray paper cup and bin it", "nhặt rác trên cỏ bỏ vào thùng"]),

  pkQ("dispose_dog_waste", "parkbin", "pk_bin", "reach", "pk_dog_bag", "binned",
    "Clean up after the dog", "Dọn vệ sinh cho thú cưng",
    "I'm tying the dog waste bag and dropping it into the trash bin.",
    "Tôi đang buộc kín túi dọn phân chó và bỏ gọn vào thùng rác.",
    ["tying", "waste", "bag", "bin"], ["wastebag", "trash", "bin"],
    "Cụm từ văn minh nơi công cộng: <b>clean up after your dog</b> = dọn vệ sinh sau khi dắt chó đi dạo.",
    ["I'm tying the dog waste bag", "and dropping it into the trash bin."], ["bag", "back", "badge"],
    ["Please <b>clean up after your pet</b>.", "Free <b>dog waste bags</b> are near the gate."],
    ["clean up after the dog", "drop the tied dog waste bag into the bin", "dọn vệ sinh cho thú cưng đúng chỗ"]),

  pkQ("check_recycling_labels", "parkbin", "pk_bin", "read", "pk_bin_labels", "checked",
    "Check the recycling symbols", "Xem nhãn phân loại rác",
    "Which bin should I use for a cardboard juice box?",
    "Mình nên bỏ hộp nước ép bằng giấy bìa vào thùng rác nào nhỉ?",
    ["Which", "bin", "cardboard", "box"], ["cardboard", "bin", "trash"],
    "Hỏi lựa chọn: <b>Which bin should I use for …?</b> (Tôi nên dùng thùng nào cho …?).",
    ["Which bin should I use", "for a cardboard juice box?"], ["box", "books", "backs"],
    ["Put <b>cardboard and paper</b> in the green bin.", "Check the <b>recycling label</b> on the lid."],
    ["check the recycling symbols", "check which recycling bin takes cardboard", "xem nhãn hướng dẫn phân loại rác"]),

  /* 11. picnicmat (+5) */
  pkQ("spread_picnic_mat", "picnicmat", "pk_picnic", "bend", "pk_mat_spread", "yes",
    "Spread the picnic blanket", "Trải thảm dã ngoại",
    "Let's spread this checkered blanket on the soft green grass.",
    "Hãy trải tấm thảm kẻ ca-rô này lên bãi cỏ xanh mềm mại nhé.",
    ["spread", "checkered", "blanket", "grass"], ["checkered", "blanket", "park"],
    "<b>spread a blanket</b> = trải thảm/chăn ra; <b>checkered</b> = hoạ tiết kẻ ô vuông ca-rô.",
    ["Let's spread this checkered blanket", "on the soft green grass."], ["spread", "bread", "thread"],
    ["We <b>spread our blanket</b> under the oak tree.", "The grass is dry and <b>soft</b>."],
    ["spread the picnic blanket", "spread a checkered picnic blanket on the lawn", "trải thảm dã ngoại trên cỏ"]),

  pkQ("unpack_picnic_basket", "picnicmat", "pk_picnic", "bend", "pk_basket_unpacked", "yes",
    "Unpack the picnic basket", "Mở giỏ đồ ăn dã ngoại",
    "I packed fresh fruit salad and cheese sandwiches in our basket.",
    "Tôi đã chuẩn bị salad trái cây tươi và bánh mì kẹp phô mai trong giỏ dã ngoại.",
    ["packed", "fresh", "fruit", "basket"], ["basket", "eat", "freshair"],
    "<b>pack</b> (xếp đồ vào) ↔ <b>unpack</b> (lấy đồ ra khỏi giỏ/túi).",
    ["I packed fresh fruit salad", "and cheese sandwiches in our basket."], ["basket", "blanket", "bucket"],
    ["Let's <b>unpack the picnic basket</b>!", "Homemade sandwiches taste great <b>outdoors</b>."],
    ["unpack the picnic basket", "unpack sandwiches and fruit from the picnic basket", "mở giỏ đồ ăn dã ngoại"]),

  pkQ("share_apple_slices", "picnicmat", "pk_picnic", "reach", "pk_fruit_shared", "yes",
    "Share crisp apple slices", "Mời bạn ăn táo cắt lát",
    "Would you like some crisp apple slices and sweet grapes?",
    "Bạn có muốn ăn vài lát táo giòn ngọt và nho tươi không?",
    ["Would", "like", "crisp", "apple"], ["crisp", "share", "eat"],
    "Mời đồ ăn lịch sự: <b>Would you like some …?</b> — trả lời: <b>Yes, please!</b> hoặc <b>No, thank you.</b>",
    ["Would you like some crisp apple slices", "and sweet grapes?"], ["crisp", "clip", "chip"],
    ["These red apples are so <b>crisp and juicy</b>.", "<b>Would you like</b> a sandwich?"],
    ["share crisp apple slices", "share crisp apple slices on the picnic mat", "mời bạn ăn táo giòn trên thảm"]),

  pkQ("relax_on_picnic_mat", "picnicmat", "pk_picnic", "read", "pk_cloud_watch", "yes",
    "Watch the white clouds", "Nằm ngắm mây trời",
    "It feels wonderful to lie back on the blanket and watch the clouds.",
    "Cảm giác thật tuyệt khi ngả lưng trên thảm và ngắm nhìn những đám mây trôi.",
    ["wonderful", "blanket", "watch", "clouds"], ["blanket", "cloud", "relax"],
    "Cấu trúc cảm nhận: <b>It feels + tính từ + to V</b> (Cảm giác thật … khi làm gì).",
    ["It feels wonderful to lie back", "on the blanket and watch the clouds."], ["cloud", "crowd", "loud"],
    ["That fluffy <b>cloud</b> looks like a rabbit!", "<b>It feels great to</b> relax outdoors."],
    ["watch the white clouds", "relax on the picnic blanket and watch the clouds", "ngả lưng ngắm mây trời"]),

  pkQ("shake_off_picnic_mat", "picnicmat", "pk_picnic", "reach", "pk_mat_clean", "yes",
    "Shake off the blanket", "Giũ sạch lá khô trên thảm",
    "Let's shake the dry leaves off the blanket before folding it up.",
    "Hãy giũ sạch lá khô trên thảm trước khi gấp gọn lại nhé.",
    ["shake", "leaves", "blanket", "folding"], ["shakeoff", "blanket", "tree"],
    "<b>shake A off B</b> = giũ sạch A khỏi B; <b>before + V-ing</b> = trước khi làm gì.",
    ["Let's shake the dry leaves off the blanket", "before folding it up."], ["shake", "shape", "shade"],
    ["<b>Shake the sand off</b> your towel.", "We folded the <b>picnic blanket</b> neatly."],
    ["shake off the blanket", "shake dry leaves off the picnic blanket", "giũ sạch thảm dã ngoại"]),

  /* 12. gazebo (+5) */
  pkQ("shelter_from_drizzle", "gazebo", "pk_gazebo", "point", "pk_shelter", "yes",
    "Take shelter from the drizzle", "Trú cơn mưa phùn",
    "It's starting to drizzle lightly, so let's take shelter in the gazebo.",
    "Trời bắt đầu lất phất mưa phùn nhẹ rồi, mình vào chòi gỗ trú mưa nhé.",
    ["drizzle", "lightly", "shelter", "gazebo"], ["drizzle", "shelter", "gazebo"],
    "Từ vựng thời tiết: <b>drizzle</b> = mưa phùn lất phất; <b>take shelter</b> = trú mưa/nắng.",
    ["It's starting to drizzle lightly,", "so let's take shelter in the gazebo."], ["drizzle", "puzzle", "dazzle"],
    ["We <b>took shelter</b> under the wooden roof.", "The light <b>drizzle</b> will pass in five minutes."],
    ["take shelter from the drizzle", "take shelter in the wooden gazebo during a light drizzle", "trú mưa phùn trong chòi nghỉ mát"]),

  pkQ("practice_yoga_gazebo", "gazebo", "pk_gazebo", "reach", "pk_yoga", "done",
    "Do gentle yoga stretches", "Tập giãn cơ yoga",
    "I'm doing deep breathing and gentle yoga stretches in the quiet pavilion.",
    "Tôi đang hít thở sâu và tập các động tác giãn cơ yoga nhẹ nhàng trong chòi nghỉ yên tĩnh.",
    ["deep", "breathing", "gentle", "yoga"], ["yoga", "stretch", "gentle"],
    "Tập luyện sức khoẻ: <b>do yoga / do stretches / do deep breathing</b>.",
    ["I'm doing deep breathing", "and gentle yoga stretches in the quiet pavilion."], ["stretch", "stress", "fetch"],
    ["Morning <b>yoga stretches</b> wake up your body.", "Find a peaceful spot to <b>stretch</b>."],
    ["do gentle yoga stretches", "practice deep breathing and yoga in the gazebo", "tập yoga và hít thở sâu"]),

  pkQ("enjoy_panoramic_view", "gazebo", "pk_gazebo", "point", "pk_gazebo_view", "seen",
    "Enjoy the park view", "Ngắm toàn cảnh công viên",
    "From this wooden gazebo, you can see the whole pond and flower garden.",
    "Từ chiếc chòi gỗ này, bạn có thể phóng tầm mắt ngắm trọn hồ nước và vườn hoa.",
    ["wooden", "gazebo", "whole", "pond"], ["gazebo", "panoramic", "pond"],
    "<b>the whole + danh từ số ít</b> = toàn bộ, trọn vẹn cả … (<i>the whole park / the whole pond</i>).",
    ["From this wooden gazebo,", "you can see the whole pond and flower garden."], ["whole", "hole", "hold"],
    ["The hill offers a <b>panoramic view</b>.", "We walked around <b>the whole park</b>."],
    ["enjoy the park view", "enjoy the panoramic view from the wooden gazebo", "ngắm toàn cảnh từ chòi gỗ"]),

  pkQ("chat_with_neighbor", "gazebo", "pk_gazebo", "point", "pk_neighbor_chat", "done",
    "Chat about the weather", "Trò chuyện về thời tiết",
    "Lovely weather today, isn't it? Not too humid and not too cold.",
    "Thời tiết hôm nay đẹp quá nhỉ? Không quá oi ẩm mà cũng chẳng quá lạnh.",
    ["Lovely", "weather", "humid", "cold"], ["humid", "cold", "freshair"],
    "Câu hỏi đuôi bắt chuyện tự nhiên: <b>Lovely weather today, isn't it?</b>; <b>humid</b> = ẩm ướt, oi bức.",
    ["Lovely weather today, isn't it?", "Not too humid and not too cold."], ["humid", "human", "humble"],
    ["It's much less <b>humid</b> than yesterday.", "<b>Nice day for a walk, isn't it?</b>"],
    ["chat about the weather", "chat with a neighbor about the pleasant weather", "trò chuyện về thời tiết dễ chịu"]),

  pkQ("sketch_park_scenery", "gazebo", "pk_gazebo", "read", "pk_sketch", "drawn",
    "Sketch the park scenery", "Vẽ ký hoạ phong cảnh",
    "I'm sketching the willow trees and the pond in my notebook.",
    "Tôi đang vẽ phác hoạ những rặng liễu và mặt hồ vào cuốn sổ tay.",
    ["sketching", "trees", "pond", "notebook"], ["sketch", "scenery", "pond"],
    "<b>sketch</b> = vẽ phác hoạ nhanh bằng bút chì; <b>scenery</b> (không đếm được) = phong cảnh thiên nhiên.",
    ["I'm sketching the willow trees", "and the pond in my notebook."], ["sketch", "stretch", "catch"],
    ["She loves <b>sketching outdoor scenery</b>.", "The park <b>scenery</b> changes every season."],
    ["sketch the park scenery", "sketch the peaceful pond scenery in a notebook", "vẽ phác hoạ phong cảnh công viên"]),

  /* 13. slide (+4) */
  pkQ("climb_slide_ladder", "slide", "pk_slide", "reach", "pk_slide_climb", "climbed",
    "Climb the slide ladder", "Trèo lên thang cầu trượt",
    "Hold the handrails carefully as you climb up the steps.",
    "Hãy vịn chắc tay vịn cầu thang khi trèo lên các bậc thang nhé.",
    ["Hold", "handrails", "carefully", "climb"], ["handrail", "ladder", "slide"],
    "<b>Hold the handrail</b> = vịn tay vịn cầu thang; <b>climb up the steps / ladder</b> = trèo lên bậc thang.",
    ["Hold the handrails carefully", "as you climb up the steps."], ["climb", "time", "crime"],
    ["Always <b>hold the handrail</b> on steep steps.", "The little boy <b>climbed up the ladder</b>."],
    ["climb the slide ladder", "carefully climb the steps of the playground slide", "trèo lên cầu thang cầu trượt"]),

  pkQ("slide_down_fast", "slide", "pk_slide", "reach", "pk_slid_down", "yes",
    "Slide down the chute", "Trượt xuống cầu trượt",
    "Wheee! The smooth yellow slide is super fast!",
    "Úi chà! Chiếc cầu trượt màu vàng trơn láng này trượt nhanh thật đấy!",
    ["smooth", "yellow", "slide", "fast"], ["smooth", "slide", "park"],
    "<b>slide down</b> = trượt xuống; tính từ <b>smooth</b> /smuːð/ = trơn láng, nhẵn mịn.",
    ["Wheee! The smooth yellow slide", "is super fast!"], ["slide", "side", "wide"],
    ["The kids love <b>sliding down</b> into the sandpit.", "The surface of the slide is <b>smooth</b>."],
    ["slide down the chute", "happily slide down the smooth playground slide", "trượt xuống cầu trượt"]),

  pkQ("check_slide_temperature", "slide", "pk_slide", "reach", "pk_slide_temp", "checked",
    "Check if the slide is hot", "Kiểm tra xem cầu trượt có nóng không",
    "Let me touch the slide first to make sure the sun didn't make it too hot.",
    "Để tôi chạm thử vào cầu trượt trước xem nắng có làm nó bị nóng quá không.",
    ["touch", "slide", "make", "sure", "hot"], ["slide", "heat", "cold"],
    "<b>make sure (that) …</b> = đảm bảo, kiểm tra chắc chắn rằng …",
    ["Let me touch the slide first", "to make sure the sun didn't make it too hot."], ["touch", "much", "such"],
    ["<b>Make sure</b> the slide is cool enough.", "The plastic gets warm <b>in the afternoon sun</b>."],
    ["check if the slide is hot", "touch the slide to make sure it is not too hot", "kiểm tra nhiệt độ mặt cầu trượt"]),

  pkQ("wipe_morning_dew", "slide", "pk_slide", "wipe", "pk_slide_wiped", "yes",
    "Wipe off the morning dew", "Lau khô sương sớm trên cầu trượt",
    "I'm wiping the morning dew off the slide with a dry tissue.",
    "Tôi đang dùng khăn giấy khô lau sạch lớp sương sớm đọng trên cầu trượt.",
    ["wiping", "morning", "dew", "slide"], ["wipe", "dew", "slide"],
    "<b>morning dew</b> = sương sớm đọng trên cỏ/đồ vật; <b>wipe … off</b> = lau sạch đi.",
    ["I'm wiping the morning dew", "off the slide with a dry tissue."], ["dew", "do", "new"],
    ["The grass is wet with <b>morning dew</b>.", "Let's <b>wipe the bench dry</b> before sitting."],
    ["wipe off the morning dew", "wipe the morning dew off the yellow slide", "lau khô sương sớm trên cầu trượt"]),

  /* 14. fitnessbar (+5) */
  pkQ("stretch_before_workout", "fitnessbar", "pk_fitness", "reach", "pk_stretched", "yes",
    "Stretch my muscles", "Khởi động giãn cơ trước khi tập",
    "I always stretch my shoulders and hamstrings before exercising outdoors.",
    "Tôi luôn giãn cơ vai và cơ đùi sau trước khi tập thể dục ngoài trời.",
    ["stretch", "shoulders", "hamstrings", "exercising"], ["stretch", "hamstring", "strength"],
    "Từ vựng thể chất: <b>stretch your muscles / shoulders / hamstrings</b> = kéo giãn cơ để tránh chấn thương.",
    ["I always stretch my shoulders and hamstrings", "before exercising outdoors."], ["stretch", "sketch", "fetch"],
    ["Don't forget to <b>warm up and stretch</b>.", "Stretching keeps your muscles <b>flexible</b>."],
    ["stretch my muscles", "stretch my shoulders and legs before exercising", "khởi động giãn cơ trước khi tập"]),

  pkQ("do_pull_ups", "fitnessbar", "pk_fitness", "reach", "pk_pullups", "done",
    "Do pull-ups on the high bar", "Hít xà đơn",
    "I'm doing ten pull-ups on the high horizontal bar to build strength.",
    "Tôi đang hít xà đơn mười cái trên thanh xà cao để rèn luyện sức mạnh cơ bắp.",
    ["doing", "pull-ups", "bar", "strength"], ["pullup", "strength", "energized"],
    "<b>do pull-ups / push-ups / sit-ups</b> (luôn dùng động từ <b>do</b>); <b>build strength</b> = tăng cường sức mạnh.",
    ["I'm doing ten pull-ups on the high horizontal bar", "to build strength."], ["bar", "car", "far"],
    ["How many <b>pull-ups</b> can you do?", "Outdoor exercise helps <b>build upper-body strength</b>."],
    ["do pull-ups on the high bar", "do ten pull-ups on the outdoor gym bar", "tập hít xà đơn"]),

  pkQ("do_push_ups_bar", "fitnessbar", "pk_fitness", "bend", "pk_pushups", "done",
    "Do incline push-ups", "Tập chống đẩy trên xà thấp",
    "Incline push-ups on the low bar are great for your chest and arms.",
    "Bài tập chống đẩy nghiêng trên thanh xà thấp rất tốt cho cơ ngực và cánh tay.",
    ["push-ups", "low", "bar", "arms"], ["pushup", "strength", "stretch"],
    "<b>be good / great for + bộ phận cơ thể</b> = rất tốt cho (tim mạch, cơ bắp, sức khoẻ).",
    ["Incline push-ups on the low bar", "are great for your chest and arms."], ["chest", "best", "rest"],
    ["Swimming is <b>great for your back</b>.", "Let's do two sets of <b>fifteen push-ups</b>."],
    ["do incline push-ups", "do incline push-ups on the low fitness bar", "tập chống đẩy trên xà thấp"]),

  pkQ("check_heart_rate", "fitnessbar", "pk_fitness", "point", "pk_heartrate", "checked",
    "Check my heart rate", "Kiểm tra nhịp tim sau khi tập",
    "My heart rate is up after that workout, and I feel so energized!",
    "Nhịp tim của tôi tăng lên sau bài tập vừa rồi, và tôi cảm thấy tràn đầy năng lượng!",
    ["heart", "rate", "workout", "energized"], ["heartrate", "energized", "strength"],
    "<b>heart rate / pulse</b> = nhịp tim; <b>feel energized</b> = cảm thấy khoẻ khoắn, tràn trề sinh lực.",
    ["My heart rate is up after that workout,", "and I feel so energized!"], ["heart", "hard", "part"],
    ["Cardio exercise raises your <b>heart rate</b>.", "A morning jog makes me <b>feel energized</b>."],
    ["check my heart rate", "check my heart rate on my watch after exercising", "kiểm tra nhịp tim sau khi tập"]),

  pkQ("cool_down_breathing", "fitnessbar", "pk_fitness", "reach", "pk_cooldown", "done",
    "Take a slow deep breath", "Hít thở sâu điều hoà nhịp thở",
    "Take a slow, deep breath in through your nose and exhale.",
    "Hãy hít vào thật chậm, thật sâu bằng mũi rồi từ từ thở ra.",
    ["slow", "deep", "breath", "exhale"], ["exhale", "freshair", "cooldown"],
    "Chú ý: <b>breath</b> /breθ/ (danh từ: hơi thở) ≠ <b>breathe</b> /briːð/ (động từ: hít thở); <b>inhale ↔ exhale</b>.",
    ["Take a slow, deep breath in", "through your nose and exhale."], ["breath", "bread", "breast"],
    ["<b>Take a deep breath</b> of fresh park air.", "Inhale slowly and <b>exhale</b> gently."],
    ["take a slow deep breath", "cool down with slow deep breathing", "hít thở sâu điều hoà sau khi tập"]),

  /* 15. birdhouse (+4) */
  pkQ("listen_to_birds_sing", "birdhouse", "pk_birdhouse", "point", "pk_birds_heard", "yes",
    "Listen to the birds chirp", "Nghe chim sẻ hót líu lo",
    "Listen! The little sparrows in the tree are chirping a cheerful melody.",
    "Lắng nghe kìa! Mấy chú chim sẻ nhỏ trên cây đang hót líu lo một giai điệu vui tươi.",
    ["Listen", "sparrows", "chirping", "melody"], ["sparrow", "chirp", "tree"],
    "<b>chirp / sing</b> = (chim) hót líu lo; <b>cheerful</b> = vui tươi, rộn ràng.",
    ["Listen! The little sparrows in the tree", "are chirping a cheerful melody."], ["chirp", "chip", "ship"],
    ["The birds start <b>chirping at dawn</b>.", "A family of <b>sparrows</b> lives in that oak tree."],
    ["listen to the birds chirp", "listen to the sparrows chirping in the tree", "lắng nghe tiếng chim hót trên cây"]),

  pkQ("fill_bird_feeder", "birdhouse", "pk_birdhouse", "reach", "pk_feeder_full", "yes",
    "Put seeds in the bird feeder", "Bỏ hạt vào khay cho chim ăn",
    "I'm pouring sunflower seeds into the wooden bird feeder.",
    "Tôi đang đổ hạt hướng dương vào chiếc khay gỗ cho chim ăn.",
    ["pouring", "sunflower", "seeds", "feeder"], ["sunflower", "feeder", "birdhouse"],
    "<b>bird feeder</b> = khay/hộp đựng hạt cho chim ăn; <b>birdhouse</b> = ngôi nhà gỗ nhỏ cho chim làm tổ.",
    ["I'm pouring sunflower seeds", "into the wooden bird feeder."], ["seed", "seat", "feed"],
    ["Wild birds love <b>sunflower seeds</b>.", "Hang the <b>bird feeder</b> on a shady branch."],
    ["put seeds in the bird feeder", "fill the wooden bird feeder with sunflower seeds", "đổ hạt hướng dương cho chim"]),

  pkQ("spot_bluebird_nest", "birdhouse", "pk_birdhouse", "point", "pk_bluebird", "spotted",
    "Spot a bird at the birdhouse", "Ngắm chim bay vào tổ gỗ",
    "Look up on that branch! A bluebird is flying into the birdhouse.",
    "Nhìn lên cành cây kia kìa! Một chú chim xanh đang bay vào ngôi nhà chim bằng gỗ.",
    ["Look", "branch", "flying", "birdhouse"], ["branch", "birdhouse", "tree"],
    "<b>look up</b> = nhìn lên cao; <b>on that branch</b> = ở trên cành cây đó.",
    ["Look up on that branch!", "A bluebird is flying into the birdhouse."], ["branch", "bench", "bunch"],
    ["A squirrel ran along <b>the tree branch</b>.", "We hung a painted <b>birdhouse</b> in the garden."],
    ["spot a bird at the birdhouse", "watch a bluebird fly into the wooden birdhouse", "ngắm chim bay vào nhà gỗ trên cây"]),

  pkQ("photograph_wild_bird", "birdhouse", "pk_birdhouse", "point", "pk_bird_photo", "taken",
    "Take a photo of a robin", "Chụp ảnh chú chim cổ đỏ",
    "Keep quiet so we don't scare the robin away while I take a photo.",
    "Giữ yên lặng nhé để tụi mình không làm chú chim cổ đỏ sợ bay mất khi tôi chụp ảnh.",
    ["quiet", "scare", "robin", "photo"], ["robin", "photo", "branch"],
    "<b>so (that) + mệnh đề</b> = để mà …; <b>scare … away</b> = làm (con vật) hoảng sợ bỏ chạy/bay đi.",
    ["Keep quiet so we don't scare", "the robin away while I take a photo."], ["scare", "share", "spare"],
    ["Walk softly so you don't <b>scare the birds away</b>.", "I got a clear <b>photo of the robin</b>!"],
    ["take a photo of a robin", "quietly photograph a wild robin on the branch", "chụp ảnh chú chim trên cành cây"]),

  /* 16. statue (+4) */
  pkQ("read_statue_plaque", "statue", "pk_statue", "read", "pk_plaque", "read",
    "Read the bronze plaque", "Đọc tấm biển đồng trên bệ tượng",
    "This bronze plaque tells the history of the city's oldest park.",
    "Tấm biển đồng này kể lại lịch sử của công viên lâu đời nhất thành phố.",
    ["bronze", "plaque", "history", "oldest"], ["plaque", "statue", "park"],
    "So sánh nhất: <b>the oldest park</b> (công viên lâu đời nhất); <b>plaque</b> /plæk/ = biển khắc chữ gắn trên tượng/tường.",
    ["This bronze plaque tells the history", "of the city's oldest park."], ["oldest", "coldest", "boldest"],
    ["Read the inscription on <b>the bronze plaque</b>.", "Green Park is <b>the oldest park</b> in town."],
    ["read the bronze plaque", "read the historical plaque on the park statue", "đọc tấm biển lịch sử trên tượng đài"]),

  pkQ("meet_friend_at_statue", "statue", "pk_statue", "point", "pk_meet_statue", "met",
    "Meet a friend at the statue", "Hẹn gặp bạn trước tượng đài",
    "Where are you? Let's meet right in front of the park statue!",
    "Bạn đang ở đâu thế? Mình hẹn gặp nhau ngay phía trước bức tượng công viên nhé!",
    ["Where", "meet", "front", "statue"], ["statue", "around", "park"],
    "Chỉ vị trí hẹn gặp rõ ràng: <b>right in front of …</b> = ngay phía trước …",
    ["Where are you? Let's meet", "right in front of the park statue!"], ["meet", "meat", "seat"],
    ["I'm standing <b>in front of the statue</b>.", "The statue is a popular <b>meeting spot</b>."],
    ["meet a friend at the statue", "wait to meet a friend in front of the statue", "hẹn gặp bạn trước tượng đài"]),

  pkQ("ask_statue_history", "statue", "pk_statue", "point", "pk_statue_ask", "asked",
    "Ask who built the monument", "Hỏi về lịch sử đài tưởng niệm",
    "Do you know who built this monument a hundred years ago?",
    "Bạn có biết ai đã xây dựng đài tưởng niệm này cách đây một trăm năm không?",
    ["know", "who", "built", "monument"], ["monument", "statue", "plaque"],
    "Khi <b>who</b> làm chủ ngữ trong câu hỏi gián tiếp: <i>Do you know <b>who built</b> this monument?</i>",
    ["Do you know who built", "this monument a hundred years ago?"], ["built", "bill", "belt"],
    ["This <b>monument</b> honors the park's founder.", "It was built <b>over a century ago</b>."],
    ["ask who built the monument", "ask about the history of the stone monument", "hỏi xem ai đã xây dựng tượng đài"]),

  pkQ("admire_stone_carving", "statue", "pk_statue", "reach", "pk_carving", "admired",
    "Admire the stone pedestal", "Chiêm ngưỡng bệ đá chạm khắc",
    "The carving on this stone pedestal is remarkably detailed.",
    "Những đường nét chạm khắc trên chiếc bệ đá này tinh xảo đến đáng kinh ngạc.",
    ["carving", "stone", "pedestal", "detailed"], ["carving", "pedestal", "statue"],
    "Trạng từ nhấn mạnh tính từ: <b>remarkably detailed / beautifully carved</b> (vô cùng chi tiết / chạm khắc tuyệt đẹp).",
    ["The carving on this stone pedestal", "is remarkably detailed."], ["stone", "bone", "cone"],
    ["The statue stands on a tall <b>stone pedestal</b>.", "Look at the floral <b>carving</b> around the base."],
    ["admire the stone pedestal", "admire the detailed carving on the statue base", "ngắm nét chạm khắc trên bệ tượng"]),

  /* 17. pondbridge (+5) */
  pkQ("walk_across_bridge", "pondbridge", "pk_bridge", "reach", "pk_bridge_walk", "crossed",
    "Walk across the wooden bridge", "Đi bộ qua cây cầu gỗ",
    "Let's walk across the arched wooden bridge over the pond.",
    "Mình cùng đi bộ qua cây cầu gỗ uốn vòm bắc ngang mặt hồ nhé.",
    ["walk", "across", "wooden", "bridge"], ["bridge", "pond", "path"],
    "Phân biệt: <b>walk across the bridge</b> (đi băng qua cầu) và <b>bridge over the pond</b> (cầu bắc qua hồ).",
    ["Let's walk across", "the arched wooden bridge over the pond."], ["bridge", "fridge", "ridge"],
    ["We <b>walked across the wooden bridge</b>.", "The bridge goes <b>over the duck pond</b>."],
    ["walk across the wooden bridge", "stroll across the arched bridge over the pond", "đi dạo qua cây cầu gỗ"]),

  pkQ("lean_on_bridge_railing", "pondbridge", "pk_bridge", "reach", "pk_bridge_lean", "leaned",
    "Lean on the wooden railing", "Tựa vào lan can cầu ngắm hồ",
    "I'm leaning on the wooden railing and watching the water ripple.",
    "Tôi đang tựa vào lan can gỗ và ngắm mặt nước gợn sóng lăn tăn.",
    ["leaning", "railing", "watching", "ripple"], ["railing", "ripple", "bridge"],
    "<b>lean on …</b> = tựa người vào …; <b>ripple</b> = gợn sóng lăn tăn trên mặt nước.",
    ["I'm leaning on the wooden railing", "and watching the water ripple."], ["lean", "clean", "mean"],
    ["Don't climb on <b>the bridge railing</b>.", "A falling leaf made the pond water <b>ripple</b>."],
    ["lean on the wooden railing", "lean on the bridge railing and watch the pond", "tựa lan can cầu ngắm mặt nước"]),

  pkQ("feel_cool_breeze", "pondbridge", "pk_bridge", "point", "pk_breeze_felt", "yes",
    "Feel the cool pond breeze", "Đón làn gió mát từ mặt hồ",
    "There is a refreshing breeze blowing across the water.",
    "Có một làn gió mát rượi đang thổi qua mặt nước hồ.",
    ["refreshing", "breeze", "blowing", "water"], ["refreshing", "breeze", "water"],
    "<b>breeze</b> = làn gió nhẹ dễ chịu (nhẹ hơn <i>wind</i>); <b>blow across …</b> = thổi ngang qua.",
    ["There is a refreshing breeze", "blowing across the water."], ["breeze", "freeze", "trees"],
    ["Enjoy the <b>cool evening breeze</b> on the bridge.", "A gentle <b>breeze</b> rustled the leaves."],
    ["feel the cool pond breeze", "enjoy the refreshing breeze on the pond bridge", "đón làn gió mát trên cầu"]),

  pkQ("watch_sunset_reflection", "pondbridge", "pk_bridge", "point", "pk_reflection", "watched",
    "Watch the sunlight on the water", "Ngắm nắng phản chiếu trên mặt hồ",
    "The golden sunlight reflects beautifully on the calm pond surface.",
    "Ánh nắng vàng óng phản chiếu tuyệt đẹp trên mặt hồ phẳng lặng.",
    ["golden", "sunlight", "reflects", "calm"], ["reflection", "pond", "bridge"],
    "<b>reflect on …</b> (động từ) = phản chiếu lên; <b>reflection</b> (danh từ) = hình ảnh phản chiếu.",
    ["The golden sunlight reflects beautifully", "on the calm pond surface."], ["calm", "palm", "warm"],
    ["You can see the trees' <b>reflection in the pond</b>.", "The water is <b>calm and clear</b>."],
    ["watch the sunlight on the water", "watch the golden reflection on the calm pond", "ngắm ánh nắng phản chiếu trên hồ"]),

  pkQ("take_bridge_selfie", "pondbridge", "pk_bridge", "point", "pk_bridge_selfie", "taken",
    "Take a selfie on the bridge", "Chụp ảnh selfie trên cầu gỗ",
    "The wooden bridge makes a gorgeous background for our group photo!",
    "Cây cầu gỗ tạo nên một phông nền tuyệt đẹp cho bức ảnh chụp chung của tụi mình!",
    ["wooden", "bridge", "background", "photo"], ["bridge", "selfie", "photo"],
    "<b>make a great / gorgeous background for …</b> = tạo nên một phông nền tuyệt đẹp cho (bức ảnh).",
    ["The wooden bridge makes a gorgeous background", "for our group photo!"], ["group", "soup", "scoop"],
    ["Let's <b>take a quick selfie</b> on the bridge!", "The pond is in <b>the background</b>."],
    ["take a selfie on the bridge", "take a smiling selfie on the wooden bridge", "chụp ảnh kỷ niệm trên cầu gỗ"]),

  /* 18. kitehill (+5) */
  pkQ("check_wind_direction", "kitehill", "pk_kite", "point", "pk_wind_check", "checked",
    "Check the wind on the hill", "Kiểm tra hướng gió trên đồi",
    "The wind is blowing steadily from the east—perfect for flying a kite!",
    "Gió đang thổi đều từ hướng đông — cực kỳ lý tưởng để thả diều!",
    ["wind", "blowing", "steadily", "kite"], ["breeze", "kite", "high"],
    "<b>perfect for + V-ing</b> = hoàn hảo/lý tưởng để làm gì; <b>fly a kite</b> = thả diều.",
    ["The wind is blowing steadily from the east—", "perfect for flying a kite!"], ["kite", "bite", "white"],
    ["This open hill is <b>perfect for flying a kite</b>.", "Which way is <b>the wind blowing</b>?"],
    ["check the wind on the hill", "check the wind direction before flying a kite", "kiểm tra hướng gió trên đồi cỏ"]),

  pkQ("launch_colorful_kite", "kitehill", "pk_kite", "reach", "pk_kite_launched", "yes",
    "Launch the rainbow kite", "Thả cánh diều cầu vồng lên trời",
    "Run against the wind and let out the string to launch the kite!",
    "Hãy chạy ngược chiều gió và thả dần dây ra để đưa cánh diều bay lên!",
    ["Run", "wind", "string", "kite"], ["kite", "string", "air"],
    "Cách thả diều bằng tiếng Anh: <b>run against the wind</b> (chạy ngược gió) và <b>let out the string</b> (nới dài dây diều).",
    ["Run against the wind and let out the string", "to launch the kite!"], ["string", "spring", "bring"],
    ["Hold the <b>kite string</b> tightly.", "The breeze lifted <b>the kite</b> into the sky."],
    ["launch the rainbow kite", "run into the breeze to launch a colorful kite", "thả cánh diều cầu vồng lên cao"]),

  pkQ("fly_kite_high", "kitehill", "pk_kite", "point", "pk_kite_high", "yes",
    "Fly the kite high in the sky", "Cho diều bay vút lên cao",
    "Look how high our rainbow kite is soaring in the blue sky!",
    "Nhìn xem cánh diều cầu vồng của tụi mình đang bay vút cao trên bầu trời xanh kìa!",
    ["high", "rainbow", "kite", "soaring"], ["kite", "soar", "high"],
    "Câu cảm thán: <b>Look how + tính từ/trạng từ + S + V!</b>; <b>soar</b> = bay vút lên cao trên bầu trời.",
    ["Look how high our rainbow kite", "is soaring in the blue sky!"], ["soar", "sore", "shore"],
    ["Eagles <b>soar high</b> above the hills.", "Our <b>kite</b> is the highest one in the park!"],
    ["fly the kite high in the sky", "watch our rainbow kite soar high in the sky", "thả diều bay cao trên bầu trời"]),

  pkQ("reel_in_kite_string", "kitehill", "pk_kite", "reach", "pk_kite_reeled", "yes",
    "Wind up the kite string", "Cuộn dây thu diều về",
    "The wind is dying down, so I'm winding the kite string back onto the spool.",
    "Gió đang dịu dần rồi nên tôi đang cuộn dây diều thu lại vào ống cuộn.",
    ["wind", "winding", "string", "spool"], ["string", "spool", "kite"],
    "<b>die down</b> = (gió, bão, tiếng ồn) dịu dần, yếu dần; <b>spool / reel</b> = ống cuộn dây diều.",
    ["The wind is dying down,", "so I'm winding the kite string back onto the spool."], ["wind", "win", "wing"],
    ["Wait until the wind <b>dies down</b>.", "Keep the <b>kite string</b> neat on the spool."],
    ["wind up the kite string", "wind the kite string back onto the spool", "cuộn dây thu diều xuống"]),

  pkQ("catch_frisbee_hill", "kitehill", "pk_kite", "reach", "pk_frisbee", "caught",
    "Catch a flying frisbee", "Bắt đĩa bay frisbee trên đồi",
    "Nice throw! I caught the frisbee right at the top of the hill.",
    "Cú ném đẹp lắm! Tôi đã bắt gọn chiếc đĩa bay ngay trên đỉnh đồi.",
    ["Nice", "caught", "frisbee", "hill"], ["frisbee", "high", "park"],
    "Khen khi chơi thể thao: <b>Nice throw! / Good catch!</b>; quá khứ của <i>catch</i> là <b>caught</b> /kɔːt/.",
    ["Nice throw! I caught the frisbee", "right at the top of the hill."], ["caught", "coat", "court"],
    ["Let's toss a <b>frisbee</b> on the open lawn.", "She <b>caught the frisbee</b> with one hand!"],
    ["catch a flying frisbee", "catch a frisbee on the grassy hill", "chơi ném bắt đĩa bay trên đồi"]),

  /* 19. chessboard (+4) */
  pkQ("set_up_chess_pieces", "chessboard", "pk_chess", "reach", "pk_chess_setup", "yes",
    "Set up the chess pieces", "Xếp quân cờ trên bàn cờ đá",
    "I'm setting up the black and white chess pieces on the stone board.",
    "Tôi đang xếp các quân cờ đen và trắng lên mặt bàn cờ bằng đá.",
    ["setting", "up", "chess", "pieces"], ["chess", "bench", "park"],
    "<b>set up the board / the chess pieces</b> = bày bàn cờ, xếp quân cờ chuẩn bị chơi.",
    ["I'm setting up the black and white chess pieces", "on the stone board."], ["chess", "chest", "check"],
    ["Do you know how to <b>play chess</b>?", "Many seniors play <b>chess</b> at these stone tables."],
    ["set up the chess pieces", "set up the chess pieces on the stone table", "xếp quân cờ trên bàn đá"]),

  pkQ("invite_for_chess_game", "chessboard", "pk_chess", "point", "pk_chess_invite", "invited",
    "Invite someone for chess", "Mời bạn đánh một ván cờ vua",
    "Would you like to play a friendly game of chess with me?",
    "Bạn có muốn đánh một ván cờ vua giao hữu với tôi không?",
    ["Would", "play", "friendly", "chess"], ["chess", "share", "relax"],
    "Rủ ai cùng chơi: <b>Would you like to play a game of chess?</b>; <b>a friendly game</b> = ván đấu giao hữu vui vẻ.",
    ["Would you like to play", "a friendly game of chess with me?"], ["game", "name", "came"],
    ["Let's play <b>a quick game of chess</b>.", "You can play with <b>the white pieces</b>."],
    ["invite someone for chess", "invite a friend for a friendly game of chess", "mời bạn chơi một ván cờ vua"]),

  pkQ("make_opening_move", "chessboard", "pk_chess", "reach", "pk_chess_move", "moved",
    "Move a chess knight", "Đi nước cờ mở màn",
    "It's your turn to move! I just moved my knight forward.",
    "Đến lượt bạn đi cờ rồi đấy! Tôi vừa mới tiến quân mã lên phía trước.",
    ["your", "turn", "moved", "knight"], ["knight", "chess", "taketurns"],
    "Trong trò chơi theo lượt: <b>It's your turn!</b> (Đến lượt bạn!) / <b>It's my turn!</b>; <b>knight</b> /naɪt/ (âm k câm) = quân mã.",
    ["It's your turn to move!", "I just moved my knight forward."], ["knight", "light", "right"],
    ["Think carefully before you <b>make your move</b>.", "The <b>knight</b> jumps in an L-shape."],
    ["move a chess knight", "make an opening move on the stone chessboard", "đi một nước cờ mã"]),

  pkQ("congratulate_chess_winner", "chessboard", "pk_chess", "point", "pk_chess_won", "yes",
    "Say checkmate and good game", "Hô chiếu tướng và khen ván cờ hay",
    "Checkmate! That was a brilliant move—good game!",
    "Chiếu hết cờ nhé! Nước đi đó xuất sắc thật — một ván cờ rất hay!",
    ["Checkmate", "brilliant", "move", "game"], ["checkmate", "chess", "goodboy"],
    "Khi kết thúc ván cờ lịch sự: <b>Checkmate!</b> (Chiếu bí/hết cờ!) và bắt tay nói <b>Good game!</b>.",
    ["Checkmate! That was a brilliant move—", "good game!"], ["move", "love", "prove"],
    ["That was a <b>brilliant strategy</b>!", "They shook hands and said, <b>“Good game!”</b>"],
    ["say checkmate and good game", "finish an exciting chess game in the park", "hô chiếu tướng và bắt tay kết thúc ván cờ"]),

  /* 20. parklamp (+3) */
  pkQ("check_solar_panel", "parklamp", "pk_lamp", "point", "pk_solar_check", "checked",
    "Check the solar streetlamp", "Xem đèn đường năng lượng mặt trời",
    "This eco-friendly park lamp charges its battery using solar panels.",
    "Chiếc đèn công viên thân thiện môi trường này sạc pin bằng tấm năng lượng mặt trời.",
    ["eco-friendly", "lamp", "charges", "solar"], ["solar", "lamppost", "park"],
    "<b>eco-friendly</b> = thân thiện với môi trường; <b>solar panel</b> = tấm pin năng lượng mặt trời.",
    ["This eco-friendly park lamp", "charges its battery using solar panels."], ["solar", "polar", "collar"],
    ["<b>Solar panels</b> turn sunlight into electricity.", "The park installed new <b>solar streetlamps</b>."],
    ["check the solar streetlamp", "look at the solar panel on the park lamppost", "xem cột đèn năng lượng mặt trời"]),

  pkQ("read_evening_notice", "parklamp", "pk_lamp", "read", "pk_lamp_notice", "read",
    "Read the concert poster", "Đọc áp phích đêm nhạc trên cột đèn",
    "The notice on the lamppost says there's a free acoustic concert this Saturday.",
    "Tờ thông báo trên cột đèn ghi rằng thứ Bảy tuần này có một buổi nhạc mộc miễn phí.",
    ["notice", "lamppost", "free", "concert"], ["lamppost", "sign", "evening"],
    "<b>there's a … this Saturday</b> = có một sự kiện … vào thứ Bảy tuần này.",
    ["The notice on the lamppost says", "there's a free acoustic concert this Saturday."], ["free", "three", "tree"],
    ["Let's come back for <b>the outdoor concert</b>!", "A poster is pinned to <b>the lamppost</b>."],
    ["read the concert poster", "read the weekend concert notice on the lamppost", "đọc thông báo đêm nhạc cuối tuần"]),

  pkQ("stand_under_warm_lamp", "parklamp", "pk_lamp", "point", "pk_lamp_glow", "on",
    "Watch the lamps light up at dusk", "Ngắm đèn đường bật sáng lúc hoàng hôn",
    "The solar streetlamps turn on automatically when the sky gets dusk.",
    "Những chiếc đèn đường năng lượng mặt trời tự động bật sáng khi trời ngả hoàng hôn.",
    ["streetlamps", "automatically", "sky", "dusk"], ["solar", "lamppost", "dusk"],
    "<b>turn on automatically</b> = tự động bật lên; <b>at dusk</b> = vào lúc chạng vạng tối / hoàng hôn.",
    ["The solar streetlamps turn on automatically", "when the sky gets dusk."], ["dusk", "dust", "duck"],
    ["The park paths are well lit <b>at dusk</b>.", "The lights switch on <b>automatically</b>."],
    ["watch the lamps light up at dusk", "stand under the warm glow of the park streetlamp", "ngắm đèn công viên sáng lên lúc chạng vạng"])
];

/* ---------- SVG shell & world (1000×640, 2.5D outdoor park scene) ---------- */
const parkShell = `
 <defs>
  <linearGradient id="pkSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3fe"/><stop offset=".65" stop-color="#cdeeff"/><stop offset="1" stop-color="#e9f8e4"/></linearGradient>
  <linearGradient id="pkGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#87c96b"/><stop offset=".5" stop-color="#6db553"/><stop offset="1" stop-color="#559a3e"/></linearGradient>
  <linearGradient id="pkPath" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2dfc4"/><stop offset="1" stop-color="#dec19b"/></linearGradient>
  <radialGradient id="pkWater" cx=".5" cy=".45" r=".55"><stop offset="0" stop-color="#67c7eb"/><stop offset=".75" stop-color="#3a9fc9"/><stop offset="1" stop-color="#2a7ca1"/></radialGradient>
 </defs>
 <rect width="1000" height="330" fill="url(#pkSky)"/>
 <!-- Distant hills, clouds & city skyline silhouette -->
 <g data-detail="pk-clouds" fill="#fff" opacity=".88">
  <ellipse cx="180" cy="68" rx="52" ry="20"/><ellipse cx="212" cy="60" rx="38" ry="18"/><ellipse cx="152" cy="64" rx="32" ry="14"/>
  <ellipse cx="560" cy="54" rx="60" ry="22"/><ellipse cx="598" cy="48" rx="42" ry="18"/>
  <ellipse cx="830" cy="76" rx="48" ry="18"/><ellipse cx="862" cy="70" rx="34" ry="15"/>
 </g>
 <path d="M0 330 Q180 230 390 295 T780 275 T1000 305 L1000 340 L0 340 Z" fill="#9bd67d"/>
 <path d="M0 332 Q260 265 540 308 T1000 292 L1000 340 L0 340 Z" fill="#7ec262"/>
 <!-- Main grass lawn -->
 <rect y="325" width="1000" height="315" fill="url(#pkGrass)"/>
 <!-- Winding stone & gravel park pathway -->
 <path d="M0 595 Q180 560 320 520 Q490 475 680 515 Q840 545 1000 525 L1000 620 Q820 635 640 590 Q470 555 310 595 Q160 630 0 640 Z" fill="url(#pkPath)" stroke="#c7a982" stroke-width="3"/>
 <!-- Background trees & iron park fence -->
 <g data-detail="pk-fence" stroke="#3f5440" stroke-width="3" fill="none">
  <line x1="140" y1="304" x2="980" y2="304"/><line x1="140" y1="322" x2="980" y2="322"/>
  <path d="M160 296 V328 M200 296 V328 M240 296 V328 M280 296 V328 M320 296 V328 M360 296 V328 M400 296 V328 M440 296 V328 M480 296 V328 M520 296 V328 M560 296 V328 M600 296 V328 M640 296 V328 M680 296 V328 M720 296 V328 M760 296 V328 M800 296 V328 M840 296 V328 M880 296 V328 M920 296 V328 M960 296 V328"/>
 </g>
 <!-- Shade oak tree over the bench -->
 <g data-detail="pk-bigtree">
  <rect x="336" y="165" width="28" height="175" rx="8" fill="#6e472b"/>
  <path d="M350 210 L312 175 M350 198 L392 168" stroke="#6e472b" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="350" cy="145" rx="95" ry="62" fill="#3f8f42"/>
  <ellipse cx="305" cy="160" rx="65" ry="46" fill="#4da34f"/>
  <ellipse cx="398" cy="158" rx="68" ry="48" fill="#377d3a"/>
  <ellipse cx="350" cy="120" rx="72" ry="45" fill="#5cb85c"/>
 </g>
`;

const parkWorld = [
  /* 1. Park Gate & Map Board (left entrance) */
  objG("parkgate", "park gate", "cổng công viên", 560, 82, 305, `
    <rect class="hit" x="24" y="310" width="120" height="255"/>
    <rect x="34" y="320" width="14" height="220" rx="4" fill="#5c4028"/>
    <rect x="118" y="320" width="14" height="220" rx="4" fill="#5c4028"/>
    <path d="M26 332 Q83 288 140 332" fill="none" stroke="#3c6e3f" stroke-width="14" stroke-linecap="round"/>
    <rect x="44" y="305" width="78" height="26" rx="6" fill="#fff8e8" stroke="#5c4028" stroke-width="3"/>
    <text x="83" y="323" text-anchor="middle" font-size="13" font-weight="800" fill="#2f5e32">GREEN PARK</text>
    <!-- Map Stand -->
    <rect x="54" y="420" width="58" height="44" rx="5" fill="#fffdf6" stroke="#6e472b" stroke-width="3"/>
    <rect x="60" y="426" width="46" height="32" fill="#bfe6ba"/>
    <path d="M62 448 Q82 432 104 444" stroke="#d9b382" stroke-width="3" fill="none"/>
    <circle cx="88" cy="436" r="5" fill="#55a8d4"/><circle cx="72" cy="448" r="3" fill="#e05a4a"/>
    <rect x="79" y="464" width="8" height="58" fill="#6e472b"/>
    <g class="pk-mapTick"><circle cx="108" cy="422" r="10" fill="#2e9e5b"/><path d="M103 422 l3 3 l7 -7" stroke="#fff" stroke-width="2.2" fill="none"/></g>`),

  /* 2. Bicycle Rental Stand */
  objG("bikestand", "bicycle stand", "trạm xe đạp", 418, 200, 300, `
    <rect class="hit" x="148" y="312" width="112" height="112"/>
    <rect x="154" y="396" width="100" height="12" rx="5" fill="#5e6b73"/>
    <path d="M170 396 V374 a8 8 0 0 1 16 0 V396 M218 396 V374 a8 8 0 0 1 16 0 V396" stroke="#788791" stroke-width="4" fill="none"/>
    <!-- Bicycle -->
    <g class="pk-bikeVec">
      <circle cx="176" cy="384" r="18" fill="none" stroke="#2f3b4a" stroke-width="4"/>
      <circle cx="232" cy="384" r="18" fill="none" stroke="#2f3b4a" stroke-width="4"/>
      <path d="M176 384 L198 356 L226 356 L204 384 Z M198 356 L204 384 M226 356 L232 384" stroke="#e8743b" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M192 352 H206" stroke="#2f3b4a" stroke-width="4" stroke-linecap="round"/>
      <path d="M220 346 H234" stroke="#2f3b4a" stroke-width="4" stroke-linecap="round"/>
    </g>`),

  /* 3. Playground Swing */
  objG("swing", "playground swing", "xích đu sân chơi", 392, 486, 248, `
    <rect class="hit" x="434" y="256" width="104" height="142"/>
    <path d="M444 388 L464 268 L508 268 L528 388" stroke="#d96b43" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="458" y1="270" x2="514" y2="270" stroke="#f2a649" stroke-width="8" stroke-linecap="round"/>
    <g class="pk-swingSeat">
      <line x1="474" y1="272" x2="474" y2="352" stroke="#5d6770" stroke-width="2.5"/>
      <line x1="498" y1="272" x2="498" y2="352" stroke="#5d6770" stroke-width="2.5"/>
      <rect x="466" y="350" width="40" height="8" rx="4" fill="#2c7bb6"/>
    </g>`),

  /* 4. Park Bench under the shade tree */
  objG("parkbench", "park bench", "ghế đá công viên", 480, 356, 405, `
    <rect class="hit" x="292" y="412" width="128" height="76"/>
    <ellipse cx="356" cy="478" rx="64" ry="10" fill="#000" opacity=".16"/>
    <rect x="302" y="424" width="108" height="12" rx="4" fill="#b87442" stroke="#6e411f" stroke-width="2"/>
    <rect x="302" y="439" width="108" height="12" rx="4" fill="#b87442" stroke="#6e411f" stroke-width="2"/>
    <rect x="296" y="454" width="120" height="12" rx="5" fill="#cf8954" stroke="#6e411f" stroke-width="2"/>
    <path d="M310 422 V478 M402 422 V478 M298 446 H312 M400 446 H414" stroke="#3c464f" stroke-width="5" stroke-linecap="round"/>`),

  /* 5. Duck Pond */
  objG("duckpond", "duck pond", "hồ vịt", 442, 668, 345, `
    <rect class="hit" x="580" y="352" width="180" height="98"/>
    <ellipse cx="670" cy="404" rx="88" ry="42" fill="#c2b29b"/>
    <ellipse cx="670" cy="404" rx="80" ry="36" fill="url(#pkWater)"/>
    <!-- Reeds & lily pads -->
    <ellipse cx="618" cy="412" rx="11" ry="6" fill="#4ca64c"/><ellipse cx="722" cy="396" rx="10" ry="5" fill="#4ca64c"/>
    <!-- Ducks -->
    <g class="pk-ducks">
      <g transform="translate(652,396)">
        <ellipse cx="0" cy="4" rx="13" ry="8" fill="#fff8e7"/>
        <circle cx="10" cy="-4" r="7" fill="#2e7d47"/>
        <polygon points="16,-5 23,-3 16,-1" fill="#f59e0b"/>
      </g>
      <g transform="translate(684,408)">
        <ellipse cx="0" cy="3" rx="8" ry="5" fill="#fde047"/>
        <circle cx="6" cy="-2" r="4.5" fill="#fde047"/>
        <polygon points="10,-2 14,-1 10,0" fill="#f97316"/>
      </g>
      <g transform="translate(704,412)">
        <ellipse cx="0" cy="3" rx="8" ry="5" fill="#fde047"/>
        <circle cx="6" cy="-2" r="4.5" fill="#fde047"/>
        <polygon points="10,-2 14,-1 10,0" fill="#f97316"/>
      </g>
    </g>
    <g class="pk-crumbs"><circle cx="640" cy="414" r="2.2" fill="#f7d794"/><circle cx="648" cy="418" r="2" fill="#f7d794"/><circle cx="662" cy="415" r="2.2" fill="#f7d794"/></g>`),

  /* 6. Ice Cream Cart + Vendor NPC */
  objG("icecreamcart", "ice cream cart", "xe bán kem", 435, 862, 266, `
    <rect class="hit" x="792" y="274" width="140" height="168"/>
    <!-- Vendor NPC standing behind cart -->
    <g transform="translate(862,368)">
      <rect x="-14" y="-48" width="28" height="44" rx="10" fill="#ff6b81"/>
      <rect x="-11" y="-44" width="22" height="36" rx="4" fill="#fff" opacity=".9"/>
      <circle cx="0" cy="-68" r="18" fill="#f2c9a0"/>
      <path d="M-18 -72 Q0 -90 18 -72 Z" fill="#ff6b81"/>
      <circle cx="-6" cy="-68" r="2.2" fill="#2d2a26"/><circle cx="6" cy="-68" r="2.2" fill="#2d2a26"/>
      <path d="M-5 -59 Q0 -55 5 -59" stroke="#a3483b" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
    <!-- Striped Umbrella -->
    <line x1="862" y1="286" x2="862" y2="365" stroke="#6e472b" stroke-width="5"/>
    <path d="M796 312 Q862 264 928 312 Z" fill="#ff6b81" stroke="#d94b61" stroke-width="2"/>
    <path d="M822 312 Q862 272 862 312 M902 312 Q862 272 862 312" fill="#fff8f0" opacity=".85"/>
    <!-- Cart body -->
    <rect x="806" y="362" width="112" height="58" rx="8" fill="#fff9f2" stroke="#e58e9c" stroke-width="3"/>
    <rect x="812" y="368" width="100" height="20" rx="4" fill="#ffdde2"/>
    <text x="862" y="383" text-anchor="middle" font-size="12" font-weight="800" fill="#c43c54">ICE CREAM</text>
    <!-- Cones display -->
    <circle cx="834" cy="400" r="7" fill="#fff3c4"/><circle cx="862" cy="400" r="7" fill="#ff9eb5"/><circle cx="890" cy="400" r="7" fill="#8c583a"/>
    <circle cx="828" cy="422" r="16" fill="#4a5568" stroke="#fff" stroke-width="3"/>
    <circle cx="898" cy="422" r="16" fill="#4a5568" stroke="#fff" stroke-width="3"/>`),

  /* 7. Puppy & Leash */
  objG("puppy", "puppy & leash", "chú chó và dây dắt", 548, 286, 488, `
    <rect class="hit" x="244" y="492" width="88" height="68"/>
    <ellipse cx="288" cy="548" rx="28" ry="7" fill="#000" opacity=".18"/>
    <!-- Leash strap when attached -->
    <path class="pk-leashLine" d="M282 522 Q262 500 252 486" stroke="#e05a4a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <!-- Cute golden puppy -->
    <g class="pk-dogBody" transform="translate(288,538)">
      <ellipse cx="0" cy="-12" rx="20" ry="13" fill="#e6a145"/>
      <rect x="-15" y="-4" width="6" height="14" rx="3" fill="#d18b30"/>
      <rect x="-5" y="-4" width="6" height="14" rx="3" fill="#e6a145"/>
      <rect x="7" y="-4" width="6" height="14" rx="3" fill="#d18b30"/>
      <rect x="14" y="-4" width="6" height="14" rx="3" fill="#e6a145"/>
      <path class="pk-tail" d="M-18 -16 Q-28 -28 -22 -32" stroke="#d18b30" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="16" cy="-24" r="13" fill="#ebb05b"/>
      <ellipse cx="10" cy="-26" rx="5" ry="9" fill="#b87324"/>
      <circle cx="21" cy="-26" r="2.2" fill="#2b2118"/>
      <ellipse cx="27" cy="-22" rx="3.2" ry="2.2" fill="#2b2118"/>
      <rect x="9" y="-14" width="12" height="4" rx="2" fill="#e05a4a"/>
      <text class="pk-dogHeart" x="16" y="-42" text-anchor="middle" font-size="14">❤️</text>
    </g>`),

  /* 8. Flower Bed */
  objG("flowerbed", "flower bed", "luống hoa", 568, 540, 502, `
    <rect class="hit" x="478" y="508" width="126" height="66"/>
    <ellipse cx="540" cy="552" rx="60" ry="20" fill="#7c5032" stroke="#a6734d" stroke-width="4"/>
    <ellipse cx="540" cy="548" rx="54" ry="15" fill="#529e45"/>
    <g>
      <circle cx="504" cy="542" r="8" fill="#ff6b81"/><circle cx="504" cy="542" r="3" fill="#ffd32a"/>
      <circle cx="522" cy="536" r="8" fill="#ffd32a"/><circle cx="522" cy="536" r="3" fill="#e67e22"/>
      <circle cx="540" cy="544" r="8" fill="#a55eea"/><circle cx="540" cy="544" r="3" fill="#ffd32a"/>
      <circle cx="558" cy="536" r="8" fill="#ff7f50"/><circle cx="558" cy="536" r="3" fill="#fff"/>
      <circle cx="576" cy="542" r="8" fill="#ff6b81"/><circle cx="576" cy="542" r="3" fill="#ffd32a"/>
    </g>`),

  /* 9. Drinking Fountain */
  objG("fountain", "drinking fountain", "vòi nước uống", 554, 742, 466, `
    <rect class="hit" x="712" y="474" width="60" height="86"/>
    <ellipse cx="742" cy="552" rx="22" ry="6" fill="#000" opacity=".16"/>
    <rect x="730" y="498" width="24" height="54" rx="6" fill="#8fa3b0" stroke="#5c707d" stroke-width="2"/>
    <ellipse cx="742" cy="496" rx="22" ry="9" fill="#c2d1db" stroke="#5c707d" stroke-width="2"/>
    <path d="M748 492 Q742 478 734 492" stroke="#4cc3ff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`),

  /* 10. Park Recycling Bin */
  objG("parkbin", "recycling bin", "thùng rác công viên", 584, 916, 488, `
    <rect class="hit" x="884" y="494" width="64" height="94"/>
    <ellipse cx="916" cy="582" rx="24" ry="6" fill="#000" opacity=".18"/>
    <rect x="894" y="512" width="44" height="68" rx="6" fill="#2f855a" stroke="#1e563a" stroke-width="2.5"/>
    <path d="M890 512 H942 L936 498 H896 Z" fill="#38a169" stroke="#1e563a" stroke-width="2"/>
    <text x="916" y="554" text-anchor="middle" font-size="18">♻️</text>`),

  /* 11. Picnic Blanket & Basket */
  objG("picnicmat", "picnic blanket", "thảm dã ngoại", 518, 192, 452, `
    <rect class="hit" x="140" y="458" width="104" height="64"/>
    <polygon points="146,506 238,506 226,472 158,472" fill="#ff7675" stroke="#d63031" stroke-width="2.5"/>
    <line x1="175" y1="472" x2="168" y2="506" stroke="#fff" stroke-width="3" opacity=".75"/>
    <line x1="205" y1="472" x2="212" y2="506" stroke="#fff" stroke-width="3" opacity=".75"/>
    <line x1="152" y1="489" x2="232" y2="489" stroke="#fff" stroke-width="3" opacity=".75"/>
    <!-- Wicker Picnic Basket -->
    <rect x="186" y="468" width="32" height="22" rx="4" fill="#d99b52" stroke="#7c5021" stroke-width="2"/>
    <path d="M192 468 Q202 454 212 468" fill="none" stroke="#7c5021" stroke-width="2.5"/>`),

  /* 12. Wooden Gazebo */
  objG("gazebo", "wooden gazebo", "chòi nghỉ mát", 355, 282, 232, `
    <rect class="hit" x="234" y="240" width="96" height="118"/>
    <ellipse cx="282" cy="348" rx="46" ry="9" fill="#000" opacity=".15"/>
    <rect x="242" y="334" width="80" height="12" rx="3" fill="#a6734d" stroke="#5c3c24" stroke-width="2"/>
    <line x1="250" y1="280" x2="250" y2="334" stroke="#7c5032" stroke-width="5"/>
    <line x1="314" y1="280" x2="314" y2="334" stroke="#7c5032" stroke-width="5"/>
    <line x1="250" y1="314" x2="314" y2="314" stroke="#8c5a36" stroke-width="4"/>
    <polygon points="234,282 282,246 330,282" fill="#b85d3b" stroke="#6e321c" stroke-width="2.5"/>`),

  /* 13. Playground Slide */
  objG("slide", "playground slide", "cầu trượt sân chơi", 394, 558, 268, `
    <rect class="hit" x="522" y="276" width="76" height="120"/>
    <!-- Ladder steps -->
    <line x1="530" y1="386" x2="540" y2="298" stroke="#4a6984" stroke-width="4"/>
    <line x1="546" y1="386" x2="554" y2="298" stroke="#4a6984" stroke-width="4"/>
    <path d="M532 368 H548 M535 346 H550 M538 324 H552" stroke="#4a6984" stroke-width="3"/>
    <!-- Yellow Slide Chute -->
    <path d="M548 302 Q568 345 592 386" stroke="#f6b93b" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M548 302 Q568 345 592 386" stroke="#fa983a" stroke-width="3" fill="none" stroke-linecap="round"/>`),

  /* 14. Outdoor Gym Bars */
  objG("fitnessbar", "outdoor gym bars", "xà đơn tập thể dục", 358, 628, 252, `
    <rect class="hit" x="592" y="260" width="72" height="98"/>
    <line x1="602" y1="270" x2="602" y2="352" stroke="#2f3640" stroke-width="5" stroke-linecap="round"/>
    <line x1="634" y1="270" x2="634" y2="352" stroke="#2f3640" stroke-width="5" stroke-linecap="round"/>
    <line x1="656" y1="304" x2="656" y2="352" stroke="#2f3640" stroke-width="5" stroke-linecap="round"/>
    <line x1="602" y1="276" x2="634" y2="276" stroke="#00a8ff" stroke-width="5" stroke-linecap="round"/>
    <line x1="634" y1="310" x2="656" y2="310" stroke="#00a8ff" stroke-width="5" stroke-linecap="round"/>`),

  /* 15. Wooden Birdhouse on Tree Branch */
  objG("birdhouse", "wooden birdhouse", "nhà chim trên cây", 360, 404, 152, `
    <rect class="hit" x="374" y="160" width="58" height="72"/>
    <line x1="402" y1="168" x2="402" y2="186" stroke="#5c4028" stroke-width="2.5"/>
    <rect x="388" y="194" width="28" height="26" rx="3" fill="#f3a683" stroke="#7c4a2d" stroke-width="2"/>
    <polygon points="383,196 402,180 421,196" fill="#cf6a87" stroke="#7c2d46" stroke-width="2"/>
    <circle cx="402" cy="206" r="5" fill="#3d2616"/>
    <!-- Little bluebird perched -->
    <circle cx="418" cy="208" r="5.5" fill="#38ada9"/><polygon points="423,207 428,209 423,210" fill="#f6b93b"/>`),

  /* 16. Park Statue & Pedestal */
  objG("statue", "park statue", "tượng đài công viên", 478, 444, 378, `
    <rect class="hit" x="414" y="384" width="60" height="96"/>
    <ellipse cx="444" cy="474" rx="28" ry="7" fill="#000" opacity=".18"/>
    <rect x="424" y="438" width="40" height="34" rx="3" fill="#b2bec3" stroke="#636e72" stroke-width="2"/>
    <rect x="430" y="446" width="28" height="14" rx="2" fill="#d1a359"/>
    <!-- Bronze bust/figure -->
    <path d="M432 438 C432 418 456 418 456 438 Z" fill="#576574" stroke="#2f3640" stroke-width="2"/>
    <circle cx="444" cy="406" r="10" fill="#576574" stroke="#2f3640" stroke-width="2"/>`),

  /* 17. Wooden Bridge over the Pond */
  objG("pondbridge", "wooden bridge", "cầu gỗ qua hồ", 435, 670, 318, `
    <rect class="hit" x="614" y="324" width="112" height="54"/>
    <path d="M618 368 Q670 338 722 368" fill="none" stroke="#8c583a" stroke-width="10" stroke-linecap="round"/>
    <path d="M620 348 Q670 318 720 348" fill="none" stroke="#a66d4b" stroke-width="4" stroke-linecap="round"/>
    <line x1="632" y1="342" x2="632" y2="362" stroke="#6e4124" stroke-width="3"/>
    <line x1="656" y1="334" x2="656" y2="354" stroke="#6e4124" stroke-width="3"/>
    <line x1="684" y1="334" x2="684" y2="354" stroke="#6e4124" stroke-width="3"/>
    <line x1="708" y1="342" x2="708" y2="362" stroke="#6e4124" stroke-width="3"/>`),

  /* 18. Windy Hill & Rainbow Kite */
  objG("kitehill", "windy hill & kite", "đồi thả diều", 342, 748, 206, `
    <rect class="hit" x="708" y="214" width="82" height="128"/>
    <path d="M744 330 Q736 286 754 246" stroke="#fff" stroke-width="1.8" stroke-dasharray="3 2" fill="none"/>
    <!-- Diamond Rainbow Kite -->
    <polygon points="754,220 772,238 754,260 736,238" fill="#ff6b6b" stroke="#2d3436" stroke-width="2"/>
    <polygon points="754,220 772,238 754,238" fill="#feca57"/>
    <polygon points="754,238 772,238 754,260" fill="#48dbfb"/>
    <path d="M754 260 Q764 274 756 288" stroke="#ff9ff3" stroke-width="3" fill="none"/>`),

  /* 19. Stone Chess Table */
  objG("chessboard", "stone chess table", "bàn cờ đá", 582, 154, 520, `
    <rect class="hit" x="114" y="526" width="82" height="62"/>
    <ellipse cx="154" cy="580" rx="34" ry="7" fill="#000" opacity=".16"/>
    <!-- Stools -->
    <rect x="120" y="556" width="14" height="20" rx="3" fill="#95a5a6" stroke="#576574" stroke-width="2"/>
    <rect x="174" y="556" width="14" height="20" rx="3" fill="#95a5a6" stroke="#576574" stroke-width="2"/>
    <!-- Table & Board -->
    <rect x="148" y="550" width="12" height="28" fill="#7f8c8d"/>
    <rect x="132" y="540" width="44" height="12" rx="3" fill="#bdc3c7" stroke="#576574" stroke-width="2"/>
    <rect x="140" y="542" width="28" height="6" fill="#2c3e50"/>`),

  /* 20. Solar Park Streetlamp */
  objG("parklamp", "solar streetlamp", "đèn đường năng lượng mặt trời", 535, 640, 412, `
    <rect class="hit" x="614" y="420" width="52" height="120"/>
    <ellipse cx="640" cy="532" rx="16" ry="5" fill="#000" opacity=".18"/>
    <line x1="640" y1="436" x2="640" y2="532" stroke="#2d3436" stroke-width="5" stroke-linecap="round"/>
    <!-- Solar Panel Top -->
    <polygon points="626,432 654,426 658,434 630,440" fill="#0984e3" stroke="#2d3436" stroke-width="1.8"/>
    <!-- Warm Lamp Globe -->
    <circle cx="640" cy="448" r="9" fill="#ffeaa7" stroke="#fdcb6e" stroke-width="2"/>`)
].join("\n");

const PK_PROPS = {
  pk_ballP: `<circle cx="0" cy="0" r="8" fill="#c6f64d" stroke="#5c8a1e" stroke-width="2"/>`,
  pk_crumbsP: `<g fill="#f5cd79"><circle cx="-4" cy="0" r="3"/><circle cx="4" cy="-3" r="2.5"/><circle cx="2" cy="4" r="3"/></g>`,
  pk_coneP: `<g><polygon points="-6,0 6,0 0,18" fill="#d99b52"/><circle cx="0" cy="-4" r="8" fill="#fff5cc"/></g>`
};

const parkCss = `
#room .pk-mapTick{display:none}#room [data-pk_map="read"] .pk-mapTick{display:inline}
#room .pk-leashLine{display:none}#room [data-pk_leash="on"] .pk-leashLine{display:inline}
#room .pk-dogHeart{display:none}#room [data-pk_doghappy="yes"] .pk-dogHeart{display:inline}
#room .pk-crumbs{display:none}#room [data-pk_ducks="fed"] .pk-crumbs{display:inline}
#room [data-pk_bike="ridden"] .pk-bikeVec{transform:translateX(6px)}
`;

const PK_W0 = {
  pk_map: "unread", pk_jog: "no", pk_leash: "off", pk_walked: "no", pk_fetch: "no", pk_pet: "no", pk_doghappy: "no",
  pk_ducks: "hungry", pk_watchducks: "no", pk_bike: "locked", pk_seat: "none", pk_read: "no", pk_swing: "no",
  pk_flowers: "fresh", pk_photo: "no", pk_vendor: "no", pk_icecream: "none", pk_wrapper: "none", pk_water: "no", pk_trash: "none",
  /* Expanded state keys for 85 new actions */
  pk_hours: "no", pk_rules: "no", pk_restroom_way: "no", pk_weather_board: "no", pk_sunscreen: "no",
  pk_dog_water: "no", pk_dog_treat: "no", pk_dog_breed: "no", pk_dog_brushed: "no",
  pk_turtle: "no", pk_koifish: "no", pk_frogs: "no", pk_duck_ask: "no",
  pk_helmet_on: "no", pk_tires: "no", pk_saddle: "no", pk_bike_returned: "no",
  pk_bench_shared: "no", pk_shoelace: "no", pk_podcast: "no", pk_rest_legs: "no",
  pk_swing_push: "no", pk_swing_turns: "no", pk_swing_safe: "no", pk_swing_slow: "no",
  pk_butterfly: "no", pk_plant_tag: "no", pk_pollen: "no", pk_roses: "no",
  pk_ic_price: "no", pk_sorbet: "no", pk_napkin: "no", pk_vendor_paid: "no",
  pk_bottle_refill: "no", pk_hands_rinsed: "no", pk_face_cooled: "no", pk_fountain_btn: "no",
  pk_plastic_sorted: "no", pk_litter_picked: "no", pk_dog_bag: "no", pk_bin_labels: "no",
  pk_mat_spread: "no", pk_basket_unpacked: "no", pk_fruit_shared: "no", pk_cloud_watch: "no", pk_mat_clean: "no",
  pk_shelter: "no", pk_yoga: "no", pk_gazebo_view: "no", pk_neighbor_chat: "no", pk_sketch: "no",
  pk_slide_climb: "no", pk_slid_down: "no", pk_slide_temp: "no", pk_slide_wiped: "no",
  pk_stretched: "no", pk_pullups: "no", pk_pushups: "no", pk_heartrate: "no", pk_cooldown: "no",
  pk_birds_heard: "no", pk_feeder_full: "no", pk_bluebird: "no", pk_bird_photo: "no",
  pk_plaque: "no", pk_meet_statue: "no", pk_statue_ask: "no", pk_carving: "no",
  pk_bridge_walk: "no", pk_bridge_lean: "no", pk_breeze_felt: "no", pk_reflection: "no", pk_bridge_selfie: "no",
  pk_wind_check: "no", pk_kite_launched: "no", pk_kite_high: "no", pk_kite_reeled: "no", pk_frisbee: "no",
  pk_chess_setup: "no", pk_chess_invite: "no", pk_chess_move: "no", pk_chess_won: "no",
  pk_solar_check: "no", pk_lamp_notice: "no", pk_lamp_glow: "no"
};

const park = {
  id: "park", topic: "park", name: "Park", nameVi: "Công viên", names: ["Park", "Công viên"],
  shellSvg: parkShell, worldSvg: parkWorld, W0: PK_W0,
  spots: {
    pk_door: { x: 96, y: 580, d: -1 },
    pk_bike: { x: 204, y: 442, d: -1 },
    pk_dog: { x: 252, y: 556, d: 1 },
    pk_bench: { x: 356, y: 492, d: -1 },
    pk_swing: { x: 486, y: 422, d: 1 },
    pk_flowers: { x: 540, y: 584, d: 1 },
    pk_pond: { x: 646, y: 462, d: 1 },
    pk_fountain: { x: 742, y: 566, d: -1 },
    pk_icecream: { x: 822, y: 458, d: 1 },
    pk_bin: { x: 896, y: 592, d: 1 },
    /* Spots for 10 new objects */
    pk_picnic: { x: 192, y: 528, d: 1 },
    pk_gazebo: { x: 282, y: 372, d: -1 },
    pk_slide: { x: 558, y: 416, d: 1 },
    pk_fitness: { x: 628, y: 370, d: 1 },
    pk_birdhouse: { x: 402, y: 382, d: 1 },
    pk_statue: { x: 444, y: 492, d: -1 },
    pk_bridge: { x: 670, y: 386, d: 1 },
    pk_kite: { x: 748, y: 358, d: 1 },
    pk_chess: { x: 154, y: 594, d: -1 },
    pk_lamp: { x: 640, y: 548, d: 1 }
  },
  obstacles: [
    { x1: 584, x2: 756, y1: 368, y2: 444 },
    { x1: 798, x2: 932, y1: 330, y2: 432 }
  ],
  entry: { x: 118, y: 602, d: 1 },
  objects: {
    parkgate: {
      en: "park gate", vi: "cổng công viên", ipa: "/pɑːk ɡeɪt/",
      acts: ["enter_the_park", "jog_around_park", "check_opening_hours", "read_park_rules", "ask_restroom_way", "check_weather_board", "apply_sunscreen_gate"]
    },
    puppy: {
      en: "puppy & leash", vi: "chú chó và dây dắt", ipa: "/ˈpʌp.i ən liːʃ/",
      acts: ["put_on_leash", "walk_the_dog", "throw_the_ball", "pet_the_puppy", "give_puppy_water", "give_dog_treat", "ask_dog_breed", "brush_puppy_fur"]
    },
    duckpond: {
      en: "duck pond", vi: "hồ vịt", ipa: "/dʌk pɑnd/",
      acts: ["feed_the_ducks", "watch_the_ducks", "spot_pond_turtle", "watch_koi_fish", "listen_to_frogs", "ask_feeding_ducks_ok"]
    },
    bikestand: {
      en: "bicycle stand", vi: "trạm xe đạp", ipa: "/ˈbaɪ.sɪ.kəl stænd/",
      acts: ["unlock_a_bike", "ride_a_bike", "put_on_bike_helmet", "check_bike_tires", "adjust_bike_seat", "return_rental_bike"]
    },
    parkbench: {
      en: "park bench", vi: "ghế đá công viên", ipa: "/pɑːk bentʃ/",
      acts: ["sit_on_bench", "read_on_bench", "ask_share_bench", "tie_running_shoelace", "listen_podcast_bench", "rest_tired_legs"]
    },
    swing: {
      en: "playground swing", vi: "xích đu sân chơi", ipa: "/ˈpleɪ.ɡraʊnd swɪŋ/",
      acts: ["sit_on_swing", "push_friend_swing", "take_turns_swing", "check_swing_chains", "slow_down_swing"]
    },
    flowerbed: {
      en: "flower bed", vi: "luống hoa", ipa: "/ˈflaʊ.ər bed/",
      acts: ["smell_the_flowers", "take_park_photo", "spot_yellow_butterfly", "read_plant_label", "sneeze_from_pollen", "admire_blooming_roses"]
    },
    icecreamcart: {
      en: "ice cream cart", vi: "xe bán kem", ipa: "/ˈaɪs kriːm kɑːt/",
      acts: ["greet_icecream_vendor", "buy_an_ice_cream", "eat_ice_cream", "ask_icecream_price", "order_strawberry_cup", "ask_for_extra_napkin_pk", "pay_vendor_cash"]
    },
    fountain: {
      en: "drinking fountain", vi: "vòi nước uống", ipa: "/ˈdrɪŋ.kɪŋ ˈfaʊn.tɪn/",
      acts: ["drink_from_fountain", "refill_water_bottle", "rinse_sticky_hands", "splash_cool_water_face", "check_water_pressure"]
    },
    parkbin: {
      en: "recycling bin", vi: "thùng rác công viên", ipa: "/riːˈsaɪ.klɪŋ bɪn/",
      acts: ["throw_away_wrapper", "sort_plastic_bottle", "pick_up_stray_litter", "dispose_dog_waste", "check_recycling_labels"]
    },
    picnicmat: {
      en: "picnic blanket", vi: "thảm dã ngoại", ipa: "/ˈpɪk.nɪk ˈblæŋ.kɪt/",
      acts: ["spread_picnic_mat", "unpack_picnic_basket", "share_apple_slices", "relax_on_picnic_mat", "shake_off_picnic_mat"]
    },
    gazebo: {
      en: "wooden gazebo", vi: "chòi nghỉ mát", ipa: "/ˈwʊd.ən ɡəˈziː.boʊ/",
      acts: ["shelter_from_drizzle", "practice_yoga_gazebo", "enjoy_panoramic_view", "chat_with_neighbor", "sketch_park_scenery"]
    },
    slide: {
      en: "playground slide", vi: "cầu trượt sân chơi", ipa: "/ˈpleɪ.ɡraʊnd slaɪd/",
      acts: ["climb_slide_ladder", "slide_down_fast", "check_slide_temperature", "wipe_morning_dew"]
    },
    fitnessbar: {
      en: "outdoor gym bars", vi: "xà đơn tập thể dục", ipa: "/ˌaʊtˈdɔː dʒɪm bɑːz/",
      acts: ["stretch_before_workout", "do_pull_ups", "do_push_ups_bar", "check_heart_rate", "cool_down_breathing"]
    },
    birdhouse: {
      en: "wooden birdhouse", vi: "nhà chim trên cây", ipa: "/ˈwʊd.ən ˈbɜːd.haʊs/",
      acts: ["listen_to_birds_sing", "fill_bird_feeder", "spot_bluebird_nest", "photograph_wild_bird"]
    },
    statue: {
      en: "park statue", vi: "tượng đài công viên", ipa: "/pɑːk ˈstætʃ.uː/",
      acts: ["read_statue_plaque", "meet_friend_at_statue", "ask_statue_history", "admire_stone_carving"]
    },
    pondbridge: {
      en: "wooden bridge", vi: "cầu gỗ qua hồ", ipa: "/ˈwʊd.ən brɪdʒ/",
      acts: ["walk_across_bridge", "lean_on_bridge_railing", "feel_cool_breeze", "watch_sunset_reflection", "take_bridge_selfie"]
    },
    kitehill: {
      en: "windy hill & kite", vi: "đồi thả diều", ipa: "/ˈwɪn.di hɪl ənd kaɪt/",
      acts: ["check_wind_direction", "launch_colorful_kite", "fly_kite_high", "reel_in_kite_string", "catch_frisbee_hill"]
    },
    chessboard: {
      en: "stone chess table", vi: "bàn cờ đá", ipa: "/stoʊn tʃes ˈteɪ.bəl/",
      acts: ["set_up_chess_pieces", "invite_for_chess_game", "make_opening_move", "congratulate_chess_winner"]
    },
    parklamp: {
      en: "solar streetlamp", vi: "đèn đường năng lượng mặt trời", ipa: "/ˈsoʊ.lər ˈstriːt.læmp/",
      acts: ["check_solar_panel", "read_evening_notice", "stand_under_warm_lamp"]
    }
  },
  actions: parkActions,
  props: PK_PROPS,
  applyState(W, root) { mirrorState(W, PK_W0, root); },
  css: parkCss,
  catalog: cat("pk_", [
    ["park", "/pɑːk/", "công viên", "place"], ["park gate", "/pɑːk ɡeɪt/", "cổng công viên", "place"],
    ["park bench", "/pɑːk bentʃ/", "ghế đá công viên", "furniture"], ["duck pond", "/dʌk pɑnd/", "hồ vịt", "place"],
    ["duck", "/dʌk/", "con vịt", "animal"], ["duckling", "/ˈdʌk.lɪŋ/", "vịt con", "animal"],
    ["puppy", "/ˈpʌp.i/", "chú chó con", "animal"], ["leash", "/liːʃ/", "dây dắt chó", "other"],
    ["bicycle", "/ˈbaɪ.sɪ.kəl/", "xe đạp", "equipment"], ["helmet", "/ˈhel.mət/", "mũ bảo hiểm", "other"],
    ["playground", "/ˈpleɪ.ɡraʊnd/", "sân chơi", "place"], ["swing", "/swɪŋ/", "xích đu", "equipment"],
    ["flower bed", "/ˈflaʊ.ər bed/", "luống hoa", "nature"], ["tree", "/triː/", "cái cây", "nature"],
    ["shade", "/ʃeɪd/", "bóng râm", "nature"], ["path", "/pɑːθ/", "lối đi bộ", "place"],
    ["ice cream cart", "/ˈaɪs kriːm kɑːt/", "xe bán kem", "equipment"], ["ice cream cone", "/ˈaɪs kriːm koʊn/", "kem ốc quế", "food"],
    ["drinking fountain", "/ˈdrɪŋ.kɪŋ ˈfaʊn.tɪn/", "vòi nước uống", "equipment"], ["recycling bin", "/riːˈsaɪ.klɪŋ bɪn/", "thùng rác tái chế", "other"],
    ["picnic blanket", "/ˈpɪk.nɪk ˈblæŋ.kɪt/", "thảm dã ngoại", "other"], ["gazebo", "/ɡəˈziː.boʊ/", "chòi nghỉ mát", "place"],
    ["slide", "/slaɪd/", "cầu trượt", "equipment"], ["birdhouse", "/ˈbɜːd.haʊs/", "nhà chim gỗ", "nature"],
    ["statue", "/ˈstætʃ.uː/", "tượng đài", "place"], ["wooden bridge", "/ˈwʊd.ən brɪdʒ/", "cầu gỗ", "place"],
    ["kite", "/kaɪt/", "con diều", "equipment"], ["chess", "/tʃes/", "cờ vua", "other"]
  ])
};

/* ---------- NPCs + vendor/jogger replies ---------- */
const NPCS = {
  vendor: { id: "vendor", name: "Ice Cream Vendor", role_vi: "Người bán kem", avatar: "🍦", voice: "young_male", room: "park",
    lines: {
      greet_icecream_vendor: { en: "Hi there! Today we have vanilla, chocolate, and fresh strawberry!", vi: "Chào bạn! Hôm nay có vị va-ni, sô-cô-la và dâu tươi nhé!" },
      buy_an_ice_cream: { en: "One scoop of vanilla in a crispy cone! Here you go — enjoy!", vi: "Một viên va-ni trong bánh ốc quế giòn rụm! Của bạn đây — chúc ngon miệng!" },
      eat_ice_cream: { en: "Glad you like it! It's homemade.", vi: "Mừng là bạn thích! Kem nhà làm đấy." },
      ask_icecream_price: { en: "A double scoop in a freshly baked waffle cone is four dollars!", vi: "Kem hai viên trong bánh ốc quế mới nướng là bốn đô-la nhé!" },
      order_strawberry_cup: { en: "One cup of fruity strawberry sorbet coming right up!", vi: "Một cốc kem dâu tây thanh mát có ngay đây!" },
      ask_for_extra_napkin_pk: { en: "Sure thing! Here are a few extra napkins for you.", vi: "Được chứ! Gửi bạn thêm mấy tờ khăn giấy đây." },
      pay_vendor_cash: { en: "Thank you so much! Enjoy the sunny afternoon!", vi: "Cảm ơn bạn nhiều nhé! Chúc buổi chiều nắng đẹp vui vẻ!" }
    } },
  jogger: { id: "jogger", name: "Park Jogger", role_vi: "Người đi dạo", avatar: "🏃", voice: "adult_female", room: "park",
    lines: {
      walk_the_dog: { en: "Aw, what a friendly puppy!", vi: "Ôi, chú chó thân thiện quá!" },
      throw_the_ball: { en: "Look how fast he runs!", vi: "Nhìn nó chạy nhanh chưa kìa!" },
      feed_the_ducks: { en: "The ducks love coming here in the morning.", vi: "Mấy chú vịt thích bơi lại đây vào buổi sáng lắm." },
      take_park_photo: { en: "Sure! Smile… one, two, three! Got it!", vi: "Được chứ! Cười lên nhé… một, hai, ba! Xong rồi!" },
      ask_restroom_way: { en: "It's right past the wooden gazebo on your left!", vi: "Nó nằm ngay qua khỏi chòi gỗ phía bên tay trái bạn nhé!" },
      ask_dog_breed: { en: "He's a Golden Retriever puppy — always full of energy!", vi: "Nó là giống chó Golden Retriever con — lúc nào cũng tràn đầy năng lượng!" },
      ask_share_bench: { en: "Not at all, please have a seat! There's plenty of shade.", vi: "Không có ai đâu, mời bạn ngồi nhé! Bóng cây râm mát rộng lắm." },
      invite_for_chess_game: { en: "I'd love to! Let's play a quick game.", vi: "Mình rất sẵn lòng! Cùng đánh một ván nhé." }
    } }
};
function reply(actionId) {
  for (const k of ["vendor", "jogger"]) {
    const l = NPCS[k].lines[actionId];
    if (l) return { who: NPCS[k].name, en: l.en, vi: l.vi };
  }
  return null;
}

/* ---------- missions (ELW_MISSION.register format) ---------- */
const VENDOR = { id: "vendor", name: "Vendor", avatar: "🍦", voice: "young_male" };
const ids = log => (log || []).map(x => x.id);
function story(log, headEn, headVi, parts, thEn, thVi) {
  const did = ids(log), en = [], vi = [];
  parts.forEach(p => { if (did.includes(p[0])) { en.push(p[1]); vi.push(p[2]); } });
  const j = (a, and) => a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " " + and + " " + a[a.length - 1];
  return { en: headEn + (en.length ? " I " + j(en, "and") + "." : ""), vi: headVi + (vi.length ? " Bạn đã " + j(vi, "và") + "." : ""), mom_en: thEn, mom_vi: thVi };
}
const st = (n, icon, ten, tvi, actions, done, next, hen, hvi) => ({ n, icon, title_en: ten, title_vi: tvi, say_en: ten + ".", say_vi: tvi + ".", actions, done, next: typeof next === "function" ? next : () => next, hint: { en: hen, vi: hvi } });

const MISSIONS = [
  { id: "park_walk_and_ducks", title_en: "Morning in the park", title_vi: "Buổi sáng ở công viên", room: "park", topic: "park", urgency: "normal", giver: VENDOR,
    desc_vi: "Dắt chó đi dạo, ném bóng cho chó, cho vịt ăn bên hồ rồi ngồi nghỉ trên ghế đá.",
    request: { en: "Lovely morning! Why not walk your dog and feed the ducks?", vi: "Sáng nay trời đẹp quá! Dắt chó đi dạo rồi cho vịt ăn nhé?" },
    steps: [
      st(1, "🐕", "Walk the dog", "Dắt chó đi dạo", ["walk_the_dog"], W => W.pk_walked === "yes", "walk_the_dog", "Click the puppy and choose Walk the dog.", "Nhấn vào chú chó và chọn Dắt chó đi dạo."),
      st(2, "🎾", "Play fetch", "Ném bóng cho chó", ["throw_the_ball"], W => W.pk_fetch === "yes", "throw_the_ball", "Throw the ball for the puppy.", "Ném bóng cho chú chó nhặt về."),
      st(3, "🦆", "Feed the ducks", "Cho vịt ăn", ["feed_the_ducks"], W => W.pk_ducks === "fed", "feed_the_ducks", "Go to the duck pond and feed the ducks.", "Tới hồ vịt và cho vịt ăn vụn bánh mì."),
      st(4, "🪑", "Sit on the bench", "Ngồi ghế đá", ["sit_on_bench"], W => W.pk_seat === "bench" && W.sitting, "sit_on_bench", "Sit down on the shady park bench.", "Ngồi nghỉ trên chiếc ghế đá dưới tán cây.")
    ],
    result: log => story(log, "What a relaxing morning in the park!", "Một buổi sáng ở công viên thật thư thái!", [["walk_the_dog", "walked my dog", "dắt chó đi dạo"], ["throw_the_ball", "played fetch", "chơi ném bóng"], ["feed_the_ducks", "fed the ducks", "cho vịt ăn"], ["sit_on_bench", "relaxed on a shady bench", "ngồi nghỉ trên ghế đá"]], "Have a wonderful day!", "Chúc bạn một ngày tuyệt vời!") },

  { id: "park_ice_cream_treat", title_en: "Ice cream break", title_vi: "Thưởng thức kem mát lạnh", room: "park", topic: "park", urgency: "normal", giver: VENDOR,
    desc_vi: "Hỏi các vị kem ở xe kem, mua một cây kem ốc quế, thưởng thức rồi bỏ giấy gói vào thùng rác.",
    request: { en: "Fresh homemade ice cream! Come try a cone!", vi: "Kem nhà làm tươi ngon đây! Lại thử một cây kem ốc quế nhé!" },
    steps: [
      st(1, "🗣️", "Ask about flavors", "Hỏi các vị kem", ["greet_icecream_vendor"], W => W.pk_vendor === "asked", "greet_icecream_vendor", "Ask the vendor what flavors he has.", "Hỏi người bán kem hôm nay có vị gì."),
      st(2, "🍦", "Buy an ice cream cone", "Mua kem ốc quế", ["buy_an_ice_cream"], W => W.pk_icecream === "have" || W.pk_icecream === "eaten", "buy_an_ice_cream", "Order one scoop of vanilla in a cone.", "Gọi một viên kem va-ni ốc quế."),
      st(3, "😋", "Eat my ice cream", "Ăn kem", ["eat_ice_cream"], W => W.pk_icecream === "eaten", "eat_ice_cream", "Enjoy your cold ice cream before it melts.", "Thưởng thức cây kem mát lạnh trước khi tan."),
      st(4, "♻️", "Throw away the wrapper", "Bỏ giấy gói vào thùng rác", ["throw_away_wrapper"], W => W.pk_trash === "binned", "throw_away_wrapper", "Put the wrapper in the recycling bin.", "Bỏ giấy gói vào thùng rác tái chế.")
    ],
    result: log => story(log, "That ice cream hit the spot!", "Cây kem mát lạnh thật tuyệt!", [["greet_icecream_vendor", "asked about the flavors", "hỏi các vị kem"], ["buy_an_ice_cream", "bought a vanilla cone", "mua kem ốc quế"], ["eat_ice_cream", "ate my ice cream", "ăn kem"], ["throw_away_wrapper", "recycled the wrapper", "bỏ giấy gói vào thùng rác"]], "Thanks for keeping the park clean!", "Cảm ơn bạn đã giữ công viên sạch đẹp!") },

  { id: "park_active_day", title_en: "Active day outdoors", title_vi: "Ngày vận động ngoài trời", room: "park", topic: "park", urgency: "normal", giver: VENDOR,
    desc_vi: "Xem bản đồ công viên, đạp xe vòng quanh, uống nước ở vòi và chụp ảnh bên luống hoa.",
    request: { en: "Great weather for a bike ride around the park!", vi: "Thời tiết tuyệt đẹp để đạp xe dạo quanh công viên!" },
    steps: [
      st(1, "🗺️", "Check the park map", "Xem bản đồ công viên", ["enter_the_park"], W => W.pk_map === "read", "enter_the_park", "Check the map at the park gate.", "Xem bản đồ ở cổng công viên."),
      st(2, "🚲", "Ride a bike", "Đạp xe dạo công viên", ["ride_a_bike"], W => W.pk_bike === "ridden", "ride_a_bike", "Rent and ride a bicycle around the path.", "Đạp xe vòng quanh lối đi công viên."),
      st(3, "🚰", "Drink from the fountain", "Uống nước ở vòi", ["drink_from_fountain"], W => W.pk_water === "drank", "drink_from_fountain", "Take a sip of water at the drinking fountain.", "Uống một ngụm nước mát ở vòi nước."),
      st(4, "📸", "Take a photo", "Chụp ảnh kỷ niệm", ["take_park_photo"], W => W.pk_photo === "yes", "take_park_photo", "Take a photo by the blooming flower bed.", "Chụp một bức ảnh kỷ niệm bên luống hoa.")
    ],
    result: log => story(log, "An active and sunny day at the park!", "Một ngày vận động tràn đầy năng lượng ở công viên!", [["enter_the_park", "checked the map", "xem bản đồ"], ["ride_a_bike", "rode a bike", "đạp xe"], ["drink_from_fountain", "drank some cool water", "uống nước mát"], ["take_park_photo", "took a photo by the flowers", "chụp ảnh bên luống hoa"]], "See you next time!", "Hẹn gặp lại lần sau nhé!") }
];

/* ---------- Life Challenges ---------- */
const T = (id, en, vi, anyOf, len, lvi, o) => Object.assign({ id, title_en: en, title_vi: vi, anyOf, learn_en: len, learn_vi: lvi }, o || {});
const CHALLENGES = [
  { id: "park_sunday_stroll", icon: "🌳", title_en: "Sunday Stroll in the Park", title_vi: "Dạo công viên ngày Chủ nhật", goal_vi: "Dắt chó đi dạo, cho vịt ăn, đạp xe và thưởng thức kem mát lạnh.", minutes: 7,
    requires: ["go_park", "walk_the_dog", "buy_an_ice_cream"], tasks: [
      T("map", "Check the park map", "Xem bản đồ", ["enter_the_park"], "entrance", "cổng vào", { free: true }),
      T("leash", "Put on the leash", "Đeo dây dắt", ["put_on_leash"], "leash", "dây dắt", { free: true }),
      T("walk", "Walk the dog", "Dắt chó đi dạo", ["walk_the_dog"], "for a walk", "đi dạo"),
      T("fetch", "Play fetch", "Chơi ném bóng", ["throw_the_ball"], "fetch", "nhặt bóng"),
      T("ducks", "Feed the ducks", "Cho vịt ăn", ["feed_the_ducks"], "bread crumbs", "vụn bánh mì"),
      T("bike", "Ride a bike", "Đạp xe", ["ride_a_bike"], "ride a bike", "đạp xe"),
      T("ask", "Ask about flavors", "Hỏi vị kem", ["greet_icecream_vendor"], "flavors", "hương vị"),
      T("ice", "Buy an ice cream cone", "Mua kem ốc quế", ["buy_an_ice_cream"], "one scoop of", "một viên kem"),
      T("eat", "Eat your ice cream", "Ăn kem", ["eat_ice_cream"], "refreshing", "sảng khoái"),
      T("bin", "Throw away the wrapper", "Bỏ rác vào thùng", ["throw_away_wrapper"], "recycling bin", "thùng rác tái chế")] }
];

/* ---------- register ---------- */
const NEW_ROOMS = { park };
const root = typeof window !== "undefined" ? window : globalThis;
root.ELW_ROOMS = Object.assign(root.ELW_ROOMS || {}, NEW_ROOMS);
root.ELW_PARK = { topic: "park", rooms: ["park"], missions: MISSIONS, challenges: CHALLENGES, reply, npcs: NPCS, room: park };
if (typeof module !== "undefined" && module.exports) module.exports = { ELW_PARK_ROOMS: NEW_ROOMS, missions: MISSIONS, challenges: CHALLENGES, reply, npcs: NPCS, room: park };
})();
