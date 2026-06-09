import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, RotateCcw, Award, Info, 
  MapPin, User, Clock, ShieldCheck, Sparkles, AlertTriangle, Calendar,
  BookmarkPlus, Check, AlertCircle, Sliders, X
} from "lucide-react";
import { TimetableSolution, BusyActivity, SavedPlan } from "../types";

interface CalendarGridProps {
  solutions: TimetableSolution[];
  currentSolutionIndex: number;
  setCurrentSolutionIndex: (idx: number) => void;
  busyActivities: BusyActivity[];
  onReset: () => void;
  onSavePlan: (name: string) => void;
  savedPlansCount: number;
  maxSavedPlans: number;
  
  savedPlans: SavedPlan[];
  viewMode: "calculated" | "saved";
  setViewMode: (mode: "calculated" | "saved") => void;
  selectedSavedPlanIndex: number;
  setSelectedSavedPlanIndex: (idx: number) => void;
  onLoadSavedPlan: (plan: SavedPlan) => void;
}

const slotTimes = [
  { slot: 1, start: "07:00", end: "07:45" },
  { slot: 2, start: "07:50", end: "08:35" },
  { slot: 3, start: "09:00", end: "09:45" },
  { slot: 4, start: "09:50", end: "10:35" },
  { slot: 5, start: "10:50", end: "11:35" },
  { slot: 6, start: "12:30", end: "13:15" },
  { slot: 7, start: "13:20", end: "14:05" },
  { slot: 8, start: "14:20", end: "15:05" },
  { slot: 9, start: "15:30", end: "16:15" },
  { slot: 10, start: "16:20", end: "17:05" },
  { slot: 11, start: "17:10", end: "17:55" },
  { slot: 12, start: "18:15", end: "19:00" },
];

const daysHeader = [
  { label: "Thứ 2", value: 2 },
  { label: "Thứ 3", value: 3 },
  { label: "Thứ 4", value: 4 },
  { label: "Thứ 5", value: 5 },
  { label: "Thứ 6", value: 6 },
  { label: "Thứ 7", value: 7 },
  { label: "CN", value: 8 },
];

const parseDeadlineDateStr = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(p => p.trim());
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day, 23, 59, 59);
    }
  }
  return null;
};

const getDeadlineStatusStyles = (deadlineStr?: string) => {
  if (!deadlineStr) return null;
  const targetDate = parseDeadlineDateStr(deadlineStr);
  if (!targetDate) {
    return {
      text: `Hạn ĐK: ${deadlineStr}`,
      className: "text-[#ffb95f] bg-[#ffb95f]/10 border-[#ffb95f]/20",
    };
  }
  
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return {
      text: "Đã quá hạn ĐK",
      className: "text-red-400 bg-red-950/25 border-red-500/20 font-bold",
    };
  }
  
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays <= 5) {
    return {
      text: `Gấp: Còn ${Math.ceil(diffDays)} ngày ĐK`,
      className: "text-rose-400 bg-rose-950/30 border-rose-500/30 animate-pulse font-extrabold",
    };
  }
  
  if (diffDays <= 15) {
    return {
      text: `Hạn ĐK: Còn ${Math.ceil(diffDays)} ngày`,
      className: "text-amber-400 bg-amber-950/20 border-amber-500/25 font-bold",
    };
  }
  
  return {
    text: `Hạn ĐK: ${deadlineStr}`,
    className: "text-[#ffb95f] bg-brand-surface-medium border-[#ffb95f]/15",
  };
};

const slotHeight = 60;
const compareSlotHeight = 44; // Tiết học hẹp hơn một chút trong giao diện so sánh song song

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  solutions,
  currentSolutionIndex,
  setCurrentSolutionIndex,
  busyActivities,
  onReset,
  onSavePlan,
  savedPlansCount,
  maxSavedPlans,
  
  savedPlans,
  viewMode,
  setViewMode,
  selectedSavedPlanIndex,
  setSelectedSavedPlanIndex,
  onLoadSavedPlan,
}) => {
  const [selectedDetails, setSelectedDetails] = useState<{
    title: string;
    subTitle: string;
    day: number;
    start: string;
    end: string;
    room?: string;
    teacher?: string;
    color?: string;
    isBusy?: boolean;
    registrationDeadline?: string;
  } | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const [showSavePopup, setShowSavePopup] = useState(false);
  const [savePlanName, setSavePlanName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveInputRef = useRef<HTMLInputElement>(null);

  // US-17: Quản lý trạng thái So sánh song song
  const [isComparing, setIsComparing] = useState(false);
  const [compareIdxA, setCompareIdxA] = useState(0);
  const [compareIdxB, setCompareIdxB] = useState(1);
  const [mobileActiveTab, setMobileCompareTab] = useState<"A" | "B">("A");

  const generateDefaultPlanName = () => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const dd = now.getDate().toString().padStart(2, "0");
    const mo = (now.getMonth() + 1).toString().padStart(2, "0");
    return `Phương án ${savedPlansCount + 1} — ${hh}:${mm} ${dd}/${mo}`;
  };

  const handleOpenSavePopup = () => {
    setSavePlanName(generateDefaultPlanName());
    setShowSavePopup(true);
    setSaveSuccess(false);
    setTimeout(() => saveInputRef.current?.focus(), 60);
  };

  const handleConfirmSave = () => {
    if (!savePlanName.trim()) return;
    onSavePlan(savePlanName.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setShowSavePopup(false);
      setSaveSuccess(false);
    }, 1200);
  };

  const activeSolution = solutions[currentSolutionIndex] || null;

  const handlePrev = () => {
    if (solutions.length === 0) return;
    const newIdx = currentSolutionIndex === 0 ? solutions.length - 1 : currentSolutionIndex - 1;
    setCurrentSolutionIndex(newIdx);
    setSelectedDetails(null);
  };

  const handleNext = () => {
    if (solutions.length === 0) return;
    const newIdx = currentSolutionIndex === solutions.length - 1 ? 0 : currentSolutionIndex + 1;
    setCurrentSolutionIndex(newIdx);
    setSelectedDetails(null);
  };

  const getDayLabel = (d: number) => {
    if (d === 8) return "Chủ Nhật";
    return `Thứ ${d}`;
  };

  // Tính toán chỉ số thống kê của bản nháp phục vụ US-17
  const getPlanStats = (plan: SavedPlan) => {
    if (!plan) return { totalPeriods: 0, activeDays: 0, freeDays: 7 };
    const classesList = plan.solution.classes;
    const totalPeriods = classesList.reduce((sum, c) => sum + c.classOption.duration, 0);
    const uniqueDays = new Set(classesList.map(c => c.classOption.day));
    const activeDays = uniqueDays.size;
    const freeDays = 7 - activeDays;
    return { totalPeriods, activeDays, freeDays };
  };

  const planA = savedPlans[compareIdxA] || null;
  const planB = savedPlans[compareIdxB] || null;

  const statsA = planA ? getPlanStats(planA) : null;
  const statsB = planB ? getPlanStats(planB) : null;

  // Thu thập ID lớp học của từng phương án để so sánh khác biệt (Visual Diff Highlighting)
  const classIdsA = useMemo(() => new Set(planA?.solution.classes.map(c => c.classOption.id) || []), [planA]);
  const classIdsB = useMemo(() => new Set(planB?.solution.classes.map(c => c.classOption.id) || []), [planB]);

  // Bộ kết xuất lưới lịch biểu mini phục vụ so sánh song song
  const renderCompareCalendar = (
    plan: SavedPlan, 
    otherPlanIds: Set<string>, 
    sideLabel: string
  ) => {
    const classesList = plan?.solution.classes || [];
    return (
      <div className="flex flex-col gap-3 h-full">
        {/* Lưới lịch học */}
        <div className="calendar-scroll-wrapper w-full overflow-x-auto rounded-xl">
          <div className="glass-panel rounded-xl overflow-hidden flex flex-col min-w-[500px]">
            {/* Header ngày */}
            <div className="calendar-grid bg-brand-surface-medium/95 border-b border-brand-border shrink-0">
              <div className="flex items-center justify-center font-extrabold text-brand-text-muted text-[10px] border-r border-brand-border h-10 uppercase">
                Tiết
              </div>
              {daysHeader.map((day) => (
                <div key={day.value} className="flex items-center justify-center font-bold text-xs text-brand-text border-r border-brand-border/60 last:border-r-0">
                  {day.label}
                </div>
              ))}
            </div>

            {/* Trực quan lịch học */}
            <div className="relative w-full shrink-0" style={{ height: `${12 * compareSlotHeight}px` }}>
              {/* Lưới phân tiết */}
              <div className="absolute inset-0 calendar-grid pointer-events-none">
                <div className="border-r border-brand-border h-full"></div>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="border-r border-brand-border/60 h-full last:border-r-0 relative">
                    {Array.from({ length: 12 }).map((_, rIdx) => (
                      <div
                        key={rIdx}
                        style={{ top: `${rIdx * compareSlotHeight}px`, height: `${compareSlotHeight}px` }}
                        className="absolute left-0 w-full border-b border-brand-border/30"
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Cột tiết bên trái */}
              <div className="absolute top-0 left-0 w-[80px] h-full border-r border-brand-border pointer-events-none">
                {slotTimes.map((time) => (
                  <div
                    key={time.slot}
                    style={{ top: `${(time.slot - 1) * compareSlotHeight}px`, height: `${compareSlotHeight}px` }}
                    className="absolute w-full flex flex-col justify-center items-center text-center border-b border-brand-border/60 bg-brand-surface-medium/30"
                  >
                    <span className="font-bold text-[10px] text-brand-primary">{time.slot}</span>
                    <span className="text-[8px] text-[#ccc3d8]/50 font-mono tracking-tighter">{time.start}</span>
                  </div>
                ))}
              </div>

              {/* Ô học phần */}
              <div className="absolute top-0 left-[80px] right-0 h-full">
                <div className="relative w-full h-full grid grid-cols-7">
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const dayValue = idx + 2;
                    const dayClasses = classesList.filter((item) => item.classOption.day === dayValue);
                    const dayBusy = busyActivities.filter((act) => act.day === dayValue);

                    return (
                      <div key={dayValue} className="relative h-full border-r border-brand-border/60 last:border-r-0">
                        {dayClasses.map((item) => {
                          const opt = item.classOption;
                          const cardTop = (opt.startSlot - 1) * compareSlotHeight;
                          const cardHeight = opt.duration * compareSlotHeight - 4;
                          
                          // Lớp học chỉ xuất hiện ở 1 phương án thì được highlight viền nhấp nháy màu vàng
                          const isDifferent = !otherPlanIds.has(opt.id);

                          return (
                            <div
                              key={opt.id}
                              style={{
                                top: `${cardTop + 2}px`,
                                height: `${cardHeight}px`,
                                backgroundColor: isDifferent ? "rgba(251, 191, 36, 0.08)" : item.color.replace("1)", "0.12)"),
                                borderColor: isDifferent ? "#fbbf24" : item.color,
                              }}
                              className={`absolute left-0.5 right-0.5 border rounded-lg p-1.5 flex flex-col justify-between overflow-hidden transition-all ${
                                isDifferent 
                                  ? "animate-pulse border-2 shadow-[0_0_8px_#fbbf24] z-20" 
                                  : "border-brand-border/50"
                              }`}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span 
                                  className="block font-bold text-[9px] leading-tight line-clamp-1"
                                  style={{ color: isDifferent ? "#fbbf24" : item.color }}
                                >
                                  {item.subjectName}
                                </span>
                                <span className="text-[8px] text-brand-text opacity-90 block truncate leading-none">
                                  {opt.className}
                                </span>
                                {opt.room && (
                                  <span className="text-[7px] text-brand-text-muted block truncate mt-0.5">
                                    {opt.room}
                                  </span>
                                )}
                              </div>
                              <span className="text-[7px] font-mono opacity-50 block leading-none">
                                Tiết {opt.startSlot}-{opt.startSlot + opt.duration - 1}
                              </span>
                            </div>
                          );
                        })}

                        {/* Lịch bận cá nhân */}
                        {dayBusy.map((busy) => {
                          const busyTop = (busy.startSlot - 1) * compareSlotHeight;
                          const busyHeight = busy.duration * compareSlotHeight - 4;

                          return (
                            <div
                              key={busy.id}
                              style={{ top: `${busyTop + 2}px`, height: `${busyHeight}px` }}
                              className="absolute left-0.5 right-0.5 bg-brand-surface-high border border-brand-border border-dashed rounded-lg p-1 flex flex-col justify-start opacity-60 pointer-events-none"
                            >
                              <span className="block font-bold text-brand-text-muted text-[8px] truncate leading-none">
                                {busy.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  // NẾU ĐANG BẬT CHẾ ĐỘ SO SÁNH SONG SONG (US-17)
  if (isComparing && savedPlans.length >= 2) {
    return (
      <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-brand-bg/95 flex flex-col gap-4 md:gap-6 relative select-none pb-20 lg:pb-6 ios-scroll">
        
        {/* HEADER CHẾ ĐỘ SO SÁNH */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-amber-400 flex items-center gap-2">
              <Sliders className="w-6 h-6 text-amber-400 rotate-90" />
              So sánh phương án lịch song song
            </h1>
            <p className="text-xs text-brand-on-surface-variant">
              Tự động highlight các điểm khác biệt bằng <strong className="text-amber-400">viền nhấp nháy màu vàng</strong> để dễ dàng đối chiếu
            </p>
          </div>
          <button
            onClick={() => setIsComparing(false)}
            className="bg-brand-surface-high hover:bg-brand-surface-highest text-brand-text border border-brand-border px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 self-stretch sm:self-auto justify-center"
          >
            <X className="w-4 h-4 text-brand-text" />
            Đóng so sánh
          </button>
        </div>

        {/* TAB TOGGLE TRÊN THIẾT BỊ DI ĐỘNG (MOBILE TABS) */}
        {isMobile && (
          <div className="flex bg-brand-surface-low border border-brand-border rounded-xl p-1 w-full shrink-0">
            <button
              onClick={() => setMobileCompareTab("A")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileActiveTab === "A"
                  ? "bg-brand-primary text-white"
                  : "text-brand-text-muted"
              }`}
            >
              Phương án A ({planA?.name ? planA.name.split(" — ")[0] : "Nháp 1"})
            </button>
            <button
              onClick={() => setMobileCompareTab("B")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileActiveTab === "B"
                  ? "bg-brand-secondary text-brand-on-secondary"
                  : "text-brand-text-muted"
              }`}
            >
              Phương án B ({planB?.name ? planB.name.split(" — ")[0] : "Nháp 2"})
            </button>
          </div>
        )}

        {/* KHÔNG GIAN GRID CHIA ĐÔI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start h-full">
          
          {/* CỘT PHƯƠNG ÁN A */}
          {(!isMobile || mobileActiveTab === "A") && (
            <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4 border border-brand-border shadow-xl">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">PHƯƠNG ÁN SO SÁNH A</span>
                <select
                  value={compareIdxA}
                  onChange={(e) => setCompareIdxA(Number(e.target.value))}
                  className="bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-brand-text focus:outline-none focus:border-brand-primary w-full cursor-pointer"
                >
                  {savedPlans.map((p, idx) => (
                    <option key={p.id} value={idx} disabled={idx === compareIdxB}>
                      {p.name} ({p.totalSubjects} môn)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tóm tắt thống kê phương án A */}
              {statsA && (
                <div className="grid grid-cols-3 gap-2 bg-brand-surface-medium/50 p-2.5 rounded-xl border border-brand-border/60">
                  <div className="text-center">
                    <span className="block text-[8px] uppercase font-bold text-brand-on-surface-variant tracking-wider">Tổng tiết</span>
                    <span className="text-xs font-extrabold text-brand-primary">{statsA.totalPeriods} tiết</span>
                  </div>
                  <div className="text-center border-x border-brand-border/40">
                    <span className="block text-[8px] uppercase font-bold text-brand-on-surface-variant tracking-wider">Ngày học</span>
                    <span className="text-xs font-extrabold text-brand-secondary">{statsA.activeDays} ngày</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[8px] uppercase font-bold text-brand-on-surface-variant tracking-wider">Ngày rảnh</span>
                    <span className="text-xs font-extrabold text-brand-tertiary">{statsA.freeDays} ngày</span>
                  </div>
                </div>
              )}

              {/* Calendar Grid A */}
              {planA && renderCompareCalendar(planA, classIdsB, "A")}

              <button
                onClick={() => {
                  if (planA) {
                    onLoadSavedPlan(planA);
                    setIsComparing(false);
                  }
                }}
                className="w-full bg-brand-primary hover:brightness-110 text-brand-on-primary py-3 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Check className="w-4 h-4" />
                Đăng ký phương án này
              </button>
            </div>
          )}

          {/* CỘT PHƯƠNG ÁN B */}
          {(!isMobile || mobileActiveTab === "B") && (
            <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4 border border-brand-border shadow-xl">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider block">PHƯƠNG ÁN SO SÁNH B</span>
                <select
                  value={compareIdxB}
                  onChange={(e) => setCompareIdxB(Number(e.target.value))}
                  className="bg-brand-surface border border-brand-border rounded-xl px-3 py-2 text-xs font-bold text-brand-text focus:outline-none focus:border-brand-primary w-full cursor-pointer"
                >
                  {savedPlans.map((p, idx) => (
                    <option key={p.id} value={idx} disabled={idx === compareIdxA}>
                      {p.name} ({p.totalSubjects} môn)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tóm tắt thống kê phương án B */}
              {statsB && (
                <div className="grid grid-cols-3 gap-2 bg-brand-surface-medium/50 p-2.5 rounded-xl border border-brand-border/60">
                  <div className="text-center">
                    <span className="block text-[8px] uppercase font-bold text-brand-on-surface-variant tracking-wider">Tổng tiết</span>
                    <span className="text-xs font-extrabold text-brand-primary">{statsB.totalPeriods} tiết</span>
                  </div>
                  <div className="text-center border-x border-brand-border/40">
                    <span className="block text-[8px] uppercase font-bold text-brand-on-surface-variant tracking-wider">Ngày học</span>
                    <span className="text-xs font-extrabold text-brand-secondary">{statsB.activeDays} ngày</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[8px] uppercase font-bold text-brand-on-surface-variant tracking-wider">Ngày rảnh</span>
                    <span className="text-xs font-extrabold text-brand-tertiary">{statsB.freeDays} ngày</span>
                  </div>
                </div>
              )}

              {/* Calendar Grid B */}
              {planB && renderCompareCalendar(planB, classIdsA, "B")}

              <button
                onClick={() => {
                  if (planB) {
                    onLoadSavedPlan(planB);
                    setIsComparing(false);
                  }
                }}
                className="w-full bg-brand-secondary hover:brightness-110 text-brand-on-secondary py-3 rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Check className="w-4 h-4" />
                Đăng ký phương án này
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // GIAO DIỆN LỊCH BIỂU CHÍNH BAN ĐẦU
  return (
    <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-brand-bg/95 relative flex flex-col gap-4 md:gap-6 select-none pb-20 lg:pb-6 content-safe-bottom ios-scroll">
      
      {/* HEADER BAR FOR RESULTS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-border pb-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-brand-primary-container/20 p-2 rounded-xl text-brand-primary">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-brand-text flex items-center gap-2">
              {viewMode === "saved" ? "Bản nháp thời khóa biểu" : "Kết quả xếp lịch biểu"}
            </h1>
            <p className="text-xs text-brand-on-surface-variant">
              {viewMode === "saved" ? "Đang xem lại bản nháp bạn đã lưu trong trình duyệt" : "Tối thiểu hóa xung đột thời gian dựa trên các tham số đầu vào"}
            </p>
          </div>
          {solutions.length > 0 && (
            <span className="bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
              {viewMode === "saved" ? "ĐÃ LƯU" : "HOÀN HẢO"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* TAB BỘ LỌC CHUYỂN ĐỔI: TÍNH TOÁN VS BẢN NHÁP */}
          <div className="flex bg-brand-surface-low border border-brand-border rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode("calculated")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "calculated"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-text-muted hover:text-brand-primary"
              }`}
            >
              Bộ tổ hợp ({solutions.length})
            </button>
            <button
              onClick={() => {
                if (savedPlans.length > 0) {
                  setViewMode("saved");
                  onLoadSavedPlan(savedPlans[selectedSavedPlanIndex]);
                } else {
                  alert("Bạn chưa lưu phương án nháp nào! Hãy lưu phương án hiện tại trước.");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "saved"
                  ? "bg-brand-secondary text-brand-on-secondary shadow-sm"
                  : "text-brand-text-muted hover:text-brand-secondary"
              }`}
            >
              Nháp đã lưu ({savedPlans.length})
            </button>
          </div>

          {/* US-17: NÚT KÍCH HOẠT CHẾ ĐỘ SO SÁNH SONG SONG */}
          {savedPlans.length >= 2 && (
            <button
              onClick={() => {
                // Đảm bảo chỉ số so sánh luôn nằm trong khoảng hợp lệ của danh sách đã lưu
                setCompareIdxA(0);
                setCompareIdxB(1);
                setIsComparing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer active:scale-95 animate-pulse"
              title="So sánh trực quan hai thời khóa biểu đã lưu cạnh nhau"
            >
              <Sliders className="w-4 h-4 text-amber-400 rotate-90" />
              So sánh song song
            </button>
          )}

          {/* THANH ĐIỀU HƯỚNG TỔNG PHƯƠNG ÁN */}
          {viewMode === "calculated" ? (
            solutions.length > 0 && (
              <div className="bg-brand-surface-medium border border-brand-border flex items-center rounded-xl p-1 shrink-0">
                <button
                  onClick={handlePrev}
                  className="p-1.5 hover:text-brand-primary transition rounded-lg hover:bg-brand-primary/10 active:scale-95 cursor-pointer"
                  title="Phương án trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-3 flex flex-col items-center min-w-[120px]">
                  <span className="font-semibold text-xs text-brand-text text-center">
                    Phương án {currentSolutionIndex + 1}/{solutions.length}
                  </span>
                  <span className="text-[9px] font-mono text-brand-primary/80 mt-0.5">
                    Đã lưu: {savedPlansCount}/{maxSavedPlans}
                  </span>
                </div>
                <button
                  onClick={handleNext}
                  className="p-1.5 hover:text-brand-primary transition rounded-lg hover:bg-brand-primary/10 active:scale-95 cursor-pointer"
                  title="Phương án sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )
          ) : (
            savedPlans.length > 0 && (
              <div className="bg-brand-surface-medium border border-brand-border flex items-center rounded-xl p-1 shrink-0">
                <button
                  onClick={() => {
                    const newIdx = selectedSavedPlanIndex === 0 ? savedPlans.length - 1 : selectedSavedPlanIndex - 1;
                    setSelectedSavedPlanIndex(newIdx);
                    onLoadSavedPlan(savedPlans[newIdx]);
                  }}
                  className="p-1.5 hover:text-brand-secondary transition rounded-lg hover:bg-brand-secondary/10 active:scale-95 cursor-pointer"
                  title="Nháp trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-3 flex flex-col items-center min-w-[120px]">
                  <span className="font-semibold text-xs text-brand-text text-center">
                    Nháp {selectedSavedPlanIndex + 1}/{savedPlans.length}
                  </span>
                  <span className="text-[9px] font-mono text-brand-secondary/80 mt-0.5 max-w-[100px] truncate" title={savedPlans[selectedSavedPlanIndex]?.name}>
                    {savedPlans[selectedSavedPlanIndex]?.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const newIdx = selectedSavedPlanIndex === savedPlans.length - 1 ? 0 : selectedSavedPlanIndex + 1;
                    setSelectedSavedPlanIndex(newIdx);
                    onLoadSavedPlan(savedPlans[newIdx]);
                  }}
                  className="p-1.5 hover:text-brand-secondary transition rounded-lg hover:bg-brand-secondary/10 active:scale-95 cursor-pointer"
                  title="Nháp sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )
          )}

          {/* Nút Lưu phương án */}
          {solutions.length > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={handleOpenSavePopup}
                disabled={savedPlansCount >= maxSavedPlans}
                title={savedPlansCount >= maxSavedPlans ? "Đã đủ 5 phương án, xóa bớt để lưu thêm" : "Lưu phương án này"}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-[11px] md:text-xs border transition-all duration-200 cursor-pointer active:scale-95 ${
                  savedPlansCount >= maxSavedPlans
                    ? "opacity-50 cursor-not-allowed bg-brand-surface-medium border-brand-border text-brand-text-muted"
                    : "bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary border-brand-primary/30 hover:border-brand-primary/60"
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Lưu phương án</span>
              </button>

              {/* Popup lưu nháp */}
              {showSavePopup && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSavePopup(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-4 w-72 flex flex-col gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <BookmarkPlus className="w-4 h-4 text-brand-primary shrink-0" />
                      <span className="font-bold text-sm text-brand-text">Lưu phương án nháp</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-brand-on-surface-variant tracking-wider">
                        Tên phương án
                      </label>
                      <input
                        ref={saveInputRef}
                        value={savePlanName}
                        onChange={(e) => setSavePlanName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmSave();
                          if (e.key === "Escape") setShowSavePopup(false);
                        }}
                        maxLength={60}
                        placeholder="Nhập tên phương án..."
                        className="bg-brand-surface-medium border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary transition-colors placeholder:text-brand-text-muted/50"
                      />
                      <span className="text-[9px] text-brand-text-muted/60 text-right font-mono">
                        {savePlanName.length}/60
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSavePopup(false)}
                        className="flex-1 bg-brand-surface-high hover:bg-brand-surface-highest text-brand-text border border-brand-border py-2 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleConfirmSave}
                        disabled={!savePlanName.trim() || saveSuccess}
                        className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                          saveSuccess
                            ? "bg-brand-secondary text-brand-on-secondary"
                            : "bg-brand-primary text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        }`}
                      >
                        {saveSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Đã lưu!
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-3.5 h-3.5" />
                            Xác nhận
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[9px] text-brand-text-muted/70 leading-relaxed border-t border-brand-border/40 pt-2">
                      💡 Phương án sẽ được lưu cục bộ trên trình duyệt của bạn.
                      Xem &amp; tải lại tại tab <strong className="text-brand-primary">Đồng bộ &amp; Xuất</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={onReset}
            className="bg-brand-error-container/15 hover:bg-brand-error-container/25 text-brand-error border border-brand-error/20 px-3 py-2 md:px-4 md:py-2.5 rounded-xl flex items-center gap-2 font-bold text-[11px] md:text-xs transition-colors duration-200 cursor-pointer w-full md:w-auto justify-center active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reset dữ liệu sạch
          </button>
        </div>
      </div>

      {/* BANNER THÔNG BÁO TRẠNG THÁI */}
      {solutions.length > 0 ? (
        <div className="bg-brand-primary/10 border border-brand-primary/25 p-4 rounded-2xl flex items-start gap-3.5 shadow-md">
          <Sparkles className="w-5 h-5 text-brand-primary mt-0.5 animate-bounce" />
          <div className="text-xs md:text-sm text-brand-on-surface-variant">
            {viewMode === "saved" ? (
              <>
                Đang hiển thị bản nháp <strong className="text-brand-secondary text-base font-bold underline decoration-dotted">{savedPlans[selectedSavedPlanIndex]?.name}</strong>. Mọi chỉnh sửa ở sidebar sẽ đưa lịch về chế độ tính toán tự động.
              </>
            ) : (
              <>
                Đã tìm thấy <strong className="text-brand-primary text-base font-bold underline decoration-dotted">{solutions.length} phương án</strong> thời khóa biểu tối ưu không trùng lặp! Hãy duyệt qua từng phương án để chọn lịch học ưng ý nhất của bạn.
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/25 p-4 rounded-2xl flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-brand-tertiary mt-0.5" />
          <div className="text-xs md:text-sm text-brand-on-surface-variant">
            <span className="font-bold text-brand-tertiary block mb-1">Không tìm thấy phương án trống hoàn toàn</span>
            Hiện có {busyActivities.length} lịch bận cố định hoặc danh sách môn học trống, vui lòng giảm bớt môn học hoặc giảm lịch bận để tìm phương án khả thi, hoặc thêm lựa chọn lớp học phần phụ! Lịch bận cố định sẽ hiển thị dưới dạng ghi chú khu vực màu xám.
          </div>
        </div>
      )}

      {/* WEEKLY TIMETABLE GRID */}
      <div className="calendar-scroll-wrapper w-full overflow-x-auto rounded-2xl md:rounded-3xl shrink-0">
        <div className="glass-panel rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl flex flex-col min-w-[600px] md:min-w-[760px]">
          
          <div className="calendar-grid bg-brand-surface-medium/80 border-b border-brand-border shrink-0">
            <div className="flex items-center justify-center font-extrabold text-brand-text-muted text-xs border-r border-brand-border h-12 uppercase tracking-widest">
              TIẾT
            </div>
            {daysHeader.map((day) => (
              <div
                key={day.value}
                className="flex items-center justify-center font-bold text-xs md:text-sm text-brand-text border-r border-brand-border/60 last:border-r-0"
              >
                {day.label}
              </div>
            ))}
          </div>

          <div className="relative w-full shrink-0" style={{ height: `${12 * slotHeight}px` }}>
            <div className="absolute inset-0 calendar-grid pointer-events-none">
              <div className="border-r border-brand-border h-full"></div>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="border-r border-brand-border/60 h-full last:border-r-0 relative">
                  {Array.from({ length: 12 }).map((_, rIdx) => (
                    <div
                      key={rIdx}
                      style={{ top: `${rIdx * slotHeight}px`, height: `${slotHeight}px` }}
                      className="absolute left-0 w-full border-b border-brand-border/40"
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="absolute top-0 left-0 w-[80px] h-full border-r border-brand-border pointer-events-none">
              {slotTimes.map((time) => (
                <div
                  key={time.slot}
                  style={{ top: `${(time.slot - 1) * slotHeight}px`, height: `${slotHeight}px` }}
                  className="absolute w-full flex flex-col justify-center items-center text-center border-b border-brand-border/60 bg-brand-surface-medium/30"
                >
                  <span className="font-bold text-xs text-brand-primary">{time.slot}</span>
                  <span className="text-[9px] text-[#ccc3d8]/60 mt-0.5 font-mono tracking-tight">{time.start}</span>
                </div>
              ))}
            </div>

            <div className="absolute top-0 left-[80px] right-0 h-full">
              <div className="relative w-full h-full grid grid-cols-7">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const dayValue = idx + 2;
                  const currentDayClasses = activeSolution
                    ? activeSolution.classes.filter((item) => item.classOption.day === dayValue)
                    : [];
                  const currentDayBusy = busyActivities.filter((act) => act.day === dayValue);

                  return (
                    <div key={dayValue} className="relative h-full border-r border-brand-border/60 last:border-r-0">
                      {currentDayClasses.map((item) => {
                        const opt = item.classOption;
                        const cardTop = (opt.startSlot - 1) * slotHeight;
                        const cardHeight = opt.duration * slotHeight - 6;

                        return (
                          <div
                            key={opt.id}
                            style={{
                              top: `${cardTop + 3}px`,
                              height: `${cardHeight}px`,
                              backgroundColor: `${item.color.replace("1)", "0.15)")}`,
                              borderColor: item.color,
                            }}
                            onClick={() => setSelectedDetails({
                              title: item.subjectName,
                              subTitle: opt.className,
                              day: opt.day,
                              start: slotTimes[opt.startSlot - 1]?.start || "",
                              end: slotTimes[opt.startSlot + opt.duration - 2]?.end || "",
                              room: opt.room,
                              teacher: opt.teacher,
                              color: item.color,
                              registrationDeadline: opt.registrationDeadline,
                            })}
                            className="absolute left-1 right-1 border-2 rounded-xl p-2 md:p-3 flex flex-col justify-between group cursor-pointer hover:scale-[0.98] active:scale-95 transition-all z-10 select-none overflow-hidden hover:brightness-110 shadow-lg"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="block font-bold text-xs md:text-sm line-clamp-2" style={{ color: item.color }}>
                                {item.subjectName}
                              </span>
                              <span className="text-[10px] text-white opacity-90 font-medium">
                                {opt.className}
                              </span>
                              {opt.isPinned && (
                                <span className="text-[9px] text-amber-400 font-bold flex items-center gap-0.5 mt-0.5">
                                  🔒 Bắt buộc
                                </span>
                              )}
                              {opt.room && (
                                <span className="text-[9px] text-[#ccc3d8] flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  {opt.room}
                                </span>
                              )}
                              {opt.registrationDeadline && (() => {
                                const badge = getDeadlineStatusStyles(opt.registrationDeadline);
                                if (!badge) return null;
                                return (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md border flex items-center gap-1 mt-1 font-medium ${badge.className}`}>
                                    <Calendar className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{badge.text}</span>
                                  </span>
                                );
                              })()}
                            </div>
                            
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[8px] font-mono opacity-60">
                                Tiết {opt.startSlot}-{opt.startSlot + opt.duration - 1}
                              </span>
                              <Info className="w-3.5 h-3.5 opacity-0 group-hover:opacity-80 transition-opacity" style={{ color: item.color }} />
                            </div>
                          </div>
                        );
                      })}

                      {currentDayBusy.map((busy) => {
                        const busyTop = (busy.startSlot - 1) * slotHeight;
                        const busyHeight = busy.duration * slotHeight - 6;

                        return (
                          <div
                            key={busy.id}
                            style={{ top: `${busyTop + 3}px`, height: `${busyHeight}px` }}
                            className="absolute left-1.5 right-1.5 bg-brand-surface-high border border-brand-border rounded-xl p-2.5 flex flex-col justify-start gap-1 z-10 opacity-80 group hover:opacity-100 transition-all cursor-pointer border-dashed"
                          >
                            <span className="block font-semibold text-brand-text-muted text-[10px] uppercase tracking-wide line-clamp-1">
                              {busy.name}
                            </span>
                            <span className="text-[8px] font-mono text-brand-on-surface-variant opacity-80 uppercase tracking-widest block">
                              Bận cố định
                            </span>
                            <span className="text-[8px] font-mono text-brand-on-surface-variant opacity-60 block">
                              Tiết {busy.startSlot}-{busy.startSlot + busy.duration - 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FOOTER DETAILS DRAWER */}
      {selectedDetails && (
        <>
          <div className="fixed inset-0 z-40 md:hidden bg-black/30 backdrop-blur-xs" onClick={() => setSelectedDetails(null)} />
          <div className="z-50 bg-brand-surface border border-brand-border shadow-2xl flex flex-col gap-3 relative animate-fade-in fixed bottom-0 left-0 right-0 rounded-t-2xl p-5 md:absolute md:bottom-auto md:left-auto md:right-6 md:top-6 md:w-[320px] md:rounded-2xl md:p-4 pb-12 md:pb-4">
            <div className="w-10 h-1 bg-brand-surface-highest rounded-full mx-auto mb-1 md:hidden" />
            
            <button onClick={() => setSelectedDetails(null)} className="absolute top-3 right-3 text-brand-on-surface-variant hover:text-brand-text p-1 rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <span style={{ backgroundColor: selectedDetails.color || "#4e4455" }} className="w-3.5 h-3.5 rounded-full" />
              <h3 className="font-bold text-base text-brand-text">{selectedDetails.title}</h3>
              <span className="bg-brand-surface-highest text-xs text-brand-primary px-2 py-0.5 rounded-md border border-brand-border">
                {selectedDetails.subTitle}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-1 bg-brand-surface-medium/50 p-3 rounded-xl border border-brand-border/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                <div>
                  <span className="block text-[10px] text-brand-on-surface-variant uppercase">Thời gian</span>
                  <span className="text-xs font-semibold text-brand-text">
                    {getDayLabel(selectedDetails.day)}: {selectedDetails.start} - {selectedDetails.end}
                  </span>
                </div>
              </div>

              {selectedDetails.room && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-secondary shrink-0" />
                  <div>
                    <span className="block text-[10px] text-brand-on-surface-variant uppercase">Phòng học</span>
                    <span className="text-xs font-semibold text-brand-text">{selectedDetails.room}</span>
                  </div>
                </div>
              )}

              {selectedDetails.teacher && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-tertiary shrink-0" />
                  <div>
                    <span className="block text-[10px] text-brand-on-surface-variant uppercase">Giảng viên</span>
                    <span className="text-xs font-semibold text-brand-text">{selectedDetails.teacher}</span>
                  </div>
                </div>
              )}

              {selectedDetails.registrationDeadline && (() => {
                const badge = getDeadlineStatusStyles(selectedDetails.registrationDeadline);
                return (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#ffb95f] shrink-0" />
                    <div>
                      <span className="block text-[10px] text-brand-on-surface-variant uppercase">Hạn đăng ký</span>
                      <span className="text-xs font-semibold text-brand-text flex items-center gap-1 flex-wrap">
                        {selectedDetails.registrationDeadline}
                        {badge && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${badge.className}`}>
                            {badge.text.includes(":") ? badge.text.split(":")[1].trim() : badge.text}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="block text-[10px] text-brand-on-surface-variant uppercase">Xác thực lịch</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {selectedDetails.isBusy ? "Khóa cố định" : "Khả thi 100%"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};