'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, History, Receipt, Wallet, Building2, Building, CreditCard, HandCoins } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { Space } from '@/types';

const accountIcons = {
  'Business Cash': Building2,
  'Personal Cash': Wallet,
  'Institution Cash': Building,
  'Others Cash': CreditCard,
  'Debts': HandCoins,
};

export const SpaceTransactionHub = ({ 
  spaceId, 
  onClose 
}: { 
  spaceId: string | null, 
  onClose: () => void 
}) => {
  const { state } = useFinance();
  
  if (!spaceId) return null;

  const space = state.spaces.find(s => s.id === spaceId);
  if (!space) return null;

  const Icon = accountIcons[space.name as keyof typeof accountIcons] || Building2;

  // Filter transactions for this specific space
  const transactions = state.transactions.filter(t => 
    t.spaceId === spaceId || t.toSpaceId === spaceId
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AnimatePresence>
      {spaceId && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[400] bg-white flex flex-col"
        >
          {/* Industrial Header */}
          <div className="px-6 py-10 pt-16 border-b border-black/5 bg-[#F2F2F7] relative overflow-hidden">
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-ios-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
             
             <div className="flex items-center justify-between relative z-10">
                <button 
                  onClick={onClose}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all border border-black/5"
                >
                  <X className="w-5 h-5 text-black/40" />
                </button>
                <div className="text-right">
                   <h2 className="text-[10px] font-black  tracking-tight italic text-black/30 mb-1 leading-none">Ledger Overview</h2>
                   <p className="text-2xl font-black  tracking-tighter italic text-black leading-none">{space.name}</p>
                </div>
             </div>

             <div className="mt-12 flex items-end justify-between relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-xl shadow-black/5 border border-black/5">
                      <Icon className="w-8 h-8 text-black" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-black/30  tracking-tight mb-1">AVAILABLE BALANCE</p>
                      <h1 className="text-4xl font-black tracking-tighter italic leading-none">
                         {state.privacyMode ? "XXXXXX" : formatCurrency(space.balance, false)}
                      </h1>
                   </div>
                </div>
             </div>
          </div>

          {/* Transactions List */}
          <div className="flex-1 overflow-y-auto bg-white px-6 py-10">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-black/20  tracking-tight italic">Transaction History</h3>
                <div className="px-4 py-1.5 bg-black/5 rounded-full text-[9px] font-black  tracking-tight text-black/40">
                   {transactions.length} ITEMS
                </div>
             </div>

             <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center gap-4 opacity-10">
                     <History className="w-16 h-16" />
                     <p className="text-xs font-black  tracking-tight italic">No Transactions Yet</p>
                  </div>
                ) : (
                  transactions.map(t => {
                    const isIncome = t.type === 'INCOME';
                    const isTransfer = t.type === 'TRANSFER';
                    const isExpense = t.type === 'EXPENSE';
                    
                    // Is money coming IN to this specific account?
                    const isActualIn = (isIncome || (isTransfer && t.toSpaceId === spaceId));

                    return (
                      <div 
                        key={t.id}
                        className="flex items-center gap-5 p-6 bg-white rounded-[32px] border border-black/5 active:scale-[0.98] transition-all group relative overflow-hidden"
                      >
                         {/* Visual Indicator */}
                         <div className={cn(
                            "w-12 h-12 rounded-[20px] flex items-center justify-center relative z-10",
                            isActualIn ? "bg-income/5 text-income" : "bg-expense/5 text-expense"
                         )}>
                            {isActualIn ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                         </div>

                         <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                               <p className="font-black text-black  tracking-tighter italic text-sm leading-none truncate pr-2">{t.note || t.category || 'Transaction'}</p>
                               <span className="text-[8px] font-black text-black/10  tracking-tight bg-black/5 px-2 py-0.5 rounded-full shrink-0">
                                  {new Date(t.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                               </span>
                            </div>
                            <div className="flex items-center gap-2">
                               <p className="text-[9px] font-black opacity-30  tracking-tight truncate">
                                  {isTransfer 
                                     ? `Transfer to ${state.spaces.find(s => s.id === (t.spaceId === spaceId ? t.toSpaceId : t.spaceId))?.name}`
                                     : t.category}
                               </p>
                            </div>
                         </div>

                         <div className="text-right relative z-10 flex flex-col items-end gap-1">
                            <p className={cn(
                               "font-black text-lg tracking-tighter italic leading-none",
                               isActualIn ? "text-income" : "text-expense"
                            )}>
                               {isActualIn ? "+" : "-"}{formatCurrency(t.amount, state.privacyMode)}
                            </p>
                            <p className="text-[8px] font-black text-black/10  tracking-tight font-mono">ID: {t.id.substr(0,4)}</p>
                         </div>
                      </div>
                    );
                  })
                )}
             </div>
          </div>

          {/* New Footer Info */}
          <div className="bg-[#F2F2F7] p-8 border-t border-black/5 flex items-start gap-4 pb-12">
             <Receipt className="w-6 h-6 text-black/20 shrink-0 mt-1" />
             <div>
                <p className="text-[9px] font-black text-black/30 leading-relaxed  tracking-tighter italic">
                   This view shows all verified financial entry points specifically for <span className="text-black">{space.name}</span>. Audit trails are immutable for high-fidelity compliance.
                </p>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
