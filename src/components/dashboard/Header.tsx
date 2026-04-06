'use client';

import React from 'react';
import { User } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ProfileModal } from './ProfileModal';

export const Header = ({ 
  onAddClick, 
  onOpenCashbook, 
  onOpenBills 
}: { 
  onAddClick: () => void; 
  onOpenCashbook: () => void; 
  onOpenBills: () => void;
}) => {
  const { state } = useFinance();
  const { t } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const userName = state.userProfile?.name || '';
  const profileImage = state.userProfile?.image;

  return (
    <header className="z-40 bg-black py-4 lg:py-5 w-full shadow-lg shadow-black/5">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-xl rounded-none flex items-center justify-center border border-white/10 shadow-lg overflow-hidden">
             <img src="/cash-flow-logo.png" alt="MVEE" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none mb-1 text-white  italic">
              {userName ? `${t('HI')}, ${userName}` : 'CashFlow'}
            </h1>
            <p className="text-[8px] text-white/50  font-extrabold tracking-tight">{t('LEDGER')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2.5 rounded-none bg-[#D4FF4D] text-black hover:bg-[#C2EB3D] transition-all shadow-xl shadow-[#D4FF4D]/20 flex items-center gap-2 px-4 group"
            aria-label="Open profile"
          >
            <div className="w-5 h-5 rounded-none overflow-hidden bg-black/10 flex items-center justify-center">
               {profileImage ? (
                  <img src={profileImage} alt="P" className="w-full h-full object-cover" />
               ) : (
                  <User className="w-3 h-3 text-black group-hover:scale-110 transition-transform" />
               )}
            </div>
            <span className="text-[10px] font-black  tracking-tight hidden sm:block">{t('ACCOUNT')}</span>
          </button>
        </div>
      </div>
      {isProfileOpen && (
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      )}
    </header>
  );
};
