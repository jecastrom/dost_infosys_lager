
import React, { useMemo } from 'react';
import { 
  Award, TrendingUp, AlertTriangle, Clock, CheckCircle2, 
  XCircle, BarChart3, Truck, Filter, ShieldCheck 
} from 'lucide-react';
import { ReceiptHeader, PurchaseOrder, ReceiptMaster, Theme } from '../types';

interface SupplierViewProps {
  receipts: ReceiptMaster[]; // Kept as requested by prompt logic
  headers: ReceiptHeader[];  // Added for robust status/supplier lookup
  orders: PurchaseOrder[];   // Added for Expected Date lookup
  theme: Theme;
}

interface SupplierMetric {
  name: string;
  totalDeliveries: number;
  lateDeliveries: number;
  qualityIssues: number;
  lateRate: number;
  errorRate: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
}

export const SupplierView: React.FC<SupplierViewProps> = ({ 
  receipts, 
  headers, 
  orders, 
  theme 
}) => {
  const isDark = theme === 'dark';

  // --- Metrics Engine ---
  const supplierMetrics = useMemo(() => {
    const stats = new Map<string, { total: number, late: number, issues: number }>();

    // We use headers as the primary stream because they contain the Supplier Name directly
    // and represent individual delivery events (Lieferscheine).
    headers.forEach(header => {
        const supplier = header.lieferant;
        if (!supplier) return;

        if (!stats.has(supplier)) {
            stats.set(supplier, { total: 0, late: 0, issues: 0 });
        }
        
        const entry = stats.get(supplier)!;
        entry.total += 1;

        // 1. Quality Check
        // Statuses that indicate a "Quality Issue"
        const issueStatuses = ['Reklamation', 'Falsch geliefert', 'Abgelehnt', 'Schaden', 'Beschädigt'];
        if (issueStatuses.includes(header.status)) {
            entry.issues += 1;
        }

        // 2. Late Check
        // Logic: Compare Actual Delivery Date vs PO Expected Date
        let isLate = false;
        
        // Attempt 1: Check if 'isLate' flag was passed in (some implementations might attach it)
        if ((header as any).isLate) {
            isLate = true;
        } 
        // Attempt 2: Calculate from Dates
        else if (header.bestellNr) {
            const po = orders.find(o => o.id === header.bestellNr);
            if (po && po.expectedDeliveryDate) {
                const actualDate = new Date(header.lieferdatum).setHours(0,0,0,0);
                const expectedDate = new Date(po.expectedDeliveryDate).setHours(0,0,0,0);
                if (actualDate > expectedDate) {
                    isLate = true;
                }
            }
        }

        if (isLate) {
            entry.late += 1;
        }
    });

    // Transform Map to Array & Calculate Grades
    const results: SupplierMetric[] = Array.from(stats.entries()).map(([name, data]) => {
        const total = data.total || 1; // Prevent div by zero
        const lateRate = (data.late / total) * 100;
        const errorRate = (data.issues / total) * 100;
        
        // Simple Scoring Algorithm
        // Base 100. Deduct points for Lateness and Errors.
        // Heavy penalty for Errors (Quality), Medium for Lateness.
        const scoreRaw = 100 - (lateRate * 0.8) - (errorRate * 1.5);
        const score = Math.max(0, Math.min(100, Math.round(scoreRaw)));

        let grade: 'A' | 'B' | 'C' | 'D' = 'D';
        if (score >= 90) grade = 'A';
        else if (score >= 80) grade = 'B';
        else if (score >= 70) grade = 'C';

        return {
            name,
            totalDeliveries: data.total,
            lateDeliveries: data.late,
            qualityIssues: data.issues,
            lateRate: Math.round(lateRate),
            errorRate: Math.round(errorRate),
            score,
            grade
        };
    });

    // Sort by Score DESC
    return results.sort((a, b) => b.score - a.score);
  }, [headers, orders]);

  // --- Helper: Grade Styles ---
  const getGradeStyle = (grade: string) => {
      switch (grade) {
          case 'A': return isDark 
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
            : 'bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm';
          case 'B': return isDark 
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
            : 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm';
          case 'C': return isDark 
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
            : 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm';
          default: return isDark 
            ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
            : 'bg-red-100 text-red-700 border-red-300 shadow-sm';
      }
  };

  const getProgressBarColor = (percentage: number, inverse: boolean = false) => {
      // For "Good" metrics (Punctuality): High is Green.
      // For "Bad" metrics (Error Rate): Low is Green (handled by passing 100-Rate).
      if (percentage >= 90) return 'bg-emerald-500';
      if (percentage >= 70) return 'bg-blue-500';
      if (percentage >= 50) return 'bg-orange-500';
      return 'bg-red-500';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        
        {/* Header */}
        <div className="flex items-end justify-between">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldCheck className="text-[#0077B5]" /> Lieferanten-Bewertung
                </h2>
                <p className="text-slate-500 text-sm mt-1">Automatische Analyse der Lieferqualität und Pünktlichkeit.</p>
            </div>
            
            {/* Summary Chips */}
            <div className="flex gap-2">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <Truck size={14} /> {supplierMetrics.length} Lieferanten
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <Award size={14} /> {supplierMetrics.filter(s => s.grade === 'A').length} Top-Performer
                </div>
            </div>
        </div>

        {/* Grid Content */}
        {supplierMetrics.length === 0 ? (
            <div className="p-12 rounded-2xl border border-dashed text-center opacity-60">
                <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Keine Daten verfügbar</p>
                <p className="text-sm">Sobald Wareneingänge verbucht werden, erscheinen hier die Bewertungen.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supplierMetrics.map((supplier) => (
                    <div 
                        key={supplier.name}
                        className={`rounded-2xl border p-5 flex flex-col gap-5 transition-all hover:shadow-lg ${
                            isDark 
                            ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700' 
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                    >
                        {/* Card Header */}
                        <div className="flex justify-between items-start">
                            <div className="min-w-0 pr-4">
                                <h3 className={`font-bold text-lg truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {supplier.name}
                                </h3>
                                <div className={`text-xs mt-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <Truck size={12} /> {supplier.totalDeliveries} {supplier.totalDeliveries === 1 ? 'Lieferung' : 'Lieferungen'}
                                </div>
                            </div>
                            
                            {/* GRADE BADGE */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black border-2 ${getGradeStyle(supplier.grade)}`}>
                                {supplier.grade}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className={`h-px w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />

                        {/* Stats Rows */}
                        <div className="space-y-4">
                            
                            {/* Punctuality */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Pünktlichkeit</span>
                                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                                        {100 - supplier.lateRate}%
                                    </span>
                                </div>
                                <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(100 - supplier.lateRate)}`} 
                                        style={{ width: `${100 - supplier.lateRate}%` }}
                                    />
                                </div>
                                {supplier.lateDeliveries > 0 && (
                                    <div className="text-[10px] text-red-400 flex items-center gap-1">
                                        <Clock size={10} /> {supplier.lateDeliveries} verspätet
                                    </div>
                                )}
                            </div>

                            {/* Quality */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Qualität</span>
                                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                                        {100 - supplier.errorRate}%
                                    </span>
                                </div>
                                <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${getProgressBarColor(100 - supplier.errorRate)}`} 
                                        style={{ width: `${100 - supplier.errorRate}%` }}
                                    />
                                </div>
                                {supplier.qualityIssues > 0 && (
                                    <div className="text-[10px] text-amber-400 flex items-center gap-1">
                                        <AlertTriangle size={10} /> {supplier.qualityIssues} Probleme gemeldet
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Footer Score */}
                        <div className={`mt-auto pt-4 border-t flex justify-between items-center text-xs ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                            <span>Gesamt-Score</span>
                            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{supplier.score} / 100</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
