# Nhật ký Thay đổi (CHANGELOG) - StudyGrid Scheduler

Tất cả các cập nhật, cải tiến và sửa đổi của hệ thống **StudyGrid Scheduler** được ghi nhận chi tiết tại đây.

---

## [1.1.0] - 2026-06-04
### Đã thêm/Cải tiến (Added/Improved)
- **Nút chuyển đổi giao diện Sáng / Tối (Theme Toggle):**
  - Tích hợp nút chuyển đổi giao diện linh hoạt giữa chế độ sáng (Light Mode - tone nền sữa dừa thanh nhã, độ tương phản hoàn hảo) và chế độ tối (Dark Mode - Cosmic Slate đặc trưng cực dịu mắt khi sử dụng ban đêm).
  - Sử dụng biến CSS động cấp độ gốc (`:root`) kết hợp cơ chế `@theme` của Tailwind CSS v4 giúp quá trình chuyển đổi giao diện phản hồi mượt mà trong chớp mắt mà không bị giật rè hay giảm hiệu năng.
  - Tự động ghi nhớ và lưu trữ lựa chọn giao diện cá nhân của người dùng vào `localStorage` phục vụ cho các lần truy cập tiếp theo.
- **Sửa nhanh lớp học phần:** Cho phép sửa đổi hoặc xóa mọi thuộc tính (tên lớp, thứ, tiết đầu, số tiết, phòng học, giảng viên) trực tiếp ngay trên danh sách và phản hồi đồng bộ tức thì trên thời khóa biểu.
- **Đánh dấu môn bắt buộc (Pin/Must-Include):**
  - Thêm tính năng 📌 Pin học phần để đánh dấu một lớp học là khẩn cấp hoặc ưu tiên bắt buộc học.
  - Thuật toán giải Solver tự động giữ lại lớp được "Pin", tối ưu hóa xung quanh lớp đó và bỏ qua các biến thể khác của môn.
  - Hiển thị nhãn cảnh báo nếu xảy ra xung đột không thể tránh khỏi giữa lớp bắt buộc và thời gian bận rộn cá nhân.
  - Tích hợp biểu tượng badge `🔒 Bắt buộc` nổi bật trên giao diện lưới Lịch biểu để dễ dàng quan sát trực giác.

---

## [1.0.3] - 2026-06-04
### Đã thêm/Sửa đổi (Added/Improved)
- **Khu vực hiển thị danh sách bận cá nhân mới:** Di chuyển danh sách các lịch bận đã thêm lên vị trí trực quan nằm ngay bên dưới nút "Thêm lịch bận cá nhân" thuộc Form nhập liệu.
- **Tùy biến bộ chọn tiết học thông minh:**
  - Sửa đổi các trường cấu hình thời gian ("Tiết đầu" và "Số tiết") của cả học phần bận và môn học chính thức sang dạng kết hợp **vừa có thể nhập trực tiếp bằng tay bằng số** vừa **có thể bấm chọn trực tiếp** từ danh sách thả xuống nhờ công cụ bộ nhớ dữ liệu tích hợp sẵn (`<datalist>` hỗ trợ nhập thông minh các số từ 1 đến 12).
  - Thêm xử lý sự kiện `onBlur` để tự động chuẩn hóa dữ liệu nhập của người dùng về khoảng giá trị hợp lệ học đường $[1; 12]$.

---

## [1.0.2] - 2026-06-04
### Cải tiến giao diện (UI Polish)
- **Tăng cường trải nghiệm di động của Grid lịch tuần:** Bọc toàn bộ bảng thời khóa biểu trung tâm trong một khối phần tử cho phép cuộn ngang (`overflow-x-auto`) bảo đảm chiều rộng tối thiểu 760px để nội dung các hộp lớp luôn hiển thị rõ nét, không bị dính chữ trên thiết bị di động.
- **Lưới lịch đồng đều:** Sử dụng bộ khung `calendar-grid` CSS Grid phân tách rõ ràng dải phân làn cho các cột, giúp việc nhận biết thứ và tiết tiện lợi hơn.

---

## [1.0.1] - 2026-06-03
### Khởi động Hệ thống (Initial System)
- Khởi động dự án lập kế hoạch học tập sinh viên **StudyGrid Scheduler**.
- Triển khai động cơ giải thuật toán Backtracking đệ quy tối ưu hóa lịch chồng chéo.
- Thiết kế giao diện chủ đề Cosmic Slate đêm sâu huyền ảo cho ứng dụng.
