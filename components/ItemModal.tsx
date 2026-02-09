
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Box, Hash, Truck, MapPin, Layers, Info, Package } from 'lucide-react';
import { StockItem } from '../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: StockItem) => void;
  initialData?: StockItem | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    manufacturer: '',
    system: '',
    warehouseLocation: '',
    minStock: 0,
    packUnits: 1
  });

  // Populate form when opening or changing initialData
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          sku: initialData.sku,
          manufacturer: initialData.manufacturer || '',
          system: initialData.system,
          warehouseLocation: initialData.warehouseLocation || '',
          minStock: initialData.minStock,
          packUnits: initialData.packUnits || 1
        });
      } else {
        // Reset for creation mode
        setFormData({
          name: '',
          sku: '',
          manufacturer: '',
          system: 'Material',
          warehouseLocation: '',
          minStock: 0,
          packUnits: 1
        });
      }
    }
  }, [isOpen, initialData]);

  // Handle Escape Key to Close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    // Construct the item object mapping fields to the StockItem interface
    const item: StockItem = {
      // If editing, preserve ID. If creating, generate new.
      id: initialData ? initialData.id : crypto.randomUUID(),
      name: formData.name,
      sku: formData.sku,
      system: formData.system,
      category: initialData?.category || 'Material',
      stockLevel: initialData ? initialData.stockLevel : 0, // Start with 0 if new, preserve if edit
      minStock: Number(formData.minStock),
      warehouseLocation: formData.warehouseLocation,
      manufacturer: formData.manufacturer,
      packUnits: Number(formData.packUnits),
      
      // Preserve existing optional fields if editing
      isAkku: initialData?.isAkku,
      capacityAh: initialData?.capacityAh,
      notes: initialData?.notes,
      
      lastUpdated: Date.now(),
      status: 'Active'
    };

    onSave(item);
    onClose();
  };

  // Updated CSS Classes for Better Light/Dark Mode Contrast & Visibility
  const inputClass = "w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition-all bg-slate-50 border-slate-300 text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-white focus:ring-blue-500/30";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {initialData ? <><Package className="text-[#0077B5]" /> Artikel bearbeiten</> : <><Package className="text-[#0077B5]" /> Neuer Artikel anlegen</>}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {initialData ? 'Stammdaten des Artikels anpassen.' : 'Erstellen Sie einen neuen Artikel im System.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Required Fields Group */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-2 text-xs font-bold text-[#0077B5] uppercase mb-2">
                <Info size={14} /> Pflichtfelder
             </div>
             
             <div className="space-y-1">
                <label className={labelClass}>Artikel Bezeichnung <span className="text-red-500">*</span></label>
                <input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className={inputClass}
                  placeholder="z.B. Rauchmelder optisch"
                  autoFocus
                  required
                />
             </div>

             <div className="space-y-1">
                <label className={labelClass}>Artikel Nummer (SKU) <span className="text-red-500">*</span></label>
                <div className="relative">
                   <Hash size={16} className={iconClass} />
                   <input 
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className={`${inputClass} pl-10 ${initialData ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="z.B. 4000123"
                    disabled={!!initialData} // Read-only if editing
                    required
                   />
                </div>
                {initialData && <p className="text-[10px] text-slate-400 mt-1 pl-1">SKU kann nicht geändert werden.</p>}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-1">
                <label className={labelClass}>Hersteller / Lieferant</label>
                <div className="relative">
                   <Truck size={16} className={iconClass} />
                   <input 
                    value={formData.manufacturer}
                    onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                    className={`${inputClass} pl-10`}
                    placeholder="z.B. Hekatron"
                   />
                </div>
             </div>

             <div className="space-y-1">
                <label className={labelClass}>System</label>
                <div className="relative">
                   <Layers size={16} className={iconClass} />
                   <input 
                    value={formData.system}
                    onChange={e => setFormData({...formData, system: e.target.value})}
                    className={`${inputClass} pl-10`}
                    placeholder="z.B. BMA"
                   />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <div className="space-y-1">
                <label className={labelClass}>Lagerort (Objekt)</label>
                <div className="relative">
                   <MapPin size={16} className={iconClass} />
                   <input 
                    value={formData.warehouseLocation}
                    onChange={e => setFormData({...formData, warehouseLocation: e.target.value})}
                    className={`${inputClass} pl-10`}
                    placeholder="z.B. Hauptlager"
                   />
                </div>
             </div>

             <div className="space-y-1">
                <label className={labelClass}>Mindestbestand</label>
                <input 
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                  className={inputClass}
                />
             </div>
          </div>

          {/* New Field: Pack Units */}
          <div className="space-y-1">
              <label className={labelClass}>Packungsinhalt (Stk.)</label>
              <div className="relative group">
                 <Box size={16} className={iconClass} />
                 <input 
                  type="number"
                  min="1"
                  value={formData.packUnits}
                  onChange={e => setFormData({...formData, packUnits: parseInt(e.target.value) || 1})}
                  className={`${inputClass} pl-10`}
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                    Stück / Packung
                 </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
                 Wie viele Einheiten sind in einer Standardverpackung enthalten? Standard: 1.
              </p>
          </div>

        </form>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
           <button 
             onClick={onClose}
             className="px-5 py-2.5 rounded-xl font-bold text-sm transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
           >
             Abbrechen
           </button>
           <button 
             onClick={handleSubmit}
             className="px-6 py-2.5 bg-[#0077B5] hover:bg-[#00A0DC] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95"
           >
             <Save size={18} /> Speichern
           </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
