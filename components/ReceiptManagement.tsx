import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Calendar, MapPin, Package, ChevronRight, 
  ArrowLeft, Mail, Phone, StickyNote, Send, Clock, User, X,
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp, FileText, Truck,
  BarChart3, Ban, Archive, Briefcase, Info, PackagePlus,
  AlertTriangle, Layers, XCircle, ClipboardCheck,
  Undo2, MessageSquare, AlertOctagon, Box, Lock, LogOut
} from 'lucide-react';
import { ReceiptHeader, ReceiptItem, Theme, ReceiptComment, Ticket, PurchaseOrder, ReceiptMaster, DeliveryLog, ActiveModule } from '../types';
import { TicketSystem } from './TicketSystem';

// --- INTERNAL COMPONENT: STATUS BADGES (SINGLE SOURCE OF TRUTH) ---
const ReceiptStatusBadges = ({ 
    header, 
    master, 
    linkedPO, 
    tickets, 
    theme 
}: { 
    header: ReceiptHeader, 
    master?: ReceiptMaster, 
    linkedPO?: PurchaseOrder, 
    tickets: Ticket[], 
    theme: Theme 
}) => {
    const isDark = theme === 'dark';
    const badges: React.ReactNode[] = [];
    
    // Determine effective status: Master takes precedence over Header (for grouped rows)
    let rawStatus = (master && master.status) ? master.status : header.status;

    // CRITICAL FIX: Default to 'Gebucht' if status is missing, empty, or a dash.
    // If a receipt exists here, it is booked by definition unless flagged otherwise.
    if (!rawStatus || String(rawStatus).trim() === '' || String(rawStatus).trim() === '-') {
        rawStatus = 'Gebucht';
    }

    const effectiveStatus = String(rawStatus).trim();
    
    // Normalize for robust comparison (Case Insensitive)
    const statusLower = effectiveStatus.toLowerCase();

    // --- BADGE 1: IDENTITY (SOURCE) ---
    // Rule: IF linkedPO?.status === 'Projekt' -> [PROJEKT]
    //       ELSE -> [LAGER]
    const isProject = linkedPO?.status === 'Projekt' || (header.bestellNr && header.bestellNr.toLowerCase().includes('projekt'));

    if (isProject) {
        badges.push(
            <span key="id-projekt" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                <Briefcase size={10} /> Projekt
            </span>
        );
    } else {
        badges.push(
            <span key="id-lager" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                <Box size={10} /> Lager
            </span>
        );
    }

    // --- BADGE 2: THE STATUS (MANDATORY) ---
    // Maps the 'effectiveStatus' string to a colored badge.
    
    if (statusLower === 'gebucht' || statusLower === 'abgeschlossen' || statusLower === 'in bearbeitung') {
        // Handle 'Gebucht' (Standard), 'Abgeschlossen' (Legacy), and 'In Bearbeitung' (Default) as Green Booked Badge
        badges.push(
            <span key="st-booked" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                Gebucht
            </span>
        );
    } else if (statusLower === 'in prüfung' || statusLower === 'wartet auf prüfung' || header.lieferscheinNr === 'Ausstehend') {
        badges.push(
            <span key="st-check" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${isDark ? 'bg-[#6264A7]/20 text-[#9ea0e6] border-[#6264A7]/40' : 'bg-[#6264A7]/10 text-[#6264A7] border-[#6264A7]/20'}`}>
                In Prüfung
            </span>
        );
    } else if (statusLower === 'schaden' || statusLower === 'beschädigt' || statusLower.includes('schaden')) {
        badges.push(
            <span key="st-damage" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'}`}>
                Schaden
            </span>
        );
    } else if (statusLower === 'abgelehnt') {
        badges.push(
            <span key="st-rejected" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'}`}>
                Abgelehnt
            </span>
        );
    } else if (statusLower === 'teillieferung' || statusLower.includes('teil')) {
        badges.push(
            <span key="st-partial" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                Teillieferung
            </span>
        );
    } else if (statusLower === 'übermenge' || statusLower === 'zu viel') {
        badges.push(
            <span key="st-over" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                Ãœbermenge
            </span>
        );
    } else if (statusLower === 'falsch geliefert') {
        badges.push(
            <span key="st-wrong" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                Falsch
            </span>
        );
    } else {
        // CATCH-ALL DEFAULT:
        // If status doesn't match any known case, display it as a generic gray badge.
        // This ensures NO status is ever invisible.
        if (effectiveStatus && effectiveStatus !== '-' && effectiveStatus !== 'null' && effectiveStatus !== 'undefined') {
            badges.push(
                <span key="st-generic" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {effectiveStatus}
                </span>
            );
        }
    }

    // --- BADGE 3: TICKETS (ISSUES) ---
    const openTickets = tickets.filter(t => t.status === 'Open').length;
    const closedTickets = tickets.filter(t => t.status === 'Closed').length;

    if (openTickets > 0) {
        badges.push(
            <span key="ticket-open" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider animate-pulse ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'}`}>
                <AlertOctagon size={10} /> Reklamation
            </span>
        );
    } else if (closedTickets > 0) {
        badges.push(
            <span key="ticket-solved" className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                <CheckCircle2 size={10} /> Fall gelÂ¶st
            </span>
        );
    }

    return <div className="flex flex-wrap items-center gap-2">{badges}</div>;
};

// --- HELPER: INSPECTION STATE LOGIC ---
const getInspectionState = (header: ReceiptHeader, po?: PurchaseOrder, master?: ReceiptMaster) => {
    // 1. Pending Check (Resume Inspection) - HIGHEST PRIORITY
    if (header.status === 'In Prüfung' || header.status === 'Wartet auf Prüfung' || header.lieferscheinNr === 'Ausstehend') {
        return { canInspect: true, label: 'Prüfung fortsetzen', style: 'primary' };
    }

    // 2. Next Delivery Check (Start NEW Receipt)
    if (po) {
        // A. Hard Blockers (Stop Logic)
        if (po.isForceClosed) return { canInspect: false, label: '', style: '' };
        if (po.status === 'Abgeschlossen') return { canInspect: false, label: '', style: '' };
        if (po.status === 'Storniert') return { canInspect: false, label: '', style: '' };

        // B. Math Check (Quantity)
        const totalOrdered = po.items.reduce((sum, i) => sum + i.quantityExpected, 0);
        let totalReceived = 0;
        
        if (master) {
             // Use Receipt Master (DB Truth)
             master.deliveries.forEach(d => {
                 d.items.forEach(i => {
                     // IMPORTANT: We count only quantityAccepted (Good Stock).
                     // If items were rejected (damaged, wrong), they are NOT counted here, 
                     // meaning the PO remains "open" for replacement.
                     if (po.items.some(pi => pi.sku === i.sku)) {
                         totalReceived += i.quantityAccepted; 
                     }
                 });
             });
        } else {
             // Fallback for legacy POs
             totalReceived = po.items.reduce((sum, i) => sum + i.quantityReceived, 0);
        }
        
        // Only allow "Next Delivery" if there is pending quantity (Ordered > Accepted)
        if (totalReceived < totalOrdered) {
            return { canInspect: true, label: 'Ersatz / Nachlieferung', style: 'secondary' };
        }
    }

    return { canInspect: false, label: '', style: '' };
};

interface ReceiptManagementProps {
  headers: ReceiptHeader[];
  items: ReceiptItem[];
  comments: ReceiptComment[];
  tickets: Ticket[];
  purchaseOrders: PurchaseOrder[];
  receiptMasters: ReceiptMaster[];
  theme: Theme;
  onUpdateStatus: (batchId: string, newStatus: string) => void;
  onAddComment: (batchId: string, type: 'note' | 'email' | 'call', message: string) => void;
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  onReceiveGoods: (poId: string) => void;
  onNavigate: (module: ActiveModule) => void;
  onRevertReceipt: (batchId: string) => void;
  onInspect: (po: PurchaseOrder, mode?: 'standard' | 'return') => void;
}

// Extended Type for Grouped Rows
type ReceiptListRow = ReceiptHeader & {
    isGroup?: boolean;
    deliveryCount?: number;
    masterStatus?: string;
    subHeaders?: ReceiptHeader[]; // For search reference
};

// Filter Types
type FilterStatus = 'all' | 'pending' | 'issues' | 'completed';

export const ReceiptManagement: React.FC<ReceiptManagementProps> = ({
  headers,
  items,
  comments,
  tickets,
  purchaseOrders,
  receiptMasters,
  theme,
  onUpdateStatus,
  onAddComment,
  onAddTicket,
  onUpdateTicket,
  onReceiveGoods,
  onNavigate,
  onRevertReceipt,
  onInspect
}) => {
  const isDark = theme === 'dark';
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  
  // -- Overview State --
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // -- Detail State --
  const [commentInput, setCommentInput] = useState('');
  const [commentType, setCommentType] = useState<'note' | 'email' | 'call'>('note');
  
  // Phase 4: Tabs & Tickets & Delivery History
  const [activeTab, setActiveTab] = useState<'items' | 'tickets'>('items');
  
  // Expanded Delivery Logs State
  const [expandedDeliveryId, setExpandedDeliveryId] = useState<string | null>(null);

  // New State: Delivery List Popover
  const [showDeliveryList, setShowDeliveryList] = useState(false);

  // Reset dropdown when changing selection
  useEffect(() => {
      setShowDeliveryList(false);
  }, [selectedBatchId]);

  // -- Detail View Hooks --
  const selectedHeader = useMemo(() => headers.find(h => h.batchId === selectedBatchId), [headers, selectedBatchId]);
  const relatedItems = useMemo(() => items.filter(i => i.batchId === selectedBatchId), [items, selectedBatchId]);
  const relatedComments = useMemo(() => comments.filter(c => c.batchId === selectedBatchId).sort((a,b) => b.timestamp - a.timestamp), [comments, selectedBatchId]);
  
  // Ticket Context Logic (All tickets for this PO, not just this receipt)
  const linkedPO = useMemo(() => {
      if (!selectedHeader?.bestellNr) return null;
      return purchaseOrders.find(po => po.id === selectedHeader.bestellNr);
  }, [selectedHeader, purchaseOrders]);

  const contextTickets = useMemo(() => {
      if (linkedPO) {
          // Find all tickets related to any receipt of this PO
          return tickets.filter(t => {
              const header = headers.find(h => h.batchId === t.receiptId);
              return header?.bestellNr === linkedPO.id;
          });
      }
      // Fallback: Tickets just for this receipt
      return tickets.filter(t => t.receiptId === selectedBatchId);
  }, [tickets, linkedPO, headers, selectedBatchId]);

  const openTicketsCount = contextTickets.filter(t => t.status === 'Open').length;
  const closedTicketsCount = contextTickets.filter(t => t.status === 'Closed').length;

  // Linked Receipt Master Logic (For Multi-Delivery View)
  const linkedMaster = useMemo(() => {
      if (!selectedHeader?.bestellNr) return null;
      return receiptMasters.find(m => m.poId === selectedHeader.bestellNr);
  }, [selectedHeader, receiptMasters]);

  // 1. Group Data Logic
  const groupedRows = useMemo(() => {
      const groups: Record<string, ReceiptHeader[]> = {};
      const singles: ReceiptHeader[] = [];

      const sortedHeaders = [...headers].sort((a, b) => b.timestamp - a.timestamp);

      sortedHeaders.forEach(h => {
          if (h.bestellNr) {
              if (!groups[h.bestellNr]) groups[h.bestellNr] = [];
              groups[h.bestellNr].push(h);
          } else {
              singles.push(h);
          }
      });

      const result: ReceiptListRow[] = [];

      Object.entries(groups).forEach(([poId, groupHeaders]) => {
          const latest = groupHeaders[0];
          const master = receiptMasters.find(m => m.poId === poId);
          const deliveryCount = groupHeaders.length;

          result.push({
              ...latest,
              isGroup: true,
              deliveryCount: deliveryCount,
              masterStatus: master ? master.status : latest.status,
              subHeaders: groupHeaders
          });
      });

      singles.forEach(h => {
          result.push({
              ...h,
              isGroup: false,
              deliveryCount: 1,
              masterStatus: h.status
          });
      });

      return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [headers, receiptMasters]);

  // --- FILTER HELPERS ---
  const getCategory = (row: ReceiptListRow): FilterStatus => {
      // Determine relevant tickets for this Row (Context-Aware)
      let rowTickets: Ticket[] = [];
      if (row.bestellNr) {
          // If part of a PO, check ALL tickets for that PO
          rowTickets = tickets.filter(t => {
               const h = headers.find(header => header.batchId === t.receiptId);
               return h?.bestellNr === row.bestellNr;
          });
      } else {
          // Single receipt
          rowTickets = tickets.filter(t => t.receiptId === row.batchId);
      }

      const hasOpenTickets = rowTickets.some(t => t.status === 'Open');
      const statusRaw = row.masterStatus || row.status || '';
      const s = statusRaw.toLowerCase().trim();

      // 1. ISSUES (Highest Priority)
      // Matches damage, rejection, wrong delivery, or open tickets
      if (hasOpenTickets) return 'issues';
      if (['schaden', 'abgelehnt', 'falsch', 'beschädigt'].some(k => s.includes(k))) return 'issues';

      // 2. COMPLETED
      // Matches Booked, Closed, or "In Bearbeitung" (Legacy Default)
      if (['gebucht', 'abgeschlossen', 'in bearbeitung', 'erledigt'].includes(s)) return 'completed';

      // 3. PENDING (Default Workload)
      // Matches In Prüfung, Partial, Overdelivery, Waiting, or Empty
      return 'pending';
  };

  // --- COUNTERS CALCULATION ---
  const categoryCounts = useMemo(() => {
      const counts = { all: 0, pending: 0, issues: 0, completed: 0 };
      groupedRows.forEach(row => {
          counts.all++;
          const cat = getCategory(row);
          if (counts[cat] !== undefined) counts[cat]++;
      });
      return counts;
  }, [groupedRows, tickets, headers]);

  // 2. Filter Logic
  const filteredRows = useMemo(() => {
    return groupedRows.filter(row => {
      // 1. Status Filter (Smart Categories)
      if (statusFilter !== 'all') {
          const category = getCategory(row);
          if (category !== statusFilter) return false;
      }

      // 2. Search Filter
      const term = searchTerm.toLowerCase();
      let matchesSearch = false;

      if (
          row.lieferscheinNr.toLowerCase().includes(term) ||
          row.lieferant.toLowerCase().includes(term) ||
          (row.bestellNr ? row.bestellNr.toLowerCase().includes(term) : false)
      ) {
          matchesSearch = true;
      }

      if (!matchesSearch && row.isGroup && row.subHeaders) {
          matchesSearch = row.subHeaders.some(sub => sub.lieferscheinNr.toLowerCase().includes(term));
      }
      
      if (!matchesSearch) return false;

      // 3. Date Filters
      if (dateFrom || dateTo) {
          const entryDate = new Date(row.timestamp).setHours(0,0,0,0);
          if (dateFrom) {
            const from = new Date(dateFrom).setHours(0,0,0,0);
            if (entryDate < from) return false;
          }
          if (dateTo) {
            const to = new Date(dateTo).setHours(0,0,0,0);
            if (entryDate > to) return false;
          }
      }

      // 4. User Filter
      if (filterUser) {
          const user = (row.createdByName || '').toLowerCase();
          if (!user.includes(filterUser.toLowerCase())) return false;
      }

      return true;
    });
  }, [groupedRows, searchTerm, statusFilter, dateFrom, dateTo, filterUser, tickets, headers]);

  // ... (Snapshot Logic Omitted - Same as before)
  const deliverySnapshots = useMemo(() => {
      if (!linkedMaster) return {};
      const snaps: Record<string, Record<string, { pre: number, current: number, post: number }>> = {};
      const running: Record<string, number> = {};
      const sortedDeliveries = [...linkedMaster.deliveries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      sortedDeliveries.forEach(d => {
          snaps[d.id] = {};
          d.items.forEach(item => {
              const pre = running[item.sku] || 0;
              const current = item.receivedQty;
              const post = pre + current;
              running[item.sku] = post;
              snaps[d.id][item.sku] = { pre, current, post };
          });
      });
      return snaps;
  }, [linkedMaster]);

  const canReceiveMore = useMemo(() => {
      if (!linkedPO) return false;
      if (linkedPO.status === 'Abgeschlossen' || linkedPO.status === 'Storniert') return false;
      if (linkedPO.isForceClosed) return false; 
      const hasRemaining = linkedPO.items.some(i => i.quantityReceived < i.quantityExpected);
      return hasRemaining;
  }, [linkedPO]);

  const visibleDeliveries = useMemo(() => {
      return linkedMaster ? linkedMaster.deliveries.filter(d => d.lieferscheinNr !== 'Ausstehend') : [];
  }, [linkedMaster]);

  useEffect(() => {
      if (visibleDeliveries.length === 1) {
          setExpandedDeliveryId(visibleDeliveries[0].id);
      }
  }, [visibleDeliveries, selectedBatchId]);

  // --- Handlers ---
  
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setFilterUser('');
  };

  const handleOpenDetail = (row: ReceiptListRow) => {
    setSelectedBatchId(row.batchId);
  };

  const handleBack = () => {
    setSelectedBatchId(null);
  };

  const handleForceClose = () => {
     if (!selectedBatchId) return;
     // Removed window.confirm to fix sandbox compatibility issue
     onUpdateStatus(selectedBatchId, 'Abgeschlossen');
  };

  const handleRevert = () => {
      if (!selectedBatchId) return;
      // Revert still uses confirm as it's a destructive action (removing stock).
      // Assuming sandbox issue was specific to 'Force Close' context, but safe to keep for now.
      if (window.confirm("Möchten Sie die Buchung stornieren? Der Lagerbestand wird entsprechend reduziert.")) {
          onRevertReceipt(selectedBatchId);
      }
  };

  const toggleDeliveryExpand = (id: string) => {
      setExpandedDeliveryId(prev => prev === id ? null : id);
  };

  const handleScrollToDelivery = (deliveryId: string) => {
      setShowDeliveryList(false);
      setExpandedDeliveryId(deliveryId);
      
      setTimeout(() => {
          const el = document.getElementById(`delivery-${deliveryId}`);
          if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }, 100);
  };

  const handlePostComment = () => {
      if (!selectedBatchId || !commentInput.trim()) return;
      onAddComment(selectedBatchId, commentType, commentInput);
      setCommentInput('');
  };

  // --- UI Components ---

  const FilterChip = ({ 
      label, 
      count, 
      active, 
      onClick, 
      type 
  }: { 
      label: string, 
      count: number, 
      active: boolean, 
      onClick: () => void, 
      type: 'neutral' | 'pending' | 'issue' | 'success' 
  }) => {
      // Define styles based on type and active state
      let activeClass = '';
      if (active) {
          switch (type) {
              case 'neutral': activeClass = 'bg-[#0077B5] text-white border-transparent shadow-md'; break;
              case 'pending': activeClass = 'bg-amber-500 text-white border-transparent shadow-md'; break;
              case 'issue': activeClass = 'bg-red-500 text-white border-transparent shadow-md'; break;
              case 'success': activeClass = 'bg-[#0077B5] text-white border-transparent shadow-md'; break;
          }
      } else {
          activeClass = isDark 
            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-400' 
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400';
      }

      return (
          <button
              onClick={onClick}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${activeClass}`}
          >
              {label}
              {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] min-w-[20px] text-center ${
                      active ? 'bg-white/20 text-white' : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500')
                  }`}>
                      {count}
                  </span>
              )}
          </button>
      );
  };

  // --- Helper Functions for Badges & Icons ---

  const getItemIssues = (item: ReceiptItem) => {
    const notes = item.issueNotes || '';
    const isWrong = notes.includes('FALSCH');
    const isRejected = notes.includes('ABGELEHNT') || notes.includes('abgewiesen');
    const isDamaged = !!item.isDamaged; 
    const wrongReason = isWrong ? notes.match(/FALSCH: (.*?)(?: \| |$)/)?.[1] : null;
    return { isDamaged, isWrong, isRejected, wrongReason };
  };

  const ItemStatusBadge = ({ item, quantityInfo }: { item?: ReceiptItem, quantityInfo?: { ordered: number, received: number } }) => {
    if (!item) return <span className="text-slate-400">-</span>;
    
    const { isDamaged, isWrong, isRejected, wrongReason } = getItemIssues(item);
    
    if (isDamaged && isWrong) {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200'}`}>
                <AlertTriangle size={10} /> Schaden + Falsch
            </span>
        );
    }
    if (isDamaged) {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200'}`}>
                <AlertTriangle size={10} /> Schaden
            </span>
        );
    }
    if (isWrong) {
        return (
            <span 
                title={wrongReason || 'Falsch geliefert'}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
            >
                <XCircle size={10} /> Falsch geliefert
            </span>
        );
    }
    if (isRejected) {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-50 text-red-600 border-red-200'}`}>
                <Ban size={10} /> Abgelehnt
            </span>
        );
    }
    
    if (quantityInfo) {
        const { ordered, received } = quantityInfo;
        if (received > ordered) {
             return (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                    <Info size={10} /> Überlieferung
                </span>
            );
        }
        if (received < ordered) {
             return (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    <AlertTriangle size={10} /> Teillieferung
                </span>
            );
        }
    }
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
            <CheckCircle2 size={10} /> OK
        </span>
    );
  };

  const findReceiptItemForLog = (delivery: DeliveryLog, sku: string) => {
    const header = headers.find(h => 
        h.lieferscheinNr === delivery.lieferscheinNr && 
        (linkedMaster?.poId ? h.bestellNr === linkedMaster.poId : true)
    );
    if (!header) return undefined;
    return items.find(i => i.batchId === header.batchId && i.sku === sku);
  };

  const renderItemStatusIconForPO = (
      ordered: number, 
      received: number, 
      hasIssues: boolean, 
      isForceClosed?: boolean,
      isProject?: boolean,
      isMasterClosed?: boolean
  ) => {
      // Priority 1: Issues (Damage, etc.)
      if (hasIssues) {
           return (<div className="flex justify-center" title="Probleme gemeldet"><AlertTriangle size={18} className="text-red-500" /></div>);
      }

      const isShort = received < ordered;
      const isOver = received > ordered;
      const isPerfect = ordered === received;

      // NEW LOGIC: Implicit Close via Project or Master Status (Gray Check)
      const isImplicitlyClosed = isProject || isMasterClosed || isForceClosed;

      if (isImplicitlyClosed && isShort) {
          return (
            <div className="flex justify-center" title="Abgeschlossen (Unterlieferung akzeptiert)">
                <CheckCircle2 size={18} className="text-slate-400" />
            </div>
          );
      }

      // Scenario C: Perfect -> Green Check
      if (isPerfect) {
          return (<div className="flex justify-center"><CheckCircle2 size={18} className="text-emerald-500" /></div>);
      }
      
      if (isOver) {
           return (<div className="flex justify-center" title="Überlieferung"><Info size={18} className="text-orange-500" /></div>);
      }

      // Scenario B: Active Short -> Warning
      return (<div className="flex justify-center" title="Mengenabweichung"><AlertTriangle size={18} className="text-amber-500" /></div>);
  };

  // --- ACTIONS RENDERER (Shared for both layouts) ---
  const renderActions = (inspectionState?: { canInspect: boolean, label: string, style: string }, po?: PurchaseOrder) => (
      <>
        {/* SMART INSPECT BUTTON (Standard / Replacement) */}
        {inspectionState?.canInspect && po && (
            <button
                onClick={(e) => { e.stopPropagation(); onInspect(po, 'standard'); }}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border transition-all ${
                    inspectionState.style === 'primary' 
                    ? (isDark ? 'bg-blue-900/20 text-blue-400 border-blue-500/30 hover:bg-blue-900/40' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100')
                    : (isDark ? 'border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-500/50' : 'border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300')
                }`}
                title={inspectionState.label}
            >
                <ClipboardCheck size={16} />
                <span className="hidden sm:inline text-xs font-bold">{inspectionState.label === 'Prüfung fortsetzen' ? 'PrÃ¼fen' : 'Ersatz / Nachlieferung'}</span>
            </button>
        )}

        {/* RETURN BUTTON (For ANY Issue or Overdelivery) */}
        {selectedHeader && ['Ãœbermenge', 'Zu viel', 'Schaden', 'BeschÃ¤digt', 'Falsch geliefert', 'Abgelehnt', 'Sonstiges'].some(s => selectedHeader.status.includes(s)) && po && !po.isForceClosed && (
             <button
                onClick={(e) => { e.stopPropagation(); onInspect(po, 'return'); }}
                className={`px-5 py-3 rounded-xl border flex items-center gap-2.5 font-bold text-sm transition-all shadow-sm ${
                    isDark 
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 hover:bg-orange-500/30' 
                    : 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                }`}
                title="Rücksendung erfassen (Korrektur)"
            >
                <LogOut size={14} /> 
                <span className="hidden sm:inline">Rücksendung</span>
            </button>
        )}

        

        {selectedHeader && selectedHeader.status !== 'Abgeschlossen' && (
            <button
                onClick={handleForceClose}
                className={`p-1.5 rounded-lg border transition-all ${
                    isDark 
                    ? 'border-slate-700 text-slate-400 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10' 
                    : 'border-slate-300 text-slate-500 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Abschließen"
            >
                <Archive size={16} />
            </button>
        )}
      </>
  );

  if (!selectedBatchId) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-2xl font-bold">Wareneingang Verwaltung</h2>
          <button
            onClick={() => onNavigate('goods-receipt')}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                isDark 
                 ? 'bg-[#0077B5] hover:bg-[#00A0DC] text-white shadow-blue-500/20' 
                 : 'bg-[#0077B5] hover:bg-[#00A0DC] text-white shadow-blue-500/20'
            }`}
          >
            <ClipboardCheck size={20} /> Lieferung prÃ¼fen
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Suche nach Lieferschein, Lieferant oder Bestell Nr..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full border rounded-xl pl-11 pr-4 py-3 text-base md:text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-100 focus:ring-blue-500/30' 
                    : 'bg-white border-slate-200 text-[#313335] focus:ring-[#0077B5]/20'
                }`}
              />
            </div>
            
            {/* SMART CHIP FILTERS */}
            <div className={`flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar p-1 rounded-xl max-w-full ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <FilterChip 
                    label="Alle" 
                    count={categoryCounts.all} 
                    active={statusFilter === 'all'} 
                    onClick={() => setStatusFilter('all')} 
                    type="neutral" 
                />
                <FilterChip 
                    label="In Arbeit" 
                    count={categoryCounts.pending} 
                    active={statusFilter === 'pending'} 
                    onClick={() => setStatusFilter('pending')} 
                    type="pending" 
                />
                <FilterChip 
                    label="Probleme" 
                    count={categoryCounts.issues} 
                    active={statusFilter === 'issues'} 
                    onClick={() => setStatusFilter('issues')} 
                    type="issue" 
                />
                <FilterChip 
                    label="Gebucht" 
                    count={categoryCounts.completed} 
                    active={statusFilter === 'completed'} 
                    onClick={() => setStatusFilter('completed')} 
                    type="success" 
                />
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 md:py-0 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                showFilters 
                   ? 'bg-[#0077B5] border-[#0077B5] text-white' 
                   : isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>

          {showFilters && (
            <div className={`p-5 rounded-2xl border animate-in slide-in-from-top-2 duration-200 ${
              isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Erweiterte Suche</h3>
                  {(dateFrom || dateTo || filterUser) && (
                    <button onClick={clearFilters} className="text-xs text-[#0077B5] font-bold hover:underline flex items-center gap-1">
                       Filter zurücksetzen <X size={12}/>
                    </button>
                  )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold text-slate-500">Zeitraum Von</label>
                   <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold text-slate-500">Zeitraum Bis</label>
                   <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={`w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`} />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] uppercase font-bold text-slate-500">Erfasst von (Benutzer)</label>
                   <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={filterUser} 
                        onChange={e => setFilterUser(e.target.value)} 
                        placeholder="Benutzername..." 
                        className={`w-full border rounded-xl pl-9 px-3 py-2 text-sm outline-none focus:ring-2 ${isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`} 
                      />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
           {/* MOBILE CARD VIEW */}
           <div className="md:hidden divide-y divide-slate-500/10">
             {filteredRows.length === 0 ? (
               <div className="p-8 text-center text-slate-500">
                 <Package size={32} className="mx-auto mb-3 opacity-30" />
                 <p>Keine Einträge gefunden</p>
               </div>
             ) : (
               filteredRows.map(row => {
                 const linkedPO = purchaseOrders.find(po => po.id === row.bestellNr);
                 const linkedMaster = receiptMasters.find(m => m.poId === row.bestellNr);
                 const deliveryCount = row.deliveryCount || 1;
                 const rowTickets = tickets.filter(t => t.receiptId === row.batchId);
                 const inspectionState = getInspectionState(row, linkedPO, linkedMaster);

                 return (
                   <div
                     key={row.batchId}
                     onClick={() => handleOpenDetail(row)}
                     className={`p-4 cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800 active:bg-slate-700' : 'hover:bg-slate-50 active:bg-slate-100'}`}
                   >
                     <div className="flex items-center gap-2 mb-3 flex-wrap">
                       <ReceiptStatusBadges header={row} master={linkedMaster} linkedPO={linkedPO} tickets={rowTickets} theme={theme} />
                     </div>
                     <div className="space-y-2 mb-3">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold uppercase text-slate-500">Bestell Nr.</span>
                         {row.isGroup ? (
                           <div className="flex items-center gap-2"><Layers size={14} className="text-[#0077B5]" /><span className="font-bold">{row.bestellNr}</span></div>
                         ) : (
                           <span className="font-mono font-bold">{row.bestellNr || '–'}</span>
                         )}
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold uppercase text-slate-500">Lieferschein</span>
                         <span className="font-medium">{deliveryCount > 1 ? <span className="italic opacity-80">Multiple ({deliveryCount})</span> : row.lieferscheinNr}</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold uppercase text-slate-500">Lieferant</span>
                         <span className="text-sm">{row.lieferant}</span>
                       </div>
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold uppercase text-slate-500">Aktualisiert</span>
                         <div className="text-xs text-right">
                           <div className="flex items-center gap-1.5 justify-end"><Calendar size={12}/>{new Date(row.timestamp).toLocaleDateString()}</div>
                           <div className="flex items-center gap-1.5 justify-end opacity-70 mt-0.5"><User size={12}/>{row.createdByName || 'Unbekannt'}</div>
                         </div>
                       </div>
                       {linkedPO?.pdfUrl && (
                         <div className="flex items-center justify-between">
                           <span className="text-xs font-bold uppercase text-slate-500">Bestätigung</span>
                           <CheckCircle2 size={16} className="text-emerald-500" />
                         </div>
                       )}
                     </div>
                     {(inspectionState?.canInspect || (row.status && ['Übermenge', 'Zu viel', 'Schaden', 'Beschädigt', 'Falsch geliefert', 'Abgelehnt', 'Sonstiges'].some(s => row.status.includes(s)))) && (
                       <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                         {renderActions(inspectionState, linkedPO)}
                       </div>
                     )}
                     <div className="flex justify-end mt-2"><ChevronRight size={18} className="text-slate-400" /></div>
                   </div>
                 );
               })
             )}
           </div>

           {/* DESKTOP TABLE VIEW */}
           <div className="hidden md:block overflow-x-auto">
             <table className="w-full text-left text-sm min-w-[1000px]">
               <thead className={`border-b ${isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                 <tr>
                   <th className="p-4 font-semibold">Status</th>
                   <th className="p-4 font-semibold">Bestell Nr.</th>
                   <th className="p-4 font-semibold text-center">Bestellbestätigung</th>
                   <th className="p-4 font-semibold">Lieferschein</th>
                   <th className="p-4 font-semibold">Lieferant</th>
                   <th className="p-4 font-semibold">Aktualisiert am / von</th>
                   <th className="p-4 font-semibold text-right"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-500/10">
                  {filteredRows.map(row => {
                    const linkedPO = purchaseOrders.find(po => po.id === row.bestellNr);
                    const linkedMaster = receiptMasters.find(m => m.poId === row.bestellNr);
                    const deliveryCount = row.deliveryCount || 1;
                    const rowTickets = tickets.filter(t => t.receiptId === row.batchId);
                    
                    const inspectionState = getInspectionState(row, linkedPO, linkedMaster);

                    return (
                    <tr 
                      key={row.batchId} 
                      onClick={() => handleOpenDetail(row)}
                      className={`cursor-pointer transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                    >
                      <td className="p-4">
                        {/* USE CONSISTENT BADGE COMPONENT */}
                        <ReceiptStatusBadges 
                            header={row}
                            master={linkedMaster} 
                            linkedPO={linkedPO} 
                            tickets={rowTickets}
                            theme={theme}
                        />
                      </td>
                      <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                          {row.isGroup ? (
                              <div className="flex items-center gap-2">
                                  <Layers size={14} className="text-[#0077B5]" />
                                  <span className="font-bold">{row.bestellNr}</span>
                              </div>
                          ) : (
                              row.bestellNr || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'
                          )}
                      </td>
                      <td className="p-4 text-center">
                        {linkedPO?.pdfUrl ? (
                           <div className="flex justify-center" title="Bestätigung vorhanden">
                             <CheckCircle2 size={18} className="text-emerald-500" />
                           </div>
                        ) : (
                           <div className="flex justify-center opacity-30" title="Keine Bestätigung">
                             <Ban size={18} className="text-slate-500" />
                           </div>
                        )}
                      </td>

                      <td className="p-4 font-medium">
                          {deliveryCount > 1 ? (
                              <span className="italic opacity-80 flex items-center gap-1">
                                  Multiple ({deliveryCount})
                              </span>
                          ) : (
                              row.lieferscheinNr
                          )}
                      </td>
                      <td className="p-4 text-slate-500">{row.lieferant}</td>
                      <td className="p-4 text-slate-500">
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(row.timestamp).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5 mt-1 text-xs opacity-70"><User size={12}/> {row.createdByName || 'Unbekannt'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-slate-400 flex items-center justify-end gap-2">
                          {/* IN-ROW ACTIONS */}
                          {renderActions(inspectionState, linkedPO)}
                          <ChevronRight size={18} />
                      </td>
                    </tr>
                  )})}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-500">Keine Datensätze gefunden.</td>
                    </tr>
                  )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    );
  }

  if (!selectedHeader) return null;
  const detailInspectionState = getInspectionState(selectedHeader, linkedPO || undefined, linkedMaster || undefined);

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right-8 duration-300">
      
      {/* TOP NAVIGATION BAR - PERSISTENT */}
      <div className={`flex-none flex items-center gap-4 px-4 h-14 border-b z-20 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
          <button 
            onClick={handleBack} 
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
              <ArrowLeft size={18} /> <span className="hidden md:inline">Liste</span>
          </button>
          
          <div className="h-6 w-px bg-slate-500/20 mx-2"></div>
          
          {/* TAB PILLS - GMAIL STYLE */}
          <div className={`flex p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <button 
                  onClick={() => setActiveTab('items')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      activeTab === 'items' 
                      ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') 
                      : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                  }`}
              >
                  <Package size={14} />
                  Positionen
              </button>
              <button 
                  onClick={() => setActiveTab('tickets')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      activeTab === 'tickets' 
                      ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') 
                      : (isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                  }`}
              >
                  <MessageSquare size={14} />
                  Reklamationen
                  
                  {/* SPLIT STATUS BADGES */}
                  <div className="flex gap-1.5 ml-1">
                      {openTicketsCount > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                              isDark 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                              <AlertOctagon size={8} />
                              <span className="text-[9px] font-bold">{openTicketsCount} Offen</span>
                          </span>
                      )}
                      
                      {closedTicketsCount > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                              isDark 
                              ? 'bg-slate-800 text-slate-400 border-slate-700' 
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                              <CheckCircle2 size={8} />
                              <span className="text-[9px] font-bold">{closedTicketsCount} Erledigt</span>
                          </span>
                      )}
                  </div>
              </button>
          </div>

          {/* NEW CLOSE BUTTON */}
          <button 
            onClick={handleBack} 
            className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
            title="ZurÃ¼ck zur Ãœbersicht"
          >
              <span className="hidden md:inline">SchlieÃŸen</span>
              <X size={18} />
          </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        
        {/* ITEMS TAB CONTENT */}
        {activeTab === 'items' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
                
                {/* HEADER PANE - ONLY IN ITEMS VIEW */}
                <div className={`rounded-xl border flex flex-col p-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    
                    {/* Top Row: PO | Divider | LS  <---> Badges | Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Left Group */}
                        <div className="flex items-center gap-4">
                            {/* PO */}
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bestellung:</span>
                                <span className={`text-base font-bold font-mono ${selectedHeader.bestellNr ? (isDark ? 'text-white' : 'text-slate-900') : 'opacity-50 italic font-normal'}`}>
                                    {selectedHeader.bestellNr || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className={`h-4 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>

                            {/* LS Dropdown */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowDeliveryList(!showDeliveryList)}
                                    className={`flex items-center gap-1.5 text-sm font-bold transition-colors group ${
                                        isDark ? 'text-white hover:text-blue-400' : 'text-slate-900 hover:text-[#0077B5]'
                                    }`}
                                >
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>LS:</span>
                                    {selectedHeader.lieferscheinNr}
                                    <ChevronDown size={14} className={`opacity-50 transition-transform duration-200 ${showDeliveryList ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Popover */}
                                {showDeliveryList && (
                                    <div className={`absolute top-full left-0 mt-2 w-72 rounded-xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 ${
                                        isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'
                                    }`}>
                                        <div className={`p-3 border-b flex justify-between items-center ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Alle Lieferungen</span>
                                            <button onClick={() => setShowDeliveryList(false)} className="hover:bg-red-500/10 hover:text-red-500 p-1 rounded transition-colors"><X size={14}/></button>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {linkedMaster?.deliveries
                                                .filter(d => d.lieferscheinNr && d.lieferscheinNr !== 'Ausstehend' && d.lieferscheinNr !== 'Pending')
                                                .map((del, idx) => (
                                                <button 
                                                    key={del.id} 
                                                    onClick={() => handleScrollToDelivery(del.id)}
                                                    className={`w-full text-left p-3 border-b last:border-0 flex items-center gap-3 transition-colors ${
                                                    del.lieferscheinNr === selectedHeader.lieferscheinNr 
                                                        ? (isDark ? 'bg-[#0077B5]/10 hover:bg-[#0077B5]/20' : 'bg-[#0077B5]/5 hover:bg-[#0077B5]/10') 
                                                        : (isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50')
                                                }`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                        del.lieferscheinNr === selectedHeader.lieferscheinNr 
                                                            ? 'bg-[#0077B5] text-white' 
                                                            : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                                                    }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className={`text-sm font-bold ${
                                                            del.lieferscheinNr === selectedHeader.lieferscheinNr 
                                                                ? 'text-[#0077B5]' 
                                                                : (isDark ? 'text-slate-200' : 'text-slate-700')
                                                        }`}>
                                                            {del.lieferscheinNr}
                                                        </div>
                                                        <div className="text-[10px] opacity-60">
                                                            {new Date(del.date).toLocaleDateString()} â€¢ {del.items.length} Pos.
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                            {(!linkedMaster || linkedMaster.deliveries.filter(d => d.lieferscheinNr && d.lieferscheinNr !== 'Ausstehend' && d.lieferscheinNr !== 'Pending').length === 0) && (
                                                <div className="p-4 text-center text-xs opacity-50">Keine weiteren Lieferungen gefunden.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Group */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                             <div className="flex flex-wrap justify-end gap-1.5">
                                {/* USE CONSISTENT BADGE COMPONENT */}
                                <ReceiptStatusBadges 
                                    header={selectedHeader}
                                    master={linkedMaster} 
                                    linkedPO={linkedPO} 
                                    tickets={contextTickets}
                                    theme={theme}
                                />
                             </div>
                             <div className="flex gap-1">
                                {renderActions(detailInspectionState, linkedPO || undefined)}
                             </div>
                        </div>
                    </div>

                    {/* Bottom Row: Metadata */}
                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-2 pt-2 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                        <span className="font-medium flex items-center gap-1.5"><Truck size={12} className="text-[#0077B5]" /> {selectedHeader.lieferant}</span>
                        <span className="hidden sm:inline opacity-30">â€¢</span>
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(selectedHeader.timestamp).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {selectedHeader.warehouseLocation}</span>
                        <span className="flex items-center gap-1 ml-auto"><User size={12}/> {selectedHeader.createdByName || 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</span>
                    </div>
                </div>

                {/* CONTENT COLUMNS */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* PANE B: ITEM LIST & HISTORY (LEFT MAIN) */}
                    <div className="flex-[2] flex flex-col gap-6">
                        
                        {canReceiveMore && (
                            <div className={`p-4 rounded-xl border flex items-center justify-between shadow-sm animate-in slide-in-from-top-2 ${
                                isDark ? 'bg-[#6264A7]/10 border-[#6264A7]/20' : 'bg-[#6264A7]/5 border-[#6264A7]/20'
                            }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${isDark ? 'bg-[#6264A7]/20 text-[#9ea0e6]' : 'bg-[#6264A7]/10 text-[#6264A7]'}`}>
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${isDark ? 'text-[#9ea0e6]' : 'text-[#6264A7]'}`}>
                                            Bestellung noch offen
                                        </h4>
                                        <p className={`text-sm ${isDark ? 'text-[#9ea0e6]/70' : 'text-[#6264A7]/70'}`}>
                                            Es wurden noch nicht alle Artikel geliefert.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => linkedPO && onReceiveGoods(linkedPO.id)}
                                    className="px-4 py-2 bg-[#0077B5] hover:bg-[#00A0DC] text-white rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
                                >
                                    <PackagePlus size={18} />
                                    <span className="hidden sm:inline">Weitere Lieferung erfassen</span>
                                </button>
                            </div>
                        )}

                        {linkedPO && linkedMaster ? (
                            <>
                                {/* DISTINCT SUMMARY SECTION */}
                                <div className={`rounded-2xl border overflow-hidden shadow-lg ${
                                    isDark ? 'bg-[#1f2937] border-slate-700' : 'bg-white border-slate-300'
                                }`}>
                                    <div className={`p-4 border-b font-bold flex items-center gap-2 ${
                                        isDark ? 'bg-[#1f2937] border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700'
                                    }`}>
                                        <BarChart3 size={18} className="text-[#0077B5]" /> Bestell-Status (GesamtÃ¼bersicht)
                                    </div>
                                    {/* VERTICAL CARD LAYOUT - NO HORIZONTAL SCROLL */}
                                    <div className="divide-y divide-slate-500/10">
                                        {linkedPO.items.map(poItem => {
                                            const ordered = poItem.quantityExpected;
                                            const received = poItem.quantityReceived;
                                            const pending = Math.max(0, ordered - received);
                                            const over = Math.max(0, received - ordered);
                                            const hasIssues = linkedMaster.deliveries.some(d => d.items.some(di => di.sku === poItem.sku && di.damageFlag));
                                            const isProject = linkedPO.status === 'Projekt';
                                            const isMasterClosed = linkedMaster?.status === 'Gebucht' || linkedMaster?.status === 'Abgeschlossen';
                                            
                                            return (
                                                <div key={poItem.sku} className="p-4 space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm truncate">{poItem.name}</div>
                                                            <div className="text-[10px] font-mono opacity-50">{poItem.sku}</div>
                                                        </div>
                                                        {renderItemStatusIconForPO(ordered, received, hasIssues, linkedPO.isForceClosed, isProject, isMasterClosed)}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Bestellt</span>
                                                            <span className="font-mono font-bold opacity-70">{ordered}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Geliefert</span>
                                                            <span className="font-mono font-bold">{received}</span>
                                                        </div>
                                                        {pending > 0 && (
                                                            <div className="flex justify-between">
                                                                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1"><AlertTriangle size={10}/> Offen</span>
                                                                <span className="font-mono font-bold text-amber-500">{linkedPO.isForceClosed ? <span className="line-through text-slate-400">{pending}</span> : pending}</span>
                                                            </div>
                                                        )}
                                                        {over > 0 && (
                                                            <div className="flex justify-between">
                                                                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-500 flex items-center gap-1"><AlertTriangle size={10}/> Zu viel</span>
                                                                <span className="font-mono font-bold text-orange-500">+{over}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-4 px-1">
                                        <Clock size={18} className="text-slate-500" />
                                        <h3 className="font-bold text-lg">Lieferhistorie</h3>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {visibleDeliveries.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 border border-dashed rounded-xl">
                                                Noch keine physischen WareneingÃ¤nge verbucht.
                                            </div>
                                        ) : (
                                            visibleDeliveries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((delivery, index) => {
                                                const isExpanded = expandedDeliveryId === delivery.id;
                                                const isCurrent = delivery.lieferscheinNr === selectedHeader.lieferscheinNr;
                                                const snapshot = deliverySnapshots[delivery.id] || {};
                                                const isLatest = index === 0;

                                                return (
                                                    <div 
                                                        id={`delivery-${delivery.id}`}
                                                        key={delivery.id} 
                                                        className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                                                            isCurrent 
                                                                ? isDark ? 'border-[#0077B5] shadow-[0_0_15px_rgba(0,119,181,0.1)]' : 'border-[#0077B5] shadow-md ring-1 ring-[#0077B5]/20'
                                                                : isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                                                        }`}
                                                    >
                                                        <button 
                                                            onClick={() => toggleDeliveryExpand(delivery.id)}
                                                            className={`w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                                                isExpanded ? 'border-b border-slate-200 dark:border-slate-800' : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className={`p-2 rounded-lg ${isCurrent ? 'bg-[#0077B5] text-white' : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                                                                    <Truck size={20} />
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-sm flex items-center gap-2">
                                                                        Lieferschein: {delivery.lieferscheinNr}
                                                                        {isLatest && <span className="bg-[#0077B5] text-white text-[8px] px-1 py-0.5 rounded font-bold tracking-wider">LETZTE</span>}
                                                                    </div>
                                                                    <div className="text-xs opacity-60 flex flex-col gap-0.5 mt-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar size={12} /> {new Date(delivery.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                                        </div>
                                                                        {linkedPO && (
                                                                            <div className="flex items-center gap-2">
                                                                                <FileText size={12} /> VerknÃ¼pfte Bestellung: {linkedPO.id}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-sm font-bold opacity-70">{delivery.items.length} Positionen</span>
                                                                {isExpanded ? <ChevronUp size={20} className="opacity-50" /> : <ChevronDown size={20} className="opacity-50" />}
                                                            </div>
                                                        </button>

                                                        {isExpanded && (
                                                                <div className={`p-3 space-y-3 ${isDark ? 'bg-slate-950/30' : 'bg-slate-50/50'}`}>
                                                                    {delivery.items.map(dItem => {
                                                                        const poItem = linkedPO.items.find(pi => pi.sku === dItem.sku);
                                                                        const itemName = poItem ? poItem.name : dItem.sku;
                                                                        let ordered, previous, current, pending, over, totalReceived;
                                                                        if (dItem.orderedQty !== undefined) {
                                                                            ordered = dItem.orderedQty;
                                                                            previous = dItem.previousReceived || 0;
                                                                            current = dItem.receivedQty;
                                                                            pending = dItem.offen || 0;
                                                                            over = dItem.zuViel || 0;
                                                                            totalReceived = previous + current;
                                                                        } else {
                                                                            ordered = poItem ? poItem.quantityExpected : 0;
                                                                            const data = snapshot[dItem.sku] || { pre: 0, current: dItem.receivedQty, post: dItem.receivedQty };
                                                                            previous = data.pre;
                                                                            current = dItem.receivedQty;
                                                                            totalReceived = data.post;
                                                                            pending = Math.max(0, ordered - totalReceived);
                                                                            over = Math.max(0, totalReceived - ordered);
                                                                        }
                                                                        const fullItem = findReceiptItemForLog(delivery, dItem.sku);
                                                                        return (
                                                                            <div key={dItem.sku} className={`rounded-lg border p-3 space-y-2 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="font-bold text-sm truncate">{itemName}</div>
                                                                                        <div className="text-[10px] font-mono opacity-50">{dItem.sku}</div>
                                                                                        {dItem.manualAddFlag && (
                                                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border mt-1 ${isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                                                                                <AlertTriangle size={8} /> Manuell
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <ItemStatusBadge item={fullItem} quantityInfo={{ ordered, received: totalReceived }} />
                                                                                </div>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                                                                    {ordered > 0 && <div className="flex justify-between"><span className="text-[10px] uppercase font-bold opacity-40">Bestellt</span><span className="font-mono opacity-70">{ordered}</span></div>}
                                                                                    {previous > 0 && <div className="flex justify-between"><span className="text-[10px] uppercase font-bold opacity-40">Bisher</span><span className="font-mono opacity-50">{previous}</span></div>}
                                                                                    <div className="flex justify-between"><span className="text-[10px] uppercase font-bold opacity-40">Geliefert</span><span className="font-mono font-bold">{current > 0 ? `+${current}` : '0'}</span></div>
                                                                                    <div className="flex justify-between"><span className="text-[10px] uppercase font-bold opacity-40">Gesamt</span><span className="font-mono font-bold">{totalReceived}</span></div>
                                                                                    {pending > 0 && <div className="flex justify-between"><span className="text-[10px] uppercase font-bold text-amber-500">Offen</span><span className="font-mono font-bold text-amber-500">{pending}</span></div>}
                                                                                    {over > 0 && <div className="flex justify-between"><span className="text-[10px] uppercase font-bold text-orange-500">Zu viel</span><span className="font-mono font-bold text-orange-500">+{over}</span></div>}
                                                                                </div>
                                                                                {(dItem.returnCarrier || dItem.returnTrackingId) && (
                                                                                    <div className={`text-[11px] pl-2 border-l-2 ${isDark ? 'border-slate-600 text-slate-400' : 'border-slate-300 text-slate-500'}`}>
                                                                                        Rücksendung: {dItem.returnCarrier || 'Ã¢â‚¬â€œ'} Ã¢â‚¬â€œ Tracking: {dItem.returnTrackingId || 'Ã¢â‚¬â€œ'}
                                                                                        {dItem.rejectionReason && <span> Ã¢â‚¬â€œ Grund: {dItem.rejectionReason}</span>}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={`rounded-2xl border overflow-hidden flex flex-col min-h-[400px] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className={`p-4 border-b font-bold flex items-center gap-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                    <Package size={18} className="text-slate-500" /> Enthaltene Artikel
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <table className="w-full text-left text-sm min-w-[600px]">
                                        <thead className={`sticky top-0 backdrop-blur-md z-10 ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
                                        <tr className="text-slate-500">
                                            <th className="p-4 font-medium">Artikel</th>
                                            <th className="p-4 font-medium text-center">Menge</th>
                                            <th className="p-4 font-medium">Lagerort</th>
                                            <th className="p-4 font-medium w-40">Status</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-500/10">
                                        {relatedItems.map(item => (
                                            <tr key={item.id} className={isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                                                <td className="p-4">
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs font-mono opacity-60">{item.sku}</div>
                                                </td>
                                                <td className="p-4 text-center font-bold">
                                                    {item.quantity}
                                                </td>
                                                <td className="p-4 text-xs">{item.targetLocation}</td>
                                                <td className="p-4">
                                                    <ItemStatusBadge item={item} />
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PANE C: TRACEABILITY TIMELINE (RIGHT SIDE) */}
                    <div className={`flex-1 rounded-2xl border flex flex-col overflow-hidden min-h-[400px] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className={`p-4 border-b font-bold flex items-center gap-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <Clock size={18} className="text-slate-500" /> Historie & Notizen
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {relatedComments.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 text-sm italic">Keine EintrÃ¤ge vorhanden.</div>
                            ) : (
                            relatedComments.map(c => (
                                <div key={c.id} className="relative pl-6 border-l border-slate-500/20 last:border-0 pb-2">
                                <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                                }`}>
                                    {c.type === 'email' && <Mail size={12} className="text-blue-500" />}
                                    {c.type === 'call' && <Phone size={12} className="text-purple-500" />}
                                    {c.type === 'note' && <StickyNote size={12} className="text-amber-500" />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start text-xs">
                                        <span className="font-bold">{c.userName}</span>
                                        <span className="text-slate-500">{new Date(c.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className={`p-3 rounded-xl text-sm ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    {c.message}
                                    </div>
                                </div>
                                </div>
                            ))
                            )}
                        </div>

                        <div className={`p-4 border-t ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex gap-2 mb-2">
                                <TypeButton active={commentType === 'note'} icon={<StickyNote size={14} />} label="Notiz" onClick={() => setCommentType('note')} isDark={isDark} />
                                <TypeButton active={commentType === 'email'} icon={<Mail size={14} />} label="Email" onClick={() => setCommentType('email')} isDark={isDark} />
                                <TypeButton active={commentType === 'call'} icon={<Phone size={14} />} label="Tel." onClick={() => setCommentType('call')} isDark={isDark} />
                            </div>
                            <div className="flex gap-2 items-start">
                            <textarea 
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                placeholder="Neuer Eintrag..."
                                className={`flex-1 rounded-xl p-3 text-base md:text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-blue-500/20 border ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                            />
                            <button 
                                onClick={handlePostComment}
                                disabled={!commentInput.trim()}
                                className="self-end p-3 rounded-xl bg-[#0077B5] text-white hover:bg-[#00A0DC] disabled:opacity-50 disabled:bg-slate-500"
                            >
                                <Send size={18} />
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* TICKETS TAB CONTENT - FULL HEIGHT */}
        {activeTab === 'tickets' && (
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden min-h-0 h-full">
                <TicketSystem 
                    receiptId={selectedBatchId}
                    tickets={contextTickets} // Use context-aware tickets
                    onAddTicket={onAddTicket}
                    onUpdateTicket={onUpdateTicket}
                    theme={theme}
                    receiptHeader={selectedHeader}
                    linkedPO={linkedPO || undefined}
                />
            </div>
        )}

      </div>

    </div>
  );
};

const TypeButton = ({ active, icon, label, onClick, isDark }: { active: boolean, icon: any, label: string, onClick: () => void, isDark: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
      active 
        ? 'bg-[#0077B5] text-white border-[#0077B5]' 
        : isDark ? 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
    }`}
  >
    {icon} {label}
  </button>
);