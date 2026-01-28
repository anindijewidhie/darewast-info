
import React, { useState } from 'react';
import { COLORS, DONATION_AMOUNTS, DONATION_ALLOCATION, TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface DonationProps {
  lang: Language;
  isAccessible?: boolean;
}

const Donation: React.FC<DonationProps> = ({ lang, isAccessible }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(10);
  const [step, setStep] = useState<'select' | 'payment'>('select');
  const [isSuccess, setIsSuccess] = useState(false);

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

  const currentAmount = selectedAmount === 'custom' ? 0 : selectedAmount;

  const handleConfirm = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setStep('select');
    }, 5000);
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 shadow-2xl border-4 border-accent/20">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8 relative">
           <span className="text-5xl animate-bounce">❤️</span>
           <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white lowercase mb-4">{t('thankYouDonation')}</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold lowercase max-w-md mx-auto">your contribution has been successfully processed and allocated to the community fund.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20`}>
      <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8`}>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
          <div className={`rounded-3xl flex items-center justify-center p-4`} style={{ backgroundColor: `${COLORS.accent}20` }}>
            <svg className="w-10 h-10" style={{ color: COLORS.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="text-center md:text-left">
            <h2 className={`font-black lowercase text-3xl text-slate-900 dark:text-white`}>{t('donationTitle')}</h2>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">{t('donationDescription')}</p>
          </div>
        </div>

        {step === 'select' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-3">
                {DONATION_AMOUNTS.map(amt => (
                  <button key={amt} onClick={() => setSelectedAmount(amt)} className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${selectedAmount === amt ? 'border-accent bg-accent text-white shadow-lg' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600 hover:border-accent/40'}`}>${amt}</button>
                ))}
              </div>
              <button onClick={() => setStep('payment')} className="w-full py-6 bg-accent text-white font-black rounded-3xl shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all text-xl lowercase">{t('contributeNow')} (${currentAmount})</button>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
               <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-6">{t('howSplit')}</h3>
               <div className="flex h-12 w-full rounded-xl overflow-hidden mb-6">
                 {DONATION_ALLOCATION.map((item, i) => <div key={i} style={{ width: `${item.percent}%`, backgroundColor: item.color }} className="h-full"></div>)}
               </div>
               <div className="space-y-2">
                 {DONATION_ALLOCATION.map((item, i) => (
                   <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                      </div>
                      <span className="text-slate-400 dark:text-slate-600">{item.percent}%</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6 text-center">
             <p className="text-6xl font-black text-accent">${currentAmount}</p>
             <button onClick={handleConfirm} className="w-full py-6 bg-accent text-white font-black rounded-3xl shadow-2xl active:scale-95 transition-all text-xl lowercase">confirm support</button>
             <button onClick={() => setStep('select')} className="text-xs font-black text-slate-400 dark:text-slate-600 hover:text-accent transition-colors">back to selection</button>
          </div>
        )}
      </div>

      <div className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center"><span className="text-3xl">🛡️</span></div>
            <div>
               <h3 className="text-2xl font-black lowercase text-white">{t('safetyHubTitle')}</h3>
               <p className="text-[10px] font-black opacity-40 uppercase tracking-widest text-white">Pedagogical Ethics Compliance</p>
            </div>
         </div>
         <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🚫', title: t('noViolence'), desc: 'Blocking all graphic content.' },
              { icon: '🔞', title: t('noPorn'), desc: 'Adult-oriented content is banned.' },
              { icon: '🤝', title: t('noDiscrimination'), desc: 'Hate speech is strictly blocked.' },
              { icon: '⚖️', title: t('noPolitics'), desc: 'Limiting biased political narratives.' }
            ].map((p, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                 <span className="text-2xl mb-4 block">{p.icon}</span>
                 <h4 className="font-black text-xs uppercase mb-2 text-white">{p.title}</h4>
                 <p className="text-[10px] opacity-60 lowercase leading-relaxed text-white/70">{p.desc}</p>
              </div>
            ))}
         </div>
         <div className="relative z-10 mt-12 text-center border-t border-white/10 pt-8">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">darewast info human content shield active</p>
         </div>
      </div>
    </div>
  );
};

export default Donation;
