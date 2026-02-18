import React, { useState } from 'react';
import { Theme, ActiveModule, AuditEntry } from '../types';
import { 
  ArrowLeft, Shield, Sparkles, Calendar, Ticket, List,
  AlertTriangle, PlusCircle, AlertCircle, Ban, ChevronDown, ChevronUp,
  Info, Clock, FileText, Eye, Lock
} from 'lucide-react';
import { TicketConfig } from './SettingsPage';

interface GlobalSettingsPageProps {
  theme: Theme;
  onNavigate: (module: ActiveModule) => void;
  // Tabellen & Anzeige
  statusColumnFirst: boolean;
  onSetStatusColumnFirst: (val: boolean) => void;
  // Einkauf & Bestellungen
  enableSmartImport: boolean;
  onSetEnableSmartImport: (enabled: boolean) => void;
  requireDeliveryDate: boolean;
  onSetRequireDeliveryDate: (required: boolean) => void;
  // Ticket-Automatisierung
  ticketConfig: TicketConfig;
  onSetTicketConfig: (config: TicketConfig) => void;
  // Audit Trail
  auditTrail?: AuditEntry[];
}

export const GlobalSettingsPage: React.FC<GlobalSettingsPageProps> = ({
  theme,
  onNavigate,
  statusColumnFirst,
  onSetStatusColumnFirst,
  enableSmartImport,
  onSetEnableSmartImport,
  requireDeliveryDate,
  onSetRequireDeliveryDate,
  ticketConfig,
  onSetTicketConfig,
  auditTrail = []
}) => {
  const isDark = theme === 'dark';
  const [isTicketConfigOpen, setIsTicketConfigOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // ── Reusable Sub-Components ──

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-[#0077B5]' : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );

  const SettingRow = ({ icon, label, description, action }: {
    icon: React.ReactNode; label: string; description: string; action: React.ReactNode;
  }) => (
    <div className={`flex items-center justify-between p-4 border-b last:border-b-0 ${
      isDark ? 'border-slate-800' : 'border-slate-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
          {icon}
        </div>
        <div>
          <div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{label}</div>
          <div className="text-xs text-slate-500">{description}</div>
        </div>
      </div>
      <div>{action}</div>
    </div>
  );

  const SectionHeader = ({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) => (
    <div className={`px-6 py-3 border-b flex items-center gap-3 ${
      isDark ? 'bg-[#0077B5]/5 border-[#0077B5]/20' : 'bg-[#0077B5]/5 border-[#0077B5]/10'
    }`}>
      <div className={`p-1.5 rounded-lg ${isDark ? 'bg-[#0077B5]/20 text-[#0077B5]' : 'bg-[#0077B5]/10 text-[#0077B5]'}`}>
        {icon}
      </div>
      <div>
        <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {title}
        </span>
        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <button
          onClick={() => onNavigate('settings')}
          className={`flex items-center gap-2 text-sm font-bold mb-4 transition-colors ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowLeft size={16} /> Zurück zu Einstellungen
        </button>

        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-[#0077B5]/20' : 'bg-[#0077B5]/10'}`}>
            <Shield size={28} className="text-[#0077B5]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Globale Einstellungen</h2>
            <p className="text-slate-500 text-sm">
              Diese Einstellungen gelten für alle Benutzer und beeinflussen das Systemverhalten.
            </p>
          </div>
        </div>

        <div className={`mt-4 rounded-xl px-4 py-2.5 flex items-center gap-3 text-xs ${
          isDark
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          <Lock size={14} className="shrink-0" />
          <span>In Zukunft nur für Administratoren sichtbar. Änderungen wirken sich sofort auf alle Benutzer aus.</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          CATEGORY 1: TABELLEN & ANZEIGE
          ═══════════════════════════════════════════════════════ */}
      <div className={`rounded-2xl border overflow-hidden mb-6 ${
        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <SectionHeader
          title="Tabellen & Anzeige"
          subtitle="Spaltenreihenfolge und Darstellung in Listen"
          icon={<List size={16} />}
        />
        <SettingRow
          icon={<Eye size={20} className="text-[#0077B5]" />}
          label="Status-Spalte zuerst in Tabellen"
          description="Zeigt die Status-Spalte als erste Spalte in den Bestell- und Wareneingangstabellen."
          action={<Toggle checked={statusColumnFirst} onChange={onSetStatusColumnFirst} />}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          CATEGORY 2: EINKAUF & BESTELLUNGEN
          ═══════════════════════════════════════════════════════ */}
      <div className={`rounded-2xl border overflow-hidden mb-6 ${
        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <SectionHeader
          title="Einkauf & Bestellungen"
          subtitle="Import-Funktionen und Pflichtfelder für neue Bestellungen"
          icon={<FileText size={16} />}
        />
        <SettingRow
          icon={<Sparkles size={20} className="text-[#0077B5]" />}
          label="Smart Import (PDF/Text)"
          description="Ermöglicht das automatische Auslesen von Bestellungen aus Texten oder Dokumenten."
          action={<Toggle checked={enableSmartImport} onChange={onSetEnableSmartImport} />}
        />
        <SettingRow
          icon={<Calendar size={20} className="text-[#0077B5]" />}
          label="Liefertermin als Pflichtfeld"
          description="Muss bei neuen Bestellungen angegeben werden."
          action={
            <div className={`flex p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <button
                onClick={() => onSetRequireDeliveryDate(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  requireDeliveryDate
                    ? 'bg-[#0077B5] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Pflicht
              </button>
              <button
                onClick={() => onSetRequireDeliveryDate(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  !requireDeliveryDate
                    ? 'bg-[#0077B5] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Optional
              </button>
            </div>
          }
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          CATEGORY 3: TICKET-AUTOMATISIERUNG
          ═══════════════════════════════════════════════════════ */}
      <div className={`rounded-2xl border overflow-hidden mb-6 ${
        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => setIsTicketConfigOpen(!isTicketConfigOpen)}
          className={`w-full transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
        >
          <div className={`px-6 py-3 flex items-center justify-between ${
            isDark ? 'bg-[#0077B5]/5' : 'bg-[#0077B5]/5'
          } ${isTicketConfigOpen ? 'border-b ' + (isDark ? 'border-slate-800' : 'border-slate-200') : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${isDark ? 'bg-[#0077B5]/20 text-[#0077B5]' : 'bg-[#0077B5]/10 text-[#0077B5]'}`}>
                <Ticket size={16} />
              </div>
              <div className="text-left">
                <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Ticket-Automatisierung
                </span>
                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Automatische Erstellung von Support-Fällen bei Abweichungen
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-[#0077B5]/20 text-[#0077B5]' : 'bg-[#0077B5]/10 text-[#0077B5]'
              }`}>
                {Object.values(ticketConfig).filter(Boolean).length}/5 aktiv
              </span>
              {isTicketConfigOpen
                ? <ChevronUp size={16} className="text-slate-400" />
                : <ChevronDown size={16} className="text-slate-400" />
              }
            </div>
          </div>
        </button>

        {isTicketConfigOpen && (
          <div>
            <div className={`mx-4 mt-4 mb-3 p-3 rounded-xl border text-xs ${
              isDark ? 'border-slate-700 text-slate-400 bg-slate-800/50' : 'border-slate-200 text-slate-600 bg-slate-50'
            }`}>
              <div className="flex gap-3">
                <Info size={16} className="shrink-0 mt-0.5 text-[#0077B5]" />
                <p>
                  Wählen Sie aus, bei welchen Abweichungen im Wareneingang automatisch ein
                  Support-Fall (Ticket) erstellt werden soll. Dies erleichtert die Nachverfolgung
                  von Reklamationen.
                </p>
              </div>
            </div>

            <SettingRow
              icon={<AlertTriangle size={20} className="text-amber-500" />}
              label="Bei Fehlmengen (Offen)"
              description="Erstellt Ticket wenn weniger geliefert als bestellt wurde."
              action={<Toggle checked={ticketConfig.missing} onChange={(v) => onSetTicketConfig({ ...ticketConfig, missing: v })} />}
            />
            <SettingRow
              icon={<PlusCircle size={20} className="text-orange-500" />}
              label="Bei Überlieferung (Zu viel)"
              description="Erstellt Ticket wenn mehr geliefert als bestellt wurde."
              action={<Toggle checked={ticketConfig.extra} onChange={(v) => onSetTicketConfig({ ...ticketConfig, extra: v })} />}
            />
            <SettingRow
              icon={<AlertCircle size={20} className="text-red-500" />}
              label="Bei Beschädigung"
              description="Erstellt Ticket bei gemeldetem Schaden."
              action={<Toggle checked={ticketConfig.damage} onChange={(v) => onSetTicketConfig({ ...ticketConfig, damage: v })} />}
            />
            <SettingRow
              icon={<Ban size={20} className="text-red-500" />}
              label="Bei Falschlieferung"
              description="Erstellt Ticket wenn falscher Artikel geliefert wurde."
              action={<Toggle checked={ticketConfig.wrong} onChange={(v) => onSetTicketConfig({ ...ticketConfig, wrong: v })} />}
            />
            <SettingRow
              icon={<Ban size={20} className="text-slate-500" />}
              label="Bei Ablehnung"
              description="Erstellt Ticket wenn Positionen komplett abgelehnt wurden."
              action={<Toggle checked={ticketConfig.rejected} onChange={(v) => onSetTicketConfig({ ...ticketConfig, rejected: v })} />}
            />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          CATEGORY 4: AUDIT TRAIL
          ═══════════════════════════════════════════════════════ */}
      <div className={`rounded-2xl border overflow-hidden mb-6 ${
        isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <button
          onClick={() => setIsAuditOpen(!isAuditOpen)}
          className={`w-full transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
        >
          <div className={`px-6 py-3 flex items-center justify-between ${
            isDark ? 'bg-[#0077B5]/5' : 'bg-[#0077B5]/5'
          } ${isAuditOpen ? 'border-b ' + (isDark ? 'border-slate-800' : 'border-slate-200') : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${isDark ? 'bg-[#0077B5]/20 text-[#0077B5]' : 'bg-[#0077B5]/10 text-[#0077B5]'}`}>
                <Clock size={16} />
              </div>
              <div className="text-left">
                <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Audit Trail
                </span>
                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Protokoll aller System- und Benutzeraktionen
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}>
                {auditTrail.length} Einträge
              </span>
              {isAuditOpen
                ? <ChevronUp size={16} className="text-slate-400" />
                : <ChevronDown size={16} className="text-slate-400" />
              }
            </div>
          </div>
        </button>

        {isAuditOpen && (
          <div className="max-h-80 overflow-y-auto">
            {auditTrail.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Keine Audit-Einträge vorhanden.
              </div>
            ) : (
              <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {auditTrail.slice(0, 50).map(entry => (
                  <div key={entry.id} className={`px-4 py-3 text-xs ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {entry.event}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(entry.timestamp).toLocaleDateString('de-DE', {
                          day: '2-digit', month: '2-digit', year: 'numeric'
                        })}{' '}
                        {new Date(entry.timestamp).toLocaleTimeString('de-DE', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>{entry.user}</span>
                      {entry.details && Object.keys(entry.details).length > 0 && (
                        <span className="truncate max-w-[300px]">
                          — {Object.entries(entry.details).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          Änderungen werden sofort gespeichert und gelten für alle Benutzer.
        </p>
      </div>
    </div>
  );
};
