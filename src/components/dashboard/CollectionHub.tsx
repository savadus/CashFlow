'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Circle, UserPlus, Info, Save, Trash2, Wallet, Landmark } from 'lucide-react';
import { TripMember, TripSpace, LiquidMode } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { useTranslation } from '@/hooks/useTranslation';

export const CollectionHub = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { state, dispatch } = useFinance();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const [recoveryMemberId, setRecoveryMemberId] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState<LiquidMode>('IN_HAND');

  const collectionSpace = state.spaces.find(s => s.id === '6') as TripSpace;
  const members = collectionSpace?.members || [];

  const banks = [
    { id: 'BANK_BARODA', name: 'Baroda' },
    { id: 'BANK_SBI', name: 'SBI' },
    { id: 'BANK_SIB', name: 'SIB' },
  ];

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount) return;

    dispatch({
      type: 'ADD_TRIP_MEMBER',
      payload: {
        spaceId: '6',
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
      payload: { spaceId: '6', memberId, targetSpaceId, mode: recoveryMode }
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
         payload: { spaceId: '6', memberId }
       });
    }
  };

  const deleteMember = (memberId: string) => {
    dispatch({
      type: 'DELETE_TRIP_MEMBER',
      payload: { spaceId: '6', memberId }
    });
  };

  const totalPaid = members
    .filter(m => m.status === 'PAID')
    .reduce((acc, m) => acc + m.amount, 0);

  const totalUnpaid = members
    .filter(m => m.status === 'UNPAID')
    .reduce((acc, m) => acc + m.amount, 0);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      className="fixed inset-0 z-[120] bg-[#F2F2F7] flex flex-col pt-[env(safe-area-inset-top,0px)]"
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
               className="w-full max-w-sm bg-white rounded-[10px][48px] p-8 shadow-2xl relative"
               onClick={e => e.stopPropagation()}
             >
                <h3 className="text-xl font-black italic tracking-tighter text-black mb-1 t">Recieve Payment</h3>
                <p className="text-[10px] text-black/30 font-black tracking-tight mb-8 italic">Specify destination for cash recovery</p>
                
                <div className="space-y-8">
                   <div>
                      <p className="text-[9px] font-black text-black/20 tracking-[0.2em] mb-4 italic">1. DESTINATION HUB</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                         <button 
                           onClick={() => setRecoveryMode('IN_HAND')}
                           className={cn(
                              "h-14 rounded-[10px] flex items-center justify-center gap-3 font-black text-[10px] tracking-tight transition-all active:scale-95 border",
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
                              "h-14 rounded-[10px] flex items-center justify-center gap-3 font-black text-[10px] tracking-tight transition-all active:scale-95 border",
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
                                    "h-10 rounded-[10px] flex items-center justify-center text-[8px] font-black tracking-tight transition-all",
                                    recoveryMode === b.id ? "bg-black text-white" : "bg-gray-50 text-black/30 border border-black/5"
                                 )}
                               >
                                  {b.name}
                               </button>
                            ))}
                         </div>
                      )}
                   </div>

                   <div>
                      <p className="text-[9px] font-black text-black/20 tracking-[0.2em] mb-4 italic">2. PURPOSE SPACE</p>
                      <div className="grid grid-cols-2 gap-4">
                         {state.spaces.filter(s => s.id !== '5' && s.id !== '6').map(s => (
                           <button 
                             key={s.id}
                             onClick={() => handleRecover(recoveryMemberId, s.id)}
                             className="bg-gray-50/50 p-6 rounded-[10px] border border-black/5 active:scale-95 transition-all text-center group hover:bg-black hover:text-white"
                           >
                              <p className="text-[11px] font-black tracking-tight leading-none italic">{s.name}</p>
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-black px-6 py-8 pb-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-[10px] -mr-20 -mt-20 blur-3xl" />
        <div className="flex items-center justify-between text-white relative z-10">
          <div>
            <h2 className="text-xl font-black italic tracking-tighter leading-none">Collections</h2>
            <p className="text-[10px] text-white/40 font-black tracking-tight mt-1 italic">Event Name List</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 backdrop-blur-xl rounded-[10px] border border-white/10 shadow-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 -mt-10 bg-white rounded-[10px]-[48px] shadow-2xl relative z-10 scroll-smooth pb-32">
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-6 bg-gray-50 rounded-[10px] border border-black/5">
            <p className="text-[9px] font-black text-black/20 tracking-widest mb-1 italic">Recieved</p>
            <p className="text-2xl font-black text-income tracking-tighter italic">{formatCurrency(totalPaid, state.privacyMode)}</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-[10px] border border-black/5">
            <p className="text-[9px] font-black text-black/20 tracking-widest mb-1 italic">Pending</p>
            <p className="text-2xl font-black text-expense tracking-tighter italic">{formatCurrency(totalUnpaid, state.privacyMode)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-black/20 tracking-widest italic">NAME LIST</h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-ios-blue text-xs font-black tracking-tight flex items-center gap-2 italic active:scale-95 transition-all"
          >
            {isAdding ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isAdding ? 'CANCEL' : 'ADD NAME'}
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleAddMember}
              className="mb-8 p-6 bg-black text-white rounded-[10px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-[10px] -mr-10 -mt-10 blur-2xl" />
              <div className="space-y-4 relative z-10">
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="NAME / TOUR"
                  className="w-full bg-white/10 border border-white/10 rounded-[10px] p-4 text-xs font-black tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
                  autoFocus
                  required
                />
                <input 
                  type="number" 
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="AMOUNT"
                  className="w-full bg-white/10 border border-white/10 rounded-[10px] p-4 text-xl font-black tracking-tighter text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
                  required
                />
                <button type="submit" className="w-full bg-white text-black py-4 rounded-[10px] font-black italic tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Save className="w-4 h-4" /> SAVE ENTRY
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {members.length === 0 ? (
            <div className="py-20 text-center text-black/10 font-black tracking-widest text-xs italic">
              No names listed yet
            </div>
          ) : (
            members.map(member => (
              <div 
                key={member.id}
                className="flex items-center gap-4 p-5 bg-white border border-black/5 rounded-[10px] active:scale-[0.98] transition-all hover:shadow-xl hover:shadow-black/5"
              >
                <button 
                  onClick={() => toggleStatus(member.id)}
                  className={cn(
                    "w-11 h-11 rounded-[10px] flex items-center justify-center transition-all",
                    member.status === 'PAID' ? "bg-income text-white shadow-lg shadow-income/20" : "bg-gray-100 text-black/20"
                  )}
                >
                  {member.status === 'PAID' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                <div className="flex-1 min-w-0" onClick={() => toggleStatus(member.id)}>
                  <p className="font-black text-black italic tracking-tighter text-base leading-none mb-1">{member.name}</p>
                  <p className="text-[9px] font-black text-black/20 italic tracking-widest">
                    {member.status === 'PAID' ? 'RECIEVED' : 'PENDING'}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className={cn(
                    "font-black text-xl tracking-tighter italic",
                    member.status === 'PAID' ? "text-income" : "text-expense"
                  )}>
                    {formatCurrency(member.amount, state.privacyMode)}
                  </p>
                  <button onClick={() => deleteMember(member.id)} className="p-1 text-black/10 hover:text-expense transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 p-8 bg-gray-50 rounded-[10px] border border-black/5 flex items-start gap-4">
           <Info className="w-6 h-6 text-ios-blue shrink-0 mt-1 opacity-20" />
           <p className="text-[10px] font-black text-black/30 leading-relaxed italic tracking-tight">
              Collections allow you to manage group recoveries (Tours, Parties, Events). Mark as paid to add funds to a specific purpose space.
           </p>
        </div>
      </div>
    </motion.div>
  );
};
