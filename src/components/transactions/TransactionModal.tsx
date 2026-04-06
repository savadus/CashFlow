'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Delete, Plus, Minus, Repeat, Check, MessageSquare, RotateCcw, Equal, X as CloseIcon, Landmark, Wallet, Building2, ChevronRight } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { TransactionType, LiquidMode, Transaction } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export const TransactionModal = ({ 
  isOpen, 
  onClose,
  initialType = 'EXPENSE'
}: { 
  isOpen: boolean, 
  onClose: () => void,
  initialType?: TransactionType
}) => {
  const { state, dispatch } = useFinance();
  const { t } = useTranslation();
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('0');
  const [expression, setExpression] = useState('');
  const [mode, setMode] = useState<LiquidMode>('IN_HAND');
  const [toMode, setToMode] = useState<LiquidMode>('BANK_SBI');
  const [spaceId, setSpaceId] = useState(state.spaces[0]?.id || '');
  const [toSpaceId, setToSpaceId] = useState(state.spaces[1]?.id || '');
  const [note, setNote] = useState('');
  const [bankPickerOpen, setBankPickerOpen] = useState(false);
  const [toBankPickerOpen, setToBankPickerOpen] = useState(false);


  const calculate = (expr: string) => {
    try {
      const sanitized = expr.replace(/x/g, '*');
      const result = new Function(`return ${sanitized}`)();
      return String(Number(result.toFixed(2)));
    } catch {
      return amount;
    }
  };

  const handleKeyPress = (val: string) => {
    if (val === 'AC') {
      setAmount('0');
      setExpression('');
    } else if (val === 'DEL') {
      if (expression.length > 0) {
        setExpression(prev => prev.slice(0, -1));
      } else {
        setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      }
    } else if (['+', '-', 'x'].includes(val)) {
      if (expression === '' && amount !== '0') {
        setExpression(amount + val);
      } else if (expression !== '') {
        const lastChar = expression.slice(-1);
        if (['+', '-', 'x'].includes(lastChar)) {
          setExpression(prev => prev.slice(0, -1) + val);
        } else {
          setExpression(prev => prev + val);
        }
      }
    } else if (val === 'SUM') {
      if (expression !== '') {
        const lastChar = expression.slice(-1);
        const finalExpr = ['+', '-', 'x'].includes(lastChar) ? expression.slice(0, -1) : expression;
        const result = calculate(finalExpr);
        setAmount(result);
        setExpression('');
      }
    } else if (val === '.') {
      if (expression !== '') {
         const parts = expression.split(/[+\-x]/);
         const lastPart = parts[parts.length - 1];
         if (!lastPart.includes('.')) setExpression(prev => prev + '.');
      } else {
         if (!amount.includes('.')) setAmount(prev => prev + '.');
      }
    } else {
      if (expression !== '') {
        setExpression(prev => prev + val);
      } else {
        setAmount(prev => prev === '0' ? val : prev + val);
      }
    }
  };

  const handleSave = () => {
    let finalAmount = parseFloat(amount);
    if (expression !== '') {
       const lastChar = expression.slice(-1);
       const finalExpr = ['+', '-', 'x'].includes(lastChar) ? expression.slice(0, -1) : expression;
       finalAmount = parseFloat(calculate(finalExpr));
    }

    if (!finalAmount || finalAmount <= 0) return;

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: Math.random().toString(36).substr(2, 9),
        amount: finalAmount,
        type,
        spaceId: spaceId,
        toSpaceId: type === 'TRANSFER' ? toSpaceId : undefined,
        mode: mode,
        toMode: type === 'TRANSFER' ? toMode : undefined,
        date: new Date().toISOString(),
        note: note || (type === 'TRANSFER' ? 'Transfer' : mode === 'IN_HAND' ? 'Cash' : 'Bank'),
        category: mode
      },
    });
    onClose();
  };

  const banks = state.userProfile?.banks || [];

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmount('0');
      setExpression('');
      setNote('');
      setMode('IN_HAND');
      setToMode(banks[0]?.id || 'BANK_DEFAULT');
      setBankPickerOpen(false);
      setToBankPickerOpen(false);
    }
  }, [isOpen, initialType, banks]);

  const getThemeColor = () => {
    if (type === 'INCOME') return 'bg-income';
    if (type === 'EXPENSE') return 'bg-expense';
    return 'bg-ios-blue';
  };

  const getThemeText = () => {
    if (type === 'INCOME') return 'text-income';
    if (type === 'EXPENSE') return 'text-expense';
    return 'text-ios-blue';
  };

  const displayValue = expression || amount;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[260] bg-[#F2F2F7] flex flex-col pt-[env(safe-area-inset-top,0px)]"
        >
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/5">
            <div className="flex items-center gap-3">
               <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-black/40" />
               </button>
               <div>
                  <h2 className={cn("text-lg font-bold uppercase tracking-widest leading-none", getThemeText())}>
                     {type === 'INCOME' ? 'ADD INCOME' : type === 'EXPENSE' ? 'ADD OUT' : 'TRANSFER'}
                  </h2>
               </div>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl border border-black/5">
                {(['EXPENSE', 'INCOME', 'TRANSFER'] as TransactionType[]).map(t => (
                  <button 
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all",
                      type === t ? (t === 'INCOME' ? "bg-income text-white shadow-md" : t === 'EXPENSE' ? "bg-expense text-white shadow-md" : "bg-ios-blue text-white shadow-md") : "text-black/30"
                    )}
                  >
                    {t === 'EXPENSE' ? 'OUT' : t === 'INCOME' ? 'IN' : 'TRANSFER'}
                  </button>
                ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             <div className="bg-white p-4 border-b border-black/5 shadow-sm text-center">
                <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest mb-1">CONFIRM AMOUNT</p>
                <div className="flex items-center justify-center gap-2">
                   <span className="text-lg font-bold text-black/10">₹</span>
                   <div className="text-2xl font-bold tracking-tight truncate leading-none text-black">
                      {displayValue}
                   </div>
                </div>
             </div>

             <div className="p-4 space-y-4">
                <div className="bg-white rounded-[24px] p-5 border border-black/5 shadow-sm space-y-6">
                    <div>
                       <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest mb-4 px-2">SELECT LOCATION (FROM)</p>
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => {
                               setMode('IN_HAND');
                               setBankPickerOpen(false);
                            }}
                            className={cn(
                               "h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95 border",
                               mode === 'IN_HAND' ? "bg-black text-white border-black shadow-lg" : "bg-white text-black/40 border-black/5"
                            )}
                          >
                             <Wallet className="w-4 h-4" />
                             IN HAND
                          </button>
                          <button 
                            onClick={() => {
                               if (mode === 'IN_HAND') setMode('BANK_SBI');
                               setBankPickerOpen(!bankPickerOpen);
                            }}
                            className={cn(
                               "h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95 border",
                               mode.startsWith('BANK') ? "bg-ios-blue text-white border-ios-blue shadow-lg" : "bg-white text-black/40 border-black/5"
                            )}
                          >
                             <Landmark className="w-4 h-4" />
                             {mode.startsWith('BANK') ? (banks.find(b => b.id === mode)?.name || mode.replace('BANK_', '')) : 'IN BANK'}
                             <ChevronRight className={cn("w-3 h-3 transition-transform", bankPickerOpen ? "rotate-90" : "")} />
                          </button>
                       </div>

                       <AnimatePresence>
                          {bankPickerOpen && (
                             <motion.div 
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: 'auto', opacity: 1 }}
                               exit={{ height: 0, opacity: 0 }}
                               className="grid grid-cols-3 gap-2 mt-3"
                             >
                                {banks.map(b => (
                                   <button 
                                     key={b.id}
                                     onClick={() => {
                                        setMode(b.id as LiquidMode);
                                        setBankPickerOpen(false);
                                     }}
                                     className={cn(
                                        "h-10 rounded-lg flex items-center justify-center text-[8px] font-bold uppercase tracking-widest transition-all active:scale-95",
                                        mode === b.id ? "bg-black text-white" : "bg-gray-50 text-black/30 border border-black/5"
                                     )}
                                   >
                                      {b.name.split(' ')[0]}
                                   </button>
                                ))}
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>

                    {type === 'TRANSFER' && (
                       <div>
                          <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest mb-4 px-2">DESTINATION (TO)</p>
                          <div className="grid grid-cols-2 gap-3">
                             <button 
                               onClick={() => setToMode('IN_HAND')}
                               className={cn(
                                  "h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95 border",
                                  toMode === 'IN_HAND' ? "bg-black text-white border-black shadow-lg" : "bg-white text-black/40 border-black/5"
                               )}
                             >
                                <Wallet className="w-4 h-4" />
                                IN HAND
                             </button>
                             <button 
                               onClick={() => setToBankPickerOpen(!toBankPickerOpen)}
                               className={cn(
                                  "h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-[9px] uppercase tracking-widest transition-all active:scale-95 border",
                                  toMode.startsWith('BANK') ? "bg-ios-blue text-white border-ios-blue shadow-lg" : "bg-white text-black/40 border-black/5"
                               )}
                             >
                                <Landmark className="w-4 h-4" />
                                {toMode.startsWith('BANK') ? toMode.replace('BANK_', '') : 'IN BANK'}
                             </button>
                          </div>
                       </div>
                    )}

                    <div>
                       <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest mb-4 px-2">TARGET PURPOSE (SPACE)</p>
                       <div className="grid grid-cols-2 gap-3">
                          <select 
                            value={spaceId}
                            onChange={(e) => setSpaceId(e.target.value)}
                            className="w-full bg-white text-black h-14 rounded-xl font-bold px-4 shadow-sm active:scale-95 transition-all text-[9px] uppercase tracking-widest appearance-none cursor-pointer outline-none border border-black/5"
                          >
                             {state.spaces.map(s => (
                               <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                             ))}
                          </select>
                          {type === 'TRANSFER' ? (
                             <select 
                               value={toSpaceId}
                               onChange={(e) => setToSpaceId(e.target.value)}
                               className="w-full bg-white text-black h-14 rounded-xl font-bold px-4 shadow-sm active:scale-95 transition-all text-[9px] uppercase tracking-widest appearance-none cursor-pointer outline-none border border-black/5"
                             >
                                {state.spaces.filter(s => s.id !== spaceId).map(s => (
                                  <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                ))}
                             </select>
                          ) : (
                             <div className="relative">
                                <MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                                <input 
                                  type="text" 
                                  value={note}
                                  onChange={(e) => setNote(e.target.value)}
                                  placeholder="NOTE..."
                                  className="w-full pl-14 pr-6 h-16 bg-black/5 rounded-[24px] font-black text-[10px] uppercase tracking-widest outline-none border-none placeholder:text-black/10"
                                />
                             </div>
                          )}
                       </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Calculator Keyboard */}
          <div className="bg-white border-t border-black/5 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
             <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { k: '7', c: 'bg-black/5 text-black' },
                  { k: '8', c: 'bg-black/5 text-black' },
                  { k: '9', c: 'bg-black/5 text-black' },
                  { k: 'AC', c: 'bg-red-50 text-red-500 font-black' },
                  { k: '4', c: 'bg-black/5 text-black' },
                  { k: '5', c: 'bg-black/5 text-black' },
                  { k: '6', c: 'bg-black/5 text-black' },
                  { k: 'x', c: 'bg-ios-blue/10 text-ios-blue' },
                  { k: '1', c: 'bg-black/5 text-black' },
                  { k: '2', c: 'bg-black/5 text-black' },
                  { k: '3', c: 'bg-black/5 text-black' },
                  { k: '-', c: 'bg-ios-blue/10 text-ios-blue' },
                  { k: '.', c: 'bg-black/5 text-black' },
                  { k: '0', c: 'bg-black/5 text-black' },
                  { k: 'DEL', c: 'bg-black/5 text-black' },
                  { k: '+', c: 'bg-ios-blue/10 text-ios-blue' },
                ].map(item => (
                  <button key={item.k} onClick={() => handleKeyPress(item.k)} className={cn("h-16 rounded-2xl flex items-center justify-center text-xl font-bold transition-all active:scale-95 shadow-sm", item.c)}>
                    {item.k === 'x' ? <X className="w-5 h-5 stroke-[4]" /> : item.k === '-' ? <Minus className="w-6 h-6 stroke-[4]" /> : item.k === 'DEL' ? <Delete className="w-6 h-6" /> : item.k === '+' ? <Plus className="w-6 h-6 stroke-[4]" /> : item.k}
                  </button>
                ))}
             </div>

             <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => handleKeyPress('SUM')}
                  className="col-span-1 h-16 bg-ios-blue/20 text-ios-blue rounded-2xl flex items-center justify-center active:scale-95 transition-all text-xl font-black"
                >
                   <Equal className="w-6 h-6 stroke-[4]" />
                </button>
                <button 
                   onClick={handleSave}
                   className={cn(
                     "col-span-3 h-16 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] italic shadow-2xl transition-all active:scale-[0.98]",
                     parseFloat(displayValue) > 0 || expression !== '' ? cn(getThemeColor(), "text-white") : "bg-black/5 text-black/10"
                   )}
                 >
                   {expression ? 'SOLVE & SAVE' : 'SAVE TRANSACTION'}
                </button>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
