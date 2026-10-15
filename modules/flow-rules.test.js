/* Unit Test for modules/flow.js — guideByRules(ctx) across 16 rule-engine scenarios */
"use strict";

const assert = require("assert");
const F = require("./flow.js");

const SCENARIOS = [
  {
    id: 1,
    name: "Safety overrides everything (stove on while hungry & hot)",
    ctx: { room: "kitchen", stoveOn: true, hungry: true, weather: "hot", missionNext: ["eat_at_counter"] },
    check: res => {
      assert.strictEqual(res[0].id, "turn_off_stove");
      assert.strictEqual(res[0].category, "safety");
      assert(/^Vì\s/.test(res[0].why_vi));
    }
  },
  {
    id: 2,
    name: "Safety: water running in bathroom",
    ctx: { room: "bathroom", waterRunning: true, weather: "sunny" },
    check: res => {
      assert.strictEqual(res[0].id, "turn_off_faucet");
      assert.strictEqual(res[0].category, "safety");
    }
  },
  {
    id: 3,
    name: "Mission overrides needs, weather, and situation",
    ctx: { room: "market_produce", missionNext: ["weigh_the_fruit"], hungry: true, weather: "hot", situation: "rush" },
    check: res => {
      assert.strictEqual(res[0].id, "weigh_the_fruit");
      assert.strictEqual(res[0].category, "mission");
      assert(/^Vì\s/.test(res[0].why_vi));
    }
  },
  {
    id: 4,
    name: "Needs (hungry at home) overrides weather & morning situation",
    ctx: { room: "kitchen", needs: { hunger: 25, thirst: 80, energy: 80 }, weather: "cold", hour: 8 },
    check: res => {
      assert.strictEqual(res[0].id, "cook_eggs");
      assert.strictEqual(res[0].category, "needs");
      assert(/đói/.test(res[0].why_vi));
    }
  },
  {
    id: 5,
    name: "Needs (thirsty at market) suggests cold drinks first",
    ctx: { room: "market_dairy", thirsty: true, weather: "sunny", situation: "normal" },
    check: res => {
      assert.strictEqual(res[0].id, "grab_orange_juice");
      assert.strictEqual(res[0].category, "needs");
      assert(/khát/.test(res[0].why_vi));
    }
  },
  {
    id: 6,
    name: "Needs (tired at home) suggests resting on sofa/bed",
    ctx: { room: "living", needs: { hunger: 80, thirst: 80, energy: 20 }, weather: "sunny" },
    check: res => {
      assert.strictEqual(res[0].id, "sit_on_sofa");
      assert.strictEqual(res[0].category, "needs");
    }
  },
  {
    id: 7,
    name: "Weather: Park + Hot → buy ice cream / drink water / sit in shade",
    ctx: { room: "park", weather: "hot", situation: "normal" },
    check: res => {
      const ids = res.map(x => x.id);
      assert.deepStrictEqual(ids, ["buy_an_ice_cream_cone", "drink_from_the_fountain", "sit_on_the_bench"]);
      assert(res.every(x => x.category === "weather" && /^Vì trời đang/.test(x.why_vi)));
    }
  },
  {
    id: 8,
    name: "Weather: Cafe + Cold → order hot coffee & sip warm drink",
    ctx: { room: "cafe", weather: "cold", situation: "normal" },
    check: res => {
      assert.strictEqual(res[0].id, "order_a_coffee");
      assert.strictEqual(res[0].category, "weather");
      assert(/Vì trời đang lạnh/.test(res[0].why_vi));
    }
  },
  {
    id: 9,
    name: "Situation: Market + In a hurry (rush) → self-checkout & tap card",
    ctx: { room: "market_checkout", weather: "sunny", situation: "rush" },
    check: res => {
      assert.strictEqual(res[0].id, "use_the_self_checkout");
      assert.strictEqual(res[1].id, "tap_my_card");
      assert.strictEqual(res[0].category, "situation");
      assert(/Vì đang vội/.test(res[0].why_vi));
    }
  },
  {
    id: 10,
    name: "Situation: Market + Bargain hunting → read sale flyer & check price tag",
    ctx: { room: "market", weather: "sunny", situation: "bargain" },
    check: res => {
      assert.strictEqual(res[0].id, "read_the_sale_flyer");
      assert.strictEqual(res[1].id, "check_the_price_tag");
      assert.strictEqual(res[0].category, "situation");
    }
  },
  {
    id: 11,
    name: "Situation: Home + Morning → wake up, get out of bed, make bed",
    ctx: { room: "bedroom", weather: "sunny", situation: "normal", hour: 7 },
    check: res => {
      assert.deepStrictEqual(res.map(x => x.id), ["wake_up", "get_out_of_bed", "make_bed"]);
      assert(res.every(x => x.category === "situation" && /^Vì\s/.test(x.why_vi)));
    }
  },
  {
    id: 12,
    name: "Situation: Home + Night → turn off TV, brush teeth, get under covers",
    ctx: { room: "living", weather: "sunny", situation: "normal", hour: 22 },
    check: res => {
      assert.deepStrictEqual(res.map(x => x.id), ["turn_off_tv", "brush_teeth", "get_under_covers"]);
      assert(res.every(x => x.category === "situation"));
    }
  },
  {
    id: 13,
    name: "Explore: Market Produce zone default suggestions",
    ctx: { room: "market_produce", weather: "sunny", situation: "normal" },
    check: res => {
      assert.deepStrictEqual(res.map(x => x.id), ["pick_some_apples", "pick_some_bananas", "weigh_the_fruit"]);
      assert(res.every(x => x.category === "explore" && /^Vì\s/.test(x.why_vi)));
    }
  },
  {
    id: 14,
    name: "Explore: Market Meat & Household zone default suggestions",
    ctx: { room: "market_meat", weather: "sunny", situation: "normal" },
    check: res => {
      assert.deepStrictEqual(res.map(x => x.id), ["order_fresh_salmon", "pick_a_pack_of_beef", "grab_a_box_of_cereal"]);
      assert(res.every(x => x.category === "explore"));
    }
  },
  {
    id: 15,
    name: "Constraint: Never suggest action that cannot be done right now (isPossible filter)",
    ctx: {
      room: "market_dairy",
      weather: "sunny",
      situation: "normal",
      isPossible: id => id !== "open_the_fridge_door"
    },
    check: res => {
      assert(res.every(x => x.id !== "open_the_fridge_door"), "Filtered out impossible action");
      assert.strictEqual(res[0].id, "take_a_carton_of_milk");
    }
  },
  {
    id: 16,
    name: "Constraint: Never repeat lastActionId or recentActs",
    ctx: {
      room: "park",
      weather: "hot",
      lastActionId: "buy_an_ice_cream_cone",
      recentActs: ["drink_from_the_fountain"]
    },
    check: res => {
      assert(res.every(x => x.id !== "buy_an_ice_cream_cone" && x.id !== "drink_from_the_fountain"), "Did not repeat recent actions");
      assert.strictEqual(res[0].id, "sit_on_the_bench");
    }
  }
];

let passed = 0;
for (const sc of SCENARIOS) {
  const res = F.guideByRules(sc.ctx);
  assert(Array.isArray(res) && res.length > 0, `Scenario ${sc.id} returned non-empty list`);
  assert(res.every(x => /^Vì\s/.test(x.why_vi)), `Scenario ${sc.id} every item has Vietnamese 'Vì ...' reason`);
  sc.check(res);
  passed++;
  console.log(`PASS [Rule ${String(sc.id).padStart(2, "0")}]: ${sc.name} → [${res.map(x => `${x.id} (${x.category})`).join(", ")}]`);
}

// Verify NEXT and suggest() also always start with "Vì ..."
for (const [k, list] of Object.entries(F.NEXT)) {
  for (const item of list) {
    assert(/^Vì\s/.test(item.why_vi), `NEXT[${k}] -> ${item.id} has Vietnamese 'Vì ...' reason: ${item.why_vi}`);
  }
  for (const hour of [7, 13, 19, 23]) {
    const sugs = F.suggest(k, {}, { hour });
    assert(sugs.every(s => /^Vì\s/.test(s.why_vi)), `suggest(${k}, h=${hour}) has Vietnamese 'Vì ...' reason`);
  }
}

console.log(`\nALL ${passed}/${SCENARIOS.length} CÔ MAI RULE ENGINE SCENARIOS PASSED`);
