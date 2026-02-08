
import React from 'react';
import { Language, SchoolSystemType, EducationStage, Achievement, LearningContext } from './types';

export const COLORS = {
  primary: '#53CDBA', // Specialized Teal - Scholarly Precision
  secondary: '#CCB953', // Specialized Gold - Achievement & Excellence
  tertiary: '#B953CC', // Specialized Purple - Deep Philosophy
  accent: '#F56565', // Coral - Critical Attention
  bgLight: '#FDFCFB',
  bgDark: '#05070A',
  textLight: '#F1F5F9',
  textDark: '#0F172A',
};

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #53CDBA 0%, #319795 100%)',
  secondary: 'linear-gradient(135deg, #CCB953 0%, #B8860B 100%)',
  tertiary: 'linear-gradient(135deg, #B953CC 0%, #6B46C1 100%)',
  brand: 'linear-gradient(135deg, #53CDBA 0%, #B953CC 100%)',
  surface: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
};

export const EARNING_RATE = 10; 
export const CONTRIBUTOR_PAGE_RATE = 10; 
export const CONTRIBUTOR_MINUTE_RATE = 10; 
export const MIN_AGE_REQUIREMENT = 3;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CATEGORIES = [
  'Mathematics', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 
  'History', 'Geography', 'Literature', 'Civics', 'Arts & Design',
  'Economics', 'Philosophy', 'Linguistics', 'Psychology', 'Engineering',
  'Medical Science', 'Sociology', 'Law', 'Environmental Science', 'Theology', 'Aeronautics', 'Global Ethics'
];

export const TOPICS = [
  'Calculus', 'Genetics', 'Organic Chemistry', 'Quantum Mechanics', 'Neural Networks',
  'Medieval Europe', 'Plate Tectonics', 'Post-Modernism', 'Constitutional Law', 'Renaissance Art',
  'Macroeconomics', 'Existentialism', 'Phonetics', 'Cognitive Bias', 'Structural Integrity',
  'Anatomy', 'Urbanization', 'Criminal Justice', 'Climate Change', 'Comparative Religions', 'Aerodynamics', 'Human Rights'
];

export const THEMES = [
  'Innovation', 'Mastery', 'Sustainability', 'Identity', 'Global Connection',
  'Ethical Dilemmas', 'Human Rights', 'Scientific Discovery', 'Culture & Society', 
  'Individual Growth', 'Power & Justice', 'Nature & Environment', 'Future Tech', 'Peace & Coexistence'
];

export const GENRES = [
  'Academic Journal', 'Documentary', 'Step-by-Step Tutorial', 'Narrative Non-Fiction',
  'Case Study', 'Expert Interview', 'Masterclass', 'Historical Chronicle',
  'Philosophy Essay', 'Technical Manual', 'Educational Animation', 'Satirical Tabloid',
  'Infotainment', 'Documentary Film'
];

export const SCHOOL_SYSTEMS: Record<SchoolSystemType, EducationStage[]> = {
  '6-3-3': [{ name: 'Elementary Mastery', grades: 6 }, { name: 'Middle Mastery', grades: 3 }, { name: 'High Mastery', grades: 3 }],
  '4-4-4': [{ name: 'Lower Secondary', grades: 4 }, { name: 'Middle Secondary', grades: 4 }, { name: 'Upper Secondary', grades: 4 }],
  '8-4': [{ name: 'Primary Scholar', grades: 8 }, { name: 'Secondary Scholar', grades: 4 }],
  '7-4': [{ name: 'Primary Stage', grades: 7 }, { name: 'Secondary Stage', grades: 4 }],
  '4-3-4': [{ name: 'Junior', grades: 4 }, { name: 'Middle', grades: 3 }, { name: 'Senior', grades: 4 }],
  '8-3': [{ name: 'Standard Primary', grades: 8 }, { name: 'Advanced Secondary', grades: 3 }],
  '4-4-3': [{ name: 'Phase 1', grades: 4 }, { name: 'Phase 2', grades: 4 }, { name: 'Phase 3', grades: 3 }],
  '5-5': [{ name: 'Lower Master', grades: 5 }, { name: 'Upper Master', grades: 5 }],
  '7-3': [{ name: 'Standard Path', grades: 7 }, { name: 'Specialist Path', grades: 3 }],
  'university': [{ name: 'Undergraduate', grades: 4 }, { name: 'Postgraduate', grades: 2 }]
};

export const LEARNING_CONTEXTS: { value: LearningContext; label: string }[] = [
  { value: 'core', label: 'core mastery' },
  { value: 'additional', label: 'mastery support' },
  { value: 'exam_prep', label: 'verification prep' },
  { value: 'assignment_help', label: 'workload assistance' },
  { value: 'research', label: 'deep scholarship' }
];

export const CURRENCIES: Record<Language, { code: string, symbol: string, rate: number }> = {
  en: { code: 'USD', symbol: '$', rate: 1 },
  id: { code: 'IDR', symbol: 'Rp', rate: 15600 },
  'zh-TW': { code: 'TWD', symbol: 'NT$', rate: 31.5 },
  'zh-CN': { code: 'CNY', symbol: '¥', rate: 7.2 },
  ar: { code: 'SAR', symbol: 'SR', rate: 3.75 },
  es: { code: 'EUR', symbol: '€', rate: 0.92 },
  fr: { code: 'EUR', symbol: '€', rate: 0.92 },
  pt: { code: 'EUR', symbol: '€', rate: 0.92 },
  ru: { code: 'RUB', symbol: '₽', rate: 92.5 },
  hi: { code: 'INR', symbol: '₹', rate: 83.1 },
  bn: { code: 'BDT', symbol: '৳', rate: 110.0 },
  ur: { code: 'PKR', symbol: 'Rs', rate: 279.5 },
  ja: { code: 'JPY', symbol: '¥', rate: 150.2 },
  ko: { code: 'KRW', symbol: '₩', rate: 1335.0 }
};

export const LANGUAGES: { code: Language; name: string; rtl?: boolean }[] = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'ar', name: 'العربية', rtl: true },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ur', name: 'اردو', rtl: true },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'mastery_1', name: 'Systematic Scholar', description: 'Complete your first practice session in any subject.', icon: '✍️' },
  { id: 'earner_1', name: 'Daily Discipline', description: 'Maintain a 3-day mastery streak.', icon: '🔥' },
  { id: 'contributor_1', name: 'Truth Contributor', description: 'Contribute human-verified truth to the archive.', icon: '🛡️' }
];

export const DONATION_AMOUNTS = [1, 2, 5, 10, 20, 50, 100];

export const DONATION_ALLOCATION = [
  { label: 'Scholar Rewards', percent: 40, color: COLORS.primary },
  { label: 'System Maintenance', percent: 20, color: COLORS.secondary },
  { label: 'Curriculum Dev', percent: 20, color: COLORS.tertiary },
  { label: 'Network Oversight', percent: 20, color: COLORS.accent }
];

const BASE_TRANSLATIONS = {
  motto: 'deep media alternative to social media',
  unlimited: 'unlimited systematic curriculum. escape the algorithmic noise.',
  welcome: 'welcome to darewast info',
  humanMade: 'human scholarship',
  aiGenerated: 'synthetic node',
  earnings: 'mastery credit',
  library: 'in-depth archive',
  podcast: 'audio masterclass',
  ebook: 'master manuscript',
  magazine: 'periodical truth',
  tabloid: 'satirical insight',
  paper: 'scholarly paper',
  video: 'visual broadcast',
  audiobook: 'audiobook mastery',
  search: 'find subject mastery...',
  signup: 'enroll scholar',
  login: 'scholar sign in',
  langSelector: 'select global language',
  appDescription: 'the in-depth media portal for systematic knowledge',
  accessHub: 'accessibility gateway',
  noPunct: 'clean script',
  highContrast: 'high contrast',
  screenReader: 'vocal mastery',
  dyslexic: 'dyslexic script',
  readAloud: 'vocalize mastery',
  donationTitle: 'fund global mastery',
  donationDescription: 'ensuring education remains human-centric and free of bias, violence, and social media noise.',
  contributeNow: 'contribute scholarship',
  customAmount: 'custom credit',
  thankYouDonation: 'thank you for funding truth',
  howSplit: 'how credit is allocated',
  safetyHubTitle: 'pedagogical safety shield',
  noViolence: 'violence filtered',
  noPorn: 'adult content blocked',
  noDiscrimination: 'bias-free zone',
  noPolitics: 'objective mastery only',
  noIslamophobia: 'islamophobia prohibited',
  humanCentricTitle: 'Human-Centric Priority',
  humanCentricDescription: 'minimizing algorithmic noise and prioritizing human expertise for authentic depth.',
  aiSynthesisWarning: 'ai synthesis tool active. always verify ai outputs against human expertise.',
  humanFirstMotto: 'systematic human truth over social noise',
  corporateTitle: 'Corporate Patronage',
  corporateDesc: 'partner with darewast info to fund global depth at institutional scale.',
  partnershipTiers: 'patronage tiers',
  contactForPartnership: 'inquire for patronage',
  imageGen: 'visual synthesis',
  videoGen: 'broadcast synthesis',
  visionStudio: 'media studio',
  imageGenDesc: 'Synthesizing educational imagery for scholarly retention.',
  generateImage: 'synthesize visual',
  promptLabel: 'pedagogical prompt',
  donate: 'fund',
  supportMastery: 'support depth',
  scanner: 'mastery vision scanner',
  scannerExplanation: 'digitize physical scholarly materials into interactive media nodes.',
};

export const TRANSLATIONS: Partial<Record<Language, any>> = {
  en: { ...BASE_TRANSLATIONS },
  id: { ...BASE_TRANSLATIONS, welcome: 'selamat datang di darewast info', unlimited: 'kurikulum digital sistematis. hindari kebisingan algoritmik.', donate: 'danai', supportMastery: 'dukung penguasaan' },
};

export const cleanPunctuation = (text: string): string => {
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
};
