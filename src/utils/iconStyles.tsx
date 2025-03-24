import React from 'react';
import { alpha } from '@mui/material/styles';
import { IconProps, ButtonColor } from '../types/common';
import { SvgIconProps } from '@mui/material/SvgIcon';

// Define color palette type
type ColorPalette = {
  lightest: string;
  light: string;
  main: string;
  dark: string;
  darkest: string;
};

// Define color scheme type
type ColorScheme = {
  primary: ColorPalette;
  secondary: ColorPalette;
  error: ColorPalette;
  warning: ColorPalette;
  info: ColorPalette;
  success: ColorPalette;
};

// Define icon styles configuration
interface IconStyleConfig {
  color?: string;
  variant?: 'outlined' | 'filled' | 'rounded';
  size?: number;
  padding?: number;
  hoverEffect?: boolean;
  backgroundOpacity?: number;
  customStyles?: React.CSSProperties;
  direction?: 'left' | 'right' | 'up' | 'down';
  opacity?: number;
}

// Define styled icon options
type StyledIconOptions = {
  color?: ButtonColor;
  variant?: keyof ColorPalette;
  size?: number;
  padding?: number;
  hoverEffect?: boolean;
  backgroundOpacity?: number;
  customStyles?: React.CSSProperties;
};

// Color palette definition
const COLOR_PALETTE: ColorScheme = {
  primary: {
    lightest: '#E6E6FA',  // Lavender
    light: '#9370DB',     // Medium Purple
    main: '#6A5ACD',      // Slate Blue
    dark: '#483D8B',      // Dark Slate Blue
    darkest: '#191970'    // Midnight Blue
  },
  secondary: {
    lightest: '#E0FFFF',  // Light Cyan
    light: '#40E0D0',     // Turquoise
    main: '#4ECDC4',      // Medium Turquoise
    dark: '#008B8B',      // Dark Cyan
    darkest: '#005555'    // Deep Teal
  },
  error: {
    lightest: '#FFE4E1',  // Misty Rose
    light: '#FF6B6B',     // Pastel Red
    main: '#FF4757',      // Bright Red
    dark: '#FF0000',      // Pure Red
    darkest: '#8B0000'    // Dark Red
  },
  warning: {
    lightest: '#FFF9C4',  // Light Yellow
    light: '#FFD700',     // Gold
    main: '#FFA500',      // Orange
    dark: '#FF8C00',      // Dark Orange
    darkest: '#B8860B'    // Dark Goldenrod
  },
  info: {
    lightest: '#E6F2FF',  // Pale Blue
    light: '#45B7D1',     // Sky Blue
    main: '#1E90FF',      // Dodger Blue
    dark: '#0066CC',      // Strong Blue
    darkest: '#00008B'    // Dark Blue
  },
  success: {
    lightest: '#E6FFE6',  // Pale Green
    light: '#32CD32',     // Lime Green
    main: '#2ECC71',      // Emerald Green
    dark: '#27AE60',      // Dark Emerald
    darkest: '#006400'    // Dark Green
  }
};

// Utility function to get color from palette
const getColorFromPalette = (baseColor: keyof ColorScheme, shade: keyof ColorPalette = 'main'): string => {
  return COLOR_PALETTE[baseColor][shade];
};

// Icon styling function with type-safe parameters
export const createStyledIcon = (
  IconComponent: React.ComponentType<SvgIconProps>, 
  options: StyledIconOptions = {}
): React.ReactElement => {
  const {
    color = 'primary',
    variant = 'main',
    size = 24,
    padding = 0.75,
    hoverEffect = true,
    backgroundOpacity = 0.1,
    customStyles = {}
  } = options;

  // Determine color based on input
  const iconColor = color.startsWith('#') 
    ? color 
    : getColorFromPalette(color as keyof ColorScheme);

  return (
    <IconComponent 
      sx={{
        color: iconColor,
        fontSize: size,
        background: alpha(iconColor, backgroundOpacity),
        borderRadius: '50%',
        p: padding,
        transition: 'all 0.3s ease',
        boxShadow: `0 2px 5px ${alpha(iconColor, 0.2)}`,
        ...(hoverEffect && {
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 4px 10px ${alpha(iconColor, 0.3)}`,
            background: alpha(iconColor, backgroundOpacity * 2)
          }
        }),
        ...customStyles
      }}
    />
  );
};

interface IconStyleProps {
  IconComponent: React.ElementType;
  color?: string;
  size?: number;
  variant?: 'filled' | 'outlined';
  padding?: string;
  hoverEffect?: 'scale' | 'shadow' | 'none';
  customStyles?: React.CSSProperties;
}

const createIconStyle = (props: IconStyleProps) => {
  const { 
    IconComponent,
    color = '#333',
    size = 24,
    variant = 'filled',
    padding = '8px',
    hoverEffect = 'none',
    customStyles = {}
  } = props;
  // Add implementation here
};

// Icon map type and function
type IconMap = Record<string, React.ComponentType<SvgIconProps>>;

/**
 * Generate a comprehensive set of styled icons with advanced options
 * @param {Object} iconMap - Mapping of icon names to icon components
 * @param {Object} [globalOptions] - Default styling options
 * @returns {Object} Styled icons
 */
export const generateStyledIcons = (
  iconMap: IconMap, 
  globalOptions: StyledIconOptions = {}
): { [key: string]: React.ReactElement } => {
  return Object.entries(iconMap).reduce((acc, [key, IconComponent]) => {
    // Determine color and options based on key name
    const defaultOptions: StyledIconOptions = { ...globalOptions };
    
    if (key.includes('Orders')) defaultOptions.color = 'error';
    if (key.includes('Inventory')) defaultOptions.color = 'success';
    if (key.includes('Users')) defaultOptions.color = 'info';
    if (key.includes('Invoice')) defaultOptions.color = 'warning';
    if (key.includes('Dashboard')) defaultOptions.color = 'primary';
    
    acc[key] = createStyledIcon(IconComponent, defaultOptions);
    return acc;
  }, {});
};

/**
 * Create a themed color gradient for backgrounds or overlays
 * @param {string} baseColor - Base color key
 * @param {Object} [options] - Gradient customization options
 * @returns {string} CSS gradient string
 */
export const createColorGradient = (
  baseColor: ButtonColor, 
  options: { direction?: string; variant?: keyof ColorPalette; opacity?: number } = {}
): string => {
  const {
    direction = 'to right',
    variant = 'main',
    opacity = 0.5
  } = options;

  const colorScheme = COLOR_PALETTE[baseColor] || COLOR_PALETTE.primary;
  const startColor = alpha(colorScheme.light, opacity);
  const endColor = alpha(colorScheme.dark, opacity);

  return `linear-gradient(${direction}, ${startColor}, ${endColor})`;
};
