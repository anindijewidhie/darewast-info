
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  UserState, 
  MediaItem, 
  MediaType, 
  UserRole,
  Language,
  Series
} from './types';
import { COLORS, LANGUAGES, TRANSLATIONS, CATEGORIES, TOPICS, THEMES, GENRES, cleanPunctuation } from './constants';
import Scanner from './components/Scanner';
import PedagogyExplorer from './components/PedagogyExplorer';
import Wallet from './components/Wallet';
import Progress from './components/Progress';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import Auth from './components/Auth';
import Donation from './components/Donation';
import SeriesExplorer from './components/SeriesExplorer';
import MediaViewer from './components/MediaViewer';

const TabletLogo: React.FC<{ size?: 'sm' | 'md' | 'lg', color?: string }> = ({ size = 'md', color = COLORS.primary }) => {
  const dimensions = size === 'sm' ? 'w-6 h-8' : size === 'md' ? 'w-10 h-14' : 'w-16 h-22';
  const fontSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-2xl' : 'text-4xl';
  const buttonSize = size === 'sm' ? 'w-0.5 h-0.5' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  
  return (
    <div className={`${dimensions} rounded-lg flex items-center justify-center relative shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3`} style={{ backgroundColor: color }}>
      <div className={`${fontSize} font-black text-slate-950 leading-none`}>d</div>
      <div className={`absolute bottom-1.5 ${buttonSize} rounded-full bg-slate-950/20`}></div>
    </div>
  );
};

const MOCK_SERIES: Series[] = [
  { id: 's1', title: 'mathematical foundations', author: 'darewast academy', duration: 30, description: 'a systematic 36-part journey from basic arithmetic to advanced calculus.', category: 'Mathematics', coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop', episodesPerPeriod: 36, currentEpisodes: 2, cycleStartMonth: 0, pattern: 'DAILY' },
  { id: 's2', title: 'the biological cycle', author: 'Life Sciences Lab', duration: 45, description: 'unraveling the genetics of complex organisms through daily practice.', category: 'Biology', coverImage: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=800&auto=format&fit=crop', episodesPerPeriod: 12, currentEpisodes: 5, cycleStartMonth: 1, pattern: 'MWF' },
];

const MOCK_MEDIA: MediaItem[] = [
  { id: 'ebook-calc', title: 'calculus: level master', author: 'darewast publishing', type: 'ebook', duration: 60, coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd48a5791?q=80&w=800&auto=format&fit=crop', category: 'Mathematics', topic: 'Calculus', theme: 'Mastery', genre: 'Technical Manual', description: 'the definitive guide to differential and integral calculus for scholars.', ageRating: '18+', isHumanMade: true },
  { id: 'ab-phys', title: 'the quantum observer', author: 'darewast audio', type: 'audiobook', duration: 480, coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop', category: 'Physics', topic: 'Quantum Mechanics', theme: 'Scientific Discovery', genre: 'Masterclass', description: '8 hours of deep dive into the subatomic architecture of the universe.', ageRating: '18+', isHumanMade: true },
  { id: 'mag-bio', title: 'biology today', author: 'Scholar Press', type: 'magazine', duration: 30, coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9d39d998e?q=80&w=800&auto=format&fit=crop', category: 'Biology', topic: 'Genetics', theme: 'Sustainability', genre: 'Academic Journal', description: 'monthly updates on genetic engineering and ecological preservation.', ageRating: '13+', isHumanMade: true },
  { id: 'paper-eth', title: 'universal coexistence', author: 'Ethics Institute', type: 'paper', duration: 15, coverImage: 'https://images.unsplash.com/photo-1524749292158-7540c2494485?q=80&w=800&auto=format&fit=crop', category: 'Global Ethics', topic: 'Human Rights', theme: 'Peace & Coexistence', genre: 'Philosophy Essay', description: 'Exploring the objective foundations of world peace and cross-cultural respect.', ageRating: '8+', isHumanMade: true },
  { id: 'vid-cs', title: 'coding the mind', author: 'Tech Academy', type: 'video', duration: 30, coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop', category: 'Computer Science', topic: 'Neural Networks', theme: 'Future Tech', genre: 'Masterclass', description: 'building deep neural architectures from scratch.', ageRating: '13+', isHumanMade: true },
  { id: 'pod-hist', title: 'the medieval scholar', author: 'History Hub', type: 'podcast', duration: 15, coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop', category: 'History', topic: 'Medieval Europe', theme: 'Culture & Society', genre: 'Historical Chronicle', description: 'daily episodes on the architecture of medieval power.', ageRating: '13+', isHumanMade: true },
  { id: 'tab-insight', title: 'the logic mirror', author: 'Truth Seekers', type: 'tabloid', duration: 15, coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop', category: 'Sociology', topic: 'Urbanization', theme: 'Identity', genre: 'Satirical Tabloid', description: 'a sharp look at modern social constructs through the lens of objective truth.', ageRating: '13+', isHumanMade: true },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'series' | 'pedagogy' | 'wallet' | 'scanner' | 'progress' | 'videogen' | 'imagegen' | 'donation'>('library');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all');
  const [userMediaItems, setUserMediaItems] = useState<MediaItem[]>([]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = (key: string) => {
    const raw = TRANSLATIONS[user.language]?.[key] || TRANSLATIONS['en'][key] || key;
    return user.accessibility.noPunctuation ? cleanPunctuation(raw) : raw;
  };

  const allMedia = useMemo(() => [...MOCK_MEDIA, ...userMediaItems], [userMediaItems]);

  const filteredMedia = useMemo(() => {
    return allMedia.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || item.category === subjectFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [searchQuery, subjectFilter, typeFilter, allMedia]);

  const handleMasteryGained = (category: string) => {
    setUser(prev => ({
      ...prev,
      consumedCategories: {
        ...prev.consumedCategories,
        [category]: (prev.consumedCategories[category] || 0) + 1
      },
      totalEarnings: prev.totalEarnings + 5,
      sessionMinutes: prev.sessionMinutes + 15
    }));
  };

  const changeLanguage = (langCode: Language) => {
    setUser(prev => ({ ...prev, language: langCode }));
    setShowLangMenu(false);
  };

  if (!user.isLoggedIn) {
    return (
      <div className={`${darkMode ? 'dark' : ''} min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-[#020408]`}>
        <Auth lang={user.language} onLogin={(data) => setUser(prev => ({ ...prev, ...data, isLoggedIn: true }))} noPunctuation={user.accessibility.noPunctuation} />
      </div>
    );
  }

  const featuredBook = allMedia[0];

  return (
    <div className={`${darkMode ? 'dark' : ''} ${user.accessibility.dyslexicFont ? 'dyslexic-font' : ''} transition-all duration-500 font-sans selection:bg-primary/30 selection:text-primary-900`}>
      <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#05070A] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-x-hidden transition-colors">
        
        {/* WORLD-CLASS HEADER */}
        <header className="fixed top-0 left-0 right-0 z-[100] transition-all bg-white/95 dark:bg-[#05070A]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 shadow-sm">
          <div className="container mx-auto max-w-[1400px] px-6 h-[84px] flex items-center justify-between">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { setActiveTab('library'); setSubjectFilter('all'); setTypeFilter('all'); }}>
                <TabletLogo size="md" />
                <div className="flex flex-col">
                  <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">darewast info</h1>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mt-1 text-primary">systematic depth matrix</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl px-6 py-2.5 border border-slate-200 dark:border-white/10 gap-4 focus-within:border-primary transition-all w-[320px] shadow-inner">
                 <span className="text-primary text-xl">🔍</span>
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search deep media..."
                    className="bg-transparent border-none outline-none text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-widest placeholder:text-slate-400 w-full"
                 />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden xl:flex items-center gap-8">
                <button onClick={() => setActiveTab('library')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-primary relative group ${activeTab === 'library' ? 'text-primary' : 'text-slate-400'}`}>
                  {t('library')}
                  <span className={`absolute -bottom-2 left-0 w-full h-1 bg-primary rounded-full transition-transform duration-300 ${activeTab === 'library' ? 'scale-x-100' : 'scale-x-0'}`}></span>
                </button>
                <button onClick={() => setActiveTab('scanner')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-secondary relative group ${activeTab === 'scanner' ? 'text-secondary' : 'text-slate-400'}`}>
                  Vision
                  <span className={`absolute -bottom-2 left-0 w-full h-1 bg-secondary rounded-full transition-transform duration-300 ${activeTab === 'scanner' ? 'scale-x-100' : 'scale-x-0'}`}></span>
                </button>
                <button onClick={() => setActiveTab('series')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-secondary relative group ${activeTab === 'series' ? 'text-secondary' : 'text-slate-400'}`}>
                  Tracks
                  <span className={`absolute -bottom-2 left-0 w-full h-1 bg-secondary rounded-full transition-transform duration-300 ${activeTab === 'series' ? 'scale-x-100' : 'scale-x-0'}`}></span>
                </button>
                <button onClick={() => setActiveTab('pedagogy')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-tertiary relative group ${activeTab === 'pedagogy' ? 'text-tertiary' : 'text-slate-400'}`}>
                  Scholarship
                  <span className={`absolute -bottom-2 left-0 w-full h-1 bg-tertiary rounded-full transition-transform duration-300 ${activeTab === 'pedagogy' ? 'scale-x-100' : 'scale-x-0'}`}></span>
                </button>
              </nav>

              <div className="w-[1px] h-8 bg-slate-200 dark:bg-white/10 hidden lg:block mx-1"></div>

              <div className="flex items-center gap-3">
                <div className="relative" ref={langMenuRef}>
                  <button 
                    onClick={() => setShowLangMenu(!showLangMenu)} 
                    className={`h-11 px-4 rounded-xl flex items-center gap-3 transition-all border ${showLangMenu ? 'bg-primary border-primary text-slate-950 shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-primary/50'}`}
                  >
                    <span className="text-lg">🌐</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{user.language}</span>
                  </button>
                  
                  {showLangMenu && (
                    <div className="absolute right-0 mt-4 w-[480px] bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 z-[200]">
                      <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="text-[12px] font-black uppercase text-slate-900 dark:text-white tracking-[0.2em]">Global Language Selection</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">choose your dialect for systematic in-depth mastery</p>
                          </div>
                          <span className="text-3xl opacity-20">🌍</span>
                        </div>
                      </div>
                      <div className="p-6 grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto no-scrollbar">
                        {LANGUAGES.map(lang => (
                          <button 
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`flex flex-col items-start p-5 rounded-3xl border-2 transition-all group ${user.language === lang.code ? 'bg-primary/10 border-primary text-primary shadow-inner' : 'bg-transparent border-slate-100 dark:border-white/5 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500'}`}
                            dir={lang.rtl ? 'rtl' : 'ltr'}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                               <span className={`text-[14px] font-black tracking-tight ${user.language === lang.code ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{lang.name}</span>
                               {user.language === lang.code && <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/50"></div>}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{lang.code === 'ar' || lang.code === 'ur' ? 'dialect logic' : 'mastery script'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-tertiary/20 text-tertiary shadow-lg' : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500'}`}>
                  {darkMode ? '☀️' : '🌙'}
                </button>
                
                <div onClick={() => setActiveTab('progress')} className="flex items-center gap-4 pl-3 pr-6 py-2.5 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 cursor-pointer hover:shadow-2xl transition-all shadow-md group">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[11px] font-black text-slate-950 group-hover:scale-110 transition-transform shadow-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start leading-none hidden sm:flex">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{user.username}</span>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-1">${user.totalEarnings.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow flex flex-col min-h-screen">
          
          {activeTab === 'library' && (
            <div className="animate-in fade-in duration-1000 flex flex-col pt-[84px]">
               
               {/* IMMERSIVE HERO */}
               <section className="relative w-full h-[85vh] flex items-center overflow-hidden bg-[#0A0F1D]">
                  <div className="absolute inset-0">
                    <img src={featuredBook.coverImage} className="w-full h-full object-cover blur-[120px] scale-125 opacity-30 transition-all duration-[4s]" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/70 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#05070A] via-transparent to-transparent"></div>
                  </div>

                  <div className="container mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                     <div className="lg:col-span-5 flex justify-center lg:justify-start">
                        <div className="relative group perspective-2000 cursor-pointer" onClick={() => setCurrentMedia(featuredBook)}>
                           <div className="w-[360px] aspect-[3/4.6] bg-slate-800 rounded-md shadow-[50px_70px_120px_-20px_rgba(0,0,0,1)] overflow-hidden transition-all duration-1000 group-hover:rotate-y-[-18deg] group-hover:scale-[1.08] border-l-[16px] border-black/40 relative">
                              <img src={featuredBook.coverImage} className="w-full h-full object-cover" alt={featuredBook.title} />
                              <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/50 via-black/10 to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                           </div>
                           <div className="absolute -inset-16 rounded-[4rem] bg-primary/10 blur-[150px] opacity-0 group-hover:opacity-100 transition-opacity duration-1500"></div>
                        </div>
                     </div>
                     <div className="lg:col-span-7 space-y-12 text-center lg:text-left">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                           <span className="px-6 py-2.5 bg-primary text-slate-950 text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-2xl">High-Fidelity Depth</span>
                           <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">{featuredBook.category} • {featuredBook.author}</span>
                        </div>
                        <h2 className="text-7xl lg:text-[10rem] font-black lowercase tracking-tighter leading-[0.8) text-white drop-shadow-4xl">
                          {featuredBook.title}
                        </h2>
                        <p className="text-2xl lg:text-3xl text-slate-300 font-medium max-w-2xl lowercase leading-relaxed border-l-4 border-primary pl-12 mx-auto lg:mx-0">
                          {featuredBook.description}
                        </p>
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-12 pt-8">
                           <button onClick={() => setCurrentMedia(featuredBook)} className="px-16 py-7 bg-primary text-slate-950 font-black rounded-full shadow-[0_40px_80px_rgba(83,205,186,0.5)] hover:scale-[1.1] hover:-translate-y-2 transition-all text-2xl lowercase">Begin Systematic Mastery</button>
                           <button onClick={() => setActiveTab('scanner')} className="px-12 py-7 bg-white/10 backdrop-blur-3xl border-2 border-white/20 text-white font-black rounded-full hover:bg-white hover:text-slate-900 transition-all text-[11px] uppercase tracking-widest shadow-2xl">Vision Digitizer</button>
                        </div>
                     </div>
                  </div>
               </section>

               {/* STICKY NAV */}
               <nav className="sticky top-[84px] z-[90] bg-white/95 dark:bg-[#05070A]/95 backdrop-blur-3xl border-b border-slate-200 dark:border-white/10 py-6 transition-all">
                 <div className="container mx-auto max-w-[1400px] px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                       <FilterPill active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} label="All Mastery" color="primary" />
                       <FilterPill active={typeFilter === 'ebook'} onClick={() => setTypeFilter('ebook')} label="Manuscripts" color="primary" />
                       <FilterPill active={typeFilter === 'audiobook'} onClick={() => setTypeFilter('audiobook')} label="Audiobooks" color="secondary" />
                       <FilterPill active={typeFilter === 'magazine'} onClick={() => setTypeFilter('magazine')} label="Periodicals" color="secondary" />
                       <FilterPill active={typeFilter === 'podcast'} onClick={() => setTypeFilter('podcast')} label="Logic Audio" color="tertiary" />
                       <FilterPill active={typeFilter === 'video'} onClick={() => setTypeFilter('video')} label="Broadcasts" color="accent" />
                    </div>
                    <div className="flex gap-4 shrink-0">
                       <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-8 py-3 rounded-full text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 outline-none focus:border-primary cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-800">
                          <option value="all">Global Mastery Sector</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
               </nav>

               {/* MAIN LIBRARY CONTENT */}
               <div className="py-32 space-y-48 bg-[#FDFCFB] dark:bg-[#05070A] transition-colors">
                  
                  <BookShelf 
                    title="Systematic Depth" 
                    subtitle="highly engaged mastery manuscripts" 
                    items={allMedia.slice(0, 6)} 
                    onSelect={setCurrentMedia}
                    color="primary"
                  />

                  {/* SAFETY CALLOUT */}
                  <section className="container mx-auto max-w-[1400px] px-6">
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 bg-[#0A0F1D] rounded-[5rem] p-16 lg:p-24 relative overflow-hidden shadow-6xl group">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/30 transition-all duration-[3s]"></div>
                        <div className="lg:col-span-5 space-y-12 relative z-10">
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-accent/30 rounded-2xl flex items-center justify-center text-5xl shadow-2xl">🛡️</div>
                              <span className="text-[14px] font-black uppercase text-accent tracking-[0.6em]">Pedagogical Shield</span>
                           </div>
                           <h3 className="text-6xl font-black text-white lowercase tracking-tighter leading-[0.85]">the scholarly alternative to social media noise.</h3>
                           <p className="text-xl text-slate-400 font-medium lowercase leading-relaxed border-l-4 border-accent pl-10">
                              darewast info provides unlimited selection in 14 global languages. we prioritize authentic human depth over synthetic algorithmic output. escape the noise and build universal wisdom.
                           </p>
                           <button onClick={() => setActiveTab('donation')} className="px-12 py-6 bg-accent text-white font-black rounded-full shadow-[0_30px_60px_rgba(245,101,101,0.4)] hover:scale-[1.05] transition-all text-sm uppercase tracking-widest">Support Global Depth</button>
                        </div>
                        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10 relative z-10">
                           {allMedia.slice(2, 5).map(item => (
                             <NodeCard key={item.id} item={item} onClick={() => setCurrentMedia(item)} compact />
                           ))}
                        </div>
                     </div>
                  </section>

                  <BookShelf 
                    title="Latest Scholarly Drops" 
                    subtitle="recently verified human truth units" 
                    items={filteredMedia.slice(0, 10)} 
                    onSelect={setCurrentMedia}
                    color="secondary"
                  />
               </div>
            </div>
          )}

          {/* DYNAMIC TABS */}
          <div className="container mx-auto px-6 lg:px-12 max-w-[1400px] py-32 min-h-[80vh]">
            {activeTab === 'series' && <SeriesExplorer lang={user.language} role={user.role} cycleStartMonth={user.cycleStartMonth} onSetCycleStartMonth={(m) => setUser({...user, cycleStartMonth: m})} seriesList={MOCK_SERIES} mediaList={allMedia} onSelectEpisode={setCurrentMedia} noPunct={user.accessibility.noPunctuation} />}
            {activeTab === 'pedagogy' && <PedagogyExplorer lang={user.language} censorship={user.censorshipLevel} noPunct={user.accessibility.noPunctuation} />}
            {activeTab === 'progress' && <Progress user={user} />}
            {activeTab === 'scanner' && <Scanner onScanResult={(res) => setUserMediaItems(p => [...p, res])} lang={user.language} censorship={user.censorshipLevel} />}
            {activeTab === 'wallet' && <Wallet balance={user.totalEarnings} role={user.role} lang={user.language} />}
            {activeTab === 'donation' && <Donation lang={user.language} />}
            {activeTab === 'videogen' && <VideoGenerator lang={user.language} onMediaAdded={(item) => setUserMediaItems(prev => [...prev, item])} />}
            {activeTab === 'imagegen' && <ImageGenerator lang={user.language} />}
          </div>

          <footer className="mt-auto border-t-2 border-slate-100 dark:border-white/5 p-24 bg-white dark:bg-[#020408] transition-colors relative overflow-hidden">
             <div className="container mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-24 relative z-10">
                <div className="lg:col-span-5 space-y-12">
                   <div className="flex items-center gap-8">
                      <TabletLogo size="lg" />
                      <span className="text-5xl font-black lowercase tracking-tighter text-slate-900 dark:text-white leading-none">darewast info</span>
                   </div>
                   <p className="text-2xl text-slate-400 font-medium lowercase leading-relaxed max-w-lg border-l-4 border-primary pl-12">Systematic delivery of high-fidelity pedagogical nodes. we provide a deep media alternative to algorithmic social media, focusing on authentic human scholarship.</p>
                </div>
                <div className="lg:col-span-7 flex flex-wrap gap-24 justify-end items-start pt-10">
                   <FooterShelf title="Matrix" links={['Manuscripts', 'Periodicals', 'Audiobooks', 'Broadcasts']} color="primary" />
                   <FooterShelf title="Systems" links={['Digitization', 'Node Archive', 'Scholar Ledger', 'Global Ethics']} color="secondary" />
                   <FooterShelf title="Patronage" links={['Depth Fund', 'Institutions', 'Safety Portal', 'Human Priority']} color="tertiary" />
                </div>
             </div>
             <div className="mt-40 pt-16 border-t border-slate-100 dark:border-white/10 text-center relative z-10">
                <span className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-[1.2em]">© 2025 DAREWAST INFO NETWORK • FIDELITY OVER NOISE</span>
             </div>
          </footer>
        </main>

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

// --- SUB-COMPONENTS ---

const FilterPill = ({ active, onClick, label, color }: any) => {
  const colorMap: any = { 
    primary: 'text-primary border-primary/20', 
    secondary: 'text-secondary border-secondary/20', 
    tertiary: 'text-tertiary border-tertiary/20', 
    accent: 'text-accent border-accent/20' 
  };
  const activeBg: any = { 
    primary: 'bg-primary', 
    secondary: 'bg-secondary', 
    tertiary: 'bg-tertiary', 
    accent: 'bg-accent' 
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`px-10 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-full border-2 ${active ? `${activeBg[color]} text-slate-950 border-transparent shadow-2xl scale-105` : `${colorMap[color]} text-slate-400 bg-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600`}`}
    >
      {label}
    </button>
  );
};

const BookShelf = ({ title, subtitle, items, onSelect, color }: any) => {
  const brandColor = (COLORS as any)[color];
  return (
    <section className="space-y-16">
      <div className="container mx-auto max-w-[1400px] px-6 flex justify-between items-end">
         <div className="space-y-4">
            <div className="flex items-center gap-5">
               <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: brandColor }}></div>
               <p className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-400">{subtitle}</p>
            </div>
            <h3 className="text-6xl font-black lowercase tracking-tighter text-slate-900 dark:text-white" style={{ color: brandColor }}>{title}</h3>
         </div>
      </div>
      <div className="flex gap-16 overflow-x-auto no-scrollbar pb-20 px-6 container mx-auto max-w-[1400px] scroll-smooth">
         {items.map((item: any) => (
            <NodeCard key={item.id} item={item} onClick={() => onSelect(item)} color={brandColor} />
         ))}
      </div>
    </section>
  );
};

const NodeCard = ({ item, onClick, color, compact = false }: any) => {
  const isAudiobook = item.type === 'audiobook';
  const durationText = isAudiobook 
    ? `${Math.floor(item.duration / 60)}h Mastery`
    : `${item.duration}m Mastery`;

  return (
    <div className={`group cursor-pointer flex-shrink-0 flex flex-col ${compact ? 'w-full' : 'w-72'} transition-all duration-700`} onClick={onClick}>
       <div className={`aspect-[3/4.6] rounded-sm shadow-[20px_35px_60px_-20px_rgba(0,0,0,0.4)] dark:shadow-[20px_35px_60px_-20px_rgba(0,0,0,0.9)] overflow-hidden relative border-l-[10px] border-black/15 transition-all duration-1000 group-hover:rotate-y-[-12deg] group-hover:scale-[1.05] group-hover:shadow-[40px_60px_100px_-20px_rgba(0,0,0,0.5)]`}>
          <img src={item.coverImage} className={`w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2s]`} alt={item.title} />
          
          <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/25 to-transparent"></div>
          
          <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase border border-white/20 shadow-4xl">
             {durationText}
          </div>
          
          <div className="absolute bottom-6 left-6 transform translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
             <div className="px-5 py-2 bg-white/95 backdrop-blur-3xl text-[10px] font-black text-slate-950 uppercase tracking-widest rounded-lg shadow-4xl border border-primary/30 flex items-center gap-3">
                🛡️ Scholar Verified
             </div>
          </div>
       </div>
       
       <div className="mt-10 space-y-3 px-2">
          <h4 className={`font-black text-slate-900 dark:text-white line-clamp-2 lowercase tracking-tight leading-snug transition-colors group-hover:text-primary ${compact ? 'text-xl' : 'text-2xl'}`}>{item.title}</h4>
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-3 border-t border-slate-100 dark:border-white/10">
             <span className="truncate max-w-[140px]">{item.author}</span>
             <span style={{ color }}>{item.category}</span>
          </div>
       </div>
    </div>
  );
};

const FooterShelf = ({ title, links, color }: any) => {
  const brandColor = (COLORS as any)[color];
  return (
    <div className="space-y-12 min-w-[200px]">
       <h4 className={`text-[13px] font-black uppercase tracking-[0.8em]`} style={{ color: brandColor }}>{title}</h4>
       <ul className="space-y-8">
          {links.map((link: string) => (
             <li key={link} className="text-[15px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer tracking-widest hover:translate-x-4">{link}</li>
          ))}
       </ul>
    </div>
  );
};

export default App;
