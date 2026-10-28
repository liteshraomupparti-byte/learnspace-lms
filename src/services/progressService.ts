import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProgress, LessonActivity, CourseProgressSummary } from '@/types';
import { lessonService } from './lessonService';

export const progressService = {
  // Stable document ID to prevent duplicate progress documents
  getProgressDocId(uid: string, courseId: string, lessonId: string): string {
    return `${uid}_${courseId}_${lessonId}`;
  },

  getLocalProgress(uid: string): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(`learnspace_progress_${uid}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  setLocalProgress(uid: string, progress: Record<string, boolean>) {
    try {
      localStorage.setItem(`learnspace_progress_${uid}`, JSON.stringify(progress));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  },

  getLocalActivities(uid: string): LessonActivity[] {
    try {
      const raw = localStorage.getItem(`learnspace_activities_${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  setLocalActivities(uid: string, activities: LessonActivity[]) {
    try {
      localStorage.setItem(`learnspace_activities_${uid}`, JSON.stringify(activities));
    } catch (e) {
      console.warn('LocalStorage save warning:', e);
    }
  },

  async getUserProgressForCourse(uid: string, courseId: string): Promise<Record<string, boolean>> {
    const local = this.getLocalProgress(uid);
    if (!isFirebaseConfigured || !uid) return local;

    try {
      const q = query(
        collection(db, 'userProgress'),
        where('uid', '==', uid),
        where('courseId', '==', courseId)
      );
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2000)
        ),
      ]);
      const progressMap: Record<string, boolean> = { ...local };

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.lessonId && data.completed !== undefined) {
          progressMap[data.lessonId] = Boolean(data.completed);
        }
      });

      this.setLocalProgress(uid, progressMap);
      return progressMap;
    } catch (error) {
      console.warn(`Notice: using cached progress for course ${courseId}:`, error);
      return local;
    }
  },

  async getAllUserProgress(uid: string): Promise<UserProgress[]> {
    const localMap = this.getLocalProgress(uid);
    const localList: UserProgress[] = Object.keys(localMap).map((lessonId) => ({
      id: `${uid}_${lessonId}`,
      uid,
      courseId: 'course-python',
      lessonId,
      completed: localMap[lessonId],
      updatedAt: new Date().toISOString(),
    }));

    if (!isFirebaseConfigured || !uid) return localList;

    try {
      const q = query(
        collection(db, 'userProgress'),
        where('uid', '==', uid)
      );
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2000)
        ),
      ]);
      const firestoreList = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<UserProgress, 'id'>),
      }));

      // Merge firestore into local
      const mergedMap: Record<string, boolean> = { ...localMap };
      firestoreList.forEach((p) => {
        if (p.lessonId) mergedMap[p.lessonId] = Boolean(p.completed);
      });
      this.setLocalProgress(uid, mergedMap);

      return firestoreList.length > 0 ? firestoreList : localList;
    } catch (error) {
      console.warn('Notice: using cached progress list:', error);
      return localList;
    }
  },

  async toggleLessonProgress(
    uid: string,
    courseId: string,
    lessonId: string,
    newStatus: boolean
  ): Promise<boolean> {
    if (!uid) {
      throw new Error('User not authenticated.');
    }

    // Always update local cache immediately
    const current = this.getLocalProgress(uid);
    current[lessonId] = newStatus;
    this.setLocalProgress(uid, current);

    if (!isFirebaseConfigured) return newStatus;

    // Fire and forget or background sync to Firestore
    try {
      const docId = this.getProgressDocId(uid, courseId, lessonId);
      const progressRef = doc(db, 'userProgress', docId);

      const progressData: Omit<UserProgress, 'id'> = {
        uid,
        courseId,
        lessonId,
        completed: newStatus,
        completedAt: newStatus ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };

      await Promise.race([
        setDoc(
          progressRef,
          {
            ...progressData,
            updatedAt: serverTimestamp(),
            ...(newStatus ? { completedAt: serverTimestamp() } : {}),
          },
          { merge: true }
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (error) {
      console.warn('Background Firestore progress sync notice:', error);
    }

    return newStatus;
  },

  async recordLessonActivity(
    uid: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
    courseTitle?: string,
    lessonTitle?: string
  ): Promise<void> {
    if (!uid) return;

    // Save locally
    const existing = this.getLocalActivities(uid).filter((a) => a.courseId !== courseId);
    const newAct: LessonActivity = {
      id: `${uid}_${courseId}`,
      uid,
      courseId,
      moduleId,
      lessonId,
      courseTitle: courseTitle || 'Computer Programming with Python',
      lessonTitle: lessonTitle || 'Introduction to Python',
      lastAccessedAt: new Date().toISOString(),
    };
    this.setLocalActivities(uid, [newAct, ...existing].slice(0, 10));

    if (!isFirebaseConfigured) return;

    try {
      const activityId = `${uid}_${courseId}`;
      const activityRef = doc(db, 'lessonActivity', activityId);

      await Promise.race([
        setDoc(
          activityRef,
          {
            uid,
            courseId,
            moduleId,
            lessonId,
            courseTitle: courseTitle || '',
            lessonTitle: lessonTitle || '',
            lastAccessedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (error) {
      console.warn('Could not record lesson activity to Firestore:', error);
    }
  },

  async getRecentActivities(uid: string, limitCount: number = 6): Promise<LessonActivity[]> {
    const local = this.getLocalActivities(uid);
    if (!isFirebaseConfigured || !uid) return local.slice(0, limitCount);

    try {
      const q = query(
        collection(db, 'lessonActivity'),
        where('uid', '==', uid)
      );
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2000)
        ),
      ]);
      const activities: LessonActivity[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          uid: data.uid,
          courseId: data.courseId,
          moduleId: data.moduleId,
          lessonId: data.lessonId,
          courseTitle: data.courseTitle,
          lessonTitle: data.lessonTitle,
          lastAccessedAt: data.lastAccessedAt?.toDate
            ? data.lastAccessedAt.toDate().toISOString()
            : data.lastAccessedAt || new Date().toISOString(),
        };
      });

      if (activities.length > 0) {
        activities.sort(
          (a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
        );
        this.setLocalActivities(uid, activities);
        return activities.slice(0, limitCount);
      }
      return local.slice(0, limitCount);
    } catch (error) {
      console.warn('Notice: returning cached activities:', error);
      return local.slice(0, limitCount);
    }
  },

  async calculateCourseSummary(uid: string, courseId: string, courseTitle: string): Promise<CourseProgressSummary> {
    const lessons = await lessonService.getLessonsByCourse(courseId, true);
    const progressMap = await this.getUserProgressForCourse(uid, courseId);

    const totalLessons = lessons.length;
    const completedCount = lessons.filter((l) => progressMap[l.id]).length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      courseId,
      courseTitle,
      totalLessons,
      completedLessons: completedCount,
      percentage,
    };
  },
};
