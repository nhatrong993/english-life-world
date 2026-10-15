#!/usr/bin/env python3
"""
G2..G5 — Parallel Neural Audio Generator (Microsoft Edge Neural TTS — Voice C / C_neural)
Reads docs/tts/sentences.json (with ELW_TTS_PLANNER prosody: rising pitch for Yes/No,
falling pitch for Wh- questions, expressive pitch/volume for exclamations, character voice mapping)
and generates assets/audio/<hash>.mp3 in parallel shards.

Usage:
  python3 tools/gen_audio.py --shard 0/4 --concurrency 28
  python3 tools/gen_audio.py --shard 1/4 --concurrency 28
  python3 tools/gen_audio.py --shard 2/4 --concurrency 28
  python3 tools/gen_audio.py --shard 3/4 --concurrency 28
  python3 tools/gen_audio.py --slow   # optional slow Learning Mode variants (<hash>_slow.mp3)
"""

import argparse
import asyncio
import json
import os
import re
import sys
import time
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
SENTENCES_JSON = ROOT / "docs" / "tts" / "sentences.json"
AUDIO_DIR = ROOT / "assets" / "audio"


def normalize_text(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"<[^>]*>", "", str(s))
    s = s.replace("‿", " ")
    s = re.sub(r"\*[^*]+\*", " ", s)
    s = re.sub(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]", " ", s)
    s = re.sub(r"[\u2018\u2019\u201B\u0060\u00B4]", "'", s)
    s = re.sub(r'[\u201C\u201D\u201E\u201F]', '"', s)
    s = re.sub(r"[\u2013\u2014]", "-", s)
    s = re.sub(r"\s+", " ", s).strip().lower()
    s = re.sub(r"\.+$", "", s).strip()
    return s


def hash_text(s: str) -> str:
    norm = normalize_text(s)
    data = norm.encode("utf-16-le")
    h1 = 0x811C9DC5
    h2 = 0x01000193
    for i in range(0, len(data), 2):
        c = data[i] | (data[i + 1] << 8)
        h1 ^= c
        h1 = (h1 * 0x01000193) & 0xFFFFFFFF
        h2 ^= (c * 31) & 0xFFFF
        h2 = (h2 * 0x85EBCA6B) & 0xFFFFFFFF
    return f"{h1:08x}{h2:08x}"


def slow_rate_str(rate_str: str) -> str:
    try:
        val = int(str(rate_str).replace("%", "").replace("+", "").strip())
    except Exception:
        val = 0
    slow_val = max(-30, val - 15)
    return f"+{slow_val}%" if slow_val >= 0 else f"{slow_val}%"


async def synth_one(
    sem: asyncio.Semaphore,
    item: dict,
    out_dir: Path,
    slow: bool = False,
    retries: int = 4,
) -> str:
    h = item["hash"]
    suffix = "_slow.mp3" if slow else ".mp3"
    out_path = out_dir / f"{h}{suffix}"

    if out_path.exists() and out_path.stat().st_size > 300:
        return "skipped"

    text = str(item.get("text") or "").strip()
    if not text:
        return "empty"

    voice = item.get("voice") or "en-US-AriaNeural"
    rate = slow_rate_str(item.get("rate", "+0%")) if slow else item.get("rate", "+0%")
    pitch = item.get("pitch", "+0Hz")
    volume = item.get("volume", "+0%")

    tmp_path = out_dir / f"{h}{suffix}.tmp.{os.getpid()}"

    async with sem:
        for attempt in range(1, retries + 1):
            try:
                comm = edge_tts.Communicate(
                    text,
                    voice,
                    rate=rate,
                    pitch=pitch,
                    volume=volume,
                )
                await asyncio.wait_for(comm.save(str(tmp_path)), timeout=25.0)
                if tmp_path.exists() and tmp_path.stat().st_size > 300:
                    os.replace(str(tmp_path), str(out_path))
                    return "generated"
                raise RuntimeError("Empty output file from edge-tts")
            except Exception as err:
                try:
                    if tmp_path.exists():
                        tmp_path.unlink()
                except Exception:
                    pass
                if attempt == retries:
                    return f"failed:{err}"
                await asyncio.sleep(0.6 * (1.8 ** (attempt - 1)))
    return "failed"


async def run_batch(args: argparse.Namespace) -> int:
    if not SENTENCES_JSON.exists():
        print(f"ERROR: {SENTENCES_JSON} not found. Run `node tools/extract_sentences.js` first.", file=sys.stderr)
        return 1

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    payload = json.loads(SENTENCES_JSON.read_text(encoding="utf-8"))
    all_items = list(payload.get("sentences", {}).values())

    if args.limit and args.limit > 0:
        all_items = all_items[: args.limit]

    shard_idx = 0
    shard_total = 1
    if args.shard:
        parts = args.shard.split("/")
        shard_idx = int(parts[0])
        shard_total = int(parts[1])
        all_items = [it for idx, it in enumerate(all_items) if idx % shard_total == shard_idx]

    total = len(all_items)
    sem = asyncio.Semaphore(max(1, args.concurrency))
    t0 = time.time()

    print(
        f"[Shard {shard_idx}/{shard_total}] Starting generation for {total} sentences "
        f"(concurrency={args.concurrency}, slow={args.slow})...",
        flush=True,
    )

    generated = 0
    skipped = 0
    failed = 0
    done_count = 0

    tasks = [synth_one(sem, item, AUDIO_DIR, slow=args.slow) for item in all_items]
    for coro in asyncio.as_completed(tasks):
        res = await coro
        done_count += 1
        if res == "generated":
            generated += 1
        elif res == "skipped":
            skipped += 1
        else:
            failed += 1
        if done_count % 100 == 0 or done_count == total:
            elapsed = time.time() - t0
            rate_ips = done_count / max(0.1, elapsed)
            print(
                f"[Shard {shard_idx}/{shard_total}] {done_count}/{total} "
                f"(gen={generated}, skip={skipped}, fail={failed}, {rate_ips:.1f} items/s, {elapsed:.1f}s)",
                flush=True,
            )

    elapsed = time.time() - t0
    print(
        f"[Shard {shard_idx}/{shard_total}] DONE in {elapsed:.1f}s -- "
        f"generated={generated}, skipped={skipped}, failed={failed}",
        flush=True,
    )
    return 0 if failed == 0 else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Voice C (Microsoft Neural) MP3 audio files.")
    parser.add_argument("--shard", type=str, default="", help="Shard index/total, e.g. 0/4, 1/4, 2/4, 3/4")
    parser.add_argument("--concurrency", type=int, default=28, help="Max concurrent edge-tts streams per shard")
    parser.add_argument("--limit", type=int, default=0, help="Optional limit on total sentences before sharding")
    parser.add_argument("--slow", action="store_true", help="Also generate _slow.mp3 for Learning Mode")
    args = parser.parse_args()
    return asyncio.run(run_batch(args))


if __name__ == "__main__":
    raise SystemExit(main())
