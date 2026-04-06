'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useTranslation } from '@/hooks/useTranslation';

export const AboutHub = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { state } = useFinance();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      className="fixed inset-0 z-[300] bg-[#F2F2F7] flex flex-col pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="bg-black px-6 py-8 pb-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-[10px] -mr-20 -mt-20 blur-3xl" />
        <div className="flex items-center justify-between text-white relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-[10px] hover:bg-white/20 transition-all border border-white/10"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter leading-none">About Platform</h1>
              <p className="text-[10px] text-white/40 font-black tracking-tight mt-1 italic">Mastered for Excellence</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 -mt-10 bg-white rounded-[10px]-[48px] shadow-2xl relative z-10 scroll-smooth pb-32">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center mb-10">
             <div className="w-20 h-20 bg-black rounded-[10px] flex items-center justify-center shadow-2xl mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                <div className="w-12 h-12 flex items-center justify-center">
                   <img src="/cash-flow-logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
             </div>
             <h2 className="text-3xl font-black italic tracking-tighter text-black leading-none mb-2">CashFlow</h2>
             <p className="text-[10px] font-black text-black/20 tracking-tight uppercase italic tracking-[0.2em]">{t('BUSINESS_SUITE')}</p>
          </div>

          <div className="space-y-8">
             <section className="bg-[#F2F2F7] p-8 rounded-[10px] border border-black/5">
                <p className="text-xs font-black leading-relaxed text-black italic tracking-tight text-center">
                   {state.userProfile?.language === 'ml' 
                     ? 'സാമ്പത്തിക ഇടപാടുകൾ കൃത്യമായി രേഖപ്പെടുത്തുന്നതിനുള്ള മികച്ച പ്ലാറ്റ്‌ഫോം. ബിസിനസ് വേഗതയും സുതാര്യതയും ഉറപ്പാക്കുന്ന രീതിയിലാണ് ഇതിന്റെ രൂപകല്പന.'
                     : state.userProfile?.language === 'hi'
                       ? 'वित्तीय लेनदेन को सटीक रूप से रिकॉर्ड करने के लिए सबसे अच्छा मंच। व्यवसाय की गति और पारदर्शिता सुनिश्चित करने के लिए डिज़ाइन किया गया।'
                       : 'The absolute standard in business cash management. An industrial-grade fiscal ecosystem engineered for speed, transparency, and high-fidelity auditing.'}
                </p>
             </section>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[10px] border border-black/5 shadow-sm flex flex-col items-center text-center">
                   <ShieldCheck className="w-6 h-6 text-ios-blue mb-3" />
                   <p className="text-[10px] font-black text-black tracking-tight leading-none mb-1 uppercase">Secure</p>
                   <p className="text-[8px] font-black text-black/20 italic">LOCAL ENCRYPTION</p>
                </div>
                <div className="bg-white p-6 rounded-[10px] border border-black/5 shadow-sm flex flex-col items-center text-center">
                   <Heart className="w-6 h-6 text-ios-pink animate-pulse mb-3" />
                   <p className="text-[10px] font-black text-black tracking-tight leading-none mb-1 uppercase">Reliable</p>
                   <p className="text-[8px] font-black text-black/20 italic">AUDIT READY</p>
                </div>
             </div>

             <div className="pt-12 text-center">
                <div className="inline-block px-6 py-2 bg-black/5 rounded-full border border-black/5 mb-4">
                   <p className="text-[9px] font-black text-black/40 tracking-tight italic">
                      MVEE v1.0.4 - INDUSTRIAL SERIES
                   </p>
                </div>
                <p className="text-[10px] font-black text-black/10 tracking-tight uppercase tracking-widest italic">
                   Developed with Absolute Focus
                </p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
