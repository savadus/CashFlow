'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileText, Users, ChevronRight, Plus, Trash2, IndianRupee, Eye, Image as ImageIcon, Send, CheckCircle2 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { TripSpace, TripMember, Bill } from '@/types';
import { toJpeg, toBlob } from 'html-to-image';
import jsPDF from 'jspdf';

type BillStyle = 'PREMIUM' | 'THERMAL' | 'BASIC';

interface BillItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export const BillGenerator = ({ isOpen, onClose, initialBill }: { isOpen: boolean, onClose: () => void, initialBill?: Bill }) => {
  const { state, dispatch } = useFinance();
  const billRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<BillStyle>('BASIC');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<BillItem[]>([{ id: '1', name: '', price: 0, qty: 1 }]);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  
  const predefinedHeadlines = ['MVEE.CLOTHES', 'MVEE.CUTS', 'MVEE.FRAGRANCE', 'THANK YOU'];
  const [activeHeadlineType, setActiveHeadlineType] = useState<string>('THANK YOU');
  const [customHeadline, setCustomHeadline] = useState('');
  const [isHeadlineCustom, setIsHeadlineCustom] = useState(false);

  const [viewMode, setViewMode] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialBill) {
        setCustomerName(initialBill.customerName);
        setCustomerPhone(initialBill.customerPhone || '');
        setItems(initialBill.items.map(i => ({ ...i })));
        setPaymentStatus(initialBill.status);
        setStyle(initialBill.style || 'BASIC');
        
        if (predefinedHeadlines.includes(initialBill.headline)) {
           setActiveHeadlineType(initialBill.headline);
           setIsHeadlineCustom(false);
        } else {
           setCustomHeadline(initialBill.headline);
           setIsHeadlineCustom(true);
        }
        setViewMode('VIEWER');
      } else {
        // Reset to default
        setCustomerName('');
        setCustomerPhone('');
        setItems([{ id: '1', name: '', price: 0, qty: 1 }]);
        setPaymentStatus('UNPAID');
        setStyle('BASIC');
        setViewMode('EDITOR');
      }
    }
  }, [isOpen, initialBill]);

  const currentHeadline = isHeadlineCustom ? (customHeadline || 'INVOICE') : activeHeadlineType;

  const debtsSpace = state.spaces.find(s => s.id === '5') as TripSpace;
  const debtMembers = debtsSpace?.members || [];

  const handleFetchDebt = (memberId: string) => {
    if (!memberId) return;
    const member = debtMembers.find(m => m.id === memberId);
    if (member) {
      setCustomerName(member.name);
      setPaymentStatus(member.amount <= 0 ? 'PAID' : 'UNPAID');
      setItems([{ 
        id: Math.random().toString(36).substr(2, 9), 
        name: `Settlement of debt`, 
        price: Math.abs(member.amount),
        qty: 1
      }]);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(36).substr(2, 9), name: '', price: 0, qty: 1 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item: BillItem) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BillItem, value: any) => {
    setItems(items.map((item: BillItem) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((acc: number, item: BillItem) => acc + (Number(item.price) * (Number(item.qty) || 1)), 0);
  const total = subtotal;

  const handleWhatsAppShare = async () => {
    if (!billRef.current) return;
    setIsSharing(true);

    try {
      const blob = await toBlob(billRef.current, { 
        quality: 0.95, 
        backgroundColor: '#ffffff',
        pixelRatio: 2 
      });
      
      if (!blob) throw new Error('Blob generation failed');

      const file = new File([blob], `Invoice_${customerName || 'Customer'}.jpg`, { type: 'image/jpeg' });
      
      // Save Bill to Context
      dispatch({
        type: 'ADD_BILL',
        payload: {
          id: Math.random().toString(36).substr(2, 9),
          customerName: customerName || 'Walking Customer',
          customerPhone,
          items: items.map(i => ({ ...i })),
          total,
          status: paymentStatus,
          date: new Date().toISOString(),
          style,
          headline: currentHeadline
        }
      });

      const shareData = {
        files: [file],
        title: `Invoice from MVEE.IN`,
        text: `*Invoice Summary*%0A*Headline:* ${currentHeadline}%0A*Billed To:* ${customerName || 'Customer'}%0A*Total:* ₹${total}%0A*Status:* ${paymentStatus}`
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else {
        const text = `*Invoice from MVEE.IN*%0A%0A*Headline:* ${currentHeadline}%0A*Billed To:* ${customerName || 'Customer'}%0A*Total Amount:* ₹${total}%0A*Status:* ${paymentStatus}`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
      }
    } catch (err) {
      console.error('Share failed', err);
      const text = `*Invoice from MVEE.IN*%0A%0A*Headline:* ${currentHeadline}%0A*Billed To:* ${customerName || 'Customer'}%0A*Total Amount:* ₹${total}%0A*Status:* ${paymentStatus}`;
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async (type: 'PDF' | 'JPG') => {
    if (!billRef.current) return;
    setIsCapturing(true);

    try {
      const dataUrl = await toJpeg(billRef.current, { 
        quality: 1.0,
        backgroundColor: '#ffffff',
        pixelRatio: 3 // Higher fidelity for professional bills
      });

      if (type === 'JPG') {
          const link = document.createElement('a');
          link.download = `Invoice_${customerName || 'Customer'}_${Date.now()}.jpg`;
          link.href = dataUrl;
          link.click();
      } else {
          // Direct PDF Export (Bypassing Print Dialog)
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          // Maintaining aspect ratio of the captured bill
          const imgProps = pdf.getImageProperties(dataUrl);
          const ratio = imgProps.width / imgProps.height;
          const finalWidth = pdfWidth - 20; // 10mm margins
          const finalHeight = finalWidth / ratio;
          
          pdf.addImage(dataUrl, 'JPEG', 10, 10, finalWidth, finalHeight);
          pdf.save(`Invoice_${customerName || 'Customer'}_${Date.now()}.pdf`);
      }
    } catch (err) {
      console.error('Download aborted', err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-white flex flex-col print:p-0"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/5 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={viewMode === 'VIEWER' ? () => setViewMode('EDITOR') : onClose}
              className="p-2 hover:bg-black/5 rounded-[10px]"
            >
              {viewMode === 'VIEWER' ? <ChevronRight className="w-6 h-6 rotate-180" /> : <X className="w-6 h-6 text-black/40" />}
            </button>
            <h2 className="text-xl font-bold text-black">{viewMode === 'EDITOR' ? 'Bill Maker' : 'Invoice Preview'}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {viewMode === 'EDITOR' ? (
            <div className="flex-1 overflow-hidden flex flex-col bg-[#F2F2F7]">
               <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                  {/* Quick Fetch */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-black/30  tracking-tight px-1">Import from ledger</label>
                    <select
                      onChange={(e) => handleFetchDebt(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-[10px] px-5 py-4 font-bold text-sm outline-none shadow-sm appearance-none"
                      defaultValue=""
                    >
                      <option value="" disabled>Search person...</option>
                      {debtMembers.map((m: TripMember) => (
                        <option key={m.id} value={m.id}>{m.name} (₹{m.amount})</option>
                      ))}
                    </select>
                  </div>

                  {/* Headline Selection (Pills) */}
                  <div className="space-y-3 overflow-hidden">
                    <label className="text-[10px] font-black text-black/30  tracking-tight px-1">Invoice Headline</label>
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                       {predefinedHeadlines.map(h => (
                          <button 
                            key={h}
                            onClick={() => {
                              setActiveHeadlineType(h);
                              setIsHeadlineCustom(false);
                            }}
                            className={cn(
                              "px-5 py-3 rounded-[10px] font-black text-[10px] whitespace-nowrap transition-all  tracking-tight",
                              (!isHeadlineCustom && activeHeadlineType === h) ? "bg-black text-white shadow-xl scale-105" : "bg-white text-black/40 border border-black/5"
                            )}
                          >
                            {h}
                          </button>
                       ))}
                       <button 
                          onClick={() => setIsHeadlineCustom(true)}
                          className={cn(
                            "px-5 py-3 rounded-[10px] font-black text-[10px] whitespace-nowrap transition-all  tracking-tight flex items-center gap-1",
                            isHeadlineCustom ? "bg-ios-pink text-white shadow-xl scale-105" : "bg-white text-black/40 border border-black/5"
                          )}
                       >
                         <Plus className="w-3 h-3" /> OTHER
                       </button>
                    </div>

                    <AnimatePresence>
                      ~ CashFlow Audit System Secured ~
                      {isHeadlineCustom && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <input
                            type="text"
                            value={customHeadline}
                            onChange={(e) => setCustomHeadline(e.target.value)}
                            placeholder="Type Custom Headline..."
                            className="w-full bg-white border border-black/5 rounded-[10px] p-5 font-bold text-sm outline-none shadow-sm text-ios-pink placeholder:text-ios-pink/30 "
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Payment Status Toggle */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-black/30  tracking-tight px-1">Payment Status</label>
                    <div className="flex bg-white p-1.5 rounded-[10px] border border-black/5 shadow-sm">
                       <button 
                         onClick={() => setPaymentStatus('UNPAID')}
                         className={cn("flex-1 py-3 font-black text-xs rounded-[10px] transition-all", paymentStatus === 'UNPAID' ? "bg-expense text-white shadow-lg" : "text-black/30")}
                       >
                         UNPAID
                       </button>
                       <button 
                         onClick={() => setPaymentStatus('PAID')}
                         className={cn("flex-1 py-3 font-black text-xs rounded-[10px] transition-all", paymentStatus === 'PAID' ? "bg-ios-blue text-white shadow-lg" : "text-black/30")}
                       >
                         PAID
                       </button>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-black/30  tracking-tight px-1">Customer Details</label>
                    <div className="space-y-2">
                       <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Customer Name"
                        className="w-full bg-white border border-black/5 rounded-[10px] p-5 font-bold text-sm outline-none shadow-sm"
                      />
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone Number (Optional)"
                        className="w-full bg-white border border-black/5 rounded-[10px] p-5 font-bold text-sm outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-black/30  tracking-tight">Bill Items</label>
                        <button onClick={addItem} className="text-ios-blue font-black text-[10px] flex items-center gap-1">
                          <Plus className="w-4 h-4" /> ADD ITEM
                        </button>
                    </div>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="p-5 bg-white rounded-[10px] border border-black/5 shadow-sm space-y-4 relative group">
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="absolute right-4 top-4 p-2 text-expense/20 hover:text-expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <input 
                              type="text" 
                              value={item.name} 
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              placeholder="What did they buy?"
                              className="w-[85%] bg-transparent font-black text-black outline-none text-lg tracking-tight"
                            />
                            <div className="flex gap-6 border-t border-black/5 pt-4">
                              <div className="flex-1">
                                  <p className="text-[10px] font-black text-black/30  mb-1">Price (₹)</p>
                                  <input 
                                    type="number" 
                                    value={item.price || ''} 
                                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                    className="w-full bg-transparent font-black outline-none text-black"
                                  />
                              </div>
                              <div className="w-20">
                                  <p className="text-[10px] font-black text-black/30  mb-1">Qty</p>
                                  <input 
                                    type="number" 
                                    value={item.qty || ''} 
                                    onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                    className="w-full bg-transparent font-black outline-none text-black"
                                  />
                              </div>
                            </div>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               {/* Sticky Bottom Bill Actions */}
               <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7]/90 to-transparent z-50 flex gap-3">
                  <button 
                    onClick={() => {
                        const billId = Math.random().toString(36).substr(2, 9);
                        dispatch({
                          type: 'ADD_BILL',
                          payload: {
                            id: billId,
                            customerName: customerName || 'Walking Client',
                            customerPhone: customerPhone || '',
                            items: items.map(it => ({
                                id: it.id,
                                name: it.name,
                                price: it.price,
                                qty: it.qty
                            })),
                            total: total,
                            date: new Date().toISOString(),
                            status: paymentStatus as 'PAID' | 'UNPAID',
                            style: style,
                            headline: isHeadlineCustom ? customHeadline : activeHeadlineType
                          }
                        });
                        alert('Bill saved successfully to archives!');
                        onClose();
                    }}
                    className="flex-1 bg-black text-white py-5 rounded-[10px] font-black text-xs shadow-2xl active:scale-[0.98] transition-all  tracking-tight italic"
                  >
                    SAVE & CLOSE
                  </button>
                  <button 
                    onClick={() => setViewMode('VIEWER')}
                    className="flex-1 bg-ios-blue text-white py-5 rounded-[10px] font-black text-xs shadow-2xl shadow-ios-blue/30 active:scale-[0.98] transition-all  tracking-tight"
                  >
                    VIEW BILL
                  </button>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-gray-200 overflow-hidden relative">
               {/* Viewer Mode - Style Tabs at top */}
               <div className="p-4 bg-white/70 backdrop-blur-xl flex justify-center gap-2 print:hidden z-10 border-b border-black/5">
                  {(['BASIC', 'THERMAL', 'PREMIUM'] as BillStyle[]).map(s => (
                    <button 
                      key={s}
                      onClick={() => setStyle(s)} 
                      className={cn(
                        "px-6 py-2 rounded-[10px] text-[10px] font-black  tracking-tight transition-all", 
                        style === s ? "bg-black text-white shadow-lg" : "bg-white text-black/30 border border-black/5"
                      )}
                    >
                      {s === 'PREMIUM' ? 'Premium 💎' : s}
                    </button>
                  ))}
               </div>

               {/* Bill Canvas */}
               <div className="flex-1 overflow-y-auto flex items-start justify-center p-6 md:p-12 print:p-0 print:bg-white">
                  <div 
                    ref={billRef}
                    className={cn(
                      "bg-white shadow-2xl transition-all duration-300 print:shadow-none print:w-full print:m-0",
                      style === 'THERMAL' ? "w-[300px] min-h-[400px] font-mono px-6 py-8" : 
                      "w-full max-w-[800px] min-h-[1000px] relative"
                    )}
                  >
                    {style === 'BASIC' && (
                      <div className="p-8 text-[11px] text-black bg-white min-h-full">
                        <div className="text-center mb-6">
                            <h2 className="text-sm font-black tracking-tight text-black ">{currentHeadline}</h2>
                        </div>
                        <div className="flex justify-between items-start mb-10 border-t border-black/10 pt-6">
                            <div>
                                <h1 className="text-xl font-black italic tracking-tighter">MVEE.IN</h1>
                                <p className="text-black font-bold">+91 9961463124</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black tracking-tight">Original • #Sale Bill no.1</p>
                                <p className="text-[10px] font-bold mt-1 text-black italic">Date: 05 Apr 2026</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="border border-black p-4">
                               <p className="text-[10px] font-black text-black/30 mb-1  tracking-tight">BILL TO:</p>
                               <p className="text-sm font-bold  tracking-tight leading-none mb-1">{customerName || 'Walking Customer'}</p>
                               <p className="text-xs font-bold text-black/60 break-words line-clamp-1">{customerPhone || 'Not provided'}</p>
                           </div>
                           <div className="border border-black p-4 flex flex-col items-center justify-center">
                               <p className="text-[10px] font-black text-black/30 mb-1  tracking-tight">STATUS:</p>
                               <span className={cn("text-xs font-black px-3 py-1 rounded-[10px]", paymentStatus === 'PAID' ? "text-income" : "text-expense")}>
                                  {paymentStatus}
                               </span>
                           </div>
                        </div>

                        <table className="w-full border-collapse border border-black mb-10 text-[10px]">
                            <thead>
                                <tr className="bg-[#F9D6EB] border-b border-black">
                                  <th className="border-r border-black p-2.5 w-10 text-left ">S.No</th>
                                  <th className="border-r border-black p-2.5 text-left  tracking-tight">Items</th>
                                  <th className="border-r border-black p-2.5 w-12 text-center ">Qty</th>
                                  <th className="border-r border-black p-2.5 w-20 text-right ">Rate</th>
                                  <th className="border-r border-black p-2.5 w-16 text-right ">Disc</th>
                                  <th className="p-2.5 w-24 text-right  font-black tracking-tighter">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                  <tr key={item.id} className="border-b border-black h-10">
                                    <td className="border-r border-black p-2.5">{i+1}</td>
                                    <td className="border-r border-black p-2.5 font-bold italic  tracking-tight">{item.name || 'Sample Service'}</td>
                                    <td className="border-r border-black p-2.5 text-center">{item.qty}</td>
                                    <td className="border-r border-black p-2.5 text-right">{item.price}</td>
                                    <td className="border-r border-black p-2.5 text-right">-</td>
                                    <td className="p-2.5 text-right font-black tracking-tighter">{item.price * item.qty}.00</td>
                                  </tr>
                                ))}
                                <tr className="border-b border-black">
                                  <td colSpan={5} className="border-r border-black p-2 text-right font-bold italic text-black/30">Subtotal</td>
                                  <td className="p-2 text-right font-bold opacity-50">{total}.00</td>
                                </tr>
                                <tr className="bg-black/5 font-black text-xs h-12">
                                  <td colSpan={5} className="border-r border-black p-3 text-right  italic tracking-tight text-black">TOTAL BILL AMOUNT</td>
                                  <td className="p-3 text-right tracking-tighter text-black">₹{total}.00</td>
                                </tr>
                                <tr className="border-t border-black">
                                  <td colSpan={5} className="border-r border-black p-2 text-right font-black  text-[9px] tracking-tight text-black/50">Settlement Balance</td>
                                  <td className={cn("p-2 text-right font-black tracking-tighter text-xs", paymentStatus === 'PAID' ? "text-income" : "text-expense")}>
                                     ₹{paymentStatus === 'PAID' ? '0' : total}.00
                                  </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="border border-black p-5 mt-12">
                            <p className="text-[9px] font-black text-black/30 mb-2  tracking-tight">Total Amount In Words:</p>
                            <p className="text-xs font-black italic tracking-wide lowercase decoration-ios-pink underline-offset-4">Rupees {total} only.</p>
                        </div>
                      </div>
                    )}

                    {style === 'THERMAL' && (
                       <div className="text-[11px] text-black relative">
                        <div className="text-center mb-8">
                            <h1 className="text-xl font-black  tracking-tighter">MVEE.IN</h1>
                            <p className="font-bold border-b border-black border-dashed pb-2 inline-block">+91 9961463124</p>
                        </div>

                        <div className="space-y-1 mb-8">
                            <p className="font-black  tracking-tight text-[9px] mb-2 underline underline-offset-4">BILLING TO:</p>
                            <p className="font-black  text-sm leading-none">{customerName || 'UMMA'}</p>
                            <p className="font-bold text-[10px]">PH: {customerPhone || '9744375069'}</p>
                        </div>
                        <div className="border-t border-black border-dashed mb-4" />
                        <div className="text-center space-y-1 text-[10px] font-bold  tracking-tight text-black">
                            <p className="font-black text-black underline underline-offset-4 decoration-black mb-1">{currentHeadline}</p>
                            <p>Cash Sale Receipt</p>
                            <p>Inv #739</p>
                            <p>05-04-2026</p>
                        </div>
                        <div className="border-t border-black border-dashed mt-4 mb-6" />
                        <div className="relative">
                           {paymentStatus === 'PAID' && (
                              <div className="absolute inset-x-0 inset-y-[-20%] flex items-center justify-center pointer-events-none z-10 select-none overflow-hidden">
                                 <div 
                                    className="border-[6px] border-[#2563EB]/70 text-[#2563EB]/80 p-6 rounded-[10px] flex flex-col items-center justify-center rotate-[-12deg] ring-4 ring-[#2563EB]/5 bg-white/10 backdrop-blur-[1px] shadow-2xl scale-125"
                                    style={{
                                      boxShadow: 'inset 0 0 15px rgba(37, 99, 235, 0.1)',
                                      filter: 'contrast(1.5) saturate(1.4)',
                                      maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'0 0 200 200\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                                      WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'0 0 200 200\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
                                    }}
                                 >
                                    <CheckCircle2 className="w-10 h-10 mb-1 opacity-60" />
                                    <span className="font-black text-3xl  tracking-tight leading-none">RECEIVED</span>
                                    <span className="text-[10px] font-black mt-1 italic tracking-tight opacity-40">CashFlow Ledger</span>
                                 </div>
                              </div>
                           )}
                           <div className="space-y-4 relative z-0">
                               <div className="flex justify-between font-black text-[9px]  tracking-tight text-black">
                                 <span className="w-1/2">Description</span>
                                 <span className="w-1/4 text-center">Qty</span>
                                 <span className="w-1/4 text-right">Sum</span>
                               </div>
                               {items.map(item => (
                                 <div key={item.id} className="flex justify-between font-black text-xs">
                                   <span className="w-1/2  truncate pr-2">{item.name || 'Sample Item'}</span>
                                   <span className="w-1/4 text-center">{item.qty}</span>
                                   <span className="w-1/4 text-right tracking-tighter">{item.price * item.qty}</span>
                                 </div>
                               ))}
                           </div>
                        </div>
                        <div className="border-t border-black border-dashed mt-8 mb-4 " />
                        <div className="text-right font-black text-lg tracking-tighter  leading-none pb-2">
                            NET: {total}.00
                        </div>
                        <div className="border-b border-black border-dashed mb-6" />
                        <div className="flex flex-col items-end gap-3 font-black  text-[10px]">
                            <div className="flex justify-between w-44">
                              <span className="text-black">RECEIVED:</span>
                              <span>₹{paymentStatus === 'PAID' ? total : '0'}.00</span>
                            </div>
                            <div className="flex justify-between w-44 text-sm border-t border-black pt-2">
                              <span>BALANCE:</span>
                              <span className={paymentStatus === 'PAID' ? "text-income" : "text-expense"}>{paymentStatus === 'PAID' ? '0.00' : `${total}.00`}</span>
                            </div>
                            <div className="text-center text-[9px] font-black  tracking-tight opacity-30 mt-12 underline underline-offset-[6px]">
                                {paymentStatus === 'PAID' ? '* Fully Paid *' : '* Thank You *'}
                            </div>
                        </div>
                      </div>
                    )}

                    {style === 'PREMIUM' && (
                       <div className="p-10 text-black bg-white min-h-full flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#36A893]/5 rounded-[10px]-[100%] z-0" />
                        
                        <div className="flex justify-between items-start mb-16 border-t-[10px] border-[#36A893] pt-10 relative z-10">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-[#36A893] rounded-[10px] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-[#36A893]/30">CF</div>
                              <div className="space-y-1">
                                  <h1 className="text-3xl font-black italic tracking-tighter leading-none">MVEE.IN</h1>
                                  <div className="flex items-center gap-2">
                                     <div className="w-2 h-2 bg-[#36A893] rounded-[10px] animate-pulse" />
                                     <p className="text-[10px] text-black/40 font-black  tracking-tight">+91 9961463124</p>
                                  </div>
                              </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-4xl font-black italic tracking-tighter  leading-none mb-1 text-black">INVOICE</h1>
                                <p className="text-[11px] font-black text-[#36A893]  tracking-tight italic">No. 2026XU92</p>
                                <p className="text-[10px] font-bold text-black/20 italic mt-2  tracking-tight leading-none">Date: 05 April 2026</p>
                            </div>
                        </div>

                        <div className="text-center mb-10 py-4 border-b border-black/5">
                            <h2 className="text-2xl font-black tracking-tight italic text-black ">{currentHeadline}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-16 mb-20 relative z-10">
                            <div className="space-y-6">
                                <div>
                                  <p className="text-[10px] text-black/30 font-black  tracking-tight">Full audit of CashFlow</p>
                                  <h3 className="text-2xl font-black  tracking-tighter italic border-l-4 border-black pl-5 mb-2">{customerName || 'Global Client'}</h3>
                                  <div className="pl-6 space-y-1">
                                     <p className="text-xs font-black text-black/40">M: {customerPhone || '+91 9961463124'}</p>
                                     <p className="text-[10px] font-bold text-black/20 italic  tracking-tight">STATUS: {paymentStatus}</p>
                                  </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-center">
                                {paymentStatus === 'UNPAID' ? (
                                   <div className="absolute top-0 right-0 border-[8px] border-expense/20 text-expense/20 px-10 py-6 rounded-[10px] text-5xl font-black  -rotate-[15deg] tracking-tight select-none pointer-events-none group-hover:opacity-60 transition-opacity"
                                     style={{
                                       maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'0 0 200 200\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                                       WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'0 0 200 200\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
                                     }}
                                   >
                                      UNPAID
                                   </div>
                                ) : (
                                   <div className="absolute top-0 right-0 border-[8px] border-ios-blue/30 text-ios-blue/30 px-10 py-6 rounded-[10px] text-5xl font-black  -rotate-[15deg] tracking-tight select-none pointer-events-none"
                                     style={{
                                       maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'0 0 200 200\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                                       WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'0 0 200 200\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
                                     }}
                                   >
                                      FULLY PAID
                                   </div>
                                )}
                                
                                <div className="text-right relative z-10">
                                  <p className="text-[10px] font-black text-[#36A893]  tracking-tight mb-2 italic tracking-tight">Net Payable</p>
                                  <h2 className="text-7xl font-black tracking-tighter italic leading-none flex items-start justify-end gap-2">
                                     <span className="text-2xl mt-2">₹</span>{paymentStatus === 'PAID' ? '0' : total}
                                  </h2>
                                  <div className={cn(
                                     "mt-4 inline-block px-5 py-1.5 text-[9px] font-black  tracking-tight italic text-white shadow-xl shadow-black/10",
                                     paymentStatus === 'PAID' ? "bg-ios-blue" : "bg-black"
                                  )}>
                                     {paymentStatus === 'PAID' ? 'Account Settled' : 'Payment Overdue'}
                                  </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative z-10">
                           <table className="w-full">
                             <thead>
                                <tr className="bg-gray-900 text-white text-[10px] font-black  tracking-tight border-none shadow-xl">
                                  <th className="p-5 text-left rounded-[10px]-2xl">#</th>
                                  <th className="p-5 text-left">Description</th>
                                  <th className="p-5 text-center">Qty</th>
                                  <th className="p-5 text-right rounded-[10px]-2xl">Subtotal</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-black/5 pt-4">
                                {items.map((item, i) => (
                                  <tr key={item.id} className="h-24 group transition-colors">
                                    <td className="p-5 text-[10px] font-black text-black/20 italic">{String(i+1).padStart(2, '0')}</td>
                                    <td className="p-5">
                                       <p className="font-black italic  text-lg tracking-tight leading-none mb-1">{item.name || 'Professional Asset'}</p>
                                       <p className="text-[9px] font-semibold text-black/30  tracking-tight">{paymentStatus === 'PAID' ? 'Transaction Success' : 'Awaiting Payment'}</p>
                                       <span className="text-[9px] font-black text-black/30  tracking-tight block mb-1">CashFlow Profit/Loss</span>
                                    </td>
                                    <td className="p-5 text-center font-black text-3xl tracking-tighter italic text-black/10 transition-colors group-hover:text-black">{item.qty}</td>
                                    <td className="p-5 text-right font-black italic text-2xl tracking-tighter">₹ {item.price * item.qty}</td>
                                  </tr>
                                ))}
                             </tbody>
                           </table>
                        </div>

                        <div className="mt-20 space-y-16 relative z-10">
                           <div className="flex flex-col items-end gap-1 border-t-[2px] border-black pt-10">
                              <h3 className="text-xl font-black italic text-black/20  tracking-tight leading-none mb-2">Total Bill Value</h3>
                              <h2 className="text-8xl font-black tracking-tighter italic leading-none mb-3 text-black">₹{total}</h2>
                              <p className="text-[10px] font-black text-black/60  tracking-tight italic leading-none bg-[#36A893]/10 px-4 py-2 rounded-[10px]">
                                Rupees {total} only
                              </p>
                           </div>

                           <div className="relative group text-center py-10">
                              <div className="absolute inset-0 border-[2px] border-black/5 scale-[1.05] -skew-x-[15deg] group-hover:bg-[#36A893]/5 transition-all duration-1000 origin-center" />
                              <p className="font-black italic  tracking-tight text-[11px] text-[#36A893] relative z-10">
                                 ~ OFFICIALLY SECURED DIGITAL RECORD ~
                              </p>
                           </div>

                           <div className="flex justify-between items-end bg-[#FBFBFB] p-10 rounded-[10px] border border-black/5 shadow-inner">
                              <div>
                                 <p className="text-[10px] font-black text-black/30 italic  tracking-tight mb-4">Note to client:</p>
                                 <p className="text-[10px] font-black text-black/40 max-w-[3200px] leading-relaxed  italic opacity-60">This certificate serves as a valid proof of transaction. All disputes are subject to the terms of service of CashFlow Professional.</p>
                              </div>
                              <div className="w-64 text-center">
                                 <div className="w-20 h-20 border-[6px] border-[#36A893]/10 rounded-[10px] mx-auto mb-6 flex items-center justify-center relative overflow-hidden group">
                                    <CheckCircle2 className="w-10 h-10 text-[#36A893]/20" />
                                    <div className="absolute inset-0 bg-[#36A893]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                 </div>
                                 <div className="h-[2px] bg-black/20 mb-3 w-[70%] mx-auto" />
                                 <p className="text-[9px] font-black  tracking-tight text-black/40 italic">System Verified</p>
                              </div>
                           </div>
                           <div className="h-6 bg-[#36A893] rounded-[10px] w-full relative overflow-hidden shadow-xl shadow-[#36A893]/20">
                              <div className="absolute inset-0 bg-white/30 animate-[pulse_2s_infinite] mix-blend-overlay" />
                           </div>
                        </div>
                      </div>
                    )}
                 </div>
               </div>

               {/* Interaction Footer */}
               <div className="bg-white p-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] border-t border-black/5 flex items-center justify-between gap-4 z-50 print:hidden shadow-[0_-15px_30px_rgba(0,0,0,0.03)]">
                  <div className="flex gap-3">
                     <button 
                       disabled={isCapturing || isSharing}
                       onClick={() => handleDownload('JPG')}
                       className="w-16 h-16 bg-gray-50 border border-black/5 rounded-[10px] flex flex-col items-center justify-center text-black active:scale-90 transition-all font-black group disabled:opacity-50"
                     >
                        <ImageIcon className={cn("w-6 h-6 text-black/30 group-hover:text-black", isCapturing && "animate-pulse")} />
                        <span className="text-[8px]  tracking-tight mt-1">{isCapturing ? 'Saving' : 'Image'}</span>
                     </button>
                     <button 
                       onClick={() => handleDownload('PDF')}
                       className="w-16 h-16 bg-gray-50 border border-black/5 rounded-[10px] flex flex-col items-center justify-center text-black active:scale-90 transition-all font-black group"
                     >
                        <FileText className="w-6 h-6 text-black/30 group-hover:text-black" />
                        <span className="text-[8px]  tracking-tight mt-1">PDF</span>
                     </button>
                  </div>
                  <button 
                    disabled={isSharing || isCapturing}
                    onClick={handleWhatsAppShare}
                    className="flex-1 h-16 bg-[#25D366] text-white rounded-[10px] font-black flex items-center justify-center gap-4 shadow-2xl shadow-[#25D366]/20 active:scale-95 transition-all text-[13px]  tracking-tight italic disabled:opacity-50"
                  >
                    {isSharing ? (
                       <span className="animate-pulse">PREPARING ATTACHMENT...</span>
                    ) : (
                       <>
                          <Send className="w-6 h-6 fill-current" /> SHARE TO WHATSAPP
                       </>
                    )}
                  </button>
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
