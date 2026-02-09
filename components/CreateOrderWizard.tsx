
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Search, Plus, Calendar, Truck, 
  Hash, Info, CheckCircle2, ChevronDown, 
  ArrowRight, ArrowLeft, Trash2, Loader2, AlertTriangle, FileText,
  Briefcase, Box, Download, Clock, Undo2, Sparkles, Import
} from 'lucide-react';
import { StockItem, Theme, PurchaseOrder, ActiveModule } from '../types';

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
    // Smart Edit Fields
    isAddedLater?: boolean;
    isDeleted?: boolean;
    isPersisted?: boolean; // Internal flag to track if item existed before this session
}

interface OrderFormData {
  orderId: string;
  supplier: string;
  orderDate: string;
  expectedDeliveryDate: string;
  poType: 'normal' | 'project' | null;
}

// --- UTILS: SMART PARSER ---
const cleanSku = (sku: string) => sku.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const parsePOText = (text: string, inventory: StockItem[]) => {
  const lines = text.split('\n');
  let orderId = '';
  let orderDate = '';
  let supplier = '';
  const parsedItems: any[] = [];

  // Build Lookup Map (Clean SKU -> Item)
  const skuMap = new Map<string, StockItem>();
  // Also map Manufacturer -> First Item (to guess supplier)
  const supplierHintMap = new Map<string, string>(); 

  inventory.forEach(i => {
    if (i.sku) skuMap.set(cleanSku(i.sku), i);
    if (i.manufacturer) supplierHintMap.set(i.manufacturer.toLowerCase(), i.manufacturer);
  });

  // Regex Patterns
  // Date: Matches DD.MM.YYYY
  const dateRegex = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/;
  
  // Order ID: Matches "Nr. 123" or "Bestellung 456" or "PO# 789"
  // Captures alphanumeric sequence of at least 3 chars
  const idRegex = /(?:Nr\.?|#|Bestellung|Order|Auftrag)\s*[:.]?\s*([A-Za-z0-9\-\/]{3,})/i;
  
  // Quantity: Matches "10x", "10 Stk", "10 pcs"
  const qtyRegex = /(\d+)\s*(?:x|stk|st|pcs|Pack)/i;

  lines.forEach(line => {
    // 1. Header Extraction
    if (!orderDate) {
      const d = line.match(dateRegex);
      if (d) {
         let year = d[3];
         if (year.length === 2) year = '20' + year;
         orderDate = `${year}-${d[2].padStart(2,'0')}-${d[1].padStart(2,'0')}`;
      }
    }
    if (!orderId) {
      const id = line.match(idRegex);
      if (id) orderId = id[1];
    }
    
    // Supplier Guessing (Naive: Check if known supplier name exists in line)
    if (!supplier) {
        for (const [key, val] of supplierHintMap.entries()) {
            if (line.toLowerCase().includes(key)) {
                supplier = val;
                break;
            }
        }
    }
    
    // 2. Item Extraction
    // Heuristic: Check if any word in the line matches a clean SKU
    // Tokenize by space and common delimiters
    const words = line.replace(/[^a-zA-Z0-9]/g, ' ').split(/\s+/);
    let foundItem: StockItem | undefined;
    
    for(const w of words) {
        if (w.length < 3) continue; // Skip short noise
        const clean = cleanSku(w);
        if (skuMap.has(clean)) {
            foundItem = skuMap.get(clean);
            break; // Found an item in this line
        }
    }

    if (foundItem) {
        // Try to find quantity in the SAME line
        let qty = 1;
        const q = line.match(qtyRegex);
        if (q) {
            qty = parseInt(q[1]);
        } else {
            // Fallback: Check if line starts with a number (e.g. "10   4000123   Item")
            const startNum = line.match(/^\s*(\d+)\s+/);
            if (startNum) qty = parseInt(startNum[1]);
        }
        
        parsedItems.push({
            sku: foundItem.sku,
            name: foundItem.name,
            quantity: qty,
            system: foundItem.system || 'Sonstiges',
            isAddedLater: false,
            isPersisted: true
        });
        
        // Secondary Supplier Guess: If we found an item, use its manufacturer if we still don't have a supplier
        if (!supplier && foundItem.manufacturer) {
            supplier = foundItem.manufacturer;
        }
    }
  });

  return {
      orderId: orderId,
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      supplier: supplier || '',
      items: parsedItems
  };
};

export const CreateOrderWizard: React.FC<CreateOrderWizardProps> = ({ 
  theme, 
  items, 
  onNavigate, 
  onCreateOrder,
  initialOrder,
  requireDeliveryDate,
  enableSmartImport = false
}) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // -- Data State --
  const [formData, setFormData] = useState<OrderFormData>({
    orderId: '',
    supplier: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    poType: null
  });

  const [cart, setCart] = useState<CartItem[]>([]);

  // -- Initialize from Prop (Edit Mode) --
  useEffect(() => {
    if (initialOrder) {
        setFormData({
            orderId: initialOrder.id,
            supplier: initialOrder.supplier,
            orderDate: initialOrder.dateCreated,
            expectedDeliveryDate: initialOrder.expectedDeliveryDate || '',
            poType: initialOrder.status === 'Projekt' ? 'project' : 'normal'
        });
        setCart(initialOrder.items.map(i => {
            // Try to find original item to get System info, else fallback
            const original = items.find(x => x.sku === i.sku);
            return {
                sku: i.sku,
                name: i.name,
                quantity: i.quantityExpected,
                system: original ? original.system : 'Bestand',
                isDeleted: i.isDeleted,
                isAddedLater: i.isAddedLater,
                isPersisted: true // Mark as existing in DB
            };
        }));
    }
  }, [initialOrder, items]);

  // -- UI State: Dropdowns & Portals --
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // -- Smart Import State --
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  
  const [newItemData, setNewItemData] = useState({
    name: '',
    sku: '',
    system: ''
  });

  // Supplier Dropdown
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierInputRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [supplierDropdownCoords, setSupplierDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

  // Search Dropdown
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [searchDropdownCoords, setSearchDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

  // System Dropdown
  const [showSystemDropdown, setShowSystemDropdown] = useState(false);
  const systemInputRef = useRef<HTMLDivElement>(null);
  const systemDropdownRef = useRef<HTMLDivElement>(null);
  const [systemDropdownCoords, setSystemDropdownCoords] = useState({ top: 0, left: 0, width: 0 });

  // -- Event Listeners for Portals --
  useEffect(() => {
    if (!showSystemDropdown && !showSearchDropdown && !showSupplierDropdown) return;
    
    const handleScroll = (e: Event) => {
        if (showSystemDropdown && systemDropdownRef.current && !systemDropdownRef.current.contains(e.target as Node)) setShowSystemDropdown(false);
        if (showSearchDropdown && searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) setShowSearchDropdown(false);
        if (showSupplierDropdown && supplierDropdownRef.current && !supplierDropdownRef.current.contains(e.target as Node)) setShowSupplierDropdown(false);
    };

    const handleResize = () => {
        setShowSystemDropdown(false); 
        setShowSupplierDropdown(false);
        if (showSearchDropdown && searchInputRef.current) {
             const rect = searchInputRef.current.getBoundingClientRect();
             setSearchDropdownCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
             });
        }
    };
    
    window.addEventListener('scroll', handleScroll, true); 
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [showSystemDropdown, showSearchDropdown, showSupplierDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (showSystemDropdown && !systemInputRef.current?.contains(target) && !systemDropdownRef.current?.contains(target)) setShowSystemDropdown(false);
      if (showSearchDropdown && !searchInputRef.current?.contains(target) && !searchDropdownRef.current?.contains(target)) setShowSearchDropdown(false);
      if (showSupplierDropdown && !supplierInputRef.current?.contains(target) && !supplierDropdownRef.current?.contains(target)) setShowSupplierDropdown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSystemDropdown, showSearchDropdown, showSupplierDropdown]);

  // -- Computed Helpers --
  const suppliers = useMemo(() => {
    const unique = new Set<string>();
    items.forEach(item => { if (item.manufacturer) unique.add(item.manufacturer); });
    return Array.from(unique).sort();
  }, [items]);

  const filteredSuppliers = useMemo(() => {
    if (!formData.supplier) return suppliers;
    return suppliers.filter(s => s.toLowerCase().includes(formData.supplier.toLowerCase()));
  }, [suppliers, formData.supplier]);

  const systems = useMemo(() => {
    const unique = new Set<string>();
    items.forEach(item => { if (item.system) unique.add(item.system); });
    return Array.from(unique).sort();
  }, [items]);

  const filteredSystems = useMemo(() => {
    if (!newItemData.system) return systems;
    return systems.filter(s => s.toLowerCase().includes(newItemData.system.toLowerCase()));
  }, [systems, newItemData.system]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return items.filter(i => 
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50); 
  }, [searchTerm, items]);

  const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const updateSupplierDropdownPosition = () => {
    if (supplierInputRef.current) {
      const rect = supplierInputRef.current.getBoundingClientRect();
      setSupplierDropdownCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
      setShowSupplierDropdown(true);
    }
  };

  const updateSearchDropdownPosition = () => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect();
      setSearchDropdownCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
      setShowSearchDropdown(true);
    }
  };

  const updateSystemDropdownPosition = () => {
    if (systemInputRef.current) {
      const rect = systemInputRef.current.getBoundingClientRect();
      setSystemDropdownCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
      setShowSystemDropdown(true);
    }
  };

  // -- Handlers --
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val) updateSearchDropdownPosition(); else setShowSearchDropdown(false);
  };

  const addToCart = (item: StockItem) => {
    const isEditMode = !!initialOrder;
    const existingIndex = cart.findIndex(c => c.sku === item.sku);
    if (existingIndex >= 0) {
        if (cart[existingIndex].isDeleted) {
            reactivateCartItem(existingIndex);
        } else {
            alert("Artikel befindet sich bereits in der Liste.");
        }
    } else {
        setCart(prev => [...prev, {
            sku: item.sku,
            name: item.name,
            system: item.system,
            quantity: 1,
            isAddedLater: isEditMode,
            isPersisted: false
        }]);
    }
    setSearchTerm('');
    setShowSearchDropdown(false);
  };

  const handleCreateNewItem = () => {
      if (!newItemData.name || !newItemData.sku) return;
      const isEditMode = !!initialOrder;
      setCart(prev => [...prev, {
          sku: newItemData.sku,
          name: newItemData.name,
          system: newItemData.system || 'Sonstiges',
          quantity: 1,
          isAddedLater: isEditMode,
          isPersisted: false
      }]);
      setIsCreatingNew(false);
      setNewItemData({ name: '', sku: '', system: '' });
  };

  const updateCartQty = (idx: number, qty: number) => {
      setCart(prev => prev.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
  };

  const removeCartItem = (idx: number) => {
      const item = cart[idx];
      if (item.isPersisted) {
          setCart(prev => prev.map((it, i) => i === idx ? { ...it, isDeleted: true } : it));
      } else {
          setCart(prev => prev.filter((_, i) => i !== idx));
      }
  };

  const reactivateCartItem = (idx: number) => {
      setCart(prev => prev.map((it, i) => i === idx ? { ...it, isDeleted: false } : it));
  };

  // --- PARSE HANDLER ---
  const handleParseImport = () => {
      const result = parsePOText(importText, items);
      
      // Update State
      setFormData(prev => ({
          ...prev,
          orderId: result.orderId || prev.orderId,
          orderDate: result.orderDate || prev.orderDate,
          supplier: result.supplier || prev.supplier
      }));
      
      if (result.items.length > 0) {
          setCart(result.items);
          alert(`${result.items.length} Positionen erkannt und importiert.`);
      } else {
          alert("Keine bekannten Artikel im Text gefunden.");
      }
      
      setShowImportModal(false);
      setImportText('');
  };

  const handleSubmit = async () => {
      setSubmissionStatus('submitting');
      try {
          await new Promise(resolve => setTimeout(resolve, 600));
          const newOrder: PurchaseOrder = {
              id: formData.orderId,
              supplier: formData.supplier,
              dateCreated: formData.orderDate,
              expectedDeliveryDate: formData.expectedDeliveryDate,
              status: formData.poType === 'project' ? 'Projekt' : 'Lager',
              isArchived: false,
              items: cart.map(c => {
                  const originalItem = initialOrder?.items.find(old => old.sku === c.sku);
                  return {
                      sku: c.sku,
                      name: c.name,
                      quantityExpected: c.quantity,
                      quantityReceived: originalItem ? originalItem.quantityReceived : 0,
                      isAddedLater: c.isAddedLater,
                      isDeleted: c.isDeleted
                  };
              })
          };
          onCreateOrder(newOrder);
          setSubmissionStatus('success');
      } catch (e) {
          console.error(e);
          setSubmissionStatus('error');
      }
  };

  const canGoNext = () => {
      if (step === 1) {
          const basicValid = formData.orderId && formData.supplier && formData.orderDate && formData.poType;
          if (!basicValid) return false;
          if (requireDeliveryDate && !formData.expectedDeliveryDate) return false;
          return true;
      }
      if (step === 2) {
          return cart.some(c => !c.isDeleted);
      }
      return false;
  };

  const inputClass = `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${
    isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:ring-blue-500/30' : 'bg-white border-slate-200 text-[#313335] focus:ring-[#0077B5]/20'
  }`;

  return (
    <div className={`h-full flex flex-col rounded-2xl border overflow-hidden animate-in slide-in-from-right-8 duration-300 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        
        {/* SUCCESS / ERROR OVERLAY */}
        {(submissionStatus === 'success' || submissionStatus === 'error') && createPortal(
            <div className="fixed inset-0 z-[100000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                {submissionStatus === 'success' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 size={48} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 dark:text-white text-slate-900">
                            {initialOrder ? 'Bestellung aktualisiert' : 'Bestellung erfolgreich erstellt'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                            Die Änderungen wurden gespeichert.
                        </p>
                        <div className="w-full space-y-3">
                             <button 
                                onClick={() => alert("Mock PDF Download gestartet...")}
                                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                             >
                                <Download size={18} /> PDF Herunterladen
                             </button>
                             <button 
                               onClick={() => onNavigate('order-management')}
                               className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                             >
                               OK
                             </button>
                        </div>
                    </div>
                )}
            </div>,
            document.body
        )}

        {/* IMPORT MODAL */}
        {showImportModal && createPortal(
            <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowImportModal(false)} />
                <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                    <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <Sparkles size={20} className="text-[#0077B5]" /> Smart Import
                        </h3>
                        <button onClick={() => setShowImportModal(false)} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className={`p-4 rounded-xl border flex gap-3 ${isDark ? 'bg-blue-900/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                            <Info size={20} className="shrink-0" />
                            <p className="text-sm leading-relaxed">
                                Kopieren Sie den Text aus einer PDF oder E-Mail und fügen Sie ihn hier ein. 
                                Wir versuchen automatisch <strong>Datum</strong>, <strong>Bestellnummer</strong> und <strong>Positionen</strong> zu erkennen.
                            </p>
                        </div>
                        <textarea 
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                            placeholder="Fügen Sie hier den Text aus dem PDF/Email ein..."
                            className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[300px] resize-none font-mono text-sm transition-all ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                            autoFocus
                        />
                    </div>
                    <div className={`p-5 border-t flex justify-end gap-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <button 
                            onClick={() => setShowImportModal(false)}
                            className={`px-5 py-2.5 rounded-xl font-bold transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                            Abbrechen
                        </button>
                        <button 
                            onClick={handleParseImport}
                            disabled={!importText.trim()}
                            className="px-5 py-2.5 bg-[#0077B5] hover:bg-[#00A0DC] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                        >
                            <Sparkles size={18} /> Analysieren & Übernehmen
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )}

        {/* Title Bar */}
        <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="text-[#0077B5]" /> {initialOrder ? 'Bestellung bearbeiten' : 'Neue Bestellung'}
            </h2>
            <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= 1 ? 'bg-[#0077B5] text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                <div className={`w-4 h-0.5 ${step >= 2 ? 'bg-[#0077B5]' : 'bg-slate-200'}`} />
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= 2 ? 'bg-[#0077B5] text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                <div className={`w-4 h-0.5 ${step >= 3 ? 'bg-[#0077B5]' : 'bg-slate-200'}`} />
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${step >= 3 ? 'bg-[#0077B5] text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
            </div>
            <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
            </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 relative">
            
            {/* PERSISTENT INFO BANNERS (Across Steps 1-3) */}
            {formData.poType === 'normal' && (
                <div className={`rounded-lg p-3 mb-6 flex gap-3 items-start animate-in fade-in slide-in-from-top-1 ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                        <strong>Lagerbestellung:</strong> Die Ware wird nach Wareneingang direkt dem Lagerbestand hinzugefügt.
                    </p>
                </div>
            )}

            {formData.poType === 'project' && (
                <div className={`rounded-lg p-3 mb-6 flex gap-3 items-start animate-in fade-in slide-in-from-top-1 ${isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                    <Info size={18} className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                        <strong>Projektbestellung:</strong> Ware wird reserviert. Das Technik-Team wird automatisch per E-Mail benachrichtigt, sobald die Ware zur Abholung bereitsteht.
                    </p>
                </div>
            )}

            {/* Step 1 Content */}
            {step === 1 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
                    
                    {/* Header with Smart Import Button */}
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold mb-1">Schritt 1: Kopfdaten</h3>
                            <p className="text-sm opacity-70">Geben Sie die Basisdaten der Bestellung ein.</p>
                        </div>
                        {enableSmartImport && !initialOrder && (
                            <button 
                                onClick={() => setShowImportModal(true)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    isDark 
                                    ? 'bg-transparent text-slate-400 border-slate-700 hover:text-white hover:border-slate-500' 
                                    : 'bg-transparent text-slate-500 border-slate-300 hover:text-slate-800 hover:border-slate-400'
                                }`}
                            >
                                <FileText size={14} /> Aus Text/PDF importieren
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium opacity-70">Art der Bestellung <span className="text-red-500">*</span></label>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setFormData({...formData, poType: 'normal'})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${formData.poType === 'normal' ? 'bg-[#0077B5] border-[#0077B5] text-white shadow-md shadow-blue-500/20' : isDark ? 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <Box size={18} /> <span className="font-bold text-sm">Normal (für Lager)</span>
                                </button>
                                <button onClick={() => setFormData({...formData, poType: 'project'})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${formData.poType === 'project' ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' : isDark ? 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <Briefcase size={18} /> <span className="font-bold text-sm">Für Projekt</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium opacity-70">Bestell Nummer <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                                <input value={formData.orderId} onChange={e => setFormData({...formData, orderId: e.target.value})} className={`${inputClass} pl-10`} placeholder="PO-202X-..." disabled={!!initialOrder} />
                            </div>
                        </div>

                        <div className="space-y-1 relative group">
                            <label className="text-xs font-medium opacity-70">Lieferant <span className="text-red-500">*</span></label>
                            <div className="relative" ref={supplierInputRef}>
                                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                                <input value={formData.supplier} onChange={e => { setFormData({...formData, supplier: e.target.value}); updateSupplierDropdownPosition(); }} onFocus={updateSupplierDropdownPosition} className={`${inputClass} pl-10 pr-8`} placeholder="Lieferant suchen oder eingeben..." />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                                {showSupplierDropdown && filteredSuppliers.length > 0 && createPortal(
                                    <div ref={supplierDropdownRef} style={{ position: 'absolute', top: supplierDropdownCoords.top + 4, left: supplierDropdownCoords.left, width: supplierDropdownCoords.width, zIndex: 99999, maxHeight: '250px' }} className={`rounded-xl border shadow-xl overflow-y-auto animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        {filteredSuppliers.map(s => (
                                            <button key={s} onClick={() => { setFormData({...formData, supplier: s}); setShowSupplierDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center justify-between group/item ${isDark ? 'hover:bg-slate-800 text-slate-200 border-b border-slate-800 last:border-0' : 'hover:bg-slate-50 text-slate-700 border-b border-slate-50 last:border-0'}`}><span>{s}</span></button>
                                        ))}
                                    </div>, document.body
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium opacity-70">Bestelldatum <span className="text-red-500">*</span></label>
                                <div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" size={16} /><input type="date" value={formData.orderDate} onChange={e => setFormData({...formData, orderDate: e.target.value})} className={`${inputClass} pl-10`} style={{ colorScheme: isDark ? 'dark' : 'light' }} /></div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium opacity-70">Geplanter Liefertermin {requireDeliveryDate ? <span className="text-red-500 ml-1">*</span> : <span className="opacity-50 ml-1 font-normal">(Optional)</span>}</label>
                                <div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" size={16} /><input type="date" value={formData.expectedDeliveryDate} onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})} className={`${inputClass} pl-10`} required={requireDeliveryDate} style={{ colorScheme: isDark ? 'dark' : 'light' }} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Items */}
            {step === 2 && (
                <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h3 className="text-lg font-bold mb-1">Schritt 2: Artikel hinzufügen</h3>
                            <p className="text-sm opacity-70">Fügen Sie Artikel zur Bestellung hinzu.</p>
                        </div>
                        <button 
                            onClick={() => setIsCreatingNew(!isCreatingNew)}
                            className="text-sm text-[#0077B5] font-bold hover:underline flex items-center gap-1"
                        >
                            <Plus size={16} /> {isCreatingNew ? 'Zurück zur Suche' : 'Neuen Artikel anlegen'}
                        </button>
                    </div>

                    <div className="space-y-6 relative z-[50]">
                        {isCreatingNew ? (
                            <div className={`p-5 rounded-2xl border space-y-4 animate-in slide-in-from-top-2 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <input value={newItemData.name} onChange={e => setNewItemData({...newItemData, name: e.target.value})} placeholder="Artikelbezeichnung" className={inputClass} autoFocus />
                                <div className="grid grid-cols-2 gap-4">
                                    <input value={newItemData.sku} onChange={e => setNewItemData({...newItemData, sku: e.target.value})} placeholder="Artikelnummer / SKU" className={inputClass} />
                                    <div className="relative group" ref={systemInputRef}>
                                        <input value={newItemData.system} onChange={e => { setNewItemData({...newItemData, system: e.target.value}); updateSystemDropdownPosition(); }} onFocus={updateSystemDropdownPosition} placeholder="System (z.B. BMA)" className={`${inputClass} pr-8`} />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                                        {showSystemDropdown && filteredSystems.length > 0 && createPortal(
                                            <div ref={systemDropdownRef} style={{ position: 'absolute', top: systemDropdownCoords.top + 4, left: systemDropdownCoords.left, width: systemDropdownCoords.width, zIndex: 9999 }} className={`max-h-40 overflow-y-auto rounded-xl border shadow-xl animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                {filteredSystems.map(sys => (<button key={sys} onClick={() => { setNewItemData({...newItemData, system: sys}); setShowSystemDropdown(false); }} className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center justify-between group/item ${isDark ? 'hover:bg-slate-800 text-slate-200 border-b border-slate-800 last:border-0' : 'hover:bg-slate-50 text-slate-700 border-b border-slate-50 last:border-0'}`}><span>{sys}</span></button>))}
                                            </div>, document.body
                                        )}
                                    </div>
                                </div>
                                <button onClick={handleCreateNewItem} disabled={!newItemData.name || !newItemData.sku} className="w-full py-3 bg-[#0077B5] text-white rounded-xl font-bold text-sm hover:bg-[#00A0DC] disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">Artikel erstellen & hinzufügen</button>
                            </div>
                        ) : (
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input ref={searchInputRef} value={searchTerm} onChange={e => handleSearchChange(e.target.value)} onFocus={() => { if(searchTerm) updateSearchDropdownPosition(); }} placeholder="Artikel suchen..." className={`${inputClass} pl-10 pr-3 py-3`} autoFocus />
                                {showSearchDropdown && searchResults.length > 0 && createPortal(
                                    <div ref={searchDropdownRef} style={{ position: 'absolute', top: searchDropdownCoords.top + 8, left: searchDropdownCoords.left, width: searchDropdownCoords.width, zIndex: 9999, maxHeight: '400px' }} className={`rounded-xl border shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'bg-[#1e293b] border-slate-600' : 'bg-white border-slate-300'}`}>
                                        {searchResults.map(item => (<button key={item.id} onClick={() => addToCart(item)} className={`w-full text-left p-4 flex justify-between items-center border-b last:border-0 transition-colors ${isDark ? 'border-slate-700 hover:bg-slate-700 text-slate-200' : 'border-slate-100 hover:bg-slate-50 text-slate-800'}`}><div><div className="font-bold text-base">{item.name}</div><div className="text-sm opacity-70 mt-0.5 flex items-center gap-2"><span>#{item.sku}</span><span className="opacity-50">•</span><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>{item.system}</span></div></div><div className="bg-[#0077B5]/10 p-2 rounded-full"><Plus size={20} className="text-[#0077B5]" /></div></button>))}
                                    </div>, document.body
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 relative z-0">
                        <h4 className="text-sm font-bold opacity-70 uppercase tracking-wider mb-2">Positionen ({cart.filter(c => !c.isDeleted).length})</h4>
                        {cart.length === 0 ? (
                            <div className="p-8 border rounded-xl border-dashed text-center text-slate-500">Keine Artikel ausgewählt.</div>
                        ) : (
                            <div className="rounded-xl border overflow-hidden shadow-sm">
                                <table className={`w-full text-sm text-left ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <thead className={`text-xs uppercase font-bold ${isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                        <tr>
                                            <th className="px-4 py-3">Artikel</th>
                                            <th className="px-4 py-3 w-32 text-center">Menge</th>
                                            <th className="px-4 py-3 w-16 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {cart.map((line, idx) => {
                                            const isDeleted = line.isDeleted;
                                            const isAdded = line.isAddedLater && !line.isDeleted;
                                            
                                            return (
                                            <tr key={idx} className={`group ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} ${isDeleted ? 'opacity-60 bg-red-500/5' : ''} ${isAdded ? 'bg-blue-500/5' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <div className={`font-bold flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'} ${isDeleted ? 'line-through text-slate-500' : ''}`}>
                                                        {line.name}
                                                        {isAdded && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500 text-white font-bold uppercase tracking-wider">NEU</span>}
                                                        {isDeleted && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 font-bold uppercase tracking-wider border border-red-500/20">STORNIERT</span>}
                                                    </div>
                                                    <div className={`text-xs mt-0.5 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        <span className="font-mono">#{line.sku}</span>
                                                        <span className="opacity-50">•</span>
                                                        <span className="uppercase tracking-wider text-[10px] font-bold opacity-80">{line.system}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input 
                                                        type="number"
                                                        min="1"
                                                        value={line.quantity}
                                                        disabled={isDeleted}
                                                        onChange={e => updateCartQty(idx, parseInt(e.target.value) || 1)}
                                                        className={`w-24 px-2 py-1.5 rounded border text-center font-bold outline-none focus:ring-2 ${isDark ? 'bg-slate-950 border-slate-700 focus:ring-blue-500/30 text-white' : 'bg-white border-slate-300 focus:ring-[#0077B5]/20 text-slate-900'} ${isDeleted ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {isDeleted ? (
                                                        <button 
                                                            onClick={() => reactivateCartItem(idx)} 
                                                            className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                            title="Wiederherstellen"
                                                        >
                                                            <Undo2 size={16} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => removeCartItem(idx)} 
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Löschen"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 3: Summary */}
            {step === 3 && (
                <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold mb-1">Schritt 3: Abschluss</h3>
                        <p className="text-sm opacity-70">Überprüfen Sie die Bestellung vor dem Speichern.</p>
                    </div>

                    <div className={`p-5 rounded-2xl border mb-6 ${isDark ? 'bg-[#1f2937] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><div className={`text-xs uppercase font-bold tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Bestell Nr.</div><div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{formData.orderId}</div></div>
                            <div><div className={`text-xs uppercase font-bold tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Datum</div><div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(formData.orderDate)}</div></div>
                            <div><div className={`text-xs uppercase font-bold tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Art der Bestellung</div><div className={`font-bold flex items-center gap-1.5 ${formData.poType === 'project' ? 'text-blue-500' : (isDark ? 'text-white' : 'text-gray-900')}`}>{formData.poType === 'project' ? <Briefcase size={14} /> : <Box size={14}/>}{formData.poType === 'project' ? 'Projekt' : 'Normal (Lager)'}</div></div>
                            <div><div className={`text-xs uppercase font-bold tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lieferant</div><div className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><Truck size={14}/> {formData.supplier}</div></div>
                            {formData.expectedDeliveryDate && (<div className="col-span-2 pt-2 border-t border-slate-500/10 mt-1"><div className={`text-xs uppercase font-bold tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Geplanter Liefertermin</div><div className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}><Clock size={14} className="text-[#0077B5]"/> {formatDate(formData.expectedDeliveryDate)}</div></div>)}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-sm font-bold opacity-70 uppercase tracking-wider">Positionen ({cart.length})</h4>
                        {cart.map((line, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border flex gap-4 items-center ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200 shadow-sm'} ${line.isDeleted ? 'opacity-60 bg-red-500/5 border-red-500/20' : ''}`}>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-sm truncate flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'} ${line.isDeleted ? 'line-through text-slate-500' : ''}`}>
                                        {line.name}
                                        {line.isAddedLater && !line.isDeleted && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500 text-white font-bold uppercase tracking-wider">NEU</span>}
                                        {line.isDeleted && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500 text-white font-bold uppercase tracking-wider">STORNIERT</span>}
                                    </div>
                                    <div className={`text-xs mt-0.5 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        <span className="font-mono">#{line.sku}</span>
                                        <span className="opacity-50">•</span>
                                        <span className="uppercase tracking-wider text-[10px] font-bold opacity-80">{line.system}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs opacity-60 uppercase font-bold block">Menge</span>
                                    <span className={`text-lg font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'} ${line.isDeleted ? 'line-through opacity-50' : ''}`}>
                                        {line.quantity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className={`p-5 border-t flex justify-between items-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            {step > 1 ? (
                <button onClick={() => setStep(prev => prev - 1 as any)} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}>
                    <ArrowLeft size={20} /> Zurück
                </button>
            ) : <div/>}

            {step < 3 ? (
                <button 
                    onClick={() => setStep(prev => prev + 1 as any)}
                    disabled={!canGoNext()}
                    className="px-8 py-3 bg-[#0077B5] hover:bg-[#00A0DC] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                    Weiter <ArrowRight size={20} />
                </button>
            ) : (
                <button 
                    onClick={handleSubmit}
                    disabled={submissionStatus === 'submitting'}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                    {submissionStatus === 'submitting' ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />} 
                    Bestellung speichern
                </button>
            )}
        </div>
    </div>
  );
};
