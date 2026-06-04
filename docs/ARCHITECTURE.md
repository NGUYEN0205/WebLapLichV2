# Kiến trúc Kỹ thuật ứng dụng (ARCHITECTURE) - StudyGrid Scheduler

Tài liệu này cung cấp cái nhìn chi tiết về cấu trúc thư mục, luồng dữ liệu, thiết kế trạng thái và thuật toán tối ưu hóa cốt lõi của hệ thống **StudyGrid Scheduler**.

---

## 1. Bản đồ Kiến trúc Tổng quan (System Overview)

Ứng dụng được xây dựng hoàn toàn phía Client-side sử dụng **React 18**, **Vite** làm đóng gói công cụ, và **Tailwind CSS** làm thư viện thiết kế lập giao diện.

```
                         [ App Component (src/App.tsx) ]
                                | (Quản lý State chính)
              +-----------------+-----------------+
              |                 |                 |
     [ Sidebar.tsx ]     [ CalendarGrid.tsx ] [ Analytics/Export Tabs ]
  (Quản lý Input bận,  (Hiển thị 12-Slot grid,   (Thống kê số liệu học,
   Môn học & Lớp phần)  Duyệt phương án thỏa mãn) Xuất/nhập cấu hình)
```

---

## 2. Thiết kế Cấu trúc Dữ liệu (State & Data Flow)

Tất cả các định nghĩa Types có thể tìm thấy tại file `/src/types.ts`. Các thực thể chính gồm:

- **BusyActivity (Lịch bận cố định):**
  ```typescript
  export interface BusyActivity {
    id: string;
    name: string;
    day: number;        // 2 = Thứ Hai, 3 = Thứ Ba,..., 8 = Chủ Nhật
    startSlot: number;  // 1 đến 12 (Tiết học)
    duration: number;   // Số lượng tiết chiếm dụng
  }
  ```
- **ClassOption (Lớp Học phần):** Thành phần cụ thể mô tả thời gian tổ chức học của một nhóm môn học nhất định.
- **Subject (Môn học):**
  - Chứa một mảng `classes: ClassOption[]` thể hiện các lựa chọn nhóm lớp học phần thay thế cho môn này.
- **TimetableSolution (Phương án TKB khả thi):**
  - Tập hợp tối ưu chứa chính xác 1 `ClassOption` từ mỗi `Subject` hoạt động, cam kết không xảy ra bất kỳ xung đột nào về thời gian.

---

## 3. Thuật toán Tối ưu hóa & Tìm kiếm (Solver Algorithm)

Trái tim của ứng dụng là Thuật toán duyệt quay lui **Backtracking / Depth First Search (DFS)** chạy trong `App.tsx` thông qua hàm `solveTimetable()`:

### 3.1 Hàm Kiểm tra Xung đột Lịch (Overlap Detection)
Hàm `checkOverlap` xác định xem hai khoảng hoạt động trên cùng một ngày có bị đè lên nhau hay không:
$$\text{Overlap} = (\text{Day}_1 == \text{Day}_2) \land (\text{Start}_1 < \text{Start}_2 + \text{Duration}_2) \land (\text{Start}_2 < \text{Start}_1 + \text{Duration}_1)$$

### 3.2 Lược đồ Thuật toán DFS tìm kiếm phương án không xung đột
1. **Lọc môn học hoạt động:** Tìm tất cả các môn học có ít nhất một lựa chọn lớp học phần.
2. **Khởi tạo bộ nhớ tạm:** Tạo một mảng lưu trữ tạm thời các phương án thời khóa biểu đầy đủ điều kiện thỏa mãn.
3. **Thực thi DFS Đệ quy:**
   - **Tham số nhận vào:** Chỉ số môn học hiện tại (`subjectIndex`), Danh sách các lớp học hiện tại đã chọn trong nhánh duyệt (`currentClasses`).
   - **Trường hợp cơ sở (Base Case):** Nếu `subjectIndex == activeSubjects.length`, tức là đã chọn thành công mỗi môn học một lớp tương thích, lưu cấu hình này vào danh sách kết quả khả thi và kết thúc nhánh duyệt.
   - **Vòng lặp nhánh tuyển chọn:** Với môn học thứ `subjectIndex`, duyệt qua từng `ClassOption`:
     - Kiểm tra nếu lớp học phần này bị **đè giờ** lên bất kỳ lớp học nào đã được chọn trước đó trong mảng `currentClasses`.
     - Kiểm tra nếu lớp học phần này bị **đè giờ** lên bất kỳ hoạt động bận cá nhân nào trong `busyActivities`.
     - Nếu **Không xung đột**: Tiếp tục gọi đệ quy duyệt môn học tiếp theo: `dfsSearch(subjectIndex + 1, [...currentClasses, lớp học hiện tại])`.

---

## 4. Tối ưu hóa Hiển thị Lịch (Calendar Rendering Grid)

Bộ lịch tuần sử dụng hệ lưới **CSS Grid Custom/Tự do** kết hợp tọa độ tuyệt đối để vẽ các quân lịch:
- **Hệ thống cột:** Gồm 8 cột cố định trong đó Cột đầu tiên dành cho ký hiệu số Tiết học (1-12), 7 cột còn lại lần lượt là Thứ 2 đến Chủ nhật.
- **Hệ thống tọa độ vẽ lớp học:** Mỗi thẻ lớp học hoặc thẻ bận cá nhân được định vị tuyệt đối `absolute` trong không gian lưới dựa trên:
  - Cột ứng với Thứ (`day`) sở tại.
  - Vị trí từ trên xuống (`top`) tỷ lệ với tiết bắt đầu `startSlot`.
  - Chiều cao (`height`) tỷ lệ với số tiết kéo dài `duration`.
- Cách tiếp cận này giúp các lớp được hiển thị chuẩn xác từng pixel độc lập, tránh hiện tượng co kéo cột hay sai lệch giờ thực tế thường gặp ở các bảng HTML Table truyền thống.
