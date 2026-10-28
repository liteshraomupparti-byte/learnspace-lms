import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fc]">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/learnspace-logo.png"
            alt="LearnSpace — Your Learning Portal"
            className="h-14 sm:h-16 w-auto object-contain animate-pulse"
          />
          <p className="text-xs text-[#65748b] mt-1">Preparing your learning portal...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
