import React from 'react';
import { ShoppingCart, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import { Theme } from '../types';

interface LifecycleStepperProps {
  status: string;
  hasOpenTickets: boolean;
  receiptStatus?: string;
  theme: Theme;
}

type StepState = 'completed' | 'current' | 'pending' | 'issue';

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({ status, hasOpenTickets, receiptStatus, theme }) => {
  const isDark = theme === 'dark';

  // --- Logic to determine the state of Step 2 (Wareneingang) ---
  const rs = (receiptStatus || '').toLowerCase();
  const hasReceiptIssues = ['schaden', 'falsch', 'beschädigt', 'abgelehnt', 'schaden + falsch'].some(k => rs.includes(k));

  const getStep2State = (): StepState => {
    // Priority 1: Issues from tickets OR receipt quality problems
    if (hasOpenTickets || hasReceiptIssues) return 'issue';
    
    // Priority 2: Completed (only if receipt is also clean)
    if (status === 'Abgeschlossen') return 'completed';
    
    // Priority 3: In Progress (Partial or In Check)
    if (status === 'Teilweise geliefert' || status === 'Teillieferung' || status === 'In Prüfung' || status === 'Wartet auf Prüfung') {
        return 'current';
    }
    
    // Default: Pending (e.g. 'Offen', 'Projekt')
    return 'pending';
  };

  // --- Logic to determine the state of Step 3 (Abschluss) ---
  const getStep3State = (): StepState => {
    // Don't show completed if there are receipt issues
    if (status === 'Abgeschlossen' && !hasReceiptIssues && !hasOpenTickets) return 'completed';
    return 'pending';
  };

  const steps = [
    { 
        id: 1, 
        label: 'Bestellt', 
        icon: ShoppingCart, 
        state: 'completed' as StepState 
    },
    { 
        id: 2, 
        label: 'Wareneingang', 
        icon: Truck, 
        state: getStep2State() 
    },
    { 
        id: 3, 
        label: 'Erledigt', 
        icon: CheckCircle, 
        state: getStep3State() 
    },
  ];

  // Helper for Bubble Styles
  const getBubbleStyle = (state: StepState) => {
    switch (state) {
      case 'completed': 
        return 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20';
      case 'issue': 
        return 'bg-red-500 text-white border-red-500 animate-pulse shadow-md shadow-red-500/20';
      case 'current': 
        return 'bg-[#0077B5] text-white border-[#0077B5] ring-4 ring-[#0077B5]/20 shadow-lg shadow-blue-500/30 scale-110';
      case 'pending': 
        return isDark 
            ? 'bg-slate-800 text-slate-600 border-slate-700' 
            : 'bg-slate-200 text-slate-400 border-slate-300';
    }
  };

  return (
    <div className="flex items-center w-full max-w-[300px] mx-auto py-2">
        {steps.map((step, index) => (
            <React.Fragment key={step.id}>
                
                {/* Connector Line (Rendered before steps 2 and 3) */}
                {index > 0 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-500 ${
                        // Line is colored if the *current* step (step.state) is active/reached
                        step.state !== 'pending' 
                            ? 'bg-emerald-500' 
                            : (isDark ? 'bg-slate-800' : 'bg-slate-200')
                    }`} />
                )}
                
                {/* Step Circle */}
                <div className="relative flex flex-col items-center group">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${getBubbleStyle(step.state)}`}>
                        {step.state === 'issue' ? <AlertTriangle size={16} /> : <step.icon size={16} />}
                    </div>
                    
                    {/* Label (Hidden on Mobile) */}
                    <div className={`hidden md:block absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        step.state === 'pending' 
                            ? (isDark ? 'text-slate-600' : 'text-slate-400') 
                            : (isDark ? 'text-slate-300' : 'text-slate-600')
                    }`}>
                        {step.label}
                    </div>
                </div>

            </React.Fragment>
        ))}
    </div>
  );
};