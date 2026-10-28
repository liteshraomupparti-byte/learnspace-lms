import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { UserNote } from '@/types';

export const notesService = {
  getNoteDocId(uid: string, lessonId: string): string {
    return `${uid}_${lessonId}`;
  },

  getLocalNote(uid: string, lessonId: string): string {
    try {
      return localStorage.getItem(`learnspace_note_${uid}_${lessonId}`) || '';
    } catch {
      return '';
    }
  },

  setLocalNote(uid: string, lessonId: string, content: string) {
    try {
      localStorage.setItem(`learnspace_note_${uid}_${lessonId}`, content);
    } catch (e) {
      console.warn('Local note save warning:', e);
    }
  },

  async getNoteForLesson(uid: string, lessonId: string): Promise<string> {
    const local = this.getLocalNote(uid, lessonId);
    if (!isFirebaseConfigured || !uid || !lessonId) return local;

    try {
      const docId = this.getNoteDocId(uid, lessonId);
      const docSnap = await Promise.race([
        getDoc(doc(db, 'userNotes', docId)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2000)
        ),
      ]);
      if (docSnap.exists()) {
        const remote = docSnap.data().content || '';
        this.setLocalNote(uid, lessonId, remote);
        return remote;
      }
      return local;
    } catch (error) {
      console.warn(`Notice: returning local note for lesson ${lessonId}:`, error);
      return local;
    }
  },

  async saveNoteForLesson(uid: string, lessonId: string, content: string): Promise<void> {
    if (!uid || !lessonId) return;

    this.setLocalNote(uid, lessonId, content);
    if (!isFirebaseConfigured) return;

    try {
      const docId = this.getNoteDocId(uid, lessonId);
      await Promise.race([
        setDoc(
          doc(db, 'userNotes', docId),
          {
            uid,
            lessonId,
            content,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);
    } catch (e) {
      console.warn('Notice saving note to Firestore:', e);
    }
  },

  async getAllNotesForUser(uid: string): Promise<UserNote[]> {
    if (!isFirebaseConfigured || !uid) return [];

    try {
      const q = query(
        collection(db, 'userNotes'),
        where('uid', '==', uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({
        id: d.id,
        uid: d.data().uid,
        lessonId: d.data().lessonId,
        content: d.data().content || '',
        updatedAt: d.data().updatedAt?.toDate
          ? d.data().updatedAt.toDate().toISOString()
          : d.data().updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching all notes:', error);
      return [];
    }
  },
};
