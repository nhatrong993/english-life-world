#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
English Life World — Automated Playwright QA Suite for Pet System v2.0 (T1–T8)
==============================================================================
Kiểm thử toàn diện hệ thống Thú Cưng & Pet Adventure (Milu + 9 Pets = 100 Sprites)
trên trình duyệt Chromium thật (Playwright):

  - T1: Asset Integrity & Manifest Validation (100 PNGs 320x320 RGBA, alpha transparency, Chromium Image load)
  - T2: Pet Roster (2 Free + 8 Premium), Selection & Reload Persistence
  - T3: 5-Need Engine (0..100), 48h Offline Decay Floor (25), Bond No-Decay & Zero Penalty
  - T4: 8 Interactive Actions, CSS Keyframe Animations, prefers-reduced-motion & Broken Sprite Fallback
  - T5: Unified Pet Adventure System (Entry Point 1 #ctxBtnDog & Entry Point 2 #o-cat -> walk,
        8-Part getUnifiedSystemState, Dynamic Context across Topic/Weather/Situation, 3/3 Quest Completion)
  - T6: One-Time Reward Ledger & Anti-Farm Guard across Page Reload
  - T7: Premium Gating (8 Pets Locked), Honest Preview Modal & Tamper Sanitization on Reload
  - T8: Zero Regression on Existing App Features (Topics, #ctxBar, ELW_CHALLENGE, ELW_GAME, ELW_SRS, Single-file Bundle)
"""

import json
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

# Ensure UTF-8 stdout on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
INDEX_HTML = ROOT / "index.html"
BUNDLE_HTML = ROOT / "english-life-world-ban-day-du.html"
MANIFEST_PATH = ROOT / "assets" / "pets" / "manifest.json"

EXPECTED_PETS = [
    "milu", "mochi", "boba", "cookie", "pepper",
    "oreo", "ember", "lumi", "pip", "aqua"
]
FREE_PETS = ["milu", "mochi"]
PREMIUM_PETS = ["boba", "cookie", "pepper", "oreo", "ember", "lumi", "pip", "aqua"]
EXPECTED_STATES = [
    "idle_happy", "curious", "playful", "eating", "drinking",
    "sleepy", "tired", "sad_lonely", "excited", "walking_adventure"
]
EXPECTED_ACTIONS = ["pet", "play", "feed", "water", "rest", "talk", "walk", "profile"]
UNIFIED_STATE_KEYS = [
    "activePetId", "adventureSession", "context", "validator",
    "needs", "inventory", "dialogue", "rewardLedger"
]

results = []


def record(group: str, check_id: str, description: str, passed: bool, detail: str = ""):
    status = "PASS" if passed else "FAIL"
    results.append({
        "group": group,
        "id": check_id,
        "description": description,
        "passed": bool(passed),
        "detail": detail,
    })
    suffix = f" ({detail})" if detail else ""
    print(f"  [{status}] {check_id}: {description}{suffix}")


def expand_ctx_bar_if_needed(page):
    """Ensure #ctxBar is expanded so #ctxBtnDog and #ctxBtnLinh are rendered in DOM."""
    page.evaluate("""() => {
        const bar = document.getElementById('ctxBar');
        if (bar && bar.classList.contains('is-collapsed')) {
            const btn = document.getElementById('ctxToggleBtn');
            if (btn) btn.click();
        }
    }""")


def open_pet_tab_if_needed(page):
    """Ensure welcome modal is dismissed and Mission & Pet sidebar tab is active so #petSurvivalCard is visible."""
    page.evaluate("""() => {
        try { localStorage.setItem('elw_onboard_v1', '1'); } catch (e) {}
        const w = document.getElementById('elwWelcome');
        if (w) { w.hidden = true; w.remove(); }
        if (window.ELW_WORLD3D && typeof window.ELW_WORLD3D.setTab === 'function') {
            window.ELW_WORLD3D.setTab('mission');
        }
        const mtab = document.querySelector('.w3d-mtab[data-mtab="mission"]');
        if (mtab) mtab.click();
        const card = document.getElementById('petSurvivalCard');
        if (card) card.classList.remove('w3d-tab-hidden');
    }""")


def run_t1_assets_and_manifest(page):
    print("\n=== T1: Asset Integrity & Manifest Validation (100 Base + 50 Stage Sprites) ===")
    exists = MANIFEST_PATH.is_file()
    record("T1", "T1.1", "assets/pets/manifest.json exists on disk", exists, str(MANIFEST_PATH))
    if not exists:
        return

    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    record("T1", "T1.2", "manifest.json is a JSON Array of 100+ entries (100 base + 50 stage)",
           isinstance(manifest, list) and len(manifest) in (100, 150),
           f"count={len(manifest) if isinstance(manifest, list) else 'not-list'}")

    required_fields = {
        "petId", "state", "assetPath", "format", "width", "height",
        "fileSize", "transparent", "animationType", "fallbackState", "verified"
    }
    all_fields_ok = all(required_fields.issubset(set(item.keys())) for item in manifest)
    record("T1", "T1.3", "All manifest items contain 11 required schema fields", all_fields_ok)

    pet_set = {item["petId"] for item in manifest}
    state_set = {item["state"] for item in manifest if item["state"] in EXPECTED_STATES}
    record("T1", "T1.4", "Manifest covers all 10 pets × 10 canonical states",
           pet_set == set(EXPECTED_PETS) and state_set == set(EXPECTED_STATES),
           f"pets={len(pet_set)}, states={len(state_set)}")

    disk_ok = True
    rgba_ok = True
    alpha_ok = True
    bad_files = []

    for item in manifest:
        fpath = ROOT / item["assetPath"]
        if not fpath.is_file() or fpath.stat().st_size <= 500:
            disk_ok = False
            bad_files.append(item["assetPath"])
            continue
        with Image.open(fpath) as im:
            if im.mode != "RGBA" or im.size != (320, 320):
                rgba_ok = False
                bad_files.append(f"{item['assetPath']}({im.mode},{im.size})")
            alpha_extrema = im.getchannel("A").getextrema()
            # Must have transparent background pixels (min alpha == 0) and visible foreground pixels (max alpha > 200)
            if not (alpha_extrema[0] == 0 and alpha_extrema[1] >= 200):
                alpha_ok = False
                bad_files.append(f"{item['assetPath']}(alpha={alpha_extrema})")

    record("T1", "T1.5", "All PNG files exist on disk with size > 500 bytes", disk_ok,
           f"{len(manifest)}/{len(manifest)} files OK" if disk_ok else f"bad: {bad_files[:3]}")
    record("T1", "T1.6", "All PNGs are 320x320 RGBA with real alpha transparency",
           rgba_ok and alpha_ok,
           "320x320 RGBA + transparent background verified" if (rgba_ok and alpha_ok) else f"bad: {bad_files[:3]}")

    # Verify all sprites load cleanly inside Chromium via Image()
    browser_load = page.evaluate("""async (paths) => {
        const results = await Promise.all(paths.map(p => new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve({
                path: p,
                ok: img.complete && img.naturalWidth === 320 && img.naturalHeight === 320,
                w: img.naturalWidth,
                h: img.naturalHeight
            });
            img.onerror = () => resolve({ path: p, ok: false, w: 0, h: 0 });
            img.src = p;
        })));
        const failed = results.filter(r => !r.ok);
        return { total: results.length, passed: results.length - failed.length, failed };
    }""", [item["assetPath"] for item in manifest])

    record("T1", "T1.7", "All PNG sprites decode in Chromium with naturalWidth=320 & naturalHeight=320",
           browser_load["passed"] == browser_load["total"] and browser_load["total"] >= 100,
           f"{browser_load['passed']}/{browser_load['total']} loaded")


def run_t2_roster_selection_persistence(page):
    print("\n=== T2: Pet Roster, Selection & Persistence ===")
    # Reset storage to clean state first
    page.evaluate("""() => {
        localStorage.removeItem('elw_pro_v1');
        localStorage.removeItem('elw_pet_needs_v2');
        localStorage.removeItem('elw_pet_v1');
        if (window.ELW_PET_NEEDS && window.ELW_PET_NEEDS.resetForTest) {
            window.ELW_PET_NEEDS.resetForTest();
        }
        if (window.ELW_PET_UI && window.ELW_PET_UI.refresh) {
            window.ELW_PET_UI.refresh();
        }
    }""")

    roster_info = page.evaluate("""() => {
        const roster = window.ELW_PET.getRoster();
        const free = roster.filter(p => p.tier === 'free').map(p => p.id);
        const premium = roster.filter(p => p.tier === 'premium').map(p => p.id);
        const cards = Array.from(document.querySelectorAll('#petCollectionGrid [data-pet-card]'));
        const freeCards = cards.filter(c => c.getAttribute('data-pet-tier') === 'free');
        const premCards = cards.filter(c => c.getAttribute('data-pet-tier') === 'premium');
        return {
            total: roster.length,
            free,
            premium,
            cardCount: cards.length,
            freeCardCount: freeCards.length,
            premCardCount: premCards.length,
            defaultActive: window.ELW_PET.getActivePetId()
        };
    }""")

    record("T2", "T2.1", "ELW_PET.getRoster() returns 10 pets (2 free: milu, mochi + 8 premium)",
           roster_info["total"] == 10 and set(roster_info["free"]) == set(FREE_PETS) and len(roster_info["premium"]) == 8,
           f"free={roster_info['free']}, premium={len(roster_info['premium'])}")

    record("T2", "T2.2", "#petCollectionGrid renders 10 pet cards in DOM (2 free, 8 premium)",
           roster_info["cardCount"] == 10 and roster_info["freeCardCount"] == 2 and roster_info["premCardCount"] == 8,
           f"cards={roster_info['cardCount']} (free={roster_info['freeCardCount']}, premium={roster_info['premCardCount']})")

    record("T2", "T2.3", "Default active pet is 'milu' (Golden Puppy)",
           roster_info["defaultActive"] == "milu",
           f"activePetId={roster_info['defaultActive']}")

    # Switch to free pet 'mochi' via UI button click
    open_pet_tab_if_needed(page)
    page.locator('#petCollectionGrid [data-pet-select="mochi"]').click()
    after_switch = page.evaluate("""() => ({
        activeId: window.ELW_PET.getActivePetId(),
        nameText: (document.getElementById('petActiveName') || {}).textContent || '',
        spriteSrc: (document.querySelector('#petSurvivalCard .pet-sprite-img') || {}).getAttribute('src') || ''
    })""")

    record("T2", "T2.4", "Clicking [data-pet-select='mochi'] switches active pet to Mochi and updates sprite",
           after_switch["activeId"] == "mochi" and "Mochi" in after_switch["nameText"] and "assets/pets/mochi/" in after_switch["spriteSrc"],
           f"activeId={after_switch['activeId']}, src={after_switch['spriteSrc']}")

    # Reload page and verify Mochi persists
    page.reload(wait_until="domcontentloaded")
    page.wait_for_timeout(300)

    after_reload = page.evaluate("""() => ({
        activeId: window.ELW_PET.getActivePetId(),
        nameText: (document.getElementById('petActiveName') || {}).textContent || '',
        spriteSrc: (document.querySelector('#petSurvivalCard .pet-sprite-img') || {}).getAttribute('src') || ''
    })""")

    record("T2", "T2.5", "Active pet 'mochi' persists across page reload in engine & UI",
           after_reload["activeId"] == "mochi" and "Mochi" in after_reload["nameText"] and "assets/pets/mochi/" in after_reload["spriteSrc"],
           f"activeId={after_reload['activeId']}, src={after_reload['spriteSrc']}")

    # Switch back to 'milu' for subsequent tests
    page.evaluate("() => window.ELW_PET.selectPet('milu')")


def run_t3_needs_decay_and_zero_penalty(page):
    print("\n=== T3: 5-Need Engine, 48h Decay Floor (25) & Zero Penalty ===")
    needs_initial = page.evaluate("""() => {
        window.ELW_PET_NEEDS.resetForTest();
        if (window.ELW_PET_UI && window.ELW_PET_UI.refresh) window.ELW_PET_UI.refresh();
        const n = window.ELW_PET.getNeeds();
        const bars = ['energy', 'hunger', 'thirst', 'fun', 'bond'].map(k => !!document.querySelector(`[data-need-bar="${k}"]`));
        return { needs: n, allBarsPresent: bars.every(Boolean) };
    }""")

    n0 = needs_initial["needs"]
    in_range = all(isinstance(n0.get(k), (int, float)) and 0 <= n0[k] <= 100 for k in ["energy", "hunger", "thirst", "fun", "bond"])
    record("T3", "T3.1", "All 5 needs (energy, hunger, thirst, fun, bond) are valid in range 0..100 & rendered in DOM",
           in_range and needs_initial["allBarsPresent"],
           f"energy={n0.get('energy')}, hunger={n0.get('hunger')}, thirst={n0.get('thirst')}, fun={n0.get('fun')}, bond={n0.get('bond')}")

    # Simulate 48 hours offline decay and verify 6h cap + OFFLINE_FLOOR = 25 clamp, bond never decays, stars & streak untouched
    decay_check = page.evaluate("""() => {
        localStorage.setItem('elw_s', '250');
        localStorage.setItem('elw_str', '9');
        const raw = JSON.parse(localStorage.getItem('elw_pet_needs_v2') || '{}');
        const bondBefore = (raw.needs && raw.needs.bond) || 50;
        // Start from 35 so 48h offline tests that decay clamps strictly at OFFLINE_FLOOR = 25 (never 0)
        raw.needs = { energy: 35, hunger: 35, thirst: 35, fun: 35, bond: bondBefore, lastUpdatedAt: Date.now() - (48 * 3600 * 1000) };
        raw.lastUpdatedAt = Date.now() - (48 * 3600 * 1000);
        localStorage.setItem('elw_pet_needs_v2', JSON.stringify(raw));

        window.ELW_PET_NEEDS.applyOfflineDecay();
        const n = window.ELW_PET.getNeeds();
        return {
            needs: n,
            bondBefore,
            starsAfter: Number(localStorage.getItem('elw_s')),
            streakAfter: Number(localStorage.getItem('elw_str'))
        };
    }""")

    nd = decay_check["needs"]
    floor_ok = all(nd[k] == 25 for k in ["energy", "hunger", "thirst", "fun"])
    bond_ok = nd["bond"] >= decay_check["bondBefore"]
    zero_penalty_ok = decay_check["starsAfter"] == 250 and decay_check["streakAfter"] == 9

    record("T3", "T3.2", "After 48h offline, energy/hunger/thirst/fun clamp at OFFLINE_FLOOR = 25 (never 0)",
           floor_ok,
           f"energy={nd['energy']}, hunger={nd['hunger']}, thirst={nd['thirst']}, fun={nd['fun']}")
    record("T3", "T3.3", "Bond never decays offline and user stars/streak suffer zero negative penalty",
           bond_ok and zero_penalty_ok,
           f"bond={nd['bond']} (before={decay_check['bondBefore']}), stars={decay_check['starsAfter']}, streak={decay_check['streakAfter']}")

    # State derivation priority check
    derived_states = page.evaluate("""() => {
        const api = window.ELW_PET_NEEDS;
        const sTired   = api.deriveVisualState({ energy: 25, hunger: 80, thirst: 80, fun: 80, bond: 50 }, null);
        const sSleepy  = api.deriveVisualState({ energy: 35, hunger: 80, thirst: 80, fun: 80, bond: 50 }, null);
        const sLonely  = api.deriveVisualState({ energy: 80, hunger: 28, thirst: 80, fun: 80, bond: 50 }, null);
        const sExcited = api.deriveVisualState({ energy: 90, hunger: 90, thirst: 90, fun: 90, bond: 80 }, null);
        const sHappy   = api.deriveVisualState({ energy: 75, hunger: 75, thirst: 75, fun: 70, bond: 50 }, null);
        return { sTired, sSleepy, sLonely, sExcited, sHappy };
    }""")

    record("T3", "T3.4", "deriveVisualState accurately maps low needs & high needs to canonical sprite states",
           derived_states["sTired"] == "tired"
           and derived_states["sSleepy"] == "sleepy"
           and derived_states["sLonely"] == "sad_lonely"
           and derived_states["sExcited"] == "excited"
           and derived_states["sHappy"] == "idle_happy",
           str(derived_states))


def run_t4_interactions_animations_and_fallback(page):
    print("\n=== T4: 8 Interactive Actions, Animations, Reduced Motion & Error Fallback ===")
    # Ensure we are in Home room, welcome dialog is dismissed, and click #o-cat
    page.evaluate("""() => {
        try { localStorage.setItem('elw_onboard_v1', '1'); } catch (e) {}
        const w = document.getElementById('elwWelcome');
        if (w) { w.hidden = true; w.remove(); }
        window.ELW_PET_NEEDS.resetForTest();
        if (typeof window.pickTopic === 'function') window.pickTopic('home');
    }""")
    page.wait_for_timeout(150)

    cat_exists = page.locator("#o-cat").count() > 0
    if cat_exists:
        page.evaluate("""() => {
            const c = document.getElementById('o-cat');
            if (c) c.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }""")
    page.wait_for_timeout(150)

    quick_bar_info = page.evaluate("""(expectedActions) => {
        const qb = document.getElementById('petSceneQuickBar');
        if (!qb) return { exists: false, actions: [] };
        const found = expectedActions.filter(a => !!qb.querySelector(`[data-pet-act="${a}"]`));
        return { exists: true, actions: found };
    }""", EXPECTED_ACTIONS)

    record("T4", "T4.1", "Clicking #o-cat in Home room opens #petSceneQuickBar with all 8 [data-pet-act] buttons",
           quick_bar_info["exists"] and len(quick_bar_info["actions"]) == 8,
           f"found={quick_bar_info['actions']}")

    # Execute all 8 interactive actions and verify response + animation state classes
    actions_result = page.evaluate("""(actions) => {
        const log = {};
        // Ensure plenty of inventory items for feed/water/play
        if (window.ELW_PET_NEEDS && window.ELW_PET_NEEDS.addInventoryItem) {
            window.ELW_PET_NEEDS.addInventoryItem('treats', 5);
            window.ELW_PET_NEEDS.addInventoryItem('water', 5);
            window.ELW_PET_NEEDS.addInventoryItem('toys', 5);
        }
        for (const act of actions) {
            const res = window.ELW_PET.interact(act, { entrySource: 'home_pet_click' });
            const stage = document.querySelector('#petSurvivalCard .pet-sprite-stage');
            const stageClasses = stage ? stage.className : '';
            log[act] = {
                ok: !!(res && res.ok !== false),
                visualState: res && res.visualState,
                stageClasses
            };
        }
        const profileModal = document.getElementById('petProfileModal');
        const profileOpened = !!(profileModal && profileModal.classList.contains('is-open'));
        if (window.ELW_PET_UI && window.ELW_PET_UI.closeModals) {
            window.ELW_PET_UI.closeModals();
        }
        return { log, profileOpened };
    }""", EXPECTED_ACTIONS)

    all_8_ok = all(actions_result["log"][a]["ok"] for a in EXPECTED_ACTIONS)
    record("T4", "T4.2", "All 8 interactive actions (pet, play, feed, water, rest, talk, walk, profile) execute cleanly",
           all_8_ok and actions_result["profileOpened"],
           f"8/8 actions OK, profileModalOpened={actions_result['profileOpened']}")

    # Emulate prefers-reduced-motion: reduce and verify CSS disables sprite keyframe animation
    page.emulate_media(reduced_motion="reduce")
    page.wait_for_timeout(100)
    reduced_motion_ok = page.evaluate("""() => {
        const img = document.querySelector('#petSurvivalCard .pet-sprite-img');
        if (!img) return false;
        const cs = window.getComputedStyle(img);
        return cs.animationName === 'none' || parseFloat(cs.animationDuration || '0') <= 0.02;
    }""")
    page.emulate_media(reduced_motion="no-preference")

    record("T4", "T4.3", "prefers-reduced-motion: reduce disables continuous CSS keyframe animations on .pet-sprite-img",
           reduced_motion_ok)

    # Test broken sprite fallback to idle_happy.png + data-fallback-applied="1"
    fallback_info = page.evaluate("""async () => {
        const img = document.querySelector('#petSurvivalCard .pet-sprite-img');
        if (!img) return { ok: false };
        img.removeAttribute('data-fallback-applied');
        img.removeAttribute('data-fallback-tried');
        await new Promise(resolve => {
            const done = () => setTimeout(resolve, 80);
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            img.src = 'assets/pets/milu/nonexistent_corrupted_state.png';
        });
        return {
            src: img.getAttribute('src') || '',
            fallbackAttr: img.getAttribute('data-fallback-applied'),
            naturalWidth: img.naturalWidth
        };
    }""")

    record("T4", "T4.4", "Broken sprite src gracefully falls back to idle_happy.png with data-fallback-applied='1'",
           "idle_happy.png" in fallback_info.get("src", "")
           and fallback_info.get("fallbackAttr") == "1"
           and fallback_info.get("naturalWidth") == 320,
           f"src={fallback_info.get('src')}, attr={fallback_info.get('fallbackAttr')}, w={fallback_info.get('naturalWidth')}")


def run_t5_unified_adventure_system(page):
    print("\n=== T5: Unified Pet Adventure System (2 Entry Points -> 1 Shared Engine & 3/3 Quest) ===")
    # Reset adventure & reward ledger for clean T5 verification
    page.evaluate("""() => {
        if (typeof window.pickTopic === 'function') window.pickTopic('home');
        if (window.ELW_PET && window.ELW_PET.selectPet) window.ELW_PET.selectPet('milu');
        if (window.ELW_PET_REWARDS && window.ELW_PET_REWARDS.resetForTest) window.ELW_PET_REWARDS.resetForTest();
        if (window.ELW_PET_ADVENTURE && window.ELW_PET_ADVENTURE.resetForTest) window.ELW_PET_ADVENTURE.resetForTest();
        if (window.ELW_CONTEXT && window.ELW_CONTEXT.setWalkDog) window.ELW_CONTEXT.setWalkDog(false);
    }""")
    page.wait_for_timeout(150)

    # Expand #ctxBar if collapsed and click #ctxBtnDog (Entry Point 1)
    expand_ctx_bar_if_needed(page)
    page.locator("#ctxBtnDog").click()
    page.wait_for_timeout(150)

    state_ep1 = page.evaluate("""() => {
        const st = window.ELW_PET_ADVENTURE.getUnifiedSystemState();
        return {
            keys: Object.keys(st),
            activePetId: st.activePetId,
            sessionId: st.adventureSession.sessionId,
            active: st.adventureSession.active,
            entrySources: st.adventureSession.entrySources,
            withPet: st.context.withPet,
            hudVisible: !!(document.getElementById('petAdventureHud') && !document.getElementById('petAdventureHud').hidden)
        };
    }""")

    has_all_8_keys = all(k in state_ep1["keys"] for k in UNIFIED_STATE_KEYS)
    record("T5", "T5.1", "getUnifiedSystemState() exposes all 8 shared components",
           has_all_8_keys,
           f"keys={state_ep1['keys']}")

    record("T5", "T5.2", "Entry Point 1 (#ctxBtnDog) activates shared adventureSession & #petAdventureHud",
           state_ep1["active"] is True
           and "context_bar" in state_ep1["entrySources"]
           and state_ep1["withPet"] is True
           and state_ep1["hudVisible"] is True,
           f"sessionId={state_ep1['sessionId']}, sources={state_ep1['entrySources']}")

    # Trigger Entry Point 2: Click #o-cat in Home room -> click [data-pet-act="walk"] in #petSceneQuickBar
    page.locator("#o-cat").click(force=True)
    page.wait_for_timeout(100)
    page.locator('#petSceneQuickBar [data-pet-act="walk"]').click()
    page.wait_for_timeout(150)

    state_ep2 = page.evaluate("""() => {
        const st = window.ELW_PET_ADVENTURE.getUnifiedSystemState();
        return {
            sessionId: st.adventureSession.sessionId,
            active: st.adventureSession.active,
            entrySources: st.adventureSession.entrySources,
            lastEntrySource: st.adventureSession.lastEntrySource
        };
    }""")

    same_session = state_ep2["sessionId"] == state_ep1["sessionId"]
    both_sources = (
        "context_bar" in state_ep2["entrySources"]
        and ("home_pet" in state_ep2["entrySources"] or "home_pet_click" in state_ep2["entrySources"])
    )
    record("T5", "T5.3", "Entry Point 2 (#o-cat -> walk) shares the EXACT same sessionId & merges entrySources",
           same_session and both_sources,
           f"sessionId={state_ep2['sessionId']}, entrySources={state_ep2['entrySources']}")

    # Switch topic to 'park' and weather to 'rainy' -> verify dynamic context & dialogue adaptation
    ctx_adaptation = page.evaluate("""() => {
        if (typeof window.pickTopic === 'function') window.pickTopic('park');
        if (window.ELW_CONTEXT && window.ELW_CONTEXT.setWeather) window.ELW_CONTEXT.setWeather('rainy');
        const st = window.ELW_PET_ADVENTURE.getUnifiedSystemState({ place: 'park', weather: 'rainy' });
        const objs = st.adventureSession.objectives || [];
        return {
            place: st.context.place,
            weather: st.context.weather,
            objCount: objs.length,
            greetEn: objs[0] ? objs[0].sentenceEn : '',
            practiceEn: objs[2] ? objs[2].sentenceEn : '',
            dialogueCount: Array.isArray(st.dialogue) ? st.dialogue.length : 0
        };
    }""")

    record("T5", "T5.4", "Switching topic='park' & weather='rainy' dynamically updates 3 objectives & pet dialogue",
           ctx_adaptation["place"] == "park"
           and ctx_adaptation["weather"] == "rainy"
           and ctx_adaptation["objCount"] == 3
           and ("rain" in ctx_adaptation["greetEn"].lower() or "park" in ctx_adaptation["greetEn"].lower())
           and ctx_adaptation["dialogueCount"] >= 3,
           f"place={ctx_adaptation['place']}, wx={ctx_adaptation['weather']}, greet='{ctx_adaptation['greetEn'][:48]}...'")

    # Complete all 3 objectives at 'park' and verify 3/3 quest completion & result summary banner
    quest_completion = page.evaluate("""() => {
        window.ELW_PET_ADVENTURE.completeObjective('greet_context');
        window.ELW_PET_ADVENTURE.completeObjective('care_bond');
        window.ELW_PET_ADVENTURE.completeObjective('contextual_practice');
        if (window.ELW_PET_UI && window.ELW_PET_UI.refresh) window.ELW_PET_UI.refresh();
        const st = window.ELW_PET_ADVENTURE.getUnifiedSystemState();
        const resEl = document.getElementById('petAdventureResult');
        return {
            completedObjectives: Array.from(st.adventureSession.completedObjectives || []),
            isComplete: st.adventureSession.isComplete,
            hasSummary: !!st.adventureSession.resultSummary,
            headlineVi: st.adventureSession.resultSummary ? st.adventureSession.resultSummary.headlineVi : '',
            bannerVisible: !!(resEl && !resEl.hidden && resEl.textContent.trim().length > 0)
        };
    }""")

    record("T5", "T5.5", "Completing all 3 objectives marks adventureSession.isComplete=true & renders #petAdventureResult",
           len(quest_completion["completedObjectives"]) == 3
           and quest_completion["isComplete"] is True
           and quest_completion["hasSummary"] is True
           and quest_completion["bannerVisible"] is True,
           f"completed={quest_completion['completedObjectives']}, banner='{quest_completion['headlineVi']}'")

    # Verify Lv.2 -> Lv.3 quest reset & evolution progression
    stage_evo_check = page.evaluate("""() => {
        // Ensure pet has 250 XP (ready for Lv.3 once Lv.2 care, interaction, and 2nd stageMission are done)
        window.ELW_PET_NEEDS.addXp(250);
        window.ELW_PET_NEEDS.recordCareAction({ type: 'feed' });
        window.ELW_PET_NEEDS.recordInteraction({ type: 'play' });
        if (window.ELW_PET_UI && window.ELW_PET_UI.refresh) window.ELW_PET_UI.refresh();
        const evoPanelBefore = document.querySelector('#petSurvivalCard .evo-panel');
        const evoPanelVisible = !!(evoPanelBefore && evoPanelBefore.textContent.includes('Lv.3'));

        // Start a new Lv.2 quest at park (0/3)
        const resetSession = window.ELW_PET_ADVENTURE.travelToQuestPlace('park');
        const resetCount = (resetSession.completedObjectives || []).length;

        // Complete the 3 Lv.2 objectives
        window.ELW_PET_ADVENTURE.completeObjective('greet_context');
        window.ELW_PET_ADVENTURE.completeObjective('care_bond');
        window.ELW_PET_ADVENTURE.completeObjective('contextual_practice');

        const snapAfter = window.ELW_PET_NEEDS.getSnapshot();
        return {
            evoPanelVisible,
            resetCount,
            isCompleteAfter: window.ELW_PET_ADVENTURE.getSharedSession().isComplete,
            levelAfter: snapAfter.level,
            stageAfter: snapAfter.stage,
            missionsAfter: snapAfter.progression.stageMissions
        };
    }""")

    record("T5", "T5.6", "Lv.2 quest resets to 0/3 at Park, displays .evo-panel, and completing 3/3 evolves Pet to Lv.3 (teen)",
           stage_evo_check["evoPanelVisible"] is True
           and stage_evo_check["resetCount"] == 0
           and stage_evo_check["isCompleteAfter"] is True
           and stage_evo_check["levelAfter"] >= 3,
           f"resetCount={stage_evo_check['resetCount']}, levelAfter={stage_evo_check['levelAfter']}({stage_evo_check['stageAfter']}), missions={stage_evo_check['missionsAfter']}")


def run_t6_one_time_reward_ledger(page):
    print("\n=== T6: One-Time Reward Ledger & Anti-Farm Guard Across Reload ===")
    claim_test = page.evaluate("""() => {
        localStorage.setItem('elw_s', '300');
        const invBefore = window.ELW_PET.getInventory();
        const treatsBefore = invBefore.treats;
        const starsBefore = Number(localStorage.getItem('elw_s'));

        const key = 'cafe:contextual_practice';
        const spec = { stars: 15, xp: 20, treats: 2, water: 1, toys: 1, bond: 5 };

        const claim1 = window.ELW_PET.claimObjectiveReward(key, spec);
        const starsAfter1 = Number(localStorage.getItem('elw_s'));
        const treatsAfter1 = window.ELW_PET.getInventory().treats;

        // Immediate duplicate claim attempt
        const claim2 = window.ELW_PET.claimObjectiveReward(key, spec);
        const starsAfter2 = Number(localStorage.getItem('elw_s'));
        const treatsAfter2 = window.ELW_PET.getInventory().treats;

        return {
            starsBefore, treatsBefore,
            claim1, starsAfter1, treatsAfter1,
            claim2, starsAfter2, treatsAfter2
        };
    }""")

    first_claim_ok = (
        claim_test["claim1"]["granted"] is True
        and claim_test["claim1"]["duplicate"] is False
        and claim_test["starsAfter1"] == claim_test["starsBefore"] + 15
        and claim_test["treatsAfter1"] == claim_test["treatsBefore"] + 2
    )
    second_claim_blocked = (
        claim_test["claim2"]["granted"] is False
        and claim_test["claim2"]["duplicate"] is True
        and claim_test["starsAfter2"] == claim_test["starsAfter1"]
        and claim_test["treatsAfter2"] == claim_test["treatsAfter1"]
    )

    record("T6", "T6.1", "First claim of objective Key grants +15 stars & +2 treats accurately",
           first_claim_ok,
           f"stars: {claim_test['starsBefore']} -> {claim_test['starsAfter1']}, treats: {claim_test['treatsBefore']} -> {claim_test['treatsAfter1']}")
    record("T6", "T6.2", "Immediate second claim of same objective Key is blocked (granted=false, duplicate=true)",
           second_claim_blocked,
           f"stars remained {claim_test['starsAfter2']}, treats remained {claim_test['treatsAfter2']}")

    # Reload page and try claiming the same key again
    page.reload(wait_until="domcontentloaded")
    page.wait_for_timeout(300)

    reload_claim_test = page.evaluate("""() => {
        const starsBeforeReloadClaim = Number(localStorage.getItem('elw_s'));
        const treatsBeforeReloadClaim = window.ELW_PET.getInventory().treats;
        const claim3 = window.ELW_PET.claimObjectiveReward('cafe:contextual_practice', {
            stars: 15, xp: 20, treats: 2, water: 1, toys: 1, bond: 5
        });
        const starsAfter3 = Number(localStorage.getItem('elw_s'));
        const treatsAfter3 = window.ELW_PET.getInventory().treats;
        return {
            claim3,
            starsUnchanged: starsAfter3 === starsBeforeReloadClaim,
            treatsUnchanged: treatsAfter3 === treatsBeforeReloadClaim,
            starsAfter3
        };
    }""")

    record("T6", "T6.3", "Reward ledger persists across page reload and blocks re-claiming after reload",
           reload_claim_test["claim3"]["granted"] is False
           and reload_claim_test["claim3"]["duplicate"] is True
           and reload_claim_test["starsUnchanged"] is True
           and reload_claim_test["treatsUnchanged"] is True,
           f"after reload: granted={reload_claim_test['claim3']['granted']}, duplicate={reload_claim_test['claim3']['duplicate']}, stars={reload_claim_test['starsAfter3']}")


def run_t7_premium_gating_and_tamper_guard(page):
    print("\n=== T7: Premium Gating (8 Pets), Preview Modal ('Mở khoá Premium'), Tamper Guard & Unified Code Unlock ===")
    page.evaluate("""() => {
        localStorage.removeItem('elw_topics_v1');
        localStorage.removeItem('elw_pro_v1');
        window.ELW_PET.selectPet('milu');
        if (window.ELW_PET_UI && window.ELW_PET_UI.closeModals) window.ELW_PET_UI.closeModals();
        if (window.ELW_PET_UI && window.ELW_PET_UI.refresh) window.ELW_PET_UI.refresh();
    }""")

    # Click on a locked premium pet card (boba)
    open_pet_tab_if_needed(page)
    page.locator('#petCollectionGrid [data-pet-card="boba"]').click()
    page.wait_for_timeout(150)

    prem_modal_info = page.evaluate("""() => {
        const activeId = window.ELW_PET.getActivePetId();
        const modal = document.getElementById('petPremiumPreviewModal');
        const isOpen = !!(modal && modal.classList.contains('is-open'));
        const text = modal ? modal.textContent : '';
        const hasUnlockAction = text.includes('Mở khoá Premium') && !!(modal && modal.querySelector('[data-open-premium-unlock]'));
        const img = modal ? modal.querySelector('img') : null;
        const imgSrc = img ? img.getAttribute('src') : '';
        if (window.ELW_PET_UI && window.ELW_PET_UI.closeModals) window.ELW_PET_UI.closeModals();
        return {
            activeId,
            isOpen,
            hasUnlockAction,
            imgSrc
        };
    }""")

    record("T7", "T7.1", "Clicking locked premium pet 'boba' does NOT equip it and opens Preview Modal with 'Mở khoá Premium'",
           prem_modal_info["activeId"] == "milu"
           and prem_modal_info["isOpen"] is True
           and prem_modal_info["hasUnlockAction"] is True
           and "assets/pets/boba/" in prem_modal_info["imgSrc"],
           f"activeId={prem_modal_info['activeId']}, modalOpen={prem_modal_info['isOpen']}, hasUnlockAction={prem_modal_info['hasUnlockAction']}")

    # Tamper localStorage to force activePetId = 'ember' without topic unlock, then reload
    page.evaluate("""() => {
        localStorage.removeItem('elw_topics_v1');
        localStorage.removeItem('elw_pro_v1');
        const raw = JSON.parse(localStorage.getItem('elw_pet_needs_v2') || '{}');
        raw.activePetId = 'ember';
        localStorage.setItem('elw_pet_needs_v2', JSON.stringify(raw));
        localStorage.setItem('elw_pet_v1', JSON.stringify({ id: 'ember', petId: 'ember' }));
    }""")

    page.reload(wait_until="domcontentloaded")
    page.wait_for_timeout(300)

    sanitized_info = page.evaluate("""() => {
        const activeId = window.ELW_PET.getActivePetId();
        const storedV2 = JSON.parse(localStorage.getItem('elw_pet_needs_v2') || '{}');
        return {
            activeId,
            storedActiveId: storedV2.activePetId
        };
    }""")

    record("T7", "T7.2", "Tampered premium activePetId='ember' in localStorage is sanitized back to 'milu' on reload when locked",
           sanitized_info["activeId"] == "milu" and sanitized_info["storedActiveId"] == "milu",
           f"activeId={sanitized_info['activeId']}, storedActiveId={sanitized_info['storedActiveId']}")


def run_t8_zero_regression(page, runtime_errors):
    print("\n=== T8: Zero Regression on Existing App Features & Single-File Bundle ===")
    expand_ctx_bar_if_needed(page)

    dom_reg = page.evaluate("""() => {
        const topics = ['home', 'park', 'cafe', 'market', 'restaurant', 'outdoor', 'school'];
        const switched = [];
        for (const t of topics) {
            if (typeof window.pickTopic === 'function') {
                window.pickTopic(t);
                switched.push(t);
            }
        }
        window.pickTopic('home');
        return {
            switchedCount: switched.length,
            hasCtxBar: !!document.getElementById('ctxBar'),
            hasCtxBtnDog: !!document.getElementById('ctxBtnDog'),
            hasCtxBtnLinh: !!document.getElementById('ctxBtnLinh'),
            hasChallenge: !!(window.ELW_CHALLENGE && (typeof window.ELW_CHALLENGE.startTopicChallenge === 'function' || typeof window.ELW_CHALLENGE.start === 'function')),
            hasCoreApp: !!(window.ELW && typeof window.ELW.state === 'function'),
            hasVocab3000: !!window.ELW_VOCAB3000
        };
    }""")

    record("T8", "T8.1", "All 7 core topics switch cleanly and #ctxBar (#ctxBtnDog, #ctxBtnLinh), ELW_CHALLENGE, ELW, ELW_VOCAB3000 work",
           dom_reg["switchedCount"] == 7
           and dom_reg["hasCtxBar"]
           and dom_reg["hasCtxBtnDog"]
           and dom_reg["hasCtxBtnLinh"]
           and dom_reg["hasChallenge"]
           and dom_reg["hasCoreApp"]
           and dom_reg["hasVocab3000"],
           f"topics={dom_reg['switchedCount']}/7, challenge={dom_reg['hasChallenge']}, core={dom_reg['hasCoreApp']}, vocab3000={dom_reg['hasVocab3000']}")

    record("T8", "T8.2", "Zero uncaught pageerror exceptions during entire index.html E2E test run",
           len(runtime_errors) == 0,
           "0 runtime errors" if len(runtime_errors) == 0 else f"errors={runtime_errors}")

    # Verify single-file bundle english-life-world-ban-day-du.html loads cleanly in Chromium
    bundle_errors = []
    page.on("pageerror", lambda err: bundle_errors.append(str(err)))
    page.goto(BUNDLE_HTML.as_uri(), wait_until="domcontentloaded")
    page.wait_for_timeout(300)

    bundle_ok = page.evaluate("""() => ({
        hasPet: !!window.ELW_PET,
        hasNeeds: !!window.ELW_PET_NEEDS,
        hasInteraction: !!window.ELW_PET_INTERACTION,
        hasAdventure: !!window.ELW_PET_ADVENTURE,
        hasRewards: !!window.ELW_PET_REWARDS,
        hasUi: !!window.ELW_PET_UI,
        rosterCount: window.ELW_PET ? window.ELW_PET.getRoster().length : 0,
        cardCount: document.querySelectorAll('#petCollectionGrid [data-pet-card]').length
    })""")

    record("T8", "T8.3", "Single-file bundle (english-life-world-ban-day-du.html) loads all 6 Pet modules & 10 pet cards with 0 errors",
           all([
               bundle_ok["hasPet"], bundle_ok["hasNeeds"], bundle_ok["hasInteraction"],
               bundle_ok["hasAdventure"], bundle_ok["hasRewards"], bundle_ok["hasUi"],
               bundle_ok["rosterCount"] == 10, bundle_ok["cardCount"] == 10,
               len(bundle_errors) == 0
           ]),
           f"roster={bundle_ok['rosterCount']}, cards={bundle_ok['cardCount']}, errors={len(bundle_errors)}")

    # Run Node unit test suites (context-engine.test.js and qa-20-scenarios.test.js)
    ctx_proc = subprocess.run(
        ["node", "modules/context-engine.test.js"],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    qa20_proc = subprocess.run(
        ["node", "modules/qa-20-scenarios.test.js"],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
    )

    record("T8", "T8.4", "Node unit suites (context-engine.test.js & qa-20-scenarios.test.js) pass 100%",
           ctx_proc.returncode == 0 and qa20_proc.returncode == 0,
           f"context-engine exit={ctx_proc.returncode}, qa-20 exit={qa20_proc.returncode}")

    # Navigate back to index.html for T8.5–T8.8 DOM & mobile viewport checks
    page.goto(INDEX_HTML.as_uri(), wait_until="domcontentloaded")
    page.wait_for_timeout(300)

    # T8.5: 3 tabs (Chơi / Học / Nhiệm vụ) & Mission/Challenge regression
    tabs_and_missions = page.evaluate("""() => {
        const tabs = Array.from(document.querySelectorAll('.w3d-mtab[data-mtab]')).map(b => b.getAttribute('data-mtab'));
        const switchedTabs = [];
        for (const t of ['play', 'learn', 'mission']) {
            const btn = document.querySelector(`.w3d-mtab[data-mtab="${t}"]`);
            if (btn) {
                btn.click();
                switchedTabs.push(t);
            }
        }
        const missionCount = window.ELW_MISSION && Array.isArray(window.ELW_MISSION.MISSIONS) ? window.ELW_MISSION.MISSIONS.length : 0;
        const challengeCount = window.ELW_CHALLENGE && Array.isArray(window.ELW_CHALLENGE.CHALLENGES) ? window.ELW_CHALLENGE.CHALLENGES.length : 0;
        return { tabs, switchedTabs, missionCount, challengeCount };
    }""")
    record("T8", "T8.5", "3 tabs (Chơi/Học/Nhiệm vụ) switch cleanly & legacy Mission/Challenge packs remain intact",
           tabs_and_missions["switchedTabs"] == ["play", "learn", "mission"]
           and tabs_and_missions["missionCount"] > 0
           and tabs_and_missions["challengeCount"] > 0,
           f"tabs={tabs_and_missions['switchedTabs']}, missions={tabs_and_missions['missionCount']}, challenges={tabs_and_missions['challengeCount']}")

    # T8.6: Companion Linh only outside home (hidden at home, visible at park/cafe)
    linh_check = page.evaluate("""() => {
        if (typeof window.pickTopic === 'function') window.pickTopic('home');
        const btnAtHome = document.getElementById('ctxBtnLinh');
        const hiddenAtHome = !btnAtHome || btnAtHome.style.display === 'none' || getComputedStyle(btnAtHome).display === 'none';
        const friendAtHome = !!document.getElementById('lt-friend');

        if (typeof window.pickTopic === 'function') window.pickTopic('park');
        const btnAtPark = document.getElementById('ctxBtnLinh');
        const visibleAtPark = !!(btnAtPark && getComputedStyle(btnAtPark).display !== 'none');

        if (typeof window.pickTopic === 'function') window.pickTopic('home');
        return { hiddenAtHome, friendAtHome, visibleAtPark };
    }""")
    record("T8", "T8.6", "Companion Linh is hidden at Home and available only outside Home (Park/Cafe)",
           linh_check["hiddenAtHome"] is True and linh_check["friendAtHome"] is False and linh_check["visibleAtPark"] is True,
           f"hiddenAtHome={linh_check['hiddenAtHome']}, friendAtHome={linh_check['friendAtHome']}, visibleAtPark={linh_check['visibleAtPark']}")

    # T8.7: Topic unlock code ('6789') is never exposed in UI text or placeholders
    code_leak_check = page.evaluate("""() => {
        const btnTopic = document.getElementById('btnTopic');
        if (btnTopic) btnTopic.click();
        const sheet = document.getElementById('topicSheet');
        const sheetText = sheet ? sheet.innerText : '';
        const placeholders = sheet ? Array.from(sheet.querySelectorAll('input')).map(i => i.placeholder || '').join(' ') : '';
        const bodyText = document.body.innerText || '';
        const leakedInSheet = sheetText.includes('6789') || placeholders.includes('6789');
        const leakedInBody = bodyText.includes('6789');
        if (typeof window.closeTopicSheet === 'function') window.closeTopicSheet();
        return { leakedInSheet, leakedInBody };
    }""")
    record("T8", "T8.7", "Topic unlock code is never exposed in Topic Sheet UI text or input placeholders",
           code_leak_check["leakedInSheet"] is False and code_leak_check["leakedInBody"] is False,
           f"leakedInSheet={code_leak_check['leakedInSheet']}, leakedInBody={code_leak_check['leakedInBody']}")

    # T8.8: Mobile viewports 360px, 390px, 430px have zero horizontal scroll across all 3 tabs
    mobile_widths = [360, 390, 430]
    mobile_overflows = []
    for w in mobile_widths:
        page.set_viewport_size({"width": w, "height": 844})
        page.wait_for_timeout(120)
        res = page.evaluate("""(vw) => {
            const out = [];
            for (const t of ['play', 'learn', 'mission']) {
                const btn = document.querySelector(`.w3d-mtab[data-mtab="${t}"]`);
                if (btn) btn.click();
                const sw = document.documentElement.scrollWidth;
                const iw = window.innerWidth;
                if (sw > iw) out.push(`${vw}px(${t}):${sw}>${iw}`);
            }
            return out;
        }""", w)
        mobile_overflows.extend(res)
    page.set_viewport_size({"width": 1440, "height": 900})
    record("T8", "T8.8", "Mobile viewports 360px, 390px, 430px have zero horizontal overflow across all 3 tabs",
           len(mobile_overflows) == 0,
           f"tested={mobile_widths}px across play/learn/mission, overflows={mobile_overflows}")


def main():
    print("==============================================================================")
    print("🐾 ENGLISH LIFE WORLD — PLAYWRIGHT CHROMIUM QA SUITE (T1–T8)")
    print("==============================================================================")

    runtime_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        page.on("pageerror", lambda err: runtime_errors.append(str(err)))

        page.goto(INDEX_HTML.as_uri(), wait_until="domcontentloaded")
        page.wait_for_timeout(400)

        run_t1_assets_and_manifest(page)
        run_t2_roster_selection_persistence(page)
        run_t3_needs_decay_and_zero_penalty(page)
        run_t4_interactions_animations_and_fallback(page)
        run_t5_unified_adventure_system(page)
        run_t6_one_time_reward_ledger(page)
        run_t7_premium_gating_and_tamper_guard(page)
        run_t8_zero_regression(page, runtime_errors)

        browser.close()

    total = len(results)
    passed = sum(1 for r in results if r["passed"])
    failed = total - passed

    print("\n==============================================================================")
    print(f"📊 SUMMARY: {passed}/{total} CHECKS PASSED | {failed} FAILED")
    print("==============================================================================")

    if failed > 0:
        print("\nFailed checks:")
        for r in results:
            if not r["passed"]:
                print(f"  - [{r['id']}] {r['description']} ({r['detail']})")
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
