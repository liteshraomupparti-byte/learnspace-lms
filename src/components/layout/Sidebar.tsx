import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Lightbulb, Award, Settings, Code2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `min-h-[72px] md:min-h-[76px] rounded-2xl flex flex-col items-center justify-center gap-1.5 md:gap-2 px-1 py-2 text-[11px] md:text-xs font-medium text-center transition-all ${
      isActive
        ? 'bg-[#dceaff] text-[#2463eb] font-semibold shadow-sm'
        : 'bg-transparent text-[#182b47] hover:bg-[#f3f7ff]'
    }`;

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex w-[108px] lg:w-[128px] bg-white border-r border-[#d2dce9] p-4 lg:p-6 flex-col items-stretch gap-2.5 min-h-[calc(100vh-82px)] shrink-0">
        <NavLink to="/" end className={navClass}>
          <Home className="w-5 h-5 lg:w-6 lg:h-6" />
          <span>Home</span>
        </NavLink>

        <NavLink to="/curriculum" className={navClass}>
          <BookOpen className="w-5 h-5 lg:w-6 lg:h-6" />
          <span>Curriculum</span>
        </NavLink>

        <div className="h-12 lg:h-16 flex items-center justify-center font-extrabold text-base lg:text-lg italic text-[#34435a] tracking-tighter select-none">
          GRIT
        </div>

        <NavLink to="/other-courses" className={navClass}>
          <Lightbulb className="w-5 h-5 lg:w-6 lg:h-6" />
          <span className="leading-tight">
            Other<br />Courses
          </span>
        </NavLink>

        <NavLink to="/exams" className={navClass}>
          <Award className="w-5 h-5 lg:w-6 lg:h-6" />
          <span>Exams</span>
        </NavLink>

        <NavLink to="/playground" className={navClass}>
          <Code2 className="w-5 h-5 lg:w-6 lg:h-6 text-[#2463eb]" />
          <span>Playground</span>
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={navClass}>
            <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-[#a855f7]" />
            <span className="text-[#a855f7]">Admin</span>
          </NavLink>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#d2dce9] h-16 px-2 grid grid-cols-4 sm:grid-cols-5 gap-1 items-center shadow-lg">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#2463eb] bg-[#dceaff]' : 'text-[#65748b]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/curriculum"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#2463eb] bg-[#dceaff]' : 'text-[#65748b]'
            }`
          }
        >
          <BookOpen className="w-5 h-5" />
          <span>Curriculum</span>
        </NavLink>

        <NavLink
          to="/other-courses"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#2463eb] bg-[#dceaff]' : 'text-[#65748b]'
            }`
          }
        >
          <Lightbulb className="w-5 h-5" />
          <span>Courses</span>
        </NavLink>

        <NavLink
          to="/exams"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#2463eb] bg-[#dceaff]' : 'text-[#65748b]'
            }`
          }
        >
          <Award className="w-5 h-5" />
          <span>Exams</span>
        </NavLink>

        <NavLink
          to="/playground"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#2463eb] bg-[#dceaff]' : 'text-[#65748b]'
            }`
          }
        >
          <Code2 className="w-5 h-5" />
          <span>Code</span>
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#a855f7] bg-purple-100' : 'text-[#a855f7]'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>
    </>
  );
};
