/* English Life World — Missions pack (10 daily-life missions for ELW_MISSION.register)
 * Every step.done(W) checks real WorldState keys; every step.next(W) returns the next action
 * whose pre() passes in that state. result(log) is built from the action ids that really ran.
 */
(function (root) {
  "use strict";
  var has = function (arr, x) { return Array.isArray(arr) && arr.indexOf(x) >= 0; };
  function ids(log) { return (log || []).map(function (x) { return x.id; }); }
  // Build the result sentence from what really happened: parts = [[actionId, en, vi], ...]
  function story(log, headEn, headVi, parts, thanksEn, thanksVi) {
    var did = ids(log), en = [], vi = [];
    parts.forEach(function (p) { if (did.indexOf(p[0]) >= 0) { en.push(p[1]); vi.push(p[2]); } });
    var join = function (a, and) { return a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " " + and + " " + a[a.length - 1]; };
    return {
      en: headEn + (en.length ? " I " + join(en, "and") + "." : ""),
      vi: headVi + (vi.length ? " Con đã " + join(vi, "và") + "." : ""),
      mom_en: thanksEn, mom_vi: thanksVi
    };
  }
  var G = {
    mom: { id: "mom", name: "Mom", avatar: "👩", voice: "adult_female" },
    dad: { id: "dad", name: "Dad", avatar: "👨", voice: "adult_male" },
    grandpa: { id: "grandpa", name: "Grandpa", avatar: "👴", voice: "elderly" },
    grandma: { id: "grandma", name: "Grandma", avatar: "👵", voice: "elderly" },
    tom: { id: "tom", name: "Tom", avatar: "👦", voice: "young_male" },
    lily: { id: "lily", name: "Lily", avatar: "👧", voice: "child" }
  };

  var PACK = [
    {
      id: "feed_the_cat", title_en: "Feed the cat", title_vi: "Cho mèo ăn",
      desc_vi: "Lily nhờ bạn chăm sóc chú mèo: cho ăn, cho uống và chơi với mèo.",
      giver: G.lily, room: "living", urgency: "high",
      request: { en: "The cat is hungry! Can you feed her, please?", vi: "Mèo đói rồi! Anh/chị cho mèo ăn giúp em nhé?" },
      steps: [
        { n: 1, icon: "🐟", title_en: "Feed the cat", title_vi: "Cho mèo ăn",
          say_en: "Feed the cat.", say_vi: "Cho mèo ăn.", actions: ["feed_cat"],
          done: function (W) { return W.catBowl === "full"; },
          next: function () { return "feed_cat"; },
          hint: { en: "Fill the cat's food bowl.", vi: "Đổ đầy bát thức ăn của mèo." } },
        { n: 2, icon: "💧", title_en: "Give her water", title_vi: "Cho mèo uống nước",
          say_en: "Give the cat some water.", say_vi: "Cho mèo uống nước.", actions: ["give_cat_water"],
          done: function (W) { return W.catWater === "full"; },
          next: function () { return "give_cat_water"; },
          hint: { en: "Fill the water bowl too.", vi: "Đổ đầy cả bát nước nữa." } },
        { n: 3, icon: "🧶", title_en: "Play with the cat", title_vi: "Chơi với mèo",
          say_en: "Play with the cat.", say_vi: "Chơi với mèo.", actions: ["play_with_cat"],
          done: function (W) { return W.cat === "playing" || W.catAt === "rug"; },
          next: function () { return "play_with_cat"; },
          hint: { en: "Use the toy wand to play with her.", vi: "Dùng cần câu đồ chơi để chơi với mèo." } }
      ],
      result: function (log) {
        return story(log, "The cat is happy!", "Mèo vui lắm!",
          [["feed_cat", "fed the cat", "cho mèo ăn"], ["give_cat_water", "gave her water", "cho mèo uống nước"], ["play_with_cat", "played with her", "chơi với mèo"]],
          "Yay! Thank you! She loves you!", "Hoan hô! Cảm ơn nhé! Mèo thích anh/chị lắm!");
      }
    },
    {
      id: "coffee_for_dad", title_en: "Make coffee for Dad", title_vi: "Pha cà phê cho bố",
      desc_vi: "Bố muốn một cốc cà phê và bánh mì nướng trước khi đi làm.",
      giver: G.dad, room: "kitchen", urgency: "medium",
      request: { en: "Could you make me a cup of coffee, please?", vi: "Con pha cho bố một cốc cà phê nhé?" },
      steps: [
        { n: 1, icon: "☕", title_en: "Make coffee", title_vi: "Pha cà phê",
          say_en: "Make some coffee.", say_vi: "Pha cà phê.", actions: ["make_coffee"],
          done: function (W) { return W.k_coffee === "ready" || W.k_mug === "coffee"; },
          next: function () { return "make_coffee"; },
          hint: { en: "Turn on the coffee maker.", vi: "Bật máy pha cà phê." } },
        { n: 2, icon: "🫗", title_en: "Pour it into a mug", title_vi: "Rót ra cốc",
          say_en: "Pour the coffee into a mug.", say_vi: "Rót cà phê ra cốc.", actions: ["pour_coffee"],
          done: function (W) { return W.k_mug === "coffee"; },
          next: function () { return "pour_coffee"; },
          hint: { en: "The coffee is ready. Pour it into a mug.", vi: "Cà phê xong rồi. Rót ra cốc." } },
        { n: 3, icon: "🍞", title_en: "Make some toast", title_vi: "Nướng bánh mì",
          say_en: "Toast some bread.", say_vi: "Nướng bánh mì.", actions: ["toast_bread", "take_out_toast"],
          done: function (W) { return W.k_toast === "table"; },
          next: function (W) { return W.k_toaster === "done" ? "take_out_toast" : "toast_bread"; },
          hint: { en: "Toast the bread, then take it out.", vi: "Nướng bánh, rồi lấy bánh ra." } },
        { n: 4, icon: "🍽️", title_en: "Set the table", title_vi: "Bày bàn",
          say_en: "Set the table for Dad.", say_vi: "Bày bàn cho bố.", actions: ["set_the_table"],
          done: function (W) { return W.k_table === "set"; },
          next: function () { return "set_the_table"; },
          hint: { en: "Put a plate on the table.", vi: "Đặt đĩa lên bàn." } }
      ],
      result: function (log) {
        return story(log, "Dad's coffee is ready!", "Cà phê của bố xong rồi!",
          [["pour_coffee", "poured the coffee", "rót cà phê"], ["take_out_toast", "made some toast", "nướng bánh mì"], ["set_the_table", "set the table", "bày bàn"]],
          "Thanks, kiddo! That's a great start to my day.", "Cảm ơn con! Một ngày mới tuyệt vời.");
      }
    },
    {
      id: "tidy_living_room", title_en: "Tidy the living room", title_vi: "Dọn phòng khách",
      desc_vi: "Mẹ nhờ bạn dọn phòng khách trước khi khách đến.",
      giver: G.mom, room: "living", urgency: "medium",
      request: { en: "Guests are coming. Can you tidy the living room?", vi: "Sắp có khách. Con dọn phòng khách giúp mẹ nhé?" },
      steps: [
        { n: 1, icon: "📕", title_en: "Put the book away", title_vi: "Cất sách lên bàn",
          say_en: "Put the book on the table.", say_vi: "Đặt sách lên bàn.", actions: ["pick_up_book", "put_book_on_table"],
          done: function (W) { return W.book === "table"; },
          next: function (W) { return W.book === "floor" ? "pick_up_book" : "put_book_on_table"; },
          hint: { en: "Pick up the book from the floor, then put it on the table.", vi: "Nhặt sách dưới sàn, rồi đặt lên bàn." } },
        { n: 2, icon: "🧣", title_en: "Fold the throw", title_vi: "Gấp chăn sofa",
          say_en: "Fold the blanket on the sofa.", say_vi: "Gấp chăn trên sofa.", actions: ["fold_throw"],
          done: function (W) { return W.throw === "folded"; },
          next: function () { return "fold_throw"; },
          hint: { en: "The throw is messy. Fold it.", vi: "Chăn sofa đang bừa. Gấp lại." } },
        { n: 3, icon: "🥛", title_en: "Put the cup on the table", title_vi: "Đặt cốc lên bàn",
          say_en: "Put the cup on the table.", say_vi: "Đặt cốc lên bàn.", actions: ["pick_up_cup", "put_cup_on_table"],
          done: function (W) { return W.cup === "table" || W.cup === "tableR"; },
          next: function () { return "put_cup_on_table"; },
          hint: { en: "Take the cup from the counter to the table.", vi: "Mang cốc từ quầy ra bàn." } },
        { n: 4, icon: "🪟", title_en: "Let fresh air in", title_vi: "Mở cửa sổ",
          say_en: "Open the window.", say_vi: "Mở cửa sổ.", actions: ["open_window"],
          done: function (W) { return W.window === "open"; },
          next: function () { return "open_window"; },
          hint: { en: "Open the window for some fresh air.", vi: "Mở cửa sổ cho thoáng." } }
      ],
      result: function (log) {
        return story(log, "The living room is tidy!", "Phòng khách gọn gàng rồi!",
          [["put_book_on_table", "put the book on the table", "đặt sách lên bàn"], ["fold_throw", "folded the throw", "gấp chăn"],
           ["put_cup_on_table", "put the cup on the table", "đặt cốc lên bàn"], ["open_window", "opened the window", "mở cửa sổ"]],
          "It looks lovely. Thank you, dear!", "Đẹp quá. Cảm ơn con!");
      }
    },
    {
      id: "water_the_plants", title_en: "Water the plants", title_vi: "Tưới cây",
      desc_vi: "Bà nhờ bạn ra vườn tưới cây và nhổ cỏ.",
      giver: G.grandma, room: "garden", urgency: "low",
      request: { en: "The plants are thirsty. Could you water them, dear?", vi: "Cây khát nước rồi. Cháu tưới cây giúp bà nhé?" },
      steps: [
        { n: 1, icon: "🧤", title_en: "Put on the gloves", title_vi: "Đeo găng tay",
          say_en: "Put on your gloves.", say_vi: "Đeo găng tay vào.", actions: ["put_on_gloves"],
          done: function (W) { return W.gd_gloves === "on"; },
          next: function () { return "put_on_gloves"; },
          hint: { en: "The gloves are on the garden table.", vi: "Găng tay ở trên bàn ngoài vườn." } },
        { n: 2, icon: "🚿", title_en: "Fill the watering can", title_vi: "Đổ đầy bình tưới",
          say_en: "Fill the watering can.", say_vi: "Đổ đầy bình tưới.", actions: ["fill_watering_can"],
          done: function (W) { return W.gd_can === "full" || W.gd_plants === "watered"; },
          next: function () { return "fill_watering_can"; },
          hint: { en: "Fill it at the garden tap.", vi: "Hứng nước ở vòi ngoài vườn." } },
        { n: 3, icon: "🪴", title_en: "Water the plants", title_vi: "Tưới cây",
          say_en: "Water the plants.", say_vi: "Tưới cây.", actions: ["water_garden_plants"],
          done: function (W) { return W.gd_plants === "watered"; },
          next: function () { return "water_garden_plants"; },
          hint: { en: "Water the plant pots.", vi: "Tưới các chậu cây." } },
        { n: 4, icon: "🌿", title_en: "Pull a weed", title_vi: "Nhổ cỏ",
          say_en: "Pull out the weeds.", say_vi: "Nhổ cỏ dại.", actions: ["pull_weed"],
          done: function (W) { return W.gd_weeds !== "many"; },
          next: function () { return "pull_weed"; },
          hint: { en: "Pull the weeds from the vegetable bed.", vi: "Nhổ cỏ ở luống rau." } }
      ],
      result: function (log) {
        return story(log, "The garden looks great!", "Khu vườn đẹp quá!",
          [["fill_watering_can", "filled the watering can", "đổ đầy bình tưới"], ["water_garden_plants", "watered the plants", "tưới cây"], ["pull_weed", "pulled the weeds", "nhổ cỏ"]],
          "Wonderful, my dear. The flowers will love it.", "Giỏi lắm cháu. Hoa sẽ thích lắm.");
      }
    },
    {
      id: "do_the_laundry", title_en: "Do the laundry", title_vi: "Gom đồ đi giặt",
      desc_vi: "Mẹ nhờ bạn gom quần áo bẩn ở phòng tắm và phòng ngủ đi giặt.",
      giver: G.mom, room: "bedroom", urgency: "medium",
      request: { en: "Please collect the dirty clothes for the wash.", vi: "Con gom quần áo bẩn đi giặt giúp mẹ nhé." },
      steps: [
        { n: 1, icon: "🛁", title_en: "Bathroom clothes", title_vi: "Quần áo ở phòng tắm",
          say_en: "Put the clothes in the basket.", say_vi: "Bỏ quần áo vào giỏ.", actions: ["put_clothes_in_basket"],
          done: function (W) { return W.ba_clothes === "basket"; },
          next: function () { return "put_clothes_in_basket"; },
          hint: { en: "Go to the bathroom and put the clothes in the basket.", vi: "Vào phòng tắm, bỏ quần áo vào giỏ." } },
        { n: 2, icon: "👕", title_en: "Bedroom clothes", title_vi: "Quần áo ở phòng ngủ",
          say_en: "Pick up the clothes.", say_vi: "Nhặt quần áo lên.", actions: ["pick_up_clothes"],
          done: function (W) { return W.b_clothes === "basket" || W.b_clothes === "washing"; },
          next: function () { return "pick_up_clothes"; },
          hint: { en: "Pick up the clothes from the bedroom floor.", vi: "Nhặt quần áo dưới sàn phòng ngủ." } },
        { n: 3, icon: "🧺", title_en: "Take them to wash", title_vi: "Mang đi giặt",
          say_en: "Empty the laundry basket.", say_vi: "Đổ giỏ đồ đi giặt.", actions: ["empty_basket"],
          done: function (W) { return W.b_clothes === "washing"; },
          next: function () { return "empty_basket"; },
          hint: { en: "Carry the basket to the washing machine.", vi: "Mang giỏ đồ đến máy giặt." } }
      ],
      result: function (log) {
        return story(log, "The laundry is in the wash!", "Quần áo đã được mang đi giặt!",
          [["put_clothes_in_basket", "collected the bathroom clothes", "gom đồ ở phòng tắm"], ["pick_up_clothes", "picked up the bedroom clothes", "nhặt đồ ở phòng ngủ"], ["empty_basket", "emptied the basket", "đổ giỏ đồ"]],
          "Thank you! That's a big help.", "Cảm ơn con! Giúp mẹ nhiều lắm.");
      }
    },
    {
      id: "wash_the_dishes", title_en: "Wash the dishes", title_vi: "Rửa bát",
      desc_vi: "Ông nhờ bạn rửa bát, úp lên giá, lau khô và cất vào tủ.",
      giver: G.grandpa, room: "kitchen", urgency: "medium",
      request: { en: "Could you wash the dishes for me?", vi: "Cháu rửa bát giúp ông nhé?" },
      steps: [
        { n: 1, icon: "🧽", title_en: "Wash the dishes", title_vi: "Rửa bát",
          say_en: "Turn on the faucet and wash the dishes.", say_vi: "Mở vòi và rửa bát.", actions: ["turn_on_faucet", "wash_dishes"],
          done: function (W) { return W.k_dishes !== "dirty"; },
          next: function (W) { return W.k_faucet !== "on" ? "turn_on_faucet" : "wash_dishes"; },
          hint: { en: "Turn on the faucet first.", vi: "Mở vòi nước trước." } },
        { n: 2, icon: "🚰", title_en: "Faucet off, dishes in the rack", title_vi: "Khoá vòi, úp bát",
          say_en: "Turn off the faucet.", say_vi: "Khoá vòi nước.", actions: ["turn_off_faucet", "put_dishes_in_rack"],
          done: function (W) { return W.k_faucet !== "on" && (W.k_dishes === "wet" || W.k_dishes === "dry" || W.k_dishes === "away"); },
          next: function (W) { return W.k_faucet === "on" ? "turn_off_faucet" : "put_dishes_in_rack"; },
          hint: { en: "Don't waste water. Then put the dishes in the rack.", vi: "Đừng phí nước. Rồi úp bát lên giá." } },
        { n: 3, icon: "🧻", title_en: "Dry the plates", title_vi: "Lau khô đĩa",
          say_en: "Dry the plates.", say_vi: "Lau khô đĩa.", actions: ["dry_plates"],
          done: function (W) { return W.k_dishes === "dry" || W.k_dishes === "away"; },
          next: function () { return "dry_plates"; },
          hint: { en: "Use a towel.", vi: "Dùng khăn." } },
        { n: 4, icon: "🗄️", title_en: "Put them away", title_vi: "Cất vào tủ",
          say_en: "Put the plates away.", say_vi: "Cất đĩa vào tủ.", actions: ["put_plates_away", "close_cabinet"],
          done: function (W) { return W.k_dishes === "away" && W.k_cabinet !== "open"; },
          next: function (W) { return W.k_dishes !== "away" ? "put_plates_away" : "close_cabinet"; },
          hint: { en: "Put the plates in the cabinet and close it.", vi: "Cất đĩa vào tủ rồi đóng tủ." } }
      ],
      result: function (log) {
        return story(log, "The dishes are done!", "Rửa bát xong rồi!",
          [["wash_dishes", "washed the dishes", "rửa bát"], ["dry_plates", "dried the plates", "lau khô đĩa"], ["put_plates_away", "put them away", "cất vào tủ"]],
          "Good job! The kitchen is spotless.", "Giỏi lắm! Bếp sạch bong.");
      }
    },
    {
      id: "ready_for_bed", title_en: "Get ready for bed", title_vi: "Chuẩn bị đi ngủ",
      desc_vi: "Mẹ nhắc bạn chuẩn bị đi ngủ: hẹn báo thức, dọn giường, sạc điện thoại.",
      giver: G.mom, room: "bedroom", urgency: "low",
      request: { en: "It's late. Time to get ready for bed!", vi: "Muộn rồi. Chuẩn bị đi ngủ thôi con!" },
      steps: [
        { n: 1, icon: "⏰", title_en: "Set the alarm", title_vi: "Hẹn báo thức",
          say_en: "Set the alarm for tomorrow.", say_vi: "Hẹn báo thức cho ngày mai.", actions: ["turn_off_alarm", "set_alarm"],
          done: function (W) { return W.b_alarm === "set"; },
          next: function (W) { return W.b_alarm === "ringing" ? "turn_off_alarm" : "set_alarm"; },
          hint: { en: "Turn off the alarm, then set it again.", vi: "Tắt báo thức, rồi hẹn lại." } },
        { n: 2, icon: "🛏️", title_en: "Fix the bed", title_vi: "Dọn giường",
          say_en: "Pick up the pillow.", say_vi: "Nhặt gối lên.", actions: ["pick_up_pillow", "spread_blanket"],
          done: function (W) { return W.b_pillow !== "floor" && W.b_blanket === "spread"; },
          next: function (W) { return W.b_pillow === "floor" ? "pick_up_pillow" : "spread_blanket"; },
          hint: { en: "Put the pillow on the bed and spread the blanket.", vi: "Đặt gối lên giường và trải chăn." } },
        { n: 3, icon: "🔌", title_en: "Charge your phone", title_vi: "Sạc điện thoại",
          say_en: "Charge your phone.", say_vi: "Sạc điện thoại.", actions: ["charge_phone"],
          done: function (W) { return W.b_phone === "charging" || W.b_phone === "full"; },
          next: function () { return "charge_phone"; },
          hint: { en: "The battery is low.", vi: "Pin yếu rồi." } },
        { n: 4, icon: "😴", title_en: "Lie down", title_vi: "Nằm xuống",
          say_en: "Lie down and sleep.", say_vi: "Nằm xuống và ngủ.", actions: ["lie_down"],
          done: function (W) { return W.b_lying === true; },
          next: function () { return "lie_down"; },
          hint: { en: "Lie down on the bed.", vi: "Nằm lên giường." } }
      ],
      result: function (log) {
        return story(log, "I'm ready for bed!", "Con sẵn sàng đi ngủ rồi!",
          [["set_alarm", "set the alarm", "hẹn báo thức"], ["spread_blanket", "made the bed", "dọn giường"], ["charge_phone", "charged my phone", "sạc điện thoại"]],
          "Good night, sweetheart. Sleep tight!", "Chúc con ngủ ngon!");
      }
    },
    {
      id: "morning_bathroom", title_en: "Morning bathroom routine", title_vi: "Vệ sinh buổi sáng",
      desc_vi: "Bố nhắc bạn đánh răng, súc miệng và rửa mặt.",
      giver: G.dad, room: "bathroom", urgency: "high",
      request: { en: "Brush your teeth and wash your face, please.", vi: "Con đánh răng rửa mặt đi nhé." },
      steps: [
        { n: 1, icon: "💡", title_en: "Turn on the light", title_vi: "Bật đèn",
          say_en: "Turn on the light.", say_vi: "Bật đèn.", actions: ["turn_on_bathroom_light"],
          done: function (W) { return W.ba_light === "on"; },
          next: function () { return "turn_on_bathroom_light"; },
          hint: { en: "The switch is by the door.", vi: "Công tắc ở cạnh cửa." } },
        { n: 2, icon: "🪥", title_en: "Brush your teeth", title_vi: "Đánh răng",
          say_en: "Brush your teeth.", say_vi: "Đánh răng.", actions: ["put_toothpaste", "brush_teeth"],
          done: function (W) { return W.ba_teeth === "brushed"; },
          next: function (W) { return W.ba_brush !== "paste" ? "put_toothpaste" : "brush_teeth"; },
          hint: { en: "Put toothpaste on the toothbrush first.", vi: "Nặn kem lên bàn chải trước." } },
        { n: 3, icon: "💦", title_en: "Rinse your mouth", title_vi: "Súc miệng",
          say_en: "Rinse your mouth.", say_vi: "Súc miệng.", actions: ["rinse_mouth"],
          done: function (W) { return W.ba_teeth === "brushed" && W.ba_mouth === "clean"; },
          next: function () { return "rinse_mouth"; },
          hint: { en: "Rinse with water.", vi: "Súc bằng nước." } },
        { n: 4, icon: "🧼", title_en: "Wash your face", title_vi: "Rửa mặt",
          say_en: "Wash your face and turn off the tap.", say_vi: "Rửa mặt rồi khoá vòi.", actions: ["wash_face", "turn_off_tap"],
          done: function (W) { return W.ba_face === "washed" && W.ba_tap !== "on"; },
          next: function (W) { return W.ba_face !== "washed" ? "wash_face" : "turn_off_tap"; },
          hint: { en: "Wash your face, then turn off the tap.", vi: "Rửa mặt, rồi khoá vòi." } }
      ],
      result: function (log) {
        return story(log, "I'm fresh and clean!", "Con sạch sẽ rồi!",
          [["brush_teeth", "brushed my teeth", "đánh răng"], ["rinse_mouth", "rinsed my mouth", "súc miệng"], ["wash_face", "washed my face", "rửa mặt"]],
          "Great! Now you're ready for the day.", "Tốt lắm! Giờ con sẵn sàng cho ngày mới rồi.");
      }
    },
    {
      id: "wash_the_car", title_en: "Wash the car", title_vi: "Rửa xe",
      desc_vi: "Bố nhờ bạn rửa xe trong ga-ra.",
      giver: G.dad, room: "garage", urgency: "low",
      request: { en: "The car is dirty. Can you help me wash it?", vi: "Xe bẩn quá. Con rửa xe giúp bố nhé?" },
      steps: [
        { n: 1, icon: "🚪", title_en: "Open the garage", title_vi: "Mở cửa ga-ra",
          say_en: "Open the garage door.", say_vi: "Mở cửa ga-ra.", actions: ["open_garage_door"],
          done: function (W) { return W.ga_door === "open"; },
          next: function () { return "open_garage_door"; },
          hint: { en: "Press the door button.", vi: "Bấm nút mở cửa." } },
        { n: 2, icon: "🪣", title_en: "Fill the bucket", title_vi: "Pha xô nước xà phòng",
          say_en: "Fill the bucket with soapy water.", say_vi: "Pha xô nước xà phòng.", actions: ["fill_bucket"],
          done: function (W) { return W.ga_bucket === "soapy" || W.ga_car === "clean"; },
          next: function () { return "fill_bucket"; },
          hint: { en: "Use the hose and some soap.", vi: "Dùng vòi và xà phòng." } },
        { n: 3, icon: "🚗", title_en: "Wash the car", title_vi: "Rửa xe",
          say_en: "Wash the car.", say_vi: "Rửa xe.", actions: ["wash_car"],
          done: function (W) { return W.ga_car === "clean"; },
          next: function () { return "wash_car"; },
          hint: { en: "Scrub the car with the sponge.", vi: "Kỳ xe bằng miếng bọt biển." } },
        { n: 4, icon: "✨", title_en: "Wipe the windshield", title_vi: "Lau kính",
          say_en: "Wipe the windshield.", say_vi: "Lau kính chắn gió.", actions: ["wipe_windshield"],
          done: function (W) { return W.ga_glass === "clean"; },
          next: function () { return "wipe_windshield"; },
          hint: { en: "Use a dry cloth.", vi: "Dùng khăn khô." } }
      ],
      result: function (log) {
        return story(log, "The car is shiny!", "Xe sáng bóng rồi!",
          [["fill_bucket", "filled the bucket", "pha xô nước"], ["wash_car", "washed the car", "rửa xe"], ["wipe_windshield", "wiped the windshield", "lau kính"]],
          "Wow, it looks brand new! Thanks!", "Ồ, trông như xe mới! Cảm ơn con!");
      }
    },
    {
      id: "movie_night", title_en: "Movie night", title_vi: "Tối xem phim",
      desc_vi: "Tom rủ bạn xem phim: kéo rèm, lấy đồ ăn vặt, bật TV và ngồi lên sofa.",
      giver: G.tom, room: "living", urgency: "low",
      request: { en: "Let's watch a movie! Can you get it ready?", vi: "Xem phim đi! Cậu chuẩn bị nhé?" },
      steps: [
        { n: 1, icon: "🌙", title_en: "Close the curtains", title_vi: "Kéo rèm",
          say_en: "Close the curtains.", say_vi: "Kéo rèm lại.", actions: ["close_living_curtains"],
          done: function (W) { return W.livCurtains === "closed"; },
          next: function () { return "close_living_curtains"; },
          hint: { en: "It's darker for the movie.", vi: "Tối hơn để xem phim." } },
        { n: 2, icon: "🍿", title_en: "Get a snack", title_vi: "Lấy đồ ăn vặt",
          say_en: "Get a yogurt from the fridge.", say_vi: "Lấy sữa chua trong tủ lạnh.", actions: ["open_fridge", "take_out_yogurt", "close_fridge"],
          done: function (W) { return has(W.counter, "yogurt") && W.fridge !== "open"; },
          next: function (W) { return has(W.counter, "yogurt") ? "close_fridge" : (W.fridge !== "open" ? "open_fridge" : "take_out_yogurt"); },
          hint: { en: "Open the fridge, take out a yogurt and close it.", vi: "Mở tủ lạnh, lấy sữa chua rồi đóng tủ." } },
        { n: 3, icon: "📺", title_en: "Turn on the TV", title_vi: "Bật TV",
          say_en: "Turn on the TV.", say_vi: "Bật TV.", actions: ["turn_on_tv"],
          done: function (W) { return W.tv === "on"; },
          next: function () { return "turn_on_tv"; },
          hint: { en: "Press the power button.", vi: "Bấm nút nguồn." } },
        { n: 4, icon: "🛋️", title_en: "Sit and watch", title_vi: "Ngồi xem",
          say_en: "Sit on the sofa and watch TV.", say_vi: "Ngồi lên sofa và xem TV.", actions: ["sit_on_sofa", "watch_tv"],
          done: function (W) { return !!W.sofa && W.activity === "watching"; },
          next: function (W) { return !W.sofa ? "sit_on_sofa" : "watch_tv"; },
          hint: { en: "Sit on the sofa, then watch.", vi: "Ngồi lên sofa rồi xem." } }
      ],
      result: function (log) {
        return story(log, "Movie night is ready!", "Tối xem phim sẵn sàng!",
          [["close_living_curtains", "closed the curtains", "kéo rèm"], ["take_out_yogurt", "got a snack", "lấy đồ ăn vặt"], ["turn_on_tv", "turned on the TV", "bật TV"]],
          "Awesome! Pass me the snacks!", "Tuyệt! Đưa tớ đồ ăn với!");
      }
    }
  ];

  root.ELW_MISSIONS_PACK = PACK;
  if (typeof module !== "undefined" && module.exports) module.exports = PACK;
})(typeof window !== "undefined" ? window : globalThis);
