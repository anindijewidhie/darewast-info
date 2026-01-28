
import React, { useRef, useState } from 'react';
import { scanMedia } from '../services/geminiService';
import { COLORS, TRANSLATIONS } from '../constants';
import { Language, CensorshipLevel } from '../types';

interface ScannerProps {
  onScanResult: (result: any) => void;
  darkMode?: boolean;
  isAccessible?: boolean;
  lang: Language;
  censorship: CensorshipLevel;
}

const Scanner: React.FC<ScannerProps> = ({ onScanResult, isAccessible, lang, censorship }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'universal' | 'historical'>('universal');
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('could not access camera. please check permissions.');
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsScanning(true);
    setSuccessResult(null);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
      try {
        const result = await scanMedia(base64Image, scanMode, censorship);
        setSuccessResult(result);
        onScanResult(result);
      } catch (err) {
        setError('scanning failed. try again.');
      } finally {
        setIsScanning(false);
      }
    }
  };

  return (
    <div className={`flex flex-col items-center bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 transition-colors ${isAccessible ? 'p-10' : 'p-6'}`}>
      <div className="flex flex-col items-center mb-6 text-center">
        <h2 className={`font-black lowercase leading-tight mb-2 text-slate-900 dark:text-white ${isAccessible ? 'text-3xl' : 'text-xl'}`}>
          {t('scanner')}
        </h2>
        <p className="text-[10px] font-black text-tertiary uppercase tracking-widest mb-4">era-agnostic vision intelligence</p>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl mb-4">
          <button 
            onClick={() => setScanMode('universal')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${scanMode === 'universal' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-400 dark:text-slate-600'}`}
          >
            {t('universalMode')}
          </button>
          <button 
            onClick={() => setScanMode('historical')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${scanMode === 'historical' ? 'bg-white dark:bg-slate-800 shadow-sm text-tertiary' : 'text-slate-400 dark:text-slate-600'}`}
          >
            {t('historicalMode')}
          </button>
        </div>
      </div>

      <div className={`relative w-full max-w-xl aspect-video bg-black rounded-[2rem] overflow-hidden mb-8 border-4 border-slate-100 dark:border-slate-800 shadow-inner group`}>
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
        {isScanning && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-md z-10">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 border-4 border-tertiary border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-primary border-b-transparent rounded-full animate-spin-reverse"></div>
            </div>
            <p className="text-white font-black lowercase tracking-widest animate-pulse">{scanMode === 'historical' ? 'restoring archaic script...' : 'reading modern print...'}</p>
          </div>
        )}

        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tertiary to-transparent opacity-50 shadow-[0_0_15px_rgba(185,83,204,0.5)] z-[5] animate-scan`}></div>
      </div>
      
      {error && <p className="text-red-500 dark:text-red-400 mb-6 text-lg font-black lowercase text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl w-full">{error}</p>}

      {successResult && (
        <div className="w-full bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-900 rounded-[2rem] p-6 mb-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-between items-start mb-2">
             <h3 className="font-black text-green-700 dark:text-green-400 text-lg lowercase">{t('scannedTitle')}</h3>
             <div className="flex gap-1">
                <span className="px-3 py-1 bg-green-200 dark:bg-green-900 text-[10px] font-black rounded-full text-green-800 dark:text-green-300 uppercase">{successResult.estimatedEra || 'Modern'}</span>
                <span className="px-3 py-1 bg-primary/20 text-[10px] font-black rounded-full text-primary uppercase">{successResult.language}</span>
             </div>
          </div>
          <div className="mb-3">
             <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase">classified as: {successResult.type}</span>
             <p className="text-sm font-black text-slate-900 dark:text-slate-100">{successResult.title}</p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">"{successResult.summary}"</p>
          <p className="mt-3 text-[10px] font-black text-green-600 dark:text-green-500 uppercase tracking-widest">{t('digitalizeSuccess')}</p>
        </div>
      )}

      <div className="flex gap-6 w-full max-w-md">
        {!videoRef.current?.srcObject ? (
          <button 
            onClick={startCamera}
            className={`w-full rounded-2xl text-white font-black transition-all shadow-xl active:scale-95 lowercase ${isAccessible ? 'py-8 text-2xl' : 'py-3 text-base'}`}
            style={{ backgroundColor: COLORS.primary }}
          >
            turn on camera
          </button>
        ) : (
          <button 
            onClick={captureAndScan}
            disabled={isScanning}
            className={`w-full rounded-2xl text-white font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 lowercase ${isAccessible ? 'py-8 text-2xl' : 'py-3 text-base'}`}
            style={{ backgroundColor: scanMode === 'historical' ? COLORS.tertiary : COLORS.primary }}
          >
            {isScanning ? 'deciphering...' : t('takePicture')}
          </button>
        )}
      </div>
      <p className={`mt-8 text-slate-500 dark:text-slate-500 text-center lowercase font-medium ${isAccessible ? 'text-lg' : 'text-xs'}`}>
        {t('scanExplanation')}
      </p>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
