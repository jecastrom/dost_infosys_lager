
import React, { useMemo } from 'react';
import { StockLog, StockItem, Theme } from '../types';
import { BatteryCharging, AlertTriangle, TrendingUp, Zap, Activity, BarChart2, ArrowRight, AlertOctagon, CheckCircle } from 'lucide-react';

interface InsightsRowProps {
  logs: StockLog[];
  inventory: StockItem[];
  theme: Theme;
}

export const InsightsRow: React.FC<InsightsRowProps> = ({ logs, inventory, theme }) => {
  const isDark = theme === 'dark';

  // ---------------------------------------------------------------------------
  // ANALYTICS LOGIC
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // --- 1. AKKU DATA ---
    const akkuItems = inventory.filter(i => 
      (i.warehouseLocation && (i.warehouseLocation.toLowerCase().includes('akku') || i.warehouseLocation.toLowerCase().includes('accu'))) ||
      (i.name.toLowerCase().includes('akku') || i.name.toLowerCase().includes('batterie'))
    );
    
    const totalAkkuQty = akkuItems.reduce((acc, item) => acc + item.stockLevel, 0);
    const totalAkkuMinStock = akkuItems.reduce((acc, item) => acc + item.minStock, 0);

    // Status Determination
    let akkuStatus: 'Ausverkauft' | 'Niedrig' | 'Optimal' = 'Optimal';
    let akkuStatusColor = '';

    if (totalAkkuQty <= 0) {
        akkuStatus = 'Ausverkauft';
        akkuStatusColor = isDark ? 'bg-red-500/20 text-red-300 border-red-500/50' : 'bg-red-500/20 text-white border-white/30';
    } else if (totalAkkuQty <= totalAkkuMinStock) {
        akkuStatus = 'Niedrig';
        akkuStatusColor = isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-amber-500/20 text-white border-white/30';
    } else {
        akkuStatus = 'Optimal';
        akkuStatusColor = isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-emerald-500/20 text-white border-white/30';
    }

    // Filter Logs for Consumption (Removal) relating to Akkus
    const akkuConsumptionLogs = logs.filter(l => 
      l.action === 'remove' && 
      (l.itemName.toLowerCase().includes('akku') || l.itemName.toLowerCase().includes('batterie') || (l.warehouse && l.warehouse.toLowerCase().includes('akku')))
    );

    // Last 7 Days Consumption
    const removedLast7Days = akkuConsumptionLogs
      .filter(l => new Date(l.timestamp) >= oneWeekAgo)
      .reduce((acc, l) => acc + l.quantity, 0);

    // Last 30 Days Consumption for Average
    const removedLast30Days = akkuConsumptionLogs
      .filter(l => new Date(l.timestamp) >= thirtyDaysAgo)
      .reduce((acc, l) => acc + l.quantity, 0);

    const dailyAverage = removedLast30Days / 30;
    
    // Days to Empty Calculation
    let daysToEmpty = Infinity;
    if (dailyAverage > 0.1) {
      daysToEmpty = Math.round(totalAkkuQty / dailyAverage);
    }

    // --- 2. STOCK HEALTH BREAKDOWN (EXISTING LOGIC) ---
    const outOfStockCount = inventory.filter(i => i.stockLevel <= 0).length;
    const lowStockCount = inventory.filter(i => i.stockLevel > 0 && i.stockLevel <= i.minStock).length;
    const optimalStockCount = inventory.filter(i => i.stockLevel > i.minStock).length;


    // --- 3. TRENDS (Month over Month) (EXISTING LOGIC) ---
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevMonthYear = prevMonthDate.getFullYear();

    const getMonthlyRemovals = (m: number, y: number) => {
      return logs
        .filter(l => {
          const d = new Date(l.timestamp);
          return l.action === 'remove' && d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((acc, l) => acc + l.quantity, 0);
    };

    const thisMonthTotal = getMonthlyRemovals(currentMonth, currentYear);
    const lastMonthTotal = getMonthlyRemovals(prevMonth, prevMonthYear);
    const nextMonthForecast = Math.round((thisMonthTotal + lastMonthTotal) / 2);

    return {
      totalAkkuQty,
      akkuStatus,
      akkuStatusColor,
      removedLast7Days,
      dailyAverage,
      daysToEmpty,
      outOfStockCount,
      lowStockCount,
      optimalStockCount,
      lastMonthTotal,
      thisMonthTotal,
      nextMonthForecast
    };
  }, [logs, inventory, isDark]);

  const getMonthName = (offset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleString('de-DE', { month: 'short' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in slide-in-from-top-4 duration-500">
      
      {/* CARD 1: AKKU MANAGEMENT (UPDATED) */}
      <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border border-blue-500/20 group ${isDark ? 'bg-gradient-to-br from-blue-900/40 to-slate-900' : 'bg-gradient-to-br from-[#0077B5] to-blue-600'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
          <BatteryCharging size={120} className={isDark ? 'text-blue-400' : 'text-white'} />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
              <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-blue-400' : 'text-blue-100'}`}>
                <Zap size={14} /> Akkus im Lager (AccuService)
              </div>
              
              <div className="text-4xl font-black mb-3 text-white">
                {stats.totalAkkuQty} <span className="text-lg font-medium opacity-70">Stück</span>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-sm ${stats.akkuStatusColor}`}>
                  {stats.akkuStatus === 'Ausverkauft' && <AlertOctagon size={14} />}
                  {stats.akkuStatus === 'Niedrig' && <AlertTriangle size={14} />}
                  {stats.akkuStatus === 'Optimal' && <CheckCircle size={14} />}
                  {stats.akkuStatus}
              </div>
          </div>

          <div className={`mt-6 space-y-1.5 text-xs font-medium ${isDark ? 'text-slate-300' : 'text-blue-50'}`}>
             <div className="flex justify-between items-center">
                <span className="opacity-70">Diese Woche:</span>
                <span className="font-bold">-{stats.removedLast7Days} entnommen</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="opacity-70">Durchschnitt:</span>
                <span className="font-bold">~{stats.dailyAverage.toFixed(1)} pro Tag</span>
             </div>
             <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-1">
                <span className="opacity-70">Leer in:</span>
                <span className={`font-bold text-sm ${stats.daysToEmpty < 10 ? 'text-red-300 animate-pulse' : ''}`}>
                    {stats.daysToEmpty === Infinity || stats.daysToEmpty > 90 ? '> 90 Tage' : `${stats.daysToEmpty} Tagen`}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* CARD 2: LAGER GESUNDHEIT (PRESERVED) */}
      <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border flex flex-col justify-between ${
        isDark 
          ? 'bg-slate-800/60 border-slate-700' 
          : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Activity size={120} className={isDark ? 'text-white' : 'text-slate-900'} />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col">
          <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Activity size={16} /> 
            Lager Gesundheit
          </div>

          <div className="grid grid-cols-3 gap-2 mt-auto">
              
              {/* Col 1: Out of Stock */}
              <div className="flex flex-col items-center justify-end text-center">
                  <div className={`p-3 rounded-full mb-3 shadow-sm ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
                      <AlertOctagon size={28} strokeWidth={2} />
                  </div>
                  <div className={`text-2xl font-black leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stats.outOfStockCount}
                  </div>
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      Ausverkauft
                  </div>
              </div>

              {/* Col 2: Low Stock */}
              <div className="flex flex-col items-center justify-end text-center">
                  <div className={`p-3 rounded-full mb-3 shadow-sm ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-500'}`}>
                      <AlertTriangle size={28} strokeWidth={2} />
                  </div>
                  <div className={`text-2xl font-black leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stats.lowStockCount}
                  </div>
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      Niedrig
                  </div>
              </div>

              {/* Col 3: Optimal */}
              <div className="flex flex-col items-center justify-end text-center">
                  <div className={`p-3 rounded-full mb-3 shadow-sm ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>
                      <CheckCircle size={28} strokeWidth={2} />
                  </div>
                  <div className={`text-2xl font-black leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stats.optimalStockCount}
                  </div>
                  <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Optimal
                  </div>
              </div>

          </div>
        </div>
      </div>

      {/* CARD 3: TREND & PROGNOSE (PRESERVED) */}
      <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border border-purple-500/20 group ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-900/40 to-slate-900' 
          : 'bg-gradient-to-br from-indigo-600 to-purple-600'
      }`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <BarChart2 size={120} className={isDark ? 'text-indigo-400' : 'text-white'} />
        </div>

        <div className="relative z-10">
          <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-indigo-300' : 'text-indigo-100'}`}>
            <TrendingUp size={16} /> Verbrauch & Trend
          </div>

          <div className="space-y-3">
             <div className={`flex justify-between items-center pb-2 border-b ${isDark ? 'border-white/10 text-indigo-100' : 'border-white/20 text-white'}`}>
                <span className="text-sm opacity-80">{getMonthName(-1)} (Vormonat)</span>
                <span className="font-bold font-mono">{stats.lastMonthTotal > 0 ? stats.lastMonthTotal : '-'} <span className="text-[10px] opacity-60 font-normal">OUT</span></span>
             </div>
             <div className={`flex justify-between items-center pb-2 border-b ${isDark ? 'border-white/10 text-white' : 'border-white/20 text-white'}`}>
                <span className="text-sm font-bold">{getMonthName(0)} (Aktuell)</span>
                <span className="font-bold font-mono text-lg">{stats.thisMonthTotal > 0 ? stats.thisMonthTotal : '-'} <span className="text-[10px] opacity-60 font-normal">OUT</span></span>
             </div>
             <div className={`flex justify-between items-center pt-1 ${isDark ? 'text-emerald-300' : 'text-emerald-100'}`}>
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                   {getMonthName(1)} Prognose <ArrowRight size={12}/>
                </span>
                <span className="font-bold font-mono">~{stats.nextMonthForecast}</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};
