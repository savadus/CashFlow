'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Wallet, Search } from 'lucide-react';
import { Transaction } from '@/types';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { TransactionList } from './TransactionList';

interface FilteredTransactionHubProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'INCOME' | 'EXPENSE' | 'ALL' | null;
  onTransactionSelect: (t: Transaction) => void;
}

export const FilteredTransactionHub = ({ isOpen, onClose, type, onTransactionSelect }: FilteredTransactionHubProps) => {
  const { state } = useFinance();

  const filteredTransactions = state.transactions.filter(t => {
    if (type === 'ALL' || !type) return true;
    return t.type === type;
  });

  const getHeaderInfo = () => {
    switch (type) {
      case 'INCOME': return { title: 'Income Ledger', icon: TrendingUp, color: 'text-income', bg: 'bg-income/10' };
      case 'EXPENSE': return { title: 'Expense Ledger', icon: TrendingDown, color: 'text-expense', bg: 'bg-expense/10' };
      default: return { title: 'All Transactions', icon: Wallet, color: 'text-ios-blue', bg: 'bg-ios-blue/10' };
    }
  };

  const info = getHeaderInfo();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        className="fixed inset-0 z-[230] bg-[#F2F2F7] flex flex-col"
      >
        {/* Header Bar */}
        <div className="bg-white border-b border-black/5 px-6 py-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-[10px] flex items-center justify-center", info.bg)}>
               <info.icon className={cn("w-6 h-6", info.color)} />
            </div>
            <div>
               <h2 className="text-xl font-black text-black tracking-tight  italic">{info.title}</h2>
               <p className="text-[10px] font-black text-black/30  tracking-tight">{filteredTransactions.length} Transactions Recorded</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-black/5 rounded-[10px] flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="w-6 h-6 text-black/40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
           {/* Summary Strip */}
           <div className="bg-white px-6 py-8 border-b border-black/5 mb-4 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-black/20  tracking-tight mb-1 italic">Total Sum</p>
                 <h3 className={cn("text-4xl font-black italic tracking-tighter", info.color)}>
                    {formatCurrency(filteredTransactions.reduce((acc, t) => acc + t.amount, 0), state.privacyMode)}
                 </h3>
              </div>
              <div className="w-12 h-12 rounded-[10px] border-2 border-black/5 flex items-center justify-center opacity-20">
                 <Search className="w-5 h-5" />
              </div>
           </div>

           <div className="bg-white min-h-full">
              <TransactionList 
                transactions={filteredTransactions}
                onTransactionSelect={onTransactionSelect}
                title={`${type || 'All'} History`}
              />
           </div>
        </div>

        {/* Global Footer Lock (Square Sharp Design) */}
        <div className="p-6 bg-white border-t border-black/5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)]">
           <div className="w-full py-4 text-center text-[10px] font-black text-black/20  tracking-tight italic">
              ~ CashFlow Audit System Secured ~
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
