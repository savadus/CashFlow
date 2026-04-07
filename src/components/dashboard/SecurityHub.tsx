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
    if (!window.PublicKeyCredential || !window.isSecureContext) {
       return;
    }
    
    try {
       setIsBiometricAttempted(true);
       
       // Sovereign System Trigger (WebAuthn)
       // This invokes the native FaceID / TouchID / System Password prompt
       const challenge = new Uint8Array(32);
       window.crypto.getRandomValues(challenge);
       
       const options: any = {
          publicKey: {
             challenge: challenge,
             rpId: window.location.hostname,
             userVerification: 'required',
             timeout: 60000,
          }
       };

       // Since we don't have a server to verify, we'll use conditional logic
       // On mobile/mac this will show the native 'Unlock to access' popup
       const credential = await navigator.credentials.get(options);
       
       if (credential) {
          dispatch({ type: 'UNLOCK_APP' });
       }
    } catch (e) {
       console.warn("System Lock Handshake Bypassed or Cancelled", e);
       // If cancelled, we wait for user to click button again or use PIN
    }
  };

  // Immediate Sovereign Invocation
  useEffect(() => {
    if (state.isLocked && !isBiometricAttempted) {
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
      {/* Absolute Professional Minimalist Perimeter */}
      <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-ios-blue/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Sovereign Header */}
        <div className="mb-20 text-center">
          <div className="w-24 h-24 bg-black rounded-[28px] flex items-center justify-center text-white mb-8 shadow-2xl relative overflow-hidden">
             <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-black leading-none mb-3 uppercase">Vault Locked</h1>
          <p className="text-[10px] font-black tracking-[0.2em] text-black/20 uppercase italic">
            Institutional Access Required
          </p>
        </div>

        {/* Primary Action Zone */}
        <div className="w-full flex flex-col gap-4">
           <button 
             onClick={attemptBiometrics}
             className="w-full h-18 py-6 bg-black text-white rounded-[10px] flex items-center justify-center gap-4 group hover:scale-[1.02] transition-all shadow-2xl shadow-black/20"
           >
              <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                  <div className="text-[12px] font-black tracking-tight leading-none uppercase italic">Unlock with System</div>
                  <div className="text-[8px] font-bold text-white/40 tracking-widest uppercase">Touch ID / Face ID / Passcode</div>
              </div>
           </button>

           <div className="flex items-center gap-6 my-4 px-6">
              <div className="h-[1px] flex-1 bg-black/5" />
              <div className="text-[8px] font-black tracking-widest text-black/10 uppercase">Security Fallback</div>
              <div className="h-[1px] flex-1 bg-black/5" />
           </div>

           <button 
             onClick={() => setError(!error)} // Toggle PIN visibility in this minimal UI
             className="w-full py-4 text-[10px] font-black tracking-widest text-black/30 hover:text-black transition-colors uppercase italic"
           >
              Use Backup PIN Code
           </button>
        </div>

        {/* Dynamic Fallback: Only shown if requested via 'Use Backup' */}
        {error && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full mt-8 p-6 bg-black/5 rounded-[20px] backdrop-blur-xl border border-black/5"
            >
                <div className="flex justify-center gap-4 mb-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn("w-3 h-3 rounded-full border-2 transition-all", pin.length >= i ? "bg-black border-black" : "border-black/10")} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'DEL', 0].map((num) => (
                    <button
                      key={String(num)}
                      onClick={() => num === 'DEL' ? handleBackspace() : handleKeyPress(num.toString())}
                      className={cn(
                         "h-12 rounded-xl flex items-center justify-center text-lg font-black italic transition-all active:scale-95",
                         num === 'DEL' ? "text-black/20 hover:text-expense" : "bg-white text-black shadow-sm border border-black/5"
                      )}
                    >
                      {num === 'DEL' ? <Delete className="w-5 h-5" /> : num}
                    </button>
                  ))}
                </div>
            </motion.div>
        )}

        {/* Support Section */}
        <div className="mt-20 flex flex-col items-center gap-2 opacity-20">
           <ShieldCheck className="w-4 h-4 text-ios-blue" />
           <p className="text-[8px] font-black tracking-[0.3em] uppercase italic">System Authenticated Session</p>
        </div>
      </div>
    </motion.div>
  );
};
