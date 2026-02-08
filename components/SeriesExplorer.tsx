
import React, { useMemo } from 'react';
import { Series, MediaItem, Language, UserRole, ReleasePattern } from '../types';
import { COLORS, TRANSLATIONS, MONTHS, cleanPunctuation } from '../constants';

interface SeriesExplorerProps {
  lang: Language;
  role: UserRole;
  cycleStartMonth: number;
  onSetCycleStartMonth: (month: number) => void;
  seriesList: Series[];
  mediaList: MediaItem[];
  onSelectEpisode: (item: MediaItem) => void;
  isAccessible?: boolean;
  noPunct?: boolean;
}

const SeriesExplorer: React.FC<SeriesExplorerProps> = ({ 
  lang, role, cycleStartMonth, onSetCycleStartMonth, seriesList, mediaList, onSelectEpisode, isAccessible, noPunct 
}) => {
  const t = (key: string) => {
    const raw = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
    return noPunct ? cleanPunctuation(raw) : raw;
  };

  const currentDay = new Date().getDay();
  const currentMonthIdx = new Date().getMonth();

  const periodProgress = useMemo(() => {
    let monthsSinceStart = (currentMonthIdx - cycleStartMonth + 12) % 12;
    let cycleMonth = monthsSinceStart % 3; 
    return {
      month: cycleMonth + 1,
      total: 3,
      percent: ((cycleMonth + 1) / 3) * 100
    };
  }, [cycleStartMonth, currentMonthIdx]);

  const isTodayDrop = (pattern: ReleasePattern, duration: number) => {
    if (duration === 45 || duration === 60) return true;
    switch (pattern) {
      case 'MWF': return [1, 3, 5].includes(currentDay);
      case 'TTS': return [2, 4, 6].includes(currentDay);
      case 'MT': return [1, 4].includes(currentDay);
      case 'TF': return [2, 5].includes(currentDay);
      case 'WS': return [3, 6].includes(currentDay);
      case 'SUNDAY': return currentDay === 0;
      case 'DAILY': return true;
      default: return false;
    }
  };

  const getPatternLabel = (pattern: ReleasePattern, duration: number) => {
    if (duration === 45 || duration === 60) return t('scheduleDaily');
    switch (pattern) {
      case 'MWF': return t('scheduleMWF');
      case 'TTS': return t('scheduleTTS');
      case 'MT': return t('scheduleMT');
      case 'TF': return t('scheduleTF');
      case 'WS': return t('scheduleWS');
      case 'SUNDAY': return t('scheduleSunday');
      case 'DAILY': return t('scheduleDaily');
      default: return '';
    }
  };

  const canEditCycle = ['publisher', 'director'].includes(role);
  const sundayFilms = useMemo(() => mediaList.filter(m => m.type === 'film'), [mediaList]);

  return (
    <div className={`space-y-16 animate-in fade-in duration-700 pb-20`}>
      <div className="bg-gray-900 text-white rounded-[4rem] p-16 relative overflow-hidden shadow-2xl border-b-[12px] border-primary/20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-5 mb-8">
              <span className="px-5 py-2 bg-primary text-gray-900 text-[12px] font-black rounded-full uppercase tracking-[0.3em] shadow-xl">{t('tvAlternative')}</span>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                 <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Network Live: High-Fidelity Drops</span>
              </div>
            </div>
            <h2 className="text-7xl font-black lowercase tracking-tighter mb-8 leading-[1.1]">{t('seriesHub')}</h2>
            <p className="text-white/60 text-xl font-medium lowercase leading-relaxed">
              {t('seriesSubtitle')}. {t('safetyWarning')}
            </p>
          </div>
          <div className="w-full lg:w-[400px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-inner">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div>
                <h3 className="text-[11px] font-black uppercase text-primary tracking-widest">{t('cycleTracker')}</h3>
                <p className="text-[10px] font-bold text-white/30 uppercase mt-1">{MONTHS[cycleStartMonth]} Commencement</p>
              </div>
              {canEditCycle && (
                 <select value={cycleStartMonth} onChange={(e) => onSetCycleStartMonth(parseInt(e.target.value))} className="bg-gray-800 text-[10px] font-black text-primary px-4 py-2 rounded-xl border border-primary/20 outline-none">
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                 </select>
              )}
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <span className="text-4xl font-black tracking-tighter">Month {periodProgress.month}</span>
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Mastery Level {periodProgress.month}</span>
               </div>
               <div className="h-3.5 w-full bg-white/10 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-primary shadow-[0_0_20px_rgba(83,205,186,0.6)] rounded-full transition-all duration-1000" style={{ width: `${periodProgress.percent}%` }}></div>
               </div>
               <p className="text-[11px] font-black text-white/40 text-center">Cycle Phase: {periodProgress.month} of 3</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-20">
        {seriesList.map((series) => {
          const episodes = mediaList.filter(m => m.seriesId === series.id).sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
          const isReleaseDay = isTodayDrop(series.pattern, series.duration);
          const isHighDuration = series.duration === 45 || series.duration === 60;
          return (
            <div key={series.id} className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-gray-100 dark:border-gray-700 pb-8 gap-8">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <span className="text-[12px] font-black text-primary uppercase tracking-[0.3em]">{series.category}</span>
                    <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                    <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">{getPatternLabel(series.pattern, series.duration)}</span>
                    {isReleaseDay && (
                       <span className="px-4 py-1.5 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg">{isHighDuration ? 'Daily Drop' : t('newToday')}</span>
                    )}
                  </div>
                  <h3 className="text-5xl font-black text-gray-900 dark:text-white lowercase tracking-tight leading-tight">{noPunct ? cleanPunctuation(series.title) : series.title}</h3>
                </div>
                <div className="flex items-center gap-8 shrink-0">
                   <div className="text-right">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t('periodProgress')}</span>
                      <span className="text-3xl font-black text-primary">{episodes.length} / {series.episodesPerPeriod} <span className="text-sm text-gray-400 uppercase">episodes</span></span>
                   </div>
                   <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border-4 border-primary/20 shadow-inner">
                      <span className="text-2xl font-black text-primary">{Math.round((episodes.length / series.episodesPerPeriod) * 100)}%</span>
                   </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {episodes.map((ep) => (
                  <div key={ep.id} onClick={() => onSelectEpisode(ep)} className="group cursor-pointer space-y-5">
                    <div className="aspect-video rounded-[2.5rem] overflow-hidden relative border-8 border-transparent group-hover:border-primary/20 transition-all shadow-lg group-hover:shadow-2xl bg-black">
                       <img src={ep.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100" alt={ep.title} />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-7">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl transform translate-y-6 group-hover:translate-y-0 transition-transform mb-4">
                             <svg className="w-6 h-6 text-primary ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                          </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest">Mastery EP {ep.episodeNumber}</span>
                       </div>
                       <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-2xl">
                          Broadcast EP {ep.episodeNumber}
                       </div>
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-gray-800 dark:text-white lowercase leading-snug group-hover:text-primary transition-colors">{noPunct ? cleanPunctuation(ep.title) : ep.title}</h4>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1.5 opacity-60">Verified by {noPunct ? cleanPunctuation(ep.author) : ep.author}</p>
                    </div>
                  </div>
                ))}
                {Array.from({ length: Math.min(4, series.episodesPerPeriod - episodes.length) }).map((_, i) => (
                  <div key={i} className="aspect-video rounded-[2.5rem] border-4 border-dashed border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col items-center justify-center p-10 text-center opacity-30 hover:opacity-50 transition-opacity">
                     <span className="text-4xl mb-4">⏳</span>
                     <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('nextEpisode')}</span>
                     <p className="text-[10px] font-bold text-gray-400 lowercase">{getPatternLabel(series.pattern, series.duration)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {sundayFilms.length > 0 && (
        <section className="p-16 bg-secondary/5 rounded-[4rem] border-4 border-secondary/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 flex items-end justify-between border-b-2 border-secondary/10 pb-8 mb-12">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-secondary text-white rounded-[1.8rem] flex items-center justify-center text-3xl font-black shadow-xl shadow-secondary/20 transform -rotate-3">SUN</div>
                 <div>
                    <h3 className="text-4xl font-black lowercase tracking-tight text-gray-900 dark:text-white">{t('filmHub')}</h3>
                    <p className="text-[11px] font-black text-secondary uppercase tracking-[0.3em] mt-1">{t('filmSubtitle')}</p>
                 </div>
              </div>
           </div>
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
              {sundayFilms.map(film => (
                 <div key={film.id} className="group cursor-pointer bg-white dark:bg-gray-800 rounded-[3rem] p-4 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all" onClick={() => onSelectEpisode(film)}>
                    <div className="aspect-video rounded-[2rem] overflow-hidden relative mb-6">
                       <img src={film.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="px-8 py-3 bg-white text-secondary font-black rounded-full uppercase text-xs tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform">Watch Sunday Special</div>
                       </div>
                    </div>
                    <div className="px-4 pb-4">
                       <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black rounded-lg uppercase">{film.duration} MIN FILM</span>
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{noPunct ? cleanPunctuation(film.category) : film.category} Mastery</span>
                       </div>
                       <h4 className="text-2xl font-black text-gray-900 dark:text-white lowercase leading-tight group-hover:text-secondary transition-colors">{noPunct ? cleanPunctuation(film.title) : film.title}</h4>
                    </div>
                 </div>
              ))}
           </div>
        </section>
      )}
      <div className="p-16 bg-primary/5 rounded-[4rem] border-4 border-primary/10 flex flex-col md:flex-row items-center gap-12 shadow-inner relative overflow-hidden">
         <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2rem] flex items-center justify-center shadow-2xl border border-primary/20 shrink-0 transform rotate-6">
            <span className="text-5xl">🛡️</span>
         </div>
         <div className="flex-grow text-center md:text-left space-y-3">
            <h4 className="text-2xl font-black uppercase text-primary tracking-[0.4em]">{t('safetyShieldTitle')}</h4>
            <p className="text-base font-medium text-gray-600 dark:text-gray-400 lowercase leading-relaxed max-w-3xl">
              {t('safetyShieldDesc')} {t('safetyWarning')} Prohibited: violence, porn, discrimination, political incorrectness.
            </p>
         </div>
         <div className="shrink-0 px-8 py-4 bg-primary text-white font-black text-xs rounded-2xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transform -rotate-2">
            Pedagogical Truth Guaranteed
         </div>
      </div>
    </div>
  );
};

export default SeriesExplorer;
