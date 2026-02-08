
import React, { useState } from 'react';
import { COLORS, TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { synthesizeImage, analyzePromptQuality } from '../services/geminiService';

interface ImageGeneratorProps {
  lang: Language;
  isAccessible?: boolean;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ lang, isAccessible }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [qualityResult, setQualityResult] = useState<any>(null);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

  const handleVerifyPrompt = async () => {
    if (!prompt) return;
    setIsCheckingQuality(true);
    try {
      const res = await analyzePromptQuality(prompt, lang);
      setQualityResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingQuality(false);
    }
  };

  const handleSynthesize = async () => {
    if (!prompt) return;
    setIsSynthesizing(true);
    setResultImage(null);
    try {
      const base64 = await synthesizeImage(prompt, aspectRatio);
      setResultImage(`data:image/png;base64,${base64}`);
    } catch (e) {
      alert("Synthesis failed. Please ensure the prompt is pedagogical.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className={`space-y-12 animate-in fade-in duration-700`}>
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[1.8rem] bg-secondary/10 flex items-center justify-center text-secondary text-3xl shadow-inner">🎨</div>
            <div>
              <h2 className="text-3xl font-extrabold lowercase tracking-tight text-slate-900 dark:text-slate-50">{t('imageGen')}</h2>
              <p className="text-[10px] font-extrabold text-secondary uppercase tracking-[0.3em]">{t('imageGenDesc')}</p>
            </div>
          </div>
        </div>
        <div className="mb-12 p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border-2 border-dashed border-primary/20 flex items-center gap-6 shadow-sm">
           <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl shrink-0">🛡️</div>
           <div className="space-y-1">
              <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.3em]">{t('humanCentricTitle')}</h4>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 lowercase leading-relaxed">
                 {t('humanCentricDescription')}
              </p>
           </div>
        </div>
        <div className="space-y-10">
          <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-inner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] px-4">Aspect Ratio</label>
                <div className="grid grid-cols-5 gap-3">
                  {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map(ratio => (
                    <button 
                      key={ratio} 
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-4 rounded-2xl font-black text-[10px] transition-all border-2 ${aspectRatio === ratio ? 'bg-secondary border-secondary text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em] px-4">{t('promptLabel')}</label>
                <textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe the visual mastery required for your content or profile... Focus on objective education."
                  className="w-full h-32 p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-secondary outline-none transition-all font-medium lowercase shadow-inner"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleVerifyPrompt}
              disabled={!prompt || isCheckingQuality}
              className="flex-1 py-6 bg-slate-100 dark:bg-slate-800 text-slate-500 font-extrabold rounded-3xl lowercase hover:bg-slate-200 transition-all disabled:opacity-30"
            >
              {isCheckingQuality ? 'analyzing truth...' : 'verify visual quality'}
            </button>
            <button 
              onClick={handleSynthesize}
              disabled={!prompt || isSynthesizing}
              className="flex-1 py-6 bg-secondary text-white font-extrabold rounded-3xl shadow-2xl shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all lowercase disabled:opacity-30"
            >
              {isSynthesizing ? 'synthesizing frames...' : t('generateImage')}
            </button>
          </div>
          {qualityResult && (
            <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 animate-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-black uppercase text-primary tracking-widest">Mastery Quality Score: {qualityResult.score}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">"{qualityResult.feedback}"</p>
            </div>
          )}
          {isSynthesizing && (
            <div className="py-20 flex flex-col items-center justify-center gap-6 animate-pulse">
              <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase text-secondary tracking-widest">Rendering Visual Mastery...</p>
            </div>
          )}
          {resultImage && (
            <div className="space-y-8 animate-in zoom-in-95 duration-700">
              <div className="max-w-2xl mx-auto rounded-[4rem] overflow-hidden border-[16px] border-white dark:border-slate-800 shadow-3xl">
                <img src={resultImage} alt="Synthesized Masterpiece" className="w-full h-auto" />
              </div>
              <div className="flex justify-center">
                 <a 
                   href={resultImage} 
                   download="darewast-mastery-visual.png"
                   className="px-12 py-5 bg-primary text-slate-950 font-extrabold rounded-3xl shadow-xl hover:scale-105 transition-all lowercase"
                 >
                   download pedagogical asset
                 </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
