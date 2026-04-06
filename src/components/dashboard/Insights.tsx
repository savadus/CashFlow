'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { startOfWeek, startOfMonth, isAfter } from 'date-fns';

interface InsightsProps {
  onIncomeClick: () => void;
  onExpenseClick: () => void;
  onNetClick: () => void;
}

import { useTranslation } from '@/hooks/useTranslation';

export const Insights = React.memo(({ onIncomeClick, onExpenseClick, onNetClick }: InsightsProps) => {
  const { state } = useFinance();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'WEEK' | 'MONTH' | 'ALL'>('ALL');

  const filteredTransactions = state.transactions.filter(t => {
    if (filter === 'ALL') return true;
    const date = new Date(t.date);
    if (filter === 'WEEK') return isAfter(date, startOfWeek(new Date()));
    if (filter === 'MONTH') return isAfter(date, startOfMonth(new Date()));
    return true;
  });

  const income = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const net = income - expense;

  return (
    <div className="px-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] leading-none italic">{t('CASH_POSITION')}</h3>
        <div className="flex items-center gap-4">
          <div className="flex bg-secondary p-1 rounded-xl border border-card-border">
            {(['ALL', 'WEEK', 'MONTH'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-card text-foreground shadow-md" : "text-text-dim"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <motion.button 
          onClick={onIncomeClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card border border-card-border p-4 rounded-[28px] flex flex-col items-center text-center shadow-sm active:bg-secondary transition-colors group"
        >
          <div className="p-2 bg-income/5 rounded-2xl mb-2 group-hover:bg-income/10 transition-colors">
            <TrendingUp className="w-4 h-4 text-income" />
          </div>
          <span className="text-[9px] text-text-dim uppercase font-black tracking-widest mb-1 italic">{t('INCOME')}</span>
          <span className="text-[12px] font-medium italic tracking-tighter text-income">{formatCurrency(income, state.privacyMode)}</span>
        </motion.button>
        
        <motion.button 
          onClick={onExpenseClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card border border-card-border p-4 rounded-[28px] flex flex-col items-center text-center shadow-sm active:bg-secondary transition-colors group"
        >
          <div className="p-2 bg-expense/5 rounded-2xl mb-2 group-hover:bg-expense/10 transition-colors">
            <TrendingDown className="w-4 h-4 text-expense" />
          </div>
          <span className="text-[9px] text-text-dim uppercase font-black tracking-widest mb-1 italic">{t('EXPENSE')}</span>
          <span className="text-[12px] font-medium italic tracking-tighter text-expense">{formatCurrency(expense, state.privacyMode)}</span>
        </motion.button>

        <motion.button 
          onClick={onNetClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-card border border-card-border p-4 rounded-[28px] flex flex-col items-center text-center shadow-sm active:bg-secondary transition-colors group"
        >
          <div className="p-2 bg-ios-blue/5 rounded-2xl mb-2 group-hover:bg-ios-blue/10 transition-colors">
            <Wallet className="w-4 h-4 text-ios-blue" />
          </div>
          <span className="text-[9px] text-text-dim uppercase font-black tracking-widest mb-1 italic">Net</span>
          <span className="text-[12px] font-medium italic tracking-tighter text-foreground">{formatCurrency(net, state.privacyMode)}</span>
        </motion.button>
      </div>
    </div>
  );
});
