import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import sk from './locales/sk.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: en,
            },
            sk: {
                translation: sk,
            },
        },
        // Get the first device language; format might be 'en-US' or 'en', so split
        lng: getLocales()[0].languageCode,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
