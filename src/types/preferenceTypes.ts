export interface Language {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
}

export interface PreferenceSettings {
  secondaryLanguage: Language;
}

export const availableLanguages: Language[] = [
  { code: 'en', name: 'English', direction: 'ltr' },
  { code: 'es', name: 'Español', direction: 'ltr' },
  { code: 'it', name: 'Italiano', direction: 'ltr' },
  { code: 'pt', name: 'Português', direction: 'ltr' },
  { code: 'tr', name: 'Türkçe', direction: 'ltr' },
  { code: 'ar', name: 'العربية', direction: 'rtl' },
  { code: 'ru', name: 'Русский', direction: 'ltr' }
];
