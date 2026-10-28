import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, ChevronDown, CheckCircle2, Play, FileText, CheckSquare, HelpCircle } from 'lucide-react';
import type { Module, Lesson } from '@/types';

interface LessonSidebarProps {
  courseId: string;
  courseTitle: string;
  activeModuleTitle?: string;
  activeLessonId: string;
  modules: (Module & { lessons: Lesson[] })[];
  completedMap: Record<string, boolean>;
  onSelectLesson: (lessonId: string) => void;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  courseId,
  courseTitle,
  activeModuleTitle,
  activeLessonId,
  modules,
  completedMap,
  onSelectLesson,
}) => {
  // Track open state for each module accordion in the sidebar
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    // Default open module is the one containing the active lesson
    const initial: Record<string, boolean> = {};
    modules.forEach((m) => {
      if (m.lessons?.some((l) => l.id === activeLessonId)) {
        initial[m.id] = true;
      }
    });
    return initial;
  });

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const getLessonIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('reading') || lower.includes('material')) {
      return <FileText className="w-4 h-4 text-[#a855f7]" />;
    }
    if (lower.includes('quiz') || lower.includes('mcq')) {
      return <HelpCircle className="w-4 h-4 text-amber-500" />;
    }
    if (lower.includes('practice') || lower.includes('walkthrough')) {
      return <CheckSquare className="w-4 h-4 text-emerald-500" />;
    }
    return <Play className="w-4 h-4 text-[#2463eb]" />;
  };

  return (
    <aside className="w-full md:w-[312px] bg-white border-r border-[#d2dce9] flex flex-col h-full overflow-hidden shrink-0">
      {/* Breadcrumbs */}
      <div className="h-[62px] border-b border-[#d2dce9] px-4 flex items-center gap-2 text-sm text-[#52647d] whitespace-nowrap overflow-x-auto shrink-0">
        <Link
          to="/curriculum"
          className="text-[#52647d] hover:text-[#2463eb] p-1 rounded-md transition-colors"
          title="Back to Curriculum"
        >
          <Home className="w-4 h-4" />
        </Link>
        <span className="text-[#94a3b8]">/</span>
        <Link
          to={`/curriculum?course=${courseId}`}
          className="hover:text-[#2463eb] truncate max-w-[120px] transition-colors"
        >
          {courseTitle}
        </Link>
        {activeModuleTitle && (
          <>
            <span className="text-[#94a3b8]">/</span>
            <span className="text-[#101827] font-medium truncate max-w-[100px]">
              {activeModuleTitle}
            </span>
          </>
        )}
      </div>

      {/* Module Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {modules.map((mod) => {
          const isOpen = openModules[mod.id] ?? mod.lessons?.some((l) => l.id === activeLessonId);

          return (
            <div
              key={mod.id}
              className="border border-[#d2dce9] rounded-xl overflow-hidden bg-white shadow-2xs"
            >
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center gap-2.5 p-3.5 text-left text-sm font-medium text-[#101827] hover:bg-[#f8faff] transition-colors"
              >
                <span className="text-base text-[#a044f4]">▱</span>
                <span className="flex-1 truncate">{mod.title}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#53647c] transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-2 pb-2 pt-0.5 space-y-1">
                  {mod.lessons?.map((lesson) => {
                    const isSelected = lesson.id === activeLessonId;
                    const isCompleted = Boolean(completedMap[lesson.id]);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs leading-relaxed text-left transition-colors ${
                          isSelected
                            ? 'bg-[#edf4ff] text-[#2463eb] font-semibold'
                            : 'text-[#273951] hover:bg-[#f0f5ff]'
                        }`}
                      >
                        <span className="shrink-0">{getLessonIcon(lesson.title)}</span>
                        <span className="flex-1 truncate">{lesson.title}</span>
                        {isCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#20b36b] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
