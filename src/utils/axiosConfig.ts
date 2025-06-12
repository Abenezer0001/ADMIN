import axios from 'axios';
import { API_BASE_URL } from './config';

// Debug API_BASE_URL to ensure it's correctly set
console.log('API Configuration:', {
  API_BASE_URL,
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV
});

// Check if API_BASE_URL is properly configured
if (!API_BASE_URL) {
  console.error('WARNING: API_BASE_URL is not configured! Please check your .env file and config.ts');
}

// No need for API connection testing on each load as it's redundant
// and could cause confusion in logs

// Log the actual API URL being used
console.log('Creating axios instance with baseURL:', API_BASE_URL);

// Create axios instance with withCredentials to support cookies
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable sending cookies with every request
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Increase timeout for requests
  timeout: 30000, // 30 seconds
});

// Track authentication state
let isRefreshing = false;
let lastRefreshAttempt = 0; // Track when we last attempted a refresh
let refreshAttemptCount = 0; // Track number of consecutive refresh attempts
let lastSuccessfulRefresh = 0; // Track when we last successfully refreshed

// Track page load state for better authentication handling
let isInitialPageLoad = true; // Flag to track initial page load
const pageLoadStartTime = Date.now(); // Time when page started loading

// Enhanced page load state tracking
const pageLoadState = {
  initialLoadComplete: false,
  transitionPeriod: false,
  hasSeenValidAuth: false,
  hasAuthCookie: false,
  hasAuthSession: false,
  refreshAttemptsDuringLoad: 0
};

// Check for initial auth state indicators
const checkInitialAuthState = () => {
  // Check for authentication indicators
  const hasAuthCookie = document.cookie.includes('access_token') || 
                        document.cookie.includes('refresh_token') || 
                        document.cookie.includes('token') || 
                        document.cookie.includes('refresh') || 
                        document.cookie.includes('auth');
  const hasAuthSession = sessionStorage.getItem('lastSuccessfulAuth') !== null;
  
  pageLoadState.hasAuthCookie = hasAuthCookie;
  pageLoadState.hasAuthSession = hasAuthSession;
  
  if (hasAuthCookie || hasAuthSession) {
    pageLoadState.hasSeenValidAuth = true;
    console.log('Found signs of valid authentication on load', {
      hasAuthCookie,
      hasAuthSession,
      readyState: document.readyState
    });
  }
};

// Run an initial auth check
checkInitialAuthState();

// Handle page load lifecycle
window.addEventListener('load', () => {
  console.log('Page fully loaded, starting transition period', pageLoadState);
  
  // Start transition period
  pageLoadState.transitionPeriod = true;
  
  // Check auth state again
  checkInitialAuthState();
  
  // Allow some additional time for transition after load event
  setTimeout(() => {
    console.log('Transition period complete, moving to normal operation', {
      ...pageLoadState,
      readyState: document.readyState,
      elapsedTime: Date.now() - pageLoadStartTime,
      refreshAttempts: pageLoadState.refreshAttemptsDuringLoad
    });
    
    // Update state
    pageLoadState.initialLoadComplete = true;
    pageLoadState.transitionPeriod = false;
    isInitialPageLoad = false;
  }, 5000); // Keep transition period for 5 seconds after load event
});

// Helper to get comprehensive page load state
const getPageLoadState = () => {
  const now = Date.now();
  const timeSinceStart = now - pageLoadStartTime;
  
  return {
    isInitialLoad: isInitialPageLoad,
    timeSinceStart,
    readyState: document.readyState,
    isReady: document.readyState === 'complete',
    hasTokens: document.cookie.includes('access_token') || document.cookie.includes('refresh_token') || document.cookie.includes('token') || document.cookie.includes('refresh'),
    hasSuccessfulRefresh: lastSuccessfulRefresh > 0,
    timeSinceRefresh: lastSuccessfulRefresh ? now - lastSuccessfulRefresh : null,
    // Include enhanced page load state
    loadState: {
      ...pageLoadState,
      currentPhase: pageLoadState.initialLoadComplete ? 'normal' : 
                   (pageLoadState.transitionPeriod ? 'transition' : 'initial')
    }
  };
};

let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  request: any;
  timestamp: number;
}> = [];

const processQueue = (error: any = null) => {
  console.log(`Processing ${failedQueue.length} queued requests after token refresh ${error ? 'failure' : 'success'}`);
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

// Check if we should attempt a token refresh
const shouldAttemptRefresh = () => {
  const now = Date.now();
  const pageState = getPageLoadState();
  
  // During initial page load, be very permissive with refresh attempts
  if (pageState.isInitialLoad) {
    console.log('Initial page load period, using very relaxed refresh criteria', pageState);
    
    // Use a shorter minimum time between refreshes during initial page load
    if (now - lastRefreshAttempt < 500) { // Only 500ms delay during initial load
      console.log('Skipping refresh - too soon even for initial load', { 
        timeSinceLast: now - lastRefreshAttempt
      });
      return false;
    }
    
    // Allow more attempts during initial load
    const maxInitialAttempts = 8; // Higher limit during initial load
    if (refreshAttemptCount > maxInitialAttempts) {
      console.log('Skipping refresh - exceeded even initial load attempt limit', {
        attemptCount: refreshAttemptCount,
        maxInitialAttempts
      });
      return false;
    }
    
    return true;
  }
  
  // Page has loaded but still in early page state
  const isEarlyPageState = pageState.timeSinceStart < 5000 && document.readyState !== 'complete';
  if (isEarlyPageState) {
    console.log('Early page state detected, using relaxed refresh criteria', pageState);
    
    // Still enforce some minimum time between refreshes during early page state
    if (now - lastRefreshAttempt < 1000) { // 1 second during early page state
      console.log('Skipping refresh - too soon for early page state', { 
        timeSinceLast: now - lastRefreshAttempt
      });
      return false;
    }
    
    // Allow more attempts during early page state
    if (refreshAttemptCount > 5) {
      console.log('Skipping refresh - too many attempts for early page state', {
        attemptCount: refreshAttemptCount
      });
      return false;
    }
    
    return true;
  }
  
  // Normal operation (not during initial or early page load)
  if (now - lastRefreshAttempt < 3000) {
    console.log('Skipping refresh - too soon since last attempt', { 
      timeSinceLast: now - lastRefreshAttempt
    });
    return false;
  }
  
  // Limit consecutive refresh attempts to prevent infinite loops
  if (refreshAttemptCount > 3) {
    console.log('Skipping refresh - too many consecutive attempts', {
      attemptCount: refreshAttemptCount
    });
    // Reset after some time
    if (now - lastRefreshAttempt > 30000) {
      refreshAttemptCount = 0;
    }
    return false;
  }
  
  return true;
};

// Add request interceptor to ensure proper authentication
api.interceptors.request.use(
  (config) => {
    // Ensure cookies are properly set
    const cookies = document.cookie;
    console.log('Request interceptor - Available cookies:', cookies);
    
    // Extract access_token from cookies if available
    const accessTokenMatch = cookies.match(/access_token=([^;]+)/);
    if (accessTokenMatch) {
      const token = accessTokenMatch[1];
      console.log('Found access_token, adding as Authorization header');
      
      // Add both cookie and Authorization header for maximum compatibility
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
        'Cookie': cookies
      };
    }
    
    // Ensure withCredentials is always true
    config.withCredentials = true;
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses with more details
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      fullUrl: `${response.config.baseURL}${response.config.url}`,
      contentType: response.headers['content-type'],
      data: response.data,
      // Extract useful information for debugging
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : []
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 error detected, checking if token refresh is needed', {
        url: originalRequest.url,
        isAuthPath: originalRequest.url?.includes('/auth/'),
        cookies: document.cookie ? 'present' : 'none'
      });
      
      // Don't attempt refresh for auth endpoints to avoid infinite loops
      if (originalRequest.url && 
          (originalRequest.url.includes('/auth/login') || 
           originalRequest.url.includes('/auth/logout'))) {
        console.log('Auth endpoint failed with 401, skipping token refresh');
        return Promise.reject(error);
      }
      
      // Check for initial page load with multiple requests
      const isPageLoad = document.readyState !== 'complete';
      if (isPageLoad) {
        console.log('Page is still loading, proceeding with caution', {
          readyState: document.readyState
        });
      }
      
      // Handle in-progress refresh
      if (isRefreshing) {
        // If already refreshing, queue this request to retry after refresh completes
        console.log('Token refresh already in progress, queueing request:', originalRequest.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              console.log('Retrying queued request after successful refresh:', originalRequest.url);
              resolve(api(originalRequest));
            },
            reject: (err) => {
              console.log('Rejecting queued request after failed refresh:', originalRequest.url);
              reject(err);
            },
            request: originalRequest,
            timestamp: Date.now()
          });
        });
      }
      
      // Check if we should attempt a refresh
      if (!shouldAttemptRefresh()) {
        return Promise.reject(error);
      }
      
      // Update refresh tracking
      refreshAttemptCount++;
      lastRefreshAttempt = Date.now();
      
      // Track refreshes during page load for better diagnostics
      if (isInitialPageLoad || pageLoadState.transitionPeriod) {
        pageLoadState.refreshAttemptsDuringLoad++;
      }
      
      const pageState = getPageLoadState();
      console.log('Starting token refresh...', {
        attemptCount: refreshAttemptCount,
        timestamp: new Date().toISOString(),
        phase: pageState.loadState.currentPhase,
        refreshAttemptsDuringLoad: pageLoadState.refreshAttemptsDuringLoad
      });
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Use the configured api instance for consistency with cookies
        console.log('Attempting to refresh token');
        
        // Adjust timeout based on page load state
        const isPageLoad = document.readyState !== 'complete';
        const timeout = isPageLoad ? 15000 : 10000; // Longer timeout during page load
        
        const response = await api.post('/auth/refresh-token', {}, {
          timeout, // Use context-aware timeout
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        console.log('Token refresh response:', {
          status: response.status,
          success: (response.data as any)?.success
        });
        
        if (response.status === 200) {
          console.log('Token refresh successful, processing queued requests');
          // Reset refresh attempt counter on success
          refreshAttemptCount = 0;
          lastSuccessfulRefresh = Date.now();
          
          // Store successful refresh timestamp for debugging
          sessionStorage.setItem('lastSuccessfulRefresh', new Date().toISOString());
          
          // Log page load state at successful refresh
          console.log('Page state at successful refresh:', getPageLoadState());
          
          // Process any queued requests
          processQueue();
          
          // Retry the original request
          return api(originalRequest);
        } else {
          console.warn('Token refresh returned unexpected status:', response.status);
          throw new Error('Token refresh failed with status ' + response.status);
        }
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        
        // Log detailed refresh error information
        if (refreshError?.response) {
          console.error('Refresh error details:', {
            status: refreshError.response.status,
            statusText: refreshError.response.statusText,
            data: refreshError.response.data
          });
        }
        
        // Process failed queue
        processQueue(refreshError);
        
        // Only redirect to login for confirmed auth failures, 
        // not network errors or timeouts
        const isAuthFailure = 
          refreshError?.response?.status === 401 || 
          refreshError?.response?.status === 403;
        
        // Get comprehensive page state
        const pageState = getPageLoadState();
        const hasCookies = document.cookie.length > 0;
        const hasSuccessfulLoginBefore = sessionStorage.getItem('lastSuccessfulAuth') !== null;
            
        // Log detailed state information for debugging
        console.log('Page state during refresh failure:', {
          ...pageState,
          hasCookies,
          hasSuccessfulLoginBefore,
          refreshAttemptCount,
          isAuthFailure,
          authFailureStatus: refreshError?.response?.status
        });
            
        // Enhanced redirect logic with special handling for page load phases:
        // 1. Must be definitive auth failure (not network error)
        // 2. Each phase has different requirements for redirect
        // 3. Take into account whether we've ever seen valid auth
        // 4. Never redirect if already on login page
        const phase = pageState.loadState.currentPhase;
        const hasEverSeenValidAuth = pageLoadState.hasSeenValidAuth || hasCookies || hasSuccessfulLoginBefore;
        
        let redirectThreshold;
        if (phase === 'initial') {
          // Initial load - extremely conservative (only redirect as last resort)
          redirectThreshold = hasEverSeenValidAuth ? 8 : 6;
        } else if (phase === 'transition') {
          // Transition period - still cautious
          redirectThreshold = hasEverSeenValidAuth ? 5 : 4;
        } else {
          // Normal operation - standard threshold
          redirectThreshold = 2;
        }
        
        console.log('Evaluating redirect criteria:', {
          phase,
          hasEverSeenValidAuth,
          refreshAttemptCount,
          redirectThreshold,
          isAuthFailure
        });
        
        const shouldRedirect = 
            isAuthFailure && 
            (
              // Phase-specific threshold check
              refreshAttemptCount >= redirectThreshold ||
              // Special case: definitely no auth after multiple attempts
              (!hasEverSeenValidAuth && refreshAttemptCount >= 3)
            ) && 
            window.location.pathname !== '/login';
        
        if (shouldRedirect) {
            console.log('Authentication failure confirmed, redirecting to login', {
              readyState: document.readyState,
              attemptCount: refreshAttemptCount,
              pageLoadTime: pageState.timeSinceStart,
              hasCookies,
              hasSuccessfulLoginBefore
            });
            
            // Store detailed failure information for debugging
            const failureInfo = {
              timestamp: new Date().toISOString(),
              status: refreshError?.response?.status,
              message: refreshError?.message,
              attemptCount: refreshAttemptCount,
              readyState: document.readyState,
              pageLoadTime: pageState.timeSinceStart,
              url: window.location.href,
              hasCookies,
              hasSuccessfulLoginBefore
            };
            
            // Use sessionStorage to flag the auth failure for debugging
            sessionStorage.setItem('tokenRefreshFailure', JSON.stringify(failureInfo));
            
            // Use variable delay based on page state
            let redirectDelay = 300; // Default delay
            
            if (pageState.isInitialLoad) {
                redirectDelay = 1500; // Much longer delay during initial page load
                console.log('Using extended delay for redirect during initial page load');
            } else if (!pageState.isReady) {
                redirectDelay = 800; // Longer delay during early page state
            }
            
            console.log(`Will redirect to login in ${redirectDelay}ms`);
            
            // Redirect after calculated delay to ensure console logs are visible
            // and give time for any pending auth checks to complete
            setTimeout(() => {
                // Double-check we still need to redirect (auth state might have changed)
                if (sessionStorage.getItem('lastSuccessfulAuth') === null) {
                    console.log('Executing redirect to login');
                    window.location.href = '/login';
                } else {
                    console.log('Auth state changed during delay, canceling redirect', {
                        lastSuccessfulAuth: sessionStorage.getItem('lastSuccessfulAuth'),
                        lastSuccessfulRefresh: sessionStorage.getItem('lastSuccessfulRefresh'),
                        currentPath: window.location.pathname
                    });
                    
                    // Clean up failure info since we're no longer failing
                    sessionStorage.removeItem('tokenRefreshFailure');
                    
                    // Check for edge case where we have auth but still on login page
                    if (window.location.pathname === '/login') {
                        console.log('Authenticated but on login page, redirecting to dashboard');
                        window.location.href = '/dashboard';
                    }
                }
            }, redirectDelay);
        } else {
            console.log('Not redirecting to login despite refresh failure', {
              isPageLoad: pageState.isInitialLoad,
              isEarlyPageLoad: pageState.timeSinceStart < 5000,
              pageLoadTime: pageState.timeSinceStart,
              attemptCount: refreshAttemptCount,
              hasResponse: !!refreshError?.response,
              hasCookies,
              hasSuccessfulLoginBefore
            });
        }
        
        return Promise.reject(refreshError);
      } finally {
        console.log('Token refresh process completed', {
          timestamp: new Date().toISOString(),
          attemptCount: refreshAttemptCount
        });
        isRefreshing = false;
      }
    }
    
    // Log detailed error information before rejecting
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
        headers: error.response.headers,
        method: error.config?.method
      });
      
      // Special handling for common error status codes
      if (error.response.status === 404) {
        console.error('API ENDPOINT NOT FOUND. Check if the URL is correct:', error.config?.url);
        
        // Try alternative URL without /api prefix
        if (error.config?.url?.includes('/api/')) {
          console.log('Original URL has /api/ prefix. Consider removing it in config.ts');
        }
      } else if (error.response.status === 400) {
        console.error('BAD REQUEST: The server rejected the request. Details:', error.response.data);
        console.log('Request payload was:', error.config?.data);
      } else if (error.response.status === 403) {
        console.error('FORBIDDEN: Check permissions and authentication', error.response.data);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 