'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle, UserPlus, Info, Save, Trash2, User, Landmark, Wallet, Building2, ChevronRight } from 'lucide-react';
import { TripMember, TripSpace, LiquidMode } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { useTranslation } from '@/hooks/useTranslation';

export const TripDetail = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { state, dispatch } = useFinance();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const [recoveryMemberId, setRecoveryMemberId] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState<LiquidMode>('IN_HAND');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferName, setTransferName] = useState('');

  const debtsSpace = state.spaces.find(s => s.id === '5') as TripSpace;
  const members = debtsSpace?.members || [];

  const banks = [
    { id: 'BANK_BARODA', name: 'Baroda', color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'BANK_SBI', name: 'SBI BANK', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'BANK_SIB', name: 'SIB BANK', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    dispatch({
      type: 'ADD_TRIP_MEMBER',
      payload: {
        spaceId: '5',
        member: {
          id: Math.random().toString(36).substr(2, 9),
          name: newName,
          amount: parseFloat(newAmount),
          status: 'UNPAID'
        }
      }
    });

    setNewName('');
    setNewAmount('');
    setIsAdding(false);
  };

  const handleRecover = (memberId: string, targetSpaceId: string) => {
    dispatch({
      type: 'TOGGLE_TRIP_MEMBER_STATUS',
      payload: { spaceId: '5', memberId, targetSpaceId, mode: recoveryMode }
    });
    setRecoveryMemberId(null);
  };

  const toggleStatus = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member?.status === 'UNPAID') {
       setRecoveryMemberId(memberId);
       setRecoveryMode('IN_HAND');
    } else {
       dispatch({
         type: 'TOGGLE_TRIP_MEMBER_STATUS',
         payload: { spaceId: '5', memberId }
       });
    }
  };

  const deleteMember = (memberId: string) => {
    dispatch({
      type: 'DELETE_TRIP_MEMBER',
      payload: { spaceId: '5', memberId }
    });
  };

  const totalPaid = members
    .filter(m => m.status === 'PAID')
    .reduce((acc, m) => acc + m.amount, 0);

  const totalUnpaid = members
    .filter(m => m.status === 'UNPAID')
    .reduce((acc, m) => acc + m.amount, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-white flex flex-col"
        >
          {/* Recovery Account Picker Overlay */}
          <AnimatePresence>
            {recoveryMemberId && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                onClick={() => setRecoveryMemberId(null)}
              >
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   className="w-full max-w-sm bg-white rounded-[48px] p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                   onClick={e => e.stopPropagation()}
                 >
                    <div className="w-12 h-1.5 bg-black/5 rounded-full mx-auto mb-8 lg:hidden" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic text-black mb-2 text-center">SETTLEMENT DETAILS</h3>
                    <p className="text-[10px] text-black/30 font-black uppercase tracking-[0.3em] mb-10 text-center">Where is the money going?</p>
                    
                    <div className="space-y-8">
                       {/* 1. Select Liquid Node */}
                       <div>
                          <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em] mb-4 text-center italic">1. Physical Location</p>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                             <button 
                               onClick={() => setRecoveryMode('IN_HAND')}
                               className={cn(
                                  "h-16 rounded-[24px] flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border",
                                  recoveryMode === 'IN_HAND' ? "bg-black text-white border-black" : "bg-white text-black/40 border-black/5"
                               )}
                             >
                                <Wallet className="w-4 h-4" /> HAND
                             </button>
                             <button 
                               onClick={() => {
                                  if (recoveryMode === 'IN_HAND') setRecoveryMode('BANK_SBI');
                               }}
                               className={cn(
                                  "h-16 rounded-[24px] flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 border",
                                  recoveryMode.startsWith('BANK') ? "bg-ios-blue text-white border-ios-blue" : "bg-white text-black/40 border-black/5"
                               )}
                             >
                                <Landmark className="w-4 h-4" /> BANK
                             </button>
                          </div>
                          {recoveryMode.startsWith('BANK') && (
                             <div className="grid grid-cols-3 gap-2">
                                {banks.map(b => (
                                   <button 
                                     key={b.id}
                                     onClick={() => setRecoveryMode(b.id as LiquidMode)}
                                     className={cn(
                                        "h-10 rounded-xl flex items-center justify-center text-[8px] font-black uppercase tracking-widest transition-all",
                                        recoveryMode === b.id ? "bg-black text-white" : "bg-gray-50 text-black/30 border border-black/5"
                                     )}
                                   >
                                      {b.name.split(' ')[0]}
                                   </button>
                                ))}
                             </div>
                          )}
                       </div>

                       {/* 2. Select Space */}
                       <div>
                          <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em] mb-4 text-center italic">2. Purpose Space</p>
                          <div className="grid grid-cols-2 gap-4">
                             {state.spaces.filter(s => s.id !== '5').map(s => (
                               <button 
                                 key={s.id}
                                 onClick={() => handleRecover(recoveryMemberId, s.id)}
                                 className="bg-gray-50/50 p-6 rounded-[32px] border border-black/5 active:scale-95 transition-all text-center group hover:bg-black hover:text-white flex flex-col items-center justify-center gap-2"
                               >
                                  <p className="text-[11px] font-black uppercase tracking-tighter leading-none">{s.name}</p>
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    <button 
                       onClick={() => setRecoveryMemberId(null)}
                       className="mt-8 w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-black/20 hover:text-black transition-colors"
                    >
                       CLOSE SELECTOR
                    </button>
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-white">
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none text-black">Debts & IOUs</h2>
              <p className="text-[10px] text-black/30 font-black uppercase tracking-[0.3em] mt-1 italic">Money management</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-6 h-6 text-black/40" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 bg-[#F2F2F7]">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                <p className="text-[9px] font-black text-black/20 uppercase tracking-widest mb-2">Recovered</p>
                <p className="text-2xl font-black text-income tracking-tighter">{formatCurrency(totalPaid, state.privacyMode)}</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                <p className="text-[9px] font-black text-black/20 uppercase tracking-widest mb-2">To Get</p>
                <p className="text-2xl font-black text-expense tracking-tighter">{formatCurrency(totalUnpaid, state.privacyMode)}</p>
              </div>
            </div>

            {/* List Header & Add Button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em] italic leading-none">People List</h3>
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="text-ios-blue flex items-center gap-2 text-xs font-black active:scale-95 transition-all uppercase tracking-widest"
              >
                {isAdding ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isAdding ? 'CANCEL' : 'ADD PERSON'}
              </button>
            </div>

            {/* Add Form */}
            <AnimatePresence>
              {isAdding && (
                <motion.form 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleAddMember}
                  className="mb-8 p-8 bg-white rounded-[40px] border border-black/5 shadow-sm space-y-6 overflow-hidden"
                >
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] ml-1">Name</label>
                    <input 
                      type="text" 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="WHO OWES YOU?"
                      className="w-full bg-gray-50 border border-black/5 rounded-[24px] p-4 font-black uppercase text-xs tracking-widest focus:outline-none focus:ring-2 focus:ring-black/5"
                      autoFocus
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em] ml-1">Amount</label>
                    <input 
                      type="number" 
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="₹ 0"
                      className="w-full bg-gray-50 border border-black/5 rounded-[24px] p-4 font-black text-lg tracking-tighter focus:outline-none focus:ring-2 focus:ring-black/5"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-black text-white py-5 rounded-[24px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Save className="w-4 h-4" /> SAVE PERSON
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Members List */}
            <div className="space-y-3">
              {members.length === 0 ? (
                <div className="py-20 text-center text-black/20 font-black uppercase tracking-[0.4em] text-xs italic">
                  No debts recorded
                </div>
              ) : (
                members.map(member => (
                  <div 
                    key={member.id}
                    className="flex items-center gap-4 p-6 bg-white border border-black/5 rounded-[32px] active:scale-[0.98] transition-all group relative overflow-hidden"
                  >
                    <button 
                      onClick={() => toggleStatus(member.id)}
                      className={cn(
                        "w-10 h-10 rounded-[20px] flex items-center justify-center transition-all relative z-10",
                        member.status === 'PAID' ? "bg-income text-white shadow-lg shadow-income/20" : "bg-gray-100 text-black/20 border border-black/5"
                      )}
                    >
                      {member.status === 'PAID' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <div className="flex-1 min-w-0" onClick={() => toggleStatus(member.id)}>
                      <p className="font-black text-black uppercase tracking-tighter italic text-base leading-none mb-1">{member.name}</p>
                      <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.3em]">
                        {member.status === 'PAID' ? 'Settled Archive' : 'Pending Recovery'}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2 relative z-10">
                      <p className={cn(
                        "font-black text-xl tracking-tighter italic",
                        member.status === 'PAID' ? "text-income" : "text-expense"
                      )}>
                        {formatCurrency(member.amount, state.privacyMode)}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm('Are you sure you want to delete this person?')) {
                            deleteMember(member.id);
                          }
                        }}
                        className="p-1.5 text-black/10 hover:text-expense active:text-expense transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Info Box */}
            <div className="mt-12 p-8 rounded-[40px] bg-white border border-black/5 flex items-start gap-4">
              <Info className="w-6 h-6 text-ios-blue shrink-0 mt-1" />
              <p className="text-xs font-black text-black/30 leading-relaxed uppercase tracking-tighter">
                When you mark a person as <span className="text-income font-black underline decoration-income/30">Paid</span>, you can select which account (Business, Personal, etc.) the recovered cash should be added to.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
