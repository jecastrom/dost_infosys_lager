import { 
  CheckCircle2, AlertTriangle, Clock, PackagePlus, 
  AlertCircle, Ban, XCircle, Info, Truck, Lock, CheckCircle
} from 'lucide-react';
import { ReceiptMasterStatus } from '../types';

export interface StatusConfig {
  key: string;
  displayName: string;
  description: string;
  actionText?: string;
  icon: any;
  colorClass: {
    light: {
      bg: string;
      text: string;
      border: string;
      badge: string;
    };
    dark: {
      bg: string;
      text: string;
      border: string;
      badge: string;
    };
  };
}

export const RECEIPT_STATUS_CONFIG: Record<ReceiptMasterStatus, StatusConfig> = {
  'Offen': {
    key: 'offen',
    displayName: 'Offen',
    description: 'Der Wareneingang wurde erstellt und wartet auf die erste Lieferung.',
    actionText: 'Erste Lieferung erfassen',
    icon: Clock,
    colorClass: {
      light: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-50 text-amber-600 border-amber-200'
      },
      dark: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }
    }
  },
  
  'Wartet auf Prüfung': {
    key: 'wartet-pruefung',
    displayName: 'Wartet auf Prüfung',
    description: 'Wareneingang wurde vorerfasst und wartet auf Prüfung durch das Team.',
    actionText: 'Jetzt prüfen',
    icon: PackagePlus,
    colorClass: {
      light: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        badge: 'bg-purple-50 text-purple-600 border-purple-200'
      },
      dark: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/20',
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      }
    }
  },

  'In Prüfung': {
    key: 'in-pruefung',
    displayName: 'In Prüfung',
    description: 'Bestellung noch offen. Es wurden noch nicht alle Artikel geliefert.',
    actionText: 'Weitere Lieferung erfassen',
    icon: Truck,
    colorClass: {
      light: {
        bg: 'bg-[#6264A7]/10',
        text: 'text-[#6264A7]',
        border: 'border-[#6264A7]/20',
        badge: 'bg-[#6264A7]/10 text-[#6264A7] border-[#6264A7]/20'
      },
      dark: {
        bg: 'bg-[#6264A7]/20',
        text: 'text-[#9ea0e6]',
        border: 'border-[#6264A7]/40',
        badge: 'bg-[#6264A7]/20 text-[#9ea0e6] border-[#6264A7]/40'
      }
    }
  },

  'Teillieferung': {
    key: 'teillieferung',
    displayName: 'Teillieferung',
    description: 'Teilweise geliefert. Es fehlen noch Artikel aus der ursprünglichen Bestellung.',
    actionText: 'Restlieferung erfassen',
    icon: AlertTriangle,
    colorClass: {
      light: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        badge: 'bg-amber-50 text-amber-600 border-amber-200'
      },
      dark: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }
    }
  },

  'Gebucht': {
    key: 'gebucht',
    displayName: 'Gebucht',
    description: 'Wareneingang erfolgreich abgeschlossen. Alle Artikel wurden korrekt geliefert und gebucht.',
    icon: CheckCircle2,
    colorClass: {
      light: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-200'
      },
      dark: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      }
    }
  },

  'Abgeschlossen': {
    key: 'abgeschlossen',
    displayName: 'Abgeschlossen',
    description: 'Wareneingang manuell abgeschlossen. Restmenge wurde storniert oder akzeptiert.',
    icon: Lock,
    colorClass: {
      light: {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-600 border-slate-200'
      },
      dark: {
        bg: 'bg-slate-800',
        text: 'text-slate-400',
        border: 'border-slate-700',
        badge: 'bg-slate-800 text-slate-400 border-slate-700'
      }
    }
  },

  'Schaden': {
    key: 'schaden',
    displayName: 'Schaden',
    description: 'Beschädigte Ware gemeldet. Es wurde ein Qualitätsfall erstellt und eine Reklamation ist offen.',
    actionText: 'Reklamation bearbeiten',
    icon: AlertTriangle,
    colorClass: {
      light: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-red-50 text-red-600 border-red-200'
      },
      dark: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        badge: 'bg-red-500/10 text-red-400 border-red-500/20'
      }
    }
  },

  'Abgelehnt': {
    key: 'abgelehnt',
    displayName: 'Abgelehnt',
    description: 'Lieferung vollständig abgelehnt. Alle Artikel wurden zurückgewiesen und eine Reklamation wurde erstellt.',
    actionText: 'Reklamation prüfen',
    icon: Ban,
    colorClass: {
      light: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-red-50 text-red-600 border-red-200'
      },
      dark: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        badge: 'bg-red-500/10 text-red-400 border-red-500/20'
      }
    }
  },

  'Falsch geliefert': {
    key: 'falsch',
    displayName: 'Falsch geliefert',
    description: 'Falsche Artikel geliefert. Die erhaltenen Artikel entsprechen nicht der Bestellung.',
    actionText: 'Reklamation bearbeiten',
    icon: XCircle,
    colorClass: {
      light: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        badge: 'bg-orange-50 text-orange-600 border-orange-200'
      },
      dark: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/20',
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      }
    }
  },

  'Schaden + Falsch': {
    key: 'schaden-falsch',
    displayName: 'Schaden + Falsch',
    description: 'Mehrere Probleme erkannt: Beschädigte UND falsche Artikel geliefert. Komplexe Reklamation offen.',
    actionText: 'Reklamationen prüfen',
    icon: AlertCircle,
    colorClass: {
      light: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-red-50 text-red-600 border-red-200'
      },
      dark: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
        border: 'border-red-500/20',
        badge: 'bg-red-500/10 text-red-400 border-red-500/20'
      }
    }
  },

  'Übermenge': {
    key: 'uebermenge',
    displayName: 'Übermenge',
    description: 'Mehr Artikel geliefert als bestellt. Überzählige Artikel wurden erfasst und ggf. retourniert.',
    actionText: 'Rücksendung prüfen',
    icon: Info,
    colorClass: {
      light: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        badge: 'bg-orange-50 text-orange-600 border-orange-200'
      },
      dark: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/20',
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      }
    }
  }
};

/**
 * Get status configuration for a given status string
 * Handles case-insensitive matching and common variations
 */
export function getStatusConfig(status: string | undefined): StatusConfig | null {
  if (!status) return null;
  
  const normalized = status.trim().toLowerCase();
  
  // Direct match
  for (const [key, config] of Object.entries(RECEIPT_STATUS_CONFIG)) {
    if (key.toLowerCase() === normalized) {
      return config;
    }
  }
  
  // Fuzzy match for common variations
  if (normalized.includes('prüf')) {
    if (normalized.includes('wartet')) return RECEIPT_STATUS_CONFIG['Wartet auf Prüfung'];
    return RECEIPT_STATUS_CONFIG['In Prüfung'];
  }
  if (normalized.includes('teil')) return RECEIPT_STATUS_CONFIG['Teillieferung'];
  if (normalized.includes('schaden') && normalized.includes('falsch')) return RECEIPT_STATUS_CONFIG['Schaden + Falsch'];
  if (normalized.includes('schaden') || normalized.includes('beschädigt')) return RECEIPT_STATUS_CONFIG['Schaden'];
  if (normalized.includes('falsch')) return RECEIPT_STATUS_CONFIG['Falsch geliefert'];
  if (normalized.includes('abgelehnt')) return RECEIPT_STATUS_CONFIG['Abgelehnt'];
  if (normalized.includes('übermenge') || normalized === 'zu viel') return RECEIPT_STATUS_CONFIG['Übermenge'];
  if (normalized.includes('gebucht') || normalized === 'abgeschlossen' || normalized === 'in bearbeitung') return RECEIPT_STATUS_CONFIG['Gebucht'];
  if (normalized === 'offen') return RECEIPT_STATUS_CONFIG['Offen'];
  
  return null;
}