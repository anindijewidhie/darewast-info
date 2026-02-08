
import React, { useState, useEffect, useRef } from 'react';
import { MediaItem, Language } from '../types';
import { COLORS, TRANSLATIONS, cleanPunctuation } from '../constants';
import { getInteractiveFeatures, analyzeVideoFrame } from '../services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";

interface MediaViewerProps {
  item: MediaItem;
  lang: Language;
  onClose: () => void;
  onMasteryGained: (category: string) => void;
  noPunct?: boolean;
}

const formatDuration = (mins: number) => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ item, lang, onClose, onMasteryGained, noPunct }) => {
  const [features, setFeatures] = useState<any>(null);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzingFrame, setAnalyzingFrame] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const t = (key: string) => {
    const raw = TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
    return noPunct ? cleanPunctuation(raw) : raw;
  };

  useEffect(() => {
    const fetchFeatures = async () => {
      setLoadingFeatures(true);
      try {
        const res = await getInteractiveFeatures(item.description, lang);
        setFeatures(res);
      } catch (e) {
        console.error("Failed to load pedagogical features", e);
      } finally {
        setLoadingFeatures(false);
      }
    };
    fetchFeatures();
  }, [item, lang]);

  const handleReadAloud = async () => {
    if (isReadingAloud) return;
    setIsReadingAloud(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const textToRead = noPunct ? cleanPunctuation(item.description) : item.description;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this pedagogical content clearly: ${textToRead}` }] }],
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
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsReadingAloud(false);
        source.start();
      }
    } catch (e) {
      console.error("Mastery speech synthesis failed", e);
      setIsReadingAloud(false);
    }
  };

  const handleAnalyzeFrame = async () => {
    if (!videoRef.current || analyzingFrame) return;
    setAnalyzingFrame(true);
    setAnalysis(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
        const res = await analyzeVideoFrame(base64Image, item.title, lang);
        setAnalysis(res);
      }
    } catch (e) {
      console.error("Vision analysis failed", e);
    } finally {
      setAnalyzingFrame(false);
    }
  };

  const isVideo = item.type === 'video' || item.type === 'film' || item.type === 'series';

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 overflow-y-auto">
      <div className="w-full max-w-7xl bg-white dark:bg-[#05070A] rounded-[4rem] shadow-4xl border border-slate-200 dark:border-white/5 flex flex-col max-h-[90vh] overflow-hidden relative animate-in zoom-in-95 duration-500">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl">
                {isVideo ? '🎬' : '📖'}
              </div>
              <div>
                <h2 className="text-2xl font-black lowercase tracking-tight">{noPunct ? cleanPunctuation(item.title) : item.title}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.author} • {formatDuration(item.duration)}</p>
              </div>
           </div>
           <button onClick={onClose} className="w-12 h-12 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
             <span className="text-2xl">✕</span>
           </button>
        </div>
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-grow bg-slate-50 dark:bg-black p-8 flex items-center justify-center overflow-hidden">
             {isVideo ? (
               <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl group">
                  <video 
                    ref={videoRef}
                    src={item.sourceUrl || "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={handleAnalyzeFrame}
                      disabled={analyzingFrame}
                      className="px-6 py-2.5 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      {analyzingFrame ? 'analyzing truth...' : 'analyze current frame'}
                    </button>
                  </div>
               </div>
             ) : (
               <div className="w-full max-w-3xl aspect-[3/4] bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-12 overflow-y-auto space-y-8">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.5em]">Digitalized Node Archive</span>
                    <button 
                      onClick={handleReadAloud}
                      disabled={isReadingAloud}
                      className="flex items-center gap-2 px-5 py-2 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50"
                    >
                      <span>🔊</span> {isReadingAloud ? 'reading aloud...' : 'synthesize speech'}
                    </button>
                  </div>
                  <h3 className="text-4xl font-black lowercase tracking-tighter leading-tight border-b-4 border-slate-100 dark:border-white/5 pb-8">{noPunct ? cleanPunctuation(item.title) : item.title}</h3>
                  <div className="space-y-6">
                    <p className="text-xl text-slate-700 dark:text-slate-300 font-medium leading-[1.8] lowercase">
                      {noPunct ? cleanPunctuation(item.description) : item.description}
                    </p>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Information anywhere, anytime. Our network ensures the fidelity of this {item.type} by using human-centric verification. 
                      Truth mastery in {item.category} requires a systematic exploration of {item.topic}, ensuring that every scholar can attain universal wisdom.
                    </p>
                  </div>
               </div>
             )}
          </div>
          <div className="w-full lg:w-[450px] border-l border-slate-100 dark:border-white/5 bg-white dark:bg-[#05070A] p-8 overflow-y-auto space-y-10 shadow-2xl">
             {analysis && (
               <div className="p-8 bg-primary/5 rounded-[3rem] border border-primary/20 animate-in slide-in-from-right-4 duration-500 space-y-6">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase text-primary tracking-widest">Expert Vision Insight</h4>
                    <button onClick={() => setAnalysis(null)} className="text-slate-400 text-xs">✕</button>
                 </div>
                 <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">"{analysis.scholarSummary}"</p>
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest">Key Observations:</p>
                      <ul className="space-y-2">
                        {analysis.keyInformation?.map((info: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                            <span>{info}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                 </div>
               </div>
             )}
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center text-xl">🎓</div>
                   <h3 className="text-sm font-black uppercase text-slate-400 tracking-[0.3em]">Pedagogy Master Hub</h3>
                </div>
                {loadingFeatures ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-4 animate-pulse">
                    <div className="w-10 h-10 border-4 border-tertiary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-tertiary uppercase tracking-widest">synthesizing logic track...</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {features?.hotspots && (
                      <div className="space-y-4">
                        <span className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em] px-2 opacity-60">Truth Hotspots:</span>
                        <div className="grid grid-cols-1 gap-4">
                          {features.hotspots.map((hs: any, i: number) => (
                            <div key={i} className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group hover:border-tertiary/40 transition-all cursor-help shadow-sm">
                               <h5 className="font-black text-slate-900 dark:text-white lowercase text-base group-hover:text-tertiary">{hs.term}</h5>
                               <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">{hs.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {features?.quiz && (
                      <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] px-2 opacity-60">Fidelity Mastery Check:</span>
                        <div className="space-y-8">
                          {features.quiz.map((q: any, i: number) => (
                            <div key={i} className="space-y-4">
                              <p className="text-[13px] font-extrabold text-slate-800 dark:text-slate-200 lowercase leading-relaxed">{q.question}</p>
                              <div className="grid grid-cols-1 gap-2">
                                {q.options?.map((opt: string, j: number) => (
                                  <button key={j} className="p-4 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 hover:border-secondary hover:text-secondary transition-all text-left uppercase tracking-widest">
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
             </div>
             <div className="pt-8 sticky bottom-0 bg-white dark:bg-[#05070A] pb-4">
                <button 
                  onClick={() => { onMasteryGained(item.category); onClose(); }} 
                  className="w-full py-7 bg-primary text-slate-950 font-black rounded-[2.5rem] shadow-4xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-xl lowercase"
                >
                  Conclude Node Mastery
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;
