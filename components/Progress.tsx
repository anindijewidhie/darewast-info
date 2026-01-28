
import React from 'react';
import { UserState, Achievement } from '../types';
import { COLORS, ACHIEVEMENTS, TRANSLATIONS } from '../constants';

interface ProgressProps {
  user: UserState;
  darkMode?: boolean;
  isAccessible?: boolean;
}

const Progress: React.FC<ProgressProps> = ({ user, darkMode, isAccessible }) => {
  const t = (key: string) => TRANSLATIONS[user.language]?.[key] || TRANSLATIONS['en'][key] || key;

  return (
    <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      {/* Stats Summary */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
        <StatCard 
          label={t('time')} 
          value={`${user.sessionMinutes}m`} 
          color={COLORS.primary} 
          isAccessible={isAccessible} 
        />
        <StatCard 
          label={t('earnings')} 
          value={`$${user.totalEarnings.toFixed(2)}`} 
          color={COLORS.secondary} 
          isAccessible={isAccessible} 
        />
        <StatCard 
          label={t('categoriesConsumed')} 
          value={Object.keys(user.consumedCategories).length.toString()} 
          color={COLORS.tertiary} 
          isAccessible={isAccessible} 
        />
      </div>

      {/* Badges Section */}
      <div className={`bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors`}>
        <h2 className={`${isAccessible ? 'text-3xl' : 'text-xl'} font-black lowercase mb-8 flex items-center gap-3`}>
          <span className="p-2 bg-yellow-400/20 rounded-xl">✨</span>
          {t('achievements')}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACHIEVEMENTS.map(badge => {
            const isUnlocked = user.achievements.some(a => a.id === badge.id);
            return (
              <div 
                key={badge.id}
                className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${isUnlocked ? 'border-primary/20 bg-primary/5 dark:bg-primary/10 opacity-100' : 'border-gray-100 dark:border-gray-700 opacity-40 grayscale'}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-sm ${isUnlocked ? 'bg-white dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {badge.icon}
                </div>
                <div>
                  <h3 className={`font-black lowercase leading-tight ${isAccessible ? 'text-xl' : 'text-base'}`}>{badge.name}</h3>
                  <p className={`text-gray-500 dark:text-gray-400 lowercase leading-tight mt-1 ${isAccessible ? 'text-base' : 'text-xs'}`}>{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mastered Subjects Grid */}
      <div className={`bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700 shadow-sm transition-colors`}>
        <h2 className={`${isAccessible ? 'text-3xl' : 'text-xl'} font-black lowercase mb-8 flex items-center gap-3`}>
          <span className="p-2 bg-purple-400/20 rounded-xl">🔮</span>
          mastered subjects
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(user.consumedCategories).map(([cat, count]) => (
            <div key={cat} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center gap-3">
              <span className="text-xs font-black lowercase text-gray-700 dark:text-gray-200">{cat}</span>
              <div className="w-6 h-6 rounded-full bg-tertiary text-[10px] font-black text-white flex items-center justify-center shadow-md">
                {count}
              </div>
            </div>
          ))}
          {Object.keys(user.consumedCategories).length === 0 && (
            <p className="text-gray-400 font-medium italic">No subjects mastered yet. Start learning in pedagogy mode!</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, isAccessible }: any) => (
  <div className={`bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center transition-all hover:scale-[1.02]`}>
    <span className={`${isAccessible ? 'text-lg' : 'text-[10px]'} font-black text-gray-400 uppercase tracking-widest mb-2`}>{label}</span>
    <span className={`${isAccessible ? 'text-5xl' : 'text-4xl'} font-black`} style={{ color }}>{value}</span>
  </div>
);

export default Progress;
