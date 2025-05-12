/**
 * Helper functions for authentication using HTTP-only cookies
 */

/**
 * Cleans up authentication state and session data
 * Note: HTTP-only cookies are cleared by the server during logout
 */
export function cleanupAuthState(): void {
  // Clear any local storage items used for application state
  localStorage.removeItem('currentRestaurantId');
  localStorage.removeItem('user');
  
  // Clear all session storage (recommended for complete cleanup)
  sessionStorage.clear();
  
  // Note: HTTP-only cookies cannot be cleared via JavaScript
  // They must be cleared by the server through the logout endpoint
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
 * Note: Demo mode still uses sessionStorage as it's temporary and doesn't require
 * the same security measures as real authentication
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

/**
 * Check if user has an active session
 * This is a lightweight check that doesn't make a server request
 * For a full auth check, use AuthService.isAuthenticated()
 */
export function hasActiveSession(): boolean {
  if (isDemoMode()) {
    return !!getDemoToken();
  }
  
  // In regular mode, we rely on the server's session check
  // through AuthService.isAuthenticated() which will verify the HTTP-only cookies
  return true;
}
