import React, { useState } from 'react';
import { Theme } from '../types';
import {
  ArrowLeft, Book, Database, Layout, GitBranch, ArrowRight,
  CheckCircle2, AlertTriangle, Box, Calculator, FileText, Truck,
  LogOut, RefreshCw, Briefcase, Ban, Info, Globe, Shield, Settings,
  Package, ClipboardList, Search, BarChart3, Users, Ticket, Eye,
  Sparkles, Calendar, Lock, History, Layers, ChevronDown, ChevronUp,
  Star, Zap, Hash, MapPin, AlertCircle, XCircle, PlusCircle
} from 'lucide-react';

interface DocumentationPageProps {
  theme: Theme;
  onBack: () => void;
}

type DocSection = 'intro' | 'modules' | 'orders' | 'receipt' | 'datamodel' | 'logic' | 'statuses' | 'settings';
type Lang = 'de' | 'en';

export const DocumentationPage: React.FC<DocumentationPageProps> = ({ theme, onBack }) => {
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState<DocSection>('intro');
  const [lang, setLang] = useState<Lang>('de');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const t = (de: string, en: string) => lang === 'de' ? de : en;

  // ── Section Config ──
  const sections: { id: DocSection; label: string; icon: React.ReactNode }[] = [
    { id: 'intro', label: t('Übersicht', 'Overview'), icon: <Layout size={16} /> },
    { id: 'modules', label: t('Module', 'Modules'), icon: <Layers size={16} /> },
    { id: 'orders', label: t('Bestellungen', 'Orders'), icon: <FileText size={16} /> },
    { id: 'receipt', label: t('Wareneingang', 'Goods Receipt'), icon: <ClipboardList size={16} /> },
    { id: 'datamodel', label: t('Daten-Modell', 'Data Model'), icon: <Database size={16} /> },
    { id: 'logic', label: t('Geschäftslogik', 'Business Logic'), icon: <Calculator size={16} /> },
    { id: 'statuses', label: t('Status System', 'Status System'), icon: <GitBranch size={16} /> },
    { id: 'settings', label: t('Einstellungen', 'Settings'), icon: <Settings size={16} /> },
  ];

  // ── Reusable Components ──

  const DocCard = ({ title, icon, children, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; id?: string }) => (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-3 p-4 md:p-5">
        <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-slate-800 text-[#0077B5]' : 'bg-blue-50 text-[#0077B5]'}`}>
          {icon}
        </div>
        <h3 className={`font-bold text-base md:text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
      </div>
      <div className={`px-4 pb-4 md:px-5 md:pb-5 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {children}
      </div>
    </div>
  );

  const Collapsible = ({ title, icon, children, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; id: string }) => {
    const isOpen = expandedCards.has(id);
    return (
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <button onClick={() => toggleCard(id)} className={`w-full flex items-center justify-between p-4 md:p-5 transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-slate-800 text-[#0077B5]' : 'bg-blue-50 text-[#0077B5]'}`}>
              {icon}
            </div>
            <span className={`font-bold text-sm md:text-base text-left ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</span>
          </div>
          {isOpen ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
        </button>
        {isOpen && (
          <div className={`px-4 pb-4 md:px-5 md:pb-5 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {children}
          </div>
        )}
      </div>
    );
  };

  const TechBadge = ({ label }: { label: string }) => (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border uppercase ${
      isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
    }`}>{label}</span>
  );

  const StatusPill = ({ label, color }: { label: string; color: string }) => (
    <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${color}`}>
      {label}
    </span>
  );

  const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className={`p-3 md:p-4 rounded-xl border text-xs ${isDark ? 'bg-[#0077B5]/5 border-[#0077B5]/20 text-[#0077B5]' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
      <div className="flex gap-2">
        <Info size={14} className="shrink-0 mt-0.5" />
        <div>{children}</div>
      </div>
    </div>
  );

  const FormulaBox = ({ formula, description }: { formula: string; description: string }) => (
    <div className={`p-3 md:p-4 rounded-xl border text-center ${isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
      <div className={`text-base md:text-lg font-mono font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{formula}</div>
      <div className="text-[11px] opacity-60">{description}</div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* ── HEADER ── */}
      <div className="mb-6">
        <button onClick={onBack} className={`flex items-center gap-2 text-sm font-bold mb-4 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
          <ArrowLeft size={16} /> {t('Zurück', 'Back')}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className={`p-2.5 md:p-3 rounded-2xl ${isDark ? 'bg-[#0077B5]/20' : 'bg-[#0077B5]/10'}`}>
              <Book size={24} className="text-[#0077B5]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{t('Technische Dokumentation', 'Technical Documentation')}</h1>
              <p className="text-xs md:text-sm text-slate-500">DOST Lager v0.2.2 — {t('Systemreferenz', 'System Reference')}</p>
            </div>
          </div>
          {/* Language Toggle */}
          <div className={`flex p-1 rounded-lg shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <button onClick={() => setLang('de')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${lang === 'de' ? (isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-800 shadow-sm') : 'opacity-50'}`}>DE</button>
            <button onClick={() => setLang('en')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${lang === 'en' ? (isDark ? 'bg-slate-600 text-white' : 'bg-white text-slate-800 shadow-sm') : 'opacity-50'}`}>EN</button>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS (mobile: horizontal scroll, desktop: wrap) ── */}
      <div className="mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible scrollbar-hide">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                activeSection === s.id
                  ? 'bg-[#0077B5] text-white shadow-md'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: OVERVIEW
          ═══════════════════════════════════════════════════════ */}
      {activeSection === 'intro' && (
        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('Systemarchitektur', 'System Architecture')}</h2>
            <p className={`text-sm md:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t(
                'DOST Lager ist eine Single-Page-Application (SPA) für den gesamten Procure-to-Pay-Prozess — von der Bestellanlage über den Wareneingang bis zur Reklamation und Lieferantenbewertung.',
                'DOST Lager is a Single-Page-Application (SPA) for the entire Procure-to-Pay process — from order creation through goods receipt to complaints management and supplier scoring.'
              )}
            </p>
          </div>

          <DocCard title="Tech Stack" icon={<Zap size={20} />}>
            <div className="flex flex-wrap gap-2 mb-4">
              <TechBadge label="React 18" /><TechBadge label="TypeScript" /><TechBadge label="Tailwind CSS" />
              <TechBadge label="Vite" /><TechBadge label="Lucide Icons" /><TechBadge label="LocalStorage" />
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /><span><strong>App.tsx:</strong> {t('Zentraler State-Container. Hält Orders, Inventory, ReceiptMasters, Tickets, StockLogs und alle Handler-Funktionen.', 'Central state container. Holds Orders, Inventory, ReceiptMasters, Tickets, StockLogs and all handler functions.')}</span></div>
              <div className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /><span><strong>types.ts:</strong> {t('Definiert alle TypeScript Interfaces. Kein `any` erlaubt.', 'Defines all TypeScript interfaces. No `any` allowed.')}</span></div>
              <div className="flex items-start gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /><span><strong>data.ts:</strong> {t('Mock-Datenbank mit FULL_INVENTORY (SharePoint-Import), MOCK_PURCHASE_ORDERS und MOCK_RECEIPT_MASTERS.', 'Mock database with FULL_INVENTORY (SharePoint import), MOCK_PURCHASE_ORDERS and MOCK_RECEIPT_MASTERS.')}</span></div>
            </div>
          </DocCard>

          <DocCard title={t('Design Philosophie', 'Design Philosophy')} icon={<Star size={20} />}>
            <div className="space-y-3 text-xs">
              <div><strong>Mobile First:</strong> {t('Alle Komponenten sind zuerst für Mobilgeräte entwickelt. Touch-Targets ≥ 44px. Horizontale Scrolls statt Desktop-Tabellen auf kleinen Bildschirmen.', 'All components are designed mobile-first. Touch targets ≥ 44px. Horizontal scrolls instead of desktop tables on small screens.')}</div>
              <div><strong>Strict Typing:</strong> {t('Kein `any` im gesamten Codebase. Alle Props, States und Handler sind typisiert.', 'No `any` in the entire codebase. All props, states and handlers are typed.')}</div>
              <div><strong>3 Themes:</strong> {t('Light, Soft (augenschonend) und Dark. Alle Komponenten unterstützen alle drei.', 'Light, Soft (eye-friendly) and Dark. All components support all three.')}</div>
              <div><strong>Ledger Principle:</strong> {t('Daten werden nie gelöscht, nur archiviert. Jede Änderung ist nachvollziehbar über den Audit Trail.', 'Data is never deleted, only archived. Every change is traceable via the Audit Trail.')}</div>
            </div>
          </DocCard>

          <InfoBox>
            {t(
              'Die App läuft komplett im Browser. Alle Daten werden im React State und localStorage gespeichert. Geplant: Firebase/Supabase Backend mit Authentifizierung.',
              'The app runs entirely in the browser. All data is stored in React state and localStorage. Planned: Firebase/Supabase backend with authentication.'
            )}
          </InfoBox>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: MODULES
          ═══════════════════════════════════════════════════════ */}
      {activeSection === 'modules' && (
        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('App Module', 'App Modules')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Jedes Modul ist eine eigene React-Komponente, die über das Routing in App.tsx gesteuert wird.', 'Each module is its own React component, controlled via routing in App.tsx.')}
            </p>
          </div>

          <Collapsible id="mod-dashboard" title={t('Dashboard (Lager)', 'Dashboard')} icon={<BarChart3 size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Zentrale Übersicht mit KPI-Karten: Gesamtbestand, offene Bestellungen, aktive Tickets, letzte Wareneingänge. Quick-Actions für häufige Aufgaben.', 'Central overview with KPI cards: total stock, open orders, active tickets, recent receipts. Quick actions for common tasks.')}</p>
              <p><strong>{t('Komponente', 'Component')}:</strong> <TechBadge label="Dashboard.tsx" /></p>
              <p><strong>{t('Daten', 'Data')}:</strong> {t('Liest inventory, purchaseOrders, receiptMasters, tickets und stockLogs.', 'Reads inventory, purchaseOrders, receiptMasters, tickets and stockLogs.')}</p>
            </div>
          </Collapsible>

          <Collapsible id="mod-inventory" title={t('Artikelverwaltung', 'Inventory Management')} icon={<Box size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Vollständige Artikelliste mit Grid- und List-Ansicht. Suche, Sortierung, Inline-Bearbeitung von Beständen, manuelle Bestandskorrekturen mit Logging.', 'Complete item list with grid and list views. Search, sorting, inline stock editing, manual stock corrections with logging.')}</p>
              <p><strong>{t('Features', 'Features')}:</strong></p>
              <div className="space-y-1 ml-2">
                <div className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />{t('Grid/List-Umschaltung (global über Einstellungen)', 'Grid/List toggle (global via settings)')}</div>
                <div className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />{t('Volltextsuche über Name, SKU, System, Hersteller', 'Full-text search across name, SKU, system, manufacturer')}</div>
                <div className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />{t('Artikel erstellen, bearbeiten, Bestand korrigieren', 'Create, edit items, correct stock levels')}</div>
                <div className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />{t('Jede Bestandsänderung wird im StockLog protokolliert', 'Every stock change is logged in StockLog')}</div>
              </div>
              <p><strong>{t('Komponenten', 'Components')}:</strong> <TechBadge label="InventoryView.tsx" /></p>
            </div>
          </Collapsible>

          <Collapsible id="mod-orders" title={t('Bestellverwaltung', 'Order Management')} icon={<FileText size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Übersicht aller Bestellungen (PurchaseOrders) mit Filterfunktionen, Status-Badges, Archivierung und Aktionsmenü. Desktop-Tabelle und Mobile-Karten.', 'Overview of all orders (PurchaseOrders) with filter functions, status badges, archiving and action menu. Desktop table and mobile cards.')}</p>
              <p><strong>{t('Komponenten', 'Components')}:</strong> <TechBadge label="OrderManagement.tsx" /> <TechBadge label="CreateOrderWizard.tsx" /></p>
            </div>
          </Collapsible>

          <Collapsible id="mod-receipt" title={t('Wareneingangsverwaltung', 'Receipt Management')} icon={<ClipboardList size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Verwaltung aller Wareneingänge mit automatischer Gruppierung nach Bestellnummer. Detail-Ansicht mit Lieferverlauf, Tickets und Kommentaren.', 'Management of all goods receipts with automatic grouping by order number. Detail view with delivery history, tickets and comments.')}</p>
              <p><strong>{t('Komponenten', 'Components')}:</strong> <TechBadge label="ReceiptManagement.tsx" /> <TechBadge label="GoodsReceiptFlow.tsx" /> <TechBadge label="ReceiptStatusBadges.tsx" /></p>
            </div>
          </Collapsible>

          <Collapsible id="mod-suppliers" title={t('Lieferantenbewertung', 'Supplier Scoring')} icon={<Users size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Automatische Bewertung aller Lieferanten basierend auf Lieferhistorie: Pünktlichkeit, Qualität (Schäden, Falschlieferungen), Vollständigkeit. Score von 0-100.', 'Automatic scoring of all suppliers based on delivery history: punctuality, quality (damage, wrong deliveries), completeness. Score from 0-100.')}</p>
              <p><strong>{t('Komponente', 'Component')}:</strong> <TechBadge label="SupplierView.tsx" /></p>
            </div>
          </Collapsible>

          <Collapsible id="mod-stocklog" title={t('Lagerprotokoll', 'Stock Logs')} icon={<History size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Chronologisches Protokoll aller Bestandsbewegungen. Filtert nach Zeitraum, Benutzer, Vorgang. Zeigt Quelle (Wareneingang, Manuelle Korrektur, Rücksendung) und Kontext (Normal, Projekt).', 'Chronological log of all stock movements. Filters by period, user, action. Shows source (goods receipt, manual correction, return) and context (normal, project).')}</p>
              <p><strong>{t('Komponente', 'Component')}:</strong> <TechBadge label="StockLogView.tsx" /></p>
            </div>
          </Collapsible>

          <Collapsible id="mod-tickets" title={t('Ticket-System (Reklamationen)', 'Ticket System (Complaints)')} icon={<Ticket size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Automatisch oder manuell erstellte Support-Fälle bei Abweichungen. Jedes Ticket ist an einen Wareneingang gebunden und hat Status (Open, In Progress, Resolved, Closed).', 'Automatically or manually created support cases for deviations. Each ticket is linked to a goods receipt and has status (Open, In Progress, Resolved, Closed).')}</p>
              <p><strong>{t('Automatisierung', 'Automation')}:</strong> {t('Über Globale Einstellungen konfigurierbar: Fehlmengen, Überlieferung, Beschädigung, Falschlieferung, Ablehnung.', 'Configurable via Global Settings: shortages, over-delivery, damage, wrong delivery, rejection.')}</p>
              <p><strong>{t('Komponente', 'Component')}:</strong> <TechBadge label="TicketSystem.tsx" /></p>
            </div>
          </Collapsible>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: ORDERS DEEP DIVE
          ═══════════════════════════════════════════════════════ */}
      {activeSection === 'orders' && (
        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('Bestellungen — Deep Dive', 'Orders — Deep Dive')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Vollständiger Lebenszyklus einer Bestellung von der Erstellung bis zum Abschluss.', 'Complete lifecycle of an order from creation to completion.')}
            </p>
          </div>

          <DocCard title={t('Bestelltypen', 'Order Types')} icon={<Package size={20} />}>
            <div className="space-y-3">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex items-center gap-2 mb-1"><Box size={14} className="text-emerald-500" /><strong className="text-xs">{t('Lager-Bestellung', 'Stock Order')}</strong></div>
                <p className="text-xs opacity-80">{t('Ware geht direkt in den freien Bestand. Standard-Prozess für Nachschub.', 'Goods go directly into free stock. Standard process for replenishment.')}</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-center gap-2 mb-1"><Briefcase size={14} className="text-blue-500" /><strong className="text-xs">{t('Projekt-Bestellung', 'Project Order')}</strong></div>
                <p className="text-xs opacity-80">{t('Reservierte Ware für ein spezifisches Projekt. Geht NICHT in den freien Bestand. Löst spezielle Buchungslogik aus.', 'Reserved goods for a specific project. Does NOT enter free stock. Triggers special booking logic.')}</p>
              </div>
            </div>
          </DocCard>

          <DocCard title={t('Bestell-Wizard (3 Schritte)', 'Order Wizard (3 Steps)')} icon={<Sparkles size={20} />}>
            <div className="space-y-3 text-xs">
              <div><strong>Step 1 — {t('Kopfdaten', 'Header Data')}:</strong> {t('Art (Lager/Projekt), Bestell-Nr., Lieferant, Datum, optionaler Liefertermin. Smart Import ermöglicht das Einfügen von Text/PDF-Bestelldaten.', 'Type (Stock/Project), Order No., Supplier, Date, optional delivery date. Smart Import allows pasting text/PDF order data.')}</div>
              <div><strong>Step 2 — {t('Artikel', 'Items')}:</strong> {t('Artikelsuche aus dem Bestand, Mengenangabe, Warengruppe. Artikel können nachträglich hinzugefügt oder entfernt (Soft Delete) werden.', 'Item search from inventory, quantity, product group. Items can be added or removed (soft delete) later.')}</div>
              <div><strong>Step 3 — {t('Zusammenfassung', 'Summary')}:</strong> {t('Review aller Positionen, PDF-Upload für Auftragsbestätigung, Absenden.', 'Review all items, PDF upload for order confirmation, submit.')}</div>
            </div>
            <InfoBox>
              {t('Smart Import: Erkennt automatisch Artikelnummern, Mengen, Lieferanten und Bestellnummern aus freiem Text. Aktivierbar in den Globalen Einstellungen.', 'Smart Import: Automatically detects item numbers, quantities, suppliers and order numbers from free text. Enabled via Global Settings.')}
            </InfoBox>
          </DocCard>

          <DocCard title={t('Aktionen pro Bestellung', 'Actions per Order')} icon={<Zap size={20} />}>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" /><span><strong>{t('Details ansehen', 'View Details')}:</strong> {t('Modal mit allen Positionen, Status, Lieferant, Bestätigungslink', 'Modal with all items, status, supplier, confirmation link')}</span></div>
              <div className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" /><span><strong>{t('Bearbeiten', 'Edit')}:</strong> {t('Artikel hinzufügen/entfernen, Mengen ändern (nur wenn noch nicht geliefert)', 'Add/remove items, change quantities (only if not yet delivered)')}</span></div>
              <div className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" /><span><strong>{t('Wareneingang prüfen', 'Check Goods Receipt')}:</strong> {t('Öffnet GoodsReceiptFlow im Standard-Modus', 'Opens GoodsReceiptFlow in standard mode')}</span></div>
              <div className="flex items-start gap-2"><CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" /><span><strong>{t('Schnell-Buchung', 'Quick Receipt')}:</strong> {t('Bucht alle Positionen auf einmal als komplett geliefert', 'Books all items at once as fully delivered')}</span></div>
              <div className="flex items-start gap-2"><AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" /><span><strong>{t('Stornieren', 'Cancel')}:</strong> {t('Nur möglich wenn noch keine Lieferung eingegangen', 'Only possible if no delivery received yet')}</span></div>
              <div className="flex items-start gap-2"><Ban size={12} className="text-slate-400 shrink-0 mt-0.5" /><span><strong>{t('Archivieren', 'Archive')}:</strong> {t('Bestellung wird ausgeblendet aber nie gelöscht (Ledger Principle)', 'Order is hidden but never deleted (Ledger Principle)')}</span></div>
            </div>
          </DocCard>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: GOODS RECEIPT DEEP DIVE
          ═══════════════════════════════════════════════════════ */}
      {activeSection === 'receipt' && (
        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('Wareneingang — Deep Dive', 'Goods Receipt — Deep Dive')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Drei Modi für unterschiedliche Empfangssituationen. Jeder Eingang erzeugt einen DeliveryLog im ReceiptMaster.', 'Three modes for different receipt situations. Each receipt creates a DeliveryLog in the ReceiptMaster.')}
            </p>
          </div>

          <DocCard title={t('Die drei Empfangsmodi', 'The Three Receipt Modes')} icon={<Layers size={20} />}>
            <div className="space-y-3">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
                <strong className="text-xs">{t('Standard-Modus', 'Standard Mode')}:</strong>
                <p className="text-xs opacity-80 mt-1">{t('Normale Warenannahme. Pro Position: Gelieferte Menge, Beschädigungen, Falschlieferungen, Ablehnungen erfassen. Bestand wird um akzeptierte Menge erhöht.', 'Normal goods receipt. Per item: Record delivered quantity, damages, wrong deliveries, rejections. Stock increases by accepted quantity.')}</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-orange-500/5 border-orange-500/20' : 'bg-orange-50 border-orange-200'}`}>
                <strong className="text-xs">{t('Rücksendung-Modus', 'Return Mode')}:</strong>
                <p className="text-xs opacity-80 mt-1">{t('Für Rücksendungen an den Lieferanten. Generiert RÜCK-Lieferschein. Bestand wird reduziert. Tracking-Nr. und Spediteur erfassbar.', 'For returns to supplier. Generates RÜCK-delivery note. Stock is reduced. Tracking number and carrier recordable.')}</p>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                <strong className="text-xs">{t('Problem-Modus', 'Problem Mode')}:</strong>
                <p className="text-xs opacity-80 mt-1">{t('Storniert die letzte Lieferung komplett und erstellt eine frische Inspektion. Für den Fall, dass Fehler erst später auffallen.', 'Cancels the last delivery entirely and creates a fresh inspection. For cases where errors are noticed later.')}</p>
              </div>
            </div>
          </DocCard>

          <DocCard title={t('Split-Math: Physisch vs. Akzeptiert', 'Split-Math: Physical vs. Accepted')} icon={<Calculator size={20} />}>
            <p className="mb-3 text-xs">{t('Wir trennen physischen Empfang von akzeptierter Ware. Nur die akzeptierte Menge verändert den Lagerbestand.', 'We separate physical receipt from accepted goods. Only the accepted quantity changes inventory.')}</p>
            <FormulaBox
              formula={t('Empfangen − Abgelehnt = Bestandsänderung', 'Received − Rejected = Stock Change')}
              description={t('Nur das Ergebnis ("Accepted") verändert den Lagerbestand', 'Only the result ("Accepted") changes the inventory')}
            />
            <div className="mt-3">
              <InfoBox>{t('Beispiel: 100 Stück empfangen, 5 beschädigt, 3 falsch → 92 Stück gehen in den Bestand. Die 8 abgelehnten werden per Ticket nachverfolgt.', 'Example: 100 units received, 5 damaged, 3 wrong → 92 units enter stock. The 8 rejected are tracked via ticket.')}</InfoBox>
            </div>
          </DocCard>

          <DocCard title={t('Lieferverlauf & Gruppierung', 'Delivery History & Grouping')} icon={<Truck size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Mehrere Lieferungen zur selben Bestellung werden automatisch gruppiert. Der ReceiptMaster speichert alle DeliveryLogs und berechnet den Gesamtstatus.', 'Multiple deliveries for the same order are automatically grouped. The ReceiptMaster stores all DeliveryLogs and calculates the overall status.')}</p>
              <p><strong>{t('Anzeige', 'Display')}:</strong> {t('In der Tabelle als "Multiple (X)" mit aufklappbarem Verlauf in der Detailansicht. Jeder Eintrag zeigt Datum, Lieferscheinnummer, Mengen und Status-Snapshot.', 'In the table as "Multiple (X)" with expandable history in detail view. Each entry shows date, delivery note number, quantities and status snapshot.')}</p>
            </div>
          </DocCard>

          <DocCard title={t('Force Close (Unterlieferung)', 'Force Close (Under-Delivery)')} icon={<Lock size={20} />}>
            <div className="text-xs space-y-2">
              <p>{t('Wenn ein Lieferant nur 80 von 100 Stück liefert und keine Nachlieferung geplant ist, kann die Bestellung "Force Closed" werden. Dies:', 'If a supplier delivers only 80 of 100 units and no follow-up delivery is planned, the order can be "Force Closed". This:')}</p>
              <div className="flex items-start gap-2"><ArrowRight size={12} className="shrink-0 mt-0.5 text-[#0077B5]" />{t('Setzt den PO-Status auf "Abgeschlossen"', 'Sets PO status to "Completed"')}</div>
              <div className="flex items-start gap-2"><ArrowRight size={12} className="shrink-0 mt-0.5 text-[#0077B5]" />{t('Markiert offene Mengen als bewusst akzeptiert', 'Marks open quantities as consciously accepted')}</div>
              <div className="flex items-start gap-2"><ArrowRight size={12} className="shrink-0 mt-0.5 text-[#0077B5]" />{t('Ist nicht rückgängig machbar', 'Is not reversible')}</div>
            </div>
          </DocCard>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: DATA MODEL
          ═══════════════════════════════════════════════════════ */}
      {activeSection === 'datamodel' && (
        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('Daten-Modell', 'Data Model')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Alle Kern-Entitäten und ihre Beziehungen.', 'All core entities and their relationships.')}
            </p>
          </div>

          <Collapsible id="dm-po" title="PurchaseOrder" icon={<FileText size={20} />}>
            <div className="space-y-1 text-xs font-mono">
              <div>id: <span className="opacity-60">string</span> — {t('Bestell-Nr. (z.B. "BEST-992")', 'Order No. (e.g. "BEST-992")')}</div>
              <div>supplier: <span className="opacity-60">string</span></div>
              <div>status: <span className="opacity-60">'Offen' | 'Teilweise geliefert' | 'Abgeschlossen' | 'Storniert' | 'Projekt' | 'Lager'</span></div>
              <div>items: <span className="opacity-60">PurchaseOrderItem[]</span> — {t('Jeder mit quantityExpected + quantityReceived', 'Each with quantityExpected + quantityReceived')}</div>
              <div>isArchived: <span className="opacity-60">boolean</span></div>
              <div>isForceClosed: <span className="opacity-60">boolean</span></div>
              <div>pdfUrl / orderConfirmationUrl: <span className="opacity-60">string?</span></div>
              <div>linkedReceiptId: <span className="opacity-60">string?</span> — FK → ReceiptMaster</div>
            </div>
          </Collapsible>

          <Collapsible id="dm-rm" title="ReceiptMaster" icon={<ClipboardList size={20} />}>
            <div className="space-y-1 text-xs font-mono">
              <div>id: <span className="opacity-60">string</span></div>
              <div>poId: <span className="opacity-60">string</span> — FK → PurchaseOrder</div>
              <div>status: <span className="opacity-60">ReceiptMasterStatus</span></div>
              <div>deliveries: <span className="opacity-60">DeliveryLog[]</span> — {t('Array aller Lieferungen', 'Array of all deliveries')}</div>
            </div>
            <div className="mt-3 text-xs">
              <strong>DeliveryLog:</strong> {t('Enthält pro Lieferung: Datum, Lieferscheinnummer, und pro Artikel: receivedQty, quantityAccepted, quantityRejected, offen, zuViel, damageFlag, rejectionReason.', 'Contains per delivery: date, delivery note number, and per item: receivedQty, quantityAccepted, quantityRejected, offen, zuViel, damageFlag, rejectionReason.')}
            </div>
          </Collapsible>

          <Collapsible id="dm-item" title="StockItem" icon={<Box size={20} />}>
            <div className="space-y-1 text-xs font-mono">
              <div>id / sku: <span className="opacity-60">string</span> — {t('Artikelnummer', 'Item number')}</div>
              <div>name: <span className="opacity-60">string</span></div>
              <div>system: <span className="opacity-60">string</span> — {t('Warengruppe (z.B. "USV", "Brandmeldetechnik")', 'Product group (e.g. "USV", "Fire Detection")')}</div>
              <div>stockLevel / minStock: <span className="opacity-60">number</span></div>
              <div>warehouseLocation: <span className="opacity-60">string?</span></div>
              <div>isAkku / capacityAh: <span className="opacity-60">boolean / number</span></div>
            </div>
          </Collapsible>

          <Collapsible id="dm-ticket" title="Ticket" icon={<Ticket size={20} />}>
            <div className="space-y-1 text-xs font-mono">
              <div>id: <span className="opacity-60">string</span></div>
              <div>receiptId: <span className="opacity-60">string</span> — FK → ReceiptHeader.batchId</div>
              <div>subject / description: <span className="opacity-60">string</span></div>
              <div>priority: <span className="opacity-60">'Low' | 'Medium' | 'High' | 'Critical'</span></div>
              <div>status: <span className="opacity-60">'Open' | 'In Progress' | 'Resolved' | 'Closed'</span></div>
              <div>type: <span className="opacity-60">'damage' | 'shortage' | 'excess' | 'wrong' | 'rejected' | 'other'</span></div>
            </div>
          </Collapsible>

          <Collapsible id="dm-header" title="ReceiptHeader" icon={<Database size={20} />}>
            <div className="space-y-1 text-xs font-mono">
              <div>batchId: <span className="opacity-60">string</span> — {t('Einmaliger Eingangs-ID', 'Unique receipt ID')}</div>
              <div>lieferscheinNr / bestellNr: <span className="opacity-60">string</span></div>
              <div>lieferant / status / timestamp: <span className="opacity-60">string / string / number</span></div>
              <div>createdByName: <span className="opacity-60">string?</span> — {t('Wer hat gebucht', 'Who booked')}</div>
            </div>
          </Collapsible>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: BUSINESS LOGIC
          ═══════════════════════════════════════════════════════ */}
      {activeSection === 'logic' && (
        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('Geschäftslogik & Formeln', 'Business Logic & Formulas')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Die mathematischen Regeln hinter Bestandsbewegungen, Statusberechnung und Korrekturen.', 'The mathematical rules behind stock movements, status calculation and corrections.')}
            </p>
          </div>

          <DocCard title={t('Bestandsberechnung', 'Stock Calculation')} icon={<Calculator size={20} />}>
            <FormulaBox formula="Accepted = Received − Rejected" description={t('Pro Lieferposition', 'Per delivery line')} />
            <div className="mt-3">
              <FormulaBox formula="Offen = Bestellt − Σ Accepted" description={t('Verbleibende Menge', 'Remaining quantity')} />
            </div>
            <div className="mt-3">
              <FormulaBox formula="Zu Viel = max(0, Σ Accepted − Bestellt)" description={t('Überlieferung', 'Over-delivery')} />
            </div>
          </DocCard>

          <DocCard title={t('PO-Status Berechnung', 'PO Status Calculation')} icon={<RefreshCw size={20} />}>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2"><ArrowRight size={12} className="shrink-0 mt-0.5 text-slate-400" />{t('Alle Positionen: received ≥ expected → "Abgeschlossen"', 'All items: received ≥ expected → "Completed"')}</div>
              <div className="flex items-start gap-2"><ArrowRight size={12} className="shrink-0 mt-0.5 text-amber-400" />{t('Mindestens 1 Position: received > 0 aber < expected → "Teilweise geliefert"', 'At least 1 item: received > 0 but < expected → "Partially delivered"')}</div>
              <div className="flex items-start gap-2"><ArrowRight size={12} className="shrink-0 mt-0.5 text-slate-400" />{t('Alle Positionen: received = 0 → "Offen"', 'All items: received = 0 → "Open"')}</div>
              <div className="flex items-start gap-2"><ArrowRight size={12} className="shrink-0 mt-0.5 text-red-400" />{t('Manuell storniert → "Storniert" (nur wenn 0 geliefert)', 'Manually cancelled → "Cancelled" (only if 0 delivered)')}</div>
            </div>
          </DocCard>

          <DocCard title={t('Rücksendungen (Negative Transaktionen)', 'Returns (Negative Transactions)')} icon={<LogOut size={20} />}>
            <div className="text-xs space-y-2">
              <p>{t('Rücksendungen erzeugen negative Bestandsbewegungen. Der alte Beleg bleibt bestehen (Ledger Principle). Es gibt zwei Wege:', 'Returns create negative stock movements. The old receipt remains (Ledger Principle). Two paths exist:')}</p>
              <div className="flex items-start gap-2"><strong className="shrink-0">1.</strong> {t('Rücksendung-Modus: Generiert RÜCK-Lieferschein, reduziert quantityReceived auf der PO.', 'Return mode: Generates RÜCK-delivery note, reduces quantityReceived on the PO.')}</div>
              <div className="flex items-start gap-2"><strong className="shrink-0">2.</strong> {t('Problem-Modus: Storniert die letzte Lieferung komplett (setzt Mengen zurück), erstellt neue Inspektion.', 'Problem mode: Cancels last delivery entirely (resets quantities), creates new inspection.')}</div>
            </div>
          </DocCard>

          <DocCard title={t('Ticket-Automatik', 'Ticket Automation')} icon={<Ticket size={20} />}>
            <div className="text-xs space-y-2">
              <p>{t('Nach jedem Wareneingang prüft das System automatisch auf Abweichungen und erstellt Tickets basierend auf der Konfiguration in den Globalen Einstellungen:', 'After each goods receipt, the system automatically checks for deviations and creates tickets based on the configuration in Global Settings:')}</p>
              <div className="flex items-start gap-2"><AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />{t('Fehlmengen: offen > 0 → Ticket "shortage"', 'Shortages: offen > 0 → Ticket "shortage"')}</div>
              <div className="flex items-start gap-2"><PlusCircle size={12} className="text-orange-500 shrink-0 mt-0.5" />{t('Überlieferung: zuViel > 0 → Ticket "excess"', 'Over-delivery: zuViel > 0 → Ticket "excess"')}</div>
              <div className="flex items-start gap-2"><AlertCircle size={12} className="text-red-500 shrink-0 mt-0.5" />{t('Beschädigung: damageFlag = true → Ticket "damage"', 'Damage: damageFlag = true → Ticket "damage"')}</div>
              <div className="flex items-start gap-2"><XCircle size={12} className="text-red-500 shrink-0 mt-0.5" />{t('Falsch: rejectionReason = "Wrong" → Ticket "wrong"', 'Wrong: rejectionReason = "Wrong" → Ticket "wrong"')}</div>
              <div className="flex items-start gap-2"><Ban size={12} className="text-slate-500 shrink-0 mt-0.5" />{t('Ablehnung: quantityRejected > 0 → Ticket "rejected"', 'Rejection: quantityRejected > 0 → Ticket "rejected"')}</div>
            </div>
          </DocCard>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 7: STATUS SYSTEM
          ═══════════════════════════════════════════════════════ */}
      {activeSection === 'statuses' && (
        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('Status System (3-Badge-Architektur)', '3-Badge Status Architecture')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Jede Bestellung und jeder Wareneingang zeigt bis zu 3 Status-Badges, die unterschiedliche Informationsebenen darstellen.', 'Each order and goods receipt shows up to 3 status badges representing different information layers.')}
            </p>
          </div>

          <DocCard title={t('Badge 1: Identität', 'Badge 1: Identity')} icon={<Briefcase size={20} />}>
            <div className="space-y-2">
              <p className="text-xs">{t('Statisch gesetzt bei der Erstellung. Ändert sich nie.', 'Set statically at creation. Never changes.')}</p>
              <div className="flex flex-wrap gap-2">
                <StatusPill label="PROJEKT" color={isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'} />
                <StatusPill label="LAGER" color={isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} />
              </div>
            </div>
          </DocCard>

          <DocCard title={t('Badge 2: Lebenszyklus (Berechnet)', 'Badge 2: Lifecycle (Calculated)')} icon={<RefreshCw size={20} />}>
            <div className="space-y-2">
              <p className="text-xs">{t('Wird automatisch berechnet basierend auf den Liefermengen.', 'Automatically calculated based on delivery quantities.')}</p>
              <div className="flex flex-wrap gap-2">
                <StatusPill label="OFFEN" color={isDark ? 'text-slate-400 border-slate-700' : 'text-slate-600 border-slate-300'} />
                <StatusPill label="TEILLIEFERUNG" color={isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'} />
                <StatusPill label="ERLEDIGT" color={isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} />
                <StatusPill label="ÜBERMENGE" color={isDark ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200'} />
              </div>
            </div>
          </DocCard>

          <DocCard title={t('Badge 3: Qualität / Prozess', 'Badge 3: Quality / Process')} icon={<Shield size={20} />}>
            <div className="space-y-2">
              <p className="text-xs">{t('Zeigt Qualitätsprobleme aus dem ReceiptMaster-Status.', 'Shows quality issues from the ReceiptMaster status.')}</p>
              <div className="flex flex-wrap gap-2">
                <StatusPill label="IN PRÜFUNG" color={isDark ? 'bg-[#6264A7]/20 text-[#9ea0e6] border-[#6264A7]/40' : 'bg-[#6264A7]/10 text-[#6264A7] border-[#6264A7]/20'} />
                <StatusPill label="SCHADEN" color={isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'} />
                <StatusPill label="FALSCH" color={isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'} />
                <StatusPill label="ABGELEHNT" color={isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'} />
              </div>
            </div>
          </DocCard>

          <DocCard title={t('Wareneingang-Status (ReceiptMaster)', 'Receipt Status (ReceiptMaster)')} icon={<ClipboardList size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Der ReceiptMaster hat seinen eigenen Status, der aus allen Lieferungen berechnet wird:', 'The ReceiptMaster has its own status, calculated from all deliveries:')}</p>
              <div className="space-y-1">
                <div><strong>Gebucht:</strong> {t('Alles korrekt geliefert', 'Everything correctly delivered')}</div>
                <div><strong>Teillieferung:</strong> {t('Offene Mengen vorhanden', 'Open quantities remaining')}</div>
                <div><strong>Übermenge:</strong> {t('Mehr geliefert als bestellt', 'More delivered than ordered')}</div>
                <div><strong>Schaden:</strong> {t('Beschädigte Ware erkannt', 'Damaged goods detected')}</div>
                <div><strong>Falsch geliefert:</strong> {t('Falsche Artikel erhalten', 'Wrong items received')}</div>
                <div><strong>Schaden + Falsch:</strong> {t('Kombination aus beiden', 'Combination of both')}</div>
                <div><strong>In Prüfung:</strong> {t('Wartet auf manuelle Inspektion', 'Waiting for manual inspection')}</div>
                <div><strong>Abgeschlossen:</strong> {t('Manuell abgeschlossen (Force Close)', 'Manually closed (Force Close)')}</div>
              </div>
            </div>
          </DocCard>

          <InfoBox>
            {t(
              'Die Status-Badges sind als standardisierte "Pills" mit fester Mindestbreite (130px) implementiert und werden vertikal gestapelt. CSS-Klasse: .status-pill-stack. Die Spaltenreihenfolge (Status zuerst oder zweite Spalte) ist über Globale Einstellungen konfigurierbar.',
              'Status badges are implemented as standardized "pills" with fixed minimum width (130px), stacked vertically. CSS class: .status-pill-stack. Column order (status first or second) is configurable via Global Settings.'
            )}
          </InfoBox>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 8: SETTINGS
          ═══════════════════════════════════════════════════════ */}
      {activeSection === 'settings' && (
        <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('Einstellungen — Architektur', 'Settings — Architecture')}</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('Zwei getrennte Einstellungsebenen: Benutzer-Präferenzen und Globale System-Einstellungen.', 'Two separate settings layers: User preferences and Global system settings.')}
            </p>
          </div>

          <DocCard title={t('Benutzer-Einstellungen (SettingsPage)', 'User Settings (SettingsPage)')} icon={<Settings size={20} />}>
            <div className="space-y-2 text-xs">
              <p>{t('Persönliche Präferenzen, die nur die Darstellung betreffen:', 'Personal preferences that only affect display:')}</p>
              <div className="flex items-start gap-2"><Eye size={12} className="shrink-0 mt-0.5 text-[#0077B5]" /><strong>{t('Erscheinungsbild', 'Appearance')}:</strong> Light / Soft / Dark</div>
              <div className="flex items-start gap-2"><Layout size={12} className="shrink-0 mt-0.5 text-[#0077B5]" /><strong>{t('Seitenleiste', 'Sidebar')}:</strong> {t('Kompakt / Voll (nur Desktop)', 'Compact / Full (desktop only)')}</div>
              <div className="flex items-start gap-2"><Box size={12} className="shrink-0 mt-0.5 text-[#0077B5]" /><strong>{t('Artikel-Ansicht', 'Item View')}:</strong> Grid / List</div>
              <div className="flex items-start gap-2"><Database size={12} className="shrink-0 mt-0.5 text-[#0077B5]" /><strong>{t('Daten-Management', 'Data Management')}:</strong> {t('JSON-Import / Zurücksetzen', 'JSON import / Reset')}</div>
              <p className="mt-2 opacity-70">{t('Gespeichert in: localStorage (pro Browser)', 'Stored in: localStorage (per browser)')}</p>
            </div>
          </DocCard>

          <DocCard title={t('Globale Einstellungen (GlobalSettingsPage)', 'Global Settings (GlobalSettingsPage)')} icon={<Shield size={20} />}>
            <div className="space-y-3 text-xs">
              <p>{t('System-weite Einstellungen, die alle Benutzer betreffen. In Zukunft nur für Admins zugänglich.', 'System-wide settings affecting all users. In future, only accessible to admins.')}</p>

              <div className={`p-3 rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <strong>{t('Kategorie 1: Tabellen & Anzeige', 'Category 1: Tables & Display')}</strong>
                <div className="mt-1 opacity-80">{t('Status-Spalte zuerst in Tabellen (betrifft OrderManagement & ReceiptManagement)', 'Status column first in tables (affects OrderManagement & ReceiptManagement)')}</div>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <strong>{t('Kategorie 2: Einkauf & Bestellungen', 'Category 2: Procurement & Orders')}</strong>
                <div className="mt-1 opacity-80">{t('Smart Import ein/aus, Liefertermin Pflicht/Optional', 'Smart Import on/off, Delivery date required/optional')}</div>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <strong>{t('Kategorie 3: Ticket-Automatisierung', 'Category 3: Ticket Automation')}</strong>
                <div className="mt-1 opacity-80">{t('5 Trigger einzeln konfigurierbar: Fehlmengen, Überlieferung, Beschädigung, Falschlieferung, Ablehnung', '5 triggers individually configurable: Shortages, over-delivery, damage, wrong delivery, rejection')}</div>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <strong>{t('Kategorie 4: Audit Trail', 'Category 4: Audit Trail')}</strong>
                <div className="mt-1 opacity-80">{t('Protokoll aller Systemaktionen (Login, Statusänderungen, Ticket-Erstellung). Bis zu 500 Einträge in localStorage.', 'Log of all system actions (login, status changes, ticket creation). Up to 500 entries in localStorage.')}</div>
              </div>
            </div>
          </DocCard>

          <InfoBox>
            {t(
              'Die Trennung erlaubt es, in Zukunft Globale Einstellungen hinter ein Admin-Login zu sperren, während Benutzer-Einstellungen für jeden zugänglich bleiben.',
              'The separation allows future admin-locking of Global Settings while keeping User Settings accessible to everyone.'
            )}
          </InfoBox>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="mt-12 text-center">
        <p className="text-xs text-slate-500">
          DOST Lager v0.2.2 — {t('Letzte Aktualisierung', 'Last Updated')}: 18.02.2026
        </p>
      </div>
    </div>
  );
};
