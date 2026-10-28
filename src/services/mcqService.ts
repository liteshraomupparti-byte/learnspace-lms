import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { MCQAttempt } from '@/types/mcq';

const LOCAL_STORAGE_MCQ_PREFIX = 'learnspace_mcq_attempts_';

export const mcqService = {
  // Get all past attempts for a given topic
  async getAttemptsForTopic(uid: string, topicId: string): Promise<MCQAttempt[]> {
    const localKey = `${LOCAL_STORAGE_MCQ_PREFIX}${uid}_${topicId}`;
    let localAttempts: MCQAttempt[] = [];

    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localAttempts = JSON.parse(raw);
    } catch {}

    if (isFirebaseConfigured && uid && uid !== 'guest') {
      try {
        const q = query(
          collection(db, 'mcqAttempts'),
          where('uid', '==', uid),
          where('topicId', '==', topicId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const cloudAttempts = snap.docs.map((d) => d.data() as MCQAttempt);
          // Sort descending by date
          cloudAttempts.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          localStorage.setItem(localKey, JSON.stringify(cloudAttempts));
          return cloudAttempts;
        }
      } catch (err) {
        console.warn('Firestore MCQ fetch notice (using local):', err);
      }
    }

    localAttempts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return localAttempts;
  },

  // Save an attempt
  async saveAttempt(attempt: MCQAttempt): Promise<void> {
    const localKey = `${LOCAL_STORAGE_MCQ_PREFIX}${attempt.uid}_${attempt.topicId}`;

    try {
      const raw = localStorage.getItem(localKey);
      const list: MCQAttempt[] = raw ? JSON.parse(raw) : [];
      list.unshift(attempt);
      localStorage.setItem(localKey, JSON.stringify(list.slice(0, 20))); // Keep last 20 attempts
    } catch {}

    if (isFirebaseConfigured && attempt.uid && attempt.uid !== 'guest') {
      try {
        await setDoc(doc(db, 'mcqAttempts', attempt.id), {
          ...attempt,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore MCQ save notice (saved locally):', err);
      }
    }
  },
};
