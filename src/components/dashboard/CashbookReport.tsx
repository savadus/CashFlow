'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  LayoutGrid,
  List
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency, cn } from '@/lib/utils';
import { Transaction } from '@/types';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CashbookReportProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'LEDGER' | 'MONTHLY';

export const CashbookReport = ({ isOpen, onClose }: CashbookReportProps) => {
  const { state } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('LEDGER');
  const [selectedAccount, setSelectedAccount] = useState<string>('all'); // This is Mode (Bank/Hand)
  const [selectedSpace, setSelectedSpace] = useState<string>('all'); // This is Purpose (Business/Personal)
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');

  const banks = state.userProfile?.banks || [];

  const downloadPDF = () => {
    const doc = new jsPDF();
    const primarySage = [107, 131, 65]; // #6b8341
    
    // Header Section
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("courier", "bold");
    doc.text("CASHBOOK AUDIT", 20, 25);
    
    doc.setFontSize(9);
    doc.setFont("courier", "normal");
    const accountLabel = selectedAccount === 'all' ? 'ALL ACCOUNTS' : (selectedAccount === 'IN_HAND' ? 'IN HAND' : (banks.find(b => b.id === selectedAccount)?.name || selectedAccount.toUpperCase()));
    const spaceLabel = selectedSpace === 'all' ? 'ALL SPACES' : (state.spaces.find(s => s.id === selectedSpace)?.name.toUpperCase() || 'UNKNOWN');
    doc.text(`INDUSTRIAL FISCAL SYSTEM | ${accountLabel} | ${spaceLabel} | ${format(new Date(), 'dd MMM yyyy HH:mm').toUpperCase()}`, 20, 32);
    
    const tableData = ledgerData.map(t => {
      const bankName = t.mode === 'IN_HAND' ? 'IN_HAND' : (banks.find(b => b.id === t.mode)?.name || t.mode.replace('BANK_', ''));
      return [
        format(new Date(t.date), 'dd MMM yyyy'),
        (t.note || 'Entry').toUpperCase(),
        bankName.toUpperCase(),
        t.type === 'EXPENSE' ? `INR ${t.amount}` : '-',
        t.type === 'INCOME' ? `INR ${t.amount}` : '-',
        `INR ${t.runningBalance}`
      ];
    });

    autoTable(doc, {
      startY: 50,
      head: [['DATE', 'DESCRIPTION', 'LOCATION', 'DEBIT (-)', 'CREDIT (+)', 'NET BALANCE']],
      body: tableData,
      theme: 'grid',
      styles: {
        font: 'courier',
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: primarySage as [number, number, number],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`cashbook-audit-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  // Filtered transactions for processing
  const baseTransactions = useMemo(() => {
    let txs = [...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (searchTerm) {
      txs = txs.filter(t => t.note.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (selectedAccount !== 'all') {
      txs = txs.filter(t => t.mode === selectedAccount);
    }

    if (selectedSpace !== 'all') {
      txs = txs.filter(t => t.spaceId === selectedSpace);
    }

    if (dateFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      txs = txs.filter(t => new Date(t.date) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      txs = txs.filter(t => new Date(t.date) >= monthAgo);
    }

    return txs;
  }, [state.transactions, searchTerm, selectedAccount, selectedSpace, dateFilter]);

  // Ledger calculation
  const ledgerData = useMemo(() => {
    let currentBalance = 0;
    const sorted = [...baseTransactions].reverse();
    return sorted.map(t => {
      if (t.type === 'INCOME') currentBalance += t.amount;
      if (t.type === 'EXPENSE') currentBalance -= t.amount;
      return { ...t, runningBalance: currentBalance };
    }).reverse();
  }, [baseTransactions]);

  // Monthly summary calculation
  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number, expense: number, date: Date }> = {};
    
    state.transactions.forEach(t => {
      const monthKey = format(new Date(t.date), 'MMM yyyy');
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0, date: startOfMonth(new Date(t.date)) };
      }
      if (t.type === 'INCOME') months[monthKey].income += t.amount;
      if (t.type === 'EXPENSE') months[monthKey].expense += t.amount;
    });

    return Object.entries(months)
      .sort((a, b) => b[1].date.getTime() - a[1].date.getTime())
      .map(([name, data]) => ({ name, ...data }));
  }, [state.transactions]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[250] bg-white flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-black rounded-[10px] flex items-center justify-center text-white">
                <LayoutGrid className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-xl font-black  tracking-tighter italic leading-none mb-1">CASHBOOK INSIGHTS</h2>
                <p className="text-[10px] text-black/30 font-black  tracking-tight">Full audit of Mvee.in</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-black/5 p-1 rounded-[10px] border border-black/5">
                <button 
                  onClick={() => setViewMode('LEDGER')}
                  className={cn("px-4 py-2 rounded-[10px] text-[10px] font-black  tracking-tight transition-all", viewMode === 'LEDGER' ? "bg-white text-black shadow-md" : "text-black/30")}
                >
                  <List className="w-4 h-4 inline-block mr-1.5" /> LEDGER
                </button>
                <button 
                  onClick={() => setViewMode('MONTHLY')}
                  className={cn("px-4 py-2 rounded-[10px] text-[10px] font-black  tracking-tight transition-all", viewMode === 'MONTHLY' ? "bg-white text-black shadow-md" : "text-black/30")}
                >
                  <Calendar className="w-4 h-4 inline-block mr-1.5" /> MONTHLY
                </button>
             </div>
             <button onClick={onClose} className="p-3 bg-black/5 rounded-[10px]">
                <X className="w-6 h-6 text-black/40" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F2F2F7]">
          {viewMode === 'LEDGER' ? (
            <div className="flex-1 flex flex-col">
               {/* Filters */}
               <div className="p-6 border-b border-black/5 bg-white space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                    <input 
                      type="text" 
                      placeholder="SEARCH TRANSACTION..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-black/5 rounded-[10px] font-black text-xs  tracking-tight outline-none border-none placeholder:text-black/10"
                    />
                  </div>

                  {/* Range Filter */}
                  <div>
                    <p className="text-[9px] font-black  tracking-tight text-black/40 mb-3 ml-2 italic">Temporal Range</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                      {(['all', 'week', 'month'] as const).map(f => (
                         <button 
                           key={f}
                           onClick={() => setDateFilter(f)}
                           className={cn("px-6 py-2.5 rounded-[10px] font-black text-[9px]  tracking-tight whitespace-nowrap active:scale-95 transition-all", dateFilter === f ? "bg-black text-white shadow-lg" : "bg-black/5 text-black/40")}
                         >
                           {f} Range
                         </button>
                      ))}
                    </div>
                  </div>

                  {/* Institutional Hub Filter */}
                  <div>
                    <p className="text-[9px] font-black  tracking-tight text-black/40 mb-3 ml-2 italic">Institutional Hub</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                       <button 
                         onClick={() => setSelectedAccount('all')}
                         className={cn("px-6 py-2.5 rounded-[10px] font-black text-[9px]  tracking-tight whitespace-nowrap active:scale-95 transition-all", selectedAccount === 'all' ? "bg-black text-white shadow-lg" : "bg-black/5 text-black/40")}
                       >
                         All Locations
                       </button>
                       <button 
                         onClick={() => setSelectedAccount('IN_HAND')}
                         className={cn("px-6 py-2.5 rounded-[10px] font-black text-[9px]  tracking-tight whitespace-nowrap active:scale-95 transition-all text-black", selectedAccount === 'IN_HAND' ? "bg-black text-white shadow-lg" : "bg-black/5 text-black/40")}
                       >
                         In Hand
                       </button>
                       {banks.map(b => (
                          <button 
                            key={b.id}
                            onClick={() => setSelectedAccount(b.id)}
                            className={cn("px-6 py-2.5 rounded-[10px] font-black text-[9px]  tracking-tight whitespace-nowrap active:scale-95 transition-all text-black", selectedAccount === b.id ? "bg-black text-white shadow-lg" : "bg-black/5 text-black/40")}
                          >
                            {b.name}
                          </button>
                       ))}
                    </div>
                  </div>

                  {/* Fiscal Purpose Filter */}
                  <div>
                    <p className="text-[9px] font-black  tracking-tight text-black/40 mb-3 ml-2 italic">Fiscal Purpose</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                       <button 
                         onClick={() => setSelectedSpace('all')}
                         className={cn("px-6 py-2.5 rounded-[10px] font-black text-[9px]  tracking-tight whitespace-nowrap active:scale-95 transition-all", selectedSpace === 'all' ? "bg-black text-white shadow-lg" : "bg-black/5 text-black/40")}
                       >
                         All Purposes
                       </button>
                       {state.spaces.map(s => (
                          <button 
                            key={s.id}
                            onClick={() => setSelectedSpace(s.id)}
                            className={cn("px-6 py-2.5 rounded-[10px] font-black text-[9px]  tracking-tight whitespace-nowrap active:scale-95 transition-all text-black", selectedSpace === s.id ? "bg-black text-white shadow-lg" : "bg-black/5 text-black/40")}
                          >
                            {s.name}
                          </button>
                       ))}
                    </div>
                  </div>

               </div>

               {/* Grid-style Ledger Table */}
               <div className="p-6">
                  <div className="bg-white rounded-[10px] overflow-hidden border border-black/5 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-black/5 text-[9px] font-black  tracking-tight text-black/30 italic">
                            <th className="p-6">Date</th>
                            <th className="p-6">Description</th>
                            <th className="p-6 text-right">Debit (-)</th>
                            <th className="p-6 text-right">Credit (+)</th>
                            <th className="p-6 text-right">Net Bal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {ledgerData.map(t => (
                            <tr key={t.id} className="group hover:bg-gray-50 transition-colors">
                              <td className="p-6 text-[10px] font-black text-black/30  italic">{format(new Date(t.date), 'dd MMM')}</td>
                              <td className="p-6">
                                 <p className="font-black text-xs  italic tracking-tight">{t.note || 'Entry'}</p>
                                 <p className="text-[9px] font-bold text-black/10  tracking-tight mt-1">{t.category || t.type}</p>
                              </td>
                              <td className="p-6 text-right font-black text-xs text-expense italic">
                                {t.type === 'EXPENSE' ? `-₹${t.amount}` : '-'}
                              </td>
                              <td className="p-6 text-right font-black text-xs text-income italic">
                                {t.type === 'INCOME' ? `+₹${t.amount}` : '-'}
                              </td>
                              <td className="p-6 text-right font-black text-xs text-black italic">
                                ₹{t.runningBalance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {monthlyData.map(m => (
                    <div key={m.name} className="bg-white rounded-[10px] p-8 border border-black/5 shadow-sm space-y-8 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] rounded-[10px]-full" />
                       
                       <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black italic tracking-tighter  text-black">{m.name}</h3>
                          <div className="w-10 h-10 bg-black text-white rounded-[10px] flex items-center justify-center font-black text-[10px] italic">#{m.name.slice(0,3)}</div>
                       </div>

                       <div className="grid grid-cols-2 gap-8 relative z-10">
                          <div>
                             <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-3.5 h-3.5 text-income" />
                                <span className="text-[10px] font-black text-black/20  tracking-tight italic">Income</span>
                             </div>
                             <p className="text-2xl font-black tracking-tighter text-income italic">₹{m.income}</p>
                          </div>
                          <div>
                             <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-3.5 h-3.5 text-expense" />
                                <span className="text-[10px] font-black text-black/20  tracking-tight italic">Expense</span>
                             </div>
                             <p className="text-2xl font-black tracking-tighter text-expense italic">₹{m.expense}</p>
                          </div>
                       </div>

                       <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                          <div>
                             <span className="text-[9px] font-black text-black/30  tracking-tight block mb-1">CashFlow Profit/Loss</span>
                             <p className={cn("text-3xl font-black tracking-tighter italic", (m.income - m.expense) >= 0 ? "text-ios-blue" : "text-expense")}>
                                ₹{m.income - m.expense}
                             </p>
                          </div>
                          <div className={cn("px-4 py-1.5 rounded-[10px] text-[9px] font-black  tracking-tight", (m.income - m.expense) >= 0 ? "bg-income/10 text-income" : "bg-expense/10 text-expense")}>
                             {(m.income - m.expense) >= 0 ? 'Surplus' : 'Deficit'}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* Audit Footer (Square Buttons) */}
        <div className="p-6 bg-white border-t border-black/5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] flex gap-4">
           <button 
             onClick={downloadPDF}
             className="flex-1 bg-black text-white py-5 rounded-[10px] font-black text-sm shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all  tracking-tight italic"
           >
              DOWNLOAD RECORD <Download className="w-5 h-5" />
           </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
