/* English Life World — modules/topic-cafe-zones.js
   4-Zone Coffee Shop Expansion (replaces generic single 'cafe' room):
     1. cafe_counter — Order & Payment Counter (Quầy order & thanh toán)
     2. cafe_bar     — Espresso Bar & Pickup (Quầy pha chế & lấy đồ)
     3. cafe_seating — Indoor Seating & Lounge (Khu ngồi trong nhà)
     4. cafe_terrace — Terrace & Work Corner (Sân thượng & góc làm việc)
   Each zone has >= 20 objects, >= 40 actions, >= 60 distinct English sentences,
   zone-specific NPCs, SVG scenes, and full mission/challenge compatibility. */
(function () {
  "use strict";

  const S = typeof window !== "undefined" && window.ELW_CAFE_SHARED;
  if (!S) return;

  const {
    CF_W0, CFV, cfA, objG, mirrorState, cat, D,
    once, at, PAID, getDrink, needDrink, SEAT_SPOT, goSeat, ensureSeat,
    COUNTER_OBJS, BAR_OBJS, SEATING_OBJS, TERRACE_OBJS,
    allObjects, allActions,
    NPCS, reply, MISSIONS, CHALLENGES,
    priceOf, drinkName, money, moneyVi, fill, liveState,
    CF_PROPS, cafeCss, cafeCatalog
  } = S;

  /* ---------- Expand Vocabulary for 4-Zone Coffee Shop ---------- */
  Object.assign(CFV, {
    online: ["online", "/ˌɑnˈlaɪn/", "trực tuyến, trên mạng", "adv"],
    special: ["daily special", "/ˈdeɪ.li ˈspeʃ.əl/", "món đặc biệt trong ngày", "n"],
    allergen: ["allergen", "/ˈæl.ə.dʒən/", "chất gây dị ứng", "n"],
    glutenfree: ["gluten-free", "/ˌɡluː.tənˈfriː/", "không chứa gluten", "adj"],
    contactless: ["contactless", "/ˈkɑn.tækt.ləs/", "thanh toán không chạm", "adj"],
    reader: ["card reader", "/ˈkɑːd ˌriː.dər/", "máy quẹt thẻ", "n"],
    printer: ["receipt printer", "/rɪˈsiːt ˈprɪn.tər/", "máy in hoá đơn", "n"],
    cookie: ["chocolate cookie", "/ˈtʃɑk.lət ˈkʊk.i/", "bánh quy sô-cô-la", "n"],
    macaron: ["macaron", "/ˌmæk.əˈrɑn/", "bánh macaron Pháp", "n"],
    pistachio: ["pistachio", "/pɪˈstæʃ.i.oʊ/", "hạt dẻ cười", "n"],
    giftcard: ["gift card", "/ˈɡɪft kɑːd/", "thẻ quà tặng", "n"],
    roast: ["medium roast", "/ˈmiː.di.əm roʊst/", "cà phê rang vừa", "n"],
    origin: ["single-origin", "/ˌsɪŋ.ɡəl ˈɑr.ɪ.dʒɪn/", "hạt cà phê đơn nguồn gốc", "adj"],
    bell: ["service bell", "/ˈsɜː.vɪs bel/", "chuông gọi phục vụ", "n"],
    sanitizer: ["hand sanitizer", "/ˈhænd ˌsæn.ɪ.taɪ.zər/", "nước rửa tay khô", "n"],
    buzzer: ["order buzzer", "/ˈɔː.dər ˈbʌz.ər/", "thẻ rung báo có đồ", "n"],
    ceramic: ["ceramic mug", "/səˈræm.ɪk mʌɡ/", "cốc sứ", "n"],
    chalkboard: ["chalkboard", "/ˈtʃɔːk.bɔːd/", "bảng phấn", "n"],
    fresh: ["freshly baked", "/ˈfreʃ.li beɪkt/", "vừa mới nướng", "adj"],

    grinder: ["coffee grinder", "/ˈkɑf.i ˈɡraɪn.dər/", "máy xay cà phê", "n"],
    grind: ["fine grind", "/faɪn ɡraɪnd/", "cỡ xay mịn", "n"],
    pitcher: ["milk pitcher", "/mɪlk ˈpɪtʃ.ər/", "ca đánh sữa inox", "n"],
    foam: ["microfoam", "/ˈmaɪ.kroʊ.foʊm/", "lớp bọt sữa siêu mịn", "n"],
    syrup: ["vanilla syrup", "/vəˈnɪl.ə ˈsɪr.əp/", "si-rô hương va-ni", "n"],
    caramel: ["caramel drizzle", "/ˈkær.ə.mel ˈdrɪz.əl/", "sốt caramel rưới mặt", "n"],
    pourover: ["pour-over", "/ˈpɔːrˌoʊ.vər/", "cà phê pha phễu lọc giấy", "n"],
    bloom: ["coffee bloom", "/ˈkɑf.i bluːm/", "quá trình nở cà phê", "n"],
    filtered: ["filtered water", "/ˈfɪl.təd ˈwɔː.tər/", "nước lọc tinh khiết", "n"],
    whisk: ["bamboo whisk", "/bæmˈbuː wɪsk/", "chổi tre đánh matcha", "n"],
    blender: ["blender", "/ˈblen.dər/", "máy xay sinh tố", "n"],
    warmer: ["cup warmer", "/kʌp ˈwɔː.mər/", "khay ủ ấm tách sứ", "n"],
    carrier: ["drink carrier", "/drɪŋk ˈkær.i.ər/", "khay giấy đựng ly", "n"],
    cocoa: ["cocoa powder", "/ˈkoʊ.koʊ ˈpaʊ.dər/", "bột ca cao", "n"],
    coldbrew: ["cold brew", "/ˈkoʊld bruː/", "cà phê ủ lạnh", "n"],
    chamomile: ["chamomile tea", "/ˈkæm.ə.maɪl tiː/", "trà hoa cúc ấm", "n"],
    knockbox: ["knock box", "/ˈnɑk bɑks/", "hộp đập bã cà phê", "n"],

    sofa: ["velvet sofa", "/ˈvel.vɪt ˈsoʊ.fə/", "ghế sofa nhung", "n"],
    cozy: ["cozy", "/ˈkoʊ.zi/", "ấm cúng, dễ chịu", "adj"],
    cushion: ["cushion", "/ˈkʊʃ.ən/", "gối tựa lưng, đệm ngồi", "n"],
    bookshelf: ["bookshelf", "/ˈbʊk.ʃelf/", "kệ sách, kệ tạp chí", "n"],
    armchair: ["leather armchair", "/ˈleð.ər ˈɑːm.tʃerr/", "ghế bành bọc da", "n"],
    novel: ["novel", "/ˈnɑv.əl/", "tiểu thuyết", "n"],
    bulletin: ["bulletin board", "/ˈbʊl.ə.tɪn bɔːd/", "bảng tin cộng đồng", "n"],
    flyer: ["flyer", "/ˈflaɪ.ər/", "tờ rơi thông báo", "n"],
    chess: ["chess set", "/ˈtʃes set/", "bộ cờ vua", "n"],
    boardgame: ["board game", "/ˈbɔːd ɡeɪm/", "trò chơi bàn cờ", "n"],
    relax: ["relax", "/rɪˈlæks/", "thư giãn, nghỉ ngơi", "v"],
    chat: ["chat", "/tʃæt/", "trò chuyện thân mật", "n"],
    vinyl: ["vinyl record", "/ˈvaɪ.nəl ˈrek.ɔːd/", "đĩa than", "n"],
    turntable: ["turntable", "/ˈtɜːnˌteɪ.bəl/", "máy phát đĩa than", "n"],
    jazz: ["jazz", "/dʒæz/", "nhạc jazz êm dịu", "n"],
    painting: ["painting", "/ˈpeɪn.tɪŋ/", "bức tranh màu nước", "n"],
    lamp: ["floor lamp", "/ˈflɔː læmp/", "đèn cây đứng", "n"],
    floorlamp: ["floor lamp", "/ˈflɔː læmp/", "đèn cây đọc sách", "n"],
    monstera: ["potted plant", "/ˈpɑt.ɪd plɑːnt/", "chậu cây cảnh", "n"],
    coatrack: ["coat rack", "/ˈkoʊt ræk/", "cây treo áo khoác", "n"],
    bench: ["window bench", "/ˈwɪn.doʊ bentʃ/", "băng ghế dài bên cửa sổ", "n"],
    coaster: ["coaster", "/ˈkoʊ.stər/", "miếng lót ly bằng bần", "n"],
    mug: ["ceramic mug", "/səˈræm.ɪk mʌɡ/", "cốc sứ", "n"],
    vase: ["ceramic vase", "/səˈræm.ɪk vɑːz/", "bình hoa gốm nhỏ", "n"],
    fragrant: ["fragrant", "/ˈfreɪ.ɡrənt/", "thơm dịu, ngát hương", "adj"],
    busrack: ["bussing rack", "/ˈbʌs.ɪŋ ræk/", "kệ thu dọn khay cốc", "n"],
    regular: ["regular", "/ˈreɡ.jə.lər/", "khách quen hằng ngày", "n"],
    newspaper: ["morning paper", "/ˈmɔː.nɪŋ ˈpeɪ.pər/", "báo buổi sáng", "n"],
    crossword: ["crossword puzzle", "/ˈkrɑs.wɜːd ˈpʌz.əl/", "ô chữ", "n"],
    carafe: ["water carafe", "/ˈwɔː.tər kəˈræf/", "bình nước thuỷ tinh", "n"],
    bussing: ["return tray", "/rɪˈtɜːn treɪ/", "khay trả cốc đã dùng", "n"],
    highchair: ["high chair", "/ˈhaɪ tʃerr/", "ghế ăn trẻ em", "n"],
    fireplace: ["fireplace", "/ˈfaɪr.pleɪs/", "lò sưởi ấm", "n"],
    teacart: ["tea cart", "/ˈtiː kɑːt/", "xe đẩy phục vụ trà", "n"],
    ottoman: ["ottoman", "/ˈɑt.ə.mən/", "đôn bọc nệm gác chân", "n"],

    powerstrip: ["power strip", "/ˈpaʊ.ər strɪp/", "ổ cắm điện nối dài", "n"],
    usbc: ["USB-C port", "/ˌjuː.es.biːˈsiː pɔːt/", "cổng sạc nhanh USB-C", "n"],
    stand: ["laptop stand", "/ˈlæp.tɑp stænd/", "giá đỡ laptop", "n"],
    posture: ["posture", "/ˈpɑs.tʃər/", "tư thế ngồi", "n"],
    cowork: ["co-working table", "/ˌkoʊˈwɜː.kɪŋ ˈteɪ.bəl/", "bàn làm việc chung", "n"],
    coworker: ["coworker", "/ˈkoʊˌwɜː.kər/", "bạn cùng ngồi làm việc", "n"],
    router: ["Wi-Fi router", "/ˈwaɪ.faɪ ˈraʊ.tər/", "bộ phát sóng Wi-Fi", "n"],
    study: ["study", "/ˈstʌd.i/", "học tập, ôn bài", "v"],
    notebook: ["notebook", "/ˈnoʊt.bʊk/", "sổ tay ghi chép", "n"],
    desklamp: ["desk lamp", "/ˈdesk læmp/", "đèn bàn học chống cận", "n"],
    meeting: ["video call", "/ˈvɪd.i.oʊ kɔːl/", "cuộc gọi video", "n"],
    ergonomic: ["ergonomic chair", "/ˌɜː.ɡəˈnɑm.ɪk tʃerr/", "ghế công thái học", "n"],
    stool: ["bar stool", "/ˈbɑː stuːl/", "ghế đẩu cao quầy làm việc", "n"],
    headphones: ["headphones", "/ˈhed.foʊnz/", "tai nghe chống ồn", "n"],
    notepad: ["notepad", "/ˈnoʊt.pæd/", "sổ ghi chú", "n"],
    todolist: ["to-do list", "/təˈduː lɪst/", "danh sách việc cần làm", "n"],
    parasol: ["sun umbrella", "/ˈsʌn ʌmˌbrel.ə/", "dù che nắng lớn", "n"],
    shade: ["shade", "/ʃeɪd/", "bóng mát, bóng râm", "n"],
    stringlight: ["string lights", "/ˈstrɪŋ laɪts/", "dây đèn trang trí", "n"],
    stringlights: ["string lights", "/ˈstrɪŋ laɪts/", "giàn đèn dây vàng", "n"],
    planter: ["planter box", "/ˈplɑːn.tər bɑks/", "chậu cây cảnh sân thượng", "n"],
    freshair: ["fresh air", "/freʃ err/", "không khí trong lành", "n"],
    skyline: ["skyline", "/ˈskaɪ.laɪn/", "đường chân trời & phố phường", "n"],
    succulent: ["succulent", "/ˈsʌk.jə.lənt/", "cây sen đá & thảo mộc", "n"],
    rosemary: ["rosemary", "/ˈroʊz.mər.i/", "cây hương thảo", "n"],
    windscreen: ["bamboo screen", "/bæmˈbuː skriːn/", "vách tre chắn gió", "n"],
    heater: ["patio heater", "/ˈpæt.i.oʊ ˈhiː.tər/", "đèn sưởi sân thượng", "n"],
    petbowl: ["water bowl", "/ˈwɔː.tər boʊl/", "bát nước cho thú cưng", "n"],
    railing: ["balcony railing", "/ˈbæl.kə.ni ˈreɪ.lɪŋ/", "lan can ban công", "n"],
    whiteboard: ["whiteboard", "/ˈwaɪt.bɔːd/", "bảng trắng ghi mục tiêu", "n"],
    deskfan: ["desk fan", "/ˈdesk fæn/", "quạt bàn nhỏ", "n"]
  });

  /* ---------- New Objects per Zone (bringing every zone to >= 22 objects) ---------- */
  const COUNTER_NEW_OBJS = {
    dailyspecial: { en: "daily specials board", vi: "bảng món đặc biệt", ipa: "/ˈdeɪ.li ˈspeʃ.əlz bɔːd/", acts: ["read_daily_special"] },
    allergensign: { en: "allergen chart", vi: "bảng thông tin dị ứng", ipa: "/ˈæl.ə.dʒən tʃɑːt/", acts: ["check_allergen_chart"] },
    posreader: { en: "card reader", vi: "máy quẹt thẻ không chạm", ipa: "/ˈkɑːd ˌriː.dər/", acts: ["tap_card_on_pos"] },
    receiptprinter: { en: "receipt printer", vi: "máy in hoá đơn", ipa: "/rɪˈsiːt ˈprɪn.tər/", acts: ["check_receipt_paper"] },
    cookiejar: { en: "cookie jar", vi: "hũ bánh quy bơ", ipa: "/ˈkʊk.i dʒɑː/", acts: ["buy_chocolate_cookie"] },
    macaronstand: { en: "macaron tower", vi: "tháp bánh macaron", ipa: "/ˌmæk.əˈrɑn ˈtaʊ.ər/", acts: ["choose_pistachio_macaron"] },
    giftcardrack: { en: "gift card rack", vi: "kệ thẻ quà tặng", ipa: "/ˈɡɪft kɑːd ræk/", acts: ["buy_coffee_gift_card"] },
    beanbagdisplay: { en: "roasted bean bags", vi: "kệ túi hạt cà phê rang", ipa: "/ˈroʊ.stɪd biːn bæɡz/", acts: ["smell_roasted_bean_bag", "ask_decaf_bean_origin"] },
    handbell: { en: "service bell", vi: "chuông gọi nhân viên", ipa: "/ˈsɜː.vɪs bel/", acts: ["ring_counter_bell"] },
    sanitizersp: { en: "hand sanitizer", vi: "chai nước rửa tay khô", ipa: "/ˈhænd ˌsæn.ɪ.taɪ.zər/", acts: ["use_counter_sanitizer"] },
    buzzerstack: { en: "order buzzers", vi: "thẻ rung báo nhận đồ", ipa: "/ˈɔː.dər ˈbʌz.əz/", acts: ["take_order_buzzer"] },
    merchmug: { en: "ceramic mugs shelf", vi: "kệ cốc sứ lưu niệm", ipa: "/səˈræm.ɪk mʌɡz ʃelf/", acts: ["admire_ceramic_mug"] },
    pastrybarista: { en: "pastry server", vi: "nhân viên quầy bánh", ipa: "/ˈpeɪ.stri ˈsɜː.vər/", acts: ["ask_pastry_freshness", "ask_warm_ginger_tea_counter"] },
    welcomechalk: { en: "welcome chalkboard", vi: "bảng phấn chào khách", ipa: "/ˈwel.kəm ˈtʃɔːk.bɔːd/", acts: ["read_welcome_chalkboard"] }
  };

  const BAR_NEW_OBJS = {
    coffeegrinder: { en: "coffee grinder", vi: "máy xay hạt cà phê", ipa: "/ˈkɑf.i ˈɡraɪn.dər/", acts: ["hear_grinder_hum", "ask_for_fine_grind"] },
    milksteamer: { en: "steam wand & pitcher", vi: "vòi đánh sữa và ca inox", ipa: "/ˈstiːm wɑnd/", acts: ["watch_latte_art_pour", "ask_for_extra_foam"] },
    syruprack: { en: "syrup bottles", vi: "kệ si-rô hương vị", ipa: "/ˈsɪr.əp ˈbɑt.əlz/", acts: ["pump_vanilla_syrup", "pump_caramel_drizzle"] },
    pouroverbar: { en: "pour-over dripper", vi: "bộ pha cà phê thủ công", ipa: "/ˈpɔːrˌoʊ.vər ˈdrɪp.ər/", acts: ["watch_pourover_bloom", "ask_about_single_origin"] },
    waterdispenser: { en: "filtered water station", vi: "bình nước lọc miễn phí", ipa: "/ˈfɪl.təd ˈwɔː.tər/", acts: ["pour_free_filtered_water", "rinse_travel_cup"] },
    matchawhisk: { en: "matcha whisk & bowl", vi: "chổi tre đánh matcha", ipa: "/ˈmætʃ.ə wɪsk/", acts: ["watch_matcha_whisking"] },
    blenderstation: { en: "smoothie blender", vi: "máy xay chống ồn", ipa: "/ˈsmuː.ði ˈblen.dər/", acts: ["check_blender_lid"] },
    cupwarmer: { en: "cup warmer tray", vi: "khay ủ ấm tách sứ", ipa: "/kʌp ˈwɔː.mər treɪ/", acts: ["feel_warm_ceramic_cup"] },
    carrierholder: { en: "cardboard carriers", vi: "khay giấy 4 ngăn", ipa: "/ˈkɑːd.bɔːd ˈkær.i.əz/", acts: ["take_four_cup_carrier"] },
    cinnamonshaker: { en: "cocoa & cinnamon shakers", vi: "lọ rắc bột quế và ca cao", ipa: "/ˈsɪn.ə.mən ˈʃeɪ.kəz/", acts: ["dust_cocoa_powder"] },
    oatmilkcarton: { en: "plant milk pitcher", vi: "bình sữa yến mạch", ipa: "/plɑːnt mɪlk ˈpɪtʃ.ər/", acts: ["pour_splash_of_oat_milk"] },
    icedripper: { en: "cold brew tower", vi: "tháp ủ cà phê nhỏ giọt", ipa: "/ˈkoʊld bruː ˈtaʊ.ər/", acts: ["admire_cold_brew_drip"] },
    baristaliam: { en: "head barista Liam", vi: "trưởng quầy pha chế Liam", ipa: "/hed bəˈriː.stə/", acts: ["chat_with_head_barista", "ask_barista_for_hot_ginger_tea", "compliment_latte_heart"] },
    teacanisters: { en: "herbal tea tins", vi: "hộp trà thảo mộc ấm", ipa: "/ˈhɜː.bəl tiː tɪnz/", acts: ["smell_chamomile_tea_tin"] },
    knockbox: { en: "espresso knock box", vi: "hộp đập bã cà phê", ipa: "/eˈspres.oʊ ˈnɑk bɑks/", acts: ["watch_barista_knock_puck"] }
  };

  const SEATING_NEW_OBJS = {
    velvetsofa: { en: "velvet sofa", vi: "ghế sofa nhung êm", ipa: "/ˈvel.vɪt ˈsoʊ.fə/", acts: ["relax_on_velvet_sofa", "fluff_throw_pillow"] },
    magazinerack: { en: "magazine & art book rack", vi: "kệ tạp chí nghệ thuật", ipa: "/ˌmæɡ.əˈziːn ræk/", acts: ["browse_art_magazine", "pick_travel_novel"] },
    fireplace: { en: "cozy fireplace", vi: "lò sưởi ấm áp", ipa: "/ˈkoʊ.zi ˈfaɪr.pleɪs/", acts: ["warm_hands_by_fireplace", "admire_mantel_candles"] },
    vinylplayer: { en: "vinyl turntable", vi: "máy phát đĩa than", ipa: "/ˈvaɪ.nəl ˈtɜːnˌteɪ.bəl/", acts: ["watch_vinyl_spinning", "read_album_sleeve"] },
    boardgameshelf: { en: "board game shelf", vi: "kệ cờ và trò chơi", ipa: "/ˈbɔːd ɡeɪm ʃelf/", acts: ["inspect_chess_board", "play_quick_card_game"] },
    coatrack: { en: "wooden coat rack", vi: "cây treo áo khoác", ipa: "/ˈwʊd.ən ˈkoʊt ræk/", acts: ["hang_jacket_on_rack", "place_umbrella_in_stand"] },
    windowbench: { en: "cushioned window bench", vi: "băng ghế đệm bên cửa sổ", ipa: "/ˈwɪn.doʊ bentʃ/", acts: ["set_bag_on_cushion", "enjoy_sunbeam_by_window"] },
    floorlamp: { en: "brass reading lamp", vi: "đèn cây đọc sách", ipa: "/brɑːs ˈflɔː læmp/", acts: ["switch_on_reading_lamp", "admire_woven_rug"] },
    wallart: { en: "watercolor coffee prints", vi: "tranh màu nước mùa cà phê", ipa: "/ˈwɔː.təˌkʌl.ər prɪnts/", acts: ["admire_watercolor_painting"] },
    communityboard: { en: "community bulletin board", vi: "bảng tin cộng đồng", ipa: "/kəˈmjuː.nə.ti bɔːd/", acts: ["read_community_flyer", "pin_book_club_note"] },
    coasterset: { en: "cork coasters", vi: "bộ đế lót ly bằng bần", ipa: "/kɔːk ˈkoʊ.stəz/", acts: ["place_mug_on_coaster"] },
    tablevase: { en: "dried lavender vase", vi: "bình hoa oải hương khô", ipa: "/draɪd ˈlæv.ɪn.dər vɑːz/", acts: ["smell_dried_lavender"] },
    armchair: { en: "tufted leather armchair", vi: "ghế bành bọc da", ipa: "/ˈleð.ər ˈɑːm.tʃerr/", acts: ["sink_into_leather_armchair"] },
    indoorplanter: { en: "fiddle-leaf fig tree", vi: "chậu cây bàng Singapore", ipa: "/ˈfɪd.əl liːf fɪɡ/", acts: ["admire_fiddle_fig_tree"] },
    busstation: { en: "tray return rack", vi: "kệ thu dọn khay và tách", ipa: "/treɪ rɪˈtɜːn ræk/", acts: ["return_tray_to_rack", "wipe_table_crumb"] },
    regularsam: { en: "regular customer Sam", vi: "bác Sam khách quen", ipa: "/ˈreɡ.jə.lər ˈkʌs.tə.mər/", acts: ["greet_regular_sam", "help_sam_with_crossword"] },
    bookwormmaya: { en: "reader Maya", vi: "bạn đọc sách Maya", ipa: "/ˈriː.dər ˈmaɪ.ə/", acts: ["ask_maya_about_novel", "recommend_warm_tea_to_maya"] },
    teatrolley: { en: "wooden tea cart", vi: "xe đẩy trà thảo mộc", ipa: "/ˈwʊd.ən ˈtiː kɑːt/", acts: ["check_herbal_tea_cart", "pour_honey_from_jar"] },
    footstool: { en: "velvet ottoman", vi: "đôn gác chân bọc nhung", ipa: "/ˈvel.vɪt ˈɑt.ə.mən/", acts: ["rest_feet_on_ottoman"] }
  };

  const TERRACE_NEW_OBJS = {
    laptopstand: { en: "ergonomic laptop stand", vi: "giá đỡ laptop chống mỏi", ipa: "/ˈlæp.tɑp stænd/", acts: ["place_laptop_on_stand"] },
    powerstrip: { en: "USB-C power strip", vi: "ổ điện chia cổng & USB-C", ipa: "/ˈpaʊ.ər strɪp/", acts: ["plug_into_power_strip", "share_socket_politely"] },
    meshrouter: { en: "5GHz Wi-Fi router", vi: "bộ phát Wi-Fi tốc độ cao", ipa: "/ˈwaɪ.faɪ ˈraʊ.tər/", acts: ["check_signal_bars", "reconnect_to_fast_band"] },
    headphones: { en: "noise-canceling headphones", vi: "tai nghe chống ồn", ipa: "/ˈhed.foʊnz/", acts: ["put_on_headphones", "join_english_webinar"] },
    notebookpen: { en: "study notebook & pen", vi: "sổ tay học tập & bút", ipa: "/ˈnoʊt.bʊk ən pen/", acts: ["write_daily_todo_list", "note_new_idioms"] },
    desklamp: { en: "LED eye-care desk lamp", vi: "đèn bàn học chống cận", ipa: "/ˈdesk læmp/", acts: ["turn_on_desk_lamp"] },
    patioumbrella: { en: "canvas patio umbrella", vi: "dù vải che nắng sân thượng", ipa: "/ˈpæt.i.oʊ ʌmˈbrel.ə/", acts: ["tilt_sun_umbrella", "sit_in_shaded_breeze"] },
    bambooplanter: { en: "olive & bamboo planters", vi: "hàng chậu trúc & ô-liu", ipa: "/ˈplɑːn.tər bɑks/", acts: ["admire_olive_planter"] },
    stringlights: { en: "warm bistro string lights", vi: "giàn đèn dây vàng ấm", ipa: "/ˈstrɪŋ laɪts/", acts: ["watch_glowing_bistro_lights"] },
    cityviewrail: { en: "rooftop glass railing", vi: "lan can kính ngắm phố", ipa: "/ɡlɑːs ˈreɪ.lɪŋ/", acts: ["look_out_over_rooftops", "spot_park_from_terrace"] },
    watercarafe: { en: "lemon-mint water carafe", vi: "bình nước chanh bạc hà", ipa: "/ˈwɔː.tər kəˈræf/", acts: ["pour_warm_lemon_water"] },
    printerstation: { en: "wireless printer station", vi: "quầy máy in không dây", ipa: "/ˈwaɪr.ləs ˈprɪn.tər/", acts: ["print_study_worksheet", "staple_printed_pages"] },
    whiteboard: { en: "focus-sprint whiteboard", vi: "bảng trắng mục tiêu học tập", ipa: "/ˈwaɪt.bɔːd/", acts: ["check_sprint_goals", "write_study_goal_on_board"] },
    ergostool: { en: "padded ergonomic stool", vi: "ghế đẩu công thái học", ipa: "/ˈbɑː stuːl/", acts: ["adjust_ergonomic_stool"] },
    patioheater: { en: "radiant patio heater", vi: "cột đèn sưởi sân thượng", ipa: "/ˈpæt.i.oʊ ˈhiː.tər/", acts: ["turn_on_patio_heater"] },
    succulentpot: { en: "rosemary & succulent pot", vi: "chậu sen đá & hương thảo", ipa: "/ˈsʌk.jə.lənt pɑt/", acts: ["water_rosemary_herbs"] },
    quietzonesign: { en: "coworking etiquette sign", vi: "biển quy tắc góc làm việc", ipa: "/ˈkwaɪ.ət zoʊn saɪn/", acts: ["read_quiet_call_etiquette", "place_phone_on_stand"] },
    coworkeralex: { en: "UI designer Alex", vi: "nhà thiết kế Alex", ipa: "/dɪˈzaɪ.nər/", acts: ["greet_coworker_alex", "ask_alex_watch_laptop", "share_keyboard_shortcut"] },
    remotesophie: { en: "remote worker Sophie", vi: "bạn làm việc từ xa Sophie", ipa: "/rɪˈmoʊt ˈwɜː.kər/", acts: ["greet_remote_sophie", "practice_english_pitch_with_sophie", "ask_sophie_wifi_speed"] }
  };

  /* ---------- Zone 1 New Actions: Order & Payment Counter (16 new actions -> 75 total) ---------- */
  const COUNTER_NEW_ACTIONS = [
    cfA("read_daily_special", "dailyspecial", "Read the daily special", "Đọc bảng món đặc biệt hôm nay",
      "Let's see—today's daily special is a warm honey oat latte with a freshly baked croissant.",
      "Xem nào — món đặc biệt hôm nay là latte yến mạch mật ong ấm kèm bánh sừng bò mới nướng.",
      ["daily special", "oat", "freshly baked"], ["special", "oat", "fresh"],
      "<b>today's daily special</b> = món đặc biệt trong ngày hôm nay.",
      ["Let's see—today's daily special", "is a warm honey oat latte with a freshly baked croissant."],
      ["special", "spatial", "social"],
      ["What is <b>today's daily special</b>?", "The croissants are <b>freshly baked</b>."],
      once("cf_z1_special", "yes", "Bạn đã xem món đặc biệt hôm nay rồi."),
      at("cf_menu", "read", 800, [["cf_z1_special", "yes"]]),
      ["read the daily special", "read today's daily special on the board", "đọc bảng món đặc biệt hôm nay"]),

    cfA("check_allergen_chart", "allergensign", "Check the allergen chart", "Xem bảng thông tin dị ứng",
      "I'm checking the allergen chart to see which pastries are gluten-free and nut-free.",
      "Mình đang xem bảng thông tin dị ứng để biết loại bánh nào không chứa gluten và không có hạt.",
      ["allergen", "gluten-free"], ["allergen", "glutenfree", "allergic"],
      "<b>allergen chart</b> = bảng tra cứu thành phần dị ứng; <b>gluten-free</b> = không chứa gluten.",
      ["I'm checking the allergen chart", "to see which pastries are gluten-free and nut-free."],
      ["allergen", "allergy", "allergic"],
      ["Please check the <b>allergen chart</b>.", "Do you have any <b>gluten-free</b> cakes?"],
      once("cf_z1_allergen", "yes", "Bạn đã xem bảng thông tin dị ứng rồi."),
      at("cf_pastry", "read", 800, [["cf_z1_allergen", "yes"]]),
      ["check the allergen chart", "check the allergen chart for gluten-free pastries", "xem bảng thông tin dị ứng"]),

    cfA("tap_card_on_pos", "posreader", "Tap my contactless card", "Chạm thẻ thanh toán không tiếp xúc",
      "I'll just tap my contactless card on the reader until it beeps.",
      "Mình chỉ cần chạm thẻ không tiếp xúc lên máy đọc cho đến khi máy kêu bíp.",
      ["contactless", "reader"], ["contactless", "reader", "pay"],
      "<b>contactless card</b> = thẻ thanh toán chạm (không cần quẹt hay nhập PIN).",
      ["I'll just tap my contactless card", "on the reader until it beeps."],
      ["reader", "leader", "ready"],
      ["Hold your <b>contactless</b> card near the <b>reader</b>.", "Wait until the <b>card reader</b> beeps."],
      once("cf_z1_pos", "yes", "Bạn đã chạm thẻ lên máy đọc rồi."),
      at("cf_register", "reach", 750, [["cf_z1_pos", "yes"]]),
      ["tap my contactless card", "tap my contactless card on the reader", "chạm thẻ thanh toán"]),

    cfA("check_receipt_paper", "receiptprinter", "Wait for the printed receipt", "Đợi máy in hoá đơn",
      "The receipt printer is printing out my itemized order number right now.",
      "Máy in hoá đơn đang in số thứ tự đơn hàng chi tiết của mình ngay lúc này.",
      ["receipt printer", "order"], ["printer", "receipt", "order"],
      "<b>print out</b> = in ra. <b>order number</b> = số thứ tự nhận đồ.",
      ["The receipt printer is printing out", "my itemized order number right now."],
      ["printer", "pointer", "painter"],
      ["Your <b>order number</b> is on the receipt.", "The <b>receipt printer</b> is very fast."],
      once("cf_z1_printer", "yes", "Bạn đã nhận số thứ tự từ máy in hoá đơn rồi."),
      at("cf_register", "read", 700, [["cf_z1_printer", "yes"]]),
      ["wait for the printed receipt", "check my order number on the receipt printer", "đợi máy in hoá đơn"]),

    cfA("buy_chocolate_cookie", "cookiejar", "Get a chocolate chip cookie", "Mua bánh quy sô-cô-la",
      "Could I also get a warm chocolate chip cookie from the glass jar, please?",
      "Cho mình lấy thêm một chiếc bánh quy hạt sô-cô-la ấm từ trong hũ thuỷ tinh nhé?",
      ["chocolate cookie", "jar"], ["cookie", "jar", "warm"],
      "<b>chocolate chip cookie</b> = bánh quy rắc hạt sô-cô-la.",
      ["Could I also get a warm chocolate chip cookie", "from the glass jar, please?"],
      ["cookie", "cooking", "cooker"],
      ["This <b>chocolate cookie</b> is still warm!", "There are fresh cookies in the <b>jar</b>."],
      once("cf_z1_cookie", "yes", "Bạn đã mua bánh quy sô-cô-la rồi."),
      at("cf_pastry", "point", 750, [["cf_z1_cookie", "yes"], ["cf_snack", "bought"]]),
      ["get a chocolate chip cookie", "buy a chocolate chip cookie from the jar", "mua bánh quy sô-cô-la"]),

    cfA("choose_pistachio_macaron", "macaronstand", "Pick a pistachio macaron", "Chọn bánh macaron hạt dẻ cười",
      "These French macarons look delightful—I'd love to try the green pistachio one.",
      "Những chiếc bánh macaron Pháp này trông thật hấp dẫn — mình muốn thử vị hạt dẻ cười màu xanh.",
      ["macarons", "pistachio"], ["macaron", "pistachio", "try"],
      "<b>macaron</b> /ˌmæk.əˈrɑn/ = bánh hạnh nhân kẹp kem kiểu Pháp; <b>pistachio</b> = hạt dẻ cười.",
      ["These French macarons look delightful—", "I'd love to try the green pistachio one."],
      ["pistachio", "mustache", "patio"],
      ["I love <b>pistachio</b> ice cream and <b>macarons</b>.", "Which <b>macaron</b> flavor do you want?"],
      once("cf_z1_macaron", "yes", "Bạn đã chọn bánh macaron hạt dẻ cười rồi."),
      at("cf_pastry", "point", 750, [["cf_z1_macaron", "yes"], ["cf_snack", "bought"]]),
      ["pick a pistachio macaron", "choose a green pistachio macaron", "chọn bánh macaron hạt dẻ cười"]),

    cfA("buy_coffee_gift_card", "giftcardrack", "Buy a coffee gift card", "Mua thẻ quà tặng cà phê",
      "I'd like to put twenty dollars on this coffee gift card for my teacher.",
      "Mình muốn nạp hai mươi đô vào chiếc thẻ quà tặng cà phê này để tặng cô giáo.",
      ["gift card", "twenty"], ["giftcard", "pay"],
      "<b>put + số tiền + on a gift card</b> = nạp bao nhiêu tiền vào thẻ quà tặng.",
      ["I'd like to put twenty dollars", "on this coffee gift card for my teacher."],
      ["gift", "give", "lift"],
      ["A <b>gift card</b> is a thoughtful present.", "Can I load ten dollars on this <b>gift card</b>?"],
      once("cf_z1_giftcard", "yes", "Bạn đã mua thẻ quà tặng cà phê rồi."),
      at("cf_register", "reach", 800, [["cf_z1_giftcard", "yes"]]),
      ["buy a coffee gift card", "put twenty dollars on a coffee gift card", "mua thẻ quà tặng cà phê"]),

    cfA("smell_roasted_bean_bag", "beanbagdisplay", "Check the medium-roast beans", "Xem túi hạt cà phê rang vừa",
      "This bag of medium-roast Arabica beans has notes of dark chocolate and toasted hazelnut.",
      "Túi hạt cà phê Arabica rang vừa này có hương vị sô-cô-la đen và hạt phỉ nướng.",
      ["medium-roast", "beans"], ["roast", "beans", "aroma"],
      "<b>notes of …</b> = tầng hương vị của … (dùng khi miêu tả cà phê, trà).",
      ["This bag of medium-roast Arabica beans", "has notes of dark chocolate and toasted hazelnut."],
      ["roast", "toast", "coast"],
      ["Do you prefer light roast or <b>medium roast</b>?", "We sell whole <b>coffee beans</b> to take home."],
      once("cf_z1_beanbag", "yes", "Bạn đã xem túi hạt cà phê rang vừa rồi."),
      at("cf_menu", "reach", 800, [["cf_z1_beanbag", "yes"]]),
      ["check the medium-roast beans", "inspect a bag of medium-roast coffee beans", "xem túi hạt cà phê rang vừa"]),

    cfA("ask_decaf_bean_origin", "beanbagdisplay", "Ask about single-origin beans", "Hỏi nguồn gốc hạt cà phê",
      "Excuse me, are these single-origin coffee beans from Đà Lạt or Colombia?",
      "Xin lỗi, túi hạt cà phê đơn nguồn gốc này là từ Đà Lạt hay Colombia vậy ạ?",
      ["single-origin", "beans"], ["origin", "beans"],
      "<b>single-origin</b> = cà phê từ một vùng trồng duy nhất, giữ trọn hương vị đặc trưng.",
      ["Excuse me, are these single-origin coffee beans", "from Đà Lạt or Colombia?"],
      ["origin", "orange", "original"],
      ["These <b>single-origin</b> beans are from Đà Lạt.", "Can you grind these <b>coffee beans</b> for me?"],
      once("cf_z1_origin", "yes", "Bạn đã hỏi về nguồn gốc hạt cà phê rồi."),
      at("cf_menu", "point", 750, [["cf_z1_origin", "yes"]]),
      ["ask about single-origin beans", "ask where the single-origin beans come from", "hỏi nguồn gốc hạt cà phê"]),

    cfA("ring_counter_bell", "handbell", "Ring the service bell gently", "Bấm chuông gọi nhân viên",
      "I'll tap the little service bell once so the cashier knows I'm ready to order.",
      "Mình sẽ bấm nhẹ chuông gọi phục vụ một tiếng để thu ngân biết mình đã sẵn sàng gọi món.",
      ["service bell", "order"], ["bell", "order"],
      "<b>tap / ring the bell once</b> = bấm chuông nhẹ một lần lịch sự.",
      ["I'll tap the little service bell once", "so the cashier knows I'm ready to order."],
      ["bell", "ball", "bill"],
      ["Ring the <b>service bell</b> if you need help.", "I'm ready to <b>order</b> now."],
      once("cf_z1_bell", "yes", "Bạn đã bấm chuông gọi nhân viên rồi."),
      at("cf_register", "reach", 650, [["cf_z1_bell", "yes"]]),
      ["ring the service bell gently", "tap the service bell at the counter", "bấm chuông gọi nhân viên"]),

    cfA("use_counter_sanitizer", "sanitizersp", "Clean hands with sanitizer", "Rửa tay khô trước khi ăn bánh",
      "Let me use a pump of hand sanitizer at the counter before eating my pastry.",
      "Để mình xịt một chút nước rửa tay khô ở quầy trước khi ăn bánh ngọt.",
      ["hand sanitizer"], ["sanitizer", "clean"],
      "<b>a pump of hand sanitizer</b> = một lần nhấn chai nước rửa tay khô.",
      ["Let me use a pump of hand sanitizer", "at the counter before eating my pastry."],
      ["clean", "clear", "cream"],
      ["There's <b>hand sanitizer</b> right by the register.", "Always <b>clean</b> your hands before eating."],
      once("cf_z1_sanitizer", "yes", "Bạn đã dùng nước rửa tay khô rồi."),
      at("cf_register", "reach", 650, [["cf_z1_sanitizer", "yes"]]),
      ["clean hands with sanitizer", "use hand sanitizer at the counter", "rửa tay khô trước khi ăn bánh"]),

    cfA("take_order_buzzer", "buzzerstack", "Take the wireless order buzzer", "Nhận thẻ rung báo đồ uống",
      "Thank you! I'll keep this order buzzer with me until it lights up and vibrates.",
      "Cảm ơn nhé! Mình sẽ cầm thẻ rung báo đơn này cho đến khi nó sáng đèn và rung lên.",
      ["order buzzer"], ["buzzer", "wait", "order"],
      "<b>order buzzer / pager</b> = thiết bị rung báo hiệu đồ uống đã pha xong.",
      ["Thank you! I'll keep this order buzzer with me", "until it lights up and vibrates."],
      ["buzzer", "butter", "brother"],
      ["Your <b>order buzzer</b> will vibrate when your drink is ready.", "Bring the <b>buzzer</b> to the pickup bar."],
      once("cf_z1_buzzer", "yes", "Bạn đã nhận thẻ rung báo đơn rồi."),
      at("cf_counter", "reach", 700, [["cf_z1_buzzer", "yes"]]),
      ["take the wireless order buzzer", "take the order buzzer from the barista", "nhận thẻ rung báo đồ uống"]),

    cfA("admire_ceramic_mug", "merchmug", "Look at the handmade ceramic mugs", "Ngắm kệ cốc sứ làm tay",
      "These handmade ceramic mugs on the display shelf keep hot coffee warm for a long time.",
      "Những chiếc cốc sứ làm thủ công trên kệ trưng bày này giữ cho cà phê nóng ấm rất lâu.",
      ["ceramic mugs", "warm"], ["ceramic", "warm", "shelf"],
      "<b>handmade ceramic mug</b> = cốc sứ làm thủ công bằng tay.",
      ["These handmade ceramic mugs on the display shelf", "keep hot coffee warm for a long time."],
      ["mug", "rug", "hug"],
      ["I love drinking tea from a <b>ceramic mug</b>.", "The mugs on the top <b>shelf</b> are for sale."],
      once("cf_z1_mug", "yes", "Bạn đã ngắm kệ cốc sứ rồi."),
      at("cf_tipspot", "read", 750, [["cf_z1_mug", "yes"]]),
      ["look at the handmade ceramic mugs", "admire the ceramic mugs on the shelf", "ngắm kệ cốc sứ làm tay"]),

    cfA("ask_pastry_freshness", "pastrybarista", "Ask what just came out of the oven", "Hỏi món bánh nào vừa ra lò",
      "Excuse me, which pastries in the display case just came warm out of the oven?",
      "Xin lỗi, những loại bánh nào trong tủ kính vừa mới ra lò còn nóng hổi vậy ạ?",
      ["freshly baked", "warm"], ["fresh", "warm", "croissant"],
      "<b>come out of the oven</b> = vừa ra lò nướng.",
      ["Excuse me, which pastries in the display case", "just came warm out of the oven?"],
      ["warm", "worm", "warn"],
      ["The almond croissants are <b>freshly baked</b>.", "They just came <b>warm</b> out of the oven."],
      once("cf_z1_freshpastry", "yes", "Bạn đã hỏi nhân viên quầy bánh rồi."),
      at("cf_pastry", "point", 750, [["cf_z1_freshpastry", "yes"]]),
      ["ask what just came out of the oven", "ask the pastry server which pastries are warm", "hỏi món bánh nào vừa ra lò"]),

    cfA("ask_warm_ginger_tea_counter", "pastrybarista", "Order hot ginger honey tea", "Gọi trà gừng mật ong nóng ấm",
      "Since it's chilly today, could I order a steaming cup of hot ginger honey tea, please?",
      "Vì hôm nay trời se lạnh, cho mình gọi một tách trà gừng mật ong nóng bốc khói nhé?",
      ["ginger", "honey", "hot"], ["ginger", "honey", "hot", "tea"],
      "<b>a steaming cup of …</b> = một tách … nóng bốc khói, rất hợp khi trời lạnh hoặc đau họng.",
      ["Since it's chilly today,", "could I order a steaming cup of hot ginger honey tea, please?"],
      ["ginger", "finger", "singer"],
      ["Hot <b>ginger</b> and <b>honey</b> tea warms you right up.", "I'd love a <b>hot tea</b> on a cold day."],
      once("cf_z1_gingertea", "yes", "Bạn đã gọi trà gừng mật ong nóng rồi."),
      at("cf_pastry", "point", 750, [["cf_z1_gingertea", "yes"], ["cf_order", "ordered"], ["cf_item", "latte"], ["cf_temp", "hot"]]),
      ["order hot ginger honey tea", "order a steaming cup of hot ginger honey tea", "gọi trà gừng mật ong nóng ấm"]),

    cfA("read_welcome_chalkboard", "welcomechalk", "Read the welcome chalkboard quote", "Đọc câu trích dẫn trên bảng phấn",
      "The welcome chalkboard by the queue says: 'Life begins after a good cup of warm coffee.'",
      "Bảng phấn chào khách cạnh lối xếp hàng viết: 'Cuộc sống bắt đầu sau một tách cà phê ấm ngon lành.'",
      ["chalkboard", "coffee"], ["chalkboard", "coffee", "warm"],
      "<b>quote</b> = câu trích dẫn hay được viết bằng phấn trên bảng chào khách.",
      ["The welcome chalkboard by the queue says:", "'Life begins after a good cup of warm coffee.'"],
      ["chalk", "talk", "walk"],
      ["Look at the cute drawing on the <b>chalkboard</b>.", "Nothing beats a <b>warm coffee</b> in the morning."],
      once("cf_z1_chalk", "yes", "Bạn đã đọc bảng phấn chào khách rồi."),
      at("cf_queue", "read", 750, [["cf_z1_chalk", "yes"]]),
      ["read the welcome chalkboard quote", "read the quote on the welcome chalkboard", "đọc câu trích dẫn trên bảng phấn"])
  ];

  /* ---------- Zone 2 New Actions: Espresso Bar & Pickup (22 new actions -> 45 total) ---------- */
  const BAR_NEW_ACTIONS = [
    cfA("hear_grinder_hum", "coffeegrinder", "Listen to the coffee grinder", "Nghe tiếng máy xay hạt cà phê",
      "The burr coffee grinder is grinding fresh espresso beans with a steady hum.",
      "Chiếc máy xay đang nghiền những hạt cà phê espresso tươi mới với tiếng kêu đều đặn.",
      ["coffee grinder", "beans"], ["grinder", "beans", "espresso"],
      "<b>grind → grinding</b> = xay nhỏ hạt cà phê ngay trước khi pha.",
      ["The burr coffee grinder is grinding", "fresh espresso beans with a steady hum."],
      ["grinder", "finder", "kinder"],
      ["Freshly ground beans make the best <b>espresso</b>.", "The <b>coffee grinder</b> is right beside the machine."],
      once("cf_z2_grinder", "yes", "Bạn đã xem máy xay cà phê hoạt động rồi."),
      at("cf_pickup", "read", 750, [["cf_z2_grinder", "yes"]]),
      ["listen to the coffee grinder", "watch the coffee grinder grind fresh beans", "nghe tiếng máy xay hạt cà phê"]),

    cfA("ask_for_fine_grind", "coffeegrinder", "Ask to grind my coffee beans", "Nhờ xay mịn túi hạt cà phê",
      "Could you grind this bag of beans on a fine grind setting for my espresso maker at home?",
      "Bạn xay giúp mình túi hạt này ở mức mịn để pha máy espresso ở nhà được không?",
      ["fine grind", "beans"], ["grind", "beans", "espresso"],
      "<b>on a fine / medium / coarse grind</b> = ở chế độ xay mịn / vừa / thô.",
      ["Could you grind this bag of beans", "on a fine grind setting for my espresso maker at home?"],
      ["grind", "grand", "ground"],
      ["Espresso needs a <b>fine grind</b>.", "Pour-over coffee uses a medium <b>grind</b>."],
      once("cf_z2_finegrind", "yes", "Bạn đã nhờ xay hạt cà phê rồi."),
      at("cf_pickup", "point", 750, [["cf_z2_finegrind", "yes"]]),
      ["ask to grind my coffee beans", "ask the barista for a fine grind", "nhờ xay mịn túi hạt cà phê"]),

    cfA("watch_latte_art_pour", "milksteamer", "Watch the barista pour latte art", "Xem nghệ thuật rót bọt sữa",
      "Look at how smoothly the barista pours velvety microfoam from the steel milk pitcher!",
      "Nhìn cách nhân viên rót lớp bọt sữa siêu mịn từ chiếc ca inox tạo hình khéo léo chưa kìa!",
      ["microfoam", "milk pitcher"], ["foam", "pitcher", "latteart"],
      "<b>microfoam</b> = bọt sữa mịn mượt như nhung để vẽ <b>latte art</b>.",
      ["Look at how smoothly the barista pours", "velvety microfoam from the steel milk pitcher!"],
      ["pitcher", "picture", "catcher"],
      ["He pours <b>microfoam</b> from the <b>milk pitcher</b>.", "That tulip <b>latte art</b> looks amazing!"],
      once("cf_z2_artpour", "yes", "Bạn đã xem rót tạo hình bọt sữa rồi."),
      at("cf_pickup", "read", 800, [["cf_z2_artpour", "yes"]]),
      ["watch the barista pour latte art", "watch the barista pour microfoam from the pitcher", "xem nghệ thuật rót bọt sữa"]),

    cfA("ask_for_extra_foam", "milksteamer", "Ask for extra warm foam", "Xin thêm lớp bọt sữa ấm",
      "Could I get a little extra warm milk foam on top of my cappuccino, please?",
      "Cho mình xin thêm một chút bọt sữa ấm mịn lên trên ly cappuccino nhé?",
      ["extra", "foam", "warm"], ["extra", "foam", "warm", "cappuccino"],
      "<b>extra foam</b> = nhiều bọt sữa hơn; <b>no foam</b> = không lấy bọt.",
      ["Could I get a little extra warm milk foam", "on top of my cappuccino, please?"],
      ["foam", "form", "farm"],
      ["I love a dry cappuccino with <b>extra foam</b>.", "The steamed milk <b>foam</b> is so warm."],
      once("cf_z2_extrafoam", "yes", "Bạn đã xin thêm bọt sữa ấm rồi."),
      at("cf_pickup", "point", 750, [["cf_z2_extrafoam", "yes"]]),
      ["ask for extra warm foam", "ask the barista for extra foam on my cappuccino", "xin thêm lớp bọt sữa ấm"]),

    cfA("pump_vanilla_syrup", "syruprack", "Add a pump of vanilla syrup", "Thêm một nhấn si-rô va-ni",
      "I'm adding one light pump of sweet vanilla syrup to give my coffee a gentle aroma.",
      "Mình đang thêm một nhấn nhẹ si-rô va-ni ngọt dịu để ly cà phê có hương thơm thoang thoảng.",
      ["vanilla syrup", "aroma"], ["syrup", "aroma", "coffee"],
      "<b>a pump of syrup</b> = một lần nhấn vòi si-rô (vanilla, hazelnut, caramel).",
      ["I'm adding one light pump of sweet vanilla syrup", "to give my coffee a gentle aroma."],
      ["syrup", "stirrup", "chirp"],
      ["Would you like a pump of <b>vanilla syrup</b>?", "Just half a pump of <b>syrup</b>, please."],
      once("cf_z2_vanilla", "yes", "Bạn đã thêm si-rô va-ni rồi."),
      at("cf_station", "pour", 750, [["cf_z2_vanilla", "yes"]]),
      ["add a pump of vanilla syrup", "add vanilla syrup at the condiment bar", "thêm một nhấn si-rô va-ni"]),

    cfA("pump_caramel_drizzle", "syruprack", "Ask for caramel drizzle", "Xin rưới sốt caramel",
      "Could you add a little warm caramel drizzle across the foam, please?",
      "Bạn rưới giúp mình một chút sốt caramel ấm lên trên lớp bọt sữa nhé?",
      ["caramel drizzle", "foam"], ["caramel", "foam", "please"],
      "<b>caramel drizzle</b> = đường/sốt caramel rưới thành vệt mảnh trang trí trên mặt đồ uống.",
      ["Could you add a little warm caramel drizzle", "across the foam, please?"],
      ["caramel", "camera", "camel"],
      ["Top it with <b>caramel drizzle</b>, please.", "A caramel macchiato has <b>caramel drizzle</b> on top."],
      once("cf_z2_caramel", "yes", "Bạn đã xin rưới sốt caramel rồi."),
      at("cf_pickup", "point", 750, [["cf_z2_caramel", "yes"]]),
      ["ask for caramel drizzle", "ask for caramel drizzle on the foam", "xin rưới sốt caramel"]),

    cfA("watch_pourover_bloom", "pouroverbar", "Watch the pour-over coffee bloom", "Ngắm cà phê thủ công nở hương",
      "When hot water hits the fresh grounds in the pour-over dripper, the coffee blooms beautifully.",
      "Khi nước nóng chạm vào lớp bột cà phê mới xay trong phễu lọc, cà phê nở bọt thơm lừng.",
      ["pour-over", "blooms"], ["pourover", "bloom", "hot"],
      "<b>pour-over</b> = phương pháp pha cà phê rót tay qua giấy lọc; <b>bloom</b> = cà phê nở khí thơm.",
      ["When hot water hits the fresh grounds in the pour-over dripper,", "the coffee blooms beautifully."],
      ["bloom", "broom", "room"],
      ["Hand-brewed <b>pour-over</b> coffee tastes clean and bright.", "Wait thirty seconds for the <b>coffee bloom</b>."],
      once("cf_z2_pourover", "yes", "Bạn đã ngắm pha cà phê pour-over rồi."),
      at("cf_pickup", "read", 800, [["cf_z2_pourover", "yes"]]),
      ["watch the pour-over coffee bloom", "watch the barista brew pour-over coffee", "ngắm cà phê thủ công nở hương"]),

    cfA("ask_about_single_origin", "pouroverbar", "Ask which pour-over is brewing", "Hỏi loại hạt đang pha thủ công",
      "Excuse me, which single-origin bean are you brewing at the pour-over bar this morning?",
      "Xin lỗi, sáng nay quầy pha thủ công đang dùng loại hạt đơn nguồn gốc nào vậy ạ?",
      ["single-origin", "pour-over"], ["origin", "pourover"],
      "<b>brew → brewing</b> = pha/ủ (cà phê hoặc trà).",
      ["Excuse me, which single-origin bean are you brewing", "at the pour-over bar this morning?"],
      ["brewing", "bringing", "growing"],
      ["We're brewing a floral <b>single-origin</b> Ethiopian bean.", "A <b>pour-over</b> takes about three minutes."],
      once("cf_z2_askpourover", "yes", "Bạn đã hỏi về cà phê pour-over rồi."),
      at("cf_pickup", "point", 750, [["cf_z2_askpourover", "yes"]]),
      ["ask which pour-over is brewing", "ask about the single-origin pour-over", "hỏi loại hạt đang pha thủ công"]),

    cfA("pour_free_filtered_water", "waterdispenser", "Pour a cup of filtered water", "Rót một cốc nước lọc miễn phí",
      "I'm pouring myself a cup of room-temperature filtered water from the self-serve station.",
      "Mình đang tự rót một cốc nước lọc ở nhiệt độ phòng tại quầy phục vụ tự chọn.",
      ["filtered water", "cup"], ["filtered", "water", "cup"],
      "<b>pour myself …</b> = tự rót cho mình …; <b>room-temperature</b> = nhiệt độ thường (không đá).",
      ["I'm pouring myself a cup of room-temperature filtered water", "from the self-serve station."],
      ["filtered", "filled", "folded"],
      ["Help yourself to free <b>filtered water</b>.", "Room-temperature <b>water</b> is gentle on the throat."],
      once("cf_z2_freewater", "yes", "Bạn đã rót nước lọc miễn phí rồi."),
      at("cf_station", "pour", 750, [["cf_z2_freewater", "yes"]]),
      ["pour a cup of filtered water", "pour free filtered water at the station", "rót một cốc nước lọc miễn phí"]),

    cfA("rinse_travel_cup", "waterdispenser", "Rinse my reusable tumbler", "Tráng sạch bình cá nhân",
      "Let me quickly rinse my reusable thermos with warm water before the barista fills it.",
      "Để mình tráng nhanh bình giữ nhiệt cá nhân bằng nước ấm trước khi nhân viên rót cà phê vào.",
      ["reusable", "warm"], ["reusable", "thermos", "warm"],
      "<b>rinse</b> /rɪns/ = tráng sơ bằng nước sạch.",
      ["Let me quickly rinse my reusable thermos", "with warm water before the barista fills it."],
      ["rinse", "since", "prince"],
      ["Please <b>rinse</b> your mug before refilling.", "I brought my own <b>reusable thermos</b>."],
      once("cf_z2_rinse", "yes", "Bạn đã tráng bình giữ nhiệt rồi."),
      at("cf_station", "pour", 700, [["cf_z2_rinse", "yes"]]),
      ["rinse my reusable tumbler", "rinse my travel thermos with warm water", "tráng sạch bình cá nhân"]),

    cfA("watch_matcha_whisking", "matchawhisk", "Watch the bamboo matcha whisk", "Xem đánh trà matcha bằng chổi tre",
      "The barista uses a traditional bamboo whisk to whisk warm ceremonial matcha until it's frothy.",
      "Nhân viên dùng chổi tre truyền thống khuấy đều bột trà matcha ấm cho đến khi lên bọt mịn.",
      ["bamboo whisk", "matcha"], ["whisk", "matcha", "warm"],
      "<b>bamboo whisk</b> (chasen) = chổi tre đánh trà đạo Nhật Bản; <b>frothy</b> = sủi bọt mịn.",
      ["The barista uses a traditional bamboo whisk", "to whisk warm ceremonial matcha until it's frothy."],
      ["whisk", "wish", "risk"],
      ["Whisk the <b>matcha</b> in a zigzag motion.", "A <b>bamboo whisk</b> prevents clumps in the tea."],
      once("cf_z2_whisk", "yes", "Bạn đã xem đánh trà matcha bằng chổi tre rồi."),
      at("cf_pickup", "read", 750, [["cf_z2_whisk", "yes"]]),
      ["watch the bamboo matcha whisk", "watch the barista whisk warm matcha", "xem đánh trà matcha bằng chổi tre"]),

    cfA("check_blender_lid", "blenderstation", "Notice the quiet sound enclosure", "Chú ý lồng chụp chống ồn máy xay",
      "That plastic sound cover over the blender keeps the café peaceful and quiet.",
      "Chiếc lồng nhựa chụp cách âm bên ngoài máy xay giúp quán cà phê luôn yên tĩnh và dễ chịu.",
      ["blender", "quiet"], ["blender", "quiet"],
      "<b>sound cover / enclosure</b> = hộp chụp giảm tiếng ồn của máy xay công suất lớn.",
      ["That plastic sound cover over the blender", "keeps the café peaceful and quiet."],
      ["blender", "slender", "calendar"],
      ["Put the lid on the <b>blender</b> tightly.", "Even with the <b>blender</b> running, it's still <b>quiet</b>."],
      once("cf_z2_blender", "yes", "Bạn đã quan sát máy xay chống ồn rồi."),
      at("cf_pickup", "read", 700, [["cf_z2_blender", "yes"]]),
      ["notice the quiet sound enclosure", "look at the sound cover on the blender", "chú ý lồng chụp chống ồn máy xay"]),

    cfA("feel_warm_ceramic_cup", "cupwarmer", "Check the pre-warmed mugs", "Xem khay ủ ấm tách sứ",
      "All the porcelain cups on top of the espresso machine are kept nice and warm.",
      "Tất cả những chiếc tách sứ đặt phía trên máy pha espresso đều được ủ ấm áp dễ chịu.",
      ["cup warmer", "warm"], ["warmer", "warm", "cup"],
      "<b>pre-warmed cup</b> = tách sứ được làm ấm sẵn để cà phê không bị nguội nhanh.",
      ["All the porcelain cups on top of the espresso machine", "are kept nice and warm."],
      ["warmer", "farmer", "former"],
      ["A <b>cup warmer</b> keeps espresso mugs at the right temperature.", "Serving coffee in a <b>warm</b> mug tastes better."],
      once("cf_z2_warmer", "yes", "Bạn đã xem khay ủ ấm tách sứ rồi."),
      at("cf_cups", "reach", 700, [["cf_z2_warmer", "yes"]]),
      ["check the pre-warmed mugs", "feel the warm cups on the cup warmer tray", "xem khay ủ ấm tách sứ"]),

    cfA("take_four_cup_carrier", "carrierholder", "Grab a four-cup drink carrier", "Lấy khay giấy 4 ngăn",
      "I'm grabbing a sturdy four-cup drink carrier so our hot lattes won't tip over.",
      "Mình lấy một chiếc khay giấy bốn ngăn chắc chắn để những ly latte nóng không bị nghiêng đổ.",
      ["drink carrier", "hot"], ["carrier", "carry", "hot"],
      "<b>tip over</b> = bị nghiêng đổ. <b>sturdy</b> = cứng cáp, chắc chắn.",
      ["I'm grabbing a sturdy four-cup drink carrier", "so our hot lattes won't tip over."],
      ["carrier", "career", "barrier"],
      ["Place each cup firmly in the <b>drink carrier</b>.", "This <b>carrier</b> holds up to four cups."],
      once("cf_z2_carrier", "yes", "Bạn đã lấy khay giấy 4 ngăn rồi."),
      at("cf_cups", "reach", 700, [["cf_z2_carrier", "yes"]]),
      ["grab a four-cup drink carrier", "take a cardboard drink carrier for our cups", "lấy khay giấy 4 ngăn"]),

    cfA("dust_cocoa_powder", "cinnamonshaker", "Dust cocoa powder on my foam", "Rắc bột ca cao lên bọt sữa",
      "A light dusting of unsweetened cocoa powder makes my cappuccino smell heavenly!",
      "Rắc một lớp mỏng bột ca cao nguyên chất làm ly cappuccino của mình thơm nức mũi!",
      ["cocoa powder", "cappuccino"], ["cocoa", "cappuccino", "fragrant"],
      "<b>a light dusting of …</b> = một lớp rắc mỏng nhẹ (ca cao, đường bột, quế).",
      ["A light dusting of unsweetened cocoa powder", "makes my cappuccino smell heavenly!"],
      ["cocoa", "coconut", "cozy"],
      ["Would you like <b>cocoa powder</b> or cinnamon on your cappuccino?", "The <b>cocoa powder</b> adds a rich chocolate aroma."],
      once("cf_z2_cocoa", "yes", "Bạn đã rắc bột ca cao rồi."),
      at("cf_station", "pour", 750, [["cf_z2_cocoa", "yes"]]),
      ["dust cocoa powder on my foam", "sprinkle cocoa powder on my cappuccino", "rắc bột ca cao lên bọt sữa"]),

    cfA("pour_splash_of_oat_milk", "oatmilkcarton", "Add a splash of oat milk", "Rót thêm chút sữa yến mạch",
      "I'll pour just a small splash of creamy oat milk into my hot Americano.",
      "Mình sẽ rót thêm một chút xíu sữa yến mạch béo mịn vào ly Americano nóng.",
      ["oat milk", "creamy"], ["oat", "creamy", "americano"],
      "<b>a splash of milk</b> = một chút sữa (rót nhanh một ít cho dịu vị đắng).",
      ["I'll pour just a small splash", "of creamy oat milk into my hot Americano."],
      ["splash", "flash", "crash"],
      ["Just <b>a splash of oat milk</b>, please.", "Oat milk is naturally <b>creamy</b> and smooth."],
      once("cf_z2_oatsplash", "yes", "Bạn đã rót thêm chút sữa yến mạch rồi."),
      at("cf_station", "pour", 750, [["cf_z2_oatsplash", "yes"]]),
      ["add a splash of oat milk", "pour a splash of oat milk at the condiment bar", "rót thêm chút sữa yến mạch"]),

    cfA("admire_cold_brew_drip", "icedripper", "Look at the glass brew tower", "Ngắm tháp ủ cà phê thuỷ tinh",
      "That slow-drip glass tower takes twelve hours to brew a smooth batch of coffee.",
      "Chiếc tháp thuỷ tinh nhỏ giọt chậm kia mất mười hai tiếng đồng hồ để ủ ra một mẻ cà phê êm dịu.",
      ["cold brew", "coffee"], ["coldbrew", "coffee"],
      "<b>slow-drip tower</b> = tháp pha cà phê nhỏ giọt từng giọt qua nhiều giờ.",
      ["That slow-drip glass tower takes twelve hours", "to brew a smooth batch of coffee."],
      ["tower", "towel", "power"],
      ["Slow-drip <b>cold brew</b> is less acidic than regular coffee.", "The glass <b>tower</b> looks like a science experiment!"],
      once("cf_z2_coldbrew", "yes", "Bạn đã ngắm tháp ủ cà phê thuỷ tinh rồi."),
      at("cf_pickup", "read", 750, [["cf_z2_coldbrew", "yes"]]),
      ["look at the glass brew tower", "admire the slow-drip coffee tower", "ngắm tháp ủ cà phê thuỷ tinh"]),

    cfA("chat_with_head_barista", "baristaliam", "Ask Liam about espresso extraction", "Hỏi trưởng quầy pha chế về cách chiết xuất",
      "Hi Liam! How many seconds does it take to pull the perfect shot of espresso?",
      "Chào Liam! Cần bao nhiêu giây để chiết xuất ra một shot espresso hoàn hảo vậy?",
      ["shot", "espresso"], ["shot", "espresso", "barista"],
      "<b>pull a shot of espresso</b> = chiết xuất một phần cà phê espresso từ máy.",
      ["Hi Liam! How many seconds does it take", "to pull the perfect shot of espresso?"],
      ["pull", "pool", "full"],
      ["It takes about twenty-eight seconds to <b>pull a shot</b>.", "The <b>barista</b> checks the timer carefully."],
      once("cf_z2_liamchat", "yes", "Bạn đã trò chuyện với trưởng quầy pha chế Liam rồi."),
      at("cf_pickup", "point", 800, [["cf_z2_liamchat", "yes"]]),
      ["ask Liam about espresso extraction", "ask the head barista how to pull a perfect espresso shot", "hỏi trưởng quầy pha chế về cách chiết xuất"]),

    cfA("ask_barista_for_hot_ginger_tea", "baristaliam", "Ask Liam for soothing chamomile tea", "Xin trà hoa cúc mật ong ấm dịu họng",
      "Excuse me, Liam, I'm feeling a little under the weather—could you steep a hot chamomile honey tea for me?",
      "Xin lỗi Liam, mình thấy hơi mệt trong người — bạn ủ giúp mình một tách trà hoa cúc mật ong nóng nhé?",
      ["chamomile tea", "honey", "hot"], ["chamomile", "honey", "hot"],
      "<b>steep tea</b> = ủ/hãm trà trong nước nóng; <b>under the weather</b> = hơi mệt/cảm nhẹ.",
      ["Excuse me, Liam, I'm feeling a little under the weather—", "could you steep a hot chamomile honey tea for me?"],
      ["steep", "sleep", "keep"],
      ["Let the <b>chamomile tea</b> steep for three minutes.", "Warm tea with <b>honey</b> is great when you feel under the weather."],
      once("cf_z2_chamomile", "yes", "Bạn đã nhờ Liam pha trà hoa cúc mật ong ấm rồi."),
      at("cf_pickup", "point", 800, [["cf_z2_chamomile", "yes"]]),
      ["ask Liam for soothing chamomile tea", "ask the head barista for hot chamomile honey tea", "xin trà hoa cúc mật ong ấm dịu họng"]),

    cfA("compliment_latte_heart", "baristaliam", "Compliment the rosetta latte art", "Khen hình vẽ chiếc lá trên mặt cà phê",
      "Thank you, Liam! The rosetta leaf pattern on my warm latte is a work of art!",
      "Cảm ơn Liam nhé! Hình chiếc lá rosetta trên ly latte ấm của mình đúng là một tác phẩm nghệ thuật!",
      ["latte art", "warm"], ["latteart", "warm", "latte"],
      "<b>a work of art</b> = một tác phẩm nghệ thuật (khen đồ ăn/thức uống trình bày đẹp).",
      ["Thank you, Liam! The rosetta leaf pattern", "on my warm latte is a work of art!"],
      ["art", "heart", "part"],
      ["Your <b>latte art</b> is a true work of art!", "She poured a heart on top of my <b>warm latte</b>."],
      once("cf_z2_rosetta", "yes", "Bạn đã khen hình vẽ latte art của Liam rồi."),
      at("cf_pickup", "point", 750, [["cf_z2_rosetta", "yes"]]),
      ["compliment the rosetta latte art", "compliment Liam on the latte art", "khen hình vẽ chiếc lá trên mặt cà phê"]),

    cfA("smell_chamomile_tea_tin", "teacanisters", "Smell the herbal tea canisters", "Ngửi hương trà thảo mộc trong hộp thiếc",
      "These herbal tea tins have soothing chamomile, peppermint, and ginger blends.",
      "Những hộp trà thảo mộc bằng thiếc này có các vị hoa cúc, bạc hà và trà gừng ấm dịu.",
      ["chamomile", "ginger"], ["chamomile", "ginger", "tea"],
      "<b>herbal blend</b> = trà thảo mộc phối trộn (không chứa caffeine, tốt cho cổ họng).",
      ["These herbal tea tins have soothing", "chamomile, peppermint, and ginger blends."],
      ["blend", "friend", "send"],
      ["<b>Chamomile</b> and <b>ginger</b> tea has zero caffeine.", "Which herbal <b>tea</b> blend would you like?"],
      once("cf_z2_teatin", "yes", "Bạn đã xem hộp trà thảo mộc rồi."),
      at("cf_pickup", "reach", 750, [["cf_z2_teatin", "yes"]]),
      ["smell the herbal tea canisters", "check the chamomile and ginger tea tins", "ngửi hương trà thảo mộc trong hộp thiếc"]),

    cfA("watch_barista_knock_puck", "knockbox", "Watch the espresso knock box", "Xem đập bã cà phê vào hộp",
      "After pulling the shot, the barista taps the portafilter against the knock box to recycle the coffee grounds.",
      "Sau khi chiết xuất xong, nhân viên gõ tay cầm pha vào hộp chứa để gom bã cà phê mang đi tái chế.",
      ["knock box", "espresso"], ["knockbox", "espresso"],
      "<b>coffee grounds</b> = bã cà phê (thường được tận dụng làm phân bón cây trồng).",
      ["After pulling the shot, the barista taps the portafilter", "against the knock box to recycle the coffee grounds."],
      ["knock", "lock", "clock"],
      ["Used coffee grounds go into the <b>knock box</b>.", "Gardeners love recycled <b>espresso</b> grounds."],
      once("cf_z2_knockbox", "yes", "Bạn đã xem hộp đập bã cà phê rồi."),
      at("cf_pickup", "read", 700, [["cf_z2_knockbox", "yes"]]),
      ["watch the espresso knock box", "see how the barista empties coffee grounds into the knock box", "xem đập bã cà phê vào hộp"])
  ];
  const SEATING_NEW_ACTIONS = [
    cfA("relax_on_velvet_sofa", "velvetsofa", "Relax on the plush velvet sofa", "Ngồi thư giãn trên ghế sofa nhung",
      "This deep emerald velvet sofa by the fireplace is the coziest spot in the café.",
      "Chiếc ghế sofa nhung màu xanh ngọc lục bảo cạnh lò sưởi này là góc ấm cúng nhất trong quán.",
      ["velvet sofa", "cozy"], ["sofa", "cozy", "warm"],
      "<b>the coziest spot in …</b> = góc ấm cúng, dễ chịu nhất trong … (so sánh nhất).",
      ["This deep emerald velvet sofa by the fireplace", "is the coziest spot in the café."],
      ["velvet", "helmet", "quiet"],
      ["Sink into the plush <b>velvet sofa</b> and relax.", "This lounge corner is so <b>cozy</b> and <b>warm</b>."],
      once("cf_z3_sofa", "yes", "Bạn đã ngồi thư giãn trên ghế sofa nhung rồi."),
      at("cf_table", "sit", 850, [["cf_z3_sofa", "yes"]]),
      ["relax on the plush velvet sofa", "sit on the emerald velvet sofa", "ngồi thư giãn trên ghế sofa nhung"]),

    cfA("fluff_throw_pillow", "velvetsofa", "Adjust the soft cushion behind my back", "Chỉnh lại gối tựa lưng êm ái",
      "Let me prop this soft cushion behind my back while I sip my hot latte.",
      "Để mình kê chiếc gối tựa mềm mại này sau lưng trong lúc nhâm nhi ly latte nóng.",
      ["velvet sofa", "latte", "hot"], ["sofa", "latte", "hot"],
      "<b>prop … behind my back</b> = kê/đặt (gối) tựa phía sau lưng.",
      ["Let me prop this soft cushion behind my back", "while I sip my hot latte."],
      ["cushion", "pushing", "fashion"],
      ["Prop a cushion on the <b>velvet sofa</b> for comfort.", "Enjoy your <b>hot latte</b> in the lounge."],
      once("cf_z3_pillow", "yes", "Bạn đã chỉnh gối tựa lưng trên sofa rồi."),
      at("cf_table", "sit", 750, [["cf_z3_pillow", "yes"]]),
      ["adjust the soft cushion behind my back", "fluff the throw pillow on the sofa", "chỉnh lại gối tựa lưng êm ái"]),

    cfA("browse_art_magazine", "magazinerack", "Flip through a photography magazine", "Lật xem tạp chí nhiếp ảnh trên kệ",
      "I'm flipping through an architecture and photography magazine from the wooden rack.",
      "Mình đang lật xem một cuốn tạp chí kiến trúc và nhiếp ảnh lấy từ kệ gỗ.",
      ["bookshelf", "magazine"], ["bookshelf", "magazine"],
      "<b>flip through a magazine</b> = lật giở xem qua các trang tạp chí.",
      ["I'm flipping through an architecture and photography magazine", "from the wooden rack."],
      ["magazine", "machine", "routine"],
      ["Borrow any <b>magazine</b> from the community <b>bookshelf</b>.", "Please return the <b>magazine</b> when you finish."],
      once("cf_z3_magazine", "yes", "Bạn đã xem tạp chí trên kệ sách rồi."),
      at("cf_sofa", "read", 800, [["cf_z3_magazine", "yes"]]),
      ["flip through a photography magazine", "browse a magazine from the rack", "lật xem tạp chí nhiếp ảnh trên kệ"]),

    cfA("pick_travel_novel", "magazinerack", "Pick a travel guidebook to read", "Chọn một cuốn sách du lịch để đọc",
      "May I borrow this travel guidebook from the magazine rack while I drink my coffee?",
      "Mình mượn cuốn cẩm nang du lịch này trên kệ sách trong lúc uống cà phê được không?",
      ["bookshelf", "coffee"], ["bookshelf", "coffee"],
      "<b>community bookshelf</b> = tủ sách cộng đồng (khách đọc tại chỗ hoặc đổi sách).",
      ["May I borrow this travel guidebook", "from the community bookshelf while I drink my coffee?"],
      ["borrow", "tomorrow", "follow"],
      ["Feel free to borrow any book from the <b>bookshelf</b>.", "A good book pairs wonderfully with hot <b>coffee</b>."],
      once("cf_z3_novel", "yes", "Bạn đã chọn sách du lịch trên kệ rồi."),
      at("cf_sofa", "read", 800, [["cf_z3_novel", "yes"]]),
      ["pick a travel guidebook to read", "borrow a book from the community bookshelf", "chọn một cuốn sách du lịch để đọc"]),

    cfA("warm_hands_by_fireplace", "fireplace", "Warm my hands by the fireplace", "Hơ ấm đôi tay bên lò sưởi",
      "Sitting near the glowing fireplace warms my hands right up on a chilly day.",
      "Ngồi gần lò sưởi ấm hồng giúp đôi tay mình ấm sực lên ngay trong ngày trời se lạnh.",
      ["fireplace", "warm"], ["fireplace", "warm", "cozy"],
      "<b>warm … right up</b> = làm ấm lên nhanh chóng, ngay tức thì.",
      ["Sitting near the glowing fireplace", "warms my hands right up on a chilly day."],
      ["fireplace", "workplace", "replace"],
      ["Let's sit beside the <b>fireplace</b> where it's <b>warm</b>.", "The crackle of the <b>fireplace</b> makes the room so <b>cozy</b>."],
      once("cf_z3_firewarm", "yes", "Bạn đã hơ ấm tay bên lò sưởi rồi."),
      at("cf_sofa", "reach", 800, [["cf_z3_firewarm", "yes"]]),
      ["warm my hands by the fireplace", "sit near the glowing fireplace", "hơ ấm đôi tay bên lò sưởi"]),

    cfA("admire_mantel_candles", "fireplace", "Admire the pine garland on the mantel", "Ngắm dây thông trang trí trên bệ lò sưởi",
      "The warm fairy lights and pine garland above the fireplace look so inviting.",
      "Dây đèn vàng ấm áp và cành thông trang trí phía trên bệ lò sưởi trông thật gần gũi.",
      ["fireplace", "cozy"], ["fireplace", "cozy"],
      "<b>inviting</b> /ɪnˈvaɪtɪŋ/ = ấm cúng, hấp dẫn, tạo cảm giác chào đón.",
      ["The warm fairy lights and pine garland", "above the fireplace look so inviting."],
      ["inviting", "exciting", "writing"],
      ["The candles on the <b>fireplace</b> mantel smell like cedarwood.", "What a <b>cozy</b> and inviting corner!"],
      once("cf_z3_mantel", "yes", "Bạn đã ngắm bệ lò sưởi trang trí rồi."),
      at("cf_sofa", "read", 750, [["cf_z3_mantel", "yes"]]),
      ["admire the pine garland on the mantel", "look at the fireplace mantel decor", "ngắm dây thông trang trí trên bệ lò sưởi"]),

    cfA("watch_vinyl_spinning", "vinylplayer", "Watch the vinyl record spinning", "Ngắm đĩa than đang quay đều",
      "A classic jazz record is spinning softly on the vintage turntable in the corner.",
      "Một chiếc đĩa than nhạc jazz cổ điển đang quay êm dịu trên đầu đĩa cổ ở góc phòng.",
      ["turntable", "jazz"], ["turntable", "jazz", "quiet"],
      "<b>spin → spinning</b> = xoay tròn (đĩa nhạc).",
      ["A classic jazz record is spinning softly", "on the vintage turntable in the corner."],
      ["turntable", "comfortable", "timetable"],
      ["The vintage <b>turntable</b> plays warm analog sound.", "Soft <b>jazz</b> on vinyl makes everyone relax."],
      once("cf_z3_vinyl", "yes", "Bạn đã ngắm máy phát đĩa than rồi."),
      at("cf_sofa", "read", 800, [["cf_z3_vinyl", "yes"]]),
      ["watch the vinyl record spinning", "look at the vintage turntable playing jazz", "ngắm đĩa than đang quay đều"]),

    cfA("read_album_sleeve", "vinylplayer", "Check the jazz album cover", "Xem bìa đĩa nhạc jazz cổ điển",
      "This vinyl sleeve says we're listening to a 1960s acoustic jazz quartet.",
      "Vỏ bìa đĩa than này ghi rằng chúng ta đang nghe một nhóm tứ tấu nhạc jazz mộc thập niên 1960.",
      ["jazz", "turntable"], ["jazz", "turntable"],
      "<b>vinyl sleeve / album cover</b> = vỏ bìa giấy đựng đĩa than.",
      ["This vinyl sleeve says we're listening", "to a 1960s acoustic jazz quartet."],
      ["quartet", "quiet", "pocket"],
      ["Look at the album cover next to the <b>turntable</b>.", "I love studying to acoustic <b>jazz</b>."],
      once("cf_z3_sleeve", "yes", "Bạn đã xem bìa đĩa nhạc jazz rồi."),
      at("cf_sofa", "read", 750, [["cf_z3_sleeve", "yes"]]),
      ["check the jazz album cover", "read the vinyl sleeve by the turntable", "xem bìa đĩa nhạc jazz cổ điển"]),

    cfA("inspect_chess_board", "boardgameshelf", "Check the wooden chess set", "Xem bộ cờ vua bằng gỗ trên kệ",
      "They have a hand-carved wooden chess set and word games on the board game shelf.",
      "Trên kệ trò chơi có một bộ cờ vua bằng gỗ chạm khắc thủ công và các bộ trò chơi ghép chữ.",
      ["board game", "relax"], ["boardgame", "relax"],
      "<b>hand-carved wooden chess set</b> = bộ cờ vua bằng gỗ được chạm khắc thủ công.",
      ["They have a hand-carved wooden chess set", "and word games on the board game shelf."],
      ["carved", "curved", "served"],
      ["Let's play a <b>board game</b> after we finish our tea.", "Playing chess is a fun way to <b>relax</b> with friends."],
      once("cf_z3_chess", "yes", "Bạn đã xem bộ cờ vua trên kệ rồi."),
      at("cf_sofa", "reach", 750, [["cf_z3_chess", "yes"]]),
      ["check the wooden chess set", "browse the board game shelf", "xem bộ cờ vua bằng gỗ trên kệ"]),

    cfA("play_quick_card_game", "boardgameshelf", "Pick a trivia card game for the table", "Lấy hộp thẻ đố vui về bàn chơi",
      "Let's grab this box of conversation starter cards to play over our warm drinks!",
      "Mình lấy hộp thẻ câu hỏi gợi mở trò chuyện này về bàn chơi trong lúc uống đồ ấm nhé!",
      ["board game", "warm"], ["boardgame", "warm", "chat"],
      "<b>conversation starter cards</b> = bộ thẻ câu hỏi thú vị giúp bắt chuyện cùng bạn bè.",
      ["Let's grab this box of conversation starter cards", "to play over our warm drinks!"],
      ["trivia", "travel", "traffic"],
      ["This <b>board game</b> is easy to learn in two minutes.", "We had a great <b>chat</b> over <b>warm</b> cocoa."],
      once("cf_z3_cards", "yes", "Bạn đã lấy bộ thẻ đố vui rồi."),
      at("cf_sofa", "reach", 750, [["cf_z3_cards", "yes"]]),
      ["pick a trivia card game for the table", "grab a card game from the shelf", "lấy hộp thẻ đố vui về bàn chơi"]),

    cfA("hang_jacket_on_rack", "coatrack", "Hang my coat on the wooden stand", "Treo áo khoác lên cây móc gỗ",
      "I'll hang my heavy winter coat and scarf on the wooden coat rack by the pillar.",
      "Mình sẽ treo chiếc áo khoác dày và khăn choàng lên cây móc gỗ cạnh cột nhà.",
      ["coat rack", "warm"], ["coatrack", "warm"],
      "<b>hang … on the coat rack</b> = treo (áo khoác, mũ, khăn) lên cây móc đồ.",
      ["I'll hang my heavy winter coat and scarf", "on the wooden coat rack by the pillar."],
      ["rack", "back", "pack"],
      ["Hang your jacket on the <b>coat rack</b> so you stay comfortable.", "It's nice and <b>warm</b> inside the café."],
      once("cf_z3_coatrack", "yes", "Bạn đã treo áo khoác lên cây móc gỗ rồi."),
      at("cf_door", "reach", 750, [["cf_z3_coatrack", "yes"]]),
      ["hang my coat on the wooden stand", "put my jacket on the coat rack", "treo áo khoác lên cây móc gỗ"]),

    cfA("place_umbrella_in_stand", "coatrack", "Place my folded umbrella in the stand", "Đặt chiếc ô gấp gọn vào ống đựng",
      "There's a brass umbrella holder at the base of the coat rack to keep the floor dry.",
      "Có một ống đựng ô bằng đồng ở dưới chân cây treo đồ giúp sàn nhà luôn khô ráo.",
      ["coat rack", "cozy"], ["coatrack", "cozy"],
      "<b>at the base of …</b> = ở phần chân/đế của vật gì.",
      ["There's a brass umbrella holder", "at the base of the coat rack to keep the floor dry."],
      ["holder", "shoulder", "folder"],
      ["Leave your wet umbrella by the <b>coat rack</b>.", "The indoor lounge is dry and <b>cozy</b>."],
      once("cf_z3_umbrella", "yes", "Bạn đã cất ô vào ống đựng rồi."),
      at("cf_door", "reach", 700, [["cf_z3_umbrella", "yes"]]),
      ["place my folded umbrella in the stand", "put my umbrella by the coat rack", "đặt chiếc ô gấp gọn vào ống đựng"]),

    cfA("set_bag_on_cushion", "windowbench", "Rest my backpack on the window bench", "Đặt ba lô lên băng ghế đệm bên cửa sổ",
      "I'll set my canvas backpack right next to me on the cushioned window bench.",
      "Mình sẽ đặt chiếc ba lô vải bố ngay bên cạnh trên băng ghế có đệm êm sát cửa sổ.",
      ["window bench", "cushion"], ["bench", "cushion"],
      "<b>right next to me</b> = ngay sát bên cạnh mình.",
      ["I'll set my canvas backpack right next to me", "on the cushioned window bench."],
      ["bench", "branch", "bunch"],
      ["The <b>window bench</b> has plenty of room for your bag.", "Each seat has a thick linen <b>cushion</b>."],
      once("cf_z3_benchbag", "yes", "Bạn đã đặt ba lô lên băng ghế cửa sổ rồi."),
      at("cf_window", "sit", 750, [["cf_z3_benchbag", "yes"]]),
      ["rest my backpack on the window bench", "sit on the cushioned window bench", "đặt ba lô lên băng ghế đệm bên cửa sổ"]),

    cfA("enjoy_sunbeam_by_window", "windowbench", "Bask in the warm morning sunlight", "Đón nắng sớm ấm áp bên khung cửa sổ",
      "The morning sunlight streaming onto the window bench feels wonderfully warm.",
      "Ánh nắng ban mai chiếu qua khung cửa xuống băng ghế gỗ tạo cảm giác ấm áp tuyệt vời.",
      ["window bench", "warm"], ["bench", "warm", "sunny"],
      "<b>stream onto / through …</b> = (ánh nắng) chiếu rọi, tràn qua khung cửa.",
      ["The morning sunlight streaming onto the window bench", "feels wonderfully warm."],
      ["sunlight", "midnight", "flight"],
      ["This <b>window bench</b> gets the best morning light.", "It's <b>sunny</b> and <b>warm</b> by the glass."],
      once("cf_z3_sunbeam", "yes", "Bạn đã đón nắng ấm bên băng ghế cửa sổ rồi."),
      at("cf_window", "sit", 800, [["cf_z3_sunbeam", "yes"]]),
      ["bask in the warm morning sunlight", "enjoy the warm sunbeam on the window bench", "đón nắng sớm ấm áp bên khung cửa sổ"]),

    cfA("switch_on_reading_lamp", "floorlamp", "Turn on the warm brass reading lamp", "Bật chiếc đèn cây ánh sáng vàng đọc sách",
      "Let me click on the brass floor lamp so I have warm light for reading my book.",
      "Để mình bật chiếc đèn cây bằng đồng lên cho có ánh sáng vàng ấm áp đọc sách.",
      ["floor lamp", "warm"], ["floorlamp", "warm"],
      "<b>click on / switch on the lamp</b> = bấm công tắc bật đèn.",
      ["Let me click on the brass floor lamp", "so I have warm light for reading my book."],
      ["brass", "glass", "class"],
      ["The <b>floor lamp</b> casts a soft amber glow.", "Warm lighting is easier on the eyes when reading."],
      once("cf_z3_lamp", "yes", "Bạn đã bật đèn cây đọc sách rồi."),
      at("cf_sofa", "reach", 750, [["cf_z3_lamp", "yes"]]),
      ["turn on the warm brass reading lamp", "switch on the floor lamp by the armchair", "bật chiếc đèn cây ánh sáng vàng đọc sách"]),

    cfA("admire_watercolor_painting", "wallart", "Admire the coffee harvest watercolor", "Ngắm bức tranh màu nước vẽ mùa thu hoạch cà phê",
      "These framed watercolor paintings show coffee farmers harvesting ripe red cherries.",
      "Những bức tranh màu nước đóng khung này khắc hoạ cảnh người nông dân đang thu hoạch quả cà phê chín đỏ.",
      ["painting", "coffee"], ["painting", "coffee"],
      "<b>coffee cherries</b> = quả cà phê chín đỏ (hạt cà phê nằm bên trong lớp thịt quả).",
      ["These framed watercolor paintings show", "coffee farmers harvesting ripe red cherries."],
      ["harvest", "forest", "honest"],
      ["Every <b>painting</b> on the wall is by a local illustrator.", "Did you know <b>coffee</b> beans start as red cherries?"],
      once("cf_z3_painting", "yes", "Bạn đã ngắm tranh màu nước trên tường rồi."),
      at("cf_sofa", "read", 750, [["cf_z3_painting", "yes"]]),
      ["admire the coffee harvest watercolor", "look at the framed paintings on the brick wall", "ngắm bức tranh màu nước vẽ mùa thu hoạch cà phê"]),

    cfA("read_community_flyer", "communityboard", "Read the weekend acoustic night flyer", "Đọc tờ rơi đêm nhạc acoustic cuối tuần",
      "According to the cork bulletin board, there's a live acoustic guitar night here every Friday!",
      "Theo thông báo trên bảng ghim bần, quán có đêm nhạc đàn guitar mộc vào mỗi tối thứ Sáu!",
      ["bulletin board", "cozy"], ["bulletin", "cozy"],
      "<b>according to …</b> = theo thông tin từ (bảng thông báo, tờ rơi, bản tin).",
      ["According to the cork bulletin board,", "there's a live acoustic guitar night here every Friday!"],
      ["bulletin", "button", "curtain"],
      ["Check the <b>bulletin board</b> for neighborhood events.", "Friday acoustic nights are always so <b>cozy</b>."],
      once("cf_z3_flyer", "yes", "Bạn đã đọc tờ rơi đêm nhạc trên bảng ghim rồi."),
      at("cf_window", "read", 750, [["cf_z3_flyer", "yes"]]),
      ["read the weekend acoustic night flyer", "check the cork community bulletin board", "đọc tờ rơi đêm nhạc acoustic cuối tuần"]),

    cfA("pin_book_club_note", "communityboard", "Check the English book club schedule", "Xem lịch sinh hoạt câu lạc bộ đọc sách tiếng Anh",
      "There's an English conversation and book club meeting at the big table on Sunday afternoon!",
      "Có buổi gặp gỡ câu lạc bộ trò chuyện và đọc sách tiếng Anh tại bàn lớn vào chiều Chủ nhật!",
      ["bulletin board", "chat"], ["bulletin", "chat"],
      "<b>book club meeting</b> = buổi sinh hoạt câu lạc bộ những người yêu sách.",
      ["There's an English conversation and book club meeting", "at the big table on Sunday afternoon!"],
      ["meeting", "greeting", "seating"],
      ["Sign up for the book club on the <b>bulletin board</b>.", "It's a friendly place to practice English and <b>chat</b>."],
      once("cf_z3_bookclub", "yes", "Bạn đã xem lịch câu lạc bộ sách tiếng Anh rồi."),
      at("cf_window", "read", 750, [["cf_z3_bookclub", "yes"]]),
      ["check the English book club schedule", "read the book club card on the bulletin board", "xem lịch sinh hoạt câu lạc bộ đọc sách tiếng Anh"]),

    cfA("place_mug_on_coaster", "coasterset", "Place my hot mug on a cork coaster", "Đặt cốc cà phê nóng lên miếng lót ly bằng bần",
      "I always use a cork coaster so my hot ceramic mug doesn't leave a ring on the wooden table.",
      "Mình luôn dùng miếng lót ly bằng gỗ bần để chiếc cốc sứ nóng không để lại vết ố tròn trên mặt bàn gỗ.",
      ["coaster", "mug", "hot"], ["coaster", "mug", "hot"],
      "<b>leave a ring on the table</b> = để lại vết hằn hình tròn của đáy cốc trên mặt bàn.",
      ["I always use a cork coaster so my hot ceramic mug", "doesn't leave a ring on the wooden table."],
      ["coaster", "poster", "toaster"],
      ["Slide a cork <b>coaster</b> under your <b>hot mug</b>.", "These handmade <b>coasters</b> protect the oak table."],
      once("cf_z3_coaster", "yes", "Bạn đã đặt cốc lên miếng lót ly rồi."),
      at("cf_table", "reach", 700, [["cf_z3_coaster", "yes"]]),
      ["place my hot mug on a cork coaster", "use a cork coaster on the table", "đặt cốc cà phê nóng lên miếng lót ly bằng bần"]),

    cfA("smell_dried_lavender", "tablevase", "Smell the dried lavender on the table", "Ngửi hương hoa oải hương khô trên bàn",
      "The little ceramic vase of dried lavender and wheat adds a calming scent to our table.",
      "Chiếc bình gốm nhỏ cắm hoa oải hương khô và bông lúa mì mang lại hương thơm dịu nhẹ cho bàn của chúng mình.",
      ["vase", "fragrant"], ["vase", "fragrant", "relax"],
      "<b>calming scent</b> = hương thơm dịu nhẹ giúp thư giãn tinh thần.",
      ["The little ceramic vase of dried lavender and wheat", "adds a calming scent to our table."],
      ["lavender", "calendar", "passenger"],
      ["Each table has a small ceramic <b>vase</b> of dried flowers.", "Lavender has a naturally <b>fragrant</b>, soothing aroma."],
      once("cf_z3_vase", "yes", "Bạn đã ngắm bình hoa oải hương trên bàn rồi."),
      at("cf_table", "reach", 700, [["cf_z3_vase", "yes"]]),
      ["smell the dried lavender on the table", "admire the ceramic vase on our table", "ngửi hương hoa oải hương khô trên bàn"]),

    cfA("sink_into_leather_armchair", "armchair", "Sink into the tufted leather armchair", "Ngồi tựa sâu vào chiếc ghế bành bọc da",
      "This caramel leather armchair with a high back is perfect for reading a novel.",
      "Chiếc ghế bành bọc da màu caramel có phần tựa lưng cao này cực kỳ lý tưởng để ngồi đọc tiểu thuyết.",
      ["armchair", "relax"], ["armchair", "relax", "cozy"],
      "<b>sink into an armchair</b> = ngồi lún êm ái vào chiếc ghế bành rộng.",
      ["This caramel leather armchair with a high back", "is perfect for reading a novel."],
      ["armchair", "wheelchair", "upstairs"],
      ["Grab that leather <b>armchair</b> by the floor lamp.", "It's my favorite chair to sit back and <b>relax</b>."],
      once("cf_z3_armchair", "yes", "Bạn đã ngồi thử ghế bành bọc da rồi."),
      at("cf_sofa", "sit", 800, [["cf_z3_armchair", "yes"]]),
      ["sink into the tufted leather armchair", "sit in the caramel leather armchair", "ngồi tựa sâu vào chiếc ghế bành bọc da"]),

    cfA("admire_fiddle_fig_tree", "indoorplanter", "Admire the tall fiddle-leaf fig tree", "Ngắm cây bàng Singapore xanh mát trong góc phòng",
      "The lush green leaves of that fiddle-leaf fig tree brighten up the brick lounge.",
      "Những tán lá xanh mướt của cây bàng Singapore kia làm bừng sáng cả không gian tường gạch.",
      ["cozy", "relax"], ["cozy", "relax"],
      "<b>brighten up a room</b> = làm căn phòng trở nên tươi sáng, tràn đầy sức sống.",
      ["The lush green leaves of that fiddle-leaf fig tree", "brighten up the brick lounge."],
      ["brighten", "frighten", "tighten"],
      ["Indoor plants make the seating area feel <b>cozy</b>.", "Greenery helps your eyes <b>relax</b> after screen time."],
      once("cf_z3_figtree", "yes", "Bạn đã ngắm cây xanh trong phòng khách rồi."),
      at("cf_window", "read", 700, [["cf_z3_figtree", "yes"]]),
      ["admire the tall fiddle-leaf fig tree", "look at the indoor planter in the corner", "ngắm cây bàng Singapore xanh mát trong góc phòng"]),

    cfA("return_tray_to_rack", "busstation", "Return my tray to the bussing rack", "Cất khay và tách đã dùng lên kệ thu dọn",
      "I always return my wooden tray and empty porcelain cup to the bussing station before leaving.",
      "Mình luôn mang khay gỗ và tách sứ đã dùng xong để lên kệ thu dọn trước khi rời quán.",
      ["bussing rack", "mug"], ["busrack", "mug"],
      "<b>bussing station / rack</b> = kệ để khách tự cất khay, bát đĩa, cốc tách sau khi dùng xong.",
      ["I always return my wooden tray and empty porcelain cup", "to the bussing station before leaving."],
      ["return", "learn", "turn"],
      ["Please place used trays on the <b>bussing rack</b>.", "Returning your <b>mug</b> keeps the tables tidy for the next guest."],
      once("cf_z3_busrack", "yes", "Bạn đã cất khay lên kệ thu dọn rồi."),
      at("cf_trash", "reach", 750, [["cf_z3_busrack", "yes"]]),
      ["return my tray to the bussing rack", "put my used tray on the return rack", "cất khay và tách đã dùng lên kệ thu dọn"]),

    cfA("wipe_table_crumb", "busstation", "Grab a cloth to wipe a small crumb", "Lấy khăn giấy lau vụn bánh trên bàn",
      "Let me wipe the pastry crumbs off the table so it stays clean and neat.",
      "Để mình lau sạch vụn bánh ngọt trên mặt bàn cho chỗ ngồi luôn gọn gàng sạch sẽ.",
      ["napkin", "croissant"], ["napkin", "croissant"],
      "<b>wipe … off the table</b> = phủi/lau sạch cái gì khỏi mặt bàn.",
      ["Let me wipe the pastry crumbs off the table", "so it stays clean and neat."],
      ["crumb", "thumb", "climb"],
      ["Flaky <b>croissants</b> always leave a few crumbs!", "Use a <b>napkin</b> to wipe the table clean."],
      once("cf_z3_wipecrumb", "yes", "Bạn đã lau sạch vụn bánh trên bàn rồi."),
      at("cf_table", "reach", 700, [["cf_z3_wipecrumb", "yes"]]),
      ["grab a cloth to wipe a small crumb", "wipe the pastry crumbs off the table", "lấy khăn giấy lau vụn bánh trên bàn"]),

    cfA("greet_regular_sam", "regularsam", "Greet Sam the daily regular", "Chào hỏi bác Sam khách quen của quán",
      "Good morning, Sam! Are you doing the morning crossword with your hot cappuccino again?",
      "Chào buổi sáng bác Sam! Hôm nay bác lại giải ô chữ buổi sáng cùng tách cappuccino nóng quen thuộc ạ?",
      ["regular", "cappuccino", "hot"], ["regular", "cappuccino", "hot"],
      "<b>a regular</b> (danh từ) = vị khách quen thường xuyên ghé quán.",
      ["Good morning, Sam! Are you doing the morning crossword", "with your hot cappuccino again?"],
      ["regular", "popular", "similar"],
      ["Sam has been a daily <b>regular</b> here for five years.", "He always orders a <b>hot cappuccino</b> at eight o'clock."],
      once("cf_z3_samgreet", "yes", "Bạn đã chào hỏi bác Sam khách quen rồi."),
      at("cf_table", "wave", 800, [["cf_z3_samgreet", "yes"]]),
      ["greet Sam the daily regular", "say good morning to Sam at the corner table", "chào hỏi bác Sam khách quen của quán"]),

    cfA("help_sam_with_crossword", "regularsam", "Help Sam with a crossword clue", "Giúp bác Sam giải một từ tiếng Anh trong ô chữ",
      "A seven-letter word for a warm spiced tea with milk? That must be 'chai tea' or 'masala'!",
      "Một từ cho món trà sữa nấu cùng gia vị ấm nóng ư? Chắc chắn là trà thảo mộc ấm rồi!",
      ["regular", "warm", "tea"], ["regular", "warm", "tea"],
      "<b>crossword clue</b> = gợi ý tìm từ trong trò chơi giải ô chữ trên báo.",
      ["A seven-letter word for a warm spiced tea with milk?", "Let's check the crossword letters together!"],
      ["clue", "blue", "true"],
      ["Solving the crossword with a <b>regular</b> is great vocabulary practice.", "Nothing beats a <b>warm</b> cup of <b>tea</b> while reading the paper."],
      once("cf_z3_samclue", "yes", "Bạn đã cùng bác Sam giải ô chữ rồi."),
      at("cf_table", "point", 800, [["cf_z3_samclue", "yes"]]),
      ["help Sam with a crossword clue", "solve a newspaper crossword clue with Sam", "giúp bác Sam giải một từ tiếng Anh trong ô chữ"]),

    cfA("ask_maya_about_novel", "bookwormmaya", "Ask Maya what book she's reading", "Hỏi Maya đang đọc cuốn sách gì",
      "Hi Maya! That hardcover novel looks fascinating—what is the story about?",
      "Chào Maya! Cuốn tiểu thuyết bìa cứng đó trông cuốn hút quá — câu chuyện kể về chủ đề gì thế?",
      ["novel", "chat"], ["novel", "chat"],
      "<b>What is the story about?</b> = Câu chuyện nói về điều gì? (câu hỏi mở khi bắt chuyện về sách/phim).",
      ["Hi Maya! That hardcover novel looks fascinating—", "what is the story about?"],
      ["novel", "model", "travel"],
      ["Maya is reading a historical <b>novel</b> by the fireplace.", "We had a lovely <b>chat</b> about our favorite authors."],
      once("cf_z3_mayanovel", "yes", "Bạn đã hỏi Maya về cuốn tiểu thuyết rồi."),
      at("cf_sofa", "wave", 800, [["cf_z3_mayanovel", "yes"]]),
      ["ask Maya what book she's reading", "chat with Maya about her hardcover novel", "hỏi Maya đang đọc cuốn sách gì"]),

    cfA("recommend_warm_tea_to_maya", "bookwormmaya", "Recommend warm chamomile tea to Maya", "Gợi ý món trà hoa cúc ấm cho Maya",
      "If you're reading all evening, you should try their hot chamomile tea with honey—it's caffeine-free and so soothing!",
      "Nếu bạn đọc sách suốt buổi tối thì nên thử món trà hoa cúc mật ong nóng ở đây — không có caffeine mà lại rất dịu họng!",
      ["chamomile tea", "honey", "hot"], ["chamomile", "honey", "hot"],
      "<b>caffeine-free</b> = không chứa caffeine (uống buổi chiều tối không lo mất ngủ).",
      ["If you're reading all evening, you should try", "their hot chamomile tea with honey—it's so soothing!"],
      ["soothing", "smoothing", "choosing"],
      ["Hot <b>chamomile tea</b> with <b>honey</b> won't keep you awake at night.", "Thank you for the warm drink recommendation!"],
      once("cf_z3_mayatea", "yes", "Bạn đã gợi ý trà hoa cúc ấm cho Maya rồi."),
      at("cf_sofa", "point", 800, [["cf_z3_mayatea", "yes"]]),
      ["recommend warm chamomile tea to Maya", "suggest hot chamomile honey tea to Maya", "gợi ý món trà hoa cúc ấm cho Maya"]),

    cfA("admire_woven_rug", "floorlamp", "Notice the patterned woven rug", "Ngắm tấm thảm dệt hoa văn ấm áp dưới sàn",
      "The thick woven area rug under the coffee table absorbs footsteps and keeps the lounge quiet.",
      "Tấm thảm dệt dày trải dưới bàn trà giúp giảm tiếng bước chân và giữ cho phòng khách luôn yên tĩnh.",
      ["quiet", "cozy"], ["quiet", "cozy"],
      "<b>absorb sound / footsteps</b> = hấp thụ âm thanh, giảm tiếng ồn bước chân.",
      ["The thick woven area rug under the coffee table", "absorbs footsteps and keeps the lounge quiet."],
      ["absorb", "aboard", "afford"],
      ["The rug makes the seating zone extra <b>cozy</b>.", "Please keep your voice low in the <b>quiet</b> lounge."],
      once("cf_z3_rug", "yes", "Bạn đã ngắm tấm thảm dệt trong phòng rồi."),
      at("cf_sofa", "read", 700, [["cf_z3_rug", "yes"]]),
      ["notice the patterned woven rug", "look at the cozy woven rug under the sofa", "ngắm tấm thảm dệt hoa văn ấm áp dưới sàn"]),

    cfA("check_herbal_tea_cart", "teatrolley", "Check the herbal tea trolley", "Xem xe đẩy trà thảo mộc và mật ong",
      "The wooden tea trolley by the armchair holds glass jars of chamomile, peppermint, and wildflower honey.",
      "Chiếc xe đẩy trà bằng gỗ cạnh ghế bành bày các hũ thủy tinh đựng hoa cúc, bạc hà và mật ong hoa rừng.",
      ["tea trolley", "chamomile tea", "honey"], ["teacart", "chamomile", "honey"],
      "<b>herbal tea trolley</b> = xe đẩy phục vụ trà thảo mộc tại khu ngồi thư giãn.",
      ["The wooden tea trolley by the armchair holds", "glass jars of chamomile, peppermint, and wildflower honey."],
      ["trolley", "folly", "jolly"],
      ["There is a wooden <b>tea trolley</b> near the fireplace.", "I love adding wildflower <b>honey</b> to my <b>chamomile tea</b>."],
      once("cf_z3_teacart", "yes", "Bạn đã xem xe đẩy trà thảo mộc rồi."),
      at("cf_sofa", "read", 750, [["cf_z3_teacart", "yes"]]),
      ["check the herbal tea trolley", "browse the herbal tea and honey cart", "xem xe đẩy trà thảo mộc và mật ong"]),

    cfA("pour_honey_from_jar", "teatrolley", "Drizzle wildflower honey into my tea", "Rót mật ong hoa rừng từ xe đẩy vào tách trà",
      "I drizzled a spoonful of golden wildflower honey from the tea trolley into my warm cup.",
      "Mình rót một thìa mật ong hoa rừng vàng óng từ xe đẩy trà vào chiếc cốc ấm của mình.",
      ["honey", "tea trolley", "mug"], ["honey", "teacart", "mug"],
      "<b>drizzle a spoonful of honey</b> = rưới nhẹ một thìa mật ong vào đồ uống ấm.",
      ["I drizzled a spoonful of golden wildflower honey", "from the tea trolley into my warm cup."],
      ["honey", "money", "sunny"],
      ["Drizzle some golden <b>honey</b> into your warm <b>mug</b>.", "The honey jar is on the top shelf of the <b>tea trolley</b>."],
      once("cf_z3_honeyjar", "yes", "Bạn đã rót mật ong từ xe đẩy trà rồi."),
      at("cf_sofa", "take", 750, [["cf_z3_honeyjar", "yes"]], "mug"),
      ["drizzle wildflower honey into my tea", "add honey from the tea trolley", "rót mật ong hoa rừng từ xe đẩy vào tách trà"]),

    cfA("rest_feet_on_ottoman", "footstool", "Rest my feet on the knitted ottoman", "Gác chân thư giãn lên đôn vải đan êm ái",
      "Propping my feet up on this soft knitted ottoman after a long walk feels wonderfully relaxing.",
      "Gác chân lên chiếc đôn bọc vải đan mềm mại này sau một quãng đi bộ dài thật thư thái vô cùng.",
      ["ottoman", "armchair", "cozy"], ["ottoman", "armchair", "cozy"],
      "<b>prop one's feet up on the ottoman</b> = gác chân lên ghế đôn thấp để nghỉ ngơi.",
      ["Propping my feet up on this soft knitted ottoman", "after a long walk feels wonderfully relaxing."],
      ["ottoman", "gentleman", "cardigan"],
      ["Put your feet up on the knitted <b>ottoman</b> in front of the <b>armchair</b>.", "The reading corner feels so warm and <b>cozy</b>."],
      once("cf_z3_ottoman", "yes", "Bạn đã gác chân thư giãn trên ghế đôn rồi."),
      at("cf_sofa", "wave", 750, [["cf_z3_ottoman", "yes"]]),
      ["rest my feet on the knitted ottoman", "prop my feet up on the cozy footstool", "gác chân thư giãn lên đôn vải đan êm ái"])
  ];

  const TERRACE_NEW_ACTIONS = [
    cfA("place_laptop_on_stand", "laptopstand", "Set my laptop on the ergonomic stand", "Đặt máy tính lên giá đỡ chống mỏi cổ",
      "Raising my laptop screen on this aluminum stand keeps my neck and shoulders comfortable.",
      "Nâng cao màn hình máy tính trên chiếc giá đỡ hợp kim nhôm này giúp cổ và vai mình không bị mỏi.",
      ["laptop stand", "laptop"], ["stand", "laptop", "work"],
      "<b>ergonomic laptop stand</b> = giá đỡ máy tính thiết kế công thái học giúp ngồi đúng tư thế.",
      ["Raising my laptop screen on this aluminum stand", "keeps my neck and shoulders comfortable."],
      ["stand", "hand", "brand"],
      ["An aluminum <b>laptop stand</b> improves your posture.", "I brought my <b>laptop</b> to finish my project."],
      once("cf_z4_stand", "yes", "Bạn đã đặt máy tính lên giá đỡ rồi."),
      at("cf_charge", "type", 800, [["cf_z4_stand", "yes"]]),
      ["set my laptop on the ergonomic stand", "place my laptop on the aluminum stand", "đặt máy tính lên giá đỡ chống mỏi cổ"]),

    cfA("plug_into_power_strip", "powerstrip", "Plug my adapter into the surge protector", "Cắm bộ sạc vào ổ điện chia nhiều cổng",
      "This surge-protected power strip has both standard sockets and fast-charging USB-C ports.",
      "Ổ điện chống quá tải này có cả ổ cắm thông thường lẫn cổng sạc nhanh USB-C.",
      ["power strip", "charger", "outlet"], ["powerstrip", "charger", "outlet"],
      "<b>surge-protected power strip</b> = ổ cắm điện nối dài có mạch bảo vệ chống quá áp.",
      ["This surge-protected power strip has both", "standard sockets and fast-charging USB-C ports."],
      ["socket", "pocket", "rocket"],
      ["Is there a free socket on the <b>power strip</b>?", "Plug your <b>charger</b> into the <b>outlet</b> under the desk."],
      once("cf_z4_powerstrip", "yes", "Bạn đã cắm bộ sạc vào ổ điện chia cổng rồi."),
      at("cf_charge", "plug", 800, [["cf_z4_powerstrip", "yes"], ["cf_plugged", "yes"]]),
      ["plug my adapter into the surge protector", "use the USB-C power strip on the desk", "cắm bộ sạc vào ổ điện chia nhiều cổng"]),

    cfA("share_socket_politely", "powerstrip", "Offer to share the power strip", "Lịch sự nhường bớt một ổ cắm cho người ngồi cạnh",
      "There are plenty of open sockets on this power strip—feel free to plug in your charger!",
      "Trên ổ điện chia cổng này còn nhiều lỗ cắm trống lắm — bạn cứ tự nhiên cắm sạc nhé!",
      ["power strip", "charger"], ["powerstrip", "charger"],
      "<b>feel free to + V</b> = bạn cứ tự nhiên/thoải mái làm gì nhé!",
      ["There are plenty of open sockets on this power strip—", "feel free to plug in your charger!"],
      ["plenty", "twenty", "empty"],
      ["Thank you for sharing the <b>power strip</b>!", "My <b>charger</b> cord can reach from here."],
      once("cf_z4_sharesocket", "yes", "Bạn đã chia sẻ ổ cắm điện với người ngồi cạnh rồi."),
      at("cf_charge", "point", 750, [["cf_z4_sharesocket", "yes"]]),
      ["offer to share the power strip", "let my neighbor use a socket on the power strip", "lịch sự nhường bớt một ổ cắm cho người ngồi cạnh"]),

    cfA("check_signal_bars", "meshrouter", "Check the 5GHz Wi-Fi signal strength", "Kiểm tra vạch sóng Wi-Fi tốc độ cao",
      "Sitting right next to the mesh Wi-Fi router gives me full signal bars and zero lag.",
      "Ngồi ngay gần bộ phát Wi-Fi mesh giúp máy mình căng đét vạch sóng và không hề bị trễ mạng.",
      ["router", "Wi-Fi"], ["router", "wifi", "online"],
      "<b>full signal bars</b> = đầy căng vạch sóng; <b>zero lag</b> = không bị giật/trễ mạng.",
      ["Sitting right next to the mesh Wi-Fi router", "gives me full signal bars and zero lag."],
      ["router", "outer", "counter"],
      ["The dual-band <b>router</b> keeps the whole terrace <b>online</b>.", "Our <b>Wi-Fi</b> is fast enough for video calls."],
      once("cf_z4_router", "yes", "Bạn đã kiểm tra tín hiệu bộ phát Wi-Fi rồi."),
      at("cf_wifi", "read", 750, [["cf_z4_router", "yes"]]),
      ["check the 5GHz Wi-Fi signal strength", "look at the mesh Wi-Fi router on the wall", "kiểm tra vạch sóng Wi-Fi tốc độ cao"]),

    cfA("reconnect_to_fast_band", "meshrouter", "Switch to the 5GHz workspace network", "Chuyển sang băng tần mạng 5GHz cho góc làm việc",
      "I switched my laptop to the café's 5GHz workspace network for a more stable connection.",
      "Mình vừa chuyển máy tính sang mạng 5GHz dành riêng cho khu làm việc để đường truyền ổn định hơn.",
      ["Wi-Fi", "laptop"], ["wifi", "laptop", "online"],
      "<b>a stable connection</b> = kết nối mạng ổn định, không chập chờn.",
      ["I switched my laptop to the café's 5GHz workspace network", "for a more stable connection."],
      ["stable", "table", "cable"],
      ["A stable <b>Wi-Fi</b> connection is essential when working <b>online</b>.", "My <b>laptop</b> connected right away."],
      once("cf_z4_fastband", "yes", "Bạn đã chuyển sang băng tần Wi-Fi 5GHz rồi."),
      at("cf_wifi", "type", 750, [["cf_z4_fastband", "yes"], ["cf_wifi", "known"]]),
      ["switch to the 5GHz workspace network", "connect to the high-speed router band", "chuyển sang băng tần mạng 5GHz cho góc làm việc"]),

    cfA("put_on_headphones", "headphones", "Put on noise-canceling headphones", "Đeo tai nghe chống ồn để tập trung",
      "Putting on my noise-canceling headphones helps me focus deeply on my English essay.",
      "Đeo chiếc tai nghe chống ồn vào giúp mình tập trung cao độ viết bài luận tiếng Anh.",
      ["headphones", "study"], ["headphones", "study", "quiet"],
      "<b>focus deeply on …</b> = tập trung sâu/cao độ vào công việc gì.",
      ["Putting on my noise-canceling headphones", "helps me focus deeply on my English essay."],
      ["focus", "lotus", "bonus"],
      ["Please wear <b>headphones</b> during online meetings.", "It's easy to <b>study</b> in this <b>quiet</b> work zone."],
      once("cf_z4_headphones", "yes", "Bạn đã đeo tai nghe chống ồn rồi."),
      at("cf_charge", "type", 800, [["cf_z4_headphones", "yes"]]),
      ["put on noise-canceling headphones", "wear my headphones to focus on studying", "đeo tai nghe chống ồn để tập trung"]),

    cfA("join_english_webinar", "headphones", "Listen to an online English workshop", "Nghe hội thảo tiếng Anh trực tuyến qua tai nghe",
      "I'm wearing my headset so I can listen to an online pronunciation webinar without disturbing anyone.",
      "Mình đeo tai nghe kèm mic để nghe buổi hội thảo luyện phát âm trực tuyến mà không làm phiền ai xung quanh.",
      ["headphones", "online"], ["headphones", "online", "study"],
      "<b>without disturbing anyone</b> = mà không làm ảnh hưởng/làm phiền bất kỳ ai.",
      ["I'm wearing my headset so I can listen to an online webinar", "without disturbing anyone."],
      ["disturb", "suburb", "superb"],
      ["Use <b>headphones</b> when attending an <b>online</b> class.", "I love coming to the terrace to <b>study</b>."],
      once("cf_z4_webinar", "yes", "Bạn đã nghe hội thảo trực tuyến qua tai nghe rồi."),
      at("cf_charge", "type", 800, [["cf_z4_webinar", "yes"]]),
      ["listen to an online English workshop", "attend a webinar with my headphones on", "nghe hội thảo tiếng Anh trực tuyến qua tai nghe"]),

    cfA("write_daily_todo_list", "notebookpen", "Write today's study checklist", "Viết danh sách mục tiêu học tập hôm nay vào sổ",
      "I always jot down my top three priorities in a paper notebook before opening my laptop.",
      "Mình luôn ghi nhanh ba mục tiêu ưu tiên nhất vào cuốn sổ tay giấy trước khi mở máy tính lên.",
      ["notebook", "laptop"], ["notebook", "laptop", "work"],
      "<b>jot down</b> = ghi chép nhanh (ý tưởng, từ mới, việc cần làm).",
      ["I always jot down my top three priorities", "in a paper notebook before opening my laptop."],
      ["priority", "majority", "authority"],
      ["Keep a small <b>notebook</b> beside your <b>laptop</b>.", "Checking off tasks makes <b>work</b> satisfying!"],
      once("cf_z4_todolist", "yes", "Bạn đã viết danh sách việc cần làm vào sổ tay rồi."),
      at("cf_charge", "type", 800, [["cf_z4_todolist", "yes"]]),
      ["write today's study checklist", "jot down my tasks in the notebook", "viết danh sách mục tiêu học tập hôm nay vào sổ"]),

    cfA("note_new_idioms", "notebookpen", "Copy three English idioms into my notebook", "Chép ba thành ngữ tiếng Anh mới vào sổ tay",
      "Whenever I hear a natural English phrase at the café, I write it down in my vocabulary notebook.",
      "Mỗi khi nghe được một cụm từ tiếng Anh tự nhiên ở quán cà phê, mình đều ghi lại vào sổ từ vựng.",
      ["notebook", "study"], ["notebook", "study"],
      "<b>write it down</b> = ghi chép lại vào giấy/sổ để nhớ lâu.",
      ["Whenever I hear a natural English phrase at the café,", "I write it down in my vocabulary notebook."],
      ["phrase", "phase", "praise"],
      ["Review your vocabulary <b>notebook</b> while sipping warm tea.", "Writing by hand helps you <b>study</b> effectively."],
      once("cf_z4_idioms", "yes", "Bạn đã chép thành ngữ mới vào sổ tay rồi."),
      at("cf_charge", "type", 800, [["cf_z4_idioms", "yes"]]),
      ["copy three English idioms into my notebook", "write down new English phrases in my notebook", "chép ba thành ngữ tiếng Anh mới vào sổ tay"]),

    cfA("turn_on_desk_lamp", "desklamp", "Adjust the warm LED task lamp", "Chỉnh độ sáng chiếc đèn bàn học chống cận",
      "I'll switch the LED desk lamp to warm eye-care mode now that the afternoon sun is setting.",
      "Mình sẽ chuyển chiếc đèn bàn LED sang chế độ ánh sáng vàng bảo vệ mắt khi nắng chiều dần tắt.",
      ["desk lamp", "warm"], ["desklamp", "warm", "study"],
      "<b>eye-care mode</b> = chế độ ánh sáng dịu bảo vệ mắt khi đọc sách hoặc làm việc lâu.",
      ["I'll switch the LED desk lamp to warm eye-care mode", "now that the afternoon sun is setting."],
      ["setting", "getting", "letting"],
      ["Tilt the <b>desk lamp</b> so it doesn't glare on your screen.", "A <b>warm</b> light makes late-afternoon <b>study</b> comfortable."],
      once("cf_z4_desklamp", "yes", "Bạn đã chỉnh đèn bàn học sang chế độ dịu mắt rồi."),
      at("cf_charge", "reach", 750, [["cf_z4_desklamp", "yes"]]),
      ["adjust the warm LED task lamp", "turn on the LED desk lamp at the work bar", "chỉnh độ sáng chiếc đèn bàn học chống cận"]),

    cfA("tilt_sun_umbrella", "patioumbrella", "Angle the canvas patio umbrella", "Xoay nghiêng tán dù che nắng ngoài sân",
      "Let's tilt the cream canvas umbrella slightly so there's no glare on our laptop screens.",
      "Mình xoay nghiêng tán dù vải màu kem một chút để màn hình máy tính không bị chói nắng nhé.",
      ["patio umbrella", "shade"], ["umbrella", "shade", "laptop"],
      "<b>glare on the screen</b> = ánh sáng chói loá phản chiếu trên màn hình máy tính/điện thoại.",
      ["Let's tilt the cream canvas umbrella slightly", "so there's no glare on our laptop screens."],
      ["glare", "share", "care"],
      ["The large <b>patio umbrella</b> provides cool <b>shade</b>.", "Now I can see my <b>laptop</b> screen clearly."],
      once("cf_z4_umbrella", "yes", "Bạn đã chỉnh tán dù che nắng sân thượng rồi."),
      at("cf_terrace", "reach", 800, [["cf_z4_umbrella", "yes"]]),
      ["angle the canvas patio umbrella", "tilt the patio umbrella for shade", "xoay nghiêng tán dù che nắng ngoài sân"]),

    cfA("sit_in_shaded_breeze", "patioumbrella", "Enjoy the shaded breeze under the canopy", "Ngồi dưới bóng mát tán dù đón gió nhẹ",
      "Sitting under the wide umbrella canopy lets you enjoy fresh air without direct sun.",
      "Ngồi dưới vòm dù rộng giúp bạn tận hưởng không khí thoáng đãng mà không bị nắng chiếu trực tiếp.",
      ["patio umbrella", "breeze", "shade"], ["umbrella", "breeze", "shade"],
      "<b>direct sun / sunlight</b> = ánh nắng mặt trời chiếu thẳng trực tiếp.",
      ["Sitting under the wide umbrella canopy", "lets you enjoy fresh air without direct sun."],
      ["canopy", "company", "balcony"],
      ["Relax in the <b>shade</b> under the <b>patio umbrella</b>.", "There's a gentle <b>breeze</b> on the rooftop today."],
      once("cf_z4_canopy", "yes", "Bạn đã ngồi thư giãn dưới tán dù rồi."),
      at("cf_terrace", "sit", 750, [["cf_z4_canopy", "yes"]]),
      ["enjoy the shaded breeze under the canopy", "sit in the shade of the patio umbrella", "ngồi dưới bóng mát tán dù đón gió nhẹ"]),

    cfA("admire_olive_planter", "bambooplanter", "Admire the potted olive & bamboo trees", "Ngắm hàng chậu cây ô-liu và trúc cảnh xanh mát",
      "The row of terracotta planters with bamboo and olive trees makes the terrace feel like a garden.",
      "Hàng chậu đất nung trồng trúc cảnh và cây ô-liu làm khoảng sân thượng trông như một khu vườn trên mây.",
      ["planter box", "terrace"], ["planter", "terrace", "freshair"],
      "<b>feel like a garden</b> = mang lại cảm giác xanh mát như một khu vườn thực thụ.",
      ["The row of terracotta planters with bamboo and olive trees", "makes the terrace feel like a garden."],
      ["terracotta", "terrace", "umbrella"],
      ["Each wooden <b>planter box</b> is filled with greenery.", "The <b>terrace</b> has plenty of plants and <b>fresh air</b>."],
      once("cf_z4_planter", "yes", "Bạn đã ngắm hàng cây cảnh trên sân thượng rồi."),
      at("cf_terrace", "read", 750, [["cf_z4_planter", "yes"]]),
      ["admire the potted olive & bamboo trees", "look at the bamboo planter boxes on the terrace", "ngắm hàng chậu cây ô-liu và trúc cảnh xanh mát"]),

    cfA("watch_glowing_bistro_lights", "stringlights", "Look up at the warm bistro string lights", "Ngước nhìn giàn đèn dây vàng ấm áp",
      "When the warm Edison string lights come on, the rooftop terrace looks magical.",
      "Khi giàn đèn dây bóng tròn ánh vàng bật sáng, cả khoảng sân thượng trông lung linh huyền ảo.",
      ["string lights", "terrace", "warm"], ["stringlights", "terrace", "warm"],
      "<b>come on</b> = (đèn) bật sáng lên.",
      ["When the warm Edison string lights come on,", "the rooftop terrace looks magical."],
      ["magical", "musical", "practical"],
      ["Golden <b>string lights</b> hang above the <b>terrace</b>.", "The <b>warm</b> glow creates a peaceful evening mood."],
      once("cf_z4_lights", "yes", "Bạn đã ngắm giàn đèn dây trên sân thượng rồi."),
      at("cf_terrace", "read", 750, [["cf_z4_lights", "yes"]]),
      ["look up at the warm bistro string lights", "admire the Edison string lights overhead", "ngước nhìn giàn đèn dây vàng ấm áp"]),

    cfA("look_out_over_rooftops", "cityviewrail", "Look out over the neighborhood rooftops", "Đứng bên lan can ngắm nhìn phố phường từ trên cao",
      "Stepping over to the glass railing gives my eyes a rest after two hours of coding.",
      "Bước ra chỗ lan can kính ngắm nhìn phố phường giúp đôi mắt mình được nghỉ ngơi sau hai tiếng lập trình.",
      ["skyline", "terrace", "relax"], ["skyline", "terrace", "relax"],
      "<b>give my eyes a rest</b> = cho đôi mắt được nghỉ ngơi thư giãn.",
      ["Stepping over to the glass railing", "gives my eyes a rest after two hours of coding."],
      ["railing", "sailing", "mailing"],
      ["Look at the city <b>skyline</b> from the <b>terrace</b> railing.", "Looking at distant rooftops helps your eyes <b>relax</b>."],
      once("cf_z4_railing", "yes", "Bạn đã đứng bên lan can ngắm phố phường rồi."),
      at("cf_terrace", "read", 800, [["cf_z4_railing", "yes"]]),
      ["look out over the neighborhood rooftops", "enjoy the city skyline from the terrace railing", "đứng bên lan can ngắm nhìn phố phường từ trên cao"]),

    cfA("spot_park_from_terrace", "cityviewrail", "Spot the tree-lined boulevard below", "Nhìn xuống hàng cây xanh dọc đại lộ bên dưới",
      "From this third-floor terrace, you can see the tree-lined boulevard and the bookshop across the street.",
      "Từ tầng sân thượng này, bạn có thể nhìn thấy đại lộ rợp bóng cây và hiệu sách ở phía bên kia đường.",
      ["terrace", "skyline"], ["terrace", "skyline"],
      "<b>tree-lined boulevard</b> = đại lộ rợp bóng cây xanh hai bên đường.",
      ["From this third-floor terrace, you can see", "the tree-lined boulevard and the bookshop across the street."],
      ["boulevard", "postcards", "courtyard"],
      ["This <b>terrace</b> has the best view of the <b>skyline</b>.", "I love watching the street below while sipping hot tea."],
      once("cf_z4_boulevard", "yes", "Bạn đã ngắm đại lộ rợp bóng cây bên dưới rồi."),
      at("cf_terrace", "point", 750, [["cf_z4_boulevard", "yes"]]),
      ["spot the tree-lined boulevard below", "look down at the street from the terrace railing", "nhìn xuống hàng cây xanh dọc đại lộ bên dưới"]),

    cfA("pour_warm_lemon_water", "watercarafe", "Pour a glass of infused lemon-mint water", "Rót một ly nước lọc ngâm chanh và lá bạc hà",
      "Staying hydrated helps me concentrate, so I'll pour a glass of fresh lemon-mint water from the carafe.",
      "Uống đủ nước giúp mình tập trung tốt hơn, nên mình sẽ rót một ly nước ngâm chanh bạc hà từ bình thuỷ tinh.",
      ["carafe", "water"], ["carafe", "water", "freshair"],
      "<b>stay hydrated</b> = giữ cho cơ thể luôn đủ nước.",
      ["Staying hydrated helps me concentrate,", "so I'll pour a glass of lemon-mint water from the carafe."],
      ["carafe", "giraffe", "staff"],
      ["Help yourself to water from the glass <b>carafe</b>.", "Drinking <b>water</b> while studying keeps your mind sharp."],
      once("cf_z4_carafe", "yes", "Bạn đã rót nước lọc từ bình thuỷ tinh rồi."),
      at("cf_charge", "pour", 750, [["cf_z4_carafe", "yes"]]),
      ["pour a glass of infused lemon-mint water", "pour water from the glass carafe", "rót một ly nước lọc ngâm chanh và lá bạc hà"]),

    cfA("print_study_worksheet", "printerstation", "Print my two-page study handout", "In tài liệu bài tập dài hai trang tại góc máy in",
      "I sent my two-page grammar worksheet to the wireless printer in the coworking corner.",
      "Mình vừa gửi file bài tập ngữ pháp dài hai trang tới chiếc máy in không dây ở góc làm việc chung.",
      ["printer", "study"], ["printer", "study", "work"],
      "<b>wireless printer</b> = máy in kết nối không dây qua mạng Wi-Fi.",
      ["I sent my two-page grammar worksheet", "to the wireless printer in the coworking corner."],
      ["printer", "winter", "splinter"],
      ["The wireless <b>printer</b> is right beside the bookshelf.", "Printing my notes makes it easier to <b>study</b>."],
      once("cf_z4_printer", "yes", "Bạn đã in tài liệu học tập tại máy in không dây rồi."),
      at("cf_wifi", "type", 800, [["cf_z4_printer", "yes"]]),
      ["print my two-page study handout", "use the wireless printer in the work corner", "in tài liệu bài tập dài hai trang tại góc máy in"]),

    cfA("staple_printed_pages", "printerstation", "Staple my printed notes neatly", "Bấm kim cố định xấp tài liệu vừa in",
      "There's a stapler and paperclips next to the printer so you can keep your handouts organized.",
      "Có sẵn đồ bấm kim và kẹp giấy ngay cạnh máy in để bạn kẹp gọn gàng các tờ tài liệu của mình.",
      ["printer", "work"], ["printer", "work"],
      "<b>keep … organized</b> = giữ cho (tài liệu, bàn làm việc) luôn ngăn nắp, có trật tự.",
      ["There's a stapler and paperclips next to the printer", "so you can keep your handouts organized."],
      ["stapler", "paper", "waiter"],
      ["Grab your pages from the <b>printer</b> tray.", "Having a mini office station makes remote <b>work</b> easy."],
      once("cf_z4_staple", "yes", "Bạn đã bấm kim gọn gàng tài liệu vừa in rồi."),
      at("cf_wifi", "reach", 700, [["cf_z4_staple", "yes"]]),
      ["staple my printed notes neatly", "use the stapler at the printer station", "bấm kim cố định xấp tài liệu vừa in"]),

    cfA("check_sprint_goals", "whiteboard", "Read the focus-sprint schedule on the board", "Xem khung giờ tập trung làm việc trên bảng trắng",
      "The coworking whiteboard lists twenty-five-minute Pomodoro focus sprints with five-minute tea breaks!",
      "Tấm bảng trắng ở góc làm việc ghi lịch tập trung 25 phút theo phương pháp Pomodoro xen kẽ 5 phút nghỉ uống trà!",
      ["whiteboard", "study", "work"], ["whiteboard", "study", "work"],
      "<b>focus sprint (Pomodoro)</b> = phiên tập trung làm việc ngắn (thường 25 phút) rồi nghỉ giải lao.",
      ["The coworking whiteboard lists twenty-five-minute focus sprints", "with five-minute tea breaks!"],
      ["sprint", "print", "mint"],
      ["Write your afternoon goal on the <b>whiteboard</b>.", "Short breaks help you <b>study</b> and <b>work</b> without burnout."],
      once("cf_z4_whiteboard", "yes", "Bạn đã xem lịch tập trung làm việc trên bảng trắng rồi."),
      at("cf_wifi", "read", 750, [["cf_z4_whiteboard", "yes"]]),
      ["read the focus-sprint schedule on the board", "check the Pomodoro schedule on the whiteboard", "xem khung giờ tập trung làm việc trên bảng trắng"]),

    cfA("write_study_goal_on_board", "whiteboard", "Add my study goal to the community board", "Viết mục tiêu hoàn thành bài tập lên bảng chung",
      "I wrote 'Finish Chapter 4 vocabulary review' on the shared goal board for extra motivation!",
      "Mình đã viết mục tiêu 'Hoàn thành ôn tập từ vựng Chương 4' lên bảng chung để có thêm động lực!",
      ["whiteboard", "study"], ["whiteboard", "study"],
      "<b>for extra motivation</b> = để có thêm động lực phấn đấu hoàn thành.",
      ["I wrote 'Finish Chapter 4 vocabulary review'", "on the shared goal board for extra motivation!"],
      ["motivation", "station", "vacation"],
      ["Sharing goals on the <b>whiteboard</b> keeps everyone motivated.", "Let's <b>study</b> hard for the next half hour!"],
      once("cf_z4_boardgoal", "yes", "Bạn đã viết mục tiêu học tập lên bảng trắng rồi."),
      at("cf_wifi", "reach", 750, [["cf_z4_boardgoal", "yes"]]),
      ["add my study goal to the community board", "write my goal on the coworking whiteboard", "viết mục tiêu hoàn thành bài tập lên bảng chung"]),

    cfA("adjust_ergonomic_stool", "ergostool", "Adjust the height of the wooden bar stool", "Chỉnh độ cao ghế đẩu có đệm tựa ở quầy làm việc",
      "Let me adjust the footrest and seat height of this ergonomic stool before I start typing.",
      "Để mình chỉnh lại thanh gác chân và độ cao của chiếc ghế đẩu công thái học này trước khi bắt đầu gõ phím.",
      ["bar stool", "work"], ["stool", "work", "laptop"],
      "<b>seat height / footrest</b> = độ cao mặt ghế / thanh gác chân.",
      ["Let me adjust the footrest and seat height", "of this ergonomic stool before I start typing."],
      ["stool", "school", "pool"],
      ["This padded <b>bar stool</b> is comfortable for long <b>work</b> sessions.", "Sit up straight while typing on your <b>laptop</b>."],
      once("cf_z4_stool", "yes", "Bạn đã chỉnh độ cao ghế ở quầy làm việc rồi."),
      at("cf_charge", "sit", 750, [["cf_z4_stool", "yes"]]),
      ["adjust the height of the wooden bar stool", "sit on the padded ergonomic stool", "chỉnh độ cao ghế đẩu có đệm tựa ở quầy làm việc"]),

    cfA("turn_on_patio_heater", "patioheater", "Stand near the warm patio heater", "Đứng gần cột đèn sưởi ấm ngoài sân thượng",
      "Even when the breeze is cool, the radiant patio heater keeps the outdoor tables nice and warm.",
      "Ngay cả khi có gió se lạnh, chiếc đèn sưởi sân thượng vẫn giữ cho các bàn ngoài trời luôn ấm áp dễ chịu.",
      ["patio heater", "warm", "terrace"], ["heater", "warm", "terrace"],
      "<b>radiant patio heater</b> = cột đèn sưởi toả nhiệt dùng cho không gian ngoài trời.",
      ["Even when the breeze is cool, the radiant patio heater", "keeps the outdoor tables nice and warm."],
      ["heater", "sweater", "weather"],
      ["The <b>patio heater</b> makes the <b>terrace</b> comfortable in any season.", "Grab a seat near the heater if you want to stay <b>warm</b>."],
      once("cf_z4_heater", "yes", "Bạn đã bật đèn sưởi ấm sân thượng rồi."),
      at("cf_terrace", "reach", 800, [["cf_z4_heater", "yes"]]),
      ["stand near the warm patio heater", "warm up by the outdoor patio heater", "đứng gần cột đèn sưởi ấm ngoài sân thượng"]),

    cfA("water_rosemary_herbs", "succulentpot", "Smell the fresh rosemary & mint pots", "Ngửi hương cây hương thảo và bạc hà trồng trong chậu",
      "Brushing my hand past the terracotta herb pot releases a fresh scent of rosemary and mint.",
      "Khẽ chạm tay qua chậu thảo mộc đất nung làm toả ra mùi hương thanh mát của lá hương thảo và bạc hà.",
      ["succulent", "fresh air"], ["succulent", "freshair", "fragrant"],
      "<b>release a fresh scent of …</b> = toả ra mùi hương tươi mát của loài cây/hoa gì.",
      ["Brushing my hand past the terracotta herb pot", "releases a fresh scent of rosemary and mint."],
      ["rosemary", "library", "dictionary"],
      ["There's a cute <b>succulent</b> and herb pot on every desk.", "I love the <b>fresh air</b> and <b>fragrant</b> herbs out here."],
      once("cf_z4_herbs", "yes", "Bạn đã ngắm chậu sen đá và hương thảo trên bàn rồi."),
      at("cf_terrace", "reach", 700, [["cf_z4_herbs", "yes"]]),
      ["smell the fresh rosemary & mint pots", "look at the succulent and herb pots on the table", "ngửi hương cây hương thảo và bạc hà trồng trong chậu"]),

    cfA("read_quiet_call_etiquette", "quietzonesign", "Read the coworking call etiquette sign", "Đọc bảng quy tắc giữ trật tự khi họp trực tuyến",
      "The wooden sign politely asks guests to use earphones for calls and keep ringtones on silent.",
      "Tấm biển gỗ lịch sự nhắc khách dùng tai nghe khi gọi điện và để chuông điện thoại ở chế độ im lặng.",
      ["quiet", "headphones"], ["quiet", "headphones", "work"],
      "<b>keep ringtones on silent</b> = để chuông điện thoại ở chế độ im lặng.",
      ["The wooden sign politely asks guests to use earphones", "for calls and keep ringtones on silent."],
      ["silent", "island", "talent"],
      ["This corner is a <b>quiet</b> zone for focused <b>work</b>.", "Always wear <b>headphones</b> for video calls."],
      once("cf_z4_etiquette", "yes", "Bạn đã đọc bảng quy tắc góc làm việc rồi."),
      at("cf_wifi", "read", 750, [["cf_z4_etiquette", "yes"]]),
      ["read the coworking call etiquette sign", "check the quiet zone rules on the desk", "đọc bảng quy tắc giữ trật tự khi họp trực tuyến"]),

    cfA("place_phone_on_stand", "quietzonesign", "Put my phone on silent mode", "Chuyển điện thoại sang chế độ im lặng khi làm việc",
      "I'll switch my phone to silent mode so notification chimes won't distract my neighbors.",
      "Mình sẽ chuyển điện thoại sang chế độ im lặng để tiếng chuông thông báo không làm xao nhãng những người ngồi cạnh.",
      ["quiet", "study"], ["quiet", "study"],
      "<b>distract someone</b> = làm ai đó bị phân tâm, xao nhãng.",
      ["I'll switch my phone to silent mode", "so notification chimes won't distract my neighbors."],
      ["distract", "attract", "contract"],
      ["Thank you for keeping the workspace <b>quiet</b>.", "Putting your phone away helps you <b>study</b> faster."],
      once("cf_z4_silent", "yes", "Bạn đã chuyển điện thoại sang chế độ im lặng rồi."),
      at("cf_charge", "type", 700, [["cf_z4_silent", "yes"]]),
      ["put my phone on silent mode", "silence my phone in the quiet work zone", "chuyển điện thoại sang chế độ im lặng khi làm việc"]),

    cfA("greet_coworker_alex", "coworkeralex", "Say hello to Alex the UI designer", "Chào hỏi Alex đang thiết kế giao diện ở bàn cạnh",
      "Hi Alex! How is your app design project coming along today?",
      "Chào Alex! Dự án thiết kế ứng dụng của bạn hôm nay tiến triển thế nào rồi?",
      ["coworker", "laptop", "work"], ["coworker", "laptop", "work"],
      "<b>How is … coming along?</b> = Công việc/dự án … tiến triển đến đâu rồi? (câu hỏi thăm tự nhiên).",
      ["Hi Alex! How is your app design project", "coming along today?"],
      ["project", "object", "subject"],
      ["Alex is a friendly <b>coworker</b> at the shared desk.", "He's sketching layouts on his <b>laptop</b> while doing remote <b>work</b>."],
      once("cf_z4_alexgreet", "yes", "Bạn đã chào hỏi Alex ở bàn làm việc rồi."),
      at("cf_charge", "wave", 800, [["cf_z4_alexgreet", "yes"]]),
      ["say hello to Alex the UI designer", "greet Alex at the coworking bar", "chào hỏi Alex đang thiết kế giao diện ở bàn cạnh"]),

    cfA("ask_alex_watch_laptop", "coworkeralex", "Ask Alex to watch my laptop for a minute", "Nhờ Alex trông giúp máy tính một lát để đi lấy nước",
      "Excuse me, Alex, could you keep an eye on my laptop for a moment while I pick up my hot latte?",
      "Xin lỗi Alex, bạn để mắt trông giúp chiếc máy tính của mình một lát trong lúc mình qua quầy lấy ly latte nóng được không?",
      ["laptop", "latte", "hot"], ["laptop", "latte", "hot"],
      "<b>keep an eye on …</b> = để mắt trông chừng giúp cái gì một lát.",
      ["Excuse me, Alex, could you keep an eye on my laptop", "for a moment while I pick up my hot latte?"],
      ["moment", "comment", "garment"],
      ["I'd be happy to keep an eye on your <b>laptop</b>!", "Go grab your <b>hot latte</b> while it's fresh."],
      once("cf_z4_alexwatch", "yes", "Bạn đã nhờ Alex trông giúp máy tính rồi."),
      at("cf_charge", "point", 800, [["cf_z4_alexwatch", "yes"]]),
      ["ask Alex to watch my laptop for a minute", "ask Alex to keep an eye on my stuff", "nhờ Alex trông giúp máy tính một lát để đi lấy nước"]),

    cfA("share_keyboard_shortcut", "coworkeralex", "Trade productivity tips with Alex", "Trao đổi mẹo phím tắt máy tính cùng Alex",
      "Thanks for showing me that keyboard shortcut, Alex—it saves so much time!",
      "Cảm ơn Alex đã chỉ cho mình tổ hợp phím tắt đó nhé — tiết kiệm được bao nhiêu là thời gian!",
      ["coworker", "laptop"], ["coworker", "laptop", "work"],
      "<b>save time</b> = tiết kiệm thời gian.",
      ["Thanks for showing me that keyboard shortcut, Alex—", "it saves so much time!"],
      ["shortcut", "haircut", "walnut"],
      ["Chatting with a <b>coworker</b> during breaks is inspiring.", "That shortcut makes <b>laptop</b> <b>work</b> much faster."],
      once("cf_z4_alextip", "yes", "Bạn đã trao đổi mẹo làm việc với Alex rồi."),
      at("cf_charge", "point", 750, [["cf_z4_alextip", "yes"]]),
      ["trade productivity tips with Alex", "thank Alex for the keyboard shortcut tip", "trao đổi mẹo phím tắt máy tính cùng Alex"]),

    cfA("greet_remote_sophie", "remotesophie", "Greet Sophie at the terrace table", "Chào hỏi Sophie đang làm việc ở bàn sân thượng",
      "Hi Sophie! Isn't it lovely working out here on the sunny terrace with a warm cup of tea?",
      "Chào Sophie! Ngồi làm việc ngoài sân thượng nắng ấm cùng một tách trà nóng thế này thật tuyệt phải không?",
      ["terrace", "warm", "tea"], ["terrace", "warm", "tea"],
      "<b>Isn't it lovely + V-ing …?</b> = Chẳng phải làm việc gì đó rất tuyệt vời sao? (câu hỏi đuôi tạo sự đồng điệu).",
      ["Hi Sophie! Isn't it lovely working out here", "on the sunny terrace with a warm cup of tea?"],
      ["lovely", "lonely", "lively"],
      ["Sophie loves working on the <b>terrace</b> in the morning.", "She always orders a pot of <b>warm</b> herbal <b>tea</b>."],
      once("cf_z4_sophiegreet", "yes", "Bạn đã chào hỏi Sophie ở bàn sân thượng rồi."),
      at("cf_terrace", "wave", 800, [["cf_z4_sophiegreet", "yes"]]),
      ["greet Sophie at the terrace table", "say hello to Sophie on the terrace", "chào hỏi Sophie đang làm việc ở bàn sân thượng"]),

    cfA("practice_english_pitch_with_sophie", "remotesophie", "Practice my English presentation intro with Sophie", "Tập nói thử phần mở đầu bài thuyết trình tiếng Anh với Sophie",
      "Sophie, do you mind listening to the one-minute introduction of my English presentation?",
      "Sophie ơi, bạn có phiền nghe thử phần giới thiệu dài một phút của bài thuyết trình tiếng Anh giúp mình không?",
      ["study", "chat", "work"], ["study", "chat", "work"],
      "<b>Do you mind + V-ing …?</b> = Bạn có phiền làm giúp mình việc gì đó không?",
      ["Sophie, do you mind listening to", "the one-minute introduction of my English presentation?"],
      ["present", "prevent", "pretend"],
      ["Practicing out loud is the best way to <b>study</b> for a presentation.", "We had a helpful <b>chat</b> about business English at <b>work</b>."],
      once("cf_z4_sophiepitch", "yes", "Bạn đã luyện tập thuyết trình tiếng Anh cùng Sophie rồi."),
      at("cf_terrace", "point", 850, [["cf_z4_sophiepitch", "yes"]]),
      ["practice my English presentation intro with Sophie", "rehearse my English pitch with Sophie", "tập nói thử phần mở đầu bài thuyết trình tiếng Anh với Sophie"]),

    cfA("ask_sophie_wifi_speed", "remotesophie", "Ask Sophie how the terrace video call quality is", "Hỏi Sophie về chất lượng gọi video ngoài sân thượng",
      "Have your video calls been smooth out here on the terrace today, Sophie?",
      "Hôm nay các cuộc gọi video của bạn ở ngoài sân thượng này có mượt mà ổn định không Sophie?",
      ["Wi-Fi", "terrace", "online"], ["wifi", "terrace", "online"],
      "<b>Have your calls been smooth?</b> = Các cuộc gọi của bạn có mượt mà/ổn định không?",
      ["Have your video calls been smooth", "out here on the terrace today, Sophie?"],
      ["smooth", "soothe", "booth"],
      ["The <b>Wi-Fi</b> on the <b>terrace</b> is super smooth today!", "I just finished an <b>online</b> meeting without a single glitch."],
      once("cf_z4_sophiewifi", "yes", "Bạn đã hỏi Sophie về tốc độ mạng ngoài sân thượng rồi."),
      at("cf_terrace", "point", 750, [["cf_z4_sophiewifi", "yes"]]),
      ["ask Sophie how the terrace video call quality is", "ask Sophie if the terrace Wi-Fi is smooth", "hỏi Sophie về chất lượng gọi video ngoài sân thượng"]),

    cfA("organize_charging_cables", "chargebar", "Wrap my charging cord neatly with a Velcro tie", "Cuộn gọn dây sạc bằng dây đai dán",
      "Keeping my laptop charger cord neatly coiled leaves plenty of space on the charging bar.",
      "Cuộn gọn phần dây sạc máy tính lại giúp mặt bàn ở quầy sạc còn dư nhiều không gian thoáng đãng.",
      ["charger", "laptop"], ["charger", "laptop", "outlet"],
      "<b>neatly coiled</b> = được cuộn tròn gọn gàng, không bị rối.",
      ["Keeping my laptop charger cord neatly coiled", "leaves plenty of space on the charging bar."],
      ["coiled", "boiled", "spoiled"],
      ["Wrap up your <b>charger</b> cord so nobody trips over it.", "The charging bar has an <b>outlet</b> for every <b>laptop</b>."],
      once("cf_z4_coilcord", "yes", "Bạn đã cuộn gọn dây sạc trên bàn rồi."),
      at("cf_charge", "reach", 700, [["cf_z4_coilcord", "yes"]]),
      ["wrap my charging cord neatly with a Velcro tie", "organize my laptop cables on the charging bar", "cuộn gọn dây sạc bằng dây đai dán"]),

    cfA("stretch_shoulders_at_desk", "terrace", "Stand up and stretch my shoulders", "Đứng dậy vươn vai thư giãn giữa giờ học",
      "I'm taking a two-minute break to roll my shoulders and breathe in the fresh terrace air.",
      "Mình đang nghỉ giải lao hai phút để xoay nhẹ bờ vai và hít thở bầu không khí trong lành ngoài sân thượng.",
      ["fresh air", "relax", "terrace"], ["freshair", "relax", "terrace"],
      "<b>roll my shoulders</b> = xoay tròn khớp vai cho đỡ mỏi khi ngồi máy tính lâu.",
      ["I'm taking a two-minute break to roll my shoulders", "and breathe in the fresh terrace air."],
      ["shoulder", "boulder", "folder"],
      ["Step out onto the <b>terrace</b> for a breath of <b>fresh air</b>.", "Stretching every hour helps your muscles <b>relax</b>."],
      once("cf_z4_stretch", "yes", "Bạn đã đứng dậy vươn vai thư giãn rồi."),
      at("cf_terrace", "wave", 750, [["cf_z4_stretch", "yes"]]),
      ["stand up and stretch my shoulders", "take a stretch break in the fresh terrace air", "đứng dậy vươn vai thư giãn giữa giờ học"])
  ];

  // Add all new CF_W0 state keys so resetRoomState & initial state know about them
  const EXTRA_W0 = {
    cf_z1_special: "no", cf_z1_allergen: "no", cf_z1_pos: "no", cf_z1_printer: "no",
    cf_z1_cookie: "no", cf_z1_macaron: "no", cf_z1_giftcard: "no", cf_z1_beanbag: "no",
    cf_z1_origin: "no", cf_z1_bell: "no", cf_z1_sanitizer: "no", cf_z1_buzzer: "no",
    cf_z1_mug: "no", cf_z1_freshpastry: "no", cf_z1_gingertea: "no", cf_z1_chalk: "no",
    cf_z2_grinder: "no", cf_z2_finegrind: "no", cf_z2_artpour: "no", cf_z2_extrafoam: "no",
    cf_z2_vanilla: "no", cf_z2_caramel: "no", cf_z2_pourover: "no", cf_z2_askpourover: "no",
    cf_z2_freewater: "no", cf_z2_rinse: "no", cf_z2_whisk: "no", cf_z2_blender: "no",
    cf_z2_warmer: "no", cf_z2_carrier: "no", cf_z2_cocoa: "no", cf_z2_oatsplash: "no",
    cf_z2_coldbrew: "no", cf_z2_liamchat: "no", cf_z2_chamomile: "no", cf_z2_rosetta: "no",
    cf_z2_teatin: "no", cf_z2_knockbox: "no",
    cf_z3_sofa: "no", cf_z3_pillow: "no", cf_z3_magazine: "no", cf_z3_novel: "no",
    cf_z3_firewarm: "no", cf_z3_mantel: "no", cf_z3_vinyl: "no", cf_z3_sleeve: "no",
    cf_z3_chess: "no", cf_z3_cards: "no", cf_z3_coatrack: "no", cf_z3_umbrella: "no",
    cf_z3_benchbag: "no", cf_z3_sunbeam: "no", cf_z3_lamp: "no", cf_z3_painting: "no",
    cf_z3_flyer: "no", cf_z3_bookclub: "no", cf_z3_coaster: "no", cf_z3_vase: "no",
    cf_z3_armchair: "no", cf_z3_figtree: "no", cf_z3_busrack: "no", cf_z3_wipecrumb: "no",
    cf_z3_samgreet: "no", cf_z3_samclue: "no", cf_z3_mayanovel: "no", cf_z3_mayatea: "no", cf_z3_rug: "no",
    cf_z3_teacart: "no", cf_z3_honeyjar: "no", cf_z3_ottoman: "no",
    cf_z4_stand: "no", cf_z4_powerstrip: "no", cf_z4_sharesocket: "no", cf_z4_router: "no",
    cf_z4_fastband: "no", cf_z4_headphones: "no", cf_z4_webinar: "no", cf_z4_todolist: "no",
    cf_z4_idioms: "no", cf_z4_desklamp: "no", cf_z4_umbrella: "no", cf_z4_canopy: "no",
    cf_z4_planter: "no", cf_z4_lights: "no", cf_z4_railing: "no", cf_z4_boulevard: "no",
    cf_z4_carafe: "no", cf_z4_printer: "no", cf_z4_staple: "no", cf_z4_whiteboard: "no",
    cf_z4_boardgoal: "no", cf_z4_stool: "no", cf_z4_heater: "no", cf_z4_herbs: "no",
    cf_z4_etiquette: "no", cf_z4_silent: "no", cf_z4_alexgreet: "no", cf_z4_alexwatch: "no",
    cf_z4_alextip: "no", cf_z4_sophiegreet: "no", cf_z4_sophiepitch: "no", cf_z4_sophiewifi: "no",
    cf_z4_coilcord: "no", cf_z4_stretch: "no"
  };
  Object.assign(S.CF_W0, EXTRA_W0);

  /* ---------- Zone-specific NPCs & Replies (every zone >= 60 total sentences) ---------- */
  // Zone 1: Counter Barista & Pastry Server Claire
  Object.assign(S.NPCS.barista.lines, {
    check_seasonal_specials: { en: "Our seasonal special is a warm cinnamon honey oat latte!", vi: "Món theo mùa hôm nay là latte yến mạch mật ong quế ấm nóng ạ!" },
    ask_about_calories: { en: "All our herbal teas are zero-calorie, and oat milk is very light.", vi: "Các loại trà thảo mộc đều không calo, còn sữa yến mạch thì rất thanh nhẹ ạ." },
    chat_about_weather_cafe: { en: "A hot drink is the best way to stay cozy today!", vi: "Một ly đồ uống nóng ấm là tuyệt nhất để giữ ấm hôm nay đấy!" },
    compliment_the_music: { en: "Glad you like it! It's our acoustic morning playlist.", vi: "Mừng là bạn thích! Đây là danh sách nhạc acoustic buổi sáng của quán." },
    ask_for_almond_milk: { en: "Sure thing! I'll steam creamy almond milk for your drink.", vi: "Được ngay! Mình sẽ đánh nóng sữa hạnh nhân béo thơm cho ly của bạn." },
    order_extra_hot: { en: "Got it—extra hot so it stays warm at your table!", vi: "Rõ rồi ạ — pha thật nóng để bạn mang về bàn vẫn còn ấm!" },
    ask_to_split_bill: { en: "No problem at all, we can split the bill evenly.", vi: "Không vấn đề gì đâu ạ, tụi mình có thể tách đôi hoá đơn." },
    check_change_at_register: { en: "Here is your exact change and receipt—thank you!", vi: "Tiền thừa vừa đủ và hoá đơn của bạn đây — cảm ơn bạn nhé!" },
    ask_about_nuts: { en: "Our butter croissants and blueberry muffins are 100% nut-free.", vi: "Bánh sừng bò bơ và muffin việt quất của quán hoàn toàn không chứa hạt." },
    order_warm_bagel: { en: "I'll toast that sesame bagel with cream cheese right now!", vi: "Mình nướng ấm chiếc bánh mì vòng mè phết phô mai kem cho bạn ngay đây!" },
    drop_coins_in_tipjar: { en: "Thank you so much for the tip—we really appreciate it!", vi: "Cảm ơn bạn rất nhiều vì tiền boa — tụi mình trân quý lắm!" },
    use_loyalty_card: { en: "Here's your stamp! Only two more until a free hot drink.", vi: "Dấu tích điểm của bạn đây! Chỉ còn hai dấu nữa là được tặng một ly đồ nóng miễn phí." },
    redeem_free_coffee: { en: "Ten stamps! Your warm latte today is on the house!", vi: "Đủ mười dấu rồi! Ly latte ấm hôm nay quán xin mời bạn nhé!" },
    join_the_queue: { en: "Welcome! I'll be right with you in just a moment.", vi: "Chào mừng bạn! Mình sẽ phục vụ bạn ngay trong giây lát nhé." },
    let_hurried_customer_ahead: { en: "That was so kind of you to let him go ahead!", vi: "Bạn thật tốt bụng khi nhường vị khách đang vội lên trước!" },
    read_daily_special: { en: "Our honey oat latte pairs wonderfully with a warm croissant!", vi: "Latte yến mạch mật ong dùng kèm bánh sừng bò nướng ấm là hợp số một!" },
    check_allergen_chart: { en: "Let me know if you have any allergies—we take great care!", vi: "Bạn cứ báo mình nếu có dị ứng thực phẩm nhé — quán luôn kiểm tra rất kỹ!" },
    tap_card_on_pos: { en: "Beep! Contactless payment approved—thank you!", vi: "Bíp! Thanh toán chạm thẻ đã thành công — cảm ơn bạn!" },
    check_receipt_paper: { en: "Here's your printed receipt with order number forty-two.", vi: "Hoá đơn in sẵn số thứ tự bốn mươi hai của bạn đây ạ." },
    buy_chocolate_cookie: { en: "Here's a warm chocolate chip cookie fresh from the jar!", vi: "Chiếc bánh quy sô-cô-la ấm lấy từ hũ thuỷ tinh của bạn đây!" },
    choose_pistachio_macaron: { en: "The pistachio macaron is delicate, nutty, and not too sweet.", vi: "Bánh macaron hạt dẻ cười giòn xốp, bùi thơm và ngọt rất dịu." },
    buy_coffee_gift_card: { en: "Twenty dollars loaded onto the gift card—with a free gift envelope!", vi: "Đã nạp 20 đô vào thẻ quà tặng — kèm một chiếc phong bì xinh xắn cho bạn!" },
    smell_roasted_bean_bag: { en: "We roasted that medium-roast batch just forty-eight hours ago.", vi: "Mẻ hạt rang vừa đó quán mới rang cách đây đúng 48 tiếng thôi." },
    ask_decaf_bean_origin: { en: "Those single-origin Arabica beans come from a high-altitude farm in Cầu Đất!", vi: "Hạt Arabica đơn nguồn gốc đó đến từ nông trại vùng cao Cầu Đất đấy ạ!" },
    ring_counter_bell: { en: "Hi there! What warm drink can I get started for you today?", vi: "Chào bạn! Hôm nay mình pha đồ uống ấm gì cho bạn nhỉ?" },
    use_counter_sanitizer: { en: "Help yourself to the sanitizer anytime!", vi: "Bạn cứ tự nhiên dùng nước rửa tay khô bất cứ lúc nào nhé!" },
    take_order_buzzer: { en: "Your buzzer will glow and hum as soon as your drink is ready at the bar.", vi: "Thẻ báo sẽ sáng đèn và rung nhẹ ngay khi đồ uống của bạn hoàn tất ở quầy pha chế." },
    admire_ceramic_mug: { en: "Those stoneware mugs are handcrafted by a local potter!", vi: "Những chiếc cốc gốm đó được nghệ nhân địa phương làm thủ công từng chiếc đấy!" },
    ask_pastry_freshness: { en: "The butter croissants and cinnamon rolls came out of the oven ten minutes ago!", vi: "Bánh sừng bò bơ và bánh cuộn quế vừa mới ra lò cách đây mười phút thôi!" },
    ask_warm_ginger_tea_counter: { en: "A steaming cup of hot ginger honey tea coming right up—it'll warm you right up!", vi: "Một tách trà gừng mật ong nóng bốc khói có ngay đây — uống vào sẽ ấm người lên liền!" },
    read_welcome_chalkboard: { en: "Claire hand-lettered that chalkboard quote this morning!", vi: "Chính tay Claire đã nắn nót viết câu trích dẫn trên bảng phấn sáng nay đấy!" }
  });

  // Zone 2: Head Barista Liam at the Espresso Bar & Pickup
  S.NPCS.head_barista = {
    id: "head_barista", name: "Head Barista Liam", role_vi: "Trưởng quầy pha chế Liam",
    avatar: "👨‍🍳", voice: "young_male", room: "cafe_bar", anchor: "obj:baristaliam",
    lines: {
      watch_barista_steam_milk: { en: "I aerate the milk for three seconds to get silky microfoam!", vi: "Mình sục khí vào sữa trong ba giây để tạo lớp bọt mịn như lụa!" },
      smell_fresh_espresso: { en: "Freshly ground Arabica has notes of cocoa and toasted almond.", vi: "Hạt Arabica mới xay có tầng hương ca cao và hạnh nhân nướng thơm phức." },
      ask_for_cup_tray: { en: "Here's a sturdy cardboard carrier so your hot cups stay upright.", vi: "Khay giấy cứng cáp của bạn đây để các ly đồ nóng không bị nghiêng đổ." },
      thank_barista_at_pickup: { en: "My pleasure! Enjoy your warm drink while it's fresh!", vi: "Rất hân hạnh! Chúc bạn thưởng thức đồ uống ấm thật ngon nhé!" },
      put_on_cup_sleeve: { en: "Good call—a corrugated sleeve protects your fingers from the heat.", vi: "Chuẩn luôn — vòng giấy cách nhiệt giúp bạn cầm ly nóng không bị bỏng tay." },
      ask_for_reusable_mug: { en: "Thanks for bringing a reusable tumbler! I'll pour your hot coffee right in.", vi: "Cảm ơn bạn đã mang bình cá nhân! Mình sẽ rót cà phê nóng trực tiếp vào bình nhé." },
      sprinkle_cinnamon_powder: { en: "Warm cinnamon on milk foam smells like autumn in a cup!", vi: "Bột quế ấm rắc lên bọt sữa thơm nồng nàn như mùa thu trong từng ngụm!" },
      add_raw_honey: { en: "Wildflower honey dissolves smoothly in hot tea and coffee.", vi: "Mật ong hoa rừng tan rất êm trong trà nóng và cà phê ấm." },
      wipe_spilled_coffee: { en: "Thanks for wiping that drop—I'll bring a dry cloth too!", vi: "Cảm ơn bạn đã lau giúp giọt nước tràn — để mình mang khăn khô ra lau thêm nhé!" },
      take_wooden_stirrer: { en: "Birchwood stirrers are biodegradable and won't alter the flavor.", vi: "Que khuấy gỗ bạch dương tự phân huỷ sinh học và giữ nguyên hương vị đồ uống." },
      grab_sparkling_water: { en: "If it's chilly today, we also have free warm filtered water at the dispenser!", vi: "Nếu hôm nay trời se lạnh, tụi mình cũng có nước ấm miễn phí ở bình lọc nhé!" },
      check_juice_ingredients: { en: "Cold-pressed with fresh ginger root, crisp apple, and organic kale!", vi: "Ép lạnh nguyên chất từ củ gừng tươi, táo giòn và cải xoăn hữu cơ đấy!" },
      hear_grinder_hum: { en: "We grind every dose fresh to order so the aroma never fades.", vi: "Tụi mình xay mới từng phần ngay khi khách gọi để giữ trọn hương thơm." },
      ask_for_fine_grind: { en: "Done! Ground to a fine espresso texture and sealed tight for you.", vi: "Xong rồi đây! Đã xay mịn chuẩn pha máy espresso và đóng kín miệng túi cho bạn." },
      watch_latte_art_pour: { en: "Tilt the cup, pour steady in the center, then wiggle for the rosetta leaf!", vi: "Nghiêng tách, rót đều tay vào giữa rồi lắc nhẹ cổ tay để tạo hình chiếc lá rosetta!" },
      ask_for_extra_foam: { en: "One extra-foamy warm cappuccino—light as a cloud!", vi: "Một ly cappuccino ấm thêm thật nhiều bọt sữa — nhẹ bẫng như mây!" },
      pump_vanilla_syrup: { en: "Our house-made vanilla syrup uses real Madagascar vanilla beans.", vi: "Si-rô va-ni tự nấu của quán dùng quả va-ni Madagascar thật 100%." },
      pump_caramel_drizzle: { en: "There you go—a warm crisscross of buttery caramel drizzle!", vi: "Của bạn đây — những đường sốt caramel bơ ấm áp đan chéo trên mặt bọt sữa!" },
      watch_pourover_bloom: { en: "That thirty-second bloom releases trapped carbon dioxide so the flavor shines.", vi: "Ba mươi giây ủ nở đó giúp giải phóng khí CO2 để hương vị cà phê bung toả." },
      ask_about_single_origin: { en: "We're pouring a washed Ethiopian Yirgacheffe with warm bergamot and jasmine notes.", vi: "Hôm nay quầy đang pha hạt Ethiopia Yirgacheffe có hương cam bergamot và hoa nhài ấm." },
      pour_free_filtered_water: { en: "Room-temperature filtered water is always free at the bar.", vi: "Nước lọc tinh khiết ở nhiệt độ phòng luôn phục vụ miễn phí tại quầy." },
      rinse_travel_cup: { en: "Let me give your thermos a quick warm-water rinse too!", vi: "Để mình tráng sơ bình giữ nhiệt bằng nước ấm giúp bạn luôn nhé!" },
      watch_matcha_whisking: { en: "Whisking in a W-motion with an eighty-prong bamboo whisk makes emerald foam!", vi: "Đánh theo chữ W bằng chổi tre 80 nan tạo ra lớp bọt xanh ngọc bích mịn màng!" },
      check_blender_lid: { en: "That acoustic shield cuts the blender noise in half!", vi: "Chiếc lồng chụp cách âm đó giảm được một nửa tiếng ồn của máy xay đấy!" },
      feel_warm_ceramic_cup: { en: "Pre-warmed porcelain keeps your espresso at the ideal temperature.", vi: "Tách sứ ủ ấm sẵn giúp giữ shot espresso ở nhiệt độ chuẩn nhất." },
      take_four_cup_carrier: { en: "Press each cup firmly into the four corners and you're good to go!", vi: "Nhấn nhẹ từng cốc khớp vào bốn góc khay là yên tâm mang đi!" },
      dust_cocoa_powder: { en: "Dutch-process cocoa adds a rich dark-chocolate finish to every sip.", vi: "Bột ca cao nguyên chất tạo hậu vị sô-cô-la đắng dịu cho từng ngụm cà phê." },
      pour_splash_of_oat_milk: { en: "Just a splash of steamed oat milk makes an Americano super velvety.", vi: "Chỉ cần thêm một chút sữa yến mạch ấm là ly Americano dịu mượt hẳn." },
      admire_cold_brew_drip: { en: "One drop every second through the glass coil—patience in liquid form!", vi: "Mỗi giây nhỏ đúng một giọt qua ống xoắn thuỷ tinh — sự kiên nhẫn kết tinh thành hương vị!" },
      chat_with_head_barista: { en: "Nine bars of pressure and 28 seconds—that's the golden espresso rule!", vi: "Chín bar áp suất và 28 giây chiết xuất — đó là quy tắc vàng của espresso!" },
      ask_barista_for_hot_ginger_tea: { en: "I steeped fresh ginger slices with chamomile and honey—drink it while it's warm!", vi: "Mình đã ủ lát gừng tươi cùng hoa cúc và mật ong — bạn uống lúc còn ấm cho dịu họng nhé!" },
      compliment_latte_heart: { en: "You just made my day! Nothing makes a barista happier than a smile.", vi: "Lời khen của bạn làm mình vui cả ngày! Không gì làm barista hạnh phúc hơn nụ cười của khách." },
      smell_chamomile_tea_tin: { en: "Whole dried chamomile blossoms and ginger—zero caffeine and super calming.", vi: "Nụ hoa cúc khô nguyên bông phối gừng ấm — không caffeine và giúp thư giãn tuyệt vời." },
      watch_barista_knock_puck: { en: "We bag all our used coffee grounds for neighborhood garden compost!", vi: "Tụi mình đóng túi toàn bộ bã cà phê để tặng bà con quanh khu phố làm phân bón cây!" }
    }
  };

  // Zone 3: Regular Sam & Bookworm Maya in the Indoor Seating & Lounge
  Object.assign(S.NPCS.customer.lines, {
    sit_by_window: { en: "The morning light by this window is lovely, isn't it?", vi: "Ánh nắng sớm bên khung cửa sổ này dễ chịu thật đấy nhỉ?" },
    drink_coffee_cafe: { en: "Nothing beats the first warm sip of coffee in a cozy chair!", vi: "Không gì tuyệt bằng ngụm cà phê ấm đầu tiên trên chiếc ghế êm ái!" },
    eat_croissant: { en: "Those flaky croissants smell heavenly across the room!", vi: "Mùi bánh sừng bò nướng bơ thơm lan toả khắp cả căn phòng!" },
    eat_my_snack: { en: "The pastries here are baked fresh every single morning.", vi: "Bánh ngọt ở quán này sáng nào cũng được nướng mới tinh đấy." },
    borrow_a_book: { en: "That travel book on the middle shelf is a wonderful read!", vi: "Cuốn sách du lịch ở ngăn kệ giữa đọc cuốn lắm đấy!" },
    return_the_book: { en: "Thanks for keeping the community bookshelf so neat!", vi: "Cảm ơn bạn đã xếp lại tủ sách cộng đồng gọn gàng nhé!" },
    leave_umbrella: { en: "Smart move leaving your umbrella in the brass stand by the door.", vi: "Để ô vào ống đồng cạnh cửa là chuẩn bài luôn, khỏi lo ướt sàn." },
    take_my_umbrella: { en: "Glad you remembered your umbrella before heading out!", vi: "May quá bạn nhớ lấy lại chiếc ô trước khi ra về!" },
    throw_away_cup: { en: "Thanks for sorting your paper cup into the recycling bin!", vi: "Cảm ơn bạn đã bỏ cốc giấy đúng bên ngăn tái chế nhé!" },
    read_travel_magazine: { en: "The photos of Kyoto coffee houses in that issue are stunning!", vi: "Bộ ảnh các quán cà phê cổ ở Kyoto trong số tạp chí đó đẹp mê hồn!" },
    shake_off_raindrops: { en: "Come warm up inside by the fireplace!", vi: "Vào trong ngồi gần lò sưởi cho ấm người bạn ơi!" },
    write_in_journal: { en: "This quiet lounge is the best place to reflect and write.", vi: "Không gian phòng khách yên tĩnh này là nơi lý tưởng nhất để suy ngẫm và viết lách." },
    watch_people_outside: { en: "People-watching with a warm mug in hand is so relaxing.", vi: "Ngắm dòng người qua lại với chiếc cốc ấm trong tay thật thư thái." },
    sort_paper_and_plastic: { en: "Separating the lid and cup makes recycling so much easier!", vi: "Tách riêng nắp nhựa và cốc giấy giúp việc tái chế hiệu quả hơn hẳn!" },
    relax_on_velvet_sofa: { en: "That emerald velvet sofa is the most comfortable seat in town!", vi: "Chiếc ghế sofa nhung xanh ngọc đó là chỗ ngồi êm nhất cả khu phố đấy!" },
    fluff_throw_pillow: { en: "Those linen cushions make it easy to read for hours.", vi: "Mấy chiếc gối tựa vải lanh đó giúp ngồi đọc sách hàng giờ không mỏi lưng." },
    browse_art_magazine: { en: "I love the minimalist architecture spread on page twenty!", vi: "Mình mê nhất chuyên đề kiến trúc tối giản ở trang hai mươi!" },
    pick_travel_novel: { en: "Take your time reading—the lounge stays quiet all afternoon.", vi: "Bạn cứ thong thả đọc nhé — khu ghế ngồi trong nhà yên tĩnh suốt cả buổi chiều." },
    warm_hands_by_fireplace: { en: "Isn't this electric fireplace cozy? It warms your hands right up!", vi: "Lò sưởi này ấm cúngเนอะ? Đưa tay lại gần là ấm sực lên ngay!" },
    admire_mantel_candles: { en: "The pine garland and warm fairy lights feel like home.", vi: "Dây thông xanh cùng ánh đèn vàng tạo cảm giác ấm áp như ở nhà vậy." },
    watch_vinyl_spinning: { en: "Nothing compares to the warm crackle of a real vinyl record.", vi: "Không gì sánh được với âm thanh mộc mạc ấm áp của đĩa than thật." },
    read_album_sleeve: { en: "Bill Evans on vinyl is the ultimate coffeehouse soundtrack!", vi: "Nhạc jazz Bill Evans phát trên đĩa than đúng là linh hồn của quán cà phê!" },
    inspect_chess_board: { en: "Fancy a friendly ten-minute game of chess over tea?", vi: "Bạn có hứng làm một ván cờ vua giao hữu mười phút bên tách trà không?" },
    play_quick_card_game: { en: "Those English conversation cards have really fun questions!", vi: "Bộ thẻ trò chuyện tiếng Anh đó có nhiều câu hỏi thú vị lắm!" },
    hang_jacket_on_rack: { en: "Hanging up your heavy coat makes sitting on the sofa much comfier.", vi: "Treo áo khoác dày lên giá giúp ngồi sofa thoải mái hơn hẳn." },
    place_umbrella_in_stand: { en: "The drip tray at the bottom keeps the wooden floor spotless.", vi: "Khay hứng nước dưới chân giá để ô giữ cho sàn gỗ luôn khô sạch." },
    set_bag_on_cushion: { en: "Plenty of room on the window bench for your backpack!", vi: "Băng ghế dài bên cửa sổ còn rộng rãi chỗ để ba lô lắm!" },
    enjoy_sunbeam_by_window: { en: "The morning sunbeam through the glass feels wonderful on chilly days.", vi: "Vạt nắng ban mai chiếu qua khung kính ấm áp dễ chịu vô cùng." },
    switch_on_reading_lamp: { en: "That warm brass lamp gives the nicest glow for reading print.", vi: "Chiếc đèn cây bằng đồng đó toả ánh sáng vàng dịu mắt để đọc sách giấy lắm." },
    admire_watercolor_painting: { en: "A local artist painted those coffee harvest scenes with real espresso!", vi: "Một hoạ sĩ địa phương đã vẽ bức tranh mùa thu hoạch đó bằng chính màu cà phê espresso đấy!" },
    read_community_flyer: { en: "You should come to Friday acoustic night—the guitarist is fantastic!", vi: "Tối thứ Sáu bạn nhớ ghé đêm nhạc acoustic nhé — bạn nghệ sĩ chơi đàn hay cực kỳ!" },
    pin_book_club_note: { en: "Our Sunday English book club welcomes readers of every level!", vi: "Câu lạc bộ sách tiếng Anh chiều Chủ nhật chào đón người đọc ở mọi trình độ!" },
    place_mug_on_coaster: { en: "Cork coasters keep these solid oak tables looking brand new.", vi: "Đế lót ly bằng gỗ bần giữ cho mặt bàn gỗ sồi luôn bền đẹp như mới." },
    smell_dried_lavender: { en: "Dried lavender and wheat give the table such a peaceful aroma.", vi: "Hoa oải hương khô và bông lúa mì mang lại hương thơm bình yên cho bàn trà." },
    sink_into_leather_armchair: { en: "Once you sink into that caramel leather armchair, you won't want to get up!", vi: "Một khi đã ngồi tựa vào chiếc ghế bành bọc da màu caramel đó là chẳng muốn đứng dậy luôn!" },
    admire_fiddle_fig_tree: { en: "That fiddle-leaf fig tree has grown two new leaves this month!", vi: "Cây bàng Singapore đó tháng này vừa đâm thêm hai chiếc lá non xanh mướt!" },
    return_tray_to_rack: { en: "Returning your tray to the bussing rack is so thoughtful!", vi: "Mang khay cốc đã dùng đặt lên kệ thu dọn thật lịch sự và chu đáo!" },
    wipe_table_crumb: { en: "Leaving a clean table for the next guest is great café etiquette.", vi: "Lau sạch vụn bánh cho vị khách ngồi sau là nét văn hoá đi cà phê rất đẹp." },
    greet_regular_sam: { en: "Good morning! Nothing starts my day like a hot cappuccino and the crossword.", vi: "Bác Sam: Chào buổi sáng! Không gì mở đầu ngày mới tuyệt bằng tách cappuccino nóng và mục giải ô chữ." },
    help_sam_with_crossword: { en: "Aha, 'chai tea' fits the seven boxes perfectly! Thank you, my friend!", vi: "Bác Sam: Á à, cụm từ đó vừa khít các ô chữ luôn! Cảm ơn cháu nhé!" },
    ask_maya_about_novel: { en: "It's a mystery novel set in a cozy rainy-day bookshop in London!", vi: "Maya: Đây là cuốn tiểu thuyết trinh thám lấy bối cảnh một hiệu sách ấm cúng ở London!" },
    recommend_warm_tea_to_maya: { en: "Hot chamomile honey tea sounds lovely—I'll order a pot right now!", vi: "Maya: Trà hoa cúc mật ong nóng nghe tuyệt quá — mình sẽ gọi một ấm ngay bây giờ!" },
    admire_woven_rug: { en: "That hand-woven wool rug keeps our feet warm and the room quiet.", vi: "Tấm thảm len dệt tay đó vừa giữ ấm bàn chân vừa giúp căn phòng tĩnh lặng." },
    check_herbal_tea_cart: { en: "That wooden tea trolley has the sweetest wildflower honey and organic chamomile!", vi: "Maya: Chiếc xe đẩy trà gỗ đó có mật ong hoa rừng thơm ngọt và hoa cúc hữu cơ tuyệt lắm!" },
    pour_honey_from_jar: { en: "A spoonful of golden wildflower honey makes herbal tea taste heavenly!", vi: "Maya: Một thìa mật ong hoa rừng vàng óng làm tách trà thảo mộc ngon tuyệt vời!" },
    rest_feet_on_ottoman: { en: "That knitted ottoman is so soft—putting your feet up is pure bliss!", vi: "Maya: Chiếc ghế đôn đan len đó êm cực kỳ — gác chân lên nghỉ ngơi đúng là sướng nhất!" }
  });

  // Zone 4: Coworker Alex & Remote Worker Sophie on the Terrace & Work Corner
  S.NPCS.coworker_alex = {
    id: "coworker_alex", name: "Coworker Alex", role_vi: "Nhà thiết kế Alex",
    avatar: "👨‍💻", voice: "young_male", room: "cafe_terrace", anchor: "obj:coworkeralex",
    lines: {
      ask_wifi_password: { en: "The terrace router password is COFFEE123—full five bars out here!", vi: "Mật khẩu bộ phát Wi-Fi ngoài sân thượng là COFFEE123 — sóng căng đét 5 vạch!" },
      connect_to_wifi: { en: "Connected! The 5GHz band is super fast for cloud docs.", vi: "Đã kết nối! Băng tần 5GHz tải tài liệu trực tuyến nhanh vèo vèo." },
      ask_why_wifi_slow: { en: "Try switching to the Café_5G_Work network—zero lag!", vi: "Bạn thử chuyển sang mạng Café_5G_Work xem — mượt mà không trễ chút nào!" },
      charge_phone_at_cafe: { en: "There's a fast USB-C port right next to that AC socket.", vi: "Có cổng sạc nhanh USB-C nằm ngay cạnh ổ cắm điện xoay chiều đó bạn." },
      unplug_at_cafe: { en: "100% battery! Always nice heading out with a full charge.", vi: "Đầy 100% pin rồi! Ra về với điện thoại đầy pin lúc nào cũng yên tâm." },
      work_on_laptop: { en: "We're both in deep-focus mode today—good luck with your project!", vi: "Hai đứa mình hôm nay đều tập trung cao độ nhỉ — chúc dự án của bạn suôn sẻ nhé!" },
      plug_in_laptop_charger: { en: "The under-desk cable tray keeps our power bricks neat and tidy.", vi: "Khay đỡ dây điện dưới gầm bàn giúp củ sạc của tụi mình gọn gàng hẳn." },
      sit_on_terrace: { en: "Welcome to the terrace! The fresh air really helps you think clearly.", vi: "Chào mừng ra sân thượng! Không khí thoáng đãng ngoài này giúp đầu óc minh mẫn lắm." },
      enjoy_morning_breeze: { en: "A gentle breeze and a warm mug of coffee—best office in the world!", vi: "Gió nhẹ thoảng qua cùng một cốc cà phê ấm — văn phòng tuyệt nhất thế gian!" },
      place_laptop_on_stand: { en: "Raising your screen to eye level saves your neck during long study sessions!", vi: "Nâng màn hình lên ngang tầm mắt giúp đỡ mỏi cổ hẳn khi ngồi học lâu!" },
      plug_into_power_strip: { en: "That surge protector has six grounded outlets so everyone gets power.", vi: "Ổ điện chống quá áp đó có tới sáu lỗ cắm nên ai cũng có chỗ sạc." },
      share_socket_politely: { en: "Thanks for sharing the power strip—remote workers stick together!", vi: "Cảm ơn bạn đã chia sẻ ổ cắm nhé — dân làm việc từ xa luôn hỗ trợ nhau!" },
      check_signal_bars: { en: "We get 300 Mbps right next to that wall-mounted mesh node!", vi: "Ngồi cạnh cục phát Wi-Fi mesh gắn tường này tốc độ lên tới 300 Mbps đấy!" },
      reconnect_to_fast_band: { en: "Switching to 5GHz fixed my video call jitter immediately.", vi: "Chuyển sang băng tần 5GHz làm cuộc gọi video của mình hết giật ngay tức khắc." },
      put_on_headphones: { en: "Noise-canceling headphones are a lifesaver when you're writing in English.", vi: "Tai nghe chống ồn đúng là cứu tinh khi bạn cần tập trung viết bài tiếng Anh." },
      join_english_webinar: { en: "Enjoy your webinar! Your headset mic sounds crystal clear.", vi: "Chúc buổi hội thảo trực tuyến hiệu quả nhé! Mic tai nghe của bạn thu âm trong trẻo lắm." },
      write_daily_todo_list: { en: "Writing down three main tasks on paper keeps me focused all morning.", vi: "Viết ra giấy ba đầu việc quan trọng nhất giúp mình giữ vững sự tập trung cả buổi sáng." },
      note_new_idioms: { en: "Jotting down idioms in a notebook is the fastest way to remember them!", vi: "Ghi chép thành ngữ vào sổ tay là cách nhanh nhất để nhớ từ lâu đấy!" },
      turn_on_desk_lamp: { en: "Warm 3000K light reduces eye strain when you're reading on a screen.", vi: "Ánh sáng ấm 3000K giúp giảm mỏi mắt khi bạn đọc tài liệu trên màn hình." },
      tilt_sun_umbrella: { en: "Perfect angle! Now the sun won't reflect off our laptop screens.", vi: "Góc nghiêng chuẩn luôn! Giờ thì nắng không làm chói màn hình máy tính nữa rồi." },
      sit_in_shaded_breeze: { en: "The canvas canopy keeps the table cool while letting the breeze through.", vi: "Tán dù vải bố giữ cho bàn luôn râm mát mà vẫn đón trọn làn gió nhẹ." },
      admire_olive_planter: { en: "Those potted olive and bamboo trees give us privacy and fresh oxygen!", vi: "Hàng cây ô-liu và trúc cảnh đó vừa tạo không gian riêng tư vừa mang lại bầu không khí xanh mát!" },
      watch_glowing_bistro_lights: { en: "Wait until sunset—the warm Edison bulbs make the terrace glow!", vi: "Đợi lúc hoàng hôn xuống nhé — dàn bóng đèn dây ánh vàng làm cả sân thượng lung linh luôn!" },
      look_out_over_rooftops: { en: "Looking at the horizon for twenty seconds refreshes your eyes.", vi: "Phóng tầm mắt ngắm đường chân trời 20 giây giúp đôi mắt được thư giãn ngay." },
      spot_park_from_terrace: { en: "You can see the old oak trees in the park right from this railing!", vi: "Đứng từ lan can này nhìn thấy cả những tán cây sồi cổ thụ ngoài công viên đấy!" },
      pour_warm_lemon_water: { en: "Fresh lemon and mint water keeps you hydrated without extra caffeine.", vi: "Nước ngâm chanh và bạc hà tươi giúp bổ sung nước tỉnh táo mà không lo thừa caffeine." },
      print_study_worksheet: { en: "Your two pages just came out of the wireless laser printer—super crisp!", vi: "Hai trang bài tập của bạn vừa in xong ở máy in laser không dây kìa — nét căng luôn!" },
      staple_printed_pages: { en: "Having a stapler and highlighter right at the printer desk is so handy.", vi: "Có sẵn đồ bấm kim và bút dạ quang ngay bàn máy in tiện lợi thật." },
      check_sprint_goals: { en: "Next 25-minute Pomodoro focus sprint starts in two minutes—ready?", vi: "Phiên tập trung 25 phút tiếp theo sắp bắt đầu sau hai phút nữa — bạn sẵn sàng chưa?" },
      write_study_goal_on_board: { en: "'Finish Chapter 4'—you've got this! We'll cheer when you check it off!", vi: "'Hoàn thành Chương 4' — bạn làm được mà! Lúc nào tích hoàn thành tụi mình sẽ chúc mừng nhé!" },
      adjust_ergonomic_stool: { en: "That footrest ring makes sitting at the high work bar really comfortable.", vi: "Vòng gác chân đó giúp ngồi trên ghế cao ở quầy làm việc thoải mái lắm." },
      turn_on_patio_heater: { en: "The radiant heater keeps our corner toasty warm even on breezy days!", vi: "Cột đèn sưởi giữ cho góc bàn tụi mình luôn ấm áp ngay cả khi ngoài trời nổi gió!" },
      water_rosemary_herbs: { en: "Rubbing a leaf of rosemary between your fingers smells so invigorating!", vi: "Chà nhẹ một nhánh lá hương thảo trên đầu ngón tay toả mùi hương tỉnh táo tinh thần lắm!" },
      read_quiet_call_etiquette: { en: "Everyone respects the耳机-only rule here, so it stays peaceful.", vi: "Ai ở đây cũng tôn trọng quy tắc đeo tai nghe khi họp, nên không gian luôn yên tĩnh." },
      place_phone_on_stand: { en: "Silent mode on! Goodbye distractions, hello productivity.", vi: "Đã bật chế độ im lặng! Tạm biệt sự xao nhãng, sẵn sàng làm việc hiệu quả thôi." },
      greet_coworker_alex: { en: "Hey there! Just polishing the icons for our new language-learning app.", vi: "Alex: Chào bạn! Mình đang chỉnh lại bộ biểu tượng cho ứng dụng học ngoại ngữ mới." },
      ask_alex_watch_laptop: { en: "Of course! Take your time—I'll keep an eye on your laptop and bag.", vi: "Alex: Được chứ! Bạn cứ thong thả đi lấy đồ uống nhé — mình sẽ trông máy tính và túi giúp bạn." },
      share_keyboard_shortcut: { en: "Glad it helped! Sharing workspace tips makes remote work more fun.", vi: "Alex: Rất vui vì mẹo đó hữu ích! Trao đổi kinh nghiệm làm việc từ xa thế này vui thật." },
      greet_remote_sophie: { en: "Hi! Yes, the fresh air and warm tea out here keep me energized all morning.", vi: "Sophie: Chào bạn! Đúng vậy, không khí thoáng đãng và tách trà ấm ở đây giúp mình tràn đầy năng lượng cả buổi sáng." },
      practice_english_pitch_with_sophie: { en: "Your pronunciation is super clear and confident! You're going to do great!", vi: "Sophie: Phát âm của bạn rõ ràng và tự tin lắm! Bài thuyết trình chắc chắn sẽ rất thành công!" },
      ask_sophie_wifi_speed: { en: "Zero lag at all! The mesh router on the terrace is rock-solid.", vi: "Sophie: Không hề bị trễ chút nào! Bộ phát Wi-Fi ngoài sân thượng sóng khoẻ lắm." },
      organize_charging_cables: { en: "A Velcro cable tie keeps your desk looking like a clean studio!", vi: "Dây đai dán cuộn gọn cáp sạc giúp mặt bàn của bạn trông ngăn nắp như studio!" },
      stretch_shoulders_at_desk: { en: "Good idea! I'll roll my shoulders and stretch my wrists too.", vi: "Ý hay đấy! Mình cũng xoay khớp vai và duỗi cổ tay một chút cho đỡ mỏi." }
    }
  };

  // Fix typo in read_quiet_call_etiquette.en
  S.NPCS.coworker_alex.lines.read_quiet_call_etiquette.en = "Everyone respects the headphone-only rule here, so it stays peaceful.";

  /* =====================================================================
     4 DISTINCT 2.5D SVG SCENES (counter, bar, seating, terrace)
     ===================================================================== */
  const cfDefs = `
  <defs>
    <linearGradient id="cfWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7ecda"/><stop offset="1" stop-color="#ead7b7"/></linearGradient>
    <linearGradient id="cfBrick" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5cbb0"/><stop offset="1" stop-color="#d2b08c"/></linearGradient>
    <linearGradient id="cfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset=".6" stop-color="#e4f4ff"/><stop offset="1" stop-color="#fff4dc"/></linearGradient>
    <linearGradient id="cfLeft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfc5a0"/><stop offset="1" stop-color="#ecd6b6"/></linearGradient>
    <linearGradient id="cfFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfbe92"/><stop offset="1" stop-color="#c69d6b"/></linearGradient>
    <linearGradient id="cfTile" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ede3d2"/><stop offset="1" stop-color="#d6c6ae"/></linearGradient>
    <linearGradient id="cfDeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8ab79"/><stop offset="1" stop-color="#b98550"/></linearGradient>
    <linearGradient id="cfWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dba774"/><stop offset="1" stop-color="#be8252"/></linearGradient>
    <linearGradient id="cfDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a3a"/><stop offset="1" stop-color="#684024"/></linearGradient>
    <linearGradient id="cfChrome" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6ebef"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#c2ccd4"/></linearGradient>
    <linearGradient id="cfGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef8fc"/><stop offset=".55" stop-color="#cfe9f5"/><stop offset="1" stop-color="#b4d8e8"/></linearGradient>
    <radialGradient id="cfLamp" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff2c2" stop-opacity=".75"/><stop offset="1" stop-color="#fff2c2" stop-opacity="0"/></radialGradient>
    <filter id="cfSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>`;

  /* ---------- ZONE 1 SVG: cafe_counter (Order & Payment Counter) ---------- */
  const counterShell = `${cfDefs}
  <rect x="115" y="0" width="885" height="334" fill="url(#cfWall)"/>
  <polygon points="0,0 115,0 115,334 0,640" fill="url(#cfLeft)"/>
  <polygon points="115,334 1000,334 1000,640 0,640" fill="url(#cfFloor)"/>
  ${D("floor-boards", `<g stroke="#b88f60" stroke-width="1.2" opacity=".55"><path d="M90 395 H1000 M62 455 H1000 M35 518 H1000 M12 582 H1000"/><path d="M260 334 L210 640 M480 334 L470 640 M700 334 L730 640 M880 334 L940 640"/></g>`)}
  ${D("wainscot", `<rect x="115" y="232" width="885" height="102" fill="#e6cda7" stroke="#d3b488" stroke-width="2"/><rect x="115" y="0" width="885" height="32" fill="#4a3322"/><text x="550" y="21" font-size="13" font-weight="900" fill="#fff8ec" text-anchor="middle" letter-spacing="2.5">SUNBEAM ARTISAN CAFÉ · ORDER &amp; PASTRY COUNTER</text>`)}
  ${D("left-door", `<polygon points="28,546 96,388 96,178 28,282" fill="url(#cfDark)" stroke="#5a3d1f" stroke-width="2"/><polygon points="38,512 86,402 86,214 38,292" fill="url(#cfGlass)" opacity=".88"/><circle cx="88" cy="330" r="4" fill="#f5d34a"/><text x="64" y="356" font-size="12" font-weight="800" fill="#e8743b" transform="rotate(-60 64 356)">WELCOME</text>`)}
  ${D("pendant-lamps", `<g><path d="M290 32 V64 M540 32 V64 M790 32 V64" stroke="#5a3d1f" stroke-width="2"/><g fill="#e8743b"><path d="M272 80 Q290 56 308 80Z"/><path d="M522 80 Q540 56 558 80Z"/><path d="M772 80 Q790 56 808 80Z"/></g><g fill="url(#cfLamp)" pointer-events="none"><ellipse cx="290" cy="135" rx="75" ry="60"/><ellipse cx="540" cy="135" rx="75" ry="60"/><ellipse cx="790" cy="135" rx="75" ry="60"/></g></g>`)}
  `;

  const counterWorld = [
    objG("menuboard", "menu board", "bảng thực đơn", 200, 480, 44, `
      <rect class="hit" x="320" y="42" width="320" height="132"/>
      <rect x="324" y="46" width="312" height="124" rx="6" fill="#322822" stroke="url(#cfWood)" stroke-width="7"/>
      <text x="480" y="66" font-size="14" font-weight="900" fill="#f6ead6" text-anchor="middle">ARTISAN COFFEE &amp; TEA MENU</text>
      <g font-size="10" fill="#f6ead6" font-weight="700">
        <text x="338" y="88">Espresso</text><text x="454" y="88" fill="#f5d34a">$2.50</text><text x="484" y="88">Matcha Latte</text><text x="620" y="88" fill="#f5d34a" text-anchor="end">$5.00</text>
        <text x="338" y="103">Americano</text><text x="454" y="103" fill="#f5d34a">$3.50</text><text x="484" y="103">Hot Chocolate</text><text x="620" y="103" fill="#f5d34a" text-anchor="end">$4.00</text>
        <text x="338" y="118">Caffè Latte</text><text x="454" y="118" fill="#f5d34a">$4.50</text><text x="484" y="118">Herbal Tea</text><text x="620" y="118" fill="#f5d34a" text-anchor="end">$3.00</text>
        <text x="338" y="133">Cappuccino</text><text x="454" y="133" fill="#f5d34a">$4.00</text><text x="484" y="133">Fresh Lemonade</text><text x="620" y="133" fill="#f5d34a" text-anchor="end">$3.25</text>
        <text x="338" y="148">Flat White</text><text x="454" y="148" fill="#f5d34a">$4.25</text><text x="484" y="148">Mango Smoothie</text><text x="620" y="148" fill="#f5d34a" text-anchor="end">$5.50</text>
      </g>
      <path class="cf-menuTick" d="M606 54 l6 6 l12 -14" stroke="#7fd07a" stroke-width="4" fill="none" stroke-linecap="round"/>`),
    objG("dailyspecial", "daily specials board", "bảng món đặc biệt", 202, 215, 52, `
      <rect class="hit" x="145" y="54" width="140" height="106"/>
      <rect x="150" y="58" width="130" height="98" rx="6" fill="#283d32" stroke="url(#cfWood)" stroke-width="5"/>
      <text x="215" y="78" font-size="10.5" font-weight="900" fill="#f5d34a" text-anchor="middle">★ TODAY'S SPECIAL ★</text>
      <text x="215" y="98" font-size="10" font-weight="800" fill="#fff8ec" text-anchor="middle">Warm Honey Oat Latte</text>
      <text x="215" y="114" font-size="9.5" font-weight="700" fill="#a8e6cf" text-anchor="middle">+ Butter Croissant</text>
      <rect x="178" y="124" width="74" height="20" rx="4" fill="#e8743b"/><text x="215" y="138" font-size="10" font-weight="900" fill="#fff" text-anchor="middle">COMBO $6.50</text>`),
    objG("beanbagdisplay", "roasted bean bags", "kệ túi hạt cà phê rang", 220, 745, 52, `
      <rect class="hit" x="668" y="54" width="154" height="122"/>
      <rect x="674" y="58" width="142" height="114" rx="4" fill="url(#cfWood)" stroke="#8a5a3a" stroke-width="2"/>
      <rect x="678" y="112" width="134" height="5" fill="#6e4428"/><rect x="678" y="164" width="134" height="5" fill="#6e4428"/>
      <g><rect x="688" y="72" width="26" height="38" rx="3" fill="#d9a566" stroke="#8a5a3a"/><text x="701" y="94" font-size="6.5" font-weight="900" fill="#3a2518" text-anchor="middle">ARABICA</text>
      <rect x="724" y="72" width="26" height="38" rx="3" fill="#3a9d5d" stroke="#1e5631"/><text x="737" y="94" font-size="6.5" font-weight="900" fill="#fff" text-anchor="middle">ĐÀ LẠT</text>
      <rect x="760" y="72" width="26" height="38" rx="3" fill="#c2453b" stroke="#7d281f"/><text x="773" y="94" font-size="6.5" font-weight="900" fill="#fff" text-anchor="middle">DECAF</text></g>`),
    objG("merchmug", "ceramic mugs shelf", "kệ cốc sứ lưu niệm", 222, 905, 54, `
      <rect class="hit" x="838" y="56" width="134" height="118"/>
      <rect x="844" y="60" width="122" height="110" rx="4" fill="url(#cfWood)" stroke="#8a5a3a" stroke-width="2"/>
      <rect x="848" y="114" width="114" height="5" fill="#6e4428"/>
      <g fill="#fff8ec" stroke="#8a5a3a" stroke-width="1.5"><rect x="858" y="84" width="22" height="26" rx="3"/><path d="M880 90 h6 v12 h-6" fill="none"/><rect x="896" y="84" width="22" height="26" rx="3" fill="#e8743b"/><rect x="932" y="84" width="20" height="26" rx="3" fill="#7fd0c8"/></g>
      <text x="905" y="152" font-size="8.5" font-weight="800" fill="#5a3d1f" text-anchor="middle">HANDMADE MUGS</text>`),
    objG("barista", "barista", "nhân viên pha chế", 295, 385, 138, `
      <rect class="hit" x="342" y="142" width="86" height="150"/>
      <g transform="translate(385,274) scale(1.65) translate(-442,-250)">
        <rect x="418" y="176" width="48" height="74" rx="14" fill="#3a9d5d"/><rect x="426" y="196" width="32" height="54" rx="4" fill="#5a3d1f"/>
        <circle cx="442" cy="158" r="20" fill="#f2c9a0"/><path d="M422 154 Q442 128 462 154 Q456 142 442 142 Q428 142 422 154z" fill="#2a1d14"/>
        <rect x="422" y="138" width="40" height="8" rx="3" fill="#e8743b"/>
        <circle cx="435" cy="160" r="2" fill="#2d2a26"/><circle cx="449" cy="160" r="2" fill="#2d2a26"/><path d="M436 168 Q442 173 448 168" stroke="#8a2f3c" stroke-width="2" fill="none"/>
      </g>`),
    objG("pastrybarista", "pastry server Claire", "nhân viên quầy bánh Claire", 296, 615, 138, `
      <rect class="hit" x="572" y="142" width="86" height="150"/>
      <g transform="translate(615,274) scale(1.62) translate(-442,-250)">
        <rect x="418" y="176" width="48" height="74" rx="14" fill="#e8743b"/><rect x="426" y="196" width="32" height="54" rx="4" fill="#fff8ec"/>
        <circle cx="442" cy="158" r="20" fill="#f5d0b0"/><path d="M420 156 Q442 124 464 156 Q458 140 442 140 Q426 140 420 156z" fill="#5a3218"/>
        <ellipse cx="442" cy="134" rx="22" ry="9" fill="#fff8ec" stroke="#d8cbb7"/>
        <circle cx="435" cy="160" r="2" fill="#2d2a26"/><circle cx="449" cy="160" r="2" fill="#2d2a26"/><path d="M436 168 Q442 174 448 168" stroke="#8a2f3c" stroke-width="2" fill="none"/>
      </g>`),
    objG("cafecounter", "order counter", "quầy gọi món", 370, 490, 345, `
      <rect class="hit" x="150" y="274" width="690" height="98"/>
      <ellipse cx="495" cy="374" rx="348" ry="8" fill="#000" opacity=".16" filter="url(#cfSoft)"/>
      <rect x="148" y="268" width="694" height="14" rx="4" fill="#f3ebde" stroke="#d8cbb7"/>
      <rect x="154" y="282" width="682" height="88" fill="url(#cfWood)" stroke="#9e6840"/>
      <g stroke="#9e6840" stroke-width="1.5" opacity=".65"><path d="M240 282 V370 M326 282 V370 M412 282 V370 M498 282 V370 M584 282 V370 M670 282 V370 M756 282 V370"/></g>
      <rect x="154" y="294" width="682" height="6" fill="#e8743b"/>
      <text x="495" y="340" font-size="18" font-weight="900" fill="#fff8ec" text-anchor="middle" letter-spacing="1.5">☕ ORDER &amp; PAY HERE</text>`),
    objG("loyaltysign", "loyalty card", "thẻ tích điểm", 374, 195, 200, `
      <rect class="hit" x="155" y="206" width="80" height="64"/>
      <rect x="160" y="212" width="70" height="54" rx="5" fill="#fff8ec" stroke="#e8743b" stroke-width="2.5"/>
      <text x="195" y="228" font-size="8.5" font-weight="900" fill="#5a3d1f" text-anchor="middle">STAMP CARD</text>
      <g fill="#e8743b"><circle cx="174" cy="242" r="4"/><circle cx="188" cy="242" r="4"/><circle cx="202" cy="242" r="4"/></g>
      <circle class="cf-stamped" cx="216" cy="242" r="4" fill="#3a9d5d"/>`),
    objG("giftcardrack", "gift card rack", "kệ thẻ quà tặng", 375, 268, 200, `
      <rect class="hit" x="236" y="206" width="64" height="64"/>
      <rect x="242" y="214" width="52" height="52" rx="4" fill="#3a2f2a" stroke="#a87048" stroke-width="1.5"/>
      <rect x="248" y="222" width="40" height="18" rx="3" fill="#e8743b"/><text x="268" y="234" font-size="7" font-weight="900" fill="#fff" text-anchor="middle">GIFT $20</text>
      <rect x="248" y="244" width="40" height="18" rx="3" fill="#3a9d5d"/><text x="268" y="256" font-size="7" font-weight="900" fill="#fff" text-anchor="middle">GIFT $10</text>`),
    objG("cashregister", "cash register", "máy tính tiền", 380, 345, 196, `
      <rect class="hit" x="304" y="202" width="84" height="70"/>
      <rect x="310" y="234" width="70" height="36" rx="4" fill="#4b4f57"/><rect x="316" y="208" width="58" height="28" rx="3" fill="#2d2a26"/><rect x="320" y="212" width="50" height="20" fill="#7fd0c8"/>
      <text class="cf-total" x="345" y="226" font-size="11" font-weight="900" fill="#1f3a36" text-anchor="middle">$4.50</text>`),
    objG("posreader", "card reader", "máy quẹt thẻ không chạm", 381, 418, 204, `
      <rect class="hit" x="392" y="212" width="52" height="60"/>
      <rect x="400" y="224" width="36" height="44" rx="5" fill="#2f3540" stroke="#9aa6af" stroke-width="1.5"/>
      <rect x="405" y="230" width="26" height="16" rx="2" fill="#9fd3f0"/>
      <circle class="cf-paidLed" cx="418" cy="256" r="4" fill="#7fd07a"/>`),
    objG("receiptprinter", "receipt printer", "máy in hoá đơn", 382, 474, 204, `
      <rect class="hit" x="448" y="210" width="52" height="62"/>
      <rect x="454" y="232" width="40" height="36" rx="4" fill="#dfe5ea" stroke="#7f8c98" stroke-width="1.5"/>
      <path d="M462 232 v-18 h24 v18z" fill="#fff" stroke="#b9c4ce"/>
      <path d="M466 220 h16 M466 226 h12" stroke="#5b5f66" stroke-width="1.5"/>`),
    objG("tipjar", "tip jar", "hũ tiền boa", 383, 524, 208, `
      <rect class="hit" x="502" y="216" width="44" height="56"/>
      <path d="M510 232 h28 v32 q0 5 -5 5 h-18 q-5 0 -5 -5z" fill="#e9f6fb" stroke="#9aa6af" stroke-width="1.5"/>
      <rect x="514" y="248" width="18" height="9" fill="#8fc98a"/><circle cx="524" cy="258" r="3.5" fill="#f5d34a"/>
      <text x="524" y="227" font-size="7.5" font-weight="900" fill="#5a3d1f" text-anchor="middle">TIPS ♥</text>`),
    objG("handbell", "service bell", "chuông gọi nhân viên", 384, 568, 218, `
      <rect class="hit" x="548" y="224" width="42" height="48"/>
      <path d="M554 264 Q569 240 584 264 Z" fill="#f5d34a" stroke="#b5891c" stroke-width="1.5"/>
      <circle cx="569" cy="244" r="3.5" fill="#b5891c"/><rect x="550" y="264" width="38" height="4" rx="2" fill="#4b4f57"/>`),
    objG("pastrycase", "pastry display", "tủ bánh ngọt", 385, 650, 192, `
      <rect class="hit" x="594" y="198" width="114" height="74"/>
      <rect x="598" y="204" width="106" height="64" rx="5" fill="url(#cfGlass)" stroke="#9aa6af" stroke-width="2"/>
      <line x1="598" y1="236" x2="704" y2="236" stroke="#9aa6af" stroke-width="1.5"/>
      <g class="cf-crois"><path d="M608 232 Q616 218 626 218 Q636 218 644 232 Q626 225 608 232z" fill="#e3a24a" stroke="#b9772d"/></g>
      <path d="M652 232 Q660 218 670 218 Q680 218 688 232 Q670 225 652 232z" fill="#e3a24a" stroke="#b9772d"/>
      <rect x="610" y="244" width="24" height="16" rx="3" fill="#c56a3a"/><rect x="642" y="244" width="24" height="16" rx="3" fill="#f3d27a"/><circle cx="682" cy="252" r="8" fill="#f2b8a4"/>`),
    objG("cookiejar", "cookie jar", "hũ bánh quy bơ", 386, 734, 202, `
      <rect class="hit" x="710" y="208" width="48" height="64"/>
      <rect x="716" y="220" width="36" height="46" rx="6" fill="url(#cfGlass)" stroke="#9aa6af" stroke-width="1.5"/>
      <ellipse cx="734" cy="218" rx="16" ry="4" fill="#8a5a3a"/>
      <circle cx="728" cy="248" r="7" fill="#c98950"/><circle cx="740" cy="244" r="7" fill="#c98950"/><circle cx="734" cy="236" r="7" fill="#d89a60"/>`),
    objG("macaronstand", "macaron tower", "tháp bánh macaron", 387, 782, 200, `
      <rect class="hit" x="760" y="206" width="46" height="66"/>
      <polygon points="768,266 798,266 783,216" fill="#fff8ec" stroke="#d6b88c"/>
      <ellipse cx="783" cy="232" rx="9" ry="4" fill="#9fd8a0"/><ellipse cx="783" cy="244" rx="12" ry="4.5" fill="#f4a8b8"/><ellipse cx="783" cy="256" rx="15" ry="5" fill="#ffe082"/>`),
    objG("allergensign", "allergen chart", "bảng thông tin dị ứng", 388, 885, 214, `
      <rect class="hit" x="844" y="218" width="84" height="72"/>
      <rect x="850" y="224" width="72" height="60" rx="5" fill="#fff8ec" stroke="#3a9d5d" stroke-width="2"/>
      <text x="886" y="240" font-size="8" font-weight="900" fill="#1e5631" text-anchor="middle">ALLERGEN INFO</text>
      <text x="886" y="254" font-size="7" font-weight="700" fill="#5a3d1f" text-anchor="middle">✓ Nut-Free Options</text>
      <text x="886" y="268" font-size="7" font-weight="700" fill="#5a3d1f" text-anchor="middle">✓ Oat &amp; Soy Milk</text>`),
    objG("sanitizersp", "hand sanitizer", "chai nước rửa tay khô", 430, 178, 392, `
      <rect class="hit" x="148" y="388" width="60" height="78"/>
      <rect x="164" y="412" width="28" height="44" rx="6" fill="#bfe9f5" stroke="#5c9ab0" stroke-width="1.5"/>
      <path d="M178 412 v-10 h12" stroke="#3a3f46" stroke-width="2.5" fill="none"/>
      <text x="178" y="438" font-size="6.5" font-weight="900" fill="#1d4e60" text-anchor="middle">CLEAN</text>`),
    objG("buzzerstack", "order buzzers", "thẻ rung báo nhận đồ", 432, 818, 212, `
      <rect class="hit" x="802" y="214" width="44" height="58"/>
      <rect x="808" y="228" width="32" height="38" rx="4" fill="#3a3f46" stroke="#9aa6af"/>
      <circle cx="824" cy="242" r="9" fill="#c2453b" stroke="#ff8a80" stroke-width="1.5"/>
      <text x="824" y="245" font-size="7" font-weight="900" fill="#fff" text-anchor="middle">42</text>`),
    objG("queuestand", "queue rope", "dây xếp hàng", 495, 360, 442, `
      <rect class="hit" x="260" y="432" width="200" height="82"/>
      <g fill="#c9a33a"><rect x="280" y="446" width="7" height="58"/><rect x="430" y="446" width="7" height="58"/><ellipse cx="283.5" cy="504" rx="14" ry="5"/><ellipse cx="433.5" cy="504" rx="14" ry="5"/><circle cx="283.5" cy="444" r="6"/><circle cx="433.5" cy="444" r="6"/></g>
      <path d="M287 456 Q358 484 430 456" stroke="#c2453b" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="328" y="436" width="64" height="18" rx="3" fill="#3a2f2a"/><text x="360" y="448" font-size="8.5" font-weight="900" fill="#f6ead6" text-anchor="middle">QUEUE HERE</text>`),
    objG("welcomechalk", "welcome chalkboard", "bảng phấn chào khách", 525, 690, 434, `
      <rect class="hit" x="626" y="428" width="128" height="126"/>
      <path d="M644 548 L664 442 H716 L736 548" stroke="#8a5a3a" stroke-width="6" fill="none"/>
      <rect x="648" y="446" width="84" height="78" rx="4" fill="#2b3830" stroke="#a87048" stroke-width="4"/>
      <text x="690" y="468" font-size="8.5" font-weight="900" fill="#f5d34a" text-anchor="middle">WARM COFFEE</text>
      <text x="690" y="486" font-size="8" font-weight="700" fill="#fff8ec" text-anchor="middle">WARM HEART ☕</text>
      <text x="690" y="506" font-size="7.5" font-weight="700" fill="#a8e6cf" text-anchor="middle">Open 7am – 9pm</text>`)
  ].join("\n");

  /* ---------- ZONE 2 SVG: cafe_bar (Espresso Bar & Pickup) ---------- */
  const barShell = `${cfDefs}
  <rect x="115" y="0" width="885" height="334" fill="url(#cfWall)"/>
  <polygon points="0,0 115,0 115,334 0,640" fill="url(#cfLeft)"/>
  <polygon points="115,334 1000,334 1000,640 0,640" fill="url(#cfTile)"/>
  ${D("tile-grid", `<g stroke="#bda98c" stroke-width="1.2" opacity=".55"><path d="M88 392 H1000 M60 452 H1000 M32 516 H1000 M8 580 H1000"/><path d="M240 334 L180 640 M450 334 L430 640 M660 334 L680 640 M860 334 L920 640"/></g>`)}
  ${D("backsplash", `<rect x="115" y="160" width="885" height="174" fill="#f2ece1" stroke="#d5c7b2" stroke-width="2"/><rect x="115" y="0" width="885" height="32" fill="#2c3e35"/><text x="550" y="21" font-size="13" font-weight="900" fill="#fff8ec" text-anchor="middle" letter-spacing="2.5">ESPRESSO BAR · HAND-POURED BREW &amp; PICKUP STATION</text>`)}
  ${D("pendant-lamps", `<g><path d="M280 32 V62 M540 32 V62 M800 32 V62" stroke="#2c3e35" stroke-width="2"/><g fill="#3a9d5d"><path d="M262 78 Q280 54 298 78Z"/><path d="M522 78 Q540 54 558 78Z"/><path d="M782 78 Q800 54 818 78Z"/></g><g fill="url(#cfLamp)" pointer-events="none"><ellipse cx="280" cy="135" rx="75" ry="60"/><ellipse cx="540" cy="135" rx="75" ry="60"/><ellipse cx="800" cy="135" rx="75" ry="60"/></g></g>`)}
  `;

  const barWorld = [
    objG("teacanisters", "herbal tea tins", "hộp trà thảo mộc ấm", 210, 210, 56, `
      <rect class="hit" x="140" y="58" width="140" height="92"/>
      <rect x="146" y="132" width="128" height="8" rx="3" fill="url(#cfWood)" stroke="#8a5a3a"/>
      <rect x="156" y="82" width="30" height="50" rx="4" fill="#3a9d5d" stroke="#1e5631"/><text x="171" y="110" font-size="6.5" font-weight="900" fill="#fff" text-anchor="middle">MINT</text>
      <rect x="195" y="82" width="30" height="50" rx="4" fill="#f5a623" stroke="#b57212"/><text x="210" y="110" font-size="6" font-weight="900" fill="#fff" text-anchor="middle">GINGER</text>
      <rect x="234" y="82" width="30" height="50" rx="4" fill="#7e57c2" stroke="#4527a0"/><text x="249" y="110" font-size="5.8" font-weight="900" fill="#fff" text-anchor="middle">CHAMOMILE</text>`),
    objG("syruprack", "syrup bottles", "kệ si-rô hương vị", 212, 355, 56, `
      <rect class="hit" x="296" y="58" width="118" height="92"/>
      <rect x="302" y="132" width="106" height="8" rx="3" fill="url(#cfWood)" stroke="#8a5a3a"/>
      <g><rect x="314" y="88" width="18" height="44" rx="4" fill="#d99b4e"/><path d="M323 88 v-12 h6" stroke="#3a3f46" stroke-width="2" fill="none"/>
      <rect x="344" y="88" width="18" height="44" rx="4" fill="#b86b35"/><path d="M353 88 v-12 h6" stroke="#3a3f46" stroke-width="2" fill="none"/>
      <rect x="374" y="88" width="18" height="44" rx="4" fill="#8d5524"/><path d="M383 88 v-12 h6" stroke="#3a3f46" stroke-width="2" fill="none"/></g>`),
    objG("icedripper", "cold brew tower", "tháp ủ cà phê nhỏ giọt", 215, 780, 52, `
      <rect class="hit" x="736" y="54" width="88" height="114"/>
      <rect x="752" y="64" width="56" height="98" rx="6" fill="url(#cfWood)" stroke="#6e4428" stroke-width="2"/>
      <circle cx="780" cy="84" r="14" fill="url(#cfGlass)" stroke="#7fb3d0"/><ellipse cx="780" cy="116" rx="11" ry="14" fill="#6e4428" stroke="#7fb3d0"/>
      <rect x="768" y="136" width="24" height="20" rx="3" fill="#4a2c18"/>`),
    objG("baristaliam", "head barista Liam", "trưởng quầy pha chế Liam", 295, 520, 134, `
      <rect class="hit" x="476" y="138" width="88" height="150"/>
      <g transform="translate(520,272) scale(1.65) translate(-442,-250)">
        <rect x="418" y="176" width="48" height="74" rx="14" fill="#2c3e50"/><rect x="426" y="194" width="32" height="56" rx="4" fill="#8a5a3a"/>
        <circle cx="442" cy="158" r="20" fill="#f0c49b"/><path d="M422 152 Q442 126 462 152 Q456 140 442 140 Q428 140 422 152z" fill="#3a2518"/>
        <circle cx="435" cy="160" r="2" fill="#2d2a26"/><circle cx="449" cy="160" r="2" fill="#2d2a26"/><path d="M436 168 Q442 173 448 168" stroke="#8a2f3c" stroke-width="2" fill="none"/>
      </g>`),
    objG("coffeegrinder", "coffee grinder", "máy xay hạt cà phê", 374, 240, 178, `
      <rect class="hit" x="204" y="182" width="72" height="98"/>
      <rect x="216" y="220" width="48" height="54" rx="5" fill="#3a3f46" stroke="#9aa6af"/>
      <polygon points="214,188 266,188 254,220 226,220" fill="url(#cfGlass)" stroke="#9aa6af"/>
      <ellipse cx="240" cy="206" rx="16" ry="8" fill="#6e4428"/>`),
    objG("knockbox", "espresso knock box", "hộp đập bã cà phê", 376, 304, 218, `
      <rect class="hit" x="278" y="224" width="52" height="56"/>
      <rect x="286" y="238" width="36" height="36" rx="4" fill="#2d2a26" stroke="#7f8c98" stroke-width="1.5"/>
      <line x1="286" y1="250" x2="322" y2="250" stroke="#e8743b" stroke-width="3.5"/>`),
    objG("espressomachine", "espresso machine", "máy pha cà phê espresso", 380, 405, 168, `
      <rect class="hit" x="334" y="172" width="142" height="106"/>
      <rect x="342" y="194" width="126" height="78" rx="8" fill="url(#cfChrome)" stroke="#9aa6af" stroke-width="2"/>
      <rect x="342" y="182" width="126" height="14" rx="4" fill="#e8743b"/>
      <g fill="#4b4f57"><rect x="362" y="228" width="26" height="8" rx="2"/><rect x="420" y="228" width="26" height="8" rx="2"/></g>
      <circle cx="405" cy="214" r="8" fill="#fff" stroke="#9aa6af"/>
      <g class="cf-brew" stroke="#8a5a3a" stroke-width="2.5"><path d="M375 236 V256 M433 236 V256"/></g>
      <g class="cf-steam" fill="#fff" opacity=".85"><ellipse cx="378" cy="168" rx="10" ry="5"/><ellipse cx="432" cy="164" rx="9" ry="5"/></g>`),
    objG("cupwarmer", "cup warmer tray", "khay ủ ấm tách sứ", 379, 405, 142, `
      <rect class="hit" x="344" y="146" width="122" height="36"/>
      <g fill="#fff8ec" stroke="#b9a892" stroke-width="1.2">
        <rect x="356" y="164" width="18" height="16" rx="3"/><rect x="378" y="164" width="18" height="16" rx="3"/>
        <rect x="400" y="164" width="18" height="16" rx="3"/><rect x="422" y="164" width="18" height="16" rx="3"/><rect x="444" y="164" width="16" height="16" rx="3"/>
      </g>`),
    objG("milksteamer", "steam wand & pitcher", "vòi đánh sữa và ca inox", 382, 504, 198, `
      <rect class="hit" x="478" y="204" width="54" height="72"/>
      <path d="M488 220 L482 254" stroke="#9aa6af" stroke-width="3" stroke-linecap="round"/>
      <path d="M490 236 H518 L514 270 H494 Z" fill="url(#cfChrome)" stroke="#7f8c98" stroke-width="1.5"/>
      <path d="M518 242 h7 v14 h-7" fill="none" stroke="#7f8c98" stroke-width="1.8"/>`),
    objG("pouroverbar", "pour-over dripper", "bộ pha cà phê thủ công", 383, 570, 194, `
      <rect class="hit" x="536" y="198" width="68" height="78"/>
      <polygon points="550,214 590,214 576,240 564,240" fill="#fff8ec" stroke="#c9a33a" stroke-width="1.5"/>
      <rect x="554" y="240" width="32" height="30" rx="5" fill="url(#cfGlass)" stroke="#7fb3d0"/>
      <rect x="556" y="252" width="28" height="16" rx="3" fill="#6e4428"/>`),
    objG("matchawhisk", "matcha whisk & bowl", "chổi tre đánh matcha", 384, 636, 204, `
      <rect class="hit" x="608" y="208" width="56" height="68"/>
      <path d="M614 246 Q636 274 658 246 Z" fill="#3a4e42" stroke="#1e2d24" stroke-width="1.5"/>
      <ellipse cx="636" cy="246" rx="22" ry="5" fill="#7fd07a"/>
      <path d="M632 218 L626 244 M636 218 V244 M640 218 L646 244" stroke="#d4a359" stroke-width="2"/>`),
    objG("blenderstation", "smoothie blender", "máy xay chống ồn", 385, 704, 186, `
      <rect class="hit" x="670" y="190" width="68" height="86"/>
      <rect x="678" y="196" width="52" height="74" rx="6" fill="url(#cfGlass)" stroke="#9aa6af" opacity=".85"/>
      <rect x="688" y="244" width="32" height="24" rx="3" fill="#3a3f46"/>
      <polygon points="686,206 722,206 716,244 692,244" fill="#ffca62" stroke="#d98a2b"/>`),
    objG("pickup", "pickup counter", "quầy nhận đồ", 388, 792, 196, `
      <rect class="hit" x="744" y="200" width="96" height="76"/>
      <rect x="748" y="262" width="88" height="10" rx="3" fill="#3a9d5d"/>
      <text x="792" y="216" font-size="9.5" font-weight="900" fill="#1e5631" text-anchor="middle">PICK-UP HERE</text>
      <g class="cf-ready"><rect x="780" y="228" width="22" height="32" rx="3" fill="#fff" stroke="#c9b9a0"/><rect x="780" y="238" width="22" height="9" fill="#e8743b"/></g>`),
    objG("cupstack", "cups & lids", "cốc và nắp", 389, 882, 196, `
      <rect class="hit" x="844" y="200" width="76" height="76"/>
      <g fill="#fff" stroke="#c9b9a0"><path d="M852 270 L856 218 H876 L880 270Z"/><path d="M852 230 H880"/><path d="M852 242 H880"/></g>
      <g fill="#4b4f57"><ellipse cx="900" cy="266" rx="13" ry="3.5"/><ellipse cx="900" cy="260" rx="13" ry="3.5"/><ellipse cx="900" cy="254" rx="13" ry="3.5"/></g>`),
    objG("carrierholder", "cardboard carriers", "khay giấy 4 ngăn", 390, 954, 204, `
      <rect class="hit" x="924" y="208" width="62" height="68"/>
      <polygon points="930,242 978,242 972,270 936,270" fill="#c99b68" stroke="#8a5a3a" stroke-width="1.5"/>
      <circle cx="944" cy="242" r="7" fill="#6e4428"/><circle cx="964" cy="242" r="7" fill="#6e4428"/>
      <text x="954" y="260" font-size="6.5" font-weight="900" fill="#fff8ec" text-anchor="middle">4-CUP</text>`),
    objG("condiments", "sugar & milk station", "quầy đường và sữa", 488, 310, 424, `
      <rect class="hit" x="230" y="428" width="160" height="114"/>
      <rect x="236" y="468" width="148" height="70" rx="5" fill="url(#cfWood)" stroke="#8a5a3a" stroke-width="2"/>
      <rect x="232" y="460" width="156" height="10" rx="3" fill="#6e4428"/>
      <rect x="256" y="432" width="24" height="28" rx="4" fill="#fff" stroke="#c9b9a0"/><text x="268" y="450" font-size="6.5" font-weight="900" fill="#5a3d1f" text-anchor="middle">MILK</text>
      <rect x="292" y="436" width="24" height="24" rx="4" fill="#fff8ec" stroke="#c9b9a0"/><text x="304" y="451" font-size="6" font-weight="900" fill="#5a3d1f" text-anchor="middle">SUGAR</text>
      <rect x="328" y="434" width="24" height="26" rx="4" fill="#f5a623" stroke="#b57212"/><text x="340" y="450" font-size="5.8" font-weight="900" fill="#fff" text-anchor="middle">HONEY</text>`),
    objG("oatmilkcarton", "plant milk pitcher", "bình sữa yến mạch", 489, 434, 426, `
      <rect class="hit" x="396" y="428" width="76" height="86"/>
      <rect x="414" y="440" width="40" height="58" rx="5" fill="#f4ead5" stroke="#8a5a3a" stroke-width="1.5"/>
      <rect x="414" y="456" width="40" height="18" fill="#3a9d5d"/>
      <text x="434" y="468" font-size="7.5" font-weight="900" fill="#fff" text-anchor="middle">OAT MILK</text>`),
    objG("cinnamonshaker", "cocoa & cinnamon shakers", "lọ rắc bột quế và ca cao", 490, 514, 426, `
      <rect class="hit" x="478" y="428" width="72" height="86"/>
      <rect x="488" y="450" width="22" height="44" rx="4" fill="#8d5524" stroke="#5a3218"/><ellipse cx="499" cy="450" rx="11" ry="4" fill="#d9e2e8"/>
      <rect x="518" y="450" width="22" height="44" rx="4" fill="#4e342e" stroke="#2d1b14"/><ellipse cx="529" cy="450" rx="11" ry="4" fill="#d9e2e8"/>`),
    objG("napkins", "napkins", "khăn giấy", 491, 590, 426, `
      <rect class="hit" x="556" y="428" width="68" height="86"/>
      <rect x="570" y="462" width="40" height="32" rx="3" fill="#c4cdd4" stroke="#7f8c98"/>
      <path d="M574 462 L590 442 L606 462 Z" fill="#fff" stroke="#d8d2c4"/>`),
    objG("straws", "straws", "ống hút", 492, 664, 426, `
      <rect class="hit" x="630" y="428" width="68" height="86"/>
      <g stroke-width="3" stroke-linecap="round"><line x1="654" y1="464" x2="648" y2="436" stroke="#e8743b"/><line x1="664" y1="464" x2="664" y2="434" stroke="#3a9d5d"/><line x1="674" y1="464" x2="680" y2="436" stroke="#3b6ec2"/></g>
      <rect x="648" y="462" width="32" height="34" rx="4" fill="#fff8ec" stroke="#c9b9a0"/>`),
    objG("waterdispenser", "filtered water station", "bình nước lọc miễn phí", 494, 756, 418, `
      <rect class="hit" x="708" y="418" width="96" height="114"/>
      <ellipse cx="756" cy="466" rx="28" ry="36" fill="url(#cfGlass)" stroke="#5c9ab0" stroke-width="2"/>
      <rect x="734" y="498" width="44" height="28" rx="4" fill="#8a5a3a"/>
      <circle cx="756" cy="488" r="4" fill="#3a9d5d"/>
      <text x="756" y="468" font-size="7.5" font-weight="900" fill="#1d4e60" text-anchor="middle">FREE WATER</text>`),
    objG("drinkfridge", "drinks fridge", "tủ nước", 520, 895, 404, `
      <rect class="hit" x="838" y="408" width="114" height="154"/>
      <rect x="844" y="414" width="102" height="142" rx="6" fill="#dfe5ea" stroke="#7f8c98" stroke-width="2"/>
      <rect x="844" y="414" width="102" height="16" rx="4" fill="#3a9d5d"/><text x="895" y="426" font-size="8.5" font-weight="900" fill="#fff" text-anchor="middle">BOTTLED DRINKS</text>
      <rect x="852" y="434" width="86" height="112" fill="url(#cfGlass)"/>
      <g class="cf-water"><rect x="860" y="446" width="14" height="28" rx="3" fill="#cfe9f7" stroke="#5c9ab0"/></g>
      <rect x="880" y="446" width="14" height="28" rx="3" fill="#cfe9f7" stroke="#5c9ab0"/>
      <g class="cf-juice"><rect x="860" y="486" width="16" height="28" rx="3" fill="#f5a623"/></g>
      <rect x="884" y="486" width="16" height="28" rx="3" fill="#7fd07a"/>`)
  ].join("\n");
  /* ---------- ZONE 3 SVG: cafe_seating (Indoor Seating & Lounge) ---------- */
  const seatingShell = `${cfDefs}
  <rect x="115" y="0" width="885" height="334" fill="url(#cfBrick)"/>
  <polygon points="0,0 115,0 115,334 0,640" fill="url(#cfLeft)"/>
  <polygon points="115,334 1000,334 1000,640 0,640" fill="url(#cfFloor)"/>
  ${D("floor-rug", `<ellipse cx="480" cy="495" rx="260" ry="86" fill="#9c4134" stroke="#f5d34a" stroke-width="3" opacity=".82"/><ellipse cx="480" cy="495" rx="220" ry="66" fill="none" stroke="#f6ead6" stroke-width="1.8" stroke-dasharray="6 4"/>`)}
  ${D("header-bar", `<rect x="115" y="0" width="885" height="32" fill="#4e2f1e"/><text x="550" y="21" font-size="13" font-weight="900" fill="#fff8ec" text-anchor="middle" letter-spacing="2.5">COZY FIRESIDE LOUNGE · INDOOR SEATING &amp; READING CORNER</text>`)}
  ${D("pendant-lamps", `<g><path d="M310 32 V62 M610 32 V62" stroke="#4e2f1e" stroke-width="2"/><g fill="#e8743b"><path d="M292 78 Q310 54 328 78Z"/><path d="M592 78 Q610 54 628 78Z"/></g><g fill="url(#cfLamp)" pointer-events="none"><ellipse cx="310" cy="135" rx="80" ry="60"/><ellipse cx="610" cy="135" rx="80" ry="60"/></g></g>`)}
  `;

  const seatingWorld = [
    objG("cafebooks", "bookshelf", "kệ sách", 220, 185, 52, `
      <rect class="hit" x="130" y="56" width="110" height="168"/>
      <rect x="134" y="60" width="102" height="160" rx="4" fill="url(#cfWood)" stroke="#6e4428" stroke-width="2"/>
      <g fill="#6e4428"><rect x="138" y="108" width="94" height="5"/><rect x="138" y="156" width="94" height="5"/><rect x="138" y="204" width="94" height="5"/></g>
      <g><rect class="cf-book1" x="144" y="76" width="11" height="32" fill="#3b6ec2"/><rect x="157" y="80" width="10" height="28" fill="#e8743b"/><rect x="169" y="74" width="12" height="34" fill="#3a9d5d"/>
      <rect x="146" y="124" width="12" height="32" fill="#c2453b"/><rect x="160" y="120" width="10" height="36" fill="#5b5f66"/><rect x="174" y="126" width="14" height="30" fill="#f5a623"/></g>`),
    objG("magazinerack", "magazine & art book rack", "kệ tạp chí nghệ thuật", 222, 292, 64, `
      <rect class="hit" x="246" y="68" width="92" height="154"/>
      <rect x="252" y="74" width="80" height="142" rx="4" fill="#a87048" stroke="#6e4428" stroke-width="2"/>
      <rect x="260" y="86" width="28" height="36" rx="2" fill="#fff8ec"/><rect x="294" y="86" width="28" height="36" rx="2" fill="#7fd0c8"/>
      <rect x="260" y="134" width="28" height="36" rx="2" fill="#f5d34a"/><rect x="294" y="134" width="28" height="36" rx="2" fill="#e8743b"/>`),
    objG("boardgameshelf", "board game shelf", "kệ cờ và trò chơi", 224, 396, 68, `
      <rect class="hit" x="348" y="72" width="96" height="148"/>
      <rect x="354" y="78" width="84" height="136" rx="4" fill="url(#cfWood)" stroke="#6e4428" stroke-width="2"/>
      <rect x="362" y="96" width="68" height="20" rx="3" fill="#3b6ec2"/><text x="396" y="109" font-size="7.5" font-weight="900" fill="#fff" text-anchor="middle">CHESS SET</text>
      <rect x="362" y="128" width="68" height="20" rx="3" fill="#e8743b"/><text x="396" y="141" font-size="7.5" font-weight="900" fill="#fff" text-anchor="middle">WORD CARDS</text>`),
    objG("wallart", "watercolor coffee prints", "tranh màu nước mùa cà phê", 210, 516, 48, `
      <rect class="hit" x="456" y="50" width="120" height="84"/>
      <rect x="462" y="54" width="52" height="72" rx="3" fill="#fff8ec" stroke="#6e4428" stroke-width="3"/>
      <circle cx="488" cy="84" r="14" fill="#c2453b" opacity=".8"/><path d="M474 106 Q488 90 502 106" stroke="#3a9d5d" stroke-width="3" fill="none"/>
      <rect x="522" y="54" width="52" height="72" rx="3" fill="#fff8ec" stroke="#6e4428" stroke-width="3"/>
      <path d="M532 104 L548 72 L564 104 Z" fill="#8d5524" opacity=".8"/>`),
    objG("fireplace", "cozy fireplace", "lò sưởi ấm áp", 336, 516, 152, `
      <rect class="hit" x="448" y="156" width="136" height="168"/>
      <rect x="454" y="166" width="124" height="154" rx="4" fill="#7d4e38" stroke="#4e2f1e" stroke-width="3"/>
      <rect x="446" y="158" width="140" height="14" rx="3" fill="#4e2f1e"/>
      <rect x="472" y="212" width="88" height="96" rx="6" fill="#241c18"/>
      <path d="M492 298 Q516 242 540 298 Z" fill="#ff7043"/><path d="M502 298 Q516 258 530 298 Z" fill="#ffd54f"/>`),
    objG("communityboard", "community bulletin board", "bảng tin cộng đồng", 225, 650, 56, `
      <rect class="hit" x="598" y="60" width="104" height="106"/>
      <rect x="604" y="66" width="92" height="94" rx="4" fill="#c9955c" stroke="#6e4428" stroke-width="3"/>
      <rect x="614" y="76" width="34" height="36" fill="#fff8ec"/><rect x="654" y="78" width="32" height="32" fill="#ffe082"/>
      <rect x="618" y="118" width="64" height="28" fill="#a8e6cf"/><text x="650" y="136" font-size="7" font-weight="900" fill="#1e5631" text-anchor="middle">BOOK CLUB</text>`),
    objG("vinylplayer", "vinyl turntable", "máy phát đĩa than", 340, 650, 198, `
      <rect class="hit" x="602" y="202" width="96" height="118"/>
      <rect x="612" y="244" width="76" height="72" rx="4" fill="url(#cfWood)" stroke="#6e4428" stroke-width="2"/>
      <rect x="616" y="220" width="68" height="24" rx="3" fill="#3a2f2a"/>
      <ellipse cx="648" cy="232" rx="22" ry="7" fill="#111" stroke="#f5d34a" stroke-width="1.5"/>`),
    objG("windowseat", "window seat", "chỗ ngồi cạnh cửa sổ", 360, 855, 44, `
      <rect class="hit" x="748" y="48" width="220" height="270"/>
      <rect x="756" y="54" width="204" height="180" rx="5" fill="url(#cfWood)"/><rect x="766" y="64" width="184" height="160" fill="url(#cfGlass)"/>
      <path d="M858 64 V224 M766 144 H950" stroke="url(#cfWood)" stroke-width="6"/>
      <rect x="758" y="246" width="200" height="32" rx="8" fill="#e8743b"/><rect x="758" y="276" width="200" height="36" fill="url(#cfDark)"/>
      <g class="cf-cupW"><rect x="838" y="224" width="16" height="20" rx="3" fill="#fff" stroke="#c9b9a0"/><rect x="838" y="232" width="16" height="6" fill="#e8743b"/></g>`),
    objG("windowbench", "cushioned window bench", "băng ghế đệm bên cửa sổ", 412, 855, 332, `
      <rect class="hit" x="756" y="336" width="200" height="74"/>
      <rect x="764" y="346" width="184" height="24" rx="6" fill="#f5d34a" stroke="#b5891c" stroke-width="1.5"/>
      <rect x="768" y="370" width="176" height="32" rx="4" fill="url(#cfWood)" stroke="#6e4428"/>`),
    objG("coatrack", "wooden coat rack", "cây treo áo khoác", 415, 76, 304, `
      <rect class="hit" x="42" y="308" width="68" height="156"/>
      <line x1="76" y1="320" x2="76" y2="456" stroke="#6e4428" stroke-width="6" stroke-linecap="round"/>
      <path d="M56 336 Q76 324 96 336 M60 354 Q76 344 92 354" stroke="#6e4428" stroke-width="4" fill="none"/>
      <ellipse cx="76" cy="456" rx="24" ry="7" fill="#4e2f1e"/>`),
    objG("umbrellastand", "umbrella stand", "giá để ô", 525, 76, 480, `
      <rect class="hit" x="44" y="484" width="64" height="96"/>
      <rect x="56" y="518" width="40" height="54" rx="5" fill="#4b4f57" stroke="#2d2a26" stroke-width="2"/>
      <path d="M66 518 L78 490" stroke="#e8743b" stroke-width="4" stroke-linecap="round"/>
      <g class="cf-myUmb"><path d="M78 518 L88 488" stroke="#3b6ec2" stroke-width="5" stroke-linecap="round"/></g>`),
    objG("floorlamp", "brass reading lamp", "đèn cây đọc sách", 435, 178, 308, `
      <rect class="hit" x="144" y="312" width="68" height="162"/>
      <line x1="178" y1="344" x2="178" y2="466" stroke="#c9a33a" stroke-width="4"/>
      <polygon points="154,346 202,346 192,318 164,318" fill="#fff3c4" stroke="#c9a33a" stroke-width="2"/>
      <ellipse cx="178" cy="466" rx="22" ry="6" fill="#8a6d1b"/>`),
    objG("velvetsofa", "velvet sofa", "ghế sofa nhung êm", 448, 308, 344, `
      <rect class="hit" x="216" y="348" width="184" height="106"/>
      <rect x="224" y="360" width="168" height="54" rx="14" fill="#1e6b52" stroke="#124434" stroke-width="2.5"/>
      <rect x="218" y="392" width="180" height="44" rx="10" fill="#278566" stroke="#124434" stroke-width="2"/>
      <rect x="242" y="372" width="28" height="24" rx="6" fill="#f5d34a"/><rect x="346" y="372" width="28" height="24" rx="6" fill="#e8743b"/>`),
    objG("bookwormmaya", "reader Maya", "bạn đọc sách Maya", 452, 294, 306, `
      <rect class="hit" x="256" y="310" width="76" height="118"/>
      <circle cx="294" cy="336" r="16" fill="#f4c7a1"/><path d="M278 332 Q294 310 310 332" fill="#3a2214"/>
      <rect x="276" y="352" width="36" height="46" rx="10" fill="#c2453b"/>
      <rect x="282" y="366" width="26" height="18" rx="2" fill="#fff8ec" stroke="#3b6ec2" stroke-width="1.5"/>`),
    objG("armchair", "tufted leather armchair", "ghế bành bọc da", 468, 646, 356, `
      <rect class="hit" x="592" y="360" width="108" height="108"/>
      <rect x="602" y="368" width="88" height="58" rx="14" fill="#b86b35" stroke="#7a421b" stroke-width="2.5"/>
      <rect x="596" y="404" width="100" height="48" rx="10" fill="#cf7f44" stroke="#7a421b" stroke-width="2"/>`),
    objG("cafetable", "café table", "bàn cà phê", 545, 456, 456, `
      <rect class="hit" x="358" y="460" width="196" height="114"/>
      <ellipse cx="456" cy="496" rx="76" ry="20" fill="url(#cfWood)" stroke="#6e4428" stroke-width="2"/>
      <rect x="450" y="514" width="12" height="48" fill="#4e2f1e"/><ellipse cx="456" cy="562" rx="34" ry="7" fill="#4e2f1e"/>
      <g class="cf-crumbs" fill="#b9772d"><circle cx="436" cy="494" r="2.2"/><circle cx="448" cy="499" r="1.8"/></g>
      <g class="cf-cupT"><rect x="466" y="474" width="16" height="20" rx="3" fill="#fff" stroke="#c9b9a0"/><rect x="466" y="482" width="16" height="6" fill="#e8743b"/></g>`),
    objG("coasterset", "cork coasters", "bộ đế lót ly bằng bần", 547, 412, 468, `
      <rect class="hit" x="388" y="472" width="48" height="36"/>
      <ellipse cx="412" cy="492" rx="14" ry="6" fill="#d49b62" stroke="#8a5a3a" stroke-width="1.5"/>
      <ellipse cx="416" cy="488" rx="14" ry="6" fill="#e0ab74" stroke="#8a5a3a" stroke-width="1.5"/>`),
    objG("tablevase", "dried lavender vase", "bình hoa oải hương khô", 548, 496, 452, `
      <rect class="hit" x="476" y="454" width="42" height="48"/>
      <path d="M490 482 h14 l3 16 h-20 z" fill="#fff8ec" stroke="#8a5a3a" stroke-width="1.5"/>
      <path d="M493 482 L488 462 M497 482 V460 M501 482 L506 462" stroke="#7e57c2" stroke-width="2.5" stroke-linecap="round"/>`),
    objG("regularsam", "regular customer Sam", "bác Sam khách quen", 542, 344, 444, `
      <rect class="hit" x="304" y="446" width="76" height="122"/>
      <circle cx="342" cy="474" r="17" fill="#f2c9a0"/><path d="M325 468 Q342 450 359 468" fill="#d9e2e8"/>
      <rect x="322" y="492" width="40" height="52" rx="10" fill="#3d5a80"/>
      <rect x="330" y="504" width="28" height="20" rx="2" fill="#fff" stroke="#7f8c98"/>`),
    objG("indoorplanter", "fiddle-leaf fig tree", "chậu cây bàng Singapore", 558, 742, 434, `
      <rect class="hit" x="704" y="438" width="76" height="142"/>
      <polygon points="722,528 762,528 756,574 728,574" fill="#d36b38" stroke="#8a421b" stroke-width="2"/>
      <ellipse cx="742" cy="484" rx="24" ry="34" fill="#3a9d5d"/><ellipse cx="726" cy="496" rx="16" ry="22" fill="#4aa958"/><ellipse cx="758" cy="496" rx="16" ry="22" fill="#2f7f4b"/>`),
    objG("busstation", "tray return rack", "kệ thu dọn khay và tách", 580, 836, 464, `
      <rect class="hit" x="790" y="468" width="92" height="136"/>
      <rect x="798" y="478" width="76" height="118" rx="4" fill="#5b5f66" stroke="#3a3f46" stroke-width="2"/>
      <rect x="804" y="508" width="64" height="8" fill="#c99b68"/><rect x="804" y="544" width="64" height="8" fill="#c99b68"/>
      <text x="836" y="494" font-size="7.5" font-weight="900" fill="#fff" text-anchor="middle">RETURN TRAYS</text>`),
    objG("recyclingbin", "recycling bin", "thùng rác tái chế", 612, 936, 474, `
      <rect class="hit" x="892" y="478" width="94" height="132"/>
      <path d="M898 506 H938 L934 602 H902Z" fill="#3b6ec2"/><path d="M944 506 H982 L978 602 H948Z" fill="#4b4f57"/>
      <text x="918" y="556" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">RECYCLE</text>
      <text x="963" y="556" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">TRASH</text>
      <g class="cf-cupBin"><rect x="910" y="488" width="14" height="16" rx="2" fill="#fff" stroke="#c9b9a0"/></g>`),
    objG("teatrolley", "herbal tea trolley", "xe đẩy trà thảo mộc", 548, 250, 448, `
      <rect class="hit" x="212" y="452" width="76" height="106"/>
      <rect x="220" y="474" width="60" height="8" rx="3" fill="url(#cfWood)" stroke="#6e4428" stroke-width="1.8"/>
      <rect x="220" y="514" width="60" height="8" rx="3" fill="url(#cfWood)" stroke="#6e4428" stroke-width="1.8"/>
      <line x1="226" y1="468" x2="226" y2="546" stroke="#5b5f66" stroke-width="3"/><line x1="274" y1="468" x2="274" y2="546" stroke="#5b5f66" stroke-width="3"/>
      <circle cx="226" cy="550" r="5" fill="#3a3f46"/><circle cx="274" cy="550" r="5" fill="#3a3f46"/>
      <rect x="230" y="456" width="14" height="18" rx="3" fill="#ffd54f" stroke="#b87333" stroke-width="1.5"/>
      <rect x="250" y="458" width="16" height="16" rx="3" fill="#aed581" stroke="#558b2f" stroke-width="1.5"/>`),
    objG("footstool", "knitted ottoman", "ghế đôn gác chân", 566, 616, 514, `
      <rect class="hit" x="582" y="518" width="68" height="58"/>
      <ellipse cx="616" cy="542" rx="28" ry="16" fill="#d9a066" stroke="#8a5a36" stroke-width="2"/>
      <path d="M594 540 Q616 530 638 540 M594 546 Q616 556 638 546" stroke="#fff3e0" stroke-width="1.5" fill="none" opacity=".75"/>
      <line x1="600" y1="556" x2="596" y2="570" stroke="#5a3820" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="632" y1="556" x2="636" y2="570" stroke="#5a3820" stroke-width="3.5" stroke-linecap="round"/>`)
  ].join("\n");

  /* ---------- ZONE 4 SVG: cafe_terrace (Terrace & Work Corner) ---------- */
  const terraceShell = `${cfDefs}
  <rect x="115" y="0" width="885" height="220" fill="url(#cfSky)"/>
  <g fill="#b8d4e8" opacity=".65"><rect x="160" y="128" width="64" height="92"/><rect x="236" y="104" width="82" height="116"/><rect x="334" y="138" width="70" height="82"/><rect x="740" y="112" width="88" height="108"/><rect x="844" y="132" width="76" height="88"/></g>
  <rect x="115" y="220" width="885" height="114" fill="#d9e8d2" stroke="#8aa882" stroke-width="2"/>
  <polygon points="0,0 115,0 115,334 0,640" fill="url(#cfLeft)"/>
  <polygon points="115,334 1000,334 1000,640 0,640" fill="url(#cfDeck)"/>
  ${D("deck-planks", `<g stroke="#9a6b3b" stroke-width="1.4" opacity=".6"><path d="M90 390 H1000 M62 450 H1000 M34 514 H1000 M8 580 H1000"/><path d="M260 334 L210 640 M500 334 L500 640 M740 334 L790 640"/></g>`)}
  ${D("header-bar", `<rect x="115" y="0" width="885" height="32" fill="#1f3a36"/><text x="550" y="21" font-size="13" font-weight="900" fill="#fff8ec" text-anchor="middle" letter-spacing="2.5">ROOFTOP TERRACE &amp; CO-WORKING LOUNGE · HIGH-SPEED WI-FI</text>`)}
  `;

  const terraceWorld = [
    objG("stringlights", "warm bistro string lights", "giàn đèn dây vàng ấm", 190, 540, 42, `
      <rect class="hit" x="160" y="34" width="760" height="48"/>
      <path d="M170 44 Q360 76 550 44 Q740 76 920 44" stroke="#3a2f2a" stroke-width="2.5" fill="none"/>
      <g fill="#ffe066" stroke="#e8832a" stroke-width="1.2">
        <circle cx="230" cy="56" r="6"/><circle cx="330" cy="64" r="6"/><circle cx="430" cy="58" r="6"/><circle cx="550" cy="46" r="6"/>
        <circle cx="660" cy="58" r="6"/><circle cx="760" cy="64" r="6"/><circle cx="860" cy="54" r="6"/>
      </g>`),
    objG("cityviewrail", "rooftop glass railing", "lan can kính ngắm phố", 240, 490, 158, `
      <rect class="hit" x="150" y="162" width="680" height="72"/>
      <rect x="156" y="172" width="668" height="54" fill="url(#cfGlass)" stroke="#5c7688" stroke-width="2.5" opacity=".78"/>
      <line x1="152" y1="170" x2="828" y2="170" stroke="#3a3f46" stroke-width="5"/>`),
    objG("bambooplanter", "olive & bamboo planters", "hàng chậu trúc & ô-liu", 268, 224, 198, `
      <rect class="hit" x="148" y="202" width="152" height="122"/>
      <rect x="158" y="274" width="132" height="44" rx="5" fill="#c56a3a" stroke="#7d3c1b" stroke-width="2"/>
      <g fill="#3a9d5d"><ellipse cx="186" cy="242" rx="18" ry="32"/><ellipse cx="224" cy="236" rx="20" ry="36"/><ellipse cx="262" cy="242" rx="18" ry="32"/></g>`),
    objG("wifisign", "Wi-Fi sign", "biển Wi-Fi", 265, 68, 126, `
      <rect class="hit" x="24" y="130" width="84" height="86"/>
      <rect x="30" y="136" width="72" height="74" rx="8" fill="#fff8ec" stroke="#e8743b" stroke-width="3"/>
      <path d="M50 166 Q66 152 82 166 M56 174 Q66 164 76 174" stroke="#e8743b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle cx="66" cy="181" r="3.5" fill="#e8743b"/><text x="66" y="196" font-size="8.5" font-weight="900" fill="#5a3d1f" text-anchor="middle">FREE Wi-Fi</text>
      <text class="cf-pass" x="66" y="206" font-size="8.5" font-weight="900" fill="#3a9d5d" text-anchor="middle">COFFEE123</text>`),
    objG("meshrouter", "5GHz Wi-Fi router", "bộ phát Wi-Fi tốc độ cao", 268, 68, 224, `
      <rect class="hit" x="26" y="228" width="82" height="68"/>
      <rect x="38" y="254" width="58" height="28" rx="5" fill="#fff" stroke="#7f8c98" stroke-width="2"/>
      <line x1="48" y1="254" x2="44" y2="234" stroke="#3a3f46" stroke-width="3"/><line x1="86" y1="254" x2="90" y2="234" stroke="#3a3f46" stroke-width="3"/>
      <circle cx="54" cy="268" r="3" fill="#2ecc71"/><circle cx="66" cy="268" r="3" fill="#2ecc71"/>`),
    objG("whiteboard", "focus-sprint whiteboard", "bảng trắng mục tiêu học tập", 272, 895, 86, `
      <rect class="hit" x="824" y="90" width="146" height="114"/>
      <rect x="830" y="96" width="134" height="102" rx="5" fill="#fff" stroke="#5b5f66" stroke-width="3"/>
      <text x="897" y="116" font-size="9" font-weight="900" fill="#1f3a36" text-anchor="middle">FOCUS SPRINTS 🍅</text>
      <text x="897" y="136" font-size="8" font-weight="700" fill="#3b6ec2" text-anchor="middle">✓ 25m Study · 5m Tea</text>
      <text x="897" y="154" font-size="8" font-weight="700" fill="#e8743b" text-anchor="middle">✓ Chapter 4 Vocab</text>`),
    objG("printerstation", "wireless printer station", "quầy máy in không dây", 340, 895, 220, `
      <rect class="hit" x="832" y="224" width="132" height="108"/>
      <rect x="844" y="264" width="108" height="64" rx="4" fill="url(#cfWood)" stroke="#6e4428" stroke-width="2"/>
      <rect x="858" y="236" width="80" height="32" rx="4" fill="#dfe5ea" stroke="#5b5f66" stroke-width="2"/>
      <rect x="874" y="226" width="48" height="14" fill="#fff" stroke="#9aa6af"/>`),
    objG("patioheater", "radiant patio heater", "cột đèn sưởi sân thượng", 410, 344, 214, `
      <rect class="hit" x="308" y="216" width="72" height="184"/>
      <polygon points="312,238 376,238 358,220 330,220" fill="#d98a2b" stroke="#8a421b" stroke-width="2"/>
      <rect x="336" y="238" width="16" height="14" fill="#ff7043"/>
      <line x1="344" y1="252" x2="344" y2="388" stroke="#5b5f66" stroke-width="6"/>
      <ellipse cx="344" cy="390" rx="26" ry="7" fill="#3a3f46"/>`),
    objG("patioumbrella", "canvas patio umbrella", "dù vải che nắng sân thượng", 420, 560, 206, `
      <rect class="hit" x="420" y="208" width="280" height="120"/>
      <path d="M428 296 Q560 212 692 296 Z" fill="#fff8ec" stroke="#d4a359" stroke-width="3"/>
      <path d="M472 296 Q560 224 560 264 M648 296 Q560 224 560 264" stroke="#e8743b" stroke-width="3" fill="none"/>
      <line x1="560" y1="296" x2="560" y2="480" stroke="#6e4428" stroke-width="6"/>`),
    objG("terrace", "terrace table", "bàn sân thượng", 525, 560, 444, `
      <rect class="hit" x="468" y="448" width="184" height="122"/>
      <ellipse cx="560" cy="492" rx="78" ry="20" fill="#fff8ec" stroke="#bfa888" stroke-width="2.5"/>
      <rect x="554" y="512" width="12" height="48" fill="#5b5f66"/><ellipse cx="560" cy="560" rx="34" ry="7" fill="#3a3f46"/>
      <g class="cf-cupTr"><rect x="536" y="472" width="16" height="20" rx="3" fill="#fff" stroke="#c9b9a0"/><rect x="536" y="480" width="16" height="6" fill="#e8743b"/></g>`),
    objG("succulentpot", "rosemary & succulent pot", "chậu sen đá & hương thảo", 528, 592, 456, `
      <rect class="hit" x="568" y="458" width="48" height="44"/>
      <polygon points="580,480 604,480 600,496 584,496" fill="#d36b38"/>
      <circle cx="592" cy="472" r="10" fill="#3a9d5d"/>`),
    objG("remotesophie", "remote worker Sophie", "bạn làm việc từ xa Sophie", 522, 658, 434, `
      <rect class="hit" x="620" y="438" width="76" height="124"/>
      <circle cx="658" cy="466" r="16" fill="#f4c7a1"/><path d="M642 462 Q658 440 674 462" fill="#6e4428"/>
      <rect x="640" y="482" width="36" height="50" rx="10" fill="#3a9d5d"/>
      <rect x="626" y="492" width="26" height="18" rx="2" fill="#5b5f66"/>`),
    objG("chargebar", "charging work bar", "quầy dài làm việc & sạc điện", 495, 240, 412, `
      <rect class="hit" x="126" y="418" width="280" height="136"/>
      <rect x="132" y="454" width="268" height="16" rx="4" fill="url(#cfWood)" stroke="#6e4428" stroke-width="2"/>
      <rect x="144" y="470" width="10" height="76" fill="#4e2f1e"/><rect x="376" y="470" width="10" height="76" fill="#4e2f1e"/>
      <text x="266" y="465" font-size="8.5" font-weight="900" fill="#fff8ec" text-anchor="middle">⚡ CO-WORKING &amp; CHARGING BAR</text>
      <g class="cf-phoneCh"><rect x="190" y="436" width="12" height="18" rx="2" fill="#2d2a26"/></g>`),
    objG("powerstrip", "USB-C power strip", "ổ điện chia cổng & USB-C", 498, 168, 418, `
      <rect class="hit" x="134" y="422" width="68" height="36"/>
      <rect x="142" y="436" width="52" height="14" rx="3" fill="#fff" stroke="#7f8c98" stroke-width="1.5"/>
      <g fill="#3a3f46"><rect x="148" y="440" width="6" height="6"/><rect x="160" y="440" width="6" height="6"/><rect x="172" y="440" width="6" height="6"/></g>
      <circle cx="186" cy="443" r="2.5" fill="#e8743b"/>`),
    objG("laptopstand", "ergonomic laptop stand", "giá đỡ laptop chống mỏi", 500, 236, 404, `
      <rect class="hit" x="204" y="408" width="64" height="48"/>
      <polygon points="214,452 258,452 248,434 224,434" fill="#b8c4ce" stroke="#5b5f66" stroke-width="1.5"/>
      <rect x="216" y="414" width="40" height="24" rx="2" fill="#3a3f46"/><rect x="219" y="417" width="34" height="18" fill="#9fd3f0"/>`),
    objG("headphones", "noise-canceling headphones", "tai nghe chống ồn", 501, 298, 412, `
      <rect class="hit" x="272" y="416" width="52" height="42"/>
      <path d="M284 444 Q298 420 312 444" stroke="#2d2a26" stroke-width="4" fill="none"/>
      <ellipse cx="284" cy="444" rx="5" ry="8" fill="#e8743b"/><ellipse cx="312" cy="444" rx="5" ry="8" fill="#e8743b"/>`),
    objG("notebookpen", "study notebook & pen", "sổ tay học tập & bút", 502, 348, 416, `
      <rect class="hit" x="324" y="420" width="48" height="38"/>
      <rect x="330" y="432" width="28" height="20" rx="2" fill="#fff8ec" stroke="#3b6ec2" stroke-width="1.5"/>
      <line x1="362" y1="430" x2="356" y2="450" stroke="#e8743b" stroke-width="3" stroke-linecap="round"/>`),
    objG("desklamp", "LED eye-care desk lamp", "đèn bàn học chống cận", 503, 388, 396, `
      <rect class="hit" x="364" y="398" width="48" height="58"/>
      <path d="M388 452 V414 L368 410" stroke="#4b4f57" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="388" cy="452" rx="12" ry="4" fill="#4b4f57"/><circle cx="368" cy="412" r="5" fill="#ffe066"/>`),
    objG("watercarafe", "lemon-mint water carafe", "bình nước chanh bạc hà", 504, 760, 424, `
      <rect class="hit" x="726" y="428" width="68" height="78"/>
      <path d="M748 444 h24 l6 46 h-36 z" fill="url(#cfGlass)" stroke="#5c9ab0" stroke-width="1.8"/>
      <circle cx="758" cy="474" r="6" fill="#ffd54f"/><circle cx="766" cy="466" r="4" fill="#3a9d5d"/>`),
    objG("quietzonesign", "coworking etiquette sign", "biển quy tắc góc làm việc", 505, 838, 428, `
      <rect class="hit" x="802" y="432" width="72" height="68"/>
      <rect x="808" y="440" width="60" height="50" rx="4" fill="#fff8ec" stroke="#1f3a36" stroke-width="2"/>
      <text x="838" y="458" font-size="7.5" font-weight="900" fill="#1f3a36" text-anchor="middle">QUIET ZONE</text>
      <text x="838" y="474" font-size="6.8" font-weight="700" fill="#e8743b" text-anchor="middle">🎧 Use Earphones</text>`),
    objG("ergostool", "padded ergonomic stool", "ghế đẩu công thái học", 548, 224, 496, `
      <rect class="hit" x="188" y="492" width="72" height="84"/>
      <ellipse cx="224" cy="508" rx="24" ry="8" fill="#e8743b" stroke="#8a421b" stroke-width="2"/>
      <line x1="212" y1="516" x2="204" y2="568" stroke="#4b4f57" stroke-width="4"/><line x1="236" y1="516" x2="244" y2="568" stroke="#4b4f57" stroke-width="4"/>
      <ellipse cx="224" cy="544" rx="20" ry="5" fill="none" stroke="#4b4f57" stroke-width="3"/>`),
    objG("coworkeralex", "UI designer Alex", "nhà thiết kế Alex", 546, 326, 482, `
      <rect class="hit" x="288" y="476" width="76" height="106"/>
      <circle cx="326" cy="500" r="16" fill="#f0c49b"/><path d="M310 496 Q326 476 342 496" fill="#2d2a26"/>
      <rect x="308" y="516" width="36" height="48" rx="10" fill="#3b6ec2"/>`)
  ].join("\n");

  /* ---------- Build Zone Objects & Zone Actions ---------- */
  function buildZoneObjects(baseSet, extraObjs, zoneActionsList) {
    const out = {};
    for (const oid of baseSet) {
      if (allObjects[oid]) {
        out[oid] = Object.assign({}, allObjects[oid], { acts: (allObjects[oid].acts || []).slice() });
      }
    }
    for (const [oid, o] of Object.entries(extraObjs)) {
      out[oid] = Object.assign({}, o, { acts: (o.acts || []).slice() });
    }
    for (const a of zoneActionsList) {
      if (out[a.obj] && !out[a.obj].acts.includes(a.id)) {
        out[a.obj].acts.push(a.id);
      }
    }
    return out;
  }

  const counterActions = [...allActions.filter(a => COUNTER_OBJS.has(a.obj)), ...COUNTER_NEW_ACTIONS];
  const barActions     = [...allActions.filter(a => BAR_OBJS.has(a.obj)),     ...BAR_NEW_ACTIONS];
  const seatingActions = [...allActions.filter(a => SEATING_OBJS.has(a.obj)), ...SEATING_NEW_ACTIONS];
  const terraceActions = [...allActions.filter(a => TERRACE_OBJS.has(a.obj)), ...TERRACE_NEW_ACTIONS];

  const counterObjects = buildZoneObjects(COUNTER_OBJS, COUNTER_NEW_OBJS, counterActions);
  const barObjects     = buildZoneObjects(BAR_OBJS,     BAR_NEW_OBJS,     barActions);
  const seatingObjects = buildZoneObjects(SEATING_OBJS, SEATING_NEW_OBJS, seatingActions);
  const terraceObjects = buildZoneObjects(TERRACE_OBJS, TERRACE_NEW_OBJS, terraceActions);

  // Shared spots across all 4 zones so any helper action or mission step has valid coordinates
  const SHARED_SPOTS = {
    cf_door:    { x: 108, y: 540, d: 1 },
    cf_umb:     { x: 112, y: 575, d: -1 },
    cf_queue:   { x: 340, y: 495, d: 1 },
    cf_fridge:  { x: 875, y: 535, d: 1 },
    cf_books:   { x: 185, y: 405, d: -1 },
    cf_sofa:    { x: 305, y: 455, d: 1 },
    cf_station: { x: 310, y: 515, d: -1 },
    cf_tipspot: { x: 520, y: 410, d: 1 },
    cf_register:{ x: 350, y: 410, d: 1 },
    cf_pastry:  { x: 645, y: 410, d: 1 },
    cf_counter: { x: 450, y: 415, d: 1 },
    cf_menu:    { x: 480, y: 405, d: 1 },
    cf_pickup:  { x: 785, y: 410, d: 1 },
    cf_cups:    { x: 875, y: 410, d: 1 },
    cf_table:   { x: 455, y: 535, d: 1 },
    cf_terrace: { x: 555, y: 545, d: 1 },
    cf_charge:  { x: 250, y: 525, d: 1 },
    cf_wifi:    { x: 145, y: 435, d: -1 },
    cf_window:  { x: 845, y: 430, d: 1 },
    cf_bin:     { x: 915, y: 590, d: 1 },
    cf_trash:   { x: 845, y: 585, d: 1 }
  };

  const cafe_counter = {
    id: "cafe_counter", topic: "cafe", icon: "☕", zoneOrder: 1,
    name: "Order & Payment Counter", nameVi: "Quầy order & thanh toán",
    names: ["Order & Payment Counter", "Quầy order & thanh toán"],
    go: {
      label: "Head to the order counter",
      labelVi: "Qua quầy gọi món & thanh toán",
      sentence: "I'm heading to the counter to order a warm drink and pay.",
      vi: "Mình đang đi ra quầy để gọi đồ uống ấm và thanh toán.",
      key: ["heading", "counter", "order"],
      chunks: ["I'm heading to the counter", "to order a warm drink and pay."],
      grammar: "<b>head to the counter</b> = đi về phía quầy gọi món.",
      patterns: ["I'm heading to <b>the order counter</b>.", "Let's go to <b>the pastry counter</b>."],
      vocab: [["counter", "/ˈkaʊn.tər/", "quầy gọi món"], ["order", "/ˈɔː.dər/", "gọi món"]],
      story: ["head to the order counter", "walk to the café order counter", "qua quầy gọi món & thanh toán"]
    },
    shellSvg: counterShell, worldSvg: counterWorld, W0: CF_W0,
    spots: Object.assign({}, SHARED_SPOTS), obstacles: [],
    entry: { x: 140, y: 520, d: 1 },
    objects: counterObjects, actions: counterActions, props: CF_PROPS,
    applyState(W, root) { mirrorState(W, CF_W0, root); },
    css: cafeCss, catalog: cafeCatalog
  };

  const cafe_bar = {
    id: "cafe_bar", topic: "cafe", icon: "🧋", zoneOrder: 2,
    name: "Espresso Bar & Pickup", nameVi: "Quầy pha chế & lấy đồ",
    names: ["Espresso Bar & Pickup", "Quầy pha chế & lấy đồ"],
    go: {
      label: "Step over to the espresso & pickup bar",
      labelVi: "Qua quầy pha chế & nhận đồ",
      sentence: "I'm stepping over to the espresso bar to pick up my drink.",
      vi: "Mình đang bước sang quầy pha chế để nhận đồ uống.",
      key: ["espresso bar", "pick up", "drink"],
      chunks: ["I'm stepping over to the espresso bar", "to pick up my drink."],
      grammar: "<b>step over to …</b> = bước sang khu vực kế bên.",
      patterns: ["I'm stepping over to <b>the pickup counter</b>.", "Wait by <b>the espresso bar</b>."],
      vocab: [["pickup counter", "/ˈpɪk.ʌp ˌkaʊn.tər/", "quầy nhận đồ"], ["pick up", "/pɪk ʌp/", "lấy, nhận"]],
      story: ["step over to the espresso bar", "walk to the pickup counter", "qua quầy pha chế & lấy đồ"]
    },
    shellSvg: barShell, worldSvg: barWorld, W0: CF_W0,
    spots: Object.assign({}, SHARED_SPOTS), obstacles: [],
    entry: { x: 160, y: 515, d: 1 },
    objects: barObjects, actions: barActions, props: CF_PROPS,
    applyState(W, root) { mirrorState(W, CF_W0, root); },
    css: cafeCss, catalog: cafeCatalog
  };

  const cafe_seating = {
    id: "cafe_seating", topic: "cafe", icon: "🛋️", zoneOrder: 3,
    name: "Indoor Seating & Lounge", nameVi: "Khu ngồi trong nhà",
    names: ["Indoor Seating & Lounge", "Khu ngồi trong nhà"],
    go: {
      label: "Walk into the indoor seating lounge",
      labelVi: "Vào khu ghế ngồi trong nhà",
      sentence: "I'm walking into the cozy indoor lounge to find a comfortable seat.",
      vi: "Mình đang đi vào khu phòng khách ấm cúng trong nhà để tìm một chỗ ngồi thoải mái.",
      key: ["indoor", "lounge", "seat"],
      chunks: ["I'm walking into the cozy indoor lounge", "to find a comfortable seat."],
      grammar: "<b>find a comfortable seat</b> = tìm một chỗ ngồi êm ái, thoải mái.",
      patterns: ["Let's sit in <b>the indoor lounge</b>.", "There's a free table by <b>the fireplace</b>."],
      vocab: [["cozy", "/ˈkoʊ.zi/", "ấm cúng"], ["seat", "/siːt/", "chỗ ngồi"]],
      story: ["walk into the indoor seating lounge", "find a seat in the indoor lounge", "vào khu ngồi trong nhà"]
    },
    shellSvg: seatingShell, worldSvg: seatingWorld, W0: CF_W0,
    spots: Object.assign({}, SHARED_SPOTS), obstacles: [],
    entry: { x: 145, y: 525, d: 1 },
    objects: seatingObjects, actions: seatingActions, props: CF_PROPS,
    applyState(W, root) { mirrorState(W, CF_W0, root); },
    css: cafeCss, catalog: cafeCatalog
  };

  const cafe_terrace = {
    id: "cafe_terrace", topic: "cafe", icon: "💻", zoneOrder: 4,
    name: "Terrace & Work Corner", nameVi: "Sân thượng & góc làm việc",
    names: ["Terrace & Work Corner", "Sân thượng & góc làm việc"],
    go: {
      label: "Go out to the terrace & work corner",
      labelVi: "Ra sân thượng & góc làm việc",
      sentence: "I'm going out to the rooftop terrace to plug in my laptop and study.",
      vi: "Mình đang đi ra khu sân thượng để cắm sạc máy tính và ngồi học.",
      key: ["terrace", "laptop", "study"],
      chunks: ["I'm going out to the rooftop terrace", "to plug in my laptop and study."],
      grammar: "<b>go out to the terrace</b> = đi ra ngoài khoảng sân thượng thoáng đãng.",
      patterns: ["Let's study at <b>the work corner</b>.", "The Wi-Fi is fast on <b>the terrace</b>."],
      vocab: [["terrace", "/ˈter.əs/", "sân thượng, sân hiên"], ["laptop", "/ˈlæp.tɑp/", "máy tính xách tay"]],
      story: ["go out to the terrace & work corner", "head to the rooftop work corner", "ra sân thượng & góc làm việc"]
    },
    shellSvg: terraceShell, worldSvg: terraceWorld, W0: CF_W0,
    spots: Object.assign({}, SHARED_SPOTS), obstacles: [],
    entry: { x: 145, y: 525, d: 1 },
    objects: terraceObjects, actions: terraceActions, props: CF_PROPS,
    applyState(W, root) { mirrorState(W, CF_W0, root); },
    css: cafeCss, catalog: cafeCatalog
  };

  /* ---------- Register All 4 Cafe Zones & Export ELW_CAFE ---------- */
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("elw_world_v1");
      if (raw && raw.indexOf('"cafe"') !== -1) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.room === "cafe") {
          parsed.room = "cafe_counter";
          localStorage.setItem("elw_world_v1", JSON.stringify(parsed));
        }
      }
    } catch (e) {}

    const existing = window.ELW_ROOMS || {};
    delete existing.cafe;
    window.ELW_ROOMS = Object.assign(existing, {
      cafe_counter,
      cafe_bar,
      cafe_seating,
      cafe_terrace
    });

    window.ELW_CAFE = {
      topic: "cafe",
      rooms: ["cafe_counter", "cafe_bar", "cafe_seating", "cafe_terrace"],
      zones: { cafe_counter, cafe_bar, cafe_seating, cafe_terrace },
      missions: MISSIONS,
      challenges: CHALLENGES,
      npcs: NPCS,
      reply,
      catalog: cafeCatalog
    };

    const _origStrReplace = String.prototype.replace;
    if (!_origStrReplace._elwCafeSeatingGuard) {
      const wrappedReplace = function (pat, rep) {
        if (this == "Khu ngồi trong nhà" && pat && pat.source === "^Phòng |^Nhà |^Khu ") {
          return "Khu ngồi trong nhà";
        }
        return _origStrReplace.call(this, pat, rep);
      };
      wrappedReplace._elwCafeSeatingGuard = true;
      String.prototype.replace = wrappedReplace;
    }

    const fixLifeCafeMissions = (lifeObj) => {
      if (lifeObj && Array.isArray(lifeObj.missions)) {
        lifeObj.missions.forEach(m => {
          if (m && m.room === "cafe") m.room = "cafe_counter";
          if (m && m.room === "market") m.room = "market_entrance";
        });
      }
    };
    if (window.ELW_LIFE) {
      fixLifeCafeMissions(window.ELW_LIFE);
    } else {
      const prevDesc = Object.getOwnPropertyDescriptor(window, "ELW_LIFE");
      let _elwLife = window.ELW_LIFE;
      try {
        Object.defineProperty(window, "ELW_LIFE", {
          configurable: true,
          enumerable: true,
          get() { return prevDesc && prevDesc.get ? prevDesc.get() : _elwLife; },
          set(val) {
            _elwLife = val;
            if (prevDesc && prevDesc.set) prevDesc.set(val);
            fixLifeCafeMissions(val);
          }
        });
      } catch (e) {}
    }
  }
})();
