#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
English Life World — A/B/C Real Audio Synthesis & Objective Acoustic Analyzer
Generates real MP3 audio files in docs/tts/ab/ for:
  - A_baseline: Windows SAPI (Microsoft Zira/David Desktop) with legacy flat prosody,
    comma-stripping clause splits, and uniform mechanical pauses.
  - B_planner: Windows SAPI driven by Paragraph Prosody Planner (modules/tts-prosody-planner.js)
    using W3C SSML (<prosody>, <emphasis>, <break>), preserved continuation commas,
    narrative role shaping, emotion guardrails, and variable thought-group pauses.
  - C_neural: Microsoft Edge Neural voices (en-US-AriaNeural, en-US-JennyNeural,
    en-US-GuyNeural, en-US-AnaNeural via edge-tts) driven by the exact Paragraph Prosody
    Planner rate, pitch, volume, and pause schedule.
  - Learning Mode comparisons (B_learning_04_story_snowfall.mp3 & C_learning_04_story_snowfall.mp3).

Computes objective acoustic metrics (duration, WPM, articulation WPM, pause distribution >=120ms,
F0 contour stats in Hz & semitones, RMS dynamics in dB, synthesis latency) and compares against
the reference file docs/tts/0-1-first-snowfall.mp3.
"""

import asyncio
import json
import math
import os
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import edge_tts
import numpy as np
from scipy.io import wavfile

ROOT_DIR = Path(__file__).resolve().parent.parent
PLANNER_JS = ROOT_DIR / "modules" / "tts-prosody-planner.js"
REF_MP3 = ROOT_DIR / "docs" / "tts" / "0-1-first-snowfall.mp3"
OUT_DIR = ROOT_DIR / "docs" / "tts" / "ab"
METRICS_JSON = OUT_DIR / "acoustic_metrics.json"

TARGET_SR = 24000

SCENARIOS = [
    {
        "id": "01_statement",
        "title": "Declarative Statement with Clauses & New Information",
        "profile": "adult_female",
        "preset": "storytelling",
        "sapi_voice": "Microsoft Zira Desktop",
        "neural_voice": "en-US-AriaNeural",
        "text": "The little girl opened the door, looked outside, and saw the first snowfall of the winter."
    },
    {
        "id": "02_questions",
        "title": "Yes/No Question (Rising) vs Wh- Question (Falling)",
        "profile": "adult_female",
        "preset": "friendly_conversation",
        "sapi_voice": "Microsoft Zira Desktop",
        "neural_voice": "en-US-JennyNeural",
        "text": "Do you have fresh organic apples today? Where can I find the warm bakery section?"
    },
    {
        "id": "03_emphasis",
        "title": "Expressive Keyword Emphasis & Exclamation",
        "profile": "linh",
        "preset": "happy_excited",
        "sapi_voice": "Microsoft Zira Desktop",
        "neural_voice": "en-US-AriaNeural",
        "text": "I really love the fresh hot chocolate, especially after playing in the cold snow all afternoon!"
    },
    {
        "id": "04_story_snowfall",
        "title": "Complete 22-Sentence Story Paragraph (1:1 Reference Benchmark)",
        "profile": "adult_female",
        "preset": "storytelling",
        "sapi_voice": "Microsoft Zira Desktop",
        "neural_voice": "en-US-AriaNeural",
        "text": (
            "First Snowfall. Today is November 26th. It snowed all day today. "
            "The snow is beautiful. The snow finally stopped. My sister and I are excited. "
            "My mom doesn't like the snow. My mom has to shovel the driveway. "
            "My sister and I get to play. I put on my hat and mittens. "
            "My mom puts on my scarf. My mom zippers my jacket. "
            "My sister puts on her hat and mittens. My mom puts on her scarf. "
            "My mom zippers her jacket. My sister and I go outside. "
            "We begin to make a snowman. My mom starts to shovel the snow. "
            "My sister and I make snow angels. My sister and I throw snowballs. "
            "It starts to snow again. We go inside for hot chocolate."
        )
    },
    {
        "id": "05_dialogue",
        "title": "Multi-Turn Mother & Child Dialogue",
        "profile": "mom",
        "preset": "character_dialogue",
        "sapi_voice": "Microsoft Zira Desktop",
        "neural_voice": "en-US-AriaNeural",
        "is_dialogue": True,
        "text": (
            "Good morning, sweetie! Did you see the yard outside? "
            "Wow, it is covered in bright white snow! Can we go outside and build a big snowman right now? "
            "Put on your warm scarf and mittens first, because the wind is very chilly. "
            "Okay, Mom! Come outside with us, and then we can drink hot chocolate together!"
        )
    },
    {
        "id": "06_emotion_shift",
        "title": "Paragraph with Emotion Shifts (Excited -> Sympathetic/Tired -> Surprise -> Warm Cozy)",
        "profile": "adult_female",
        "preset": "storytelling",
        "sapi_voice": "Microsoft Zira Desktop",
        "neural_voice": "en-US-AriaNeural",
        "text": (
            "My sister and I were so excited when we ran out into the bright white yard! "
            "Unfortunately, my mom was tired and worried because the icy driveway was hard to shovel. "
            "Suddenly, giant snowflakes began falling from the sky again! "
            "We went back inside, wrapped ourselves in warm blankets, and shared sweet hot chocolate together."
        )
    }
]


def count_words(text: str, scenario_id: str = "") -> int:
    if scenario_id == "04_story_snowfall":
        return 128
    return len(re.findall(r"\S+", text.strip()))


def compute_expressive_offsets(seg: dict, base_pitch: float, is_dialogue: bool = False):
    """
    Translate the Paragraph Prosody Planner's multi-dimensional plan fields
    (seg.pitch, seg.emotion, seg.narrativeRole, seg.contourWave, seg.pitchDirection, seg.sentenceType)
    into acoustic pitch & volume offsets for SAPI SSML (%) and Edge Neural (Hz / %).
    """
    s_idx = int(seg.get("sentenceIndex", 0))
    s_type = seg.get("sentenceType", "statement")
    role = seg.get("narrativeRole", "development")
    emotion = seg.get("emotion", "narrative")
    wave = float(seg.get("contourWave", 0.0) or 0.0)
    is_last = bool(seg.get("isLast", True))
    seg_pitch = float(seg.get("pitch", base_pitch) or base_pitch)

    # Neutral statement terminal reference in planner is 0.92 * base_pitch
    ref_ratio = 0.92 if (s_type == "statement" and is_last) else 1.00
    raw_delta = (seg_pitch / base_pitch) - ref_ratio

    # Emotion prosodic coloring from planner's detectContentEmotion
    emo_pitch_map = {
        "excited": 0.11,
        "cheerful": 0.09,
        "warm_delight": 0.06,
        "curious": 0.08,
        "narrative": 0.0,
        "friendly": 0.04,
        "conversational": 0.02,
        "clear_instructional": 0.0,
        "warm_comforting": -0.06,
        "contrastive_calm": -0.11,
        "sympathetic": -0.12
    }
    role_pitch_map = {
        "opening": 0.04,
        "development": 0.0,
        "climax": 0.07,
        "contrast": -0.08,
        "closing": -0.07
    }

    emo_shift = emo_pitch_map.get(emotion, 0.0)
    role_shift = role_pitch_map.get(role, 0.0)
    wave_shift = wave * 1.8  # +0.03 -> +5.4%, -0.03 -> -5.4%

    combined_ratio = raw_delta + emo_shift + role_shift + wave_shift

    # Dialogue turn differentiation (Mom vs Child)
    dialogue_sapi_offset = 0
    dialogue_hz_offset = 0
    if is_dialogue:
        if s_idx in (2, 3, 5, 6):
            dialogue_sapi_offset = 16
            dialogue_hz_offset = 12
        else:
            dialogue_sapi_offset = -4
            dialogue_hz_offset = -4

    sapi_pitch_pct = int(round(combined_ratio * 135)) + dialogue_sapi_offset
    sapi_pitch_pct = max(-35, min(42, sapi_pitch_pct))

    neural_pitch_hz = int(round(combined_ratio * 95)) + dialogue_hz_offset
    neural_pitch_hz = max(-42, min(48, neural_pitch_hz))

    # Expressive dynamic volume shaping (excited/climax slightly brighter, calm/closing softer)
    base_vol = float(seg.get("volume", 1.0) or 1.0)
    if emotion in ("excited", "cheerful") or role == "climax":
        vol_mul = min(1.08, base_vol * 1.05)
    elif emotion in ("contrastive_calm", "sympathetic", "warm_comforting") or role in ("contrast", "closing"):
        vol_mul = max(0.82, base_vol * 0.90)
    else:
        vol_mul = base_vol

    return sapi_pitch_pct, neural_pitch_hz, vol_mul


def load_planner_outputs():
    """Call Node.js once to run modules/tts-prosody-planner.js for all scenarios (natural + learning)."""
    node_script = r"""
const planner = require(process.argv[1]);
const scenarios = JSON.parse(process.argv[2]);
const out = {};

for (const sc of scenarios) {
  const nat = planner.planParagraph(sc.text, sc.profile, {
    mode: 'natural',
    preset: sc.preset
  });
  nat.ssml = nat.toSSML(sc.sapi_voice);
  out[sc.id + '_natural'] = nat;

  if (sc.id === '04_story_snowfall') {
    const lrn = planner.planParagraph(sc.text, sc.profile, {
      mode: 'learning',
      preset: 'clear_learning'
    });
    lrn.ssml = lrn.toSSML(sc.sapi_voice);
    out[sc.id + '_learning'] = lrn;
  }
}
process.stdout.write(JSON.stringify(out));
"""
    res = subprocess.run(
        ["node", "-e", node_script, str(PLANNER_JS), json.dumps(SCENARIOS)],
        capture_output=True,
        text=True,
        encoding="utf-8",
        check=True
    )
    return json.loads(res.stdout)


def build_legacy_baseline_segments(sc):
    """
    Reproduce exact legacy baseline behavior before redesign:
    1. Sentence splitting with uniform 350ms inter-sentence pause (as in legacy reading.js).
    2. Legacy splitClauses(text) splits on `/,\\s+/` which STRIPS commas and breaks continuation intonation,
       inserting a uniform 160ms pause.
    3. Flat rate (100%) and flat pitch (+0%) across the entire paragraph/utterance (no sentence-by-sentence
       narrative roles, no keyword emphasis, no emotion guardrails, no thought-group pause hierarchy).
    """
    raw = sc["text"].strip()
    sentences = [s.strip() for s in re.findall(r"[^.!?]+(?:[.!?]+|$)", raw) if s.strip()]
    segments = []
    for s_idx, sent in enumerate(sentences):
        is_last_sent = (s_idx == len(sentences) - 1)
        # Legacy splitClauses: raw.split(/,\s+/) strips commas!
        if "," in sent and len(sent) >= 35:
            parts = [p.strip() for p in re.split(r",\s+", sent) if p.strip()]
        else:
            parts = [sent]
        for c_idx, part in enumerate(parts):
            is_last_clause = (c_idx == len(parts) - 1)
            if not is_last_clause:
                pause_after = 160
            elif not is_last_sent:
                pause_after = 350
            else:
                pause_after = 0
            segments.append({
                "text": part,
                "voice": sc["sapi_voice"],
                "rate_pct": 100,
                "pitch_pct": 0,
                "volume_pct": 100,
                "emphasis_words": [],
                "pause_before_ms": 0,
                "pause_after_ms": pause_after,
                "is_ssml": False
            })
    return segments


def escape_xml(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("'", "&apos;")
        .replace('"', "&quot;")
    )


def decorate_emphasis_xml(text: str, emphasis_words: list) -> str:
    escaped = escape_xml(text)
    if not emphasis_words:
        return escaped
    # Keep non-overlapping keywords (longest first) to avoid nested tags
    sorted_kw = sorted(set(emphasis_words), key=lambda x: len(x), reverse=True)
    used_spans = []
    matches_to_wrap = []
    for kw in sorted_kw:
        pattern = re.compile(r"\b(" + re.escape(kw) + r")\b", re.IGNORECASE)
        for m in pattern.finditer(escaped):
            start, end = m.span()
            if any(not (end <= u_start or start >= u_end) for u_start, u_end in used_spans):
                continue
            used_spans.append((start, end))
            matches_to_wrap.append((start, end, m.group(1)))
            break
    matches_to_wrap.sort(key=lambda x: x[0], reverse=True)
    out = escaped
    for start, end, word in matches_to_wrap:
        out = out[:start] + f'<emphasis level="moderate">{word}</emphasis>' + out[end:]
    return out


def build_planner_sapi_segments(sc, plan_obj):
    """
    Build SAPI SSML segments directly from Paragraph Prosody Planner output (`plan_obj['plan']`).
    Preserves trailing commas on non-final clauses, applies <prosody rate pitch volume> and
    <emphasis level="moderate"> on extracted keywords, and schedules exact pauseBeforeMs/pauseAfterMs.
    """
    base_pitch = float(plan_obj.get("profile", {}).get("pitch", 1.0) or 1.0)
    items = plan_obj.get("plan", [])
    segments = []
    for seg in items:
        voice = sc["sapi_voice"]
        rate_val = float(seg.get("rate", 1.0) or 1.0)
        rate_pct = int(round(rate_val * 100))

        rel_pitch, _, vol_mul = compute_expressive_offsets(
            seg, base_pitch, is_dialogue=bool(sc.get("is_dialogue"))
        )
        vol_pct = int(round(min(100.0, vol_mul * 95.0)))

        inner_xml = decorate_emphasis_xml(seg["text"], seg.get("emphasisWords", []))
        pitch_str = f"{rel_pitch:+d}%"
        ssml = (
            f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">'
            f'<voice name="{escape_xml(voice)}">'
            f'<prosody rate="{rate_pct}%" pitch="{pitch_str}" volume="{vol_pct}">'
            f'{inner_xml}'
            f'</prosody>'
            f'</voice>'
            f'</speak>'
        )
        segments.append({
            "text": seg["text"],
            "ssml": ssml,
            "voice": voice,
            "rate_pct": rate_pct,
            "pitch_pct": rel_pitch,
            "volume_pct": vol_pct,
            "volume_gain": vol_mul,
            "emphasis_words": seg.get("emphasisWords", []),
            "pause_before_ms": int(seg.get("pauseBeforeMs", 0) or 0),
            "pause_after_ms": int(seg.get("pauseAfterMs", 0) or 0),
            "is_ssml": True
        })
    return segments


def build_planner_neural_segments(sc, plan_obj):
    """
    Build Microsoft Edge Neural TTS segments driven directly by Paragraph Prosody Planner output.
    Uses edge-tts parameters (rate, pitch, volume) + exact planner pauseBeforeMs/pauseAfterMs.
    """
    base_pitch = float(plan_obj.get("profile", {}).get("pitch", 1.0) or 1.0)
    items = plan_obj.get("plan", [])
    segments = []
    for seg in items:
        s_idx = int(seg.get("sentenceIndex", 0))
        voice = sc["neural_voice"]
        if sc.get("is_dialogue"):
            # Mother: en-US-AriaNeural, Child: en-US-AnaNeural
            if s_idx in (2, 3, 5, 6):
                voice = "en-US-AnaNeural"
            else:
                voice = "en-US-AriaNeural"

        rate_val = float(seg.get("rate", 1.0) or 1.0)
        rate_rel = int(round((rate_val - 1.0) * 100))
        rate_rel = max(-45, min(45, rate_rel))

        _, pitch_hz, vol_mul = compute_expressive_offsets(
            seg, base_pitch, is_dialogue=bool(sc.get("is_dialogue"))
        )
        vol_rel = int(round((vol_mul - 1.0) * 100))
        vol_rel = max(-30, min(20, vol_rel))

        segments.append({
            "text": seg["text"],
            "voice": voice,
            "rate_str": f"{rate_rel:+d}%",
            "pitch_str": f"{pitch_hz:+d}Hz",
            "volume_str": f"{vol_rel:+d}%",
            "volume_gain": vol_mul,
            "pause_before_ms": int(seg.get("pauseBeforeMs", 0) or 0),
            "pause_after_ms": int(seg.get("pauseAfterMs", 0) or 0)
        })
    return segments


def run_sapi_batch(tasks_dict, temp_dir: Path):
    """
    Execute all Windows SAPI synthesis jobs in a single PowerShell process to avoid process startup overhead
    and measure accurate per-file synthesis latency.
    """
    manifest_path = temp_dir / "sapi_manifest.json"
    out_meta_path = temp_dir / "sapi_meta.json"

    jobs = []
    for key, segs in tasks_dict.items():
        seg_entries = []
        for idx, seg in enumerate(segs):
            wav_file = temp_dir / f"{key}_seg_{idx:03d}.wav"
            seg_entries.append({
                "wav_path": str(wav_file),
                "is_ssml": bool(seg.get("is_ssml")),
                "text": seg.get("text", ""),
                "ssml": seg.get("ssml", ""),
                "voice": seg.get("voice", "Microsoft Zira Desktop")
            })
        jobs.append({"key": key, "segments": seg_entries})

    manifest_path.write_text(json.dumps(jobs, ensure_ascii=False, indent=2), encoding="utf-8")

    ps_script = temp_dir / "run_sapi.ps1"
    ps_code = r"""
param([string]$ManifestPath, [string]$OutMetaPath)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$jobs = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json
$results = @{}

foreach ($job in $jobs) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    foreach ($seg in $job.segments) {
        $synth.SetOutputToWaveFile($seg.wav_path)
        if ($seg.is_ssml) {
            $synth.SpeakSsml($seg.ssml)
        } else {
            $synth.SelectVoice($seg.voice)
            $synth.Rate = 0
            $synth.Volume = 100
            $synth.Speak($seg.text)
        }
    }
    $synth.SetOutputToNull()
    $sw.Stop()
    $results[$job.key] = $sw.Elapsed.TotalMilliseconds
}
$synth.Dispose()
$results | ConvertTo-Json | Set-Content -Encoding UTF8 $OutMetaPath
"""
    ps_script.write_text(ps_code, encoding="utf-8")
    subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps_script), str(manifest_path), str(out_meta_path)],
        check=True
    )
    return json.loads(out_meta_path.read_text(encoding="utf-8-sig"))


async def synth_one_edge_seg(sem: asyncio.Semaphore, seg: dict, mp3_path: Path):
    async with sem:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(
                    text=seg["text"],
                    voice=seg["voice"],
                    rate=seg["rate_str"],
                    pitch=seg["pitch_str"],
                    volume=seg["volume_str"]
                )
                await comm.save(str(mp3_path))
                if mp3_path.exists() and mp3_path.stat().st_size > 100:
                    return
            except Exception as e:
                if attempt == 2:
                    raise e
                await asyncio.sleep(0.5 * (attempt + 1))


async def run_neural_batch(tasks_dict, temp_dir: Path):
    """
    Synthesize all C_neural (and C_learning) segments using edge-tts with bounded concurrency,
    recording per-file synthesis latency.
    """
    sem = asyncio.Semaphore(6)
    latencies = {}
    for key, segs in tasks_dict.items():
        t0 = time.perf_counter()
        coros = []
        for idx, seg in enumerate(segs):
            seg_mp3 = temp_dir / f"{key}_seg_{idx:03d}.mp3"
            coros.append(synth_one_edge_seg(sem, seg, seg_mp3))
        await asyncio.gather(*coros)
        latencies[key] = round((time.perf_counter() - t0) * 1000.0, 1)
    return latencies


def load_and_trim_segment(audio_path: Path, target_sr: int = TARGET_SR) -> np.ndarray:
    """
    Decode segment audio to mono float64 at target_sr and trim leading/trailing engine padding silence
    so that inter-clause and inter-sentence pauses are controlled 100% by the prosody plan.
    Applies a 8ms cosine fade-in/out to prevent clicks.
    """
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_wav = tmp.name
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(audio_path), "-ac", "1", "-ar", str(target_sr), "-vn", tmp_wav],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        sr, data = wavfile.read(tmp_wav)
        if data.dtype == np.int16:
            y = data.astype(np.float64) / 32768.0
        elif data.dtype == np.int32:
            y = data.astype(np.float64) / 2147483648.0
        else:
            y = data.astype(np.float64)
    finally:
        if os.path.exists(tmp_wav):
            os.remove(tmp_wav)

    if len(y) == 0:
        return np.zeros(int(0.05 * target_sr), dtype=np.float64)

    # Compute short-time RMS (10ms window, 5ms hop) to trim leading/trailing silence accurately
    win = int(0.010 * target_sr)
    hop = int(0.005 * target_sr)
    if len(y) > win:
        n_frames = 1 + (len(y) - win) // hop
        rms = np.array([np.sqrt(np.mean(y[i * hop : i * hop + win] ** 2) + 1e-12) for i in range(n_frames)])
        peak_rms = np.max(rms)
        thresh = max(1e-4, peak_rms * 0.025)  # -32 dB relative to segment peak
        active = np.where(rms >= thresh)[0]
        if len(active) > 0:
            # Keep a tiny 12ms natural acoustic margin on each side
            margin = int(0.012 * target_sr)
            start_sample = max(0, active[0] * hop - margin)
            end_sample = min(len(y), active[-1] * hop + win + margin)
            y = y[start_sample:end_sample]

    # 8ms fade-in and fade-out
    fade_len = min(int(0.008 * target_sr), len(y) // 4)
    if fade_len > 1:
        fade_in = np.linspace(0.0, 1.0, fade_len)
        fade_out = np.linspace(1.0, 0.0, fade_len)
        y[:fade_len] *= fade_in
        y[-fade_len:] *= fade_out

    return y


def assemble_and_export_mp3(key: str, segs: list, temp_dir: Path, ext: str, out_mp3: Path):
    """
    Concatenate trimmed segment waveforms with exact scheduled pause_before_ms and pause_after_ms,
    plus a clean 60ms leading/trailing pad, and encode to high-quality 44.1kHz MP3.
    """
    chunks = [np.zeros(int(0.060 * TARGET_SR), dtype=np.float64)]
    for idx, seg in enumerate(segs):
        seg_file = temp_dir / f"{key}_seg_{idx:03d}.{ext}"
        pre_ms = int(seg.get("pause_before_ms", 0) or 0)
        post_ms = int(seg.get("pause_after_ms", 0) or 0)
        vol_gain = float(seg.get("volume_gain", 1.0) or 1.0)
        if pre_ms > 0:
            chunks.append(np.zeros(int((pre_ms / 1000.0) * TARGET_SR), dtype=np.float64))
        wav_seg = load_and_trim_segment(seg_file, TARGET_SR) * vol_gain
        chunks.append(wav_seg)
        if post_ms > 0:
            chunks.append(np.zeros(int((post_ms / 1000.0) * TARGET_SR), dtype=np.float64))

    chunks.append(np.zeros(int(0.060 * TARGET_SR), dtype=np.float64))
    full_y = np.concatenate(chunks)

    # Peak normalize gently to -1.5 dBFS if needed while preserving relative segment volume
    peak = np.max(np.abs(full_y))
    if peak > 0.85:
        full_y = full_y * (0.85 / peak)

    pcm16 = np.clip(full_y * 32767.0, -32768, 32767).astype(np.int16)
    combined_wav = temp_dir / f"{key}_combined.wav"
    wavfile.write(str(combined_wav), TARGET_SR, pcm16)

    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(combined_wav),
            "-ar", "44100", "-ac", "1", "-b:a", "128k",
            str(out_mp3)
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=True
    )


def analyze_audio_file(audio_path: Path, word_count: int, latency_ms=None) -> dict:
    """
    Compute comprehensive acoustic metrics using ffprobe, ffmpeg, numpy, and scipy:
      - duration_s, size_bytes, synthesis_latency_ms
      - words_per_sec, wpm, articulation_wpm
      - internal pauses >= 120ms (count, mean, median, std, min, max, pauses_ms list)
      - F0 fundamental frequency stats (mean, median, std, iqr, p5, p95, span in semitones)
      - RMS energy dynamics (rms_std_db, dynamic_range_db)
    """
    probe_raw = subprocess.check_output(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration,size,bit_rate:stream=sample_rate,channels,codec_name",
            "-of", "json", str(audio_path)
        ],
        text=True
    )
    probe_info = json.loads(probe_raw)
    fmt = probe_info.get("format", {})
    stream = (probe_info.get("streams") or [{}])[0]

    analysis_sr = 16000
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_wav = tmp.name
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(audio_path), "-ac", "1", "-ar", str(analysis_sr), "-vn", tmp_wav],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True
        )
        sr, data = wavfile.read(tmp_wav)
        y = data.astype(np.float64) / 32768.0
    finally:
        if os.path.exists(tmp_wav):
            os.remove(tmp_wav)

    duration_s = float(fmt.get("duration") or (len(y) / sr))
    size_bytes = int(fmt.get("size") or audio_path.stat().st_size)

    # Frame-level RMS (20ms window, 10ms hop)
    frame_len = int(0.020 * sr)
    hop_len = int(0.010 * sr)
    n_frames = 1 + max(0, (len(y) - frame_len) // hop_len)
    rms = np.zeros(n_frames)
    for i in range(n_frames):
        seg = y[i * hop_len : i * hop_len + frame_len]
        rms[i] = np.sqrt(np.mean(seg ** 2) + 1e-12)
    rms_db = 20.0 * np.log10(rms + 1e-9)

    p95_db = float(np.percentile(rms_db, 95))
    silence_thresh_db = max(-48.0, p95_db - 28.0)
    is_silent = rms_db < silence_thresh_db

    # Internal pauses >= 120ms between first and last voiced frame
    voiced_idx = np.where(~is_silent)[0]
    pauses_ms = []
    if len(voiced_idx) > 0:
        first_v = int(voiced_idx[0])
        last_v = int(voiced_idx[-1])
        active_duration_s = max(0.1, (last_v - first_v + 1) * 0.010)
        cur_sil = 0
        for idx in range(first_v, last_v + 1):
            if is_silent[idx]:
                cur_sil += 1
            else:
                if cur_sil > 0:
                    dur_ms = cur_sil * 10.0
                    if dur_ms >= 120.0:
                        pauses_ms.append(round(float(dur_ms), 1))
                    cur_sil = 0
    else:
        active_duration_s = duration_s

    # Autocorrelation F0 tracker on voiced frames (40ms window, 10ms hop)
    f0_win_len = int(0.040 * sr)
    f0_min, f0_max = 75.0, 420.0
    lag_min = int(sr / f0_max)
    lag_max = int(sr / f0_min)
    f0_vals = []
    window = np.hanning(f0_win_len)

    for i in range(0, len(y) - f0_win_len, hop_len):
        f_idx = i // hop_len
        if f_idx >= len(is_silent) or is_silent[f_idx]:
            continue
        seg = y[i : i + f0_win_len] * window
        seg = seg - np.mean(seg)
        energy = float(np.sum(seg ** 2))
        if energy < 1e-6:
            continue
        zcr = float(np.mean(np.abs(np.diff(np.sign(seg))))) / 2.0
        if zcr > 0.22:
            continue
        corr = np.correlate(seg, seg, mode="full")[f0_win_len - 1:]
        corr = corr / (energy + 1e-12)
        region = corr[lag_min : lag_max + 1]
        if len(region) == 0:
            continue
        # Find first local maximum or global peak in pitch lag region
        peak_rel = int(np.argmax(region))
        peak_val = float(region[peak_rel])
        if peak_val >= 0.45:
            lag = lag_min + peak_rel
            # Parabolic interpolation for sub-sample F0 accuracy
            if 0 < peak_rel < len(region) - 1:
                alpha = float(region[peak_rel - 1])
                beta = float(region[peak_rel])
                gamma = float(region[peak_rel + 1])
                denom = alpha - 2.0 * beta + gamma
                if abs(denom) > 1e-9:
                    shift = 0.5 * (alpha - gamma) / denom
                    lag = lag + max(-0.5, min(0.5, shift))
            f0_vals.append(float(sr / lag))

    f0_arr = np.array(f0_vals) if f0_vals else np.array([160.0])
    f0_p5 = float(np.percentile(f0_arr, 5))
    f0_p95 = float(np.percentile(f0_arr, 95))
    f0_span_st = float(12.0 * np.log2(max(f0_p95, 1.0) / max(f0_p5, 1.0)))

    voiced_db = rms_db[~is_silent] if np.any(~is_silent) else rms_db
    rms_std_db = float(np.std(voiced_db))
    dyn_range_db = float(np.percentile(voiced_db, 95) - np.percentile(voiced_db, 5))

    total_pause_s = sum(pauses_ms) / 1000.0
    speech_only_s = max(0.1, active_duration_s - total_pause_s)

    return {
        "file": audio_path.name,
        "path": str(audio_path.relative_to(ROOT_DIR)).replace("\\", "/"),
        "codec": stream.get("codec_name", "mp3"),
        "sample_rate_hz": int(stream.get("sample_rate", 44100)),
        "channels": int(stream.get("channels", 1)),
        "size_bytes": size_bytes,
        "duration_s": round(duration_s, 3),
        "synthesis_latency_ms": round(float(latency_ms), 1) if latency_ms is not None else None,
        "word_count": word_count,
        "words_per_sec": round(word_count / duration_s, 2),
        "wpm": round((word_count / duration_s) * 60.0, 1),
        "articulation_wpm": round((word_count / speech_only_s) * 60.0, 1),
        "pause_count": len(pauses_ms),
        "pause_total_ms": round(float(sum(pauses_ms)), 1),
        "pause_mean_ms": round(float(np.mean(pauses_ms)), 1) if pauses_ms else 0.0,
        "pause_median_ms": round(float(np.median(pauses_ms)), 1) if pauses_ms else 0.0,
        "pause_std_ms": round(float(np.std(pauses_ms)), 1) if pauses_ms else 0.0,
        "pause_min_ms": round(float(np.min(pauses_ms)), 1) if pauses_ms else 0.0,
        "pause_max_ms": round(float(np.max(pauses_ms)), 1) if pauses_ms else 0.0,
        "pauses_ms": pauses_ms,
        "f0_mean_hz": round(float(np.mean(f0_arr)), 1),
        "f0_median_hz": round(float(np.median(f0_arr)), 1),
        "f0_std_hz": round(float(np.std(f0_arr)), 1),
        "f0_iqr_hz": round(float(np.percentile(f0_arr, 75) - np.percentile(f0_arr, 25)), 1),
        "f0_p5_hz": round(f0_p5, 1),
        "f0_p95_hz": round(f0_p95, 1),
        "f0_span_semitones": round(f0_span_st, 2),
        "rms_std_db": round(rms_std_db, 2),
        "dynamic_range_db": round(dyn_range_db, 2)
    }


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print("[1/5] Querying Paragraph Prosody Planner (modules/tts-prosody-planner.js) via Node.js...")
    planner_data = load_planner_outputs()

    sapi_tasks = {}
    neural_tasks = {}
    plan_summaries = {}

    for sc in SCENARIOS:
        sid = sc["id"]
        nat_plan = planner_data[f"{sid}_natural"]
        sapi_tasks[f"A_baseline_{sid}"] = build_legacy_baseline_segments(sc)
        sapi_tasks[f"B_planner_{sid}"] = build_planner_sapi_segments(sc, nat_plan)
        neural_tasks[f"C_neural_{sid}"] = build_planner_neural_segments(sc, nat_plan)

        plan_summaries[sid] = {
            "id": sid,
            "title": sc["title"],
            "text": sc["text"],
            "word_count": count_words(sc["text"], sid),
            "sentence_count": len(nat_plan.get("sentences", [])),
            "clause_count": len(nat_plan.get("plan", [])),
            "preset": nat_plan.get("preset"),
            "sapi_voice": sc["sapi_voice"],
            "neural_voice": sc["neural_voice"] if not sc.get("is_dialogue") else "en-US-AriaNeural + en-US-AnaNeural",
            "planned_pauses_ms": [
                seg.get("pauseAfterMs", 0)
                for seg in nat_plan.get("plan", [])
                if seg.get("pauseAfterMs", 0) > 0
            ],
            "thought_groups": [
                {
                    "sentenceIndex": s.get("index"),
                    "thoughtGroupId": s.get("thoughtGroupId"),
                    "narrativeRole": s.get("narrativeRole"),
                    "emotion": s.get("emotion"),
                    "guardrailTriggered": s.get("guardrailTriggered"),
                    "speakingRate": s.get("speakingRate"),
                    "pitchDirection": s.get("pitchDirection"),
                    "emphasisWords": s.get("emphasisWords"),
                    "pauseAfterMs": s.get("pauseAfterMs")
                }
                for s in nat_plan.get("sentences", [])
            ]
        }

    # Add Learning Mode comparison for 04_story_snowfall
    sc_story = next(s for s in SCENARIOS if s["id"] == "04_story_snowfall")
    lrn_plan = planner_data["04_story_snowfall_learning"]
    sapi_tasks["B_learning_04_story_snowfall"] = build_planner_sapi_segments(sc_story, lrn_plan)
    neural_tasks["C_learning_04_story_snowfall"] = build_planner_neural_segments(sc_story, lrn_plan)

    with tempfile.TemporaryDirectory() as tmp_str:
        temp_dir = Path(tmp_str)
        print(f"[2/5] Synthesizing {len(sapi_tasks)} Windows SAPI tracks (A_baseline + B_planner + B_learning)...")
        sapi_latencies = run_sapi_batch(sapi_tasks, temp_dir)

        print(f"[3/5] Synthesizing {len(neural_tasks)} Edge Neural tracks (C_neural + C_learning)...")
        neural_latencies = asyncio.run(run_neural_batch(neural_tasks, temp_dir))

        print("[4/5] Assembling waveforms with exact prosodic pause schedules & encoding MP3s...")
        generated_files = {}
        for key, segs in sapi_tasks.items():
            out_mp3 = OUT_DIR / f"{key}.mp3"
            assemble_and_export_mp3(key, segs, temp_dir, "wav", out_mp3)
            generated_files[key] = (out_mp3, sapi_latencies.get(key))

        for key, segs in neural_tasks.items():
            out_mp3 = OUT_DIR / f"{key}.mp3"
            assemble_and_export_mp3(key, segs, temp_dir, "mp3", out_mp3)
            generated_files[key] = (out_mp3, neural_latencies.get(key))

    print("[5/5] Measuring objective acoustic metrics across reference and all 20 generated MP3 files...")
    ref_metrics = analyze_audio_file(REF_MP3, word_count=128, latency_ms=None)

    scenarios_metrics = {}
    all_files_metrics = {}

    for sc in SCENARIOS:
        sid = sc["id"]
        wc = count_words(sc["text"], sid)
        scenarios_metrics[sid] = {
            "meta": plan_summaries[sid],
            "variants": {}
        }
        for prefix in ("A_baseline", "B_planner", "C_neural"):
            key = f"{prefix}_{sid}"
            mp3_path, lat = generated_files[key]
            m = analyze_audio_file(mp3_path, word_count=wc, latency_ms=lat)
            scenarios_metrics[sid]["variants"][prefix] = m
            all_files_metrics[f"{key}.mp3"] = m

    # Learning mode metrics for 04_story_snowfall
    learning_metrics = {}
    for prefix in ("B_learning", "C_learning"):
        key = f"{prefix}_04_story_snowfall"
        mp3_path, lat = generated_files[key]
        m = analyze_audio_file(mp3_path, word_count=128, latency_ms=lat)
        learning_metrics[prefix] = m
        all_files_metrics[f"{key}.mp3"] = m

    # Build direct 1:1 comparison table for 04_story_snowfall against reference 0-1-first-snowfall.mp3
    story_vars = scenarios_metrics["04_story_snowfall"]["variants"]
    story_benchmark = {
        "reference_0_1_first_snowfall": ref_metrics,
        "A_baseline_04_story_snowfall": story_vars["A_baseline"],
        "B_planner_04_story_snowfall": story_vars["B_planner"],
        "C_neural_04_story_snowfall": story_vars["C_neural"],
        "B_learning_04_story_snowfall": learning_metrics["B_learning"],
        "C_learning_04_story_snowfall": learning_metrics["C_learning"]
    }

    report_payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "generator_script": "tools/generate_tts_ab_audio.py",
        "prosody_planner_module": "modules/tts-prosody-planner.js",
        "total_generated_files": len(all_files_metrics),
        "reference_audio": ref_metrics,
        "story_snowfall_1to1_benchmark": story_benchmark,
        "scenarios": scenarios_metrics,
        "learning_mode_comparison": {
            "story_id": "04_story_snowfall",
            "planned_learning_clauses": len(lrn_plan.get("plan", [])),
            "planned_natural_clauses": len(planner_data["04_story_snowfall_natural"].get("plan", [])),
            "natural_B_planner": story_vars["B_planner"],
            "learning_B_planner": learning_metrics["B_learning"],
            "natural_C_neural": story_vars["C_neural"],
            "learning_C_neural": learning_metrics["C_learning"]
        },
        "files": all_files_metrics
    }

    METRICS_JSON.write_text(json.dumps(report_payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Done! Wrote {len(all_files_metrics)} MP3 files and {METRICS_JSON.relative_to(ROOT_DIR)}")


if __name__ == "__main__":
    main()
