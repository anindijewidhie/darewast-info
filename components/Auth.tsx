
import React, { useState } from 'react';
import { COLORS, TRANSLATIONS, MIN_AGE_REQUIREMENT, cleanPunctuation } from '../constants';
import { Language, UserState } from '../types';

const TabletLogo: React.FC<{ size?: 'sm' | 'md' | 'lg', color?: string }> = ({ size = 'md', color = COLORS.primary }) => {
  const dimensions = size === 'sm' ? 'w-6 h-8' : size === 'md' ? 'w-10 h-14' : 'w-24 h-32';
  const fontSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-2xl' : 'text-5xl';
  const buttonSize = size === 'sm' ? 'w-0.5 h-0.5' : size === 'md' ? 'w-1.5 h-1.5' : 'w-3 h-3';
  
  return (
    <div className={`${dimensions} rounded-2xl flex items-center justify-center relative shadow-3xl shadow-primary/30 animate-in zoom-in duration-700`} style={{ backgroundColor: color }}>
      <div className={`${fontSize} font-black text-slate-950 leading-none`}>d</div>
      <div className={`absolute bottom-3 ${buttonSize} rounded-full bg-slate-950/20`}></div>
    </div>
  );
};

interface AuthProps {
  lang: Language;
  onLogin: (userData: Partial<UserState>) => void;
  isAccessible?: boolean;
  noPunctuation?: boolean;
}

const Auth: React.FC<AuthProps> = ({ lang, onLogin, isAccessible, noPunctuation }) => {
  const [view, setView] = useState<'splash' | 'login' | 'signup'>('splash');
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    emailOrPhone: '',
    birthDate: '',
  });
  const [error, setError] = useState<string | null>(null);

  const t = (key: string) => {
    const raw = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
    return noPunctuation ? cleanPunctuation(raw) : raw;
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (calculateAge(formData.birthDate) < MIN_AGE_REQUIREMENT) {
      setError('You must be at least 3 years old.');
      return;
    }
    onLogin({
      isLoggedIn: true,
      username: formData.username,
      fullName: formData.fullName,
      birthDate: formData.birthDate,
      ageRatingPreference: calculateAge(formData.birthDate) >= 18 ? '18+' : '13+',
      censorshipLevel: calculateAge(formData.birthDate) >= 18 ? 'Low' : 'Strict'
    });
  };

  if (view === 'splash') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto min-h-[60vh]" role="main">
        <div className="mb-10">
          <TabletLogo size="lg" />
        </div>
        <h1 className="text-6xl font-black lowercase mb-6 leading-tight tracking-tighter">
          {t('welcome')}
        </h1>
        <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-4">
          the in-depth media portal for systematic knowledge
        </p>
        <p className="text-slate-500 dark:text-slate-400 lowercase font-medium mb-16 text-xl max-w-md mx-auto leading-relaxed">
          a deep media alternative to algorithmic social media. systematic human truth for the global scholar.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
          <button 
            onClick={() => setView('signup')}
            className="flex-1 py-6 bg-primary text-slate-950 font-black rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all lowercase text-xl"
          >
            {t('signup')}
          </button>
          <button 
            onClick={() => setView('login')}
            className="flex-1 py-6 bg-tertiary text-white font-black rounded-[2rem] shadow-2xl shadow-tertiary/30 hover:scale-[1.05] active:scale-95 transition-all lowercase text-xl"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-10 bg-white dark:bg-[#0A0F1D] rounded-[4rem] shadow-4xl border border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-500 w-full" role="form">
      <button onClick={() => setView('splash')} className="mb-10 text-slate-400 hover:text-primary transition-colors flex items-center gap-3 font-black lowercase text-lg group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        back
      </button>
      <h2 className="text-4xl font-black lowercase mb-10 tracking-tighter">{t(view)}</h2>
      <form onSubmit={handleSignUp} className="space-y-6">
        {view === 'signup' && (
          <>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-primary outline-none font-bold transition-all shadow-inner placeholder:text-slate-300"
                placeholder="Scholar Name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Username</label>
              <input 
                required
                type="text" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-primary outline-none font-bold transition-all shadow-inner placeholder:text-slate-300"
                placeholder="scholar.id"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Date of Birth</label>
              <input 
                required
                type="date" 
                value={formData.birthDate}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
                className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-primary outline-none font-bold transition-all shadow-inner"
              />
            </div>
          </>
        )}
        <div className="space-y-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Contact Mastery</label>
          <input 
            required
            type="text" 
            value={formData.emailOrPhone}
            onChange={e => setFormData({...formData, emailOrPhone: e.target.value})}
            className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-primary outline-none font-bold transition-all shadow-inner placeholder:text-slate-300"
            placeholder="Network ID or Phone"
          />
        </div>
        {error && <p className="text-red-500 text-xs font-black lowercase p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30" role="alert">{error}</p>}
        <button 
          type="submit"
          className={`w-full py-6 font-black rounded-[2rem] shadow-2xl transition-all lowercase mt-6 text-xl ${view === 'signup' ? 'bg-primary text-slate-950 shadow-primary/30' : 'bg-secondary text-white shadow-secondary/30'}`}
        >
          {t(view)} mastery
        </button>
      </form>
    </div>
  );
};

export default Auth;
