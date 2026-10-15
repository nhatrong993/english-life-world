import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const ROOT_DIR = "D:\\tools\\Hoc tieng anh\\english-life-world";
const BUNDLE_PATH = "D:\\tools\\Hoc tieng anh\\english-life-world-ban-day-du.html";
const DOCS_DIR = path.join(ROOT_DIR, "docs");

async function loadChromium() {
  const candidates = [
    "C:/Users/Nhat/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs",
    "C:/Users/Nhat/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs"
  ];
  for (const c of candidates) {
    try {
      const mod = await import(pathToFileURL(c).href);
      if (mod && mod.chromium) return mod.chromium;
    } catch (e) {}
  }
  const mod = await import("playwright");
  return mod.chromium;
}

function assert(cond, msg) {
  if (!cond) {
    throw new Error(`ASSERTION FAILED: ${msg}`);
  }
}

async function run() {
  if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });
  const targetHtml = fs.existsSync(BUNDLE_PATH) ? BUNDLE_PATH : path.join(ROOT_DIR, "index.html");
  const fileUrl = pathToFileURL(targetHtml).href;
  console.log(`[TEST] Loading bundle: ${fileUrl}`);

  const chromium = await loadChromium();
  const exePath = "C:/Users/Nhat/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
  const browser = await chromium.launch(fs.existsSync(exePath) ? { executablePath: exePath, headless: true } : { headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 820 } });
  const page = await context.newPage();

  const jsErrors = [];
  page.on("pageerror", (err) => jsErrors.push(String(err && err.message ? err.message : err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const txt = msg.text();
      if (!/favicon|speechSynthesis|net::ERR_FILE_NOT_FOUND/i.test(txt)) {
        jsErrors.push(txt);
      }
    }
  });

  await page.goto(fileUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(600);

  const report = {
    bundleUsed: targetHtml,
    timestamp: new Date().toISOString(),
    tests: {},
    metrics: {},
    screenshots: []
  };

  // 0. Check module presence
  const modulesCheck = await page.evaluate(() => ({
    hasScene: Boolean(window.ELW_SCENE),
    hasPersonality: Boolean(window.ELW_PET_PERSONALITY),
    hasFollow: Boolean(window.ELW_PET_FOLLOW),
    hasAnim: Boolean(window.ELW_PET_ANIM),
    hasNeeds: Boolean(window.ELW_PET_NEEDS),
    hasRewards: Boolean(window.ELW_PET_REWARDS),
    hasAdventure: Boolean(window.ELW_PET_ADVENTURE),
    hasInteraction: Boolean(window.ELW_PET_INTERACTION),
    profilesCount: Object.keys((window.ELW_PET_PERSONALITY && window.ELW_PET_PERSONALITY.PROFILES) || {}).length
  }));
  console.log("[0] Modules Check:", modulesCheck);
  assert(modulesCheck.hasScene, "window.ELW_SCENE must exist");
  assert(modulesCheck.hasPersonality, "window.ELW_PET_PERSONALITY must exist");
  assert(modulesCheck.hasFollow, "window.ELW_PET_FOLLOW must exist");
  assert(modulesCheck.hasAnim, "window.ELW_PET_ANIM must exist");
  assert(modulesCheck.profilesCount === 10, `Expected 10 pet profiles, got ${modulesCheck.profilesCount}`);
  report.tests.modulesCheck = modulesCheck;

  // 1. Living room 2.5D movement, obstacle avoidance, direction flip, z-order, deadzone stop/resume
  const livingMoveResult = await page.evaluate(async () => {
    const W = window.ELW.state();
    W.room = "living";
    window.ELW_PET_NEEDS.setNeeds({ energy: 85, hunger: 85, thirst: 85, fun: 80, bond: 60 });
    window.ELW_PET_FOLLOW.syncOnRoomChange("living", 220, 560, 1);
    W.x = 220;
    W.y = 560;
    W.dir = 1;
    W.walk = false;

    // Step frames so pet settles in deadzone
    for (let i = 0; i < 45; i++) window.ELW_PET_FOLLOW.stepFrame(1 / 60);
    const settledStart = { ...window.ELW_PET_FOLLOW.state };

    const TABLE_BOX = { x1: 350, x2: 670, y1: 420, y2: 528 };
    const SOFA_BOX = { x1: 434, x2: 646, y1: 330, y2: 400 };
    const insideBox = (p, b) => p.x > b.x1 + 2 && p.x < b.x2 - 2 && p.y > b.y1 + 2 && p.y < b.y2 - 2;

    let obstacleViolations = 0;
    let sawWalkOrRun = false;
    let sawRightFlip = false;
    let sawLeftFlip = false;
    const pathSamples = [];

    // Move character across living room from left (220, 470) to right (790, 470) around TABLE_BOX
    const routeRight = window.ELW_SCENE.route({ x: 220, y: 470 }, { x: 790, y: 470 }, "living");
    W.x = 220;
    W.y = 470;
    W.dir = 1;
    W.walk = true;
    for (const pt of routeRight) {
      const sx = W.x, sy = W.y;
      const dist = Math.hypot(pt.x - sx, pt.y - sy);
      const steps = Math.max(5, Math.ceil(dist / 4));
      for (let s = 1; s <= steps; s++) {
        W.x = sx + ((pt.x - sx) * s) / steps;
        W.y = sy + ((pt.y - sy) * s) / steps;
        W.dir = pt.x >= sx ? 1 : -1;
        window.ELW_PET_FOLLOW.stepFrame(1 / 60);
        const st = window.ELW_PET_FOLLOW.state;
        if (st.mode === "walk" || st.mode === "run") sawWalkOrRun = true;
        if (st.dir === 1) sawRightFlip = true;
        if (insideBox(st, TABLE_BOX) || insideBox(st, SOFA_BOX)) obstacleViolations++;
        if (s % 6 === 0) pathSamples.push({ x: Math.round(st.x), y: Math.round(st.y), mode: st.mode, dir: st.dir });
      }
    }
    W.walk = false;
    // Let pet catch up and stop in deadzone
    for (let i = 0; i < 140; i++) {
      window.ELW_PET_FOLLOW.stepFrame(1 / 60);
      const st = window.ELW_PET_FOLLOW.state;
      if (insideBox(st, TABLE_BOX) || insideBox(st, SOFA_BOX)) obstacleViolations++;
    }
    const rightStop = {
      ...window.ELW_PET_FOLLOW.state,
      distToChar: Math.hypot(W.x - window.ELW_PET_FOLLOW.state.x, W.y - window.ELW_PET_FOLLOW.state.y),
      dataBase: Number(document.getElementById("o-cat").dataset.base),
      catFlipTransform: document.getElementById("catFlip").style.transform
    };

    // Now walk back left to (240, 565)
    let resumedOnWalkLeft = false;
    W.walk = true;
    W.dir = -1;
    const routeLeft = window.ELW_SCENE.route({ x: W.x, y: W.y }, { x: 240, y: 565 }, "living");
    for (const pt of routeLeft) {
      const sx = W.x, sy = W.y;
      const dist = Math.hypot(pt.x - sx, pt.y - sy);
      const steps = Math.max(5, Math.ceil(dist / 4));
      for (let s = 1; s <= steps; s++) {
        W.x = sx + ((pt.x - sx) * s) / steps;
        W.y = sy + ((pt.y - sy) * s) / steps;
        W.dir = pt.x <= sx ? -1 : 1;
        window.ELW_PET_FOLLOW.stepFrame(1 / 60);
        const st = window.ELW_PET_FOLLOW.state;
        if (st.mode === "walk" || st.mode === "run") resumedOnWalkLeft = true;
        if (st.dir === -1) sawLeftFlip = true;
        if (insideBox(st, TABLE_BOX) || insideBox(st, SOFA_BOX)) obstacleViolations++;
      }
    }
    W.walk = false;
    for (let i = 0; i < 140; i++) {
      window.ELW_PET_FOLLOW.stepFrame(1 / 60);
      const st = window.ELW_PET_FOLLOW.state;
      if (insideBox(st, TABLE_BOX) || insideBox(st, SOFA_BOX)) obstacleViolations++;
    }
    const leftStop = {
      ...window.ELW_PET_FOLLOW.state,
      distToChar: Math.hypot(W.x - window.ELW_PET_FOLLOW.state.x, W.y - window.ELW_PET_FOLLOW.state.y),
      dataBase: Number(document.getElementById("o-cat").dataset.base),
      catFlipTransform: document.getElementById("catFlip").style.transform
    };

    return {
      settledStartMode: settledStart.mode,
      sawWalkOrRun,
      sawRightFlip,
      sawLeftFlip,
      resumedOnWalkLeft,
      obstacleViolations,
      rightStopDist: Math.round(rightStop.distToChar),
      rightStopMode: rightStop.mode,
      rightDataBase: rightStop.dataBase,
      rightPetY: Math.round(rightStop.y),
      leftStopDist: Math.round(leftStop.distToChar),
      leftStopMode: leftStop.mode,
      leftDataBase: leftStop.dataBase,
      leftPetY: Math.round(leftStop.y),
      sampleCount: pathSamples.length
    };
  });
  console.log("[1] Living Room 2.5D Follow:", livingMoveResult);
  assert(livingMoveResult.sawWalkOrRun, "Pet must enter walk/run when following");
  assert(livingMoveResult.sawRightFlip && livingMoveResult.sawLeftFlip, "Pet must flip direction both right (1) and left (-1)");
  assert(livingMoveResult.obstacleViolations === 0, `Pet crossed obstacle boxes ${livingMoveResult.obstacleViolations} times`);
  assert(livingMoveResult.rightStopDist >= 40 && livingMoveResult.rightStopDist <= 120, `Right stop distance ${livingMoveResult.rightStopDist} not in 40..120px`);
  assert(livingMoveResult.leftStopDist >= 40 && livingMoveResult.leftStopDist <= 120, `Left stop distance ${livingMoveResult.leftStopDist} not in 40..120px`);
  assert(livingMoveResult.rightStopMode === "idle", `Expected idle after stopping right, got ${livingMoveResult.rightStopMode}`);
  assert(livingMoveResult.leftStopMode === "idle", `Expected idle after stopping left, got ${livingMoveResult.leftStopMode}`);
  assert(livingMoveResult.resumedOnWalkLeft, "Pet must resume moving when character walks again");
  assert(Math.abs(livingMoveResult.leftDataBase - livingMoveResult.leftPetY) <= 8, "Z-order data-base must track pet Y");
  report.tests.livingMovement = livingMoveResult;

  await page.screenshot({ path: path.join(DOCS_DIR, "pet25d-living-follow.png") });
  report.screenshots.push("docs/pet25d-living-follow.png");

  // 2. Room/Zone switching: kitchen, cafe_counter, market_produce, park
  const roomSwitchResult = await page.evaluate(async () => {
    const roomsToTest = ["kitchen", "cafe_counter", "market_produce", "park", "market_meat", "living"];
    const results = {};
    for (const rm of roomsToTest) {
      window.ELW.enqueue("go_" + rm);
      // Wait for queue to settle or force switch
      const t0 = Date.now();
      while (!window.ELW.idle() && Date.now() - t0 < 2500) {
        await new Promise((r) => setTimeout(r, 30));
      }
      const W = window.ELW.state();
      if (W.room !== rm) {
        W.room = rm;
        window.ELW_PET_FOLLOW.syncOnRoomChange(rm, W.x || 500, W.y || 520, W.dir || 1);
      }
      for (let i = 0; i < 30; i++) window.ELW_PET_FOLLOW.stepFrame(1 / 60);
      // Move character 140px in that room and verify pet follows
      const startPetX = window.ELW_PET_FOLLOW.state.x;
      W.walk = true;
      for (let s = 0; s < 40; s++) {
        W.x = Math.min(840, (W.x || 400) + 3.5);
        W.dir = 1;
        window.ELW_PET_FOLLOW.stepFrame(1 / 60);
      }
      W.walk = false;
      for (let s = 0; s < 60; s++) window.ELW_PET_FOLLOW.stepFrame(1 / 60);
      const oCat = document.getElementById("o-cat");
      const cs = window.getComputedStyle(oCat);
      const dist = Math.hypot(W.x - window.ELW_PET_FOLLOW.state.x, W.y - window.ELW_PET_FOLLOW.state.y);
      results[rm] = {
        visible: cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0,
        petMovedDelta: Math.round(Math.abs(window.ELW_PET_FOLLOW.state.x - startPetX)),
        distToChar: Math.round(dist),
        roomRecorded: window.ELW_PET_FOLLOW.state.room
      };
    }
    return results;
  });
  console.log("[2] Room/Zone Switching:", roomSwitchResult);
  for (const rm of ["kitchen", "cafe_counter", "market_produce", "park"]) {
    assert(roomSwitchResult[rm] && roomSwitchResult[rm].visible, `#o-cat must be visible in ${rm}`);
    assert(roomSwitchResult[rm].petMovedDelta > 20, `Pet must follow character movement in ${rm}`);
    assert(roomSwitchResult[rm].distToChar >= 35 && roomSwitchResult[rm].distToChar <= 125, `Pet distance in ${rm} out of range: ${roomSwitchResult[rm].distToChar}`);
  }
  report.tests.roomSwitching = roomSwitchResult;

  await page.screenshot({ path: path.join(DOCS_DIR, "pet25d-rooms-zones.png") });
  report.screenshots.push("docs/pet25d-rooms-zones.png");

  // 3. Needs-driven speed & sprite state (tired energy<25 vs excited high fun) + 5s idle continuous transform
  const needsAndIdleResult = await page.evaluate(async () => {
    const W = window.ELW.state();
    W.room = "park";
    const measureFollowSpeed = (needsPatch) => {
      window.ELW_PET_NEEDS.setNeeds(needsPatch);
      W.x = 200;
      W.y = 520;
      W.dir = 1;
      window.ELW_PET_FOLLOW.syncOnRoomChange("park", 200, 520, 1);
      W.x = 650;
      W.walk = true;
      let maxSpeed = 0;
      for (let i = 0; i < 45; i++) {
        window.ELW_PET_FOLLOW.stepFrame(1 / 60);
        window.ELW_PET_ANIM.updateFrame(window.ELW_PET_FOLLOW.state, 1 / 60);
        if (window.ELW_PET_FOLLOW.state.speed > maxSpeed) {
          maxSpeed = window.ELW_PET_FOLLOW.state.speed;
        }
      }
      W.walk = false;
      const imgEl = document.getElementById("roomPetImg");
      const spriteState = imgEl.getAttribute("data-state");
      const srcPath = imgEl.getAttribute("data-src-path") || "";
      const rawSrc = imgEl.getAttribute("src") || "";
      const spriteSrc = srcPath || rawSrc.slice(0, 85);
      return {
        maxSpeed: Math.round(maxSpeed * 10) / 10,
        energyMode: window.ELW_PET_FOLLOW.state.energyMode,
        spriteState,
        spriteSrc
      };
    };

    const tiredMetrics = measureFollowSpeed({ energy: 18, fun: 45, hunger: 75, thirst: 75 });
    const normalMetrics = measureFollowSpeed({ energy: 65, fun: 55, hunger: 75, thirst: 75 });
    const excitedMetrics = measureFollowSpeed({ energy: 92, fun: 95, hunger: 85, thirst: 85 });

    // Idle 5s transform test: keep pet in idle mode and sample #catHop transform across 5 seconds (simulated 1s intervals)
    W.walk = false;
    window.ELW_PET_FOLLOW.syncOnRoomChange("park", 500, 520, 1);
    for (let i = 0; i < 40; i++) window.ELW_PET_FOLLOW.stepFrame(1 / 60);
    const idleTransforms = [];
    for (let sec = 0; sec < 5; sec++) {
      for (let f = 0; f < 60; f++) {
        window.ELW_PET_FOLLOW.stepFrame(1 / 60);
        window.ELW_PET_ANIM.updateFrame(window.ELW_PET_FOLLOW.state, 1 / 60);
      }
      idleTransforms.push(document.getElementById("catHop").style.transform);
    }
    const uniqueIdleTransforms = new Set(idleTransforms).size;

    return {
      tiredMetrics,
      normalMetrics,
      excitedMetrics,
      idleTransforms,
      uniqueIdleTransforms
    };
  });
  console.log("[3] Needs Speed & Idle 5s:", needsAndIdleResult);
  assert(needsAndIdleResult.tiredMetrics.maxSpeed < needsAndIdleResult.normalMetrics.maxSpeed, "Tired speed must be slower than normal speed");
  assert(needsAndIdleResult.excitedMetrics.maxSpeed > needsAndIdleResult.normalMetrics.maxSpeed, "Excited speed must be faster than normal speed");
  assert(needsAndIdleResult.tiredMetrics.spriteState === "tired" && needsAndIdleResult.tiredMetrics.spriteSrc.includes("tired.png"), "Tired pet (energy<25) must display tired.png");
  assert(needsAndIdleResult.uniqueIdleTransforms >= 4, `Expected #catHop transform to vary during 5s idle, got ${needsAndIdleResult.uniqueIdleTransforms} unique transforms`);
  report.tests.needsAndIdle = needsAndIdleResult;

  await page.screenshot({ path: path.join(DOCS_DIR, "pet25d-tired-excited.png") });
  report.screenshots.push("docs/pet25d-tired-excited.png");

  // 4. Personality & Preferences (Mochi fish in market_meat -> love/like; Milu ball in park -> love; Mochi water/bath -> dislike)
  const personalityResult = await page.evaluate(() => {
    window.ELW_PET.selectPet("mochi");
    window.ELW_PET_NEEDS.setNeeds({ energy: 80, hunger: 60, thirst: 70, fun: 50, bond: 40 });
    const funBeforeMochi = window.ELW_PET_NEEDS.getNeeds().fun;
    const mochiFish = window.ELW_PET_PERSONALITY.react(
      "mochi",
      { room: "market_meat", item: "fish", actionId: "order_fresh_salmon", weather: "sunny" },
      { apply: true }
    );
    const funAfterMochi = window.ELW_PET_NEEDS.getNeeds().fun;

    // Show reaction bubble for screenshot
    window.ELW_PET_PERSONALITY.showReactionBubble(mochiFish, 5000);
    const bubbleEl = document.getElementById("petReactBubble");
    const bubbleVisible = Boolean(bubbleEl && bubbleEl.textContent && bubbleEl.textContent.trim().length > 0);

    // Milu at park throwing ball
    window.ELW_PET.selectPet("milu");
    const funBeforeMilu = window.ELW_PET_NEEDS.getNeeds().fun;
    const miluBall = window.ELW_PET_PERSONALITY.react(
      "milu",
      { room: "park", item: "ball", actionId: "throw_the_ball", weather: "sunny" },
      { apply: true }
    );
    const funAfterMilu = window.ELW_PET_NEEDS.getNeeds().fun;

    // Mochi encountering water / bath
    const mochiWater = window.ELW_PET_PERSONALITY.react(
      "mochi",
      { room: "bathroom", item: "water", actionId: "take_a_shower", weather: "rainy" },
      { apply: true }
    );

    // Check rare pets personalities too (ember, pip, aqua, lumi)
    const emberGrill = window.ELW_PET_PERSONALITY.react("ember", { room: "restaurant", item: "bbq", actionId: "grill_steak", weather: "warm" });
    const pipSnow = window.ELW_PET_PERSONALITY.react("pip", { room: "market_frozen", item: "ice_cream", weather: "snowy" });
    const aquaWater = window.ELW_PET_PERSONALITY.react("aqua", { room: "bathroom", item: "water", actionId: "take_a_shower", weather: "rainy" });

    return {
      mochiFish,
      funBeforeMochi,
      funAfterMochi,
      bubbleVisible,
      miluBall,
      funBeforeMilu,
      funAfterMilu,
      mochiWater,
      emberGrillMood: emberGrill.mood,
      pipSnowMood: pipSnow.mood,
      aquaWaterMood: aquaWater.mood
    };
  });
  console.log("[4] Personality & Preferences:", personalityResult);
  assert(personalityResult.mochiFish.mood === "love" || personalityResult.mochiFish.mood === "like", `Mochi buying fish in market_meat should be love/like, got ${personalityResult.mochiFish.mood}`);
  assert(personalityResult.funAfterMochi > personalityResult.funBeforeMochi, "Mochi fun must increase after buying fish");
  assert(Boolean(personalityResult.mochiFish.lineEn && personalityResult.mochiFish.lineVi), "Reaction must include lineEn and lineVi");
  assert(personalityResult.bubbleVisible, "Reaction bubble #petReactBubble must be visible near pet");
  assert(personalityResult.miluBall.mood === "love", `Milu throwing ball in park should be love, got ${personalityResult.miluBall.mood}`);
  assert(personalityResult.funAfterMilu > personalityResult.funBeforeMilu, "Milu fun must increase after throwing ball");
  assert(personalityResult.mochiWater.mood === "dislike", `Mochi water/bath should be dislike, got ${personalityResult.mochiWater.mood}`);
  assert(personalityResult.emberGrillMood === "love", "Ember dragon should love warm/grill");
  assert(personalityResult.pipSnowMood === "love", "Pip snow fox should love cold/snow/frozen");
  assert(personalityResult.aquaWaterMood === "love", "Aqua sea otter should love water/shower");
  report.tests.personality = personalityResult;

  await page.screenshot({ path: path.join(DOCS_DIR, "pet25d-personality-bubble.png") });
  report.screenshots.push("docs/pet25d-personality-bubble.png");

  // 5. Anti-farm rewards & Premium guard
  const rewardsAndPremiumResult = await page.evaluate(() => {
    const testKey = "pet25d_antifarm_test_" + Date.now();
    const starsBefore = window.ELW.getPts();
    const firstClaim = window.ELW_PET_REWARDS.claimObjectiveReward(testKey, { stars: 3, xp: 10, bond: 2, label: "Test First Claim" });
    const starsAfterFirst = window.ELW.getPts();
    const secondClaim = window.ELW_PET_REWARDS.claimObjectiveReward(testKey, { stars: 3, xp: 10, bond: 2, label: "Test Second Claim" });
    const starsAfterSecond = window.ELW.getPts();

    // Also test personality world action bonus anti-farm
    window.ELW_PET.selectPet("milu");
    const r1 = window.ELW_PET_PERSONALITY.triggerWorldReaction({ petId: "milu", room: "park", item: "ball", actionId: "throw_the_ball_antifarm" });
    const starsAfterReact1 = window.ELW.getPts();
    const r2 = window.ELW_PET_PERSONALITY.triggerWorldReaction({ petId: "milu", room: "park", item: "ball", actionId: "throw_the_ball_antifarm" });
    const starsAfterReact2 = window.ELW.getPts();

    // Premium pet guard check
    const selectBoba = window.ELW_PET.selectPet("boba");
    const selectEmber = window.ELW_PET.selectPet("ember");
    const activeAfterPremiumAttempt = window.ELW_PET.getActivePetId();

    return {
      firstClaimGranted: firstClaim.granted,
      secondClaimGranted: secondClaim.granted,
      secondClaimDuplicate: secondClaim.duplicate,
      starsBefore,
      starsAfterFirst,
      starsAfterSecond,
      starsAfterReact1,
      starsAfterReact2,
      bobaUnlocked: selectBoba.unlocked,
      emberUnlocked: selectEmber.unlocked,
      activeAfterPremiumAttempt
    };
  });
  console.log("[5] Anti-farm & Premium Guard:", rewardsAndPremiumResult);
  assert(rewardsAndPremiumResult.firstClaimGranted === true, "First claim must be granted");
  assert(rewardsAndPremiumResult.secondClaimGranted === false && rewardsAndPremiumResult.secondClaimDuplicate === true, "Second claim must be blocked as duplicate");
  assert(rewardsAndPremiumResult.starsAfterFirst > rewardsAndPremiumResult.starsBefore, "First claim must add stars");
  assert(rewardsAndPremiumResult.starsAfterSecond === rewardsAndPremiumResult.starsAfterFirst, "Second claim must not add stars");
  assert(rewardsAndPremiumResult.starsAfterReact2 === rewardsAndPremiumResult.starsAfterReact1, "Second identical personality reaction must not farm stars");
  assert(rewardsAndPremiumResult.bobaUnlocked === false && rewardsAndPremiumResult.emberUnlocked === false, "Premium pets must remain locked");
  assert(rewardsAndPremiumResult.activeAfterPremiumAttempt === "milu" || rewardsAndPremiumResult.activeAfterPremiumAttempt === "mochi", "Active pet must remain free pet after locked selection");
  report.tests.rewardsAndPremium = rewardsAndPremiumResult;

  // 6. Performance (300 frames memory & FPS), Mobile 390px no horizontal scroll, Reduced-motion
  const perfResult = await page.evaluate(async () => {
    const W = window.ELW.state();
    W.room = "living";
    window.ELW_PET_NEEDS.setNeeds({ energy: 85, fun: 85 });
    const memBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const t0 = performance.now();
    for (let f = 0; f < 300; f++) {
      W.x = 300 + Math.sin(f * 0.05) * 220;
      W.y = 540 + Math.cos(f * 0.05) * 35;
      W.dir = Math.cos(f * 0.05) >= 0 ? 1 : -1;
      W.walk = true;
      window.ELW_PET_FOLLOW.stepFrame(1 / 60);
      window.ELW_PET_ANIM.updateFrame(window.ELW_PET_FOLLOW.state, 1 / 60);
    }
    W.walk = false;
    const elapsedMs = performance.now() - t0;
    const memAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const heapDeltaMB = Math.round(((memAfter - memBefore) / (1024 * 1024)) * 100) / 100;

    // Test reduced motion
    window.ELW_PET_ANIM.setReducedMotionOverride(true);
    window.ELW_PET_NEEDS.setNeeds({ energy: 15, fun: 40 });
    window.ELW_PET_FOLLOW.stepFrame(1 / 60);
    window.ELW_PET_ANIM.updateFrame(window.ELW_PET_FOLLOW.state, 1 / 60);
    const rmHopTransform1 = document.getElementById("catHop").style.transform;
    const rmSpriteTired = document.getElementById("roomPetImg").getAttribute("data-state");

    window.ELW_PET_NEEDS.setNeeds({ energy: 90, fun: 90 });
    for (let i = 0; i < 15; i++) {
      window.ELW_PET_FOLLOW.stepFrame(1 / 60);
      window.ELW_PET_ANIM.updateFrame(window.ELW_PET_FOLLOW.state, 1 / 60);
    }
    const rmHopTransform2 = document.getElementById("catHop").style.transform;
    const rmSpriteHappy = document.getElementById("roomPetImg").getAttribute("data-state");
    window.ELW_PET_ANIM.setReducedMotionOverride(null);

    return {
      frames: 300,
      computeMsFor300Frames: Math.round(elapsedMs * 100) / 100,
      avgFrameComputeMs: Math.round((elapsedMs / 300) * 1000) / 1000,
      heapDeltaMB,
      rmHopTransform1,
      rmHopTransform2,
      rmSpriteTired,
      rmSpriteHappy
    };
  });
  console.log("[6a] Performance & Reduced Motion:", perfResult);
  assert(perfResult.heapDeltaMB < 15, `Heap delta for 300 frames too high: ${perfResult.heapDeltaMB} MB`);
  assert(perfResult.rmHopTransform1 === perfResult.rmHopTransform2, "Reduced motion must keep #catHop transform static");
  assert(perfResult.rmSpriteTired === "tired" && perfResult.rmSpriteHappy !== "tired", "Reduced motion must still update sprite image states");

  // Mobile 390px viewport check + 3 tabs check
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  const mobileCheck = await page.evaluate(() => {
    const docEl = document.documentElement;
    const scrollW = docEl.scrollWidth;
    const clientW = docEl.clientWidth;
    const mobileTabs = [...document.querySelectorAll(".w3d-mtab, [data-mtab], [data-m-tab]")].map((b) => b.textContent.trim());
    const tabSwitchOk = [];
    if (window.ELW_WORLD3D && typeof window.ELW_WORLD3D.setTab === "function") {
      for (const t of ["play", "learn", "mission"]) {
        window.ELW_WORLD3D.setTab(t);
        tabSwitchOk.push(t);
      }
      window.ELW_WORLD3D.setTab("play");
    }
    return {
      scrollWidth: scrollW,
      clientWidth: clientW,
      noHorizontalScroll: scrollW <= clientW + 1,
      mobileTabsCount: mobileTabs.length,
      mobileTabs,
      tabSwitchOk
    };
  });
  console.log("[6b] Mobile 390px Check:", mobileCheck);
  assert(mobileCheck.noHorizontalScroll, `Mobile 390px has horizontal overflow: scrollWidth=${mobileCheck.scrollWidth} > clientWidth=${mobileCheck.clientWidth}`);
  assert(mobileCheck.mobileTabsCount >= 3, `Expected 3 workspace tabs, found ${mobileCheck.mobileTabsCount}`);
  await page.screenshot({ path: path.join(DOCS_DIR, "pet25d-mobile-390.png") });
  report.screenshots.push("docs/pet25d-mobile-390.png");

  // Restore desktop viewport for regression tests
  await page.setViewportSize({ width: 1280, height: 820 });
  await page.waitForTimeout(200);

  // 7. Regression: Linh only outside home, missions cafe_order_latte & market_weekly_shopping complete, audio no overlap
  const regressionResult = await page.evaluate(async () => {
    const W = window.ELW.state();
    W.room = "living";
    if (window.ELW_LIFE && window.ELW_LIFE.setCompanion) {
      window.ELW_LIFE.setCompanion(true);
    }
    if (window.ELW_LIFE && window.ELW_LIFE.onRoomEnter) {
      window.ELW_LIFE.onRoomEnter("living");
    }
    const friendInLiving = document.getElementById("lt-friend");
    const linhHiddenAtHome = !friendInLiving || friendInLiving.style.display === "none" || !friendInLiving.parentNode;

    // Test missions cafe_order_latte and market_weekly_shopping
    const runMissionToCompletion = (missionId, startRoom) => {
      const M = window.ELW_MISSION;
      const m = M.MISSIONS.find((x) => x.id === missionId);
      if (!m) return { found: false };
      W.room = startRoom;
      M.start(missionId);
      let guard = 0;
      while (M.active() && guard < 30) {
        guard++;
        const curStep = M.current(W);
        if (!curStep) break;
        const actId =
          (typeof curStep.next === "function" ? curStep.next(W) : null) ||
          (curStep.actions && curStep.actions[0]);
        if (!actId) break;
        const actObj = window.ELW.ACTIONS.find((a) => a.id === actId);
        if (actObj && typeof actObj.seq === "function") {
          const ops = actObj.seq() || [];
          for (const op of ops) {
            if (!Array.isArray(op)) continue;
            if (op[0] === "set") W[op[1]] = op[2];
            else if (op[0] === "room") W.room = op[1];
            else if (op[0] === "sit") W.sitting = true;
            else if (op[0] === "stand") W.sitting = false;
          }
        }
        M.onAction(actId, "done", W);
      }
      return {
        found: true,
        completed: !M.active() && Boolean(M.state().complete),
        stepsRun: guard
      };
    };

    const cafeMission = runMissionToCompletion("cafe_order_latte", "cafe_counter");
    const marketMission = runMissionToCompletion("market_weekly_shopping", "market_entrance");

    return {
      linhHiddenAtHome,
      cafeMission,
      marketMission
    };
  });
  console.log("[7] Regression Check:", regressionResult);
  assert(regressionResult.linhHiddenAtHome, "Companion Linh must be hidden when inside home (living room)");
  assert(regressionResult.cafeMission.found && regressionResult.cafeMission.completed, "Mission cafe_order_latte must complete");
  assert(regressionResult.marketMission.found && regressionResult.marketMission.completed, "Mission market_weekly_shopping must complete");
  assert(jsErrors.length === 0, `Encountered JS errors: ${jsErrors.join(" | ")}`);

  report.tests.performanceAndReducedMotion = perfResult;
  report.tests.mobile390 = mobileCheck;
  report.tests.regression = regressionResult;
  report.metrics = {
    jsErrorsCount: jsErrors.length,
    avgFrameComputeMs: perfResult.avgFrameComputeMs,
    heapDeltaMB: perfResult.heapDeltaMB
  };

  const reportJsonPath = path.join(DOCS_DIR, "pet25d_test_results.json");
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`[PASS] All PET 2.5D tests passed! Saved metrics to ${reportJsonPath}`);

  await browser.close();
}

run().catch((err) => {
  console.error("[FAIL]", err);
  process.exit(1);
});
