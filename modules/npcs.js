/* English Life World — family NPCs living in the house (window.ELW_NPCS).
 * Draws family members into #world (depth-sorted via data-base), with a schedule by
 * day phase, "who is doing what" sentences, a people panel and event lines.
 *
 * PLACEMENT NOTES (SVG 1000x640, feet at (x,y)):
 *  - Every NPC is drawn with pointer-events:none except a small invisible hit box around
 *    head/upper body (.np-hit), so it never steals clicks from room objects behind it.
 *  - Slots are chosen away from objects' centres and the player's main SPOTS:
 *    living: left (170,405) by the bookshelf/plant, right (775,455) between table & counter,
 *            arm = armchair seat (925,598), front (365,620) front floor, floor (805,624) pet corner.
 *    kitchen: stove (505,404) between stove & kettle spots, left (360,470), tbl (910,560) table head,
 *            front (250,606), floor (790,622) in front of the dining table.
 *    bedroom: desk (560,366, seated), rug (600,505, floor mat), bed (head at 382,376 right of the pillow object, drawn just
 *            above the blanket, base 443.5), cot (760,612), shelf (962,566) by the shoe rack (player enters at 880,600).
 *    garden/bathroom/garage (only if roomExists): a (180,565), b (820,565), c (500,618).
 *  - If an activity's room does not exist, its `alt` {room,slot} is used. If a slot is
 *    already taken in that phase, the first free slot in the room is used (or NPC skipped).
 */
(function () {
  var NS = "http://www.w3.org/2000/svg";

  var PHASES = ["dawn", "morning", "noon", "afternoon", "evening", "night"];
  var CORE_ROOMS = ["living", "kitchen", "bedroom"];
  var POSES = ["idle", "read", "cook-stir", "water", "homework-write", "sleep", "play", "sit", "watch", "search", "clean", "fix", "eat", "carry"];

  var SLOTS = {
    living:  { left: { x: 170, y: 405 }, right: { x: 775, y: 455 }, arm: { x: 925, y: 598, seat: 1 }, front: { x: 365, y: 620 }, floor: { x: 805, y: 624 } },
    kitchen: { stove: { x: 505, y: 404 }, left: { x: 360, y: 470 }, tbl: { x: 910, y: 560 }, front: { x: 250, y: 606 }, floor: { x: 790, y: 622 } },
    bedroom: { desk: { x: 560, y: 366, seat: 1 }, rug: { x: 600, y: 505 }, bed: { x: 382, y: 376, bed: 1, base: 443.5 }, cot: { x: 760, y: 612 }, shelf: { x: 962, y: 566 } },
    garden:  { a: { x: 180, y: 565 }, b: { x: 820, y: 565 }, c: { x: 500, y: 618 } },
    bathroom:{ a: { x: 180, y: 565 }, b: { x: 820, y: 565 }, c: { x: 500, y: 618 } },
    garage:  { a: { x: 180, y: 565 }, b: { x: 820, y: 565 }, c: { x: 500, y: 618 } }
  };
  var ROOM_EN = { living: "living room", kitchen: "kitchen", bedroom: "bedroom", garden: "garden", bathroom: "bathroom", garage: "garage" };

  /* ---------- characters ---------- */
  var RP = (typeof window !== "undefined" && window.ELW_ROLEPLAY && window.ELW_ROLEPLAY.CHARACTERS) || {};
  function rp(id, k, d) { return RP[id] && RP[id][k] ? RP[id][k] : d; }
  var CHARACTERS = {
    dad:     { id: "dad", name: rp("dad", "name", "Dad"), subj: "Dad", role_vi: "Bố", avatar: "👨", voice: rp("dad", "voice", "adult_male"), size: 1, relations: { wife: "mom", children: ["tom", "lily", "baby"], father: "grandpa", mother: "grandma" },
      look: { shirt: "#3b6ec2", shirt2: "#2f5ba3", pants: "#5b5f66", shoe: "#2d2a26", hair: "#3a2a20", style: "short", beard: 1, glasses: 0 } },
    mom:     { id: "mom", name: rp("mom", "name", "Mom"), subj: "Mom", role_vi: "Mẹ", avatar: "👩", voice: rp("mom", "voice", "adult_female"), size: 0.97, relations: { husband: "dad", children: ["tom", "lily", "baby"] },
      look: { shirt: "#4aa58c", shirt2: "#3f8f7a", skirt: "#3f8f7a", legs: "#f2c9a0", shoe: "#8a2f3c", hair: "#2f2018", style: "bun", apron: 1 } },
    grandpa: { id: "grandpa", name: rp("grandpa", "name", "Grandpa"), subj: "Grandpa", role_vi: "Ông", avatar: "👴", voice: rp("grandpa", "voice", "elderly"), size: 0.95, relations: { wife: "grandma", son: "dad", grandchildren: ["tom", "lily", "baby"] },
      look: { shirt: "#9a6b45", shirt2: "#7d5536", pants: "#4b4f57", shoe: "#3a2a22", hair: "#e8e4dc", style: "bald", glasses: 1, beard: 0, mustache: 1 } },
    grandma: { id: "grandma", name: "Grandma", subj: "Grandma", role_vi: "Bà", avatar: "👵", voice: "elderly_female", size: 0.92, relations: { husband: "grandpa", son: "dad", grandchildren: ["tom", "lily", "baby"] },
      look: { shirt: "#8a6fbf", shirt2: "#7259a8", skirt: "#6c5aa0", legs: "#e8bf98", shoe: "#4a3a5a", hair: "#ece9e4", style: "bun", glasses: 1, shawl: 1 } },
    tom:     { id: "tom", name: rp("tom", "name", "Tom"), subj: "Tom", role_vi: "Anh Tom", avatar: "🧑", voice: rp("tom", "voice", "young_male"), size: 0.9, relations: { father: "dad", mother: "mom", sister: "lily", brother: "baby" },
      look: { shirt: "#3a9d5d", shirt2: "#2f8450", pants: "#3d5a80", shoe: "#f4f1ea", hair: "#1f1712", style: "spiky", hood: 1 } },
    lily:    { id: "lily", name: rp("lily", "name", "Lily"), subj: "Lily", role_vi: "Bé Lily", avatar: "👧", voice: rp("lily", "voice", "child"), size: 0.7, relations: { father: "dad", mother: "mom", brother: "tom" },
      look: { shirt: "#f28fa0", shirt2: "#e0708a", skirt: "#f28fa0", legs: "#f2c9a0", shoe: "#e7564d", hair: "#6a3f22", style: "pigtails" } },
    baby:    { id: "baby", name: "Baby Ben", subj: "The baby", role_vi: "Em bé", avatar: "👶", voice: "child", size: 0.5, kind: "baby", relations: { mother: "mom", father: "dad", sister: "lily", brother: "tom" },
      look: { shirt: "#f5c45a", hair: "#6a3f22" } },
    dog:     { id: "dog", name: "Max", subj: "The dog", role_vi: "Chó Max", avatar: "🐕", voice: "adult_male", size: 1, kind: "dog", relations: { owner: "tom" },
      look: { fur: "#c98a4b", fur2: "#a86c34", ear: "#7a4a22" } },
    guest:   { id: "guest", name: "Aunt Mary", subj: "Aunt Mary", role_vi: "Cô Mary (khách)", avatar: "👩‍🦰", voice: "young_female", size: 0.97, visitor: 1, relations: { sister_of: "mom" },
      look: { shirt: "#e7564d", shirt2: "#c94a43", skirt: "#3b3f6a", legs: "#f2c9a0", shoe: "#2d2a26", hair: "#b5532a", style: "long" } },
    delivery:{ id: "delivery", name: "Delivery person", subj: "The delivery person", role_vi: "Người giao hàng", avatar: "📦", voice: "young_male", size: 1, visitor: 1, relations: {},
      look: { shirt: "#f2a33a", shirt2: "#d48a2a", pants: "#3a3f47", shoe: "#2d2a26", hair: "#2a1d14", style: "cap", cap: "#e7564d" } },
    mechanic:{ id: "mechanic", name: "Mechanic", subj: "The mechanic", role_vi: "Thợ sửa xe", avatar: "🧑‍🔧", voice: "adult_male", size: 1, visitor: 1, relations: {},
      look: { shirt: "#4a6a8a", shirt2: "#3e5f82", pants: "#4a6a8a", shoe: "#2d2a26", hair: "#3a2a20", style: "cap", cap: "#3a3f47", overall: 1 } }
  };
  var FAMILY = ["dad", "mom", "grandpa", "grandma", "tom", "lily", "baby"];
  var VISITORS = ["guest", "delivery", "mechanic"];

  function isNpcEnabled(id) {
    if (id === "dog" || id === "max" || id === "ctx-dog") return false;
    try {
      if (typeof window !== "undefined" && window.ELW_CONTEXT && typeof window.ELW_CONTEXT.isSideCharacterEnabled === "function") {
        return !!window.ELW_CONTEXT.isSideCharacterEnabled(id || "surprise");
      }
      if (typeof localStorage !== "undefined") {
        var raw = JSON.parse(localStorage.getItem("elw_ctx_v1") || "{}");
        if (raw && raw.sideChars && typeof raw.sideChars.surprise === "boolean") {
          return raw.sideChars.surprise;
        }
      }
    } catch (e) {}
    return true;
  }

  /* ---------- schedule ---------- */
  function A(room, slot, pose, prop, en, vi, ask_en, ask_vi, ans_en, ans_vi, alt) {
    var a = { room: room, slot: slot, pose: pose, prop: prop, en: en, vi: vi, ask_en: ask_en, ask_vi: ask_vi, answer_en: ans_en, answer_vi: ans_vi };
    if (alt) a.alt = { room: alt[0], slot: alt[1] };
    return a;
  }
  var SCHEDULE = {
    dawn: {
      dad: A("kitchen", "left", "idle", "mug", "Dad is making coffee.", "Bố đang pha cà phê.", "Are you making coffee, Dad?", "Bố đang pha cà phê ạ?", "Yes, I am. I need it to wake up!", "Ừ. Bố cần nó để tỉnh ngủ!"),
      mom: A("kitchen", "stove", "cook-stir", "pot", "Mom is boiling water for tea.", "Mẹ đang đun nước pha trà.", "Why are you up so early, Mom?", "Sao mẹ dậy sớm thế ạ?", "I'm making tea for Grandpa.", "Mẹ đang pha trà cho ông."),
      grandpa: A("garden", "a", "water", "can", "Grandpa is watering the plants.", "Ông đang tưới cây.", "Do the plants need a lot of water, Grandpa?", "Cây có cần nhiều nước không ông?", "Not too much, my dear. Just a little every morning.", "Không nhiều đâu cháu. Mỗi sáng một ít thôi.", ["living", "left"]),
      grandma: A("living", "arm", "sit", "cup", "Grandma is drinking tea.", "Bà đang uống trà.", "Is the tea hot, Grandma?", "Trà có nóng không bà?", "It's warm and lovely.", "Ấm và ngon lắm cháu."),
      tom: A("bedroom", "bed", "sleep", "", "Tom is sleeping.", "Anh Tom đang ngủ.", "Tom, are you awake?", "Anh Tom ơi, anh dậy chưa?", "No... five more minutes!", "Chưa... năm phút nữa thôi!"),
      lily: A("bedroom", "rug", "sleep", "", "Lily is sleeping on her mat.", "Bé Lily đang ngủ trên nệm.", "Lily, do you want to get up?", "Lily ơi, em muốn dậy chưa?", "Not yet. I'm sleepy.", "Chưa ạ. Em buồn ngủ."),
      baby: A("bedroom", "cot", "sleep", "", "The baby is sleeping in the cot.", "Em bé đang ngủ trong cũi.", "Is the baby still sleeping?", "Em bé vẫn đang ngủ à?", "Shh! Yes, he's sleeping.", "Suỵt! Ừ, em đang ngủ.")
    },
    morning: {
      dad: A("living", "right", "read", "newspaper", "Dad is reading the newspaper.", "Bố đang đọc báo.", "What are you reading, Dad?", "Bố đang đọc gì vậy?", "I'm reading the news about the weather.", "Bố đang đọc tin về thời tiết."),
      mom: A("kitchen", "stove", "cook-stir", "pan", "Mom is cooking breakfast.", "Mẹ đang nấu bữa sáng.", "What are you cooking, Mom?", "Mẹ đang nấu gì vậy?", "I'm cooking eggs and rice.", "Mẹ đang nấu trứng và cơm."),
      grandpa: A("garden", "a", "water", "can", "Grandpa is watering the flowers.", "Ông đang tưới hoa.", "Can I help you, Grandpa?", "Cháu giúp ông được không?", "Splendid! Please fill the can.", "Tuyệt quá! Cháu đổ đầy bình giúp ông nhé.", ["living", "left"]),
      grandma: A("kitchen", "tbl", "idle", "plate", "Grandma is setting the table.", "Bà đang dọn bàn ăn.", "Do you need any help, Grandma?", "Bà có cần giúp không ạ?", "Yes, please. Bring the spoons.", "Có, cháu mang thìa ra giúp bà."),
      tom: A("bedroom", "desk", "homework-write", "notebook", "Tom is doing his homework.", "Anh Tom đang làm bài tập.", "Is your homework difficult, Tom?", "Bài tập có khó không anh Tom?", "It's math. It's kind of hard.", "Toán đấy. Hơi khó."),
      lily: A("bedroom", "shelf", "search", "shoe", "Lily is looking for her shoes.", "Bé Lily đang tìm giày.", "What are you looking for, Lily?", "Em đang tìm gì vậy Lily?", "My shoes! I can't find them.", "Giày của em! Em không tìm thấy."),
      baby: A("living", "front", "play", "rattle", "The baby is playing with a rattle.", "Em bé đang chơi xúc xắc.", "Is the baby happy?", "Em bé có vui không?", "Yes, he's laughing!", "Có, em đang cười!")
    },
    noon: {
      dad: A("kitchen", "tbl", "eat", "bowl", "Dad is eating lunch.", "Bố đang ăn trưa.", "Is the food good, Dad?", "Đồ ăn ngon không bố?", "It's delicious!", "Ngon tuyệt!"),
      mom: A("kitchen", "stove", "cook-stir", "pot", "Mom is making soup.", "Mẹ đang nấu súp.", "What kind of soup are you making?", "Mẹ đang nấu súp gì vậy?", "Chicken soup. Your favourite!", "Súp gà. Món con thích nhất!"),
      grandpa: A("living", "arm", "sleep", "", "Grandpa is taking a nap.", "Ông đang ngủ trưa.", "Are you tired, Grandpa?", "Ông mệt à?", "Just resting my eyes, dear.", "Ông chỉ nhắm mắt nghỉ chút thôi."),
      grandma: A("living", "left", "idle", "yarn", "Grandma is knitting a scarf.", "Bà đang đan khăn quàng.", "Who is the scarf for, Grandma?", "Bà đan khăn cho ai vậy?", "It's for you, sweetheart.", "Cho cháu đấy, cháu yêu."),
      tom: A("kitchen", "left", "clean", "sponge", "Tom is washing the dishes.", "Anh Tom đang rửa bát.", "Do you like washing the dishes, Tom?", "Anh có thích rửa bát không?", "Not really, but it's my turn.", "Không hẳn, nhưng đến lượt anh."),
      lily: A("living", "front", "play", "doll", "Lily is playing with her doll.", "Bé Lily đang chơi búp bê.", "What's your doll's name, Lily?", "Búp bê của em tên gì?", "Her name is Rosie.", "Tên bạn ấy là Rosie."),
      baby: A("bedroom", "cot", "sleep", "", "The baby is having a nap.", "Em bé đang ngủ trưa.", "When will the baby wake up?", "Khi nào em bé dậy?", "In about an hour.", "Khoảng một tiếng nữa.")
    },
    afternoon: {
      dad: A("garage", "a", "fix", "wrench", "Dad is fixing the bike.", "Bố đang sửa xe đạp.", "What's wrong with the bike, Dad?", "Xe đạp bị sao vậy bố?", "The chain is loose.", "Xích bị lỏng.", ["living", "right"]),
      mom: A("living", "left", "clean", "laundry", "Mom is folding the laundry.", "Mẹ đang gấp quần áo.", "Can I help you fold the clothes?", "Con giúp mẹ gấp quần áo nhé?", "Thank you! Fold the towels, please.", "Cảm ơn con! Con gấp khăn tắm nhé."),
      grandpa: A("living", "arm", "read", "book", "Grandpa is reading a book.", "Ông đang đọc sách.", "What is the book about, Grandpa?", "Cuốn sách nói về gì vậy ông?", "It's about the sea, my dear.", "Về biển cả đấy cháu."),
      grandma: A("kitchen", "stove", "cook-stir", "bowl", "Grandma is baking a cake.", "Bà đang làm bánh.", "What cake are you making, Grandma?", "Bà đang làm bánh gì vậy?", "A banana cake for tea time.", "Bánh chuối cho giờ uống trà."),
      tom: A("bedroom", "rug", "idle", "headphones", "Tom is listening to music.", "Anh Tom đang nghe nhạc.", "What are you listening to, Tom?", "Anh đang nghe gì vậy?", "A new song. It's cool!", "Một bài mới. Hay lắm!"),
      lily: A("bedroom", "desk", "homework-write", "crayon", "Lily is drawing a picture.", "Bé Lily đang vẽ tranh.", "What are you drawing, Lily?", "Em đang vẽ gì vậy?", "I'm drawing our house!", "Em đang vẽ ngôi nhà mình!"),
      baby: A("living", "front", "play", "blocks", "The baby is playing with blocks.", "Em bé đang chơi xếp hình.", "Is the baby building a tower?", "Em bé đang xếp tháp à?", "Yes, a very small tower!", "Ừ, một cái tháp bé xíu!")
    },
    evening: {
      dad: A("living", "arm", "watch", "remote", "Dad is watching TV.", "Bố đang xem ti vi.", "What are you watching, Dad?", "Bố đang xem gì vậy?", "I'm watching a football match.", "Bố đang xem bóng đá."),
      mom: A("kitchen", "stove", "cook-stir", "pan", "Mom is cooking dinner.", "Mẹ đang nấu bữa tối.", "What's for dinner, Mom?", "Tối nay ăn gì vậy mẹ?", "Fish, rice and vegetables.", "Cá, cơm và rau."),
      grandpa: A("living", "left", "idle", "radio", "Grandpa is listening to the radio.", "Ông đang nghe đài.", "What's on the radio, Grandpa?", "Đài đang phát gì vậy ông?", "Old songs. In my day, we danced to these!", "Nhạc xưa. Hồi ông còn trẻ, ông nhảy theo những bài này!"),
      grandma: A("kitchen", "tbl", "idle", "plate", "Grandma is setting the table.", "Bà đang dọn bàn ăn.", "Shall I get the chopsticks, Grandma?", "Cháu lấy đũa nhé bà?", "Yes, please. Thank you, dear.", "Ừ, cảm ơn cháu."),
      tom: A("kitchen", "front", "carry", "trashbag", "Tom is taking out the trash.", "Anh Tom đang đổ rác.", "Are you taking out the trash, Tom?", "Anh đang đi đổ rác à?", "Yeah, Mom asked me to.", "Ừ, mẹ bảo anh đi."),
      lily: A("living", "front", "play", "ball", "Lily is playing with the cat.", "Bé Lily đang chơi với mèo.", "Is the cat playing with you, Lily?", "Mèo có chơi với em không?", "Yes! She likes the ball.", "Có! Nó thích quả bóng."),
      baby: A("bedroom", "cot", "play", "bottle", "The baby is drinking milk.", "Em bé đang uống sữa.", "Is the baby hungry?", "Em bé đói à?", "Yes, he's drinking his milk.", "Ừ, em đang uống sữa.")
    },
    night: {
      dad: A("living", "right", "read", "phone", "Dad is checking his phone.", "Bố đang xem điện thoại.", "Are you checking emails, Dad?", "Bố đang xem email à?", "Yes, just one more. Then bed.", "Ừ, một cái nữa thôi. Rồi đi ngủ."),
      mom: A("living", "left", "read", "book", "Mom is reading a magazine.", "Mẹ đang đọc tạp chí.", "Are you tired, Mom?", "Mẹ có mệt không?", "A little. It was a long day.", "Hơi mệt. Hôm nay dài quá."),
      grandpa: A("living", "arm", "sleep", "", "Grandpa is sleeping in the armchair.", "Ông đang ngủ trên ghế bành.", "Grandpa, do you want to go to bed?", "Ông ơi, ông có muốn đi ngủ không?", "Hmm? Oh yes, good night, dear.", "Hả? À ừ, chúc cháu ngủ ngon."),
      grandma: A("kitchen", "left", "idle", "mug", "Grandma is making warm milk.", "Bà đang pha sữa ấm.", "Is the milk for me, Grandma?", "Sữa cho cháu ạ?", "Yes, it helps you sleep.", "Ừ, uống cho dễ ngủ."),
      tom: A("bedroom", "desk", "homework-write", "notebook", "Tom is studying for a test.", "Anh Tom đang ôn thi.", "When is your test, Tom?", "Khi nào anh thi?", "Tomorrow morning. Wish me luck!", "Sáng mai. Chúc anh may mắn nhé!"),
      lily: A("bathroom", "b", "idle", "toothbrush", "Lily is brushing her teeth.", "Bé Lily đang đánh răng.", "Are you brushing your teeth, Lily?", "Em đang đánh răng à?", "Yes! Two minutes!", "Vâng! Hai phút ạ!", ["bedroom", "rug"]),
      baby: A("bedroom", "cot", "sleep", "", "The baby is sleeping.", "Em bé đang ngủ.", "Is the baby asleep?", "Em bé ngủ chưa?", "Yes. Please be quiet.", "Rồi. Nói nhỏ thôi nhé.")
    }
  };
  var VISIT = {
    guest: A("living", "right", "sit", "cup", "Aunt Mary is drinking tea.", "Cô Mary đang uống trà.", "Would you like some more tea, Aunt Mary?", "Cô có muốn thêm trà không ạ?", "Yes, please. Thank you!", "Có, cảm ơn cháu!"),
    delivery: A("living", "front", "carry", "parcel", "The delivery person is holding a parcel.", "Người giao hàng đang cầm một gói hàng.", "Is that parcel for us?", "Gói hàng đó của nhà mình ạ?", "Yes. Please sign here.", "Đúng rồi. Bạn ký vào đây nhé."),
    mechanic: A("garage", "b", "fix", "wrench", "The mechanic is fixing the car.", "Thợ đang sửa xe ô tô.", "What's wrong with the car?", "Xe bị sao vậy ạ?", "The battery is dead.", "Ắc quy hết điện rồi.", ["kitchen", "front"])
  };

  /* ---------- event lines ---------- */
  function E(id, cat, npc, en, vi) { return { id: id, cat: cat, npc: npc, en: en, vi: vi }; }
  var EVENT_LINES = [
    E("fan_on", "household", "grandma", "Could you turn off the fan? I'm cold.", "Cháu tắt quạt giúp bà được không? Bà lạnh."),
    E("lights", "household", "dad", "Please turn off the lights when you leave.", "Ra ngoài nhớ tắt đèn nhé."),
    E("power_cut", "household", "mom", "Oh no, the power is out!", "Ôi không, mất điện rồi!"),
    E("doorbell", "household", "dad", "Someone is at the door. Can you get it?", "Có người ở cửa. Con ra mở được không?"),
    E("dishes", "chores", "mom", "Can you help me wash the dishes?", "Con giúp mẹ rửa bát được không?"),
    E("trash", "chores", "dad", "It's your turn to take out the trash.", "Đến lượt con đổ rác đấy."),
    E("laundry", "chores", "mom", "Please hang the clothes outside.", "Con phơi quần áo ra ngoài giúp mẹ nhé."),
    E("baby_cry", "family", "mom", "The baby is crying!", "Em bé đang khóc kìa!"),
    E("homework", "family", "tom", "Can you help me with my homework?", "Giúp anh làm bài tập được không?"),
    E("story", "family", "lily", "Will you read me a story?", "Đọc truyện cho em nghe nhé?"),
    E("grandpa_story", "family", "grandpa", "Did I ever tell you about my first bike?", "Ông đã kể cháu nghe về chiếc xe đạp đầu tiên của ông chưa?"),
    E("cat_hungry", "pets", "lily", "The cat is hungry! Let's feed her.", "Mèo đói rồi! Mình cho nó ăn đi."),
    E("dinner_ready", "cooking", "mom", "Dinner is ready! Come and eat.", "Cơm xong rồi! Vào ăn thôi."),
    E("burn", "cooking", "grandma", "Something is burning! Check the stove!", "Có gì đang cháy! Xem bếp đi!"),
    E("taste", "cooking", "mom", "Can you taste the soup for me?", "Con nếm súp giúp mẹ nhé?"),
    E("spill", "cleaning", "mom", "Oops! Can you wipe the table?", "Ối! Con lau bàn giúp mẹ nhé?"),
    E("messy_room", "cleaning", "dad", "Your room is a mess. Please tidy it up.", "Phòng con bừa quá. Dọn dẹp đi nhé."),
    E("sweep", "cleaning", "grandma", "The floor is dirty. Where is the broom?", "Sàn bẩn rồi. Cái chổi đâu nhỉ?"),
    E("keys", "personal", "dad", "Have you seen my keys?", "Con có thấy chìa khóa của bố không?"),
    E("glasses", "personal", "grandpa", "Where are my glasses?", "Kính của ông đâu rồi nhỉ?"),
    E("shoes", "personal", "lily", "I can't find my shoes!", "Em không tìm thấy giày!"),
    E("car_start", "garage", "dad", "The car won't start.", "Xe ô tô không nổ máy."),
    E("flat_tire", "garage", "tom", "My bike has a flat tire.", "Xe đạp của anh bị xịt lốp."),
    E("tools", "garage", "dad", "Can you pass me the screwdriver?", "Con đưa bố cái tua vít được không?"),
    E("tea", "social", "grandma", "Would you like some tea?", "Cháu có muốn uống trà không?"),
    E("guest_arrive", "social", "mom", "Aunt Mary is coming for dinner.", "Cô Mary sẽ đến ăn tối."),
    E("delivery", "social", "delivery", "I have a parcel for you. Please sign here.", "Tôi có gói hàng cho bạn. Ký vào đây nhé."),
    E("thanks", "social", "guest", "Thank you for having me!", "Cảm ơn cả nhà đã đón tiếp!")
  ];
  var EVENT_CATEGORIES = ["household", "chores", "family", "pets", "cooking", "cleaning", "personal", "garage", "social"];
  var ALIAS = { fan: "fan_on", baby: "baby_cry", crying: "baby_cry", keys: "keys", car: "car_start", rain: "laundry", cat: "cat_hungry", cook: "dinner_ready", dirty: "sweep", guest: "guest_arrive", bell: "doorbell" };
  var evCounter = 0;
  function eventLine(key, seed) {
    if (!key || !isNpcEnabled("surprise")) return null;
    key = String(key);
    var hit = EVENT_LINES.filter(function (l) { return l.id === key; })[0];
    if (!hit && ALIAS[key]) hit = EVENT_LINES.filter(function (l) { return l.id === ALIAS[key]; })[0];
    if (!hit) {
      var pool = EVENT_LINES.filter(function (l) { return l.cat === key; });
      if (!pool.length) {
        var k = key.toLowerCase();
        pool = EVENT_LINES.filter(function (l) { return k.indexOf(l.cat) >= 0 || k.indexOf(l.id) >= 0; });
      }
      if (!pool.length) return null;
      var i = typeof seed === "number" ? seed : evCounter++;
      hit = pool[((i % pool.length) + pool.length) % pool.length];
    }
    if (!isNpcEnabled(hit.npc)) return null;
    var c = CHARACTERS[hit.npc];
    return { npc: hit.npc, name: c.name, voice: c.voice, en: hit.en, vi: hit.vi, cat: hit.cat, id: hit.id };
  }

  /* ---------- placement ---------- */
  var visitors = {}; // id -> room override or true
  function defaultRoomExists(id) {
    if (CORE_ROOMS.indexOf(id) >= 0) return true;
    try { return !!(typeof window !== "undefined" && window.ELW_ROOMS && window.ELW_ROOMS[id]); } catch (e) { return false; }
  }
  function normPhase(p) { return PHASES.indexOf(p) >= 0 ? p : "morning"; }
  /* -> [{npc, act, room, slot, x, y, seat, bed}] for all NPCs present now */
  function placements(phase, opts) {
    opts = opts || {};
    if (!isNpcEnabled("surprise")) return [];
    var exists = opts.roomExists || defaultRoomExists;
    phase = normPhase(phase);
    var taken = {}, out = [];
    var list = FAMILY.filter(function (id) { return id !== "dog" && isNpcEnabled(id) && SCHEDULE[phase] && SCHEDULE[phase][id]; })
      .map(function (id) { return [id, SCHEDULE[phase][id]]; });
    var vis = opts.visitors || Object.keys(visitors);
    vis.forEach(function (v) {
      var id = typeof v === "string" ? v : v.id;
      if (!VISIT[id] || !isNpcEnabled(id)) return;
      var a = VISIT[id], r = (typeof v === "object" && v.room) || (typeof visitors[id] === "string" ? visitors[id] : null);
      if (r) { a = Object.assign({}, a, { room: r, slot: null, alt: null }); }
      list.unshift([id, a]); // visitors first: they get their preferred slot
    });
    list.forEach(function (p) {
      var id = p[0], a = p[1], room = a.room, slot = a.slot;
      if (!a) return;
      if (!exists(room) || !SLOTS[room]) {
        if (a.alt && exists(a.alt.room)) { room = a.alt.room; slot = a.alt.slot; } else return;
      }
      var slots = SLOTS[room];
      if (!slot || !slots[slot] || taken[room + ":" + slot]) {
        slot = Object.keys(slots).filter(function (s) { return !taken[room + ":" + s] && !slots[s].bed && !(slots[s].seat && id === "baby"); })[0];
        if (!slot) return;
      }
      taken[room + ":" + slot] = 1;
      var s = slots[slot];
      out.push({ npc: id, act: a, room: room, slot: slot, x: s.x, y: s.y, seat: !!s.seat, bed: !!s.bed });
    });
    return out;
  }

  function describe(room, phase, opts) {
    return placements(phase, opts).filter(function (p) { return !room || p.room === room; }).map(function (p) {
      return { npc: p.npc, name: CHARACTERS[p.npc].name, room: p.room, pose: p.act.pose, en: p.act.en, vi: p.act.vi,
        ask_en: p.act.ask_en, ask_vi: p.act.ask_vi, answer_en: p.act.answer_en, answer_vi: p.act.answer_vi };
    });
  }
  function whereIs(npc, phase, opts) {
    var p = placements(phase, opts).filter(function (q) { return q.npc === npc; })[0];
    if (!p) return null;
    return { room: p.room, en: CHARACTERS[npc].subj + " is in the " + ROOM_EN[p.room] + ".", vi: CHARACTERS[npc].role_vi + " đang ở " + ({ living: "phòng khách", kitchen: "phòng bếp", bedroom: "phòng ngủ", garden: "vườn", bathroom: "phòng tắm", garage: "nhà để xe" }[p.room]) + "." };
  }

  /* ---------- drawing ---------- */
  var SKIN = { dad: "#e8b98e", grandpa: "#e9c29c", grandma: "#efcaa6", tom: "#f2c9a0", lily: "#f6d2ae", mom: "#f2c9a0", guest: "#f3cfae", delivery: "#c98e62", mechanic: "#d9a77c", baby: "#f8d6b8" };
  function hairSvg(L, skin) {
    var h = L.hair;
    switch (L.style) {
      case "bun": return '<path d="M-26 -78 Q-30 -46 -16 -50 L-16 -78Z" fill="' + h + '"/><circle cx="0" cy="-78" r="23" fill="' + skin + '"/><path d="M-24 -78 Q-24 -108 2 -106 Q26 -104 24 -80 Q12 -98 -6 -90 Q-16 -86 -24 -78Z" fill="' + h + '"/><circle cx="-4" cy="-108" r="9" fill="' + h + '"/>';
      case "long": return '<path d="M-26 -82 Q-32 -40 -12 -40 L-12 -80Z M20 -84 Q30 -50 22 -44 L14 -70Z" fill="' + h + '"/><circle cx="0" cy="-78" r="23" fill="' + skin + '"/><path d="M-25 -76 Q-26 -108 2 -106 Q28 -104 25 -78 Q16 -96 -4 -94 Q-18 -90 -25 -76Z" fill="' + h + '"/>';
      case "pigtails": return '<circle cx="0" cy="-78" r="23" fill="' + skin + '"/><path d="M-24 -78 Q-24 -106 2 -104 Q26 -102 24 -80 Q12 -96 -4 -92 Q-16 -88 -24 -78Z" fill="' + h + '"/><circle cx="-26" cy="-92" r="9" fill="' + h + '"/><circle cx="24" cy="-96" r="9" fill="' + h + '"/><circle cx="-21" cy="-97" r="3" fill="#e7564d"/><circle cx="19" cy="-100" r="3" fill="#e7564d"/>';
      case "spiky": return '<circle cx="0" cy="-78" r="23" fill="' + skin + '"/><path d="M-23 -80 L-20 -100 L-12 -94 L-6 -108 L2 -98 L10 -110 L14 -97 L24 -100 L23 -82 Q12 -92 -4 -90 Q-14 -90 -23 -80Z" fill="' + h + '"/>';
      case "bald": return '<circle cx="0" cy="-78" r="23" fill="' + skin + '"/><path d="M-23 -82 Q-25 -70 -19 -64 L-17 -80Z M21 -84 Q25 -74 21 -66 L18 -80Z" fill="' + h + '"/><path d="M-10 -98 q10 -4 18 0" stroke="#d9a888" stroke-width="1.4" fill="none"/>';
      case "cap": return '<circle cx="0" cy="-78" r="23" fill="' + skin + '"/><path d="M-24 -84 Q-22 -108 2 -106 Q24 -104 24 -86Z" fill="' + L.cap + '"/><path d="M14 -88 L38 -86 Q34 -82 14 -82Z" fill="' + L.cap + '"/><path d="M-23 -84 Q-26 -70 -20 -64 L-18 -82Z" fill="' + h + '"/>';
      default: return '<circle cx="0" cy="-78" r="23" fill="' + skin + '"/><path d="M-23 -80 Q-22 -106 2 -104 Q24 -102 23 -82 Q14 -92 -2 -92 Q-14 -92 -23 -80Z" fill="' + h + '"/>';
    }
  }
  function faceSvg(L, closed) {
    var s = closed ? '<path d="M7 -77 q4 2.5 8 0 M-4 -77 q3 2 6 0" stroke="#2d2a26" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
      : '<circle cx="11" cy="-77" r="2.8" fill="#2d2a26"/><circle cx="-1" cy="-77" r="2.5" fill="#2d2a26"/>';
    s += closed ? '<ellipse cx="8" cy="-66" rx="2.5" ry="1.4" fill="#9a4a3a"/>' : '<path d="M2 -66 Q8 -62 13 -66" stroke="#9a4a3a" stroke-width="2" fill="none" stroke-linecap="round"/>';
    s += '<circle cx="16" cy="-70" r="4" fill="#f7a8a0" opacity=".6"/>';
    if (L.glasses) s += '<circle cx="11" cy="-77" r="6" fill="none" stroke="#5a4a3a" stroke-width="1.6"/><circle cx="-2" cy="-77" r="5.5" fill="none" stroke="#5a4a3a" stroke-width="1.6"/><path d="M4 -77 h1.5" stroke="#5a4a3a" stroke-width="1.6"/>';
    if (L.beard) s += '<path d="M-14 -70 Q-10 -54 4 -54 Q18 -54 20 -68 Q12 -60 4 -61 Q-6 -60 -14 -70Z" fill="' + L.hair + '" opacity=".85"/>';
    if (L.mustache) s += '<path d="M0 -69 Q7 -73 15 -69 Q7 -66 0 -69Z" fill="' + L.hair + '"/>';
    return s;
  }
  var PROPS = {
    newspaper: '<g transform="translate(14,-108)"><rect x="-6" y="0" width="34" height="42" fill="#f4f1ea" stroke="#cbbfae"/><path d="M-2 6 h24 M-2 12 h24 M-2 18 h16 M-2 24 h24 M-2 30 h20" stroke="#9a948a" stroke-width="2"/></g>',
    book: '<g transform="translate(14,-100)"><path d="M0 0 L16 4 L32 0 L32 26 L16 30 L0 26Z" fill="#e8743b"/><path d="M16 4 L16 30" stroke="#b9572a" stroke-width="2"/></g>',
    phone: '<rect x="18" y="-100" width="12" height="20" rx="2.5" fill="#2d2a26"/><rect x="20" y="-97" width="8" height="13" fill="#6fb3d9"/>',
    pan: '<g class="np-stir"><rect x="16" y="-70" width="40" height="7" rx="3" fill="#3a3f47"/><path d="M40 -70 l26 -4" stroke="#2d2a26" stroke-width="4" stroke-linecap="round"/><ellipse cx="34" cy="-71" rx="8" ry="2.5" fill="#f5c45a"/></g>',
    pot: '<rect x="18" y="-80" width="36" height="22" rx="4" fill="#9aa4ad"/><ellipse cx="36" cy="-80" rx="18" ry="4" fill="#c6ced5"/><g class="np-stir"><path d="M36 -82 L44 -108" stroke="#b9853f" stroke-width="3" stroke-linecap="round"/></g><path class="np-steam" d="M30 -92 q-4 -8 0 -14 M40 -94 q4 -8 0 -14" stroke="#fff" stroke-width="2.5" fill="none" opacity=".8"/>',
    bowl: '<path d="M16 -78 Q32 -60 48 -78Z" fill="#f4eee4" stroke="#cbbfae"/>',
    mug: '<rect x="18" y="-92" width="14" height="16" rx="3" fill="#e8743b"/><path d="M32 -88 q6 0 6 5 q0 5 -6 5" stroke="#e8743b" stroke-width="2.5" fill="none"/><path class="np-steam" d="M24 -98 q-3 -6 0 -10" stroke="#fff" stroke-width="2" fill="none"/>',
    cup: '<rect x="18" y="-88" width="13" height="12" rx="3" fill="#f4f1ea" stroke="#cbbfae"/><path class="np-steam" d="M24 -94 q-3 -6 0 -10" stroke="#fff" stroke-width="2" fill="none"/>',
    can: '<g class="np-pour"><rect x="14" y="-92" width="26" height="22" rx="5" fill="#3a9d5d"/><path d="M40 -86 L62 -100" stroke="#3a9d5d" stroke-width="5" stroke-linecap="round"/><path class="np-drops" d="M64 -96 l2 8 M68 -94 l2 8 M62 -90 l2 8" stroke="#6fb3d9" stroke-width="2"/></g>',
    notebook: '<rect x="12" y="-60" width="38" height="8" fill="#f4f1ea" stroke="#cbbfae"/><g class="np-write"><path d="M30 -64 l10 -14" stroke="#3b6ec2" stroke-width="3" stroke-linecap="round"/></g>',
    crayon: '<rect x="12" y="-60" width="38" height="8" fill="#fff" stroke="#cbbfae"/><circle cx="22" cy="-57" r="2" fill="#e7564d"/><circle cx="30" cy="-56" r="2" fill="#3a9d5d"/><g class="np-write"><path d="M34 -64 l10 -14" stroke="#e7564d" stroke-width="4" stroke-linecap="round"/></g>',
    shoe: '<ellipse cx="34" cy="-4" rx="10" ry="5" fill="#e7564d"/><text x="44" y="-110" font-size="20">?</text>',
    plate: '<ellipse cx="32" cy="-78" rx="15" ry="4" fill="#fff" stroke="#cbbfae"/>',
    yarn: '<circle cx="28" cy="-82" r="8" fill="#f28fa0"/><path d="M18 -96 l22 18 M22 -98 l18 22" stroke="#b9853f" stroke-width="2"/>',
    sponge: '<rect x="18" y="-84" width="16" height="10" rx="3" fill="#f5c45a"/><circle class="np-steam" cx="40" cy="-92" r="3" fill="#fff" opacity=".8"/>',
    doll: '<g class="np-wave"><circle cx="34" cy="-80" r="6" fill="#f6d2ae"/><path d="M28 -74 L40 -74 L42 -60 L26 -60Z" fill="#9a6bd0"/></g>',
    ball: '<circle class="np-bounce" cx="40" cy="-8" r="7" fill="#3b6ec2"/><path d="M33 -8 h14" stroke="#fff" stroke-width="2"/>',
    rattle: '',
    blocks: '',
    bottle: '',
    remote: '<rect x="18" y="-82" width="7" height="16" rx="2" fill="#3a3f47"/>',
    radio: '<rect x="12" y="-92" width="30" height="20" rx="4" fill="#b9572a"/><circle cx="20" cy="-82" r="5" fill="#3a3f47"/><path class="np-steam" d="M46 -94 q4 4 0 8 M50 -98 q6 8 0 16" stroke="#e8743b" stroke-width="2" fill="none"/>',
    laundry: '<rect x="10" y="-80" width="34" height="14" rx="3" fill="#6fb3d9"/><rect x="14" y="-88" width="26" height="8" rx="2" fill="#f5c45a"/>',
    headphones: '<path d="M-24 -84 Q0 -116 24 -84" stroke="#3a3f47" stroke-width="4" fill="none"/><rect x="-28" y="-88" width="8" height="14" rx="3" fill="#e7564d"/><rect x="20" y="-88" width="8" height="14" rx="3" fill="#e7564d"/><text class="np-note" x="30" y="-104" font-size="16" fill="#e8743b">♪</text>',
    wrench: '<g class="np-stir"><path d="M18 -70 L42 -94" stroke="#8a8f96" stroke-width="5" stroke-linecap="round"/><circle cx="44" cy="-96" r="6" fill="none" stroke="#8a8f96" stroke-width="4"/></g>',
    trashbag: '<path d="M14 -60 Q8 -30 28 -24 Q48 -30 42 -60 Q28 -66 14 -60Z" fill="#3a3f47"/><path d="M24 -62 l4 -8 l4 8" stroke="#3a3f47" stroke-width="3" fill="none"/>',
    toothbrush: '<rect x="14" y="-96" width="4" height="22" fill="#6fb3d9"/><rect x="13" y="-100" width="6" height="6" fill="#fff"/>',
    parcel: '<rect x="8" y="-92" width="38" height="30" rx="2" fill="#c99668"/><path d="M8 -80 h38 M27 -92 v30" stroke="#a87545" stroke-width="3"/>'
  };
  var ARM_ROT = { idle: 0, read: -70, "cook-stir": -55, water: -60, "homework-write": -40, play: -30, sit: -50, watch: -45, search: -20, clean: -60, fix: -55, eat: -60, carry: -60, sleep: 0 };

  function person(c, act, slot) {
    var L = c.look, skin = SKIN[c.id] || "#f2c9a0", pose = act.pose, sit = slot.seat || pose === "sit" && slot.seat, closed = pose === "sleep";
    var legs;
    if (slot.seat) {
      legs = '<rect x="-12" y="-62" width="34" height="12" rx="6" fill="' + (L.pants || L.skirt) + '"/><rect x="14" y="-58" width="11" height="56" rx="5" fill="' + (L.pants || L.legs) + '"/><ellipse cx="22" cy="-3" rx="9" ry="5" fill="' + L.shoe + '"/>';
    } else if (L.skirt) {
      legs = '<rect x="-10" y="-50" width="10" height="48" rx="5" fill="' + L.legs + '"/><rect x="1" y="-50" width="10" height="48" rx="5" fill="' + L.legs + '"/><ellipse cx="-5" cy="-2" rx="9" ry="5" fill="' + L.shoe + '"/><ellipse cx="6" cy="-2" rx="9" ry="5" fill="' + L.shoe + '"/>';
    } else {
      legs = '<rect x="-10" y="-58" width="11" height="56" rx="5" fill="' + L.pants + '"/><rect x="-1" y="-58" width="11" height="56" rx="5" fill="' + L.pants + '"/><ellipse cx="-3" cy="-2" rx="9" ry="5" fill="' + L.shoe + '"/><ellipse cx="7" cy="-2" rx="9" ry="5" fill="' + L.shoe + '"/>';
    }
    var body = '<g transform="translate(0,-56)">';
    if (L.skirt && !slot.seat) body += '<path d="M-22 10 L22 10 L16 -40 L-16 -40Z" fill="' + L.skirt + '"/>';
    body += '<rect x="-17" y="-52" width="34" height="' + (L.skirt ? 44 : 56) + '" rx="12" fill="' + L.shirt + '"/>';
    if (!L.skirt) body += '<rect x="-17" y="-8" width="34" height="10" rx="4" fill="' + L.shirt2 + '"/>';
    if (L.apron) body += '<rect x="-12" y="-14" width="24" height="26" rx="4" fill="#fff3e3" opacity=".9"/>';
    if (L.shawl) body += '<path d="M-18 -50 Q0 -30 18 -50 L18 -40 Q0 -20 -18 -40Z" fill="#b8a3dd"/>';
    if (L.overall) body += '<rect x="-12" y="-36" width="24" height="34" rx="3" fill="#3e5f82"/><path d="M-10 -36 L-10 -52 M10 -36 L10 -52" stroke="#3e5f82" stroke-width="4"/>';
    if (L.hood) body += '<path d="M-18 -54 Q0 -44 18 -54 L14 -58 Q0 -50 -14 -58Z" fill="' + L.shirt2 + '"/><path d="M-4 -40 v14 M4 -40 v14" stroke="#f4f1ea" stroke-width="2"/>';
    body += '<rect x="-5" y="-60" width="10" height="10" fill="' + skin + '"/>';
    body += '<g class="np-head">' + hairSvg(L, skin) + faceSvg(L, closed) + '</g>';
    var rot = ARM_ROT[pose] || 0;
    body += '<g transform="translate(4,-44)"><g class="np-arm np-arm-' + pose + '" transform="rotate(' + rot + ')"><rect x="-5" y="0" width="11" height="40" rx="5.5" fill="' + L.shirt + '"/><circle cx="0.5" cy="42" r="6.5" fill="' + skin + '"/></g></g>';
    body += '</g>';
    var prop = PROPS[act.prop] || "";
    if (closed) prop = '<text class="np-zzz" x="24" y="-150" font-size="18" font-weight="700" fill="#6f7bb5">z<tspan font-size="13" dy="-8">z</tspan></text>';
    return '<g class="np-bob">' + legs + body + prop + '</g>';
  }
  function lying(c, act) { // on a bed / sleeping mat; feet-origin = middle of the mat
    var L = c.look, skin = SKIN[c.id] || "#f2c9a0";
    return '<rect x="-80" y="-18" width="160" height="16" rx="7" fill="#9fc6e6" opacity=".9"/>' +
      '<g transform="translate(-58,-30) rotate(-90)"><g transform="scale(.9)">' + hairSvg(L, skin).replace(/cy="-78"/g, 'cy="-78"') + faceSvg(L, true) + '</g></g>' +
      '<rect x="-46" y="-40" width="118" height="30" rx="14" fill="' + (L.shirt || "#f5c45a") + '"/><path d="M-40 -38 Q10 -48 70 -36 L70 -16 L-40 -14Z" fill="#f5c45a" opacity=".95"/>' +
      '<text class="np-zzz" x="-60" y="-96" font-size="18" font-weight="700" fill="#6f7bb5">z<tspan font-size="13" dy="-8">z</tspan></text>';
  }
  function bedHead(c) { // only the head shows above the blanket (blanket object is drawn below us)
    var L = c.look, skin = SKIN[c.id] || "#f2c9a0";
    return '<g transform="translate(0,78) rotate(-12)">' + hairSvg(L, skin) + faceSvg(L, true) + '</g>' +
      '<text class="np-zzz" x="22" y="-26" font-size="18" font-weight="700" fill="#6f7bb5">z<tspan font-size="13" dy="-8">z</tspan></text>';
  }
  function babyCot(c, act) {
    var sleep = act.pose === "sleep", extra = "";
    if (act.prop === "rattle") extra = '<g class="np-wave"><path d="M14 -64 l10 -14" stroke="#e8743b" stroke-width="3"/><circle cx="26" cy="-80" r="6" fill="#f5c45a"/></g>';
    if (act.prop === "blocks") extra = '<rect x="12" y="-52" width="12" height="12" fill="#e7564d"/><rect x="24" y="-52" width="12" height="12" fill="#3b6ec2"/><rect x="17" y="-64" width="12" height="12" fill="#f5c45a"/>';
    if (act.prop === "bottle") extra = '<rect x="8" y="-74" width="10" height="20" rx="4" fill="#fff" stroke="#cbbfae" transform="rotate(-40 13 -64)"/>';
    return '<ellipse cx="0" cy="0" rx="48" ry="7" fill="#000" opacity=".15"/>' +
      '<rect x="-44" y="-58" width="88" height="44" rx="6" fill="#f4eee4" stroke="#d8c7b0"/>' +
      '<g class="np-bob"><circle cx="-6" cy="-60" r="14" fill="' + SKIN.baby + '"/><path d="M-18 -64 Q-8 -80 6 -68" stroke="' + c.look.hair + '" stroke-width="3" fill="none"/>' +
      (sleep ? '<path d="M-10 -60 q3 2 6 0 M0 -60 q3 2 6 0" stroke="#2d2a26" stroke-width="1.4" fill="none"/>' : '<circle cx="-8" cy="-61" r="1.8" fill="#2d2a26"/><circle cx="2" cy="-61" r="1.8" fill="#2d2a26"/><path d="M-6 -54 q3 3 6 0" stroke="#9a4a3a" stroke-width="1.5" fill="none"/>') +
      '<rect x="-20" y="-48" width="40" height="22" rx="9" fill="' + c.look.shirt + '"/>' + extra + '</g>' +
      '<path d="M-44 -58 v54 M-30 -58 v44 M-16 -58 v44 M-2 -58 v44 M12 -58 v44 M26 -58 v44 M44 -58 v54" stroke="#c99668" stroke-width="3"/>' +
      '<rect x="-48" y="-62" width="96" height="6" rx="3" fill="#b97a4c"/><rect x="-48" y="-16" width="96" height="6" rx="3" fill="#b97a4c"/>' +
      (sleep ? '<text class="np-zzz" x="20" y="-82" font-size="14" font-weight="700" fill="#6f7bb5">z</text>' : "");
  }
  function dogSvg(c, act) {
    var L = c.look, sleep = act.pose === "sleep";
    var s = '<ellipse cx="0" cy="0" rx="34" ry="6" fill="#000" opacity=".15"/>';
    if (sleep) {
      return s + '<ellipse cx="0" cy="-12" rx="32" ry="13" fill="' + L.fur + '"/><circle cx="-24" cy="-14" r="11" fill="' + L.fur + '"/><path d="M-30 -22 q-6 8 0 14" fill="' + L.ear + '"/><path d="M-28 -14 q3 2 6 0" stroke="#2d2a26" stroke-width="1.4" fill="none"/><path class="np-tail" d="M30 -10 q14 2 10 -8" stroke="' + L.fur2 + '" stroke-width="6" fill="none" stroke-linecap="round"/><text class="np-zzz" x="-20" y="-36" font-size="14" font-weight="700" fill="#6f7bb5">z</text>';
    }
    s += '<g class="np-bob"><rect x="-20" y="-24" width="7" height="22" rx="3" fill="' + L.fur2 + '"/><rect x="12" y="-24" width="7" height="22" rx="3" fill="' + L.fur2 + '"/>' +
      '<ellipse cx="0" cy="-28" rx="27" ry="14" fill="' + L.fur + '"/>' +
      '<g class="np-tail-w"><path class="np-tail" d="M-24 -32 q-14 -6 -12 -22" stroke="' + L.fur2 + '" stroke-width="6" fill="none" stroke-linecap="round"/></g>' +
      '<circle cx="26" cy="-44" r="13" fill="' + L.fur + '"/><ellipse cx="38" cy="-40" rx="8" ry="6" fill="#e8c49a"/><circle cx="44" cy="-42" r="3" fill="#2d2a26"/><circle cx="28" cy="-47" r="2.4" fill="#2d2a26"/>' +
      '<path d="M18 -54 q-6 10 -2 18 q6 -6 6 -16Z" fill="' + L.ear + '"/><rect x="16" y="-34" width="18" height="4" rx="2" fill="#e7564d"/></g>';
    if (act.prop === "bowl") s += '<path d="M40 -8 L64 -8 L60 0 L44 0Z" fill="#3b6ec2"/>';
    if (act.prop === "ball") s += '<circle class="np-bounce" cx="58" cy="-8" r="7" fill="#f5c45a"/>';
    return s;
  }

  function scaleAt(y) { return (0.95 + (y - 330) / 310 * 0.5) * 1.25; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }

  /* hit boxes in local (unscaled) units: [x, y, w, h] — upper body only */
  function hitBox(c, act, slot) {
    if (c.kind === "dog") return act.pose === "sleep" ? [-36, -28, 62, 26] : [-30, -58, 80, 40];
    if (c.kind === "baby") return [-26, -78, 52, 40];
    if (slot.bed) return [-24, -30, 48, 48];
    if (act.pose === "sleep" && !slot.seat) return [-84, -50, 50, 44];
    return [-24, -160, 48, 82];
  }

  var lastArgs = null;
  function clear(worldGroup) {
    var root = worldGroup || (typeof document !== "undefined" && document.getElementById("world"));
    if (!root) return;
    Array.prototype.slice.call(root.querySelectorAll(".npc")).forEach(function (n) { n.remove(); });
  }
  function ensureCss(doc) {
    if (!doc || doc.getElementById("np-style")) return;
    var st = doc.createElement("style"); st.id = "np-style"; st.textContent = css; (doc.head || doc.documentElement).appendChild(st);
  }
  function render(worldGroup, room, phase, opts) {
    opts = opts || {};
    var doc = worldGroup.ownerDocument;
    ensureCss(doc);
    clear(worldGroup);
    lastArgs = { world: worldGroup, room: room, opts: opts };
    var pl = placements(phase, opts).filter(function (p) { return p.room === room; });
    pl.forEach(function (p) {
      var c = CHARACTERS[p.npc], act = p.act, slot = SLOTS[p.room][p.slot];
      var g = doc.createElementNS(NS, "g");
      g.setAttribute("class", "npc np-p-" + act.pose + (c.kind ? " np-k-" + c.kind : ""));
      g.setAttribute("data-npc", p.npc);
      g.setAttribute("data-room", p.room);
      g.setAttribute("data-base", String(slot.base || p.y + (slot.seat ? 4 : 0.5)));
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", c.name + " — " + act.en);
      var sc = scaleAt(p.y) * (c.kind === "baby" || c.kind === "dog" ? 0.85 : c.size || 1);
      var flip = p.x > 640 ? -1 : 1;
      if (slot.seat && p.room === "living") flip = -1; // armchair faces the room
      var inner = c.kind === "dog" ? dogSvg(c, act) : c.kind === "baby" ? babyCot(c, act)
        : slot.bed ? bedHead(c) : (act.pose === "sleep" && !slot.seat) ? lying(c, act)
        : '<ellipse cx="0" cy="0" rx="26" ry="7" fill="#000" opacity=".18"/>' + person(c, act, slot);
      var hb = hitBox(c, act, slot);
      var labelY = c.kind === "dog" ? -70 : c.kind === "baby" ? -96 : slot.bed ? -40 : act.pose === "sleep" && !slot.seat ? -70 : -178;
      g.setAttribute("transform", "translate(" + p.x + "," + p.y + ") scale(" + sc.toFixed(3) + ")");
      g.innerHTML = '<g class="np-fig" transform="scale(' + flip + ',1)">' + inner + '</g>' +
        '<rect class="np-hit" x="' + (flip < 0 ? -hb[0] - hb[2] : hb[0]) + '" y="' + hb[1] + '" width="' + hb[2] + '" height="' + hb[3] + '" rx="10" fill="transparent"/>' +
        '<g class="np-label" transform="translate(0,' + labelY + ') scale(' + (1 / sc).toFixed(3) + ')"><rect x="-70" y="-14" width="140" height="22" rx="11" fill="#fffaf2" stroke="#e3d6c3"/><text x="0" y="2" text-anchor="middle" font-size="12" fill="#3a2f26">' + esc(c.avatar + " " + c.name + " · " + c.role_vi) + '</text></g>';
      var fire = function (e) { if (e) { e.stopPropagation(); } if (opts.onClick) opts.onClick(p.npc, describe(room, phase, opts).filter(function (d) { return d.npc === p.npc; })[0]); };
      g.addEventListener("click", fire);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire(e); } });
      worldGroup.appendChild(g);
    });
    if (opts.sortDepth) try { opts.sortDepth(); } catch (e) {}
    return pl.map(function (p) { return p.npc; });
  }
  function update(phase) {
    if (!lastArgs) return [];
    return render(lastArgs.world, lastArgs.room, phase, lastArgs.opts);
  }
  function visit(id, room) {
    if (!isNpcEnabled(id)) return;
    if (VISIT[id]) visitors[id] = room || true;
  }
  function leave(id) { if (id) delete visitors[id]; else visitors = {}; }
  function teardown(target) {
    var t = String(target || "all").toLowerCase();
    if (t === "linh" || t === "friend") {
      delete visitors.friend;
    } else {
      visitors = {};
    }
    if (lastArgs && lastArgs.world) {
      render(lastArgs.world, lastArgs.room, null, lastArgs.opts);
    } else {
      clear();
    }
    if (typeof document !== "undefined") {
      var pc = document.getElementById("peopleCard");
      if (pc && !isNpcEnabled("surprise")) {
        var ul = pc.querySelector(".np-list");
        if (ul) ul.innerHTML = "";
      }
    }
  }

  /* ---------- people panel ---------- */
  function renderPeoplePanel(container, room, phase, o) {
    o = o || {};
    var doc = container.ownerDocument; ensureCss(doc);
    var list = describe(room, phase, o);
    var speak = o.speak || function () {};
    container.classList.add("np-card");
    container.innerHTML = '<h3 class="np-h">👨‍👩‍👧 Mọi người đang làm gì <span class="np-meta">' + esc(ROOM_EN[room] || room) + ' · ' + esc(normPhase(phase)) + '</span></h3>' +
      (list.length ? "" : '<p class="np-empty">Không có ai ở đây lúc này. <i>There is nobody here right now.</i></p>') +
      '<ul class="np-list">' + list.map(function (d, i) {
        var c = CHARACTERS[d.npc];
        return '<li class="np-row" data-npc="' + d.npc + '"><span class="np-av" aria-hidden="true">' + c.avatar + '</span>' +
          '<div class="np-txt"><div class="np-en">' + esc(d.en) + '</div><div class="np-vi">' + esc(d.vi) + '</div>' +
          '<div class="np-qa" hidden><div class="np-q">🙋 ' + esc(d.ask_en) + ' <i>' + esc(d.ask_vi) + '</i></div><div class="np-a">' + c.avatar + ' ' + esc(d.answer_en) + ' <i>' + esc(d.answer_vi) + '</i></div></div></div>' +
          '<div class="np-btns"><button type="button" class="np-btn" data-say="' + i + '" aria-label="Nghe: ' + esc(d.en) + '">🔊</button><button type="button" class="np-btn np-ask" data-ask="' + i + '">Hỏi</button></div></li>';
      }).join("") + '</ul>';
    container.querySelectorAll("[data-say]").forEach(function (b) { b.onclick = function () { speak(list[+b.dataset.say].en, "adult_female"); }; });
    container.querySelectorAll("[data-ask]").forEach(function (b) {
      b.onclick = function () {
        var d = list[+b.dataset.ask], li = b.closest(".np-row"), qa = li.querySelector(".np-qa");
        qa.hidden = false;
        var p = speak(d.ask_en, o.meVoice || "young_female");
        var then = function () { speak(d.answer_en, CHARACTERS[d.npc].voice); };
        if (p && p.then) p.then(then, then); else setTimeout(then, 50);
        if (o.onTalk) o.onTalk(d.npc, d);
      };
    });
    return list;
  }

  var css = [
    ".npc{cursor:pointer;outline:none}",
    ".npc .np-fig,.npc .np-fig *{pointer-events:none}",
    ".npc .np-hit{pointer-events:all}",
    ".npc .np-label{opacity:0;transition:opacity .15s;pointer-events:none}",
    ".npc:hover .np-label,.npc:focus .np-label,.npc:focus-visible .np-label{opacity:1}",
    ".npc:focus-visible .np-hit{stroke:#e8743b;stroke-width:3;stroke-dasharray:6 4}",
    "@keyframes npBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.6px)}}",
    "@keyframes npStir{0%,100%{transform:rotate(0)}50%{transform:rotate(-8deg)}}",
    "@keyframes npZ{0%{opacity:0;transform:translateY(4px)}50%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}",
    "@keyframes npWag{0%,100%{transform:rotate(0)}50%{transform:rotate(18deg)}}",
    "@keyframes npHop{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}",
    ".npc .np-bob{animation:npBob 3.2s ease-in-out infinite}",
    ".npc .np-stir,.npc .np-write,.npc .np-pour,.npc .np-wave{transform-box:fill-box;transform-origin:0% 100%;animation:npStir 1.4s ease-in-out infinite}",
    ".npc .np-zzz,.npc .np-steam,.npc .np-note,.npc .np-drops{animation:npZ 2.6s ease-in-out infinite}",
    ".npc .np-tail-w{transform-box:fill-box;transform-origin:100% 100%;animation:npWag .6s ease-in-out infinite}",
    ".npc .np-bounce{animation:npHop 1s ease-in-out infinite}",
    ".npc.np-p-sleep .np-bob{animation-duration:5s}",
    "@media (prefers-reduced-motion:reduce){.npc *{animation:none!important}}",
    ".np-card{--accent:#e8743b;--line:#e3d6c3;font:14px/1.35 system-ui,sans-serif;color:#3a2f26}",
    ".np-h{margin:0 0 6px;font-size:15px;display:flex;flex-wrap:wrap;gap:6px;align-items:baseline}",
    ".np-meta{font-size:12px;color:#8a7a6a;font-weight:400}",
    ".np-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}",
    ".np-row{display:flex;gap:8px;align-items:flex-start;border:1px solid var(--line);border-radius:12px;padding:6px 8px;background:#fffaf2}",
    ".np-av{font-size:22px;line-height:1;flex:none}",
    ".np-txt{flex:1;min-width:0}",
    ".np-en{font-weight:600}",
    ".np-vi,.np-qa i{color:#7a6a5a;font-size:12.5px}",
    ".np-qa{margin-top:4px;border-top:1px dashed var(--line);padding-top:4px;display:flex;flex-direction:column;gap:2px}",
    ".np-btns{display:flex;gap:4px;flex:none}",
    ".np-btn{border:1px solid var(--line);background:#fff;border-radius:9px;padding:4px 8px;min-height:32px;cursor:pointer;font:inherit}",
    ".np-ask{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}",
    ".np-btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}",
    ".np-empty{margin:0;color:#7a6a5a}"
  ].join("\n");

  var api = { CHARACTERS: CHARACTERS, FAMILY: FAMILY, VISITORS: VISITORS, PHASES: PHASES, POSES: POSES, SLOTS: SLOTS, SCHEDULE: SCHEDULE, VISIT: VISIT,
    EVENT_LINES: EVENT_LINES, EVENT_CATEGORIES: EVENT_CATEGORIES, placements: placements, describe: describe, whereIs: whereIs,
    render: render, clear: clear, update: update, visit: visit, leave: leave, teardown: teardown, isNpcEnabled: isNpcEnabled, renderPeoplePanel: renderPeoplePanel, eventLine: eventLine, css: css };
  if (typeof window !== "undefined") window.ELW_NPCS = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
