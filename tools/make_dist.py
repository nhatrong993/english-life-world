"""Tạo thư mục dist/ sạch để deploy lên Cloudflare Pages.
Bao gồm:
- index.html
- modules/*.js (loại trừ *.test.*, *.pw.mjs, *harness*)
- assets/ (toàn bộ thư mục tài nguyên)
"""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"


def should_include_module(path: Path) -> bool:
    if not path.is_file():
        return False
    name = path.name.lower()
    if not name.endswith(".js"):
        return False
    if ".test." in name or name.endswith(".pw.mjs") or "harness" in name:
        return False
    return True


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True, exist_ok=True)

    # 1. Copy index.html
    shutil.copy2(ROOT / "index.html", DIST / "index.html")

    # 2. Copy modules/*.js (trừ *.test.*, *.pw.mjs, *harness*)
    src_modules = ROOT / "modules"
    dst_modules = DIST / "modules"
    dst_modules.mkdir(parents=True, exist_ok=True)
    copied_modules = 0
    if src_modules.is_dir():
        for item in sorted(src_modules.iterdir()):
            if should_include_module(item):
                shutil.copy2(item, dst_modules / item.name)
                copied_modules += 1

    # 3. Copy assets/
    src_assets = ROOT / "assets"
    dst_assets = DIST / "assets"
    if src_assets.is_dir():
        shutil.copytree(src_assets, dst_assets, dirs_exist_ok=True)

    print(f"Created clean dist/ at {DIST} (index.html, {copied_modules} module files, assets/)")


if __name__ == "__main__":
    main()
