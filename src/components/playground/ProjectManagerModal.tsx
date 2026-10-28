import React, { useState, useEffect } from 'react';
import {
  X,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  Clock,
  Search,
  Code2,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import type { CodeProject, SupportedLanguage } from '@/types/playground';
import { SUPPORTED_LANGUAGES } from '@/data/playgroundLanguages';
import { projectService } from '@/services/projectService';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string | null;
  currentProjectId?: string | null;
  onSelectProject: (project: CodeProject) => void;
  onCreateNewProject: (language: SupportedLanguage, title: string) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  uid,
  currentProjectId,
  onSelectProject,
  onCreateNewProject,
}) => {
  const [projects, setProjects] = useState<CodeProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState<SupportedLanguage>('web');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadProjects();
  }, [isOpen, uid]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await projectService.getProjectsForUser(uid || 'guest');
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    const title = newTitle.trim() || `My ${newLanguage.toUpperCase()} Project`;
    onCreateNewProject(newLanguage, title);
    setNewTitle('');
    setIsCreating(false);
    onClose();
  };

  const handleStartRename = (project: CodeProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditTitle(project.title);
  };

  const handleSaveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      await projectService.renameProject(id, editTitle.trim(), uid || 'guest');
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, title: editTitle.trim() } : p))
      );
      setEditingId(null);
    } catch (err) {
      console.error('Failed to rename project:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await projectService.deleteProject(id, uid || 'guest');
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#131d31]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FolderOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Your Saved Projects</h2>
              <p className="text-xs text-slate-400">
                {uid ? 'Cloud-synchronized with your student account' : 'Guest mode (saved locally in your browser)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#1e293b] bg-[#0c1322] flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#162032] border border-[#23334d] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition shadow-md shadow-blue-600/20"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </div>

        {/* Create New Project Drawer */}
        {isCreating && (
          <div className="p-4 bg-[#142138] border-b border-[#223554] animate-in slide-in-from-top duration-200">
            <h3 className="text-sm font-semibold text-white mb-2.5">Create New Coding Project</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Portfolio Website, QuickSort Algorithm"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0d1627] border border-[#233858] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Language</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value as SupportedLanguage)}
                  className="w-full bg-[#0d1627] border border-[#233858] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-[#1a2b47] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
              >
                Create & Open
              </button>
            </div>
          </div>
        )}

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading your projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <Code2 size={40} className="text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-300">No projects found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {searchQuery
                  ? 'No projects match your search query.'
                  : 'You have not saved any projects yet. Click "New Project" to start building!'}
              </p>
            </div>
          ) : (
            filteredProjects.map((p) => {
              const langMeta = SUPPORTED_LANGUAGES.find((l) => l.id === p.language);
              const isCurrent = currentProjectId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-950/30 border-blue-500/50 hover:border-blue-400'
                      : 'bg-[#141e30] border-[#1e2d44] hover:bg-[#18253b] hover:border-[#2a3e5e]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                        p.language === 'web'
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                          : p.language.startsWith('python')
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                          : p.language === 'c' || p.language === 'cpp'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                          : p.language === 'java'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                          : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      {p.language === 'web'
                        ? 'WEB'
                        : p.language.startsWith('python')
                        ? 'PY'
                        : p.language === 'cpp'
                        ? 'C++'
                        : p.language === 'c'
                        ? 'C'
                        : p.language === 'java'
                        ? 'JV'
                        : 'JS'}
                    </div>

                    <div className="min-w-0 flex-1">
                      {editingId === p.id ? (
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-[#0b1220] border border-blue-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(p.id, e as any);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            onClick={(e) => handleSaveRename(p.id, e)}
                            className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition">
                            {p.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              Active
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-medium">
                          {langMeta?.name || p.language}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-500" />
                          {new Date(p.updatedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition pl-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deleteConfirmId === p.id ? (
                      <div className="flex items-center gap-1.5 bg-red-950/60 border border-red-500/30 px-2 py-1 rounded-lg">
                        <AlertTriangle size={13} className="text-red-400" />
                        <span className="text-[11px] text-red-300 font-medium">Delete?</span>
                        <button
                          onClick={(e) => handleDelete(p.id, e)}
                          className="text-[11px] font-bold text-red-400 hover:text-red-200 underline ml-1"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[11px] text-slate-400 hover:text-white ml-1"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleStartRename(p, e)}
                          title="Rename project"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#223554] transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(p.id)}
                          title="Delete project"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1e293b] bg-[#0d1525] flex justify-between items-center text-xs text-slate-400">
          <span>{projects.length} project(s) saved</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#1e293b] hover:bg-[#2b3a52] text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

