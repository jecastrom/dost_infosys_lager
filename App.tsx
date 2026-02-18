
import React, { useState, useEffect } from 'react';
import { 
  MOCK_ITEMS, MOCK_RECEIPT_HEADERS, MOCK_RECEIPT_ITEMS, MOCK_COMMENTS, 
  MOCK_PURCHASE_ORDERS, MOCK_RECEIPT_MASTERS, MOCK_TICKETS 
} from './data';
import { 
  StockItem, ReceiptHeader, ReceiptItem, ReceiptComment, ViewMode, Theme, 
  ActiveModule, PurchaseOrder, ReceiptMaster, Ticket, DeliveryLog, StockLog, ReceiptMasterStatus, AuditEntry 
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard'; 
import { InventoryView } from './components/InventoryView';
import { GoodsReceiptFlow } from './components/GoodsReceiptFlow';
import { ReceiptManagement } from './components/ReceiptManagement';
import { OrderManagement } from './components/OrderManagement';
import { CreateOrderWizard } from './components/CreateOrderWizard';
import { SettingsPage, TicketConfig } from './components/SettingsPage';
import { GlobalSettingsPage } from './components/GlobalSettingsPage';
import { DocumentationPage } from './components/DocumentationPage';
import { StockLogView } from './components/StockLogView';
import { LogicInspector } from './components/LogicInspector';
import { SupplierView } from './components/SupplierView';

// Error Boundary Component
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Die Anwendung ist auf einen unerwarteten Fehler gestoßen. Bitte laden Sie die Seite neu.
            </p>
            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Technische Details
                </summary>
                <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  // State
  const [theme, setTheme] = useState<Theme>('light');
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  
  // -- UX State: Force View Refresh --
  const [viewKey, setViewKey] = useState(0);

  // Persistent Inventory View Mode
  const [inventoryViewMode, setInventoryViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('inventoryViewMode') as 'grid' | 'list') || 'grid';
    }
    return 'grid';
  });
  
  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Toggle
  const [sidebarMode, setSidebarMode] = useState<'full' | 'slim'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sidebarMode');
        return (saved === 'full' || saved === 'slim') ? saved : 'full';
    }
    return 'full';
  });

  // Global Configuration State
  // UPDATED: Default is now FALSE (Optional)
  const [requireDeliveryDate, setRequireDeliveryDate] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('requireDeliveryDate');
        // Only return true if explicitly saved as 'true'. Default (null) becomes false.
        return saved === 'true';
    }
    return false;
  });

  // Smart Import Feature Flag
  const [enableSmartImport, setEnableSmartImport] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('enableSmartImport');
        // Default to TRUE if not set, or parse existing
        return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Status Column Position Setting
  const [statusColumnFirst, setStatusColumnFirst] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('statusColumnFirst') === 'true';
    }
    return false;
  });

  // Ticket Automation Config State
  // UPDATED: All defaults set to TRUE for maximum coverage
  const [ticketConfig, setTicketConfig] = useState<TicketConfig>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('ticketConfig');
        if (saved) return JSON.parse(saved);
    }
    return { missing: true, extra: true, damage: true, wrong: true, rejected: true };
  });
  
  // Data State
  const [inventory, setInventory] = useState<StockItem[]>(MOCK_ITEMS);
  const [receiptHeaders, setReceiptHeaders] = useState<ReceiptHeader[]>(MOCK_RECEIPT_HEADERS);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>(MOCK_RECEIPT_ITEMS);
  const [comments, setComments] = useState<ReceiptComment[]>(MOCK_COMMENTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [receiptMasters, setReceiptMasters] = useState<ReceiptMaster[]>(MOCK_RECEIPT_MASTERS);
  
  // Ticket State (Case Management)
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  
  // Logging State
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('auditTrail');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const addAudit = (event: string, details: Record<string, any>) => {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      event,
      user: 'Admin User',
      timestamp: Date.now(),
      ip: '192.168.1.xxx',
      details
    };
    setAuditTrail(prev => {
      const next = [entry, ...prev].slice(0, 500);
      localStorage.setItem('auditTrail', JSON.stringify(next));
      return next;
    });
  };
  
  // Transient State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [goodsReceiptMode, setGoodsReceiptMode] = useState<'standard' | 'return' | 'problem'>('standard');
  const [orderToEdit, setOrderToEdit] = useState<PurchaseOrder | null>(null);

  // Toggle Theme
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  useEffect(() => {
    addAudit('User Login', { device: navigator.userAgent.substring(0, 80), screen: `${window.innerWidth}x${window.innerHeight}` });
  }, []);

  useEffect(() => {
    // Clean up class list
    document.documentElement.classList.remove('dark', 'soft');
    
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (theme === 'soft') {
        document.documentElement.classList.add('soft'); 
    }
  }, [theme]);

  // Sidebar Handler
  const handleSetSidebarMode = (mode: 'full' | 'slim') => {
    setSidebarMode(mode);
    localStorage.setItem('sidebarMode', mode);
  };

  // Inventory View Mode Handler
  const handleSetInventoryViewMode = (mode: 'grid' | 'list') => {
    setInventoryViewMode(mode);
    localStorage.setItem('inventoryViewMode', mode);
  };

  // Configuration Handler
  const handleSetRequireDeliveryDate = (required: boolean) => {
    setRequireDeliveryDate(required);
    localStorage.setItem('requireDeliveryDate', String(required));
  };

  const handleSetEnableSmartImport = (enabled: boolean) => {
    setEnableSmartImport(enabled);
    localStorage.setItem('enableSmartImport', String(enabled));
  };

  const handleSetStatusColumnFirst = (val: boolean) => {
    setStatusColumnFirst(val);
    localStorage.setItem('statusColumnFirst', String(val));
  };

  // Ticket Config Handler
  const handleSetTicketConfig = (newConfig: TicketConfig) => {
    setTicketConfig(newConfig);
    localStorage.setItem('ticketConfig', JSON.stringify(newConfig));
  };

  // Navigation Handler (Resets Transient State)
  const handleNavigation = (module: ActiveModule) => {
    // Logic: If clicking the active module again, force a reset/remount
    if (activeModule === module) {
      setViewKey(prev => prev + 1);
    } else {
      setActiveModule(module);
    }

    if (module !== 'create-order') setOrderToEdit(null);
    if (module !== 'goods-receipt') {
        setSelectedPoId(null);
        setGoodsReceiptMode('standard'); // Reset mode on exit
    }
  };

  // Handlers
  const handleLogStock = (itemId: string, itemName: string, action: 'add' | 'remove', quantity: number, source?: string, context?: 'normal' | 'project' | 'manual' | 'po-normal' | 'po-project') => {
    const item = inventory.find(i => i.id === itemId);
    const newLog: StockLog = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId: 'current-user-id',
        userName: 'Admin User',
        itemId,
        itemName,
        action,
        quantity,
        warehouse: item?.warehouseLocation || 'Hauptlager',
        source,
        context
    };
    
    setStockLogs(prev => [newLog, ...prev]);
  };

  const handleStockUpdate = (id: string, newLevel: number) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, stockLevel: newLevel, lastUpdated: Date.now() } : item));
  };

  const handleUpdateItem = (updatedItem: StockItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleCreateItem = (newItem: StockItem) => {
    setInventory(prev => [newItem, ...prev]);
  };

  const handleAddStock = () => {
     handleNavigation('goods-receipt');
  };

  const handleReceiptStatusUpdate = (batchId: string, newStatus: string) => {
    const oldHeader = receiptHeaders.find(h => h.batchId === batchId);
    addAudit('Status Changed', { receiptId: batchId, po: oldHeader?.bestellNr || '-', oldStatus: oldHeader?.status || '-', newStatus });
    setReceiptHeaders(prev => prev.map(h => h.batchId === batchId ? { ...h, status: newStatus } : h));

    // When manually closing (Abgeschlossen), propagate to master + PO
    if (newStatus === 'Abgeschlossen') {
      const header = receiptHeaders.find(h => h.batchId === batchId);
      if (header?.bestellNr) {
        const poId = header.bestellNr;
        // Update receipt master status
        setReceiptMasters(prev => prev.map(m => m.poId === poId ? { ...m, status: 'Abgeschlossen' as ReceiptMasterStatus } : m));
        // Update PO: set isForceClosed + status Abgeschlossen
        setPurchaseOrders(prev => prev.map(po => {
          if (po.id !== poId) return po;
          let nextStatus = po.status;
          if (po.status !== 'Projekt' && po.status !== 'Lager') {
            nextStatus = 'Abgeschlossen';
          }
          return { ...po, status: nextStatus, isForceClosed: true };
        }));
      }
    }
  };

  const handleAddComment = (batchId: string, type: 'note' | 'email' | 'call', message: string) => {
    addAudit('Comment Added', { receiptId: batchId, type, messagePreview: message.substring(0, 60) });
    const newComment: ReceiptComment = {
      id: crypto.randomUUID(),
      batchId,
      userId: 'currentUser',
      userName: 'Admin User',
      timestamp: Date.now(),
      type,
      message
    };
    setComments(prev => [newComment, ...prev]);
  };

  const handleAddTicket = (ticket: Ticket) => {
    addAudit('Ticket Created', { ticketId: ticket.id, subject: ticket.subject, priority: ticket.priority, receiptId: ticket.receiptId });
    setTickets(prev => [...prev, ticket]);
  };

  const handleUpdateTicket = (ticket: Ticket) => {
    const old = tickets.find(t => t.id === ticket.id);
    if (old && old.status !== ticket.status) {
      addAudit('Ticket Status Changed', { ticketId: ticket.id, subject: ticket.subject, oldStatus: old.status, newStatus: ticket.status });
    }
    setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
  };

  const handleCreateOrder = (order: PurchaseOrder) => {
    const exists = purchaseOrders.some(o => o.id === order.id);
    addAudit(exists ? 'Order Updated' : 'Order Created', { po: order.id, supplier: order.supplier, itemCount: order.items.length, status: order.status });
    setPurchaseOrders(prev => {
        // Upsert Logic: Check if ID exists
        if (exists) {
            // Update existing record
            return prev.map(o => o.id === order.id ? order : o);
        }
        
        // Insert new record
        return [order, ...prev];
    });
  };

  const handleUpdateOrder = (updatedOrder: PurchaseOrder) => {
    setPurchaseOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleArchiveOrder = (id: string) => {
    addAudit('Order Archived', { po: id });
    setPurchaseOrders(prev => prev.map(o => o.id === id ? { ...o, isArchived: true } : o));
  };

  const handleCancelOrder = (id: string) => {
    addAudit('Order Cancelled', { po: id });
    setPurchaseOrders(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, status: 'Storniert' }; 
      }
      return o;
    }));
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setOrderToEdit(order);
    handleNavigation('create-order');
  };

  const handleReceiveGoods = (poId: string, mode: 'standard' | 'return' | 'problem' = 'standard') => {
    if (mode === 'problem') {
      addAudit('Reinspection Started', { po: poId, reason: 'Nachträgliche Korrektur via Problem-Button' });
    }
    setSelectedPoId(poId);
    setGoodsReceiptMode(mode);
    handleNavigation('goods-receipt');
  };

  const handleQuickReceipt = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;
    addAudit('Quick Receipt Created', { po: poId, supplier: po.supplier, itemCount: po.items.length });

    const batchId = `b-${Date.now()}`;
    const timestamp = Date.now();

    const newHeader: ReceiptHeader = {
      batchId,
      lieferscheinNr: 'Ausstehend',
      bestellNr: po.id,
      lieferdatum: new Date().toISOString().split('T')[0],
      lieferant: po.supplier,
      status: 'In Prüfung',
      timestamp,
      itemCount: 0,
      warehouseLocation: 'Wareneingang',
      createdByName: 'Admin User'
    };

    setReceiptHeaders(prev => [newHeader, ...prev]);

    setReceiptMasters(prev => {
        const existing = prev.find(m => m.poId === poId);
        const initialDelivery: DeliveryLog = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            lieferscheinNr: 'Ausstehend',
            items: po.items.map(i => ({
                sku: i.sku,
                receivedQty: 0,
                quantityAccepted: 0,
                quantityRejected: 0,
                damageFlag: false,
                manualAddFlag: false,
                orderedQty: i.quantityExpected,
                previousReceived: 0,
                offen: i.quantityExpected,
                zuViel: 0
            }))
        };

        if (existing) {
            return prev.map(m => m.poId === poId ? { 
                ...m, 
                deliveries: [...m.deliveries, initialDelivery] 
            } : m);
        } else {
            return [...prev, {
                id: `RM-${Date.now()}`,
                poId,
                status: 'In Prüfung' as ReceiptMasterStatus, 
                deliveries: [initialDelivery]
            }];
        }
    });

    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, linkedReceiptId: batchId } : p));
    handleNavigation('receipt-management');
  };

  const handleReceiptSuccess = (
    headerData: Omit<ReceiptHeader, 'timestamp' | 'itemCount'>, 
    cartItems: any[], 
    newItemsCreated: StockItem[],
    forceClose: boolean = false // Accepts new Force Close flag
  ) => {
    // If batchId was pre-generated by GoodsReceiptFlow (for tickets), use it. Otherwise generate new.
    const batchId = (headerData as any).batchId || `b-${Date.now()}`;
    const timestamp = Date.now();

    // --- PROBLEM MODE: Cancel old delivery + reverse stock BEFORE creating new ---
    const problemCanceledQty = new Map<string, number>();
    if (goodsReceiptMode === 'problem' && headerData.bestellNr) {
      const oldPoId = headerData.bestellNr;
      const oldMaster = receiptMasters.find(m => m.poId === oldPoId);
      if (oldMaster && oldMaster.deliveries.length > 0) {
        // Find the latest non-storniert delivery
        const lastDelivery = [...oldMaster.deliveries].reverse().find(d => !d.isStorniert);
        if (lastDelivery) {
          // 1. Reverse stock from old delivery
          const linkedPO = purchaseOrders.find(p => p.id === oldPoId);
          const isProject = linkedPO?.status === 'Projekt';
          if (!isProject) {
            setInventory(prev => {
              const copy = [...prev];
              lastDelivery.items.forEach(oldItem => {
                const idx = copy.findIndex(i => i.sku === oldItem.sku);
                if (idx >= 0) {
                  copy[idx] = { ...copy[idx], stockLevel: Math.max(0, copy[idx].stockLevel - oldItem.quantityAccepted), lastUpdated: timestamp };
                  handleLogStock(copy[idx].id, copy[idx].name, 'remove', oldItem.quantityAccepted, `Storno (Korrektur) — ${lastDelivery.lieferscheinNr}`, 'po-normal');
                }
              });
              return copy;
            });
          }
          // 2. Reverse PO quantityReceived
          setPurchaseOrders(prev => prev.map(po => {
            if (po.id !== oldPoId) return po;
            return { ...po, items: po.items.map(pItem => {
              const oldLine = lastDelivery.items.find(d => d.sku === pItem.sku);
              if (oldLine) return { ...pItem, quantityReceived: Math.max(0, pItem.quantityReceived - oldLine.quantityAccepted) };
              return pItem;
            })};
          }));
          // 3. Mark old delivery as storniert
          setReceiptMasters(prev => prev.map(m => {
            if (m.poId !== oldPoId) return m;
            return { ...m, deliveries: m.deliveries.map(d => d.id === lastDelivery.id ? { ...d, isStorniert: true } : d) };
          }));
          // 4. Mark old receipt header as Storniert
          const oldHeader = receiptHeaders.find(h => h.lieferscheinNr === lastDelivery.lieferscheinNr && h.bestellNr === oldPoId);
          if (oldHeader) {
            setReceiptHeaders(prev => prev.map(h => h.batchId === oldHeader.batchId ? { ...h, status: 'Storniert' } : h));
            addAudit('Receipt Nullified', { oldReceiptId: oldHeader.batchId, newReceiptId: batchId, po: oldPoId, oldLieferschein: lastDelivery.lieferscheinNr, reason: 'Nachträgliche Korrektur via Problem-Button', canceledItems: lastDelivery.items.map(i => ({ sku: i.sku, qtyReversed: i.quantityAccepted })) });
          }
          // 5. Build local map of canceled quantities (avoids stale React state)
          lastDelivery.items.forEach(oldItem => {
            problemCanceledQty.set(oldItem.sku, oldItem.quantityAccepted);
          });
        }
      }
      // Reset mode after handling
      setGoodsReceiptMode('standard');
    }

    // Determine Context & Log Type
    let isProject = false;
    let logContext: 'po-normal' | 'po-project' = 'po-normal';
    
    if (headerData.bestellNr) {
        const linkedPO = purchaseOrders.find(p => p.id === headerData.bestellNr);
        if (linkedPO && linkedPO.status === 'Projekt') {
            isProject = true;
            logContext = 'po-project';
        }
    }

    if (newItemsCreated.length > 0) {
      setInventory(prev => [...prev, ...newItemsCreated]);
    }

    // --- 0. PERFORM LOGGING (MOVED HERE FOR CORRECT CONTEXT) ---
    cartItems.forEach(cartItem => {
        const qtyToAdd = cartItem.qtyAccepted ?? cartItem.qty; 
        if (qtyToAdd !== 0) {
             const action = qtyToAdd > 0 ? 'add' : 'remove';
             handleLogStock(
                 cartItem.item.id,
                 cartItem.item.name,
                 action,
                 Math.abs(qtyToAdd),
                 `Wareneingang ${headerData.lieferscheinNr}`,
                 logContext
             );
        }
    });

    // --- 1. UPDATE STOCK INVENTORY (ACCEPTED QTY ONLY) ---
    setInventory(prev => {
      const copy = [...prev];
      cartItems.forEach(cartItem => {
         if (!isProject) {
             const idx = copy.findIndex(i => i.id === cartItem.item.id);
             if (idx >= 0) {
               const qtyToAdd = cartItem.qtyAccepted ?? cartItem.qty; 
               copy[idx] = { 
                 ...copy[idx], 
                 stockLevel: copy[idx].stockLevel + qtyToAdd,
                 lastUpdated: timestamp,
                 warehouseLocation: cartItem.location 
               };
             }
         }
      });
      return copy;
    });

    // --- 2. UPDATE PO STATUS & RECEIPT MASTER (HISTORY) ---
    // Safety Net: Default to 'Gebucht' if status comes in empty
    let finalReceiptStatus = headerData.status || 'Gebucht';

    // Detect quality issues from actual cart data (overrides empty/stale status)
    const cartHasDamage = cartItems.some((c: any) => c.qtyDamaged > 0);
    const cartHasWrong = cartItems.some((c: any) => c.qtyWrong > 0);
    const cartAllRejected = cartItems.length > 0 && cartItems.every((c: any) => c.qtyRejected === c.qtyReceived && c.qtyReceived > 0);
    if (cartAllRejected) finalReceiptStatus = 'Abgelehnt';
    else if (cartHasDamage && cartHasWrong) finalReceiptStatus = 'Schaden + Falsch';
    else if (cartHasDamage) finalReceiptStatus = 'Schaden';
    else if (cartHasWrong) finalReceiptStatus = 'Falsch geliefert';

    if (headerData.bestellNr) {
        const poId = headerData.bestellNr;
        const currentPO = purchaseOrders.find(p => p.id === poId);

        // --- NEW STATUS CALCULATION (PARTIAL vs COMPLETED) ---
        if (currentPO) {
             let totalOrdered = 0;
             let totalReceivedIncludingCurrent = 0;

             currentPO.items.forEach(item => {
                 totalOrdered += item.quantityExpected;
                 
                 // History from PO state
                 let itemTotal = item.quantityReceived;
                 
                 // Add Current Accepted Amount (not yet in PO state)
                 const cartLine = cartItems.find(c => c.item.sku === item.sku);
                 if (cartLine) {
                     itemTotal += (cartLine.qtyAccepted ?? cartLine.qty);
                 }
                 
                 totalReceivedIncludingCurrent += itemTotal;
             });

             // Apply Logic: Only override if it's not already a critical error status
             const isErrorStatus = ['Abgelehnt', 'Schaden', 'Schaden + Falsch', 'Falsch geliefert', 'Beschädigt', 'Übermenge'].includes(finalReceiptStatus);
             
             if (!isErrorStatus) {
                 if (forceClose) {
                     // FORCE CLOSE: Treat as 'Gebucht' regardless of math
                     finalReceiptStatus = 'Gebucht'; 
                 } else if (totalReceivedIncludingCurrent > totalOrdered) {
                     finalReceiptStatus = 'Übermenge'; // Fixed form ÃƒÅ“bermenge
                 } else if (totalReceivedIncludingCurrent < totalOrdered) {
                     // If we received less than total ordered, it is Partial.
                     finalReceiptStatus = 'Teillieferung';
                 } else {
                     // Exact match
                     finalReceiptStatus = 'Gebucht';
                 }
             }
        }
        // -----------------------------------------------------------

        setPurchaseOrders(prev => prev.map(po => {
            if (po.id !== poId) return po;
            
            const updatedItems = po.items.map(pItem => {
                const receivedLine = cartItems.find(c => c.item.sku === pItem.sku);
                if (receivedLine) {
                    const qtyToAdd = receivedLine.qtyAccepted ?? receivedLine.qty;
                    return { ...pItem, quantityReceived: Math.max(0, pItem.quantityReceived + qtyToAdd) };
                }
                return pItem;
            });

            // Logic Checks for PO STATUS (Distinct from Receipt Status)
            const allReceived = updatedItems.every(i => i.quantityReceived >= i.quantityExpected);
            const partiallyReceived = updatedItems.some(i => i.quantityReceived > 0);
            
            // GUARD CLAUSE: Protect Identity Statuses (Projekt/Lager)
            // If Force Close is true, we force completion unless it's a special type.
            let nextStatus = po.status;
            if (po.status !== 'Projekt' && po.status !== 'Lager') {
                if (forceClose) {
                    nextStatus = 'Abgeschlossen';
                } else {
                    nextStatus = allReceived ? 'Abgeschlossen' : partiallyReceived ? 'Teilweise geliefert' : 'Offen';
                }
            }

            return {
                ...po,
                items: updatedItems,
                status: nextStatus,
                linkedReceiptId: batchId,
                isForceClosed: forceClose || po.isForceClosed // Persist force close state
            };
        }));

        // --- 3. CREATE RECEIPT MASTER & DELIVERY LOG ---
        setReceiptMasters(prev => {
            const existingMaster = prev.find(m => m.poId === poId);
            const newDeliveryLog: DeliveryLog = {
                id: crypto.randomUUID(),
                date: new Date(timestamp).toISOString(),
                lieferscheinNr: headerData.lieferscheinNr,
                items: cartItems.map(c => {
                    const poItem = currentPO?.items.find(pi => pi.sku === c.item.sku);
                    const ordered = poItem ? poItem.quantityExpected : 0;
                    const rawPrevious = poItem ? poItem.quantityReceived : 0;
                    // In problem mode, subtract canceled qty (React state is stale)
                    const previous = rawPrevious - (problemCanceledQty.get(c.item.sku) || 0);
                    
                    // Stats for Snapshot
                    const currentAccepted = c.qtyAccepted ?? c.qty;
                    const totalAccepted = previous + currentAccepted;
                    
                    const offen = Math.max(0, ordered - totalAccepted);
                    const zuViel = Math.max(0, totalAccepted - ordered);

                    return {
                        sku: c.item.sku,
                        receivedQty: c.qtyReceived, // Total Physical Count
                        quantityAccepted: c.qtyAccepted, // Good Stock
                        quantityRejected: c.qtyRejected, // Returned/Bad
                        
                        // New Logistics Fields
                        rejectionReason: c.rejectionReason,
                        returnCarrier: c.returnCarrier,
                        returnTrackingId: c.returnTrackingId,
                        
                        damageFlag: !!c.isDamaged || !!c.issueNotes,
                        manualAddFlag: !c.orderedQty,
                        orderedQty: ordered,
                        previousReceived: previous,
                        offen: offen,
                        zuViel: zuViel
                    };
                })
            };

            if (existingMaster) {
                return prev.map(m => m.id === existingMaster.id ? { 
                    ...m,
                    status: finalReceiptStatus as ReceiptMasterStatus, // Update master status
                    deliveries: [...m.deliveries, newDeliveryLog] 
                } : m);
            } else {
                return [...prev, {
                    id: crypto.randomUUID(),
                    poId,
                    status: finalReceiptStatus as ReceiptMasterStatus,
                    deliveries: [newDeliveryLog]
                }];
            }
        });
    }

    // --- 4. CREATE RECEIPT HEADER & ITEMS ---
    const newHeader: ReceiptHeader = {
      ...headerData,
      status: finalReceiptStatus, // Persist the calculated status
      batchId,
      timestamp,
      itemCount: cartItems.length,
      createdByName: 'Admin User'
    };
    setReceiptHeaders(prev => [newHeader, ...prev]);

    const newReceiptItems: ReceiptItem[] = cartItems.map((c, idx) => ({
      id: `ri-${batchId}-${idx}`,
      batchId,
      sku: c.item.sku,
      name: c.item.name,
      quantity: c.qtyAccepted ?? c.qty, // Record only what was accepted into stock for the simple view
      targetLocation: c.location,
      isDamaged: c.isDamaged,
      issueNotes: c.issueNotes
    }));
    setReceiptItems(prev => [...prev, ...newReceiptItems]);

    // --- 5. AUTO-UPDATE TICKETS FOR RETURNS ---
    if (cartItems.some(c => c.quantityRejected > 0) && headerData.bestellNr) {
        const poId = headerData.bestellNr;
        const returnItems = cartItems.filter(c => c.quantityRejected > 0);
        
        const returnMsg = returnItems.map(c => 
            `Rücksendung: ${c.quantityRejected}x ${c.item.name} (${c.rejectionReason || 'Sonstiges'}). ` +
            (c.returnCarrier ? `Via ${c.returnCarrier} ${c.returnTrackingId ? `(${c.returnTrackingId})` : ''}` : '')
        ).join('\n');

        setTickets(prevTickets => prevTickets.map(ticket => {
            if (ticket.status !== 'Open') return ticket;
            
            // Resolve ticket's PO
            // Logic: Ticket -> ReceiptHeader -> PO ID
            // We use the 'receiptHeaders' state which contains all EXISTING headers.
            // If the ticket is new (created in this flow), it won't be found in 'receiptHeaders' yet, 
            // but its 'receiptId' will match 'batchId' of the current receipt.
            
            let isMatch = false;
            
            if (ticket.receiptId === batchId) {
                isMatch = true; // Belongs to current receipt (which belongs to poId)
            } else {
                const tHeader = receiptHeaders.find(h => h.batchId === ticket.receiptId);
                if (tHeader && tHeader.bestellNr === poId) {
                    isMatch = true;
                }
            }

            if (isMatch) {
                 return {
                     ...ticket,
                     messages: [...ticket.messages, {
                         id: crypto.randomUUID(),
                         author: 'System',
                         text: `ðŸ“¦ Logistik Update:\n${returnMsg}`,
                         timestamp: Date.now() + 100, // +100ms to ensure it appears after creation msg
                         type: 'system'
                     }]
                 };
            }
            return ticket;
        }));
    }

    // --- 6. SIMULATE NOTIFICATION FOR PROJECT COMPLETION ---
    if (isProject && finalReceiptStatus === 'Gebucht') {
        console.log(`[M365 Mock] Sending email to 'technik-verteiler@dost.de': "Wareneingang fÃ¼r Projekt ${headerData.bestellNr} abgeschlossen. Bereit zur Abholung."`);
        // Visual feedback via setTimeout to allow state to settle or simple alert
        setTimeout(() => {
            alert("ðŸ“§ Automatische E-Mail an das Technik-Team gesendet (Abholbereit).");
        }, 500);
    }

    addAudit('Receipt Confirmed', { receiptId: batchId, po: headerData.bestellNr || '-', lieferschein: headerData.lieferscheinNr, status: finalReceiptStatus, itemCount: cartItems.length, isProject });

    handleNavigation('receipt-management');
  };

  const handleRevertReceipt = (batchId: string) => {
      const header = receiptHeaders.find(h => h.batchId === batchId);
      if (!header) return;
      addAudit('Receipt Reverted', { receiptId: batchId, po: header.bestellNr || '-', lieferschein: header.lieferscheinNr });

      const poId = header.bestellNr;
      const linkedPO = purchaseOrders.find(p => p.id === poId);
      const isProject = linkedPO?.status === 'Projekt';

      const itemsToRevert = receiptItems.filter(i => i.batchId === batchId);
      if (!isProject) {
          setInventory(prev => {
              const copy = [...prev];
              itemsToRevert.forEach(rItem => {
                  const idx = copy.findIndex(i => i.sku === rItem.sku);
                  if (idx >= 0) {
                      copy[idx] = {
                          ...copy[idx],
                          stockLevel: Math.max(0, copy[idx].stockLevel - rItem.quantity),
                          lastUpdated: Date.now()
                      };
                      handleLogStock(
                          copy[idx].id,
                          copy[idx].name,
                          'remove',
                          rItem.quantity,
                          `Storno - ${header.lieferscheinNr}`,
                          'manual'
                      );
                  }
              });
              return copy;
          });
      } else {
          itemsToRevert.forEach(rItem => {
              handleLogStock(
                  rItem.sku,
                  rItem.name,
                  'remove',
                  rItem.quantity,
                  `Storno (Projekt) - ${header.lieferscheinNr}`,
                  'po-project'
              );
          });
      }

      setReceiptHeaders(prev => prev.map(h => h.batchId === batchId ? { ...h, status: 'In Prüfung' } : h));
      
      if (linkedPO) {
           setPurchaseOrders(prev => prev.map(po => {
               if (po.id !== linkedPO.id) return po;
               const newItems = po.items.map(pItem => {
                   const rItem = itemsToRevert.find(ri => ri.sku === pItem.sku);
                   if (rItem) {
                       return { ...pItem, quantityReceived: Math.max(0, pItem.quantityReceived - rItem.quantity) };
                   }
                   return pItem;
               });
               const anyReceived = newItems.some(i => i.quantityReceived > 0);
               
               // GUARD CLAUSE: Protect Identity Statuses (Projekt/Lager) upon Revert
               let nextStatus = po.status;
               if (po.status !== 'Projekt' && po.status !== 'Lager') {
                   nextStatus = anyReceived ? 'Teilweise geliefert' : 'Offen';
               }

               return {
                   ...po,
                   items: newItems,
                   status: nextStatus
               };
           }));
      }
  };



  // --- DIRECT RETURN PROCESSING (No wizard) ---
  const handleProcessReturn = (poId: string, data: { quantity: number; reason: string; carrier: string; trackingId: string }) => {
      const po = purchaseOrders.find(p => p.id === poId);
      if (!po) return;
      addAudit('Return Processed', { po: poId, quantity: data.quantity, reason: data.reason, carrier: data.carrier || '-', trackingId: data.trackingId || '-' });

      const master = receiptMasters.find(m => m.poId === poId);
      if (!master) return;

      const batchId = `b-ret-${Date.now()}`;
      const timestamp = Date.now();
      const d = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\./g, '');
      const lieferscheinNr = `RÜCK-${d}`;
      const isProject = po.status === 'Projekt';

      // Distribute return quantity across items with overdelivery
      let remaining = data.quantity;
      const returnLines: Array<{ sku: string; name: string; qty: number }> = [];

      po.items.forEach(poItem => {
          if (remaining <= 0) return;
          let totalAccepted = 0;
          master.deliveries.forEach(del => {
              const di = del.items.find(x => x.sku === poItem.sku);
              if (di) totalAccepted += di.quantityAccepted;
          });
          const overQty = Math.max(0, totalAccepted - poItem.quantityExpected);
          if (overQty > 0) {
              const returnQty = Math.min(overQty, remaining);
              returnLines.push({ sku: poItem.sku, name: poItem.name, qty: returnQty });
              remaining -= returnQty;
          }
      });

      // Fallback: if no overdelivery items found, apply to first item
      if (returnLines.length === 0 && po.items.length > 0) {
          returnLines.push({ sku: po.items[0].sku, name: po.items[0].name, qty: data.quantity });
      }

      if (returnLines.length === 0) return;

      // 1. Stock adjustment (subtract returned qty)
      if (!isProject) {
          setInventory(prev => {
              const copy = [...prev];
              returnLines.forEach(rl => {
                  const idx = copy.findIndex(i => i.sku === rl.sku);
                  if (idx >= 0) {
                      copy[idx] = { ...copy[idx], stockLevel: Math.max(0, copy[idx].stockLevel - rl.qty), lastUpdated: timestamp };
                  }
              });
              return copy;
          });
      }

      // 2. Log stock removals
      returnLines.forEach(rl => {
          const item = inventory.find(i => i.sku === rl.sku);
          if (item) {
              handleLogStock(item.id, item.name, 'remove', rl.qty, `Rücksendung ${lieferscheinNr}`, isProject ? 'po-project' : 'po-normal');
          }
      });

      // 3. Update PO items (decrease quantityReceived) + recalc status
      setPurchaseOrders(prev => prev.map(p => {
          if (p.id !== poId) return p;
          const updatedItems = p.items.map(pItem => {
              const rl = returnLines.find(r => r.sku === pItem.sku);
              if (rl) return { ...pItem, quantityReceived: Math.max(0, pItem.quantityReceived - rl.qty) };
              return pItem;
          });
          let nextStatus = p.status;
          if (p.status !== 'Projekt' && p.status !== 'Lager') {
              const allReceived = updatedItems.every(i => i.quantityReceived >= i.quantityExpected);
              const anyReceived = updatedItems.some(i => i.quantityReceived > 0);
              nextStatus = allReceived ? 'Abgeschlossen' : anyReceived ? 'Teilweise geliefert' : 'Offen';
          }
          return { ...p, items: updatedItems, status: nextStatus };
      }));

      // 4. Create receipt header for the return
      const newHeader: ReceiptHeader = {
          batchId,
          lieferscheinNr,
          bestellNr: poId,
          lieferdatum: new Date().toISOString().split('T')[0],
          lieferant: po.supplier,
          status: 'Rücklieferung',
          timestamp,
          itemCount: returnLines.length,
          warehouseLocation: 'Rücksendung',
          createdByName: 'Admin User'
      };
      setReceiptHeaders(prev => [newHeader, ...prev]);

      // 5. Create receipt items (negative qty to show as return)
      const newReceiptItems: ReceiptItem[] = returnLines.map((rl, idx) => ({
          id: `ri-${batchId}-${idx}`,
          batchId,
          sku: rl.sku,
          name: rl.name,
          quantity: -rl.qty,
          targetLocation: 'Rücksendung',
          isDamaged: data.reason === 'Schaden',
          issueNotes: `Rücksendung: ${data.reason}${data.carrier ? ` via ${data.carrier}` : ''}${data.trackingId ? ` (${data.trackingId})` : ''}`
      }));
      setReceiptItems(prev => [...prev, ...newReceiptItems]);

      // 6. Update ReceiptMaster: add return delivery log + recalc master status
      const mapReason = (r: string): 'Damaged' | 'Wrong' | 'Overdelivery' | 'Other' => {
          if (r === 'Schaden') return 'Damaged';
          if (r === 'Falsch geliefert') return 'Wrong';
          if (r === 'Übermenge') return 'Overdelivery';
          return 'Other';
      };

      setReceiptMasters(prev => {
          const existing = prev.find(m => m.poId === poId);
          if (!existing) return prev;

          const deliveryLog: DeliveryLog = {
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              lieferscheinNr,
              items: returnLines.map(rl => ({
                  sku: rl.sku,
                  receivedQty: 0,
                  quantityAccepted: 0,
                  quantityRejected: rl.qty,
                  rejectionReason: mapReason(data.reason),
                  returnCarrier: data.carrier,
                  returnTrackingId: data.trackingId,
                  damageFlag: data.reason === 'Schaden',
                  manualAddFlag: false,
                  orderedQty: po.items.find(pi => pi.sku === rl.sku)?.quantityExpected || 0,
                  previousReceived: po.items.find(pi => pi.sku === rl.sku)?.quantityReceived || 0,
                  offen: 0,
                  zuViel: 0
              }))
          };

          // Recalculate effective totals after the return
          let totalOrdered = 0;
          let totalEffective = 0;
          po.items.forEach(pi => {
              totalOrdered += pi.quantityExpected;
              let accepted = 0;
              existing.deliveries.forEach(del => {
                  const di = del.items.find(x => x.sku === pi.sku);
                  if (di) accepted += di.quantityAccepted;
              });
              const rl = returnLines.find(r => r.sku === pi.sku);
              totalEffective += accepted - (rl ? rl.qty : 0);
          });

          let newStatus: ReceiptMasterStatus = totalEffective >= totalOrdered ? 'Gebucht'
              : totalEffective > 0 ? 'Teillieferung'
              : 'Offen';

          return prev.map(m => m.id === existing.id ? {
              ...m,
              status: newStatus,
              deliveries: [...m.deliveries, deliveryLog]
          } : m);
      });

      // 7. Post system message to open tickets for this PO
      const returnMsg = returnLines.map(rl =>
          `Rücksendung: ${rl.qty}x ${rl.name} (${data.reason}).${data.carrier ? ` Via ${data.carrier}${data.trackingId ? ` (${data.trackingId})` : ''}` : ''}`
      ).join('\n');

      setTickets(prevTickets => prevTickets.map(ticket => {
          if (ticket.status !== 'Open') return ticket;
          const tHeader = receiptHeaders.find(h => h.batchId === ticket.receiptId);
          if (tHeader && tHeader.bestellNr === poId) {
              return {
                  ...ticket,
                  messages: [...ticket.messages, {
                      id: crypto.randomUUID(),
                      author: 'System',
                      text: `📦 Logistik Update:\n${returnMsg}`,
                      timestamp: Date.now() + 100,
                      type: 'system' as const
                  }]
              };
          }
          return ticket;
      }));
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex transition-colors duration-300 ${
          theme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 
          theme === 'soft' ? 'bg-[#F5F5F6] text-[#323338]' : 
          'bg-[#f8fafc] text-slate-900'
      }`}>
        
        <Sidebar 
          theme={theme}
          activeModule={activeModule}
          onNavigate={handleNavigation}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mode={sidebarMode}
        />
        
        {sidebarOpen && (
          <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ${
           sidebarMode === 'slim' ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
         <Header 
            theme={theme}
            toggleTheme={toggleTheme}
            totalItems={inventory.length}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
         />

         <div className={`flex-1 ${activeModule === 'create-order' || activeModule === 'goods-receipt' ? 'overflow-hidden' : 'overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth'}`}>
            <div className={`mx-auto h-full ${activeModule === 'create-order' || activeModule === 'goods-receipt' ? '' : 'max-w-[1600px]'}`}>
                
                {activeModule === 'dashboard' && (
                  <Dashboard 
                    inventory={inventory}
                    logs={stockLogs}
                    theme={theme}
                    onAddStock={handleAddStock}
                    onNavigate={handleNavigation}
                    orders={purchaseOrders}
                    receipts={receiptMasters}
                    tickets={tickets}
                  />
                )}

                {activeModule === 'inventory' && (
                  <InventoryView 
                    key={viewKey}
                    inventory={inventory}
                    theme={theme}
                    viewMode={inventoryViewMode}
                    onUpdate={handleStockUpdate}
                    onUpdateItem={handleUpdateItem}
                    onCreateItem={handleCreateItem}
                    onAddStock={handleAddStock}
                    onLogStock={handleLogStock}
                  />
                )}

                {activeModule === 'stock-logs' && (
                    <StockLogView 
                        key={viewKey}
                        logs={stockLogs} 
                        onBack={() => handleNavigation('dashboard')} 
                        theme={theme} 
                    />
                )}

                {activeModule === 'goods-receipt' && (
                  <GoodsReceiptFlow 
                    theme={theme}
                    existingItems={inventory}
                    onClose={() => handleNavigation('receipt-management')}
                    onSuccess={handleReceiptSuccess}
                    // onLogStock removed to prevent double logging - handled in onSuccess
                    purchaseOrders={purchaseOrders}
                    initialPoId={selectedPoId}
                    initialMode={goodsReceiptMode} // Pass mode prop
                    receiptMasters={receiptMasters}
                    ticketConfig={ticketConfig}
                    onAddTicket={handleAddTicket}
                  />
                )}

                {activeModule === 'receipt-management' && (
                  <ReceiptManagement 
                    key={viewKey}
                    headers={receiptHeaders}
                    items={receiptItems}
                    comments={comments}
                    tickets={tickets}
                    purchaseOrders={purchaseOrders}
                    receiptMasters={receiptMasters}
                    stockItems={inventory}
                    theme={theme}
                    onUpdateStatus={handleReceiptStatusUpdate}
                    onAddComment={handleAddComment}
                    onAddTicket={handleAddTicket}
                    onUpdateTicket={handleUpdateTicket}
                    onReceiveGoods={handleReceiveGoods}
                    onNavigate={handleNavigation}
                    onRevertReceipt={handleRevertReceipt}
                    onProcessReturn={handleProcessReturn}
                    onInspect={(po, mode) => handleReceiveGoods(po.id, mode as 'standard' | 'return' | 'problem')} // Pass mode to handler
                    statusColumnFirst={statusColumnFirst}
                  />
                )}
                
                {activeModule === 'create-order' && (
                  <CreateOrderWizard 
                     theme={theme}
                     items={inventory}
                     onNavigate={handleNavigation}
                     onCreateOrder={handleCreateOrder}
                     initialOrder={orderToEdit}
                     requireDeliveryDate={requireDeliveryDate}
                     enableSmartImport={enableSmartImport}
                  />
                )}

                {activeModule === 'order-management' && (
                  <OrderManagement 
                     key={viewKey}
                     orders={purchaseOrders}
                     theme={theme}
                     onArchive={handleArchiveOrder}
                     onEdit={handleEditOrder}
                     onReceiveGoods={handleReceiveGoods}
                     onQuickReceipt={handleQuickReceipt}
                     onCancelOrder={handleCancelOrder}
                     onUpdateOrder={handleUpdateOrder}
                     receiptMasters={receiptMasters}
                     onNavigate={handleNavigation}
                     tickets={tickets}
                     statusColumnFirst={statusColumnFirst}
                  />
                )}

                {activeModule === 'suppliers' && (
                  <SupplierView 
                    receipts={receiptMasters}
                    headers={receiptHeaders}
                    orders={purchaseOrders}
                    theme={theme}
                  />
                )}

                {activeModule === 'settings' && (
                  <SettingsPage 
                    theme={theme}
                    onSetTheme={(t) => setTheme(t)}
                    onNavigate={handleNavigation}
                    onUploadData={(newItems) => setInventory(newItems)}
                    onClearData={() => setInventory(MOCK_ITEMS)}
                    hasCustomData={inventory !== MOCK_ITEMS}
                    sidebarMode={sidebarMode}
                    onSetSidebarMode={handleSetSidebarMode}
                    inventoryViewMode={inventoryViewMode}
                    onSetInventoryViewMode={handleSetInventoryViewMode}
                  />
                )}

          

                {activeModule === 'global-settings' && (
                  <GlobalSettingsPage
                    theme={theme}
                    onNavigate={handleNavigation}
                    statusColumnFirst={statusColumnFirst}
                    onSetStatusColumnFirst={handleSetStatusColumnFirst}
                    enableSmartImport={enableSmartImport}
                    onSetEnableSmartImport={handleSetEnableSmartImport}
                    requireDeliveryDate={requireDeliveryDate}
                    onSetRequireDeliveryDate={handleSetRequireDeliveryDate}
                    ticketConfig={ticketConfig}
                    onSetTicketConfig={handleSetTicketConfig}
                    auditTrail={auditTrail}
                  />
                )}

                {activeModule === 'documentation' && (
                  <DocumentationPage 
                    theme={theme}
                    onBack={() => handleNavigation('settings')}
                  />
                )}

                {activeModule === 'debug' && (
                  <LogicInspector 
                    orders={purchaseOrders}
                    receiptMasters={receiptMasters}
                    onBack={() => handleNavigation('settings')}
                    theme={theme}
                  />
                )}

            </div>
         </div>
      </main>
    </div>
        </ErrorBoundary>
  );
}