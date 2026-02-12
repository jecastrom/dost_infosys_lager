import React, { useState, useEffect } from 'react';
import { 
  MOCK_ITEMS, MOCK_RECEIPT_HEADERS, MOCK_RECEIPT_ITEMS, MOCK_COMMENTS, 
  MOCK_PURCHASE_ORDERS, MOCK_RECEIPT_MASTERS, MOCK_TICKETS 
} from './data';
import { 
  StockItem, ReceiptHeader, ReceiptItem, ReceiptComment, ViewMode, Theme, 
  ActiveModule, PurchaseOrder, ReceiptMaster, Ticket, DeliveryLog, StockLog, ReceiptMasterStatus 
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
              Die Anwendung ist auf einen unerwarteten Fehler gestoÃŸen. Bitte laden Sie die Seite neu.
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
  
  // Transient State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [goodsReceiptMode, setGoodsReceiptMode] = useState<'standard' | 'return'>('standard');
  const [orderToEdit, setOrderToEdit] = useState<PurchaseOrder | null>(null);

  // Toggle Theme
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
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
    setReceiptHeaders(prev => prev.map(h => h.batchId === batchId ? { ...h, status: newStatus } : h));
  };

  const handleAddComment = (batchId: string, type: 'note' | 'email' | 'call', message: string) => {
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
    setTickets(prev => [...prev, ticket]);
  };

  const handleUpdateTicket = (ticket: Ticket) => {
    setTickets(prev => prev.map(t => t.id === ticket.id ? ticket : t));
  };

  const handleCreateOrder = (order: PurchaseOrder) => {
    setPurchaseOrders(prev => {
        // Upsert Logic: Check if ID exists
        const exists = prev.some(o => o.id === order.id);
        
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
    setPurchaseOrders(prev => prev.map(o => o.id === id ? { ...o, isArchived: true } : o));
  };

  const handleCancelOrder = (id: string) => {
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

  const handleReceiveGoods = (poId: string, mode: 'standard' | 'return' = 'standard') => {
    setSelectedPoId(poId);
    setGoodsReceiptMode(mode);
    handleNavigation('goods-receipt');
  };

  const handleQuickReceipt = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const batchId = `b-${Date.now()}`;
    const timestamp = Date.now();

    const newHeader: ReceiptHeader = {
      batchId,
      lieferscheinNr: 'Ausstehend',
      bestellNr: po.id,
      lieferdatum: new Date().toISOString().split('T')[0],
      lieferant: po.supplier,
      status: 'In PrÃ¼fung',
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
             const isErrorStatus = ['Abgelehnt', 'Schaden', 'Schaden + Falsch', 'Falsch geliefert', 'BeschÃ¤digt'].includes(finalReceiptStatus);
             
             if (!isErrorStatus) {
                 if (forceClose) {
                     // FORCE CLOSE: Treat as 'Gebucht' regardless of math
                     finalReceiptStatus = 'Gebucht'; 
                 } else if (totalReceivedIncludingCurrent > totalOrdered) {
                     finalReceiptStatus = 'Ãœbermenge'; // Fixed form ÃƒÅ“bermenge
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
                    const previous = poItem ? poItem.quantityReceived : 0;
                    
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
            `RÃ¼cksendung: ${c.quantityRejected}x ${c.item.name} (${c.rejectionReason || 'Sonstiges'}). ` +
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

    handleNavigation('receipt-management');
  };

  const handleRevertReceipt = (batchId: string) => {
      const header = receiptHeaders.find(h => h.batchId === batchId);
      if (!header) return;

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

      setReceiptHeaders(prev => prev.map(h => h.batchId === batchId ? { ...h, status: 'In PrÃ¼fung' } : h));
      
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

         <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
            <div className="max-w-[1600px] mx-auto h-full">
                
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
                    onClose={() => handleNavigation('dashboard')}
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
                    onInspect={(po, mode) => handleReceiveGoods(po.id, mode as 'standard' | 'return')} // Pass mode to handler
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
                    requireDeliveryDate={requireDeliveryDate}
                    onSetRequireDeliveryDate={handleSetRequireDeliveryDate}
                    enableSmartImport={enableSmartImport}
                    onSetEnableSmartImport={handleSetEnableSmartImport}
                    ticketConfig={ticketConfig}
                    onSetTicketConfig={handleSetTicketConfig}
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