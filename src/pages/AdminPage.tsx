import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  BookOpen,
  Database,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { courseService } from '@/services/courseService';
import { lessonService } from '@/services/lessonService';
import { authService } from '@/services/authService';
import { eventService } from '@/services/eventService';
import { seedInitialDatabase } from '@/services/seedData';
import { CourseModal } from '@/components/admin/CourseModal';
import { ModuleModal } from '@/components/admin/ModuleModal';
import { LessonModal } from '@/components/admin/LessonModal';
import { EventModal } from '@/components/admin/EventModal';
import { Toast } from '@/components/common/Toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Course, Module, Lesson, UserProfile, PortalEvent } from '@/types';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'missing-videos' | 'students' | 'events'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<PortalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<Module | null>(null);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<PortalEvent | null>(null);

  const [seeding, setSeeding] = useState(false);

  // Load all initial courses
  const loadCourses = async () => {
    try {
      const all = await courseService.getAllCourses();
      setCourses(all);
      if (all.length > 0 && !selectedCourseId) {
        setSelectedCourseId(all[0].id);
      }
    } catch (e: any) {
      setToastMsg('Failed to load courses: ' + e.message);
    }
  };

  // Load modules and lessons for selected course
  const loadCourseContent = async (cId: string) => {
    if (!cId) return;
    try {
      const [mods, les] = await Promise.all([
        courseService.getModulesByCourse(cId, false),
        lessonService.getLessonsByCourse(cId, false),
      ]);
      setModules(mods);
      setLessons(les);
    } catch (e: any) {
      setToastMsg('Error loading course details: ' + e.message);
    }
  };

  // Load all lessons for missing videos audit
  const loadMissingVideosAudit = async () => {
    try {
      const all: Lesson[] = [];
      for (const c of courses) {
        const cLessons = await lessonService.getLessonsByCourse(c.id, false);
        all.push(...cLessons);
      }
      setAllLessons(all);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStudents = async () => {
    try {
      const users = await authService.getAllUsers();
      setStudents(users);
    } catch (e: any) {
      setToastMsg('Error loading users: ' + e.message);
    }
  };

  const loadEvents = async () => {
    try {
      const evs = await eventService.getAllEvents();
      setEvents(evs);
    } catch (e: any) {
      setToastMsg('Error loading events: ' + e.message);
    }
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      await loadCourses();
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseContent(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (activeTab === 'missing-videos') loadMissingVideosAudit();
    if (activeTab === 'students') loadStudents();
    if (activeTab === 'events') loadEvents();
  }, [activeTab, courses.length]);

  // Seed handler
  const handleSeed = async () => {
    if (!confirm('This will populate initial Python course modules and lessons into Firestore. Proceed?')) {
      return;
    }
    setSeeding(true);
    try {
      const res = await seedInitialDatabase();
      setToastMsg(`Database seeded: ${res.coursesCreated} courses, ${res.lessonsCreated} lessons.`);
      await loadCourses();
      if (selectedCourseId) loadCourseContent(selectedCourseId);
    } catch (err: any) {
      setToastMsg('Seeding failed: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}"?`)) return;
    try {
      await courseService.deleteCourse(id);
      setToastMsg('Course deleted.');
      loadCourses();
      setSelectedCourseId('');
    } catch (err: any) {
      setToastMsg(err.message || 'Failed to delete course.');
    }
  };

  // Delete Module
  const handleDeleteModule = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete module "${title}"?`)) return;
    try {
      await courseService.deleteModule(id);
      setToastMsg('Module deleted.');
      if (selectedCourseId) loadCourseContent(selectedCourseId);
    } catch (err: any) {
      setToastMsg(err.message || 'Failed to delete module.');
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete lesson "${title}"?`)) return;
    try {
      await lessonService.deleteLesson(id);
      setToastMsg('Lesson deleted.');
      if (selectedCourseId) loadCourseContent(selectedCourseId);
    } catch (err: any) {
      setToastMsg(err.message || 'Failed to delete lesson.');
    }
  };

  // Toggle publish course
  const handleTogglePublishCourse = async (c: Course) => {
    try {
      await courseService.updateCourse(c.id, { published: !c.published });
      setToastMsg(`Course ${!c.published ? 'published' : 'unpublished'}.`);
      loadCourses();
    } catch (err: any) {
      setToastMsg(err.message);
    }
  };

  const missingVideoLessons = allLessons.filter((l) => !l.videoId || !l.videoId.trim());

  return (
    <div className="max-w-[1550px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-[#8b2df4] text-xs font-bold rounded-full">
              ADMIN CONTROL CENTER
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101827] mt-2">
            Curriculum & Content Management
          </h1>
          <p className="text-xs text-[#65748b] mt-1">
            Manage courses, modules, video IDs, student progress and learning events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f6efff] border border-purple-200 text-[#8b2df4] rounded-xl text-xs font-semibold hover:bg-[#ede0fd] transition-colors disabled:opacity-50"
            title="Seed initial Python course and portal events"
          >
            <Sparkles className="w-4 h-4" />
            <span>{seeding ? 'Seeding...' : 'Seed Python Curriculum'}</span>
          </button>

          <button
            onClick={() => {
              setCourseToEdit(null);
              setCourseModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2463eb] text-white rounded-xl text-xs font-semibold hover:bg-[#1d4fd8] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#d2dce9] gap-4 bg-white px-6 rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-3.5 px-2 border-b-2 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'courses'
              ? 'border-[#2463eb] text-[#2463eb]'
              : 'border-transparent text-[#65748b] hover:text-[#101827]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('missing-videos')}
          className={`py-3.5 px-2 border-b-2 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'missing-videos'
              ? 'border-[#2463eb] text-[#2463eb]'
              : 'border-transparent text-[#65748b] hover:text-[#101827]'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Missing Videos Audit ({missingVideoLessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`py-3.5 px-2 border-b-2 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-[#2463eb] text-[#2463eb]'
              : 'border-transparent text-[#65748b] hover:text-[#101827]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`py-3.5 px-2 border-b-2 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'events'
              ? 'border-[#2463eb] text-[#2463eb]'
              : 'border-transparent text-[#65748b] hover:text-[#101827]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events & Schedule ({events.length})</span>
        </button>
      </div>

      {/* Tab 1: Curriculum Editor */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Courses List */}
          <div className="bg-white border border-[#d2dce9] rounded-[21px] p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-[#101827] flex items-center justify-between">
              <span>Courses ({courses.length})</span>
            </h3>

            {courses.length === 0 ? (
              <p className="text-xs text-[#65748b] py-4 text-center">
                No courses exist yet. Click "Create Course" or "Seed Python Curriculum".
              </p>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => {
                  const isSelected = course.id === selectedCourseId;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#2463eb] bg-[#f0f5ff]'
                          : 'border-[#edf1f7] hover:border-[#d2dce9] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-xs sm:text-sm text-[#101827] truncate">
                          {course.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            course.published
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {course.published ? 'Live' : 'Draft'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#65748b] mt-2">
                        <span>Order #{course.order || 1}</span>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setCourseToEdit(course);
                              setCourseModalOpen(true);
                            }}
                            className="p-1 hover:text-[#2463eb]"
                            title="Edit course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleTogglePublishCourse(course)}
                            className="p-1 hover:text-[#2463eb]"
                            title={course.published ? 'Unpublish' : 'Publish'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id, course.title)}
                            className="p-1 hover:text-red-600"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modules and Lessons of Selected Course */}
          <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#edf1f7]">
              <div>
                <h2 className="text-lg font-bold text-[#101827]">
                  {courses.find((c) => c.id === selectedCourseId)?.title || 'Select a Course'}
                </h2>
                <p className="text-xs text-[#65748b] mt-0.5">
                  {modules.length} Modules • {lessons.length} Lessons configured
                </p>
              </div>

              {selectedCourseId && (
                <button
                  onClick={() => {
                    setModuleToEdit(null);
                    setModuleModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#dceaff] text-[#2463eb] text-xs font-semibold rounded-xl hover:bg-[#c8deff] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Module</span>
                </button>
              )}
            </div>

            {modules.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#65748b]">
                No modules found in this course. Click "Add Module" to start structuring lessons.
              </div>
            ) : (
              <div className="space-y-5">
                {modules.map((mod) => {
                  const modLessons = lessons.filter((l) => l.moduleId === mod.id);

                  return (
                    <div
                      key={mod.id}
                      className="border border-[#d2dce9] rounded-2xl overflow-hidden bg-[#fafcff]"
                    >
                      {/* Module Header */}
                      <div className="p-4 bg-white border-b border-[#d2dce9] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#a044f4]" />
                          <h4 className="font-semibold text-sm text-[#101827]">
                            {mod.title}
                          </h4>
                          <span className="text-xs text-[#65748b]">({modLessons.length} lessons)</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedModuleId(mod.id);
                              setLessonToEdit(null);
                              setLessonModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs bg-[#2463eb] text-white rounded-lg font-medium hover:bg-[#1d4fd8] transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Lesson</span>
                          </button>
                          <button
                            onClick={() => {
                              setModuleToEdit(mod);
                              setModuleModalOpen(true);
                            }}
                            className="p-1 text-[#65748b] hover:text-[#2463eb]"
                            title="Edit Module"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id, mod.title)}
                            className="p-1 text-[#65748b] hover:text-red-600"
                            title="Delete Module"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Module Lessons Table */}
                      <div className="p-3">
                        {modLessons.length === 0 ? (
                          <div className="py-3 text-center text-xs text-[#65748b]">
                            No lessons added to this module yet.
                          </div>
                        ) : (
                          <div className="divide-y divide-[#edf1f7]">
                            {modLessons.map((les) => (
                              <div
                                key={les.id}
                                className="py-2.5 px-3 flex items-center justify-between gap-3 text-xs bg-white rounded-lg my-1 hover:bg-[#f5f8ff] transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-[11px] text-[#65748b] w-5">
                                    #{les.order}
                                  </span>
                                  <span className="font-medium text-[#101827] truncate">
                                    {les.title}
                                  </span>
                                  {les.videoId ? (
                                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-200">
                                      Video: {les.videoId}
                                    </span>
                                  ) : (
                                    <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded border border-amber-200">
                                      Missing Video ID
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => {
                                      setSelectedModuleId(mod.id);
                                      setLessonToEdit(les);
                                      setLessonModalOpen(true);
                                    }}
                                    className="p-1 text-[#65748b] hover:text-[#2463eb]"
                                    title="Edit Lesson"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(les.id, les.title)}
                                    className="p-1 text-[#65748b] hover:text-red-600"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Missing Videos Audit */}
      {activeTab === 'missing-videos' && (
        <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#101827]">
                Missing YouTube Video IDs ({missingVideoLessons.length})
              </h2>
              <p className="text-xs text-[#65748b] mt-0.5">
                These lessons are published or drafted in the portal without an attached YouTube video ID.
                Assign real IDs to enable in-portal video streaming.
              </p>
            </div>
          </div>

          {missingVideoLessons.length === 0 ? (
            <div className="py-12 text-center text-sm text-emerald-600 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8" />
              <span>Great job! Every lesson in your curriculum has a verified video attached.</span>
            </div>
          ) : (
            <div className="divide-y divide-[#edf1f7] border border-[#d2dce9] rounded-xl overflow-hidden">
              {missingVideoLessons.map((les) => (
                <div
                  key={les.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white hover:bg-[#f8faff]"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-[#101827]">{les.title}</h4>
                    <p className="text-xs text-[#65748b] mt-0.5">{les.description}</p>
                    <span className="inline-block mt-1 font-mono text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Course: {courses.find((c) => c.id === les.courseId)?.title || les.courseId}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCourseId(les.courseId);
                      setSelectedModuleId(les.moduleId);
                      setLessonToEdit(les);
                      setLessonModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#2463eb] text-white rounded-lg text-xs font-semibold hover:bg-[#1d4fd8] transition-colors self-start sm:self-auto shrink-0"
                  >
                    Assign Video ID
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Registered Students */}
      {activeTab === 'students' && (
        <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#101827]">Registered Students ({students.length})</h2>
            <p className="text-xs text-[#65748b] mt-0.5">
              Authorized view of user profiles from Cloud Firestore.
            </p>
          </div>

          {students.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#65748b]">No students found in database.</div>
          ) : (
            <div className="overflow-x-auto border border-[#d2dce9] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] border-b border-[#d2dce9] text-[#65748b] uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">User ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f7]">
                  {students.map((u) => (
                    <tr key={u.uid} className="hover:bg-[#f9fbff]">
                      <td className="p-3.5 font-medium text-[#101827]">{u.displayName}</td>
                      <td className="p-3.5 text-[#65748b]">{u.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-[#2463eb]'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#65748b]">{u.uid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Events & Schedule */}
      {activeTab === 'events' && (
        <div className="bg-white border border-[#d2dce9] rounded-[21px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#101827]">Learning Schedule & Events ({events.length})</h2>
              <p className="text-xs text-[#65748b] mt-0.5">
                Manage upcoming workshops and sessions shown on student dashboards.
              </p>
            </div>
            <button
              onClick={() => {
                setEventToEdit(null);
                setEventModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#2463eb] text-white rounded-xl text-xs font-semibold hover:bg-[#1d4fd8] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-[#d2dce9] flex items-center justify-between gap-4 text-xs bg-white hover:bg-[#f8faff]"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#101827]">{ev.title}</span>
                    <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full text-[10px] font-bold">
                      {ev.tag || 'Reminder'}
                    </span>
                  </div>
                  <p className="text-[#65748b]">{ev.description}</p>
                  <span className="text-[11px] text-[#2463eb] font-medium mt-1 inline-block">
                    {new Date(ev.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEventToEdit(ev);
                      setEventModalOpen(true);
                    }}
                    className="p-1 text-[#65748b] hover:text-[#2463eb]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete event "${ev.title}"?`)) return;
                      await eventService.deleteEvent(ev.id);
                      setToastMsg('Event deleted.');
                      loadEvents();
                    }}
                    className="p-1 text-[#65748b] hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <CourseModal
        isOpen={courseModalOpen}
        courseToEdit={courseToEdit}
        onClose={() => setCourseModalOpen(false)}
        onSuccess={() => {
          setToastMsg('Course saved successfully.');
          loadCourses();
        }}
      />

      <ModuleModal
        isOpen={moduleModalOpen}
        courseId={selectedCourseId}
        moduleToEdit={moduleToEdit}
        onClose={() => setModuleModalOpen(false)}
        onSuccess={() => {
          setToastMsg('Module saved successfully.');
          if (selectedCourseId) loadCourseContent(selectedCourseId);
        }}
      />

      <LessonModal
        isOpen={lessonModalOpen}
        courseId={selectedCourseId}
        moduleId={selectedModuleId}
        lessonToEdit={lessonToEdit}
        onClose={() => setLessonModalOpen(false)}
        onSuccess={() => {
          setToastMsg('Lesson saved successfully.');
          if (selectedCourseId) loadCourseContent(selectedCourseId);
          if (activeTab === 'missing-videos') loadMissingVideosAudit();
        }}
      />

      <EventModal
        isOpen={eventModalOpen}
        eventToEdit={eventToEdit}
        onClose={() => setEventModalOpen(false)}
        onSuccess={() => {
          setToastMsg('Event saved successfully.');
          loadEvents();
        }}
      />

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
};
