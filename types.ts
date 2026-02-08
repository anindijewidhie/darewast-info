
export type MediaDuration = 15 | 30 | 45 | 60 | 120 | 240 | 480 | 720;
export type MediaType = 'ebook' | 'magazine' | 'tabloid' | 'paper' | 'podcast' | 'video' | 'series' | 'film' | 'audiobook';
export type AgeRating = '3+' | '8+' | '13+' | '18+';
export type CensorshipLevel = 'Strict' | 'Medium' | 'Low';
export type ReleasePattern = 'MWF' | 'TTS' | 'MT' | 'TF' | 'WS' | 'SUNDAY' | 'DAILY';
export type ReleaseFrequency = 'daily' | 'weekly' | 'monthly' | 'annually';

export interface MediaItem {
  id: string;
  title: string;
  author: string;
  type: MediaType;
  duration: MediaDuration;
  coverImage: string;
  sourceUrl?: string;
  category: string; 
  topic: string;
  theme: string;
  genre: string;
  description: string;
  ageRating: AgeRating;
  isHumanMade: boolean;
  seriesId?: string;
  episodeNumber?: number;
  releaseDay?: number; // 0-6 (Sunday-Saturday)
  releaseFrequency?: ReleaseFrequency;
}

export interface Series {
  id: string;
  title: string;
  author: string;
  duration: MediaDuration;
  description: string;
  category: string;
  coverImage: string;
  episodesPerPeriod: number; // 36, 24, or 12
  currentEpisodes: number;
  cycleStartMonth: number; // 0-11
  pattern: ReleasePattern;
}

export type UserAgeMode = 'minor' | 'regular';
export type UserRole = 'consumer' | 'contributor' | 'publisher' | 'director';

export type SchoolSystemType = '6-3-3' | '4-4-4' | '8-4' | '7-4' | '4-3-4' | '8-3' | '4-4-3' | '5-5' | '7-3' | 'university';
export type LearningContext = 'core' | 'additional' | 'exam_prep' | 'assignment_help' | 'research';

export interface EducationStage {
  name: string;
  grades: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export type Language = 'en' | 'id' | 'zh-TW' | 'zh-CN' | 'ar' | 'es' | 'fr' | 'pt' | 'ru' | 'hi' | 'bn' | 'ur' | 'ja' | 'ko';

export interface AccessibilitySettings {
  noPunctuation: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  dyslexicFont: boolean;
}

export interface UserState {
  isLoggedIn: boolean;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  birthDate?: string;
  totalEarnings: number;
  sessionMinutes: number;
  role: UserRole;
  contributorEarnings: number;
  ageMode: UserAgeMode;
  ageRatingPreference: AgeRating;
  censorshipLevel: CensorshipLevel;
  lowCognitiveMode: boolean;
  pedagogyModeActive: boolean;
  language: Language;
  schoolSystem: SchoolSystemType;
  achievements: Achievement[];
  consumedCategories: Record<string, number>;
  insightCount: number;
  cycleStartMonth: number; // 0-11
  accessibility: AccessibilitySettings;
}

export interface WalletAccount {
  type: 'bank' | 'e-wallet';
  provider: string;
  accountNumber: string;
  currency: string;
}
