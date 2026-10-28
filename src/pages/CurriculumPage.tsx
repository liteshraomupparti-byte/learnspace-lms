import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { useProgress } from '@/hooks/useProgress';
import { CourseAccordion } from '@/components/curriculum/CourseAccordion';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { seedInitialDatabase } from '@/services/seedData';

export const CurriculumPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCourseId = searchParams.get('course') || undefined;

  const { courses, loading: coursesLoading, error: coursesError, refetch } = useCourses();
  const { completedMap } = useProgress(courses);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedStatus(null);
    try {
      const res = await seedInitialDatabase();
      setSeedStatus(`Successfully synchronized ${res.coursesCreated} courses and ${res.lessonsCreated} lessons.`);
      await refetch();
    } catch (err: any) {
      setSeedStatus(`Notice: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-[1450px] mx-auto space-y-6">
      {/* Course Banner */}
      <div className="border border-[#d2dce9] bg-[#f8fafc] rounded-[18px] p-5 sm:p-6 flex items-center gap-3.5 min-h-[95px] shadow-xs">
        <div className="h-12 w-12 rounded-full bg-[#dceaff] text-[#2463eb] flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-lg sm:text-xl font-medium text-[#101827]">
          My Curriculum
        </h1>
        <div className="h-7 w-[1px] bg-[#d0d9e7] mx-1" />
        <span className="border border-[#d2dce9] rounded-full bg-white px-3.5 py-1.5 text-xs sm:text-sm text-[#33445d] font-medium whitespace-nowrap shadow-xs">
          Courses: {courses.length}
        </span>
      </div>

      {coursesError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {coursesError}
        </div>
      )}

      {seedStatus && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          {seedStatus}
        </div>
      )}

      {coursesLoading || seeding ? (
        <LoadingSpinner label={seeding ? "Syncing curriculum..." : "Loading curriculum..."} size="lg" />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No Published Courses"
          description="There are currently no courses in the database. You can populate the standard 16-module Python curriculum right now with one click."
          actionLabel="Seed Python Curriculum"
          onAction={handleSeed}
          secondaryActionLabel="Refresh Curriculum"
          onSecondaryAction={refetch}
        />
      ) : (
        <CourseAccordion
          courses={courses}
          initialOpenCourseId={initialCourseId}
          completedLessonsMap={completedMap}
        />
      )}
    </div>
  );
};

