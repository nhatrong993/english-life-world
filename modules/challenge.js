/* Daily Life Challenge mode — window.ELW_CHALLENGE
   Separate from free mode. Only reads action ids; never touches vocab/SRS/progress data.
   Storage: localStorage "elw_challenge_v1" {v:1, unlocked, best, current}. */
(function (root) {
  "use strict";
  const KEY = "elw_challenge_v1";
  const T = (id, en, vi, anyOf, len, lvi, o) => Object.assign({ id, title_en: en, title_vi: vi, anyOf, learn_en: len, learn_vi: lvi }, o || {});

  const CHALLENGES = [
    { id: "busy_morning", icon: "🌅", title_en: "A Busy Morning", title_vi: "Buổi sáng bận rộn", goal_vi: "Dậy, dọn giường, ăn sáng và chuẩn bị cho ngày mới.", minutes: 8, tasks: [
      T("alarm", "Turn off the alarm", "Tắt báo thức", ["turn_off_alarm"], "alarm clock", "đồng hồ báo thức"),
      T("pillow", "Pick up the pillow", "Nhặt gối lên", ["pick_up_pillow"], "pillow", "cái gối"),
      T("bed", "Make the bed", "Dọn giường", ["make_bed", "fold_blanket"], "make the bed", "dọn giường"),
      T("curt", "Open the curtains", "Mở rèm", ["open_curtains"], "curtains", "rèm cửa", { free: true }),
      T("hair", "Brush your hair", "Chải tóc", ["brush_hair", "look_in_mirror"], "brush", "chải"),
      T("coffee", "Make coffee", "Pha cà phê", ["make_coffee"], "coffee", "cà phê"),
      T("toast", "Make toast", "Nướng bánh mì", ["toast_bread"], "toast", "bánh mì nướng"),
      T("table", "Set the table", "Bày bàn ăn", ["set_the_table"], "set the table", "bày bàn"),
      T("eat", "Eat breakfast", "Ăn sáng", ["eat_breakfast"], "breakfast", "bữa sáng"),
      T("phone", "Charge your phone", "Sạc điện thoại", ["charge_phone"], "charge", "sạc", { free: true })] },
    { id: "cleaning_day", icon: "🧹", title_en: "Cleaning Day", title_vi: "Ngày dọn dẹp", goal_vi: "Làm sạch phòng khách, bếp và phòng ngủ.", minutes: 10, tasks: [
      T("win", "Open the window", "Mở cửa sổ", ["open_window"], "fresh air", "không khí trong lành"),
      T("sweep", "Sweep the floor", "Quét nhà", ["sweep_floor"], "sweep", "quét"),
      T("under", "Sweep under the table", "Quét gầm bàn", ["sweep_under_table"], "under", "bên dưới"),
      T("wipe", "Wipe the table", "Lau bàn", ["wipe_table"], "wipe", "lau"),
      T("cush", "Fluff the cushions", "Vỗ gối tựa", ["fluff_cushion", "fold_throw"], "cushion", "gối tựa", { free: true }),
      T("tap", "Turn on the faucet", "Mở vòi nước", ["turn_on_faucet"], "faucet / tap", "vòi nước"),
      T("dish", "Wash the dishes", "Rửa bát", ["wash_dishes"], "dishes", "bát đĩa"),
      T("rack", "Put dishes in the rack", "Úp bát lên giá", ["put_dishes_in_rack", "dry_plates"], "rack", "giá úp bát"),
      T("trash", "Take out the trash", "Đổ rác", ["take_out_trash"], "trash", "rác"),
      T("bag", "Put in a new bag", "Thay túi rác mới", ["put_in_new_bag"], "bag", "túi"),
      T("bedp", "Pick up the pillow", "Nhặt gối", ["pick_up_pillow"], "pick up", "nhặt lên"),
      T("bedr", "Make the bed", "Dọn giường", ["make_bed"], "tidy", "gọn gàng")] },
    { id: "cooking_dinner", icon: "🍳", title_en: "Cooking Dinner", title_vi: "Nấu bữa tối", goal_vi: "Nấu cơm, rán trứng và dọn bữa tối.", minutes: 10, tasks: [
      T("tap", "Turn on the faucet", "Mở vòi nước", ["turn_on_faucet"], "faucet / tap", "vòi nước"),
      T("hands", "Wash your hands", "Rửa tay", ["wash_hands"], "wash your hands", "rửa tay"),
      T("rice", "Wash the rice", "Vo gạo", ["wash_rice"], "rice", "gạo"),
      T("cook", "Cook the rice", "Nấu cơm", ["cook_rice"], "cook", "nấu"),
      T("kettle", "Fill the kettle", "Đổ nước vào ấm", ["fill_kettle"], "kettle", "ấm đun nước", { free: true }),
      T("stove", "Turn on the stove", "Bật bếp", ["turn_on_stove"], "stove", "bếp"),
      T("egg", "Fry an egg", "Rán trứng", ["fry_egg"], "fry", "rán"),
      T("off", "Turn off the stove", "Tắt bếp", ["turn_off_stove"], "turn off", "tắt"),
      T("set", "Set the table", "Bày bàn", ["set_the_table"], "plate", "đĩa"),
      T("serve", "Serve the rice", "Xới cơm", ["serve_rice"], "serve", "dọn ra / xới"),
      T("clear", "Clear the table", "Dọn bàn", ["clear_the_table"], "clear", "dọn sạch")] },
    { id: "family", icon: "👨‍👩‍👧", title_en: "Taking Care of the Family", title_vi: "Chăm sóc gia đình", goal_vi: "Giúp đỡ mọi người trong nhà.", minutes: 10,
      requires: ["talk_to_mom", "help_dad", "read_to_child"], tasks: [
      T("mom", "Talk to Mom", "Nói chuyện với mẹ", ["talk_to_mom"], "mom", "mẹ"),
      T("dad", "Help Dad", "Giúp bố", ["help_dad"], "help", "giúp"),
      T("kid", "Read to your little sister", "Đọc truyện cho em", ["read_to_child"], "story", "câu chuyện"),
      T("tea", "Boil water for tea", "Đun nước pha trà", ["boil_water"], "boil", "đun sôi"),
      T("pour", "Pour hot water", "Rót nước nóng", ["pour_hot_water"], "pour", "rót"),
      T("eat", "Eat together", "Ăn cùng nhau", ["eat_breakfast"], "together", "cùng nhau"),
      T("clear", "Clear the table", "Dọn bàn", ["clear_the_table"], "clear", "dọn"),
      T("dish", "Wash the dishes", "Rửa bát", ["wash_dishes"], "dishes", "bát đĩa"),
      T("tv", "Watch TV together", "Xem TV cùng nhau", ["watch_tv"], "watch", "xem"),
      T("lamp", "Turn off the lamp", "Tắt đèn", ["turn_off_floor_lamp", "turn_off_lamp"], "lamp", "đèn")] },
    { id: "pets", icon: "🐱", title_en: "Looking After the Pets", title_vi: "Chăm sóc thú cưng", goal_vi: "Cho mèo ăn, uống, chơi và chải lông.", minutes: 6, tasks: [
      T("call", "Call the cat", "Gọi mèo", ["call_cat"], "call", "gọi"),
      T("feed", "Feed the cat", "Cho mèo ăn", ["feed_cat"], "feed", "cho ăn"),
      T("water", "Give the cat water", "Cho mèo uống nước", ["give_cat_water"], "water", "nước"),
      T("pet", "Pet the cat", "Vuốt ve mèo", ["pet_cat"], "pet", "vuốt ve"),
      T("play", "Play with the cat", "Chơi với mèo", ["play_with_cat"], "play with", "chơi với"),
      T("brush", "Brush the cat", "Chải lông mèo", ["brush_cat"], "fur / brush", "lông / chải"),
      T("plant", "Water the plant", "Tưới cây", ["water_plant"], "plant", "cây", { free: true }),
      T("sweep", "Sweep up the fur", "Quét lông mèo", ["sweep_floor", "sweep_under_table"], "sweep up", "quét dọn"),
      T("tap", "Turn on the faucet", "Mở vòi nước", ["turn_on_faucet"], "faucet / tap", "vòi nước"),
      T("dish", "Wash the cat bowl", "Rửa bát mèo", ["wash_dishes"], "bowl", "bát"),
      T("sofa", "Relax on the sofa", "Thư giãn trên sofa", ["sit_on_sofa", "lie_on_sofa"], "relax", "thư giãn")] },
    { id: "laundry", icon: "🧺", title_en: "Laundry Day", title_vi: "Ngày giặt đồ", goal_vi: "Gom quần áo, cất đồ sạch và gấp chăn.", minutes: 8, tasks: [
      T("pick", "Pick up the clothes", "Nhặt quần áo", ["pick_up_clothes"], "clothes", "quần áo"),
      T("empty", "Empty the basket", "Đổ giỏ đồ", ["empty_basket"], "basket", "giỏ"),
      T("open", "Open the wardrobe", "Mở tủ quần áo", ["open_wardrobe"], "wardrobe", "tủ quần áo"),
      T("take", "Take out a shirt", "Lấy áo sơ mi", ["take_out_shirt"], "shirt", "áo sơ mi"),
      T("hang", "Hang up the shirt", "Treo áo lên", ["hang_up_shirt"], "hang up", "treo lên"),
      T("close", "Close the wardrobe", "Đóng tủ", ["close_wardrobe"], "close", "đóng"),
      T("fold", "Fold the blanket", "Gấp chăn", ["fold_blanket"], "fold", "gấp"),
      T("spread", "Spread the blanket", "Trải chăn", ["spread_blanket"], "spread", "trải"),
      T("pillow", "Fluff the pillow", "Vỗ gối", ["pick_up_pillow", "fluff_pillow"], "pillow", "gối"),
      T("throw", "Fold the throw", "Gấp chăn sofa", ["fold_throw"], "throw blanket", "chăn phủ sofa", { free: true })] },
    { id: "go_out", icon: "👟", title_en: "Getting Ready to Go Out", title_vi: "Chuẩn bị ra ngoài", goal_vi: "Đánh răng, rửa mặt, thay đồ và ra cửa.", minutes: 8,
      requires: ["brush_teeth", "wash_face", "put_on_shoes"], tasks: [
      T("teeth", "Brush your teeth", "Đánh răng", ["brush_teeth"], "teeth", "răng"),
      T("face", "Wash your face", "Rửa mặt", ["wash_face"], "face", "mặt"),
      T("hair", "Brush your hair", "Chải tóc", ["brush_hair"], "hair", "tóc"),
      T("ward", "Open the wardrobe", "Mở tủ", ["open_wardrobe"], "wardrobe", "tủ"),
      T("shirt", "Take out a shirt", "Lấy áo", ["take_out_shirt"], "shirt", "áo"),
      T("mirror", "Look in the mirror", "Soi gương", ["look_in_mirror"], "mirror", "gương"),
      T("slip", "Take off your slippers", "Cởi dép", ["take_off_slippers"], "slippers", "dép"),
      T("shoes", "Put on your shoes", "Đi giày", ["put_on_shoes"], "shoes", "giày"),
      T("phone", "Unplug the charger", "Rút sạc", ["unplug_charger"], "charger", "sạc"),
      T("lamp", "Turn off the lamp", "Tắt đèn", ["turn_off_lamp"], "turn off", "tắt")] },
    { id: "rainy", icon: "🌧️", title_en: "A Rainy Day at Home", title_vi: "Ngày mưa ở nhà", goal_vi: "Đóng cửa, pha đồ uống ấm và đọc sách.", minutes: 8, tasks: [
      T("look", "Open the window and look at the rain", "Mở cửa sổ xem mưa", ["open_window"], "rain", "mưa"),
      T("win", "Close the window", "Đóng cửa sổ", ["close_window"], "close", "đóng"),
      T("curt", "Close the curtains", "Kéo rèm", ["close_living_curtains", "close_curtains"], "close the curtains", "kéo rèm"),
      T("lamp", "Turn on the lamp", "Bật đèn", ["turn_on_floor_lamp", "turn_on_lamp"], "lamp", "đèn"),
      T("kettle", "Fill the kettle", "Đổ nước vào ấm", ["fill_kettle"], "kettle", "ấm"),
      T("boil", "Boil water", "Đun nước", ["boil_water"], "boil", "đun sôi"),
      T("pour", "Pour hot water", "Rót nước nóng", ["pour_hot_water"], "hot", "nóng"),
      T("book", "Pick up a book", "Cầm sách", ["pick_up_book"], "book", "sách"),
      T("read", "Read on the sofa", "Đọc sách trên sofa", ["read_on_sofa"], "read", "đọc"),
      T("cat", "Pet the cat", "Vuốt ve mèo", ["pet_cat"], "pet", "vuốt ve", { free: true }),
      T("music", "Listen to music", "Nghe nhạc", ["listen_to_music"], "music", "âm nhạc")] },
    { id: "car", icon: "🚗", title_en: "Weekend Car Care", title_vi: "Chăm xe cuối tuần", goal_vi: "Rửa xe và kiểm tra lốp trong ga-ra.", minutes: 10,
      requires: ["go_garage", "wash_car", "check_tires"], tasks: [
      T("go", "Go to the garage", "Ra ga-ra", ["go_garage"], "garage", "ga-ra"),
      T("tires", "Check the tires", "Kiểm tra lốp", ["check_tires"], "tire", "lốp xe"),
      T("bucket", "Fill a bucket", "Đổ nước vào xô", ["fill_bucket"], "bucket", "xô"),
      T("wash", "Wash the car", "Rửa xe", ["wash_car"], "wash", "rửa"),
      T("rinse", "Rinse the car", "Xả nước", ["rinse_car"], "rinse", "xả"),
      T("dry", "Dry the car", "Lau khô xe", ["dry_car"], "dry", "lau khô"),
      T("vac", "Vacuum the seats", "Hút bụi ghế", ["vacuum_car"], "vacuum", "hút bụi"),
      T("oil", "Check the oil", "Kiểm tra dầu", ["check_oil"], "oil", "dầu"),
      T("hands", "Wash your hands", "Rửa tay", ["wash_hands"], "hands", "tay"),
      T("drink", "Drink some coffee", "Uống cà phê", ["drink_coffee"], "drink", "uống")] },
    { id: "relax", icon: "🛋️", title_en: "Relaxing After Work", title_vi: "Thư giãn sau giờ làm", goal_vi: "Nghỉ ngơi, xem TV và chuẩn bị đi ngủ.", minutes: 8, tasks: [
      T("slip", "Put on your slippers", "Đi dép", ["put_on_slippers"], "slippers", "dép"),
      T("lamp", "Turn on the floor lamp", "Bật đèn cây", ["turn_on_floor_lamp"], "floor lamp", "đèn cây"),
      T("sofa", "Sit on the sofa", "Ngồi sofa", ["sit_on_sofa"], "sofa", "ghế sofa"),
      T("tv", "Turn on the TV", "Bật TV", ["turn_on_tv"], "TV", "ti vi"),
      T("watch", "Watch TV", "Xem TV", ["watch_tv"], "watch", "xem"),
      T("cat", "Pet the cat", "Vuốt ve mèo", ["pet_cat"], "pet", "vuốt ve", { free: true }),
      T("off", "Turn off the TV", "Tắt TV", ["turn_off_tv"], "turn off", "tắt"),
      T("music", "Listen to music", "Nghe nhạc", ["listen_to_music"], "music", "nhạc"),
      T("aoff", "Turn off the alarm", "Tắt báo thức", ["turn_off_alarm"], "alarm", "báo thức"),
      T("alarm", "Set the alarm", "Đặt báo thức", ["set_alarm"], "set an alarm", "đặt báo thức"),
      T("pil", "Pick up the pillow", "Nhặt gối", ["pick_up_pillow"], "pillow", "gối"),
      T("sleep", "Lie down", "Nằm xuống", ["lie_down"], "lie down", "nằm xuống")] },
    { id: "guests", icon: "🎉", optional: true, title_en: "Preparing for Guests", title_vi: "Chuẩn bị đón khách", goal_vi: "Dọn nhà và chuẩn bị đồ uống cho khách.", minutes: 10, tasks: [
      T("sweep", "Sweep the floor", "Quét nhà", ["sweep_floor"], "guest", "khách"),
      T("wipe", "Wipe the table", "Lau bàn", ["wipe_table"], "wipe", "lau"),
      T("cush", "Fluff the cushions", "Vỗ gối tựa", ["fluff_cushion"], "cushion", "gối"),
      T("plant", "Water the plant", "Tưới cây", ["water_plant"], "plant", "cây", { free: true }),
      T("win", "Open the window", "Mở cửa sổ", ["open_window"], "air", "không khí"),
      T("coffee", "Make coffee", "Pha cà phê", ["make_coffee"], "coffee", "cà phê"),
      T("pour", "Pour the coffee", "Rót cà phê", ["pour_coffee"], "pour", "rót"),
      T("set", "Set the table", "Bày bàn", ["set_the_table"], "set", "bày"),
      T("music", "Play some music", "Mở nhạc", ["listen_to_music"], "music", "nhạc"),
      T("lamp", "Turn on the lamp", "Bật đèn", ["turn_on_floor_lamp"], "lamp", "đèn")] }
  ];
  const byId = id => CHALLENGES.find(c => c.id === id);

  /* ---------- host / storage ---------- */
  let host = {};
  let store = null;
  try { store = root.localStorage || null; } catch (e) { store = null; }
  const fresh = () => ({ v: 1, unlocked: [CHALLENGES[0].id], best: {}, current: null });
  let S = load();
  function load() {
    try { const j = store && JSON.parse(store.getItem(KEY) || "null"); if (j && j.v === 1) return Object.assign(fresh(), j); } catch (e) { /* ignore */ }
    return fresh();
  }
  function save() { try { store && store.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  const now = () => (host.now ? host.now() : Date.now());

  function actionExists(id) {
    if (host.actionExists) return !!host.actionExists(id);
    const A = root.ELW && root.ELW.ACTIONS; return A ? A.some(a => a.id === id) : true;
  }
  const missing = c => (c.requires || []).filter(id => !actionExists(id));
  const isLocked = c => missing(c).length > 0;
  const isUnlocked = c => !isLocked(c);   // progression is advisory (★); availability = room exists

  /* ---------- bars (only real data) ---------- */
  function cTopicOf(c) {
    if (!c) return "home";
    if (c.topic) return c.topic;
    const id = String(c.id || "");
    for (const t of ["cafe", "market", "park", "restaurant", "outdoor", "school"]) {
      if (id.startsWith(t + "_") || id === t) return t;
    }
    return "home";
  }
  function curTopic() {
    try { if (host && typeof host.getTopic === "function") return host.getTopic() || "home"; } catch (e) {}
    return "home";
  }
  function homePct() {
    const N = root.ELW_NEEDS; if (!N || !N.state) return null;
    const s = N.state(), D = N.NEEDS || {}; const ks = Object.keys(s); if (!ks.length) return null;
    return Math.round(ks.reduce((t, k) => t + ((D[k] && D[k].bad === "low") ? s[k] : 100 - s[k]), 0) / ks.length);
  }
  function bars(ctx) {
    ctx = ctx || S.current; if (!ctx) return [];
    const c = byId(ctx.id), easy = ctx.mode === "easy", n = c.tasks.length;
    const isHome = cTopicOf(c) === "home";
    const out = [
      { id: "tasks", icon: "📋", label_vi: isHome ? "Việc nhà" : "Nhiệm vụ tại chỗ", required: true, target: easy ? Math.ceil(n * 0.7) : n, value: x => x.done.length },
      { id: "english", icon: "🗣", label_vi: "Luyện tiếng Anh (nói/nghe/hội thoại)", required: true, target: easy ? 1 : 3, value: x => x.speak + x.listen + x.roleplay },
      { id: "story", icon: "📖", label_vi: "Nghe câu chuyện tổng kết", required: true, target: 1, value: x => (x.storyHeard ? 1 : 0) }
    ];
    if (root.ELW_EVENTS && isHome) out.splice(1, 0, { id: "events", icon: "🚨", label_vi: "Sự cố khẩn cấp đã xử lý", required: false, target: 1, value: x => x.events });
    if (isHome && homePct() != null) out.splice(out.length - 1, 0, { id: "home", icon: "🏠", label_vi: "Nhà cửa gọn gàng", required: false, target: easy ? 50 : 65, unit: "%", value: () => homePct() });
    return out.map(b => { const v = b.value(ctx) || 0; return Object.assign(b, { cur: v, ok: v >= b.target }); });
  }
  const requiredGreen = ctx => bars(ctx).filter(b => b.required).every(b => b.ok);
  const tasksReady = ctx => { const b = bars(ctx).find(x => x.id === "tasks"); return b && b.ok; };

  /* ---------- engine ---------- */
  function start(id, opt) {
    const c = byId(id); if (!c) throw new Error("no challenge " + id);
    if (isLocked(c)) return null;
    if (root.ELW_MISSION && typeof root.ELW_MISSION.active === "function" && root.ELW_MISSION.active()) {
      try { if (typeof root.ELW_MISSION.stop === "function") root.ELW_MISSION.stop(); } catch (e) { /* ignore */ }
    }
    const mode = (opt && opt.mode) || "normal";
    S.current = { id, mode, done: [], log: [], speak: 0, listen: 0, roleplay: 0, events: 0, storyHeard: false,
      startedAt: now(), elapsed: 0, paused: false, resumedAt: now(), completed: null };
    save(); emit(); return S.current;
  }
  const current = () => S.current;
  const challenge = () => S.current && byId(S.current.id);
  function nextTask(ctx) {
    ctx = ctx || S.current; if (!ctx) return null;
    const c = byId(ctx.id);
    return c.tasks.find(t => !t.free && !ctx.done.includes(t.id)) || c.tasks.find(t => !ctx.done.includes(t.id)) || null;
  }
  const active = () => S.current && !S.current.completed && !S.current.paused;
  function onAction(actionId, W) {
    const x = S.current; if (!active()) return { advanced: false };
    x.log.push(actionId);
    const c = byId(x.id), nt = nextTask(x);
    const ok = t => t && !x.done.includes(t.id) && t.anyOf.includes(actionId) && (!t.check || safe(() => t.check(W)));
    let hit = ok(nt) ? nt : c.tasks.find(t => t.free && ok(t));
    if (hit) x.done.push(hit.id);
    save(); checkComplete(); emit();
    return { advanced: !!hit, task: hit ? hit.id : null };
  }
  function safe(f) { try { return !!f(); } catch (e) { return false; } }
  function bump(k) { if (!active()) return; S.current[k]++; save(); checkComplete(); emit(); }
  const onSpeak = () => bump("speak"), onListen = () => bump("listen"), onRoleplay = () => bump("roleplay");
  function onEvent(r) { if (active() && (!r || r.solved || r.ok || r === true)) bump("events"); }
  function markStoryHeard() { if (!active()) return; S.current.storyHeard = true; save(); checkComplete(); emit(); }
  function elapsedMs(x) { x = x || S.current; if (!x) return 0; return x.elapsed + ((x.paused || x.completed) ? 0 : now() - x.resumedAt); }
  function pause() { const x = S.current; if (!x || x.paused || x.completed) return; x.elapsed = elapsedMs(x); x.paused = true; save(); emit(); }
  function resume() { const x = S.current; if (!x || !x.paused) return; x.paused = false; x.resumedAt = now(); save(); emit(); }
  function setMode(m) { if (S.current && !S.current.completed) { S.current.mode = m; save(); checkComplete(); emit(); } }
  function checkComplete() {
    const x = S.current; if (!x || x.completed || !requiredGreen(x)) return false;
    const c = byId(x.id), ms = elapsedMs(x); x.elapsed = ms;
    const bonus = bars(x).filter(b => !b.required);
    const timeOk = x.mode === "normal" && ms <= c.minutes * 60000;
    const stars = 1 + (timeOk ? 1 : 0) + (bonus.length && bonus.every(b => b.ok) ? 1 : 0);
    const xp = 20 + x.done.length * 3 + stars * 5;
    x.completed = { at: now(), ms, stars, xp };
    S.best[x.id] = Math.max(S.best[x.id] || 0, stars);
    const i = CHALLENGES.indexOf(c), nx = CHALLENGES[i + 1];
    if (nx && !S.unlocked.includes(nx.id)) S.unlocked.push(nx.id);
    try { host.addXp && host.addXp(xp, "challenge:" + x.id); } catch (e) { /* ignore */ }
    save(); return true;
  }
  function replay() { const x = S.current; if (!x) return null; return start(x.id, { mode: x.mode }); }
  function quit() { S.current = null; save(); emit(); }
  function nextChallenge() { const x = S.current; if (!x) return null; const i = CHALLENGES.findIndex(c => c.id === x.id);
    for (let j = i + 1; j < CHALLENGES.length; j++) if (!isLocked(CHALLENGES[j])) return CHALLENGES[j]; return null; }
  function vocab(ctx) { ctx = ctx || S.current; if (!ctx) return []; const c = byId(ctx.id);
    return c.tasks.filter(t => ctx.done.includes(t.id)).map(t => ({ en: t.learn_en, vi: t.learn_vi })); }
  function storyText() {
    const x = S.current; if (!x || !host.buildStory) return "";
    try { const r = host.buildStory(x.log.map((id, i) => ({ uid: i, id, ctx: {} }))); return Array.isArray(r) ? r.map(s => s.en || s).join(" ") : String(r || ""); } catch (e) { return ""; }
  }

  /* ---------- UI ---------- */
  const css = `.ch-card{--accent:#e8743b;--line:#e3d6c3;--ok:#3a9d5d;--warn:#e0a03a;--bad:#c0392b;--off:#bbb;border:1px solid var(--line);border-radius:12px;background:#fffaf2;padding:10px;font:14px/1.4 system-ui,sans-serif;color:#3b2f25;max-width:100%;box-sizing:border-box}
.ch-card *{box-sizing:border-box}.ch-hd{display:flex;align-items:center;gap:6px;justify-content:space-between}.ch-hd h2{margin:0;font-size:16px}
.ch-btn{border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 10px;font:inherit;cursor:pointer;min-height:34px}.ch-btn.pri{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
.ch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:8px}
.ch-tile{border:1px solid var(--line);border-radius:10px;padding:8px;background:#fff;text-align:left;font:inherit;cursor:pointer}.ch-tile b{display:block;font-size:13px}.ch-tile small{color:#7a6a5a}
.ch-tile.lock{opacity:.55;cursor:not-allowed}.ch-star{color:var(--warn)}
.ch-goal{margin:6px 0;color:#5a4a3a}.ch-now{border:2px solid var(--accent);border-radius:10px;padding:8px;background:#fff;display:flex;gap:8px;align-items:center;justify-content:space-between;margin:6px 0}
.ch-list{list-style:none;margin:6px 0;padding:0}.ch-list li{padding:3px 0;border-bottom:1px dashed var(--line);display:flex;gap:6px}.ch-list li.d{color:#7a6a5a;text-decoration:line-through}.ch-list li.c{font-weight:700;color:var(--accent)}
.ch-bar{margin:5px 0}.ch-bar .l{display:flex;justify-content:space-between;font-size:12.5px;gap:6px}.ch-track{height:9px;border-radius:5px;background:#eee;overflow:hidden;border:1px solid var(--line)}
.ch-fill{height:100%;background:var(--warn)}.ch-bar.ok .ch-fill{background:var(--ok)}.ch-bar.no .ch-fill{background:var(--bad)}.ch-bar.bonus .l::after{content:""}
.ch-tag{font-size:11px;border-radius:6px;padding:0 5px;background:#f3e6d3}.ch-tag.b{background:#fde9c9}
.ch-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;align-items:center}.ch-win{text-align:center}.ch-win .big{font-size:22px;color:var(--ok);font-weight:700}
.ch-story{background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px;text-align:left;margin:6px 0}.ch-voc{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}.ch-voc span{background:#fff;border:1px solid var(--line);border-radius:6px;padding:1px 6px;font-size:12.5px}
.ch-body[hidden]{display:none}`;
  let ui = null; const listeners = [];
  function emit() { listeners.forEach(f => { try { f(S.current); } catch (e) { /* ignore */ } }); if (ui) draw(); }
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const mmss = ms => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

  function renderPanel(container, h) {
    host = Object.assign({}, host, h || {});
    if (typeof document !== "undefined" && !document.getElementById("ch-css")) { const st = document.createElement("style"); st.id = "ch-css"; st.textContent = css; document.head.appendChild(st); }
    ui = { el: container, open: true }; container.classList.add("ch-card"); draw(); return container;
  }
  function barHtml(b) {
    const pct = Math.min(100, Math.round((b.cur / b.target) * 100));
    const st = b.ok ? "ok" : (b.required && S.current && S.current.completed === null && b.cur === 0 ? "no" : "");
    const ic = b.ok ? "✅" : b.cur === 0 && b.required ? "⛔" : "⏳";
    return `<div class="ch-bar ${st} ${b.required ? "" : "bonus"}" data-bar="${b.id}"><div class="l"><span>${b.icon} ${esc(b.label_vi)} <span class="ch-tag ${b.required ? "" : "b"}">${b.required ? "Bắt buộc" : "Thưởng"}</span></span><span>${ic} ${b.cur}${b.unit || ""}/${b.target}${b.unit || ""}</span></div><div class="ch-track"><div class="ch-fill" style="width:${pct}%"></div></div></div>`;
  }
  function draw() {
    const el = ui.el, tp = curTopic(), x0 = S.current, c = x0 && byId(x0.id), x = (x0 && c && cTopicOf(c) === tp) ? x0 : null;
    const head = `<div class="ch-hd"><h2>🏆 Thử thách đời sống</h2><span>${x ? `<button class="ch-btn" data-a="menu">☰ Danh sách</button>` : ""}<button class="ch-btn" data-a="fold" aria-expanded="${ui.open}">${ui.open ? "▾" : "▸"}</button></span></div>`;
    let body = "";
    if (!x) {
      const list = CHALLENGES.filter(ch => cTopicOf(ch) === tp);
      const shown = list.length ? list : CHALLENGES;
      body = `<div class="ch-grid">${shown.map(ch => { const lk = isLocked(ch), b = S.best[ch.id] || 0;
        return `<button class="ch-tile ${lk ? "lock" : ""}" data-start="${ch.id}" ${lk ? "disabled" : ""}>${ch.icon} <b>${esc(ch.title_en)}</b><small>${esc(ch.title_vi)}${ch.optional ? " · thêm" : ""}</small><br>${lk ? "🔒 <small>sắp có</small>" : `<span class="ch-star">${"★".repeat(b)}${"☆".repeat(3 - b)}</span>`}</button>`; }).join("")}</div>`;
    } else if (x.completed) {
      const nx = nextChallenge(), story = storyText();
      body = `<div class="ch-win"><div class="big">🎉 Hoàn thành!</div><div>${esc(c.title_en)} — <span class="ch-star">${"★".repeat(x.completed.stars)}${"☆".repeat(3 - x.completed.stars)}</span></div>
<div class="ch-row" style="justify-content:center">📋 ${x.done.length}/${c.tasks.length} việc · ⏱ ${mmss(x.completed.ms)} · ⭐ +${x.completed.xp} XP</div>
<div class="ch-voc">${vocab(x).map(v => `<span>${esc(v.en)} – ${esc(v.vi)}</span>`).join("")}</div>
${story ? `<div class="ch-story">${esc(story)}</div>` : ""}
<div class="ch-row" style="justify-content:center"><button class="ch-btn" data-a="replay">↺ Chơi lại</button>${nx ? `<button class="ch-btn pri" data-start="${nx.id}">Thử thách tiếp ▶</button>` : ""}</div></div>`;
    } else {
      const nt = nextTask(x), bs = bars(x), ready = tasksReady(x);
      const goal = x.mode === "normal" ? ` · ⏱ ${mmss(elapsedMs(x))} / mục tiêu ${c.minutes}:00 (không bị thua)` : x.mode === "easy" ? " · 🌱 Dễ" : " · 🧘 Luyện tập (không tính giờ)";
      body = `<div class="ch-goal"><b>${c.icon} ${esc(c.title_en)}</b> — ${esc(c.goal_vi)}<small>${goal}</small></div>
${x.paused ? `<div class="ch-now">⏸ Đang tạm dừng<button class="ch-btn pri" data-a="resume">▶ Tiếp tục</button></div>` : nt ? `<div class="ch-now" data-cur="${nt.id}"><div><b>${esc(nt.title_en)}</b><br><small>${esc(nt.title_vi)} · 💡 ${esc(nt.learn_en)} = ${esc(nt.learn_vi)}</small></div><button class="ch-btn pri" data-a="do">▶ Làm</button></div>`
        : ready || !nt ? `<div class="ch-now"><div>📖 Nghe câu chuyện hôm nay để kết thúc</div><button class="ch-btn pri" data-a="story">🔊 Nghe</button></div>` : ""}
${ready && nt && !x.storyHeard ? `<div class="ch-row"><button class="ch-btn" data-a="story">📖 Nghe câu chuyện tổng kết</button></div>` : ""}
<div>${bs.map(barHtml).join("")}</div>
<ul class="ch-list">${c.tasks.map(t => { const d = x.done.includes(t.id); return `<li class="${d ? "d" : nt && nt.id === t.id ? "c" : ""}">${d ? "✅" : nt && nt.id === t.id ? "▶" : "⬜"} ${esc(t.title_en)} <small>· ${esc(t.title_vi)}${t.free ? " · tự do" : ""}</small></li>`; }).join("")}</ul>
<div class="ch-row">${x.paused ? "" : `<button class="ch-btn" data-a="pause">⏸ Tạm dừng</button>`}<label><input type="checkbox" data-a="practice" ${x.mode === "practice" ? "checked" : ""}> Luyện tập</label><label><input type="checkbox" data-a="easy" ${x.mode === "easy" ? "checked" : ""}> Dễ</label><button class="ch-btn" data-a="replay">↺ Làm lại</button></div>`;
    }
    el.innerHTML = head + `<div class="ch-body" ${ui.open ? "" : "hidden"}>${body}</div>`;
    el.querySelectorAll("[data-start]").forEach(b => b.onclick = () => API.start(b.dataset.start, { mode: (S.current && S.current.mode) || "normal" }));
    const on = (a, f) => el.querySelectorAll(`[data-a="${a}"]`).forEach(b => (b.type === "checkbox" ? (b.onchange = () => f(b.checked)) : (b.onclick = f)));
    on("fold", () => { ui.open = !ui.open; draw(); });
    on("menu", quit);
    on("pause", pause); on("resume", resume); on("replay", replay);
    on("practice", v => setMode(v ? "practice" : "normal")); on("easy", v => setMode(v ? "easy" : "normal"));
    on("do", () => { const t = nextTask(); if (!t || !host.enqueue) return; const id = t.anyOf.find(actionExists); if (id) host.enqueue(id); });
    on("story", () => { let done = false; try { done = !!(host.reenact && host.reenact()); } catch (e) { done = false; } if (!done) { const s = storyText() || vocab().map(v => v.en).join(", "); try { host.speak && host.speak(s); } catch (e) { /* ignore */ } } markStoryHeard(); });
  }

  const nextTaskIds = () => { const x = S.current; if (!active()) return []; const c = byId(x.id); if (c && cTopicOf(c) !== curTopic()) return []; return c.tasks.filter(t => !x.done.includes(t.id)).flatMap(t => t.anyOf); };
  const API = { KEY, CHALLENGES, css, start, current, challenge, nextTask, nextTaskIds, active, onAction, onEvent, onSpeak, onListen, onRoleplay, markStoryHeard,
    pause, resume, setMode, replay, quit, nextChallenge, bars, requiredGreen, isLocked, missing, isUnlocked, vocab, storyText, elapsedMs, renderPanel,
    refresh: () => { if (ui) draw(); },
    state: () => S, subscribe: f => listeners.push(f), setHost: h => { host = Object.assign({}, host, h); },
    _setStorage: st => { store = st; S = load(); } };
  root.ELW_CHALLENGE = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : globalThis);
