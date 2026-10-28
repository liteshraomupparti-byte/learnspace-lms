import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  CheckCircle2,
  Edit3,
  Key,
  FileText,
  Camera,
  Trash2,
  Copy,
  Check,
  Clock,
  CalendarCheck,
  TrendingUp,
  Plus,
  Play,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCourses } from '@/hooks/useCourses';
import { useProgress } from '@/hooks/useProgress';
import { notesService } from '@/services/notesService';
import { INITIAL_COURSES } from '@/data/curriculumData';
import { Toast } from '@/components/common/Toast';
import type { UserNote } from '@/types';

// Resize and center-crop any local image file into a crisp 256x256 JPEG data URL
function processLocalImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (PNG, JPG, WEBP).'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        // Center crop square
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfileData, updateName, resetPassword } = useAuth();
  const { courses } = useCourses();
  const { overallPercentage, completedMap, courseSummaries } = useProgress(courses);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [quickNoteTitle, setQuickNoteTitle] = useState('Personal Study Note');
  const [quickNoteText, setQuickNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  useEffect(() => {
    if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }
    if (currentUser?.uid) {
      notesService.getAllNotesForUser(currentUser.uid).then(setNotes).catch(console.error);
    }
  }, [currentUser]);

  // Count completed timetable sessions across saved dates
  const timetableStats = useMemo(() => {
    try {
      const raw = localStorage.getItem('learnspace_timetable_v3');
      if (!raw) return { completedSessions: 0, trackedDays: 0 };
      const map = JSON.parse(raw);
      let completedSessions = 0;
      let trackedDays = 0;
      Object.values(map).forEach((day: any) => {
        if (day?.sessions?.length) {
          trackedDays++;
          completedSessions += day.sessions.filter((s: any) => s.completed).length;
        }
      });
      return { completedSessions, trackedDays };
    } catch {
      return { completedSessions: 0, trackedDays: 0 };
    }
  }, []);

  const totalPortalLessons = useMemo(() => {
    return INITIAL_COURSES.reduce(
      (acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.lessons.length, 0),
      0
    );
  }, []);

  const completedCount = Object.keys(completedMap).length;
  const estimatedStudyHours = Math.max(
    1,
    Math.round(completedCount * 0.75 + timetableStats.completedSessions * 0.5)
  );

  const getInitials = (name?: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Handle local image selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const dataUrl = await processLocalImageFile(file);
      await updateProfileData({ photoURL: dataUrl });
      setToastMsg('Profile photo updated from your computer!');
    } catch (err: any) {
      setToastMsg(err.message || 'Could not process image file.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      await updateProfileData({ photoURL: '' });
      setToastMsg('Profile photo removed.');
    } catch (err: any) {
      setToastMsg(err.message || 'Failed to remove photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      setToastMsg('Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await updateName(displayName.trim());
      setIsEditingName(false);
      setToastMsg('Profile name updated.');
    } catch (e: any) {
      setToastMsg(e.message || 'Failed to update name.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveQuickNote = async () => {
    if (!quickNoteText.trim() || !currentUser?.uid) return;
    try {
      const noteId = `${quickNoteTitle.trim() || 'General Note'} (${new Date().toLocaleDateString()})`;
      await notesService.saveNoteForLesson(currentUser.uid, noteId, quickNoteText.trim());
      const updatedNotes = await notesService.getAllNotesForUser(currentUser.uid);
      setNotes(updatedNotes);
      setQuickNoteText('');
      setAddingNote(false);
      setToastMsg('Study note saved to your profile!');
    } catch {
      // Fallback local note display
      const fallbackNote: UserNote = {
        id: `local-${Date.now()}`,
        uid: currentUser.uid,
        lessonId: quickNoteTitle.trim() || 'General Note',
        content: quickNoteText.trim(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [fallbackNote, ...prev]);
      setQuickNoteText('');
      setAddingNote(false);
      setToastMsg('Study note saved!');
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    try {
      await resetPassword(currentUser.email);
      setToastMsg(`Password reset email sent to ${currentUser.email}.`);
    } catch (e: any) {
      setToastMsg(e.message || 'Failed to dispatch reset email.');
    }
  };

  const handleCopyUid = () => {
    if (!currentUser?.uid) return;
    navigator.clipboard?.writeText(currentUser.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <div className="max-w-[1240px] mx-auto space-y-7">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#101827]">
          My Learning Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#65748b] mt-1">
          Manage your account settings, profile photo, and learning progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-7 items-start">
        {/* Left Column: Clean & Professional Profile Card */}
        <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm text-center flex flex-col items-center">
          {/* Hidden Local File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Avatar with Camera Button */}
          <div className="relative group mb-3">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Student'}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#d2dce9] shadow-sm bg-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#526a86] text-white flex items-center justify-center font-bold text-3xl shadow-sm select-none">
                {getInitials(currentUser?.displayName)}
              </div>
            )}

            {/* Camera Upload Badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              title="Upload profile photo from your computer"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2463eb] text-white border-2 border-white flex items-center justify-center shadow-md hover:bg-[#1d4fd8] hover:scale-105 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Photo Controls */}
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="text-[11px] font-semibold text-[#2463eb] hover:underline"
            >
              <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
            </button>
            {currentUser?.photoURL && (
              <>
                <span className="text-[#cbd5e1]">•</span>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] font-medium text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </>
            )}
          </div>

          {/* Name & Email (Clean & Professional) */}
          {isEditingName ? (
            <div className="w-full space-y-2 mb-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-sm text-center font-semibold rounded-xl border border-[#2463eb] focus:outline-none"
                placeholder="Enter your name"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="flex-1 py-1.5 bg-[#2463eb] text-white text-xs font-semibold rounded-lg hover:bg-[#1d4fd8]"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-3 py-1.5 bg-[#edf1f7] text-[#65748b] text-xs font-semibold rounded-lg hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#101827] flex items-center justify-center gap-2">
                <span>{currentUser?.displayName || 'Student'}</span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[#65748b] hover:text-[#2463eb] transition-colors"
                  title="Edit Name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </h2>
              <p className="text-xs text-[#65748b] mt-0.5">{currentUser?.email}</p>
            </div>
          )}

          {/* Account Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] shadow-2xs mb-6">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-[#0f172a]">
              {currentUser?.role === 'admin' ? 'Administrator' : 'Active Student'}
            </span>
            <span className="text-[#cbd5e1]">|</span>
            <span className="text-[11px] text-[#64748b] font-medium">Verified Access</span>
          </div>

          {/* Student Info & Metadata */}
          <div className="w-full border-t border-[#edf1f7] pt-4 space-y-3 text-left text-xs">
            <div className="flex items-center justify-between text-[#65748b]">
              <span>User ID:</span>
              <button
                onClick={handleCopyUid}
                title="Click to copy full User ID"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#101827] hover:text-[#2463eb] transition-colors"
              >
                <span className="truncate max-w-[145px]">{currentUser?.uid}</span>
                {copiedUid ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[#65748b]">
              <span>Enrolled Courses:</span>
              <span className="font-semibold text-[#101827]">{INITIAL_COURSES.length}</span>
            </div>
            <div className="flex items-center justify-between text-[#65748b]">
              <span>Completed Lessons:</span>
              <span className="font-semibold text-emerald-600">
                {completedCount} / {totalPortalLessons}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#65748b]">
              <span>Timetable Sessions Marked:</span>
              <span className="font-semibold text-[#2463eb]">
                {timetableStats.completedSessions}
              </span>
            </div>
          </div>

          <button
            onClick={handlePasswordReset}
            className="w-full mt-6 py-2.5 px-4 rounded-xl border border-[#d2dce9] text-xs font-semibold text-[#32455f] hover:bg-[#f8faff] transition-colors flex items-center justify-center gap-2"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Send Password Reset Email</span>
          </button>
        </div>

        {/* Right Column: Performance Analytics & Saved Notes */}
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#d2dce9] rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#65748b] text-xs mb-1.5">
                <span>Overall Mastery</span>
                <TrendingUp className="w-4 h-4 text-[#2463eb]" />
              </div>
              <div className="text-2xl font-bold text-[#101827]">{overallPercentage}%</div>
              <div className="text-[11px] text-[#65748b] mt-1">Across 5 courses</div>
            </div>

            <div className="bg-white border border-[#d2dce9] rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#65748b] text-xs mb-1.5">
                <span>Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-[#101827]">
                {completedCount}
                <span className="text-sm font-normal text-[#65748b]">/{totalPortalLessons}</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Lectures finished</div>
            </div>

            <div className="bg-white border border-[#d2dce9] rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#65748b] text-xs mb-1.5">
                <span>Timetable</span>
                <CalendarCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-[#101827]">
                {timetableStats.completedSessions}
              </div>
              <div className="text-[11px] text-[#65748b] mt-1">Sessions done</div>
            </div>

            <div className="bg-white border border-[#d2dce9] rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-[#65748b] text-xs mb-1.5">
                <span>Study Time</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-[#101827]">{estimatedStudyHours}h</div>
              <div className="text-[11px] text-[#65748b] mt-1">Estimated hours</div>
            </div>
          </div>

          {/* Learning Mastery Progress */}
          <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#101827]">
                  Learning Mastery Progress
                </h3>
                <p className="text-xs text-[#65748b]">
                  Topic-wise progress across your enrolled curriculum
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#edf4ff] text-[#2463eb] text-xs font-bold">
                {overallPercentage}% Overall
              </span>
            </div>

            {/* Overall Bar */}
            <div className="h-3 bg-[#edf1f7] rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-[#2463eb] to-[#3b82f6] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(2, overallPercentage)}%` }}
              />
            </div>

            {/* Course Breakdown */}
            <div className="space-y-3.5">
              {INITIAL_COURSES.map((course) => {
                const summary = courseSummaries.find((s) => s.courseId === course.id);
                const totalLessons = course.modules.reduce(
                  (acc, m) => acc + m.lessons.length,
                  0
                );
                let doneInCourse = summary?.completedLessons || 0;
                if (!doneInCourse) {
                  course.modules.forEach((m) =>
                    m.lessons.forEach((l) => {
                      if (completedMap[l.id]) doneInCourse++;
                    })
                  );
                }
                const pct =
                  totalLessons > 0 ? Math.round((doneInCourse / totalLessons) * 100) : 0;

                // Find next lesson to resume
                let nextLessonId = course.modules[0]?.lessons[0]?.id;
                outer: for (const mod of course.modules) {
                  for (const les of mod.lessons) {
                    if (!completedMap[les.id]) {
                      nextLessonId = les.id;
                      break outer;
                    }
                  }
                }

                return (
                  <div
                    key={course.id}
                    className="p-4 rounded-2xl border border-[#e2e8f0] hover:border-[#bfd6ff] bg-[#f8fafc] transition-all"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#dceaff] text-[#2463eb] flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#101827]">
                            {course.title}
                          </h4>
                          <p className="text-[11px] text-[#65748b]">
                            {course.modules.length} Topics • {doneInCourse} of {totalLessons}{' '}
                            lectures completed
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#2463eb]">{pct}%</span>
                        {nextLessonId && (
                          <button
                            onClick={() =>
                              navigate(`/lesson/${course.id}/${nextLessonId}`)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#d2dce9] hover:border-[#2463eb] text-xs font-semibold text-[#2463eb] transition-colors"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{doneInCourse > 0 ? 'Continue' : 'Start'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#20b36b] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User's Saved Personal Notes */}
          <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#101827]">
                  My Saved Lesson Notes ({notes.length})
                </h3>
                <p className="text-xs text-[#65748b]">
                  Personal notes saved during lectures or added to your study notebook
                </p>
              </div>
              <button
                onClick={() => setAddingNote((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#edf4ff] hover:bg-[#dceaff] text-[#2463eb] text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addingNote ? 'Close Editor' : 'New Study Note'}</span>
              </button>
            </div>

            {addingNote && (
              <div className="mb-4 p-4 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] space-y-3">
                <input
                  type="text"
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  placeholder="Note Topic / Title (e.g. Python Loops Takeaways)"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-[#cbd5e1] bg-white focus:outline-none focus:border-[#2463eb]"
                />
                <textarea
                  rows={3}
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  placeholder="Write your study notes, formulas, or key reminders..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#cbd5e1] bg-white focus:outline-none focus:border-[#2463eb]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setAddingNote(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#cbd5e1] bg-white text-xs font-medium text-[#64748b]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveQuickNote}
                    className="px-4 py-1.5 rounded-lg bg-[#2463eb] text-white text-xs font-semibold hover:bg-[#1d4fd8]"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}

            {notes.length === 0 ? (
              <p className="text-xs text-[#65748b] py-6 text-center bg-[#f8fafc] rounded-2xl border border-dashed border-[#d2dce9]">
                You haven&apos;t written any lesson notes yet. Open any lesson and write in the
                &quot;My Notes&quot; tab or click <strong>+ New Study Note</strong> above.
              </p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl border border-[#d2dce9] bg-[#f8faff] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[#65748b]">
                      <span className="font-semibold text-[#2463eb] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> {note.lessonId}
                      </span>
                      {note.updatedAt && (
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="text-[#101827] whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
};
