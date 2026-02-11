
import React, { useMemo } from 'react';
import { Package, Activity, ShoppingCart, ClipboardCheck, AlertOctagon, ArrowRight, Calendar, User, FileText, MousePointer2, Briefcase } from 'lucide-react';
import { StockItem, StockLog, Theme, ActiveModule, PurchaseOrder, ReceiptMaster, Ticket } from '../types';
import { InsightsRow } from './InsightsRow';

interface DashboardProps {
  inventory: StockItem[];
  logs: StockLog[];
  theme: Theme;
  onAddStock: () => void;
  onNavigate: (module: ActiveModule) => void;
  orders: PurchaseOrder[];
  receipts: ReceiptMaster[];
  tickets: Ticket[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  inventory,
  logs,
  theme,
  onAddStock,
  onNavigate,
  orders = [],
  receipts = [],
  tickets = []
}) => {
  const isDark = theme === 'dark';

  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
    const openOrders = orders.filter(o => !['Abgeschlossen', 'Storniert'].includes(o.status)).length;
    // Count receipts that are 'Offen' (Active)
    const pendingReceipts = receipts.filter(r => r.status === 'Offen').length;
    const openIssues = tickets.filter(t => t.status === 'Open').length;

    return { openOrders, pendingReceipts, openIssues };
  }, [orders, receipts, tickets]);

  // --- Recent Activity (Last 5 Logs) ---
  const recentLogs = useMemo(() => {
    return [...logs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
  }, [logs]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
       {/* Header Actions */}
       <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
             <h2 className="text-2xl font-bold mb-1">Lager Übersicht</h2>
             <p className="text-slate-500 text-sm">Prozess-Status & Bestands-Highlights.</p>
          </div>
          <div className="flex items-center gap-2">
              <button
                  onClick={() => onNavigate('stock-logs')}
                  className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white border hover:bg-slate-50 text-slate-600'
                  }`}
              >
                  <Activity size={20} /> Protokoll
              </button>
              <button 
                onClick={onAddStock} 
                className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                    isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                }`}
              >
                <Package size={20} /> Wareneingang
              </button>
          </div>
       </div>

       {/* OPERATIVE ÜBERSICHT (WORKFLOW PULSE) */}
       <div className="space-y-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Operative Übersicht
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Card 1: Einkauf */}
             <button 
                onClick={() => onNavigate('order-management')}
                className={`p-5 rounded-2xl border flex items-center justify-between transition-all group ${
                    isDark 
                    ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' 
                    : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'
                }`}
             >
                <div className="flex items-center gap-5">
                    <div className={`p-3.5 rounded-xl shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <ShoppingCart size={28} />
                    </div>
                    <div className="text-left">
                        <div className={`text-3xl font-black leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.openOrders}</div>
                        <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Offene Bestellungen</div>
                    </div>
                </div>
             </button>

             {/* Card 2: Wareneingang */}
             <button 
                onClick={() => onNavigate('receipt-management')}
                className={`p-5 rounded-2xl border flex items-center justify-between transition-all group ${
                    isDark 
                    ? 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20' 
                    : 'bg-white border-slate-200 hover:border-purple-500 hover:shadow-md'
                }`}
             >
                <div className="flex items-center gap-5">
                    <div className={`p-3.5 rounded-xl shrink-0 ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                        <ClipboardCheck size={28} />
                    </div>
                    <div className="text-left">
                        <div className={`text-3xl font-black leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.pendingReceipts}</div>
                        <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Warten auf Prüfung</div>
                    </div>
                </div>
             </button>

             {/* Card 3: Qualität / Tickets */}
             <button 
                onClick={() => onNavigate('receipt-management')}
                className={`p-5 rounded-2xl border flex items-center justify-between transition-all group ${
                    isDark 
                    ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
                    : 'bg-white border-slate-200 hover:border-red-500 hover:shadow-md'
                }`}
             >
                <div className="flex items-center gap-5">
                    <div className={`p-3.5 rounded-xl shrink-0 ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                        <AlertOctagon size={28} />
                    </div>
                    <div className="text-left">
                        <div className={`text-3xl font-black leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metrics.openIssues}</div>
                        <div className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-red-400' : 'text-red-600'}`}>Offene Reklamationen</div>
                    </div>
                </div>
             </button>
          </div>
       </div>

       {/* Insights Row (High-Value Analytics) */}
       <div className="space-y-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Lager Fokus
          </h3>
          <InsightsRow logs={logs} inventory={inventory} theme={theme} />
       </div>

       {/* Recent Activity Section */}
       <div className="space-y-3">
          <div className="flex justify-between items-end px-1">
             <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
               Letzte Aktivitäten
             </h3>
             <button 
               onClick={() => onNavigate('stock-logs')}
               className="text-xs font-bold text-[#0077B5] hover:underline flex items-center gap-1"
             >
               Alle anzeigen <ArrowRight size={12} />
             </button>
          </div>
          
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className={`border-b ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                   <tr>
                     <th className="p-4 font-semibold w-40">Zeitpunkt</th>
                     <th className="p-4 font-semibold w-40">Nutzer</th>
                     <th className="p-4 font-semibold">Artikel & Vorgang</th>
                     <th className="p-4 font-semibold text-right w-24">Bestand</th>
                     <th className={`p-4 font-semibold text-right w-24 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Projekt</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-500/10">
                    {recentLogs.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 italic">Keine Aktivitäten verzeichnet.</td>
                        </tr>
                    ) : (
                        recentLogs.map(log => {
                            const isProject = log.context === 'project' || log.context === 'po-project';
                            
                            return (
                                <tr key={log.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-2 font-mono text-xs opacity-70 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <Calendar size={12} />
                                            {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                            <User size={12} /> {log.userName}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{log.itemName}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {log.context === 'project' || log.context === 'po-project' ? (
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                                                        <Briefcase size={10} /> Projekt
                                                    </span>
                                                ) : log.context === 'manual' ? (
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                                        <MousePointer2 size={10} /> Manuell
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                                        <FileText size={10} /> Regulär
                                                    </span>
                                                )}
                                                {log.source && (
                                                    <span className="text-[10px] opacity-50 font-mono flex items-center gap-1">
                                                        via {log.source}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Bestand Column */}
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

                                    {/* Projekt Column */}
                                    <td className="p-4 text-right">
                                        {isProject ? (
                                            <div className="flex items-center justify-end gap-1.5" title="Projekt Verbrauch">
                                                <Briefcase size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                                                <span className={`text-lg font-bold font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    {log.quantity}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="opacity-30">-</span>
                                        )}
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
    </div>
  );
};
