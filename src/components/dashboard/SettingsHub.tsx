'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, LogOut, ChevronLeft, Check, Palette, Sun, Moon, Building2, CheckCircle2, Save, Plus } from 'lucide-react';
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
      <div className="bg-black px-6 py-8 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-[10px] -mr-20 -mt-20 blur-3xl" />
        <div className="flex items-center justify-between text-white relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-[10px] hover:bg-white/20 transition-all border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black italic tracking-tighter  leading-none">{t('SYSTEM_SETTINGS')}</h1>
              <p className="text-[10px] text-white/40 font-black  tracking-tight mt-1 italic">Administrative Control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10 -mt-8 bg-[#F2F2F7] rounded-[10px]-[40px] shadow-2xl relative z-10 scroll-smooth pb-32">
          <div className="max-w-md mx-auto space-y-6">
             {/* Visual Mode - Segmented Control */}
             <section>
                <h2 className="text-[10px] font-black text-black/30 tracking-tight mb-3 ml-1 uppercase italic">Visual Mode</h2>
                <div className="bg-white p-1 rounded-[10px] flex gap-1 shadow-sm border border-black/5">
                   {[
                     { id: 'LIGHT', name: 'Light', icon: Sun },
                     { id: 'DARK', name: 'Dark', icon: Moon }
                   ].map((v) => (
                     <button
                       key={v.id}
                       onClick={() => dispatch({ type: 'SET_VISUAL_MODE', payload: v.id as any })}
                       className={cn(
                         "flex-1 py-1.5 rounded-[10px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                         state.visualMode === v.id ? "bg-black text-white shadow-lg" : "text-black/40 hover:bg-black/5"
                       )}
                     >
                        <v.icon className={cn("w-3.5 h-3.5", state.visualMode === v.id ? "text-white" : "text-black/20")} />
                        <span className="font-black text-[10px] tracking-tight">{v.name}</span>
                     </button>
                   ))}
                </div>
             </section>
 
             {/* Bank Hub Configuration - Grouped List */}
             <section>
                <div className="flex items-center justify-between mb-3 px-1">
                   <h2 className="text-[10px] font-black text-black/30 tracking-tight uppercase italic">Bank Hub</h2>
                   <button 
                     onClick={handleAddBank}
                     className="text-blue-600 font-black text-[10px] flex items-center gap-1 active:scale-90 transition-all"
                   >
                      <Plus className="w-3.5 h-3.5" /> ADD
                   </button>
                </div>
                <div className="bg-white rounded-[10px] overflow-hidden border border-black/5 shadow-sm divide-y divide-black/5">
                   {banks.length === 0 && (
                      <div className="p-8 text-center text-[10px] font-black text-black/10 italic">No Institutions Configured</div>
                   )}
                   {banks.map((bank, index) => (
                     <div key={bank.id} className="flex items-center p-1.5 gap-3 group">
                        <div className="w-8 h-8 bg-black/5 rounded-[10px] flex items-center justify-center shrink-0">
                           <Building2 className="w-3.5 h-3.5 text-black/40" />
                        </div>
                        <input 
                           type="text"
                           value={bank.name}
                           onChange={(e) => handleBankChange(bank.id, e.target.value)}
                           placeholder={`Institution ${index + 1}`}
                           className="flex-1 bg-transparent py-3 font-black text-[10px] outline-none text-black placeholder:text-black/10"
                        />
                        <button 
                          onClick={() => handleRemoveBank(bank.id)}
                          className="p-3 text-red-500/20 hover:text-red-500 transition-colors"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                   ))}
                </div>
                <button 
                  onClick={handleSaveBanks}
                  disabled={isSaving}
                  className={cn(
                    "w-full py-4 mt-3 rounded-[10px] font-black text-[10px] tracking-tight italic flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95",
                    isSaving ? "bg-green-500 text-white" : "bg-black text-white"
                  )}
                >
                  {isSaving ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'HUB RECONFIGURED' : 'LOCK CHANGES'}
                </button>
             </section>
 
             {/* Language - Grouped List */}
             <section>
                <h2 className="text-[10px] font-black text-black/30 tracking-tight mb-3 ml-1 uppercase italic">{t('LANGUAGE')}</h2>
                <div className="bg-white rounded-[10px] overflow-hidden border border-black/5 shadow-sm divide-y divide-black/5">
                   {[
                     { id: 'en', name: 'English', label: 'UK/US' },
                     { id: 'ml', name: 'Malayalam', label: 'മലയാളം' },
                     { id: 'hi', name: 'Hindi', label: 'हिन्दी' }
                   ].map((lang) => (
                     <button
                       key={lang.id}
                       onClick={() => dispatch({ type: 'SET_PROFILE', payload: { ...state.userProfile!, language: lang.id as any }})}
                       className="w-full p-4 flex items-center justify-between transition-all active:bg-black/5 group"
                     >
                       <div className="flex items-center gap-4">
                          <div className={cn("w-1.5 h-1.5 rounded-full", state.userProfile?.language === lang.id ? "bg-blue-600" : "bg-black/5")} />
                          <div className="text-left">
                            <p className="font-black text-[11px] tracking-tight text-black leading-none">{lang.name}</p>
                            <p className="text-[9px] font-black text-black/20 italic">{lang.label}</p>
                          </div>
                       </div>
                       {state.userProfile?.language === lang.id && <Check className="w-4 h-4 text-blue-600" />}
                     </button>
                   ))}
                </div>
             </section>
 
             {/* Danger Zone */}
             <section className="pt-4">
                <h2 className="text-[10px] font-black text-red-500/40 tracking-tight mb-3 ml-1 uppercase italic">Terminal Control</h2>
                 <button 
                    onClick={() => {
                       if (confirm(state.userProfile?.language === 'ml' ? "നമ്മുടെ ലോക്കൗട്ട് ചെയ്യട്ടെ? ഉള്ളവയെല്ലാം ഈ ഡിവൈസിൽ സേവ് ചെയ്യപ്പെട്ടിട്ടുണ്ടാകും." : "Are you sure you want to terminate this session? All local settings will be preserved.")) {
                          localStorage.removeItem('cashflow_data');
                          window.location.reload();
                       }
                    }}
                    className="w-full bg-white p-4 rounded-[10px] border border-red-500/10 flex items-center justify-between group active:scale-95 transition-all shadow-sm"
                 >
                    <div className="flex items-center gap-4">
                       <div className="w-8 h-8 bg-red-50 text-red-500 rounded-[10px] flex items-center justify-center">
                          <LogOut className="w-4 h-4" />
                       </div>
                       <div className="text-left">
                          <p className="font-black text-[11px] tracking-tight leading-none text-red-500">Terminate Session</p>
                          <p className="text-[8px] font-black text-black/20 italic">WIPE LOCAL CACHE</p>
                       </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-black/10 rotate-180" />
                 </button>
             </section>
 
             <div className="pt-12 text-center">
                <p className="text-[10px] font-black text-black/10 tracking-tight italic">
                   ~ CASHFLOW AUDIT SYSTEM V19.0.0 ~
                </p>
             </div>
          </div>
      </div>
    </motion.div>
  );
};
