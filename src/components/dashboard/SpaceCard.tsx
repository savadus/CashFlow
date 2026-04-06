'use client';

import React from 'react';
import { Space } from '@/types';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Building2, Wallet, CreditCard, HandCoins, Building } from 'lucide-react';

const icons = {
  'Business Cash': Building2,
  'Personal Cash': Wallet,
  'Institution Cash': Building,
  'Others Cash': CreditCard,
  'Debts': HandCoins,
};

export const SpaceCard = ({ space, onClick }: { space: Space, onClick: () => void }) => {
  const { state } = useFinance();
  const Icon = icons[space.name as keyof typeof icons] || Building2;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card border border-card-border p-5 rounded-3xl flex flex-col items-start w-full text-left shadow-sm active:bg-secondary transition-all"
    >
      <div className={cn(
        "p-3 rounded-2xl mb-6 bg-tertiary",
        space.name === 'Business Cash' && "text-emerald-500 font-semibold",
        space.name === 'Personal Cash' && "text-blue-600 font-semibold",
        space.name === 'Institution Cash' && "text-orange-600 font-semibold",
        space.name === 'Others Cash' && "text-purple-600 font-semibold",
        space.name === 'Debts' && "text-amber-600 font-semibold"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-text-dim text-[11px] font-semibold  tracking-tight mb-1">{space.name}</span>
      <span className="text-xl font-medium italic tracking-tighter text-foreground">
        {state.privacyMode ? "XXXXXX" : formatCurrency(space.balance, false)}
      </span>
    </motion.button>
  );
};
