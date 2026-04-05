'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { Eye, EyeOff } from 'lucide-react';

import { useTranslation } from '@/hooks/useTranslation';

export const BalanceOverview = React.memo(({ onNetClick }: { onNetClick: () => void }) => {
  const { state, dispatch } = useFinance();
  const { t } = useTranslation();
  
  const totalBalance = state.spaces
    .filter(s => s.id !== '5') // Exclude Debts/Loan Space from liquid total
    .reduce((acc, space) => acc + space.balance, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-6 mb-10"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-text-dim text-[10px] font-black uppercase tracking-[0.3em] italic">{t('NET_BALANCE')}</span>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PRIVACY' })}
            className="p-1 px-2.5 bg-secondary rounded-lg hover:bg-tertiary transition-colors border border-card-border"
          >
            {state.privacyMode ? <Eye className="w-3.5 h-3.5 text-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-text-dim" />}
          </button>
        </div>
        <motion.button
          onClick={onNetClick}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="text-left w-fit active:opacity-60 transition-opacity"
        >
          <h2 className={cn(
             "text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-none",
             totalBalance > 0 ? "text-income" : totalBalance < 0 ? "text-expense" : "text-foreground"
          )}>
            {state.privacyMode ? "XXXXXX" : formatCurrency(totalBalance, false)}
          </h2>
        </motion.button>
      </div>
    </motion.div>
  );
});
