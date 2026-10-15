"""
Generate Cafe Assets for English Life World
Generates:
1. cafe-bg.png (2000x1280)
2. 12 object PNGs (<=150KB each, transparent background)
3. 6 action icons (128x128, transparent background)
"""
import os
import io
from PIL import Image
from playwright.sync_api import sync_playwright

OUT_DIR = r"D:\tools\Hoc tieng anh\english-life-world\assets\cafe"
os.makedirs(OUT_DIR, exist_ok=True)

# ----------------------------------------------------------------------
# 1. Background SVG (2000x1280)
# ----------------------------------------------------------------------
def get_cafe_bg_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1280" width="2000" height="1280">
  <defs>
    <!-- Wall Gradients -->
    <linearGradient id="bgWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdf8f2"/>
      <stop offset="60%" stop-color="#f5ede3"/>
      <stop offset="100%" stop-color="#ebe0d2"/>
    </linearGradient>
    <linearGradient id="leftWall" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e8dacf"/>
      <stop offset="100%" stop-color="#dac8ba"/>
    </linearGradient>
    <!-- Wood Floor Gradients -->
    <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c48e5e"/>
      <stop offset="40%" stop-color="#b57d4c"/>
      <stop offset="100%" stop-color="#8a5327"/>
    </linearGradient>
    <!-- Subway Tile Gradient -->
    <linearGradient id="tileGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f0f6f5"/>
    </linearGradient>
    <!-- Window Sky & Outside Garden -->
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cde9f8"/>
      <stop offset="70%" stop-color="#e8f4fc"/>
      <stop offset="100%" stop-color="#f4fbff"/>
    </linearGradient>
    <linearGradient id="foliageGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#86c652"/>
      <stop offset="100%" stop-color="#559929"/>
    </linearGradient>
    <!-- Ceiling Lamp Warm Glow -->
    <radialGradient id="lampGlow" cx="0.5" cy="0.3" r="0.7">
      <stop offset="0%" stop-color="#ffeed1" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#ffe2b0" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffd599" stop-opacity="0"/>
    </radialGradient>
    <!-- Sunbeam Gradient -->
    <linearGradient id="sunbeam" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="40%" stop-color="#fff8e7" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#fff0cc" stop-opacity="0"/>
    </linearGradient>
    <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <filter id="gentleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.2" flood-color="#3d210b"/>
    </filter>
  </defs>

  <!-- Ceiling (Top zone) -->
  <rect width="2000" height="120" fill="#fbf8f5"/>
  <rect y="112" width="2000" height="8" fill="#e2d4c5"/>
  <!-- Ceiling Wooden Exposed Beams -->
  <g fill="#9c633a" stroke="#7a4622" stroke-width="2">
    <rect x="0" y="20" width="2000" height="24"/>
    <rect x="0" y="80" width="2000" height="20"/>
  </g>

  <!-- Left Wall in Perspective: Warm Coffee Shop Wainscoting & Brick -->
  <polygon points="0,120 280,120 280,680 0,1280" fill="url(#leftWall)"/>
  <!-- Left Wall Brick/Panel Texture -->
  <g stroke="#c7b09e" stroke-width="2" opacity="0.6">
    <line x1="0" y1="240" x2="280" y2="210"/>
    <line x1="0" y1="360" x2="280" y2="300"/>
    <line x1="0" y1="480" x2="280" y2="390"/>
    <line x1="0" y1="600" x2="280" y2="480"/>
    <line x1="0" y1="740" x2="280" y2="570"/>
    <line x1="0" y1="900" x2="280" y2="660"/>
    <!-- vertical dividers -->
    <line x1="90" y1="180" x2="90" y2="600"/>
    <line x1="180" y1="150" x2="180" y2="640"/>
  </g>

  <!-- Back Wall: Warm Cream + Cafe Backsplash -->
  <rect x="280" y="120" width="1720" height="560" fill="url(#bgWall)"/>

  <!-- Back Wall Subway Tile Section (Where the counter and bar live) -->
  <rect x="280" y="320" width="1120" height="360" fill="url(#tileGrad)"/>
  <!-- Subtle Subway Tile Grid -->
  <g stroke="#d0e2df" stroke-width="2" opacity="0.8">
    <line x1="280" y1="360" x2="1400" y2="360"/>
    <line x1="280" y1="400" x2="1400" y2="400"/>
    <line x1="280" y1="440" x2="1400" y2="440"/>
    <line x1="280" y1="480" x2="1400" y2="480"/>
    <line x1="280" y1="520" x2="1400" y2="520"/>
    <line x1="280" y1="560" x2="1400" y2="560"/>
    <line x1="280" y1="600" x2="1400" y2="600"/>
    <line x1="280" y1="640" x2="1400" y2="640"/>
    <!-- Alternating Vertical Lines -->
    <!-- Row 0 -->
    <line x1="340" y1="320" x2="340" y2="360"/><line x1="460" y1="320" x2="460" y2="360"/><line x1="580" y1="320" x2="580" y2="360"/><line x1="700" y1="320" x2="700" y2="360"/><line x1="820" y1="320" x2="820" y2="360"/><line x1="940" y1="320" x2="940" y2="360"/><line x1="1060" y1="320" x2="1060" y2="360"/><line x1="1180" y1="320" x2="1180" y2="360"/><line x1="1300" y1="320" x2="1300" y2="360"/>
    <!-- Row 1 -->
    <line x1="400" y1="360" x2="400" y2="400"/><line x1="520" y1="360" x2="520" y2="400"/><line x1="640" y1="360" x2="640" y2="400"/><line x1="760" y1="360" x2="760" y2="400"/><line x1="880" y1="360" x2="880" y2="400"/><line x1="1000" y1="360" x2="1000" y2="400"/><line x1="1120" y1="360" x2="1120" y2="400"/><line x1="1240" y1="360" x2="1240" y2="400"/><line x1="1360" y1="360" x2="1360" y2="400"/>
    <!-- Row 2 -->
    <line x1="340" y1="400" x2="340" y2="440"/><line x1="460" y1="400" x2="460" y2="440"/><line x1="580" y1="400" x2="580" y2="440"/><line x1="700" y1="400" x2="700" y2="440"/><line x1="820" y1="400" x2="820" y2="440"/><line x1="940" y1="400" x2="940" y2="440"/><line x1="1060" y1="400" x2="1060" y2="440"/><line x1="1180" y1="400" x2="1180" y2="440"/><line x1="1300" y1="400" x2="1300" y2="440"/>
    <!-- Row 3 -->
    <line x1="400" y1="440" x2="400" y2="480"/><line x1="520" y1="440" x2="520" y2="480"/><line x1="640" y1="440" x2="640" y2="480"/><line x1="760" y1="440" x2="760" y2="480"/><line x1="880" y1="440" x2="880" y2="480"/><line x1="1000" y1="440" x2="1000" y2="480"/><line x1="1120" y1="440" x2="1120" y2="480"/><line x1="1240" y1="440" x2="1240" y2="480"/><line x1="1360" y1="440" x2="1360" y2="480"/>
    <!-- Row 4 -->
    <line x1="340" y1="480" x2="340" y2="520"/><line x1="460" y1="480" x2="460" y2="520"/><line x1="580" y1="480" x2="580" y2="520"/><line x1="700" y1="480" x2="700" y2="520"/><line x1="820" y1="480" x2="820" y2="520"/><line x1="940" y1="480" x2="940" y2="520"/><line x1="1060" y1="480" x2="1060" y2="520"/><line x1="1180" y1="480" x2="1180" y2="520"/><line x1="1300" y1="480" x2="1300" y2="520"/>
    <!-- Row 5 -->
    <line x1="400" y1="520" x2="400" y2="560"/><line x1="520" y1="520" x2="520" y2="560"/><line x1="640" y1="520" x2="640" y2="560"/><line x1="760" y1="520" x2="760" y2="560"/><line x1="880" y1="520" x2="880" y2="560"/><line x1="1000" y1="520" x2="1000" y2="560"/><line x1="1120" y1="520" x2="1120" y2="560"/><line x1="1240" y1="520" x2="1240" y2="560"/><line x1="1360" y1="520" x2="1360" y2="560"/>
    <!-- Row 6 -->
    <line x1="340" y1="560" x2="340" y2="600"/><line x1="460" y1="560" x2="460" y2="600"/><line x1="580" y1="560" x2="580" y2="600"/><line x1="700" y1="560" x2="700" y2="600"/><line x1="820" y1="560" x2="820" y2="600"/><line x1="940" y1="560" x2="940" y2="600"/><line x1="1060" y1="560" x2="1060" y2="600"/><line x1="1180" y1="560" x2="1180" y2="600"/><line x1="1300" y1="560" x2="1300" y2="600"/>
    <!-- Row 7 -->
    <line x1="400" y1="600" x2="400" y2="640"/><line x1="520" y1="600" x2="520" y2="640"/><line x1="640" y1="600" x2="640" y2="640"/><line x1="760" y1="600" x2="760" y2="640"/><line x1="880" y1="600" x2="880" y2="640"/><line x1="1000" y1="600" x2="1000" y2="640"/><line x1="1120" y1="600" x2="1120" y2="640"/><line x1="1240" y1="600" x2="1240" y2="640"/><line x1="1360" y1="600" x2="1360" y2="640"/>
  </g>
  <!-- Wooden Backsplash Shelf Rail -->
  <rect x="280" y="312" width="1120" height="12" fill="#8c532b"/>
  <rect x="280" y="308" width="1120" height="4" fill="#deb28a"/>

  <!-- High Decorative Wall Shelves (Non-interactive) with Coffee Tins & Pots -->
  <g transform="translate(340, 200)">
    <rect width="440" height="12" rx="3" fill="#8c532b"/>
    <path d="M40 12 L30 36 L48 36 Z M390 12 L380 36 L398 36 Z" fill="#6d3c1a"/>
    <!-- Tins on shelf -->
    <rect x="50" y="-36" width="30" height="36" rx="4" fill="#e8743b"/>
    <rect x="54" y="-40" width="22" height="5" rx="2" fill="#fcdb77"/>
    <rect x="90" y="-32" width="28" height="32" rx="4" fill="#3b8de8"/>
    <rect x="94" y="-36" width="20" height="5" rx="2" fill="#fff"/>
    <rect x="130" y="-38" width="32" height="38" rx="4" fill="#4d9443"/>
    <rect x="134" y="-42" width="24" height="5" rx="2" fill="#fcdb77"/>
    <!-- Small trailing pot plant -->
    <path d="M220 -2 L224 -24 L244 -24 L248 -2 Z" fill="#d97746"/>
    <circle cx="236" cy="-26" r="14" fill="#559929"/>
    <circle cx="226" cy="-20" r="10" fill="#68b535"/>
    <circle cx="246" cy="-22" r="11" fill="#437b20"/>
    <path d="M222 -12 Q214 0 216 16 M248 -14 Q256 2 254 18" stroke="#559929" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- Glass coffee carafe -->
    <path d="M320 0 L328 -34 L352 -34 L360 0 Z" fill="#e2f1f5" opacity="0.85" stroke="#94a3b8" stroke-width="1.5"/>
    <ellipse cx="340" cy="-34" rx="12" ry="4" fill="#cbd5e1"/>
    <ellipse cx="340" cy="-6" rx="16" ry="5" fill="#5a3215"/>
  </g>

  <!-- Big Right Cafe Window (Sunny outside terrace) -->
  <g transform="translate(1420, 140)">
    <!-- Window Frame Outer -->
    <rect width="520" height="520" rx="16" fill="#7a4622" stroke="#542e13" stroke-width="4"/>
    <!-- Window Viewport -->
    <rect x="16" y="16" width="488" height="488" rx="8" fill="url(#skyGrad)"/>
    <!-- Outdoor Foliage & Street View -->
    <ellipse cx="140" cy="510" rx="240" ry="160" fill="url(#foliageGrad)"/>
    <ellipse cx="380" cy="530" rx="260" ry="180" fill="#4d8724"/>
    <circle cx="280" cy="360" r="80" fill="#73b53a" opacity="0.9"/>
    <circle cx="410" cy="380" r="95" fill="#5fa22e" opacity="0.85"/>
    <circle cx="120" cy="390" r="70" fill="#8bc94d" opacity="0.8"/>
    <!-- Outdoor String Lights through window -->
    <path d="M20 220 Q260 270 500 230" fill="none" stroke="#eedac3" stroke-width="2" opacity="0.6"/>
    <circle cx="100" cy="238" r="7" fill="#fff7d6"/>
    <circle cx="200" cy="254" r="7" fill="#fff7d6"/>
    <circle cx="300" cy="258" r="7" fill="#fff7d6"/>
    <circle cx="400" cy="248" r="7" fill="#fff7d6"/>
    <!-- Window Panes & Grids -->
    <rect x="16" y="16" width="488" height="488" rx="8" fill="none" stroke="#9c633a" stroke-width="12"/>
    <line x1="260" y1="16" x2="260" y2="504" stroke="#9c633a" stroke-width="10"/>
    <line x1="16" y1="260" x2="504" y2="260" stroke="#9c633a" stroke-width="10"/>
    <!-- Window Sill -->
    <rect x="-8" y="504" width="536" height="24" rx="4" fill="#deb28a" stroke="#8c532b" stroke-width="3"/>
  </g>

  <!-- Flooring (Parquet perspective from y=680 down to y=1280) -->
  <polygon points="0,1280 280,680 2000,680 2000,1280" fill="url(#floorGrad)"/>

  <!-- Floor Planks in Realistic Perspective -->
  <g stroke="#6e3e1a" stroke-width="3" opacity="0.55">
    <line x1="280" y1="680" x2="0" y2="1280"/>
    <line x1="520" y1="680" x2="260" y2="1280"/>
    <line x1="760" y1="680" x2="580" y2="1280"/>
    <line x1="1000" y1="680" x2="940" y2="1280"/>
    <line x1="1240" y1="680" x2="1320" y2="1280"/>
    <line x1="1480" y1="680" x2="1700" y2="1280"/>
    <line x1="1740" y1="680" x2="2000" y2="1140"/>
    <!-- Horizontal floor joint lines -->
    <line x1="200" y1="780" x2="2000" y2="780" stroke-dasharray="80 30" opacity="0.4"/>
    <line x1="130" y1="910" x2="2000" y2="910" stroke-dasharray="100 40" opacity="0.4"/>
    <line x1="60" y1="1070" x2="2000" y2="1070" stroke-dasharray="140 50" opacity="0.4"/>
  </g>

  <!-- Floor Baseboard / Skirting -->
  <rect x="280" y="668" width="1720" height="14" fill="#7a4622"/>
  <rect x="280" y="664" width="1720" height="4" fill="#deb28a"/>
  <polygon points="0,1280 0,1248 280,668 280,682" fill="#5e3415"/>

  <!-- Sunbeams Streaming from Window into Room -->
  <polygon points="1440,260 1920,260 2000,1240 1080,1240" fill="url(#sunbeam)" filter="url(#softBlur)"/>

  <!-- Hanging Pendant Lights from Ceiling (Ambient) -->
  <!-- Lamp 1 (Left-Center, over counter area) -->
  <g transform="translate(680, 120)">
    <line x1="0" y1="0" x2="0" y2="160" stroke="#334155" stroke-width="3"/>
    <ellipse cx="0" cy="160" rx="18" ry="6" fill="#475569"/>
    <!-- Glass Bell Shade -->
    <path d="M-36 210 Q-32 165 0 162 Q32 165 36 210 Z" fill="#e8743b" opacity="0.95"/>
    <ellipse cx="0" cy="210" rx="36" ry="10" fill="#fcdb77"/>
    <circle cx="0" cy="205" r="14" fill="#ffffff"/>
    <ellipse cx="0" cy="240" rx="140" ry="60" fill="url(#lampGlow)" filter="url(#softBlur)"/>
  </g>

  <!-- Lamp 2 (Center-Right, over dining area) -->
  <g transform="translate(1180, 120)">
    <line x1="0" y1="0" x2="0" y2="140" stroke="#334155" stroke-width="3"/>
    <ellipse cx="0" cy="140" rx="18" ry="6" fill="#475569"/>
    <!-- Glass Bell Shade -->
    <path d="M-36 190 Q-32 145 0 142 Q32 145 36 190 Z" fill="#e8743b" opacity="0.95"/>
    <ellipse cx="0" cy="190" rx="36" ry="10" fill="#fcdb77"/>
    <circle cx="0" cy="185" r="14" fill="#ffffff"/>
    <ellipse cx="0" cy="220" rx="140" ry="60" fill="url(#lampGlow)" filter="url(#softBlur)"/>
  </g>

  <!-- Ambient Wall Quote Sign (Background Art) -->
  <g transform="translate(860, 240)" opacity="0.38">
    <text x="0" y="0" font-family="'Georgia', serif" font-size="28" font-style="italic" fill="#8c532b" font-weight="700">"Good Coffee · Good Day"</text>
  </g>
</svg>'''

# ----------------------------------------------------------------------
# 2. The 12 Objects (Transparent RGBA PNGs)
# ----------------------------------------------------------------------
def get_menuboard_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 440" width="520" height="440">
  <defs>
    <filter id="mDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.25" flood-color="#2a1408"/>
    </filter>
  </defs>
  <!-- Chains hanging board -->
  <g stroke="#555" stroke-width="3" fill="none">
    <line x1="80" y1="0" x2="80" y2="40"/>
    <line x1="440" y1="0" x2="440" y2="40"/>
    <circle cx="80" cy="40" r="6" stroke="#b45309" stroke-width="3" fill="#d97706"/>
    <circle cx="440" cy="40" r="6" stroke="#b45309" stroke-width="3" fill="#d97706"/>
  </g>
  <!-- Outer Wooden Frame -->
  <rect x="30" y="36" width="460" height="380" rx="16" fill="#8c532b" stroke="#5a3418" stroke-width="6" filter="url(#mDrop)"/>
  <rect x="42" y="48" width="436" height="356" rx="10" fill="#a3673c"/>
  <!-- Blackboard Slate -->
  <rect x="52" y="58" width="416" height="336" rx="6" fill="#222c29"/>
  <!-- Inner Border in Chalk -->
  <rect x="58" y="64" width="404" height="324" rx="4" fill="none" stroke="#3d4f4a" stroke-width="1.5" stroke-dasharray="8 6"/>

  <!-- Menu Header -->
  <text x="260" y="100" fill="#fcdb77" font-family="'Trebuchet MS', 'Arial', sans-serif" font-size="24" font-weight="900" text-anchor="middle" letter-spacing="2">☕ CAFE MENU</text>
  <line x1="100" y1="112" x2="420" y2="112" stroke="#e8743b" stroke-width="3" stroke-linecap="round"/>

  <!-- Column 1: Hot Drinks -->
  <text x="80" y="140" fill="#e8743b" font-family="'Trebuchet MS', sans-serif" font-size="16" font-weight="800">COFFEE</text>
  <text x="80" y="168" fill="#ffffff" font-family="monospace" font-size="14">Espresso ....... $3.00</text>
  <text x="80" y="196" fill="#ffffff" font-family="monospace" font-size="14">Americano ...... $3.50</text>
  <text x="80" y="224" fill="#ffffff" font-family="monospace" font-size="14">Cafe Latte ..... $4.20</text>
  <text x="80" y="252" fill="#ffffff" font-family="monospace" font-size="14">Cappuccino ..... $4.20</text>
  <text x="80" y="280" fill="#ffffff" font-family="monospace" font-size="14">Mocha .......... $4.80</text>

  <!-- Column 2: Pastries & Milk -->
  <text x="280" y="140" fill="#e8743b" font-family="'Trebuchet MS', sans-serif" font-size="16" font-weight="800">BAKERY & EXTRAS</text>
  <text x="280" y="168" fill="#ffffff" font-family="monospace" font-size="14">Croissant ...... $3.20</text>
  <text x="280" y="196" fill="#ffffff" font-family="monospace" font-size="14">Choc Muffin .... $3.50</text>
  <text x="280" y="224" fill="#ffffff" font-family="monospace" font-size="14">Cookie ......... $2.00</text>
  <text x="280" y="252" fill="#ffffff" font-family="monospace" font-size="14">Oat Milk ....... +$0.50</text>
  <text x="280" y="280" fill="#ffffff" font-family="monospace" font-size="14">Syrup Shot ..... +$0.40</text>

  <!-- Chalk Doodle Bottom -->
  <line x1="80" y1="304" x2="440" y2="304" stroke="#3d4f4a" stroke-width="1.5"/>
  <text x="260" y="340" fill="#fcdb77" font-family="system-ui" font-size="13" font-style="italic" text-anchor="middle">★ Order at counter · Wi-Fi available ★</text>
  <text x="260" y="365" fill="#a7f3d0" font-family="system-ui" font-size="12" text-anchor="middle">Fresh roasted beans daily</text>
</svg>'''

def get_barista_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  <defs>
    <filter id="bDrop" x="-15%" y="-10%" width="130%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.22" flood-color="#261206"/>
    </filter>
  </defs>
  <g filter="url(#bDrop)">
    <!-- Legs / Pants -->
    <rect x="136" y="440" width="38" height="130" rx="8" fill="#334155"/>
    <rect x="186" y="440" width="38" height="130" rx="8" fill="#1e293b"/>
    <!-- Shoes -->
    <ellipse cx="152" cy="576" rx="26" ry="12" fill="#0f172a"/>
    <ellipse cx="208" cy="576" rx="26" ry="12" fill="#0f172a"/>

    <!-- Torso / White Shirt -->
    <path d="M120 180 L240 180 L246 390 L114 390 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Collar & Tie -->
    <polygon points="180,210 162,180 198,180" fill="#e8743b"/>
    <polygon points="175,210 185,210 190,260 180,274 170,260" fill="#c44f19"/>

    <!-- Apron (Barista Style: Dark Brown / Canvas) -->
    <path d="M136 215 L224 215 L236 450 L124 450 Z" fill="#4a2810" stroke="#331908" stroke-width="2"/>
    <!-- Apron Straps crossing chest -->
    <line x1="140" y1="180" x2="148" y2="215" stroke="#8c532b" stroke-width="7"/>
    <line x1="220" y1="180" x2="212" y2="215" stroke="#8c532b" stroke-width="7"/>
    <!-- Apron Pocket -->
    <rect x="146" y="300" width="68" height="60" rx="6" fill="#5a3215" stroke="#7a4622" stroke-width="2"/>
    <!-- Pocket Details: Small Cupping Spoon & Pen -->
    <line x1="160" y1="285" x2="160" y2="305" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <line x1="172" y1="288" x2="172" y2="305" stroke="#e8743b" stroke-width="3" stroke-linecap="round"/>
    <!-- Name Badge -->
    <rect x="148" y="235" width="34" height="16" rx="3" fill="#ffffff"/>
    <rect x="151" y="241" width="28" height="4" rx="1" fill="#e8743b"/>

    <!-- Left Arm & Hand (Holding Steaming Cup) -->
    <path d="M120 190 L82 270 L108 320" fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="108" cy="320" r="14" fill="#ffd5b5"/>
    <!-- Ceramic Cup with Latte in hand -->
    <g transform="translate(100, 310)">
      <ellipse cx="0" cy="18" rx="22" ry="7" fill="#d95e26"/>
      <path d="M-14 0 C-14 18 14 18 14 0 Z" fill="#e8743b"/>
      <ellipse cx="0" cy="0" rx="14" ry="6" fill="#4a2c16"/>
      <circle cx="0" cy="0" r="2.5" fill="#ffffff"/>
      <!-- Steam -->
      <path d="M-4 -8 Q-8 -18 -4 -26" stroke="#eedcc9" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M4 -8 Q8 -18 4 -26" stroke="#eedcc9" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>

    <!-- Right Arm & Hand (Holding Metal Frothing Pitcher) -->
    <path d="M240 190 L278 270 L254 320" fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="254" cy="320" r="14" fill="#ffd5b5"/>
    <!-- Metal Frothing Pitcher -->
    <g transform="translate(262, 312)">
      <polygon points="-12,24 12,24 16,-10 -16,-10" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
      <path d="M12 -4 C20 -4 20 18 10 18" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
      <polygon points="-16,-10 -22,-6 -14,-4" fill="#94a3b8"/>
    </g>

    <!-- Head & Neck -->
    <rect x="166" y="145" width="28" height="40" rx="6" fill="#ffd5b5"/>
    <ellipse cx="180" cy="120" rx="42" ry="46" fill="#ffd5b5"/>
    <!-- Friendly Face -->
    <!-- Eyes -->
    <ellipse cx="166" cy="116" rx="4.5" ry="5.5" fill="#2d1c10"/>
    <ellipse cx="194" cy="116" rx="4.5" ry="5.5" fill="#2d1c10"/>
    <circle cx="168" cy="114" r="1.5" fill="#ffffff"/>
    <circle cx="196" cy="114" r="1.5" fill="#ffffff"/>
    <!-- Cheeks -->
    <circle cx="158" cy="128" r="8" fill="#ffb4a2" opacity="0.6"/>
    <circle cx="202" cy="128" r="8" fill="#ffb4a2" opacity="0.6"/>
    <!-- Eyebrows -->
    <path d="M160 106 Q166 102 173 106" stroke="#5a3215" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M187 106 Q194 102 200 106" stroke="#5a3215" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Welcoming Smile -->
    <path d="M170 134 Q180 146 190 134" stroke="#b94a20" stroke-width="3" fill="#ffffff" stroke-linecap="round"/>

    <!-- Hair (Stylish Barista Look with undercut/quiff) -->
    <path d="M136 112 C134 60 226 60 224 112 C222 100 216 85 180 84 C146 85 140 100 136 112 Z" fill="#5a3215"/>
    <path d="M144 95 Q180 72 216 92 Q180 82 144 95 Z" fill="#7a4622"/>
  </g>
</svg>'''

def get_cafecounter_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 420" width="760" height="420">
  <defs>
    <filter id="cDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.28" flood-color="#2e1708"/>
    </filter>
    <linearGradient id="cntTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#deb28a"/>
      <stop offset="50%" stop-color="#c98a58"/>
      <stop offset="100%" stop-color="#b07442"/>
    </linearGradient>
    <linearGradient id="cntFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7a4622"/>
      <stop offset="100%" stop-color="#4a2810"/>
    </linearGradient>
  </defs>
  <g filter="url(#cDrop)">
    <!-- Countertop Top Surface (2.5D perspective) -->
    <polygon points="60,60 700,60 740,130 20,130" fill="url(#cntTop)" stroke="#9c633a" stroke-width="3"/>
    <line x1="20" y1="130" x2="740" y2="130" stroke="#fcdb77" stroke-width="2.5" opacity="0.7"/>

    <!-- Countertop Front Bevel -->
    <rect x="20" y="130" width="720" height="26" fill="#8c532b" stroke="#5a3418" stroke-width="2"/>
    <line x1="20" y1="156" x2="740" y2="156" stroke="#4a2810" stroke-width="3"/>

    <!-- Counter Base Main Body -->
    <rect x="40" y="156" width="680" height="220" fill="url(#cntFront)"/>

    <!-- Vertical Wood Slats Paneling -->
    <g stroke="#3a1e0b" stroke-width="4">
      <line x1="100" y1="156" x2="100" y2="376"/>
      <line x1="160" y1="156" x2="160" y2="376"/>
      <line x1="220" y1="156" x2="220" y2="376"/>
      <line x1="280" y1="156" x2="280" y2="376"/>
      <line x1="340" y1="156" x2="340" y2="376"/>
      <line x1="400" y1="156" x2="400" y2="376"/>
      <line x1="460" y1="156" x2="460" y2="376"/>
      <line x1="520" y1="156" x2="520" y2="376"/>
      <line x1="580" y1="156" x2="580" y2="376"/>
      <line x1="640" y1="156" x2="640" y2="376"/>
    </g>

    <!-- Warm Highlight Slats -->
    <g stroke="#9a5a30" stroke-width="1.5" opacity="0.6">
      <line x1="96" y1="156" x2="96" y2="376"/>
      <line x1="156" y1="156" x2="156" y2="376"/>
      <line x1="216" y1="156" x2="216" y2="376"/>
      <line x1="276" y1="156" x2="276" y2="376"/>
      <line x1="336" y1="156" x2="336" y2="376"/>
      <line x1="396" y1="156" x2="396" y2="376"/>
      <line x1="456" y1="156" x2="456" y2="376"/>
      <line x1="516" y1="156" x2="516" y2="376"/>
      <line x1="576" y1="156" x2="576" y2="376"/>
      <line x1="636" y1="156" x2="636" y2="376"/>
    </g>

    <!-- Recessed Base Toe-Kick (Dark bronze / brass footer) -->
    <rect x="30" y="376" width="700" height="24" rx="4" fill="#2d1c10" stroke="#1a0e08" stroke-width="2"/>
    <rect x="30" y="376" width="700" height="5" fill="#c98a58" opacity="0.7"/>
  </g>
</svg>'''

def get_cashregister_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 420" width="380" height="420">
  <defs>
    <filter id="rDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.25" flood-color="#24140b"/>
    </filter>
  </defs>
  <g filter="url(#rDrop)">
    <!-- Base / Stand of POS Terminal -->
    <ellipse cx="190" cy="370" rx="90" ry="24" fill="#334155"/>
    <rect x="175" y="240" width="30" height="130" fill="#475569" stroke="#1e293b" stroke-width="2"/>
    <polygon points="160,260 220,260 205,370 175,370" fill="#e8743b"/>

    <!-- Screen Bezel (Tilted Tablet) -->
    <polygon points="60,60 320,60 340,240 40,240" fill="#1e293b" stroke="#0f172a" stroke-width="4"/>
    <!-- Screen Glass -->
    <polygon points="76,74 304,74 322,226 58,226" fill="#0f172a"/>
    <!-- Screen Display UI Content -->
    <rect x="86" y="84" width="208" height="50" rx="4" fill="#1e293b"/>
    <text x="96" y="106" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="700">1x Vanilla Latte (L)</text>
    <text x="96" y="124" fill="#22c55e" font-family="monospace" font-size="16" font-weight="900">TOTAL: $4.50</text>

    <!-- Payment Touch Buttons on Screen -->
    <rect x="86" y="145" width="98" height="34" rx="6" fill="#e8743b"/>
    <text x="135" y="167" fill="#ffffff" font-family="system-ui" font-size="12" font-weight="800" text-anchor="middle">CARD 💳</text>
    <rect x="196" y="145" width="98" height="34" rx="6" fill="#3b8de8"/>
    <text x="245" y="167" fill="#ffffff" font-family="system-ui" font-size="12" font-weight="800" text-anchor="middle">CASH 💵</text>
    <rect x="86" y="188" width="208" height="28" rx="6" fill="#22c55e"/>
    <text x="190" y="206" fill="#ffffff" font-family="system-ui" font-size="13" font-weight="800" text-anchor="middle">CHARGE $4.50</text>

    <!-- Side Receipt Printer -->
    <g transform="translate(290, 240)">
      <rect width="65" height="70" rx="8" fill="#334155" stroke="#1e293b" stroke-width="2"/>
      <rect x="8" y="10" width="49" height="5" rx="2" fill="#0f172a"/>
      <!-- Paper Receipt coming out -->
      <polygon points="12,12 55,12 55,50 48,46 41,50 34,46 27,50 20,46 12,50" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <line x1="18" y1="20" x2="48" y2="20" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="18" y1="28" x2="44" y2="28" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="18" y1="36" x2="40" y2="36" stroke="#94a3b8" stroke-width="1.5"/>
    </g>

    <!-- Side Card Reader (Contactless Tap) -->
    <g transform="translate(30, 250)">
      <rect width="45" height="70" rx="8" fill="#1e293b" stroke="#e8743b" stroke-width="2"/>
      <circle cx="22" cy="22" r="10" fill="#334155"/>
      <!-- Wave / NFC symbol -->
      <path d="M18 20 A6 6 0 0 1 26 20" stroke="#38bdf8" stroke-width="2" fill="none"/>
      <path d="M16 16 A10 10 0 0 1 28 16" stroke="#38bdf8" stroke-width="2" fill="none"/>
      <!-- Status Green Light -->
      <circle cx="22" cy="54" r="4" fill="#22c55e"/>
    </g>
  </g>
</svg>'''

def get_espressomachine_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 440" width="512" height="440">
  <defs>
    <filter id="eDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.25" flood-color="#221208"/>
    </filter>
    <linearGradient id="eBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8743b"/>
      <stop offset="100%" stop-color="#b8501f"/>
    </linearGradient>
    <linearGradient id="eMetal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>
  <g filter="url(#eDrop)">
    <!-- Top Cup Warming Rail & Rack -->
    <rect x="40" y="40" width="432" height="14" rx="4" fill="url(#eMetal)" stroke="#64748b" stroke-width="2"/>
    <line x1="40" y1="28" x2="472" y2="28" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <line x1="60" y1="28" x2="60" y2="40" stroke="#94a3b8" stroke-width="3"/>
    <line x1="256" y1="28" x2="256" y2="40" stroke="#94a3b8" stroke-width="3"/>
    <line x1="452" y1="28" x2="452" y2="40" stroke="#94a3b8" stroke-width="3"/>
    <!-- Cups on top rack -->
    <ellipse cx="90" cy="30" rx="16" ry="6" fill="#fcdb77"/>
    <ellipse cx="150" cy="30" rx="16" ry="6" fill="#3b8de8"/>
    <ellipse cx="210" cy="30" rx="16" ry="6" fill="#ffffff"/>
    <ellipse cx="300" cy="30" rx="16" ry="6" fill="#3b8de8"/>
    <ellipse cx="360" cy="30" rx="16" ry="6" fill="#fcdb77"/>
    <ellipse cx="420" cy="30" rx="16" ry="6" fill="#ffffff"/>

    <!-- Main Outer Machine Body (Warm Orange Matte Shell) -->
    <rect x="32" y="54" width="448" height="270" rx="18" fill="url(#eBody)" stroke="#8c3d14" stroke-width="4"/>

    <!-- Front Stainless Steel Panel -->
    <rect x="64" y="80" width="384" height="140" rx="8" fill="url(#eMetal)" stroke="#64748b" stroke-width="2"/>

    <!-- Twin Pressure Gauges -->
    <g transform="translate(130, 130)">
      <circle r="26" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      <circle r="22" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <path d="M-12 6 A14 14 0 1 1 12 6" fill="none" stroke="#22c55e" stroke-width="3"/>
      <line x1="0" y1="0" x2="8" y2="-12" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
      <circle r="3" fill="#1e293b"/>
      <text y="14" font-family="sans-serif" font-size="7" font-weight="700" fill="#64748b" text-anchor="middle">BAR</text>
    </g>
    <g transform="translate(382, 130)">
      <circle r="26" fill="#ffffff" stroke="#475569" stroke-width="3"/>
      <circle r="22" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <path d="M-12 6 A14 14 0 1 1 12 6" fill="none" stroke="#22c55e" stroke-width="3"/>
      <line x1="0" y1="0" x2="-6" y2="-14" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>
      <circle r="3" fill="#1e293b"/>
      <text y="14" font-family="sans-serif" font-size="7" font-weight="700" fill="#64748b" text-anchor="middle">STEAM</text>
    </g>

    <!-- Digital Display & Volumetric Touch Buttons in Center -->
    <rect x="206" y="96" width="100" height="42" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <text x="256" y="118" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">93.5°C</text>
    <text x="256" y="132" fill="#22c55e" font-family="monospace" font-size="9" text-anchor="middle">READY · 25s</text>

    <!-- Volumetric Shot Buttons -->
    <circle cx="216" cy="158" r="8" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
    <circle cx="242" cy="158" r="8" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
    <circle cx="270" cy="158" r="8" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
    <circle cx="296" cy="158" r="8" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>

    <!-- Left & Right Group Heads with Portafilters -->
    <!-- Group 1 -->
    <g transform="translate(180, 220)">
      <rect x="-24" y="0" width="48" height="20" rx="4" fill="#475569"/>
      <rect x="-18" y="20" width="36" height="28" rx="4" fill="#334155"/>
      <!-- Spout -->
      <polygon points="-6,48 6,48 4,58 -4,58" fill="#94a3b8"/>
      <!-- Handle extending left -->
      <rect x="-70" y="16" width="56" height="12" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    </g>
    <!-- Group 2 -->
    <g transform="translate(332, 220)">
      <rect x="-24" y="0" width="48" height="20" rx="4" fill="#475569"/>
      <rect x="-18" y="20" width="36" height="28" rx="4" fill="#334155"/>
      <!-- Spout -->
      <polygon points="-6,48 6,48 4,58 -4,58" fill="#94a3b8"/>
      <!-- Handle extending right -->
      <rect x="14" y="16" width="56" height="12" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    </g>

    <!-- Steam Wands -->
    <path d="M80 180 Q64 240 76 290" fill="none" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
    <rect x="68" y="220" width="16" height="24" rx="4" fill="#1e293b"/>
    <path d="M432 180 Q448 240 436 290" fill="none" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
    <rect x="428" y="220" width="16" height="24" rx="4" fill="#1e293b"/>

    <!-- Bottom Drip Tray -->
    <rect x="24" y="324" width="464" height="56" rx="8" fill="url(#eMetal)" stroke="#64748b" stroke-width="3"/>
    <!-- Slotted Grate -->
    <g stroke="#334155" stroke-width="3">
      <line x1="50" y1="336" x2="462" y2="336"/>
      <line x1="50" y1="346" x2="462" y2="346"/>
      <line x1="50" y1="356" x2="462" y2="356"/>
      <line x1="50" y1="366" x2="462" y2="366"/>
    </g>

    <!-- Machine Legs -->
    <rect x="44" y="380" width="36" height="24" rx="6" fill="#1e293b"/>
    <rect x="432" y="380" width="36" height="24" rx="6" fill="#1e293b"/>
  </g>
</svg>'''

def get_pastrycase_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 440" width="520" height="440">
  <defs>
    <filter id="pDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.25" flood-color="#2a1408"/>
    </filter>
    <linearGradient id="pGlass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7"/>
      <stop offset="40%" stop-color="#e0f2fe" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.2"/>
    </linearGradient>
  </defs>
  <g filter="url(#pDrop)">
    <!-- Base Wooden Counter / Stand -->
    <rect x="30" y="310" width="460" height="90" rx="8" fill="#8c532b" stroke="#5a3418" stroke-width="4"/>
    <rect x="44" y="324" width="432" height="62" rx="4" fill="#6d3c1a"/>

    <!-- Glass Dome Outer Frame -->
    <path d="M40 310 L60 80 Q260 50 460 80 L480 310 Z" fill="url(#pGlass)" stroke="#64748b" stroke-width="4"/>

    <!-- Top & Middle Glass Shelves -->
    <line x1="85" y1="180" x2="435" y2="180" stroke="#94a3b8" stroke-width="6"/>
    <line x1="55" y1="310" x2="465" y2="310" stroke="#94a3b8" stroke-width="8"/>

    <!-- Top Shelf: Croissants & Cookies -->
    <!-- Croissant 1 -->
    <g transform="translate(130, 160)">
      <path d="M-36 0 C-36 -18 36 -18 36 0 C24 10 -24 10 -36 0 Z" fill="#d97706" stroke="#b45309" stroke-width="2"/>
      <path d="M-20 -2 C-14 -12 14 -12 20 -2" stroke="#fcd34d" stroke-width="3" fill="none"/>
    </g>
    <!-- Croissant 2 -->
    <g transform="translate(230, 160)">
      <path d="M-36 0 C-36 -18 36 -18 36 0 C24 10 -24 10 -36 0 Z" fill="#d97706" stroke="#b45309" stroke-width="2"/>
      <path d="M-20 -2 C-14 -12 14 -12 20 -2" stroke="#fcd34d" stroke-width="3" fill="none"/>
    </g>
    <!-- Choc Chip Cookies -->
    <g transform="translate(340, 165)">
      <circle cx="-24" cy="0" r="18" fill="#d49b6a" stroke="#b07849" stroke-width="2"/>
      <circle cx="-30" cy="-4" r="3" fill="#451a03"/><circle cx="-20" cy="4" r="3.5" fill="#451a03"/><circle cx="-22" cy="-6" r="2.5" fill="#451a03"/>
      <circle cx="16" cy="0" r="18" fill="#d49b6a" stroke="#b07849" stroke-width="2"/>
      <circle cx="12" cy="-4" r="3" fill="#451a03"/><circle cx="22" cy="4" r="3.5" fill="#451a03"/><circle cx="18" cy="-6" r="2.5" fill="#451a03"/>
    </g>

    <!-- Bottom Shelf: Muffins, Cinnamon Rolls & Fruit Tart -->
    <!-- Chocolate Muffin -->
    <g transform="translate(110, 280)">
      <polygon points="-20,24 20,24 26,0 -26,0" fill="#78350f"/>
      <ellipse cx="0" cy="0" rx="30" ry="20" fill="#451a03"/>
      <circle cx="-10" cy="-6" r="4" fill="#1c1917"/><circle cx="10" cy="-4" r="4.5" fill="#1c1917"/>
    </g>
    <!-- Cinnamon Roll -->
    <g transform="translate(210, 285)">
      <ellipse cx="0" cy="10" rx="32" ry="16" fill="#b45309"/>
      <ellipse cx="0" cy="0" rx="26" ry="14" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
      <ellipse cx="0" cy="-2" rx="14" ry="8" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
    </g>
    <!-- Blueberry Fruit Tart -->
    <g transform="translate(310, 285)">
      <ellipse cx="0" cy="12" rx="32" ry="14" fill="#d97706"/>
      <ellipse cx="0" cy="6" rx="28" ry="12" fill="#fffbeb"/>
      <circle cx="-12" cy="2" r="6" fill="#1e1b4b"/><circle cx="0" cy="2" r="6.5" fill="#1e1b4b"/><circle cx="12" cy="2" r="6" fill="#1e1b4b"/>
      <circle cx="-6" cy="8" r="5" fill="#1e1b4b"/><circle cx="6" cy="8" r="5" fill="#1e1b4b"/>
    </g>
    <!-- Strawberry Tart -->
    <g transform="translate(410, 285)">
      <ellipse cx="0" cy="12" rx="30" ry="14" fill="#d97706"/>
      <ellipse cx="0" cy="6" rx="26" ry="12" fill="#fef2f2"/>
      <polygon points="0,-10 -14,10 14,10" fill="#ef4444"/>
      <circle cx="-4" cy="2" r="1" fill="#fff"/><circle cx="4" cy="4" r="1" fill="#fff"/>
    </g>

    <!-- Glass Reflection Highlights -->
    <path d="M90 90 L160 90 L110 300 L60 300 Z" fill="#ffffff" opacity="0.35"/>
    <path d="M420 90 L450 90 L390 300 L360 300 Z" fill="#ffffff" opacity="0.2"/>
  </g>
</svg>'''

def get_cupstack_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 480" width="360" height="480">
  <defs>
    <filter id="csDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.25" flood-color="#24140b"/>
    </filter>
  </defs>
  <g filter="url(#csDrop)">
    <!-- Column 1: Stack of Ceramic Saucers & Cups (Orange & Cream) -->
    <!-- Base Saucers -->
    <g transform="translate(100, 390)">
      <ellipse cx="0" cy="28" rx="70" ry="18" fill="#d95e26" stroke="#b84c1b" stroke-width="2"/>
      <ellipse cx="0" cy="20" rx="70" ry="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <ellipse cx="0" cy="12" rx="70" ry="18" fill="#3b8de8" stroke="#2563eb" stroke-width="2"/>
      <ellipse cx="0" cy="4" rx="70" ry="18" fill="#d95e26" stroke="#b84c1b" stroke-width="2"/>
    </g>

    <!-- Stacked Ceramic Cups -->
    <!-- Cup 1 (Bottom) -->
    <g transform="translate(100, 340)">
      <path d="M-42 0 C-42 36 42 36 42 0 Z" fill="#e8743b" stroke="#b84c1b" stroke-width="2"/>
      <ellipse cx="0" cy="0" rx="42" ry="14" fill="#f79868"/>
      <!-- Handle -->
      <path d="M40 4 C58 4 58 26 36 26" fill="none" stroke="#e8743b" stroke-width="7" stroke-linecap="round"/>
    </g>
    <!-- Cup 2 (Middle) -->
    <g transform="translate(100, 260)">
      <path d="M-42 0 C-42 36 42 36 42 0 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <ellipse cx="0" cy="0" rx="42" ry="14" fill="#f1f5f9"/>
      <!-- Handle -->
      <path d="M-40 4 C-58 4 -58 26 -36 26" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
      <!-- Small orange stripe -->
      <line x1="-36" y1="12" x2="36" y2="12" stroke="#e8743b" stroke-width="3"/>
    </g>
    <!-- Cup 3 (Top) -->
    <g transform="translate(100, 180)">
      <path d="M-42 0 C-42 36 42 36 42 0 Z" fill="#3b8de8" stroke="#1d4ed8" stroke-width="2"/>
      <ellipse cx="0" cy="0" rx="42" ry="14" fill="#93c5fd"/>
      <ellipse cx="0" cy="0" rx="36" ry="11" fill="#1e3a8a"/>
      <!-- Handle -->
      <path d="M40 4 C58 4 58 26 36 26" fill="none" stroke="#3b8de8" stroke-width="7" stroke-linecap="round"/>
    </g>

    <!-- Column 2: Stack of Paper Takeaway Cups with Kraft Sleeves & Lids -->
    <g transform="translate(250, 410)">
      <!-- Cup 1 (Bottom) -->
      <polygon points="-36,0 36,0 44,-80 -44,-80" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <!-- Kraft Sleeve -->
      <polygon points="-39,-20 39,-20 42,-55 -42,-55" fill="#c08149" stroke="#9a5f33" stroke-width="1.5"/>
      <ellipse cx="0" cy="-38" rx="8" ry="6" fill="#5a3418"/>

      <!-- Cup 2 (Stacked inside) -->
      <polygon points="-38,-70 38,-70 46,-150 -46,-150" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="-41,-90 41,-90 44,-125 -44,-125" fill="#c08149" stroke="#9a5f33" stroke-width="1.5"/>
      <ellipse cx="0" cy="-108" rx="8" ry="6" fill="#5a3418"/>

      <!-- Cup 3 (Top) -->
      <polygon points="-40,-140 40,-140 48,-220 -48,-220" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="-43,-160 43,-160 46,-195 -46,-195" fill="#c08149" stroke="#9a5f33" stroke-width="1.5"/>
      <ellipse cx="0" cy="-178" rx="8" ry="6" fill="#5a3418"/>

      <!-- Stack of Sip Lids on Top -->
      <g transform="translate(0, -225)">
        <rect x="-50" y="-12" width="100" height="12" rx="4" fill="#334155"/>
        <rect x="-50" y="-20" width="100" height="10" rx="4" fill="#475569"/>
        <rect x="-50" y="-28" width="100" height="10" rx="4" fill="#1e293b"/>
      </g>
    </g>
  </g>
</svg>'''

def get_condiments_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 380" width="460" height="380">
  <defs>
    <filter id="cdDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity="0.22" flood-color="#2a1408"/>
    </filter>
  </defs>
  <g filter="url(#cdDrop)">
    <!-- Wooden Condiment Tray Organizer -->
    <rect x="20" y="270" width="420" height="60" rx="10" fill="#8c532b" stroke="#5a3418" stroke-width="4"/>
    <rect x="30" y="280" width="400" height="40" rx="6" fill="#6d3c1a"/>

    <!-- 1. Stainless Thermal Milk Carafe (WHOLE) -->
    <g transform="translate(80, 276)">
      <polygon points="-24,0 24,0 20,-110 -20,-110" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
      <rect x="-18" y="-130" width="36" height="20" rx="4" fill="#334155"/>
      <polygon points="16,-120 28,-115 16,-110" fill="#334155"/>
      <!-- Handle -->
      <path d="M-20 -115 C-42 -115 -42 -20 -24 -20" fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
      <!-- Label -->
      <rect x="-16" y="-60" width="32" height="18" rx="2" fill="#3b8de8"/>
      <text y="-47" fill="#ffffff" font-family="sans-serif" font-size="9" font-weight="800" text-anchor="middle">MILK</text>
    </g>

    <!-- 2. Stainless Thermal Milk Carafe (OAT) -->
    <g transform="translate(170, 276)">
      <polygon points="-24,0 24,0 20,-110 -20,-110" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
      <rect x="-18" y="-130" width="36" height="20" rx="4" fill="#334155"/>
      <polygon points="16,-120 28,-115 16,-110" fill="#334155"/>
      <!-- Handle -->
      <path d="M-20 -115 C-42 -115 -42 -20 -24 -20" fill="none" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
      <!-- Label -->
      <rect x="-16" y="-60" width="32" height="18" rx="2" fill="#e8743b"/>
      <text y="-47" fill="#ffffff" font-family="sans-serif" font-size="9" font-weight="800" text-anchor="middle">OAT</text>
    </g>

    <!-- 3. Glass Sugar Shaker with Chrome Pour Spout -->
    <g transform="translate(250, 276)">
      <rect x="-18" y="-80" width="36" height="80" rx="6" fill="#f8fafc" opacity="0.9" stroke="#94a3b8" stroke-width="2"/>
      <!-- White Sugar inside -->
      <rect x="-15" y="-60" width="30" height="58" rx="4" fill="#ffffff"/>
      <rect x="-16" y="-95" width="32" height="16" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <line x1="0" y1="-95" x2="4" y2="-112" stroke="#64748b" stroke-width="4" stroke-linecap="round"/>
      <text y="-25" fill="#475569" font-family="sans-serif" font-size="8" font-weight="700" text-anchor="middle">SUGAR</text>
    </g>

    <!-- 4. Ceramic Cup with Wooden Stirrers -->
    <g transform="translate(325, 276)">
      <rect x="-16" y="-55" width="32" height="55" rx="4" fill="#e8743b" stroke="#b84c1b" stroke-width="2"/>
      <!-- Stir Sticks -->
      <line x1="-10" y1="-50" x2="-14" y2="-88" stroke="#deb28a" stroke-width="3" stroke-linecap="round"/>
      <line x1="-4" y1="-50" x2="-2" y2="-94" stroke="#c98a58" stroke-width="3" stroke-linecap="round"/>
      <line x1="4" y1="-50" x2="8" y2="-90" stroke="#deb28a" stroke-width="3" stroke-linecap="round"/>
      <line x1="10" y1="-50" x2="16" y2="-84" stroke="#c98a58" stroke-width="3" stroke-linecap="round"/>
    </g>

    <!-- 5. Paper Napkin Dispenser -->
    <g transform="translate(390, 276)">
      <rect x="-24" y="-70" width="48" height="70" rx="6" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
      <rect x="-18" y="-62" width="36" height="54" rx="4" fill="#334155"/>
      <!-- Folded brown kraft napkins -->
      <polygon points="-12,-62 12,-62 16,-82 0,-92 -16,-82" fill="#d4a373" stroke="#b07849" stroke-width="1"/>
    </g>
  </g>
</svg>'''

def get_cafetable_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 500" width="560" height="500">
  <defs>
    <filter id="tDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.25" flood-color="#261206"/>
    </filter>
    <linearGradient id="tWood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#deb28a"/>
      <stop offset="70%" stop-color="#c98a58"/>
      <stop offset="100%" stop-color="#a86835"/>
    </linearGradient>
  </defs>
  <g filter="url(#tDrop)">
    <!-- Left Chair -->
    <g transform="translate(90, 240)">
      <!-- Backrest Bentwood -->
      <path d="M-36 0 C-36 -80 36 -80 36 0" fill="none" stroke="#7a4622" stroke-width="8" stroke-linecap="round"/>
      <line x1="-18" y1="-10" x2="-18" y2="60" stroke="#7a4622" stroke-width="4"/>
      <line x1="0" y1="-20" x2="0" y2="60" stroke="#7a4622" stroke-width="4"/>
      <line x1="18" y1="-10" x2="18" y2="60" stroke="#7a4622" stroke-width="4"/>
      <!-- Seat Cushion (Orange) -->
      <ellipse cx="0" cy="60" rx="46" ry="18" fill="#e8743b" stroke="#b84c1b" stroke-width="2"/>
      <!-- Legs -->
      <line x1="-36" y1="65" x2="-44" y2="170" stroke="#5a3418" stroke-width="6" stroke-linecap="round"/>
      <line x1="36" y1="65" x2="44" y2="170" stroke="#5a3418" stroke-width="6" stroke-linecap="round"/>
      <line x1="0" y1="70" x2="0" y2="165" stroke="#4a2810" stroke-width="5" stroke-linecap="round"/>
    </g>

    <!-- Right Chair -->
    <g transform="translate(470, 240)">
      <!-- Backrest Bentwood -->
      <path d="M-36 0 C-36 -80 36 -80 36 0" fill="none" stroke="#7a4622" stroke-width="8" stroke-linecap="round"/>
      <line x1="-18" y1="-10" x2="-18" y2="60" stroke="#7a4622" stroke-width="4"/>
      <line x1="0" y1="-20" x2="0" y2="60" stroke="#7a4622" stroke-width="4"/>
      <line x1="18" y1="-10" x2="18" y2="60" stroke="#7a4622" stroke-width="4"/>
      <!-- Seat Cushion (Cream) -->
      <ellipse cx="0" cy="60" rx="46" ry="18" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <!-- Legs -->
      <line x1="-36" y1="65" x2="-44" y2="170" stroke="#5a3418" stroke-width="6" stroke-linecap="round"/>
      <line x1="36" y1="65" x2="44" y2="170" stroke="#5a3418" stroke-width="6" stroke-linecap="round"/>
      <line x1="0" y1="70" x2="0" y2="165" stroke="#4a2810" stroke-width="5" stroke-linecap="round"/>
    </g>

    <!-- Bistro Table Central Pedestal & Base -->
    <g transform="translate(280, 260)">
      <!-- Cast Iron Base -->
      <ellipse cx="0" cy="190" rx="70" ry="20" fill="#1e293b"/>
      <ellipse cx="0" cy="186" rx="60" ry="16" fill="#334155"/>
      <!-- Fluted Iron Column -->
      <rect x="-12" y="20" width="24" height="170" rx="4" fill="#1e293b"/>
      <rect x="-8" y="20" width="6" height="170" fill="#475569"/>

      <!-- Tabletop (Round 2.5D Ellipse) -->
      <ellipse cx="0" cy="20" rx="150" ry="55" fill="#8c532b"/>
      <ellipse cx="0" cy="14" rx="150" ry="55" fill="url(#tWood)" stroke="#5a3418" stroke-width="3"/>
      <!-- Wood Grain Highlight Ring -->
      <ellipse cx="0" cy="14" rx="130" ry="46" fill="none" stroke="#fedac2" stroke-width="1.5" opacity="0.6"/>

      <!-- Items on table -->
      <!-- Bud Vase with Daisy -->
      <g transform="translate(-40, 0)">
        <ellipse cx="0" cy="10" rx="10" ry="5" fill="#cbd5e1"/>
        <path d="M-8 10 L-6 -10 L6 -10 L8 10 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="0" y1="-10" x2="0" y2="-30" stroke="#22c55e" stroke-width="2.5"/>
        <circle cx="0" cy="-32" r="5" fill="#fcdb77"/>
        <circle cx="-6" cy="-32" r="4" fill="#ffffff"/><circle cx="6" cy="-32" r="4" fill="#ffffff"/><circle cx="0" cy="-38" r="4" fill="#ffffff"/><circle cx="0" cy="-26" r="4" fill="#ffffff"/>
      </g>
      <!-- Steaming Ceramic Coffee Cup with Saucer -->
      <g transform="translate(45, 8)">
        <ellipse cx="0" cy="8" rx="20" ry="7" fill="#e8743b"/>
        <path d="M-12 0 C-12 12 12 12 12 0 Z" fill="#ffffff" stroke="#e8743b" stroke-width="1.5"/>
        <ellipse cx="0" cy="0" rx="12" ry="4" fill="#5a3215"/>
        <!-- Steam -->
        <path d="M-2 -6 Q-5 -14 -2 -20" stroke="#e8743b" stroke-width="1.5" fill="none" opacity="0.7"/>
        <path d="M3 -6 Q6 -14 3 -20" stroke="#e8743b" stroke-width="1.5" fill="none" opacity="0.7"/>
      </g>
    </g>
  </g>
</svg>'''

def get_windowseat_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">
  <defs>
    <filter id="wDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity="0.25" flood-color="#24140b"/>
    </filter>
    <linearGradient id="benchWood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8c532b"/>
      <stop offset="100%" stop-color="#5a3418"/>
    </linearGradient>
  </defs>
  <g filter="url(#wDrop)">
    <!-- Wooden Booth / Bench Base Structure -->
    <rect x="40" y="240" width="560" height="180" rx="12" fill="url(#benchWood)" stroke="#3d210b" stroke-width="4"/>
    <!-- Recessed Storage Drawers in Base -->
    <rect x="70" y="280" width="220" height="110" rx="6" fill="#6d3c1a" stroke="#4a2810" stroke-width="2"/>
    <rect x="150" y="325" width="60" height="12" rx="6" fill="#deb28a"/>
    <rect x="350" y="280" width="220" height="110" rx="6" fill="#6d3c1a" stroke="#4a2810" stroke-width="2"/>
    <rect x="430" y="325" width="60" height="12" rx="6" fill="#deb28a"/>

    <!-- Thick Tufted Seat Cushion (Warm Cream / Linen) -->
    <rect x="30" y="200" width="580" height="48" rx="14" fill="#fdfbf7" stroke="#e2d4c5" stroke-width="3"/>
    <!-- Tufting buttons -->
    <circle cx="120" cy="224" r="4" fill="#d0c2b2"/>
    <circle cx="220" cy="224" r="4" fill="#d0c2b2"/>
    <circle cx="320" cy="224" r="4" fill="#d0c2b2"/>
    <circle cx="420" cy="224" r="4" fill="#d0c2b2"/>
    <circle cx="520" cy="224" r="4" fill="#d0c2b2"/>

    <!-- Cushions / Pillows propped up -->
    <!-- Pillow 1: Bold Orange #e8743b -->
    <g transform="translate(100, 150) rotate(-10)">
      <rect width="84" height="84" rx="16" fill="#e8743b" stroke="#c44f19" stroke-width="3"/>
      <circle cx="42" cy="42" r="6" fill="#fcdb77"/>
    </g>
    <!-- Pillow 2: Cozy Teal / Emerald -->
    <g transform="translate(180, 145) rotate(5)">
      <rect width="80" height="80" rx="16" fill="#0d9488" stroke="#0f766e" stroke-width="3"/>
      <path d="M20 20 L60 60 M20 60 L60 20" stroke="#99f6e4" stroke-width="2" opacity="0.6"/>
    </g>
    <!-- Pillow 3: Soft Mustard Yellow (Right Side) -->
    <g transform="translate(480, 145) rotate(12)">
      <rect width="82" height="82" rx="16" fill="#f59e0b" stroke="#d97706" stroke-width="3"/>
      <circle cx="41" cy="41" r="5" fill="#fef3c7"/>
    </g>

    <!-- Low Wooden Side Table in front -->
    <g transform="translate(340, 260)">
      <ellipse cx="0" cy="110" rx="40" ry="12" fill="#3d210b"/>
      <rect x="-8" y="40" width="16" height="70" fill="#6d3c1a"/>
      <!-- Top -->
      <ellipse cx="0" cy="40" rx="75" ry="26" fill="#deb28a" stroke="#8c532b" stroke-width="2.5"/>
      <!-- Open Magazine -->
      <polygon points="-40,36 0,42 0,26 -40,22" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <polygon points="0,42 40,36 40,22 0,26" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <!-- Ceramic Coffee Mug -->
      <ellipse cx="20" cy="30" rx="10" ry="4" fill="#e8743b"/>
      <path d="M12 24 C12 32 28 32 28 24 Z" fill="#e8743b"/>
    </g>
  </g>
</svg>'''

def get_wifisign_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 420" width="360" height="420">
  <defs>
    <filter id="wfDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.25" flood-color="#261408"/>
    </filter>
    <linearGradient id="wfSign" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fdf6ee"/>
    </linearGradient>
  </defs>
  <g filter="url(#wfDrop)">
    <!-- Wooden Stand Base -->
    <polygon points="80,390 280,390 290,410 70,410" fill="#6d3c1a" stroke="#4a2810" stroke-width="2"/>
    <rect x="100" y="375" width="160" height="16" rx="4" fill="#8c532b"/>

    <!-- Sign Board (Acrylic & Warm Wood Border) -->
    <rect x="50" y="30" width="260" height="346" rx="20" fill="#8c532b" stroke="#5a3418" stroke-width="4"/>
    <rect x="62" y="42" width="236" height="322" rx="14" fill="url(#wfSign)"/>

    <!-- Wi-Fi Waves Icon (Accent Orange) -->
    <g transform="translate(180, 110)">
      <circle cx="0" cy="22" r="7" fill="#e8743b"/>
      <path d="M-22 8 A26 26 0 0 1 22 8" fill="none" stroke="#e8743b" stroke-width="5" stroke-linecap="round"/>
      <path d="M-42 -8 A48 48 0 0 1 42 -8" fill="none" stroke="#e8743b" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M-62 -24 A70 70 0 0 1 62 -24" fill="none" stroke="#e8743b" stroke-width="6" stroke-linecap="round"/>
    </g>

    <!-- Typography -->
    <text x="180" y="180" font-family="'Trebuchet MS', 'Arial', sans-serif" font-size="22" font-weight="900" fill="#2d1c10" text-anchor="middle" letter-spacing="1">FREE WI-FI</text>
    <line x1="90" y1="194" x2="270" y2="194" stroke="#e8743b" stroke-width="2" stroke-linecap="round"/>

    <!-- Network Info Box -->
    <rect x="76" y="210" width="208" height="66" rx="8" fill="#fff6ef" stroke="#fedac2" stroke-width="1.5"/>
    <text x="90" y="232" font-family="system-ui" font-size="11" font-weight="700" fill="#7a4622">Network:</text>
    <text x="146" y="232" font-family="monospace" font-size="13" font-weight="900" fill="#e8743b">EnglishLifeCafe</text>
    <text x="90" y="258" font-family="system-ui" font-size="11" font-weight="700" fill="#7a4622">Password:</text>
    <text x="156" y="258" font-family="monospace" font-size="13" font-weight="900" fill="#22c55e">latte123</text>

    <!-- QR Code Mockup in Center -->
    <g transform="translate(150, 290)">
      <rect width="60" height="60" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- QR Blocks -->
      <rect x="6" y="6" width="18" height="18" fill="#1e293b"/>
      <rect x="10" y="10" width="10" height="10" fill="#ffffff"/>
      <rect x="36" y="6" width="18" height="18" fill="#1e293b"/>
      <rect x="40" y="10" width="10" height="10" fill="#ffffff"/>
      <rect x="6" y="36" width="18" height="18" fill="#1e293b"/>
      <rect x="10" y="40" width="10" height="10" fill="#ffffff"/>
      <!-- Data Dots -->
      <rect x="30" y="10" width="4" height="4" fill="#e8743b"/>
      <rect x="36" y="30" width="6" height="6" fill="#1e293b"/>
      <rect x="46" y="44" width="8" height="8" fill="#1e293b"/>
      <rect x="30" y="48" width="4" height="4" fill="#e8743b"/>
    </g>
  </g>
</svg>'''

def get_recyclingbin_svg():
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 520" width="460" height="520">
  <defs>
    <filter id="rcDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.25" flood-color="#24140b"/>
    </filter>
  </defs>
  <g filter="url(#rcDrop)">
    <!-- Top Tray Return Guardrail & Shelf -->
    <rect x="40" y="40" width="380" height="16" rx="4" fill="#8c532b" stroke="#5a3418" stroke-width="2"/>
    <line x1="50" y1="16" x2="410" y2="16" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
    <line x1="60" y1="16" x2="60" y2="40" stroke="#94a3b8" stroke-width="4"/>
    <line x1="400" y1="16" x2="400" y2="40" stroke="#94a3b8" stroke-width="4"/>
    <!-- Stack of Empty Brown Cafe Serving Trays -->
    <polygon points="140,36 320,36 330,22 130,22" fill="#78350f" stroke="#5a3418" stroke-width="2"/>
    <polygon points="140,28 320,28 330,14 130,14" fill="#e8743b" stroke="#b84c1b" stroke-width="1.5"/>

    <!-- Main Cabinet Body (Clean Cafe Scandinavian Wood Laminate) -->
    <rect x="36" y="56" width="388" height="420" rx="16" fill="#fdfbf7" stroke="#cbd5e1" stroke-width="3"/>

    <!-- Top Charcoal Sorting Flap Header -->
    <rect x="46" y="68" width="368" height="110" rx="10" fill="#334155"/>

    <!-- Compartment 1: Recycle Cups & Paper (Left - Blue) -->
    <g transform="translate(108, 120)">
      <circle r="34" fill="#1e293b" stroke="#3b8de8" stroke-width="3"/>
      <!-- Recycle Symbol -->
      <path d="M-10 -12 L0 -20 L10 -12 M6 -18 L12 0 M-14 10 L-6 16 L2 10" stroke="#3b8de8" stroke-width="3" fill="none" stroke-linecap="round"/>
      <text y="50" font-family="sans-serif" font-size="10" font-weight="800" fill="#1e40af" text-anchor="middle">CUPS</text>
    </g>

    <!-- Compartment 2: Liquids Sink / Drain (Center - Green/Teal) -->
    <g transform="translate(230, 120)">
      <circle r="34" fill="#1e293b" stroke="#10b981" stroke-width="3"/>
      <!-- Liquid Droplet -->
      <path d="M0 -18 C12 -4 12 12 0 16 C-12 12 -12 -4 0 -18 Z" fill="#10b981"/>
      <text y="50" font-family="sans-serif" font-size="10" font-weight="800" fill="#065f46" text-anchor="middle">LIQUIDS</text>
    </g>

    <!-- Compartment 3: General Trash (Right - Grey/Orange) -->
    <g transform="translate(352, 120)">
      <circle r="34" fill="#1e293b" stroke="#e8743b" stroke-width="3"/>
      <!-- Trash Can Graphic -->
      <rect x="-10" y="-8" width="20" height="22" rx="3" fill="#e8743b"/>
      <line x1="-14" y1="-12" x2="14" y2="-12" stroke="#e8743b" stroke-width="3"/>
      <text y="50" font-family="sans-serif" font-size="10" font-weight="800" fill="#c2410c" text-anchor="middle">TRASH</text>
    </g>

    <!-- Lower Cupboard Doors with Flush Handles -->
    <rect x="48" y="200" width="116" height="250" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="174" y="200" width="112" height="250" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="296" y="200" width="116" height="250" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Modern Handles -->
    <rect x="150" y="310" width="6" height="40" rx="3" fill="#94a3b8"/>
    <rect x="180" y="310" width="6" height="40" rx="3" fill="#94a3b8"/>
    <rect x="398" y="310" width="6" height="40" rx="3" fill="#94a3b8"/>

    <!-- Base Plinth -->
    <rect x="42" y="468" width="376" height="18" rx="4" fill="#475569"/>
  </g>
</svg>'''

# ----------------------------------------------------------------------
# 3. The 6 Action Icons (128x128 Transparent RGBA PNGs)
# ----------------------------------------------------------------------
def get_icon_svg(name):
    icons = {
        "order": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="icOrder" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <filter id="icDrop" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.28" flood-color="#7c2d12"/>
    </filter>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#icOrder)" filter="url(#icDrop)"/>
  <!-- Clipboard with coffee cup -->
  <g transform="translate(64, 62)">
    <!-- Board -->
    <rect x="-24" y="-30" width="48" height="60" rx="6" fill="#ffffff"/>
    <rect x="-12" y="-34" width="24" height="8" rx="3" fill="#cbd5e1"/>
    <!-- Lines on checklist -->
    <line x1="-16" y1="-16" x2="6" y2="-16" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    <line x1="-16" y1="-6" x2="12" y2="-6" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
    <!-- Checkmark -->
    <path d="M-16 10 L-10 16 L6 2" stroke="#ea580c" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Small Coffee Cup at bottom-right -->
    <g transform="translate(14, 14)">
      <ellipse cx="0" cy="8" rx="10" ry="3.5" fill="#fed7aa"/>
      <path d="M-7 0 C-7 8 7 8 7 0 Z" fill="#ea580c"/>
      <path d="M6 1 C10 1 10 7 6 7" stroke="#ea580c" stroke-width="1.8" fill="none"/>
    </g>
  </g>
</svg>''',

        "pay": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="icPay" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="icDropPay" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.28" flood-color="#064e3b"/>
    </filter>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#icPay)" filter="url(#icDropPay)"/>
  <!-- Credit Card + Coin -->
  <g transform="translate(64, 62)">
    <!-- Credit Card -->
    <rect x="-32" y="-22" width="64" height="42" rx="6" fill="#ffffff"/>
    <rect x="-32" y="-12" width="64" height="10" fill="#334155"/>
    <circle cx="16" cy="10" r="5" fill="#f59e0b"/>
    <circle cx="23" cy="10" r="5" fill="#ef4444" opacity="0.8"/>
    <!-- Shiny Golden Coin -->
    <circle cx="-16" cy="14" r="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
    <text x="-16" y="19" fill="#78350f" font-family="'Trebuchet MS', sans-serif" font-size="14" font-weight="900" text-anchor="middle">$</text>
  </g>
</svg>''',

        "wait": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="icWait" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="icDropWait" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.28" flood-color="#78350f"/>
    </filter>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#icWait)" filter="url(#icDropWait)"/>
  <!-- Clock / Hourglass Graphic with Coffee Steam -->
  <g transform="translate(64, 64)">
    <circle r="30" fill="#ffffff"/>
    <circle r="26" fill="#fffbeb" stroke="#f59e0b" stroke-width="2"/>
    <!-- Clock Hands (10:10 ready) -->
    <circle r="3" fill="#d97706"/>
    <line x1="0" y1="0" x2="0" y2="-16" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="12" y2="6" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Ticks -->
    <circle cx="0" cy="-22" r="1.5" fill="#b45309"/>
    <circle cx="22" cy="0" r="1.5" fill="#b45309"/>
    <circle cx="0" cy="22" r="1.5" fill="#b45309"/>
    <circle cx="-22" cy="0" r="1.5" fill="#b45309"/>
  </g>
</svg>''',

        "pickup": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="icPick" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8743b"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    <filter id="icDropPick" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.28" flood-color="#7c2d12"/>
    </filter>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#icPick)" filter="url(#icDropPick)"/>
  <!-- Serving Tray with Coffee Cup Ready -->
  <g transform="translate(64, 66)">
    <!-- Tray -->
    <ellipse cx="0" cy="18" rx="34" ry="10" fill="#ffffff"/>
    <ellipse cx="0" cy="16" rx="32" ry="8" fill="#f97316"/>
    <!-- Ceramic Cup with Heart Latte Art -->
    <ellipse cx="0" cy="4" rx="18" ry="6" fill="#fed7aa"/>
    <path d="M-14 -8 C-14 8 14 8 14 -8 Z" fill="#ffffff"/>
    <ellipse cx="0" cy="-8" rx="14" ry="5" fill="#451a03"/>
    <!-- Heart in coffee -->
    <path d="M-3 -10 C-3 -13 0 -11 0 -9 C0 -11 3 -13 3 -10 C3 -7 0 -6 0 -6 C0 -6 -3 -7 -3 -10 Z" fill="#ffffff"/>
    <!-- Handle -->
    <path d="M12 -6 C18 -6 18 2 12 2" fill="none" stroke="#ffffff" stroke-width="2.5"/>
    <!-- Sparkles -->
    <polygon points="-24,-14 -22,-8 -16,-6 -22,-4 -24,2 -26,-4 -32,-6 -26,-8" fill="#fef08a"/>
    <polygon points="24,-18 25,-14 29,-12 25,-10 24,-6 23,-10 19,-12 23,-14" fill="#fef08a"/>
  </g>
</svg>''',

        "sit": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="icSit" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>
    <filter id="icDropSit" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.28" flood-color="#4c1d95"/>
    </filter>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#icSit)" filter="url(#icDropSit)"/>
  <!-- Cozy Cafe Armchair Icon -->
  <g transform="translate(64, 62)">
    <!-- Backrest -->
    <path d="M-22 -20 C-22 -32 22 -32 22 -20 L22 10 L-22 10 Z" fill="#ffffff"/>
    <!-- Armrests -->
    <rect x="-30" y="-4" width="10" height="24" rx="4" fill="#e2e8f0"/>
    <rect x="20" y="-4" width="10" height="24" rx="4" fill="#e2e8f0"/>
    <!-- Seat Cushion -->
    <rect x="-24" y="6" width="48" height="16" rx="5" fill="#f1f5f9"/>
    <!-- Wooden Legs -->
    <line x1="-20" y1="22" x2="-26" y2="34" stroke="#fcd34d" stroke-width="4" stroke-linecap="round"/>
    <line x1="20" y1="22" x2="26" y2="34" stroke="#fcd34d" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>''',

        "wifi": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="icWifi" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <filter id="icDropWifi" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.28" flood-color="#1e3a8a"/>
    </filter>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#icWifi)" filter="url(#icDropWifi)"/>
  <!-- Wi-Fi Waves -->
  <g transform="translate(64, 76)">
    <circle cx="0" cy="0" r="6" fill="#ffffff"/>
    <path d="M-16 -12 A22 22 0 0 1 16 -12" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M-28 -24 A38 38 0 0 1 28 -24" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    <path d="M-40 -36 A54 54 0 0 1 40 -36" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round"/>
  </g>
</svg>'''
    }
    return icons[name]

# ----------------------------------------------------------------------
# Render Runner
# ----------------------------------------------------------------------
def render_svg_to_png(page, svg_code, target_path, width, height, max_kb=150):
    html = f'''<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:transparent;overflow:hidden;">
{svg_code}
</body>
</html>'''
    page.set_viewport_size({"width": width, "height": height})
    page.set_content(html)
    png_bytes = page.screenshot(omit_background=True)

    img = Image.open(io.BytesIO(png_bytes))
    # Ensure correct RGBA
    if img.mode != "RGBA" and not target_path.endswith("cafe-bg.png"):
        img = img.convert("RGBA")
    
    # Save optimized PNG
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
    print("Starting Cafe Assets Generation...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Background
        bg_svg = get_cafe_bg_svg()
        bg_path = os.path.join(OUT_DIR, "cafe-bg.png")
        render_svg_to_png(page, bg_svg, bg_path, 2000, 1280, max_kb=1000)

        # 2. 12 Objects
        objects = [
            ("menuboard", get_menuboard_svg(), 520, 440),
            ("barista", get_barista_svg(), 360, 600),
            ("cafecounter", get_cafecounter_svg(), 760, 420),
            ("cashregister", get_cashregister_svg(), 380, 420),
            ("espressomachine", get_espressomachine_svg(), 512, 440),
            ("pastrycase", get_pastrycase_svg(), 520, 440),
            ("cupstack", get_cupstack_svg(), 360, 480),
            ("condiments", get_condiments_svg(), 460, 380),
            ("cafetable", get_cafetable_svg(), 560, 500),
            ("windowseat", get_windowseat_svg(), 640, 480),
            ("wifisign", get_wifisign_svg(), 360, 420),
            ("recyclingbin", get_recyclingbin_svg(), 460, 520),
        ]

        obj_info = []
        for name, svg_code, w, h in objects:
            path = os.path.join(OUT_DIR, f"{name}.png")
            rw, rh, kb = render_svg_to_png(page, svg_code, path, w, h, max_kb=150)
            obj_info.append({"id": name, "file": f"assets/cafe/{name}.png", "kind": "object", "room": "cafe", "objectId": f"o-{name}", "w": rw, "h": rh, "kb": kb})

        # 3. 6 Action Icons (128x128)
        icons = ["order", "pay", "wait", "pickup", "sit", "wifi"]
        icon_info = []
        for name in icons:
            svg_code = get_icon_svg(name)
            path = os.path.join(OUT_DIR, f"{name}.png")
            rw, rh, kb = render_svg_to_png(page, svg_code, path, 128, 128, max_kb=150)
            icon_info.append({"name": name, "path": path, "kb": kb})

        browser.close()

    print("\nAll Cafe Assets successfully rendered!")

if __name__ == "__main__":
    main()
