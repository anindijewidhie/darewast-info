
import React, { useState, useEffect } from 'react';
import { MediaItem, Language } from '../types';
import { COLORS, TRANSLATIONS, cleanPunctuation } from '../constants';
import { getInteractiveFeatures } from '../services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";

interface MediaViewerProps {
  item: MediaItem;
  lang: Language;
  onClose: () => void;
  onMasteryGained: (category: string) => void;
  noPunct?: boolean;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ item, lang, onClose, onMasteryGained, noPunct }) => {
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'insights' | 'quiz'>('content');
  const [isReading, setIsReading] = useState(false);
  
  const t = (key: string) => {
    const raw = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
    return noPunct ? cleanPunctuation(raw) : raw;
  };

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getInteractiveFeatures(item.description, lang);
        setFeatures(res);
      } catch (e) {
        console.error("Failed to load interactive features");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [item, lang]);

  const handleReadAloud = async () => {
    if (isReading) return;
    setIsReading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Read this educational content clearly and professionally in ${lang}: ${item.title}. ${item.description}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const bytes = atob(base64Audio);
        const len = bytes.length;
        const arrayBuffer = new ArrayBuffer(len);
        const uint8 = new Uint8Array(arrayBuffer);
        for (let i = 0; i < len; i++) uint8[i] = bytes.charCodeAt(i);
        
        const dataInt16 = new Int16Array(uint8.buffer);
        const frameCount = dataInt16.length;
        const buffer = audioCtx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsReading(false);
        source.start();
      }
    } catch (e) {
      console.error("TTS failed", e);
      setIsReading(false);
    }
  };

  const renderText = (text: string) => noPunct ? cleanPunctuation(text) : text;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all" aria-label="Close Viewer">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{item.type} Mastery</span>
              <div className="w-1 h-1 rounded-full bg-white/20"></div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{item.duration}m Duration</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white lowercase tracking-tight">{renderText(item.title)}</h2>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleReadAloud} 
            disabled={isReading}
            className={`px-8 py-3 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all lowercase flex items-center gap-3 ${isReading ? 'animate-pulse' : ''}`}
          >
            {isReading ? '🎙️' : '🔊'} {t('readAloud')}
          </button>
          <button onClick={() => { onMasteryGained(item.category); onClose(); }} className="px-8 py-3 bg-primary text-slate-950 font-black rounded-2xl hover:scale-105 transition-all lowercase">complete mastery</button>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-grow overflow-y-auto no-scrollbar p-12 lg:p-20 flex flex-col items-center">
          <div className="max-w-4xl w-full">
            {item.type === 'video' || item.type === 'series' || item.type === 'film' ? (
              <div className="aspect-video w-full bg-black rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl mb-12">
                <div className="w-full h-full flex items-center justify-center relative">
                   <img src={item.coverImage} className="w-full h-full object-cover opacity-50 blur-sm" alt="" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                         <svg className="w-10 h-10 text-primary ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[3/4] w-full max-w-2xl mx-auto bg-white/5 rounded-[4rem] p-20 border border-white/10 shadow-3xl mb-12 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-8">
                 <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center text-5xl">📖</div>
                 <h3 className="text-4xl font-extrabold text-white lowercase tracking-tighter leading-tight max-w-md">{renderText(item.title)}</h3>
                 <p className="text-white/40 text-sm font-medium uppercase tracking-[0.5em]">Digitized Mastery Component</p>
              </div>
            )}

            <div className="prose prose-invert prose-xl max-w-none text-white/70 font-medium leading-relaxed lowercase">
               <p className="mb-8">{renderText(item.description)}</p>
               <p className="mb-8">{renderText(`This pedagogical artifact has been vetted for objective truth. It explores the intricate connections between ${item.topic} and ${item.theme}, providing a structured pathway for deep understanding.`)}</p>
               {features?.visualMetaphor && (
                 <div className="my-16 p-10 bg-tertiary/10 rounded-[3rem] border border-tertiary/20 text-center">
                    <span className="text-[10px] font-black uppercase text-tertiary tracking-[0.5em] block mb-4">Visual Metaphor</span>
                    <p className="text-2xl font-extrabold text-white italic leading-tight">"{renderText(features.visualMetaphor)}"</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="w-[450px] border-l border-white/10 bg-slate-900/50 backdrop-blur-xl p-10 flex flex-col">
           <div className="flex bg-white/5 p-1.5 rounded-2xl mb-10">
              <button onClick={() => setActiveTab('content')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'content' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40'}`}>hotspots</button>
              <button onClick={() => setActiveTab('quiz')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'quiz' ? 'bg-white text-slate-900 shadow-xl' : 'text-white/40'}`}>mastery check</button>
           </div>

           <div className="flex-grow overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 opacity-40 animate-pulse">
                   <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary">extracting truth nodes...</p>
                </div>
              ) : (
                <div className="space-y-8">
                   {activeTab === 'content' && features?.hotspots.map((h: any, i: number) => (
                      <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all group cursor-default">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(79,209,197,0.8)]"></div>
                            <span className="text-lg font-extrabold text-white lowercase tracking-tight">{renderText(h.term)}</span>
                         </div>
                         <p className="text-sm text-white/50 leading-relaxed font-medium lowercase">{renderText(h.explanation)}</p>
                      </div>
                   ))}

                   {activeTab === 'quiz' && (
                     <div className="space-y-10">
                        {features?.quiz.map((q: any, i: number) => (
                          <div key={i} className="space-y-6">
                             <h4 className="text-xl font-extrabold text-white lowercase leading-tight">{renderText(q.question)}</h4>
                             <div className="grid grid-cols-1 gap-3">
                                {q.options.map((opt: string, j: number) => (
                                  <button key={j} className="text-left px-6 py-4 bg-white/5 rounded-2xl text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10 transition-all lowercase">{renderText(opt)}</button>
                                ))}
                             </div>
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
