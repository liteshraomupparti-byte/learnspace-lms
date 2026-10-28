import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronDown, Play, CheckCircle2, Layers, Video } from 'lucide-react';
import { courseService } from '@/services/courseService';
import { lessonService } from '@/services/lessonService';
import type { Course, Module, Lesson } from '@/types';

interface CourseAccordionProps {
  courses: Course[];
  initialOpenCourseId?: string;
  completedLessonsMap?: Record<string, boolean>;
}

export const CourseAccordion: React.FC<CourseAccordionProps> = ({
  courses,
  initialOpenCourseId,
  completedLessonsMap = {},
}) => {
  const [openCourseId, setOpenCourseId] = useState<string | null>(
    initialOpenCourseId || (courses.length > 0 ? courses[0].id : null)
  );

  const [courseDetails, setCourseDetails] = useState<
    Record<string, { modules: Module[]; lessons: Lesson[]; loading: boolean }>
  >({});

  // Track collapsed state per topic (default: false = expanded so topic-wise lectures are visible)
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});
  // Optional active topic filter per course ('all' by default)
  const [selectedTopicByCourse, setSelectedTopicByCourse] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  useEffect(() => {
    if (initialOpenCourseId) {
      setOpenCourseId(initialOpenCourseId);
    } else if (!openCourseId && courses.length > 0) {
      setOpenCourseId(courses[0].id);
    }
  }, [initialOpenCourseId, courses]);

  // Load modules & lessons when a course is toggled open
  useEffect(() => {
    if (!openCourseId) return;
    if (courseDetails[openCourseId]?.modules) return; // already loaded

    let isMounted = true;
    async function loadData() {
      setCourseDetails((prev) => ({
        ...prev,
        [openCourseId!]: { modules: [], lessons: [], loading: true },
      }));

      try {
        const [modules, lessons] = await Promise.all([
          courseService.getModulesByCourse(openCourseId!, true),
          lessonService.getLessonsByCourse(openCourseId!, true),
        ]);

        if (isMounted) {
          setCourseDetails((prev) => ({
            ...prev,
            [openCourseId!]: { modules, lessons, loading: false },
          }));
        }
      } catch (e) {
        console.error(`Error loading modules/lessons for ${openCourseId}:`, e);
        if (isMounted) {
          setCourseDetails((prev) => ({
            ...prev,
            [openCourseId!]: { modules: [], lessons: [], loading: false },
          }));
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [openCourseId]);

  const toggleCourse = (courseId: string) => {
    setOpenCourseId((prev) => (prev === courseId ? null : courseId));
  };

  const toggleTopic = (moduleId: string) => {
    setCollapsedTopics((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleOpenLesson = (courseId: string, lessonId: string) => {
    navigate(`/lesson/${courseId}/${lessonId}`);
  };

  return (
    <div className="flex flex-col gap-5">
      {courses.map((course) => {
        const isOpen = openCourseId === course.id;
        const details = courseDetails[course.id];
        const modules = details?.modules || [];
        const lessons = details?.lessons || [];
        const activeTopicFilter = selectedTopicByCourse[course.id] || 'all';

        // Group lessons topic-wise by module
        const topicGroups = modules.map((mod, modIdx) => {
          const modLessons = lessons
            .filter((l) => l.moduleId === mod.id)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          return {
            module: mod,
            topicNumber: modIdx + 1,
            lessons: modLessons,
          };
        });

        // Include any lessons not assigned to a known module
        const assignedIds = new Set(topicGroups.flatMap((g) => g.lessons.map((l) => l.id)));
        const unassignedLessons = lessons.filter((l) => !assignedIds.has(l.id));
        if (unassignedLessons.length > 0) {
          topicGroups.push({
            module: {
              id: `${course.id}-general`,
              courseId: course.id,
              title: 'General Lectures',
              order: 999,
              published: true,
            },
            topicNumber: topicGroups.length + 1,
            lessons: unassignedLessons,
          });
        }

        const visibleTopicGroups =
          activeTopicFilter === 'all'
            ? topicGroups
            : topicGroups.filter((g) => g.module.id === activeTopicFilter);

        const totalCourseCompleted = lessons.filter((l) => completedLessonsMap[l.id]).length;

        return (
          <article
            key={course.id}
            className="border border-[#d2dce9] rounded-[18px] bg-[#f8fafc] overflow-hidden transition-all shadow-sm"
          >
            {/* Course Header Button */}
            <button
              onClick={() => toggleCourse(course.id)}
              className="w-full flex items-center gap-3.5 text-left p-5 sm:px-7 sm:py-6 text-[#17253d] min-h-[90px] hover:bg-[#f2f7ff] transition-colors"
              aria-expanded={isOpen}
            >
              <div className="h-12 w-12 rounded-full bg-[#dceaff] text-[#2463eb] flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-semibold text-[#101827] truncate">
                  {course.title}
                </div>
                <div className="text-xs text-[#65748b] truncate mt-0.5">
                  {course.description}
                </div>
              </div>

              <div className="border-l border-[#d0d9e7] pl-3.5 ml-1 hidden sm:flex items-center gap-2">
                {modules.length > 0 && (
                  <span className="border border-[#d2dce9] rounded-full bg-[#f0f5ff] px-3 py-1.5 text-xs text-[#2463eb] font-medium whitespace-nowrap">
                    Topics: {modules.length}
                  </span>
                )}
                <span className="border border-[#d2dce9] rounded-full bg-white px-3.5 py-1.5 text-xs text-[#33445d] font-medium whitespace-nowrap shadow-xs">
                  Lectures:{' '}
                  {lessons.length > 0
                    ? lessons.length
                    : (course as any).lessonCount || (details?.loading ? 'Loading...' : 'Available')}
                </span>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-[#53647c] transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded Topic-Wise Lectures View */}
            {isOpen && (
              <div className="border-t border-[#d2dce9] p-4 sm:px-6 sm:py-5 bg-white space-y-4">
                {details?.loading ? (
                  <div className="py-4 space-y-3">
                    <div className="h-14 rounded-xl bg-[#f0f4f8] animate-pulse" />
                    <div className="h-14 rounded-xl bg-[#f0f4f8] animate-pulse" />
                    <div className="h-14 rounded-xl bg-[#f0f4f8] animate-pulse" />
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#65748b]">
                    No published lectures available for this course yet.
                  </div>
                ) : (
                  <>
                    {/* Topic Filter Bar */}
                    {topicGroups.length > 1 && (
                      <div className="flex flex-col gap-2.5 pb-3 border-b border-[#edf1f7]">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#52647d] uppercase tracking-wider">
                            <Layers className="w-3.5 h-3.5 text-[#2463eb]" />
                            <span>
                              Topic-Wise Curriculum ({topicGroups.length} Topics • {lessons.length} Lectures)
                            </span>
                          </div>
                          <span className="text-xs font-medium text-[#20b36b]">
                            {totalCourseCompleted} of {lessons.length} Lectures Completed
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                          <button
                            onClick={() =>
                              setSelectedTopicByCourse((prev) => ({
                                ...prev,
                                [course.id]: 'all',
                              }))
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                              activeTopicFilter === 'all'
                                ? 'bg-[#2463eb] text-white border-[#2463eb]'
                                : 'bg-[#f8fafc] text-[#33445d] border-[#d2dce9] hover:bg-[#edf4ff] hover:text-[#2463eb]'
                            }`}
                          >
                            All Topics ({topicGroups.length})
                          </button>
                          {topicGroups.map((g) => {
                            const shortLabel = g.module.title.replace(/^Topic\s*\d+:\s*/i, '');
                            const isSelected = activeTopicFilter === g.module.id;
                            return (
                              <button
                                key={g.module.id}
                                onClick={() =>
                                  setSelectedTopicByCourse((prev) => ({
                                    ...prev,
                                    [course.id]: g.module.id,
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                                  isSelected
                                    ? 'bg-[#2463eb] text-white border-[#2463eb]'
                                    : 'bg-[#f8fafc] text-[#33445d] border-[#d2dce9] hover:bg-[#edf4ff] hover:text-[#2463eb]'
                                }`}
                              >
                                {g.topicNumber}. {shortLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Topic-Wise Accordion Sections */}
                    <div className="space-y-3.5">
                      {visibleTopicGroups.map(({ module: mod, topicNumber, lessons: modLessons }) => {
                        const isTopicCollapsed = Boolean(collapsedTopics[mod.id]);
                        const completedInTopic = modLessons.filter(
                          (l) => completedLessonsMap[l.id]
                        ).length;
                        const cleanTopicTitle = mod.title.replace(/^Topic\s*\d+:\s*/i, '');

                        return (
                          <div
                            key={mod.id}
                            className="border border-[#d2dce9] rounded-2xl overflow-hidden bg-[#fbfcfe]"
                          >
                            {/* Topic Header */}
                            <button
                              onClick={() => toggleTopic(mod.id)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-[#f4f7fc] hover:bg-[#ebf2ff] transition-colors text-left"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="px-2.5 py-1 rounded-lg bg-[#dceaff] text-[#2463eb] text-xs font-bold shrink-0">
                                  Topic {String(topicNumber).padStart(2, '0')}
                                </span>
                                <span className="font-semibold text-sm sm:text-base text-[#101827] truncate">
                                  {cleanTopicTitle}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                <span
                                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                                    completedInTopic === modLessons.length && modLessons.length > 0
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-white text-[#52647d] border-[#d2dce9]'
                                  }`}
                                >
                                  {completedInTopic}/{modLessons.length}{' '}
                                  {modLessons.length === 1 ? 'Lecture' : 'Lectures'}
                                </span>
                                <ChevronDown
                                  className={`w-4 h-4 text-[#53647c] transition-transform duration-200 ${
                                    isTopicCollapsed ? '' : 'rotate-180'
                                  }`}
                                />
                              </div>
                            </button>

                            {/* Topic Lectures List */}
                            {!isTopicCollapsed && (
                              <div className="divide-y divide-[#edf1f7] bg-white p-2 sm:p-3 space-y-1">
                                {modLessons.map((lesson, lesIdx) => {
                                  const isCompleted = Boolean(completedLessonsMap[lesson.id]);

                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => handleOpenLesson(course.id, lesson.id)}
                                      className="w-full rounded-xl bg-white hover:bg-[#f0f5ff] flex items-center gap-3.5 text-left p-3 text-[#33445d] hover:text-[#2463eb] transition-colors border border-transparent hover:border-[#dceaff] group"
                                    >
                                      <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm ${
                                          isCompleted
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-[#e8f1ff] text-[#2463eb]'
                                        }`}
                                      >
                                        {isCompleted ? (
                                          <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#2463eb] bg-[#edf4ff] px-2 py-0.5 rounded">
                                            Lecture {topicNumber}.{lesIdx + 1}
                                          </span>
                                          <span className="font-medium text-sm text-[#101827] group-hover:text-[#2463eb] truncate">
                                            {lesson.title}
                                          </span>
                                        </div>
                                        {lesson.description && (
                                          <p className="text-xs text-[#65748b] truncate mt-1">
                                            {lesson.description}
                                          </p>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {lesson.videoId && (
                                          <span className="hidden md:inline-flex items-center gap-1 text-xs font-medium text-[#52647d] bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1 rounded-lg group-hover:border-[#bfdbfe] group-hover:text-[#2463eb]">
                                            <Video className="w-3.5 h-3.5" />
                                            <span>Watch</span>
                                          </span>
                                        )}
                                        <span className="text-base font-semibold text-[#65748b] group-hover:text-[#2463eb] group-hover:translate-x-0.5 transition-transform">
                                          ›
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};
