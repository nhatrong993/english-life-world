"""
Test and Preview People, Weather, and Menu Assets for English Life World
Generates a comprehensive HTML visual test harness and captures a screenshot to docs/shot-people-preview.png.
"""
import os
import json
from playwright.sync_api import sync_playwright

ROOT = r"D:\tools\Hoc tieng anh\english-life-world"
MANIFEST_PATH = os.path.join(ROOT, "assets", "manifest.json")
PREVIEW_HTML = os.path.join(ROOT, "docs", "people-preview.html")
SHOT_PATH = os.path.join(ROOT, "docs", "shot-people-preview.png")

def main():
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    people = [m for m in manifest if m["kind"] == "npc"]
    weather_overlays = [m for m in manifest if m["kind"] == "scene" and "weather" in m["file"]]
    weather_icons = [m for m in manifest if m["kind"] == "icon" and "weather" in m["file"]]
    menu_cafe = [m for m in manifest if m["kind"] == "icon" and "menu" in m["file"] and m.get("room") == "cafe"]
    menu_market = [m for m in manifest if m["kind"] == "icon" and "menu" in m["file"] and m.get("room") == "market"]

    html = f'''<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8"/>
<title>English Life World — Visual Asset Preview (People, Weather, Menu)</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #1e293b; color: #f8fafc; padding: 24px; }}
  h1 {{ font-size: 24px; margin-bottom: 8px; color: #f8fafc; }}
  p.subtitle {{ color: #94a3b8; margin-bottom: 24px; font-size: 14px; }}
  .section {{ background: #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #334155; }}
  h2 {{ font-size: 18px; margin-bottom: 16px; color: #e8743b; border-bottom: 1px solid #334155; padding-bottom: 8px; }}
  .grid {{ display: flex; flex-wrap: wrap; gap: 16px; }}
  .card {{ background: #1e293b; border-radius: 8px; padding: 12px; text-align: center; border: 1px solid #475569; width: 140px; }}
  .card img {{ width: 100%; height: auto; display: block; margin: 0 auto 8px; }}
  .card.people-card {{ width: 150px; }}
  .card.people-card .img-wrap {{ height: 210px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #334155 0%, #1e293b 100%); border-radius: 6px; }}
  .card.people-card img {{ max-height: 200px; width: auto; }}
  .card.icon-card {{ width: 110px; }}
  .card.icon-card .img-wrap {{ height: 80px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #334155 0%, #1e293b 100%); border-radius: 6px; }}
  .card.icon-card img {{ width: 64px; height: 64px; }}
  .name {{ font-size: 12px; font-weight: 600; color: #e2e8f0; word-break: break-word; }}
  .meta {{ font-size: 11px; color: #94a3b8; margin-top: 4px; }}
  .scene-preview {{ position: relative; width: 1000px; height: 640px; background: #3b2010 url("../assets/cafe/cafe-bg.png") no-repeat center / cover; border-radius: 8px; overflow: hidden; margin-top: 16px; border: 2px solid #e8743b; }}
  .scene-preview .overlay {{ position: absolute; top: 0; left: 0; width: 1000px; height: 640px; pointer-events: none; }}
  .scene-preview .npc-place {{ position: absolute; pointer-events: none; }}
</style>
</head>
<body>
  <h1>🎨 English Life World — Bộ ảnh Nhân vật, Thời tiết & Menu (P5)</h1>
  <p class="subtitle">Kiểm thử hiển thị toàn bộ 48 assets đồ họa mới: chuẩn phẳng 2.5D, trong suốt RGBA, mỗi file &le; 150KB.</p>

  <!-- 1. People -->
  <div class="section">
    <h2>1. Nhân vật & Bạn đồng hành (assets/people/ - {len(people)} sprites)</h2>
    <div class="grid">
'''

    for p in people:
        fpath = os.path.join(ROOT, p["file"].replace("/", os.sep))
        kb = os.path.getsize(fpath) / 1024
        html += f'''
      <div class="card people-card">
        <div class="img-wrap"><img src="../{p["file"]}" alt="{p["id"]}"/></div>
        <div class="name">{p["id"]}</div>
        <div class="meta">{p["w"]}x{p["h"]} · {kb:.1f} KB</div>
      </div>
'''

    html += f'''
    </div>
  </div>

  <!-- 2. Weather Overlays & Icons -->
  <div class="section">
    <h2>2. Lớp phủ & Icon Thời tiết (assets/weather/ - {len(weather_overlays)} overlays SVG + {len(weather_icons)} icons)</h2>
    <div style="margin-bottom: 12px; font-weight: 600; color: #94a3b8; font-size: 13px;">Icon thời tiết:</div>
    <div class="grid" style="margin-bottom: 20px;">
'''
    for wi in weather_icons:
        fpath = os.path.join(ROOT, wi["file"].replace("/", os.sep))
        kb = os.path.getsize(fpath) / 1024
        html += f'''
      <div class="card icon-card">
        <div class="img-wrap"><img src="../{wi["file"]}" alt="{wi["id"]}"/></div>
        <div class="name">{wi["id"].replace("weather-", "").replace("-icon", "")}</div>
        <div class="meta">{wi["w"]}x{wi["h"]} · {kb:.1f} KB</div>
      </div>
'''

    html += '''
    </div>
    <div style="margin-bottom: 12px; font-weight: 600; color: #94a3b8; font-size: 13px;">Mẫu ghép thử: Nền Quán Cafe + Lớp phủ Mưa (rain.svg) + Bạn Linh cầm ly + Barista phục vụ:</div>
    <div class="scene-preview">
      <!-- NPC Barista -->
      <img class="npc-place" src="../assets/people/barista-serving.png" style="bottom: 140px; left: 420px; width: 150px; z-index: 10;"/>
      <!-- NPC Linh -->
      <img class="npc-place" src="../assets/people/linh-holding-cup.png" style="bottom: 40px; left: 660px; width: 170px; z-index: 20;"/>
      <!-- NPC Tourist -->
      <img class="npc-place" src="../assets/people/visitor-tourist.png" style="bottom: 80px; left: 180px; width: 160px; z-index: 15;"/>
      <!-- Weather Overlay: Rain -->
      <img class="overlay" src="../assets/weather/rain.svg" style="z-index: 50;"/>
    </div>
  </div>

  <!-- 3. Cafe Menu -->
  <div class="section">
    <h2>3. Đồ uống & Bánh ngọt Quán Cà Phê (assets/menu/ - {len(menu_cafe)} món)</h2>
    <div class="grid">
'''
    for mc in menu_cafe:
        fpath = os.path.join(ROOT, mc["file"].replace("/", os.sep))
        kb = os.path.getsize(fpath) / 1024
        html += f'''
      <div class="card icon-card">
        <div class="img-wrap"><img src="../{mc["file"]}" alt="{mc["id"]}"/></div>
        <div class="name">{mc["id"].replace("menu-", "")}</div>
        <div class="meta">{mc["w"]}x{mc["h"]} · {kb:.1f} KB</div>
      </div>
'''

    html += f'''
    </div>
  </div>

  <!-- 4. Supermarket -->
  <div class="section">
    <h2>4. Hàng hóa Siêu thị (assets/menu/ - {len(menu_market)} mặt hàng)</h2>
    <div class="grid">
'''
    for mm in menu_market:
        fpath = os.path.join(ROOT, mm["file"].replace("/", os.sep))
        kb = os.path.getsize(fpath) / 1024
        html += f'''
      <div class="card icon-card">
        <div class="img-wrap"><img src="../{mm["file"]}" alt="{mm["id"]}"/></div>
        <div class="name">{mm["id"].replace("market-", "")}</div>
        <div class="meta">{mm["w"]}x{mm["h"]} · {kb:.1f} KB</div>
      </div>
'''

    html += '''
    </div>
  </div>
</body>
</html>'''

    with open(PREVIEW_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Written preview harness to {PREVIEW_HTML}")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 1900})
        page.goto(f"file:///{PREVIEW_HTML.replace(os.sep, '/')}")
        page.wait_for_timeout(1000)
        page.screenshot(path=SHOT_PATH, full_page=True)
        browser.close()

    print(f"Captured screenshot to {SHOT_PATH} ({os.path.getsize(SHOT_PATH)/1024:.1f} KB)")

if __name__ == "__main__":
    main()
