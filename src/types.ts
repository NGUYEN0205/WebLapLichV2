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
