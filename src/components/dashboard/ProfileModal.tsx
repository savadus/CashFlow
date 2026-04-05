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
              <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Administrative Profile</h1>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-1 italic">Identity & Institutional Control</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-12 -mt-10 bg-background rounded-t-[48px] shadow-2xl relative z-10 scroll-smooth pb-32">
        <div className="max-w-md mx-auto space-y-10">
          
          {/* Profile Image Section */}
          <section className="flex flex-col items-center">
             <div className="relative group">
                <div className="w-32 h-32 rounded-[40px] bg-secondary border-4 border-card-border overflow-hidden shadow-2xl">
                   {userImage ? (
                     <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-tertiary">
                        <User className="w-12 h-12 text-text-dim" />
                     </div>
                   )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-background">
                   <Camera className="w-4 h-4" />
                </div>
             </div>
             <div className="w-full mt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-3 ml-4">Profile Image URL</p>
                <input 
                  type="text"
                  value={userImage}
                  onChange={(e) => setUserImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full bg-secondary border border-card-border rounded-[24px] p-5 font-bold text-xs outline-none focus:border-foreground transition-all text-foreground"
                />
             </div>
          </section>

          {/* Personal Info */}
          <section>
             <h2 className="text-[10px] items-center flex gap-3 font-black uppercase tracking-[0.4em] text-text-dim mb-6">
                <User className="w-3 h-3" />
                Personal Identity
             </h2>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-3 ml-4">Administrative Name</p>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value.toUpperCase())}
                  className="w-full bg-black text-white rounded-[24px] p-6 font-black text-sm tracking-[0.1em] outline-none shadow-2xl uppercase italic"
                />
             </div>
          </section>

          {/* Institutional Control */}
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
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={bank.id}
                  >
                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim mb-2 ml-4">INSTITUTION {index + 1}</p>
                     <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                           <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                           <input 
                              type="text"
                              value={bank.name}
                              onChange={(e) => handleBankChange(bank.id, e.target.value)}
                              placeholder={`NAME FOR ${bank.id}`}
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
                  </motion.div>
                ))}
             </div>
          </section>

          {/* Action Footer */}
          <div className="pt-10">
             <button 
               onClick={handleSave}
               disabled={isSaved}
               className={cn(
                 "w-full p-8 rounded-[40px] font-black text-xs uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95",
                 isSaved ? "bg-green-500 text-white" : "bg-black text-white hover:bg-black/90"
               )}
             >
                {isSaved ? (
                   <>
                     <CheckCircle2 className="w-5 h-5" />
                     HUB RECONFIGURED
                   </>
                ) : (
                   <>
                     <Save className="w-5 h-5" />
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
