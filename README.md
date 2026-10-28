# LearnSpace — Production-Ready Learning Management System (LMS)

LearnSpace is a full-stack, production-grade learning management portal engineered with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Google Firebase** (Authentication, Cloud Firestore, and Security Rules).

The project retains and improves the complete visual identity, typography (`Inter` & `DM Sans`), color palette (`#2463eb` brand blue, `#101827` ink, `#f7f9fc` page), custom illustrations (calendar student art), and layout hierarchy from the original LearnSpace prototype.

---

## 1. Architecture & Tech Stack

- **Frontend Core**: React 19, TypeScript 5, Vite 6
- **Styling**: Tailwind CSS 3 with custom LearnSpace design system tokens
- **Routing**: React Router 7 with declarative `ProtectedRoute` and `AdminRoute`
- **Iconography**: Lucide React
- **Authentication**: Firebase Authentication (Email/Password & Google Sign-In)
- **Database**: Cloud Firestore with typed document services and strict security rules
- **Media**: YouTube IFrame Player with verified tutorial integration and fallback error handling

---

## 2. Directory Structure

```
d:/learning portal clone/
├── src/
│   ├── components/
│   │   ├── admin/           # Course, Module, Lesson, and Event modals
│   │   ├── common/          # Toast, LoadingSpinner, EmptyState, SearchModal
│   │   ├── curriculum/      # CourseAccordion (expandable modules & lessons)
│   │   ├── dashboard/       # ContinueCarousel, ScheduleWidget, AttendanceWidget, EventsWidget
│   │   ├── layout/          # TopBar, Sidebar, AppLayout
│   │   ├── lessons/         # LessonSidebar, ResourcePanel (My Notes & checklist)
│   │   └── video/           # VideoPlayer (embedded YouTube with error & fallback handling)
│   ├── contexts/
│   │   └── AuthContext.tsx  # Centralized authentication & profile state
│   ├── hooks/
│   │   ├── useAuth.ts       # Hook for current user, role, and auth methods
│   │   ├── useCourses.ts    # Hook for published course fetching & lesson counts
│   │   └── useProgress.ts   # Dynamic progress calculation & completion toggling
│   ├── lib/
│   │   └── firebase.ts      # Safe Firebase initialization & emulator connector
│   ├── pages/
│   │   ├── AdminPage.tsx    # Protected Administrator Dashboard
│   │   ├── CurriculumPage.tsx # Full course & lesson browser
│   │   ├── DashboardPage.tsx  # Student dashboard with Continue Learning & Schedule
│   │   ├── ExamsPage.tsx    # Practice & assessment portal
│   │   ├── ForgotPasswordPage.tsx # Password reset
│   │   ├── LessonPage.tsx   # Central video player, lesson sidebar & personal notes
│   │   ├── LoginPage.tsx    # Student login
│   │   ├── OtherCoursesPage.tsx # Catalog of electives and courses
│   │   ├── ProfilePage.tsx  # Student profile, stats, notes viewer, name editor
│   │   └── SignupPage.tsx   # Student account registration
│   ├── routes/
│   │   ├── AdminRoute.tsx   # Role-guarded route for administrators
│   │   └── ProtectedRoute.tsx # Authentication-guarded route for students
│   ├── services/
│   │   ├── authService.ts   # User profile and role Firestore operations
│   │   ├── courseService.ts # Course and Module CRUD
│   │   ├── eventService.ts  # Learning updates & calendar events
│   │   ├── lessonService.ts # Lesson CRUD and global search
│   │   ├── notesService.ts  # Lesson notes storage & autosave
│   │   ├── progressService.ts # Course completion calculations & activity tracking
│   │   └── seedData.ts      # 16-module Python curriculum seeder
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces for all Firestore documents
│   ├── App.tsx              # Router and provider tree
│   ├── index.css            # Tailwind directives and LearnSpace CSS tokens
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite environment variable types
├── firestore.rules          # Production Firestore Security Rules
├── firestore.indexes.json   # Composite indexes for queries
├── firebase.json            # Firebase Hosting and Emulator suite config
├── tailwind.config.js       # LearnSpace brand theme extension
├── package.json
└── .env.example
```

---

## 3. Database Schema Documentation

Cloud Firestore serves as the single source of truth for all application data:

### `users` Collection
- `uid`: (string, document ID) Firebase Auth UID
- `email`: (string) User email address
- `displayName`: (string) Full student name
- `role`: (`'student' | 'admin'`) Authorization role
- `photoURL`: (string, optional) Avatar link
- `createdAt`: (timestamp) Registration timestamp
- `updatedAt`: (timestamp) Last updated timestamp

### `courses` Collection
- `id`: (string, document ID) Course identifier
- `title`: (string) Course title (e.g., "Computer Programming with Python")
- `description`: (string) Course syllabus summary
- `order`: (number) Sorting position
- `published`: (boolean) Visibility to students
- `createdAt` / `updatedAt`: (timestamp)

### `modules` Collection
- `id`: (string, document ID) Module identifier
- `courseId`: (string) Foreign key referencing `courses/{courseId}`
- `title`: (string) Module title (e.g., "Introduction to Python")
- `order`: (number) Sequential module index
- `published`: (boolean) Visibility flag

### `lessons` Collection
- `id`: (string, document ID) Lesson identifier
- `courseId`: (string) Parent course ID
- `moduleId`: (string) Parent module ID
- `title`: (string) Lesson title
- `description`: (string) Lesson overview
- `videoProvider`: (`'youtube'`)
- `videoId`: (string) 11-character YouTube video ID (e.g. `gfDE2a7MKjA`), or empty if awaiting verified video
- `notes`: (string, optional) Key concepts and takeaways
- `resourceLinks`: (`Array<{ label: string, url: string }>`)
- `order`: (number) Ordering inside module
- `published`: (boolean) Visibility flag

### `userProgress` Collection
- Document ID Pattern: `${uid}_${courseId}_${lessonId}` (guarantees deduplication)
- `uid`: (string) Student UID
- `courseId`: (string) Course ID
- `lessonId`: (string) Lesson ID
- `completed`: (boolean) Completion state
- `completedAt`: (timestamp) Timestamp when marked complete
- `updatedAt`: (timestamp) Last state modification

### `userNotes` Collection
- Document ID Pattern: `${uid}_${lessonId}` (isolated per student per lesson)
- `uid`: (string) Student UID
- `lessonId`: (string) Lesson ID
- `content`: (string) Student's personal notes text
- `updatedAt`: (timestamp) Autosave timestamp

### `lessonActivity` Collection
- Document ID Pattern: `${uid}_${courseId}`
- `uid`: (string) Student UID
- `courseId`: (string) Course ID
- `moduleId`: (string) Last accessed module ID
- `lessonId`: (string) Last accessed lesson ID
- `courseTitle` / `lessonTitle`: (string)
- `lastAccessedAt`: (timestamp) Last opened timestamp (powers "Continue Learning")

### `events` Collection
- `id`: (string, document ID) Event identifier
- `title`: (string) Event headline
- `description`: (string) Workshop or reminder details
- `date`: (string, ISO) Event timestamp
- `tag`: (string) Badge (e.g., "Workshop", "Learning Reminder")
- `published`: (boolean) Visibility flag

---

## 4. Firebase Setup Guide

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and enter a name (e.g., `learnspace-portal`).
3. (Optional) Disable Google Analytics for faster setup, then click **Create project**.

### Step 2: Register Web Application
1. In the Firebase Project Overview, click the **Web icon (</>)** to register an app.
2. Enter app nickname `LearnSpace Web`.
3. Check the box for **Firebase Hosting**.
4. Click **Register app** and copy the `firebaseConfig` keys.

### Step 3: Configure `.env`
In the root directory of this repository:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the values copied from the Firebase Console:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=learnspace-portal.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=learnspace-portal
   VITE_FIREBASE_STORAGE_BUCKET=learnspace-portal.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:...
   VITE_FIREBASE_MEASUREMENT_ID=G-...
   VITE_USE_FIREBASE_EMULATOR=false
   ```

### Step 4: Enable Authentication
1. In Firebase Console, navigate to **Build > Authentication > Sign-in method**.
2. Click **Email/Password** -> Toggle **Enable** -> Click **Save**.
3. (Optional) Click **Google** -> Toggle **Enable** -> Choose project support email -> Click **Save**.

### Step 5: Enable Cloud Firestore
1. Navigate to **Build > Firestore Database** -> Click **Create database**.
2. Select your preferred database location.
3. Start in **Production mode** (our `firestore.rules` file enforces secure access).

### Step 6: Deploy Security Rules
Using the Firebase CLI:
```bash
npx firebase-tools login
npx firebase-tools use --add <your-project-id>
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

---

## 5. How to Grant the First Administrator Access

To maintain strict security, user roles cannot be self-promoted from the frontend:

1. **Sign up** as a normal student through the app UI at `http://localhost:3000/signup`.
2. Open the **Firebase Console** -> Go to **Firestore Database** -> Open the `users` collection.
3. Find your user document (identified by your Auth `uid`).
4. Edit the `role` field value from `"student"` to `"admin"`.
5. Return to the portal and refresh the page (or click profile -> "Admin Management"). You now have full access to `/admin` to create courses, edit lessons, manage students, and audit video IDs.

---

## 6. Seeding the 16-Module Python Curriculum

LearnSpace comes with a built-in curriculum seeder:

1. Log in with an administrator account.
2. Navigate to the **Admin Dashboard** (`/admin`).
3. Click the purple button: **"Seed Python Curriculum"**.
4. The system will automatically populate:
   - 16 Python modules (Introduction, Instructions, Variables, Types, Operators, Conditions, Loops, Strings, Lists, Dictionaries, Functions, Recursion, OOP, File Handling, Exception Handling).
   - Lessons with verified CodeWithHarry video IDs (`gfDE2a7MKjA`, `TqPzwenhMj0`, `7wnove7K-ZQ`) and honest empty video states for topics awaiting assignment.
   - Initial calendar workshops and learning updates.

---

## 7. Running & Testing Locally

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
# The portal will be live at http://localhost:3000/

# Run TypeScript compilation and build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 8. Deployment Guide

### Deploying to Firebase Hosting
```bash
# Build the production bundle
npm run build

# Deploy hosting and rules
npx firebase-tools deploy
```

### Deploying to Vercel
1. Push the code to your GitHub repository.
2. In Vercel, click **Import Project** -> select the repository.
3. Framework Preset: **Vite**.
4. In the **Environment Variables** section, add all `VITE_FIREBASE_*` variables from your `.env`.
5. Click **Deploy**.
