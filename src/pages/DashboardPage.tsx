import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useProgress } from '@/hooks/useProgress';
import { ContinueCarousel } from '@/components/dashboard/ContinueCarousel';
import { ScheduleWidget } from '@/components/dashboard/ScheduleWidget';
import { AttendanceWidget } from '@/components/dashboard/AttendanceWidget';
import { EventsWidget } from '@/components/dashboard/EventsWidget';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const {
    courseSummaries,
    overallPercentage,
    completedMap,
    loading: progressLoading,
    error: progressError,
  } = useProgress(courses);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = currentUser?.displayName || 'Student';
  const totalCompletedCount = Object.keys(completedMap).length;
  const totalAvailableLessons =
    courseSummaries.reduce((acc, s) => acc + (s.totalLessons || 0), 0) ||
    courses.reduce((acc, c) => acc + (c.lessonCount || 0), 0) ||
    24;

  return (
    <div className="space-y-7">
      {/* Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101827]">
          {getGreeting()}, {displayName} 👋
        </h1>
      </div>

      {coursesError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {coursesError}
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.9fr)_minmax(340px,1fr)] gap-7 items-start">
        {/* Left Stack */}
        <div className="flex flex-col gap-6 min-w-0">
          <ContinueCarousel
            summaries={courseSummaries}
            loading={progressLoading && courseSummaries.length === 0}
          />
          <ScheduleWidget />
        </div>

        {/* Right Stack */}
        <div className="flex flex-col gap-6 min-w-0">
          <AttendanceWidget
            overallPercentage={overallPercentage}
            totalCompleted={totalCompletedCount}
            totalAvailable={totalAvailableLessons}
            loading={progressLoading}
          />
          <EventsWidget />
        </div>
      </div>
    </div>
  );
};
