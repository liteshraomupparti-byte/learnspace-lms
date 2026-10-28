import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, ChevronLeft } from 'lucide-react';
import type { CourseProgressSummary } from '@/types';

interface ContinueCarouselProps {
  summaries: CourseProgressSummary[];
  loading: boolean;
}

export const ContinueCarousel: React.FC<ContinueCarouselProps> = ({ summaries, loading }) => {
  const [startIndex, setStartIndex] = useState(0);
  const navigate = useNavigate();

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(summaries.length - 2, prev + 1));
  };

  const visibleSummaries = summaries.slice(startIndex, startIndex + 2);

  const handleContinue = (courseId: string, lessonId?: string) => {
    if (lessonId) {
      navigate(`/lesson/${courseId}/${lessonId}`);
    } else {
      navigate(`/curriculum?course=${courseId}`);
    }
  };

  return (
    <section className="bg-white border border-[#d2dce9] rounded-[21px] overflow-hidden p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-[#101827]">
          Continue from Where You Left Off
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={startIndex === 0}
            className="text-2xl leading-none text-[#101827] disabled:text-[#94a5bd] hover:text-[#2463eb] transition-colors p-1"
            aria-label="Previous courses"
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            disabled={startIndex + 2 >= summaries.length}
            className="text-2xl leading-none text-[#101827] disabled:text-[#94a5bd] hover:text-[#2463eb] transition-colors p-1"
            aria-label="Next courses"
          >
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 rounded-2xl bg-[#f0f4f8] animate-pulse" />
          <div className="h-32 rounded-2xl bg-[#f0f4f8] animate-pulse hidden md:block" />
        </div>
      ) : summaries.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#65748b]">
          <p className="mb-3">You haven't enrolled or started any courses yet.</p>
          <button
            onClick={() => navigate('/curriculum')}
            className="px-4 py-2 bg-[#2463eb] text-white rounded-xl text-sm font-semibold hover:bg-[#1d4fd8] transition-colors"
          >
            Explore Curriculum
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleSummaries.map((summary) => (
            <article
              key={summary.courseId}
              className="border border-[#d2dce9] rounded-[18px] p-4 sm:p-4 grid grid-cols-[44px_1fr_24px] items-start gap-4 min-h-[126px] bg-white hover:border-[#93baff] transition-all group"
            >
              {/* Course Round Icon */}
              <div className="w-11 h-11 rounded-full bg-[#f6efff] text-[#8b2df4] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="min-w-0">
                <div className="text-base font-semibold leading-snug truncate text-[#101827] group-hover:text-[#2463eb] transition-colors">
                  {summary.courseTitle}
                </div>
                <div className="text-sm text-[#61738d] truncate mt-0.5">
                  {summary.lastAccessedLessonTitle || `${summary.completedLessons} of ${summary.totalLessons} lessons completed`}
                </div>

                <div className="flex items-center gap-2.5 mt-4">
                  <span className="bg-[#d1fae9] text-[#009b76] px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    &lt;/&gt; Learning
                  </span>
                  <div className="h-1.5 rounded-full bg-[#edf1f7] flex-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#21c66b] transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(summary.percentage, 0))}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#0b9b50] font-semibold shrink-0">
                    {summary.percentage}%
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleContinue(summary.courseId, summary.lastAccessedLessonId)}
                className="text-[#2463eb] text-2xl font-bold flex items-center justify-center hover:translate-x-0.5 transition-transform mt-1"
                aria-label={`Continue ${summary.courseTitle}`}
              >
                ›
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
