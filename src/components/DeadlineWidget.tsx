import React, { useState, useEffect, useRef } from "react";
import { Bell, Trash2, Calendar, AlertCircle, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RegistrationDeadline, DeadlineStatus, CountdownState } from "../types";

interface DeadlineWidgetProps {
  deadline: RegistrationDeadline | null;
  onAdd: (d: RegistrationDeadline) => void;
  onRemove: () => void;
}

/**
 * Helper to compute status and time remaining details
 */
const calculateCountdown = (
  deadlineTime: Date,
  createdAtTime: Date
): CountdownState => {
  const now = new Date();
  const totalMs = deadlineTime.getTime() - createdAtTime.getTime();
  const remainingMs = deadlineTime.getTime() - now.getTime();

  if (remainingMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      status: "expired",
      percentageRemaining: 0,
    };
  }

  const seconds = Math.floor((remainingMs / 1000) % 60);
  const minutes = Math.floor((remainingMs / 1000 / 60) % 60);
  const hours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));

  const totalHoursRemaining = remainingMs / (1000 * 60 * 60);
  let status: DeadlineStatus = "upcoming";

  if (totalHoursRemaining <= 24) {
    status = "critical";
  } else if (totalHoursRemaining <= 48) {
    status = "warning";
  }

  // Calculate percentage remaining
  const percentageRemaining = totalMs > 0
    ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100))
    : 0;

  return {
    days,
    hours,
    minutes,
    seconds,
    status,
    percentageRemaining,
  };
};

/**
 * Component representing flip card for digit display
 */
const FlipCard: React.FC<{ value: number; label: string; status: DeadlineStatus }> = ({
  value,
  label,
  status,
}) => {
  const formattedValue = value.toString().padStart(2, "0");

  const statusColors: Record<DeadlineStatus, string> = {
    upcoming: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400 dark:text-emerald-300",
    warning: "border-yellow-500/30 bg-yellow-950/20 text-yellow-400 dark:text-yellow-300",
    critical: "border-red-500/40 bg-red-950/30 text-red-400 dark:text-red-300 shadow-lg shadow-red-500/10",
    expired: "border-brand-border bg-brand-surface-low text-brand-on-surface-variant",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-14 h-16 md:w-16 md:h-18 rounded-xl border flex flex-col justify-center items-center relative overflow-hidden backdrop-blur-md transition-all duration-300 ${statusColors[status]}`}
      >
        {/* Subtle Horizontal Separation Line to resemble mechanical Flip design */}
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-brand-border/20 z-10" />

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={formattedValue}
            initial={{ y: 15, opacity: 0, rotateX: -60 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: -15, opacity: 0, rotateX: 60 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="text-2xl md:text-3xl font-extrabold tracking-tight font-mono select-none"
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-on-surface-variant/80">
        {label}
      </span>
    </div>
  );
};

export const DeadlineWidget: React.FC<DeadlineWidgetProps> = ({
  deadline,
  onAdd,
  onRemove,
}) => {
  // Add state inputs
  const [semesterName, setSemesterName] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");

  const [countdown, setCountdown] = useState<CountdownState | null>(null);
  const notifiedRef = useRef<{ [key: string]: boolean }>({});

  const isCritical = countdown?.status === "critical";

  const selectPreset = (sem: string, daysOffset: number) => {
    const targetDate = new Date();
    targetDate.setTime(targetDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    
    // Format into YYYY-MM-DDTHH:MM for datetime-local input safely using local timezone
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");
    const hours = String(targetDate.getHours()).padStart(2, "0");
    const minutes = String(targetDate.getMinutes()).padStart(2, "0");
    
    setSemesterName(sem);
    setDeadlineDate(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  // Request browser notification permission
  const checkAndRequestNotificationPermission = async () => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  };

  // Convert inputs to registration deadline
  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semesterName.trim() || !deadlineDate) return;

    // Trigger Permission request upon user click
    checkAndRequestNotificationPermission();

    const targetDate = new Date(deadlineDate);
    const newDeadline: RegistrationDeadline = {
      id: crypto.randomUUID(),
      semesterName: semesterName.trim(),
      deadline: targetDate.toISOString(),
      createdAt: new Date().toISOString(),
      notificationSent: {},
    };

    onAdd(newDeadline);
    setSemesterName("");
    setDeadlineDate("");
  };

  // Update real-time countdown
  useEffect(() => {
    if (!deadline) {
      setCountdown(null);
      return;
    }

    const dTime = new Date(deadline.deadline);
    const cTime = new Date(deadline.createdAt);

    // Initial tick calculation
    const initialCountdown = calculateCountdown(dTime, cTime);
    setCountdown(initialCountdown);

    const interval = setInterval(() => {
      const updated = calculateCountdown(dTime, cTime);
      setCountdown(updated);

      // Check milestones to send browser notification
      if (updated.status !== "expired") {
        const remainingMs = dTime.getTime() - new Date().getTime();
        const totalHoursRemaining = remainingMs / (1000 * 60 * 60);

        // Define warning thresholds to trigger notification
        const milestones = [
          { hours: 24, label: "24 giờ" },
          { hours: 6, label: "6 giờ" },
          { hours: 1, label: "1 giờ" },
        ];

        milestones.forEach(({ hours, label }) => {
          // If remaining time is less than milestone hours but within safe boundaries (near milestone)
          if (totalHoursRemaining <= hours && totalHoursRemaining > hours - 0.1) {
            const milestoneKey = `${deadline.id}-${hours}`;
            if (!notifiedRef.current[milestoneKey]) {
              notifiedRef.current[milestoneKey] = true;
              triggerOSNotification(deadline.semesterName, label);
            }
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  // Function to serve native notification
  const triggerOSNotification = (semName: string, timeLabel: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🚨 Sắp Hết Hạn Đăng Ký Học Phần!", {
        body: `Thời hạn đăng ký học phần cho ${semName} chỉ còn chưa đầy ${timeLabel}! Hãy tối ưu lịch học ngay bây giờ.`,
        icon: "/favicon.ico",
      });
    }
  };

  // Color mappings for progress bar
  const getProgressBarColor = (status: DeadlineStatus) => {
    switch (status) {
      case "upcoming":
        return "bg-gradient-to-r from-emerald-500 to-teal-400";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-yellow-400";
      case "critical":
        return "bg-gradient-to-r from-red-600 to-pink-500 animate-pulse";
      default:
        return "bg-brand-surface-highest";
    }
  };

  const getStatusBadgeStyle = (status: DeadlineStatus) => {
    switch (status) {
      case "upcoming":
        return "text-emerald-400 bg-emerald-950/45 border-emerald-500/20";
      case "warning":
        return "text-yellow-400 bg-yellow-950/45 border-yellow-500/20";
      case "critical":
        return "text-red-400 bg-red-950/45 border-red-500/30 animate-pulse-slow";
      default:
        return "text-brand-on-surface-variant bg-brand-surface-medium border-brand-border";
    }
  };

  const getStatusText = (status: DeadlineStatus) => {
    switch (status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "warning":
        return "Cần chú ý";
      case "critical":
        return "GẤP! SẮP HẾT HẠN";
      default:
        return "Đã hết hạn";
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Mode 1: No Deadline Set - Display Creation Form */}
      {!deadline && (
        <form onSubmit={handleCreateDeadline} className="flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-primary animate-bounce-slow" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text">
              Hạn đăng ký học phần
            </h3>
          </div>
          <p className="text-[11px] text-brand-on-surface-variant/90 leading-normal">
            Đặt mốc thời gian đăng ký tín chỉ của trường để hiển thị đồng hồ đếm ngược và nhận thông báo nhắc nhở khi sắp đến hạn.
          </p>

          {/* Quick Preset Selection Buttons */}
          <div className="flex flex-col gap-1.5 bg-brand-surface-medium/30 p-2.5 rounded-xl border border-brand-border/40">
            <span className="text-[9px] uppercase font-bold tracking-wider text-brand-on-surface-variant/90">
              Chọn nhanh hạn đăng ký mẫu (Cho Test):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => selectPreset("Học kỳ Hè (Sắp hết hạn!)", (1.5 / 24))} // 1.5 hours offset
                className="text-[10px] font-semibold py-1.5 px-2 bg-brand-surface-high hover:bg-brand-primary hover:text-brand-on-primary border border-brand-border/60 rounded-lg text-amber-300 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-1"
              >
                <span>⏳</span>
                <span className="truncate">Chỉ còn 1.5 giờ</span>
              </button>
              <button
                type="button"
                onClick={() => selectPreset("Học kỳ 2 năm học 2025-2026", 3)} // 3 days offset
                className="text-[10px] font-semibold py-1.5 px-2 bg-brand-surface-high hover:bg-brand-primary hover:text-brand-on-primary border border-brand-border/60 rounded-lg text-emerald-300 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-1"
              >
                <span>⚡</span>
                <span className="truncate">Sắp hết hạn: 3 ngày</span>
              </button>
              <button
                type="button"
                onClick={() => selectPreset("Học kỳ 1 năm học 2026-2027", 15)} // 15 days offset
                className="text-[10px] font-semibold py-1.5 px-2 bg-brand-surface-high hover:bg-brand-primary hover:text-brand-on-primary border border-brand-border/60 rounded-lg text-brand-primary cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-1"
              >
                <span>🍃</span>
                <span className="truncate">Còn xa: 15 ngày</span>
              </button>
              <button
                type="button"
                onClick={() => selectPreset("Kỳ đăng ký bổ sung lớp CLC", -0.5)} // 12 hours in the past
                className="text-[10px] font-semibold py-1.5 px-2 bg-brand-surface-high hover:bg-brand-primary hover:text-brand-on-primary border border-brand-border/60 rounded-lg text-red-400 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-1"
              >
                <span>🔒</span>
                <span className="truncate">Đã quá hạn</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-brand-on-surface-variant/90 font-bold uppercase tracking-wider">
                Học kỳ
              </label>
              <input
                type="text"
                required
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                placeholder="Ví dụ: HK1 2025-2026"
                className="bg-brand-surface-low border border-brand-border/60 rounded-xl px-3 py-2 text-xs text-brand-text placeholder-brand-on-surface-variant/50 focus:outline-none focus:border-brand-primary/50 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-brand-on-surface-variant/90 font-bold uppercase tracking-wider">
                Thời điểm đóng cổng
              </label>
              <input
                type="datetime-local"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="bg-brand-surface-low border border-brand-border/60 rounded-xl px-3 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-primary/50 transition placeholder-brand-on-surface-variant/50 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-1 bg-brand-primary hover:bg-brand-primary/95 text-brand-on-primary py-2.5 rounded-xl font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Bell className="w-3.5 h-3.5" />
            Kích hoạt nhắc nhở đăng ký
          </button>
        </form>
      )}

      {/* Mode 2: Deadline has been activated - Show countdown clock */}
      {deadline && countdown && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-tertiary" />
                Thời gian đăng ký học phần
              </span>
              <h4 className="text-sm font-bold text-brand-text">
                {deadline.semesterName}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                  countdown.status
                )}`}
              >
                {getStatusText(countdown.status)}
              </span>

              <button
                onClick={onRemove}
                title="Hủy bỏ nhắc nhở"
                className="bg-brand-surface-high hover:bg-red-500/10 hover:text-red-400 text-brand-on-surface-variant p-1.5 rounded-lg border border-brand-border/60 transition cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Flip countdown display */}
          <div className="flex justify-around items-center pt-1 px-2">
            <FlipCard value={countdown.days} label="Ngày" status={countdown.status} />
            <span className="text-xl md:text-2xl font-bold text-brand-border/60 -mt-4">:</span>
            <FlipCard value={countdown.hours} label="Giờ" status={countdown.status} />
            <span className="text-xl md:text-2xl font-bold text-brand-border/60 -mt-4">:</span>
            <FlipCard value={countdown.minutes} label="Phút" status={countdown.status} />
            <span className="text-xl md:text-2xl font-bold text-brand-border/60 -mt-4">:</span>
            <FlipCard value={countdown.seconds} label="Giây" status={countdown.status} />
          </div>

          {/* Progress gauge and precise deadline timestamp */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center text-[10px] text-brand-on-surface-variant/80">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-primary" />
                Hạn chót: {new Date(deadline.deadline).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
              <span>Con lại {Math.round(countdown.percentageRemaining)}%</span>
            </div>

            {/* Glowing or pulsing slider track */}
            <div className="bg-brand-surface-highest/40 h-2.5 rounded-full overflow-hidden border border-brand-border/40 p-[2px]">
              <div
                style={{ width: `${countdown.percentageRemaining}%` }}
                className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(
                  countdown.status
                )}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
