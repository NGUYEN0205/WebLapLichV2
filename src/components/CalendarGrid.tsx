import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, ChevronRight, RotateCcw, Award, Info, 
  MapPin, User, Clock, ShieldCheck, Sparkles, AlertTriangle, Calendar
} from "lucide-react";
import { TimetableSolution, BusyActivity } from "../types";

interface CalendarGridProps {
  solutions: TimetableSolution[];
  currentSolutionIndex: number;
  setCurrentSolutionIndex: (idx: number) => void;
  busyActivities: BusyActivity[];
  onReset: () => void;
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
    const month = parseInt(parts[1], 10) - 1; // 0-based month
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

const slotHeight = 60; // height of each period slot in pixels

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  solutions,
  currentSolutionIndex,
  setCurrentSolutionIndex,
  busyActivities,
  onReset,
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

  // Convert day number to Vietnamese string
  const getDayLabel = (d: number) => {
    if (d === 8) return "Chủ Nhật";
    return `Thứ ${d}`;
  };

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
              Kết quả xếp lịch biểu
            </h1>
            <p className="text-xs text-brand-on-surface-variant">
              Tối thiểu hóa xung đột thời gian dựa trên các tham số đầu vào
            </p>
          </div>
          {solutions.length > 0 && (
            <span className="bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
              HOÀN HẢO
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {solutions.length > 0 && (
            <div className="bg-brand-surface-medium border border-brand-border flex items-center rounded-xl p-1 shrink-0">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:text-brand-primary transition rounded-lg hover:bg-brand-primary/10 active:scale-95 cursor-pointer"
                title="Phương án trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 font-semibold text-xs text-brand-text min-w-[110px] text-center">
                Phương án {currentSolutionIndex + 1}/{solutions.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1.5 hover:text-brand-primary transition rounded-lg hover:bg-brand-primary/10 active:scale-95 cursor-pointer"
                title="Phương án sau"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
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

      {/* INSIGHTS ALERT BANNER */}
      {solutions.length > 0 ? (
        <div className="bg-brand-primary/10 border border-brand-primary/25 p-4 rounded-2xl flex items-start gap-3.5 shadow-md">
          <Sparkles className="w-5 h-5 text-brand-primary mt-0.5 animate-bounce" />
          <div className="text-xs md:text-sm text-brand-on-surface-variant">
            Đã tìm thấy <strong className="text-brand-primary text-base font-bold underline decoration-dotted">{solutions.length} phương án</strong> thời khóa biểu tối ưu không trùng lặp! Hãy duyệt qua từng phương án để chọn lịch học ưng ý nhất của bạn.
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

      {/* WEEKLY TIMETABLE CONTAINER WRAPPER FOR HORIZONTAL FLOW */}
      <div className="calendar-scroll-wrapper w-full overflow-x-auto rounded-2xl md:rounded-3xl shrink-0">
        {/* WEEKLY TIMETABLE CONTAINER */}
        <div className="glass-panel rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl flex flex-col min-w-[600px] md:min-w-[760px]">
        
        {/* DAYS HEADER CHIPS */}
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

        {/* TIMETABLE CONTENT GRID BODY */}
        <div className="relative w-full shrink-0" style={{ height: `${12 * slotHeight}px` }}>
          
          {/* BACKGROUND ROWS AND COLUMNS LINES */}
          <div className="absolute inset-0 calendar-grid pointer-events-none">
            {/* Label Column Grid boundaries */}
            <div className="border-r border-brand-border h-full"></div>
            
            {/* Days Columns */}
            {Array.from({ length: 7 }).map((_, i) => (
              <div 
                key={i} 
                className="border-r border-brand-border/60 h-full last:border-r-0 relative"
              >
                {/* Horizontal time grids */}
                {Array.from({ length: 12 }).map((_, rIdx) => (
                  <div
                    key={rIdx}
                    style={{ 
                      top: `${rIdx * slotHeight}px`,
                      height: `${slotHeight}px`
                    }}
                    className="absolute left-0 w-full border-b border-brand-border/40"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* LEFT-SIDE PERIOD BLOCKS WITH DETAILED START TIMES */}
          <div className="absolute top-0 left-0 w-[80px] h-full border-r border-brand-border pointer-events-none">
            {slotTimes.map((time) => (
              <div
                key={time.slot}
                style={{
                  top: `${(time.slot - 1) * slotHeight}px`,
                  height: `${slotHeight}px`
                }}
                className="absolute w-full flex flex-col justify-center items-center text-center border-b border-brand-border/60 bg-brand-surface-medium/30"
              >
                <span className="font-bold text-xs text-brand-primary">{time.slot}</span>
                <span className="text-[9px] text-[#ccc3d8]/60 mt-0.5 font-mono tracking-tight">{time.start}</span>
              </div>
            ))}
          </div>

          {/* OVERLAYING SCHEDULING CARDS IN ABSOLUTE GRID BOUNDS */}
          <div className="absolute top-0 left-[80px] right-0 h-full">
            <div className="relative w-full h-full grid grid-cols-7">
              
              {/* Day container columns */}
              {Array.from({ length: 7 }).map((_, idx) => {
                const dayValue = idx + 2; // Monday=2, Tuesday=3, ...
                
                // Get active solution classes on this specific day
                const currentDayClasses = activeSolution
                  ? activeSolution.classes.filter((item) => item.classOption.day === dayValue)
                  : [];
                  
                // Get busy schedules on this day
                const currentDayBusy = busyActivities.filter((act) => act.day === dayValue);

                return (
                  <div key={dayValue} className="relative h-full border-r border-brand-border/60 last:border-r-0">
                    
                    {/* Render active class option card */}
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
                            <span 
                              className="block font-bold text-xs md:text-sm line-clamp-2"
                              style={{ color: item.color }}
                            >
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

                    {/* Render Busy schedules notes (subtle grey placeholders) */}
                    {currentDayBusy.map((busy) => {
                      const busyTop = (busy.startSlot - 1) * slotHeight;
                      const busyHeight = busy.duration * slotHeight - 6;

                      return (
                        <div
                          key={busy.id}
                          style={{
                            top: `${busyTop + 3}px`,
                            height: `${busyHeight}px`,
                          }}
                          onClick={() => setSelectedDetails({
                            title: busy.name,
                            subTitle: "Lịch bận cố định",
                            day: busy.day,
                            start: slotTimes[busy.startSlot - 1]?.start || "",
                            end: slotTimes[busy.startSlot + busy.duration - 2]?.end || "",
                            isBusy: true,
                          })}
                          className="absolute left-1.5 right-1.5 bg-brand-surface-high border border-brand-border rounded-xl p-2.5 flex flex-col justify-start gap-1 z-10 opacity-80 group hover:opacity-100 transition-all cursor-pointer border-dashed"
                        >
                          <span className="block font-semibold text-brand-text-muted text-[10px] uppercase font-bold tracking-wide line-clamp-1">
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

      {/* FOOTER INTERACTIVE DETAILS DRAWER / POPOVER DECORATOR */}
      {selectedDetails && (
        <>
          {/* Backdrop trên mobile */}
          <div
            className="fixed inset-0 z-40 md:hidden bg-black/30 backdrop-blur-xs"
            onClick={() => setSelectedDetails(null)}
          />
          <div className="z-50 bg-brand-surface border border-brand-border shadow-2xl flex flex-col gap-3 relative animate-fade-in fixed bottom-0 left-0 right-0 rounded-t-2xl p-5 md:absolute md:bottom-auto md:left-auto md:right-6 md:top-6 md:w-[320px] md:rounded-2xl md:p-4 pb-12 md:pb-4">
            {/* Handle bar cho bottom sheet */}
            <div className="w-10 h-1 bg-brand-surface-highest rounded-full mx-auto mb-1 md:hidden" />
            
            <button 
              onClick={() => setSelectedDetails(null)} 
              className="absolute top-3 right-3 text-brand-on-surface-variant hover:text-brand-text p-1 rounded-lg cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <span
                style={{ backgroundColor: selectedDetails.color || "#4e4455" }}
                className="w-3.5 h-3.5 rounded-full"
              />
              <h3 className="font-bold text-base text-brand-text">
                {selectedDetails.title}
              </h3>
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
                    <span className="text-xs font-semibold text-brand-text">
                      {selectedDetails.room}
                    </span>
                  </div>
                </div>
              )}

              {selectedDetails.teacher && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-tertiary shrink-0" />
                  <div>
                    <span className="block text-[10px] text-brand-on-surface-variant uppercase">Giảng viên</span>
                    <span className="text-xs font-semibold text-brand-text">
                      {selectedDetails.teacher}
                    </span>
                  </div>
                </div>
              )}

              {selectedDetails.registrationDeadline && (() => {
                const badge = getDeadlineStatusStyles(selectedDetails.registrationDeadline);
                return (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#ffb95f] shrink-0 animate-bounce-slow" />
                    <div>
                      <span className="block text-[10px] text-brand-on-surface-variant uppercase">Hạn đăng ký</span>
                      <span className="text-xs font-semibold text-brand-text flex items-center gap-1 flex-wrap">
                        {selectedDetails.registrationDeadline}
                        {badge && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${badge.className.replace("animate-pulse", "")}`}>
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

// Help helper icon component
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
