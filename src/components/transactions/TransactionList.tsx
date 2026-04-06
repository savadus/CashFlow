'use client';

import React from 'react';
import { Transaction } from '@/types';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Repeat } from 'lucide-react';
import { format } from 'date-fns';

export const TransactionItem = React.memo(({ 
  transaction, 
  onClick 
}: { 
  transaction: Transaction,
  onClick: () => void
}) => {
  const { state } = useFinance();
  const space = state.spaces.find(s => s.id === transaction.spaceId);

  const getIcon = () => {
    switch(transaction.type) {
      case 'INCOME': return <ArrowDownLeft className="text-income" />;
      case 'EXPENSE': return <ArrowUpRight className="text-expense" />;
      case 'TRANSFER': return <Repeat className="text-ios-blue" />;
    }
  };

  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 py-5 px-6 hover:bg-secondary active:scale-[0.98] transition-all text-left outline-none border-none group"
    >
      <div className="w-14 h-14 rounded-3xl bg-card shadow-sm border border-card-border flex items-center justify-center shrink-0 group-hover:shadow-md transition-shadow">
        <div className="scale-125">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-extrabold truncate  tracking-tight text-[10px] text-foreground italic mb-1">{transaction.note || transaction.type}</h4>
        <p className="text-[10px] font-bold text-text-dim truncate  tracking-tight">{space?.name} • {format(new Date(transaction.date), 'MMM d, h:mm a')}</p>
      </div>
      <div className="text-right shrink-0">
        <span className={cn(
          "font-black text-xl tracking-tighter italic",
          transaction.type === 'INCOME' && "text-income",
          transaction.type === 'EXPENSE' && "text-expense",
          transaction.type === 'TRANSFER' && "text-ios-blue"
        )}>
          {transaction.type === 'EXPENSE' ? '-' : '+'}
          {formatCurrency(transaction.amount, state.privacyMode)}
        </span>
      </div>
    </button>
  );
});

import { useTranslation } from '@/hooks/useTranslation';

export const TransactionList = React.memo(({ 
  transactions, 
  onTransactionSelect,
  title = "Recent Transactions" 
}: { 
  transactions: Transaction[], 
  onTransactionSelect: (t: Transaction) => void,
  title?: string 
}) => {
  const { t } = useTranslation();
  const displayTitle = title === "Recent Transactions" ? t('RECENT_TRANSACTIONS') : title;

  return (
    <div className="w-full">
      <h3 className="px-6 py-6 text-[10px] font-extrabold text-text-dim  tracking-tight italic">{displayTitle}</h3>
      <div className="divide-y divide-card-border border-t border-b border-card-border pb-32 lg:pb-8">
        {transactions.length === 0 ? (
          <div className="py-24 text-center text-text-dim font-black  tracking-tight text-[10px] italic">
            ~ {t('NO_TRANSACTIONS')} ~
          </div>
        ) : (
          transactions.map(t => (
            <TransactionItem 
              key={t.id} 
              transaction={t} 
              onClick={() => onTransactionSelect(t)}
            />
          ))
        )}
      </div>
    </div>
  );
});
