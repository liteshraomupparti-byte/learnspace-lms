import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { authService } from '@/services/authService';
import type { UserProfile } from '@/types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isConfigured: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (email: string, pass: string, name: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  updateProfileData: (patch: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readLocalCache(uid: string): Partial<UserProfile> {
  try {
    const raw = localStorage.getItem(`learnspace_user_profile_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(safetyTimer);
      setError(null);

      if (user) {
        setFirebaseUser(user);
        const cached = readLocalCache(user.uid);
        const immediateProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName:
            cached.displayName || user.displayName || user.email?.split('@')[0] || 'Student',
          role: cached.role || 'student',
          photoURL:
            cached.photoURL !== undefined ? cached.photoURL : user.photoURL || undefined,
          headline: cached.headline,
          batch: cached.batch,
          location: cached.location,
          bio: cached.bio,
          githubUrl: cached.githubUrl,
          linkedinUrl: cached.linkedinUrl,
          skills: cached.skills,
        };
        setCurrentUser(immediateProfile);
        setLoading(false);

        authService
          .getOrCreateProfile(user)
          .then((fullProfile) => {
            if (fullProfile) {
              setCurrentUser(fullProfile);
            }
          })
          .catch((err: any) => {
            console.warn('Background profile sync notice:', err);
          });
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await authService.login(email, pass);
      setCurrentUser(profile);
      return profile;
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (email: string, pass: string, name: string): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await authService.register(email, pass, name);
      setCurrentUser(profile);
      return profile;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setError(null);
    try {
      const profile = await authService.loginWithGoogle();
      setCurrentUser(profile);
      return profile;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    await authService.logout();
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    await authService.resetPassword(email);
  };

  const refreshProfile = async (): Promise<void> => {
    if (!firebaseUser) return;
    try {
      const profile = await authService.getProfile(firebaseUser.uid);
      if (profile) setCurrentUser(profile);
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  const updateName = async (newName: string): Promise<void> => {
    if (!currentUser) return;
    await authService.updateProfileDetails(currentUser.uid, { displayName: newName });
    setCurrentUser((prev) => (prev ? { ...prev, displayName: newName } : null));
  };

  const updateProfileData = async (patch: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) return;
    await authService.updateProfileDetails(currentUser.uid, patch);
    setCurrentUser((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isAdmin,
        isConfigured: isFirebaseConfigured,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshProfile,
        updateName,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
