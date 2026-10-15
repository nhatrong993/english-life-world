"""
Generate Weather Assets (assets/weather/) for English Life World
Includes:
1. 4 SVG full-screen overlays (1000x640):
   - rain.svg
   - cold.svg
   - sunny.svg
   - windy.svg
2. 5 Weather Icons (96x96 PNG transparent, <= 150KB):
   - weather-sunny.png
   - weather-rainy.png
   - weather-cold.png
   - weather-windy.png
   - weather-cloudy.png
"""
import os
import io
import math
from PIL import Image
from playwright.sync_api import sync_playwright

OUT_DIR = r"D:\tools\Hoc tieng anh\english-life-world\assets\weather"
os.makedirs(OUT_DIR, exist_ok=True)

# ----------------------------------------------------------------------
# 1. Weather Overlays (1000x640 SVG)
# ----------------------------------------------------------------------

def get_rain_overlay_svg():
    # Generate realistic rain streaks and ground ripples
    streaks = []
    # Seeded procedural rain streaks
    for i in range(120):
        x = (i * 37 + 13) % 1020 - 10
        y = (i * 29 + 7) % 660 - 20
        length = 25 + (i % 7) * 6
        x2 = x - length * 0.28
        y2 = y + length
        opacity = 0.35 + ((i % 5) / 10.0)
        sw = 1.2 if (i % 3 == 0) else 1.8
        streaks.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="url(#rainDropGrad)" stroke-width="{sw}" stroke-linecap="round" opacity="{opacity:.2f}"/>')

    ripples = []
    # Floor ripples
    ripple_coords = [(180, 560), (320, 520), (510, 580), (670, 530), (840, 570), (420, 610), (760, 600), (220, 620), (910, 540)]
    for idx, (rx, ry) in enumerate(ripple_coords):
        ripples.append(f'''
        <g transform="translate({rx}, {ry})">
          <ellipse cx="0" cy="0" rx="14" ry="4.5" fill="none" stroke="#bae6fd" stroke-width="1.2" opacity="0.6"/>
          <ellipse cx="0" cy="0" rx="7" ry="2.2" fill="none" stroke="#e0f2fe" stroke-width="1.5" opacity="0.8"/>
          <circle cx="0" cy="-2" r="1.5" fill="#ffffff" opacity="0.9"/>
        </g>
        ''')

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 640" width="1000" height="640" style="pointer-events: none;">
  <defs>
    <linearGradient id="rainDropGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.1"/>
      <stop offset="60%" stop-color="#93c5fd" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#bfdbfe" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="rainSkyTint" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#334155" stop-opacity="0.08"/>
    </linearGradient>
  </defs>

  <!-- Ambient rainy mood tint -->
  <rect width="1000" height="640" fill="url(#rainSkyTint)"/>

  <!-- Rain Streaks -->
  <g>
    {''.join(streaks)}
  </g>

  <!-- Puddle Splash Ripples on Floor -->
  <g>
    {''.join(ripples)}
  </g>
</svg>'''

def get_cold_overlay_svg():
    # Frost crystals and gentle snow flakes
    flakes = []
    for i in range(50):
        cx = (i * 47 + 23) % 1000
        cy = (i * 31 + 17) % 640
        r = 2.0 + (i % 5) * 1.2
        op = 0.4 + (i % 4) * 0.15
        flakes.append(f'<circle cx="{cx}" cy="{cy}" r="{r:.1f}" fill="#ffffff" opacity="{op:.2f}"/>')
        if i % 4 == 0:
            # Add subtle cross star to larger flakes
            flakes.append(f'<path d="M{cx-r*1.8} {cy} L{cx+r*1.8} {cy} M{cx} {cy-r*1.8} L{cx} {cy+r*1.8}" stroke="#e0f2fe" stroke-width="1.2" stroke-linecap="round" opacity="{op:.2f}"/>')

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 640" width="1000" height="640" style="pointer-events: none;">
  <defs>
    <radialGradient id="coldVignette" cx="50%" cy="50%" r="65%">
      <stop offset="50%" stop-color="#e0f2fe" stop-opacity="0"/>
      <stop offset="85%" stop-color="#bae6fd" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.32"/>
    </radialGradient>
    <linearGradient id="frostBreath" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="50%" stop-color="#f0f9ff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="frostBlur">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>

  <!-- Cool Frost Vignette -->
  <rect width="1000" height="640" fill="url(#coldVignette)"/>

  <!-- Frost Patterns in Corners -->
  <!-- Top Left Corner Frost -->
  <path d="M0 0 L140 0 C110 40 70 80 40 90 C20 120 10 150 0 160 Z" fill="#e0f2fe" opacity="0.35" filter="url(#frostBlur)"/>
  <!-- Top Right Corner Frost -->
  <path d="M1000 0 L860 0 C890 40 930 80 960 90 C980 120 990 150 1000 160 Z" fill="#e0f2fe" opacity="0.35" filter="url(#frostBlur)"/>
  <!-- Bottom Corners Frost -->
  <path d="M0 640 L160 640 C120 600 80 570 0 540 Z" fill="#bae6fd" opacity="0.28" filter="url(#frostBlur)"/>
  <path d="M1000 640 L840 640 C880 600 920 570 1000 540 Z" fill="#bae6fd" opacity="0.28" filter="url(#frostBlur)"/>

  <!-- Cold Breath Vapors (soft translucent puffs in mid-air) -->
  <ellipse cx="480" cy="280" rx="90" ry="24" fill="url(#frostBreath)" filter="url(#frostBlur)"/>
  <ellipse cx="620" cy="240" rx="70" ry="18" fill="url(#frostBreath)" filter="url(#frostBlur)"/>

  <!-- Soft Snowflakes drifting down -->
  <g>
    {''.join(flakes)}
  </g>
</svg>'''

def get_sunny_overlay_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 640" width="1000" height="640" style="pointer-events: none;">
  <defs>
    <!-- Warm Sunlight Beams (Slanted from top-right) -->
    <linearGradient id="sunBeam1" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffbeb" stop-opacity="0.45"/>
      <stop offset="40%" stop-color="#fef08a" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#fde047" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="sunBeam2" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#fde68a" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </linearGradient>
    <!-- Sun Flare Core -->
    <radialGradient id="sunFlare" cx="95%" cy="5%" r="40%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
      <stop offset="30%" stop-color="#fef08a" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
    </radialGradient>
    <filter id="sunGlow">
      <feGaussianBlur stdDeviation="15"/>
    </filter>
  </defs>

  <!-- Ambient Golden Room Warmth -->
  <rect width="1000" height="640" fill="#fef3c7" opacity="0.08"/>

  <!-- Sun Rays streaming across room from top right -->
  <polygon points="1000,0 820,0 350,640 580,640" fill="url(#sunBeam1)"/>
  <polygon points="850,0 720,0 120,640 300,640" fill="url(#sunBeam2)"/>
  <polygon points="680,0 580,0 0,580 0,440" fill="url(#sunBeam1)" opacity="0.6"/>

  <!-- Sun Flare in top-right corner -->
  <rect width="1000" height="640" fill="url(#sunFlare)"/>

  <!-- Golden Dust Motes / Sparkling light particles -->
  <g fill="#ffffff" opacity="0.85">
    <circle cx="820" cy="120" r="3.5"/>
    <circle cx="710" cy="180" r="2.5"/>
    <circle cx="640" cy="240" r="4"/>
    <circle cx="530" cy="310" r="3"/>
    <circle cx="460" cy="380" r="2.5"/>
    <circle cx="380" cy="450" r="3.5"/>
    <circle cx="280" cy="510" r="2"/>
    <circle cx="750" cy="280" r="3"/>
    <circle cx="580" cy="420" r="2.5"/>
    <!-- Sparkle Stars -->
    <path d="M640 232 L640 248 M632 240 L648 240" stroke="#fef08a" stroke-width="2"/>
    <path d="M380 443 L380 457 M373 450 L387 450" stroke="#fef08a" stroke-width="2"/>
  </g>
</svg>'''

def get_windy_overlay_svg():
    # Dynamic wind flow lines and flying leaves
    leaves = [
        # (x, y, rotation, color, scale)
        (220, 180, 25, "#e8743b", 1.1),
        (380, 140, -15, "#f59e0b", 1.0),
        (560, 210, 40, "#84cc16", 0.9),
        (680, 160, -30, "#e8743b", 1.2),
        (820, 240, 15, "#eab308", 1.0),
        (290, 360, -45, "#84cc16", 1.0),
        (470, 420, 20, "#e8743b", 1.1),
        (650, 380, -20, "#f59e0b", 1.2),
        (840, 440, 35, "#eab308", 0.9),
        (160, 480, -10, "#84cc16", 0.8),
    ]

    leaves_svg = []
    for lx, ly, rot, col, sc in leaves:
        leaves_svg.append(f'''
        <g transform="translate({lx}, {ly}) rotate({rot}) scale({sc})">
          <path d="M0 -14 C12 -6 12 10 0 16 C-12 10 -12 -6 0 -14 Z" fill="{col}" stroke="#78350f" stroke-width="0.8" opacity="0.9"/>
          <line x1="0" y1="-12" x2="0" y2="14" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
        </g>
        ''')

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 640" width="1000" height="640" style="pointer-events: none;">
  <defs>
    <linearGradient id="windStreak" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="40%" stop-color="#e0f2fe" stop-opacity="0.6"/>
      <stop offset="80%" stop-color="#bae6fd" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Swooshing Wind Currents -->
  <g fill="none" stroke="url(#windStreak)" stroke-linecap="round">
    <!-- Stream 1 -->
    <path d="M-20 180 C240 140 420 230 680 170 C840 130 960 190 1040 180" stroke-width="4.5"/>
    <path d="M120 165 C320 130 460 215 620 180" stroke-width="2.5" opacity="0.7"/>
    <!-- Stream 2 (Mid room) -->
    <path d="M-40 320 C180 370 390 280 620 330 C800 370 940 320 1030 340" stroke-width="4"/>
    <path d="M220 345 C420 295 560 350 780 325" stroke-width="2.2" opacity="0.8"/>
    <!-- Stream 3 (Lower ground) -->
    <path d="M-10 490 C220 450 440 520 720 480 C880 460 970 510 1030 500" stroke-width="3.5"/>
    
    <!-- Wind Spirals / Swirls -->
    <path d="M510 210 C530 195 545 210 535 225 C520 235 505 220 520 205" stroke-width="2.5"/>
    <path d="M720 350 C740 335 755 350 745 365 C730 375 715 360 730 345" stroke-width="2.2"/>
  </g>

  <!-- Flying Leaves -->
  <g>
    {''.join(leaves_svg)}
  </g>
</svg>'''


# ----------------------------------------------------------------------
# 2. 5 Weather Icons (96x96 PNG transparent)
# ----------------------------------------------------------------------

def get_weather_icon_svg(kind):
    defs = '''
    <defs>
      <filter id="icSh" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.22" flood-color="#1e293b"/>
      </filter>
      <linearGradient id="sunGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#ea580c"/>
      </linearGradient>
      <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#cbd5e1"/>
      </linearGradient>
      <linearGradient id="rainCloudGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <linearGradient id="iceGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#0284c7"/>
      </linearGradient>
    </defs>
    '''

    if kind == "sunny":
        # 2.5D Sun with rays
        rays = []
        for i in range(8):
            angle = i * 45
            rad = math.radians(angle)
            x1 = 48 + 26 * math.cos(rad)
            y1 = 48 + 26 * math.sin(rad)
            x2 = 48 + 36 * math.cos(rad)
            y2 = 48 + 36 * math.sin(rad)
            rays.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>')
        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  {defs}
  <g filter="url(#icSh)">
    <g>{''.join(rays)}</g>
    <circle cx="48" cy="48" r="20" fill="url(#sunGrad)" stroke="#fef08a" stroke-width="2"/>
    <ellipse cx="44" cy="43" rx="10" ry="7" fill="#ffffff" opacity="0.35"/>
  </g>
</svg>'''

    elif kind == "rainy":
        # Cloud with rain drops
        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  {defs}
  <g filter="url(#icSh)">
    <!-- Raindrops falling -->
    <line x1="34" y1="62" x2="28" y2="78" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="48" y1="64" x2="42" y2="82" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="62" y1="62" x2="56" y2="78" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Rain Cloud -->
    <path d="M28 58 C20 58 14 52 14 44 C14 36 21 31 28 31 C31 23 39 18 48 18 C58 18 66 24 68 33 C75 33 82 39 82 46 C82 53 76 58 68 58 Z" fill="url(#rainCloudGrad)"/>
    <ellipse cx="40" cy="30" rx="16" ry="8" fill="#ffffff" opacity="0.25"/>
  </g>
</svg>'''

    elif kind == "cold":
        # Snowflake with ice crystal branches
        branches = []
        for i in range(6):
            angle = i * 60
            rad = math.radians(angle)
            c, s = math.cos(rad), math.sin(rad)
            x2 = 48 + 32 * c
            y2 = 48 + 32 * s
            branches.append(f'<line x1="48" y1="48" x2="{x2:.1f}" y2="{y2:.1f}" stroke="url(#iceGrad)" stroke-width="4" stroke-linecap="round"/>')
            # Little side v-barbs
            mx = 48 + 20 * c
            my = 48 + 20 * s
            vx1 = mx + 8 * math.cos(rad + math.radians(45))
            vy1 = my + 8 * math.sin(rad + math.radians(45))
            vx2 = mx + 8 * math.cos(rad - math.radians(45))
            vy2 = my + 8 * math.sin(rad - math.radians(45))
            branches.append(f'<line x1="{mx:.1f}" y1="{my:.1f}" x2="{vx1:.1f}" y2="{vy1:.1f}" stroke="url(#iceGrad)" stroke-width="3" stroke-linecap="round"/>')
            branches.append(f'<line x1="{mx:.1f}" y1="{my:.1f}" x2="{vx2:.1f}" y2="{vy2:.1f}" stroke="url(#iceGrad)" stroke-width="3" stroke-linecap="round"/>')

        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  {defs}
  <g filter="url(#icSh)">
    <circle cx="48" cy="48" r="7" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>
    {''.join(branches)}
    <circle cx="48" cy="48" r="3.5" fill="#ffffff"/>
  </g>
</svg>'''

    elif kind == "windy":
        # Wind swooshes with blowing autumn leaf
        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  {defs}
  <g filter="url(#icSh)">
    <path d="M14 36 C36 28 62 26 74 34 C82 40 76 52 64 50 C54 48 56 36 68 34" fill="none" stroke="#60a5fa" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M18 52 C38 46 64 46 76 56 C82 62 76 70 68 68" fill="none" stroke="#93c5fd" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M14 66 C28 62 48 62 58 68" fill="none" stroke="#bae6fd" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Autumn leaf flying -->
    <g transform="translate(68, 26) rotate(35) scale(0.9)">
      <path d="M0 -14 C10 -6 10 10 0 16 C-10 10 -10 -6 0 -14 Z" fill="#e8743b" stroke="#9a3412" stroke-width="1"/>
      <line x1="0" y1="-12" x2="0" y2="14" stroke="#fde047" stroke-width="1.2"/>
    </g>
  </g>
</svg>'''

    elif kind == "cloudy":
        # Sun peeking behind fluffy white/grey cloud
        return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  {defs}
  <g filter="url(#icSh)">
    <!-- Sun behind -->
    <circle cx="60" cy="36" r="16" fill="url(#sunGrad)"/>
    <!-- Sun rays peeking -->
    <line x1="60" y1="14" x2="60" y2="8" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="76" y1="20" x2="81" y2="15" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="82" y1="36" x2="88" y2="36" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Fluffy cloud in front -->
    <path d="M26 68 C18 68 12 62 12 54 C12 47 18 42 25 42 C27 34 35 28 44 28 C54 28 62 34 64 42 C71 42 78 48 78 55 C78 62 72 68 64 68 Z" fill="url(#cloudGrad)"/>
    <ellipse cx="38" cy="38" rx="14" ry="7" fill="#ffffff" opacity="0.6"/>
  </g>
</svg>'''

def render_svg_to_png(page, svg_code, target_path, width, height, max_kb=150):
    html = f'''<!DOCTYPE html>
<html>
<head>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ background: transparent; overflow: hidden; width: {width}px; height: {height}px; }}
    svg {{ display: block; width: 100%; height: 100%; }}
  </style>
</head>
<body>
  {svg_code}
</body>
</html>'''
    page.set_viewport_size({"width": width, "height": height})
    page.set_content(html)
    page.wait_for_timeout(100)
    png_bytes = page.screenshot(omit_background=True)

    img = Image.open(io.BytesIO(png_bytes))
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    out_bytes = buf.getvalue()

    with open(target_path, "wb") as f:
        f.write(out_bytes)

    kb = len(out_bytes) / 1024
    print(f"Saved: {os.path.basename(target_path)} ({img.size[0]}x{img.size[1]}) - {kb:.1f} KB (limit: {max_kb} KB)")
    if kb > max_kb:
        raise ValueError(f"File {target_path} exceeded limit: {kb:.1f} KB > {max_kb} KB")
    return img.size[0], img.size[1], kb

def main():
    print("Generating Weather Overlays and Icons (assets/weather/)...")

    # 1. Save 4 Overlays (1000x640 SVG)
    overlays = [
        ("rain.svg", get_rain_overlay_svg()),
        ("cold.svg", get_cold_overlay_svg()),
        ("sunny.svg", get_sunny_overlay_svg()),
        ("windy.svg", get_windy_overlay_svg()),
    ]
    for fname, svg_code in overlays:
        path = os.path.join(OUT_DIR, fname)
        with open(path, "w", encoding="utf-8") as f:
            f.write(svg_code)
        kb = os.path.getsize(path) / 1024
        print(f"Saved SVG overlay: {fname} (1000x640) - {kb:.1f} KB")

    # 2. Render 5 Weather Icons (96x96 PNG transparent)
    icons = ["sunny", "rainy", "cold", "windy", "cloudy"]
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        for name in icons:
            svg_code = get_weather_icon_svg(name)
            target = os.path.join(OUT_DIR, f"weather-{name}.png")
            render_svg_to_png(page, svg_code, target, 96, 96, max_kb=150)

        browser.close()

    print("All weather assets generated successfully!")

if __name__ == "__main__":
    main()
