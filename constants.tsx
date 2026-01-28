
import React from 'react';
import { Language, SchoolSystemType, EducationStage, Achievement, LearningContext } from './types';

export const COLORS = {
  primary: '#4FD1C5', // Brighter Mint/Teal
  secondary: '#D4AF37', // Metallic Gold
  tertiary: '#9F7AEA', // Soft Amethyst
  accent: '#F56565', // High-contrast Red/Coral
  bgLight: '#F8FAFC',
  bgDark: '#020617',
  textLight: '#F1F5F9',
  textDark: '#0F172A',
};

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #4FD1C5 0%, #319795 100%)',
  secondary: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
  tertiary: 'linear-gradient(135deg, #9F7AEA 0%, #6B46C1 100%)',
  brand: 'linear-gradient(135deg, #4FD1C5 0%, #9F7AEA 100%)',
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
  'Medical Science', 'Sociology', 'Law', 'Environmental Science', 'Early Childhood'
];

export const TOPICS = [
  'Calculus', 'Genetics', 'Organic Chemistry', 'Quantum Mechanics', 'Neural Networks',
  'Medieval Europe', 'Plate Tectonics', 'Post-Modernism', 'Constitutional Law', 'Renaissance Art',
  'Macroeconomics', 'Existentialism', 'Phonetics', 'Cognitive Bias', 'Structural Integrity',
  'Anatomy', 'Urbanization', 'Criminal Justice', 'Climate Change', 'Basic Numeracy'
];

export const THEMES = [
  'Innovation', 'Mastery', 'Sustainability', 'Identity', 'Global Connection',
  'Ethical Dilemmas', 'Human Rights', 'Scientific Discovery', 'Culture & Society', 
  'Individual Growth', 'Power & Justice', 'Nature & Environment', 'Future Tech'
];

export const GENRES = [
  'Academic Journal', 'Documentary', 'Step-by-Step Tutorial', 'Narrative Non-Fiction',
  'Case Study', 'Expert Interview', 'Masterclass', 'Historical Chronicle',
  'Philosophy Essay', 'Technical Manual', 'Educational Animation', 'Satirical Tabloid',
  'Infotainment', 'Documentary Film'
];

export const SCHOOL_SYSTEMS: Record<SchoolSystemType, EducationStage[]> = {
  '6-3-3': [{ name: 'Elementary', grades: 6 }, { name: 'Middle', grades: 3 }, { name: 'High', grades: 3 }],
  '4-4-4': [{ name: 'Lower Secondary', grades: 4 }, { name: 'Middle Secondary', grades: 4 }, { name: 'Upper Secondary', grades: 4 }],
  '8-4': [{ name: 'Primary', grades: 8 }, { name: 'Secondary', grades: 4 }],
  '7-4': [{ name: 'Primary', grades: 7 }, { name: 'Secondary', grades: 4 }],
  '4-3-4': [{ name: 'Junior', grades: 4 }, { name: 'Middle', grades: 3 }, { name: 'Senior', grades: 4 }],
  '8-3': [{ name: 'Primary', grades: 8 }, { name: 'Secondary', grades: 3 }],
  '4-4-3': [{ name: 'Phase 1', grades: 4 }, { name: 'Phase 2', grades: 4 }, { name: 'Phase 3', grades: 3 }],
  '5-5': [{ name: 'Lower', grades: 5 }, { name: 'Upper', grades: 5 }],
  '7-3': [{ name: 'Standard', grades: 7 }, { name: 'Specialist', grades: 3 }],
  'university': [{ name: 'Undergraduate', grades: 4 }, { name: 'Postgraduate', grades: 2 }]
};

export const LEARNING_CONTEXTS: { value: LearningContext; label: string }[] = [
  { value: 'core', label: 'core curriculum' },
  { value: 'additional', label: 'additional support' },
  { value: 'exam_prep', label: 'exam preparation' },
  { value: 'assignment_help', label: 'assignment help' },
  { value: 'research', label: 'deep research' }
];

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
  { id: 'mastery_1', name: 'Mastery Seeker', description: 'Consult pedagogy expert for the first time.', icon: '🎓' },
  { id: 'earner_1', name: 'Deep Scholar', description: 'Earn your first milestone in sessions.', icon: '💎' },
  { id: 'contributor_1', name: 'Truth Bearer', description: 'Contribute human-verified media.', icon: '🛡️' }
];

export const DONATION_AMOUNTS = [10, 25, 50, 100, 250, 500];

export const DONATION_ALLOCATION = [
  { label: 'Creator Fund', percent: 60, color: COLORS.primary },
  { label: 'Infrastructure', percent: 20, color: COLORS.secondary },
  { label: 'Research', percent: 20, color: COLORS.tertiary }
];

const BASE_TRANSLATIONS = {
  motto: 'delivering information anywhere',
  unlimited: 'unlimited in-depth digital contents',
  welcome: 'welcome to darewast info',
  humanMade: 'human contributed',
  aiGenerated: 'ai generated',
  earnings: 'earnings',
  library: 'media library',
  podcast: 'podcast',
  ebook: 'e-book',
  magazine: 'e-magazine',
  tabloid: 'e-tabloid',
  paper: 'e-paper',
  video: 'video',
  search: 'search title or author...',
  signup: 'create account',
  login: 'sign in',
  langSelector: 'select language',
  appDescription: 'the in-depth media consumption app',
  accessHub: 'accessibility hub',
  noPunct: 'no punctuation',
  highContrast: 'high contrast',
  screenReader: 'screen reader optimized',
  dyslexic: 'dyslexic font',
  readAloud: 'read aloud',
};

export const TRANSLATIONS: Partial<Record<Language, any>> = {
  en: { ...BASE_TRANSLATIONS },
  id: { ...BASE_TRANSLATIONS, welcome: 'selamat datang di darewast info', unlimited: 'konten digital mendalam tanpa batas' },
  'zh-TW': { ...BASE_TRANSLATIONS, welcome: '歡迎來到 darewast info', unlimited: '無限深度數位內容' },
  'zh-CN': { ...BASE_TRANSLATIONS, welcome: '欢迎来到 darewast info', unlimited: '无限深度数字内容' },
  ar: { ...BASE_TRANSLATIONS, welcome: 'مرحبًا بكم في darewast info', unlimited: 'محتويات رقمية متعمقة غير محدودة' },
  es: { ...BASE_TRANSLATIONS, welcome: 'bienvenido a darewast info', unlimited: 'contenidos digitales profundos ilimitados' },
  fr: { ...BASE_TRANSLATIONS, welcome: 'bienvenue sur darewast info', unlimited: 'contenus numériques approfondis illimités' },
  pt: { ...BASE_TRANSLATIONS, welcome: 'bem-vindo ao darewast info', unlimited: 'conteúdos digitais profundos ilimitados' },
  ru: { ...BASE_TRANSLATIONS, welcome: 'добро пожаловать в darewast info', unlimited: 'неограниченный углубленный цифровой контент' },
  hi: { ...BASE_TRANSLATIONS, welcome: 'darewast info में आपका स्वागत है', unlimited: 'असीमित गहन डिजिटल सामग्री' },
  bn: { ...BASE_TRANSLATIONS, welcome: 'darewast info-এ আপনাকে স্বাগতম', unlimited: 'সীমাহীন গভীর ডিজিটাল বিষয়বস্তు' },
  ur: { ...BASE_TRANSLATIONS, welcome: 'darewast info میں خوش آمدید', unlimited: 'لامحدود گہری ڈیجیٹل مواد' },
  ja: { ...BASE_TRANSLATIONS, welcome: 'darewast info へようこそ', unlimited: '無制限の深いデジタルコンテンツ' },
  ko: { ...BASE_TRANSLATIONS, welcome: 'darewast info에 오신 것을 환영합니다', unlimited: '무제한 심층 디지털 콘텐츠' },
};

/**
 * Strips punctuation from text for specialized readability.
 */
export const cleanPunctuation = (text: string): string => {
  return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
};
