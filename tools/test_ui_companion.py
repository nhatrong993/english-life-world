"""
Test UI Companion (modules/ui-companion.js) across 360px, 390px, and 412px
Verifies:
1. #btnFriend toggle switch: avatar, >= 44px, distinct ON/OFF visual states.
2. .tsfriend in #topicSheet: modern switch style, >= 44px, avatar, toggle interaction.
3. #ltCard choice card: compact height <= 300px, 3 large option buttons (>= 44px), does not cover scene, real Linh photo avatar.
"""
import os
import sys
import json

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from playwright.sync_api import sync_playwright

ROOT = r"D:\tools\Hoc tieng anh\english-life-world"
INDEX_URL = "file:///" + os.path.join(ROOT, "index.html").replace("\\", "/")
DOCS_DIR = os.path.join(ROOT, "docs")
COMPANION_JS_PATH = os.path.join(ROOT, "modules", "ui-companion.js")

VIEWPORTS = [
    {"name": "360px", "width": 360, "height": 740, "shot": "shot-companion-360.png"},
    {"name": "390px", "width": 390, "height": 844, "shot": "shot-companion-390.png"},
    {"name": "412px", "width": 412, "height": 915, "shot": "shot-companion-412.png"}
]

def run_tests():
    with open(COMPANION_JS_PATH, "r", encoding="utf-8") as f:
        companion_js = f.read()

    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch()

        # 1. Test Topic Sheet Switch (.tsfriend) on 390px
        print("\n--- Testing Topic Sheet Switch (.tsfriend) ---")
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.goto(INDEX_URL)
        page.wait_for_timeout(600)

        # Inject ui-companion.js
        page.evaluate(companion_js)
        page.wait_for_timeout(300)

        # Open topic sheet
        page.click("#btnTopic")
        page.wait_for_timeout(300)

        # Check .tsfriend properties
        ts_metrics = page.evaluate("""() => {
            const el = document.querySelector('.tsfriend');
            const chk = document.querySelector('#tsFriend');
            const r = el ? el.getBoundingClientRect() : null;
            const beforeStyle = el ? window.getComputedStyle(el, '::before') : null;
            const chkStyle = chk ? window.getComputedStyle(chk) : null;
            return {
                exists: !!el,
                height: r ? r.height : 0,
                width: r ? r.width : 0,
                hasAvatarBg: beforeStyle ? beforeStyle.backgroundImage.includes('linh-smiling.png') : false,
                avatarWidth: beforeStyle ? beforeStyle.width : '',
                switchWidth: chkStyle ? chkStyle.width : '',
                initialChecked: chk ? chk.checked : false
            };
        }""")
        print("Topic sheet switch metrics:", ts_metrics)
        assert ts_metrics["exists"], ".tsfriend does not exist"
        assert ts_metrics["height"] >= 44, f".tsfriend height is {ts_metrics['height']} < 44px"
        assert ts_metrics["hasAvatarBg"], "Avatar not found in .tsfriend::before"

        # Test toggle interaction on .tsfriend
        print("Toggling .tsfriend...")
        page.click("#tsFriend")
        page.wait_for_timeout(300)

        ts_after_toggle = page.evaluate("""() => {
            const el = document.querySelector('.tsfriend');
            const chk = document.querySelector('#tsFriend');
            const on = window.ELW_LIFE ? window.ELW_LIFE.companionOn() : null;
            return {
                checked: chk ? chk.checked : false,
                companionOn: on
            };
        }""")
        print("After click #tsFriend:", ts_after_toggle)
        assert ts_after_toggle["checked"] != ts_metrics["initialChecked"], "Toggle did not change checked state"
        assert ts_after_toggle["companionOn"] == ts_after_toggle["checked"], "Companion state out of sync"

        # Capture screenshot of topic sheet switch
        shot_ts = os.path.join(DOCS_DIR, "shot-companion-topicsheet.png")
        page.screenshot(path=shot_ts)
        print("Saved screenshot:", shot_ts)

        # Unlock cafe room (code 6789)
        page.fill("#tsCode", "6789")
        page.click("#tsLock button")
        page.wait_for_timeout(400)
        page.click("button[data-topic='cafe']")
        page.wait_for_timeout(400)
        page.close()

        # 2. Test #btnFriend and #ltCard across 3 viewports
        for vp in VIEWPORTS:
            print(f"\n--- Testing Viewport {vp['name']} ({vp['width']}x{vp['height']}) ---")
            page = browser.new_page(viewport={"width": vp["width"], "height": vp["height"]})
            page.goto(INDEX_URL)
            page.wait_for_timeout(600)

            # Inject ui-companion.js
            page.evaluate(companion_js)
            page.wait_for_timeout(200)

            # Move to cafe room to activate #btnFriend
            page.evaluate("""() => {
                W.room = 'cafe';
                renderRoom();
                if (typeof syncFriendBtn === 'function') syncFriendBtn();
                if (window.ELW_UI_COMPANION) window.ELW_UI_COMPANION.refresh();
            }""")
            page.wait_for_timeout(500)

            # 2.1. Verify #btnFriend metrics
            btn_metrics = page.evaluate("""() => {
                const btn = document.getElementById('btnFriend');
                if (!btn) return { exists: false };
                const r = btn.getBoundingClientRect();
                const before = window.getComputedStyle(btn, '::before');
                const after = window.getComputedStyle(btn, '::after');
                return {
                    exists: true,
                    hidden: btn.hidden,
                    ariaPressed: btn.getAttribute('aria-pressed'),
                    height: r.height,
                    width: r.width,
                    top: r.top,
                    left: r.left,
                    hasAvatarBg: before.backgroundImage.includes('linh-smiling.png'),
                    beforeWidth: before.width,
                    afterContent: after.content
                };
            }""")
            print(f"[{vp['name']}] #btnFriend metrics: height={btn_metrics['height']}, width={btn_metrics['width']}, hasAvatarBg={btn_metrics['hasAvatarBg']}, hidden={btn_metrics['hidden']}")
            assert btn_metrics["exists"], "#btnFriend not found"
            assert not btn_metrics["hidden"], "#btnFriend should be visible in cafe"
            assert btn_metrics["height"] >= 44, f"#btnFriend height {btn_metrics['height']} < 44px"
            assert btn_metrics["hasAvatarBg"], "#btnFriend missing avatar background in ::before"

            # Test turning #btnFriend ON and OFF
            print(f"[{vp['name']}] Testing #btnFriend toggle interactions...")
            # Set companion ON
            page.evaluate("() => { ELW_LIFE.setCompanion(true); syncFriendBtn(); ELW_UI_COMPANION.syncButton(); }")
            page.wait_for_timeout(200)
            btn_on = page.evaluate("""() => {
                const btn = document.getElementById('btnFriend');
                const after = window.getComputedStyle(btn, '::after');
                const before = window.getComputedStyle(btn, '::before');
                return {
                    pressed: btn.getAttribute('aria-pressed'),
                    text: after.content,
                    filter: before.filter
                };
            }""")
            print(f"[{vp['name']}] #btnFriend ON state: pressed={btn_on['pressed']}, text={repr(btn_on['text'])}")
            assert btn_on["pressed"] == "true", "aria-pressed should be true when ON"
            assert "Đi cùng" in btn_on["text"], "Text should contain 'Đi cùng' when ON"

            # Set companion OFF
            page.evaluate("() => { ELW_LIFE.setCompanion(false); syncFriendBtn(); ELW_UI_COMPANION.syncButton(); }")
            page.wait_for_timeout(200)
            btn_off = page.evaluate("""() => {
                const btn = document.getElementById('btnFriend');
                const after = window.getComputedStyle(btn, '::after');
                const before = window.getComputedStyle(btn, '::before');
                return {
                    pressed: btn.getAttribute('aria-pressed'),
                    text: after.content,
                    filter: before.filter
                };
            }""")
            print(f"[{vp['name']}] #btnFriend OFF state: pressed={btn_off['pressed']}, text={repr(btn_off['text'])}, filter={btn_off['filter']}")
            assert btn_off["pressed"] == "false", "aria-pressed should be false when OFF"
            assert "Một mình" in btn_off["text"], "Text should contain 'Một mình' when OFF"
            assert "grayscale" in btn_off["filter"] or "none" != btn_off["filter"], "Avatar should be filtered when OFF"

            # Turn back ON for dialogue card test
            page.evaluate("() => { ELW_LIFE.setCompanion(true); syncFriendBtn(); ELW_UI_COMPANION.syncButton(); }")
            page.wait_for_timeout(200)

            # 2.2. Trigger #ltCard dialogue with Linh
            print(f"[{vp['name']}] Triggering Linh talk card (#ltCard)...")
            page.evaluate("() => { ELW_LIFE.talkFriend(); }")
            page.wait_for_timeout(500)

            card_metrics = page.evaluate("""() => {
                const card = document.querySelector('.lt-card');
                const room = document.getElementById('room');
                if (!card || !room) return { exists: false };
                const cr = card.getBoundingClientRect();
                const rr = room.getBoundingClientRect();
                const opts = Array.from(card.querySelectorAll('.lt-opt')).map(b => {
                    const r = b.getBoundingClientRect();
                    return { height: r.height, width: r.width };
                });
                const avEl = card.querySelector('.lt-av');
                const avBg = avEl ? window.getComputedStyle(avEl).backgroundImage : '';
                const headName = card.querySelector('.lt-head b') ? card.querySelector('.lt-head b').textContent : '';

                return {
                    exists: true,
                    cardHeight: cr.height,
                    cardWidth: cr.width,
                    cardTop: cr.top,
                    roomHeight: rr.height,
                    roomBottom: rr.bottom,
                    optionsCount: opts.length,
                    optionHeights: opts.map(o => o.height),
                    allOptionsGte44: opts.every(o => o.height >= 44),
                    coversScene: cr.top < rr.bottom - 5,
                    avatarHasLinhBg: avBg.includes('linh-smiling.png'),
                    avatarBg: avBg,
                    who: headName
                };
            }""")
            print(f"[{vp['name']}] #ltCard metrics: height={card_metrics['cardHeight']}px, width={card_metrics['cardWidth']}px, options={card_metrics['optionsCount']}, allOptionsGte44={card_metrics['allOptionsGte44']}, coversScene={card_metrics['coversScene']}, avatarHasLinhBg={card_metrics['avatarHasLinhBg']}")
            assert card_metrics["exists"], "#ltCard dialogue was not opened"
            assert card_metrics["cardHeight"] <= 300, f"Card height {card_metrics['cardHeight']}px exceeds 300px limit!"
            assert card_metrics["optionsCount"] == 3, f"Expected 3 options, got {card_metrics['optionsCount']}"
            assert card_metrics["allOptionsGte44"], f"Some options are < 44px: {card_metrics['optionHeights']}"
            assert not card_metrics["coversScene"], f"Card covers scene! cardTop={card_metrics['cardTop']}, roomBottom={card_metrics['roomBottom']}"
            assert card_metrics["avatarHasLinhBg"], f"Linh avatar should have linh-smiling.png background, got: {card_metrics['avatarBg']}"

            # Capture screenshot
            shot_file = os.path.join(DOCS_DIR, vp["shot"])
            page.screenshot(path=shot_file)
            print(f"Saved screenshot: {shot_file}")

            results[vp["name"]] = {
                "btnFriend": btn_metrics,
                "card": card_metrics
            }

            page.close()

        browser.close()

    print("\n================ TEST SUMMARY ================")
    print(json.dumps(results, indent=2))
    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
