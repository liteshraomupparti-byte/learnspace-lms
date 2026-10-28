import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Lesson, Course, Module } from '@/types';
import {
  getDefaultLessonsByCourse,
  getDefaultModulesByCourse,
  getDefaultLessonById,
  DEFAULT_COURSES,
  DEFAULT_MODULES,
  DEFAULT_LESSONS,
} from '@/data/curriculumData';

export const lessonService = {
  async getLessonsByCourse(courseId: string, onlyPublished: boolean = true): Promise<Lesson[]> {
    if (!isFirebaseConfigured) return getDefaultLessonsByCourse(courseId);

    try {
      const q = query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId)
      );
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        ),
      ]);
      let lessons: Lesson[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Lesson, 'id'>),
      }));

      if (onlyPublished) {
        lessons = lessons.filter((l) => l.published !== false);
      }

      if (lessons.length > 0) {
        const defaultModules = getDefaultModulesByCourse(courseId);
        const moduleOrderMap: Record<string, number> = {};
        defaultModules.forEach((m) => {
          moduleOrderMap[m.id] = m.order;
        });

        lessons.sort((a, b) => {
          const modOrderA = moduleOrderMap[a.moduleId] ?? 999;
          const modOrderB = moduleOrderMap[b.moduleId] ?? 999;
          if (modOrderA !== modOrderB) return modOrderA - modOrderB;
          if (a.moduleId !== b.moduleId) return a.moduleId.localeCompare(b.moduleId);
          return (a.order ?? 0) - (b.order ?? 0);
        });
        return lessons;
      }
      return getDefaultLessonsByCourse(courseId);
    } catch (error) {
      console.warn(`Notice: returning default lessons for course ${courseId}:`, error);
      return getDefaultLessonsByCourse(courseId);
    }
  },

  async getLessonsByModule(moduleId: string, onlyPublished: boolean = true): Promise<Lesson[]> {
    if (!isFirebaseConfigured) {
      const allLessons = Object.values(DEFAULT_LESSONS).flat();
      return allLessons.filter((l) => l.moduleId === moduleId);
    }

    try {
      const q = query(
        collection(db, 'lessons'),
        where('moduleId', '==', moduleId)
      );
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        ),
      ]);
      let lessons: Lesson[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Lesson, 'id'>),
      }));

      if (onlyPublished) {
        lessons = lessons.filter((l) => l.published !== false);
      }

      if (lessons.length > 0) {
        lessons.sort((a, b) => a.order - b.order);
        return lessons;
      }
      const allLessons = Object.values(DEFAULT_LESSONS).flat();
      return allLessons.filter((l) => l.moduleId === moduleId);
    } catch (error) {
      console.warn(`Notice: returning default lessons for module ${moduleId}:`, error);
      const allLessons = Object.values(DEFAULT_LESSONS).flat();
      return allLessons.filter((l) => l.moduleId === moduleId);
    }
  },

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    if (!isFirebaseConfigured) return getDefaultLessonById(lessonId);

    try {
      const docSnap = await Promise.race([
        getDoc(doc(db, 'lessons', lessonId)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        ),
      ]);
      if (!docSnap.exists()) return getDefaultLessonById(lessonId);
      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Lesson, 'id'>),
      };
    } catch (error) {
      console.warn(`Notice: returning default lesson for ${lessonId}:`, error);
      return getDefaultLessonById(lessonId);
    }
  },

  async createLesson(lessonData: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>, customId?: string): Promise<string> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    const data = {
      ...lessonData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (customId) {
      await setDoc(doc(db, 'lessons', customId), data);
      return customId;
    } else {
      const docRef = await addDoc(collection(db, 'lessons'), data);
      return docRef.id;
    }
  },

  async updateLesson(lessonId: string, updates: Partial<Omit<Lesson, 'id'>>): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    await updateDoc(doc(db, 'lessons', lessonId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteLesson(lessonId: string): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');
    await deleteDoc(doc(db, 'lessons', lessonId));
  },

  async searchContent(searchTerm: string): Promise<{
    courses: Course[];
    modules: Module[];
    lessons: Lesson[];
  }> {
    if (!searchTerm.trim()) {
      return { courses: [], modules: [], lessons: [] };
    }

    const term = searchTerm.toLowerCase().trim();

    const searchDefaults = () => {
      const courses = DEFAULT_COURSES.filter(
        (c) =>
          c.published &&
          (c.title?.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term))
      );
      const modules = Object.values(DEFAULT_MODULES)
        .flat()
        .filter((m) => m.published && m.title?.toLowerCase().includes(term));
      const lessons = Object.values(DEFAULT_LESSONS)
        .flat()
        .filter(
          (l) =>
            l.published &&
            (l.title?.toLowerCase().includes(term) ||
              l.description?.toLowerCase().includes(term) ||
              l.notes?.toLowerCase().includes(term))
        );
      return { courses, modules, lessons };
    };

    if (!isFirebaseConfigured) {
      return searchDefaults();
    }

    try {
      const [coursesSnap, modulesSnap, lessonsSnap] = await Promise.all([
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'modules')),
        getDocs(collection(db, 'lessons')),
      ]);

      if (coursesSnap.empty && lessonsSnap.empty) {
        return searchDefaults();
      }

      const courses: Course[] = coursesSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Course, 'id'>) }))
        .filter(
          (c) =>
            c.published &&
            (c.title?.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term))
        );

      const modules: Module[] = modulesSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Module, 'id'>) }))
        .filter((m) => m.published && m.title?.toLowerCase().includes(term));

      const lessons: Lesson[] = lessonsSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Lesson, 'id'>) }))
        .filter(
          (l) =>
            l.published &&
            (l.title?.toLowerCase().includes(term) || l.description?.toLowerCase().includes(term))
        );

      return { courses, modules, lessons };
    } catch (error) {
      console.warn('Fallback to default curriculum search:', error);
      return searchDefaults();
    }
  },
};
