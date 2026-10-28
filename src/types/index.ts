export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  headline?: string;
  batch?: string;
  location?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  published: boolean;
  order?: number;
  totalLessons?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  published: boolean;
  lessons?: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceLink {
  label: string;
  url: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  videoProvider: 'youtube';
  videoId: string; // YouTube video ID, e.g. "gfDE2a7MKjA", or empty if not yet configured
  notes?: string;
  resourceLinks?: ResourceLink[];
  order: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProgress {
  id: string;
  uid: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  updatedAt?: string;
}

export interface UserNote {
  id: string;
  uid: string;
  lessonId: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonActivity {
  id: string;
  uid: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  courseTitle?: string;
  lessonTitle?: string;
  lastAccessedAt: string;
}

export interface PortalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  tag?: string;
  imageUrl?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseProgressSummary {
  courseId: string;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
  lastAccessedLessonId?: string;
  lastAccessedLessonTitle?: string;
  lastAccessedModuleTitle?: string;
}
