# English Life World: Phân quyền & Phối hợp Antigravity (Gemini 4 Argon) ↔ Claude

## 1. Nguyên tắc Phân quyền Mới (Cập nhật theo chỉ đạo của User)
1. **Antigravity (chạy mô hình Gemini 4 Argon)** được phân quyền **chạy và triển khai TOÀN BỘ dự án (Full-stack / End-to-End)**:
   - Toàn quyền chỉnh sửa và tích hợp `index.html`, toàn bộ các module logic (`modules/*.js`), các module chủ đề (`modules/topic-*.js`, `modules/life-talk.js`, `modules/mission.js`, `modules/voices-dialogue.js`...), các module giao diện (`modules/ui-*.js`), tài nguyên hình ảnh (`assets/**`), và bộ công cụ kiểm thử (`tools/**`).
2. **Claude (`claude-desktop`)** chỉ đảm nhận vai trò **Rà soát các nhiệm vụ & Kiểm định lộ trình (Task & Roadmap Reviewer / QA Auditor)**:
   - Theo dõi bảng nhiệm vụ chung (`board_list`), rà soát từng hạng mục bàn giao so với lộ trình trong `docs/TOPICS-PLAN.md`.
   - Kiểm tra tính nhất quán của điều kiện tiên quyết (`pre`), chuỗi giọng nói (`speechSynthesis`), trạng thái phòng (`W`), và trải nghiệm học tập.
   - Gửi báo cáo rà soát qua `notes_send` / `board_update`. **Claude KHÔNG trực tiếp lock (`claim_paths`) hoặc ghi đè các file mã nguồn** để tránh xung đột hoặc treo khoá.

## 2. Ma trận Trách nhiệm & Sở hữu File

| File / Thư mục | Thực thi chính (Owner) | Rà soát / Kiểm định (Reviewer) | Ghi chú |
|---|---|---|---|
| `index.html` | **Antigravity (Gemini 4 Argon)** | Claude (Review Only) | Tích hợp trung tâm, WorldState `W`, điều phối hàng đợi `execItem`, `resetScene`, âm thanh & UI |
| `modules/life-talk.js`, `modules/voices-dialogue.js`, `modules/mission.js`, `modules/missions-pack.js` | **Antigravity (Gemini 4 Argon)** | Claude (Review Only) | Nhân vật phụ (Linh), hệ thống giọng đọc đa nhân vật không ngắt quãng, nhiệm vụ |
| `modules/topic-cafe.js`, `modules/topic-market.js`, `modules/topic-park.js`, `modules/topic-restaurant.js`, `modules/topic-outdoor.js` | **Antigravity (Gemini 4 Argon)** | Claude (Review Only) | Toàn bộ các Topic học tập (Quán cà phê, Siêu thị, Công viên, Quán ăn, Ngoài trời...) |
| `modules/events.js`, `challenge.js`, `food.js`, `rooms.js`, `rooms2.js`, `needs.js`, `day.js`, `roleplay.js`, `grammar.js`, `npcs.js`, `levels.js`, `reading.js`, `flow.js`, `i18n-*.js` | **Antigravity (Gemini 4 Argon)** | Claude (Review Only) | Toàn bộ hệ thống logic, ngôn ngữ, ngữ pháp, thử thách |
| `modules/ui-scene.js`, `modules/ui-mission.js`, `modules/ui-companion.js`, `modules/ui-mobile.js`, `modules/ui-topics.js` | **Antigravity (Gemini 4 Argon)** | Claude (Review Only) | Giao diện bong bóng thoại, thẻ nhiệm vụ, nhân vật đồng hành, responsive mobile |
| `assets/**`, `tools/**`, `docs/**` | **Antigravity (Gemini 4 Argon)** | Claude (Review Only) | Hình ảnh PNG/SVG, script kiểm thử tự động Playwright/Node, tài liệu lộ trình |

## 3. Quy trình Phối hợp Chuẩn
1. **Triển khai (Antigravity — Gemini 4 Argon)**:
   - Gọi `presence_set` (`status: "developing"`, `model: "gemini-4-argon"`) và `claim_paths` trước khi sửa file.
   - Thực thi trọn vẹn cả logic, giao diện, âm thanh và tích hợp vào `index.html`.
   - Chạy đầy đủ bộ kiểm thử tự động (`node` tests & `python tools/test_ui_*.py`), giải phóng khoá `release_paths`.
   - Đăng nhiệm vụ rà soát lên bảng (`board_post`) cho `claude-desktop`.
2. **Rà soát lộ trình (Claude — Reviewer)**:
   - Đọc diff và kết quả test của Antigravity.
   - Đối chiếu với checklist chất lượng (QA) và lộ trình trong `docs/TOPICS-PLAN.md`.
   - Phản hồi kết quả rà soát qua `board_update` / `notes_send`.

## 4. Checklist Rà soát Chất lượng (QA Standards cho Claude đối chiếu)
- **QA-Speech (Giọng nói & Hội thoại)**:
  - Câu nói của người chơi (`it.talk`), nhân viên NPC (`Barista`, `Cashier`, `Waiter`...) và bạn đồng hành (`Linh`) phải chạy **tuần tự** (`await waitTalk` → `await showNpc` → `await ELW_LIFE.onAction` → `ELW_MISSION.onAction`), tuyệt đối không cắt ngang câu nói của nhau.
  - Giữ tham chiếu `activeUtterance` trong `ELW_VOICES.speak` để tránh lỗi Garbage Collection của trình duyệt làm ngắt âm giữa câu.
- **QA-Reset (Reset đoạn hội thoại theo Topic)**:
  - Khi ở ngoài các phòng thuộc chủ đề Nhà ở (`roomTopic(W.room) !== "home"`), nút trên thanh công cụ (`#btnReset`) và nút trong Chuỗi hành động (`#qReset`) hiển thị **"↺ Reset đoạn hội thoại"** / **"↺ Reset lại đoạn hội thoại"**.
  - Khi bấm Reset, nhân vật **đứng nguyên tại Topic hiện tại** (`W.room` giữ nguyên, không bị đưa về phòng khách `"living"`), đồng thời xoá sạch bong bóng thoại và làm mới trạng thái hội thoại của Topic đó.
- **QA-Hitbox & Mobile UI**:
  - Nhân vật phụ `Linh` (`#lt-friend`) đứng ở vị trí thoáng, có vùng bấm riêng (`.lt-hit`), không che khuất các đồ vật tương tác trong phòng/quán/siêu thị.
  - Mọi nút tương tác đạt kích thước tối thiểu `44×44px` trên màn hình điện thoại `360px–412px`.
