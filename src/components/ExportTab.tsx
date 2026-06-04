import React, { useState } from "react";
import { 
  Download, Calendar, Copy, Check, FileCode, CheckCircle, Info, Printer
} from "lucide-react";
import { TimetableSolution, BusyActivity } from "../types";

interface ExportTabProps {
  selectedSolution: TimetableSolution | null;
  busyActivities: BusyActivity[];
}

export const ExportTab: React.FC<ExportTabProps> = ({
  selectedSolution,
  busyActivities,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedIcs, setCopiedIcs] = useState(false);

  if (!selectedSolution) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-brand-bg/95">
        <div className="bg-brand-surface-medium border border-[#4a4455]/20 p-8 rounded-3xl max-w-md shadow-2xl flex flex-col items-center gap-4">
          <Download className="w-16 h-16 text-brand-primary opacity-50" />
          <h2 className="text-xl font-bold text-[#e8dfee]">Chưa có dữ liệu xuất bản</h2>
          <p className="text-xs text-brand-on-surface-variant leading-relaxed">
            Vui lòng nhấn nút <strong className="text-brand-primary">"Tính toán tối ưu lịch học"</strong> ở góc thanh bên trái để tạo giải pháp thời khóa biểu trước khi sử dụng các tùy chọn xuất bản và đồng bộ hóa.
          </p>
        </div>
      </div>
    );
  }

  const classes = selectedSolution.classes;

  // Render a clean structural text representation
  const generateTextSummary = () => {
    let summary = `===== STUDYGRID - THỜI KHÓA BIỂU TỐI ƯU =====\n\n`;
    
    // Days description mapping
    const DAYS_MAP: { [key: number]: string } = {
      2: "Thứ Hai", 3: "Thứ Ba", 4: "Thứ Tư", 5: "Thứ Năm", 6: "Thứ Sáu", 7: "Thứ Bảy", 8: "Chủ Nhật"
    };

    // Sort by day and slot
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

  // Dynamically generate the iCalendar (ICS) payload
  const handleDownloadICS = () => {
    // Generate dates based on modern schedule starts. Let's declare semester starts on 2026-06-08 (Monday)
    // Map of days offset from Monday (June 8, 2026)
    // 2 (Monday) -> June 8, 3 (Tuesday) -> June 9, etc.
    const getIcsDateStr = (dayValue: number, startSlot: number, isEnd: boolean = false) => {
      const year = "2026";
      const month = "06";
      
      const dayOffset = dayValue - 2; // Monday is 0 offset
      const dayNum = 8 + dayOffset;
      const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;

      // Slot to timings conversion
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
      const timePart = isEnd ? slotTime.end : slotTime.start;

      return `${year}${month}${dayStr}T${timePart}`;
    };

    let icsContent = "BEGIN:VCALENDAR\r\n";
    icsContent += "VERSION:2.0\r\n";
    icsContent += "PRODID:-//StudyGrid//Scheduling App//VN\r\n";
    icsContent += "CALSCALE:GREGORIAN\r\n";
    icsContent += "METHOD:PUBLISH\r\n";

    classes.forEach((item) => {
      const o = item.classOption;
      const dtStart = getIcsDateStr(o.day, o.startSlot);
      // End slot is startSlot + duration - 1
      const dtEnd = getIcsDateStr(o.day, o.startSlot + o.duration - 1, true);

      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `UID:${o.id}@studygrid.com\r\n`;
      icsContent += `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}\r\n`;
      icsContent += `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}\r\n`;
      icsContent += `SUMMARY:${item.subjectName} (${o.className})\r\n`;
      
      let desc = `Lớp học phần: ${o.className}\\n`;
      if (o.teacher) desc += `Giảng viên: ${o.teacher}\\n`;
      desc += `Tạo tự động trên StudyGrid.`;
      
      icsContent += `DESCRIPTION:${desc}\r\n`;
      if (o.room) {
        icsContent += `LOCATION:${o.room}\r\n`;
      }
      // Repeat weekly for 15 weeks (standard semester)
      icsContent += "RRULE:FREQ=WEEKLY;COUNT=15\r\n";
      icsContent += "END:VEVENT\r\n";
    });

    // Save also busy times to ics with light warnings
    busyActivities.forEach((act) => {
      const dtStart = getIcsDateStr(act.day, act.startSlot);
      const dtEnd = getIcsDateStr(act.day, act.startSlot + act.duration - 1, true);

      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `UID:busy-${act.id}@studygrid.com\r\n`;
      icsContent += `DTSTART;TZID=Asia/Ho_Chi_Minh:${dtStart}\r\n`;
      icsContent += `DTEND;TZID=Asia/Ho_Chi_Minh:${dtEnd}\r\n`;
      icsContent += `SUMMARY:[Lịch Bận] ${act.name}\r\n`;
      icsContent += `DESCRIPTION:Thời gian khóa cố định tránh xếp lịch học.\\n`;
      icsContent += "RRULE:FREQ=WEEKLY;COUNT=15\r\n";
      icsContent += "END:VEVENT\r\n";
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

  // Convert current full config parameters state to exportable JSON payload
  const handleDownloadJSON = () => {
    const exportObj = {
      exportedAt: new Date().toISOString(),
      theme: "Academic Flux",
      busyActivities,
      classes: selectedSolution.classes,
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "studygrid_timetable_backup.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentTextSummary = generateTextSummary();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-brand-bg/95 flex flex-col gap-6 select-text">
      
      {/* HEADER */}
      <div className="border-b border-[#4a4455]/20 pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#e8dfee] flex items-center gap-2">
          <Download className="w-6 h-6 text-brand-primary" />
          Xuất Bản &amp; Đồng Bộ Hóa
        </h1>
        <p className="text-xs text-brand-on-surface-variant">
          Xuất dữ liệu thời khóa biểu đã tối ưu thành các định dạng tương thích để đồng bộ điện thoại, in ấn hoặc gửi cho bạn bè
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* EXPORT OPTIONS CONTROLS */}
        <div className="flex flex-col gap-5">
          
          {/* OPTION 1: GOOGLE CALENDAR ICS */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-primary-container/20 rounded-xl text-brand-primary shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#e8dfee]">Đồng bộ Google &amp; Apple Calendar</h3>
                <p className="text-[11px] text-brand-on-surface-variant/80">Tạo tệp iCalendar phù hợp tiêu chuẩn quốc tế</p>
              </div>
            </div>
            
            <p className="text-xs text-brand-on-surface-variant/90 leading-relaxed bg-brand-surface-low/30 p-2.5 rounded-xl border border-[#4a4455]/10">
              Nhập trực tiếp thời khóa biểu này vào các ứng dụng lịch phổ biến. Lịch sẽ được tự động lặp lại hàng tuần trong kỳ học (15 tuần liên tục).
            </p>

            <button
              onClick={handleDownloadICS}
              className="mt-1 bg-brand-primary text-brand-on-primary py-2.5 rounded-xl font-bold text-xs transition duration-200 hover:bg-brand-primary/95 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
                <h3 className="font-bold text-sm text-[#e8dfee]">Sao lưu &amp; Chia sẻ cấu hình</h3>
                <p className="text-[11px] text-brand-on-surface-variant/80">Xuất file dữ liệu thô (.JSON) của phương án lịch</p>
              </div>
            </div>

            <p className="text-xs text-brand-on-surface-variant/90 leading-relaxed bg-brand-surface-low/30 p-2.5 rounded-xl border border-[#4a4455]/10">
              Dùng để gửi cho bạn bè trong lớp chỉ cần nạp vào StudyGrid là hiển thị ngay giống hệt, hoặc sao lưu cục bộ tránh mất mát khi trình duyệt bị xóa cookie.
            </p>

            <button
              onClick={handleDownloadJSON}
              className="mt-1 bg-brand-surface-high hover:bg-brand-surface-highest text-[#e8dfee] py-2.5 rounded-xl font-bold text-xs border border-[#4a4455]/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
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
                <h3 className="font-bold text-sm text-[#e8dfee]">In ấn Thời khóa biểu</h3>
                <p className="text-[11px] text-brand-on-surface-variant/80">Tạo bản in thô đen trắng tiết kiệm màu</p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="mt-1 bg-brand-surface-high hover:bg-brand-surface-highest text-[#e8dfee] py-2.5 rounded-xl font-bold text-xs border border-[#4a4455]/40 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Mở bản in của Trình duyệt
            </button>
          </div>

        </div>

        {/* COPYABLE SUMMARY CARD */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3 h-full">
          <div className="flex justify-between items-center bg-brand-surface-low/50 p-2.5 rounded-xl border border-[#4a4455]/10">
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
            className="flex-1 bg-brand-surface-low/80 border border-[#4a4455]/30 rounded-xl p-3.5 font-mono text-xs text-brand-on-surface-variant focus:outline-none min-h-[300px] h-[400px] resize-none"
          />
          
          <div className="flex items-start gap-2 text-[10px] text-brand-on-surface-variant/80 italic mt-1 leading-relaxed bg-brand-surface-high/10 p-2 rounded-lg">
            <Info className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
            <span>Nội dung văn bản trên được tối ưu hóa hiển thị trên tin nhắn Messenger, Zalo hoặc Email để chia sẻ nhanh chỉ với một cú chạm sao hỏa!</span>
          </div>
        </div>

      </div>

    </div>
  );
};
