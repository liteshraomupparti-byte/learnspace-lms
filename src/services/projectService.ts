import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import type { CodeProject, CodeProjectFiles, SupportedLanguage, PlaygroundMode } from '@/types/playground';

const LOCAL_STORAGE_KEY_PREFIX = 'learnspace_code_project_';
const LOCAL_PROJECTS_INDEX_KEY = 'learnspace_projects_index';

function getLocalProjectsIndex(uid: string): string[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_PROJECTS_INDEX_KEY}_${uid}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveLocalProjectsIndex(uid: string, ids: string[]) {
  try {
    localStorage.setItem(`${LOCAL_PROJECTS_INDEX_KEY}_${uid}`, JSON.stringify(ids));
  } catch {}
}

function getLocalProject(id: string): CodeProject | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${id}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveLocalProject(project: CodeProject) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${project.id}`, JSON.stringify(project));
    const ids = getLocalProjectsIndex(project.uid);
    if (!ids.includes(project.id)) {
      ids.unshift(project.id);
      saveLocalProjectsIndex(project.uid, ids);
    }
  } catch {}
}

function removeLocalProject(id: string, uid: string) {
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${id}`);
    const ids = getLocalProjectsIndex(uid).filter((item) => item !== id);
    saveLocalProjectsIndex(uid, ids);
  } catch {}
}

export const projectService = {
  // Save or update a student code project
  async saveProject(
    uid: string,
    data: {
      title: string;
      language: SupportedLanguage;
      mode: PlaygroundMode;
      files: CodeProjectFiles;
      stdin?: string;
      lessonId?: string;
      courseId?: string;
    },
    existingId?: string
  ): Promise<CodeProject> {
    const now = new Date().toISOString();
    const projectId = existingId || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const project: CodeProject = {
      id: projectId,
      uid,
      title: data.title || 'Untitled Project',
      language: data.language,
      mode: data.mode,
      files: data.files,
      stdin: data.stdin,
      lessonId: data.lessonId,
      courseId: data.courseId,
      createdAt: now,
      updatedAt: now,
    };

    // Always cache locally first
    saveLocalProject(project);

    // If Firebase Firestore is configured, save to cloud
    if (isFirebaseConfigured) {
      try {
        await setDoc(
          doc(db, 'codeProjects', projectId),
          {
            ...project,
            updatedAt: serverTimestamp(),
            ...(existingId ? {} : { createdAt: serverTimestamp() }),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore code project sync notice (saved locally):', err);
      }
    }

    return project;
  },

  // Get all projects for current student
  async getProjectsForUser(uid: string): Promise<CodeProject[]> {
    // Collect local projects
    const localIds = getLocalProjectsIndex(uid);
    const localProjects = localIds
      .map((id) => getLocalProject(id))
      .filter((p): p is CodeProject => p !== null);

    if (!isFirebaseConfigured) {
      return localProjects;
    }

    try {
      const q = query(collection(db, 'codeProjects'), where('uid', '==', uid));
      const snap = await getDocs(q);

      const remoteProjects: CodeProject[] = [];
      snap.forEach((d) => {
        const item = d.data();
        const p: CodeProject = {
          id: item.id || d.id,
          uid: item.uid,
          title: item.title || 'Untitled Project',
          language: item.language || 'web',
          mode: item.mode || 'web',
          files: item.files || {},
          stdin: item.stdin,
          lessonId: item.lessonId,
          courseId: item.courseId,
          createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : item.createdAt || '',
          updatedAt: item.updatedAt?.toDate ? item.updatedAt.toDate().toISOString() : item.updatedAt || '',
        };
        remoteProjects.push(p);
        saveLocalProject(p);
      });

      // Merge remote + local, deduping by id
      const map = new Map<string, CodeProject>();
      localProjects.forEach((p) => map.set(p.id, p));
      remoteProjects.forEach((p) => map.set(p.id, p));

      return Array.from(map.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (err) {
      console.warn('Firestore getProjects notice (fallback to local projects):', err);
      return localProjects;
    }
  },

  // Get project by ID
  async getProjectById(projectId: string): Promise<CodeProject | null> {
    const local = getLocalProject(projectId);
    if (!isFirebaseConfigured) return local;

    try {
      const snap = await getDoc(doc(db, 'codeProjects', projectId));
      if (snap.exists()) {
        const item = snap.data();
        const p: CodeProject = {
          id: item.id || snap.id,
          uid: item.uid,
          title: item.title,
          language: item.language,
          mode: item.mode,
          files: item.files,
          stdin: item.stdin,
          lessonId: item.lessonId,
          courseId: item.courseId,
          createdAt: item.createdAt?.toDate ? item.createdAt.toDate().toISOString() : item.createdAt,
          updatedAt: item.updatedAt?.toDate ? item.updatedAt.toDate().toISOString() : item.updatedAt,
        };
        saveLocalProject(p);
        return p;
      }
      return local;
    } catch {
      return local;
    }
  },

  // Rename a project
  async renameProject(projectId: string, newTitle: string, uid: string): Promise<void> {
    const local = getLocalProject(projectId);
    if (local) {
      local.title = newTitle;
      local.updatedAt = new Date().toISOString();
      saveLocalProject(local);
    }

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'codeProjects', projectId), {
          title: newTitle,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore rename project notice:', err);
      }
    }
  },

  // Delete a project
  async deleteProject(projectId: string, uid: string): Promise<void> {
    removeLocalProject(projectId, uid);

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'codeProjects', projectId));
      } catch (err) {
        console.warn('Firestore delete project notice:', err);
      }
    }
  },
};

