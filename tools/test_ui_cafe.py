"""
Test and capture screenshots for UI Cafe integration
"""
import os
from playwright.sync_api import sync_playwright

ROOT = r"D:\tools\Hoc tieng anh\english-life-world"
INDEX_URL = "file:///" + os.path.join(ROOT, "index.html").replace("\\", "/")
DOCS_DIR = os.path.join(ROOT, "docs")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 390, "height": 844}) # iPhone 12/13/14

        # 1. Open index.html
        page.goto(INDEX_URL)
        page.wait_for_timeout(500)

        # Clear localStorage to start fresh
        page.evaluate("localStorage.removeItem('elw_topics_v1');")
        page.reload()
        page.wait_for_timeout(500)

        # Click btnTopic
        page.click("#btnTopic")
        page.wait_for_timeout(400)

        # Check chip is NOT present
        chip_count = page.locator(".uit-chip-code").count()
        print(f"Chip count: {chip_count} (Should be 0)")
        text_content = page.locator("#topicSheet").inner_text()
        has_exposed_code = "6789" in text_content
        print(f"Exposed code in text: {has_exposed_code} (Should be False)")

        # Screenshot locked sheet
        shot_locked = os.path.join(DOCS_DIR, "shot-topic-locked.png")
        page.screenshot(path=shot_locked)
        print(f"Saved: {shot_locked}")

        # Enter code 6789
        page.fill("#tsCode", "6789")
        page.click("#tsLock button[type='submit']")
        page.wait_for_timeout(400)

        # Click Cafe topic
        page.click("button[data-topic='cafe']")
        page.wait_for_timeout(400)

        # Screenshot unlocked & picked sheet
        shot_unlocked = os.path.join(DOCS_DIR, "shot-topic-unlocked.png")
        page.screenshot(path=shot_unlocked)
        print(f"Saved: {shot_unlocked}")

        browser.close()

if __name__ == "__main__":
    run()
