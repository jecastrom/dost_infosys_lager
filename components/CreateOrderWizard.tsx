import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Search, Plus, Calendar, Truck,
  Hash, Info, CheckCircle2, ChevronDown,
  ArrowRight, ArrowLeft, Trash2, Loader2, AlertTriangle, FileText,
  Briefcase, Box, Download, Clock, Undo2, Sparkles, Import
} from 'lucide-react';
import { StockItem, Theme, PurchaseOrder, ActiveModule } from '../types';

// ── Interfaces ──────────────────────────────────────────────
interface CreateOrderWizardProps {
  theme: Theme;
  items: StockItem[];
  onNavigate: (module: ActiveModule) => void;
  onCreateOrder: (order: PurchaseOrder) => void;
  initialOrder?: PurchaseOrder | null;
  requireDeliveryDate: boolean;
  enableSmartImport?: boolean;
}

interface CartItem {
  sku: string;
  name: string;
  quantity: number;
  system: string;
  isAddedLater?: boolean;
  isDeleted?: boolean;
  isPersisted?: boolean;
}

interface OrderFormData {
  orderId: string;
  supplier: string;
  orderDate: string;
  expectedDeliveryDate: string;
  poType: 'normal' | 'project' | null;
}

// ── PlusMinus Picker ────────────────────────────────────────
const PlusMinusPicker = ({ value, onChange, min = 1, max = 9999, disabled = false, isDark = false }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean; isDark?: boolean;
}) => {
  const dec = () => { if (value > min) onChange(value - 1); };
  const inc = () => { if (value < max) onChange(value + 1); };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const commit = () => { const n = parseInt(draft); if (!isNaN(n) && n >= min && n <= max) onChange(n); else setDraft(String(value)); setEditing(false); };

  return (
    <div className="flex items-center gap-0.5">
      <button onClick={dec} disabled={disabled || value <= min}
        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg active:scale-95 transition-all ${disabled || value <= min ? 'opacity-30 cursor-not-allowed' : isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>−</button>
      {editing ? (
        <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
          onBlur={commit} onKeyDown={e => e.key === 'Enter' && commit()}
          className={`w-12 h-8 text-center text-sm font-bold rounded-lg border outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'}`} />
      ) : (
        <button onClick={() => { if (!disabled) { setDraft(String(value)); setEditing(true); } }} disabled={disabled}
          className={`w-12 h-8 flex items-center justify-center text-sm font-bold rounded-lg border transition-all ${isDark ? 'bg-slate-900 border-slate-600 text-white hover:border-slate-500' : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400'}`}>{value}</button>
      )}
      <button onClick={inc} disabled={disabled || value >= max}
        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-lg text-white active:scale-95 transition-all ${disabled || value >= max ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0077B5] hover:bg-[#00A0DC]'}`}>+</button>
    </div>
  );
};

// ── Smart Parser ────────────────────────────────────────────
const cleanSku = (sku: string) => sku.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
const parsePOText = (text: string, inventory: StockItem[]) => {
  const lines = text.split('\n');
  let orderId = '', orderDate = '', supplier = '';
  const parsedItems: CartItem[] = [];
  const skuMap = new Map<string, StockItem>();
  const supplierHintMap = new Map<string, string>();
  inventory.forEach(i => { if (i.sku) skuMap.set(cleanSku(i.sku), i); if (i.manufacturer) supplierHintMap.set(i.manufacturer.toLowerCase(), i.manufacturer); });
  const dateRegex = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/;
  const idRegex = /(?:Nr\.?|#|Bestellung|Order|Auftrag)\s*[:.]?\s*([A-Za-z0-9\-\/]{3,})/i;
  const qtyRegex = /(\d+)\s*(?:x|stk|st|pcs|Pack)/i;
  lines.forEach(line => {
    if (!orderDate) { const d = line.match(dateRegex); if (d) { let y = d[3]; if (y.length === 2) y = '20' + y; orderDate = `${y}-${d[2].padStart(2, '0')}-${d[1].padStart(2, '0')}`; } }
    if (!orderId) { const id = line.match(idRegex); if (id) orderId = id[1]; }
    if (!supplier) { for (const [k, v] of supplierHintMap.entries()) { if (line.toLowerCase().includes(k)) { supplier = v; break; } } }
    const words = line.replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/);
    let found: StockItem | undefined;
    for (const w of words) { if (w.length < 3) continue; const c = cleanSku(w); if (skuMap.has(c)) { found = skuMap.get(c); break; } }
    if (found) {
      let qty = 1; const q = line.match(qtyRegex); if (q) qty = parseInt(q[1]); else { const sn = line.match(/^\s*(\d+)\s+/); if (sn) qty = parseInt(sn[1]); }
      parsedItems.push({ sku: found.sku, name: found.name, quantity: qty, system: found.system || 'Sonstiges', isAddedLater: false, isPersisted: true });
      if (!supplier && found.manufacturer) supplier = found.manufacturer;
    }
  });
  return { orderId, orderDate: orderDate || new Date().toISOString().split('T')[0], supplier: supplier || '', items: parsedItems };
};

const SUPPLIER_OPTIONS = [
  "Battery Kutter", "Energy Solutions", "Power Supply GmbH", "Akku-Tech",
  "Deutsche Batterie", "Euro Power Systems", "Varta AG", "Bosch Automotive",
  "Continental", "Siemens Energy"
];

// ═════════════════════════════════════════════════════════════
export const CreateOrderWizard: React.FC<CreateOrderWizardProps> = ({
  theme, items, onNavigate, onCreateOrder, initialOrder, requireDeliveryDate, enableSmartImport = false
}) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState<OrderFormData>({ orderId: '', supplier: '', orderDate: new Date().toISOString().split('T')[0], expectedDeliveryDate: '', poType: null });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<string[]>(SUPPLIER_OPTIONS);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [newItemData, setNewItemData] = useState({ name: '', sku: '', system: '' });
  const [showSupplierSheet, setShowSupplierSheet] = useState(false);
  const [supplierSheetSearch, setSupplierSheetSearch] = useState('');
  const [showAddNewSupplier, setShowAddNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [searchDropdownCoords, setSearchDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);
  const systemInputRef = useRef<HTMLDivElement>(null);
  const systemDropdownRef = useRef<HTMLDivElement>(null);
  const [systemDropdownCoords, setSystemDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (initialOrder) {
      setFormData({ orderId: initialOrder.id, supplier: initialOrder.supplier, orderDate: initialOrder.dateCreated, expectedDeliveryDate: initialOrder.expectedDeliveryDate || '', poType: initialOrder.status === 'Projekt' ? 'project' : 'normal' });
      setCart(initialOrder.items.map(i => {
        const orig = items.find(x => x.sku === i.sku);
        return { sku: i.sku, name: i.name, quantity: i.quantityExpected, system: orig ? orig.system : 'Bestand', isDeleted: i.isDeleted, isAddedLater: i.isAddedLater, isPersisted: true };
      }));
    }
  }, [initialOrder, items]);

  useEffect(() => {
    if (!showSystemDropdown && !showSearchDropdown) return;
    const onScroll = (e: Event) => {
      if (showSystemDropdown && systemDropdownRef.current && !systemDropdownRef.current.contains(e.target as Node)) setShowSystemDropdown(false);
      if (showSearchDropdown && searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) setShowSearchDropdown(false);
    };
    const onResize = () => { setShowSystemDropdown(false); if (showSearchDropdown && searchInputRef.current) { const r = searchInputRef.current.getBoundingClientRect(); setSearchDropdownCoords({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width }); } };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', onResize); };
  }, [showSystemDropdown, showSearchDropdown]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (showSystemDropdown && !systemInputRef.current?.contains(t) && !systemDropdownRef.current?.contains(t)) setShowSystemDropdown(false);
      if (showSearchDropdown && !searchInputRef.current?.contains(t) && !searchDropdownRef.current?.contains(t)) setShowSearchDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showSystemDropdown, showSearchDropdown]);

  const sheetFilteredSuppliers = useMemo(() => {
    if (!supplierSheetSearch) return supplierOptions;
    return supplierOptions.filter(s => s.toLowerCase().includes(supplierSheetSearch.toLowerCase()));
  }, [supplierOptions, supplierSheetSearch]);
  const systems = useMemo(() => { const u = new Set<string>(); items.forEach(i => { if (i.system) u.add(i.system); }); return Array.from(u).sort(); }, [items]);
  const filteredSystems = useMemo(() => { if (!newItemData.system) return systems; return systems.filter(s => s.toLowerCase().includes(newItemData.system.toLowerCase())); }, [systems, newItemData.system]);
  const searchResults = useMemo(() => { if (!searchTerm) return []; return items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 50); }, [searchTerm, items]);
  const formatDate = (d: string) => { if (!d) return ''; const dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }); };
  const updateSearchDropdownPosition = () => { if (searchInputRef.current) { const r = searchInputRef.current.getBoundingClientRect(); setSearchDropdownCoords({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width }); setShowSearchDropdown(true); } };
  const updateSystemDropdownPosition = () => { if (systemInputRef.current) { const r = systemInputRef.current.getBoundingClientRect(); setSystemDropdownCoords({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width }); setShowSystemDropdown(true); } };
  const handleSearchChange = (v: string) => { setSearchTerm(v); if (v) updateSearchDropdownPosition(); else setShowSearchDropdown(false); };

  const addToCart = (item: StockItem) => {
    const isEdit = !!initialOrder;
    const idx = cart.findIndex(c => c.sku === item.sku);
    if (idx >= 0) { if (cart[idx].isDeleted) reactivateCartItem(idx); else alert("Artikel befindet sich bereits in der Liste."); }
    else setCart(p => [...p, { sku: item.sku, name: item.name, system: item.system, quantity: 1, isAddedLater: isEdit, isPersisted: false }]);
    setSearchTerm(''); setShowSearchDropdown(false);
  };
  const handleCreateNewItem = () => {
    if (!newItemData.name || !newItemData.sku) return;
    const isEdit = !!initialOrder;
    setCart(p => [...p, { sku: newItemData.sku, name: newItemData.name, system: newItemData.system || 'Sonstiges', quantity: 1, isAddedLater: isEdit, isPersisted: false }]);
    setIsCreatingNew(false); setNewItemData({ name: '', sku: '', system: '' });
  };
  const updateCartQty = (i: number, q: number) => setCart(p => p.map((it, idx) => idx === i ? { ...it, quantity: q } : it));
  const removeCartItem = (i: number) => { const it = cart[i]; if (it.isPersisted) setCart(p => p.map((x, idx) => idx === i ? { ...x, isDeleted: true } : x)); else setCart(p => p.filter((_, idx) => idx !== i)); };
  const reactivateCartItem = (i: number) => setCart(p => p.map((x, idx) => idx === i ? { ...x, isDeleted: false } : x));

  const handleParseImport = () => {
    const r = parsePOText(importText, items);
    setFormData(p => ({ ...p, orderId: r.orderId || p.orderId, orderDate: r.orderDate || p.orderDate, supplier: r.supplier || p.supplier }));
    if (r.items.length > 0) { setCart(r.items); alert(`${r.items.length} Positionen erkannt und importiert.`); } else alert("Keine bekannten Artikel im Text gefunden.");
    setShowImportModal(false); setImportText('');
  };
  const handleSubmit = async () => {
    setSubmissionStatus('submitting');
    try {
      await new Promise(r => setTimeout(r, 600));
      const order: PurchaseOrder = {
        id: formData.orderId, supplier: formData.supplier, dateCreated: formData.orderDate, expectedDeliveryDate: formData.expectedDeliveryDate,
        status: formData.poType === 'project' ? 'Projekt' : 'Lager', isArchived: false,
        items: cart.map(c => { const orig = initialOrder?.items.find(o => o.sku === c.sku); return { sku: c.sku, name: c.name, quantityExpected: c.quantity, quantityReceived: orig ? orig.quantityReceived : 0, isAddedLater: c.isAddedLater, isDeleted: c.isDeleted }; })
      };
      onCreateOrder(order); setSubmissionStatus('success');
    } catch { setSubmissionStatus('error'); }
  };
  const canGoNext = () => {
    if (step === 1) { const ok = formData.orderId && formData.supplier && formData.orderDate && formData.poType; if (!ok) return false; if (requireDeliveryDate && !formData.expectedDeliveryDate) return false; return true; }
    if (step === 2) return cart.some(c => !c.isDeleted);
    return false;
  };

  const inputCls = `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:ring-blue-500/30' : 'bg-white border-slate-200 text-[#313335] focus:ring-[#0077B5]/20'}`;

  // ═══════════════════════════════════════════════════════════
  return (
    <div className={`h-[100dvh] md:h-full flex flex-col overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>

      {/* ── SUCCESS / ERROR OVERLAY ── */}
      {(submissionStatus === 'success' || submissionStatus === 'error') && createPortal(
        <div className="fixed inset-0 z-[100000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          {submissionStatus === 'success' && (
            <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={48} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} /></div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{initialOrder ? 'Bestellung aktualisiert' : 'Bestellung erfolgreich erstellt'}</h2>
              <p className={`mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Die Änderungen wurden gespeichert.</p>
              <button onClick={() => onNavigate('order-management')} className="w-full py-3 bg-[#0077B5] hover:bg-[#00A0DC] text-white rounded-2xl font-bold transition-all active:scale-95">Zur Übersicht</button>
            </div>
          )}
          {submissionStatus === 'error' && (
            <div className={`rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
              <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-6"><AlertTriangle size={48} className="text-red-600 dark:text-red-400" strokeWidth={3} /></div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Fehler</h2>
              <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bestellung konnte nicht gespeichert werden.</p>
              <button onClick={() => setSubmissionStatus('idle')} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold transition-all">Erneut versuchen</button>
            </div>
          )}
        </div>, document.body
      )}

      {/* ── SMART IMPORT MODAL ── */}
      {showImportModal && createPortal(
        <div className="fixed inset-0 z-[100000] bg-slate-900/80 backdrop-blur-md flex items-end md:items-center justify-center animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300 ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}><Sparkles size={20} className="text-amber-500" /> Smart Import</h3>
              <button onClick={() => { setShowImportModal(false); setImportText(''); }} className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20} /></button>
            </div>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Bestelltext hier einfügen…" className={`flex-1 min-h-[200px] p-4 rounded-xl border text-sm resize-none outline-none focus:ring-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:ring-blue-500/30' : 'bg-slate-50 border-slate-200 focus:ring-[#0077B5]/20'}`} autoFocus />
            <button onClick={handleParseImport} disabled={!importText.trim()} className="mt-4 w-full py-3 bg-[#0077B5] hover:bg-[#00A0DC] text-white rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition-all"><Download size={18} /> Importieren</button>
          </div>
        </div>, document.body
      )}

      {/* ── SUPPLIER BOTTOM SHEET ── */}
      {showSupplierSheet && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-end md:items-center justify-center animate-in fade-in duration-200" onClick={() => { setShowSupplierSheet(false); setSupplierSheetSearch(''); setShowAddNewSupplier(false); }}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div onClick={e => e.stopPropagation()} className={`relative w-full md:max-w-md md:rounded-3xl rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-8 duration-300 ${isDark ? 'bg-slate-900 border-t md:border border-slate-800' : 'bg-white border-t md:border border-slate-200'}`} style={{ maxHeight: '70vh' }}>
            <div className="flex justify-center pt-3 pb-1 md:hidden"><div className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} /></div>
            <div className="px-5 pt-3 pb-3 shrink-0">
              <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Lieferant wählen</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={supplierSheetSearch} onChange={e => setSupplierSheetSearch(e.target.value)} placeholder="Suchen..." className={`${inputCls} pl-10`} autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-2">
              {sheetFilteredSuppliers.length > 0 ? sheetFilteredSuppliers.map(opt => (
                <button key={opt} type="button" onClick={() => { setFormData({ ...formData, supplier: opt }); setShowSupplierSheet(false); setSupplierSheetSearch(''); }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all mb-1 border text-sm ${formData.supplier === opt ? (isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' : 'bg-blue-50 text-blue-600 border-blue-50') : (isDark ? 'hover:bg-slate-800 border-slate-800/50' : 'hover:bg-slate-50 border-slate-100')}`}>
                  <span className="font-medium">{opt}</span>
                  {formData.supplier === opt && <CheckCircle2 size={18} className="text-blue-500" />}
                </button>
              )) : <div className="p-6 text-center text-sm opacity-50">Keine Ergebnisse</div>}
            </div>
            <div className={`p-4 border-t shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              {!showAddNewSupplier ? (
                <button type="button" onClick={() => setShowAddNewSupplier(true)} className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' : 'bg-slate-100 hover:bg-slate-200 text-blue-600'}`}><Plus size={16} /> Neuer Lieferant</button>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && newSupplierName.trim()) { setSupplierOptions(p => [...p, newSupplierName.trim()]); setFormData({ ...formData, supplier: newSupplierName.trim() }); setNewSupplierName(''); setShowAddNewSupplier(false); setShowSupplierSheet(false); setSupplierSheetSearch(''); } }}
                    placeholder="Neuer Lieferant..." className={`flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} autoFocus />
                  <button type="button" onClick={() => { if (newSupplierName.trim()) { setSupplierOptions(p => [...p, newSupplierName.trim()]); setFormData({ ...formData, supplier: newSupplierName.trim() }); setNewSupplierName(''); setShowAddNewSupplier(false); setShowSupplierSheet(false); setSupplierSheetSearch(''); } }} disabled={!newSupplierName.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-50"><CheckCircle2 size={16} /></button>
                </div>
              )}
            </div>
          </div>
        </div>, document.body
      )}

      {/* ══════════════════════════════════════════════════════
          FIXED HEADER — pinned top, never scrolls
          ══════════════════════════════════════════════════════ */}
      <div className={`shrink-0 z-30 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-xl mx-auto">
          {/* Nav: Back | Steps | Close */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            {step > 1 ? (
              <button onClick={() => setStep(p => (p - 1) as any)} className={`p-2 -ml-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}><ArrowLeft size={22} /></button>
            ) : <div className="w-10" />}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <React.Fragment key={s}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-[#0077B5] text-white' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>{s}</div>
                  {s < 3 && <div className={`w-6 h-0.5 rounded ${step > s ? 'bg-[#0077B5]' : isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />}
                </React.Fragment>
              ))}
            </div>
            <button onClick={() => onNavigate('dashboard')} className={`p-2 -mr-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}><X size={20} /></button>
          </div>

          {/* Warning banners */}
          {formData.poType && (
            <div className="px-4 pb-2">
              {formData.poType === 'normal' && (
                <div className={`rounded-lg px-3 py-2 flex gap-2 items-start text-xs ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" /><p><strong>Lager:</strong> Ware wird direkt dem Bestand hinzugefügt.</p>
                </div>
              )}
              {formData.poType === 'project' && (
                <div className={`rounded-lg px-3 py-2 flex gap-2 items-start text-xs ${isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                  <Info size={14} className="shrink-0 mt-0.5" /><p><strong>Projekt:</strong> Ware reserviert — Technik wird benachrichtigt.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2/3 sticky sub-header (title + search) ── */}
          {step === 2 && (
            <div className="px-4 pb-3">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Artikel hinzufügen</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Positionen zur Bestellung.</p>
                </div>
                <button onClick={() => setIsCreatingNew(!isCreatingNew)} className="text-xs text-[#0077B5] font-bold hover:underline flex items-center gap-1"><Plus size={14} /> {isCreatingNew ? 'Suche' : 'Neu'}</button>
              </div>
              {/* Search / Create */}
              <div className="relative z-[50]">
                {isCreatingNew ? (
                  <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <input value={newItemData.name} onChange={e => setNewItemData({ ...newItemData, name: e.target.value })} placeholder="Artikelbezeichnung" className={inputCls} autoFocus />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={newItemData.sku} onChange={e => setNewItemData({ ...newItemData, sku: e.target.value })} placeholder="SKU" className={inputCls} />
                      <div className="relative" ref={systemInputRef}>
                        <input value={newItemData.system} onChange={e => { setNewItemData({ ...newItemData, system: e.target.value }); updateSystemDropdownPosition(); }} onFocus={updateSystemDropdownPosition} placeholder="System" className={`${inputCls} pr-8`} />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={14} />
                        {showSystemDropdown && filteredSystems.length > 0 && createPortal(
                          <div ref={systemDropdownRef} style={{ position: 'absolute', top: systemDropdownCoords.top + 4, left: systemDropdownCoords.left, width: systemDropdownCoords.width, zIndex: 99999 }} className={`max-h-40 overflow-y-auto rounded-xl border shadow-xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            {filteredSystems.map(sys => (<button key={sys} onClick={() => { setNewItemData({ ...newItemData, system: sys }); setShowSystemDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all ${isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}>{sys}</button>))}
                          </div>, document.body
                        )}
                      </div>
                    </div>
                    <button onClick={handleCreateNewItem} disabled={!newItemData.name || !newItemData.sku} className="w-full py-2.5 bg-[#0077B5] text-white rounded-xl font-bold text-sm hover:bg-[#00A0DC] disabled:opacity-50 transition-colors">Erstellen & hinzufügen</button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input ref={searchInputRef} value={searchTerm} onChange={e => handleSearchChange(e.target.value)} onFocus={() => { if (searchTerm) updateSearchDropdownPosition(); }} placeholder="Artikel suchen..." className={`${inputCls} pl-10 py-2.5`} autoFocus />
                    {showSearchDropdown && searchResults.length > 0 && createPortal(
                      <div ref={searchDropdownRef} style={{ position: 'absolute', top: searchDropdownCoords.top + 8, left: searchDropdownCoords.left, width: searchDropdownCoords.width, zIndex: 99999, maxHeight: '300px' }} className={`rounded-xl border shadow-2xl overflow-y-auto ${isDark ? 'bg-[#1e293b] border-slate-600' : 'bg-white border-slate-300'}`}>
                        {searchResults.map(item => (
                          <button key={item.id} onClick={() => addToCart(item)} className={`w-full text-left p-3 flex justify-between items-center border-b last:border-0 transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700 text-slate-200' : 'border-slate-100 hover:bg-slate-50 text-slate-800'}`}>
                            <div><div className="font-bold text-sm">{item.name}</div><div className="text-xs opacity-60 mt-0.5">#{item.sku} · {item.system}</div></div>
                            <div className="bg-[#0077B5]/10 p-1.5 rounded-full"><Plus size={16} className="text-[#0077B5]" /></div>
                          </button>
                        ))}
                      </div>, document.body
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="px-4 pb-3">
              <div className="mb-3">
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Zusammenfassung</h3>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Überprüfen Sie die Bestellung.</p>
              </div>
              {/* Summary card */}
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#1f2937] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Bestell Nr.</div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formData.orderId}</div>
                  </div>
                  <div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Datum</div>
                    <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(formData.orderDate)}</div>
                  </div>
                  <div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Typ</div>
                    <div className={`font-bold flex items-center gap-1 ${formData.poType === 'project' ? 'text-blue-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                      {formData.poType === 'project' ? <Briefcase size={12} /> : <Box size={12} />} {formData.poType === 'project' ? 'Projekt' : 'Lager'}
                    </div>
                  </div>
                  <div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Lieferant</div>
                    <div className={`font-bold flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}><Truck size={12} /> {formData.supplier}</div>
                  </div>
                  {formData.expectedDeliveryDate && (
                    <div className="col-span-2 pt-2 border-t border-slate-500/10">
                      <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Liefertermin</div>
                      <div className={`font-bold flex items-center gap-1 ${isDark ? 'text-white' : 'text-gray-900'}`}><Calendar size={12} /> {formatDate(formData.expectedDeliveryDate)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Bottom border for header */}
        <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
      </div>

      {/* ══════════════════════════════════════════════════════
          SCROLLABLE CONTENT — only this region scrolls
          ══════════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 overflow-hidden md:overflow-y-auto">
          <div className={`max-w-xl mx-auto ${step !== 1 ? 'h-full flex flex-col md:block md:h-auto' : ''}`}>

            {/* ── STEP 1: Fixed, no scroll ── */}
            {step === 1 && (
              <div className="px-4 pt-3 pb-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{initialOrder ? 'Bestellung bearbeiten' : 'Kopfdaten'}</h3>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Basisdaten der Bestellung.</p>
                  </div>
                  {enableSmartImport && !initialOrder && (
                    <button onClick={() => setShowImportModal(true)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${isDark ? 'text-slate-400 border-slate-700 hover:text-white hover:border-slate-500' : 'text-slate-500 border-slate-300 hover:text-slate-800 hover:border-slate-400'}`}><FileText size={12} /> Import</button>
                  )}
                </div>
                <div className="space-y-3">
                  {/* PO Type */}
                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Art <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setFormData({ ...formData, poType: 'normal' })} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${formData.poType === 'normal' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/20' : isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}><Box size={14} /> Lager</button>
                      <button onClick={() => setFormData({ ...formData, poType: 'project' })} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${formData.poType === 'project' ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20' : isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}><Briefcase size={14} /> Projekt</button>
                    </div>
                  </div>
                  {/* Order Number */}
                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bestell Nr. <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14} />
                      <input value={formData.orderId} onChange={e => setFormData({ ...formData, orderId: e.target.value })} className={`${inputCls} pl-9 py-2`} placeholder="PO-202X-..." disabled={!!initialOrder} />
                    </div>
                  </div>
                  {/* Supplier */}
                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lieferant <span className="text-red-500">*</span></label>
                    <button type="button" onClick={() => setShowSupplierSheet(true)}
                      className={`w-full px-3 py-2 rounded-xl border flex items-center justify-between text-sm transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                      <span className={formData.supplier ? '' : 'opacity-40'}>{formData.supplier || 'Lieferant wählen...'}</span>
                      <ChevronDown size={16} className="opacity-40" />
                    </button>
                  </div>
                  {/* Date row */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Datum <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none z-10" size={10} />
                        <input type="date" value={formData.orderDate} onChange={e => setFormData({ ...formData, orderDate: e.target.value })} className={`${inputCls} pl-5 pr-1 py-0.5 text-[11px] w-full`} style={{ colorScheme: isDark ? 'dark' : 'light', fontSize: '11px', height: '30px', minHeight: '0', WebkitAppearance: 'none', lineHeight: '1' }} />
                      </div>
                    </div>
                    <div>
                      <label className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Liefertermin {requireDeliveryDate && <span className="text-red-500">*</span>}</label>
                      <div className="relative">
                        <Clock className="absolute left-1.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none z-10" size={10} />
                        <input type="date" value={formData.expectedDeliveryDate} onChange={e => setFormData({ ...formData, expectedDeliveryDate: e.target.value })} className={`${inputCls} pl-5 pr-1 py-0.5 text-[11px] w-full`} style={{ colorScheme: isDark ? 'dark' : 'light', fontSize: '11px', height: '30px', minHeight: '0', WebkitAppearance: 'none', lineHeight: '1' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Only list scrolls ── */}
            {step === 2 && (
              <div className="px-4 pt-3 pb-4 flex-1 min-h-0 overflow-y-auto md:flex-none md:min-h-0">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Positionen ({cart.filter(c => !c.isDeleted).length})
                </h4>
                {cart.length === 0 ? (
                  <div className={`p-6 border rounded-xl border-dashed text-center text-sm ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-300'}`}>Keine Artikel ausgewählt.</div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((line, idx) => {
                      const isDel = line.isDeleted;
                      const isAdd = line.isAddedLater && !line.isDeleted;
                      return (
                        <div key={idx} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'} ${isDel ? 'opacity-50' : ''} ${isAdd ? 'border-blue-500/20' : ''}`}>
                          <div className="flex-1 min-w-0">
                            <div className={`font-bold text-sm truncate flex items-center gap-1.5 ${isDel ? 'line-through text-slate-500' : isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {line.name}
                              {isAdd && <span className="px-1 py-0.5 rounded text-[9px] bg-blue-500 text-white font-bold shrink-0">NEU</span>}
                              {isDel && <span className="px-1 py-0.5 rounded text-[9px] bg-red-500/20 text-red-500 font-bold shrink-0">STORNO</span>}
                            </div>
                            <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#{line.sku} · {line.system}</div>
                          </div>
                          <PlusMinusPicker value={line.quantity} onChange={v => updateCartQty(idx, v)} min={1} max={9999} disabled={!!isDel} isDark={isDark} />
                          {isDel ? (
                            <button onClick={() => reactivateCartItem(idx)} className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors" title="Wiederherstellen"><Undo2 size={16} /></button>
                          ) : (
                            <button onClick={() => removeCartItem(idx)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors" title="Löschen"><Trash2 size={16} /></button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Only list scrolls ── */}
            {step === 3 && (
              <div className="px-4 pt-3 pb-4 flex-1 min-h-0 overflow-y-auto md:flex-none md:min-h-0">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Positionen ({cart.filter(c => !c.isDeleted).length})
                </h4>
                <div className="space-y-2">
                  {cart.map((line, idx) => {
                    const isDel = line.isDeleted;
                    const isAdd = line.isAddedLater && !line.isDeleted;
                    return (
                      <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'} ${isDel ? 'opacity-50' : ''} ${isAdd ? 'border-blue-500/20' : ''}`}>
                        <div className="flex-1 min-w-0 mr-3">
                          <div className={`font-bold text-sm truncate flex items-center gap-1.5 ${isDel ? 'line-through text-slate-500' : isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {line.name}
                            {isAdd && <span className="px-1 py-0.5 rounded text-[9px] bg-blue-500 text-white font-bold shrink-0">NEU</span>}
                            {isDel && <span className="px-1 py-0.5 rounded text-[9px] bg-red-500/20 text-red-500 font-bold shrink-0">STORNO</span>}
                          </div>
                          <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#{line.sku} · {line.system}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Menge</span>
                          <span className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'} ${isDel ? 'line-through opacity-50' : ''}`}>{line.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(step === 2 || step === 3) && <div className="hidden md:block h-6" />}
          </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          FIXED BOTTOM BUTTON — always visible, never occluded
          ══════════════════════════════════════════════════════ */}
      <div className={`shrink-0 z-30 border-t fixed bottom-0 left-0 right-0 md:static ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-xl mx-auto px-4 pt-2.5 md:flex md:justify-end">
          {step < 3 ? (
            <button onClick={() => setStep(p => (p + 1) as any)} disabled={!canGoNext()}
              className={`w-full md:w-auto px-6 py-3 md:py-[9px] rounded-xl md:rounded-lg font-bold md:font-semibold inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] text-sm md:text-[13px] text-white ${canGoNext() ? 'bg-[#0077B5] hover:bg-[#005f8f] shadow-md md:shadow-sm shadow-blue-500/25 md:shadow-blue-500/15' : 'bg-slate-300 dark:bg-slate-700 shadow-none cursor-not-allowed'}`}>
              Weiter <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submissionStatus === 'submitting'}
              className="w-full md:w-auto px-8 py-3 md:py-[9px] bg-[#0077B5] hover:bg-[#005f8f] rounded-xl md:rounded-lg font-bold md:font-semibold shadow-md md:shadow-sm shadow-blue-500/25 md:shadow-blue-500/15 disabled:opacity-40 inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] text-sm md:text-[13px] text-white">
              {submissionStatus === 'submitting' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {initialOrder ? 'Aktualisieren' : 'Bestellung erstellen'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};