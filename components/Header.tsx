
import React from 'react';
import { Sun, Moon, Menu, Package } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  totalItems: number;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  theme,
  toggleTheme,
  totalItems,
  onToggleSidebar,
  sidebarOpen
}) => {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-500 ${
      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/50 border-[#CACCCE]/60 shadow-sm shadow-slate-200/20'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Top Row: Mobile Menu + Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onToggleSidebar}
              className={`p-2 rounded-lg transition-all lg:hidden ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-[#86888A]'
              }`}
            >
              <Menu size={20} />
            </button>
            
            {/* Mobile Logo - Hidden on Desktop as Sidebar handles branding */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex flex-col leading-none select-none">
                <span className="font-black italic text-[#005697] text-lg tracking-tighter">DOST</span>
                <span className="font-black italic text-[#E2001A] text-lg tracking-tighter mt-0.5">INFOSYS</span>
              </div>
              <div className="h-8 w-px bg-slate-500/20 mx-1"></div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center shadow-md shadow-blue-500/20">
                <Package className="text-white" size={18} />
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center justify-end gap-2 shrink-0 ml-auto">
            
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-[#86888A] hover:text-[#000000] hover:bg-white/60'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Profile */}
            <div className={`hidden md:block w-10 h-10 rounded-full border-2 overflow-hidden ml-2 ring-2 transition-all ${
              isDark ? 'border-slate-700 ring-blue-500/20' : 'border-white ring-[#CACCCE] shadow-md shadow-slate-200/40'
            }`}>
              <img src="https://picsum.photos/seed/user/100" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
