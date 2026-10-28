import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, ArrowRight, BookOpen } from 'lucide-react';
import { useCourses } from '@/hooks/useCourses';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const OtherCoursesPage: React.FC = () => {
  const { courses, loading } = useCourses();
  const navigate = useNavigate();

  return (
    <div className="max-w-[1450px] mx-auto space-y-6">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101827]">
        Other Courses & Electives
      </h1>

      <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#a855f7] flex items-center justify-center mb-4">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-[#101827] mb-2">
            Explore Your Expanded Learning Path
          </h2>
          <p className="text-sm text-[#65748b] leading-relaxed mb-6">
            Explore our curated library of technology, programming, and engineering electives. Select any course below to inspect modules and start learning.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading courses..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4 border-t border-[#edf1f7]">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/curriculum?course=${course.id}`)}
                className="p-5 rounded-2xl border border-[#d2dce9] hover:border-[#2463eb] hover:shadow-md transition-all cursor-pointer bg-[#f8fafc] hover:bg-white group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#dceaff] text-[#2463eb] flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      Published
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#101827] group-hover:text-[#2463eb] transition-colors mb-1.5">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#65748b] line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-[#2463eb] pt-4 mt-4 border-t border-[#edf1f7]">
                  <span>{course.lessonCount || 0} Lessons</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Course <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
