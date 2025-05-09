/**
 * Helper functions for authentication
 */

/**
 * Removes all authentication tokens and session data
 */
export function removeTokens(): void {
  // Clear any local storage items
  localStorage.removeItem('currentRestaurantId');
  localStorage.removeItem('user');
  
  // Clear any session storage items
  sessionStorage.removeItem('demoToken');
  sessionStorage.removeItem('demoRestaurantId');
  sessionStorage.removeItem('demoRestaurantName');
  sessionStorage.removeItem('demoEmail');
  sessionStorage.removeItem('isDemo');
  
  // Clear auth cookies by setting expired date
  document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * Check if we're in demo mode
 */
export function isDemoMode(): boolean {
  const path = window.location.pathname;
  return path.includes('/demo/') || path.match(/\/[a-f0-9]{12}/) !== null;
}

/**
 * Get the demo token from URL or session storage
 */
export function getDemoToken(): string | null {
  // First check sessionStorage
  const storedToken = sessionStorage.getItem('demoToken');
  if (storedToken) return storedToken;
  
  // Then check the URL path
  const path = window.location.pathname;
  const match = path.match(/\/[a-f0-9]{12}/);
  if (match) {
    const token = match[0].substring(1); // Remove the leading slash
    return token;
  }
  
  return null;
}
