import React, { useState } from "react";
import { 
  Calendar, BookOpen, Trash2, Plus, X, Sparkles, AlertCircle, RefreshCw, Layers, Pencil, Pin, PinOff
} from "lucide-react";
import { BusyActivity, Subject, ClassOption, UniversityPreset } from "../types";
import { DEFAULT_PRESET, OTHER_PRESETS } from "../presets";

interface SidebarProps {
  busyActivities: BusyActivity[];
  setBusyActivities: React.Dispatch<React.SetStateAction<BusyActivity[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  onGenerate: () => void;
  loadPreset: (preset: UniversityPreset) => void;
}

const COMMON_SUBJECT_SUGGESTIONS = [
  "Giải tích 1",
  "Đại số tuyến tính",
  "Nhập môn CNTT",
  "Lập trình hướng đối tượng",
  "Cơ học lý thuyết",
  "Tiếng Anh B2",
  "Kinh tế lượng",
  "Pháp luật đại cương",
];

export const Sidebar: React.FC<SidebarProps> = ({
  busyActivities,
  setBusyActivities,
  subjects,
  setSubjects,
  onGenerate,
  loadPreset,
}) => {
  // Busy activity inputs
  const [busyName, setBusyName] = useState("");
  const [busyDay, setBusyDay] = useState(2); // Thứ 2
  const [busyStart, setBusyStart] = useState(1);
  const [busyDuration, setBusyDuration] = useState(2);

  // Subject inputs
  const [subjectName, setSubjectName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // New class option inputs state mapping by subjectId
  const [newClassSubjectId, setNewClassSubjectId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [newClassDay, setNewClassDay] = useState(2);
  const [newClassStart, setNewClassStart] = useState(1);
  const [newClassDuration, setNewClassDuration] = useState(3);
  const [newClassRoom, setNewClassRoom] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");

  // Inline edit state for Class Options
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [editClassDay, setEditClassDay] = useState(2);
  const [editClassStart, setEditClassStart] = useState(1);
  const [editClassDuration, setEditClassDuration] = useState(3);
  const [editClassRoom, setEditClassRoom] = useState("");
  const [editClassTeacher, setEditClassTeacher] = useState("");

  const handleStartEditClass = (cls: ClassOption) => {
    setEditingClassId(cls.id);
    setEditClassName(cls.className);
    setEditClassDay(cls.day);
    setEditClassStart(cls.startSlot);
    setEditClassDuration(cls.duration);
    setEditClassRoom(cls.room || "");
    setEditClassTeacher(cls.teacher || "");
  };

  const handleTogglePinClass = (subjId: string, classOptId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjId) {
          return {
            ...s,
            classes: s.classes.map((c) => {
              if (c.id === classOptId) {
                return { ...c, isPinned: !c.isPinned };
              }
              return c;
            })
          };
        }
        return s;
      })
    );
  };

  // Handling adding fixed busy hours
  const handleAddBusy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busyName.trim()) return;

    if (busyStart < 1 || busyStart > 12 || busyDuration < 1 || busyStart + busyDuration - 1 > 12) {
      alert("Tiết học phải nằm trong khoảng từ 1 tới 12!");
      return;
    }

    const newBusy: BusyActivity = {
      id: `busy-${Date.now()}`,
      name: busyName.trim(),
      day: busyDay,
      startSlot: busyStart,
      duration: busyDuration,
    };

    setBusyActivities([...busyActivities, newBusy]);
    setBusyName("");
  };

  const handleDeleteBusy = (id: string) => {
    setBusyActivities(busyActivities.filter((act) => act.id !== id));
  };

  // Handling adding subject
  const handleAddSubject = (nameString: string) => {
    const trimmed = nameString.trim();
    if (!trimmed) return;

    // Check duplicate
    if (subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("Môn học này đã tồn tại trong danh sách!");
      return;
    }

    // Generate random pleasant colors matching the palette (purple, green, amber, red, blue, rose)
    const colorOptions = [
      "rgba(124, 58, 237, 1)",  // Primary Deep Purple
      "rgba(78, 222, 163, 1)",  // Secondary Teal
      "rgba(255, 185, 95, 1)",  // Tertiary Gold
      "rgba(244, 63, 94, 1)",   // Rose
      "rgba(56, 189, 248, 1)",  // Sky blue
      "rgba(236, 72, 153, 1)"   // Pink
    ];
    const chosenColor = colorOptions[subjects.length % colorOptions.length];

    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      name: trimmed,
      color: chosenColor,
      classes: [],
    };

    setSubjects([...subjects, newSubj]);
    setSubjectName("");
    setShowSuggestions(false);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // Handling adding classes inside a subject
  const handleAddClass = (subjId: string) => {
    if (!newClassName.trim()) {
      alert("Vui lòng nhập tên lớp học phần (ví dụ: Lớp 01)!");
      return;
    }

    if (newClassStart < 1 || newClassStart > 12 || newClassDuration < 1 || newClassStart + newClassDuration - 1 > 12) {
      alert("Tiết học phải thuộc khoảng từ 1 đến 12!");
      return;
    }

    const newOpt: ClassOption = {
      id: `class-opt-${Date.now()}`,
      className: newClassName.trim(),
      day: newClassDay,
      startSlot: newClassStart,
      duration: newClassDuration,
      room: newClassRoom.trim() || undefined,
      teacher: newClassTeacher.trim() || undefined,
    };

    setSubjects(
      subjects.map((s) => {
        if (s.id === subjId) {
          return {
            ...s,
            classes: [...s.classes, newOpt],
          };
        }
        return s;
      })
    );

    // Reset fields
    setNewClassSubjectId(null);
    setNewClassName("");
    setNewClassRoom("");
    setNewClassTeacher("");
  };

  const handleDeleteClass = (subjId: string, classOptId: string) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === subjId) {
          return {
            ...s,
            classes: s.classes.filter((c) => c.id !== classOptId),
          };
        }
        return s;
      })
    );
  };

  const handleSaveEditClass = (subjId: string, classOptId: string) => {
    if (!editClassName.trim()) {
      alert("Vui lòng nhập tên lớp học phần!");
      return;
    }
    if (editClassStart < 1 || editClassStart > 12 || editClassDuration < 1 || editClassStart + editClassDuration - 1 > 12) {
      alert("Tiết học phải thuộc khoảng từ 1 đến 12!");
      return;
    }

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id === subjId) {
          return {
            ...s,
            classes: s.classes.map((c) => {
              if (c.id === classOptId) {
                return {
                  ...c,
                  className: editClassName.trim(),
                  day: editClassDay,
                  startSlot: editClassStart,
                  duration: editClassDuration,
                  room: editClassRoom.trim() || undefined,
                  teacher: editClassTeacher.trim() || undefined,
                };
              }
              return c;
            })
          };
        }
        return s;
      })
    );
    setEditingClassId(null);
  };

  return (
    <aside className="w-full lg:w-[380px] bg-brand-surface/60 backdrop-blur-xl border-r border-[#4a4455]/30 shadow-2xl flex flex-col p-4 gap-6 overflow-y-auto pb-24 h-full shrink-0">
      
      {/* LỊCH CÁ NHÂN CỐ ĐỊNH */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-bold text-[#e8dfee] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-primary" />
          Lịch cá nhân cố định
        </h2>
        <p className="text-xs text-brand-on-surface-variant/80">
          Thiết lập những khoảng thời gian bận của bạn (đi làm, học ngoài)
        </p>
      </div>

      {/* Form bận & Danh sách kèm theo */}
      <div className="bg-brand-surface-low/80 p-3 rounded-xl border border-[#4a4455]/20 flex flex-col gap-3">
        <form onSubmit={handleAddBusy} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider">
              Tên hoạt động bận
            </label>
            <input
              value={busyName}
              onChange={(e) => setBusyName(e.target.value)}
              className="bg-brand-surface-high/70 border border-[#4a4455]/40 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-primary transition-all text-[#e8dfee]"
              placeholder="Ví dụ: Đi làm thêm, Học Anh văn..."
              type="text"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-brand-on-surface-variant uppercase">Thứ</label>
              <select
                value={busyDay}
                onChange={(e) => setBusyDay(Number(e.target.value))}
                className="bg-brand-surface-high border border-[#4a4455]/45 rounded-lg p-2 text-xs text-[#e8dfee] focus:outline-none"
              >
                <option value={2}>Thứ Hai</option>
                <option value={3}>Thứ Ba</option>
                <option value={4}>Thứ Tư</option>
                <option value={5}>Thứ Năm</option>
                <option value={6}>Thứ Sáu</option>
                <option value={7}>Thứ Bảy</option>
                <option value={8}>Chủ Nhật</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-brand-on-surface-variant uppercase">Tiết đầu</label>
              <input
                value={busyStart || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setBusyStart(val === "" ? 0 : Number(val));
                }}
                onBlur={() => {
                  setBusyStart(prev => Math.max(1, Math.min(12, prev || 1)));
                }}
                className="bg-brand-surface-high border border-[#4a4455]/45 rounded-lg p-2 text-xs text-[#e8dfee] focus:outline-none"
                type="number"
                min={1}
                max={12}
                list="slots-1-12"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-brand-on-surface-variant uppercase">Số tiết</label>
              <input
                value={busyDuration || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setBusyDuration(val === "" ? 0 : Number(val));
                }}
                onBlur={() => {
                  setBusyDuration(prev => Math.max(1, Math.min(12, prev || 1)));
                }}
                className="bg-brand-surface-high border border-[#4a4455]/45 rounded-lg p-2 text-xs text-[#e8dfee] focus:outline-none"
                type="number"
                min={1}
                max={12}
                list="slots-1-12"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-brand-primary-container hover:bg-brand-primary-container/85 text-brand-on-primary-container py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm lịch bận cá nhân
          </button>
        </form>

        {/* Danh sách bận nằm ngay dưới nút thêm */}
        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1 border-t border-[#4a4455]/20 pt-3 mt-1">
          <span className="text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-wider block">
            Lịch bận đã thêm ({busyActivities.length}):
          </span>
          {busyActivities.length === 0 ? (
            <p className="text-[11px] text-brand-on-surface-variant opacity-60 italic text-center py-2 border border-dashed border-[#4a4455]/20 rounded-xl">
              Chưa có lịch bận cố định nào
            </p>
          ) : (
            busyActivities.map((act) => (
              <div
                key={act.id}
                className="glass-panel bg-brand-surface-high/50 p-2 rounded-lg flex justify-between items-center group hover:bg-white/5 transition-all"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#e8dfee]">{act.name}</span>
                  <span className="text-[10px] text-brand-on-surface-variant">
                    {act.day === 8 ? "Chủ Nhật" : `Thứ ${act.day}`} • Tiết {act.startSlot}-{act.startSlot + act.duration - 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteBusy(act.id)}
                  className="text-brand-on-surface-variant hover:text-brand-error opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all p-1"
                  title="Xóa lịch bận"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <hr className="border-[#4a4455]/20" />

      {/* MÔN HỌC & LỚP HỌC */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-bold text-[#e8dfee] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-secondary" />
          Môn học &amp; Lớp học
        </h2>
        <p className="text-xs text-brand-on-surface-variant/80">
          Thêm các môn học và phương án lớp học phần (Lớp lý thuyết, Lớp thực hành)
        </p>
      </div>

      {/* Thêm môn học */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-1.5 relative">
          <input
            value={subjectName}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onChange={(e) => setSubjectName(e.target.value)}
            className="flex-1 bg-brand-surface-high/70 border border-[#4a4455]/40 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-primary transition-all text-[#e8dfee]"
            placeholder="Tìm hoặc Nhập tên môn học..."
            type="text"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubject(subjectName);
            }}
          />
          <button
            onClick={() => handleAddSubject(subjectName)}
            className="bg-brand-primary text-brand-on-primary font-bold px-3.5 rounded-lg text-xs hover:bg-brand-primary/90 transition-all active:scale-95 cursor-pointer"
          >
            Thêm
          </button>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-[105%] left-0 w-full bg-brand-surface-highest border border-[#4a4455]/65 rounded-xl shadow-2xl z-20 max-h-[160px] overflow-y-auto p-1.5 flex flex-col gap-1">
              <span className="text-[9px] font-bold text-brand-on-surface-variant px-2 py-1 uppercase tracking-wider block">Gợi ý môn phổ biến:</span>
              {COMMON_SUBJECT_SUGGESTIONS.filter(item => 
                item.toLowerCase().includes(subjectName.toLowerCase())
              ).map((item, idx) => (
                <button
                  key={idx}
                  onMouseDown={() => handleAddSubject(item)}
                  className="text-left text-xs bg-transparent hover:bg-white/5 transition px-2 py-1.5 rounded-lg text-brand-on-surface"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Danh sách môn học */}
      <div className="flex flex-col gap-3">
        {subjects.length === 0 ? (
          <p className="text-[11px] text-brand-on-surface-variant opacity-60 italic text-center py-6 border border-dashed border-[#4a4455]/20 rounded-xl">
            Chưa có môn học nào được thêm. Hãy chọn dữ liệu mẫu ở trên để bắt đầu nhanh!
          </p>
        ) : (
          subjects.map((subj) => (
            <div
              key={subj.id}
              style={{ borderColor: subj.color }}
              className="border-l-4 bg-brand-surface-low/60 rounded-r-xl p-3 flex flex-col gap-2 border-y border-r border-[#4a4455]/15"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="font-bold text-sm text-[#e8dfee] line-clamp-1" style={{ color: subj.color }}>{subj.name}</span>
                <button
                  onClick={() => handleDeleteSubject(subj.id)}
                  className="text-brand-error hover:scale-105 transition-all p-1"
                  title="Xóa môn học này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Lớp học phần hiện tại of current subject */}
              <div className="grid grid-cols-2 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                {subj.classes.length === 0 ? (
                  <div className="col-span-2 text-[10px] text-brand-on-surface-variant/70 italic text-center bg-brand-surface-high/20 py-2 rounded-lg">
                    Chưa có lớp học phần nào.
                  </div>
                ) : (
                  subj.classes.map((cls) => {
                    const isCurrentlyEditing = editingClassId === cls.id;
                    if (isCurrentlyEditing) {
                      return (
                        <div
                          key={cls.id}
                          className="col-span-2 bg-brand-surface-high/85 p-3 rounded-lg border border-brand-primary/50 flex flex-col gap-2 shadow-inner z-10 text-left"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-brand-primary uppercase">Sửa lớp học phần</span>
                            <button
                              onClick={() => setEditingClassId(null)}
                              className="text-brand-on-surface-variant hover:text-[#e8dfee]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase">Mã/Tên Lớp</span>
                              <input
                                value={editClassName}
                                onChange={(e) => setEditClassName(e.target.value)}
                                placeholder="Ví dụ: Lớp 01"
                                className="bg-brand-surface-highest border border-[#4a4455]/40 text-xs rounded p-1 text-[#e8dfee] focus:outline-none focus:border-brand-primary"
                              />
                            </div>
                            
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase font-bold">Thứ</span>
                              <select
                                value={editClassDay}
                                onChange={(e) => setEditClassDay(Number(e.target.value))}
                                className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee] focus:outline-none"
                              >
                                <option value={2}>Thứ Hai</option>
                                <option value={3}>Thứ Ba</option>
                                <option value={4}>Thứ Tư</option>
                                <option value={5}>Thứ Năm</option>
                                <option value={6}>Thứ Sáu</option>
                                <option value={7}>Thứ Bảy</option>
                                <option value={8}>Chủ Nhật</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase font-bold">Tiết Đầu</span>
                              <input
                                type="number"
                                min={1}
                                max={12}
                                value={editClassStart || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditClassStart(val === "" ? 0 : Number(val));
                                }}
                                onBlur={() => {
                                  setEditClassStart(prev => Math.max(1, Math.min(12, prev || 1)));
                                }}
                                list="slots-1-12"
                                className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee] focus:outline-none focus:border-brand-primary"
                              />
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase font-bold">Số Tiết</span>
                              <input
                                type="number"
                                min={1}
                                max={12}
                                value={editClassDuration || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditClassDuration(val === "" ? 0 : Number(val));
                                }}
                                onBlur={() => {
                                  setEditClassDuration(prev => Math.max(1, Math.min(12, prev || 1)));
                                }}
                                list="slots-1-12"
                                className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee] focus:outline-none focus:border-brand-primary"
                              />
                            </div>

                            <div className="flex flex-col gap-0.5 col-span-2">
                              <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase">Phòng / Giảng viên (Không bắt buộc)</span>
                              <div className="grid grid-cols-2 gap-1">
                                <input
                                  value={editClassRoom}
                                  onChange={(e) => setEditClassRoom(e.target.value)}
                                  placeholder="Phòng A.201"
                                  className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee] focus:outline-none focus:border-brand-primary"
                                />
                                <input
                                  value={editClassTeacher}
                                  onChange={(e) => setEditClassTeacher(e.target.value)}
                                  placeholder="Thầy Khánh"
                                  className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee] focus:outline-none focus:border-brand-primary"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end mt-1">
                            <button
                              onClick={() => setEditingClassId(null)}
                              className="bg-brand-surface-highest px-3 py-1 text-[10px] font-bold rounded hover:bg-white/5 text-[#e8dfee] transition-all cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleSaveEditClass(subj.id, cls.id)}
                              className="bg-brand-primary text-brand-on-primary px-3 py-1 text-[10px] font-bold rounded hover:brightness-105 transition-all text-white cursor-pointer"
                            >
                              Lưu thay đổi
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={cls.id}
                        className={`bg-brand-surface-highest/40 p-2 rounded-lg border relative group/cls min-h-[64px] flex flex-col justify-between transition-all text-left ${
                          cls.isPinned ? "border-amber-400 bg-amber-400-[0.1]" : "border-[#4a4455]/20 hover:bg-white/5"
                        }`}
                        style={cls.isPinned ? { borderColor: "#ffb95f", backgroundColor: "rgba(255, 185, 95, 0.05)" } : undefined}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 justify-between">
                            <span className="block text-[10px] font-bold text-[#e8dfee] line-clamp-1 pr-8">
                              {cls.className}
                            </span>
                            {cls.isPinned && (
                              <span className="shrink-0 text-[8px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1 rounded flex items-center gap-0.5">
                                <Pin className="w-2 h-2 text-amber-400" fill="currentColor" />
                                Pin
                              </span>
                            )}
                          </div>
                          
                          <span className="block text-[9px] text-brand-on-surface-variant mt-0.5 font-medium leading-tight">
                            {cls.day === 8 ? "CN" : `T${cls.day}`} • Tiết {cls.startSlot}-{cls.startSlot + cls.duration - 1}
                          </span>
                          
                          {cls.room && (
                            <span className="block text-[8px] text-brand-primary opacity-85 mt-0.5 leading-none">
                              P: {cls.room}
                            </span>
                          )}
                          {cls.teacher && (
                            <span className="block text-[8px] text-brand-secondary opacity-85 mt-0.5 leading-none">
                              GV: {cls.teacher}
                            </span>
                          )}
                        </div>

                        {/* HOVER TOOLBAR ACTIONS */}
                        <div className="absolute top-1 right-1 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/cls:opacity-100 transition-all bg-brand-surface-highest border border-[#4a4455]/20 p-0.5 rounded shadow-lg z-15">
                          <button
                            onClick={() => handleTogglePinClass(subj.id, cls.id)}
                            className={`p-0.5 rounded hover:bg-white/10 transition duration-150 cursor-pointer ${
                              cls.isPinned ? "text-amber-400" : "text-brand-on-surface-variant hover:text-amber-300"
                            }`}
                            title={cls.isPinned ? "Bỏ bắt buộc" : "Bắt buộc giữ lại"}
                          >
                            <Pin className="w-3.5 h-3.5" fill={cls.isPinned ? "currentColor" : "none"} />
                          </button>

                          <button
                            onClick={() => handleStartEditClass(cls)}
                            className="p-0.5 rounded text-brand-on-surface-variant hover:text-brand-primary hover:bg-white/10 transition duration-150 cursor-pointer"
                            title="Sửa nhanh lớp"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteClass(subj.id, cls.id)}
                            className="p-0.5 rounded text-brand-on-surface-variant hover:text-brand-error hover:bg-white/10 transition duration-150 cursor-pointer"
                            title="Xóa lớp học phần"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add class option inline toggle */}
              {newClassSubjectId === subj.id ? (
                <div className="bg-brand-surface-high/65 p-2 rounded-lg border border-[#4a4455]/30 flex flex-col gap-2 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-brand-primary uppercase">Mở lớp học mới</span>
                    <button onClick={() => setNewClassSubjectId(null)} className="text-brand-on-surface-variant hover:text-[#e8dfee]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase">Mã/Tên Lớp</span>
                      <input
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Lớp 01, Lớp L02"
                        className="bg-brand-surface-highest border border-[#4a4455]/40 text-xs rounded p-1 text-[#e8dfee]"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase">Thứ</span>
                      <select
                        value={newClassDay}
                        onChange={(e) => setNewClassDay(Number(e.target.value))}
                        className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee]"
                      >
                        <option value={2}>Thứ Hai</option>
                        <option value={3}>Thứ Ba</option>
                        <option value={4}>Thứ Tư</option>
                        <option value={5}>Thứ Năm</option>
                        <option value={6}>Thứ Sáu</option>
                        <option value={7}>Thứ Bảy</option>
                        <option value={8}>Chủ Nhật</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase">Tiết Đầu</span>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={newClassStart || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewClassStart(val === "" ? 0 : Number(val));
                        }}
                        onBlur={() => {
                          setNewClassStart(prev => Math.max(1, Math.min(12, prev || 1)));
                        }}
                        list="slots-1-12"
                        className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee]"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase">Số Tiết</span>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={newClassDuration || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewClassDuration(val === "" ? 0 : Number(val));
                        }}
                        onBlur={() => {
                          setNewClassDuration(prev => Math.max(1, Math.min(12, prev || 1)));
                        }}
                        list="slots-1-12"
                        className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee]"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 col-span-2">
                      <span className="text-[8px] text-brand-on-surface-variant font-bold uppercase">Phòng / Giảng viên (Không bắt buộc)</span>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          value={newClassRoom}
                          onChange={(e) => setNewClassRoom(e.target.value)}
                          placeholder="Phòng A.201"
                          className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee]"
                        />
                        <input
                          value={newClassTeacher}
                          onChange={(e) => setNewClassTeacher(e.target.value)}
                          placeholder="Thầy Khánh"
                          className="bg-brand-surface-highest border border-[#4a4455]/40 text-[10px] rounded p-1 text-[#e8dfee]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddClass(subj.id)}
                    className="bg-brand-secondary text-brand-on-secondary py-1 text-xs font-bold rounded hover:bg-brand-secondary/90 transition-all mt-1 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Xác nhận thêm lớp
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setNewClassSubjectId(subj.id);
                    setNewClassName(`Lớp 0${subj.classes.length + 1}`);
                  }}
                  className="text-xs text-brand-primary flex items-center gap-1 hover:underline mt-1 justify-center border border-dashed border-brand-primary/20 py-1.5 rounded-lg bg-brand-primary/5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm lớp học phần
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* CTA Bottom bar */}
      <div className="mt-auto pt-4 border-t border-[#4a4455]/10">
        <button
          onClick={onGenerate}
          className="w-full bg-[#00a572] hover:bg-[#00c58a] text-[#ffffff] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-secondary-container/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer duration-200"
        >
          <Sparkles className="w-4.5 h-4.5 text-yellow-300 animate-pulse" />
          Tính toán tối ưu lịch học
        </button>
      </div>

      {/* Shared datalist for start slots and duration */}
      <datalist id="slots-1-12">
        <option value="1" />
        <option value="2" />
        <option value="3" />
        <option value="4" />
        <option value="5" />
        <option value="6" />
        <option value="7" />
        <option value="8" />
        <option value="9" />
        <option value="10" />
        <option value="11" />
        <option value="12" />
      </datalist>
    </aside>
  );
};
