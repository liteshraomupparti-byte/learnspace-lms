import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Play,
  FileText,
  CheckSquare,
  Code2,
  Check,
  Video,
} from 'lucide-react';
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
    const initial: Record<string, boolean> = {};
    modules.forEach((m) => {
      const hasActive =
        m.lessons?.some((l) => l.id === activeLessonId) ||
        activeLessonId === `${m.id}-mcq` ||
        activeLessonId === `${m.id}-code`;
      if (hasActive) {
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
      return <FileText className="w-4 h-4 text-[#8b5cf6]" />;
    }
    if (lower.includes('quiz') || lower.includes('mcq')) {
      return <CheckSquare className="w-4 h-4 text-[#a855f7]" />;
    }
    if (lower.includes('practice') || lower.includes('coding')) {
      return <Code2 className="w-4 h-4 text-[#10b981]" />;
    }
    return <Video className="w-4 h-4 text-[#2563eb]" />;
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
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {modules.map((mod) => {
          const isOpen =
            openModules[mod.id] ??
            (mod.lessons?.some((l) => l.id === activeLessonId) ||
              activeLessonId === `${mod.id}-mcq` ||
              activeLessonId === `${mod.id}-code`);

          const mcqId = `${mod.id}-mcq`;
          const codeId = `${mod.id}-code`;
          const isMcqCompleted = Boolean(completedMap[mcqId]);
          const isCodeCompleted = Boolean(completedMap[codeId]);

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
                <span className="flex-1 truncate font-semibold">{mod.title}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#53647c] transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-2 pb-2 pt-0.5 space-y-1">
                  {/* Module Video & Reading Lessons */}
                  {mod.lessons?.map((lesson) => {
                    const isSelected = lesson.id === activeLessonId;
                    const isCompleted = Boolean(completedMap[lesson.id]);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs leading-relaxed text-left transition-colors ${
                          isSelected
                            ? 'bg-[#edf4ff] text-[#2463eb] font-semibold border-l-2 border-[#2463eb]'
                            : 'text-[#273951] hover:bg-[#f0f5ff]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="shrink-0">{getLessonIcon(lesson.title)}</span>
                          <span className="truncate">{lesson.title}</span>
                        </div>

                        {/* Circular Status Indicator (matching reference screenshot 1) */}
                        <div className="shrink-0 ml-2">
                          {isCompleted ? (
                            <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-2xs">
                              <Check size={11} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {/* Topic MCQ Practice Item (matching reference screenshot 1) */}
                  <button
                    onClick={() => onSelectLesson(mcqId)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs leading-relaxed text-left transition-colors ${
                      activeLessonId === mcqId
                        ? 'bg-[#edf4ff] text-[#2463eb] font-bold border-l-2 border-[#2463eb]'
                        : 'text-[#273951] hover:bg-[#f0f5ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <CheckSquare className="w-4 h-4 text-[#a855f7] shrink-0" />
                      <span className="truncate font-semibold">MCQ Practice</span>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isMcqCompleted ? (
                        <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-2xs">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </button>

                  {/* Topic Coding Practice Item (matching reference screenshot 1) */}
                  <button
                    onClick={() => onSelectLesson(codeId)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs leading-relaxed text-left transition-colors ${
                      activeLessonId === codeId
                        ? 'bg-[#edf4ff] text-[#2463eb] font-bold border-l-2 border-[#2463eb]'
                        : 'text-[#273951] hover:bg-[#f0f5ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Code2 className="w-4 h-4 text-[#10b981] shrink-0" />
                      <span className="truncate font-semibold">Coding Practice</span>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isCodeCompleted ? (
                        <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-2xs">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
