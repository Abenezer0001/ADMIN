import React, { useEffect } from 'react';
import { usePreferences } from '../context/PreferenceContext';

interface RTLProviderProps {
  children: React.ReactNode;
}

const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { preferences } = usePreferences();
  const isRTL = preferences.secondaryLanguage?.direction === 'rtl';

  useEffect(() => {
    // Set the document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    
    // Set language attribute for better accessibility
    document.documentElement.lang = preferences.secondaryLanguage?.code || 'en';
  }, [isRTL, preferences.secondaryLanguage?.code]);

  return <>{children}</>;
};

export default RTLProvider;