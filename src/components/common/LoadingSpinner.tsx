import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[160px]">
      <div
        className={`${sizeClasses[size]} border-[#2463eb] border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label={label}
      />
      {label && <p className="mt-3 text-sm text-[#65748b] font-medium">{label}</p>}
    </div>
  );
};
