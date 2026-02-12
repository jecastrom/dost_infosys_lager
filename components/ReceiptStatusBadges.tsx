import React from 'react';
import { Briefcase, Box, Ticket as TicketIcon } from 'lucide-react';
import { Theme, ReceiptHeader, ReceiptMaster, PurchaseOrder, Ticket } from '../types';
import { getStatusConfig } from './ReceiptStatusConfig';

interface ReceiptStatusBadgesProps {
  header: ReceiptHeader;
  master?: ReceiptMaster;
  linkedPO?: PurchaseOrder;
  tickets?: Ticket[];
  theme: Theme;
  showTicketBadge?: boolean;
}

/**
 * Unified Status Badge Component
 * 
 * This component is the SINGLE SOURCE OF TRUTH for status badges.
 * It displays:
 * 1. Identity badge (PROJEKT or LAGER)
 * 2. Status badge (based on master or header status)
 * 3. Optional ticket badge (if open tickets exist)
 * 
 * Used in ALL 4 locations:
 * - Receipt list
 * - Receipt header (Positionen tab)
 * - Receipt header (Reklamationen tab)
 * - Status description area
 */
export const ReceiptStatusBadges: React.FC<ReceiptStatusBadgesProps> = ({
  header,
  master,
  linkedPO,
  tickets = [],
  theme,
  showTicketBadge = true
}) => {
  const isDark = theme === 'dark';
  const badges: React.ReactNode[] = [];

  // Determine effective status: Master takes precedence over Header
  let rawStatus = (master && master.status) ? master.status : header.status;

  // Default to 'Gebucht' if status is missing, empty, or a dash
  if (!rawStatus || String(rawStatus).trim() === '' || String(rawStatus).trim() === '-') {
    rawStatus = 'Gebucht';
  }

  const effectiveStatus = String(rawStatus).trim();

  // --- BADGE 1: IDENTITY (SOURCE) ---
  const isProject = linkedPO?.status === 'Projekt' || (header.bestellNr && header.bestellNr.toLowerCase().includes('projekt'));

  if (isProject) {
    badges.push(
      <span 
        key="id-projekt" 
        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${
          isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
        }`}
      >
        <Briefcase size={10} /> Projekt
      </span>
    );
  } else {
    badges.push(
      <span 
        key="id-lager" 
        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${
          isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
      >
        <Box size={10} /> Lager
      </span>
    );
  }

  // --- BADGE 2: STATUS (USING CONFIG) ---
  const statusConfig = getStatusConfig(effectiveStatus);
  
  if (statusConfig) {
    const badgeColors = isDark ? statusConfig.colorClass.dark.badge : statusConfig.colorClass.light.badge;
    badges.push(
      <span 
        key="st-main" 
        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${badgeColors}`}
      >
        {statusConfig.displayName}
      </span>
    );
  } else {
    // Fallback: Display raw status if no config found
    badges.push(
      <span 
        key="st-generic" 
        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
          isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}
      >
        {effectiveStatus}
      </span>
    );
  }

  // --- BADGE 3: OPEN TICKETS (OPTIONAL) ---
  if (showTicketBadge && tickets && tickets.length > 0) {
    const openTicketsCount = tickets.filter(t => t.status === 'Open').length;
    if (openTicketsCount > 0) {
      badges.push(
        <span 
          key="tickets" 
          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${
            isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          <TicketIcon size={10} /> {openTicketsCount} Offen
        </span>
      );
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {badges}
    </div>
  );
};