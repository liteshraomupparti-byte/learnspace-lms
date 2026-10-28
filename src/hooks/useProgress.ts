import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { progressService } from '@/services/progressService';
import { lessonService } from '@/services/lessonService';
import { DEFAULT_COURSES } from '@/data/curriculumData';
import type { LessonActivity, CourseProgressSummary } from '@/types';

export function useProgress(courses: { id: string; title: string; lessonCount?: number }[] = []) {
  const { currentUser } = useAuth();
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [courseSummaries, setCourseSummaries] = useState<CourseProgressSummary[]>([]);
  const [recentActivities, setRecentActivities] = useState<LessonActivity[]>([]);
  const [overallPercentage, setOverallPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    const activeUid = currentUser?.uid || 'guest';

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch user completions (Firestore + Local fallback)
      const allProgress = await progressService.getAllUserProgress(activeUid);
      const compMap: Record<string, boolean> = {};
      allProgress.forEach((p) => {
        if (p.completed) {
          compMap[p.lessonId] = true;
        }
      });
      setCompletedMap(compMap);

      // 2. Fetch recent activities
      const activities = await progressService.getRecentActivities(activeUid, 6);
      setRecentActivities(activities);

      // 3. Calculate summaries for each course
      let totalAllLessons = 0;
      let completedAllLessons = 0;

      const targetCourses = courses.length > 0 ? courses : DEFAULT_COURSES;

      const summaries: CourseProgressSummary[] = await Promise.all(
        targetCourses.map(async (c) => {
          try {
            const lessons = await lessonService.getLessonsByCourse(c.id, true);
            const total = lessons.length;
            const completed = lessons.filter((l) => compMap[l.id]).length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            totalAllLessons += total;
            completedAllLessons += completed;

            const lastAct = activities.find((a) => a.courseId === c.id);

            return {
              courseId: c.id,
              courseTitle: c.title,
              totalLessons: total,
              completedLessons: completed,
              percentage,
              lastAccessedLessonId:
                lastAct?.lessonId || (lessons.length > 0 ? lessons[0].id : undefined),
              lastAccessedLessonTitle:
                lastAct?.lessonTitle || (lessons.length > 0 ? `Start Lesson 01: ${lessons[0].title}` : undefined),
            };
          } catch (e) {
            return {
              courseId: c.id,
              courseTitle: c.title,
              totalLessons: 0,
              completedLessons: 0,
              percentage: 0,
            };
          }
        })
      );

      setCourseSummaries(summaries);
      setOverallPercentage(
        totalAllLessons > 0 ? Math.round((completedAllLessons / totalAllLessons) * 100) : 0
      );
    } catch (err: any) {
      console.warn('Notice in useProgress hook:', err);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, courses.length]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const toggleLesson = async (
    courseId: string,
    lessonId: string
  ): Promise<boolean> => {
    if (!currentUser?.uid) {
      throw new Error('You must be signed in to save course progress.');
    }

    const currentStatus = Boolean(completedMap[lessonId]);
    const newStatus = !currentStatus;

    // Optimistic update
    setCompletedMap((prev) => ({
      ...prev,
      [lessonId]: newStatus,
    }));

    try {
      await progressService.toggleLessonProgress(
        currentUser.uid,
        courseId,
        lessonId,
        newStatus
      );
      // Trigger background recalculation
      fetchProgress();
      return newStatus;
    } catch (err) {
      // Revert on failure
      setCompletedMap((prev) => ({
        ...prev,
        [lessonId]: currentStatus,
      }));
      throw err;
    }
  };

  return {
    completedMap,
    courseSummaries,
    recentActivities,
    overallPercentage,
    loading,
    error,
    toggleLesson,
    refetch: fetchProgress,
  };
}
