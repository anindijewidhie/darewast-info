
import React from 'react';
import { UserState, Achievement } from '../types';
import { COLORS, ACHIEVEMENTS, TRANSLATIONS, GRADIENTS } from '../constants';

interface ProgressProps {
  user: UserState;
  darkMode?: boolean;
  isAccessible?: boolean;
}

const Progress: React.FC<ProgressProps> = ({ user, darkMode, isAccessible }) => {
  const t = (key: string) => TRANSLATIONS[user.language]?.[key] || TRANSLATIONS['en'][key] || key;

  return (
    <div className="space-y-16 reveal pb-20">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="text-center md:text-left">
            <h2 className="text-5xl font-black lowercase tracking-tighter text-slate-900 dark:text-white">scholar mastery dashboard</h2>
            <p className="text-slate-400 font-medium lowercase text-lg">tracking systematic growth across 20+ specialized knowledge nodes.</p>
         </div>
         <div className="px-8 py-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5">
            <span className="text-[12px] font-black uppercase text-primary tracking-[0.3em]">Mastery Level {Math.floor(user.sessionMinutes / 60) + 1} Scholar</span>
         </div>
      </div>

      {/* Hero Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <ModernStatCard label="Immersion Hours" value={`${(user.sessionMinutes / 60).toFixed(1)}h`} sub="Systematic practice time" gradient={GRADIENTS.primary} />
        <ModernStatCard label="Accumulated Credit" value={`$${user.totalEarnings.toFixed(2)}`} sub="Redeemable mastery credit" gradient={GRADIENTS.secondary} />
        <ModernStatCard label="Subjects Mastered" value={Object.keys(user.consumedCategories).length.toString()} sub="Cross-disciplinary depth" gradient={GRADIENTS.tertiary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Achievements Column */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0A0F1D] p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-12">
           <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-8">
              <h3 className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em]">Scholarly Milestones</h3>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{user.achievements.length} / {ACHIEVEMENTS.length} verified</span>
           </div>
           <div className="grid grid-cols-1 gap-6">
              {ACHIEVEMENTS.map(badge => {
                const isUnlocked = user.achievements.some(a => a.id === badge.id);
                return (
                  <div key={badge.id} className={`p-8 rounded-[2.5rem] border-2 flex items-center gap-8 transition-all duration-500 ${isUnlocked ? 'border-primary/20 bg-primary/5 shadow-xl shadow-primary/5 group hover:scale-[1.02]' : 'border-slate-100 dark:border-white/5 opacity-30 grayscale'}`}>
                    <div className="w-20 h-20 bg-white dark:bg-[#020617] rounded-[1.8rem] flex items-center justify-center text-4xl shadow-inner border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">{badge.icon}</div>
                    <div className="space-y-1">
                      <h4 className="font-black text-xl lowercase text-slate-900 dark:text-white">{badge.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 lowercase leading-relaxed font-medium">{badge.description}</p>
                    </div>
                    {isUnlocked && (
                       <div className="ml-auto w-10 h-10 bg-primary rounded-full flex items-center justify-center text-slate-900 font-black shadow-lg">✓</div>
                    )}
                  </div>
                );
              })}
           </div>
        </div>

        {/* Knowledge Tree Column - Discipline Tracker */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0A0F1D] p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-2xl space-y-12">
           <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-8">
              <h3 className="text-[12px] font-black uppercase text-slate-400 tracking-[0.4em]">Node Mastery Levels</h3>
           </div>
           <div className="space-y-10">
              {Object.entries(user.consumedCategories).length > 0 ? (
                Object.entries(user.consumedCategories).map(([cat, count]) => (
                  <div key={cat} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(83,205,186,0.5)]"></div>
                        <span className="text-lg font-black lowercase text-slate-700 dark:text-slate-300">{cat}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Level {count} Mastery</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-white/5 rounded-2xl overflow-hidden p-1 shadow-inner">
                       <div className="h-full bg-primary rounded-xl shadow-[0_0_15px_rgba(83,205,186,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, (count as number) * 10)}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 flex flex-col items-center justify-center opacity-30 text-center space-y-6">
                   <div className="text-7xl">🌱</div>
                   <div className="space-y-2">
                      <p className="text-xl font-black lowercase">mastery tree is empty</p>
                      <p className="text-xs font-bold uppercase tracking-widest">begin daily practice to track progress</p>
                   </div>
                   <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary/20 text-primary font-black rounded-xl hover:bg-primary hover:text-slate-900 transition-all text-[10px] uppercase tracking-widest">begin practice</button>
                </div>
              )}
           </div>

           {Object.keys(user.consumedCategories).length > 0 && (
             <div className="pt-10 border-t border-slate-100 dark:border-white/5 mt-10">
                <p className="text-[10px] text-slate-400 font-bold lowercase text-center leading-relaxed">
                   mastery levels reflect repetitive systematic engagement and verified retention of scholarly nodes.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const ModernStatCard = ({ label, value, sub, gradient }: any) => (
  <div className="relative overflow-hidden p-10 rounded-[3.5rem] bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-white/5 premium-shadow group hover:scale-[1.02] active:scale-95 transition-all duration-500">
    <div className="absolute top-0 right-0 w-48 h-48 opacity-10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full group-hover:opacity-20 transition-opacity" style={{ background: gradient }}></div>
    <div className="relative z-10 space-y-2">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">{label}</span>
      <p className="text-6xl font-black tracking-tighter transition-all duration-500 group-hover:translate-x-1" style={{ color: COLORS.primary }}>{value}</p>
      <p className="text-[11px] font-bold text-slate-400 lowercase">{sub}</p>
    </div>
  </div>
);

export default Progress;
