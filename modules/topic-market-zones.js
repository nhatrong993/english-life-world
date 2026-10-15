/* English Life World — Topic "Siêu thị / At the supermarket" — Multi-Zone Pilot (Lượt 2/3)
   Zones built in this module:
     1. market_entrance — Lối vào & Xe đẩy (Entrance & Carts): 21 objects, 42 actions, 30 NPC replies (72 sentences)
     2. market_produce  — Rau quả & Tiệm bánh (Produce & Bakery): 21 objects, 42 actions, 30 NPC replies (72 sentences)
     3. market_dairy    — Sữa, đông lạnh & đồ uống (Dairy, Frozen & Drinks): 21 objects, 42 actions, 30 NPC replies (72 sentences)
     4. market_meat     — Thịt cá & gia dụng (Meat, Fish & Household): 21 objects, 42 actions, 30 NPC replies (72 sentences)
   Remaining checkout/service zone stays in room "market" for Lượt 3.
   Load AFTER modules/topic-market.js. */
(function () {
"use strict";

const S = (typeof window !== "undefined" && window.ELW_MARKET_SHARED) || {};
const MK_W0 = S.MK_W0 || {};
const MKV = S.MKV || {};
const mkAct = S.mkAct;
const objG = S.objG;
const mirrorState = S.mirrorState;
const cat = S.cat;
const D = S.D;
const once = S.once;
const at = S.at;

if (!mkAct || !objG) return;

/* ---------- Additional Vocabulary for Zone 1..4 ---------- */
Object.assign(MKV, {
  mat: ["welcome mat", "/ˈwel.kəm mæt/", "thảm chào mừng", "n"],
  wipe_v: ["wipe", "/waɪp/", "chùi, lau", "v"],
  sanitizer: ["hand sanitizer", "/ˈhænd ˌsæn.ɪ.taɪ.zər/", "nước rửa tay khô", "n"],
  dispenser: ["dispenser", "/dɪˈspen.sər/", "hộp/cây lấy giấy hoặc dung dịch", "n"],
  deal: ["weekly deals", "/ˈwiːk.li diːlz/", "ưu đãi trong tuần", "n"],
  halfprice: ["half price", "/hɑːf praɪs/", "nửa giá (giảm 50%)", "n"],
  kiosk: ["coupon kiosk", "/ˈkuː.pɑn ˈkiː.ɑsk/", "cây in phiếu giảm giá", "n"],
  voucher: ["voucher", "/ˈvaʊ.tʃər/", "phiếu mua hàng giảm giá", "n"],
  directory: ["store directory", "/stɔːr dəˈrek.tər.i/", "bảng sơ đồ siêu thị", "n"],
  section: ["section", "/ˈsek.ʃən/", "khu vực, gian hàng", "n"],
  locker: ["parcel locker", "/ˈpɑː.səl ˈlɑk.ər/", "tủ gửi đồ", "n"],
  wristband: ["key wristband", "/kiː ˈrɪst.bænd/", "vòng đeo chìa khóa tủ", "n"],
  umbrella: ["umbrella", "/ʌmˈbrel.ə/", "chiếc ô / dù", "n"],
  sleeve: ["plastic sleeve", "/ˈplæs.tɪk sliːv/", "túi bọc ô ướt", "n"],
  tulip: ["tulips", "/ˈtjuː.lɪps/", "hoa tulip", "n"],
  bouquet: ["bouquet", "/buˈkeɪ/", "bó hoa tươi", "n"],
  sunflower: ["sunflowers", "/ˈsʌnˌflaʊ.əz/", "hoa hướng dương", "n"],
  greeter: ["welcome greeter", "/ˈwel.kəm ˈɡriː.tər/", "nhân viên đón khách", "n"],
  childseat: ["child seat", "/tʃaɪld siːt/", "ghế ngồi trẻ em", "n"],
  kiddie: ["kiddie cart", "/ˈkɪd.i kɑːt/", "xe đẩy trẻ em hình ô tô", "n"],
  totebag: ["canvas tote bag", "/ˈkæn.vəs toʊt bæɡ/", "túi vải bố", "n"],
  sturdy: ["sturdy", "/ˈstɜː.di/", "chắc chắn, bền", "adj"],
  banner: ["special offer", "/ˈspeʃ.əl ˈɑf.ər/", "ưu đãi đặc biệt", "n"],
  pastry: ["pastries", "/ˈpeɪ.striz/", "bánh ngọt nướng", "n"],
  atm: ["ATM", "/ˌeɪ.tiːˈem/", "cây rút tiền tự động", "n"],
  withdraw: ["withdraw", "/wɪðˈdrɔː/", "rút tiền", "v"],
  cooler: ["water cooler", "/ˈwɔː.tər ˈkuː.lər/", "bình nước uống", "n"],
  recycle: ["recycling bin", "/riːˈsaɪ.klɪŋ bɪn/", "thùng tái chế", "n"],
  bench: ["waiting bench", "/ˈweɪ.tɪŋ bentʃ/", "ghế chờ nghỉ chân", "n"],
  list: ["shopping list", "/ˈʃɑp.ɪŋ lɪst/", "danh sách đồ cần mua", "n"],
  /* Produce & Bakery */
  lemon: ["lemons", "/ˈlem.ənz/", "quả chanh vàng", "n"],
  tangerine: ["tangerines", "/ˌtæn.dʒəˈriːnz/", "quả quýt", "n"],
  peel: ["peel", "/piːl/", "bóc vỏ, gọt vỏ", "v"],
  blueberry: ["blueberries", "/ˈbluːˌber.iz/", "quả việt quất", "n"],
  cherry: ["cherries", "/ˈtʃer.iz/", "quả anh đào (cherry)", "n"],
  mist: ["cool mist", "/kuːl mɪst/", "làn sương mát", "n"],
  spinach: ["spinach", "/ˈspɪn.ɪtʃ/", "rau chân vịt (cải bó xôi)", "n"],
  crisp: ["crisp", "/krɪsp/", "tươi giòn", "adj"],
  romaine: ["romaine lettuce", "/roʊˈmeɪn ˈlet.ɪs/", "xà lách romaine", "n"],
  potato: ["potatoes", "/pəˈteɪ.toʊz/", "khoai tây", "n"],
  onion: ["red onions", "/red ˈʌn.jənz/", "hành tím", "n"],
  pesticide: ["pesticides", "/ˈpes.tɪ.saɪdz/", "thuốc trừ sâu", "n"],
  pineapple: ["pineapple", "/ˈpaɪnˌæp.əl/", "quả dứa (thơm)", "n"],
  dragonfruit: ["dragon fruit", "/ˈdræɡ.ən fruːt/", "quả thanh long", "n"],
  watermelon: ["watermelon", "/ˈwɔː.təˌmel.ən/", "dưa hấu", "n"],
  fruitcup: ["mixed fruit cup", "/mɪkst fruːt kʌp/", "cốc trái cây cắt sẵn", "n"],
  basil: ["fresh basil", "/freʃ ˈbæz.əl/", "rau húng quế tươi", "n"],
  cilantro: ["cilantro", "/sɪˈlæn.troʊ/", "rau mùi (ngò rí)", "n"],
  mushroom: ["mushrooms", "/ˈmʌʃ.ruːmz/", "nấm tươi", "n"],
  rollbag: ["produce bag", "/ˈprɑd.juːs bæɡ/", "túi nilon đựng rau quả", "n"],
  croissant: ["butter croissant", "/ˈbʌt.ər ˈkwæs.ɑ̃/", "bánh sừng bò bơ", "n"],
  flaky: ["flaky", "/ˈfleɪ.ki/", "giòn xốp ngàn lớp", "adj"],
  cinnamon: ["cinnamon roll", "/ˈsɪn.ə.mən roʊl/", "bánh cuộn quế", "n"],
  icing: ["chocolate icing", "/ˈtʃɑk.lət ˈaɪ.sɪŋ/", "kem phủ sô-cô-la", "n"],
  sourdough: ["sourdough loaf", "/ˈsaʊr.doʊ loʊf/", "ổ bánh mì men tự nhiên", "n"],
  slicer: ["bread slicer", "/bred ˈslaɪ.sər/", "máy cắt lát bánh mì", "n"],
  batch: ["fresh batch", "/freʃ bætʃ/", "mẻ bánh mới ra lò", "n"],
  oven: ["bakery oven", "/ˈbeɪ.kər.i ˈʌv.ən/", "lò nướng bánh", "n"],
  muffin: ["blueberry muffin", "/ˈbluː.bər.i ˈmʌf.ɪn/", "bánh muffin việt quất", "n"],
  tongs: ["metal tongs", "/ˈmet.əl tɑŋz/", "kẹp gắp bánh", "n"],
  bagel: ["sesame bagel", "/ˈses.ə.mi ˈbeɪ.ɡəl/", "bánh mì vòng rắc mè", "n"],
  jam: ["strawberry jam", "/ˈstrɔː.bər.i dʒæm/", "mứt dâu tây", "n"],
  honey: ["wildflower honey", "/ˈwaɪld.flaʊ.ər ˈhʌn.i/", "mật ong hoa rừng", "n"],
  crunchy: ["crunchy", "/ˈkrʌn.tʃi/", "giòn ngọt", "adj"],
  /* Dairy, Frozen & Drinks (Zone 3) */
  freezer: ["freezer", "/ˈfriː.zər/", "tủ đông", "n"],
  butter: ["unsalted butter", "/ʌnˈsɔːl.tɪd ˈbʌt.ər/", "bơ lạt (không muối)", "n"],
  mozzarella: ["mozzarella cheese", "/ˌmɑt.səˈrel.ə tʃiːz/", "phô mai mozzarella kéo sợi", "n"],
  oatmilk: ["oat milk", "/oʊt mɪlk/", "sữa yến mạch", "n"],
  carton: ["carton", "/ˈkɑː.tən/", "hộp giấy đựng sữa/nước", "n"],
  tub: ["tub of ice cream", "/tʌb əv ˌaɪs ˈkriːm/", "hộp kem lớn", "n"],
  frozenpizza: ["frozen pizza", "/ˈfroʊ.zən ˈpiːt.sə/", "bánh pizza đông lạnh", "n"],
  fries: ["French fries", "/frentʃ fraɪz/", "khoai tây chiên cọng", "n"],
  sweetcorn: ["frozen sweet corn", "/ˈfroʊ.zən swiːt kɔːn/", "bắp ngọt đông lạnh", "n"],
  sparkling: ["sparkling soda", "/ˈspɑː.klɪŋ ˈsoʊ.də/", "nước ngọt có ga", "n"],
  zerosugar: ["zero-sugar", "/ˈzɪr.roʊ ˈʃʊɡ.ər/", "không đường (0 calo)", "adj"],
  mineralwater: ["mineral water", "/ˈmɪn.ər.əl ˈwɔː.tər/", "nước khoáng thiên nhiên", "n"],
  coldpressed: ["cold-pressed juice", "/koʊld prest dʒuːs/", "nước ép lạnh nguyên chất", "n"],
  icedlatte: ["bottled iced latte", "/ˈbɑt.əld aɪst ˈlæt.eɪ/", "cà phê sữa đá đóng chai", "n"],
  peachtea: ["peach iced tea", "/piːtʃ aɪst tiː/", "trà đào ướp lạnh", "n"],
  lactosefree: ["lactose-free", "/ˈlæk.toʊs friː/", "không chứa đường lactose", "adj"],
  chilled: ["chilled", "/tʃɪld/", "ướp lạnh, mát lạnh", "adj"],
  probiotic: ["probiotic drink", "/ˌproʊ.baɪˈɑt.ɪk drɪŋk/", "sữa chua uống men sống", "n"],
  icecubes: ["ice cubes", "/aɪs kjuːbz/", "đá viên tinh khiết", "n"],
  pudding: ["caramel pudding", "/ˈkær.ə.mel ˈpʊd.ɪŋ/", "bánh pudding caramel", "n"],
  /* Meat, Fish & Household (Zone 4) */
  shrimp: ["tiger shrimp", "/ˈtaɪ.ɡər ʃrɪmp/", "tôm sú tươi", "n"],
  crushedice: ["crushed ice", "/krʌʃt aɪs/", "đá bào ướp lạnh", "n"],
  butcherpaper: ["butcher paper", "/ˈbʊtʃ.ər ˈpeɪ.pər/", "giấy gói thịt", "n"],
  cuttingboard: ["cutting board", "/ˈkʌt.ɪŋ bɔːd/", "thớt gỗ", "n"],
  cleaver: ["meat cleaver", "/miːt ˈkliː.vər/", "dao phay chặt thịt", "n"],
  tender: ["tender", "/ˈten.dər/", "mềm ngọt (thịt)", "adj"],
  marinated: ["marinated beef", "/ˈmær.ɪ.neɪ.tɪd biːf/", "thịt bò tẩm ướp sẵn", "n"],
  noodles: ["egg noodles", "/eɡ ˈnuː.dəlz/", "mì trứng sợi vàng", "n"],
  spaghetti: ["spaghetti", "/spəˈɡet.i/", "mì Ý sợi dài", "n"],
  oliveoil: ["olive oil", "/ˈɑl.ɪv ɔɪl/", "dầu ô-liu nguyên chất", "n"],
  sunfloweroil: ["cooking oil", "/ˈkʊk.ɪŋ ɔɪl/", "dầu ăn", "n"],
  pepper: ["black pepper", "/blæk ˈpep.ər/", "hạt tiêu đen xay", "n"],
  seasoning: ["garlic seasoning", "/ˈɡɑː.lɪk ˈsiː.zən.ɪŋ/", "gia vị bột tỏi thảo mộc", "n"],
  cereal: ["breakfast cereal", "/ˈbrek.fəst ˈsɪr.ri.əl/", "ngũ cốc ăn sáng", "n"],
  handsoap: ["hand soap", "/hænd soʊp/", "xà phòng rửa tay", "n"],
  scrubbrush: ["scrub brush", "/skrʌb brʌʃ/", "bàn chải cọ rửa", "n"],
  papertowel: ["paper towels", "/ˈpeɪ.pər ˈtaʊ.əlz/", "khăn giấy cuộn nhà bếp", "n"],
  toothbrush: ["toothbrush", "/ˈtuːθ.brʌʃ/", "bàn chải đánh răng", "n"],
  trashbags: ["trash bags", "/træʃ bæɡz/", "túi đựng rác", "n"],
  softener: ["fabric softener", "/ˈfæb.rɪk ˈsɑf.ən.ər/", "nước xả vải", "n"],
  bodywash: ["body wash", "/ˈbɑd.i wɑʃ/", "sữa tắm dưỡng ẩm", "n"],

  /* Zone 5: Checkout & Customer Service (Quầy thu ngân & dịch vụ) */
  applepay: ["Apple Pay", "/ˈæp.əl peɪ/", "thanh toán qua Apple Pay", "n"],
  points: ["loyalty points", "/ˈlɔɪ.əl.ti pɔɪnts/", "điểm thưởng tích lũy", "n"],
  deliver: ["deliver", "/dɪˈlɪv.ər/", "giao hàng tận nơi", "v"],
  divider: ["checkout divider", "/ˈtʃek.aʊt dɪˈvaɪ.dər/", "thanh ngăn phân cách trên băng chuyền", "n"],
  belt: ["conveyor belt", "/kənˈveɪ.ər belt/", "băng chuyền thu ngân", "n"],
  display: ["price display", "/praɪs dɪˈspleɪ/", "màn hình hiển thị giá POS", "n"],
  qr: ["QR code", "/ˌkjuː ˈɑːr koʊd/", "mã QR thanh toán", "n"],
  printer: ["receipt printer", "/rɪˈsiːt ˈprɪn.tər/", "máy in hóa đơn nhiệt", "n"],
  gum: ["chewing gum", "/ˈtʃuː.ɪŋ ɡʌm/", "kẹo cao su bạc hà", "n"],
  mint: ["breath mints", "/breθ mɪnts/", "kẹo ngậm thơm miệng", "n"],
  magazine: ["cooking magazine", "/ˈkʊk.ɪŋ ˌmæɡ.əˈziːn/", "tạp chí ẩm thực", "n"],
  battery: ["AA batteries", "/ˌdʌb.əl ˈeɪ ˈbæt.ər.iz/", "vỉ pin tiểu AA", "n"],
  policy: ["return policy", "/rɪˈtɜːn ˈpɑl.ə.si/", "chính sách đổi trả hàng", "n"],
  lost: ["lost and found", "/lɑst ənd faʊnd/", "quầy đồ thất lạc", "n"],
  giftwrap: ["gift wrap", "/ɡɪft ræp/", "giấy gói quà tặng", "n"],
  ribbon: ["satin ribbon", "/ˈsæt.ɪn ˈrɪb.ən/", "dây ruy-băng lụa", "n"],
  timeslot: ["delivery slot", "/dɪˈlɪv.ər.i slɑt/", "khung giờ giao hàng", "n"],
  packtable: ["packing table", "/ˈpæk.ɪŋ ˈteɪ.bəl/", "bàn đóng gói đồ mua sắm", "n"],
  cartbay: ["cart return bay", "/kɑːt rɪˈtɜːn beɪ/", "khu trả xe đẩy & giỏ hàng", "n"],
  guard: ["security guard", "/sɪˈkjʊr.rə.ti ɡɑːd/", "nhân viên bảo vệ", "n"],
  exitdoor: ["sliding exit door", "/ˈslaɪ.dɪŋ ˈek.sɪt dɔːr/", "cửa trượt lối ra", "n"],
  paperbag: ["paper bag", "/ˈpeɪ.pər bæɡ/", "túi giấy tái chế", "n"]
});

/* Extend MK_W0 with new state keys for all 5 zones */
Object.assign(MK_W0, {
  mke_mat: "no", mke_sanitize: "no", mke_wipe: "no", mke_flyer2: "no", mke_weekend: "no",
  mke_kiosk: "no", mke_voucher: "no", mke_map: "no", mke_mapbakery: "no", mke_locker: "no",
  mke_token: "no", mke_umbrella: "no", mke_tulips: "no", mke_sunflower: "no", mke_greet: "no",
  mke_childcart: "no", mke_kiddie: "no", mke_tote: "no", mke_arch: "no", mke_atm: "no",
  mke_water: "no", mke_recycle: "no", mke_bench: "no",
  mkp_lemons: "no", mkp_tangerines: "no", mkp_blueberries: "no", mkp_cherries: "no",
  mkp_mist: "no", mkp_romaine: "no", mkp_potatoes: "no", mkp_onions: "no",
  mkp_orgcompare: "no", mkp_orgspinach: "no", mkp_pineapple: "no", mkp_dragonfruit: "no",
  mkp_watermelon: "no", mkp_fruitcup: "no", mkp_basil: "no", mkp_cilantro: "no",
  mkp_mushrooms: "no", mkp_rollbag: "no", mkp_croissant: "no", mkp_cinnamon: "no",
  mkp_cakemsg: "no", mkp_slicer: "no", mkp_ovenbatch: "no", mkp_muffin: "no",
  mkp_tongs: "no", mkp_jam: "no", mkp_askmelon: "no",
  mkd_strawyogurt: "no", mkd_butter: "no", mkd_cheeseblock: "no", mkd_mozzarella: "no",
  mkd_fridgedoor: "no", mkd_oatmilk: "no", mkd_freezerdoor2: "no", mkd_icetub: "no",
  mkd_pizza: "no", mkd_fries: "no", mkd_corn: "no", mkd_soda: "no", mkd_zerosoda: "no",
  mkd_mineral: "no", mkd_orangejuice: "no", mkd_coldjuice: "no", mkd_icedlatte: "no",
  mkd_peachtea: "no", mkd_salesign: "no", mkd_bogo: "no", mkd_clerk: "no", mkd_temp: "no",
  mkd_coolerbag: "no", mkd_probiotic: "no", mkd_icecubes: "no", mkd_pudding: "no",
  mkm_salmon: "no", mkm_shrimp: "no", mkm_scale: "no", mkm_scalelabel: "no",
  mkm_wrap: "no", mkm_parcel: "no", mkm_trim: "no", mkm_cube: "no", mkm_beefpack: "no",
  mkm_noodles: "no", mkm_spaghetti: "no", mkm_oliveoil: "no", mkm_sunfloweroil: "no",
  mkm_pepper: "no", mkm_seasoning: "no", mkm_cereal: "no", mkm_handsoap: "no",
  mkm_brush: "no", mkm_papertowel: "no", mkm_toothbrush: "no", mkm_trashbags: "no",
  mkm_detergent2: "no", mkm_bodywash: "no", mkm_staff: "no", mkm_salesign: "no",
  mkc_applepay: "no", mkc_getbag: "no", mkc_wrongsize: "no", mkc_usepoints: "no",
  mkc_deliver: "no", mkc_divider: "no", mkc_beltmove: "no", mkc_poscheck: "no",
  mkc_qrpay: "no", mkc_taxinvoice: "no", mkc_coins: "no", mkc_gum: "no",
  mkc_mints: "no", mkc_magazine: "no", mkc_batteries: "no", mkc_policy: "no",
  mkc_loyaltycard: "no", mkc_lostfound: "no", mkc_giftwrap: "no", mkc_ribbon: "no",
  mkc_timeslot: "no", mkc_packtable: "no", mkc_returncart: "no", mkc_guardcheck: "no",
  mkc_exitdoor: "no", mkc_selfweigh: "no", mkc_paperbag: "no", mkc_parking: "no"
});

const mkA = mkAct(MKV);

/* =====================================================================
   SHARED 2.5D SUPERMARKET STYLE (Matching docs/ref/style-ref-2..5)
   Warm pendant lights, deep green soffit, SALE/SPECIAL OFFER banners,
   perspective tiled floor, rich wooden crates, multi-tier displays.
   ===================================================================== */
const sharedDefs = `
<defs>
  <linearGradient id="mkzWall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f9f2df"/>
    <stop offset=".65" stop-color="#f2e6cb"/>
    <stop offset="1" stop-color="#e5d5b5"/>
  </linearGradient>
  <linearGradient id="mkzSoffit" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1e3f30"/>
    <stop offset="1" stop-color="#2d5d46"/>
  </linearGradient>
  <linearGradient id="mkzLeftWall" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#d7c6a3"/>
    <stop offset="1" stop-color="#e7d9bc"/>
  </linearGradient>
  <linearGradient id="mkzFloor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#efe6d5"/>
    <stop offset=".5" stop-color="#e3d6be"/>
    <stop offset="1" stop-color="#d2c1a3"/>
  </linearGradient>
  <linearGradient id="mkzWood" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e2a86f"/>
    <stop offset=".55" stop-color="#c98950"/>
    <stop offset="1" stop-color="#a66834"/>
  </linearGradient>
  <linearGradient id="mkzWoodDark" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#9e6231"/>
    <stop offset="1" stop-color="#75451e"/>
  </linearGradient>
  <linearGradient id="mkzGlass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#eff9fd"/>
    <stop offset=".5" stop-color="#d2ecf7"/>
    <stop offset="1" stop-color="#b5dced"/>
  </linearGradient>
  <linearGradient id="mkzChrome" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#dce3e8"/>
    <stop offset=".5" stop-color="#ffffff"/>
    <stop offset="1" stop-color="#b8c4ce"/>
  </linearGradient>
  <linearGradient id="mkzGlow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffe885" stop-opacity=".34"/>
    <stop offset="1" stop-color="#ffe885" stop-opacity="0"/>
  </linearGradient>
  <filter id="mkzShadow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="3.5"/>
  </filter>
</defs>
`;

const pendantLamp = (cx, yBottom) => `
  <g>
    <line x1="${cx}" y1="0" x2="${cx}" y2="${yBottom - 16}" stroke="#1a2e24" stroke-width="2.5"/>
    <polygon points="${cx - 68},${yBottom + 170} ${cx + 68},${yBottom + 170} ${cx + 22},${yBottom} ${cx - 22},${yBottom}" fill="url(#mkzGlow)" pointer-events="none"/>
    <path d="M${cx - 24} ${yBottom} Q${cx} ${yBottom - 22} ${cx + 24} ${yBottom} Z" fill="#e8832a" stroke="#9e4d10" stroke-width="1.5"/>
    <ellipse cx="${cx}" cy="${yBottom}" rx="22" ry="5" fill="#fff8d6"/>
    <circle cx="${cx}" cy="${yBottom + 2}" r="5" fill="#ffe066"/>
  </g>
`;

const floorGrid = `
  <g stroke="#c6b494" stroke-width="1.2" opacity=".62">
    <path d="M88 378 H1000 M65 426 H1000 M44 476 H1000 M24 530 H1000 M6 586 H1000"/>
    <path d="M180 336 L80 640 M300 336 L230 640 M420 336 L390 640 M540 336 L550 640 M660 336 L710 640 M780 336 L860 640 M900 336 L995 640"/>
  </g>
`;

/* =====================================================================
   ZONE 1: market_entrance — Lối vào & Xe đẩy (Entrance & Carts)
   21 Objects · 42 Actions · 30 NPC Replies (72 Sentences)
   ===================================================================== */
const entranceShell = `
${sharedDefs}
<rect x="108" y="0" width="892" height="336" fill="url(#mkzWall)"/>
<polygon points="0,0 108,0 108,336 0,640" fill="url(#mkzLeftWall)"/>
<polygon points="108,336 1000,336 1000,640 0,640" fill="url(#mkzFloor)"/>
${D("floor-tiles", floorGrid)}
<rect x="0" y="0" width="1000" height="38" fill="url(#mkzSoffit)"/>
<rect x="108" y="38" width="892" height="10" fill="#e8832a"/>
<text x="540" y="25" font-size="14" font-weight="900" fill="#fff8dc" text-anchor="middle" letter-spacing="3">FRESH LIFE SUPERMARKET · WELCOME &amp; CARTS</text>
${D("pendant-lights", pendantLamp(220, 62) + pendantLamp(460, 62) + pendantLamp(700, 62) + pendantLamp(910, 62))}
${D("zone-arrows", `
  <g transform="translate(815,48)">
    <rect x="0" y="0" width="168" height="26" rx="6" fill="#2f7f4b" stroke="#fff" stroke-width="1.5"/>
    <text x="84" y="17" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">PRODUCE &amp; BAKERY ➔</text>
  </g>
`)}
`;

const entranceWorld = [
  /* 1. exitdoor — sliding entrance & exit glass door */
  objG("exitdoor", "sliding entrance & exit", "cửa kính lối vào & ra", 345, 76, 178, `
    <rect class="hit" x="14" y="160" width="96" height="290"/>
    <polygon points="18,452 104,336 104,142 18,228" fill="#bfe3c0" stroke="#5d7a68" stroke-width="3"/>
    <polygon points="22,442 100,332 100,150 22,232" fill="url(#mkzGlass)" stroke="#7b93a4" stroke-width="2.5"/>
    <line x1="62" y1="190" x2="62" y2="388" stroke="#5c7688" stroke-width="2.5"/>
    <rect x="34" y="164" width="56" height="20" rx="4" fill="#2f7f4b" stroke="#fff" stroke-width="1.2"/>
    <text x="62" y="178" font-size="9.5" font-weight="900" fill="#fff" text-anchor="middle">WELCOME / EXIT</text>
    <g class="mk-bye" fill="#2f7f4b"><circle cx="62" cy="285" r="11"/><path d="M57 285 l4 4 l7 -8" stroke="#fff" stroke-width="2.2" fill="none"/></g>
  `),
  /* 2. welcomemat — non-slip welcome mat */
  objG("welcomemat", "welcome mat", "thảm chào mừng", 468, 128, 466, `
    <rect class="hit" x="68" y="418" width="118" height="44"/>
    <polygon points="84,422 186,422 170,458 68,458" fill="#b84336" stroke="#7d281f" stroke-width="2"/>
    <polygon points="90,427 178,427 165,453 77,453" fill="none" stroke="#f5d34a" stroke-width="1.2" stroke-dasharray="4 2"/>
    <text x="128" y="444" font-size="9" font-weight="900" fill="#fff8dc" text-anchor="middle" letter-spacing="1">WELCOME</text>
  `),
  /* 3. umbrellastand — umbrella wrapper & stand */
  objG("umbrellastand", "umbrella stand", "kệ bọc và để ô dù", 422, 54, 418, `
    <rect class="hit" x="18" y="346" width="66" height="90"/>
    <ellipse cx="48" cy="424" rx="26" ry="5" fill="#000" opacity=".15"/>
    <rect x="28" y="366" width="40" height="56" rx="5" fill="#3b6ec2" stroke="#244885" stroke-width="1.8"/>
    <rect x="32" y="374" width="32" height="14" rx="2" fill="#fff"/>
    <text x="48" y="384" font-size="6.5" font-weight="900" fill="#244885" text-anchor="middle">UMBRELLA</text>
    <path d="M38 366 V348 Q38 340 44 344" stroke="#c2453b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M54 366 V350 Q54 342 60 346" stroke="#f5a623" stroke-width="3" fill="none" stroke-linecap="round"/>
  `),
  /* 4. returnbin — bottle & plastic recycling bin */
  objG("returnbin", "recycling bin", "thùng thu hồi vỏ chai", 552, 56, 560, `
    <rect class="hit" x="16" y="472" width="76" height="84"/>
    <ellipse cx="54" cy="548" rx="32" ry="5" fill="#000" opacity=".16"/>
    <rect x="24" y="484" width="60" height="62" rx="6" fill="#2f7f4b" stroke="#1e5631" stroke-width="2"/>
    <path d="M22 486 Q54 472 86 486 Z" fill="#3ca962" stroke="#1e5631" stroke-width="1.5"/>
    <circle cx="42" cy="502" r="6" fill="#183f26"/><circle cx="66" cy="502" r="6" fill="#183f26"/>
    <text x="54" y="528" font-size="7.5" font-weight="900" fill="#fff" text-anchor="middle">RECYCLE</text>
    <text x="54" y="538" font-size="6.5" font-weight="800" fill="#f5d34a" text-anchor="middle">BOTTLES</text>
  `),
  /* 5. lockerbox — customer parcel lockers */
  objG("lockerbox", "parcel lockers", "tủ gửi đồ cá nhân", 342, 162, 134, `
    <rect class="hit" x="114" y="138" width="98" height="198"/>
    <rect x="116" y="142" width="94" height="192" rx="4" fill="#dce6ee" stroke="#7f93a3" stroke-width="2"/>
    <rect x="116" y="142" width="94" height="18" rx="3" fill="#3b6ec2"/>
    <text x="163" y="154" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">LOCKERS</text>
    <g stroke="#7f93a3" stroke-width="1.5" fill="#eef4f8">
      <rect x="122" y="166" width="38" height="36" rx="2"/><rect x="166" y="166" width="38" height="36" rx="2"/>
      <rect x="122" y="206" width="38" height="36" rx="2"/><rect x="166" y="206" width="38" height="36" rx="2" fill="#ffd97d"/>
      <rect x="122" y="246" width="38" height="36" rx="2"/><rect x="166" y="246" width="38" height="36" rx="2"/>
      <rect x="122" y="286" width="38" height="38" rx="2"/><rect x="166" y="286" width="38" height="38" rx="2"/>
    </g>
    <g font-size="7" font-weight="800" fill="#3a4c5e">
      <text x="128" y="177">1</text><text x="172" y="177">2</text>
      <text x="128" y="217">3</text><text x="172" y="217">4</text>
      <text x="128" y="257">5</text><text x="172" y="257">6</text>
    </g>
  `),
  /* 6. atmmachine — ATM cash machine */
  objG("atmmachine", "ATM machine", "cây rút tiền ATM", 344, 248, 146, `
    <rect class="hit" x="214" y="148" width="68" height="188"/>
    <rect x="218" y="154" width="60" height="180" rx="6" fill="#2c3e50" stroke="#1a252f" stroke-width="2"/>
    <rect x="222" y="160" width="52" height="20" rx="3" fill="#f5a623"/>
    <text x="248" y="174" font-size="10" font-weight="900" fill="#1a252f" text-anchor="middle">ATM 24/7</text>
    <rect x="226" y="188" width="44" height="34" rx="3" fill="#7fd0c8" stroke="#1a252f" stroke-width="1.5"/>
    <text x="248" y="208" font-size="7.5" font-weight="900" fill="#103632" text-anchor="middle">CASH HERE</text>
    <rect x="228" y="230" width="40" height="10" rx="2" fill="#4b5d6e"/>
    <rect x="252" y="246" width="14" height="4" rx="1" fill="#2ecc71"/>
    <rect x="232" y="258" width="32" height="6" rx="1" fill="#111"/>
  `),
  /* 7. watercooler — free drinking water station */
  objG("watercooler", "water station", "bình nước uống miễn phí", 346, 308, 174, `
    <rect class="hit" x="284" y="180" width="48" height="156"/>
    <ellipse cx="308" cy="334" rx="20" ry="4" fill="#000" opacity=".14"/>
    <rect x="292" y="238" width="32" height="96" rx="4" fill="#f4f6f8" stroke="#9aa6af" stroke-width="1.8"/>
    <rect x="296" y="190" width="24" height="48" rx="10" fill="#bfe9f9" stroke="#6fb3e0" stroke-width="1.8"/>
    <path d="M298 206 Q308 210 318 206" stroke="#6fb3e0" stroke-width="1.5" fill="none"/>
    <rect x="298" y="252" width="20" height="18" rx="2" fill="#2c3e50"/>
    <circle cx="304" cy="258" r="2.5" fill="#3b6ec2"/><circle cx="312" cy="258" r="2.5" fill="#e74c3c"/>
  `),
  /* 8. specialarch — Special Offer promotional arch */
  objG("specialarch", "special offer banner", "cổng chào khuyến mãi", 210, 488, 66, `
    <rect class="hit" x="348" y="64" width="280" height="68"/>
    <rect x="352" y="68" width="272" height="58" rx="10" fill="#c2453b" stroke="#f5d34a" stroke-width="3.5"/>
    <rect x="362" y="74" width="252" height="22" rx="5" fill="#f5d34a"/>
    <text x="488" y="90" font-size="12.5" font-weight="900" fill="#9c241b" text-anchor="middle" letter-spacing="1.5">★ SPECIAL OFFER TODAY ★</text>
    <text x="488" y="114" font-size="10.5" font-weight="800" fill="#fff8dc" text-anchor="middle">BUY 2 GET 1 FREE · ARTISAN PASTRIES &amp; FRUIT</text>
  `),
  /* 9. pricesign — price & discount board (preserved from market) */
  objG("pricesign", "discount sign", "bảng giá & giảm giá", 345, 396, 152, `
    <rect class="hit" x="342" y="156" width="118" height="176"/>
    <rect x="396" y="264" width="10" height="66" fill="#5b5f66"/>
    <ellipse cx="401" cy="332" rx="28" ry="5" fill="#2d2a26"/>
    <rect x="346" y="160" width="110" height="106" rx="8" fill="#f5d34a" stroke="#c99a1d" stroke-width="3"/>
    <rect x="354" y="168" width="94" height="24" rx="4" fill="#c2453b"/>
    <text x="401" y="185" font-size="12.5" font-weight="900" fill="#fff" text-anchor="middle">SALE 20% OFF</text>
    <text x="401" y="208" font-size="10.5" font-weight="800" fill="#5a3d1f" text-anchor="middle">Bananas $1.20 / bunch</text>
    <text x="401" y="226" font-size="10.5" font-weight="800" fill="#5a3d1f" text-anchor="middle">Red Apples $3.00 / kg</text>
    <text x="401" y="244" font-size="9.5" font-weight="800" fill="#2f7f4b" text-anchor="middle">Family Pack: Save $3</text>
    <path class="mk-saleTick" d="M434 246 l5 5 l10 -12" stroke="#2f7f4b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  `),
  /* 10. flyerrack — weekly deals flyer stand */
  objG("flyerrack", "weekly flyer rack", "kệ tờ rơi khuyến mãi", 348, 504, 180, `
    <rect class="hit" x="468" y="184" width="70" height="152"/>
    <ellipse cx="503" cy="334" rx="26" ry="5" fill="#000" opacity=".15"/>
    <polygon points="476,200 530,200 536,330 470,330" fill="url(#mkzWood)" stroke="#8c562b" stroke-width="2"/>
    <rect x="480" y="206" width="46" height="16" rx="3" fill="#e8743b"/>
    <text x="503" y="217" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">WEEKLY DEALS</text>
    <g fill="#fff8ec" stroke="#c99a1d" stroke-width="1.2">
      <rect x="482" y="228" width="20" height="26" rx="2"/><rect x="504" y="228" width="20" height="26" rx="2"/>
      <rect x="482" y="260" width="20" height="26" rx="2"/><rect x="504" y="260" width="20" height="26" rx="2"/>
      <rect x="482" y="292" width="42" height="24" rx="2" fill="#f5d34a"/>
    </g>
    <text x="503" y="308" font-size="8" font-weight="900" fill="#c2453b" text-anchor="middle">50% OFF</text>
  `),
  /* 11. couponboard — digital coupon kiosk */
  objG("couponboard", "coupon kiosk", "cây in phiếu giảm giá", 348, 584, 166, `
    <rect class="hit" x="548" y="172" width="70" height="164"/>
    <ellipse cx="583" cy="334" rx="25" ry="5" fill="#000" opacity=".15"/>
    <rect x="558" y="180" width="50" height="152" rx="7" fill="#e8743b" stroke="#b34e1b" stroke-width="2"/>
    <rect x="564" y="192" width="38" height="44" rx="3" fill="#fff8ec" stroke="#5a3d1f" stroke-width="1.5"/>
    <text x="583" y="208" font-size="8" font-weight="900" fill="#c2453b" text-anchor="middle">COUPONS</text>
    <rect x="570" y="214" width="26" height="14" rx="2" fill="#f5d34a"/>
    <text x="583" y="224" font-size="7.5" font-weight="900" fill="#5a3d1f" text-anchor="middle">-$2.00</text>
    <rect x="568" y="248" width="30" height="8" rx="2" fill="#2d2a26"/>
    <path d="M573 256 h20 v16 l-5 -3 l-5 3 l-5 -3 l-5 3 z" fill="#fff" stroke="#c99a1d"/>
  `),
  /* 12. storemap — illuminated store directory map */
  objG("storemap", "store directory map", "sơ đồ các khu siêu thị", 346, 686, 132, `
    <rect class="hit" x="630" y="136" width="114" height="198"/>
    <rect x="652" y="276" width="10" height="58" fill="#4b5d6e"/><rect x="712" y="276" width="10" height="58" fill="#4b5d6e"/>
    <rect x="634" y="142" width="106" height="136" rx="7" fill="#244937" stroke="#c99a1d" stroke-width="3"/>
    <text x="687" y="160" font-size="9.5" font-weight="900" fill="#f5d34a" text-anchor="middle">STORE DIRECTORY</text>
    <g font-size="7.5" font-weight="800" fill="#fff">
      <rect x="644" y="168" width="86" height="18" rx="3" fill="#e8743b"/><text x="687" y="180" text-anchor="middle">1 · ENTRANCE &amp; CARTS</text>
      <rect x="644" y="190" width="86" height="18" rx="3" fill="#3a9d5d"/><text x="687" y="202" text-anchor="middle">2 · PRODUCE &amp; BAKERY</text>
      <rect x="644" y="212" width="86" height="18" rx="3" fill="#3b6ec2"/><text x="687" y="224" text-anchor="middle">3 · DAIRY &amp; SNACKS</text>
      <rect x="644" y="234" width="86" height="18" rx="3" fill="#c2453b"/><text x="687" y="246" text-anchor="middle">4 · MEAT &amp; FROZEN</text>
      <rect x="644" y="254" width="86" height="18" rx="3" fill="#8e5ea2"/><text x="687" y="266" text-anchor="middle">5 · CHECKOUT &amp; DESK</text>
    </g>
  `),
  /* 13. flowerbucket — fresh flower stand by the entrance */
  objG("flowerbucket", "fresh flower stand", "quầy hoa tươi lối vào", 360, 818, 170, `
    <rect class="hit" x="756" y="176" width="122" height="182"/>
    <ellipse cx="817" cy="354" rx="58" ry="6" fill="#000" opacity=".15"/>
    <polygon points="764,264 870,264 862,350 772,350" fill="url(#mkzWood)" stroke="#8c562b" stroke-width="2"/>
    <rect x="768" y="232" width="98" height="32" rx="4" fill="#b57642" stroke="#75451e" stroke-width="1.5"/>
    <!-- flower buckets & blooms -->
    <g>
      <polygon points="776,232 798,232 794,262 780,262" fill="#5b6770"/>
      <polygon points="806,232 828,232 824,262 810,262" fill="#5b6770"/>
      <polygon points="836,232 858,232 854,262 840,262" fill="#5b6770"/>
      <g fill="#4c9a56"><path d="M782 232 l-4 -24 M787 232 v-26 M792 232 l4 -22 M812 232 l-4 -24 M817 232 v-28 M822 232 l4 -24 M842 232 l-4 -24 M847 232 v-26 M852 232 l4 -22" stroke="#3a8444" stroke-width="2.5"/></g>
      <!-- yellow tulips -->
      <circle cx="779" cy="205" r="6" fill="#f5d34a"/><circle cx="787" cy="202" r="6.5" fill="#ffbe3b"/><circle cx="795" cy="206" r="6" fill="#f5d34a"/>
      <!-- pink/red tulips -->
      <circle cx="809" cy="205" r="6" fill="#e85d75"/><circle cx="817" cy="200" r="6.5" fill="#d8453a"/><circle cx="825" cy="205" r="6" fill="#ff7b93"/>
      <!-- bright sunflowers -->
      <circle cx="839" cy="205" r="7" fill="#f5a623"/><circle cx="839" cy="205" r="3" fill="#5a3d1f"/>
      <circle cx="848" cy="200" r="7.5" fill="#f5d34a"/><circle cx="848" cy="200" r="3.2" fill="#5a3d1f"/>
      <circle cx="856" cy="206" r="7" fill="#f5a623"/><circle cx="856" cy="206" r="3" fill="#5a3d1f"/>
    </g>
    <rect x="782" y="290" width="70" height="22" rx="4" fill="#fff8ec" stroke="#8c562b"/>
    <text x="817" y="305" font-size="9" font-weight="900" fill="#2f7f4b" text-anchor="middle">FRESH FLOWERS $5</text>
  `),
  /* 14. greeterdesk — welcome greeter podium & staff NPC */
  objG("greeterdesk", "welcome greeter", "quầy nhân viên đón khách", 372, 932, 168, `
    <rect class="hit" x="884" y="176" width="104" height="196"/>
    <ellipse cx="936" cy="368" rx="44" ry="6" fill="#000" opacity=".16"/>
    <!-- Greeter NPC -->
    <g>
      <rect x="918" y="228" width="36" height="54" rx="10" fill="#2f7f4b"/>
      <rect x="924" y="240" width="24" height="38" rx="3" fill="#f5d34a"/>
      <circle cx="936" cy="210" r="15" fill="#f2c49b"/>
      <path d="M921 206 Q936 184 951 206 Q946 196 936 196 Q926 196 921 206 Z" fill="#3a2314"/>
      <circle cx="931" cy="211" r="1.8" fill="#2d2a26"/><circle cx="941" cy="211" r="1.8" fill="#2d2a26"/>
      <path d="M931 218 Q936 223 941 218" stroke="#9c3b2e" stroke-width="1.8" fill="none"/>
    </g>
    <rect x="892" y="274" width="88" height="10" rx="3" fill="#8c562b"/>
    <rect x="896" y="284" width="80" height="82" rx="4" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="904" y="302" width="64" height="24" rx="4" fill="#2f7f4b"/>
    <text x="936" y="317" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">WELCOME DESK</text>
  `),
  /* 15. sanitizestand — hand sanitizer & wipes dispenser */
  objG("sanitizestand", "sanitizer station", "trạm rửa tay & khăn khử trùng", 464, 214, 344, `
    <rect class="hit" x="178" y="346" width="68" height="122"/>
    <ellipse cx="212" cy="462" rx="22" ry="5" fill="#000" opacity=".15"/>
    <rect x="208" y="396" width="8" height="64" fill="#7f8c8d"/>
    <rect x="192" y="352" width="40" height="48" rx="6" fill="#f5d34a" stroke="#c99a1d" stroke-width="2"/>
    <rect x="200" y="360" width="24" height="18" rx="3" fill="#fff"/>
    <path d="M212 363 v12 M206 369 h12" stroke="#2f7f4b" stroke-width="3" stroke-linecap="round"/>
    <text x="212" y="392" font-size="7" font-weight="900" fill="#5a3d1f" text-anchor="middle">SANITIZE</text>
  `),
  /* 16. shopbasket — stack of red & green hand baskets (preserved from market) */
  objG("shopbasket", "shopping baskets", "giỏ mua hàng", 476, 304, 366, `
    <rect class="hit" x="256" y="372" width="96" height="108"/>
    <ellipse cx="304" cy="474" rx="42" ry="5" fill="#000" opacity=".15"/>
    <rect x="266" y="452" width="76" height="20" rx="3" fill="#7f8c8d"/>
    <g class="mk-baskets">
      <path d="M268 424 H340 L332 452 H276 Z" fill="#c2453b" stroke="#8f2c24" stroke-width="1.5"/>
      <path d="M268 404 H340 L332 430 H276 Z" fill="#e05347" stroke="#8f2c24" stroke-width="1.5"/>
      <path d="M268 386 H340 L332 412 H276 Z" fill="#2f7f4b" stroke="#1e5631" stroke-width="1.5"/>
      <path d="M282 386 Q304 366 326 386" stroke="#2d2a26" stroke-width="3" fill="none"/>
    </g>
    <text x="304" y="466" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">BASKETS</text>
  `),
  /* 17. ecobagrack — reusable eco bag stand */
  objG("ecobagrack", "reusable bag stand", "kệ túi vải sinh thái", 476, 408, 352, `
    <rect class="hit" x="364" y="356" width="88" height="122"/>
    <ellipse cx="408" cy="474" rx="34" ry="5" fill="#000" opacity=".15"/>
    <rect x="404" y="370" width="8" height="102" fill="#8c562b"/>
    <rect x="374" y="368" width="68" height="8" rx="3" fill="#8c562b"/>
    <!-- Hanging tote bags -->
    <g>
      <path d="M378 392 h26 l-2 42 h-22 z" fill="#f3ead6" stroke="#a88b60" stroke-width="1.5"/>
      <path d="M384 392 q7 -16 14 0" stroke="#a88b60" stroke-width="2" fill="none"/>
      <circle cx="391" cy="412" r="6" fill="#3a9d5d"/>
      <path d="M412 392 h26 l-2 42 h-22 z" fill="#3a9d5d" stroke="#1e5631" stroke-width="1.5"/>
      <path d="M418 392 q7 -16 14 0" stroke="#1e5631" stroke-width="2" fill="none"/>
      <text x="425" y="416" font-size="6.5" font-weight="900" fill="#fff" text-anchor="middle">ECO</text>
    </g>
  `),
  /* 18. shopcart — chrome shopping carts row (preserved from market) */
  objG("shopcart", "shopping cart", "xe đẩy mua hàng", 564, 232, 476, `
    <rect class="hit" x="148" y="476" width="166" height="98"/>
    <ellipse cx="232" cy="566" rx="76" ry="6" fill="#000" opacity=".16"/>
    <!-- Second cart stacked behind -->
    <g opacity=".65" transform="translate(28,-6)">
      <path d="M160 490 L172 490 L182 540 H262 L270 504 H176" fill="none" stroke="#7f8c8d" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="190" cy="556" r="6.5" fill="#2d2a26"/><circle cx="252" cy="556" r="6.5" fill="#2d2a26"/>
    </g>
    <!-- Foreground main cart -->
    <g class="mk-cartP">
      <path d="M160 490 L172 490 L182 540 H262 L270 504 H176" fill="none" stroke="#8a96a0" stroke-width="4" stroke-linejoin="round"/>
      <path d="M178 506 H266 L258 538 H184 Z" fill="url(#mkzChrome)" opacity=".75"/>
      <g stroke="#7f8c8d" stroke-width="1.4"><path d="M196 506 V538 M214 506 V538 M232 506 V538 M250 506 V538 M180 518 H263 M182 528 H260"/></g>
      <circle cx="190" cy="558" r="7.5" fill="#2d2a26"/><circle cx="252" cy="558" r="7.5" fill="#2d2a26"/>
      <rect x="154" y="484" width="18" height="8" rx="3" fill="#c2453b"/>
    </g>
  `),
  /* 19. kiddiecart — mini red car cart for kids */
  objG("kiddiecart", "mini kid cart", "xe đẩy mini hình ô tô", 566, 396, 488, `
    <rect class="hit" x="336" y="486" width="118" height="88"/>
    <ellipse cx="395" cy="566" rx="52" ry="6" fill="#000" opacity=".16"/>
    <path d="M348 492 L360 492 L366 534 H434 L440 506 H364" fill="none" stroke="#8a96a0" stroke-width="3.5"/>
    <path d="M362 530 H442 C448 530 450 552 440 554 H360 C352 554 352 534 362 530 Z" fill="#d8453a" stroke="#8f2c24" stroke-width="2"/>
    <rect x="382" y="516" width="28" height="16" rx="4" fill="#bfe9f9" stroke="#8f2c24" stroke-width="1.5"/>
    <circle cx="374" cy="560" r="8" fill="#2d2a26"/><circle cx="374" cy="560" r="3.5" fill="#f5d34a"/>
    <circle cx="426" cy="560" r="8" fill="#2d2a26"/><circle cx="426" cy="560" r="3.5" fill="#f5d34a"/>
    <circle cx="444" cy="542" r="4" fill="#f5d34a"/>
  `),
  /* 20. samplestand — free sample tasting counter & staff host (preserved from market) */
  objG("samplestand", "free sample stand", "quầy ăn thử miễn phí", 554, 594, 434, `
    <rect class="hit" x="528" y="438" width="132" height="126"/>
    <ellipse cx="594" cy="558" rx="60" ry="6" fill="#000" opacity=".16"/>
    <!-- Sample host canopy & table -->
    <rect x="536" y="444" width="116" height="20" rx="5" fill="#e8743b" stroke="#a84919" stroke-width="1.8"/>
    <text x="594" y="458" font-size="9.5" font-weight="900" fill="#fff" text-anchor="middle">FREE SAMPLES · TASTE!</text>
    <rect x="544" y="464" width="6" height="36" fill="#8c562b"/><rect x="638" y="464" width="6" height="36" fill="#8c562b"/>
    <rect x="538" y="496" width="112" height="10" rx="3" fill="#fff8ec" stroke="#c99a1d" stroke-width="1.5"/>
    <rect x="544" y="506" width="100" height="50" rx="3" fill="#2f7f4b" stroke="#1e5631" stroke-width="2"/>
    <text x="594" y="528" font-size="10" font-weight="900" fill="#fff" text-anchor="middle">ROASTED SESAME</text>
    <text x="594" y="543" font-size="9" font-weight="900" fill="#f5d34a" text-anchor="middle">BUY 1 GET 1 FREE</text>
    <g class="mk-samples">
      <ellipse cx="574" cy="493" rx="18" ry="4" fill="#dfe3e6"/>
      <circle cx="568" cy="489" r="4" fill="#e3a24a"/><circle cx="578" cy="489" r="4" fill="#e3a24a"/>
      <rect x="606" y="476" width="14" height="20" rx="3" fill="#c2453b"/><rect x="608" y="482" width="10" height="8" fill="#f5d34a"/>
    </g>
  `),
  /* 21. benchseat — wooden waiting bench */
  objG("benchseat", "waiting bench", "ghế nghỉ chân lối vào", 564, 804, 488, `
    <rect class="hit" x="728" y="486" width="152" height="82"/>
    <ellipse cx="804" cy="562" rx="70" ry="6" fill="#000" opacity=".15"/>
    <rect x="738" y="500" width="132" height="24" rx="4" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="734" y="524" width="140" height="12" rx="3" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="746" y="536" width="10" height="24" rx="2" fill="#3a3f46"/>
    <rect x="852" y="536" width="10" height="24" rx="2" fill="#3a3f46"/>
  `)
].join("\n");

const entranceObjects = {
  shopcart: S.allObjects.shopcart,
  shopbasket: S.allObjects.shopbasket,
  pricesign: S.allObjects.pricesign,
  samplestand: S.allObjects.samplestand,
  exitdoor: S.allObjects.exitdoor,
  welcomemat: { en: "welcome mat", vi: "thảm chào mừng", ipa: "/ˈwel.kəm mæt/", acts: ["wipe_shoes_on_mat"] },
  sanitizestand: { en: "sanitizer station", vi: "trạm rửa tay & khăn khử trùng", ipa: "/ˈsæn.ɪ.taɪ.zər ˈsteɪ.ʃən/", acts: ["sanitize_hands_at_door", "take_disinfectant_wipe"] },
  flyerrack: { en: "weekly flyer rack", vi: "kệ tờ rơi khuyến mãi", ipa: "/ˈflaɪ.ər ræk/", acts: ["pick_up_store_flyer", "check_weekend_specials"] },
  couponboard: { en: "coupon kiosk", vi: "cây in phiếu giảm giá", ipa: "/ˈkuː.pɑn ˈkiː.ɑsk/", acts: ["print_member_coupons", "clip_two_dollar_voucher"] },
  storemap: { en: "store directory map", vi: "sơ đồ các khu siêu thị", ipa: "/stɔːr dəˈrek.tər.i/", acts: ["check_store_directory", "find_bakery_on_map"] },
  lockerbox: { en: "parcel lockers", vi: "tủ gửi đồ cá nhân", ipa: "/ˈpɑː.səl ˈlɑk.əz/", acts: ["store_backpack_in_locker", "take_locker_token"] },
  umbrellastand: { en: "umbrella stand", vi: "kệ bọc và để ô dù", ipa: "/ʌmˈbrel.ə stænd/", acts: ["wrap_wet_umbrella"] },
  flowerbucket: { en: "fresh flower stand", vi: "quầy hoa tươi lối vào", ipa: "/ˈflaʊ.ər stænd/", acts: ["smell_fresh_tulips", "pick_sunflower_bouquet"] },
  greeterdesk: { en: "welcome greeter", vi: "nhân viên đón khách", ipa: "/ˈɡriː.tər desk/", acts: ["greet_welcome_staff", "ask_greeter_for_wheelchair"] },
  kiddiecart: { en: "mini kid cart", vi: "xe đẩy mini hình ô tô", ipa: "/ˈkɪd.i kɑːt/", acts: ["check_kiddie_car_cart"] },
  ecobagrack: { en: "reusable bag stand", vi: "kệ túi vải sinh thái", ipa: "/riːˈjuː.zə.bəl bæɡ stænd/", acts: ["pick_canvas_tote_bag"] },
  specialarch: { en: "special offer banner", vi: "cổng chào khuyến mãi", ipa: "/ˈspeʃ.əl ˈɑf.ər/", acts: ["read_special_offer_arch"] },
  atmmachine: { en: "ATM machine", vi: "cây rút tiền ATM", ipa: "/ˌeɪ.tiːˈem məˈʃiːn/", acts: ["withdraw_cash_at_atm"] },
  watercooler: { en: "water station", vi: "bình nước uống miễn phí", ipa: "/ˈwɔː.tər ˈsteɪ.ʃən/", acts: ["drink_water_at_cooler"] },
  returnbin: { en: "recycling bin", vi: "thùng thu hồi vỏ chai", ipa: "/riːˈsaɪ.klɪŋ bɪn/", acts: ["drop_plastic_bottles_in_bin"] },
  benchseat: { en: "waiting bench", vi: "ghế nghỉ chân lối vào", ipa: "/ˈweɪ.tɪŋ bentʃ/", acts: ["rest_on_entrance_bench"] }
};

const entranceNewActions = [
  mkA("wipe_shoes_on_mat", "welcomemat", "Wipe my shoes on the mat", "Chùi giày trên thảm chào mừng",
    "Let me wipe my wet shoes on the welcome mat before going in.",
    "Để mình chùi khô giày ướt trên thảm chào mừng trước khi bước vào.",
    ["wipe", "welcome mat"], ["wipe_v", "mat"],
    "<b>before + V-ing</b> = trước khi làm gì (before going in = trước khi bước vào).",
    ["Let me wipe my wet shoes", "on the welcome mat before going in."], ["wipe", "wide", "white"],
    ["Please <b>wipe</b> your feet on the <b>welcome mat</b>.", "Wash your hands <b>before eating</b>."],
    once("mke_mat", "yes", "Bạn đã chùi giày trên thảm chào mừng rồi."),
    at("mke_mat", "sweep", 700, [["mke_mat", "yes"]]),
    ["wipe my shoes on the mat", "wipe my wet shoes on the welcome mat", "chùi giày trên thảm chào mừng"]),

  mkA("sanitize_hands_at_door", "sanitizestand", "Use the hand sanitizer", "Xịt nước rửa tay sát khuẩn",
    "I'll pump some hand sanitizer before touching the cart.",
    "Mình sẽ xịt một ít nước rửa tay khô trước khi chạm vào xe đẩy.",
    ["hand sanitizer", "cart"], ["sanitizer", "cart"],
    "<b>pump some hand sanitizer</b> = ấn lấy một ít nước rửa tay khô sát khuẩn.",
    ["I'll pump some hand sanitizer", "before touching the cart."], ["cart", "card", "part"],
    ["There is <b>hand sanitizer</b> by the entrance.", "Sanitize your hands before pushing the <b>shopping cart</b>."],
    once("mke_sanitize", "yes", "Bạn đã sát khuẩn tay rồi."),
    at("mke_sanitize", "reach", 700, [["mke_sanitize", "yes"]]),
    ["use the hand sanitizer", "pump some hand sanitizer at the entrance", "xịt nước rửa tay sát khuẩn"]),

  mkA("take_disinfectant_wipe", "sanitizestand", "Take a sanitizing wipe", "Rút khăn ướt khử trùng",
    "Could I grab a disinfectant wipe from the dispenser?",
    "Cho mình rút một tờ khăn khử trùng từ hộp đựng nhé?",
    ["wipe", "dispenser"], ["sanitize", "dispenser"],
    "<b>from the dispenser</b> = từ cây/hộp đựng giấy hoặc dung dịch tự động.",
    ["Could I grab a disinfectant wipe", "from the dispenser?"], ["grab", "crab", "glad"],
    ["Pull a <b>sanitizing wipe</b> from the <b>dispenser</b>.", "Wipe the basket handle clean."],
    once("mke_wipe", "yes", "Bạn đã lấy khăn ướt khử trùng rồi."),
    at("mke_sanitize", "reach", 700, [["mke_wipe", "yes"]]),
    ["take a sanitizing wipe", "grab a disinfectant wipe from the dispenser", "rút khăn ướt khử trùng"]),

  mkA("pick_up_store_flyer", "flyerrack", "Pick up the deals flyer", "Lấy tờ rơi ưu đãi tuần",
    "I'll pick up a copy of this week's deals flyer.",
    "Mình sẽ lấy một tờ rơi tổng hợp ưu đãi tuần này.",
    ["deals", "flyer"], ["deal", "flyer"],
    "<b>a copy of …</b> = một bản / một tờ (tờ rơi, báo, tạp chí).",
    ["I'll pick up a copy", "of this week's deals flyer."], ["deals", "meals", "wheels"],
    ["Check out this week's <b>weekly deals</b>.", "Take a <b>weekly flyer</b> from the rack."],
    once("mke_flyer2", "yes", "Bạn đã lấy tờ rơi ưu đãi tuần rồi."),
    at("mke_flyer", "reach", 750, [["mke_flyer2", "yes"]]),
    ["pick up the deals flyer", "pick up a copy of the weekly deals flyer", "lấy tờ rơi ưu đãi tuần"]),

  mkA("check_weekend_specials", "flyerrack", "Spot the half-price specials", "Xem món giảm nửa giá cuối tuần",
    "Look, fresh berries and bakery bread are half price this weekend!",
    "Nhìn này, quả mọng tươi và bánh mì giảm nửa giá dịp cuối tuần này!",
    ["half price", "bread"], ["halfprice", "bread"],
    "<b>half price</b> = nửa giá (giảm 50%). Cụm: <b>be half price</b> = đang bán nửa giá.",
    ["Look, fresh berries and bakery bread", "are half price this weekend!"], ["half", "have", "calf"],
    ["Strawberries are <b>half price</b> today!", "We bake fresh <b>bread</b> every morning."],
    once("mke_weekend", "yes", "Bạn đã xem ưu đãi giảm nửa giá cuối tuần rồi."),
    at("mke_flyer", "read", 800, [["mke_weekend", "yes"]]),
    ["spot the half-price specials", "check the weekend half-price specials", "xem món giảm nửa giá cuối tuần"]),

  mkA("print_member_coupons", "couponboard", "Print coupons at the kiosk", "In phiếu giảm giá ở cây kiosk",
    "I'm scanning my app at the kiosk to print discount coupons.",
    "Tôi đang quét ứng dụng ở cây kiosk để in phiếu giảm giá.",
    ["kiosk", "coupons"], ["kiosk", "coupon"],
    "<b>to + động từ nguyên mẫu</b> chỉ mục đích: <b>to print discount coupons</b> = để in phiếu giảm giá.",
    ["I'm scanning my app at the kiosk", "to print discount coupons."], ["print", "point", "paint"],
    ["Scan your member card at the <b>coupon kiosk</b>.", "These <b>coupons</b> save us five dollars."],
    once("mke_kiosk", "yes", "Bạn đã in phiếu giảm giá ở cây kiosk rồi."),
    at("mke_kiosk", "reach", 800, [["mke_kiosk", "yes"]]),
    ["print coupons at the kiosk", "scan my app at the kiosk to print coupons", "in phiếu giảm giá ở cây kiosk"]),

  mkA("clip_two_dollar_voucher", "couponboard", "Take a $2 produce voucher", "Lấy phiếu giảm 2 đô mua rau quả",
    "Awesome, I got a two-dollar voucher for fresh produce!",
    "Tuyệt quá, mình lấy được phiếu giảm hai đô cho quầy rau quả tươi!",
    ["voucher", "fresh"], ["voucher", "fresh"],
    "<b>a two-dollar voucher</b> = phiếu giảm giá trị giá 2 đô (danh từ ghép có gạch nối không thêm s).",
    ["Awesome, I got a two-dollar voucher", "for fresh produce!"], ["voucher", "venture", "vulture"],
    ["Use this <b>voucher</b> at the checkout.", "We're buying lots of <b>fresh</b> fruit."],
    once("mke_voucher", "yes", "Bạn đã lấy phiếu giảm 2 đô rồi."),
    at("mke_kiosk", "reach", 750, [["mke_voucher", "yes"], ["mk_coupon", "yes"]]),
    ["take a $2 produce voucher", "get a two-dollar voucher for fresh produce", "lấy phiếu giảm 2 đô mua rau quả"]),

  mkA("check_store_directory", "storemap", "Check the store directory", "Xem bảng sơ đồ siêu thị",
    "Let's check the store directory—the produce section is right ahead.",
    "Hãy xem sơ đồ siêu thị nào — khu rau củ quả ở ngay phía trước.",
    ["store directory", "section"], ["directory", "section"],
    "<b>right ahead</b> = ở ngay phía trước mặt.",
    ["Let's check the store directory—", "the produce section is right ahead."], ["section", "session", "station"],
    ["Look at the <b>store directory</b> by the door.", "The dairy <b>section</b> is in aisle three."],
    once("mke_map", "yes", "Bạn đã xem sơ đồ siêu thị rồi."),
    at("mke_map", "read", 800, [["mke_map", "yes"]]),
    ["check the store directory", "read the store directory map", "xem bảng sơ đồ siêu thị"]),

  mkA("find_bakery_on_map", "storemap", "Locate the bakery on the map", "Tìm vị trí tiệm bánh trên sơ đồ",
    "According to the map, the artisan bakery is next to the fruit stand.",
    "Theo sơ đồ này thì tiệm bánh thủ công nằm ngay cạnh quầy trái cây.",
    ["bakery", "next to"], ["directory", "bread"],
    "<b>According to …</b> = Theo như … (bản đồ, bảng tin, dự báo thời tiết).",
    ["According to the map,", "the artisan bakery is next to the fruit stand."], ["map", "mat", "cap"],
    ["<b>According to</b> the sign, bread is on sale.", "The bakery is right next to the produce stand."],
    once("mke_mapbakery", "yes", "Bạn đã tìm vị trí tiệm bánh trên sơ đồ rồi."),
    at("mke_map", "point", 750, [["mke_mapbakery", "yes"]]),
    ["locate the bakery on the map", "find the bakery on the store map", "tìm vị trí tiệm bánh trên sơ đồ"]),

  mkA("store_backpack_in_locker", "lockerbox", "Store my backpack in a locker", "Gửi ba lô vào tủ đồ cá nhân",
    "I'll lock my heavy backpack in locker number four while I shop.",
    "Mình sẽ gửi chiếc ba lô nặng vào ngăn tủ số bốn trong lúc mua sắm.",
    ["heavy", "locker"], ["heavy", "locker"],
    "<b>while + mệnh đề</b> = trong lúc … (while I shop = trong lúc tôi mua sắm).",
    ["I'll lock my heavy backpack", "in locker number four while I shop."], ["locker", "lock", "lucky"],
    ["Put your bag in a <b>parcel locker</b>.", "This backpack is too <b>heavy</b> to carry around."],
    once("mke_locker", "yes", "Bạn đã gửi ba lô vào tủ đồ rồi."),
    at("mke_locker", "reach", 800, [["mke_locker", "yes"]]),
    ["store my backpack in a locker", "lock my heavy backpack in locker number four", "gửi ba lô vào tủ đồ cá nhân"]),

  mkA("take_locker_token", "lockerbox", "Put on the locker wristband", "Đeo vòng tay chìa khóa tủ đồ",
    "Don't lose the locker key wristband—we'll need it on the way out.",
    "Đừng làm mất vòng tay chìa khóa tủ nhé — lúc ra về mình sẽ cần nó đấy.",
    ["wristband", "need"], ["wristband", "need"],
    "<b>on the way out</b> = trên đường đi ra / lúc ra về.",
    ["Don't lose the locker key wristband—", "we'll need it on the way out."], ["lose", "loose", "choose"],
    ["Keep the <b>key wristband</b> on your wrist.", "We'll pick up our bag <b>on the way out</b>."],
    once("mke_token", "yes", "Bạn đã đeo vòng chìa khóa tủ đồ rồi."),
    at("mke_locker", "reach", 700, [["mke_token", "yes"]]),
    ["put on the locker wristband", "keep the locker key wristband safe", "đeo vòng tay chìa khóa tủ đồ"]),

  mkA("wrap_wet_umbrella", "umbrellastand", "Bag my wet umbrella", "Cho ô ướt vào túi bọc",
    "I'm sliding my wet umbrella into a plastic sleeve so the floor stays dry.",
    "Tôi đang cho chiếc ô ướt vào túi bọc để sàn nhà không bị ướt.",
    ["umbrella", "plastic sleeve"], ["umbrella", "sleeve"],
    "<b>so (that) + mệnh đề</b> = để mà … (so the floor stays dry = để sàn nhà luôn khô ráo).",
    ["I'm sliding my wet umbrella", "into a plastic sleeve so the floor stays dry."], ["sleeve", "sleep", "leave"],
    ["Put your wet <b>umbrella</b> in a <b>plastic sleeve</b>.", "That keeps the supermarket floor dry and safe."],
    once("mke_umbrella", "yes", "Bạn đã bọc chiếc ô ướt gọn gàng rồi."),
    at("mke_umbrella", "reach", 750, [["mke_umbrella", "yes"]]),
    ["bag my wet umbrella", "slide my wet umbrella into a plastic sleeve", "cho ô ướt vào túi bọc"]),

  mkA("smell_fresh_tulips", "flowerbucket", "Smell the yellow tulips", "Ngửi hương hoa tulip vàng",
    "These yellow tulips by the entrance smell so fresh and cheerful!",
    "Những bó hoa tulip vàng cạnh lối vào thơm mát và rực rỡ quá!",
    ["tulips", "fresh"], ["tulip", "fresh"],
    "<b>smell + tính từ</b> = tỏa hương như thế nào (smell fresh = thơm mát).",
    ["These yellow tulips by the entrance", "smell so fresh and cheerful!"], ["fresh", "flash", "flesh"],
    ["Spring <b>tulips</b> are my favorite flowers.", "They look so bright and <b>fresh</b>."],
    once("mke_tulips", "yes", "Bạn đã thưởng thức hương hoa tulip rồi."),
    at("mke_flowers", "reach", 750, [["mke_tulips", "yes"]]),
    ["smell the yellow tulips", "smell the fresh tulips by the entrance", "ngửi hương hoa tulip vàng"]),

  mkA("pick_sunflower_bouquet", "flowerbucket", "Pick a sunflower bouquet", "Chọn một bó hoa hướng dương",
    "I'll pick up a bright bouquet of sunflowers to brighten up the living room.",
    "Mình sẽ chọn một bó hoa hướng dương rực rỡ để làm bừng sáng phòng khách.",
    ["bouquet", "sunflowers"], ["bouquet", "sunflower"],
    "<b>a bouquet of flowers</b> /buˈkeɪ/ = một bó hoa; <b>brighten up</b> = làm bừng sáng.",
    ["I'll pick up a bright bouquet of sunflowers", "to brighten up the living room."], ["bouquet", "bucket", "buffet"],
    ["She bought a lovely <b>bouquet</b> of <b>sunflowers</b>.", "Fresh flowers brighten up any room."],
    once("mke_sunflower", "yes", "Bạn đã chọn bó hoa hướng dương rồi."),
    at("mke_flowers", "reach", 800, [["mke_sunflower", "yes"]]),
    ["pick a sunflower bouquet", "pick a bright bouquet of sunflowers", "chọn một bó hoa hướng dương"]),

  mkA("greet_welcome_staff", "greeterdesk", "Greet the welcome staff", "Chào hỏi nhân viên đón khách",
    "Good morning! Is the fresh bakery open already?",
    "Chào buổi sáng! Quầy bánh mới nướng đã mở cửa chưa ạ?",
    ["bakery", "open"], ["greeter", "bread"],
    "<b>Is … open already?</b> = … đã mở cửa chưa?",
    ["Good morning!", "Is the fresh bakery open already?"], ["open", "often", "oven"],
    ["Say hello to the <b>welcome greeter</b> at the door.", "The bakery is <b>open</b> from 7 a.m."],
    once("mke_greet", "yes", "Bạn đã chào hỏi nhân viên đón khách rồi."),
    at("mke_greeter", "point", 750, [["mke_greet", "yes"]]),
    ["greet the welcome staff", "ask the greeter if the fresh bakery is open", "chào hỏi nhân viên đón khách"]),

  mkA("ask_greeter_for_wheelchair", "greeterdesk", "Ask for a child-seat cart", "Hỏi mượn xe đẩy có ghế trẻ em",
    "Excuse me, where can I borrow a small cart with a child seat?",
    "Xin lỗi, mình có thể mượn xe đẩy có ghế ngồi trẻ em ở đâu ạ?",
    ["cart", "child seat"], ["cart", "childseat"],
    "<b>a cart with a child seat</b> = xe đẩy có ghế ngồi an toàn cho bé.",
    ["Excuse me, where can I borrow", "a small cart with a child seat?"], ["seat", "sit", "set"],
    ["This <b>shopping cart</b> has a fold-down <b>child seat</b>.", "Ask the staff at the welcome desk."],
    once("mke_childcart", "yes", "Bạn đã hỏi chỗ lấy xe đẩy có ghế trẻ em rồi."),
    at("mke_greeter", "point", 750, [["mke_childcart", "yes"]]),
    ["ask for a child-seat cart", "ask where to get a cart with a child seat", "hỏi mượn xe đẩy có ghế trẻ em"]),

  mkA("check_kiddie_car_cart", "kiddiecart", "Admire the mini car cart", "Xem xe đẩy mini hình ô tô",
    "Kids love riding in these little red car carts while their parents shop.",
    "Trẻ con rất thích ngồi trong mấy chiếc xe đẩy hình ô tô đỏ nhỏ xinh này khi bố mẹ đi chợ.",
    ["car carts", "shop"], ["kiddie", "cart"],
    "<b>love + V-ing</b> = rất thích làm gì (love riding = thích ngồi/lái).",
    ["Kids love riding in these little red car carts", "while their parents shop."], ["riding", "reading", "hiding"],
    ["Push the <b>kiddie cart</b> carefully down the aisle.", "Little kids love the toy steering wheel."],
    once("mke_kiddie", "yes", "Bạn đã xem chiếc xe đẩy mini hình ô tô rồi."),
    at("mke_kiddie", "reach", 750, [["mke_kiddie", "yes"]]),
    ["admire the mini car cart", "check out the red kiddie car cart", "xem xe đẩy mini hình ô tô"]),

  mkA("pick_canvas_tote_bag", "ecobagrack", "Grab a canvas tote bag", "Lấy túi vải bố dùng nhiều lần",
    "I'll grab a sturdy canvas tote bag from the entrance rack.",
    "Mình sẽ lấy một chiếc túi vải bố chắc chắn trên kệ ngay lối vào.",
    ["sturdy", "canvas tote bag"], ["sturdy", "totebag"],
    "<b>sturdy</b> = chắc chắn, bền bỉ (không lo bị đứt quai khi đựng đồ nặng).",
    ["I'll grab a sturdy canvas tote bag", "from the entrance rack."], ["sturdy", "study", "steady"],
    ["A <b>canvas tote bag</b> can hold heavy groceries.", "These reusable handles are very <b>sturdy</b>."],
    once("mke_tote", "yes", "Bạn đã lấy túi vải bố sinh thái rồi."),
    at("mke_ecobag", "reach", 750, [["mke_tote", "yes"], ["mk_bag", "eco"]]),
    ["grab a canvas tote bag", "grab a sturdy canvas tote bag from the rack", "lấy túi vải bố dùng nhiều lần"]),

  mkA("read_special_offer_arch", "specialarch", "Read the Special Offer banner", "Đọc cổng chào Ưu đãi đặc biệt",
    "The banner says 'Special Offer: Buy 2 Get 1 Free on Artisan Pastries'!",
    "Biển cổng chào ghi 'Ưu đãi đặc biệt: Mua 2 tặng 1 cho bánh ngọt thủ công'!",
    ["Special Offer", "Pastries"], ["banner", "pastry"],
    "<b>Buy 2 Get 1 Free</b> = Mua 2 tặng 1 miễn phí.",
    ["The banner says 'Special Offer:", "Buy 2 Get 1 Free on Artisan Pastries'!"], ["offer", "over", "other"],
    ["Don't miss today's <b>special offer</b>!", "Fresh <b>pastries</b> are buy two, get one free."],
    once("mke_arch", "yes", "Bạn đã đọc cổng chào ưu đãi đặc biệt rồi."),
    at("mk_sign", "read", 800, [["mke_arch", "yes"]]),
    ["read the Special Offer banner", "read the buy 2 get 1 free pastry banner", "đọc cổng chào Ưu đãi đặc biệt"]),

  mkA("withdraw_cash_at_atm", "atmmachine", "Withdraw $20 at the ATM", "Rút 20 đô tiền mặt ở cây ATM",
    "Let me withdraw twenty dollars from the ATM just in case I need cash.",
    "Để mình rút hai mươi đô ở cây ATM phòng khi cần dùng tiền mặt.",
    ["withdraw", "ATM"], ["withdraw", "atm"],
    "<b>just in case + mệnh đề</b> = phòng khi … (just in case I need cash).",
    ["Let me withdraw twenty dollars from the ATM", "just in case I need cash."], ["cash", "catch", "case"],
    ["You can <b>withdraw</b> cash at the <b>ATM</b>.", "Bring an umbrella <b>just in case</b> it rains."],
    once("mke_atm", "yes", "Bạn đã rút tiền mặt dự phòng ở cây ATM rồi."),
    at("mke_atm", "reach", 800, [["mke_atm", "yes"]]),
    ["withdraw $20 at the ATM", "withdraw cash from the supermarket ATM", "rút 20 đô tiền mặt ở cây ATM"]),

  mkA("drink_water_at_cooler", "watercooler", "Have a cup of cool water", "Uống một cốc nước mát miễn phí",
    "I'm having a quick cup of cool water before starting my grocery run.",
    "Mình uống nhanh một cốc nước mát trước khi bắt đầu buổi mua sắm.",
    ["cool water", "water"], ["cooler", "water"],
    "<b>grocery run</b> = chuyến đi mua đồ tạp hóa / đi siêu thị nhanh.",
    ["I'm having a quick cup of cool water", "before starting my grocery run."], ["water", "waiter", "winter"],
    ["Get a paper cup from the <b>water cooler</b>.", "Stay hydrated with <b>cool water</b>."],
    once("mke_water", "yes", "Bạn đã uống một cốc nước mát rồi."),
    at("mke_water", "drink", 800, [["mke_water", "yes"]]),
    ["have a cup of cool water", "drink a cup of water at the cooler", "uống một cốc nước mát miễn phí"]),

  mkA("drop_plastic_bottles_in_bin", "returnbin", "Recycle empty plastic bottles", "Bỏ vỏ chai nhựa vào thùng tái chế",
    "I'm dropping my empty plastic bottles into the recycling bin for bonus points.",
    "Tôi đang bỏ mấy vỏ chai nhựa rỗng vào thùng tái chế để tích điểm thưởng.",
    ["recycling bin", "points"], ["recycle", "points"],
    "<b>drop … into …</b> = thả/bỏ cái gì vào trong thùng.",
    ["I'm dropping my empty plastic bottles", "into the recycling bin for bonus points."], ["bin", "pin", "win"],
    ["Put empty cans and bottles in the <b>recycling bin</b>.", "You earn green <b>points</b> for recycling!"],
    once("mke_recycle", "yes", "Bạn đã bỏ vỏ chai vào thùng tái chế rồi."),
    at("mke_recycle", "reach", 750, [["mke_recycle", "yes"]]),
    ["recycle empty plastic bottles", "drop plastic bottles into the recycling bin", "bỏ vỏ chai nhựa vào thùng tái chế"]),

  mkA("rest_on_entrance_bench", "benchseat", "Check my list on the bench", "Ngồi ghế kiểm tra danh sách mua đồ",
    "Let me sit on the bench for a moment and check my shopping list.",
    "Để mình ngồi nghỉ trên ghế một lát và kiểm tra lại danh sách đồ cần mua.",
    ["bench", "shopping list"], ["bench", "list"],
    "<b>for a moment</b> = trong chốc lát; <b>shopping list</b> = danh sách đồ cần mua.",
    ["Let me sit on the bench for a moment", "and check my shopping list."], ["list", "least", "last"],
    ["Take a rest on the <b>waiting bench</b>.", "Did we cross everything off our <b>shopping list</b>?"],
    once("mke_bench", "yes", "Bạn đã kiểm tra danh sách mua sắm trên ghế rồi."),
    at("mke_bench", "read", 800, [["mke_bench", "yes"]]),
    ["check my list on the bench", "sit on the bench and check my shopping list", "ngồi ghế kiểm tra danh sách mua đồ"])
];

const entranceActions = [
  ...S.allActions.filter(a => S.ENTRANCE_OBJS.has(a.obj)),
  ...entranceNewActions
];

const market_entrance = {
  id: "market_entrance", topic: "market", icon: "🛒", zoneOrder: 1,
  name: "Entrance & Carts", nameVi: "Lối vào & Xe đẩy", names: ["Entrance & Carts", "Lối vào & Xe đẩy"],
  go: {
    label: "Head to the entrance & carts",
    labelVi: "Qua khu lối vào & xe đẩy",
    sentence: "I'm heading to the entrance to grab a cart.",
    vi: "Tôi đang đi ra khu lối vào để lấy xe đẩy.",
    key: ["heading", "entrance", "cart"],
    chunks: ["I'm heading to the entrance", "to grab a cart."],
    grammar: "<b>head to …</b> = đi về phía / chuyển sang khu … trong siêu thị.",
    patterns: ["I'm heading to <b>the produce section</b>.", "I'm heading to <b>the bakery counter</b>."],
    vocab: [["head to", "/hed tuː/", "đi về phía"], ["entrance", "/ˈen.trəns/", "lối vào"]],
    story: ["head to the supermarket entrance", "walk to the supermarket entrance", "đi ra khu lối vào & xe đẩy"]
  },
  shellSvg: entranceShell,
  worldSvg: entranceWorld,
  W0: MK_W0,
  spots: {
    mke_door: { x: 112, y: 470, d: -1 },
    mke_mat: { x: 145, y: 462, d: -1 },
    mke_umbrella: { x: 112, y: 432, d: -1 },
    mke_recycle: { x: 118, y: 548, d: -1 },
    mke_locker: { x: 170, y: 372, d: 1 },
    mke_atm: { x: 248, y: 372, d: 1 },
    mke_water: { x: 308, y: 372, d: 1 },
    mk_sign: { x: 400, y: 376, d: 1 },
    mke_flyer: { x: 503, y: 376, d: 1 },
    mke_kiosk: { x: 583, y: 376, d: 1 },
    mke_map: { x: 687, y: 376, d: 1 },
    mke_flowers: { x: 817, y: 386, d: 1 },
    mke_greeter: { x: 912, y: 396, d: 1 },
    mke_sanitize: { x: 212, y: 476, d: -1 },
    mk_baskets: { x: 304, y: 488, d: 1 },
    mke_ecobag: { x: 408, y: 488, d: 1 },
    mk_carts: { x: 240, y: 584, d: -1 },
    mke_kiddie: { x: 395, y: 584, d: 1 },
    mk_sample: { x: 594, y: 576, d: 1 },
    mke_bench: { x: 804, y: 580, d: 1 }
  },
  obstacles: [],
  entry: { x: 145, y: 510, d: 1 },
  objects: entranceObjects,
  actions: entranceActions,
  props: S.MK_PROPS,
  applyState(W, root) { mirrorState(W, MK_W0, root); },
  css: S.marketCss,
  catalog: cat("mke_", [
    ["welcome mat", "/ˈwel.kəm mæt/", "thảm chào mừng", "equipment"],
    ["hand sanitizer", "/ˈhænd ˌsæn.ɪ.taɪ.zər/", "nước rửa tay khô", "other"],
    ["weekly flyer", "/ˈwiːk.li ˈflaɪ.ər/", "tờ rơi khuyến mãi tuần", "other"],
    ["coupon kiosk", "/ˈkuː.pɑn ˈkiː.ɑsk/", "cây in phiếu giảm giá", "equipment"],
    ["store directory", "/stɔːr dəˈrek.tər.i/", "bảng sơ đồ siêu thị", "place"],
    ["parcel locker", "/ˈpɑː.səl ˈlɑk.ər/", "tủ gửi đồ cá nhân", "equipment"],
    ["umbrella stand", "/ʌmˈbrel.ə stænd/", "kệ để ô dù", "equipment"],
    ["bouquet", "/buˈkeɪ/", "bó hoa tươi", "other"],
    ["welcome greeter", "/ˈwel.kəm ˈɡriː.tər/", "nhân viên đón khách", "people"],
    ["kiddie cart", "/ˈkɪd.i kɑːt/", "xe đẩy trẻ em hình ô tô", "equipment"],
    ["canvas tote bag", "/ˈkæn.vəs toʊt bæɡ/", "túi vải bố", "other"],
    ["special offer", "/ˈspeʃ.əl ˈɑf.ər/", "ưu đãi đặc biệt", "money"]
  ])
};


/* =====================================================================
   ZONE 2: market_produce — Rau quả & Tiệm bánh (Produce & Bakery)
   21 Objects · 42 Actions · 30 NPC Replies (72 Sentences)
   ===================================================================== */
const produceShell = `
${sharedDefs}
<rect x="108" y="0" width="892" height="336" fill="url(#mkzWall)"/>
<polygon points="0,0 108,0 108,336 0,640" fill="url(#mkzLeftWall)"/>
<polygon points="108,336 1000,336 1000,640 0,640" fill="url(#mkzFloor)"/>
${D("floor-tiles", floorGrid)}
<rect x="0" y="0" width="1000" height="38" fill="url(#mkzSoffit)"/>
<rect x="108" y="38" width="460" height="10" fill="#3a9d5d"/>
<rect x="568" y="38" width="432" height="10" fill="#d97b29"/>
<text x="340" y="25" font-size="13.5" font-weight="900" fill="#d8f8dc" text-anchor="middle" letter-spacing="2.5">🍎 FARM FRESH PRODUCE</text>
<text x="780" y="25" font-size="13.5" font-weight="900" fill="#ffe8b8" text-anchor="middle" letter-spacing="2.5">🥖 ARTISAN BAKERY &amp; PASTRY</text>
${D("pendant-lights", pendantLamp(210, 62) + pendantLamp(430, 62) + pendantLamp(660, 62) + pendantLamp(890, 62))}
${D("hanging-banners", `
  <g transform="translate(275,50)">
    <rect x="0" y="0" width="136" height="24" rx="5" fill="#f5d34a" stroke="#c99a1d" stroke-width="1.5"/>
    <text x="68" y="16" font-size="10" font-weight="900" fill="#9c241b" text-anchor="middle">ORGANIC · DAILY FRESH</text>
  </g>
  <g transform="translate(690,50)">
    <rect x="0" y="0" width="150" height="24" rx="5" fill="#c2453b" stroke="#f5d34a" stroke-width="1.5"/>
    <text x="75" y="16" font-size="10" font-weight="900" fill="#fff" text-anchor="middle">HOT FROM THE OVEN</text>
  </g>
`)}
`;

const produceWorld = [
  /* 1. leafygreens — misty leafy greens chilled wall rack */
  objG("leafygreens", "leafy greens rack", "kệ rau xanh phun sương", 342, 64, 154, `
    <rect class="hit" x="12" y="158" width="96" height="252"/>
    <polygon points="16,406 104,328 104,154 16,220" fill="#2b4c3b" stroke="#1b3326" stroke-width="2.5"/>
    <rect x="22" y="166" width="76" height="18" rx="3" fill="#3a9d5d"/>
    <text x="60" y="178" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">LEAFY GREENS</text>
    <!-- Shelves of crisp greens -->
    <g fill="#5bbd68" stroke="#2f7f4b" stroke-width="1.2">
      <ellipse cx="42" cy="222" rx="14" ry="10"/><ellipse cx="66" cy="214" rx="14" ry="10"/><ellipse cx="86" cy="206" rx="12" ry="9"/>
      <ellipse cx="42" cy="268" rx="15" ry="11" fill="#3a9d5d"/><ellipse cx="68" cy="260" rx="15" ry="11" fill="#4aa958"/><ellipse cx="88" cy="252" rx="12" ry="9" fill="#3a9d5d"/>
      <ellipse cx="44" cy="316" rx="15" ry="10" fill="#72cc78"/><ellipse cx="70" cy="306" rx="15" ry="10" fill="#5bbd68"/>
    </g>
    <!-- Cool mist droplets -->
    <g fill="#dff6ff" opacity=".75"><circle cx="36" cy="198" r="2"/><circle cx="58" cy="194" r="2.2"/><circle cx="80" cy="190" r="2"/></g>
  `),
  /* 2. organicstand — Organic Farm canopy stand */
  objG("organicstand", "organic farm stand", "quầy nông sản hữu cơ", 344, 174, 114, `
    <rect class="hit" x="116" y="118" width="116" height="218"/>
    <rect x="120" y="124" width="108" height="208" rx="5" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <!-- Striped green-white organic canopy -->
    <rect x="116" y="120" width="116" height="24" rx="4" fill="#2f7f4b" stroke="#1e5631" stroke-width="1.5"/>
    <text x="174" y="136" font-size="9.5" font-weight="900" fill="#fff8dc" text-anchor="middle">100% ORGANIC</text>
    <rect x="124" y="192" width="100" height="6" fill="#75451e"/>
    <rect x="124" y="252" width="100" height="6" fill="#75451e"/>
    <!-- Organic spinach boxes & apples -->
    <g>
      <rect x="130" y="164" width="38" height="26" rx="3" fill="#b8e994" stroke="#2f7f4b" stroke-width="1.5"/>
      <text x="149" y="180" font-size="6.5" font-weight="900" fill="#1e5631" text-anchor="middle">SPINACH</text>
      <rect x="174" y="164" width="42" height="26" rx="3" fill="#b8e994" stroke="#2f7f4b" stroke-width="1.5"/>
      <text x="195" y="180" font-size="6.5" font-weight="900" fill="#1e5631" text-anchor="middle">KALE</text>
      <g fill="#d8453a"><circle cx="140" cy="240" r="8"/><circle cx="156" cy="240" r="8"/><circle cx="148" cy="230" r="7.5"/></g>
      <g fill="#78c850"><circle cx="186" cy="240" r="8"/><circle cx="204" cy="240" r="8"/><circle cx="195" cy="230" r="7.5"/></g>
      <rect x="134" y="274" width="80" height="24" rx="4" fill="#fff8ec"/>
      <text x="174" y="290" font-size="8.5" font-weight="900" fill="#2f7f4b" text-anchor="middle">PESTICIDE FREE</text>
    </g>
  `),
  /* 3. berrycooler — chilled strawberry, blueberry & cherry display */
  objG("berrycooler", "chilled berry stand", "tủ mát dâu tây & việt quất", 344, 294, 120, `
    <rect class="hit" x="240" y="124" width="108" height="212"/>
    <rect x="244" y="128" width="100" height="204" rx="6" fill="#dce6ee" stroke="#7f93a3" stroke-width="2"/>
    <rect x="248" y="132" width="92" height="20" rx="4" fill="#c2453b"/>
    <text x="294" y="146" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">SWEET BERRIES</text>
    <rect x="250" y="156" width="88" height="162" fill="url(#mkzGlass)"/>
    <rect x="250" y="210" width="88" height="5" fill="#7f93a3"/>
    <rect x="250" y="264" width="88" height="5" fill="#7f93a3"/>
    <!-- Strawberries, Blueberries, Cherries punnets -->
    <g>
      <rect x="256" y="182" width="34" height="24" rx="3" fill="#ffd6dc" stroke="#d8453a"/>
      <circle cx="266" cy="192" r="5" fill="#d8453a"/><circle cx="278" cy="192" r="5" fill="#d8453a"/>
      <rect x="296" y="182" width="34" height="24" rx="3" fill="#d6e6ff" stroke="#3b6ec2"/>
      <circle cx="306" cy="192" r="4.5" fill="#2c4c8c"/><circle cx="316" cy="192" r="4.5" fill="#2c4c8c"/><circle cx="322" cy="194" r="4" fill="#2c4c8c"/>
      <rect x="256" y="236" width="74" height="24" rx="3" fill="#ffe6eb" stroke="#9c1f2e"/>
      <circle cx="270" cy="248" r="5" fill="#8f1624"/><circle cx="284" cy="248" r="5" fill="#8f1624"/><circle cx="298" cy="248" r="5" fill="#8f1624"/><circle cx="312" cy="248" r="5" fill="#8f1624"/>
      <rect x="260" y="282" width="66" height="20" rx="3" fill="#f5d34a"/>
      <text x="293" y="296" font-size="8" font-weight="900" fill="#9c241b" text-anchor="middle">SPECIAL $3.99</text>
    </g>
  `),
  /* 4. herbpotstand — potted fresh kitchen herbs rack */
  objG("herbpotstand", "fresh herbs rack", "kệ rau thơm trồng chậu", 344, 404, 132, `
    <rect class="hit" x="354" y="138" width="96" height="198"/>
    <rect x="358" y="144" width="88" height="188" rx="5" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="362" y="148" width="80" height="18" rx="3" fill="#3a9d5d"/>
    <text x="402" y="160" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">FRESH HERBS</text>
    <rect x="362" y="220" width="80" height="5" fill="#75451e"/>
    <rect x="362" y="280" width="80" height="5" fill="#75451e"/>
    <!-- Terracotta pots with green basil & cilantro -->
    <g>
      <polygon points="370,204 388,204 385,220 373,220" fill="#d36b38"/><circle cx="379" cy="194" r="11" fill="#46a758"/>
      <polygon points="410,204 428,204 425,220 413,220" fill="#d36b38"/><circle cx="419" cy="194" r="11" fill="#3a9d5d"/>
      <polygon points="370,264 388,264 385,280 373,280" fill="#d36b38"/><circle cx="379" cy="254" r="11" fill="#5bbd68"/>
      <polygon points="410,264 428,264 425,280 413,280" fill="#d36b38"/><circle cx="419" cy="254" r="11" fill="#46a758"/>
    </g>
  `),
  /* 5. cutfruitbar — chilled pre-cut fruit & salad bar */
  objG("cutfruitbar", "fresh cut fruit bar", "tủ trái cây cắt sẵn", 344, 508, 138, `
    <rect class="hit" x="456" y="144" width="102" height="192"/>
    <rect x="460" y="148" width="94" height="184" rx="6" fill="#eef4f8" stroke="#7f93a3" stroke-width="2"/>
    <rect x="464" y="152" width="86" height="18" rx="3" fill="#e8743b"/>
    <text x="507" y="164" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">CUT FRUIT &amp; SALAD</text>
    <rect x="466" y="176" width="82" height="140" fill="url(#mkzGlass)"/>
    <!-- Watermelon slices & mixed fruit cups -->
    <g>
      <path d="M474 216 L490 192 L506 216 Z" fill="#e84a5f" stroke="#2f7f4b" stroke-width="2.5"/>
      <path d="M512 216 L528 192 L544 216 Z" fill="#e84a5f" stroke="#2f7f4b" stroke-width="2.5"/>
      <rect x="474" y="236" width="28" height="30" rx="4" fill="#fff8ec" stroke="#c99a1d"/>
      <circle cx="484" cy="248" r="5" fill="#f5a623"/><circle cx="494" cy="252" r="5" fill="#78c850"/>
      <rect x="510" y="236" width="28" height="30" rx="4" fill="#fff8ec" stroke="#c99a1d"/>
      <circle cx="520" cy="248" r="5" fill="#d8453a"/><circle cx="530" cy="252" r="5" fill="#f5d34a"/>
    </g>
  `),
  /* 6. bakeryoven — warm brick bakery oven & Master Baker NPC */
  objG("bakeryoven", "bakery oven & baker", "lò nướng bánh & thợ làm bánh", 346, 636, 114, `
    <rect class="hit" x="568" y="118" width="132" height="218"/>
    <rect x="572" y="122" width="124" height="210" rx="6" fill="#b85a3a" stroke="#7d3720" stroke-width="2.5"/>
    <rect x="578" y="128" width="112" height="20" rx="4" fill="#5a2d18"/>
    <text x="634" y="142" font-size="9" font-weight="900" fill="#ffe082" text-anchor="middle">🔥 BRICK OVEN</text>
    <!-- Glowing oven arch -->
    <path d="M588 232 V188 Q634 156 680 188 V232 Z" fill="#2d1810" stroke="#f5a623" stroke-width="2.5"/>
    <path d="M596 230 V196 Q634 172 672 196 V230 Z" fill="#ff9f43" opacity=".88"/>
    <ellipse cx="620" cy="222" rx="14" ry="6" fill="#d9822b"/><ellipse cx="648" cy="222" rx="14" ry="6" fill="#d9822b"/>
    <!-- Master Baker NPC -->
    <g>
      <rect x="616" y="264" width="36" height="58" rx="10" fill="#ffffff" stroke="#c9b9a0" stroke-width="1.5"/>
      <circle cx="634" cy="246" r="14" fill="#f2c49b"/>
      <path d="M620 236 V218 Q634 208 648 218 V236 Z" fill="#ffffff" stroke="#c9b9a0" stroke-width="1.5"/>
      <circle cx="629" cy="246" r="1.8" fill="#2d2a26"/><circle cx="639" cy="246" r="1.8" fill="#2d2a26"/>
      <path d="M629 253 Q634 257 639 253" stroke="#8a2f3c" stroke-width="1.8" fill="none"/>
    </g>
  `),
  /* 7. bakery — multi-tier wooden artisan bread rack (preserved from market) */
  objG("bakery", "bakery shelf", "kệ bánh mì nướng", 346, 766, 98, `
    <rect class="hit" x="706" y="104" width="122" height="232"/>
    <rect x="710" y="108" width="114" height="224" rx="5" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2.5"/>
    <rect x="714" y="114" width="106" height="20" rx="3" fill="#8c562b"/>
    <text x="767" y="128" font-size="9.5" font-weight="900" fill="#fff8dc" text-anchor="middle">ARTISAN BREAD</text>
    <g fill="#75451e"><rect x="714" y="180" width="106" height="6"/><rect x="714" y="236" width="106" height="6"/><rect x="714" y="290" width="106" height="6"/></g>
    <!-- Baguettes, loaves, whole-wheat rolls -->
    <g fill="#e3a24a" stroke="#9e5f19" stroke-width="1.4">
      <ellipse cx="742" cy="170" rx="22" ry="8"/><ellipse cx="792" cy="170" rx="22" ry="8"/>
      <g class="mk-loaf"><path d="M722 234 Q742 204 762 234 Z" fill="#d98938"/></g>
      <path d="M772 234 Q792 204 812 234 Z" fill="#d98938"/>
      <circle cx="734" cy="280" r="9" fill="#b9772d"/><circle cx="766" cy="280" r="9" fill="#b9772d"/><circle cx="798" cy="280" r="9" fill="#b9772d"/>
    </g>
    <rect x="728" y="302" width="78" height="18" rx="3" fill="#f5d34a"/>
    <text x="767" y="314" font-size="8" font-weight="900" fill="#75451e" text-anchor="middle">FRESH BAKED $2.50</text>
  `),
  /* 8. breadslicer — automatic bread slicing machine */
  objG("breadslicer", "bread slicer", "máy cắt lát bánh mì", 346, 868, 174, `
    <rect class="hit" x="832" y="180" width="68" height="156"/>
    <rect x="836" y="186" width="60" height="146" rx="5" fill="#d8453a" stroke="#8f2c24" stroke-width="2"/>
    <rect x="842" y="196" width="48" height="44" rx="3" fill="url(#mkzGlass)" stroke="#5b5f66" stroke-width="1.5"/>
    <g stroke="#9aa6af" stroke-width="1.2"><path d="M852 198 V238 M860 198 V238 M868 198 V238 M876 198 V238"/></g>
    <ellipse cx="866" cy="224" rx="14" ry="7" fill="#d9944a"/>
    <circle cx="854" cy="256" r="5" fill="#2ecc71"/><circle cx="876" cy="256" r="5" fill="#f5d34a"/>
    <text x="866" y="286" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">BREAD</text>
    <text x="866" y="298" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">SLICER</text>
  `),
  /* 9. jamhoneyrack — fruit jam & wildflower honey shelf */
  objG("jamhoneyrack", "jam & honey shelf", "kệ mứt trái cây & mật ong", 346, 948, 148, `
    <rect class="hit" x="904" y="152" width="88" height="184"/>
    <rect x="908" y="156" width="80" height="176" rx="5" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="912" y="160" width="72" height="16" rx="3" fill="#c2453b"/>
    <text x="948" y="171" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">JAM &amp; HONEY</text>
    <rect x="912" y="216" width="72" height="5" fill="#75451e"/>
    <rect x="912" y="268" width="72" height="5" fill="#75451e"/>
    <!-- Red jam jars & golden honey jars -->
    <g>
      <rect x="920" y="192" width="14" height="22" rx="3" fill="#d8453a"/><rect x="919" y="189" width="16" height="4" fill="#fff"/>
      <rect x="942" y="192" width="14" height="22" rx="3" fill="#d8453a"/><rect x="941" y="189" width="16" height="4" fill="#fff"/>
      <rect x="964" y="192" width="14" height="22" rx="3" fill="#8e44ad"/><rect x="963" y="189" width="16" height="4" fill="#fff"/>
      <rect x="922" y="242" width="16" height="24" rx="4" fill="#f5a623"/><rect x="921" y="239" width="18" height="4" fill="#5a3d1f"/>
      <rect x="952" y="242" width="16" height="24" rx="4" fill="#f5a623"/><rect x="951" y="239" width="18" height="4" fill="#5a3d1f"/>
    </g>
  `),
  /* 10. produce — main apple, banana & vegetable wooden crate stand (preserved from market) */
  objG("produce", "apple & banana stand", "quầy táo, chuối & rau củ", 468, 198, 356, `
    <rect class="hit" x="112" y="362" width="174" height="114"/>
    <ellipse cx="199" cy="472" rx="86" ry="7" fill="#000" opacity=".16"/>
    <polygon points="116,404 282,404 272,432 126,432" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="126" y="432" width="146" height="38" fill="url(#mkzWoodDark)" stroke="#5a3515" stroke-width="2"/>
    <path d="M174 432 V470 M224 432 V470" stroke="#5a3515" stroke-width="2"/>
    <g class="mk-apples" fill="#d8453a"><circle cx="138" cy="400" r="8.5"/><circle cx="154" cy="396" r="8.5"/><circle cx="168" cy="400" r="8.5"/><circle cx="146" cy="388" r="8"/><circle cx="162" cy="388" r="8"/></g>
    <g class="mk-bananas" fill="#f5d34a" stroke="#b58512" stroke-width="1.2"><path d="M182 402 Q194 376 218 382 Q200 390 192 402 Z"/><path d="M190 402 Q202 380 224 388 Q206 394 198 402 Z"/></g>
    <g fill="#46a758"><ellipse cx="244" cy="396" rx="14" ry="10"/><ellipse cx="262" cy="398" rx="12" ry="9"/></g>
    <g font-size="8.5" font-weight="900" fill="#fff8dc">
      <text x="150" y="454" text-anchor="middle">APPLES $3</text>
      <text x="199" y="454" text-anchor="middle">BANANAS</text>
      <text x="248" y="454" text-anchor="middle">BROCCOLI</text>
    </g>
  `),
  /* 11. citrusbin — citrus oranges, lemons & ripe mangoes crate */
  objG("citrusbin", "citrus & mango crate", "thùng cam chanh & xoài chín", 468, 356, 368, `
    <rect class="hit" x="292" y="372" width="128" height="104"/>
    <ellipse cx="356" cy="472" rx="62" ry="6" fill="#000" opacity=".15"/>
    <polygon points="296,406 416,406 408,434 304,434" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="304" y="434" width="104" height="36" fill="url(#mkzWoodDark)" stroke="#5a3515" stroke-width="2"/>
    <!-- Oranges, yellow lemons, mangoes -->
    <g fill="#f58220"><circle cx="314" cy="400" r="8"/><circle cx="328" cy="396" r="8"/><circle cx="322" cy="388" r="7.5"/></g>
    <g fill="#ffe047"><ellipse cx="354" cy="400" rx="8" ry="6"/><ellipse cx="368" cy="398" rx="8" ry="6"/><ellipse cx="361" cy="390" rx="8" ry="6"/></g>
    <g fill="#f5a623"><ellipse cx="390" cy="398" rx="10" ry="7"/><ellipse cx="404" cy="400" rx="9" ry="6.5"/></g>
    <text x="356" y="456" font-size="8.5" font-weight="900" fill="#fff8dc" text-anchor="middle">CITRUS &amp; MANGO</text>
  `),
  /* 12. fruitscale — digital produce scale & label printer (preserved from market) */
  objG("fruitscale", "digital scale", "cân điện tử & in tem", 468, 464, 348, `
    <rect class="hit" x="424" y="354" width="80" height="122"/>
    <ellipse cx="464" cy="472" rx="34" ry="5" fill="#000" opacity=".15"/>
    <rect x="434" y="414" width="60" height="56" rx="4" fill="#dfe3e6" stroke="#7f93a3" stroke-width="2"/>
    <rect x="438" y="384" width="52" height="30" rx="4" fill="url(#mkzChrome)" stroke="#7f93a3" stroke-width="1.5"/>
    <ellipse cx="464" cy="380" rx="26" ry="5" fill="#b8c4ce" stroke="#6c7a86" stroke-width="1.5"/>
    <rect x="444" y="390" width="40" height="14" rx="2" fill="#1e272e"/>
    <text class="mk-w0" x="464" y="400" font-size="9" font-weight="900" fill="#7fd0c8" text-anchor="middle">0.00 kg</text>
    <text class="mk-w1" x="464" y="400" font-size="9" font-weight="900" fill="#7fd0c8" text-anchor="middle">1.00 kg</text>
    <g class="mk-scaleApples" fill="#d8453a"><circle cx="456" cy="374" r="6.5"/><circle cx="468" cy="373" r="6.5"/><circle cx="476" cy="376" r="6"/></g>
    <text x="464" y="446" font-size="8" font-weight="900" fill="#2c3e50" text-anchor="middle">WEIGH &amp; PRINT</text>
  `),
  /* 13. producebag — roll of clear produce bags on stand */
  objG("producebag", "produce bag roll", "cuộn túi đựng rau quả", 468, 534, 356, `
    <rect class="hit" x="508" y="362" width="52" height="114"/>
    <ellipse cx="534" cy="472" rx="18" ry="4" fill="#000" opacity=".14"/>
    <rect x="531" y="386" width="6" height="84" fill="#5b6770"/>
    <rect x="518" y="370" width="32" height="22" rx="4" fill="#3a9d5d"/>
    <path d="M522 392 h24 l-3 34 h-18 z" fill="#eff9fd" opacity=".85" stroke="#8ab6cc" stroke-dasharray="3 2"/>
    <text x="534" y="384" font-size="7" font-weight="900" fill="#fff" text-anchor="middle">BAGS</text>
  `),
  /* 14. produceclerk — friendly Produce Specialist NPC */
  objG("produceclerk", "produce specialist", "nhân viên quầy rau quả", 468, 600, 344, `
    <rect class="hit" x="566" y="350" width="68" height="126"/>
    <ellipse cx="600" cy="472" rx="26" ry="5" fill="#000" opacity=".15"/>
    <rect x="582" y="396" width="36" height="68" rx="10" fill="#2f7f4b"/>
    <rect x="588" y="408" width="24" height="48" rx="3" fill="#fff8ec"/>
    <circle cx="600" cy="378" r="14" fill="#f2c49b"/>
    <path d="M585 374 Q600 356 615 374 Z" fill="#3a9d5d"/>
    <circle cx="595" cy="379" r="1.8" fill="#2d2a26"/><circle cx="605" cy="379" r="1.8" fill="#2d2a26"/>
    <path d="M595 385 Q600 389 605 385" stroke="#8a2f3c" stroke-width="1.8" fill="none"/>
  `),
  /* 15. mkpastrycase — curved glass croissant & cinnamon roll case */
  objG("mkpastrycase", "croissant & pastry case", "tủ kính bánh sừng bò & bánh ngọt", 468, 718, 356, `
    <rect class="hit" x="642" y="362" width="152" height="114"/>
    <ellipse cx="718" cy="472" rx="74" ry="6" fill="#000" opacity=".16"/>
    <path d="M648 432 L658 380 H778 L788 432 Z" fill="url(#mkzGlass)" stroke="#8c562b" stroke-width="2.5"/>
    <rect x="646" y="432" width="144" height="38" rx="3" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <line x1="654" y1="406" x2="782" y2="406" stroke="#8c562b" stroke-width="1.8"/>
    <!-- Flaky golden croissants & cinnamon rolls -->
    <g fill="#e59838" stroke="#9e5f19" stroke-width="1.2">
      <path d="M666 402 q10 -12 20 0 q-10 -4 -20 0 z"/><path d="M694 402 q10 -12 20 0 q-10 -4 -20 0 z"/>
      <circle cx="736" cy="396" r="7" fill="#d9822b"/><circle cx="736" cy="396" r="3.5" fill="#fff8ec"/>
      <circle cx="758" cy="396" r="7" fill="#d9822b"/><circle cx="758" cy="396" r="3.5" fill="#fff8ec"/>
      <rect x="668" y="416" width="22" height="12" rx="4" fill="#f3a683"/><rect x="700" y="416" width="22" height="12" rx="4" fill="#f7d794"/>
      <rect x="734" y="416" width="34" height="12" rx="4" fill="#e77f67"/>
    </g>
    <text x="718" y="455" font-size="9" font-weight="900" fill="#fff8dc" text-anchor="middle">CROISSANTS &amp; PASTRIES</text>
  `),
  /* 16. cakecounter — celebration birthday cake display */
  objG("cakecounter", "birthday cake counter", "quầy bánh kem sinh nhật", 468, 888, 356, `
    <rect class="hit" x="804" y="362" width="168" height="114"/>
    <ellipse cx="888" cy="472" rx="80" ry="6" fill="#000" opacity=".16"/>
    <rect x="810" y="382" width="156" height="50" rx="4" fill="url(#mkzGlass)" stroke="#8c562b" stroke-width="2"/>
    <rect x="808" y="432" width="160" height="38" rx="3" fill="#c2453b" stroke="#7d281f" stroke-width="2"/>
    <!-- Two decorated birthday cakes -->
    <g>
      <rect x="826" y="404" width="44" height="22" rx="4" fill="#fff0f5" stroke="#e85d75" stroke-width="1.5"/>
      <rect x="826" y="404" width="44" height="6" rx="2" fill="#ff7b93"/>
      <circle cx="836" cy="401" r="3" fill="#d8453a"/><circle cx="848" cy="401" r="3" fill="#d8453a"/><circle cx="860" cy="401" r="3" fill="#d8453a"/>
      <rect x="898" y="402" width="48" height="24" rx="4" fill="#5a3825" stroke="#3a2314" stroke-width="1.5"/>
      <rect x="898" y="402" width="48" height="6" rx="2" fill="#f5d34a"/>
    </g>
    <text x="888" y="455" font-size="9" font-weight="900" fill="#fff8dc" text-anchor="middle">🎂 CUSTOM CAKES $12</text>
  `),
  /* 17. rootvegbin — potatoes, carrots & red onions wooden bin */
  objG("rootvegbin", "root vegetable crate", "thùng khoai tây, hành & cà rốt", 574, 152, 496, `
    <rect class="hit" x="72" y="498" width="158" height="84"/>
    <ellipse cx="151" cy="576" rx="76" ry="6" fill="#000" opacity=".16"/>
    <polygon points="78,524 224,524 216,546 86,546" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="86" y="546" width="130" height="28" fill="url(#mkzWoodDark)" stroke="#5a3515" stroke-width="2"/>
    <!-- Potatoes, purple onions, orange carrots -->
    <g fill="#c89d66"><ellipse cx="102" cy="518" rx="10" ry="7"/><ellipse cx="120" cy="516" rx="10" ry="7"/><ellipse cx="112" cy="510" rx="9" ry="6"/></g>
    <g fill="#8e44ad"><circle cx="148" cy="518" r="7.5"/><circle cx="164" cy="518" r="7.5"/><circle cx="156" cy="510" r="7"/></g>
    <g fill="#e8743b"><path d="M182 522 l12 -14 l6 6 z"/><path d="M196 522 l12 -14 l6 6 z"/></g>
    <text x="151" y="564" font-size="8" font-weight="900" fill="#fff8dc" text-anchor="middle">POTATOES · ONIONS · CARROTS</text>
  `),
  /* 18. tropicaltable — pineapple, dragon fruit & avocado island */
  objG("tropicaltable", "tropical fruit island", "bàn trái cây nhiệt đới & bơ", 574, 326, 496, `
    <rect class="hit" x="246" y="498" width="158" height="84"/>
    <ellipse cx="325" cy="576" rx="76" ry="6" fill="#000" opacity=".16"/>
    <polygon points="252,524 398,524 390,546 260,546" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="260" y="546" width="130" height="28" fill="#2f7f4b" stroke="#1e5631" stroke-width="2"/>
    <!-- Pineapples, pink dragon fruit, green avocados -->
    <g>
      <ellipse cx="278" cy="514" rx="9" ry="12" fill="#e59838"/><path d="M272 502 l6 -10 l6 10" fill="#2f7f4b"/>
      <ellipse cx="298" cy="514" rx="9" ry="12" fill="#e59838"/><path d="M292 502 l6 -10 l6 10" fill="#2f7f4b"/>
      <ellipse cx="328" cy="516" rx="10" ry="8" fill="#e84a7f"/><ellipse cx="346" cy="516" rx="10" ry="8" fill="#e84a7f"/>
      <ellipse cx="372" cy="516" rx="8" ry="10" fill="#2e5cb8" fill-opacity="0"/><ellipse cx="372" cy="516" rx="8" ry="10" fill="#3b6e38"/><ellipse cx="386" cy="516" rx="8" ry="10" fill="#3b6e38"/>
    </g>
    <text x="325" y="564" font-size="8" font-weight="900" fill="#fff8dc" text-anchor="middle">PINEAPPLE · DRAGON FRUIT · AVOCADO</text>
  `),
  /* 19. mushroombox — white button mushrooms & vine tomatoes crate */
  objG("mushroombox", "mushroom & tomato bin", "khay nấm tươi & cà chua", 574, 492, 496, `
    <rect class="hit" x="420" y="498" width="144" height="84"/>
    <ellipse cx="492" cy="576" rx="68" ry="6" fill="#000" opacity=".16"/>
    <polygon points="426,524 558,524 550,546 434,546" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="434" y="546" width="116" height="28" fill="url(#mkzWoodDark)" stroke="#5a3515" stroke-width="2"/>
    <!-- White mushrooms & red vine tomatoes -->
    <g fill="#f7f4eb" stroke="#b8b0a0"><circle cx="452" cy="516" r="7"/><circle cx="468" cy="514" r="7"/><circle cx="484" cy="516" r="7"/></g>
    <g fill="#d8453a"><circle cx="512" cy="516" r="7.5"/><circle cx="528" cy="514" r="7.5"/><circle cx="542" cy="516" r="7.5"/></g>
    <text x="492" y="564" font-size="8" font-weight="900" fill="#fff8dc" text-anchor="middle">MUSHROOMS &amp; TOMATOES</text>
  `),
  /* 20. donuttray — glazed donuts & blueberry muffins display table */
  objG("donuttray", "donut & muffin tray", "khay bánh vòng & muffin", 574, 668, 496, `
    <rect class="hit" x="584" y="498" width="166" height="84"/>
    <ellipse cx="667" cy="576" rx="78" ry="6" fill="#000" opacity=".16"/>
    <polygon points="590,524 744,524 736,546 598,546" fill="#fff8ec" stroke="#c99a1d" stroke-width="2"/>
    <rect x="598" y="546" width="138" height="28" fill="#d97b29" stroke="#8c4c14" stroke-width="2"/>
    <!-- Pink glazed donuts & blueberry muffins -->
    <g>
      <circle cx="616" cy="516" r="8" fill="#ff7b93" stroke="#b9772d" stroke-width="2"/><circle cx="616" cy="516" r="2.5" fill="#fff8ec"/>
      <circle cx="638" cy="516" r="8" fill="#5a3825" stroke="#b9772d" stroke-width="2"/><circle cx="638" cy="516" r="2.5" fill="#fff8ec"/>
      <path d="M668 522 h16 l-2 -12 q-6 -6 -12 0 z" fill="#e59838"/><circle cx="674" cy="512" r="2" fill="#2c4c8c"/><circle cx="680" cy="514" r="2" fill="#2c4c8c"/>
      <path d="M694 522 h16 l-2 -12 q-6 -6 -12 0 z" fill="#e59838"/><circle cx="700" cy="512" r="2" fill="#2c4c8c"/><circle cx="706" cy="514" r="2" fill="#2c4c8c"/>
    </g>
    <text x="667" y="564" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">DONUTS &amp; MUFFINS</text>
  `),
  /* 21. bageltongs — metal tongs & paper bakery bags station */
  objG("bageltongs", "tongs & bakery bags", "kẹp gắp & túi giấy đựng bánh", 574, 858, 496, `
    <rect class="hit" x="774" y="498" width="166" height="84"/>
    <ellipse cx="857" cy="576" rx="76" ry="6" fill="#000" opacity=".16"/>
    <polygon points="780,524 934,524 926,546 788,546" fill="url(#mkzWood)" stroke="#75451e" stroke-width="2"/>
    <rect x="788" y="546" width="138" height="28" fill="url(#mkzWoodDark)" stroke="#5a3515" stroke-width="2"/>
    <!-- Sesame bagels, metal tongs, brown paper bags -->
    <g>
      <circle cx="808" cy="516" r="8" fill="#d9944a"/><circle cx="808" cy="516" r="2.5" fill="#75451e"/>
      <circle cx="828" cy="516" r="8" fill="#d9944a"/><circle cx="828" cy="516" r="2.5" fill="#75451e"/>
      <path d="M850 520 L868 504 L854 504" stroke="#7f8c8d" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="884" y="502" width="28" height="22" rx="2" fill="#d2a679" stroke="#8c562b"/>
    </g>
    <text x="857" y="564" font-size="8" font-weight="900" fill="#fff8dc" text-anchor="middle">BAGELS · TONGS &amp; BAGS</text>
  `)
].join("\n");

const produceObjects = {
  produce: S.allObjects.produce,
  fruitscale: S.allObjects.fruitscale,
  bakery: S.allObjects.bakery,
  citrusbin: { en: "citrus & mango crate", vi: "thùng cam chanh & xoài", ipa: "/ˈsɪt.rəs kreɪt/", acts: ["squeeze_lemons_for_tea", "choose_sweet_tangerines"] },
  berrycooler: { en: "chilled berry stand", vi: "tủ mát dâu tây & việt quất", ipa: "/ˈber.i stænd/", acts: ["inspect_blueberry_punnet", "pick_red_cherries"] },
  leafygreens: { en: "leafy greens rack", vi: "kệ rau xanh phun sương", ipa: "/ˈliː.fi ɡriːnz/", acts: ["feel_cool_vegetable_mist", "pick_crispy_romaine"] },
  rootvegbin: { en: "root vegetable crate", vi: "thùng khoai tây, hành & cà rốt", ipa: "/ruːt ˈvedʒ.tə.bəlz/", acts: ["select_baking_potatoes", "bag_red_onions"] },
  organicstand: { en: "organic farm stand", vi: "quầy nông sản hữu cơ", ipa: "/ɔːˈɡæn.ɪk stænd/", acts: ["compare_organic_apples", "pick_organic_baby_spinach"] },
  tropicaltable: { en: "tropical fruit island", vi: "bàn trái cây nhiệt đới", ipa: "/ˈtrɑp.ɪ.kəl fruːt/", acts: ["smell_ripe_pineapple", "pick_dragon_fruit"] },
  cutfruitbar: { en: "fresh cut fruit bar", vi: "tủ trái cây cắt sẵn", ipa: "/kʌt fruːt bɑːr/", acts: ["grab_watermelon_slices", "pick_mixed_fruit_cup"] },
  herbpotstand: { en: "fresh herbs rack", vi: "kệ rau thơm trồng chậu", ipa: "/freʃ hɜːbz/", acts: ["smell_fresh_basil_pot", "grab_bunch_of_cilantro"] },
  mushroombox: { en: "mushroom & tomato bin", vi: "khay nấm tươi & cà chua", ipa: "/ˈmʌʃ.ruːm bɪn/", acts: ["pick_white_mushrooms"] },
  producebag: { en: "produce bag roll", vi: "cuộn túi đựng rau quả", ipa: "/ˈprɑd.juːs bæɡ/", acts: ["pull_produce_plastic_bag"] },
  mkpastrycase: { en: "croissant & pastry case", vi: "tủ kính bánh sừng bò & bánh ngọt", ipa: "/ˈpeɪ.stri keɪs/", acts: ["pick_butter_croissants", "choose_cinnamon_roll"] },
  cakecounter: { en: "birthday cake counter", vi: "quầy bánh kem sinh nhật", ipa: "/keɪk ˈkaʊn.tər/", acts: ["ask_custom_cake_message"] },
  breadslicer: { en: "bread slicer", vi: "máy cắt lát bánh mì", ipa: "/bred ˈslaɪ.sər/", acts: ["slice_sourdough_loaf"] },
  bakeryoven: { en: "bakery oven & baker", vi: "lò nướng bánh & thợ làm bánh", ipa: "/ˈbeɪ.kər.i ˈʌv.ən/", acts: ["ask_baker_next_batch"] },
  donuttray: { en: "donut & muffin tray", vi: "khay bánh vòng & muffin", ipa: "/ˈdoʊ.nʌt treɪ/", acts: ["pick_blueberry_muffins"] },
  bageltongs: { en: "tongs & bakery bags", vi: "kẹp gắp & túi giấy đựng bánh", ipa: "/tɑŋz/", acts: ["use_tongs_for_bagels"] },
  jamhoneyrack: { en: "jam & honey shelf", vi: "kệ mứt trái cây & mật ong", ipa: "/dʒæm ən ˈhʌn.i/", acts: ["pick_strawberry_jam_jar"] },
  produceclerk: { en: "produce specialist", vi: "nhân viên quầy rau quả", ipa: "/ˈprɑd.juːs ˈspeʃ.əl.ɪst/", acts: ["ask_clerk_for_sweet_watermelon"] }
};

const produceNewActions = [
  mkA("squeeze_lemons_for_tea", "citrusbin", "Pick juicy yellow lemons", "Chọn chanh vàng mọng nước",
    "I'm picking three juicy yellow lemons for homemade iced tea.",
    "Tôi đang chọn ba quả chanh vàng mọng nước để pha trà chanh tại nhà.",
    ["juicy", "lemons"], ["juicy", "lemon"],
    "<b>for + danh từ</b> chỉ mục đích: <b>for homemade iced tea</b> = để pha trà chanh tại nhà.",
    ["I'm picking three juicy yellow lemons", "for homemade iced tea."], ["lemon", "melon", "lesson"],
    ["Squeeze fresh <b>lemons</b> into warm water.", "These oranges are so <b>juicy</b>."],
    once("mkp_lemons", "yes", "Bạn đã chọn chanh vàng mọng nước rồi."),
    at("mkp_citrus", "reach", 750, [["mkp_lemons", "yes"]]),
    ["pick juicy yellow lemons", "pick three juicy lemons for iced tea", "chọn chanh vàng mọng nước"]),

  mkA("choose_sweet_tangerines", "citrusbin", "Choose seedless tangerines", "Chọn quýt ngọt không hạt",
    "These seedless tangerines are easy to peel and super sweet.",
    "Mấy quả quýt không hạt này rất dễ bóc vỏ và ngọt lịm.",
    ["tangerines", "peel"], ["tangerine", "peel"],
    "<b>easy to + động từ nguyên mẫu</b> = dễ làm gì (easy to peel = dễ bóc vỏ).",
    ["These seedless tangerines", "are easy to peel and super sweet."], ["peel", "feel", "meal"],
    ["Kids love <b>tangerines</b> because they are <b>easy to peel</b>.", "They taste super sweet."],
    once("mkp_tangerines", "yes", "Bạn đã chọn quýt ngọt không hạt rồi."),
    at("mkp_citrus", "reach", 750, [["mkp_tangerines", "yes"]]),
    ["choose seedless tangerines", "choose easy-to-peel sweet tangerines", "chọn quýt ngọt không hạt"]),

  mkA("inspect_blueberry_punnet", "berrycooler", "Check the blueberry box", "Kiểm tra hộp việt quất tươi",
    "Let me check the bottom of the blueberry box to make sure none are squished.",
    "Để mình xem đáy hộp việt quất cho chắc là không có quả nào bị dập.",
    ["blueberry", "check"], ["blueberry", "check"],
    "<b>make sure + mệnh đề</b> = kiểm tra chắc chắn rằng …",
    ["Let me check the bottom of the blueberry box", "to make sure none are squished."], ["box", "books", "fox"],
    ["Fresh <b>blueberries</b> are rich in vitamins.", "Always <b>check</b> the fruit before buying."],
    once("mkp_blueberries", "yes", "Bạn đã kiểm tra và lấy hộp việt quất rồi."),
    at("mkp_berry", "read", 800, [["mkp_blueberries", "yes"]]),
    ["check the blueberry box", "inspect a punnet of fresh blueberries", "kiểm tra hộp việt quất tươi"]),

  mkA("pick_red_cherries", "berrycooler", "Pick glossy dark cherries", "Lấy hộp anh đào đỏ mọng",
    "Look at these glossy dark cherries—they're on special offer today!",
    "Nhìn những quả anh đào đỏ sẫm bóng bẩy này kìa — hôm nay đang có giá ưu đãi đặc biệt!",
    ["cherries", "special offer"], ["cherry", "banner"],
    "<b>on special offer</b> = đang có chương trình ưu đãi đặc biệt.",
    ["Look at these glossy dark cherries—", "they're on special offer today!"], ["cherries", "berries", "ferries"],
    ["Sweet dark <b>cherries</b> are in season.", "They are on <b>special offer</b> this week."],
    once("mkp_cherries", "yes", "Bạn đã lấy hộp anh đào đỏ mọng rồi."),
    at("mkp_berry", "reach", 750, [["mkp_cherries", "yes"]]),
    ["pick glossy dark cherries", "pick a box of dark cherries on special offer", "lấy hộp anh đào đỏ mọng"]),

  mkA("feel_cool_vegetable_mist", "leafygreens", "Feel the cool vegetable mist", "Xem hệ thống phun sương giữ rau tươi",
    "The cool water mist keeps the spinach and kale crisp all day.",
    "Làn sương nước mát lạnh giúp rau chân vịt và cải xoăn tươi giòn suốt cả ngày.",
    ["mist", "spinach", "crisp"], ["mist", "spinach", "crisp"],
    "<b>keep + tân ngữ + tính từ</b> = giữ cho cái gì ở trạng thái nào (keep the spinach crisp).",
    ["The cool water mist", "keeps the spinach and kale crisp all day."], ["crisp", "clips", "chips"],
    ["A fine <b>cool mist</b> sprays over the greens.", "It keeps the <b>spinach</b> fresh and <b>crisp</b>."],
    once("mkp_mist", "yes", "Bạn đã xem kệ rau xanh phun sương rồi."),
    at("mkp_greens", "reach", 750, [["mkp_mist", "yes"]]),
    ["feel the cool vegetable mist", "watch the cool mist keep the greens crisp", "xem hệ thống phun sương giữ rau tươi"]),

  mkA("pick_crispy_romaine", "leafygreens", "Grab crisp romaine lettuce", "Lấy xà lách romaine trộn salad",
    "I'll grab a fresh head of romaine lettuce for Caesar salad.",
    "Mình sẽ lấy một bắp xà lách romaine tươi giòn để trộn salad.",
    ["romaine lettuce", "fresh"], ["romaine", "fresh"],
    "<b>a head of lettuce</b> = một cây / bắp xà lách.",
    ["I'll grab a fresh head", "of romaine lettuce for Caesar salad."], ["head", "had", "hand"],
    ["Wash the <b>romaine lettuce</b> leaves thoroughly.", "It's super crunchy and <b>fresh</b>."],
    once("mkp_romaine", "yes", "Bạn đã lấy xà lách romaine rồi."),
    at("mkp_greens", "reach", 750, [["mkp_romaine", "yes"]]),
    ["grab crisp romaine lettuce", "grab a head of romaine lettuce for salad", "lấy xà lách romaine trộn salad"]),

  mkA("select_baking_potatoes", "rootvegbin", "Select four baking potatoes", "Chọn bốn củ khoai tây lớn",
    "I need four large russet potatoes for mashed potatoes tonight.",
    "Mình cần bốn củ khoai tây lớn để tối nay làm món khoai tây nghiền.",
    ["potatoes", "tonight"], ["potato", "tonight"],
    "<b>mashed potatoes</b> = món khoai tây nghiền bơ sữa.",
    ["I need four large russet potatoes", "for mashed potatoes tonight."], ["potatoes", "tomatoes", "photos"],
    ["Peel and boil the <b>potatoes</b> until soft.", "What are we having for dinner <b>tonight</b>?"],
    once("mkp_potatoes", "yes", "Bạn đã chọn bốn củ khoai tây lớn rồi."),
    at("mkp_roots", "bend", 750, [["mkp_potatoes", "yes"]]),
    ["select four baking potatoes", "pick four large potatoes for mashed potatoes", "chọn bốn củ khoai tây lớn"]),

  mkA("bag_red_onions", "rootvegbin", "Bag red onions and garlic", "Bỏ hành tím và tỏi vào túi",
    "I'm putting a couple of purple onions and garlic bulbs into my bag.",
    "Tôi đang cho vài củ hành tím và tỏi vào túi.",
    ["onions", "bag"], ["onion", "bag"],
    "<b>a couple of + danh từ số nhiều</b> = hai hoặc vài cái.",
    ["I'm putting a couple of purple onions", "and garlic bulbs into my bag."], ["onions", "opinions", "unions"],
    ["Slice the <b>red onions</b> thinly for salad.", "Put them in a paper <b>bag</b>."],
    once("mkp_onions", "yes", "Bạn đã lấy hành tím và tỏi rồi."),
    at("mkp_roots", "bend", 750, [["mkp_onions", "yes"]]),
    ["bag red onions and garlic", "put red onions and garlic into my bag", "bỏ hành tím và tỏi vào túi"]),

  mkA("compare_organic_apples", "organicstand", "Read the organic farm label", "Đọc nhãn nông sản hữu cơ",
    "Organic vegetables cost a little more, but they're grown without pesticides.",
    "Rau củ hữu cơ đắt hơn một chút nhưng được trồng không dùng thuốc trừ sâu.",
    ["Organic", "pesticides"], ["organic", "pesticide"],
    "<b>grown without pesticides</b> = được trồng mà không sử dụng thuốc trừ sâu.",
    ["Organic vegetables cost a little more,", "but they're grown without pesticides."], ["cost", "cast", "coast"],
    ["We buy <b>organic</b> greens for the baby.", "They are grown naturally without <b>pesticides</b>."],
    once("mkp_orgcompare", "yes", "Bạn đã đọc thông tin nông sản hữu cơ rồi."),
    at("mkp_organic", "read", 800, [["mkp_orgcompare", "yes"]]),
    ["read the organic farm label", "check how organic vegetables are grown", "đọc nhãn nông sản hữu cơ"]),

  mkA("pick_organic_baby_spinach", "organicstand", "Take pre-washed baby spinach", "Lấy hộp cải bó xôi non hữu cơ",
    "I'll take a box of pre-washed organic baby spinach.",
    "Mình sẽ lấy một hộp cải bó xôi non hữu cơ đã rửa sạch sẵn.",
    ["organic", "spinach"], ["organic", "spinach"],
    "<b>pre-washed</b> = đã được rửa sạch sẵn, mở hộp là trộn salad được ngay.",
    ["I'll take a box", "of pre-washed organic baby spinach."], ["spinach", "spanish", "finish"],
    ["<b>Organic</b> baby <b>spinach</b> is tender and sweet.", "It's pre-washed and ready to cook."],
    once("mkp_orgspinach", "yes", "Bạn đã lấy hộp cải bó xôi non hữu cơ rồi."),
    at("mkp_organic", "reach", 750, [["mkp_orgspinach", "yes"]]),
    ["take pre-washed baby spinach", "pick a box of organic baby spinach", "lấy hộp cải bó xôi non hữu cơ"]),

  mkA("smell_ripe_pineapple", "tropicaltable", "Check if the pineapple is sweet", "Ngửi thử dứa chín thơm",
    "If the base of the pineapple smells sweet and fruity, it's ready to eat!",
    "Nếu phần cuống dứa tỏa mùi thơm ngọt dịu là quả đã chín ngon sẵn sàng để ăn!",
    ["pineapple", "sweet"], ["pineapple", "sweet"],
    "Câu điều kiện thực tế: <b>If …, it's ready to eat!</b> (Nếu …, thì đã sẵn sàng để ăn).",
    ["If the base of the pineapple smells sweet and fruity,", "it's ready to eat!"], ["sweet", "sweat", "street"],
    ["This golden <b>pineapple</b> smells so <b>sweet</b>!", "Let's slice it for dessert."],
    once("mkp_pineapple", "yes", "Bạn đã chọn được quả dứa chín thơm rồi."),
    at("mkp_tropical", "reach", 750, [["mkp_pineapple", "yes"]]),
    ["check if the pineapple is sweet", "smell the ripe golden pineapple", "ngửi thử dứa chín thơm"]),

  mkA("pick_dragon_fruit", "tropicaltable", "Pick a pink dragon fruit", "Chọn quả thanh long vỏ hồng",
    "This bright pink dragon fruit looks so exotic and refreshing.",
    "Quả thanh long vỏ hồng rực rỡ này trông thật bắt mắt và thanh mát.",
    ["dragon fruit", "fresh"], ["dragonfruit", "fresh"],
    "<b>look + tính từ</b> = trông như thế nào (looks exotic and refreshing).",
    ["This bright pink dragon fruit", "looks so exotic and refreshing."], ["pink", "pick", "peak"],
    ["Chill the <b>dragon fruit</b> in the fridge before serving.", "It's light, sweet, and <b>fresh</b>."],
    once("mkp_dragonfruit", "yes", "Bạn đã chọn quả thanh long rồi."),
    at("mkp_tropical", "reach", 750, [["mkp_dragonfruit", "yes"]]),
    ["pick a pink dragon fruit", "pick a refreshing pink dragon fruit", "chọn quả thanh long vỏ hồng"]),

  mkA("grab_watermelon_slices", "cutfruitbar", "Grab chilled watermelon slices", "Lấy hộp dưa hấu cắt sẵn ướp lạnh",
    "I'll grab a chilled box of pre-cut watermelon slices for a quick snack.",
    "Mình sẽ lấy một hộp dưa hấu cắt sẵn ướp lạnh để ăn nhẹ.",
    ["watermelon", "juicy"], ["watermelon", "juicy"],
    "<b>pre-cut</b> = đã gọt/cắt miếng sẵn; <b>chilled</b> = ướp mát lạnh.",
    ["I'll grab a chilled box of pre-cut watermelon slices", "for a quick snack."], ["snack", "snake", "stack"],
    ["Cold <b>watermelon</b> is the best summer treat.", "Every bite is sweet and <b>juicy</b>."],
    once("mkp_watermelon", "yes", "Bạn đã lấy hộp dưa hấu cắt sẵn rồi."),
    at("mkp_cutfruit", "reach", 750, [["mkp_watermelon", "yes"]]),
    ["grab chilled watermelon slices", "grab a box of pre-cut watermelon", "lấy hộp dưa hấu cắt sẵn ướp lạnh"]),

  mkA("pick_mixed_fruit_cup", "cutfruitbar", "Pick a mixed fruit cup", "Lấy cốc trái cây thập cẩm",
    "This mixed fruit cup has mango, kiwi, and pineapple all ready to eat.",
    "Cốc trái cây thập cẩm này có đủ xoài, kiwi và dứa cắt sẵn chỉ việc thưởng thức.",
    ["mixed fruit cup", "mango"], ["fruitcup", "mango"],
    "<b>ready to eat</b> = có thể ăn ngay lập tức, không cần sơ chế.",
    ["This mixed fruit cup has mango, kiwi, and pineapple", "all ready to eat."], ["cup", "cap", "cut"],
    ["Grab a <b>mixed fruit cup</b> for lunch.", "The diced <b>mango</b> is super ripe."],
    once("mkp_fruitcup", "yes", "Bạn đã lấy cốc trái cây thập cẩm rồi."),
    at("mkp_cutfruit", "reach", 750, [["mkp_fruitcup", "yes"]]),
    ["pick a mixed fruit cup", "pick a ready-to-eat mixed fruit cup", "lấy cốc trái cây thập cẩm"]),

  mkA("smell_fresh_basil_pot", "herbpotstand", "Smell the potted sweet basil", "Ngửi chậu rau húng quế tươi",
    "This living basil plant smells incredible—perfect for pasta sauce!",
    "Chậu húng quế tươi này thơm tuyệt vời — quá hợp để nấu sốt mì Ý!",
    ["basil", "fresh"], ["basil", "fresh"],
    "<b>perfect for + danh từ/V-ing</b> = cực kỳ hợp cho món gì.",
    ["This living basil plant smells incredible—", "perfect for pasta sauce!"], ["sauce", "source", "saws"],
    ["Add torn <b>fresh basil</b> leaves to tomato sauce.", "Potted herbs stay <b>fresh</b> for weeks."],
    once("mkp_basil", "yes", "Bạn đã chọn chậu húng quế tươi rồi."),
    at("mkp_herbs", "reach", 750, [["mkp_basil", "yes"]]),
    ["smell the potted sweet basil", "pick a living basil plant for pasta sauce", "ngửi chậu rau húng quế tươi"]),

  mkA("grab_bunch_of_cilantro", "herbpotstand", "Grab cilantro and green onions", "Lấy bó rau mùi và hành lá",
    "Don't forget a bunch of green onions and cilantro for the pho!",
    "Đừng quên lấy một bó hành lá và rau mùi cho món phở nhé!",
    ["cilantro", "fresh"], ["cilantro", "fresh"],
    "<b>a bunch of + rau thơm/hoa/chuối/nho</b> = một bó / một nải / một chùm.",
    ["Don't forget a bunch of green onions", "and cilantro for the pho!"], ["bunch", "lunch", "punch"],
    ["Chop some <b>cilantro</b> on top of the soup.", "These herbs are garden <b>fresh</b>."],
    once("mkp_cilantro", "yes", "Bạn đã lấy bó rau mùi và hành lá rồi."),
    at("mkp_herbs", "reach", 750, [["mkp_cilantro", "yes"]]),
    ["grab cilantro and green onions", "grab a bunch of cilantro for pho", "lấy bó rau mùi và hành lá"]),

  mkA("pick_white_mushrooms", "mushroombox", "Pick button mushrooms & tomatoes", "Chọn khay nấm mỡ trắng & cà chua",
    "I'm picking a punnet of firm white button mushrooms and vine tomatoes.",
    "Tôi đang chọn một khay nấm mỡ trắng chắc thịt và cà chua nguyên cành.",
    ["mushrooms", "fresh"], ["mushroom", "fresh"],
    "<b>vine tomatoes</b> = cà chua chín trên cành (giữ nguyên cuống xanh rất thơm).",
    ["I'm picking a punnet of firm white button mushrooms", "and vine tomatoes."], ["firm", "farm", "form"],
    ["Slice the <b>mushrooms</b> for stir-fry.", "These vine tomatoes are ripe and <b>fresh</b>."],
    once("mkp_mushrooms", "yes", "Bạn đã chọn khay nấm mỡ trắng và cà chua rồi."),
    at("mkp_mushrooms", "bend", 750, [["mkp_mushrooms", "yes"]]),
    ["pick button mushrooms & tomatoes", "pick a punnet of white mushrooms", "chọn khay nấm mỡ trắng & cà chua"]),

  mkA("pull_produce_plastic_bag", "producebag", "Tear off a produce bag", "Xé một túi đựng rau quả",
    "Let me tear off a clear produce bag from the roll to hold my fruit.",
    "Để mình xé một chiếc túi đựng rau quả từ cuộn túi để bỏ trái cây vào.",
    ["produce bag", "bag"], ["rollbag", "bag"],
    "<b>tear off</b> = xé rời ra (từ cuộn túi theo đường răng cưa).",
    ["Let me tear off a clear produce bag", "from the roll to hold my fruit."], ["roll", "role", "rule"],
    ["Pull a <b>produce bag</b> from the stand.", "Put the apples inside the <b>bag</b> before weighing."],
    once("mkp_rollbag", "yes", "Bạn đã lấy túi đựng rau quả từ cuộn rồi."),
    at("mkp_bagroll", "reach", 700, [["mkp_rollbag", "yes"]]),
    ["tear off a produce bag", "pull a clear produce bag from the roll", "xé một túi đựng rau quả"]),

  mkA("pick_butter_croissants", "mkpastrycase", "Get two butter croissants", "Lấy hai chiếc bánh sừng bò bơ",
    "Could I get two flaky butter croissants from the glass case, please?",
    "Cho mình lấy hai chiếc bánh sừng bò bơ ngàn lớp trong tủ kính nhé?",
    ["flaky", "croissants"], ["flaky", "croissant"],
    "<b>flaky</b> = có nhiều lớp vỏ mỏng giòn rụm (đặc trưng của bánh sừng bò).",
    ["Could I get two flaky butter croissants", "from the glass case, please?"], ["flaky", "lucky", "shaky"],
    ["This warm <b>butter croissant</b> is so <b>flaky</b>.", "Enjoy it with a cup of morning coffee."],
    once("mkp_croissant", "yes", "Bạn đã lấy hai chiếc bánh sừng bò bơ rồi."),
    at("mkp_pastry", "reach", 750, [["mkp_croissant", "yes"]]),
    ["get two butter croissants", "get two flaky butter croissants from the case", "lấy hai chiếc bánh sừng bò bơ"]),

  mkA("choose_cinnamon_roll", "mkpastrycase", "Choose a warm cinnamon roll", "Chọn bánh cuộn quế phủ kem",
    "These warm cinnamon rolls with cream cheese icing look irresistible!",
    "Mấy chiếc bánh cuộn quế ấm nóng phủ kem phô mai này trông hấp dẫn không cưỡng nổi!",
    ["cinnamon rolls", "icing"], ["cinnamon", "icing"],
    "<b>irresistible</b> /ˌɪr.ɪˈzɪs.tə.bəl/ = hấp dẫn không thể cưỡng lại được.",
    ["These warm cinnamon rolls", "with cream cheese icing look irresistible!"], ["roll", "bowl", "tall"],
    ["I love the smell of a warm <b>cinnamon roll</b>.", "It's topped with sweet <b>icing</b>."],
    once("mkp_cinnamon", "yes", "Bạn đã chọn bánh cuộn quế phủ kem rồi."),
    at("mkp_pastry", "reach", 750, [["mkp_cinnamon", "yes"]]),
    ["choose a warm cinnamon roll", "choose a cinnamon roll with icing", "chọn bánh cuộn quế phủ kem"]),

  mkA("ask_custom_cake_message", "cakecounter", "Ask to write on a birthday cake", "Nhờ viết chữ lên bánh sinh nhật",
    "Could you write 'Happy Birthday Minh' in chocolate icing on this cake?",
    "Bạn viết dòng chữ 'Chúc mừng sinh nhật Minh' bằng kem sô-cô-la lên chiếc bánh này giúp mình được không?",
    ["chocolate icing", "cake"], ["icing", "cake"],
    "<b>write … on the cake</b> = viết dòng chữ chúc mừng lên mặt bánh kem.",
    ["Could you write 'Happy Birthday Minh'", "in chocolate icing on this cake?"], ["write", "right", "white"],
    ["The baker wrote my name in <b>chocolate icing</b>.", "What a beautiful birthday <b>cake</b>!"],
    once("mkp_cakemsg", "yes", "Bạn đã nhờ thợ bánh viết chữ chúc mừng lên bánh rồi."),
    at("mkp_cake", "point", 800, [["mkp_cakemsg", "yes"]]),
    ["ask to write on a birthday cake", "ask the baker to write Happy Birthday on the cake", "nhờ viết chữ lên bánh sinh nhật"]),

  mkA("slice_sourdough_loaf", "breadslicer", "Slice a sourdough loaf", "Cho bánh mì men tự nhiên vào máy cắt lát",
    "Could you run this sourdough loaf through the bread slicer on medium thickness?",
    "Bạn cho ổ bánh mì men tự nhiên này vào máy cắt lát ở độ dày vừa giúp mình nhé?",
    ["sourdough loaf", "bread slicer"], ["sourdough", "slicer"],
    "<b>on medium thickness</b> = ở chế độ cắt lát dày vừa phải.",
    ["Could you run this sourdough loaf", "through the bread slicer on medium thickness?"], ["slice", "slide", "slight"],
    ["This crusty <b>sourdough loaf</b> makes great toast.", "The <b>bread slicer</b> cuts even slices in seconds."],
    once("mkp_slicer", "yes", "Bạn đã cắt lát ổ bánh mì men tự nhiên rồi."),
    at("mkp_slicer", "reach", 800, [["mkp_slicer", "yes"]]),
    ["slice a sourdough loaf", "run the sourdough loaf through the bread slicer", "cho bánh mì men tự nhiên vào máy cắt lát"]),

  mkA("ask_baker_next_batch", "bakeryoven", "Ask when hot bread comes out", "Hỏi thợ bánh khi nào mẻ bánh mới ra lò",
    "Excuse me, when does the next batch of hot garlic bread come out of the oven?",
    "Xin lỗi, khoảng mấy giờ mẻ bánh mì bơ tỏi nóng tiếp theo mới ra lò ạ?",
    ["batch", "oven"], ["batch", "oven"],
    "<b>come out of the oven</b> = vừa ra lò nướng.",
    ["Excuse me, when does the next batch of hot garlic bread", "come out of the oven?"], ["batch", "catch", "match"],
    ["A <b>fresh batch</b> of rolls just came out of the <b>bakery oven</b>.", "They are piping hot!"],
    once("mkp_ovenbatch", "yes", "Bạn đã hỏi thợ làm bánh về mẻ bánh mới rồi."),
    at("mkp_oven", "point", 800, [["mkp_ovenbatch", "yes"]]),
    ["ask when hot bread comes out", "ask the baker when the next batch comes out", "hỏi thợ bánh khi nào mẻ bánh mới ra lò"]),

  mkA("pick_blueberry_muffins", "donuttray", "Pick a pack of blueberry muffins", "Lấy hộp bánh muffin việt quất",
    "I'm picking a four-pack of fluffy blueberry muffins for tomorrow's breakfast.",
    "Mình lấy một hộp bốn chiếc bánh muffin việt quất bông xốp cho bữa sáng ngày mai.",
    ["blueberry muffins", "soft"], ["muffin", "soft"],
    "<b>fluffy</b> = bông xốp, mềm mịn (miêu tả bánh nướng, cơm, gối).",
    ["I'm picking a four-pack of fluffy blueberry muffins", "for tomorrow's breakfast."], ["muffin", "nothing", "stuffing"],
    ["Warm <b>blueberry muffins</b> are delicious with milk.", "The inside is so <b>soft</b> and fluffy."],
    once("mkp_muffin", "yes", "Bạn đã lấy hộp bánh muffin việt quất rồi."),
    at("mkp_donuts", "reach", 750, [["mkp_muffin", "yes"]]),
    ["pick a pack of blueberry muffins", "pick fluffy blueberry muffins for breakfast", "lấy hộp bánh muffin việt quất"]),

  mkA("use_tongs_for_bagels", "bageltongs", "Use tongs to bag sesame bagels", "Dùng kẹp gắp bánh mì vòng rắc mè",
    "Always use the metal tongs to place sesame bagels into a paper bag.",
    "Hãy luôn dùng kẹp gắp kim loại để gắp bánh mì vòng mè cho vào túi giấy nhé.",
    ["metal tongs", "sesame bagels"], ["tongs", "bagel"],
    "Ở quầy bánh tự chọn, luôn dùng <b>tongs</b> (kẹp gắp) để đảm bảo vệ sinh.",
    ["Always use the metal tongs", "to place sesame bagels into a paper bag."], ["tongs", "songs", "longs"],
    ["Pick up the <b>sesame bagel</b> with the <b>metal tongs</b>.", "Toast it with cream cheese."],
    once("mkp_tongs", "yes", "Bạn đã dùng kẹp gắp bánh mì vòng vào túi giấy rồi."),
    at("mkp_tongs", "reach", 750, [["mkp_tongs", "yes"]]),
    ["use tongs to bag sesame bagels", "use the metal tongs to pick sesame bagels", "dùng kẹp gắp bánh mì vòng rắc mè"]),

  mkA("pick_strawberry_jam_jar", "jamhoneyrack", "Pick strawberry jam and honey", "Lấy hũ mứt dâu tây và mật ong",
    "A jar of strawberry jam and local wildflower honey will go great with toast!",
    "Một hũ mứt dâu tây và mật ong hoa rừng sẽ tuyệt hảo khi ăn kèm bánh mì nướng!",
    ["strawberry jam", "wildflower honey"], ["jam", "honey"],
    "<b>go great with …</b> = kết hợp rất hợp / ăn kèm rất ngon với món gì.",
    ["A jar of strawberry jam and local wildflower honey", "will go great with toast!"], ["jam", "ham", "gym"],
    ["Spread <b>strawberry jam</b> on warm toast.", "This <b>wildflower honey</b> is pure and natural."],
    once("mkp_jam", "yes", "Bạn đã lấy hũ mứt dâu tây và mật ong rồi."),
    at("mkp_jam", "reach", 750, [["mkp_jam", "yes"]]),
    ["pick strawberry jam and honey", "pick a jar of strawberry jam and honey", "lấy hũ mứt dâu tây và mật ong"]),

  mkA("ask_clerk_for_sweet_watermelon", "produceclerk", "Ask how to pick a sweet watermelon", "Nhờ nhân viên chọn dưa hấu ngọt",
    "Excuse me, could you help me pick a sweet, crunchy watermelon?",
    "Xin lỗi, bạn giúp mình chọn một quả dưa hấu thật ngọt và giòn được không?",
    ["watermelon", "crunchy"], ["watermelon", "crunchy"],
    "<b>crunchy</b> = giòn rụm; khi vỗ vào vỏ dưa nghe tiếng trầm (hollow sound) là dưa chín.",
    ["Excuse me, could you help me pick", "a sweet, crunchy watermelon?"], ["sweet", "seat", "street"],
    ["Tap the <b>watermelon</b> to hear if it's ripe.", "The red flesh is super <b>crunchy</b> and sweet."],
    once("mkp_askmelon", "yes", "Nhân viên đã giúp bạn chọn quả dưa hấu ngọt giòn rồi."),
    at("mkp_clerk", "point", 800, [["mkp_askmelon", "yes"]]),
    ["ask how to pick a sweet watermelon", "ask the produce clerk to pick a sweet watermelon", "nhờ nhân viên chọn dưa hấu ngọt"])
];

const produceActions = [
  ...S.allActions.filter(a => S.PRODUCE_OBJS.has(a.obj)),
  ...produceNewActions
];

const market_produce = {
  id: "market_produce", topic: "market", icon: "🍎", zoneOrder: 2,
  name: "Produce & Bakery", nameVi: "Rau quả & Tiệm bánh", names: ["Produce & Bakery", "Rau quả & Tiệm bánh"],
  go: {
    label: "Head to the produce section",
    labelVi: "Qua khu rau quả & tiệm bánh",
    sentence: "I'm heading to the produce section.",
    vi: "Tôi đang đi sang khu rau củ quả.",
    key: ["heading", "produce", "section"],
    chunks: ["I'm heading", "to the produce section."],
    grammar: "<b>head to the … section</b> = đi sang khu … trong siêu thị.",
    patterns: ["I'm heading to <b>the bakery section</b>.", "I'm heading to <b>the dairy aisle</b>."],
    vocab: [["head to", "/hed tuː/", "đi sang"], ["produce section", "/ˈprɑd.juːs ˌsek.ʃən/", "khu rau củ quả"]],
    story: ["head to the produce section", "walk over to the produce section", "đi sang khu rau quả & tiệm bánh"]
  },
  shellSvg: produceShell,
  worldSvg: produceWorld,
  W0: MK_W0,
  spots: {
    mkp_door: { x: 108, y: 470, d: -1 },
    mkp_greens: { x: 118, y: 392, d: -1 },
    mkp_organic: { x: 174, y: 368, d: 1 },
    mkp_berry: { x: 294, y: 368, d: 1 },
    mkp_herbs: { x: 402, y: 368, d: 1 },
    mkp_cutfruit: { x: 507, y: 368, d: 1 },
    mkp_oven: { x: 634, y: 368, d: 1 },
    mk_bakery: { x: 767, y: 368, d: 1 },
    mkp_slicer: { x: 866, y: 368, d: 1 },
    mkp_jam: { x: 948, y: 368, d: 1 },
    mk_produce: { x: 199, y: 486, d: 1 },
    mkp_citrus: { x: 356, y: 486, d: 1 },
    mk_scale: { x: 464, y: 486, d: 1 },
    mkp_bagroll: { x: 534, y: 486, d: 1 },
    mkp_clerk: { x: 600, y: 486, d: 1 },
    mkp_pastry: { x: 718, y: 486, d: 1 },
    mkp_cake: { x: 888, y: 486, d: 1 },
    mkp_roots: { x: 151, y: 594, d: 1 },
    mkp_tropical: { x: 325, y: 594, d: 1 },
    mkp_mushrooms: { x: 492, y: 594, d: 1 },
    mkp_donuts: { x: 667, y: 594, d: 1 },
    mkp_tongs: { x: 857, y: 594, d: 1 }
  },
  obstacles: [],
  entry: { x: 138, y: 492, d: 1 },
  objects: produceObjects,
  actions: produceActions,
  props: S.MK_PROPS,
  applyState(W, root) { mirrorState(W, MK_W0, root); },
  css: S.marketCss,
  catalog: cat("mkp_", [
    ["lemons", "/ˈlem.ənz/", "quả chanh vàng", "food"],
    ["tangerines", "/ˌtæn.dʒəˈriːnz/", "quả quýt", "food"],
    ["blueberries", "/ˈbluːˌber.iz/", "quả việt quất", "food"],
    ["cherries", "/ˈtʃer.iz/", "quả anh đào", "food"],
    ["spinach", "/ˈspɪn.ɪtʃ/", "rau chân vịt", "food"],
    ["romaine lettuce", "/roʊˈmeɪn ˈlet.ɪs/", "xà lách romaine", "food"],
    ["potatoes", "/pəˈteɪ.toʊz/", "khoai tây", "food"],
    ["red onions", "/red ˈʌn.jənz/", "hành tím", "food"],
    ["pineapple", "/ˈpaɪnˌæp.əl/", "quả dứa", "food"],
    ["dragon fruit", "/ˈdræɡ.ən fruːt/", "quả thanh long", "food"],
    ["watermelon", "/ˈwɔː.təˌmel.ən/", "dưa hấu", "food"],
    ["fresh basil", "/freʃ ˈbæz.əl/", "rau húng quế tươi", "food"],
    ["mushrooms", "/ˈmʌʃ.ruːmz/", "nấm tươi", "food"],
    ["butter croissant", "/ˈbʌt.ər ˈkwæs.ɑ̃/", "bánh sừng bò bơ", "food"],
    ["cinnamon roll", "/ˈsɪn.ə.mən roʊl/", "bánh cuộn quế", "food"],
    ["sourdough loaf", "/ˈsaʊr.doʊ loʊf/", "ổ bánh mì men tự nhiên", "food"],
    ["blueberry muffin", "/ˈbluː.bər.i ˈmʌf.ɪn/", "bánh muffin việt quất", "food"],
    ["sesame bagel", "/ˈses.ə.mi ˈbeɪ.ɡəl/", "bánh mì vòng rắc mè", "food"],
    ["strawberry jam", "/ˈstrɔː.bər.i dʒæm/", "mứt dâu tây", "food"],
    ["wildflower honey", "/ˈwaɪld.flaʊ.ər ˈhʌn.i/", "mật ong hoa rừng", "food"]
  ])
};


/* =====================================================================
   ZONE NPC REPLIES (≥ 30 replies per zone -> ≥ 70 sentences per zone)
   ===================================================================== */
const ENTRANCE_REPLIES = {
  /* Existing 19 actions in market_entrance */
  grab_a_cart: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Welcome to Fresh Life Supermarket! Those carts roll super smoothly.", vi: "Chào mừng bạn đến siêu thị Fresh Life! Mấy chiếc xe đẩy đó lăn êm lắm." },
  return_the_cart: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Thanks so much for returning your cart neatly!", vi: "Cảm ơn bạn rất nhiều vì đã trả xe đẩy gọn gàng nhé!" },
  wipe_cart_handle: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Good idea! We refill the sanitizing wipes every hour.", vi: "Ý hay đấy! Tụi mình bổ sung khăn khử trùng mỗi tiếng một lần." },
  check_cart_wheels: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Here, take this cart on the left—all four wheels are brand new!", vi: "Đây, bạn lấy chiếc bên trái này nhé — cả bốn bánh đều mới tinh!" },
  take_a_basket: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "A hand basket is perfect for a quick trip!", vi: "Giỏ xách tay rất hợp khi mua nhanh vài món!" },
  stack_empty_basket: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Thank you for stacking your basket by the door!", vi: "Cảm ơn bạn đã xếp gọn giỏ cạnh cửa nhé!" },
  switch_basket_to_cart: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "No problem at all! Grab a cart so your arm doesn't get tired.", vi: "Không sao đâu! Bạn lấy xe đẩy đi cho đỡ mỏi tay." },
  check_the_price: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Red apples are three dollars a kilo in the produce section right ahead.", vi: "Táo đỏ giá ba đô một ký ở khu rau quả ngay phía trước ạ." },
  look_for_discount: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Yes! Bananas and berries are twenty percent off all day today.", vi: "Đúng rồi! Chuối và quả mọng giảm giá 20% suốt hôm nay." },
  ask_if_on_sale: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Yep, everything listed on the yellow board is on sale today!", vi: "Vâng, mọi món ghi trên bảng vàng đều đang giảm giá hôm nay!" },
  read_weekly_flyer: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Page two of the flyer has extra coupons for organic fruit!", vi: "Trang hai của tờ rơi có thêm phiếu giảm giá cho trái cây hữu cơ đấy!" },
  calculate_unit_price: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "The family pack is definitely the best value per kilo.", vi: "Gói gia đình chắc chắn là tiết kiệm nhất tính theo từng ký." },
  try_a_sample: { who: "Sample Host", avatar: "🧑‍🍳", voice: "young_male", anchor: "obj:samplestand",
    en: "Go right ahead! It's our crispy cracker with roasted sesame dressing.", vi: "Mời bạn cứ thử tự nhiên! Bánh quy giòn chấm sốt mè rang mới của tụi mình đấy." },
  ask_about_promo: { who: "Sample Host", avatar: "🧑‍🍳", voice: "young_male", anchor: "obj:samplestand",
    en: "Today's promotion is buy one bottle, get the second one free!", vi: "Khuyến mãi hôm nay là mua một chai tặng miễn phí chai thứ hai!" },
  compliment_sample_taste: { who: "Sample Host", avatar: "🧑‍🍳", voice: "young_male", anchor: "obj:samplestand",
    en: "Glad you like it! You can grab a bottle right here on the display.", vi: "Mừng là bạn thích! Bạn có thể lấy một chai ngay trên bàn trưng bày này nhé." },
  ask_sample_ingredients: { who: "Sample Host", avatar: "🧑‍🍳", voice: "young_male", anchor: "obj:samplestand",
    en: "It's completely dairy-free, nut-free, and made with organic sesame.", vi: "Món này hoàn toàn không có sữa, không hạt cây và làm từ mè hữu cơ." },
  leave_the_store: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Thank you for shopping with us! Have a wonderful day!", vi: "Cảm ơn bạn đã mua sắm! Chúc bạn một ngày tuyệt vời!" },
  check_receipt_before_exit: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Everything looks good on your receipt. See you next time!", vi: "Mọi thứ trên hoá đơn đều chuẩn rồi ạ. Hẹn gặp lại bạn lần sau!" },
  open_umbrella_at_exit: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Stay dry out there! The pavement is a little slippery.", vi: "Đi đường khỏi ướt nhé! Vỉa hè bên ngoài hơi trơn một chút đấy." },
  /* New entrance actions replies (11 more = 30 total NPC replies in market_entrance) */
  sanitize_hands_at_door: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "That sanitizer has aloe vera so it keeps your hands soft.", vi: "Nước rửa tay đó có nha đam nên giữ da tay mềm mại lắm." },
  pick_up_store_flyer: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Take a flyer! We have great deals on fresh pastries and fruit.", vi: "Bạn lấy một tờ rơi nhé! Đang có nhiều ưu đãi tốt cho bánh ngọt và trái cây tươi." },
  print_member_coupons: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Awesome, your member coupons printed out right below the screen!", vi: "Tuyệt quá, phiếu giảm giá thành viên của bạn vừa in ra ngay dưới màn hình kìa!" },
  check_store_directory: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Just tap theProduce & Bakery tab at the top to head straight there!", vi: "Bạn chỉ cần bấm tab Rau quả & Tiệm bánh ở phía trên là đi thẳng sang đó nhé!" },
  store_backpack_in_locker: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "The parcel lockers are free to use while you shop.", vi: "Tủ gửi đồ cá nhân được dùng miễn phí trong suốt lúc bạn mua sắm ạ." },
  wrap_wet_umbrella: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Thanks for bagging your umbrella! That keeps the tiles nice and dry.", vi: "Cảm ơn bạn đã bọc ô lại nhé! Làm vậy giúp sàn gạch luôn khô ráo." },
  smell_fresh_tulips: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Those tulips arrived from Dalat this morning—only five dollars a bunch!", vi: "Mấy bó tulip đó mới về từ Đà Lạt sáng nay — chỉ năm đô một bó thôi!" },
  pick_sunflower_bouquet: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "What a sunny bouquet! There's a packet of flower food attached.", vi: "Bó hoa rực rỡ quá! Có kèm sẵn một gói dưỡng hoa ở cuống đấy ạ." },
  greet_welcome_staff: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Good morning! Yes, the bakery is open and the baguettes are still warm!", vi: "Chào buổi sáng! Vâng, tiệm bánh mở rồi và bánh mì Pháp vẫn còn nóng hổi!" },
  ask_greeter_for_wheelchair: { who: "Welcome Greeter", avatar: "🙋‍♀️", voice: "young_female", anchor: "obj:greeterdesk",
    en: "Right over there—the red car cart and child-seat carts are sanitized and ready.", vi: "Ở ngay đằng kia ạ — xe đẩy ô tô đỏ và xe có ghế trẻ em đều đã khử trùng sẵn sàng." },
  read_special_offer_arch: { who: "Sample Host", avatar: "🧑‍🍳", voice: "young_male", anchor: "obj:samplestand",
    en: "Don't miss the Buy 2 Get 1 Free deal in the bakery section next door!", vi: "Đừng bỏ lỡ ưu đãi Mua 2 tặng 1 ở khu tiệm bánh ngay bên cạnh nhé!" }
};

const PRODUCE_REPLIES = {
  /* Existing 15 actions in market_produce */
  pick_some_apples: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Those Honeycrisp apples are super crunchy and sweet today!", vi: "Mấy quả táo đỏ đó hôm nay giòn và ngọt lịm luôn!" },
  take_some_bananas: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Bananas are twenty percent off—great choice for smoothies!", vi: "Chuối đang giảm 20% — lựa chọn tuyệt vời để xay sinh tố đấy!" },
  pick_some_oranges: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Those navel oranges are seedless and full of vitamin C.", vi: "Cam vàng đó không hạt và giàu vitamin C lắm ạ." },
  ask_mangoes_ripe: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "These yellow mangoes are fragrant and ripe—ready to eat tonight!", vi: "Mấy quả xoài vàng này thơm và chín tới rồi — tối nay ăn được ngay!" },
  get_some_vegetables: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Our carrots and lettuce were harvested from local farms this morning.", vi: "Cà rốt và xà lách của tụi mình vừa thu hoạch từ nông trại sáng nay." },
  pick_ripe_avocados: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "If it yields gently to your thumb, that avocado is perfect for guacamole!", vi: "Nếu ấn nhẹ đầu ngón tay thấy hơi mềm là quả bơ đó làm sốt bơ chuẩn luôn!" },
  smell_fresh_strawberries: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Aren't they fragrant? We keep them chilled so they stay firm.", vi: "Thơm quá phải không? Tụi mình để tủ mát để quả luôn căng mọng." },
  choose_broccoli_for_soup: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Fresh broccoli florets make the best creamy soup on a rainy evening!", vi: "Bông cải xanh tươi nấu súp kem vào tối mưa là ngon hết sẩy!" },
  weigh_the_apples: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Exactly one kilo! Press the green button to print your price sticker.", vi: "Đúng một ký tròn! Bạn bấm nút xanh để in nhãn giá nhé." },
  print_weight_sticker: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Just stick that barcode label right on the front of your produce bag.", vi: "Bạn dán nhãn mã vạch đó ngay mặt trước túi đựng trái cây nhé." },
  weigh_bunch_of_grapes: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Those green grapes are crisp and completely seedless.", vi: "Chùm nho xanh đó giòn tan và hoàn toàn không có hạt." },
  get_some_bread: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "That loaf is still warm! We bake our bread fresh every morning.", vi: "Ổ bánh đó vẫn còn ấm đấy! Sáng nào tụi mình cũng nướng bánh mới." },
  buy_birthday_cake: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "Happy birthday! Would you like me to write a name on the cake?", vi: "Chúc mừng sinh nhật! Bạn có muốn mình viết tên lên bánh không?" },
  smell_warm_baguettes: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "Those French baguettes came out of the brick oven ten minutes ago!", vi: "Mẻ bánh mì Pháp đó vừa ra khỏi lò gạch cách đây mười phút thôi!" },
  pick_whole_wheat_rolls: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "Our whole-wheat rolls are baked with oats, honey, and sunflower seeds.", vi: "Bánh mì nguyên cám của tụi mình nướng cùng yến mạch, mật ong và hạt hướng dương." },
  /* New produce & bakery actions replies (15 more = 30 total NPC replies in market_produce) */
  squeeze_lemons_for_tea: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Pick the heavy, smooth-skinned lemons—they have the most juice!", vi: "Bạn chọn mấy quả chanh cầm nặng tay, vỏ láng nhé — nhiều nước lắm!" },
  pick_red_cherries: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Cherries are two dollars off per box today!", vi: "Anh đào hôm nay đang được giảm hai đô mỗi hộp đấy ạ!" },
  feel_cool_vegetable_mist: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "The misting system runs every fifteen minutes to keep the greens crisp.", vi: "Hệ thống phun sương chạy mỗi mười lăm phút để giữ rau luôn tươi giòn." },
  compare_organic_apples: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "All our organic produce is certified 100% pesticide-free.", vi: "Toàn bộ nông sản hữu cơ ở đây đều đạt chuẩn 100% không thuốc trừ sâu." },
  smell_ripe_pineapple: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "You know the secret! A sweet aroma at the base means it's golden inside.", vi: "Bạn biết mẹo chuẩn đấy! Thơm ngọt ở phần cuống nghĩa là ruột vàng ươm rồi." },
  grab_watermelon_slices: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "We sliced that watermelon less than an hour ago—super refreshing!", vi: "Tụi mình mới cắt mẻ dưa hấu đó chưa đầy một tiếng trước — mát lịm luôn!" },
  smell_fresh_basil_pot: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Keep the basil pot on a sunny windowsill and water it every two days.", vi: "Bạn đặt chậu húng quế ở bệ cửa sổ có nắng và tưới nước hai ngày một lần nhé." },
  pick_white_mushrooms: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Those button mushrooms are great sautéed with garlic and butter.", vi: "Nấm mỡ trắng đó đem xào bơ tỏi là thơm ngon tuyệt vời." },
  ask_clerk_for_sweet_watermelon: { who: "Produce Specialist", avatar: "🧑‍🌾", voice: "young_male", anchor: "obj:produceclerk",
    en: "Listen to this hollow thump—this watermelon is guaranteed sweet and crunchy!", vi: "Nghe tiếng vỗ trầm vang này nhé — quả dưa hấu này đảm bảo ngọt và giòn rụm!" },
  pick_butter_croissants: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "We use pure French butter for those flaky croissants. Enjoy!", vi: "Tụi mình dùng bơ Pháp nguyên chất cho mẻ bánh sừng bò ngàn lớp đó. Chúc ngon miệng!" },
  choose_cinnamon_roll: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "I just drizzled warm cream cheese icing over those cinnamon rolls!", vi: "Mình vừa rưới lớp kem phô mai ấm nóng lên khay bánh cuộn quế đó xong!" },
  ask_custom_cake_message: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "Consider it done! 'Happy Birthday Minh' in rich dark chocolate icing!", vi: "Xong ngay đây! Dòng chữ 'Happy Birthday Minh' bằng kem sô-cô-la đậm đặc nhé!" },
  slice_sourdough_loaf: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "Here's your sliced sourdough loaf, neatly bagged and ready for toast.", vi: "Ổ bánh mì men tự nhiên đã cắt lát đều tăm tắp và đóng túi gọn gàng cho bạn đây." },
  ask_baker_next_batch: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "The garlic herb bread comes out of the oven in just three minutes!", vi: "Mẻ bánh mì bơ tỏi thảo mộc chỉ ba phút nữa là ra lò thôi!" },
  pick_blueberry_muffins: { who: "Master Baker", avatar: "👨‍🍳", voice: "adult_male", anchor: "obj:bakeryoven",
    en: "Those muffins are packed with wild blueberries and a crunchy sugar top.", vi: "Bánh muffin đó đầy ắp việt quất rừng và có lớp đường nướng giòn bên trên." }
};

/* =====================================================================
   ZONE 3: market_dairy — Sữa, đông lạnh & đồ uống (Dairy, Frozen & Drinks)
   21 Objects · 42 Actions · 30 NPC Replies (72 Sentences)
   ===================================================================== */
const dairyShell = `
${sharedDefs}
<rect x="108" y="0" width="892" height="336" fill="url(#mkzWall)"/>
<polygon points="0,0 108,0 108,336 0,640" fill="url(#mkzLeftWall)"/>
<polygon points="108,336 1000,336 1000,640 0,640" fill="url(#mkzFloor)"/>
${D("floor-tiles", floorGrid)}
<rect x="0" y="0" width="1000" height="38" fill="url(#mkzSoffit)"/>
<rect x="108" y="38" width="450" height="10" fill="#2e86de"/>
<rect x="558" y="38" width="442" height="10" fill="#17a589"/>
<text x="330" y="25" font-size="13.5" font-weight="900" fill="#dff6ff" text-anchor="middle" letter-spacing="2.5">🥛 CHILLED DAIRY, EGGS &amp; FROZEN</text>
<text x="780" y="25" font-size="13.5" font-weight="900" fill="#d4efdf" text-anchor="middle" letter-spacing="2.5">🧃 REFRESHING DRINKS &amp; JUICES</text>
${D("pendant-lights", pendantLamp(210, 62) + pendantLamp(440, 62) + pendantLamp(670, 62) + pendantLamp(895, 62))}
${D("aisle-badges", `
  <g font-size="9" font-weight="900" text-anchor="middle">
    <rect x="330" y="50" width="90" height="20" rx="4" fill="#2e86de"/><text x="375" y="63" fill="#fff">AISLE 3 · DAIRY</text>
    <rect x="750" y="50" width="96" height="20" rx="4" fill="#17a589"/><text x="798" y="63" fill="#fff">AISLE 4 · DRINKS</text>
  </g>
`)}
`;

const dairyWorld = [
  /* 1. dairysalesign — hanging ceiling sale banner for dairy & drinks */
  objG("dairysalesign", "dairy & drinks sale banner", "biển giảm giá sữa & đồ uống", 180, 560, 48, `
    <rect class="hit" x="478" y="44" width="164" height="38"/>
    <line x1="504" y1="38" x2="504" y2="48" stroke="#1b3b2c" stroke-width="2"/>
    <line x1="616" y1="38" x2="616" y2="48" stroke="#1b3b2c" stroke-width="2"/>
    <rect x="482" y="48" width="156" height="30" rx="6" fill="#f5d34a" stroke="#c2453b" stroke-width="2"/>
    <text x="560" y="61" font-size="8.5" font-weight="900" fill="#9c241b" text-anchor="middle">CHILLED &amp; FRESH · 20% OFF</text>
    <text x="560" y="72" font-size="7.5" font-weight="900" fill="#1b3b2c" text-anchor="middle">BUY 2 YOGURT GET 1 FREE</text>
  `),
  /* 2. thermometerpanel — digital cooler temperature gauge on wall pillar */
  objG("thermometerpanel", "cooler temperature gauge", "đồng hồ nhiệt độ tủ mát", 336, 138, 136, `
    <rect class="hit" x="112" y="132" width="54" height="92"/>
    <rect x="116" y="136" width="46" height="84" rx="5" fill="#2c3e50" stroke="#1a252f" stroke-width="2"/>
    <rect x="122" y="144" width="34" height="22" rx="3" fill="#0b231e"/>
    <text x="139" y="159" font-size="9.5" font-weight="900" fill="#4cd137" text-anchor="middle">2.0°C</text>
    <rect x="122" y="172" width="34" height="20" rx="3" fill="#0b231e"/>
    <text x="139" y="186" font-size="8.5" font-weight="900" fill="#00a8ff" text-anchor="middle">-18°C</text>
    <text x="139" y="210" font-size="6.5" font-weight="900" fill="#ecf0f1" text-anchor="middle">TEMP OK</text>
  `),
  /* 3. dairy — multi-shelf glass-door fresh milk fridge (colorful blue header) */
  objG("dairy", "dairy fridge", "tủ lạnh sữa", 342, 234, 102, `
    <rect class="hit" x="172" y="100" width="124" height="236"/>
    <rect x="174" y="104" width="120" height="228" rx="6" fill="#dfe6e9" stroke="#2e86de" stroke-width="2.5"/>
    <rect x="174" y="104" width="120" height="22" rx="5" fill="#2e86de"/>
    <text x="234" y="119" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">FRESH MILK · DAIRY</text>
    <rect x="180" y="130" width="108" height="192" fill="url(#mkzGlass)"/>
    <line x1="234" y1="130" x2="234" y2="322" stroke="#7f93a3" stroke-width="2"/>
    <rect x="228" y="210" width="3" height="26" rx="1" fill="#596a78"/>
    <rect x="237" y="210" width="3" height="26" rx="1" fill="#596a78"/>
    <g fill="#7f93a3"><rect x="180" y="178" width="108" height="4"/><rect x="180" y="226" width="108" height="4"/><rect x="180" y="274" width="108" height="4"/></g>
    <!-- Milk bottles & cartons -->
    <g class="mk-milk">
      <rect x="186" y="144" width="16" height="32" rx="3" fill="#fff" stroke="#7fb3d0"/><rect x="186" y="154" width="16" height="8" fill="#2e86de"/>
    </g>
    <g fill="#fff" stroke="#7fb3d0"><rect x="206" y="144" width="16" height="32" rx="3"/><rect x="242" y="144" width="16" height="32" rx="3"/><rect x="262" y="144" width="16" height="32" rx="3"/></g>
    <g fill="#2e86de"><rect x="206" y="154" width="16" height="8"/><rect x="242" y="154" width="16" height="8"/><rect x="262" y="154" width="16" height="8"/></g>
    <!-- Greek yogurt tubs & sharp cheddar -->
    <g fill="#fff" stroke="#5dade2"><rect x="186" y="196" width="20" height="28" rx="3"/><rect x="210" y="196" width="20" height="28" rx="3"/></g>
    <g fill="#f5b041" stroke="#d68910"><rect x="242" y="200" width="20" height="24" rx="3"/><rect x="264" y="200" width="20" height="24" rx="3"/></g>
    <g fill="#aed6f1"><rect x="186" y="242" width="42" height="30" rx="3"/><rect x="242" y="242" width="42" height="30" rx="3"/></g>
    <path class="mk-dateTick" d="M268 140 l5 5 l10 -12" stroke="#27ae60" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  `),
  /* 4. yogurtcooler — coral-pink glass-door yogurt & butter cooler */
  objG("yogurtcooler", "yogurt & butter cooler", "tủ mát sữa chua & bơ", 342, 362, 102, `
    <rect class="hit" x="302" y="100" width="120" height="236"/>
    <rect x="304" y="104" width="116" height="228" rx="6" fill="#dfe6e9" stroke="#e84393" stroke-width="2.5"/>
    <rect x="304" y="104" width="116" height="22" rx="5" fill="#e84393"/>
    <text x="362" y="119" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">YOGURT &amp; BUTTER</text>
    <rect x="310" y="130" width="104" height="192" fill="url(#mkzGlass)"/>
    <line x1="362" y1="130" x2="362" y2="322" stroke="#7f93a3" stroke-width="2"/>
    <g fill="#7f93a3"><rect x="310" y="178" width="104" height="4"/><rect x="310" y="226" width="104" height="4"/><rect x="310" y="274" width="104" height="4"/></g>
    <!-- Strawberry yogurt 4-packs & golden unsalted butter blocks -->
    <g fill="#fd79a8" stroke="#e84393"><rect x="316" y="150" width="20" height="26" rx="3"/><rect x="338" y="150" width="20" height="26" rx="3"/><rect x="368" y="150" width="20" height="26" rx="3"/><rect x="390" y="150" width="20" height="26" rx="3"/></g>
    <g fill="#ffeaa7" stroke="#fdcb6e"><rect x="316" y="200" width="40" height="22" rx="3"/><rect x="368" y="200" width="40" height="22" rx="3"/></g>
    <text x="336" y="214" font-size="6.5" font-weight="900" fill="#8a5a19" text-anchor="middle">BUTTER</text>
    <text x="388" y="214" font-size="6.5" font-weight="900" fill="#8a5a19" text-anchor="middle">UNSALTED</text>
    <g fill="#fab1a0"><rect x="316" y="246" width="40" height="26" rx="3"/><rect x="368" y="246" width="40" height="26" rx="3"/></g>
  `),
  /* 5. cheesecase — golden-amber glass-door artisan cheese cooler */
  objG("cheesecase", "cheese & deli case", "tủ phô mai các loại", 342, 486, 102, `
    <rect class="hit" x="426" y="100" width="120" height="236"/>
    <rect x="428" y="104" width="116" height="228" rx="6" fill="#dfe6e9" stroke="#f39c12" stroke-width="2.5"/>
    <rect x="428" y="104" width="116" height="22" rx="5" fill="#f39c12"/>
    <text x="486" y="119" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">CHEESE SELECTION</text>
    <rect x="434" y="130" width="104" height="192" fill="url(#mkzGlass)"/>
    <line x1="486" y1="130" x2="486" y2="322" stroke="#7f93a3" stroke-width="2"/>
    <g fill="#7f93a3"><rect x="434" y="178" width="104" height="4"/><rect x="434" y="226" width="104" height="4"/><rect x="434" y="274" width="104" height="4"/></g>
    <!-- Cheese wheels, cheddar blocks & sliced mozzarella -->
    <g fill="#f1c40f" stroke="#d68910"><path d="M440 176 l18 -22 l18 22z"/><rect x="492" y="152" width="38" height="24" rx="3"/></g>
    <g fill="#fff9e6" stroke="#d4ac0d"><rect x="440" y="200" width="40" height="24" rx="3"/><rect x="492" y="200" width="40" height="24" rx="3"/></g>
    <text x="460" y="215" font-size="6" font-weight="900" fill="#7d6608" text-anchor="middle">MOZZARELLA</text>
    <g fill="#f5b041"><rect x="440" y="246" width="40" height="26" rx="3"/><rect x="492" y="246" width="40" height="26" rx="3"/></g>
  `),
  /* 6. plantmilkfridge — emerald-green glass-door oat & soy milk cooler */
  objG("plantmilkfridge", "oat & soy milk fridge", "tủ sữa hạt & sữa yến mạch", 342, 608, 102, `
    <rect class="hit" x="550" y="100" width="118" height="236"/>
    <rect x="552" y="104" width="114" height="228" rx="6" fill="#dfe6e9" stroke="#27ae60" stroke-width="2.5"/>
    <rect x="552" y="104" width="114" height="22" rx="5" fill="#27ae60"/>
    <text x="609" y="119" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">OAT &amp; SOY MILK</text>
    <rect x="558" y="130" width="102" height="192" fill="url(#mkzGlass)"/>
    <line x1="609" y1="130" x2="609" y2="322" stroke="#7f93a3" stroke-width="2"/>
    <g fill="#7f93a3"><rect x="558" y="178" width="102" height="4"/><rect x="558" y="226" width="102" height="4"/><rect x="558" y="274" width="102" height="4"/></g>
    <g fill="#f8efba" stroke="#b7950b"><rect x="564" y="144" width="18" height="32" rx="2"/><rect x="586" y="144" width="18" height="32" rx="2"/></g>
    <g fill="#d4efdf" stroke="#27ae60"><rect x="615" y="144" width="18" height="32" rx="2"/><rect x="637" y="144" width="18" height="32" rx="2"/></g>
    <g fill="#ebdef0" stroke="#8e44ad"><rect x="564" y="194" width="18" height="30" rx="2"/><rect x="586" y="194" width="18" height="30" rx="2"/><rect x="615" y="194" width="18" height="30" rx="2"/><rect x="637" y="194" width="18" height="30" rx="2"/></g>
    <text x="609" y="260" font-size="8" font-weight="900" fill="#1e8449" text-anchor="middle">PLANT-BASED</text>
  `),
  /* 7. freshjuicebar — tangerine-orange glass-door cold-pressed fruit juice cooler */
  objG("freshjuicebar", "chilled fruit juice cooler", "tủ nước ép trái cây tươi", 342, 728, 102, `
    <rect class="hit" x="672" y="100" width="114" height="236"/>
    <rect x="674" y="104" width="110" height="228" rx="6" fill="#dfe6e9" stroke="#e67e22" stroke-width="2.5"/>
    <rect x="674" y="104" width="110" height="22" rx="5" fill="#e67e22"/>
    <text x="729" y="119" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">FRESH JUICES</text>
    <rect x="680" y="130" width="98" height="192" fill="url(#mkzGlass)"/>
    <g fill="#7f93a3"><rect x="680" y="178" width="98" height="4"/><rect x="680" y="226" width="98" height="4"/><rect x="680" y="274" width="98" height="4"/></g>
    <g fill="#f39c12" stroke="#d35400"><rect x="686" y="144" width="16" height="32" rx="4"/><rect x="706" y="144" width="16" height="32" rx="4"/><rect x="728" y="144" width="16" height="32" rx="4"/><rect x="748" y="144" width="16" height="32" rx="4"/></g>
    <g fill="#e74c3c"><rect x="686" y="194" width="16" height="30" rx="4"/><rect x="706" y="194" width="16" height="30" rx="4"/></g>
    <g fill="#2ecc71"><rect x="728" y="194" width="16" height="30" rx="4"/><rect x="748" y="194" width="16" height="30" rx="4"/></g>
    <g fill="#f1c40f"><rect x="686" y="242" width="38" height="30" rx="3"/><rect x="732" y="242" width="38" height="30" rx="3"/></g>
  `),
  /* 8. drinksaisle — teal-blue cold drinks cooler (existing object with 5 actions) */
  objG("drinksaisle", "cold drinks cooler", "tủ mát đồ uống", 342, 840, 102, `
    <rect class="hit" x="788" y="100" width="106" height="236"/>
    <rect x="790" y="104" width="102" height="228" rx="6" fill="#dfe6e9" stroke="#17a589" stroke-width="2.5"/>
    <rect x="790" y="104" width="102" height="22" rx="5" fill="#17a589"/>
    <text x="841" y="119" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">COLD DRINKS</text>
    <rect x="796" y="130" width="90" height="192" fill="url(#mkzGlass)"/>
    <g fill="#7f93a3"><rect x="796" y="178" width="90" height="4"/><rect x="796" y="226" width="90" height="4"/><rect x="796" y="274" width="90" height="4"/></g>
    <g class="mk-waterP" fill="#cfe9f7" stroke="#5dade2"><rect x="802" y="144" width="14" height="32" rx="3"/><rect x="820" y="144" width="14" height="32" rx="3"/><rect x="838" y="144" width="14" height="32" rx="3"/></g>
    <rect x="858" y="144" width="18" height="32" rx="3" fill="#aed6f1" stroke="#5dade2"/>
    <g class="mk-juiceP"><rect x="802" y="194" width="16" height="30" rx="2" fill="#f5a623"/></g>
    <rect x="822" y="194" width="16" height="30" rx="2" fill="#e8c34a"/><rect x="842" y="194" width="16" height="30" rx="2" fill="#27ae60"/><rect x="862" y="194" width="16" height="30" rx="2" fill="#8e44ad"/>
    <g fill="#58d68d"><rect x="802" y="242" width="36" height="30" rx="3"/><rect x="844" y="242" width="36" height="30" rx="3"/></g>
  `),
  /* 9. icedcoffeecase — espresso-brown bottled coffee & iced tea cooler */
  objG("icedcoffeecase", "bottled coffee & tea cooler", "tủ cà phê & trà đóng chai", 342, 944, 102, `
    <rect class="hit" x="896" y="100" width="96" height="236"/>
    <rect x="898" y="104" width="92" height="228" rx="6" fill="#dfe6e9" stroke="#6e2c00" stroke-width="2.5"/>
    <rect x="898" y="104" width="92" height="22" rx="5" fill="#6e2c00"/>
    <text x="944" y="119" font-size="8.5" font-weight="900" fill="#ffe8b8" text-anchor="middle">ICED COFFEE</text>
    <rect x="904" y="130" width="80" height="192" fill="url(#mkzGlass)"/>
    <g fill="#7f93a3"><rect x="904" y="178" width="80" height="4"/><rect x="904" y="226" width="80" height="4"/><rect x="904" y="274" width="80" height="4"/></g>
    <g fill="#a04000" stroke="#6e2c00"><rect x="910" y="146" width="14" height="30" rx="3"/><rect x="928" y="146" width="14" height="30" rx="3"/><rect x="946" y="146" width="14" height="30" rx="3"/><rect x="964" y="146" width="14" height="30" rx="3"/></g>
    <g fill="#e59866" stroke="#ba4a00"><rect x="910" y="196" width="16" height="28" rx="3"/><rect x="932" y="196" width="16" height="28" rx="3"/><rect x="954" y="196" width="16" height="28" rx="3"/></g>
    <g fill="#f5cba7"><rect x="910" y="244" width="30" height="28" rx="3"/><rect x="946" y="244" width="30" height="28" rx="3"/></g>
  `),
  /* 10. eggs — farm-fresh egg rack on left wall (existing object with 4 actions) */
  objG("eggs", "egg rack", "kệ trứng tươi", 350, 62, 168, `
    <rect class="hit" x="12" y="160" width="96" height="128"/>
    <polygon points="16,282 104,226 104,158 16,210" fill="url(#mkzWood)" stroke="#6e411b" stroke-width="2"/>
    <rect x="22" y="164" width="76" height="16" rx="3" fill="#f5d34a"/>
    <text x="60" y="176" font-size="8.5" font-weight="900" fill="#5a3d1f" text-anchor="middle">FARM EGGS</text>
    <g class="mk-eggBox"><rect x="24" y="198" width="34" height="22" rx="3" fill="#d9c4a0"/><g fill="#fff8ec"><ellipse cx="32" cy="200" rx="4.5" ry="6"/><ellipse cx="42" cy="200" rx="4.5" ry="6"/><ellipse cx="51" cy="200" rx="4" ry="6"/></g></g>
    <rect x="62" y="186" width="34" height="22" rx="3" fill="#d9c4a0"/><g fill="#e59866"><ellipse cx="70" cy="188" rx="4.5" ry="6"/><ellipse cx="80" cy="188" rx="4.5" ry="6"/><ellipse cx="89" cy="188" rx="4" ry="6"/></g>
    <path class="mk-eggTick" d="M76 220 l5 5 l10 -12" stroke="#27ae60" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  `),
  /* 11. probioticstand — probiotic yogurt drink stand on left wall */
  objG("probioticstand", "probiotic yogurt drink stand", "kệ sữa chua uống men sống", 436, 62, 302, `
    <rect class="hit" x="12" y="296" width="96" height="126"/>
    <polygon points="16,418 104,362 104,296 16,348" fill="#dce6ee" stroke="#5dade2" stroke-width="2"/>
    <rect x="22" y="302" width="76" height="16" rx="3" fill="#e84393"/>
    <text x="60" y="313" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">PROBIOTIC</text>
    <g fill="#ffd6e7" stroke="#e84393"><rect x="28" y="336" width="12" height="22" rx="3"/><rect x="44" y="330" width="12" height="22" rx="3"/><rect x="60" y="324" width="12" height="22" rx="3"/><rect x="76" y="318" width="12" height="22" rx="3"/></g>
  `),
  /* 12. coolerbagrack — insulated freezer bag rack on lower left wall */
  objG("coolerbagrack", "insulated freezer bag rack", "giá treo túi giữ nhiệt", 548, 62, 444, `
    <rect class="hit" x="14" y="438" width="94" height="124"/>
    <rect x="54" y="446" width="8" height="104" fill="#596a78"/>
    <ellipse cx="58" cy="552" rx="28" ry="8" fill="#3a3f46"/>
    <path d="M26 462 h30 l-3 42 h-24z" fill="#2e86de" stroke="#1b4f72" stroke-width="1.5"/>
    <path d="M58 468 h30 l-3 42 h-24z" fill="#17a589" stroke="#0e6251" stroke-width="1.5"/>
    <text x="41" y="486" font-size="6.5" font-weight="900" fill="#fff" text-anchor="middle">COOL</text>
    <text x="73" y="492" font-size="6.5" font-weight="900" fill="#fff" text-anchor="middle">ICE BAG</text>
  `),
  /* 13. freezer — frozen dumplings & berries chest freezer (existing object with 4 actions) */
  objG("freezer", "frozen food chest", "tủ đông thực phẩm", 476, 214, 392, `
    <rect class="hit" x="138" y="388" width="152" height="102"/>
    <ellipse cx="214" cy="488" rx="74" ry="8" fill="#000" opacity=".14"/>
    <polygon points="146,426 282,426 288,452 140,452" fill="url(#mkzGlass)" stroke="#5dade2" stroke-width="2"/>
    <g class="mk-dumpP"><rect x="158" y="432" width="28" height="16" rx="3" fill="#fff8ec" stroke="#c9b9a0"/></g>
    <g class="mk-iceP"><rect x="192" y="432" width="26" height="16" rx="3" fill="#f5b7b1"/></g>
    <rect x="224" y="432" width="24" height="16" rx="3" fill="#85c1e9"/><rect x="252" y="432" width="22" height="16" rx="3" fill="#d7bde2"/>
    <rect x="140" y="452" width="148" height="34" rx="4" fill="#f7f9f9" stroke="#7f93a3" stroke-width="2"/>
    <rect x="140" y="462" width="148" height="14" fill="#2e86de"/>
    <text x="214" y="472" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">❄ DUMPLINGS &amp; BERRIES</text>
  `),
  /* 14. icecreamfreezer — gelato & ice cream tubs chest freezer */
  objG("icecreamfreezer", "ice cream freezer", "tủ kem các vị", 476, 380, 392, `
    <rect class="hit" x="304" y="388" width="152" height="102"/>
    <ellipse cx="380" cy="488" rx="74" ry="8" fill="#000" opacity=".14"/>
    <polygon points="312,426 448,426 454,452 306,452" fill="url(#mkzGlass)" stroke="#e84393" stroke-width="2"/>
    <g><ellipse cx="332" cy="440" rx="14" ry="8" fill="#fd79a8"/><ellipse cx="364" cy="440" rx="14" ry="8" fill="#ffeaa7"/><ellipse cx="396" cy="440" rx="14" ry="8" fill="#55efc4"/><ellipse cx="428" cy="440" rx="14" ry="8" fill="#a29bfe"/></g>
    <rect x="306" y="452" width="148" height="34" rx="4" fill="#f7f9f9" stroke="#7f93a3" stroke-width="2"/>
    <rect x="306" y="462" width="148" height="14" fill="#e84393"/>
    <text x="380" y="472" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">🍨 ICE CREAM &amp; GELATO</text>
  `),
  /* 15. frozenpizzacase — frozen pizza & French fries chest freezer */
  objG("frozenpizzacase", "frozen pizza & fries freezer", "tủ đông pizza & khoai tây", 476, 544, 392, `
    <rect class="hit" x="470" y="388" width="148" height="102"/>
    <ellipse cx="544" cy="488" rx="72" ry="8" fill="#000" opacity=".14"/>
    <polygon points="478,426 610,426 616,452 472,452" fill="url(#mkzGlass)" stroke="#e67e22" stroke-width="2"/>
    <rect x="486" y="432" width="34" height="16" rx="2" fill="#e74c3c"/><circle cx="503" cy="440" r="6" fill="#f1c40f"/>
    <rect x="526" y="432" width="34" height="16" rx="2" fill="#f39c12"/><rect x="566" y="432" width="34" height="16" rx="2" fill="#d35400"/>
    <rect x="472" y="452" width="144" height="34" rx="4" fill="#f7f9f9" stroke="#7f93a3" stroke-width="2"/>
    <rect x="472" y="462" width="144" height="14" fill="#e67e22"/>
    <text x="544" y="472" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">🍕 FROZEN PIZZA &amp; FRIES</text>
  `),
  /* 16. frozenvegcase — frozen peas, sweet corn & mixed veggies case */
  objG("frozenvegcase", "frozen vegetables case", "tủ rau củ đông lạnh", 476, 700, 392, `
    <rect class="hit" x="632" y="388" width="138" height="102"/>
    <ellipse cx="700" cy="488" rx="66" ry="8" fill="#000" opacity=".14"/>
    <polygon points="640,426 762,426 768,452 634,452" fill="url(#mkzGlass)" stroke="#27ae60" stroke-width="2"/>
    <rect x="648" y="432" width="32" height="16" rx="2" fill="#f1c40f"/><rect x="686" y="432" width="32" height="16" rx="2" fill="#2ecc71"/><rect x="724" y="432" width="30" height="16" rx="2" fill="#27ae60"/>
    <rect x="634" y="452" width="134" height="34" rx="4" fill="#f7f9f9" stroke="#7f93a3" stroke-width="2"/>
    <rect x="634" y="462" width="134" height="14" fill="#27ae60"/>
    <text x="701" y="472" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">🌽 FROZEN VEGGIES</text>
  `),
  /* 17. dairyclerk — Dairy & Drinks Clerk in blue vest with inventory tablet */
  objG("dairyclerk", "dairy & drinks clerk", "nhân viên quầy sữa & đồ uống", 476, 840, 366, `
    <rect class="hit" x="796" y="362" width="86" height="126"/>
    <ellipse cx="840" cy="484" rx="34" ry="7" fill="#000" opacity=".14"/>
    <g>
      <circle cx="840" cy="390" r="15" fill="#f2c49b"/>
      <path d="M824 388 Q840 368 856 388z" fill="#2e86de"/>
      <circle cx="835" cy="391" r="1.8" fill="#2d2a26"/><circle cx="845" cy="391" r="1.8" fill="#2d2a26"/>
      <path d="M835 398 Q840 402 845 398" stroke="#8a2f3c" stroke-width="1.8" fill="none"/>
      <rect x="820" y="406" width="40" height="52" rx="10" fill="#2e86de"/>
      <rect x="826" y="414" width="28" height="38" rx="4" fill="#fff"/>
      <rect x="844" y="424" width="16" height="20" rx="2" fill="#2c3e50" stroke="#7fd0c8" stroke-width="1.2"/>
    </g>
  `),
  /* 18. dairyendcap — chilled caramel pudding & whipped cream display */
  objG("dairyendcap", "whipped cream & pudding shelf", "kệ kem tươi & bánh pudding", 482, 944, 378, `
    <rect class="hit" x="896" y="376" width="94" height="116"/>
    <rect x="900" y="380" width="86" height="108" rx="5" fill="#fff8ec" stroke="#d68910" stroke-width="2"/>
    <rect x="900" y="380" width="86" height="18" rx="4" fill="#d68910"/>
    <text x="943" y="392" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">PUDDING &amp; CREAM</text>
    <g fill="#f5b041" stroke="#6e2c00"><rect x="910" y="410" width="20" height="22" rx="3"/><rect x="934" y="410" width="20" height="22" rx="3"/><rect x="958" y="410" width="20" height="22" rx="3"/></g>
    <g fill="#aed6f1" stroke="#2e86de"><rect x="914" y="446" width="16" height="32" rx="3"/><rect x="936" y="446" width="16" height="32" rx="3"/><rect x="958" y="446" width="16" height="32" rx="3"/></g>
  `),
  /* 19. icecubefreezer — foreground bagged ice cubes chest */
  objG("icecubefreezer", "bagged ice chest", "tủ đá viên tinh khiết", 602, 212, 516, `
    <rect class="hit" x="142" y="514" width="142" height="98"/>
    <ellipse cx="213" cy="610" rx="68" ry="8" fill="#000" opacity=".14"/>
    <rect x="146" y="522" width="134" height="84" rx="5" fill="#d6eaf8" stroke="#2e86de" stroke-width="2"/>
    <rect x="146" y="522" width="134" height="20" rx="4" fill="#2e86de"/>
    <text x="213" y="536" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">🧊 PURE ICE CUBES</text>
    <g fill="#ebf5fb" stroke="#5dade2"><rect x="158" y="550" width="32" height="44" rx="4"/><rect x="197" y="550" width="32" height="44" rx="4"/><rect x="236" y="550" width="32" height="44" rx="4"/></g>
    <text x="213" y="576" font-size="7.5" font-weight="900" fill="#1b4f72" text-anchor="middle">2 KG BAG</text>
  `),
  /* 20. sodarack — foreground sparkling soda & zero-sugar cola island */
  objG("sodarack", "sparkling soda shelf", "quầy nước ngọt có ga", 602, 426, 514, `
    <rect class="hit" x="334" y="512" width="184" height="100"/>
    <ellipse cx="426" cy="610" rx="88" ry="8" fill="#000" opacity=".15"/>
    <rect x="338" y="520" width="176" height="86" rx="5" fill="url(#mkzWood)" stroke="#6e411b" stroke-width="2"/>
    <rect x="338" y="520" width="176" height="18" rx="4" fill="#c2453b"/>
    <text x="426" y="533" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">🥤 SPARKLING SODA &amp; COLA</text>
    <!-- Lemon-lime green cans & Zero-Sugar black/red cans -->
    <g fill="#2ecc71" stroke="#1e8449"><rect x="350" y="548" width="16" height="26" rx="3"/><rect x="370" y="548" width="16" height="26" rx="3"/><rect x="390" y="548" width="16" height="26" rx="3"/></g>
    <g fill="#2c3e50" stroke="#c0392b"><rect x="420" y="548" width="16" height="26" rx="3"/><rect x="440" y="548" width="16" height="26" rx="3"/><rect x="460" y="548" width="16" height="26" rx="3"/><rect x="480" y="548" width="16" height="26" rx="3"/></g>
    <text x="458" y="592" font-size="8" font-weight="900" fill="#ffe8b8" text-anchor="middle">ZERO SUGAR · CHILLED</text>
  `),
  /* 21. mineralwaterstack — foreground mineral water 6-packs & 5L jugs */
  objG("mineralwaterstack", "mineral water display", "kệ nước khoáng thiên nhiên", 602, 658, 514, `
    <rect class="hit" x="566" y="512" width="184" height="100"/>
    <ellipse cx="658" cy="610" rx="88" ry="8" fill="#000" opacity=".15"/>
    <rect x="570" y="520" width="176" height="86" rx="5" fill="#e8f8f5" stroke="#17a589" stroke-width="2"/>
    <rect x="570" y="520" width="176" height="18" rx="4" fill="#17a589"/>
    <text x="658" y="533" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">💧 NATURAL MINERAL WATER</text>
    <g fill="#a3e4d7" stroke="#148f77"><rect x="584" y="546" width="38" height="48" rx="5"/><rect x="630" y="546" width="38" height="48" rx="5"/><rect x="676" y="546" width="54" height="48" rx="5"/></g>
    <text x="603" y="574" font-size="7.5" font-weight="900" fill="#0e6251" text-anchor="middle">5L JUG</text>
    <text x="703" y="574" font-size="7.5" font-weight="900" fill="#0e6251" text-anchor="middle">6-PACK</text>
  `)
].join("\n");

const dairyObjects = Object.assign(
  Object.fromEntries(Object.entries(S.allObjects).filter(([k]) => S.DAIRY_OBJS.has(k))),
  {
    yogurtcooler: {
      en: "yogurt & butter cooler", vi: "tủ mát sữa chua & bơ", ipa: "/ˈjɑɡ.ət ən ˈbʌt.ər ˈkuː.lər/",
      acts: ["pick_strawberry_yogurt_pack", "grab_unsalted_butter"]
    },
    cheesecase: {
      en: "cheese & deli case", vi: "tủ phô mai các loại", ipa: "/tʃiːz ən ˈdel.i keɪs/",
      acts: ["pick_a_block_of_cheese", "choose_sliced_mozzarella"]
    },
    plantmilkfridge: {
      en: "oat & soy milk fridge", vi: "tủ sữa hạt & sữa yến mạch", ipa: "/oʊt ən sɔɪ mɪlk frɪdʒ/",
      acts: ["open_the_fridge_door", "take_a_carton_of_milk"]
    },
    icecreamfreezer: {
      en: "ice cream freezer", vi: "tủ kem các vị", ipa: "/ˌaɪs ˈkriːm ˈfriː.zər/",
      acts: ["open_the_freezer_door", "pick_a_tub_of_ice_cream"]
    },
    frozenpizzacase: {
      en: "frozen pizza & fries freezer", vi: "tủ đông pizza & khoai tây", ipa: "/ˈfroʊ.zən ˈpiːt.sə ˈfriː.zər/",
      acts: ["grab_frozen_cheese_pizza", "pick_crispy_french_fries"]
    },
    frozenvegcase: {
      en: "frozen vegetables case", vi: "tủ rau củ đông lạnh", ipa: "/ˈfroʊ.zən ˈvedʒ.tə.bəlz keɪs/",
      acts: ["pick_frozen_sweet_corn"]
    },
    sodarack: {
      en: "sparkling soda shelf", vi: "quầy nước ngọt có ga", ipa: "/ˈspɑː.klɪŋ ˈsoʊ.də ʃelf/",
      acts: ["grab_sparkling_lemon_soda", "check_zero_sugar_cola"]
    },
    mineralwaterstack: {
      en: "mineral water display", vi: "kệ nước khoáng thiên nhiên", ipa: "/ˈmɪn.ər.əl ˈwɔː.tər dɪˈspleɪ/",
      acts: ["lift_mineral_water_jug"]
    },
    freshjuicebar: {
      en: "chilled fruit juice cooler", vi: "tủ nước ép trái cây tươi", ipa: "/tʃɪld fruːt dʒuːs ˈkuː.lər/",
      acts: ["grab_orange_juice", "pick_cold_pressed_apple_juice"]
    },
    icedcoffeecase: {
      en: "bottled coffee & tea cooler", vi: "tủ cà phê & trà đóng chai", ipa: "/ˈbɑt.əld ˈkɑf.i ˈkuː.lər/",
      acts: ["grab_chilled_iced_latte", "pick_peach_iced_tea"]
    },
    dairysalesign: {
      en: "dairy & drinks sale banner", vi: "biển giảm giá sữa & đồ uống", ipa: "/ˈder.ri seɪl ˈbæn.ər/",
      acts: ["read_dairy_sale_sign", "check_buy_two_yogurt_deal"]
    },
    dairyclerk: {
      en: "dairy & drinks clerk", vi: "nhân viên quầy sữa & đồ uống", ipa: "/ˈder.ri ən drɪŋks klɑːk/",
      acts: ["ask_dairy_clerk_lactose_free"]
    },
    thermometerpanel: {
      en: "cooler temperature gauge", vi: "đồng hồ nhiệt độ tủ mát", ipa: "/ˈkuː.lər ˈtem.prə.tʃər ɡeɪdʒ/",
      acts: ["check_cooler_temperature"]
    },
    coolerbagrack: {
      en: "insulated freezer bag rack", vi: "giá treo túi giữ nhiệt", ipa: "/ˈɪn.sjə.leɪ.tɪd bæɡ ræk/",
      acts: ["take_insulated_freezer_bag"]
    },
    probioticstand: {
      en: "probiotic yogurt drink stand", vi: "kệ sữa chua uống men sống", ipa: "/ˌproʊ.baɪˈɑt.ɪk drɪŋk stænd/",
      acts: ["grab_probiotic_yogurt_drink"]
    },
    icecubefreezer: {
      en: "bagged ice chest", vi: "tủ đá viên tinh khiết", ipa: "/bæɡd aɪs tʃest/",
      acts: ["grab_bag_of_ice_cubes"]
    },
    dairyendcap: {
      en: "whipped cream & pudding shelf", vi: "kệ kem tươi & bánh pudding", ipa: "/wɪpt kriːm ən ˈpʊd.ɪŋ ʃelf/",
      acts: ["pick_caramel_pudding_cups"]
    }
  }
);

/* 24 New Actions for market_dairy (18 existing + 24 new = 42 actions) */
const dairyNewActions = [
  mkA("pick_strawberry_yogurt_pack", "yogurtcooler", "Pick a strawberry yogurt pack", "Lấy lốc sữa chua dâu tây",
    "I'm grabbing a four-pack of creamy strawberry yogurt while it's on sale.",
    "Tôi đang lấy một lốc bốn hộp sữa chua dâu tây sánh mịn nhân lúc đang giảm giá.",
    ["strawberry yogurt", "on sale"], ["yogurt", "sale", "fresh"],
    "<b>a four-pack of …</b> = một lốc 4 hộp. <b>creamy</b> = sánh mịn, béo ngậy.",
    ["I'm grabbing a four-pack", "of creamy strawberry yogurt while it's on sale."], ["yogurt", "younger", "yellow"],
    ["Kids love <b>strawberry yogurt</b>.", "It's <b>on sale</b> in the dairy cooler."],
    once("mkd_strawyogurt", "yes", "Bạn đã lấy lốc sữa chua dâu tây rồi."),
    at("mkd_yogurt", "reach", 800, [["mkd_strawyogurt", "yes"]]),
    ["pick a strawberry yogurt pack", "grab a four-pack of strawberry yogurt", "lấy lốc sữa chua dâu tây"]),

  mkA("grab_unsalted_butter", "yogurtcooler", "Grab unsalted butter for baking", "Lấy bơ lạt để làm bánh",
    "I need a block of fresh unsalted butter to bake cookies this weekend.",
    "Mình cần một thỏi bơ lạt tươi để nướng bánh quy vào cuối tuần này.",
    ["unsalted butter", "fresh"], ["butter", "unsalted", "fresh"],
    "<b>unsalted butter</b> = bơ lạt (không muối), rất hay dùng khi làm bánh; <b>salted butter</b> = bơ mặn.",
    ["I need a block of fresh unsalted butter", "to bake cookies this weekend."], ["butter", "better", "bitter"],
    ["Keep the <b>unsalted butter</b> in the fridge.", "Let the butter soften before baking."],
    once("mkd_butter", "yes", "Bạn đã lấy thỏi bơ lạt rồi."),
    at("mkd_yogurt", "reach", 800, [["mkd_butter", "yes"]]),
    ["grab unsalted butter for baking", "pick a block of unsalted butter", "lấy bơ lạt để làm bánh"]),

  mkA("pick_a_block_of_cheese", "cheesecase", "Pick a block of aged cheese", "Chọn một khối phô mai ủ thơm",
    "This block of aged Gouda cheese has a rich, nutty flavor.",
    "Khối phô mai Gouda ủ lâu năm này có hương vị đậm đà và béo bùi.",
    ["block of cheese", "rich"], ["cheddar", "fridge"],
    "<b>aged cheese</b> = phô mai ủ lâu năm; <b>rich flavor</b> = hương vị đậm đà.",
    ["This block of aged Gouda cheese", "has a rich, nutty flavor."], ["cheese", "choose", "cheers"],
    ["Let's buy a <b>block of cheese</b> for pasta.", "Store <b>cheese</b> in the middle drawer."],
    once("mkd_cheeseblock", "yes", "Bạn đã chọn khối phô mai Gouda rồi."),
    at("mkd_cheese", "reach", 800, [["mkd_cheeseblock", "yes"]]),
    ["pick a block of aged cheese", "choose a block of Gouda cheese", "chọn một khối phô mai ủ thơm"]),

  mkA("choose_sliced_mozzarella", "cheesecase", "Choose sliced mozzarella cheese", "Chọn phô mai mozzarella cắt lát",
    "I'll take a pack of sliced mozzarella cheese for our homemade sandwiches.",
    "Mình sẽ lấy một gói phô mai mozzarella cắt lát để kẹp bánh mì tại nhà.",
    ["mozzarella cheese", "sliced"], ["mozzarella", "slice"],
    "<b>sliced cheese</b> = phô mai đã cắt lát sẵn; <b>shredded cheese</b> = phô mai bào sợi.",
    ["I'll take a pack of sliced mozzarella cheese", "for our homemade sandwiches."], ["slice", "spice", "twice"],
    ["<b>Mozzarella cheese</b> melts beautifully on pizza.", "Put a slice of cheese on the bread."],
    once("mkd_mozzarella", "yes", "Bạn đã lấy gói phô mai mozzarella cắt lát rồi."),
    at("mkd_cheese", "reach", 800, [["mkd_mozzarella", "yes"]]),
    ["choose sliced mozzarella cheese", "take a pack of sliced mozzarella", "chọn phô mai mozzarella cắt lát"]),

  mkA("open_the_fridge_door", "plantmilkfridge", "Open the glass fridge door", "Mở cửa kính tủ mát sữa hạt",
    "I'm opening the chilled glass fridge door to look at the organic oat milk.",
    "Tôi đang mở cánh cửa kính tủ mát để xem các loại sữa yến mạch hữu cơ.",
    ["glass fridge door", "organic"], ["fridge", "oatmilk", "organic"],
    "<b>glass fridge door</b> = cửa kính tủ mát; <b>oat milk</b> = sữa yến mạch.",
    ["I'm opening the chilled glass fridge door", "to look at the organic oat milk."], ["fridge", "bridge", "ridge"],
    ["Open the <b>fridge door</b> quickly so the cold air stays in.", "We have <b>organic oat milk</b>."],
    once("mkd_fridgedoor", "yes", "Bạn đã mở cửa kính tủ mát rồi."),
    at("mkd_plantmilk", "reach", 700, [["mkd_fridgedoor", "yes"]]),
    ["open the glass fridge door", "open the oat milk fridge door", "mở cửa kính tủ mát sữa hạt"]),

  mkA("take_a_carton_of_milk", "plantmilkfridge", "Take a carton of oat milk", "Lấy một hộp sữa yến mạch",
    "I'll take a one-liter carton of unsweetened organic oat milk for my morning coffee.",
    "Mình sẽ lấy một hộp sữa yến mạch hữu cơ không đường loại một lít để pha cà phê sáng.",
    ["carton", "oat milk", "organic"], ["carton", "oatmilk", "organic"],
    "<b>a carton of milk</b> = một hộp sữa giấy; <b>unsweetened</b> = không đường.",
    ["I'll take a one-liter carton", "of unsweetened organic oat milk for my morning coffee."], ["carton", "cotton", "button"],
    ["Shake the <b>carton of oat milk</b> well before pouring.", "It tastes great in iced coffee."],
    W => W.mkd_fridgedoor !== "yes" ? "Cửa tủ mát đang đóng. Hãy mở cửa kính tủ mát trước (Open the glass fridge door)." : W.mkd_oatmilk === "yes" ? "Bạn đã lấy hộp sữa yến mạch rồi." : null,
    at("mkd_plantmilk", "reach", 800, [["mkd_oatmilk", "yes"]]),
    ["take a carton of oat milk", "grab a carton of organic oat milk", "lấy một hộp sữa yến mạch"]),

  mkA("open_the_freezer_door", "icecreamfreezer", "Slide open the ice cream freezer", "Kéo mở nắp kính tủ kem",
    "Let's slide open the glass freezer lid to see all the frozen ice cream flavors.",
    "Hãy kéo mở nắp kính tủ đông để xem tất cả các vị kem mát lạnh nào.",
    ["freezer lid", "frozen", "ice cream"], ["frozen", "icecream"],
    "<b>slide open</b> = trượt / kéo mở ngang (nắp kính tủ kem).",
    ["Let's slide open the glass freezer lid", "to see all the frozen ice cream flavors."], ["frozen", "chosen", "spoken"],
    ["Slide open the <b>freezer</b> door gently.", "Which flavor of <b>ice cream</b> do you want?"],
    once("mkd_freezerdoor2", "yes", "Bạn đã kéo mở nắp kính tủ kem rồi."),
    at("mkd_icecream", "reach", 700, [["mkd_freezerdoor2", "yes"]]),
    ["slide open the ice cream freezer", "open the glass lid of the ice cream freezer", "kéo mở nắp kính tủ kem"]),

  mkA("pick_a_tub_of_ice_cream", "icecreamfreezer", "Pick a tub of vanilla ice cream", "Lấy hộp kem va-ni lớn",
    "I'm picking a family-size tub of creamy vanilla bean ice cream.",
    "Mình đang chọn một hộp kem va-ni sánh mịn cỡ gia đình.",
    ["tub of ice cream", "vanilla"], ["tub", "icecream"],
    "<b>a tub of ice cream</b> = một hộp kem tròn lớn (khác với <b>a cone</b> = cây kem ốc quế).",
    ["I'm picking a family-size tub", "of creamy vanilla bean ice cream."], ["tub", "tab", "top"],
    ["Let's share a <b>tub of ice cream</b> after dinner.", "Put it in the freezer right away."],
    W => W.mkd_freezerdoor2 !== "yes" ? "Nắp tủ kem đang đóng. Hãy kéo mở nắp tủ kem trước (Slide open the ice cream freezer)." : W.mkd_icetub === "yes" ? "Bạn đã lấy hộp kem va-ni rồi." : null,
    at("mkd_icecream", "reach", 800, [["mkd_icetub", "yes"]]),
    ["pick a tub of vanilla ice cream", "grab a family tub of vanilla ice cream", "lấy hộp kem va-ni lớn"]),

  mkA("grab_frozen_cheese_pizza", "frozenpizzacase", "Grab a frozen four-cheese pizza", "Lấy bánh pizza bốn vị phô mai đông lạnh",
    "This frozen four-cheese pizza bakes in the oven in just twelve minutes!",
    "Chiếc bánh pizza bốn vị phô mai đông lạnh này nướng trong lò chỉ mất mười hai phút thôi!",
    ["frozen pizza", "oven"], ["frozenpizza", "frozen"],
    "<b>bake in just 12 minutes</b> = nướng chín chỉ trong 12 phút — rất tiện cho bữa tối bận rộn.",
    ["This frozen four-cheese pizza", "bakes in the oven in just twelve minutes!"], ["pizza", "plaza", "pita"],
    ["Preheat the oven before baking a <b>frozen pizza</b>.", "Add extra mushrooms on top!"],
    once("mkd_pizza", "yes", "Bạn đã lấy bánh pizza phô mai đông lạnh rồi."),
    at("mkd_pizza", "reach", 800, [["mkd_pizza", "yes"]]),
    ["grab a frozen four-cheese pizza", "take a box of frozen cheese pizza", "lấy bánh pizza đông lạnh"]),

  mkA("pick_crispy_french_fries", "frozenpizzacase", "Pick crinkle-cut French fries", "Lấy gói khoai tây chiên cắt răng cưa",
    "I'll grab a bag of frozen crinkle-cut French fries for the air fryer.",
    "Mình sẽ lấy một gói khoai tây đông lạnh cắt răng cưa để nướng bằng nồi chiên không dầu.",
    ["frozen", "French fries"], ["fries", "frozen", "crispy"],
    "<b>crinkle-cut French fries</b> = khoai tây cắt lượn sóng; <b>air fryer</b> = nồi chiên không dầu.",
    ["I'll grab a bag of frozen crinkle-cut French fries", "for the air fryer."], ["fries", "flies", "tries"],
    ["Air-fried <b>French fries</b> come out super <b>crispy</b>.", "Keep the bag in the freezer."],
    once("mkd_fries", "yes", "Bạn đã lấy gói khoai tây chiên đông lạnh rồi."),
    at("mkd_pizza", "reach", 800, [["mkd_fries", "yes"]]),
    ["pick crinkle-cut French fries", "grab a bag of frozen French fries", "lấy gói khoai tây chiên đông lạnh"]),

  mkA("pick_frozen_sweet_corn", "frozenvegcase", "Pick frozen sweet corn & peas", "Lấy gói bắp ngọt và đậu Hà Lan đông lạnh",
    "Frozen sweet corn and green peas are flash-frozen right after harvest to lock in nutrients.",
    "Bắp ngọt và đậu Hà Lan đông lạnh được cấp đông nhanh ngay sau khi thu hoạch để giữ trọn dinh dưỡng.",
    ["frozen sweet corn", "nutrients"], ["sweetcorn", "frozen", "healthy"],
    "<b>flash-frozen</b> = cấp đông siêu tốc; <b>lock in nutrients</b> = giữ trọn chất dinh dưỡng.",
    ["Frozen sweet corn and green peas", "are flash-frozen right after harvest to lock in nutrients."], ["corn", "coin", "cone"],
    ["Add <b>frozen sweet corn</b> to fried rice or soup.", "It's sweet, tender, and <b>healthy</b>."],
    once("mkd_corn", "yes", "Bạn đã lấy gói bắp ngọt và đậu Hà Lan đông lạnh rồi."),
    at("mkd_vegcase", "reach", 800, [["mkd_corn", "yes"]]),
    ["pick frozen sweet corn and peas", "grab a bag of frozen sweet corn", "lấy gói bắp ngọt đông lạnh"]),

  mkA("grab_sparkling_lemon_soda", "sodarack", "Grab sparkling lemon-lime soda", "Lấy lốc nước ngọt hương chanh có ga",
    "Chilled sparkling lemon-lime soda is so fizzy and refreshing on a hot afternoon.",
    "Nước ngọt có ga hương chanh ướp lạnh sủi tăm mát sảng khoái vào buổi chiều nắng nóng.",
    ["sparkling soda", "chilled"], ["sparkling", "chilled"],
    "<b>fizzy / sparkling</b> = có ga sủi bọt; <b>flat</b> = (nước ngọt) bị bay hết ga.",
    ["Chilled sparkling lemon-lime soda", "is so fizzy and refreshing on a hot afternoon."], ["soda", "sofa", "solar"],
    ["Serve the <b>sparkling soda</b> over ice.", "Don't shake the can before opening!"],
    once("mkd_soda", "yes", "Bạn đã lấy nước ngọt hương chanh có ga rồi."),
    at("mkd_soda", "reach", 800, [["mkd_soda", "yes"]]),
    ["grab sparkling lemon-lime soda", "pick a pack of sparkling lemon soda", "lấy lốc nước ngọt hương chanh có ga"]),

  mkA("check_zero_sugar_cola", "sodarack", "Check the zero-sugar cola cans", "Xem lon nước ngọt cola không đường",
    "Let's pick the zero-sugar cola—all the crisp taste without any calories.",
    "Mình chọn loại cola không đường nhé — vẫn giữ vị ngon sảng khoái mà không có calo.",
    ["zero-sugar", "crisp"], ["zerosugar", "nosugar", "crisp"],
    "<b>zero-sugar / sugar-free</b> = không đường; <b>calories</b> = năng lượng (ca-lo).",
    ["Let's pick the zero-sugar cola—", "all the crisp taste without any calories."], ["sugar", "sure", "super"],
    ["This drink is <b>zero-sugar</b> and caffeine-free.", "Check the nutrition label on the can."],
    once("mkd_zerosoda", "yes", "Bạn đã chọn lốc cola không đường rồi."),
    at("mkd_soda", "read", 800, [["mkd_zerosoda", "yes"]]),
    ["check the zero-sugar cola cans", "pick zero-sugar cola cans", "xem lon nước ngọt cola không đường"]),

  mkA("lift_mineral_water_jug", "mineralwaterstack", "Lift a five-liter mineral water jug", "Nhấc bình nước khoáng thiên nhiên 5 lít",
    "I'm lifting a five-liter jug of natural spring mineral water for our camping trip.",
    "Tôi đang nhấc một bình nước khoáng suối nguồn tự nhiên loại năm lít cho chuyến cắm trại.",
    ["mineral water", "five-liter"], ["mineralwater", "water"],
    "<b>spring water / mineral water</b> = nước suối khoáng thiên nhiên; <b>jug</b> = bình có quai xách.",
    ["I'm lifting a five-liter jug", "of natural spring mineral water for our camping trip."], ["water", "waiter", "winter"],
    ["Carry the <b>mineral water</b> jug by its sturdy handle.", "Stay hydrated outdoors!"],
    once("mkd_mineral", "yes", "Bạn đã lấy bình nước khoáng 5 lít rồi."),
    at("mkd_mineral", "bend", 900, [["mkd_mineral", "yes"]]),
    ["lift a five-liter mineral water jug", "take a large jug of mineral water", "nhấc bình nước khoáng thiên nhiên 5 lít"]),

  mkA("grab_orange_juice", "freshjuicebar", "Grab freshly squeezed orange juice", "Lấy chai nước cam vắt tươi mát lạnh",
    "I'm grabbing a chilled bottle of freshly squeezed orange juice with pulp.",
    "Tôi đang lấy một chai nước cam vắt tươi nguyên tép ướp lạnh.",
    ["chilled", "orange juice"], ["chilled", "juice", "orange"],
    "<b>with pulp</b> = có tép cam tươi; <b>pulp-free / smooth</b> = đã lọc hết tép.",
    ["I'm grabbing a chilled bottle", "of freshly squeezed orange juice with pulp."], ["juice", "choose", "shoes"],
    ["A glass of <b>chilled</b> orange <b>juice</b> wakes you right up!", "It's 100% pure fruit juice."],
    once("mkd_orangejuice", "yes", "Bạn đã lấy chai nước cam vắt tươi rồi."),
    at("mkd_juicebar", "reach", 800, [["mkd_orangejuice", "yes"]]),
    ["grab freshly squeezed orange juice", "take a chilled bottle of orange juice", "lấy chai nước cam vắt tươi mát lạnh"]),

  mkA("pick_cold_pressed_apple_juice", "freshjuicebar", "Pick cold-pressed green juice", "Chọn nước ép lạnh táo xanh & cần tây",
    "This cold-pressed green apple and kale juice is packed with vitamins and has no added sugar.",
    "Chai nước ép lạnh từ táo xanh và cải xoăn này giàu vitamin và hoàn toàn không thêm đường.",
    ["cold-pressed juice", "no added sugar"], ["coldpressed", "nosugar", "healthy"],
    "<b>cold-pressed juice</b> = nước ép chậm/ép lạnh giữ nguyên enzyme và vitamin.",
    ["This cold-pressed green apple and kale juice", "is packed with vitamins and has no added sugar."], ["pressed", "dressed", "blessed"],
    ["<b>Cold-pressed juice</b> must be kept refrigerated.", "Drink it within two days of opening."],
    once("mkd_coldjuice", "yes", "Bạn đã chọn chai nước ép lạnh táo xanh rồi."),
    at("mkd_juicebar", "reach", 800, [["mkd_coldjuice", "yes"]]),
    ["pick cold-pressed green juice", "grab a bottle of cold-pressed apple juice", "chọn nước ép lạnh táo xanh"]),

  mkA("grab_chilled_iced_latte", "icedcoffeecase", "Grab a bottled iced caramel latte", "Lấy cà phê latte caramel đóng chai",
    "A chilled bottle of Arabica iced latte is just what I need for the afternoon drive.",
    "Một chai cà phê sữa đá Arabica ướp lạnh đúng là thứ mình cần cho chuyến xe buổi chiều.",
    ["bottled iced latte", "chilled"], ["icedlatte", "chilled"],
    "<b>just what I need</b> = đúng thứ tôi đang cần.",
    ["A chilled bottle of Arabica iced latte", "is just what I need for the afternoon drive."], ["latte", "later", "letter"],
    ["Shake the <b>bottled iced latte</b> gently before opening.", "It's smooth and not overly sweet."],
    once("mkd_icedlatte", "yes", "Bạn đã lấy chai cà phê latte ướp lạnh rồi."),
    at("mkd_coffee", "reach", 800, [["mkd_icedlatte", "yes"]]),
    ["grab a bottled iced caramel latte", "pick a chilled bottle of iced coffee", "lấy cà phê latte đóng chai"]),

  mkA("pick_peach_iced_tea", "icedcoffeecase", "Pick brewed peach iced tea", "Chọn trà đào ủ lạnh đóng chai",
    "This fragrant peach oolong iced tea is lightly sweetened with honey.",
    "Chai trà ô-long đào ướp lạnh thơm dịu này được làm ngọt nhẹ bằng mật ong.",
    ["peach iced tea", "honey"], ["peachtea", "honey"],
    "<b>lightly sweetened</b> = làm ngọt thanh/dịu nhẹ, không gắt.",
    ["This fragrant peach oolong iced tea", "is lightly sweetened with honey."], ["peach", "beach", "teach"],
    ["Chilled <b>peach iced tea</b> is my favorite summer drink.", "It's brewed from real tea leaves."],
    once("mkd_peachtea", "yes", "Bạn đã chọn chai trà đào ủ lạnh rồi."),
    at("mkd_coffee", "reach", 800, [["mkd_peachtea", "yes"]]),
    ["pick brewed peach iced tea", "grab a bottle of peach oolong iced tea", "chọn trà đào ủ lạnh đóng chai"]),

  mkA("read_dairy_sale_sign", "dairysalesign", "Read the dairy discount banner", "Xem biển giảm giá 20% quầy sữa",
    "Look at the hanging sign—all chilled dairy and fresh juices are twenty percent off today!",
    "Nhìn tấm biển treo kìa — tất cả các món bơ sữa ướp lạnh và nước ép tươi đều giảm hai mươi phần trăm hôm nay!",
    ["chilled", "twenty percent off"], ["chilled", "sale", "discount"],
    "<b>hanging sign / banner</b> = biển quảng cáo treo trên cao giúp khách dễ tìm khu khuyến mãi.",
    ["Look at the hanging sign—", "all chilled dairy and fresh juices are twenty percent off today!"], ["sign", "fine", "line"],
    ["Check the yellow <b>sale banner</b> above the cooler.", "Organic milk is <b>20% off</b>!"],
    once("mkd_salesign", "yes", "Bạn đã đọc biển giảm giá quầy sữa rồi."),
    at("mkd_sign", "read", 800, [["mkd_salesign", "yes"]]),
    ["read the dairy discount banner", "look at the hanging dairy sale sign", "xem biển giảm giá quầy sữa"]),

  mkA("check_buy_two_yogurt_deal", "dairysalesign", "Check the Buy 2 Get 1 Free yogurt deal", "Xem ưu đãi Mua 2 Tặng 1 sữa chua",
    "If we buy two packs of Greek yogurt, we get the third pack completely free!",
    "Nếu mình mua hai lốc sữa chua Hy Lạp thì sẽ được tặng miễn phí lốc thứ ba!",
    ["buy two", "free", "yogurt"], ["buyone", "yogurt", "promotion"],
    "<b>Buy two, get one free</b> = Mua 2 tặng 1; <b>completely free</b> = hoàn toàn miễn phí.",
    ["If we buy two packs of Greek yogurt,", "we get the third pack completely free!"], ["free", "three", "tree"],
    ["Mix and match any flavors for the <b>yogurt promotion</b>.", "That's a fantastic deal!"],
    once("mkd_bogo", "yes", "Bạn đã xem ưu đãi Mua 2 Tặng 1 sữa chua rồi."),
    at("mkd_sign", "point", 800, [["mkd_bogo", "yes"]]),
    ["check the Buy 2 Get 1 Free yogurt deal", "read the yogurt promotion on the banner", "xem ưu đãi Mua 2 Tặng 1 sữa chua"]),

  mkA("ask_dairy_clerk_lactose_free", "dairyclerk", "Ask the clerk for lactose-free milk", "Hỏi nhân viên về sữa không đường lactose",
    "Excuse me, do you carry lactose-free milk or almond yogurt in this cooler?",
    "Xin lỗi, trong tủ mát này có bán sữa không chứa đường lactose hay sữa chua hạnh nhân không ạ?",
    ["lactose-free", "cooler"], ["lactosefree", "milk", "doyouhave"],
    "<b>Do you carry …?</b> = Cửa hàng mình có bán mặt hàng … không? <b>lactose-free</b> = tách đường lactose (dễ tiêu hóa).",
    ["Excuse me, do you carry lactose-free milk", "or almond yogurt in this cooler?"], ["carry", "marry", "hurry"],
    ["<b>Lactose-free</b> milk is gentle on your stomach.", "It's on the top shelf in the green fridge."],
    once("mkd_clerk", "yes", "Bạn đã hỏi nhân viên về sữa không chứa lactose rồi."),
    at("mkd_clerk", "point", 800, [["mkd_clerk", "yes"]]),
    ["ask the clerk for lactose-free milk", "ask the dairy clerk where lactose-free milk is", "hỏi nhân viên về sữa không đường lactose"]),

  mkA("check_cooler_temperature", "thermometerpanel", "Check the digital cooler thermometer", "Kiểm tra nhiệt độ tủ mát & tủ đông",
    "The digital gauge shows two degrees Celsius for the dairy fridge and minus eighteen for the freezer.",
    "Đồng hồ điện tử hiển thị hai độ C cho tủ mát sữa và âm mười tám độ cho tủ đông.",
    ["two degrees Celsius", "freezer"], ["fridge", "freezer", "fresh"],
    "<b>degrees Celsius (°C)</b> = độ C; <b>minus eighteen (-18°C)</b> = âm 18 độ (nhiệt độ chuẩn của tủ đông).",
    ["The digital gauge shows two degrees Celsius", "for the dairy fridge and minus eighteen for the freezer."], ["gauge", "page", "stage"],
    ["Keeping milk at <b>2°C</b> ensures it stays <b>fresh</b>.", "The freezer is at <b>-18°C</b>."],
    once("mkd_temp", "yes", "Bạn đã kiểm tra đồng hồ nhiệt độ tủ mát rồi."),
    at("mkd_temp", "read", 700, [["mkd_temp", "yes"]]),
    ["check the digital cooler thermometer", "read the temperature on the cooler gauge", "kiểm tra nhiệt độ tủ mát"]),

  mkA("take_insulated_freezer_bag", "coolerbagrack", "Take an insulated cooler bag", "Lấy túi giữ nhiệt đựng kem & đồ đông lạnh",
    "I'm taking a silver insulated cooler bag so our ice cream and dumplings stay frozen on the way home.",
    "Mình lấy một chiếc túi giữ nhiệt tráng bạc để kem và bánh xếp vẫn đông cứng trên đường về nhà.",
    ["insulated bag", "stay frozen"], ["insulated", "frozen", "icecream"],
    "<b>stay + tính từ</b> = giữ nguyên trạng thái (stay frozen = không bị tan chảy).",
    ["I'm taking a silver insulated cooler bag", "so our ice cream and dumplings stay frozen on the way home."], ["stay", "say", "day"],
    ["Zip the <b>insulated bag</b> shut to trap the cold air.", "It's reusable and very handy."],
    once("mkd_coolerbag", "yes", "Bạn đã lấy túi giữ nhiệt trên giá rồi."),
    at("mkd_coolerbag", "reach", 800, [["mkd_coolerbag", "yes"]]),
    ["take an insulated cooler bag", "grab an insulated bag from the rack", "lấy túi giữ nhiệt"]),

  mkA("grab_probiotic_yogurt_drink", "probioticstand", "Grab probiotic yogurt drinks", "Lấy lốc sữa chua uống men sống",
    "These little bottles of chilled probiotic yogurt drink are great for digestion.",
    "Những chai sữa chua uống men sống ướp lạnh nhỏ xinh này rất tốt cho hệ tiêu hóa.",
    ["probiotic drink", "chilled"], ["probiotic", "chilled", "healthy"],
    "<b>probiotic drink</b> = thức uống lợi khuẩn / sữa chua uống men sống; <b>digestion</b> = tiêu hóa.",
    ["These little bottles of chilled probiotic yogurt drink", "are great for digestion."], ["drink", "think", "blink"],
    ["Have one <b>probiotic drink</b> after breakfast.", "Keep them <b>chilled</b> in the fridge."],
    once("mkd_probiotic", "yes", "Bạn đã lấy lốc sữa chua uống men sống rồi."),
    at("mkd_probiotic", "reach", 800, [["mkd_probiotic", "yes"]]),
    ["grab probiotic yogurt drinks", "pick a pack of probiotic yogurt drinks", "lấy lốc sữa chua uống men sống"]),

  mkA("grab_bag_of_ice_cubes", "icecubefreezer", "Grab a bag of pure ice cubes", "Lấy túi đá viên tinh khiết",
    "Let's grab a two-kilo bag of crystal-clear ice cubes for our cold drinks tonight.",
    "Hãy lấy một túi đá viên tinh khiết hai ký để pha đồ uống mát lạnh tối nay nhé.",
    ["ice cubes", "cold drinks"], ["icecubes", "frozen"],
    "<b>a bag of ice cubes</b> = một túi đá viên; <b>crystal-clear</b> = trong vắt như pha lê.",
    ["Let's grab a two-kilo bag of crystal-clear ice cubes", "for our cold drinks tonight."], ["cubes", "tubes", "cute"],
    ["Put the <b>ice cubes</b> in the cooler box.", "They're great for iced tea and lemonade."],
    once("mkd_icecubes", "yes", "Bạn đã lấy túi đá viên tinh khiết rồi."),
    at("mkd_icecubes", "bend", 800, [["mkd_icecubes", "yes"]]),
    ["grab a bag of pure ice cubes", "pick a two-kilo bag of ice cubes", "lấy túi đá viên tinh khiết"]),

  mkA("pick_caramel_pudding_cups", "dairyendcap", "Pick caramel custard pudding cups", "Chọn cốc bánh flan pudding caramel",
    "These chilled caramel custard pudding cups are silky smooth and delicious for dessert!",
    "Mấy cốc bánh pudding trứng caramel ướp lạnh này mềm mịn như lụa và làm món tráng miệng ngon tuyệt!",
    ["caramel pudding", "dessert"], ["pudding", "dessert", "chilled"],
    "<b>silky smooth</b> = mềm mịn như lụa; <b>custard pudding / flan</b> = bánh flan trứng sữa caramel.",
    ["These chilled caramel custard pudding cups", "are silky smooth and delicious for dessert!"], ["pudding", "putting", "pulling"],
    ["Top the <b>caramel pudding</b> with whipped cream.", "Everyone loves a sweet <b>dessert</b>!"],
    once("mkd_pudding", "yes", "Bạn đã lấy cốc bánh pudding caramel rồi."),
    at("mkd_endcap", "reach", 800, [["mkd_pudding", "yes"]]),
    ["pick caramel custard pudding cups", "grab a pack of caramel pudding cups", "chọn cốc bánh pudding caramel"])
];

const dairyActions = [
  ...S.allActions.filter(a => S.DAIRY_OBJS.has(a.obj)),
  ...dairyNewActions
];

const market_dairy = {
  id: "market_dairy", topic: "market", icon: "🥛", zoneOrder: 3,
  name: "Dairy, Frozen & Drinks", nameVi: "Sữa, đông lạnh & đồ uống", names: ["Dairy, Frozen & Drinks", "Sữa, đông lạnh & đồ uống"],
  go: {
    label: "Head to dairy, frozen & drinks",
    labelVi: "Qua khu sữa, đông lạnh & đồ uống",
    sentence: "I'm heading to the dairy and frozen aisle for milk and cold drinks.",
    vi: "Tôi đang đi sang dãy tủ sữa và đồ đông lạnh để lấy sữa và đồ uống mát.",
    key: ["heading", "dairy", "frozen"],
    chunks: ["I'm heading to the dairy and frozen aisle", "for milk and cold drinks."],
    grammar: "<b>the dairy and frozen aisle</b> = dãy kệ tủ mát sữa và đồ đông lạnh.",
    patterns: ["I'm heading to <b>the dairy section</b>.", "I'm heading to <b>the drinks cooler</b>."],
    vocab: [["dairy", "/ˈder.ri/", "sản phẩm từ sữa"], ["frozen", "/ˈfroʊ.zən/", "đông lạnh"]],
    story: ["head to the dairy and frozen section", "walk to the chilled dairy and drinks aisle", "đi sang khu sữa, đông lạnh & đồ uống"]
  },
  shellSvg: dairyShell,
  worldSvg: dairyWorld,
  W0: MK_W0,
  spots: {
    mkd_door: { x: 112, y: 470, d: -1 },
    mk_dairy: { x: 234, y: 368, d: 1 },
    mkd_yogurt: { x: 362, y: 368, d: 1 },
    mkd_cheese: { x: 486, y: 368, d: 1 },
    mkd_plantmilk: { x: 609, y: 368, d: 1 },
    mkd_juicebar: { x: 729, y: 368, d: 1 },
    mk_drinks: { x: 841, y: 368, d: 1 },
    mkd_coffee: { x: 938, y: 368, d: 1 },
    mkd_sign: { x: 560, y: 368, d: 1 },
    mkd_temp: { x: 146, y: 366, d: -1 },
    mk_eggs: { x: 118, y: 382, d: -1 },
    mkd_probiotic: { x: 118, y: 432, d: -1 },
    mkd_coolerbag: { x: 118, y: 540, d: -1 },
    mk_freezer: { x: 214, y: 504, d: 1 },
    mkd_icecream: { x: 380, y: 504, d: 1 },
    mkd_pizza: { x: 544, y: 504, d: 1 },
    mkd_vegcase: { x: 700, y: 504, d: 1 },
    mkd_clerk: { x: 836, y: 500, d: 1 },
    mkd_endcap: { x: 930, y: 504, d: 1 },
    mkd_icecubes: { x: 213, y: 620, d: 1 },
    mkd_soda: { x: 426, y: 620, d: 1 },
    mkd_mineral: { x: 658, y: 620, d: 1 }
  },
  obstacles: [],
  entry: { x: 150, y: 508, d: 1 },
  objects: dairyObjects,
  actions: dairyActions,
  props: S.MK_PROPS,
  applyState(W, root) { mirrorState(W, MK_W0, root); },
  css: S.marketCss,
  catalog: cat("mkd_", [
    ["unsalted butter", "/ʌnˈsɔːl.tɪd ˈbʌt.ər/", "bơ lạt", "food"],
    ["mozzarella cheese", "/ˌmɑt.səˈrel.ə tʃiːz/", "phô mai mozzarella", "food"],
    ["oat milk", "/oʊt mɪlk/", "sữa yến mạch", "drink"],
    ["tub of ice cream", "/tʌb əv ˌaɪs ˈkriːm/", "hộp kem lớn", "food"],
    ["frozen pizza", "/ˈfroʊ.zən ˈpiːt.sə/", "pizza đông lạnh", "food"],
    ["French fries", "/frentʃ fraɪz/", "khoai tây chiên cọng", "food"],
    ["frozen sweet corn", "/ˈfroʊ.zən swiːt kɔːn/", "bắp ngọt đông lạnh", "food"],
    ["sparkling soda", "/ˈspɑː.klɪŋ ˈsoʊ.də/", "nước ngọt có ga", "drink"],
    ["mineral water", "/ˈmɪn.ər.əl ˈwɔː.tər/", "nước khoáng thiên nhiên", "drink"],
    ["cold-pressed juice", "/koʊld prest dʒuːs/", "nước ép lạnh", "drink"],
    ["bottled iced latte", "/ˈbɑt.əld aɪst ˈlæt.eɪ/", "cà phê sữa đá đóng chai", "drink"],
    ["peach iced tea", "/piːtʃ aɪst tiː/", "trà đào ướp lạnh", "drink"],
    ["probiotic drink", "/ˌproʊ.baɪˈɑt.ɪk drɪŋk/", "sữa chua uống men sống", "drink"],
    ["ice cubes", "/aɪs kjuːbz/", "đá viên tinh khiết", "other"],
    ["caramel pudding", "/ˈkær.ə.mel ˈpʊd.ɪŋ/", "bánh pudding caramel", "food"]
  ])
};

const DAIRY_REPLIES = {
  /* Existing 18 actions in market_dairy */
  ask_where_milk: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Fresh milk is right here in the blue glass-door cooler on the left!", vi: "Sữa tươi ở ngay trong tủ mát cửa kính màu xanh bên trái này ạ!" },
  find_the_milk: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "We just restocked those milk bottles an hour ago—super cold and fresh!", vi: "Tụi mình vừa xếp thêm mẻ sữa chai đó một tiếng trước — lạnh và tươi lắm!" },
  check_the_date: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Every bottle on the front row is good for at least ten more days.", vi: "Mỗi chai ở hàng ngoài cùng đều còn hạn ít nhất mười ngày nữa ạ." },
  pick_greek_yogurt: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Plain Greek yogurt is packed with protein—and it's Buy 2 Get 1 Free today!", vi: "Sữa chua Hy Lạp nguyên vị giàu đạm lắm — mà hôm nay còn Mua 2 Tặng 1 nữa!" },
  choose_cheddar_cheese: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "That aged sharp cheddar has been matured for twelve months.", vi: "Khối phô mai cheddar đậm vị đó được ủ suốt mười hai tháng đấy ạ." },
  get_some_eggs: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Our farm eggs arrive every morning in padded cartons.", vi: "Trứng nông trại của tụi mình về mỗi sáng trong vỉ giấy êm." },
  check_eggs: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Always smart to open the carton and check for cracks!", vi: "Mở vỉ trứng ra kiểm tra xem có vết nứt không là chuẩn nhất đấy!" },
  choose_free_range_eggs: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Those free-range brown eggs have rich, golden yolks.", vi: "Trứng gà thả vườn vỏ nâu đó có lòng đỏ vàng ươm béo ngậy." },
  check_egg_carton_date: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "They were packed yesterday at the farm—as fresh as it gets!", vi: "Lô trứng này mới đóng gói hôm qua tại nông trại — tươi nhất có thể luôn!" },
  get_frozen_dumplings: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "You can steam or pan-fry those pork and chive dumplings in eight minutes.", vi: "Bánh xếp nhân thịt hẹ đó bạn đem hấp hay áp chảo tám phút là chín." },
  get_ice_cream: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Don't forget to grab an insulated bag on the left wall so your ice cream won't melt!", vi: "Bạn nhớ lấy thêm túi giữ nhiệt ở tường bên trái để kem không bị chảy nhé!" },
  pick_frozen_berries: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Those frozen wild blueberries make the thickest morning smoothies.", vi: "Việt quất rừng đông lạnh đó đem xay sinh tố buổi sáng là sánh mịn tuyệt vời." },
  check_freezer_door_closed: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Thanks for sliding the freezer lid shut—it keeps everything at minus eighteen degrees!", vi: "Cảm ơn bạn đã kéo kín nắp tủ đông — làm vậy giúp giữ nhiệt độ âm 18 độ chuẩn!" },
  get_a_pack_of_water: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "The six-packs of water are shrink-wrapped with a carry handle on top.", vi: "Lốc 6 chai nước có màng bọc kèm quai xách ngay phía trên rất tiện." },
  get_some_juice: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "100% pure pressed apple juice—zero added sugar or preservatives!", vi: "Nước táo ép nguyên chất 100% — không thêm đường hay chất bảo quản!" },
  ask_more_in_back: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "I just checked my stock tablet—we have two more cold cases in the walk-in cooler!", vi: "Mình vừa tra trên máy tính bảng kiểm kho — trong kho lạnh còn hai thùng nữa nhé!" },
  pick_herbal_tea_boxes: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Chamomile and lavender tea is caffeine-free and wonderful before bedtime.", vi: "Trà hoa cúc và oải hương không có caffeine, uống trước khi ngủ êm dịu lắm." },
  grab_coconut_water: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "That Ben Tre coconut water is naturally sweet and full of electrolytes.", vi: "Nước dừa Bến Tre đó ngọt thanh tự nhiên và giàu chất điện giải lắm." },
  /* 12 more replies for new actions = 30 total NPC replies in market_dairy */
  pick_strawberry_yogurt_pack: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Those strawberry yogurts are made with real fruit puree and live cultures.", vi: "Sữa chua dâu đó làm từ dâu tây nghiền thật và men vi sinh sống đấy ạ." },
  open_the_fridge_door: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "All our oat, soy, and almond milks are in that green cooler!", vi: "Tất cả sữa yến mạch, sữa đậu nành và hạnh nhân đều ở trong tủ màu xanh lá đó!" },
  take_a_carton_of_milk: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Barista-grade oat milk foams up just like dairy milk in coffee!", vi: "Sữa yến mạch dòng pha chế đó tạo bọt mịn y như sữa tươi khi pha cà phê!" },
  pick_a_tub_of_ice_cream: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Madagascar vanilla bean is our number-one bestseller every weekend!", vi: "Vị kem hạt va-ni Madagascar là món bán chạy số một mỗi dịp cuối tuần đấy!" },
  grab_frozen_cheese_pizza: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Bake it directly on the middle oven rack at 200 degrees for a crispy crust!", vi: "Bạn nướng trực tiếp trên rãnh giữa lò ở 200 độ để đế bánh giòn rụm nhé!" },
  grab_sparkling_lemon_soda: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "We also have chilled cans of lemon-lime soda if you want to drink one right away.", vi: "Tụi mình cũng có sẵn lon nước chanh có ga ướp lạnh nếu bạn muốn uống ngay." },
  grab_orange_juice: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "That orange juice was cold-pressed this morning—give it a shake before pouring!", vi: "Chai nước cam đó vừa ép lạnh sáng nay — bạn lắc đều trước khi rót nhé!" },
  grab_chilled_iced_latte: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Those bottled iced lattes are brewed with dark-roast Arabica beans.", vi: "Mấy chai cà phê sữa đá đó được pha từ hạt Arabica rang đậm." },
  read_dairy_sale_sign: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Yes! Twenty percent off applies automatically at the checkout counter.", vi: "Vâng! Mức giảm 20% sẽ được trừ tự động khi bạn ra quầy thanh toán ạ." },
  ask_dairy_clerk_lactose_free: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Sure! Lactose-free cow's milk is in the blue cooler, and oat milk is right next door.", vi: "Có chứ ạ! Sữa bò tách đường lactose ở tủ xanh dương, còn sữa yến mạch ở ngay tủ kế bên." },
  take_insulated_freezer_bag: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Those insulated bags keep frozen food cold for up to three hours.", vi: "Mấy chiếc túi giữ nhiệt đó giữ lạnh đồ đông đá được tới ba tiếng đồng hồ." },
  pick_caramel_pudding_cups: { who: "Dairy & Drinks Clerk", avatar: "🧑‍🔧", voice: "young_male", anchor: "obj:dairyclerk",
    en: "Flip the pudding cup onto a small plate so the caramel sauce flows over the top!", vi: "Bạn úp ngược cốc bánh pudding ra đĩa nhỏ để sốt caramel chảy phủ đều lên trên nhé!" }
};

/* =====================================================================
   ZONE 4: market_meat — Thịt cá & gia dụng (Meat, Fish & Household)
   21 Objects · 42 Actions · 30 NPC Replies (72 Sentences)
   ===================================================================== */
const meatShell = `
${sharedDefs}
<rect x="108" y="0" width="892" height="336" fill="url(#mkzWall)"/>
<polygon points="0,0 108,0 108,336 0,640" fill="url(#mkzLeftWall)"/>
<polygon points="108,336 1000,336 1000,640 0,640" fill="url(#mkzFloor)"/>
${D("floor-tiles", floorGrid)}
<rect x="0" y="0" width="1000" height="38" fill="url(#mkzSoffit)"/>
<rect x="108" y="38" width="520" height="10" fill="#c0392b"/>
<rect x="628" y="38" width="372" height="10" fill="#2980b9"/>
<text x="368" y="25" font-size="13.5" font-weight="900" fill="#fadbd8" text-anchor="middle" letter-spacing="2.5">🥩 BUTCHER, SEAFOOD &amp; DRY PANTRY</text>
<text x="814" y="25" font-size="13.5" font-weight="900" fill="#d6eaf8" text-anchor="middle" letter-spacing="2.5">🧴 HOUSEHOLD &amp; PERSONAL CARE</text>
${D("pendant-lights", pendantLamp(210, 62) + pendantLamp(440, 62) + pendantLamp(670, 62) + pendantLamp(895, 62))}
`;

const meatWorld = [
  /* 1. meatsalesign — hanging ceiling deal banner above butcher & pantry */
  objG("meatsalesign", "meat & pantry discount sign", "biển giảm giá thịt cá & đồ khô", 180, 540, 48, `
    <rect class="hit" x="458" y="44" width="168" height="38"/>
    <line x1="486" y1="38" x2="486" y2="48" stroke="#1b3b2c" stroke-width="2"/>
    <line x1="598" y1="38" x2="598" y2="48" stroke="#1b3b2c" stroke-width="2"/>
    <rect x="462" y="48" width="160" height="30" rx="6" fill="#c0392b" stroke="#f5d34a" stroke-width="2"/>
    <text x="542" y="61" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">FRESH CUTS · DAILY CATCH</text>
    <text x="542" y="72" font-size="7.5" font-weight="900" fill="#f5d34a" text-anchor="middle">RICE &amp; PANTRY COMBO -15%</text>
  `),
  /* 2. butcherblock — knives rack & wooden cutting board behind the counter */
  objG("butcherblock", "knives & cutting board", "dao & thớt gỗ sau quầy", 320, 210, 108, `
    <rect class="hit" x="128" y="104" width="168" height="108"/>
    <rect x="132" y="108" width="160" height="100" rx="4" fill="#f5ebe0" stroke="#a87048" stroke-width="2"/>
    <!-- Magnetic knife bar with cleaver & chef knives -->
    <rect x="144" y="118" width="136" height="8" rx="2" fill="#3a3f46"/>
    <g fill="#bdc3c7" stroke="#2c3e50" stroke-width="1.2">
      <rect x="156" y="126" width="16" height="24" rx="1"/><rect x="160" y="112" width="6" height="14" fill="#5a3d1f"/>
      <path d="M190 126 h8 l-4 28z"/><rect x="191" y="112" width="6" height="14" fill="#5a3d1f"/>
      <path d="M216 126 h10 l-3 26 h-7z"/><rect x="218" y="112" width="6" height="14" fill="#5a3d1f"/>
      <rect x="246" y="126" width="18" height="22" rx="1"/><rect x="252" y="112" width="6" height="14" fill="#5a3d1f"/>
    </g>
    <!-- Thick wooden butcher cutting board & fresh beef cut -->
    <rect x="152" y="166" width="120" height="30" rx="4" fill="#d99b52" stroke="#8a5a19" stroke-width="2"/>
    <ellipse cx="212" cy="180" rx="24" ry="8" fill="#c0392b" stroke="#fadbd8" stroke-width="1.5"/>
  `),
  /* 3. meatcounter — main butcher counter with Butcher / Fishmonger (existing object with 7 actions) */
  objG("meatcounter", "meat & fish counter", "quầy thịt cá", 356, 224, 212, `
    <rect class="hit" x="122" y="212" width="204" height="148"/>
    <ellipse cx="224" cy="356" rx="98" ry="8" fill="#000" opacity=".15"/>
    <!-- Butcher / Fishmonger in white apron & cap behind the counter -->
    <g>
      <circle cx="224" cy="226" r="14" fill="#e0ac84"/>
      <rect x="210" y="206" width="28" height="10" rx="3" fill="#fff" stroke="#9aa6af" stroke-width="1.5"/>
      <circle cx="219" cy="227" r="1.6" fill="#2d2a26"/><circle cx="229" cy="227" r="1.6" fill="#2d2a26"/>
      <path d="M219 233 Q224 237 229 233" stroke="#8a2f3c" stroke-width="1.6" fill="none"/>
      <rect x="204" y="240" width="40" height="44" rx="8" fill="#c0392b"/>
      <rect x="210" y="244" width="28" height="40" rx="3" fill="#fff"/>
    </g>
    <!-- Slanted glass display case -->
    <polygon points="128,298 320,298 310,262 138,262" fill="url(#mkzGlass)" stroke="#7f93a3" stroke-width="2"/>
    <g class="mk-porkP" fill="#e8a2a0" stroke="#c0392b"><ellipse cx="160" cy="284" rx="16" ry="7"/><ellipse cx="192" cy="284" rx="16" ry="7" fill="#d9706e"/></g>
    <g class="mk-fishP"><path d="M220 284 q16 -10 32 0 q-16 10 -32 0z M252 284 l8 -6 v12z" fill="#f2a07a" stroke="#c97a58"/></g>
    <g class="mk-chickP"><ellipse cx="284" cy="284" rx="15" ry="7" fill="#f5dcc0" stroke="#d9b48a"/></g>
    <rect x="126" y="298" width="196" height="54" rx="4" fill="#f7f9f9" stroke="#7f93a3" stroke-width="2"/>
    <rect x="126" y="310" width="196" height="18" fill="#c0392b"/>
    <text x="224" y="323" font-size="10" font-weight="900" fill="#fff" text-anchor="middle">PRIME MEAT &amp; POULTRY</text>
  `),
  /* 4. butcherscale — digital scale on the butcher counter */
  objG("butcherscale", "butcher's digital scale", "cân điện tử quầy thịt", 354, 368, 224, `
    <rect class="hit" x="330" y="220" width="76" height="132"/>
    <rect x="334" y="296" width="68" height="52" rx="3" fill="#dfe6e9" stroke="#7f93a3" stroke-width="2"/>
    <ellipse cx="368" cy="280" rx="26" ry="8" fill="#bdc3c7" stroke="#596a78" stroke-width="2"/>
    <rect x="364" y="246" width="8" height="34" fill="#596a78"/>
    <rect x="344" y="224" width="48" height="24" rx="4" fill="#2c3e50" stroke="#1a252f" stroke-width="1.5"/>
    <rect x="348" y="228" width="40" height="14" fill="#0b231e"/>
    <text x="368" y="238" font-size="8.5" font-weight="900" fill="#4cd137" text-anchor="middle">0.50 kg</text>
    <text x="368" y="324" font-size="8" font-weight="900" fill="#2c3e50" text-anchor="middle">SCALE</text>
  `),
  /* 5. wrappingstation — butcher wrapping paper dispenser & twine */
  objG("wrappingstation", "butcher wrapping paper", "cuộn giấy gói thịt", 354, 448, 228, `
    <rect class="hit" x="410" y="224" width="76" height="128"/>
    <rect x="414" y="296" width="68" height="52" rx="3" fill="#dfe6e9" stroke="#7f93a3" stroke-width="2"/>
    <!-- Kraft paper roll on metal frame + wrapped parcel -->
    <rect x="422" y="246" width="52" height="22" rx="4" fill="#e5c298" stroke="#8a5a19" stroke-width="1.8"/>
    <line x1="418" y1="257" x2="478" y2="257" stroke="#3a3f46" stroke-width="3"/>
    <rect x="426" y="274" width="44" height="18" rx="3" fill="#f3e1c7" stroke="#a87048" stroke-width="1.5"/>
    <line x1="426" y1="283" x2="470" y2="283" stroke="#c0392b" stroke-width="1.5"/>
    <line x1="448" y1="274" x2="448" y2="292" stroke="#c0392b" stroke-width="1.5"/>
    <text x="448" y="324" font-size="7.5" font-weight="900" fill="#5a3d1f" text-anchor="middle">WRAP PAPER</text>
  `),
  /* 6. seafoodicecase — fresh salmon fillets & tiger shrimp on crushed ice */
  objG("seafoodicecase", "fresh seafood on ice", "quầy hải sản ướp đá", 356, 562, 214, `
    <rect class="hit" x="490" y="212" width="144" height="146"/>
    <ellipse cx="562" cy="356" rx="70" ry="8" fill="#000" opacity=".15"/>
    <polygon points="496,298 628,298 620,256 504,256" fill="#dff6ff" stroke="#2980b9" stroke-width="2"/>
    <!-- Crushed ice crystals -->
    <g fill="#fff" opacity=".85"><circle cx="516" cy="286" r="4"/><circle cx="532" cy="288" r="4"/><circle cx="552" cy="286" r="4"/><circle cx="576" cy="288" r="4"/><circle cx="598" cy="286" r="4"/><circle cx="612" cy="288" r="4"/></g>
    <!-- Orange salmon fillets with white striping & pink tiger shrimp -->
    <g fill="#ff7675" stroke="#d63031" stroke-width="1.2">
      <rect x="512" y="268" width="38" height="16" rx="4"/><line x1="522" y1="268" x2="518" y2="284" stroke="#fff"/><line x1="534" y1="268" x2="530" y2="284" stroke="#fff"/>
    </g>
    <g stroke="#e17055" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M566 278 q8 -10 16 0"/><path d="M588 278 q8 -10 16 0"/><path d="M576 286 q8 -10 16 0"/>
    </g>
    <rect x="494" y="298" width="136" height="54" rx="4" fill="#f7f9f9" stroke="#7f93a3" stroke-width="2"/>
    <rect x="494" y="310" width="136" height="18" fill="#2980b9"/>
    <text x="562" y="323" font-size="9.5" font-weight="900" fill="#fff" text-anchor="middle">🐟 SEAFOOD ON ICE</text>
  `),
  /* 7. noodleshelf — back-wall pasta, spaghetti & egg noodle shelf */
  objG("noodleshelf", "pasta & noodle shelf", "kệ mì sợi & nui", 342, 700, 102, `
    <rect class="hit" x="642" y="100" width="114" height="236"/>
    <rect x="646" y="104" width="106" height="228" rx="5" fill="#fdfefe" stroke="#7f93a3" stroke-width="2"/>
    <rect x="646" y="104" width="106" height="22" rx="4" fill="#d35400"/>
    <text x="699" y="119" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">NOODLES &amp; PASTA</text>
    <g fill="#7f93a3"><rect x="650" y="178" width="98" height="4"/><rect x="650" y="226" width="98" height="4"/><rect x="650" y="274" width="98" height="4"/></g>
    <g fill="#f1c40f" stroke="#b7950b"><rect x="656" y="144" width="24" height="32" rx="2"/><rect x="686" y="144" width="24" height="32" rx="2"/><rect x="716" y="144" width="24" height="32" rx="2"/></g>
    <g fill="#2980b9" stroke="#1b4f72"><rect x="656" y="196" width="40" height="26" rx="2"/><rect x="702" y="196" width="40" height="26" rx="2"/></g>
    <text x="676" y="212" font-size="6.5" font-weight="900" fill="#fff" text-anchor="middle">SPAGHETTI</text>
    <g fill="#e67e22"><rect x="656" y="242" width="40" height="30" rx="3"/><rect x="702" y="242" width="40" height="30" rx="3"/></g>
  `),
  /* 8. cookingoilrack — back-wall extra-virgin olive oil & sunflower cooking oil shelf */
  objG("cookingoilrack", "cooking oil shelf", "kệ dầu ăn", 342, 818, 102, `
    <rect class="hit" x="760" y="100" width="114" height="236"/>
    <rect x="764" y="104" width="106" height="228" rx="5" fill="#fdfefe" stroke="#7f93a3" stroke-width="2"/>
    <rect x="764" y="104" width="106" height="22" rx="4" fill="#b7950b"/>
    <text x="817" y="119" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">COOKING OIL</text>
    <g fill="#7f93a3"><rect x="768" y="178" width="98" height="4"/><rect x="768" y="226" width="98" height="4"/><rect x="768" y="274" width="98" height="4"/></g>
    <!-- Dark green olive oil bottles & golden sunflower oil jugs -->
    <g fill="#1e8449" stroke="#145a32"><rect x="776" y="142" width="16" height="34" rx="3"/><rect x="798" y="142" width="16" height="34" rx="3"/><rect x="820" y="142" width="16" height="34" rx="3"/><rect x="842" y="142" width="16" height="34" rx="3"/></g>
    <g fill="#f4d03f" stroke="#b7950b"><rect x="774" y="190" width="26" height="34" rx="4"/><rect x="806" y="190" width="26" height="34" rx="4"/><rect x="836" y="190" width="26" height="34" rx="4"/></g>
    <g fill="#f5b041"><rect x="774" y="240" width="40" height="32" rx="4"/><rect x="820" y="240" width="40" height="32" rx="4"/></g>
  `),
  /* 9. spicerack — back-wall colorful jars of spices, black pepper & seasoning */
  objG("spicerack", "spices & seasoning rack", "kệ gia vị & nước chấm", 342, 934, 102, `
    <rect class="hit" x="878" y="100" width="114" height="236"/>
    <rect x="882" y="104" width="106" height="228" rx="5" fill="url(#mkzWood)" stroke="#6e411b" stroke-width="2"/>
    <rect x="882" y="104" width="106" height="22" rx="4" fill="#9c241b"/>
    <text x="935" y="119" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">SPICES &amp; HERBS</text>
    <g fill="#6e411b"><rect x="886" y="178" width="98" height="4"/><rect x="886" y="226" width="98" height="4"/><rect x="886" y="274" width="98" height="4"/></g>
    <!-- Pepper grinders & herb jars -->
    <g><rect x="892" y="150" width="14" height="26" rx="2" fill="#2c3e50"/><rect x="910" y="150" width="14" height="26" rx="2" fill="#c0392b"/><rect x="928" y="150" width="14" height="26" rx="2" fill="#27ae60"/><rect x="946" y="150" width="14" height="26" rx="2" fill="#f39c12"/><rect x="964" y="150" width="14" height="26" rx="2" fill="#8e44ad"/></g>
    <g><rect x="894" y="198" width="18" height="26" rx="2" fill="#e67e22"/><rect x="918" y="198" width="18" height="26" rx="2" fill="#16a085"/><rect x="942" y="198" width="18" height="26" rx="2" fill="#c0392b"/><rect x="964" y="198" width="14" height="26" rx="2" fill="#2c3e50"/></g>
    <g fill="#784212"><rect x="894" y="242" width="22" height="30" rx="3"/><rect x="924" y="242" width="22" height="30" rx="3"/><rect x="954" y="242" width="22" height="30" rx="3"/></g>
  `),
  /* 10. personalcare — left-wall personal care shelf (existing object with 4 actions) */
  objG("personalcare", "personal care shelf", "kệ đồ dùng cá nhân", 340, 60, 148, `
    <rect class="hit" x="12" y="144" width="96" height="146"/>
    <polygon points="16,286 104,230 104,148 16,200" fill="#fdfefe" stroke="#7f93a3" stroke-width="2"/>
    <rect x="22" y="154" width="76" height="16" rx="3" fill="#8e44ad"/>
    <text x="60" y="165" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">PERSONAL CARE</text>
    <g class="mk-shamp"><rect x="26" y="192" width="14" height="26" rx="3" fill="#e84393"/></g>
    <rect x="44" y="186" width="14" height="26" rx="3" fill="#f39c12"/>
    <g class="mk-paste"><rect x="62" y="180" width="28" height="12" rx="2" fill="#2e86de"/></g>
    <rect x="28" y="230" width="16" height="24" rx="3" fill="#55efc4"/><rect x="50" y="222" width="16" height="24" rx="3" fill="#fdcb6e"/>
  `),
  /* 11. oralcarestand — toothbrush & mouthwash stand on left wall */
  objG("oralcarestand", "toothbrush & mouthwash rack", "kệ bàn chải đánh răng & nước súc miệng", 442, 60, 304, `
    <rect class="hit" x="12" y="300" width="96" height="130"/>
    <polygon points="16,426 104,370 104,304 16,356" fill="#ebf5fb" stroke="#2e86de" stroke-width="2"/>
    <rect x="22" y="310" width="76" height="16" rx="3" fill="#2e86de"/>
    <text x="60" y="321" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">ORAL CARE</text>
    <g fill="#00cec9" stroke="#0984e3"><rect x="28" y="344" width="10" height="28" rx="2"/><rect x="44" y="338" width="10" height="28" rx="2"/><rect x="60" y="332" width="18" height="26" rx="3"/><rect x="82" y="326" width="14" height="26" rx="3"/></g>
  `),
  /* 12. bodywashrack — body wash & moisturizing lotion shelf on lower left wall */
  objG("bodywashrack", "body wash & lotion shelf", "kệ sữa tắm & dưỡng thể", 554, 60, 444, `
    <rect class="hit" x="12" y="440" width="96" height="132"/>
    <polygon points="16,568 104,512 104,444 16,496" fill="#fef9e7" stroke="#d4ac0d" stroke-width="2"/>
    <rect x="22" y="450" width="76" height="16" rx="3" fill="#16a085"/>
    <text x="60" y="461" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">BODY WASH</text>
    <g fill="#a29bfe" stroke="#6c5ce7"><rect x="28" y="484" width="16" height="28" rx="4"/><rect x="50" y="476" width="16" height="28" rx="4"/><rect x="72" y="468" width="16" height="28" rx="4"/></g>
  `),
  /* 13. marinatedcase — chilled marinated beef & BBQ tray island */
  objG("marinatedcase", "marinated meat tray case", "tủ thịt tẩm ướp sẵn", 482, 220, 392, `
    <rect class="hit" x="144" y="388" width="152" height="104"/>
    <ellipse cx="220" cy="490" rx="74" ry="8" fill="#000" opacity=".14"/>
    <polygon points="152,428 288,428 294,454 146,454" fill="url(#mkzGlass)" stroke="#c0392b" stroke-width="2"/>
    <!-- Black butcher trays with red ribeye & marinated beef strips -->
    <g><rect x="160" y="432" width="36" height="18" rx="2" fill="#2d2a26"/><ellipse cx="178" cy="441" rx="13" ry="6" fill="#c0392b"/></g>
    <g><rect x="202" y="432" width="36" height="18" rx="2" fill="#2d2a26"/><ellipse cx="220" cy="441" rx="13" ry="6" fill="#a93226"/></g>
    <g><rect x="244" y="432" width="36" height="18" rx="2" fill="#2d2a26"/><ellipse cx="262" cy="441" rx="13" ry="6" fill="#d35400"/></g>
    <rect x="146" y="454" width="148" height="34" rx="4" fill="#f7f9f9" stroke="#7f93a3" stroke-width="2"/>
    <rect x="146" y="464" width="148" height="14" fill="#c0392b"/>
    <text x="220" y="474" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">🥩 MARINATED BEEF TRAYS</text>
  `),
  /* 14. ricebags — wooden pallet of 5kg jasmine & brown rice bags (existing object with 4 actions) */
  objG("ricebags", "rice shelf", "kệ gạo các loại", 482, 386, 392, `
    <rect class="hit" x="314" y="388" width="144" height="104"/>
    <ellipse cx="386" cy="490" rx="70" ry="8" fill="#000" opacity=".14"/>
    <rect x="318" y="476" width="136" height="10" rx="2" fill="#8a5a19"/>
    <g fill="#f3ead6" stroke="#a87048" stroke-width="1.8">
      <rect x="324" y="438" width="42" height="38" rx="6"/>
      <rect x="370" y="438" width="42" height="38" rx="6" fill="#e5c298"/>
      <rect x="414" y="438" width="36" height="38" rx="6"/>
    </g>
    <g class="mk-riceTop">
      <rect x="346" y="398" width="52" height="40" rx="6" fill="#fff8ec" stroke="#c0392b" stroke-width="2"/>
      <text x="372" y="422" font-size="8.5" font-weight="900" fill="#c0392b" text-anchor="middle">JASMINE 5KG</text>
    </g>
    <text x="345" y="460" font-size="7" font-weight="900" fill="#27ae60" text-anchor="middle">RICE</text>
    <text x="391" y="460" font-size="7" font-weight="900" fill="#6e411b" text-anchor="middle">BROWN</text>
  `),
  /* 15. cannedfoodrack — breakfast cereal & dry pantry stand */
  objG("cannedfoodrack", "cereal & dry pantry shelf", "kệ ngũ cốc & đồ khô", 482, 544, 388, `
    <rect class="hit" x="476" y="384" width="138" height="108"/>
    <ellipse cx="545" cy="490" rx="66" ry="8" fill="#000" opacity=".14"/>
    <rect x="480" y="390" width="130" height="96" rx="5" fill="url(#mkzWood)" stroke="#6e411b" stroke-width="2"/>
    <rect x="480" y="390" width="130" height="18" rx="4" fill="#f39c12"/>
    <text x="545" y="402" font-size="8.5" font-weight="900" fill="#5a3d1f" text-anchor="middle">🥣 CEREAL &amp; PANTRY</text>
    <g fill="#e74c3c" stroke="#9c241b"><rect x="490" y="416" width="24" height="32" rx="2"/><rect x="520" y="416" width="24" height="32" rx="2" fill="#f1c40f"/><rect x="550" y="416" width="24" height="32" rx="2" fill="#2ecc71"/><rect x="578" y="416" width="22" height="32" rx="2" fill="#3498db"/></g>
    <g fill="#bdc3c7" stroke="#596a78"><rect x="494" y="454" width="20" height="24" rx="2"/><rect x="522" y="454" width="20" height="24" rx="2"/><rect x="550" y="454" width="20" height="24" rx="2"/><rect x="578" y="454" width="20" height="24" rx="2"/></g>
  `),
  /* 16. household — household goods shelf (existing object with 5 actions) */
  objG("household", "household goods shelf", "kệ hàng gia dụng", 482, 706, 376, `
    <rect class="hit" x="634" y="372" width="144" height="122"/>
    <ellipse cx="706" cy="492" rx="70" ry="8" fill="#000" opacity=".14"/>
    <rect x="638" y="378" width="136" height="110" rx="5" fill="#fdfefe" stroke="#2980b9" stroke-width="2"/>
    <rect x="638" y="378" width="136" height="18" rx="4" fill="#2980b9"/>
    <text x="706" y="390" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">HOUSEHOLD GOODS</text>
    <g class="mk-det"><rect x="648" y="404" width="22" height="32" rx="4" fill="#2e86de"/></g>
    <rect x="674" y="404" width="22" height="32" rx="4" fill="#5dade2"/>
    <g class="mk-tis"><rect x="702" y="410" width="30" height="24" rx="3" fill="#fd79a8"/></g>
    <rect x="736" y="406" width="26" height="28" rx="3" fill="#f1c40f"/>
    <g fill="#2ecc71"><rect x="650" y="446" width="26" height="32" rx="3"/><rect x="684" y="452" width="32" height="24" rx="3" fill="#ffeaa7"/><rect x="724" y="446" width="38" height="32" rx="3" fill="#85c1e9"/></g>
  `),
  /* 17. householdstaff — Household Aisle Staff in blue apron */
  objG("householdstaff", "household aisle staff", "nhân viên kệ gia dụng", 482, 832, 368, `
    <rect class="hit" x="788" y="364" width="88" height="128"/>
    <ellipse cx="832" cy="488" rx="34" ry="7" fill="#000" opacity=".14"/>
    <g>
      <circle cx="832" cy="390" r="15" fill="#f2c49b"/>
      <path d="M816 386 Q832 366 848 386z" fill="#3d2516"/>
      <circle cx="827" cy="391" r="1.8" fill="#2d2a26"/><circle cx="837" cy="391" r="1.8" fill="#2d2a26"/>
      <path d="M827 398 Q832 402 837 398" stroke="#8a2f3c" stroke-width="1.8" fill="none"/>
      <rect x="812" y="406" width="40" height="52" rx="10" fill="#2980b9"/>
      <rect x="818" y="414" width="28" height="38" rx="4" fill="#ecf0f1"/>
    </g>
  `),
  /* 18. soapbrushrack — antibacterial hand soap & stiff scrub brush rack */
  objG("soapbrushrack", "soap & scrub brush shelf", "kệ xà phòng & bàn chải cọ", 482, 938, 378, `
    <rect class="hit" x="888" y="376" width="102" height="118"/>
    <rect x="892" y="380" width="94" height="108" rx="5" fill="#e8f8f5" stroke="#17a589" stroke-width="2"/>
    <rect x="892" y="380" width="94" height="18" rx="4" fill="#17a589"/>
    <text x="939" y="392" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">SOAP &amp; BRUSHES</text>
    <!-- Pump hand soap bottles & wooden/bristle scrub brushes -->
    <g fill="#55efc4" stroke="#00b894"><rect x="902" y="408" width="18" height="28" rx="3"/><rect x="926" y="408" width="18" height="28" rx="3"/><rect x="950" y="408" width="18" height="28" rx="3"/></g>
    <g><rect x="902" y="448" width="34" height="10" rx="3" fill="#d99b52"/><rect x="904" y="458" width="30" height="8" fill="#2980b9"/><rect x="944" y="448" width="34" height="10" rx="3" fill="#d99b52"/><rect x="946" y="458" width="30" height="8" fill="#e74c3c"/></g>
  `),
  /* 19. papertowelstack — foreground jumbo kitchen paper towel rolls */
  objG("papertowelstack", "paper towel display", "kệ khăn giấy cuộn đa năng", 604, 268, 516, `
    <rect class="hit" x="178" y="514" width="180" height="100"/>
    <ellipse cx="268" cy="610" rx="86" ry="8" fill="#000" opacity=".14"/>
    <rect x="182" y="520" width="172" height="86" rx="5" fill="#ebf5fb" stroke="#2980b9" stroke-width="2"/>
    <rect x="182" y="520" width="172" height="18" rx="4" fill="#2980b9"/>
    <text x="268" y="533" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">🧻 JUMBO PAPER TOWELS</text>
    <g fill="#fff" stroke="#bdc3c7" stroke-width="1.5"><rect x="196" y="544" width="38" height="52" rx="6"/><rect x="248" y="544" width="38" height="52" rx="6"/><rect x="300" y="544" width="38" height="52" rx="6"/></g>
    <text x="267" y="574" font-size="7.5" font-weight="900" fill="#2980b9" text-anchor="middle">ULTRA ABSORBENT</text>
  `),
  /* 20. fabricsoftenershelf — foreground laundry detergent & floral fabric softener island */
  objG("fabricsoftenershelf", "laundry & softener shelf", "kệ nước giặt & nước xả vải", 604, 508, 516, `
    <rect class="hit" x="418" y="514" width="180" height="100"/>
    <ellipse cx="508" cy="610" rx="86" ry="8" fill="#000" opacity=".14"/>
    <rect x="422" y="520" width="172" height="86" rx="5" fill="#f5eef8" stroke="#8e44ad" stroke-width="2"/>
    <rect x="422" y="520" width="172" height="18" rx="4" fill="#8e44ad"/>
    <text x="508" y="533" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">🧺 LAUNDRY &amp; SOFTENER</text>
    <g fill="#a29bfe" stroke="#6c5ce7"><rect x="438" y="546" width="34" height="50" rx="6"/><rect x="488" y="546" width="34" height="50" rx="6"/><rect x="538" y="546" width="34" height="50" rx="6" fill="#fd79a8" stroke="#e84393"/></g>
  `),
  /* 21. trashbagrack — foreground drawstring trash bags & kitchen foil rack */
  objG("trashbagrack", "drawstring trash bag shelf", "kệ túi đựng rác", 604, 748, 516, `
    <rect class="hit" x="658" y="514" width="180" height="100"/>
    <ellipse cx="748" cy="610" rx="86" ry="8" fill="#000" opacity=".14"/>
    <rect x="662" y="520" width="172" height="86" rx="5" fill="#eaeded" stroke="#596a78" stroke-width="2"/>
    <rect x="662" y="520" width="172" height="18" rx="4" fill="#2c3e50"/>
    <text x="748" y="533" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">🗑️ DRAWSTRING TRASH BAGS</text>
    <g fill="#34495e" stroke="#1a252f"><rect x="678" y="548" width="40" height="46" rx="3"/><rect x="728" y="548" width="40" height="46" rx="3" fill="#27ae60"/><rect x="778" y="548" width="40" height="46" rx="3" fill="#e67e22"/></g>
    <text x="748" y="575" font-size="7" font-weight="900" fill="#fff" text-anchor="middle">LEMON SCENT</text>
  `)
].join("\n");

const meatObjects = Object.assign(
  Object.fromEntries(Object.entries(S.allObjects).filter(([k]) => S.MEAT_OBJS.has(k))),
  {
    seafoodicecase: {
      en: "fresh seafood on ice", vi: "quầy hải sản ướp đá", ipa: "/freʃ ˈsiː.fuːd ɑn aɪs/",
      acts: ["order_fresh_salmon", "order_fresh_tiger_shrimp"]
    },
    butcherscale: {
      en: "butcher's digital scale", vi: "cân điện tử quầy thịt", ipa: "/ˈbʊtʃ.əz ˈdɪdʒ.ɪ.təl skeɪl/",
      acts: ["weigh_meat_on_butcher_scale", "check_price_per_kilo_sticker"]
    },
    wrappingstation: {
      en: "butcher wrapping paper", vi: "cuộn giấy gói thịt", ipa: "/ˈbʊtʃ.ər ˈræp.ɪŋ ˈpeɪ.pər/",
      acts: ["ask_butcher_wrap_in_paper", "take_wrapped_meat_parcel"]
    },
    butcherblock: {
      en: "knives & cutting board", vi: "dao & thớt gỗ sau quầy", ipa: "/naɪvz ən ˈkʌt.ɪŋ bɔːd/",
      acts: ["watch_butcher_trim_fat", "ask_butcher_cube_stew_beef"]
    },
    marinatedcase: {
      en: "marinated meat tray case", vi: "tủ thịt tẩm ướp sẵn", ipa: "/ˈmær.ɪ.neɪ.tɪd miːt keɪs/",
      acts: ["pick_a_pack_of_beef"]
    },
    noodleshelf: {
      en: "pasta & noodle shelf", vi: "kệ mì sợi & nui", ipa: "/ˈpæs.tə ən ˈnuː.dəl ʃelf/",
      acts: ["grab_egg_noodle_packs", "pick_whole_wheat_spaghetti"]
    },
    cookingoilrack: {
      en: "cooking oil shelf", vi: "kệ dầu ăn", ipa: "/ˈkʊk.ɪŋ ɔɪl ʃelf/",
      acts: ["pick_extra_virgin_olive_oil"]
    },
    spicerack: {
      en: "spices & seasoning rack", vi: "kệ gia vị & nước chấm", ipa: "/ˈspaɪ.sɪz ən ˈsiː.zən.ɪŋ ræk/",
      acts: ["pick_ground_black_pepper", "grab_garlic_herb_seasoning"]
    },
    cannedfoodrack: {
      en: "cereal & dry pantry shelf", vi: "kệ ngũ cốc & đồ khô", ipa: "/ˈsɪr.ri.əl ən ˈpæn.tri ʃelf/",
      acts: ["grab_a_box_of_cereal"]
    },
    soapbrushrack: {
      en: "soap & scrub brush shelf", vi: "kệ xà phòng & bàn chải cọ", ipa: "/soʊp ən skrʌb brʌʃ ʃelf/",
      acts: ["pick_antibacterial_hand_soap", "grab_stiff_scrub_brush"]
    },
    papertowelstack: {
      en: "paper towel display", vi: "kệ khăn giấy cuộn đa năng", ipa: "/ˈpeɪ.pər ˈtaʊ.əl dɪˈspleɪ/",
      acts: ["grab_absorbent_paper_towels"]
    },
    oralcarestand: {
      en: "toothbrush & mouthwash rack", vi: "kệ bàn chải đánh răng & nước súc miệng", ipa: "/ˈtuːθ.brʌʃ ræk/",
      acts: ["pick_soft_bristle_toothbrush"]
    },
    trashbagrack: {
      en: "drawstring trash bag shelf", vi: "kệ túi đựng rác", ipa: "/ˈdrɔː.strɪŋ træʃ bæɡ ʃelf/",
      acts: ["grab_scented_trash_bags"]
    },
    fabricsoftenershelf: {
      en: "laundry & softener shelf", vi: "kệ nước giặt & nước xả vải", ipa: "/ˈlɔːn.dri ən ˈsɑf.ən.ər ʃelf/",
      acts: ["pick_laundry_detergent"]
    },
    bodywashrack: {
      en: "body wash & lotion shelf", vi: "kệ sữa tắm & dưỡng thể", ipa: "/ˈbɑd.i wɑʃ ʃelf/",
      acts: ["pick_moisturizing_body_wash"]
    },
    householdstaff: {
      en: "household aisle staff", vi: "nhân viên kệ gia dụng", ipa: "/ˈhaʊs.hoʊld aɪl stɑːf/",
      acts: ["ask_staff_for_eco_cleaner"]
    },
    meatsalesign: {
      en: "meat & pantry discount sign", vi: "biển giảm giá thịt cá & đồ khô", ipa: "/miːt ˈdɪs.kaʊnt saɪn/",
      acts: ["read_meat_combo_deal"]
    }
  }
);

/* 22 New Actions for market_meat (20 existing + 22 new = 42 actions) */
const meatNewActions = [
  mkA("order_fresh_salmon", "seafoodicecase", "Order fresh salmon on crushed ice", "Mua cá hồi tươi trên khay đá bào",
    "Could you cut two thick pieces of that fresh Atlantic salmon on the crushed ice?",
    "Bạn cắt giúp mình hai khúc cá hồi Đại Tây Dương tươi ngon đang ướp trên khay đá bào nhé?",
    ["fresh", "salmon", "crushed ice"], ["fresh", "salmon", "crushedice"],
    "<b>on crushed ice</b> = được ướp trên lớp đá bào để giữ độ tươi ngon.",
    ["Could you cut two thick pieces", "of that fresh Atlantic salmon on the crushed ice?"], ["salmon", "sermon", "salon"],
    ["The <b>fresh salmon</b> looks bright orange.", "All seafood is kept cold on <b>crushed ice</b>."],
    once("mkm_salmon", "yes", "Bạn đã mua hai khúc cá hồi tươi trên khay đá rồi."),
    at("mkm_seafood", "point", 800, [["mkm_salmon", "yes"]]),
    ["order fresh salmon on crushed ice", "ask the fishmonger for two pieces of fresh salmon", "mua cá hồi tươi trên khay đá bào"]),

  mkA("order_fresh_tiger_shrimp", "seafoodicecase", "Order fresh tiger shrimp", "Mua tôm sú tươi sống",
    "I'd like four hundred grams of those large, fresh tiger shrimp, please.",
    "Cho mình lấy bốn trăm gam tôm sú tươi loại to kia nhé.",
    ["fresh", "tiger shrimp"], ["fresh", "shrimp"],
    "<b>four hundred grams of …</b> = 400 gam … (cách mua hải sản theo lạng/gam).",
    ["I'd like four hundred grams", "of those large, fresh tiger shrimp, please."], ["shrimp", "chimp", "limp"],
    ["<b>Fresh tiger shrimp</b> are great for grilling.", "Could you clean and devein them for me?"],
    once("mkm_shrimp", "yes", "Bạn đã mua bốn trăm gam tôm sú tươi rồi."),
    at("mkm_seafood", "point", 800, [["mkm_shrimp", "yes"]]),
    ["order fresh tiger shrimp", "buy 400 grams of fresh tiger shrimp", "mua tôm sú tươi sống"]),

  mkA("weigh_meat_on_butcher_scale", "butcherscale", "Watch the butcher weigh the meat", "Xem nhân viên cân thịt trên cân điện tử",
    "The butcher is placing the tender beef cut on the digital scale—it's just over half a kilo.",
    "Nhân viên quầy thịt đang đặt miếng thịt bò mềm lên cân điện tử — nhỉnh hơn nửa ký một chút.",
    ["tender", "scale", "half a kilo"], ["tender", "scale", "halfkilo"],
    "<b>place … on the digital scale</b> = đặt … lên bàn cân điện tử.",
    ["The butcher is placing the tender beef cut", "on the digital scale—it's just over half a kilo."], ["scale", "sale", "sail"],
    ["That weight is fine, thank you!", "This cut of beef looks very <b>tender</b>."],
    once("mkm_scale", "yes", "Nhân viên đã cân miếng thịt trên cân điện tử rồi."),
    at("mkm_scale", "read", 800, [["mkm_scale", "yes"]]),
    ["watch the butcher weigh the meat", "check the weight on the butcher's scale", "xem nhân viên cân thịt"]),

  mkA("check_price_per_kilo_sticker", "butcherscale", "Check the printed weight label", "Kiểm tra tem giá theo ký vừa in",
    "The printed sticker shows the weight and the exact price per kilo.",
    "Chiếc tem vừa in hiển thị rõ số cân và đơn giá chính xác trên mỗi ki-lô-gam.",
    ["printed sticker", "price per kilo"], ["sticker", "price", "kilo"],
    "<b>price per kilo</b> = đơn giá tính theo mỗi ki-lô-gam.",
    ["The printed sticker shows the weight", "and the exact price per kilo."], ["kilo", "pillow", "zero"],
    ["Check the <b>price per kilo</b> on the label.", "The cashier scans this barcode at checkout."],
    W => W.mkm_scale !== "yes" ? "Thịt chưa được cân. Hãy xem cân thịt trước (Watch the butcher weigh the meat)." : W.mkm_scalelabel === "yes" ? "Bạn đã kiểm tra tem giá trên cân rồi." : null,
    at("mkm_scale", "read", 700, [["mkm_scalelabel", "yes"]]),
    ["check the printed weight label", "read the price per kilo on the butcher sticker", "kiểm tra tem giá theo ký"]),

  mkA("ask_butcher_wrap_in_paper", "wrappingstation", "Ask to wrap the meat in butcher paper", "Nhờ gói kỹ thịt bằng giấy gói chuyên dụng",
    "Could you wrap the fresh meat tightly in thick butcher paper so it doesn't leak?",
    "Bạn gói thật kỹ phần thịt tươi bằng giấy gói chuyên dụng dày để không bị rỉ nước nhé?",
    ["wrap", "butcher paper"], ["butcherpaper", "fresh"],
    "<b>butcher paper</b> = giấy kraft chống thấm dùng để gói thịt cá ở quầy.",
    ["Could you wrap the fresh meat tightly", "in thick butcher paper so it doesn't leak?"], ["paper", "pepper", "piper"],
    ["The butcher wrapped the steak in <b>butcher paper</b>.", "Tie it neatly with string."],
    once("mkm_wrap", "yes", "Bạn đã nhờ gói thịt bằng giấy chuyên dụng rồi."),
    at("mkm_wrap", "point", 800, [["mkm_wrap", "yes"]]),
    ["ask to wrap the meat in butcher paper", "ask the butcher to wrap the meat tightly", "nhờ gói kỹ thịt bằng giấy gói"]),

  mkA("take_wrapped_meat_parcel", "wrappingstation", "Take the wrapped meat parcel", "Nhận gói thịt đã bọc giấy gọn gàng",
    "Thank you! This neatly wrapped meat parcel is ready to go into my basket.",
    "Cảm ơn bạn! Gói thịt đã được bọc giấy gọn gàng này sẵn sàng cho vào giỏ hàng rồi.",
    ["neatly", "butcher paper"], ["neatly", "butcherpaper"],
    "<b>parcel / package</b> = gói hàng được bọc giấy gọn gàng.",
    ["Thank you! This neatly wrapped meat parcel", "is ready to go into my basket."], ["neatly", "nearly", "newly"],
    ["Put the wrapped meat <b>neatly</b> in the cart.", "Keep raw meat separate from fruit."],
    W => W.mkm_wrap !== "yes" ? "Thịt chưa được gói. Hãy nhờ gói thịt trước (Ask to wrap the meat in butcher paper)." : W.mkm_parcel === "yes" ? "Bạn đã nhận gói thịt rồi." : null,
    at("mkm_wrap", "reach", 800, [["mkm_parcel", "yes"]]),
    ["take the wrapped meat parcel", "pick up the neatly wrapped meat package", "nhận gói thịt đã bọc giấy"]),

  mkA("watch_butcher_trim_fat", "butcherblock", "Ask the butcher to trim the fat", "Nhờ đầu bếp lọc bớt mỡ trên thớt gỗ",
    "Could you use your sharp knife to trim the extra fat off this pork loin on the cutting board?",
    "Bạn dùng dao sắc lọc bớt phần mỡ thừa trên miếng thịt thăn heo trên thớt gỗ giúp mình nhé?",
    ["cutting board", "trim"], ["cuttingboard", "pork"],
    "<b>trim the fat</b> = lọc / cắt bỏ bớt phần mỡ thừa; <b>cutting board / chopping block</b> = thớt gỗ.",
    ["Could you use your sharp knife", "to trim the extra fat off this pork loin on the cutting board?"], ["board", "bored", "bird"],
    ["The butcher is slicing meat on the <b>cutting board</b>.", "Please <b>trim</b> the excess fat."],
    once("mkm_trim", "yes", "Bạn đã nhờ lọc bớt mỡ trên thớt gỗ rồi."),
    at("mkm_block", "point", 800, [["mkm_trim", "yes"]]),
    ["ask the butcher to trim the fat", "ask the butcher to trim excess fat on the cutting board", "nhờ lọc bớt mỡ trên thớt"]),

  mkA("ask_butcher_cube_stew_beef", "butcherblock", "Ask to cut tender beef into cubes", "Nhờ thái thịt bò mềm thành miếng vuông nấu bò kho",
    "I'm making beef stew tonight—could you cut this tender beef into bite-sized cubes with the cleaver?",
    "Tối nay mình nấu món bò hầm — bạn dùng dao phay thái phần thịt bò mềm này thành miếng vuông vừa ăn giúp mình nhé?",
    ["tender", "cleaver", "cubes"], ["tender", "cleaver"],
    "<b>bite-sized cubes</b> = những miếng vuông vừa một miếng cắn (để nấu bò kho / hầm).",
    ["I'm making beef stew tonight—", "could you cut this tender beef into bite-sized cubes with the cleaver?"], ["tender", "slender", "sender"],
    ["Cut the <b>tender</b> beef into <b>cubes</b> for stew.", "The butcher uses a heavy <b>meat cleaver</b>."],
    once("mkm_cube", "yes", "Bạn đã nhờ thái thịt bò thành miếng vuông rồi."),
    at("mkm_block", "point", 800, [["mkm_cube", "yes"]]),
    ["ask to cut tender beef into cubes", "ask the butcher to cube the stew beef", "nhờ thái thịt bò thành miếng vuông"]),

  mkA("pick_a_pack_of_beef", "marinatedcase", "Pick a pack of marinated beef", "Lấy khay thịt bò tẩm ướp sẵn",
    "This pre-packed tray of tender marinated ribeye beef is ready to stir-fry in five minutes.",
    "Khay thịt bò thăn ngoại mềm đã tẩm ướp sẵn này chỉ cần xào năm phút là chín.",
    ["marinated beef", "tender"], ["marinated", "tender"],
    "<b>marinated beef</b> = thịt bò đã tẩm ướp gia vị sẵn; <b>stir-fry</b> = xào nhanh trên lửa lớn.",
    ["This pre-packed tray of tender marinated ribeye beef", "is ready to stir-fry in five minutes."], ["beef", "leaf", "reef"],
    ["Grab a pack of <b>marinated beef</b> for a quick dinner.", "It's seasoned with black pepper and garlic."],
    once("mkm_beefpack", "yes", "Bạn đã lấy khay thịt bò tẩm ướp sẵn rồi."),
    at("mkm_marinated", "reach", 800, [["mkm_beefpack", "yes"]]),
    ["pick a pack of marinated beef", "grab a tray of tender marinated beef", "lấy khay thịt bò tẩm ướp sẵn"]),

  mkA("grab_egg_noodle_packs", "noodleshelf", "Grab golden egg noodle packs", "Lấy gói mì trứng sợi vàng",
    "I'm grabbing two packs of golden egg noodles for our stir-fry with shrimp and vegetables.",
    "Tôi đang lấy hai gói mì trứng sợi vàng để xào cùng tôm và rau củ.",
    ["egg noodles", "shrimp"], ["noodles", "shrimp"],
    "<b>egg noodles</b> = mì trứng sợi vàng dai ngon.",
    ["I'm grabbing two packs of golden egg noodles", "for our stir-fry with shrimp and vegetables."], ["noodles", "poodles", "needles"],
    ["Boil the <b>egg noodles</b> for three minutes.", "They taste great with soy sauce and sesame oil."],
    once("mkm_noodles", "yes", "Bạn đã lấy hai gói mì trứng sợi vàng rồi."),
    at("mkm_noodles", "reach", 800, [["mkm_noodles", "yes"]]),
    ["grab golden egg noodle packs", "pick two packs of egg noodles", "lấy gói mì trứng sợi vàng"]),

  mkA("pick_whole_wheat_spaghetti", "noodleshelf", "Pick organic Italian spaghetti", "Chọn gói mì Ý hữu cơ sợi dài",
    "Let's pick a box of organic Italian spaghetti to cook with tomato basil sauce.",
    "Mình chọn một hộp mì Ý hữu cơ sợi dài để nấu cùng sốt cà chua lá húng quế nhé.",
    ["organic", "spaghetti"], ["organic", "spaghetti"],
    "<b>spaghetti</b> /spəˈɡet.i/ = mì Ý sợi tròn dài.",
    ["Let's pick a box of organic Italian spaghetti", "to cook with tomato basil sauce."], ["pasta", "faster", "master"],
    ["Cook the <b>spaghetti</b> in salted boiling water.", "Top it with grated cheese!"],
    once("mkm_spaghetti", "yes", "Bạn đã chọn hộp mì Ý hữu cơ rồi."),
    at("mkm_noodles", "reach", 800, [["mkm_spaghetti", "yes"]]),
    ["pick organic Italian spaghetti", "grab a box of Italian spaghetti", "chọn gói mì Ý hữu cơ"]),

  mkA("pick_extra_virgin_olive_oil", "cookingoilrack", "Pick extra-virgin olive oil", "Chọn chai dầu ô-liu nguyên chất ép lạnh",
    "A dark glass bottle of cold-pressed extra-virgin olive oil is healthy for salads and pan-searing.",
    "Một chai thủy tinh sẫm màu đựng dầu ô-liu nguyên chất ép lạnh rất tốt cho sức khỏe khi trộn salad và áp chảo.",
    ["olive oil", "healthy"], ["oliveoil", "sunfloweroil", "healthy"],
    "<b>extra-virgin olive oil</b> = dầu ô-liu nguyên chất ép lần đầu; giàu chất béo tốt cho tim mạch.",
    ["A dark glass bottle of cold-pressed extra-virgin olive oil", "is healthy for salads and pan-searing."], ["olive", "alive", "oil"],
    ["Drizzle a little <b>olive oil</b> over the salad.", "Keep <b>cooking oil</b> in a cool, dark place."],
    once("mkm_oliveoil", "yes", "Bạn đã chọn chai dầu ô-liu nguyên chất rồi."),
    at("mkm_oil", "reach", 800, [["mkm_oliveoil", "yes"]]),
    ["pick extra-virgin olive oil", "choose a bottle of extra-virgin olive oil", "chọn chai dầu ô-liu nguyên chất"]),

  mkA("pick_ground_black_pepper", "spicerack", "Pick fragrant black pepper", "Lấy lọ hạt tiêu đen xay thơm nồng",
    "Freshly ground Phu Quoc black pepper adds a warm, fragrant kick to any steak or soup.",
    "Hạt tiêu đen Phú Quốc xay mới tạo thêm vị cay thơm nồng ấm cho bất kỳ món bít tết hay súp nào.",
    ["black pepper", "fragrant"], ["pepper", "fresh"],
    "<b>add a kick (to …)</b> = tạo thêm điểm nhấn hương vị cay nồng hấp dẫn.",
    ["Freshly ground Phu Quoc black pepper", "adds a warm, fragrant kick to any steak or soup."], ["pepper", "paper", "piper"],
    ["Season the fish with salt and <b>black pepper</b>.", "This spice rack has every herb we need."],
    once("mkm_pepper", "yes", "Bạn đã lấy lọ hạt tiêu đen Phú Quốc rồi."),
    at("mkm_spices", "reach", 800, [["mkm_pepper", "yes"]]),
    ["pick fragrant black pepper", "grab a jar of Phu Quoc black pepper", "lấy lọ hạt tiêu đen xay"]),

  mkA("grab_garlic_herb_seasoning", "spicerack", "Grab garlic & herb seasoning", "Lấy lọ gia vị tỏi và thảo mộc",
    "This all-purpose garlic and rosemary seasoning blend is on sale and smells wonderful!",
    "Lọ gia vị tổng hợp từ tỏi và lá hương thảo này đang giảm giá và có mùi thơm tuyệt vời!",
    ["garlic seasoning", "on sale"], ["seasoning", "sale"],
    "<b>all-purpose seasoning</b> = gia vị nêm đa năng (dùng cho cả thịt, cá, rau củ).",
    ["This all-purpose garlic and rosemary seasoning blend", "is on sale and smells wonderful!"], ["garlic", "garden", "garment"],
    ["Rub <b>garlic seasoning</b> on the chicken before roasting.", "It's twenty percent off today."],
    once("mkm_seasoning", "yes", "Bạn đã lấy lọ gia vị tỏi thảo mộc rồi."),
    at("mkm_spices", "reach", 800, [["mkm_seasoning", "yes"]]),
    ["grab garlic and herb seasoning", "pick a jar of garlic and herb seasoning", "lấy lọ gia vị tỏi và thảo mộc"]),

  mkA("grab_a_box_of_cereal", "cannedfoodrack", "Grab crunchy honey oat cereal", "Lấy hộp ngũ cốc yến mạch mật ong giòn",
    "I'm grabbing a box of crunchy honey-oat breakfast cereal to eat with cold milk.",
    "Tôi đang lấy một hộp ngũ cốc ăn sáng yến mạch mật ong giòn rụm để ăn kèm sữa lạnh.",
    ["breakfast cereal", "crunchy"], ["cereal", "crunchy", "milk"],
    "<b>a box of cereal</b> = một hộp ngũ cốc ăn sáng.",
    ["I'm grabbing a box of crunchy honey-oat breakfast cereal", "to eat with cold milk."], ["cereal", "serial", "serious"],
    ["Pour cold <b>milk</b> over your <b>breakfast cereal</b>.", "It's high in whole grains and fiber."],
    once("mkm_cereal", "yes", "Bạn đã lấy hộp ngũ cốc yến mạch mật ong rồi."),
    at("mkm_pantry", "reach", 800, [["mkm_cereal", "yes"]]),
    ["grab crunchy honey oat cereal", "take a box of breakfast cereal", "lấy hộp ngũ cốc ăn sáng"]),

  mkA("pick_antibacterial_hand_soap", "soapbrushrack", "Pick foaming hand soap", "Lấy chai xà phòng rửa tay tạo bọt",
    "We need a pump bottle of gentle aloe vera hand soap for the bathroom sink.",
    "Nhà mình cần một chai xà phòng rửa tay tạo bọt hương nha đam dịu nhẹ cho bồn rửa phòng tắm.",
    ["hand soap", "gentle"], ["handsoap", "need"],
    "<b>a pump bottle of hand soap</b> = chai nước rửa tay có vòi nhấn.",
    ["We need a pump bottle", "of gentle aloe vera hand soap for the bathroom sink."], ["soap", "soup", "soak"],
    ["Wash your hands with warm water and <b>hand soap</b>.", "We also sell refill pouches."],
    once("mkm_handsoap", "yes", "Bạn đã lấy chai xà phòng rửa tay rồi."),
    at("mkm_soapbrush", "reach", 800, [["mkm_handsoap", "yes"]]),
    ["pick foaming hand soap", "grab a pump bottle of hand soap", "lấy chai xà phòng rửa tay"]),

  mkA("grab_stiff_scrub_brush", "soapbrushrack", "Grab a wooden scrub brush", "Lấy bàn chải cọ rửa cán gỗ chắc chắn",
    "This sturdy wooden scrub brush has stiff bristles for cleaning floor tiles and pots.",
    "Chiếc bàn chải cọ rửa cán gỗ chắc chắn này có lông cứng cáp để chà gạch sàn và xoong nồi.",
    ["scrub brush", "sturdy"], ["scrubbrush", "sturdy"],
    "<b>stiff bristles</b> = sợi lông bàn chải cứng cáp (dùng cọ rửa vết bẩn bám chặt).",
    ["This sturdy wooden scrub brush", "has stiff bristles for cleaning floor tiles and pots."], ["brush", "blush", "rush"],
    ["Use a <b>scrub brush</b> with warm soapy water.", "The wooden handle is very <b>sturdy</b>."],
    once("mkm_brush", "yes", "Bạn đã lấy chiếc bàn chải cọ rửa cán gỗ rồi."),
    at("mkm_soapbrush", "reach", 800, [["mkm_brush", "yes"]]),
    ["grab a wooden scrub brush", "pick a sturdy scrub brush", "lấy bàn chải cọ rửa cán gỗ"]),

  mkA("grab_absorbent_paper_towels", "papertowelstack", "Grab ultra-absorbent paper towels", "Lấy lốc khăn giấy cuộn nhà bếp siêu thấm",
    "I'll pick a three-roll pack of thick, ultra-absorbent kitchen paper towels.",
    "Mình sẽ lấy một lốc ba cuộn khăn giấy nhà bếp dày và siêu thấm hút.",
    ["paper towels", "thick"], ["papertowel"],
    "<b>ultra-absorbent</b> = siêu thấm nước/dầu mỡ; <b>a roll of paper towels</b> = một cuộn giấy lau bếp.",
    ["I'll pick a three-roll pack", "of thick, ultra-absorbent kitchen paper towels."], ["towel", "tower", "vowel"],
    ["Keep a roll of <b>paper towels</b> by the kitchen counter.", "They wipe up spills in seconds."],
    once("mkm_papertowel", "yes", "Bạn đã lấy lốc khăn giấy cuộn nhà bếp rồi."),
    at("mkm_papertowel", "bend", 800, [["mkm_papertowel", "yes"]]),
    ["grab ultra-absorbent paper towels", "pick a pack of kitchen paper towels", "lấy lốc khăn giấy cuộn nhà bếp"]),

  mkA("pick_soft_bristle_toothbrush", "oralcarestand", "Pick a soft-bristle toothbrush", "Chọn bàn chải đánh răng lông mềm",
    "Dentists recommend replacing your toothbrush every three months with a soft-bristle one.",
    "Nha sĩ khuyên nên thay bàn chải đánh răng ba tháng một lần bằng loại lông mềm.",
    ["toothbrush", "soft-bristle"], ["toothbrush", "soft"],
    "<b>soft-bristle toothbrush</b> = bàn chải đánh răng lông mềm bảo vệ nướu.",
    ["Dentists recommend replacing your toothbrush", "every three months with a soft-bristle one."], ["tooth", "truth", "booth"],
    ["I picked a twin-pack of <b>toothbrushes</b>.", "Don't forget dental floss and mouthwash!"],
    once("mkm_toothbrush", "yes", "Bạn đã chọn bộ bàn chải đánh răng lông mềm rồi."),
    at("mkm_oral", "reach", 800, [["mkm_toothbrush", "yes"]]),
    ["pick a soft-bristle toothbrush", "choose a new soft-bristle toothbrush", "chọn bàn chải đánh răng lông mềm"]),

  mkA("grab_scented_trash_bags", "trashbagrack", "Grab lemon-scented trash bags", "Lấy cuộn túi đựng rác có dây rút hương chanh",
    "These sturdy drawstring trash bags have a fresh lemon scent to keep the kitchen bin clean.",
    "Những chiếc túi đựng rác có dây rút chắc chắn này mang hương chanh tươi mát giúp thùng rác bếp luôn sạch sẽ.",
    ["trash bags", "sturdy", "fresh"], ["trashbags", "sturdy", "fresh"],
    "<b>drawstring trash bags</b> = túi đựng rác có sẵn dây rút ở miệng túi rất tiện lợi.",
    ["These sturdy drawstring trash bags", "have a fresh lemon scent to keep the kitchen bin clean."], ["trash", "crash", "flash"],
    ["Pull the <b>drawstring</b> to tie the <b>trash bag</b> shut.", "These fit a thirty-liter bin."],
    once("mkm_trashbags", "yes", "Bạn đã lấy cuộn túi đựng rác dây rút rồi."),
    at("mkm_trash", "bend", 800, [["mkm_trashbags", "yes"]]),
    ["grab lemon-scented trash bags", "pick a box of drawstring trash bags", "lấy cuộn túi đựng rác có dây rút"]),

  mkA("pick_laundry_detergent", "fabricsoftenershelf", "Pick floral fabric softener", "Chọn nước xả vải hương hoa dịu nhẹ",
    "This concentrated lavender fabric softener leaves our clothes feeling soft and smelling fresh.",
    "Chai nước xả vải đậm đặc hương oải hương này giúp quần áo luôn mềm mại và thơm mát.",
    ["fabric softener", "soft", "fresh"], ["softener", "soft", "fresh"],
    "<b>fabric softener</b> = nước xả làm mềm vải; <b>concentrated</b> = đậm đặc.",
    ["This concentrated lavender fabric softener", "leaves our clothes feeling soft and smelling fresh."], ["soft", "sort", "salt"],
    ["Add one capful of <b>fabric softener</b> to the wash.", "It's right next to the laundry detergent."],
    once("mkm_detergent2", "yes", "Bạn đã chọn chai nước xả vải hương hoa rồi."),
    at("mkm_softener", "bend", 800, [["mkm_detergent2", "yes"]]),
    ["pick floral fabric softener", "grab a bottle of lavender fabric softener", "chọn nước xả vải hương hoa"]),

  mkA("pick_moisturizing_body_wash", "bodywashrack", "Pick oatmeal moisturizing body wash", "Chọn sữa tắm dưỡng ẩm yến mạch",
    "In dry winter weather, this oatmeal and shea butter body wash keeps skin hydrated.",
    "Trong thời tiết mùa đông hanh khô, sữa tắm yến mạch và bơ hạt mỡ này giúp giữ ẩm cho làn da.",
    ["body wash", "hydrated"], ["bodywash", "sensitive"],
    "<b>moisturizing body wash</b> = sữa tắm dưỡng ẩm; <b>keep skin hydrated</b> = giữ da đủ độ ẩm.",
    ["In dry winter weather,", "this oatmeal and shea butter body wash keeps skin hydrated."], ["wash", "watch", "wish"],
    ["This <b>body wash</b> is soap-free and pH-balanced.", "It's great for <b>sensitive skin</b>."],
    once("mkm_bodywash", "yes", "Bạn đã chọn chai sữa tắm dưỡng ẩm rồi."),
    at("mkm_bodywash", "reach", 800, [["mkm_bodywash", "yes"]]),
    ["pick oatmeal moisturizing body wash", "choose a bottle of moisturizing body wash", "chọn sữa tắm dưỡng ẩm"]),

  mkA("ask_staff_for_eco_cleaner", "householdstaff", "Ask staff for eco-friendly cleaner", "Hỏi nhân viên về nước tẩy rửa sinh học",
    "Excuse me, which shelf has the plant-based, eco-friendly kitchen surface cleaner?",
    "Xin lỗi, nước lau bếp sinh học chiết xuất từ thực vật để ở kệ nào vậy bạn?",
    ["which shelf", "eco-friendly"], ["where", "help"],
    "<b>eco-friendly / plant-based cleaner</b> = chất tẩy rửa thân thiện môi trường có nguồn gốc thực vật.",
    ["Excuse me, which shelf has", "the plant-based, eco-friendly kitchen surface cleaner?"], ["shelf", "self", "shell"],
    ["Our <b>eco-friendly</b> cleaners are on the middle shelf.", "They are safe around kids and pets."],
    once("mkm_staff", "yes", "Bạn đã hỏi nhân viên kệ gia dụng về nước lau bếp sinh học rồi."),
    at("mkm_staff", "point", 800, [["mkm_staff", "yes"]]),
    ["ask staff for eco-friendly cleaner", "ask the household staff where the eco cleaner is", "hỏi nhân viên về nước tẩy rửa sinh học"]),

  mkA("read_meat_combo_deal", "meatsalesign", "Read the meat & pantry combo sign", "Xem biển ưu đãi combo thịt cá & đồ khô",
    "The banner says we get fifteen percent off cooking oil when we buy a five-kilo bag of rice!",
    "Tấm biển ghi rằng mình được giảm mười lăm phần trăm dầu ăn khi mua kèm một bao gạo năm ký!",
    ["fifteen percent off", "cooking oil", "rice"], ["sale", "sunfloweroil", "rice"],
    "<b>combo deal</b> = ưu đãi mua kèm tiết kiệm.",
    ["The banner says we get fifteen percent off cooking oil", "when we buy a five-kilo bag of rice!"], ["deal", "meal", "seal"],
    ["Check the red <b>discount sign</b> above the butcher counter.", "Grab both <b>rice</b> and <b>cooking oil</b>!"],
    once("mkm_salesign", "yes", "Bạn đã xem biển ưu đãi combo thịt cá & đồ khô rồi."),
    at("mkm_sign", "read", 800, [["mkm_salesign", "yes"]]),
    ["read the meat and pantry combo sign", "check the combo discount banner", "xem biển ưu đãi combo thịt cá & đồ khô"])
];

const meatActions = [
  ...S.allActions.filter(a => S.MEAT_OBJS.has(a.obj)),
  ...meatNewActions
];

const market_meat = {
  id: "market_meat", topic: "market", icon: "🥩", zoneOrder: 4,
  name: "Meat, Fish & Household", nameVi: "Thịt cá & gia dụng", names: ["Meat, Fish & Household", "Thịt cá & gia dụng"],
  go: {
    label: "Head to meat, fish & household",
    labelVi: "Qua khu thịt cá & gia dụng",
    sentence: "I'm heading to the butcher counter and household aisles.",
    vi: "Tôi đang đi sang quầy thịt cá và các dãy kệ đồ gia dụng.",
    key: ["heading", "butcher", "household"],
    chunks: ["I'm heading to the butcher counter", "and household aisles."],
    grammar: "<b>butcher counter</b> = quầy thịt tươi; <b>household aisles</b> = dãy kệ hàng gia dụng.",
    patterns: ["I'm heading to <b>the meat and fish counter</b>.", "I'm heading to <b>the household section</b>."],
    vocab: [["butcher", "/ˈbʊtʃ.ər/", "quầy thịt / người bán thịt"], ["household", "/ˈhaʊs.hoʊld/", "đồ gia dụng"]],
    story: ["head to the meat and household section", "walk to the butcher counter and household aisles", "đi sang khu thịt cá & gia dụng"]
  },
  shellSvg: meatShell,
  worldSvg: meatWorld,
  W0: MK_W0,
  spots: {
    mkm_door: { x: 112, y: 470, d: -1 },
    mk_meat: { x: 224, y: 372, d: 1 },
    mkm_block: { x: 210, y: 368, d: 1 },
    mkm_scale: { x: 368, y: 368, d: 1 },
    mkm_wrap: { x: 448, y: 368, d: 1 },
    mkm_seafood: { x: 562, y: 372, d: 1 },
    mkm_sign: { x: 542, y: 368, d: 1 },
    mkm_noodles: { x: 699, y: 368, d: 1 },
    mkm_oil: { x: 817, y: 368, d: 1 },
    mkm_spices: { x: 935, y: 368, d: 1 },
    mk_care: { x: 118, y: 368, d: -1 },
    mkm_oral: { x: 118, y: 428, d: -1 },
    mkm_bodywash: { x: 118, y: 538, d: -1 },
    mkm_marinated: { x: 220, y: 504, d: 1 },
    mk_rice: { x: 386, y: 504, d: 1 },
    mkm_pantry: { x: 545, y: 504, d: 1 },
    mk_house: { x: 706, y: 504, d: 1 },
    mkm_staff: { x: 832, y: 502, d: 1 },
    mkm_soapbrush: { x: 930, y: 504, d: 1 },
    mkm_papertowel: { x: 268, y: 620, d: 1 },
    mkm_softener: { x: 508, y: 620, d: 1 },
    mkm_trash: { x: 748, y: 620, d: 1 }
  },
  obstacles: [],
  entry: { x: 150, y: 508, d: 1 },
  objects: meatObjects,
  actions: meatActions,
  props: S.MK_PROPS,
  applyState(W, root) { mirrorState(W, MK_W0, root); },
  css: S.marketCss,
  catalog: cat("mkm_", [
    ["tiger shrimp", "/ˈtaɪ.ɡər ʃrɪmp/", "tôm sú tươi", "food"],
    ["butcher paper", "/ˈbʊtʃ.ər ˈpeɪ.pər/", "giấy gói thịt", "other"],
    ["cutting board", "/ˈkʌt.ɪŋ bɔːd/", "thớt gỗ", "equipment"],
    ["meat cleaver", "/miːt ˈkliː.vər/", "dao phay chặt thịt", "equipment"],
    ["marinated beef", "/ˈmær.ɪ.neɪ.tɪd biːf/", "thịt bò tẩm ướp sẵn", "food"],
    ["egg noodles", "/eɡ ˈnuː.dəlz/", "mì trứng sợi vàng", "food"],
    ["spaghetti", "/spəˈɡet.i/", "mì Ý sợi dài", "food"],
    ["olive oil", "/ˈɑl.ɪv ɔɪl/", "dầu ô-liu nguyên chất", "food"],
    ["black pepper", "/blæk ˈpep.ər/", "hạt tiêu đen xay", "food"],
    ["garlic seasoning", "/ˈɡɑː.lɪk ˈsiː.zən.ɪŋ/", "gia vị bột tỏi thảo mộc", "food"],
    ["breakfast cereal", "/ˈbrek.fəst ˈsɪr.ri.əl/", "ngũ cốc ăn sáng", "food"],
    ["hand soap", "/hænd soʊp/", "xà phòng rửa tay", "other"],
    ["scrub brush", "/skrʌb brʌʃ/", "bàn chải cọ rửa", "equipment"],
    ["paper towels", "/ˈpeɪ.pər ˈtaʊ.əlz/", "khăn giấy cuộn nhà bếp", "other"],
    ["toothbrush", "/ˈtuːθ.brʌʃ/", "bàn chải đánh răng", "other"],
    ["trash bags", "/træʃ bæɡz/", "túi đựng rác", "other"],
    ["fabric softener", "/ˈfæb.rɪk ˈsɑf.ən.ər/", "nước xả vải", "other"],
    ["body wash", "/ˈbɑd.i wɑʃ/", "sữa tắm dưỡng ẩm", "other"]
  ])
};

const MEAT_REPLIES = {
  /* Existing 20 actions in market_meat */
  ask_if_fresh: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Yes! Both the salmon and the sea bass arrived on crushed ice at six this morning.", vi: "Tươi lắm ạ! Cả cá hồi lẫn cá vược đều mới về trên khay đá bào lúc sáu giờ sáng nay." },
  order_some_pork: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Half a kilo of prime pork loin—let me weigh that on the digital scale for you.", vi: "Nửa ký thịt thăn heo loại ngon — để mình đặt lên cân điện tử cân cho bạn nhé." },
  ask_to_slice: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Sure thing! I'll slice it nice and thin on the cutting board.", vi: "Được ngay! Mình sẽ thái lát thật mỏng trên thớt gỗ cho bạn." },
  buy_fresh_fish: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Great choice! I've removed all the pin bones from this salmon fillet.", vi: "Bạn chọn chuẩn đấy! Mình đã rút sạch xương dăm khỏi miếng phi lê cá hồi này rồi." },
  buy_chicken: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Two skinless organic chicken breasts, wrapped and labeled for you!", vi: "Hai miếng ức gà hữu cơ lọc da, đã gói và dán tem giá cho bạn đây!" },
  ask_for_lean_beef: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Our lean ground sirloin is ninety-five percent fat-free—perfect for burgers!", vi: "Thịt bò thăn xay nạc của quầy mình tới 95% không mỡ — làm burger là chuẩn nhất!" },
  ask_cooking_tip_butcher: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Sear the salmon skin-side down in olive oil for four minutes until crispy!", vi: "Bạn áp chảo mặt da cá hồi xuống trước với dầu ô-liu trong bốn phút cho giòn rụm nhé!" },
  ask_where_rice: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "The five-kilo rice bags are stacked on the wooden pallet right in the middle row!", vi: "Các bao gạo 5 ký được xếp trên kệ gỗ ngay dãy giữa này ạ!" },
  get_bag_of_rice: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "Careful lifting that five-kilo bag! Don't forget cooking oil is 15% off with rice today.", vi: "Cẩn thận khi nhấc bao 5 ký nhé! Đừng quên mua kèm dầu ăn hôm nay được giảm 15% đấy ạ." },
  choose_brown_rice: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "Soak that organic brown rice for thirty minutes before cooking so it turns out extra tender.", vi: "Bạn ngâm gạo lứt hữu cơ đó ba mươi phút trước khi nấu để hạt cơm mềm dẻo hơn nhé." },
  compare_jasmine_rice: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "That new-crop ST25 and Thai jasmine rice is super fragrant and fluffy!", vi: "Gạo ST25 và gạo thơm lài mùa mới đó nấu lên thơm lừng và dẻo lắm!" },
  get_detergent: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "That concentrated liquid detergent works great even in cold water.", vi: "Chai nước giặt đậm đặc đó giặt sạch hiệu quả ngay cả với nước lạnh." },
  get_tissues: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "Those three-ply facial tissues are lotion-infused and super soft.", vi: "Hộp khăn giấy rút ba lớp đó có dưỡng ẩm nên mềm mịn lắm ạ." },
  ask_help_reach: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "Of course! Let me grab that bottle from the top shelf for you—here you go!", vi: "Tất nhiên rồi! Để mình lấy giúp bạn chai đó từ kệ trên cùng nhé — của bạn đây!" },
  pick_dishwashing_liquid: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "A single drop of that lemon dish soap cuts through grease on pans!", vi: "Chỉ một giọt nước rửa chén hương chanh đó là sạch bong dầu mỡ trên chảo!" },
  grab_kitchen_sponges: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "Those dual-sided sponges won't scratch your non-stick cookware.", vi: "Miếng bọt biển hai mặt đó không làm trầy xước chảo chống dính đâu ạ." },
  get_shampoo: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "That argan oil shampoo is sulfate-free and repairs dry hair.", vi: "Dầu gội tinh dầu argan đó không chứa sulfate và phục hồi tóc khô rất tốt." },
  get_toothpaste: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "Fresh mint fluoride toothpaste—and soft toothbrushes are right below it!", vi: "Kem đánh răng bạc hà tươi chứa fluoride — còn bàn chải lông mềm ở ngay kệ dưới nhé!" },
  choose_sunscreen_lotion: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "That SPF 50 sunscreen is lightweight, waterproof, and leaves no white cast.", vi: "Kem chống nắng SPF 50 đó mỏng nhẹ, chống nước và không để lại vệt trắng trên da." },
  pick_gentle_face_wash: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "Dermatologists love that foaming cleanser—it's 100% fragrance-free.", vi: "Các bác sĩ da liễu rất khuyên dùng sữa rửa mặt tạo bọt đó — 100% không hương liệu." },
  /* 10 more replies for new actions = 30 total NPC replies in market_meat */
  order_fresh_salmon: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Two thick center-cut Atlantic salmon fillets coming right up!", vi: "Hai khúc phi lê cá hồi Đại Tây Dương cắt giữa dày dặn có ngay đây!" },
  order_fresh_tiger_shrimp: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Four hundred grams of jumbo tiger shrimp—I'll pack a scoop of crushed ice in the bag!", vi: "Bốn trăm gam tôm sú loại lớn — mình bỏ kèm một muỗng đá bào vào túi để giữ lạnh nhé!" },
  weigh_meat_on_butcher_scale: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Five hundred and twenty grams on the digital scale—is that okay with you?", vi: "Năm trăm hai mươi gam trên cân điện tử — cỡ đó vừa ý bạn chứ?" },
  ask_butcher_wrap_in_paper: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "I always double-wrap fresh cuts in waxed butcher paper so nothing leaks.", vi: "Mình luôn bọc hai lớp giấy gói thịt tráng sáp để đảm bảo không bị rỉ nước." },
  watch_butcher_trim_fat: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "All trimmed! That pork loin is super lean and ready for roasting.", vi: "Đã lọc sạch mỡ thừa! Miếng thăn heo này giờ nạc mềm, sẵn sàng để quay hoặc áp chảo." },
  ask_butcher_cube_stew_beef: { who: "Butcher / Fishmonger", avatar: "🧑‍🍳", voice: "adult_male", anchor: "obj:meatcounter",
    en: "Evenly cubed on the butcher block! Simmer it with carrots and star anise.", vi: "Đã thái vuông đều tăm tắp trên thớt gỗ! Bạn đem hầm cùng cà rốt và hoa hồi là tuyệt cú mèo." },
  pick_extra_virgin_olive_oil: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "That Spanish extra-virgin olive oil is 15% off when you buy a bag of rice!", vi: "Chai dầu ô-liu nguyên chất Tây Ban Nha đó được giảm 15% khi bạn mua kèm bao gạo đấy!" },
  grab_stiff_scrub_brush: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "That beechwood scrub brush lasts for years and has a hanging loop.", vi: "Bàn chải cọ rửa cán gỗ dẻ gai đó bền hàng năm trời và có sẵn dây treo gọn gàng." },
  pick_laundry_detergent: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "That lavender fabric softener keeps towels fluffy and static-free.", vi: "Nước xả vải hương oải hương đó giữ cho khăn tắm luôn bông mềm và không bị tĩnh điện." },
  ask_staff_for_eco_cleaner: { who: "Household Aisle Staff", avatar: "🧑‍🔧", voice: "young_female", anchor: "obj:householdstaff",
    en: "Right here on the middle shelf—it's made with natural citrus oil and vinegar!", vi: "Ngay ở ngăn kệ giữa này ạ — dung dịch làm từ tinh dầu cam chanh tự nhiên và giấm!" }
};

/* =====================================================================
   ZONE 5: market_checkout — Quầy thu ngân & dịch vụ (Checkout & Customer Service)
   21 Objects (6 existing + 15 new) · 63 Actions (35 existing + 28 new) · 40 NPC Replies
   Style matches docs/ref/style-ref-2-market-checkout.png & style-ref-3
   ===================================================================== */
const checkoutShell = `
${sharedDefs}
<rect x="108" y="0" width="892" height="336" fill="url(#mkzWall)"/>
<polygon points="0,0 108,0 108,336 0,640" fill="url(#mkzLeftWall)"/>
<polygon points="108,336 1000,336 1000,640 0,640" fill="url(#mkzFloor)"/>
${D("floor-tiles", floorGrid)}
<rect x="0" y="0" width="1000" height="38" fill="url(#mkzSoffit)"/>
<rect x="108" y="38" width="892" height="10" fill="#e8832a"/>
<text x="540" y="25" font-size="14" font-weight="900" fill="#fff8dc" text-anchor="middle" letter-spacing="3">FRESH LIFE SUPERMARKET · CHECKOUT &amp; CUSTOMER SERVICE</text>
<!-- Industrial ceiling truss & hanging SALE % arrow banner (matching style-ref-2) -->
<g stroke="#10281e" stroke-width="2" opacity=".55">
  <path d="M120 38 L145 52 L170 38 L195 52 L220 38 L245 52 L270 38 L295 52 L320 38 L345 52 L370 38 L395 52 L420 38 L445 52 L470 38 L495 52 L520 38 L545 52 L570 38 L595 52 L620 38 L645 52 L670 38 L695 52 L720 38 L745 52 L770 38 L795 52 L820 38 L845 52 L870 38" fill="none"/>
</g>
<g>
  <line x1="270" y1="38" x2="270" y2="58" stroke="#334155" stroke-width="2.5"/>
  <line x1="400" y1="38" x2="400" y2="58" stroke="#334155" stroke-width="2.5"/>
  <rect x="245" y="56" width="180" height="38" rx="5" fill="#dc2626" stroke="#7f1d1d" stroke-width="2.2"/>
  <text x="304" y="81" text-anchor="middle" font-size="20" font-weight="900" fill="#fff8dc" letter-spacing="1.5">SALE</text>
  <circle cx="362" cy="75" r="12" fill="#fbbf24"/>
  <text x="362" y="80" text-anchor="middle" font-size="14" font-weight="900" fill="#7c2d12">%</text>
  <polygon points="384,68 400,68 400,63 412,75 400,87 400,82 384,82" fill="#fef08a"/>
</g>
${D("pendant-lights", pendantLamp(190, 62) + pendantLamp(460, 62) + pendantLamp(680, 62) + pendantLamp(880, 62))}
${D("zone-arrows", `
  <g transform="translate(118,52)">
    <rect x="0" y="0" width="118" height="24" rx="5" fill="#b45309" stroke="#fff" stroke-width="1.4"/>
    <text x="59" y="16" font-size="9.5" font-weight="800" fill="#fff" text-anchor="middle">⬅ MEAT &amp; AISLES</text>
  </g>
  <g transform="translate(500,52)">
    <rect x="0" y="0" width="164" height="24" rx="5" fill="#15803d" stroke="#fff" stroke-width="1.4"/>
    <text x="82" y="16" font-size="9.5" font-weight="800" fill="#fff" text-anchor="middle">CUSTOMER SERVICE</text>
  </g>
`)}
<path d="M210 538 H470" stroke="#f59e0b" stroke-width="3.5" stroke-dasharray="10 7" opacity=".75"/>
`;

const checkoutWorld = [
  /* 1. snacks — Wooden impulse snack & chips shelf on left (matching style-ref-2) */
  objG("snacks", "snack aisle", "kệ đồ ăn vặt", 390, 62, 118, `
    <rect class="hit" x="12" y="124" width="96" height="264"/>
    <ellipse cx="60" cy="390" rx="48" ry="8" fill="#000" opacity=".16"/>
    <rect x="14" y="128" width="92" height="256" rx="5" fill="url(#mkzWood)" stroke="#5c3a1b" stroke-width="2.5"/>
    <rect x="20" y="134" width="80" height="20" rx="3" fill="#ea580c"/>
    <text x="60" y="148" text-anchor="middle" font-size="8.5" font-weight="900" fill="#fff">SNACKS &amp; CHIPS</text>
    <rect x="18" y="196" width="84" height="6" fill="#5c3a1b"/>
    <rect x="18" y="254" width="84" height="6" fill="#5c3a1b"/>
    <rect x="18" y="312" width="84" height="6" fill="#5c3a1b"/>
    <rect x="18" y="370" width="84" height="6" fill="#5c3a1b"/>
    <g class="mk-chips">
      <rect x="22" y="162" width="20" height="32" rx="3" fill="#ef4444" stroke="#991b1b" stroke-width="1.4"/>
      <circle cx="32" cy="178" r="5" fill="#fde047"/>
    </g>
    <rect x="48" y="162" width="20" height="32" rx="3" fill="#f97316" stroke="#9a3412" stroke-width="1.4"/>
    <rect x="74" y="162" width="20" height="32" rx="3" fill="#22c55e" stroke="#166534" stroke-width="1.4"/>
    <rect x="22" y="220" width="22" height="32" rx="3" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.4"/>
    <rect x="49" y="220" width="22" height="32" rx="3" fill="#eab308" stroke="#a16207" stroke-width="1.4"/>
    <rect x="75" y="220" width="20" height="32" rx="3" fill="#ec4899" stroke="#9d174d" stroke-width="1.4"/>
    <rect x="22" y="280" width="22" height="30" rx="3" fill="#78350f" stroke="#451a03" stroke-width="1.4"/>
    <rect x="49" y="280" width="22" height="30" rx="3" fill="#9333ea" stroke="#581c87" stroke-width="1.4"/>
    <rect x="75" y="280" width="20" height="30" rx="3" fill="#b45309" stroke="#78350f" stroke-width="1.4"/>
    <rect x="24" y="336" width="20" height="32" rx="4" fill="#fbcfe8" stroke="#db2777" stroke-width="1.4"/>
    <rect x="49" y="336" width="20" height="32" rx="4" fill="#bfdbfe" stroke="#2563eb" stroke-width="1.4"/>
    <rect x="74" y="336" width="20" height="32" rx="4" fill="#fde047" stroke="#ca8a04" stroke-width="1.4"/>
  `),

  /* 2. candyrack — Impulse candy & chewing gum rack beside checkout */
  objG("candyrack", "candy & gum rack", "kệ kẹo và kẹo cao su", 412, 146, 214, `
    <rect class="hit" x="116" y="220" width="60" height="176"/>
    <ellipse cx="146" cy="396" rx="28" ry="6" fill="#000" opacity=".15"/>
    <rect x="120" y="224" width="52" height="168" rx="6" fill="#fff7ed" stroke="#c2410c" stroke-width="2.2"/>
    <rect x="124" y="228" width="44" height="16" rx="3" fill="#ea580c"/>
    <text x="146" y="239" text-anchor="middle" font-size="7.5" font-weight="900" fill="#fff">GUM &amp; MINTS</text>
    <rect x="126" y="250" width="16" height="22" rx="2" fill="#10b981" stroke="#047857" stroke-width="1.2"/>
    <rect x="146" y="250" width="18" height="22" rx="2" fill="#06b6d4" stroke="#0e7490" stroke-width="1.2"/>
    <line x1="123" y1="276" x2="169" y2="276" stroke="#9a3412" stroke-width="2"/>
    <rect x="126" y="282" width="17" height="20" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.2"/>
    <rect x="147" y="282" width="17" height="20" rx="4" fill="#ec4899" stroke="#be185d" stroke-width="1.2"/>
    <line x1="123" y1="306" x2="169" y2="306" stroke="#9a3412" stroke-width="2"/>
    <circle cx="135" cy="322" r="7" fill="#ef4444" stroke="#991b1b" stroke-width="1.2"/>
    <line x1="135" y1="329" x2="135" y2="342" stroke="#78350f" stroke-width="2"/>
    <circle cx="155" cy="322" r="7" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/>
    <line x1="155" y1="329" x2="155" y2="342" stroke="#78350f" stroke-width="2"/>
    <rect x="126" y="348" width="38" height="16" rx="3" fill="#a855f7" stroke="#6b21a8" stroke-width="1.2"/>
    <rect x="126" y="368" width="38" height="16" rx="3" fill="#eab308" stroke="#a16207" stroke-width="1.2"/>
  `),

  /* 3. magazineholder — Magazine & AA battery rack */
  objG("magazineholder", "magazine & battery rack", "kệ tạp chí & pin tiểu", 336, 146, 102, `
    <rect class="hit" x="116" y="106" width="60" height="98"/>
    <rect x="120" y="108" width="52" height="92" rx="5" fill="#fef3c7" stroke="#92400e" stroke-width="2.2"/>
    <rect x="124" y="112" width="44" height="14" rx="2" fill="#b45309"/>
    <text x="146" y="122" text-anchor="middle" font-size="7" font-weight="900" fill="#fff">MAGS · AA</text>
    <rect x="126" y="130" width="18" height="24" rx="2" fill="#f43f5e" stroke="#9f1239" stroke-width="1.2"/>
    <text x="135" y="142" text-anchor="middle" font-size="5.5" font-weight="900" fill="#fff">CHEF</text>
    <rect x="146" y="130" width="18" height="24" rx="2" fill="#0ea5e9" stroke="#0369a1" stroke-width="1.2"/>
    <text x="155" y="142" text-anchor="middle" font-size="5.5" font-weight="900" fill="#fff">LIFE</text>
    <rect x="126" y="160" width="18" height="32" rx="2" fill="#fde047" stroke="#b45309" stroke-width="1.2"/>
    <rect x="130" y="168" width="4" height="16" rx="1" fill="#dc2626"/>
    <rect x="136" y="168" width="4" height="16" rx="1" fill="#dc2626"/>
    <rect x="146" y="160" width="18" height="32" rx="2" fill="#bbf7d0" stroke="#15803d" stroke-width="1.2"/>
    <rect x="150" y="168" width="4" height="16" rx="1" fill="#2563eb"/>
    <rect x="156" y="168" width="4" height="16" rx="1" fill="#2563eb"/>
  `),

  /* 4. returnboard — Framed 7-Day Return Policy wall board (matching style-ref-3) */
  objG("returnboard", "return policy board", "bảng đổi trả hàng", 330, 238, 102, `
    <rect class="hit" x="182" y="106" width="112" height="78"/>
    <rect x="184" y="108" width="108" height="74" rx="6" fill="#fffbeb" stroke="#78350f" stroke-width="3"/>
    <rect x="190" y="114" width="96" height="16" rx="3" fill="#0284c7"/>
    <text x="238" y="125" text-anchor="middle" font-size="8" font-weight="900" fill="#fff">7-DAY RETURN POLICY</text>
    <text x="194" y="142" font-size="7.5" font-weight="800" fill="#1e293b">✓ Keep original receipt</text>
    <text x="194" y="155" font-size="7.5" font-weight="800" fill="#1e293b">✓ Unused / wrong size</text>
    <text x="194" y="168" font-size="7.5" font-weight="800" fill="#0369a1">✓ Instant refund / swap</text>
  `),

  /* 5. loyaltyboard — Framed VIP Loyalty Points wall board (matching style-ref-3) */
  objG("loyaltyboard", "member points board", "bảng điểm thưởng thẻ thành viên", 330, 358, 102, `
    <rect class="hit" x="300" y="106" width="116" height="78"/>
    <rect x="302" y="108" width="112" height="74" rx="6" fill="#fefce8" stroke="#78350f" stroke-width="3"/>
    <rect x="308" y="114" width="100" height="16" rx="3" fill="#16a34a"/>
    <text x="358" y="125" text-anchor="middle" font-size="8" font-weight="900" fill="#fff">VIP LOYALTY POINTS</text>
    <rect x="312" y="135" width="38" height="24" rx="4" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/>
    <text x="331" y="150" text-anchor="middle" font-size="8" font-weight="900" fill="#78350f">★ VIP</text>
    <text x="356" y="144" font-size="7.5" font-weight="900" fill="#14532d">100 pts = $5</text>
    <text x="356" y="157" font-size="7" font-weight="700" fill="#166534">Free signup!</text>
    <text x="358" y="173" text-anchor="middle" font-size="7" font-weight="800" fill="#b45309">Scan card at POS</text>
  `),

  /* 6. lostfoundbox — Lost & Found glass cabinet */
  objG("lostfoundbox", "lost & found box", "tủ đồ thất lạc", 332, 459, 102, `
    <rect class="hit" x="424" y="106" width="70" height="78"/>
    <rect x="426" y="108" width="66" height="74" rx="6" fill="#f8fafc" stroke="#334155" stroke-width="2.5"/>
    <rect x="431" y="113" width="56" height="15" rx="3" fill="#475569"/>
    <text x="459" y="124" text-anchor="middle" font-size="7" font-weight="900" fill="#fff">LOST &amp; FOUND</text>
    <rect x="433" y="132" width="52" height="42" rx="3" fill="#e0f2fe" stroke="#64748b" stroke-width="1.5"/>
    <path d="M444 168 V144 Q444 138 450 140" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="464" cy="148" r="5" fill="#eab308" stroke="#a16207" stroke-width="1.2"/>
    <rect x="462" y="153" width="4" height="11" rx="1" fill="#eab308"/>
    <rect x="472" y="146" width="9" height="16" rx="3" fill="#6366f1"/>
  `),

  /* 7. giftwrapdesk — Gift wrapping station with paper rolls & ribbons */
  objG("giftwrapdesk", "gift wrapping station", "quầy gói quà", 334, 540, 102, `
    <rect class="hit" x="500" y="106" width="80" height="84"/>
    <rect x="502" y="108" width="76" height="80" rx="6" fill="#fdf2f8" stroke="#9d174d" stroke-width="2.5"/>
    <rect x="507" y="113" width="66" height="15" rx="3" fill="#db2777"/>
    <text x="540" y="124" text-anchor="middle" font-size="7.5" font-weight="900" fill="#fff">GIFT WRAP 🎁</text>
    <rect x="512" y="134" width="12" height="28" rx="3" fill="#f43f5e" stroke="#9f1239" stroke-width="1.2"/>
    <rect x="528" y="134" width="12" height="28" rx="3" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2"/>
    <rect x="544" y="134" width="12" height="28" rx="3" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>
    <circle cx="564" cy="142" r="6" fill="#ec4899" stroke="#831843" stroke-width="1.5"/>
    <circle cx="564" cy="156" r="6" fill="#a855f7" stroke="#581c87" stroke-width="1.5"/>
    <rect x="514" y="166" width="52" height="16" rx="3" fill="#fbcfe8" stroke="#be185d" stroke-width="1.5"/>
    <text x="540" y="177" text-anchor="middle" font-size="6.8" font-weight="900" fill="#831843">FREE BOWS</text>
  `),

  /* 8. deliverydesk — Express Home Delivery Desk */
  objG("deliverydesk", "home delivery desk", "khu giao hàng", 334, 624, 102, `
    <rect class="hit" x="584" y="106" width="80" height="84"/>
    <rect x="586" y="108" width="76" height="80" rx="6" fill="#ecfdf5" stroke="#065f46" stroke-width="2.5"/>
    <rect x="591" y="113" width="66" height="15" rx="3" fill="#059669"/>
    <text x="624" y="124" text-anchor="middle" font-size="7.2" font-weight="900" fill="#fff">HOME DELIVERY</text>
    <rect x="598" y="136" width="32" height="18" rx="3" fill="#34d399" stroke="#047857" stroke-width="1.5"/>
    <path d="M630 141 H640 L645 148 V154 H630 Z" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
    <circle cx="607" cy="156" r="4" fill="#1e293b"/>
    <circle cx="636" cy="156" r="4" fill="#1e293b"/>
    <rect x="594" y="165" width="60" height="18" rx="3" fill="#d1fae5" stroke="#059669" stroke-width="1.2"/>
    <text x="624" y="177" text-anchor="middle" font-size="7" font-weight="900" fill="#065f46">2-HR EXPRESS</text>
  `),

  /* 9. servicedesk — Customer Service Counter & Agent */
  objG("servicedesk", "customer service desk", "quầy dịch vụ khách hàng", 408, 534, 212, `
    <rect class="hit" x="444" y="216" width="180" height="184"/>
    <ellipse cx="534" cy="396" rx="88" ry="10" fill="#000" opacity=".18"/>
    <g>
      <circle cx="524" cy="236" r="15" fill="#fde68a" stroke="#78350f" stroke-width="2"/>
      <path d="M509 232 Q524 214 539 232" fill="#1e293b"/>
      <circle cx="519" cy="236" r="2" fill="#1e293b"/>
      <circle cx="529" cy="236" r="2" fill="#1e293b"/>
      <path d="M519 243 Q524 247 529 243" fill="none" stroke="#78350f" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M504 276 Q507 252 524 252 Q541 252 544 276 Z" fill="#0284c7" stroke="#075985" stroke-width="2"/>
      <rect x="529" y="258" width="9" height="5" rx="1" fill="#fde047"/>
    </g>
    <rect x="448" y="272" width="172" height="120" rx="8" fill="#0ea5e9" stroke="#0369a1" stroke-width="2.8"/>
    <rect x="442" y="264" width="184" height="12" rx="4" fill="#f8fafc" stroke="#475569" stroke-width="2.2"/>
    <rect x="460" y="286" width="148" height="30" rx="5" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8"/>
    <text x="534" y="300" text-anchor="middle" font-size="9" font-weight="900" fill="#0c4a6e">CUSTOMER SERVICE DESK</text>
    <text x="534" y="311" text-anchor="middle" font-size="7" font-weight="800" fill="#0369a1">RETURNS · LOYALTY · PARKING</text>
    <rect x="564" y="242" width="32" height="22" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.8"/>
    <rect x="568" y="246" width="24" height="14" rx="2" fill="#38bdf8"/>
    <rect x="464" y="252" width="20" height="12" rx="2" fill="#ef4444" stroke="#991b1b" stroke-width="1.4"/>
    <rect x="462" y="324" width="144" height="56" rx="4" fill="#0284c7" opacity=".45"/>
  `),

  /* 10. checkout — Main Coral-Red Checkout Counter + Cashier + Metal Barrier Gate + Red Baskets (matching style-ref-2) */
  objG("checkout", "checkout counter & cashier", "quầy thu ngân", 516, 265, 250, `
    <rect class="hit" x="176" y="256" width="212" height="254"/>
    <ellipse cx="294" cy="502" rx="124" ry="15" fill="#000" opacity=".2"/>
    <!-- Cashier NPC in green cap & apron -->
    <g>
      <circle cx="250" cy="284" r="17" fill="#fde68a" stroke="#78350f" stroke-width="2"/>
      <path d="M232 278 Q250 260 268 278 Z" fill="#16a34a" stroke="#14532d" stroke-width="2"/>
      <path d="M246 277 H272 Q270 282 258 282 Z" fill="#15803d"/>
      <circle cx="245" cy="285" r="2" fill="#1e293b"/>
      <circle cx="256" cy="285" r="2" fill="#1e293b"/>
      <path d="M245 292 Q250 296 256 292" fill="none" stroke="#78350f" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M228 342 Q232 302 250 302 Q268 302 272 342 Z" fill="#16a34a" stroke="#14532d" stroke-width="2"/>
      <rect x="239" y="312" width="22" height="24" rx="3" fill="#fef08a" opacity=".9"/>
    </g>
    <!-- Metal lane barrier gate with red no-entry sign (style-ref-2) -->
    <g>
      <rect x="180" y="348" width="8" height="118" rx="3" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
      <rect x="186" y="360" width="50" height="58" rx="6" fill="none" stroke="#cbd5e1" stroke-width="4.5"/>
      <rect x="186" y="360" width="50" height="58" rx="6" fill="none" stroke="#475569" stroke-width="1.8"/>
      <circle cx="211" cy="389" r="16" fill="#dc2626" stroke="#fff" stroke-width="2.2"/>
      <rect x="200" y="385" width="22" height="7" rx="2" fill="#fff"/>
    </g>
    <!-- Coral-Red Checkout Counter Body (style-ref-2 & style-ref-3) -->
    <rect x="222" y="352" width="164" height="134" rx="6" fill="#ea580c" stroke="#7c2d12" stroke-width="2.8"/>
    <rect x="230" y="366" width="148" height="106" rx="4" fill="#f97316" stroke="#9a3412" stroke-width="2"/>
    <rect x="216" y="338" width="176" height="16" rx="4" fill="#e2e8f0" stroke="#475569" stroke-width="2.2"/>
    <rect x="240" y="382" width="44" height="44" rx="8" fill="#fff7ed" stroke="#9a3412" stroke-width="2.2"/>
    <text x="262" y="400" text-anchor="middle" font-size="8" font-weight="900" fill="#9a3412">LANE</text>
    <text x="262" y="419" text-anchor="middle" font-size="17" font-weight="900" fill="#dc2626">01</text>
    <!-- Stacked red shopping baskets in front of checkout (style-ref-2) -->
    <g>
      <polygon points="176,468 218,468 212,498 182,498" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
      <rect x="173" y="462" width="48" height="6" rx="2" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.6"/>
      <rect x="173" y="454" width="48" height="6" rx="2" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.6"/>
      <rect x="173" y="446" width="48" height="6" rx="2" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.6"/>
    </g>
    <g class="mk-lineDots" fill="#3b6ec2"><circle cx="204" cy="522" r="5"/><circle cx="222" cy="522" r="5"/></g>
  `),

  /* 11. conveyorbelt — Motorized checkout conveyor belt & divider bar (matching style-ref-2) */
  objG("conveyorbelt", "conveyor belt", "băng chuyền", 518, 286, 304, `
    <rect class="hit" x="218" y="308" width="142" height="36"/>
    <rect x="222" y="320" width="136" height="22" rx="10" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/>
    <circle cx="233" cy="331" r="6.5" fill="#94a3b8" stroke="#334155" stroke-width="1.8"/>
    <circle cx="347" cy="331" r="6.5" fill="#94a3b8" stroke="#334155" stroke-width="1.8"/>
    <line x1="250" y1="322" x2="246" y2="340" stroke="#475569" stroke-width="2"/>
    <line x1="274" y1="322" x2="270" y2="340" stroke="#475569" stroke-width="2"/>
    <line x1="298" y1="322" x2="294" y2="340" stroke="#475569" stroke-width="2"/>
    <line x1="322" y1="322" x2="318" y2="340" stroke="#475569" stroke-width="2"/>
    <rect x="234" y="311" width="44" height="9" rx="3" fill="#facc15" stroke="#a16207" stroke-width="1.4"/>
    <text x="256" y="318" text-anchor="middle" font-size="5.5" font-weight="900" fill="#713f12">DIVIDER</text>
    <g class="mk-onBelt">
      <rect x="286" y="302" width="14" height="20" rx="2" fill="#fff" stroke="#64748b" stroke-width="1.4"/>
      <circle cx="312" cy="312" r="7.5" fill="#ef4444"/>
      <path d="M324 318 Q334 300 346 318 Z" fill="#f59e0b"/>
    </g>
  `),

  /* 12. posscreen — Dark POS Monitor + Cyan Pole Price Display (matching style-ref-2) */
  objG("posscreen", "POS screen & price display", "màn hình POS & bảng giá", 519, 326, 212, `
    <rect class="hit" x="266" y="218" width="122" height="106"/>
    <!-- Cyan Customer Pole Display on left of monitor (style-ref-2) -->
    <rect x="294" y="256" width="6" height="64" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
    <rect x="268" y="224" width="58" height="34" rx="5" fill="#06b6d4" stroke="#0e7490" stroke-width="2.2"/>
    <rect x="273" y="229" width="48" height="24" rx="3" fill="#ecfeff"/>
    <text x="297" y="238" text-anchor="middle" font-size="6" font-weight="900" fill="#0e7490">TOTAL DUE</text>
    <text x="297" y="249" text-anchor="middle" font-size="9" font-weight="900" fill="#0f172a" class="mk-total">$12.40</text>
    <!-- Main Dark POS Touchscreen Monitor -->
    <rect x="350" y="298" width="10" height="24" fill="#334155" stroke="#0f172a" stroke-width="1.8"/>
    <rect x="338" y="318" width="34" height="6" rx="2" fill="#475569"/>
    <rect x="324" y="242" width="62" height="56" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="2.5"/>
    <rect x="329" y="247" width="52" height="42" rx="3" fill="#0f172a"/>
    <rect x="332" y="251" width="28" height="7" rx="1.5" fill="#22c55e"/>
    <rect x="332" y="261" width="44" height="5" rx="1" fill="#38bdf8" opacity=".8"/>
    <rect x="332" y="269" width="44" height="5" rx="1" fill="#38bdf8" opacity=".6"/>
    <rect x="332" y="277" width="26" height="7" rx="1.5" fill="#f59e0b"/>
  `),

  /* 13. cardreader — Contactless Card & Apple Pay / QR Terminal on stand (matching style-ref-3) */
  objG("cardreader", "card reader", "máy quẹt thẻ", 522, 404, 248, `
    <rect class="hit" x="380" y="252" width="48" height="86"/>
    <rect x="398" y="298" width="8" height="38" fill="#475569" stroke="#1e293b" stroke-width="1.6"/>
    <rect x="382" y="258" width="42" height="50" rx="6" fill="#334155" stroke="#0f172a" stroke-width="2.2"/>
    <rect x="387" y="263" width="32" height="18" rx="3" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2"/>
    <text x="403" y="275" text-anchor="middle" font-size="6.2" font-weight="900" fill="#0f172a">TAP / QR</text>
    <g fill="#e2e8f0">
      <rect x="389" y="285" width="7" height="4.5" rx="1"/>
      <rect x="399" y="285" width="7" height="4.5" rx="1"/>
      <rect x="409" y="285" width="7" height="4.5" rx="1"/>
      <rect x="389" y="292" width="7" height="4.5" rx="1"/>
      <rect x="399" y="292" width="7" height="4.5" rx="1"/>
      <rect x="409" y="292" width="7" height="4.5" rx="1"/>
    </g>
    <circle class="mk-paidLed" cx="403" cy="254" r="4" fill="#22c55e"/>
  `),

  /* 14. receiptprinter — Thermal Receipt Printer */
  objG("receiptprinter", "receipt printer", "máy in hóa đơn", 524, 315, 344, `
    <rect class="hit" x="290" y="338" width="50" height="56"/>
    <rect x="292" y="354" width="46" height="38" rx="5" fill="#f8fafc" stroke="#334155" stroke-width="2.2"/>
    <rect x="298" y="360" width="34" height="6" rx="2" fill="#0f172a"/>
    <circle cx="328" cy="379" r="3.5" fill="#22c55e"/>
    <text x="310" y="382" text-anchor="middle" font-size="6" font-weight="900" fill="#334155">RECEIPT</text>
    <path d="M303 360 V343 H327 V360 Z" fill="#fff" stroke="#64748b" stroke-width="1.4"/>
    <line x1="307" y1="348" x2="323" y2="348" stroke="#94a3b8" stroke-width="1.4"/>
    <line x1="307" y1="353" x2="320" y2="353" stroke="#94a3b8" stroke-width="1.4"/>
    <path class="mk-receiptOut" d="M301 360 V334 H329 V360 Z" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.8"/>
  `),

  /* 15. coindispenser — Automatic Coin & Change Dispenser */
  objG("coindispenser", "coin dispenser", "máy trả tiền thừa", 525, 366, 344, `
    <rect class="hit" x="342" y="348" width="48" height="50"/>
    <rect x="344" y="354" width="44" height="42" rx="5" fill="#cbd5e1" stroke="#334155" stroke-width="2.2"/>
    <rect x="350" y="359" width="32" height="11" rx="2" fill="#0f172a"/>
    <text x="366" y="367" text-anchor="middle" font-size="6.5" font-weight="900" fill="#4ade80">CHANGE</text>
    <path d="M350 376 H382 L378 392 H354 Z" fill="#475569" stroke="#1e293b" stroke-width="1.6"/>
    <circle cx="361" cy="384" r="4" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>
    <circle cx="370" cy="385" r="4" fill="#f59e0b" stroke="#92400e" stroke-width="1.2"/>
  `),

  /* 16. bags — Reusable Cloth & Recycled Paper Bag Stand */
  objG("bags", "shopping bags", "túi vải & túi giấy", 535, 336, 404, `
    <rect class="hit" x="290" y="406" width="92" height="78"/>
    <rect x="292" y="408" width="88" height="72" rx="6" fill="#fef3c7" stroke="#92400e" stroke-width="2.2"/>
    <rect x="298" y="413" width="76" height="13" rx="3" fill="#15803d"/>
    <text x="336" y="422" text-anchor="middle" font-size="7" font-weight="900" fill="#fff">ECO &amp; PAPER BAGS</text>
    <g class="mk-bagStack">
      <path d="M306 436 Q306 428 314 428 Q322 428 322 436" fill="none" stroke="#166534" stroke-width="2"/>
      <rect x="300" y="436" width="28" height="34" rx="4" fill="#22c55e" stroke="#14532d" stroke-width="1.8"/>
      <text x="314" y="456" text-anchor="middle" font-size="7" font-weight="900" fill="#fff">ECO</text>
      <path d="M344 436 Q344 428 352 428 Q360 428 360 436" fill="none" stroke="#78350f" stroke-width="2"/>
      <rect x="338" y="436" width="28" height="34" rx="3" fill="#d97706" stroke="#78350f" stroke-width="1.8"/>
      <text x="352" y="456" text-anchor="middle" font-size="6.2" font-weight="900" fill="#fffbeb">PAPER</text>
    </g>
    <g class="mk-packedBags">
      <rect x="318" y="428" width="36" height="44" rx="5" fill="#16a34a" stroke="#fff" stroke-width="2"/>
      <circle cx="328" cy="426" r="6" fill="#ef4444"/>
      <rect x="334" y="420" width="12" height="10" rx="2" fill="#fde047"/>
    </g>
  `),

  /* 17. packingtable — Bagging & Packing Table */
  objG("packingtable", "packing table", "bàn đóng gói", 538, 436, 404, `
    <rect class="hit" x="390" y="394" width="92" height="98"/>
    <ellipse cx="436" cy="490" rx="46" ry="9" fill="#000" opacity=".16"/>
    <rect x="396" y="418" width="80" height="68" rx="6" fill="#d97706" stroke="#78350f" stroke-width="2.5"/>
    <rect x="392" y="408" width="88" height="13" rx="4" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
    <rect x="404" y="430" width="64" height="17" rx="3" fill="#fef3c7" stroke="#92400e" stroke-width="1.4"/>
    <text x="436" y="441" text-anchor="middle" font-size="7" font-weight="900" fill="#78350f">PACKING TABLE</text>
    <rect x="406" y="392" width="24" height="17" rx="3" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/>
    <rect x="438" y="396" width="22" height="13" rx="3" fill="#38bdf8" stroke="#0369a1" stroke-width="1.6"/>
  `),

  /* 18. selfcheckout — Self-Checkout Kiosk with Weight Scale & Scanner */
  objG("selfcheckout", "self-checkout", "quầy tự thanh toán", 418, 696, 178, `
    <rect class="hit" x="646" y="170" width="100" height="240"/>
    <ellipse cx="696" cy="408" rx="48" ry="9" fill="#000" opacity=".18"/>
    <line x1="696" y1="170" x2="696" y2="196" stroke="#475569" stroke-width="4"/>
    <circle cx="696" cy="166" r="8" fill="#22c55e" stroke="#14532d" stroke-width="2"/>
    <rect x="654" y="196" width="84" height="206" rx="8" fill="#1e293b" stroke="#0f172a" stroke-width="2.8"/>
    <rect x="662" y="204" width="68" height="17" rx="3" fill="#2563eb"/>
    <text x="696" y="216" text-anchor="middle" font-size="7.8" font-weight="900" fill="#fff">SELF-CHECKOUT</text>
    <rect x="664" y="226" width="64" height="52" rx="5" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8"/>
    <text x="696" y="244" text-anchor="middle" font-size="8" font-weight="900" fill="#0369a1">SCAN &amp; PAY</text>
    <rect x="672" y="252" width="48" height="17" rx="3" fill="#22c55e"/>
    <text x="696" y="264" text-anchor="middle" font-size="7" font-weight="900" fill="#fff">START ➔</text>
    <path class="mk-scanTick" d="M686 244 l6 6 l12 -12" stroke="#16a34a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect x="668" y="286" width="56" height="20" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1.6"/>
    <line x1="674" y1="296" x2="718" y2="296" stroke="#ef4444" stroke-width="2.2"/>
    <rect x="648" y="314" width="96" height="14" rx="4" fill="#cbd5e1" stroke="#475569" stroke-width="1.8"/>
    <text x="696" y="324" text-anchor="middle" font-size="6.2" font-weight="900" fill="#1e293b">WEIGHT SCALE</text>
    <rect x="666" y="336" width="60" height="50" rx="4" fill="#334155" stroke="#475569" stroke-width="1.4"/>
  `),

  /* 19. cartreturnbay — Cart & Basket Return Bay */
  objG("cartreturnbay", "cart return bay", "thùng xe đẩy trả lại", 548, 672, 434, `
    <rect class="hit" x="614" y="436" width="116" height="86"/>
    <ellipse cx="672" cy="516" rx="56" ry="10" fill="#000" opacity=".18"/>
    <path d="M618 450 H726 V510 H618 Z" fill="rgba(226,232,240,.5)" stroke="#64748b" stroke-width="2.8"/>
    <rect x="624" y="440" width="96" height="15" rx="4" fill="#0284c7"/>
    <text x="672" y="451" text-anchor="middle" font-size="7.2" font-weight="900" fill="#fff">CART &amp; BASKET BAY</text>
    <rect x="628" y="462" width="44" height="30" rx="4" fill="none" stroke="#334155" stroke-width="2.2"/>
    <line x1="636" y1="462" x2="636" y2="492" stroke="#64748b" stroke-width="1.8"/>
    <line x1="650" y1="462" x2="650" y2="492" stroke="#64748b" stroke-width="1.8"/>
    <line x1="664" y1="462" x2="664" y2="492" stroke="#64748b" stroke-width="1.8"/>
    <circle cx="636" cy="500" r="5" fill="#1e293b"/>
    <circle cx="664" cy="500" r="5" fill="#1e293b"/>
    <polygon points="682,472 718,472 713,500 687,500" fill="#dc2626" stroke="#7f1d1d" stroke-width="1.8"/>
    <rect x="680" y="464" width="40" height="7" rx="2" fill="#ef4444" stroke="#7f1d1d" stroke-width="1.4"/>
  `),

  /* 20. securityguard — Security Guard NPC & Electronic Anti-Theft Gate */
  objG("securityguard", "security guard", "nhân viên bảo vệ", 460, 792, 260, `
    <rect class="hit" x="754" y="262" width="76" height="184"/>
    <ellipse cx="792" cy="440" rx="34" ry="8" fill="#000" opacity=".18"/>
    <!-- EAS Security Pedestal Gate -->
    <rect x="760" y="298" width="14" height="134" rx="5" fill="#e2e8f0" stroke="#475569" stroke-width="2.2"/>
    <rect x="763" y="318" width="8" height="90" rx="3" fill="#38bdf8" opacity=".55"/>
    <circle cx="767" cy="308" r="3.5" fill="#22c55e"/>
    <!-- Security Guard in navy uniform & peaked cap -->
    <circle cx="800" cy="288" r="15" fill="#fde68a" stroke="#78350f" stroke-width="2"/>
    <path d="M783 282 Q800 264 817 282 Z" fill="#1e3a8a" stroke="#172554" stroke-width="2"/>
    <rect x="783" y="280" width="34" height="4.5" rx="2" fill="#0f172a"/>
    <circle cx="800" cy="275" r="2.8" fill="#fbbf24"/>
    <circle cx="795" cy="289" r="2" fill="#1e293b"/>
    <circle cx="805" cy="289" r="2" fill="#1e293b"/>
    <path d="M795 296 Q800 300 805 296" fill="none" stroke="#78350f" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="783" y="306" width="34" height="64" rx="7" fill="#1e3a8a" stroke="#172554" stroke-width="2"/>
    <polygon points="800,314 795,326 805,326" fill="#dc2626"/>
    <circle cx="809" cy="322" r="4.5" fill="#fbbf24"/>
    <rect x="787" y="370" width="11" height="56" rx="4" fill="#0f172a"/>
    <rect x="802" y="370" width="11" height="56" rx="4" fill="#0f172a"/>
  `),

  /* 21. checkoutexit — Large Blue Glass Sliding Exit Doors on right (matching style-ref-2) */
  objG("checkoutexit", "glass exit door", "cửa kính lối ra", 425, 908, 108, `
    <rect class="hit" x="844" y="110" width="140" height="314"/>
    <rect x="848" y="114" width="132" height="304" rx="4" fill="#334155" stroke="#0f172a" stroke-width="3.2"/>
    <rect x="866" y="122" width="96" height="24" rx="4" fill="#16a34a" stroke="#dcfce7" stroke-width="1.8"/>
    <text x="914" y="138" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" letter-spacing="1">EXIT ➔</text>
    <rect x="880" y="150" width="68" height="8" rx="3" fill="#0f172a"/>
    <circle cx="914" cy="154" r="2.5" fill="#22c55e"/>
    <rect x="856" y="162" width="55" height="248" fill="url(#mkzGlass)" stroke="#475569" stroke-width="2"/>
    <rect x="915" y="162" width="55" height="248" fill="url(#mkzGlass)" stroke="#475569" stroke-width="2"/>
    <path d="M864 190 L902 168 M864 220 L905 196 M923 198 L961 176 M923 228 L964 204" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>
    <rect x="858" y="276" width="51" height="10" fill="#38bdf8" opacity=".65"/>
    <rect x="917" y="276" width="51" height="10" fill="#38bdf8" opacity=".65"/>
    <text x="914" y="394" text-anchor="middle" font-size="8.5" font-weight="900" fill="#0c4a6e">THANK YOU!</text>
  `)
].join("\n");

const checkoutObjects = {
  snacks: S.allObjects.snacks,
  checkout: S.allObjects.checkout,
  cardreader: { ...S.allObjects.cardreader, acts: [...S.allObjects.cardreader.acts, "ask_apple_pay", "scan_qr_code_to_pay"] },
  bags: { ...S.allObjects.bags, acts: [...S.allObjects.bags.acts, "ask_for_a_bag_please", "choose_recycled_paper_bag"] },
  selfcheckout: S.allObjects.selfcheckout,
  servicedesk: { ...S.allObjects.servicedesk, acts: [...S.allObjects.servicedesk.acts, "validate_parking_ticket_at_desk"] },
  conveyorbelt: { en: "conveyor belt", vi: "băng chuyền", ipa: "/kənˈveɪ.ər belt/", acts: ["place_checkout_divider_bar", "load_groceries_onto_belt"] },
  candyrack: { en: "candy & gum rack", vi: "kệ kẹo và kẹo cao su", ipa: "/ˈkæn.di ənd ɡʌm ræk/", acts: ["grab_mint_chewing_gum", "pick_tin_of_breath_mints"] },
  magazineholder: { en: "magazine & battery rack", vi: "kệ tạp chí & pin tiểu", ipa: "/ˌmæɡ.əˈziːn ræk/", acts: ["browse_cooking_magazine", "grab_aa_batteries_pack"] },
  returnboard: { en: "return policy board", vi: "bảng đổi trả hàng", ipa: "/rɪˈtɜːn ˈpɑl.ə.si bɔːd/", acts: ["read_return_policy_board", "return_wrong_size_item"] },
  loyaltyboard: { en: "member points board", vi: "bảng điểm thưởng thẻ thành viên", ipa: "/ˈmem.bər pɔɪnts bɔːd/", acts: ["ask_to_use_loyalty_points", "sign_up_for_member_card"] },
  lostfoundbox: { en: "lost & found cabinet", vi: "tủ đồ thất lạc", ipa: "/lɑst ənd faʊnd/", acts: ["check_lost_and_found_cabinet"] },
  giftwrapdesk: { en: "gift wrapping station", vi: "quầy gói quà", ipa: "/ɡɪft ˈræp.ɪŋ ˈsteɪ.ʃən/", acts: ["ask_for_free_gift_wrapping", "choose_pink_satin_ribbon"] },
  deliverydesk: { en: "home delivery desk", vi: "khu giao hàng", ipa: "/hoʊm dɪˈlɪv.ər.i desk/", acts: ["ask_home_delivery_apartment", "book_evening_delivery_slot"] },
  posscreen: { en: "POS screen & price display", vi: "màn hình POS & bảng giá", ipa: "/praɪs dɪˈspleɪ/", acts: ["check_running_total_on_pos"] },
  receiptprinter: { en: "receipt printer", vi: "máy in hóa đơn", ipa: "/rɪˈsiːt ˈprɪn.tər/", acts: ["ask_for_vat_tax_invoice"] },
  coindispenser: { en: "coin dispenser", vi: "máy trả tiền thừa", ipa: "/kɔɪn dɪˈspen.sər/", acts: ["collect_coins_from_dispenser"] },
  packingtable: { en: "packing table", vi: "bàn đóng gói", ipa: "/ˈpæk.ɪŋ ˈteɪ.bəl/", acts: ["sort_groceries_on_packing_table"] },
  cartreturnbay: { en: "cart return bay", vi: "thùng xe đẩy trả lại", ipa: "/kɑːt rɪˈtɜːn beɪ/", acts: ["return_basket_to_cart_bay"] },
  securityguard: { en: "security guard", vi: "nhân viên bảo vệ", ipa: "/sɪˈkjʊr.rə.ti ɡɑːd/", acts: ["show_receipt_to_security_guard"] },
  checkoutexit: { en: "glass exit door", vi: "cửa ra", ipa: "/ɡlɑːs ˈek.sɪt dɔːr/", acts: ["walk_out_sliding_exit_door"] }
};

const checkoutNewActions = [
  /* 5 Required Natural Sentences from Prompt */
  mkA("ask_apple_pay", "cardreader", "Ask about Apple Pay", "Hỏi thanh toán bằng Apple Pay",
    "Do you take Apple Pay?",
    "Quầy mình có nhận thanh toán Apple Pay không ạ?",
    ["Do you take", "Apple Pay"], ["applepay", "card"],
    "<b>Do you take + phương thức thanh toán?</b> = Quầy/Cửa hàng có nhận … không? (rất tự nhiên khi hỏi thu ngân).",
    ["Do you take", "Apple Pay?"], ["take", "make", "bake"],
    ["<b>Do you take</b> Apple Pay or Google Pay?", "Just tap your phone on the <b>card reader</b>."],
    once("mkc_applepay", "yes", "Bạn đã hỏi và thanh toán qua Apple Pay rồi."),
    at("mk_reader", "reach", 750, [["mkc_applepay", "yes"], ["mk_paid", "yes"]]),
    ["ask if they take Apple Pay", "pay with Apple Pay at the card reader", "hỏi thanh toán bằng Apple Pay"]),

  mkA("ask_for_a_bag_please", "bags", "Politely ask for a bag", "Xin một chiếc túi đựng đồ",
    "Could I get a bag, please?",
    "Cho mình xin một chiếc túi đựng đồ nhé?",
    ["Could I get", "bag"], ["bag", "ecobag"],
    "<b>Could I get a …, please?</b> = Cho mình lấy/xin một … nhé? (cách hỏi lịch sự, tự nhiên ở quầy thu ngân).",
    ["Could I get a bag,", "please?"], ["bag", "back", "pack"],
    ["<b>Could I get</b> a paper <b>bag</b>, please?", "Would you like a reusable <b>eco bag</b>?"],
    once("mkc_getbag", "yes", "Bạn đã xin túi đựng đồ tại quầy rồi."),
    at("mk_bags", "reach", 750, [["mkc_getbag", "yes"], ["mk_bag", "have"]]),
    ["ask for a bag, please", "politely ask the cashier for a bag", "xin một chiếc túi đựng đồ"]),

  mkA("return_wrong_size_item", "returnboard", "Return a wrong-size item", "Đổi trả món hàng bị lệch cỡ",
    "I'd like to return this—it's the wrong size.",
    "Mình muốn trả lại món này — nó bị lệch cỡ mất rồi.",
    ["return this", "wrong size"], ["return", "policy"],
    "<b>I'd like to return this — it's the wrong size.</b> = Mình muốn trả lại món này vì bị sai kích cỡ.",
    ["I'd like to return this—", "it's the wrong size."], ["size", "side", "sign"],
    ["<b>I'd like to return</b> this shirt—it's the wrong size.", "Please check our 7-day <b>return policy</b>."],
    once("mkc_wrongsize", "yes", "Bạn đã báo đổi trả món đồ lệch cỡ rồi."),
    at("mkc_return", "point", 800, [["mkc_wrongsize", "yes"], ["mk_returned", "yes"]]),
    ["return an item because it's the wrong size", "tell customer service it's the wrong size", "đổi trả món hàng bị lệch cỡ"]),

  mkA("ask_to_use_loyalty_points", "loyaltyboard", "Ask to use member points", "Hỏi dùng điểm tích lũy",
    "Can I use my points?",
    "Mình dùng điểm thưởng tích lũy được không?",
    ["Can I use", "points"], ["points", "member"],
    "<b>Can I use my points?</b> = Mình dùng điểm tích lũy để trừ tiền được không?",
    ["Can I use", "my points?"], ["points", "coins", "joins"],
    ["<b>Can I use</b> my loyalty <b>points</b> today?", "Scan your <b>member card</b> to earn points."],
    once("mkc_usepoints", "yes", "Bạn đã hỏi dùng điểm thưởng thành viên rồi."),
    at("mkc_loyalty", "point", 750, [["mkc_usepoints", "yes"], ["mk_points", "yes"]]),
    ["ask to use loyalty points", "redeem member points at checkout", "hỏi dùng điểm tích lũy"]),

  mkA("ask_home_delivery_apartment", "deliverydesk", "Ask for apartment delivery", "Nhờ giao hàng tới căn hộ",
    "Could you deliver this to my apartment?",
    "Siêu thị có thể giao chỗ đồ này tới căn hộ của mình được không?",
    ["deliver this", "apartment"], ["deliver", "timeslot"],
    "<b>Could you deliver this to …?</b> = Bạn có thể giao chỗ đồ này tới … được không?",
    ["Could you deliver this", "to my apartment?"], ["deliver", "discover", "recover"],
    ["<b>Could you deliver</b> these heavy bags to my apartment?", "Choose a convenient <b>delivery slot</b>."],
    once("mkc_deliver", "yes", "Bạn đã đăng ký giao hàng tới căn hộ rồi."),
    at("mkc_delivery", "point", 800, [["mkc_deliver", "yes"], ["mk_delivery", "yes"]]),
    ["ask for delivery to my apartment", "arrange apartment delivery for groceries", "nhờ giao hàng tới căn hộ"]),

  /* 23 Additional Rich Actions covering all 15 new objects */
  mkA("place_checkout_divider_bar", "conveyorbelt", "Place the checkout divider", "Đặt thanh ngăn trên băng chuyền",
    "Let me put the checkout divider behind my groceries.",
    "Để mình đặt thanh ngăn phân cách phía sau đồ của mình.",
    ["checkout divider", "behind"], ["divider", "belt"],
    "<b>put the checkout divider behind …</b> = đặt thanh phân cách đơn hàng phía sau đồ của mình.",
    ["Let me put the checkout divider", "behind my groceries."], ["behind", "beside", "before"],
    ["Place the <b>checkout divider</b> on the <b>conveyor belt</b>.", "That separates our order from the next customer."],
    once("mkc_divider", "yes", "Bạn đã đặt thanh ngăn trên băng chuyền rồi."),
    at("mkc_belt", "reach", 750, [["mkc_divider", "yes"], ["mk_divider", "yes"]]),
    ["place the checkout divider", "put the divider bar behind my groceries", "đặt thanh ngăn trên băng chuyền"]),

  mkA("load_groceries_onto_belt", "conveyorbelt", "Load items onto the belt", "Xếp đồ lên băng chuyền",
    "I'm unloading my basket onto the moving conveyor belt.",
    "Mình đang xếp đồ từ trong giỏ lên băng chuyền thu ngân.",
    ["unloading", "conveyor belt"], ["belt", "basket"],
    "<b>unload … onto the conveyor belt</b> = dỡ/xếp hàng từ giỏ lên băng chuyền.",
    ["I'm unloading my basket", "onto the moving conveyor belt."], ["belt", "bell", "felt"],
    ["Line your items up on the <b>conveyor belt</b>.", "Stack the empty <b>basket</b> below the counter."],
    once("mkc_beltmove", "yes", "Bạn đã xếp đồ lên băng chuyền rồi."),
    at("mkc_belt", "reach", 800, [["mkc_beltmove", "yes"], ["mk_counter", "yes"]]),
    ["load items onto the belt", "unload my basket onto the conveyor belt", "xếp đồ lên băng chuyền"]),

  mkA("check_running_total_on_pos", "posscreen", "Watch the price display", "Theo dõi màn hình hiển thị giá",
    "I'm watching the running total on the customer price display.",
    "Mình đang theo dõi tổng tiền tạm tính trên màn hình hiển thị giá.",
    ["running total", "price display"], ["display", "price"],
    "<b>running total</b> = tổng tiền tạm tính cộng dồn khi thu ngân quét từng món.",
    ["I'm watching the running total", "on the customer price display."], ["display", "delay", "replay"],
    ["Check the <b>price display</b> as each item is scanned.", "The screen shows the discount <b>price</b>."],
    once("mkc_poscheck", "yes", "Bạn đã xem tổng tiền trên màn hình POS rồi."),
    at("mkc_pos", "read", 750, [["mkc_poscheck", "yes"]]),
    ["watch the price display", "check the running total on the POS screen", "theo dõi màn hình hiển thị giá"]),

  mkA("scan_qr_code_to_pay", "cardreader", "Scan the QR code to pay", "Quét mã QR bằng ứng dụng ngân hàng",
    "Can I scan the QR code on the terminal with my banking app?",
    "Mình quét mã QR trên máy POS bằng ứng dụng ngân hàng được không?",
    ["scan", "QR code"], ["qr", "scan"],
    "<b>scan the QR code with my banking app</b> = quét mã QR bằng ứng dụng ngân hàng trên điện thoại.",
    ["Can I scan the QR code on the terminal", "with my banking app?"], ["scan", "plan", "span"],
    ["<b>Scan</b> the <b>QR code</b> on the screen to pay.", "The payment went through immediately!"],
    once("mkc_qrpay", "yes", "Bạn đã quét mã QR thanh toán rồi."),
    at("mk_reader", "reach", 750, [["mkc_qrpay", "yes"], ["mk_paid", "yes"]]),
    ["scan the QR code to pay", "pay by scanning the QR code with my banking app", "quét mã QR bằng ứng dụng ngân hàng"]),

  mkA("ask_for_vat_tax_invoice", "receiptprinter", "Request a VAT tax receipt", "Nhờ in hóa đơn thuế VAT",
    "Could the receipt printer print a VAT invoice for my company?",
    "Máy in hóa đơn có thể in giúp mình hóa đơn VAT cho công ty được không?",
    ["receipt printer", "VAT invoice"], ["printer", "receipt"],
    "<b>print a VAT invoice</b> = xuất/in hóa đơn đỏ thuế giá trị gia tăng.",
    ["Could the receipt printer", "print a VAT invoice for my company?"], ["print", "point", "paint"],
    ["Take your <b>receipt</b> from the thermal <b>receipt printer</b>.", "Keep the invoice for your records."],
    once("mkc_taxinvoice", "yes", "Bạn đã lấy hóa đơn thuế VAT từ máy in rồi."),
    at("mkc_printer", "reach", 750, [["mkc_taxinvoice", "yes"], ["mk_receipt", "yes"]]),
    ["request a VAT tax receipt", "ask for a printed VAT invoice", "nhờ in hóa đơn thuế VAT"]),

  mkA("collect_coins_from_dispenser", "coindispenser", "Collect change from the cup", "Lấy tiền xu thừa từ khay tự động",
    "I'll scoop my coins out of the automatic change dispenser.",
    "Mình sẽ lấy tiền xu lẻ từ khay máy trả tiền thừa tự động.",
    ["coins", "change"], ["change", "cash"],
    "<b>scoop … out of …</b> = vét/nhặt tiền xu ra khỏi khay đựng tiền thừa.",
    ["I'll scoop my coins", "out of the automatic change dispenser."], ["change", "charge", "chance"],
    ["Don't forget your <b>change</b> in the dispenser cup!", "Pay with <b>cash</b> or contactless card."],
    once("mkc_coins", "yes", "Bạn đã lấy tiền xu lẻ từ máy trả tiền thừa rồi."),
    at("mkc_coins", "reach", 750, [["mkc_coins", "yes"]]),
    ["collect change from the cup", "take my coins from the automatic change dispenser", "lấy tiền xu thừa từ khay tự động"]),

  mkA("grab_mint_chewing_gum", "candyrack", "Grab a pack of mint gum", "Lấy một phong kẹo cao su bạc hà",
    "I'll grab a pack of sugar-free chewing gum while waiting in line.",
    "Mình sẽ lấy thêm một phong kẹo cao su không đường trong lúc chờ thanh toán.",
    ["pack of", "chewing gum"], ["gum", "queue"],
    "<b>sugar-free chewing gum</b> = kẹo cao su không đường; <b>while waiting in line</b> = trong lúc xếp hàng chờ.",
    ["I'll grab a pack of sugar-free chewing gum", "while waiting in line."], ["gum", "game", "come"],
    ["Pick up a pack of mint <b>chewing gum</b> by the register.", "We are <b>waiting in line</b> at Lane 1."],
    once("mkc_gum", "yes", "Bạn đã lấy phong kẹo cao su bạc hà rồi."),
    at("mkc_candy", "reach", 750, [["mkc_gum", "yes"]]),
    ["grab a pack of mint gum", "pick up sugar-free chewing gum at checkout", "lấy một phong kẹo cao su bạc hà"]),

  mkA("pick_tin_of_breath_mints", "candyrack", "Pick a tin of breath mints", "Lấy một hộp kẹo ngậm thơm miệng",
    "Let me toss a small tin of peppermint breath mints into my basket.",
    "Để mình bỏ thêm một hộp thiếc nhỏ kẹo bạc hà thơm miệng vào giỏ.",
    ["tin of", "breath mints"], ["mint", "basket"],
    "<b>a tin of breath mints</b> = một hộp thiếc đựng kẹo ngậm thơm miệng.",
    ["Let me toss a small tin", "of peppermint breath mints into my basket."], ["mint", "mind", "mine"],
    ["Keep a tin of <b>breath mints</b> in your bag.", "Put it right in your shopping <b>basket</b>."],
    once("mkc_mints", "yes", "Bạn đã lấy hộp kẹo ngậm bạc hà rồi."),
    at("mkc_candy", "reach", 750, [["mkc_mints", "yes"]]),
    ["pick a tin of breath mints", "toss a tin of peppermint mints into my basket", "lấy một hộp kẹo ngậm thơm miệng"]),

  mkA("browse_cooking_magazine", "magazineholder", "Flip through a cooking magazine", "Lật xem tạp chí ẩm thực đầu quầy",
    "I'm flipping through a cooking magazine while the line moves forward.",
    "Mình đang lật xem cuốn tạp chí ẩm thực trong lúc hàng người nhích dần lên.",
    ["flipping through", "cooking magazine"], ["magazine", "line"],
    "<b>flip through a magazine</b> = lật giở xem nhanh một cuốn tạp chí.",
    ["I'm flipping through a cooking magazine", "while the line moves forward."], ["line", "fine", "nine"],
    ["This <b>cooking magazine</b> has great pasta recipes.", "The checkout <b>line</b> is moving quickly."],
    once("mkc_magazine", "yes", "Bạn đã xem tạp chí ẩm thực trên kệ rồi."),
    at("mkc_mag", "read", 750, [["mkc_magazine", "yes"]]),
    ["flip through a cooking magazine", "browse the cooking magazine by the checkout", "lật xem tạp chí ẩm thực đầu quầy"]),

  mkA("grab_aa_batteries_pack", "magazineholder", "Grab a pack of AA batteries", "Lấy vỉ pin tiểu AA",
    "Good thing I spotted these AA batteries—our TV remote needs them!",
    "May quá nhìn thấy vỉ pin tiểu AA này — điều khiển tivi ở nhà đang hết pin!",
    ["Good thing", "AA batteries"], ["battery", "need"],
    "<b>Good thing + mệnh đề!</b> = May quá / May mà …! (khi sực nhớ ra món đồ cần mua).",
    ["Good thing I spotted these AA batteries—", "our TV remote needs them!"], ["need", "near", "neat"],
    ["Grab a four-pack of <b>AA batteries</b> from the rack.", "We <b>need</b> new batteries for the wall clock."],
    once("mkc_batteries", "yes", "Bạn đã lấy vỉ pin tiểu AA rồi."),
    at("mkc_mag", "reach", 750, [["mkc_batteries", "yes"]]),
    ["grab a pack of AA batteries", "pick up AA batteries for the remote", "lấy vỉ pin tiểu AA"]),

  mkA("read_return_policy_board", "returnboard", "Read the 7-day return policy", "Đọc bảng quy định đổi trả 7 ngày",
    "The board says we can exchange any unopened item within seven days.",
    "Bảng thông báo ghi rằng khách được đổi trả hàng chưa mở trong vòng 7 ngày.",
    ["exchange", "seven days"], ["policy", "receipt"],
    "<b>within seven days</b> = trong vòng 7 ngày kể từ ngày mua trên hóa đơn.",
    ["The board says we can exchange", "any unopened item within seven days."], ["seven", "even", "eleven"],
    ["Read the 7-day <b>return policy</b> on the wall.", "Always keep your original <b>receipt</b>."],
    once("mkc_policy", "yes", "Bạn đã đọc bảng quy định đổi trả hàng rồi."),
    at("mkc_return", "read", 750, [["mkc_policy", "yes"]]),
    ["read the 7-day return policy", "check the store return policy board", "đọc bảng quy định đổi trả 7 ngày"]),

  mkA("sign_up_for_member_card", "loyaltyboard", "Check the VIP points chart", "Xem bảng quy đổi điểm VIP",
    "Every hundred loyalty points takes five dollars right off our bill!",
    "Cứ mỗi 100 điểm thưởng tích lũy sẽ được trừ thẳng 5 đô-la vào hóa đơn!",
    ["loyalty points", "five dollars"], ["points", "loyalty"],
    "<b>take $5 off the bill</b> = giảm/trừ trực tiếp 5 đô-la vào tổng hóa đơn.",
    ["Every hundred loyalty points", "takes five dollars right off our bill!"], ["bill", "bell", "ball"],
    ["Earn <b>loyalty points</b> every time you shop.", "Show your <b>loyalty card</b> at the register."],
    once("mkc_loyaltycard", "yes", "Bạn đã xem bảng quy đổi điểm VIP rồi."),
    at("mkc_loyalty", "read", 750, [["mkc_loyaltycard", "yes"]]),
    ["check the VIP points chart", "see how loyalty points convert into a discount", "xem bảng quy đổi điểm VIP"]),

  mkA("check_lost_and_found_cabinet", "lostfoundbox", "Check the Lost & Found box", "Hỏi tìm đồ để quên ở tủ thất lạc",
    "Excuse me, did anyone turn in a red umbrella at Lost and Found?",
    "Xin lỗi, có ai nhặt được chiếc ô màu đỏ gửi ở tủ Đồ thất lạc không ạ?",
    ["turn in", "Lost and Found"], ["lost", "umbrella"],
    "<b>turn in … at Lost and Found</b> = nhặt được và gửi lại đồ thất lạc tại quầy.",
    ["Excuse me, did anyone turn in", "a red umbrella at Lost and Found?"], ["lost", "last", "list"],
    ["Check the <b>lost and found</b> cabinet by the service desk.", "That's my red <b>umbrella</b> inside!"],
    once("mkc_lostfound", "yes", "Bạn đã kiểm tra tủ Đồ thất lạc rồi."),
    at("mkc_lost", "point", 800, [["mkc_lostfound", "yes"]]),
    ["check the Lost & Found box", "ask if anyone turned in a red umbrella", "hỏi tìm đồ để quên ở tủ thất lạc"]),

  mkA("ask_for_free_gift_wrapping", "giftwrapdesk", "Wrap a box at Gift Wrap", "Nhờ gói hộp quà miễn phí",
    "Could you wrap this cookie tin in birthday gift wrap, please?",
    "Bạn bọc giúp mình hộp bánh quy này bằng giấy gói quà sinh nhật nhé?",
    ["wrap", "gift wrap"], ["giftwrap", "birthday"],
    "<b>wrap … in birthday gift wrap</b> = bọc món đồ bằng giấy gói quà sinh nhật.",
    ["Could you wrap this cookie tin", "in birthday gift wrap, please?"], ["wrap", "map", "tap"],
    ["Choose your favorite <b>gift wrap</b> roll at the station.", "It's a <b>birthday</b> present for my friend."],
    once("mkc_giftwrap", "yes", "Bạn đã nhờ gói hộp quà sinh nhật rồi."),
    at("mkc_gift", "reach", 800, [["mkc_giftwrap", "yes"], ["mk_giftwrap", "yes"]]),
    ["wrap a box at Gift Wrap", "ask to wrap the tin in birthday gift wrap", "nhờ gói hộp quà miễn phí"]),

  mkA("choose_pink_satin_ribbon", "giftwrapdesk", "Pick a pink satin ribbon", "Chọn dây ruy-băng lụa hồng",
    "Let's tie a glossy pink satin ribbon and bow on top of the box.",
    "Hãy thắt thêm một dải ruy-băng lụa màu hồng và chiếc nơ lên trên hộp quà nhé.",
    ["satin ribbon", "bow"], ["ribbon", "giftwrap"],
    "<b>tie a satin ribbon on top</b> = thắt một dải ruy-băng lụa lên phía trên hộp quà.",
    ["Let's tie a glossy pink satin ribbon", "and bow on top of the box."], ["ribbon", "reason", "season"],
    ["Add a pink <b>satin ribbon</b> to the gift box.", "Complimentary <b>gift wrap</b> is available here."],
    once("mkc_ribbon", "yes", "Bạn đã chọn dây ruy-băng lụa hồng rồi."),
    at("mkc_gift", "reach", 750, [["mkc_ribbon", "yes"]]),
    ["pick a pink satin ribbon", "tie a pink satin ribbon bow on top", "chọn dây ruy-băng lụa hồng"]),

  mkA("book_evening_delivery_slot", "deliverydesk", "Book the 6 PM delivery slot", "Đặt khung giờ giao hàng 6 giờ tối",
    "I'd like to book the six o'clock evening delivery slot, please.",
    "Cho mình đặt khung giờ giao hàng lúc 6 giờ tối nhé.",
    ["book", "delivery slot"], ["timeslot", "deliver"],
    "<b>book a delivery slot</b> = đặt trước khung giờ giao hàng tận nhà.",
    ["I'd like to book", "the six o'clock evening delivery slot, please."], ["slot", "spot", "shop"],
    ["Reserve the 6 PM <b>delivery slot</b> at the desk.", "Our van will <b>deliver</b> right on time."],
    once("mkc_timeslot", "yes", "Bạn đã đặt khung giờ giao hàng 6 giờ tối rồi."),
    at("mkc_delivery", "point", 750, [["mkc_timeslot", "yes"]]),
    ["book the 6 PM delivery slot", "reserve an evening home delivery slot", "đặt khung giờ giao hàng 6 giờ tối"]),

  mkA("choose_recycled_paper_bag", "bags", "Take a recycled paper bag", "Chọn túi giấy tái chế",
    "I'll take a sturdy recycled paper bag instead of plastic.",
    "Mình sẽ lấy một chiếc túi giấy tái chế chắc chắn thay vì túi ni-lông.",
    ["recycled", "paper bag"], ["paperbag", "sturdy"],
    "<b>instead of + danh từ</b> = thay vì dùng … (instead of plastic = thay vì túi nhựa).",
    ["I'll take a sturdy recycled paper bag", "instead of plastic."], ["paper", "pepper", "proper"],
    ["Fold the <b>paper bag</b> neatly when you get home.", "These brown kraft handles are very <b>sturdy</b>."],
    once("mkc_paperbag", "yes", "Bạn đã lấy túi giấy tái chế rồi."),
    at("mk_bags", "reach", 750, [["mkc_paperbag", "yes"], ["mk_bag", "have"]]),
    ["take a recycled paper bag", "choose a paper bag instead of plastic", "chọn túi giấy tái chế"]),

  mkA("sort_groceries_on_packing_table", "packingtable", "Sort bags on the packing table", "Sắp xếp đồ trên bàn đóng gói",
    "At the packing table, I put heavy bottles at the bottom and bread on top.",
    "Tại bàn đóng gói, mình xếp chai lọ nặng ở dưới đáy và bánh mì mềm lên trên.",
    ["packing table", "heavy"], ["packtable", "heavy"],
    "<b>at the bottom / on top</b> = ở dưới đáy túi / ở phía trên cùng để không bị dập.",
    ["At the packing table, I put heavy bottles", "at the bottom and bread on top."], ["heavy", "happy", "ready"],
    ["Organize your bags on the wide <b>packing table</b>.", "Put <b>heavy</b> cartons at the bottom."],
    once("mkc_packtable", "yes", "Bạn đã sắp xếp túi đồ tại bàn đóng gói rồi."),
    at("mkc_pack", "reach", 800, [["mkc_packtable", "yes"]]),
    ["sort bags on the packing table", "put heavy bottles at the bottom on the packing table", "sắp xếp đồ trên bàn đóng gói"]),

  mkA("validate_parking_ticket_at_desk", "servicedesk", "Validate my parking ticket", "Đóng dấu miễn phí vé gửi xe",
    "Could you stamp my parking ticket with this grocery receipt, please?",
    "Nhân viên đóng dấu vé gửi xe kèm hóa đơn mua hàng này giúp mình nhé?",
    ["stamp", "receipt"], ["receipt", "help"],
    "<b>stamp / validate a parking ticket</b> = đóng dấu xác nhận miễn phí gửi xe cho khách mua hàng.",
    ["Could you stamp my parking ticket", "with this grocery receipt, please?"], ["stamp", "stand", "start"],
    ["Show your <b>receipt</b> for two hours of free parking.", "The staff at the desk will gladly <b>help</b>."],
    once("mkc_parking", "yes", "Bạn đã đóng dấu miễn phí vé gửi xe rồi."),
    at("mk_service", "point", 750, [["mkc_parking", "yes"]]),
    ["validate my parking ticket", "ask customer service to stamp my parking ticket", "đóng dấu miễn phí vé gửi xe"]),

  mkA("return_basket_to_cart_bay", "cartreturnbay", "Stack my basket in the bay", "Xếp giỏ hàng vào khu trả giỏ",
    "I'll stack my red hand basket neatly in the cart return bay.",
    "Mình sẽ xếp gọn chiếc giỏ xách màu đỏ vào khu trả xe đẩy và giỏ hàng.",
    ["stack", "cart return bay"], ["cartbay", "basket"],
    "<b>stack … neatly in the cart return bay</b> = xếp chồng gọn gàng vào khu trả xe/giỏ.",
    ["I'll stack my red hand basket", "neatly in the cart return bay."], ["stack", "stick", "stuck"],
    ["Park your cart in the <b>cart return bay</b>.", "Stack your empty <b>basket</b> by the exit."],
    once("mkc_returncart", "yes", "Bạn đã xếp gọn giỏ hàng vào khu trả rồi."),
    at("mkc_cartbay", "reach", 750, [["mkc_returncart", "yes"]]),
    ["stack my basket in the bay", "return my hand basket to the cart return bay", "xếp giỏ hàng vào khu trả giỏ"]),

  mkA("show_receipt_to_security_guard", "securityguard", "Show receipt to the guard", "Chào và đưa hóa đơn cho bảo vệ",
    "Here is my receipt for the security guard—thank you and have a nice day!",
    "Hóa đơn của mình gửi anh bảo vệ đây ạ — cảm ơn anh và chúc một ngày tốt lành!",
    ["receipt", "security guard"], ["guard", "receipt"],
    "<b>Here is my receipt — have a nice day!</b> = Hóa đơn của mình đây ạ — chúc một ngày tốt lành!",
    ["Here is my receipt for the security guard—", "thank you and have a nice day!"], ["guard", "card", "yard"],
    ["Smile and greet the <b>security guard</b> by the door.", "Keep your <b>receipt</b> handy on the way out."],
    once("mkc_guardcheck", "yes", "Bạn đã chào và trình hóa đơn cho nhân viên bảo vệ rồi."),
    at("mkc_guard", "point", 750, [["mkc_guardcheck", "yes"]]),
    ["show receipt to the guard", "greet the security guard and show my receipt", "chào và đưa hóa đơn cho bảo vệ"]),

  mkA("walk_out_sliding_exit_door", "checkoutexit", "Walk out the glass exit door", "Bước qua cửa kính trượt lối ra",
    "The automatic sliding exit door opens as we carry our bags out.",
    "Cửa kính trượt tự động mở êm ái khi chúng mình xách túi đồ bước ra ngoài.",
    ["sliding exit door", "opens"], ["exitdoor", "bag"],
    "<b>as + mệnh đề</b> = ngay khi … (as we carry our bags out = khi chúng mình xách túi bước ra).",
    ["The automatic sliding exit door opens", "as we carry our bags out."], ["door", "floor", "four"],
    ["Step through the blue glass <b>sliding exit door</b>.", "We have everything in our shopping <b>bag</b>!"],
    once("mkc_exitdoor", "yes", "Bạn đã bước qua cửa kính trượt lối ra rồi."),
    at("mkc_exit", "reach", 800, [["mkc_exitdoor", "yes"]]),
    ["walk out the glass exit door", "head out through the sliding exit door", "bước qua cửa kính trượt lối ra"])
];

const checkoutActions = [
  ...S.allActions.filter(a => S.CHECKOUT_OBJS.has(a.obj)),
  ...checkoutNewActions
];

const market_checkout = {
  id: "market_checkout", topic: "market", icon: "💳", zoneOrder: 5,
  name: "Checkout & Customer Service", nameVi: "Quầy thu ngân & dịch vụ", names: ["Checkout & Customer Service", "Quầy thu ngân & dịch vụ"],
  go: {
    label: "Head to checkout & customer service",
    labelVi: "Qua khu quầy thu ngân & dịch vụ",
    sentence: "I'm heading to the checkout counter to pay for my groceries.",
    vi: "Tôi đang đi ra quầy thu ngân để thanh toán đồ mua sắm.",
    key: ["heading", "checkout", "pay"],
    chunks: ["I'm heading to the checkout counter", "to pay for my groceries."],
    grammar: "<b>head to the checkout counter</b> = đi ra quầy thu ngân để thanh toán.",
    patterns: ["I'm heading to <b>the checkout counter</b>.", "I'm heading to <b>the customer service desk</b>."],
    vocab: [["checkout", "/ˈtʃek.aʊt/", "quầy thu ngân"], ["customer service", "/ˈkʌs.tə.mər ˈsɜː.vɪs/", "dịch vụ khách hàng"]],
    story: ["head to the checkout counter", "walk to checkout and customer service", "qua khu quầy thu ngân & dịch vụ"]
  },
  shellSvg: checkoutShell,
  worldSvg: checkoutWorld,
  W0: MK_W0,
  spots: {
    mk_snacks: { x: 84, y: 424, d: -1 },
    mkc_candy: { x: 146, y: 428, d: -1 },
    mkc_mag: { x: 146, y: 404, d: -1 },
    mkc_return: { x: 238, y: 404, d: 1 },
    mkc_loyalty: { x: 358, y: 404, d: 1 },
    mkc_lost: { x: 459, y: 404, d: 1 },
    mkc_gift: { x: 540, y: 404, d: 1 },
    mkc_delivery: { x: 624, y: 404, d: 1 },
    mk_service: { x: 534, y: 432, d: 1 },
    mk_line: { x: 208, y: 536, d: 1 },
    mk_checkout: { x: 286, y: 524, d: 1 },
    mkc_belt: { x: 286, y: 516, d: 1 },
    mkc_pos: { x: 326, y: 516, d: 1 },
    mk_reader: { x: 402, y: 516, d: 1 },
    mkc_printer: { x: 315, y: 516, d: 1 },
    mkc_coins: { x: 366, y: 516, d: 1 },
    mk_bags: { x: 336, y: 528, d: 1 },
    mkc_pack: { x: 436, y: 528, d: 1 },
    mk_self: { x: 696, y: 446, d: 1 },
    mkc_cartbay: { x: 672, y: 544, d: 1 },
    mkc_guard: { x: 792, y: 472, d: 1 },
    mkc_exit: { x: 888, y: 468, d: 1 },
    mk_door: { x: 888, y: 468, d: 1 },
    mke_door: { x: 888, y: 468, d: 1 }
  },
  obstacles: [],
  entry: { x: 208, y: 542, d: 1 },
  objects: checkoutObjects,
  actions: checkoutActions,
  props: S.MK_PROPS,
  applyState(W, root) {
    mirrorState(W, MK_W0, root);
    try {
      const t = root && root.querySelector && root.querySelector(".mk-total");
      if (t && S.totalOf && S.money) t.textContent = S.money(S.totalOf(W));
    } catch (e) {}
  },
  css: S.marketCss,
  catalog: cat("mkc_", [
    ["conveyor belt", "/kənˈveɪ.ər belt/", "băng chuyền thu ngân", "equipment"],
    ["checkout divider", "/ˈtʃek.aʊt dɪˈvaɪ.dər/", "thanh ngăn phân cách", "equipment"],
    ["price display", "/praɪs dɪˈspleɪ/", "màn hình hiển thị giá POS", "equipment"],
    ["receipt printer", "/rɪˈsiːt ˈprɪn.tər/", "máy in hóa đơn nhiệt", "equipment"],
    ["coin dispenser", "/kɔɪn dɪˈspen.sər/", "máy trả tiền thừa", "equipment"],
    ["chewing gum", "/ˈtʃuː.ɪŋ ɡʌm/", "kẹo cao su bạc hà", "food"],
    ["breath mints", "/breθ mɪnts/", "kẹo ngậm thơm miệng", "food"],
    ["return policy", "/rɪˈtɜːn ˈpɑl.ə.si/", "chính sách đổi trả hàng", "other"],
    ["loyalty points", "/ˈlɔɪ.əl.ti pɔɪnts/", "điểm thưởng tích lũy", "money"],
    ["gift wrap", "/ɡɪft ræp/", "giấy gói quà tặng", "other"],
    ["delivery slot", "/dɪˈlɪv.ər.i slɑt/", "khung giờ giao hàng", "other"],
    ["security guard", "/sɪˈkjʊr.rə.ti ɡɑːd/", "nhân viên bảo vệ", "people"]
  ])
};

const CHECKOUT_REPLIES = {
  /* Replies for existing checkout / service / snack actions */
  grab_some_chips: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Those sea-salt potato chips on the endcap rack are buy-two-get-one-free today!", vi: "Loại bim bim khoai tây vị muối biển ở kệ đầu quầy hôm nay đang mua 2 tặng 1 đấy!" },
  compare_prices: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "The store-brand chips are a great deal—fifty cents cheaper and super crunchy!", vi: "Bim bim nhãn hiệu riêng của siêu thị hời lắm — rẻ hơn 50 xu mà giòn rụm!" },
  put_item_back: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "No problem at all! If you change your mind about any item, you can also hand it to me.", vi: "Không sao cả! Nếu bạn đổi ý món nào thì cứ đưa cho mình tại quầy cũng được nhé." },
  pick_roasted_almonds: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Unsalted roasted almonds are my favorite healthy snack during a busy shift!", vi: "Hạnh nhân rang không muối là món ăn vặt lành mạnh yêu thích của mình trong ca trực đấy!" },
  choose_dark_chocolate: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Seventy percent dark chocolate right by the register is a classic treat!", vi: "Sô-cô-la đen 70% ca-cao ngay cạnh quầy thu ngân là món ngon kinh điển!" },
  queue_at_checkout: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Welcome to Lane 1! I can take the next customer right here.", vi: "Chào mừng đến với Quầy số 1! Mời vị khách tiếp theo tiến lên ạ." },
  put_items_on_counter: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Thank you! Your running total is {total}. Do you have a member card?", vi: "Cảm ơn bạn! Tổng tạm tính của bạn là {total_vi}. Bạn có thẻ thành viên không ạ?" },
  use_a_coupon: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Beep! Two-dollar coupon applied—your new total is {total}.", vi: "Tít! Đã áp dụng phiếu giảm 2 đô — tổng mới của bạn còn {total_vi}." },
  use_loyalty_points: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "You've got enough loyalty points for a dollar off—now it's {total}!", vi: "Bạn đủ điểm thưởng để giảm 1 đô rồi — giờ tổng đơn còn {total_vi} nhé!" },
  ask_price_check: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Good catch! I've updated the sale price on the POS screen for you.", vi: "Bạn tinh mắt thật! Mình đã cập nhật lại đúng giá khuyến mãi trên màn hình POS cho bạn rồi." },
  ask_for_a_bag: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Sure, carrier bags are ten cents each, right here on the stand.", vi: "Có ạ, mỗi túi đựng đồ giá 10 xu ở ngay giá treo này nhé." },
  tap_my_card: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "That's {total}. Go ahead and tap your card or phone on the reader!", vi: "Của bạn hết {total_vi}. Mời bạn chạm thẻ hoặc điện thoại lên máy POS nhé!" },
  pay_with_qr: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Sure! That's {total}—just scan the QR code on the terminal screen.", vi: "Được ạ! Hết {total_vi} — bạn quét mã QR trên màn hình máy POS nhé." },
  pay_cash_market: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Cash received for {total}! Your change is dropping into the coin dispenser.", vi: "Đã nhận tiền mặt cho đơn {total_vi}! Tiền thừa đang nhả ở khay máy tự động nhé." },
  get_the_receipt: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Here is your printed receipt from the thermal printer. Thank you!", vi: "Hóa đơn in nhiệt của bạn đây ạ. Cảm ơn bạn đã mua sắm!" },
  greet_the_cashier: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Hi there! Having a busy but cheerful shift today—did you find everything okay?", vi: "Chào bạn! Ca trực hôm nay bận mà vui lắm — bạn đã tìm mua đủ đồ chưa?" },
  put_divider_on_belt: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Thank you for placing the divider bar on the conveyor belt!", vi: "Cảm ơn bạn đã đặt thanh phân cách lên băng chuyền nhé!" },
  enter_pin_number: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Please enter your four-digit PIN on the keypad and press the green key.", vi: "Bạn vui lòng nhập mã PIN 4 số trên bàn phím rồi bấm phím xanh lá nhé." },
  check_payment_approved: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Payment approved! The green LED on the card reader just lit up.", vi: "Thanh toán đã được duyệt! Đèn LED xanh trên máy quẹt thẻ vừa sáng lên rồi." },
  bring_own_bag: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Wonderful—thanks for bringing your own reusable bag today!", vi: "Tuyệt quá — cảm ơn bạn đã mang theo túi vải riêng hôm nay nhé!" },
  buy_eco_bag: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Our canvas eco bag is $1.50 and holds up to fifteen kilos of groceries.", vi: "Túi vải sinh thái của siêu thị giá 1 đô rưỡi và đựng được tới 15 ký đồ đấy." },
  pack_the_bags: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Feel free to use the spacious packing table right beside the lane!", vi: "Bạn cứ thoải mái dùng bàn đóng gói rộng rãi ngay cạnh làn thu ngân nhé!" },
  separate_cold_items: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Smart idea—keeping frozen and dairy items in an insulated bag stops them from melting.", vi: "Ý hay đấy — để đồ đông lạnh và sữa chung vào túi giữ nhiệt sẽ không lo bị chảy." },
  double_bag_heavy_bottles: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "I always recommend double-bagging heavy bottles so the handles stay strong.", vi: "Mình luôn khuyên khách lồng hai lớp túi cho các chai nặng để quai xách thật chắc." },
  scan_my_items: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Just hold each barcode over the red laser scanner and place the item on the scale!", vi: "Bạn chỉ cần đưa từng mã vạch qua tia quét đỏ rồi đặt món hàng lên bàn cân nhé!" },
  self_checkout_help: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "No worries! I've cleared the weight alert on your self-checkout screen.", vi: "Không sao đâu! Mình vừa xóa thông báo lệch cân trên màn hình tự thanh toán giúp bạn rồi." },
  pay_at_self_checkout: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Self-checkout payment complete! Don't forget your receipt from the kiosk slot.", vi: "Thanh toán tại máy tự động hoàn tất! Bạn đừng quên lấy hóa đơn ở khe máy nhé." },
  select_english_language: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Tap the flag icon at the top corner to switch the self-checkout voice and screen to English!", vi: "Chạm vào biểu tượng lá cờ ở góc trên để chuyển giọng đọc và màn hình sang tiếng Anh nhé!" },
  weigh_produce_at_self: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "The digital scale weighed your bananas—just tap the banana picture on the screen!", vi: "Cân điện tử đã cân xong nải chuối của bạn — giờ chỉ cần chạm vào hình quả chuối trên màn hình!" },
  return_an_item: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "No problem at all! I've processed your return and issued a full refund.", vi: "Không vấn đề gì đâu ạ! Mình đã xử lý nhận lại hàng và hoàn tiền đầy đủ cho bạn." },
  sign_up_membership: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Welcome to our VIP Loyalty Club! Your new card comes with 50 bonus points.", vi: "Chào mừng bạn đến với Câu lạc bộ VIP! Thẻ mới của bạn được tặng sẵn 50 điểm thưởng." },
  ask_about_delivery: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "We offer free two-hour express home delivery on all orders over fifty dollars!", vi: "Siêu thị miễn phí giao hàng nhanh trong 2 tiếng cho mọi đơn hàng trên 50 đô-la!" },
  ask_store_hours: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "We're open every day from 7:00 AM until 10:00 PM, including weekends!", vi: "Siêu thị mở cửa mỗi ngày từ 7 giờ sáng đến 10 giờ tối, kể cả cuối tuần ạ!" },
  ask_about_lost_wallet: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Yes! A kind shopper turned in a brown leather wallet ten minutes ago—let's verify your ID!", vi: "Có đấy ạ! Một vị khách tốt bụng vừa nhặt được chiếc ví da nâu gửi lại 10 phút trước — mình đối chiếu giấy tờ nhé!" },
  request_gift_wrapping: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Yes, our Gift Wrap station right behind me has free wrapping paper, ribbons, and gift bags!", vi: "Có ạ, quầy Gói quà ngay phía sau mình có sẵn giấy gói, dây ruy-băng và túi quà miễn phí!" },

  /* Replies for the 5 Required Natural Sentences */
  ask_apple_pay: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Yes, we take Apple Pay, Google Pay, and all contactless cards—just tap right on the screen!", vi: "Có ạ, quầy nhận Apple Pay, Google Pay và mọi loại thẻ chạm — bạn chạm thẳng lên màn hình máy POS nhé!" },
  ask_for_a_bag_please: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Of course! Would you like a reusable cloth tote or a recycled paper bag?", vi: "Được ngay ạ! Bạn muốn lấy túi vải tái sử dụng hay túi giấy tái chế nhỉ?" },
  return_wrong_size_item: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "I'd be happy to help you return that or swap it for the right size right away!", vi: "Mình rất sẵn lòng hỗ trợ bạn trả lại hoặc đổi ngay sang đúng kích cỡ bạn cần nhé!" },
  ask_to_use_loyalty_points: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Absolutely! You have 200 points, so I can take $10 right off your bill today.", vi: "Chắc chắn rồi ạ! Bạn đang có 200 điểm, vậy hôm nay mình trừ thẳng 10 đô-la vào hóa đơn cho bạn nhé." },
  ask_home_delivery_apartment: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Yes! Just write down your apartment number and our van will deliver it within two hours.", vi: "Được chứ ạ! Bạn chỉ cần ghi số căn hộ, xe tải của siêu thị sẽ giao tận cửa trong vòng 2 tiếng." },

  /* Replies for the remaining new actions across Cashier, Customer Service Agent, Security Guard */
  place_checkout_divider_bar: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Thanks for putting down the divider bar—it keeps everyone's orders separate!", vi: "Cảm ơn bạn đã đặt thanh ngăn nhé — nhờ vậy đơn hàng của các khách không bị lẫn vào nhau!" },
  load_groceries_onto_belt: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "I'll scan these gently so your fresh produce and bread stay in perfect shape.", vi: "Mình sẽ quét mã nhẹ tay để rau củ tươi và bánh mì của bạn giữ nguyên độ ngon." },
  check_running_total_on_pos: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Every promo discount shows up in green on the customer price display!", vi: "Mọi khoản giảm giá khuyến mãi đều hiện chữ màu xanh lá trên màn hình hiển thị cho khách đấy!" },
  scan_qr_code_to_pay: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "The QR code is on the terminal screen now—payment confirmed in one second!", vi: "Mã QR đã hiện trên màn hình máy POS rồi ạ — thanh toán xác nhận chỉ trong 1 giây!" },
  ask_for_vat_tax_invoice: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Printing your itemized receipt and company VAT tax invoice right now!", vi: "Máy đang in hóa đơn chi tiết kèm hóa đơn thuế VAT công ty cho bạn ngay đây!" },
  collect_coins_from_dispenser: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "Our automatic coin dispenser never misses a cent!", vi: "Máy trả tiền xu tự động của quầy mình tính chuẩn từng xu một đấy!" },
  grab_mint_chewing_gum: { who: "Cashier", avatar: "🧑‍💼", voice: "young_female", anchor: "obj:checkout",
    en: "I'll scan that pack of mint gum right in with the rest of your groceries.", vi: "Mình quét luôn phong kẹo cao su bạc hà này chung vào đơn hàng của bạn nhé." },
  read_return_policy_board: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Our 7-day return policy covers both full refunds and instant size exchanges.", vi: "Chính sách đổi trả 7 ngày của siêu thị áp dụng cho cả hoàn tiền 100% lẫn đổi cỡ lấy ngay." },
  sign_up_for_member_card: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Every 100 VIP points gives you five dollars off—and points never expire!", vi: "Cứ mỗi 100 điểm VIP bạn được giảm 5 đô — và điểm tích lũy không bao giờ hết hạn!" },
  check_lost_and_found_cabinet: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Yes! A shopper turned in this red umbrella twenty minutes ago—glad you found it!", vi: "Có đấy ạ! Một vị khách vừa nhặt được chiếc ô đỏ này gửi lại 20 phút trước — mừng là bạn đã tìm thấy!" },
  ask_for_free_gift_wrapping: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "Gift wrapping is complimentary! Which wrapping paper pattern would you like?", vi: "Dịch vụ gói quà hoàn toàn miễn phí ạ! Bạn thích mẫu giấy gói họa tiết nào nhỉ?" },
  choose_pink_satin_ribbon: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "A double bow with pink satin ribbon—there, it looks ready for a celebration!", vi: "Thắt nơ kép bằng ruy-băng lụa hồng — xong rồi, trông lung linh sẵn sàng cho bữa tiệc!" },
  book_evening_delivery_slot: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "You're booked for the 6:00 PM delivery window. Our driver will call before arriving!", vi: "Bạn đã đặt thành công khung giờ giao 6 giờ chiều. Tài xế sẽ gọi điện trước khi tới nơi nhé!" },
  validate_parking_ticket_at_desk: { who: "Customer Service Agent", avatar: "💁", voice: "adult_female", anchor: "obj:servicedesk",
    en: "All stamped! You get two hours of free parking in the underground garage.", vi: "Đã đóng dấu xong! Bạn được miễn phí 2 tiếng gửi xe dưới tầng hầm siêu thị nhé." },
  return_basket_to_cart_bay: { who: "Security Guard", avatar: "🛡️", voice: "adult_male", anchor: "obj:securityguard",
    en: "Thank you for stacking your basket in the return bay—much appreciated!", vi: "Cảm ơn bạn đã xếp gọn giỏ hàng vào khu trả giỏ nhé — rất đáng quý!" },
  show_receipt_to_security_guard: { who: "Security Guard", avatar: "🛡️", voice: "adult_male", anchor: "obj:securityguard",
    en: "All checked! Thank you for shopping with us, and have a safe trip home.", vi: "Đã kiểm tra xong! Cảm ơn bạn đã mua sắm tại siêu thị, chúc bạn thượng lộ bình an." },
  walk_out_sliding_exit_door: { who: "Security Guard", avatar: "🛡️", voice: "adult_male", anchor: "obj:securityguard",
    en: "Watch your step through the glass doors—see you again soon!", vi: "Đi cẩn thận qua cửa kính trượt nhé — hẹn sớm gặp lại bạn!" }
};

/* ---------- Register All 5 Supermarket Zones & Hook into ELW_MARKET ---------- */
if (typeof window !== "undefined") {
  /* Migrate any legacy saved room="market" in localStorage before app boots */
  try {
    const raw = localStorage.getItem("elw_world_v1");
    if (raw && raw.indexOf('"market"') !== -1) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.room === "market") {
        parsed.room = "market_checkout";
        localStorage.setItem("elw_world_v1", JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  const existing = window.ELW_ROOMS || {};
  delete existing.market;
  window.ELW_ROOMS = Object.assign(existing, {
    market_entrance,
    market_produce,
    market_dairy,
    market_meat,
    market_checkout
  });

  if (window.ELW_MARKET) {
    window.ELW_MARKET.rooms = ["market_entrance", "market_produce", "market_dairy", "market_meat", "market_checkout"];
    window.ELW_MARKET.zones = { market_entrance, market_produce, market_dairy, market_meat, market_checkout };
    const origReply = window.ELW_MARKET.reply;
    window.ELW_MARKET.reply = function (actionId, Wopt) {
      if (ENTRANCE_REPLIES[actionId]) return ENTRANCE_REPLIES[actionId];
      if (PRODUCE_REPLIES[actionId]) return PRODUCE_REPLIES[actionId];
      if (DAIRY_REPLIES[actionId]) return DAIRY_REPLIES[actionId];
      if (MEAT_REPLIES[actionId]) return MEAT_REPLIES[actionId];
      if (CHECKOUT_REPLIES[actionId]) {
        const r = CHECKOUT_REPLIES[actionId];
        const W = Wopt || (window.ELW_WORLD_STATE) || {};
        return Object.assign({}, r, {
          en: S.fill ? S.fill(r.en, W) : r.en,
          vi: S.fill ? S.fill(r.vi, W) : r.vi
        });
      }
      return origReply ? origReply(actionId, Wopt) : null;
    };
  }

  /* Ensure any mission in ELW_LIFE with legacy room:"market" maps to "market_entrance" */
  const fixLifeMissions = (lifeObj) => {
    if (lifeObj && Array.isArray(lifeObj.missions)) {
      lifeObj.missions.forEach(m => {
        if (m && m.room === "market") m.room = "market_entrance";
      });
    }
  };
  if (window.ELW_LIFE) {
    fixLifeMissions(window.ELW_LIFE);
  } else {
    let _elwLife = undefined;
    Object.defineProperty(window, "ELW_LIFE", {
      configurable: true,
      enumerable: true,
      get() { return _elwLife; },
      set(val) {
        _elwLife = val;
        fixLifeMissions(val);
      }
    });
  }
}
})();

