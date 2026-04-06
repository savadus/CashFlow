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
    dispatch({ type: 'SET_PROFILE', payload: profile });
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="fixed inset-0 bg-[#f8f9ff] z-[100] flex items-center justify-center p-6 sm:p-12 font-sans overflow-hidden">
       {/* Background decorative elements */}
       <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ios-blue/5 blur-[120px] rounded-full" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />

       <div className="w-full max-w-lg relative">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-12 justify-center">
             {[0, 1, 2, 3].map(s => (
               <div 
                 key={s}
                 className={`h-1 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-black' : 'w-2 bg-black/10'}`}
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
                      <img src="/cash-flow-logo.png" className="w-20 h-20 mb-4" alt="Logo" />
                      <h1 className="text-3xl font-black italic tracking-tighter text-black uppercase">Institutional Access</h1>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Secure Cloud Handshake</p>
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
                                className="w-full bg-white border-2 border-black/5 rounded-[28px] p-6 pl-16 font-black tracking-[0.3em] uppercase text-sm outline-none focus:border-ios-blue"
                              />
                           </div>
                           <button 
                             onClick={handleVerifyOTP}
                             disabled={loading}
                             className="w-full bg-black text-white p-6 rounded-[28px] font-black uppercase text-xs tracking-widest italic flex items-center justify-center gap-3 shadow-2xl"
                           >
                              {loading ? 'VERIFYING...' : 'VERIFY & CONNECT'}
                              <ShieldCheck className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => setIsOtpSent(false)}
                             className="text-[10px] font-black text-black/30 uppercase tracking-widest"
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
                                placeholder="GMAIL ADDRESS"
                                className="w-full bg-white border-2 border-black/5 rounded-[28px] p-6 pl-16 font-black tracking-[0.1em] text-sm outline-none focus:border-ios-blue"
                              />
                           </div>
                           <button 
                             onClick={handleSendOTP}
                             disabled={loading || !email}
                             className="w-full bg-black text-white p-6 rounded-[28px] font-black uppercase text-xs tracking-widest italic flex items-center justify-center gap-3 disabled:opacity-20 shadow-2xl"
                           >
                              {loading ? 'SENDING...' : 'SEND SECURE OTP'}
                              <ArrowRight className="w-4 h-4" />
                           </button>
                           <div className="flex items-center gap-3 justify-center pt-2">
                              <div className="h-[1px] flex-1 bg-black/5" />
                              <span className="text-[9px] font-black text-black/20 uppercase tracking-widest">OR CONTINUE AS</span>
                              <div className="h-[1px] flex-1 bg-black/5" />
                           </div>
                           <button 
                             onClick={() => setStep(1)}
                             className="w-full bg-white border border-black/10 text-black/40 p-6 rounded-[28px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-black/5 transition-all shadow-sm"
                           >
                              <User className="w-4 h-4" /> GUEST Hub (No Sync)
                           </button>
                        </div>
                      )}
                      
                      {error && (
                        <p className="text-[10px] font-bold text-expense uppercase tracking-widest animate-shake">{error}</p>
                      )}
                   </div>
                   <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.3em] leading-relaxed max-w-[280px] mx-auto">
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
                      className="w-24 h-24 object-contain mb-4 drop-shadow-2xl"
                    />
                    <h1 className="text-4xl font-black italic tracking-tighter text-black mb-2 uppercase">CashFlow</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">Select your language</p>
                  </div>

                  <div className="grid gap-4">
                     {LANGUAGES.map(lang => (
                       <button
                         key={lang.id}
                         onClick={() => {
                           setProfile(p => ({ ...p, language: lang.id }));
                           setStep(2);
                         }}
                         className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group active:scale-95 ${profile.language === lang.id ? 'border-black bg-black text-white shadow-2xl' : 'border-black/5 bg-white text-black hover:border-black/20'}`}
                       >
                          <div className="text-left">
                             <p className="text-[11px] font-black tracking-widest leading-none mb-1">{lang.name}</p>
                             <p className={`text-[10px] uppercase font-bold opacity-40 group-hover:opacity-60 ${profile.language === lang.id ? 'text-white/60' : ''}`}>{lang.native}</p>
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
                    <h1 className="text-4xl font-black italic tracking-tighter text-black mb-4 uppercase">{profile.language === 'ml' ? 'ആരാണ് നിങ്ങൾ?' : profile.language === 'hi' ? 'आप कौन हैं?' : 'WHO ARE YOU?'}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">{profile.language === 'ml' ? 'തുടരുന്നതിന് പേര് നൽകുക' : profile.language === 'hi' ? 'जारी रखने के लिए अपना नाम टाइप करें' : 'Type your name to continue'}</p>
                  </div>

                  <div className="relative group">
                     <div className="absolute left-8 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black group-focus-within:scale-110 transition-all">
                        <User className="w-5 h-5" />
                     </div>
                     <input 
                       type="text" 
                       value={profile.name}
                       onChange={(e) => setProfile(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                       placeholder={profile.language === 'ml' ? 'പേര് നൽകുക...' : profile.language === 'hi' ? 'नाम दर्ज करें...' : 'ENTER NAME...'}
                       className="w-full bg-white border-2 border-black/5 focus:border-black rounded-[36px] p-8 pl-16 font-black uppercase text-sm tracking-[0.2em] outline-none transition-all shadow-sm placeholder:text-black/5"
                       autoFocus
                       onKeyDown={(e) => e.key === 'Enter' && profile.name && setStep(3)}
                     />
                  </div>

                  <button 
                    disabled={!profile.name}
                    onClick={() => setStep(3)}
                    className="w-full bg-black text-white p-8 rounded-[36px] font-black text-xs uppercase tracking-[0.3em] italic flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all disabled:opacity-20 disabled:scale-100"
                  >
                     <span>{profile.language === 'ml' ? 'അടുത്ത ഘട്ടം' : profile.language === 'hi' ? 'अगला कदम' : 'NEXT STEP'}</span>
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
                    <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-black mb-4 leading-tight uppercase">{profile.language === 'ml' ? 'ഉദ്ദേശ്യം തിരഞ്ഞെടുക്കുക' : profile.language === 'hi' ? 'अपना उद्देश्य चुनें' : 'CHOOSE YOUR PURPOSE'}</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">{profile.language === 'ml' ? 'നിങ്ങളുടെ അനുഭവം മികച്ചതാക്കുന്നു' : profile.language === 'hi' ? 'आपके अनुभव को अनुकूलित करना' : 'Tailoring your experience'}</p>
                  </div>

                  <div className="grid gap-4">
                     {PURPOSES.map(p => (
                       <button
                         key={p.id}
                         onClick={() => setProfile(prev => ({ ...prev, purpose: p.id as any }))}
                         className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group active:scale-95 ${profile.purpose === p.id ? 'border-black bg-black text-white shadow-2xl' : 'border-black/5 bg-white text-black hover:border-black/20'}`}
                       >
                          <div className="flex items-center gap-6">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${profile.purpose === p.id ? 'bg-white/10' : 'bg-black/5 group-hover:bg-black group-hover:text-white'}`}>
                                {p.icon}
                             </div>
                             <p className="text-[11px] font-black tracking-widest">{p.name}</p>
                          </div>
                          {profile.purpose === p.id && <Check className="w-5 h-5 shadow-ios" />}
                       </button>
                     ))}
                  </div>

                  <button 
                    onClick={() => {
                       if (profile.name) {
                          handleComplete();
                       }
                    }}
                    className="w-full bg-ios-blue text-white h-16 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] italic flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all mt-6 shadow-ios-blue/20"
                  >
                     <span>{profile.language === 'ml' ? 'തുടങ്ങുക' : profile.language === 'hi' ? 'प्रवेश करें' : 'ENTER CASHFLOW'}</span>
                     <Check className="w-4 h-4 ml-2" />
                  </button>
               </motion.div>
             )}
          </AnimatePresence>

          {/* Simple footer for trust */}
          <div className="absolute bottom-[-100px] left-0 right-0 text-center space-y-2 opacity-60">
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-black/60">Secure & Confidential</p>
             <p className="text-[8px] font-bold text-black/50 uppercase tracking-[0.2em]">Crafted for Absolute Professionalism</p>
          </div>
       </div>
    </div>
  );
}
