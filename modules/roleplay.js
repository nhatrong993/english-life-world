/* English Life World — room-linked multi-character roleplay.
 * Exposes window.ELW_ROLEPLAY (also module.exports in Node). No dependencies. */
(function (root) {
  "use strict";
  var CHARACTERS = {
    dad:     { id:"dad", name:"Dad", nameVi:"Bố", role:"father", avatar:"👨", voice:"adult_male", personality:"Calm, patient, loves small jokes", register:"relaxed, friendly, light humour" },
    mom:     { id:"mom", name:"Mom", nameVi:"Mẹ", role:"mother", avatar:"👩", voice:"adult_female", personality:"Caring, warm, a little worried about you", register:"warm, gentle, encouraging" },
    grandpa: { id:"grandpa", name:"Grandpa", nameVi:"Ông", role:"grandfather", avatar:"👴", voice:"elderly", personality:"Slow, wise, tells old stories", register:"old-fashioned phrases: 'my dear', 'in my day', 'splendid'" },
    tom:     { id:"tom", name:"Tom", nameVi:"Anh Tom", role:"older brother", avatar:"🧑", voice:"young_male", personality:"Casual, teasing, easy-going", register:"casual: 'hey', 'cool', 'no way', 'gonna'" },
    lily:    { id:"lily", name:"Lily", nameVi:"Bé Lily", role:"little sister", avatar:"👧", voice:"child", personality:"Curious, excited, asks lots of questions", register:"short simple words" },
    me:      { id:"me", name:"You", nameVi:"Bạn", role:"learner", avatar:"🙂", voice:"young_female" }
  };

  function N(who, en, vi, next) { var l = { who: who, en: en, vi: vi }; if (next !== undefined) l.next = next; return l; }
  // M(intent, keywords, [sampleEn, sampleVi], choices[[en,vi,ok,next,feedback_vi,action]], opts{action,next})
  function M(intent, kw, s, ch, o) {
    o = o || {};
    var l = { who: "me", en: s[0], vi: s[1],
      expect: { intent: intent, keywords: kw, sample_en: s[0], sample_vi: s[1] },
      choices: ch.map(function (c) {
        var r = { en: c[0], vi: c[1], ok: !!c[2] };
        if (c[3] !== undefined && c[3] !== null) r.next = c[3];
        r.feedback_vi = c[4] || (c[2] ? "Tốt lắm! Câu trả lời tự nhiên." : "Chưa hợp ngữ cảnh, thử lại nhé.");
        if (c[5]) r.action = c[5];
        return r;
      }) };
    if (o.action) l.action = o.action;
    if (o.next !== undefined) l.expect.next = o.next;
    return l;
  }
  var SCENES = {}, TRIGGERS = {};
  function def(id, who, level, room, trig, lines) {
    SCENES[id] = { who: who, level: level, room: room, lines: lines };
    trig.forEach(function (a) { (TRIGGERS[a] = TRIGGERS[a] || []).push(id); });
  }
  var BAD = "Câu này không trả lời đúng câu hỏi.";

  /* ---------------- LIVING ROOM ---------------- */
  def("tv_dad", "dad", "A1", "living", ["turn_on_tv"], [
    N("dad", "Oh, TV time? What are you watching?", "Ồ, giờ xem TV à? Con đang xem gì thế?"),
    M("tell_show", ["cartoon","movie","news","show","film","football","watching","series","music"], ["I'm watching a cartoon.", "Con đang xem phim hoạt hình."], [
      ["I'm watching a cartoon.", "Con đang xem phim hoạt hình.", true],
      ["Just the news, Dad.", "Chỉ xem thời sự thôi bố.", true],
      ["I am eight years old.", "Con tám tuổi.", false, null, BAD]]),
    N("dad", "Nice. Can I join you? I'll bring the snacks.", "Hay đấy. Bố xem cùng được không? Bố sẽ mang đồ ăn vặt."),
    M("accept_offer", ["sure","yes","of course","okay","ok","come","join","great"], ["Sure, come and sit with me!", "Được ạ, bố ngồi với con đi!"], [
      ["Sure, come and sit with me!", "Được ạ, bố ngồi với con đi!", true, null, null, "sit_on_sofa"],
      ["Sorry Dad, I want to watch alone.", "Xin lỗi bố, con muốn xem một mình.", true, 5],
      ["Yes, I'm hungry, thank you.", "Vâng, con đói, cảm ơn bố.", true]]),
    N("dad", "Great. Just don't tell Mom about the chips!", "Tuyệt. Nhưng đừng nói với mẹ về khoai tây chiên nhé!", "end"),
    N("dad", "No problem. Enjoy your show!", "Không sao. Xem vui nhé!")
  ]);
  def("tv_off_mom", "mom", "A1", "living", ["turn_off_tv"], [
    N("mom", "You turned off the TV. Good job! Was it a good show?", "Con tắt TV rồi. Giỏi lắm! Chương trình có hay không?"),
    M("opinion", ["good","great","fun","boring","interesting","funny","nice","ok","okay","yes","no","not"], ["Yes, it was really funny.", "Vâng, nó rất buồn cười."], [
      ["Yes, it was really funny.", "Vâng, nó rất buồn cười.", true],
      ["Not really, it was boring.", "Không hẳn, nó chán lắm.", true],
      ["I'm turning on the fan.", "Con đang bật quạt.", false, null, BAD]]),
    N("mom", "Okay. Now, how about some homework?", "Được rồi. Giờ làm chút bài tập nhé?"),
    M("agree", ["okay","ok","sure","fine","yes","alright","right","later","minutes"], ["Okay, Mom. I'll do it now.", "Vâng mẹ. Con làm ngay."], [
      ["Okay, Mom. I'll do it now.", "Vâng mẹ. Con làm ngay.", true],
      ["Can I rest for ten minutes first?", "Con nghỉ mười phút trước được không?", true],
      ["Where is the cat?", "Con mèo đâu rồi?", false, null, BAD]])
  ]);
  def("watch_tom", "tom", "A2", "living", ["watch_tv"], [
    N("tom", "Hey, is this the football match? Who's winning?", "Này, đây là trận bóng à? Đội nào đang thắng?"),
    M("tell_score", ["winning","red","blue","team","nil","zero","one","two","draw","don't know","not sure","score"], ["The red team is winning, two to one.", "Đội đỏ đang thắng, hai một."], [
      ["The red team is winning, two to one.", "Đội đỏ đang thắng, hai một.", true],
      ["I don't know, I just started watching.", "Em không biết, em mới xem.", true],
      ["It's very delicious.", "Nó rất ngon.", false, null, "“Delicious” dùng cho đồ ăn, không phải trận bóng."]]),
    N("tom", "No way! Turn it up a bit, will you?", "Không thể nào! Vặn to lên chút được không?"),
    M("agree", ["sure","okay","ok","yes","no problem","here","louder"], ["Sure, here you go.", "Được, đây này."], [
      ["Sure, here you go.", "Được, đây này.", true, null, null, "pick_up_remote"],
      ["Sorry, Grandpa is sleeping.", "Xin lỗi, ông đang ngủ.", true, 4],
      ["Yes, it's Monday.", "Ừ, hôm nay thứ hai.", false, null, BAD]]),
    N("tom", "Oh, right. Good point. We'll keep it quiet.", "À đúng rồi. Nói phải. Mình xem nhỏ thôi.")
  ]);
  def("remote_lily", "lily", "A1", "living", ["pick_up_remote"], [
    N("lily", "Can I hold the remote? Please, please?", "Cho em cầm điều khiển nhé? Đi mà, đi mà?"),
    M("decide", ["yes","okay","ok","sure","here","no","later","minute","turn"], ["Okay, here you are.", "Ừ, của em đây."], [
      ["Okay, here you are.", "Ừ, của em đây.", true],
      ["In a minute, Lily.", "Chút nữa nhé, Lily.", true],
      ["I like apples.", "Chị thích táo.", false, null, BAD]]),
    N("lily", "Yay! Can we watch the bunny show?", "Yeah! Mình xem chương trình con thỏ được không?"),
    M("agree", ["yes","sure","okay","ok","let's","fine","bunny","after"], ["Sure, let's watch it together.", "Được, mình cùng xem nhé."], [
      ["Sure, let's watch it together.", "Được, mình cùng xem nhé.", true],
      ["Okay, but only one episode.", "Được, nhưng chỉ một tập thôi.", true],
      ["The bunny is a fridge.", "Con thỏ là cái tủ lạnh.", false, null, "Câu này không có nghĩa."]])
  ]);
  def("sofa_grandpa", "grandpa", "A2", "living", ["sit_on_sofa", "lie_on_sofa"], [
    N("grandpa", "Ah, there you are, my dear. Tired already?", "À, cháu đây rồi. Mệt rồi à cháu?"),
    M("feeling", ["tired","yes","bit","little","fine","no","okay","resting","rest","long day"], ["Yes, a little. It was a long day.", "Vâng, hơi mệt. Hôm nay dài quá."], [
      ["Yes, a little. It was a long day.", "Vâng, hơi mệt. Hôm nay dài quá.", true],
      ["No, I'm fine. Just resting.", "Không ạ, cháu ổn. Chỉ nghỉ chút thôi.", true],
      ["I am a sofa.", "Cháu là cái ghế sofa.", false, null, "Ồ, bạn ngồi trên sofa chứ không phải là sofa!"]]),
    N("grandpa", "In my day, we rested under a big mango tree. Shall I tell you about it?", "Ngày xưa ông nghỉ dưới cây xoài to. Ông kể cháu nghe nhé?"),
    M("accept_offer", ["yes","please","sure","love","tell","okay","ok","story"], ["Yes, please! I love your stories.", "Dạ có! Cháu thích chuyện của ông lắm."], [
      ["Yes, please! I love your stories.", "Dạ có! Cháu thích chuyện của ông lắm.", true],
      ["Maybe later, Grandpa.", "Để lát nữa ông nhé.", true, 5],
      ["The mango is blue.", "Quả xoài màu xanh dương.", false, null, BAD]]),
    N("grandpa", "Splendid! Well, it was a hot summer, many years ago...", "Tuyệt! Chà, đó là một mùa hè nóng, nhiều năm trước...", "end"),
    N("grandpa", "Of course, my dear. Have a good rest.", "Được thôi cháu. Nghỉ ngơi đi nhé.")
  ]);
  def("getup_sofa_mom", "mom", "A1", "living", ["get_up_from_sofa"], [
    N("mom", "Oh, you're up! Can you help me for a minute?", "Ồ, con dậy rồi! Giúp mẹ một chút được không?"),
    M("agree", ["sure","yes","okay","ok","of course","what","help"], ["Sure, Mom. What do you need?", "Vâng mẹ. Mẹ cần gì ạ?"], [
      ["Sure, Mom. What do you need?", "Vâng mẹ. Mẹ cần gì ạ?", true],
      ["Of course! How can I help?", "Tất nhiên! Con giúp gì được ạ?", true],
      ["I need a new phone.", "Con cần điện thoại mới.", false, null, BAD]]),
    N("mom", "Please fluff the cushions. The sofa looks messy.", "Con xếp lại mấy cái gối tựa nhé. Sofa trông bừa quá."),
    M("agree", ["okay","ok","sure","no problem","right","now","yes"], ["No problem, I'll do it now.", "Không sao ạ, con làm ngay."], [
      ["No problem, I'll do it now.", "Không sao ạ, con làm ngay.", true, null, null, "fluff_cushion"],
      ["Okay!", "Vâng ạ!", true, null, null, "fluff_cushion"],
      ["The cushion is hungry.", "Cái gối đói rồi.", false, null, "Gối không biết đói đâu!"]])
  ]);
  def("cushion_lily", "lily", "A1", "living", ["fluff_cushion", "fold_throw"], [
    N("lily", "Can I help too? I want to make it soft!", "Em giúp với được không? Em muốn làm nó mềm!"),
    M("accept_offer", ["yes","sure","okay","ok","help","come","of course","together"], ["Yes, come and help me!", "Được, lại đây giúp chị!"], [
      ["Yes, come and help me!", "Được, lại đây giúp chị!", true],
      ["Of course. Take this one.", "Tất nhiên. Cầm cái này đi.", true],
      ["No, it's raining.", "Không, trời đang mưa.", false, null, BAD]]),
    N("lily", "Look! Mine is the fluffiest! Is it good?", "Nhìn này! Cái của em xốp nhất! Được không?"),
    M("praise", ["good","great","nice","perfect","well done","yes","beautiful","amazing","fluffy"], ["It's perfect! Well done, Lily.", "Hoàn hảo! Giỏi lắm Lily."], [
      ["It's perfect! Well done, Lily.", "Hoàn hảo! Giỏi lắm Lily.", true],
      ["Very good! Thank you.", "Rất tốt! Cảm ơn em.", true],
      ["It's ten o'clock.", "Bây giờ là mười giờ.", false, null, BAD]])
  ]);
  def("read_sofa_grandpa", "grandpa", "B1", "living", ["read_on_sofa", "pick_up_book"], [
    N("grandpa", "A book! Splendid. What are you reading, my dear?", "Một cuốn sách! Tuyệt quá. Cháu đang đọc gì thế?"),
    M("tell_book", ["book","story","novel","about","reading","comic","adventure","history","science"], ["It's a story about a young detective.", "Đó là truyện về một thám tử nhỏ."], [
      ["It's a story about a young detective.", "Đó là truyện về một thám tử nhỏ.", true],
      ["A comic book about space.", "Truyện tranh về vũ trụ.", true],
      ["I'm reading the fridge.", "Cháu đang đọc cái tủ lạnh.", false, null, "Bạn đọc sách, không phải tủ lạnh!"]]),
    N("grandpa", "In my day, we had no comics. Would you read me a page?", "Hồi ông còn trẻ không có truyện tranh. Cháu đọc cho ông một trang nhé?"),
    M("accept_offer", ["sure","yes","okay","ok","of course","happy","read","later"], ["Of course, Grandpa. Listen to this.", "Dạ được ông. Ông nghe này."], [
      ["Of course, Grandpa. Listen to this.", "Dạ được ông. Ông nghe này.", true],
      ["Sure, but my reading is slow.", "Được ạ, nhưng cháu đọc chậm.", true],
      ["No, I am a book.", "Không, cháu là cuốn sách.", false, null, BAD]]),
    N("grandpa", "Take your time. Slow and steady wins the race.", "Cứ từ từ. Chậm mà chắc cháu ạ.")
  ]);
  def("pet_cat_lily", "lily", "A1", "living", ["pet_cat", "brush_cat"], [
    N("lily", "Is Mochi happy? Is she purring?", "Mochi có vui không? Nó có kêu rừ rừ không?"),
    M("answer_yes", ["yes","purring","happy","she","listen","loves","likes"], ["Yes, listen! She's purring.", "Có, nghe này! Nó đang kêu rừ rừ."], [
      ["Yes, listen! She's purring.", "Có, nghe này! Nó đang kêu rừ rừ.", true],
      ["I think she's very happy.", "Chị nghĩ nó rất vui.", true],
      ["She is a dog.", "Nó là con chó.", false, null, "Mochi là mèo mà!"]]),
    N("lily", "Can I pet her too? Gently?", "Em vuốt nó được không? Nhẹ nhàng thôi?"),
    M("allow", ["yes","sure","okay","ok","gently","softly","slowly","careful"], ["Yes, but be gentle.", "Được, nhưng nhẹ tay thôi nhé."], [
      ["Yes, but be gentle.", "Được, nhưng nhẹ tay thôi nhé.", true],
      ["Sure, pet her back slowly.", "Được, vuốt lưng nó chậm thôi.", true],
      ["Gentle is a color.", "Nhẹ nhàng là một màu.", false, null, BAD]]),
    N("lily", "She's so soft! I love Mochi!", "Nó mềm quá! Em yêu Mochi!")
  ]);
  def("feed_cat_lily", "lily", "A1", "living", ["feed_cat"], [
    N("lily", "Can I help feed Mochi?", "Em giúp cho Mochi ăn được không?"),
    M("accept_offer", ["yes","sure","okay","ok","help","here","of course","bowl"], ["Sure! You can hold the bowl.", "Được! Em cầm cái bát nhé."], [
      ["Sure! You can hold the bowl.", "Được! Em cầm cái bát nhé.", true],
      ["Yes, put the food here.", "Ừ, đổ thức ăn vào đây.", true],
      ["Mochi is my teacher.", "Mochi là cô giáo của chị.", false, null, BAD]]),
    N("lily", "How much food does she eat?", "Nó ăn bao nhiêu thức ăn?"),
    M("tell_amount", ["cup","half","little","spoon","small","one","two","bit","not too much"], ["Just half a cup.", "Chỉ nửa cốc thôi."], [
      ["Just half a cup.", "Chỉ nửa cốc thôi.", true],
      ["A little. Not too much.", "Một ít thôi. Không nhiều quá.", true],
      ["At seven o'clock.", "Lúc bảy giờ.", false, null, "Câu hỏi là “bao nhiêu”, không phải “mấy giờ”."]]),
    N("lily", "And water? She needs water too!", "Còn nước? Nó cũng cần nước!"),
    M("agree", ["water","yes","right","good idea","okay","sure","give"], ["You're right. Let's give her water.", "Em nói đúng. Cho nó uống nước nhé."], [
      ["You're right. Let's give her water.", "Em nói đúng. Cho nó uống nước nhé.", true, null, null, "give_cat_water"],
      ["Good idea, Lily!", "Ý hay đấy Lily!", true, null, null, "give_cat_water"],
      ["Water is hot.", "Nước nóng.", false, null, BAD]])
  ]);
  def("cat_water_mom", "mom", "A1", "living", ["give_cat_water"], [
    N("mom", "Thank you for looking after Mochi, sweetie.", "Cảm ơn con đã chăm Mochi nhé con yêu."),
    M("reply_thanks", ["welcome","no problem","pleasure","love","happy","problem","fine"], ["You're welcome, Mom.", "Không có gì ạ mẹ."], [
      ["You're welcome, Mom.", "Không có gì ạ mẹ.", true],
      ["No problem. I love her.", "Không sao ạ. Con yêu nó mà.", true],
      ["Thank you too, goodbye.", "Cảm ơn, tạm biệt.", false, null, "Khi được cảm ơn, hãy đáp “You're welcome”."]]),
    N("mom", "Did she eat everything?", "Nó ăn hết chưa?"),
    M("answer", ["yes","no","everything","all","most","half","little"], ["Yes, she ate everything.", "Rồi ạ, nó ăn hết rồi."], [
      ["Yes, she ate everything.", "Rồi ạ, nó ăn hết rồi.", true],
      ["Not yet. Only half.", "Chưa ạ. Mới một nửa.", true],
      ["She is eating tomorrow.", "Nó đang ăn ngày mai.", false, null, "Sai thì: dùng quá khứ “ate”."]])
  ]);
  def("play_cat_tom", "tom", "A2", "living", ["play_with_cat"], [
    N("tom", "Haha, look at Mochi jump! You're gonna tire her out.", "Haha, nhìn Mochi nhảy kìa! Em làm nó mệt mất."),
    M("reply", ["fun","loves","likes","she","play","haha","ok","okay","tired","no"], ["She loves this game!", "Nó thích trò này lắm!"], [
      ["She loves this game!", "Nó thích trò này lắm!", true],
      ["Don't worry, she's having fun.", "Đừng lo, nó đang vui mà.", true],
      ["I'm cooking rice.", "Em đang nấu cơm.", false, null, BAD]]),
    N("tom", "Cool. Can I have a turn?", "Hay đấy. Cho anh chơi một lượt nhé?"),
    M("allow", ["sure","yes","okay","ok","here","go","turn"], ["Sure, here's the toy.", "Được, đồ chơi đây."], [
      ["Sure, here's the toy.", "Được, đồ chơi đây.", true],
      ["Okay, your turn!", "Ừ, đến lượt anh!", true],
      ["No, it's Tuesday.", "Không, hôm nay thứ ba.", false, null, BAD]])
  ]);
  def("call_cat_grandpa", "grandpa", "A2", "living", ["call_cat"], [
    N("grandpa", "Calling the cat? Cats come when they please, my dear.", "Gọi mèo à? Mèo chỉ đến khi chúng thích thôi cháu."),
    M("reply", ["know","right","true","maybe","hungry","food","haha","yes","come"], ["I know! Maybe she's sleeping.", "Cháu biết! Chắc nó đang ngủ."], [
      ["I know! Maybe she's sleeping.", "Cháu biết! Chắc nó đang ngủ.", true],
      ["You're right, Grandpa.", "Ông nói đúng ạ.", true],
      ["Cats are vegetables.", "Mèo là rau.", false, null, BAD]]),
    N("grandpa", "Try shaking her food box. Works every time.", "Thử lắc hộp thức ăn xem. Lần nào cũng hiệu quả."),
    M("agree", ["good","idea","okay","ok","try","thanks","thank","yes"], ["Good idea! I'll feed her.", "Ý hay ạ! Cháu sẽ cho nó ăn."], [
      ["Good idea! I'll feed her.", "Ý hay ạ! Cháu sẽ cho nó ăn.", true, null, null, "feed_cat"],
      ["Thanks, Grandpa. I'll try.", "Cảm ơn ông. Cháu thử xem.", true],
      ["The box is sleeping.", "Cái hộp đang ngủ.", false, null, BAD]])
  ]);
  def("lamp_dad", "dad", "A1", "living", ["turn_on_floor_lamp", "turn_off_floor_lamp"], [
    N("dad", "Ah, much better. Is it too bright for you?", "À, tốt hơn nhiều. Có chói quá không con?"),
    M("opinion", ["fine","good","okay","ok","bright","dark","perfect","no","yes","bit"], ["No, it's fine. Thanks.", "Không ạ, ổn rồi. Cảm ơn bố."], [
      ["No, it's fine. Thanks.", "Không ạ, ổn rồi. Cảm ơn bố.", true],
      ["A little bit, but it's okay.", "Hơi một chút, nhưng không sao.", true],
      ["It's very hungry.", "Nó rất đói.", false, null, BAD]]),
    N("dad", "Good. Reading in the dark is bad for your eyes. Doctor Dad says so!", "Tốt. Đọc trong tối hại mắt lắm. Bác sĩ Bố nói thế!"),
    M("react", ["haha","okay","ok","thanks","right","know","doctor","yes"], ["Haha, okay Doctor Dad.", "Haha, vâng bác sĩ Bố."], [
      ["Haha, okay Doctor Dad.", "Haha, vâng bác sĩ Bố.", true],
      ["You're right. Thanks, Dad.", "Bố nói đúng. Cảm ơn bố.", true],
      ["My eyes are a lamp.", "Mắt con là cái đèn.", false, null, BAD]])
  ]);
  def("curtains_mom", "mom", "A1", "living", ["open_living_curtains", "open_window"], [
    N("mom", "Oh, lovely! Let the sunshine in. What a beautiful day!", "Ồ, tuyệt! Cho nắng vào nào. Ngày đẹp quá!"),
    M("agree", ["yes","beautiful","nice","sunny","lovely","great","day","really"], ["Yes, it's really sunny today.", "Vâng, hôm nay nắng thật."], [
      ["Yes, it's really sunny today.", "Vâng, hôm nay nắng thật.", true],
      ["It's a beautiful day!", "Ngày đẹp thật!", true],
      ["It's my pencil.", "Đó là bút chì của con.", false, null, BAD]]),
    N("mom", "Should we go for a walk later?", "Lát nữa mình đi dạo nhé?"),
    M("decide", ["yes","sure","love","great","okay","ok","maybe","no","tired","later"], ["I'd love to!", "Con rất thích!"], [
      ["I'd love to!", "Con rất thích!", true],
      ["Maybe. I'm a bit tired.", "Có lẽ. Con hơi mệt.", true],
      ["Yes, the walk is blue.", "Vâng, đi dạo màu xanh.", false, null, BAD]])
  ]);
  def("close_curtains_tom", "tom", "A2", "living", ["close_living_curtains", "close_window"], [
    N("tom", "Hey, why'd you close it? I was enjoying the breeze.", "Này, sao đóng lại? Anh đang hưởng gió mà."),
    M("explain", ["because","cold","noise","noisy","sun","bright","rain","dust","hot","sorry"], ["Sorry, it's too noisy outside.", "Xin lỗi, bên ngoài ồn quá."], [
      ["Sorry, it's too noisy outside.", "Xin lỗi, bên ngoài ồn quá.", true],
      ["Because it's getting cold.", "Vì trời đang lạnh dần.", true],
      ["Because I'm a window.", "Vì em là cửa sổ.", false, null, BAD]]),
    N("tom", "Fair enough. Can you turn on the fan then?", "Cũng được. Vậy bật quạt giúp anh nhé?"),
    M("agree", ["sure","okay","ok","yes","no problem","fan"], ["Sure, no problem.", "Được, không sao."], [
      ["Sure, no problem.", "Được, không sao.", true, null, null, "turn_on_fan"],
      ["Okay, one second.", "Ừ, chờ chút.", true, null, null, "turn_on_fan"],
      ["The fan is my friend.", "Cái quạt là bạn em.", false, null, BAD]])
  ]);
  def("fan_grandpa", "grandpa", "A2", "living", ["turn_on_fan"], [
    N("grandpa", "Ah, a nice cool breeze. Thank you, my dear. It's warm today.", "À, gió mát quá. Cảm ơn cháu. Hôm nay trời ấm."),
    M("reply_thanks", ["welcome","no problem","hot","warm","yes","pleasure","sure"], ["You're welcome. It's really hot.", "Không có gì ạ. Nóng thật ông ạ."], [
      ["You're welcome. It's really hot.", "Không có gì ạ. Nóng thật ông ạ.", true],
      ["No problem, Grandpa.", "Không sao ạ ông.", true],
      ["It's very cold. Goodbye.", "Trời rất lạnh. Tạm biệt.", false, null, "Ông vừa nói trời ấm mà."]]),
    N("grandpa", "Not too strong, though. My old bones don't like the wind.", "Nhưng đừng mạnh quá. Xương ông già không thích gió."),
    M("agree", ["okay","ok","low","slow","sure","down","speed","right"], ["Okay, I'll put it on low.", "Vâng, cháu để số nhỏ."], [
      ["Okay, I'll put it on low.", "Vâng, cháu để số nhỏ.", true],
      ["Sure, is this better?", "Dạ, thế này đỡ hơn chưa ạ?", true],
      ["Your bones are funny.", "Xương ông buồn cười.", false, null, "Hơi bất lịch sự với ông đấy."]])
  ]);
  def("fan_off_lily", "lily", "A1", "living", ["turn_off_fan"], [
    N("lily", "Why did you turn off the fan? I'm hot!", "Sao chị tắt quạt? Em nóng!"),
    M("explain", ["cold","sorry","because","on","again","okay","ok","hot","turn"], ["Sorry! I'll turn it on again.", "Xin lỗi! Chị bật lại nhé."], [
      ["Sorry! I'll turn it on again.", "Xin lỗi! Chị bật lại nhé.", true, null, null, "turn_on_fan"],
      ["Because I'm cold, Lily.", "Vì chị lạnh, Lily à.", true],
      ["I'm a banana.", "Chị là quả chuối.", false, null, BAD]]),
    N("lily", "Okay! Thank you!", "Vâng! Cảm ơn chị!")
  ]);
  def("music_tom", "tom", "A2", "living", ["listen_to_music"], [
    N("tom", "Nice song! Who's this?", "Bài hay đấy! Ai hát thế?"),
    M("tell", ["band","singer","it's","don't know","new","song","called","by","not sure"], ["It's a new band from Korea.", "Một ban nhạc mới từ Hàn Quốc."], [
      ["It's a new band from Korea.", "Một ban nhạc mới từ Hàn Quốc.", true],
      ["I don't know, it's on the radio.", "Em không biết, trên đài phát.", true],
      ["It's my breakfast.", "Đó là bữa sáng của em.", false, null, BAD]]),
    N("tom", "Cool. Send me the link later?", "Hay. Lát gửi anh đường link nhé?"),
    M("agree", ["sure","okay","ok","yes","send","later","no problem"], ["Sure, I'll send it to you.", "Được, em gửi cho anh."], [
      ["Sure, I'll send it to you.", "Được, em gửi cho anh.", true],
      ["Okay, no problem.", "Được, không sao.", true],
      ["The link is hungry.", "Đường link đói rồi.", false, null, BAD]])
  ]);
  def("plant_grandpa", "grandpa", "B1", "living", ["water_plant"], [
    N("grandpa", "Watering the plant? Good. Plants are like people, my dear. They need care.", "Tưới cây à? Tốt. Cây cũng như người, cháu ạ. Cần được chăm sóc."),
    M("agree", ["agree","right","true","yes","know","grow","care","like"], ["You're right. It's growing well.", "Ông nói đúng. Nó đang lớn tốt."], [
      ["You're right. It's growing well.", "Ông nói đúng. Nó đang lớn tốt.", true],
      ["I agree, Grandpa.", "Cháu đồng ý ạ.", true],
      ["I'm agree with you.", "Cháu là đồng ý với ông.", false, null, "Nói “I agree”, không nói “I'm agree”."]]),
    N("grandpa", "How often do you water it?", "Cháu tưới bao lâu một lần?"),
    M("frequency", ["every","day","once","twice","week","morning","days","often"], ["Every two days.", "Hai ngày một lần ạ."], [
      ["Every two days.", "Hai ngày một lần ạ.", true],
      ["Once a day, in the morning.", "Mỗi ngày một lần, vào buổi sáng.", true],
      ["Two litres yesterday.", "Hai lít hôm qua.", false, null, "Câu hỏi là “bao lâu một lần” (How often)."]]),
    N("grandpa", "Splendid. You'll have green fingers like your grandma.", "Tuyệt lắm. Cháu sẽ khéo trồng cây như bà.")
  ]);
  def("sweep_mom", "mom", "A1", "living", ["sweep_floor", "sweep_under_table"], [
    N("mom", "Wow, you're sweeping! Thank you, that's a big help.", "Ôi, con quét nhà à! Cảm ơn con, giúp mẹ nhiều lắm."),
    M("reply_thanks", ["welcome","no problem","pleasure","happy","help","fine"], ["You're welcome! Happy to help.", "Không có gì ạ! Con vui được giúp."], [
      ["You're welcome! Happy to help.", "Không có gì ạ! Con vui được giúp.", true],
      ["No problem, Mom.", "Không sao ạ mẹ.", true],
      ["Yes, I am a broom.", "Vâng, con là cái chổi.", false, null, BAD]]),
    N("mom", "Don't forget under the sofa. Lots of dust there!", "Đừng quên dưới gầm sofa nhé. Nhiều bụi lắm!"),
    M("agree", ["okay","ok","sure","won't","forget","will","yes","right"], ["Okay, I won't forget.", "Vâng, con không quên đâu."], [
      ["Okay, I won't forget.", "Vâng, con không quên đâu.", true],
      ["Sure, I'll do it next.", "Vâng, con làm tiếp ngay.", true],
      ["The dust is delicious.", "Bụi ngon lắm.", false, null, BAD]])
  ]);
  def("wipe_table_dad", "dad", "A2", "living", ["wipe_table", "put_book_on_table"], [
    N("dad", "Look at that shiny table! Are you expecting guests?", "Nhìn cái bàn bóng loáng kìa! Con đang đợi khách à?"),
    M("reply", ["no","just","clean","dirty","haha","yes","friend","friends","coming"], ["No, it was just dirty.", "Không ạ, chỉ là nó bẩn thôi."], [
      ["No, it was just dirty.", "Không ạ, chỉ là nó bẩn thôi.", true],
      ["Yes, my friend is coming later.", "Có ạ, lát bạn con đến.", true],
      ["It is Wednesday table.", "Nó là bàn thứ tư.", false, null, BAD]]),
    N("dad", "Well, I can see my face in it! Good job.", "Chà, bố soi gương được luôn! Giỏi lắm.")
  ]);
  def("chair_lily", "lily", "A1", "living", ["sit_on_chair", "pull_out_chair"], [
    N("lily", "Can I sit next to you? Can I?", "Em ngồi cạnh chị được không? Được không?"),
    M("allow", ["yes","sure","okay","ok","course","come","sit"], ["Of course! Sit here.", "Tất nhiên! Ngồi đây này."], [
      ["Of course! Sit here.", "Tất nhiên! Ngồi đây này.", true],
      ["Sure, come on.", "Được, lại đây.", true],
      ["I sit is chair.", "Chị ngồi là ghế.", false, null, "Câu sai ngữ pháp, thử lại nhé."]]),
    N("lily", "What are you doing?", "Chị đang làm gì thế?"),
    M("tell_activity", ["i'm","reading","resting","doing","homework","drawing","nothing","just","sitting","thinking"], ["I'm just resting.", "Chị chỉ đang nghỉ thôi."], [
      ["I'm just resting.", "Chị chỉ đang nghỉ thôi.", true],
      ["I'm doing my homework.", "Chị đang làm bài tập.", true],
      ["I do yesterday.", "Chị làm hôm qua.", false, null, "Dùng hiện tại tiếp diễn: “I'm + V-ing”."]])
  ]);
  def("cup_dad", "dad", "A1", "living", ["drink_from_cup", "pour_milk"], [
    N("dad", "Milk again? You'll grow taller than me soon!", "Lại sữa à? Con sẽ cao hơn bố sớm thôi!"),
    M("react", ["haha","hope","yes","maybe","taller","good","like","love"], ["Haha, I hope so!", "Haha, con mong thế!"], [
      ["Haha, I hope so!", "Haha, con mong thế!", true],
      ["Yes, I love milk.", "Vâng, con thích sữa lắm.", true],
      ["The milk is tall.", "Sữa thì cao.", false, null, BAD]]),
    N("dad", "Is there any left for me?", "Còn chút nào cho bố không?"),
    M("answer", ["yes","some","little","no","sorry","finished","pour","here","bit"], ["Yes, there's a little. I'll pour you some.", "Còn ạ, một chút. Con rót cho bố."], [
      ["Yes, there's a little. I'll pour you some.", "Còn ạ, một chút. Con rót cho bố.", true, null, null, "pour_milk"],
      ["Sorry, Dad. It's finished.", "Xin lỗi bố. Hết rồi ạ.", true],
      ["Left is a direction.", "Trái là một hướng.", false, null, "“Any left” = còn lại không, không phải “bên trái”."]])
  ]);
  def("fridge_tom", "tom", "A2", "living", ["open_fridge", "take_milk"], [
    N("tom", "Hey, while the fridge is open, grab me a drink?", "Này, tiện tủ lạnh đang mở, lấy anh chai nước nhé?"),
    M("agree", ["sure","okay","ok","here","which","what","yes","catch"], ["Sure. Which one do you want?", "Được. Anh muốn cái nào?"], [
      ["Sure. Which one do you want?", "Được. Anh muốn cái nào?", true],
      ["Get it yourself!", "Tự lấy đi!", true, 4],
      ["The fridge is my brother.", "Tủ lạnh là anh em.", false, null, BAD]]),
    N("tom", "Orange juice, please. Thanks, you're the best!", "Nước cam nhé. Cảm ơn, em là nhất!", "end"),
    null,
    N("tom", "Haha, fair enough. I'll get it myself.", "Haha, cũng phải. Anh tự lấy vậy.")
  ]);
  SCENES.fridge_tom.lines.splice(3, 1);
  SCENES.fridge_tom.lines[1].choices[1].next = 3;
  def("fridge_close_mom", "mom", "A1", "living", ["close_fridge", "put_milk_back"], [
    N("mom", "Thank you for closing the fridge. Is there any milk left?", "Cảm ơn con đóng tủ lạnh. Còn sữa không con?"),
    M("answer", ["yes","no","little","half","bottle","some","left","more"], ["Yes, about half a bottle.", "Còn ạ, khoảng nửa chai."], [
      ["Yes, about half a bottle.", "Còn ạ, khoảng nửa chai.", true],
      ["Not much. We need more.", "Không nhiều. Mình cần mua thêm.", true],
      ["The fridge is cold, goodbye.", "Tủ lạnh lạnh, tạm biệt.", false, null, BAD]]),
    N("mom", "Okay, I'll buy some tomorrow. Anything else you want?", "Được, mai mẹ mua. Con muốn gì nữa không?"),
    M("request", ["yes","no","please","some","fruit","bread","eggs","apples","yogurt","nothing","thanks"], ["Some apples, please.", "Ít táo nhé mẹ."], [
      ["Some apples, please.", "Ít táo nhé mẹ.", true],
      ["No, thanks. I'm fine.", "Không ạ, cảm ơn mẹ.", true],
      ["I want yesterday.", "Con muốn hôm qua.", false, null, BAD]])
  ]);
  def("cup_table_grandpa", "grandpa", "A2", "living", ["put_cup_on_table", "pick_up_cup"], [
    N("grandpa", "Careful with that cup, my dear. It was your grandma's favourite.", "Cẩn thận cái cốc nhé cháu. Đó là cốc bà thích nhất."),
    M("reassure", ["careful","don't worry","okay","ok","will","sorry","know","promise"], ["Don't worry, I'll be careful.", "Ông đừng lo, cháu sẽ cẩn thận."], [
      ["Don't worry, I'll be careful.", "Ông đừng lo, cháu sẽ cẩn thận.", true],
      ["Oh, I didn't know! I'll be careful.", "Ôi, cháu không biết! Cháu sẽ cẩn thận.", true],
      ["Grandma is a cup.", "Bà là cái cốc.", false, null, BAD]]),
    N("grandpa", "Good child. She drank her tea in it every morning.", "Cháu ngoan. Sáng nào bà cũng uống trà bằng nó.")
  ]);

  /* ---------------- KITCHEN ---------------- */
  def("coffee_mom", "mom", "A1", "kitchen", ["make_coffee"], [
    N("mom", "Mm, that smells good! Can I have a cup too?", "Ừm, thơm quá! Mẹ xin một cốc được không?"),
    M("accept_offer", ["sure","yes","of course","okay","ok","pour","cup","here"], ["Sure, I'll pour you a cup.", "Được ạ, con rót cho mẹ một cốc."], [
      ["Sure, I'll pour you a cup.", "Được ạ, con rót cho mẹ một cốc.", true, null, null, "pour_coffee"],
      ["Of course! Milk or sugar?", "Tất nhiên! Mẹ có muốn sữa hay đường không?", true, 4],
      ["I am coffee.", "Con là cà phê.", false, null, "Bạn đang pha cà phê, không phải là cà phê!"]]),
    N("mom", "Thank you, sweetheart. You make the best coffee.", "Cảm ơn con yêu. Con pha cà phê ngon nhất.", "end"),
    null,
    N("mom", "A little milk, no sugar, please.", "Một chút sữa, không đường nhé."),
    M("agree", ["okay","ok","sure","here","coming","right","you are"], ["Okay, here you are.", "Vâng, của mẹ đây."], [
      ["Okay, here you are.", "Vâng, của mẹ đây.", true, null, null, "pour_coffee"],
      ["Coming right up!", "Có ngay ạ!", true, null, null, "pour_coffee"],
      ["No sugar is sweet.", "Không đường thì ngọt.", false, null, BAD]])
  ]);
  SCENES.coffee_mom.lines.splice(3, 1);
  SCENES.coffee_mom.lines[1].choices[1].next = 3;
  def("coffee_drink_dad", "dad", "A2", "kitchen", ["drink_coffee", "pour_coffee"], [
    N("dad", "Coffee in the morning? You're becoming just like me!", "Cà phê buổi sáng à? Con càng ngày càng giống bố!"),
    M("react", ["haha","yes","maybe","need","tired","like","love","just"], ["Haha, I need it today.", "Haha, hôm nay con cần nó."], [
      ["Haha, I need it today.", "Haha, hôm nay con cần nó.", true],
      ["Maybe! I like it strong.", "Có lẽ! Con thích uống đặc.", true],
      ["I am morning.", "Con là buổi sáng.", false, null, BAD]]),
    N("dad", "Busy day ahead?", "Hôm nay bận à?"),
    M("tell_plan", ["yes","test","exam","school","work","class","busy","not","no","meeting","lots"], ["Yes, I have a test today.", "Vâng, hôm nay con có bài kiểm tra."], [
      ["Yes, I have a test today.", "Vâng, hôm nay con có bài kiểm tra.", true],
      ["Not really, just a few classes.", "Không lắm, chỉ vài tiết học.", true],
      ["I busy yesterday tomorrow.", "Con bận hôm qua ngày mai.", false, null, "Câu chưa rõ nghĩa."]]),
    N("dad", "You'll do great. Remember: deep breath and big smile!", "Con sẽ làm tốt thôi. Nhớ: hít sâu và cười thật tươi!")
  ]);
  def("egg_dad", "dad", "A1", "kitchen", ["fry_egg", "turn_on_stove"], [
    N("dad", "Frying eggs? Can you make one for me too?", "Rán trứng à? Làm cho bố một quả nữa nhé?"),
    M("accept_offer", ["sure","yes","okay","ok","of course","one","two","how"], ["Sure! How do you like it?", "Được ạ! Bố thích kiểu gì?"], [
      ["Sure! How do you like it?", "Được ạ! Bố thích kiểu gì?", true],
      ["Okay, one egg for Dad.", "Vâng, một quả trứng cho bố.", true, 3],
      ["The egg is a chicken.", "Quả trứng là con gà.", false, null, BAD]]),
    N("dad", "Sunny side up, please. Just like my mood!", "Ốp la lòng đào nhé. Giống tâm trạng bố vậy!"),
    N("dad", "Thanks, chef! I'll get the plates.", "Cảm ơn đầu bếp! Bố đi lấy đĩa.")
  ]);
  def("stove_off_mom", "mom", "A1", "kitchen", ["turn_off_stove"], [
    N("mom", "Good, you turned off the stove. Always check it, okay?", "Tốt, con tắt bếp rồi. Luôn kiểm tra nhé?"),
    M("agree", ["okay","ok","will","always","yes","sure","know","promise"], ["Okay, Mom. I always check.", "Vâng mẹ. Con luôn kiểm tra."], [
      ["Okay, Mom. I always check.", "Vâng mẹ. Con luôn kiểm tra.", true],
      ["Yes, I will.", "Vâng, con sẽ nhớ.", true],
      ["The stove is happy.", "Cái bếp vui.", false, null, BAD]]),
    N("mom", "What did you cook?", "Con nấu món gì thế?"),
    M("tell_food", ["egg","eggs","noodles","rice","soup","fried","cooked","made","vegetables","omelette"], ["I cooked some fried eggs.", "Con rán vài quả trứng."], [
      ["I cooked some fried eggs.", "Con rán vài quả trứng.", true],
      ["Just some noodles.", "Chỉ ít mì thôi ạ.", true],
      ["I cook tomorrow.", "Con nấu ngày mai.", false, null, "Hỏi về việc đã làm: dùng quá khứ “cooked”."]])
  ]);
  def("kettle_grandpa", "grandpa", "A2", "kitchen", ["boil_water", "fill_kettle"], [
    N("grandpa", "Boiling water? Would you make an old man a pot of tea?", "Đun nước à? Cháu pha cho ông già một ấm trà nhé?"),
    M("accept_offer", ["sure","yes","of course","okay","ok","tea","green","happy"], ["Of course, Grandpa. Green tea?", "Dạ được ông. Trà xanh nhé?"], [
      ["Of course, Grandpa. Green tea?", "Dạ được ông. Trà xanh nhé?", true],
      ["Sure, I'll make it now.", "Dạ, cháu pha ngay.", true],
      ["Tea is a vegetable.", "Trà là rau.", false, null, BAD]]),
    N("grandpa", "Green tea, yes. Not too strong, mind you.", "Trà xanh, đúng rồi. Nhưng đừng đặc quá nhé."),
    M("agree", ["okay","ok","sure","light","weak","won't","right","yes"], ["Okay, not too strong.", "Vâng, không đặc quá."], [
      ["Okay, not too strong.", "Vâng, không đặc quá.", true, null, null, "pour_hot_water"],
      ["Sure, a light one.", "Dạ, pha nhạt thôi.", true, null, null, "pour_hot_water"],
      ["Strong is a man.", "Mạnh là một người đàn ông.", false, null, BAD]]),
    N("grandpa", "Splendid. You're a good child.", "Tuyệt lắm. Cháu ngoan lắm.")
  ]);
  def("hot_water_lily", "lily", "A1", "kitchen", ["pour_hot_water"], [
    N("lily", "Is that hot? Can I touch it?", "Cái đó nóng không? Em chạm được không?"),
    M("warn", ["no","hot","don't","careful","dangerous","very","touch"], ["No! It's very hot. Don't touch it.", "Không! Nóng lắm. Đừng chạm vào."], [
      ["No! It's very hot. Don't touch it.", "Không! Nóng lắm. Đừng chạm vào.", true],
      ["No, be careful, Lily!", "Không, cẩn thận Lily!", true],
      ["Yes, touch it, it's fun.", "Có, chạm đi, vui lắm.", false, null, "Nguy hiểm! Nước nóng có thể làm bé bị bỏng."]]),
    N("lily", "Okay. I'll stand back. Can I watch?", "Vâng. Em đứng xa ra. Em xem được không?"),
    M("allow", ["yes","sure","okay","ok","watch","there","stand"], ["Yes, you can watch from there.", "Được, em đứng đó xem nhé."], [
      ["Yes, you can watch from there.", "Được, em đứng đó xem nhé.", true],
      ["Sure, stay there.", "Được, ở yên đó nhé.", true],
      ["Watch is a clock.", "Đồng hồ là cái đồng hồ.", false, null, BAD]])
  ]);
  def("rice_mom", "mom", "A2", "kitchen", ["wash_rice", "cook_rice"], [
    N("mom", "You're making rice! How many cups did you use?", "Con nấu cơm à! Con dùng mấy cốc gạo?"),
    M("tell_amount", ["cup","cups","two","three","one","four"], ["Three cups.", "Ba cốc ạ."], [
      ["Three cups.", "Ba cốc ạ.", true],
      ["Two cups, is that enough?", "Hai cốc, có đủ không mẹ?", true],
      ["At six o'clock.", "Lúc sáu giờ.", false, null, "Câu hỏi là “bao nhiêu” (How many)."]]),
    N("mom", "Perfect. Grandpa will be coming for dinner too.", "Hoàn hảo. Ông cũng ăn tối cùng."),
    M("react", ["great","nice","okay","ok","more","add","another","good"], ["Great! I'll add one more cup.", "Tuyệt! Con thêm một cốc nữa."], [
      ["Great! I'll add one more cup.", "Tuyệt! Con thêm một cốc nữa.", true],
      ["Nice! Then it's enough.", "Hay quá! Vậy là đủ.", true],
      ["Grandpa is rice.", "Ông là cơm.", false, null, BAD]])
  ]);
  def("serve_rice_grandpa", "grandpa", "A2", "kitchen", ["serve_rice", "set_the_table"], [
    N("grandpa", "Ah, dinner smells wonderful. Who cooked tonight?", "À, bữa tối thơm quá. Tối nay ai nấu thế?"),
    M("tell", ["i","me","did","mom","cooked","together","we"], ["I did, with Mom's help.", "Cháu nấu ạ, mẹ giúp."], [
      ["I did, with Mom's help.", "Cháu nấu ạ, mẹ giúp.", true],
      ["Mom and I cooked together.", "Mẹ và cháu nấu cùng nhau.", true],
      ["Tonight is a spoon.", "Tối nay là cái thìa.", false, null, BAD]]),
    N("grandpa", "Splendid! In my day, children only washed the dishes.", "Tuyệt quá! Hồi ông còn nhỏ, trẻ con chỉ được rửa bát."),
    M("react", ["haha","really","wow","love","like","cooking","fun"], ["Really? I love cooking!", "Thật ạ? Cháu thích nấu ăn lắm!"], [
      ["Really? I love cooking!", "Thật ạ? Cháu thích nấu ăn lắm!", true],
      ["Haha, I'll wash them later too.", "Haha, lát cháu cũng rửa bát.", true],
      ["My day is a dish.", "Ngày của cháu là cái bát.", false, null, BAD]])
  ]);
  def("microwave_tom", "tom", "A2", "kitchen", ["heat_up_food", "open_microwave"], [
    N("tom", "Ooh, are those leftovers from last night? Save some for me!", "Ồ, đồ ăn thừa tối qua à? Để phần anh với!"),
    M("decide", ["okay","ok","sure","yes","share","half","some","no","sorry","mine"], ["Okay, let's share.", "Ừ, mình chia nhau."], [
      ["Okay, let's share.", "Ừ, mình chia nhau.", true],
      ["Sorry, I'm really hungry!", "Xin lỗi, em đói lắm!", true, 4],
      ["Last night is food.", "Tối qua là đồ ăn.", false, null, BAD]]),
    N("tom", "Yes! You're the best. Two minutes is enough.", "Yeah! Em là nhất. Hai phút là đủ.", "end"),
    null,
    N("tom", "Fine, fine. I'll make some noodles.", "Thôi được. Anh nấu mì vậy.")
  ]);
  SCENES.microwave_tom.lines.splice(3, 1);
  SCENES.microwave_tom.lines[1].choices[1].next = 3;
  def("dishes_mom", "mom", "A1", "kitchen", ["wash_dishes", "turn_on_faucet"], [
    N("mom", "You're washing the dishes? What a lovely surprise!", "Con đang rửa bát à? Bất ngờ dễ thương quá!"),
    M("reply", ["help","want","happy","welcome","no problem","rest","mom","sure"], ["I want to help. You can rest.", "Con muốn giúp. Mẹ nghỉ đi."], [
      ["I want to help. You can rest.", "Con muốn giúp. Mẹ nghỉ đi.", true],
      ["No problem, Mom!", "Không sao mẹ!", true],
      ["The dishes are sleeping.", "Mấy cái bát đang ngủ.", false, null, BAD]]),
    N("mom", "Thank you, sweetie. Please use warm water for the oily pans.", "Cảm ơn con yêu. Dùng nước ấm cho mấy cái chảo dầu nhé."),
    M("agree", ["okay","ok","sure","warm","will","yes","got"], ["Okay, warm water. Got it.", "Vâng, nước ấm. Con hiểu rồi."], [
      ["Okay, warm water. Got it.", "Vâng, nước ấm. Con hiểu rồi.", true],
      ["Sure, I'll do that.", "Vâng, con sẽ làm thế.", true],
      ["The pan is warm water.", "Cái chảo là nước ấm.", false, null, BAD]])
  ]);
  def("dry_lily", "lily", "A1", "kitchen", ["dry_plates", "put_dishes_in_rack"], [
    N("lily", "Can I dry the plates? I'm a big girl now!", "Em lau đĩa được không? Em lớn rồi mà!"),
    M("allow", ["yes","sure","okay","ok","careful","towel","plastic","here"], ["Yes, but be careful. Here's a towel.", "Được, nhưng cẩn thận. Khăn đây."], [
      ["Yes, but be careful. Here's a towel.", "Được, nhưng cẩn thận. Khăn đây.", true],
      ["Okay, you can dry the plastic ones.", "Được, em lau mấy cái nhựa nhé.", true],
      ["You are a plate.", "Em là cái đĩa.", false, null, BAD]]),
    N("lily", "Look, this one is dry! Where does it go?", "Nhìn này, cái này khô rồi! Để ở đâu ạ?"),
    M("tell_place", ["cabinet","cupboard","there","shelf","in","on","rack","table"], ["Put it in the cabinet.", "Để vào tủ nhé."], [
      ["Put it in the cabinet.", "Để vào tủ nhé.", true, null, null, "put_plates_away"],
      ["On the table, please.", "Để lên bàn nhé.", true],
      ["It goes to school.", "Nó đi học.", false, null, BAD]])
  ]);
  def("cabinet_dad", "dad", "A2", "kitchen", ["open_cabinet", "put_plates_away"], [
    N("dad", "While you're there, can you find the big bowl? I'm making salad.", "Tiện con ở đó, tìm giúp bố cái bát to nhé? Bố làm salad."),
    M("agree", ["sure","okay","ok","here","found","yes","this","one"], ["Sure. Is this the one?", "Vâng. Cái này phải không ạ?"], [
      ["Sure. Is this the one?", "Vâng. Cái này phải không ạ?", true],
      ["Here it is, Dad.", "Đây ạ bố.", true],
      ["I'm a salad.", "Con là salad.", false, null, BAD]]),
    N("dad", "Perfect! You have eagle eyes.", "Hoàn hảo! Con có mắt đại bàng đấy.")
  ]);
  def("breakfast_mom", "mom", "A1", "kitchen", ["eat_breakfast"], [
    N("mom", "How's your breakfast? Is it good?", "Bữa sáng thế nào? Ngon không con?"),
    M("opinion", ["good","delicious","great","yummy","tasty","love","nice","salty","sweet"], ["It's delicious, thanks Mom!", "Ngon lắm, cảm ơn mẹ!"], [
      ["It's delicious, thanks Mom!", "Ngon lắm, cảm ơn mẹ!", true],
      ["It's good, but a bit salty.", "Ngon, nhưng hơi mặn.", true],
      ["I'm eat breakfast.", "Con là ăn sáng.", false, null, "Nói “I'm eating breakfast” hoặc trả lời câu hỏi."]]),
    N("mom", "Eat well. Do you want some more toast?", "Ăn nhiều vào. Con muốn thêm bánh mì nướng không?"),
    M("decide", ["yes","please","no","thanks","full","more","one","sure"], ["Yes, please. One more.", "Vâng ạ. Thêm một lát."], [
      ["Yes, please. One more.", "Vâng ạ. Thêm một lát.", true, null, null, "toast_bread"],
      ["No, thanks. I'm full.", "Không ạ, cảm ơn mẹ. Con no rồi.", true],
      ["Toast is a teacher.", "Bánh mì là giáo viên.", false, null, BAD]])
  ]);
  def("toast_tom", "tom", "A2", "kitchen", ["toast_bread", "take_out_toast"], [
    N("tom", "Toast! Can you make me two slices? With butter?", "Bánh mì nướng! Làm cho anh hai lát nhé? Có bơ?"),
    M("accept_offer", ["sure","okay","ok","yes","butter","two","jam","fine"], ["Sure, two slices with butter.", "Được, hai lát với bơ."], [
      ["Sure, two slices with butter.", "Được, hai lát với bơ.", true],
      ["Okay, but you wash the dishes!", "Được, nhưng anh rửa bát nhé!", true, 3],
      ["Butter is my friend.", "Bơ là bạn em.", false, null, BAD]]),
    N("tom", "Legend! Thanks!", "Đỉnh! Cảm ơn!", "end"),
    N("tom", "Haha, deal. That's fair.", "Haha, chốt. Công bằng mà.")
  ]);
  def("table_clear_dad", "dad", "A2", "kitchen", ["clear_the_table", "get_up_from_table"], [
    N("dad", "Done already? Did you like dinner?", "Xong rồi à? Con thích bữa tối không?"),
    M("opinion", ["yes","loved","liked","good","great","delicious","soup","fish","really"], ["Yes, I loved the soup.", "Vâng, con rất thích món canh."], [
      ["Yes, I loved the soup.", "Vâng, con rất thích món canh.", true],
      ["It was really good, thanks.", "Ngon lắm ạ, cảm ơn bố.", true],
      ["I like tomorrow.", "Con thích ngày mai.", false, null, BAD]]),
    N("dad", "I'll tell the chef. Oh wait, the chef is me!", "Bố sẽ báo đầu bếp. À khoan, đầu bếp là bố mà!"),
    M("react", ["haha","great","thanks","good","best","chef","wow","thank"], ["Haha, thanks, chef Dad!", "Haha, cảm ơn đầu bếp Bố!"], [
      ["Haha, thanks, chef Dad!", "Haha, cảm ơn đầu bếp Bố!", true],
      ["You're the best cook!", "Bố nấu ngon nhất!", true],
      ["The chef is a chair.", "Đầu bếp là cái ghế.", false, null, BAD]])
  ]);
  def("trash_tom", "tom", "A2", "kitchen", ["take_out_trash", "put_in_new_bag"], [
    N("tom", "Oh nice, you're taking out the trash. I owe you one.", "Ồ hay, em đổ rác à. Anh nợ em một lần."),
    M("reply", ["okay","ok","yes","next","time","your","turn","welcome","no problem","sure"], ["Yes, next time it's your turn!", "Ừ, lần sau đến lượt anh!"], [
      ["Yes, next time it's your turn!", "Ừ, lần sau đến lượt anh!", true],
      ["No problem.", "Không sao.", true],
      ["The trash is delicious.", "Rác ngon lắm.", false, null, BAD]]),
    N("tom", "Deal. Don't forget the new bag!", "Chốt. Đừng quên túi mới nhé!"),
    M("agree", ["okay","ok","sure","won't","forget","got","yes"], ["Got it.", "Biết rồi."], [
      ["Got it.", "Biết rồi.", true, null, null, "put_in_new_bag"],
      ["I won't forget.", "Em không quên đâu.", true, null, null, "put_in_new_bag"],
      ["The bag is old man.", "Cái túi là ông già.", false, null, BAD]])
  ]);
  def("hands_mom", "mom", "A1", "kitchen", ["wash_hands"], [
    N("mom", "Good, you're washing your hands. Did you use soap?", "Tốt, con rửa tay rồi. Con có dùng xà phòng không?"),
    M("answer", ["yes","soap","did","of course","no","forgot","sorry"], ["Yes, I did.", "Có ạ."], [
      ["Yes, I did.", "Có ạ.", true],
      ["Oops, I forgot. I'll use it now.", "Ôi, con quên. Con dùng ngay.", true],
      ["Yes, I am soap.", "Vâng, con là xà phòng.", false, null, BAD]]),
    N("mom", "Great! Dinner is in five minutes.", "Tuyệt! Năm phút nữa ăn tối.")
  ]);

  /* ---------------- BEDROOM ---------------- */
  def("wake_mom", "mom", "A1", "bedroom", ["get_out_of_bed", "get_up"], [
    N("mom", "Morning, sleepyhead! Did you sleep well?", "Chào buổi sáng, con sâu ngủ! Con ngủ ngon không?"),
    M("tell_sleep", ["yes","well","good","great","fine","slept","no","not","tired","dream"], ["Yes, I slept really well.", "Vâng, con ngủ rất ngon."], [
      ["Yes, I slept really well.", "Vâng, con ngủ rất ngon.", true],
      ["Not really. I had a bad dream.", "Không lắm. Con gặp ác mộng.", true, 4],
      ["I sleep tomorrow.", "Con ngủ ngày mai.", false, null, "Hỏi về đêm qua: dùng quá khứ “slept”."]]),
    N("mom", "Wonderful! Breakfast is ready in ten minutes.", "Tuyệt! Mười phút nữa có bữa sáng."),
    M("reply_thanks", ["okay","ok","thanks","thank","great","coming","hungry"], ["Okay, thanks Mom!", "Vâng, cảm ơn mẹ!"], [
      ["Okay, thanks Mom!", "Vâng, cảm ơn mẹ!", true, "end"],
      ["Great, I'm hungry!", "Tuyệt, con đói rồi!", true, "end"],
      ["Ten minutes is a dog.", "Mười phút là con chó.", false, null, BAD]], { next: "end" }),
    N("mom", "Oh no, poor thing. Come here, a big hug makes it better.", "Ôi tội nghiệp. Lại đây, ôm một cái là đỡ ngay."),
    M("reply_thanks", ["thanks","thank","love","better","okay","ok","hug"], ["Thanks, Mom. I feel better now.", "Cảm ơn mẹ. Con thấy đỡ rồi."], [
      ["Thanks, Mom. I feel better now.", "Cảm ơn mẹ. Con thấy đỡ rồi.", true],
      ["I love you, Mom.", "Con yêu mẹ.", true],
      ["Hug is a food.", "Ôm là đồ ăn.", false, null, BAD]])
  ]);
  def("alarm_tom", "tom", "A2", "bedroom", ["turn_off_alarm"], [
    N("tom", "Finally! Your alarm woke up the whole house, you know.", "Cuối cùng! Chuông báo thức của em đánh thức cả nhà đấy."),
    M("apologize", ["sorry","oops","didn't","hear","won't","again","my bad"], ["Sorry! I didn't hear it.", "Xin lỗi! Em không nghe thấy."], [
      ["Sorry! I didn't hear it.", "Xin lỗi! Em không nghe thấy.", true],
      ["Oops, my bad. It won't happen again.", "Ôi, lỗi em. Không có lần sau đâu.", true],
      ["I didn't heard it.", "Em không nghe thấy.", false, null, "Sau “didn't” dùng động từ nguyên mẫu: “didn't hear”."]]),
    N("tom", "No worries. Maybe put it closer to your bed?", "Không sao. Hay để nó gần giường hơn?"),
    M("agree", ["good","idea","okay","ok","yes","will","sure","right"], ["Good idea, I will.", "Ý hay, em sẽ làm thế."], [
      ["Good idea, I will.", "Ý hay, em sẽ làm thế.", true],
      ["Okay, thanks Tom.", "Ừ, cảm ơn anh Tom.", true],
      ["My bed is far idea.", "Giường em là ý xa.", false, null, BAD]])
  ]);
  def("set_alarm_dad", "dad", "A2", "bedroom", ["set_alarm", "charge_phone"], [
    N("dad", "Setting your alarm? What time do you need to get up?", "Đặt báo thức à? Con cần dậy lúc mấy giờ?"),
    M("tell_time", ["six","seven","five","eight","o'clock","thirty","half","am","early"], ["At six thirty.", "Lúc sáu rưỡi ạ."], [
      ["At six thirty.", "Lúc sáu rưỡi ạ.", true],
      ["Seven o'clock tomorrow.", "Bảy giờ sáng mai.", true],
      ["Three cups.", "Ba cốc.", false, null, "Câu hỏi là “mấy giờ” (What time)."]]),
    N("dad", "Early bird! Then off to bed soon, okay?", "Chim dậy sớm! Vậy đi ngủ sớm nhé?"),
    M("agree", ["okay","ok","yes","sure","soon","bed","night","goodnight"], ["Okay. Goodnight, Dad.", "Vâng. Chúc bố ngủ ngon."], [
      ["Okay. Goodnight, Dad.", "Vâng. Chúc bố ngủ ngon.", true],
      ["Yes, in ten minutes.", "Vâng, mười phút nữa.", true],
      ["Good morning!", "Chào buổi sáng!", false, null, "Buổi tối nên nói “Goodnight”."]])
  ]);
  def("make_bed_grandpa", "grandpa", "A2", "bedroom", ["make_bed", "spread_blanket"], [
    N("grandpa", "Making your bed? Splendid. A tidy bed, a tidy mind, my dear.", "Dọn giường à? Tuyệt. Giường gọn thì đầu óc gọn, cháu ạ."),
    M("agree", ["agree","true","right","yes","know","every","day","thanks"], ["You're right, Grandpa. I do it every day.", "Ông nói đúng. Ngày nào cháu cũng làm."], [
      ["You're right, Grandpa. I do it every day.", "Ông nói đúng. Ngày nào cháu cũng làm.", true],
      ["Thanks! It feels good.", "Cảm ơn ông! Cảm giác dễ chịu lắm.", true],
      ["My mind is a bed.", "Đầu óc cháu là cái giường.", false, null, BAD]]),
    N("grandpa", "In the army, we had to do it in two minutes!", "Hồi trong quân đội, ông phải làm trong hai phút!"),
    M("react", ["wow","really","fast","two","minutes","amazing","haha"], ["Wow, really? That's fast!", "Ồ, thật ạ? Nhanh thế!"], [
      ["Wow, really? That's fast!", "Ồ, thật ạ? Nhanh thế!", true],
      ["Haha, I need ten minutes.", "Haha, cháu cần mười phút.", true],
      ["The army is a blanket.", "Quân đội là cái chăn.", false, null, BAD]])
  ]);
  def("pillow_lily", "lily", "A1", "bedroom", ["fluff_pillow", "pick_up_pillow"], [
    N("lily", "Pillow fight! Pillow fight! Can we?", "Đánh gối! Đánh gối! Được không?"),
    M("decide", ["yes","okay","ok","sure","no","later","one","minute","quick"], ["Okay, just one minute!", "Được, chỉ một phút thôi!"], [
      ["Okay, just one minute!", "Được, chỉ một phút thôi!", true],
      ["Not now, Lily. Maybe later.", "Không phải bây giờ Lily. Lát nữa nhé.", true, 3],
      ["Pillow is my name.", "Gối là tên chị.", false, null, BAD]]),
    N("lily", "Yay! Got you! Hehe!", "Yeah! Trúng rồi! Hihi!", "end"),
    N("lily", "Promise? Okay!", "Hứa nhé? Vâng!")
  ]);
  def("blanket_mom", "mom", "A1", "bedroom", ["fold_blanket"], [
    N("mom", "You folded your blanket! You're so grown-up now.", "Con gấp chăn rồi! Con lớn quá rồi."),
    M("reply", ["thanks","thank","yes","try","every","day","welcome","mom"], ["Thanks, Mom! I try every day.", "Cảm ơn mẹ! Ngày nào con cũng cố."], [
      ["Thanks, Mom! I try every day.", "Cảm ơn mẹ! Ngày nào con cũng cố.", true],
      ["Thank you!", "Cảm ơn mẹ!", true],
      ["I am a blanket.", "Con là cái chăn.", false, null, BAD]]),
    N("mom", "Is it warm enough at night, or do you need another blanket?", "Ban đêm có đủ ấm không, hay con cần thêm chăn?"),
    M("answer", ["warm","enough","fine","okay","need","another","cold","yes","no"], ["It's warm enough, thanks.", "Đủ ấm rồi ạ, cảm ơn mẹ."], [
      ["It's warm enough, thanks.", "Đủ ấm rồi ạ, cảm ơn mẹ.", true],
      ["I'm a bit cold. Another one, please.", "Con hơi lạnh. Thêm một cái ạ.", true],
      ["Night is warm blanket yesterday.", "Đêm là chăn ấm hôm qua.", false, null, BAD]])
  ]);
  def("wardrobe_mom", "mom", "A2", "bedroom", ["open_wardrobe", "take_out_shirt"], [
    N("mom", "What are you going to wear today?", "Hôm nay con định mặc gì?"),
    M("tell_clothes", ["shirt","t-shirt","dress","jeans","blue","white","red","jacket","wear","going"], ["My blue shirt and jeans.", "Áo sơ mi xanh và quần bò ạ."], [
      ["My blue shirt and jeans.", "Áo sơ mi xanh và quần bò ạ.", true],
      ["I'm going to wear a white T-shirt.", "Con định mặc áo phông trắng.", true],
      ["I wear yesterday.", "Con mặc hôm qua.", false, null, BAD]]),
    N("mom", "Good choice. Take a jacket too. It might rain.", "Chọn hay đấy. Mang thêm áo khoác nhé. Có thể mưa."),
    M("agree", ["okay","ok","sure","will","yes","jacket","thanks"], ["Okay, I'll take one.", "Vâng, con sẽ mang."], [
      ["Okay, I'll take one.", "Vâng, con sẽ mang.", true],
      ["Thanks for telling me!", "Cảm ơn mẹ đã nhắc!", true],
      ["The rain is a jacket.", "Mưa là cái áo khoác.", false, null, BAD]])
  ]);
  def("shirt_tom", "tom", "A2", "bedroom", ["hang_up_shirt", "close_wardrobe"], [
    N("tom", "Hey, is that my shirt? Haha, just kidding. Looks good on you!", "Này, áo của anh à? Haha, đùa thôi. Em mặc hợp đấy!"),
    M("react", ["haha","thanks","thank","no","mine","really","funny"], ["Haha, no, it's mine! Thanks.", "Haha, không, của em! Cảm ơn."], [
      ["Haha, no, it's mine! Thanks.", "Haha, không, của em! Cảm ơn.", true],
      ["Really? Thanks, Tom!", "Thật à? Cảm ơn anh Tom!", true],
      ["Yes, I'm a shirt.", "Ừ, em là cái áo.", false, null, BAD]]),
    N("tom", "Going anywhere special?", "Đi đâu đặc biệt à?"),
    M("tell_plan", ["going","party","school","friend","friends","no","just","out","cinema","home"], ["Just going out with friends.", "Chỉ đi chơi với bạn thôi."], [
      ["Just going out with friends.", "Chỉ đi chơi với bạn thôi.", true],
      ["No, just staying home.", "Không, chỉ ở nhà thôi.", true],
      ["Special is a color.", "Đặc biệt là một màu.", false, null, BAD]])
  ]);
  def("bed_read_grandpa", "grandpa", "B1", "bedroom", ["read_in_bed", "turn_on_lamp"], [
    N("grandpa", "Still reading at this hour? Don't stay up too late, my dear.", "Giờ này còn đọc à? Đừng thức khuya quá nhé cháu."),
    M("reassure", ["won't","finish","chapter","soon","okay","ok","just","one","more","minutes"], ["I won't. Just one more chapter.", "Cháu không thức đâu. Chỉ một chương nữa thôi."], [
      ["I won't. Just one more chapter.", "Cháu không thức đâu. Chỉ một chương nữa thôi.", true],
      ["Okay, I'll stop soon.", "Vâng, cháu dừng ngay đây.", true],
      ["Late is a book.", "Muộn là cuốn sách.", false, null, BAD]]),
    N("grandpa", "Ah, I remember those nights. Goodnight, sleep tight.", "À, ông nhớ những đêm như thế. Ngủ ngon nhé."),
    M("goodnight", ["goodnight","night","sleep","you too","sweet","dreams"], ["Goodnight, Grandpa. Sleep well.", "Chúc ông ngủ ngon."], [
      ["Goodnight, Grandpa. Sleep well.", "Chúc ông ngủ ngon.", true, null, null, "turn_off_lamp"],
      ["You too, Grandpa!", "Ông cũng vậy nhé!", true],
      ["Good morning, Grandpa.", "Chào buổi sáng ông.", false, null, "Buổi tối nên nói “Goodnight”."]])
  ]);
  def("lie_down_lily", "lily", "A1", "bedroom", ["lie_down", "sit_on_bed"], [
    N("lily", "Can you tell me a story before bed?", "Chị kể chuyện cho em trước khi ngủ nhé?"),
    M("accept_offer", ["yes","sure","okay","ok","story","which","short","of course"], ["Sure! Which story do you want?", "Được! Em muốn nghe chuyện nào?"], [
      ["Sure! Which story do you want?", "Được! Em muốn nghe chuyện nào?", true],
      ["Okay, a short one.", "Được, chuyện ngắn thôi.", true],
      ["Story is a bed.", "Chuyện là cái giường.", false, null, BAD]]),
    N("lily", "The one about the little dragon!", "Chuyện con rồng nhỏ!"),
    M("start_story", ["once","upon","time","dragon","okay","ok","little","there"], ["Once upon a time, there was a little dragon...", "Ngày xửa ngày xưa, có một chú rồng nhỏ..."], [
      ["Once upon a time, there was a little dragon...", "Ngày xửa ngày xưa, có một chú rồng nhỏ...", true],
      ["Okay! The little dragon lived in a cave.", "Được! Chú rồng nhỏ sống trong hang.", true],
      ["Dragon is my phone.", "Rồng là điện thoại của chị.", false, null, BAD]]),
    N("lily", "Yay... I love this one... *yawn*", "Yeah... em thích chuyện này... *ngáp*")
  ]);
  def("window_grandpa", "grandpa", "B1", "bedroom", ["look_out_window", "open_curtains"], [
    N("grandpa", "What's the weather like out there, my dear? My eyes aren't what they used to be.", "Ngoài trời thế nào hả cháu? Mắt ông không còn tốt như xưa."),
    M("weather", ["sunny","rainy","cloudy","windy","raining","hot","cold","nice","sun","clouds"], ["It's sunny with a few clouds.", "Trời nắng, có vài đám mây ạ."], [
      ["It's sunny with a few clouds.", "Trời nắng, có vài đám mây ạ.", true],
      ["It's raining a little.", "Trời đang mưa nhỏ ạ.", true],
      ["It's Tuesday.", "Hôm nay thứ ba.", false, null, "Câu hỏi về thời tiết."]]),
    N("grandpa", "Lovely. Perhaps we'll take a stroll in the park this afternoon.", "Tuyệt. Có lẽ chiều nay mình đi dạo công viên."),
    M("accept_offer", ["yes","love","sure","great","okay","ok","good","idea"], ["I'd love that, Grandpa.", "Cháu rất thích ạ."], [
      ["I'd love that, Grandpa.", "Cháu rất thích ạ.", true],
      ["Good idea!", "Ý hay ạ!", true],
      ["The park is my shoe.", "Công viên là giày của cháu.", false, null, BAD]])
  ]);
  def("curtains_close_dad", "dad", "A1", "bedroom", ["close_curtains", "turn_off_lamp"], [
    N("dad", "Bedtime already? Did you finish your homework?", "Giờ đi ngủ rồi à? Con làm xong bài tập chưa?"),
    M("answer", ["yes","finished","done","did","no","not","almost","tomorrow"], ["Yes, I finished it.", "Rồi ạ, con làm xong rồi."], [
      ["Yes, I finished it.", "Rồi ạ, con làm xong rồi.", true],
      ["Almost. I'll finish it tomorrow morning.", "Gần xong. Sáng mai con làm nốt.", true],
      ["I finish it yesterday tomorrow.", "Con làm xong hôm qua ngày mai.", false, null, BAD]]),
    N("dad", "Good. Sweet dreams, kiddo. Don't let the bed bugs bite!", "Tốt. Ngủ ngon con. Đừng để rệp cắn nhé!"),
    M("goodnight", ["goodnight","night","you too","haha","sweet","dreams","love"], ["Haha, goodnight, Dad!", "Haha, chúc bố ngủ ngon!"], [
      ["Haha, goodnight, Dad!", "Haha, chúc bố ngủ ngon!", true],
      ["You too, Dad. Love you.", "Bố cũng vậy. Con yêu bố.", true],
      ["Good afternoon.", "Chào buổi chiều.", false, null, "Buổi tối nên nói “Goodnight”."]])
  ]);
  def("laundry_mom", "mom", "A2", "bedroom", ["pick_up_clothes", "empty_basket"], [
    N("mom", "Thanks for picking up your clothes. Are these clean or dirty?", "Cảm ơn con nhặt quần áo. Mấy cái này sạch hay bẩn?"),
    M("answer", ["dirty","clean","both","some","these","those","wash"], ["These are dirty. They need washing.", "Mấy cái này bẩn. Cần giặt ạ."], [
      ["These are dirty. They need washing.", "Mấy cái này bẩn. Cần giặt ạ.", true],
      ["Some are clean, some are dirty.", "Một số sạch, một số bẩn.", true],
      ["They are hungry.", "Chúng đói.", false, null, BAD]]),
    N("mom", "Okay, put the dirty ones in the basket, please.", "Được, bỏ đồ bẩn vào giỏ nhé."),
    M("agree", ["okay","ok","sure","will","yes","right","now"], ["Okay, I'll do it now.", "Vâng, con làm ngay."], [
      ["Okay, I'll do it now.", "Vâng, con làm ngay.", true],
      ["Sure, Mom.", "Vâng mẹ.", true],
      ["The basket is a cat.", "Cái giỏ là con mèo.", false, null, BAD]])
  ]);
  def("mirror_tom", "tom", "A2", "bedroom", ["look_in_mirror", "brush_hair"], [
    N("tom", "Looking good! Big day today?", "Trông đẹp đấy! Hôm nay ngày quan trọng à?"),
    M("tell_plan", ["yes","party","interview","test","presentation","date","no","just","school","friend"], ["Yes, I have a presentation.", "Ừ, em có bài thuyết trình."], [
      ["Yes, I have a presentation.", "Ừ, em có bài thuyết trình.", true],
      ["No, just a normal day.", "Không, chỉ ngày bình thường.", true],
      ["Big is my hair.", "To là tóc em.", false, null, BAD]]),
    N("tom", "You'll smash it. Good luck!", "Em sẽ làm tốt thôi. Chúc may mắn!"),
    M("reply_thanks", ["thanks","thank","appreciate","hope"], ["Thanks, Tom!", "Cảm ơn anh Tom!"], [
      ["Thanks, Tom!", "Cảm ơn anh Tom!", true],
      ["Thank you, I hope so.", "Cảm ơn anh, mong là vậy.", true],
      ["You're welcome.", "Không có gì.", false, null, "Khi được chúc, đáp “Thanks”."]])
  ]);
  def("slippers_lily", "lily", "A1", "bedroom", ["put_on_slippers", "take_off_slippers"], [
    N("lily", "Your slippers are so funny! Are they bunnies?", "Dép của chị buồn cười quá! Hình con thỏ à?"),
    M("answer", ["yes","bunnies","bunny","rabbits","no","bears","cats","they're"], ["Yes, they're bunnies!", "Ừ, hình con thỏ đấy!"], [
      ["Yes, they're bunnies!", "Ừ, hình con thỏ đấy!", true],
      ["No, they're bears.", "Không, hình con gấu.", true],
      ["They are eating.", "Chúng đang ăn.", false, null, BAD]]),
    N("lily", "I want bunny slippers too!", "Em cũng muốn dép con thỏ!"),
    M("promise", ["okay","ok","maybe","buy","birthday","ask","mom","sure","get"], ["Maybe Mom can buy you some.", "Có thể mẹ sẽ mua cho em."], [
      ["Maybe Mom can buy you some.", "Có thể mẹ sẽ mua cho em.", true],
      ["Okay, for your birthday!", "Được, vào sinh nhật em nhé!", true],
      ["Slippers is Monday.", "Dép là thứ hai.", false, null, BAD]])
  ]);
  def("phone_dad", "dad", "A2", "bedroom", ["check_phone", "unplug_charger"], [
    N("dad", "Phone again? Any news from the outside world?", "Lại điện thoại à? Có tin gì từ thế giới bên ngoài không?"),
    M("tell", ["message","friend","news","nothing","just","checking","weather","time","no"], ["Just a message from my friend.", "Chỉ là tin nhắn của bạn con."], [
      ["Just a message from my friend.", "Chỉ là tin nhắn của bạn con.", true],
      ["Nothing special. Just checking the time.", "Không có gì. Con xem giờ thôi.", true],
      ["The phone is a news.", "Điện thoại là một tin tức.", false, null, BAD]]),
    N("dad", "Okay. Remember: no phone at dinner!", "Được. Nhớ nhé: không điện thoại trong bữa tối!"),
    M("agree", ["okay","ok","know","remember","yes","sure","promise","won't"], ["I know, Dad. I promise.", "Con biết rồi bố. Con hứa."], [
      ["I know, Dad. I promise.", "Con biết rồi bố. Con hứa.", true],
      ["Okay, okay!", "Vâng, vâng!", true],
      ["Dinner is my phone.", "Bữa tối là điện thoại con.", false, null, BAD]])
  ]);

  /* ---------------- matching ---------------- */
  function norm(s) {
    var sc = root.ELW_SPEAKING;
    if (sc && sc.normalize) return sc.normalize(s);
    return String(s || "").toLowerCase().replace(/[’‘]/g, "'").replace(/\bi am\b/g, "i'm").replace(/[^a-z0-9'\s-]/g, " ").replace(/\s+/g, " ").trim();
  }
  var INTENT_WORDS = {
    accept_offer: ["yes","yeah","yep","sure","okay","ok","of course","alright","why not"],
    agree: ["yes","yeah","yep","sure","okay","ok","alright","fine","right","got it","will do"],
    allow: ["yes","yeah","sure","okay","ok","go ahead","of course"],
    reply_thanks: ["welcome","no problem","no worries","anytime","thanks","thank"],
    goodnight: ["good night","goodnight","night","sleep well"],
    apologize: ["sorry","apologize","my fault"],
    decide: ["yes","no","okay","ok","sure","later","not now"],
    answer: ["yes","no","yeah","nope"]
  };
  function hasWord(n, k) {
    k = norm(k); if (!k) return false;
    return (" " + n + " ").indexOf(" " + k + " ") >= 0 || (k.length >= 5 && n.indexOf(k) >= 0);
  }
  function matchFree(line, text) {
    var n = norm(text); var ex = line && line.expect;
    if (!ex || !n) return { ok: false, score: 0 };
    var words = n.split(" ").filter(Boolean);
    var kws = ex.keywords.concat(INTENT_WORDS[ex.intent] || []);
    var hit = kws.filter(function (k) { return hasWord(n, k); });
    var sim = 0;
    var t = norm(ex.sample_en).split(" ");
    t.forEach(function (w) { if (words.indexOf(w) >= 0) sim++; });
    sim = t.length ? sim / t.length : 0;
    // reject obviously wrong choice texts if user typed one verbatim
    var bad = (line.choices || []).some(function (c) { return !c.ok && norm(c.en) === n; });
    var ok = !bad && (hit.length > 0 || sim >= 0.5);
    return { ok: ok, score: Math.round(Math.max(sim, hit.length ? 0.6 + Math.min(hit.length, 4) * 0.1 : 0) * 100), hits: hit };
  }

  /* ---------------- triggering ---------------- */
  var rand = Math.random;
  function shouldTrigger(actionId, W, history, opts) {
    opts = opts || {};
    history = history || [];
    var list = TRIGGERS[actionId];
    if (!list || !list.length) return null;
    if (W && (W.roleplayRunning || (W.roleplay && W.roleplay.running))) return null;
    if (opts.running) return null;
    var cooldown = opts.cooldown || 10;
    // history entries: strings (action ids or "scene:<id>") or {action, scene}
    var recent = history.slice(-cooldown);
    var recentScenes = {};
    var anySceneRecently = 0;
    recent.forEach(function (h, i) {
      var s = typeof h === "string" ? (h.indexOf("scene:") === 0 ? h.slice(6) : null) : (h && h.scene);
      if (s) { recentScenes[s] = 1; if (i >= recent.length - 2) anySceneRecently = 1; }
    });
    if (anySceneRecently) return null;
    var cands = list.filter(function (s) { return !recentScenes[s]; });
    if (W && W.room) {
      var rc = cands.filter(function (s) { return SCENES[s].room === W.room; });
      if (rc.length) cands = rc;
    }
    if (!cands.length) return null;
    var chance = opts.chance == null ? 0.6 : opts.chance;
    var r = (opts.random || rand)();
    if (r >= chance) return null;
    return cands[Math.floor((opts.random || rand)() * cands.length) % cands.length];
  }

  /* ---------------- UI ---------------- */
  var css = [
    ".rp-panel{--accent:#e8743b;--line:#e3d6c3;--bg:#fffaf2;--ink:#3a2b1f;--muted:#8a7461;--me:#fde3d2;font:14px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:16px;box-shadow:0 6px 24px rgba(90,60,30,.12);display:flex;flex-direction:column;max-width:420px;width:100%;box-sizing:border-box;overflow:hidden}",
    ".rp-panel *{box-sizing:border-box}",
    ".rp-head{display:flex;align-items:center;gap:8px;padding:8px 10px;border-bottom:1px solid var(--line);background:#fff3e4}",
    ".rp-head .rp-title{flex:1;font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".rp-lv{font-size:11px;background:var(--accent);color:#fff;border-radius:8px;padding:1px 6px}",
    ".rp-btn{font:inherit;border:1px solid var(--line);background:#fff;color:var(--ink);border-radius:10px;padding:6px 10px;cursor:pointer;min-height:34px}",
    ".rp-btn:hover{border-color:var(--accent)}",
    ".rp-btn:focus-visible,.rp-input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}",
    ".rp-btn.rp-on{background:var(--accent);color:#fff;border-color:var(--accent)}",
    ".rp-icon{padding:4px 8px;min-height:30px}",
    ".rp-log{padding:10px;display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;overflow-x:hidden}",
    ".rp-row{display:flex;gap:6px;align-items:flex-end;max-width:100%}",
    ".rp-row.rp-me{flex-direction:row-reverse}",
    ".rp-av{font-size:22px;line-height:1;flex:none;width:30px;text-align:center}",
    ".rp-bub{background:#fff;border:1px solid var(--line);border-radius:14px 14px 14px 4px;padding:6px 10px;min-width:0;max-width:78%;overflow-wrap:anywhere}",
    ".rp-me .rp-bub{background:var(--me);border-color:#f3c3a3;border-radius:14px 14px 4px 14px}",
    ".rp-name{font-size:11px;color:var(--muted);font-weight:600}",
    ".rp-vi{font-size:12px;color:var(--muted);font-style:italic;margin-top:2px}",
    ".rp-hidevi .rp-vi{display:none}",
    ".rp-bub .rp-icon{float:right;margin:-2px -4px 0 6px;border:none;background:none;min-height:0}",
    ".rp-turn{border-top:1px solid var(--line);padding:8px 10px;display:flex;flex-direction:column;gap:6px}",
    ".rp-choices{display:flex;flex-direction:column;gap:6px}",
    ".rp-choice{text-align:left;width:100%}",
    ".rp-choice small{display:block;color:var(--muted);font-size:11px}",
    ".rp-free{display:flex;gap:6px}",
    ".rp-input{flex:1;min-width:0;font:inherit;border:1px solid var(--line);border-radius:10px;padding:6px 8px;background:#fff;color:var(--ink)}",
    ".rp-fb{font-size:13px;padding:6px 8px;border-radius:8px;background:#fff3e4;border:1px dashed var(--line)}",
    ".rp-fb.rp-good{background:#eaf6e6;border-color:#b8dcaa}",
    ".rp-fb.rp-bad{background:#fdecec;border-color:#efb9b9}",
    ".rp-tools{display:flex;gap:6px;flex-wrap:wrap}",
    ".rp-end{text-align:center;padding:10px;font-weight:600;color:var(--accent)}"
  ].join("\n");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]; }); }

  function createPlayer(o) {
    o = o || {};
    var doc = root.document;
    var container = o.container;
    var speak = o.speak || function (t, v) {
      if (root.ELW_VOICES && root.ELW_VOICES.speak) { try { return Promise.resolve(root.ELW_VOICES.speak(t, v)); } catch (e) {} }
      return Promise.resolve();
    };
    var correction = o.correction || (root.ELW_SPEAKING && root.ELW_SPEAKING.correction);
    var running = false, sceneId = null, scene = null, idx = 0, stats = null, showVi = true, token = 0, panel, log, turn;
    if (doc && !doc.getElementById("rp-style")) {
      var st = doc.createElement("style"); st.id = "rp-style"; st.textContent = css; doc.head.appendChild(st);
    }
    function ch(id) { return CHARACTERS[id] || CHARACTERS.me; }
    function say(text, who) { try { var p = speak(text, ch(who).voice); return p && p.then ? p.catch(function () {}) : Promise.resolve(); } catch (e) { return Promise.resolve(); } }
    function bubble(who, en, vi) {
      var c = ch(who), row = doc.createElement("div");
      row.className = "rp-row" + (who === "me" ? " rp-me" : "");
      row.innerHTML = '<div class="rp-av" aria-hidden="true">' + esc(c.avatar) + '</div><div class="rp-bub"><button type="button" class="rp-btn rp-icon rp-replay" aria-label="Replay">🔊</button><div class="rp-name">' + esc(c.name) + '</div><div class="rp-en">' + esc(en) + '</div>' + (vi ? '<div class="rp-vi">' + esc(vi) + '</div>' : "") + '</div>';
      row.querySelector(".rp-replay").onclick = function () { say(en, who); };
      log.appendChild(row); log.scrollTop = log.scrollHeight;
    }
    function build() {
      container.innerHTML = "";
      var npc = ch(scene.who);
      panel = doc.createElement("section");
      panel.className = "rp-panel" + (showVi ? "" : " rp-hidevi");
      panel.setAttribute("aria-label", "Roleplay with " + npc.name);
      panel.innerHTML = '<div class="rp-head"><span class="rp-av" aria-hidden="true">' + esc(npc.avatar) + '</span><span class="rp-title">' + esc(npc.name) + ' · ' + esc(npc.role) + '</span><span class="rp-lv">' + esc(scene.level) + '</span><button type="button" class="rp-btn rp-icon rp-vitog' + (showVi ? " rp-on" : "") + '" aria-pressed="' + showVi + '">VI</button><button type="button" class="rp-btn rp-icon rp-close" aria-label="Close">✕</button></div><div class="rp-log" aria-live="polite"></div><div class="rp-turn"></div>';
      log = panel.querySelector(".rp-log"); turn = panel.querySelector(".rp-turn");
      panel.querySelector(".rp-vitog").onclick = function () {
        showVi = !showVi; panel.classList.toggle("rp-hidevi", !showVi);
        this.classList.toggle("rp-on", showVi); this.setAttribute("aria-pressed", String(showVi));
      };
      panel.querySelector(".rp-close").onclick = function () { stop(); };
      panel.addEventListener("keydown", function (e) { if (e.key === "Escape") stop(); });
      container.appendChild(panel);
    }
    function go(next) {
      if (next === "end" || next == null && idx + 1 >= scene.lines.length) return finish();
      idx = next == null ? idx + 1 : next;
      if (idx >= scene.lines.length) return finish();
      step();
    }
    function step() {
      var my = token, line = scene.lines[idx];
      turn.innerHTML = "";
      if (line.who !== "me") {
        bubble(line.who, line.en, line.vi);
        say(line.en, line.who).then(function () { if (my === token && running) go(line.next); });
        return;
      }
      renderTurn(line);
    }
    function feedback(msg, cls) {
      var f = turn.querySelector(".rp-fb");
      if (!f) { f = doc.createElement("div"); f.setAttribute("role", "status"); turn.appendChild(f); }
      f.className = "rp-fb " + (cls || ""); f.innerHTML = msg;
    }
    function renderTurn(line) {
      var html = '<div class="rp-choices">';
      line.choices.forEach(function (c, i) {
        html += '<button type="button" class="rp-btn rp-choice" data-i="' + i + '">' + esc(c.en) + '<small class="rp-vi">' + esc(c.vi) + '</small></button>';
      });
      html += '</div><form class="rp-free"><input class="rp-input" type="text" autocomplete="off" placeholder="Type your answer…" aria-label="Your answer">' +
        (o.listen ? '<button type="button" class="rp-btn rp-mic" aria-label="Speak">🎙️</button>' : "") +
        '<button type="submit" class="rp-btn rp-send">Send</button></form><div class="rp-tools"><button type="button" class="rp-btn rp-hint">💡 Gợi ý</button></div>';
      turn.innerHTML = html;
      Array.prototype.forEach.call(turn.querySelectorAll(".rp-choice"), function (b) {
        b.onclick = function () { pickChoice(line, line.choices[+b.getAttribute("data-i")]); };
      });
      var inp = turn.querySelector(".rp-input");
      turn.querySelector(".rp-free").onsubmit = function (e) { e.preventDefault(); if (inp.value.trim()) freeAnswer(line, inp.value); };
      turn.querySelector(".rp-hint").onclick = function () {
        stats.hints++;
        feedback("💡 Ví dụ: <b>" + esc(line.expect.sample_en) + "</b><div class=\"rp-vi\">" + esc(line.expect.sample_vi) + "</div>");
      };
      var mic = turn.querySelector(".rp-mic");
      if (mic) mic.onclick = function () {
        mic.disabled = true; feedback("🎙️ Đang nghe…");
        Promise.resolve().then(o.listen).then(function (t) { mic.disabled = false; if (t) { inp.value = t; freeAnswer(line, t, true); } else feedback("Không nghe rõ, thử lại nhé."); })
          .catch(function () { mic.disabled = false; feedback("Không dùng được micro. Hãy gõ câu trả lời."); });
      };
      var first = turn.querySelector(".rp-choice"); if (first && o.autofocus !== false) try { first.focus({ preventScroll: true }); } catch (e) {}
    }
    function proceed(text, vi, next, action) {
      var my = token;
      bubble("me", text, vi);
      if (action && o.enqueue) { stats.actions.push(action); try { o.enqueue(action); } catch (e) {} }
      turn.innerHTML = "";
      setTimeout(function () { if (my === token && running) go(next); }, o.delay == null ? 350 : o.delay);
    }
    function pickChoice(line, c) {
      stats.turns++;
      if (!c.ok) { stats.wrong++; feedback("❌ " + esc(c.feedback_vi), "rp-bad"); return; }
      stats.correct++;
      proceed(c.en, c.vi, c.next, c.action || line.action);
    }
    function freeAnswer(line, text, spoken) {
      stats.turns++;
      var m = matchFree(line, text);
      if (!m.ok) {
        stats.wrong++;
        feedback("🤔 Chưa khớp ý lắm. Gợi ý: hãy trả lời câu hỏi của " + esc(ch(scene.who).name) + ".<br>Mẫu: <b>" + esc(line.expect.sample_en) + "</b><div class=\"rp-vi\">" + esc(line.expect.sample_vi) + "</div>", "rp-bad");
        return;
      }
      stats.correct++; stats.free++;
      var tips = [];
      if (correction && !spoken) { try { tips = (correction(text) || {}).tips || []; } catch (e) {} }
      tips = tips.filter(function (t) { return !/dấu câu/.test(t); });
      var my = token;
      var act = line.action, best = -1, nt = norm(text).split(" ");
      line.choices.forEach(function (c) { if (!c.ok || c.next != null) return; var w = norm(c.en).split(" "), k = w.filter(function (x) { return nt.indexOf(x) >= 0; }).length / w.length; if (k > best) { best = k; if (c.action) act = c.action; else if (!line.action) act = null; } });
      proceed(text, "", line.expect.next, act);
      if (tips.length) setTimeout(function () { if (my === token && turn) feedback("✅ Hiểu rồi! " + esc(tips[0]), "rp-good"); }, 0);
    }
    function finish() {
      var id = sceneId; running = false; token++;
      turn.innerHTML = '<div class="rp-end">🎉 Hết đoạn hội thoại!</div><button type="button" class="rp-btn rp-close2">Đóng</button>';
      turn.querySelector(".rp-close2").onclick = function () { container.innerHTML = ""; };
      var s = stats;
      if (o.onEnd) try { o.onEnd(id, s); } catch (e) {}
    }
    function start(id) {
      if (!SCENES[id]) return false;
      if (running) stop(true);
      token++; running = true; sceneId = id; scene = SCENES[id]; idx = 0;
      stats = { turns: 0, correct: 0, wrong: 0, free: 0, hints: 0, actions: [], done: [] };
      build(); step(); return true;
    }
    function stop(silent) {
      if (!running && silent) return;
      var was = running, id = sceneId; running = false; token++;
      if (container) container.innerHTML = "";
      if (was && !silent && o.onEnd) try { o.onEnd(id, Object.assign({ stopped: true }, stats)); } catch (e) {}
    }
    return {
      start: start, stop: function () { stop(false); },
      isRunning: function () { return running; },
      current: function () { return running ? sceneId : null; },
      actionDone: function (actionId, ok) { if (stats) stats.done.push({ id: actionId, ok: ok !== false }); }
    };
  }

  var api = { CHARACTERS: CHARACTERS, TRIGGERS: TRIGGERS, SCENES: SCENES, shouldTrigger: shouldTrigger, matchFree: matchFree, createPlayer: createPlayer, css: css, escape: esc };
  root.ELW_ROLEPLAY = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
