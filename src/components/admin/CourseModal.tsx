import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { courseService } from '@/services/courseService';
import type { Course } from '@/types';

interface CourseModalProps {
  isOpen: boolean;
  courseToEdit?: Course | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  courseToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title || '');
      setDescription(courseToEdit.description || '');
      setPublished(courseToEdit.published ?? true);
      setOrder(courseToEdit.order ?? 1);
    } else {
      setTitle('');
      setDescription('');
      setPublished(true);
      setOrder(1);
    }
    setError(null);
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Course title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (courseToEdit) {
        await courseService.updateCourse(courseToEdit.id, {
          title,
          description,
          published,
          order: Number(order),
        });
      } else {
        await courseService.createCourse({
          title,
          description,
          published,
          order: Number(order),
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#d2dce9] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d2dce9] bg-[#f8faff]">
          <h3 className="text-base font-semibold text-[#101827]">
            {courseToEdit ? 'Edit Course' : 'Create New Course'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#65748b] hover:bg-[#dceaff]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Computer Programming with Python"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief course summary and learning outcomes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#34435a] mb-1">Display Order</label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2dce9] text-sm"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 text-[#2463eb] rounded border-[#d2dce9]"
                />
                <span className="text-sm font-medium text-[#101827]">Published</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#edf1f7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#65748b] hover:bg-[#f0f5ff] rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#2463eb] text-white text-sm font-semibold rounded-xl hover:bg-[#1d4fd8] disabled:opacity-50"
            >
              {loading ? 'Saving...' : courseToEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
