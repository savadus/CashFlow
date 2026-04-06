'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Camera, Building2, Save, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { state, dispatch } = useFinance();
  const { t } = useTranslation();
  
  const [userName, setUserName] = useState(state.userProfile?.name || '');
  const [userImage, setUserImage] = useState(state.userProfile?.image || '');
  const [banks, setBanks] = useState(state.userProfile?.banks || [
    { id: 'BANK_BARODA', name: 'BARODA' },
    { id: 'BANK_SBI', name: 'SBI BANK' }
  ]);

  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

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

  const handleSave = () => {
    dispatch({
      type: 'SET_PROFILE',
      payload: {
        ...state.userProfile!,
        name: userName.toUpperCase(),
        image: userImage,
        banks: banks.filter(b => b.name.trim() !== '')
      }
    });
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="fixed inset-0 z-[300] bg-background flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="bg-black px-6 py-8 pb-10 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="flex items-center justify-between text-white relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2.5 bg-white/10 backdrop-blur-xl rounded-2xl hover:bg-white/20 transition-all border border-white/10"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-base font-bold tracking-tight uppercase leading-none">Administrative Profile</h1>
              <p className="text-[8px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1.5">Identity & Institutional Control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 -mt-6 bg-background rounded-t-[32px] shadow-2xl relative z-10 scroll-smooth pb-32">
        <div className="max-w-md mx-auto space-y-8">
          
          {/* Profile Image Section */}
          <section className="flex flex-col items-center">
             <div className="relative group">
                <div className="w-24 h-24 rounded-[32px] bg-secondary border-2 border-card-border overflow-hidden shadow-xl">
                   {userImage ? (
                     <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-tertiary">
                        <User className="w-10 h-10 text-text-dim" />
                     </div>
                   )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center shadow-xl border-2 border-background">
                   <Camera className="w-3.5 h-3.5" />
                </div>
             </div>
             <div className="w-full mt-6">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-text-dim mb-2.5 ml-2">Profile Image URL</p>
                <input 
                  type="text"
                  value={userImage}
                  onChange={(e) => setUserImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-secondary border border-card-border rounded-2xl p-4 font-bold text-[10px] outline-none focus:border-foreground transition-all text-foreground"
                />
             </div>
          </section>

          {/* Personal Info */}
          <section>
             <h2 className="text-[8px] items-center flex gap-2.5 font-bold uppercase tracking-[0.3em] text-text-dim mb-4">
                <User className="w-3 h-3" />
                Personal Identity
             </h2>
             <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-text-dim mb-2.5 ml-2">Administrative Name</p>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value.toUpperCase())}
                  className="w-full bg-black text-white rounded-2xl p-4.5 font-bold text-xs tracking-wider outline-none shadow-xl uppercase"
                />
             </div>
          </section>

          {/* Institutional Control */}
          <section>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-[8px] items-center flex gap-2.5 font-bold uppercase tracking-[0.3em] text-text-dim">
                   <Building2 className="w-3 h-3" />
                   Bank Hub configuration
                </h2>
                <button 
                  onClick={handleAddBank}
                  className="p-1.5 bg-secondary rounded-lg hover:bg-tertiary transition-all border border-card-border text-foreground"
                >
                   <CheckCircle2 className="w-3.5 h-3.5 rotate-45" />
                </button>
             </div>
             <div className="space-y-3">
                {banks.map((bank, index) => (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={bank.id}
                  >
                     <p className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-text-dim mb-1.5 ml-2">INSTITUTION {index + 1}</p>
                     <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                           <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-dim" />
                           <input 
                              type="text"
                              value={bank.name}
                              onChange={(e) => handleBankChange(bank.id, e.target.value)}
                              placeholder={`NAME FOR ${bank.id}`}
                              className="w-full bg-secondary border border-card-border rounded-xl p-3.5 pl-11 font-bold text-[10px] outline-none focus:border-foreground transition-all uppercase tracking-widest text-foreground placeholder:text-black/10"
                           />
                        </div>
                        <button 
                          onClick={() => handleRemoveBank(bank.id)}
                          className="p-3 bg-expense/5 text-expense rounded-xl hover:bg-expense/10 transition-all border border-expense/10"
                        >
                           <X className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </motion.div>
                ))}
             </div>
          </section>

          {/* Action Footer */}
          <div className="pt-6">
             <button 
               onClick={handleSave}
               disabled={isSaved}
               className={cn(
                 "w-full p-4.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95",
                 isSaved ? "bg-green-500 text-white" : "bg-black text-white hover:bg-black/90 shadow-black/10"
               )}
             >
                {isSaved ? (
                   <>
                     <CheckCircle2 className="w-4 h-4" />
                     HUB RECONFIGURED
                   </>
                ) : (
                   <>
                     <Save className="w-4 h-4" />
                     LOCK CHANGES
                   </>
                )}
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
