# Nhật ký Thay đổi (CHANGELOG) - StudyGrid Scheduler

Tất cả các cập nhật, cải tiến và sửa đổi của hệ thống **StudyGrid Scheduler** được ghi nhận chi tiết tại đây.



## [1.1.8] - 2026-06-05
### Đồng bộ Hóa và Hoàn thiện Toàn diện Tài liệu Kỹ thuật Tích hợp (US-16 Spec & Architecture)
- **Đặc tả Tài liệu Nghiệp vụ (SPEC.md):**
  - Bổ sung cấu trúc mục riêng biệt **2.4 Quản lý Deadline Đăng ký Học phần (US-16)** làm nổi bật vai trò cốt lõi và các mốc thời gian cảnh báo của tính năng lật số đếm ngược.
  - Liệt kê luồng tương tác người dùng chuẩn từng bước (Step-by-step), bao gồm form nhập liệu, kích hoạt quyền thông báo đẩy của Trình duyệt và cơ chế tự phục hồi lỗi nếu Iframe bị chặn quyền.
- **Cập nhật Kiến trúc Hệ thống (ARCHITECTURE.md):**
  - Thiết lập sơ đồ cây thành phần rõ ràng `App` -> `Sidebar` -> `DeadlineWidget`.
  - Cung cấp sơ đồ luồng dữ liệu ASCII mô tả tiến trình lưu trữ, đồng bộ trạng thái `studygrid_deadline` và hệ thống Web Notifications API.
  - Làm rõ giải thuật xử lý múi giờ bằng mili-giây tuyệt đối dựa trên kỷ nguyên UTC và định dạng chữ bản địa hóa `toLocaleString("vi-VN")`.

---

## [1.1.7] - 2026-06-05
### Tích hợp Tính năng Nhắc nhở & Đếm ngược Hạn Đăng ký Học phần (US-16)
- **Tạo Component DeadlineWidget chuyên biệt:**
  - Thiết kế widget đếm ngược trực quan với 4 thẻ Ngày-Giờ-Phút-Giây hiển thị hiệu ứng lật mượt mà (Flip mechanical style) sử dụng `motion/react`.
  - Hỗ trợ thanh tiến trình thời gian co dãn động (Progress track) đổi màu sắc thông minh theo trạng thái khẩn cấp của hạn chót (Emerald -> Yellow -> Pulsing Red -> Dark Slate).
  - Tự động chạy bộ đếm thời gian thực chính xác 1-giây (Interval timer) và giải phóng bộ nhớ (cleanup effect) khi unmount.
- **Tương thích Hệ thống Thông báo và Lưu trữ Local:**
  - Tự động lưu trữ (JSON serialize/deserialize) cấu hình hạn chót xuống localStorage tương thích và đồng bộ sâu với cơ chế của StudyGrid.
  - Tích hợp Web Notifications API gửi thông báo đẩy của Trình duyệt trực tiếp theo các mốc giờ quan trọng (24h, 6h, 1h) khi sắp đóng cổng đăng ký.
- **Bố cục Responsive & Khả năng Tiếp xúc:**
  - Đặt thiết bị cảnh báo tối ưu ở góc trên cùng của thanh điều hướng bên (Sidebar), hiển thị nổi bật trên cả desktop và phiên bản di động.

---

## [1.1.6] - 2026-06-05
### Tối ưu hóa Toàn diện Trang Xuất bản (ExportTab) & Cửa sổ Cấu hình (Settings Modal)
- **Tinh chỉnh giao diện thẻ Xuất bản trực quan:**
  - Áp dụng đệm biên an toàn thông minh (`p-3 md:p-6 pb-20 lg:pb-6 ios-scroll`) cho trang ExportTab, bảo toàn nội dung tuyệt đối trên các dòng điện thoại thông minh.
  - Chuyển đổi lưới phân bổ các thẻ xuất file thành dạng thích ứng linh hoạt hơn (`md:grid-cols-2` thay vì chỉ hiển thị song song từ màn hình máy tính lớn), nâng tầm giao diện đồng bộ gọn gàng ngay trên cả máy tính bảng (iPad Portrait).
  - Tối ưu vùng hiển thị mẫu xem trước văn bản (`textarea`) với kích cỡ chữ tùy biến linh hoạt `text-[10px] md:text-xs` kèm lớp chống tràn nội dung `.break-all`.
- **Khắc phục triệt để khả năng cuộn trên Settings Modal:**
  - Cho phép cuộn đứng linh hoạt (`overflow-y-auto items-start md:items-center`) bao bọc quanh cấu trúc Popup lớn nhằm bảo vệ khả năng tương tác trên các màn hình xoay ngang (Landscape Mobile) hoặc kích hoạt hướng dẫn học thuật có không gian biểu diễn hạn chế.
  - Thiết lập chiều cao tối đa thông minh `max-h-[90vh]` kèm việc thu nhỏ nút tương tác phụ và đệm khung để vừa vặn hơn trên các thiết bị bỏ túi.

---

## [1.1.5] - 2026-06-05
### Tối ưu hóa Toàn diện Trang Phân tích & Đánh giá (AnalyticsTab)
- **Tái thiết kế lưới chỉ số KPIs (Bento Grid):**
  - Chuyển đổi lưới chỉ số sang bố cục 2 cột mặc định cho điện thoại (`grid-cols-2 md:grid-cols-2 lg:grid-cols-4`) và áp dụng thiết lập đệm mượt, sắc nét.
  - Tinh giản thiết kế thẻ thống kê (`p-3 md:p-4`) và tối ưu kích thước chữ số nổi bật (`text-2xl md:text-3xl`) tránh hiện tượng tràn chữ trên các thiết bị có chiều ngang hẹp.
- **Biểu đồ phân bổ thích ứng tuyệt đối:**
  - Bọc toàn bộ đồ thị biểu diễn theo phân đoạn ngày (`flex-col`) vào khối cuộn cảm ứng thông minh `-mx-1 overflow-x-auto` nhằm cho phép cuộn vuốt mượt mà nếu độ phân giải màn hình thấp.
  - Đồng bộ các mã màu và thay thế các giá trị màu hex cố định sang dải token màu thương hiệu động, sáng sủa và rạng rỡ.
- **Bố cục khung đệm trống (Empty State) cân đối:**
  - Bo tròn bo viền của block thông báo khi chưa tính toán (`rounded-2xl md:rounded-3xl`) và giảm thể tích icon để tạo độ thông thoáng dễ chịu cho người dùng mới.

---

## [1.1.4] - 2026-06-05
### Hỗ trợ Notch & Vùng An toàn (Safe Area) trên Thiết bị iOS
- **Khắc phục lỗi hiển thị bị che trên iOS / Di động:**
  - Chuyển đổi khung hiển thị chính sang đơn vị chiều cao dynamic viewport `h-[100dvh]` thay cho `h-screen` (`100vh`) truyền thống để ngăn thanh địa chỉ trình duyệt trên di động che mất các phần tử phía dưới trang.
  - Tích hợp thêm thuộc tính `viewport-fit=cover` vào thẻ `<meta name="viewport">` trong `index.html` nhằm mở rộng hiển thị ra toàn bộ khung viền của iPhone thế hệ mới có tai thỏ (Notch).
- **Thiết lập đệm lót Vùng An toàn tự động (Safe Area Insets):**
  - Tạo các biến đệm tự động `bottom-nav-safe` để tự mở rộng thêm khoảng trống tương ứng cho thanh Bottom Navigation trên các màn hình viền mỏng (hạn chế chạm nhầm Home Indicator).
  - Áp dụng các quy tắc an toàn `sidebar-safe-bottom` và `content-safe-bottom` cho phép các khối danh sách luôn hiển thị trọn vẹn, không bị chồng đè bởi các thanh chức năng di động.
- **Tăng tốc độ cuộn mượt cảm ứng (`ios-scroll`):**
  - Tích hợp tối ưu hóa gia tốc phần cứng `-webkit-overflow-scrolling: touch` cho toàn bộ các thanh cuộn của khung làm việc và Sidebar giúp thao tác lướt trang cực nhanh, nhạy bén và không có hiện tượng giật lag trên thiết bị cầm tay.

---

## [1.1.3] - 2026-06-05
### Tối ưu hóa Toàn diện Lưới Lịch biểu & Trải nghiệm Cuộn Touch trên Di động
- **Khắc phục khoảng trống và nâng cao bố cục responsive:**
  - Tích hợp thêm khoảng giãn biên dưới thông minh (`pb-20 lg:pb-6`) trên lưới lịch biểu giúp bảo vệ nội dung không bị che khuất bởi thanh điều hướng Bottom Navigation của thiết bị di động.
  - Chuyển đổi hộp chi tiết (`selectedDetails`) thành một hộp thoại Bottom Sheet thời thượng, thích ứng tự nhiên kết hợp thanh dải nhận diện đặc trưng phía trên và lớp phủ đen mờ sang trọng trên màn hình nhỏ, trong khi vẫn giữ nguyên bố cục bảng thông tin trôi nổi thanh thoát trên máy tính.
- **Tối ưu trải nghiệm vuốt cuộn phần cứng:**
  - Áp dụng kỹ thuật cuộn mượt dựa trên chuyển động gia tốc của thiết bị (`-webkit-overflow-scrolling-touch scroll-smooth` kết hợp `scroll-snap`) giúp trải nghiệm lướt ngang lưới lịch trên iOS và Android đạt độ cảm ứng mượt mà tuyệt đối.
  - Tinh chỉnh các kích thước khung đệm màn hình trung gian (tablet và di động) với bề ngang tối thiểu tương thích (`min-w-[600px] md:min-w-[760px]`) và làm nhỏ cỡ chữ tiêu đề tiết học để tránh tràn màn hình.

---

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
