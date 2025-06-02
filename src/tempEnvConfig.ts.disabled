// Temporary environment configuration override
// Import this file at the top of main.tsx or config.ts to override environment settings

// Set environment variables
window.ENV = {
  VITE_API_BASE_URL: 'http://localhost:3001/api',
  VITE_SOCKET_URL: 'http://localhost:3001',
  MODE: 'development',
  DEV: true
};

// Force log all cookies for debugging
console.log('Document cookies:', document.cookie);
console.log('Current origin:', window.location.origin);

console.log('🔧 Temporary environment configuration applied:', window.ENV);

// Add to global window object for TypeScript
declare global {
  interface Window {
    ENV: {
      VITE_API_BASE_URL: string;
      VITE_SOCKET_URL: string;
      MODE: string;
      DEV: boolean;
    };
  }
}

export default window.ENV;
