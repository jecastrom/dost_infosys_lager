import React from 'react';
import { getStatusConfig } from './ReceiptStatusConfig';
import { PackagePlus } from 'lucide-react';
import { Theme, ReceiptMasterStatus } from '../types';

interface StatusDescriptionProps {
  status: ReceiptMasterStatus | string;
  theme: Theme;
  onAction?: () => void;
  showActionButton?: boolean;
}

/**
 * StatusDescription Component
 * 
 * Displays a prominent status card in the central area of the receipt detail view.
 * Shows icon, status name, description, and optional action button.
 * 
 * This component ensures consistent status communication across the application.
 */
export const StatusDescription: React.FC<StatusDescriptionProps> = ({ 
  status, 
  theme, 
  onAction,
  showActionButton = true 
}) => {
  const isDark = theme === 'dark';
  const config = getStatusConfig(status);

  // If no config found, don't render anything
  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const colors = isDark ? config.colorClass.dark : config.colorClass.light;

  return (
    <div className={`rounded-2xl border p-6 flex items-center justify-between ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${colors.bg} ${colors.text}`}>
          <Icon size={28} strokeWidth={2} />
        </div>
        <div>
          <h4 className={`font-bold text-lg mb-1 ${colors.text}`}>
            {config.displayName}
          </h4>
          <p className={`text-sm ${colors.text} opacity-80`}>
            {config.description}
          </p>
        </div>
      </div>
      
      {showActionButton && config.actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#0077B5] hover:bg-[#00A0DC] text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <PackagePlus size={18} />
          <span className="hidden sm:inline">{config.actionText}</span>
        </button>
      )}
    </div>
  );
};