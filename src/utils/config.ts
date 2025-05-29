// Import temporary environment configuration
import envConfig from '../tempEnvConfig';

// Get environment variables (using our temporary config override if available)
const ENV_API_BASE_URL = window.ENV?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
const ENV_SOCKET_URL = window.ENV?.VITE_SOCKET_URL || import.meta.env.VITE_SOCKET_URL;

// Debug log the raw environment variables
console.log('Raw environment configuration:', {
  ENV_API_BASE_URL,
  ENV_SOCKET_URL,
  NODE_ENV: import.meta.env.MODE,
  isDev: import.meta.env.DEV
});

/**
 * Validate and format API URL
 * This ensures we have a properly formatted URL with no trailing slashes
 */
function getValidApiUrl(): string {
  // If environment variable is set, use it
  if (ENV_API_BASE_URL) {
    // Remove trailing slash if present
    const baseUrl = ENV_API_BASE_URL.endsWith('/')
      ? ENV_API_BASE_URL.slice(0, -1)
      : ENV_API_BASE_URL;
    
    // Ensure it ends with /api
    if (!baseUrl.includes('/api')) {
      console.log(`Adding /api suffix to base URL: ${baseUrl}/api`);
      return `${baseUrl}/api`;
    }
    
    return baseUrl;
  }

  // Fallback for development
  if (import.meta.env.DEV) {
    const fallbackUrl = 'http://localhost:3001/api';
    console.warn(`API_BASE_URL not found in environment, using default: ${fallbackUrl}`);
    return fallbackUrl;
  }

  // Show error for production
  console.error('API_BASE_URL must be configured in environment');
  return 'http://localhost:3001/api'; // Return a default anyway to prevent crashes
}

/**
 * Validate and format Socket URL
 */
function getValidSocketUrl(): string {
  // If explicit socket URL is set, use it
  if (ENV_SOCKET_URL) {
    // Remove trailing slash if present
    return ENV_SOCKET_URL.endsWith('/')
      ? ENV_SOCKET_URL.slice(0, -1)
      : ENV_SOCKET_URL;
  }

  // Use API URL as fallback
  const apiUrl = getValidApiUrl();
  // Convert from /api to /socket.io if needed
  const socketUrl = apiUrl.replace('/api', '');
  console.log(`Using API URL as base for socket URL: ${socketUrl}`);
  return socketUrl;
}

// Export the validated URLs
export const API_BASE_URL = getValidApiUrl();
export const SOCKET_URL = getValidSocketUrl();

// Log the final configuration
console.log('Final API configuration:', {
  API_BASE_URL,
  SOCKET_URL,
  isProduction: import.meta.env.PROD
});

// Export other configuration constants
export const APP_CONFIG = {
  API_TIMEOUT: 30000, // 30 seconds
  DEFAULT_LANGUAGE: 'en',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0'
};
