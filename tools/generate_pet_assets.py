"""
Generate 100 Pet Assets (10 Pets x 10 States) for English Life World
Phase 1: Generate Milu (all 10 states first) and verify.
Phase 2: Generate remaining 9 pets (Boba, Cookie, Mochi, Pepper, Oreo, Ember, Lumi, Pip, Aqua) x 10 states.
Phase 3: Verify all 100 PNGs on disk via PIL and write assets/pets/manifest.json.

Strict Rules:
- Exactly 10 pets:
  * 3 dogs: milu (free), boba (Corgi), cookie (Shiba)
  * 3 cats: mochi (free), pepper (British Shorthair), oreo (Tuxedo)
  * 4 rare: ember (dragon), lumi (unicorn), pip (arctic fox), aqua (sea otter)
- 10 states per pet:
  idle_happy, curious, playful, eating, drinking, sleepy, tired, sad_lonely, excited, walking_adventure
- 320x320 PNG RGBA, transparent background (omit_background=True, corner alpha == 0).
- NO TEXT inside any SVG/PNG (no <text> tags at all).
- NO fake recolors: each species has distinct anatomy, head shape, ears, muzzle, tail, fur markings, and signature accessories.
"""

import os
import io
import json
import hashlib
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT_DIR = r"D:\tools\Hoc tieng anh\english-life-world"
OUT_DIR = os.path.join(ROOT_DIR, "assets", "pets")
os.makedirs(OUT_DIR, exist_ok=True)

PETS_ORDER = [
    "milu",    # 1. Free Dog - Fluffy Golden Cream Lhasa Puppy
    "boba",    # 2. Corgi Dog - Pembroke Welsh Corgi with tiny crown
    "cookie",  # 3. Shiba Dog - Shiba Inu with urajiro cheeks & mint bandana
    "mochi",   # 4. Free Cat - White Cream Cat with sapphire eyes & gold bell
    "pepper",  # 5. British Shorthair Cat - Chubby silver-grey cat with amber eyes & blue striped bow
    "oreo",    # 6. Tuxedo Cat - Black & white bicolor cat with silver heart collar
    "ember",   # 7. Baby Fire Dragon - Ruby orange/gold dragon with horns, wings & tail flame
    "lumi",    # 8. Pastel Unicorn - Pearl white unicorn with rainbow horn & 4-color pastel mane
    "pip",     # 9. Arctic Fox - Snow white fox with ice-blue ear/tail tips & ice-blue scarf
    "aqua",    # 10. Sea Otter - Cocoa brown otter with cream tummy & pink pastel seashell
]

STATES_ORDER = [
    "idle_happy",
    "curious",
    "playful",
    "eating",
    "drinking",
    "sleepy",
    "tired",
    "sad_lonely",
    "excited",
    "walking_adventure",
]

ANIMATION_TYPES = {
    "idle_happy": "breathe",
    "curious": "head_tilt",
    "playful": "play_bounce",
    "eating": "chew_happy",
    "drinking": "lap_water",
    "sleepy": "sleep_breathe",
    "tired": "slump_droop",
    "sad_lonely": "sad_shiver",
    "excited": "jump_joy",
    "walking_adventure": "walk_cycle",
}


def get_common_defs():
    """Rich 3D-style SVG gradients and soft drop shadows for all 10 pets."""
    return '''
  <defs>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="145%">
      <feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#1e130c" flood-opacity="0.22"/>
    </filter>
    <filter id="headShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="3.5" flood-color="#1e130c" flood-opacity="0.18"/>
    </filter>
    <filter id="softBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5"/>
    </filter>

    <!-- 1. MILU (Golden Cream Fluffy Lhasa/Golden) -->
    <radialGradient id="miluFur" cx="45%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#fff8e3"/>
      <stop offset="55%" stop-color="#f6d596"/>
      <stop offset="100%" stop-color="#d59b52"/>
    </radialGradient>
    <linearGradient id="miluEar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0c57e"/>
      <stop offset="60%" stop-color="#cf8f49"/>
      <stop offset="100%" stop-color="#a36324"/>
    </linearGradient>
    <radialGradient id="miluChest" cx="50%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#fff1d2"/>
      <stop offset="100%" stop-color="#e3be82"/>
    </radialGradient>

    <!-- 2. BOBA (Pembroke Corgi Orange-Gold & White) -->
    <radialGradient id="bobaFur" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffc078"/>
      <stop offset="60%" stop-color="#f08c38"/>
      <stop offset="100%" stop-color="#c25f16"/>
    </radialGradient>
    <radialGradient id="bobaWhite" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="75%" stop-color="#fdf4ea"/>
      <stop offset="100%" stop-color="#e2d1c0"/>
    </radialGradient>

    <!-- 3. COOKIE (Shiba Inu Red-Sesame & Cream Urajiro) -->
    <radialGradient id="cookieFur" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#f5a053"/>
      <stop offset="60%" stop-color="#db6d27"/>
      <stop offset="100%" stop-color="#9e4311"/>
    </radialGradient>
    <radialGradient id="cookieCream" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fffdf9"/>
      <stop offset="75%" stop-color="#faebd7"/>
      <stop offset="100%" stop-color="#dfc3a4"/>
    </radialGradient>

    <!-- 4. MOCHI (Soft White-Cream Cat with Pink & Grey accents) -->
    <radialGradient id="mochiFur" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#fff6ed"/>
      <stop offset="100%" stop-color="#e6d3c3"/>
    </radialGradient>
    <linearGradient id="mochiTail" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d8c9bf"/>
      <stop offset="100%" stop-color="#9c8d85"/>
    </linearGradient>

    <!-- 5. PEPPER (British Shorthair Plush Silver-Blue Grey) -->
    <radialGradient id="pepperFur" cx="42%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#c2ceda"/>
      <stop offset="55%" stop-color="#8b9aa9"/>
      <stop offset="100%" stop-color="#566371"/>
    </radialGradient>
    <radialGradient id="pepperLight" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#e3ebf2"/>
      <stop offset="100%" stop-color="#9aa8b8"/>
    </radialGradient>

    <!-- 6. OREO (Tuxedo Black & White Cat) -->
    <radialGradient id="oreoBlack" cx="40%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#4d525d"/>
      <stop offset="45%" stop-color="#282b33"/>
      <stop offset="100%" stop-color="#121418"/>
    </radialGradient>
    <radialGradient id="oreoWhite" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="80%" stop-color="#f0f4f8"/>
      <stop offset="100%" stop-color="#cfd8e3"/>
    </radialGradient>

    <!-- 7. EMBER (Ruby Flame Baby Dragon) -->
    <radialGradient id="emberScale" cx="42%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#ff824f"/>
      <stop offset="55%" stop-color="#e53e24"/>
      <stop offset="100%" stop-color="#9b1b14"/>
    </radialGradient>
    <linearGradient id="emberBelly" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffeb8f"/>
      <stop offset="60%" stop-color="#f7b733"/>
      <stop offset="100%" stop-color="#d98218"/>
    </linearGradient>
    <linearGradient id="emberHorn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff3b0"/>
      <stop offset="100%" stop-color="#d48b19"/>
    </linearGradient>

    <!-- 8. LUMI (Pearl Unicorn with Rainbow Pastel Mane) -->
    <radialGradient id="lumiCoat" cx="42%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="65%" stop-color="#f8f2ff"/>
      <stop offset="100%" stop-color="#dfd1f0"/>
    </radialGradient>
    <linearGradient id="lumiHorn" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff59d"/>
      <stop offset="50%" stop-color="#ffafcc"/>
      <stop offset="100%" stop-color="#a2d2ff"/>
    </linearGradient>

    <!-- 9. PIP (Arctic Snow Fox with Ice-Blue Tips) -->
    <radialGradient id="pipFur" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="68%" stop-color="#eef8ff"/>
      <stop offset="100%" stop-color="#c9e4f8"/>
    </radialGradient>
    <linearGradient id="pipIceTip" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5bc0ff"/>
      <stop offset="52%" stop-color="#a8dfff"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>

    <!-- 10. AQUA (Sea Otter Cocoa Brown & Cream) -->
    <radialGradient id="aquaFur" cx="42%" cy="32%" r="65%">
      <stop offset="0%" stop-color="#ad7959"/>
      <stop offset="58%" stop-color="#7c4e32"/>
      <stop offset="100%" stop-color="#4e2e1a"/>
    </radialGradient>
    <radialGradient id="aquaCream" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#fff8ec"/>
      <stop offset="70%" stop-color="#f3dec1"/>
      <stop offset="100%" stop-color="#cfa97e"/>
    </radialGradient>

    <!-- Shared Props Gradients -->
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff078"/>
      <stop offset="50%" stop-color="#f6b91e"/>
      <stop offset="100%" stop-color="#c47f00"/>
    </linearGradient>
    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#80e5ff"/>
      <stop offset="100%" stop-color="#1ca3ec"/>
    </linearGradient>
    <radialGradient id="cushionGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffd1dc"/>
      <stop offset="70%" stop-color="#f497b6"/>
      <stop offset="100%" stop-color="#c96588"/>
    </radialGradient>
  </defs>
'''


def get_pose_parameters(state):
    """Returns distinct geometric transforms and pose flags for each of the 10 states."""
    poses = {
        "idle_happy": {
            "body_dx": 0, "body_dy": 0, "body_rot": 0, "body_scale_y": 1.0,
            "head_dx": 0, "head_dy": 0, "head_rot": 0,
            "ear_l_rot": 0, "ear_r_rot": 0,
            "tail_rot": 8,
            "paw_l_dx": 0, "paw_l_dy": 0, "paw_r_dx": 0, "paw_r_dy": 0,
            "shadow_rx": 68, "shadow_ry": 14, "shadow_y": 292,
        },
        "curious": {
            "body_dx": 2, "body_dy": 2, "body_rot": 3, "body_scale_y": 1.0,
            "head_dx": 6, "head_dy": -2, "head_rot": 15,
            "ear_l_rot": -16, "ear_r_rot": 18,
            "tail_rot": 22,
            "paw_l_dx": 10, "paw_l_dy": -24, "paw_r_dx": 0, "paw_r_dy": 0,
            "shadow_rx": 65, "shadow_ry": 13, "shadow_y": 292,
        },
        "playful": {
            "body_dx": -10, "body_dy": 8, "body_rot": -11, "body_scale_y": 0.94,
            "head_dx": -10, "head_dy": 6, "head_rot": -8,
            "ear_l_rot": -18, "ear_r_rot": 14,
            "tail_rot": 32,
            "paw_l_dx": -22, "paw_l_dy": -16, "paw_r_dx": 24, "paw_r_dy": -28,
            "shadow_rx": 74, "shadow_ry": 14, "shadow_y": 294,
        },
        "eating": {
            "body_dx": 0, "body_dy": 10, "body_rot": 0, "body_scale_y": 0.94,
            "head_dx": 0, "head_dy": 18, "head_rot": 6,
            "ear_l_rot": -8, "ear_r_rot": 8,
            "tail_rot": 18,
            "paw_l_dx": -6, "paw_l_dy": 4, "paw_r_dx": 6, "paw_r_dy": 4,
            "shadow_rx": 72, "shadow_ry": 15, "shadow_y": 295,
        },
        "drinking": {
            "body_dx": -6, "body_dy": 10, "body_rot": 4, "body_scale_y": 0.94,
            "head_dx": 5, "head_dy": 20, "head_rot": 10,
            "ear_l_rot": -6, "ear_r_rot": 10,
            "tail_rot": 14,
            "paw_l_dx": -4, "paw_l_dy": 4, "paw_r_dx": 8, "paw_r_dy": 2,
            "shadow_rx": 72, "shadow_ry": 15, "shadow_y": 295,
        },
        "sleepy": {
            "body_dx": 0, "body_dy": 24, "body_rot": -6, "body_scale_y": 0.86,
            "head_dx": -8, "head_dy": 22, "head_rot": -14,
            "ear_l_rot": 14, "ear_r_rot": -14,
            "tail_rot": -28,
            "paw_l_dx": 14, "paw_l_dy": 6, "paw_r_dx": -14, "paw_r_dy": 8,
            "shadow_rx": 92, "shadow_ry": 22, "shadow_y": 288,
        },
        "tired": {
            "body_dx": 0, "body_dy": 12, "body_rot": -3, "body_scale_y": 0.91,
            "head_dx": -3, "head_dy": 14, "head_rot": -7,
            "ear_l_rot": 18, "ear_r_rot": -18,
            "tail_rot": -22,
            "paw_l_dx": -4, "paw_l_dy": 6, "paw_r_dx": 4, "paw_r_dy": 6,
            "shadow_rx": 74, "shadow_ry": 14, "shadow_y": 294,
        },
        "sad_lonely": {
            "body_dx": 0, "body_dy": 10, "body_rot": 0, "body_scale_y": 0.92,
            "head_dx": 0, "head_dy": 12, "head_rot": -9,
            "ear_l_rot": 24, "ear_r_rot": -24,
            "tail_rot": -35,
            "paw_l_dx": 6, "paw_l_dy": 4, "paw_r_dx": -6, "paw_r_dy": 4,
            "shadow_rx": 64, "shadow_ry": 13, "shadow_y": 294,
        },
        "excited": {
            "body_dx": 0, "body_dy": -24, "body_rot": 0, "body_scale_y": 1.03,
            "head_dx": 0, "head_dy": -6, "head_rot": -4,
            "ear_l_rot": -24, "ear_r_rot": 24,
            "tail_rot": 38,
            "paw_l_dx": -24, "paw_l_dy": -36, "paw_r_dx": 24, "paw_r_dy": -36,
            "shadow_rx": 46, "shadow_ry": 9, "shadow_y": 298,
        },
        "walking_adventure": {
            "body_dx": 6, "body_dy": -4, "body_rot": 7, "body_scale_y": 0.98,
            "head_dx": 8, "head_dy": -2, "head_rot": 6,
            "ear_l_rot": -10, "ear_r_rot": 12,
            "tail_rot": 26,
            "paw_l_dx": -18, "paw_l_dy": -14, "paw_r_dx": 20, "paw_r_dy": 6,
            "shadow_rx": 68, "shadow_ry": 13, "shadow_y": 293,
        },
    }
    return poses[state]


def render_eyes_and_mouth(pet_id, state):
    """Renders species-colored 3D eyes, eyebrows, blush, nose, and state-specific mouth."""
    eye_colors = {
        "milu": ("#4b2810", "#8a4f24", "#e8be7b"),     # Warm dark brown + golden cream eyelid
        "boba": ("#3d2210", "#7c4722", "#ef8c38"),     # Rich hazel brown + corgi orange eyelid
        "cookie": ("#361d0e", "#6b3b1e", "#df732b"),   # Deep Shiba brown + shiba red eyelid
        "mochi": ("#154c99", "#4ea3ff", "#f3e3d3"),    # Sapphire blue + cream eyelid
        "pepper": ("#b86b00", "#ffc425", "#8b9aa9"),   # Vivid amber gold + British grey eyelid
        "oreo": ("#8f470b", "#f08c2b", "#282b33"),     # Copper orange + tuxedo black eyelid
        "ember": ("#0c6b47", "#36d995", "#e54528"),    # Emerald green + dragon ruby eyelid
        "lumi": ("#59288a", "#b57cff", "#e8dcf5"),     # Galaxy violet + pastel lavender eyelid
        "pip": ("#126199", "#6cd4ff", "#d8eefc"),      # Ice blue + snow fox eyelid
        "aqua": ("#2b180c", "#5e3820", "#875638"),     # Dark cocoa + otter brown eyelid
    }
    iris_dark, iris_light, eyelid_fill = eye_colors[pet_id]

    # Nose by species
    if pet_id in ("mochi", "pepper", "oreo"):
        nose_color = "#ff8da6" if pet_id != "pepper" else "#c97a7e"
        nose_svg = f'''
          <path d="M-7 8 L7 8 L0 16 Z" fill="{nose_color}" stroke="#592e34" stroke-width="1.2" stroke-linejoin="round"/>
          <ellipse cx="-2" cy="10" rx="2.2" ry="1" fill="#ffffff" opacity="0.55"/>
        '''
    elif pet_id == "ember":
        nose_svg = '''
          <ellipse cx="-7" cy="10" rx="2.5" ry="3.2" fill="#6b140e"/>
          <ellipse cx="7" cy="10" rx="2.5" ry="3.2" fill="#6b140e"/>
        '''
    elif pet_id == "lumi":
        nose_svg = '''
          <ellipse cx="-6" cy="11" rx="2.2" ry="2.8" fill="#e58ab5"/>
          <ellipse cx="6" cy="11" rx="2.2" ry="2.8" fill="#e58ab5"/>
        '''
    else:
        nose_svg = '''
          <ellipse cx="0" cy="10" rx="10.5" ry="7.5" fill="#231815"/>
          <ellipse cx="-3" cy="7.5" rx="4" ry="2" fill="#ffffff" opacity="0.65"/>
        '''

    # Eyes by state
    if state == "sleepy":
        eyes_svg = '''
          <path d="M-38 -2 Q-26 9 -14 -2" fill="none" stroke="#2d1b12" stroke-width="4" stroke-linecap="round"/>
          <path d="M-35 2 L-39 7 M-26 5 L-26 10 M-17 2 L-13 7" stroke="#2d1b12" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M14 -2 Q26 9 38 -2" fill="none" stroke="#2d1b12" stroke-width="4" stroke-linecap="round"/>
          <path d="M17 2 L13 7 M26 5 L26 10 M35 2 L39 7" stroke="#2d1b12" stroke-width="2.2" stroke-linecap="round"/>
        '''
    elif state == "tired":
        eyes_svg = f'''
          <g>
            <circle cx="-26" cy="-2" r="13" fill="#ffffff" stroke="#2a1a12" stroke-width="2"/>
            <circle cx="-26" cy="0" r="10" fill="{iris_dark}"/>
            <circle cx="-26" cy="2" r="6" fill="#140c08"/>
            <circle cx="-29" cy="-2" r="3" fill="#ffffff"/>
            <path d="M-40 -4 Q-26 -18 -12 -4 L-12 0 Q-26 4 -40 0 Z" fill="{eyelid_fill}" stroke="#2a1a12" stroke-width="2"/>
          </g>
          <g>
            <circle cx="26" cy="-2" r="13" fill="#ffffff" stroke="#2a1a12" stroke-width="2"/>
            <circle cx="26" cy="0" r="10" fill="{iris_dark}"/>
            <circle cx="26" cy="2" r="6" fill="#140c08"/>
            <circle cx="23" cy="-2" r="3" fill="#ffffff"/>
            <path d="M12 -4 Q26 -18 40 -4 L40 0 Q26 4 12 0 Z" fill="{eyelid_fill}" stroke="#2a1a12" stroke-width="2"/>
          </g>
        '''
    elif state == "excited":
        eyes_svg = f'''
          <g>
            <circle cx="-26" cy="-3" r="14.5" fill="#ffffff" stroke="#24150e" stroke-width="2.2"/>
            <circle cx="-26" cy="-3" r="11.5" fill="{iris_dark}"/>
            <circle cx="-26" cy="-1" r="8" fill="{iris_light}"/>
            <circle cx="-26" cy="-3" r="5.5" fill="#120a06"/>
            <path d="M-29 -10 L-27 -6 L-23 -5 L-27 -3 L-29 1 L-31 -3 L-35 -5 L-31 -6 Z" fill="#ffffff"/>
            <circle cx="-21" cy="2" r="2.2" fill="#ffffff"/>
          </g>
          <g>
            <circle cx="26" cy="-3" r="14.5" fill="#ffffff" stroke="#24150e" stroke-width="2.2"/>
            <circle cx="26" cy="-3" r="11.5" fill="{iris_dark}"/>
            <circle cx="26" cy="-1" r="8" fill="{iris_light}"/>
            <circle cx="26" cy="-3" r="5.5" fill="#120a06"/>
            <path d="M23 -10 L25 -6 L29 -5 L25 -3 L23 1 L21 -3 L17 -5 L21 -6 Z" fill="#ffffff"/>
            <circle cx="31" cy="2" r="2.2" fill="#ffffff"/>
          </g>
        '''
    elif state == "sad_lonely":
        eyes_svg = f'''
          <g>
            <circle cx="-26" cy="-1" r="14" fill="#ffffff" stroke="#24150e" stroke-width="2"/>
            <circle cx="-26" cy="0" r="11" fill="{iris_dark}"/>
            <circle cx="-26" cy="2" r="7" fill="{iris_light}"/>
            <circle cx="-26" cy="0" r="5.5" fill="#120a06"/>
            <circle cx="-30" cy="-5" r="4.2" fill="#ffffff"/>
            <circle cx="-22" cy="4" r="2" fill="#ffffff"/>
            <path d="M-38 8 C-42 15 -34 22 -32 15 C-31 12 -35 8 -38 8 Z" fill="#63d2ff" stroke="#1e88e5" stroke-width="1"/>
          </g>
          <g>
            <circle cx="26" cy="-1" r="14" fill="#ffffff" stroke="#24150e" stroke-width="2"/>
            <circle cx="26" cy="0" r="11" fill="{iris_dark}"/>
            <circle cx="26" cy="2" r="7" fill="{iris_light}"/>
            <circle cx="26" cy="0" r="5.5" fill="#120a06"/>
            <circle cx="22" cy="-5" r="4.2" fill="#ffffff"/>
            <circle cx="30" cy="4" r="2" fill="#ffffff"/>
            <path d="M38 8 C42 15 34 22 32 15 C31 12 35 8 38 8 Z" fill="#63d2ff" stroke="#1e88e5" stroke-width="1"/>
          </g>
          <path d="M-38 -15 Q-26 -19 -16 -23" fill="none" stroke="#4a2c18" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M16 -23 Q26 -19 38 -15" fill="none" stroke="#4a2c18" stroke-width="3.2" stroke-linecap="round"/>
        '''
    else:
        pupil_dx = 3 if state == "curious" else 0
        pupil_dy = -2 if state == "curious" else (2 if state in ("eating", "drinking") else 0)
        eyes_svg = f'''
          <g>
            <circle cx="-26" cy="-3" r="14" fill="#ffffff" stroke="#24150e" stroke-width="2.2"/>
            <circle cx="{-26 + pupil_dx}" cy="{-3 + pupil_dy}" r="11" fill="{iris_dark}"/>
            <circle cx="{-26 + pupil_dx}" cy="{-1 + pupil_dy}" r="7.5" fill="{iris_light}"/>
            <circle cx="{-26 + pupil_dx}" cy="{-3 + pupil_dy}" r="5.8" fill="#120a06"/>
            <circle cx="{-30 + pupil_dx}" cy="{-7 + pupil_dy}" r="4.2" fill="#ffffff"/>
            <circle cx="{-22 + pupil_dx}" cy="{2 + pupil_dy}" r="2" fill="#ffffff"/>
          </g>
          <g>
            <circle cx="26" cy="-3" r="14" fill="#ffffff" stroke="#24150e" stroke-width="2.2"/>
            <circle cx="{26 + pupil_dx}" cy="{-3 + pupil_dy}" r="11" fill="{iris_dark}"/>
            <circle cx="{26 + pupil_dx}" cy="{-1 + pupil_dy}" r="7.5" fill="{iris_light}"/>
            <circle cx="{26 + pupil_dx}" cy="{-3 + pupil_dy}" r="5.8" fill="#120a06"/>
            <circle cx="{22 + pupil_dx}" cy="{-7 + pupil_dy}" r="4.2" fill="#ffffff"/>
            <circle cx="{30 + pupil_dx}" cy="{2 + pupil_dy}" r="2" fill="#ffffff"/>
          </g>
          <path d="M-35 -21 Q-26 -26 -17 -21" fill="none" stroke="#5c3820" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M17 -21 Q26 -26 35 -21" fill="none" stroke="#5c3820" stroke-width="3.2" stroke-linecap="round"/>
        '''

    # Mouth by state
    if state in ("idle_happy", "playful", "excited", "walking_adventure"):
        tongue_h = 31 if state == "excited" else 28
        mouth_svg = f'''
          <path d="M-12 18 Q0 32 12 18 Z" fill="#591c21" stroke="#2b1510" stroke-width="1.8"/>
          <path d="M-8 20 Q0 {tongue_h} 8 20 Z" fill="#ff7b93"/>
          <path d="M-14 16 Q-6 23 0 17 Q6 23 14 16" fill="none" stroke="#2b1510" stroke-width="2.5" stroke-linecap="round"/>
        '''
    elif state == "curious":
        mouth_svg = '''
          <ellipse cx="0" cy="21" rx="4.5" ry="5.5" fill="#591c21" stroke="#2b1510" stroke-width="1.8"/>
          <ellipse cx="0" cy="23" rx="3" ry="2.5" fill="#ff7b93"/>
        '''
    elif state == "eating":
        mouth_svg = '''
          <circle cx="-18" cy="18" r="7" fill="#ff9eb5" opacity="0.45"/>
          <circle cx="18" cy="18" r="7" fill="#ff9eb5" opacity="0.45"/>
          <path d="M-13 18 Q0 31 13 18 Z" fill="#591c21" stroke="#2b1510" stroke-width="1.8"/>
          <path d="M-8 20 Q0 28 8 20 Z" fill="#ff7b93"/>
          <circle cx="-9" cy="21" r="2.2" fill="#e6a145"/>
          <circle cx="10" cy="22" r="1.8" fill="#e6a145"/>
        '''
    elif state == "drinking":
        mouth_svg = '''
          <path d="M-10 17 Q0 24 10 17" fill="none" stroke="#2b1510" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M-6 19 C-7 32 7 32 6 19 Z" fill="#ff708d" stroke="#c9405d" stroke-width="1.4"/>
        '''
    elif state == "sleepy":
        mouth_svg = '''
          <path d="M-8 19 Q0 23 8 19" fill="none" stroke="#3b2316" stroke-width="2.2" stroke-linecap="round"/>
        '''
    elif state == "tired":
        mouth_svg = '''
          <path d="M-9 22 Q0 18 9 22" fill="none" stroke="#3b2316" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M2 20 Q5 26 8 21" fill="#ff8da6"/>
        '''
    else:  # sad_lonely
        mouth_svg = '''
          <path d="M-11 24 Q0 16 11 24" fill="none" stroke="#2b1510" stroke-width="2.6" stroke-linecap="round"/>
        '''

    blush_svg = '''
      <ellipse cx="-34" cy="12" rx="8.5" ry="5" fill="#ff7a95" opacity="0.35" filter="url(#softBlur)"/>
      <ellipse cx="34" cy="12" rx="8.5" ry="5" fill="#ff7a95" opacity="0.35" filter="url(#softBlur)"/>
    '''

    return f"{blush_svg}{eyes_svg}{nose_svg}{mouth_svg}"


def render_state_props_back(state):
    """Renders background props behind the pet (e.g. plush sleeping cushion)."""
    if state == "sleepy":
        return '''
        <!-- Plush Sleeping Cushion -->
        <ellipse cx="160" cy="264" rx="108" ry="38" fill="url(#cushionGrad)" stroke="#b85275" stroke-width="3"/>
        <ellipse cx="160" cy="256" rx="92" ry="28" fill="#ffe4ec" opacity="0.65"/>
        <path d="M72 264 Q90 278 115 268 M205 268 Q230 278 248 264" fill="none" stroke="#b85275" stroke-width="2.2" stroke-linecap="round"/>
        '''
    elif state == "walking_adventure":
        return '''
        <!-- Adventure trail pebbles and little leaf -->
        <ellipse cx="75" cy="288" rx="9" ry="4" fill="#a3b18a" opacity="0.7"/>
        <ellipse cx="246" cy="292" rx="7" ry="3.5" fill="#a3b18a" opacity="0.7"/>
        <path d="M52 276 C44 266 58 258 66 268 C58 274 54 276 52 276 Z" fill="#52b788" stroke="#2d6a4f" stroke-width="1.5"/>
        '''
    return ""


def render_state_props_front(state):
    """Renders foreground props and emotion icons (STRICTLY NO TEXT)."""
    if state == "idle_happy":
        return '''
        <path d="M256 76 C256 68 244 68 244 76 C244 68 232 68 232 76 C232 86 244 94 244 94 C244 94 256 86 256 76 Z" fill="#ff5d8f" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M68 92 L72 82 L76 92 L86 96 L76 100 L72 110 L68 100 L58 96 Z" fill="#ffd166"/>
        '''
    elif state == "curious":
        return '''
        <circle cx="258" cy="82" r="11" fill="#ffd166" opacity="0.35"/>
        <path d="M258 64 L263 77 L276 82 L263 87 L258 100 L253 87 L240 82 L253 77 Z" fill="#ffd166" stroke="#f4a261" stroke-width="1.5"/>
        <circle cx="234" cy="112" r="5" fill="#90e0ef"/>
        <circle cx="274" cy="108" r="3.5" fill="#ffafcc"/>
        '''
    elif state == "playful":
        return '''
        <g transform="translate(238, 252)">
          <ellipse cx="0" cy="28" rx="28" ry="7" fill="#1e130c" opacity="0.22"/>
          <circle cx="0" cy="0" r="28" fill="#ff595e" stroke="#2b1911" stroke-width="2.5"/>
          <path d="M0 -28 A28 28 0 0 1 28 0 L0 0 Z" fill="#ffca3a"/>
          <path d="M0 0 L28 0 A28 28 0 0 1 0 28 Z" fill="#1982c4"/>
          <path d="M-28 0 A28 28 0 0 1 0 -28 L0 0 Z" fill="#8ac926"/>
          <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#2b1911" stroke-width="2"/>
          <circle cx="-10" cy="-10" r="4" fill="#ffffff" opacity="0.6"/>
        </g>
        <path d="M268 205 Q286 220 278 242" fill="none" stroke="#ffca3a" stroke-width="3.5" stroke-linecap="round"/>
        '''
    elif state == "eating":
        return '''
        <g transform="translate(160, 274)">
          <ellipse cx="0" cy="22" rx="64" ry="11" fill="#1e130c" opacity="0.24"/>
          <circle cx="-24" cy="-6" r="9" fill="#9c5221" stroke="#5c2c0c" stroke-width="1.5"/>
          <circle cx="-10" cy="-11" r="10" fill="#b5652d" stroke="#5c2c0c" stroke-width="1.5"/>
          <circle cx="8" cy="-10" r="10" fill="#9c5221" stroke="#5c2c0c" stroke-width="1.5"/>
          <circle cx="22" cy="-5" r="9" fill="#b5652d" stroke="#5c2c0c" stroke-width="1.5"/>
          <circle cx="0" cy="-4" r="9" fill="#c97a3e" stroke="#5c2c0c" stroke-width="1.5"/>
          <path d="M-14 -14 C-19 -19 -12 -25 -7 -19 L9 -19 C14 -25 21 -19 16 -14 C21 -9 14 -3 9 -9 L-7 -9 C-12 -3 -19 -9 -14 -14 Z" fill="#ffe194" stroke="#b57c2d" stroke-width="1.8"/>
          <path d="M-50 -2 L50 -2 L60 20 C60 26 -60 26 -60 20 Z" fill="#ff6b6b" stroke="#a82020" stroke-width="2.5" stroke-linejoin="round"/>
          <ellipse cx="0" cy="-2" rx="50" ry="7" fill="#ffd166" stroke="#a82020" stroke-width="2"/>
          <circle cx="0" cy="11" r="4.5" fill="#fff3b0"/>
          <circle cx="-6" cy="5" r="2.2" fill="#fff3b0"/>
          <circle cx="0" cy="3.5" r="2.2" fill="#fff3b0"/>
          <circle cx="6" cy="5" r="2.2" fill="#fff3b0"/>
        </g>
        '''
    elif state == "drinking":
        return '''
        <g transform="translate(166, 274)">
          <ellipse cx="0" cy="22" rx="64" ry="11" fill="#1e130c" opacity="0.24"/>
          <path d="M-50 -2 L50 -2 L60 20 C60 26 -60 26 -60 20 Z" fill="#4cc9f0" stroke="#1d6fa5" stroke-width="2.5" stroke-linejoin="round"/>
          <ellipse cx="0" cy="-2" rx="50" ry="9" fill="url(#waterGrad)" stroke="#1d6fa5" stroke-width="2"/>
          <ellipse cx="0" cy="-2" rx="28" ry="4.5" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.8"/>
          <ellipse cx="0" cy="-2" rx="12" ry="2" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.9"/>
          <path d="M-38 -20 C-42 -12 -32 -12 -36 -20 Z" fill="#4cc9f0" stroke="#1d6fa5" stroke-width="1.2"/>
          <path d="M40 -24 C36 -16 46 -16 42 -24 Z" fill="#4cc9f0" stroke="#1d6fa5" stroke-width="1.2"/>
          <circle cx="-24" cy="-28" r="3.5" fill="#90e0ef"/>
          <circle cx="28" cy="-30" r="4" fill="#90e0ef"/>
        </g>
        '''
    elif state == "sleepy":
        return '''
        <g transform="translate(238, 66)">
          <path d="M10 -18 C-10 -18 -20 4 -4 18 C-18 16 -28 -2 -16 -18 C-8 -28 4 -24 10 -18 Z" fill="url(#goldGrad)" stroke="#c47f00" stroke-width="1.5"/>
          <circle cx="-26" cy="26" r="4.5" fill="#e0f7fa" opacity="0.85"/>
          <circle cx="-14" cy="12" r="7" fill="#e0f7fa" opacity="0.85"/>
          <path d="M22 4 L25 11 L32 14 L25 17 L22 24 L19 17 L12 14 L19 11 Z" fill="#ffd166"/>
          <path d="M-36 -8 L-34 -3 L-29 -1 L-34 1 L-36 6 L-38 1 L-43 -1 L-38 -3 Z" fill="#ffd166"/>
        </g>
        '''
    elif state == "tired":
        return '''
        <path d="M236 105 C236 105 224 124 232 132 C238 138 248 132 244 122 C242 115 236 105 236 105 Z" fill="#72efdd" stroke="#0096c7" stroke-width="1.8"/>
        <path d="M254 128 C254 128 246 140 251 146 C255 150 261 146 259 139 Z" fill="#72efdd" stroke="#0096c7" stroke-width="1.5"/>
        <path d="M68 82 C54 82 50 66 64 64 C78 62 84 78 70 80 C60 81 58 72 66 71" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        '''
    elif state == "sad_lonely":
        return '''
        <g transform="translate(160, 42)">
          <path d="M-28 12 C-40 12 -44 -4 -30 -8 C-26 -20 -6 -22 2 -12 C14 -18 28 -8 24 4 C34 6 32 18 20 18 L-28 18 Z" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
          <path d="M-16 26 C-19 33 -11 33 -14 26 Z" fill="#60a5fa"/>
          <path d="M0 30 C-3 37 5 37 2 30 Z" fill="#60a5fa"/>
          <path d="M16 25 C13 32 21 32 18 25 Z" fill="#60a5fa"/>
        </g>
        '''
    elif state == "excited":
        return '''
        <path d="M66 68 C66 58 52 58 52 68 C52 58 38 58 38 68 C38 80 52 90 52 90 C52 90 66 80 66 68 Z" fill="#ff4d6d" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M282 74 C282 65 270 65 270 74 C270 65 258 65 258 74 C258 84 270 92 270 92 C270 92 282 84 282 74 Z" fill="#ff4d6d" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M60 140 L65 152 L77 157 L65 162 L60 174 L55 162 L43 157 L55 152 Z" fill="#ffd166"/>
        <path d="M262 136 L267 148 L279 153 L267 158 L262 170 L257 158 L245 153 L257 148 Z" fill="#ffd166"/>
        <path d="M160 22 L160 36 M120 30 L128 42 M200 30 L192 42" stroke="#ffb703" stroke-width="4" stroke-linecap="round"/>
        '''
    elif state == "walking_adventure":
        return '''
        <g transform="translate(262, 76)">
          <circle cx="0" cy="0" r="16" fill="#fff3b0" stroke="#e09f3e" stroke-width="2"/>
          <path d="M0 -13 L4 -4 L13 0 L4 4 L0 13 L-4 4 L-13 0 L-4 -4 Z" fill="#e63946"/>
          <circle cx="0" cy="0" r="3" fill="#ffffff"/>
        </g>
        '''
    return ""


def render_adventure_backpack(state):
    """Renders an explorer backpack on the pet's back during walking_adventure."""
    if state != "walking_adventure":
        return ""
    return '''
      <g transform="translate(-44, 0) rotate(-12)">
        <rect x="-18" y="-22" width="34" height="40" rx="12" fill="#e76f51" stroke="#8d3b23" stroke-width="2.2"/>
        <path d="M-16 -8 Q0 2 14 -8" fill="none" stroke="#f4a261" stroke-width="3"/>
        <circle cx="-1" cy="-6" r="5" fill="#ffd166" stroke="#8d3b23" stroke-width="1.5"/>
        <rect x="-14" y="-30" width="28" height="10" rx="5" fill="#2a9d8f" stroke="#1d6b62" stroke-width="2"/>
      </g>
    '''


def build_pet_svg(pet_id, state):
    """Builds a complete 320x320 SVG with unique species anatomy and seamless head-to-body connection."""
    p = get_pose_parameters(state)
    face_details = render_eyes_and_mouth(pet_id, state)
    backpack = render_adventure_backpack(state)

    if pet_id == "milu":
        # 1. MILU: Fluffy Golden-Cream Lhasa Puppy (matches imgi_77 reference)
        tail_svg = f'''
          <g transform="translate(-52, 42) rotate({p['tail_rot']})">
            <path d="M0 0 C-38 -18 -46 -56 -16 -64 C-24 -46 -12 -38 -4 -48 C-14 -30 4 -18 0 0 Z" fill="url(#miluFur)" stroke="#b57c3a" stroke-width="2.2" stroke-linejoin="round"/>
          </g>
        '''
        body_svg = '''
          <!-- Rounded plush Lhasa torso with seamless neck -->
          <path d="M-46 -26 C-30 -42 30 -42 46 -26 C64 4 64 48 46 66 L-46 66 C-64 48 -64 4 -46 -26 Z" fill="url(#miluFur)" stroke="#b57c3a" stroke-width="2.4"/>
          <!-- Lush layered white-cream chest ruff (signature Lhasa/Golden tuft) -->
          <path d="M-40 -14 C-50 4 -38 18 -44 30 C-28 26 -24 38 -18 48 C-8 36 -4 44 0 54 C4 44 8 36 18 48 C24 38 28 26 44 30 C38 18 50 4 40 -14 Z" fill="url(#miluChest)" stroke="#d4a359" stroke-width="2" stroke-linejoin="round"/>
          <!-- Red collar with gold star tag -->
          <path d="M-38 -10 Q0 4 38 -10" fill="none" stroke="#e63946" stroke-width="8.5" stroke-linecap="round"/>
          <polygon points="0,2 3,9 11,10 5,15 7,23 0,19 -7,23 -5,15 -11,10 -3,9" fill="url(#goldGrad)" stroke="#9e6300" stroke-width="1.4"/>
        '''
        ears_svg = f'''
          <!-- Long wavy feathered Lhasa floppy ears -->
          <g transform="translate(-52, -14) rotate({p['ear_l_rot']})">
            <path d="M0 -14 C-28 -10 -44 18 -34 42 C-26 40 -38 56 -24 64 C-16 60 -20 72 -8 68 C4 62 12 32 8 -6 Z" fill="url(#miluEar)" stroke="#8c5319" stroke-width="2.2" stroke-linejoin="round"/>
          </g>
          <g transform="translate(52, -14) rotate({p['ear_r_rot']})">
            <path d="M0 -14 C28 -10 44 18 34 42 C26 40 38 56 24 64 C16 60 20 72 8 68 C-4 62 -12 32 -8 -6 Z" fill="url(#miluEar)" stroke="#8c5319" stroke-width="2.2" stroke-linejoin="round"/>
          </g>
        '''
        head_shape_svg = '''
          <path d="M-56 4 C-62 -28 -38 -56 -8 -58 C-14 -68 -2 -72 4 -60 C12 -70 22 -64 16 -56 C42 -52 62 -26 56 4 C64 22 48 46 0 46 C-48 46 -64 22 -56 4 Z" fill="url(#miluFur)" stroke="#b57c3a" stroke-width="2.4" stroke-linejoin="round"/>
          <path d="M-34 14 C-38 2 -18 -2 0 2 C18 -2 38 2 34 14 C40 24 26 36 14 30 C8 38 -8 38 -14 30 C-26 36 -40 24 -34 14 Z" fill="url(#miluChest)" stroke="#cfa05a" stroke-width="1.8"/>
        '''
        paw_fill, paw_stroke = "url(#miluFur)", "#9c6628"

    elif pet_id == "boba":
        # 2. BOBA: Pembroke Welsh Corgi with Royal Mini Crown & White Blaze
        tail_svg = f'''
          <g transform="translate(-48, 38) rotate({p['tail_rot']})">
            <ellipse cx="-10" cy="-6" rx="14" ry="11" fill="url(#bobaFur)" stroke="#9e490c" stroke-width="2.2"/>
            <ellipse cx="-14" cy="-8" rx="7" ry="6" fill="url(#bobaWhite)"/>
          </g>
        '''
        body_svg = '''
          <ellipse cx="0" cy="18" rx="55" ry="50" fill="url(#bobaFur)" stroke="#9e490c" stroke-width="2.4"/>
          <ellipse cx="0" cy="22" rx="36" ry="40" fill="url(#bobaWhite)"/>
          <path d="M-40 -8 Q0 6 40 -8" fill="none" stroke="#ff8fa3" stroke-width="8.5" stroke-linecap="round"/>
          <circle cx="0" cy="4" r="7.5" fill="url(#goldGrad)" stroke="#9e6300" stroke-width="1.5"/>
        '''
        ears_svg = f'''
          <g transform="translate(-38, -36) rotate({p['ear_l_rot']})">
            <path d="M-18 12 C-28 -26 -14 -52 4 -46 C18 -40 22 -8 14 14 Z" fill="url(#bobaFur)" stroke="#9e490c" stroke-width="2.4"/>
            <path d="M-10 8 C-17 -18 -8 -36 2 -32 C10 -28 13 -6 8 10 Z" fill="#ffb3c1"/>
          </g>
          <g transform="translate(38, -36) rotate({p['ear_r_rot']})">
            <path d="M18 12 C28 -26 14 -52 -4 -46 C-18 -40 -22 -8 -14 14 Z" fill="url(#bobaFur)" stroke="#9e490c" stroke-width="2.4"/>
            <path d="M10 8 C17 -18 8 -36 -2 -32 C-10 -28 -13 -6 -8 10 Z" fill="#ffb3c1"/>
          </g>
        '''
        head_shape_svg = '''
          <ellipse cx="0" cy="-2" rx="58" ry="47" fill="url(#bobaFur)" stroke="#9e490c" stroke-width="2.4"/>
          <path d="M-8 -44 C-10 -18 -38 2 -40 24 C-36 42 36 42 40 24 C38 2 10 -18 8 -44 Z" fill="url(#bobaWhite)"/>
          <g transform="translate(0, -52)">
            <path d="M-18 8 L-22 -10 L-8 -2 L0 -15 L8 -2 L22 -10 L18 8 Z" fill="url(#goldGrad)" stroke="#996200" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="0" cy="0" r="3.5" fill="#e63946"/>
            <circle cx="-11" cy="2" r="2.2" fill="#4cc9f0"/>
            <circle cx="11" cy="2" r="2.2" fill="#4cc9f0"/>
          </g>
        '''
        paw_fill, paw_stroke = "url(#bobaWhite)", "#b07d56"

    elif pet_id == "cookie":
        # 3. COOKIE: Shiba Inu with Curly Tail, White Urajiro Cheeks, Round Brow Dots & Mint Bandana
        tail_svg = f'''
          <g transform="translate(46, 26) rotate({p['tail_rot']})">
            <path d="M-6 14 C32 10 42 -28 14 -42 C-8 -50 -22 -26 -6 -14 C6 -6 16 -18 8 -24" fill="url(#cookieFur)" stroke="#85350b" stroke-width="3" stroke-linecap="round"/>
            <path d="M14 -42 C0 -46 -12 -34 -6 -22" fill="url(#cookieCream)"/>
          </g>
        '''
        body_svg = '''
          <path d="M-44 -26 C-28 -42 28 -42 44 -26 C58 8 56 50 42 64 L-42 64 C-56 50 -58 8 -44 -26 Z" fill="url(#cookieFur)" stroke="#85350b" stroke-width="2.4"/>
          <ellipse cx="0" cy="24" rx="33" ry="38" fill="url(#cookieCream)"/>
          <!-- Mint Green Bandana Kerchief -->
          <path d="M-42 -10 L42 -10 L0 24 Z" fill="#52b788" stroke="#1b4332" stroke-width="2.2" stroke-linejoin="round"/>
          <circle cx="-12" cy="-1" r="2.5" fill="#ffffff" opacity="0.85"/>
          <circle cx="12" cy="-1" r="2.5" fill="#ffffff" opacity="0.85"/>
          <circle cx="0" cy="9" r="2.5" fill="#ffffff" opacity="0.85"/>
        '''
        ears_svg = f'''
          <g transform="translate(-36, -38) rotate({p['ear_l_rot']})">
            <polygon points="-16,10 -24,-36 14,-8" fill="url(#cookieFur)" stroke="#85350b" stroke-width="2.4" stroke-linejoin="round"/>
            <polygon points="-11,6 -17,-24 7,-5" fill="#faebd7"/>
          </g>
          <g transform="translate(36, -38) rotate({p['ear_r_rot']})">
            <polygon points="16,10 24,-36 -14,-8" fill="url(#cookieFur)" stroke="#85350b" stroke-width="2.4" stroke-linejoin="round"/>
            <polygon points="11,6 17,-24 -7,-5" fill="#faebd7"/>
          </g>
        '''
        head_shape_svg = '''
          <ellipse cx="0" cy="-2" rx="56" ry="46" fill="url(#cookieFur)" stroke="#85350b" stroke-width="2.4"/>
          <path d="M-52 8 C-40 -2 -18 12 0 4 C18 12 40 -2 52 8 C48 34 28 45 0 45 C-28 45 -48 34 -52 8 Z" fill="url(#cookieCream)"/>
          <ellipse cx="-22" cy="-28" rx="7" ry="4.5" fill="#fffdf9" transform="rotate(-12 -22 -28)"/>
          <ellipse cx="22" cy="-28" rx="7" ry="4.5" fill="#fffdf9" transform="rotate(12 22 -28)"/>
        '''
        paw_fill, paw_stroke = "url(#cookieCream)", "#85350b"

    elif pet_id == "mochi":
        # 4. MOCHI: White Cream Cat with Pink Ears, Grey-Tipped Tail & Gold Bell Collar
        tail_svg = f'''
          <g transform="translate(46, 36) rotate({p['tail_rot']})">
            <path d="M-6 8 C34 4 48 -36 28 -58 C18 -68 6 -56 14 -42 C24 -24 12 -4 -8 0 Z" fill="url(#mochiTail)" stroke="#7f7068" stroke-width="2.2"/>
          </g>
        '''
        body_svg = '''
          <path d="M-42 -26 C-26 -40 26 -40 42 -26 C54 8 52 50 38 64 L-38 64 C-52 50 -54 8 -42 -26 Z" fill="url(#mochiFur)" stroke="#b8a394" stroke-width="2.3"/>
          <path d="M-36 -8 Q0 4 36 -8" fill="none" stroke="#ff4d6d" stroke-width="7.5" stroke-linecap="round"/>
          <circle cx="0" cy="4" r="8.5" fill="url(#goldGrad)" stroke="#996200" stroke-width="1.6"/>
          <line x1="-5" y1="6" x2="5" y2="6" stroke="#7a4e00" stroke-width="1.5"/>
          <circle cx="0" cy="9" r="2" fill="#5c3a00"/>
        '''
        ears_svg = f'''
          <g transform="translate(-36, -36) rotate({p['ear_l_rot']})">
            <path d="M-16 12 L-24 -36 L16 -8 Z" fill="url(#mochiFur)" stroke="#b8a394" stroke-width="2.3" stroke-linejoin="round"/>
            <path d="M-11 8 L-17 -25 L9 -6 Z" fill="#ffafcc"/>
          </g>
          <g transform="translate(36, -36) rotate({p['ear_r_rot']})">
            <path d="M16 12 L24 -36 -16 -8 Z" fill="url(#mochiFur)" stroke="#b8a394" stroke-width="2.3" stroke-linejoin="round"/>
            <path d="M11 8 L17 -25 -9 -6 Z" fill="#ffafcc"/>
          </g>
        '''
        head_shape_svg = '''
          <ellipse cx="0" cy="-2" rx="55" ry="45" fill="url(#mochiFur)" stroke="#b8a394" stroke-width="2.3"/>
          <path d="M-38 10 L-62 6 M-38 16 L-64 18 M38 10 L62 6 M38 16 L64 18" stroke="#9e8c7f" stroke-width="1.8" stroke-linecap="round"/>
        '''
        paw_fill, paw_stroke = "url(#mochiFur)", "#b8a394"

    elif pet_id == "pepper":
        # 5. PEPPER: Chubby British Shorthair Silver-Grey Cat (matches imgi_72 reference)
        tail_svg = f'''
          <g transform="translate(-48, 36) rotate({p['tail_rot']})">
            <path d="M6 10 C-36 6 -48 -28 -26 -48 C-14 -58 -2 -44 -10 -30 C-18 -14 -6 -2 10 2 Z" fill="url(#pepperFur)" stroke="#3e4852" stroke-width="2.4"/>
          </g>
        '''
        body_svg = '''
          <ellipse cx="0" cy="18" rx="60" ry="50" fill="url(#pepperFur)" stroke="#3e4852" stroke-width="2.4"/>
          <ellipse cx="0" cy="22" rx="36" ry="36" fill="url(#pepperLight)" opacity="0.55"/>
          <g transform="translate(0, -4)">
            <polygon points="-22,-10 -22,10 0,0" fill="#3a86ff" stroke="#1d3557" stroke-width="2" stroke-linejoin="round"/>
            <polygon points="22,-10 22,10 0,0" fill="#3a86ff" stroke="#1d3557" stroke-width="2" stroke-linejoin="round"/>
            <line x1="-14" y1="-6" x2="-14" y2="6" stroke="#a8dadc" stroke-width="2.5"/>
            <line x1="14" y1="-6" x2="14" y2="6" stroke="#a8dadc" stroke-width="2.5"/>
            <circle cx="0" cy="0" r="6" fill="#1d3557"/>
          </g>
        '''
        ears_svg = f'''
          <g transform="translate(-40, -34) rotate({p['ear_l_rot']})">
            <path d="M-16 12 C-24 -12 -18 -32 -4 -30 C8 -28 18 -10 14 8 Z" fill="url(#pepperFur)" stroke="#3e4852" stroke-width="2.4"/>
            <path d="M-10 6 C-15 -8 -11 -20 -3 -19 C4 -18 9 -6 7 4 Z" fill="#d8b4bc"/>
          </g>
          <g transform="translate(40, -34) rotate({p['ear_r_rot']})">
            <path d="M16 12 C24 -12 18 -32 4 -30 C-8 -28 -18 -10 -14 8 Z" fill="url(#pepperFur)" stroke="#3e4852" stroke-width="2.4"/>
            <path d="M10 6 C15 -8 11 -20 3 -19 C-4 -18 -9 -6 -7 4 Z" fill="#d8b4bc"/>
          </g>
        '''
        head_shape_svg = '''
          <path d="M-62 4 C-66 -32 -38 -52 0 -52 C38 -52 66 -32 62 4 C68 26 46 47 0 47 C-46 47 -68 26 -62 4 Z" fill="url(#pepperFur)" stroke="#3e4852" stroke-width="2.4"/>
          <ellipse cx="-14" cy="18" rx="16" ry="11" fill="url(#pepperLight)"/>
          <ellipse cx="14" cy="18" rx="16" ry="11" fill="url(#pepperLight)"/>
          <path d="M-36 14 L-66 10 M-36 20 L-68 22 M36 14 L66 10 M36 20 L68 22" stroke="#f1f5f9" stroke-width="2" stroke-linecap="round"/>
        '''
        paw_fill, paw_stroke = "url(#pepperFur)", "#3e4852"

    elif pet_id == "oreo":
        # 6. OREO: Tuxedo Black & White Bicolor Cat with White Socks & Silver Heart Tag
        tail_svg = f'''
          <g transform="translate(46, 36) rotate({p['tail_rot']})">
            <path d="M-6 8 C34 4 48 -36 28 -58 C18 -68 6 -56 14 -42 C24 -24 12 -4 -8 0 Z" fill="url(#oreoBlack)" stroke="#0b0c0e" stroke-width="2.2"/>
            <circle cx="24" cy="-54" r="8" fill="url(#oreoWhite)"/>
          </g>
        '''
        body_svg = '''
          <path d="M-44 -26 C-28 -40 28 -40 44 -26 C56 8 54 50 40 64 L-40 64 C-54 50 -56 8 -44 -26 Z" fill="url(#oreoBlack)" stroke="#0b0c0e" stroke-width="2.4"/>
          <path d="M-26 -14 L26 -14 L18 48 C10 58 -10 58 -18 48 Z" fill="url(#oreoWhite)"/>
          <path d="M-36 -8 Q0 4 36 -8" fill="none" stroke="#3b4252" stroke-width="7.5" stroke-linecap="round"/>
          <path d="M0 10 C0 4 -9 4 -9 10 C-9 16 0 21 0 21 C0 21 9 16 9 10 C9 4 0 4 0 10 Z" fill="#e2e8f0" stroke="#475569" stroke-width="1.6"/>
        '''
        ears_svg = f'''
          <g transform="translate(-36, -36) rotate({p['ear_l_rot']})">
            <path d="M-16 12 L-26 -36 L16 -8 Z" fill="url(#oreoBlack)" stroke="#0b0c0e" stroke-width="2.3" stroke-linejoin="round"/>
            <path d="M-11 8 L-18 -24 L8 -6 Z" fill="#ffb3c6"/>
          </g>
          <g transform="translate(36, -36) rotate({p['ear_r_rot']})">
            <path d="M16 12 L26 -36 -16 -8 Z" fill="url(#oreoBlack)" stroke="#0b0c0e" stroke-width="2.3" stroke-linejoin="round"/>
            <path d="M11 8 L18 -24 -8 -6 Z" fill="#ffb3c6"/>
          </g>
        '''
        head_shape_svg = '''
          <ellipse cx="0" cy="-2" rx="56" ry="45" fill="url(#oreoBlack)" stroke="#0b0c0e" stroke-width="2.4"/>
          <path d="M0 -18 L-38 28 C-24 44 24 44 38 28 Z" fill="url(#oreoWhite)"/>
          <path d="M-38 14 L-64 10 M-38 20 L-66 22 M38 14 L64 10 M38 20 L66 22" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
        '''
        paw_fill, paw_stroke = "url(#oreoWhite)", "#64748b"

    elif pet_id == "ember":
        # 7. EMBER: Baby Fire Dragon with Golden Belly Plates, Cute Wings, Horns & Tail Flame
        tail_svg = f'''
          <g transform="translate(46, 36) rotate({p['tail_rot']})">
            <path d="M-8 10 C28 12 46 -12 36 -36 C28 -22 14 -6 -8 0 Z" fill="url(#emberScale)" stroke="#7a120d" stroke-width="2.3"/>
            <path d="M36 -34 C24 -48 34 -68 46 -74 C54 -60 62 -44 48 -32 Z" fill="#ff5400" stroke="#9b1b14" stroke-width="1.5"/>
            <path d="M38 -36 C32 -46 38 -58 45 -64 C50 -54 54 -44 45 -34 Z" fill="#ffbd00"/>
            <circle cx="43" cy="-42" r="4" fill="#fff3b0"/>
          </g>
        '''
        body_svg = '''
          <path d="M-42 -8 C-78 -32 -86 0 -58 18 C-68 6 -52 2 -40 10 Z" fill="#ff9f1c" stroke="#9b1b14" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M42 -8 C78 -32 86 0 58 18 C68 6 52 2 40 10 Z" fill="#ff9f1c" stroke="#9b1b14" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M-44 -26 C-28 -40 28 -40 44 -26 C56 8 54 50 38 64 L-38 64 C-54 50 -56 8 -44 -26 Z" fill="url(#emberScale)" stroke="#7a120d" stroke-width="2.4"/>
          <path d="M-30 -8 C-34 20 -28 54 0 58 C28 54 34 20 30 -8 Z" fill="url(#emberBelly)" stroke="#b5620e" stroke-width="1.8"/>
          <line x1="-26" y1="10" x2="26" y2="10" stroke="#b5620e" stroke-width="1.8"/>
          <line x1="-28" y1="25" x2="28" y2="25" stroke="#b5620e" stroke-width="1.8"/>
          <line x1="-24" y1="40" x2="24" y2="40" stroke="#b5620e" stroke-width="1.8"/>
        '''
        ears_svg = f'''
          <g transform="translate(-32, -38) rotate({p['ear_l_rot']})">
            <path d="M-8 6 C-22 -16 -16 -40 -2 -38 C8 -36 10 -12 6 6 Z" fill="url(#emberHorn)" stroke="#8a5200" stroke-width="2.2"/>
          </g>
          <g transform="translate(32, -38) rotate({p['ear_r_rot']})">
            <path d="M8 6 C22 -16 16 -40 2 -38 C-8 -36 -10 -12 -6 6 Z" fill="url(#emberHorn)" stroke="#8a5200" stroke-width="2.2"/>
          </g>
        '''
        head_shape_svg = '''
          <ellipse cx="0" cy="-2" rx="54" ry="45" fill="url(#emberScale)" stroke="#7a120d" stroke-width="2.4"/>
          <circle cx="0" cy="-36" r="4.5" fill="#ffd166"/>
          <circle cx="0" cy="-25" r="3.5" fill="#ffd166"/>
        '''
        paw_fill, paw_stroke = "url(#emberScale)", "#7a120d"

    elif pet_id == "lumi":
        # 8. LUMI: Pearl White Unicorn with Spiraled Rainbow Horn, 4-Color Pastel Mane & Pink Hooves
        tail_svg = f'''
          <g transform="translate(-46, 32) rotate({p['tail_rot']})">
            <path d="M0 0 C-36 -18 -48 -6 -34 14 C-18 28 -4 14 0 0 Z" fill="#ffafcc" stroke="#b56584" stroke-width="1.8"/>
            <path d="M-4 -8 C-40 -30 -52 -16 -36 4 C-20 16 -6 6 -4 -8 Z" fill="#a2d2ff" stroke="#5c95c9" stroke-width="1.8"/>
            <path d="M2 8 C-30 2 -40 22 -22 30 C-8 34 2 20 2 8 Z" fill="#cdb4db" stroke="#886f99" stroke-width="1.8"/>
          </g>
        '''
        body_svg = '''
          <path d="M-42 -26 C-26 -40 26 -40 42 -26 C54 8 52 50 38 64 L-38 64 C-52 50 -54 8 -42 -26 Z" fill="url(#lumiCoat)" stroke="#a38fb8" stroke-width="2.3"/>
          <path d="M-36 -8 Q0 4 36 -8" fill="none" stroke="#cdb4db" stroke-width="6.5" stroke-linecap="round"/>
          <polygon points="0,1 3,8 10,9 5,14 6,21 0,17 -6,21 -5,14 -10,9 -3,8" fill="url(#goldGrad)" stroke="#9e6300" stroke-width="1.4"/>
        '''
        ears_svg = f'''
          <g transform="translate(-38, -34) rotate({p['ear_l_rot']})">
            <path d="M-12 10 C-24 -12 -14 -34 0 -28 C10 -22 12 -2 6 10 Z" fill="url(#lumiCoat)" stroke="#a38fb8" stroke-width="2.2"/>
            <path d="M-7 6 C-15 -8 -9 -22 -1 -18 C5 -14 6 -2 3 6 Z" fill="#ffafcc"/>
          </g>
          <g transform="translate(38, -34) rotate({p['ear_r_rot']})">
            <path d="M12 10 C24 -12 14 -34 0 -28 C-10 -22 -12 -2 -6 10 Z" fill="url(#lumiCoat)" stroke="#a38fb8" stroke-width="2.2"/>
            <path d="M7 6 C15 -8 9 -22 1 -18 C-5 -14 -6 -2 -3 6 Z" fill="#ffafcc"/>
          </g>
        '''
        head_shape_svg = '''
          <ellipse cx="0" cy="-2" rx="53" ry="45" fill="url(#lumiCoat)" stroke="#a38fb8" stroke-width="2.3"/>
          <path d="M-24 -42 C-34 -26 -14 -16 -6 -34 Z" fill="#ffafcc" stroke="#b56584" stroke-width="1.6"/>
          <path d="M-10 -46 C-16 -24 6 -18 8 -38 Z" fill="#fff3b0" stroke="#c2a83e" stroke-width="1.6"/>
          <path d="M6 -44 C4 -24 24 -20 24 -38 Z" fill="#b9fbc0" stroke="#5ca865" stroke-width="1.6"/>
          <path d="M18 -40 C20 -22 38 -22 34 -36 Z" fill="#cdb4db" stroke="#886f99" stroke-width="1.6"/>
          <path d="M-11 -42 L0 -84 L11 -42 Z" fill="url(#lumiHorn)" stroke="#9e7bb5" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M-8 -52 Q0 -48 8 -52 M-5 -64 Q0 -60 5 -64" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        '''
        paw_fill, paw_stroke = "#ffafcc", "#9e5874"

    elif pet_id == "pip":
        # 9. PIP: Arctic Snow Fox with Giant Fluffy Ice-Tipped Tail, Large Fox Ears & Ice Scarf
        tail_svg = f'''
          <g transform="translate(44, 34) rotate({p['tail_rot']})">
            <path d="M-10 14 C36 22 64 -16 44 -52 C28 -72 2 -52 0 -24 C-2 -6 -6 6 -10 14 Z" fill="url(#pipFur)" stroke="#7faecc" stroke-width="2.4"/>
            <path d="M44 -52 C32 -66 14 -56 10 -38 C22 -34 34 -36 44 -52 Z" fill="url(#pipIceTip)"/>
          </g>
        '''
        body_svg = '''
          <path d="M-42 -26 C-26 -40 26 -40 42 -26 C54 8 52 50 38 64 L-38 64 C-52 50 -54 8 -42 -26 Z" fill="url(#pipFur)" stroke="#7faecc" stroke-width="2.3"/>
          <path d="M-40 -8 Q0 6 40 -8" fill="none" stroke="#48cae4" stroke-width="11" stroke-linecap="round"/>
          <path d="M14 -2 L26 30 L8 32 L6 0 Z" fill="#0096c7" stroke="#023e8a" stroke-width="1.8" stroke-linejoin="round"/>
          <line x1="10" y1="26" x2="24" y2="24" stroke="#caf0f8" stroke-width="2.5"/>
        '''
        ears_svg = f'''
          <g transform="translate(-38, -34) rotate({p['ear_l_rot']})">
            <polygon points="-18,14 -28,-42 18,-8" fill="url(#pipIceTip)" stroke="#7faecc" stroke-width="2.3" stroke-linejoin="round"/>
            <polygon points="-11,8 -18,-24 9,-4" fill="#d8f3dc"/>
          </g>
          <g transform="translate(38, -34) rotate({p['ear_r_rot']})">
            <polygon points="18,14 28,-42 -18,-8" fill="url(#pipIceTip)" stroke="#7faecc" stroke-width="2.3" stroke-linejoin="round"/>
            <polygon points="11,8 18,-24 -9,-4" fill="#d8f3dc"/>
          </g>
        '''
        head_shape_svg = '''
          <path d="M-58 4 C-48 -34 -28 -48 0 -48 C28 -48 48 -34 58 4 C44 34 22 44 0 44 C-22 44 -44 34 -58 4 Z" fill="url(#pipFur)" stroke="#7faecc" stroke-width="2.3" stroke-linejoin="round"/>
        '''
        paw_fill, paw_stroke = "#bde0fe", "#5c8ead"

    else:  # 10. AQUA: Sea Otter with Cocoa Fur, Cream Tummy, Small Round Side Ears & Pink Seashell
        tail_svg = f'''
          <g transform="translate(-48, 42) rotate({p['tail_rot']})">
            <path d="M8 8 C-34 14 -52 -6 -42 -22 C-32 -34 -8 -18 10 -4 Z" fill="url(#aquaFur)" stroke="#3d2210" stroke-width="2.4"/>
          </g>
        '''
        body_svg = '''
          <path d="M-44 -26 C-28 -42 28 -42 44 -26 C56 10 56 52 40 66 L-40 66 C-56 52 -56 10 -44 -26 Z" fill="url(#aquaFur)" stroke="#3d2210" stroke-width="2.4"/>
          <ellipse cx="0" cy="24" rx="34" ry="36" fill="url(#aquaCream)"/>
          <g transform="translate(0, 16)">
            <path d="M-16 4 C-20 -12 20 -12 16 4 L8 14 L-8 14 Z" fill="#ffafcc" stroke="#b55d7a" stroke-width="2" stroke-linejoin="round"/>
            <line x1="0" y1="-8" x2="0" y2="12" stroke="#b55d7a" stroke-width="1.5"/>
            <line x1="-8" y1="-5" x2="-4" y2="12" stroke="#b55d7a" stroke-width="1.5"/>
            <line x1="8" y1="-5" x2="4" y2="12" stroke="#b55d7a" stroke-width="1.5"/>
          </g>
        '''
        ears_svg = f'''
          <g transform="translate(-52, -12) rotate({p['ear_l_rot']})">
            <circle cx="-4" cy="0" r="12" fill="url(#aquaFur)" stroke="#3d2210" stroke-width="2.3"/>
            <circle cx="-4" cy="0" r="6" fill="#d4a373"/>
          </g>
          <g transform="translate(52, -12) rotate({p['ear_r_rot']})">
            <circle cx="4" cy="0" r="12" fill="url(#aquaFur)" stroke="#3d2210" stroke-width="2.3"/>
            <circle cx="4" cy="0" r="6" fill="#d4a373"/>
          </g>
        '''
        head_shape_svg = '''
          <ellipse cx="0" cy="-2" rx="54" ry="44" fill="url(#aquaFur)" stroke="#3d2210" stroke-width="2.4"/>
          <ellipse cx="-13" cy="15" rx="18" ry="13" fill="url(#aquaCream)"/>
          <ellipse cx="13" cy="15" rx="18" ry="13" fill="url(#aquaCream)"/>
          <path d="M-28 14 L-54 12 M-28 20 L-52 22 M28 14 L54 12 M28 20 L52 22" stroke="#fff8ec" stroke-width="2" stroke-linecap="round"/>
        '''
        paw_fill, paw_stroke = "url(#aquaFur)", "#3d2210"

    paws_svg = f'''
      <ellipse cx="-44" cy="60" rx="16" ry="11" fill="{paw_fill}" stroke="{paw_stroke}" stroke-width="2.2"/>
      <ellipse cx="44" cy="60" rx="16" ry="11" fill="{paw_fill}" stroke="{paw_stroke}" stroke-width="2.2"/>
      <g transform="translate({-22 + p['paw_l_dx']}, {62 + p['paw_l_dy']})">
        <ellipse cx="0" cy="0" rx="14" ry="10.5" fill="{paw_fill}" stroke="{paw_stroke}" stroke-width="2.2"/>
        <circle cx="-5" cy="2" r="2" fill="{paw_stroke}" opacity="0.6"/>
        <circle cx="0" cy="3" r="2" fill="{paw_stroke}" opacity="0.6"/>
        <circle cx="5" cy="2" r="2" fill="{paw_stroke}" opacity="0.6"/>
      </g>
      <g transform="translate({22 + p['paw_r_dx']}, {62 + p['paw_r_dy']})">
        <ellipse cx="0" cy="0" rx="14" ry="10.5" fill="{paw_fill}" stroke="{paw_stroke}" stroke-width="2.2"/>
        <circle cx="-5" cy="2" r="2" fill="{paw_stroke}" opacity="0.6"/>
        <circle cx="0" cy="3" r="2" fill="{paw_stroke}" opacity="0.6"/>
        <circle cx="5" cy="2" r="2" fill="{paw_stroke}" opacity="0.6"/>
      </g>
    '''

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  {get_common_defs()}
  <ellipse cx="160" cy="{p['shadow_y']}" rx="{p['shadow_rx']}" ry="{p['shadow_ry']}" fill="#1e130c" opacity="0.20"/>

  {render_state_props_back(state)}

  <g filter="url(#dropShadow)" transform="translate({160 + p['body_dx']}, {206 + p['body_dy']}) rotate({p['body_rot']}) scale(1, {p['body_scale_y']})">
    {tail_svg}
    {backpack}
    {body_svg}
    {paws_svg}

    <!-- Head Group seamlessly overlapping upper torso -->
    <g filter="url(#headShadow)" transform="translate({p['head_dx']}, {-52 + p['head_dy']}) rotate({p['head_rot']})">
      {ears_svg}
      {head_shape_svg}
      {face_details}
    </g>
  </g>

  {render_state_props_front(state)}
</svg>'''

    if "<text" in svg.lower():
        raise ValueError(f"Forbidden <text> element detected in {pet_id}/{state}!")
    return svg


def render_svg_to_png(page, svg_code, target_path, width=320, height=320):
    html = f'''<!DOCTYPE html>
<html>
<head>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    html, body {{ background: transparent !important; overflow: hidden; width: {width}px; height: {height}px; }}
    svg {{ display: block; width: {width}px; height: {height}px; }}
  </style>
</head>
<body>
  {svg_code}
</body>
</html>'''
    page.set_viewport_size({"width": width, "height": height})
    page.set_content(html)
    png_bytes = page.screenshot(omit_background=True)

    img = Image.open(io.BytesIO(png_bytes))
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    img.save(target_path, format="PNG", optimize=True)


def verify_single_png(target_path):
    """Reads the real PNG file on disk via PIL and verifies dimensions, RGBA, transparency & size."""
    if not os.path.exists(target_path):
        raise FileNotFoundError(f"Missing generated file: {target_path}")
    file_size = os.path.getsize(target_path)
    if file_size <= 0:
        raise ValueError(f"Empty file: {target_path}")

    with Image.open(target_path) as img:
        width, height = img.size
        mode = img.mode
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((width - 1, 0)),
            img.getpixel((0, height - 1)),
            img.getpixel((width - 1, height - 1)),
        ]
        is_transparent = (mode == "RGBA") and all(c[3] == 0 for c in corners)

    with open(target_path, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()

    verified = (width == 320 and height == 320 and file_size > 0 and is_transparent)
    if not verified:
        raise ValueError(
            f"Verification failed for {target_path}: size={width}x{height}, mode={mode}, "
            f"transparent={is_transparent}, bytes={file_size}"
        )
    return {
        "width": width,
        "height": height,
        "fileSize": file_size,
        "transparent": is_transparent,
        "verified": verified,
        "sha256": sha256,
    }


def main():
    assert len(PETS_ORDER) == 10, f"CRITICAL: Must be exactly 10 pets, got {len(PETS_ORDER)}"
    assert len(STATES_ORDER) == 10, f"CRITICAL: Must be 10 states per pet, got {len(STATES_ORDER)}"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # =====================================================================
        # PHASE 1: GENERATE MILU (ALL 10 STATES FIRST) AND VERIFY
        # =====================================================================
        print("=" * 72)
        print("[PHASE 1] Generating MILU (milu) - all 10 states first...")
        print("=" * 72)
        milu_hashes = set()
        for idx, state in enumerate(STATES_ORDER, 1):
            out_path = os.path.join(OUT_DIR, "milu", f"{state}.png")
            svg_code = build_pet_svg("milu", state)
            render_svg_to_png(page, svg_code, out_path, 320, 320)
            info = verify_single_png(out_path)
            milu_hashes.add(info["sha256"])
            print(
                f"  [Milu {idx:02d}/10] assets/pets/milu/{state}.png -> "
                f"{info['width']}x{info['height']} RGBA, {info['fileSize']} bytes, "
                f"transparent={info['transparent']}, verified={info['verified']}"
            )

        if len(milu_hashes) != 10:
            raise RuntimeError("Milu states are not all distinct!")
        print("[PHASE 1 COMPLETE] All 10 states of Milu generated and verified!\n")

        # =====================================================================
        # PHASE 2: GENERATE REMAINING 9 PETS x 10 STATES (= 90 PNGs)
        # =====================================================================
        remaining_pets = [pet for pet in PETS_ORDER if pet != "milu"]
        print("=" * 72)
        print(f"[PHASE 2] Generating remaining {len(remaining_pets)} pets x 10 states (90 assets)...")
        print("=" * 72)

        for pet_idx, pet_id in enumerate(remaining_pets, 2):
            pet_hashes = set()
            for state in STATES_ORDER:
                out_path = os.path.join(OUT_DIR, pet_id, f"{state}.png")
                svg_code = build_pet_svg(pet_id, state)
                render_svg_to_png(page, svg_code, out_path, 320, 320)
                info = verify_single_png(out_path)
                pet_hashes.add(info["sha256"])
            if len(pet_hashes) != 10:
                raise RuntimeError(f"States for {pet_id} are not all distinct!")
            print(f"  [Pet {pet_idx:02d}/10] '{pet_id}' -> 10/10 states generated & verified (320x320 RGBA).")

        browser.close()

    # =========================================================================
    # PHASE 3: BUILD & VERIFY MANIFEST.JSON FROM REAL FILES ON DISK
    # =========================================================================
    print("\n" + "=" * 72)
    print("[PHASE 3] Inspecting all 100 PNG files on disk to write assets/pets/manifest.json...")
    print("=" * 72)

    manifest = []
    all_hashes = set()

    for pet_id in PETS_ORDER:
        for state in STATES_ORDER:
            rel_path = f"assets/pets/{pet_id}/{state}.png"
            abs_path = os.path.join(ROOT_DIR, "assets", "pets", pet_id, f"{state}.png")
            info = verify_single_png(abs_path)
            all_hashes.add(info["sha256"])

            entry = {
                "petId": pet_id,
                "state": state,
                "assetPath": rel_path,
                "format": "png",
                "width": info["width"],
                "height": info["height"],
                "fileSize": info["fileSize"],
                "transparent": info["transparent"],
                "animationType": ANIMATION_TYPES[state],
                "fallbackState": "idle_happy",
                "verified": info["verified"],
            }
            manifest.append(entry)

    manifest_path = os.path.join(OUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"Total entries in manifest.json: {len(manifest)}")
    print(f"Unique image hashes across 100 assets: {len(all_hashes)}/100")
    print(f"Manifest written to: {manifest_path}")


if __name__ == "__main__":
    main()
