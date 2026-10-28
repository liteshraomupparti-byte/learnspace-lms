import { useState, useEffect, useCallback } from 'react';
import { courseService } from '@/services/courseService';
import { lessonService } from '@/services/lessonService';
import { DEFAULT_COURSES, getDefaultLessonsByCourse } from '@/data/curriculumData';
import type { Course, Module, Lesson } from '@/types';

export interface CourseWithDetails extends Course {
  modules?: (Module & { lessons: Lesson[] })[];
  lessonCount: number;
}

const INITIAL_COURSES_WITH_COUNTS: CourseWithDetails[] = DEFAULT_COURSES.map((c) => ({
  ...c,
  lessonCount: getDefaultLessonsByCourse(c.id).length,
}));

export function useCourses() {
  const [courses, setCourses] = useState<CourseWithDetails[]>(INITIAL_COURSES_WITH_COUNTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setError(null);
    try {
      const fetchedCourses = await courseService.getPublishedCourses();

      // Fetch lesson count for each course
      const coursesWithCounts: CourseWithDetails[] = await Promise.all(
        fetchedCourses.map(async (c) => {
          try {
            const lessons = await lessonService.getLessonsByCourse(c.id, true);
            return {
              ...c,
              lessonCount: lessons.length || getDefaultLessonsByCourse(c.id).length,
            };
          } catch (e) {
            return {
              ...c,
              lessonCount: getDefaultLessonsByCourse(c.id).length,
            };
          }
        })
      );

      setCourses(coursesWithCounts);
    } catch (err: any) {
      console.warn('Notice loading courses:', err);
      // Keep initial courses with counts
      setCourses(INITIAL_COURSES_WITH_COUNTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
}
