"""
Capture actual cafe room in index.html after unlocking with 6789
"""
import os
from playwright.sync_api import sync_playwright

root = r"D:\tools\Hoc tieng anh\english-life-world"
index_url = "file:///" + os.path.join(root, "index.html").replace("\\", "/")
docs_dir = os.path.join(root, "docs")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 850})
    page.goto(index_url)
    page.wait_for_timeout(600)

    # Click btnTopic
    page.click("#btnTopic")
    page.wait_for_timeout(300)

    # Enter code 6789
    page.fill("#tsCode", "6789")
    page.click("#tsLock button")
    page.wait_for_timeout(500)

    # Click cafe topic
    page.click("button[data-topic='cafe']")
    page.wait_for_timeout(500)

    # Call W.room = 'cafe'; renderRoom()
    page.evaluate("W.room = 'cafe'; renderRoom();")
    page.wait_for_timeout(1000)

    # Check objects in room now!
    objs = page.eval_on_selector_all(".obj", "els => els.map(e => e.id)")
    print(f"Objects in Cafe room ({len(objs)}): {objs}")

    # Take screenshot of actual Cafe room in app!
    cafe_shot = os.path.join(docs_dir, "shot-cafe-actual-room.png")
    page.screenshot(path=cafe_shot)
    print("Saved:", cafe_shot)

    browser.close()
