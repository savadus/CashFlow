'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid, Receipt, ShoppingBag, UserPlus, Calendar, ShieldCheck, Wallet, History, LogOut, Globe, Info, Heart, Check, ChevronLeft, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinance } from '@/context/FinanceContext';
import { useTranslation } from '@/hooks/useTranslation';
import { SettingsHub } from './SettingsHub';
import { AboutHub } from './AboutHub';
import { CollectionHub } from './CollectionHub';

interface MoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBills: () => void;
  onOpenCashbook: () => void;
  onOpenLoans: () => void;
  onOpenCollection: () => void;
}

export const MoreMenu = ({ isOpen, onClose, onOpenBills, onOpenCashbook, onOpenLoans, onOpenCollection }: MoreMenuProps) => {
  const { state, dispatch } = useFinance();
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isAboutOpen, setIsAboutOpen] = React.useState(false);
  const userName = state.userProfile?.name || 'BUSINESS HUB';
  const userPurpose = t(state.userProfile?.purpose as any || 'BUSINESS');

  const gridItems = [
    { id: 'loans', label: t('LOANS'), icon: Wallet, color: 'bg-green-50 text-green-600', action: onOpenLoans },
    { id: 'cashbook', label: t('RECENT_TRANSACTIONS'), icon: History, color: 'bg-blue-50 text-blue-600', action: onOpenCashbook },
    { id: 'bills', label: t('BILLS'), icon: Receipt, color: 'bg-red-50 text-red-600', action: onOpenBills },
    { id: 'items', label: 'Inventory', icon: ShoppingBag, color: 'bg-purple-50 text-purple-600', action: () => {} },
    { id: 'staff', label: 'Staff Hub', icon: UserPlus, color: 'bg-yellow-50 text-yellow-600', action: () => {} },
    { id: 'collection', label: 'Collection', icon: Calendar, color: 'bg-orange-50 text-orange-600', action: onOpenCollection },
    { id: 'insurance', label: 'Premium', icon: ShieldCheck, color: 'bg-pink-50 text-pink-600', action: () => {} },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[200] bg-[#F2F2F7] flex flex-col overflow-hidden"
      >
        {/* Blue Header */}
        <div className="bg-black px-6 py-12 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-[10px] -mr-20 -mt-20 blur-3xl" />
          <div className="flex items-center justify-between text-white relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-[10px] flex items-center justify-center border border-white/10 shadow-lg">
                 <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black italic tracking-tighter  leading-none">{userName}</h1>
                <p className="text-[10px] text-white/30 font-black  tracking-tight mt-1 italic">{userPurpose}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-[10px] hover:bg-white/20 transition-all border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-12 -mt-10 bg-white rounded-[10px]-[48px] shadow-2xl relative z-10 scroll-smooth pb-32">
           <div className="mb-12">
              <div className="flex items-center justify-between mb-8 px-2">
                 <h2 className="text-[10px] font-black  tracking-tight text-black/60">{t('BUSINESS_SUITE')}</h2>
              </div>
              <div className="grid grid-cols-3 gap-6">
                 {gridItems.map((item) => (
                   <button 
                     key={item.id}
                     onClick={() => {
                        const isFunctional = item.id === 'loans' || item.id === 'cashbook' || item.id === 'bills' || item.id === 'collection';
                        if (isFunctional) {
                          item.action();
                        } else {
                         alert(`${item.label} feature is coming soon!`);
                       }
                     }}
                     className="bg-gray-50/50 rounded-[10px] p-4 flex flex-col items-center justify-center gap-3 border border-black/5 active:scale-95 transition-all aspect-square group hover:bg-white hover:shadow-xl hover:shadow-black/[0.02]"
                   >
                      <div className={cn("p-3 rounded-[10px] transition-transform group-hover:scale-110", item.color)}>
                         <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black  text-black/80 tracking-tight leading-none group-hover:text-black transition-colors">{item.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* Settings Trigger Section */}
           <div className="mb-12">
              <div className="flex items-center justify-between mb-8 px-2">
                 <h2 className="text-[10px] font-black  tracking-tight text-black/60 italic">{t('SYSTEM_SETTINGS')}</h2>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full bg-gray-50/50 p-6 rounded-[10px] border border-black/5 flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5"
              >
                 <div className="flex items-center gap-6">
                    <div className="w-11 h-11 bg-black text-white rounded-[10px] flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform">
                       <Settings className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                       <p className="font-black text-[12px]  tracking-tight leading-none mb-1">System Settings</p>
                       <p className="text-[9px] font-black text-black/30  tracking-tight italic">Administrative Hub</p>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-[10px] bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ChevronLeft className="w-4 h-4 rotate-180 group-hover:opacity-0 transition-opacity" />
                 </div>
              </button>
           </div>

            {/* About Section Trigger */}
            <div className="mb-12">
               <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-[10px] font-black  tracking-tight text-black/60 italic">{t('ABOUT_PLATFORM')}</h2>
               </div>
               <button 
                 onClick={() => setIsAboutOpen(true)}
                 className="w-full bg-gray-50/50 p-6 rounded-[10px] border border-black/5 flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5"
               >
                  <div className="flex items-center gap-6">
                     <div className="w-11 h-11 bg-black text-white rounded-[10px] flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform">
                        <Info className="w-5 h-5" />
                     </div>
                     <div className="text-left">
                        <p className="font-black text-[12px]  tracking-tight leading-none mb-1">About Platform</p>
                        <p className="text-[9px] font-black text-black/30  tracking-tight italic">Mastered for Excellence</p>
                     </div>
                  </div>
                  <div className="w-8 h-8 rounded-[10px] bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                     <ChevronLeft className="w-4 h-4 rotate-180 group-hover:opacity-100 transition-opacity" />
                  </div>
               </button>
            </div>
           
           <div className="py-8 text-center">
              <p className="text-[9px] font-black text-black/40  tracking-tight italic mb-2">
                 MVEE v1.0.4 - INDUSTRIAL SERIES
              </p>
              <p className="text-[8px] font-bold text-black/30  tracking-tight">Crafted with absolute professional focus</p>
           </div>
        </div>
        <AnimatePresence>
           {isSettingsOpen && (
             <SettingsHub isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
           )}
           {isAboutOpen && (
             <AboutHub isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
           )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
