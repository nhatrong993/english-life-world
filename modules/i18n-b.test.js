// node modules/i18n-b.test.js
const assert = require("assert"), path = require("path");
const acts = require(path.join(__dirname, "actions-list.json")).actions;
global.window = global;
const I = require(path.join(__dirname, "i18n-b.js"));
require(path.join(__dirname, "rooms.js"));
const L = ["es", "fr", "de", "ru", "pt"];
for (const l of L) assert(I.langs[l] && I.langs[l].tts, "lang " + l);
for (const a of acts) for (const l of L) {
  const t = (I.actions[a.id] || {})[l];
  assert(t && t.label && t.sentence, a.id + " " + l);
  assert.notStrictEqual(t.sentence, a.sentence, a.id + " " + l + " same as English");
}
const objs = ["fridge","cup","table","chair","broom","window","plant","book","tv","door","sofa","cat","floorlamp","livcurtains","fan","remote","speaker","room_living","room_kitchen","room_bedroom"];
for (const r of Object.values(global.ELW_ROOMS || {})) objs.push(...Object.keys(r.objects || {}));
assert(objs.length > 30, "rooms.js objects loaded");
for (const o of objs) for (const l of L) assert((I.objects[o] || {})[l], "object " + o + " " + l);
const keys = ["translation","meaning","story","actions","chooseAction","sequence","listen","speak","review","notebook","rooms","settings"];
for (const l of L) { assert.deepStrictEqual(Object.keys(I.ui[l]).sort(), keys.slice().sort(), "ui " + l); for (const k of keys) assert(I.ui[l][k]); }
console.log("OK", acts.length, "actions,", objs.length, "objects,", L.length, "langs");
