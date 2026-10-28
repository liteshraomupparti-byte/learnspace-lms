import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fc] gap-4">
        <img
          src="/learnspace-logo.png"
          alt="LearnSpace — Your Learning Portal"
          className="h-14 sm:h-16 w-auto object-contain animate-pulse"
        />
        <LoadingSpinner label="Verifying administrator permissions..." size="md" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#101827] mb-2">Access Restricted</h2>
        <p className="text-sm text-[#65748b] max-w-md mb-6 leading-relaxed">
          You must have administrator authorization to access this area. Your current account role is{' '}
          <strong className="text-[#101827]">"{currentUser.role || 'student'}"</strong>.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-[#2463eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4fd8] transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
