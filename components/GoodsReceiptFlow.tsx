import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Search, Plus, Calendar, Truck, Package, 
  Hash, Info, CheckCircle2, AlertCircle, ChevronDown, Check,
  ArrowRight, ArrowLeft, Trash2, MapPin, FileText, Building2,
  AlertTriangle, Loader2, Home, ClipboardList, Ban, LogOut, 
  PlusCircle, Clock, Box, ChevronUp, Briefcase, Minus, XCircle,
  ShieldBan, Layers, RotateCcw, BarChart3
} from 'lucide-react';
import { StockItem, Theme, ReceiptHeader, PurchaseOrder, ReceiptMaster, Ticket } from '../types';
import { MOCK_PURCHASE_ORDERS } from '../data';
import { TicketConfig } from './SettingsPage';

const LAGERORT_OPTIONS: string[] = [
  "Akku Service","Brandt, Service, B DI 446E","Dallmann, Service","EKZFK","GERAS","HaB","HAB",
  "HaB Altbestand Kunde","HLU","HTW","KEH","Kitas","Koplin, Service, B DI 243","KWF",
  "Lavrenz, Service","LHW","MPC","Pfefferwerk/WAB","RAS_Zubeh\u00f6r","RBB","RBB_SSP",
  "St\u00f6whaas,Service","Tau13","Trittel, Service","ukb","UKB Lager","UKB Service","Wartungsklebchen"
];

interface CartItem {
    item: StockItem;
    qtyReceived: number;
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

// --- QUANTITY STEPPER (Deutsche Post style: red – | number box | red +) ---
const QtyStepper = ({ value, onChange, min = 0, max = 999, disabled = false, isDark = false }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; disabled?: boolean; isDark?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inc = () => { if (!disabled && value < max) onChange(value + 1); };
  const dec = () => { if (!disabled && value > min) onChange(value - 1); };
  return (
    <div className={`inline-flex items-center select-none ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <button onClick={dec} className="w-12 h-12 flex items-center justify-center rounded-l-xl bg-red-600 hover:bg-red-500 active:bg-red-700 active:scale-95 transition-all text-white font-bold text-2xl shrink-0" aria-label="Weniger"><Minus size={22} strokeWidth={3}/></button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={e => { const v = parseInt(e.target.value) || 0; onChange(Math.max(min, Math.min(max, v))); }}
        onFocus={e => e.target.select()}
        className={`w-14 h-12 text-center text-xl font-bold font-mono border-y-2 outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
      />
      <button onClick={inc} className="w-12 h-12 flex items-center justify-center rounded-r-xl bg-red-600 hover:bg-red-500 active:bg-red-700 active:scale-95 transition-all text-white font-bold text-2xl shrink-0" aria-label="Mehr"><Plus size={22} strokeWidth={3}/></button>
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
  initialMode?: 'standard' | 'return';
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
  const [returnPopup, setReturnPopup] = useState<ReturnPopupData | null>(null);
  const [cardIdx, setCardIdx] = useState(0);

  // --- LIVE MATH ---
  const getLineCalc = (line: CartItem) => {
    const bestellt = line.orderedQty || 0;
    const bisHeute = line.previouslyReceived || 0;
    const heute = line.qtyReceived;
    const zurueck = line.qtyRejected;
    const geliefertGesamt = bisHeute + heute;
    const zuViel = Math.max(0, geliefertGesamt - zurueck - bestellt);
    const offen = Math.max(0, bestellt - (geliefertGesamt - zurueck));
    return { bestellt, bisHeute, heute, zurueck, geliefertGesamt, zuViel, offen };
  };

  const getAutoStatusIcon = (line: CartItem) => {
    const { offen, zuViel } = getLineCalc(line);
    if (zuViel > 0) return 'orange';
    if (offen > 0) return 'amber';
    return 'green';
  };

  const globalStats = useMemo(() => {
    let totalOffen = 0, totalZuViel = 0, totalZurueck = 0, totalBuchung = 0;
    cart.forEach(c => {
      const calc = getLineCalc(c);
      totalOffen += calc.offen;
      totalZuViel += calc.zuViel;
      totalZurueck += c.qtyRejected;
      totalBuchung += c.qtyAccepted;
    });
    return { totalOffen, totalZuViel, totalZurueck, totalBuchung };
  }, [cart]);

  const isPartialDelivery = useMemo(() => {
    if (!linkedPoId) return false;
    return cart.some(c => getLineCalc(c).offen > 0);
  }, [cart, linkedPoId]);

  const calculateReceiptStatus = (currentCart: CartItem[], poId: string | null) => {
    const allRejected = currentCart.length > 0 && currentCart.every(c => c.qtyRejected === c.qtyReceived && c.qtyReceived > 0);
    if (allRejected) return 'Abgelehnt';
    const hasDamage = currentCart.some(c => c.rejectionReason === 'Damaged' && c.qtyRejected > 0);
    const hasWrong = currentCart.some(c => c.rejectionReason === 'Wrong' && c.qtyRejected > 0);
    if (hasDamage && hasWrong) return 'Schaden + Falsch';
    if (hasDamage) return 'Schaden';
    if (hasWrong) return 'Falsch geliefert';
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
        if (anyOver) return '\u00dcbermenge';
        if (anyUnder || currentCart.some(c => c.qtyRejected > 0)) return 'Teillieferung';
        return 'Gebucht';
      }
    }
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
      item, qtyReceived: 1, qtyRejected: 0, qtyAccepted: 1,
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
      if (field === 'qtyReceived' || field === 'qtyRejected') u.qtyAccepted = u.qtyReceived - u.qtyRejected;
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
      return { item, qtyReceived: qty, qtyRejected: 0, qtyAccepted: qty, rejectionReason: '' as const, rejectionNotes: '', returnCarrier: '', returnTrackingId: '', orderedQty: poItem.quantityExpected, previouslyReceived: hist, location: headerData.warehouseLocation, issueNotes: '', showIssuePanel: false, isManualAddition: false };
    }));
  };

  useEffect(() => {
    if (initialPoId && purchaseOrders && !linkedPoId) {
      const po = purchaseOrders.find(p => p.id === initialPoId);
      if (po) {
        handleSelectPO(po);
        if (initialMode === 'return') {
          const d = new Date().toLocaleDateString('de-DE', {day:'2-digit',month:'2-digit',year:'numeric'}).replace(/\./g, '');
          let loc = headerData.warehouseLocation || 'Wareneingang';
          const fi = existingItems.find(i => i.sku === po.items[0]?.sku);
          if (fi?.warehouseLocation) loc = fi.warehouseLocation;
          setHeaderData(prev => ({ ...prev, lieferscheinNr: `R\u00dcK-${d}`, warehouseLocation: loc, status: 'R\u00fccklieferung' }));
          setStep(2);
        } else { setStep(1); }
      }
    }
  }, [initialPoId, purchaseOrders, initialMode]);

  const handleAdminCloseToggle = (checked: boolean) => {
    setIsAdminClose(checked);
    if (checked) {
      setHeaderData(prev => ({ ...prev, lieferscheinNr: `ABSCHLUSS-${new Date().toISOString().split('T')[0]}`, lieferant: linkedPoId ? (purchaseOrders?.find(p => p.id === linkedPoId)?.supplier || prev.lieferant) : prev.lieferant }));
      setCart(prev => prev.map(c => ({ ...c, qtyReceived: 0, qtyAccepted: 0, qtyRejected: 0 })));
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
    // Auto-case: create ticket for return
    if (ticketConfig.autoCase) {
      const line = cart[idx];
      const poRef = linkedPoId || headerData.lieferscheinNr || '–';
      onAddTicket({
        id: crypto.randomUUID(),
        receiptId: headerData.bestellNr || `pending-${Date.now()}`,
        subject: `R\u00fccksendung \u2013 ${line.item.name} (${poRef})`,
        status: 'Open',
        priority: 'High',
        messages: [{
          id: crypto.randomUUID(), author: 'System', type: 'system', timestamp: Date.now(),
          text: `Automatische R\u00fccksendung:\n\u2022 Artikel: ${line.item.name} (${line.item.sku})\n\u2022 Menge: ${qty} St\u00fcck\n\u2022 Grund: ${reason || '\u2013'}\n\u2022 Versand: ${carrier || '\u2013'}\n\u2022 Tracking: ${tracking || '\u2013'}\n\u2022 Bestellung: ${poRef}`
        }]
      });
    }
    setReturnPopup(null);
  };

  // Auto-case helper: called when issue panel reason changes to Damaged/Wrong
  const handleIssueCaseAuto = (idx: number, reason: string) => {
    const line = cart[idx];
    if (!ticketConfig.autoCase || !line || !reason || reason === 'Overdelivery' || reason === 'Other') return;
    const typeLabel = reason === 'Damaged' ? 'Schaden' : 'Falsch geliefert';
    const poRef = linkedPoId || headerData.lieferscheinNr || '\u2013';
    onAddTicket({
      id: crypto.randomUUID(),
      receiptId: headerData.bestellNr || `pending-${Date.now()}`,
      subject: `${typeLabel} \u2013 ${line.item.name} (${poRef})`,
      status: 'Open',
      priority: 'High',
      messages: [{
        id: crypto.randomUUID(), author: 'System', type: 'system', timestamp: Date.now(),
        text: `Automatisch erkannt:\n\u2022 Typ: ${typeLabel}\n\u2022 Artikel: ${line.item.name} (${line.item.sku})\n\u2022 Abgelehnt: ${line.qtyRejected} St\u00fcck\n\u2022 Bestellung: ${poRef}`
      }]
    });
  };

  const handleFinalize = () => {
    const batchId = `b-${Date.now()}`;
    const issues: string[] = [];
    const types = new Set<string>();
    if (initialMode !== 'return') {
      cart.forEach(c => {
        const lbl = `${c.item.name} (${c.item.sku})`;
        if (c.qtyRejected > 0) {
          const r = c.rejectionReason === 'Damaged' ? 'Besch\u00e4digt' : c.rejectionReason === 'Wrong' ? 'Falsch' : c.rejectionReason === 'Overdelivery' ? '\u00dcbermenge' : 'Sonstiges';
          issues.push(`${lbl}: ${c.qtyRejected}x Abgelehnt (${r}) - ${c.rejectionNotes}`);
          if (c.rejectionReason === 'Damaged') types.add('Besch\u00e4digung');
          if (c.rejectionReason === 'Wrong') types.add('Falschlieferung');
          if (c.rejectionReason === 'Overdelivery') types.add('\u00dcberlieferung');
          if (c.rejectionReason === 'Other') types.add('Abweichung');
        }
        if (ticketConfig.extra && c.orderedQty !== undefined && c.qtyAccepted > 0) {
          const tot = (c.previouslyReceived || 0) + c.qtyAccepted;
          if (tot > c.orderedQty) { issues.push(`[\u00dcbermenge] ${lbl}: ${tot - c.orderedQty} St\u00fcck zu viel`); types.add('\u00dcberlieferung'); }
        }
      });
      if (issues.length > 0) {
        onAddTicket({ id: crypto.randomUUID(), receiptId: batchId, subject: `Reklamation: ${Array.from(types).join(', ')}`, status: 'Open', priority: 'High',
          messages: [{ id: crypto.randomUUID(), author: 'System', text: `Automatisch erstellter Fall:\n\n${issues.join('\n')}`, timestamp: Date.now(), type: 'system' }]
        });
      }
    }
    const clean = cart.map(c => ({ ...c, qty: c.qtyAccepted, isDamaged: c.rejectionReason === 'Damaged' && c.qtyRejected > 0, issueNotes: c.rejectionNotes || c.issueNotes }));
    if (onLogStock) clean.forEach(c => { if (c.qty !== 0) onLogStock(c.item.sku, c.item.name, c.qty > 0 ? 'add' : 'remove', Math.abs(c.qty), `Wareneingang ${headerData.lieferscheinNr}`, 'po-normal'); });
    const created = cart.filter(c => c.qtyAccepted > 0).map(c => c.item).filter(i => !existingItems.find(e => e.id === i.id));
    onSuccess({ ...headerData, batchId, status: finalResultStatus }, clean, created, forceClose);
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

      {/* SUCCESS OVERLAY */}
      {submissionStatus === 'success' && createPortal(
        <div className="fixed inset-0 z-[100000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <CheckCircle2 size={48} className="text-emerald-500 mb-6" />
            <h2 className="text-2xl font-bold mb-2 dark:text-white text-slate-900">Gespeichert</h2>
            <p className="text-slate-500 mb-8">Der Wareneingang wurde erfolgreich verbucht.</p>
            <button onClick={handleFinalize} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">OK</button>
          </div>
        </div>, document.body
      )}

      {/* RETURN POPUP */}
      {returnPopup && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReturnPopup(null)} />
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <h3 className="text-lg font-bold flex items-center gap-2"><RotateCcw size={20} className="text-orange-500" /> R{'\u00fc'}cksendung</h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Menge zur{'\u00fc'}cksenden</label>
                <input type="number" min="1" value={returnPopup.qty} onChange={e => setReturnPopup({...returnPopup, qty: parseInt(e.target.value) || 1})} className={`${inputClass} text-center font-bold text-lg text-orange-600`} />
              </div>
              <div>
                <label className={labelClass}>Grund</label>
                <input value={returnPopup.reason} onChange={e => setReturnPopup({...returnPopup, reason: e.target.value})} placeholder={`z.B. \u00dcberzahl, Besch\u00e4digt...`} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Versandart</label>
                <input value={returnPopup.carrier} onChange={e => setReturnPopup({...returnPopup, carrier: e.target.value})} placeholder="DHL, UPS, Spedition..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tracking</label>
                <input value={returnPopup.tracking} onChange={e => setReturnPopup({...returnPopup, tracking: e.target.value})} placeholder="1Z999AA10123456789" className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setReturnPopup(null)} className="flex-1 py-3 rounded-xl font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Abbrechen</button>
              <button onClick={handleReturnSubmit} disabled={returnPopup.qty < 1} className="flex-1 py-3 rounded-xl font-bold bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50">R{'\u00fc'}cksendung buchen</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* HEADER */}
      <div className={`p-4 md:p-5 border-b flex justify-between items-center shrink-0 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-4 md:gap-6">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
            {initialMode === 'return' ? <LogOut className="text-orange-600"/> : <Package className="text-[#0077B5]" />}
            <span className="hidden sm:inline">{initialMode === 'return' ? 'Warenr\u00fccksendung' : 'Wareneingang'}</span>
          </h2>
          <div className="flex items-center gap-1 md:gap-2 ml-2">
            {[{n:1,l:'Lieferschein'},{n:2,l:'Pr\u00fcfung'},{n:3,l:'Abschluss'}].map(({n,l},i) => (
              <React.Fragment key={n}>
                {i > 0 && <div className={`w-4 md:w-8 h-0.5 ${step >= n ? 'bg-[#0077B5]' : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`} />}
                <div className={`flex items-center gap-1 md:gap-2 ${step >= n ? 'text-[#0077B5]' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${step >= n ? 'bg-[#0077B5] text-white border-[#0077B5]' : 'bg-transparent border-slate-300'}`}>{n}</div>
                  <span className="hidden md:inline text-sm font-bold">{l}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 relative">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-5">
            <h3 className="text-lg font-bold">Schritt 1: Lieferschein</h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0077B5] uppercase">Bestellung (Optional)</label>
              <button onClick={() => setShowPoModal(true)} className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                {linkedPoId ? <span className="font-mono font-bold">{linkedPoId}</span> : <span className="opacity-50">Aus Liste w{'\u00e4'}hlen...</span>}
                <ClipboardList size={20} className="text-[#0077B5]" />
              </button>
              <div className={`mt-3 flex items-center gap-3 p-3 rounded-xl border transition-all ${isAdminClose ? (isDark ? 'bg-purple-900/20 border-purple-500/50' : 'bg-purple-50 border-purple-200') : (isDark ? 'border-slate-800' : 'border-slate-200')} ${!linkedPoId ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-400 bg-transparent transition-all checked:border-purple-600 checked:bg-purple-600" checked={isAdminClose} onChange={e => handleAdminCloseToggle(e.target.checked)} disabled={!linkedPoId} id="adminCloseCheck" />
                  <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <label htmlFor="adminCloseCheck" className="cursor-pointer flex-1">
                  <div className={`text-sm font-bold flex items-center gap-2 ${isAdminClose ? 'text-purple-600 dark:text-purple-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}><ShieldBan size={16} /> Keine Lieferung (Nur Abschluss)</div>
                  <div className="text-xs opacity-60">Null-Beleg, Bestellung schlie{'\u00df'}en.</div>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium opacity-70">Lieferschein Nr. *</label>
              <input value={headerData.lieferscheinNr} onChange={e => setHeaderData({...headerData, lieferscheinNr: e.target.value})} className={`${inputClass} ${isAdminClose ? 'opacity-70 cursor-not-allowed' : ''}`} placeholder="LS-..." disabled={isAdminClose} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium opacity-70">Lieferant *</label>
              <input value={headerData.lieferant} onChange={e => setHeaderData({...headerData, lieferant: e.target.value})} className={inputClass} disabled={!!linkedPoId} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium opacity-70">Lagerort (Global) *</label>
              <input value={headerData.warehouseLocation} onChange={e => { setHeaderData({...headerData, warehouseLocation: e.target.value}); setCart(p => p.map(i => ({...i, location: e.target.value}))); }} className={`${inputClass} ${initialMode === 'return' ? 'opacity-70 cursor-not-allowed' : ''}`} placeholder="z.B. Wareneingang" disabled={initialMode === 'return'} />
            </div>
          </div>
        )}

        {/* STEP 2: CAROUSEL */}
        {step === 2 && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex justify-between items-end">
              <h3 className="text-lg font-bold">Positionen & Pr{'\u00fc'}fung</h3>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input ref={searchInputRef} value={searchTerm} onChange={e => { setSearchTerm(e.target.value); if(e.target.value) { const r = searchInputRef.current?.getBoundingClientRect(); if(r) setSearchDropdownCoords({top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width}); setShowSearchDropdown(true); } else setShowSearchDropdown(false); }} className={`${inputClass} pl-8 w-48`} placeholder="Artikel..." />
                </div>
                {showSearchDropdown && createPortal(
                  <div style={{ position: 'absolute', top: searchDropdownCoords.top + 4, left: searchDropdownCoords.left, width: searchDropdownCoords.width, zIndex: 9999 }} className={`max-h-60 overflow-y-auto rounded-xl border shadow-xl ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    {existingItems.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.sku.includes(searchTerm)).map(item => (
                      <button key={item.id} onClick={() => addToCart(item)} className="w-full text-left p-3 border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <div className="font-bold">{item.name}</div><div className="text-xs opacity-50">{item.sku}</div>
                      </button>
                    ))}
                  </div>, document.body
                )}
              </div>
            </div>

            {cart.length > 0 && (() => {
              const idx = Math.min(cardIdx, cart.length - 1);
              const line = cart[idx];
              if (!line) return null;
              const c = getLineCalc(line);
              const statusColor = getAutoStatusIcon(line);
              const hasReturn = line.qtyRejected > 0;
              const showReturnBtn = c.zuViel > 0 || (line.rejectionReason === 'Damaged' && line.qtyReceived > 0);

              return (
                <div className="space-y-3">
                  {/* Nav */}
                  <div className="flex items-center justify-between">
                    <button onClick={() => setCardIdx(Math.max(0, idx - 1))} disabled={idx === 0} className={`p-2.5 rounded-lg transition-all ${idx === 0 ? 'opacity-20' : 'hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-90'}`}><ArrowLeft size={22} /></button>
                    <span className="text-sm font-bold opacity-60">{idx + 1} / {cart.length}</span>
                    <button onClick={() => setCardIdx(Math.min(cart.length - 1, idx + 1))} disabled={idx >= cart.length - 1} className={`p-2.5 rounded-lg transition-all ${idx >= cart.length - 1 ? 'opacity-20' : 'hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-90'}`}><ArrowRight size={22} /></button>
                  </div>

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
                      {/* QUANTITY STEPPER – / number / + */}
                      <div className="flex justify-between items-center gap-3">
                        <span className={labelClass}>Heute geliefert</span>
                        <QtyStepper value={line.qtyReceived} onChange={v => updateCartItem(idx, 'qtyReceived', v)} disabled={isAdminClose} isDark={isDark} />
                      </div>
                      {linkedPoId && c.zuViel > 0 && (
                        <div className="flex justify-between items-center">
                          <span className={`${labelClass} text-orange-500 flex items-center gap-1`}><AlertTriangle size={12}/> Zu viel</span>
                          <span className="font-mono text-sm font-bold text-orange-500">+{c.zuViel}</span>
                        </div>
                      )}
                      {hasReturn && (
                        <div className="flex justify-between items-center">
                          <span className={`${labelClass} text-red-500`}>Zur{'\u00fc'}ckgesendet</span>
                          <span className="font-mono text-sm font-bold text-red-500">{'\u2013'}{line.qtyRejected}</span>
                        </div>
                      )}
                      {hasReturn && (line.returnCarrier || line.returnTrackingId || line.rejectionNotes) && (
                        <div className={`text-[11px] pl-2 border-l-2 ${isDark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
                          R{'\u00fc'}cksendung: {line.returnCarrier || '\u2013'} {'\u2013'} Tracking: {line.returnTrackingId || '\u2013'}{line.rejectionNotes ? ` \u2013 Grund: ${line.rejectionNotes}` : ''}
                        </div>
                      )}
                      {linkedPoId && c.offen > 0 && (
                        <div className={`flex justify-between items-center pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                          <span className={`${labelClass} text-amber-500 flex items-center gap-1`}><AlertTriangle size={12}/> Offen</span>
                          <span className="font-mono text-sm font-bold text-amber-500">{c.offen}</span>
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
                        <button onClick={() => setReturnPopup({ idx, qty: c.zuViel || 1, reason: c.zuViel > 0 ? '\u00dcberzahl' : '', carrier: '', tracking: '' })}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${isDark ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'}`}>
                          <RotateCcw size={12}/> R{'\u00fc'}cksendung
                        </button>
                      )}
                      <button onClick={() => updateCartItem(idx, 'showIssuePanel', !line.showIssuePanel)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto transition-all ${line.showIssuePanel ? (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700') : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}>
                        <AlertCircle size={12}/> {line.showIssuePanel ? 'Schlie\u00dfen' : 'Problem'}
                      </button>
                    </div>

                    {line.showIssuePanel && (
                      <div className={`p-4 space-y-3 border-t animate-in slide-in-from-top-2 ${isDark ? 'bg-black/20 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-red-500 uppercase mb-1 block">Ablehnen (Stk)</label>
                            <input type="number" min="0" value={line.qtyRejected} onChange={e => updateCartItem(idx, 'qtyRejected', parseInt(e.target.value) || 0)} className={`w-full p-2 text-center font-bold text-red-500 border-2 rounded-lg ${isDark ? 'bg-slate-900 border-red-500/30' : 'bg-white border-red-200'}`} />
                          </div>
                          <div>
                            <label className={`${labelClass} mb-1 block`}>Grund</label>
                            <select value={line.rejectionReason} onChange={e => { updateCartItem(idx, 'rejectionReason', e.target.value); handleIssueCaseAuto(idx, e.target.value); }} className={inputClass}>
                              <option value="">W{'\u00e4'}hlen...</option>
                              <option value="Damaged">Besch{'\u00e4'}digt</option>
                              <option value="Wrong">Falsch</option>
                              <option value="Overdelivery">{'\u00dc'}berlieferung</option>
                              <option value="Other">Sonstiges</option>
                            </select>
                          </div>
                        </div>
                        <input value={line.rejectionNotes} onChange={e => updateCartItem(idx, 'rejectionNotes', e.target.value)} placeholder="Notiz..." className={inputClass} />
                        {line.qtyRejected > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            <input value={line.returnCarrier} onChange={e => updateCartItem(idx, 'returnCarrier', e.target.value)} placeholder="Versandart (DHL...)" className={inputClass} />
                            <input value={line.returnTrackingId} onChange={e => updateCartItem(idx, 'returnTrackingId', e.target.value)} placeholder="Tracking" className={inputClass} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dots */}
                  {cart.length > 1 && (
                    <div className="flex justify-center gap-1.5 pt-1">
                      {cart.map((l, i) => {
                        const sc = getAutoStatusIcon(l);
                        const dc = sc === 'green' ? 'bg-emerald-500' : sc === 'amber' ? 'bg-amber-500' : 'bg-orange-500';
                        return <button key={i} onClick={() => setCardIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? `${dc} scale-125` : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />;
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {cart.length === 0 && (
              <div className={`p-12 text-center rounded-xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                <Package size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold">Keine Positionen</p>
                <p className="text-sm">W{'\u00e4'}hlen Sie eine Bestellung oder f{'\u00fc'}gen Sie Artikel hinzu.</p>
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
              <div className="text-center"><div className="text-xl font-bold text-red-500">{globalStats.totalZurueck > 0 ? `\u2013${globalStats.totalZurueck}` : '0'}</div><div className="text-[9px] uppercase font-bold opacity-50">Zur{'\u00fc'}ck</div></div>
              <div className="text-center"><div className={`text-xl font-bold ${globalStats.totalOffen > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{globalStats.totalOffen}</div><div className="text-[9px] uppercase font-bold opacity-50">Offen</div></div>
              <div className="text-center"><div className={`text-xl font-bold ${globalStats.totalZuViel > 0 ? 'text-orange-500' : 'opacity-30'}`}>{globalStats.totalZuViel > 0 ? `+${globalStats.totalZuViel}` : '0'}</div><div className="text-[9px] uppercase font-bold opacity-50">Zu viel</div></div>
            </div>

            {cart.some(c => c.qtyRejected > 0) && (
              <div className={`p-4 rounded-xl text-sm ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                <strong>Hinweis:</strong> {cart.reduce((a,c) => a + c.qtyRejected, 0)} Artikel zur{'\u00fc'}ckgesendet. Ticket wird automatisch erstellt.
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
                      <div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{line.item.name}</div><div className="text-[10px] opacity-50 font-mono">{line.item.sku}</div></div>
                      <div className="text-right text-xs space-y-0.5 shrink-0">
                        {linkedPoId && <div className="opacity-50">Bestellt: {lc.bestellt}</div>}
                        <div className="font-bold">Heute: +{lc.heute}</div>
                        {lc.offen > 0 && <div className="text-amber-500 font-bold">Offen: {lc.offen}</div>}
                        {lc.zuViel > 0 && <div className="text-orange-500 font-bold">Zu viel: +{lc.zuViel}</div>}
                        {line.qtyRejected > 0 && <div className="text-red-500">Zur{'\u00fc'}ck: {'\u2013'}{line.qtyRejected}</div>}
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
                  <div className={`font-bold text-sm ${forceClose ? 'text-purple-600 dark:text-purple-400' : ''}`}>Manuell schlie{'\u00df'}en (Restmenge stornieren)</div>
                  <div className="text-xs opacity-60">Setzt Status auf {'\u201e'}Abgeschlossen{'\u201c'}, auch wenn Offen {'>'} 0.</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STICKY FOOTER */}
      <div className={`sticky bottom-0 z-10 p-4 md:p-5 border-t flex justify-between shrink-0 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        {step > 1 ? <button onClick={() => setStep(prev => (prev - 1) as any)} className="px-6 py-3 rounded-xl font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Zur{'\u00fc'}ck</button> : <div/>}
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