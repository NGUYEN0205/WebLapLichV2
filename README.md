# StudyGrid - Hệ thống Lập và Tối ưu hóa Thời khóa biểu Thông minh 🎓🕒

**StudyGrid** là ứng dụng web hiện đại chạy hoàn toàn phía Client-side giúp các bạn sinh viên tự động tìm kiếm, sắp xếp và tối ưu hóa thời khóa biểu học tập của mình. Hệ thống giải quyết bài toán trùng lịch phổ biến bằng cách đối chiếu thông minh các nhóm lớp học phần mong muốn với lịch bận rộn cố định cá nhân (như giờ đi làm thêm, học tiếng Anh trung tâm, sinh hoạt CLB).

---

## 🚀 Các Tính Năng Nổi Bật

### 📅 Lưới Thời khóa biểu Trực quan (Interactive Weekly Grid)
* Hiển thị khung thời gian chuẩn hóa gồm 12 tiết học tiêu chuẩn mỗi ngày từ Thứ Hai đến Chủ Nhật.
* **Giao diện Responsive linh hoạt**: Thiết kế tối ưu cho máy tính và tự động cuộn ngang mượt mà (`overflow-x-auto`) trên di động để các quân lịch luôn hiển thị sắc nét nhất.
* Xem chi tiết thông tin phòng học, giảng viên và ghi chú bổ sung khi bấm vào một lớp học bất kỳ trên lưới.

### 🛡️ Quản lý Lịch bận Cá nhân (Fixed Busy Schedules)
* Khai báo không giới hạn các khung giờ bận cố định trong tuần để tránh trùng lịch học chính thức.
* **Bộ chọn tiết học thông minh**: Hỗ trợ nhập số trực tiếp bằng tay hoặc chọn nhanh thông qua thẻ gợi ý tự động (`<datalist>` từ tiết 1 đến 12).
* Danh sách lịch bận hiển thị trực quan ngay dưới biểu mẫu thêm mới, đi kèm tính năng xóa nhanh cực kỳ trực quan.

### 🧠 Thuật toán Tối ưu hóa & Tìm kiếm (Solver Backend Engine)
* Áp dụng thuật toán tìm kiếm quay lui **Backtracking (DFS)** mạnh mẽ để phân tích mọi tổ hợp lớp học phần của các môn đăng ký.
* Lọc sạch tất cả các cấu hình trùng tiết học hoặc đè lên thời gian bận cá nhân.
* Cho phép duyệt qua từng phương án khả thi bằng bộ điều hướng (Trang trước / Trang sau) tiện lợi.

### 📊 Thống kê Phân tích & Xuất bản (Analytics & Export)
* **Thống kê chi tiết**: Xem biểu đồ phân bổ số ngày học trống hoàn toàn trong tuần, tổng số tiết học mỗi tuần.
* **Xuất bản tiện lợi**: Sao chép dữ liệu cấu hình thời khóa biểu dưới dạng mã JSON bảo mật hoặc tải xuống tệp lưu trữ ngoại tuyến để dễ dàng khôi phục trên thiết bị khác.

---

## 🛠️ Công Nghệ Sử Dụng

* **Vite + React 18 + TypeScript**: Đóng gói nhanh chóng, kiến trúc component hướng an toàn và tin cậy tuyệt đối về kiểu dữ liệu.
* **Tailwind CSS**: Thiết kế giao diện hiện đại theo phong cách **Cosmic Slate (Giao diện tối)** cực kỳ dịu mắt khi nhìn lâu vào ban đêm.
* **Lucide React**: Bộ icon vector sắc nét, tối giản.
* **Framer Motion**: Tạo hiệu ứng chuyển động và tương tác mượt mà trong giao diện người dùng.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
├── docs/                      # Tài liệu dự án chi tiết (SPEC, ARCHITECTURE, CHANGELOG)
├── src/
│   ├── components/            # Các thành phần giao diện chuyên biệt
│   │   ├── Sidebar.tsx        # Cột quản lý môn học, lịch bận & bộ điều khiển thuật toán
│   │   ├── CalendarGrid.tsx   # Lưới hiển thị chi tiết lịch học theo tuần và tiết
│   │   ├── AnalyticsTab.tsx   # Biểu đồ thống kê và phân tích tần suất học tập
│   │   └── ExportTab.tsx      # Quản lý sao lưu dữ liệu cấu hình
│   ├── App.tsx                # Quản lý State chung & Thuật toán Solver cốt lõi
│   ├── types.ts               # Định nghĩa các kiểu dữ liệu TypeScript dùng chung
│   ├── main.tsx               # Điểm khởi chạy ứng dụng React
│   └── index.css              # Quản lý lớp CSS toàn cục & biến theme Tailwind
├── metadata.json              # Khai báo siêu dữ liệu ứng dụng của AI Studio
├── package.json               # Quản lý thư viện phụ thuộc và kịch bản khởi chạy
└── vite.config.ts             # Cấu hình đóng gói Vite
```

---

## 📖 Hướng Dẫn Chạy Dự Án Dưới Local

### 1. Cài đặt các thư viện phụ thuộc
```bash
npm install
```

### 2. Chạy ứng dụng dưới chế độ Phát triển (Development Mode)
```bash
npm run dev
```
Trình duyệt sẽ tự động mở trang chứa môi trường cục bộ tại địa chỉ `http://localhost:3000`.

### 3. Biên dịch ứng dụng sang Bản phân phối Sản xuất (Production Build)
```bash
npm run build
```

---

## ✨ Đóng Góp Dự Án

* Ứng dụng được thiết kế và tối ưu tỉ mỉ dựa trên trải nghiệm thực tế của sinh viên khi đăng ký tín chỉ học phần tại các cơ sở giáo dục đại học ở Việt Nam.
* Mọi thay đổi hay bổ sung tính năng đều được lưu vết chi tiết tại tài liệu [Nhật ký Thay đổi (docs/CHANGELOG.md)](/docs/CHANGELOG.md).
