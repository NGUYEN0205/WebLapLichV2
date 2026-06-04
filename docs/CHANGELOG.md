# Nhật ký Thay đổi (CHANGELOG) - StudyGrid Scheduler

Tất cả các cập nhật, cải tiến và sửa đổi của hệ thống **StudyGrid Scheduler** được ghi nhận chi tiết tại đây.

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

## [1.0.1] - 2026-06-04
### Khởi động Hệ thống (Initial System)
- Khởi động dự án lập kế hoạch học tập sinh viên **StudyGrid Scheduler**.
- Triển khai động cơ giải thuật toán Backtracking đệ quy tối ưu hóa lịch chồng chéo.
- Thiết kế giao diện chủ đề Cosmic Slate đêm sâu huyền ảo cho ứng dụng.
