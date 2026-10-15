# STATUS — Task `ef65102fc0c3`: Tích hợp giọng C (`C_neural` — Microsoft Neural TTS)

- **Trạng thái**: **HOÀN TẤT 100% (DONE)**
- **Đã hoàn thành**:
  1. **G1 (`tools/extract_sentences.js` → `docs/tts/sentences.json`)**: Quét và trích xuất toàn bộ **5.489 câu/từ tiếng Anh cố định** trên toàn ứng dụng (`ELW.ACTIONS`, NPC mọi topic & zone, `ELW_CONTEXT`, Cô Mai/nhiệm vụ/thử thách, truyện `STORY`/`ELW_LEVELS`, `vocab-3000` từ + câu ví dụ + khung mẫu câu, `life-talk`, `dialogue`, `roleplay`, `pet`), gắn mã băm chuẩn hoá 16-hex, phân loại câu (`statement`/`yes-no`/`wh`/`exclaim`) và giọng Microsoft Neural (`en-US-AriaNeural`, `en-US-JennyNeural`, `en-US-GuyNeural`, `en-US-AnaNeural`).
  2. **G2..G5 (`tools/gen_audio.py` → `assets/audio/<hash>.mp3`)**: Chạy 4 shard song song (`0/4`..`3/4`), sinh đủ **5.489 / 5.489 file MP3 (độ phủ 100%)**, tổng dung lượng **105,17 MB** (MP3 Mono, 24kHz, 48kbps). Script hỗ trợ retry tự động và bỏ qua file đã có (`skipped`) khi chạy lại.
  3. **G6 (`modules/tts-audio.js` + tích hợp vào `modules/voices-dialogue.js`)**: Phát MP3 qua `HTMLAudioElement`, preload câu kế tiếp khi đọc đoạn văn nhiều câu, không chồng tiếng (`overlapCount = 0`), cầu nối `speechSynthesis.speaking`/`cancel`/`pause`/`resume` để `speechQuiet()` hoạt động nguyên vẹn, hỗ trợ Learning Mode (`playbackRate = 0.85` + `preservesPitch = true`), tự động fallback sang `speechSynthesis` + `ELW_TTS_PLANNER` khi câu động hoặc thiếu file MP3.
  4. **G7 (`tools/build.py` + `docs/TTS_C_INTEGRATION.md`)**: Bản chạy local dùng `assets/audio/`; bản đóng gói 1 file (`python3 tools/build.py` → `english-life-world-ban-day-du.html`, 9.075 KB) không nhúng MP3 và tự động fallback sang giọng trình duyệt. Đã ghi đầy đủ báo cáo và lưu ý pháp lý về `edge-tts` / Azure AI Speech trong `docs/TTS_C_INTEGRATION.md`.
- **Còn lại**: Không còn mục nào tồn đọng (0 pending).
- **Kiểm thử đã chạy**:
  - `python3 tools/build.py` → **PASS** (`9075 KB; embedded_pet_pngs: 100; missing: []`)
  - `node modules/voices.test.mjs` → **PASS** (100% unit + Playwright E2E desktop `1280x800` & mobile `390x844`)
  - `node tools/test_tts_c.mjs` → **PASS** (Độ phủ 100% = 5.489/5.489 MP3, `ffprobe` 10 file ngẫu nhiên `duration > 0.3s`, phát MP3 thật `currentTime > 0`, xoá thử 1 file tự fallback, single-file artifact tự fallback, 0 lỗi JS).
