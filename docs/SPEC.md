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
  - Trạng thái ghim bắt buộc (`isPinned` - Tùy chọn)

- **Các chức năng nâng cao (Mới cập nhật):**
  - **Sửa nhanh lớp học phần (Quick Edit):** Mỗi lớp học phần hiển thị nút sửa (`Pencil`) cho phép chỉnh sửa mọi thông tin trực tiếp thông qua form inline gọn gàng, giảm khâu nhập lại phức tạp. Đồng thời hỗ trợ nút xóa nhanh (`X`) trực quan.
  - **Đánh dấu môn bắt buộc (Pin Class):** Sinh viên có thể ghim (`Pin`) lớp học phần cực kỳ quan trọng. Thuật toán tối ưu hóa sẽ luôn giữ lại duy nhất lớp học này của môn học và tự động sắp xếp các môn khác xung quanh nó.

### 2.3 Bộ lọc và Thuật toán Tìm kiếm Lịch tối ưu (Timetable Solver Engine)
- Hệ thống áp dụng thuật toán Tìm kiếm Quay lui (Backtracking - Depth First Search) để quét qua tất cả các tổ hợp lớp học có thể có của các môn học đang hoạt động (`active`).
- **Quy tắc kiểm tra hợp lệ và Ràng buộc Ghim (Pin constraint):**
  - Nếu một môn học có lớp đã được đánh dấu ghim bắt buộc (`isPinned`), thuật toán sẽ tự động bỏ qua toàn bộ các lớp học khác của môn đó, chỉ thử phương án đã ghim.
  - Một phương án lịch được xem là hợp lệ nếu tất cả các lớp học phần được chọn thuộc các môn học khác nhau không xảy ra hiện tượng **trùng tiết học** (overlap) với nhau.
  - Các tiết học không ghim không được phép đè lên bất kỳ **khoảng thời gian bận cá nhân** nào đã khai báo từ trước.
  - **Cảnh báo xung đột thông minh (Pin Conflict Warnings):** Trong trường hợp lớp được ghim bắt buộc trùng giờ với lịch bận cá nhân, thuật toán vẫn sẽ giữ phương án nhưng phát hiện và đưa ra cảnh báo (màu đỏ) ở góc trên màn hình để hỗ trợ sinh viên điều chỉnh.
- **Kết quả đầu ra:**
  - Trả về danh sách tất cả các phương án thời khóa biểu khả thi. Kèm theo bộ điều hướng (Trang trước/Trang sau) để duyệt qua từng giải pháp.
  - Nếu không có phương án nào phù hợp, hệ thống sẽ cảnh báo không tìm thấy kết quả và đề xuất sinh viên điều chỉnh lại các lớp học phần hoặc lịch bận.

### 2.4 Quản lý Deadline Đăng ký Học phần (US-16)
- **Mô tả nghiệp vụ:** Để đảm bảo sinh viên không bao giờ bỏ lỡ thời hạn đăng ký tín chỉ cực kỳ quan trọng của nhà trường (do thời gian đăng ký thường diễn ra ngắn và có tính cạnh tranh cao), hệ thống hỗ trợ tích hợp bộ đồng hồ đếm ngược trực quan hiển thị liên tục theo thời gian thực và phát cảnh báo nhắc nhở tự động theo các mốc thời gian thiết yếu.
- **Thông tin quản lý chi tiết:**
  - Tên học kỳ tuyển sinh hoặc đăng ký (ví dụ: "Học kỳ 1 2026-2027").
  - Mốc thời gian đóng cổng đăng ký (Deadline ngày giờ).
  - Thời điểm tạo lập bản ghi (`createdAt`) nhằm đối chiếu tỷ lệ tiến trình thời gian trôi qua.
  - Nhật ký quản lý trạng thái gửi thông báo (`notificationSent` cho mốc 24h, 6h, 1h) bảo đảm không gửi lặp lại trùng lặp thông tin quấy rầy sinh viên.
- **Luồng tương tác người dùng từng bước:**
  1. Người dùng mở thanh Sidebar bên trái, cuộn tới vùng **"Deadline Đăng ký"** nằm ngay trên khung "Lịch cá nhân cố định".
  2. Nếu chưa thiết lập hạn đăng ký, hệ thống hiển thị Form tạo mới trực quan yêu cầu điền: Tên học kỳ và Bộ chọn ngày giờ cụ thể (hỗ trợ lịch biểu datetime-local thuận tiện).
  3. Khi nhấn nút "Kích hoạt nhắc nhở đăng ký", trình duyệt sẽ yêu cầu quyền gửi thông báo đẩy (`Notification.permission`). Sau khi được xác nhận từ người dùng, dữ liệu lập tức được lưu giữ an toàn xuống `localStorage` dưới mã nhận diện `"studygrid_deadline"`.
  4. Hệ thống ngay lập tức chuyển đổi sang **màn hình đếm ngược cơ học (Flip clock design)** biểu diễn động 4 trường thông tin: Ngày - Giờ - Phút - Giây liên tục giảm dần theo từng giây.
  5. Đi kèm là thanh tiến trình năng động có khả năng co giãn và thay màu tự động theo mức độ khẩn cấp (upcoming: màu xanh tươi, warning: màu vàng cảnh báo, critical: màu đỏ nhấp nháy liên tục, expired: màu xám dập tắt).
  6. Ở chế độ nền, hệ thống duy trì bộ định thời thông minh. Khi thời gian tiến sát đến các mốc cảnh báo nghiêm trọng (24 giờ, 6 giờ, và 1 giờ trước hạn chót), trình duyệt sẽ lập tức bắn ra **thông báo đẩy hệ thống (OS Native Push Notifications)** cảnh báo sinh viên quay lại tối ưu hóa và liên kết in ấn lịch biểu tức thì.
  7. Người dùng có thể xóa nhanh cấu hình hạn chót bất kỳ lúc nào bằng biểu tượng thùng rác màu đỏ để thiết lập lại mốc thời gian mới từ đầu.
- **Tính năng tương thích khi không có quyền thông báo:**
  - Trong trường hợp trình duyệt không hỗ trợ hoặc người dùng từ chối cấp quyền thông báo đẩy (như trên môi trường Iframe bị chặn quyền Sandbox), ứng dụng vẫn duy trì bộ đếm ngược trực quan sắc nét và thanh tiến trình đổi màu nhấp nháy trên màn hình chính, ngăn ngừa triệt để mọi lỗi sập JavaScript (Runtime safe-guards) để đảm bảo trải nghiệm của sinh viên luôn được mượt mà tuyệt đối.

---

## 3. Đặc tả Giao diện Người dùng (UI/UX Specification)

Giao diện được thiết kế theo phong cách tối giản hiện đại với độ tương phản tốt, linh hoạt chuyển đổi giữa hai chủ đề sáng và tối.

### 3.1 Bố cục chính và Chế độ hiển thị màu sắc
- **Nút chuyển chủ đề (Theme Toggle):** Biểu tượng Mặt trời/Mặt trăng nằm trên thanh điều hướng góc trên bên phải giúp hoán đổi giữa:
  - **Chủ đề Tối (Dark Mode - Mặc định):** Đêm tối sâu thẳm sang trọng (Cosmic Slate), bảo vệ thị lực ban đêm.
  - **Chủ đề Sáng (Light Mode):** Sạch sẽ, bóng bẩy, độ sắc nét chữ nổi bật với nền mềm mại giúp thao tác trực quan hơn. Lọc theo lựa chọn người dùng và đồng bộ hoá qua `localStorage`.
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
