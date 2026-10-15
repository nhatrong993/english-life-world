# BÁO CÁO KIỂM TOÁN CHUYÊN SÂU: PIPELINE TTS & ĐỘ DIỄN CẢM (TTS EXPRESSIVENESS AUDIT)

> **Dự án**: English Life World (`D:\tools\Hoc tieng anh\english-life-world`)  
> **Đối tượng kiểm toán**: Toàn bộ kiến trúc Text-to-Speech (TTS), bộ điều phối đọc đoạn văn (`ELW_READING`), bộ phân tích ngữ điệu & hội thoại (`ELW_VOICES`, `ELW_DIALOGUE`), và đối chuẩn thực nghiệm với file âm thanh mẫu `docs/tts/0-1-first-snowfall.mp3`.  
> **Tham chiếu đặc tả**: Mục 2 & Mục 9 của `docs/tts/TTS_MASTER_PROMPT.md`.

---

## Phần 1: Phân tích thực nghiệm file mẫu `docs/tts/0-1-first-snowfall.mp3`

Để có cơ sở định lượng và định tính khách quan trước khi đánh giá pipeline TTS hiện tại, file mẫu `docs/tts/0-1-first-snowfall.mp3` đã được **phân tích trực tiếp** bằng chuỗi công cụ kỹ thuật số:
- **`ffprobe` & `ffmpeg`**: Trích xuất metadata container/codec và giải mã sang luồng PCM 16kHz mono chuẩn hóa.
- **`numpy` & `scipy`**: Phân tích năng lượng RMS (Root Mean Square energy silence detection với ngưỡng phát hiện khoảng nghỉ `>= 120ms`) và theo dõi tần số cơ bản **F0 (Fundamental Frequency)** bằng thuật toán tự tương quan (autocorrelation F0 tracking) trên toàn bộ vùng thoại.
- **Nghe kiểm chứng trực tiếp (Critical Listening)**: Đánh giá cảm nhận thực tế về âm sắc, trọng âm từ (lexical/nuclear stress), đường cong ngữ điệu nội câu (intra-sentence intonation contour) và sự liên kết diễn cảm liên câu (inter-sentence prosodic cohesion).

### 1.1. Thông số kỹ thuật file âm thanh
| Thuộc tính | Giá trị đo đạc thực tế |
| :--- | :--- |
| **Đường dẫn file** | `docs/tts/0-1-first-snowfall.mp3` |
| **Định dạng & Dung lượng** | MP3, `1,368,190 bytes` (~1.30 MB) |
| **Bitrate trung bình** | `160.8 kbps` |
| **Tag tiêu đề (ID3 Title)** | `"Lesion 1 - First Snow Fall"` |
| **Tổng thời lượng** | `68.08s` |
| **Vùng giọng đọc (Speech Region)** | `0.00s` – `60.20s` (bao gồm cả đuôi ngân tới `61.50s`) |
| **Vùng nhạc đàn guitar outro** | `61.50s` – `68.08s` (`6.58s` nhạc acoustic guitar kết bài) |

### 1.2. Transcript đầy đủ (22 câu / 128 từ)
> `First Snowfall. Today is November 26th. It snowed all day today. The snow is beautiful. The snow finally stopped. My sister and I are excited. My mom doesn't like the snow. My mom has to shovel the driveway. My sister and I get to play. I put on my hat and mittens. My mom puts on my scarf. My mom zippers my jacket. My sister puts on her hat and mittens. My mom puts on her scarf. My mom zippers her jacket. My sister and I go outside. We begin to make a snowman. My mom starts to shovel the snow. My sister and I make snow angels. My sister and I throw snowballs. It starts to snow again. We go inside for hot chocolate.`

### 1.3. Tốc độ đọc (Speaking Rate & Articulation Rate)
| Chỉ số tốc độ | Thời gian tính toán | Tốc độ (từ/giây) | Tốc độ (WPM - Words Per Minute) | Nhận xét |
| :--- | :--- | :--- | :--- | :--- |
| **Speaking Rate (tính cả khoảng nghỉ)** | `60.20s` (`0.00s` – `60.20s`) | `2.13 từ/giây` | **`127.6 WPM`** | Phù hợp cho người học sơ cấp – trung cấp nghe bắt ý toàn bài |
| **Articulation Rate (thời gian phát âm thực tế - active phonation time)** | `38.94s` (trừ tổng thời gian nghỉ) | `3.29 từ/giây` | **`197.2 WPM`** | Tốc độ nhả chữ tự nhiên, không bị kéo giãn âm tiết giả tạo |

### 1.4. Phân bố khoảng nghỉ (Pause Distribution)
Trên vùng thoại (`0.00s` – `60.20s`), thuật toán RMS energy silence detection ghi nhận **21 khoảng nghỉ `>= 120ms`**:

- **Danh sách chuỗi 21 khoảng nghỉ theo thứ tự thời gian (ms)**:
  ```text
  [1820 (sau tiêu đề), 700, 820, 160, 1010, 1550 (chuyển đoạn), 1040, 980, 1000, 1170, 760, 1050, 850, 900, 1140, 970, 1000, 950, 890, 730, 710]
  ```
- **Thống kê mô tả khoảng nghỉ**:
  - **Mean (Trung bình)**: `961.9 ms`
  - **Median (Trung vị)**: `970.0 ms`
  - **Std (Độ lệch chuẩn)**: `315.3 ms`
  - **Min (Ngắn nhất)**: `160 ms` (nối nhanh giữa câu 4 *"The snow is beautiful."* và câu 5 *"The snow finally stopped."*)
  - **Max (Dài nhất)**: `1820 ms` (khoảng nghỉ tách biệt sau tiêu đề *"First Snowfall."*, tiếp theo là `1550 ms` khi chuyển từ cảm xúc hào hứng của hai chị em sang thái độ của người mẹ ở câu 7 *"My mom doesn't like the snow."*)

### 1.5. Dải cao độ F0 (Fundamental Frequency trên vùng thoại `0.00s` – `61.50s`)
| Chỉ số thống kê F0 | Giá trị đo đạc | Ý nghĩa âm học & ngữ điệu |
| :--- | :--- | :--- |
| **Mean F0** | `158.2 Hz` | Tông giọng nam trung – trầm ấm, dễ nghe |
| **Median F0** | `149.5 Hz` | Cao độ nền ổn định |
| **Std (Độ lệch chuẩn)** | `37.9 Hz` | Độ biến thiên cao độ lớn, không bị phẳng (monotone) |
| **IQR (Interquartile Range)** | `51.7 Hz` | Khoảng tứ phân vị rộng, thể hiện sự linh hoạt khi nhấn từ |
| **P5 – P95 (5th – 95th Percentile)** | `108.1 Hz` – `231.9 Hz` | Từ âm trầm kết câu (`108.1 Hz`) tới đỉnh nhấn cảm xúc (`231.9 Hz`) |
| **Biên độ biến thiên (P5–P95)** | **`13.21 semitones (ST)`** | Rất giàu ngữ điệu nội câu (> 1 quãng tám) tại các từ trọng âm |

### 1.6. Nhận xét 2 chiều về file mẫu `0-1-first-snowfall.mp3`
1. **Điểm mạnh (Ở mức từng câu đơn lẻ - Intra-sentence Level)**:
   - Giọng đọc nam trầm ấm, phát âm rõ chữ, tự nhiên, tốc độ phát âm thực tế (`197.2 WPM`) chuẩn xác của người bản xứ nhưng có chèn khoảng nghỉ nên tổng thể vừa sức nghe (`127.6 WPM`).
   - Biên độ biến thiên cao độ F0 nội câu rất rộng (`13.21 ST`), thể hiện rõ sự nâng cao độ và năng lượng ở các từ khóa mang thông tin mới hoặc cảm xúc (*beautiful*, *finally*, *excited*, *doesn't*, *snowman*, *hot chocolate*) và hạ giọng tự nhiên (falling cadence `~108 Hz`) ở cuối mỗi câu trần thuật.
2. **Hạn chế (Ở mức đoạn văn - Paragraph/Discourse Level — hoàn toàn trùng khớp với nhận xét của người dùng và Mục 1 của `TTS_MASTER_PROMPT.md`)**:
   - Từ câu 7 đến câu 21, bài đọc chứa nhiều câu ngắn có cấu trúc ngữ pháp lặp lại song song (*"I put on my hat and mittens. My mom puts on my scarf. My mom zippers my jacket. My sister puts on her hat and mittens. My mom puts on her scarf. My mom zippers her jacket..."*).
   - Người đọc/engine xử lý từng câu quá tách biệt với khoảng nghỉ liên câu gần như đồng nhất (`850 ms` – `1050 ms`, xoay quanh trung vị `970 ms`) và lặp đi lặp lại cùng một đường cong ngữ điệu (lên ở đầu câu, rơi xuống đáy ở dấu chấm câu).
   - **Hệ quả**: Thiếu sự liên kết theo cụm ý (thought groups / discourse chunks), không tạo được nhịp chuyển tiếp nhanh hơn ở các chuỗi hành động mặc đồ song song, và thiếu đường cong cao trào của mạch truyện:
     $$\text{Opening (1–3)} \longrightarrow \text{Build-up & Contrast (4–9)} \longrightarrow \text{Parallel Preparation (10–15)} \longrightarrow \text{Outdoor Play / Climax (16–20)} \longrightarrow \text{Surprise Turn (21)} \longrightarrow \text{Cozy Resolution (22)}$$

---

## Phần 2: Kiến trúc Pipeline TTS hiện tại trong English Life World

Qua kiểm toán toàn bộ mã nguồn dự án, hệ thống TTS hiện tại được phân bổ qua 4 nhóm thành phần chính dưới đây:

### 2.1. Module quản lý giọng đọc, ngữ điệu và hội thoại: [`modules/voices-dialogue.js`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L1-L320) (`window.ELW_VOICES` & `window.ELW_DIALOGUE`)
- **Hồ sơ giọng cơ sở (`PROFILES` — [dòng 14–27](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L14-L27))**:
  Định nghĩa 6 base profiles (`adult_male`, `adult_female`, `young_male`, `young_female`, `child`, `elderly`) với các tham số `pitch` (`0.55` đến `1.85`), `rate` (`0.78` đến `1.1`), `gender`, `lang`, và mảng biểu thức chính quy `prefer` để khớp tên giọng trình duyệt.
- **Hồ sơ nhân vật (`CHARACTER_PROFILES` — [dòng 29–44](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L29-L44))**:
  Định nghĩa 14 nhân vật (`linh`, `barista`, `cashier`, `mom`, `dad`, `butcher`, `baker`, `clerk`, `service`, `waiter`, `teacher`, `librarian`, `nurse`, `ranger`) ánh xạ vào `baseId` kèm `pitch`, `rate` và thuộc tính chuỗi `style` (`cheerful`, `friendly`, `polite`, `warm`, `calm`, `helpful`, `clear`, `gentle`, `steady`). Tuy nhiên, thuộc tính `style` này hiện chỉ nằm trên dữ liệu tĩnh, **chưa hề được sử dụng** trong hàm tính toán ngữ điệu `analyzeProsody`.
- **Phân tích câu & tách mệnh đề ([dòng 75–186](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L75-L186))**:
  - `detectSentenceType(text)` ([dòng 79–101](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L79-L101)): Phân loại câu thành 4 nhãn: `wh_question`, `yn_question`, `exclamation`, `statement` dựa trên dấu `?`, `!` cuối chuỗi và các từ đầu câu (`WH_START`, `YN_START`).
  - `splitClauses(text)` ([dòng 103–121](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L103-L121)): Nếu câu có dấu phẩy `,` hoặc dài `>= 48` ký tự, hàm gọi `raw.split(/,\s+/)` ([dòng 108](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L108)) để cắt câu thành các mảnh nhỏ (chỉ gộp lại nếu mảnh trước ngắn `< 7` ký tự và mảnh sau `< 28` ký tự).
  - `hasKeywords(clause)` ([dòng 123–125](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L123-L125)): Kiểm tra xem mệnh đề có khớp `KEYWORD_RE` ([dòng 77](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L77)) hay không.
  - `analyzeProsody(text, profileId, opts)` ([dòng 127–186](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L127-L186)): Áp dụng công thức nhân hệ số cứng cho từng mệnh đề trong `clauses` (ví dụ câu `statement`: mệnh đề không phải cuối `pitch = basePitch * 1.02`, mệnh đề cuối `pitch = basePitch * 0.93`; nếu `hasKeyword` thì `rate *= 0.93`; gán `pauseAfterMs = 160` giữa các mệnh đề dấu phẩy).
- **Chấm điểm & cấp phát giọng (`available`, `score`, `allocate`, `pick` — [dòng 189–228](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L189-L228))**:
  Lọc các giọng `en*` từ `speechSynthesis.getVoices()`, chấm điểm ưu tiên theo `prefer`, giới tính, vùng ngôn ngữ, và cộng điểm thưởng nếu tên giọng chứa `/Natural|Neural/i` (`+26` điểm — [dòng 202](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L202)) hoặc `/Online|Enhanced|Premium/i` (`+14` điểm — [dòng 203](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L203)).
- **Thực thi phát âm (`waitSynthQuiet`, `speakOneClause`, `speak` — [dòng 235–303](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L235-L303))**:
  `speak(text, profileId, opts)` xếp hàng vào Promise `speakQueue`, gọi `waitSynthQuiet(s, 6000)` (poll `s.speaking` mỗi `60ms`), sau đó duyệt tuần tự qua mảng `prosody.plan` và gọi `speakOneClause` ([dòng 248–280](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L248-L280)) — tại đây **mỗi một mệnh đề dấu phẩy tạo ra một đối tượng `new root.SpeechSynthesisUtterance(segPlan.text)` riêng biệt** ([dòng 268](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L268)) rồi gọi `s.speak(u)`.

### 2.2. Module đọc đoạn văn theo cấp độ CEFR: [`modules/reading.js`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L1-L168) (`window.ELW_READING`)
- **Cấu hình cấp độ (`LEVEL_CFG` — [dòng 4–12](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L4-L12))**:
  | Cấp độ | `rate` | `mode` | `pauseMs` | `linking` | `weakForms` |
  | :--- | :---: | :---: | :---: | :---: | :---: |
  | `simple` / `A1` | `0.72` | `"chunk"` | `900 ms` | `"none"` | `false` |
  | `A2` | `0.80` | `"chunk"` | `650 ms` | `"none"` | `false` |
  | `B1` | `0.90` | `"chunk"` | `350 ms` | `"basic"` | `false` |
  | `B2` | `1.00` | `"flow"` | `250 ms` | `"basic"` | `true` |
  | `C1` | `1.08` | `"flow"` | `180 ms` | `"full"` | `true` |
  | `C2` | `1.15` | `"flow"` | `120 ms` | `"full"` | `true` |
- **Thuật toán băm cụm ở chế độ `chunk` (`chunks` & `splitLong` — [dòng 31–61](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L31-L61))**:
  - Bước 1 ([dòng 33–47](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L33-L47)): Tách theo dấu câu `/(?<=[,.;:!?])\s+/`, sau đó tiếp tục cắt câu ngay trước bất kỳ từ nối nào trong `CONNECT = ["and then", "and", "then", "while", "after", "before", "as", "once", "without", "which", "so", "because"]`.
  - Bước 2 ([dòng 49–61](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L49-L61)): Đẩy từng mảnh qua `splitLong(w, res)` — **bất kỳ cụm nào dài quá 6 từ (`if (w.length <= 6)` tại dòng 54) đều bị cắt đôi đệ quy** ưu tiên tại giới từ `PREP = /^(on|in|at|to|from|with|into|onto|for|of|by|under|over)$/i` quanh điểm giữa!
  - Bước 3 (`speakPlan` — [dòng 102–105](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L102-L105)): Gán khoảng nghỉ sau mỗi mảnh là `c.pauseMs` (`900ms`, `650ms` hoặc `350ms`), và nếu mảnh kết thúc bằng `[.!?]` thì nhân `c.pauseMs * 1.6 | 0` (lên tới `1440ms` ở A1, `1040ms` ở A2).
- **Thuật toán tách câu ở chế độ `flow` (`speakPlan` — [dòng 106–112](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L106-L112))**:
  Tách đoạn văn thành các câu bằng regex `text.match(/[^.!?]+[.!?]*/g)`, áp dụng **cùng một `rate` cố định** và **cùng một `pauseAfterMs` cố định** (`250ms`, `180ms`, hoặc `120ms`) cho mọi câu trong đoạn văn mà không xét ngữ nghĩa hay cấu trúc đoạn.
- **Vòng lặp phát âm (`play` — [dòng 117–127](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L117-L127))**:
  Chạy vòng lặp `for` gọi `await speakFn(p[i].text, p[i].rate)` rồi `await sleep(p[i].pauseAfterMs)`.

### 2.3. Điểm điều phối trung tâm trong [`index.html`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/index.html)
- **[Dòng 1383–1387](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/index.html#L1383-L1387) (`say(t, rate=1)`)**:
  Gọi `speechQuiet().then(() => window.ELW_VOICES ? ELW_VOICES.speak(t, narr.voice || "adult_female", { rate }) : ...)` hoặc fallback trực tiếp sang `new SpeechSynthesisUtterance(t)`.
- **[Dòng 1577](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/index.html#L1577) (`speechQuiet(max=6000)`)**:
  Vòng lặp poll `speechSynthesis.speaking` mỗi `120ms` trước khi cho phép phát câu tiếp theo.
- **[Dòng 1671–1675](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/index.html#L1671-L1675) (`readAloud(t)`)**:
  Xóa ký hiệu nối âm `‿` rồi giao toàn bộ đoạn văn cho `ELW_READING.play(t, lvl(), rdOver(), (x, r) => say(x, r), ...)`.
- **[Dòng 1989](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/index.html#L1989) (`speakV(t, v)` — Lỗi logic nghiêm trọng)**:
  Kiểm tra tính hợp lệ của voice ID bằng biểu thức:
  `const ok = window.ELW_VOICES && ELW_VOICES.PROFILES.some(p => p.id === v);`
  Do chỉ kiểm tra trong mảng `PROFILES` (6 giọng cơ sở) mà **không kiểm tra `CHARACTER_PROFILES`** (14 nhân vật), nên nếu bất kỳ thành phần nào truyền ID nhân vật như `"linh"`, `"barista"`, `"cashier"`, `"mom"`, `"dad"` vào `speakV(t, v)`, biến `ok` sẽ nhận giá trị `false` và giọng đọc bị ép cưỡng bức về `"adult_female"`!
- **[Dòng 2068 & 2079](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/index.html#L2068-L2079) (`ELW_LIFE.init` & `ELW_CONTEXT.init`)**:
  Truyền callback `say: (t, v) => speechQuiet().then(() => v && window.ELW_VOICES ? ELW_VOICES.speak(t, v, { rate: .95 }) : say(t, .92))`.

### 2.4. Các module vệ tinh khác gọi TTS
- **[`modules/grammar.js` (dòng 398)](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/grammar.js#L398)**: Có nhánh fallback tự khởi tạo `new SpeechSynthesisUtterance(t)` với `u.rate = 0.95; u.lang = "en-US"; speechSynthesis.speak(u)` hoàn toàn bỏ qua `ELW_VOICES` nếu `opts.speak` không được truyền vào.
- **[`modules/roleplay.js` (dòng 869)](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/roleplay.js#L869)**: Gọi `ELW_VOICES.speak(text, vProfile, ...)` cho lời thoại đối đáp nhập vai.
- **[`modules/npcs.js` (dòng 459–460)](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/npcs.js#L459-L460)**: Phát lời thoại NPC trong thế giới tương tác.
- **[`modules/mission.js` (dòng 100, 129)](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/mission.js#L100)**: Phát âm câu nhiệm vụ qua callback `say`.
- **[`modules/speaking-coach.js` (dòng 28, 30)](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/speaking-coach.js#L28-L30)**: Phát câu mẫu luyện nói qua `ELW_VOICES.speak` hoặc `speechSynthesis`.
- **[`modules/context-engine.js` (dòng 1162)](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/context-engine.js#L1162)**: Gọi hàm `say` được truyền từ `index.html`.

---

## Phần 3: Trả lời trực tiếp 9 câu hỏi bắt buộc ở Mục 2 (`TTS_MASTER_PROMPT.md`)

### Câu hỏi 1: Nhà cung cấp và tên voice hiện tại là gì?
- **Nhà cung cấp (Provider)**: Sử dụng 100% **Web Speech API** tích hợp sẵn trong trình duyệt (`window.speechSynthesis` và `window.SpeechSynthesisUtterance`). Không có kết nối tới bất kỳ Cloud Neural TTS API hay local neural TTS server riêng biệt nào.
- **Tên các voice thực tế hiện có**: Phụ thuộc hoàn toàn vào trình duyệt và hệ điều hành của người dùng:
  - **Trên Windows / Chromium mặc định (local SAPI5 / Windows OneCore)**: Chỉ có 3 giọng cài sẵn là `Microsoft David Desktop - English (United States)`, `Microsoft Mark - English (United States)`, và `Microsoft Zira Desktop - English (United States)`.
  - **Trên Microsoft Edge (khi có kết nối Internet)**: Cung cấp thêm các giọng trực tuyến `Microsoft Aria Online (Natural)`, `Microsoft Jenny Online (Natural)`, `Microsoft Guy Online (Natural)`, `Microsoft Ana Online (Natural)`, `Microsoft Ryan Online (Natural)`, `Microsoft Natasha Online (Natural)`...
  - **Trên Google Chrome Desktop**: Cung cấp thêm các giọng `Google US English`, `Google UK English Female`, `Google UK English Male`.
  - **Trên macOS / iOS Safari**: Các giọng hệ thống của Apple như `Samantha`, `Alex`, `Daniel`, `Karen`, `Moira`, `Tessa`.

### Câu hỏi 2: Đây là neural TTS, browser TTS hay một loại engine khác?
- Đây là **100% Browser TTS** thông qua giao diện chuẩn Web Speech API.
- Bản chất engine phía dưới biến thiên theo môi trường chạy:
  - Nếu người dùng mở bằng Chromium/Firefox hoặc chạy offline trên Windows, trình duyệt rơi về **SAPI5 / Windows OneCore TTS** (công nghệ ghép nối âm vị concatenative / formant/statistical parametric thế hệ cũ trên các giọng `David`, `Mark`, `Zira`).
  - Chỉ khi người dùng mở trên Microsoft Edge (có mạng) hoặc Chrome (có mạng), trình duyệt mới route sang các giọng **Neural Browser TTS** trực tuyến.

### Câu hỏi 3: Engine có hỗ trợ SSML, prosody, emotion, style, voice direction hoặc fine-tuning không?
- **KHÔNG hỗ trợ SSML**: Đối tượng `SpeechSynthesisUtterance` của Web Speech API trên Chrome/Edge/Safari chỉ nhận văn bản thuần (`plain text`). Nếu truyền các thẻ SSML như `<speak>`, `<prosody pitch="+10%">`, `<break time="300ms"/>` hay `<mstts:express-as style="cheerful">` vào `u.text`, engine của trình duyệt sẽ **đọc thành tiếng tên thẻ** (ví dụ: *"less than prosody pitch equals..."*).
- **KHÔNG hỗ trợ emotion tag, speaking style, voice direction hay fine-tuning**: Không có API nào trong `window.speechSynthesis` cho phép truyền vector cảm xúc, style token hay điều hướng đường cong F0 nội bộ.
- **Chỉ hỗ trợ 3 tham số vô hướng (scalar) thô trên mỗi `SpeechSynthesisUtterance`**:
  1. `u.pitch` (hệ số thực từ `0.0` đến `2.0`, mặc định `1.0`) — áp dụng đồng nhất cho toàn bộ chuỗi văn bản trong utterance đó.
  2. `u.rate` (hệ số thực từ `0.1` đến `10.0`, mặc định `1.0`) — kéo giãn hoặc nén tốc độ của toàn bộ utterance.
  3. `u.volume` (hệ số thực từ `0.0` đến `1.0`, mặc định `1.0`) — âm lượng tĩnh cho toàn bộ utterance.

### Câu hỏi 4: Cách đọc hiện tại được tạo theo từng câu, từng đoạn hay toàn bộ văn bản?
- Hiện tại, văn bản **KHÔNG được đọc theo đoạn** và thậm chí **cũng không được giữ nguyên theo từng câu**, mà bị **băm nhỏ qua 2 tầng cắt nối tiếp nhau (Double-Fragmentation)**:
  - **Tầng 1 (`ELW_READING.speakPlan` trong `modules/reading.js` dòng 100–114)**:
    - Ở chế độ `chunk` (mặc định cho `simple`, `A1`, `A2`, `B1`), một câu đơn bị cắt tại các từ nối (`and`, `then`, `because`...) và bất kỳ cụm nào dài quá **6 từ** lại bị hàm `splitLong` ([dòng 53–61](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L53-L61)) cắt đôi tại giới từ (`on`, `in`, `to`, `for`...).
    - Ở chế độ `flow` (`B2`, `C1`, `C2`), đoạn văn bị cắt rời thành từng câu đơn lẻ.
  - **Tầng 2 (`ELW_VOICES.splitClauses` & `speak` trong `modules/voices-dialogue.js` dòng 103–121, 288–299)**:
    - Mỗi mảnh câu từ Tầng 1 khi truyền xuống `ELW_VOICES.speak()` lại bị `splitClauses()` cắt tiếp theo mọi dấu phẩy `, ` và mỗi mảnh dấu phẩy được khởi tạo thành một lệnh `new SpeechSynthesisUtterance(segPlan.text)` độc lập!

### Câu hỏi 5: Việc ghép câu có làm mất nhịp điệu, ngữ cảnh hoặc ngữ điệu cuối câu không?
- **CÓ, làm mất nghiêm trọng cả nhịp điệu, ngữ cảnh lẫn ngữ điệu tự nhiên**:
  1. **Hiện tượng "False Finality" (Hạ giọng kết câu giả tạo giữa chừng)**: Khi một câu bị cắt tại dấu phẩy (ở `splitClauses`) hoặc cắt tại giới từ sau mỗi 6 từ (ở `splitLong`), mỗi mảnh ngắn được gửi vào một `SpeechSynthesisUtterance` riêng. Engine TTS coi mỗi `Utterance` là một câu hoàn chỉnh độc lập nên tự động áp dụng ngữ điệu kết thúc câu (falling terminal contour) và ngắt hơi hoàn toàn ở cuối mỗi mảnh.
  2. **Đứt gãy đà nối âm (Connected Speech Breakdown)**: Khi tách *"We begin to make / a snowman"* hoặc tách mệnh đề dấu phẩy thành 2 `Utterance` rời nhau kèm `setTimeout` `160ms` – `900ms`, cơ chế coarticulation (đồng cấu âm giữa từ cuối mảnh trước và từ đầu mảnh sau) bị phá hủy hoàn toàn.
  3. **Mất nhịp điệu toàn đoạn**: Khoảng nghỉ giữa các câu bị đóng khung cứng nhắc (ví dụ `250ms` cho mọi câu ở B2, hoặc `900ms * 1.6 = 1440ms` ở A1), làm đoạn văn nghe như máy đếm nhịp (metronome) thay vì dòng chảy kể chuyện.

### Câu hỏi 6: Có bị reset prosody khi chuyển giữa các câu không?
- **CÓ, bị reset 100% ở cả tầng Engine lẫn tầng Code điều khiển**:
  1. **Ở tầng Engine**: Web Speech API là stateless giữa các lần gọi `speechSynthesis.speak(new SpeechSynthesisUtterance(...))`. Mỗi `Utterance` mới hoàn toàn không có bộ nhớ (acoustic/prosodic memory) về cao độ, tốc độ hay năng lượng của `Utterance` ngay trước đó.
  2. **Ở tầng Code (`analyzeProsody` — `modules/voices-dialogue.js` dòng 127–186)**: Hàm `analyzeProsody(text, profileId, opts)` chỉ nhận đầu vào là một câu đơn lẻ (hoặc một mảnh 6 từ). Nó không hề biết câu đó là câu thứ mấy trong đoạn văn, thuộc phần Mở đầu (Opening), Diễn biến (Build-up), Chuỗi câu lặp song song (Parallel sequence), Cao trào/Bất ngờ (Climax/Surprise) hay Kết bài (Resolution). Do đó, mọi câu trần thuật trong bài đều bị áp cùng một công thức tĩnh: mệnh đề đầu `basePitch * 1.02`, mệnh đề cuối `basePitch * 0.93`.

### Câu hỏi 7: Các dấu câu hiện tại có được giữ nguyên khi gửi sang TTS không?
- **KHÔNG được giữ nguyên toàn vẹn**:
  1. **Mất dấu phẩy `,` trong `splitClauses` (`modules/voices-dialogue.js` dòng 108)**:
     Lệnh `var parts = raw.split(/,\s+/);` tiêu hủy hoàn toàn ký tự dấu phẩy `,` ở cuối tất cả các mệnh đề trước mệnh đề cuối. Khi gửi mảnh văn bản không còn dấu phẩy vào `SpeechSynthesisUtterance`, engine Neural TTS mất tín hiệu dấu phẩy (continuation rise / non-terminal boundary tone) và đọc nó với ngữ điệu rơi xuống như một câu cụt.
  2. **Mất dấu kết câu trên các mảnh đầu trong `ELW_READING.chunks` (`modules/reading.js` dòng 31–61)**:
     Khi một câu bị cắt đôi tại từ nối (`and`, `because`...) hoặc giới từ (`to`, `for`, `in`...), các mảnh phía trước không có bất kỳ dấu câu nào ở cuối, nhưng lại bị phát thành một `Utterance` riêng kèm khoảng nghỉ dài `350ms`–`900ms`.

### Câu hỏi 8: Giọng đọc đang sử dụng có thực sự hỗ trợ expressive speech không?
- Câu trả lời phụ thuộc vào loại giọng mà trình duyệt cấp phát tại thời điểm chạy:
  1. **Nhóm giọng SAPI5 / Windows OneCore Desktop (`Microsoft David`, `Microsoft Zira`, `Microsoft Mark`)**: **KHÔNG hỗ trợ expressive speech**. Đây là các giọng tổng hợp thế hệ cũ, âm sắc cơ học, dải biến thiên F0 hẹp và không có khả năng tự suy luận cảm xúc từ ngữ cảnh từ vựng.
  2. **Nhóm giọng Neural Browser (`Microsoft Aria/Jenny/Guy Online (Natural)`, `Google US English`)**: **CÓ khả năng tự sinh ngữ điệu nội câu (intra-sentence prosody) khá tốt** khi được cung cấp một câu hoàn chỉnh nguyên vẹn dấu câu. Tuy nhiên, do code hiện tại của dự án đang **băm nhỏ câu tại dấu phẩy/giới từ** và **thay đổi `pitch`/`rate` nhảy bậc giữa các mảnh**, khả năng diễn cảm tự nhiên của các giọng Neural này đang bị chính code dự án vô hiệu hóa và làm méo tiếng.

### Câu hỏi 9: Những giới hạn nào đến từ code và những giới hạn nào đến từ chính mô hình TTS?

Bảng phân định rạch ròi dưới đây tách biệt giới hạn của **Code hiện tại** (có thể sửa triệt để ngay trong dự án) và giới hạn của **Mô hình Browser TTS / Web Speech API**:

| Khía cạnh | Giới hạn đến từ Code hiện tại (Sửa được ngay bằng phần mềm) | Giới hạn đến từ Mô hình Web Speech API / Browser TTS (Giới hạn nền tảng) |
| :--- | :--- | :--- |
| **1. Ngắt câu & Dấu phẩy** | `splitClauses()` dùng `split(/,\s+/)` làm mất dấu phẩy và tạo `SpeechSynthesisUtterance` riêng cho từng vế câu, gây hạ giọng giả tạo và khựng nhịp giữa câu. | Web Speech API không cho phép chèn thẻ `<break time="..."/>` vào giữa một `Utterance` đơn lẻ. |
| **2. Chế độ đọc người học (Learning Mode)** | `ELW_READING.chunks()` + `splitLong()` cắt vụn mọi cụm `> 6` từ tại giới từ kèm pause `650–900ms`, biến bài đọc thành chuỗi đọc rời từng mảnh vô hồn. | Khi giảm `u.rate` xuống quá thấp (`< 0.75`) trên giọng SAPI cũ, âm thanh bị biến dạng time-stretching nhẹ. |
| **3. Ngữ điệu cấp đoạn văn (Paragraph Prosody)** | Code hoàn toàn chưa có `Paragraph Prosody Planner`: mọi câu trần thuật đều nhận cùng một `rate`, cùng một `pitch` (`0.93 * basePitch`) và cùng một `pauseAfterMs` cố định từ đầu đến cuối bài. | Mỗi `SpeechSynthesisUtterance` là độc lập, engine không tự động biết câu hiện tại thuộc phần mở bài, cao trào hay kết bài nếu code không điều phối `pitch`/`rate`/`pause` theo vai trò câu. |
| **4. Xử lý chuỗi câu ngắn lặp cấu trúc** | Code đọc từng câu *"My mom puts on..."* với cùng một khoảng nghỉ và cùng một độ rơi cao độ, gây cảm giác buồn ngủ và rời rạc. | Engine TTS chỉ nhìn thấy từng câu một (nếu gửi từng câu) hoặc nếu gửi cả đoạn dài vào 1 `Utterance` thì không hỗ trợ highlight từng câu/cụm đồng bộ chính xác trên mọi trình duyệt. |
| **5. Nhấn trọng âm từ khóa (Keyword Stress)** | `analyzeProsody()` giảm `rate *= 0.93` cho **toàn bộ mệnh đề** chỉ vì chứa 1 từ trong `KEYWORD_RE` (vốn chỉ gồm từ vựng đi chợ/nhà hàng). | Web Speech API không hỗ trợ điều chỉnh F0 hay duration cho **từng từ riêng lẻ** bên trong cùng một `SpeechSynthesisUtterance` (không có `<prosody>` hay `<emphasis>`). |
| **6. Cảm xúc & Phong cách (Emotion / Style)** | Chưa có hệ thống 7 `deliveryStyle` presets; trường `style` của 14 nhân vật trong `CHARACTER_PROFILES` bị bỏ không; hàm `speakV` ở `index.html:1989` làm rơi toàn bộ ID nhân vật về `"adult_female"`. | Không có tham số `emotion` hay `style` native (như Azure SSML `mstts:express-as`); mọi biểu đạt cảm xúc trên Web Speech API phải được mô phỏng qua ma trận điều phối `pitch`, `rate`, `volume` và `pause` ở cấp câu/mệnh đề. |
| **7. Chất lượng âm sắc giọng đọc (Voice Timbre)** | Code chưa có tầng Adapter cho phép cắm thêm Neural TTS / Pre-generated Audio khi cần đối chứng hoặc nâng cấp. | Trên trình duyệt Chromium không có giọng `Online (Natural)`, hệ điều hành Windows chỉ cung cấp 3 giọng SAPI/OneCore (`David`, `Zira`, `Mark`) có âm sắc khô và ít biểu cảm hơn giọng Neural. |

---

## Phần 4: Phân loại nguyên nhân gốc rễ theo 6 nhóm bắt buộc (Mục 2 `TTS_MASTER_PROMPT.md`)

### Nhóm 1: Lỗi hoặc giới hạn của Implementation (Code)
1. **Băm mệnh đề dấu phẩy thành các `SpeechSynthesisUtterance` rời rạc (`modules/voices-dialogue.js`, [dòng 103–121](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L103-L121) & [dòng 248–299](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L248-L299))**:
   - Hàm `splitClauses` tách câu theo dấu phẩy, sau đó `speak()` gọi `speakOneClause()` tạo `new SpeechSynthesisUtterance` cho từng mảnh. Điều này vừa phá vỡ đường cong ngữ điệu tự nhiên của câu có dấu phẩy, vừa gây nhảy bậc `pitch` (mảnh đầu `1.02 * basePitch`, mảnh cuối `0.93 * basePitch`) khiến giọng nghe bị gãy khúc.
2. **Giảm tốc độ cả mệnh đề vì một từ khóa (`modules/voices-dialogue.js`, [dòng 161–163](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L161-L163))**:
   - Khi `hasKeywords(cl)` trả về `true` (thậm chí chỉ vì mệnh đề có chứa một con số `\b\d+\b` hoặc từ `"today"`), toàn bộ mệnh đề bị nhân `rate *= 0.93`, làm nhịp nói giữa các câu trong đoạn bị lúc nhanh lúc chậm bất thường.
3. **Công thức ngữ điệu cứng nhắc, vô cảm với mạch đoạn văn (`modules/voices-dialogue.js`, [dòng 147–158](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L147-L158))**:
   - Mọi câu trần thuật (`statement`) đều bị gán `pitch = isLast ? basePitch * 0.93 : basePitch * 1.02`. Khi gặp đoạn văn có 15–20 câu trần thuật liên tiếp như bài *First Snowfall*, toàn bộ 20 câu đều có cùng một cao độ và tốc độ y hệt nhau.
4. **Lỗi đánh rơi hồ sơ nhân vật tại `speakV` (`index.html`, [dòng 1989](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/index.html#L1989))**:
   - `const ok = window.ELW_VOICES && ELW_VOICES.PROFILES.some(p => p.id === v);` chỉ kiểm tra 6 `PROFILES` cơ sở, bỏ quên 14 `CHARACTER_PROFILES`. Khi gọi `speakV(text, "linh")` hay `speakV(text, "barista")`, `ok` bằng `false` và bị ép về `"adult_female"`.
5. **Độ trễ kép từ hai bộ輪询 (Double Polling Latency)**:
   - `index.html` gọi `speechQuiet()` ([dòng 1577](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/index.html#L1577), chu kỳ `120ms`) trước khi gọi `ELW_VOICES.speak()`, rồi bên trong `ELW_VOICES.speak()` lại gọi tiếp `waitSynthQuiet(s, 6000)` ([dòng 235–247](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L235-L247), chu kỳ `60ms`), cộng thêm `sleep(p[i].pauseAfterMs)` trong `ELW_READING.play()` ([dòng 124](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L124)), làm khoảng nghỉ thực tế giữa các câu bị đội lên và thiếu chính xác.

### Nhóm 2: Giới hạn của Nhà cung cấp hoặc Voice (Provider / Voice)
1. **Không hỗ trợ SSML và điều khiển vi mô cấp từ (Word-level Prosody Control)**:
   - `window.speechSynthesis` không nhận SSML, không cho phép gán đường cong F0 (pitch contour) hay kéo dài thời lượng (phoneme/word duration) cho riêng một từ trọng âm bên trong câu mà không tách câu đó ra.
2. **Chất lượng giọng Offline SAPI5 / OneCore trên Windows/Chromium**:
   - Khi chạy trên môi trường không có giọng `Online (Natural)` của Edge, trình duyệt chỉ cung cấp `Microsoft David`, `Microsoft Zira`, `Microsoft Mark`. Các giọng này có dải F0 tự nhiên hẹp hơn nhiều so với giọng đọc con người hoặc Neural TTS hiện đại, âm sắc thiếu độ ấm và hơi thở tự nhiên.

### Nhóm 3: Lỗi xử lý văn bản (Text Processing)
1. **Nuốt mất dấu phẩy khi tách mệnh đề (`modules/voices-dialogue.js`, [dòng 108](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L108))**:
   - `raw.split(/,\s+/)` xóa bỏ dấu phẩy khỏi văn bản gửi xuống engine TTS, làm mất tín hiệu ngữ điệu nối tiếp (continuation rise) tự nhiên của dấu phẩy.
2. **Bộ từ điển `KEYWORD_RE` thiên lệch và hạn hẹp (`modules/voices-dialogue.js`, [dòng 77](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L77))**:
   - `KEYWORD_RE` chỉ liệt kê cứng các danh từ thực phẩm/mua sắm (`salmon`, `beef`, `apples`, `aisle`, `receipt`, `refund`...) và số đếm. Nó hoàn toàn bỏ sót các từ khóa mang trọng tâm cảm xúc, trạng từ chuyển biến và tính từ miêu tả trong văn kể chuyện (như `beautiful`, `finally`, `excited`, `again`, `snowman`, `angels`, `wonderful`, `suddenly`, `together`...).

### Nhóm 4: Lỗi phân đoạn và ghép Audio (Segmentation & Stitching)
1. **Cắt vụn câu quá mức trong `ELW_READING.chunks` & `splitLong` (`modules/reading.js`, [dòng 31–61](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L31-L61))**:
   - Ở các cấp độ `simple`, `A1`, `A2`, `B1`, mọi câu dài hơn 6 từ đều bị cắt đôi tại giới từ (`on`, `in`, `to`, `for`, `of`...) hoặc từ nối (`and`, `so`, `because`) và chèn khoảng nghỉ cố định từ `350ms` đến `900ms` (cuối câu lên tới `1440ms`). Ví dụ câu *"We go inside for hot chocolate."* hoặc *"My mom has to shovel the driveway."* bị băm thành 2 lần gọi TTS rời rạc với khoảng nghỉ dài ở giữa, nghe cực kỳ máy móc và đứt hơi.
2. **Khoảng nghỉ liên câu đồng nhất cứng nhắc (`modules/reading.js`, [dòng 104 & 110](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/reading.js#L104-L110))**:
   - Mọi câu trong đoạn văn đều nhận cùng một `pauseAfterMs = c.pauseMs` bất chấp độ dài câu, quan hệ ngữ nghĩa giữa hai câu liền kề (câu nối tiếp song song cần pause ngắn `180–260ms`, trong khi câu mở bài hoặc chuyển đoạn cần pause dài `420–650ms`).

### Nhóm 5: Thiếu thông tin về Ngữ cảnh và Cảm xúc (Missing Context & Emotion)
1. **Thiếu bộ lập kế hoạch ngữ điệu cấp đoạn văn (`Paragraph Prosody Planner`)**:
   - Hệ thống chưa có cơ chế phân tích toàn bộ đoạn văn trước khi đọc để nhận diện:
     - Vai trò câu trong cấu trúc tự sự: **Opening** (mở bài/tiêu đề) $\rightarrow$ **Build-up** (diễn biến) $\rightarrow$ **Parallel Action Group** (nhóm câu ngắn lặp cấu trúc cần nhịp linh hoạt, tránh lặp lại một kiểu rơi giọng) $\rightarrow$ **Climax / Surprise Turn** (bất ngờ/cao trào, ví dụ *"It starts to snow again."*) $\rightarrow$ **Warm Resolution** (kết bài ấm áp, hạ nhịp nhẹ nhàng ở cuối câu cuối cùng).
2. **Thiếu hệ thống Preset Phong cách & Cảm xúc (`deliveryStyle` / Emotion Presets)**:
   - Chưa có 7 preset chuẩn hóa theo yêu cầu của `TTS_MASTER_PROMPT.md` (Mục 5):
     1. `storytelling` (Kể chuyện ấm áp, có mạch dẫn dắt)
     2. `friendly_conversation` (Trò chuyện tự nhiên, gần gũi)
     3. `curious` (Tò mò, gợi mở)
     4. `happy_excited` (Vui vẻ, hào hứng)
     5. `gentle_comforting` (Nhẹ nhàng, khích lệ, trấn an)
     6. `clear_learning` (Rõ ràng, vừa phải cho người học nhưng không máy móc)
     7. `character_dialogue` (Đối thoại theo cá tính từng nhân vật)
3. **Chưa tách bạch đúng bản chất của `Natural Mode` và `Learning Mode` (Mục 6 `TTS_MASTER_PROMPT.md`)**:
   - Hiện tại chế độ cho người học (`chunk` mode ở A1–B1) đang đồng nhất việc "dễ nghe" với việc "băm vụn câu thành từng mảnh $\le 6$ từ + nghỉ `900ms`". Thiết kế đúng của **Learning Mode** phải là đọc theo **cụm ý hoàn chỉnh (thought groups hợp lý)** hoặc câu nguyên vẹn với tốc độ vừa phải (`rate ~ 0.86–0.92`), giữ nguyên dấu phẩy tự nhiên và phân bổ khoảng nghỉ thông minh theo cấu trúc câu chứ không băm nát mệnh đề.

### Nhóm 6: Vấn đề chưa thể kết luận nếu chưa thử nghiệm (To be verified via A/B/C Testing)
1. **Biên độ cải thiện thực tế của `Paragraph Prosody Planner` trên Browser TTS (Bản B) so với Neural TTS / Pre-rendered Audio (Bản C)**:
   - Khi ta giữ nguyên câu hoàn chỉnh (không cắt vụn tại dấu phẩy/giới từ) và áp dụng **Paragraph Prosody Planner** (điều biến `pitch` contour theo vai trò câu trong đoạn, biến thiên `rate` theo mật độ thông tin/cảm xúc, và phân bổ `pauseAfterMs` động từ `180ms` đến `650ms` theo nhóm ý), mức độ cải thiện về độ tự nhiên trên Web Speech API (Bản B) đạt bao nhiêu phần trăm so với khi kết hợp thêm giọng Neural TTS chất lượng cao (Bản C)?
   - Câu hỏi này sẽ được kiểm chứng định lượng (bằng đo đạc F0, tốc độ WPM, phân bố pause) và đối chiếu A/B/C trực tiếp trên đoạn mẫu *First Snowfall* trong bước thực thi tiếp theo.
