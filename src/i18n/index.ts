import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptBR from '../locales/pt-BR.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import it from '../locales/it.json';
import ptPT from '../locales/pt-PT.json';

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
  'pt-PT': { translation: ptPT },
};

// Map country codes to supported languages
const countryToLanguage: Record<string, string> = {
  BR: 'pt-BR',
  PT: 'pt-PT',
  US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  VE: 'es', EC: 'es', UY: 'es', PY: 'es', BO: 'es', CR: 'es',
  CU: 'es', DO: 'es', GT: 'es', HN: 'es', NI: 'es', PA: 'es', SV: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',
  IT: 'it', SM: 'it',
  AO: 'pt-PT', MZ: 'pt-PT', CV: 'pt-PT', GW: 'pt-PT', ST: 'pt-PT', TL: 'pt-PT',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// On first visit (no cached language), detect country by IP and override
const GEO_DETECTED_KEY = 'nurseagenda_geo_detected';
if (!localStorage.getItem('i18nextLng') && !localStorage.getItem(GEO_DETECTED_KEY)) {
  fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
    .then((res) => res.json())
    .then((data) => {
      const country = data?.country_code;
      if (country && countryToLanguage[country]) {
        const lang = countryToLanguage[country];
        if (i18n.language !== lang) {
          i18n.changeLanguage(lang);
        }
      }
      localStorage.setItem(GEO_DETECTED_KEY, '1');
    })
    .catch(() => {
      // Silently fail — browser language is already set
    });
}

export default i18n;

export const languages = [
  { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-PT', label: 'Português (PT)', flag: '🇵🇹' },
];