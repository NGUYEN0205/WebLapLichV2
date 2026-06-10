Nhật ký Thay đổi (CHANGELOG) - StudyGrid Scheduler

Nhật ký ghi nhận lịch sử phát triển, tối ưu hóa hệ thống và hoàn thiện năng lực
ứng dụng qua các Sprint phát triển phần mềm.

[Sprint 6] - 2026-06-10 (Tương tác Kéo thả & Tiện ích Ngoài Màn hình)

Thêm mới & Cải tiến (Added & Improved)

- Thao tác kéo thả sắp xếp lịch học thuận tiện (S06-01 / US-18):
  - Cơ chế tương tác kéo thả: Thiết lập bộ xử lý sự kiện dựa trên API HTML5
    Drag-and-Drop, cho phép sinh viên nắm kéo trực tiếp thẻ lớp học phần
    ngay trên lưới lịch biểu.
  - Hiển thị Vùng Thả khả thi (Dynamic Drop Zones): Khi bắt đầu di chuyển
    một môn học, lưới lịch biểu tự động phân tích và hiển thị các ô đệm
    nét đứt màu xanh lá (border-dashed border-emerald-400
    bg-emerald-400/15) tại các khoảng thời gian trống có mở lớp thay thế khả
    thi của môn đó.
  - Đồng bộ bộ giải Backtracking: Thả thẻ học phần vào ô mới sẽ kích hoạt
    chế độ Ghim cố định phân hệ đó, ra lệnh cho bộ giải Backtracking cập
    nhật lại lịch học và tự động sắp xếp các môn còn lại xung quanh lớp vừa
    ghim.
  - Khắc phục lỗi hủy kéo của Trình duyệt (Drag-start Cancel Fix): Tích hợp
    bộ trì hoãn sự kiện setTimeout(..., 10) khi bắt đầu kéo (onDragStart),
    giúp trình duyệt khóa ảnh kéo của chuột ổn định trước khi React render
    lại DOM, hạn chế hiện tượng tự hủy phiên kéo của nhân Chromium do thay
    đổi layout phần tử nguồn.

- Tiện ích hiển thị thời khóa biểu ngoài màn hình - Widget nổi (S06-02 /
  US-17):
  - Cửa sổ nổi Always-on-top: Sử dụng công nghệ Document Picture-in-Picture
    API để khởi tạo một cửa sổ trình duyệt micro nổi độc lập trên màn hình
    Desktop máy tính, vượt ra khỏi không gian của tab web chính để ghim nổi
    trên mọi ứng dụng khác (Word, Excel, Discord, v.v.).
  - Đồng bộ React Portal & Stylesheet: Ứng dụng React createPortal để đồng
    bộ dữ liệu TKB thực và tự động sao chép toàn bộ tài nguyên
    CSS/Tailwind sang cửa sổ nổi, bảo toàn trọn vẹn giao diện Dark/Light
    mượt mà.
  - Bảng điều khiển Today's Agenda: Widget tự động lọc lịch học của ngày hôm
    nay, sắp xếp theo thời gian tăng dần, đánh dấu nổi bật bằng dải màu
    pulsing vàng rạng rỡ và badge Đang học cho các ca học đang diễn ra trong
    thực tế.
  - Giao diện kích hoạt: Thiết kế nút kích hoạt bằng biểu tượng răng cưa
    chuyên nghiệp Settings (lucide-settings w-4 h-4), tích hợp thông báo
    hướng dẫn kích hoạt an toàn nếu trình duyệt hoặc môi trường kết nối
    của người dùng chưa hỗ trợ API này.

[Sprint 5] - 2026-06-09 (Hệ Sinh Thái Bản Nháp, JSON, Chia Sẻ & So Sánh Song Song)

Thêm mới & Cải tiến (Added & Improved)

- So sánh phương án lịch song song - Side-by-Side (S05-01 / US-12):
  - Giao diện phân chia đa thiết bị (Split-Screen): Hỗ trợ chế độ đối chiếu
    hai phương án thời khóa biểu khác nhau cạnh nhau trên màn hình lớn. Trên
    thiết bị di động, hệ thống tự thích ứng chuyển đổi thành hai tab chuyển
    trang (Pill toggles) mượt mà để tránh chồng đập thông tin.
  - Chỉ số tóm tắt nhanh (Quick Statistics): Đầu mỗi cột so sánh tích hợp
    thanh thống kê nhanh tổng số tiết học, số ngày bận rộn và số ngày nghỉ
    trống hoàn toàn trong tuần để sinh viên cân đối mật độ học tập.
  - Visual Diff Highlighting chuyên sâu: Sử dụng giải thuật so khớp tập hợp
    Set để đối chiếu chéo các lớp học phần giữa hai bản nháp. Những ô lớp
    học nào chỉ có độc nhất ở một phương án sẽ được bọc viền vàng pulsing
    kèm đổ bóng tỏa sáng để người dùng dễ dàng nhận biết sự khác biệt.

- Lưu trữ nhiều phương án nháp cục bộ (S05-02 / US-10):
  - Snapshot lưu trữ cứng: Cho phép người dùng chụp lại tối đa 5 biến thể
    lịch biểu ưng ý nhất xuống bộ nhớ đệm localStorage dưới cấu hình nén.
  - Khôi phục nhanh: Giao diện tab đồng bộ hóa hiển thị danh sách nháp chi
    tiết với mã thời gian, số lượng môn học, xem trước danh sách môn dưới
    dạng chip màu thương hiệu và hỗ trợ tải ngược lên sidebar/lưới lịch
    trong 1 click.

- Tự động nhập dữ liệu từ file JSON (S05-03 / US-14):
  - Module Kéo - Thả file cấu hình: Thiết kế vùng kéo thả tệp tin .json trực
    quan với đường viền đứt đoạn đổi màu động khi di chuột qua, cho phép
    sinh viên tải tệp sao lưu cấu hình chỉ với thao tác kéo thả.
  - Đọc file an toàn & Công cụ di trú (Migration Engine): Đọc tệp thông qua
    FileReader với khối kiểm lỗi try/catch nghiêm ngặt, tự động gọi trình di
    trú migrateState để chuyển đổi các tệp cấu hình cũ (v1) dạng phẳng lên
    định dạng phân cấp môn học hoàn chỉnh (v2) mà không mất mát màu sắc
    hay thông tin phụ.
  - Bảo toàn trạng thái UI: Thiết lập cơ chế import không can thiệp vào các
    biến trạng thái giao diện đang hoạt động (như sidebar drawer đang mở,
    các ô gõ dở dang) và hiển thị chỉ báo Toast thành công màu xanh dịu tự
    động biến mất sau 2 giây.

- Chia sẻ Thời khóa biểu (S05-04 / US-11):
  - Kết xuất ảnh thời khóa biểu sắc nét: Hỗ trợ tính năng chụp ảnh màn hình
    lịch biểu với độ phân giải gấp đôi chuẩn Full HD (Scale: 2), đính kèm
    watermark tinh tế "StudyGrid" ở góc dưới cùng bên phải.
  - Nâng cấp công nghệ tương thích Tailwind v4: Sử dụng thư viện nâng cấp
    html2canvas-pro để kết xuất chính xác dải màu hiện đại oklab() và
    oklch(), giải quyết lỗi phân tích màu sắc của các thư viện cũ.
  - Sao chép trực tiếp & Phương án dự phòng (Fallback): Cho phép sao chép
    nhanh ảnh PNG trực tiếp vào khay nhớ tạm (Clipboard) để dán vào các nền
    tảng nhắn tin. Tự động hiển thị hộp thoại modal xem trước ảnh kèm hướng
    dẫn "Nhấn chuột phải -> Lưu ảnh" khi trình duyệt chặn quyền clipboard.

[Sprint 4] - 2026-06-05 (Sửa Đổi Linh Hoạt, Đăng Ký Học Phần & Nhắc Nhở Hạn Chót)

Thêm mới & Cải tiến (Added & Improved)

- Xóa/Sửa nhanh lớp học phần (S04-01 / US-13):
  - Sửa đổi trực tiếp trên danh sách: Cho phép sửa đổi hoặc xóa mọi thuộc
    tính (tên lớp, thứ, tiết đầu, số tiết, phòng học, giảng viên) trực tiếp
    ngay trên danh sách và phản hồi đồng bộ tức thì trên thời khóa biểu mà
    không cần nhập lại từ đầu.
  - Bộ chọn tiết học thông minh: Sửa đổi các trường cấu hình thời gian
    ("Tiết đầu" và "Số tiết") sang dạng kết hợp vừa có thể nhập trực tiếp
    bằng tay bằng số vừa có thể chọn từ danh sách thả xuống nhờ công cụ bộ
    nhớ dữ liệu tích hợp sẵn (<datalist> hỗ trợ nhập thông minh các số từ 1
    đến 12).
  - Chuẩn hóa dữ liệu: Tích hợp xử lý sự kiện onBlur để tự động chuẩn hóa dữ
    liệu nhập của người dùng về khoảng giá trị hợp lệ học đường [1; 12].

- Đánh dấu môn học bắt buộc (S04-02 / US-15):
  - Tính năng ghim (Pin/Must-Include): Thêm tùy chọn ghim để đánh dấu một
    lớp học phần là ưu tiên bắt buộc học.
  - Tích hợp lõi thuật toán solver: Thuật toán giải Solver tự động giữ lại
    lớp được "Pin", thực hiện tối ưu hóa, tìm kiếm phương án xung quanh
    lớp đó và bỏ qua các biến thể khác của môn.
  - Cảnh báo trực quan: Hiển thị nhãn cảnh báo nếu xảy ra xung đột không thể
    tránh khỏi giữa lớp bắt buộc và thời gian bận rộn cá nhân, đồng thời
    hiển thị biểu tượng badge 🔒 Bắt buộc nổi bật trên giao diện lưới Lịch
    biểu.

- Nhắc nhở & Đếm ngược Deadline Đăng ký Học phần (S04-03 / US-16):
  - Tạo Component DeadlineWidget chuyên biệt: Thiết kế widget đếm ngược trực
    quan với 4 thẻ Ngày-Giờ-Phút-Giây hiển thị hiệu ứng lật mượt mà (Flip
    mechanical style) sử dụng motion/react.
  - Thanh tiến trình động: Hỗ trợ thanh tiến trình thời gian co dãn động
    (Progress track) đổi màu sắc thông minh theo trạng thái khẩn cấp của hạn
    chót (Emerald -> Yellow -> Pulsing Red -> Dark Slate).
  - Tương thích hệ thống thông báo: Tự động lưu trữ cấu hình hạn chót xuống
    localStorage và tích hợp Web Notifications API để gửi thông báo đẩy của
    Trình duyệt trực tiếp theo các mốc giờ quan trọng (24h, 6h, 1h) khi sắp
    đóng cổng đăng ký.

- Tối ưu hóa khả năng thích ứng và Vùng an toàn di động (iOS Safe Area):
  - Chống vỡ layout trên thiết bị di động: Chuyển đổi khung hiển thị chính
    sang đơn vị chiều cao dynamic viewport h-[100dvh] kết hợp thuộc tính
    viewport-fit=cover nhằm mở rộng hiển thị ra toàn bộ khung viền của
    iPhone thế hệ mới có Notch.
  - Đệm lót Vùng An toàn tự động (Safe Area Insets): Tạo các biến đệm tự
    động bottom-nav-safe để tự mở rộng thêm khoảng trống tương ứng cho
    thanh Bottom Navigation, ngăn chặn chạm nhầm.
  - Chuyển đổi Sidebar sang Drawer trên Mobile/Tablet: Sidebar tự động
    chuyển đổi thành Drawer trượt từ trái sang (translate-x) hoạt động
    trên màn hình có kích thước < 1024px, tích hợp lớp phủ tối mờ
    (backdrop-blur-sm bg-black/50).

[Sprint 3] - 2026-06-04 (Phân Tích Xung Đột, Giải Thuật Tiệm Cận & Xuất Bản)

Thêm mới & Cải tiến (Added & Improved)

- Xác định điểm nghẽn và xung đột lịch học (S03-01 / US-07):
  - Định vị xung đột tự động: Khi xuất hiện sự trùng chéo thời gian giữa các
    lớp học hoặc với lịch cá nhân, hệ thống thực hiện khoanh vùng trực quan,
    bọc viền đỏ và hiển thị chi tiết các phần tử đối kháng để người dùng
    nhận biết nhanh chóng.
  - Bảng tra cứu điểm nghẽn: Tích hợp danh sách liệt kê các cặp lớp học phần
    xung đột trực tiếp trên thanh điều khiển bên cạnh để người dùng đưa ra
    quyết định loại bỏ hoặc thay thế phù hợp.

- Đề xuất TKB tối ưu lỗi - Giải thuật tiệm cận (S03-02 / US-08):
  - Chế độ tìm kiếm phương án cận tối ưu: Trong trường hợp không tồn tại
    phương án thời khóa biểu hoàn toàn không trùng lịch, thuật toán tự
    động nới lỏng ràng buộc để tìm kiếm và đề xuất các phương án ít xung
    đột nhất (chỉ trùng từ 1 đến 2 tiết).
  - Sắp xếp theo mật độ trùng: Các kết quả đề xuất được phân loại và sắp xếp
    dựa trên tổng số tiết bị chồng lấn tăng dần, giúp người dùng chủ động
    điều chỉnh lịch cá nhân tương ứng.

- Xuất lịch học dạng ảnh và bảng tính (S03-03 / US-09):
  - Hỗ trợ xuất ảnh thời khóa biểu: Kết xuất khu vực lưới lịch thành file
    hình ảnh định dạng PNG có tỷ lệ kích thước cân đối, giữ nguyên dải màu
    nhận diện của các thẻ môn học.
  - Xuất dữ liệu Excel: Hỗ trợ kết xuất thông tin chi tiết của thời khóa
    biểu đã chọn (Mã lớp, Tên môn, Thứ, Tiết, Phòng học, Giảng viên) ra
    cấu hình bảng tính rõ ràng để phục vụ lưu trữ cá nhân.

- Cải tiến giao diện di động cho lưới lịch (Grid polish):
  - Bọc toàn bộ bảng thời khóa biểu trung tâm trong một khối phần tử cho
    phép cuộn ngang (overflow-x-auto) bảo đảm chiều rộng tối thiểu 760px để
    nội dung các hộp lớp luôn hiển thị rõ nét, không bị dính chữ trên thiết
    bị di động.

[Sprint 2] - 2026-05-20 (Trực Quan Hóa Kết Quả & Bộ Lọc Động Cơ Giải)

Thêm mới & Cải tiến (Added & Improved)

- Hiển thị kết quả xếp lịch thành công (S02-01 / US-05):
  - Giao diện kết quả trực quan: Thiết kế bảng lịch biểu tuần hiển thị rõ
    ràng vị trí các tiết học tương ứng với các thứ trong tuần.
  - Bộ chuyển đổi phương án nhanh: Tích hợp cụm nút điều hướng
    "Next/Previous" cho phép người dùng lật duyệt nhanh qua các phương án
    thời khóa biểu hợp lệ đã được thuật toán giải thành công, hiển thị kèm
    chỉ báo số thứ tự phương án (ví dụ: Phương án 3 / 12).

- Tối ưu hóa thuật toán & Bộ lọc ưu tiên (S02-02 / US-06):
  - Tích hợp bộ lọc tiêu chí: Bổ sung các tùy chọn lọc kết quả theo nhu cầu
    thực tế của sinh viên bao gồm: Ưu tiên học buổi sáng, Ưu tiên học buổi
    chiều, Né học ngày Thứ 7, hoặc Tối thiểu hóa số ngày phải đến trường
    trong tuần.
  - Cải tiến bộ lọc động: Các bộ lọc hoạt động trực tiếp trên danh sách kết
    quả đã giải từ bộ nhớ đệm mà không cần chạy lại thuật toán quay lui từ
    đầu, tăng tốc phản hồi giao diện.

[Sprint 1] - 2026-05-02 (Nền Tảng Giao Diện Lưới & Động Cơ Quay Lui Cơ Bản)

Thêm mới (Added)

- Khung giao diện chính - Layout tuần (S01-01 / US-01):
  - Thiết kế cấu trúc Dashboard chính của StudyGrid Scheduler với bố cục
    lưới lịch biểu tuần (Calendar View), phân bổ từ Thứ 2 đến Thứ Bảy và
    hiển thị chi tiết theo từng hàng tiết học (từ tiết 1 đến tiết 12).
  - Tích hợp cấu trúc CSS Grid và dải màu Cosmic Slate đặc trưng, mang lại
    giao diện tối giản và dịu mắt khi sử dụng trong thời gian dài.

- Nhập lịch cá nhân (S01-02 / US-02):
  - Phát triển form khai báo các khoảng thời gian bận cố định trong tuần của
    cá nhân (ví dụ: lịch đi làm thêm, học ngoại ngữ, hoạt động ngoại khóa)
    để hệ thống tự động né các khung giờ này khi thực hiện xếp lớp học
    phần.

- Nhập dữ liệu môn học & lớp học phần (S01-03 / US-03):
  - Xây dựng phân hệ nhập liệu môn học trực quan, cho phép người dùng thêm
    nhiều lớp học phần khác nhau cho cùng một môn học (bao gồm các thông tin
    chi tiết: Thứ, Tiết bắt đầu, Số tiết, Giảng viên, Phòng học).

- Thuật toán tổ hợp thời khóa biểu cơ bản (S01-04 / US-04):
  - Triển khai động cơ giải thuật toán Backtracking (Quay lui) đệ quy để tự
    động tìm kiếm tất cả các phương án tổ hợp lớp học phần hợp lệ.
  - Đảm bảo các phương án trả về đáp ứng điều kiện không bị trùng lặp thời
    gian giữa các lớp học chính thức và hoàn toàn né các khung giờ bận cá
    nhân đã khai báo.
