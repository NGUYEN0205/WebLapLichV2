import { useState, useEffect, useRef } from "react";
import { 
  RefreshCw, Settings, User, Sliders, Calendar, BarChart2, Download, Check, Info, X, AlertCircle, Sun, Moon, Menu
} from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { CalendarGrid } from "./components/CalendarGrid";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { ExportTab } from "./components/ExportTab";
import { DEFAULT_PRESET } from "./presets";
import { BusyActivity, Subject, ClassOption, TimetableSolution, UniversityPreset, PinConflictWarning, RegistrationDeadline, SavedPlan } from "./types";

// Hàm so sánh hai phương án thời khóa biểu xem có trùng khớp hoàn toàn hay không
const areSolutionsEqual = (sol1: TimetableSolution, sol2: TimetableSolution): boolean => {
  if (sol1.classes.length !== sol2.classes.length) return false;
  const ids1 = sol1.classes.map(c => c.classOption.id).sort();
  const ids2 = sol2.classes.map(c => c.classOption.id).sort();
  return ids1.every((id, idx) => id === ids2[idx]);
};

export default function App() {
  // Application Data States
  const [busyActivities, setBusyActivities] = useState<BusyActivity[]>(() => {
    const saved = localStorage.getItem("studygrid_busy");
    return saved ? JSON.parse(saved) : DEFAULT_PRESET.busyActivities;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("studygrid_subjects");
    let loadedSubjects = saved ? JSON.parse(saved) : DEFAULT_PRESET.subjects;
    
    let hasMigrated = false;
    loadedSubjects = loadedSubjects.map((s: Subject) => {
      const updatedClasses = s.classes.map((c: ClassOption) => {
        if (!c.registrationDeadline) {
          hasMigrated = true;
          if (s.name.toLowerCase().includes("toán")) {
            return { ...c, registrationDeadline: "15 - 06 - 2026" };
          } else if (s.name.toLowerCase().includes("vật lý")) {
            return { ...c, registrationDeadline: "18 - 06 - 2026" };
          } else if (s.name.toLowerCase().includes("lập trình")) {
            return { ...c, registrationDeadline: "20 - 06 - 2026" };
          } else {
            return { ...c, registrationDeadline: "25 - 06 - 2026" };
          }
        }
        return c;
      });
      return { ...s, classes: updatedClasses };
    });

    if (hasMigrated && saved) {
      localStorage.setItem("studygrid_subjects", JSON.stringify(loadedSubjects));
    }
    return loadedSubjects;
  });

  // Navigation Panel State
  const [selectedTab, setSelectedTab] = useState<"Timetable" | "Analytics" | "Export">("Timetable");

  // Solver States
  const [solutions, setSolutions] = useState<TimetableSolution[]>([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);

  // Chế độ xem lịch: "calculated" (Các phương án thuật toán tính) hoặc "saved" (Các bản nháp đã lưu)
  const [viewMode, setViewMode] = useState<"calculated" | "saved">("calculated");
  const [selectedSavedPlanIndex, setSelectedSavedPlanIndex] = useState(0);
  const [pendingSolutionToMatch, setPendingSolutionToMatch] = useState<TimetableSolution | null>(null);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Mobile Sidebar Drawer State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme Toggle State
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("studygrid_theme");
    return saved === "light" ? "light" : "dark";
  });

  // US-16: Registration Deadline state and notification scheduler
  const [registrationDeadline, setRegistrationDeadline] = useState<RegistrationDeadline | null>(() => {
    const saved = localStorage.getItem("studygrid_deadline");
    try {
      return saved ? JSON.parse(saved, (k, v) => {
        if (k === "deadline" || k === "createdAt") return new Date(v);
        return v;
      }) : null;
    } catch {
      return null;
    }
  });

  // US-10: Saved Plans state
  const MAX_SAVED_PLANS = 5;
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    try {
      const saved = localStorage.getItem("studygrid_saved_plans");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const notificationTimeoutsRef = useRef<number[]>([]);

  const cancelExistingNotifications = () => {
    notificationTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    notificationTimeoutsRef.current = [];
  };

  const scheduleNotifications = (dl: RegistrationDeadline) => {
    cancelExistingNotifications();

    const dTime = new Date(dl.deadline).getTime();
    const now = Date.now();

    const milestones = [
      { hours: 24, label: "24 giờ" },
      { hours: 6, label: "6 giờ" },
      { hours: 1, label: "1 giờ" },
    ];

    milestones.forEach(({ hours, label }) => {
      const triggerTime = dTime - (hours * 60 * 60 * 1000);
      const delay = triggerTime - now;

      if (delay > 0) {
        const timeoutId = window.setTimeout(() => {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("🚨 Sắp Hết Hạn Đăng Ký Học Phần!", {
              body: `Thời hạn đăng ký học phần cho ${dl.semesterName} chỉ còn chưa đầy ${label}! Hãy tối ưu lịch học ngay bây giờ.`,
              icon: "/favicon.ico",
            });
          }
        }, delay);
        notificationTimeoutsRef.current.push(timeoutId);
      }
    });
  };

  const handleDeadlineAdd = (newDeadline: RegistrationDeadline) => {
    setRegistrationDeadline(newDeadline);
    localStorage.setItem("studygrid_deadline", JSON.stringify(newDeadline));
    scheduleNotifications(newDeadline);
  };

  const handleDeadlineRemove = () => {
    setRegistrationDeadline(null);
    localStorage.removeItem("studygrid_deadline");
    cancelExistingNotifications();
  };

  const handleImportDeadline = (dl: RegistrationDeadline | null) => {
    if (dl) {
      setRegistrationDeadline(dl);
      localStorage.setItem("studygrid_deadline", JSON.stringify(dl));
      scheduleNotifications(dl);
    } else {
      setRegistrationDeadline(null);
      localStorage.removeItem("studygrid_deadline");
      cancelExistingNotifications();
    }
  };

  // US-10: SavedPlan handlers
  const handleSavePlan = (name: string) => {
    const currentSolution = solutions[currentSolutionIndex];
    if (!currentSolution) return;
    const newPlan: SavedPlan = {
      id: `plan-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      subjects: JSON.parse(JSON.stringify(subjects)),
      busyActivities: JSON.parse(JSON.stringify(busyActivities)),
      solution: JSON.parse(JSON.stringify(currentSolution)),
      solutionIndex: currentSolutionIndex,
      totalSubjects: currentSolution.classes.length,
    };
    const updated = [...savedPlans, newPlan];
    setSavedPlans(updated);
    localStorage.setItem("studygrid_saved_plans", JSON.stringify(updated));
    
    // Tự động chuyển tiêu điểm đến bản nháp vừa tạo
    setSelectedSavedPlanIndex(updated.length - 1);
  };

  const handleDeleteSavedPlan = (id: string) => {
    const updated = savedPlans.filter((p) => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem("studygrid_saved_plans", JSON.stringify(updated));
    if (selectedSavedPlanIndex >= updated.length && updated.length > 0) {
      setSelectedSavedPlanIndex(updated.length - 1);
    }
  };

  const handleLoadSavedPlan = (plan: SavedPlan) => {
    const planIdx = savedPlans.findIndex((p) => p.id === plan.id);
    if (planIdx !== -1) {
      setSelectedSavedPlanIndex(planIdx);
    }
    
    // Tải thông tin cấu hình của bản nháp lên giao diện nhập liệu
    setSubjects(plan.subjects);
    setBusyActivities(plan.busyActivities);
    
    // Đánh dấu phương án cần khớp để tránh thuật toán ghi đè khi render lại
    setPendingSolutionToMatch(plan.solution);
    setViewMode("saved");
    setSelectedTab("Timetable");
  };

  useEffect(() => {
    if (registrationDeadline) {
      scheduleNotifications(registrationDeadline);
    }
    return () => {
      cancelExistingNotifications();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.remove("light");
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("studygrid_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("studygrid_busy", JSON.stringify(busyActivities));
  }, [busyActivities]);

  useEffect(() => {
    localStorage.setItem("studygrid_subjects", JSON.stringify(subjects));
  }, [subjects]);

  const checkOverlap = (
    day1: number,
    start1: number,
    dur1: number,
    day2: number,
    start2: number,
    dur2: number
  ): boolean => {
    if (day1 !== day2) return false;
    return start1 < start2 + dur2 && start2 < start1 + dur1;
  };

  // Thuật toán quay lui tính toán thời khóa biểu tối ưu
  const solveTimetable = (targetSolutionToMatch?: TimetableSolution | null) => {
    const activeSubjects = subjects.filter((s) => s.classes.length > 0);
    
    if (activeSubjects.length === 0) {
      setSolutions([]);
      setCurrentSolutionIndex(0);
      return;
    }

    const tempSolutions: TimetableSolution[] = [];

    const dfsSearch = (subjectIndex: number, currentClasses: any[]) => {
      if (subjectIndex === activeSubjects.length) {
        tempSolutions.push({ classes: [...currentClasses] });
        return;
      }

      const subj = activeSubjects[subjectIndex];
      const pinnedClasses = subj.classes.filter((c) => c.isPinned);
      const choices = pinnedClasses.length > 0 ? pinnedClasses : subj.classes;

      for (const cls of choices) {
        let isConflicting = false;

        for (const prev of currentClasses) {
          if (
            checkOverlap(
              cls.day,
              cls.startSlot,
              cls.duration,
              prev.classOption.day,
              prev.classOption.startSlot,
              prev.classOption.duration
            )
          ) {
            isConflicting = true;
            break;
          }
        }

        if (isConflicting) continue;

        let conflictsWithBusy = false;
        for (const busy of busyActivities) {
          if (
            checkOverlap(
              cls.day,
              cls.startSlot,
              cls.duration,
              busy.day,
              busy.startSlot,
              busy.duration
            )
          ) {
            conflictsWithBusy = true;
            break;
          }
        }

        if (conflictsWithBusy && !cls.isPinned) {
          isConflicting = true;
        }

        if (isConflicting) continue;

        currentClasses.push({
          subjectId: subj.id,
          subjectName: subj.name,
          color: subj.color,
          classOption: cls,
        });

        dfsSearch(subjectIndex + 1, currentClasses);
        currentClasses.pop();
      }
    };

    dfsSearch(0, []);

    setSolutions(tempSolutions);

    // Tìm kiếm và khớp vị trí nếu đang ở chế độ xem bản nháp đã lưu
    if (targetSolutionToMatch) {
      const matchIdx = tempSolutions.findIndex(sol => areSolutionsEqual(sol, targetSolutionToMatch));
      if (matchIdx !== -1) {
        setCurrentSolutionIndex(matchIdx);
        return;
      }
    }
    setCurrentSolutionIndex(0);
  };

  // Tự động chạy lại bộ lọc khi môn học hoặc lịch bận thay đổi
  useEffect(() => {
    // Nếu người dùng thao tác trực tiếp trên sidebar (không phải tải bản nháp), đưa chế độ xem về "calculated"
    if (!pendingSolutionToMatch) {
      setViewMode("calculated");
    }
    solveTimetable(pendingSolutionToMatch);
    setPendingSolutionToMatch(null);
  }, [subjects, busyActivities]);

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả lịch bận và môn học để làm mới hoàn toàn?")) {
      setBusyActivities([]);
      setSubjects([]);
      setSolutions([]);
      setCurrentSolutionIndex(0);
      setViewMode("calculated");
    }
  };

  const handleLoadPreset = (preset: UniversityPreset) => {
    setBusyActivities(preset.busyActivities);
    setSubjects(preset.subjects);
    setViewMode("calculated");
  };

  const forceCalculate = () => {
    solveTimetable();
    setViewMode("calculated");
    alert("Bộ lọc đã được tính toán lại thành công!");
  };

  const activeSolution = solutions[currentSolutionIndex] || null;
  const pinWarnings: PinConflictWarning[] = [];
  
  const getDayLabel = (d: number) => {
    if (d === 8) return "Chủ Nhật";
    return `Thứ ${d}`;
  };

  if (activeSolution) {
    activeSolution.classes.forEach((clsItem) => {
      const cls = clsItem.classOption;
      if (cls.isPinned) {
        const hasBusyConflict = busyActivities.some((busy) =>
          checkOverlap(cls.day, cls.startSlot, cls.duration, busy.day, busy.startSlot, busy.duration)
        );
        if (hasBusyConflict) {
          pinWarnings.push({
            sectionId: cls.id,
            courseName: clsItem.subjectName,
            day: cls.day,
            startPeriod: cls.startSlot,
            endPeriod: cls.startSlot + cls.duration - 1,
            detail: `Lớp bắt buộc "${cls.className}" của môn "${clsItem.subjectName}" trùng với lịch bận của bạn (${getDayLabel(cls.day)}: Tiết ${cls.startSlot}-${cls.startSlot + cls.duration - 1})`
          });
        }
      }
    });
  }

  return (
    <div className="bg-brand-bg text-brand-text font-sans overflow-hidden h-[100dvh] flex flex-col relative select-none">
      
      {/* TOP HEADER NAVIGATION BAR */}
      <header className="bg-brand-surface/80 backdrop-blur-xl border-b border-brand-border flex justify-between items-center px-6 w-full h-16 shrink-0 z-40 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all active:scale-95 cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="font-sans font-bold text-lg md:text-xl text-brand-primary tracking-tight select-none flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-primary animate-pulse" />
            StudyGrid
          </div>
          
          <nav className="hidden md:flex gap-2 ml-8 select-none">
            {[
              { id: "Timetable", label: "Lịch biểu (Grid)" },
              { id: "Analytics", label: "Phân tích (Analytics)" },
              { id: "Export", label: "Đồng bộ & Xuất (.ICS)" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTab === id
                    ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30"
                    : "text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary/10"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            className="p-2 text-brand-on-surface-variant hover:text-brand-primary transition rounded-lg hover:bg-white/5 cursor-pointer active:scale-95"
            title={theme === "light" ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng"}
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              solveTimetable();
              setSelectedTab("Timetable");
            }}
            className="p-2 text-brand-on-surface-variant hover:text-brand-primary transition rounded-lg hover:bg-white/5 cursor-pointer active:scale-95"
            title="Tính toán lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 text-brand-on-surface-variant hover:text-brand-primary transition rounded-lg hover:bg-white/5 cursor-pointer active:scale-95"
            title="Hướng dẫn thuật toán"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="h-9 w-9 rounded-full bg-brand-primary-container flex items-center justify-center text-brand-on-primary-container font-bold text-xs shadow">
            <User className="w-4 h-4 text-brand-primary" />
          </div>
        </div>
      </header>

      {/* VIEWPORT CONTROLLER */}
      <main className="flex flex-1 overflow-hidden relative">
        <Sidebar
          busyActivities={busyActivities}
          setBusyActivities={setBusyActivities}
          subjects={subjects}
          setSubjects={setSubjects}
          onGenerate={forceCalculate}
          loadPreset={handleLoadPreset}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          registrationDeadline={registrationDeadline}
          onAddDeadline={handleDeadlineAdd}
          onRemoveDeadline={handleDeadlineRemove}
        />

        <section className="flex-1 flex flex-col overflow-hidden ios-scroll">
          {selectedTab === "Timetable" && pinWarnings.length > 0 && (
            <div className="mx-6 mt-6 p-4 bg-red-950/45 border border-red-500/40 rounded-2xl space-y-1 shrink-0 shadow-lg relative z-20">
              <p className="text-xs md:text-sm font-bold text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                ⚠️ Cảnh báo lớp học bắt buộc bị trùng giờ với lịch bận cá nhân:
              </p>
              <div className="pl-6 flex flex-col gap-0.5">
                {pinWarnings.map((w) => (
                  <p key={w.sectionId} className="text-xs text-red-300">
                    • {w.detail}
                  </p>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "Timetable" && (
            <CalendarGrid
              solutions={solutions}
              currentSolutionIndex={currentSolutionIndex}
              setCurrentSolutionIndex={setCurrentSolutionIndex}
              busyActivities={busyActivities}
              onReset={handleReset}
              onSavePlan={handleSavePlan}
              savedPlansCount={savedPlans.length}
              maxSavedPlans={MAX_SAVED_PLANS}
              
              // Bổ sung các Props quản lý chuyển đổi bản nháp
              savedPlans={savedPlans}
              viewMode={viewMode}
              setViewMode={setViewMode}
              selectedSavedPlanIndex={selectedSavedPlanIndex}
              setSelectedSavedPlanIndex={setSelectedSavedPlanIndex}
              onLoadSavedPlan={handleLoadSavedPlan}
            />
          )}

          {selectedTab === "Analytics" && (
            <AnalyticsTab
              selectedSolution={solutions[currentSolutionIndex] || null}
              busyActivities={busyActivities}
            />
          )}

          
          {selectedTab === "Export" && (
            <ExportTab
              selectedSolution={solutions[currentSolutionIndex] || null}
              busyActivities={busyActivities}
              setBusyActivities={setBusyActivities}
              subjects={subjects}
              setSubjects={setSubjects}
              savedPlans={savedPlans}
              setSavedPlans={setSavedPlans}
              onDeleteSavedPlan={handleDeleteSavedPlan}
              onLoadSavedPlan={handleLoadSavedPlan}
              
              registrationDeadline={registrationDeadline}
              setRegistrationDeadline={handleImportDeadline} // <-- Cập nhật dòng này thành hàm an toàn mới
              
              viewMode={viewMode}
              setViewMode={setViewMode}
              theme={theme}
              setTheme={setTheme}
            />
          )}
        </section>
      </main>

      {/* MOBILE BOTTOM NAVIGATION TRACK */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center bottom-nav-safe bg-brand-surface/90 backdrop-blur-lg border-t border-brand-border md:hidden">
        <button
          onClick={() => {
            setSelectedTab("Timetable");
            setSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center scale-90 active:scale-100 transition-transform flex-1 h-full ${
            selectedTab === "Timetable" ? "text-brand-primary font-bold" : "text-brand-text-muted"
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Lịch Biểu</span>
        </button>
        <button
          onClick={() => {
            setSelectedTab("Analytics");
            setSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center scale-90 active:scale-100 transition-transform flex-1 h-full ${
            selectedTab === "Analytics" ? "text-brand-primary font-bold" : "text-brand-text-muted"
          }`}
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Phân Tích</span>
        </button>
        <button
          onClick={() => {
            setSelectedTab("Export");
            setSidebarOpen(false);
          }}
          className={`flex flex-col items-center justify-center scale-90 active:scale-100 transition-transform flex-1 h-full ${
            selectedTab === "Export" ? "text-brand-primary font-bold" : "text-brand-text-muted"
          }`}
        >
          <Download className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Đồng Bộ</span>
        </button>
      </nav>

      {/* INSTRUCTIONAL SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
          <div className="bg-brand-surface p-5 md:p-6 rounded-2xl border border-brand-border
             max-w-lg w-full flex flex-col gap-4 relative animate-fade-in shadow-2xl
             select-text my-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1 text-brand-on-surface-variant hover:text-brand-text rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base md:text-lg font-bold text-brand-primary flex items-center gap-2">
              <Info className="w-5 h-5" />
              Cách hoạt động của thuật toán xếp lịch
            </h3>

            <div className="text-xs text-brand-on-surface-variant flex flex-col gap-3 leading-relaxed">
              <p>
                <strong>StudyGrid</strong> sử dụng giải thuật <strong>Quay lui Backtracking (DFS)</strong> thông minh chạy ngay trên trình duyệt của bạn để tìm mọi phương án tối ưu:
              </p>
              
              <ol className="list-decimal pl-4 flex flex-col gap-2">
                <li>
                  <strong className="text-brand-primary">Lọc môn học:</strong> Ứng dụng tự động tìm các môn học hiện có ít nhất 1 lớp học phần được lập biểu.
                </li>
                <li>
                  <strong className="text-brand-secondary">Tìm tổ hợp:</strong> Thuật toán duyệt qua tích Đề-các (Cartesian Product) chọn chính xác 1 lớp từ mỗi môn học.
                </li>
                <li>
                  <strong className="text-brand-tertiary">Tránh trùng chập:</strong> Loại bỏ lập tức các nhánh có chứa lớp bị trùng giờ học với nhau, HOẶC trùng giờ với lịch cá nhân cố định.
                </li>
              </ol>

              <div className="bg-brand-primary/5 p-2.5 md:p-3 rounded-xl border border-brand-primary/20 flex flex-col gap-1 mt-2">
                <span className="font-bold text-brand-primary">💡 Lời khuyên tối ưu lịch:</span>
                <span>Nên thêm ít nhất 2 phương án lớp học phần cho mỗi môn học để gia tăng số lượng phương án thành công tìm được!</span>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="mt-2 bg-brand-primary text-brand-on-primary py-2 md:py-2.5 rounded-xl font-bold text-xs transition duration-200 hover:brightness-105"
            >
              Đồng ý, Đóng hướng dẫn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}