import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { SearchModal } from '../common/SearchModal';

export const AppLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K or Ctrl+K to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fc] text-[#101827]">
      <TopBar onOpenSearch={() => setSearchOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-9 max-w-[1900px] mx-auto w-full pb-24 md:pb-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
