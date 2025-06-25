// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import file translations
import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
  en: {
    translation: en
  },
  vi: {
    translation: vi
  }
};

i18n
  .use(LanguageDetector) // Tự động detect ngôn ngữ từ browser
  .use(initReactI18next) // Khởi tạo react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Ngôn ngữ mặc định
    lng: 'vi', // Ngôn ngữ khởi tạo (có thể để auto detect)
    
    interpolation: {
      escapeValue: false // React đã escape rồi
    },
    
    // Cấu hình detection
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;