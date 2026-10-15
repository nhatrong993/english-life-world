# Hướng dẫn Tự động Deploy lên Cloudflare Pages qua GitHub

Dự án được cấu hình tự động đóng gói (`tools/make_dist.py`) và deploy lên **Cloudflare Pages** mỗi khi có code mới push lên nhánh `main` thông qua GitHub Actions (`.github/workflows/deploy-pages.yml`).

## 1. Thêm Secrets trên GitHub (chỉ làm 1 lần)

1. Mở trang repo trên GitHub: `https://github.com/nhatrong993/english-life-world`
2. Vào **Settings** → **Secrets and variables** → **Actions**.
3. Nhấn nút **New repository secret** và thêm lần lượt 2 secret sau (lấy giá trị từ file `.env` / `.env.txt` trên máy của bạn):
   - **`CLOUDFLARE_API_TOKEN`**: Giá trị biến `CLOUDFLARE_API_TOKEN` trong file `.env` trên máy.
   - **`CLOUDFLARE_ACCOUNT_ID`**: Giá trị biến `CLOUDFLARE_ACCOUNT_ID` trong file `.env` trên máy.

> **Lưu ý:** Tuyệt đối không commit file `.env` hoặc dán trực tiếp token vào code/workflow.

## 2. Cơ chế Tự động Cập nhật

- Sau khi cài đặt xong 2 secret trên, mỗi lần bạn `git push` lên nhánh `main`:
  1. GitHub Actions tự chạy `python tools/make_dist.py` để tạo thư mục `dist/` sạch (`index.html`, `modules/*.js`, `assets/`).
  2. Wrangler tự động deploy `dist/` lên dự án Cloudflare Pages `english-life-world`.
  3. Trang web chính thức tại **https://english-life-world.pages.dev** sẽ tự động được cập nhật sau khoảng 1–2 phút.

## 3. Cách xem trạng thái Deploy (Tab Actions)

1. Truy cập tab **Actions** trên thanh menu của repo GitHub (`https://github.com/nhatrong993/english-life-world/actions`).
2. Chọn workflow **Deploy to Cloudflare Pages** ở danh sách bên trái (hoặc xem lần chạy mới nhất ở giữa trang).
3. Nhấn vào commit tương ứng để xem chi tiết từng bước:
   - Tích xanh (`✅`): Đã deploy thành công lên `english-life-world.pages.dev`.
   - Chấm vàng (`🟡`): Đang chạy đóng gói / tải lên.
   - Dấu đỏ (`❌`): Bấm vào bước `Deploy to Cloudflare Pages` để kiểm tra lại xem đã nhập đúng 2 secret `CLOUDFLARE_API_TOKEN` và `CLOUDFLARE_ACCOUNT_ID` chưa.
   - Bạn cũng có thể bấm nút **Run workflow** trong tab Actions để kích hoạt deploy thủ công bất kỳ lúc nào.
