
import React, { useState, useMemo } from 'react';
import { COLORS, CONTRIBUTOR_PAGE_RATE, CONTRIBUTOR_MINUTE_RATE, TRANSLATIONS } from '../constants';
import { UserRole, Language, MediaItem } from '../types';

interface WalletProps {
  balance: number;
  role: UserRole;
  darkMode?: boolean;
  isAccessible?: boolean;
  lang: Language;
  contributedMedia?: MediaItem[];
  claimedIds?: Set<string>;
  onClaimReward?: (id: string, amount: number) => void;
  onDonateFromBalance?: (amount: number) => void;
}

const Wallet: React.FC<WalletProps> = ({ 
  balance, role, darkMode, isAccessible, lang, contributedMedia = [], claimedIds = new Set(), onClaimReward, onDonateFromBalance 
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accountType, setAccountType] = useState<'bank' | 'e-wallet'>('bank');

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

  const calculatePayout = (item: MediaItem) => {
    // Documents use per-page rate, Audio/Video use per-minute rate
    if (['ebook', 'magazine', 'tabloid', 'paper'].includes(item.type)) {
      return item.duration * CONTRIBUTOR_PAGE_RATE;
    }
    if (item.type === 'video' || item.type === 'podcast') {
      return item.duration * CONTRIBUTOR_MINUTE_RATE;
    }
    return 0;
  };

  const unclaimedRewards = useMemo(() => {
    return contributedMedia
      .filter(item => !claimedIds.has(item.id))
      .reduce((acc, item) => acc + calculatePayout(item), 0);
  }, [contributedMedia, claimedIds]);

  const handleClaimAll = () => {
    contributedMedia.forEach(item => {
      if (!claimedIds.has(item.id)) {
        onClaimReward?.(item.id, calculatePayout(item));
      }
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      setWithdrawAmount('');
      setTimeout(() => setSuccess(false), 5000);
    }, 2000);
  };

  const handleGiveBack = (amount: number) => {
    if (balance < amount) return;
    if (onDonateFromBalance) {
      onDonateFromBalance(amount);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className={`space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className={`bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 transition-colors ${isAccessible ? 'p-12' : 'p-10'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
          <div className="space-y-6">
            <div>
              <h2 className={`${isAccessible ? 'text-lg' : 'text-[11px]'} font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]`}>{t('earnings')}</h2>
              <p className={`${isAccessible ? 'text-7xl' : 'text-6xl'} font-extrabold text-slate-900 dark:text-slate-50 mt-3 tracking-tighter`}>${balance.toFixed(2)}</p>
            </div>
            {unclaimedRewards > 0 && (
              <div className="flex items-center gap-5 animate-in fade-in slide-in-from-left-2 p-5 bg-secondary/10 rounded-[2rem] border border-secondary/20 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-secondary uppercase tracking-widest">unclaimed</span>
                  <span className="text-3xl font-extrabold text-secondary tracking-tighter">${unclaimedRewards.toFixed(0)}</span>
                </div>
                <button onClick={handleClaimAll} className="px-8 py-3.5 bg-secondary text-white text-[11px] font-extrabold rounded-2xl uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-secondary/30">claim all mastery</button>
              </div>
            )}
          </div>
          <div className={`rounded-[2.5rem] flex items-center justify-center ${isAccessible ? 'p-10' : 'p-8'} bg-secondary/10 shrink-0 shadow-inner`}>
            <svg className={isAccessible ? 'w-16 h-16' : 'w-12 h-12'} style={{ color: COLORS.secondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <div className="space-y-10">
          <div className={`p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-inner`}>
            <label className={`block font-extrabold text-slate-400 dark:text-slate-500 mb-6 uppercase tracking-[0.2em] ${isAccessible ? 'text-base' : 'text-[11px]'}`}>withdrawal gateway:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <button onClick={() => setAccountType('bank')} className={`p-5 border-2 rounded-3xl text-xs font-extrabold transition-all lowercase ${accountType === 'bank' ? 'border-secondary bg-secondary text-white shadow-2xl' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-secondary/40'}`}>bank transfer mastery</button>
              <button onClick={() => setAccountType('e-wallet')} className={`p-5 border-2 rounded-3xl text-xs font-extrabold transition-all lowercase ${accountType === 'e-wallet' ? 'border-secondary bg-secondary text-white shadow-2xl' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-secondary/40'}`}>digital mastery wallets</button>
            </div>
          </div>

          <div className="space-y-4 px-2">
            <label className={`block font-extrabold text-slate-800 dark:text-slate-200 lowercase ${isAccessible ? 'text-2xl' : 'text-base'}`}>withdrawal amount (usd)</label>
            <div className="relative">
              <span className={`absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 font-extrabold ${isAccessible ? 'text-3xl' : 'text-2xl'}`}>$</span>
              <input 
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                max={balance}
                className={`w-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-3xl focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none text-slate-900 dark:text-slate-50 font-extrabold transition-all ${isAccessible ? 'pl-20 pr-10 py-8 text-4xl' : 'pl-16 pr-8 py-6 text-2xl'}`}
              />
            </div>
          </div>

          <button 
            onClick={handleWithdraw}
            disabled={isProcessing || !withdrawAmount || Number(withdrawAmount) > balance || Number(withdrawAmount) <= 0}
            className={`w-full py-6 rounded-[2.5rem] text-white font-extrabold transition-all active:scale-95 disabled:opacity-30 lowercase shadow-2xl shadow-secondary/20 hover:scale-[1.01] bg-secondary text-lg`}
          >
            {isProcessing ? 'processing mastery payout...' : t('withdraw')}
          </button>

          {success && (
            <div className={`p-5 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-extrabold text-center rounded-[2rem] border-2 border-green-200 dark:border-green-900 animate-in zoom-in-95 duration-500 shadow-lg`}>
              transaction successful mastery!
            </div>
          )}
        </div>
      </div>

      <div className={`bg-accent/5 dark:bg-accent/10 rounded-[4rem] border-2 border-dashed border-accent/20 p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-inner`}>
         <div className="flex items-center gap-8 text-center md:text-left">
            <div className="w-20 h-20 bg-accent/20 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-accent/10">💝</div>
            <div className="space-y-2">
               <h3 className="font-extrabold text-slate-900 dark:text-slate-50 lowercase text-2xl leading-tight">{t('giveBack')}</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400 font-medium lowercase leading-relaxed max-w-sm">{t('giveBackDesc')}</p>
            </div>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            {[10, 25, 50].map(amt => (
              <button
                key={amt}
                onClick={() => handleGiveBack(amt)}
                disabled={balance < amt}
                className="flex-1 md:flex-none px-10 py-5 bg-white dark:bg-slate-900 border-2 border-accent/20 text-accent font-extrabold rounded-3xl hover:bg-accent hover:text-white disabled:opacity-30 transition-all text-sm shadow-xl"
              >
                ${amt}
              </button>
            ))}
         </div>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 p-10 transition-colors`}>
        <div className="flex items-center gap-5 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-inner">📽️</div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-50 lowercase text-2xl tracking-tight">contributor mastery ledger</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 gap-6">
             <div className="flex flex-col space-y-2 text-center md:text-left">
                <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">active reward rates</span>
                <span className="text-base font-extrabold text-slate-700 dark:text-slate-300">
                  <span className="text-primary">${CONTRIBUTOR_MINUTE_RATE}</span>/min visual Mastery • <span className="text-secondary">${CONTRIBUTOR_PAGE_RATE}</span>/unit text Mastery
                </span>
             </div>
             <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 lowercase text-center md:text-right max-w-[240px] leading-relaxed">
                Rewards are credited after global pedagogical verification of truth.
             </div>
          </div>

          <div className="space-y-6 pt-8">
            <h4 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-4">recent mastery contributions</h4>
            {contributedMedia.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {contributedMedia.map(item => {
                  const amount = calculatePayout(item);
                  const isClaimed = claimedIds.has(item.id);
                  const isVideo = item.type === 'video' || item.type === 'podcast';
                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center px-8 py-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] group transition-all hover:border-primary/30 hover:shadow-2xl gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${isClaimed ? 'bg-slate-200 dark:bg-slate-800' : 'bg-secondary animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.6)]'}`}></div>
                        <div className="flex flex-col">
                          <span className={`text-base font-extrabold lowercase line-clamp-1 transition-colors ${isClaimed ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-slate-50'}`}>{item.title}</span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            {item.type} <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></span> {item.duration} {isVideo ? 'min' : 'units'} <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800"></span> calc: ${isVideo ? CONTRIBUTOR_MINUTE_RATE : CONTRIBUTOR_PAGE_RATE}/unit
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <span className={`text-xl font-extrabold ${isClaimed ? 'text-slate-300 dark:text-slate-700 line-through' : 'text-secondary'}`}>+${amount.toFixed(0)}</span>
                        {!isClaimed && (
                          <button 
                            onClick={() => onClaimReward?.(item.id, amount)}
                            className="px-6 py-2.5 bg-secondary/10 text-secondary text-[10px] font-extrabold rounded-xl uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-sm"
                          >
                            claim
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-950/20">
                <p className="text-sm text-slate-400 dark:text-slate-600 font-bold lowercase italic">Your mastery ledger is currently empty. start contributing to begin earning.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
