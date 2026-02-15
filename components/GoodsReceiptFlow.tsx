import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Search, Plus, Calendar, Truck, Package, 
  Hash, Info, CheckCircle2, AlertCircle, ChevronDown, Check,
  ArrowRight, ArrowLeft, Trash2, MapPin, FileText, Building2,
  AlertTriangle, Loader2, Home, ClipboardList, Ban, LogOut, 
  PlusCircle, Clock, Box, ChevronUp, Briefcase, Minus, XCircle,
  ShieldBan, Layers, RotateCcw, BarChart3, ChevronsUp, ChevronsDown
} from 'lucide-react';
import { StockItem, Theme, ReceiptHeader, PurchaseOrder, ReceiptMaster, Ticket } from '../types';
import { MOCK_PURCHASE_ORDERS } from '../data';
import { TicketConfig } from './SettingsPage';

// --- SEARCHABLE DROPDOWN WITH ADD NEW ---
const SearchableDropdown = ({ 
  value, 
  onChange, 
  options, 
  onAddNew,
  placeholder = "Wählen...", 
  label,
  isDark = false 
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  onAddNew?: (newValue: string) => void;
  placeholder?: string;
  label?: string;
  isDark?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const [newItemInput, setNewItemInput] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setShowAddNew(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setSearchTerm('');
    setShowAddNew(false);
  };

  const handleAddNew = () => {
    if (newItemInput.trim() && onAddNew) {
      onAddNew(newItemInput.trim());
      onChange(newItemInput.trim());
      setNewItemInput('');
      setShowAddNew(false);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {label && <label className={`text-sm font-bold block mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</label>}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-white hover:border-slate-600' 
            : 'bg-white border-slate-300 hover:border-slate-400'
        } ${isOpen ? 'ring-2 ring-blue-500/20' : ''}`}
      >
        <span className={value ? '' : 'opacity-50'}>{value || placeholder}</span>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-2 w-full rounded-xl border shadow-2xl max-h-[300px] overflow-hidden flex flex-col ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          {/* Search */}
          <div className={`p-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <Search size={16} className="opacity-50" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Suchen..."
                className="flex-1 bg-transparent outline-none text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="flex-1 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                    value === opt 
                      ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                      : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>{opt}</span>
                  {value === opt && <Check size={16} />}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm opacity-50">Keine Ergebnisse</div>
            )}
          </div>

          {/* Add New Button */}
          {onAddNew && !showAddNew && (
            <button
              type="button"
              onClick={() => setShowAddNew(true)}
              className={`p-3 border-t flex items-center justify-center gap-2 text-sm font-bold transition-colors ${
                isDark 
                  ? 'border-slate-700 hover:bg-slate-800 text-blue-400' 
                  : 'border-slate-200 hover:bg-slate-50 text-blue-600'
              }`}
            >
              <Plus size={16} /> Neuen Lagerort hinzufügen
            </button>
          )}

          {/* Add New Input */}
          {showAddNew && (
            <div className={`p-3 border-t ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemInput}
                  onChange={(e) => setNewItemInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                  placeholder="Neuer Lagerort..."
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddNew}
                  disabled={!newItemInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-blue-500"
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {setShowAddNew(false); setNewItemInput('');}}
                  className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LAGERORT_OPTIONS: string[] = [
  "Akku Service","Brandt, Service, B DI 446E","Dallmann, Service","EKZFK","GERAS","HaB","HAB",
  "HaB Altbestand Kunde","HLU","HTW","KEH","Kitas","Koplin, Service, B DI 243","KWF",
  "Lavrenz, Service","LHW","MPC","Pfefferwerk/WAB","RAS_Zubehör","RBB","RBB_SSP",
  "Stöwhaas,Service","Tau13","Trittel, Service","ukb","UKB Lager","UKB Service","Wartungsklebchen"
];

interface CartItem {
    item: StockItem;
    qtyReceived: number;
    qtyDamaged: number;
    qtyWrong: number;
    qtyRejected: number;
    qtyAccepted: number;
    location: string;
    rejectionReason: 'Damaged' | 'Wrong' | 'Overdelivery' | 'Other' | '';
    rejectionNotes: string;
    returnCarrier: string;
    returnTrackingId: string;
    showIssuePanel: boolean;
    orderedQty?: number;
    previouslyReceived?: number;
    isManualAddition?: boolean;
    issueNotes: string;
}

interface ReturnPopupData {
  idx: number;
  qty: number;
  reason: string;
  carrier: string;
  tracking: string;
}

// --- PLUS/MINUS PICKER (Deutsche Post Style) ---
const PlusMinusPicker = ({ value, onChange, min = 0, max = 999, disabled = false, isDark = false }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean; isDark?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  const inc = () => { if (!disabled && value < max) onChange(value + 1); };
  const dec = () => { if (!disabled && value > min) onChange(value - 1); };
  
  const handleNumberClick = () => {
    if (disabled) return;
    setIsEditing(true);
    setTempValue(String(value));
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(tempValue) || 0;
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return (
    <div className={`flex items-center gap-1 select-none ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {/* MINUS BUTTON - RED */}
      <button 
        onClick={dec} 
        disabled={disabled || value <= min}
        className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg font-bold text-white text-2xl active:scale-95 transition-all ${
          disabled || value <= min 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-500 active:bg-red-700'
        }`}
      >
        −
      </button>

      {/* NUMBER - TAPPABLE */}
      <div className="relative">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={tempValue}
            onChange={e => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-20 h-12 text-center text-2xl font-bold font-mono rounded-lg border-2 ${
              isDark 
                ? 'bg-slate-900 border-blue-500 text-white' 
                : 'bg-white border-blue-500 text-slate-900'
            }`}
            style={{ appearance: 'none', MozAppearance: 'textfield' }}
          />
        ) : (
          <button
            onClick={handleNumberClick}
            disabled={disabled}
            className={`w-20 h-12 flex items-center justify-center text-2xl font-bold font-mono rounded-lg border-2 transition-all ${
              isDark 
                ? 'bg-slate-900 border-slate-600 text-white hover:border-slate-500' 
                : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400'
            }`}
          >
            {value}
          </button>
        )}
      </div>

      {/* PLUS BUTTON - GREEN */}
      <button 
        onClick={inc} 
        disabled={disabled || value >= max}
        className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg font-bold text-white text-2xl active:scale-95 transition-all ${
          disabled || value >= max 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
        }`}
      >
        +
      </button>
    </div>
  );
};

// --- PO SELECTION MODAL ---
const POSelectionModal = ({ isOpen, onClose, orders, onSelect, receiptMasters, theme }: {
  isOpen: boolean; onClose: () => void; orders: PurchaseOrder[]; onSelect: (po: PurchaseOrder) => void; receiptMasters: ReceiptMaster[]; theme: Theme;
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';
  const [term, setTerm] = useState('');
  const filtered = orders.filter(o => {
    if (o.isArchived || o.status === 'Storniert' || o.isForceClosed) return false;
    const totalOrdered = o.items.reduce((s, i) => s + i.quantityExpected, 0);
    const totalReceived = o.items.reduce((s, i) => s + i.quantityReceived, 0);
    if (totalReceived >= totalOrdered && totalOrdered > 0) return false;
    if (!term) return true;
    return o.id.toLowerCase().includes(term.toLowerCase()) || o.supplier.toLowerCase().includes(term.toLowerCase());
  });
  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
        <div className={`p-5 border-b flex items-center gap-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <Search className="text-slate-400" size={24} />
          <input autoFocus className={`flex-1 bg-transparent outline-none text-lg font-medium placeholder:opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`} placeholder="Bestellung suchen..." value={term} onChange={e => setTerm(e.target.value)} />
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={24} className="text-slate-400"/></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/50 flex-1">
          {filtered.length === 0 && <div className="text-center py-10 text-slate-500">Keine offenen Bestellungen gefunden.</div>}
          {filtered.map(po => {
            const totalOrdered = po.items.reduce((s, i) => s + i.quantityExpected, 0);
            const totalReceived = po.items.reduce((s, i) => s + i.quantityReceived, 0);
            const isProject = po.status === 'Projekt';
            return (
              <button key={po.id} onClick={() => onSelect(po)} className={`w-full text-left p-4 rounded-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-slate-200 hover:border-[#0077B5] hover:shadow-md'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-mono font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{po.id}</span>
                  {isProject ? <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center gap-1 ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-900' : 'bg-blue-100 text-blue-700 border-blue-200'}`}><Briefcase size={10}/> Projekt</span> : <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center gap-1 ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}><Box size={10}/> Lager</span>}
                  {totalReceived > 0 && totalReceived < totalOrdered && <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>Teillieferung</span>}
                </div>
                <div className="flex items-center gap-4 text-sm opacity-70">
                  <span className="flex items-center gap-1.5 font-medium"><Truck size={14}/> {po.supplier}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(po.dateCreated).toLocaleDateString()}</span>
                  <span className="ml-auto font-mono text-xs opacity-50">{po.items.length} Pos.</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>, document.body
  );
};

interface GoodsReceiptFlowProps {
  theme: Theme;
  existingItems: StockItem[];
  onClose: () => void;
  onSuccess: (header: Omit<ReceiptHeader, 'timestamp' | 'itemCount'>, cartItems: any[], newItemsCreated: StockItem[], forceClose?: boolean) => void;
  onLogStock?: (itemId: string, itemName: string, action: 'add' | 'remove', quantity: number, source?: string, context?: 'normal' | 'project' | 'manual' | 'po-normal' | 'po-project') => void;
  purchaseOrders?: PurchaseOrder[];
  initialPoId?: string | null;
  initialMode?: 'standard' | 'return' | 'problem';
  receiptMasters?: ReceiptMaster[];
  ticketConfig: TicketConfig;
  onAddTicket: (ticket: Ticket) => void;
}

export const GoodsReceiptFlow: React.FC<GoodsReceiptFlowProps> = ({
  theme, existingItems, onClose, onSuccess, onLogStock, purchaseOrders,
  initialPoId, initialMode = 'standard', receiptMasters = [], ticketConfig, onAddTicket
}) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [headerData, setHeaderData] = useState({
    lieferscheinNr: '', bestellNr: '', lieferdatum: new Date().toISOString().split('T')[0],
    lieferant: '', status: 'In Bearbeitung', warehouseLocation: ''
  });

  const [finalResultStatus, setFinalResultStatus] = useState('');
  const [linkedPoId, setLinkedPoId] = useState<string | null>(null);
  const [showPoModal, setShowPoModal] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [forceClose, setForceClose] = useState(false);
  const [isAdminClose, setIsAdminClose] = useState(false);

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchDropdownCoords, setSearchDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lagerortOptions, setLagerortOptions] = useState<string[]>(LAGERORT_OPTIONS);
  const [returnPopup, setReturnPopup] = useState<ReturnPopupData | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [returnAutoAdvancing, setReturnAutoAdvancing] = useState(false);

  // --- LIVE MATH ---
  const getLineCalc = (line: CartItem) => {
    const bestellt = line.orderedQty || 0;
    const bisHeute = line.previouslyReceived || 0;
    const heute = line.qtyReceived;
    const beschaedigt = line.qtyDamaged || 0;
    const falsch = line.qtyWrong || 0;
    const zurueck = beschaedigt + falsch;
    const geliefertGesamt = bisHeute + heute;
    const zuViel = Math.max(0, geliefertGesamt - zurueck - bestellt);
    const offen = Math.max(0, bestellt - (geliefertGesamt - zurueck));
    return { bestellt, bisHeute, heute, zurueck, beschaedigt, falsch, geliefertGesamt, zuViel, offen };
  };

  const getAutoStatusIcon = (line: CartItem) => {
    const { offen, zuViel } = getLineCalc(line);
    if (zuViel > 0) return 'orange';
    if (offen > 0) return 'amber';
    return 'green';
  };

  const globalStats = useMemo(() => {
    let totalOffen = 0, totalZuViel = 0, totalZurueck = 0, totalBuchung = 0, totalDamaged = 0, totalWrong = 0;
    cart.forEach(c => {
      const calc = getLineCalc(c);
      totalOffen += calc.offen;
      totalZuViel += calc.zuViel;
      totalZurueck += c.qtyRejected;
      totalBuchung += c.qtyAccepted;
      totalDamaged += c.qtyDamaged;
      totalWrong += c.qtyWrong;
    });
    return { totalOffen, totalDamaged, totalWrong, totalZuViel, totalZurueck, totalBuchung };
  }, [cart]);

  const isPartialDelivery = useMemo(() => {
    if (!linkedPoId) return false;
    return cart.some(c => getLineCalc(c).offen > 0);
  }, [cart, linkedPoId]);

  const calculateReceiptStatus = (currentCart: CartItem[], poId: string | null) => {
    // 1. All rejected → Abgelehnt
    const allRejected = currentCart.length > 0 && currentCart.every(c => c.qtyRejected === c.qtyReceived && c.qtyReceived > 0);
    if (allRejected) return 'Abgelehnt';

    // 2. Quality issues take HIGHEST priority
    const hasDamage = currentCart.some(c => c.qtyDamaged > 0);
    const hasWrong = currentCart.some(c => c.qtyWrong > 0);
    if (hasDamage && hasWrong) return 'Schaden + Falsch';
    if (hasDamage) return 'Schaden';
    if (hasWrong) return 'Falsch geliefert';

    // 3. Quantity checks (only if PO-linked)
    if (poId) {
      const po = purchaseOrders?.find(p => p.id === poId);
      if (po) {
        const master = receiptMasters.find(m => m.poId === poId);
        let anyOver = false, anyUnder = false;
        for (const poItem of po.items) {
          let hist = 0;
          if (master) master.deliveries.forEach(d => { const di = d.items.find(x => x.sku === poItem.sku); if (di) hist += di.quantityAccepted; });
          const ci = currentCart.find(c => c.item.sku === poItem.sku);
          const total = hist + (ci ? ci.qtyAccepted : 0);
          if (total < poItem.quantityExpected) anyUnder = true;
          if (total > poItem.quantityExpected) anyOver = true;
        }
        if (anyOver) return 'Übermenge';
        if (anyUnder) return 'Teillieferung';
        return 'Gebucht';
      }
    }

    // 4. Fallback (no PO)
    return currentCart.some(c => c.qtyRejected > 0) ? 'Teillieferung' : 'Gebucht';
  };

  useEffect(() => {
    if (step === 3) { setHeaderData(prev => ({ ...prev, status: calculateReceiptStatus(cart, linkedPoId) })); }
  }, [step, cart, linkedPoId]);

  useEffect(() => {
    const h = () => setShowSearchDropdown(false);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const addToCart = (item: StockItem) => {
    setCart(prev => [...prev, {
      item, qtyReceived: 1, qtyDamaged: 0, qtyWrong: 0, qtyRejected: 0, qtyAccepted: 1,
      rejectionReason: '', rejectionNotes: '', returnCarrier: '', returnTrackingId: '',
      orderedQty: linkedPoId ? 0 : undefined, previouslyReceived: 0,
      location: headerData.warehouseLocation, issueNotes: '', showIssuePanel: false, isManualAddition: !!linkedPoId
    }]);
    setSearchTerm(''); setShowSearchDropdown(false);
  };

  const updateCartItem = (index: number, field: keyof CartItem, value: any) => {
    setCart(prev => prev.map((line, i) => {
      if (i !== index) return line;
      const u = { ...line, [field]: value };
      // Recalc rejection totals when damage/wrong/received changes
      if (field === 'qtyDamaged' || field === 'qtyWrong' || field === 'qtyReceived' || field === 'qtyRejected') {
        if (field === 'qtyDamaged' || field === 'qtyWrong') {
          u.qtyRejected = u.qtyDamaged + u.qtyWrong;
          // Auto-derive rejectionReason
          if (u.qtyDamaged > 0 && u.qtyWrong > 0) u.rejectionReason = 'Damaged';
          else if (u.qtyDamaged > 0) u.rejectionReason = 'Damaged';
          else if (u.qtyWrong > 0) u.rejectionReason = 'Wrong';
          else u.rejectionReason = '';
        }
        u.qtyAccepted = u.qtyReceived - u.qtyRejected;
      }
      return u;
    }));
  };

  const handleSelectPO = (po: PurchaseOrder, forcedAdmin = false) => {
    setLinkedPoId(po.id);
    setHeaderData(prev => ({ ...prev, bestellNr: po.id, lieferant: po.supplier }));
    setShowPoModal(false);
    const master = receiptMasters.find(m => m.poId === po.id);
    const histMap = new Map<string, number>();
    if (master) master.deliveries.forEach(d => d.items.forEach(it => histMap.set(it.sku, (histMap.get(it.sku) || 0) + it.quantityAccepted)));
    const useZero = forcedAdmin || isAdminClose;
    setCardIdx(0);
    setCart(po.items.map(poItem => {
      const inv = existingItems.find(e => e.sku === poItem.sku);
      const hist = histMap.get(poItem.sku) || 0;
      const remaining = Math.max(0, poItem.quantityExpected - hist);
      const qty = useZero ? 0 : remaining;
      const item: StockItem = inv ? { ...inv } : { id: crypto.randomUUID(), name: poItem.name, sku: poItem.sku, system: 'Sonstiges', category: 'Material', stockLevel: 0, minStock: 0, warehouseLocation: headerData.warehouseLocation, status: 'Active', lastUpdated: Date.now() };
      return { item, qtyReceived: qty, qtyDamaged: 0, qtyWrong: 0, qtyRejected: 0, qtyAccepted: qty, rejectionReason: '' as const, rejectionNotes: '', returnCarrier: '', returnTrackingId: '', orderedQty: poItem.quantityExpected, previouslyReceived: hist, location: headerData.warehouseLocation, issueNotes: '', showIssuePanel: false, isManualAddition: false };
    }));
  };
  // PROBLEM MODE: Load PO items fresh — ignore all delivery history
  const handleSelectPOProblem = (po: PurchaseOrder) => {
    setLinkedPoId(po.id);
    setHeaderData(prev => ({ ...prev, bestellNr: po.id, lieferant: po.supplier, lieferscheinNr: `KORR-${new Date().toISOString().split('T')[0]}` }));
    setShowPoModal(false);
    setCardIdx(0);
    setCart(po.items.map(poItem => {
      const inv = existingItems.find(e => e.sku === poItem.sku);
      const item: StockItem = inv ? { ...inv } : { id: crypto.randomUUID(), name: poItem.name, sku: poItem.sku, system: 'Sonstiges', category: 'Material', stockLevel: 0, minStock: 0, warehouseLocation: headerData.warehouseLocation, status: 'Active', lastUpdated: Date.now() };
      return { item, qtyReceived: 0, qtyDamaged: 0, qtyWrong: 0, qtyRejected: 0, qtyAccepted: 0, rejectionReason: '' as const, rejectionNotes: '', returnCarrier: '', returnTrackingId: '', orderedQty: poItem.quantityExpected, previouslyReceived: 0, location: headerData.warehouseLocation, issueNotes: '', showIssuePanel: false, isManualAddition: false };
    }));
  };

  useEffect(() => {
    if (initialPoId && purchaseOrders && !linkedPoId) {
      const po = purchaseOrders.find(p => p.id === initialPoId);
      if (po) {
        if (initialMode === 'problem') {
          // PROBLEM MODE: Fresh inspection — ignore delivery history
          handleSelectPOProblem(po);
          setStep(2);
        } else {
          handleSelectPO(po);
        }
        if (initialMode === 'return') {
          const d = new Date().toLocaleDateString('de-DE', {day:'2-digit',month:'2-digit',year:'numeric'}).replace(/\./g, '');
          let loc = headerData.warehouseLocation || 'Wareneingang';
          const fi = existingItems.find(i => i.sku === po.items[0]?.sku);
          if (fi?.warehouseLocation) loc = fi.warehouseLocation;
          setHeaderData(prev => ({ ...prev, lieferscheinNr: `RÜCK-${d}`, warehouseLocation: loc, status: 'Rücklieferung' }));
          setReturnAutoAdvancing(true);
          setStep(3);
        } else { setStep(1); }
      }
    }
  }, [initialPoId, purchaseOrders, initialMode]);

  // Auto-clear return loading overlay once step 3 is ready with cart
  useEffect(() => {
    if (returnAutoAdvancing && step === 3 && cart.length > 0) {
      const timer = setTimeout(() => setReturnAutoAdvancing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [returnAutoAdvancing, step, cart.length]);

  const handleAdminCloseToggle = (checked: boolean) => {
    setIsAdminClose(checked);
    if (checked) {
      setHeaderData(prev => ({ ...prev, lieferscheinNr: `ABSCHLUSS-${new Date().toISOString().split('T')[0]}`, lieferant: linkedPoId ? (purchaseOrders?.find(p => p.id === linkedPoId)?.supplier || prev.lieferant) : prev.lieferant }));
      setCart(prev => prev.map(c => ({ ...c, qtyReceived: 0, qtyDamaged: 0, qtyWrong: 0, qtyAccepted: 0, qtyRejected: 0 })));
      setForceClose(true);
    } else {
      setHeaderData(prev => ({ ...prev, lieferscheinNr: prev.lieferscheinNr.startsWith('ABSCHLUSS-') ? '' : prev.lieferscheinNr }));
      setForceClose(false);
      if (linkedPoId && purchaseOrders) { const po = purchaseOrders.find(p => p.id === linkedPoId); if (po) handleSelectPO(po, false); }
    }
  };

  const handleReturnSubmit = () => {
    if (!returnPopup) return;
    const { idx, qty, reason, carrier, tracking } = returnPopup;
    setCart(prev => prev.map((line, i) => {
      if (i !== idx) return line;
      const newRej = line.qtyRejected + qty;
      return { ...line, qtyRejected: newRej, qtyAccepted: line.qtyReceived - newRej, rejectionReason: 'Overdelivery', rejectionNotes: reason, returnCarrier: carrier, returnTrackingId: tracking };
    }));
    setReturnPopup(null);
  };

  const handleFinalize = () => {
    const batchId = `b-${Date.now()}`;
    
    // Separate issue tracking by category
    const qualityIssues: string[] = [];
    const partialDeliveryIssues: string[] = [];
    const overdeliveryIssues: string[] = [];
    const returnTrackingInfo: string[] = [];
    
    const qualityTypes = new Set<string>();
    
    if (initialMode !== 'return') {
      cart.forEach(c => {
        const lbl = `${c.item.name} (${c.item.sku})`;
        const calc = getLineCalc(c);
        
        // QUALITY ISSUES: Damaged, Wrong, Rejected
        if (c.qtyRejected > 0) {
          const r = c.rejectionReason === 'Damaged' ? 'Beschädigt' : c.rejectionReason === 'Wrong' ? 'Falsch' : c.rejectionReason === 'Overdelivery' ? 'Übermenge' : 'Sonstiges';
          
          // Check individual ticket config flags
          if (c.rejectionReason === 'Damaged' && ticketConfig.damage) {
            qualityIssues.push(`${lbl}: ${c.qtyRejected}x Abgelehnt (${r}) - ${c.rejectionNotes || 'Keine Details'}`);
            qualityTypes.add('Beschädigung');
          } else if (c.rejectionReason === 'Wrong' && ticketConfig.wrong) {
            qualityIssues.push(`${lbl}: ${c.qtyRejected}x Abgelehnt (${r}) - ${c.rejectionNotes || 'Keine Details'}`);
            qualityTypes.add('Falschlieferung');
          } else if (c.rejectionReason === 'Other' && ticketConfig.rejected) {
            qualityIssues.push(`${lbl}: ${c.qtyRejected}x Abgelehnt (${r}) - ${c.rejectionNotes || 'Keine Details'}`);
            qualityTypes.add('Abweichung');
          } else if (c.rejectionReason === 'Overdelivery' && ticketConfig.extra) {
            // Overdelivery rejections handled separately
            overdeliveryIssues.push(`${lbl}: ${c.qtyRejected}x zurückgesendet (Übermenge) - ${c.rejectionNotes || 'Keine Details'}`);
          }
          
          // Add return tracking info if available
          if (c.returnCarrier || c.returnTrackingId) {
            const trackingDetail = `Rücksendung ${lbl}: ${c.qtyRejected}x — Versandart: ${c.returnCarrier || 'Nicht angegeben'} — Tracking: ${c.returnTrackingId || 'Nicht angegeben'}${c.rejectionNotes ? ` — Grund: ${c.rejectionNotes}` : ''}`;
            returnTrackingInfo.push(trackingDetail);
          }
        }
        
        // PARTIAL DELIVERY (OFFEN > 0)
        if (ticketConfig.missing && linkedPoId && calc.offen > 0) {
          partialDeliveryIssues.push(`${lbl}: Bestellt ${calc.bestellt}, Geliefert ${calc.heute}, Offen ${calc.offen}`);
        }
        
        // OVERDELIVERY (ZU VIEL > 0)
        if (ticketConfig.extra && c.orderedQty !== undefined && c.qtyAccepted > 0) {
          const tot = (c.previouslyReceived || 0) + c.qtyAccepted;
          if (tot > c.orderedQty) {
            overdeliveryIssues.push(`${lbl}: Bestellt ${c.orderedQty}, Gesamt geliefert ${tot}, Zu viel ${tot - c.orderedQty}`);
          }
        }
      });
      
      // CREATE TICKET FOR QUALITY ISSUES (Damage, Wrong, Rejected)
      if (qualityIssues.length > 0) {
        const qualityMessages: any[] = [
          { 
            id: crypto.randomUUID(), 
            author: 'System', 
            text: `Automatisch erstellter Qualitätsfall:\n\n${qualityIssues.join('\n')}`, 
            timestamp: Date.now(), 
            type: 'system' 
          }
        ];
        
        // Add return tracking as separate message if available
        if (returnTrackingInfo.length > 0) {
          qualityMessages.push({
            id: crypto.randomUUID(),
            author: 'System',
            text: `Rücksendung erfasst:\n\n${returnTrackingInfo.join('\n')}`,
            timestamp: Date.now() + 1,
            type: 'system'
          });
        }
        
        onAddTicket({ 
          id: crypto.randomUUID(), 
          receiptId: batchId, 
          subject: `Qualitätsproblem: ${Array.from(qualityTypes).join(', ')} — ${linkedPoId || headerData.lieferscheinNr}`, 
          status: 'Open', 
          priority: 'High',
          messages: qualityMessages
        });
      }
      
      // CREATE TICKET FOR PARTIAL DELIVERY (OFFEN > 0)
      if (partialDeliveryIssues.length > 0) {
        const totalOffen = cart.reduce((sum, c) => sum + getLineCalc(c).offen, 0);
        onAddTicket({
          id: crypto.randomUUID(),
          receiptId: batchId,
          subject: `Teillieferung — ${linkedPoId || headerData.lieferscheinNr} — Offen: ${totalOffen} Stück`,
          status: 'Open',
          priority: 'Normal',
          messages: [
            {
              id: crypto.randomUUID(),
              author: 'System',
              text: `Automatisch erstellter Fall (Teillieferung):\n\n${partialDeliveryIssues.join('\n')}\n\nGesamt offen: ${totalOffen} Stück`,
              timestamp: Date.now(),
              type: 'system'
            }
          ]
        });
      }
      
      // CREATE TICKET FOR OVERDELIVERY (ZU VIEL > 0)
      if (overdeliveryIssues.length > 0) {
        const totalZuViel = cart.reduce((sum, c) => {
          const calc = getLineCalc(c);
          return sum + calc.zuViel;
        }, 0);
        
        const overMessages: any[] = [
          {
            id: crypto.randomUUID(),
            author: 'System',
            text: `Automatisch erstellter Fall (Übermenge):\n\n${overdeliveryIssues.join('\n')}\n\nGesamt zu viel: ${totalZuViel} Stück`,
            timestamp: Date.now(),
            type: 'system'
          }
        ];
        
        // Add return tracking for overdelivery if available
        const overdeliveryReturns = returnTrackingInfo.filter(info => info.includes('Übermenge'));
        if (overdeliveryReturns.length > 0) {
          overMessages.push({
            id: crypto.randomUUID(),
            author: 'System',
            text: `Rücksendung erfasst:\n\n${overdeliveryReturns.join('\n')}`,
            timestamp: Date.now() + 1,
            type: 'system'
          });
        }
        
        onAddTicket({
          id: crypto.randomUUID(),
          receiptId: batchId,
          subject: `Übermenge — ${linkedPoId || headerData.lieferscheinNr} — Zu viel: ${totalZuViel} Stück`,
          status: 'Open',
          priority: 'Normal',
          messages: overMessages
        });
      }
    }
    
    const clean = cart.map(c => ({ ...c, qty: c.qtyAccepted, isDamaged: c.rejectionReason === 'Damaged' && c.qtyRejected > 0, issueNotes: c.rejectionNotes || c.issueNotes }));
    if (onLogStock) clean.forEach(c => { if (c.qty !== 0) onLogStock(c.item.sku, c.item.name, c.qty > 0 ? 'add' : 'remove', Math.abs(c.qty), `Wareneingang ${headerData.lieferscheinNr}`, 'po-normal'); });
    const created = cart.filter(c => c.qtyAccepted > 0).map(c => c.item).filter(i => !existingItems.find(e => e.id === i.id));
    // Enrich cart items with proper rejection data from Beschädigt/Falsch columns
    const enriched = clean.map((c: any) => {
        const src = cart.find(x => x.item.sku === c.item.sku);
        if (src) {
            c.qtyDamaged = src.qtyDamaged;
            c.qtyWrong = src.qtyWrong;
            c.isDamaged = src.qtyDamaged > 0;
            if (src.qtyDamaged > 0 && src.qtyWrong > 0) c.rejectionReason = 'Damaged';
            else if (src.qtyDamaged > 0) c.rejectionReason = 'Damaged';
            else if (src.qtyWrong > 0) c.rejectionReason = 'Wrong';
        }
        return c;
    });
    onSuccess({ ...headerData, batchId, status: finalResultStatus }, enriched, created, forceClose);
  };

  const inputClass = `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:ring-blue-500/30' : 'bg-white border-slate-200 text-[#313335] focus:ring-[#0077B5]/20'}`;
  const labelClass = `text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`;
  const valClass = `font-mono text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`;

  const StatusDot = ({ color }: { color: 'green' | 'amber' | 'orange' | 'gray' }) => {
    const cls = color === 'green' ? 'text-emerald-500' : color === 'amber' ? 'text-amber-500' : color === 'orange' ? 'text-orange-500' : 'text-slate-400';
    if (color === 'green' || color === 'gray') return <CheckCircle2 size={18} className={cls} />;
    return <AlertTriangle size={18} className={cls} />;
  };

  return (
    <div className={`h-full flex flex-col rounded-2xl border overflow-hidden animate-in slide-in-from-right-8 duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>

      {/* RETURN AUTO-ADVANCE OVERLAY */}
      {returnAutoAdvancing && createPortal(
        <div className="fixed inset-0 z-[100000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-[#0077B5] animate-spin" />
            <p className="text-white font-bold text-lg">Rücksendung wird vorbereitet…</p>
          </div>
        </div>, document.body
      )}

      {/* SUCCESS OVERLAY */}
      {submissionStatus === 'success' && createPortal(
        <div className="fixed inset-0 z-[100000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
              <Check size={32} className="text-white" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Erfolgreich gebucht!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Wareneingang wurde erfasst.</p>
            <button onClick={() => { setSubmissionStatus('idle'); handleFinalize(); onClose(); }} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors">
              Schließen
            </button>
          </div>
        </div>, document.body
      )}

      {/* RETURN POPUP */}
      {returnPopup && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReturnPopup(null)} />
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
              <RotateCcw size={24} className="text-orange-500"/>
              <h3 className="text-lg font-bold">Rücksendung erfassen</h3>
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-2 block opacity-60">Menge</label>
              <input type="number" min="1" value={returnPopup.qty} onChange={e => setReturnPopup(p => p ? {...p, qty: parseInt(e.target.value) || 1} : null)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-2 block opacity-60">Grund</label>
              <input value={returnPopup.reason} onChange={e => setReturnPopup(p => p ? {...p, reason: e.target.value} : null)} placeholder="z.B. Überzahl, beschädigt..." className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-2 block opacity-60">Versandart</label>
              <input value={returnPopup.carrier} onChange={e => setReturnPopup(p => p ? {...p, carrier: e.target.value} : null)} placeholder="DHL, Hermes..." className={inputClass} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-2 block opacity-60">Tracking-ID</label>
              <input value={returnPopup.tracking} onChange={e => setReturnPopup(p => p ? {...p, tracking: e.target.value} : null)} placeholder="Optional" className={inputClass} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setReturnPopup(null)} className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Abbrechen</button>
              <button onClick={handleReturnSubmit} className="flex-1 px-4 py-3 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-500">Bestätigen</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* HEADER */}
      <div className={`p-4 md:p-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#0077B5]/20' : 'bg-[#0077B5]/10'}`}>
            <Package size={24} className="text-[#0077B5]" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Wareneingang</h2>
            <div className="text-xs opacity-60">Schritt {step} von 3</div>
          </div>
        </div>
        <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
          <X size={24} />
        </button>
      </div>

      {/* PROGRESS */}
      <div className={`px-4 md:px-5 py-3 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-[#0077B5]' : (isDark ? 'bg-slate-800' : 'bg-slate-200')}`} />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] uppercase font-bold tracking-wider opacity-60">
          <span>Kopfdaten</span>
          <span>Inspektion</span>
          <span>Prüfung</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`${labelClass} mb-2 block`}>Lieferschein-Nr. *</label>
                <input value={headerData.lieferscheinNr} onChange={e => setHeaderData(prev => ({...prev, lieferscheinNr: e.target.value}))} placeholder="LS-2024-001" className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} mb-2 block`}>Lieferdatum</label>
                <input type="date" value={headerData.lieferdatum} onChange={e => setHeaderData(prev => ({...prev, lieferdatum: e.target.value}))} className={inputClass} />
              </div>
            </div>

            {!linkedPoId && (
              <div>
                <label className={`${labelClass} mb-2 block`}>Lieferant</label>
                <input value={headerData.lieferant} onChange={e => setHeaderData(prev => ({...prev, lieferant: e.target.value}))} placeholder="Battery Kutter" className={inputClass} />
              </div>
            )}

            <SearchableDropdown
  value={headerData.warehouseLocation}
  onChange={(val) => setHeaderData(prev => ({...prev, warehouseLocation: val}))}
  options={lagerortOptions}
  onAddNew={(newLoc) => setLagerortOptions(prev => [...prev, newLoc])}
  label="Lagerort"
  isDark={isDark}
/>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm">Bestellung verknüpfen (optional)</span>
                {linkedPoId && (
                  <button onClick={() => { setLinkedPoId(null); setHeaderData(prev => ({ ...prev, bestellNr: '', lieferant: '' })); setCart([]); }} className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
                    <X size={14}/> Trennen
                  </button>
                )}
              </div>
              {linkedPoId ? (
                <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <ClipboardList size={18} className="text-[#0077B5]"/>
                    <span className="font-mono font-bold">{linkedPoId}</span>
                  </div>
                  <div className="text-xs opacity-60 mt-1">{headerData.lieferant}</div>
                </div>
              ) : (
                <button onClick={() => setShowPoModal(true)} className="w-full px-4 py-3 rounded-xl font-bold border-2 border-dashed transition-all hover:border-[#0077B5] hover:bg-[#0077B5]/5 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-500/10">
                  <Plus size={20} className="inline mr-2"/> Bestellung auswählen
                </button>
              )}
            </div>

            {linkedPoId && (
              <div className={`p-4 rounded-xl border flex items-center gap-4 text-left cursor-pointer transition-colors ${isAdminClose ? (isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200') : (isDark ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300')}`} onClick={() => handleAdminCloseToggle(!isAdminClose)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAdminClose ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-400'}`}>{isAdminClose && <Check size={14} strokeWidth={3} />}</div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${isAdminClose ? 'text-purple-600 dark:text-purple-400' : ''}`}>Admin-Modus: Bestellung ohne Lieferung schließen</div>
                  <div className="text-xs opacity-60">Liefermenge auf 0 setzen, dann manuell abschließen.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 - INSPECTION */}
        {step === 2 && (
          <div className="space-y-4">
            {/* ADD ITEM */}
            <div className="sticky top-0 z-10 pb-3">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchInputRef.current) {
                      const rect = searchInputRef.current.getBoundingClientRect();
                      setSearchDropdownCoords({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width });
                    }
                    setShowSearchDropdown(true);
                  }}
                  placeholder="Artikel hinzufügen..."
                  className={`w-full pl-11 ${inputClass}`}
                />
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                {showSearchDropdown && searchTerm && createPortal(
                  <div style={{ position: 'absolute', top: `${searchDropdownCoords.top}px`, left: `${searchDropdownCoords.left}px`, width: `${searchDropdownCoords.width}px` }} className={`z-[100000] rounded-xl border shadow-2xl max-h-80 overflow-y-auto ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    {existingItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8).map(item => (
                      <button key={item.id} onClick={() => addToCart(item)} className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <div className="font-bold">{item.name}</div><div className="text-xs opacity-50">{item.sku}</div>
                      </button>
                    ))}
                  </div>, document.body
                )}
              </div>
            </div>

            {/* MOBILE CARD VIEW / DESKTOP TABLE */}
            {cart.length > 0 && (() => {
              const idx = Math.min(cardIdx, cart.length - 1);
              const line = cart[idx];
              if (!line) return null;
              const c = getLineCalc(line);
              const statusColor = getAutoStatusIcon(line);
              const hasReturn = line.qtyRejected > 0;
              const showReturnBtn = c.zuViel > 0 || line.qtyDamaged > 0 || line.qtyWrong > 0;

              return (
                <div className="space-y-3">
                  {/* Mobile Navigation - Only show on mobile */}
                  <div className="md:hidden flex items-center justify-between">
                    <button onClick={() => setCardIdx(Math.max(0, idx - 1))} disabled={idx === 0} className={`p-2.5 rounded-lg transition-all ${idx === 0 ? 'opacity-20' : 'hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-90'}`}><ArrowLeft size={22} /></button>
                    <span className="text-sm font-bold opacity-60">{idx + 1} / {cart.length}</span>
                    <button onClick={() => setCardIdx(Math.min(cart.length - 1, idx + 1))} disabled={idx >= cart.length - 1} className={`p-2.5 rounded-lg transition-all ${idx >= cart.length - 1 ? 'opacity-20' : 'hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-90'}`}><ArrowRight size={22} /></button>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden">
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                      {/* Header */}
                      <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="font-bold text-sm truncate">{line.item.name}</div>
                          <div className="text-[10px] font-mono opacity-50">{line.item.sku}</div>
                        </div>
                        <StatusDot color={forceClose ? 'gray' : statusColor} />
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-3">
                        {linkedPoId && (
                          <div className="flex justify-between items-center"><span className={labelClass}>Bestellt</span><span className={valClass}>{c.bestellt}</span></div>
                        )}
                        {linkedPoId && c.bisHeute > 0 && (
                          <div className="flex justify-between items-center"><span className={labelClass}>Bis heute</span><span className="font-mono text-sm opacity-60">{c.bisHeute}</span></div>
                        )}
                        {/* PLUS/MINUS PICKER */}
                        <div className="flex justify-between items-center gap-3">
                          <span className={labelClass}>Heute geliefert</span>
                          <PlusMinusPicker value={line.qtyReceived} onChange={v => updateCartItem(idx, 'qtyReceived', v)} disabled={isAdminClose} isDark={isDark} />
                        </div>
                        {/* Beschädigt Stepper - Always visible */}
                        <div className="flex justify-between items-center gap-3">
                          <span className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${line.qtyDamaged > 0 ? 'text-red-500 font-bold' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}><AlertTriangle size={12}/> Beschädigt</span>
                          <PlusMinusPicker value={line.qtyDamaged} onChange={v => updateCartItem(idx, 'qtyDamaged', v)} max={line.qtyReceived} disabled={isAdminClose} isDark={isDark} />
                        </div>
                        {/* Falsch Stepper - Always visible */}
                        <div className="flex justify-between items-center gap-3">
                          <span className={`text-[10px] uppercase tracking-wider flex items-center gap-1 ${line.qtyWrong > 0 ? 'text-orange-500 font-bold' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}><XCircle size={12}/> Falsch geliefert</span>
                          <PlusMinusPicker value={line.qtyWrong} onChange={v => updateCartItem(idx, 'qtyWrong', v)} max={line.qtyReceived - line.qtyDamaged} disabled={isAdminClose} isDark={isDark} />
                        </div>
                        {/* Offen - Read-only */}
                        {linkedPoId && c.offen > 0 && (
                          <div className="flex justify-between items-center">
                            <span className={`${labelClass} text-amber-500 flex items-center gap-1`}><AlertTriangle size={12}/> Offen</span>
                            <span className="font-mono text-sm font-bold text-amber-500">{c.offen}</span>
                          </div>
                        )}
                        {/* Zu viel - Read-only */}
                        {linkedPoId && c.zuViel > 0 && (
                          <div className="flex justify-between items-center">
                            <span className={`${labelClass} text-orange-500 flex items-center gap-1`}><AlertTriangle size={12}/> Zu viel</span>
                            <span className="font-mono text-sm font-bold text-orange-500">+{c.zuViel}</span>
                          </div>
                        )}
                        {hasReturn && (
                          <div className="flex justify-between items-center">
                            <span className={`${labelClass} text-red-500`}>Zurückgesendet</span>
                            <span className="font-mono text-sm font-bold text-red-500">−{line.qtyRejected}</span>
                          </div>
                        )}
                        {hasReturn && (line.returnCarrier || line.returnTrackingId || line.rejectionNotes) && (
                          <div className={`text-[11px] pl-2 border-l-2 ${isDark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
                            Rücksendung: {line.returnCarrier || '—'} — Tracking: {line.returnTrackingId || '—'}{line.rejectionNotes ? ` — Grund: ${line.rejectionNotes}` : ''}
                          </div>
                        )}
                        
                        <div className={`flex justify-between items-center ${!linkedPoId || c.offen === 0 ? 'pt-2 border-t' : ''} ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                          <span className={labelClass}>Buchung</span>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border ${line.qtyAccepted > 0 ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : line.qtyAccepted < 0 ? (isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-200') : (isDark ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200')}`}>
                            {line.qtyAccepted > 0 ? <CheckCircle2 size={12}/> : line.qtyAccepted < 0 ? <LogOut size={12}/> : <Minus size={12}/>}
                            {line.qtyAccepted > 0 ? `+${line.qtyAccepted}` : line.qtyAccepted}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={`px-4 py-2.5 border-t flex items-center gap-2 ${isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-100 bg-slate-50/50'}`}>
                        {showReturnBtn && (
                          <button onClick={() => setReturnPopup({ idx, qty: c.zuViel || 1, reason: c.zuViel > 0 ? 'Überzahl' : '', carrier: '', tracking: '' })}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${isDark ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'}`}>
                            <RotateCcw size={12}/> Rücksendung
                          </button>
                        )}
                        {line.qtyDamaged === 0 && line.qtyWrong === 0 && !line.showIssuePanel && (
                          <button onClick={() => updateCartItem(idx, 'showIssuePanel', true)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto transition-all ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                            <AlertCircle size={12}/> Problem
                          </button>
                        )}
                        {(line.qtyDamaged > 0 || line.qtyWrong > 0 || line.showIssuePanel) && (
                          <button onClick={() => { updateCartItem(idx, 'qtyDamaged', 0); updateCartItem(idx, 'qtyWrong', 0); updateCartItem(idx, 'showIssuePanel', false); }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto transition-all ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                            <AlertCircle size={12}/> Zurücksetzen
                          </button>
                        )}
                      </div>

                      {/* Issue Notes — Visible when damage/wrong > 0 or issue panel open */}
                      {(line.qtyDamaged > 0 || line.qtyWrong > 0 || line.showIssuePanel) && (
                        <div className={`p-4 border-t animate-in slide-in-from-top-2 ${isDark ? 'bg-black/20 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <input value={line.rejectionNotes} onChange={e => updateCartItem(idx, 'rejectionNotes', e.target.value)} placeholder="Notiz..." className={inputClass} />
                        </div>
                      )}
                    </div>

                    {/* Dots Navigation */}
                    {cart.length > 1 && (
                      <div className="flex justify-center gap-1.5 pt-3">
                        {cart.map((l, i) => {
                          const sc = getAutoStatusIcon(l);
                          const dc = sc === 'green' ? 'bg-emerald-500' : sc === 'amber' ? 'bg-amber-500' : 'bg-orange-500';
                          return <button key={i} onClick={() => setCardIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? `${dc} scale-125` : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                    <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className={`text-xs uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                            <tr>
                              <th className="px-4 py-3 text-left font-bold">Artikel</th>
                              {linkedPoId && <th className="px-4 py-3 text-center font-bold">Bestellt</th>}
                              {linkedPoId && <th className="px-4 py-3 text-center font-bold">Bis heute</th>}
                              <th className="px-4 py-3 text-center font-bold">Geliefert</th>
                              <th className="px-4 py-3 text-center font-bold text-red-500">Beschädigt</th>
                              <th className="px-4 py-3 text-center font-bold text-orange-500">Falsch</th>
                              {linkedPoId && <th className="px-4 py-3 text-center font-bold">Offen</th>}
                              {linkedPoId && <th className="px-4 py-3 text-center font-bold">Zu viel</th>}
                              <th className="px-4 py-3 text-center font-bold">Buchung</th>
                              <th className="px-4 py-3 text-center font-bold">Status</th>
                              <th className="px-4 py-3 text-center font-bold">Aktionen</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-500/10">
                            {cart.map((cartLine, cartIdx) => {
                              const calc = getLineCalc(cartLine);
                              const color = getAutoStatusIcon(cartLine);
                              return (
                                <tr key={cartIdx} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                  <td className="px-4 py-3">
                                    <div className="font-bold text-sm">{cartLine.item.name}</div>
                                    <div className="text-[10px] font-mono opacity-50">{cartLine.item.sku}</div>
                                  </td>
                                  {linkedPoId && <td className="px-4 py-3 text-center font-mono text-sm">{calc.bestellt}</td>}
                                  {linkedPoId && <td className="px-4 py-3 text-center font-mono text-sm opacity-60">{calc.bisHeute}</td>}
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center">
                                      <PlusMinusPicker 
                                        value={cartLine.qtyReceived} 
                                        onChange={v => updateCartItem(cartIdx, 'qtyReceived', v)}
                                        disabled={isAdminClose}
                                        isDark={isDark}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center">
                                      <PlusMinusPicker 
                                        value={cartLine.qtyDamaged} 
                                        onChange={v => updateCartItem(cartIdx, 'qtyDamaged', v)}
                                        disabled={isAdminClose}
                                        isDark={isDark}
                                        max={cartLine.qtyReceived}
                                      />
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center">
                                      <PlusMinusPicker 
                                        value={cartLine.qtyWrong} 
                                        onChange={v => updateCartItem(cartIdx, 'qtyWrong', v)}
                                        disabled={isAdminClose}
                                        isDark={isDark}
                                        max={cartLine.qtyReceived - cartLine.qtyDamaged}
                                      />
                                    </div>
                                  </td>
                                  {linkedPoId && <td className="px-4 py-3 text-center">{calc.offen > 0 ? <span className="font-mono text-sm font-bold text-amber-500 flex items-center justify-center gap-1"><AlertTriangle size={12}/>{calc.offen}</span> : <span className="opacity-30 text-sm">—</span>}</td>}
                                  {linkedPoId && <td className="px-4 py-3 text-center"><span className={`font-mono text-sm font-bold ${calc.zuViel > 0 ? 'text-orange-500' : 'opacity-30'}`}>{calc.zuViel > 0 ? `+${calc.zuViel}` : '0'}</span></td>}
                                  
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg border ${cartLine.qtyAccepted > 0 ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : cartLine.qtyAccepted < 0 ? (isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-200') : (isDark ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200')}`}>
                                      {cartLine.qtyAccepted > 0 ? `+${cartLine.qtyAccepted}` : cartLine.qtyAccepted}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <StatusDot color={forceClose ? 'gray' : color} />
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-2">
                                      {/* Return Button - Shows for overdelivery, damage, or wrong */}
                                      {(calc.zuViel > 0 || cartLine.qtyDamaged > 0 || cartLine.qtyWrong > 0) && (
                                        <button 
                                          onClick={() => setReturnPopup({ idx: cartIdx, qty: cartLine.qtyDamaged + cartLine.qtyWrong || calc.zuViel || 1, reason: cartLine.qtyDamaged > 0 ? 'Beschädigt' : cartLine.qtyWrong > 0 ? 'Falsch geliefert' : 'Überzahl', carrier: '', tracking: '' })}
                                          className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${isDark ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'}`}
                                          title="Rücksendung erstellen"
                                        >
                                          <RotateCcw size={12}/> Rücksendung
                                        </button>
                                      )}
                                      
                                      {/* Problem Button - For notes */}
                                      <button 
                                        onClick={() => updateCartItem(cartIdx, 'showIssuePanel', !cartLine.showIssuePanel)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${cartLine.showIssuePanel ? (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700') : (isDark ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')}`}
                                        title={cartLine.showIssuePanel ? 'Problem-Panel schließen' : 'Problem melden'}
                                      >
                                        <AlertCircle size={12}/> {cartLine.showIssuePanel ? 'Schließen' : 'Problem'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* ISSUE PANELS - Desktop View (Shown Below Table When Active) */}
                      {cart.map((cartLine, cartIdx) => {
                        if (!cartLine.showIssuePanel) return null;
                        return (
                          <div key={`issue-${cartIdx}`} className={`border-t p-4 space-y-3 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-amber-50/50 border-amber-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm flex items-center gap-2">
                                <AlertCircle size={16} className="text-amber-500" />
                                Problem melden: {cartLine.item.name}
                              </div>
                              <button 
                                onClick={() => updateCartItem(cartIdx, 'showIssuePanel', false)}
                                className={`p-1 rounded hover:bg-slate-500/10 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold mb-1.5 text-red-500">Beschädigt</label>
                                <div className="text-sm font-mono font-bold text-red-500">{cartLine.qtyDamaged > 0 ? `${cartLine.qtyDamaged} Stk` : '—'}</div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold mb-1.5 text-orange-500">Falsch geliefert</label>
                                <div className="text-sm font-mono font-bold text-orange-500">{cartLine.qtyWrong > 0 ? `${cartLine.qtyWrong} Stk` : '—'}</div>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-bold mb-1.5">Notizen</label>
                              <textarea 
                                value={cartLine.rejectionNotes || ''}
                                onChange={e => updateCartItem(cartIdx, 'rejectionNotes', e.target.value)}
                                placeholder="Details zum Problem..."
                                rows={2}
                                className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {cart.length === 0 && (
              <div className={`p-12 text-center rounded-xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                <Package size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">Keine Positionen</p>
                <p className="text-sm">Wählen Sie eine Bestellung oder fügen Sie Artikel hinzu.</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-3">
              <div className={`inline-flex p-4 rounded-full ${globalStats.totalOffen > 0 ? 'bg-amber-100 text-amber-600' : globalStats.totalZuViel > 0 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {globalStats.totalOffen > 0 ? <AlertTriangle size={32}/> : globalStats.totalZuViel > 0 ? <Info size={32}/> : <CheckCircle2 size={32}/>}
              </div>
              <h3 className="text-2xl font-bold">Zusammenfassung</h3>
              <div className="text-lg">Status: <span className="font-bold">{headerData.status}</span></div>
            </div>

            <div className={`grid grid-cols-4 gap-2 p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-center"><div className="text-xl font-bold text-emerald-600">+{Math.max(0, globalStats.totalBuchung)}</div><div className="text-[9px] uppercase font-bold opacity-50">Zugang</div></div>
              <div className="text-center"><div className="text-xl font-bold text-red-500">{globalStats.totalZurueck > 0 ? `−${globalStats.totalZurueck}` : '0'}</div><div className="text-[9px] uppercase font-bold opacity-50">Zurück</div></div>
              <div className="text-center"><div className={`text-xl font-bold ${globalStats.totalOffen > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{globalStats.totalOffen}</div><div className="text-[9px] uppercase font-bold opacity-50">Offen</div></div>
              <div className="text-center"><div className={`text-xl font-bold ${globalStats.totalZuViel > 0 ? 'text-orange-500' : 'opacity-30'}`}>{globalStats.totalZuViel > 0 ? `+${globalStats.totalZuViel}` : '0'}</div><div className="text-[9px] uppercase font-bold opacity-50">Zu viel</div></div>
            </div>

            {cart.some(c => c.qtyRejected > 0) && (
              <div className={`p-4 rounded-xl text-sm ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                <strong>Hinweis:</strong> {cart.reduce((a,c) => a + c.qtyRejected, 0)} Artikel zurückgesendet. Ticket wird automatisch erstellt.
              </div>
            )}

            <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className={`px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>Positionen</div>
              <div className="divide-y divide-slate-500/10 max-h-[40vh] overflow-y-auto">
                {cart.map((line, i) => {
                  const lc = getLineCalc(line);
                  const sc = forceClose ? 'gray' : getAutoStatusIcon(line);
                  return (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <StatusDot color={sc} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{line.item.name}</div>
                        <div className="text-[10px] opacity-50 font-mono">{line.item.sku}</div>
                        {line.item.system && <div className="text-[10px] opacity-40 mt-0.5">System: {line.item.system}</div>}
                      </div>
                      <div className="text-right text-xs space-y-0.5 shrink-0">
                        {linkedPoId && <div className="opacity-50">Bestellt: {lc.bestellt}</div>}
                        <div className="font-bold">Heute: +{lc.heute}</div>
                        {lc.offen > 0 && <div className="text-amber-500 font-bold">Offen: {lc.offen}</div>}
                        {lc.zuViel > 0 && <div className="text-orange-500 font-bold">Zu viel: +{lc.zuViel}</div>}
                        {line.qtyRejected > 0 && <div className="text-red-500">Zurück: −{line.qtyRejected}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {(isPartialDelivery || isAdminClose) && (
              <div className={`p-4 rounded-xl border flex items-center gap-4 text-left cursor-pointer transition-colors ${forceClose ? (isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200') : (isDark ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300')}`} onClick={() => setForceClose(!forceClose)}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${forceClose ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-400'}`}>{forceClose && <Check size={14} strokeWidth={3} />}</div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${forceClose ? 'text-purple-600 dark:text-purple-400' : ''}`}>Manuell schließen (Restmenge stornieren)</div>
                  <div className="text-xs opacity-60">Setzt Status auf "Abgeschlossen", auch wenn Offen {'>'} 0.</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STICKY FOOTER - PINNED TO BOTTOM */}
      <div className={`sticky bottom-0 z-10 p-4 md:p-5 border-t flex justify-between shrink-0 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        {step > 1 ? <button onClick={() => { if (initialMode === 'return' && step === 3) { onClose(); } else { setStep(prev => (prev - 1) as any); } }} className="px-6 py-3 rounded-xl font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{initialMode === 'return' && step === 3 ? 'Schließen' : 'Zurück'}</button> : <div/>}
        {step < 3 ? (
          <button onClick={() => setStep(prev => (prev + 1) as any)} disabled={step === 1 ? !headerData.lieferscheinNr : cart.length === 0} className="px-8 py-3 bg-[#0077B5] text-white rounded-xl font-bold disabled:opacity-50">Weiter</button>
        ) : (
          <button onClick={() => { setSubmissionStatus('submitting'); setTimeout(() => setSubmissionStatus('success'), 800); }} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500">Buchen</button>
        )}
      </div>

      <POSelectionModal isOpen={showPoModal} onClose={() => setShowPoModal(false)} orders={purchaseOrders || MOCK_PURCHASE_ORDERS} receiptMasters={receiptMasters} onSelect={handleSelectPO} theme={theme} />
    </div>
  );
};