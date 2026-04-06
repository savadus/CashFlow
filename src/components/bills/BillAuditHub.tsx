'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Receipt, Calendar, Trash2, IndianRupee, Search, Filter, History, ChevronRight, FileText, Share2 } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Bill } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export const BillAuditHub = ({ 
  isOpen, 
  onClose,
  onOpenGenerator,
  onViewBill
}: { 
  isOpen: boolean, 
  onClose: () => void,
  onOpenGenerator: () => void,
  onViewBill: (bill: Bill) => void
}) => {
  const { state, dispatch } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');

  const filteredBills = state.bills.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalBilled = state.bills.reduce((acc, b) => acc + b.total, 0);
  const totalPending = state.bills.filter(b => b.status === 'UNPAID').reduce((acc, b) => acc + b.total, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[250] bg-[#F2F2F7] flex flex-col pt-[env(safe-area-inset-top,0px)]"
        >
          {/* Header */}
          <div className="bg-white border-b border-black/5 px-6 py-6 flex items-center">
             <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors mr-4">
                <ArrowLeft className="w-6 h-6 text-black/40" />
             </button>
             <div>
                <h2 className="text-xl font-black  tracking-tighter italic leading-none text-black">Bill Archives</h2>
                <p className="text-[10px] text-black/30 font-black  tracking-tight mt-1 italic">Billing Audit Hub</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             {/* Stats Cards */}
             <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm">
                   <p className="text-[9px] font-black text-black/20  tracking-tight mb-2">Total Billed</p>
                   <p className="text-2xl font-black tracking-tighter text-black">₹{totalBilled}</p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm">
                   <p className="text-[9px] font-black text-black/20  tracking-tight mb-2">Total Pending</p>
                   <p className="text-2xl font-black tracking-tighter text-expense">₹{totalPending}</p>
                </div>
             </div>

             {/* Search & Filter */}
             <div className="px-6 space-y-4 mb-6">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                   <input 
                      type="text" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="SEARCH CUSTOMER..."
                      className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl font-bold text-xs  tracking-tight outline-none border border-black/5"
                   />
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-black/5 shadow-sm">
                   {(['ALL', 'PAID', 'UNPAID'] as const).map(f => (
                     <button 
                       key={f}
                       onClick={() => setFilter(f)}
                       className={cn("flex-1 py-2 rounded-xl text-[9px] font-black  tracking-tighter transition-all", filter === f ? "bg-black text-white" : "text-black/30")}
                     >
                       {f}
                     </button>
                   ))}
                </div>
             </div>

             {/* Bills List */}
             <div className="px-6 space-y-4 pb-24">
                {filteredBills.length === 0 ? (
                  <div className="bg-white rounded-[40px] p-20 border-2 border-dashed border-black/5 flex flex-col items-center justify-center text-center opacity-40">
                     <History className="w-16 h-16 mb-4 stroke-[1]" />
                     <p className="font-black text-xs  tracking-tight italic">No Archived Bills Found</p>
                  </div>
                ) : (
                  filteredBills.map(bill => (
                    <motion.div 
                      key={bill.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => onViewBill(bill)}
                      className="bg-white rounded-[32px] p-6 border border-black/5 shadow-sm group active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[100%] z-0 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <p className="text-[10px] font-black text-black/20  tracking-tight mb-1 italic">
                                   {format(new Date(bill.date), 'dd MMM yyyy • HH:mm')}
                                </p>
                                <h3 className="text-xl font-black  tracking-tighter italic text-black">{bill.customerName}</h3>
                             </div>
                             <div className={cn("px-4 py-1.5 rounded-full text-[9px] font-black  tracking-tight", bill.status === 'PAID' ? "bg-income/10 text-income" : "bg-expense/10 text-expense")}>
                                {bill.status}
                             </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-black/5 pt-4 mt-2">
                             <div className="flex gap-2">
                                <div className="p-2 bg-gray-50 rounded-xl text-black/20 group-hover:text-ios-blue transition-colors">
                                   <FileText className="w-4 h-4" />
                                </div>
                                <div className="p-2 bg-gray-50 rounded-xl text-black/20 group-hover:text-ios-blue transition-colors">
                                   <Share2 className="w-4 h-4" />
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-black/20  tracking-tight leading-none mb-1">Final Total</p>
                                <p className="text-2xl font-black tracking-tighter text-black leading-none">₹{bill.total}</p>
                             </div>
                          </div>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'DELETE_BILL', payload: bill.id });
                            }}
                            className="absolute -bottom-1 -right-1 p-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </motion.div>
                  ))
                )}
             </div>
          </div>

          {/* Persistent Footer Create Button */}
          <div className="bg-white p-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] border-t border-black/5 shadow-[0_-15px_30px_rgba(0,0,0,0.03)] z-50">
             <button 
               onClick={onOpenGenerator}
               className="w-full bg-black text-white h-16 rounded-[24px] font-black flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all text-sm  tracking-tight italic"
             >
                <div className="p-1.5 bg-white/20 rounded-lg">
                   <Receipt className="w-5 h-5" />
                </div>
                CREATE NEW BILL
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
