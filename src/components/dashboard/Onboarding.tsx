'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { Globe, User, Briefcase, ArrowRight, Check, Mail, Lock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { translations, TranslationKey, Language } from '@/lib/translations';

const LANGUAGES = [
  { id: 'en', name: 'ENGLISH', native: 'English' },
  { id: 'ml', name: 'MALAYALAM', native: 'മലയാളം' },
  { id: 'hi', name: 'HINDI', native: 'हिन्दी' },
];

export default function Onboarding() {
  const { state, dispatch } = useFinance();
  const [step, setStep] = useState(0); // Step 0: Auth Gateway
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({
    name: '',
    language: 'en',
    purpose: 'personal' as const,
    banks: [
      { id: 'BANK_1712345678901', name: 'SBI' },
      { id: 'BANK_1712345678902', name: 'BARODA' },
      { id: 'BANK_1712345678903', name: 'SIB' }
    ]
  });

  useEffect(() => {
    if (state.user && step === 0) {
      setStep(1); // Move to Language after Auth
    }
  }, [state.user, step]);

  const t = (key: TranslationKey): string => {
    return translations[profile.language as Language][key] || translations.en[key];
  };

  const PURPOSES = [
    { id: 'personal', name: t('PERSONAL'), icon: <User className="w-4 h-4" /> },
    { id: 'business', name: t('BUSINESS'), icon: <Briefcase className="w-4 h-4" /> },
    { id: 'student', name: t('STUDENT'), icon: <Globe className="w-4 h-4" /> },
  ];

  const handleSendOTP = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    setLoading(false);
    if (error) setError(error.message);
    else setIsOtpSent(true);
  };

  const handleVerifyOTP = async () => {
    if (!otp) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.verifyOtp({
       email,
       token: otp,
       type: 'email'
    });
    setLoading(false);
    if (error) setError(error.message);
    else setStep(1);
  };

  const handleComplete = () => {
    if (!profile.name) return;
    
    // If already loading, this is a retry-click. Force dispatch immediately.
    if (loading) {
       dispatch({ type: 'SET_PROFILE', payload: profile });
       return;
    }

    try {
      setLoading(true);
      console.log('TRANSITION_INIT: High-Velocity Handshake...');
      
      // Buffered dispatch to avoid React state competition/batching
      setTimeout(() => {
         dispatch({ type: 'SET_PROFILE', payload: profile });
         console.log('TRANSITION_DATA_COMMITTED');
      }, 100);

      // Safety release: If component doesn't unmount, allow retry after delay
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    } catch (err) {
      console.error('TRANSITION_FAILED:', err);
      setLoading(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
     <div 
        className="fixed inset-0 bg-[#f8f9ff] z-[100] flex items-center justify-center p-6 sm:p-12 font-sans overflow-hidden"
        onKeyDown={(e) => {
           if (e.key === 'Enter') {
              if (step === 2 && profile.name) setStep(3);
              if (step === 3) handleComplete();
           }
        }}
     >
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ios-blue/5 blur-[120px] rounded-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-none" />
 
        <div className="w-full max-w-lg relative">
           {/* Progress Indicator */}
           <div className="flex gap-2 mb-12 justify-center">
              {[0, 1, 2, 3].map(s => (
                <div 
                  key={s}
                  className={`h-1 rounded-none transition-all duration-500 ${step >= s ? 'w-8 bg-black' : 'w-2 bg-black/10'}`}
                />
              ))}
           </div>

          <AnimatePresence mode="wait">
             {step === 0 && (
                <motion.div 
                  key="auth"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-8 text-center"
                >
                   <div className="flex flex-col items-center">
                      <img src="/cash-flow-logo.png" className="w-16 h-16 mb-4" alt="Logo" />
                      <h1 className="text-xl font-bold text-black  tracking-tight">Institutional Access</h1>
                      <p className="text-[9px] font-bold  tracking-tight text-black/30">Secure Cloud Handshake</p>
                   </div>

                   <div className="space-y-4">
                      {isOtpSent ? (
                        <div className="space-y-4">
                           <div className="relative group">
                              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                              <input 
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="ENTER 6-DIGIT OTP"
                                className="w-full bg-white border-2 border-black/5 rounded-none p-6 pl-16 font-black tracking-tight  text-sm outline-none focus:border-ios-blue"
                              />
                           </div>
                           <button 
                             onClick={handleVerifyOTP}
                             disabled={loading}
                             className="w-full bg-black text-white p-5 rounded-none font-bold  text-[10px] tracking-tight flex items-center justify-center gap-3 shadow-xl"
                           >
                              {loading ? 'VERIFYING...' : 'VERIFY & CONNECT'}
                              <ShieldCheck className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => setIsOtpSent(false)}
                             className="text-[9px] font-bold text-black/30  tracking-tight"
                           >
                              Change Email
                           </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           <div className="relative group">
                              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
                              <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Gmail address"
                                className="w-full bg-white border-2 border-black/5 rounded-none p-6 pl-16 font-bold tracking-tight text-sm outline-none focus:border-ios-blue"
                              />
                           </div>
                           <button 
                             onClick={handleSendOTP}
                             disabled={loading || !email}
                             className="w-full bg-black text-white p-5 rounded-none font-bold text-[10px] tracking-tight flex items-center justify-center gap-3 disabled:opacity-20 shadow-xl"
                           >
                              {loading ? 'Sending...' : 'Send secure OTP'}
                              <ArrowRight className="w-4 h-4" />
                           </button>
                           <div className="flex items-center gap-3 justify-center pt-2">
                              <div className="h-[1px] flex-1 bg-black/5" />
                              <span className="text-[8px] font-bold text-black/20 tracking-tight">OR CONTINUE AS</span>
                              <div className="h-[1px] flex-1 bg-black/5" />
                           </div>
                           <button 
                             onClick={() => setStep(1)}
                             className="w-full bg-white border border-black/10 text-black/40 p-5 rounded-none font-bold text-[9px] tracking-tight flex items-center justify-center gap-2 hover:bg-black/5 transition-all shadow-sm"
                           >
                              <User className="w-4 h-4" /> Guest Hub (No Sync)
                           </button>
                        </div>
                      )}
                      
                      {error && (
                        <p className="text-[10px] font-bold text-expense tracking-tight animate-shake">{error}</p>
                      )}
                   </div>
                   <p className="text-[9px] font-bold text-black/20 tracking-tight leading-relaxed max-w-[280px] mx-auto">
                      Multi-device sync requires an institutional cloud handshake.
                   </p>
                </motion.div>
             )}

             {step === 1 && (
               <motion.div 
                 key="step1"
                 variants={containerVariants}
                 initial="initial"
                 animate="animate"
                 exit="exit"
                 className="space-y-8 text-center"
               >
                  <div className="flex flex-col items-center">
                    <img 
                      src="/cash-flow-logo.png" 
                      alt="CashFlow Logo" 
                      className="w-16 h-16 object-contain mb-4 drop-shadow-xl"
                    />
                    <h1 className="text-2xl font-bold tracking-tight text-black mb-2">CashFlow</h1>
                    <p className="text-[9px] font-bold tracking-tight text-black/30">Select your language</p>
                  </div>

                  <div className="grid gap-4">
                     {LANGUAGES.map(lang => (
                       <button
                         key={lang.id}
                         onClick={() => {
                           setProfile(p => ({ ...p, language: lang.id }));
                           setStep(2);
                         }}
                         className={`p-4 rounded-none border-2 transition-all flex items-center justify-between group active:scale-95 ${profile.language === lang.id ? 'border-black bg-black text-white shadow-2xl' : 'border-black/5 bg-white text-black hover:border-black/20'}`}
                       >
                          <div className="text-left">
                             <p className="text-[11px] font-bold tracking-tight leading-none mb-1">{lang.name}</p>
                             <p className={`text-[10px] font-bold opacity-40 group-hover:opacity-60 ${profile.language === lang.id ? 'text-white/60' : ''}`}>{lang.native}</p>
                          </div>
                          {profile.language === lang.id && <Check className="w-5 h-5" />}
                       </button>
                     ))}
                  </div>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div 
                 key="step2"
                 variants={containerVariants}
                 initial="initial"
                 animate="animate"
                 exit="exit"
                 className="space-y-8 text-center"
               >
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-black mb-4">{profile.language === 'ml' ? 'ആരാണ് നിങ്ങൾ?' : profile.language === 'hi' ? 'आप कौन हैं?' : 'Who are you?'}</h1>
                    <p className="text-[9px] font-bold tracking-tight text-black/20">{profile.language === 'ml' ? 'തുടരുന്നതിന് പേര് നൽകുക' : profile.language === 'hi' ? 'जारी रखने के लिए अपना नाम टाइप करें' : 'Type your name to continue'}</p>
                  </div>

                  <div className="relative group">
                     <div className="absolute left-8 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black group-focus-within:scale-110 transition-all pointer-events-none">
                        <User className="w-5 h-5" />
                     </div>
                     <input 
                       type="text" 
                       value={profile.name}
                       onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                       placeholder={profile.language === 'ml' ? 'പേര് നൽകുക...' : profile.language === 'hi' ? 'नाम दर्ज करें...' : 'Enter name...'}
                       className="w-full bg-white border border-black/10 focus:border-black rounded-none p-5 pl-14 font-bold text-base text-black tracking-normal outline-none transition-all shadow-sm placeholder:text-black/20"
                       autoFocus
                       spellCheck={false}
                       onKeyDown={(e) => e.key === 'Enter' && profile.name && setStep(3)}
                     />
                  </div>

                  <button 
                    disabled={!profile.name}
                    onClick={() => setStep(3)}
                    className="w-full bg-black text-white p-5 rounded-none font-bold text-[10px] tracking-tight flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:opacity-20"
                  >
                     <span>{profile.language === 'ml' ? 'അടുത്ത ഘട്ടം' : profile.language === 'hi' ? 'अगला कदम' : 'Next step'}</span>
                     <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
               </motion.div>
             )}

             {step === 3 && (
               <motion.div 
                 key="step3"
                 variants={containerVariants}
                 initial="initial"
                 animate="animate"
                 exit="exit"
                 className="space-y-8 text-center"
               >
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black mb-4 leading-tight">{profile.language === 'ml' ? 'ഉദ്ദേശ്യം തിരഞ്ഞെടുക്കുക' : profile.language === 'hi' ? 'अपना उद्देश्य चुनें' : 'Choose your purpose'}</h1>
                    <p className="text-[9px] font-bold tracking-tight text-black/20">{profile.language === 'ml' ? 'നിങ്ങളുടെ അനുഭവം മികച്ചതാക്കുന്നു' : profile.language === 'hi' ? 'आपके अनुभव को अनुकूलित करना' : 'Tailoring your experience'}</p>
                  </div>

                  <div className="grid gap-4">
                     {PURPOSES.map(p => (
                       <button
                         key={p.id}
                         onClick={() => setProfile(prev => ({ ...prev, purpose: p.id as any }))}
                         className={`p-4 rounded-none border-2 transition-all flex items-center justify-between group active:scale-95 ${profile.purpose === p.id ? 'border-black bg-black text-white shadow-2xl' : 'border-black/5 bg-white text-black hover:border-black/20'}`}
                       >
                          <div className="flex items-center gap-6">
                             <div className={`w-10 h-10 rounded-none flex items-center justify-center transition-all ${profile.purpose === p.id ? 'bg-white/10' : 'bg-black/5 group-hover:bg-black group-hover:text-white'}`}>
                                {p.icon}
                             </div>
                             <p className="text-[8px] text-white/50 font-bold tracking-tight">{t('LEDGER')}</p>
                          </div>
                          {profile.purpose === p.id && <Check className="w-5 h-5 shadow-ios" />}
                       </button>
                     ))}
                  </div>

                   <button 
                     disabled={!profile.name || loading}
                     onClick={handleComplete}
                     className="w-full bg-ios-blue text-white h-14 rounded-none font-bold text-[10px]  tracking-tight flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all mt-6 shadow-ios-blue/10 disabled:opacity-20"
                   >
                      <span>{loading ? (profile.language === 'ml' ? 'സമന്വയിപ്പിക്കുന്നു...' : profile.language === 'hi' ? 'सिंक हो रहा है...' : 'CONNECTING...') : (profile.language === 'ml' ? 'തുടങ്ങുക' : profile.language === 'hi' ? 'प्रवेश करें' : 'ENTER CASHFLOW')}</span>
                      {loading ? (
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none animate-spin" />
                      ) : (
                         <Check className="w-4 h-4 ml-2" />
                      )}
                   </button>
               </motion.div>
             )}
          </AnimatePresence>

          {/* Simple footer for trust */}
          <div className="absolute bottom-[-100px] left-0 right-0 text-center space-y-2 opacity-60">
             <p className="text-[8px] font-black  tracking-tight text-black/60">Secure & Confidential</p>
             <p className="text-[8px] font-bold text-black/50  tracking-tight">Crafted for Absolute Professionalism</p>
          </div>
       </div>
    </div>
  );
}
