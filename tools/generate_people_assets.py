"""
Generate People Assets (assets/people/) for English Life World
Characters:
1. Linh (companion): standing, talking, smiling, holding-cup
2. Visitors: elderly-neighbor, old-friend, shipper, tourist
3. Barista: brewing, serving
4. Cashier: greeting, pos
Format: 360x600 PNG, transparent background (RGBA), <= 150KB
"""
import os
import io
from PIL import Image
from playwright.sync_api import sync_playwright

OUT_DIR = r"D:\tools\Hoc tieng anh\english-life-world\assets\people"
os.makedirs(OUT_DIR, exist_ok=True)

# Common SVG Defs (shadows, gradients, filters)
SVG_DEFS = '''
  <defs>
    <filter id="pDrop" x="-20%" y="-15%" width="140%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="10" flood-opacity="0.2" flood-color="#281408"/>
    </filter>
    <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <!-- Skin gradients -->
    <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffebd9"/>
      <stop offset="100%" stop-color="#f8caa5"/>
    </linearGradient>
    <linearGradient id="skinElder" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fae3cb"/>
      <stop offset="100%" stop-color="#eec39a"/>
    </linearGradient>
    <!-- Mint Green Shirt for Linh -->
    <linearGradient id="mintShirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6ecfb1"/>
      <stop offset="100%" stop-color="#46a084"/>
    </linearGradient>
    <!-- Warm Orange Accent -->
    <linearGradient id="warmOrange" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f88d55"/>
      <stop offset="100%" stop-color="#e8743b"/>
    </linearGradient>
    <!-- Dark Apron for Barista -->
    <linearGradient id="apronGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#543015"/>
      <stop offset="100%" stop-color="#381d09"/>
    </linearGradient>
    <!-- Denim pants -->
    <linearGradient id="denimPants" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3d5a80"/>
      <stop offset="100%" stop-color="#263852"/>
    </linearGradient>
  </defs>
'''

def get_linh_head(x, y, mouth_type="smile", eyes_type="open"):
    """
    Renders Linh's head (cute short bob haircut, hazel/dark hair, mint or orange hairpin).
    """
    eyes_open = '''
      <!-- Eyes -->
      <ellipse cx="-18" cy="4" rx="4.5" ry="6" fill="#23170f"/>
      <circle cx="-16.5" cy="2" r="2" fill="#ffffff"/>
      <circle cx="-19" cy="6" r="1" fill="#ffffff"/>
      <ellipse cx="18" cy="4" rx="4.5" ry="6" fill="#23170f"/>
      <circle cx="19.5" cy="2" r="2" fill="#ffffff"/>
      <circle cx="17" cy="6" r="1" fill="#ffffff"/>
      <!-- Eyelashes & Brows -->
      <path d="M-24 1 Q-18 -3 -12 1" fill="none" stroke="#23170f" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 1 Q18 -3 24 1" fill="none" stroke="#23170f" stroke-width="2" stroke-linecap="round"/>
      <path d="M-25 -7 Q-18 -12 -11 -7" fill="none" stroke="#543825" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M11 -7 Q18 -12 25 -7" fill="none" stroke="#543825" stroke-width="2.5" stroke-linecap="round"/>
    '''
    eyes_happy = '''
      <!-- Happy closed crescent eyes -->
      <path d="M-24 4 Q-18 -2 -12 4" fill="none" stroke="#23170f" stroke-width="3" stroke-linecap="round"/>
      <path d="M12 4 Q18 -2 24 4" fill="none" stroke="#23170f" stroke-width="3" stroke-linecap="round"/>
      <path d="M-25 -7 Q-18 -13 -11 -7" fill="none" stroke="#543825" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M11 -7 Q18 -13 25 -7" fill="none" stroke="#543825" stroke-width="2.5" stroke-linecap="round"/>
    '''
    eyes_svg = eyes_happy if eyes_type == "crescent" else eyes_open

    if mouth_type == "open":
        mouth_svg = '<path d="M-8 16 Q0 26 8 16 Z" fill="#d9534f"/><path d="M-5 16 Q0 18 5 16 Z" fill="#ffffff"/>'
    elif mouth_type == "big_smile":
        mouth_svg = '<path d="M-10 14 Q0 28 10 14 Z" fill="#d9534f"/><path d="M-8 15 Q0 17 8 15 Z" fill="#ffffff"/>'
    else:
        mouth_svg = '<path d="M-7 16 Q0 22 7 16" fill="none" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/>'

    return f'''
    <g transform="translate({x}, {y})">
      <!-- Back hair -->
      <path d="M-42 6 C-46 36 -32 60 -18 64 C-10 66 10 66 18 64 C32 60 46 36 42 6 C42 -30 20 -44 0 -44 C-20 -44 -42 -30 -42 6 Z" fill="#362217"/>
      <!-- Neck -->
      <rect x="-12" y="30" width="24" height="24" rx="4" fill="url(#skin)"/>
      <path d="M-12 36 L12 36 L12 42 L-12 42 Z" fill="#e8b28d" opacity="0.3"/>
      <!-- Face -->
      <ellipse cx="0" cy="12" rx="34" ry="38" fill="url(#skin)"/>
      <!-- Cheeks Blush -->
      <circle cx="-22" cy="16" r="8" fill="#ff7f7f" opacity="0.3" filter="url(#softGlow)"/>
      <circle cx="22" cy="16" r="8" fill="#ff7f7f" opacity="0.3" filter="url(#softGlow)"/>
      <!-- Nose -->
      <circle cx="0" cy="10" r="2" fill="#e5986c"/>
      {eyes_svg}
      {mouth_svg}
      <!-- Front Hair / Cute Bangs -->
      <path d="M-40 -4 C-38 -36 38 -36 40 -4 C36 -12 28 -18 16 -18 C4 -18 -6 -12 -12 -12 C-20 -12 -30 -18 -40 -4 Z" fill="#442a1c"/>
      <path d="M-36 -12 C-26 -28 -8 -22 0 -22 C8 -22 26 -28 36 -12 C32 -18 18 -26 0 -26 C-18 -26 -32 -18 -36 -12 Z" fill="#543422"/>
      <!-- Hairpin: Warm Orange Accent -->
      <rect x="22" y="-22" width="16" height="6" rx="3" fill="#e8743b" transform="rotate(-15 22 -22)"/>
      <circle cx="36" cy="-25" r="4" fill="#ffeedd"/>
    </g>
    '''

def get_linh_standing_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <!-- Shadow beneath shoes -->
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Legs & Denim Pants -->
    <rect x="144" y="380" width="30" height="170" rx="8" fill="url(#denimPants)"/>
    <rect x="186" y="380" width="30" height="170" rx="8" fill="#22334a"/>
    <!-- Fold cuff -->
    <rect x="142" y="534" width="34" height="12" rx="4" fill="#507299"/>
    <rect x="184" y="534" width="34" height="12" rx="4" fill="#507299"/>

    <!-- Sneakers (White with orange details) -->
    <ellipse cx="158" cy="564" rx="20" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M140 564 Q158 554 176 564" fill="none" stroke="#e8743b" stroke-width="3"/>
    <ellipse cx="202" cy="564" rx="20" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M184 564 Q202 554 220 564" fill="none" stroke="#e8743b" stroke-width="3"/>

    <!-- Torso: Mint Green Shirt -->
    <path d="M136 210 L224 210 L236 390 L124 390 Z" fill="url(#mintShirt)" stroke="#39846d" stroke-width="2"/>
    <!-- Collar: White Cream Peter-Pan collar -->
    <path d="M180 226 C165 226 150 216 152 210 C162 208 178 214 180 226 Z" fill="#ffffff"/>
    <path d="M180 226 C195 226 210 216 208 210 C198 208 182 214 180 226 Z" fill="#ffffff"/>
    <!-- Buttons -->
    <circle cx="180" cy="254" r="3" fill="#ffffff"/>
    <circle cx="180" cy="286" r="3" fill="#ffffff"/>
    <circle cx="180" cy="318" r="3" fill="#ffffff"/>
    <!-- Belt: Warm Camel Brown -->
    <rect x="124" y="376" width="112" height="14" rx="3" fill="#9c633a"/>
    <rect x="172" y="373" width="16" height="20" rx="3" fill="#e8a83b" stroke="#7a4622" stroke-width="1.5"/>

    <!-- Left Arm: relaxed at side -->
    <path d="M136 215 L106 295 L112 360" fill="none" stroke="#url(mintShirt)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M136 215 L106 295 L112 360" fill="none" stroke="#46a084" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="114" cy="370" r="10" fill="url(#skin)"/>

    <!-- Right Arm: hands on hip -->
    <path d="M224 215 L254 280 L228 335" fill="none" stroke="#46a084" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="224" cy="340" r="10" fill="url(#skin)"/>

    <!-- Head -->
    {get_linh_head(180, 150, mouth_type="smile", eyes_type="open")}
  </g>
</svg>'''

def get_linh_talking_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <!-- Shadow beneath shoes -->
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Legs & Denim Pants -->
    <rect x="144" y="380" width="30" height="170" rx="8" fill="url(#denimPants)"/>
    <rect x="186" y="380" width="30" height="170" rx="8" fill="#22334a"/>
    <rect x="142" y="534" width="34" height="12" rx="4" fill="#507299"/>
    <rect x="184" y="534" width="34" height="12" rx="4" fill="#507299"/>

    <!-- Sneakers -->
    <ellipse cx="158" cy="564" rx="20" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M140 564 Q158 554 176 564" fill="none" stroke="#e8743b" stroke-width="3"/>
    <ellipse cx="202" cy="564" rx="20" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M184 564 Q202 554 220 564" fill="none" stroke="#e8743b" stroke-width="3"/>

    <!-- Torso: Mint Green Shirt -->
    <path d="M136 210 L224 210 L236 390 L124 390 Z" fill="url(#mintShirt)" stroke="#39846d" stroke-width="2"/>
    <path d="M180 226 C165 226 150 216 152 210 C162 208 178 214 180 226 Z" fill="#ffffff"/>
    <path d="M180 226 C195 226 210 216 208 210 C198 208 182 214 180 226 Z" fill="#ffffff"/>
    <circle cx="180" cy="254" r="3" fill="#ffffff"/>
    <circle cx="180" cy="286" r="3" fill="#ffffff"/>
    <circle cx="180" cy="318" r="3" fill="#ffffff"/>
    <rect x="124" y="376" width="112" height="14" rx="3" fill="#9c633a"/>
    <rect x="172" y="373" width="16" height="20" rx="3" fill="#e8a83b" stroke="#7a4622" stroke-width="1.5"/>

    <!-- Left Arm: Gesturing up and forward (explaining) -->
    <path d="M136 215 L96 260 L80 220" fill="none" stroke="#46a084" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="80" cy="214" r="11" fill="url(#skin)"/>
    <!-- Small gesture sparkle -->
    <path d="M60 200 L68 200 M64 196 L64 204" stroke="#e8743b" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Right Arm: Relaxed down with palm facing slightly out -->
    <path d="M224 215 L252 290 L248 350" fill="none" stroke="#46a084" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="248" cy="358" r="10" fill="url(#skin)"/>

    <!-- Head (Talking, open mouth) -->
    {get_linh_head(180, 150, mouth_type="open", eyes_type="open")}
  </g>
</svg>'''

def get_linh_smiling_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <!-- Shadow beneath shoes -->
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Legs & Denim Pants -->
    <rect x="144" y="380" width="30" height="170" rx="8" fill="url(#denimPants)"/>
    <rect x="186" y="380" width="30" height="170" rx="8" fill="#22334a"/>
    <rect x="142" y="534" width="34" height="12" rx="4" fill="#507299"/>
    <rect x="184" y="534" width="34" height="12" rx="4" fill="#507299"/>

    <!-- Sneakers -->
    <ellipse cx="158" cy="564" rx="20" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M140 564 Q158 554 176 564" fill="none" stroke="#e8743b" stroke-width="3"/>
    <ellipse cx="202" cy="564" rx="20" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M184 564 Q202 554 220 564" fill="none" stroke="#e8743b" stroke-width="3"/>

    <!-- Torso: Mint Green Shirt -->
    <path d="M136 210 L224 210 L236 390 L124 390 Z" fill="url(#mintShirt)" stroke="#39846d" stroke-width="2"/>
    <path d="M180 226 C165 226 150 216 152 210 C162 208 178 214 180 226 Z" fill="#ffffff"/>
    <path d="M180 226 C195 226 210 216 208 210 C198 208 182 214 180 226 Z" fill="#ffffff"/>
    <circle cx="180" cy="254" r="3" fill="#ffffff"/>
    <circle cx="180" cy="286" r="3" fill="#ffffff"/>
    <circle cx="180" cy="318" r="3" fill="#ffffff"/>
    <rect x="124" y="376" width="112" height="14" rx="3" fill="#9c633a"/>
    <rect x="172" y="373" width="16" height="20" rx="3" fill="#e8a83b" stroke="#7a4622" stroke-width="1.5"/>

    <!-- Left Arm: Waving hand high -->
    <path d="M136 215 L96 230 L80 160" fill="none" stroke="#46a084" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="80" cy="150" r="12" fill="url(#skin)"/>
    <!-- Small waving lines -->
    <path d="M64 136 Q70 144 66 152" fill="none" stroke="#e8743b" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M58 140 Q62 146 60 152" fill="none" stroke="#e8743b" stroke-width="2" stroke-linecap="round"/>

    <!-- Right Arm: Hand on chest/heart in joy -->
    <path d="M224 215 L238 275 L196 270" fill="none" stroke="#46a084" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="190" cy="270" r="10" fill="url(#skin)"/>

    <!-- Head (Smiling happily, crescent eyes) -->
    {get_linh_head(180, 150, mouth_type="big_smile", eyes_type="crescent")}
  </g>
</svg>'''

def get_linh_holding_cup_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <!-- Shadow beneath shoes -->
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Legs & Denim Pants -->
    <rect x="144" y="380" width="30" height="170" rx="8" fill="url(#denimPants)"/>
    <rect x="186" y="380" width="30" height="170" rx="8" fill="#22334a"/>
    <rect x="142" y="534" width="34" height="12" rx="4" fill="#507299"/>
    <rect x="184" y="534" width="34" height="12" rx="4" fill="#507299"/>

    <!-- Sneakers -->
    <ellipse cx="158" cy="564" rx="20" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M140 564 Q158 554 176 564" fill="none" stroke="#e8743b" stroke-width="3"/>
    <ellipse cx="202" cy="564" rx="20" ry="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M184 564 Q202 554 220 564" fill="none" stroke="#e8743b" stroke-width="3"/>

    <!-- Torso: Mint Green Shirt -->
    <path d="M136 210 L224 210 L236 390 L124 390 Z" fill="url(#mintShirt)" stroke="#39846d" stroke-width="2"/>
    <path d="M180 226 C165 226 150 216 152 210 C162 208 178 214 180 226 Z" fill="#ffffff"/>
    <path d="M180 226 C195 226 210 216 208 210 C198 208 182 214 180 226 Z" fill="#ffffff"/>
    <circle cx="180" cy="254" r="3" fill="#ffffff"/>
    <circle cx="180" cy="286" r="3" fill="#ffffff"/>
    <circle cx="180" cy="318" r="3" fill="#ffffff"/>
    <rect x="124" y="376" width="112" height="14" rx="3" fill="#9c633a"/>
    <rect x="172" y="373" width="16" height="20" rx="3" fill="#e8a83b" stroke="#7a4622" stroke-width="1.5"/>

    <!-- Left & Right Arms holding cup in center -->
    <path d="M136 215 L145 285 L164 285" fill="none" stroke="#46a084" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M224 215 L215 285 L196 285" fill="none" stroke="#46a084" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="160" cy="285" r="10" fill="url(#skin)"/>
    <circle cx="200" cy="285" r="10" fill="url(#skin)"/>

    <!-- Coffee Mug with steam -->
    <g transform="translate(180, 275)">
      <!-- Saucer -->
      <ellipse cx="0" cy="24" rx="22" ry="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <!-- Cup Body: Warm Orange Ceramic -->
      <path d="M-15 0 C-15 20 15 20 15 0 Z" fill="#e8743b" stroke="#c4531b" stroke-width="1.5"/>
      <ellipse cx="0" cy="0" rx="15" ry="5" fill="#fceee6"/>
      <ellipse cx="0" cy="0" rx="12" ry="4" fill="#6d3f1a"/>
      <!-- Cup handle -->
      <path d="M14 4 C22 4 22 14 14 16" fill="none" stroke="#e8743b" stroke-width="3"/>
      <!-- Steam curls -->
      <path d="M-4 -6 Q-8 -14 -4 -22" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
      <path d="M4 -6 Q0 -14 4 -22" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
    </g>

    <!-- Head -->
    {get_linh_head(180, 150, mouth_type="smile", eyes_type="open")}
  </g>
</svg>'''

def get_elderly_neighbor_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Pants: Grey Trousers -->
    <rect x="144" y="390" width="32" height="160" rx="8" fill="#475569"/>
    <rect x="184" y="390" width="32" height="160" rx="8" fill="#334155"/>
    <ellipse cx="156" cy="564" rx="22" ry="11" fill="#382110"/>
    <ellipse cx="204" cy="564" rx="22" ry="11" fill="#382110"/>

    <!-- Torso: Warm Brown Wool Cardigan over light shirt -->
    <path d="M130 220 L230 220 L242 400 L118 400 Z" fill="#8c582f" stroke="#663c1d" stroke-width="2"/>
    <!-- Cardigan Knit V-neck -->
    <polygon points="180,310 156,220 204,220" fill="#f1f5f9"/>
    <line x1="180" y1="220" x2="180" y2="310" stroke="#cbd5e1" stroke-width="1.5"/>
    <!-- Cardigan Buttons & Cable-knit pattern -->
    <line x1="148" y1="230" x2="148" y2="390" stroke="#754722" stroke-width="2" stroke-dasharray="6,4"/>
    <line x1="212" y1="230" x2="212" y2="390" stroke="#754722" stroke-width="2" stroke-dasharray="6,4"/>
    <circle cx="180" cy="335" r="3.5" fill="#e2a44b"/>
    <circle cx="180" cy="365" r="3.5" fill="#e2a44b"/>

    <!-- Left Arm: Holding Wicker Shopping Basket -->
    <path d="M130 225 L100 300 L108 375" fill="none" stroke="#8c582f" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="108" cy="385" r="11" fill="url(#skinElder)"/>
    <!-- Wicker Basket with Baguette and flowers -->
    <g transform="translate(108, 410)">
      <!-- Basket body -->
      <path d="M-22 0 L22 0 L16 34 L-16 34 Z" fill="#c49058" stroke="#8c5a24" stroke-width="2"/>
      <line x1="-18" y1="10" x2="18" y2="10" stroke="#8c5a24" stroke-width="1.5"/>
      <line x1="-16" y1="22" x2="16" y2="22" stroke="#8c5a24" stroke-width="1.5"/>
      <!-- Baguette sticking out -->
      <rect x="-8" y="-24" width="12" height="30" rx="5" fill="#e29f52" stroke="#b0722e" stroke-width="1.5" transform="rotate(-15)"/>
      <!-- Flower bouquet -->
      <circle cx="10" cy="-6" r="6" fill="#f43f5e"/>
      <circle cx="10" cy="-6" r="2" fill="#fef08a"/>
      <!-- Handle -->
      <path d="M-18 0 C-18 -26 18 -26 18 0" fill="none" stroke="#8c5a24" stroke-width="3"/>
    </g>

    <!-- Right Arm: Resting peacefully or holding wooden cane -->
    <path d="M230 225 L255 310 L250 395" fill="none" stroke="#8c582f" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="250" cy="405" r="11" fill="url(#skinElder)"/>
    <!-- Wooden Walking Cane -->
    <path d="M250 390 C250 360 270 360 270 380 L270 564" fill="none" stroke="#683d1c" stroke-width="6" stroke-linecap="round"/>

    <!-- Head: Kind Elderly Man/Woman with spectacles and silver hair -->
    <g transform="translate(180, 155)">
      <!-- Silver Curly Hair -->
      <ellipse cx="0" cy="-8" rx="42" ry="40" fill="#e2e4e9"/>
      <circle cx="-32" cy="0" r="16" fill="#d1d5db"/>
      <circle cx="32" cy="0" r="16" fill="#d1d5db"/>
      <!-- Face -->
      <ellipse cx="0" cy="10" rx="34" ry="36" fill="url(#skinElder)"/>
      <!-- Wrinkles / Smile lines -->
      <path d="M-28 6 Q-24 10 -26 14" fill="none" stroke="#d59a72" stroke-width="1.5"/>
      <path d="M28 6 Q24 10 26 14" fill="none" stroke="#d59a72" stroke-width="1.5"/>
      <!-- Round Spectacles (Golden frame) -->
      <circle cx="-16" cy="6" r="10" fill="#ffffff" fill-opacity="0.3" stroke="#d97706" stroke-width="2"/>
      <circle cx="16" cy="6" r="10" fill="#ffffff" fill-opacity="0.3" stroke="#d97706" stroke-width="2"/>
      <line x1="-6" y1="6" x2="6" y2="6" stroke="#d97706" stroke-width="2"/>
      <!-- Eyes behind glasses -->
      <circle cx="-16" cy="6" r="3" fill="#1e293b"/>
      <circle cx="16" cy="6" r="3" fill="#1e293b"/>
      <!-- Brows (white) -->
      <path d="M-24 -4 Q-16 -8 -8 -4" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <path d="M8 -4 Q16 -8 24 -4" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <!-- Warm smile -->
      <path d="M-10 24 Q0 32 10 24" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  </g>
</svg>'''

def get_old_friend_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Backpack strap visible over shoulder -->
    <path d="M220 220 L240 340" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>

    <!-- Jeans -->
    <rect x="144" y="380" width="32" height="170" rx="8" fill="#1e3a5f"/>
    <rect x="184" y="380" width="32" height="170" rx="8" fill="#172e4c"/>
    <ellipse cx="158" cy="564" rx="22" ry="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <ellipse cx="202" cy="564" rx="22" ry="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>

    <!-- Torso: Warm Orange & Navy Sporty Bomber Jacket -->
    <path d="M130 210 L230 210 L240 385 L120 385 Z" fill="#e8743b" stroke="#c2521e" stroke-width="2"/>
    <!-- Navy sleeves and ribbed trim -->
    <rect x="120" y="375" width="120" height="14" rx="3" fill="#1e293b"/>
    <polygon points="180,240 160,210 200,210" fill="#ffffff"/>
    <line x1="180" y1="240" x2="180" y2="375" stroke="#1e293b" stroke-width="3"/>

    <!-- Left Arm: Waving high enthusiastically -->
    <path d="M130 215 L90 190 L75 125" fill="none" stroke="#1e293b" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="72" cy="115" r="12" fill="url(#skin)"/>
    <!-- Greeting lines -->
    <path d="M54 100 Q62 108 58 116" fill="none" stroke="#e8743b" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Right Arm: Holding strap of backpack -->
    <path d="M230 215 L252 280 L236 330" fill="none" stroke="#1e293b" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="236" cy="335" r="11" fill="url(#skin)"/>

    <!-- Head: Dynamic youthful friend, wavy brown hair -->
    <g transform="translate(180, 150)">
      <!-- Wavy Hair -->
      <path d="M-40 0 C-46 -34 46 -34 40 0 C44 26 36 34 26 36 C-36 36 -44 26 -40 0 Z" fill="#452c1e"/>
      <ellipse cx="0" cy="10" rx="34" ry="36" fill="url(#skin)"/>
      <!-- Cheerful eyes & eyebrows -->
      <ellipse cx="-16" cy="6" rx="4" ry="5.5" fill="#1e293b"/>
      <circle cx="-14" cy="4" r="1.5" fill="#ffffff"/>
      <ellipse cx="16" cy="6" rx="4" ry="5.5" fill="#1e293b"/>
      <circle cx="18" cy="4" r="1.5" fill="#ffffff"/>
      <path d="M-22 -5 Q-16 -10 -10 -5" fill="none" stroke="#452c1e" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M10 -5 Q16 -10 22 -5" fill="none" stroke="#452c1e" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Big friendly open laugh -->
      <path d="M-10 18 Q0 30 10 18 Z" fill="#d9534f"/>
      <path d="M-8 19 Q0 21 8 19 Z" fill="#ffffff"/>
      <!-- Front stylish quiff hair -->
      <path d="M-36 -10 C-30 -34 20 -36 34 -14 C26 -18 10 -22 -6 -20 C-18 -18 -28 -14 -36 -10 Z" fill="#5c3b28"/>
    </g>
  </g>
</svg>'''

def get_shipper_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Dark cargo pants with pockets -->
    <rect x="144" y="380" width="32" height="170" rx="8" fill="#334155"/>
    <rect x="184" y="380" width="32" height="170" rx="8" fill="#1e293b"/>
    <rect x="138" y="440" width="12" height="24" rx="3" fill="#475569"/>
    <rect x="210" y="440" width="12" height="24" rx="3" fill="#475569"/>
    <ellipse cx="158" cy="564" rx="22" ry="11" fill="#0f172a"/>
    <ellipse cx="202" cy="564" rx="22" ry="11" fill="#0f172a"/>

    <!-- Torso: Delivery Uniform Jacket (Bright Emerald Green & Orange trim) -->
    <path d="M130 210 L230 210 L238 385 L122 385 Z" fill="#059669" stroke="#047857" stroke-width="2"/>
    <!-- Reflective Safety Strip -->
    <rect x="124" y="320" width="112" height="12" fill="#fbbf24" opacity="0.9"/>
    <!-- Crossbody bag strap -->
    <line x1="130" y1="215" x2="220" y2="385" stroke="#1f2937" stroke-width="10"/>

    <!-- Left & Right Arms hugging the Cardboard Parcel -->
    <path d="M130 215 L106 280 L126 315" fill="none" stroke="#059669" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M230 215 L254 280 L234 315" fill="none" stroke="#059669" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="126" cy="320" r="11" fill="url(#skin)"/>
    <circle cx="234" cy="320" r="11" fill="url(#skin)"/>

    <!-- Parcel Box held in center -->
    <g transform="translate(180, 310)">
      <!-- Kraft Box 2.5D -->
      <polygon points="-46,-20 46,-20 46,26 -46,26" fill="#d97706" stroke="#b45309" stroke-width="2"/>
      <polygon points="-46,-20 0,-34 46,-20 0,-8" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      <!-- Tape & Shipping Label -->
      <rect x="-8" y="-20" width="16" height="46" fill="#fbbf24" opacity="0.8"/>
      <rect x="10" y="-8" width="26" height="20" rx="2" fill="#ffffff"/>
      <line x1="14" y1="-2" x2="30" y2="-2" stroke="#0f172a" stroke-width="2"/>
      <line x1="14" y1="4" x2="26" y2="4" stroke="#0f172a" stroke-width="2"/>
      <!-- Fragile glass icon -->
      <path d="M-30 0 L-26 -8 L-22 0 Z" fill="#ef4444"/>
    </g>

    <!-- Head: Cap, friendly smile -->
    <g transform="translate(180, 150)">
      <ellipse cx="0" cy="10" rx="34" ry="36" fill="url(#skin)"/>
      <ellipse cx="-16" cy="8" rx="4" ry="5.5" fill="#1e293b"/>
      <ellipse cx="16" cy="8" rx="4" ry="5.5" fill="#1e293b"/>
      <circle cx="-14" cy="6" r="1.5" fill="#ffffff"/>
      <circle cx="18" cy="6" r="1.5" fill="#ffffff"/>
      <path d="M-8 22 Q0 28 8 22" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Delivery Baseball Cap (Orange with visor) -->
      <path d="M-38 -6 C-38 -36 38 -36 38 -6 Z" fill="#ea580c"/>
      <!-- Visor -->
      <path d="M-38 -6 Q0 -18 48 4 Q10 8 -38 -6 Z" fill="#c2410c"/>
      <!-- Cap logo: Small lightning / arrow -->
      <polygon points="0,-22 4,-14 -2,-14 2,-6 -4,-12 2,-12" fill="#ffffff"/>
    </g>
  </g>
</svg>'''

def get_tourist_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Khaki Shorts & Walking Boots -->
    <rect x="144" y="380" width="32" height="100" rx="6" fill="#ca8a04"/>
    <rect x="184" y="380" width="32" height="100" rx="6" fill="#a16207"/>
    <!-- Legs -->
    <rect x="148" y="470" width="24" height="60" rx="4" fill="url(#skin)"/>
    <rect x="188" y="470" width="24" height="60" rx="4" fill="url(#skin)"/>
    <!-- Hiking Socks & Boots -->
    <rect x="146" y="520" width="28" height="18" rx="3" fill="#f8fafc"/>
    <rect x="186" y="520" width="28" height="18" rx="3" fill="#f8fafc"/>
    <ellipse cx="158" cy="564" rx="24" ry="12" fill="#78350f"/>
    <ellipse cx="202" cy="564" rx="24" ry="12" fill="#78350f"/>

    <!-- Torso: Striped Breton Shirt (Blue & White) -->
    <path d="M130 210 L230 210 L238 385 L122 385 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <line x1="126" y1="240" x2="234" y2="240" stroke="#0284c7" stroke-width="6"/>
    <line x1="124" y1="270" x2="236" y2="270" stroke="#0284c7" stroke-width="6"/>
    <line x1="122" y1="300" x2="238" y2="300" stroke="#0284c7" stroke-width="6"/>
    <line x1="122" y1="330" x2="238" y2="330" stroke="#0284c7" stroke-width="6"/>
    <line x1="122" y1="360" x2="238" y2="360" stroke="#0284c7" stroke-width="6"/>

    <!-- Vintage Camera hanging on leather strap -->
    <path d="M145 210 C145 270 170 280 180 280 C190 280 215 270 215 210" fill="none" stroke="#78350f" stroke-width="3"/>
    <rect x="165" y="270" width="30" height="20" rx="4" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
    <circle cx="180" cy="280" r="6" fill="#475569" stroke="#94a3b8" stroke-width="1.5"/>

    <!-- Arms holding unfolded tourist map -->
    <path d="M130 215 L98 280 L118 330" fill="none" stroke="#0284c7" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M230 215 L262 280 L242 330" fill="none" stroke="#0284c7" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="118" cy="335" r="10" fill="url(#skin)"/>
    <circle cx="242" cy="335" r="10" fill="url(#skin)"/>

    <!-- Unfolded City Map (with fold creases, green park zones, red pins) -->
    <g transform="translate(180, 340)">
      <!-- Map paper folds -->
      <polygon points="-65,-25 -22,-30 -22,35 -65,30" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
      <polygon points="-22,-30 22,-25 22,40 -22,35" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
      <polygon points="22,-25 65,-30 65,30 22,40" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
      <!-- Map road lines -->
      <path d="M-55 0 L-30 5 L0 -10 L45 0" fill="none" stroke="#ea580c" stroke-width="2"/>
      <rect x="-15" y="5" width="24" height="18" rx="2" fill="#86efac" opacity="0.8"/>
      <!-- Red Destination Pin -->
      <circle cx="0" cy="-10" r="4" fill="#dc2626"/>
      <circle cx="0" cy="-10" r="1.5" fill="#ffffff"/>
    </g>

    <!-- Head: Explorer Safari Bucket Hat -->
    <g transform="translate(180, 150)">
      <ellipse cx="0" cy="12" rx="34" ry="36" fill="url(#skin)"/>
      <ellipse cx="-16" cy="10" rx="4" ry="5.5" fill="#1e293b"/>
      <ellipse cx="16" cy="10" rx="4" ry="5.5" fill="#1e293b"/>
      <circle cx="-14" cy="8" r="1.5" fill="#ffffff"/>
      <circle cx="18" cy="8" r="1.5" fill="#ffffff"/>
      <path d="M-8 24 Q0 30 8 24" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Bucket Hat (Khaki Safari Hat) -->
      <path d="M-34 -4 C-34 -32 34 -32 34 -4 Z" fill="#e7e5e4"/>
      <!-- Hat Rim (Wider) -->
      <ellipse cx="0" cy="-2" rx="48" ry="12" fill="#d6d3d1"/>
      <rect x="-34" y="-12" width="68" height="6" fill="#e8743b"/>
    </g>
  </g>
</svg>'''

def get_barista_brewing_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Legs / Dark Pants -->
    <rect x="144" y="440" width="32" height="130" rx="8" fill="#334155"/>
    <rect x="184" y="440" width="32" height="130" rx="8" fill="#1e293b"/>
    <ellipse cx="158" cy="572" rx="24" ry="12" fill="#0f172a"/>
    <ellipse cx="202" cy="572" rx="24" ry="12" fill="#0f172a"/>

    <!-- Torso / White Shirt -->
    <path d="M124 185 L236 185 L242 420 L118 420 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <!-- Collar & Orange Tie -->
    <polygon points="180,210 162,185 198,185" fill="#e8743b"/>
    <polygon points="175,210 185,210 190,250 180,265 170,250" fill="#c44f19"/>

    <!-- Apron: Dark Coffee Canvas -->
    <path d="M136 215 L224 215 L236 450 L124 450 Z" fill="url(#apronGrad)" stroke="#271305" stroke-width="2"/>
    <line x1="140" y1="185" x2="148" y2="215" stroke="#8c532b" stroke-width="7"/>
    <line x1="220" y1="185" x2="212" y2="215" stroke="#8c532b" stroke-width="7"/>
    <!-- Apron Pocket -->
    <rect x="146" y="300" width="68" height="55" rx="6" fill="#45240c" stroke="#663613" stroke-width="2"/>
    <!-- Cupping spoon and thermometer -->
    <line x1="160" y1="285" x2="160" y2="305" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <line x1="172" y1="288" x2="172" y2="305" stroke="#e8743b" stroke-width="3" stroke-linecap="round"/>
    <!-- Name Badge: "BARISTA" -->
    <rect x="148" y="235" width="36" height="16" rx="3" fill="#ffffff"/>
    <rect x="151" y="241" width="30" height="4" rx="1" fill="#e8743b"/>

    <!-- Left Arm: Holding Stainless Milk Pitcher / Steaming -->
    <path d="M124 195 L84 270 L116 315" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="116" cy="315" r="11" fill="url(#skin)"/>
    <!-- Stainless Steel Milk Pitcher -->
    <g transform="translate(116, 310)">
      <path d="M-12 0 L14 0 L10 24 L-10 24 Z" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
      <path d="M14 0 L18 -6 L14 4 Z" fill="#64748b"/>
      <!-- Microfoam Steam -->
      <path d="M-2 -8 Q-6 -18 -2 -26" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    </g>

    <!-- Right Arm: Holding Espresso Portafilter handle -->
    <path d="M236 195 L276 270 L246 315" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="246" cy="315" r="11" fill="url(#skin)"/>
    <!-- Portafilter -->
    <g transform="translate(246, 315)">
      <rect x="0" y="-5" width="28" height="10" rx="3" fill="#1e293b"/>
      <circle cx="-6" cy="0" r="10" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
      <rect x="-10" y="8" width="8" height="6" fill="#64748b"/>
    </g>

    <!-- Head: Neat Hair, focused professional expression -->
    <g transform="translate(180, 135)">
      <path d="M-36 0 C-40 -34 40 -34 36 0 C40 24 32 34 22 36 C-32 36 -40 24 -36 0 Z" fill="#2d1b10"/>
      <ellipse cx="0" cy="12" rx="32" ry="34" fill="url(#skin)"/>
      <ellipse cx="-15" cy="10" rx="4" ry="5.5" fill="#1e293b"/>
      <ellipse cx="15" cy="10" rx="4" ry="5.5" fill="#1e293b"/>
      <circle cx="-13" cy="8" r="1.5" fill="#ffffff"/>
      <circle cx="17" cy="8" r="1.5" fill="#ffffff"/>
      <path d="M-6 24 Q0 29 6 24" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Stylish side parted hair -->
      <path d="M-34 -8 C-28 -28 14 -32 32 -10 C24 -18 8 -24 -6 -20 C-18 -18 -26 -12 -34 -8 Z" fill="#422818"/>
    </g>
  </g>
</svg>'''

def get_barista_serving_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Legs / Dark Pants -->
    <rect x="144" y="440" width="32" height="130" rx="8" fill="#334155"/>
    <rect x="184" y="440" width="32" height="130" rx="8" fill="#1e293b"/>
    <ellipse cx="158" cy="572" rx="24" ry="12" fill="#0f172a"/>
    <ellipse cx="202" cy="572" rx="24" ry="12" fill="#0f172a"/>

    <!-- Torso / White Shirt -->
    <path d="M124 185 L236 185 L242 420 L118 420 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <polygon points="180,210 162,185 198,185" fill="#e8743b"/>
    <polygon points="175,210 185,210 190,250 180,265 170,250" fill="#c44f19"/>

    <!-- Apron -->
    <path d="M136 215 L224 215 L236 450 L124 450 Z" fill="url(#apronGrad)" stroke="#271305" stroke-width="2"/>
    <line x1="140" y1="185" x2="148" y2="215" stroke="#8c532b" stroke-width="7"/>
    <line x1="220" y1="185" x2="212" y2="215" stroke="#8c532b" stroke-width="7"/>
    <rect x="148" y="235" width="36" height="16" rx="3" fill="#ffffff"/>
    <rect x="151" y="241" width="30" height="4" rx="1" fill="#e8743b"/>

    <!-- Both Arms extended forward carrying Wooden Serving Tray -->
    <path d="M124 195 L116 280 L145 320" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M236 195 L244 280 L215 320" fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="142" cy="324" r="11" fill="url(#skin)"/>
    <circle cx="218" cy="324" r="11" fill="url(#skin)"/>

    <!-- Wooden Serving Tray with Fresh Latte & Croissant -->
    <g transform="translate(180, 320)">
      <!-- Oval Tray -->
      <ellipse cx="0" cy="6" rx="64" ry="18" fill="#a16207" stroke="#78350f" stroke-width="2"/>
      <ellipse cx="0" cy="4" rx="58" ry="14" fill="#ca8a04"/>
      <!-- Ceramic Cup with Heart Latte Art -->
      <g transform="translate(-20, -4)">
        <ellipse cx="0" cy="12" rx="18" ry="6" fill="#e2e8f0"/>
        <path d="M-12 -2 C-12 14 12 14 12 -2 Z" fill="#e8743b" stroke="#c2410c" stroke-width="1.5"/>
        <ellipse cx="0" cy="-2" rx="12" ry="4" fill="#78350f"/>
        <!-- Heart Art -->
        <path d="M0 0 C-4 -4 -6 0 0 3 C6 0 4 -4 0 0 Z" fill="#ffffff"/>
      </g>
      <!-- Croissant on Small Plate -->
      <g transform="translate(24, 0)">
        <ellipse cx="0" cy="6" rx="18" ry="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <path d="M-12 4 Q0 -8 12 4 Q0 1 0 1 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      </g>
    </g>

    <!-- Head: Happy hospitable smile -->
    <g transform="translate(180, 135)">
      <path d="M-36 0 C-40 -34 40 -34 36 0 C40 24 32 34 22 36 C-32 36 -40 24 -36 0 Z" fill="#2d1b10"/>
      <ellipse cx="0" cy="12" rx="32" ry="34" fill="url(#skin)"/>
      <ellipse cx="-15" cy="10" rx="4" ry="5.5" fill="#1e293b"/>
      <ellipse cx="15" cy="10" rx="4" ry="5.5" fill="#1e293b"/>
      <circle cx="-13" cy="8" r="1.5" fill="#ffffff"/>
      <circle cx="17" cy="8" r="1.5" fill="#ffffff"/>
      <path d="M-8 22 Q0 30 8 22 Z" fill="#d9534f"/>
      <path d="M-6 23 Q0 25 6 23 Z" fill="#ffffff"/>
      <path d="M-34 -8 C-28 -28 14 -32 32 -10 C24 -18 8 -24 -6 -20 C-18 -18 -26 -12 -34 -8 Z" fill="#422818"/>
    </g>
  </g>
</svg>'''

def get_cashier_greeting_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Black Trousers -->
    <rect x="144" y="400" width="32" height="150" rx="8" fill="#1e293b"/>
    <rect x="184" y="400" width="32" height="150" rx="8" fill="#0f172a"/>
    <ellipse cx="158" cy="564" rx="22" ry="10" fill="#0f172a"/>
    <ellipse cx="202" cy="564" rx="22" ry="10" fill="#0f172a"/>

    <!-- Torso: Neat Uniform Polo Shirt (Warm Cream & Orange Trim) -->
    <path d="M128 200 L232 200 L240 405 L120 405 Z" fill="#fdfbf7" stroke="#e2d4c5" stroke-width="2"/>
    <!-- Orange Trim Collar -->
    <path d="M180 220 L154 200 L206 200 Z" fill="#e8743b"/>
    <line x1="180" y1="220" x2="180" y2="260" stroke="#c4531b" stroke-width="2"/>
    <circle cx="180" cy="235" r="2.5" fill="#ffffff"/>
    <circle cx="180" cy="250" r="2.5" fill="#ffffff"/>
    <!-- Staff ID Card -->
    <rect x="145" y="235" width="28" height="18" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="148" y="240" width="10" height="8" fill="#e8743b"/>
    <line x1="162" y1="242" x2="170" y2="242" stroke="#475569" stroke-width="1.5"/>

    <!-- Left Arm: Welcoming gesture guiding towards counter -->
    <path d="M128 205 L96 265 L76 300" fill="none" stroke="#fdfbf7" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="72" cy="305" r="10" fill="url(#skin)"/>

    <!-- Right Arm: Hand resting gracefully in front -->
    <path d="M232 205 L252 280 L220 320" fill="none" stroke="#fdfbf7" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="215" cy="325" r="10" fill="url(#skin)"/>

    <!-- Head: Friendly Cashier with neat ponytail -->
    <g transform="translate(180, 145)">
      <!-- Ponytail at back -->
      <path d="M25 0 C45 10 50 40 38 60 C32 50 35 30 25 20 Z" fill="#26170e"/>
      <ellipse cx="0" cy="10" rx="33" ry="35" fill="url(#skin)"/>
      <ellipse cx="-16" cy="8" rx="4" ry="5.5" fill="#1e293b"/>
      <ellipse cx="16" cy="8" rx="4" ry="5.5" fill="#1e293b"/>
      <circle cx="-14" cy="6" r="1.5" fill="#ffffff"/>
      <circle cx="18" cy="6" r="1.5" fill="#ffffff"/>
      <!-- Bright welcoming smile -->
      <path d="M-8 22 Q0 28 8 22" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Neat styled hair -->
      <path d="M-36 -4 C-32 -30 32 -30 36 -4 C28 -12 10 -16 -6 -16 C-20 -16 -28 -10 -36 -4 Z" fill="#3a2214"/>
    </g>
  </g>
</svg>'''

def get_cashier_pos_svg():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 600" width="360" height="600">
  {SVG_DEFS}
  <g filter="url(#pDrop)">
    <ellipse cx="180" cy="576" rx="60" ry="12" fill="#2d170b" opacity="0.2"/>

    <!-- Black Trousers -->
    <rect x="144" y="400" width="32" height="150" rx="8" fill="#1e293b"/>
    <rect x="184" y="400" width="32" height="150" rx="8" fill="#0f172a"/>
    <ellipse cx="158" cy="564" rx="22" ry="10" fill="#0f172a"/>
    <ellipse cx="202" cy="564" rx="22" ry="10" fill="#0f172a"/>

    <!-- Torso: Neat Uniform Polo Shirt -->
    <path d="M128 200 L232 200 L240 405 L120 405 Z" fill="#fdfbf7" stroke="#e2d4c5" stroke-width="2"/>
    <path d="M180 220 L154 200 L206 200 Z" fill="#e8743b"/>
    <line x1="180" y1="220" x2="180" y2="260" stroke="#c4531b" stroke-width="2"/>
    <rect x="145" y="235" width="28" height="18" rx="2" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
    <rect x="148" y="240" width="10" height="8" fill="#e8743b"/>
    <line x1="162" y1="242" x2="170" y2="242" stroke="#475569" stroke-width="1.5"/>

    <!-- Left Arm: Handing printed receipt / card terminal -->
    <path d="M128 205 L96 265 L110 320" fill="none" stroke="#fdfbf7" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="110" cy="325" r="10" fill="url(#skin)"/>
    <!-- Receipt tape held in hand -->
    <g transform="translate(108, 335)">
      <rect x="-8" y="0" width="16" height="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <line x1="-5" y1="6" x2="5" y2="6" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="-5" y1="12" x2="3" y2="12" stroke="#94a3b8" stroke-width="1.5"/>
      <line x1="-5" y1="18" x2="5" y2="18" stroke="#e8743b" stroke-width="1.5"/>
    </g>

    <!-- Right Arm: Tapping screen of POS terminal -->
    <path d="M232 205 L260 270 L238 315" fill="none" stroke="#fdfbf7" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="234" cy="320" r="10" fill="url(#skin)"/>
    <!-- Small POS terminal preview -->
    <g transform="translate(245, 320)">
      <rect x="0" y="-12" width="24" height="28" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1"/>
      <rect x="4" y="-8" width="16" height="14" fill="#0284c7"/>
      <line x1="6" y1="-2" x2="14" y2="-2" stroke="#ffffff" stroke-width="1.5"/>
    </g>

    <!-- Head -->
    <g transform="translate(180, 145)">
      <path d="M25 0 C45 10 50 40 38 60 C32 50 35 30 25 20 Z" fill="#26170e"/>
      <ellipse cx="0" cy="10" rx="33" ry="35" fill="url(#skin)"/>
      <ellipse cx="-16" cy="8" rx="4" ry="5.5" fill="#1e293b"/>
      <ellipse cx="16" cy="8" rx="4" ry="5.5" fill="#1e293b"/>
      <circle cx="-14" cy="6" r="1.5" fill="#ffffff"/>
      <circle cx="18" cy="6" r="1.5" fill="#ffffff"/>
      <path d="M-8 22 Q0 28 8 22" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M-36 -4 C-32 -30 32 -30 36 -4 C28 -12 10 -16 -6 -16 C-20 -16 -28 -10 -36 -4 Z" fill="#3a2214"/>
    </g>
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
    print("Generating People Sprites (assets/people/)...")
    people = [
        ("linh-standing", get_linh_standing_svg()),
        ("linh-talking", get_linh_talking_svg()),
        ("linh-smiling", get_linh_smiling_svg()),
        ("linh-holding-cup", get_linh_holding_cup_svg()),
        ("visitor-elderly-neighbor", get_elderly_neighbor_svg()),
        ("visitor-old-friend", get_old_friend_svg()),
        ("visitor-shipper", get_shipper_svg()),
        ("visitor-tourist", get_tourist_svg()),
        ("barista-brewing", get_barista_brewing_svg()),
        ("barista-serving", get_barista_serving_svg()),
        ("cashier-greeting", get_cashier_greeting_svg()),
        ("cashier-pos", get_cashier_pos_svg()),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        results = []
        for name, svg_code in people:
            target = os.path.join(OUT_DIR, f"{name}.png")
            w, h, kb = render_svg_to_png(page, svg_code, target, 360, 600, max_kb=150)
            results.append((name, w, h, kb))

        browser.close()

    print(f"Successfully generated all {len(results)} people sprites!")

if __name__ == "__main__":
    main()
