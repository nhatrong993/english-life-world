/* English Life World — food inventory module (fridge contents + ingredient-based cooking)
   Browser: window.ELW_FOOD.  Node: module.exports.
   State added (W0): fridgeInv {id:count}, counter [ids on the kitchen counter], prep {washed,peeled,cut}, dish, glass, groceries, f_mwLeftovers.
   All inventory changes go through ["set", key, newValue] steps, so the app's runSeq applies them. */
(function () {
"use strict";

/* ---------- items ---------- */
// [id, en (plural/mass as used in "the …"), vi, ipa, category, shelf, default count, prep:{wash,peel}]
const ROWS = [
  ["milk", "milk", "sữa", "/mɪlk/", "dairy", "door", 2, {}],
  ["water", "bottled water", "nước đóng chai", "/ˈbɑt.əld ˈwɔː.tər/", "drinks", "door", 4, {}],
  ["butter", "butter", "bơ", "/ˈbʌt.ər/", "dairy", "door", 1, {}],
  ["eggs", "eggs", "trứng", "/eɡz/", "dairy", "door", 6, {}],
  ["fish", "fish", "cá", "/fɪʃ/", "meat/fish", "freezer", 2, {}],
  ["cheese", "cheese", "phô mai", "/tʃiːz/", "dairy", "top", 2, {}],
  ["yogurt", "yogurt", "sữa chua", "/ˈjɑɡ.ət/", "dairy", "top", 4, {}],
  ["leftovers", "leftovers", "đồ ăn thừa", "/ˈleftˌoʊ.vəz/", "leftovers", "top", 1, {}],
  ["bread", "bread", "bánh mì", "/bred/", "leftovers", "top", 4, {}],
  ["tomatoes", "tomatoes", "cà chua", "/təˈmɑː.toʊz/", "vegetables", "middle", 4, { wash: 1 }],
  ["cucumbers", "cucumbers", "dưa chuột", "/ˈkjuː.kʌm.bəz/", "vegetables", "middle", 2, { wash: 1 }],
  ["bananas", "bananas", "chuối", "/bəˈnɑː.nəz/", "fruit", "middle", 3, { peel: 1 }],
  ["oranges", "oranges", "cam", "/ˈɑr.ɪn.dʒɪz/", "fruit", "middle", 3, { peel: 1 }],
  ["chicken", "chicken", "thịt gà", "/ˈtʃɪk.ɪn/", "meat/fish", "bottom", 2, {}],
  ["beef", "beef", "thịt bò", "/biːf/", "meat/fish", "bottom", 2, {}],
  ["lettuce", "lettuce", "rau xà lách", "/ˈlet.ɪs/", "vegetables", "bottom", 2, { wash: 1 }],
  ["apples", "apples", "táo", "/ˈæp.əlz/", "fruit", "bottom", 4, { wash: 1 }],
  ["carrots", "carrots", "cà rốt", "/ˈkær.əts/", "vegetables", "drawer", 4, { wash: 1, peel: 1 }],
  ["potatoes", "potatoes", "khoai tây", "/pəˈteɪ.toʊz/", "vegetables", "drawer", 4, { wash: 1, peel: 1 }],
  ["onions", "onions", "hành tây", "/ˈʌn.jənz/", "vegetables", "drawer", 3, { peel: 1 }],
  ["garlic", "garlic", "tỏi", "/ˈɡɑː.lɪk/", "vegetables", "drawer", 3, { peel: 1 }]
];
const ICON = {
  milk: `<rect x="-6" y="-20" width="12" height="20" rx="2" fill="#fff" stroke="#9ab8d0" stroke-width="1.2"/><path d="M-6 -20 L0 -25 L6 -20Z" fill="#7fb2dc"/><rect x="-6" y="-14" width="12" height="6" fill="#7fb2dc"/>`,
  water: `<rect x="-4" y="-20" width="8" height="20" rx="3" fill="#cfeaff" stroke="#6fa7d6" stroke-width="1.2"/><rect x="-2" y="-24" width="4" height="4" fill="#3d7fc0"/><rect x="-4" y="-12" width="8" height="5" fill="#3d7fc0" opacity=".6"/>`,
  butter: `<rect x="-9" y="-8" width="18" height="8" rx="1.5" fill="#ffe28a" stroke="#c9a530" stroke-width="1.2"/><rect x="-9" y="-8" width="18" height="3" fill="#f5c84a"/>`,
  eggs: `<ellipse cx="-4.5" cy="-6" rx="4" ry="5.5" fill="#fff6e6" stroke="#d8c3a0"/><ellipse cx="4.5" cy="-6" rx="4" ry="5.5" fill="#fff6e6" stroke="#d8c3a0"/><rect x="-9" y="-3" width="18" height="3" rx="1" fill="#c9b7a2"/>`,
  fish: `<path d="M-10 -6 Q-2 -13 6 -6 Q-2 1 -10 -6Z" fill="#8fb3c9" stroke="#557b93" stroke-width="1"/><path d="M5 -6 L10 -11 L10 -1Z" fill="#8fb3c9" stroke="#557b93" stroke-width="1"/><circle cx="-6" cy="-7" r="1" fill="#2d2a26"/>`,
  cheese: `<path d="M-9 0 L-9 -8 L9 -13 L9 0Z" fill="#ffd34d" stroke="#c9a12a" stroke-width="1.2"/><circle cx="-3" cy="-4" r="1.5" fill="#e8b92e"/><circle cx="4" cy="-6" r="1.2" fill="#e8b92e"/>`,
  yogurt: `<path d="M-6 -14 L6 -14 L5 0 L-5 0Z" fill="#fff" stroke="#c88fb4" stroke-width="1.2"/><rect x="-7" y="-16" width="14" height="3" rx="1" fill="#e48ac0"/><circle cx="0" cy="-7" r="2.5" fill="#f2b4d6"/>`,
  leftovers: `<rect x="-10" y="-11" width="20" height="11" rx="2" fill="#e9f4fb" stroke="#7aa6c4" stroke-width="1.2"/><rect x="-11" y="-13" width="22" height="3" rx="1" fill="#4f8fbf"/><path d="M-7 -4 Q0 -9 7 -4" stroke="#d98a3a" stroke-width="3" fill="none"/>`,
  bread: `<path d="M-10 0 L-10 -8 Q-10 -14 0 -14 Q10 -14 10 -8 L10 0Z" fill="#d9a35c" stroke="#9a6b2f" stroke-width="1.2"/><path d="M-4 -12 L-6 -7 M2 -13 L0 -8" stroke="#9a6b2f" stroke-width="1"/>`,
  tomatoes: `<circle cx="0" cy="-7" r="7" fill="#e7564d" stroke="#b33a32" stroke-width="1"/><path d="M-3 -14 L0 -12 L3 -14 L0 -15Z" fill="#4c9a44"/>`,
  cucumbers: `<rect x="-11" y="-6" width="22" height="6" rx="3" fill="#5fae55" stroke="#3b7a33" stroke-width="1" transform="rotate(-12)"/>`,
  bananas: `<path d="M-10 -10 Q-4 0 10 -4 L9 -7 Q-2 -4 -7 -12Z" fill="#ffd84a" stroke="#c9a12a" stroke-width="1"/><path d="M-10 -10 L-9 -13" stroke="#6b4a1f" stroke-width="2"/>`,
  oranges: `<circle cx="0" cy="-7" r="7" fill="#f2a33a" stroke="#c97d1a" stroke-width="1"/><circle cx="1" cy="-13" r="1.3" fill="#4c9a44"/>`,
  chicken: `<path d="M-9 -2 Q-11 -12 -1 -12 Q8 -12 6 -4 Q3 1 -9 -2Z" fill="#f4c7a1" stroke="#c98d63" stroke-width="1.2"/><rect x="5" y="-6" width="6" height="3" rx="1.5" fill="#fff" stroke="#c9b7a2" stroke-width=".8"/>`,
  beef: `<rect x="-10" y="-9" width="20" height="9" rx="3" fill="#c94a4a" stroke="#8f2d2d" stroke-width="1.2"/><path d="M-6 -6 Q0 -2 6 -6" stroke="#f3d1d1" stroke-width="1.5" fill="none"/>`,
  lettuce: `<circle cx="0" cy="-7" r="7.5" fill="#9fd39a" stroke="#4f9a49" stroke-width="1"/><path d="M-4 -9 Q0 -4 4 -9 M0 -14 L0 -3" stroke="#4f9a49" stroke-width="1" fill="none"/>`,
  apples: `<circle cx="0" cy="-7" r="7" fill="#d9413a" stroke="#9e2a24" stroke-width="1"/><path d="M0 -14 L1 -17" stroke="#6b4a1f" stroke-width="1.5"/><ellipse cx="3" cy="-16" rx="2.5" ry="1.3" fill="#4c9a44"/>`,
  carrots: `<path d="M-2 0 L-5 -14 L5 -14 Z" fill="#f08a2c" stroke="#b85f12" stroke-width="1"/><path d="M-2 -14 L-4 -19 M0 -14 L0 -20 M2 -14 L4 -19" stroke="#4c9a44" stroke-width="1.5"/>`,
  potatoes: `<ellipse cx="0" cy="-5" rx="9" ry="5.5" fill="#c9a06a" stroke="#8f6a3a" stroke-width="1"/><circle cx="-3" cy="-6" r=".9" fill="#8f6a3a"/><circle cx="3" cy="-4" r=".9" fill="#8f6a3a"/>`,
  onions: `<path d="M0 -15 Q8 -8 6 -3 Q4 0 0 0 Q-4 0 -6 -3 Q-8 -8 0 -15Z" fill="#e6c08a" stroke="#a87a3a" stroke-width="1"/><path d="M0 -15 L0 -18" stroke="#6b8a3a" stroke-width="1.5"/>`,
  garlic: `<path d="M0 -13 Q7 -6 5 -2 Q3 0 0 0 Q-3 0 -5 -2 Q-7 -6 0 -13Z" fill="#f7f1e3" stroke="#bfae8a" stroke-width="1"/><path d="M0 -12 L0 -1 M-3 -9 L-2 -1 M3 -9 L2 -1" stroke="#d8ccb0" stroke-width=".8"/>`
};
const ITEMS = {};
for (const [id, en, vi, ipa, category, shelf, def, prep] of ROWS) ITEMS[id] = { id, en, vi, ipa, category, shelf, def, prep, icon: ICON[id] };
const SHELVES = [["freezer", "Freezer", "Ngăn đá"], ["top", "Top shelf", "Ngăn trên"], ["middle", "Middle shelf", "Ngăn giữa"], ["bottom", "Bottom shelf", "Ngăn dưới"], ["drawer", "Vegetable drawer", "Ngăn rau củ"], ["door", "Door shelves", "Cánh cửa"]];
const DEFAULT_INV = () => Object.fromEntries(ROWS.map(r => [r[0], r[6]]));
const W0 = { fridgeInv: DEFAULT_INV(), counter: [], prep: { washed: [], peeled: [], cut: [] }, dish: null, glass: "empty", groceries: "none", f_mwLeftovers: false };

/* ---------- pure state helpers (return NEW objects → safe with ["set",k,v]) ---------- */
const inv = W => W.fridgeInv || {};
const cnt = (W, id) => inv(W)[id] | 0;
const onCounter = (W, id) => (W.counter || []).filter(x => x === id).length;
const prepOf = W => W.prep || { washed: [], peeled: [], cut: [] };
const has = (W, kind, id) => (prepOf(W)[kind] || []).includes(id);
const minus = (W, id, n) => ({ ...inv(W), [id]: Math.max(0, cnt(W, id) - n) });
const plus = (W, id, n) => ({ ...inv(W), [id]: cnt(W, id) + n });
const counterRemove = (list, id, n) => { const out = list.slice(); for (let i = 0; i < n; i++) { const k = out.indexOf(id); if (k >= 0) out.splice(k, 1); } return out; };
const prepClear = (W, ids) => { const p = prepOf(W), c = W.counter || []; const keep = x => !ids.includes(x) || c.includes(x); return { washed: p.washed.filter(keep), peeled: p.peeled.filter(keep), cut: p.cut.filter(keep) }; };
const prepAdd = (W, kind, ids) => { const p = prepOf(W); return { ...p, [kind]: [...new Set([...(p[kind] || []), ...ids])] }; };
const busy = W => W.hand && W.hand !== "remote" ? "Tay đang cầm đồ. Hãy đặt xuống trước." : W.sitting ? "Hãy đứng dậy trước." : null;
const outOf = id => `Hết ${ITEMS[id].vi} rồi. Hãy đi chợ (Buy groceries).`;
/** need(W,id,n,allowFridge) → Vietnamese reason or null */
function need(W, id, n = 1, allowFridge = false) {
  const c = onCounter(W, id), f = cnt(W, id);
  if (c >= n || (allowFridge && c + f >= n)) return null;
  if (c + f >= n) return `Hãy lấy ${ITEMS[id].vi} ra khỏi tủ lạnh trước (Take out the ${ITEMS[id].en}).`;
  return c + f === 0 ? outOf(id) : `Không đủ ${ITEMS[id].vi} (cần ${n}). Hãy đi chợ (Buy groceries).`;
}
/** consume n of id, counter first then fridge; returns {counter, fridgeInv, prep} or null if impossible */
function consume(W, use) {
  let counter = (W.counter || []).slice(), fi = { ...inv(W) };
  for (const [id, n] of Object.entries(use)) {
    const c = counter.filter(x => x === id).length, take = Math.min(c, n);
    if (c + (fi[id] | 0) < n) return null;
    counter = counterRemove(counter, id, take); fi[id] = (fi[id] | 0) - (n - take);
  }
  return { counter, fridgeInv: fi, prep: prepClear({ ...W, counter }, Object.keys(use)) };
}
const useSteps = (W, use) => { const r = consume(W, use); return r ? [["set", "counter", r.counter], ["set", "fridgeInv", r.fridgeInv], ["set", "prep", r.prep]] : []; };

/* ---------- action factory ---------- */
const V = (en, ipa, vi) => [en, ipa, vi];
const VOC = {
  take: V("take out", "/teɪk aʊt/", "lấy ra"), back: V("put back", "/pʊt bæk/", "cất lại"), fridge: V("fridge", "/frɪdʒ/", "tủ lạnh"),
  wash: V("wash", "/wɑʃ/", "rửa"), peel: V("peel", "/piːl/", "gọt vỏ, bóc vỏ"), cut: V("cut", "/kʌt/", "cắt"), knife: V("knife", "/naɪf/", "con dao"),
  board: V("cutting board", "/ˈkʌt.ɪŋ bɔːd/", "cái thớt"), bowl: V("bowl", "/boʊl/", "cái bát"), salad: V("salad", "/ˈsæl.əd/", "món salad"),
  sandwich: V("sandwich", "/ˈsæn.wɪdʒ/", "bánh mì kẹp"), glass: V("glass", "/ɡlɑːs/", "cái cốc thuỷ tinh"), pour: V("pour", "/pɔːr/", "rót"),
  eat: V("eat", "/iːt/", "ăn"), drink: V("drink", "/drɪŋk/", "uống"), soup: V("soup", "/suːp/", "món súp, canh"), fry: V("fry", "/fraɪ/", "chiên, rán"),
  cook: V("cook", "/kʊk/", "nấu"), buy: V("buy", "/baɪ/", "mua"), groceries: V("groceries", "/ˈɡroʊ.sər.iz/", "thực phẩm, đồ đi chợ"),
  putaway: V("put away", "/pʊt əˈweɪ/", "cất đi"), microwave: V("microwave", "/ˈmaɪ.krə.weɪv/", "lò vi sóng"), vegetables: V("vegetables", "/ˈvedʒ.tə.bəlz/", "rau củ"),
  fruit: V("fruit", "/fruːt/", "trái cây"), stove: V("stove", "/stoʊv/", "bếp nấu"), spread: V("spread", "/spred/", "phết"), toast: V("toast", "/toʊst/", "bánh mì nướng"),
  slice: V("slice", "/slaɪs/", "lát; thái lát"), counter: V("counter", "/ˈkaʊn.tər/", "mặt bàn bếp")
};
const iv = id => [ITEMS[id].en, ITEMS[id].ipa, ITEMS[id].vi];
const mk = o => ({
  id: o.id, room: o.room, obj: o.obj, label: o.label, labelVi: o.labelVi, sentence: o.sentence, vi: o.vi, key: o.key,
  vocab: o.vocab, grammar: o.grammar, chunks: o.chunks, disc: { ans: o.disc[0], opts: o.disc.slice() }, patterns: o.patterns,
  pre: o.pre, seq: o.seq, story: o.story, sitOk: false
});
const fridgeOpen = W => W.fridge === "closed" ? [["pose", "reach", 400], ["set", "fridge", "open"], ["wait", 300]] : [];
const fridgeClose = W => W.fridge === "closed" ? [["pose", "reach", 300], ["set", "fridge", "closed"]] : [];
const counterIds = W => [...new Set(W.counter || [])];

const ACTIONS = [];
const OBJ_ACTS = { fridge: [], cuttingboard: [], sink: [], stove: [], microwave: [], diningtable: [] };
const add = (o, objKey) => { const a = mk(o); ACTIONS.push(a); (OBJ_ACTS[objKey || o.obj] = OBJ_ACTS[objKey || o.obj] || []).push(a.id); return a; };

/* --- per-food take out / put back (milk is handled by the app's own take_milk) --- */
for (const it of Object.values(ITEMS)) {
  if (it.id === "milk") continue;
  const id = it.id, en = it.en;
  add({
    id: "take_out_" + id, room: "living", obj: "fridge", label: `Take out the ${en}`, labelVi: `Lấy ${it.vi} ra`,
    sentence: `I'm taking the ${en} out of the fridge.`, vi: `Tôi đang lấy ${it.vi} ra khỏi tủ lạnh.`, key: ["taking", en.split(" ").pop(), "fridge"],
    vocab: [VOC.take, iv(id), VOC.fridge], grammar: "<b>take … out of …</b> = lấy … ra khỏi …. Đồ vật nằm giữa: take <b>the " + en + "</b> out.",
    chunks: [`I'm taking the ${en}`, "out of the fridge."], disc: ["taking", "talking", "making"],
    patterns: [`I'm taking the <b>${en}</b> out of the fridge.`, "I'm taking the <b>milk</b> out of the fridge."],
    pre: W => cnt(W, id) <= 0 ? outOf(id) : busy(W),
    seq: W => [["walk", "fridge"], ...fridgeOpen(W), ["pose", "reach", 450], ["spawn", "food_" + id], ["set", "fridgeInv", minus(W, id, 1)],
      ["walk", "counter"], ["pose", "reach", 350], ["despawn"], ["set", "counter", [...(W.counter || []), id]], ...(W.fridge === "closed" ? [["walk", "fridge"], ...fridgeClose(W)] : []), ["pose", "idle", 1]],
    story: [`take the ${en} out of the fridge`, `take the cold ${en} out of the fridge`, `lấy ${it.vi} ra khỏi tủ lạnh`]
  });
  add({
    id: "put_back_" + id, room: "living", obj: "fridge", label: `Put the ${en} back`, labelVi: `Cất ${it.vi} lại`,
    sentence: `I'm putting the ${en} back in the fridge.`, vi: `Tôi đang cất ${it.vi} lại vào tủ lạnh.`, key: ["putting", en.split(" ").pop(), "back"],
    vocab: [VOC.back, iv(id), VOC.fridge], grammar: "<b>put … back</b> = để lại chỗ cũ. Ngược nghĩa với take … out.",
    chunks: [`I'm putting the ${en} back`, "in the fridge."], disc: ["back", "bag", "black"],
    patterns: [`I'm putting the <b>${en}</b> back in the fridge.`, "I'm putting the <b>book</b> back on the shelf."],
    pre: W => onCounter(W, id) <= 0 ? `${ITEMS[id].vi[0].toUpperCase() + ITEMS[id].vi.slice(1)} không có trên bàn bếp.` : busy(W),
    seq: W => [["walk", "counter"], ["pose", "reach", 350], ["spawn", "food_" + id], ["set", "counter", counterRemove(W.counter || [], id, 1)],
      ["walk", "fridge"], ...fridgeOpen(W), ["pose", "reach", 400], ["despawn"], ["set", "fridgeInv", plus(W, id, 1)], ["set", "prep", prepClear({ ...W, counter: counterRemove(W.counter || [], id, 1) }, [id])], ...fridgeClose(W), ["pose", "idle", 1]],
    story: [`put the ${en} back in the fridge`, `put the ${en} back in the fridge`, `cất ${it.vi} lại vào tủ lạnh`]
  });
}

/* --- prep chain (kitchen) --- */
const WASHABLE = ROWS.filter(r => r[7].wash).map(r => r[0]);
const CUTTABLE = ["tomatoes", "cucumbers", "lettuce", "carrots", "potatoes", "onions", "apples", "bananas", "oranges"];
const cuttableReady = (W, id) => onCounter(W, id) > 0 && !has(W, "cut", id) && (!ITEMS[id].prep.wash || has(W, "washed", id)) && (!ITEMS[id].prep.peel || has(W, "peeled", id));
const k = (o) => add({ room: "kitchen", ...o });

k({
  id: "wash_vegetables", obj: "sink", label: "Wash the vegetables", labelVi: "Rửa rau củ", sentence: "I'm washing the vegetables in the sink.", vi: "Tôi đang rửa rau củ ở bồn rửa.",
  key: ["washing", "vegetables", "sink"], vocab: [VOC.wash, VOC.vegetables], grammar: "wash → washing. <b>vegetables</b> luôn dùng số nhiều khi nói chung.",
  chunks: ["I'm washing the vegetables", "in the sink."], disc: ["wash", "watch", "wish"], patterns: ["I'm washing the <b>apples</b>.", "I'm washing <b>my hands</b>."],
  pre: W => { const ids = counterIds(W).filter(x => WASHABLE.includes(x) && !has(W, "washed", x)); return ids.length ? busy(W) : "Trên bàn bếp chưa có rau củ cần rửa. Hãy lấy rau củ ra khỏi tủ lạnh (Take out the carrots / tomatoes…)."; },
  seq: W => { const ids = counterIds(W).filter(x => WASHABLE.includes(x)); return [["walk", "k_sink"], ...(ids.length ? [["spawn", "food_" + ids[0]]] : []), ["set", "k_faucet", "on"], ["pose", "wipe", 1600], ["set", "k_faucet", "off"], ["despawn"], ["set", "prep", prepAdd(W, "washed", ids)], ["pose", "idle", 1]]; },
  story: ["wash the vegetables", "carefully wash the vegetables in the sink", "rửa rau củ"]
});
for (const id of ["carrots", "potatoes", "onions", "garlic", "bananas", "oranges"]) {
  const it = ITEMS[id], one = { carrots: "a carrot", potatoes: "a potato", onions: "an onion", garlic: "the garlic", bananas: "a banana", oranges: "an orange" }[id];
  const viV = id === "bananas" || id === "oranges" || id === "garlic" || id === "onions" ? "bóc vỏ" : "gọt vỏ";
  k({
    id: "peel_" + id.replace(/s$/, "").replace(/oe$/, "o"), obj: "cuttingboard", label: `Peel ${one}`, labelVi: `${viV[0].toUpperCase() + viV.slice(1)} ${it.vi}`,
    sentence: `I'm peeling ${one}.`, vi: `Tôi đang ${viV} ${it.vi}.`, key: ["peeling", one.split(" ").pop()], vocab: [VOC.peel, iv(id)],
    grammar: "peel → peeling. <b>peel</b> dùng cho cả gọt (dao) và bóc (tay).", chunks: ["I'm peeling", one + "."], disc: ["peel", "pill", "pull"],
    patterns: [`I'm peeling <b>${one}</b>.`, "I'm peeling <b>an apple</b>."],
    pre: W => onCounter(W, id) <= 0 ? need(W, id) : has(W, "peeled", id) ? `${it.vi[0].toUpperCase() + it.vi.slice(1)} đã được ${viV} rồi.` : it.prep.wash && !has(W, "washed", id) ? "Hãy rửa trước (Wash the vegetables)." : busy(W),
    seq: W => [["walk", "k_table"], ["spawn", "food_" + id], ["pose", "wipe", 1200], ["despawn"], ["set", "prep", prepAdd(W, "peeled", [id])], ["pose", "idle", 1]],
    story: [`peel ${one}`, `slowly peel ${one}`, `${viV} ${it.vi}`]
  });
}
k({
  id: "cut_vegetables", obj: "cuttingboard", label: "Cut the vegetables", labelVi: "Cắt rau củ", sentence: "I'm cutting the vegetables on the cutting board.", vi: "Tôi đang cắt rau củ trên thớt.",
  key: ["cutting", "vegetables", "cutting board"], vocab: [VOC.cut, VOC.vegetables, VOC.board, VOC.knife], grammar: "cut → cu<b>tt</b>ing: nhân đôi phụ âm cuối (cut, sit, get…).",
  chunks: ["I'm cutting the vegetables", "on the cutting board."], disc: ["cut", "cat", "cute"], patterns: ["I'm cutting <b>the carrots</b>.", "I'm cutting <b>the bread</b>."],
  pre: W => { const all = counterIds(W).filter(x => CUTTABLE.includes(x) && !has(W, "cut", x)); if (!all.length) return "Không có rau củ nào trên bàn bếp để cắt. Hãy lấy ra khỏi tủ lạnh trước."; return all.some(x => cuttableReady(W, x)) ? busy(W) : (all.some(x => ITEMS[x].prep.wash && !has(W, "washed", x)) ? "Hãy rửa rau củ trước (Wash the vegetables)." : "Hãy gọt/bóc vỏ trước (Peel …)."); },
  seq: W => [["walk", "k_table"], ["pose", "wipe", 1600], ["set", "prep", prepAdd(W, "cut", counterIds(W).filter(x => cuttableReady(W, x)))], ["pose", "idle", 1]],
  story: ["cut the vegetables", "cut the vegetables into small pieces", "cắt rau củ"]
});
const dishPre = (W, req, extra) => { if (W.dish) return "Đang có một món ăn trên bàn. Hãy ăn hoặc cất đi trước."; for (const [id, how] of req) { const n = need(W, id); if (n) return n; if (how === "cut" && !has(W, "cut", id)) return `Hãy cắt ${ITEMS[id].vi} trước (Cut the vegetables).`; if (how === "washed" && !has(W, "washed", id)) return `Hãy rửa ${ITEMS[id].vi} trước (Wash the vegetables).`; } return extra ? extra(W) : busy(W); };
const dish = (o, req, dishName, spot, extra) => k({
  ...o, pre: W => dishPre(W, req, extra),
  seq: W => [["walk", spot], ...(o.preSteps || []), ["spawn", "food_" + req[0][0]], ["pose", o.pose || "wipe", 1500], ["despawn"], ...useSteps(W, Object.fromEntries(req.map(([id]) => [id, 1]))), ["set", "dish", dishName], ["pose", "idle", 1]]
});
const stoveOn = W => W.k_stove !== "on" ? "Hãy bật bếp trước (Turn on the stove)." : busy(W);
dish({ id: "make_salad", obj: "cuttingboard", label: "Make a salad", labelVi: "Làm salad", sentence: "I'm making a salad with lettuce, tomatoes and cucumbers.", vi: "Tôi đang làm salad với xà lách, cà chua và dưa chuột.",
  key: ["making", "salad"], vocab: [V("make", "/meɪk/", "làm"), VOC.salad, iv("lettuce"), iv("tomatoes"), iv("cucumbers")], grammar: "make → making: bỏ e. Liệt kê: A, B <b>and</b> C.",
  chunks: ["I'm making a salad", "with lettuce, tomatoes", "and cucumbers."], disc: ["salad", "salt", "solid"], patterns: ["I'm making <b>a sandwich</b>.", "I'm making <b>soup</b>."],
  story: ["make a salad", "make a fresh green salad", "làm salad"] }, [["lettuce", "cut"], ["tomatoes", "cut"], ["cucumbers", "cut"]], "salad", "k_table");
dish({ id: "make_fruit_salad", obj: "cuttingboard", label: "Put the fruit in a bowl", labelVi: "Cho trái cây vào bát", sentence: "I'm putting the fruit in a bowl.", vi: "Tôi đang cho trái cây vào bát.",
  key: ["putting", "fruit", "bowl"], vocab: [VOC.fruit, VOC.bowl, iv("apples"), iv("bananas")], grammar: "<b>fruit</b> thường không đếm được: some fruit, the fruit.",
  chunks: ["I'm putting the fruit", "in a bowl."], disc: ["bowl", "ball", "bell"], patterns: ["I'm putting <b>the salad</b> in a bowl.", "I'm putting <b>the soup</b> in a bowl."],
  story: ["put the fruit in a bowl", "put the cut fruit in a big bowl", "cho trái cây vào bát"] }, [["apples", "cut"], ["bananas", "cut"]], "fruit salad", "k_table");
dish({ id: "make_sandwich", obj: "cuttingboard", label: "Make a sandwich", labelVi: "Làm bánh mì kẹp", sentence: "I'm making a cheese sandwich.", vi: "Tôi đang làm bánh mì kẹp phô mai.",
  key: ["making", "sandwich", "cheese"], vocab: [VOC.sandwich, iv("bread"), iv("cheese"), iv("lettuce")], grammar: "Danh từ đứng trước danh từ như tính từ: a <b>cheese</b> sandwich = bánh mì kẹp phô mai.",
  chunks: ["I'm making", "a cheese sandwich."], disc: ["sandwich", "sand", "switch"], patterns: ["I'm making a <b>chicken</b> sandwich.", "I'm making an <b>egg</b> sandwich."],
  story: ["make a cheese sandwich", "make a tasty cheese sandwich", "làm bánh mì kẹp phô mai"] }, [["bread"], ["cheese"], ["lettuce", "washed"]], "sandwich", "k_table");
dish({ id: "make_vegetable_soup", obj: "stove", label: "Make vegetable soup", labelVi: "Nấu súp rau củ", sentence: "I'm making vegetable soup on the stove.", vi: "Tôi đang nấu súp rau củ trên bếp.",
  key: ["making", "soup", "stove"], vocab: [VOC.soup, VOC.vegetables, iv("carrots"), iv("potatoes"), iv("onions")], grammar: "<b>soup</b> không đếm được: some soup, a bowl of soup.",
  chunks: ["I'm making vegetable soup", "on the stove."], disc: ["soup", "soap", "shop"], patterns: ["I'm making <b>chicken</b> soup.", "I'm making <b>tomato</b> soup."],
  story: ["make vegetable soup", "make a big pot of vegetable soup", "nấu súp rau củ"] }, [["carrots", "cut"], ["potatoes", "cut"], ["onions", "cut"]], "soup", "k_stove", stoveOn);
dish({ id: "cook_chicken", obj: "stove", label: "Cook the chicken", labelVi: "Nấu thịt gà", sentence: "I'm cooking the chicken with garlic.", vi: "Tôi đang nấu thịt gà với tỏi.",
  key: ["cooking", "chicken", "garlic"], vocab: [VOC.cook, iv("chicken"), iv("garlic")], grammar: "cook → cooking. <b>with</b> = với (nguyên liệu đi kèm).",
  chunks: ["I'm cooking the chicken", "with garlic."], disc: ["chicken", "kitchen", "chick"], patterns: ["I'm cooking the <b>beef</b>.", "I'm cooking <b>rice</b>."],
  story: ["cook the chicken with garlic", "cook the chicken with fresh garlic", "nấu thịt gà với tỏi"] }, [["chicken"], ["garlic", "peeled"]], "chicken", "k_stove", W => !has(W, "peeled", "garlic") ? "Hãy bóc tỏi trước (Peel the garlic)." : stoveOn(W));
dish({ id: "cook_beef", obj: "stove", label: "Cook the beef", labelVi: "Xào thịt bò", sentence: "I'm cooking the beef with onions.", vi: "Tôi đang xào thịt bò với hành tây.",
  key: ["cooking", "beef", "onions"], vocab: [VOC.cook, iv("beef"), iv("onions")], grammar: "cook → cooking. Dùng <b>the</b> khi nói miếng thịt cụ thể đang ở trước mặt.",
  chunks: ["I'm cooking the beef", "with onions."], disc: ["beef", "beach", "bee"], patterns: ["I'm cooking the <b>chicken</b>.", "I'm cooking the <b>fish</b>."],
  story: ["cook the beef with onions", "cook the beef with sliced onions", "xào thịt bò với hành tây"] }, [["beef"], ["onions", "cut"]], "beef", "k_stove", stoveOn);
dish({ id: "fry_fish", obj: "stove", label: "Fry the fish", labelVi: "Rán cá", sentence: "I'm frying the fish in a pan.", vi: "Tôi đang rán cá trong chảo.",
  key: ["frying", "fish", "pan"], vocab: [VOC.fry, iv("fish")], grammar: "fry → frying: y giữ nguyên khi thêm -ing.",
  chunks: ["I'm frying the fish", "in a pan."], disc: ["fry", "free", "fly"], patterns: ["I'm frying <b>an egg</b>.", "I'm frying <b>potatoes</b>."],
  story: ["fry the fish", "fry the fish until it's golden", "rán cá"] }, [["fish"]], "fish", "k_stove", stoveOn);
k({
  id: "eat_the_meal", obj: "diningtable", label: "Eat the food", labelVi: "Ăn món vừa làm", sentence: "I'm eating the food I made.", vi: "Tôi đang ăn món mình vừa làm.",
  key: ["eating", "food"], vocab: [VOC.eat, V("food", "/fuːd/", "đồ ăn")], grammar: "eat → eating. <b>the food I made</b> = món tôi đã làm (mệnh đề rút gọn).",
  chunks: ["I'm eating", "the food I made."], disc: ["eat", "it", "heat"], patterns: ["I'm eating <b>the salad</b>.", "I'm eating <b>the soup</b>."],
  pre: W => !W.dish ? "Chưa có món ăn nào. Hãy nấu hoặc làm một món trước (Make a salad…)." : busy(W),
  seq: W => [["walk", "k_seat"], ["sit"], ["activity", "eating"], ["pose", "drink", 1200], ["pose", "idle", 1], ["set", "dish", null], ["set", "k_dishes", "dirty"], ["stand"]],
  story: ["eat the food I made", "happily eat the food I made", "ăn món mình vừa làm"]
});
add({
  id: "put_leftovers_in_fridge", room: "living", obj: "fridge", label: "Put the leftovers in the fridge", labelVi: "Cất đồ ăn thừa vào tủ lạnh", sentence: "I'm putting the leftovers in the fridge.", vi: "Tôi đang cất đồ ăn thừa vào tủ lạnh.",
  key: ["putting", "leftovers", "fridge"], vocab: [iv("leftovers"), VOC.fridge], grammar: "<b>leftovers</b> luôn ở số nhiều: the leftovers are…",
  chunks: ["I'm putting the leftovers", "in the fridge."], disc: ["leftovers", "lovers", "left"], patterns: ["I'm putting <b>the soup</b> in the fridge.", "I'm putting <b>the cake</b> in the fridge."],
  pre: W => !W.dish ? "Không có món ăn nào để cất. (Đồ thừa chỉ có sau khi nấu.)" : busy(W),
  seq: W => [["walk", "fridge"], ...fridgeOpen(W), ["spawn", "food_leftovers"], ["pose", "reach", 450], ["despawn"], ["set", "dish", null], ["set", "fridgeInv", plus(W, "leftovers", 1)], ...fridgeClose(W), ["pose", "idle", 1]],
  story: ["put the leftovers in the fridge", "put the leftovers in the fridge for tomorrow", "cất đồ ăn thừa vào tủ lạnh"]
});
k({
  id: "put_leftovers_in_microwave", obj: "microwave", label: "Put the leftovers in the microwave", labelVi: "Cho đồ ăn thừa vào lò vi sóng", sentence: "I'm putting the leftovers in the microwave.", vi: "Tôi đang cho đồ ăn thừa vào lò vi sóng.",
  key: ["putting", "leftovers", "microwave"], vocab: [iv("leftovers"), VOC.microwave], grammar: "<b>in</b> the microwave = ở trong lò. put A in B = cho A vào B.",
  chunks: ["I'm putting the leftovers", "in the microwave."], disc: ["microwave", "micro", "wave"], patterns: ["I'm putting <b>the soup</b> in the microwave.", "I'm putting <b>the milk</b> in the fridge."],
  pre: W => W.k_micro === "running" ? "Lò đang chạy, chờ một chút." : W.f_mwLeftovers ? "Đồ ăn thừa đã ở trong lò rồi. Hãy hâm nóng (Heat up the food)." : need(W, "leftovers") || busy(W),
  seq: W => [["walk", "k_micro"], ...(W.k_micro !== "open" ? [["pose", "reach", 400], ["set", "k_micro", "open"], ["wait", 300]] : []), ["spawn", "food_leftovers"], ["pose", "reach", 500], ["despawn"],
    ["set", "counter", counterRemove(W.counter || [], "leftovers", 1)], ["set", "k_food", "in"], ["set", "f_mwLeftovers", true], ["pose", "reach", 300], ["set", "k_micro", "closed"], ["pose", "idle", 1]],
  story: ["put the leftovers in the microwave", "put last night's leftovers in the microwave", "cho đồ ăn thừa vào lò vi sóng"]
});
const snack = (o, id, verbing, needWashed, needPeeled) => k({
  ...o, pre: W => need(W, id) || (needWashed && !has(W, "washed", id) ? "Hãy rửa trước khi ăn (Wash the vegetables)." : null) || (needPeeled && !has(W, "peeled", id) ? `Hãy bóc vỏ trước (Peel ${o.one}).` : null) || busy(W),
  seq: W => [["walk", "k_table"], ["spawn", "food_" + id], ["pose", "drink", 1200], ["despawn"], ...useSteps(W, { [id]: 1 }), ["pose", "idle", 1]]
});
snack({ id: "eat_apple", obj: "diningtable", one: "an apple", label: "Eat an apple", labelVi: "Ăn một quả táo", sentence: "I'm eating an apple.", vi: "Tôi đang ăn một quả táo.", key: ["eating", "apple"], vocab: [VOC.eat, iv("apples")],
  grammar: "<b>an</b> apple: dùng an trước nguyên âm (a, e, i, o, u).", chunks: ["I'm eating", "an apple."], disc: ["apple", "able", "april"], patterns: ["I'm eating <b>a banana</b>.", "I'm eating <b>an orange</b>."],
  story: ["eat an apple", "eat a crunchy apple", "ăn một quả táo"] }, "apples", "eating", true);
snack({ id: "eat_banana", obj: "diningtable", one: "a banana", label: "Eat a banana", labelVi: "Ăn một quả chuối", sentence: "I'm eating a banana.", vi: "Tôi đang ăn một quả chuối.", key: ["eating", "banana"], vocab: [VOC.eat, iv("bananas")],
  grammar: "<b>a</b> banana: dùng a trước phụ âm.", chunks: ["I'm eating", "a banana."], disc: ["banana", "bandana", "panama"], patterns: ["I'm eating <b>an apple</b>.", "I'm eating <b>a sandwich</b>."],
  story: ["eat a banana", "eat a sweet banana", "ăn một quả chuối"] }, "bananas", "eating", false, true);
snack({ id: "eat_yogurt", obj: "diningtable", one: "a yogurt", label: "Eat a yogurt", labelVi: "Ăn sữa chua", sentence: "I'm eating a yogurt with a spoon.", vi: "Tôi đang ăn sữa chua bằng thìa.", key: ["eating", "yogurt", "spoon"], vocab: [VOC.eat, iv("yogurt"), V("spoon", "/spuːn/", "cái thìa")],
  grammar: "Tiếng Anh nói <b>eat</b> yogurt (ăn), không phải drink. <b>with a spoon</b> = bằng thìa.", chunks: ["I'm eating a yogurt", "with a spoon."], disc: ["yogurt", "yoga", "yolk"], patterns: ["I'm eating <b>soup</b> with a spoon.", "I'm eating <b>rice</b> with chopsticks."],
  story: ["eat a yogurt", "eat a cold yogurt", "ăn sữa chua"] }, "yogurt", "eating");
k({
  id: "pour_water_glass", obj: "diningtable", label: "Pour a glass of water", labelVi: "Rót một cốc nước", sentence: "I'm pouring a glass of water.", vi: "Tôi đang rót một cốc nước.",
  key: ["pouring", "glass", "water"], vocab: [VOC.pour, VOC.glass, iv("water")], grammar: "<b>a glass of</b> water = một cốc nước (water không đếm được).",
  chunks: ["I'm pouring", "a glass of water."], disc: ["pour", "poor", "power"], patterns: ["I'm pouring <b>a glass of milk</b>.", "I'm pouring <b>a cup of tea</b>."],
  pre: W => W.glass === "full" ? "Cốc đã đầy nước rồi. Uống đi nào (Drink the water)!" : need(W, "water") || busy(W),
  seq: W => [["walk", "k_table"], ["spawn", "food_water"], ["pose", "pour", 900], ["despawn"], ...useSteps(W, { water: 1 }), ["set", "glass", "full"], ["pose", "idle", 1]],
  story: ["pour a glass of water", "pour a cool glass of water", "rót một cốc nước"]
});
k({
  id: "drink_water", obj: "diningtable", label: "Drink the water", labelVi: "Uống nước", sentence: "I'm drinking a glass of water.", vi: "Tôi đang uống một cốc nước.",
  key: ["drinking", "water"], vocab: [VOC.drink, iv("water")], grammar: "drink → drinking. a glass <b>of</b> water.",
  chunks: ["I'm drinking", "a glass of water."], disc: ["drink", "drunk", "think"], patterns: ["I'm drinking <b>milk</b>.", "I'm drinking <b>orange juice</b>."],
  pre: W => W.glass !== "full" ? "Cốc đang rỗng. Hãy rót nước trước (Pour a glass of water)." : busy(W),
  seq: W => [["walk", "k_table"], ["pose", "drink", 1200], ["set", "glass", "empty"], ["pose", "idle", 1]],
  story: ["drink a glass of water", "drink a cool glass of water", "uống một cốc nước"]
});
k({
  id: "butter_toast", obj: "diningtable", label: "Spread butter on the toast", labelVi: "Phết bơ lên bánh mì nướng", sentence: "I'm spreading butter on the toast.", vi: "Tôi đang phết bơ lên bánh mì nướng.",
  key: ["spreading", "butter", "toast"], vocab: [VOC.spread, iv("butter"), VOC.toast], grammar: "spread A <b>on</b> B = phết A lên B. butter không đếm được.",
  chunks: ["I'm spreading butter", "on the toast."], disc: ["butter", "better", "batter"], patterns: ["I'm spreading <b>jam</b> on the toast.", "I'm spreading butter on <b>the bread</b>."],
  pre: W => W.k_toast !== "table" ? "Chưa có bánh mì nướng trên bàn (Toast some bread → Take out the toast)." : W.f_buttered ? "Bánh đã phết bơ rồi." : need(W, "butter") || busy(W),
  seq: W => [["walk", "k_table"], ["spawn", "food_butter"], ["pose", "wipe", 1000], ["despawn"], ["set", "f_buttered", true], ["pose", "idle", 1]],
  story: ["spread butter on the toast", "spread a little butter on the warm toast", "phết bơ lên bánh mì nướng"]
});

/* --- restock --- */
const missing = W => ROWS.some(r => cnt(W, r[0]) < r[6]);
add({
  id: "buy_groceries", room: "living", obj: "fridge", label: "Buy groceries", labelVi: "Đi chợ", sentence: "I'm going out to buy groceries.", vi: "Tôi đang ra ngoài mua đồ ăn.",
  key: ["buy", "groceries"], vocab: [VOC.buy, VOC.groceries], grammar: "<b>go out to buy</b> = ra ngoài để mua (to + động từ chỉ mục đích).",
  chunks: ["I'm going out", "to buy groceries."], disc: ["groceries", "grocer", "glasses"], patterns: ["I'm going out to buy <b>some milk</b>.", "I'm going out to buy <b>bread</b>."],
  pre: W => W.groceries === "bags" ? "Bạn đã mua đồ rồi. Hãy cất vào tủ lạnh (Put the groceries away)." : !missing(W) ? "Tủ lạnh vẫn còn đầy đủ, chưa cần đi chợ." : busy(W),
  seq: W => [["walk", "door_living"], ["pose", "idle", 1], ["wait", 1200], ["spawn", "food_bag"], ["walk", "counter"], ["pose", "reach", 400], ["despawn"], ["set", "groceries", "bags"], ["pose", "idle", 1]],
  story: ["go out to buy groceries", "go out to the market to buy groceries", "đi chợ mua đồ ăn"]
});
add({
  id: "put_groceries_away", room: "living", obj: "fridge", label: "Put the groceries away", labelVi: "Cất đồ đi chợ vào tủ", sentence: "I'm putting the groceries away in the fridge.", vi: "Tôi đang cất đồ ăn vừa mua vào tủ lạnh.",
  key: ["putting", "groceries", "away"], vocab: [VOC.putaway, VOC.groceries, VOC.fridge], grammar: "<b>put … away</b> = cất vào đúng chỗ. put the groceries away / put them away.",
  chunks: ["I'm putting the groceries away", "in the fridge."], disc: ["away", "a way", "always"], patterns: ["I'm putting <b>the dishes</b> away.", "I'm putting <b>my clothes</b> away."],
  pre: W => W.groceries !== "bags" ? "Chưa có túi đồ nào. Hãy đi chợ trước (Buy groceries)." : busy(W),
  seq: W => { const fi = { ...inv(W) }; for (const r of ROWS) fi[r[0]] = Math.max(cnt(W, r[0]), r[6]); return [["walk", "counter"], ["spawn", "food_bag"], ["walk", "fridge"], ...fridgeOpen(W), ["pose", "reach", 600], ["despawn"], ["set", "fridgeInv", fi], ["set", "groceries", "none"], ["pose", "reach", 400], ...fridgeClose(W), ["pose", "idle", 1]]; },
  story: ["put the groceries away in the fridge", "neatly put the groceries away in the fridge", "cất đồ ăn vừa mua vào tủ lạnh"]
});

/* ---------- requirements for EXISTING app actions ---------- */
const REQUIRES = {
  fry_egg: W => need(W, "eggs", 1, true),
  toast_bread: W => need(W, "bread", 1, true),
  heat_up_food: W => W.f_mwLeftovers ? null : need(W, "leftovers", 1, true),
  pour_milk: W => W.milk === "hand" || W.milk === "table" || W.milk === "counter" || W.cupLevel > 0 || cnt(W, "milk") > 0 ? null : outOf("milk")
};
const CONSUMES = {
  fry_egg: { eggs: 1 },
  toast_bread: { bread: 1 },
  heat_up_food: W => W.f_mwLeftovers ? null : { leftovers: 1 }
};
function applyRequires(ACT) {
  for (const [id, req] of Object.entries(REQUIRES)) {
    const a = ACT[id]; if (!a || a._fdWrapped) continue;
    const orig = a.pre; a._fdWrapped = true;
    // app actions have pre() bound to W; rooms.js raw actions take pre(W)
    a.pre = function (W) { const st = W || (typeof window !== "undefined" && window.ELW && window.ELW.state && window.ELW.state()); const r = orig ? orig.call(this, st) : null; return r || (st ? req(st) : null); };
  }
  return ACT;
}
function onActionDone(actionId, W) {
  if (actionId === "heat_up_food" && W.f_mwLeftovers) { W.f_mwLeftovers = false; return W; }
  if (actionId === "clear_the_table" || actionId === "take_out_toast") W.f_buttered = false;
  let use = CONSUMES[actionId]; if (typeof use === "function") use = use(W);
  if (!use) return W;
  const r = consume(W, use); if (r) Object.assign(W, r);
  return W;
}

/* ---------- props ---------- */
const props = {};
for (const it of Object.values(ITEMS)) props["food_" + it.id] = `<g transform="translate(0,6) scale(1.1)">${it.icon}</g>`;
props.food_bag = `<path d="M-14 0 L-12 -24 L12 -24 L14 0Z" fill="#e8c99a" stroke="#a8784e" stroke-width="1.5"/><path d="M-6 -24 Q0 -32 6 -24" stroke="#a8784e" stroke-width="2" fill="none"/><circle cx="-5" cy="-26" r="4" fill="#9fd39a"/><rect x="2" y="-32" width="6" height="10" fill="#fff" stroke="#9ab8d0"/>`;

/* ---------- fridge interior rendering ---------- */
const SNS = "http://www.w3.org/2000/svg";
// shelf bottoms (y where icons stand) inside #fridgeInside (x 858..952)
const SHELF_GEO = { freezer: { y: 148, x0: 862, x1: 948 }, top: { y: 194, x0: 862, x1: 948 }, middle: { y: 264, x0: 862, x1: 948 }, bottom: { y: 326, x0: 862, x1: 948 }, drawer: { y: 350, x0: 862, x1: 948, s: .85 }, door: { x: 980, ys: [150, 205, 262, 318], s: .9 } };
const itemsOn = (W, shelf) => Object.values(ITEMS).filter(it => it.shelf === shelf && cnt(W, it.id) > 0);
function renderFridge(target, W) {
  const host = typeof target === "string" ? document.querySelector(target) : target;
  if (!host) return;
  // hide the static painted food, keep background + shelf lines
  [...host.children].forEach((c, i) => { if (!c.classList.contains("fd-layer") && i > 2) c.style.display = "none"; });
  let g = host.querySelector(".fd-layer");
  if (!g) { g = document.createElementNS(SNS, "g"); g.setAttribute("class", "fd-layer"); host.appendChild(g); }
  const out = [];
  out.push(`<rect x="858" y="118" width="94" height="32" rx="6" fill="#dcefff"/><rect x="858" y="150" width="94" height="3" fill="#bcd3e0"/><text x="948" y="127" font-size="7" text-anchor="end" fill="#6c8aa0">freezer</text>`);
  out.push(`<rect x="858" y="328" width="94" height="24" rx="4" fill="#e6f3e3" stroke="#bcd3e0"/>`);
  const label = (x, y, n) => n > 1 ? `<text class="fd-n" x="${x + 8}" y="${y - 1}" font-size="7.5" font-weight="700" fill="#2d2a26" stroke="#f2fbff" stroke-width="2" paint-order="stroke">×${n}</text>` : "";
  for (const shelf of ["freezer", "top", "middle", "bottom", "drawer"]) {
    const G = SHELF_GEO[shelf], list = itemsOn(W, shelf).slice(0, 4), step = (G.x1 - G.x0) / 4, s = G.s || 1;
    list.forEach((it, i) => { const x = G.x0 + step * (i + .5), n = cnt(W, it.id);
      out.push(`<g class="fd-it" data-item="${it.id}" transform="translate(${x},${G.y}) scale(${s})">${it.icon}</g>${label(x, G.y, n)}`); });
  }
  if (W.fridge === "open") {
    const D = SHELF_GEO.door;
    out.push(`<rect x="962" y="118" width="38" height="234" rx="6" fill="#e9f2f8" stroke="#b7c7d3" stroke-width="2"/>`);
    D.ys.forEach(y => out.push(`<rect x="964" y="${y}" width="34" height="3" fill="#bcd3e0"/>`));
    itemsOn(W, "door").slice(0, 4).forEach((it, i) => out.push(`<g class="fd-it" data-item="${it.id}" transform="translate(976,${D.ys[i]}) scale(${D.s})">${it.icon}</g>${label(976, D.ys[i], cnt(W, it.id))}`));
  }
  g.innerHTML = out.join("");
  return g;
}

/* ---------- HTML panel ---------- */
const css = `
.fd-panel{--accent:#e8743b;--line:#e3d6c3;font:14px/1.4 system-ui,sans-serif;color:#2d2a26;max-width:390px}
.fd-panel h3{margin:0 0 6px;font-size:16px}
.fd-shelf{border:1px solid var(--line);border-radius:10px;margin:6px 0;padding:4px 8px;background:#fffdf9}
.fd-shelf>b{font-size:12px;color:#8a7a66;display:block;margin:2px 0}
.fd-row{display:flex;align-items:center;gap:6px;padding:3px 0;border-top:1px dashed var(--line)}
.fd-row:first-of-type{border-top:0}
.fd-row svg{flex:none}
.fd-name{flex:1;min-width:0}.fd-name small{color:#8a7a66}
.fd-cnt{font-weight:700;min-width:26px;text-align:right}.fd-zero{opacity:.45}
.fd-btn{border:1px solid var(--line);background:#fff;border-radius:8px;padding:3px 7px;font-size:12px;cursor:pointer}
.fd-btn.fd-go{background:var(--accent);color:#fff;border-color:var(--accent)}
.fd-btn:disabled{opacity:.4;cursor:default}
.fd-counter{margin-top:8px}.fd-empty{color:#8a7a66;font-size:13px}
.fd-restock{margin-top:8px;width:100%}`;
function iconSvg(id, size = 26) { return `<svg width="${size}" height="${size}" viewBox="-13 -24 26 26" aria-hidden="true">${ITEMS[id].icon}</svg>`; }
function renderPanel(container, W, opts = {}) {
  const enqueue = opts.enqueue || (() => {}), speak = opts.speak || (() => {});
  if (typeof document !== "undefined" && !document.getElementById("fd-css")) { const st = document.createElement("style"); st.id = "fd-css"; st.textContent = css; document.head.appendChild(st); }
  const h = [`<div class="fd-panel"><h3>🧊 Trong tủ lạnh <small style="font-weight:400;color:#8a7a66">In the fridge</small></h3>`];
  for (const [sh, en, vi] of SHELVES) {
    const list = Object.values(ITEMS).filter(it => it.shelf === sh);
    h.push(`<div class="fd-shelf"><b>${vi} · ${en}</b>`);
    for (const it of list) {
      const n = cnt(W, it.id), c = onCounter(W, it.id), canTake = it.id !== "milk";
      h.push(`<div class="fd-row${n ? "" : " fd-zero"}">${iconSvg(it.id)}<span class="fd-name">${it.en} <small>${it.ipa} · ${it.vi}</small></span><span class="fd-cnt">×${n}</span>
<button class="fd-btn" data-say="${it.en}" aria-label="nghe ${it.en}">🔊</button>${canTake ? `<button class="fd-btn fd-go" data-act="take_out_${it.id}" ${n ? "" : "disabled"}>Lấy ra</button><button class="fd-btn" data-act="put_back_${it.id}" ${c ? "" : "disabled"}>Cất lại</button>` : `<button class="fd-btn fd-go" data-act="take_milk">Lấy ra</button>`}</div>`);
    }
    h.push(`</div>`);
  }
  const ctr = counterIds(W);
  h.push(`<div class="fd-shelf fd-counter"><b>Trên bàn bếp · On the counter</b>${ctr.length ? ctr.map(id => { const p = prepOf(W), tags = ["washed", "peeled", "cut"].filter(k => p[k].includes(id)); return `<div class="fd-row">${iconSvg(id)}<span class="fd-name">${ITEMS[id].en} <small>${ITEMS[id].vi}${tags.length ? " · " + tags.join(", ") : ""}</small></span><span class="fd-cnt">×${onCounter(W, id)}</span><button class="fd-btn" data-say="${ITEMS[id].en}">🔊</button><button class="fd-btn" data-act="put_back_${id}">Cất lại</button></div>`; }).join("") : `<div class="fd-empty">Chưa có gì. Nhấn “Lấy ra” để lấy đồ khỏi tủ lạnh.</div>`}</div>`);
  if (W.dish) h.push(`<div class="fd-empty">🍽️ Món đã làm: <b>${W.dish}</b></div>`);
  h.push(W.groceries === "bags" ? `<button class="fd-btn fd-go fd-restock" data-act="put_groceries_away">🛍️ Put the groceries away · Cất đồ vào tủ</button>` : `<button class="fd-btn fd-restock" data-act="buy_groceries" ${missing(W) ? "" : "disabled"}>🛒 Buy groceries · Đi chợ</button>`);
  h.push(`</div>`);
  container.innerHTML = h.join("");
  container.querySelectorAll("[data-act]").forEach(b => b.onclick = () => enqueue(b.dataset.act));
  container.querySelectorAll("[data-say]").forEach(b => b.onclick = () => speak(b.dataset.say));
  return container;
}

const API = { ITEMS, SHELVES, W0, DEFAULT_INV, ACTIONS, OBJ_ACTS, REQUIRES, CONSUMES, applyRequires, onActionDone, need, consume, renderFridge, renderPanel, css, props };
if (typeof window !== "undefined") window.ELW_FOOD = API;
if (typeof module !== "undefined" && module.exports) module.exports = API;
})();
