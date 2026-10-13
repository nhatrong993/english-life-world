const assert = require("assert"), path = require("path");
const data = require(path.join(__dirname, "actions-list.json"));
const I = require(path.join(__dirname, "i18n-a.js"));
const L = ["zh", "ko", "ja", "th", "id"], nonAscii = /[^\x00-\x7f]/;
let n = 0;
for (const a of data.actions) for (const l of L) {
  const t = (I.actions[a.id] || {})[l]; assert(t && t.label && t.sentence, `missing ${a.id}.${l}`);
  assert(t.sentence !== a.sentence && t.label !== a.label, `untranslated ${a.id}.${l}`);
  if (l !== "id") assert(nonAscii.test(t.sentence) && nonAscii.test(t.label), `ascii ${a.id}.${l}`);
  else assert(/\bSaya\b/.test(t.sentence), `id sentence ${a.id}`);
  n++;
}
const objs = [...Object.keys(data.objects), "sofa","cat","floorlamp","livcurtains","fan","remote","speaker","room_living","room_kitchen","room_bedroom"];
for (const k of objs) for (const l of L) assert(I.objects[k] && I.objects[k][l], `obj ${k}.${l}`);
for (const l of L) { assert(I.langs[l].tts); assert(Object.keys(I.ui[l]).length === 12, `ui ${l}`); }
const extra = Object.keys(I.actions).filter(k => !data.actions.some(a => a.id === k));
assert(!extra.length, "unknown ids " + extra);
console.log(`OK: ${data.actions.length} actions x 5 langs (${n}), ${objs.length} objects`);
