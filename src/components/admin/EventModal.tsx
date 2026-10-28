import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { eventService } from '@/services/eventService';
import type { PortalEvent } from '@/types';

interface EventModalProps {
  isOpen: boolean;
  eventToEdit?: PortalEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  eventToEdit,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [tag, setTag] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setDescription(eventToEdit.description || '');
      setDate(eventToEdit.date ? eventToEdit.date.slice(0, 10) : '');
      setTag(eventToEdit.tag || 'Learning Reminder');
      setPublished(eventToEdit.published ?? true);
    } else {
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setTag('Learning Reminder');
      setPublished(true);
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError('Title and Date are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (eventToEdit) {
        await eventService.updateEvent(eventToEdit.id, {
          title,
          description,
          date: new Date(date).toISOString(),
          tag,
          published,
        });
      } else {
        await eventService.createEvent({
          title,
          description,
          date: new Date(date).toISOString(),
          tag,
          published,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#d2dce9] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d2dce9] bg-[#f8faff]">
          <h3 className="text-base font-semibold text-[#101827]">
            {eventToEdit ? 'Edit Event' : 'Create Learning Event'}
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
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Python Practice Session"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Date *</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Badge Tag</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Workshop, Learning Reminder"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#34435a] mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about the session, link or room..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2dce9] text-sm focus:border-[#2463eb]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-[#2463eb] rounded border-[#d2dce9]"
            />
            <span className="text-sm font-medium text-[#101827]">Published</span>
          </label>

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
              {loading ? 'Saving...' : eventToEdit ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
