import { Subject, BusyActivity, UniversityPreset } from "./types";

export const DEFAULT_PRESET: UniversityPreset = {
  name: "StudyGrid Mặc định (Theo Ảnh mẫu)",
  description: "Dữ liệu thời khóa biểu mẫu bao gồm Toán cao cấp, Vật lý, Kỹ thuật lập trình và các lịch bận.",
  subjects: [
    {
      id: "subj-toan-cao-cap",
      name: "Toán cao cấp A1",
      color: "rgba(124, 58, 237, 1)", // violet-600 color / primary-ish
      classes: [
        {
          id: "class-toan-01",
          className: "Lớp 01",
          day: 2,
          startSlot: 1,
          duration: 3,
          room: "Phòng C.101",
          teacher: "ThS. Nguyễn Văn A",
          registrationDeadline: "15 - 06 - 2026",
        },
        {
          id: "class-toan-02",
          className: "Lớp 02",
          day: 3,
          startSlot: 4,
          duration: 3,
          room: "Phòng C.402",
          teacher: "PGS.TS Lê Hoàng Minh",
          registrationDeadline: "15 - 06 - 2026",
        },
      ],
    },
    {
      id: "subj-vat-ly-dc",
      name: "Vật lý đại cương",
      color: "rgba(78, 222, 163, 1)", // emerald-ish text / secondary
      classes: [
        {
          id: "class-vl-01",
          className: "Lớp 01",
          day: 2,
          startSlot: 3,
          duration: 3, // Tiết 3-5
          room: "Phòng A.201",
          teacher: "TS. Trần Thu Hà",
          registrationDeadline: "18 - 06 - 2026",
        },
        {
          id: "class-vl-02",
          className: "Lớp 02",
          day: 4,
          startSlot: 1,
          duration: 3,
          room: "Phòng A.302",
          teacher: "TS. Trần Thu Hà",
          registrationDeadline: "18 - 06 - 2026",
        },
      ],
    },
    {
      id: "subj-kythuat-laptrinh",
      name: "Kỹ thuật lập trình",
      color: "rgba(255, 185, 95, 1)", // tertiary / amber-ish
      classes: [
        {
          id: "class-ktlt-01",
          className: "Lớp L01",
          day: 5,
          startSlot: 1,
          duration: 4, // Tiết 1-4
          room: "Lab 4",
          teacher: "ThS. Vũ Hải Đăng",
          registrationDeadline: "20 - 06 - 2026",
        },
        {
          id: "class-ktlt-02",
          className: "Lớp L02",
          day: 2,
          startSlot: 6,
          duration: 4,
          room: "Lab 2",
          teacher: "ThS. Vũ Hải Đăng",
          registrationDeadline: "20 - 06 - 2026",
        },
      ],
    },
  ],
  busyActivities: [
    {
      id: "busy-english",
      name: "Học Tiếng Anh trung tâm",
      day: 4,
      startSlot: 7,
      duration: 2, // Tiết 7-8
    },
    {
      id: "busy-parttime",
      name: "Đi làm thêm",
      day: 6,
      startSlot: 7,
      duration: 4, // Tiết 7-10
    },
  ],
};

export const OTHER_PRESETS: UniversityPreset[] = [
  {
    name: "Học kỳ 1 - Công nghệ thông tin",
    description: "Khối lượng môn đại cương nặng, cần sắp xếp lịch nghỉ thứ Sáu.",
    subjects: [
      {
        id: "cs-tritue",
        name: "Trí tuệ nhân tạo",
        color: "rgba(124, 58, 237, 1)",
        classes: [
          { id: "cs-ai-01", className: "Lớp CLC 01", day: 2, startSlot: 1, duration: 4, room: "P.301-B1", registrationDeadline: "15 - 06 - 2026" },
          { id: "cs-ai-02", className: "Lớp CLC 02", day: 4, startSlot: 1, duration: 4, room: "P.305-B1", registrationDeadline: "15 - 06 - 2026" }
        ]
      },
      {
        id: "cs-csdl",
        name: "Cơ sở dữ liệu",
        color: "rgba(78, 222, 163, 1)",
        classes: [
          { id: "cs-db-01", className: "Lớp 01", day: 3, startSlot: 7, duration: 3, room: "Lab 1-FIT", registrationDeadline: "18 - 06 - 2026" },
          { id: "cs-db-02", className: "Lớp 02", day: 4, startSlot: 7, duration: 3, room: "Lab 3-FIT", registrationDeadline: "18 - 06 - 2026" }
        ]
      },
      {
        id: "cs-web",
        name: "Phát triển ứng dụng Web",
        color: "rgba(255, 185, 95, 1)",
        classes: [
          { id: "cs-web-01", className: "Lớp L01", day: 2, startSlot: 7, duration: 3, room: "Phòng hội thảo 2", registrationDeadline: "20 - 06 - 2026" },
          { id: "cs-web-02", className: "Lớp L02", day: 5, startSlot: 2, duration: 3, room: "Phòng 402-A2", registrationDeadline: "20 - 06 - 2026" }
        ]
      },
      {
        id: "cs-triet",
        name: "Triết học Mác-Lênin",
        color: "rgba(239, 68, 68, 1)",
        classes: [
          { id: "cs-triet-01", className: "Nhóm 05", day: 3, startSlot: 2, duration: 3, room: "G3.102", registrationDeadline: "10 - 06 - 2026" },
          { id: "cs-triet-02", className: "Nhóm 06", day: 5, startSlot: 7, duration: 3, room: "G3.204", registrationDeadline: "10 - 06 - 2026" }
        ]
      }
    ],
    busyActivities: [
      { id: "cs-club-busy", name: "Sinh hoạt CLB Tin học", day: 5, startSlot: 11, duration: 2 },
      { id: "cs-gym-busy", name: "Đi tập Gym", day: 7, startSlot: 9, duration: 2 }
    ]
  },
  {
    name: "Kinh tế đối ngoại & Ngoại ngữ",
    description: "Sắp xếp lịch học ngoại ngữ xen kẽ các ngày trong tuần.",
    subjects: [
      {
        id: "eco-vi-mo",
        name: "Kinh tế vĩ mô 2",
        color: "rgba(124, 58, 237, 1)",
        classes: [
          { id: "eco-vm-01", className: "Lớp K45A", day: 2, startSlot: 3, duration: 3, room: "D201", registrationDeadline: "15 - 06 - 2026" },
          { id: "eco-vm-02", className: "Lớp K45B", day: 3, startSlot: 3, duration: 3, room: "D203", registrationDeadline: "15 - 06 - 2026" }
        ]
      },
      {
        id: "eco-ke-toan",
        name: "Nguyên lý kế toán",
        color: "rgba(78, 222, 163, 1)",
        classes: [
          { id: "eco-kt-01", className: "Nhóm 1", day: 3, startSlot: 7, duration: 3, room: "B401", registrationDeadline: "18 - 06 - 2026" },
          { id: "eco-kt-02", className: "Nhóm 2", day: 5, startSlot: 7, duration: 3, room: "B403", registrationDeadline: "18 - 06 - 2026" }
        ]
      },
      {
        id: "eco-anh-thuong-mai",
        name: "Tiếng Anh thương mại",
        color: "rgba(255, 185, 95, 1)",
        classes: [
          { id: "eco-atm-01", className: "Lớp chất lượng cao", day: 4, startSlot: 2, duration: 4, room: "A502", registrationDeadline: "12 - 06 - 2026" },
          { id: "eco-atm-02", className: "Lớp đại trà", day: 2, startSlot: 7, duration: 4, room: "A505", registrationDeadline: "12 - 06 - 2026" }
        ]
      }
    ],
    busyActivities: [
      { id: "eco-selfstudy", name: "Tự học Thư viện", day: 4, startSlot: 8, duration: 3 },
      { id: "eco-freelance", name: "Làm trợ giảng ngoại ngữ", day: 6, startSlot: 2, duration: 4 }
    ]
  }
];
