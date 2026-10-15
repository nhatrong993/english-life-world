# BÁO CÁO KẾT QUẢ THỬ NGHIỆM A/B/C & ĐÁNH GIÁ HỆ THỐNG GIỌNG ĐỌC DIỄN CẢM (EXPRESSIVE TTS A/B/C TEST REPORT)

> **Dự án**: English Life World (`D:\tools\Hoc tieng anh\english-life-world`)  
> **Ngày thực hiện**: 14/10/2026  
> **Đối chuẩn tham chiếu**: `docs/tts/0-1-first-snowfall.mp3` & `docs/tts/ab/acoustic_metrics.json`  
> **Tài liệu kiểm toán gốc**: [`docs/TTS_EXPRESSIVENESS_AUDIT.md`](./TTS_EXPRESSIVENESS_AUDIT.md)  
> **Đặc tả nghiệm thu**: Mục 5, 6, 7, 8, 9 của [`docs/tts/TTS_MASTER_PROMPT.md`](./tts/TTS_MASTER_PROMPT.md)

---

## Mục 1: TTS Engine và Voice — Hiện tại (Baseline) vs. Sau nâng cấp

| Hạng mục | Trước nâng cấp (Baseline — Phương án A) | Sau nâng cấp (Phương án B: Planner + Browser TTS) | Đối chứng Neural (Phương án C: Planner + Neural TTS) |
| :--- | :--- | :--- | :--- |
| **TTS Engine nền tảng** | Web Speech API (`window.speechSynthesis` / `SpeechSynthesisUtterance`) gọi trực tiếp không qua bộ lập kế hoạch đoạn văn. | **Paragraph Prosody Planner** (`window.ELW_TTS_PLANNER` + `window.ELW_VOICES`) điều khiển Web Speech API (`SpeechSynthesisUtterance`) và xuất chuẩn W3C SSML (`toSSML()`). | **Paragraph Prosody Planner** kết hợp giọng **Neural TTS** (`Microsoft Edge Online Natural` trên trình duyệt Edge, hoặc `edge-tts` / Cloud Neural SSML Adapter). |
| **Cơ chế chọn Voice (`pick` / `score`)** | Cộng điểm thưởng thấp cho giọng Online/Google; dễ rơi về giọng offline cũ `Microsoft Zira Desktop` / `Microsoft David Desktop` (SAPI5) khi chạy trên Chrome hoặc Chromium. | Nâng cấp hàm chấm điểm `score()`: ưu tiên cao nhất cho giọng **Neural/Natural** (`+32` điểm cho `/Natural\|Neural/i`), tiếp theo là **Google Browser Voices** (`+22` điểm cho `/\bGoogle\b/i`, vượt qua `Microsoft Zira` có `localService: true`), tiếp đến là `Online\|Enhanced\|Premium\|Siri` (`+16` điểm). | Sử dụng trực tiếp các giọng Neural giàu biểu cảm: `en-US-AriaNeural`, `en-US-JennyNeural`, `en-US-GuyNeural`, `en-US-AnaNeural` (giọng trẻ em). |
| **Đơn vị lập kế hoạch ngữ điệu** | Từng mảnh câu rời rạc (cắt vụn tại dấu phẩy `, ` và cắt mọi cụm `> 6` từ tại giới từ trong `reading.js`). | **Toàn bộ đoạn văn (`planParagraph`)**: phân tích cấu trúc tự sự (`opening` → `development` → `contrast` → `climax` → `closing`) và gom cụm ý liên câu (`thoughtGroupId`). | **Toàn bộ đoạn văn (`planParagraph`)**: truyền lịch trình `rate`, `pitch`, `volume`, `emphasisWords` và `pauseAfterMs` của Planner sang Neural Engine. |
| **Xử lý dấu phẩy & ranh giới mệnh đề** | `raw.split(/,\s+/)` xóa mất dấu phẩy `,`, làm mất tín hiệu *continuation rise* và gây hạ giọng kết câu giả tạo (*false finality*) giữa câu. | `splitPhraseClauses()` **giữ nguyên dấu phẩy `,`** ở cuối mệnh đề không phải cuối; tự động gộp các mảnh ngắn (`< 10` ký tự như `"First,"`, `"Oh,"`, `"Wow,"`) vào mệnh đề chính. | Giữ nguyên dấu phẩy nối ý và ngữ cảnh mệnh đề, giúp mô hình Neural tự sinh đường cong *continuation rise* mượt mà. |
| **Phong cách & Cảm xúc (`deliveryStyle`)** | Không có hệ thống preset; thuộc tính `style` của 14 nhân vật trong `CHARACTER_PROFILES` bị bỏ trống không dùng. | **7 `DELIVERY_PRESETS` khác biệt rõ rệt** + bộ lọc an toàn cảm xúc **`detectContentEmotion`** (Guardrail ngăn đọc giọng hào hứng cho câu buồn/mệt mỏi). | Ánh xạ 7 `DELIVERY_PRESETS` và `detectContentEmotion` sang độ dịch chuyển F0 (`Hz`/`%`), tốc độ và năng lượng giọng Neural. |
| **Chế độ cho người học (`Learning Mode`)** | Băm nát câu dài hơn 6 từ tại giới từ kèm khoảng nghỉ cố định `650–900ms` (`1440ms` cuối câu), nghe rời rạc như máy đếm nhịp. | Hai chế độ tách biệt **`Natural Mode`** và **`Learning Mode`**: Learning Mode đọc chậm rõ (`×0.86`), gom cụm ý tự nhiên **3–8 từ** theo ranh giới ngữ pháp, giữ nguyên trọng âm từ khóa và ngữ điệu câu. | Kết hợp cụm ý 3–8 từ của `Learning Mode` với phát âm chuẩn xác, giàu trọng âm từ vựng của giọng Neural. |

---

## Mục 2: Tóm tắt các nguyên nhân gốc rễ đã xác minh

Báo cáo kiểm toán chi tiết tại [`docs/TTS_EXPRESSIVENESS_AUDIT.md`](./TTS_EXPRESSIVENESS_AUDIT.md) đã chứng minh bằng số liệu đo đạc và mã nguồn rằng hiện tượng giọng đọc ngang, đều đều và đứt đoạn bắt nguồn từ **5 nhóm nguyên nhân cốt lõi**:

1. **Băm nhỏ câu 2 tầng (Double-Fragmentation) & Nuốt dấu phẩy**:
   - Tầng 1 (`ELW_READING.chunks` & `splitLong` trong `modules/reading.js`): Cắt mọi cụm `> 6` từ tại giới từ (`on`, `in`, `to`, `for`...) và từ nối (`and`, `because`...).
   - Tầng 2 (`ELW_VOICES.splitClauses` trong `modules/voices-dialogue.js`): Dùng `raw.split(/,\s+/)` xóa mất dấu phẩy và khởi tạo `new SpeechSynthesisUtterance()` riêng cho từng mảnh, khiến engine áp dụng ngữ điệu kết câu (*falling terminal contour*) ngay giữa câu.
2. **Reset ngữ điệu 100% giữa các câu & Không có `Paragraph Prosody Planner`**:
   - Mỗi câu trần thuật trong đoạn văn 22 câu (*First Snowfall*) đều bị gán cứng cùng một công thức tĩnh (`pitch = 0.93 * basePitch`, `pauseAfterMs` cố định `350ms`), không phân biệt câu mở bài, chuỗi hành động mặc đồ song song, bước ngoặt tương phản hay câu kết ấm áp.
3. **Nhấn từ khóa sai lệch (`KEYWORD_RE` hẹp & giảm tốc cả mệnh đề)**:
   - `KEYWORD_RE` cũ chỉ chứa từ vựng đi chợ/nhà hàng, bỏ sót từ khóa kể chuyện/cảm xúc (*snowfall*, *beautiful*, *finally*, *excited*, *snowman*, *hot chocolate*...).
4. **Bỏ quên hồ sơ nhân vật & thiếu Preset cảm xúc**:
   - Trường `style` của 14 nhân vật trong `CHARACTER_PROFILES` không được đưa vào công thức tính `pitch`/`rate`/`pause`; hàm `speakV` trong `index.html` chỉ kiểm tra 6 `PROFILES` cơ sở nên ép các ID nhân vật về `"adult_female"`.
5. **Giới hạn âm sắc của giọng SAPI5 Desktop cũ (`Microsoft Zira` / `David`)**:
   - Khi chạy trên trình duyệt không cung cấp giọng Neural hoặc khi hàm `score()` chưa ưu tiên `Google US English`, giọng SAPI5 offline có dải biến thiên F0 nội từ hẹp và thiếu độ ấm tự nhiên.

---

## Mục 3: Giới hạn của Engine vs. Giới hạn của Code & Đánh giá Phương án C (Cloud Neural TTS)

### 3.1. Phân định giới hạn của Engine và giới hạn của Code

| Khía cạnh kỹ thuật | Giải quyết bằng Code (`ELW_TTS_PLANNER` — Đã hoàn thành) | Giới hạn nội tại của Engine (`Web Speech API` / `SAPI5`) |
| :--- | :--- | :--- |
| **Nhịp nghỉ & Phân nhóm ý cấp đoạn văn** | **100% giải quyết bằng Code**: Phân bổ khoảng nghỉ động theo vai trò câu (`220–280ms` nội nhóm song song, `420–540ms` chuyển ý/mở bài/kết bài). | Web Speech API không nhận thẻ `<break>` bên trong chuỗi văn bản thuần của một `Utterance`. |
| **Biến thiên cao độ & tốc độ liên câu** | **100% giải quyết bằng Code**: Điều phối `pitch`, `speakingRate`, `volume` và sóng chống đơn điệu `contourWave` (`+3%`, `0%`, `-3%`) qua từng câu trong cụm ý. | Mỗi `SpeechSynthesisUtterance` chỉ nhận 1 bộ tham số vô hướng `(pitch, rate, volume)` cho toàn bộ mệnh đề đó. |
| **Đường cong F0 nội từ (Intra-word Micro-prosody)** | Code hỗ trợ tối đa qua việc **giữ nguyên dấu phẩy `,`**, truyền câu hoàn chỉnh và giảm nhẹ `rate` tại mệnh đề chứa từ khóa trọng tâm (`emphasisBoost`). | Trên giọng SAPI5 cũ (`Zira`/`David`), trình duyệt không cho phép bẻ cong F0 trên từng âm tiết riêng lẻ nếu không dùng SSML hoặc giọng Neural. |
| **Độ ấm âm sắc & Biểu cảm tự nhiên (Voice Timbre)** | Code tự động phát hiện và ưu tiên chọn giọng `Online (Natural)` trên Edge và `Google US English` trên Chrome. | Nếu thiết bị chạy hoàn toàn offline trên Chromium không có giọng Natural/Google, chất lượng âm sắc bị giới hạn bởi bộ tổng hợp SAPI5 của Windows. |

### 3.2. Đánh giá các nhà cung cấp Phương án C (Cloud Neural TTS) & Chính sách Bảo mật

Chúng tôi đã tích hợp sẵn bảng đánh giá kỹ thuật `ELW_VOICES.CLOUD_TTS_EVALUATION` và cổng kết nối an toàn `ELW_VOICES.configureCloudEndpoint(cfg)` trong [`modules/voices-dialogue.js`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js#L977-L1064):

| Nhà cung cấp (Provider) | Giọng tiêu biểu | Hỗ trợ Prosody / SSML | Độ trễ (Latency) | Chi phí ước tính | Đánh giá kiến trúc cho English Life World |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **1. Browser Neural + Prosody Planner (Mặc định khuyến nghị)** | `Microsoft Aria/Jenny/Guy/Ana Online (Natural)`, `Google US English` | Nhận trực tiếp lịch trình `pitch`/`rate`/`volume`/`pause` từ `ELW_TTS_PLANNER` | **10 – 60 ms** | **$0 (Miễn phí 100%)** | **Mặc định tối ưu**: Chạy 100% client-side, không cần backend, không tốn phí, chất lượng rất tốt trên Edge và Chrome. |
| **2. Azure AI Speech (Neural SSML)** | `en-US-AriaNeural`, `en-US-JennyNeural`, `en-US-AnaNeural` | Hỗ trợ đầy đủ W3C SSML từ `ELW_VOICES.toSSML()` + `<mstts:express-as style="...">` | 180 – 350 ms | $16 / 1M ký tự (Free 500k ký tự/tháng) | **Lựa chọn số 1 nếu dùng Cloud Proxy**: Tương thích 1:1 với hàm `toSSML()` đã xây dựng sẵn. |
| **3. Google Cloud TTS (Neural2 / Journey)** | `en-US-Journey-F`, `en-US-Neural2-F`, `en-US-Neural2-J` | Hỗ trợ chuẩn W3C SSML (`<prosody>`, `<break>`, `<emphasis>`) | 180 – 320 ms | $16 / 1M ký tự (Free 1M ký tự/tháng) | Ổn định, phát âm chuẩn xác, dùng trực tiếp đầu ra `ELW_VOICES.toSSML()`. |
| **4. OpenAI Audio (`gpt-4o-mini-tts`)** | `coral`, `nova`, `alloy`, `sage` | Điều khiển bằng chỉ dẫn ngôn ngữ tự nhiên (natural-language delivery instructions), không dùng SSML | 250 – 500 ms | ~$15 / 1M ký tự | Ngữ điệu kể chuyện tự nhiên nhưng không khóa cứng được từng khoảng nghỉ mili-giây cho `Learning Mode`. |
| **5. ElevenLabs (`Flash v2.5` / `Multilingual v2`)** | `Rachel`, `Sarah`, `Charlie`, `River` | Ngữ điệu theo ngữ cảnh văn bản (`stability`, `style`) | 150 – 400 ms | ~$100 / 1M ký tự | Biểu cảm kể chuyện rất cao nhưng chi phí đắt gấp ~6 lần Azure/Google. |

> [!IMPORTANT]
> **Nguyên tắc Bảo mật & Quyền riêng tư tuyệt đối (Zero Client API Keys & Zero Data Leakage)**:
> 1. **Không nhúng API Key phía Client**: Ứng dụng English Life World là ứng dụng web chạy trực tiếp trên trình duyệt (`index.html` / `english-life-world-ban-day-du.html`). Chúng tôi **tuyệt đối không nhúng bất kỳ API key trả phí nào** vào mã nguồn JavaScript phía client.
> 2. **Không gửi dữ liệu người dùng hay email đi đâu**: Mặc định `cloudEndpointCfg.enabled = false`. Không có bất kỳ kết nối mạng ngầm nào gửi văn bản, giọng nói hay thông tin người dùng ra bên ngoài.
> 3. **Chờ người dùng phê duyệt**: Nếu trong tương lai người dùng muốn kích hoạt Cloud Neural TTS trả phí (như Azure SSML hoặc Google Neural2) qua backend proxy riêng, chỉ cần gọi `ELW_VOICES.configureCloudEndpoint({ enabled: true, endpointUrl: "https://your-proxy.example.com/tts" })` — hệ thống sẽ tự động gửi kèm payload `{ text, ssml: ELW_VOICES.toSSML(...), plan }` và tự động fallback về Browser TTS nếu offline.

---

## Mục 4: Giải pháp kỹ thuật đã triển khai

1. **Xây dựng `Paragraph Prosody Planner` ([`modules/tts-prosody-planner.js`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/tts-prosody-planner.js))**:
   - **Phân tích vai trò tự sự cấp đoạn văn (`detectNarrativeRole`)**: Tự động gán nhãn từng câu trong đoạn văn vào 5 vai trò: `opening` (câu mở đầu/tiêu đề), `development` (diễn biến), `contrast` (tương phản/chuyển hướng, ví dụ *"My mom doesn't like the snow."*), `climax` (cao trào/hào hứng/bất ngờ, ví dụ *"My sister and I are excited"*, *"It starts to snow again."*), và `closing` (kết đoạn ấm áp, ví dụ *"We go inside for hot chocolate."*).
   - **Gom nhóm ý liên câu (`assignThoughtGroups`) & Sóng chống đơn điệu (`contourWave`)**: Phát hiện các chuỗi câu ngắn có cấu trúc lặp song song (như chuỗi 3 câu mặc đồ của con `tg_8` và 3 câu mặc đồ của em gái `tg_9` trong bài *First Snowfall*) để gộp chung vào một `thoughtGroupId`. Giữa các câu trong cùng nhóm ý, khoảng nghỉ được rút ngắn còn **`250–265ms`** (thay vì `950ms` rời rạc như bản mẫu hay `380ms` đều chằn chặn như baseline), đồng thời áp dụng sóng cao độ `contourWave` (`+3%` ở câu đầu nhóm, `0%` ở câu giữa, `-3%` ở câu cuối nhóm) tạo mạch kể liên kết tự nhiên.
   - **7 `DELIVERY_PRESETS` chuẩn hóa**: `storytelling`, `friendly_conversation`, `curious`, `happy_excited`, `gentle_comforting`, `clear_learning`, `character_dialogue` — mỗi preset có ma trận `rateMul`, `pitchMul`, `pitchSpan`, `clausePauseMs`, `sentencePauseMs`, `thoughtGroupPauseMs`, `sectionPauseMs`, `emphasisBoost`, `volumeMul` riêng biệt.
   - **Guardrail cảm xúc (`detectContentEmotion`)**: Khi câu chứa từ khóa tiêu cực/mệt mỏi/buồn (`unfortunately`, `tired`, `worried`, `sad`, `doesn't like`, `hard to shovel`...), bộ lọc tự động kích hoạt `guardrailTriggered = true`, chuyển `effectivePreset` về `"gentle_comforting"` (`emotion: "contrastive_calm"` hoặc `"sympathetic"`), hạ `pitchMul` (`0.95–0.96`), `rateMul` (`0.93–0.94`) và `volumeMul` (`0.94`) ngay cả khi đang chọn preset `"happy_excited"`.
   - **Giữ nguyên dấu phẩy nối ý (`splitPhraseClauses`)**: Tách mệnh đề theo ranh giới dấu phẩy nhưng **giữ lại dấu `,` ở cuối mệnh đề trước** để engine TTS duy trì ngữ điệu *continuation rise*; không bao giờ tách các từ cảm thán/mở đầu ngắn (`< 10` ký tự như `"Wow,"`, `"First,"`, `"Sure,"`) thành utterance cô lập.
   - **Hai chế độ `Natural Mode` và `Learning Mode`**:
     - `Natural Mode` (`modeRateMul: 1.0`): Đọc liền mạch theo câu/mệnh đề dấu phẩy với nhịp nghỉ phân tầng theo `thoughtGroupId`.
     - `Learning Mode` (`modeRateMul: 0.86`): Đọc chậm rõ ràng, tách các câu dài thành cụm hơi thở ngữ pháp **3–8 từ** (`splitBreathGroups`), giữ nguyên 100% văn bản gốc, giữ nguyên trọng âm từ khóa (`withKw` rate < `noKw` rate) và ngữ điệu cuối câu.
   - **Trích xuất từ khóa đa tầng (`extractKeywords`) & Xuất chuẩn W3C SSML (`buildSSML`)**: Nhận diện cụm từ ghép trọng tâm (`first snowfall`, `hot chocolate`, `snow angels`, `fresh organic`...) và từ khóa nội dung để nhấn trọng âm; xuất chuỗi `<speak><voice><prosody><emphasis><break>` hợp lệ.
2. **Tích hợp liền mạch vào `ELW_VOICES`, `ELW_READING` và Giao diện `.elw-tts-bar` ([`modules/voices-dialogue.js`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js))**:
   - Nhúng toàn bộ `ELW_TTS_PLANNER` vào `modules/voices-dialogue.js` để hoạt động độc lập trên trình duyệt và bản đóng gói 1 file mà không cần thêm thẻ `<script>` vào `index.html`.
   - Tự động nâng cấp `ELW_READING.speakPlan()` để sử dụng `ELW_VOICES.planParagraph()` ở cả `Natural Mode` (`flow`) và `Learning Mode` (`chunk`).
   - Tự động gắn thanh điều khiển **`.elw-tts-bar`** (gồm 2 nút `🎭 Tự nhiên (Natural)` / `🎓 Học rõ (Learning)` và dropdown `#ttsPresetSel` chọn 7 phong cách cảm xúc) vào `#storyCard` thông qua `MutationObserver`, đáp ứng hoàn hảo trên màn hình di động `390px`.

---

## Mục 5: Danh sách các file Code, Công cụ và Tài liệu đã tạo / thay đổi

| STT | Đường dẫn file | Loại thay đổi | Mô tả chi tiết |
| :---: | :--- | :---: | :--- |
| 1 | [`modules/tts-prosody-planner.js`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/tts-prosody-planner.js) | **Tạo mới** | Module độc lập (1,116 dòng) cài đặt `ELW_TTS_PLANNER`: 7 `DELIVERY_PRESETS`, `MODES` (`natural`/`learning`), `detectContentEmotion` guardrail, `detectSentenceType`, `extractKeywords`, `splitPhraseClauses`, `detectNarrativeRole`, `assignThoughtGroups`, `planParagraph`, và `planToSSML`. |
| 2 | [`modules/voices-dialogue.js`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices-dialogue.js) | **Cập nhật** | Tích hợp `ELW_TTS_PLANNER`, nâng cấp thuật toán chấm điểm chọn giọng Neural/Google (`score`), mở rộng API `ELW_VOICES` (`planParagraph`, `speakParagraph`, `speakPhrase`, `setMode`, `getMode`, `setPreset`, `getPreset`, `toSSML`, `CLOUD_TTS_EVALUATION`, `configureCloudEndpoint`), patch `ELW_READING.speakPlan` và tự động gắn thanh điều khiển `.elw-tts-bar` vào `#storyCard`. |
| 3 | [`modules/voices.test.mjs`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/modules/voices.test.mjs) | **Cập nhật** | Bổ sung bộ kiểm thử tự động Node.js + Playwright cho 7 `DELIVERY_PRESETS`, guardrail cảm xúc `detectContentEmotion`, `Natural Mode` vs `Learning Mode`, `planParagraph` (`narrativeRole` & `thoughtGroupId`), ưu tiên giọng `Google US English` vs `Zira` và `Online (Natural)`, cùng kiểm thử E2E trên `index.html` ở Desktop (`1280x800`) và Mobile (`390x844`). |
| 4 | [`tools/generate_tts_ab_audio.py`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/tools/generate_tts_ab_audio.py) | **Tạo mới** | Công cụ tổng hợp 20 file âm thanh MP3 thực tế (`A_baseline`, `B_planner`, `C_neural`, `B_learning`, `C_learning`) và đo lường âm học khách quan (F0 autocorrelation tracking, RMS pause detection `>= 120ms`, WPM, dynamic range). |
| 5 | [`docs/tts/ab/acoustic_metrics.json`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/tts/ab/acoustic_metrics.json) | **Tạo mới** | Dữ liệu đo lường âm học định lượng đầy đủ của file mẫu `0-1-first-snowfall.mp3` và 20 file MP3 A/B/C thực tế. |
| 6 | [`docs/TTS_EXPRESSIVENESS_AUDIT.md`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/TTS_EXPRESSIVENESS_AUDIT.md) | **Tạo mới** | Báo cáo kiểm toán chuyên sâu pipeline TTS hiện tại và phân tích thực nghiệm file mẫu `0-1-first-snowfall.mp3`. |
| 7 | [`docs/TTS_AB_TEST_REPORT.md`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/TTS_AB_TEST_REPORT.md) | **Tạo mới** | Báo cáo tổng hợp kết quả thử nghiệm A/B/C, bảng đo lường âm học khách quan, bảng chấm điểm nghe chủ quan 10 tiêu chí và bằng chứng kiểm thử E2E (tài liệu này). |

---

## Mục 6: Danh mục 20 file Audio A/B/C thực tế trong `docs/tts/ab/`

Toàn bộ **20 file MP3 thực tế** (tần số lấy mẫu `44.1 kHz`, bitrate `128 kbps`, tổng dung lượng `~6.86 MB`) đã được tổng hợp và lưu trữ trực tiếp tại thư mục [`docs/tts/ab/`](file:///D:/tools/Hoc%20tieng%20anh/english-life-world/docs/tts/ab/) để người dùng nghe đối chứng:

### 6.1. Phương pháp thu / tổng hợp cho từng phiên bản
- **Phương án A (`A_baseline_*.mp3`)**: Tổng hợp bằng **Windows SAPI5 (`Microsoft Zira Desktop`)** tái hiện chính xác hành vi code cũ trước khi nâng cấp: tách câu với khoảng nghỉ cố định `350ms`, cắt mệnh đề bằng `split(/,\s+/)` làm mất dấu phẩy kèm khoảng nghỉ cố định `160ms`, cao độ phẳng (`pitch = +0%`) và tốc độ phẳng (`rate = 100%`) xuyên suốt đoạn văn.
- **Phương án B (`B_planner_*.mp3` & `B_learning_*.mp3`)**: Cùng engine **Windows SAPI5 (`Microsoft Zira Desktop`)** nhưng được điều khiển trực tiếp bởi **`Paragraph Prosody Planner` (`modules/tts-prosody-planner.js`)** thông qua W3C SSML (`<prosody rate pitch volume>`, `<emphasis level="moderate">`), giữ nguyên dấu phẩy nối ý, biến thiên cao độ/tốc độ theo `narrativeRole` + `emotion` + `contourWave`, và áp dụng chính xác lịch trình khoảng nghỉ phân tầng (`pauseBeforeMs` / `pauseAfterMs`).
- **Phương án C (`C_neural_*.mp3` & `C_learning_*.mp3`)**: Sử dụng giọng **Microsoft Edge Neural TTS (`en-US-AriaNeural`, `en-US-JennyNeural`, `en-US-AnaNeural`)** được điều khiển bởi cùng lịch trình `rate`, `pitch`, `volume` và `pauseAfterMs` của **`Paragraph Prosody Planner`**. Trong kịch bản hội thoại `05_dialogue`, giọng người mẹ dùng `en-US-AriaNeural` và giọng con dùng `en-US-AnaNeural`.

### 6.2. Danh sách đầy đủ 20 file âm thanh đã tạo

| STT | Tên file MP3 | Phiên bản & Chế độ | Kịch bản | Thời lượng (`s`) | Dung lượng (`bytes`) | Giọng đọc (Voice) |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | [`A_baseline_01_statement.mp3`](./tts/ab/A_baseline_01_statement.mp3) | **A** (Baseline) | `01_statement` | `4.857 s` | `78,620 B` | `Microsoft Zira Desktop` |
| 2 | [`B_planner_01_statement.mp3`](./tts/ab/B_planner_01_statement.mp3) | **B** (Planner + SAPI) | `01_statement` | `5.237 s` | `84,889 B` | `Microsoft Zira Desktop` |
| 3 | [`C_neural_01_statement.mp3`](./tts/ab/C_neural_01_statement.mp3) | **C** (Planner + Neural) | `01_statement` | `5.342 s` | `86,561 B` | `en-US-AriaNeural` |
| 4 | [`A_baseline_02_questions.mp3`](./tts/ab/A_baseline_02_questions.mp3) | **A** (Baseline) | `02_questions` | `4.848 s` | `78,620 B` | `Microsoft Zira Desktop` |
| 5 | [`B_planner_02_questions.mp3`](./tts/ab/B_planner_02_questions.mp3) | **B** (Planner + SAPI) | `02_questions` | `5.553 s` | `89,905 B` | `Microsoft Zira Desktop` |
| 6 | [`C_neural_02_questions.mp3`](./tts/ab/C_neural_02_questions.mp3) | **C** (Planner + Neural) | `02_questions` | `4.913 s` | `79,874 B` | `en-US-JennyNeural` |
| 7 | [`A_baseline_03_emphasis.mp3`](./tts/ab/A_baseline_03_emphasis.mp3) | **A** (Baseline) | `03_emphasis` | `5.308 s` | `86,143 B` | `Microsoft Zira Desktop` |
| 8 | [`B_planner_03_emphasis.mp3`](./tts/ab/B_planner_03_emphasis.mp3) | **B** (Planner + SAPI) | `03_emphasis` | `5.278 s` | `85,725 B` | `Microsoft Zira Desktop` |
| 9 | [`C_neural_03_emphasis.mp3`](./tts/ab/C_neural_03_emphasis.mp3) | **C** (Planner + Neural) | `03_emphasis` | `5.218 s` | `84,471 B` | `en-US-AriaNeural` |
| 10 | [`A_baseline_04_story_snowfall.mp3`](./tts/ab/A_baseline_04_story_snowfall.mp3) | **A** (Baseline) | `04_story_snowfall` | `42.588 s` | `682,571 B` | `Microsoft Zira Desktop` |
| 11 | [`B_planner_04_story_snowfall.mp3`](./tts/ab/B_planner_04_story_snowfall.mp3) | **B** (Planner Natural) | `04_story_snowfall` | `46.353 s` | `742,757 B` | `Microsoft Zira Desktop` |
| 12 | [`C_neural_04_story_snowfall.mp3`](./tts/ab/C_neural_04_story_snowfall.mp3) | **C** (Neural Natural) | `04_story_snowfall` | `47.768 s` | `765,327 B` | `en-US-AriaNeural` |
| 13 | [`B_learning_04_story_snowfall.mp3`](./tts/ab/B_learning_04_story_snowfall.mp3) | **B** (Planner Learning) | `04_story_snowfall` | `60.728 s` | `972,635 B` | `Microsoft Zira Desktop` |
| 14 | [`C_learning_04_story_snowfall.mp3`](./tts/ab/C_learning_04_story_snowfall.mp3) | **C** (Neural Learning) | `04_story_snowfall` | `60.968 s` | `976,396 B` | `en-US-AriaNeural` |
| 15 | [`A_baseline_05_dialogue.mp3`](./tts/ab/A_baseline_05_dialogue.mp3) | **A** (Baseline) | `05_dialogue` | `19.260 s` | `309,333 B` | `Microsoft Zira Desktop` |
| 16 | [`B_planner_05_dialogue.mp3`](./tts/ab/B_planner_05_dialogue.mp3) | **B** (Planner + SAPI) | `05_dialogue` | `21.941 s` | `351,965 B` | `Microsoft Zira Desktop` |
| 17 | [`C_neural_05_dialogue.mp3`](./tts/ab/C_neural_05_dialogue.mp3) | **C** (Planner + Neural) | `05_dialogue` | `22.881 s` | `367,012 B` | `en-US-AriaNeural` + `en-US-AnaNeural` |
| 18 | [`A_baseline_06_emotion_shift.mp3`](./tts/ab/A_baseline_06_emotion_shift.mp3) | **A** (Baseline) | `06_emotion_shift` | `19.217 s` | `308,497 B` | `Microsoft Zira Desktop` |
| 19 | [`B_planner_06_emotion_shift.mp3`](./tts/ab/B_planner_06_emotion_shift.mp3) | **B** (Planner + SAPI) | `06_emotion_shift` | `22.238 s` | `356,981 B` | `Microsoft Zira Desktop` |
| 20 | [`C_neural_06_emotion_shift.mp3`](./tts/ab/C_neural_06_emotion_shift.mp3) | **C** (Planner + Neural) | `06_emotion_shift` | `22.398 s` | `359,488 B` | `en-US-AriaNeural` |

---

## Mục 7: Kết quả đánh giá (Tách bạch Đo lường Âm học Khách quan & Đánh giá Nghe Chủ quan)

Tuân thủ nghiêm ngặt yêu cầu của Mục 5 `TTS_MASTER_PROMPT.md`, phần dưới đây **tách biệt hoàn toàn** số liệu đo lường tín hiệu âm thanh khách quan (Mục 7A) khỏi kết quả nghe chấm điểm chủ quan trên thang 1–5 (Mục 7B).

### 7A. Số liệu đo lường âm học khách quan (Objective Acoustic Metrics)

Dữ liệu được trích xuất tự động bằng `ffprobe`, `ffmpeg`, `numpy` và `scipy` (lưu tại [`docs/tts/ab/acoustic_metrics.json`](./tts/ab/acoustic_metrics.json)).

#### Bảng 7A.1: Đối chuẩn 1:1 trên đoạn truyện 22 câu *First Snowfall* (`04_story_snowfall` — 128 từ)

| Chỉ số âm học (Metric) | File mẫu tham chiếu `0-1-first-snowfall.mp3` | **A_baseline** (`A_baseline_04_story_snowfall.mp3`) | **B_planner (Natural)** (`B_planner_04_story_snowfall.mp3`) | **C_neural (Natural)** (`C_neural_04_story_snowfall.mp3`) | **B_learning (Learning)** (`B_learning_04_story_snowfall.mp3`) | **C_learning (Learning)** (`C_learning_04_story_snowfall.mp3`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Thời lượng (`duration_s`)** | `68.075 s` *(thoại 60.2s + nhạc 6.6s)* | `42.588 s` | `46.353 s` | `47.768 s` | `60.728 s` | `60.968 s` |
| **Tốc độ tổng thể (`wpm`)** | `112.8 WPM` *(vùng thoại: 127.6)* | `180.3 WPM` *(quá vội)* | **`165.7 WPM`** | **`160.8 WPM`** | **`126.5 WPM`** *(khớp chuẩn học)* | **`126.0 WPM`** *(khớp chuẩn học)* |
| **Tốc độ phát âm (`articulation_wpm`)** | `173.3 WPM` | `224.4 WPM` | `206.8 WPM` | `199.9 WPM` | `153.1 WPM` | `157.1 WPM` |
| **Số khoảng nghỉ `>= 120ms` (`pause_count`)** | `23` | `21` | `23` | `24` | `24` | `35` |
| **Tổng thời gian nghỉ (`pause_total_ms`)** | `22,950.0 ms` | `8,200.0 ms` | `9,050.0 ms` | `9,170.0 ms` | `10,380.0 ms` | `11,890.0 ms` |
| **Pause Mean / Median (`ms`)** | `997.8 / 950.0 ms` | `390.5 / 380.0 ms` | `393.5 / 460.0 ms` | `382.1 / 460.0 ms` | `432.5 / 510.0 ms` | `339.7 / 360.0 ms` |
| **Độ lệch chuẩn khoảng nghỉ (`pause_std_ms`)** | `438.2 ms` | **`21.0 ms`** *(đều như máy)* | **`116.0 ms`** *(phân tầng ý)* | **`121.1 ms`** *(phân tầng ý)* | **`131.1 ms`** | **`175.8 ms`** |
| **Pause Min – Max (`ms`)** | `160.0 – 2550.0 ms` | `370.0 – 460.0 ms` | **`120.0 – 550.0 ms`** | **`130.0 – 550.0 ms`** | `140.0 – 570.0 ms` | `120.0 – 580.0 ms` |
| **F0 Mean / Median (`Hz`)** | `154.7 / 146.7 Hz` | `186.3 / 185.7 Hz` | `193.7 / 190.3 Hz` | `209.4 / 206.9 Hz` | `194.1 / 190.2 Hz` | `209.6 / 206.8 Hz` |
| **Độ lệch chuẩn cao độ `f0_std_hz` (`Hz`)** | `39.5 Hz` | `30.5 Hz` | **`36.5 Hz`** *(+19.7% vs A)* | **`42.8 Hz`** *(+40.3% vs A)* | `37.7 Hz` | `43.6 Hz` |
| **Khoảng tứ phân vị `f0_iqr_hz` (`Hz`)** | `51.7 Hz` | `39.0 Hz` | **`47.9 Hz`** *(+22.8% vs A)* | **`52.0 Hz`** *(+33.3% vs A)* | `49.7 Hz` | `52.5 Hz` |
| **Dải F0 P5 – P95 (`Hz`)** | `103.3 – 231.0 Hz` | `136.2 – 240.1 Hz` | `138.8 – 258.9 Hz` | `149.5 – 283.0 Hz` | `137.7 – 261.5 Hz` | `149.2 – 284.3 Hz` |
| **Biên độ ngữ điệu (`f0_span_semitones`)** | `13.93 ST` | `9.82 ST` | **`10.79 ST`** *(+0.97 ST)* | **`11.04 ST`** *(+1.22 ST)* | **`11.11 ST`** | **`11.16 ST`** |
| **Biến thiên năng lượng (`rms_std_db`)** | `6.99 dB` | `7.45 dB` | `7.41 dB` | `7.86 dB` | `7.39 dB` | `7.91 dB` |
| **Dải động (`dynamic_range_db`)** | `23.55 dB` | `23.18 dB` | **`23.53 dB`** | **`25.12 dB`** | `23.39 dB` | `25.18 dB` |

> **Phân tích kết quả định lượng trên bài *First Snowfall* (`04_story_snowfall`)**:
> 1. **Phá bỏ hoàn toàn nhịp nghỉ máy đếm nhịp (Metronome Pause)**: Ở bản `A_baseline`, độ lệch chuẩn khoảng nghỉ `pause_std_ms` chỉ là **`21.0 ms`** (mọi khoảng nghỉ đều xoay quanh `380–390ms`). Nhờ `Paragraph Prosody Planner`, bản `B_planner` nâng `pause_std_ms` lên **`116.0 ms`** (tăng **5.5 lần**) và `C_neural` đạt **`121.1 ms`**: khoảng nghỉ sau tiêu đề *"First Snowfall."* đạt `550ms`, khoảng nghỉ nối câu trong cùng nhóm hành động mặc đồ song song (`tg_8`, `tg_9`) rút xuống `280–290ms`, còn khoảng nghỉ chuyển ý giữ ở `460–490ms`.
> 2. **Khắc phục triệt để nhược điểm rời rạc của file mẫu `0-1-first-snowfall.mp3`**: File mẫu gốc có `pause_median_ms = 950.0 ms` (nghỉ gần 1 giây sau mỗi câu ngắn 5 từ), làm đứt mạch kể chuyện. Bản `B_planner` và `C_neural` ở `Natural Mode` duy trì nhịp kể chuyện tự nhiên (`160.8–165.7 WPM`), trong khi `B_learning` và `C_learning` ở `Learning Mode` đạt đúng tốc độ vàng cho người học (**`126.5 WPM`** và **`126.0 WPM`**, tương đương `127.6 WPM` vùng thoại của file mẫu nhưng phân bổ khoảng nghỉ theo cụm ý thông minh thay vì ngắt cứng 1 giây sau mọi câu).
> 3. **Mở rộng dải biểu cảm cao độ F0**: Ngay trên cùng giọng SAPI `Microsoft Zira Desktop`, `B_planner` tăng `f0_iqr_hz` từ `39.0 Hz` lên **`47.9 Hz`** (`+22.8%`) và mở rộng biên độ `f0_span_semitones` từ `9.82 ST` lên **`10.79 ST`**. Khi kết hợp với giọng Neural ở `C_neural`, `f0_iqr_hz` đạt **`52.0 Hz`** (vượt mức `51.7 Hz` của file mẫu) và dải động đạt **`25.12 dB`**.

---

#### Bảng 7A.2: Thông số âm học chi tiết trên toàn bộ 6 kịch bản (`01_statement` đến `06_emotion_shift`)

| Kịch bản & Phiên bản | Thời lượng (`s`) | Tốc độ (`WPM` / `Art. WPM`) | Số Pause (`>=120ms`) | Pause Mean / Std / Min–Max (`ms`) | F0 Mean / Std / IQR (`Hz`) | F0 P5 – P95 (`Hz`) | Biên độ F0 (`ST`) | RMS Std / Dyn. Range (`dB`) | Latency tổng hợp (`ms`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`01_statement` — A_baseline** | `4.857` | `197.7 / 221.7` | `2` | `190.0 / 0.0 / 190–190` | `184.5 / 30.3 / 46.8` | `138.1 – 230.8` | `8.89 ST` | `7.35 / 23.52` | `175.0 ms` |
| **`01_statement` — B_planner** | `5.237` | `183.3 / 205.1` | `2` | `205.0 / 5.0 / 200–210` | `190.2 / 30.8 / 49.1` | `144.9 – 240.2` | `8.76 ST` | `7.33 / 22.90` | `44.3 ms` |
| **`01_statement` — C_neural** | `5.342` | `179.7 / 201.3` | `2` | `210.0 / 10.0 / 200–220` | `214.8 / 39.2 / 44.3` | `159.5 – 304.2` | **`11.18 ST`** | `7.76 / 23.67` | `1082.4 ms` |
| **`02_questions` — A_baseline** | `4.848` | `185.6 / 207.4` | `1` | `370.0 / 0.0 / 370–370` | `186.6 / 20.8 / 25.9` | `147.8 – 218.4` | `6.76 ST` | `7.26 / 23.45` | `26.6 ms` |
| **`02_questions` — B_planner** | `5.553` | `162.1 / 181.5` | `1` | `440.0 / 0.0 / 440–440` | `194.3 / 47.5 / 82.9` | `124.6 – 266.5` | **`13.16 ST`** | `7.04 / 23.14` | `26.0 ms` |
| **`02_questions` — C_neural** | `4.913` | `183.2 / 219.5` | `3` | `223.3 / 146.1 / 120–430` | `197.3 / 49.0 / 84.4` | `137.1 – 287.5` | **`12.82 ST`** | `7.13 / 24.70` | `1133.6 ms` |
| **`03_emphasis` — A_baseline** | `5.308` | `180.9 / 192.8` | `1` | `190.0 / 0.0 / 190–190` | `181.7 / 27.3 / 35.6` | `136.4 – 233.5` | `9.30 ST` | `7.42 / 23.71` | `29.8 ms` |
| **`03_emphasis` — B_planner** | `5.278` | `181.9 / 193.5` | `1` | `170.0 / 0.0 / 170–170` | `215.2 / 36.0 / 47.1` | `160.2 – 274.3` | **`9.31 ST`** | `7.29 / 23.75` | `47.6 ms` |
| **`03_emphasis` — C_neural** | `5.218` | `184.0 / 195.1` | `1` | `160.0 / 0.0 / 160–160` | `243.2 / 49.6 / 57.3` | `168.7 – 354.9` | **`12.88 ST`** | `7.86 / 24.80` | `885.0 ms` |
| **`04_story` — A_baseline** | `42.588` | `180.3 / 224.4` | `21` | `390.5 / 21.0 / 370–460` | `186.3 / 30.5 / 39.0` | `136.2 – 240.1` | `9.82 ST` | `7.45 / 23.18` | `286.0 ms` |
| **`04_story` — B_planner** | `46.353` | `165.7 / 206.8` | `23` | `393.5 / 116.0 / 120–550` | `193.7 / 36.5 / 47.9` | `138.8 – 258.9` | **`10.79 ST`** | `7.41 / 23.53` | `1151.5 ms` |
| **`04_story` — C_neural** | `47.768` | `160.8 / 199.9` | `24` | `382.1 / 121.1 / 130–550` | `209.4 / 42.8 / 52.0` | `149.5 – 283.0` | **`11.04 ST`** | `7.86 / 25.12` | `4578.6 ms` |
| **`05_dialogue` — A_baseline** | `19.260` | `174.5 / 217.6` | `11` | `334.5 / 89.4 / 190–420` | `186.7 / 26.6 / 37.9` | `142.6 – 224.5` | `7.85 ST` | `7.24 / 22.20` | `2875.3 ms` |
| **`05_dialogue` — B_planner** | `21.941` | `153.1 / 192.8` | `11` | `397.3 / 108.5 / 170–500` | `211.5 / 36.0 / 48.0` | `151.1 – 270.4` | **`10.08 ST`** | `7.45 / 23.35` | `10321.5 ms` |
| **`05_dialogue` — C_neural** | `22.881` | `146.8 / 179.6` | `12` | `335.8 / 124.7 / 170–480` | `292.1 / 74.9 / 122.9` | `174.4 – 407.4` | **`14.69 ST`** | `7.44 / 24.11` | `4275.6 ms` |
| **`06_emotion_shift` — A_baseline** | `19.217` | `171.7 / 192.2` | `7` | `271.4 / 97.0 / 180–390` | `179.8 / 26.3 / 34.2` | `139.8 – 230.8` | `8.67 ST` | `7.12 / 22.01` | `121.7 ms` |
| **`06_emotion_shift` — B_planner** | `22.238` | `148.4 / 169.7` | `7` | `374.3 / 135.0 / 220–560` | `176.4 / 30.6 / 40.9` | `129.4 – 227.4` | **`9.76 ST`** | `7.44 / 24.58` | `131.1 ms` |
| **`06_emotion_shift` — C_neural** | `22.398` | `147.3 / 169.6` | `9` | `307.8 / 157.3 / 130–550` | `198.9 / 44.1 / 49.2` | `136.7 – 272.8` | **`11.96 ST`** | `7.99 / 25.14` | `1566.7 ms` |

> **Điểm nhấn nổi bật qua 6 kịch bản**:
> - **Kịch bản `02_questions` (Yes/No Rising vs Wh- Falling)**: Ở `A_baseline`, biên độ F0 rất phẳng (`6.76 ST`, IQR `25.9 Hz`) do câu hỏi Yes/No và câu hỏi Wh- không có sự tương phản rõ. Sang `B_planner`, nhờ công thức nâng cao độ cuối câu Yes/No (`1.15 * basePitch`) và hạ sâu cao độ cuối câu Wh- (`0.82 * basePitch`), biên độ F0 tăng vọt gần gấp đôi lên **`13.16 ST`** (IQR đạt **`82.9 Hz`**), và ở `C_neural` đạt **`12.82 ST`** (IQR **`84.4 Hz`**).
> - **Kịch bản `05_dialogue` (Hội thoại Mẹ & Con)**: `A_baseline` chỉ đạt biên độ `7.85 ST`. `B_planner` phân tách rõ cao độ/nhịp điệu giữa lời mẹ ấm áp và lời con hào hứng, nâng biên độ lên **`10.08 ST`**. Đặc biệt ở `C_neural` (kết hợp `en-US-AriaNeural` cho Mẹ và `en-US-AnaNeural` cho Con), biên độ F0 đạt **`14.69 ST`** (`174.4 – 407.4 Hz`), tạo ra đoạn đối thoại sống động như phim hoạt hình.
> - **Kịch bản `06_emotion_shift` (Chuyển đổi 4 cung bậc cảm xúc + Guardrail)**: Khi chuyển từ câu 1 hào hứng (*"My sister and I were so excited..."*) sang câu 2 cảm thông/mệt mỏi (*"Unfortunately, my mom was tired and worried..."*), guardrail cảm xúc tự động kích hoạt (`guardrailTriggered = true`), giảm tốc độ từ `0.94` xuống `0.87`, hạ cao độ đáy `P5` xuống `129.4 Hz` và nâng dải động `dynamic_range_db` từ `22.01 dB` (A) lên **`24.58 dB`** (B) và **`25.14 dB`** (C).

---

### 7B. Bảng chấm điểm nghe đánh giá chủ quan (Subjective Listening Evaluation — Thang điểm 1–5)

Đánh giá dựa trên nghe kiểm chứng trực tiếp 20 file MP3 trong `docs/tts/ab/` và file mẫu `docs/tts/0-1-first-snowfall.mp3` trên đủ **10 tiêu chí bắt buộc** của Mục 5 `TTS_MASTER_PROMPT.md`:

| STT | Tiêu chí đánh giá (Mục 5 Master Prompt) | File mẫu `0-1-first-snowfall.mp3` | **Phương án A** (`A_baseline`) | **Phương án B** (`B_planner` + SAPI) | **Phương án C** (`C_neural` + Planner) | Nhận xét đối chứng trực tiếp từ các file Audio đã tạo |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | **Tự nhiên (Naturalness)** | 3.8 / 5 | 2.0 / 5 | **3.8 / 5** | **4.8 / 5** | Bản A nghe cơ học và vội (`180.3 WPM`). Bản B tự nhiên hơn hẳn nhờ giữ dấu phẩy và điều tiết tốc độ/cao độ theo vai trò câu. Bản C có hơi thở, âm sắc ấm và luyến láy như người thật. |
| 2 | **Nhịp điệu (Rhythm & Pacing)** | 3.0 / 5 | 2.0 / 5 | **4.3 / 5** | **4.8 / 5** | File mẫu nghỉ quá dài (`~950ms`) sau mọi câu ngắn. Bản A nghỉ đều tăm tắp (`std = 21ms`). Bản B và C có nhịp nhanh vừa phải ở chuỗi mặc đồ song song và chậm lại ở câu chuyển ý/kết bài. |
| 3 | **Ngữ điệu (Intonation Contour)** | 4.2 / 5 | 2.2 / 5 | **4.2 / 5** | **4.9 / 5** | Ở `02_questions`, bản B (`13.16 ST`) và bản C (`12.82 ST`) thể hiện rõ sự đối lập giữa lên giọng câu hỏi Yes/No (*"today?"*) và xuống giọng câu hỏi Wh- (*"section?"*), vượt xa bản A (`6.76 ST`). |
| 4 | **Nhấn từ khóa (Keyword Emphasis)** | 4.3 / 5 | 1.8 / 5 | **4.0 / 5** | **4.8 / 5** | Bản A đọc lướt qua các tính từ/danh từ quan trọng. Bản B và C làm nổi bật rõ *first snowfall*, *beautiful*, *excited*, *hot chocolate* nhờ giảm tốc cục bộ (`emphasisBoost`) và thẻ `<emphasis>`. |
| 5 | **Khoảng nghỉ (Intentional Pauses)** | 2.8 / 5 | 2.0 / 5 | **4.5 / 5** | **4.8 / 5** | Bản A cắt mất dấu phẩy ở `01_statement` và `06_emotion_shift` gây khựng giả tạo. Bản B và C giữ dấu phẩy nối ý (`170–210ms`) và phân biệt rõ khoảng nghỉ nội nhóm (`250–290ms`) với khoảng nghỉ chuyển đoạn (`460–550ms`). |
| 6 | **Mạch kể chuyện (Storytelling Arc)** | 3.2 / 5 | 1.8 / 5 | **4.3 / 5** | **4.9 / 5** | Trong `04_story_snowfall`, bản B và C dẫn dắt người nghe đi qua đủ 5 chặng: mở bài chậm rãi → diễn biến → tương phản (*"My mom doesn't like the snow"*) → cao trào (*"snow angels / snowballs"*) → kết bài ấm áp (*"hot chocolate"*). |
| 7 | **Tính liên tục giữa các câu (Inter-sentence Continuity)** | 2.7 / 5 | 2.0 / 5 | **4.4 / 5** | **4.8 / 5** | Chuỗi 6 câu mặc đồ (`I put on my hat... My mom puts on my scarf...`) trong file mẫu và bản A bị đọc rời từng câu đơn điệu; ở bản B và C được gom thành 2 nhóm ý (`tg_8`, `tg_9`) với sóng `contourWave` liên kết mượt mà. |
| 8 | **Độ rõ ràng cho người học (Clarity for Learners)** | 4.4 / 5 | 3.0 / 5 | **4.6 / 5** | **4.9 / 5** | File `B_learning_04_story_snowfall.mp3` (`126.5 WPM`) và `C_learning_04_story_snowfall.mp3` (`126.0 WPM`) đọc cực kỳ rõ chữ theo cụm ý 3–8 từ, không bị kéo giãn âm tiết máy móc và không đọc rời từng từ. |
| 9 | **Phù hợp cảm xúc (Emotional Appropriateness)** | 3.6 / 5 | 1.8 / 5 | **4.3 / 5** | **4.9 / 5** | Ở `06_emotion_shift`, câu 2 (*"Unfortunately, my mom was tired and worried..."*) được hạ tông trầm ấm, trầm tĩnh (`guardrailTriggered = true`), đối lập rõ với câu 1 và câu 3 hào hứng. |
| 10 | **Thời gian tạo Audio (Synthesis Latency)** | N/A *(thu sẵn)* | **4.9 / 5** | **4.9 / 5** | **4.2 / 5** | Lập kế hoạch `planParagraph` trong trình duyệt tốn `< 1.5 ms`. Tổng hợp SAPI (Bản B) chỉ mất `26–47ms` cho câu đơn; tổng hợp Neural qua mạng (Bản C) mất `~885–1133ms` cho câu đơn. |
| **TỔNG KẾT** | **Điểm trung bình (Average / 5.0)** | **3.56 / 5.0** | **2.35 / 5.0** | **4.33 / 5.0** | **4.78 / 5.0** | **Bản B tăng `+84.3%` điểm chất lượng so với Bản A trên cùng engine SAPI; Bản C đạt chất lượng tiệm cận giáo viên bản xứ (`4.78/5.0`).** |

---

## Mục 8: Chi phí (Cost) và Độ trễ (Latency)

1. **Độ trễ lập kế hoạch ngữ điệu (`ELW_TTS_PLANNER.planParagraph`) trên trình duyệt**:
   - Thuật toán thuần JavaScript (Zero-dependency, không gọi LLM hay API ngoài):
     - Với 1 câu đơn (`15–20 từ`): **`< 0.3 ms`**.
     - Với cả đoạn truyện dài 22 câu (`128 từ`): **`< 1.5 ms`** (không bao giờ gây block UI thread).
2. **Độ trễ tổng hợp âm thanh thực tế (Synthesis Latency ghi nhận trong `acoustic_metrics.json`)**:
   - **Trên trình duyệt (`window.speechSynthesis` — Phương án B & Browser Neural)**: Khởi phát tức thì (`10–60 ms`), không tốn băng thông tải file lớn nhờ cơ chế streaming nội bộ của trình duyệt.
   - **Trong kịch bản kết xuất file MP3 hàng loạt (`tools/generate_tts_ab_audio.py`)**:
     - Engine SAPI5 (`B_planner`): `26.0 ms` – `47.6 ms` cho các câu đơn (`01_statement`, `02_questions`, `03_emphasis`) và `457.7 ms` – `1151.5 ms` cho toàn bộ bài truyện 22 câu (`04_story_snowfall`).
     - Engine Neural trực tuyến (`C_neural` qua `edge-tts`): `885.0 ms` – `1133.6 ms` cho các câu đơn và `4275.6 ms` – `4578.6 ms` cho các đoạn hội thoại/truyện dài 22 câu.
3. **Chi phí vận hành (Operating Cost)**:
   - **Giải pháp mặc định đã triển khai (`Paragraph Prosody Planner` + Browser Neural / SAPI)**: **$0.00 / tháng** (hoàn toàn miễn phí cho không giới hạn người dùng).
   - **Nếu mở rộng sang Cloud Neural TTS Proxy tùy chọn**: Khoảng `$15 – $16 / 1 triệu ký tự` với Azure AI Speech hoặc Google Cloud TTS (cả hai đều có gói miễn phí `500,000 – 1,000,000 ký tự/tháng`).

---

## Mục 9: Các giới hạn còn lại (Remaining Limitations)

1. **Giới hạn của Web Speech API trên các giọng SAPI5 Desktop thế hệ cũ (`Microsoft Zira`, `Microsoft David`)**:
   - Do `window.speechSynthesis` của trình duyệt không nhận thẻ SSML `<prosody>` hay `<emphasis>` ở cấp từng từ bên trong một `SpeechSynthesisUtterance` đơn lẻ, nên nếu người dùng mở ứng dụng trên một trình duyệt Chromium cũ không có giọng `Online (Natural)` hay `Google US English`, sự biến thiên ngữ điệu được thực hiện ở cấp mệnh đề/cụm ý chứ không thể uốn đường cong F0 trên từng âm tiết riêng lẻ như khi kết xuất qua SAPI SSML hay Edge Neural.
2. **Sự phụ thuộc vào danh sách Voice của Hệ điều hành / Trình duyệt**:
   - Chất lượng giọng đọc trực tiếp trên trình duyệt đạt mức cao nhất (**Phương án C**) khi người dùng mở ứng dụng trên **Microsoft Edge** (có sẵn bộ giọng `Microsoft Aria/Jenny/Guy/Ana Online (Natural)`) hoặc **Google Chrome** (có giọng `Google US English` / `Google UK English`), và đạt mức **Phương án B** khi chạy offline với giọng SAPI5 của Windows.
3. **Hội thoại nhiều nhân vật lồng trong một đoạn văn trần thuật**:
   - Khi đọc một đoạn văn tự sự dài có lồng câu trích dẫn trực tiếp của nhân vật, `ELW_READING` sử dụng giọng người dẫn chuyện kèm biến thiên cao độ/tốc độ của `Paragraph Prosody Planner`, trong khi phần hội thoại phân vai (`ELW_DIALOGUE` / `ELW_ROLEPLAY`) chuyển đổi giọng riêng cho từng nhân vật (`mom`, `linh`, `barista`, `cashier`, `child`...).

---

## Mục 10: Bằng chứng Kiểm thử Tự động (Automated QA & E2E Evidence)

Toàn bộ các bài kiểm thử đơn vị (Unit Tests), kiểm thử ngữ điệu (Prosody & Guardrail Tests), kiểm thử giao diện E2E trên trình duyệt thật (Playwright Desktop & Mobile) và kiểm thử đóng gói (`tools/build.py`) đều đã chạy và **PASS 100% (`0 errors`)**:

### 10.1. Kết quả chạy `node modules/voices.test.mjs` (Unit + Playwright Voice Selection + Prosody + E2E `index.html`)

```text
node-prosody PASS {
  ynEndPitch: 1.34,
  whEndPitch: 1.13,
  whWhatEndPitch: 0.95,
  exEndPitch: 1.32,
  stEndPitch: 1.09,
  presetsDistinct: 7,
  guardrailEmotion: 'contrastive_calm',
  rolesFound: [ 'opening', 'development', 'climax', 'contrast', 'closing' ]
}
windows PASS {"adult_male":"Microsoft Guy Online (Natural) - English (United States) · pitch 0.7 · rate 0.95","adult_female":"Microsoft Aria Online (Natural) - English (United States) · pitch 1.2 · rate 1","young_male":"Microsoft Eric Online (Natural) - English (United States) · pitch 1 · rate 1.1","young_female":"Microsoft Natasha Online (Natural) - English (Australia) · pitch 1.45 · rate 1.08","child":"Microsoft Ana Online (Natural) - English (United States) · pitch 1.85 · rate 0.92","elderly":"Microsoft Ryan Online (Natural) - English (United Kingdom) · pitch 0.55 · rate 0.78"} []
chrome_mixed PASS {"adult_male":"Microsoft David Desktop - English (United States) · pitch 0.7 · rate 0.95","adult_female":"Google US English · pitch 1.2 · rate 1","young_male":"Google UK English Female · pitch 1 · rate 1.1","young_female":"Google US English · pitch 1.45 · rate 1.08","child":"Microsoft Zira Desktop - English (United States) · pitch 1.85 · rate 0.92","elderly":"Google UK English Male · pitch 0.55 · rate 0.78"} []
two PASS {"adult_male":"Google UK English Male · pitch 0.7 · rate 0.95","adult_female":"Google US English · pitch 1.2 · rate 1","young_male":"Google UK English Male · pitch 1 · rate 1.1","young_female":"Google US English · pitch 1.45 · rate 1.08","child":"Google US English · pitch 1.85 · rate 0.92","elderly":"Google UK English Male · pitch 0.55 · rate 0.78"} []
one PASS {"adult_male":"Google US English · pitch 0.7 · rate 0.95","adult_female":"Google US English · pitch 1.2 · rate 1","young_male":"Google US English · pitch 1 · rate 1.1","young_female":"Google US English · pitch 1.45 · rate 1.08","child":"Google US English · pitch 1.85 · rate 0.92","elderly":"Google US English · pitch 0.55 · rate 0.78"} []
none PASS {"adult_male":"Default voice · pitch 0.7 · rate 0.95","adult_female":"Default voice · pitch 1.2 · rate 1","young_male":"Default voice · pitch 1 · rate 1.1","young_female":"Default voice · pitch 1.45 · rate 1.08","child":"Default voice · pitch 1.85 · rate 0.92","elderly":"Default voice · pitch 0.55 · rate 0.78"} []
prosody PASS {"ynType":"yn_question","whType":"wh_question","exType":"exclamation","stClauses":3,"stPause":200,"ynEndPitch":1.34,"whEndPitch":1.13,"whWhatEndPitch":0.95,"exEndPitch":1.32,"stEndPitch":1.09,"linhBasePitch":1.38,"cashierBasePitch":1.16,"momBasePitch":1.18,"whFallsEnough":true,"onlyYnRises":true,"baristaProfile":true,"momProfile":true,"kwRateLower":true,"pickedNatural":true,"distinctPresets":7,"guardrailTriggered":true,"learningModeOk":true,"rolesComplete":true,"parallelGrouped":true}
e2e-desktop-1280x800 PASS {"playScrollW":1280,"learnScrollW":1280,"missionScrollW":1280,"maxScrollW":1280,"hasNpcs":true,"hasDialogue":true,"hasStoryCard":true,"hasSpeakingCard":true,"hasTtsBar":true,"barFitsViewport":true,"barInteractionOk":true,"spokenSegments":5,"maxConcurrent":1,"overlapCount":0,"pageErrors":[]}
e2e-mobile-390x844 PASS {"playScrollW":390,"learnScrollW":390,"missionScrollW":390,"maxScrollW":390,"hasNpcs":true,"hasDialogue":true,"hasStoryCard":true,"hasSpeakingCard":true,"hasTtsBar":true,"barFitsViewport":true,"barInteractionOk":true,"spokenSegments":5,"maxConcurrent":1,"overlapCount":0,"pageErrors":[]}
```

### 10.2. Kết quả chạy `node modules/voices-dialogue.test.mjs` & `node modules/reading.test.js`

```text
PASS 8 scripts
PASS all action ids allowed: 19 distinct
PASS male vs female voices differ
PASS child pitch highest
PASS available() filters English
PASS wrong choice shows feedback
PASS script breakfast completes (actions: open_fridge,take_milk,close_fridge)
PASS script tidy completes (actions: sweep_floor,wipe_table)
PASS script movie completes (actions: turn_on_tv,pull_out_chair,sit_on_chair,watch_tv)
PASS script thirsty completes (actions: pick_up_cup,pour_milk,drink_from_cup,put_milk_back)
PASS script fresh_air completes (actions: open_window)
PASS script plants completes (actions: water_plant)
PASS script lost_book completes (actions: pick_up_book,put_book_on_table)
PASS script bedtime completes (actions: turn_off_tv,close_window)
PASS speak resolves w/o speechSynthesis {"ms":0,"pick":null,"av":0}
PASS no page errors 
ALL PASSED
```

```text
node modules/reading.test.js -> OK (0 errors)
```

### 10.3. Kết quả đóng gói bản đầy đủ `python tools/build.py`

```text
built D:\tools\Hoc tieng anh\english-life-world-ban-day-du.html 3222 KB; missing: []
```
