import React from "react";
import { 
  BarChart2, Award, Calendar, Coffee, Sparkles, TrendingUp, HelpCircle
} from "lucide-react";
import { TimetableSolution, BusyActivity } from "../types";

interface AnalyticsTabProps {
  selectedSolution: TimetableSolution | null;
  busyActivities: BusyActivity[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  selectedSolution,
  busyActivities,
}) => {
  if (!selectedSolution) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-brand-bg/95">
        <div className="bg-brand-surface-medium border border-[#4a4455]/20 p-8 rounded-3xl max-w-md shadow-2xl flex flex-col items-center gap-4">
          <BarChart2 className="w-16 h-16 text-brand-primary opacity-50 animate-bounce" />
          <h2 className="text-xl font-bold text-[#e8dfee]">Chưa có dữ liệu phân tích</h2>
          <p className="text-xs text-brand-on-surface-variant leading-relaxed">
            Vui lòng nhấn nút <strong className="text-brand-primary">"Tính toán tối ưu lịch học"</strong> ở góc thanh bên trái để tạo giải pháp thời khóa biểu trước khi xem phân tích học thuật.
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const classes = selectedSolution.classes;
  const totalSubjects = classes.length;
  
  // Total academic periods
  const totalPeriods = classes.reduce((sum, item) => sum + item.classOption.duration, 0);
  const totalBusyPeriods = busyActivities.reduce((sum, item) => sum + item.duration, 0);

  // Distribution of academic study periods per day
  const dayDistribution: { [key: number]: number } = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  classes.forEach(item => {
    dayDistribution[item.classOption.day] += item.classOption.duration;
  });

  // Busy periods per day
  const busyDistribution: { [key: number]: number } = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  busyActivities.forEach(item => {
    busyDistribution[item.day] += item.duration;
  });

  // Find fully free days (no class, no busy activities)
  const freeDaysList: string[] = [];
  const DAYS_MAP: { [key: number]: string } = {
    2: "Thứ Hai", 3: "Thứ Ba", 4: "Thứ Tư", 5: "Thứ Năm", 6: "Thứ Sáu", 7: "Thứ Bảy", 8: "Chủ Nhật"
  };

  Object.keys(DAYS_MAP).forEach((dayKeyObj) => {
    const d = Number(dayKeyObj);
    if (dayDistribution[d] === 0 && busyDistribution[d] === 0) {
      freeDaysList.push(DAYS_MAP[d]);
    }
  });

  // Calculate highest load day
  let maxLoad = 0;
  let heaviestDay = "Không có";
  Object.keys(dayDistribution).forEach((dayKeyObj) => {
    const d = Number(dayKeyObj);
    if (dayDistribution[d] > maxLoad) {
      maxLoad = dayDistribution[d];
      heaviestDay = DAYS_MAP[d];
    }
  });

  // Calculate density of class schedule
  const studyDaysCount = Object.values(dayDistribution).filter(v => v > 0).length;
  const averagePeriodsPerStudyDay = studyDaysCount > 0 ? (totalPeriods / studyDaysCount).toFixed(1) : "0";

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-brand-bg/95 flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="border-b border-[#4a4455]/20 pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#e8dfee] flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-brand-primary" />
          Phân tích &amp; Đánh giá Thời khóa biểu
        </h1>
        <p className="text-xs text-brand-on-surface-variant">
          Đo lường mức độ tối ưu, phân bổ thời gian tự học và mật độ học tập của phương án hiện tại
        </p>
      </div>

      {/* STATS Bento GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start text-brand-on-surface-variant text-xs font-semibold uppercase tracking-wider">
            <span>Tổng số môn học</span>
            <Award className="w-5 h-5 text-brand-primary" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-brand-primary">
            {totalSubjects} <span className="text-xs font-medium text-brand-on-surface-variant">môn</span>
          </div>
          <p className="text-[10px] text-brand-on-surface-variant/70 mt-1">
            Đã sắp xếp 100% không trùng lặp
          </p>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start text-brand-on-surface-variant text-xs font-semibold uppercase tracking-wider">
            <span>Tổng số tiết / Tuần</span>
            <Calendar className="w-5 h-5 text-brand-secondary" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-brand-secondary">
            {totalPeriods} <span className="text-xs font-medium text-brand-on-surface-variant">tiết</span>
          </div>
          <p className="text-[10px] text-brand-on-surface-variant/80 mt-1">
            ~ {Math.round(totalPeriods * 0.75)} giờ học trên lớp (+{totalBusyPeriods} tiết bận cá nhân)
          </p>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start text-brand-on-surface-variant text-xs font-semibold uppercase tracking-wider">
            <span>Ngày nghỉ hoàn toàn</span>
            <Coffee className="w-5 h-5 text-brand-tertiary" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-brand-tertiary">
            {freeDaysList.length} <span className="text-xs font-medium text-brand-on-surface-variant">ngày</span>
          </div>
          <p className="text-[10px] text-brand-on-surface-variant/90 mt-1 line-clamp-1">
            {freeDaysList.length > 0 ? `Thảnh thơi: ${freeDaysList.join(", ")}` : "Không có ngày nào trống cả tuần"}
          </p>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start text-brand-on-surface-variant text-xs font-semibold uppercase tracking-wider">
            <span>Ngày học nặng nhất</span>
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-red-300">
            {heaviestDay}
          </div>
          <p className="text-[10px] text-brand-on-surface-variant/70 mt-1">
            Với {maxLoad} tiết học tập trung tối đa
          </p>
        </div>

      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Day of the Week Distribution Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#e8dfee] uppercase tracking-wider">
              Phân bố số tiết học theo ngày
            </h3>
            <span className="text-[10px] bg-brand-surface-highest text-[#ccc3d8] px-2.5 py-1 rounded-md border border-[#4a4455]/20">
              {averagePeriodsPerStudyDay} tiết / ngày học trung bình
            </span>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {Object.keys(DAYS_MAP).map((dayKeyString) => {
              const d = Number(dayKeyString);
              const academicCount = dayDistribution[d];
              const busyCount = busyDistribution[d];
              const totalCount = academicCount + busyCount;
              
              // Max scale calculation for safety (let's assume 12 periods is maximum load)
              const academicPercentage = Math.min(100, (academicCount / 12) * 100);
              const busyPercentage = Math.min(100, (busyCount / 12) * 100);

              return (
                <div key={d} className="grid grid-cols-12 items-center gap-2">
                  <span className="col-span-2 text-xs font-semibold text-[#ccc3d8]">
                    {DAYS_MAP[d]}
                  </span>
                  
                  {/* Styled multi-tier bar graph */}
                  <div className="col-span-8 bg-brand-surface-highest/50 h-5 rounded-md overflow-hidden relative border border-[#4a4455]/10 flex">
                    {academicCount > 0 && (
                      <div
                        style={{ width: `${academicPercentage}%` }}
                        className="bg-gradient-to-r from-brand-primary-container to-brand-primary h-full rounded-r-sm transition-all duration-500"
                        title={`Học chính thức: ${academicCount} tiết`}
                      />
                    )}
                    {busyCount > 0 && (
                      <div
                        style={{ width: `${busyPercentage}%` }}
                        className="bg-brand-surface-highest/80 border-l border-dashed border-[#ccc3d8]/40 h-full transition-all duration-500"
                        title={`Lịch bận cố định: ${busyCount} tiết`}
                      />
                    )}
                    {totalCount === 0 && (
                      <span className="absolute inset-x-0 inset-y-0 text-[10px] text-brand-on-surface-variant/40 flex items-center justify-center font-mono font-medium tracking-wider">
                        TRỐNG HOÀN TOÀN
                      </span>
                    )}
                  </div>

                  <span className="col-span-2 text-xs font-mono text-right text-brand-primary">
                    {academicCount > 0 ? `${academicCount} tiết` : ""}
                    {busyCount > 0 ? ` (+${busyCount} bận)` : ""}
                    {totalCount === 0 ? "Nghỉ" : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legends */}
          <div className="flex gap-4 mt-3 text-[10px] bg-brand-surface-low/30 p-2 rounded-xl">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-brand-primary" />
              <span className="text-[#ccc3d8]">Giờ học chính khóa</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-brand-surface-highest border border-dashed border-[#ccc3d8]/50" />
              <span className="text-[#ccc3d8]">Lịch bận tự thiết lập cố định</span>
            </div>
          </div>
        </div>

        {/* Suggestion evaluation block */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3.5">
          <h3 className="font-bold text-sm text-[#e8dfee] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-tertiary" />
            Đánh giá sức khỏe lịch học
          </h3>

          <div className="flex flex-col gap-3.5 mt-1.5">
            {/* Rule 1: rest days */}
            <div className="p-3 bg-brand-surface-low/50 rounded-xl border border-[#4a4455]/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-brand-primary">Độ thảnh thơi học kỳ</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Khuyên Dùng</span>
              </div>
              <p className="text-xs text-brand-on-surface-variant">
                Lịch trình hiện có <strong className="text-[#ffffff]">{freeDaysList.length} ngày nghỉ</strong> trong tuần. Cho phép bạn dễ dàng tự nghiên cứu bài tập lớn và gia tăng số buổi làm thêm kiếm thu nhập thụ động!
              </p>
            </div>

            {/* Rule 2: distribution density */}
            <div className="p-3 bg-brand-surface-low/50 rounded-xl border border-[#4a4455]/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-bold text-brand-secondary">Độ nén thời gian (Mật độ)</span>
                <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">Tối ưu</span>
              </div>
              <p className="text-xs text-brand-on-surface-variant">
                Lượng thời gian học trung bình ở mức <strong className="text-[#ffffff]">{averagePeriodsPerStudyDay} tiết/ngày</strong>. Đây là mật độ lý tưởng nhất (khoảng 3-4 tiếng/ngày), hạn chế mệt mỏi và chán nản trên giảng đường!
              </p>
            </div>

            {/* Hint alert */}
            <div className="text-[10px] text-[#ccc3d8]/70 leading-relaxed border-t border-[#4a4455]/10 pt-2.5">
              💡 <em>Mẹo nhỏ:</em> Bạn có thể nạp các phương án preset khác nhau ở góc trái màn hình để so sánh cấu trúc phân bổ thời gian rảnh của từng lịch trình!
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
