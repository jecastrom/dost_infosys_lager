

import React, { useRef, useState } from 'react';
import { Theme, StockItem, RawGermanItem, ActiveModule } from '../types';
import { Book, ChevronRight, Moon, Sun, Monitor, Shield, Info, Upload, Trash2, Database, AlertCircle, CheckCircle2, Users, LayoutPanelLeft, List, LayoutGrid, Bug, Eye } from 'lucide-react';

export interface TicketConfig {
  missing: boolean;  // Offen
  extra: boolean;    // Zu viel
  damage: boolean;   // Schaden
  wrong: boolean;    // Falsch
  rejected: boolean; // Abgelehnt
}

interface SettingsPageProps {
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
  onNavigate: (module: ActiveModule) => void;
  onUploadData: (data: StockItem[]) => void;
  onClearData: () => void;
  hasCustomData: boolean;
  sidebarMode: 'full' | 'slim';
  onSetSidebarMode: (mode: 'full' | 'slim') => void;
  inventoryViewMode: 'grid' | 'list';
  onSetInventoryViewMode: (mode: 'grid' | 'list') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  theme, 
  onSetTheme, 
  onNavigate,
  onUploadData,
  onClearData,
  hasCustomData,
  sidebarMode,
  onSetSidebarMode,
  inventoryViewMode,
  onSetInventoryViewMode
}) => {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse ASP.NET AJAX Date format "/Date(1732871995000)/"
  const parseAspDate = (dateStr: string | null): number | undefined => {
    if (!dateStr) return undefined;
    const match = dateStr.match(/\/Date\((\d+)\)\//);
    return match ? parseInt(match[1]) : undefined;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const rawData: RawGermanItem[] = JSON.parse(jsonContent);

        // Basic Validation
        if (!Array.isArray(rawData) || rawData.length === 0 || !rawData[0]["Artikel Nummer"]) {
          throw new Error("Ungültiges Format: JSON muss ein Array von Artikeln sein.");
        }

        // Map Data
        const mappedItems: StockItem[] = rawData.map((raw, index) => {
           return {
             id: raw["Artikel Nummer"] || `generated-id-${index}`,
             name: raw["Artikel Bezeichnung"] || "Unbekannter Artikel",
             sku: raw["Artikel Nummer"] || "UNKNOWN",
             system: raw["System"] || "Sonstiges",
             category: "Material", 
             stockLevel: typeof raw["Anzahl"] === 'number' ? raw["Anzahl"] : 0,
             minStock: typeof raw["Mindestbestand"] === 'number' ? raw["Mindestbestand"] : 0,
             warehouseLocation: raw["Objekt"] || undefined,
             manufacturer: raw["Hersteller/Lieferant"] || undefined,
             isAkku: raw["Kapazität in Ah"] !== null && raw["Kapazität in Ah"] !== undefined && raw["Kapazität in Ah"] > 0,
             capacityAh: raw["Kapazität in Ah"] || undefined,
             notes: raw["Bemerkungen"] || undefined,
             lastUpdated: parseAspDate(raw["Geändert"]) || Date.now(),
             status: "Active"
           };
        });

        onUploadData(mappedItems);
        alert(`${mappedItems.length} Artikel erfolgreich importiert.`);
        
      } catch (err) {
        console.error(err);
        alert("Fehler beim Import: " + (err instanceof Error ? err.message : "Unbekannter Fehler"));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };



  const SettingRow = ({ icon, label, description, action }: { icon: React.ReactNode, label: string, description: string, action: React.ReactNode }) => (
    <div className={`p-4 flex items-center justify-between border-b last:border-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
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

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
      <button 
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#0077B5]' : 'bg-slate-300 dark:bg-slate-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
  );

  // Theme Preview Button Component
  const ThemeOption = ({ mode, label, currentTheme, onClick, styleClass }: { mode: Theme, label: string, currentTheme: Theme, onClick: (t: Theme) => void, styleClass: string }) => (
      <button
          onClick={() => onClick(mode)}
          className={`h-9 px-4 rounded-lg text-xs font-bold border transition-all duration-200 flex items-center justify-center ${styleClass} ${
              currentTheme === mode 
              ? 'ring-2 ring-[#0077B5] ring-offset-1 dark:ring-offset-slate-900 scale-105 shadow-md' 
              : 'opacity-70 hover:opacity-100 hover:scale-105'
          }`}
      >
          {label}
      </button>
  );

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Einstellungen</h2>
        <p className="text-slate-500">Verwalten Sie Ihre App-Präferenzen und Systeminformationen.</p>
      </div>

      {/* VIEW & GENERAL SETTINGS (LOCAL) */}
      <div className={`rounded-2xl border overflow-hidden mb-8 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`px-6 py-3 border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          Ansicht & Allgemein
        </div>
        
        <SettingRow 
          icon={theme === 'dark' ? <Moon size={20} /> : theme === 'soft' ? <Eye size={20} /> : <Sun size={20} />}
          label="Erscheinungsbild"
          description="Wählen Sie Ihr bevorzugtes Farbschema."
          action={
            <div className="flex items-center gap-3">
                <ThemeOption 
                    mode="light" 
                    label="Light" 
                    currentTheme={theme} 
                    onClick={onSetTheme} 
                    styleClass="bg-white border-slate-200 text-slate-700"
                />
                <ThemeOption 
                    mode="soft" 
                    label="Soft" 
                    currentTheme={theme} 
                    onClick={onSetTheme} 
                    styleClass="bg-[#F5F5F6] border-[#E6E7EB] text-[#323338]"
                />
                <ThemeOption 
                    mode="dark" 
                    label="Dark" 
                    currentTheme={theme} 
                    onClick={onSetTheme} 
                    styleClass="bg-[#0b1120] border-slate-700 text-white"
                />
            </div>
          }
        />

        <SettingRow 
          icon={<LayoutPanelLeft size={20} />}
          label="Seitenleiste"
          description="Darstellung der Navigation (Desktop)"
          action={
            <div className={`flex p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button 
                    onClick={() => onSetSidebarMode('slim')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                        sidebarMode === 'slim' 
                        ? 'bg-[#0077B5] text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Kompakt
                </button>
                <button 
                    onClick={() => onSetSidebarMode('full')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                        sidebarMode === 'full' 
                        ? 'bg-[#0077B5] text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    Voll
                </button>
            </div>
          }
        />

        <SettingRow 
          icon={<Monitor size={20} />}
          label="Artikel-Ansicht"
          description="Darstellung der Lagerbestandsliste"
          action={
            <div className={`flex p-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <button 
                    onClick={() => onSetInventoryViewMode('grid')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                        inventoryViewMode === 'grid' 
                        ? 'bg-[#0077B5] text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <LayoutGrid size={14} /> Grid
                </button>
                <button 
                    onClick={() => onSetInventoryViewMode('list')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                        inventoryViewMode === 'list' 
                        ? 'bg-[#0077B5] text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <List size={14} /> List
                </button>
            </div>
          }
        />
      </div>

      {/* GLOBAL SETTINGS LINK */}
      <button
        onClick={() => onNavigate('global-settings')}
        className={`w-full rounded-2xl border overflow-hidden mb-8 text-left transition-all group ${
          isDark
            ? 'bg-[#0077B5]/5 border-[#0077B5]/20 hover:bg-[#0077B5]/10 hover:border-[#0077B5]/30'
            : 'bg-[#0077B5]/5 border-[#0077B5]/15 hover:bg-[#0077B5]/10 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-[#0077B5]/20' : 'bg-[#0077B5]/10'}`}>
              <Shield size={22} className="text-[#0077B5]" />
            </div>
            <div>
              <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Globale Einstellungen</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Einkauf, Tickets, Tabellen, Audit Trail — gilt für alle Benutzer
              </div>
            </div>
          </div>
          <ChevronRight size={20} className={`transition-transform group-hover:translate-x-1 text-[#0077B5]`} />
        </div>
      </button>

      {/* DATA MANAGEMENT SECTION */}
      <div className={`rounded-2xl border overflow-hidden mb-8 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`px-6 py-3 border-b flex justify-between items-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Daten-Management</span>
          {hasCustomData ? (
             <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
               <CheckCircle2 size={12} /> Live Daten
             </span>
          ) : (
             <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded">
               <Info size={12} /> Test Daten
             </span>
          )}
        </div>

        <SettingRow 
          icon={<Database size={20} />}
          label="Live-Daten Importieren"
          description="Laden Sie Ihre eigene JSON-Datei hoch."
          action={
            <div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 accept=".json" 
                 className="hidden" 
               />
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                   isDark ? 'bg-[#0077B5] hover:bg-[#00A0DC] text-white' : 'bg-[#0077B5] hover:bg-[#00A0DC] text-white shadow-sm'
                 }`}
               >
                 <Upload size={16} /> Importieren
               </button>
            </div>
          }
        />

        {hasCustomData && (
          <div className={`p-4 flex items-center justify-between border-t ${isDark ? 'border-slate-800 bg-red-500/5' : 'border-slate-100 bg-red-50'}`}>
            <div className="flex items-center gap-4">
               <div className={`p-2.5 rounded-xl ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  <AlertCircle size={20} />
               </div>
               <div>
                 <div className={`font-bold text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>Daten zurücksetzen</div>
                 <div className={`text-xs ${isDark ? 'text-red-400/60' : 'text-red-600/70'}`}>Löscht Live-Daten und stellt Mock-Daten wieder her.</div>
               </div>
            </div>
            <button 
              onClick={onClearData}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-white border border-red-200 hover:bg-red-50 text-red-600'
              }`}
            >
              <Trash2 size={16} /> Löschen
            </button>
          </div>
        )}
      </div>

      
          {/* System & Hilfe */}
      <div className={`rounded-2xl border overflow-hidden mb-8 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`px-6 py-3 border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          System & Hilfe
        </div>

        <button 
          onClick={() => onNavigate('documentation')}
          className={`w-full text-left transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
        >
          <SettingRow 
            icon={<Book size={20} />}
            label="App Dokumentation"
            description="Technische Details, Architektur und Datenstruktur"
            action={<ChevronRight size={18} className="text-slate-500" />}
          />
        </button>

        <button 
          onClick={() => onNavigate('debug')}
          className={`w-full text-left transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
        >
          <SettingRow 
            icon={<Bug size={20} />}
            label="System-Logik prüfen (Debug)"
            description="Developer Tools & Status-Logik Debugger"
            action={<ChevronRight size={18} className="text-slate-500" />}
          />
        </button>

        <SettingRow 
          icon={<Info size={20} />}
          label="Version"
          description="Build 2026.02.01-v0.2.2"
          action={<span className="text-xs font-mono text-slate-500">v0.2.2</span>}
        />
      </div>

      {/* CREDITS SECTION */}
      <div className={`rounded-2xl border overflow-hidden mb-8 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className={`px-6 py-3 border-b flex flex-col justify-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Entwicklung
          </span>
          <span className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
            AI-Assisted Software Developers
          </span>
        </div>

        <SettingRow 
          icon={<Users size={20} />}
          label="Marcel Stöwhaas"
          description="Techniker"
          action={<></>}
        />

        <SettingRow 
          icon={<Users size={20} />}
          label="Jorge Castro"
          description="Elektrofachhelfer"
          action={<></>}
        />
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500">
          Entwickelt von DOST INFOSYS<br/>
          &copy; 2026 Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
};