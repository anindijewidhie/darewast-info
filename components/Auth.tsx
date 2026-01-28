
import React, { useState } from 'react';
import { COLORS, TRANSLATIONS, MIN_AGE_REQUIREMENT, cleanPunctuation } from '../constants';
import { Language, UserState } from '../types';

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
        <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-white text-5xl font-black mb-8 shadow-2xl">d</div>
        <h1 className="text-5xl font-black lowercase mb-4 leading-tight">{t('welcome')}</h1>
        <p className="text-[12px] font-black text-primary uppercase tracking-[0.4em] mb-4">{t('appDescription')}</p>
        <p className="text-gray-500 dark:text-gray-400 lowercase font-medium mb-12 text-lg">{t('unlimited')}</p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
          <button 
            onClick={() => setView('signup')}
            className="flex-1 py-5 bg-primary text-slate-950 font-black rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all lowercase text-lg"
          >
            {t('signup')}
          </button>
          <button 
            onClick={() => setView('login')}
            className="flex-1 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-black rounded-3xl border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all lowercase text-lg"
          >
            {t('login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 animate-in fade-in slide-in-from-bottom-8 duration-500 w-full" role="form">
      <button onClick={() => setView('splash')} className="mb-8 text-gray-400 hover:text-primary transition-colors flex items-center gap-2 font-black lowercase">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        back
      </button>

      <h2 className="text-3xl font-black lowercase mb-8">{t(view)}</h2>

      <form onSubmit={handleSignUp} className="space-y-4">
        {view === 'signup' && (
          <>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-2">{t('fullName')}</label>
              <input 
                required
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-primary outline-none font-bold transition-all"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-2">{t('username')}</label>
              <input 
                required
                type="text" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-primary outline-none font-bold transition-all"
                placeholder="jane.doe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-2">{t('birthDate')}</label>
              <input 
                required
                type="date" 
                value={formData.birthDate}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
                className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-primary outline-none font-bold transition-all"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 px-2">{t('emailOrPhone')}</label>
          <input 
            required
            type="text" 
            value={formData.emailOrPhone}
            onChange={e => setFormData({...formData, emailOrPhone: e.target.value})}
            className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 focus:border-primary outline-none font-bold transition-all"
            placeholder="email@example.com or +1234567"
          />
        </div>

        {error && <p className="text-red-500 text-xs font-black lowercase p-2 bg-red-50 dark:bg-red-900/20 rounded-xl" role="alert">{error}</p>}

        <button 
          type="submit"
          className="w-full py-5 bg-primary text-slate-950 font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all lowercase mt-4"
        >
          {t(view)}
        </button>
      </form>
    </div>
  );
};

export default Auth;
