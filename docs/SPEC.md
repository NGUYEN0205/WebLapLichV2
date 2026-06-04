# Tài liệu Đặc tả Yêu cầu Kỹ thuật (SPEC) - StudyGrid Scheduler

Tài liệu này mô tả chi tiết các yêu cầu chức năng, phi chức năng và giao diện người dùng của ứng dụng **StudyGrid Scheduler** - Hệ thống lập và tối ưu hóa thời khóa biểu thông minh dành cho sinh viên.

---

## 1. Tổng quan Dự án

- **Tên ứng dụng:** StudyGrid Scheduler
- **Mục tiêu:** Giúp sinh viên tự động tìm kiếm, tính toán và lựa chọn các phương án thời khóa biểu tối ưu (không bị trùng lịch) dựa trên danh sách môn học mong muốn, các nhóm lớp học phần sẵn có và lịch bận rộn cố định cá nhân (như làm thêm, học ngoại ngữ tại trung tâm).
- **Ngôn ngữ người dùng:** Tiếng Việt.

---

## 2. Các Luồng Nghiệp vụ Chính (Core Workflows)

### 2.1 Quản lý Lịch bận Cá nhân (Fixed Busy Schedule)
- Để đảm bảo thời khóa biểu học tập không trùng với lịch cá nhân bên ngoài, người dùng có thể thêm các khoảng thời gian "bận cố định".
- **Thông tin lịch bận:**
  - Tên hoạt động (ví dụ: "Đi làm thêm", "Học Anh văn",...)
  - Thứ trong tuần (Thứ 2 đến Chủ nhật)
  - Tiết bắt đầu (1 đến 12)
  - Số tiết chiếm dụng (1 đến 12)
- **Cách thức tương tác:**
  - Nhập trực tiếp tên hoạt động qua ô input.
  - Chọn hoặc nhập thủ công tiết đầu và số tiết nhờ hỗ trợ của thẻ danh sách tùy chọn tự động (`<datalist>` từ 1 đến 12).
  - Danh sách các lịch bận đã thêm được hiển thị danh sách trực quan ngay phía dưới nút tạo mới kèm theo nút Xóa nhanh (`X`) để người dùng dễ theo dõi và điều chỉnh tức thời.

### 2.2 Quản lý Học phần và Các Phương án Lớp Học (Subject & Class Option Management)
- Sinh viên thêm các môn học cần đăng ký trong học kỳ.
- Với mỗi môn học, sinh viên định nghĩa nhiều phương án lớp học phần (Ví dụ: Môn Toán giải tích có Lớp 01 học Thứ 2 tiết 1-3, Lớp 02 học Thứ 3 tiết 4-6).
- **Thông tin môn học:**
  - Tên môn học
  - Màu sắc đại diện (Tự động gán hoặc tùy chỉnh)
- **Thông tin lớp học phần:**
  - Tên lớp (Ví dụ: "Lớp 01", "Lớp L02")
  - Thứ trong tuần (Thứ 2 đến Chủ nhật)
  - Tiết bắt đầu (1 đến 12)
  - Số tiết kéo dài
  - Phòng học (Tùy chọn)
  - Giảng viên phụ trách (Tùy chọn)

### 2.3 Bộ lọc và Thuật toán Tìm kiếm Lịch tối ưu (Timetable Solver Engine)
- Hệ thống áp dụng thuật toán Tìm kiếm Quay lui (Backtracking - Depth First Search) để quét qua tất cả các tổ hợp lớp học có thể có của các môn học đang hoạt động (`active`).
- **Quy tắc kiểm tra hợp lệ:**
  - Một phương án lịch được xem là hợp lệ nếu tất cả các lớp học phần được chọn thuộc các môn học khác nhau không xảy ra hiện tượng **trùng tiết học** (overlap) với nhau.
  - Đồng thời, các tiết học này không được phép đè lên bất kỳ **khoảng thời gian bận cá nhân** nào đã khai báo từ trước.
- **Kết quả đầu ra:**
  - Trả về danh sách tất cả các phương án thời khóa biểu khả thi. Kèm theo bộ điều hướng (Trang trước/Trang sau) để duyệt qua từng giải pháp.
  - Nếu không có phương án nào phù hợp, hệ thống sẽ cảnh báo không tìm thấy kết quả và đề xuất sinh viên điều chỉnh lại các lớp học phần hoặc lịch bận.

---

## 3. Đặc tả Giao diện Người dùng (UI/UX Specification)

Giao diện được thiết kế theo phong cách tối giản hiện đại (Cosmic Slate style) với độ tương phản cao, bảng màu đêm tối sâu thẳm kết hợp hiệu ứng kính mở ảo (`backdrop-blur`).

### 3.1 Bố cục chính
- **Cột thanh biên (Sidebar) bên trái:**
  - Quản lý lịch bận cá nhân (Thêm nhanh + xem danh sách đã thêm).
  - Quản lý các môn học & lựa chọn nhóm lớp.
  - Nút kích hoạt "Tính toán tối ưu lịch học" nổi bật.
- **Khu vực trung tâm (Main Workspace):** Chia thành 3 Tab chính nhờ thanh điều hướng trên cùng:
  1. **Lịch biểu (Timetable):** Hiện khung lưới thời gian hàng tuần gồm 8 cột (Cột Tiết và các cột ngày từ Thứ 2 đến Chủ nhật) và 12 hàng tương ứng 12 tiết học tiêu chuẩn Việt Nam.
  2. **Thống kê (Analytics):** Phân tích trực quan tần suất phân bổ học tập, số ngày trống lịch hoàn toàn, tổng số tiết học mỗi tuần.
  3. **Xuất bản (Export):** Cho phép sao chép dữ liệu JSON cấu hình Thời khóa biểu hoặc tải tệp lưu trữ ngoại tuyến.

---

## 4. Các Yêu cầu Phi chức năng

- **Lưu trữ dữ liệu:** Toàn bộ dữ liệu lịch bận và môn học được tự động lưu trữ và đồng bộ hóa tức thời vào `localStorage` của trình duyệt web nhằm duy trì trạng thái khi người dùng tải lại trang.
- **Trải nghiệm responsive:** Tương thích mượt mà từ màn hình Ultra-wide trên máy tính để bàn đến các thiết bị di động. Khung lưới lịch học có tính năng tự động tràn ngang (`overflow-x-auto`) để tránh vỡ bố cục trên màn hình nhỏ.
