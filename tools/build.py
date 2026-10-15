"""Đóng gói index.html + modules/*.js + assets/pets/*/*.png thành 1 file độc lập.
Bản Cloudflare (index.html) dùng file ảnh rời; bản 1 file nhúng ảnh cơ sở + ảnh stage trong giới hạn dung lượng hợp lý.
"""
import base64, json, os, re, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
missing = []

STAGE_NAMES = ('baby', 'young', 'teen', 'adult', 'elite')
STAGE_EMBED_BUDGET_BYTES = int(os.environ.get('ELW_STAGE_EMBED_BUDGET_KB', '1400')) * 1024
SKIP_STAGE_EMBED = os.environ.get('ELW_SKIP_STAGE_EMBED', '0') == '1'

# 1. Nhúng toàn bộ ảnh pet cơ sở (assets/pets/<id>/<state>.png)
pet_assets = {}
stage_embedded_count = 0
stage_embedded_bytes = 0
pets_dir = os.path.join(root, 'assets', 'pets')
if os.path.isdir(pets_dir):
    for pet_id in sorted(os.listdir(pets_dir)):
        pdir = os.path.join(pets_dir, pet_id)
        if not os.path.isdir(pdir):
            continue
        for fn in sorted(os.listdir(pdir)):
            full_fn = os.path.join(pdir, fn)
            if os.path.isfile(full_fn) and fn.lower().endswith('.png'):
                rel_path = f"assets/pets/{pet_id}/{fn}"
                raw = open(full_fn, 'rb').read()
                b64 = base64.b64encode(raw).decode('ascii')
                pet_assets[rel_path] = f"data:image/png;path={rel_path};base64,{b64}"

        # 2. Nhúng ảnh theo stage (assets/pets/<id>/<stage>/<state>.png) trong giới hạn dung lượng hợp lý
        if not SKIP_STAGE_EMBED:
            for stage_name in STAGE_NAMES:
                sdir = os.path.join(pdir, stage_name)
                if not os.path.isdir(sdir):
                    continue
                for fn in sorted(os.listdir(sdir)):
                    full_sfn = os.path.join(sdir, fn)
                    if not (os.path.isfile(full_sfn) and fn.lower().endswith('.png')):
                        continue
                    raw_stage = open(full_sfn, 'rb').read()
                    if stage_embedded_bytes + len(raw_stage) > STAGE_EMBED_BUDGET_BYTES:
                        continue
                    rel_stage_path = f"assets/pets/{pet_id}/{stage_name}/{fn}"
                    b64_stage = base64.b64encode(raw_stage).decode('ascii')
                    pet_assets[rel_stage_path] = f"data:image/png;path={rel_stage_path};base64,{b64_stage}"
                    stage_embedded_count += 1
                    stage_embedded_bytes += len(raw_stage)

asset_bootstrap = (
    "<script>\n"
    "(function(){\n"
    "  window.ELW_PET_ASSETS = " + json.dumps(pet_assets, ensure_ascii=False) + ";\n"
    "  window.ELW_EMBEDDED_PET_ASSETS = window.ELW_PET_ASSETS;\n"
    "  window.resolvePetAsset = function(p){\n"
    "    if (!p || typeof p !== 'string') return p;\n"
    "    var clean = p.replace(/^\\.\\//, '');\n"
    "    if (window.ELW_PET_ASSETS && window.ELW_PET_ASSETS[clean]) {\n"
    "      return window.ELW_PET_ASSETS[clean];\n"
    "    }\n"
    "    var stageMatch = clean.match(/^assets\\/pets\\/([^\\/]+)\\/(baby|young|teen|adult|elite)\\/([^\\/]+\\.png)$/);\n"
    "    if (stageMatch && window.ELW_PET_ASSETS) {\n"
    "      var fallbackKey = 'assets/pets/' + stageMatch[1] + '/' + stageMatch[3];\n"
    "      if (window.ELW_PET_ASSETS[fallbackKey]) return window.ELW_PET_ASSETS[fallbackKey];\n"
    "    }\n"
    "    return p;\n"
    "  };\n"
    "  try {\n"
    "    var imgProto = window.HTMLImageElement && window.HTMLImageElement.prototype;\n"
    "    if (imgProto) {\n"
    "      var srcDesc = Object.getOwnPropertyDescriptor(imgProto, 'src');\n"
    "      if (srcDesc && srcDesc.set && srcDesc.get) {\n"
    "        Object.defineProperty(imgProto, 'src', {\n"
    "          configurable: true,\n"
    "          enumerable: true,\n"
    "          get: function(){ return srcDesc.get.call(this); },\n"
    "          set: function(v){ srcDesc.set.call(this, window.resolvePetAsset(v)); }\n"
    "        });\n"
    "      }\n"
    "    }\n"
    "    var elProto = window.Element && window.Element.prototype;\n"
    "    if (elProto && elProto.setAttribute) {\n"
    "      var origSetAttr = elProto.setAttribute;\n"
    "      elProto.setAttribute = function(name, val){\n"
    "        if ((name === 'src' || name === 'href' || name === 'xlink:href') && typeof val === 'string') {\n"
    "          val = window.resolvePetAsset(val);\n"
    "        }\n"
    "        return origSetAttr.call(this, name, val);\n"
    "      };\n"
    "    }\n"
    "    var svgImgProto = window.SVGImageElement && window.SVGImageElement.prototype;\n"
    "    if (svgImgProto && !Object.getOwnPropertyDescriptor(svgImgProto, 'src')) {\n"
    "      Object.defineProperty(svgImgProto, 'src', {\n"
    "        configurable: true,\n"
    "        enumerable: true,\n"
    "        get: function(){ return this.getAttribute('src') || this.getAttribute('href') || ''; },\n"
    "        set: function(v){\n"
    "          var resolved = window.resolvePetAsset(v);\n"
    "          this.setAttribute('src', resolved);\n"
    "          this.setAttribute('href', resolved);\n"
    "        }\n"
    "      });\n"
    "    }\n"
    "  } catch(e) {}\n"
    "})();\n"
    "</script>\n"
)

first_script_injected = False
def inl(m):
    global first_script_injected
    f = os.path.join(root, m.group(1))
    if not os.path.exists(f):
        missing.append(m.group(1)); return ''
    prefix = ''
    if not first_script_injected:
        first_script_injected = True
        prefix = asset_bootstrap
    return prefix + '<script>\n' + open(f, encoding='utf-8').read().replace('</script', '<\\/script') + '\n</script>'

b = re.sub(r'<script src="(modules/[\w-]+\.js)"></script>', inl, s)
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(root), 'english-life-world-ban-day-du.html')
open(out, 'w', encoding='utf-8').write(b)
print(
    'built', out, len(b) // 1024, 'KB; embedded_pet_pngs:', len(pet_assets),
    f'(base={len(pet_assets)-stage_embedded_count}, stage={stage_embedded_count}, stage_kb={stage_embedded_bytes//1024});',
    'missing:', missing
)
