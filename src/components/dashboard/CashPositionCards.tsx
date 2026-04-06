'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Building, Building2, PieChart, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export const CashPositionCards = ({ onDebtsClick }: { onDebtsClick?: () => void }) => {
  const { state } = useFinance();
  const { t } = useTranslation();
  const [isBanksModalOpen, setIsBanksModalOpen] = React.useState(false);
  
  const handBalance = state.liquidBalances['IN_HAND'] || 0;
  const banks = state.userProfile?.banks || [];
  const debtsBalance = state.spaces.find(s => s.id === '5')?.balance || 0;

  const totalBankBalance = banks.reduce((acc, bank) => acc + (state.liquidBalances[bank.id] || 0), 0);

  return (
    <div className="px-6 mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-foreground rounded-none" />
        <h3 className="text-[11px] font-black  tracking-tight text-text-dim italic">Where is Cash?</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Hand Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-card border border-card-border p-4 rounded-none shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-none bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Wallet className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-[9px] font-black  tracking-tight text-text-dim mb-1 italic">Hand</p>
          <p className="text-sm md:text-lg font-black tracking-tighter text-foreground">
            {formatCurrency(handBalance, state.privacyMode)}
          </p>
        </motion.div>

        {/* Unified "In Banks" Card */}
        <motion.button 
          onClick={() => setIsBanksModalOpen(true)}
          whileHover={{ y: -5 }}
          className="bg-card border border-card-border p-4 rounded-none shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-none bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-[9px] font-black  tracking-tight text-text-dim mb-1 italic">In Banks</p>
          <p className="text-sm md:text-lg font-black tracking-tighter text-foreground">
            {formatCurrency(totalBankBalance, state.privacyMode)}
          </p>
        </motion.button>

        {/* Debts Card */}
        <motion.button 
          onClick={onDebtsClick}
          whileHover={{ y: -5 }}
          className="bg-card border border-card-border p-4 rounded-none shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-none bg-rose-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PieChart className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-[9px] font-black  tracking-tight text-text-dim mb-1 italic">Debts</p>
          <p className="text-sm md:text-lg font-black tracking-tighter text-foreground">
            {formatCurrency(debtsBalance, state.privacyMode)}
          </p>
        </motion.button>
      </div>

      {/* Banks Detail Modal */}
      <AnimatePresence>
        {isBanksModalOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsBanksModalOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400]"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="fixed left-6 right-6 top-1/2 -translate-y-1/2 bg-background border border-card-border rounded-none z-[401] overflow-hidden shadow-2xl"
            >
               <div className="p-8 border-b border-card-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-500 text-white rounded-none flex items-center justify-center">
                        <Building className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-lg font-black  tracking-tighter italic leading-none mb-1">Institutional Hub</h2>
                        <p className="text-[10px] text-text-dim font-black  tracking-tight italic">Sector-wise Liquidity Audit</p>
                     </div>
                  </div>
                  <button onClick={() => setIsBanksModalOpen(false)} className="p-3 bg-secondary rounded-none hover:bg-tertiary transition-colors">
                     <X className="w-6 h-6 text-text-dim" />
                  </button>
               </div>
               <div className="p-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-3">
                     {banks.map(bank => (
                        <div key={bank.id} className="bg-secondary p-8 rounded-none border border-card-border flex items-center justify-between group hover:bg-tertiary transition-all">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-blue-500/10 rounded-none flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <Building2 className="w-6 h-6 text-blue-500" />
                              </div>
                              <p className="font-black text-sm  tracking-tight italic text-foreground">{bank.name}</p>
                           </div>
                           <p className="text-xl font-black tracking-tighter text-foreground italic">
                              {formatCurrency(state.liquidBalances[bank.id] || 0, state.privacyMode)}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="p-8 bg-black text-white flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black  tracking-tight opacity-40 mb-1">AGGREGATE HOLDINGS</p>
                     <p className="text-3xl font-black tracking-tighter italic text-blue-400">
                        {formatCurrency(totalBankBalance, state.privacyMode)}
                     </p>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black  tracking-tight opacity-20">Verified Sector Hub</p>
                     <p className="text-[9px] font-black  tracking-tight opacity-20 italic">Industrial Series 1.0</p>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
