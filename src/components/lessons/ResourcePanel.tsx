import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, ExternalLink, Loader2 } from 'lucide-react';
import { notesService } from '@/services/notesService';
import { useAuth } from '@/hooks/useAuth';
import type { Lesson, ResourceLink } from '@/types';

interface ResourcePanelProps {
  lesson: Lesson;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ lesson }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'resources'>('details');
  const [notes, setNotes] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [quickNoteText, setQuickNoteText] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing notes for this lesson
  useEffect(() => {
    let isMounted = true;
    async function loadNote() {
      if (!currentUser?.uid || !lesson.id) return;
      try {
        const content = await notesService.getNoteForLesson(currentUser.uid, lesson.id);
        if (isMounted) {
          setNotes(content);
          setSaveStatus('idle');
        }
      } catch (err) {
        console.error('Failed to load note:', err);
      }
    }

    loadNote();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid, lesson.id]);

  // Handle note change with debounced autosave
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setNotes(newContent);
    setSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (!currentUser?.uid) return;
      try {
        await notesService.saveNoteForLesson(currentUser.uid, lesson.id, newContent);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (err) {
        console.error('Auto-save error:', err);
        setSaveStatus('error');
      }
    }, 1200);
  };

  const handleManualSave = async () => {
    if (!currentUser?.uid) return;
    setSaveStatus('saving');
    try {
      await notesService.saveNoteForLesson(currentUser.uid, lesson.id, notes);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
    }
  };

  const handleQuickNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim() || !currentUser?.uid) return;

    const updated = notes
      ? `${notes}\n\n• ${quickNoteText.trim()}`
      : `• ${quickNoteText.trim()}`;

    setNotes(updated);
    setQuickNoteText('');
    setSaveStatus('saving');

    try {
      await notesService.saveNoteForLesson(currentUser.uid, lesson.id, updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      console.error('Error saving quick note:', err);
      setSaveStatus('error');
    }
  };

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] bg-white border-l border-[#d2dce9] flex flex-col h-full overflow-hidden shrink-0">
      {/* Resource Tabs */}
      <div className="h-[62px] border-b border-[#d2dce9] flex items-stretch px-2 shrink-0">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 text-xs sm:text-sm font-medium border-b-2 px-3 transition-colors ${
            activeTab === 'details'
              ? 'border-[#2463eb] text-[#8b4ff0] font-semibold'
              : 'border-transparent text-[#61748f] hover:text-[#101827]'
          }`}
        >
          Lesson Details
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 text-xs sm:text-sm font-medium border-b-2 px-3 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'notes'
              ? 'border-[#2463eb] text-[#8b4ff0] font-semibold'
              : 'border-transparent text-[#61748f] hover:text-[#101827]'
          }`}
        >
          <span>My Notes</span>
          {saveStatus === 'saving' && <Loader2 className="w-3 h-3 text-[#2463eb] animate-spin" />}
          {saveStatus === 'saved' && <Check className="w-3 h-3 text-emerald-600" />}
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex-1 text-xs sm:text-sm font-medium border-b-2 px-3 transition-colors ${
            activeTab === 'resources'
              ? 'border-[#2463eb] text-[#8b4ff0] font-semibold'
              : 'border-transparent text-[#61748f] hover:text-[#101827]'
          }`}
        >
          Resources
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-[#101827] mb-2">About this lesson</h3>
              <p className="text-xs sm:text-sm text-[#65748b] leading-relaxed">
                {lesson.description || 'No description provided for this lesson.'}
              </p>
              {lesson.notes && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#f8faff] border border-[#d2dce9] text-xs text-[#33445d] leading-relaxed">
                  <strong className="block text-[#101827] mb-1 font-semibold">Key Takeaways:</strong>
                  {lesson.notes}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#101827] mb-2">Your learning checklist</h3>
              <div className="text-xs sm:text-sm text-[#65748b] space-y-2 leading-relaxed">
                <p className="flex items-center gap-2">
                  <span className="text-[#2463eb] font-bold">▶</span> Watch the video lesson
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[#a855f7] font-bold">✎</span> Take lesson notes in the "My Notes" tab
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-[#20b36b] font-bold">✓</span> Click "Mark as complete" to update your progress
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#101827]">Lesson Notes</h3>
              <div className="text-xs font-medium">
                {saveStatus === 'saving' && <span className="text-[#2463eb]">Saving...</span>}
                {saveStatus === 'saved' && <span className="text-emerald-600">Saved to Cloud</span>}
                {saveStatus === 'error' && <span className="text-red-500">Failed to save</span>}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={handleNoteChange}
              placeholder="Write your personal notes for this lesson... Notes auto-save to your account."
              className="w-full flex-1 min-h-[220px] p-3.5 border border-[#d2dce9] rounded-xl text-xs sm:text-sm text-[#101827] placeholder-[#8b9bb0] focus:ring-2 focus:ring-[#93baff] resize-y"
            />

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleManualSave}
                className="px-4 py-2 bg-[#2463eb] text-white rounded-xl text-xs font-medium hover:bg-[#1d4fd8] transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div>
            <h3 className="text-base font-semibold text-[#101827] mb-3">Lesson Resources</h3>
            {lesson.resourceLinks && lesson.resourceLinks.length > 0 ? (
              <div className="space-y-2.5">
                {lesson.resourceLinks.map((link: ResourceLink, i: number) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-[#d2dce9] hover:bg-[#f5f8ff] hover:border-[#2463eb] text-xs font-medium text-[#2463eb] transition-all group"
                  >
                    <span className="text-[#101827] group-hover:text-[#2463eb]">{link.label}</span>
                    <ExternalLink className="w-4 h-4 text-[#65748b] group-hover:text-[#2463eb]" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#65748b]">
                No additional external resources or handouts attached to this lesson yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Note Footer */}
      <form
        onSubmit={handleQuickNoteSubmit}
        className="p-3.5 sm:px-5 sm:py-3 border-t border-[#d2dce9] flex gap-2 bg-[#f8faff] shrink-0"
      >
        <input
          type="text"
          value={quickNoteText}
          onChange={(e) => setQuickNoteText(e.target.value)}
          placeholder="Write a quick note..."
          className="flex-1 bg-white border border-[#d2dce9] rounded-full px-4 py-2 text-xs sm:text-sm text-[#101827] placeholder-[#7d8ba0] focus:outline-none focus:border-[#2463eb]"
          aria-label="Write a quick note"
        />
        <button
          type="submit"
          disabled={!quickNoteText.trim()}
          className="w-9 h-9 rounded-full bg-[#2463eb] text-white flex items-center justify-center hover:bg-[#1d4fd8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          title="Save note"
          aria-label="Save note"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </aside>
  );
};
