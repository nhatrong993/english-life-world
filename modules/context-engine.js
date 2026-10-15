/* English Life World — modules/context-engine.js
   Dynamic 5-Factor Context Engine (Place & Zone, Weather, Situation, Companion, Listener)
   + Pure pickPhrases(ctx) Rule Engine + Side Characters 2-Tick Controller.
   Exposes: window.ELW_CONTEXT (and module.exports for Node unit tests) */
(function (root) {
  "use strict";

  const KEY = "elw_ctx_v1";
  const SVGNS = "http://www.w3.org/2000/svg";
  const HOME_ROOMS = ["living", "kitchen", "bedroom", "bathroom", "garage", "garden"];
  const DEF_SIDE_CHARS = { surprise: true, linh: false };
  let S = { walkDog: false, sit: "normal", open: true, practiced: {}, sideChars: { surprise: true, linh: false } };
  function loadState() {
    try {
      if (typeof localStorage !== "undefined") {
        const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
        if (saved && typeof saved === "object") {
          Object.assign(S, saved);
          const sc = saved.sideChars && typeof saved.sideChars === "object" ? saved.sideChars : {};
          S.sideChars = {
            surprise: sc.surprise !== undefined ? !!sc.surprise : DEF_SIDE_CHARS.surprise,
            linh: sc.linh !== undefined ? !!sc.linh : DEF_SIDE_CHARS.linh
          };
        }
      }
    } catch (e) {}
    if (!S.sideChars || typeof S.sideChars !== "object") {
      S.sideChars = { surprise: true, linh: false };
    }
    S.open = S.open !== undefined ? !!S.open : true;
  }
  loadState();
  const save = () => {
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
  };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- 7 Real-Life Situation Contexts ---------- */
  const SITUATIONS = [
    { id: "normal", icon: "😊", vi: "Bình thường", en: "Everyday Chill", free: true },
    { id: "rush", icon: "🏃", vi: "Đang vội", en: "In a Hurry", free: true },
    { id: "weekend", icon: "🎉", vi: "Đi chơi cuối tuần", en: "Weekend Hangout", free: true },
    { id: "sick", icon: "🤒", vi: "Hơi mệt / Cảm nhẹ", en: "Under the Weather", free: true },
    { id: "bargain", icon: "💸", vi: "Săn giảm giá", en: "Bargain Hunting", pro: true },
    { id: "traveler", icon: "🧳", vi: "Khách du lịch / Hỏi đường", en: "Traveler Mode", pro: true },
    { id: "lost", icon: "🔍", vi: "Tìm đồ thất lạc", en: "Lost & Found", pro: true }
  ];

  const WEATHERS = [
    { id: "sunny", icon: "☀️", vi: "Nắng đẹp", en: "Sunny" },
    { id: "rainy", icon: "🌧️", vi: "Mưa sáng rõ", en: "Cozy Rain" },
    { id: "cold", icon: "❄️", vi: "Trời lạnh", en: "Chilly" },
    { id: "windy", icon: "🌬️", vi: "Gió mát", en: "Breezy" },
    { id: "hot", icon: "🥵", vi: "Nóng bức", en: "Hot Day" }
  ];

  /* ---------- Staff Role Mapping by Place & Zone ---------- */
  const STAFF_BY_ZONE = {
    home:            { responder: "Mom",          who: "Mom 👩",                    icon: "👩",   voice: "mom",       listener: "Mom" },
    living:          { responder: "Mom",          who: "Mom 👩",                    icon: "👩",   voice: "mom",       listener: "Mom" },
    kitchen:         { responder: "Mom",          who: "Mom 👩",                    icon: "👩",   voice: "mom",       listener: "Mom" },
    bedroom:         { responder: "Mom",          who: "Mom 👩",                    icon: "👩",   voice: "mom",       listener: "Mom" },
    bathroom:        { responder: "Mom",          who: "Mom 👩",                    icon: "👩",   voice: "mom",       listener: "Mom" },
    garage:          { responder: "Dad",          who: "Dad 👨",                    icon: "👨",   voice: "dad",       listener: "Mom" },
    garden:          { responder: "Mom",          who: "Mom 👩",                    icon: "👩",   voice: "mom",       listener: "Mom" },
    cafe:            { responder: "Barista",      who: "Barista 🧑‍🍳",              icon: "🧑‍🍳", voice: "barista",   listener: "staff" },
    park:            { responder: "Park Staff",   who: "Park Staff 🌳",             icon: "🌳",   voice: "clerk",     listener: "staff" },
    market:          { responder: "Store Greeter",who: "Store Greeter 💁",          icon: "💁",   voice: "clerk",     listener: "staff" },
    market_entrance: { responder: "Store Greeter",who: "Store Greeter 💁",          icon: "💁",   voice: "clerk",     listener: "staff" },
    market_produce:  { responder: "Produce Clerk",who: "Produce & Bakery Clerk 🧑‍🌾",icon: "🧑‍🌾", voice: "baker",     listener: "staff" },
    market_dairy:    { responder: "Dairy Clerk",  who: "Dairy & Drinks Clerk 🧊",   icon: "🧊",   voice: "clerk",     listener: "staff" },
    market_meat:     { responder: "Butcher",      who: "Butcher 👨‍🍳",               icon: "👨‍🍳", voice: "butcher",   listener: "staff" },
    market_checkout: { responder: "Cashier",      who: "Cashier 💁‍♀️",              icon: "💁‍♀️", voice: "cashier",   listener: "staff" },
    restaurant:      { responder: "Waiter",       who: "Waiter 🍽️",                icon: "🍽️",  voice: "waiter",    listener: "staff" },
    school:          { responder: "Teacher",      who: "Teacher 👩‍🏫",              icon: "👩‍🏫", voice: "teacher",   listener: "staff" },
    camping:         { responder: "Park Ranger",  who: "Park Ranger 🏕️",           icon: "🏕️",  voice: "ranger",    listener: "staff" },
    outdoor:         { responder: "Park Ranger",  who: "Park Ranger 🏕️",           icon: "🏕️",  voice: "ranger",    listener: "staff" }
  };

  function normalizePlaceAndZone(ctx) {
    ctx = ctx || {};
    const rawRoom = String(ctx.room || ctx.zone || ctx.place || "living").toLowerCase().trim();
    const rawZone = String(ctx.zone || ctx.area || rawRoom).toLowerCase().trim();

    if (HOME_ROOMS.indexOf(rawRoom) >= 0 || rawRoom === "home") {
      const z = HOME_ROOMS.indexOf(rawZone) >= 0 ? rawZone : (HOME_ROOMS.indexOf(rawRoom) >= 0 ? rawRoom : "living");
      return { place: "home", zone: z };
    }
    if (rawRoom === "market" || rawRoom.indexOf("market_") === 0 || rawZone.indexOf("market_") === 0 ||
        ["entrance", "produce", "bakery", "dairy", "frozen", "meat", "seafood", "checkout", "service"].indexOf(rawZone) >= 0) {
      let mz = "market";
      const zStr = rawZone + " " + rawRoom;
      if (/produce|bakery|fruit|veg/.test(zStr)) mz = "market_produce";
      else if (/dairy|frozen|drink|milk/.test(zStr)) mz = "market_dairy";
      else if (/meat|seafood|fish|butcher|household/.test(zStr)) mz = "market_meat";
      else if (/checkout|cashier|pay|service/.test(zStr)) mz = "market_checkout";
      else mz = "market";
      return { place: "market", zone: mz };
    }
    if (rawRoom.indexOf("cafe") === 0 || rawZone.indexOf("cafe") === 0) return { place: "cafe", zone: rawZone || "cafe" };
    if (rawRoom.indexOf("park") === 0 || rawZone.indexOf("park") === 0) return { place: "park", zone: rawZone || "park" };
    if (rawRoom.indexOf("restaurant") === 0) return { place: "restaurant", zone: rawZone || "restaurant" };
    if (rawRoom.indexOf("school") === 0) return { place: "school", zone: rawZone || "school" };
    if (rawRoom.indexOf("camping") === 0 || rawRoom.indexOf("outdoor") === 0) return { place: "camping", zone: "camping" };
    return { place: rawRoom, zone: rawZone || rawRoom };
  }

  function normalizeWeather(w) {
    const s = String(w || "sunny").toLowerCase().trim();
    if (s === "rain" || s === "rainy") return "rainy";
    if (["sunny", "rainy", "cold", "windy", "hot"].indexOf(s) >= 0) return s;
    return "sunny";
  }

  function normalizeSituation(sit) {
    const s = String(sit || "normal").toLowerCase().trim();
    if (s === "tired" || s === "sick") return "sick";
    if (s === "hurry" || s === "rush") return "rush";
    if (s === "sale" || s === "discount" || s === "bargain") return "bargain";
    if (["normal", "rush", "weekend", "sick", "bargain", "traveler", "lost"].indexOf(s) >= 0) return s;
    return "normal";
  }

  function normalizeCompanions(ctx) {
    ctx = ctx || {};
    const c = ctx.companion;
    const cStr = Array.isArray(c) ? c.join(",").toLowerCase() : String(c || "").toLowerCase();
    const withLinh = !!(ctx.withLinh || /linh|friend/.test(cStr));
    const withPet = !!(ctx.withPet || ctx.walkDog || /pet|dog|milo/.test(cStr));
    const withFamily = !!(ctx.withFamily || /family|mom|dad|parent/.test(cStr));
    const alone = !withLinh && !withPet && !withFamily;
    let mode = "alone";
    if (withLinh && withPet) mode = "linh+pet";
    else if (withLinh) mode = "linh";
    else if (withPet) mode = "pet";
    else if (withFamily) mode = "family";
    return { withLinh, withPet, withFamily, alone, mode };
  }

  /* ---------- Phrase Builder Helper ---------- */
  function makeItem(en, vi, replyEn, replyVi, chunk, roleInfo, meta) {
    return Object.assign({
      en: en,
      vi: vi,
      replyEn: replyEn,
      replyVi: replyVi,
      chunk: chunk,
      who: roleInfo.who,
      responder: roleInfo.responder,
      listener: roleInfo.listener,
      voice: roleInfo.voice || "adult_female",
      icon: roleInfo.icon || "💬"
    }, meta || {});
  }

  const ROLE_LINH = { responder: "Linh", who: "Linh 👧", icon: "👧", voice: "linh", listener: "Linh" };
  const ROLE_PET = { responder: "Milo", who: "Milo 🐕", icon: "🐕", voice: "child", listener: "pet" };
  const ROLE_MOM = { responder: "Mom", who: "Mom 👩", icon: "👩", voice: "mom", listener: "Mom" };
  const ROLE_STRANGER = { responder: "Stranger", who: "Stranger 🙂", icon: "🙂", voice: "adult_male", listener: "stranger" };

  /* ---------- Pet Phrases (Milo) ---------- */
  const PET_PHRASE_BANK = [
    { en: "Good boy, Milo! Stay close.", vi: "Ngoan lắm Milo! Đi sát bên mình nhé.", replyEn: "Woof! Woof! *trots happily right beside you* 🐾", replyVi: "Gâu! Gâu! *chạy lon ton ngay sát bên bạn* 🐾", chunk: "stay close" },
    { en: "Come on, Milo! Let's go for a walk.", vi: "Nào Milo! Đi dạo bộ cùng mình nhé.", replyEn: "Woof! Woof! *wags tail happily* 🐾", replyVi: "Gâu! Gâu! *vẫy đuôi mừng rỡ* 🐾", chunk: "go for a walk" },
    { en: "Sit and stay right here while I check this out, Milo.", vi: "Ngồi xuống và đợi ngay đây trong lúc mình xem món này nhé, Milo.", replyEn: "Arf! *sits politely and waits* 🐕‍🦺", replyVi: "Gâu! *ngồi ngoan ngoãn chờ đợi* 🐕‍🦺", chunk: "sit and stay" },
    { en: "Here's some fresh water for you, buddy! Good boy!", vi: "Nước mát cho cún đây! Ngoan lắm!", replyEn: "Slurp, slurp! Woof! 💧🐾", replyVi: "Chẹp, chẹp! Gâu! 💧🐾", chunk: "good boy" }
  ];

  const DOG_PHRASES = PET_PHRASE_BANK.map(p => makeItem(p.en, p.vi, p.replyEn, p.replyVi, p.chunk, ROLE_PET));

  /* ---------- Place & Zone Specific Staff Phrases ---------- */
  const ZONE_STAFF_PHRASES = {
    home: [
      { en: "Mom, do we need anything from the store today?", vi: "Mẹ ơi, hôm nay nhà mình có cần mua thêm gì ngoài tiệm không ạ?", replyEn: "Could you pick up some fresh milk and apples, sweetie?", replyVi: "Con mua giúp mẹ ít sữa tươi và táo nhé con yêu!", chunk: "pick up some" },
      { en: "I'm going to tidy up the living room now, Mom.", vi: "Con dọn dẹp phòng khách bây giờ đây mẹ ạ.", replyEn: "Thank you, sweetie! That's a huge help.", replyVi: "Cảm ơn con yêu! Thế thì đỡ đần cho mẹ biết bao.", chunk: "tidy up" },
      { en: "What are we having for dinner tonight, Mom?", vi: "Tối nay nhà mình ăn món gì vậy mẹ?", replyEn: "I'm making grilled salmon and vegetable soup tonight!", replyVi: "Tối nay mẹ làm cá hồi áp chảo và súp rau củ nhé!", chunk: "having for dinner" }
    ],
    market: [
      { en: "Excuse me, could I grab a shopping cart from this row at the entrance?", vi: "Xin lỗi, tôi lấy một chiếc xe đẩy ở hàng này ngay lối vào được không ạ?", replyEn: "Of course! All these sanitized carts are unlocked and ready for you.", replyVi: "Dạ được chứ ạ! Tất cả xe đẩy đã khử khuẩn ở đây đều mở khóa sẵn cho bạn.", chunk: "grab a shopping cart" },
      { en: "Where can I find the weekly flyers and supermarket map?", vi: "Tôi có thể lấy tờ rơi khuyến mãi tuần này và sơ đồ siêu thị ở đâu ạ?", replyEn: "Right here on the welcome stand! Produce is straight ahead in Zone 2.", replyVi: "Ngay trên kệ chào mừng này ạ! Khu rau quả ở thẳng phía trước tại Khu 2.", chunk: "weekly flyers" },
      { en: "Do you have a smaller hand basket I can carry around the store?", vi: "Ở đây có giỏ xách tay cỡ nhỏ hơn để đi mua sắm không ạ?", replyEn: "Yes! The red hand baskets are stacked right next to the security gate.", replyVi: "Dạ có! Giỏ xách tay màu đỏ xếp ngay cạnh cổng từ an ninh ạ.", chunk: "hand basket" }
    ],
    market_produce: [
      { en: "Excuse me, are these organic Honeycrisp apples in the produce section fresh today?", vi: "Xin lỗi, táo Honeycrisp hữu cơ ở quầy rau quả hôm nay mới nhập về phải không ạ?", replyEn: "Yes! They were delivered from the orchard this morning—super crisp and sweet!", replyVi: "Dạ đúng rồi! Táo vừa chuyển từ vườn về sáng nay—giòn và ngọt lắm ạ!", chunk: "organic apples" },
      { en: "Could you slice this fresh sourdough loaf at the bakery counter for me, please?", vi: "Bạn cắt lát giúp tôi ổ bánh mì men tự nhiên này ở quầy bánh được không ạ?", replyEn: "Certainly! Would you like thick or medium slices?", replyVi: "Dạ được ngay ạ! Bạn muốn cắt lát dày hay vừa?", chunk: "slice this loaf" },
      { en: "How much are the ripe avocados per pound in the produce aisle?", vi: "Bơ chín ở quầy rau quả tính giá bao nhiêu một cân Anh vậy ạ?", replyEn: "They're on special today at two dollars each, or three for five dollars!", replyVi: "Hôm nay đang có giá ưu đãi 2 đô một quả, hoặc 3 quả 5 đô ạ!", chunk: "per pound / on special" }
    ],
    market_dairy: [
      { en: "Excuse me, which carton of whole milk in the dairy cooler has the latest expiration date?", vi: "Xin lỗi, hộp sữa tươi nguyên kem nào trong tủ mát có hạn sử dụng mới nhất vậy ạ?", replyEn: "Check the cartons in the back row—they're good until next Friday!", replyVi: "Bạn lấy các hộp ở hàng phía trong nhé—hạn dùng tới tận thứ Sáu tuần sau!", chunk: "expiration date" },
      { en: "Where do you keep the Greek yogurt and cheddar cheese in the dairy aisle?", vi: "Sữa chua Hy Lạp và phô mai cheddar để ở tủ nào trong khu bơ sữa vậy ạ?", replyEn: "Right here in the middle dairy cooler, on the second shelf!", replyVi: "Ngay trong tủ mát sữa ở giữa này, trên ngăn thứ hai ạ!", chunk: "dairy cooler" },
      { en: "Do you have unsalted organic butter and oat milk in this dairy section?", vi: "Ở khu sữa này có bơ hữu cơ không muối và sữa yến mạch không ạ?", replyEn: "Yes, both are on the middle shelf of Cooler 2 right beside the eggs!", replyVi: "Dạ có, cả hai đều ở ngăn giữa của Tủ mát số 2 ngay cạnh quầy trứng ạ!", chunk: "unsalted butter" }
    ],
    market_meat: [
      { en: "Could I get half a pound of fresh Atlantic salmon fillets from the seafood counter, please?", vi: "Cho tôi lấy nửa cân phi-lê cá hồi Đại Tây Dương tươi ở quầy hải sản nhé?", replyEn: "Sure thing! I'll wrap this fresh center-cut fillet for you.", replyVi: "Dạ có ngay! Tôi sẽ bọc miếng phi-lê giữa tươi ngon này cho bạn.", chunk: "half a pound of" },
      { en: "Which cut of beef at the butcher counter do you recommend for a quick stir-fry?", vi: "Ở quầy thịt này anh khuyên nên chọn phần thịt bò nào để xào nhanh cho mềm ạ?", replyEn: "Thinly sliced sirloin is tender and cooks in just three minutes!", replyVi: "Thăn ngoại thái mỏng rất mềm và chỉ cần xào 3 phút là chín tới!", chunk: "cut of beef" },
      { en: "Excuse me, which aisle in this section has laundry detergent and paper towels?", vi: "Xin lỗi, nước giặt và khăn giấy bếp nằm ở dãy nào trong khu này vậy ạ?", replyEn: "Right behind you on the household shelf—top row for paper towels!", replyVi: "Ngay kệ gia dụng phía sau bạn—hàng trên cùng là khăn giấy bếp đấy ạ!", chunk: "household shelf" }
    ],
    market_checkout: [
      { en: "Hi! Can I pay by contactless card at this checkout register?", vi: "Chào bạn! Tôi thanh toán bằng thẻ chạm ở quầy thu ngân này được không ạ?", replyEn: "Of course! Just tap your card or phone on the terminal when it lights up.", replyVi: "Dạ được chứ ạ! Bạn chỉ cần chạm thẻ hoặc điện thoại lên máy POS khi đèn sáng.", chunk: "contactless card" },
      { en: "I brought my own reusable cloth bag to the checkout—could you pack the heavy items at the bottom?", vi: "Tôi có mang túi vải tái sử dụng ra quầy thu ngân—bạn xếp đồ nặng xuống đáy giúp tôi nhé?", replyEn: "Happy to! Thank you for using a reusable bag today.", replyVi: "Sẵn sàng ạ! Cảm ơn bạn đã sử dụng túi tái sử dụng hôm nay.", chunk: "reusable bag" },
      { en: "Excuse me, I'd like to apply this loyalty coupon to my receipt at checkout.", vi: "Xin lỗi, tôi muốn áp dụng mã giảm giá thành viên này vào hóa đơn thanh toán.", replyEn: "Scanned! That saves you four dollars and fifty cents today.", replyVi: "Đã quét xong ạ! Mã này giúp bạn tiết kiệm 4 đô rưỡi hôm nay.", chunk: "loyalty coupon" }
    ],
    cafe: [
      { en: "Hi! Could I get a freshly brewed oat milk latte and a butter croissant at the café counter, please?", vi: "Chào bạn! Cho mình một ly latte sữa yến mạch mới pha và một bánh sừng bò bơ tại quầy nhé?", replyEn: "Coming right up! Would you like it for here or to go?", replyVi: "Có ngay ạ! Bạn muốn dùng tại quán hay mang đi?", chunk: "freshly brewed" },
      { en: "Excuse me, what's the Wi-Fi password for the café today?", vi: "Xin lỗi, mật khẩu Wi-Fi của quán cà phê hôm nay là gì vậy ạ?", replyEn: "It's 'brew2026'—all lowercase! Power outlets are right under the bench.", replyVi: "Là 'brew2026' viết thường hết nhé! Ổ cắm điện ở ngay dưới ghế dài ạ.", chunk: "Wi-Fi password" },
      { en: "Hi! Could I get an iced oat milk latte with less ice, please?", vi: "Chào bạn! Cho mình một ly latte sữa yến mạch ít đá được không ạ?", replyEn: "Coming right up! I'll make it with light ice for you.", replyVi: "Có ngay ạ! Mình sẽ pha ít đá cho bạn nhé.", chunk: "with less ice" }
    ],
    park: [
      { en: "Excuse me, where is the nearest drinking fountain and restroom in the park?", vi: "Xin lỗi, vòi nước uống và nhà vệ sinh gần nhất trong công viên ở hướng nào vậy ạ?", replyEn: "Just follow the jogging path past the pond—it's right by the pavilion!", replyVi: "Bạn cứ đi theo đường chạy bộ qua bờ hồ—nó ở ngay cạnh chòi nghỉ mát!", chunk: "nearest drinking fountain" },
      { en: "Can we rent a paddleboat for thirty minutes at the park lake dock?", vi: "Tôi có thể thuê thuyền đạp vịt 30 phút ở bến hồ công viên được không ạ?", replyEn: "Sure! Here are your life vests—have a wonderful ride on the lake!", replyVi: "Dạ được chứ! Áo phao của bạn đây—chúc bạn dạo hồ vui vẻ nhé!", chunk: "rent a paddleboat" }
    ],
    restaurant: [
      { en: "Table for two by the restaurant window, please. Could we see the menu?", vi: "Cho tôi bàn hai người cạnh cửa sổ nhà hàng nhé. Cho chúng tôi xem thực đơn được không ạ?", replyEn: "Right this way! Here are your menus and some water.", replyVi: "Mời đi lối này ạ! Thực đơn và nước của quý khách đây.", chunk: "table for two" },
      { en: "What is the chef's special pasta dish at the restaurant tonight?", vi: "Món mì Ý đặc biệt của bếp trưởng nhà hàng tối nay là gì vậy ạ?", replyEn: "Tonight it's handmade truffle fettuccine with grilled garlic shrimp!", replyVi: "Tối nay là mì fettuccine nấm truffle làm tay kèm tôm nướng tỏi ạ!", chunk: "chef's special" }
    ],
    school: [
      { en: "Excuse me, teacher, could you explain this grammar rule one more time?", vi: "Thưa cô, cô giảng lại quy tắc ngữ pháp này thêm một lần nữa được không ạ?", replyEn: "Of course! Let's look at two real-life examples on the board together.", replyVi: "Tất nhiên rồi! Cô trò mình cùng xem hai ví dụ thực tế trên bảng nhé.", chunk: "explain one more time" },
      { en: "May I borrow this English storybook from the school library for a week?", vi: "Em mượn cuốn truyện tiếng Anh này ở thư viện trường trong một tuần được không ạ?", replyEn: "Certainly! Just scan your student ID card right here.", replyVi: "Được chứ em! Em quét thẻ học sinh ngay tại đây nhé.", chunk: "borrow from the library" }
    ],
    camping: [
      { en: "Excuse me, Ranger, is it safe to light a campfire in this fire ring at the campsite tonight?", vi: "Xin lỗi chú kiểm lâm, tối nay đốt lửa trại trong vòng đá ở khu cắm trại này có an toàn không ạ?", replyEn: "Yes, just keep a bucket of water nearby and watch the embers!", replyVi: "Được nhé, chỉ cần để sẵn một xô nước bên cạnh và canh tàn lửa là được!", chunk: "light a campfire" },
      { en: "Excuse me, Ranger, which hiking trail leads up to the pine ridge campsite and lookout point?", vi: "Xin lỗi chú kiểm lâm, đường mòn nào dẫn lên khu cắm trại đồi thông và đài quan sát vậy ạ?", replyEn: "Take the Pine Ridge Trail on the left—it's a twenty-minute hike to the campsite!", replyVi: "Bạn đi theo đường mòn Đồi Thông bên trái—leo khoảng 20 phút là tới khu trại!", chunk: "hiking trail" }
    ]
  };

  /* ---------- Weather Adaptation Phrases ---------- */
  function buildWeatherPhrases(weather, place, zone, staffRole, withLinh) {
    const out = [];
    if (weather === "hot") {
      if (place === "home") {
        out.push(makeItem("Mom, it's boiling hot today! Should I turn on the living room fan and get cold water?", "Mẹ ơi, hôm nay nóng như đổ lửa! Con bật quạt và lấy nước mát nhé?", "Yes please, sweetie! Grab a glass of ice water for me too.", "Ừ con làm đi! Lấy giúp mẹ một cốc nước đá nữa nhé con yêu.", "boiling hot", ROLE_MOM));
      } else if (place === "cafe") {
        out.push(makeItem("Phew, it's so hot outside today! Could I get an iced oat milk latte with less ice at the café?", "Phù, ngoài trời hôm nay nóng quá! Cho mình một ly latte sữa yến mạch ít đá mát lạnh nhé?", "Coming right up! An iced latte is the best way to cool down today.", "Có ngay ạ! Một ly latte đá là cách giải nhiệt tuyệt nhất hôm nay.", "iced oat milk latte", staffRole));
      } else {
        out.push(makeItem("Phew, it's so hot outside today! Do you have any chilled drinks or ice cream?", "Phù, ngoài trời hôm nay nóng quá! Ở đây có đồ uống ướp lạnh hay kem không ạ?", "Yes! Our cold drinks and ice cream are right in the chilled case—super refreshing!", "Dạ có! Đồ uống lạnh và kem ở ngay trong tủ mát—giải nhiệt tuyệt vời luôn ạ!", "chilled drinks", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("Linh, it's scorching hot today—let's grab an iced drink and stay somewhere cool!", "Linh ơi, hôm nay nắng nóng quá—tụi mình mua nước đá rồi tìm chỗ mát ngồi đi!", "Totally agree! Let's get two large iced lemon teas right now!", "Đồng ý cả hai tay! Gọi ngay hai ly trà chanh đá cỡ lớn thôi!", "scorching hot", ROLE_LINH));
      }
    } else if (weather === "rainy") {
      if (place === "home") {
        out.push(makeItem("Mom, it's raining outside! Should I close the window so the rain doesn't splash in?", "Mẹ ơi, ngoài trời đang mưa! Con đóng cửa sổ lại kẻo mưa hắt vào nhé?", "Good thinking, sweetie! Close it so the floor stays dry.", "Con nghĩ chu đáo lắm! Đóng lại cho sàn nhà khô ráo nhé.", "raining outside", ROLE_MOM));
      } else {
        out.push(makeItem("It's raining quite hard outside—is there an umbrella stand near the entrance?", "Ngoài trời đang mưa to quá—gần lối vào có kệ để ô dù không ạ?", "Yes, right by the entrance! And watch your step, the floor might be a bit wet.", "Dạ có, ngay cạnh lối vào ạ! Bạn đi cẩn thận kẻo sàn hơi ướt nhé.", "watch your step", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("Good thing we brought our umbrella, Linh! Let's stay dry inside for a while.", "May mà tụi mình có mang theo ô, Linh nhỉ! Ở trong này trú mưa một lát nhé.", "Lucky us! A rainy day like this feels so cozy indoors.", "May thật đấy! Ngày mưa thế này ở bên trong ấm cúng dễ chịu ghê.", "brought our umbrella", ROLE_LINH));
      }
    } else if (weather === "cold") {
      if (place === "home") {
        out.push(makeItem("Brrr, it's chilly today, Mom! Can we make some hot cocoa in the kitchen?", "Brrr, hôm nay trời lạnh quá mẹ ơi! Mẹ con mình pha ca cao nóng uống nhé?", "That sounds wonderful, sweetie! I'll warm up the milk right now.", "Nghe tuyệt lắm con yêu! Để mẹ hâm nóng sữa ngay đây.", "chilly today", ROLE_MOM));
      } else if (place === "cafe") {
        out.push(makeItem("It's freezing outside today—could I order a hot tea with honey or a warm oat latte, please?", "Ngoài trời hôm nay lạnh quá—cho mình gọi một tách trà nóng mật ong hoặc latte ấm nhé?", "Certainly! I'll steam a piping hot honey tea and warm latte for you right now.", "Dạ có ngay! Mình sẽ pha một tách trà mật ong nóng hổi và latte ấm cho bạn ngay.", "hot tea with honey", staffRole));
      } else {
        out.push(makeItem("It's pretty chilly today—could I get something warm to warm up?", "Hôm nay trời se lạnh quá—tôi có thể chọn món gì ấm nóng được không ạ?", "Certainly! Our fresh hot soup and warm tea are ready right now.", "Dạ có ngay! Súp nóng và trà ấm mới nấu đã sẵn sàng phục vụ bạn.", "warm up", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("Brrr, my hands are freezing, Linh! Let's get something hot to drink.", "Brrr, tay mình lạnh cóng rồi Linh ơi! Đi kiếm đồ uống nóng thôi.", "Yes, please! A steaming cup of hot chocolate sounds perfect right now.", "Chuẩn luôn! Một cốc sô-cô-la nóng bốc khói lúc này là hết ý.", "hands are freezing", ROLE_LINH));
      }
    } else if (weather === "windy") {
      if (place === "home") {
        out.push(makeItem("Mom, the wind is blowing hard—I'll secure the window latch.", "Mẹ ơi, gió thổi mạnh quá—để con cài chốt cửa sổ lại nhé.", "Thanks, sweetie! That keeps the draft out nicely.", "Cảm ơn con yêu! Thế là gió không lùa vào nhà nữa.", "wind is blowing", ROLE_MOM));
      } else if (place === "camping") {
        out.push(makeItem("Excuse me, Ranger, the wind is picking up—which sheltered campsite is best tonight?", "Xin lỗi chú kiểm lâm, gió đang mạnh dần—tối nay khu trại kín gió nào an toàn nhất ạ?", "Campground B behind the pine trees is well sheltered from the wind!", "Khu trại B phía sau rặng thông rất kín gió và an toàn đấy!", "sheltered campsite", staffRole));
      } else {
        out.push(makeItem("It's really breezy out there today! Good thing it's calm inside.", "Ngoài trời hôm nay gió lộng thật đấy! May mà ở bên trong này yên gió.", "Haha, yes! Step right inside where it's sheltered from the wind.", "Haha, vâng ạ! Mời bạn vào bên trong kín gió nhé.", "breezy out there", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("Hold on to your hat, Linh! The wind is super strong today!", "Giữ chặt mũ nhé Linh! Hôm nay gió thổi mạnh ghê!", "Haha, my hair is flying everywhere in this breeze!", "Haha, tóc mình bay rối tung trong gió rồi này!", "hold on to your hat", ROLE_LINH));
      }
    } else {
      /* sunny */
      if (place === "home") {
        out.push(makeItem("What a lovely sunny morning, Mom! Can I open the curtains?", "Buổi sáng nắng đẹp quá mẹ ơi! Con mở rèm cửa ra nhé?", "Sure, sweetie! Let the fresh sunshine into the room.", "Ừ con mở đi! Cho nắng sớm tràn vào phòng cho thoáng.", "sunny morning", ROLE_MOM));
      } else {
        out.push(makeItem("It's such a bright sunny day today! Everything here looks so fresh.", "Hôm nay trời nắng đẹp thật đấy! Nhìn mọi thứ ở đây đều tươi mới.", "Thank you! Have a wonderful sunny day with us!", "Cảm ơn bạn! Chúc bạn một ngày nắng đẹp thật vui vẻ nhé!", "bright sunny day", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("What a gorgeous sunny day, Linh! I'm glad we came out together.", "Một ngày nắng đẹp tuyệt vời, Linh nhỉ! Vui quá vì tụi mình đi cùng nhau.", "Me too! The weather couldn't be more perfect today!", "Mình cũng vậy! Thời tiết hôm nay đúng là không thể đẹp hơn!", "gorgeous sunny day", ROLE_LINH));
      }
    }
    return out;
  }

  /* ---------- Situation Adaptation Phrases ---------- */
  function buildSituationPhrases(situation, place, zone, staffRole, withLinh) {
    const out = [];
    if (situation === "rush") {
      if (place === "home") {
        out.push(makeItem("Mom, I'm in a bit of a rush this morning—I'll grab a quick bite in the kitchen!", "Mẹ ơi, sáng nay con hơi vội—con ăn nhanh một miếng trong bếp rồi đi nhé!", "Okay sweetie, take a banana and don't forget your keys!", "Ừ con yêu, cầm thêm quả chuối đi đường ăn và đừng quên chìa khóa nhé!", "in a bit of a rush", ROLE_MOM));
      } else if (place === "market") {
        out.push(makeItem("Excuse me, I'm in a hurry—can I use the express self-checkout lane?", "Xin lỗi, tôi đang hơi vội—tôi dùng quầy tự thanh toán nhanh được không ạ?", "Yes, right this way! The express self-checkout has zero wait time.", "Dạ được ngay ạ! Quầy tự thanh toán nhanh bên này không phải chờ chút nào.", "express self-checkout", staffRole));
      } else {
        out.push(makeItem("I'm in a bit of a rush—could I get this to go as quickly as possible?", "Tôi đang hơi vội—cho tôi lấy phần này mang đi nhanh nhất có thể nhé?", "Right away! I'll have it packed for you in under a minute.", "Dạ có ngay! Tôi sẽ đóng gói xong cho bạn trong chưa đầy một phút.", "get this to go", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("Linh, we're running a little late—let's pick our items quickly!", "Linh ơi, tụi mình hơi muộn rồi—chọn đồ nhanh tay lên nhé!", "Got it! I'll grab this one and meet you at the counter!", "Rõ rồi! Mình lấy món này rồi hẹn gặp bạn ở quầy thanh toán nhé!", "running a little late", ROLE_LINH));
      }
    } else if (situation === "bargain") {
      if (place === "home") {
        out.push(makeItem("Mom, look at this supermarket flyer—strawberries and milk are 30% off!", "Mẹ ơi, nhìn tờ rơi siêu thị này—dâu tây và sữa đang giảm giá 30% kìa!", "Ooh, what a great deal! Let's make a shopping list before we go.", "Ồ, giá hời quá! Mẹ con mình lên danh sách mua sắm trước khi đi nhé.", "30% off / great deal", ROLE_MOM));
      } else {
        out.push(makeItem("Excuse me, is this item included in today's buy-one-get-one-free sale?", "Xin lỗi, mặt hàng này có nằm trong chương trình mua 1 tặng 1 hôm nay không ạ?", "Yes, it is! And if you scan your member card, you save an extra 10%!", "Dạ có đấy ạ! Và nếu quét thẻ thành viên, bạn còn được giảm thêm 10% nữa!", "buy-one-get-one-free", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("Look at the yellow SALE tag, Linh—this family pack is half price!", "Nhìn biển SALE màu vàng kìa Linh—gói gia đình này đang giảm nửa giá luôn!", "Good eye! Let's grab two packs while they're still in stock!", "Tinh mắt thật đấy! Lấy ngay hai gói kẻo hết hàng nhé!", "half price", ROLE_LINH));
      }
    } else if (situation === "sick") {
      if (place === "home") {
        out.push(makeItem("Mom, I'm feeling a little tired and have a slight headache today.", "Mẹ ơi, hôm nay con thấy hơi mệt và hơi nhức đầu một chút.", "Aw, lie down on the sofa and rest, sweetie. I'll bring you warm water.", "Ôi, con nằm nghỉ trên ghế sofa đi. Để mẹ lấy nước ấm cho con uống nhé.", "feeling a little tired", ROLE_MOM));
      } else if (place === "cafe") {
        out.push(makeItem("Excuse me, I'm feeling a bit under the weather—could I get a hot tea with honey or a warm latte, please?", "Xin lỗi, tôi thấy hơi mệt trong người—cho tôi gọi một tách trà nóng pha mật ong hoặc latte ấm được không ạ?", "Of course! I'll make a soothing hot ginger honey tea for you right away—please take a seat.", "Dạ có ngay ạ! Tôi sẽ pha trà gừng mật ong nóng dịu họng cho bạn ngay—mời bạn ngồi nghỉ nhé.", "hot tea with honey", staffRole));
        out.push(makeItem("My throat feels a little sore today—do you have warm chamomile tea with honey?", "Hôm nay cổ họng tôi hơi rát—quán có trà hoa cúc ấm pha mật ong không ạ?", "Yes, we do! I'll serve it nice and warm with extra honey for your throat.", "Dạ có ạ! Tôi sẽ pha ấm vừa uống kèm thêm mật ong cho dịu cổ họng bạn nhé.", "warm chamomile tea", staffRole));
      } else {
        out.push(makeItem("Excuse me, I'm feeling a bit under the weather—do you have warm honey tea or throat drops?", "Xin lỗi, tôi thấy hơi mệt trong người—ở đây có trà mật ong ấm hay kẹo ngậm dịu họng không ạ?", "Of course! Right over here—and please take a seat if you need to rest.", "Dạ có ngay bên này ạ—bạn cứ ngồi nghỉ một lát cho đỡ mệt nhé.", "under the weather", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("Linh, I'm feeling a bit worn out—can we sit down for five minutes?", "Linh ơi, mình thấy hơi đuối sức—tụi mình ngồi nghỉ 5 phút được không?", "Of course! Sit right here and take it easy, I'll carry the bag for you.", "Tất nhiên rồi! Bạn ngồi nghỉ ngay đây đi, để mình xách túi giúp cho.", "take it easy", ROLE_LINH));
      }
    } else if (situation === "weekend") {
      if (place === "home") {
        out.push(makeItem("Happy weekend, Mom! Can we bake cookies or go out together today?", "Cuối tuần vui vẻ nhé mẹ! Hôm nay nhà mình nướng bánh quy hay đi chơi ngoài phố ạ?", "Let's go to the supermarket first and pick up ingredients for a weekend treat!", "Mình đi siêu thị trước để mua nguyên liệu làm món ngon cuối tuần nhé!", "weekend treat", ROLE_MOM));
      } else {
        out.push(makeItem("It's the weekend! What special weekend treats do you recommend here today?", "Cuối tuần rồi! Hôm nay ở đây bạn gợi ý món đặc biệt cuối tuần nào vậy ạ?", "Our weekend specials just came out—everyone loves them!", "Các món đặc biệt cuối tuần của tụi mình vừa ra lò—ai cũng thích mê ạ!", "weekend specials", staffRole));
      }
      if (withLinh) {
        out.push(makeItem("Thank goodness it's the weekend, Linh! Time to unwind and treat ourselves.", "May quá cuối tuần rồi Linh ơi! Đến lúc xả hơi và tự thưởng cho bản thân.", "Yes! Let's pick our favorite treats and enjoy the weekend!", "Chuẩn luôn! Chọn ngay mấy món khoái khẩu và tận hưởng cuối tuần thôi!", "unwind and treat ourselves", ROLE_LINH));
      }
    } else if (situation === "traveler") {
      if (place === "camping" || place === "outdoor") {
        out.push(makeItem("Excuse me, Ranger, I'm visiting this campground for the first time—which trail leads to the main campsite and scenic lookout?", "Xin lỗi chú kiểm lâm, tôi mới đến khu cắm trại này lần đầu—đường mòn nào dẫn tới khu trại chính và đài ngắm cảnh ạ?", "Welcome to Pine Valley! Follow the timber trail markers on your left straight to the main campsite.", "Chào mừng bạn đến Thung lũng Thông! Bạn cứ đi theo biển chỉ dẫn gỗ bên trái là tới thẳng khu trại chính nhé.", "which trail leads to", staffRole));
        out.push(makeItem("Excuse me, could you point me toward the ranger station and the lakeside trailhead?", "Xin lỗi, bạn chỉ giúp tôi hướng về trạm kiểm lâm và đầu đường mòn ven hồ được không?", "Sure! Follow this forest path past the campfire ring—the ranger station is right by the trailhead.", "Được chứ! Bạn đi theo lối mòn rừng này qua vòng lửa trại—trạm kiểm lâm ở ngay đầu đường mòn đấy.", "trailhead / ranger station", staffRole));
      } else {
        out.push(makeItem("Excuse me, I'm visiting this neighborhood—what local specialty should I try?", "Xin lỗi, tôi mới ghé thăm khu này—tôi nên thử đặc sản địa phương nào ở đây ạ?", "Welcome! Everyone loves our local tropical fruits and roasted coffee!", "Chào mừng bạn! Ai đến đây cũng mê trái cây nhiệt đới và cà phê rang xay địa phương ạ!", "local specialty", place === "home" ? ROLE_MOM : staffRole));
        if (place !== "home") {
          out.push(makeItem("Excuse me, could you tell me how to get to the nearest bus stop from here?", "Xin lỗi, bạn chỉ giúp tôi đường ra trạm xe buýt gần nhất từ đây được không?", "Sure! Walk straight out the main entrance and turn right at the corner.", "Được chứ! Bạn đi thẳng ra cổng chính rồi rẽ phải ở góc phố nhé.", "how to get to", ROLE_STRANGER));
        }
      }
    } else if (situation === "lost") {
      if (place === "home") {
        out.push(makeItem("Mom, have you seen my backpack anywhere in the living room?", "Mẹ ơi, mẹ có thấy chiếc ba lô của con ở đâu trong phòng khách không ạ?", "Check beside the sofa or on your study desk, sweetie!", "Con tìm cạnh ghế sofa hoặc trên bàn học xem nhé con yêu!", "have you seen my", ROLE_MOM));
      } else if (place === "school") {
        out.push(makeItem("Excuse me, where's Room 203? I'm a new student and I'm a bit lost in this hallway.", "Xin lỗi cô, Phòng 203 ở đâu ạ? Em là học sinh mới nên hơi bị lạc ở hành lang này.", "Room 203 is just down the hall on the second floor, right next to the library!", "Phòng 203 ở ngay cuối hành lang tầng hai, sát cạnh thư viện nhé em!", "where's Room 203", staffRole));
        out.push(makeItem("Excuse me, teacher, could you point me toward Room 203 and the science lab?", "Thưa cô, cô chỉ đường giúp em tới Phòng 203 và phòng thí nghiệm khoa học được không ạ?", "Of course! Go up the main stairs and turn left—Room 203 is the second door.", "Tất nhiên rồi! Em đi lên cầu thang chính rồi rẽ trái—Phòng 203 là cửa thứ hai nhé.", "point me toward", staffRole));
      } else if (place === "camping" || place === "outdoor") {
        out.push(makeItem("Excuse me, Ranger! I lost track of the trail markers—which way leads back to the main campsite?", "Xin lỗi chú kiểm lâm! Tôi bị lạc dấu đường mòn—đi hướng nào để quay về khu cắm trại chính ạ?", "Stay calm! You're near Marker 4—just follow this ridge trail five minutes south to the campsite.", "Bình tĩnh nhé! Bạn đang ở gần Cọc số 4—chỉ cần đi theo đường mòn sườn đồi này 5 phút về hướng nam là tới trại.", "back to the campsite", staffRole));
      } else {
        out.push(makeItem("Excuse me! I think I dropped my wallet near the aisle—has anyone turned it in at the counter?", "Xin lỗi! Hình như tôi làm rơi ví gần dãy kệ—có ai nhặt được gửi lại quầy chưa ạ?", "Let me check our Customer Service lost-and-found box right away for you!", "Để tôi kiểm tra ngay hộp đồ thất lạc tại quầy Dịch vụ Khách hàng giúp bạn nhé!", "turned it in", staffRole));
      }
    } else {
      /* normal */
      if (withLinh) {
        out.push(makeItem("Hey Linh, what else should we check out while we're here?", "Này Linh, nhân tiện đang ở đây tụi mình nên xem thêm món gì nhỉ?", "Let's look around this section first—there are so many cool things!", "Mình dạo quanh khu này trước đi—có bao nhiêu món hay ho kìa!", "check out", ROLE_LINH));
      }
    }
    return out;
  }

  /* ---------- Synthesize Lead Phrase Matching Place/Zone + Weather + Situation Simultaneously ---------- */
  function buildCombinedPhrases(place, zone, weather, situation, comp, staffRole, reqListener) {
    const out = [];
    const meta = { place, zone, weather, situation, companion: comp.mode };
    const add = (en, vi, replyEn, replyVi, chunk, role) => {
      out.push(makeItem(en, vi, replyEn, replyVi, chunk, role, meta));
    };

    /* Curated 5-factor lead sentences that simultaneously reflect place/zone + weather + situation */
    if (place === "market" && zone === "market" && weather === "sunny" && situation === "normal") {
      add(
        "Good morning! It's such a bright sunny day—could I grab a sanitized shopping cart right here at the market entrance?",
        "Chào buổi sáng! Hôm nay trời nắng đẹp quá—tôi lấy một chiếc xe đẩy đã khử khuẩn ngay lối vào siêu thị được không ạ?",
        "Of course! All these carts at the entrance are sanitized—enjoy your shopping this sunny morning!",
        "Dạ được chứ ạ! Tất cả xe đẩy ở lối vào đều đã khử khuẩn—chúc bạn mua sắm vui vẻ trong sáng nắng đẹp này nhé!",
        "grab a shopping cart",
        staffRole
      );
    } else if (place === "market" && zone === "market_produce" && weather === "hot" && situation === "bargain") {
      add(
        "Excuse me, it's scorching hot today—are these chilled watermelons and organic apples in the produce section on sale?",
        "Xin lỗi, hôm nay trời nóng bức quá—dưa hấu ướp lạnh và táo hữu cơ ở quầy rau quả có đang giảm giá không ạ?",
        "Yes! Chilled watermelon slices and organic apples in produce are 30% off for today's hot-weather bargain!",
        "Dạ có! Dưa hấu cắt miếng ướp lạnh và táo hữu cơ ở quầy rau quả đang giảm 30% trong đợt sale giải nhiệt hôm nay ạ!",
        "on sale / 30% off",
        staffRole
      );
      if (comp.withLinh) {
        add(
          "Linh, it's so hot today—look at the yellow SALE tag on these sweet watermelons in the produce aisle!",
          "Linh ơi, hôm nay trời nóng quá—nhìn biển SALE màu vàng trên quầy dưa hấu ngọt mát ở khu rau quả kìa!",
          "What a bargain! Let's grab two packs of chilled fruit while they're half price!",
          "Giá hời quá! Tụi mình lấy ngay hai khay trái cây mát lạnh nhân lúc đang giảm nửa giá đi!",
          "yellow SALE tag",
          ROLE_LINH
        );
      }
    } else if (place === "market" && zone === "market_dairy" && weather === "cold" && situation === "normal") {
      add(
        "It's chilly outside today—which carton of whole milk in this dairy cooler is freshest for making warm milk at home?",
        "Hôm nay ngoài trời se lạnh—hộp sữa tươi nguyên kem nào trong tủ mát bơ sữa này mới nhất để về hâm nóng uống ạ?",
        "Check the whole milk cartons on the middle dairy shelf—they arrived this morning and are great for warming up!",
        "Bạn lấy các hộp sữa nguyên kem ở ngăn giữa tủ mát nhé—sữa vừa về sáng nay, hâm nóng uống lúc trời lạnh là tuyệt nhất!",
        "dairy cooler / warm milk",
        staffRole
      );
    } else if (place === "market" && zone === "market_meat" && weather === "rainy" && situation === "weekend") {
      add(
        "Since it's a rainy weekend, which cut of beef at the butcher counter do you recommend for a cozy weekend stew?",
        "Vì là cuối tuần trời mưa, ở quầy thịt này anh khuyên nên chọn phần thịt bò nào để nấu món hầm cuối tuần ấm cúng ạ?",
        "Our tender chuck roast and fresh salmon at the meat counter are perfect for a rainy weekend dinner!",
        "Thịt bò thăn vai mềm và cá hồi tươi ở quầy thịt của tụi mình cực kỳ hợp cho bữa tối cuối tuần ngày mưa đấy ạ!",
        "rainy weekend stew",
        staffRole
      );
    } else if (place === "market" && zone === "market_checkout" && weather === "sunny" && situation === "rush") {
      add(
        "Excuse me, I'm in a rush on this sunny morning—can I pay by contactless card at this express self-checkout lane?",
        "Xin lỗi, sáng nắng đẹp hôm nay tôi đang hơi vội—tôi thanh toán bằng thẻ chạm ở quầy tự thanh toán nhanh này được không ạ?",
        "Yes, right this way! Just tap your contactless card on the express checkout terminal and enjoy the sunny day!",
        "Dạ mời đi lối này! Bạn chỉ cần chạm thẻ lên máy ở quầy thanh toán nhanh và chúc bạn ngày nắng đẹp vui vẻ nhé!",
        "express self-checkout",
        staffRole
      );
    } else if (place === "cafe" && weather === "cold" && situation === "sick") {
      add(
        "It's so cold outside and I'm feeling a bit under the weather—could I get a hot tea with honey or a warm latte at the café counter, please?",
        "Ngoài trời lạnh quá mà tôi lại đang hơi mệt—cho tôi gọi một tách trà nóng mật ong hoặc latte ấm tại quầy cà phê được không ạ?",
        "Of course! I'll steam a soothing hot honey tea and warm oat latte for you right away—please take a warm seat.",
        "Dạ được ngay ạ! Tôi sẽ pha một tách trà mật ong nóng dịu họng và latte ấm cho bạn ngay—mời bạn ngồi chỗ ấm nhé.",
        "hot tea with honey",
        staffRole
      );
    } else if (place === "park" && weather === "hot" && situation === "weekend" && (comp.withPet || reqListener === "pet")) {
      add(
        "It's a hot weekend at the park, Milo—let's rest in the shade by the park fountain and drink some cool water!",
        "Cuối tuần trời nóng ở công viên quá Milo ơi—mình vào bóng râm cạnh đài phun nước công viên nghỉ và uống nước mát nhé!",
        "Woof! Woof! *trots into the shady park grass by the fountain and drinks cool water happily* 💧🐾",
        "Gâu! Gâu! *chạy lon ton vào bãi cỏ râm mát cạnh đài phun nước và uống nước mát ngon lành* 💧🐾",
        "in the shade",
        ROLE_PET
      );
    } else if (place === "home" && zone === "living" && weather === "sunny" && situation === "normal") {
      add(
        "What a lovely sunny day, Mom! Can I open the living room curtains and tidy up the sofa?",
        "Hôm nay trời nắng đẹp quá mẹ ơi! Con mở rèm phòng khách và dọn ghế sofa cho gọn nhé?",
        "Sure, sweetie! Let the fresh sunshine into the living room.",
        "Ừ con mở đi! Cho ánh nắng tươi mới tràn vào phòng khách nhé.",
        "living room curtains",
        ROLE_MOM
      );
    } else if (place === "home" && zone === "kitchen" && weather === "rainy" && situation === "rush") {
      add(
        "Mom, it's raining outside and I'm in a rush—I'll grab a quick slice of warm toast in the kitchen before I head out!",
        "Mẹ ơi, ngoài trời đang mưa mà con lại đang vội—con lấy nhanh lát bánh mì nướng ấm trong bếp rồi đi ngay nhé!",
        "Okay sweetie, take warm toast from the kitchen counter and don't forget your umbrella in the rain!",
        "Ừ con yêu, cầm bánh mì nướng ấm trên quầy bếp và đừng quên mang ô đi dưới trời mưa nhé!",
        "in a rush",
        ROLE_MOM
      );
    } else if (place === "restaurant" && weather === "windy" && situation === "weekend" && (comp.withLinh || reqListener === "linh")) {
      add(
        "It's so windy outside this weekend, Linh—I'm glad we got a cozy window table inside this restaurant!",
        "Cuối tuần này ngoài trời gió mạnh quá Linh ơi—may mà tụi mình đặt được bàn cạnh cửa sổ ấm cúng trong nhà hàng này!",
        "Me too! Let's check the weekend restaurant menu and order hot pasta together!",
        "Mình cũng thấy vậy! Cùng xem thực đơn cuối tuần của nhà hàng rồi gọi mì Ý nóng hổi ăn nhé!",
        "cozy window table",
        ROLE_LINH
      );
    } else if (place === "school" && situation === "lost") {
      add(
        `Excuse me, where's Room 203? I'm a bit lost in the school hallway this ${weather} morning.`,
        `Xin lỗi cô, Phòng 203 ở đâu ạ? Sáng hôm nay trời ${weather === "sunny" ? "nắng đẹp" : "se lạnh"} mà em lại hơi bị lạc ở hành lang trường.`,
        "Room 203 is right down this second-floor hallway, just past the school library!",
        "Phòng 203 ở ngay cuối hành lang tầng hai này, đi qua thư viện trường một chút là tới nhé em!",
        "where's Room 203",
        staffRole
      );
    } else if ((place === "camping" || place === "outdoor") && situation === "traveler") {
      add(
        `Excuse me, Ranger, I'm visiting this campground for the first time and it's quite ${weather}—which trail leads safely to the sheltered campsite?`,
        `Xin lỗi chú kiểm lâm, tôi mới đến khu cắm trại này lần đầu mà trời đang khá ${weather === "windy" ? "nhiều gió" : "lạnh"}—đường mòn nào dẫn an toàn tới khu trại kín gió ạ?`,
        "Welcome! Take the Pine Ridge Trail on the left—it's sheltered from the wind and leads straight to the main campsite!",
        "Chào mừng bạn! Hãy đi theo đường mòn Đồi Thông bên trái—lối đó kín gió và dẫn thẳng tới khu cắm trại chính đấy!",
        "trail to the campsite",
        staffRole
      );
    }

    return out;
  }

  /* ---------- Weather & Situation Contradiction Filter ---------- */
  function isContradictoryPhrase(item, place, zone, weather, situation) {
    const text = String((item && item.en) || "") + " " + String((item && item.replyEn) || "");
    const enOnly = String((item && item.en) || "");

    /* Rule A: When weather is COLD or situation is SICK, never suggest iced/cold/frozen drinks or treats */
    if (weather === "cold" || situation === "sick") {
      if (/\b(iced|ice cream|ice water|chilled|cold drink|cold water|less ice|frozen|smoothie|popsicle|boiling hot|scorching hot)\b/i.test(enOnly)) {
        return true;
      }
    }
    /* Rule B: When weather is HOT, never suggest hot soup, hot cocoa, hot tea, warm milk, or chilly/freezing phrases */
    if (weather === "hot") {
      if (/\b(hot soup|hot cocoa|hot chocolate|hot tea|warm tea|warm milk|warm water|warm latte|warm oat latte|hot ginger|steaming cup|chilly|freezing)\b/i.test(enOnly)) {
        return true;
      }
    }
    /* Rule C: When weather is SUNNY, exclude phrases claiming it is raining or freezing */
    if (weather === "sunny") {
      if (/\b(raining|rainy|umbrella|chilly|freezing|boiling hot|scorching hot)\b/i.test(enOnly)) {
        return true;
      }
    }
    /* Rule D: When weather is RAINY, exclude phrases claiming it is sunny or scorching hot */
    if (weather === "rainy") {
      if (/\b(sunny morning|bright sunny|gorgeous sunny|scorching hot|boiling hot)\b/i.test(enOnly)) {
        return true;
      }
    }
    /* Rule E: At camping / outdoor, never suggest urban bus stops or subways */
    if (place === "camping" || place === "outdoor") {
      if (/\b(bus stop|subway|elevator|escalator|supermarket flyer|checkout register)\b/i.test(text)) {
        return true;
      }
    }
    /* Rule F: When situation is LOST, exclude unrelated classroom grammar / borrowing books / casual menu browsing */
    if (situation === "lost") {
      if (/\b(grammar rule|borrow this English storybook|having for dinner|chef's special|tidy up the living room)\b/i.test(enOnly)) {
        return true;
      }
    }
    /* Rule G: In places/zones without chairs, seats, or tables (e.g. supermarket zones, garage, bathroom),
       never suggest phrases about seats, sitting down, or tables */
    const noSeatingPlace = place === "market" || /^market/.test(zone) || zone === "garage" || zone === "bathroom";
    if (noSeatingPlace) {
      if (/\b(is this seat taken|seat taken|take a seat|grab a seat|find a seat|window seat|sit down|sit by the window|table for two|grab a table|clean the table|at this table)\b/i.test(text)) {
        return true;
      }
    }
    return false;
  }

  /* =====================================================================
   * PURE FUNCTION: pickPhrases(ctx)
   * Selects contextual phrases based on 5 factors:
   *   (i)   place & zone (room / area / zone)
   *   (ii)  weather (sunny, rainy, cold, windy, hot)
   *   (iii) situation (normal, rush, weekend, sick, bargain, traveler, lost)
   *   (iv)  companion (alone, linh, pet, family)
   *   (v)   listener (staff, Linh, Mom, pet, stranger, or auto)
   * ===================================================================== */
  function pickPhrases(ctx) {
    ctx = ctx || {};
    const pz = normalizePlaceAndZone(ctx);
    const place = pz.place;
    const zone = pz.zone;
    const weather = normalizeWeather(ctx.weather);
    const situation = normalizeSituation(ctx.situation || ctx.sit || ctx.scenario);
    const comp = normalizeCompanions(ctx);
    const reqListener = ctx.listener ? String(ctx.listener).toLowerCase().trim() : "auto";

    /* Determine the correct staff/local role for this place & zone */
    const staffRole = STAFF_BY_ZONE[zone] || STAFF_BY_ZONE[place] || STAFF_BY_ZONE.market;

    const candidates = [];

    /* 0. Synthesized Top-Priority Combined Phrases (place/zone + weather + situation) */
    buildCombinedPhrases(place, zone, weather, situation, comp, staffRole, reqListener).forEach(item => {
      candidates.push(item);
    });

    /* 1. Situation phrases (high priority when in special situations like sick, lost, rush, bargain, traveler, weekend) */
    buildSituationPhrases(situation, place, zone, staffRole, comp.withLinh).forEach(item => {
      candidates.push(Object.assign(item, { place, zone, weather, situation, companion: comp.mode }));
    });

    /* 2. Weather phrases */
    buildWeatherPhrases(weather, place, zone, staffRole, comp.withLinh).forEach(item => {
      candidates.push(Object.assign(item, { place, zone, weather, situation, companion: comp.mode }));
    });

    /* 3. Pet phrases ONLY if withPet is true */
    if (comp.withPet) {
      PET_PHRASE_BANK.forEach(p => {
        candidates.push(makeItem(p.en, p.vi, p.replyEn, p.replyVi, p.chunk, ROLE_PET, {
          place, zone, weather, situation, companion: comp.mode
        }));
      });
    }

    /* 4. Place & Zone specific phrases (Mom at home, Staff outside home) */
    const zoneList = ZONE_STAFF_PHRASES[zone] || ZONE_STAFF_PHRASES[place] || ZONE_STAFF_PHRASES.market;
    const primaryRole = place === "home" ? ROLE_MOM : staffRole;
    zoneList.forEach(p => {
      candidates.push(makeItem(p.en, p.vi, p.replyEn, p.replyVi, p.chunk, primaryRole, {
        place, zone, weather, situation, companion: comp.mode
      }));
    });

    /* 5. Stranger phrases when outside home (adapted to camping, market, or seating places) */
    if (place !== "home") {
      if (place === "camping" || place === "outdoor") {
        candidates.push(makeItem(
          "Excuse me, Ranger, could you tell me which hiking trail leads to the Pine Ridge campsite?",
          "Xin lỗi chú kiểm lâm, chú chỉ giúp tôi đường mòn nào dẫn tới khu cắm trại Đồi Thông được không ạ?",
          "Sure! Follow the Pine Ridge trail markers just past the wooden bridge—the campsite is ten minutes ahead.",
          "Được chứ! Bạn đi theo biển chỉ đường Đồi Thông ngay qua cây cầu gỗ—khu cắm trại ở phía trước 10 phút đi bộ nhé.",
          "which hiking trail",
          staffRole,
          { place, zone, weather, situation, companion: comp.mode }
        ));
      } else if (place === "market" || /^market/.test(zone)) {
        candidates.push(makeItem(
          "Excuse me, could I squeeze past your cart to reach that shelf, please?",
          "Xin lỗi, cho tôi lách qua xe đẩy của bạn một chút để lấy đồ trên kệ nhé?",
          "Oh, sorry about that! Go right ahead, I'll move my cart over.",
          "Ồ, xin lỗi bạn nhé! Bạn cứ tự nhiên lấy đi, để tôi dịch xe đẩy sang một bên.",
          "squeeze past your cart",
          ROLE_STRANGER,
          { place, zone, weather, situation, companion: comp.mode }
        ));
      } else {
        candidates.push(makeItem(
          "Excuse me, is this seat taken, or do you mind if I stand here?",
          "Xin lỗi, chỗ này có ai ngồi chưa, hay bạn có phiền nếu tôi đứng đây không?",
          "Not at all! Go right ahead, nobody is using it.",
          "Không phiền chút nào! Bạn cứ tự nhiên nhé, chưa có ai dùng đâu.",
          "do you mind if",
          ROLE_STRANGER,
          { place, zone, weather, situation, companion: comp.mode }
        ));
      }
    }

    /* 6. Strict 5-Factor Filtering, Weather/Situation Exclusion & Safety Invariants */
    let filtered = candidates.filter(item => {
      /* Invariant 1: NEVER allow Mom outside home */
      if (place !== "home" && (item.listener === "Mom" || /Mom/i.test(item.who) || /Mom/i.test(item.responder))) {
        return false;
      }
      /* Invariant 2: NEVER allow Linh if not withLinh (e.g., when alone or only with pet) */
      if (!comp.withLinh && (item.listener === "Linh" || /Linh/i.test(item.who) || /Linh/i.test(item.responder))) {
        return false;
      }
      /* Invariant 3: NEVER allow pet phrases if not withPet */
      if (!comp.withPet && (item.listener === "pet" || /Milo/i.test(item.who) || /Milo/i.test(item.responder))) {
        return false;
      }
      /* Invariant 4: Exclude phrases contradicting weather, situation, or place */
      if (isContradictoryPhrase(item, place, zone, weather, situation)) {
        return false;
      }
      return true;
    });

    /* 7. Filter by explicit listener if requested and valid in current context */
    if (reqListener && reqListener !== "auto" && reqListener !== "all") {
      /* At camping, asking directions/trails goes to the Park Ranger (staff) even if 'stranger' was requested */
      const effectiveListener = (place === "camping" || place === "outdoor") && reqListener === "stranger" ? "staff" : reqListener;
      const byListener = filtered.filter(item => item.listener.toLowerCase() === effectiveListener);
      if (byListener.length > 0) {
        filtered = byListener;
      }
    }

    /* 8. Ensure balanced ordering:
     *    - Keep the combined (place/zone + weather + situation) lead phrase FIRST (result[0])
     *    - If withPet, ensure "Good boy, Milo! Stay close." appears right after the lead phrase
     *    - If withLinh, ensure Linh phrases appear right after the lead phrase
     *    - Deduplicate by English sentence */
    const seen = new Set();
    const result = [];

    if (filtered.length > 0) {
      seen.add(filtered[0].en);
      result.push(filtered[0]);
    }

    /* If withPet, ensure at least 1-2 pet phrases appear prominently */
    if (comp.withPet) {
      filtered.filter(x => x.listener === "pet").slice(0, 2).forEach(x => {
        if (!seen.has(x.en)) { seen.add(x.en); result.push(x); }
      });
    }
    /* If withLinh, ensure at least 2 Linh phrases appear */
    if (comp.withLinh) {
      filtered.filter(x => x.listener === "Linh").slice(0, 2).forEach(x => {
        if (!seen.has(x.en)) { seen.add(x.en); result.push(x); }
      });
    }
    /* Add remaining matching phrases (staff / Mom / weather / situation) */
    filtered.forEach(x => {
      if (!seen.has(x.en)) { seen.add(x.en); result.push(x); }
    });

    return result.slice(0, 8);
  }

  const CSS = `
/* =====================================================================
   ELW_CONTEXT (.ctx-) Styles — Collapsible Context Bar & Small-Talk Card
   ===================================================================== */
.ctx-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1.5px solid #cbd5e1;
  border-radius: 14px;
  padding: 6px 10px;
  margin-bottom: 6px;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
  font-family: system-ui, -apple-system, sans-serif;
  box-sizing: border-box;
}
.ctx-bar.is-collapsed {
  max-height: 44px !important;
  min-height: 34px !important;
  padding: 4px 8px !important;
  margin-bottom: 4px !important;
  overflow: hidden !important;
  justify-content: center;
}
.ctx-bar.is-collapsed .ctx-groups {
  display: none !important;
}
.ctx-summary-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 28px !important;
  max-height: 34px !important;
  padding: 2px 6px !important;
  border: 0;
  background: transparent;
  color: #1e293b;
  font: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}
.ctx-summary-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}
.ctx-summary-caret {
  flex: 0 0 auto;
  font-size: 11.5px;
  font-weight: 700;
  color: #ea580c;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 999px;
  padding: 1px 8px;
}
.ctx-groups {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-top: 4px;
  border-top: 1px dashed #e2e8f0;
}
.ctx-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ctx-lbl {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1.2;
  white-space: nowrap;
}
.ctx-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.ctx-tick-pill {
  user-select: none;
  position: relative;
}
.ctx-tick-input {
  width: 14px;
  height: 14px;
  margin: 0 2px 0 0;
  accent-color: #ea580c;
  cursor: pointer;
  flex-shrink: 0;
}
.ctx-linh-pill .ctx-tick-input {
  accent-color: #10b981;
}
.ctx-linh-mission-hint {
  margin: 6px 0;
  padding: 6px 10px;
  border-radius: 10px;
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  font-size: 12.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.ctx-linh-mission-hint button {
  border: 1px solid #10b981;
  background: #10b981;
  color: #fff;
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
@media (max-width: 760px) {
  .ctx-bar {
    padding: 5px 8px;
    gap: 5px;
    margin-bottom: 4px;
    border-radius: 12px;
  }
  .ctx-bar.is-collapsed {
    max-height: 40px !important;
    min-height: 32px !important;
    padding: 3px 8px !important;
  }
  .ctx-summary-btn {
    font-size: 12px;
    min-height: 26px !important;
    max-height: 32px !important;
  }
  .ctx-row {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;
  }
  .ctx-row.ctx-ctx-row {
    flex-wrap: wrap !important;
    overflow-x: visible !important;
    gap: 5px !important;
  }
  .ctx-row::-webkit-scrollbar {
    display: none;
  }
  .ctx-pill {
    padding: 4px 8px !important;
    font-size: 11.5px !important;
    min-height: 28px !important;
    flex-shrink: 0;
  }
  .ctx-tick-input {
    width: 13px;
    height: 13px;
  }
}
.ctx-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s ease;
  white-space: nowrap;
}
.ctx-pill:hover {
  border-color: #94a3b8;
  transform: translateY(-1px);
}
.ctx-pill.on {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border-color: #ea580c;
  color: #9a3412;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.18);
}
.ctx-pill.ctx-dog-pill.on {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #d97706;
  color: #92400e;
}
.ctx-pill.ctx-linh-pill.on {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #10b981;
  color: #065f46;
}
.ctx-pill.ctx-wx-pill.on {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #2563eb;
  color: #1e40af;
}
.ctx-pro-tag {
  font-size: 9.5px;
  font-weight: 800;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  padding: 1px 5px;
  border-radius: 6px;
  margin-left: 2px;
}

/* Contextual Small-Talk & Phrase Card (#ctxTalkCard) */
#ctxTalkCard {
  background: #fffdf9;
  border: 1.5px solid #fed7aa;
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 4px 16px rgba(234, 88, 12, 0.08);
}
.ctx-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.ctx-card-hd h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
}
.ctx-active-badges {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.ctx-abadge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}
.ctx-plist {
  display: grid;
  gap: 7px;
}
.ctx-pitem {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 11px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: all 0.16s ease;
}
.ctx-pitem:hover {
  border-color: #f97316;
  background: #fffaf5;
  transform: translateX(2px);
}
.ctx-pitem.done {
  border-color: #86efac;
  background: #f0fdf4;
}
.ctx-pitem-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.ctx-pen {
  font-size: 13.5px;
  font-weight: 800;
  color: #0f172a;
}
.ctx-pvi {
  font-size: 12px;
  color: #64748b;
}
.ctx-pchunk {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 700;
  color: #c2410c;
  background: #ffedd5;
  padding: 1px 7px;
  border-radius: 999px;
}
`;

  function injectCss() {
    if (typeof document === "undefined") return;
    if (document.getElementById("ctx-engine-css")) return;
    const st = document.createElement("style");
    st.id = "ctx-engine-css";
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* =====================================================================
   * SIDE CHARACTERS 2-TICK CONTROLLER & TEARDOWN API
   *   1. "surprise" ("Nhân vật phụ bất ngờ") — default ON (true)
   *   2. "linh" ("Đi cùng Linh") — default OFF (false)
   * ===================================================================== */
  const ctxReplyTimers = new Set();
  let ctxReplyAbortSeq = 0;

  function clearCtxReplyTimers() {
    ctxReplyAbortSeq++;
    ctxReplyTimers.forEach(id => clearTimeout(id));
    ctxReplyTimers.clear();
  }

  function isLinhRole(role) {
    const r = String(role || "").toLowerCase().trim();
    return r === "linh" || r === "friend" || r === "companion" || r === "#lt-friend" || r === "npc:linh";
  }

  function isSideCharacterEnabled(role) {
    if (!S.sideChars || typeof S.sideChars !== "object") {
      S.sideChars = { surprise: true, linh: false };
    }
    const r = String(role == null ? "surprise" : role).toLowerCase().trim();
    if (r === "dog" || r === "ctx-dog" || r === "#ctx-dog") return false;
    if (r === "pet" || r === "milo" || r === "milu" || r === "#o-cat") return true;
    if (isLinhRole(r)) return !!S.sideChars.linh;
    return S.sideChars.surprise !== false;
  }

  function teardownSideCharacter(role) {
    const r = String(role == null ? "all" : role).toLowerCase().trim();
    const targetLinh = isLinhRole(r);
    const targetAll = r === "all" || r === "*";
    const targetSurprise = targetAll || !targetLinh;

    clearCtxReplyTimers();

    try {
      if (typeof root.speechStop === "function") root.speechStop();
      if (root.ELW_TTS_ROUTER && typeof root.ELW_TTS_ROUTER.stop === "function") root.ELW_TTS_ROUTER.stop();
      if (root.speechSynthesis && typeof root.speechSynthesis.cancel === "function") {
        root.speechSynthesis.cancel();
      }
    } catch (e) {}

    if (typeof document !== "undefined") {
      Array.prototype.slice.call(document.querySelectorAll("#ctx-dog")).forEach(el => el.remove());
    }

    if (targetSurprise) {
      try { if (root.ELW_LIFE && typeof root.ELW_LIFE.teardown === "function") root.ELW_LIFE.teardown(targetAll ? "all" : "surprise"); } catch (e) {}
      try { if (root.ELW_EVENTS && typeof root.ELW_EVENTS.teardown === "function") root.ELW_EVENTS.teardown(r); } catch (e) {}
      try { if (root.ELW_NPCS && typeof root.ELW_NPCS.teardown === "function") root.ELW_NPCS.teardown(targetAll ? "all" : "surprise"); } catch (e) {}
      try { if (root.ELW_ROLEPLAY && typeof root.ELW_ROLEPLAY.teardown === "function") root.ELW_ROLEPLAY.teardown(r); } catch (e) {}
      try { if (typeof root.renderPeople === "function") root.renderPeople(); } catch (e) {}
      try {
        if (root.ELW_UI_SCENE && typeof root.ELW_UI_SCENE.clear === "function") {
          ["npc:mom", "npc:dad", "npc:grandma", "npc:grandpa", "npc:tom", "npc:lily", "npc:baby", "npc:neighbor", "npc:mailman",
           "obj:barista", "obj:checkout", "obj:icecreamcart", "obj:waiter", "obj:kitchenpass", "obj:rangerpost", "obj:lakedock",
           "obj:teacherdesk", "obj:bookshelf", "obj:diningtable"].forEach(a => {
            try { root.ELW_UI_SCENE.clear(a); } catch (e) {}
          });
        }
      } catch (e) {}
      if (typeof document !== "undefined") {
        Array.prototype.slice.call(document.querySelectorAll("#world .npc, #lt-visitor, .lt-visitor")).forEach(el => el.remove());
        const rpCard = document.getElementById("rpCard");
        if (rpCard) { rpCard.innerHTML = ""; rpCard.hidden = true; }
        const dlgBox = document.getElementById("dlgBox");
        if (dlgBox) dlgBox.innerHTML = "";
        const sbBubbles = document.querySelectorAll("#sb-layer .sb-bubble:not(.sb-char)");
        Array.prototype.slice.call(sbBubbles).forEach(b => {
          const txt = b.textContent || "";
          if (targetAll || txt.indexOf("Linh") < 0) b.remove();
        });
      }
    }

    if (targetAll || targetLinh) {
      try { if (root.ELW_LIFE && typeof root.ELW_LIFE.teardown === "function") root.ELW_LIFE.teardown("linh"); } catch (e) {}
      try { if (root.ELW_NPCS && typeof root.ELW_NPCS.teardown === "function") root.ELW_NPCS.teardown("linh"); } catch (e) {}
      try {
        if (root.ELW_UI_SCENE && typeof root.ELW_UI_SCENE.clear === "function") {
          root.ELW_UI_SCENE.clear("npc:linh");
          root.ELW_UI_SCENE.clear("npc:friend");
          root.ELW_UI_SCENE.clear("#lt-friend");
        }
      } catch (e) {}
      if (typeof document !== "undefined") {
        Array.prototype.slice.call(document.querySelectorAll("#lt-friend, .lt-friend, #world .npc[data-npc='friend']")).forEach(el => el.remove());
        const sbBubbles = document.querySelectorAll("#sb-layer .sb-bubble:not(.sb-char)");
        Array.prototype.slice.call(sbBubbles).forEach(b => {
          if ((b.textContent || "").indexOf("Linh") >= 0) b.remove();
        });
      }
    }
    return true;
  }

  let _updatingSideChar = false;
  function setSideCharacterEnabled(role, enabled, opts) {
    opts = opts || {};
    if (!S.sideChars || typeof S.sideChars !== "object") {
      S.sideChars = { surprise: true, linh: false };
    }
    const on = !!enabled;
    const isLinh = isLinhRole(role);
    if (isLinh) {
      S.sideChars.linh = on;
    } else {
      S.sideChars.surprise = on;
    }
    save();

    if (!_updatingSideChar) {
      _updatingSideChar = true;
      try {
        if (isLinh) {
          if (!opts.fromLife && root.ELW_LIFE && typeof root.ELW_LIFE.setCompanion === "function") {
            root.ELW_LIFE.setCompanion(on, { fromContext: true, silent: !!opts.silent });
          }
          if (!on) {
            teardownSideCharacter("linh");
          } else {
            try { if (typeof root.renderPeople === "function") root.renderPeople(); } catch (e) {}
          }
          try { if (typeof root.syncFriendBtn === "function") root.syncFriendBtn(); } catch (e) {}
          try { if (root.ELW_UI_COMPANION && typeof root.ELW_UI_COMPANION.syncButton === "function") root.ELW_UI_COMPANION.syncButton(); } catch (e) {}
          updateMissionLinhHint();
        } else {
          if (root.ELW_LIFE && typeof root.ELW_LIFE.config === "function") {
            root.ELW_LIFE.config({ visitors: on });
          }
          if (!on) {
            teardownSideCharacter("surprise");
          } else {
            try { if (typeof root.renderPeople === "function") root.renderPeople(); } catch (e) {}
            try { if (root.ELW_EVENTS && typeof root.ELW_EVENTS.tick === "function") root.ELW_EVENTS.tick(); } catch (e) {}
          }
        }
      } finally {
        _updatingSideChar = false;
      }
    }

    renderContextBar();
    renderTalkCard();
    return isLinh ? S.sideChars.linh : S.sideChars.surprise;
  }

  function isProUnlocked() {
    try { return !!(root.ELW_PREMIUM && root.ELW_PREMIUM.isPro && root.ELW_PREMIUM.isPro()); } catch (e) { return false; }
  }

  function getW() {
    try { return root.ELW && root.ELW.state ? root.ELW.state() : { x: 520, y: 460, room: "living" }; } catch (e) { return { x: 520, y: 460, room: "living" }; }
  }

  /* Resolve effective room/zone: respects active topic tab and pending go_* transitions immediately */
  function getEffectiveRoom() {
    const rm = (getW() && getW().room) || "living";
    /* Check if there is a pending/running go_<room> transition in the queue */
    try {
      if (root.ELW && typeof root.ELW.queue === "function") {
        const q = root.ELW.queue() || [];
        for (let i = q.length - 1; i >= 0; i--) {
          const it = q[i];
          if (it && (it.status === "pending" || it.status === "running") && /^go_/.test(it.id)) {
            const target = it.id === "go_home" ? "living" : it.id.slice(3);
            if (target) return target;
          }
        }
      }
    } catch (e) {}
    if (HOME_ROOMS.indexOf(rm) < 0 && rm !== "home") return rm;
    try {
      if (typeof document !== "undefined") {
        const activeRoomBtn = document.querySelector("#roomTabs button.on[data-room], #roomTabs button.active[data-room]");
        const tabRoom = activeRoomBtn && activeRoomBtn.getAttribute("data-room");
        if (tabRoom && HOME_ROOMS.indexOf(tabRoom) < 0) return tabRoom;
        const outdoorTabs = document.querySelector('#roomTabs[data-topic-mode="outdoor"] button[data-room]');
        if (outdoorTabs) {
          const rAttr = outdoorTabs.getAttribute("data-room");
          if (rAttr && HOME_ROOMS.indexOf(rAttr) < 0) return rAttr;
        }
      }
    } catch (e) {}
    return rm;
  }

  function isHomeRoom(r) {
    const rm = r || getEffectiveRoom();
    return HOME_ROOMS.indexOf(rm) >= 0 || rm === "home";
  }

  function curWx() {
    try { return (root.ELW_LIFE && root.ELW_LIFE.weather) ? root.ELW_LIFE.weather() : "sunny"; } catch (e) { return "sunny"; }
  }

  function getLiveContext() {
    const rm = getEffectiveRoom();
    const homeMode = HOME_ROOMS.indexOf(rm) >= 0 || rm === "home";
    const linhOn = !homeMode && isSideCharacterEnabled("linh") && !!(root.ELW_LIFE && root.ELW_LIFE.companionOn && root.ELW_LIFE.companionOn());
    return {
      room: rm,
      zone: rm,
      weather: curWx(),
      situation: S.sit || "normal",
      withLinh: linhOn,
      withPet: !!S.walkDog,
      withFamily: homeMode && isSideCharacterEnabled("surprise")
    };
  }

  function resolveContextualWho(phraseOrWho) {
    const activePet = (root.ELW_PET_NEEDS && root.ELW_PET_NEEDS.getActivePet)
      ? root.ELW_PET_NEEDS.getActivePet()
      : { id: "milu", name: "Milu", icon: "🐕" };
    if (phraseOrWho && typeof phraseOrWho === "object") {
      const friendVisible = typeof document !== "undefined" && !!(isSideCharacterEnabled("linh") && root.ELW_LIFE && root.ELW_LIFE.companionOn && root.ELW_LIFE.companionOn() && document.getElementById("lt-friend"));
      const anchor = phraseOrWho.listener === "pet" ? "#o-cat" : (phraseOrWho.listener === "Linh" && friendVisible ? "#lt-friend" : "char");
      const isPetResponder = phraseOrWho.listener === "pet" || String(phraseOrWho.responder || "").indexOf("Milo") >= 0;
      return {
        name: isPetResponder ? (activePet.name || "Milu") : (phraseOrWho.responder || "Staff"),
        label: isPetResponder ? `${activePet.name || "Milu"} ${activePet.icon || "🐕"}` : (phraseOrWho.who || phraseOrWho.responder || "Staff 💁"),
        icon: isPetResponder ? (activePet.icon || "🐕") : (phraseOrWho.icon || "💁"),
        voice: phraseOrWho.voice || "adult_female",
        anchor: anchor
      };
    }
    const rawWho = String(phraseOrWho || "");
    if (rawWho.indexOf("Milo") >= 0) return { name: activePet.name || "Milu", label: `${activePet.name || "Milu"} ${activePet.icon || "🐕"}`, icon: activePet.icon || "🐕", voice: "child", anchor: "#o-cat" };
    const rm = getEffectiveRoom();
    if (HOME_ROOMS.indexOf(rm) >= 0 || rm === "home") {
      return { name: "Mom", label: "Mom 👩", icon: "👩", voice: "mom", anchor: "char" };
    }
    const pz = normalizePlaceAndZone({ room: rm, zone: rm });
    const staff = STAFF_BY_ZONE[pz.zone] || STAFF_BY_ZONE[pz.place] || STAFF_BY_ZONE.market;
    return {
      name: staff.responder,
      label: staff.who,
      icon: staff.icon,
      voice: staff.voice,
      anchor: "char"
    };
  }

  /* ---------- Single Companion Pet in SVG Scene (#o-cat) ---------- */
  function renderDogInScene() {
    if (typeof document === "undefined") return;
    const world = document.getElementById("world");
    if (world) {
      const legacyDog = world.querySelector("#ctx-dog");
      if (legacyDog) legacyDog.remove();
    }
    Array.prototype.slice.call(document.querySelectorAll("#ctx-dog")).forEach(el => el.remove());
    if (root.ELW_PET_INTERACTION && typeof root.ELW_PET_INTERACTION.syncScenePet === "function") {
      root.ELW_PET_INTERACTION.syncScenePet();
    }
  }

  /* ---------- Trigger Contextual Phrase + 3D Speech Bubbles ---------- */
  function triggerPhrase(p) {
    if (!p) return;
    S.practiced[p.en] = (S.practiced[p.en] || 0) + 1;
    save();

    try {
      if (typeof root.charSay === "function") root.charSay(p.en);
    } catch (e) {}

    const mySeq = ctxReplyAbortSeq;
    const speakFn = root.say || (t => Promise.resolve());
    Promise.resolve(speakFn(p.en, 0.94)).catch(() => {}).then(() => {
      if (mySeq !== ctxReplyAbortSeq) return;
      const tid = setTimeout(() => {
        ctxReplyTimers.delete(tid);
        if (mySeq !== ctxReplyAbortSeq) return;
        const responder = resolveContextualWho(p);
        const isPet = responder.anchor === "#o-cat" || p.listener === "pet";
        const isLinh = p.listener === "Linh" || responder.name === "Linh" || responder.anchor === "#lt-friend";
        if (isPet) {
          if (!S.walkDog) return;
        } else if (isLinh) {
          if (!isSideCharacterEnabled("linh") || isHomeRoom()) return;
        } else {
          if (!isSideCharacterEnabled("surprise")) return;
        }
        if (root.ELW_LIFE && root.ELW_LIFE.draw3DSpeechBubble) {
          root.ELW_LIFE.draw3DSpeechBubble(responder.anchor, responder.name, responder.icon, p.replyEn, p.replyVi, "say", 5000);
        }
        if (root.ELW_VOICES && p.replyEn && !isPet) {
          root.ELW_VOICES.speak(p.replyEn, responder.voice || "adult_female", { rate: 0.95 }).catch(() => {});
        }
      }, 250);
      ctxReplyTimers.add(tid);
    });

    try {
      if (root.ELW_PET && root.ELW_PET.onPractice) root.ELW_PET.onPractice(2);
      if (root.ELW_PET_ADVENTURE && root.ELW_PET_ADVENTURE.onPhrasePracticed) root.ELW_PET_ADVENTURE.onPhrasePracticed(p);
    } catch (e) {}
    renderTalkCard();
  }

  /* ---------- Render Top Context Bar (#ctxBar) ---------- */
  function renderContextBar() {
    if (typeof document === "undefined") return;
    const scene = document.querySelector(".scene");
    if (!scene) return;
    let bar = document.getElementById("ctxBar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "ctxBar";
      bar.className = "ctx-bar";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "Tùy chọn Ngữ cảnh Giao tiếp");
      const stageWrap = scene.querySelector(".w3d-stage-wrap") || document.getElementById("room");
      scene.insertBefore(bar, stageWrap);
    }

    const wx = curWx();
    const wxObj = WEATHERS.find(w => w.id === wx) || WEATHERS[0];
    const sitObj = SITUATIONS.find(s => s.id === S.sit) || SITUATIONS[0];
    const homeMode = isHomeRoom();
    const surpriseOn = isSideCharacterEnabled("surprise");
    const linhTickOn = isSideCharacterEnabled("linh");
    const pro = isProUnlocked();

    bar.classList.toggle("is-collapsed", !S.open);

    const summaryParts = [
      `${wxObj.icon} ${wxObj.vi}`,
      `${sitObj.icon} ${sitObj.vi}`,
      surpriseOn ? "👥 NV phụ" : null,
      linhTickOn ? "🧑‍🦱 Cùng Linh" : null,
      S.walkDog ? "🐕 Cùng Pet" : null
    ].filter(Boolean);

    const summaryHtml = `
      <button type="button" class="ctx-summary-btn" id="ctxToggleBtn" aria-expanded="${S.open ? "true" : "false"}" title="Bấm để mở hoặc đóng bảng Ngữ cảnh, Thời tiết & Tình huống">
        <span class="ctx-summary-text">${summaryParts.join(" · ")}</span>
        <span class="ctx-summary-caret">${S.open ? "Thu gọn ▴" : "Mở rộng ▾"}</span>
      </button>
    `;

    bar.innerHTML = `
      ${summaryHtml}
      <div class="ctx-groups">
        <div class="ctx-group">
          <div class="ctx-lbl">🎭 Ngữ cảnh</div>
          <div class="ctx-row ctx-ctx-row">
            <label class="ctx-pill ctx-tick-pill ${surpriseOn ? "on" : ""}" id="ctxLblSurprise" for="ctxTickSurprise" title="Gộp chung khách ghé thăm, hàng xóm, shipper, nhân viên, sự kiện và hội thoại bất ngờ">
              <input type="checkbox" class="ctx-tick-input" id="ctxTickSurprise" data-sidechar-tick="surprise" ${surpriseOn ? "checked" : ""} />
              <span>👥 Nhân vật phụ bất ngờ</span>
            </label>
            <label class="ctx-pill ctx-linh-pill ctx-tick-pill ${linhTickOn ? "on" : ""}" id="ctxBtnLinh" for="ctxTickLinh" title="Đi cùng Linh (chỉ xuất hiện ở các chủ đề ngoài nhà khi bật)">
              <input type="checkbox" class="ctx-tick-input" id="ctxTickLinh" data-sidechar-tick="linh" ${linhTickOn ? "checked" : ""} />
              <span>🧑‍🦱 Đi cùng Linh</span>
            </label>
            <button type="button" class="ctx-pill ctx-dog-pill ${S.walkDog ? "on" : ""}" id="ctxBtnDog" title="Dắt thú cưng đi bộ cùng trong cảnh 3D và mở khóa mẫu câu thú cưng">
              🐕 Đi chơi cùng Pet ${S.walkDog ? "✓" : ""}
            </button>
            <button type="button" class="ctx-pill" id="ctxBtnTalkNow" style="border-color:#10b981;color:#047857;background:#f0fdf4" title="Bấm để trò chuyện ngay theo ngữ cảnh">
              💬 Tán ngẫu ngay
            </button>
          </div>
        </div>
        <div class="ctx-group">
          <div class="ctx-lbl">🌦️ Thời tiết</div>
          <div class="ctx-row">
            ${WEATHERS.map(w => `
              <button type="button" class="ctx-pill ctx-wx-pill ${wx === w.id ? "on" : ""}" data-cwx="${w.id}" title="Đổi thời tiết sang ${w.vi} (${w.en})">
                ${w.icon} ${w.vi}
              </button>
            `).join("")}
          </div>
        </div>
        <div class="ctx-group">
          <div class="ctx-lbl">🎬 Tình huống</div>
          <div class="ctx-row">
            ${SITUATIONS.map(sit => {
              const locked = sit.pro && !pro;
              return `<button type="button" class="ctx-pill ${S.sit === sit.id ? "on" : ""}" data-csit="${sit.id}" title="${sit.en} — ${sit.vi}">
                ${sit.icon} ${esc(sit.vi)}${locked ? `<span class="ctx-pro-tag">PRO</span>` : ""}
              </button>`;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    const tBtn = bar.querySelector("#ctxToggleBtn");
    if (tBtn) {
      tBtn.onclick = () => {
        S.open = !S.open;
        save();
        renderContextBar();
      };
    }

    const tickSurprise = bar.querySelector("#ctxTickSurprise");
    if (tickSurprise) {
      tickSurprise.onchange = e => {
        setSideCharacterEnabled("surprise", !!e.target.checked);
      };
    }

    const tickLinh = bar.querySelector("#ctxTickLinh");
    if (tickLinh) {
      tickLinh.onchange = e => {
        const next = !!e.target.checked;
        setSideCharacterEnabled("linh", next);
        if (next && isHomeRoom()) {
          try {
            if (typeof root.toastG === "function") {
              root.toastG("💡 Đã bật 'Đi cùng Linh'. Linh sẽ xuất hiện cùng bạn khi ra các chủ đề ngoài nhà (Quán cà phê, Siêu thị, Công viên...)!");
            }
          } catch (err) {}
        }
      };
    }

    const dogBtn = bar.querySelector("#ctxBtnDog");
    if (dogBtn) {
      dogBtn.onclick = () => {
        S.walkDog = !S.walkDog;
        save();
        try {
          if (S.walkDog) {
            if (root.ELW_PET_ADVENTURE) root.ELW_PET_ADVENTURE.enterAdventure({ entrySource: "context_bar" });
          } else {
            if (root.ELW_PET_ADVENTURE) root.ELW_PET_ADVENTURE.leaveAdventure({ keepContextWalk: true });
          }
        } catch (e) {}
        renderDogInScene();
        renderContextBar();
        renderTalkCard();
        if (S.walkDog) {
          triggerPhrase(DOG_PHRASES[0]);
        }
      };
    }

    const talkBtn = bar.querySelector("#ctxBtnTalkNow");
    if (talkBtn) {
      talkBtn.onclick = () => {
        if (!root.ELW_LIFE) return;
        const W = getW();
        if (isHomeRoom(W.room)) {
          if (isSideCharacterEnabled("surprise")) {
            root.ELW_LIFE.visitor();
          } else if (typeof root.toastG === "function") {
            root.toastG("💡 Đang tắt 'Nhân vật phụ bất ngờ'. Hãy tích bật trên thanh Ngữ cảnh nếu muốn có khách ghé thăm nhé!");
          }
        } else {
          if (isSideCharacterEnabled("linh") && root.ELW_LIFE.companionOn()) {
            root.ELW_LIFE.talkFriend();
          } else if (isSideCharacterEnabled("surprise")) {
            root.ELW_LIFE.visitor();
          } else if (typeof root.toastG === "function") {
            root.toastG("💡 Hãy tích bật 'Đi cùng Linh' hoặc 'Nhân vật phụ bất ngờ' trên thanh Ngữ cảnh để trò chuyện nhé!");
          }
        }
      };
    }

    bar.querySelectorAll("[data-cwx]").forEach(btn => {
      btn.onclick = () => {
        const nw = btn.dataset.cwx;
        if (root.ELW_LIFE && root.ELW_LIFE.setWeather) root.ELW_LIFE.setWeather(nw);
        const svg = document.getElementById("room");
        if (svg) svg.setAttribute("data-wx", nw);
        try {
          if (root.ELW_DAY && root.ELW_DAY.state) {
            root.ELW_DAY.state.weather = nw === "rainy" ? "rainy" : (nw === "cold" || nw === "windy") ? "cloudy" : "sunny";
            root.ELW_DAY.applyLighting(svg, root.ELW_DAY.phase(), { weather: root.ELW_DAY.state.weather });
          }
        } catch (e) {}
        renderContextBar();
        renderTalkCard();
        const picked = pickPhrases(getLiveContext());
        if (picked[0]) triggerPhrase(picked[0]);
      };
    });

    bar.querySelectorAll("[data-csit]").forEach(btn => {
      btn.onclick = () => {
        const sid = btn.dataset.csit;
        const sit = SITUATIONS.find(x => x.id === sid);
        if (sit && sit.pro && !isProUnlocked()) {
          if (root.ELW_PREMIUM && root.ELW_PREMIUM.openModal) {
            root.ELW_PREMIUM.openModal(`Ngữ cảnh nâng cao “${sit.icon} ${sit.vi} (${sit.en})”`);
            return;
          }
        }
        S.sit = sid;
        save();
        renderContextBar();
        renderTalkCard();
        const picked = pickPhrases(getLiveContext());
        if (picked[0]) triggerPhrase(picked[0]);
      };
    });
  }

  /* ---------- Render Contextual Phrase & Small-Talk Card (#ctxTalkCard) ---------- */
  function renderTalkCard() {
    if (typeof document === "undefined") return;
    let card = document.getElementById("ctxTalkCard");
    if (!card) {
      card = document.createElement("section");
      card.id = "ctxTalkCard";
      card.className = "card2";
      card.setAttribute("aria-label", "Mẫu câu giao tiếp theo ngữ cảnh");
      const side = document.querySelector(".side");
      const seq = document.getElementById("seqCard");
      if (side && seq && seq.parentNode === side) side.insertBefore(card, seq);
      else if (side) side.appendChild(card);
    }

    const liveCtx = getLiveContext();
    const wx = liveCtx.weather;
    const wxObj = WEATHERS.find(w => w.id === wx) || WEATHERS[0];
    const sitObj = SITUATIONS.find(s => s.id === S.sit) || SITUATIONS[0];
    const phrases = pickPhrases(liveCtx);
    const activePet = (root.ELW_PET_NEEDS && root.ELW_PET_NEEDS.getActivePet)
      ? root.ELW_PET_NEEDS.getActivePet()
      : { id: "milu", name: "Milu", icon: "🐕" };

    card.innerHTML = `
      <div class="ctx-card-hd">
        <h2>🗣️ Mẫu câu Giao tiếp theo Ngữ cảnh</h2>
        <span class="meta">Bấm câu để nói & xem phản hồi 3D</span>
      </div>
      <div class="ctx-active-badges">
        <span class="ctx-abadge">${wxObj.icon} ${wxObj.vi}</span>
        <span class="ctx-abadge">${sitObj.icon} ${sitObj.vi}</span>
        ${liveCtx.withLinh ? `<span class="ctx-abadge" style="background:#ecfdf5;border-color:#10b981;color:#065f46">👧 Đi cùng Linh</span>` : `<span class="ctx-abadge">🚶 Đi một mình</span>`}
        ${S.walkDog ? `<span class="ctx-abadge" style="background:#fef3c7;border-color:#f59e0b;color:#92400e">${activePet.icon || "🐕"} Đang đi cùng ${esc(activePet.name)}</span>` : ""}
      </div>
      <div class="ctx-plist">
        ${phrases.map((p, idx) => {
          const done = !!S.practiced[p.en];
          const responder = resolveContextualWho(p);
          return `
            <button type="button" class="ctx-pitem ${done ? "done" : ""}" data-pidx="${idx}">
              <div class="ctx-pitem-top">
                <span class="ctx-pen">${done ? "✅ " : "💬 "}${esc(p.en)}</span>
                <span class="ctx-pchunk">🧩 ${esc(p.chunk)}</span>
              </div>
              <span class="ctx-pvi">${esc(p.vi)} → <i>${esc(responder.label)}: “${esc(p.replyEn)}”</i></span>
            </button>
          `;
        }).join("")}
      </div>
    `;

    card.querySelectorAll("[data-pidx]").forEach(btn => {
      btn.onclick = () => {
        const p = phrases[+btn.dataset.pidx];
        if (p) triggerPhrase(p);
      };
    });
  }

  function updateMissionLinhHint() {
    if (typeof document === "undefined") return;
    const mc = document.getElementById("missionCard");
    if (!mc) return;
    const existing = mc.querySelector(".ctx-linh-mission-hint");
    if (existing) existing.remove();
    const M = root.ELW_MISSION;
    if (!M || typeof M.state !== "function") return;
    const st = M.state();
    if (st && st.id && /^life_/.test(st.id) && !st.complete && !isSideCharacterEnabled("linh")) {
      const hint = document.createElement("div");
      hint.className = "ctx-linh-mission-hint";
      hint.innerHTML = `<span>💡 Nhiệm vụ đi cùng Linh: hiện đang tắt <b>Đi cùng Linh</b>. Hãy bật tick để Linh xuất hiện cùng bạn nhé!</span><button type="button" id="ctxEnableLinhHintBtn">✓ Bật Đi cùng Linh</button>`;
      const btn = hint.querySelector("#ctxEnableLinhHintBtn");
      if (btn) {
        btn.onclick = () => {
          setSideCharacterEnabled("linh", true);
        };
      }
      mc.insertBefore(hint, mc.firstChild);
    }
  }

  function installGlobalHooks() {
    /* 1. Wrap npcReplyOf & showNpc so post-action NPC replies respect "Nhân vật phụ bất ngờ" */
    if (typeof root.npcReplyOf === "function" && !root.npcReplyOf.__ctxWrapped) {
      const origNpcReplyOf = root.npcReplyOf;
      const wrappedNpcReplyOf = function (a) {
        if (!isSideCharacterEnabled("surprise")) return null;
        return origNpcReplyOf.apply(this, arguments);
      };
      wrappedNpcReplyOf.__ctxWrapped = true;
      root.npcReplyOf = wrappedNpcReplyOf;
    }
    if (typeof root.showNpc === "function" && !root.showNpc.__ctxWrapped) {
      const origShowNpc = root.showNpc;
      const wrappedShowNpc = function (rp) {
        if (!rp || !isSideCharacterEnabled(rp.who || "surprise")) return Promise.resolve();
        return origShowNpc.apply(this, arguments);
      };
      wrappedShowNpc.__ctxWrapped = true;
      root.showNpc = wrappedShowNpc;
    }
    /* 2. Wrap startScene so pending roleplay scenes do not start if surprise is OFF */
    if (typeof root.startScene === "function" && !root.startScene.__ctxWrapped) {
      const origStartScene = root.startScene;
      const wrappedStartScene = function (sc) {
        if (!isSideCharacterEnabled("surprise")) return;
        return origStartScene.apply(this, arguments);
      };
      wrappedStartScene.__ctxWrapped = true;
      root.startScene = wrappedStartScene;
    }
    if (root.ELW && typeof root.ELW.startScene === "function" && !root.ELW.startScene.__ctxWrapped) {
      const origElwStartScene = root.ELW.startScene;
      const wrappedElwStartScene = function (sc) {
        if (!isSideCharacterEnabled("surprise")) return;
        return origElwStartScene.apply(this, arguments);
      };
      wrappedElwStartScene.__ctxWrapped = true;
      root.ELW.startScene = wrappedElwStartScene;
    }
    /* 3. Wrap sceneBubble and ELW_UI_SCENE.bubble so NPC bubbles are suppressed when their sidechar group is OFF */
    function shouldAllowSceneBubble(anchor, o) {
      const aStr = String(anchor || "");
      const whoStr = String((o && o.who) || "");
      if (!aStr && !whoStr) return true;
      if (aStr === "char" || aStr === "#o-cat" || /milo|milu|pet/i.test(whoStr)) return true;
      const isLinhBub = aStr === "#lt-friend" || aStr === "npc:linh" || aStr === "npc:friend" || /linh/i.test(whoStr);
      if (isLinhBub) {
        return isSideCharacterEnabled("linh") && !isHomeRoom();
      }
      return isSideCharacterEnabled("surprise");
    }
    if (typeof root.sceneBubble === "function" && !root.sceneBubble.__ctxWrapped) {
      const origSceneBubble = root.sceneBubble;
      const wrappedSceneBubble = function (anchor, o) {
        if (!shouldAllowSceneBubble(anchor, o)) return null;
        return origSceneBubble.apply(this, arguments);
      };
      wrappedSceneBubble.__ctxWrapped = true;
      root.sceneBubble = wrappedSceneBubble;
    }
    if (root.ELW_UI_SCENE && typeof root.ELW_UI_SCENE.bubble === "function" && !root.ELW_UI_SCENE.bubble.__ctxWrapped) {
      const origUiBubble = root.ELW_UI_SCENE.bubble;
      const wrappedUiBubble = function (anchor, o) {
        if (!shouldAllowSceneBubble(anchor, o)) return null;
        return origUiBubble.apply(this, arguments);
      };
      wrappedUiBubble.__ctxWrapped = true;
      root.ELW_UI_SCENE.bubble = wrappedUiBubble;
    }
    /* 4. Wrap ELW_MISSION.start so starting a life_* mission while Linh is OFF shows a hint instead of auto-enabling Linh */
    const M = root.ELW_MISSION;
    if (M && typeof M.start === "function" && !M.start.__ctxWrapped) {
      const rawStart = (root.ELW_LIFE && root.ELW_LIFE._rawMissionStart) ? root.ELW_LIFE._rawMissionStart : M.start;
      const wrappedStart = function (id, h) {
        const isLife = /^life_/.test(String(id || ""));
        if (isLife) {
          if (isSideCharacterEnabled("linh")) {
            try {
              if (root.ELW_LIFE && typeof root.ELW_LIFE.setCompanion === "function") {
                root.ELW_LIFE.setCompanion(true, { fromContext: true, silent: true });
              }
              if (typeof root.syncFriendBtn === "function") root.syncFriendBtn();
            } catch (e) {}
          } else {
            try {
              if (root.ELW_LIFE && typeof root.ELW_LIFE.setCompanion === "function") {
                root.ELW_LIFE.setCompanion(false, { fromContext: true, silent: true });
              }
              if (typeof root.syncFriendBtn === "function") root.syncFriendBtn();
            } catch (e) {}
          }
        }
        const res = rawStart.apply(this, arguments);
        if (isLife && !isSideCharacterEnabled("linh")) {
          teardownSideCharacter("linh");
          try {
            if (typeof root.toastG === "function") {
              root.toastG("💡 Nhiệm vụ đi cùng Linh: Hãy bật tick 'Đi cùng Linh' trên thanh Ngữ cảnh để Linh xuất hiện cùng bạn nhé!");
            }
          } catch (e) {}
          setTimeout(updateMissionLinhHint, 30);
        }
        return res;
      };
      wrappedStart.__lt = true;
      wrappedStart.__ltComp = true;
      wrappedStart.__ctxWrapped = true;
      M.start = wrappedStart;
    }
    if (typeof root.renderMission === "function" && !root.renderMission.__ctxWrapped) {
      const origRenderMission = root.renderMission;
      const wrappedRenderMission = function () {
        const r = origRenderMission.apply(this, arguments);
        try { updateMissionLinhHint(); } catch (e) {}
        return r;
      };
      wrappedRenderMission.__ctxWrapped = true;
      root.renderMission = wrappedRenderMission;
    }
  }

  function sync() {
    renderDogInScene();
    renderContextBar();
    renderTalkCard();
    updateMissionLinhHint();
  }

  function init() {
    loadState();
    injectCss();
    installGlobalHooks();
    try {
      if (root.ELW_LIFE) {
        if (typeof root.ELW_LIFE.config === "function") {
          root.ELW_LIFE.config({ visitors: isSideCharacterEnabled("surprise") });
        }
        if (typeof root.ELW_LIFE.setCompanion === "function") {
          root.ELW_LIFE.setCompanion(isSideCharacterEnabled("linh"), { fromContext: true, silent: true });
        }
      }
    } catch (e) {}
    if (!isSideCharacterEnabled("surprise")) {
      teardownSideCharacter("surprise");
    }
    if (!isSideCharacterEnabled("linh")) {
      teardownSideCharacter("linh");
    }
    try { if (typeof root.syncFriendBtn === "function") root.syncFriendBtn(); } catch (e) {}
    try { if (root.ELW_UI_COMPANION && typeof root.ELW_UI_COMPANION.syncButton === "function") root.ELW_UI_COMPANION.syncButton(); } catch (e) {}
    renderContextBar();
    renderTalkCard();
    renderDogInScene();
    updateMissionLinhHint();
    if (typeof setInterval === "function" && typeof document !== "undefined") {
      setInterval(() => {
        if (S.walkDog) renderDogInScene();
      }, 450);
    }
  }

  const api = {
    init,
    sync,
    refresh: sync,
    pickPhrases,
    resolveContextualWho,
    getLiveContext,
    isSideCharacterEnabled,
    setSideCharacterEnabled,
    teardownSideCharacter,
    setOpen: on => { S.open = !!on; save(); renderContextBar(); },
    isOpen: () => !!S.open,
    setWalkDog: on => { S.walkDog = !!on; save(); sync(); },
    setSituation: id => { S.sit = id; save(); sync(); },
    state: () => Object.assign({}, S, { sideChars: Object.assign({}, S.sideChars) })
  };

  root.ELW_CONTEXT = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
