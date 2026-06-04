import { useState, useEffect } from "react";
import { 
  RefreshCw, Settings, User, Sliders, Calendar, BarChart2, Download, Check, Info, X
} from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { CalendarGrid } from "./components/CalendarGrid";
import { AnalyticsTab } from "./components/AnalyticsTab";
import { ExportTab } from "./components/ExportTab";
import { DEFAULT_PRESET } from "./presets";
import { BusyActivity, Subject, ClassOption, TimetableSolution, UniversityPreset } from "./types";

export default function App() {
  // Application Data States
  const [busyActivities, setBusyActivities] = useState<BusyActivity[]>(() => {
    // Try to load from localStorage first, else use default preset
    const saved = localStorage.getItem("studygrid_busy");
    return saved ? JSON.parse(saved) : DEFAULT_PRESET.busyActivities;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem("studygrid_subjects");
    return saved ? JSON.parse(saved) : DEFAULT_PRESET.subjects;
  });

  // Navigation Panel State
  const [selectedTab, setSelectedTab] = useState<"Timetable" | "Analytics" | "Export">("Timetable");

  // Solver States
  const [solutions, setSolutions] = useState<TimetableSolution[]>([]);
  const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);

  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Persist local state edits instantly
  useEffect(() => {
    localStorage.setItem("studygrid_busy", JSON.stringify(busyActivities));
  }, [busyActivities]);

  useEffect(() => {
    localStorage.setItem("studygrid_subjects", JSON.stringify(subjects));
  }, [subjects]);

  // Backtracking Timetable Solver Engine
  const solveTimetable = () => {
    // Identify subjects with classes added
    const activeSubjects = subjects.filter((s) => s.classes.length > 0);
    
    if (activeSubjects.length === 0) {
      setSolutions([]);
      setCurrentSolutionIndex(0);
      return;
    }

    const tempSolutions: TimetableSolution[] = [];

    // Overlap checker utility
    // Evaluates two slots starting at S1 and S2 covering D1 and D2 durations of the same Day
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

    // Recursive search DFS finder
    const dfsSearch = (subjectIndex: number, currentClasses: any[]) => {
      // Base case: we picked a class option for every active subject successfully
      if (subjectIndex === activeSubjects.length) {
        tempSolutions.push({ classes: [...currentClasses] });
        return;
      }

      const subj = activeSubjects[subjectIndex];

      // Outer loop through all class choices of current subject
      for (const cls of subj.classes) {
        let isConflicting = false;

        // 1. Check conflicts with previous chosen classes in this path
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

        if (isConflicting) continue; // Prune branch

        // 2. Check conflicts with fixed busy activities
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
            isConflicting = true;
            break;
          }
        }

        if (isConflicting) continue; // Prune branch

        // Recurse down the search tree
        currentClasses.push({
          subjectId: subj.id,
          subjectName: subj.name,
          color: subj.color,
          classOption: cls,
        });

        dfsSearch(subjectIndex + 1, currentClasses);

        // Backtrack
        currentClasses.pop();
      }
    };

    dfsSearch(0, []);

    setSolutions(tempSolutions);
    setCurrentSolutionIndex(0);
  };

  // Re-run the timetable calculation engine automatically upon changes for frictionless usability
  useEffect(() => {
    solveTimetable();
  }, [subjects, busyActivities]);

  // Clean wipe data helper
  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả lịch bận và môn học để làm mới hoàn toàn?")) {
      setBusyActivities([]);
      setSubjects([]);
      setSolutions([]);
      setCurrentSolutionIndex(0);
    }
  };

  // Preset quick load driver
  const handleLoadPreset = (preset: UniversityPreset) => {
    setBusyActivities(preset.busyActivities);
    setSubjects(preset.subjects);
    // Solves automatically in next render loop via useEffect hooks!
  };

  const forceCalculate = () => {
    solveTimetable();
    alert("Bộ lọc đã được tính toán lại thành công!");
  };

  return (
    <div className="bg-brand-bg text-[#e8dfee] font-sans overflow-hidden h-screen flex flex-col relative select-none">
      
      {/* TOP HEADER NAVIGATION BAR */}
      <header className="bg-brand-bg/60 backdrop-blur-xl border-b border-[#4a4455]/15 flex justify-between items-center px-6 w-full h-16 shrink-0 z-40 select-none">
        
        {/* LOGO & DESKTOP NAVIGATION SCHEME */}
        <div className="flex items-center gap-4">
          <div className="font-sans font-bold text-lg md:text-xl text-brand-primary tracking-tight select-none flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-primary animate-pulse" />
            StudyGrid
          </div>
          
          <nav className="hidden md:flex gap-6 ml-8 select-none text-xs font-semibold">
            <button
              onClick={() => setSelectedTab("Timetable")}
              className={`pb-1 transition-all border-b-2 cursor-pointer ${
                selectedTab === "Timetable"
                  ? "text-brand-primary border-brand-primary font-bold"
                  : "text-brand-on-surface-variant hover:text-brand-primary border-transparent"
              }`}
            >
              Lịch biểu (Grid)
            </button>
            <button
              onClick={() => setSelectedTab("Analytics")}
              className={`pb-1 transition-all border-b-2 cursor-pointer ${
                selectedTab === "Analytics"
                  ? "text-brand-primary border-brand-primary font-bold"
                  : "text-brand-on-surface-variant hover:text-brand-primary border-transparent"
              }`}
            >
              Phân tích (Analytics)
            </button>
            <button
              onClick={() => setSelectedTab("Export")}
              className={`pb-1 transition-all border-b-2 cursor-pointer ${
                selectedTab === "Export"
                  ? "text-brand-primary border-brand-primary font-bold"
                  : "text-brand-on-surface-variant hover:text-brand-primary border-transparent"
              }`}
            >
              Đồng bộ &amp; Xuất (.ICS)
            </button>
          </nav>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
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
        
        {/* SIDEBAR FOR INPUTS */}
        <Sidebar
          busyActivities={busyActivities}
          setBusyActivities={setBusyActivities}
          subjects={subjects}
          setSubjects={setSubjects}
          onGenerate={forceCalculate}
          loadPreset={handleLoadPreset}
        />

        {/* WORKSPACE AREA */}
        <section className="flex-1 flex flex-col overflow-hidden">
          {selectedTab === "Timetable" && (
            <CalendarGrid
              solutions={solutions}
              currentSolutionIndex={currentSolutionIndex}
              setCurrentSolutionIndex={setCurrentSolutionIndex}
              busyActivities={busyActivities}
              onReset={handleReset}
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
            />
          )}
        </section>

      </main>

      {/* MOBILE BOTTOM NAVIGATION TRACK */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 bg-brand-surface-highest/80 backdrop-blur-lg border-t border-[#4a4455]/20 md:hidden">
        <button
          onClick={() => setSelectedTab("Timetable")}
          className={`flex flex-col items-center justify-center scale-90 active:scale-100 transition-transform flex-1 h-full ${
            selectedTab === "Timetable" ? "text-brand-primary font-bold" : "text-brand-on-surface-variant"
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Lịch Biểu</span>
        </button>
        <button
          onClick={() => setSelectedTab("Analytics")}
          className={`flex flex-col items-center justify-center scale-90 active:scale-100 transition-transform flex-1 h-full ${
            selectedTab === "Analytics" ? "text-brand-primary font-bold" : "text-brand-on-surface-variant"
          }`}
        >
          <BarChart2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Phân Tích</span>
        </button>
        <button
          onClick={() => setSelectedTab("Export")}
          className={`flex flex-col items-center justify-center scale-90 active:scale-100 transition-transform flex-1 h-full ${
            selectedTab === "Export" ? "text-brand-primary font-bold" : "text-brand-on-surface-variant"
          }`}
        >
          <Download className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Đồng Bộ</span>
        </button>
      </nav>

      {/* INSTRUCTIONAL SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-[#100d16]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface p-6 rounded-2xl border border-[#4a4455]/40 max-w-lg w-full flex flex-col gap-4 relative animate-fade-in shadow-2xl select-text">
            <button
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 p-1 text-brand-on-surface-variant hover:text-[#e8dfee] rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-brand-primary flex items-center gap-2">
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
                  <strong className="text-brand-tertiary">Tránh trùng chập:</strong> Loại bỏ lập tức các nhánh có chứa lớp bị trùng giờ học với nhau, HOẶC trùng giờ với lịch cá nhân cố định (như đi làm thêm, lớp ngoại ngữ tự do).
                </li>
              </ol>

              <div className="bg-brand-primary/5 p-3 rounded-xl border border-brand-primary/20 flex flex-col gap-1 mt-2">
                <span className="font-bold text-brand-primary">💡 Lời khuyên tối ưu lịch:</span>
                <span>Nên thêm ít nhất 2 phương án lớp học phần (Ví dụ: Lớp 01 thứ 2 và Lớp 02 thứ 3) cho mỗi môn học để gia tăng số lượng phương án thành công tìm được!</span>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="mt-2 bg-brand-primary text-brand-on-primary py-2.5 rounded-xl font-bold text-xs transition duration-200 hover:brightness-105"
            >
              Đồng ý, Đóng hướng dẫn
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
