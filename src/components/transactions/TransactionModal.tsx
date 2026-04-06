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
          <div className="flex items-center gap-4 px-6 py-4 bg-white">
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-none transition-colors">
              <ArrowLeft className={cn("w-6 h-6", getThemeText())} />
            </button>
            <h2 className={cn("text-lg font-bold tracking-tight capitalize", getThemeText())}>
              {type === 'TRANSFER' ? 'Transfer entry' : `${type.toLowerCase()} entry`} of ₹{displayValue}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
             {/* Large Amount Card */}
             <div className="bg-white rounded-none p-6 shadow-sm border border-black/5">
                <div className="flex items-baseline gap-2">
                   <span className={cn("text-2xl font-bold", getThemeText())}>₹</span>
                   <div className={cn("text-4xl font-bold tracking-tight truncate", getThemeText())}>
                      {displayValue}
                   </div>
                </div>
             </div>

             {/* Payment Mode Selector */}
             <div className="flex items-center justify-between py-2">
                <span className="text-[11px] font-bold text-black/40 tracking-tight">Payment mode</span>
                <div className="flex bg-white p-1 rounded-none border border-black/5 shadow-sm">
                   {[
                     { id: 'IN_HAND', label: 'Cash' },
                     { id: 'BANK_ONLINE', label: 'Online' }
                   ].map((m) => (
                     <button
                       key={m.id}
                       onClick={() => {
                          if (m.id === 'IN_HAND') setMode('IN_HAND');
                          else setMode(banks[0]?.id || 'BANK_DEFAULT');
                       }}
                       className={cn(
                         "px-6 py-2 rounded-none text-[10px] font-bold transition-all",
                         (m.id === 'IN_HAND' ? mode === 'IN_HAND' : mode !== 'IN_HAND') 
                           ? cn(getThemeColor(), "text-white shadow-md") 
                           : "text-black/30"
                       )}
                     >
                       {m.label}
                     </button>
                   ))}
                </div>
             </div>

             {/* Details Input */}
             <div className="bg-white rounded-none p-4 shadow-sm border border-black/5 min-h-[100px]">
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter details (Items, bill no., quantity, etc.)"
                  className="w-full h-full bg-transparent outline-none resize-none text-[11px] font-medium placeholder:text-black/10 text-black leading-relaxed"
                />
             </div>

             {/* Date & Attachments Row */}
             <div className="flex items-center gap-3">
                <button className="flex-1 bg-white rounded-none p-3 px-4 shadow-sm border border-black/5 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-500 rounded-none">
                         <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-black/60">06 Apr 26</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-black/20 rotate-90" />
                </button>
                <button className="flex-1 bg-white rounded-none p-3 px-4 shadow-sm border border-black/5 flex items-center justify-center gap-3 group active:scale-95 transition-all">
                   <div className="p-2 bg-red-50 text-red-500 rounded-none">
                      <Landmark className="w-4 h-4" />
                   </div>
                   <span className="text-[10px] font-bold text-black/60">Attach bills</span>
                </button>
             </div>
          </div>

          {/* Calculator Keyboard Section */}
          <div className="p-4 pt-0 space-y-3">
             <button 
               onClick={handleSave}
               className={cn(
                 "w-full py-4.5 rounded-none font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]",
                 parseFloat(displayValue) > 0 || expression !== '' ? cn(getThemeColor(), "text-white") : "bg-black/5 text-black/10"
               )}
             >
                SAVE
             </button>

             <div className="grid grid-cols-4 gap-2">
                {/* Specific Calculator Grid */}
                {[
                  { k: 'C', c: 'bg-[#EBF5FF] text-ios-blue' },
                  { k: 'M+', c: 'bg-[#EBF5FF] text-ios-blue' },
                  { k: 'M-', c: 'bg-[#EBF5FF] text-ios-blue' },
                  { k: 'DEL', c: 'bg-[#EBF5FF] text-ios-blue', icon: <Delete className="w-5 h-5" /> },
                  { k: '7', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '8', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '9', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '/', c: 'bg-[#EBF5FF] text-ios-blue', label: '÷' },
                  { k: '4', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '5', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '6', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: 'x', c: 'bg-[#EBF5FF] text-ios-blue', label: '×' },
                  { k: '1', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '2', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '3', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '-', c: 'bg-[#1C4E80] text-white shadow-xl' },
                  { k: '0', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: '.', c: 'bg-white text-gray-800 shadow-sm border border-gray-100' },
                  { k: 'SUM', c: 'bg-white text-gray-800 shadow-sm border border-gray-100', label: '=' },
                  { k: '+', c: 'bg-[#1C4E80] text-white shadow-xl' },
                ].map(item => (
                  <button 
                    key={item.k} 
                    onClick={() => {
                       if (item.k === 'C') handleKeyPress('AC');
                       else handleKeyPress(item.k);
                    }} 
                    className={cn(
                      "h-14 rounded-none flex items-center justify-center text-lg font-bold transition-all active:scale-95", 
                      item.c
                    )}
                  >
                    {item.icon || item.label || item.k}
                  </button>
                ))}
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
