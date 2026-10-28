import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#d2dce9] rounded-2xl bg-white/60 my-4">
      <div className="w-14 h-14 rounded-full bg-[#dceaff] text-[#2463eb] flex items-center justify-center mb-3 text-2xl">
        {icon || <FolderOpen className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-[#101827] mb-1">{title}</h3>
      <p className="text-sm text-[#65748b] max-w-md mb-4">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2463eb] text-white text-sm font-medium rounded-xl hover:bg-[#1d4fd8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#d2dce9] text-[#1e293b] text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

