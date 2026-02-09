
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, Send, User, X, AlertCircle, CheckCircle2, Unlock, Lock, 
  MessageSquare, MoreVertical, Calendar, Truck, FileText, Search,
  Paperclip, Clock, ChevronDown, ChevronUp, ChevronRight
} from 'lucide-react';
import { Ticket, TicketPriority, Theme, TicketMessage, ReceiptHeader, PurchaseOrder } from '../types';

// --- Helper: New Ticket Modal ---
const NewTicketModal = ({ isOpen, onClose, onSave, theme }: { isOpen: boolean, onClose: () => void, onSave: (subject: string, priority: TicketPriority, description: string) => void, theme: Theme }) => {
    const [subject, setSubject] = useState('');
    const [priority, setPriority] = useState<TicketPriority>('Normal');
    const [description, setDescription] = useState('');
    const isDark = theme === 'dark';

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!subject || !description) return;
        onSave(subject, priority, description);
        setSubject('');
        setPriority('Normal');
        setDescription('');
    };

    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                <div className={`p-5 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <AlertCircle size={20} className="text-[#0077B5]" /> Neuen Fall melden
                    </h3>
                    <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Betreff <span className="text-red-500">*</span></label>
                        <input 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="z.B. Ware beschädigt, Falsche Menge..."
                            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Priorität</label>
                        <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TicketPriority)}
                            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition-all font-medium ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        >
                            <option value="Normal">Normal</option>
                            <option value="High">Hoch (High)</option>
                            <option value="Urgent">Dringend (Urgent)</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Beschreibung <span className="text-red-500">*</span></label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Bitte beschreiben Sie das Problem detailliert..."
                            className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/30 min-h-[120px] resize-none transition-all ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                        />
                    </div>
                </div>

                <div className={`p-5 border-t flex justify-end gap-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button 
                        onClick={onClose}
                        className={`px-5 py-2.5 rounded-xl font-bold transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                    >
                        Abbrechen
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!subject || !description}
                        className="px-5 py-2.5 bg-[#0077B5] hover:bg-[#00A0DC] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                    >
                        <CheckCircle2 size={18} /> Fall erstellen
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

interface TicketSystemProps {
  receiptId: string;
  tickets: Ticket[];
  onAddTicket: (ticket: Ticket) => void;
  onUpdateTicket: (ticket: Ticket) => void;
  theme: Theme;
  receiptHeader?: ReceiptHeader;
  linkedPO?: PurchaseOrder;
}

export const TicketSystem: React.FC<TicketSystemProps> = ({ 
  receiptId, 
  tickets, 
  onAddTicket, 
  onUpdateTicket, 
  theme,
  receiptHeader,
  linkedPO
}) => {
  const isDark = theme === 'dark';
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Date Grouping & UI State
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [showSendOptions, setShowSendOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sendMenuRef = useRef<HTMLDivElement>(null);

  // Responsive: Auto-select first ticket ONLY on desktop if none selected
  useEffect(() => {
    if (!expandedTicketId && tickets.length > 0 && window.innerWidth >= 768) {
        setExpandedTicketId(tickets[0].id);
    }
  }, [tickets]); 

  // Reset states when switching tickets
  useEffect(() => {
      setReplyText('');
      setCollapsedDates(new Set());
      setShowSendOptions(false);
  }, [expandedTicketId]);

  // Handle outside click for send menu
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (sendMenuRef.current && !sendMenuRef.current.contains(event.target as Node)) {
              setShowSendOptions(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTicket = useMemo(() => tickets.find(t => t.id === expandedTicketId), [tickets, expandedTicketId]);

  // Group messages by date
  const groupedMessages = useMemo<Record<string, TicketMessage[]>>(() => {
      if (!selectedTicket) return {};
      const groups: Record<string, TicketMessage[]> = {};
      
      // Sort messages just in case
      const sorted = [...selectedTicket.messages].sort((a,b) => a.timestamp - b.timestamp);
      
      sorted.forEach(msg => {
          const date = new Date(msg.timestamp);
          const key = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
          if (!groups[key]) groups[key] = [];
          groups[key].push(msg);
      });
      
      return groups;
  }, [selectedTicket]);

  const getDateLabel = (dateStr: string) => {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Heute';
      if (date.toDateString() === yesterday.toDateString()) return 'Gestern';
      
      return date.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status: string, priority: string) => {
      const isClosed = status === 'Closed';
      const isUrgent = priority === 'High' || priority === 'Urgent';

      if (isClosed) {
          return isDark 
            ? 'bg-gray-800 text-gray-300 border border-gray-700' 
            : 'bg-gray-100 text-gray-600 border-gray-200';
      }
      
      if (isUrgent) {
          return isDark 
            ? 'bg-red-900/30 text-red-200 border border-red-800' 
            : 'bg-red-100 text-red-700 border-red-200';
      }

      // Normal/Open
      return isDark 
        ? 'bg-emerald-900/30 text-emerald-200 border border-emerald-800' 
        : 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const toggleDateCollapse = (dateKey: string) => {
      setCollapsedDates(prev => {
          const next = new Set(prev);
          if (next.has(dateKey)) next.delete(dateKey);
          else next.add(dateKey);
          return next;
      });
  };

  // Scroll to bottom on new message
  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
      if(selectedTicket) scrollToBottom();
  }, [selectedTicket?.messages]);

  const handleSaveNewTicket = (subject: string, priority: TicketPriority, description: string) => {
      const newTicket: Ticket = {
          id: crypto.randomUUID(),
          receiptId: receiptId,
          subject,
          priority,
          status: 'Open',
          messages: [{
              id: crypto.randomUUID(),
              author: 'Admin User',
              text: description,
              timestamp: Date.now(),
              type: 'user'
          }]
      };
      
      onAddTicket(newTicket);
      setShowNewTicketModal(false);
      setExpandedTicketId(newTicket.id);
  };

  const handleReopenTicket = (ticket: Ticket) => {
      onUpdateTicket({
          ...ticket,
          status: 'Open',
          messages: [...ticket.messages, {
              id: crypto.randomUUID(),
              author: 'System',
              text: 'Fall wurde wiedereröffnet.',
              timestamp: Date.now(),
              type: 'system'
          }]
      });
  };

  const handleReplyTicket = (ticket: Ticket, shouldClose: boolean) => {
      const text = replyText.trim();
      
      if (!shouldClose && !text) return;
      
      let messages = [...ticket.messages];

      if (text) {
          messages.push({
              id: crypto.randomUUID(),
              author: 'Admin User',
              text: text,
              timestamp: Date.now(),
              type: 'user'
          });
      }

      if (shouldClose) {
          messages.push({
              id: crypto.randomUUID(),
              author: 'System',
              text: 'Fall wurde geschlossen.',
              timestamp: Date.now() + (text ? 1 : 0),
              type: 'system'
          });
      }

      const updatedTicket: Ticket = {
          ...ticket,
          messages,
          status: shouldClose ? 'Closed' : ticket.status
      };

      onUpdateTicket(updatedTicket);
      setReplyText('');
      setShowSendOptions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (replyText.trim() && selectedTicket) {
              handleReplyTicket(selectedTicket, false);
          }
      }
  };

  // --- Layout Classes ---
  const containerClass = `flex flex-col h-full ${isDark ? 'bg-[#0b1120]' : 'bg-gray-50'}`;
  
  const topBarClass = `flex-none h-10 border-b flex items-center px-4 gap-4 shadow-sm z-10 ${
      isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'
  }`;

  const splitViewClass = `flex-1 flex overflow-hidden`;

  const listColumnClass = `w-full md:w-80 flex flex-col border-r ${
      isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
  } ${selectedTicket ? 'hidden md:flex' : 'flex'}`;

  const chatColumnClass = `flex-1 flex flex-col min-w-0 ${
      isDark ? 'bg-[#0f172a]' : 'bg-gray-50'
  } ${selectedTicket ? 'flex' : 'hidden md:flex'}`;

  return (
    <div className={containerClass}>
        
        {/* 1. Top Context Bar */}
        <div className={topBarClass}>
            {linkedPO ? (
                <>
                    <div className="flex items-center gap-2">
                        <FileText size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            PO: {linkedPO.id}
                        </span>
                    </div>
                    <div className={`w-px h-3 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                    <div className="flex items-center gap-2">
                        <Truck size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {linkedPO.supplier}
                        </span>
                    </div>
                </>
            ) : receiptHeader ? (
                <div className="flex items-center gap-2">
                    <Truck size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Lieferung: {receiptHeader.lieferscheinNr}
                    </span>
                </div>
            ) : (
                <span className="text-xs italic opacity-50">Keine Kontextdaten verfügbar</span>
            )}

            {receiptHeader && (
                <div className="ml-auto flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        receiptHeader.status === 'Offen' ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700') :
                        receiptHeader.status === 'Teillieferung' ? (isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700') :
                        (isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600')
                    }`}>
                        {receiptHeader.status}
                    </span>
                </div>
            )}
        </div>

        {/* 2. Split View Area */}
        <div className={splitViewClass}>
            
            {/* Left Column: Ticket List */}
            <div className={listColumnClass}>
                <div className={`p-3 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Tickets ({tickets.length})
                    </h3>
                    <button 
                        onClick={() => setShowNewTicketModal(true)}
                        className={`p-1.5 rounded-lg transition-all ${
                            isDark 
                            ? 'bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20' 
                            : 'bg-[#0077B5] text-white hover:bg-[#00A0DC] shadow-sm'
                        }`}
                        title="Neues Ticket"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {tickets.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-center opacity-50 p-4">
                            <MessageSquare size={24} className="mb-2 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Keine Tickets vorhanden</span>
                        </div>
                    ) : (
                        tickets.map(ticket => {
                            const isActive = expandedTicketId === ticket.id;
                            const lastMsg = ticket.messages[ticket.messages.length - 1];
                            return (
                                <button
                                    key={ticket.id}
                                    onClick={() => setExpandedTicketId(ticket.id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                                        isActive
                                        ? (isDark ? 'bg-blue-900/20 border-blue-500/50' : 'bg-blue-50 border-blue-200')
                                        : (isDark ? 'bg-transparent border-transparent hover:bg-slate-800' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200')
                                    }`}
                                >
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0077B5]" />}
                                    
                                    <div className="flex justify-between items-start mb-1 pl-1">
                                        <span className={`font-bold text-sm truncate pr-2 ${
                                            isActive 
                                            ? (isDark ? 'text-blue-400' : 'text-[#0077B5]') 
                                            : (isDark ? 'text-slate-200' : 'text-slate-900')
                                        }`}>
                                            {ticket.subject}
                                        </span>
                                        <span className={`text-[10px] whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {new Date(lastMsg?.timestamp || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <p className={`text-xs truncate pl-1 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {lastMsg ? lastMsg.text : 'Keine Nachrichten'}
                                    </p>

                                    <div className="flex items-center gap-2 pl-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${getStatusColor(ticket.status, ticket.priority)}`}>
                                            {ticket.status === 'Closed' ? 'Erledigt' : ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'Priorität' : 'Offen'}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Column: Chat Detail */}
            <div className={chatColumnClass}>
                {selectedTicket ? (
                    <>
                        {/* Chat Header - Compact Row Layout */}
                        <div className={`flex-none p-3 border-b flex items-center justify-between gap-3 ${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className="flex items-center gap-3 min-w-0">
                                <h2 className={`text-base font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {selectedTicket.subject}
                                </h2>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {new Date(selectedTicket.messages[0].timestamp).toLocaleDateString()}
                                </span>
                                
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(selectedTicket.status, selectedTicket.priority)}`}>
                                    {selectedTicket.status === 'Closed' ? 'Erledigt' : 'Offen'}
                                </span>

                                <button 
                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                                    onClick={() => {
                                        if (selectedTicket.status === 'Closed') {
                                            handleReopenTicket(selectedTicket);
                                        } else {
                                            // Handle menu logic here if needed
                                        }
                                    }}
                                    title={selectedTicket.status === 'Closed' ? "Wiedereröffnen" : "Aktionen"}
                                >
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {(Object.entries(groupedMessages) as [string, TicketMessage[]][]).map(([dateKey, messages]) => {
                                const isCollapsed = collapsedDates.has(dateKey);
                                
                                return (
                                    <div key={dateKey} className="relative">
                                        
                                        {/* Sticky Date Header */}
                                        <div 
                                            className="sticky top-0 z-10 my-4 flex items-center gap-4 cursor-pointer group select-none"
                                            onClick={() => toggleDateCollapse(dateKey)}
                                        >
                                            <div className={`h-px flex-1 transition-colors ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                                            <div className={`text-[10px] font-bold px-3 py-1 rounded-full border shadow-sm flex items-center gap-2 transition-all ${
                                                isDark 
                                                ? 'bg-[#1e293b] border-slate-700 text-slate-400' 
                                                : 'bg-white border-slate-200 text-slate-500'
                                            }`}>
                                                {getDateLabel(dateKey)}
                                                {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                                            </div>
                                            <div className={`h-px flex-1 transition-colors ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                                        </div>

                                        {/* Messages Group */}
                                        {!isCollapsed && (
                                            <div className="space-y-4 pb-2">
                                                {messages.map((msg, index) => {
                                                    const isSystem = msg.type === 'system' || msg.author === 'System';
                                                    const isMe = msg.type === 'user' && msg.author !== 'System';
                                                    const isFirst = index === 0;

                                                    if (isSystem) {
                                                        return (
                                                            <div key={msg.id} className="flex flex-col items-center my-2">
                                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                                    isFirst 
                                                                    ? (isDark ? 'bg-blue-900/20 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200')
                                                                    : (isDark ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200')
                                                                }`}>
                                                                    {isFirst ? 'Automatische Nachricht' : 'System'}
                                                                </span>
                                                                <p className={`mt-2 text-xs text-center max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                    {msg.text}
                                                                </p>
                                                                <span className={`mt-1 text-[10px] font-mono opacity-50 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </span>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                            <div className="flex items-end gap-2 max-w-[85%]">
                                                                {!isMe && (
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
                                                                        <User size={14} />
                                                                    </div>
                                                                )}
                                                                
                                                                <div className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                                                                    isMe 
                                                                    ? 'bg-[#0077B5] text-white rounded-tr-none' 
                                                                    : (isDark ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none')
                                                                }`}>
                                                                    {msg.text}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className={`flex items-center gap-1 mt-1 text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'} ${isMe ? 'mr-1' : 'ml-11'}`}>
                                                                <span className="font-bold">{msg.author}</span>
                                                                <span>•</span>
                                                                <span className="font-mono">{new Date(msg.timestamp).toLocaleString(undefined, { hour: '2-digit', minute:'2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        {selectedTicket.status === 'Open' ? (
                            <div className={`flex-none p-4 border-t ${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className={`flex flex-col rounded-xl border focus-within:ring-2 focus-within:ring-[#0077B5]/30 transition-all ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                    <textarea 
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Schreiben Sie eine Antwort... (Ctrl+Enter zum Senden)"
                                        className={`w-full p-4 bg-transparent outline-none text-sm resize-none h-20 ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
                                    />
                                    <div className={`flex justify-between items-center px-2 pb-2`}>
                                        <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}>
                                            <Paperclip size={18} />
                                        </button>
                                        
                                        {/* SPLIT SEND BUTTON */}
                                        <div className="relative" ref={sendMenuRef}>
                                            <div className="flex shadow-md shadow-blue-500/20">
                                                <button 
                                                    onClick={() => handleReplyTicket(selectedTicket, false)}
                                                    disabled={!replyText.trim()}
                                                    className="px-4 py-2 rounded-l-full bg-[#0077B5] hover:bg-[#00A0DC] text-white text-xs font-bold disabled:opacity-50 disabled:bg-slate-500 transition-colors flex items-center gap-2 border-r border-blue-400/30"
                                                >
                                                    <Send size={14} /> Senden
                                                </button>
                                                <button 
                                                    onClick={() => setShowSendOptions(!showSendOptions)}
                                                    disabled={!replyText.trim()}
                                                    className="px-2 py-2 rounded-r-full bg-[#0077B5] hover:bg-[#00A0DC] text-white disabled:opacity-50 disabled:bg-slate-500 transition-colors"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>

                                            {showSendOptions && (
                                                <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-xl border shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                                    <button
                                                        onClick={() => handleReplyTicket(selectedTicket, true)}
                                                        className={`w-full text-left px-4 py-3 text-xs font-bold flex items-center gap-2 transition-colors ${
                                                            isDark ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <Lock size={14} /> Senden & Abschließen
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={`flex-none p-4 border-t text-center ${isDark ? 'bg-[#1e293b] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                <Lock size={20} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Dieser Fall ist geschlossen.
                                </p>
                                <button 
                                    onClick={() => handleReopenTicket(selectedTicket)}
                                    className="mt-1 text-[#0077B5] text-xs font-bold hover:underline"
                                >
                                    Fall wiedereröffnen
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
                        <div className={`p-6 rounded-full mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <MessageSquare size={48} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`font-bold text-xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kein Fall ausgewählt</h3>
                        <p className={`text-sm mt-2 max-w-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            Wählen Sie einen Fall aus der Liste links aus, um den Verlauf zu sehen.
                        </p>
                    </div>
                )}
            </div>
        </div>

        <NewTicketModal 
            isOpen={showNewTicketModal} 
            onClose={() => setShowNewTicketModal(false)} 
            onSave={handleSaveNewTicket}
            theme={theme}
        />
    </div>
  );
};
