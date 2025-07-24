import React, { createContext, useContext, useState, useEffect } from 'react';
import { PreferenceSettings, Language, availableLanguages } from '../types/preferenceTypes';

interface PreferenceContextType {
  preferences: PreferenceSettings;
  updatePreferences: (newPreferences: Partial<PreferenceSettings>) => void;
}

const defaultPreferences: PreferenceSettings = {
  secondaryLanguage: availableLanguages[0], // Default to English
};

const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

export const PreferenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<PreferenceSettings>(() => {
    // Always force English as default - clear any Arabic language preference
    localStorage.removeItem('preferences');
    return defaultPreferences;
  });

  const updatePreferences = (newPreferences: Partial<PreferenceSettings>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('preferences', JSON.stringify(updated));
  };

  return (
    <PreferenceContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferenceContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferenceContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferenceProvider');
  }
  return context;
};
