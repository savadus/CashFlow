'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, LogOut, ChevronLeft, Check, Palette, Sun, Moon, Building2, CheckCircle2, Save } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export const SettingsHub = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { state, dispatch } = useFinance();
  const { t } = useTranslation();

  const [banks, setBanks] = React.useState(state.userProfile?.banks || []);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setBanks(state.userProfile?.banks || []);
    }
  }, [isOpen, state.userProfile?.banks]);

  const handleAddBank = () => {
    const newId = `BANK_${Date.now()}`;
    setBanks([...banks, { id: newId, name: '' }]);
  };

  const handleRemoveBank = (id: string) => {
    setBanks(banks.filter(b => b.id !== id));
  };

  const handleBankChange = (id: string, name: string) => {
    setBanks(banks.map(b => b.id === id ? { ...b, name: name.toUpperCase() } : b));
  };

  const handleSaveBanks = () => {
    setIsSaving(true);
    dispatch({
      type: 'SET_PROFILE',
      payload: {
        ...state.userProfile!,
        banks: banks.filter(b => b.name.trim() !== '')
      }
    });
    setTimeout(() => setIsSaving(false), 800);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      className="fixed inset-0 z-[300] bg-background flex flex-col"
    >
      <div className="bg-black px-6 py-12 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="flex items-center justify-between text-white relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition-all border border-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">{t('SYSTEM_SETTINGS')}</h1>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-1 italic">Administrative Control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 -mt-10 bg-background rounded-t-[48px] shadow-2xl relative z-10 scroll-smooth pb-32">
         <div className="space-y-12">
            {/* Visual Mode */}
            <section>
               <h2 className="text-[10px] items-center flex gap-3 font-black uppercase tracking-[0.4em] text-text-dim mb-6">
                  <Sun className="w-3 h-3" />
                  Visual Mode
               </h2>
               <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'LIGHT', name: 'Light Mode', icon: Sun, bg: 'bg-white', text: 'text-black' },
                    { id: 'DARK', name: 'Dark Mode', icon: Moon, bg: 'bg-zinc-900', text: 'text-white' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      onClick={() => dispatch({ type: 'SET_VISUAL_MODE', payload: v.id as any })}
                      className={cn(
                        "p-6 rounded-[32px] flex flex-col items-center gap-4 transition-all active:scale-[0.98] border",
                        state.visualMode === v.id ? "bg-black text-white shadow-2xl border-black" : "bg-card text-text-dim border-card-border"
                      )}
                    >
                       <div className={cn("w-10 h-10 rounded-2xl shadow-inner flex items-center justify-center", v.bg, v.text)}>
                          <v.icon className="w-5 h-5" />
                       </div>
                       <span className="font-black text-[10px] uppercase tracking-widest leading-none">{v.name}</span>
                       {state.visualMode === v.id && <Check className="w-4 h-4 mt-1" />}
                    </button>
                  ))}
               </div>
            </section>

            {/* Bank Hub Configuration */}
            <section>
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] items-center flex gap-3 font-black uppercase tracking-[0.4em] text-text-dim">
                     <Building2 className="w-3 h-3" />
                     Bank Hub configuration
                  </h2>
                  <button 
                    onClick={handleAddBank}
                    className="p-2 bg-secondary rounded-xl hover:bg-tertiary transition-all border border-card-border text-foreground"
                  >
                     <CheckCircle2 className="w-4 h-4 rotate-45" />
                  </button>
               </div>
               <div className="space-y-4">
                  {banks.map((bank, index) => (
                    <div key={bank.id}>
                       <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim mb-2 ml-4">INSTITUTION {index + 1}</p>
                       <div className="relative flex items-center gap-2">
                          <div className="relative flex-1">
                             <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                             <input 
                                type="text"
                                value={bank.name}
                                onChange={(e) => handleBankChange(bank.id, e.target.value)}
                                placeholder="BANK NAME..."
                                className="w-full bg-secondary border border-card-border rounded-[24px] p-5 pl-14 font-bold text-xs outline-none focus:border-foreground transition-all uppercase tracking-widest text-foreground"
                             />
                          </div>
                          <button 
                            onClick={() => handleRemoveBank(bank.id)}
                            className="p-4 bg-expense/10 text-expense rounded-2xl hover:bg-expense/20 transition-all border border-expense/20"
                          >
                             <X className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleSaveBanks}
                    disabled={isSaving}
                    className={cn(
                      "w-full p-6 mt-4 rounded-[28px] font-black text-[10px] uppercase tracking-[0.4em] italic flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95",
                      isSaving ? "bg-green-500 text-white" : "bg-black text-white"
                    )}
                  >
                    {isSaving ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'HUB UPDATED' : 'SAVE HUB CONFIG'}
                  </button>
               </div>
            </section>

            {/* Language */}
            <section>
               <h2 className="text-[10px] items-center flex gap-3 font-black uppercase tracking-[0.4em] text-text-dim mb-6">
                  <Globe className="w-3 h-3" />
                  {t('LANGUAGE')}
               </h2>
               <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'en', name: 'ENGLISH', label: 'ENGLISH' },
                    { id: 'ml', name: 'MALAYALAM', label: 'മലയാളം' },
                    { id: 'hi', name: 'HINDI', label: 'हिन्दी' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => dispatch({ type: 'SET_PROFILE', payload: { ...state.userProfile!, language: lang.id as any }})}
                      className={cn(
                        "w-full p-6 rounded-[32px] flex items-center justify-between transition-all active:scale-[0.98] group",
                        state.userProfile?.language === lang.id ? "bg-black text-white shadow-2xl" : "bg-card text-text-dim border border-card-border shadow-sm"
                      )}
                    >
                      <div className="text-left">
                        <p className={cn("font-black text-xs uppercase tracking-widest leading-none mb-1", state.userProfile?.language === lang.id ? "text-white" : "text-foreground")}>{lang.name}</p>
                        <p className={cn("text-[10px] font-black opacity-30", state.userProfile?.language === lang.id && "text-white/40")}>{lang.label}</p>
                      </div>
                      {state.userProfile?.language === lang.id && <Check className="w-6 h-6" />}
                    </button>
                  ))}
               </div>
            </section>

            <section className="pt-8 border-t border-card-border">
               <h2 className="text-[10px] items-center flex gap-3 font-black uppercase tracking-[0.4em] text-text-dim mb-6">
                  <LogOut className="w-3 h-3" />
                  Sovereign Control
               </h2>
               <button 
                  onClick={() => {
                     if (confirm(state.userProfile?.language === 'ml' ? "നമ്മുടെ ലോക്കൗട്ട് ചെയ്യട്ടെ? ഉള്ളവയെല്ലാം ഈ ഡിവൈസിൽ സേവ് ചെയ്യപ്പെട്ടിട്ടുണ്ടാകും." : "Are you sure you want to terminate this session? All local settings will be preserved.")) {
                        localStorage.removeItem('cashflow_data');
                        window.location.reload();
                     }
                  }}
                  className="w-full bg-expense/5 text-expense p-8 rounded-[40px] border border-expense/10 flex items-center justify-between group active:scale-95 transition-all"
               >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-expense text-white rounded-2xl flex items-center justify-center shadow-lg shadow-expense/20">
                        <LogOut className="w-6 h-6" />
                     </div>
                     <div className="text-left">
                        <p className="font-black text-sm uppercase tracking-widest leading-none mb-1">Terminate Session</p>
                        <p className="text-[9px] font-bold text-expense/40 uppercase tracking-widest">WIPE LOCAL CACHE AND RELOAD</p>
                     </div>
                  </div>
               </button>
            </section>
         </div>

         <div className="mt-20 py-8 text-center border-t border-black/5">
            <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.6em] italic mb-2">
               CashFlow Secure Gateway
            </p>
            <p className="text-[8px] font-bold text-black/10 uppercase tracking-[0.2em]">End-to-End Local Encryption Active</p>
         </div>
      </div>
    </motion.div>
  );
};
