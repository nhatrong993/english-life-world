Mình sẽ viết prompt theo hướng Claude làm kiến trúc sư kiêm trưởng dự án, Antigravity 4.0 chia việc cho 4 agent chuyên trách, đồng thời tách hoàn toàn bản đồ sân bay thử nghiệm khỏi ứng dụng hiện tại.

Có 3 yêu cầu cần khóa chặt trong prompt:

- Sửa lỗi tương tác lặp lại: mỗi lần bấm hành động đều phải thực thi lại animation và hành vi, nhưng không tự thêm câu diễn tả vào “Phần đoạn văn của tôi” nếu câu đó đã được ghi nhận.
- Xây một bản demo sân bay độc lập: tham khảo phong cách map của Mother 3 Tribute – Tazmilly Props, nhưng tự thiết kế hình ảnh, nhân vật, đồ vật và bố cục mới; chưa ghép vào ứng dụng chính.
- Chia việc có kiểm soát: Claude quản lý kiến trúc, phân công, review và nghiệm thu; các agent phụ trách những module riêng, không sửa chồng chéo hoặc tự ý thay đổi ứng dụng chính.

# MASTER PROMPT — ENGLISH LIFE WORLD: AIRPORT 2.5D DEMO REDESIGN

## Claude Orchestrator + Antigravity 4.0 + 4 Specialized Agents

### 1. VAI TRÒ VÀ MỤC TIÊU DỰ ÁN

Claude là **Lead Architect, Creative Director, Technical Lead và QA Manager**. Claude chịu trách nhiệm thiết kế kiến trúc, lập kế hoạch, chia việc, kiểm soát tiến độ, review code, xử lý xung đột và nghiệm thu sản phẩm.

Sử dụng Antigravity 4.0 cùng 4 agent chuyên trách để triển khai song song trong phạm vi được phân công.

**Ứng dụng hiện tại:**\
[https://english-life-world.pages.dev/](https://english-life-world.pages.dev/)

**Tài liệu hình ảnh tham khảo:**\
[https://dshiredoodles.artstation.com/projects/6b3Pe0](https://dshiredoodles.artstation.com/projects/6b3Pe0)

Phong cách tham khảo: *Mother 3 Tribute – Tazmilly Props*, tập trung vào bản đồ game 2.5D/2D có cảm giác không gian, bố cục môi trường sinh động, đồ vật có cá tính, nhân vật dễ thương và các chi tiết nhỏ tạo cảm giác thế giới đang sống.

Không sao chép nguyên bản tài sản, nhân vật, sprite, bố cục hoặc thiết kế độc quyền. Hãy dùng hình ảnh tham khảo để xác định ngôn ngữ hình ảnh, sau đó tạo một thiết kế sân bay hoàn toàn mới phù hợp với game học tiếng Anh.

### 2. MỤC TIÊU SẢN PHẨM

Thiết kế và xây dựng một **bản demo sân bay 2.5D độc lập**, có chất lượng hình ảnh và trải nghiệm tốt hơn bản hiện tại, phục vụ việc học tiếng Anh thông qua tương tác trong thế giới game.

Demo phải có URL preview riêng để kiểm thử. Nếu nền tảng triển khai hỗ trợ, hãy xuất bản bằng Cloudflare Pages Preview hoặc một địa chỉ preview tương đương.

Ví dụ địa chỉ mong muốn:

- Bản chính: [https://english-life-world.pages.dev/](https://english-life-world.pages.dev/)
- Bản demo: một URL preview riêng biệt, không thay thế bản chính.

Không tự ý sử dụng URL ví dụ làm URL đã triển khai. Chỉ báo địa chỉ preview sau khi triển khai thành công và xác minh truy cập được.

**Giai đoạn này chỉ tạo bản demo thử nghiệm. Không tích hợp map sân bay vào ứng dụng chính, không sửa hoặc ghi đè bản production và không tự động ghép module mới vào các module hiện có.**

Mục tiêu là đánh giá chất lượng thiết kế, animation, gameplay, tương tác, âm thanh, UI và khả năng học tiếng Anh trước khi quyết định tích hợp.

---

# PHẦN A — AUDIT VÀ LẬP KIẾN TRÚC

## 3. Claude phải kiểm tra trước khi giao việc

Trước khi viết code, hãy:

1. Đọc repository hiện tại và xác định công nghệ thực tế đang sử dụng.
2. Kiểm tra cách ứng dụng dựng cảnh 2.5D, quản lý nhân vật, đồ vật, animation, âm thanh, hội thoại và lưu tiến trình.
3. Tìm lỗi hành động chỉ chạy một lần, lỗi trạng thái bị giữ, event listener bị đăng ký lặp và lỗi khiến lần bấm sau chỉ phát lại câu thoại nhưng không thực hiện hành động.
4. Xác định thành phần nào có thể tái sử dụng an toàn trong demo và thành phần nào cần xây riêng.
5. Đọc tài liệu hình ảnh tham khảo. Nếu không thể truy cập hoặc không xem được hình ảnh, hãy báo rõ và yêu cầu đầu vào cần thiết; không giả vờ đã xem.
6. Lập kiến trúc demo riêng, xác định entry point, các module, API và phạm vi file của từng agent.
7. Chạy thử bản hiện tại nếu có thể và ghi lại các lỗi đã xác minh.

Trong giai đoạn audit, không chỉnh sửa production.

## 4. Nguyên tắc kiến trúc bắt buộc

Tạo ứng dụng demo độc lập với:

- Entry point riêng.
- Scene/Map Manager riêng hoặc cấu hình riêng.
- Character Controller.
- Interaction System.
- Animation Controller.
- Object Registry.
- Dialogue và Learning System.
- UI Manager.
- Audio Manager.
- Save/State Manager nếu demo cần lưu dữ liệu.
- Bộ test độc lập.

Ưu tiên dùng lại thư viện hoặc logic hiện có khi phù hợp và được phép. Không sao chép toàn bộ ứng dụng chính sang demo một cách thiếu kiểm soát.

Không tạo nhiều hệ thống trùng chức năng như nhiều Character Controller, nhiều hệ thống quản lý hội thoại, nhiều nguồn lưu trạng thái hoặc nhiều cơ chế xử lý click.

Mọi module phải có ranh giới rõ ràng, API công khai, quy tắc quản lý trạng thái và tiêu chí kiểm thử.

---

# PHẦN B — SỬA LỖI TƯƠNG TÁC LẶP LẠI

## 5. Lỗi hiện tại cần xử lý

Ví dụ người chơi tương tác với tủ lạnh:

- Bấm “Mở tủ lạnh”: tủ lạnh mở, nhân vật thực hiện hành động và phát câu diễn tả.
- Bấm “Đóng tủ lạnh”: tủ lạnh đóng.
- Bấm “Mở tủ lạnh” lần thứ hai: hiện tại hệ thống chỉ đọc hoặc lặp lại lời diễn tả, nhưng tủ lạnh không thực sự mở lại.
- Các hành động tương tự có thể gặp lỗi này ở những đồ vật khác.

Đây không đơn thuần là lỗi giao diện. Hãy kiểm tra logic trạng thái, vòng đời sự kiện, animation, điều kiện hành động và cơ chế quản lý đoạn văn.

## 6. Hành vi bắt buộc sau khi sửa

Mỗi lần người chơi chủ động bấm một hành động hợp lệ, game phải thực hiện hành động tương ứng, kể cả khi hành động đó đã từng được thực hiện trước đây.

Ví dụ:

| Thao tác           | Hành vi bắt buộc                 |
| ------------------ | -------------------------------- |
| Mở tủ lạnh lần 1   | Tủ lạnh mở, animation chạy       |
| Đóng tủ lạnh lần 1 | Tủ lạnh đóng, animation chạy     |
| Mở tủ lạnh lần 2   | Tủ lạnh mở lại, animation chạy   |
| Đóng tủ lạnh lần 2 | Tủ lạnh đóng lại, animation chạy |
| Mở/đóng nhiều lần  | Không bị khóa sau lần đầu        |
| Bấm hành động khác | Thực hiện đúng hành động mới     |

Nếu người chơi bấm hành động đã được thực hiện trước đó, không được chỉ phát lại câu thoại hoặc ghi nhận rằng câu đã được nói mà bỏ qua hành động trong game.

### 6.1. Phân biệt ba cơ chế riêng biệt

Thiết kế rõ ràng ba luồng độc lập:

**A. Action Execution**

Thực hiện hành động trong game: thay đổi trạng thái đồ vật, animation nhân vật, animation đồ vật, hiệu ứng và các điều kiện gameplay liên quan.

**B. Dialogue / Audio**

Phát câu tiếng Anh, âm thanh hoặc lời diễn tả tương ứng. Có thể phát lại khi người chơi chủ động yêu cầu, nếu đó là hành vi được thiết kế.

**C. “Phần đoạn văn của tôi”**

Đây là phần nội dung ghi nhận hoặc tổng hợp các đoạn văn diễn tả của người chơi. Không tự động thêm một bản sao của cùng đoạn văn mỗi lần người chơi bấm lại cùng hành động.

Ví dụ:

1. Bấm mở tủ lạnh lần đầu: thực hiện hành động, phát câu thoại và ghi nhận đoạn văn nếu phù hợp.
2. Bấm đóng tủ lạnh: thực hiện hành động đóng và xử lý câu diễn tả theo quy tắc hiện tại.
3. Bấm mở tủ lạnh lần nữa: tủ lạnh phải mở lại; không thêm bản sao của đoạn văn mở tủ lạnh vào “Phần đoạn văn của tôi”.
4. Nếu người chơi chủ động chọn nghe lại câu mẫu, vẫn cho phép nghe lại mà không ghi trùng đoạn văn.

Không được dùng một cờ kiểu `hasPlayed` hoặc `hasExecuted` để chặn vĩnh viễn hành động sau lần đầu. Phải phân biệt trạng thái hiện tại của đồ vật với lịch sử đã ghi nhận nội dung.

### 6.2. Quy tắc kỹ thuật

- Mỗi lần click hợp lệ tạo một lần thực thi hành động mới.
- Kiểm tra điều kiện dựa trên trạng thái hiện tại, không dựa đơn thuần vào việc hành động đã từng chạy.
- Animation phải có khả năng chạy lại từ trạng thái phù hợp.
- Không đăng ký thêm event listener sau mỗi lần click.
- Không tạo các timer, promise hoặc callback cũ khiến hành động mới bị bỏ qua.
- Không dùng nội dung hội thoại làm nguồn quyết định duy nhất cho trạng thái gameplay.
- Phân biệt `currentState`, `actionExecution` và `narrationHistory`.
- Chống double-click ngoài ý muốn bằng cơ chế phù hợp, nhưng không vô tình chặn các lần click hợp lệ tiếp theo.
- Nếu hành động không hợp lệ do điều kiện gameplay, thông báo rõ lý do thay vì âm thầm không thực hiện.

Có thể dùng action ID và quy tắc chống trùng nội dung để quản lý lịch sử, nhưng không được dùng ID lịch sử để vô hiệu hóa lần thực thi mới.

### 6.3. Bộ test hồi quy bắt buộc

Kiểm thử ít nhất các trường hợp:

1. Mở → đóng → mở → đóng.
2. Thực hiện cùng một hành động ít nhất 10 lần liên tiếp, xen kẽ các trạng thái hợp lệ.
3. Bấm nhanh liên tục và xác nhận game không rơi vào trạng thái sai.
4. Đóng/mở menu rồi thực hiện lại hành động.
5. Chuyển phòng rồi quay lại tương tác.
6. Phát âm thanh bị lỗi hoặc không tải được nhưng hành động gameplay vẫn xử lý đúng.
7. Đoạn văn không bị ghi trùng sau các lần bấm lặp.
8. Nhiều đồ vật cùng loại vẫn hoạt động độc lập.
9. Animation không bị đứng ở frame cuối hoặc bỏ qua trạng thái.
10. Reload trang không tạo event listener trùng hoặc hành động bị khóa.

Tạo test tự động cho logic quan trọng và test giao diện thực tế cho các luồng tương tác chính.

---

# PHẦN C — THIẾT KẾ MAP SÂN BAY 2.5D

## 7. Art Direction

Tạo một thế giới sân bay mang phong cách cartoon 2.5D, dễ thương, có chiều sâu và phù hợp cho người mới học tiếng Anh.

Định hướng hình ảnh:

- Không gian có cảm giác 3D nhưng giữ bố cục và khả năng quan sát rõ ràng của game 2D/isometric.
- Hình khối thân thiện, màu sắc hài hòa, ánh sáng dễ chịu.
- Đồ vật có hình dáng dễ nhận diện, silhouette rõ.
- Nhân vật và môi trường thống nhất về tỷ lệ, phối cảnh, độ chi tiết và bảng màu.
- Có các chi tiết nhỏ tạo cảm giác sân bay đang hoạt động: bảng điện tử, hành khách, xe đẩy hành lý, nhân viên sân bay, cửa kính, quầy thủ tục, biển chỉ dẫn và máy bay ở khu vực quan sát.
- Tránh nhồi quá nhiều vật thể, hiệu ứng hoặc chữ khiến người học không biết phải tập trung vào đâu.
- Ưu tiên hiệu năng trên trình duyệt desktop và mobile.

Không tạo một ảnh nền sân bay duy nhất rồi giả lập toàn bộ tương tác bằng các vùng click rời rạc. Hãy thiết kế scene có cấu trúc, đối tượng tương tác và trạng thái rõ ràng.

## 8. Bố cục map

Thiết kế map sân bay mới gồm các khu vực có luồng di chuyển hợp lý:

1. Airport Entrance — Cổng vào sân bay.
2. Check-in Hall — Sảnh làm thủ tục.
3. Check-in Counter — Quầy check-in.
4. Baggage Drop — Khu gửi hành lý.
5. Security Check — Khu kiểm tra an ninh.
6. Departure Board — Bảng thông tin chuyến bay.
7. Waiting Lounge — Phòng chờ.
8. Boarding Gate — Cửa lên máy bay.
9. Aircraft Window / Boarding Area — Khu quan sát hoặc lên máy bay ở phạm vi demo phù hợp.

Không bắt buộc phải xây toàn bộ khu vực thành các scene hoàn chỉnh ngay từ đầu. Hãy xác định một khu vực chính làm vertical slice, các khu vực còn lại có thể là những phân đoạn mở rộng.

Mỗi khu vực cần có:

- Điểm xuất phát và điểm đến.
- Đường đi của nhân vật.
- Vị trí camera.
- Đồ vật tương tác.
- NPC phù hợp.
- Các cơ hội học từ vựng và câu mẫu.
- Các ranh giới cảnh và điều kiện chuyển khu vực.

Không bố trí vật thể khiến nhân vật đi xuyên qua quầy, ghế, tường hoặc đồ vật lớn nếu gameplay yêu cầu va chạm.

## 9. Thiết kế nhân vật

Thiết kế mới toàn bộ nhân vật cho demo:

### Nhân vật chính

- Phong cách đáng yêu, dễ nhận diện, có cá tính.
- Tỷ lệ đầu, thân, tay, chân phù hợp với thế giới game.
- Có animation idle, walk, run, turn, sit, stand, reach, pick up, carry, interact và các hành động cần thiết.
- Có thể tương tác với đồ vật ở những góc và vị trí khác nhau.
- Có hướng quay phù hợp với đồ vật và NPC.
- Không dùng một animation chung cho mọi hành động nếu hành vi thực tế khác nhau.

### Pet

Thiết kế một thú cưng phù hợp với nhân vật chính và bối cảnh sân bay.

- Idle, walk, run, follow, sit, look around và reaction.
- Di chuyển theo nhân vật với khoảng cách hợp lý.
- Không xuyên vật thể hoặc chặn thao tác quan trọng.
- Không bắt buộc thú cưng xuất hiện trong mọi tình huống.

### NPC

Bao gồm tối thiểu một số vai trò có giá trị cho việc học tiếng Anh:

- Airport staff.
- Check-in agent.
- Security officer.
- Passenger.
- Gate attendant.

NPC có idle animation, chuyển động nhỏ, hướng nhìn, phản ứng và hội thoại theo ngữ cảnh.

Không để NPC chỉ là hình trang trí nếu được giao vai trò hội thoại hoặc nhiệm vụ.

## 10. Chất lượng animation và tương tác

Đặc biệt chú ý:

- Đi bộ phải có chuyển động thân người và chân tự nhiên.
- Chạy có nhịp chuyển động khác đi bộ.
- Khi ngồi, cơ thể phải chuyển đổi hợp lý giữa tư thế đứng và ngồi.
- Khi cầm hành lý, tay, thân người và đồ vật phải có sự phối hợp.
- Khi đặt hành lý xuống, vật thể phải trở lại đúng vị trí.
- Khi kéo vali, vali phải theo nhân vật với khoảng cách và góc hợp lý.
- Khi dùng quầy check-in, nhân vật phải quay về phía quầy.
- Khi tương tác với cửa hoặc máy quét an ninh, phải có phản hồi thị giác và âm thanh phù hợp.
- Animation phải hỗ trợ trạng thái bị hủy hoặc chuyển sang hành động khác.
- Không để nhiều animation xung đột, chẳng hạn nhân vật vừa ngồi vừa chạy.

Tạo các transition rõ ràng giữa idle, walk, run, interact, carry, sit và stand.

---

# PHẦN D — GAMEPLAY HỌC TIẾNG ANH

## 11. Học thông qua hành động

Người chơi không chỉ xem danh sách từ vựng. Họ phải sử dụng tiếng Anh để hoàn thành các hành động trong sân bay.

Ví dụ:

| Tình huống          | Câu mẫu                           |
| ------------------- | --------------------------------- |
| Đến quầy check-in   | “Hello, I'd like to check in.”    |
| Đưa hộ chiếu        | “Here is my passport.”            |
| Gửi hành lý         | “I'd like to check this bag.”     |
| Hỏi cửa lên máy bay | “Where is Gate 12?”               |
| Kiểm tra chuyến bay | “What time does my flight leave?” |
| Tìm chỗ ngồi        | “Is this seat taken?”             |
| Lên máy bay         | “May I board now?”                |

Đây là các ví dụ minh họa. Hãy tổ chức nội dung thành dữ liệu có thể chỉnh sửa, không hard-code toàn bộ câu vào logic tương tác.

Mỗi hoạt động nên hỗ trợ:

1. Nhận diện đồ vật hoặc tình huống.
2. Nghe từ/câu tiếng Anh.
3. Xem nghĩa tiếng Việt khi cần.
4. Quan sát nhân vật thực hiện hành động.
5. Tự thực hiện hành động.
6. Luyện nói hoặc chọn câu phù hợp.
7. Nhận phản hồi và phần thưởng.
8. Ôn tập lại theo tiến trình.

Không bắt buộc mọi hành động đều phải mở popup học từ vựng. Hãy lựa chọn thời điểm hiển thị hợp lý để không phá vỡ trải nghiệm khám phá.

## 12. Hệ thống nhiệm vụ

Ví dụ nhiệm vụ đầu tiên:

“Check in for your flight.”

Người chơi cần:

- Đi tới quầy check-in.
- Nói lời chào.
- Chuẩn bị hộ chiếu.
- Thực hiện check-in.
- Gửi hành lý nếu nhiệm vụ yêu cầu.
- Nhận thông tin chuyến bay.
- Tìm cửa lên máy bay.

Nhiệm vụ phải có trạng thái rõ ràng, điều kiện hoàn thành và phản hồi. Không được đánh dấu hoàn thành chỉ vì người chơi đã nghe câu thoại.

---

# PHẦN E — UI/UX MỚI

## 13. Thiết kế giao diện

Thiết kế giao diện đồng bộ với phong cách thế giới game, không để UI trông như một dashboard quản trị đặt lên trên bản đồ.

Yêu cầu:

- HUD gọn gàng.
- Thanh nhiệm vụ rõ ràng.
- Tương tác với đồ vật dễ nhận biết.
- Hội thoại không che nhân vật hoặc vùng tương tác quan trọng.
- Khu vực học tiếng Anh có phân cấp thị giác rõ ràng.
- Hiển thị từ vựng, câu mẫu, nút nghe và nút luyện nói khi cần.
- Phản hồi trực quan khi hành động thành công hoặc không hợp lệ.
- Animation chuyển panel nhẹ nhàng.
- Tương thích với các kích thước màn hình phổ biến.
- Có phương án hiển thị cho mobile mà không gây tràn ngang.

Không hiển thị quá nhiều panel cùng lúc. Ưu tiên progressive disclosure: chỉ mở các tùy chọn cần thiết tại thời điểm tương tác.

Không thêm CSS override diện rộng chỉ để ép giao diện hoạt động. Tránh sử dụng `!important` hàng loạt hoặc thay đổi global style gây ảnh hưởng các thành phần khác.

---

# PHẦN F — PHÂN CÔNG 4 AGENT

## 14. Claude điều phối

Claude chịu trách nhiệm:

- Lập kế hoạch tổng thể và chia task.
- Định nghĩa kiến trúc và hợp đồng API.
- Phân công file, module và đầu ra.
- Theo dõi dependency giữa các agent.
- Review thay đổi và ngăn xung đột.
- Tích hợp các module vào demo riêng.
- Chạy QA tổng thể.
- Quyết định chấp nhận hoặc yêu cầu sửa.
- Không để agent tự ý tích hợp vào production.

Nếu Antigravity 4.0 hỗ trợ workspace hoặc branch riêng, hãy sử dụng chúng. Không giả định có khả năng chạy song song nếu môi trường chưa hỗ trợ; kiểm tra khả năng thực tế trước khi phân công.

## Agent 1 — World Designer & Environment

Phụ trách:

- Art direction của map sân bay.
- Layout, phối cảnh và bố cục.
- Môi trường, quầy, ghế, cửa, bảng điện tử, vali và đồ vật.
- Asset manifest và quy chuẩn hình ảnh.
- Các khu vực của sân bay và đường di chuyển.
- Kiểm tra khả năng nhận diện đồ vật.

Đầu ra: scene environment và dữ liệu đồ vật, có thể tích hợp vào demo.

Không tự sửa Character Controller, Interaction System hoặc UI lõi.

## Agent 2 — Character, Pet & Animation

Phụ trách:

- Thiết kế nhân vật chính.
- Thiết kế thú cưng.
- NPC và animation.
- Idle, walk, run, turn, sit, stand, carry, pick up, interact.
- Animation state machine và transition.
- Tối ưu tài nguyên hình ảnh, animation và hiệu năng.

Đầu ra: nhân vật, animation và API điều khiển đã được kiểm thử.

Không tự viết một hệ thống di chuyển hoặc tương tác thứ hai.

## Agent 3 — Gameplay, Interaction & English Learning

Phụ trách:

- Interaction System cho đồ vật.
- Sửa lỗi hành động không chạy lại.
- Dialogue và audio interaction.
- Chống trùng “Phần đoạn văn của tôi”.
- Nhiệm vụ check-in, hộ chiếu, hành lý và boarding.
- Từ vựng, câu mẫu và phản hồi học tập.
- Unit tests cho các hành động lặp lại.

Đầu ra: các luồng tương tác hoạt động nhiều lần và bộ test có thể chạy lại.

Không tự thay đổi hệ thống render, nhân vật hoặc giao diện toàn cục.

## Agent 4 — UI/UX, Integration Support & QA

Phụ trách:

- Thiết kế HUD, dialog, quest panel và learning panel.
- Responsive layout.
- Tương tác giữa UI và gameplay thông qua API được thống nhất.
- Kiểm thử luồng người dùng.
- Playwright hoặc công cụ tương đương nếu phù hợp với dự án.
- Báo cáo lỗi, ảnh chụp và các bước tái hiện.
- Kiểm thử hồi quy sau khi ghép module.

Đầu ra: giao diện demo hoàn chỉnh và báo cáo test có bằng chứng.

Không tự sửa logic gameplay khi chưa phối hợp với agent phụ trách module đó.

### Quy tắc phối hợp

Trước khi bắt đầu, Claude phải phát hành một bản module contract chung, bao gồm:

- API.
- Tên event.
- Cấu trúc dữ liệu.
- Quy tắc quản lý trạng thái.
- Cách gọi animation.
- Cách phát âm thanh.
- Cách ghi nhận đoạn văn.
- Cách kiểm thử.
- Danh sách file được phép sửa.

Các agent có thể làm việc song song trên phần độc lập. Những thay đổi liên quan đến cùng một file hoặc API phải được Claude điều phối, tránh merge xung đột và hành vi không tương thích.

---

# PHẦN G — QUY TRÌNH TRIỂN KHAI

## 15. Phase 1: Audit

- Kiểm tra codebase và tài liệu tham khảo.
- Tái hiện lỗi hành động lặp lại.
- Ghi nhận kiến trúc hiện tại.
- Chốt công nghệ và cách tách demo.
- Chưa sửa production.

**Điều kiện qua phase:** có báo cáo, kế hoạch và ranh giới module được phê duyệt.

## 16. Phase 2: Prototype hình ảnh

- Tạo bản đồ sân bay mẫu.
- Thiết kế nhân vật chính, pet và một NPC.
- Dựng một khu vực tương tác.
- Kiểm tra camera, phối cảnh, khả năng đọc hình và chất lượng asset.

**Điều kiện qua phase:** người dùng có thể xem và đánh giá phong cách hình ảnh trước khi mở rộng.

## 17. Phase 3: Vertical Slice

Hoàn thành một luồng:

Spawn nhân vật → di chuyển → tương tác quầy check-in → đưa hộ chiếu → nhận câu tiếng Anh → thực hiện hành động → hoàn thành nhiệm vụ → nhận phản hồi.

Bao gồm ít nhất một đồ vật có trạng thái mở/đóng hoặc bật/tắt để xác minh lỗi lặp hành động đã được giải quyết.

**Điều kiện qua phase:** luồng chạy ổn định, không ghi trùng đoạn văn và có test hồi quy.

## 18. Phase 4: Mở rộng gameplay

- Hành lý.
- Bảng thông tin chuyến bay.
- NPC và hội thoại.
- Khu vực an ninh.
- Phòng chờ và cửa lên máy bay.
- Animation bổ sung.
- Từ vựng và câu mẫu mở rộng.

Chỉ triển khai các phần có giá trị trong phạm vi demo. Không mở rộng vô hạn khi vertical slice chưa ổn định.

## 19. Phase 5: UI/UX và QA

- Hoàn thiện UI.
- Kiểm tra desktop và mobile.
- Kiểm tra hiệu năng.
- Kiểm tra asset bị thiếu, âm thanh lỗi và animation sai.
- Chạy test hành động lặp lại.
- Chạy regression tests.
- Kiểm tra toàn bộ luồng học tiếng Anh.

## 20. Phase 6: Preview độc lập

- Build và triển khai demo trên URL riêng.
- Xác minh URL hoạt động từ trình duyệt.
- Kiểm tra đường dẫn asset, audio, routing và tải lại trang.
- Không thay đổi production.
- Chuẩn bị báo cáo nghiệm thu và danh sách phần chưa hoàn thành.

---

# PHẦN H — TIÊU CHÍ NGHIỆM THU

## 21. Functional QA

- Nhân vật di chuyển và quay hướng đúng.
- Không xuyên vật thể quan trọng.
- Có thể thực hiện lặp lại các hành động hợp lệ.
- Mở/đóng, nhặt/đặt, ngồi/đứng và cầm/đặt hoạt động đúng.
- Animation không bị kẹt.
- Âm thanh không làm khóa gameplay.
- Đoạn văn không bị thêm bản sao không mong muốn.
- Nhiệm vụ cập nhật theo hành động thực tế.
- UI không che khuất vùng tương tác quan trọng.
- Reload và chuyển cảnh không tạo trạng thái sai.
- Không có lỗi console nghiêm trọng trong luồng chính.

## 22. Visual QA

- Nhân vật và môi trường đồng nhất về phong cách.
- Phối cảnh 2.5D nhất quán.
- Các đồ vật quan trọng dễ nhận diện.
- Animation có chuyển tiếp tự nhiên.
- UI thống nhất với thế giới game.
- Không có asset thiếu, hình vỡ, sai lớp trước/sau hoặc chữ bị cắt.
- Hiệu năng phù hợp với trình duyệt mục tiêu.

## 23. Deliverables

Khi hoàn thành, hãy cung cấp:

1. URL preview của demo sân bay đã xác minh.
2. Source code của demo trong thư mục hoặc branch độc lập.
3. Sơ đồ kiến trúc và module contract.
4. Danh sách asset mới và nguồn gốc/quyền sử dụng.
5. Danh sách module và nhiệm vụ từng agent đã hoàn thành.
6. Báo cáo sửa lỗi hành động lặp lại.
7. Kết quả unit, integration và regression tests.
8. Ảnh chụp các khu vực chính và các hành động đã kiểm thử.
9. Danh sách lỗi còn tồn tại và mức độ nghiêm trọng.
10. Kế hoạch tích hợp vào ứng dụng chính ở giai đoạn sau — chỉ lập kế hoạch, không thực hiện.

Phải phân biệt rõ:

- Đã hoàn thành và kiểm chứng.
- Đã code nhưng chưa kiểm chứng.
- Chưa thực hiện.
- Bị chặn bởi giới hạn công cụ hoặc môi trường.

Không báo cáo test pass nếu chưa thực thi.

---

# PHẦN I — LỆNH BẮT ĐẦU

Claude, hãy bắt đầu với vai trò trưởng dự án.

**Việc đầu tiên là audit repository, xem tài liệu tham khảo, xác định nguyên nhân lỗi hành động chỉ chạy một lần và thiết kế kiến trúc demo độc lập.**

Sau đó:

1. Đề xuất module contract.
2. Chia công việc cho 4 agent.
3. Xác định dependency và file ownership.
4. Lập kế hoạch triển khai theo phase.
5. Trình bày những rủi ro cần giải quyết trước.
6. Chờ phê duyệt trước khi thay đổi các file lõi hoặc triển khai lên môi trường dùng chung.

Sau khi được phê duyệt, hãy triển khai từng phase, kiểm thử và review trước khi tiếp tục.

**Ưu tiên hàng đầu:** demo độc lập, chất lượng hình ảnh, hành động có thể thực thi lặp lại, animation tự nhiên, trải nghiệm học tiếng Anh mạch lạc và kiến trúc đủ sạch để mở rộng về sau.

Không đánh đổi tính ổn định để lấy số lượng tính năng.

## Cách triển khai mình khuyên dùng

Sau khi đưa prompt này cho Claude, hãy yêu cầu Claude chỉ làm Phase 1 trước. Đừng để bốn agent lập tức code đồng thời, vì khi chưa thống nhất API và file ownership, bạn có thể gặp lại chính vấn đề đang muốn giải quyết.

Khi Claude trả về báo cáo audit, cần xác nhận ba điều trước khi cho phép code:

1. Đã xác định được nguyên nhân thật sự khiến hành động chỉ chạy một lần.
2. Có bản thiết kế hình ảnh và bố cục sân bay được duyệt.
3. Có module contract và cách chạy demo độc lập mà không tác động website chính.

Sau đó mới cho agent làm song song. Đây là cách giữ cho bản demo sân bay vừa có chất lượng hình ảnh, vừa không làm rối hệ thống English Life World hiện tại.### ADDITIONAL REQUIREMENT — OPEN 2.5D AIRPORT MAP & CLICK-TO-MOVE

Thiết kế lại map sân bay theo dạng **open map 2.5D rộng, có chiều sâu, kết nối liền mạch 3–4 khu vực chính**, thay vì chia thành nhiều màn hình hoặc căn phòng độc lập.

**1. Bố cục thế giới**
- Tạo một map sân bay rộng gồm 3–4 khu vực có thể nhìn thấy hoặc khám phá liên tục, ví dụ: sảnh check-in, khu kiểm tra an ninh, phòng chờ và khu cửa lên máy bay.
- Các khu vực được kết nối bằng hành lang, lối đi và không gian chuyển tiếp hợp lý.
- Người chơi có thể di chuyển giữa các khu vực mà không cần tải lại toàn bộ scene hoặc chuyển màn hình đột ngột.
- Sử dụng phối cảnh 2.5D nhất quán, các lớp foreground/background, chiều sâu và cách sắp xếp vật thể phù hợp.
- Bố trí quầy, ghế, bảng điện tử, vali, cửa, NPC và các vật thể tương tác sao cho dễ nhận diện, không gây cản trở đường đi.
- Thiết kế map có thể mở rộng thêm khu vực trong tương lai mà không phải viết lại hệ thống di chuyển.

**2. Click-to-Move — Điều khiển bằng click**
- Khi người chơi click vào một vị trí hợp lệ trên mặt đất, nhân vật tự di chuyển đến vị trí đó.
- Có phản hồi trực quan nhẹ tại điểm được click, chẳng hạn vòng tròn hoặc dấu chân.
- Nhân vật tự quay đúng hướng và chuyển animation giữa idle, walk và run khi phù hợp.
- Nếu click vào đồ vật hoặc NPC có thể tương tác, ưu tiên xử lý tương tác theo quy tắc rõ ràng: nhân vật đi đến vị trí tiếp cận hợp lệ rồi mới thực hiện hành động.
- Không để nhân vật đi xuyên tường, quầy, ghế hoặc các vật thể được đánh dấu là vật cản.
- Khi điểm đến bị chặn, hệ thống phải tìm đường thay thế hoặc thông báo vị trí không thể tiếp cận.
- Cho phép người chơi click điểm đến mới trong khi nhân vật đang di chuyển; xử lý lệnh mới ổn định, không để nhiều chuyển động xung đột.

**3. Camera và khả năng quan sát**
- Camera theo dõi nhân vật một cách mượt mà khi cần, nhưng không rung hoặc di chuyển quá nhanh.
- Cho phép người chơi quan sát các khu vực lân cận mà không làm mất phương hướng.
- Không để HUD, hội thoại hoặc bảng nhiệm vụ che các khu vực quan trọng.
- Nếu map lớn hơn vùng hiển thị, sử dụng camera scrolling và giới hạn camera theo biên map.
- Đảm bảo vị trí click được chuyển đổi chính xác sang tọa độ thế giới khi camera dịch chuyển hoặc màn hình thay đổi kích thước.

**4. Hệ thống di chuyển và va chạm**
- Tách hệ thống điều khiển nhân vật, tìm đường, va chạm và tương tác thành các thành phần có trách nhiệm rõ ràng.
- Ưu tiên thuật toán tìm đường phù hợp với cấu trúc map, chẳng hạn navigation grid hoặc A*, tùy kiến trúc thực tế.
- Phân biệt vùng đi được, vùng cấm và vùng tương tác.
- NPC và pet phải tuân theo quy tắc di chuyển riêng, không gây kẹt nhân vật chính.
- Không hard-code đường đi riêng cho từng nhiệm vụ nếu có thể dùng chung navigation system.

**5. Tiêu chí nghiệm thu**
- Click nhiều vị trí trên toàn map và nhân vật đến đúng đích.
- Đi qua lại giữa cả 3–4 khu vực mà không cần tải lại scene.
- Click đồ vật từ xa khiến nhân vật tự đi đến vị trí thích hợp trước khi tương tác.
- Không xuyên vật cản, không đi ra ngoài biên map.
- Click điểm mới giữa hành trình không gây lỗi trạng thái.
- Camera, tọa độ click và đường đi vẫn chính xác khi resize cửa sổ.
- Chạy được trên desktop và có phương án điều khiển phù hợp cho mobile.

Hãy ưu tiên hoàn thiện một map rộng có thể khám phá thực sự trước khi thêm nhiều khu vực. Không chỉ tạo hình ảnh map lớn nhưng nhân vật không thể di chuyển tự do trong đó.