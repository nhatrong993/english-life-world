/* Unit Test for modules/context-engine.js — pickPhrases(ctx) across 12 5-factor combinations */
"use strict";

const assert = require("assert");
const { pickPhrases } = require("./context-engine.js");

const SCENARIOS = [
  {
    id: 1,
    label: "Market Entrance + Sunny + Normal + Alone + Staff",
    ctx: { place: "market", zone: "market", weather: "sunny", situation: "normal", companion: "alone", listener: "staff" },
    check: list => {
      assert(list.length >= 3, "At least 3 phrases");
      assert(list.every(p => !/Mom/i.test(p.who) && !/Linh/i.test(p.who) && !/Milo/i.test(p.who)), "No Mom, Linh, or Milo when alone at Market Entrance");
      assert(list.some(p => /Store Greeter/i.test(p.who)), "Store Greeter responds");
    }
  },
  {
    id: 2,
    label: "Market Produce + Hot + Bargain + With Linh + Auto",
    ctx: { place: "market", zone: "market_produce", weather: "hot", situation: "bargain", companion: "linh", listener: "auto" },
    check: list => {
      assert(list.length >= 4, "At least 4 phrases");
      assert(list.every(p => !/Mom/i.test(p.who)), "Never Mom outside home");
      assert(list.some(p => /Linh/i.test(p.who)), "Includes Linh phrases when withLinh");
      assert(list.some(p => /Produce & Bakery Clerk/i.test(p.who)), "Includes Produce & Bakery Clerk phrases");
    }
  },
  {
    id: 3,
    label: "Market Dairy + Cold + Normal + With Pet + Auto",
    ctx: { place: "market", zone: "market_dairy", weather: "cold", situation: "normal", companion: "pet", listener: "auto" },
    check: list => {
      assert(list.every(p => !/Mom/i.test(p.who) && !/Linh/i.test(p.who)), "No Mom or Linh when only with pet at Market Dairy");
      assert(list.some(p => p.en === "Good boy, Milo! Stay close." && /Milo/i.test(p.who)), "Includes 'Good boy, Milo! Stay close.' with Milo responder");
      assert(list.some(p => /Dairy & Drinks Clerk/i.test(p.who)), "Includes Dairy Clerk responder");
    }
  },
  {
    id: 4,
    label: "Market Meat + Rainy + Weekend + Linh & Pet + Auto",
    ctx: { place: "market", zone: "market_meat", weather: "rainy", situation: "weekend", companion: ["linh", "pet"], listener: "auto" },
    check: list => {
      assert(list.every(p => !/Mom/i.test(p.who)), "Never Mom outside home");
      assert(list.some(p => /Milo/i.test(p.who)), "Includes Milo phrase");
      assert(list.some(p => /Linh/i.test(p.who)), "Includes Linh phrase");
      assert(list.some(p => /Butcher/i.test(p.who)), "Includes Butcher phrase");
    }
  },
  {
    id: 5,
    label: "Market Checkout + Sunny + Rush + Alone + Staff",
    ctx: { place: "market", zone: "market_checkout", weather: "sunny", situation: "rush", companion: "alone", listener: "staff" },
    check: list => {
      assert(list.every(p => !/Mom/i.test(p.who) && !/Linh/i.test(p.who)), "No Mom or Linh when alone at Checkout");
      assert(list.every(p => /Cashier/i.test(p.who)), "All staff phrases at checkout are answered by Cashier");
      assert(list.some(p => /self-checkout|contactless|coupon/i.test(p.en)), "Includes checkout/rush specific phrase");
    }
  },
  {
    id: 6,
    label: "Cafe + Cold + Sick + Alone + Staff",
    ctx: { place: "cafe", zone: "cafe", weather: "cold", situation: "sick", companion: "alone", listener: "staff" },
    check: list => {
      assert(list.every(p => !/Mom/i.test(p.who) && !/Linh/i.test(p.who)), "No Mom or Linh when alone at Cafe");
      assert(list.every(p => /Barista/i.test(p.who)), "All staff phrases at Cafe are answered by Barista");
      // Must prioritize hot/warm soothing drinks and NEVER suggest iced/cold drinks when cold & sick
      assert(/hot tea with honey|warm latte|warm oat latte|hot ginger/i.test(list[0].en), "Row 6 Top Sample prioritizes hot/warm soothing drink");
      assert(list.every(p => !/\b(iced|less ice|cold drink|ice cream|chilled|frozen|smoothie)\b/i.test(p.en)), "Row 6 never suggests iced or cold drinks when cold & sick");
    }
  },
  {
    id: 7,
    label: "Park + Hot + Weekend + With Pet + Pet Listener",
    ctx: { place: "park", zone: "park", weather: "hot", situation: "weekend", companion: "pet", listener: "pet" },
    check: list => {
      assert(list.length >= 3, "At least 3 pet phrases");
      assert(list.every(p => /Milo/i.test(p.who) && p.listener === "pet"), "All phrases addressed to Milo");
      assert(list.some(p => p.en === "Good boy, Milo! Stay close."), "Contains signature Milo phrase");
    }
  },
  {
    id: 8,
    label: "Home Living + Sunny + Normal + Family + Mom Listener",
    ctx: { place: "home", zone: "living", weather: "sunny", situation: "normal", companion: "family", listener: "Mom" },
    check: list => {
      assert(list.length >= 3, "At least 3 Mom phrases at home");
      assert(list.every(p => /Mom/i.test(p.who)), "Mom responds at home");
      assert(list.every(p => !/Linh/i.test(p.who)), "No Linh when not withLinh");
    }
  },
  {
    id: 9,
    label: "Home Kitchen + Rainy + Rush + Family & Pet + Auto",
    ctx: { place: "home", zone: "kitchen", weather: "rainy", situation: "rush", companion: ["family", "pet"], listener: "auto" },
    check: list => {
      assert(list.some(p => /Milo/i.test(p.who)), "Includes Milo at home when withPet");
      assert(list.some(p => /Mom/i.test(p.who)), "Includes Mom at home");
      assert(list.every(p => !/Linh/i.test(p.who)), "No Linh when alone/family without Linh");
    }
  },
  {
    id: 10,
    label: "Restaurant + Windy + Weekend + With Linh + Linh Listener",
    ctx: { place: "restaurant", zone: "restaurant", weather: "windy", situation: "weekend", companion: "linh", listener: "Linh" },
    check: list => {
      assert(list.length >= 2, "At least 2 Linh phrases");
      assert(list.every(p => /Linh/i.test(p.who)), "All phrases answered by Linh when listener=Linh");
      assert(list.every(p => !/Mom/i.test(p.who)), "Never Mom at restaurant");
    }
  },
  {
    id: 11,
    label: "School + Sunny + Lost + Alone + Staff",
    ctx: { place: "school", zone: "school", weather: "sunny", situation: "lost", companion: "alone", listener: "staff" },
    check: list => {
      assert(list.every(p => /Teacher/i.test(p.who)), "Teacher responds at school");
      assert(list.every(p => !/Mom/i.test(p.who) && !/Linh/i.test(p.who)), "No Mom or Linh");
      // Must ask for Room 203 / directions when lost, NEVER ask about grammar rules
      assert(/Excuse me, where's Room 203\?/i.test(list[0].en), "Row 11 Top Sample asks 'Excuse me, where's Room 203?'");
      assert(list.every(p => !/grammar rule/i.test(p.en)), "Row 11 never asks about grammar rules when lost");
    }
  },
  {
    id: 12,
    label: "Camping + Windy + Traveler + Alone + Park Ranger",
    ctx: { place: "camping", zone: "camping", weather: "windy", situation: "traveler", companion: "alone", listener: "staff" },
    check: list => {
      assert(list.length >= 2, "At least 2 camping traveler phrases");
      assert(list.every(p => /Park Ranger/i.test(p.who)), "Park Ranger responds at camping");
      assert(list.every(p => !/Mom/i.test(p.who) && !/Linh/i.test(p.who)), "No Mom or Linh");
      // Must ask Ranger about trail or campsite, NEVER ask about nearest bus stop
      assert(/\b(trail|campsite|campground)\b/i.test(list[0].en) && /Ranger/i.test(list[0].en), "Row 12 Top Sample asks Ranger about trail or campsite");
      assert(list.every(p => !/bus stop/i.test(p.en)), "Row 12 never asks about nearest bus stop at camping");
    }
  }
];

/* Verify that the Top Sample (res[0]) of every scenario matches weather, situation, and place/zone simultaneously */
const TOP_SAMPLE_MATCHERS = {
  1:  { wx: /\bsunny\b/i,               sit: /\b(grab|cart|morning)\b/i,                  pz: /\b(cart|entrance|market)\b/i },
  2:  { wx: /\b(hot|scorching)\b/i,     sit: /\b(sale|30% off|bargain)\b/i,               pz: /\b(produce|watermelon|apples)\b/i },
  3:  { wx: /\b(chilly|cold|warm)\b/i,  sit: /\b(milk|freshest|carton)\b/i,               pz: /\b(dairy|cooler|milk)\b/i },
  4:  { wx: /\brainy\b/i,               sit: /\bweekend\b/i,                              pz: /\b(beef|butcher|meat)\b/i },
  5:  { wx: /\bsunny\b/i,               sit: /\b(rush|express)\b/i,                       pz: /\b(self-checkout|checkout|card)\b/i },
  6:  { wx: /\b(cold|hot tea|warm)\b/i, sit: /\b(under the weather|honey|warm)\b/i,       pz: /\b(café|latte|tea)\b/i },
  7:  { wx: /\b(hot|cool|shade)\b/i,    sit: /\bweekend\b/i,                              pz: /\b(park|fountain)\b/i },
  8:  { wx: /\bsunny\b/i,               sit: /\b(open|tidy)\b/i,                          pz: /\b(living room|curtains|sofa)\b/i },
  9:  { wx: /\braining\b/i,             sit: /\brush\b/i,                                 pz: /\b(kitchen|toast)\b/i },
  10: { wx: /\bwindy\b/i,               sit: /\bweekend\b/i,                              pz: /\b(restaurant|table)\b/i },
  11: { wx: /\bsunny\b/i,               sit: /\b(lost|where's Room 203)\b/i,              pz: /\b(Room 203|school|hallway)\b/i },
  12: { wx: /\bwindy\b/i,               sit: /\b(visiting|first time|which trail)\b/i,    pz: /\b(campground|trail|campsite|Ranger)\b/i }
};

let passed = 0;
const rows = [];

for (const sc of SCENARIOS) {
  const res = pickPhrases(sc.ctx);
  assert(Array.isArray(res) && res.length > 0, `Scenario ${sc.id} returned non-empty list`);
  sc.check(res);

  const m = TOP_SAMPLE_MATCHERS[sc.id];
  const top = res[0];
  assert(m.wx.test(top.en), `Row ${sc.id} Top Sample must match weather (${sc.ctx.weather}): ${top.en}`);
  assert(m.sit.test(top.en), `Row ${sc.id} Top Sample must match situation (${sc.ctx.situation}): ${top.en}`);
  assert(m.pz.test(top.en), `Row ${sc.id} Top Sample must match place/zone (${sc.ctx.place}/${sc.ctx.zone}): ${top.en}`);

  passed++;
  const responders = [...new Set(res.map(x => x.who))].join(", ");
  const sample = res[0] ? `${res[0].en} → [${res[0].who}] ${res[0].replyEn}` : "(none)";
  rows.push({
    id: sc.id,
    placeZone: `${sc.ctx.place}/${sc.ctx.zone}`,
    weather: sc.ctx.weather,
    situation: sc.ctx.situation,
    companion: Array.isArray(sc.ctx.companion) ? sc.ctx.companion.join("+") : sc.ctx.companion,
    listener: sc.ctx.listener,
    count: res.length,
    responders,
    sample
  });
}

/* Explicit contradiction filter tests: hot weather vs hot soup/cocoa; cold weather vs iced drinks */
{
  const hotRes = pickPhrases({ place: "cafe", zone: "cafe", weather: "hot", situation: "normal", companion: "alone" });
  assert(hotRes.every(p => !/\b(hot soup|hot cocoa|hot chocolate|hot tea|warm milk|chilly|freezing)\b/i.test(p.en)), "Hot weather excludes hot soup/cocoa/tea and chilly phrases");
  const coldRes = pickPhrases({ place: "market", zone: "market_dairy", weather: "cold", situation: "normal", companion: "alone" });
  assert(coldRes.every(p => !/\b(iced|ice cream|chilled|cold drink|less ice|smoothie)\b/i.test(p.en)), "Cold weather excludes iced/cold drinks and ice cream");
}

console.log("=== CONTEXT ENGINE: 12 COMBINATIONS TABLE ===");
console.log("| # | Place/Zone | Weather | Situation | Companion | Listener | Count | Responders | Top Sample (Player → Responder) |");
console.log("|---|------------|---------|-----------|-----------|----------|-------|------------|---------------------------------|");
for (const r of rows) {
  console.log(`| ${r.id} | ${r.placeZone} | ${r.weather} | ${r.situation} | ${r.companion} | ${r.listener} | ${r.count} | ${r.responders} | ${r.sample} |`);
}
console.log(`\nALL ${passed}/${SCENARIOS.length} CONTEXT COMBINATIONS PASSED`);
