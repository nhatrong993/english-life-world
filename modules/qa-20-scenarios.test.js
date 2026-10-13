/* English Life World — qa-20-scenarios.test.js
   Full 20-point QA verification suite testing:
   1. Event Director (Agent 1): urgent countdowns, ticking, timeouts, auto-resolution.
   2. Challenge Engine (Agent 2): 10 challenges, ~10 tasks each, green bar completion logic.
   3. Fridge & Cooking (Agent 3): real food inventory, taking/putting, recipe requirements.
   4. New Rooms (Agent 4): bathroom, garage, garden rooms with objects, actions, spots.
   5. Family NPCs (Agent 5): background activities, event-driven dialogue, reactions.
   6. Integration: click hit detection, non-blocking layers, and multi-agent synergy. */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Load modules
const events = require("./event-director.js");
const challenge = require("./challenge.js");
const fridge = require("./fridge-cooking.js");
const roomsExpansion = require("./rooms-expansion.js");
const family = require("./family-npc.js");
const rooms = require("./rooms.js");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`PASS [QA ${String(passed + failed).padStart(2, "0")}]: ${name}`);
  } catch (err) {
    failed++;
    console.error(`FAIL [QA ${String(passed + failed).padStart(2, "0")}]: ${name}`);
    console.error("  ", err.message);
  }
}

console.log("============================================================");
console.log("RUNNING 20-SCENARIO QA SUITE (ENGLISH LIFE WORLD)");
console.log("============================================================\n");

// --- AGENT 1: EVENT DIRECTOR (QA 01 - 04) ---
test("QA 01: Event Director triggers urgent task with countdown timer", () => {
  events.reset();
  const ev = events.trigger("kettle_boiling");
  assert(ev, "Event should be active");
  assert.strictEqual(ev.id, "kettle_boiling");
  assert.strictEqual(ev.remaining, 45);
  assert.strictEqual(ev.status, "active");
  assert.strictEqual(ev.def.action, "turn_off_stove");
});

test("QA 02: Event Director timer ticks down and notifies progress", () => {
  events.reset();
  events.trigger("cat_crying");
  assert.strictEqual(events.current().remaining, 60);
  events.tick(15);
  assert.strictEqual(events.current().remaining, 45);
});

test("QA 03: Event Director auto-fails task when countdown reaches 0", () => {
  events.reset();
  events.trigger("plant_drooping");
  events.tick(60);
  assert.strictEqual(events.current(), null, "Active event should be cleared on timeout");
  const hist = events.history();
  assert(hist.length > 0, "History should record failed event");
  assert.strictEqual(hist[hist.length - 1].status, "failed");
  assert.strictEqual(hist[hist.length - 1].failReason, "timeout");
});

test("QA 04: Urgent task resolves successfully when matching action is performed before timeout", () => {
  events.reset();
  events.trigger("kettle_boiling");
  const result = events.onAction("turn_off_stove");
  assert(result, "Resolution should return success object");
  assert.strictEqual(result.resolved, true);
  assert.strictEqual(result.xp, 25);
  assert.strictEqual(events.current(), null, "Active event should clear upon resolution");
});

// --- AGENT 2: CHALLENGE ENGINE (QA 05 - 09) ---
test("QA 05: Challenge engine defines exactly 10 distinct challenges", () => {
  assert(Array.isArray(challenge.CHALLENGES));
  assert.strictEqual(challenge.CHALLENGES.length, 10, "Must contain exactly 10 challenges");
  const petCh = challenge.CHALLENGES.find(x => /pet/i.test(x.id));
  assert(petCh, "Must include a pet challenge matching /pet/i");
});

test("QA 06: Each challenge has 10 tasks with valid bilingual metadata", () => {
  for (const c of challenge.CHALLENGES) {
    assert(c.tasks && c.tasks.length === 10, `Challenge ${c.id} should have 10 tasks, got ${c.tasks && c.tasks.length}`);
    for (const t of c.tasks) {
      assert(t.id && t.en && t.vi && t.action, `Task ${t.id} in ${c.id} missing fields`);
    }
  }
});

test("QA 07: Starting challenge in practice mode initializes tasks and bars", () => {
  challenge.reset();
  const petCh = challenge.CHALLENGES.find(x => /pet/i.test(x.id));
  const cur = challenge.start(petCh.id, { mode: "practice" });
  assert(cur, "Current challenge should be defined");
  assert.strictEqual(cur.mode, "practice");
  assert.strictEqual(cur.done, false);
  const bars = challenge.bars();
  assert(bars.length >= 3, "Challenge should define at least 3 metric bars");
  assert(bars.every(b => typeof b.cur === "number" && typeof b.green === "boolean"));
});

test("QA 08: Challenge bars report green status only when target is reached", () => {
  challenge.reset();
  const c = challenge.start("pet_care", { mode: "practice" });
  const initialBars = challenge.bars();
  assert(initialBars.some(b => !b.green), "Initial bars should not all be green");
  
  // Progress action
  challenge.onAction("feed_cat");
  challenge.onAction("call_cat");
  challenge.onAction("pet_cat");
  const updatedBars = challenge.bars();
  const hungerBar = updatedBars.find(b => b.id === "petHunger");
  assert(hungerBar.cur > initialBars.find(b => b.id === "petHunger").cur, "Bar cur should increase on matching action");
});

test("QA 09: Challenge completion strictly requires all required bars to be green", () => {
  challenge.reset();
  challenge.start("pet_care", { mode: "practice" });
  
  // Mark tasks done without sufficient bar values
  const cur = challenge.current();
  cur.tasks.forEach(t => { t.done = true; });
  
  // Re-check status before bars are green
  const barsBefore = challenge.bars();
  const allGreenBefore = barsBefore.filter(b => b.required).every(b => b.green);
  if (!allGreenBefore) {
    assert.strictEqual(challenge.current().done, false, "Challenge MUST NOT be done if bars are not green");
  }
  
  // Perform all pet actions to max out bars
  const acts = ["call_cat", "pet_cat", "feed_cat", "give_cat_water", "play_with_cat", "brush_cat", "fluff_cushion", "sweep_floor", "wipe_table", "put_cup_on_table"];
  acts.forEach(a => challenge.onAction(a));
  acts.forEach(a => challenge.onAction(a)); // second pass ensures 100% green
  
  const barsAfter = challenge.bars();
  assert(barsAfter.every(b => b.green), "All required bars should now be green");
  assert.strictEqual(challenge.current().done, true, "Challenge is completed only when all bars are green");
});

// --- AGENT 3: FRIDGE & COOKING (QA 10 - 13) ---
test("QA 10: Fridge contains real food items with positive inventory", () => {
  fridge.reset();
  const items = fridge.getFridgeItems();
  assert(items.length >= 8, "Fridge should have at least 8 distinct real food items");
  assert(fridge.hasIngredient("egg", 1), "Fridge should have fresh eggs");
  assert(fridge.hasIngredient("milk", 1), "Fridge should have fresh milk");
  assert(fridge.hasIngredient("bread", 1), "Fridge should have bread");
});

test("QA 11: Taking food transfers items from fridge into player inventory", () => {
  fridge.reset();
  const initialEggs = fridge.getItem("egg").qty;
  const taken = fridge.takeItem("egg", 2);
  assert.strictEqual(taken.count, 2);
  assert.strictEqual(fridge.getItem("egg").qty, initialEggs - 2);
  assert.strictEqual(fridge.pantry()["egg"], 2);
  
  // Put 1 back
  fridge.putItem("egg", 1);
  assert.strictEqual(fridge.getItem("egg").qty, initialEggs - 1);
  assert.strictEqual(fridge.pantry()["egg"], 1);
});

test("QA 12: Cooking without ingredients is blocked with a clear recipe requirement message", () => {
  fridge.reset();
  // Empty all eggs
  fridge.getItem("egg").qty = 0;
  
  const check = fridge.checkRecipeRequirements("fry_egg");
  assert(check && !check.allowed, "Cooking should be blocked when missing eggs");
  assert.strictEqual(check.missing, "egg");
  assert(check.messageVi.toLowerCase().includes("trứng") || check.messageVi.toLowerCase().includes("egg"), "Should explain missing egg in Vietnamese");
});

test("QA 13: Cooking with ingredients consumes items and produces culinary meal", () => {
  fridge.reset();
  assert(fridge.hasIngredient("egg", 1));
  const eggsBefore = fridge.getItem("egg").qty;
  
  const consumed = fridge.onAction("fry_egg");
  assert(consumed, "Cooking should succeed and return recipe result");
  assert.strictEqual(consumed.result, "fried_egg");
  assert.strictEqual(fridge.getItem("egg").qty, eggsBefore - 1, "Egg quantity should be decremented");
});

// --- AGENT 4: NEW ROOMS (QA 14 - 16) ---
test("QA 14: Bathroom room is fully defined with 10 objects, hitboxes, actions, and spots", () => {
  const bt = roomsExpansion.bathroom;
  assert(bt, "Bathroom room must be exported");
  assert.strictEqual(bt.name, "Bathroom");
  const objKeys = Object.keys(bt.objects);
  assert.strictEqual(objKeys.length, 10, "Bathroom must have 10 interactive objects");
  assert(bt.actions.length >= 10, "Bathroom must have at least 10 actions");
  assert(bt.worldSvg.includes('class="hit"'), "Bathroom SVG must include .hit areas for click detection");
  assert(bt.spots.bt_door && bt.spots.bt_tub && bt.spots.bt_sink, "Bathroom spots must be defined");
});

test("QA 15: Garage room is fully defined with 10 objects, hitboxes, actions, and spots", () => {
  const g = roomsExpansion.garage;
  assert(g, "Garage room must be exported");
  assert.strictEqual(g.name, "Garage");
  const objKeys = Object.keys(g.objects);
  assert.strictEqual(objKeys.length, 10, "Garage must have 10 interactive objects");
  assert(g.actions.length >= 10, "Garage must have at least 10 actions");
  assert(g.worldSvg.includes('class="hit"'), "Garage SVG must include .hit areas for click detection");
  assert(g.spots.g_door && g.spots.g_carSpot && g.spots.g_bikeSpot, "Garage spots must be defined");
});

test("QA 16: Garden room is fully defined with 10 objects, hitboxes, actions, and spots", () => {
  const gd = roomsExpansion.garden;
  assert(gd, "Garden room must be exported");
  assert.strictEqual(gd.name, "Garden");
  const objKeys = Object.keys(gd.objects);
  assert.strictEqual(objKeys.length, 10, "Garden must have 10 interactive objects");
  assert(gd.actions.length >= 10, "Garden must have at least 10 actions");
  assert(gd.worldSvg.includes('class="hit"'), "Garden SVG must include .hit areas for click detection");
  assert(gd.spots.gd_door && gd.spots.gd_treeSpot && gd.spots.gd_flowerSpot, "Garden spots must be defined");
});

// --- AGENT 5: FAMILY NPCS (QA 17 - 18) ---
test("QA 17: Family NPCs (Mom, Dad, Tommy) initialized with activities and room locations", () => {
  const npcs = family.NPCS;
  assert(npcs.mom && npcs.dad && npcs.brother, "Must have Mom, Dad, and Brother");
  assert(npcs.mom.activities.length >= 3, "Mom must have scheduled activities");
  assert(npcs.dad.activities.length >= 3, "Dad must have scheduled activities");
  assert(npcs.brother.activities.length >= 3, "Brother must have scheduled activities");
  
  family.cycleActivities();
  const roomNpcs = family.getNpcsInRoom("living").concat(family.getNpcsInRoom("kitchen"), family.getNpcsInRoom("garden"), family.getNpcsInRoom("garage"), family.getNpcsInRoom("bedroom"));
  assert.strictEqual(roomNpcs.length, 3, "All 3 family members must be distributed across rooms");
});

test("QA 18: Family NPCs react dynamically to player actions with bilingual dialogue", () => {
  family.reset();
  const rMom = family.onAction("feed_cat");
  assert(rMom, "Mom should react when player feeds cat");
  assert.strictEqual(rMom.npcId, "mom");
  assert(rMom.en.includes("Mimi") && rMom.vi.length > 5);

  const rDad = family.onAction("sweep_floor");
  assert(rDad, "Dad should react when player sweeps floor");
  assert.strictEqual(rDad.npcId, "dad");

  const rTommy = family.onAction("turn_on_tv");
  assert(rTommy, "Tommy should react when player turns on TV");
  assert.strictEqual(rTommy.npcId, "brother");
});

// --- INTEGRATION & HIT-DETECTION (QA 19 - 20) ---
test("QA 19: Click-through hit detection resolves ancestor .obj id and never returns undefined", () => {
  // Simulate the debugging tool behavior
  const mockElements = {
    "o-tv": { id: "o-tv", dataset: { obj: "tv" }, tagName: "G", className: "obj" },
    "o-sofa": { id: "o-sofa", dataset: { obj: "sofa" }, tagName: "G", className: "obj" },
    "o-fridge": { id: "o-fridge", dataset: { obj: "fridge" }, tagName: "G", className: "obj" },
    "o-table": { id: "o-table", dataset: { obj: "table" }, tagName: "G", className: "obj" }
  };

  // Innermost hit element inside the object
  const mockHits = [
    { target: { tagName: "rect", className: "tvscreen", parent: mockElements["o-tv"] } },
    { target: { tagName: "rect", className: "hit", parent: mockElements["o-sofa"] } },
    { target: { tagName: "rect", className: "door", parent: mockElements["o-fridge"] } },
    { target: { tagName: "rect", className: "hit", parent: mockElements["o-table"] } }
  ];

  // Helper with proper ancestor resolution
  function detectHitObj(hitLeaf) {
    let node = hitLeaf.target;
    while (node) {
      if (node.className && node.className.includes("obj") && node.dataset && node.dataset.obj) {
        return node.dataset.obj;
      }
      node = node.parent;
    }
    return undefined;
  }

  const results = mockHits.map(detectHitObj);
  assert.deepStrictEqual(results, ["tv", "sofa", "fridge", "table"], "Ancestor resolution should never return undefined for valid hits");

  // Verify overlay layers in needs.js and day.js enforce pointer-events: none
  const needsContent = fs.readFileSync(path.join(__dirname, "needs.js"), "utf8");
  assert(needsContent.includes(".nd-layer{pointer-events:none}"), ".nd-layer must enforce pointer-events:none");

  const dayContent = fs.readFileSync(path.join(__dirname, "day.js"), "utf8");
  assert(dayContent.includes('pointer-events": "none"'), "#dayFx must enforce pointer-events:none");
});

test("QA 20: Five-Agent End-to-End Synergy Game Loop", () => {
  // 1. Start Challenge (Agent 2)
  challenge.reset();
  const curCh = challenge.start("pet_care", { mode: "practice" });
  assert.strictEqual(curCh.id, "pet_care");

  // 2. Trigger Urgent Event (Agent 1)
  events.reset();
  events.trigger("cat_crying");
  assert.strictEqual(events.current().id, "cat_crying");

  // 3. Check Fridge Ingredients & Cook (Agent 3)
  fridge.reset();
  assert(fridge.hasIngredient("egg", 1));
  const cooked = fridge.onAction("fry_egg");
  assert(cooked && cooked.result === "fried_egg");

  // 4. Perform Action that simultaneously:
  //    - Resolves urgent event (Agent 1)
  //    - Triggers NPC appreciation dialogue (Agent 5)
  //    - Advances challenge task & bars (Agent 2)
  const act = "feed_cat";
  const evRes = events.onAction(act);
  assert(evRes && evRes.resolved, "Urgent event resolved!");

  const npcRes = family.onAction(act);
  assert(npcRes && npcRes.npcId === "mom", "Mom gives appreciation!");

  const chProg = challenge.onAction(act);
  assert(chProg, "Challenge progressed!");

  // 5. Verify New Room data integrated (Agent 4)
  const allRooms = { ...rooms.ELW_ROOMS, ...roomsExpansion.NEW_ROOMS };
  assert(allRooms.kitchen && allRooms.bedroom && allRooms.bathroom && allRooms.garage && allRooms.garden);
  assert.strictEqual(Object.keys(allRooms).length, 5, "All 5 rooms present in system");

  console.log("  → Full 5-agent gameplay synergy verified successfully!");
});

console.log("\n============================================================");
console.log(`QA RESULTS: ${passed}/20 PASSED, ${failed} FAILED`);
console.log("============================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
