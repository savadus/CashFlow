'use client';

import React, { useState } from 'react';
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
import Onboarding from '@/components/dashboard/Onboarding';

import { useTranslation } from '@/hooks/useTranslation';

export default function Home() {
  const { state } = useFinance();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('EXPENSE');
  const [isDebtsOpen, setIsDebtsOpen] = useState(false);
  const [isCashbookOpen, setIsCashbookOpen] = useState(false);
  const [isBillsOpen, setIsBillsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
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
      setIsDebtsOpen(true);
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
    <main className="h-screen overflow-hidden flex flex-col max-w-full lg:max-w-7xl mx-auto w-full bg-[#f8f9ff] relative text-black">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[30%] bg-ios-blue/10 blur-[120px] rounded-none pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-20%] w-[50%] h-[40%] bg-purple-500/10 blur-[100px] rounded-none pointer-events-none" />
      
      <Header 
        onAddClick={() => openAddModal('EXPENSE')} 
        onOpenCashbook={() => setIsCashbookOpen(true)}
        onOpenBills={() => setIsAuditOpen(true)}
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
              <CashPositionCards onDebtsClick={() => setIsDebtsOpen(true)} />
              <div className="px-6 flex items-center justify-between mb-4 mt-8 lg:mt-4">
                <h3 className="text-[10px] font-bold text-black/60  tracking-tight leading-none">{t('ACCOUNTS')}</h3>
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
            <div className="lg:col-span-5 lg:glass lg:rounded-none lg:max-h-[85vh] lg:overflow-y-auto lg:mt-4 lg:mb-8 border border-black/5 shadow-sm">
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
        onClose={() => setIsAuditOpen(false)}
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
        onClose={() => setIsDebtsOpen(false)}
      />

      <CashbookReport 
        isOpen={isCashbookOpen} 
        onClose={() => setIsCashbookOpen(false)} 
      />

      <MoreMenu 
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onOpenBills={() => setIsAuditOpen(true)}
        onOpenCashbook={() => setIsCashbookOpen(true)}
        onOpenLoans={() => {}}
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
        <div className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] bg-white/80 backdrop-blur-xl border-t border-black/5 z-[180] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <button
              onClick={() => openAddModal('EXPENSE')}
              className="flex-1 bg-expense text-white py-4 rounded-none font-black text-sm  tracking-tight active:scale-95 transition-all shadow-lg shadow-expense/20 flex items-center justify-center gap-2"
            >
              <div className="p-1 bg-white/20 rounded-none shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <span>{t('OUT')}</span>
            </button>
            <button
              onClick={() => openAddModal('INCOME')}
              className="flex-1 bg-income text-white py-4 rounded-none font-black text-sm  tracking-tight active:scale-95 transition-all shadow-lg shadow-income/20 flex items-center justify-center gap-2"
            >
              <div className="p-1 bg-white/20 rounded-none shrink-0">
                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </div>
              <span>{t('IN')}</span>
            </button>
            <button
              onClick={() => openAddModal('TRANSFER')}
              className="w-14 h-14 bg-ios-blue text-white rounded-none font-black flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-ios-blue/20 shrink-0"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <button
              onClick={() => setIsMoreOpen(true)}
              className="w-14 h-14 bg-black text-white rounded-none font-black flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-black/10 shrink-0"
            >
              <LayoutGrid className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
