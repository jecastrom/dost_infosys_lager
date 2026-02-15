import React, { useState } from 'react';
import { Theme } from '../types';
import { 
  ArrowLeft, Book, Code, Database, Layout, Layers, 
  GitBranch, Server, FileJson, ArrowRight, CheckCircle2, 
  XCircle, AlertTriangle, Cpu, Box, ShieldCheck, 
  Calculator, Activity, FileText, Truck, LogOut, 
  Lock cellulare, RefreshCw, Scale, Briefcase, Ban, Info, Globe
} from 'lucide-react';

interface DocumentationPageProps {
  theme: Theme;
  onBack: () => void;
}

type DocSection = 'intro' | 'datamodel' | 'logic' | 'workflows';
type Lang = 'de' | 'en';

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ theme, onBack }) => {
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState<DocSection>('intro');
  const [lang, setLang] = useState<Lang>('de');

  // --- UI HELPERS ---
  const NavItem = ({ id, label, icon }: { id: DocSection, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all mb-1 ${
        activeSection === id
          ? (isDark ? 'bg-[#0077B5] text-white shadow-lg shadow-blue-900/20' : 'bg-[#0077B5] text-white shadow-md')
          : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')
      }`}
    >
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </button>
  );

  const DocCard = ({ title, icon, children, className = '' }: { title: string, icon: React.ReactNode, children?: React.ReactNode, className?: string }) => (
    <div className={`p-6 rounded-2xl border flex flex-col h-full ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-[#0077B5]'}`}>
          {icon}
        </div>
        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
      </div>
      <div className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {children}
      </div>
    </div>
  );

  const TechBadge = ({ label }: { label: string }) => (
    <span className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold border uppercase ${
      isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
    }`}>
      {label}
    </span>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className={`flex-none p-6 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-[#0077B5]'}`}>
                <Book size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold">{lang === 'de' ? 'Entwickler Portal' : 'Developer Portal'}</h1>
                <p className="text-sm opacity-60">{lang === 'de' ? 'Systemarchitektur v0.2.2 & Technische Referenz' : 'System Architecture v0.2.2 & Technical Reference'}</p>
            </div>
        </div>
        <button 
            onClick={onBack}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'
            }`}
        >
            <div className="flex items-center gap-2">
                <ArrowLeft size={16} /> {lang === 'de' ? 'Schließen' : 'Close'}
            </div>
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <div className={`w-64 flex-none border-r p-4 flex flex-col ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            
            {/* Language Toggle */}
            <div className={`flex p-1 rounded-lg mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <button 
                    onClick={() => setLang('de')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                        lang === 'de' 
                        ? (isDark ? 'bg-slate-600 text-white shadow' : 'bg-white text-slate-800 shadow') 
                        : 'opacity-50 hover:opacity-100'
                    }`}
                >
                    DE
                </button>
                <button 
                    onClick={() => setLang('en')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                        lang === 'en' 
                        ? (isDark ? 'bg-slate-600 text-white shadow' : 'bg-white text-slate-800 shadow') 
                        : 'opacity-50 hover:opacity-100'
                    }`}
                >
                    EN
                </button>
            </div>

            <div className="space-y-6 overflow-y-auto flex-1">
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-3 px-4">Core Docs</div>
                    <NavItem id="intro" label={lang === 'de' ? "Einführung & Stack" : "Introduction & Stack"} icon={<Layout size={18} />} />
                    <NavItem id="datamodel" label={lang === 'de' ? "Daten-Modell" : "Data Model"} icon={<Database size={18} />} />
                </div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-3 px-4">Logic & Flow</div>
                    <NavItem id="logic" label={lang === 'de' ? "Geschäftslogik (Mathe)" : "Business Logic (Math)"} icon={<Calculator size={18} />} />
                    <NavItem id="workflows" label={lang === 'de' ? "Status System" : "Status System"} icon={<GitBranch size={18} />} />
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto p-8 ${isDark ? 'bg-[#0b1120]' : 'bg-white'}`}>
            <div className="max-w-5xl mx-auto">
                
                {/* --- SECTION 1: INTRODUCTION --- */}
                {activeSection === 'intro' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{lang === 'de' ? 'Systemarchitektur' : 'System Architecture'}</h2>
                            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {lang === 'de' 
                                    ? 'Dost Lager ist eine Single-Page-Application (SPA) und dient als Techniker-Werkzeug für den gesamten Procure-to-Pay-Prozess — von der Bestellanlage über den Wareneingang bis zur Reklamation und Lieferantenbewertung.'
                                    : 'Dost Lager is a Single-Page-Application (SPA) serving as a technician tool for the entire Procure-to-Pay process — from order creation through goods receipt to complaints management and supplier scoring.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DocCard title="Tech Stack" icon={<Code size={24}/>}>
                                <div className="space-y-4">
                                    <p>{lang === 'de' ? 'Modernste Web-Technologien für maximale Performance und Wartbarkeit.' : 'Modern web technologies for maximum performance and maintainability.'}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <TechBadge label="React 19" />
                                        <TechBadge label="TypeScript 5" />
                                        <TechBadge label="Tailwind CSS" />
                                        <TechBadge label="Lucide Icons" />
                                        <TechBadge label="Vite" />
                                    </div>
                                </div>
                            </DocCard>

                            <DocCard title="Single Source of Truth" icon={<Server size={24}/>}>
                                <div className="space-y-4">
                                    <p>
                                        {lang === 'de' 
                                            ? 'Die App simuliert ein Firestore-Backend durch zentrales State-Management in `App.tsx`. Es gibt keine lokale State-Duplizierung — alle Daten (Bestellungen, Wareneingänge, Tickets, Lagerbestand, Protokolle) leben ausschließlich im globalen State.'
                                            : 'The app simulates a Firestore backend via central state management in `App.tsx`. There is no local state duplication — all data (Orders, Receipts, Tickets, Inventory, Logs) lives exclusively in global state.'}
                                    </p>
                                    <ul className="space-y-2 text-xs">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            <span><strong>App.tsx:</strong> {lang === 'de' ? 'Hält den globalen State (Orders, Inventory, ReceiptMasters, Tickets, StockLogs) und alle Handler.' : 'Holds the global state (Orders, Inventory, ReceiptMasters, Tickets, StockLogs) and all handlers.'}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            <span><strong>types.ts:</strong> {lang === 'de' ? 'Definiert alle Interfaces: PurchaseOrder, ReceiptMaster, DeliveryLog, Ticket, StockLog u.v.m. Kein `any` erlaubt.' : 'Defines all interfaces: PurchaseOrder, ReceiptMaster, DeliveryLog, Ticket, StockLog and more. No `any` allowed.'}</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            <span><strong>data.ts:</strong> {lang === 'de' ? 'Simuliert die Firestore-Datenbank mit FULL_INVENTORY (SharePoint-Import), MOCK_PURCHASE_ORDERS und MOCK_RECEIPT_MASTERS.' : 'Simulates the Firestore database with FULL_INVENTORY (SharePoint import), MOCK_PURCHASE_ORDERS and MOCK_RECEIPT_MASTERS.'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </DocCard>
                        </div>

                        <div className={`p-6 rounded-2xl border ${isDark ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'}`}>
                            <h3 className={`font-bold flex items-center gap-2 mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                <Cpu size={20} /> {lang === 'de' ? 'Design Philosophie' : 'Design Philosophy'}
                            </h3>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                                <strong>Mobile First & Touch-Friendly:</strong> {lang === 'de' ? 'Alle interaktiven Elemente sind für die Bedienung auf Tablets im Außeneinsatz optimiert (Min-Height 44px).' : 'All interactive elements are optimized for tablet use in the field (Min-Height 44px).'}
                                <br/><br/>
                                <strong>Strict Typing:</strong> {lang === 'de' ? 'Es werden keine `any` Typen verwendet. Jede Datenstruktur (PO, Receipt, Item) ist in `types.ts` streng definiert, um Laufzeitfehler zu verhindern.' : 'No `any` types are used. Every data structure (PO, Receipt, Item) is strictly defined in `types.ts` to prevent runtime errors.'}
                                <br/><br/>
                                <strong>3 Themes & Portal-Architektur:</strong> {lang === 'de' ? 'Light, Dark und Soft. Alle Dropdowns/Selects nutzen ReactDOM.createPortal (Z-Index 9999+), damit sie niemals von Eltern-Containern abgeschnitten werden.' : 'Light, Dark, and Soft. All Dropdowns/Selects use ReactDOM.createPortal (Z-Index 9999+) so they are never clipped by parent containers.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* --- SECTION 2: DATA MODEL --- */}
                {activeSection === 'datamodel' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{lang === 'de' ? 'Daten-Modell' : 'Data Model'}</h2>
                            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {lang === 'de' 
                                    ? 'Das Herzstück der Anwendung ist die "Heilige Dreifaltigkeit" des Procure-to-Pay-Prozesses:'
                                    : 'The core of the application is the "Holy Trinity" of the Procure-to-Pay process:'} <br/>
                                Bestellung &rarr; Empfangs-Master &rarr; Liefer-Log.
                            </p>
                        </div>

                        {/* THE TRINITY VISUALIZATION */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 1. PO */}
                            <div className={`p-5 rounded-2xl border relative ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="absolute top-4 right-4 text-xs font-mono opacity-50">01</div>
                                <div className="mb-3 p-3 rounded-xl bg-blue-500/10 text-blue-500 w-fit"><FileText size={24} /></div>
                                <h3 className="font-bold text-lg mb-2">PurchaseOrder</h3>
                                <p className="text-xs opacity-70 mb-4">{lang === 'de' ? 'Der unveränderliche "Plan". Definiert WAS wir wollen, von WEM, und WANN. Identitäts-Status (Projekt/Lager) ist ewig.' : 'The immutable "Plan". Defines WHAT we want, from WHOM, and WHEN. Identity status (Projekt/Lager) is eternal.'}</p>
                                <div className={`text-[10px] font-mono p-2 rounded ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                                    id: string;<br/>
                                    status: PurchaseOrderStatus;<br/>
                                    items: PurchaseOrderItem[];<br/>
                                    isForceClosed?: boolean;
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex items-center justify-center opacity-30">
                                <ArrowRight size={32} />
                            </div>

                            {/* 2. ReceiptMaster */}
                            <div className={`p-5 rounded-2xl border relative ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="absolute top-4 right-4 text-xs font-mono opacity-50">02</div>
                                <div className="mb-3 p-3 rounded-xl bg-purple-500/10 text-purple-500 w-fit"><Layers size={24} /></div>
                                <h3 className="font-bold text-lg mb-2">ReceiptMaster</h3>
                                <p className="text-xs opacity-70 mb-4">{lang === 'de' ? 'Der "Container" pro Bestellung. Hält den aktuellen Status und sammelt alle Lieferungen als Sub-Array. Genau 1 Master pro PO.' : 'The "Container" per order. Holds the current status and collects all deliveries as a sub-array. Exactly 1 Master per PO.'}</p>
                                <div className={`text-[10px] font-mono p-2 rounded ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                                    poId: string;<br/>
                                    status: ReceiptMasterStatus;<br/>
                                    deliveries: DeliveryLog[];
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex items-center justify-center opacity-30">
                                <ArrowRight size={32} />
                            </div>

                            {/* 3. DeliveryLog */}
                            <div className={`p-5 rounded-2xl border relative ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <div className="absolute top-4 right-4 text-xs font-mono opacity-50">03</div>
                                <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit"><Truck size={24} /></div>
                                <h3 className="font-bold text-lg mb-2">DeliveryLog</h3>
                                <p className="text-xs opacity-70 mb-4">{lang === 'de' ? 'Das physische Event. Ein LKW kommt an. Kann mehrfach pro PO vorkommen (Teillieferungen). Enthält Snapshot-Felder (offen/zuViel) für historische Nachvollziehbarkeit.' : 'The physical event. A truck arrives. Can occur multiple times per PO (partial deliveries). Contains snapshot fields (offen/zuViel) for historical traceability.'}</p>
                                <div className={`text-[10px] font-mono p-2 rounded ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                                    date: string;<br/>
                                    lieferscheinNr: string;<br/>
                                    items: DeliveryLogItem[];
                                </div>
                            </div>
                        </div>

                        {/* ETERNAL STATUS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <DocCard title="Eternal Identity (Status)" icon={<ShieldCheck size={24}/>}>
                                <p className="mb-4">
                                    {lang === 'de' 
                                        ? 'Eine Bestellung wird mit einem Zweck geboren und behält diesen für immer. Dieser "Eternal Status" bestimmt das Verhalten im gesamten System. Guard Clauses in App.tsx schützen ihn bei jeder Buchung.'
                                        : 'An order is born with a purpose and keeps it forever. This "Eternal Status" determines behavior throughout the system. Guard clauses in App.tsx protect it during every booking.'}
                                </p>
                                <div className="space-y-3">
                                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                        <div className="font-bold uppercase text-xs tracking-wider">Projekt</div>
                                        <div className="text-xs opacity-80">{lang === 'de' ? 'Ware ist reserviert. Geht nicht in den freien Bestand. Automatische E-Mail an das Technik-Team bei Status "Gebucht". Stock-Log-Kontext: po-project.' : 'Goods are reserved. Does not enter free stock. Automatic email to the technician team on "Gebucht" status. Stock log context: po-project.'}</div>
                                    </div>
                                    <div className={`p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
                                        <div className="font-bold uppercase text-xs tracking-wider">Lager</div>
                                        <div className="text-xs opacity-80">{lang === 'de' ? 'Standard. Ware erhöht den stockLevel im Inventar sofort bei Buchung. Stock-Log-Kontext: po-normal.' : 'Standard. Goods increase the stockLevel in inventory immediately upon booking. Stock log context: po-normal.'}</div>
                                    </div>
                                </div>
                            </DocCard>

                            <DocCard title={lang === 'de' ? 'Split-Math Logic' : 'Split-Math Logic'} icon={<Calculator size={24}/>}>
                                <p className="mb-4">
                                    {lang === 'de' 
                                        ? 'Wir buchen nicht einfach "Received". Wir trennen physischen Empfang von akzeptierter Ware.'
                                        : 'We don\'t just book "Received". We separate physical receipt from accepted goods.'}
                                </p>
                                <div className="flex flex-col items-center justify-center h-full py-4">
                                    <div className={`font-mono text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        Received <span className="opacity-50">(Physical)</span>
                                    </div>
                                    <div className="h-6 w-px bg-slate-500/50 my-1"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500 font-bold">- Rejected</span>
                                        <span className="text-xs opacity-50">(Damaged / Wrong)</span>
                                    </div>
                                    <div className="h-6 w-px bg-slate-500/50 my-1"></div>
                                    <div className={`p-3 rounded-xl border-2 border-emerald-500 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                        = Accepted <span className="text-xs opacity-70">(Stock)</span>
                                    </div>
                                </div>
                            </DocCard>
                        </div>
                    </div>
                )}

                {/* --- SECTION 3: BUSINESS LOGIC & MATH --- */}
                {activeSection === 'logic' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{lang === 'de' ? 'Geschäftslogik & Mathe' : 'Business Logic & Math'}</h2>
                            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {lang === 'de' 
                                    ? 'Die Regeln für Warenbewegungen, Korrekturen, Bestandsberechnung und die drei Empfangsmodi (Standard, Rücksendung, Problem).'
                                    : 'Rules for goods movements, corrections, inventory calculation, and the three receipt modes (Standard, Return, Problem).'}
                            </p>
                        </div>

                        {/* Subsection A: The Split-Math */}
                        <div className="grid grid-cols-1 gap-6">
                            <DocCard title={lang === 'de' ? 'A. The Split-Math (Der Split)' : 'A. The Split-Math'} icon={<Scale size={24}/>}>
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="flex-1 space-y-4">
                                        <p>
                                            {lang === 'de' 
                                                ? 'Im Gegensatz zu einfachen Systemen, die nur "Geliefert" kennen, unterscheidet Dost Lager strikt zwischen physischer Anlieferung und buchbarem Bestand. Pro Zeile wird qtyReceived, qtyRejected (Schaden + Falsch), und qtyAccepted getrennt erfasst.'
                                                : 'Unlike simple systems that only know "Delivered", Dost Lager strictly distinguishes between physical delivery and bookable stock. Per line item, qtyReceived, qtyRejected (Damaged + Wrong), and qtyAccepted are tracked separately.'}
                                        </p>
                                        <ul className="space-y-2 text-sm opacity-80">
                                            <li className="flex items-center gap-2"><Truck size={14}/> <strong>Received:</strong> {lang === 'de' ? 'Was der LKW abgeladen hat.' : 'What the truck unloaded.'}</li>
                                            <li className="flex items-center gap-2"><Ban size={14}/> <strong>Rejected:</strong> {lang === 'de' ? 'Was direkt zurückging (Schaden, Falsch).' : 'What was returned immediately (Damage, Wrong).'}</li>
                                            <li className="flex items-center gap-2"><CheckCircle2 size={14}/> <strong>Accepted:</strong> {lang === 'de' ? 'Was im Regal landet.' : 'What lands on the shelf.'}</li>
                                        </ul>
                                    </div>
                                    <div className={`flex-1 p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="text-2xl font-mono font-bold">Total - Bad = Stock</div>
                                        <div className="text-xs opacity-50 text-center">{lang === 'de' ? 'Nur das Ergebnis ("Accepted") verändert den Lagerbestand.' : 'Only the result ("Accepted") changes the inventory.'}</div>
                                    </div>
                                </div>
                            </DocCard>

                            {/* Subsection B: Returns */}
                            <DocCard title={lang === 'de' ? 'B. Rücksendungen (Negative Transactions)' : 'B. Returns (Negative Transactions)'} icon={<LogOut size={24}/>}>
                                <p className="mb-4">
                                    {lang === 'de' 
                                        ? 'Wie korrigiert man eine Falschlieferung, die erst später bemerkt wurde? Durch eine "Negative Transaktion". Wir löschen niemals alte Belege ("The Ledger Principle"). Es gibt zwei Wege: Rücksendung (eigener Modus im Wareneingang, generiert RÜCK-Lieferschein) oder Problem-Modus (storniert die letzte Lieferung komplett und erstellt eine frische Inspektion).'
                                        : 'How to correct a wrong delivery noticed later? Via a "Negative Transaction". We never delete old receipts ("The Ledger Principle"). Two paths exist: Return mode (dedicated receipt mode, generates RÜCK-delivery note) or Problem mode (cancels the last delivery entirely and creates a fresh inspection).'}
                                </p>
                                <div className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-orange-900/10 border-orange-500/20' : 'bg-orange-50 border-orange-200'}`}>
                                    <div className="font-mono text-sm">
                                        <div>Received: <span className="font-bold">0</span></div>
                                        <div className="text-red-500">Rejected: <span className="font-bold">2</span> (Defekt)</div>
                                    </div>
                                    <ArrowRight size={24} className="opacity-30" />
                                    <div className={`px-4 py-2 rounded-lg font-bold font-mono ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
                                        Stock Change: <span className="text-red-500">-2</span>
                                    </div>
                                </div>
                            </DocCard>

                            {/* Subsection C: Force Close */}
                            <DocCard title={lang === 'de' ? 'C. Force Close (Unterlieferung)' : 'C. Force Close (Under-delivery)'} icon={<Lock size={24}/>}>
                                <div className="space-y-4">
                                    <p>
                                        {lang === 'de' 
                                            ? 'Manchmal liefert ein Lieferant weniger als bestellt und wird den Rest nicht mehr nachliefern. Mathematisch ist die Bestellung "Offen", aber organisatorisch ist sie "Erledigt". Es gibt zwei Varianten: Force Close (im Wareneingang, setzt isForceClosed=true) und Admin Close (isAdminClose, erzeugt eine Null-Mengen-Buchung mit ABSCHLUSS-Lieferschein).'
                                            : 'Sometimes a supplier delivers less than ordered and will not deliver the rest. Mathematically, the order is "Open", but organizationally it is "Done". Two variants exist: Force Close (in goods receipt, sets isForceClosed=true) and Admin Close (isAdminClose, creates a zero-quantity booking with ABSCHLUSS delivery note).'}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-xl border flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                                            <div className="text-xs font-bold uppercase mb-1 opacity-50">Standard Logik</div>
                                            <div className="text-red-500 font-bold">10 {lang === 'de' ? 'Bestellt' : 'Ordered'} ≠ 8 {lang === 'de' ? 'Geliefert' : 'Delivered'}</div>
                                            <div className="text-xs mt-1">Status: <span className="text-amber-500 font-bold">TEILLIEFERUNG</span></div>
                                        </div>
                                        <ArrowRight size={24} className="opacity-30" />
                                        <div className={`p-4 rounded-xl border flex-1 border-purple-500/30 bg-purple-500/10`}>
                                            <div className="text-xs font-bold uppercase mb-1 text-purple-500">Force Close Flag</div>
                                            <div className="text-emerald-500 font-bold">10 {lang === 'de' ? 'Bestellt' : 'Ordered'} ≈ 8 {lang === 'de' ? 'Geliefert' : 'Delivered'}</div>
                                            <div className="text-xs mt-1">Status: <span className="text-emerald-500 font-bold">ERLEDIGT</span></div>
                                        </div>
                                    </div>
                                </div>
                            </DocCard>
                        </div>
                    </div>
                )}

                {/* --- SECTION 4: STATUS SYSTEM (WORKFLOWS) --- */}
                {activeSection === 'workflows' && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Status System</h2>
                            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {lang === 'de' 
                                    ? 'Die visuelle Sprache der Anwendung. Jede Farbe und jedes Badge hat eine feste Bedeutung. Das System kennt 3 Badge-Ebenen: Identität (ewig), Lebenszyklus (berechnet) und Transaktion (prozessual).'
                                    : 'The visual language of the application. Every color and badge has a fixed meaning. The system uses 3 badge layers: Identity (eternal), Lifecycle (calculated), and Transaction (process-driven).'}
                            </p>
                        </div>

                        <div className="space-y-6">
                            
                            {/* 1. Identity Badges */}
                            <DocCard title={lang === 'de' ? '1. Identität (Ewig)' : '1. Identity (Eternal)'} icon={<ShieldCheck size={24}/>}>
                                <p className="mb-4 text-sm opacity-80">{lang === 'de' ? 'Diese Badges definieren den "Charakter" einer Bestellung. Sie ändern sich nie.' : 'These badges define the "character" of an order. They never change.'}</p>
                                <div className="flex gap-4 items-center">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-2 uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        <Box size={12} /> Lager
                                    </span>
                                    <span className="text-xs opacity-50">&rarr; {lang === 'de' ? 'Standard Wareneingang. Erhöht Bestand.' : 'Standard Receipt. Increases stock.'}</span>
                                </div>
                                <div className="h-px bg-slate-500/20 my-3"></div>
                                <div className="flex gap-4 items-center">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-2 uppercase tracking-wider ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                                        <Briefcase size={12} /> Projekt
                                    </span>
                                    <span className="text-xs opacity-50">&rarr; {lang === 'de' ? 'Reservierte Ware. Geht nicht in den freien Bestand. Trigger für E-Mail.' : 'Reserved goods. Does not enter free stock. Trigger for email.'}</span>
                                </div>
                            </DocCard>

                            {/* 2. Lifecycle Badges */}
                            <DocCard title={lang === 'de' ? '2. Lebenszyklus (Berechnet)' : '2. Lifecycle (Calculated)'} icon={<RefreshCw size={24}/>}>
                                <p className="mb-4 text-sm opacity-80">{lang === 'de' ? 'Der aktuelle Fortschritt, rein mathematisch berechnet.' : 'Current progress, purely mathematically calculated.'}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400 border-slate-700' : 'text-slate-600 border-slate-300 bg-white'}`}>OFFEN</div>
                                        <div className="text-xs opacity-60">{lang === 'de' ? '0% geliefert — Bestellt aber noch kein Eingang' : '0% delivered — Ordered but no receipt yet'}</div>
                                    </div>
                                    <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-amber-900/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider mb-2 ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>TEILLIEFERUNG</div>
                                        <div className="text-xs opacity-60">{lang === 'de' ? '1-99% geliefert — Mindestens 1 Lieferung eingetroffen' : '1-99% delivered — At least 1 delivery received'}</div>
                                    </div>
                                    <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                                        <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider mb-2 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>ERLEDIGT</div>
                                        <div className="text-xs opacity-60">{lang === 'de' ? '100% geliefert, Force Close oder Admin Close' : '100% delivered, Force Close, or Admin Close'}</div>
                                    </div>
                                </div>
                            </DocCard>

                            {/* 3. Transaction Badges */}
                            <DocCard title={lang === 'de' ? '3. Transaktion (Prozess)' : '3. Transaction (Process)'} icon={<Activity size={24}/>}>
                                <p className="mb-4 text-sm opacity-80">{lang === 'de' ? 'Der Status eines spezifischen Lieferscheins.' : 'The status of a specific receipt.'}</p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-[#6264A7]/20 text-[#9ea0e6] border-[#6264A7]/40' : 'bg-[#6264A7]/10 text-[#6264A7] border-[#6264A7]/20'}`}>In Prüfung</span>
                                        <span className="text-xs opacity-50 text-right">{lang === 'de' ? 'Ware physisch da, noch nicht im Bestand. Automatischer Initialstatus bei Erstbuchung.' : 'Goods physically arrived, not yet booked to stock. Automatic initial status on first booking.'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>Gebucht</span>
                                        <span className="text-xs opacity-50 text-right">{lang === 'de' ? 'Vorgang abgeschlossen. Bestand wurde aktualisiert (Lager) oder reserviert (Projekt).' : 'Process complete. Inventory updated (Lager) or reserved (Projekt).'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'}`}>Schaden</span>
                                        <span className="text-xs opacity-50 text-right">{lang === 'de' ? 'Ware beschädigt. Automatische Ticket-Erstellung je nach Ticket-Konfiguration (Einstellungen).' : 'Goods damaged. Automatic ticket creation based on ticket configuration (Settings).'}</span>
                                    </div>
                                </div>
                            </DocCard>

                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
};
