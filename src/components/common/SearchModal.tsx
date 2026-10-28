import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Layers, PlayCircle, Loader2 } from 'lucide-react';
import { lessonService } from '@/services/lessonService';
import type { Course, Module, Lesson } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    courses: Course[];
    modules: Module[];
    lessons: Lesson[];
  }>({ courses: [], modules: [], lessons: [] });

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ courses: [], modules: [], lessons: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ courses: [], modules: [], lessons: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await lessonService.searchContent(query);
        setResults(res);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.courses.length + results.modules.length + results.lessons.length;

  const handleSelectLesson = (courseId: string, lessonId: string) => {
    onClose();
    navigate(`/lesson/${courseId}/${lessonId}`);
  };

  const handleSelectCourse = (courseId: string) => {
    onClose();
    navigate(`/curriculum?course=${courseId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#d2dce9] overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#d2dce9] bg-[#f8faff]">
          <Search className="w-5 h-5 text-[#65748b]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, modules, and lessons..."
            className="flex-1 bg-transparent border-0 text-[#101827] placeholder-[#8b9bb0] text-base focus:outline-none"
          />
          {loading && <Loader2 className="w-5 h-5 text-[#2463eb] animate-spin" />}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#65748b] hover:bg-[#dceaff] hover:text-[#2463eb] transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query.trim() && (
            <div className="text-center py-8 text-sm text-[#65748b]">
              Type keywords such as <span className="font-semibold text-[#2463eb]">"Python"</span>,{' '}
              <span className="font-semibold text-[#2463eb]">"Loops"</span>, or{' '}
              <span className="font-semibold text-[#2463eb]">"Variables"</span> to search the curriculum.
            </div>
          )}

          {query.trim() && !loading && totalResults === 0 && (
            <div className="text-center py-8 text-sm text-[#65748b]">
              No courses or lessons found matching "{query}".
            </div>
          )}

          {/* Lessons */}
          {results.lessons.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#65748b] px-3 mb-2 flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-[#2463eb]" /> Lessons ({results.lessons.length})
              </div>
              <div className="space-y-1">
                {results.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson.courseId, lesson.id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#f0f5ff] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#101827] group-hover:text-[#2463eb]">
                        {lesson.title}
                      </div>
                      <div className="text-xs text-[#65748b] line-clamp-1 mt-0.5">
                        {lesson.description || 'Lesson topic'}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-[#dceaff] text-[#2463eb] font-medium shrink-0 ml-2">
                      Jump to lesson →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {results.courses.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#65748b] px-3 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#a855f7]" /> Courses ({results.courses.length})
              </div>
              <div className="space-y-1">
                {results.courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleSelectCourse(course.id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#f8faff] flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#101827] group-hover:text-[#2463eb]">
                        {course.title}
                      </div>
                      <div className="text-xs text-[#65748b] line-clamp-1 mt-0.5">
                        {course.description}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-[#edf1f7] text-[#33445d] font-medium shrink-0 ml-2">
                      View curriculum →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
