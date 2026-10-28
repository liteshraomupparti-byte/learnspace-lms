import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { lessonService } from '@/services/lessonService';
import type { Lesson, ResourceLink } from '@/types';

interface LessonModalProps {
  isOpen: boolean;
  courseId: string;
  moduleId: string;
  lessonToEdit?: Lesson | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  courseId,
  moduleId,
  lessonToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoId, setVideoId] = useState('');
  const [notes, setNotes] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lessonToEdit) {
      setTitle(lessonToEdit.title || '');
      setDescription(lessonToEdit.description || '');
      setVideoId(lessonToEdit.videoId || '');
      setNotes(lessonToEdit.notes || '');
      setOrder(lessonToEdit.order ?? 1);
      setPublished(lessonToEdit.published ?? true);
      setResourceLinks(lessonToEdit.resourceLinks || []);
    } else {
      setTitle('');
      setDescription('');
      setVideoId('');
      setNotes('');
      setOrder(1);
      setPublished(true);
      setResourceLinks([]);
    }
    setError(null);
  }, [lessonToEdit, isOpen]);

  if (!isOpen) return null;

  // Utility to extract 11-char ID if user accidentally pasted full URL
  const sanitizeVideoId = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.includes('youtube.com/watch?v=') || trimmed.includes('youtu.be/')) {
      const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) return match[1];
    }
    return trimmed;
  };

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setResourceLinks((prev) => [...prev, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    setResourceLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lesson title is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cleanId = sanitizeVideoId(videoId);

      if (lessonToEdit) {
        await lessonService.updateLesson(lessonToEdit.id, {
          title,
          description,
          videoId: cleanId,
          notes,
          order: Number(order),
          published,
          resourceLinks,
        });
      } else {
        await lessonService.createLesson({
          courseId,
          moduleId,
          title,
          description,
          videoProvider: 'youtube',
          videoId: cleanId,
          notes,
          order: Number(order),
          published,
          resourceLinks,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save lesson.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#d2dce9] overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d2dce9] bg-[#f8faff]">
          <h3 className="text-base font-semibold text-[#101827]">
            {lessonToEdit ? 'Edit Lesson' : 'Add New Lesson'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#65748b] hover:bg-[#dceaff]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Lesson Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Loops"
              className="w-full px-3.5 py-2 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of concepts covered in this lesson..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">
              YouTube Video ID (or URL)
            </label>
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="e.g. gfDE2a7MKjA (Leave empty if video is pending)"
              className="w-full px-3.5 py-2 rounded-xl border border-[#d2dce9] text-sm font-mono focus:border-[#2463eb]"
            />
            <p className="text-[11px] text-[#65748b] mt-1">
              Enter the 11-character YouTube video ID. Leave blank to show honest "No video connected" state.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Lesson Notes / Summary</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key syntax, tips, or code snippets for students..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#34435a] mb-1">Order Index</label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-[#d2dce9] text-sm"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
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

          {/* Resource Links */}
          <div className="pt-2 border-t border-[#edf1f7]">
            <label className="block text-xs font-semibold text-[#34435a] mb-2">Resource Links</label>
            <div className="space-y-2 mb-2">
              {resourceLinks.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#f8faff] text-xs">
                  <span className="font-medium text-[#101827]">{link.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#65748b] truncate max-w-[150px]">{link.url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Link label"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#d2dce9]"
              />
              <input
                type="url"
                placeholder="https://..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#d2dce9]"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="px-3 py-1.5 bg-[#edf4ff] text-[#2463eb] text-xs font-semibold rounded-lg hover:bg-[#dceaff]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#edf1f7]">
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
              {loading ? 'Saving...' : lessonToEdit ? 'Save Changes' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
