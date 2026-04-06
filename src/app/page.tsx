'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/dashboard/Header';
import { BalanceOverview } from '@/components/dashboard/BalanceOverview';
import { SpaceGrid } from '@/components/dashboard/SpaceGrid';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { useFinance } from '@/context/FinanceContext';
import { TransactionType, Transaction, Bill } from '@/types';
import { LayoutGrid } from 'lucide-react';

import { TripDetail } from '@/components/trips/TripDetail';
import { Insights } from '@/components/dashboard/Insights';
import { CashPositionCards } from '@/components/dashboard/CashPositionCards';
import { CashbookReport } from '@/components/dashboard/CashbookReport';
import { BillGenerator } from '@/components/bills/BillGenerator';
import { MoreMenu } from '@/components/dashboard/MoreMenu';
import { TransactionEditModal } from '@/components/transactions/TransactionEditModal';
import { FilteredTransactionHub } from '@/components/transactions/FilteredTransactionHub';
import { BillAuditHub } from '@/components/bills/BillAuditHub';
import { SpaceTransactionHub } from '@/components/dashboard/SpaceTransactionHub';
import { CollectionHub } from '@/components/dashboard/CollectionHub';
import { SecurityHub } from '@/components/dashboard/SecurityHub';
import Onboarding from '@/components/dashboard/Onboarding';

import { useTranslation } from '@/hooks/useTranslation';

export default function Home() {
  const { state, dispatch } = useFinance();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('EXPENSE');
  const [isBillsOpen, setIsBillsOpen] = useState(false);
  const isMoreOpen = state.activeHub === 'MORE';
  const isAuditOpen = state.activeHub === 'BILLS';
  const isCashbookOpen = state.activeHub === 'CASHBOOK';
  const isDebtsOpen = state.activeHub === 'LOANS';
  const isCollectionOpen = state.activeHub === 'COLLECTION';
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filterHubType, setFilterHubType] = useState<'INCOME' | 'EXPENSE' | 'ALL' | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  const openAddModal = (type: TransactionType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSpaceSelect = (id: string) => {
    const space = state.spaces.find(s => s.id === id);
    if (space?.name === 'Debts') {
      dispatch({ type: 'SET_ACTIVE_HUB', payload: 'LOANS' });
    } else {
      setActiveSpaceId(id);
    }
  };

  const filteredTransactions = selectedSpaceId 
    ? state.transactions.filter(t => t.spaceId === selectedSpaceId || t.toSpaceId === selectedSpaceId)
    : state.transactions;

  const selectedSpaceName = selectedSpaceId 
    ? state.spaces.find(s => s.id === selectedSpaceId)?.name 
    : t('RECENT_TRANSACTIONS');

  const isAnyOverlayOpen = isBillsOpen || isModalOpen || isDebtsOpen || isCashbookOpen || isMoreOpen || !!editingTransaction || !!filterHubType || isAuditOpen;

  if (!state.userProfile) {
    return <Onboarding />;
  }

  return (
    <main className="h-screen overflow-hidden flex flex-col max-w-full lg:max-w-7xl mx-auto w-full bg-[#FAF9F6] relative text-black">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[30%] bg-ios-blue/10 blur-[120px] rounded-[10px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-20%] w-[50%] h-[40%] bg-purple-500/10 blur-[100px] rounded-[10px] pointer-events-none" />
      
      <Header 
        onAddClick={() => openAddModal('EXPENSE')} 
        onOpenCashbook={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'CASHBOOK' })}
        onOpenBills={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'BILLS' })}
      />
      
      <div className="flex-1 overflow-y-auto pb-48 lg:pb-8 scroll-smooth">
        <div className="pt-8 lg:pt-12 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:px-6">
            <div className="lg:col-span-7">
              <BalanceOverview 
                onNetClick={() => setFilterHubType('ALL')}
              />
              <Insights 
                onIncomeClick={() => setFilterHubType('INCOME')}
                onExpenseClick={() => setFilterHubType('EXPENSE')}
                onNetClick={() => setFilterHubType('ALL')}
              />
              <CashPositionCards onDebtsClick={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'LOANS' })} />
              <div className="px-6 flex items-center justify-between mb-4 mt-8 lg:mt-4">
                <h3 className="text-xs font-bold text-black/60 tracking-tight leading-none">{t('ACCOUNTS')}</h3>
                {selectedSpaceId && (
                  <button 
                    onClick={() => setSelectedSpaceId(null)}
                    className="text-[10px] font-bold text-ios-blue  tracking-tight leading-none"
                  >
                    {t('CLEAR_FILTER')}
                  </button>
                )}
              </div>
              <SpaceGrid onSpaceSelect={handleSpaceSelect} />
            </div>
            <div className="lg:col-span-5 lg:glass lg:rounded-[10px] lg:max-h-[85vh] lg:overflow-y-auto lg:mt-4 lg:mb-8 border border-black/5 shadow-sm">
              <TransactionList 
                transactions={filteredTransactions} 
                onTransactionSelect={(t) => setEditingTransaction(t)}
                title={selectedSpaceId ? `${selectedSpaceName} ${t('RECENT_TRANSACTIONS')}` : t('RECENT_TRANSACTIONS')} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overlays (Opening in New Windows) */}
      <BillAuditHub 
        isOpen={isAuditOpen}
        onClose={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'MORE' })}
        onOpenGenerator={() => {
           setSelectedBill(null);
           setIsBillsOpen(true);
        }}
        onViewBill={(bill) => {
           setSelectedBill(bill);
           setIsBillsOpen(true);
        }}
      />
 
      <SpaceTransactionHub 
        spaceId={activeSpaceId}
        onClose={() => setActiveSpaceId(null)}
      />
 
      <BillGenerator 
        isOpen={isBillsOpen} 
        onClose={() => {
           setIsBillsOpen(false);
           setSelectedBill(null);
        }} 
        initialBill={selectedBill || undefined}
      />
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialType={modalType}
      />
 
      <TripDetail 
        isOpen={isDebtsOpen}
        onClose={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'MORE' })}
      />
 
      <CashbookReport 
        isOpen={isCashbookOpen} 
        onClose={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'MORE' })} 
      />
 
      <MoreMenu 
        isOpen={isMoreOpen}
        onClose={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'NONE' })}
        onOpenBills={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'BILLS' })}
        onOpenCashbook={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'CASHBOOK' })}
        onOpenLoans={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'LOANS' })}
        onOpenCollection={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'COLLECTION' })}
      />
 
      <CollectionHub 
        isOpen={isCollectionOpen}
        onClose={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'MORE' })}
      />

      <TransactionEditModal 
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />

      <FilteredTransactionHub 
        isOpen={!!filterHubType}
        type={filterHubType}
        onClose={() => setFilterHubType(null)}
        onTransactionSelect={(t) => {
           setEditingTransaction(t);
           // Closing the hub is optional, but for now we'll allow stacked overlays for speed
        }}
      />

      {/* Auto-Hide Footer Navigation (Square Sharp Icons) */}
      {!isAnyOverlayOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] bg-white/80 backdrop-blur-xl border-t border-black/5 z-[180] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <button
              onClick={() => openAddModal('EXPENSE')}
              className="flex-1 bg-expense text-white h-11 rounded-[10px] font-black text-xs  tracking-tight active:scale-95 transition-all shadow-lg shadow-expense/20 flex items-center justify-center gap-2"
            >
              <div className="p-0.5 bg-white/20 rounded-[10px] shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <span>{t('OUT')}</span>
            </button>
            <button
              onClick={() => openAddModal('INCOME')}
              className="flex-1 bg-income text-white h-11 rounded-[10px] font-black text-xs  tracking-tight active:scale-95 transition-all shadow-lg shadow-income/20 flex items-center justify-center gap-2"
            >
              <div className="p-0.5 bg-white/20 rounded-[10px] shrink-0">
                 <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <span>{t('IN')}</span>
            </button>
            <button
              onClick={() => openAddModal('TRANSFER')}
              className="w-11 h-11 bg-ios-blue text-white rounded-[10px] font-black flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-ios-blue/20 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <button
               onClick={() => dispatch({ type: 'SET_ACTIVE_HUB', payload: 'MORE' })}
               className="w-11 h-11 bg-black text-white rounded-[10px] font-black flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-black/10 shrink-0"
             >
               <LayoutGrid className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}

      {/* Sovereign Perimeter Lockdown */}
      <AnimatePresence>
        {state.isLocked && <SecurityHub />}
      </AnimatePresence>
    </main>
  );
}
