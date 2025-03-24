import React from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { usePreferences } from '../../context/PreferenceContext';
import { availableLanguages } from '../../types/preferenceTypes';

const Preferences: React.FC = () => {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Preferences
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Language Settings
        </Typography>

        <FormControl component="fieldset">
          <RadioGroup
            value={preferences.secondaryLanguage?.code || ''}
            onChange={(e) => {
              const language = availableLanguages.find(lang => lang.code === e.target.value);
              if (language) {
                updatePreferences({ secondaryLanguage: language });
              }
            }}
          >
            {availableLanguages.filter(lang => lang.code !== 'en').map((language) => (
              <FormControlLabel
                key={language.code}
                value={language.code}
                control={<Radio />}
                label={`${language.name} - ${language.code.toUpperCase()}`}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    ...(language.direction === 'rtl' && {
                      fontFamily: 'var(--font-arabic)',
                      direction: 'rtl',
                    }),
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          The secondary language will be used for translations across the application.
          Content in this language will be displayed alongside the primary language (English).
        </Typography>
      </Paper>
    </Box>
  );
};

export default Preferences;
