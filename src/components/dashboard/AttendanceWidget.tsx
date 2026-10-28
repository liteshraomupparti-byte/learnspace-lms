import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';

interface AttendanceWidgetProps {
  overallPercentage: number;
  totalCompleted: number;
  totalAvailable: number;
  loading: boolean;
}

export const AttendanceWidget: React.FC<AttendanceWidgetProps> = ({
  overallPercentage,
  totalCompleted,
  totalAvailable,
  loading,
}) => {
  return (
    <section className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#101827] mb-5">
        Your Learning Marker
      </h2>

      <div className="flex items-center justify-between gap-3 mb-3 text-sm text-[#344660]">
        <span>Overall Course Progress</span>
        <strong className="text-2xl font-bold text-[#111827]">
          {loading ? '...' : `${overallPercentage}%`}
        </strong>
      </div>

      <div className="h-2 bg-[#e5eaf2] rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${overallPercentage}%`,
            backgroundColor: overallPercentage >= 75 ? '#20b36b' : overallPercentage >= 30 ? '#2463eb' : '#f04444',
          }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-[#65748b] mb-4">
        <span>{totalCompleted} lessons completed</span>
        <span>{totalAvailable} total lessons</span>
      </div>

      <div className="flex items-center gap-2.5 p-3.5 bg-[#fff7ed] rounded-xl text-[#f05a19] text-sm">
        <Info className="w-5 h-5 shrink-0" />
        <span>
          {overallPercentage === 100
            ? "Congratulations! You have completed all published lessons in your enrolled courses."
            : overallPercentage > 0
            ? "Keep learning — consistent progress leads to mastery."
            : "Get started by opening your first lesson in the curriculum."}
        </span>
      </div>
    </section>
  );
};
