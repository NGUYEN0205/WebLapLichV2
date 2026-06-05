# Nhật ký Thay đổi (CHANGELOG) - StudyGrid Scheduler

Tất cả các cập nhật, cải tiến và sửa đổi của hệ thống **StudyGrid Scheduler** được ghi nhận chi tiết tại đây.



## [1.1.2] - 2026-06-05
### Chuyển đổi Sidebar thành Drawer trên Mobile/Tablet
- **Thiết kế Drawer Slide-in tiện lợi:**
  - Sidebar không còn chiếm trọn màn hình và chặn toàn bộ lịch biểu trên các thiết bị Mobile và Tablet (< 1024px). Giờ đây, Sidebar sẽ hoạt động giống như một Drawer trượt từ trái sang (`translate-x`) cực kỳ êm ái và mượt mà.
  - Tích hợp lớp phủ tối mờ (`backdrop-blur-sm bg-black/50`) cho phép nhấp vào vùng trống để tự động đóng Drawer.
- **Nút điều hướng và tương tác thông minh:**
  - Thêm biểu tượng menu Hamburger trên Header chính để mở Sidebar dễ dàng chỉ với một cú chạm.
  - Thêm nút Đóng gọn gàng (`X`) ở góc phải của Drawer trên thiết bị di động.
  - Cơ chế tự động đóng Drawer thông minh ngay khi người dùng chọn tab mới từ thanh điều hướng di động (Bottom Navigation) giúp tối ưu hóa không gian làm việc.

---
### Tinh chỉnh Header, Navigation & Modal Backdrop
- **Cải tiến Header chính & Thanh điều hướng Bottom:**
  - Chuyển đổi màu sắc ở Header và thanh điều hướng di động sang các biến giao diện động (`bg-brand-surface/80`, `border-brand-border`, `bg-brand-surface/90`) giúp giao diện cực kỳ mượt mà, sáng sủa và thanh thoát.
  - Thiết kế lại các tab điều hướng trên máy tính với kiểu dáng bo tròn (pill style) cao cấp thay cho kiểu viền gạch dưới truyền thống, kết hợp hiệu ứng đổ bóng chủ động sắc nét và màu sắc nhấn thương hiệu dịu mát.
- **Tối ưu hóa Backdrop & Hộp thoại Cài đặt:**
  - Chuyển đổi lớp phủ mờ của hộp thoại cài đặt thuật toán sang màu nền bán trong suốt sang trọng (`bg-black/50 backdrop-blur-md`).
  - Đồng bộ hóa đường viền và màu sắc của các nút tương tác bên trong hộp thoại theo đúng ngôn ngữ thiết kế chung.

---

## [1.1.1] - 2026-06-05
### Nâng cấp Giao diện Sáng (Light Theme Upgrade)
- **Tối ưu hóa độ tương phản và chiều sâu thẩm mỹ:**
  - Hoán đổi màu nền chính sang tone tím lavender mềm mại `#F0EEF8` tạo chiều sâu trực quan vượt trội so với màu cũ nhạt nhẽo.
  - Tận dụng màu tương tác Primary tím violet đậm `#5B21B6` đáp ứng xuất sắc tiêu chuẩn WCAG về độ tương phản, chữ hiển thị rõ nét như in.
  - Cải tiến toàn diện các hộp thoại đầu vào (`input`, `select`) phủ lớp nền trắng thuần khiết `#FFFFFF` và viền tím dịu sắc nét, giải quyết triệt để vấn đề chữ nhòe/khó đọc trong Light Theme.
  - Tái cấu trúc hiệu ứng bóng kính (`glass-panel`) bằng lớp đổ bóng sâu (`box-shadow`) sang trọng thay vì viền thô cứng, mang lại trải nghiệm bố cục nổi ba chiều hiện đại.
- **Loại bỏ màu tối cứng (hardcoded dark colors) trong Sidebar:**
  - Chuyển đổi toàn bộ màu chữ, màu nền, các nút bấm tùy chỉnh và viền phân tách trong Sidebar sang sử dụng biến thiết kế CSS động (`text-brand-text`, `text-brand-text-muted`, `border-brand-border`, `bg-brand-surface-highest`, v.v.).
  - Giúp Sidebar hiển thị đồng bộ mượt mà, sáng sủa, sắc nét và hài hòa khi chuyển đổi giao diện Sáng / Tối.
- **Khắc phục màu tối cứng trong Cột lịch biểu (CalendarGrid):**
  - Chuyển đổi toàn bộ màu chữ `text-[#e8dfee]`, `text-[#958da1]`, viền `border-[#4a4455]`, và hộp thoại chi tiết (selected details drawer) sang sử dụng token dải màu thương hiệu động.
  - Thiết kế lại thẻ "LỊCH BẬN CỐ ĐỊNH" trên lưới, tăng độ tương phản rõ rệt trên nền sáng nhằm đem lại cảm giác sang trọng, trang nhã.
  - Cải tiến nút bấm và nền dải tiêu đề ngày/tiết hài hòa đồng bộ giữa hai chế độ Sáng / Tối.

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
