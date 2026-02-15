import React, { useState, useMemo } from 'react';
import { 
  Search, PlusCircle, Filter, MapPin, PackagePlus, 
  Minus, Plus, Hash, Pencil, AlertTriangle, CheckCircle2, AlertOctagon, MoreHorizontal, Copy, CopyPlus, Download
} from 'lucide-react';
import { StockItem, Theme, ViewMode } from '../types';
import { ItemModal } from './ItemModal';

// --- SHARED LOGIC HOOK ---
const useStockAdjust = (item: StockItem, onUpdate: (id: string, n: number) => void, onLogStock: any) => {
    const [bulkInput, setBulkInput] = useState('');

    const handleAdjust = (amount: number) => {
        const currentLevel = item.stockLevel;
        const newLevel = Math.max(0, currentLevel + amount);
        const diff = newLevel - currentLevel;

        if (diff !== 0) {
            const action = diff > 0 ? 'add' : 'remove';
            const absQty = Math.abs(diff);
            onLogStock(item.id, item.name, action, absQty, 'Manuell (Bestand)', 'manual');
            onUpdate(item.id, newLevel);
        }
    };

    const handleClick = (e: React.MouseEvent, sign: number) => {
        e.stopPropagation();
        const val = parseInt(bulkInput);
        const qty = (!isNaN(val) && val > 0) ? val : 1;
        handleAdjust(qty * sign);
        setBulkInput('');
    };

    return { bulkInput, setBulkInput, handleClick };
};

// --- GRID CARD COMPONENT ---
interface StockComponentProps {
  item: StockItem;
  onUpdate: (id: string, newLevel: number) => void;
  onAddStock: () => void;
  onLogStock: (itemId: string, itemName: string, action: 'add' | 'remove', quantity: number, source?: string, context?: 'normal' | 'project' | 'manual' | 'po-normal' | 'po-project') => void;
  onClick: (item: StockItem) => void;
  onClone: (item: StockItem) => void;
  theme: Theme;
}

const InventoryProductCard: React.FC<StockComponentProps> = ({ item, onUpdate, onAddStock, onLogStock, onClick, onClone, theme }) => {
  const isDark = theme === 'dark';
  const { bulkInput, setBulkInput, handleClick } = useStockAdjust(item, onUpdate, onLogStock);

  const getStockStatus = () => {
    if (item.stockLevel <= 0) return { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Out' };
    if (item.stockLevel < item.minStock) return { bg: 'bg-amber-500/20', text: 'text-amber-600', label: 'Low' };
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-600', label: 'OK' };
  };

  const status = getStockStatus();

  return (
    <div 
        className={`border rounded-xl p-4 flex flex-col gap-4 transition-all duration-300 group backdrop-blur-md cursor-pointer ${
            isDark 
            ? 'bg-slate-800/40 border-slate-700/50 hover:shadow-xl hover:shadow-black/20 hover:border-slate-600' 
            : 'bg-white/70 border-[#CACCCE]/40 hover:shadow-lg hover:border-[#0077B5]/40 shadow-sm'
        }`}
        onClick={() => onClick(item)}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <h3 className={`text-[15px] font-semibold leading-tight group-hover:text-[#0077B5] transition-colors line-clamp-2 min-h-[40px] ${
            isDark ? 'text-slate-100' : 'text-[#313335]'
          }`}>
            {item.name}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-medium flex-wrap">
            <span className={`px-1.5 py-0.5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-[#CACCCE]/20 border-[#CACCCE] text-[#86888A]'
            }`}>#{item.sku}</span>
            <span className="text-[#86888A]">•</span>
            <span className={`uppercase ${isDark ? 'text-slate-500' : 'text-[#86888A]'}`}>{item.system}</span>
            
            {/* Smart Copy Tool */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(item.sku);
                    alert("Artikelnummer kopiert");
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const raw = item.sku.replace(/[^0-9]/g, '');
                    navigator.clipboard.writeText(raw);
                    alert("Artikelnummer (Nur Zahlen) kopiert");
                }}
                className={`ml-0.5 transition-colors ${
                    isDark 
                    ? 'text-slate-600 hover:text-blue-400' 
                    : 'text-gray-400 hover:text-blue-500'
                }`}
                title="Artikelnummer kopieren (Links: Exakt | Rechts: Nur Zahlen)"
            >
                <Copy size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
           <button 
                onClick={() => onClone(item)} 
                className="text-[#86888A] hover:text-[#0077B5] transition-colors p-1" 
                title="Artikel duplizieren"
           >
              <CopyPlus size={18} />
           </button>
           <button 
                onClick={() => onClick(item)} 
                className="text-[#86888A] hover:text-[#0077B5] transition-colors p-1" 
                title="Details bearbeiten"
           >
               <Pencil size={18} />
           </button>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className={`px-4 py-1.5 rounded-full ${status.bg} flex items-center gap-2 transition-all duration-500`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${status.bg.replace('/20', '')}`} />
          <span className={`text-xs font-bold ${status.text} tracking-wide`}>
            Bestand: {item.stockLevel}
          </span>
        </div>
        <span className={`text-[10px] italic uppercase tracking-tighter text-right ${isDark ? 'text-slate-500' : 'text-[#86888A]'}`}>
          {item.warehouseLocation || 'â€”'}
        </span>
      </div>

      <div className={`mt-auto pt-4 border-t transition-colors ${isDark ? 'border-slate-700/50' : 'border-[#CACCCE]/40'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={(e) => handleClick(e, -1)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
                isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-red-500/20 hover:text-red-400' : 'bg-[#CACCCE]/30 text-[#313335] hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <Minus size={18} />
            </button>
            <button 
              onClick={(e) => handleClick(e, 1)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-90 ${
                isDark ? 'bg-slate-700/50 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400' : 'bg-[#CACCCE]/30 text-[#313335] hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex-1 flex items-center gap-1">
            <div className="relative flex-1">
              <input 
                type="number"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                onClick={e => e.stopPropagation()}
                placeholder="Menge"
                className={`w-full border rounded-lg pl-8 pr-2 py-2 text-base md:text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-slate-900/50 border-slate-700 text-slate-200 focus:ring-blue-500/30 placeholder:text-slate-600' 
                    : 'bg-white/50 border-[#CACCCE] text-[#000000] focus:ring-[#0077B5]/20 placeholder:text-[#86888A]'
                }`}
              />
              <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#86888A]" size={14} />
            </div>
            <div className="flex flex-col gap-1">
               <button 
                onClick={(e) => handleClick(e, 1)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase transition-colors ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-[#0077B5] hover:bg-[#00A0DC] text-white'
                }`}
               >
                Add
               </button>
               <button 
                onClick={(e) => handleClick(e, -1)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase transition-colors ${
                  isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-[#313335] hover:bg-[#000000] text-white'
                }`}
               >
                Rem
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- TABLE ROW COMPONENT ---
const InventoryTableRow: React.FC<StockComponentProps> = ({ item, onUpdate, onAddStock, onLogStock, onClick, onClone, theme }) => {
    const isDark = theme === 'dark';
    const { bulkInput, setBulkInput, handleClick } = useStockAdjust(item, onUpdate, onLogStock);

    const getStockStatus = () => {
        if (item.stockLevel <= 0) return { icon: <AlertOctagon size={16}/>, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
        if (item.stockLevel < item.minStock) return { icon: <AlertTriangle size={16}/>, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
        return { icon: <CheckCircle2 size={16}/>, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    };
    
    const status = getStockStatus();

    return (
        <tr 
            onClick={() => onClick(item)}
            className={`group transition-colors border-b last:border-0 cursor-pointer ${
                isDark 
                ? 'border-slate-800 hover:bg-slate-800/50' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
        >
            <td className="p-4">
                <div className="flex flex-col">
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.name}</span>
                    {item.manufacturer && (
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">{item.manufacturer}</span>
                    )}
                </div>
            </td>
            <td className="p-4">
                <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                    {item.sku}
                </span>
            </td>
            <td className="p-4 text-sm text-slate-500">{item.system}</td>
            <td className="p-4">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin size={14} className="opacity-50" />
                    {item.warehouseLocation || '-'}
                </div>
            </td>
            <td className="p-4">
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-bold ${status.bg} ${status.color}`}>
                    {status.icon}
                    <span>{item.stockLevel}</span>
                </div>
            </td>
            <td className="p-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <input 
                            type="number"
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                            placeholder="#"
                            className="w-10 bg-transparent text-center text-sm outline-none font-medium"
                        />
                        <button onClick={(e) => handleClick(e, -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"><Minus size={14}/></button>
                        <button onClick={(e) => handleClick(e, 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"><Plus size={14}/></button>
                    </div>
                    <button 
                        onClick={() => onClone(item)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#0077B5]"
                        title="Artikel duplizieren"
                    >
                        <CopyPlus size={16} />
                    </button>
                    <button 
                        onClick={() => onClick(item)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#0077B5]"
                        title="Details bearbeiten"
                    >
                        <Pencil size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// --- MAIN INVENTORY VIEW COMPONENT ---

interface InventoryViewProps {
  inventory: StockItem[];
  theme: Theme;
  viewMode: ViewMode;
  onUpdate: (id: string, newLevel: number) => void;
  onUpdateItem: (item: StockItem) => void;
  onCreateItem: (item: StockItem) => void;
  onAddStock: () => void;
  onLogStock: (itemId: string, itemName: string, action: 'add' | 'remove', quantity: number, source?: string, context?: 'normal' | 'project' | 'manual' | 'po-normal' | 'po-project') => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  theme,
  viewMode,
  onUpdate,
  onUpdateItem,
  onCreateItem,
  onAddStock,
  onLogStock
}) => {
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isCloning, setIsCloning] = useState(false);

  // Filter Logic
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return inventory.filter(i => 
      i.name.toLowerCase().includes(term) || 
      i.sku.toLowerCase().includes(term) ||
      (i.system && i.system.toLowerCase().includes(term))
    );
  }, [inventory, searchTerm]);

  // Handlers
  const handleOpenNewItem = () => {
    setEditingItem(null);
    setIsCloning(false);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: StockItem) => {
    setEditingItem(item);
    setIsCloning(false);
    setIsItemModalOpen(true);
  };

  const handleCloneItem = (item: StockItem) => {
    // Create a clone with reset ID/SKU and adjusted name
    const clone: StockItem = {
        ...item,
        id: '', // Reset ID to indicate new item logic in save handler or Modal interaction
        sku: '', // User must provide new SKU
        name: `${item.name} (Kopie)`,
        stockLevel: 0, // Reset stock for fresh item
        lastUpdated: Date.now()
    };
    setEditingItem(clone);
    setIsCloning(true);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (item: StockItem) => {
    if (editingItem && !isCloning) {
      // Standard Update
      onUpdateItem(item);
    } else {
      // Creation (New or Clone)
      // Ensure we have a unique ID. If ItemModal didn't generate one (because we passed empty string), do it here.
      const newItem = { 
          ...item, 
          id: item.id && item.id !== '' ? item.id : crypto.randomUUID() 
      };
      onCreateItem(newItem);
    }
    setIsItemModalOpen(false);
    setIsCloning(false);
  };

  const handleExport = () => {
    // 1. Define Headers
    const headers = [
      "Artikel Bezeichnung",
      "Artikel Nummer",
      "KapazitÃ¤t in Ah",
      "Anzahl",
      "Mindestbestand",
      "System",
      "Hersteller/Lieferant"
    ].join(";");

    // 2. Map Rows with CSV escaping for quotes
    const rows = inventory.map(item => {
      return [
        `"${item.name.replace(/"/g, '""')}"`, 
        `"${item.sku.replace(/"/g, '""')}"`,
        item.capacityAh !== undefined ? item.capacityAh : "",
        item.stockLevel,
        item.minStock,
        `"${(item.system || "").replace(/"/g, '""')}"`,
        `"${(item.manufacturer || "").replace(/"/g, '""')}"`
      ].join(";");
    });

    // 3. Combine with BOM for Excel UTF-8 support
    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Lagerbestand_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
        <div>
           <h2 className="text-2xl font-bold mb-1">Artikel & Bestand</h2>
           <p className="text-slate-500 text-sm">Verwalten Sie Ihr gesamtes Inventar an einem Ort.</p>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={handleExport}
                className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border shadow-sm ${
                    isDark 
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
            >
                <Download size={20} /> Exportieren
            </button>
            <button
                onClick={handleOpenNewItem}
                className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                    isDark 
                     ? 'bg-[#0077B5] hover:bg-[#00A0DC] text-white shadow-blue-500/20' 
                     : 'bg-[#0077B5] hover:bg-[#00A0DC] text-white shadow-blue-500/20'
                }`}
            >
                <PlusCircle size={20} /> Neuen Artikel
            </button>
        </div>
      </div>

      {/* Large Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-[#0077B5]'}`} size={20} />
            <input 
              type="text"
              placeholder="Suchen nach Name, SKU oder System..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-2xl pl-12 pr-4 py-4 text-lg transition-all focus:outline-none focus:ring-2 ${
                isDark 
                  ? 'bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:ring-blue-500/30' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-[#0077B5]/20 shadow-sm'
              }`}
            />
        </div>
        <button 
            className={`hidden md:flex px-6 rounded-2xl border items-center justify-center gap-2 font-bold transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
        >
            <Filter size={20} /> Filter
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-20">
          
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                     <InventoryProductCard 
                        key={item.id} 
                        item={item} 
                        onUpdate={onUpdate} 
                        onAddStock={onAddStock}
                        onLogStock={onLogStock}
                        onClick={handleOpenEditItem}
                        onClone={handleCloneItem}
                        theme={theme}
                     />
                  ))}
              </div>
          )}

          {/* LIST VIEW (TABLE) */}
          {viewMode === 'list' && (
              <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  {/* MOBILE CARD VIEW */}
                  <div className="md:hidden divide-y divide-slate-500/10">
                      {filteredItems.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">
                              <PackagePlus size={32} className="mx-auto mb-3 opacity-30" />
                              <p>Keine Artikel gefunden</p>
                          </div>
                      ) : (
                          filteredItems.map(item => {
                              const { bulkInput, setBulkInput, handleClick } = useStockAdjust(item, onUpdate, onLogStock);
                              const getStockStatus = () => {
                                  if (item.stockLevel <= 0) return { icon: <AlertOctagon size={16}/>, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
                                  if (item.stockLevel < item.minStock) return { icon: <AlertTriangle size={16}/>, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
                                  return { icon: <CheckCircle2 size={16}/>, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
                              };
                              const status = getStockStatus();

                              return (
                                  <div
                                      key={item.id}
                                      onClick={() => handleOpenEditItem(item)}
                                      className={`p-4 cursor-pointer transition-colors ${
                                          isDark ? 'hover:bg-slate-800 active:bg-slate-700' : 'hover:bg-slate-50 active:bg-slate-100'
                                      }`}
                                  >
                                      {/* Item Name + Manufacturer */}
                                      <div className="mb-3">
                                          <div className={`font-bold text-sm mb-1 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                              {item.name}
                                          </div>
                                          {item.manufacturer && (
                                              <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                                                  {item.manufacturer}
                                              </div>
                                          )}
                                      </div>

                                      {/* Info Grid */}
                                      <div className="space-y-2 mb-3">
                                          {/* SKU */}
                                          <div className="flex items-center justify-between">
                                              <span className="text-xs font-bold uppercase text-slate-500">SKU</span>
                                              <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                                                  {item.sku}
                                              </span>
                                          </div>

                                          {/* System */}
                                          <div className="flex items-center justify-between">
                                              <span className="text-xs font-bold uppercase text-slate-500">System</span>
                                              <span className="text-sm text-slate-500">{item.system}</span>
                                          </div>

                                          {/* Location */}
                                          <div className="flex items-center justify-between">
                                              <span className="text-xs font-bold uppercase text-slate-500">Lagerort</span>
                                              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                  <MapPin size={14} className="opacity-50" />
                                                  {item.warehouseLocation || '-'}
                                              </div>
                                          </div>

                                          {/* Stock Level */}
                                          <div className="flex items-center justify-between">
                                              <span className="text-xs font-bold uppercase text-slate-500">Bestand</span>
                                              <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-bold ${status.bg} ${status.color}`}>
                                                  {status.icon}
                                                  <span>{item.stockLevel}</span>
                                              </div>
                                          </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 flex-1">
                                              <input 
                                                  type="number"
                                                  value={bulkInput}
                                                  onChange={(e) => setBulkInput(e.target.value)}
                                                  placeholder="#"
                                                  className="w-10 bg-transparent text-center text-sm outline-none font-medium"
                                              />
                                              <button onClick={(e) => handleClick(e, -1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"><Minus size={14}/></button>
                                              <button onClick={(e) => handleClick(e, 1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"><Plus size={14}/></button>
                                          </div>
                                          <button 
                                              onClick={() => handleCloneItem(item)}
                                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#0077B5]"
                                              title="Artikel duplizieren"
                                          >
                                              <CopyPlus size={16} />
                                          </button>
                                          <button 
                                              onClick={() => handleOpenEditItem(item)}
                                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#0077B5]"
                                              title="Details bearbeiten"
                                          >
                                              <Pencil size={16} />
                                          </button>
                                      </div>
                                  </div>
                              );
                          })
                      )}
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block">
                      <table className="w-full text-left text-sm">
                      <thead className={`border-b ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          <tr>
                              <th className="p-4 font-semibold">Artikel</th>
                              <th className="p-4 font-semibold">SKU</th>
                              <th className="p-4 font-semibold">System</th>
                              <th className="p-4 font-semibold">Lagerort</th>
                              <th className="p-4 font-semibold">Bestand</th>
                              <th className="p-4 font-semibold text-right">Aktionen</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-500/10">
                          {filteredItems.map(item => (
                             <InventoryTableRow 
                                key={item.id} 
                                item={item} 
                                onUpdate={onUpdate} 
                                onAddStock={onAddStock}
                                onLogStock={onLogStock}
                                onClick={handleOpenEditItem}
                                onClone={handleCloneItem}
                                theme={theme}
                             />
                          ))}
                      </tbody>
                  </table>
                  </div>
              </div>
          )}

          {/* EMPTY STATE */}
          {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-60">
                  <PackagePlus size={64} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">Keine Artikel gefunden.</p>
                  <p className="text-sm">Passen Sie Ihre Suche an oder erstellen Sie einen neuen Artikel.</p>
              </div>
          )}
      </div>

      {/* Shared Item Modal */}
      <ItemModal 
         isOpen={isItemModalOpen}
         onClose={() => setIsItemModalOpen(false)}
         onSave={handleSaveItem}
         initialData={editingItem}
      />
    </div>
  );
};