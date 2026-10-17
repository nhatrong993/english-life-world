import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const ROOT_DIR = "D:\\tools\\Hoc tieng anh\\english-life-world";
const BUNDLE_PATH = "D:\\tools\\Hoc tieng anh\\english-life-world-ban-day-du.html";

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

async function waitIdle(page, timeoutMs = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const isIdle = await page.evaluate(() => Boolean(window.ELW && window.ELW.idle && window.ELW.idle()));
    if (isIdle) return;
    await page.waitForTimeout(25);
  }
  throw new Error(`Timeout waiting for ELW.idle() after ${timeoutMs}ms`);
}

async function clickObjectInScene(page, objId) {
  await page.evaluate((id) => {
    const el = document.querySelector(`#room .obj[data-obj="${id}"], #o-${id}`);
    if (!el) throw new Error(`Object #o-${id} not found in scene`);
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }, objId);
  await page.waitForSelector(`#panel [data-act]`, { timeout: 5000 });
}

async function clickActionBtn(page, actId) {
  const btnSel = `#panel button[data-act="${actId}"]`;
  await page.waitForSelector(btnSel, { timeout: 5000 });
  const isDisabled = await page.$eval(btnSel, (b) => b.disabled);
  assert(!isDisabled, `Expected action button ${actId} to be enabled before clicking`);
  await page.click(btnSel);
  await waitIdle(page);
}

async function run() {
  assert(fs.existsSync(BUNDLE_PATH), `Bundle not found at ${BUNDLE_PATH}`);
  const fileUrl = pathToFileURL(BUNDLE_PATH).href;
  console.log(`[TEST] Loading bundle: ${fileUrl}`);

  const chromium = await loadChromium();
  const exePath = "C:/Users/Nhat/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
  const browser = await chromium.launch(fs.existsSync(exePath) ? { executablePath: exePath, headless: true } : { headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 820 },
    reducedMotion: "reduce"
  });

  // Speed up audio/TTS in headless test while recording all spoken text
  await context.addInitScript(() => {
    try {
      localStorage.setItem("elw_welcome_v1", "1");
    } catch (e) {}
    window.__spokenLog = [];
    if ("speechSynthesis" in window) {
      window.speechSynthesis.speak = function (u) {
        window.__spokenLog.push(u && u.text ? u.text : "");
        setTimeout(() => {
          if (u && typeof u.onend === "function") u.onend();
        }, 10);
      };
      window.speechSynthesis.cancel = function () {};
      Object.defineProperty(window.speechSynthesis, "speaking", { get: () => false });
    }
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.__spokenLog.push(this.src || "audio");
      setTimeout(() => {
        if (typeof this.onended === "function") this.onended();
        this.dispatchEvent(new Event("ended"));
      }, 10);
      return Promise.resolve();
    };
  });

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
  await page.waitForTimeout(400);

  // Dismiss welcome modal if present
  await page.evaluate(() => {
    const w = document.getElementById("elwWelcome");
    if (w) w.remove();
    if (window.ELW && window.ELW.resetScene) window.ELW.resetScene(true);
    const q = window.ELW && window.ELW.queue ? window.ELW.queue() : [];
    q.length = 0;
  });
  await waitIdle(page);

  const summary = {
    fridge10Rounds: null,
    storyAfter10Rounds: null,
    audioReplayBtn: null,
    fridgePopoverSync: null,
    fiveObjects5Rounds: {},
    rapidClickGuard: null,
    roomSwitchAndReturn: null,
    coMaiChipNoDuplicate: null,
    missions: {},
    mobile390Tabs: null,
    jsErrorsCount: 0
  };

  // =========================================================================
  // 1. Tủ lạnh Mở → Đóng × 10 vòng qua đúng UI (click #o-fridge → nút hành động)
  // =========================================================================
  console.log("[1] Testing Fridge Open -> Close x 10 rounds via UI...");
  await clickObjectInScene(page, "fridge");
  const fridgeLog = [];
  for (let round = 1; round <= 10; round++) {
    await clickActionBtn(page, "open_fridge");
    const openState = await page.evaluate(() => {
      const f = document.getElementById("o-fridge");
      const door = f ? f.querySelector(".door") : null;
      const openBtn = document.querySelector('#panel button[data-act="open_fridge"]');
      const closeBtn = document.querySelector('#panel button[data-act="close_fridge"]');
      return {
        wFridge: window.ELW.state().fridge,
        hasClass: f ? f.classList.contains("fridge-open") : false,
        doorTransform: door ? getComputedStyle(door).transform : "",
        openBtnDisabled: openBtn ? openBtn.disabled : null,
        openBtnWhy: openBtn && openBtn.querySelector(".why") ? openBtn.querySelector(".why").textContent : "",
        closeBtnDisabled: closeBtn ? closeBtn.disabled : null
      };
    });
    assert(openState.wFridge === "open", `Round ${round} open: expected W.fridge="open", got "${openState.wFridge}"`);
    assert(openState.hasClass === true, `Round ${round} open: expected #o-fridge.fridge-open=true`);
    assert(openState.doorTransform !== "none" && openState.doorTransform !== "matrix(1, 0, 0, 1, 0, 0)", `Round ${round} open: expected door transform scaled, got ${openState.doorTransform}`);
    assert(openState.openBtnDisabled === true, `Round ${round} open: expected open_fridge button disabled when already open`);
    assert(openState.openBtnWhy.includes("đang mở rồi"), `Round ${round} open: expected why text on open_fridge button, got "${openState.openBtnWhy}"`);
    assert(openState.closeBtnDisabled === false, `Round ${round} open: expected close_fridge button enabled`);

    await clickActionBtn(page, "close_fridge");
    const closeState = await page.evaluate(() => {
      const f = document.getElementById("o-fridge");
      const door = f ? f.querySelector(".door") : null;
      const openBtn = document.querySelector('#panel button[data-act="open_fridge"]');
      const closeBtn = document.querySelector('#panel button[data-act="close_fridge"]');
      return {
        wFridge: window.ELW.state().fridge,
        hasClass: f ? f.classList.contains("fridge-open") : false,
        doorTransform: door ? getComputedStyle(door).transform : "",
        openBtnDisabled: openBtn ? openBtn.disabled : null,
        openBtnHasActDone: openBtn ? openBtn.classList.contains("act-done") : false,
        closeBtnDisabled: closeBtn ? closeBtn.disabled : null,
        closeBtnWhy: closeBtn && closeBtn.querySelector(".why") ? closeBtn.querySelector(".why").textContent : ""
      };
    });
    assert(closeState.wFridge === "closed", `Round ${round} close: expected W.fridge="closed", got "${closeState.wFridge}"`);
    assert(closeState.hasClass === false, `Round ${round} close: expected #o-fridge.fridge-open=false`);
    assert(closeState.openBtnDisabled === false, `Round ${round} close: expected open_fridge button enabled for next round`);
    assert(closeState.openBtnHasActDone === true, `Round ${round} close: expected open_fridge button to keep decorative .act-done class`);
    assert(closeState.closeBtnDisabled === true, `Round ${round} close: expected close_fridge button disabled when already closed`);
    assert(closeState.closeBtnWhy.includes("đang đóng rồi"), `Round ${round} close: expected why text on close_fridge button`);
    fridgeLog.push({ round, openOk: true, closeOk: true });
  }
  summary.fridge10Rounds = { roundsCompleted: fridgeLog.length, allPassed: true };
  console.log("  -> Fridge 10 rounds (20 UI actions) PASSED.");

  // =========================================================================
  // 2. Kiểm tra "Phần đoạn văn của tôi" (#storyCard) không trùng câu sau 10 vòng
  // =========================================================================
  console.log("[2] Checking 'Phần đoạn văn của tôi' (#storyCard) after 10 rounds...");
  const storyCheck = await page.evaluate(() => {
    const rawStory = window.ELW.story();
    const finalSegs = window.ELW.storyFinal();
    const domText = (document.querySelector("#storyCard .story") || {}).textContent || "";
    const queueDone = window.ELW.queue().filter((q) => q.status === "done");
    // Also test simple mode
    const smSimpleBtn = document.querySelector('#storyCard [data-sm="simple"]');
    if (smSimpleBtn) smSimpleBtn.click();
    const simpleSegs = window.ELW.storyFinal().map((x) => x.en);
    const smA2Btn = document.querySelector('#storyCard [data-sm="A2"]');
    if (smA2Btn) smA2Btn.click();
    return {
      rawStoryCount: rawStory.length,
      finalSegs: finalSegs.map((x) => x.en),
      simpleSegs,
      domText: domText.trim(),
      queueDoneLen: queueDone.length,
      queueDoneCounts: queueDone.map((q) => ({ id: q.id, count: q.count || 1 }))
    };
  });
  assert(storyCheck.simpleSegs.length === 2, `Expected 2 unique sentences in simple story mode after 10 rounds, got ${storyCheck.simpleSegs.length}: ${JSON.stringify(storyCheck.simpleSegs)}`);
  assert(new Set(storyCheck.simpleSegs).size === storyCheck.simpleSegs.length, "Duplicate sentences found in simpleSegs");
  assert(storyCheck.finalSegs.length === 1, `Expected 1 combined clause in A2 mode after 10 rounds, got ${storyCheck.finalSegs.length}: ${JSON.stringify(storyCheck.finalSegs)}`);
  summary.storyAfter10Rounds = storyCheck;
  console.log("  -> Story deduplication after 10 rounds PASSED:", storyCheck.finalSegs);

  // =========================================================================
  // 3. Nút 🔊 (data-say-sent) phát câu mà KHÔNG đổi trạng thái
  // =========================================================================
  console.log("[3] Testing [data-say-sent] audio replay button...");
  const audioCheck = await page.evaluate(async () => {
    const beforeFridge = window.ELW.state().fridge;
    const beforeSpokenLen = (window.__spokenLog || []).length;
    const btnSayOpen = document.querySelector('#panel button[data-say-sent="open_fridge"]');
    const btnSayClose = document.querySelector('#panel button[data-say-sent="close_fridge"]');
    if (!btnSayOpen || !btnSayClose) return { found: false };
    btnSayOpen.click();
    const afterOpenClickFridge = window.ELW.state().fridge;
    const bubbleText1 = (document.querySelector("#room .cbub") || {}).textContent || "";
    btnSayClose.click();
    const afterCloseClickFridge = window.ELW.state().fridge;
    const bubbleText2 = (document.querySelector("#room .cbub") || {}).textContent || "";
    const afterSpokenLen = (window.__spokenLog || []).length;
    return {
      found: true,
      beforeFridge,
      afterOpenClickFridge,
      afterCloseClickFridge,
      bubbleText1,
      bubbleText2,
      spokenDelta: afterSpokenLen - beforeSpokenLen,
      isIdle: window.ELW.idle()
    };
  });
  assert(audioCheck.found, "Expected [data-say-sent] buttons inside #panel");
  assert(audioCheck.beforeFridge === "closed" && audioCheck.afterOpenClickFridge === "closed" && audioCheck.afterCloseClickFridge === "closed", "Clicking [data-say-sent] must NOT change W.fridge");
  assert(audioCheck.bubbleText1.includes("opening the fridge"), `Expected speech bubble for open_fridge, got "${audioCheck.bubbleText1}"`);
  assert(audioCheck.bubbleText2.includes("closing the fridge"), `Expected speech bubble for close_fridge, got "${audioCheck.bubbleText2}"`);
  assert(audioCheck.spokenDelta >= 2, `Expected audio playback on [data-say-sent], delta=${audioCheck.spokenDelta}`);
  summary.audioReplayBtn = audioCheck;
  console.log("  -> [data-say-sent] audio replay button PASSED.");

  // =========================================================================
  // 4. Đồng bộ #fridgeCard popover closeFridge() với W.fridge
  // =========================================================================
  console.log("[4] Testing #fridgeCard closeFridge() state synchronization...");
  await clickActionBtn(page, "open_fridge");
  const popoverSync = await page.evaluate(() => {
    window.ELW_WORLD3D.openFridge();
    const fc = document.getElementById("fridgeCard");
    const closeBtn = document.getElementById("btnCloseFridge");
    const wBefore = window.ELW.state().fridge;
    closeBtn.click();
    const wAfter = window.ELW.state().fridge;
    const domHasOpenClass = document.getElementById("o-fridge").classList.contains("fridge-open");
    const openBtnDisabled = document.querySelector('#panel button[data-act="open_fridge"]').disabled;
    return {
      wBefore,
      wAfter,
      fcHidden: fc.hidden,
      domHasOpenClass,
      openBtnDisabled
    };
  });
  assert(popoverSync.wBefore === "open", "Expected W.fridge='open' before clicking #btnCloseFridge");
  assert(popoverSync.fcHidden === true, "Expected #fridgeCard to be hidden after clicking #btnCloseFridge");
  assert(popoverSync.wAfter === "closed", `Expected W.fridge='closed' after clicking #btnCloseFridge, got '${popoverSync.wAfter}'`);
  assert(popoverSync.domHasOpenClass === false, "Expected #o-fridge.fridge-open removed after clicking #btnCloseFridge");
  assert(popoverSync.openBtnDisabled === false, "Expected open_fridge button enabled after #btnCloseFridge");
  summary.fridgePopoverSync = popoverSync;
  console.log("  -> #fridgeCard closeFridge() state sync PASSED.");

  // =========================================================================
  // 5. TV, Đèn cây, Cửa sổ, Vòi nước, Lò vi sóng × 5 vòng qua đúng UI
  // =========================================================================
  const objectPairs = [
    {
      name: "tv",
      room: "living",
      objId: "tv",
      act1: "turn_on_tv",
      act2: "turn_off_tv",
      stateKey: "tv",
      val1: "on",
      val2: "off",
      checkAnim: () => {
        const el = document.getElementById("o-tv");
        const scr = el ? el.querySelector(".tvscreen") : null;
        return { active: el ? el.classList.contains("tv-on") : false, detail: scr ? getComputedStyle(scr).fill : "" };
      }
    },
    {
      name: "floorlamp",
      room: "living",
      objId: "floorlamp",
      act1: "turn_on_floor_lamp",
      act2: "turn_off_floor_lamp",
      stateKey: "floorLamp",
      val1: "on",
      val2: "off",
      checkAnim: () => {
        const r = document.getElementById("room");
        const glow = r ? r.querySelector(".lampglow") : null;
        return { active: r ? r.classList.contains("lamp-on") : false, detail: glow ? getComputedStyle(glow).opacity : "" };
      }
    },
    {
      name: "window",
      room: "living",
      objId: "window",
      act1: "open_window",
      act2: "close_window",
      stateKey: "window",
      val1: "open",
      val2: "closed",
      checkAnim: () => {
        const el = document.getElementById("o-window");
        const pane = document.getElementById("paneL");
        return { active: el ? el.classList.contains("win-open") : false, detail: pane ? getComputedStyle(pane).transform : "" };
      }
    },
    {
      name: "faucet",
      room: "kitchen",
      objId: "sink",
      act1: "turn_on_faucet",
      act2: "turn_off_faucet",
      stateKey: "k_faucet",
      val1: "on",
      val2: "off",
      checkAnim: () => {
        const w = document.getElementById("world");
        const water = document.querySelector("#room .k-water");
        return { active: w ? w.getAttribute("data-k_faucet") === "on" : false, detail: water ? getComputedStyle(water).opacity : "" };
      }
    },
    {
      name: "microwave",
      room: "kitchen",
      objId: "microwave",
      act1: "open_microwave",
      act2: "close_microwave",
      stateKey: "k_micro",
      val1: "open",
      val2: "closed",
      checkAnim: () => {
        const w = document.getElementById("world");
        const door = document.querySelector("#room .k-mwDoor");
        return { active: w ? w.getAttribute("data-k_micro") === "open" : false, detail: door ? getComputedStyle(door).transform : "" };
      }
    }
  ];

  for (const item of objectPairs) {
    console.log(`[5] Testing ${item.name} (${item.act1} <-> ${item.act2}) x 5 rounds via UI...`);
    const curRoom = await page.evaluate(() => window.ELW.state().room);
    if (curRoom !== item.room) {
      await page.click(`#roomTabs button[data-room="${item.room}"]`);
      await waitIdle(page);
    }
    await clickObjectInScene(page, item.objId);

    for (let r = 1; r <= 5; r++) {
      await clickActionBtn(page, item.act1);
      const s1 = await page.evaluate(
        ({ k, fnStr }) => {
          const fn = new Function(`return (${fnStr})()`);
          return { val: window.ELW.state()[k], anim: fn() };
        },
        { k: item.stateKey, fnStr: item.checkAnim.toString() }
      );
      assert(s1.val === item.val1, `${item.name} round ${r} act1: expected W.${item.stateKey}="${item.val1}", got "${s1.val}"`);
      assert(s1.anim.active === true, `${item.name} round ${r} act1: expected animation active=true, got ${JSON.stringify(s1.anim)}`);

      await clickActionBtn(page, item.act2);
      const s2 = await page.evaluate(
        ({ k, fnStr }) => {
          const fn = new Function(`return (${fnStr})()`);
          return { val: window.ELW.state()[k], anim: fn() };
        },
        { k: item.stateKey, fnStr: item.checkAnim.toString() }
      );
      assert(s2.val === item.val2, `${item.name} round ${r} act2: expected W.${item.stateKey}="${item.val2}", got "${s2.val}"`);
      assert(s2.anim.active === false, `${item.name} round ${r} act2: expected animation active=false, got ${JSON.stringify(s2.anim)}`);
    }
    summary.fiveObjects5Rounds[item.name] = { rounds: 5, passed: true };
    console.log(`  -> ${item.name} 5 rounds (10 UI actions) PASSED.`);
  }

  // =========================================================================
  // 6. Đổi phòng rồi quay lại vẫn chạy + Bấm nhanh liên tục không sai trạng thái
  // =========================================================================
  console.log("[6] Testing room switch (kitchen -> living) and rapid clicking guard...");
  await page.click('#roomTabs button[data-room="living"]');
  await waitIdle(page);
  await clickObjectInScene(page, "fridge");

  // Rapid clicks on open_fridge (6 times simultaneously)
  const rapidResult = await page.evaluate(() => {
    const btn = document.querySelector('#panel button[data-act="open_fridge"]');
    for (let i = 0; i < 6; i++) {
      if (btn) btn.click();
      window.ELW.enqueue("open_fridge");
    }
    const pendingOrRunning = window.ELW.queue().filter((q) => q.id === "open_fridge" && (q.status === "pending" || q.status === "running")).length;
    return { pendingOrRunning };
  });
  assert(rapidResult.pendingOrRunning === 1, `Expected at most 1 pending/running open_fridge during rapid click burst, got ${rapidResult.pendingOrRunning}`);
  await waitIdle(page);

  const afterRapid = await page.evaluate(() => {
    // Also trigger actClick when already open to verify reason toast
    if (typeof window.actClick === "function") window.actClick("open_fridge");
    return {
      wFridge: window.ELW.state().fridge,
      guideText: (document.getElementById("guideText") || {}).textContent || "",
      openBtnDisabled: document.querySelector('#panel button[data-act="open_fridge"]').disabled
    };
  });
  assert(afterRapid.wFridge === "open", `Expected W.fridge="open" after rapid clicks, got "${afterRapid.wFridge}"`);
  assert(afterRapid.guideText.includes("Tủ lạnh đang mở rồi"), `Expected clear reason in #guideText, got "${afterRapid.guideText}"`);
  await clickActionBtn(page, "close_fridge");
  summary.rapidClickGuard = { pendingOrRunningDuringBurst: rapidResult.pendingOrRunning, afterRapid };
  summary.roomSwitchAndReturn = { switchedFromKitchenToLiving: true, fridgeWorkedAfterReturn: true };
  console.log("  -> Room switch & rapid click guard PASSED.");

  // =========================================================================
  // 7. Chip Cô Mai gọi enqueue không gây trùng câu trong "Phần đoạn văn của tôi"
  // =========================================================================
  console.log("[7] Testing Cô Mai suggestion chip does not cause duplicate story sentences...");
  const coMaiCheck = await page.evaluate(() => {
    window.ELW.enqueue("open_fridge");
    return true;
  });
  await waitIdle(page);
  await clickActionBtn(page, "close_fridge");
  const storyAfterCoMai = await page.evaluate(() => {
    const smSimpleBtn = document.querySelector('#storyCard [data-sm="simple"]');
    if (smSimpleBtn) smSimpleBtn.click();
    const sents = window.ELW.storyFinal().map((x) => x.en);
    const uniqueCount = new Set(sents).size;
    return { totalSentences: sents.length, uniqueSentences: uniqueCount, sents };
  });
  assert(storyAfterCoMai.totalSentences === storyAfterCoMai.uniqueSentences, `Duplicate sentences found in story: ${JSON.stringify(storyAfterCoMai.sents)}`);
  summary.coMaiChipNoDuplicate = storyAfterCoMai;
  console.log("  -> Cô Mai / enqueue deduplication PASSED.");

  // =========================================================================
  // 8. Nhiệm vụ breakfast, cafe_order_latte, market_weekly_shopping vẫn complete
  // =========================================================================
  const missionIds = ["breakfast", "cafe_order_latte", "market_weekly_shopping"];
  for (const mId of missionIds) {
    console.log(`[8] Testing mission "${mId}" auto completion...`);
    await page.evaluate((id) => {
      window.ELW_MISSION.start(id);
      window.ELW_MISSION.auto();
    }, mId);

    const t0 = Date.now();
    let mDone = false;
    while (Date.now() - t0 < 35000) {
      const st = await page.evaluate(() => {
        const s = window.ELW_MISSION.state();
        return { complete: Boolean(s && s.complete), rejected: s && s.rejected, activeN: s && s.activeN };
      });
      if (st.complete) {
        mDone = true;
        break;
      }
      if (st.rejected) {
        throw new Error(`Mission ${mId} rejected at step ${st.activeN}: ${JSON.stringify(st.rejected)}`);
      }
      await page.waitForTimeout(80);
    }
    assert(mDone, `Mission ${mId} did not complete within timeout`);
    await waitIdle(page);
    const mView = await page.evaluate(() => window.ELW_MISSION.view(window.ELW.state()));
    summary.missions[mId] = {
      complete: mView.complete,
      stepsDone: mView.steps.filter((s) => s.status === "done").length,
      totalSteps: mView.steps.length,
      resultEn: mView.result ? mView.result.en : ""
    };
    console.log(`  -> Mission "${mId}" COMPLETED (${summary.missions[mId].stepsDone}/${summary.missions[mId].totalSteps} steps).`);
  }

  // =========================================================================
  // 9. Kiểm tra 3 tab trên Mobile 390px (play, learn, mission)
  // =========================================================================
  console.log("[9] Testing 3 tabs on Mobile 390x844 viewport...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(200);
  const mobileTabsResult = {};
  for (const tabId of ["play", "learn", "mission"]) {
    await page.evaluate((t) => {
      const mBtn = document.querySelector(`#uimb-bar [data-tab="${t}"]`) || document.querySelector(`#w3dModeTabs [data-mtab="${t}"]`);
      if (mBtn) mBtn.click();
      else if (window.ELW_WORLD3D && window.ELW_WORLD3D.setTab) window.ELW_WORLD3D.setTab(t);
    }, tabId);
    await page.waitForTimeout(120);
    const info = await page.evaluate((t) => {
      const activeTab = window.ELW_WORLD3D.getTab();
      const quickHidden = document.getElementById("quickCard").classList.contains("w3d-tab-hidden") || document.getElementById("quickCard").classList.contains("uimb-tab-hidden");
      const storyHidden = document.getElementById("storyCard").classList.contains("w3d-tab-hidden") || document.getElementById("storyCard").classList.contains("uimb-tab-hidden");
      const missionHidden = document.getElementById("missionCard").classList.contains("w3d-tab-hidden") || document.getElementById("missionCard").classList.contains("uimb-tab-hidden");
      const overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      return { activeTab, quickHidden, storyHidden, missionHidden, overflowX };
    }, tabId);
    assert(info.activeTab === tabId, `Expected active tab ${tabId}, got ${info.activeTab}`);
    if (tabId === "play") assert(!info.quickHidden && info.storyHidden && info.missionHidden, `Expected play cards visible on play tab: ${JSON.stringify(info)}`);
    if (tabId === "learn") assert(!info.storyHidden && info.quickHidden && info.missionHidden, `Expected learn cards visible on learn tab: ${JSON.stringify(info)}`);
    if (tabId === "mission") assert(!info.missionHidden && info.quickHidden && info.storyHidden, `Expected mission cards visible on mission tab: ${JSON.stringify(info)}`);
    assert(info.overflowX <= 2, `Expected no horizontal overflow on mobile 390px (${tabId}), got overflowX=${info.overflowX}`);
    mobileTabsResult[tabId] = info;
  }
  summary.mobile390Tabs = mobileTabsResult;
  console.log("  -> Mobile 390px 3-tab check PASSED.");

  summary.jsErrorsCount = jsErrors.length;
  assert(jsErrors.length === 0, `Expected 0 JS errors, got: ${JSON.stringify(jsErrors)}`);

  await browser.close();
  console.log("\n=== ALL REPEAT ACTION & REGRESSION TESTS PASSED ===");
  console.log(JSON.stringify(summary, null, 2));
}

run().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
