import React, { useState, useMemo, useRef } from "react";
import { 
  Download, Calendar, Copy, Check, FileCode, Info, Printer,
  BookmarkCheck, Trash2, FolderOpen, BookmarkX, AlertCircle, Sparkles, X, Sliders
} from "lucide-react";
import { TimetableSolution, BusyActivity, SavedPlan, Subject, RegistrationDeadline } from "../types";

interface ExportTabProps {
  selectedSolution: TimetableSolution | null;
  busyActivities: BusyActivity[];
  setBusyActivities: React.Dispatch<React.SetStateAction<BusyActivity[]>>;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  savedPlans: SavedPlan[];
  setSavedPlans: React.Dispatch<React.SetStateAction<SavedPlan[]>>;
  onDeleteSavedPlan: (id: string) => void;
  onLoadSavedPlan: (plan: SavedPlan) => void;
  registrationDeadline: RegistrationDeadline | null;
  setRegistrationDeadline: (dl: RegistrationDeadline | null) => void;
  viewMode: "calculated" | "saved";
  setViewMode: (mode: "calculated" | "saved") => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const DAYS_HEADER_MAP = [
  { label: "Thứ Hai", value: 2 },
  { label: "Thứ Ba", value: 3 },
  { label: "Thứ Tư", value: 4 },
  { label: "Thứ Năm", value: 5 },
  { label: "Thứ Sáu", value: 6 },
  { label: "Thứ Bảy", value: 7 },
  { label: "Chủ Nhật", value: 8 },
];

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

const slotHeight = 55;

const loadHtml2Canvas = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).html2canvas && !(window as any).html2canvas.proLoaded) {
      delete (window as any).html2canvas;
    }

    if ((window as any).html2canvas) {
      resolve((window as any).html2canvas);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.11/dist/html2canvas-pro.min.js";
    script.onload = () => {
      if ((window as any).html2canvas) {
        (window as any).html2canvas.proLoaded = true;
      }
      resolve((window as any).html2canvas);
    };
    script.onerror = () => reject(new Error("Không thể tải thư viện html2canvas-pro"));
    document.body.appendChild(script);
  });
};

const validateSchema = (data: any): boolean => {
  if (typeof data !== "object" || data === null) return false;
  
  if (data.schemaVersion && typeof data.schemaVersion === "number") {
    return Array.isArray(data.subjects) && Array.isArray(data.busyActivities);
  }
  
  if (Array.isArray(data.classes) && Array.isArray(data.busyActivities)) {
    return true;
  }
  
  return false;
};

const migrateState = (raw: any): any => {
  const migrated = { ...raw };
  
  if (!migrated.subjects && Array.isArray(migrated.classes)) {
    const reconstructedSubjects: Subject[] = [];
    migrated.classes.forEach((clsItem: any) => {
      let existingSubj = reconstructedSubjects.find(s => s.id === clsItem.subjectId);
      if (!existingSubj) {
        existingSubj = {
          id: clsItem.subjectId,
          name: clsItem.subjectName,
          color: clsItem.color || "rgba(124, 58, 237, 1)",
          classes: []
        };
        reconstructedSubjects.push(existingSubj);
      }
      if (!existingSubj.classes.some((o: any) => o.id === clsItem.classOption.id)) {
        existingSubj.classes.push(clsItem.classOption);
      }
    });
    migrated.subjects = reconstructedSubjects;
  }
  
  if (!Array.isArray(migrated.busyActivities)) migrated.busyActivities = [];
  if (!Array.isArray(migrated.subjects)) migrated.subjects = [];
  if (!Array.isArray(migrated.savedPlans)) migrated.savedPlans = [];
  if (migrated.theme !== "light" && migrated.theme !== "dark") {
    migrated.theme = "dark";
  }
  
  migrated.schemaVersion = 2;
  return migrated;
};

export const ExportTab: React.FC<ExportTabProps> = ({
  selectedSolution,
  busyActivities,
  setBusyActivities,
  subjects,
  setSubjects,
  savedPlans,
  setSavedPlans,
  onDeleteSavedPlan,
  onLoadSavedPlan,
  registrationDeadline,
  setRegistrationDeadline,
  viewMode,
  setViewMode,
  theme,
  setTheme,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fallbackImgUrl, setFallbackImgUrl] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const publishId = useMemo(() => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }, []);

  // Khai báo biến classes ở vị trí sớm nhất để các hàm phụ trợ gọi thành công
  const classes = selectedSolution?.classes || [];

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const processJsonFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      showToast("❌ File quá lớn. Vui lòng chọn file cấu hình hợp lệ.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (!validateSchema(parsed)) {
          showToast("❌ File không hợp lệ. Vui lòng chọn file JSON đúng định dạng.");
          return;
        }

        const migratedData = migrateState(parsed);

        setSubjects(migratedData.subjects);
        localStorage.setItem("studygrid_subjects", JSON.stringify(migratedData.subjects));

        setBusyActivities(migratedData.busyActivities);
        localStorage.setItem("studygrid_busy", JSON.stringify(migratedData.busyActivities));

        setSavedPlans(migratedData.savedPlans);
        localStorage.setItem("studygrid_saved_plans", JSON.stringify(migratedData.savedPlans));

        if (migratedData.registrationDeadline) {
          setRegistrationDeadline(migratedData.registrationDeadline);
        } else {
          setRegistrationDeadline(null);
        }

        if (migratedData.viewMode === "calculated" || migratedData.viewMode === "saved") {
          setViewMode(migratedData.viewMode);
        }

        if (migratedData.theme === "light" || migratedData.theme === "dark") {
          setTheme(migratedData.theme);
        }

        showToast("✓ Nhập dữ liệu thành công");
      } catch (err) {
        console.error("Lỗi biên dịch tệp JSON:", err);
        showToast("❌ File không hợp lệ. Vui lòng chọn file JSON đúng định dạng.");
      }
    };
    reader.onerror = () => {
      showToast("❌ Lỗi hệ thống khi đọc file.");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processJsonFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processJsonFile(file);
    }
  };

  const handleDownloadJSON = () => {
    const exportObj = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      subjects,
      busyActivities,
      registrationDeadline,
      savedPlans,
      viewMode,
      theme,
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `studygrid_backup_${publishId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("🎉 Xuất file sao lưu cấu hình JSON thành công!");
  };

  const copyBlobToClipboard = async (blob: Blob): Promise<boolean> => {
    try {
      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        return true;
      }
      return false;
    } catch (err) {
      console.warn("Clipboard API không được hỗ trợ hoặc bị chặn quyền:", err);
      return false;
    }
  };

  const handleCapture = async (mode: "download" | "copy") => {
    setIsCapturing(true);
    try {
      const html2canvas = await loadHtml2Canvas();
      const target = document.getElementById("studygrid-capture-target");
      if (!target) {
        throw new Error("Không tìm thấy vùng dữ liệu để kết xuất ảnh!");
      }

      await new Promise((resolve) => setTimeout(resolve, 250));

      const canvas = await html2canvas(target, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      if (mode === "download") {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "studygrid-tkb.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("🎉 Đã tải xuống file ảnh studygrid-tkb.png!");
      } else {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            throw new Error("Kết xuất blob ảnh thất bại!");
          }
          const success = await copyBlobToClipboard(blob);
          if (success) {
            showToast("📋 Đã sao chép! Ctrl+V để dán vào Zalo/Facebook");
          } else {
            const dataUrl = canvas.toDataURL("image/png");
            setFallbackImgUrl(dataUrl);
          }
        }, "image/png");
      }
    } catch (err) {
      console.error("Lỗi khi tạo ảnh thời khóa biểu:", err);
      showToast("❌ Không thể kết xuất ảnh do tương thích hệ thống.");
    } finally {
      setIsCapturing(false);
    }
  };

  const generateTextSummary = () => {
    let summary = `===== STUDYGRID - THỜI KHÓA BIỂU TỐI ƯU =====\n\n`;
    const DAYS_MAP: { [key: number]: string } = {
      2: "Thứ Hai", 3: "Thứ Ba", 4: "Thứ Tư", 5: "Thứ Năm", 6: "Thứ Sáu", 7: "Thứ Bảy", 8: "Chủ Nhật"
    };

    const sortedClasses = [...classes].sort((a, b) => {
      if (a.classOption.day !== b.classOption.day) {
        return a.classOption.day - b.classOption.day;
      }
      return a.classOption.startSlot - b.classOption.startSlot;
    });

    sortedClasses.forEach((item, idx) => {
      const o = item.classOption;
      summary += `${idx + 1}. Môn học: ${item.subjectName}\n`;
      summary += `   - Lớp: ${o.className}\n`;
      summary += `   - Thời gian: ${DAYS_MAP[o.day]} | Tiết ${o.startSlot} đến ${o.startSlot + o.duration - 1}\n`;
      if (o.room) summary += `   - Phòng học: ${o.room}\n`;
      if (o.teacher) summary += `   - Giảng viên: ${o.teacher}\n`;
      summary += `\n`;
    });

    if (busyActivities.length > 0) {
      summary += `===== LỊCH BẬN CÁ NHÂN CỐ ĐỊNH =====\n`;
      busyActivities.forEach((act, idx) => {
        summary += `${idx + 1}. Hoạt động: ${act.name}\n`;
        summary += `   - Thời gian: ${DAYS_MAP[act.day]} | Tiết ${act.startSlot} đến ${act.startSlot + act.duration - 1}\n\n`;
      });
    }

    summary += `Được tạo tự động bởi StudyGrid Planner.`;
    return summary;
  };

  const handleCopyText = () => {
    const text = generateTextSummary();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadICS = () => {
    const getIcsDateStr = (dayValue: number, startSlot: number, isEnd: boolean = false) => {
      const year = "2026";
      const month = "06";
      const dayOffset = dayValue - 2;
      const dayNum = 8 + dayOffset;
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;

      const timings: { [key: number]: { start: string, end: string } } = {
        1: { start: "070000", end: "074500" },
        2: { start: "075000", end: "083500" },
        3: { start: "090000", end: "094500" },
        4: { start: "095000", end: "103500" },
        5: { start: "105000", end: "113500" },
        6: { start: "123000", end: "131500" },
        7: { start: "132000", end: "140500" },
        8: { start: "142000", end: "150500" },
        9: { start: "153000", end: "161500" },
        10: { start: "162000", end: "170500" },
        11: { start: "171000", end: "175500" },
        12: { start: "181500", end: "190000" },
      };

      const slotTime = timings[startSlot] || { start: "070000", end: "080000" };
      return `${year}${month}${dayStr}T${isEnd ? slotTime.end : slotTime.start}`;
    };

    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//StudyGrid//Scheduling App//VN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n";

    classes.forEach((item) => {
      const o = item.classOption;
      const dtStart = getIcsDateStr(o.day, o.startSlot);
      const dtEnd = getIcsDateStr(o.day, o.startSlot + o.duration - 1, true);

      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `UID:${o.id}@studygrid.com\r\n`;
      icsContent += `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}\r\n`;
      icsContent += `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}\r\n`;
      icsContent += `SUMMARY:${item.subjectName} (${o.className})\r\n`;
      icsContent += `DESCRIPTION:Lớp học phần: ${o.className}\\n${o.teacher ? `Giảng viên: ${o.teacher}` : ""}\\nTạo tự động trên StudyGrid.\r\n`;
      if (o.room) icsContent += `LOCATION:${o.room}\r\n`;
      icsContent += "RRULE:FREQ=WEEKLY;COUNT=15\r\nEND:VEVENT\r\n";
    });

    busyActivities.forEach((act) => {
      const dtStart = getIcsDateStr(act.day, act.startSlot);
      const dtEnd = getIcsDateStr(act.day, act.startSlot + act.duration - 1, true);

      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `UID:busy-${act.id}@studygrid.com\r\n`;
      icsContent += `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}\r\n`;
      icsContent += `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}\r\n`;
      icsContent += `SUMMARY:[Lịch Bận] ${act.name}\r\nDESCRIPTION:Thời gian khóa cố định tránh xếp lịch học.\\nRRULE:FREQ=WEEKLY;COUNT=15\r\nEND:VEVENT\r\n`;
    });

    icsContent += "END:VCALENDAR\r\n";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "thoi_khoa_bieu_studygrid.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentTextSummary = generateTextSummary();
  
  const handlePrint = () => {
    window.print();
  };

  const isLightMode = document.documentElement.classList.contains("light");

  // Nếu selectedSolution chưa được khởi tạo, hiển thị thông báo hướng dẫn
  if (!selectedSolution) {
    return (
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center text-center bg-brand-bg/95">
        <div className="bg-brand-surface-medium border border-brand-border p-6 md:p-8 rounded-2xl md:rounded-3xl max-w-sm md:max-w-md shadow-2xl flex flex-col items-center gap-4">
          <Download className="w-12 h-12 md:w-16 md:h-16 text-brand-primary opacity-50" />
          <h2 className="text-lg md:text-xl font-bold text-brand-text">Chưa có dữ liệu xuất bản</h2>
          <p className="text-xs text-brand-on-surface-variant leading-relaxed">
            Vui lòng nhấn nút <strong className="text-brand-primary">"Tính toán tối ưu lịch học"</strong> ở góc thanh bên trái để tạo giải pháp thời khóa biểu trước khi sử dụng các tùy chọn xuất bản và đồng bộ hóa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-brand-bg/95 flex flex-col gap-4 md:gap-6 select-text pb-20 lg:pb-6 ios-scroll">
      
      {/* HEADER */}
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-brand-text flex items-center gap-2">
          <Download className="w-6 h-6 text-brand-primary" />
          Xuất Bản &amp; Đồng Bộ Hóa
        </h1>
        <p className="text-xs text-brand-on-surface-variant">
          Xuất dữ liệu thời khóa biểu đã tối ưu thành các định dạng tương thích để đồng bộ điện thoại, in ấn hoặc gửi cho bạn bè
        </p>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* EXPORT OPTIONS CONTROLS */}
        <div className="flex flex-col gap-5">
          
          {/* US-11: OPTION CHIA SẺ & TẢI ẢNH TKB PNG */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3 border border-brand-primary/25 bg-brand-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-primary-container/20 rounded-xl text-brand-primary shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-text">Xuất ảnh Thời khóa biểu (PNG)</h3>
                <p className="text-[11px] text-brand-on-surface-variant/80">Tải ảnh chất lượng cao hoặc sao chép nhanh vào clipboard</p>
              </div>
            </div>
            
            <p className="text-xs text-brand-on-surface-variant/90 leading-relaxed bg-brand-surface-low/30 p-2.5 rounded-xl border border-brand-border/20">
              Chụp và kết xuất lịch học thành một bức ảnh Full HD chuyên nghiệp, tích hợp sẵn watermark nguồn nhận dạng của hệ thống.
            </p>
  
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
              <button
                onClick={() => handleCapture("download")}
                className="bg-brand-primary text-brand-on-primary py-3 md:py-2.5 rounded-xl font-bold text-xs transition duration-200 hover:bg-brand-primary/95 flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-fade-in"
              >
                <Download className="w-4 h-4" />
                Tải ảnh TKB (.PNG)
              </button>
              <button
                onClick={() => handleCapture("copy")}
                className="bg-brand-surface-high hover:bg-brand-surface-highest text-brand-text py-3 md:py-2.5 rounded-xl font-bold text-xs border border-brand-border/60 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Copy className="w-4 h-4" />
                Sao chép hình ảnh
              </button>
            </div>
          </div>

          {/* US-14: BOX KÉO THẢ & CHỌN FILE ĐỂ IMPORT STATE CONFIGURATION */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3 border border-brand-secondary/25 bg-brand-secondary/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-secondary/15 rounded-xl text-brand-secondary shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-text">Nhập dữ liệu sao lưu (.JSON)</h3>
                <p className="text-[11px] text-brand-on-surface-variant/80">Kéo thả tệp sao lưu hoặc nhấp để khôi phục cấu hình</p>
              </div>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-all duration-200 select-none ${
                isDragging
                  ? "border-brand-secondary bg-brand-secondary/10 scale-[1.02]"
                  : "border-brand-border hover:border-brand-secondary/40 hover:bg-brand-surface-high/10"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-3 bg-brand-surface-low rounded-xl text-brand-on-surface-variant/80">
                <FileCode className="w-8 h-8 text-brand-secondary animate-bounce-slow" />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-text">Kéo thả file .json vào đây</p>
                <p className="text-[10px] text-brand-on-surface-variant/80 mt-1">hoặc nhấp chuột để tìm file trên thiết bị</p>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-brand-surface-high text-brand-text-muted border border-brand-border font-mono">
                Cấu trúc hỗ trợ: JSON (Dung lượng &lt; 2MB)
              </span>
            </div>
          </div>
          
          {/* OPTION 1: GOOGLE CALENDAR ICS */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-primary-container/20 rounded-xl text-brand-primary shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-text">Đồng bộ Google &amp; Apple Calendar</h3>
                <p className="text-[11px] text-brand-on-surface-variant/80">Tạo tệp iCalendar phù hợp tiêu chuẩn quốc tế</p>
              </div>
            </div>
            
            <p className="text-xs text-brand-on-surface-variant/90 leading-relaxed bg-brand-surface-low/30 p-2.5 rounded-xl border border-brand-border/20">
              Nhập trực tiếp thời khóa biểu này vào các ứng dụng lịch phổ biến. Lịch sẽ được tự động lặp lại hàng tuần trong kỳ học (15 tuần liên tục).
            </p>
  
            <button
              onClick={handleDownloadICS}
              className="mt-1 bg-brand-primary text-brand-on-primary py-3 md:py-2.5 rounded-xl font-bold text-xs transition duration-200 hover:bg-brand-primary/95 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              Tải tệp đồng bộ lịch (.ICS)
            </button>
          </div>
  
          {/* OPTION 2: BACKUP JSON DATAS */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-secondary/15 rounded-xl text-brand-secondary shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-text">Sao lưu &amp; Chia sẻ cấu hình</h3>
                <p className="text-[11px] text-brand-on-surface-variant/80">Xuất file dữ liệu thô (.JSON) của phương án lịch</p>
              </div>
            </div>
  
            <p className="text-xs text-brand-on-surface-variant/90 leading-relaxed bg-brand-surface-low/30 p-2.5 rounded-xl border border-brand-border/20">
              Dùng để gửi cho bạn bè trong lớp chỉ cần nạp vào StudyGrid là hiển thị ngay giống hệt, hoặc sao lưu cục bộ tránh mất mát khi trình duyệt bị xóa cookie.
            </p>
  
            <button
              onClick={handleDownloadJSON}
              className="mt-1 bg-brand-surface-high hover:bg-brand-surface-highest text-brand-text py-3 md:py-2.5 rounded-xl font-bold text-xs border border-brand-border/60 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              Tải file Sao lưu dữ liệu (.JSON)
            </button>
          </div>
  
          {/* OPTION 3: PRINT FRIENDLY */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-tertiary/15 rounded-xl text-brand-tertiary shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-brand-text">In ấn Thời khóa biểu</h3>
                <p className="text-[11px] text-brand-on-surface-variant/80">Tạo bản in thô đen trắng tiết kiệm màu</p>
              </div>
            </div>
  
            <button
              onClick={handlePrint}
              className="mt-1 bg-brand-surface-high hover:bg-brand-surface-highest text-brand-text py-3 md:py-2.5 rounded-xl font-bold text-xs border border-brand-border/60 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Mở bản in của Trình duyệt
            </button>
          </div>
  
        </div>
  
        {/* COPYABLE SUMMARY CARD */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3 h-full">
          <div className="flex justify-between items-center bg-brand-surface-low/50 p-2.5 rounded-xl border border-brand-border/20">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">Xem trước dạng văn bản</span>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 bg-brand-primary-container text-brand-on-primary-container text-[11px] px-3 py-1.5 rounded-lg hover:bg-brand-primary-container/80 transition-all font-bold active:scale-95 cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Đã sao chép!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép nhanh
                </>
              )}
            </button>
          </div>
  
          <textarea
            readOnly
            value={currentTextSummary}
            className="flex-1 bg-brand-surface-low/80 border border-brand-border/40 rounded-xl p-3.5 font-mono text-[10px] md:text-xs text-brand-on-surface-variant focus:outline-none min-h-[300px] h-[400px] resize-none overflow-x-auto whitespace-pre-wrap break-all"
          />
          
          <div className="flex items-start gap-2 text-[10px] text-brand-on-surface-variant/80 italic mt-1 leading-relaxed bg-brand-surface-high/10 p-2 rounded-lg">
            <Info className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
            <span>Nội dung văn bản trên được tối ưu hóa hiển thị trên tin nhắn Messenger, Zalo hoặc Email để chia sẻ nhanh chỉ với một cú chạm sao hỏa!</span>
          </div>
        </div>
  
      </div>

      {/* DANH SÁCH PHƯƠNG ÁN ĐÃ LƯU */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <h2 className="text-base md:text-lg font-bold text-brand-text flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-brand-primary" />
            Phương án nháp đã lưu
          </h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            savedPlans.length >= 5
              ? "bg-brand-error-container/20 text-brand-error border-brand-error/30"
              : "bg-brand-primary/10 text-brand-primary border-brand-primary/25"
          }`}>
            {savedPlans.length}/5 phương án
          </span>
        </div>

        {savedPlans.length >= 5 && (
          <div className="bg-brand-error-container/15 border border-brand-error/30 rounded-2xl p-3.5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-brand-error shrink-0" />
            <p className="text-xs text-brand-error font-semibold">
              Đã đủ 5 phương án, xóa bớt để lưu thêm. Vào tab <strong>Lịch Biểu</strong> để lưu phương án mới sau khi xóa.
            </p>
          </div>
        )}

        {savedPlans.length === 0 ? (
          <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center gap-4 text-center border-dashed">
            <BookmarkX className="w-10 h-10 text-brand-primary/30" />
            <div>
              <p className="font-bold text-sm text-brand-text">Chưa có phương án nào được lưu</p>
              <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">
                Mở tab <strong className="text-brand-primary">Lịch Biểu</strong>, chọn phương án ưng ý rồi nhấn nút{" "}
                <strong className="text-brand-primary">Lưu phương án</strong> cạnh bộ điều hướng trang.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {savedPlans.map((plan, idx) => {
              const savedDate = new Date(plan.savedAt);
              const dateStr = `${savedDate.getDate().toString().padStart(2, "0")}/${(savedDate.getMonth() + 1).toString().padStart(2, "0")}/${savedDate.getFullYear()}`;
              const timeStr = `${savedDate.getHours().toString().padStart(2, "0")}:${savedDate.getMinutes().toString().padStart(2, "0")}`;

              return (
                <div
                  key={plan.id}
                  className="glass-panel p-4 rounded-2xl flex flex-col gap-3 group hover:border-brand-primary/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 w-6 h-6 rounded-lg bg-brand-primary/15 flex items-center justify-center text-[10px] font-extrabold text-brand-primary font-mono">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-sm text-brand-text truncate" title={plan.name}>
                        {plan.name}
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteSavedPlan(plan.id)}
                      className="shrink-0 p-1.5 rounded-lg text-brand-on-surface-variant hover:text-brand-error hover:bg-brand-error/10 transition-all cursor-pointer active:scale-95 opacity-60 group-hover:opacity-100"
                      title="Xóa phương án này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-brand-surface-low/60 rounded-xl p-2 border border-brand-border/30">
                      <p className="text-[9px] uppercase font-bold text-brand-on-surface-variant tracking-wider mb-0.5">Số môn học</p>
                      <p className="text-sm font-extrabold text-brand-secondary">
                        {plan.totalSubjects} <span className="text-[10px] font-medium text-brand-on-surface-variant">môn</span>
                      </p>
                    </div>
                    <div className="bg-brand-surface-low/60 rounded-xl p-2 border border-brand-border/30">
                      <p className="text-[9px] uppercase font-bold text-brand-on-surface-variant tracking-wider mb-0.5">Lưu lúc</p>
                      <p className="text-[11px] font-bold text-brand-text font-mono">
                        {timeStr}
                      </p>
                      <p className="text-[9px] text-brand-text-muted font-mono">{dateStr}</p>
                    </div>
                  </div>

                  {plan.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {plan.subjects.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="text-[9px] px-2 py-0.5 rounded-md font-semibold border"
                          style={{
                            backgroundColor: s.color.replace("1)", "0.12)"),
                            borderColor: s.color.replace("1)", "0.3)"),
                            color: s.color,
                          }}
                        >
                          {s.name.length > 18 ? s.name.slice(0, 18) + "…" : s.name}
                        </span>
                      ))}
                      {plan.subjects.length > 3 && (
                        <span className="text-[9px] px-2 py-0.5 rounded-md bg-brand-surface-highest text-brand-text-muted border border-brand-border font-semibold">
                          +{plan.subjects.length - 3} môn
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => onLoadSavedPlan(plan)}
                    className="w-full bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary border border-brand-primary/30 hover:border-brand-primary/60 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Tải &amp; Xem phương án này
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* US-11: VÙNG CHỤP ẢNH TKB OFF-SCREEN (Độ phân giải HD 1200px chuẩn thiết kế) */}
      {/* ========================================================================= */}
      <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none select-none">
        <div 
          id="studygrid-capture-target" 
          className="w-[1200px] p-8 flex flex-col gap-6 relative rounded-3xl border border-brand-border shadow-2xl"
          style={{
            backgroundColor: isLightMode ? "#F0EEF8" : "#15121b",
            color: isLightMode ? "#0F0A1E" : "#e8dfee"
          }}
        >
          {/* Header trong ảnh */}
          <div className="flex justify-between items-center border-b border-brand-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-primary-container/20 rounded-xl text-brand-primary shrink-0">
                <Sliders className="w-7 h-7 text-brand-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-text">Thời khóa biểu tối ưu</h2>
                <p className="text-xs text-brand-on-surface-variant/90">Lập kế hoạch học tập thông minh cùng StudyGrid</p>
              </div>
            </div>
            <div className="text-right text-xs text-brand-on-surface-variant/90">
              <p className="font-semibold">Mã phương án xuất bản: {publishId}</p>
              <p className="font-mono mt-0.5">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
            </div>
          </div>

          {/* Grid thời khóa biểu chính */}
          <div className="rounded-2xl border border-brand-border bg-brand-surface-medium/50 overflow-hidden flex flex-col">
            
            {/* Days Header */}
            <div className="grid grid-cols-8 bg-brand-surface-medium border-b border-brand-border h-12 shrink-0">
              <div className="flex items-center justify-center font-extrabold text-brand-text-muted text-xs border-r border-brand-border uppercase tracking-widest">
                Tiết
              </div>
              {DAYS_HEADER_MAP.map((day) => (
                <div
                  key={day.value}
                  className="flex items-center justify-center font-bold text-xs text-brand-text border-r border-brand-border/60 last:border-r-0"
                >
                  {day.label}
                </div>
              ))}
            </div>

            {/* Timetable Body */}
            <div className="relative w-full shrink-0" style={{ height: `${12 * slotHeight}px` }}>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-8 pointer-events-none">
                <div className="border-r border-brand-border h-full"></div>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="border-r border-brand-border/60 h-full last:border-r-0 relative">
                    {Array.from({ length: 12 }).map((_, rIdx) => (
                      <div
                        key={rIdx}
                        style={{ top: `${rIdx * slotHeight}px`, height: `${slotHeight}px` }}
                        className="absolute left-0 w-full border-b border-brand-border/30"
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Timings Left Column */}
              <div className="absolute top-0 left-0 w-[140px] h-full border-r border-brand-border">
                {slotTimes.map((time) => (
                  <div
                    key={time.slot}
                    style={{ top: `${(time.slot - 1) * slotHeight}px`, height: `${slotHeight}px` }}
                    className="absolute w-full flex flex-col justify-center items-center text-center border-b border-brand-border/60 bg-brand-surface-medium/20"
                  >
                    <span className="font-bold text-xs text-brand-primary">{time.slot}</span>
                    <span className="text-[9px] text-[#ccc3d8]/70 font-mono tracking-tighter">{time.start} - {time.end}</span>
                  </div>
                ))}
              </div>

              {/* Cards columns */}
              <div className="absolute top-0 left-[140px] right-0 h-full">
                <div className="relative w-full h-full grid grid-cols-7">
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const dayValue = idx + 2;
                    const currentDayClasses = classes.filter((item) => item.classOption.day === dayValue);
                    const currentDayBusy = busyActivities.filter((act) => act.day === dayValue);

                    return (
                      <div key={dayValue} className="relative h-full border-r border-brand-border/60 last:border-r-0">
                        
                        {/* Học phần */}
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
                                backgroundColor: item.color.replace("1)", "0.14)"),
                                borderColor: item.color,
                              }}
                              className="absolute left-1 right-1 border-2 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden shadow-md"
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="block font-bold text-[11px] leading-snug line-clamp-2" style={{ color: item.color }}>
                                  {item.subjectName}
                                </span>
                                <span className="text-[9px] text-brand-text opacity-95 font-medium">
                                  {opt.className}
                                </span>
                                {opt.room && (
                                  <span className="text-[8px] text-brand-text-muted flex items-center gap-1 mt-0.5">
                                    📍 {opt.room}
                                  </span>
                                )}
                                {opt.teacher && (
                                  <span className="text-[8px] text-brand-text-muted flex items-center gap-1 mt-0.5">
                                    👤 {opt.teacher}
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] font-mono opacity-50 block mt-1">
                                Tiết {opt.startSlot}-{opt.startSlot + opt.duration - 1}
                              </span>
                            </div>
                          );
                        })}

                        {/* Lịch bận */}
                        {currentDayBusy.map((busy) => {
                          const busyTop = (busy.startSlot - 1) * slotHeight;
                          const busyHeight = busy.duration * slotHeight - 6;

                          return (
                            <div
                              key={busy.id}
                              style={{ top: `${busyTop + 3}px`, height: `${busyHeight}px` }}
                              className="absolute left-1 right-1 bg-brand-surface-high border border-brand-border border-dashed rounded-xl p-1.5 flex flex-col justify-start opacity-75"
                            >
                              <span className="block font-bold text-brand-text-muted text-[9px] uppercase tracking-wide line-clamp-1">
                                {busy.name}
                              </span>
                              <span className="text-[7px] font-mono text-brand-on-surface-variant opacity-60 block mt-0.5">
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

          {/* Watermark tinh tế ở góc dưới bên phải */}
          <div className="flex justify-end items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 bg-brand-surface-medium border border-brand-border px-3.5 py-1.5 rounded-xl shadow-lg">
              <Sliders className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-xs font-bold text-brand-primary">StudyGrid</span>
              <span className="text-[10px] text-brand-on-surface-variant/80">| studygrid.com</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* UI BẢO TRỢ THÊM: TOASTS, CAPTURING OVERLAY, FALLBACK MODAL                */}
      {/* ========================================================================= */}

      {/* Trạng thái Spinner Loading */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in pointer-events-none select-none">
          <div className="bg-brand-surface border border-brand-border p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-xs text-center animate-fade-in">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <h3 className="font-bold text-sm text-brand-text">Đang tạo hình ảnh...</h3>
            <p className="text-[11px] text-brand-on-surface-variant">Vui lòng chờ giây lát, StudyGrid đang kết xuất lịch sắc nét cao (Full HD).</p>
          </div>
        </div>
      )}

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-surface-high border border-brand-primary/40 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
          <span className="text-xs font-bold text-brand-text">{toastMessage}</span>
        </div>
      )}

      {/* Modal Fallback khi Clipboard API bị chặn */}
      {fallbackImgUrl && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-brand-surface border border-brand-border p-5 rounded-2xl max-w-xl w-full flex flex-col gap-4 relative shadow-2xl">
            <button 
              onClick={() => setFallbackImgUrl(null)}
              className="absolute top-4 right-4 p-1 text-brand-on-surface-variant hover:text-brand-text hover:bg-brand-surface-high rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-brand-secondary" />
              <h3 className="font-bold text-sm text-brand-text">Lưu ảnh thủ công</h3>
            </div>
            
            <p className="text-xs text-brand-on-surface-variant leading-relaxed">
              Trình duyệt của bạn đang chặn quyền truy cập clipboard nhanh. Bạn vui lòng bấm giữ lâu hoặc nhấp chuột phải vào ảnh bên dưới, chọn <strong className="text-brand-secondary">"Lưu hình ảnh thành..."</strong> (Save Image As...):
            </p>

            <div className="border border-brand-border rounded-xl overflow-hidden max-h-[350px] overflow-y-auto bg-brand-surface-low p-2">
              <img src={fallbackImgUrl} alt="StudyGrid TKB Preview" className="w-full h-auto object-contain rounded-lg" />
            </div>

            <button
              onClick={() => setFallbackImgUrl(null)}
              className="bg-brand-primary text-brand-on-primary py-2.5 rounded-xl font-bold text-xs transition duration-200 cursor-pointer"
            >
              Đóng Preview
            </button>
          </div>
        </div>
      )}
  
    </div>
  );
};