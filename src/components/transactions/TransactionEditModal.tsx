'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Tag, FileText, Save, CheckCircle2, ArrowRight } from 'lucide-react';
import { Transaction } from '@/types';
import { useFinance } from '@/context/FinanceContext';
import { cn } from '@/lib/utils';

interface TransactionEditModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionEditModal = ({ transaction, isOpen, onClose }: TransactionEditModalProps) => {
  const { state, dispatch } = useFinance();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setNote(transaction.note || '');
      setCategory(transaction.category || '');
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction) return;
    const newAmount = parseFloat(amount);
    if (isNaN(newAmount)) return;

    dispatch({
      type: 'UPDATE_TRANSACTION',
      payload: {
        ...transaction,
        amount: newAmount,
        note,
        category,
      },
    });
    onClose();
  };

  const handleDelete = () => {
    if (!transaction) return;
    if (confirm('Are you sure you want to delete this transaction?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: transaction.id });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[220] bg-white flex flex-col pt-[env(safe-area-inset-top,0px)]"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-black/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-[10px] transition-colors"
            >
              <X className="w-6 h-6 text-black/40" />
            </button>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight  italic">{transaction?.type} DETAIL</h2>
              <p className="text-[10px] text-black/30 font-black  tracking-tight">Transaction ID #{transaction?.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F2F2F7]">
          <div className="p-6 space-y-8">
            {/* Amount Visualizer */}
            <div className="bg-white rounded-[10px] p-10 border border-black/5 shadow-sm text-center relative overflow-hidden group">
               <div className={cn(
                 "absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.05]",
                 transaction?.type === 'INCOME' ? "bg-income" : "bg-expense"
               )} />
               <p className="text-[10px] font-black text-black/30  tracking-tight mb-6 relative z-10">Current Amount</p>
               <div className="flex items-center justify-center gap-3 relative z-10">
                  <span className="text-4xl font-black text-black/20 italic">₹</span>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={cn(
                      "text-7xl font-black italic tracking-tighter bg-transparent outline-none w-full text-center max-w-[280px]",
                      transaction?.type === 'INCOME' ? "text-income" : "text-expense"
                    )}
                  />
               </div>
               <div className="mt-8 flex justify-center">
                  <div className={cn(
                    "px-6 py-2 rounded-[10px] font-black text-[10px]  tracking-tight",
                    transaction?.type === 'INCOME' ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
                  )}>
                    {transaction?.type === 'INCOME' ? 'Money Received' : 'Money Spent'}
                  </div>
               </div>
            </div>

            {/* Smart Details Card */}
            <div className="bg-white rounded-[10px] overflow-hidden border border-black/5 shadow-sm">
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-ios-blue/5 rounded-[10px] flex items-center justify-center text-ios-blue">
                           <Tag className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-black/30  tracking-tight mb-1">Category</p>
                           <input 
                             type="text" 
                             value={category}
                             onChange={(e) => setCategory(e.target.value)}
                             placeholder="Add category..."
                             className="w-full bg-transparent font-black text-base outline-none text-black placeholder:text-black/10"
                           />
                        </div>
                    </div>
                    <div className="h-px bg-black/5" />
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-purple-500/5 rounded-[10px] flex items-center justify-center text-purple-500">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-black/30  tracking-tight mb-1">Notes</p>
                           <input 
                             type="text" 
                             value={note}
                             onChange={(e) => setNote(e.target.value)}
                             placeholder="Add details..."
                             className="w-full bg-transparent font-black text-base outline-none text-black placeholder:text-black/10"
                           />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="px-4 py-8 text-center space-y-3">
               <div className="flex items-center justify-center gap-2 text-black/20 font-black text-[10px]  tracking-tight">
                  <CheckCircle2 className="w-3 h-3" />
                  Secured & Locked
               </div>
               <p className="text-[10px] font-bold text-black/20 italic max-w-[200px] mx-auto leading-relaxed">
                  Date: {transaction ? new Date(transaction.date).toLocaleString() : ''}
               </p>
            </div>
          </div>
        </div>

        {/* Action Footer (Square Buttons) */}
        <div className="p-6 bg-white border-t border-black/5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] space-y-3">
           <button 
             onClick={handleSave}
             className="w-full bg-ios-blue text-white py-5 rounded-[10px] font-black text-lg shadow-2xl shadow-ios-blue/20 flex items-center justify-center gap-4 active:scale-[0.98] transition-all  tracking-tight italic"
           >
              SAVE UPDATES <ArrowRight className="w-6 h-6" />
           </button>
           <button 
             onClick={handleDelete}
             className="w-full bg-red-50 text-red-500 py-4 rounded-[10px] font-black text-xs shadow-sm flex items-center justify-center gap-3 active:bg-red-100 transition-all  tracking-tight italic"
           >
              <Trash2 className="w-4 h-4" /> DELETE TRANSACTION
           </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
