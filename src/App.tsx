import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';

import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CurriculumPage } from '@/pages/CurriculumPage';
import { LessonPage } from '@/pages/LessonPage';
import { OtherCoursesPage } from '@/pages/OtherCoursesPage';
import { ExamsPage } from '@/pages/ExamsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';
import { PlaygroundPage } from '@/pages/PlaygroundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Main Application Layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/lesson/:courseId/:lessonId" element={<LessonPage />} />
            <Route path="/other-courses" element={<OtherCoursesPage />} />
            <Route path="/exams" element={<ExamsPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Protected Admin Route */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* 404 / Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
