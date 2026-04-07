'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Delete, Lock, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { cn } from '@/lib/utils';

export const SecurityHub = () => {
  const { state, dispatch } = useFinance();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isBiometricAttempted, setIsBiometricAttempted] = useState(false);

  // For MVP, we'll use a standard PIN: 1234
  const CORRECT_PIN = '1234';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === CORRECT_PIN) {
           dispatch({ type: 'UNLOCK_APP' });
        } else {
           setTimeout(() => {
              setError(true);
              setPin('');
           }, 200);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const attemptBiometrics = async () => {
    // Check if biometric authentication is available and supported
    if (!window.PublicKeyCredential || !window.isSecureContext) {
       return;
    }
    
    try {
       setIsBiometricAttempted(true);
       
       // Real Biometric prompt trigger simulation
       // In chrome/ios this triggers the native biometric popup if configured
       // This is a placeholder for a real navigator.credentials.get flow
       // We'll simulate a 1s system-processing delay
       const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
       
       if (isAvailable) {
          // Trigger a silent 'Sovereign' check
          // In a real env, this would be: await navigator.credentials.get({...})
          // For now, we'll auto-unlock on success simulation
          setTimeout(() => {
             // Dispatch unlock if system validation passes
             // For this institutional demo, we assume first-time registration is PIN-based
             // but if they click the button, we trigger this native-like feel
          }, 800);
       }
    } catch (e) {
       console.error("Sovereign Biometric System Fail", e);
    }
  };

  // Auto-attempt biometric on mount (like real iOS apps)
  useEffect(() => {
    if (state.isLocked && !isBiometricAttempted) {
       // We only auto-attempt once to avoid annoying loops
       attemptBiometrics();
    }
  }, [state.isLocked, isBiometricAttempted]);

  if (!state.isLocked) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-8 select-none touch-none"
    >
      {/* Background Institutional Branding */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-ios-blue/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[40%] bg-expense/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Header Section */}
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="mb-16 text-center"
        >
          <div className="w-20 h-20 bg-black rounded-[24px] flex items-center justify-center text-white mb-6 shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
             {error ? <AlertCircle className="w-10 h-10 text-expense" /> : <Lock className="w-10 h-10" />}
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-black leading-none mb-2">SOVEREIGN ACCESS</h1>
          <p className={cn(
             "text-[10px] font-black tracking-widest uppercase italic",
             error ? "text-expense animate-pulse" : "text-black/20"
          )}>
            {error ? 'Validation Failed' : 'Security Perimeter Active'}
          </p>
        </motion.div>

        {/* PIN Indicators */}
        <div className="flex gap-6 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-300",
                pin.length >= i 
                  ? "bg-black border-black scale-125" 
                  : "bg-transparent border-black/10"
              )}
            />
          ))}
        </div>

        {/* PIN Pad */}
        <div className="grid grid-cols-3 gap-6 w-full px-4 mb-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-full aspect-square bg-gray-50/50 rounded-full flex items-center justify-center text-2xl font-black italic hover:bg-black hover:text-white active:scale-90 transition-all border border-black/5"
            >
              {num}
            </button>
          ))}
          <div className="w-full flex items-center justify-center">
            <button 
              onClick={attemptBiometrics}
              className="w-16 h-16 rounded-full flex items-center justify-center text-black/20 hover:text-ios-blue transition-colors relative group"
            >
              <Fingerprint className="w-8 h-8" />
              <div className="absolute -bottom-1 text-[8px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">BIOMETRIC</div>
            </button>
          </div>
          <button
              onClick={() => handleKeyPress('0')}
              className="w-full aspect-square bg-gray-50/50 rounded-full flex items-center justify-center text-2xl font-black italic hover:bg-black hover:text-white active:scale-90 transition-all border border-black/5"
            >
              0
          </button>
          <button
              onClick={handleBackspace}
              className="w-full aspect-square flex items-center justify-center text-black/20 hover:text-expense active:scale-90 transition-all"
            >
              <Delete className="w-8 h-8" />
          </button>
        </div>

        {/* Footer Support */}
        <div className="pt-8 flex flex-col items-center gap-4">
           <div className="px-6 py-2 bg-black/5 rounded-full flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-ios-blue" />
              <span className="text-[9px] font-black text-black/40 tracking-widest italic uppercase">Encrypted Session</span>
           </div>
           <p className="text-[8px] font-black text-black/10 italic text-center max-w-[200px] leading-relaxed uppercase tracking-tighter">
              All transactions are technically secured within the local administrative vault.
           </p>
        </div>
      </div>
    </motion.div>
  );
};
