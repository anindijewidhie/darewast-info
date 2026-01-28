
import { GoogleGenAI } from "@google/genai";
import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES, COLORS, GENRES, THEMES, TOPICS, TRANSLATIONS } from '../constants';
import { analyzePromptQuality, generateVideoPrompts } from '../services/geminiService';
import { Language, MediaItem } from '../types';

interface VideoGeneratorProps {
  lang: Language;
  isAccessible?: boolean;
  onMediaAdded?: (item: MediaItem) => void;
}

interface QualityResult {
  score: number;
  feedback: string;
  suggestions: string[];
  criteria: {
    clarity: number;
    educationalValue: number;
    pedagogyAdherence: number;
  };
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ lang, isAccessible, onMediaAdded }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'upload'>('ai'); 
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const [aiSubject, setAiSubject] = useState(CATEGORIES[0]);
  const [aiTopic, setAiTopic] = useState(TOPICS[0]);
  const [aiTheme, setAiTheme] = useState(THEMES[0]);
  const [aiGenre, setAiGenre] = useState(GENRES[0]);
  const [isIdeating, setIsIdeating] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qualityResult, setQualityResult] = useState<QualityResult | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [checkedPrompt, setCheckedPrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState(CATEGORIES[0]);
  const [uploadTopic, setUploadTopic] = useState(TOPICS[0]);
  const [uploadGenre, setUploadGenre] = useState(GENRES[0]);
  const [uploadTheme, setUploadTheme] = useState(THEMES[0]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleOpenKeySelection = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleIdeatePrompts = async () => {
    setIsIdeating(true);
    setSmartSuggestions([]);
    try {
      const suggestions = await generateVideoPrompts({
        subject: aiSubject, topic: aiTopic, theme: aiTheme, genre: aiGenre
      }, lang);
      setSmartSuggestions(suggestions);
    } catch (error) { console.error("Ideation failed", error); } finally { setIsIdeating(false); }
  };

  const handleCheckQuality = async () => {
    if (!prompt) return;
    setIsCheckingQuality(true);
    try {
      const result = await analyzePromptQuality(prompt, lang);
      setQualityResult(result);
      setCheckedPrompt(prompt);
    } catch (error) { console.error("Quality check failed", error); } finally { setIsCheckingQuality(false); }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setVideoUrl(null);

    const reassuringMessages = [
      t('reassuringMessage1'), t('reassuringMessage2'),
      t('reassuringMessage3'), t('reassuringMessage4')
    ];
    let msgIdx = 0;
    setLoadingMessage(reassuringMessages[0]);
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % reassuringMessages.length;
      setLoadingMessage(reassuringMessages[msgIdx]);
    }, 15000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `In darewast educational style: ${prompt}`,
        config: { numberOfVideos: 1, resolution, aspectRatio }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const fetchUrl = `${downloadLink}&key=${process.env.API_KEY}`;
        setVideoUrl(fetchUrl);
        if (onMediaAdded) {
          onMediaAdded({
            id: `ai-${Date.now()}`, title: prompt.substring(0, 30) + '...', author: 'darewast ai',
            type: 'video', duration: 15, coverImage: 'https://picsum.photos/seed/aivideo/400/300',
            sourceUrl: fetchUrl, category: aiSubject, topic: aiTopic, theme: aiTheme, genre: aiGenre,
            description: prompt, ageRating: '3+', isHumanMade: false
          });
        }
      }
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found.")) {
        setHasKey(false); await (window as any).aistudio.openSelectKey(); setHasKey(true);
      } else { alert("Generation failed. Please try again."); }
    } finally { setIsGenerating(false); clearInterval(msgInterval); }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || !onMediaAdded) return;
    onMediaAdded({
      id: `upload-${Date.now()}`, title: uploadTitle, author: 'human contributor',
      type: 'video', duration: 30, coverImage: `https://picsum.photos/seed/upload-${Date.now()}/400/300`,
      sourceUrl: URL.createObjectURL(uploadFile), category: uploadSubject, topic: uploadTopic, theme: uploadTheme, genre: uploadGenre,
      description: `${uploadGenre} regarding ${uploadTopic}.`, ageRating: '3+', isHumanMade: true
    });
    setUploadFile(null); setUploadTitle(''); setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 5000);
  };

  const isPromptChanged = prompt !== checkedPrompt;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 transition-colors ${isAccessible ? 'p-12' : 'p-10'}`}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.8rem] bg-primary/10 flex items-center justify-center text-primary text-3xl shadow-inner">🎥</div>
          <div>
            <h2 className="text-3xl font-extrabold lowercase tracking-tight text-slate-900 dark:text-slate-50">{t('videoGen')}</h2>
            <p className="text-[10px] font-extrabold text-primary uppercase tracking-[0.3em]">{t('humanFirst')}</p>
          </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700">
          <button onClick={() => setActiveSubTab('ai')} className={`px-6 py-3 rounded-xl text-[10px] font-extrabold uppercase transition-all ${activeSubTab === 'ai' ? 'bg-white dark:bg-slate-700 shadow-xl text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary/60'}`}>{t('aiGenerator')}</button>
          <button onClick={() => setActiveSubTab('upload')} className={`px-6 py-3 rounded-xl text-[10px] font-extrabold uppercase transition-all ${activeSubTab === 'upload' ? 'bg-white dark:bg-slate-700 shadow-xl text-secondary' : 'text-slate-400 dark:text-slate-500 hover:text-secondary/60'}`}>{t('mediaUploader')}</button>
        </div>
      </div>

      {activeSubTab === 'ai' ? (
        <div className="space-y-12">
          {!hasKey ? (
            <div className="py-24 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-900/10 rounded-full flex items-center justify-center mb-8 text-4xl shadow-inner animate-pulse">🔑</div>
              <h3 className="text-3xl font-extrabold lowercase mb-4 text-slate-900 dark:text-slate-50">{t('selectKey')}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm lowercase leading-relaxed">High-fidelity video generation requires a paid Gemini API key. Please authorize your session to begin.</p>
              <button onClick={handleOpenKeySelection} className="px-12 py-5 bg-yellow-500 text-white font-extrabold rounded-[2rem] shadow-2xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all lowercase text-lg">{t('selectKey')}</button>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50 dark:bg-slate-950 p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div className="space-y-6">
                     <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-4">Display Mastery Aspect Ratio</label>
                     <div className="grid grid-cols-2 gap-5">
                        {(['16:9', '9:16'] as const).map(ratio => (
                          <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`relative overflow-hidden group flex flex-col items-center justify-center p-6 rounded-3xl font-extrabold text-[10px] uppercase transition-all border-2 ${aspectRatio === ratio ? 'bg-primary border-primary text-slate-900 shadow-2xl' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-primary/40'}`}>
                             <div className={`mb-4 border-2 ${aspectRatio === ratio ? 'border-slate-900' : 'border-slate-200 dark:border-slate-700'} ${ratio === '16:9' ? 'w-12 h-7' : 'w-7 h-12'} rounded-md transition-colors`}></div>
                             {ratio === '16:9' ? 'landscape' : 'portrait'}
                          </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-6">
                     <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-4">Mastery Resolution</label>
                     <div className="grid grid-cols-2 gap-5">
                        {(['720p', '1080p'] as const).map(res => (
                          <button key={res} onClick={() => setResolution(res)} className={`py-7 rounded-3xl font-extrabold text-[10px] uppercase transition-all border-2 ${resolution === res ? 'bg-primary border-primary text-slate-900 shadow-2xl' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-primary/40'}`}>
                             {res}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="space-y-5">
                  <div className="flex justify-between items-end px-4">
                     <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-widest">{t('promptLabel')}</label>
                     <button onClick={handleIdeatePrompts} className="text-[10px] font-extrabold text-primary lowercase hover:underline transition-all">{t('getSmartIdeas')}</button>
                  </div>
                  <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="describe the pedagogical vision in detail..." className="w-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-[3rem] p-12 focus:ring-8 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none h-56 font-medium lowercase text-slate-900 dark:text-slate-50 shadow-inner" />
               </div>

               {smartSuggestions.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 px-2">
                     {smartSuggestions.map((s, i) => (
                       <button key={i} onClick={() => setPrompt(s)} className="text-left p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 hover:bg-primary/10 hover:border-primary/30 transition-all shadow-sm">
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">"{s}"</p>
                       </button>
                     ))}
                  </div>
               )}

               {!videoUrl && !isGenerating && (
                 <button onClick={handleCheckQuality} disabled={!prompt || isCheckingQuality} className={`w-full py-7 rounded-[2.5rem] text-white font-extrabold transition-all active:scale-95 disabled:opacity-50 lowercase shadow-3xl shadow-primary/30 hover:scale-[1.01] ${isPromptChanged ? 'bg-primary text-slate-900' : 'bg-secondary'}`}>
                   {isCheckingQuality ? t('checkingQuality') : (qualityResult && !isPromptChanged) ? t('reAnalyze') : t('qualityCheck')}
                 </button>
               )}

               {qualityResult && !isCheckingQuality && !isGenerating && !videoUrl && (
                  <div className="animate-in slide-in-from-top-4 duration-500 space-y-10">
                     <div className="p-12 bg-slate-50 dark:bg-slate-950 rounded-[4rem] border-2 border-primary/20 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-colors"></div>
                        <div className="flex items-center justify-between mb-10 relative z-10">
                           <div className="flex flex-col gap-1">
                              <h4 className="font-extrabold text-primary text-xl lowercase">{t('qualityTitle')}</h4>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Global Pedagogy Standard</span>
                           </div>
                           <div className="flex items-center gap-6">
                              {isPromptChanged && (
                                <button onClick={handleCheckQuality} className="px-6 py-3 bg-primary/10 text-primary text-[10px] font-extrabold rounded-2xl uppercase hover:bg-primary hover:text-slate-950 transition-all shadow-lg border border-primary/20">
                                   {t('reAnalyze')}
                                </button>
                              )}
                              <div className="w-20 h-20 rounded-3xl bg-primary text-slate-950 flex items-center justify-center font-black text-3xl shadow-2xl shadow-primary/30">{qualityResult.score}</div>
                           </div>
                        </div>
                        <div className="space-y-8 mb-12 relative z-10">
                           <p className="text-lg font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed px-2">"{qualityResult.feedback}"</p>
                           <div className="space-y-4">
                              {qualityResult.suggestions.map((suggestion, idx) => (
                                 <div key={idx} className="flex items-start gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 lowercase leading-relaxed">
                                    <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                                    <span>{suggestion}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                        <button onClick={handleGenerate} className="w-full py-8 bg-primary text-slate-950 font-extrabold rounded-[2.5rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all lowercase text-xl relative z-10">{t('proceedToGen')}</button>
                     </div>
                  </div>
               )}

               {isGenerating && (
                 <div className="py-24 flex flex-col items-center justify-center gap-10 animate-pulse text-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-[6px] border-primary border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-5 border-[6px] border-primary/20 border-b-transparent rounded-full animate-spin-reverse"></div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-primary font-black lowercase tracking-[0.3em] text-xl">{loadingMessage}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Mastery Synthesis in Progress</p>
                    </div>
                 </div>
               )}

               {videoUrl && (
                 <div className="space-y-10 animate-in zoom-in-95 duration-700">
                    <div className={`w-full bg-black rounded-[4rem] overflow-hidden border-[16px] border-slate-100 dark:border-slate-800 shadow-3xl ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[80vh] mx-auto'}`}>
                       <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5">
                       <button onClick={() => { setVideoUrl(null); setQualityResult(null); }} className="flex-grow py-7 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold rounded-[2.5rem] lowercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-lg shadow-sm">create another vision</button>
                       <a href={videoUrl} download className="flex-grow py-7 bg-primary text-slate-950 font-extrabold rounded-[2.5rem] lowercase text-center shadow-3xl shadow-primary/30 text-lg">download broadcast mastery</a>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleUpload} className="space-y-12 animate-in fade-in duration-500">
           {/* Enhanced Upload Zone */}
           <div className="aspect-video border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem] flex flex-col items-center justify-center p-20 group hover:border-secondary/50 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 shadow-inner" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              <div className="w-28 h-28 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:shadow-3xl transition-all text-5xl shadow-xl border border-slate-100 dark:border-slate-700 text-secondary">📁</div>
              <div className="text-center space-y-2">
                <p className="font-extrabold text-slate-500 dark:text-slate-400 lowercase text-xl">{uploadFile ? uploadFile.name : t('uploadLabel')}</p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">MP4, MOV supported up to 500MB</p>
              </div>
           </div>

           {/* Granular Metadata Form */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50 dark:bg-slate-950 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-inner">
             <div className="space-y-5 md:col-span-2">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">{t('videoTitle')}</label>
                <input type="text" required value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="enter descriptive mastery title..." className="w-full p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary focus:ring-8 focus:ring-secondary/10 outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm transition-all" />
             </div>

             <div className="space-y-5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">{t('videoSubject')}</label>
                <select value={uploadSubject} onChange={e => setUploadSubject(e.target.value)} className="w-full p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toLowerCase()}</option>)}
                </select>
             </div>

             <div className="space-y-5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">{t('videoTopic')}</label>
                <select value={uploadTopic} onChange={e => setUploadTopic(e.target.value)} className="w-full p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {TOPICS.map(top => <option key={top} value={top}>{top.toLowerCase()}</option>)}
                </select>
             </div>

             <div className="space-y-5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">Mastery Theme</label>
                <select value={uploadTheme} onChange={e => setUploadTheme(e.target.value)} className="w-full p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {THEMES.map(theme => <option key={theme} value={theme}>{theme.toLowerCase()}</option>)}
                </select>
             </div>

             <div className="space-y-5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">Mastery Genre</label>
                <select value={uploadGenre} onChange={e => setUploadGenre(e.target.value)} className="w-full p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {GENRES.map(genre => <option key={genre} value={genre}>{genre.toLowerCase()}</option>)}
                </select>
             </div>
           </div>

           <button type="submit" disabled={!uploadFile || !uploadTitle} className="w-full py-8 bg-secondary text-white font-extrabold rounded-[3rem] shadow-3xl shadow-secondary/30 hover:scale-[1.01] transition-all lowercase text-xl disabled:opacity-50">{t('addtoLibrary')}</button>
           
           {uploadSuccess && (
             <div className="p-8 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-[3rem] text-center font-extrabold lowercase border-2 border-green-200 dark:border-green-900 animate-in zoom-in-95 shadow-xl">
                Mastery media successfully contributed to the global darewast library.
             </div>
           )}
        </form>
      )}
      <style>{`
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 2.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default VideoGenerator;
