
import React from 'react';
import { 
  LayoutDashboard, ShoppingCart, Truck, ClipboardList, 
  Settings, FileText, Package, History, Box, Users
} from 'lucide-react';
import { ActiveModule, Theme } from '../types';

interface SidebarProps {
  theme: Theme;
  activeModule: ActiveModule;
  onNavigate: (module: ActiveModule) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mode: 'full' | 'slim';
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  theme, 
  activeModule, 
  onNavigate, 
  sidebarOpen, 
  setSidebarOpen, 
  mode 
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Lager', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Artikel', icon: <Box size={20} /> },
    { id: 'order-management', label: 'Bestellungen', icon: <FileText size={20} /> },
    { id: 'receipt-management', label: 'Wareneingang', icon: <ClipboardList size={20} /> },
    { id: 'stock-logs', label: 'Lagerprotokoll', icon: <History size={20} /> },
    { id: 'suppliers', label: 'Lieferanten', icon: <Users size={20} /> },
  ];

  return (
      <aside className={`fixed top-0 left-0 z-50 h-screen border-r transition-all duration-300 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${mode === 'slim' ? 'lg:w-20' : 'lg:w-64'}
        w-64
        ${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200 shadow-xl lg:shadow-none'}
      `}>
        
        <div className="h-full flex flex-col">
           {/* Logo Area */}
           <div className={`p-6 flex items-center gap-4 ${mode === 'slim' && 'lg:justify-center lg:px-2'}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                 <Package className="text-white" size={24} />
              </div>
              <div className={`transition-opacity duration-300 flex flex-col ${mode === 'slim' && 'lg:hidden'}`}>
                  <div className="font-black italic text-[#0077B5] text-lg tracking-tighter leading-none">DOST</div>
                  <div className="font-black italic text-[#E2001A] text-lg tracking-tighter leading-none mt-0.5">INFOSYS</div>
              </div>
           </div>

           {/* Nav */}
           <nav className="flex-1 px-3 py-6 space-y-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                      onNavigate(item.id as ActiveModule);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    activeModule === item.id 
                      ? 'bg-[#0077B5] text-white shadow-md shadow-blue-500/25' 
                      : isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  } ${mode === 'slim' && 'lg:justify-center'}`}
                  title={mode === 'slim' ? item.label : undefined}
                >
                   <div className="relative z-10 shrink-0">{item.icon}</div>
                   <span className={`font-bold text-sm whitespace-nowrap transition-all ${mode === 'slim' && 'lg:hidden'}`}>{item.label}</span>
                   {activeModule === item.id && (
                     <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                   )}
                </button>
              ))}
           </nav>

           {/* Bottom Actions */}
           <div className={`p-4 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
               <button 
                  onClick={() => {
                      onNavigate('settings');
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                    activeModule === 'settings' 
                    ? 'bg-slate-800 text-white' 
                    : isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
                  } ${mode === 'slim' && 'lg:justify-center'}`}
                  title={mode === 'slim' ? "Einstellungen" : undefined}
               >
                  <Settings size={20} />
                  <span className={`${mode === 'slim' && 'lg:hidden'}`}>Einstellungen</span>
               </button>
           </div>
        </div>
      </aside>
  );
};
