# Tích Hợp Giọng Đọc C (`C_neural` — Microsoft Edge Neural TTS)

## 1. Tổng Quan Kiến Trúc (G1–G8)

Người dùng đã nghe thử 3 phương án A/B/C trong `docs/tts/ab/` và chọn **Giọng C (`C_neural` — Microsoft Neural Voices kết hợp `ELW_TTS_PLANNER`)**. Hệ thống đã được tích hợp toàn diện vào **English Life World** theo mô hình kết hợp (Hybrid Neural Audio + Prosody Planner Fallback):

1. **G1 — Trích xuất câu cố định (`tools/extract_sentences.js` → `docs/tts/sentences.json`)**:
   - Quét tự động toàn bộ các câu và từ tiếng Anh cố định trong ứng dụng thông qua headless Chromium:
     - `ELW.ACTIONS` (`action_sentence`: 1.145 câu)
     - Câu đáp NPC mọi chủ đề & phân khu (`npc_reply`: 613 câu, `npcs`: 171 câu)
     - Mẫu câu ngữ cảnh `ELW_CONTEXT` & phản hồi NPC (`context`: 100 câu, `context_reply`: 87 câu)
     - Nhiệm vụ Cô Mai & các NPC (`mission`: 251 câu), Thử thách (`challenge`: 402 câu), Sự kiện (`events`: 122 câu), Nhu cầu (`needs`: 128 câu), Nhật ký ngày (`day`: 39 câu)
     - Hội thoại & Đóng vai (`dialogue`: 64 câu, `roleplay`: 360 câu), Giao tiếp đời sống `ELW_LIFE` (`life_talk`: 616 câu)
     - Thú cưng `ELW_PET_INTERACTION` & `ELW_PET_ADVENTURE` (`pet`: 74 câu)
     - Truyện kể `STORY` & `ELW_LEVELS` (`story`: 117 câu)
     - Kho từ vựng `ELW_VOCAB3000` (`vocab3000_word`: 1.092 từ, `vocab3000_ex`: 10 câu ví dụ mở rộng, `vocab3000_frame`: 98 mẫu câu biến thiên)
   - **Tổng số câu/từ cố định duy nhất (unique normalized hashes)**: **5.489 câu**.
   - **Phân bổ giọng Microsoft Neural theo nhân vật & giới tính**:
     - Nữ trưởng thành / người dẫn chuyện / Mẹ / Cô Mai / Giáo viên (`adult_female`): `en-US-AriaNeural` (**4.296 câu**)
     - Nữ trẻ / Linh / Thu ngân / Bạn học (`young_female`): `en-US-JennyNeural` (**534 câu**)
     - Nam / Bố / Ông / Barista / Đầu bếp / Kiểm lâm / Phục vụ (`adult_male`, `young_male`, `elderly`): `en-US-GuyNeural` (**599 câu**)
     - Trẻ em / Bé Lily / Thú cưng (`child`, `pet`): `en-US-AnaNeural` (**60 câu**)
   - **Phân loại ngữ điệu (`sentenceType` từ `ELW_TTS_PLANNER`)**:
     - Câu trần thuật (`statement`): **3.686 câu** (hạ giọng nhẹ tự nhiên cuối câu)
     - Câu cảm thán (`exclaim`): **1.218 câu** (tăng pitch `+8Hz`, tăng âm lượng `+6%`, giàu năng lượng)
     - Câu hỏi Yes/No (`yes-no`): **472 câu** (lên giọng cuối câu `+10Hz`)
     - Câu hỏi Wh- (`wh`): **113 câu** (xuống giọng cuối câu `-4Hz`)

2. **G2..G5 — Sinh file âm thanh song song (`tools/gen_audio.py` → `assets/audio/<hash>.mp3`)**:
   - Chia `docs/tts/sentences.json` thành 4 phân đoạn (`--shard 0/4`, `1/4`, `2/4`, `3/4`) chạy song song bất đồng bộ (`asyncio.Semaphore`).
   - Định dạng đầu ra: **MP3 Mono, 24kHz, 48kbps** (nhẹ, rõ nét), có cơ chế tự động thử lại (exponential backoff retry) khi lỗi mạng và bỏ qua các file đã tồn tại (`size > 300 bytes`) để có thể chạy tiếp bất cứ lúc nào.
   - **Độ phủ**: **5.489 / 5.489 câu (100,00%)**.
   - **Tổng dung lượng thư mục `assets/audio/`**: **79,19 MB -> 105,17 MB** (trung bình ~14,7 KB / câu).
   - **Chế độ Học chậm (Learning Mode)**: Sử dụng `HTMLAudioElement.playbackRate = 0.85` kết hợp `preservesPitch = true` (giữ nguyên cao độ tự nhiên của giọng Neural mà không làm tăng gấp đôi dung lượng đĩa); đồng thời `tools/gen_audio.py --slow` cũng hỗ trợ sinh file `<hash>_slow.mp3` riêng nếu cần.

3. **G6 — Runtime phát âm thanh (`modules/tts-audio.js` & `modules/voices-dialogue.js`)**:
   - Module `window.ELW_TTS_AUDIO` (`modules/tts-audio.js`, được tích hợp trực tiếp vào `modules/voices-dialogue.js`):
     - Khi gọi `ELW_VOICES.speak(text, profileId, opts)` (hoặc `say(text, rate)`):
       1. Kiểm tra file `assets/audio/<hash>.mp3` theo mã băm chuẩn hoá `hashText(text)`.
       2. Nếu có file MP3: phát qua `HTMLAudioElement`, đảm bảo **không chồng tiếng** (`maxConcurrentAudio = 1`, `overlapCount = 0`), tương thích hoàn toàn với `speechQuiet()`, `speechStop()`, `ELW_VOICES.isSpeaking()`, `ELW_VOICES.cancel()` và callback `onend`.
       3. Đối với **đoạn văn nhiều câu** (như `buildStory()`, `ELW_READING.play()`, hoặc từ kèm câu ví dụ `wEn + ". " + wEx` trong `ELW_VOCAB3000`): tự động tách câu, **preload câu kế tiếp** trong lúc câu hiện tại đang phát, và chèn khoảng nghỉ (`pauseAfterMs`) theo đúng `ELW_TTS_PLANNER`.
       4. Nếu câu động (chứa tên/điểm số thay đổi theo thời gian thực) hoặc file MP3 không tải được: **tự động fallback mượt mà sang `window.speechSynthesis` + `ELW_TTS_PLANNER`** mà không làm đứt chuỗi hành động hay hội thoại.

4. **G7 — Đóng gói (`tools/build.py`)**:
   - **Bản chạy cục bộ (Local App — `index.html`)**: Sử dụng trực tiếp kho âm thanh `assets/audio/<hash>.mp3` (5.489 file MP3, 79,19 MB -> 105,17 MB).
   - **Bản đóng gói 1 file (`python3 tools/build.py` → `english-life-world-ban-day-du.html`, ~9.075 KB)**: **KHÔNG nhúng 5.489 file MP3** vào file HTML để tránh làm phình file lên >100 MB. Khi mở bản 1 file độc lập, `ELW_TTS_AUDIO.canUseExternalAudio()` tự động nhận diện chế độ single-file artifact và chuyển sang giọng trình duyệt (`speechSynthesis` + `ELW_TTS_PLANNER`).

5. **G8 — Kiểm thử QA Playwright & `ffprobe` (`tools/test_tts_c.mjs` & `modules/voices.test.mjs`)**:
   - Độ phủ MP3 câu cố định: **100,00% (5.489 / 5.489 câu)** (vượt yêu cầu ≥95%).
   - Kiểm tra `ffprobe` trên 10 mẫu ngẫu nhiên đa dạng giọng/ngữ điệu: 10/10 file có `duration > 0.3s` (từ `0.86s` đến `4.54s`), khớp độ dài câu, chuẩn `mp3`, `mono`, `48kbps`.
   - Kiểm tra phát MP3 thật trên Chromium (`audio.currentTime > 0`), không chồng tiếng (`overlapCount = 0`), chuỗi câu chuyện phát nối mượt mà, Learning Mode chạy đúng `playbackRate = 0.85`, xoá thử 1 file MP3 tự động fallback sang `speechSynthesis` và gọi `onend` đầy đủ, giao diện Mobile `390px` không tràn ngang (`scrollWidth = 390`), `0` lỗi JS.

---

## 2. Lưu Ý Pháp Lý & Hướng Chuyển Đổi Thương Mại (Legal & Production Notice)

> [!IMPORTANT]
> **Lưu ý về `edge-tts` và định hướng phát hành thương mại (Production / Commercial Release):**
>
> 1. **Về công cụ sinh giọng `edge-tts`**:
>    - Thư viện `edge-tts` sử dụng endpoint WebSocket đọc văn bản trực tuyến của trình duyệt Microsoft Edge (endpoint không chính thức của Microsoft dành cho mục đích phát triển/thử nghiệm).
>    - Khi phát hành thương mại chính thức (Commercial Production), dự án **nên chuyển sang sử dụng API chính thức của Microsoft Azure AI Speech (Azure Cognitive Services Speech SDK / REST API)** với **cùng bộ giọng Neural** (`en-US-AriaNeural`, `en-US-JennyNeural`, `en-US-GuyNeural`, `en-US-AnaNeural`).
> 2. **Cách chuyển sang Azure AI Speech chính thức (chỉ đổi 1 cấu hình)**:
>    - Toàn bộ mã băm (`<hash>.mp3`), danh sách câu (`docs/tts/sentences.json`) và thông số ngữ điệu (`voice`, `rate`, `pitch`, `volume`) đã tương thích chuẩn W3C SSML của Azure AI Speech.
>    - Khi chuyển sang Azure AI Speech chính thức, chỉ cần thay hàm `synth_one` trong `tools/gen_audio.py` gọi endpoint REST của Azure (`https://<region>.tts.speech.microsoft.com/cognitiveservices/v1`) bằng biến môi trường `AZURE_SPEECH_KEY` trên máy build (CI/CD) và chạy lại `python3 tools/gen_audio.py` để tái tạo `assets/audio/<hash>.mp3`.
> 3. **Bảo mật & Quyền riêng tư (Security & Privacy)**:
>    - **Không nhúng bất kỳ khoá API (API Key) nào** vào mã nguồn phía client (`index.html`, `modules/*.js`).
>    - **Không thu thập hay gửi email/dữ liệu cá nhân của người dùng** đi bất kỳ máy chủ bên thứ ba nào. Toàn bộ âm thanh phát cục bộ từ `assets/audio/*.mp3` hoặc trình duyệt của người dùng.
