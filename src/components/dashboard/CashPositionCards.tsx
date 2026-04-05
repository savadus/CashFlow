'use client';

import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Wallet, Building, Building2, PieChart } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export const CashPositionCards = ({ onDebtsClick }: { onDebtsClick?: () => void }) => {
  const { state } = useFinance();
  const { t } = useTranslation();
  
  const handBalance = state.liquidBalances['IN_HAND'] || 0;
  const banks = state.userProfile?.banks || [];
  const debtsBalance = state.spaces.find(s => s.id === '5')?.balance || 0;

  return (
    <div className="px-6 mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-foreground rounded-full" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-text-dim italic">Where is Cash?</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Hand Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-card border border-card-border p-6 rounded-[32px] shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all"
        >
          <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Wallet className="w-7 h-7 text-emerald-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mb-2 italic">Hand</p>
          <p className="text-xl font-black tracking-tighter text-foreground">
            {formatCurrency(handBalance, state.privacyMode)}
          </p>
        </motion.div>

        {/* Dynamic Banks */}
        {banks.map((bank, index) => {
          const balance = state.liquidBalances[bank.id] || 0;
          return (
            <motion.div 
              key={bank.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-card border border-card-border p-6 rounded-[32px] shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all"
            >
              <div className="w-14 h-14 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-dim truncate w-full mb-2 italic px-2">
                {bank.name}
              </p>
              <p className="text-xl font-black tracking-tighter text-foreground">
                {formatCurrency(balance, state.privacyMode)}
              </p>
            </motion.div>
          );
        })}

        {/* Debts Card */}
        <motion.button 
          onClick={onDebtsClick}
          whileHover={{ y: -5 }}
          className="bg-card border border-card-border p-6 rounded-[32px] shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all"
        >
          <div className="w-14 h-14 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <PieChart className="w-7 h-7 text-rose-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-text-dim mb-2 italic">Debts</p>
          <p className="text-xl font-black tracking-tighter text-foreground">
            {formatCurrency(debtsBalance, state.privacyMode)}
          </p>
        </motion.button>
      </div>
    </div>
  );
};
