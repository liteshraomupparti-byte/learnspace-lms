import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Menu,
  FileText,
  Code2,
  Sparkles,
  CheckSquare,
} from 'lucide-react';
import { courseService } from '@/services/courseService';
import { lessonService } from '@/services/lessonService';
import { progressService } from '@/services/progressService';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { LessonSidebar } from '@/components/lessons/LessonSidebar';
import { ResourcePanel } from '@/components/lessons/ResourcePanel';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Toast } from '@/components/common/Toast';
import { PracticeOverview } from '@/components/mcq/PracticeOverview';
import { PracticeSession } from '@/components/mcq/PracticeSession';
import { getQuestionsForTopic } from '@/data/topicMcqData';
import { mcqService } from '@/services/mcqService';
import type { Course, Module, Lesson } from '@/types';
import type { MCQAttempt } from '@/types/mcq';

export const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<(Module & { lessons: Lesson[] })[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileDrawer, setMobileDrawer] = useState<'video' | 'sidebar' | 'resources'>('video');

  // MCQ Practice State
  const isMcqMode = Boolean(lessonId?.endsWith('-mcq'));
  const isCodeMode = Boolean(lessonId?.endsWith('-code'));
  const [mcqState, setMcqState] = useState<'overview' | 'session'>('overview');
  const [mcqAttempts, setMcqAttempts] = useState<MCQAttempt[]>([]);

  const { completedMap, toggleLesson } = useProgress(course ? [course] : []);

  // Fetch course, modules, and all published lessons
  useEffect(() => {
    if (!courseId) return;

    let isMounted = true;
    async function loadCourseContent() {
      setLoading(true);
      try {
        const [c, rawModules, rawLessons] = await Promise.all([
          courseService.getCourseById(courseId!),
          courseService.getModulesByCourse(courseId!, true),
          lessonService.getLessonsByCourse(courseId!, true),
        ]);

        if (!isMounted) return;
        setCourse(c);

        // Group lessons by module
        const grouped = rawModules.map((m) => ({
          ...m,
          lessons: rawLessons.filter((l) => l.moduleId === m.id),
        }));
        setModules(grouped);

        // Handle Coding Practice redirect
        if (lessonId?.endsWith('-code')) {
          const modId = lessonId.replace('-code', '');
          const targetMod = rawModules.find((m) => m.id === modId);
          let targetLang = 'python';
          const text = `${c?.title || ''} ${targetMod?.title || ''}`.toLowerCase();
          if (text.includes('html') || text.includes('css') || text.includes('web')) targetLang = 'web';
          else if (text.includes('c++') || text.includes('cpp')) targetLang = 'cpp';
          else if (text.includes('java')) targetLang = 'java';

          navigate(
            `/playground?lang=${targetLang}&courseId=${courseId}&lessonId=${lessonId}&lessonTitle=${encodeURIComponent(
              `${targetMod?.title || 'Topic'} - Coding Practice`
            )}`,
            { replace: true }
          );
          return;
        }

        // Handle MCQ Practice Virtual Lesson
        if (lessonId?.endsWith('-mcq')) {
          const modId = lessonId.replace('-mcq', '');
          const targetMod = rawModules.find((m) => m.id === modId);
          const virtualLesson: Lesson = {
            id: lessonId,
            courseId: courseId!,
            moduleId: modId,
            title: `${targetMod?.title || 'Topic'} - MCQ Practice`,
            description: 'Topic multiple choice and code ordering practice session.',
            videoProvider: 'youtube',
            videoId: '',
            order: 999,
            published: true,
          };
          setCurrentLesson(virtualLesson);
          setMcqState('overview');

          // Load past attempts
          const attempts = await mcqService.getAttemptsForTopic(
            currentUser?.uid || 'guest',
            modId
          );
          if (isMounted) setMcqAttempts(attempts);
          return;
        }

        // Standard Lesson
        let targetLesson = rawLessons.find((l) => l.id === lessonId);
        if (!targetLesson && rawLessons.length > 0) {
          targetLesson = rawLessons[0];
          navigate(`/lesson/${courseId}/${targetLesson.id}`, { replace: true });
        }
        setCurrentLesson(targetLesson || null);

        // Record activity
        if (currentUser?.uid && targetLesson) {
          const mod = rawModules.find((m) => m.id === targetLesson!.moduleId);
          progressService.recordLessonActivity(
            currentUser.uid,
            courseId!,
            targetLesson.moduleId,
            targetLesson.id,
            c?.title,
            targetLesson.title
          );
        }
      } catch (e) {
        console.error('Error loading lesson page data:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCourseContent();
    return () => {
      isMounted = false;
    };
  }, [courseId, lessonId, currentUser?.uid]);

  // Flattened list of all lessons in display order
  const allLessons = modules.flatMap((m) => m.lessons || []);
  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const handleSelectLesson = (newLessonId: string) => {
    navigate(`/lesson/${courseId}/${newLessonId}`);
    setMobileDrawer('video');
    setMcqState('overview');
  };

  const handleToggleComplete = async () => {
    if (!courseId || !currentLesson) return;
    try {
      const newStatus = await toggleLesson(courseId, currentLesson.id);
      setToastMessage(
        newStatus ? 'Lesson marked as complete! Progress updated.' : 'Lesson marked as incomplete.'
      );
    } catch (err: any) {
      setToastMessage(err.message || 'Failed to update progress.');
    }
  };

  // MCQ Practice completion handler
  const handleCompleteMcqPractice = async (attempt: MCQAttempt) => {
    await mcqService.saveAttempt(attempt);
    setMcqAttempts((prev) => [attempt, ...prev]);

    // Automatically mark the MCQ practice lesson completed if passed
    if (attempt.passed && currentLesson?.id) {
      await toggleLesson(courseId!, currentLesson.id);
      setToastMessage('🎉 MCQ Practice Completed! Mastery badge awarded.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 top-[82px] flex items-center justify-center bg-white z-20">
        <LoadingSpinner label="Loading lesson..." size="lg" />
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-[#101827] mb-2">Lesson Not Found</h2>
        <p className="text-sm text-[#65748b] mb-6">
          The requested lesson or course could not be found. Please select an active lesson from your curriculum.
        </p>
        <button
          onClick={() => navigate('/curriculum')}
          className="px-5 py-2.5 bg-[#2463eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4fd8]"
        >
          Return to Curriculum
        </button>
      </div>
    );
  }

  const activeModule = modules.find((m) => m.id === currentLesson.moduleId);
  const isLessonCompleted = Boolean(completedMap[currentLesson.id]);

  // Questions for current topic
  const topicQuestions = getQuestionsForTopic(
    activeModule?.id || 'mod-py-07',
    activeModule?.title || 'Topic'
  );

  return (
    <div className="fixed inset-0 top-[82px] bg-white z-20 flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Mode Switcher Bar */}
      <div className="md:hidden flex border-b border-[#d2dce9] bg-[#f8faff] shrink-0">
        <button
          onClick={() => setMobileDrawer('sidebar')}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 ${
            mobileDrawer === 'sidebar'
              ? 'text-[#2463eb] border-b-2 border-[#2463eb]'
              : 'text-[#65748b]'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Curriculum</span>
        </button>
        <button
          onClick={() => setMobileDrawer('video')}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 ${
            mobileDrawer === 'video'
              ? 'text-[#2463eb] border-b-2 border-[#2463eb]'
              : 'text-[#65748b]'
          }`}
        >
          <span>{isMcqMode ? 'MCQ Practice' : 'Lesson Video'}</span>
        </button>
        <button
          onClick={() => setMobileDrawer('resources')}
          className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 ${
            mobileDrawer === 'resources'
              ? 'text-[#2463eb] border-b-2 border-[#2463eb]'
              : 'text-[#65748b]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Notes & Details</span>
        </button>
      </div>

      {/* Left Sidebar: Lesson & Topic Navigation */}
      <div
        className={`${
          mobileDrawer === 'sidebar' ? 'block' : 'hidden'
        } md:block h-full shrink-0`}
      >
        <LessonSidebar
          courseId={course.id}
          courseTitle={course.title}
          activeModuleTitle={activeModule?.title}
          activeLessonId={currentLesson.id}
          modules={modules}
          completedMap={completedMap}
          onSelectLesson={handleSelectLesson}
        />
      </div>

      {/* Center: Main Content Area (Video or MCQ Practice) */}
      <div
        className={`${
          mobileDrawer === 'video' ? 'flex' : 'hidden'
        } md:flex flex-1 flex-col h-full overflow-hidden bg-white min-w-0`}
      >
        {isMcqMode ? (
          /* MCQ Practice View (Overview / Session) */
          mcqState === 'session' ? (
            <PracticeSession
              questions={topicQuestions}
              topicTitle={activeModule?.title || 'Topic MCQ Practice'}
              courseId={course.id}
              moduleId={activeModule?.id || ''}
              uid={currentUser?.uid || 'guest'}
              onEndPractice={() => setMcqState('overview')}
              onCompletePractice={handleCompleteMcqPractice}
            />
          ) : (
            <PracticeOverview
              moduleTitle={activeModule?.title || 'Topic'}
              courseTitle={course.title}
              questionCount={topicQuestions.length}
              attempts={mcqAttempts}
              onStartPractice={() => setMcqState('session')}
            />
          )
        ) : (
          /* Standard Lesson Video & Info View */
          <div className="flex-1 flex flex-col h-full overflow-y-auto">
            {/* Topline Header */}
            <div className="h-[62px] border-b border-[#d2dce9] px-6 flex items-center justify-between gap-4 shrink-0">
              <h1 className="text-base sm:text-lg font-semibold text-[#101827] truncate">
                {currentLesson.title}
              </h1>

              {/* Try in Code Playground Button */}
              <button
                onClick={() => {
                  const text = `${course.title} ${currentLesson.title} ${
                    activeModule?.title || ''
                  }`.toLowerCase();
                  let targetLang = 'web';
                  if (text.includes('python')) targetLang = 'python';
                  else if (text.includes('c++') || text.includes('cpp')) targetLang = 'cpp';
                  else if (
                    text.includes(' c ') ||
                    text.startsWith('c ') ||
                    text.includes('c programming')
                  )
                    targetLang = 'c';
                  else if (text.includes('java')) targetLang = 'java';

                  navigate(
                    `/playground?lang=${targetLang}&courseId=${course.id}&lessonId=${
                      currentLesson.id
                    }&lessonTitle=${encodeURIComponent(currentLesson.title)}`
                  );
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 text-xs sm:text-sm font-semibold transition shrink-0 shadow-xs"
                title="Open Interactive Code Playground for this lesson"
              >
                <Code2 size={16} />
                <span className="hidden sm:inline">Try in Code Playground</span>
                <span className="sm:hidden">Playground</span>
                <Sparkles size={13} className="text-amber-500" />
              </button>
            </div>

            {/* Video Area */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between max-w-5xl w-full mx-auto">
              <div className="space-y-4">
                <VideoPlayer
                  videoId={currentLesson.videoId}
                  lessonTitle={currentLesson.title}
                />

                {/* Video Info row */}
                <div className="flex items-center justify-between text-xs text-[#60728b] py-1 border-b border-[#edf1f7]">
                  <span>Topic: {activeModule?.title || 'Course Module'}</span>
                  <span>
                    Lesson {currentIndex + 1} of {allLessons.length}
                  </span>
                </div>
              </div>

              {/* Bottom Lesson Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-4 border-t border-[#edf1f7] mt-6">
                <button
                  onClick={() => prevLesson && handleSelectLesson(prevLesson.id)}
                  disabled={!prevLesson}
                  className="px-4 py-2.5 rounded-xl border border-[#d2dce9] bg-white text-xs sm:text-sm font-medium text-[#32455f] hover:bg-[#f8faff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous lesson</span>
                </button>

                {/* Complete Toggle Button */}
                <button
                  onClick={handleToggleComplete}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-2 ${
                    isLessonCompleted
                      ? 'border-emerald-300 bg-[#e4f9ee] text-[#15975c]'
                      : 'border-[#cdd9eb] bg-white text-[#31435d] hover:bg-[#f5f8ff] hover:text-[#2463eb]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLessonCompleted ? 'Completed' : 'Mark as complete'}</span>
                </button>

                <button
                  onClick={() => nextLesson && handleSelectLesson(nextLesson.id)}
                  disabled={!nextLesson}
                  className="px-4 py-2.5 rounded-xl bg-[#2463eb] text-white text-xs sm:text-sm font-semibold hover:bg-[#1d4fd8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Next lesson</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Resource, Notes, and Details Panel */}
      <div
        className={`${
          mobileDrawer === 'resources' ? 'block' : 'hidden'
        } lg:block h-full shrink-0`}
      >
        <ResourcePanel lesson={currentLesson} />
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};
export default LessonPage;
