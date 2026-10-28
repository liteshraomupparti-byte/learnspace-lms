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
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { Course, Module } from '@/types';
import {
  DEFAULT_COURSES,
  getDefaultCourseById,
  getDefaultModulesByCourse,
} from '@/data/curriculumData';

export const courseService = {
  async getPublishedCourses(): Promise<Course[]> {
    if (!isFirebaseConfigured) return DEFAULT_COURSES;

    try {
      const q = query(
        collection(db, 'courses'),
        where('published', '==', true)
      );

      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        ),
      ]);

      const courses: Course[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Course, 'id'>),
      }));

      courses.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      return courses.length > 0 ? courses : DEFAULT_COURSES;
    } catch (error) {
      console.warn('Notice: using curriculum catalog (Firestore offline/empty):', error);
      return DEFAULT_COURSES;
    }
  },

  async getAllCourses(): Promise<Course[]> {
    if (!isFirebaseConfigured) return DEFAULT_COURSES;

    try {
      const snapshot = await Promise.race([
        getDocs(collection(db, 'courses')),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        ),
      ]);
      const courses: Course[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Course, 'id'>),
      }));
      courses.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      return courses.length > 0 ? courses : DEFAULT_COURSES;
    } catch (error) {
      console.warn('Notice: fallback to catalog in getAllCourses:', error);
      return DEFAULT_COURSES;
    }
  },

  async getCourseById(courseId: string): Promise<Course | null> {
    if (!isFirebaseConfigured) return getDefaultCourseById(courseId);

    try {
      const docSnap = await Promise.race([
        getDoc(doc(db, 'courses', courseId)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        ),
      ]);
      if (!docSnap.exists()) {
        return getDefaultCourseById(courseId);
      }
      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Course, 'id'>),
      };
    } catch (error) {
      console.warn(`Notice: returning default course for ${courseId}:`, error);
      return getDefaultCourseById(courseId);
    }
  },

  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>, customId?: string): Promise<string> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    const data = {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (customId) {
      await setDoc(doc(db, 'courses', customId), data);
      return customId;
    } else {
      const docRef = await addDoc(collection(db, 'courses'), data);
      return docRef.id;
    }
  },

  async updateCourse(courseId: string, updates: Partial<Omit<Course, 'id'>>): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    await updateDoc(doc(db, 'courses', courseId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteCourse(courseId: string): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');
    await deleteDoc(doc(db, 'courses', courseId));
  },

  async getModulesByCourse(courseId: string, onlyPublished: boolean = true): Promise<Module[]> {
    if (!isFirebaseConfigured) return getDefaultModulesByCourse(courseId);

    try {
      const q = query(
        collection(db, 'modules'),
        where('courseId', '==', courseId)
      );
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        ),
      ]);

      let modules: Module[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Module, 'id'>),
      }));

      if (onlyPublished) {
        modules = modules.filter((m) => m.published !== false);
      }

      if (modules.length > 0) {
        modules.sort((a, b) => a.order - b.order);
        return modules;
      }
      return getDefaultModulesByCourse(courseId);
    } catch (error) {
      console.warn(`Notice: returning default modules for ${courseId}:`, error);
      return getDefaultModulesByCourse(courseId);
    }
  },

  async createModule(moduleData: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>, customId?: string): Promise<string> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    const data = {
      ...moduleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (customId) {
      await setDoc(doc(db, 'modules', customId), data);
      return customId;
    } else {
      const docRef = await addDoc(collection(db, 'modules'), data);
      return docRef.id;
    }
  },

  async updateModule(moduleId: string, updates: Partial<Omit<Module, 'id'>>): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    await updateDoc(doc(db, 'modules', moduleId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteModule(moduleId: string): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');
    await deleteDoc(doc(db, 'modules', moduleId));
  },
};
