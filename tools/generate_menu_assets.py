"""
Generate Menu & Supermarket Icons (assets/menu/) for English Life World
Includes 27 icons (128x128 PNG transparent, <= 150KB):
Cafe:
1. espresso
2. americano
3. cappuccino
4. latte
5. mocha
6. matcha-latte
7. hot-chocolate
8. iced-tea
9. lemonade
10. smoothie
11. croissant
12. muffin
13. cheesecake
14. banana-bread
Supermarket:
15. apple
16. banana
17. mango
18. orange
19. rice
20. egg
21. milk
22. bread
23. snack
24. laundry-detergent
25. tissue-paper
26. meat
27. fish
"""
import os
import io
from PIL import Image
from playwright.sync_api import sync_playwright

OUT_DIR = r"D:\tools\Hoc tieng anh\english-life-world\assets\menu"
os.makedirs(OUT_DIR, exist_ok=True)

COMMON_DEFS = '''
  <defs>
    <filter id="mDrop" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity="0.22" flood-color="#261206"/>
    </filter>
    <linearGradient id="warmBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff8f0"/>
      <stop offset="100%" stop-color="#faeee0"/>
    </linearGradient>
    <linearGradient id="goldGlaze" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
'''

ICONS = {
    # 1. Espresso
    "espresso": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Saucer -->
    <ellipse cx="64" cy="98" rx="46" ry="14" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
    <ellipse cx="64" cy="96" rx="34" ry="9" fill="#e2e8f0"/>
    <!-- Small Cup Body (Orange Ceramic) -->
    <path d="M38 52 C38 90 90 90 90 52 Z" fill="#e8743b" stroke="#c2410c" stroke-width="2"/>
    <!-- Handle -->
    <path d="M88 58 C106 58 106 82 86 84" fill="none" stroke="#e8743b" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="64" cy="52" rx="26" ry="9" fill="#f8fafc"/>
    <!-- Rich Golden Brown Crema -->
    <ellipse cx="64" cy="52" rx="23" ry="7.5" fill="#a16207"/>
    <ellipse cx="61" cy="51" rx="14" ry="4" fill="#ca8a04"/>
    <circle cx="56" cy="50" r="1.5" fill="#fef08a"/>
    <!-- Steam -->
    <path d="M58 40 Q52 30 58 20" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
    <path d="M70 42 Q76 32 70 22" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
  </g>
</svg>''',

    # 2. Americano
    "americano": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Clear Glass / Cup with dark amber coffee -->
    <path d="M36 40 L42 100 C42 108 86 108 86 100 L92 40 Z" fill="#ffffff" fill-opacity="0.3" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Coffee liquid -->
    <path d="M38 48 L43 98 C43 105 85 105 85 98 L90 48 Z" fill="#2d1508"/>
    <!-- Ice cubes in americano -->
    <rect x="50" y="52" width="14" height="14" rx="3" fill="#ffffff" fill-opacity="0.5" stroke="#ffffff" stroke-width="1.5" transform="rotate(15 57 59)"/>
    <rect x="66" y="56" width="13" height="13" rx="3" fill="#ffffff" fill-opacity="0.45" stroke="#ffffff" stroke-width="1.5" transform="rotate(-20 72 62)"/>
    <!-- Rim -->
    <ellipse cx="64" cy="40" rx="28" ry="8" fill="#ffffff" fill-opacity="0.5" stroke="#cbd5e1" stroke-width="2"/>
    <ellipse cx="64" cy="48" rx="26" ry="7" fill="#451a03"/>
    <!-- Glass Highlight -->
    <path d="M42 46 L46 96" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
  </g>
</svg>''',

    # 3. Cappuccino
    "cappuccino": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <ellipse cx="64" cy="98" rx="46" ry="14" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Cup Body (Mint Green) -->
    <path d="M34 50 C34 94 94 94 94 50 Z" fill="#5bb698" stroke="#39846d" stroke-width="2"/>
    <!-- Handle -->
    <path d="M92 56 C110 56 110 80 90 82" fill="none" stroke="#5bb698" stroke-width="6" stroke-linecap="round"/>
    <!-- Foamy White Dome -->
    <ellipse cx="64" cy="48" rx="30" ry="12" fill="#ffffff"/>
    <ellipse cx="64" cy="46" rx="24" ry="9" fill="#f8fafc"/>
    <!-- Cocoa Dusting sprinkles -->
    <g fill="#78350f">
      <circle cx="58" cy="44" r="1.5"/>
      <circle cx="64" cy="42" r="1.8"/>
      <circle cx="70" cy="45" r="1.5"/>
      <circle cx="62" cy="48" r="1.6"/>
      <circle cx="67" cy="49" r="1.2"/>
      <circle cx="56" cy="48" r="1.2"/>
    </g>
    <!-- Steam -->
    <path d="M64 36 Q58 26 64 16" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
  </g>
</svg>''',

    # 4. Latte
    "latte": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <ellipse cx="64" cy="100" rx="44" ry="14" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Rounded Wide Cup (Warm Cream) -->
    <path d="M32 50 C32 94 96 94 96 50 Z" fill="#fdfbf7" stroke="#e2d4c5" stroke-width="2"/>
    <path d="M94 56 C112 56 112 80 92 82" fill="none" stroke="#fdfbf7" stroke-width="6" stroke-linecap="round"/>
    <!-- Coffee Rim -->
    <ellipse cx="64" cy="50" rx="32" ry="11" fill="#78350f"/>
    <!-- Heart Latte Art -->
    <path d="M64 56 C54 44 48 50 64 61 C80 50 74 44 64 56 Z" fill="#ffffff"/>
    <ellipse cx="64" cy="46" rx="6" ry="4" fill="#ffffff"/>
  </g>
</svg>''',

    # 5. Mocha
    "mocha": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Glass Foot -->
    <ellipse cx="64" cy="104" rx="26" ry="8" fill="#e2e8f0"/>
    <path d="M60 92 L60 102 L68 102 L68 92 Z" fill="#cbd5e1"/>
    <!-- Glass Body with layered Chocolate & Espresso -->
    <path d="M42 42 L48 92 C48 96 80 96 80 92 L86 42 Z" fill="#3b1d08"/>
    <!-- Bottom dark chocolate syrup -->
    <path d="M47 80 L48 92 C48 96 80 96 80 92 L81 80 Z" fill="#1f0d03"/>
    <!-- Swirled Whipped Cream Top -->
    <path d="M40 42 C40 26 52 20 64 20 C76 20 88 26 88 42 Z" fill="#ffffff" stroke="#f1f5f9" stroke-width="1.5"/>
    <path d="M52 28 C56 16 72 16 76 28 Z" fill="#ffffff"/>
    <!-- Chocolate Drizzle Zigzag -->
    <path d="M48 34 Q58 38 64 32 Q70 38 80 34" fill="none" stroke="#451a03" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>''',

    # 6. Matcha Latte
    "matcha-latte": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Modern Ceramic Tumbler (Soft Beige) -->
    <path d="M40 40 L46 100 C46 106 82 106 82 100 L88 40 Z" fill="#f5ede3" stroke="#e8dacf" stroke-width="2"/>
    <!-- Vibrant Green Matcha Layer -->
    <path d="M42 56 L47 99 C47 104 81 104 81 99 L86 56 Z" fill="#4d7c0f"/>
    <!-- Frothy Cream Top -->
    <ellipse cx="64" cy="40" rx="24" ry="7" fill="#ffffff"/>
    <ellipse cx="64" cy="40" rx="20" ry="5.5" fill="#ecfccb"/>
    <!-- Matcha Leaf pattern art -->
    <path d="M64 43 C58 37 54 40 64 47 C74 40 70 37 64 43 Z" fill="#65a30d"/>
  </g>
</svg>''',

    # 7. Hot Chocolate
    "hot-chocolate": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <ellipse cx="64" cy="98" rx="44" ry="14" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Cozy Red Mug -->
    <path d="M34 50 C34 94 94 94 94 50 Z" fill="#dc2626" stroke="#b91c1c" stroke-width="2"/>
    <path d="M92 56 C110 56 110 80 90 82" fill="none" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
    <!-- Rich Chocolate Liquid -->
    <ellipse cx="64" cy="50" rx="30" ry="10" fill="#451a03"/>
    <!-- Floating Marshmallows -->
    <rect x="48" y="44" width="10" height="9" rx="2" fill="#ffffff" stroke="#f1f5f9" stroke-width="1" transform="rotate(-10 53 48)"/>
    <rect x="62" y="46" width="11" height="9" rx="2" fill="#ffffff" stroke="#f1f5f9" stroke-width="1" transform="rotate(15 67 50)"/>
    <rect x="74" y="44" width="9" height="8" rx="2" fill="#ffffff" stroke="#f1f5f9" stroke-width="1" transform="rotate(-15 78 48)"/>
    <!-- Steam -->
    <path d="M64 36 Q70 26 64 16" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/>
  </g>
</svg>''',

    # 8. Iced Tea
    "iced-tea": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Tall Glass with amber peach tea -->
    <path d="M42 36 L48 102 C48 107 80 107 80 102 L86 36 Z" fill="#d97706" opacity="0.9"/>
    <!-- Glass Highlights -->
    <ellipse cx="64" cy="36" rx="22" ry="6" fill="#ffffff" fill-opacity="0.4" stroke="#e2e8f0" stroke-width="1.5"/>
    <!-- Ice Cubes -->
    <rect x="52" y="50" width="14" height="14" rx="3" fill="#ffffff" fill-opacity="0.6" stroke="#ffffff" stroke-width="1.5" transform="rotate(15 59 57)"/>
    <rect x="60" y="72" width="14" height="14" rx="3" fill="#ffffff" fill-opacity="0.5" stroke="#ffffff" stroke-width="1.5" transform="rotate(-20 67 79)"/>
    <!-- Lemon Wheel on Rim -->
    <g transform="translate(42, 34)">
      <circle cx="0" cy="0" r="14" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="10" fill="#facc15"/>
      <!-- Wheel segments -->
      <line x1="-8" y1="0" x2="8" y2="0" stroke="#ffffff" stroke-width="1.5"/>
      <line x1="0" y1="-8" x2="0" y2="8" stroke="#ffffff" stroke-width="1.5"/>
    </g>
    <!-- Mint Leaves -->
    <path d="M72 32 C80 26 84 32 76 38 Z" fill="#65a30d"/>
  </g>
</svg>''',

    # 9. Lemonade
    "lemonade": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Tall Glass with sunny lemonade -->
    <path d="M42 38 L48 104 C48 108 80 108 80 104 L86 38 Z" fill="#facc15" stroke="#eab308" stroke-width="1.5"/>
    <ellipse cx="64" cy="38" rx="22" ry="6" fill="#fef08a" stroke="#facc15" stroke-width="1.5"/>
    <!-- Striped Straw (Orange & White) -->
    <g transform="translate(68, 16) rotate(15)">
      <rect x="-3" y="0" width="6" height="70" rx="3" fill="#ffffff"/>
      <path d="M-3 10 L3 15 M-3 22 L3 27 M-3 34 L3 39 M-3 46 L3 51" stroke="#e8743b" stroke-width="3"/>
    </g>
    <!-- Ice & Lemon slice -->
    <rect x="52" y="58" width="13" height="13" rx="3" fill="#ffffff" fill-opacity="0.6"/>
    <circle cx="56" cy="80" r="9" fill="#fef08a" stroke="#eab308" stroke-width="1"/>
  </g>
</svg>''',

    # 10. Smoothie
    "smoothie": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Glass Foot -->
    <ellipse cx="64" cy="106" rx="24" ry="7" fill="#e2e8f0"/>
    <rect x="61" y="96" width="6" height="10" fill="#cbd5e1"/>
    <!-- Glass with Strawberry Mango Coral Smoothie -->
    <path d="M42 44 C42 86 52 96 64 96 C76 96 86 86 86 44 Z" fill="#f43f5e"/>
    <ellipse cx="64" cy="44" rx="22" ry="6" fill="#fb7185"/>
    <!-- Whipped Swirl Top -->
    <path d="M44 42 C44 28 54 22 64 22 C74 22 84 28 84 42 Z" fill="#ffffff"/>
    <path d="M54 26 C58 18 70 18 74 26 Z" fill="#ffffff"/>
    <!-- Straw -->
    <rect x="70" y="10" width="5" height="40" rx="2.5" fill="#38bdf8" transform="rotate(18 72 30)"/>
    <!-- Fresh Strawberry on side -->
    <path d="M42 36 C38 28 48 24 50 34 Z" fill="#e11d48"/>
  </g>
</svg>''',

    # 11. Croissant
    "croissant": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Golden Flaky Crescent Body -->
    <path d="M22 76 C20 60 40 44 64 44 C88 44 108 60 106 76 C96 86 82 82 64 80 C46 82 32 86 22 76 Z" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
    <!-- Central Puffy Ridges (Flaky buttery layers) -->
    <path d="M46 48 C48 76 56 80 56 80" fill="none" stroke="#d97706" stroke-width="2.5"/>
    <path d="M64 44 C64 74 64 80 64 80" fill="none" stroke="#b45309" stroke-width="2.5"/>
    <path d="M82 48 C80 76 72 80 72 80" fill="none" stroke="#d97706" stroke-width="2.5"/>
    <!-- Golden Highlight Glaze -->
    <ellipse cx="64" cy="52" rx="16" ry="6" fill="#fef08a" opacity="0.4"/>
  </g>
</svg>''',

    # 12. Muffin
    "muffin": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Fluted Cup Base -->
    <polygon points="40,66 48,102 80,102 88,66" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
    <!-- Pleat lines -->
    <line x1="50" y1="66" x2="56" y2="102" stroke="#cbd5e1" stroke-width="1.5"/>
    <line x1="64" y1="66" x2="64" y2="102" stroke="#cbd5e1" stroke-width="1.5"/>
    <line x1="78" y1="66" x2="72" y2="102" stroke="#cbd5e1" stroke-width="1.5"/>
    <!-- Domed Golden Muffin Top -->
    <path d="M30 68 C26 44 48 30 64 30 C80 30 102 44 98 68 Z" fill="#d97706" stroke="#92400e" stroke-width="2"/>
    <ellipse cx="64" cy="48" rx="28" ry="12" fill="#f59e0b"/>
    <!-- Chocolate Chips -->
    <g fill="#451a03">
      <ellipse cx="48" cy="44" rx="4" ry="3"/>
      <ellipse cx="64" cy="38" rx="4" ry="3"/>
      <ellipse cx="80" cy="46" rx="4" ry="3"/>
      <ellipse cx="58" cy="54" rx="4" ry="3"/>
      <ellipse cx="72" cy="56" rx="3.5" ry="2.8"/>
    </g>
  </g>
</svg>''',

    # 13. Cheesecake
    "cheesecake": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Graham Cracker Crust Base -->
    <polygon points="26,82 102,82 94,92 26,92" fill="#92400e" stroke="#78350f" stroke-width="1.5"/>
    <!-- Cream Cheese Filling Wedge -->
    <polygon points="26,44 102,82 26,82" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
    <polygon points="26,44 76,34 102,82 26,44" fill="#fef9c3"/>
    <!-- Strawberry Coulis Topping on Back Edge -->
    <path d="M26 44 Q50 38 76 34 Q82 46 70 48 Q54 44 26 44 Z" fill="#dc2626"/>
    <!-- Dripping sauce drop -->
    <path d="M50 42 C48 52 54 52 52 42 Z" fill="#dc2626"/>
  </g>
</svg>''',

    # 14. Banana Bread
    "banana-bread": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Slice of Toasted Loaf (3D Isometric) -->
    <!-- Crust edge -->
    <path d="M34 40 L74 28 L94 56 L94 92 L54 104 L34 76 Z" fill="#78350f"/>
    <!-- Slice Front Face -->
    <polygon points="34,40 74,28 74,88 34,100" fill="#b45309" stroke="#78350f" stroke-width="2"/>
    <polygon points="36,42 72,30 72,86 36,98" fill="#d97706"/>
    <!-- Banana slice embedded -->
    <circle cx="54" cy="54" r="8" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
    <circle cx="54" cy="54" r="2" fill="#a16207"/>
    <!-- Walnut chips -->
    <rect x="46" y="74" width="7" height="6" rx="2" fill="#451a03"/>
    <rect x="60" y="68" width="6" height="5" rx="2" fill="#451a03"/>
  </g>
</svg>''',

    # 15. Apple
    "apple": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Stem & Leaf -->
    <path d="M64 36 C64 22 72 16 74 14" fill="none" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
    <path d="M66 26 C76 20 86 24 82 32 C72 32 68 28 66 26 Z" fill="#65a30d" stroke="#4d7c0f" stroke-width="1"/>
    <!-- Plump Red Apple Body -->
    <path d="M64 42 C48 36 28 46 28 68 C28 92 50 106 64 106 C78 106 100 92 100 68 C100 46 80 36 64 42 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
    <!-- Juicy Red/Orange Gradient Highlight -->
    <ellipse cx="50" cy="62" rx="14" ry="18" fill="#ef4444"/>
    <ellipse cx="44" cy="56" rx="6" ry="10" fill="#ffffff" opacity="0.45" transform="rotate(-15 44 56)"/>
  </g>
</svg>''',

    # 16. Banana
    "banana": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Bunch of Bananas -->
    <!-- Back Banana -->
    <path d="M42 30 C64 34 88 52 96 82 C98 88 94 92 88 90 C78 66 56 50 38 40 Z" fill="#eab308"/>
    <!-- Front Banana -->
    <path d="M30 38 C54 44 80 62 88 94 C90 100 84 104 78 100 C68 76 46 58 26 48 Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
    <!-- Crown Stem -->
    <polygon points="26,38 36,34 38,44 28,48" fill="#65a30d"/>
    <!-- Banana ridge line -->
    <path d="M34 42 C54 50 74 68 82 96" fill="none" stroke="#eab308" stroke-width="1.8"/>
  </g>
</svg>''',

    # 17. Mango
    "mango": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Little Stem & Leaf -->
    <line x1="44" y1="32" x2="38" y2="24" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
    <path d="M42 28 C48 20 58 22 54 30 Z" fill="#65a30d"/>
    <!-- Ripe Golden Mango -->
    <path d="M44 32 C74 28 102 50 96 80 C90 104 60 108 42 94 C26 80 24 46 44 32 Z" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
    <!-- Coral Blush -->
    <path d="M68 40 C86 52 90 74 80 86" fill="none" stroke="#ea580c" stroke-width="14" stroke-linecap="round" opacity="0.5"/>
    <ellipse cx="50" cy="50" rx="8" ry="14" fill="#fef08a" opacity="0.5" transform="rotate(-20 50 50)"/>
  </g>
</svg>''',

    # 18. Orange
    "orange": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Whole Orange at Back -->
    <circle cx="52" cy="66" r="32" fill="#ea580c" stroke="#c2410c" stroke-width="2"/>
    <ellipse cx="44" cy="54" rx="10" ry="6" fill="#fb923c" opacity="0.6"/>
    <!-- Leaf on top -->
    <path d="M50 34 C54 24 68 26 62 36 Z" fill="#65a30d"/>
    <!-- Sliced Half in Front -->
    <g transform="translate(80, 80)">
      <circle cx="0" cy="0" r="26" fill="#f97316" stroke="#ea580c" stroke-width="2"/>
      <circle cx="0" cy="0" r="22" fill="#ffedd5"/>
      <circle cx="0" cy="0" r="19" fill="#ea580c"/>
      <!-- Wheel Segments -->
      <line x1="-16" y1="0" x2="16" y2="0" stroke="#ffedd5" stroke-width="2"/>
      <line x1="0" y1="-16" x2="0" y2="16" stroke="#ffedd5" stroke-width="2"/>
      <line x1="-12" y1="-12" x2="12" y2="12" stroke="#ffedd5" stroke-width="2"/>
      <line x1="-12" y1="12" x2="12" y2="-12" stroke="#ffedd5" stroke-width="2"/>
    </g>
  </g>
</svg>''',

    # 19. Rice
    "rice": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Burlap Sack Body -->
    <path d="M34 56 C34 48 42 46 64 46 C86 46 94 48 94 56 L90 102 C90 106 38 106 38 102 Z" fill="#d4b996" stroke="#a27b5c" stroke-width="2"/>
    <!-- Sack Folded Neck & Twine Tie -->
    <ellipse cx="64" cy="46" rx="28" ry="8" fill="#e8d8c3" stroke="#a27b5c" stroke-width="1.5"/>
    <ellipse cx="64" cy="44" rx="24" ry="6" fill="#ffffff"/>
    <path d="M36 50 Q64 56 92 50" fill="none" stroke="#78350f" stroke-width="3"/>
    <!-- Grain graphic on sack -->
    <g transform="translate(64, 76)">
      <ellipse cx="-8" cy="0" rx="3" ry="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" transform="rotate(-25)"/>
      <ellipse cx="0" cy="-6" rx="3" ry="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <ellipse cx="8" cy="0" rx="3" ry="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" transform="rotate(25)"/>
      <text x="0" y="16" font-family="sans-serif" font-size="8" font-weight="bold" fill="#78350f" text-anchor="middle">RICE</text>
    </g>
  </g>
</svg>''',

    # 20. Egg
    "egg": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Molded Carton Base -->
    <path d="M24 74 L30 100 L98 100 L104 74 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
    <line x1="64" y1="74" x2="64" y2="100" stroke="#94a3b8" stroke-width="2"/>
    <!-- 4 Eggs in 2.5D Carton -->
    <!-- Back row -->
    <ellipse cx="46" cy="62" rx="14" ry="18" fill="#f5d0b0" stroke="#d49b72" stroke-width="1.5"/>
    <ellipse cx="82" cy="62" rx="14" ry="18" fill="#f5d0b0" stroke="#d49b72" stroke-width="1.5"/>
    <!-- Front row -->
    <ellipse cx="46" cy="74" rx="15" ry="19" fill="#fbdcc4" stroke="#d49b72" stroke-width="1.5"/>
    <ellipse cx="42" cy="68" rx="4" ry="8" fill="#ffffff" opacity="0.6"/>
    <ellipse cx="82" cy="74" rx="15" ry="19" fill="#fbdcc4" stroke="#d49b72" stroke-width="1.5"/>
    <ellipse cx="78" cy="68" rx="4" ry="8" fill="#ffffff" opacity="0.6"/>
  </g>
</svg>''',

    # 21. Milk
    "milk": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Gable-top Milk Carton (Isometric) -->
    <!-- Gable Roof -->
    <polygon points="44,24 84,24 76,40 36,40" fill="#0284c7"/>
    <polygon points="84,24 100,32 92,48 76,40" fill="#0369a1"/>
    <!-- Gable top fin -->
    <rect x="52" y="18" width="24" height="6" fill="#0284c7" stroke="#0369a1" stroke-width="1"/>
    <!-- Carton Front Face -->
    <polygon points="36,40 76,40 76,102 36,102" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Carton Side Face -->
    <polygon points="76,40 92,48 92,106 76,102" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Blue band and Cow/Milk graphics -->
    <rect x="36" y="58" width="40" height="24" fill="#0284c7"/>
    <text x="56" y="74" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">MILK</text>
  </g>
</svg>''',

    # 22. Bread
    "bread": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Crusty Baguette Loaf -->
    <path d="M22 84 C18 74 24 58 40 50 L90 28 C104 22 114 30 110 40 L60 88 C48 98 26 94 22 84 Z" fill="#d97706" stroke="#92400e" stroke-width="2"/>
    <!-- Diagonal Score Cuts (Flour dusted) -->
    <g stroke="#ffffff" stroke-width="2.5" stroke-linecap="round">
      <line x1="42" y1="62" x2="48" y2="76"/>
      <line x1="58" y1="50" x2="66" y2="66"/>
      <line x1="74" y1="38" x2="84" y2="54"/>
      <line x1="90" y1="28" x2="98" y2="40"/>
    </g>
  </g>
</svg>''',

    # 23. Snack
    "snack": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Crinkled Foil Potato Chips Bag -->
    <path d="M34 30 L94 30 L88 102 L38 102 Z" fill="#e8743b" stroke="#c2410c" stroke-width="2"/>
    <!-- Zigzag top/bottom sealed edges -->
    <path d="M34 30 L38 24 L44 30 L50 24 L56 30 L62 24 L68 30 L74 24 L80 30 L86 24 L94 30" fill="none" stroke="#ea580c" stroke-width="2"/>
    <path d="M38 102 L42 108 L48 102 L54 108 L60 102 L66 108 L72 102 L78 108 L84 102 L88 108" fill="none" stroke="#ea580c" stroke-width="2"/>
    <!-- Shiny Bag Highlight -->
    <path d="M42 36 L48 96" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
    <!-- Golden Chip illustration -->
    <ellipse cx="64" cy="66" rx="16" ry="10" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" transform="rotate(-15 64 66)"/>
    <text x="64" y="86" font-family="sans-serif" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">CHIPS</text>
  </g>
</svg>''',

    # 24. Laundry Detergent
    "laundry-detergent": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Measuring Cap (Translucent Blue) -->
    <rect x="42" y="24" width="16" height="14" rx="3" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
    <!-- Ergonomic Jug (Mint Teal) with Handle -->
    <path d="M36 38 C36 38 60 36 68 46 L78 58 C86 68 86 78 86 98 C86 104 36 104 36 98 Z" fill="#0d9488" stroke="#0f766e" stroke-width="2"/>
    <!-- Hollow Handle hole -->
    <path d="M64 60 C68 64 68 76 64 80 C58 80 58 64 64 60 Z" fill="#ffffff" fill-opacity="0.2"/>
    <!-- Clean Sparkle & Bubbles -->
    <circle cx="50" cy="80" r="14" fill="#ffffff"/>
    <circle cx="50" cy="80" r="6" fill="#38bdf8"/>
    <circle cx="62" cy="72" r="3" fill="#bae6fd"/>
  </g>
</svg>''',

    # 25. Tissue Paper
    "tissue-paper": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Soft White Tissue emerging from top -->
    <path d="M64 56 C54 36 46 22 58 20 C70 18 78 32 64 56 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    <path d="M64 56 C74 40 86 28 78 24 Z" fill="#f8fafc"/>
    <!-- Tissue Box (Isometric 2.5D, Pastel Mint) -->
    <polygon points="32,60 84,52 102,66 50,74" fill="#6ee7b7" stroke="#34d399" stroke-width="1.5"/>
    <!-- Front Face -->
    <polygon points="32,60 50,74 50,102 32,88" fill="#10b981" stroke="#059669" stroke-width="1.5"/>
    <!-- Side Face -->
    <polygon points="50,74 102,66 102,94 50,102" fill="#059669" stroke="#047857" stroke-width="1.5"/>
    <!-- Oval Dispensing Opening -->
    <ellipse cx="66" cy="62" rx="14" ry="4" fill="#047857"/>
  </g>
</svg>''',

    # 26. Meat
    "meat": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- White Styrofoam Tray -->
    <polygon points="26,62 94,48 106,82 38,96" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Marbled Red Steak Cut -->
    <path d="M34 66 C42 56 86 52 94 62 C100 70 96 82 86 86 C74 90 42 92 36 84 C32 78 30 72 34 66 Z" fill="#e11d48" stroke="#be123c" stroke-width="1.5"/>
    <!-- White Marbling streaks -->
    <path d="M46 66 Q62 64 78 68" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M52 76 Q68 74 84 78" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    <!-- Barcode Label on Corner -->
    <polygon points="80,72 96,68 98,82 82,86" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
    <line x1="84" y1="74" x2="84" y2="82" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="88" y1="73" x2="88" y2="81" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="92" y1="72" x2="92" y2="80" stroke="#1e293b" stroke-width="1.5"/>
  </g>
</svg>''',

    # 27. Fish
    "fish": f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  {COMMON_DEFS}
  <g filter="url(#mDrop)">
    <!-- Silvery Blue Fresh Fish -->
    <!-- Tail Fin -->
    <polygon points="26,64 16,48 16,80" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
    <!-- Fish Body -->
    <path d="M26 64 C36 44 80 44 104 64 C80 84 36 84 26 64 Z" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
    <!-- Belly Silver Gradient -->
    <path d="M30 64 C42 78 78 78 98 64 Z" fill="#e0f2fe"/>
    <!-- Gills -->
    <path d="M84 54 Q80 64 84 74" fill="none" stroke="#0369a1" stroke-width="2"/>
    <!-- Eye -->
    <circle cx="94" cy="60" r="4.5" fill="#ffffff"/>
    <circle cx="95" cy="60" r="2.2" fill="#0f172a"/>
    <!-- Fresh Lemon slice garnish -->
    <g transform="translate(60, 48)">
      <circle cx="0" cy="0" r="10" fill="#fef08a" stroke="#ca8a04" stroke-width="1.2"/>
      <circle cx="0" cy="0" r="7" fill="#facc15"/>
    </g>
  </g>
</svg>'''
}

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
    print(f"Generating {len(ICONS)} Menu & Supermarket Icons (assets/menu/)...")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        results = []
        for name, svg_code in ICONS.items():
            target = os.path.join(OUT_DIR, f"{name}.png")
            w, h, kb = render_svg_to_png(page, svg_code, target, 128, 128, max_kb=150)
            results.append((name, w, h, kb))

        browser.close()

    print(f"All {len(results)} menu icons successfully generated!")

if __name__ == "__main__":
    main()
