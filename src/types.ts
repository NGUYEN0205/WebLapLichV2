export interface BusyActivity {
  id: string;
  name: string;
  day: number; // 2 = Thứ 2, 3 = Thứ 3, ..., 8 = Chủ Nhật
  startSlot: number; // 1 to 12
  duration: number; // number of periods
}

export interface ClassOption {
  id: string;
  className: string; // e.g. "Lớp 01", "Lớp 02"
  day: number; // 2 to 8
  startSlot: number; // 1 to 12
  duration: number; // e.g. 2, 3, 4
  room?: string; // e.g. "Phòng A.201", "Lab 4"
  teacher?: string; // e.g. "Thầy Khánh", "Cô Hà"
  isPinned?: boolean; // true if this class option is highlighted as a mandatory pin
  registrationDeadline?: string; // dd - mm - yyyy
}

export interface PinConflictWarning {
  sectionId: string;
  courseName: string;
  day: number;
  startPeriod: number;
  endPeriod: number;
  detail: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // Hex color or Tailwind accent class color
  classes: ClassOption[];
}

export interface TimetableSolution {
  classes: {
    subjectId: string;
    subjectName: string;
    color: string;
    classOption: ClassOption;
  }[];
}

export interface UniversityPreset {
  name: string;
  description: string;
  subjects: Subject[];
  busyActivities: BusyActivity[];
}

// === US-16: Deadline Reminder ===

/**
 * Trạng thái của hạn chót đăng ký học phần dựa trên thời gian còn lại
 * - upcoming: > 48 giờ
 * - warning: 24h đến 48h (cảnh báo sớm - màu vàng)
 * - critical: < 24h (nguy cấp - màu đỏ)
 * - expired: đã qua hạn chót
 */
export type DeadlineStatus = "upcoming" | "warning" | "critical" | "expired";

/**
 * Interface đại diện cho cấu trúc hạn chót đăng ký học phần
 */
export interface RegistrationDeadline {
  /** Mã định danh duy nhất cho hạn chót */
  id: string;
  /** Tên học kỳ tuyển sinh hoặc đăng ký (Ví dụ: "HK1 2025-2026") */
  semesterName: string;
  /** Thời điểm kết thúc đăng ký (Date hoặc chuỗi ISO 8601 để tương thích JSON) */
  deadline: Date | string;
  /** Thời điểm tạo bản ghi nhắc nhở (Date hoặc chuỗi ISO 8601) */
  createdAt: Date | string;
  /**
   * Lưu dấu các mốc giờ đã gửi thông báo thành công dưới dạng key-value.
   * Ví dụ: { "24": true, "6": false, "1": false }
   */
  notificationSent: {
    [hours: string]: boolean;
  };
}

/**
 * Trạng thái đếm ngược thời gian thực phục vụ hiển thị UI
 */
export interface CountdownState {
  /** Số ngày còn lại */
  days: number;
  /** Số giờ còn lại */
  hours: number;
  /** Số phút còn lại */
  minutes: number;
  /** Số giây còn lại */
  seconds: number;
  /** Trạng thái phân loại mức độ nguy cấp của hạn chót */
  status: DeadlineStatus;
  /** Phần trăm thời gian còn lại (%) so với thời điểm tạo ban đầu */
  percentageRemaining: number;
}

/**
 * Cấu trúc định nghĩa mốc thông báo nhắc nhở trước hạn chót
 */
export interface NotificationMilestone {
  /** Số giờ trước hạn chót cần kích hoạt thông báo */
  hoursBeforeDeadline: number;
  /** Nhãn hiển thị trực quan (Ví dụ: "24 giờ trước thời hạn") */
  label: string;
  /** Trạng thái đã gửi thông báo hay chưa */
  sent: boolean;
}

