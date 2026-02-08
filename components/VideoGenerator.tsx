
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
  const [isDragging, setIsDragging] = useState(false);

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
      'synthesizing mastery neurons...', 
      'rendering pedagogical frames...',
      'aligning visual truth nodes...', 
      'finalizing broadcast fidelity...'
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
            type: 'video', duration: 15, coverImage: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?q=80&w=800&auto=format&fit=crop',
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
      id: `upload-${Date.now()}`, title: uploadTitle, author: 'Human Contributor',
      type: 'video', duration: 30, coverImage: `https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop`,
      sourceUrl: URL.createObjectURL(uploadFile), category: uploadSubject, topic: uploadTopic, theme: uploadTheme, genre: uploadGenre,
      description: `${uploadGenre} regarding ${uploadTopic} in the context of ${uploadTheme}.`, ageRating: '3+', isHumanMade: true
    });
    setUploadFile(null); 
    setUploadTitle(''); 
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 5000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const isPromptChanged = prompt !== checkedPrompt;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 transition-all ${isAccessible ? 'p-12' : 'p-10'}`}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.8rem] bg-primary/10 flex items-center justify-center text-primary text-3xl shadow-inner">🎥</div>
          <div>
            <h2 className="text-3xl font-extrabold lowercase tracking-tight text-slate-900 dark:text-slate-50">{t('visionStudio')}</h2>
            <p className="text-[10px] font-extrabold text-primary uppercase tracking-[0.3em]">Pedagogical Broadcast Synthesis</p>
          </div>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700">
          <button onClick={() => setActiveSubTab('ai')} className={`px-8 py-3 rounded-xl text-[10px] font-extrabold uppercase transition-all flex items-center gap-2 ${activeSubTab === 'ai' ? 'bg-white dark:bg-slate-700 shadow-xl text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary/60'}`}>
            <span className="text-lg">✨</span> AI Vision
          </button>
          <button onClick={() => setActiveSubTab('upload')} className={`px-8 py-3 rounded-xl text-[10px] font-extrabold uppercase transition-all flex items-center gap-2 ${activeSubTab === 'upload' ? 'bg-white dark:bg-slate-700 shadow-xl text-secondary' : 'text-slate-400 dark:text-slate-500 hover:text-secondary/60'}`}>
            <span className="text-lg">🛡️</span> Human Upload
          </button>
        </div>
      </div>

      {/* Persistent Human-Centric Banner */}
      <div className="mb-12 p-6 bg-primary/5 dark:bg-primary/10 rounded-[2rem] border border-primary/20 flex items-center gap-5 shadow-sm group hover:border-primary/40 transition-all">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-inner">🛡️</div>
        <div className="space-y-1">
          <h4 className="text-[11px] font-black uppercase text-primary tracking-[0.2em]">{t('humanCentricTitle')}</h4>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 lowercase leading-relaxed">
            {t('humanCentricDescription')} we prioritize human expertise to ensure systematic mastery and authentic truth nodes in our media archive.
          </p>
        </div>
      </div>

      {activeSubTab === 'ai' ? (
        <div className="space-y-12">
          {!hasKey ? (
            <div className="py-24 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-900/10 rounded-full flex items-center justify-center mb-8 text-4xl shadow-inner animate-pulse">🔑</div>
              <h3 className="text-3xl font-extrabold lowercase mb-4 text-slate-900 dark:text-slate-50">API Authentication Required</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm lowercase leading-relaxed">High-fidelity video generation requires a paid Gemini API key. Please authorize your session to begin.</p>
              <button onClick={handleOpenKeySelection} className="px-12 py-5 bg-yellow-500 text-white font-extrabold rounded-[2rem] shadow-2xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all lowercase text-lg">select api key</button>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="mt-6 text-[10px] font-black uppercase text-slate-400 hover:text-primary tracking-widest underline decoration-2 underline-offset-4">Learn about billing</a>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-slate-50 dark:bg-slate-950 p-10 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 px-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.3em]">Mastery Aspect Ratio</label>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                          {(['16:9', '9:16'] as const).map(ratio => (
                            <button 
                              key={ratio} 
                              onClick={() => setAspectRatio(ratio)} 
                              className={`relative overflow-hidden group flex flex-col items-center justify-center p-8 rounded-[2.5rem] font-black text-[10px] uppercase transition-all border-2 ${aspectRatio === ratio ? 'bg-white dark:bg-slate-900 border-primary text-primary shadow-2xl scale-[1.02]' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-primary/40'}`}
                            >
                               <div className={`mb-5 border-2 ${aspectRatio === ratio ? 'border-primary' : 'border-slate-300 dark:border-slate-700'} ${ratio === '16:9' ? 'w-16 h-9' : 'w-9 h-16'} rounded-lg transition-all shadow-sm`}></div>
                               {ratio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                            </button>
                          ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 px-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.3em]">Mastery Resolution</label>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                          {(['720p', '1080p'] as const).map(res => (
                            <button 
                              key={res} 
                              onClick={() => setResolution(res)} 
                              className={`relative overflow-hidden py-9 rounded-[2.5rem] font-black text-[11px] uppercase transition-all border-2 ${resolution === res ? 'bg-white dark:bg-slate-900 border-primary text-primary shadow-2xl scale-[1.02]' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:border-primary/40'}`}
                            >
                               <span className="text-xl mb-1 block">{res === '1080p' ? 'HD+' : 'HD'}</span>
                               {res}
                            </button>
                          ))}
                      </div>
                    </div>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-end px-6">
                     <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-widest">{t('promptLabel')}</label>
                     <button onClick={handleIdeatePrompts} className="text-[10px] font-black text-primary lowercase hover:underline underline-offset-4 decoration-2">get smart mastery ideas</button>
                  </div>
                  <textarea 
                    value={prompt} 
                    onChange={e => setPrompt(e.target.value)} 
                    placeholder="Describe the pedagogical vision in high detail. Focus on clarity and scholarly truth..." 
                    className="w-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-[4rem] p-12 focus:ring-8 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none h-64 font-medium lowercase text-slate-900 dark:text-slate-50 shadow-inner placeholder:text-slate-300" 
                  />
               </div>
               {smartSuggestions.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 px-2">
                     {smartSuggestions.map((s, i) => (
                       <button key={i} onClick={() => setPrompt(s)} className="text-left p-6 bg-primary/5 rounded-[2rem] border border-primary/10 hover:bg-primary/10 hover:border-primary/30 transition-all shadow-sm group">
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-primary transition-colors">"{s}"</p>
                       </button>
                     ))}
                  </div>
               )}
               {!videoUrl && !isGenerating && (
                 <button onClick={handleCheckQuality} disabled={!prompt || isCheckingQuality} className={`w-full py-8 rounded-[2.5rem] text-white font-extrabold transition-all active:scale-95 disabled:opacity-50 lowercase shadow-3xl shadow-primary/30 hover:scale-[1.01] ${isPromptChanged ? 'bg-primary text-slate-900' : 'bg-secondary'}`}>
                   {isCheckingQuality ? 'checking mastery quality...' : (qualityResult && !isPromptChanged) ? 're-analyze vision' : 'verify prompt quality'}
                 </button>
               )}
               {qualityResult && !isCheckingQuality && !isGenerating && !videoUrl && (
                  <div className="animate-in slide-in-from-top-4 duration-500">
                     <div className="p-12 bg-slate-50 dark:bg-slate-950 rounded-[4rem] border-2 border-primary/20 shadow-2xl space-y-10">
                        <div className="flex items-center justify-between mb-10">
                           <div className="flex flex-col gap-1">
                              <h4 className="font-extrabold text-primary text-xl lowercase">prompt quality review</h4>
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Global Pedagogy Standard</span>
                           </div>
                           <div className="w-20 h-20 rounded-3xl bg-primary text-slate-950 flex items-center justify-center font-black text-3xl shadow-2xl shadow-primary/30">{qualityResult.score}</div>
                        </div>
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed px-2">"{qualityResult.feedback}"</p>
                        <div className="space-y-4">
                           {qualityResult.suggestions.map((suggestion, idx) => (
                              <div key={idx} className="flex items-start gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 lowercase leading-relaxed">
                                 <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                                 <span>{suggestion}</span>
                              </div>
                           ))}
                        </div>
                        <button onClick={handleGenerate} className="w-full py-8 bg-primary text-slate-950 font-extrabold rounded-[2.5rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all lowercase text-xl">Generate Broadcast ({resolution})</button>
                     </div>
                  </div>
               )}
               {isGenerating && (
                 <div className="py-24 flex flex-col items-center justify-center gap-10 animate-pulse text-center">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-[6px] border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-primary font-black lowercase tracking-[0.3em] text-xl">{loadingMessage}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Synthesis in Progress • {resolution}</p>
                    </div>
                 </div>
               )}
               {videoUrl && (
                 <div className="space-y-10 animate-in zoom-in-95 duration-700">
                    <div className={`relative w-full bg-black rounded-[4rem] overflow-hidden border-[16px] border-slate-100 dark:border-slate-800 shadow-3xl ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[80vh] mx-auto'}`}>
                       <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
                       <div className="absolute top-8 left-8 right-8 flex justify-center pointer-events-none">
                          <div className="px-6 py-2 bg-tertiary/20 backdrop-blur-3xl border border-white/20 rounded-full flex items-center gap-3 shadow-2xl">
                             <span className="text-lg">✨</span>
                             <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">AI Pedagogical Synthesis</span>
                          </div>
                       </div>
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
           <div 
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             className={`relative aspect-video border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center p-20 group transition-all cursor-pointer shadow-inner ${isDragging ? 'border-secondary bg-secondary/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-secondary/50'}`} 
             onClick={() => fileInputRef.current?.click()}
           >
              <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} />
              <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-all text-5xl shadow-xl border border-slate-100 dark:border-slate-700 ${uploadFile ? 'bg-secondary text-white' : 'bg-white dark:bg-slate-800 text-secondary'}`}>
                {uploadFile ? '✅' : '📁'}
              </div>
              <div className="text-center space-y-2">
                <p className="font-extrabold text-slate-500 dark:text-slate-400 lowercase text-xl">
                  {uploadFile ? uploadFile.name : 'drop mastery video file or click to browse'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Broadcast-ready files (MP4, MOV, WEBM)</p>
              </div>
              <div className="absolute top-8 left-8">
                 <div className="px-5 py-2 bg-secondary/10 backdrop-blur-xl border border-secondary/20 rounded-2xl flex items-center gap-3">
                    <span className="text-lg">🛡️</span>
                    <span className="text-[9px] font-black text-secondary uppercase tracking-widest">Human Truth safehouse</span>
                 </div>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50 dark:bg-slate-950 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-inner">
             <div className="space-y-5 md:col-span-2">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">Broadcast Master Title</label>
                <input 
                  type="text" 
                  required 
                  value={uploadTitle} 
                  onChange={e => setUploadTitle(e.target.value)} 
                  placeholder="e.g. The Architecture of Neural Pathways" 
                  className="w-full p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary focus:ring-8 focus:ring-secondary/10 outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm transition-all" 
                />
             </div>
             <div className="space-y-5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">Scholarly Subject</label>
                <select value={uploadSubject} onChange={e => setUploadSubject(e.target.value)} className="w-full p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm cursor-pointer transition-colors">
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toLowerCase()}</option>)}
                </select>
             </div>
             <div className="space-y-5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">Core Topic</label>
                <select value={uploadTopic} onChange={e => setUploadTopic(e.target.value)} className="w-full p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm cursor-pointer transition-colors">
                  {TOPICS.map(top => <option key={top} value={top}>{top.toLowerCase()}</option>)}
                </select>
             </div>
             <div className="space-y-5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">Mastery Theme</label>
                <select value={uploadTheme} onChange={e => setUploadTheme(e.target.value)} className="w-full p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm cursor-pointer transition-colors">
                  {THEMES.map(theme => <option key={theme} value={theme}>{theme.toLowerCase()}</option>)}
                </select>
             </div>
             <div className="space-y-5">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-[0.3em] px-6">Content Genre</label>
                <select value={uploadGenre} onChange={e => setUploadGenre(e.target.value)} className="w-full p-7 rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-transparent focus:border-secondary outline-none font-extrabold lowercase text-slate-900 dark:text-slate-50 shadow-sm cursor-pointer transition-colors">
                  {GENRES.map(genre => <option key={genre} value={genre}>{genre.toLowerCase()}</option>)}
                </select>
             </div>
           </div>
           <button type="submit" disabled={!uploadFile || !uploadTitle} className="w-full py-8 bg-secondary text-white font-extrabold rounded-[3rem] shadow-3xl shadow-secondary/30 hover:scale-[1.01] transition-all lowercase text-xl disabled:opacity-50">contribute broadcast to global network</button>
           {uploadSuccess && (
             <div className="p-8 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-[3rem] text-center font-extrabold lowercase border-2 border-green-200 dark:border-green-900 animate-in zoom-in-95 shadow-xl">
                Broadcase contributed. human truth verification is in progress.
             </div>
           )}
        </form>
      )}
    </div>
  );
};

export default VideoGenerator;
