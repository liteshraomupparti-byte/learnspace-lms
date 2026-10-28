import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { PortalEvent } from '@/types';
import { INITIAL_EVENTS } from '@/data/curriculumData';

export const eventService = {
  async getPublishedEvents(): Promise<PortalEvent[]> {
    if (!isFirebaseConfigured) return INITIAL_EVENTS;

    try {
      const q = query(
        collection(db, 'events'),
        where('published', '==', true)
      );
      const snapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2500)
        ),
      ]);
      const events: PortalEvent[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PortalEvent, 'id'>),
      }));

      if (events.length > 0) {
        events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return events;
      }
      return INITIAL_EVENTS;
    } catch (error) {
      console.warn('Notice: returning default events:', error);
      return INITIAL_EVENTS;
    }
  },

  async getAllEvents(): Promise<PortalEvent[]> {
    if (!isFirebaseConfigured) return [];

    try {
      const snapshot = await getDocs(collection(db, 'events'));
      const events: PortalEvent[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<PortalEvent, 'id'>),
      }));
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return events;
    } catch (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
  },

  async createEvent(eventData: Omit<PortalEvent, 'id' | 'createdAt' | 'updatedAt'>, customId?: string): Promise<string> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    const data = {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (customId) {
      await setDoc(doc(db, 'events', customId), data);
      return customId;
    } else {
      const docRef = await addDoc(collection(db, 'events'), data);
      return docRef.id;
    }
  },

  async updateEvent(eventId: string, updates: Partial<Omit<PortalEvent, 'id'>>): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');

    await updateDoc(doc(db, 'events', eventId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteEvent(eventId: string): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');
    await deleteDoc(doc(db, 'events', eventId));
  },
};
