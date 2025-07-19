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
  { code: 'ar', name: 'العربية', direction: 'rtl' }
];
