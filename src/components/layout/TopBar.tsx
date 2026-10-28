import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Zap, Bookmark, ChevronDown, LogOut, User, ShieldAlert, Settings, Code2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TopBarProps {
  onOpenSearch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSearch }) => {
  const { currentUser, logout, isAdmin, isConfigured } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'LS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-[82px] bg-white border-b border-[#d2dce9] flex items-center justify-between px-6 md:px-8 sticky top-0 z-30 transition-all">
      {/* Brand */}
      <Link to="/" className="flex items-center shrink-0">
        <img
          src="/learnspace-logo.png"
          alt="LearnSpace — Your Learning Portal"
          className="h-10 sm:h-11 md:h-12 w-auto object-contain select-none"
        />
      </Link>

      {/* Top Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {!isConfigured && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Firebase: configure .env</span>
          </div>
        )}

        {/* Shortcuts */}
        <button
          onClick={() => navigate('/curriculum')}
          className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-[#d2dce9] bg-white text-[#32435d] flex items-center justify-center hover:bg-[#f5f8ff] hover:text-[#2463eb] transition-colors"
          title="Curriculum Shortcut"
          aria-label="Curriculum Shortcut"
        >
          <Bookmark className="w-5 h-5" />
        </button>

        {/* Search */}
        <button
          onClick={onOpenSearch}
          className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-[#d2dce9] bg-white text-[#32435d] flex items-center justify-center hover:bg-[#f5f8ff] hover:text-[#2463eb] transition-colors"
          title="Search curriculum (Cmd+K)"
          aria-label="Search curriculum"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Quick Action */}
        <button
          onClick={() => navigate('/curriculum')}
          className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-[#d2dce9] bg-white text-[#32435d] flex items-center justify-center hover:bg-[#f5f8ff] hover:text-[#2463eb] transition-colors"
          title="Quick Jump"
          aria-label="Quick Jump"
        >
          <Zap className="w-5 h-5" />
        </button>

        {/* Code Playground */}
        <button
          onClick={() => navigate('/playground')}
          className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-[#d2dce9] bg-white text-[#32435d] flex items-center justify-center hover:bg-[#f5f8ff] hover:text-[#2463eb] transition-colors"
          title="Code Playground (Python, Web, C++, Java)"
          aria-label="Code Playground"
        >
          <Code2 className="w-5 h-5" />
        </button>

        <div className="h-9 w-[1px] bg-[#d2dce9] mx-1 hidden sm:block" />

        {/* User Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          {currentUser ? (
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 text-left p-1 rounded-xl hover:bg-[#f8faff] transition-colors"
              aria-label="User menu"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Student'}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border border-[#d2dce9] shadow-sm shrink-0"
                />
              ) : (
                <span className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#526a86] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {getInitials(currentUser.displayName)}
                </span>
              )}
              <div className="hidden sm:block leading-tight">
                <span className="font-semibold text-sm text-[#101827] block truncate max-w-[120px]">
                  {currentUser.displayName || 'Student'}
                </span>
                <span className="text-xs text-[#63758e]">
                  {currentUser.role === 'admin' ? 'Administrator' : 'My Learning Profile'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#63758e]" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-[#2463eb] hover:bg-[#dceaff] rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-semibold text-white bg-[#2463eb] hover:bg-[#1d4fd8] rounded-xl transition-colors shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Dropdown Menu */}
          {dropdownOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#d2dce9] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-[#edf1f7]">
                <p className="text-xs text-[#65748b]">Signed in as</p>
                <p className="text-sm font-semibold text-[#101827] truncate">{currentUser.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    Administrator
                  </span>
                )}
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#33445d] hover:bg-[#f0f5ff] hover:text-[#2463eb] transition-colors"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/playground"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#33445d] hover:bg-[#f0f5ff] hover:text-[#2463eb] transition-colors"
              >
                <Code2 className="w-4 h-4 text-[#2463eb]" />
                <span>Code Playground</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#a855f7] hover:bg-purple-50 transition-colors font-medium"
                >
                  <Settings className="w-4 h-4" />
                  <span>Admin Management</span>
                </Link>
              )}

              <div className="border-t border-[#edf1f7] my-1" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
