import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Check,
  Star,
  ThumbsUp,
  ThumbsDown,
  Info,
  Play,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { INITIAL_COURSES } from '@/data/curriculumData';

export type SessionType = 'Lecture' | 'Practice' | 'Break';

export interface ScheduledSession {
  id: string;
  type: SessionType;
  title: string;
  courseId?: string;
  courseTitle?: string;
  topicBadge?: string;
  lessonId?: string;
  description?: string;
  notes?: string;
  // Saved user state
  completed: boolean;
  clarityRating?: number; // 1..5
  qualityRating?: number; // 1..5
  repeatVote?: 'up' | 'down' | null;
  mentorFeedback?: 'clears' | 'partly' | 'doesnt' | null;
  mentorRating?: number; // 1..5
}

export interface DayTimetableState {
  dateKey: string;
  sessions: ScheduledSession[];
  manuallyToggled?: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'learnspace_timetable_v3';
const CLASSES_START_DATE = '2026-10-29'; // Thursday, October 29, 2026

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function daysBetween(startKey: string, endKey: string): number {
  const d1 = parseDateKey(startKey);
  const d2 = parseDateKey(endKey);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

// Build realistic curriculum timetable starting from October 29, 2026 (Day 0 = Oct 29, Day 1 = Oct 30, etc.)
function buildCurriculumForDate(dateKey: string, isPastDate: boolean): ScheduledSession[] {
  const dayIndex = daysBetween(CLASSES_START_DATE, dateKey);
  if (dayIndex < 0) {
    return [];
  }

  const pyCourse = INITIAL_COURSES[0]; // Python (16 topics)
  const webCourse = INITIAL_COURSES[1]; // Web Dev (4 topics)
  const quantCourse = INITIAL_COURSES[2]; // Quant Aptitude (4 topics)
  const genaiCourse = INITIAL_COURSES[3]; // GenAI (3 topics)
  const engCourse = INITIAL_COURSES[4]; // English (3 topics)

  const pyMod = pyCourse.modules[dayIndex % pyCourse.modules.length];
  const pyPrimaryLesson = pyMod.lessons[0];
  const pySecondaryLesson = pyMod.lessons[1] || pyMod.lessons[0];
  const cleanPyTopic = pyMod.title.replace(/^Topic\s*\d+:\s*/i, '');

  // Secondary track alternates between Quant Aptitude, Web Dev, GenAI, and Communicative English
  const secondTrackCourses = [quantCourse, webCourse, genaiCourse, engCourse];
  const trackCourse = secondTrackCourses[dayIndex % secondTrackCourses.length];
  const trackMod = trackCourse.modules[Math.floor(dayIndex / 2) % trackCourse.modules.length];
  const trackLesson = trackMod.lessons[dayIndex % trackMod.lessons.length];
  const cleanTrackTopic = trackMod.title.replace(/^Topic\s*\d+:\s*/i, '');

  // Afternoon track
  const thirdTrackCourse = secondTrackCourses[(dayIndex + 1) % secondTrackCourses.length];
  const thirdMod = thirdTrackCourse.modules[dayIndex % thirdTrackCourse.modules.length];
  const thirdLesson = thirdMod.lessons[0];
  const cleanThirdTopic = thirdMod.title.replace(/^Topic\s*\d+:\s*/i, '');

  return [
    {
      id: `${dateKey}-lec-1`,
      type: 'Lecture',
      title: pyPrimaryLesson.title,
      courseId: pyCourse.id,
      courseTitle: pyCourse.title,
      topicBadge: `Python • ${cleanPyTopic}`,
      lessonId: pyPrimaryLesson.id,
      description: pyPrimaryLesson.description,
      notes: pyPrimaryLesson.notes,
      completed: isPastDate,
      clarityRating: 0,
      qualityRating: 0,
      repeatVote: null,
    },
    {
      id: `${dateKey}-prac-1`,
      type: 'Practice',
      title: `MCQ Practice: ${cleanPyTopic}`,
      courseId: pyCourse.id,
      courseTitle: pyCourse.title,
      topicBadge: `Hands-on Practice • ${cleanPyTopic}`,
      lessonId: pySecondaryLesson.id,
      description: `Interactive problem-solving walkthrough and coding exercises on ${cleanPyTopic}.`,
      notes: pySecondaryLesson.notes,
      completed: isPastDate,
      mentorFeedback: null,
      mentorRating: 0,
    },
    {
      id: `${dateKey}-break-1`,
      type: 'Break',
      title: 'Break',
      topicBadge: 'Short Breather & Note Review',
      description: 'Take a short break, hydrate, and review your key lecture takeaways before the next session.',
      completed: isPastDate,
    },
    {
      id: `${dateKey}-lec-2`,
      type: 'Lecture',
      title: trackLesson.title,
      courseId: trackCourse.id,
      courseTitle: trackCourse.title,
      topicBadge: `${trackCourse.title.split(' ')[0]} • ${cleanTrackTopic}`,
      lessonId: trackLesson.id,
      description: trackLesson.description,
      notes: trackLesson.notes,
      completed: isPastDate,
      clarityRating: 0,
      qualityRating: 0,
      repeatVote: null,
    },
    {
      id: `${dateKey}-break-lunch`,
      type: 'Break',
      title: 'Lunch',
      topicBadge: 'Midday Recharge',
      description: 'Lunch break and peer discussion window.',
      completed: isPastDate,
    },
    {
      id: `${dateKey}-lec-3`,
      type: 'Lecture',
      title: thirdLesson.title,
      courseId: thirdTrackCourse.id,
      courseTitle: thirdTrackCourse.title,
      topicBadge: `${thirdTrackCourse.title.split(' ')[0]} • ${cleanThirdTopic}`,
      lessonId: thirdLesson.id,
      description: thirdLesson.description,
      notes: thirdLesson.notes,
      completed: isPastDate,
      clarityRating: 0,
      qualityRating: 0,
      repeatVote: null,
    },
    {
      id: `${dateKey}-prac-2`,
      type: 'Practice',
      title: `${cleanTrackTopic} + ${cleanThirdTopic} Practice`,
      courseId: thirdTrackCourse.id,
      courseTitle: thirdTrackCourse.title,
      topicBadge: `Guided Practice • ${cleanThirdTopic}`,
      lessonId: thirdLesson.id,
      description: `Guided practice session combining ${cleanTrackTopic} and ${cleanThirdTopic} concepts.`,
      notes: thirdLesson.notes,
      completed: isPastDate,
      mentorFeedback: null,
      mentorRating: 0,
    },
  ];
}

export const ScheduleWidget: React.FC = () => {
  const navigate = useNavigate();
  const realTodayKey = useMemo(() => toDateKey(new Date()), []);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(realTodayKey);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarPopoverRef = useRef<HTMLDivElement>(null);

  // Load saved state map from localStorage
  const [savedDaysMap, setSavedDaysMap] = useState<Record<string, DayTimetableState>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return {};
  });

  // Close calendar popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarPopoverRef.current && !calendarPopoverRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDateInPast = selectedDateKey < realTodayKey;
  const isBeforeStart = selectedDateKey < CLASSES_START_DATE;

  // Compute or retrieve sessions for the selected date
  const currentSessions: ScheduledSession[] = useMemo(() => {
    if (isBeforeStart) return [];

    const existing = savedDaysMap[selectedDateKey];
    if (existing && existing.sessions && existing.sessions.length > 0) {
      // If the day has passed and wasn't manually toggled, ensure sessions are marked complete
      if (isDateInPast && !existing.manuallyToggled) {
        return existing.sessions.map((s) => ({ ...s, completed: true }));
      }
      return existing.sessions;
    }

    return buildCurriculumForDate(selectedDateKey, isDateInPast);
  }, [selectedDateKey, savedDaysMap, isBeforeStart, isDateInPast]);

  // Automatically persist any visited curriculum day (>= Oct 29) so it remains saved and accessible anytime
  useEffect(() => {
    if (isBeforeStart) return;
    setSavedDaysMap((prev) => {
      const existing = prev[selectedDateKey];
      if (existing) {
        if (isDateInPast && !existing.manuallyToggled && existing.sessions.some((s) => !s.completed)) {
          const autoMarked = {
            ...existing,
            sessions: existing.sessions.map((s) => ({ ...s, completed: true })),
            updatedAt: new Date().toISOString(),
          };
          const next = { ...prev, [selectedDateKey]: autoMarked };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        }
        return prev;
      }
      const generated = buildCurriculumForDate(selectedDateKey, isDateInPast);
      const next = {
        ...prev,
        [selectedDateKey]: {
          dateKey: selectedDateKey,
          sessions: generated,
          manuallyToggled: false,
          updatedAt: new Date().toISOString(),
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [selectedDateKey, isBeforeStart, isDateInPast]);

  const persistSessions = (updatedSessions: ScheduledSession[], manuallyToggled = true) => {
    setSavedDaysMap((prev) => {
      const next = {
        ...prev,
        [selectedDateKey]: {
          dateKey: selectedDateKey,
          sessions: updatedSessions,
          manuallyToggled,
          updatedAt: new Date().toISOString(),
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleSessionComplete = (sessionId: string) => {
    const next = currentSessions.map((s) =>
      s.id === sessionId ? { ...s, completed: !s.completed } : s
    );
    persistSessions(next, true);
  };

  const markAllSessionsForDay = () => {
    const allCompleted = currentSessions.every((s) => s.completed);
    const next = currentSessions.map((s) => ({ ...s, completed: !allCompleted }));
    persistSessions(next, true);
  };

  const handleStartSession = (session: ScheduledSession) => {
    if (!session.completed) {
      const next = currentSessions.map((s) =>
        s.id === session.id ? { ...s, completed: true } : s
      );
      persistSessions(next, true);
    }
    if (session.courseId && session.lessonId) {
      navigate(`/lesson/${session.courseId}/${session.lessonId}`);
    }
  };

  const updateSessionFeedback = (
    sessionId: string,
    patch: Partial<
      Pick<
        ScheduledSession,
        'clarityRating' | 'qualityRating' | 'repeatVote' | 'mentorFeedback' | 'mentorRating'
      >
    >
  ) => {
    const next = currentSessions.map((s) => (s.id === sessionId ? { ...s, ...patch } : s));
    persistSessions(next, savedDaysMap[selectedDateKey]?.manuallyToggled ?? false);
  };

  const toggleDetails = (sessionId: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));
  };

  const stepDay = (delta: number) => {
    const d = parseDateKey(selectedDateKey);
    d.setDate(d.getDate() + delta);
    setSelectedDateKey(toDateKey(d));
  };

  const selectedDateObj = parseDateKey(selectedDateKey);
  const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isToday = selectedDateKey === realTodayKey;
  const completedCount = currentSessions.filter((s) => s.completed).length;

  const getTypePillStyle = (type: SessionType) => {
    switch (type) {
      case 'Lecture':
        return 'bg-[#ede9fe] text-[#6d28d9]';
      case 'Practice':
        return 'bg-[#dceaff] text-[#1d4ed8]';
      case 'Break':
        return 'bg-[#d5f5f6] text-[#0e7490]';
    }
  };

  return (
    <section className="bg-white border border-[#d2dce9] rounded-[21px] overflow-hidden shadow-sm">
      {/* Original Clean Header Design */}
      <div className="p-6 border-b border-[#d2dce9] relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-[#101827]">
            Your Schedule
          </h2>

          {/* Calendar Button with Clean Date Popover */}
          <div className="relative" ref={calendarPopoverRef}>
            <button
              onClick={() => setCalendarOpen((prev) => !prev)}
              className="text-[#2463eb] hover:bg-[#f0f5ff] px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <CalendarIcon className="w-5 h-5" />
              <span>Calendar</span>
            </button>

            {calendarOpen && (
              <div className="absolute right-0 top-10 z-30 w-72 bg-white border border-[#d2dce9] rounded-2xl shadow-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-[#101827] flex items-center justify-between">
                  <span>Jump to Date</span>
                  <button
                    onClick={() => {
                      setSelectedDateKey(realTodayKey);
                      setCalendarOpen(false);
                    }}
                    className="text-[#2463eb] hover:underline"
                  >
                    Today
                  </button>
                </div>

                <input
                  type="date"
                  value={selectedDateKey}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDateKey(e.target.value);
                      setCalendarOpen(false);
                    }
                  }}
                  className="w-full border border-[#d2dce9] rounded-xl px-3 py-2 text-sm text-[#101827] focus:outline-none focus:border-[#2463eb]"
                />

                <div className="pt-2 border-t border-[#edf1f7] space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#65748b] uppercase tracking-wider">
                    Class Schedule (Starts Oct 29)
                  </div>
                  {[0, 1, 2, 3, 4].map((offset) => {
                    const d = parseDateKey(CLASSES_START_DATE);
                    d.setDate(d.getDate() + offset);
                    const k = toDateKey(d);
                    const saved = savedDaysMap[k];
                    const done = saved?.sessions?.filter((s) => s.completed).length || 0;
                    const tot = saved?.sessions?.length || 7;
                    return (
                      <button
                        key={k}
                        onClick={() => {
                          setSelectedDateKey(k);
                          setCalendarOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          selectedDateKey === k
                            ? 'bg-[#dceaff] text-[#2463eb] font-semibold'
                            : 'hover:bg-[#f8fafc] text-[#33445d]'
                        }`}
                      >
                        <span>
                          Day {offset + 1}:{' '}
                          {d.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-[11px] text-[#16a34a] font-medium">
                          {done}/{tot} ✓
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Date Navigation Row */}
        <div className="grid grid-cols-[30px_1fr_30px] items-center gap-4 text-center text-base font-medium">
          <button
            onClick={() => stepDay(-1)}
            className="text-2xl text-[#111827] hover:text-[#2463eb] transition-colors leading-none"
            aria-label="Previous day"
          >
            ‹
          </button>
          <div className="flex items-center justify-center flex-wrap gap-2">
            <span className="text-[#101827]">{formattedDate}</span>
            {isToday && (
              <span className="bg-[#dceaff] text-[#2463eb] rounded-full px-3 py-1 text-xs font-semibold">
                Today
              </span>
            )}
          </div>
          <button
            onClick={() => stepDay(1)}
            className="text-2xl text-[#111827] hover:text-[#2463eb] transition-colors leading-none"
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </div>

      {/* Body: Before Classes Start (Oct 28 & earlier) vs Classes Timetable (Oct 29 onwards) */}
      {isBeforeStart ? (
        <div className="min-h-[250px] flex flex-col items-center justify-center relative overflow-hidden py-8 px-4">
          <div className="calendar-art">
            <div className="calendar-grid" />
          </div>
          <div className="calendar-person">
            <div className="person-hair" />
            <div className="person-head" />
            <div className="person-body" />
            <div className="person-arm" />
            <div className="person-leg left" />
            <div className="person-leg right" />
          </div>

          <div className="mt-5 z-10 text-center">
            <p className="text-xs sm:text-sm text-[#65748b] mb-2">
              Classes are scheduled from{' '}
              <strong className="text-[#101827]">Thursday, October 29, 2026</strong> onwards.
            </p>
            <button
              onClick={() => setSelectedDateKey(CLASSES_START_DATE)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#edf4ff] hover:bg-[#dceaff] text-[#2463eb] text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Tomorrow&apos;s Class Timetable (Oct 29) →</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-7">
          {/* Subtle Day Progress & Mark Day Complete Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5 pb-3 border-b border-[#edf1f7]">
            <div className="flex items-center gap-2 text-xs text-[#52647d]">
              <span className="font-semibold text-[#101827]">
                Day {daysBetween(CLASSES_START_DATE, selectedDateKey) + 1} Schedule
              </span>
              <span>•</span>
              <span className="text-[#16a34a] font-medium">
                {completedCount} of {currentSessions.length} sessions marked
              </span>
            </div>

            <button
              onClick={markAllSessionsForDay}
              className="text-xs font-medium text-[#2463eb] hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {completedCount === currentSessions.length
                  ? 'Unmark Day'
                  : 'Mark Day as Completed'}
              </span>
            </button>
          </div>

          {/* Vertical Timeline Container (Matches Attached Reference Screenshots) */}
          <div className="relative pl-10 sm:pl-12 space-y-5 before:content-[''] before:absolute before:left-[15px] sm:before:left-[17px] before:top-4 before:bottom-4 before:w-[2px] before:bg-[#d2dce9]">
            {currentSessions.map((session) => {
              const isExpanded = Boolean(expandedDetails[session.id]);

              return (
                <div key={session.id} className="relative">
                  {/* Left Timeline Checkmark Circle Node */}
                  <button
                    onClick={() => toggleSessionComplete(session.id)}
                    title={
                      session.completed
                        ? 'Marked complete (Click to toggle)'
                        : 'Click to mark session complete'
                    }
                    aria-label="Toggle session completion"
                    className="absolute -left-10 sm:-left-12 top-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#d2dce9] flex items-center justify-center z-10 hover:scale-105 transition-transform shadow-2xs"
                  >
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors ${
                        session.completed
                          ? 'bg-[#1ea952] text-white'
                          : 'bg-[#e2e8f0] text-white hover:bg-[#1ea952]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  </button>

                  {/* Session Card */}
                  <div
                    className={`rounded-[18px] border bg-white p-5 sm:p-6 transition-all ${
                      session.completed
                        ? 'border-[#86efac] shadow-[0_1px_4px_rgba(30,169,82,0.06)]'
                        : 'border-[#bbf7d0] hover:border-[#86efac]'
                    }`}
                  >
                    {/* Top Row: Type Pill + Topic Tag on Left, Actions on Right (No Clock Times!) */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className={`px-3.5 py-1 rounded-full text-xs sm:text-[13px] font-semibold ${getTypePillStyle(
                            session.type
                          )}`}
                        >
                          {session.type}
                        </span>
                        {session.topicBadge && (
                          <span className="text-xs font-medium text-[#64748b]">
                            {session.topicBadge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {session.courseId && session.lessonId && (
                          <button
                            onClick={() => handleStartSession(session)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf4ff] hover:bg-[#2463eb] text-[#2463eb] hover:text-white text-xs font-semibold transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>
                              {session.type === 'Practice' ? 'Start Practice' : 'Start Lecture'}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => toggleDetails(session.id)}
                          className="text-xs sm:text-[13px] font-medium text-[#2463eb] underline hover:text-[#1d4fd8] transition-colors"
                        >
                          {isExpanded ? 'Hide Details' : 'Show Details'}
                        </button>
                      </div>
                    </div>

                    {/* Session Title */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <h3
                        onClick={() =>
                          session.courseId && session.lessonId && handleStartSession(session)
                        }
                        className={`text-base sm:text-[17px] font-bold text-[#101827] ${
                          session.courseId && session.lessonId
                            ? 'cursor-pointer hover:text-[#2463eb] transition-colors'
                            : ''
                        }`}
                      >
                        {session.title}
                      </h3>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="mt-3.5 p-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs sm:text-sm text-[#33445d] space-y-2">
                        {session.description && <p>{session.description}</p>}
                        {session.notes && (
                          <div className="p-2.5 rounded-lg bg-white border-l-3 border-l-[#2463eb] text-xs text-[#475569]">
                            <strong className="text-[#101827]">Key Concept: </strong>
                            {session.notes}
                          </div>
                        )}
                        {session.courseId && session.lessonId && (
                          <div className="pt-1">
                            <button
                              onClick={() => handleStartSession(session)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2463eb] hover:underline"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Open Full Video Lecture & Notes in Portal →</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lecture Feedback Block (Matches Reference Screenshot) */}
                    {session.type === 'Lecture' && (
                      <div className="mt-4 pt-4 border-t border-[#e5e7eb] space-y-3 text-xs sm:text-[13.5px] text-[#374151]">
                        {/* Session Clarity */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="min-w-[120px] font-medium">
                            Session Clarity <span className="text-red-500">*</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = (session.clarityRating || 0) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    updateSessionFeedback(session.id, { clarityRating: star })
                                  }
                                  className="p-0.5 text-[#4b5563] hover:scale-110 transition-transform"
                                  aria-label={`Rate clarity ${star} stars`}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      active
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-[#4b5563] stroke-[1.5]'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Teaching Quality */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="min-w-[120px] font-medium">
                            Teaching Quality <span className="text-red-500">*</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = (session.qualityRating || 0) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    updateSessionFeedback(session.id, { qualityRating: star })
                                  }
                                  className="p-0.5 text-[#4b5563] hover:scale-110 transition-transform"
                                  aria-label={`Rate teaching quality ${star} stars`}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      active
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-[#4b5563] stroke-[1.5]'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Repeat Session Question */}
                        <div className="flex items-center gap-3 flex-wrap pt-0.5">
                          <span className="font-medium flex items-center gap-1.5">
                            <span>Would you like this session to be repeated?</span>
                            <Info className="w-3.5 h-3.5 text-[#6b7280]" />
                          </span>
                          <div className="flex items-center gap-2.5 ml-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateSessionFeedback(session.id, {
                                  repeatVote: session.repeatVote === 'up' ? null : 'up',
                                })
                              }
                              className={`p-1 rounded-md transition-colors ${
                                session.repeatVote === 'up'
                                  ? 'text-[#2463eb] bg-[#edf4ff]'
                                  : 'text-[#6b7280] hover:text-[#111827]'
                              }`}
                              aria-label="Yes, repeat session"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateSessionFeedback(session.id, {
                                  repeatVote: session.repeatVote === 'down' ? null : 'down',
                                })
                              }
                              className={`p-1 rounded-md transition-colors ${
                                session.repeatVote === 'down'
                                  ? 'text-[#2463eb] bg-[#edf4ff]'
                                  : 'text-[#6b7280] hover:text-[#111827]'
                              }`}
                              aria-label="No need to repeat"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-[#6b7280] pt-0.5">
                          <span className="text-red-500">*</span> Your feedback is anonymous
                        </p>
                      </div>
                    )}

                    {/* Practice Feedback Block (Matches Reference Screenshot) */}
                    {session.type === 'Practice' && (
                      <div className="mt-4 pt-4 border-t border-[#e5e7eb] space-y-3 text-xs sm:text-[13.5px] text-[#374151]">
                        <div className="font-medium">
                          How is your mentor guiding you? <span className="text-red-500">*</span>
                        </div>
                        <div className="flex items-center gap-5 flex-wrap pt-0.5">
                          {[
                            { key: 'clears', label: 'Clears doubts' },
                            { key: 'partly', label: 'Partly clears doubts' },
                            { key: 'doesnt', label: "Doesn't clear doubts" },
                          ].map((opt) => {
                            const selected = session.mentorFeedback === opt.key;
                            return (
                              <label
                                key={opt.key}
                                onClick={() =>
                                  updateSessionFeedback(session.id, {
                                    mentorFeedback: opt.key as any,
                                  })
                                }
                                className="inline-flex items-center gap-2 cursor-pointer select-none"
                              >
                                <span
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                    selected
                                      ? 'border-[#2463eb]'
                                      : 'border-[#cbd5e1] bg-white'
                                  }`}
                                >
                                  {selected && (
                                    <span className="w-2 h-2 rounded-full bg-[#2463eb]" />
                                  )}
                                </span>
                                <span className="text-[#374151]">{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Mentor Supportiveness Star Rating */}
                        <div className="flex items-center gap-3 flex-wrap pt-1">
                          <span className="min-w-[120px] font-medium">
                            Mentor Support <span className="text-red-500">*</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = (session.mentorRating || 0) >= star;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    updateSessionFeedback(session.id, { mentorRating: star })
                                  }
                                  className="p-0.5 text-[#4b5563] hover:scale-110 transition-transform"
                                  aria-label={`Rate mentor support ${star} stars`}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      active
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-[#4b5563] stroke-[1.5]'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <p className="text-xs text-[#6b7280] pt-0.5">
                          <span className="text-red-500">*</span> Your feedback is anonymous
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
