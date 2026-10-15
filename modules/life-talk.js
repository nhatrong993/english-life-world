/* English Life World — Life talk (window.ELW_LIFE)
   Companion friend (Linh), small-talk bank (home / cafe / market), random daily weather + SVG overlay,
   random visitor events, and friend missions. Class prefix .lt-, SVG ids #lt-*.
   Load AFTER topic-cafe.js / topic-market.js; init with ELW_LIFE.init(host) (see integration snippet).
   host = { getW, room:()=>id, svg, world, bubble(anchor,{who,avatar,en,vi,kind,ttlMs}), say(text)->Promise,
            isBusy()->bool, container, enqueue(id) }                                                   */
(function () {
"use strict";

/* ---------- helpers ---------- */
const KEY = "elw_life_v1";
const HOME_ROOMS = ["living", "kitchen", "bedroom", "bathroom", "garage", "garden"];
// Bạn đồng hành Linh chỉ xuất hiện ở các chủ đề ngoài nhà khi bật "Đi chơi cùng Linh"
const OUT_ROOMS = ["cafe", "cafe_counter", "cafe_bar", "cafe_seating", "cafe_terrace", "market", "market_entrance", "market_produce", "market_dairy", "market_meat", "market_checkout", "park", "restaurant", "outdoor", "school"];
const topicOf = r => { const rm = typeof window !== "undefined" && window.ELW_ROOMS && window.ELW_ROOMS[r]; if (rm && rm.topic) return rm.topic; return /^cafe/.test(r) ? "cafe" : /^market/.test(r) ? "market" : r === "park" ? "park" : r === "restaurant" ? "restaurant" : r === "outdoor" ? "outdoor" : r === "school" ? "school" : "home"; };
function isSurpriseEnabled(role) {
  try {
    if (typeof window !== "undefined" && window.ELW_CONTEXT && typeof window.ELW_CONTEXT.isSideCharacterEnabled === "function") {
      return !!window.ELW_CONTEXT.isSideCharacterEnabled(role || "surprise");
    }
  } catch (e) {}
  return !!(S && S.visitors !== false);
}
function isLinhEnabled() {
  try {
    if (typeof window !== "undefined" && window.ELW_CONTEXT && typeof window.ELW_CONTEXT.isSideCharacterEnabled === "function") {
      return !!window.ELW_CONTEXT.isSideCharacterEnabled("linh");
    }
  } catch (e) {}
  return !!(S && S.companion);
}
const friendHere = () => { const r = host && host.room ? host.room() : curRoom; return !!(isLinhEnabled() && S.companion && topicOf(r) !== "home"); };
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
let S = Object.assign({ v: 1, companion: false, score: { right: 0, total: 0 }, visitorEveryMs: 90000, visitors: true }, load());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

/* Exchange: X(question, qVi, [[answer, vi, natural?], ...], reply, replyVi, tag) */
const X = (q, qVi, answers, r, rvi, tag) => ({ q, qvi: qVi, answers: answers.map(a => ({ en: a[0], vi: a[1], ok: a[2] !== false })), r, rvi, tag: tag || "" });
/* Reaction line */
const R = (en, vi) => ({ en, vi });

/* ---------- SMALL TALK BANK ---------- */
const TALK = {
 home: [
  X("Hey! You look tired—did you sleep okay?", "Này! Trông bạn mệt quá—bạn ngủ ổn không?", [["Not really. I stayed up too late.", "Không hẳn. Mình thức khuya quá."], ["I'm good, thanks. Just a bit sleepy.", "Mình ổn, cảm ơn. Chỉ hơi buồn ngủ."], ["Yes, I am sleep yesterday.", "(sai ngữ pháp)", false]], "Aw, take it easy today, okay?", "Ôi, hôm nay cứ thong thả nhé?", "health"),
  X("What do you feel like for dinner?", "Tối nay bạn muốn ăn gì?", [["Something light. Maybe soup?", "Món gì nhẹ nhẹ. Súp nhé?"], ["I could go for some noodles.", "Mình thèm mì quá."], ["Dinner is a meal.", "Bữa tối là một bữa ăn.", false]], "Sounds good to me!", "Nghe được đấy!"),
  X("Do you want some tea?", "Bạn uống trà không?", [["Sure, that'd be great.", "Có chứ, tuyệt quá."], ["I'm good, thanks.", "Thôi, cảm ơn nhé."], ["Tea is a drink.", "Trà là đồ uống.", false]], "No worries. Just let me know.", "Không sao. Cần thì nói nhé."),
  X("Is it okay if I turn on the TV?", "Mình bật TV được không?", [["Sure, go ahead.", "Được chứ, cứ bật đi."], ["Can we keep it down a bit? I'm studying.", "Nhỏ tiếng chút được không? Mình đang học."], ["Yes, I turn TV.", "(sai)", false]], "Got it. I'll keep it low.", "Hiểu rồi. Mình để nhỏ thôi."),
  X("What are you up to this weekend?", "Cuối tuần này bạn làm gì?", [["Not much. Probably just chilling at home.", "Không có gì. Chắc ở nhà nghỉ ngơi."], ["I'm thinking of going to the café.", "Mình định đi cà phê."], ["Weekend is Saturday.", "Cuối tuần là thứ Bảy.", false]], "Nice! Count me in.", "Hay đấy! Cho mình đi với."),
  X("Can you help me with the dishes?", "Bạn giúp mình rửa bát nhé?", [["Sure, I'll dry.", "Được, mình lau khô cho."], ["Give me five minutes, okay?", "Cho mình năm phút nhé?"], ["The dishes is clean.", "(sai)", false]], "Thanks, you're the best!", "Cảm ơn, bạn tuyệt nhất!"),
  X("Have you eaten yet?", "Bạn ăn gì chưa?", [["Not yet. I'm starving!", "Chưa. Mình đói muốn xỉu!"], ["Yeah, I just had a sandwich.", "Rồi, mình vừa ăn bánh mì kẹp."], ["I eat yet.", "(sai)", false]], "Let's grab something, then.", "Vậy đi kiếm gì ăn thôi."),
  X("This room's a bit messy, huh?", "Phòng hơi bừa nhỉ?", [["Yeah, I'll tidy up later.", "Ừ, lát mình dọn."], ["I know, I know. Busy week.", "Biết rồi mà. Tuần này bận quá."], ["Messy is a room.", "(vô nghĩa)", false]], "Ha, no judgment!", "Haha, mình không chê đâu!"),
  X("Are you feeling okay? You're a bit pale.", "Bạn ổn không? Trông hơi xanh xao.", [["I've got a bit of a headache.", "Mình hơi nhức đầu."], ["I'm fine, just hungry.", "Mình ổn, chỉ đói thôi."], ["I am pale color.", "(sai)", false]], "Drink some water and rest a bit.", "Uống chút nước rồi nghỉ tí đi.", "health"),
  X("Do you mind if I open the window?", "Mình mở cửa sổ được không?", [["Not at all. It's stuffy in here.", "Không sao. Trong này bí quá."], ["Actually, it's a bit cold. Maybe not?", "Thật ra hơi lạnh. Thôi nhé?"], ["Yes, I mind window.", "(sai)", false]], "Okay, fair enough.", "Ừ, cũng đúng."),
  X("Wanna watch a movie tonight?", "Tối nay xem phim không?", [["Yes! Something funny, please.", "Có! Phim gì vui vui nhé."], ["Maybe. I'm pretty tired, though.", "Có thể. Nhưng mình khá mệt."], ["Movie is tonight.", "(vô nghĩa)", false]], "Cool, I'll make popcorn.", "Được, mình làm bỏng ngô."),
  X("Where did you put the keys?", "Bạn để chìa khoá đâu rồi?", [["They're on the table, I think.", "Chắc ở trên bàn."], ["No idea. Let me check my bag.", "Không biết nữa. Để mình xem túi."], ["Keys is key.", "(sai)", false]], "Found them. Phew!", "Tìm thấy rồi. Phù!"),
  X("How was your day?", "Hôm nay của bạn thế nào?", [["Pretty good, actually.", "Khá ổn đấy."], ["Long. I'm exhausted.", "Dài lắm. Mình kiệt sức rồi."], ["My day is Monday.", "(vô nghĩa)", false]], "Glad you're home now.", "May là về nhà rồi.")
 ],
 cafe: [
  X("So, what are you getting?", "Vậy bạn gọi gì?", [["I think I'll get an iced latte.", "Chắc mình gọi latte đá."], ["Just a hot tea for me.", "Mình chỉ trà nóng thôi."], ["I am getting a coffee shop.", "(vô nghĩa)", false]], "Ooh, good choice!", "Ồ, chọn hay đấy!"),
  X("Do you want to share a croissant?", "Mình chia nhau cái croissant không?", [["Sure, why not?", "Được chứ, sao không?"], ["I'm good, thanks. Not hungry.", "Thôi, cảm ơn. Mình không đói."], ["Croissant is bread.", "(vô nghĩa)", false]], "Sweet. I'll grab it.", "Tuyệt. Để mình lấy."),
  X("Should we sit by the window?", "Mình ngồi cạnh cửa sổ nhé?", [["Yeah, it's nice and bright there.", "Ừ, chỗ đó sáng và đẹp."], ["Sounds good.", "Nghe được đó."], ["Window is glass.", "(vô nghĩa)", false]], "Perfect. Let's go.", "Hoàn hảo. Đi thôi."),
  X("Hot or iced today?", "Hôm nay nóng hay đá?", [["Iced, definitely.", "Đá, chắc chắn rồi."], ["Hot. I need to warm up.", "Nóng. Mình cần ấm người."], ["Yes, hot iced.", "(mâu thuẫn)", false]], "Ha, same here.", "Haha, mình cũng vậy."),
  X("It's pretty crowded, huh?", "Đông ghê nhỉ?", [["Yeah, it's always busy at lunch.", "Ừ, giờ trưa lúc nào cũng đông."], ["Let's grab a seat before they're gone.", "Kiếm chỗ ngồi trước khi hết đi."], ["Crowded is many crowd.", "(sai)", false]], "Good call.", "Ý hay."),
  X("Is your drink too sweet?", "Đồ uống của bạn ngọt quá không?", [["A little. I should've asked for less sugar.", "Hơi. Lẽ ra mình xin ít đường."], ["Nope, it's just right.", "Không, vừa đúng."], ["Sweet is sugar drink.", "(sai)", false]], "Next time say 'less sweet, please'.", "Lần sau nói 'less sweet, please' nhé."),
  X("Do you come here often?", "Bạn hay đến đây không?", [["Yeah, pretty much every morning.", "Ừ, gần như sáng nào cũng đến."], ["Not really. This is my first time.", "Không hẳn. Lần đầu đấy."], ["I come often here yes.", "(lủng củng)", false]], "Nice. The baristas are so friendly.", "Hay ghê. Nhân viên ở đây thân thiện lắm."),
  X("Can you ask for the Wi-Fi password?", "Bạn hỏi mật khẩu Wi-Fi giúp mình nhé?", [["Sure. Excuse me, what's the Wi-Fi password?", "Được. Xin lỗi, mật khẩu Wi-Fi là gì ạ?"], ["It's on the sign, I think.", "Hình như ghi trên biển đó."], ["Give me password.", "(cộc lốc)", false]], "Thanks! Now I can check my email.", "Cảm ơn! Giờ mình xem email được rồi."),
  X("For here or to go?", "Ngồi đây hay mang đi?", [["For here, please.", "Ngồi đây ạ."], ["To go, please. I'm in a hurry.", "Mang đi ạ. Mình đang vội."], ["Here go.", "(sai)", false]], "Got it!", "Rõ rồi!"),
  X("How's your coffee?", "Cà phê của bạn sao?", [["Really good. Nice and strong.", "Ngon lắm. Đậm vừa ý."], ["A bit bitter, but okay.", "Hơi đắng, nhưng được."], ["Coffee is how.", "(vô nghĩa)", false]], "Told you this place is great.", "Đã bảo quán này tuyệt mà."),
  X("Want to split the bill?", "Mình chia tiền nhé?", [["Sure, let's split it.", "Được, chia đôi đi."], ["No worries, it's on me today.", "Không sao, hôm nay mình mời."], ["Bill is paper.", "(vô nghĩa)", false]], "Aw, thanks! Next one's on me.", "Ôi cảm ơn! Lần sau mình mời."),
  X("Do you want a refill?", "Bạn muốn rót thêm không?", [["No thanks, I'm good.", "Thôi cảm ơn, mình đủ rồi."], ["Yes, please. Just a little.", "Có, một chút thôi."], ["Refill me now.", "(cộc)", false]], "Okay!", "Được!"),
  X("Is this seat taken?", "Ghế này có ai ngồi chưa?", [["No, go ahead.", "Chưa, bạn ngồi đi."], ["Sorry, my friend's sitting there.", "Xin lỗi, bạn mình ngồi đó."], ["Seat is take.", "(sai)", false]], "Thanks!", "Cảm ơn!"),
  X("You look tired. Long day?", "Trông bạn mệt. Hôm nay dài nhỉ?", [["Yeah, I really need this coffee.", "Ừ, mình rất cần ly cà phê này."], ["Kind of. I didn't sleep well.", "Cũng hơi. Mình ngủ không ngon."], ["I am long day.", "(sai)", false]], "Coffee to the rescue!", "Cà phê cứu cánh đây!", "health")
 ],
 market: [
  X("What do we still need?", "Mình còn thiếu gì?", [["Milk, bread, and some fruit.", "Sữa, bánh mì và ít trái cây."], ["Let me check the list.", "Để mình xem danh sách."], ["We need is milk.", "(sai)", false]], "Okay, dairy first.", "Ok, qua quầy sữa trước."),
  X("Should we get a cart or a basket?", "Lấy xe đẩy hay giỏ?", [["A basket's fine. We don't need much.", "Giỏ là được. Không mua nhiều."], ["Let's get a cart. It's a big shop.", "Lấy xe đi. Mua nhiều lắm."], ["Cart basket yes.", "(vô nghĩa)", false]], "Makes sense.", "Hợp lý."),
  X("These apples look fresh, don't they?", "Táo này trông tươi nhỉ?", [["Yeah, let's get a few.", "Ừ, lấy vài quả đi."], ["They do. Are they on sale?", "Đúng thế. Có giảm giá không?"], ["Apples is fresh fruit is.", "(sai)", false]], "I love the green ones.", "Mình thích táo xanh."),
  X("Wow, that's cheap! Should we get two?", "Rẻ ghê! Lấy hai nhé?", [["Sure, it's a good deal.", "Được, hời đấy."], ["Let's just get one. We'll waste it.", "Lấy một thôi. Kẻo bỏ phí."], ["Cheap is two.", "(vô nghĩa)", false]], "Good thinking.", "Nghĩ kỹ đấy."),
  X("Is this milk still good?", "Sữa này còn hạn không?", [["Let me check the date.", "Để mình xem hạn."], ["It's good till Friday.", "Hạn đến thứ Sáu."], ["Milk is good milk.", "(vô nghĩa)", false]], "Great, grab that one.", "Tốt, lấy hộp đó."),
  X("Do you know where the bread is?", "Bạn biết bánh mì ở đâu không?", [["I think it's next to the dairy.", "Hình như cạnh quầy sữa."], ["No idea. Let's ask someone.", "Không biết. Hỏi ai đó đi."], ["Bread is where.", "(sai)", false]], "Found it!", "Thấy rồi!"),
  X("Which one is cheaper?", "Cái nào rẻ hơn?", [["This one's a bit cheaper.", "Cái này rẻ hơn chút."], ["They're about the same.", "Giá gần như nhau."], ["Cheaper is one.", "(sai)", false]], "Let's go with that.", "Lấy cái đó đi."),
  X("The line's so long! Self-checkout?", "Hàng dài quá! Tự thanh toán nhé?", [["Good idea. Let's go.", "Ý hay. Đi thôi."], ["Nah, it's moving fast.", "Thôi, hàng đi nhanh mà."], ["Line is long line.", "(vô nghĩa)", false]], "Okay, okay.", "Ừ, ừ."),
  X("Did you bring a bag?", "Bạn có mang túi không?", [["Oops, I forgot. I'll buy one.", "Úi, quên. Mình mua một cái."], ["Yep, it's in my backpack.", "Có, trong ba lô."], ["Bag bring yes.", "(sai)", false]], "Nice, less plastic!", "Hay, bớt nhựa!"),
  X("Do we need snacks?", "Có cần đồ ăn vặt không?", [["Just one bag of chips.", "Một gói bim bim thôi."], ["We always need snacks!", "Lúc nào chẳng cần!"], ["Snacks is need.", "(sai)", false]], "Ha! Fair.", "Haha! Công nhận."),
  X("Can you hold this for a sec?", "Bạn cầm cái này giúp mình chút?", [["Sure, no problem.", "Được, không sao."], ["Yeah, hand it over.", "Ừ, đưa đây."], ["Hold sec this.", "(sai)", false]], "Thanks a lot.", "Cảm ơn nhiều."),
  X("Cash or card?", "Tiền mặt hay thẻ?", [["Card, please.", "Thẻ ạ."], ["I'll pay cash.", "Mình trả tiền mặt."], ["Cash card yes.", "(vô nghĩa)", false]], "Easy.", "Dễ ợt."),
  X("How much did we spend?", "Mình tiêu hết bao nhiêu?", [["About twenty dollars.", "Khoảng hai mươi đô."], ["Not too much, actually.", "Thật ra không nhiều."], ["We spend how much.", "(sai)", false]], "Not bad at all.", "Không tệ chút nào."),
  X("You okay? You look a bit tired.", "Bạn ổn không? Trông hơi mệt.", [["I'm fine, just hungry.", "Mình ổn, chỉ đói thôi."], ["A little. Let's finish quickly.", "Hơi mệt. Mua nhanh rồi về."], ["I tired am.", "(sai)", false]], "Let's grab a snack on the way out.", "Lúc ra mua gì ăn nhé.", "health")
 ],
 park: [
  X("The fresh air feels amazing, doesn't it?", "Không khí trong lành dễ chịu ghê nhỉ?", [["Yeah, it's so peaceful out here.", "Ừ, ở ngoài này yên bình thật."], ["Totally! I needed a break from work.", "Quá chuẩn! Mình đang cần nghỉ xả hơi."], ["Fresh air is wind.", "(vô nghĩa)", false]], "Same here! Let's take a slow walk.", "Mình cũng vậy! Đi dạo thong thả thôi."),
  X("Look at the ducks! Should we feed them?", "Nhìn đàn vịt kìa! Mình cho chúng ăn nhé?", [["Sure, I brought some crumbs.", "Được chứ, mình có mang ít vụn bánh."], ["Let's just watch them swim.", "Đứng ngắm chúng bơi thôi cũng vui."], ["Duck is swim water.", "(sai)", false]], "Aw, they're coming right over!", "Ôi, chúng đang bơi lại gần kìa!"),
  X("Do you want to get some ice cream?", "Bạn muốn ăn kem không?", [["Yes, please! One scoop of vanilla.", "Có chứ! Cho mình một viên va-ni."], ["Maybe later, after our walk.", "Để lát nữa đi dạo xong nhé."], ["Ice cream is cold food.", "(lạc đề)", false]], "Ooh, the strawberry flavor looks great too!", "Ồ, vị dâu trông cũng ngon quá!"),
  X("Wanna rent a bike and ride around the path?", "Thuê xe đạp chạy một vòng quanh đường mòn không?", [["Sounds fun! Let's unlock one.", "Nghe vui đấy! Mở khóa một chiếc đi."], ["I'd rather just walk today.", "Hôm nay mình thích đi bộ hơn."], ["Bike is two wheel.", "(vô nghĩa)", false]], "Race you to the fountain!", "Đua tới đài phun nước nhé!"),
  X("Your puppy is so excited! Can I throw the ball?", "Cún con của bạn hào hứng quá! Mình ném bóng nhé?", [["Go ahead! He loves playing fetch.", "Cứ tự nhiên! Nó mê trò bắt bóng lắm."], ["Sure, just don't throw it into the pond!", "Được chứ, đừng ném xuống hồ là được!"], ["Ball is throw dog.", "(sai)", false]], "Good boy! Look at him run!", "Giỏi quá! Nhìn nó chạy kìa!"),
  X("Should we sit in the shade for a bit?", "Mình ngồi dưới bóng râm nghỉ một lát nhé?", [["Good idea, my legs are getting tired.", "Ý hay đấy, chân mình hơi mỏi rồi."], ["Yeah, that bench under the oak tree looks nice.", "Ừ, cái ghế dài dưới gốc sồi kia trông mát đấy."], ["Shade is tree dark.", "(sai)", false]], "Ah, this breeze is lovely.", "À, gió thổi mát rượi."),
  X("Can you take a photo of me by the flowers?", "Chụp giúp mình tấm ảnh bên luống hoa nhé?", [["Of course! Smile—one, two, three!", "Được chứ! Cười lên nào—một, hai, ba!"], ["Sure, stand right next to the tulips.", "Ok, đứng sát bên mấy bông tulip nhé."], ["Photo is camera.", "(vô nghĩa)", false]], "Aw, that turned out great!", "Ồ, ảnh lên đẹp tuyệt!"),
  X("Do you come to this park often?", "Bạn có hay ra công viên này không?", [["Almost every weekend! It's my favorite spot.", "Gần như cuối tuần nào cũng ra! Chỗ ruột của mình đấy."], ["Just when the weather is nice.", "Chỉ khi nào trời đẹp thôi."], ["Park often I go.", "(sai)", false]], "We should come here more often!", "Bọn mình nên ra đây thường xuyên hơn!")
 ],
 restaurant: [
  X("Everything on the menu looks delicious! What are you ordering?", "Món nào trong thực đơn trông cũng ngon! Bạn định gọi gì?", [["I'll have the beef noodle soup.", "Mình sẽ gọi món mì/phở bò."], ["I'm thinking of trying the house special.", "Mình định thử món đặc sản của quán."], ["Menu is book food.", "(vô nghĩa)", false]], "Ooh, great choice! I'll get that too.", "Ồ, chọn chuẩn đấy! Mình cũng gọi món đó."),
  X("Can you eat spicy food?", "Bạn có ăn cay được không?", [["Not really. I'll ask for it mild.", "Không hẳn. Mình sẽ dặn làm ít cay."], ["Yeah, I love a little chili in my soup!", "Có chứ, mình thích thêm chút ớt vào tô!"], ["Spicy is fire mouth.", "(sai)", false]], "Good to know! Let's tell the waiter.", "Biết vậy để dặn nhân viên phục vụ nhé."),
  X("Would you like some lemon iced tea?", "Bạn uống trà chanh đá không?", [["Yes, please! That sounds super refreshing.", "Có chứ! Nghe mát lạnh sảng khoái đấy."], ["Just cold water for me, thanks.", "Cho mình nước lọc mát là được, cảm ơn."], ["Tea lemon is drink.", "(sai)", false]], "I'll ask the waiter for two glasses!", "Để mình gọi nhân viên hai ly nhé!"),
  X("How is your noodle soup?", "Tô mì bò của bạn thế nào?", [["The broth is so rich and flavorful!", "Nước dùng đậm đà và thơm ngon lắm!"], ["Really good! Try squeezing some fresh lime in.", "Ngon cực! Bạn thử vắt thêm chút chanh tươi xem."], ["Soup is noodle water.", "(vô nghĩa)", false]], "Mmm, you're right—the lime makes it even better!", "Ừm, bạn nói đúng—thêm chanh vào ngon hẳn lên!"),
  X("Could you pass me the napkins, please?", "Bạn đưa giúp mình ít khăn giấy được không?", [["Sure, here you go!", "Được chứ, của bạn đây!"], ["We ran out—let's ask the waiter for some extra napkins.", "Hết mất rồi—để mình xin nhân viên thêm khăn giấy nhé."], ["Napkin is paper.", "(lạc đề)", false]], "Thanks so much!", "Cảm ơn bạn nhiều!"),
  X("Do you have room for dessert?", "Bụng bạn còn chỗ cho món tráng miệng không?", [["Always! Let's share a caramel pudding.", "Lúc nào cũng còn! Mình gọi chung bánh flan caramel nhé."], ["I'm pretty full, but I can take a bite!", "Mình khá no rồi, nhưng ăn thử một miếng thì được!"], ["Room is house.", "(hiểu nhầm nghĩa)", false]], "Yay! Their caramel pudding is famous.", "Tuyệt! Bánh flan ở đây nổi tiếng lắm đấy."),
  X("Shall we split the bill fifty-fifty?", "Mình chia đôi hoá đơn mỗi người một nửa nhé?", [["Sure, let's split it evenly.", "Được chứ, chia đôi đi."], ["I've got it tonight—you can get the next one!", "Tối nay để mình trả—lần sau bạn mời nhé!"], ["Split is cut paper.", "(vô nghĩa)", false]], "Aw, thank you! Dinner was wonderful.", "Ôi, cảm ơn bạn! Bữa tối nay tuyệt thật."),
  X("Should we leave a tip for the waiter?", "Mình để lại tiền tip cho nhân viên phục vụ nhé?", [["Definitely! The service was super friendly.", "Chắc chắn rồi! Phục vụ nhiệt tình dễ thương quá mà."], ["Yes, let's leave ten percent.", "Ừ, mình để lại 10% nhé."], ["Tip is money table.", "(sai)", false]], "Agreed! Let's thank the chef on our way out too.", "Đồng ý! Lúc ra mình ghé cảm ơn đầu bếp luôn nhé.")
 ],
 outdoor: [
  X("Where should we pitch our tent?", "Mình dựng lều ở đâu đây?", [["Right over there on that flat patch of grass.", "Ngay đằng kia trên khoảng cỏ bằng phẳng đó."], ["Near the pine trees so we have some shade.", "Gần hàng cây thông để có bóng râm nhé."], ["Tent is house cloth.", "(vô nghĩa)", false]], "Great spot! Let's set it up together.", "Chỗ đẹp đấy! Cùng dựng lều lên thôi."),
  X("Did you check the trail map yet?", "Bạn đã xem bản đồ đường mòn chưa?", [["Yes! The yellow trail leads up to the scenic lookout.", "Rồi! Đường mòn màu vàng dẫn lên điểm ngắm cảnh trên đồi."], ["Let's check with the park ranger first.", "Để mình hỏi kiểm lâm trước cho chắc nhé."], ["Map is paper road.", "(lạc đề)", false]], "Awesome! I brought my binoculars too.", "Tuyệt! Mình cũng có mang theo ống nhòm đây."),
  X("Can you help me gather some dry firewood?", "Bạn giúp mình gom ít củi khô được không?", [["Sure! I see plenty of dry branches by the trees.", "Được chứ! Mình thấy nhiều cành khô cạnh gốc cây kìa."], ["Of course, let's stack them inside the stone ring.", "Tất nhiên rồi, mình xếp gọn vào vòng đá nhé."], ["Firewood is tree burn.", "(sai)", false]], "Thanks! Our campfire is going to be so cozy.", "Cảm ơn nhé! Bếp lửa trại của tụi mình sẽ ấm cúng lắm đây."),
  X("How do you like your marshmallows roasted?", "Bạn thích nướng kẹo marshmallow kiểu nào?", [["Golden brown and gooey on the inside!", "Vàng ươm bên ngoài và dẻo mềm bên trong!"], ["Slightly toasted—not burnt!", "Hơi xém vàng thôi—đừng cháy đen nhé!"], ["Marshmallow is white sweet.", "(lạc đề)", false]], "Haha, hold the stick steady over the embers!", "Haha, vậy cầm que nướng đều tay trên than hồng nhé!"),
  X("Are you hungry after the hike? Want a sandwich?", "Leo đồi xong có đói không? Ăn bánh sandwich nhé?", [["Yes, please! Food always tastes better outdoors.", "Có chứ! Đồ ăn mang đi dã ngoại lúc nào cũng ngon hơn hẳn."], ["Definitely! And let's grab cold juice from the cooler.", "Chắc chắn rồi! Lấy thêm nước trái cây mát trong thùng đá nữa nhé."], ["Sandwich is bread two.", "(sai)", false]], "Here you go! Let's sit on the picnic blanket.", "Của bạn đây! Mình ngồi lên thảm dã ngoại ăn thôi."),
  X("Wanna go kayaking on the mountain lake?", "Xuống hồ trên núi chèo thuyền kayak không?", [["Yes! Let's put on our life jackets first.", "Có chứ! Mình mặc áo phao vào trước đã."], ["Sounds amazing—the water is so calm today.", "Nghe mê quá—mặt hồ hôm nay phẳng lặng ghê."], ["Kayak is boat water.", "(vô nghĩa)", false]], "Safety first! Race you across the lake!", "An toàn là trên hết! Đua qua bên kia hồ nhé!"),
  X("Can I look through the binoculars?", "Cho mình nhìn qua ống nhòm với được không?", [["Sure, here! Look at the snow on those mountain peaks.", "Được chứ, đây này! Nhìn tuyết trên mấy đỉnh núi đằng kia kìa."], ["Of course! You can see the whole pine valley.", "Tất nhiên rồi! Nhìn thấy toàn bộ thung lũng thông luôn đấy."], ["Binoculars is two eyes.", "(sai)", false]], "Whoa, the view from up here is breathtaking!", "Chà, khung cảnh nhìn từ trên này ngoạn mục thật!"),
  X("Did we put the campfire completely out?", "Mình đã dập tắt hoàn toàn bếp lửa trại chưa?", [["Yes, I poured water over the embers.", "Rồi, mình đã dội nước kỹ lên than hồng rồi."], ["All out! And we packed up everything so we leave no trace.", "Tắt hẳn rồi! Mình cũng thu dọn sạch sẽ không để lại dấu vết."], ["Fire is water out.", "(sai)", false]], "Awesome! We're responsible campers!", "Tuyệt vời! Tụi mình đúng là những người cắm trại văn minh!")
 ],
 school: [
  X("Did you finish the English homework for today?", "Bạn đã làm xong bài tập về nhà môn tiếng Anh hôm nay chưa?", [["Yes! I'm about to hand it in to Ms. Claire.", "Rồi! Mình chuẩn bị nộp cho cô Claire đây."], ["Yep, I finished all the sentences last night.", "Rồi, tối qua mình đã làm xong hết các câu rồi."], ["Homework is paper book.", "(vô nghĩa)", false]], "Nice! Let's hand our assignments in together.", "Tuyệt! Mình cùng lên nộp bài luôn nhé."),
  X("What page did the teacher say to open to?", "Cô giáo bảo mở sách giáo khoa ra trang mấy nhỉ?", [["Page twenty-four—Unit 5: Daily Communication.", "Trang 24—Bài 5: Giao tiếp hằng ngày đấy."], ["Open your textbook to page twenty-four.", "Bạn mở sách giáo khoa ra trang 24 nhé."], ["Book is page number.", "(sai)", false]], "Got it, thanks! Let's read the dialogue.", "Thấy rồi, cảm ơn bạn! Cùng đọc đoạn hội thoại thôi."),
  X("Can I borrow an extra pen? Mine just ran out of ink.", "Cho mình mượn thêm cây bút được không? Bút mình vừa hết mực.", [["Sure, I have a spare blue pen in my backpack.", "Được chứ, mình có cây bút xanh dự phòng trong cặp đây."], ["Of course! Here you go.", "Tất nhiên rồi! Của bạn đây."], ["Pen is write ink.", "(lạc đề)", false]], "You're a lifesaver! Now I can take notes.", "Cứu tinh của mình đây rồi! Giờ mình ghi chép bài được rồi."),
  X("Do you know how to answer the question on the whiteboard?", "Bạn có biết trả lời câu hỏi trên bảng trắng không?", [["Yes! 'I ride my bicycle to school.'", "Biết chứ! 'Tôi đạp xe đạp đến trường.'"], ["Yeah! Raise your hand and write it on the board!", "Có! Bạn giơ tay rồi lên bảng viết đi!"], ["Whiteboard is white wall.", "(vô nghĩa)", false]], "Go for it! Ms. Claire is looking for a volunteer.", "Lên luôn đi! Cô Claire đang tìm người xung phong kìa."),
  X("Wanna check out the library corner during break time?", "Giờ giải lao mình ghé góc thư viện xem sách không?", [["Good idea! I want to borrow an English storybook.", "Ý hay đấy! Mình muốn mượn một cuốn truyện tiếng Anh."], ["Sure! Mr. Leo just put out some new adventure books.", "Được chứ! Thầy Leo vừa bày mấy cuốn truyện phiêu lưu mới đấy."], ["Library is many book.", "(sai)", false]], "Awesome! Reading stories makes vocabulary so easy.", "Tuyệt! Đọc truyện giúp nhớ từ vựng dễ hơn hẳn."),
  X("Can you find Vietnam on that world globe?", "Bạn có tìm thấy Việt Nam trên quả địa cầu kia không?", [["Right here in Southeast Asia! Let me spin it.", "Ngay đây ở Đông Nam Á này! Để mình xoay cho xem."], ["Yes! And look, here is the United Kingdom too.", "Thấy chứ! Và nhìn này, đây là Vương quốc Anh nữa."], ["Globe is round ball.", "(lạc đề)", false]], "Cool! Geography in English is really fun.", "Hay thật! Học địa lý bằng tiếng Anh vui ghê."),
  X("Did you look through the microscope on the science table?", "Bạn đã nhìn thử qua kính hiển vi ở bàn khoa học chưa?", [["Yes! You can see tiny green leaf cells clearly.", "Rồi! Nhìn thấy rõ từng tế bào lá cây xanh nhỏ xíu luôn."], ["Just did—it looks amazing under the lens!", "Vừa xem xong—nhìn dưới ống kính kỳ diệu lắm!"], ["Microscope is small glass.", "(sai)", false]], "Whoa, I've gotta take a look too!", "Chà, mình cũng phải qua xem thử mới được!"),
  X("Where did you put your jacket?", "Bạn cất áo khoác ở đâu rồi?", [["I hung it neatly inside my student locker.", "Mình treo gọn trong tủ đồ cá nhân rồi."], ["It's in my locker by the classroom door.", "Ở trong tủ đồ của mình ngay cạnh cửa lớp ấy."], ["Jacket is wear cold.", "(sai)", false]], "Smart! The classroom is nice and warm.", "Chuẩn đấy! Trong phòng học ấm áp dễ chịu mà.")
 ]
};
const REACT = {
 home: [R("Sounds good!", "Nghe được đấy!"), R("No worries.", "Không sao."), R("Nice one!", "Hay đấy!"), R("Oh, that smells good.", "Ồ, thơm quá."), R("Want me to help?", "Cần mình giúp không?"), R("Take your time.", "Cứ từ từ."), R("That looks comfy.", "Trông thoải mái ghê."), R("You're so organized!", "Bạn ngăn nắp ghê!"), R("Careful, it's hot!", "Cẩn thận, nóng đấy!"), R("Good job!", "Giỏi lắm!"), R("I'm good, thanks.", "Mình ổn, cảm ơn."), R("Let's take a break.", "Nghỉ chút đi.")],
 cafe: [R("Ooh, that smells amazing.", "Ồ, thơm tuyệt."), R("Nice! I'll get the same.", "Hay! Mình gọi giống vậy."), R("This place is so cozy.", "Quán này ấm cúng ghê."), R("Careful, it's really hot.", "Cẩn thận, nóng lắm."), R("Good call on the window seat.", "Chọn chỗ cửa sổ hay đấy."), R("Is it sweet enough?", "Đủ ngọt không?"), R("That croissant looks fresh.", "Croissant trông mới ra lò."), R("No worries, I'll wait.", "Không sao, mình đợi."), R("Thanks for getting that!", "Cảm ơn đã lấy giúp!"), R("Wow, it's really crowded today.", "Hôm nay đông quá."), R("Let's grab a table.", "Kiếm bàn đi."), R("Mmm, this is so good.", "Ừm, ngon quá.")],
 market: [R("Good pick!", "Chọn hay!"), R("Those look really fresh.", "Trông tươi lắm."), R("Ooh, that's on sale!", "Ồ, đang giảm giá!"), R("Is that cheap or expensive?", "Rẻ hay đắt vậy?"), R("Don't forget the milk!", "Đừng quên sữa!"), R("The line's moving fast.", "Hàng đi nhanh đấy."), R("Nice, we're almost done.", "Hay, gần xong rồi."), R("Let me help you carry that.", "Để mình xách giúp."), R("That's a good deal.", "Hời đấy."), R("Sounds good.", "Nghe được."), R("Let's check the date first.", "Xem hạn trước đã."), R("All done? Let's head home.", "Xong chưa? Về thôi.")],
 park: [R("What a lovely breeze!", "Gió mát dễ chịu quá!"), R("The grass is so green today.", "Hôm nay cỏ xanh mướt."), R("Look how cute that puppy is!", "Nhìn chú cún đáng yêu chưa kìa!"), R("Let's sit in the shade.", "Ngồi dưới bóng râm đi."), R("The ducks are so funny!", "Mấy chú vịt ngộ nghĩnh ghê!"), R("Don't forget to throw away the wrapper.", "Đừng quên vứt vỏ rác vào thùng nhé."), R("This park is so relaxing.", "Công viên này thư giãn thật.")],
 restaurant: [R("This restaurant has such a warm vibe.", "Nhà hàng này có không gian ấm cúng ghê."), R("That beef broth smells incredible!", "Nước dùng bò thơm nức mũi luôn!"), R("Careful, the bowl is piping hot!", "Cẩn thận nhé, tô mì đang nóng hổi đấy!"), R("I love sitting by the window.", "Mình rất thích ngồi bàn cạnh cửa sổ."), R("The chef here is so talented.", "Đầu bếp ở đây khéo tay thật."), R("Save some room for caramel pudding!", "Nhớ chừa bụng ăn bánh flan nhé!"), R("The service here is top-notch.", "Phục vụ ở đây chu đáo điểm mười.")],
 outdoor: [R("Smell that fresh pine air!", "Ngửi mùi hương rừng thông trong lành chưa kìa!"), R("The mountain view is incredible out here.", "Cảnh núi non ngoài này hùng vĩ thật."), R("Camping by the lake is the best weekend plan.", "Cắm trại bên hồ đúng là kế hoạch cuối tuần tuyệt nhất."), R("Nothing beats a warm campfire and toasted marshmallows.", "Không gì sánh bằng lửa trại ấm áp và kẹo marshmallow nướng."), R("Remember to stay on the marked trail!", "Nhớ đi đúng theo đường mòn có biển chỉ dẫn nhé!"), R("Let's keep our campsite clean and leave no trace.", "Cùng giữ khu cắm trại sạch đẹp và không để lại rác nhé.")],
 school: [R("Ms. Claire's English class is always so fun!", "Tiết tiếng Anh của cô Claire lúc nào cũng vui ghê!"), R("Your notebook is so neat and organized.", "Vở ghi bài của bạn sạch đẹp và ngăn nắp thật."), R("Don't be shy—raise your hand and try speaking!", "Đừng ngại—cứ giơ tay luyện nói tiếng Anh đi!"), R("The library corner has so many great storybooks.", "Góc thư viện có bao nhiêu là truyện tiếng Anh hay."), R("Let's review the new vocabulary together.", "Tụi mình cùng ôn lại từ vựng mới trên bảng nhé."), R("Practicing with a classmate makes learning twice as fast!", "Luyện nói cùng bạn cùng lớp giúp tiến bộ nhanh gấp đôi!")]
};
/* Friend reactions to specific actions (onAction) */
const ON_ACT = {
 greet_barista: R("She's so nice, right?", "Chị ấy dễ thương nhỉ?"), read_the_menu: R("Everything looks good. What are you getting?", "Món nào cũng ngon. Bạn gọi gì?"),
 order_a_latte: R("Nice, a latte! I'll get one too.", "Hay, latte! Mình cũng gọi một ly."), choose_size: R("Large? Big day, huh?", "Cỡ lớn à? Hôm nay bận nhỉ?"),
 ask_for_takeaway: R("To go? Are we in a hurry?", "Mang đi à? Mình đang vội hả?"), pay_by_card: R("Thanks! I'll get the next one.", "Cảm ơn! Lần sau mình trả."),
 pay_in_cash: R("Old school. I like it.", "Kiểu truyền thống. Thích đấy."), wait_for_order: R("It's busy. Shouldn't be long.", "Đông khách. Chắc không lâu đâu."),
 pick_up_drink: R("Ooh, that smells amazing.", "Ồ, thơm tuyệt."), add_milk: R("A bit of milk? Good idea.", "Thêm sữa à? Ý hay."), add_sugar: R("Sweet tooth, huh?", "Hảo ngọt nhỉ?"),
 put_on_lid: R("Good, no spills.", "Tốt, khỏi đổ."), find_a_seat: R("Nice spot!", "Chỗ đẹp đấy!"), sit_by_window: R("Love this view. Good call!", "Thích view này. Chọn hay!"),
 ask_wifi_password: R("Thanks! Now I can send my homework.", "Cảm ơn! Giờ mình gửi bài được rồi."), drink_coffee_cafe: R("Mmm, this is so good.", "Ừm, ngon quá."),
 buy_a_croissant: R("Can I have a bite?", "Cho mình cắn một miếng nhé?"), eat_croissant: R("So flaky!", "Giòn tan luôn!"),
 clean_your_table: R("You're so tidy!", "Bạn gọn gàng ghê!"), throw_away_cup: R("Recycling, nice.", "Tái chế, hay đấy."), say_goodbye: R("That was fun. Same time next week?", "Vui ghê. Tuần sau gặp lại giờ này nhé?"),
 grab_a_cart: R("A cart? Big shopping day!", "Xe đẩy à? Mua nhiều đây!"), take_a_basket: R("A basket's enough.", "Giỏ là đủ rồi."), check_the_price: R("Is it cheap?", "Có rẻ không?"),
 look_for_discount: R("Ooh, half price!", "Ồ, giảm nửa giá!"), pick_some_apples: R("Those look so fresh.", "Trông tươi quá."), weigh_the_apples: R("How much is it?", "Bao nhiêu vậy?"),
 take_some_bananas: R("Great, I love bananas.", "Tuyệt, mình mê chuối."), ask_where_milk: R("Good question. I had no idea.", "Hỏi hay. Mình cũng không biết."),
 find_the_milk: R("Is it the fresh one?", "Có phải loại tươi không?"), check_the_date: R("Smart! Always check the date.", "Khôn đấy! Luôn xem hạn."),
 get_some_bread: R("Ooh, it's still warm.", "Ồ, còn ấm này."), grab_some_chips: R("Yes! Movie snacks.", "Tuyệt! Đồ ăn xem phim."), compare_prices: R("That one's cheaper, right?", "Cái kia rẻ hơn, đúng không?"),
 queue_at_checkout: R("The line's not too bad.", "Hàng không dài lắm."), ask_for_a_bag: R("Good, we've got lots to carry.", "Tốt, nhiều đồ lắm."), tap_my_card: R("Thanks! I'll pay you back.", "Cảm ơn! Mình trả lại sau."),
 get_the_receipt: R("Keep that, just in case.", "Giữ lại phòng khi cần."), pack_the_bags: R("Heavy stuff at the bottom!", "Đồ nặng để dưới!"), return_the_cart: R("Nice, good manners.", "Hay, lịch sự ghê."),
 leave_the_store: R("That was quick. Let's go home.", "Nhanh ghê. Về thôi."),
 enter_the_park: R("Yay, the park looks so green today!", "Tuyệt quá, công viên hôm nay xanh mát ghê!"),
 jog_around_park: R("Wait up! You're fast!", "Đợi mình với! Bạn chạy nhanh thế!"),
 put_on_leash: R("Good idea, safety first!", "Ý hay, an toàn là trên hết!"),
 walk_the_dog: R("Aw, he loves walking with us!", "Ôi, cún thích đi dạo cùng bọn mình kìa!"),
 throw_the_ball: R("Nice throw! Look at him go!", "Ném chuẩn đấy! Nhìn nó chạy kìa!"),
 pet_the_puppy: R("He's such a good boy!", "Chú cún ngoan quá đi!"),
 feed_the_ducks: R("Look, all the ducks are swimming over!", "Nhìn kìa, cả đàn vịt đang bơi lại!"),
 watch_the_ducks: R("They look so peaceful on the water.", "Trông chúng bơi trên mặt nước yên bình thật."),
 unlock_a_bike: R("Awesome! Let's go for a spin.", "Tuyệt! Đạp một vòng thôi."),
 ride_a_bike: R("Wheee! Feel that breeze!", "Uầy! Gió mát rượi luôn!"),
 sit_on_bench: R("Ah, nice and shady under this tree.", "À, dưới gốc cây này vừa mát vừa dễ chịu."),
 read_on_bench: R("Reading in the park is the best.", "Đọc sách ở công viên là nhất rồi."),
 sit_on_swing: R("Push higher! That looks fun!", "Đung đưa cao lên! Nhìn vui thế!"),
 smell_the_flowers: R("Mmm, the tulips smell so sweet!", "Ừm, hoa tulip thơm ngọt ngào ghê!"),
 take_park_photo: R("Cheese! Send me that picture later!", "Cười lên! Lát gửi ảnh cho mình nhé!"),
 greet_icecream_vendor: R("Ooh, ice cream time!", "Ồ, tới giờ ăn kem rồi!"),
 buy_an_ice_cream: R("Yum! I'll get a strawberry cone too.", "Ngon quá! Mình cũng lấy một cây ốc quế dâu."),
 eat_ice_cream: R("Eat it fast before it melts!", "Ăn nhanh kẻo kem chảy mất!"),
 drink_from_fountain: R("Cool and refreshing!", "Mát lạnh sảng khoái!"),
 throw_away_wrapper: R("Thanks for keeping the park clean!", "Cảm ơn bạn đã giữ công viên sạch đẹp!"),
 ask_for_a_table: R("Yay, a window table for two!", "Tuyệt quá, bàn hai người cạnh cửa sổ!"),
 sit_at_dining_table: R("These booth seats are so comfy.", "Ghế nệm ở bàn này êm ghê."),
 put_napkin_on_lap: R("Ooh, look at you with the fancy table manners!", "Ồ, nhìn bạn lịch sự chuẩn nhà hàng chưa kìa!"),
 check_the_menu: R("The beef noodle soup sounds amazing.", "Món mì bò nghe hấp dẫn quá."),
 ask_recommendation: R("Good idea! The waiter always knows best.", "Hỏi chuẩn đấy! Nhân viên lúc nào cũng rành món ngon nhất."),
 order_beef_noodles: R("Yum! Make that two bowls, please!", "Ngon quá! Cho tụi mình hai tô luôn nhé!"),
 ask_not_too_spicy: R("Smart call—mild broth lets you taste the herbs.", "Hợp lý đấy—nước dùng dịu mới rõ mùi thảo mộc."),
 order_iced_tea: R("Lemon iced tea goes so well with noodles!", "Trà chanh đá uống kèm mì bò là hợp bài nhất!"),
 ask_for_napkins: R("Thanks! Noodle soup can get a bit messy.", "Cảm ơn nhé! Ăn mì nước hay bị bắn lắm."),
 watch_the_chef: R("Look how fast the chef slices the beef!", "Nhìn đầu bếp thái thịt bò nhanh chưa kìa!"),
 thank_the_chef: R("Aw, look how happy you made the chef!", "Ôi, nhìn đầu bếp vui chưa kìa!"),
 pour_drinking_water: R("Thank you! I was really thirsty.", "Cảm ơn bạn! Mình đang khát khô cổ."),
 drink_iced_tea: R("Refreshing, right? Not too sweet either.", "Mát rượi nhỉ? Lại không bị ngọt gắt nữa."),
 squeeze_some_lime: R("Fresh lime makes the broth pop!", "Thêm chanh tươi vào nước dùng dậy vị hẳn!"),
 add_black_pepper: R("Ooh, a little pepper adds a nice kick.", "Ồ, rắc chút tiêu thơm nồng lên liền."),
 taste_the_broth: R("Isn't the broth super rich?", "Nước dùng ngọt xương đậm đà thật sự nhỉ?"),
 eat_main_course: R("So good! Best noodle soup in town.", "Ngon xuất sắc! Quán mì đỉnh nhất phố luôn."),
 order_sweet_dessert: R("Yes! Caramel pudding time!", "Tuyệt! Tới tiết mục bánh flan caramel rồi!"),
 eat_the_dessert: R("Mmm, the caramel is so silky!", "Ừm, lớp caramel mềm mịn tan trong miệng luôn!"),
 ask_for_the_bill: R("Ready to head out? Let's check the bill.", "Chuẩn bị về nhé? Để xem hoá đơn nào."),
 split_the_bill: R("Fair and square—fifty-fifty!", "Cưa đôi sòng phẳng—mỗi người một nửa nhé!"),
 pay_restaurant_bill: R("Thanks for handling the card! I'll send you my half.", "Cảm ơn bạn đã quẹt thẻ! Để mình chuyển khoản lại phần mình nhé."),
 check_trail_map: R("The lookout trail looks awesome!", "Cung đường mòn lên điểm ngắm cảnh trông mê quá!"),
 pack_up_campsite: R("Spotless! Leave no trace!", "Sạch bóng luôn! Không để lại dấu vết!"),
 ask_the_ranger: R("The park ranger is super helpful.", "Anh kiểm lâm hướng dẫn nhiệt tình thật."),
 check_weather_board: R("Clear skies all afternoon—lucky us!", "Trời quang mây tạnh suốt buổi chiều—tụi mình may thế!"),
 set_up_the_tent: R("Whoa, you pitched that tent so fast!", "Uầy, bạn dựng lều nhanh chuyên nghiệp thế!"),
 zip_up_tent: R("Good call, no mosquitoes tonight!", "Chuẩn luôn, tối nay khỏi lo muỗi bay vào!"),
 gather_dry_firewood: R("Nice dry branches! They'll burn well.", "Mấy cành củi khô cong! Bắt lửa tốt lắm đây."),
 light_the_campfire: R("Ooh, the campfire feels so warm and cozy!", "Ồ, lửa trại ấm áp dễ chịu quá!"),
 roast_marshmallows: R("Yum! Toast mine golden brown too!", "Ngon quá! Nướng giúp mình một viên vàng ươm với!"),
 put_out_campfire: R("Safety first! Not a single spark left.", "An toàn là trên hết! Không còn một tàn lửa nào luôn."),
 spread_picnic_blanket: R("That checkered blanket looks so cute on the grass!", "Tấm thảm kẻ caro trải trên cỏ nhìn xinh ghê!"),
 sit_on_picnic_blanket: R("So relaxing out here by the lake.", "Ngồi bên bờ hồ thế này thư giãn thật sự."),
 eat_picnic_sandwich: R("Mmm, best picnic sandwich ever!", "Ừm, bánh sandwich dã ngoại ngon đỉnh chóp!"),
 take_cold_juice: R("Toss me a cold bottle too, please!", "Lấy cho mình một chai mát lạnh với nhé!"),
 drink_cold_juice: R("So refreshing after setting up camp!", "Uống mát tỉnh cả người sau khi dựng trại!"),
 pack_water_bottle: R("Smart! Gotta stay hydrated on the trail.", "Chuẩn đấy! Đi đường mòn leo núi là phải mang đủ nước."),
 check_the_compass: R("North is right toward the ridge!", "Hướng bắc chỉ thẳng lên sống núi kìa!"),
 hike_to_lookout: R("We made it to the top! Look at that view!", "Lên tới đỉnh đồi rồi! Nhìn cảnh dưới kia kìa!"),
 use_binoculars: R("Can you see the snow on the distant peaks?", "Bạn có nhìn thấy tuyết trên mấy đỉnh núi xa xa không?"),
 put_on_life_jacket: R("All buckled up and ready to paddle!", "Cài khoá áo phao xong xuôi, sẵn sàng chèo thôi!"),
 paddle_the_kayak: R("Look how clear the lake water is!", "Nhìn nước hồ trong vắt chưa kìa!"),
 turn_on_camp_lantern: R("That warm lantern glow makes the camp look magical!", "Ánh đèn lồng ấm áp làm khu trại lung linh như cổ tích!"),
 greet_the_teacher: R("Ms. Claire always greets us with the warmest smile!", "Cô Claire lúc nào cũng đón tụi mình bằng nụ cười ấm áp nhất!"),
 check_class_schedule: R("Ooh, Speaking and Reading today—my favorite subjects!", "Ồ, hôm nay có tiết Luyện nói và Đọc sách—hai môn tủ của mình!"),
 read_the_board: R("Those example sentences on the whiteboard are super clear.", "Mấy câu ví dụ trên bảng trắng rõ ràng dễ hiểu ghê."),
 write_answer_on_board: R("Nice handwriting! Your sentence is spot on!", "Chữ bạn đẹp thế! Câu trả lời chuẩn không cần chỉnh luôn!"),
 clean_the_board: R("Look how spotless the whiteboard is now!", "Nhìn bảng trắng bạn lau sạch bóng chưa kìa!"),
 ask_teacher_question: R("Great question! I was wondering how to pronounce that too.", "Câu hỏi hay quá! Mình cũng đang thắc mắc cách phát âm từ đó."),
 hand_in_homework: R("Yay, A plus! All that studying paid off!", "Tuyệt vời, điểm A+ luôn! Công sức học bài xứng đáng thật!"),
 sit_at_student_desk: R("Front row buddies! Best spot in the classroom.", "Ngồi bàn đầu cùng nhau! Vị trí đắc địa nhất lớp."),
 open_english_textbook: R("Page twenty-four, right? I'm right there with you!", "Trang 24 đúng không? Mình cũng mở ra rồi đây!"),
 take_class_notes: R("Your notes are so neat! Can I compare with mine later?", "Bạn ghi chép gọn gàng thế! Lát cho mình dò bài cùng với nhé?"),
 raise_hand_to_speak: R("You're so confident in English class!", "Bạn phát biểu tiếng Anh tự tin thật đấy!"),
 take_out_notebook: R("Ready to write down all the new phrases!", "Sẵn sàng ghi lại hết các cụm từ mới thôi!"),
 pack_school_bag: R("All packed and tidy—nothing left behind!", "Xếp sách vở gọn gàng—không bỏ quên món nào!"),
 borrow_storybook: R("Ooh, that adventure storybook is a page-turner!", "Ồ, cuốn truyện phiêu lưu đó đọc cuốn lắm đấy!"),
 return_library_book: R("Right on time! Mr. Leo looks pleased.", "Trả sách đúng hạn chuẩn chỉ! Thầy Leo hài lòng ra mặt kìa."),
 spin_the_globe: R("Where in the world would you travel first?", "Nếu được đi du lịch thế giới thì bạn muốn tới nước nào đầu tiên?"),
 find_country_on_globe: R("You found Vietnam and the UK so fast!", "Bạn tìm thấy Việt Nam và Vương quốc Anh nhanh thật!"),
 look_through_microscope: R("Whoa, plant cells look like tiny green bricks!", "Uầy, tế bào lá cây nhìn như những viên gạch xanh tí hon ấy!"),
 water_class_plant: R("Aw, look! The classroom plant bloomed a yellow flower!", "Ôi nhìn kìa! Chậu cây của lớp nở ra bông hoa vàng xinh quá!"),
 open_student_locker: R("Having our own lockers in the classroom is so handy.", "Có tủ đồ cá nhân ngay trong lớp tiện lợi thật."),
 put_away_jacket: R("Nice and neat inside the locker!", "Treo gọn gàng ngay ngắn trong tủ rồi!"),
 drink_cup_of_water: R("A sip of cool water is great between lessons!", "Uống ngụm nước mát giữa giờ học tỉnh táo hẳn lên!")
};

/* ---------- WEATHER ---------- */
const WEATHERS = ["sunny", "rainy", "cold", "hot", "windy"];
const WX = {
 sunny: { icon: "☀️", vi: "Nắng đẹp", drink: "an iced latte",
  lines: [R("It's such a nice day today!", "Hôm nay trời đẹp quá!"), R("Lovely weather, isn't it?", "Thời tiết dễ chịu nhỉ?"), R("It's so bright—where are my sunglasses?", "Chói quá—kính râm của mình đâu?"), R("Perfect day for a walk.", "Ngày lý tưởng để đi dạo.")],
  rec: { cafe: R("Lovely day! How about an iced latte?", "Trời đẹp! Uống latte đá nhé?"), market: R("Nice weather—let's get some fresh fruit for a picnic!", "Trời đẹp—mua trái cây đi dã ngoại đi!"), park: R("What a sunny day! Ice cream cones are fresh and cold!", "Trời nắng đẹp quá! Kem ốc quế tươi mát lạnh đây!"), restaurant: R("Lovely evening! Our window table has a great view—try our lemon iced tea!", "Buổi tối đẹp trời quá! Bàn cạnh cửa sổ rất thoáng—mời bạn thử trà chanh đá nhé!"), outdoor: R("Clear sunny skies in Pine Valley! Great visibility from the scenic lookout today!", "Trời nắng trong xanh ở Thung lũng Thông! Tầm nhìn từ đồi ngắm cảnh hôm nay đẹp tuyệt vời!"), school: R("Bright sunny morning in Room 204! Open your textbook and let's start a lively class!", "Buổi sáng nắng đẹp tại phòng 204! Mở sách giáo khoa ra và bắt đầu tiết học thật sôi nổi nhé!"), home: R("Let's open the curtains. It's gorgeous out.", "Mở rèm ra đi. Ngoài trời đẹp lắm.") } },
 rainy: { icon: "🌧️", vi: "Mưa", drink: "a hot tea",
  lines: [R("It's pouring outside!", "Ngoài trời mưa như trút!"), R("I'm soaked! I forgot my umbrella.", "Mình ướt sũng! Quên ô rồi."), R("Ugh, it's so wet today.", "Ôi, hôm nay ướt át quá."), R("Let's wait till the rain stops.", "Đợi tạnh mưa đã.")],
  rec: { cafe: R("It's pouring—how about a hot tea?", "Mưa to—uống trà nóng nhé?"), market: R("It's raining—grab some soup for tonight?", "Trời mưa—mua súp cho tối nay nhé?"), park: R("A little rain keeps the grass green! Stand under the umbrella if you want a treat.", "Mưa chút cho cỏ xanh! Đứng dưới dù xe kem nếu bạn muốn ăn nhé."), restaurant: R("It's raining outside—a steaming bowl of beef noodle soup will warm you right up!", "Ngoài trời đang mưa—một tô mì bò bốc khói sẽ làm bạn ấm bụng ngay!"), outdoor: R("Light mountain shower! Zip up your tent door to keep your gear dry.", "Mưa rào nhẹ trên núi! Hãy kéo khoá kín cửa lều để giữ đồ đạc khô ráo nhé."), school: R("Rainy day outside! Hang your wet jacket in the locker and borrow a cozy storybook.", "Ngoài trời đang mưa! Em hãy treo áo khoác vào tủ đồ và mượn một cuốn truyện hay nhé."), home: R("Rainy day. Perfect for a movie inside.", "Trời mưa. Xem phim trong nhà là chuẩn.") } },
 cold: { icon: "🥶", vi: "Lạnh", drink: "a hot chocolate",
  lines: [R("It's freezing today!", "Hôm nay lạnh cóng!"), R("Brr, my hands are so cold.", "Brr, tay mình lạnh quá."), R("You should wear a jacket.", "Bạn nên mặc áo khoác."), R("I can see my breath!", "Thấy cả hơi thở luôn!")],
  rec: { cafe: R("It's freezing—how about a hot chocolate?", "Lạnh cóng—uống sô-cô-la nóng nhé?"), market: R("So cold! Let's get stuff for hot soup.", "Lạnh quá! Mua đồ nấu súp nóng đi."), park: R("Chilly day for a walk! A brisk jog will warm you right up.", "Trời lành lạnh! Chạy bộ một vòng là ấm người ngay."), restaurant: R("Chilly night! Our six-hour simmered beef broth is piping hot tonight.", "Đêm se lạnh! Nước dùng bò ninh 6 tiếng của quán đang nóng hổi đấy ạ."), outdoor: R("Crisp mountain air! Gather some dry firewood and light a cozy campfire.", "Không khí núi cao se lạnh! Hãy gom củi khô và nhóm một bếp lửa trại ấm áp nhé."), school: R("Chilly morning! Put your coat away in your locker—our classroom is nice and warm!", "Buổi sáng se lạnh! Em cất áo khoác vào tủ nhé — trong lớp học của chúng ta ấm áp lắm!"), home: R("It's cold. Want a warm blanket?", "Trời lạnh. Lấy chăn ấm không?") } },
 hot: { icon: "🥵", vi: "Nóng", drink: "an iced coffee",
  lines: [R("It's boiling hot today!", "Hôm nay nóng như đổ lửa!"), R("I'm sweating so much.", "Mình đổ mồ hôi quá trời."), R("Can we turn on the fan?", "Bật quạt được không?"), R("Stay hydrated, okay?", "Nhớ uống đủ nước nhé?")],
  rec: { cafe: R("It's so hot—iced coffee, for sure!", "Nóng quá—cà phê đá chứ còn gì!"), market: R("It's boiling—let's grab some ice cream!", "Nóng điên—mua kem đi!"), park: R("It's boiling hot! Grab a cold ice cream cone and sit in the shade!", "Trời nóng quá! Làm cây kem mát lạnh rồi ngồi dưới bóng cây nhé!"), restaurant: R("Warm evening! Start with a cold glass of lemon iced tea and chilled caramel pudding.", "Trời oi bức quá! Mời bạn dùng ly trà chanh đá mát lạnh và bánh flan ướp lạnh nhé."), outdoor: R("Warm day on the trail! Pack a full water bottle and keep cold juice in your cooler.", "Hôm nay đường mòn khá nắng ấm! Nhớ cất bình nước đầy vào ba lô và ướp lạnh nước cam nhé."), school: R("Warm afternoon at school! Remember to drink a cup of cool water during break time!", "Buổi chiều khá nắng ấm! Các em nhớ uống một cốc nước mát vào giờ giải lao nhé!"), home: R("So hot! Let's get some cold water.", "Nóng quá! Uống nước lạnh đi.") } },
 windy: { icon: "🌬️", vi: "Gió to", drink: "a warm latte",
  lines: [R("It's so windy out there!", "Ngoài kia gió to quá!"), R("My hair's a total mess.", "Tóc mình rối tung."), R("Hold on to your hat!", "Giữ chặt mũ nhé!"), R("The wind is crazy today.", "Hôm nay gió điên thật.")],
  rec: { cafe: R("So windy! A warm latte sounds perfect.", "Gió quá! Latte ấm là chuẩn."), market: R("Windy day—let's shop fast and go home.", "Gió to—mua nhanh rồi về."), park: R("Breezy day in the park! Hold on to your hat!", "Công viên hôm nay lộng gió! Giữ chặt mũ nhé!"), restaurant: R("It's windy out there! Come on in—it's warm and cozy inside Saigon Bistro.", "Ngoài trời gió lớn quá! Mời vào trong—không gian Saigon Bistro rất ấm cúng ạ."), outdoor: R("Breezy in the valley today! Pitch your tent tightly and watch your campfire embers.", "Thung lũng hôm nay nhiều gió! Hãy đóng cọc lều chắc chắn và trông chừng than lửa trại nhé."), school: R("Windy day outside the classroom window! Come take your seat and let's practice English.", "Ngoài cửa sổ lớp học đang lộng gió! Em vào chỗ ngồi để chúng ta cùng luyện tiếng Anh nhé."), home: R("Close the window, it's really windy.", "Đóng cửa sổ đi, gió to lắm.") } }
};
const WX_TALK = {
 sunny: X("Beautiful day, isn't it?", "Trời đẹp nhỉ?", [["It really is! Not a cloud in the sky.", "Đúng thật! Không một gợn mây."], ["Yeah, I love sunny days.", "Ừ, mình mê ngày nắng."], ["Day is beautiful sky weather.", "(vô nghĩa)", false]], "Let's enjoy it!", "Tận hưởng thôi!", "weather"),
 rainy: X("Did you get caught in the rain?", "Bạn bị mắc mưa à?", [["Yeah, I'm totally soaked.", "Ừ, ướt sũng luôn."], ["No, I had my umbrella.", "Không, mình có mang ô."], ["Rain caught me is.", "(sai)", false]], "Let's get something warm.", "Kiếm gì ấm ấm đi.", "weather"),
 cold: X("Aren't you cold?", "Bạn không lạnh à?", [["I'm freezing, actually.", "Thật ra lạnh cóng."], ["I'm okay. I've got a warm jacket.", "Mình ổn. Có áo ấm rồi."], ["Yes, I am cold weather.", "(sai)", false]], "Let's get something hot.", "Kiếm gì nóng đi.", "weather"),
 hot: X("It's so hot. Want something cold?", "Nóng quá. Uống gì lạnh không?", [["Yes, please! Something iced.", "Có! Món gì có đá."], ["Just some cold water, thanks.", "Nước lạnh thôi, cảm ơn."], ["Hot cold want.", "(vô nghĩa)", false]], "Good idea in this heat.", "Ý hay giữa trời nóng thế này.", "weather"),
 windy: X("Crazy wind today, huh?", "Hôm nay gió điên nhỉ?", [["Totally. My umbrella broke!", "Thật. Ô mình gãy luôn!"], ["Yeah, let's stay inside a bit.", "Ừ, ở trong một lúc đi."], ["Wind is windy is.", "(sai)", false]], "Ha, good plan.", "Haha, kế hoạch hay.", "weather")
};
const STAFF_WX = { cafe: "Barista", market: "Cashier", park: "Ice Cream Vendor", restaurant: "Waiter", outdoor: "Park Ranger", school: "English Teacher" };

/* ---------- VISITOR RULES & VISITORS (Contextual by Room) ---------- */
const VISITOR_FORBIDDEN_ROOMS = ["bedroom", "bathroom"];
const VISITOR_RULES = {
  neighbor: { role: "Hàng xóm", allowedRooms: ["garden", "living"], note: "Chỉ ở sân vườn hoặc ngoài cửa phòng khách" },
  delivery: { role: "Shipper / Giao hàng", allowedRooms: ["living", "garage"], note: "Ngoài cửa nhà hoặc nhà để xe" },
  oldfriend: { role: "Người quen / Bạn cũ", allowedRooms: ["market", "cafe", "cafe_counter", "cafe_bar", "cafe_seating", "cafe_terrace", "park", "restaurant"], note: "Ở siêu thị, quán cà phê, công viên, nhà hàng" },
  tourist: { role: "Khách du lịch hỏi đường", allowedRooms: ["park", "cafe", "cafe_counter", "cafe_seating", "cafe_terrace", "outdoor"], note: "Ở công viên, quán cà phê, ngoài trời" },
  jogger: { role: "Người cùng tập thể dục", allowedRooms: ["park"], note: "Ở công viên" },
  classmate: { role: "Bạn học", allowedRooms: ["school"], note: "Ở trường học" },
  monitor: { role: "Lớp trưởng / Bạn học", allowedRooms: ["school"], note: "Ở trường học" },
  regular: { role: "Khách quen quán cà phê", allowedRooms: ["cafe", "cafe_counter", "cafe_bar", "cafe_seating", "cafe_terrace"], note: "Ở quán cà phê" },
  shopper: { role: "Người mua hàng", allowedRooms: ["market"], note: "Ở siêu thị" },
  diner: { role: "Thực khách nhà hàng", allowedRooms: ["restaurant"], note: "Ở nhà hàng" },
  hiker: { role: "Người leo núi", allowedRooms: ["outdoor"], note: "Ở khu dã ngoại ngoài trời" }
};

const VISITORS = [
 { id: "neighbor", name: "Mrs. Park", avatar: "👵", vi: "Hàng xóm", rooms: VISITOR_RULES.neighbor.allowedRooms, pos: { garden: { x: 860, y: 590 }, living: { x: 900, y: 595 } }, items: [
   X("Hi neighbor! Your garden flowers look lovely—could I borrow a cup of sugar?", "Chào hàng xóm! Hoa ngoài vườn đẹp quá—cho bác mượn ít đường được không?", [["Of course! Let me grab some from the kitchen for you.", "Dạ được! Để cháu vào bếp lấy cho bác nhé."], ["Sure thing, Mrs. Park! Wait right by the door.", "Dạ được chứ bác Park! Bác đợi cháu ngay cửa nhé."], ["Sugar is sweet.", "(lạc đề)", false]], "You're a lifesaver, thank you!", "Cháu tốt quá, cảm ơn nhé!"),
   X("Good morning! Just passing by your front gate—did you hear that wind last night?", "Chào buổi sáng! Bác đi ngang cổng nhà cháu—tối qua cháu có nghe gió to không?", [["Yeah, the wind was blowing the garden trees all night.", "Dạ có, gió thổi cây ngoài vườn xào xạc cả đêm."], ["No, I slept soundly all night.", "Không ạ, cháu ngủ say cả đêm."], ["Night is noise.", "(vô nghĩa)", false]], "Glad everything in the yard is fine. Have a nice day!", "May là sân vườn không sao. Chúc cháu ngày tốt lành!")] },
 { id: "delivery", name: "Courier", avatar: "📦", vi: "Shipper giao hàng", rooms: VISITOR_RULES.delivery.allowedRooms, pos: { living: { x: 905, y: 595 }, garage: { x: 875, y: 600 } }, items: [
   X("Delivery for you at the front door! Could you sign here, please?", "Có đơn giao hàng ngoài cửa! Bạn ký nhận ở đây giúp nhé?", [["Sure, I'll sign right here. Thanks so much!", "Được, mình ký ngay đây. Cảm ơn shipper nhiều!"], ["Of course! You can leave the box by the garage door.", "Được ạ! Bạn để thùng hàng cạnh cửa gara giúp mình nhé."], ["Package is box.", "(lạc đề)", false]], "All done. Have a great day!", "Xong rồi. Chúc bạn một ngày tốt lành!"),
   X("Hi! Is this number 12 Green Street? I have an express parcel for you.", "Chào bạn! Đây có phải số 12 phố Green không? Mình có kiện hàng chuyển phát nhanh.", [["Yes, that's right! Thank you for delivering it.", "Vâng, đúng địa chỉ rồi! Cảm ơn bạn đã giao tới."], ["Yes, right here by the driveway. Thanks!", "Đúng rồi, ngay lối vào gara đây. Cảm ơn nhé!"], ["Street is green.", "(vô nghĩa)", false]], "Awesome, here's your parcel!", "Tuyệt quá, kiện hàng của bạn đây!")] },
 { id: "oldfriend", name: "Minh", avatar: "🧑", vi: "Bạn cũ", rooms: VISITOR_RULES.oldfriend.allowedRooms, items: [
   X("No way! Fancy bumping into you here! How have you been lately?", "Trời! Tình cờ gặp bạn ở đây! Dạo này bạn thế nào rồi?", [["Pretty good! Just out getting some fresh air and food.", "Khá ổn! Mình đang đi dạo và kiếm chút đồ ăn."], ["Busy with work, but doing great! Good to see you!", "Hơi bận việc nhưng rất ổn! Gặp lại bạn vui quá!"], ["I been fine is.", "(sai)", false]], "Same here! Let's grab a coffee together soon.", "Mình cũng vậy! Hôm nào tụi mình ngồi cà phê lâu hơn nhé."),
   X("Hey! Are you still practicing English every day?", "Này! Bạn vẫn luyện nói tiếng Anh mỗi ngày chứ?", [["Yep, every single day! Speaking feels much more natural now.", "Ừ, ngày nào cũng học! Giờ nói chuyện tự nhiên hơn nhiều rồi."], ["Yeah, little by little whenever I go out.", "Ừ, mình luyện từng chút mỗi khi ra ngoài."], ["English study me.", "(sai)", false]], "It really shows—your pronunciation sounds great!", "Thấy rõ luôn đấy—phát âm của bạn nghe chuẩn lắm!")] },
 { id: "tourist", name: "Tourist", avatar: "🧳", vi: "Khách du lịch hỏi đường", rooms: VISITOR_RULES.tourist.allowedRooms, items: [
   X("Excuse me! Could you tell me how to get to the nearest metro station?", "Xin lỗi! Bạn chỉ giúp tôi đường ra ga tàu điện gần nhất được không?", [["Go straight down this path and turn left at the traffic lights.", "Bạn đi thẳng lối này rồi rẽ trái ở ngã tư đèn giao thông nhé."], ["It's about a five-minute walk past the park entrance.", "Đi bộ khoảng 5 phút qua cổng công viên là tới ạ."], ["Train is fast.", "(lạc đề)", false]], "Thank you so much for your help!", "Cảm ơn sự giúp đỡ của bạn rất nhiều!"),
   X("Hi there! We're visiting for the weekend—is there a scenic spot nearby?", "Chào bạn! Tụi mình đi du lịch cuối tuần—gần đây có chỗ nào cảnh đẹp không?", [["Yes! The park fountain and the hillside lookout are both gorgeous.", "Có đấy! Đài phun nước công viên và đồi ngắm cảnh đều rất đẹp."], ["Definitely! Grab an iced coffee and walk along the tree-lined avenue.", "Chắc chắn rồi! Bạn mua ly cà phê đá rồi đi bộ dọc hàng cây rất thích."], ["Spot is map.", "(sai)", false]], "Awesome tip, we'll head right over!", "Gợi ý tuyệt quá, tụi mình sẽ ghé ngay!")] },
 { id: "regular", name: "Sam", avatar: "🧔", vi: "Khách quen quán cà phê", rooms: VISITOR_RULES.regular.allowedRooms, items: [
   X("Hey, is this chair by the cafe table free?", "Này, chiếc ghế cạnh bàn cà phê này có trống không?", [["Yeah, go ahead and take it.", "Ừ, trống đấy, bạn cứ lấy nhé."], ["Sorry, my friend is sitting right here.", "Xin lỗi, bạn mình đang ngồi ghế này rồi."], ["Seat free money.", "(vô nghĩa)", false]], "No worries at all, thanks!", "Không sao cả, cảm ơn bạn nhé!"),
   X("What drink do you recommend here? It's my first time at this café.", "Ở quán cà phê này đồ uống nào ngon? Lần đầu mình ghé.", [["Their iced caramel latte is super smooth.", "Món latte caramel đá ở đây thơm và mượt lắm."], ["Try a warm croissant with a freshly brewed cappuccino.", "Bạn thử bánh croissant nóng kèm cappuccino mới pha xem."], ["Here is good.", "(vô nghĩa)", false]], "Thanks for the recommendation!", "Cảm ơn bạn đã gợi ý nhé!")] },
 { id: "shopper", name: "Shopper", avatar: "🧑‍🦳", vi: "Người mua hàng", rooms: VISITOR_RULES.shopper.allowedRooms, items: [
   X("Excuse me, do you know which aisle the organic eggs are in?", "Xin lỗi, bạn có biết trứng gà sạch nằm ở dãy kệ nào không?", [["I think they're in the dairy section next to the fresh milk.", "Hình như ở quầy bơ sữa ngay cạnh tủ sữa tươi đấy ạ."], ["They're on aisle two, right across from the bakery.", "Ở dãy số 2, ngay đối diện quầy bánh mì nhé."], ["Eggs are round.", "(lạc đề)", false]], "Found them, thanks a lot!", "Tìm thấy rồi, cảm ơn bạn nhiều!"),
   X("Are you waiting in line for the checkout counter?", "Bạn đang xếp hàng chờ thanh toán ở quầy thu ngân à?", [["Yes, I'm next in line.", "Vâng, tới lượt mình ngay đây rồi."], ["No, I'm still browsing—please go ahead.", "Không, mình vẫn đang xem đồ—bạn cứ lên thanh toán trước đi."], ["Line is long.", "(lạc đề)", false]], "Oh, thank you! Appreciate it.", "Ồ, cảm ơn bạn nhé!")] },
 { id: "jogger", name: "Park Jogger", avatar: "🏃", vi: "Người cùng tập thể dục", rooms: VISITOR_RULES.jogger.allowedRooms, items: [
   X("Great weather for a workout in the park! Want to stretch or jog a lap together?", "Thời tiết ngoài công viên tập thể dục tuyệt thật! Bạn muốn khởi động hay chạy bộ cùng một vòng không?", [["Sure! Let's do a light warm-up and jog around the duck pond.", "Được chứ! Mình khởi động nhẹ rồi chạy một vòng quanh hồ vịt nhé."], ["I'm just taking a brisk walk today to get my steps in.", "Hôm nay mình chỉ đi bộ nhanh cho khỏe chân thôi."], ["Dog bite teeth.", "(sai)", false]], "Awesome! Keep up the healthy routine!", "Tuyệt lắm! Cùng duy trì thói quen rèn luyện sức khỏe nhé!"),
   X("Phew, that sprint was intense! Is the park drinking fountain working?", "Phù, pha chạy nước rút vừa rồi căng thật! Vòi nước uống công viên có mở không bạn?", [["Yes, the water is nice and cold—perfect after a run.", "Có đấy, nước mát lạnh—uống sau khi chạy bộ là chuẩn bài."], ["Yep, I just refilled my bottle there.", "Có, mình vừa mới lấy đầy bình nước ở đó xong."], ["Fountain is water.", "(lạc đề)", false]], "Awesome, thanks! Stay hydrated!", "Tuyệt vời, cảm ơn bạn! Nhớ uống đủ nước nhé!")] },
 { id: "diner", name: "Food Critic", avatar: "🧐", vi: "Thực khách nhà hàng", rooms: VISITOR_RULES.diner.allowedRooms, items: [
   X("Excuse me, that beef noodle soup at your table smells incredible! What did you order?", "Xin lỗi, tô mì bò ở bàn bạn thơm quá! Bạn gọi món gì trong thực đơn vậy?", [["It's the chef's special six-hour simmered beef noodle soup.", "Đây là món mì bò hầm 6 tiếng đặc biệt của bếp trưởng đấy."], ["I ordered the house beef noodles with fresh herbs and lime.", "Mình gọi mì bò đặc trưng của quán kèm rau thơm và chanh tươi."], ["Noodle is bowl.", "(vô nghĩa)", false]], "I'm definitely ordering a bowl right now. Thank you!", "Mình phải gọi ngay một tô mới được. Cảm ơn bạn nhé!"),
   X("Have you tried the caramel pudding here at Saigon Bistro?", "Bạn đã thử món bánh flan caramel ở nhà hàng Saigon Bistro này chưa?", [["Yes, it's silky smooth and not overly sweet!", "Rồi, bánh mềm mịn như lụa mà vị ngọt thanh rất vừa!"], ["We're just about to order two portions for dessert!", "Tụi mình chuẩn bị gọi hai phần tráng miệng đây!"], ["Pudding is yellow.", "(lạc đề)", false]], "Ooh, save one for me! Enjoy your meal!", "Ồ, chừa phần cho mình với nhé! Chúc ngon miệng!")] },
 { id: "hiker", name: "Mountain Hiker", avatar: "🥾", vi: "Người leo núi", rooms: VISITOR_RULES.hiker.allowedRooms, items: [
   X("Hey there! Do you know how far the scenic lookout is from this campsite?", "Chào bạn! Bạn có biết từ bãi cắm trại này lên đồi ngắm cảnh bao xa không?", [["It's just a ten-minute hike up the yellow pine trail.", "Chỉ khoảng 10 phút leo bộ theo đường mòn rừng thông màu vàng thôi."], ["Not far at all—follow the trail sign past the wooden bridge.", "Không xa đâu—cứ đi theo biển chỉ đường qua cây cầu gỗ là tới."], ["Lookout is hill tall.", "(sai)", false]], "Awesome, thanks! Happy camping!", "Tuyệt quá, cảm ơn bạn! Chúc cắm trại vui vẻ!"),
   X("That campfire smells wonderful! Are you roasting marshmallows?", "Bếp lửa trại ấm và thơm quá! Các bạn đang nướng kẹo marshmallow à?", [["Yes! Pull up a log and join us for a toasted marshmallow!", "Đúng rồi! Kéo khúc gỗ lại ngồi ăn kẹo nướng cùng tụi mình cho vui!"], ["Yeah, they're turning golden brown over the warm embers!", "Ừ, kẹo đang chín vàng ươm trên bếp than hồng ấm áp đây!"], ["Fire is hot stick.", "(vô nghĩa)", false]], "That's so kind of you! Have a cozy evening outdoors!", "Các bạn hiếu khách quá! Chúc buổi tối dã ngoại thật ấm cúng nhé!")] },
 { id: "classmate", name: "Lan (Classmate)", avatar: "🎒", vi: "Bạn học cùng lớp", rooms: VISITOR_RULES.classmate.allowedRooms, items: [
   X("Hey! Could I borrow a spare highlighter for our English vocabulary notes?", "Này! Cho mình mượn cây bút dạ quang để tô từ vựng tiếng Anh được không?", [["Sure, here's my yellow highlighter! Keep it until the end of class.", "Được chứ, bút dạ quang màu vàng của mình đây! Bạn cứ dùng hết tiết học nhé."], ["Of course! Let me grab one from my pencil case.", "Tất nhiên rồi! Để mình lấy trong hộp bút ra cho bạn."], ["Pen is yellow paper.", "(sai)", false]], "Thanks a bunch! You're the best desk mate!", "Cảm ơn nhiều nha! Bạn đúng là người bạn cùng bàn tuyệt nhất!"),
   X("Which exercise did the teacher assign for group practice?", "Cô giáo giao bài tập nào để luyện nói theo nhóm vậy bạn?", [["Exercise three on page twenty-five—practicing everyday questions.", "Bài số 3 trang 25—luyện hỏi đáp giao tiếp hàng ngày đấy."], ["We're role-playing a conversation about weather and hobbies.", "Tụi mình đóng vai hội thoại về thời tiết và sở thích nhé."], ["Book is page number.", "(vô nghĩa)", false]], "Got it! Let's practice together right now.", "Rõ rồi! Tụi mình cùng luyện luôn bây giờ nhé.")] },
 { id: "monitor", name: "Class Monitor", avatar: "🎓", vi: "Lớp trưởng", rooms: VISITOR_RULES.monitor.allowedRooms, items: [
   X("Hey! Did you hand in your English workbook to Ms. Claire yet?", "Này! Bạn đã nộp vở bài tập tiếng Anh cho cô Claire chưa?", [["Yes, I just placed it neatly on the teacher's desk!", "Rồi, mình vừa đặt ngay ngắn trên bàn cô giáo xong!"], ["Almost done—I'm checking my last sentence before handing it in.", "Sắp xong rồi—mình đang soát lại câu cuối trước khi lên nộp."], ["Homework is desk teacher.", "(sai)", false]], "Awesome! Ms. Claire is reviewing them right now.", "Tuyệt quá! Cô Claire đang chấm bài trên bàn rồi đấy."),
   X("Do you want to review the speaking dialogue together before the bell rings?", "Trước khi chuông reo vào tiết, mình cùng ôn lại bài hội thoại nhé?", [["Sure! You read Role A and I'll answer as Role B.", "Được chứ! Bạn đọc vai A còn mình trả lời vai B nhé."], ["Great idea! Let's open our textbooks to Unit 5.", "Ý hay đấy! Cùng mở sách giáo khoa Bài 5 nào."], ["Speak is mouth words.", "(vô nghĩa)", false]], "Yay! Practicing together makes speaking so much easier!", "Tuyệt! Luyện cùng nhau giúp nói tiếng Anh trôi chảy hơn hẳn!")] }
];

/* ---------- flat line bank (counts) ---------- */
function flat(topic) {
  const out = [];
  const addX = x => { out.push({ kind: "question", en: x.q, vi: x.qvi, tag: x.tag }); x.answers.filter(a => a.ok).forEach(a => out.push({ kind: "answer", en: a.en, vi: a.vi })); out.push({ kind: "reaction", en: x.r, vi: x.rvi }); };
  (TALK[topic] || []).forEach(addX);
  (REACT[topic] || []).forEach(r => out.push({ kind: "reaction", en: r.en, vi: r.vi }));
  WEATHERS.forEach(w => { if (WX[w].rec[topic]) out.push({ kind: "weather", en: WX[w].rec[topic].en, vi: WX[w].rec[topic].vi, weather: w }); });
  if (topic !== "home") Object.keys(ON_ACT).forEach(id => {
    const isCafe = /barista|read_the_menu|latte|size|takeaway|pay_by_card|pay_in_cash|wait_for|pick_up_drink|milk$|sugar|lid|find_a_seat|sit_by_window|wifi|coffee_cafe|croissant|clean_your_table|cup|goodbye/.test(id) && !/where_milk|find_the_milk|cup_of_water/.test(id);
    const isPark = /park|leash|walk_the_dog|throw_the_ball|puppy|ducks|bike|bench|swing|flowers|icecream|ice_cream|fountain|wrapper/.test(id);
    const isRest = /ask_for_a_table|dining_table|napkin|check_the_menu|recommendation|beef_noodles|spicy|iced_tea|chef|drinking_water|lime|pepper|broth|main_course|dessert|ask_for_the_bill|split_the_bill|pay_restaurant_bill/.test(id);
    const isOutdoor = /trail_map|campsite|ranger|weather_board|tent|firewood|campfire|marshmallows|picnic|cold_juice|water_bottle|compass|lookout|binoculars|life_jacket|kayak|camp_lantern/.test(id);
    const isSchool = /teacher|class_schedule|read_the_board|answer_on_board|clean_the_board|homework|student_desk|textbook|class_notes|raise_hand|take_out_notebook|school_bag|storybook|library_book|globe|microscope|class_plant|student_locker|away_jacket|cup_of_water/.test(id);
    const actTopic = isCafe ? "cafe" : isPark ? "park" : isRest ? "restaurant" : isOutdoor ? "outdoor" : isSchool ? "school" : "market";
    if (topic === actTopic) out.push({ kind: "reaction", en: ON_ACT[id].en, vi: ON_ACT[id].vi, action: id });
  });
  if (topic === "home") WEATHERS.forEach(w => WX[w].lines.forEach(l => out.push({ kind: "weather", en: l.en, vi: l.vi, weather: w })));
  return out;
}
const LINES = { home: flat("home"), cafe: flat("cafe"), market: flat("market"), park: flat("park"), restaurant: flat("restaurant"), outdoor: flat("outdoor"), school: flat("school") };

/* ---------- state ---------- */
let host = null, curRoom = null, wxNow = null, lastVisitor = Date.now(), timer = 0, wxTimer = 0, cardOpen = null, friendTalked = {};
const reduced = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } };
const SVGNS = "http://www.w3.org/2000/svg";
const FRIEND = { name: "Linh", avatar: "🧑‍🦱", voice: "young_female" };
const POS = { cafe: { x: 215, y: 622 }, market: { x: 118, y: 618 }, park: { x: 350, y: 555 }, restaurant: { x: 472, y: 540 }, outdoor: { x: 448, y: 552 }, school: { x: 342, y: 548 }, home: { x: 855, y: 610 } };

function weather() {
  const d = new Date(), day = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  if (!S.wx || S.wx.day !== day || WEATHERS.indexOf(S.wx.w) < 0) { S.wx = { day, w: pick(WEATHERS) }; save(); }
  return S.wx.w;
}
function setWeather(w) { if (WEATHERS.indexOf(w) < 0) return; weather(); S.wx.w = w; save(); drawWeather(true); }

/* ---------- SVG: friend figure (same flat style as #char) ---------- */
const depthScale = y => { try { if (typeof window.charScale === "function") return window.charScale(y) * 1.25; } catch (e) {} return 0.9 + (y - 380) / 400; };
const sortWorld = () => { try { if (typeof window.sortDepth === "function") window.sortDepth(); } catch (e) {} };
function friendSvg(p) {
  return `<g id="lt-friend" class="lt-friend" data-npc="linh" data-base="${p.y}" pointer-events="none" transform="translate(${p.x},${p.y}) scale(${depthScale(p.y).toFixed(3)})" tabindex="0" role="button" aria-label="Linh, your friend — talk">
  <rect class="lt-hit" x="-26" y="-182" width="52" height="186" rx="14" fill="transparent" pointer-events="all"/>
  <ellipse cx="0" cy="0" rx="26" ry="7" fill="#000" opacity=".2"/>
  <g class="lt-bob"><g transform="scale(-1,1)">
   <rect x="-10" y="-58" width="11" height="56" rx="5" fill="#2f3b4a"/><ellipse cx="-3" cy="-2" rx="9" ry="5" fill="#2a2420"/>
   <rect x="-1" y="-58" width="11" height="56" rx="5" fill="#394a5e"/><ellipse cx="7" cy="-2" rx="9" ry="5" fill="#33291f"/>
   <g transform="translate(0,-56)">
    <rect x="-8" y="-46" width="8" height="38" rx="4" fill="#3f9e8f"/>
    <rect x="-17" y="-52" width="34" height="56" rx="12" fill="#4fb8a6"/><rect x="-17" y="-8" width="34" height="10" rx="4" fill="#3a9484"/>
    <rect x="-5" y="-60" width="10" height="10" fill="#e8bf98"/>
    <circle cx="0" cy="-78" r="23" fill="#e8bf98"/>
    <path d="M-25 -76 Q-30 -108 -4 -106 Q8 -114 18 -104 Q30 -100 25 -80 Q20 -90 12 -92 Q14 -84 4 -92 Q-2 -84 -10 -92 Q-16 -84 -25 -76Z" fill="#2b1d16"/>
    <circle cx="-18" cy="-100" r="7" fill="#2b1d16"/><circle cx="-6" cy="-108" r="7" fill="#2b1d16"/><circle cx="8" cy="-108" r="7" fill="#2b1d16"/><circle cx="20" cy="-98" r="6" fill="#2b1d16"/>
    <circle cx="11" cy="-77" r="2.8" fill="#2d2a26"/><circle cx="-1" cy="-77" r="2.5" fill="#2d2a26"/>
    <path d="M2 -66 Q8 -61 13 -66" stroke="#9a4a3a" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="16" cy="-70" r="4" fill="#f7a8a0" opacity=".6"/>
    <g transform="translate(4,-44)"><rect x="-5" y="0" width="11" height="44" rx="5.5" fill="#4fb8a6"/><circle cx="0.5" cy="46" r="6.5" fill="#e8bf98"/></g>
   </g></g></g>
  <g class="lt-ping" transform="translate(0,-168)"><circle r="15" fill="#fff" stroke="#3a9484" stroke-width="2.5"/><text y="6" text-anchor="middle" font-size="17" font-weight="700" fill="#3a9484">?</text></g>
  <text class="lt-name" y="-150" text-anchor="middle" font-size="15" font-weight="700" fill="#24453f" stroke="#fff" stroke-width="4" paint-order="stroke">Linh</text>
 </g>`;
}
function drawFriend() {
  if (!host || !host.world) return;
  const old = host.world.querySelector("#lt-friend"); if (old) old.remove();
  if (!friendHere()) return;
  const r = (host && typeof host.room === "function") ? host.room() : curRoom;
  const g = document.createElementNS(SVGNS, "g"); g.innerHTML = friendSvg(POS[topicOf(r)]);
  const el = g.firstElementChild; host.world.appendChild(el); sortWorld();
  const go = e => { e.stopPropagation(); e.preventDefault(); talkFriend(); };
  el.addEventListener("click", go); el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") go(e); });
}

/* ---------- SVG: weather overlay (Cozy Bright Weather) ---------- */
function drawWeather(force) {
  if (!host || !host.svg) return;
  let g = host.svg.querySelector("#lt-wx");
  const w = weather();
  if (g && !force && g.getAttribute("data-w") === w) {
    host.svg.appendChild(g);
    const b = host.svg.querySelector("#lt-scene-bub"); if (b) host.svg.appendChild(b);
    return;
  }
  if (g) g.remove();
  g = document.createElementNS(SVGNS, "g"); g.id = "lt-wx"; g.setAttribute("class", "lt-wx" + (reduced() ? " lt-still" : "")); g.setAttribute("data-w", w);
  g.setAttribute("pointer-events", "none"); g.setAttribute("aria-hidden", "true");
  let s = "";
  if (w === "rainy") {
    // Cozy Bright Rain: no dark overlay! Subtle cool sky rim at top + warm indoor glow + bright silver raindrops + ground ripples
    s += `<defs>
      <linearGradient id="lt-rain-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#bae6fd" stop-opacity=".22"/>
        <stop offset="35%" stop-color="#e0f2fe" stop-opacity=".06"/>
        <stop offset="100%" stop-color="#fffbeb" stop-opacity=".08"/>
      </linearGradient>
    </defs>
    <rect width="1000" height="640" fill="url(#lt-rain-sky)"/>`;
    for (let i = 0; i < 44; i++) {
      const x = (i * 97) % 1000, y = (i * 53) % 580, d = (0.55 + (i % 5) * 0.11).toFixed(2);
      s += `<line class="lt-drop" x1="${x}" y1="${y}" x2="${x - 8}" y2="${y + 26}" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" opacity=".82" style="animation-duration:${d}s;animation-delay:-${(i % 7) * .13}s"/>`;
      s += `<line class="lt-drop" x1="${x + 1}" y1="${y}" x2="${x - 7}" y2="${y + 26}" stroke="#38bdf8" stroke-width="1.2" stroke-linecap="round" opacity=".55" style="animation-duration:${d}s;animation-delay:-${(i % 7) * .13}s"/>`;
    }
    for (let r = 0; r < 10; r++) {
      const rx = 90 + (r * 93) % 840, ry = 520 + (r * 37) % 105;
      s += `<ellipse cx="${rx}" cy="${ry}" rx="12" ry="3.5" fill="none" stroke="#e0f2fe" stroke-width="1.5" opacity=".75"/>`;
    }
  }
  if (w === "cold") { s += `<rect width="1000" height="640" fill="#e0f2fe" opacity=".1"/>`; for (let i = 0; i < 34; i++) { const x = (i * 131) % 1000, y = (i * 71) % 600; s += `<circle class="lt-flake" cx="${x}" cy="${y}" r="${2 + i % 3}" fill="#fff" opacity=".9" style="animation-duration:${4 + i % 4}s;animation-delay:-${i % 5}s"/>`; } }
  if (w === "sunny") s += `<defs><radialGradient id="lt-sun"><stop offset="0" stop-color="#fff7c2" stop-opacity=".75"/><stop offset="1" stop-color="#fff7c2" stop-opacity="0"/></radialGradient></defs><circle class="lt-glare" cx="930" cy="40" r="230" fill="url(#lt-sun)"/>`;
  if (w === "hot") s += `<rect width="1000" height="640" fill="#ff9a3c" opacity=".06"/><defs><radialGradient id="lt-heat"><stop offset="0" stop-color="#ffd27a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs><circle class="lt-glare" cx="940" cy="30" r="280" fill="url(#lt-heat)"/>`;
  if (w === "windy") for (let i = 0; i < 9; i++) { const y = 60 + i * 62; s += `<path class="lt-gust" d="M${-60 + (i * 83) % 300} ${y} q60 -16 120 0 t120 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".65" style="animation-delay:-${(i * .37).toFixed(2)}s"/>`; }
  s += `<g class="lt-wxbadge" pointer-events="all" style="cursor:pointer" transform="translate(18,18)" title="Bấm để đổi thời tiết (Nắng / Mưa / Lạnh / Gió / Nóng)"><rect width="142" height="36" rx="18" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" opacity=".95"/><text x="14" y="24" font-size="17">${WX[w].icon}</text><text x="40" y="24" font-size="14" font-weight="800" fill="#1e293b">${w[0].toUpperCase() + w.slice(1)} · ${WX[w].vi}</text></g>`;
  if (w === "cold" && host.svg.querySelector("#char")) s += `<g class="lt-breath"><circle r="7" fill="#fff" opacity=".7"/><circle cx="10" cy="-6" r="5" fill="#fff" opacity=".55"/></g>`;
  g.innerHTML = s; host.svg.appendChild(g);
  const badge = g.querySelector(".lt-wxbadge");
  if (badge) {
    badge.addEventListener("click", e => {
      e.stopPropagation();
      const idx = (WEATHERS.indexOf(w) + 1) % WEATHERS.length;
      const nw = WEATHERS[idx];
      setWeather(nw);
      try { if (window.ELW_DAY && ELW_DAY.state) { ELW_DAY.state.weather = nw === "rainy" ? "rainy" : nw === "cold" || nw === "windy" ? "cloudy" : "sunny"; ELW_DAY.applyLighting(host.svg, ELW_DAY.phase(), { weather: ELW_DAY.state.weather }); } } catch (err) {}
      try { if (window.ELW_CONTEXT && ELW_CONTEXT.sync) ELW_CONTEXT.sync(); } catch (err) {}
    });
  }
  const b = host.svg.querySelector("#lt-scene-bub"); if (b) host.svg.appendChild(b);
  positionBreath();
}
function positionBreath() {
  const b = host && host.svg && host.svg.querySelector(".lt-breath"); if (!b) return;
  const W = host.getW ? host.getW() : null; if (!W || typeof W.x !== "number") { b.setAttribute("display", "none"); return; }
  b.removeAttribute("display"); b.setAttribute("transform", `translate(${W.x + 30 * (W.dir || 1)},${W.y - 146})`);
}

/* ---------- speech & 3D in-scene bubble for Linh / NPC ---------- */
let ltBubTimer = 0;
function wrapLines(str, maxChars) {
  const words = String(str || "").split(/\s+/), lines = [];
  let cur = "";
  for (const w of words) {
    const tr = cur ? cur + " " + w : w;
    if (tr.length > maxChars && cur) { lines.push(cur); cur = w; }
    else cur = tr;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}
function resolveSceneAnchor(anchor) {
  const r = (host && typeof host.room === "function") ? host.room() : curRoom;
  const tp = topicOf(r);
  if (anchor === "#lt-friend" || anchor === "npc:linh") {
    const p = POS[tp] || { x: 320, y: 560 };
    const sc = depthScale(p.y);
    return { x: p.x, y: Math.max(85, p.y - 185 * sc) };
  }
  if (anchor === "#lt-visitor") {
    const p = { x: tp === "market" ? 880 : 900, y: 600 };
    return { x: p.x, y: 420 };
  }
  if (host && host.svg && typeof anchor === "string") {
    const sel = anchor.startsWith("obj:") ? `#o-${anchor.slice(4)}, [data-obj="${anchor.slice(4)}"]` : anchor;
    const el = host.svg.querySelector(sel);
    if (el) {
      try {
        const bb = el.getBBox();
        if (bb && bb.width > 0) return { x: bb.x + bb.width / 2, y: Math.max(80, bb.y - 12) };
      } catch (e) {}
    }
  }
  return { x: 350, y: 260 };
}
const pendingTimers = new Set();
let abortSeq = 0;
function schedTimeout(fn, ms) {
  const id = setTimeout(() => { pendingTimers.delete(id); fn(); }, ms);
  pendingTimers.add(id);
  return id;
}
function clearPendingTimers() {
  pendingTimers.forEach(id => clearTimeout(id));
  pendingTimers.clear();
  clearTimeout(wxTimer);
  wxTimer = 0;
}
function draw3DSpeechBubble(anchor, who, avatar, en, vi, kind, ttlMs) {
  if (!host || !host.svg || !en) return;
  const isLinh = who === FRIEND.name || anchor === "#lt-friend";
  if (isLinh ? !friendHere() : !isSurpriseEnabled(who)) return;
  let bg = host.svg.querySelector("#lt-scene-bub");
  if (!bg) {
    bg = document.createElementNS(SVGNS, "g");
    bg.id = "lt-scene-bub";
    bg.setAttribute("class", "lt-scene-bub");
    bg.setAttribute("pointer-events", "none");
  }
  bg.setAttribute("data-who", isLinh ? "linh" : String(who || "surprise"));
  host.svg.appendChild(bg);
  const pt = resolveSceneAnchor(anchor);
  const borderCol = isLinh ? "#10b981" : "#e8743b";
  const badgeBg = isLinh ? "#ecfdf5" : "#fff7ed";
  const badgeFg = isLinh ? "#065f46" : "#9a3412";
  const enLines = wrapLines(en, 34);
  const viLines = vi ? wrapLines(vi, 40) : [];
  const W2 = 340;
  const H = 36 + enLines.length * 22 + (viLines.length ? 6 + viLines.length * 18 : 0) + 12;
  const bx = Math.max(14, Math.min(1000 - W2 - 14, pt.x - W2 / 2));
  const by = Math.max(16, Math.min(640 - H - 24, pt.y - H - 14));
  const tailX = Math.max(24, Math.min(W2 - 24, pt.x - bx));
  let yCursor = 24;
  const enTspans = enLines.map(l => { const dy = yCursor += 22; return `<text x="14" y="${dy}" font-size="16.5" font-weight="800" fill="#0f172a" font-family="system-ui,sans-serif">${esc(l)}</text>`; }).join("");
  yCursor += 4;
  const viTspans = viLines.map(l => { const dy = yCursor += 18; return `<text x="14" y="${dy}" font-size="13.5" font-weight="600" fill="#047857" font-family="system-ui,sans-serif">${esc(l)}</text>`; }).join("");
  bg.innerHTML = `<g transform="translate(${bx.toFixed(1)},${by.toFixed(1)})">
    <rect x="3" y="5" width="${W2}" height="${H}" rx="16" fill="#0f172a" opacity=".16"/>
    <rect width="${W2}" height="${H}" rx="16" fill="#ffffff" stroke="${borderCol}" stroke-width="3"/>
    <rect x="10" y="7" width="${Math.min(W2 - 20, 175)}" height="22" rx="11" fill="${badgeBg}"/>
    <text x="18" y="22" font-size="13" font-weight="800" fill="${badgeFg}" font-family="system-ui,sans-serif">${esc(avatar || "💬")} ${esc(who)} · 🔊</text>
    ${enTspans}
    ${viTspans}
    <path d="M${(tailX - 10).toFixed(1)},${H - 1.5} L${tailX.toFixed(1)},${H + 13} L${(tailX + 10).toFixed(1)},${H - 1.5} Z" fill="#ffffff" stroke="${borderCol}" stroke-width="3" stroke-linejoin="round"/>
  </g>`;
  bg.style.opacity = "1";
  bg.style.transition = "opacity .25s ease";
  clearTimeout(ltBubTimer);
  ltBubTimer = schedTimeout(() => { if (bg) bg.style.opacity = "0"; }, ttlMs || 5500);
}
function voiceOf(anchor, who) {
  if (who === FRIEND.name || anchor === "#lt-friend") return FRIEND.voice;
  if (anchor === "obj:rangerpost") return "adult_male";
  if (anchor === "obj:barista" || anchor === "obj:icecreamcart" || anchor === "obj:waiter" || anchor === "obj:lakedock" || anchor === "obj:bookshelf") return "young_male";
  if (anchor === "obj:checkout" || anchor === "obj:teacherdesk") return "adult_female";
  return "adult_female";
}
function speakLine(anchor, who, avatar, en, vi, kind) {
  const isLinh = who === FRIEND.name || anchor === "#lt-friend";
  if (isLinh ? !friendHere() : !isSurpriseEnabled(who)) return Promise.resolve();
  const ttl = Math.max(4800, String(en || "").length * 115);
  try { draw3DSpeechBubble(anchor, who, avatar, en, vi, kind || "say", ttl); } catch (e) {}
  try { return Promise.resolve(host.say && host.say(en, voiceOf(anchor, who))).catch(() => {}); } catch (e) { return Promise.resolve(); }
}
const friendSay = r => friendHere() && host && host.world.querySelector("#lt-friend") ? speakLine("#lt-friend", FRIEND.name, FRIEND.avatar, r.en, r.vi) : Promise.resolve();

/* ---------- choice card ---------- */
function openCard(opt) {
  /* opt: {who, avatar, roleVi, x, onDone(ok)} */
  if (!host || !host.container) return;
  const isLinh = opt.who === FRIEND.name || opt.anchor === "#lt-friend";
  if (isLinh ? !friendHere() : !isSurpriseEnabled(opt.visitorId || opt.who)) return;
  const c = host.container, x = opt.x;
  const answers = shuffle(x.answers);
  cardOpen = opt;
  c.hidden = false;
  c.innerHTML = `<div class="lt-card" role="dialog" aria-label="${esc(opt.who)}">
   <div class="lt-head"><span class="lt-av">${opt.avatar}</span><b>${esc(opt.who)}</b>${opt.roleVi ? `<small>${esc(opt.roleVi)}</small>` : ""}<button class="lt-x" aria-label="Đóng">✕</button></div>
   <p class="lt-q">${esc(x.q)}<button class="lt-say" aria-label="Nghe lại">🔊</button></p><p class="lt-hint">${esc(x.qvi)}</p>
   <div class="lt-opts">${answers.map((a, i) => `<button class="lt-opt" data-i="${i}"><span>${esc(a.en)}</span><small>${esc(a.vi)}</small></button>`).join("")}</div>
   <p class="lt-fb" aria-live="polite"></p>
   <div class="lt-score">⭐ ${S.score.right}/${S.score.total}</div></div>`;
  const close = () => { c.innerHTML = ""; cardOpen = null; };
  c.querySelector(".lt-x").onclick = () => { close(); opt.onDone && opt.onDone(null); };
  c.querySelector(".lt-say").onclick = () => host.say && host.say(x.q, voiceOf(opt.anchor, opt.who));
  let answered = false;
  const mySeq = abortSeq;
  const wait = ms => new Promise(r => schedTimeout(r, ms));
  const cap = p => Promise.race([Promise.resolve(p).catch(() => {}), wait(7000)]);
  c.querySelectorAll(".lt-opt").forEach(b => b.onclick = async () => {
    if (answered) return;
    const a = answers[+b.dataset.i], fb = c.querySelector(".lt-fb");
    if (!a.ok) { b.classList.add("lt-bad"); fb.textContent = "Hmm, câu này chưa tự nhiên. Thử câu khác nhé!"; S.score.total++; save(); return; }
    answered = true; b.classList.add("lt-good"); S.score.right++; S.score.total++; save();
    fb.textContent = "👍 " + x.r;
    try { if (host.charSay) host.charSay(a.en); } catch (e) {}
    try { await cap(host.say && host.say(a.en)); } catch (e) {}
    await wait(220);
    if (cardOpen !== opt || mySeq !== abortSeq) return;
    await cap(speakLine(opt.anchor, opt.who, opt.avatar, x.r, x.rvi));
    await wait(350);
    if (cardOpen !== opt || mySeq !== abortSeq) return;
    close();
    opt.onDone && opt.onDone(true);
  });
  speakLine(opt.anchor, opt.who, opt.avatar, x.q, x.qvi, "request");
}

function talkFriend(forceX) {
  if (!host || !friendHere()) return;
  const t = topicOf(curRoom), w = weather();
  let x = forceX;
  if (!x) {
    const seen = friendTalked[t] = friendTalked[t] || [];
    const pool = TALK[t].filter(q => seen.indexOf(q.q) < 0);
    x = (!seen.includes(WX_TALK[w].q) && Math.random() < .3) ? WX_TALK[w] : pick(pool.length ? pool : TALK[t]);
    seen.push(x.q); if (seen.length > 8) seen.shift();
  }
  openCard({ who: FRIEND.name, avatar: FRIEND.avatar, roleVi: "Bạn thân", anchor: "#lt-friend", x, onDone: ok => {
    if (ok) { const W = host.getW && host.getW(); if (W) { W["lt_chat_" + t] = "yes"; } notifyMission(); }
  } });
}
function notifyMission() { try { const M = window.ELW_MISSION, W = host.getW(); if (M && M.onAction) M.onAction("lt_chat", "done", W); } catch (e) {} }

/* ---------- visitors ---------- */
function missionBusy() {
  try { if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.speaking) return true; } catch (e) {}
  try { const M = window.ELW_MISSION; if (M && M.active && M.active()) return true; } catch (e) {}
  try { const E = window.ELW; if (E && E.idle && !E.idle()) return true; } catch (e) {}
  return !!(host && host.isBusy && host.isBusy());
}
function visitorAllowedInRoom(v, r) {
  if (!v || !r || VISITOR_FORBIDDEN_ROOMS.indexOf(r) >= 0) return false;
  if (!isSurpriseEnabled(v.id)) return false;
  if (Array.isArray(v.rooms)) return v.rooms.indexOf(r) >= 0;
  return v.rooms === r;
}
function visitor(force) {
  if (!host || !S.visitors || !isSurpriseEnabled("surprise")) {
    if (host && host.world) { const oldV = host.world.querySelector("#lt-visitor"); if (oldV) oldV.remove(); }
    return false;
  }
  const r = (host && typeof host.room === "function") ? host.room() : curRoom;
  if (!r || VISITOR_FORBIDDEN_ROOMS.indexOf(r) >= 0) {
    if (host && host.world) { const oldV = host.world.querySelector("#lt-visitor"); if (oldV) oldV.remove(); }
    return false;
  }
  if (!force && (cardOpen || missionBusy())) return false;
  const pool = VISITORS.filter(v => visitorAllowedInRoom(v, r));
  if (!pool.length) return false;
  const v = pick(pool), x = pick(v.items);
  lastVisitor = Date.now();
  const old = host.world.querySelector("#lt-visitor"); if (old) old.remove();
  const customPos = v.pos && v.pos[r];
  const p = customPos || { x: r === "market" ? 880 : 900, y: 600 };
  const g = document.createElementNS(SVGNS, "g");
  g.innerHTML = `<g id="lt-visitor" class="lt-visitor" data-visitor="${esc(v.id)}" data-room="${esc(r)}" data-base="${p.y}" transform="translate(${p.x},${p.y}) scale(${depthScale(p.y).toFixed(3)})"><ellipse rx="24" ry="6" fill="#000" opacity=".18"/><circle cy="-60" r="40" fill="#fff" stroke="#e8743b" stroke-width="3"/><text y="-46" text-anchor="middle" font-size="44">${v.avatar}</text><text y="-112" text-anchor="middle" font-size="15" font-weight="700" fill="#5a3d1f" stroke="#fff" stroke-width="4" paint-order="stroke">${esc(v.name)}</text></g>`;
  const el = g.firstElementChild; host.world.appendChild(el); sortWorld();
  openCard({ who: v.name, avatar: v.avatar, roleVi: v.vi, anchor: "#lt-visitor", visitorId: v.id, x, onDone: () => schedTimeout(() => el.remove(), 1800) });
  return v.id;
}

/* ---------- missions ---------- */
const st = (n, icon, ten, tvi, actions, done, next, hen, hvi) => ({ n, icon, title_en: ten, title_vi: tvi, say_en: ten + ".", say_vi: tvi + ".", actions, done, next: typeof next === "function" ? next : () => next, hint: { en: hen, vi: hvi } });
const LINH = { id: "linh", name: "Linh", avatar: "🧑‍🦱", voice: "young_female" };
function story(log, hEn, hVi, parts, tEn, tVi) {
  const did = (log || []).map(x => x.id), en = [], vi = [];
  parts.forEach(p => { if (did.indexOf(p[0]) >= 0) { en.push(p[1]); vi.push(p[2]); } });
  const j = (a, and) => a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " " + and + " " + a[a.length - 1];
  return { en: hEn + (en.length ? " We " + j(en, "and") + "." : ""), vi: hVi + (vi.length ? " Hai bạn đã " + j(vi, "và") + "." : ""), mom_en: tEn, mom_vi: tVi };
}
/* Chat steps: done when the learner answered Linh (W.lt_chat_*) OR the paired real action ran with the companion on
   (onAction sets the flag, so "Làm ngay"/auto can always finish them through existing actions). */
const chatted = t => W => W["lt_chat_" + t] === "yes";
const MISSIONS = [
 { id: "life_coffee_with_friend", title_en: "Coffee with a friend", title_vi: "Cà phê với bạn", room: "cafe_counter", topic: "cafe", urgency: "normal", giver: LINH,
   desc_vi: "Đi cà phê với Linh: gọi đồ, trả tiền, ngồi cạnh cửa sổ và trò chuyện với Linh.",
   request: { en: "Coffee? My treat next time!", vi: "Đi cà phê không? Lần sau mình mời!" },
   steps: [
    st(1, "☕", "Order a latte", "Gọi một ly latte", ["order_a_latte"], W => W.cf_order && W.cf_order !== "none", "order_a_latte", "Order at the counter.", "Gọi đồ ở quầy."),
    st(2, "💳", "Pay for it", "Trả tiền", ["pay_by_card", "pay_in_cash"], W => W.cf_paid && W.cf_paid !== "no", "pay_by_card", "Pay by card or in cash.", "Trả bằng thẻ hoặc tiền mặt."),
    st(3, "🪟", "Sit by the window", "Ngồi cạnh cửa sổ", ["sit_by_window"], W => W.cf_seat === "window", "sit_by_window", "Linh loves the window seat.", "Linh thích chỗ cạnh cửa sổ."),
    st(4, "💬", "Chat with Linh", "Trò chuyện với Linh", ["drink_coffee_cafe"], chatted("cafe"), "drink_coffee_cafe", "Tap Linh and answer her question (or enjoy your drink together).", "Chạm vào Linh và trả lời câu hỏi (hoặc cùng uống)."),
   ],
   result: log => story(log, "Coffee with Linh was lovely!", "Đi cà phê với Linh thật vui!", [["order_a_latte", "ordered lattes", "gọi latte"], ["sit_by_window", "sat by the window", "ngồi cạnh cửa sổ"], ["drink_coffee_cafe", "chatted over coffee", "vừa uống vừa trò chuyện"]], "Let's do this again soon!", "Hẹn lần sau nhé!") },
 { id: "life_share_croissant", title_en: "Share a croissant", title_vi: "Chia bánh croissant", room: "cafe_counter", topic: "cafe", urgency: "normal", giver: LINH,
   desc_vi: "Linh muốn ăn croissant: mua bánh, chia nhau ăn, rồi dọn bàn.",
   request: { en: "I'm kinda hungry. Wanna share a croissant?", vi: "Mình hơi đói. Chia nhau cái croissant nhé?" },
   steps: [
    st(1, "🥐", "Buy a croissant", "Mua bánh croissant", ["buy_a_croissant"], W => W.cf_croissant && W.cf_croissant !== "none", "buy_a_croissant", "Pastries are in the glass case.", "Bánh ở tủ kính."),
    st(2, "💬", "Talk with Linh", "Nói chuyện với Linh", ["eat_croissant"], chatted("cafe"), "eat_croissant", "Tap Linh and answer (or eat the croissant together).", "Chạm Linh và trả lời (hoặc cùng ăn bánh)."),
    st(3, "🧽", "Clean the table", "Lau bàn", ["clean_your_table"], W => W.cf_tablemess === "clean", "clean_your_table", "Wipe the table before you go.", "Lau bàn trước khi về.")
   ],
   result: log => story(log, "We shared a croissant!", "Hai bạn đã chia nhau croissant!", [["buy_a_croissant", "bought a croissant", "mua croissant"], ["eat_croissant", "shared it", "chia nhau ăn"], ["clean_your_table", "cleaned the table", "lau bàn"]], "Yum! Thanks!", "Ngon quá! Cảm ơn nhé!") },
 { id: "life_shopping_with_linh", title_en: "Shopping with Linh", title_vi: "Đi siêu thị với Linh", room: "market", topic: "market", urgency: "normal", giver: LINH,
   desc_vi: "Đi chợ cùng Linh: lấy giỏ, chọn táo, hỏi ý Linh, lấy bánh mì và thanh toán.",
   request: { en: "Can you come shopping with me? I need a few things.", vi: "Đi siêu thị với mình nhé? Mình cần mua vài thứ." },
   steps: [
    st(1, "🧺", "Take a basket", "Lấy giỏ", ["take_a_basket", "grab_a_cart"], W => W.mk_basket === "have" || (W.mk_cart && W.mk_cart !== "none"), "take_a_basket", "Baskets are near the door.", "Giỏ ở gần cửa."),
    st(2, "🍎", "Pick some apples", "Chọn táo", ["pick_some_apples"], W => W.mk_apples && W.mk_apples !== "none", "pick_some_apples", "Apples are at the fruit stand.", "Táo ở quầy rau quả."),
    st(3, "💬", "Ask Linh's opinion", "Hỏi ý Linh", ["get_some_bread"], chatted("market"), "get_some_bread", "Tap Linh and answer (or grab the bread she wants).", "Chạm Linh và trả lời (hoặc lấy bánh mì Linh cần)."),
    st(4, "💳", "Tap my card", "Chạm thẻ thanh toán", ["tap_my_card"], W => W.mk_paid && W.mk_paid !== "no", "tap_my_card", "Pay at the checkout.", "Thanh toán ở quầy.")
   ],
   result: log => story(log, "Shopping with Linh was fun!", "Đi siêu thị với Linh vui ghê!", [["take_a_basket", "took a basket", "lấy giỏ"], ["pick_some_apples", "picked apples", "chọn táo"], ["get_some_bread", "got some bread", "lấy bánh mì"], ["tap_my_card", "paid by card", "trả bằng thẻ"]], "Thanks for coming with me!", "Cảm ơn bạn đã đi cùng!") },
 { id: "life_park_with_linh", title_en: "Park stroll with Linh", title_vi: "Dạo công viên với Linh", room: "park", topic: "park", urgency: "normal", giver: LINH,
   desc_vi: "Đi công viên với Linh: cho vịt ăn, mua kem, ngồi ghế dài trò chuyện và chụp ảnh bên luống hoa.",
   request: { en: "It's such a nice day! Let's go for a walk in the park!", vi: "Hôm nay trời đẹp quá! Cùng đi dạo công viên nhé!" },
   steps: [
    st(1, "🦆", "Feed the ducks", "Cho vịt ăn", ["feed_the_ducks"], W => W.pk_ducks === "fed", "feed_the_ducks", "Walk to the duck pond.", "Đi tới hồ vịt."),
    st(2, "🍦", "Buy an ice cream", "Mua kem", ["buy_an_ice_cream"], W => W.pk_icecream === "have" || W.pk_icecream === "eaten", "buy_an_ice_cream", "Get a cone from the vendor.", "Mua kem ở xe kem."),
    st(3, "💬", "Chat with Linh on the bench", "Ngồi ghế trò chuyện với Linh", ["sit_on_bench", "eat_ice_cream"], chatted("park"), "sit_on_bench", "Tap Linh and answer her question (or sit on the bench together).", "Chạm vào Linh và trả lời câu hỏi (hoặc ngồi ghế dài dưới bóng cây)."),
    st(4, "📸", "Take a photo by the flowers", "Chụp ảnh bên luống hoa", ["take_park_photo"], W => W.pk_photo === "taken", "take_park_photo", "Snap a picture at the flowerbed.", "Chụp một tấm ảnh bên luống hoa.")
   ],
   result: log => story(log, "Our park walk with Linh was awesome!", "Buổi đi dạo công viên với Linh thật tuyệt!", [["feed_the_ducks", "fed the ducks", "cho vịt ăn"], ["buy_an_ice_cream", "got ice cream", "mua kem"], ["sit_on_bench", "chatted on the bench", "ngồi ghế dài trò chuyện"], ["take_park_photo", "took a photo by the flowers", "chụp ảnh bên luống hoa"]], "Send me that photo later!", "Lát nhớ gửi ảnh cho mình nhé!") },
 { id: "life_dinner_with_linh", title_en: "Dinner with Linh", title_vi: "Ăn tối cùng Linh", room: "restaurant", topic: "restaurant", urgency: "normal", giver: LINH,
   desc_vi: "Đi ăn tối ở nhà hàng với Linh: xin bàn cho 2 người, gọi mì bò, trò chuyện với Linh và chia đôi hoá đơn.",
   request: { en: "I'm starving! Let's grab beef noodle soup together at Saigon Bistro!", vi: "Mình đói bụng quá! Cùng vào Saigon Bistro ăn mì bò nhé!" },
   steps: [
    st(1, "🪑", "Ask for a table for two", "Xin bàn cho 2 người", ["ask_for_a_table", "sit_at_dining_table"], W => W.rs_table === "booked" || W.sitting, "ask_for_a_table", "Ask at the host stand or take a seat.", "Xin bàn ở quầy lễ tân hoặc ngồi vào bàn."),
    st(2, "🍜", "Order the beef noodle soup", "Gọi món mì bò", ["order_beef_noodles"], W => W.rs_noodles === "served" || W.rs_noodles === "eaten", "order_beef_noodles", "Order from the waiter.", "Gọi món mì bò với nhân viên phục vụ."),
    st(3, "💬", "Chat with Linh over dinner", "Trò chuyện với Linh trong bữa tối", ["eat_main_course"], chatted("restaurant"), "eat_main_course", "Tap Linh and answer her question (or enjoy the noodles together).", "Chạm vào Linh và trả lời câu hỏi (hoặc cùng thưởng thức tô mì)."),
    st(4, "🧾", "Split the bill", "Chia đôi hoá đơn", ["split_the_bill", "pay_restaurant_bill"], W => W.rs_split === "yes" || W.rs_paid === "yes", "split_the_bill", "Go to the cashier desk and split the bill.", "Đến quầy thu ngân và chia đôi hoá đơn.")
   ],
   result: log => story(log, "Dinner with Linh was delicious!", "Bữa tối cùng Linh thật ngon miệng!", [["ask_for_a_table", "got a window table for two", "nhận bàn đôi cạnh cửa sổ"], ["order_beef_noodles", "ordered beef noodle soup", "gọi mì bò"], ["eat_main_course", "chatted over hot noodles", "vừa ăn mì nóng vừa trò chuyện"], ["split_the_bill", "split the bill fifty-fifty", "chia đôi hoá đơn"]], "That beef broth was incredible! Let's come back soon!", "Nước dùng bò ngon xuất sắc! Lần sau lại ghé nhé!") },
 { id: "life_camping_with_linh", title_en: "Camping with Linh", title_vi: "Cắm trại cùng Linh", room: "outdoor", topic: "outdoor", urgency: "normal", giver: LINH,
   desc_vi: "Đi cắm trại ở Thung lũng Thông cùng Linh: dựng lều, nhóm lửa nướng kẹo marshmallow, trò chuyện bên bếp lửa và dập lửa an toàn.",
   request: { en: "Let's camp out in Pine Valley! We can pitch a tent and roast marshmallows by the fire!", vi: "Cùng cắm trại ở Thung lũng Thông nhé! Mình dựng lều rồi nướng kẹo marshmallow bên bếp lửa!" },
   steps: [
    st(1, "⛺", "Set up the camping tent", "Dựng lều cắm trại", ["set_up_the_tent"], W => W.od_tent === "pitched", "set_up_the_tent", "Pitch the tent on the flat grass.", "Dựng lều trên khoảng cỏ phẳng."),
    st(2, "🔥", "Light the campfire", "Nhóm lửa trại", ["gather_dry_firewood", "light_the_campfire"], W => W.od_fire === "lit", "light_the_campfire", "Light a warm campfire inside the stone ring.", "Nhóm lửa trại bên trong vòng đá."),
    st(3, "💬", "Roast marshmallows & chat with Linh", "Nướng marshmallow & trò chuyện với Linh", ["roast_marshmallows", "eat_picnic_sandwich"], chatted("outdoor"), "roast_marshmallows", "Tap Linh and answer her question (or roast marshmallows together).", "Chạm vào Linh trả lời câu hỏi (hoặc cùng nướng kẹo marshmallow)."),
    st(4, "💧", "Put out the campfire safely", "Dập lửa trại an toàn", ["put_out_campfire", "pack_up_campsite"], W => W.od_fire === "out" || W.od_packed === "yes", "put_out_campfire", "Pour water on the embers to put the fire out.", "Dội nước dập tắt hoàn toàn bếp lửa trại.")
   ],
   result: log => story(log, "Camping with Linh in Pine Valley was magical!", "Chuyến cắm trại cùng Linh ở Thung lũng Thông thật tuyệt diệu!", [["set_up_the_tent", "pitched our tent together", "cùng dựng lều"], ["light_the_campfire", "lit a warm campfire", "nhóm bếp lửa trại ấm áp"], ["roast_marshmallows", "roasted marshmallows and chatted", "nướng kẹo marshmallow và trò chuyện"], ["put_out_campfire", "put out the campfire safely", "dập lửa trại an toàn"]], "Best camping trip ever! Let's go hiking again next weekend!", "Chuyến cắm trại tuyệt nhất từ trước tới giờ! Cuối tuần sau lại đi leo núi nhé!") },
 { id: "life_study_with_linh", title_en: "Study session with Linh", title_vi: "Học bài cùng Linh", room: "school", topic: "school", urgency: "normal", giver: LINH,
   desc_vi: "Cùng Linh học tiết tiếng Anh ở lớp: ngồi vào bàn học, mở sách giáo khoa, trò chuyện ôn bài cùng Linh và mượn truyện ở góc thư viện.",
   request: { en: "Class is starting! Let's sit at the front desk, review Unit 5 together, and borrow a storybook!", vi: "Vào tiết học rồi! Tụi mình ngồi bàn đầu, cùng ôn Bài 5 rồi ghé góc thư viện mượn truyện nhé!" },
   steps: [
    st(1, "🪑", "Sit at the student desk", "Ngồi vào bàn học", ["sit_at_student_desk"], W => W.sc_seat === "seated", "sit_at_student_desk", "Take your seat at the student desk.", "Ngồi vào chỗ ở bàn học sinh."),
    st(2, "📖", "Open the English textbook", "Mở sách giáo khoa tiếng Anh", ["open_english_textbook"], W => W.sc_textbook === "open", "open_english_textbook", "Open your textbook on the desk.", "Mở sách giáo khoa trên bàn học."),
    st(3, "💬", "Practice & chat with Linh", "Ôn bài & trò chuyện với Linh", ["take_class_notes", "write_answer_on_board"], chatted("school"), "take_class_notes", "Tap Linh and answer her question (or take class notes together).", "Chạm vào Linh trả lời câu hỏi (hoặc cùng ghi chép bài)."),
    st(4, "📚", "Borrow an English storybook", "Mượn sách truyện tiếng Anh", ["borrow_storybook"], W => W.sc_lib_book === "borrowed", "borrow_storybook", "Borrow a storybook from the library corner.", "Mượn một cuốn truyện ở kệ sách thư viện.")
   ],
   result: log => story(log, "Studying English with Linh at school was awesome!", "Buổi học tiếng Anh cùng Linh ở trường thật tuyệt vời!", [["sit_at_student_desk", "sat together at the front desk", "ngồi cạnh nhau ở bàn đầu"], ["open_english_textbook", "opened our English textbooks", "mở sách giáo khoa tiếng Anh"], ["take_class_notes", "practiced dialogues and took notes", "luyện hội thoại và ghi chép bài"], ["borrow_storybook", "borrowed an adventure storybook", "mượn một cuốn truyện phiêu lưu"]], "Having a study buddy makes English class twice as fun!", "Có bạn cùng học làm tiết tiếng Anh vui gấp đôi!") }
];
/* action that also completes the chat step (even if Linh is off, so missions never block) */
const CHAT_ACT = { drink_coffee_cafe: "cafe", eat_croissant: "cafe", get_some_bread: "market", sit_on_bench: "park", eat_ice_cream: "park", eat_main_course: "restaurant", eat_the_dessert: "restaurant", roast_marshmallows: "outdoor", eat_picnic_sandwich: "outdoor", sit_on_picnic_blanket: "outdoor", take_class_notes: "school", write_answer_on_board: "school", open_english_textbook: "school" };

/* ---------- hooks ---------- */
let reactCooldown = 0;
function onAction(id, W) {
  if (!host) return Promise.resolve();
  W = W || (host.getW && host.getW());
  const t = topicOf(curRoom);
  if (CHAT_ACT[id] && W) W["lt_chat_" + CHAT_ACT[id]] = "yes";
  if (/^go_/.test(id)) { onRoomEnter(host.room()); schedTimeout(() => onRoomEnter(host.room()), 80); schedTimeout(() => onRoomEnter(host.room()), 650); return Promise.resolve(); }
  if (!friendHere() || cardOpen || Date.now() < reactCooldown) return Promise.resolve();
  const r = ON_ACT[id] || (Math.random() < .25 ? pick(REACT[t]) : null);
  if (!r) return Promise.resolve();
  reactCooldown = Date.now() + 2500;
  const mySeq = abortSeq;
  return new Promise(res => schedTimeout(res, 220)).then(() => {
    if (!friendHere() || cardOpen || mySeq !== abortSeq) return;
    return friendSay(r);
  });
}
function onRoomEnter(roomId) {
  if (!host) return;
  roomId = roomId || host.room();
  const changed = roomId !== curRoom; curRoom = roomId;
  drawFriend(); drawWeather(false);
  if (!friendHere() && host.svg) {
    const b = host.svg.querySelector("#lt-scene-bub");
    if (b && (b.getAttribute("data-who") === "linh" || (b.textContent && b.textContent.indexOf(FRIEND.name) >= 0))) b.style.opacity = "0";
  }
  if (host.world) {
    const vEl = host.world.querySelector("#lt-visitor");
    if (vEl) {
      const vid = vEl.getAttribute("data-visitor");
      const vObj = VISITORS.find(x => x.id === vid);
      if (!S.visitors || !isSurpriseEnabled("surprise") || !visitorAllowedInRoom(vObj, roomId)) {
        vEl.remove();
        if (cardOpen && cardOpen.anchor === "#lt-visitor" && host.container) {
          host.container.innerHTML = "";
          cardOpen = null;
        }
      }
    }
  }
  clearTimeout(wxTimer);
  wxTimer = 0;
  if (changed && (roomId === "cafe" || roomId === "market" || roomId === "park" || roomId === "restaurant" || roomId === "outdoor" || roomId === "school")) {
    if (!isSurpriseEnabled("surprise") && !friendHere()) return;
    const w = weather(), rec = WX[w].rec[topicOf(roomId)];
    const mySeq = abortSeq;
    wxTimer = schedTimeout(() => {
      if (mySeq !== abortSeq || curRoom !== roomId || cardOpen || missionBusy()) return;
      const anchor = roomId === "cafe" ? "obj:barista" : roomId === "market" ? "obj:checkout" : roomId === "park" ? "obj:icecreamcart" : roomId === "restaurant" ? "obj:waiter" : roomId === "outdoor" ? "obj:rangerpost" : "obj:teacherdesk";
      const av = roomId === "cafe" ? "🧑‍🍳" : roomId === "market" ? "🧑‍💼" : roomId === "park" ? "🍦" : roomId === "restaurant" ? "🤵" : roomId === "outdoor" ? "🤠" : "👩‍🏫";
      if (isSurpriseEnabled(STAFF_WX[roomId])) {
        speakLine(anchor, STAFF_WX[roomId], av, rec.en, rec.vi).then(() => {
          if (mySeq === abortSeq && friendHere() && curRoom === roomId && !cardOpen && !missionBusy()) {
            wxTimer = schedTimeout(() => {
              if (mySeq === abortSeq && friendHere() && curRoom === roomId && !cardOpen && !missionBusy()) friendSay(pick(WX[w].lines));
            }, 350);
          }
        });
      } else if (friendHere()) {
        friendSay(pick(WX[w].lines));
      }
    }, 1500);
  }
}
function resetChat(topic) {
  abortSeq++;
  clearPendingTimers();
  clearTimeout(ltBubTimer);
  reactCooldown = 0;
  if (topic) delete friendTalked[topic]; else friendTalked = {};
  if (host && host.container) { host.container.innerHTML = ""; cardOpen = null; }
  if (host && host.world) { const v = host.world.querySelector("#lt-visitor"); if (v) v.remove(); }
  if (host && host.svg) { const b = host.svg.querySelector("#lt-scene-bub"); if (b) b.style.opacity = "0"; }
  drawFriend();
}
function tick() {
  if (!host) return;
  const r = host.room();
  if ((!S.visitors || !isSurpriseEnabled("surprise")) && host.world && host.world.querySelector("#lt-visitor")) {
    const v = host.world.querySelector("#lt-visitor");
    if (v) v.remove();
  }
  if (r !== curRoom || (friendHere() && !host.world.querySelector("#lt-friend")) || (!friendHere() && host.world.querySelector("#lt-friend")) || !host.svg.querySelector("#lt-wx")) onRoomEnter(r);
  positionBreath();
  if (S.visitors && isSurpriseEnabled("surprise") && !cardOpen && Date.now() - lastVisitor >= S.visitorEveryMs && Math.random() < .4 && !missionBusy()) visitor(false);
}

function init(h) {
  host = h || host;
  if (!host) return;
  if (!document.getElementById("lt-css")) { const s = document.createElement("style"); s.id = "lt-css"; s.textContent = CSS; document.head.appendChild(s); }
  if (host.container) host.container.classList.add("lt-host");
  lastVisitor = Date.now();
  /* a friend mission starts with a fresh "chatted" flag, so the chat step is really done inside the mission */
  const M = window.ELW_MISSION;
  if (M && M.start && !M.start.__lt) {
    const o = M.start;
    const wrapped = function (id) {
      if (/^life_/.test(id)) {
        const W = host.getW && host.getW();
        if (W) { delete W.lt_chat_cafe; delete W.lt_chat_market; delete W.lt_chat_park; delete W.lt_chat_restaurant; delete W.lt_chat_outdoor; delete W.lt_chat_school; }
      }
      return o.apply(this, arguments);
    };
    wrapped.__lt = true;
    M.start = wrapped;
    api._rawMissionStart = wrapped;
  }
  onRoomEnter(host.room());
  clearInterval(timer); timer = setInterval(tick, 1000);
}
let _syncingCompanion = false;
function setCompanion(on, opts) {
  opts = opts || {};
  S.companion = !!on;
  save();
  if (!opts.fromContext && !_syncingCompanion) {
    _syncingCompanion = true;
    try {
      if (typeof window !== "undefined" && window.ELW_CONTEXT && typeof window.ELW_CONTEXT.setSideCharacterEnabled === "function") {
        window.ELW_CONTEXT.setSideCharacterEnabled("linh", S.companion, { fromLife: true, silent: true });
      }
    } catch (e) {}
    _syncingCompanion = false;
  }
  drawFriend();
  if (friendHere() && host && !opts.silent) {
    const r = (typeof host.room === "function") ? host.room() : curRoom;
    const t = topicOf(r);
    const greet = pick(REACT[t] || REACT.cafe);
    if (greet) speakLine("#lt-friend", FRIEND.name, FRIEND.avatar, greet.en, greet.vi, "say");
  } else if (!friendHere()) {
    teardown("linh");
  }
  return S.companion;
}
function teardown(target) {
  const k = String(target || "all").toLowerCase();
  abortSeq++;
  const isLinh = k === "linh" || k === "friend" || k === "companion";
  const isAll = k === "all" || k === "*";
  const isSurprise = isAll || k === "surprise" || k === "visitors" || k === "visitor" || (!isLinh);
  if (isSurprise) {
    clearPendingTimers();
    if (host && host.world) {
      Array.prototype.slice.call(host.world.querySelectorAll("#lt-visitor, .lt-visitor")).forEach(el => el.remove());
    }
    if (typeof document !== "undefined") {
      Array.prototype.slice.call(document.querySelectorAll("#lt-visitor, .lt-visitor")).forEach(el => el.remove());
    }
    if (cardOpen && cardOpen.who !== FRIEND.name && host && host.container) {
      host.container.innerHTML = "";
      cardOpen = null;
    }
    if (host && host.svg) {
      const b = host.svg.querySelector("#lt-scene-bub");
      if (b && b.getAttribute("data-who") !== "linh") {
        b.style.opacity = "0";
        b.innerHTML = "";
      }
    }
  }
  if (isAll || isLinh) {
    if (host && host.world) {
      Array.prototype.slice.call(host.world.querySelectorAll("#lt-friend, .lt-friend")).forEach(el => el.remove());
    }
    if (typeof document !== "undefined") {
      Array.prototype.slice.call(document.querySelectorAll("#lt-friend, .lt-friend")).forEach(el => el.remove());
    }
    if (cardOpen && cardOpen.who === FRIEND.name && host && host.container) {
      host.container.innerHTML = "";
      cardOpen = null;
    }
    if (host && host.svg) {
      const b = host.svg.querySelector("#lt-scene-bub");
      if (b && b.getAttribute("data-who") === "linh") {
        b.style.opacity = "0";
        b.innerHTML = "";
      }
    }
  }
}

const CSS = `
.lt-host:empty{display:none}
.lt-card{background:#fffdf8;border:2px solid #3a9484;border-radius:16px;padding:12px;box-shadow:0 6px 20px rgba(0,0,0,.15);font:15px/1.35 system-ui,sans-serif;color:#2b2420;max-width:100%;box-sizing:border-box}
.lt-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}.lt-head small{color:#6b5d50;font-size:12px}
.lt-av{font-size:26px}.lt-x{margin-left:auto;min-width:44px;min-height:44px;border:0;background:#f1ebe2;border-radius:12px;font-size:16px;cursor:pointer}
.lt-q{font-size:18px;font-weight:700;margin:4px 0 0;display:flex;gap:6px;align-items:flex-start}.lt-say{border:0;background:none;font-size:18px;min-width:44px;min-height:44px;cursor:pointer;margin-left:auto}
.lt-hint{font-size:12px;color:#7a6b5e;margin:0 0 8px}
.lt-opts{display:grid;gap:8px}
.lt-opt{display:flex;flex-direction:column;align-items:flex-start;text-align:left;min-height:52px;padding:8px 12px;border:2px solid #d9cbb8;border-radius:12px;background:#fff;font:inherit;cursor:pointer;color:inherit;word-break:break-word}
.lt-opt span{font-weight:600}.lt-opt small{font-size:12px;color:#8a7a6c}
.lt-opt.lt-good{border-color:#3aa76d;background:#e9f8ef}.lt-opt.lt-bad{border-color:#e05a4a;background:#fdeceb;opacity:.7}
.lt-fb{min-height:1.2em;margin:8px 0 0;font-size:14px;color:#24453f}.lt-score{font-size:12px;color:#6b5d50;text-align:right}
#lt-friend{cursor:pointer}#lt-friend .lt-hit{cursor:pointer}#lt-friend:focus{outline:none}#lt-friend:focus .lt-ping circle{stroke-width:4}
.lt-ping{animation:lt-pulse 1.6s ease-in-out infinite}
@keyframes lt-pulse{50%{opacity:.55}}
.lt-drop{animation:lt-rain linear infinite}@keyframes lt-rain{from{transform:translate(0,-40px)}to{transform:translate(-14px,60px)}}
.lt-flake{animation:lt-snow linear infinite}@keyframes lt-snow{from{transform:translate(0,-30px)}to{transform:translate(18px,70px)}}
.lt-gust{animation:lt-wind 3s ease-in-out infinite}@keyframes lt-wind{0%{transform:translateX(-80px);opacity:0}50%{opacity:.6}100%{transform:translateX(420px);opacity:0}}
.lt-glare{animation:lt-glow 5s ease-in-out infinite}@keyframes lt-glow{50%{opacity:.7}}
.lt-breath{animation:lt-puff 2.4s ease-out infinite}@keyframes lt-puff{0%{opacity:0}30%{opacity:.8}100%{opacity:0}}
.lt-still *,.lt-still{animation:none!important}
@media (prefers-reduced-motion:reduce){.lt-wx *,.lt-ping{animation:none!important}}
`;

const api = {
  init, tick, onAction, onRoomEnter, resetChat, weather, setWeather, setCompanion, companionOn: () => !!(isLinhEnabled() && S.companion), friendHere, teardown,
  missions: MISSIONS, lines: LINES, talk: TALK, visitors: VISITORS, visitorRules: VISITOR_RULES, forbiddenVisitorRooms: VISITOR_FORBIDDEN_ROOMS, css: CSS,
  talk_friend: talkFriend, friendSay, draw3DSpeechBubble, visitor: () => visitor(true), score: () => Object.assign({}, S.score),
  config(o) { if (o) { if (typeof o.visitorEveryMs === "number") S.visitorEveryMs = Math.max(10000, o.visitorEveryMs); if (typeof o.visitors === "boolean") S.visitors = o.visitors; save(); } return { visitorEveryMs: S.visitorEveryMs, visitors: S.visitors }; },
  counts: () => ({ home: LINES.home.length, cafe: LINES.cafe.length, market: LINES.market.length, park: LINES.park.length, restaurant: LINES.restaurant.length, outdoor: LINES.outdoor.length, school: LINES.school.length })
};
api.talkFriend = talkFriend; delete api.talk_friend;
if (typeof window !== "undefined") window.ELW_LIFE = api;
if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
