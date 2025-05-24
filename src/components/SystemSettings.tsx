import React from 'react';
import { useTheme } from '@mui/material/styles';
import { 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel, 
  Typography, 
  Box, 
  Divider,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Slider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  AlertTitle,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  styled,
  ThemeProvider,
  createTheme,
  Theme,
  ThemeOptions
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import LanguageIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import ApiIcon from '@mui/icons-material/Code';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteIcon from '@mui/icons-material/Delete';
import CachedIcon from '@mui/icons-material/Cached';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import UpdateIcon from '@mui/icons-material/Update';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SystemModeIcon from '@mui/icons-material/SettingsBrightness';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import AnimationIcon from '@mui/icons-material/Animation';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(3, 0),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgb(22, 31, 48)' : 'rgb(248, 250, 252)',
  color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(71, 85, 105)',
  boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
}));

const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '&:last-child': {
    marginBottom: 0,
  },
  backgroundColor: 'transparent',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '1.25rem',
  marginBottom: theme.spacing(2),
  color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)',
  transition: 'color 0.3s ease',
}));

const SettingItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: theme.spacing(2, 0),
  borderBottom: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.8)',
  '&:last-child': {
    borderBottom: 'none',
  },
  transition: 'border-color 0.3s ease',
}));

const SettingLabel = styled(Box)({
  flex: '1 1 50%',
  paddingRight: '16px',
});

const SettingTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(51, 65, 85)',
  transition: 'color 0.3s ease',
}));

const SettingDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgb(100, 116, 139)',
  transition: 'color 0.3s ease',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
}));

const SaveButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
  },
}));

const ResetButton = styled(ActionButton)(({ theme }) => ({
  marginRight: theme.spacing(2),
  borderColor: theme.palette.divider,
  color: theme.palette.text.secondary,
  '&:hover': {
    borderColor: theme.palette.text.primary,
    color: theme.palette.text.primary,
  },
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    marginLeft: theme.spacing(1),
  },
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      color: theme.palette.primary.main,
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.primary.main,
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: theme.palette.primary.main,
      border: '6px solid #fff',
    },
  },
  '& .MuiSwitch-thumb': {
    width: 20,
    height: 20,
  },
  '& .MuiSwitch-track': {
    borderRadius: 20,
    backgroundColor: theme.palette.grey[400],
    opacity: 1,
  },
}));

interface SystemSettingsState {
  // General Settings
  systemName: string;
  adminEmail: string;
  timezone: string;
  dateFormat: string;
  itemsPerPage: number;
  
  // Appearance
  themeMode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
  animation: boolean;
  highContrast: boolean;
  
  // User Registration
  allowRegistration: boolean;
  autoApproveUsers: boolean;
  requireEmailVerification: boolean;
  
  // Security
  enable2FA: boolean;
  passwordMinLength: number;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  failedLoginAttempts: number;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyOnNewUser: boolean;
  notifyOnFailedLogin: boolean;
  
  // Maintenance
  maintenanceMode: boolean;
  maintenanceMessage: string;
  
  // Caching
  enableCaching: boolean;
  cacheTtl: number;
  
  // API
  enableApiAccess: boolean;
  apiRateLimit: number;
  
  // Backup
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetention: number;
}

type ColorPreset = {
  name: string;
  value: string;
};

type FontFamily = {
  label: string;
  value: string;
};

const colorPresets = [
  { name: 'Blue', value: '#1976d2' },
  { name: 'Green', value: '#2e7d32' },
  { name: 'Purple', value: '#9c27b0' },
  { name: 'Orange', value: '#ed6c02' },
  { name: 'Red', value: '#d32f2f' },
];

const fontFamilies = [
  { label: 'System Default', value: 'system-ui' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
];

const SystemSettings: React.FC = () => {
  const theme = useTheme();
  const [showSaveAlert, setShowSaveAlert] = React.useState<boolean>(false);
  const [hasChanges, setHasChanges] = React.useState<boolean>(false);
  const [settings, setSettings] = React.useState<SystemSettingsState>({
    // General Settings
    systemName: 'INSEAT Admin',
    adminEmail: 'admin@example.com',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
    itemsPerPage: 25,
    
    // Appearance
    themeMode: 'system',
    primaryColor: '#1976d2',
    secondaryColor: '#9c27b0',
    fontFamily: 'system-ui',
    fontSize: 14,
    borderRadius: 8,
    animation: true,
    highContrast: false,
    
    // User Registration
    allowRegistration: true,
    autoApproveUsers: false,
    requireEmailVerification: true,
    
    // Security
    enable2FA: true,
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    failedLoginAttempts: 5,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    notifyOnNewUser: true,
    notifyOnFailedLogin: true,
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please check back later.',
    
    // Caching
    enableCaching: true,
    cacheTtl: 3600,
    
    // API
    enableApiAccess: true,
    apiRateLimit: 1000,
    
    // Backup
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
  });
  
  const timezones = [
    'Africa/Addis_Ababa',
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
  ];
  
  const dateFormats = [
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'DD MMM YYYY',
    'MMMM DD, YYYY',
  ];
  
  const handleChange = (key: keyof SystemSettingsState, value: any) => {
    setSettings(prev => {
      if (prev[key] !== value) {
        setHasChanges(true);
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSliderChange = (key: keyof SystemSettingsState) => (event: Event, value: number | number[]) => {
    handleChange(key, Array.isArray(value) ? value[0] : value);
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    handleChange(name as keyof SystemSettingsState, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      // await api.saveSettings(settings);
      console.log('Saving settings:', settings);
      setHasChanges(false);
      setShowSaveAlert(true);
      setTimeout(() => setShowSaveAlert(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Handle error state
    }
  };

  const handleReset = () => {
    // TODO: Reset to saved settings from API
    setHasChanges(false);
  };

  const handleThemeModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'light' | 'dark' | 'system' | null,
  ) => {
    if (newMode !== null) {
      setSettings((prev: SystemSettingsState) => ({
        ...prev,
        themeMode: newMode
      }));
      setHasChanges(true);
    }
  };

  const handleColorChange = (type: 'primary' | 'secondary', color: string) => {
    const key = type === 'primary' ? 'primaryColor' : 'secondaryColor';
    setSettings((prev: SystemSettingsState) => ({
      ...prev,
      [key]: color
    }));
    setHasChanges(true);
  };

  const muiTheme = React.useMemo(() => {
    // Create a safe check for window object to avoid issues during SSR
    const isDarkMode = typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const baseTheme = createTheme({
      palette: {
        mode: settings.themeMode === 'system' 
          ? isDarkMode ? 'dark' : 'light'
          : settings.themeMode as 'light' | 'dark',
        primary: {
          main: settings.primaryColor,
        },
        secondary: {
          main: settings.secondaryColor,
        },
        contrastThreshold: settings.highContrast ? 4.5 : 3,
        tonalOffset: settings.highContrast ? 0.2 : 0.1,
      },
      typography: {
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
      },
      shape: {
        borderRadius: settings.borderRadius,
      },
      transitions: {
        // Disable transitions when animations are off
        duration: settings.animation ? {
          shortest: 150,
          shorter: 200,
          short: 250,
          standard: 300,
          complex: 375,
          enteringScreen: 225,
          leavingScreen: 195,
        } : {
          shortest: 0,
          shorter: 0,
          short: 0,
          standard: 0,
          complex: 0,
          enteringScreen: 0,
          leavingScreen: 0,
        },
      },
    });

    // Apply CSS variables for custom properties - only in browser environment
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', settings.primaryColor);
      root.style.setProperty('--secondary-color', settings.secondaryColor);
      root.style.setProperty('--font-family', settings.fontFamily);
      root.style.setProperty('--font-size', `${settings.fontSize}px`);
      root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
      
      // Apply high contrast mode
      if (settings.highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    }

    return baseTheme;
  }, [settings]);

  // Safely handle style injection
  const inlineStyles = `
    :root {
      --primary-color: ${settings.primaryColor};
      --secondary-color: ${settings.secondaryColor};
    }
  `;

  return (
    <ThemeProvider theme={muiTheme}>
      {typeof document !== 'undefined' && <style>{inlineStyles}</style>}
      <Box sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? 'rgb(22, 31, 48)' : 'rgb(241, 245, 249)', 
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(51, 65, 85)', 
        borderRadius: 2, 
        p: 2,
        minHeight: '100vh',
        transition: 'all 0.3s ease'
      }}>
      
      {showSaveAlert && (
        <Alert 
          severity="success" 
          onClose={() => setShowSaveAlert(false)}
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            boxShadow: 3,
            width: 'auto',
            minWidth: 300,
            maxWidth: 'calc(100% - 40px)'
          }}
        >
          <AlertTitle>Success</AlertTitle>
          Your settings have been saved successfully!
        </Alert>
      )}
      
      <StyledPaper>
        <Box display="flex" mb={4}>
          <PaletteIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Box>
            <Typography variant="h5" component="h1" gutterBottom sx={{
              color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)',
              fontWeight: 600,
              transition: 'color 0.3s ease'
            }}>
              System Settings
            </Typography>
            <Typography variant="body2" sx={{
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgb(100, 116, 139)',
              transition: 'color 0.3s ease'
            }}>
              Customize your system preferences and security settings
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ 
          mb: 4, 
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)',
          transition: 'border-color 0.3s ease'
        }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={8} sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(51, 65, 85)', backgroundColor: 'transparent' }}>
              {/* Appearance Settings */}
              <SectionContainer>
                <SectionTitle sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)' }}>
                  <PaletteIcon color="primary" sx={{ mr: 1 }} />
                  Appearance
                </SectionTitle>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Theme Mode</SettingTitle>
                    <SettingDescription>
                      Choose between light, dark, or system preference
                    </SettingDescription>
                  </SettingLabel>
                  <ToggleButtonGroup
                    value={settings.themeMode}
                    exclusive
                    onChange={handleThemeModeChange}
                    aria-label="theme mode"
                    size="small"
                  >
                    <ToggleButton value="light" aria-label="light mode">
                      <LightModeIcon sx={{ mr: 1 }} /> Light
                    </ToggleButton>
                    <ToggleButton value="dark" aria-label="dark mode">
                      <DarkModeIcon sx={{ mr: 1 }} /> Dark
                    </ToggleButton>
                    <ToggleButton value="system" aria-label="system preference">
                      <SystemModeIcon sx={{ mr: 1 }} /> System
                    </ToggleButton>
                  </ToggleButtonGroup>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Primary Color</SettingTitle>
                    <SettingDescription>
                      Choose your primary brand color
                    </SettingDescription>
                  </SettingLabel>
                  <Box display="flex" gap={1}>
                    {colorPresets.map((color) => (
                      <Tooltip key={color.value} title={color.name} arrow>
                        <Box
                          onClick={() => handleColorChange('primary', color.value)}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: color.value,
                            cursor: 'pointer',
                            border: `2px solid ${settings.primaryColor === color.value ? settings.primaryColor : 'transparent'}`,
                            '&:hover': {
                              transform: 'scale(1.1)',
                              transition: 'transform 0.2s',
                            },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Secondary Color</SettingTitle>
                    <SettingDescription>
                      Choose your secondary brand color
                    </SettingDescription>
                  </SettingLabel>
                  <Box display="flex" gap={1}>
                    {colorPresets.map((color) => (
                      <Tooltip key={color.value} title={color.name} arrow>
                        <Box
                          onClick={() => handleColorChange('secondary', color.value)}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: color.value,
                            cursor: 'pointer',
                            border: `2px solid ${settings.secondaryColor === color.value ? settings.secondaryColor : 'transparent'}`,
                            '&:hover': {
                              transform: 'scale(1.1)',
                              transition: 'transform 0.2s',
                            },
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Font Family</SettingTitle>
                    <SettingDescription>
                      Choose your preferred font
                    </SettingDescription>
                  </SettingLabel>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select
                      value={settings.fontFamily}
                      onChange={(e) => handleChange('fontFamily', e.target.value)}
                      sx={{ fontFamily: settings.fontFamily }}
                    >
                      {fontFamilies.map((font) => (
                        <MenuItem 
                          key={font.value} 
                          value={font.value}
                          sx={{ fontFamily: font.value }}
                        >
                          {font.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Font Size</SettingTitle>
                    <SettingDescription>
                      Adjust the base font size
                    </SettingDescription>
                  </SettingLabel>
                  <Box sx={{ width: 200 }}>
                    <Slider
                      value={settings.fontSize}
                      onChange={(e, value) => handleChange('fontSize', Array.isArray(value) ? value[0] : value)}
                      valueLabelDisplay="auto"
                      step={1}
                      min={12}
                      max={18}
                      valueLabelFormat={(value) => `${value}px`}
                    />
                  </Box>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Border Radius</SettingTitle>
                    <SettingDescription>
                      Adjust the roundness of corners
                    </SettingDescription>
                  </SettingLabel>
                  <Box sx={{ width: 200 }}>
                    <Slider
                      value={settings.borderRadius}
                      onChange={(e, value) => handleChange('borderRadius', Array.isArray(value) ? value[0] : value)}
                      valueLabelDisplay="auto"
                      step={1}
                      min={0}
                      max={20}
                      valueLabelFormat={(value) => `${value}px`}
                    />
                  </Box>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Animations</SettingTitle>
                    <SettingDescription>
                      Enable or disable UI animations
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.animation}
                    onChange={(e) => handleChange('animation', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>High Contrast Mode</SettingTitle>
                    <SettingDescription>
                      Increase color contrast for better readability
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.highContrast}
                    onChange={(e) => handleChange('highContrast', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
              </SectionContainer>
              
              {/* General Settings */}
              <SectionContainer>
                <SectionTitle sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)' }}>
                  <SettingsIcon color="primary" sx={{ mr: 1 }} />
                  General Settings
                </SectionTitle>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>System Name</SettingTitle>
                    <SettingDescription>
                      The name displayed throughout the system
                    </SettingDescription>
                  </SettingLabel>
                  <TextField
                    size="small"
                    value={settings.systemName}
                    onChange={(e) => handleChange('systemName', e.target.value)}
                    variant="outlined"
                    sx={{ width: 300 }}
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Admin Email</SettingTitle>
                    <SettingDescription>
                      System notifications will be sent to this address
                    </SettingDescription>
                  </SettingLabel>
                  <TextField
                    size="small"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                    variant="outlined"
                    sx={{ width: 300 }}
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Timezone</SettingTitle>
                    <SettingDescription>
                      Set the default timezone for the system
                    </SettingDescription>
                  </SettingLabel>
                  <FormControl size="small" sx={{ minWidth: 300 }}>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.timezone}
                      onChange={handleSelectChange}
                      name="timezone"
                      label="Timezone"
                    >
                      {timezones.map((tz) => (
                        <MenuItem key={tz} value={tz}>
                          {tz}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Date Format</SettingTitle>
                    <SettingDescription>
                      How dates should be displayed throughout the system
                    </SettingDescription>
                  </SettingLabel>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.dateFormat}
                      onChange={handleSelectChange}
                      name="dateFormat"
                      label="Date Format"
                    >
                      {dateFormats.map((format) => (
                        <MenuItem key={format} value={format}>
                          {format}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Items Per Page</SettingTitle>
                    <SettingDescription>
                      Number of items to show per page in lists
                    </SettingDescription>
                  </SettingLabel>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      value={settings.itemsPerPage}
                      onChange={handleSliderChange('itemsPerPage')}
                      valueLabelDisplay="auto"
                      step={5}
                      marks={[
                        { value: 10, label: '10' },
                        { value: 25, label: '25' },
                        { value: 50, label: '50' },
                        { value: 100, label: '100' },
                      ]}
                      min={5}
                      max={100}
                    />
                  </Box>
                </SettingItem>
              </SectionContainer>
              
              {/* User Registration & Security */}
              <SectionContainer>
                <SectionTitle sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)' }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  User Registration & Security
                </SectionTitle>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Allow New User Registration</SettingTitle>
                    <SettingDescription>
                      Allow new users to create accounts
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.allowRegistration}
                    onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem sx={{ opacity: settings.allowRegistration ? 1 : 0.6 }}>
                  <SettingLabel>
                    <SettingTitle>Auto Approve New Users</SettingTitle>
                    <SettingDescription>
                      Automatically approve new user registrations
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.autoApproveUsers}
                    onChange={(e) => handleChange('autoApproveUsers', e.target.checked)}
                    disabled={!settings.allowRegistration}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Require Email Verification</SettingTitle>
                    <SettingDescription>
                      Users must verify their email address before logging in
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Enable Two-Factor Authentication</SettingTitle>
                    <SettingDescription>
                      Require a second form of authentication for all users
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.enable2FA}
                    onChange={(e) => handleChange('enable2FA', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Password Requirements</SettingTitle>
                    <SettingDescription>
                      Minimum password length: {settings.passwordMinLength} characters
                    </SettingDescription>
                  </SettingLabel>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      value={settings.passwordMinLength}
                      onChange={handleSliderChange('passwordMinLength')}
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={6}
                      max={20}
                    />
                  </Box>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Failed Login Attempts</SettingTitle>
                    <SettingDescription>
                      Lock account after {settings.failedLoginAttempts} failed attempts
                    </SettingDescription>
                  </SettingLabel>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      value={settings.failedLoginAttempts}
                      onChange={handleSliderChange('failedLoginAttempts')}
                      valueLabelDisplay="auto"
                      step={1}
                      marks={[
                        { value: 3, label: '3' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' },
                      ]}
                      min={1}
                      max={10}
                    />
                  </Box>
                </SettingItem>
              </SectionContainer>
              
              {/* Notifications */}
              <SectionContainer>
                <SectionTitle sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)' }}>
                  <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                  Notification Settings
                </SectionTitle>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Email Notifications</SettingTitle>
                    <SettingDescription>
                      Enable system notifications via email
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Push Notifications</SettingTitle>
                    <SettingDescription>
                      Enable browser push notifications
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Notify on New User Registration</SettingTitle>
                    <SettingDescription>
                      Send notification when a new user registers
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.notifyOnNewUser}
                    onChange={(e) => handleChange('notifyOnNewUser', e.target.checked)}
                    color="primary"
                    disabled={!settings.emailNotifications}
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Notify on Failed Login</SettingTitle>
                    <SettingDescription>
                      Send notification after multiple failed login attempts
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.notifyOnFailedLogin}
                    onChange={(e) => handleChange('notifyOnFailedLogin', e.target.checked)}
                    color="primary"
                    disabled={!settings.emailNotifications}
                  />
                </SettingItem>
              </SectionContainer>
              
              {/* Maintenance Mode */}
              <SectionContainer>
                <SectionTitle sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)' }}>
                  <WarningIcon color="warning" sx={{ mr: 1 }} />
                  Maintenance Mode
                </SectionTitle>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Enable Maintenance Mode</SettingTitle>
                    <SettingDescription>
                      Take the system offline for maintenance
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                    color="warning"
                  />
                </SettingItem>
                
                {settings.maintenanceMode && (
                  <SettingItem>
                    <SettingLabel>
                      <SettingTitle>Maintenance Message</SettingTitle>
                      <SettingDescription>
                        Message to display to users during maintenance
                      </SettingDescription>
                    </SettingLabel>
                    <TextField
                      multiline
                      rows={3}
                      value={settings.maintenanceMessage}
                      onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                      variant="outlined"
                      fullWidth
                      sx={{ maxWidth: 500 }}
                    />
                  </SettingItem>
                )}
              </SectionContainer>
              
              {/* Caching */}
              <SectionContainer>
                <SectionTitle sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)' }}>
                  <StorageIcon color="primary" sx={{ mr: 1 }} />
                  Caching
                </SectionTitle>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Enable Caching</SettingTitle>
                    <SettingDescription>
                      Improve performance by caching frequently accessed data
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.enableCaching}
                    onChange={(e) => handleChange('enableCaching', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Cache TTL</SettingTitle>
                    <SettingDescription>
                      Time in seconds before cached data expires
                    </SettingDescription>
                  </SettingLabel>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      value={settings.cacheTtl / 60}
                      onChange={(e, value) => handleChange('cacheTtl', (Array.isArray(value) ? value[0] : value) * 60)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} min`}
                      step={5}
                      marks={[
                        { value: 5, label: '5m' },
                        { value: 30, label: '30m' },
                        { value: 60, label: '1h' },
                        { value: 120, label: '2h' },
                      ]}
                      min={1}
                      max={120}
                      disabled={!settings.enableCaching}
                    />
                  </Box>
                </SettingItem>
              </SectionContainer>
              
              {/* API Settings */}
              <SectionContainer>
                <SectionTitle sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)' }}>
                  <ApiIcon color="primary" sx={{ mr: 1 }} />
                  API Settings
                </SectionTitle>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Enable API Access</SettingTitle>
                    <SettingDescription>
                      Allow external applications to access the API
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.enableApiAccess}
                    onChange={(e) => handleChange('enableApiAccess', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>API Rate Limit</SettingTitle>
                    <SettingDescription>
                      Maximum number of API requests per minute per IP: {settings.apiRateLimit}
                    </SettingDescription>
                  </SettingLabel>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      value={settings.apiRateLimit / 100}
                      onChange={(e, value) => handleChange('apiRateLimit', (Array.isArray(value) ? value[0] : value) * 100)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value * 100}`}
                      step={1}
                      marks={[
                        { value: 1, label: '100' },
                        { value: 5, label: '500' },
                        { value: 10, label: '1000' },
                        { value: 20, label: '2000' },
                      ]}
                      min={1}
                      max={20}
                      disabled={!settings.enableApiAccess}
                    />
                  </Box>
                </SettingItem>
              </SectionContainer>
              
              {/* Backup & Restore */}
              <SectionContainer>
                <SectionTitle sx={{ color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)' }}>
                  <CloudIcon color="primary" sx={{ mr: 1 }} />
                  Backup & Restore
                </SectionTitle>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Automatic Backups</SettingTitle>
                    <SettingDescription>
                      Enable automatic system backups
                    </SettingDescription>
                  </SettingLabel>
                  <Switch
                    checked={settings.autoBackup}
                    onChange={(e) => handleChange('autoBackup', e.target.checked)}
                    color="primary"
                  />
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Backup Frequency</SettingTitle>
                    <SettingDescription>
                      How often to create automatic backups
                    </SettingDescription>
                  </SettingLabel>
                  <FormControl size="small" sx={{ minWidth: 200 }} disabled={!settings.autoBackup}>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={settings.backupFrequency}
                      onChange={handleSelectChange}
                      name="backupFrequency"
                      label="Frequency"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Backup Retention</SettingTitle>
                    <SettingDescription>
                      Keep backups for {settings.backupRetention} days
                    </SettingDescription>
                  </SettingLabel>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      value={settings.backupRetention}
                      onChange={handleSliderChange('backupRetention')}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} days`}
                      step={1}
                      marks={[
                        { value: 7, label: '7d' },
                        { value: 30, label: '30d' },
                        { value: 90, label: '90d' },
                        { value: 180, label: '180d' },
                      ]}
                      min={1}
                      max={365}
                      disabled={!settings.autoBackup}
                    />
                  </Box>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Manual Backup</SettingTitle>
                    <SettingDescription>
                      Create a backup of the current system state
                    </SettingDescription>
                  </SettingLabel>
                  <Button
                    variant="outlined"
                    startIcon={<CloudIcon />}
                    onClick={() => console.log('Creating manual backup...')}
                  >
                    Create Backup Now
                  </Button>
                </SettingItem>
                
                <SettingItem>
                  <SettingLabel>
                    <SettingTitle>Restore from Backup</SettingTitle>
                    <SettingDescription>
                      Restore system from a previous backup
                    </SettingDescription>
                  </SettingLabel>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<RefreshIcon />}
                    onClick={() => console.log('Initiating restore...')}
                  >
                    Restore System
                  </Button>
                </SettingItem>
              </SectionContainer>
            </Grid>
            
            {/* Right Column - Summary & Actions */}
            <Grid container spacing={4} sx={{ mt: 1, backgroundColor: 'transparent' }}>
              <Paper sx={{ 
                p: 3, 
                mb: 3, 
                position: 'sticky', 
                top: 20, 
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgb(22, 31, 48)' : 'rgb(248, 250, 252)', 
                color: (theme) => theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(71, 85, 105)',
                boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                borderRadius: '12px',
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(51, 65, 85)' }}>
                  <InfoIcon color="primary" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  System Information
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="System Version" 
                      secondary="v2.4.1" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <StorageIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Database" 
                      secondary="MongoDB 6.0" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <ApiIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="API Version" 
                      secondary="v2" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <UpdateIcon color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Last Updated" 
                      secondary="2 hours ago" 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip 
                          label="Operational" 
                          size="small" 
                          color="success" 
                          variant="outlined"
                        />
                      } 
                    />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Actions
                  </Typography>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<ClearAllIcon />}
                    onClick={() => console.log('Clearing cache...')}
                    sx={{ mb: 1 }}
                  >
                    Clear Cache
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<CachedIcon />}
                    onClick={() => {
                      console.log('Checking for updates...');
                      // TODO: Implement update check
                    }}
                    sx={{ mb: 1 }}
                  >
                    Check for Updates
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
                        console.log('Clearing system logs...');
                        // TODO: Implement log clearing
                      }
                    }}
                  >
                    Clear System Logs
                  </Button>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    System Status
                  </Typography>
                  
                  <Box sx={{ 
                    bgcolor: 'success.light',
                    color: 'success.contrastText',
                    p: 1.5,
                    borderRadius: 1,
                    textAlign: 'center',
                    mb: 2
                  }}>
                    <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="medium">
                      All Systems Operational
                    </Typography>
                    <Typography variant="caption" display="block">
                      Last checked: Just now
                    </Typography>
                  </Box>
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    type="submit"
                    disabled={!hasChanges}
                    sx={{ mb: 1 }}
                  >
                    Save All Changes
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleReset}
                    disabled={!hasChanges}
                  >
                    Discard Changes
                  </Button>
                </Box>
              </Paper>
              
              <Paper sx={{ 
                p: 3, 
                position: 'sticky', 
                top: 400, 
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgb(22, 31, 48)' : 'rgb(248, 250, 252)', 
                color: (theme) => theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(71, 85, 105)',
                boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                borderRadius: '12px',
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(51, 65, 85)' }}>
                  <WarningIcon color="warning" sx={{ verticalAlign: 'middle', mr: 1 }} />
                  System Warnings
                </Typography>
                
                <Alert 
                  severity="warning" 
                  icon={<WarningIcon />}
                  sx={{ mb: 2 }}
                >
                  <AlertTitle>Backup Recommended</AlertTitle>
                  It's been 7 days since your last backup. Consider creating a new backup.
                </Alert>
                
                <Alert 
                  severity="info"
                  icon={<InfoIcon />}
                >
                  <AlertTitle>System Update Available</AlertTitle>
                  Version 2.5.0 is now available. Please update at your earliest convenience.
                </Alert>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
      </Box>
    </ThemeProvider>
  );
};

export default SystemSettings;
