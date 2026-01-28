
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  UserState, 
  MediaItem, 
  MediaType, 
  MediaDuration, 
  UserAgeMode,
  UserRole,
  Language,
  AgeRating,
  CensorshipLevel,
  SchoolSystemType,
  Achievement,
  Series,
  AccessibilitySettings
} from './types';
import { COLORS, GRADIENTS, EARNING_RATE, LANGUAGES, TRANSLATIONS, ACHIEVEMENTS, CATEGORIES, TOPICS, THEMES, GENRES, cleanPunctuation } from './constants';
import Scanner from './components/Scanner';
import PedagogyExplorer from './components/PedagogyExplorer';
import Wallet from './components/Wallet';
import Progress from './components/Progress';
import VideoGenerator from './components/VideoGenerator';
import Auth from './components/Auth';
import Donation from './components/Donation';
import SeriesExplorer from './components/SeriesExplorer';
import MediaViewer from './components/MediaViewer';

const MOCK_SERIES: Series[] = [
  { id: 's1', title: 'The Neural Frontier', author: 'AI Research Hub', duration: 15, description: 'A 36-part exploration into the mechanics of thought and the architecture of neural systems.', category: 'Computer Science', coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop', episodesPerPeriod: 36, currentEpisodes: 2, cycleStartMonth: 0, pattern: 'MWF' },
];

const MOCK_MEDIA: MediaItem[] = [
  { id: 'paper1', title: 'The Global Observer', author: 'Objective Press', type: 'paper', duration: 15, coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop', category: 'Civics', topic: 'Constitutional Law', theme: 'Power & Justice', genre: 'Academic Journal', description: 'Daily objective reporting on world governance and civil liberties.', ageRating: '13+', isHumanMade: true, releaseFrequency: 'daily' },
  { id: 'mag1', title: 'BioTech Weekly', author: 'Science Corp', type: 'magazine', duration: 30, coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9d39d6627?q=80&w=800&auto=format&fit=crop', category: 'Biology', topic: 'Genetics', theme: 'Innovation', genre: 'Case Study', description: 'Weekly biology deep-dives into CRISPR and the future of human longevity.', ageRating: '13+', isHumanMade: true, releaseFrequency: 'weekly' },
  { id: 'tabloid1', title: 'The Tech Truth', author: 'Darewast Tabloids', type: 'tabloid', duration: 15, coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop', category: 'Computer Science', topic: 'Neural Networks', theme: 'Future Tech', genre: 'Satirical Tabloid', description: 'Weekly satirical yet informative tech tabloid exposing the Silicon Valley underbelly.', ageRating: '13+', isHumanMade: true, releaseFrequency: 'weekly' },
  { id: 'ebook1', title: 'The Calculus Master', author: 'Darewast Press', type: 'ebook', duration: 60, coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop', category: 'Mathematics', topic: 'Calculus', theme: 'Mastery', genre: 'Technical Manual', description: 'Monthly mastery manual for engineers and scientists looking to master complex derivations.', ageRating: '8+', isHumanMade: true, releaseFrequency: 'monthly' },
  { id: 'pod1', title: 'Pedagogy Today', author: 'Darewast Audio', type: 'podcast', duration: 45, coverImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop', category: 'Philosophy', topic: 'Existentialism', theme: 'Individual Growth', genre: 'Expert Interview', description: 'Deep-dive conversations with global education leaders.', ageRating: '13+', isHumanMade: true, releaseFrequency: 'weekly' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'series' | 'pedagogy' | 'wallet' | 'scanner' | 'progress' | 'videogen' | 'donation'>('library');
  const [darkMode, setDarkMode] = useState(true);
  const [showAccessHub, setShowAccessHub] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  const [userMediaItems, setUserMediaItems] = useState<MediaItem[]>([]);
  const [userSeries, setUserSeries] = useState<Series[]>([]);
  const [claimedMediaIds, setClaimedMediaIds] = useState<Set<string>>(new Set());
  
  const [user, setUser] = useState<UserState>({
    isLoggedIn: false,
    username: '',
    fullName: '',
    totalEarnings: 0,
    sessionMinutes: 0,
    role: 'consumer',
    contributorEarnings: 0,
    ageMode: 'regular',
    ageRatingPreference: '18+',
    censorshipLevel: 'Low',
    lowCognitiveMode: false,
    pedagogyModeActive: false,
    language: 'en',
    schoolSystem: '6-3-3',
    achievements: [],
    consumedCategories: {},
    insightCount: 0,
    cycleStartMonth: 0,
    accessibility: {
      noPunctuation: false,
      highContrast: false,
      screenReaderOptimized: false,
      dyslexicFont: false
    }
  });
  
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);

  const t = (key: string) => {
    const raw = TRANSLATIONS[user.language]?.[key] || TRANSLATIONS['en'][key] || key;
    return user.accessibility.noPunctuation ? cleanPunctuation(raw) : raw;
  };

  const isRTL = useMemo(() => LANGUAGES.find(l => l.code === user.language)?.rtl || false, [user.language]);
  
  const allMedia = useMemo(() => [...MOCK_MEDIA, ...userMediaItems], [userMediaItems]);
  const allSeries = useMemo(() => [...MOCK_SERIES, ...userSeries], [userSeries]);

  const filteredMedia = useMemo(() => {
    return allMedia.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || item.category === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, subjectFilter, allMedia]);

  const groupedContent = useMemo(() => {
    return {
      papers: filteredMedia.filter(m => m.type === 'paper'),
      magazines: filteredMedia.filter(m => m.type === 'magazine' || m.type === 'tabloid'),
      ebooks: filteredMedia.filter(m => m.type === 'ebook'),
      podcasts: filteredMedia.filter(m => m.type === 'podcast'),
    };
  }, [filteredMedia]);

  const changeLanguage = (code: Language) => {
    setUser(prev => ({ ...prev, language: code }));
  };

  const toggleAccessOption = (option: keyof AccessibilitySettings) => {
    setUser(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [option]: !prev.accessibility[option]
      }
    }));
  };

  const handleMasteryGained = (category: string) => {
    setUser(prev => ({
      ...prev,
      consumedCategories: {
        ...prev.consumedCategories,
        [category]: (prev.consumedCategories[category] || 0) + 1
      },
      totalEarnings: prev.totalEarnings + 5
    }));
  };

  if (!user.isLoggedIn) {
    return (
      <div className={`${darkMode ? 'dark' : ''} ${user.accessibility.highContrast ? 'high-contrast' : ''} min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4`}>
        <div className="absolute top-8 right-8 z-10 flex gap-4">
           <button 
             onClick={() => setShowAccessHub(!showAccessHub)}
             className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl px-4 py-2 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 outline-none hover:border-primary transition-all shadow-xl"
             aria-label="Accessibility Hub"
           >
             ♿
           </button>
           <select 
             value={user.language} 
             onChange={(e) => changeLanguage(e.target.value as Language)}
             className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl px-4 py-2 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 outline-none hover:border-primary transition-all cursor-pointer shadow-xl"
           >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
           </select>
        </div>
        <Auth lang={user.language} onLogin={(data) => setUser(prev => ({ ...prev, ...data, isLoggedIn: true }))} noPunctuation={user.accessibility.noPunctuation} />
        
        {showAccessHub && (
           <div className="fixed top-24 right-8 z-20 w-72 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-4xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">♿ Accessibility Settings</h3>
              <div className="space-y-4">
                <AccessToggle label="No Punctuation" active={user.accessibility.noPunctuation} onToggle={() => toggleAccessOption('noPunctuation')} />
                <AccessToggle label="High Contrast" active={user.accessibility.highContrast} onToggle={() => toggleAccessOption('highContrast')} />
                <AccessToggle label="Dyslexic Font" active={user.accessibility.dyslexicFont} onToggle={() => toggleAccessOption('dyslexicFont')} />
                <AccessToggle label="Screen Reader" active={user.accessibility.screenReaderOptimized} onToggle={() => toggleAccessOption('screenReaderOptimized')} />
              </div>
           </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`
        ${darkMode ? 'dark' : ''} 
        ${user.accessibility.highContrast ? 'high-contrast' : ''} 
        ${user.accessibility.dyslexicFont ? 'dyslexic-font' : ''} 
        transition-all duration-300
      `} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-500`}>
        
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 md:px-12 py-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div className={`rounded-2xl flex items-center justify-center text-slate-950 font-black w-11 h-11 text-2xl shadow-lg shadow-primary/20 cursor-pointer`} style={{ background: GRADIENTS.primary }} onClick={() => setActiveTab('library')}>d</div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-extrabold tracking-tighter text-slate-900 dark:text-slate-50">darewast <span className="text-primary">info</span></h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mt-1">{t('motto')}</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1 border border-slate-200 dark:border-slate-800 shadow-inner">
                <select 
                   value={user.language} 
                   onChange={(e) => changeLanguage(e.target.value as Language)}
                   className="bg-transparent border-none text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 outline-none cursor-pointer px-3 py-1.5"
                >
                   {LANGUAGES.map(l => (
                     <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900">{l.name}</option>
                   ))}
                </select>
             </div>

             <button 
               onClick={() => setShowAccessHub(!showAccessHub)}
               className={`p-3 rounded-2xl border transition-all ${showAccessHub ? 'bg-primary border-primary text-slate-900' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
               aria-expanded={showAccessHub}
             >
               ♿
             </button>
             
             <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 shadow-sm">
                {darkMode ? '☀️' : '🌙'}
             </button>
             
             <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-900 flex items-center justify-center text-xl shadow-inner border-2 border-white dark:border-slate-800">
                <span className="text-xs font-black text-slate-600 dark:text-slate-400">👤</span>
             </div>
          </div>
        </header>

        {showAccessHub && (
           <div className="fixed top-24 right-12 z-[100] w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-4xl border-4 border-primary/20 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">{t('accessHub')}</h3>
                <button onClick={() => setShowAccessHub(false)} className="text-slate-400 hover:text-primary transition-colors">✕</button>
              </div>
              <div className="space-y-5">
                <AccessToggle label={t('noPunct')} active={user.accessibility.noPunctuation} onToggle={() => toggleAccessOption('noPunctuation')} />
                <AccessToggle label={t('highContrast')} active={user.accessibility.highContrast} onToggle={() => toggleAccessOption('highContrast')} />
                <AccessToggle label={t('dyslexic')} active={user.accessibility.dyslexicFont} onToggle={() => toggleAccessOption('dyslexicFont')} />
                <AccessToggle label={t('screenReader')} active={user.accessibility.screenReaderOptimized} onToggle={() => toggleAccessOption('screenReaderOptimized')} />
              </div>
           </div>
        )}

        <div className="flex-grow flex max-w-[1920px] w-full mx-auto relative">
          <nav className={`fixed md:sticky top-[81px] h-[calc(100vh-81px)] w-20 lg:w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40 transition-all px-4 py-8`}>
            <div className="flex flex-col gap-2">
              <NavButton active={activeTab === 'library'} onClick={() => setActiveTab('library')} label={t('library')} color={COLORS.primary} icon="🏠" />
              <NavButton active={activeTab === 'series'} onClick={() => setActiveTab('series')} label={t('series')} color={COLORS.primary} icon="🎞️" />
              <NavButton active={activeTab === 'pedagogy'} onClick={() => setActiveTab('pedagogy')} label={t('pedagogyMode')} color={COLORS.tertiary} icon="🎓" />
              <NavButton active={activeTab === 'videogen'} onClick={() => setActiveTab('videogen')} label={t('videoGen')} color={COLORS.primary} icon="📽️" />
              
              <div className="my-8 border-t border-slate-100 dark:border-slate-900 mx-6 opacity-30"></div>
              
              <NavButton active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} label={t('progress')} color={COLORS.secondary} icon="🚀" />
              <NavButton active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} label={t('scanner')} color={COLORS.tertiary} icon="📷" />
              <NavButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} label={t('wallet')} color={COLORS.secondary} icon="💳" />
              <NavButton active={activeTab === 'donation'} onClick={() => setActiveTab('donation')} label={t('donate')} color={COLORS.accent} icon="❤️" />
            </div>
          </nav>

          <section className="flex-grow p-8 lg:p-12 min-w-0 bg-slate-50/50 dark:bg-slate-950/50" role="main">
            {activeTab === 'library' && (
              <div className="space-y-20 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-b border-slate-200 dark:border-slate-800 pb-12">
                  <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 w-full md:w-auto" role="tablist">
                    {['all', ...CATEGORIES.slice(0, 8)].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setSubjectFilter(cat)}
                        role="tab"
                        aria-selected={subjectFilter === cat}
                        className={`px-7 py-3 rounded-[1.8rem] text-[11px] font-black uppercase whitespace-nowrap transition-all border-2 ${subjectFilter === cat ? 'bg-primary border-primary text-slate-900 shadow-xl' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}
                      >
                        {user.accessibility.noPunctuation ? cleanPunctuation(cat) : cat}
                      </button>
                    ))}
                  </div>
                  <div className="relative group w-full md:w-[400px]">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</div>
                    <input 
                      type="text" 
                      placeholder={t('search')} 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2.2rem] text-sm font-extrabold text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-32">
                  <PlatformSection title={t('paper')} items={groupedContent.papers} onSelect={setCurrentMedia} color={COLORS.primary} t={t} noPunct={user.accessibility.noPunctuation} />
                  <PlatformSection title={t('magazine')} items={groupedContent.magazines} onSelect={setCurrentMedia} color={COLORS.secondary} t={t} noPunct={user.accessibility.noPunctuation} />
                  <PlatformSection title={t('ebook')} items={groupedContent.ebooks} onSelect={setCurrentMedia} color={COLORS.tertiary} t={t} noPunct={user.accessibility.noPunctuation} />
                  <PlatformSection title={t('podcast')} items={groupedContent.podcasts} onSelect={setCurrentMedia} color={COLORS.primary} t={t} noPunct={user.accessibility.noPunctuation} />
                </div>
              </div>
            )}

            {activeTab === 'series' && <SeriesExplorer lang={user.language} role={user.role} cycleStartMonth={user.cycleStartMonth} onSetCycleStartMonth={(m) => setUser({...user, cycleStartMonth: m})} seriesList={allSeries} mediaList={allMedia} onSelectEpisode={setCurrentMedia} noPunct={user.accessibility.noPunctuation} />}
            {activeTab === 'pedagogy' && <PedagogyExplorer lang={user.language} censorship={user.censorshipLevel} noPunct={user.accessibility.noPunctuation} />}
            {activeTab === 'videogen' && <VideoGenerator lang={user.language} onMediaAdded={(item) => setUserMediaItems(prev => [...prev, item])} />}
            {activeTab === 'progress' && <Progress user={user} />}
            {activeTab === 'scanner' && <Scanner onScanResult={(res) => setUserMediaItems(p => [...p, res])} lang={user.language} censorship={user.censorshipLevel} />}
            {activeTab === 'wallet' && <Wallet balance={user.totalEarnings} role={user.role} lang={user.language} />}
            {activeTab === 'donation' && <Donation lang={user.language} />}
          </section>
        </div>

        {currentMedia && (
          <MediaViewer 
            item={currentMedia} 
            lang={user.language} 
            onClose={() => setCurrentMedia(null)} 
            onMasteryGained={handleMasteryGained}
            noPunct={user.accessibility.noPunctuation}
          />
        )}
      </div>
    </div>
  );
};

const AccessToggle = ({ label, active, onToggle }: any) => (
  <button 
    onClick={onToggle}
    className={`w-full flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${active ? 'border-primary bg-primary/10 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
  >
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    <div className={`w-10 h-6 rounded-full transition-colors relative ${active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-5' : 'left-1'}`}></div>
    </div>
  </button>
);

const PlatformSection = ({ title, items, onSelect, color, t, noPunct }: any) => {
  if (items.length === 0) return null;
  return (
    <div className="space-y-12">
      <h4 className="text-3xl font-black lowercase tracking-tight flex items-center gap-6 text-slate-900 dark:text-slate-50">
        <span className="w-2 h-10 rounded-full" style={{ backgroundColor: color }}></span>
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
        {items.map((item: MediaItem) => (
          <PlatformCard key={item.id} item={item} onSelect={onSelect} t={t} color={color} noPunct={noPunct} />
        ))}
      </div>
    </div>
  );
};

const PlatformCard = ({ item, onSelect, t, color, noPunct }: any) => (
  <div 
    className="group bg-white dark:bg-slate-900 rounded-[3.5rem] overflow-hidden border-2 border-slate-100 dark:border-slate-800 hover:shadow-4xl transition-all cursor-pointer transform hover:-translate-y-3 flex flex-col shadow-sm"
    onClick={() => onSelect(item)}
    role="button"
    aria-label={`View ${item.title}`}
  >
    <div className="aspect-[4/5] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
      <img src={item.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[8s]" alt="" />
      <div className="absolute top-7 right-7 flex flex-col gap-3 items-end">
         <div className="px-5 py-2 bg-black/80 backdrop-blur-2xl text-[10px] font-black text-white rounded-2xl uppercase tracking-[0.2em]">{t(item.type)}</div>
      </div>
    </div>
    <div className="p-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: color }}>{noPunct ? cleanPunctuation(item.category) : item.category}</span>
        <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">{item.duration}m</span>
      </div>
      <h3 className="font-black text-2xl text-slate-900 dark:text-slate-50 leading-[1.1] lowercase line-clamp-2 group-hover:text-primary transition-colors">
        {noPunct ? cleanPunctuation(item.title) : item.title}
      </h3>
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 lowercase italic">authorized by {noPunct ? cleanPunctuation(item.author) : item.author}</span>
      </div>
    </div>
  </div>
);

const NavButton = ({ active, onClick, label, color, icon }: any) => (
  <button 
    onClick={onClick} 
    className={`w-full px-7 py-4.5 rounded-[1.8rem] font-black transition-all text-left flex items-center gap-6 group relative overflow-hidden ${active ? 'bg-primary/10 text-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`} 
    aria-current={active ? 'page' : undefined}
  >
    <span className={`text-2xl transition-all ${active ? 'scale-110 opacity-100' : 'opacity-40'}`} aria-hidden="true">{icon}</span>
    <span className="hidden lg:block lowercase text-[17px] tracking-tight">{label}</span>
  </button>
);

export default App;
