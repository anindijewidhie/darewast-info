
import React, { useState, useMemo } from 'react';
import { COLORS, DONATION_AMOUNTS, DONATION_ALLOCATION, TRANSLATIONS, CURRENCIES, GRADIENTS } from '../constants';
import { Language } from '../types';

interface DonationProps {
  lang: Language;
  isAccessible?: boolean;
}

const Donation: React.FC<DonationProps> = ({ lang, isAccessible }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(10);
  const [customValue, setCustomValue] = useState<string>('');
  const [step, setStep] = useState<'select' | 'payment'>('select');
  const [isSuccess, setIsSuccess] = useState(false);
  const [donationType, setDonationType] = useState<'individual' | 'corporate'>('individual');

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  const currentCurrency = useMemo(() => CURRENCIES[lang] || CURRENCIES['en'], [lang]);

  const currentUsdAmount = useMemo(() => {
    if (donationType === 'corporate') return 1000;
    if (selectedAmount === 'custom') {
      return parseFloat(customValue) || 0;
    }
    return selectedAmount;
  }, [selectedAmount, customValue, donationType]);

  const localAmount = useMemo(() => {
    return (currentUsdAmount * currentCurrency.rate).toLocaleString(undefined, {
      minimumFractionDigits: currentCurrency.rate === 1 ? 2 : 0,
      maximumFractionDigits: 2
    });
  }, [currentUsdAmount, currentCurrency]);

  const handleConfirm = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setStep('select');
      setCustomValue('');
    }, 5000);
  };

  const paymentMethods = [
    { name: 'Bank Jago (Global IBAN)', account: '107863277869', owner: 'A. Widhi', icon: '🏦' },
    { name: 'PayPal (Global)', account: 'https://paypal.me/anindijewidhie', owner: 'A. Widhi', icon: '💳' },
    { name: 'Global E-Wallet (OVO/Dana/GoPay)', account: '+628567239000', owner: 'A. Widhi', icon: '📱' },
  ];

  const corporateTiers = [
    { label: 'Mastery Patron', amount: 1000, desc: 'Funding specific language content nodes.' },
    { label: 'Global Guardian', amount: 5000, desc: 'Enabling infrastructure maintenance for a region.' },
    { label: 'Visionary Director', amount: 10000, desc: 'Driving full cycle development for new subjects.' }
  ];

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-[#0A0F1D] rounded-[4rem] p-24 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700 shadow-4xl border border-slate-100 dark:border-white/5">
        <div className="w-32 h-32 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-10 relative">
           <span className="text-6xl animate-bounce">❤️</span>
           <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-30"></div>
        </div>
        <h2 className="text-5xl font-black text-slate-900 dark:text-white lowercase mb-6 tracking-tighter">{t('thankYouDonation')}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold lowercase max-w-lg mx-auto text-xl leading-relaxed">your contribution of {currentCurrency.symbol}{localAmount} ({currentCurrency.code}) has been successfully allocated to global pedagogical truth nodes.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-16 animate-in fade-in duration-700 pb-20`}>
      <div className="bg-white dark:bg-[#0A0F1D] rounded-[4rem] shadow-2xl border border-slate-100 dark:border-white/5 p-10 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 relative z-10">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-[2.2rem] bg-accent/10 flex items-center justify-center shadow-xl shadow-accent/10">
              <span className="text-4xl">❤️</span>
            </div>
            <div className="text-left space-y-2">
              <h2 className="font-black lowercase text-5xl text-slate-900 dark:text-white tracking-tighter">{t('donationTitle')}</h2>
              <p className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">{t('donationDescription')}</p>
            </div>
          </div>
          <div className="flex bg-slate-100 dark:bg-white/5 p-2 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-inner">
             <button onClick={() => setDonationType('individual')} className={`px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase transition-all ${donationType === 'individual' ? 'bg-white dark:bg-slate-700 shadow-2xl text-accent' : 'text-slate-500'}`}>Individual</button>
             <button onClick={() => setDonationType('corporate')} className={`px-10 py-4 rounded-[1.5rem] text-[11px] font-black uppercase transition-all ${donationType === 'corporate' ? 'bg-white dark:bg-slate-700 shadow-2xl text-secondary' : 'text-slate-500'}`}>Corporate</button>
          </div>
        </div>
        {step === 'select' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
            <div className="lg:col-span-7 space-y-12">
              {donationType === 'individual' ? (
                <div className="space-y-10">
                  <div className="grid grid-cols-4 gap-4">
                    {DONATION_AMOUNTS.map(amt => (
                      <button 
                        key={amt} 
                        onClick={() => setSelectedAmount(amt)} 
                        className={`py-6 rounded-[2rem] font-black text-lg transition-all border-2 ${selectedAmount === amt ? 'border-accent bg-accent text-white shadow-2xl scale-105' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                      >
                        ${amt}
                      </button>
                    ))}
                    <button 
                      onClick={() => setSelectedAmount('custom')} 
                      className={`py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all border-2 ${selectedAmount === 'custom' ? 'border-accent bg-accent text-white shadow-2xl scale-105' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                    >
                      {t('custom')}
                    </button>
                  </div>
                  {selectedAmount === 'custom' && (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                      <div className="relative">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 font-black text-3xl">$</span>
                        <input 
                          type="number" 
                          value={customValue}
                          onChange={(e) => setCustomValue(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-16 pr-10 py-8 bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] outline-none focus:border-accent transition-all font-black text-4xl text-slate-900 dark:text-white shadow-inner"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                   <h3 className="text-[12px] font-black uppercase text-secondary tracking-[0.4em] mb-4 text-center md:text-left">{t('partnershipTiers')}</h3>
                   <div className="grid grid-cols-1 gap-6">
                      {corporateTiers.map((tier, i) => (
                        <button key={i} className={`text-left p-10 bg-slate-50 dark:bg-white/5 border-2 border-transparent hover:border-secondary rounded-[3rem] group transition-all duration-500 hover:shadow-2xl shadow-secondary/10 flex items-center justify-between`}>
                           <div className="space-y-3">
                              <span className="text-2xl font-black text-slate-900 dark:text-white lowercase">{tier.label}</span>
                              <p className="text-sm text-slate-500 lowercase leading-relaxed max-w-xs">{tier.desc}</p>
                           </div>
                           <div className="text-right">
                              <span className="text-4xl font-black text-secondary tracking-tighter">${tier.amount}</span>
                              <p className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest mt-1">Authorized Node</p>
                           </div>
                        </button>
                      ))}
                   </div>
                </div>
              )}
              <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3.5rem] border border-slate-100 dark:border-white/10 shadow-inner space-y-10">
                <h3 className="text-[12px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-[0.4em] text-center">Global Mastery Gateways</h3>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  {paymentMethods.map((method, i) => (
                    <div key={i} className="flex items-center gap-8 p-6 bg-white dark:bg-[#020617] rounded-[2rem] border border-slate-100 dark:border-white/10 hover:border-primary transition-all shadow-sm">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-4xl shadow-inner border border-slate-100 dark:border-white/5">{method.icon}</div>
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{method.name}</span>
                        <span className="text-lg font-black text-slate-900 dark:text-slate-50 lowercase tracking-tight">{method.account}</span>
                        <span className="text-[9px] font-bold text-primary uppercase tracking-[0.3em]">Guardian: {method.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-10">
               <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[4rem] border border-slate-100 dark:border-white/10 shadow-inner flex flex-col justify-center sticky top-32">
                  <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em] mb-12 text-center">{t('howSplit')}</h3>
                  <div className="flex h-20 w-full rounded-[1.5rem] overflow-hidden mb-12 shadow-3xl border-8 border-white dark:border-slate-800">
                    {DONATION_ALLOCATION.map((item, i) => (
                       <div key={i} style={{ width: `${item.percent}%`, backgroundColor: item.color }} className="h-full relative group cursor-help">
                         <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                       </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    {DONATION_ALLOCATION.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white dark:bg-[#020617] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                         <div className="flex items-center gap-4">
                           <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: item.color }}></div>
                           <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">{item.label}</span>
                         </div>
                         <span className="text-lg font-black text-slate-900 dark:text-slate-50">{item.percent}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-12 space-y-6">
                    <button 
                      onClick={() => setStep('payment')} 
                      disabled={currentUsdAmount <= 0}
                      className={`w-full py-8 font-black rounded-[2.5rem] shadow-3xl transition-all text-xl lowercase disabled:opacity-30 ${donationType === 'individual' ? 'bg-accent text-white shadow-accent/20' : 'bg-secondary text-white shadow-secondary/20'}`}
                    >
                      {t('contributeNow')} (${currentUsdAmount.toFixed(0)})
                    </button>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Local Mastery Equivalent</p>
                       <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{currentCurrency.symbol}{localAmount} {currentCurrency.code}</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-16 text-center py-32 animate-in zoom-in-95 duration-700">
             <div className="w-32 h-32 bg-accent/10 rounded-[3rem] flex items-center justify-center mx-auto text-6xl mb-8 shadow-inner transform rotate-12">💳</div>
             <div className="space-y-4">
                <p className={`text-9xl font-black tracking-tighter ${donationType === 'corporate' ? 'text-secondary' : 'text-accent'}`}>${currentUsdAmount.toFixed(0)}</p>
                <p className="text-3xl font-black text-slate-400 dark:text-slate-600 lowercase tracking-tight">≈ {currentCurrency.symbol}{localAmount} {currentCurrency.code}</p>
             </div>
             <div className="max-w-md mx-auto space-y-6">
                <p className="text-slate-500 dark:text-slate-400 font-bold lowercase leading-relaxed text-xl">confirming your {donationType} contribution to the global mastery fund. Truth nodes will update immediately.</p>
             </div>
             <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button onClick={handleConfirm} className={`px-16 py-8 text-white font-black rounded-[2.5rem] shadow-4xl hover:scale-105 active:scale-95 transition-all text-2xl lowercase ${donationType === 'corporate' ? 'bg-secondary' : 'bg-accent'}`}>confirm support mastery</button>
                <button onClick={() => setStep('select')} className="px-10 py-8 text-slate-400 font-black rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 hover:text-accent transition-all lowercase text-xl">back</button>
             </div>
          </div>
        )}
      </div>
      <div className="bg-slate-900 text-white rounded-[4.5rem] p-20 relative overflow-hidden shadow-4xl border-b-[16px] border-primary/20">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="relative z-10 flex items-center gap-10 mb-20">
            <div className="w-24 h-24 bg-accent/20 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-accent/20"><span className="text-6xl">🛡️</span></div>
            <div>
               <h3 className="text-5xl font-black lowercase tracking-tighter text-white">Pedagogical Ethics Compliance</h3>
               <p className="text-[14px] font-black opacity-40 uppercase tracking-[0.5em] text-white mt-2">Global Human Content Shield Active</p>
            </div>
         </div>
         <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: '🚫', title: t('noViolence'), desc: 'Blocking all forms of visual or textual graphic violence.' },
              { icon: '🔞', title: t('noPorn'), desc: 'Adult-oriented content is strictly prohibited.' },
              { icon: '🤝', title: t('noDiscrimination'), desc: 'Hate speech and bias are actively filtered.' },
              { icon: '⚖️', title: t('noPolitics'), desc: 'Maintaining purely objective pedagogical focus.' }
            ].map((p, i) => (
              <div key={i} className="p-10 bg-white/5 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all group shadow-inner">
                 <span className="text-5xl mb-8 block group-hover:scale-110 transition-transform">{p.icon}</span>
                 <h4 className="font-black text-sm uppercase mb-4 text-white tracking-[0.2em]">{p.title}</h4>
                 <p className="text-[13px] opacity-60 lowercase leading-relaxed text-white/70 font-medium">{p.desc}</p>
              </div>
            ))}
         </div>
         <div className="relative z-10 mt-20 text-center border-t border-white/10 pt-12">
            <p className="text-[12px] font-black text-primary uppercase tracking-[0.6em] animate-pulse">Darewast Info Network • Funding the Future of Truth</p>
         </div>
      </div>
    </div>
  );
};

export default Donation;
