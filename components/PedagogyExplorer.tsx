
import React, { useState, useMemo, useEffect } from 'react';
import { getPedagogyInsight } from '../services/geminiService';
import { CensorshipLevel, Language, SchoolSystemType, LearningContext } from '../types';
// Import cleanPunctuation for specialized accessibility mode
import { COLORS, CATEGORIES, TRANSLATIONS, SCHOOL_SYSTEMS, LEARNING_CONTEXTS, cleanPunctuation } from '../constants';

interface PedagogyExplorerProps {
  darkMode?: boolean;
  isAccessible?: boolean;
  lang: Language;
  censorship: CensorshipLevel;
  onInsightFetched?: () => void;
  // Add noPunct to interface to resolve TS error in App.tsx
  noPunct?: boolean;
}

const PedagogyExplorer: React.FC<PedagogyExplorerProps> = ({ isAccessible, lang, censorship, onInsightFetched, noPunct }) => {
  const [schoolSystem, setSchoolSystem] = useState<SchoolSystemType>('6-3-3');
  const [stage, setStage] = useState('');
  const [grade, setGrade] = useState('1');
  const [topic, setTopic] = useState(CATEGORIES[0]);
  const [learningContext, setLearningContext] = useState<LearningContext>('core');
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Enhanced translation helper that respects the noPunctuation accessibility setting
  const t = (key: string) => {
    const raw = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
    return noPunct ? cleanPunctuation(raw) : raw;
  };

  useEffect(() => {
    const availableStages = SCHOOL_SYSTEMS[schoolSystem];
    if (availableStages && availableStages.length > 0) {
      setStage(availableStages[0].name);
    }
  }, [schoolSystem]);

  useEffect(() => {
    setGrade('1');
  }, [stage]);

  const availableStages = useMemo(() => SCHOOL_SYSTEMS[schoolSystem] || [], [schoolSystem]);
  
  const currentStageGrades = useMemo(() => {
    const found = availableStages.find(s => s.name === stage);
    return found ? Array.from({ length: found.grades }, (_, i) => (i + 1).toString()) : [];
  }, [availableStages, stage]);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const res = await getPedagogyInsight(topic, schoolSystem, stage, grade, censorship, learningContext);
      setInsight(res);
      if (onInsightFetched) onInsightFetched();
    } catch (e) {
      setInsight("failed to fetch educational insight.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors ${isAccessible ? 'p-10' : 'p-6'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className={`rounded-2xl flex items-center justify-center ${isAccessible ? 'p-5' : 'p-3'}`} style={{ backgroundColor: `${COLORS.tertiary}20` }}>
          <svg className={isAccessible ? 'w-10 h-10' : 'w-6 h-6'} style={{ color: COLORS.tertiary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <h2 className={`font-black lowercase text-slate-900 dark:text-white ${isAccessible ? 'text-3xl' : 'text-xl'}`}>darewast pedagogy mode</h2>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8`}>
        <div className="flex flex-col">
          <label className={`block font-bold text-slate-700 dark:text-slate-400 mb-2 lowercase ${isAccessible ? 'text-lg' : 'text-xs'}`}>{t('schoolSystem')}</label>
          <select value={schoolSystem} onChange={(e) => setSchoolSystem(e.target.value as SchoolSystemType)} className={`w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none lowercase text-slate-900 dark:text-slate-100 font-bold transition-all ${isAccessible ? 'p-4 text-lg' : 'p-2 text-sm'}`}>
            {Object.keys(SCHOOL_SYSTEMS).map(sys => <option key={sys} value={sys}>Type {sys}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className={`block font-bold text-slate-700 dark:text-slate-400 mb-2 lowercase ${isAccessible ? 'text-lg' : 'text-xs'}`}>{t('educationStage')}</label>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className={`w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none lowercase text-slate-900 dark:text-slate-100 font-bold transition-all ${isAccessible ? 'p-4 text-lg' : 'p-2 text-sm'}`}>
            {availableStages.map(s => <option key={s.name} value={s.name}>{noPunct ? cleanPunctuation(s.name) : s.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className={`block font-bold text-slate-700 dark:text-slate-400 mb-2 lowercase ${isAccessible ? 'text-lg' : 'text-xs'}`}>{t('grade')}</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className={`w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none lowercase text-slate-900 dark:text-slate-100 font-bold transition-all ${isAccessible ? 'p-4 text-lg' : 'p-2 text-sm'}`}>
            {currentStageGrades.map(g => <option key={g} value={g}>{t('grade')} {g}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className={`block font-bold text-slate-700 dark:text-slate-400 mb-2 lowercase ${isAccessible ? 'text-lg' : 'text-xs'}`}>Subject</label>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} className={`w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none lowercase text-slate-900 dark:text-slate-100 font-bold transition-all ${isAccessible ? 'p-4 text-lg' : 'p-2 text-sm'}`}>
            {CATEGORIES.map(c => <option key={c} value={c}>{noPunct ? cleanPunctuation(c).toLowerCase() : c.toLowerCase()}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className={`block font-bold text-slate-700 dark:text-slate-400 mb-2 lowercase ${isAccessible ? 'text-lg' : 'text-xs'}`}>{t('learningContext')}</label>
          <select value={learningContext} onChange={(e) => setLearningContext(e.target.value as LearningContext)} className={`w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none lowercase text-slate-900 dark:text-slate-100 font-bold transition-all ${isAccessible ? 'p-4 text-lg' : 'p-2 text-sm'}`}>
            {LEARNING_CONTEXTS.map(ctx => <option key={ctx.value} value={ctx.value}>{t(ctx.value)}</option>)}
          </select>
        </div>
      </div>

      <button onClick={fetchInsight} disabled={loading} className={`w-full rounded-2xl text-white font-black transition-all active:scale-95 disabled:opacity-50 lowercase shadow-lg shadow-purple-500/20 hover:scale-[1.02] ${isAccessible ? 'py-6 text-2xl' : 'py-3 text-base'}`} style={{ backgroundColor: COLORS.tertiary }}>
        {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>consulting experts...</span> : t('getInsight')}
      </button>

      {insight && (
        <div className={`mt-10 bg-purple-50 dark:bg-slate-950 rounded-[2rem] border-2 border-purple-100 dark:border-slate-800 transition-all ${isAccessible ? 'p-10' : 'p-6'}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-300 rounded text-[10px] font-black uppercase tracking-widest">{censorship} censorship</span>
            <span className="px-2 py-0.5 bg-secondary/20 text-secondary-900 dark:text-secondary-100 rounded text-[10px] font-black uppercase tracking-widest">{t(learningContext)} mode</span>
          </div>
          <h3 className={`font-black text-purple-900 dark:text-purple-400 mb-4 lowercase ${isAccessible ? 'text-2xl' : 'text-lg'}`}>darewast learning pathway:</h3>
          <div className={`prose prose-purple dark:prose-invert leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200 font-medium ${isAccessible ? 'text-xl' : 'text-sm'}`}>
            {noPunct ? cleanPunctuation(insight) : insight}
          </div>
        </div>
      )}
    </div>
  );
};

export default PedagogyExplorer;
