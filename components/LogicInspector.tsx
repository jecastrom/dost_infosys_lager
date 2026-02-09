
import React, { useMemo } from 'react';
import { ArrowLeft, Database, AlertCircle, Briefcase, CheckCircle2, XCircle, AlertTriangle, Calculator, Layers, FileText } from 'lucide-react';
import { PurchaseOrder, ReceiptMaster, Theme, Ticket, ReceiptHeader } from '../types';
import { MOCK_TICKETS, MOCK_RECEIPT_HEADERS } from '../data'; // direct access for debugging context

interface LogicInspectorProps {
  orders: PurchaseOrder[];
  receiptMasters: ReceiptMaster[];
  onBack: () => void;
  theme: Theme;
}

export const LogicInspector: React.FC<LogicInspectorProps> = ({ orders, receiptMasters, onBack, theme }) => {
  const isDark = theme === 'dark';

  // --- 1. DATA AGGREGATION & TRUTH CALCULATION ---
  const debugRows = useMemo(() => {
    return orders.map(po => {
      // Linked Data
      const master = receiptMasters.find(m => m.poId === po.id);
      
      // Find headers linked to this PO to find tickets
      const linkedHeaders = MOCK_RECEIPT_HEADERS.filter(h => h.bestellNr === po.id);
      const linkedBatchIds = linkedHeaders.map(h => h.batchId);
      
      // Find tickets linked to those receipts
      const linkedTickets = MOCK_TICKETS.filter(t => linkedBatchIds.includes(t.receiptId));

      // Math Calculation
      const qtyOrdered = po.items.reduce((sum, i) => sum + i.quantityExpected, 0);
      
      let qtyReceived = 0;
      // Calculate from Receipt Master (Truth for Stock)
      if (master) {
          master.deliveries.forEach(d => {
              d.items.forEach(i => qtyReceived += i.receivedQty);
          });
      } else {
          // Fallback to PO items if master missing (legacy)
          qtyReceived = po.items.reduce((sum, i) => sum + i.quantityReceived, 0);
      }

      const completeness = qtyOrdered > 0 ? (qtyReceived / qtyOrdered) * 100 : 0;
      
      return {
        po,
        master,
        tickets: linkedTickets,
        math: {
            ordered: qtyOrdered,
            received: qtyReceived,
            completeness,
            isOver: qtyReceived > qtyOrdered,
            isComplete: qtyReceived === qtyOrdered,
            isPartial: qtyReceived > 0 && qtyReceived < qtyOrdered,
            isZero: qtyReceived === 0
        }
      };
    });
  }, [orders, receiptMasters]);

  // --- 2. LOGIC MIRROR: PO VIEW BADGES ---
  // Replicates OrderManagement.tsx
  const renderPOViewBadges = (row: typeof debugRows[0]) => {
    const { po, master } = row;
    const badges: React.ReactNode[] = [];

    // Identity
    if (po.status === 'Projekt' || po.id.toLowerCase().includes('projekt')) {
        badges.push(
            <span key="proj" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-500/30 bg-blue-500/10 text-blue-500 flex items-center gap-1">
                <Briefcase size={8} /> PROJEKT
            </span>
        );
    }

    // Lifecycle
    const { isZero, isPartial, isComplete, isOver } = row.math;
    
    if (po.status === 'Abgeschlossen') {
        badges.push(<span key="done" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">ERLEDIGT</span>);
    } else if (isZero) {
        badges.push(<span key="open" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-500/30 bg-slate-500/10 text-slate-500">OFFEN</span>);
    } else if (isPartial) {
        badges.push(<span key="part" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-500">TEILLIEFERUNG</span>);
    } else if (isComplete || isOver) {
        badges.push(<span key="done_math" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">ERLEDIGT (MATH)</span>);
    }

    // Strict Action (The "In Prüfung" Logic)
    if (master) {
        if (master.status === 'In Prüfung' || (master.status as string) === 'Wartet auf Prüfung') {
             badges.push(<span key="check" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#6264A7]/30 bg-[#6264A7]/10 text-[#6264A7]">IN PRÜFUNG</span>);
        }
        if ((master.status as string) === 'Schaden') {
             badges.push(<span key="dmg" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-red-500/30 bg-red-500/10 text-red-500">SCHADEN</span>);
        }
    } else if (po.linkedReceiptId) {
         badges.push(<span key="check_legacy" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#6264A7]/30 bg-[#6264A7]/10 text-[#6264A7]">IN PRÜFUNG (LEGACY)</span>);
    }

    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  // --- 3. LOGIC MIRROR: RECEIPT VIEW BADGES ---
  // Replicates ReceiptManagement.tsx
  const renderReceiptViewBadges = (row: typeof debugRows[0]) => {
    const { po, master, tickets } = row;
    const badges: React.ReactNode[] = [];
    const status = master ? master.status : 'Offen';

    // Source Identity
    if (po.status === 'Projekt' || po.id.toLowerCase().includes('projekt')) {
        badges.push(
            <span key="proj" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-500/30 bg-blue-500/10 text-blue-500 flex items-center gap-1">
                <Briefcase size={8} /> PROJEKT
            </span>
        );
    }

    // Ticket Status
    const hasOpen = tickets.some(t => t.status === 'Open');
    const hasClosed = tickets.length > 0 && tickets.every(t => t.status === 'Closed');

    if (hasOpen) {
        badges.push(<span key="t_open" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-red-500/30 bg-red-500/10 text-red-500 animate-pulse">REKLAMATION</span>);
    } else if (hasClosed) {
        badges.push(<span key="t_closed" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">FALL GELÖST</span>);
    }

    // Master Status
    if (status === 'In Prüfung' || (status as string) === 'Wartet auf Prüfung') {
        badges.push(<span key="check" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-[#6264A7]/30 bg-[#6264A7]/10 text-[#6264A7]">IN PRÜFUNG</span>);
    } else if ((status as string) === 'Gebucht' || (status as string) === 'Abgeschlossen') {
        badges.push(<span key="booked" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">GEBUCHT</span>);
    } else if ((status as string) === 'Schaden') {
        badges.push(<span key="dmg" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-red-500/30 bg-red-500/10 text-red-500">SCHADEN</span>);
    } else {
        badges.push(<span key="other" className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-500/30 bg-slate-500/10 text-slate-500 uppercase">{status}</span>);
    }

    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  const getMathColor = (m: typeof debugRows[0]['math']) => {
      if (m.isZero) return 'text-red-500';
      if (m.isPartial) return 'text-amber-500';
      if (m.isComplete) return 'text-emerald-500';
      if (m.isOver) return 'text-blue-500';
      return 'text-slate-500';
  };

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
            <button 
                onClick={onBack} 
                className="flex items-center gap-2 text-slate-500 hover:text-[#0077B5] mb-2 text-sm font-bold transition-colors"
            >
                <ArrowLeft size={16}/> Zurück zu Einstellungen
            </button>
            <h2 className="text-3xl font-bold flex items-center gap-3">
                <Database className="text-[#0077B5]" /> Truth vs. UI Debugger
            </h2>
            <p className="text-slate-500 mt-1">Vergleich der Datenbank-Wahrheit mit der visuellen Darstellung (Status-Matrix).</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Datensätze</div>
                <div className="font-mono font-bold text-lg leading-none">{orders.length} POs</div>
            </div>
            <div className={`w-px h-8 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
            <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">Masters</div>
                <div className="font-mono font-bold text-lg leading-none">{receiptMasters.length}</div>
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className={`border-b ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <tr>
                        <th className="p-4 w-64 uppercase text-xs font-bold tracking-wider">
                            <div className="flex items-center gap-2"><FileText size={14}/> PO Identity (Source)</div>
                        </th>
                        <th className="p-4 w-48 uppercase text-xs font-bold tracking-wider">
                            <div className="flex items-center gap-2"><Calculator size={14}/> Math (Rec / Ord)</div>
                        </th>
                        <th className="p-4 w-64 uppercase text-xs font-bold tracking-wider">
                            <div className="flex items-center gap-2"><Database size={14}/> Raw DB Status (Truth)</div>
                        </th>
                        <th className="p-4 w-64 uppercase text-xs font-bold tracking-wider bg-blue-500/5">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400"><Layers size={14}/> UI: PO View</div>
                        </th>
                        <th className="p-4 w-64 uppercase text-xs font-bold tracking-wider bg-purple-500/5">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400"><Layers size={14}/> UI: Receipt View</div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-500/10">
                    {debugRows.map((row) => (
                        <tr key={row.po.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                            
                            {/* Col 1: Identity */}
                            <td className="p-4 align-top">
                                <div className="font-mono font-bold text-base mb-1">{row.po.id}</div>
                                <div className="flex flex-wrap gap-1">
                                    {row.po.status === 'Projekt' && (
                                        <span className="text-[10px] bg-blue-500 text-white px-1.5 rounded font-bold">PROJEKT</span>
                                    )}
                                    {!row.master && row.po.linkedReceiptId && (
                                        <span className="text-[10px] bg-amber-500 text-white px-1.5 rounded font-bold">LINKED (NO MASTER)</span>
                                    )}
                                </div>
                            </td>

                            {/* Col 2: Math */}
                            <td className="p-4 align-top">
                                <div className={`font-mono font-bold text-lg ${getMathColor(row.math)}`}>
                                    {row.math.received} <span className="text-slate-400 text-sm">/ {row.math.ordered}</span>
                                </div>
                                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                                    <div 
                                        className={`h-full ${getMathColor(row.math).replace('text-', 'bg-')}`} 
                                        style={{ width: `${Math.min(100, row.math.completeness)}%` }}
                                    />
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1 font-mono">{row.math.completeness.toFixed(0)}% Complete</div>
                            </td>

                            {/* Col 3: Raw DB */}
                            <td className="p-4 align-top font-mono text-xs space-y-2">
                                <div>
                                    <span className="opacity-50 block uppercase tracking-wider text-[9px]">PO Status</span>
                                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>"{row.po.status}"</span>
                                </div>
                                <div>
                                    <span className="opacity-50 block uppercase tracking-wider text-[9px]">Receipt Status</span>
                                    {row.master ? (
                                        <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>"{row.master.status}"</span>
                                    ) : (
                                        <span className="text-red-500 italic">null</span>
                                    )}
                                </div>
                                {row.tickets.length > 0 && (
                                    <div>
                                        <span className="opacity-50 block uppercase tracking-wider text-[9px]">Tickets</span>
                                        <span className="text-red-400">{row.tickets.length} Linked</span>
                                    </div>
                                )}
                            </td>

                            {/* Col 4: UI PO View */}
                            <td className="p-4 align-top bg-blue-500/5">
                                {renderPOViewBadges(row)}
                            </td>

                            {/* Col 5: UI Receipt View */}
                            <td className="p-4 align-top bg-purple-500/5">
                                {renderReceiptViewBadges(row)}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
