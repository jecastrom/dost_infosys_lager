
import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, Activity, FileText, Briefcase, MousePointer2 } from 'lucide-react';
import { StockLog, Theme } from '../types';

interface StockLogViewProps {
  logs: StockLog[];
  onBack: () => void;
  theme: Theme;
}

export const StockLogView: React.FC<StockLogViewProps> = ({ logs, onBack, theme }) => {
  const isDark = theme === 'dark';
  const [activeFilter, setActiveFilter] = useState<'all' | 'manual' | 'po-normal' | 'po-project'>('all');

  // Sort logs by timestamp (Newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter logs based on active tab
  const filteredLogs = sortedLogs.filter(log => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'manual') return log.context === 'manual' || log.source === 'Manuell';
      if (activeFilter === 'po-normal') return log.context === 'po-normal';
      if (activeFilter === 'po-project') return log.context === 'po-project';
      return true;
  });

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in slide-in-from-right-8 duration-300">
        {/* Header */}
        <div className="mb-6">
             <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-slate-500 hover:text-[#0077B5] text-sm font-bold transition-colors mb-4"
             >
                <ArrowLeft size={16} /> Zurück
            </button>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="text-[#0077B5]" /> Lagerprotokoll
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Detaillierter Verlauf aller Warenbewegungen.</p>
                </div>
            </div>
        </div>

        {/* Filter Tabs */}
        <div className={`flex gap-6 border-b px-2 mb-6 overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
             <button 
                onClick={() => setActiveFilter('all')}
                className={`pb-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeFilter === 'all' 
                    ? 'text-[#0077B5] border-[#0077B5]' 
                    : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                }`}
             >
                Alle
             </button>
             <button 
                onClick={() => setActiveFilter('manual')}
                className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                    activeFilter === 'manual' 
                    ? 'text-[#0077B5] border-[#0077B5]' 
                    : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                }`}
             >
                Manuell
             </button>
             <button 
                onClick={() => setActiveFilter('po-normal')}
                className={`pb-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${
                    activeFilter === 'po-normal' 
                    ? 'text-[#0077B5] border-[#0077B5]' 
                    : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                }`}
             >
                PO-Normal
             </button>
             <button 
                onClick={() => setActiveFilter('po-project')}
                className={`pb-3 font-bold text-sm flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                    activeFilter === 'po-project' 
                    ? 'text-[#0077B5] border-[#0077B5]' 
                    : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
                }`}
             >
                PO-Projekt
             </button>
        </div>

        {/* Table Container */}
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[1000px]">
                    <thead className={`border-b ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        <tr>
                            <th className="p-4 font-semibold whitespace-nowrap w-48">Datum</th>
                            <th className="p-4 font-semibold whitespace-nowrap w-40">Nutzer</th>
                            <th className="p-4 font-semibold">Artikel</th>
                            <th className="p-4 font-semibold w-40">Vorgang</th>
                            <th className="p-4 font-semibold text-right w-24">Bestand</th>
                            <th className={`p-4 font-semibold text-right w-32 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Projekt / Verbrauch</th>
                            <th className="p-4 font-semibold w-48">Referenz / PO</th>
                            <th className="p-4 font-semibold text-right w-40">Lager</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/10">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-slate-500 italic">
                                    Keine Protokolleinträge für diesen Filter gefunden.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map(log => {
                                const isProject = log.context === 'project' || log.context === 'po-project';
                                
                                return (
                                    <tr 
                                        key={log.id} 
                                        className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                                    >
                                        <td className="p-4 whitespace-nowrap">
                                            <div className={`flex items-center gap-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                <Calendar size={14} className="opacity-50" />
                                                {new Date(log.timestamp).toLocaleString('de-DE', { 
                                                    day: '2-digit', 
                                                    month: '2-digit', 
                                                    year: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <User size={14} className="opacity-70" /> {log.userName}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                {log.itemName}
                                            </div>
                                            <div className="text-xs font-mono opacity-50 mt-0.5">
                                                {log.itemId}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1.5 items-start">
                                                {log.action === 'add' ? (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                                                        Hinzugefügt
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-100 border-amber-200 text-amber-700'}`}>
                                                        Entnommen
                                                    </span>
                                                )}
                                                
                                                {(log.context === 'project' || log.context === 'po-project') && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                                                        <Briefcase size={10} /> PROJEKT
                                                    </span>
                                                )}
                                                
                                                {(log.context === 'manual' || log.source === 'Manuell') && (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                                        <MousePointer2 size={10} /> MANUELL
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* Column: Bestand (Inventory Assets) */}
                                        <td className="p-4 text-right">
                                            {!isProject ? (
                                                log.action === 'add' ? (
                                                    <span className={`font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                        +{log.quantity}
                                                    </span>
                                                ) : (
                                                    <span className={`font-bold font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                                        -{log.quantity}
                                                    </span>
                                                )
                                            ) : (
                                                <span className="opacity-30">-</span>
                                            )}
                                        </td>

                                        {/* Column: Projekt / Verbrauch (Throughput) */}
                                        <td className="p-4 text-right">
                                            {isProject ? (
                                                <div className="flex items-center justify-end gap-1.5" title="Direkt dem Projekt zugeordnet (Durchlaufposten)">
                                                    <Briefcase size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                                                    <span className={`text-lg font-bold font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                        {log.quantity}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="opacity-30">-</span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            {log.source ? (
                                                <div className={`flex items-center gap-1.5 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    <FileText size={12} className="opacity-50" />
                                                    {log.source}
                                                </div>
                                            ) : (
                                                <span className="opacity-30 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-xs font-medium opacity-70 px-2 py-1 rounded bg-slate-500/10">
                                                {log.warehouse}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
