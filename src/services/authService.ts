import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/types';

const LOCAL_PROFILE_PREFIX = 'learnspace_user_profile_';

function getLocalProfileCache(uid: string): Partial<UserProfile> {
  try {
    const raw = localStorage.getItem(`${LOCAL_PROFILE_PREFIX}${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveLocalProfileCache(uid: string, patch: Partial<UserProfile>) {
  try {
    const existing = getLocalProfileCache(uid);
    const merged = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    localStorage.setItem(`${LOCAL_PROFILE_PREFIX}${uid}`, JSON.stringify(merged));
  } catch {}
}

export const authService = {
  async register(email: string, password: string, displayName: string): Promise<UserProfile> {
    if (!isFirebaseConfigured) {
      throw new Error(
        'Firebase credentials are not configured. Please add your credentials to .env.'
      );
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await updateProfile(user, { displayName });

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      displayName: displayName || email.split('@')[0],
      role: 'student',
      photoURL: user.photoURL || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveLocalProfileCache(user.uid, userProfile);

    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userProfile;
  },

  async login(email: string, password: string): Promise<UserProfile> {
    if (!isFirebaseConfigured) {
      throw new Error(
        'Firebase credentials are not configured. Please add your credentials to .env.'
      );
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    return await this.getOrCreateProfile(user);
  },

  async loginWithGoogle(): Promise<UserProfile> {
    if (!isFirebaseConfigured) {
      throw new Error(
        'Firebase credentials are not configured. Please add your credentials to .env.'
      );
    }

    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    return await this.getOrCreateProfile(user);
  },

  async logout(): Promise<void> {
    if (!isFirebaseConfigured) return;
    await signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    if (!isFirebaseConfigured) {
      throw new Error(
        'Firebase credentials are not configured. Please add your credentials to .env.'
      );
    }
    await sendPasswordResetEmail(auth, email);
  },

  async getProfile(uid: string): Promise<UserProfile | null> {
    const localExtra = getLocalProfileCache(uid);
    if (!isFirebaseConfigured) return null;

    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const merged: UserProfile = {
          uid: data.uid || uid,
          email: data.email || localExtra.email || '',
          displayName: localExtra.displayName || data.displayName || 'Student',
          role: (data.role as UserRole) || 'student',
          photoURL:
            localExtra.photoURL !== undefined ? localExtra.photoURL : data.photoURL,
          headline: localExtra.headline ?? data.headline,
          batch: localExtra.batch ?? data.batch,
          location: localExtra.location ?? data.location,
          bio: localExtra.bio ?? data.bio,
          githubUrl: localExtra.githubUrl ?? data.githubUrl,
          linkedinUrl: localExtra.linkedinUrl ?? data.linkedinUrl,
          skills: localExtra.skills ?? data.skills,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
        saveLocalProfileCache(uid, merged);
        return merged;
      }
      return null;
    } catch (error) {
      console.warn('Firestore profile lookup error (will fallback to local/Auth profile):', error);
      return null;
    }
  },

  async getOrCreateProfile(user: FirebaseUser): Promise<UserProfile> {
    const localExtra = getLocalProfileCache(user.uid);
    const fallbackProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName:
        localExtra.displayName || user.displayName || user.email?.split('@')[0] || 'Student',
      role: 'student',
      photoURL:
        localExtra.photoURL !== undefined
          ? localExtra.photoURL
          : user.photoURL || undefined,
      headline: localExtra.headline,
      batch: localExtra.batch,
      location: localExtra.location,
      bio: localExtra.bio,
      githubUrl: localExtra.githubUrl,
      linkedinUrl: localExtra.linkedinUrl,
      skills: localExtra.skills,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const existing = await this.getProfile(user.uid);
      if (existing) return existing;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...fallbackProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return fallbackProfile;
    } catch (error) {
      console.warn('Firestore user profile write warning (using auth fallback):', error);
      return fallbackProfile;
    }
  },

  async updateProfileDetails(
    uid: string,
    data: Partial<
      Pick<
        UserProfile,
        | 'displayName'
        | 'photoURL'
        | 'headline'
        | 'batch'
        | 'location'
        | 'bio'
        | 'githubUrl'
        | 'linkedinUrl'
        | 'skills'
      >
    >
  ): Promise<void> {
    // Always persist immediately to localStorage so UI and refreshes work seamlessly
    saveLocalProfileCache(uid, data);

    if (!isFirebaseConfigured) return;

    try {
      if (auth.currentUser && data.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }
    } catch (e) {
      console.warn('Firebase Auth displayName update notice:', e);
    }

    try {
      await setDoc(
        doc(db, 'users', uid),
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore profile update notice (saved locally):', e);
    }
  },

  async setUserRole(uid: string, role: UserRole): Promise<void> {
    if (!isFirebaseConfigured) throw new Error('Firebase not configured');
    await updateDoc(doc(db, 'users', uid), {
      role,
      updatedAt: serverTimestamp(),
    });
  },

  async getAllUsers(): Promise<UserProfile[]> {
    if (!isFirebaseConfigured) return [];
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        uid: data.uid || docSnap.id,
        email: data.email || '',
        displayName: data.displayName || 'Student',
        role: (data.role as UserRole) || 'student',
        photoURL: data.photoURL,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      };
    });
  },
};
