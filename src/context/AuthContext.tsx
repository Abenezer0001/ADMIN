import React from 'react';
import AuthService, { User, LoginCredentials, RegisterCredentials } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { isDemoMode } from '../services/authHelpers';

// Enable debug logging only in development mode
const DEBUG = import.meta.env.DEV || import.meta.env.MODE === 'development';

// Helper for consistent auth event logging
const logAuthEvent = (event: string, data?: any): void => {
  if (DEBUG) {
    console.log(`[Auth] ${event}`, data || '');
    
    // Store recent auth events in session storage for debugging
    try {
      const events = JSON.parse(sessionStorage.getItem('authDebugEvents') || '[]');
      events.unshift({ 
        timestamp: new Date().toISOString(), 
        event, 
        data: data ? JSON.parse(JSON.stringify(data)) : null 
      });
      
      // Keep only the last 20 events
      sessionStorage.setItem('authDebugEvents', JSON.stringify(events.slice(0, 20)));
    } catch (e) {
      console.error('Error logging auth event:', e);
    }
  }
};

// Helper to detect page reload
const isPageReload = (): boolean => {
  return (
    window.performance && 
    window.performance.navigation && 
    window.performance.navigation.type === 1
  );
};

// Define types for auth responses
interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  retryAuthCheck: () => Promise<boolean>;
  updateUserProfile: (updatedUser: User) => void;
}

// Create the auth context with a default value
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setError: () => {},
  login: async () => ({ success: false }),
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
  retryAuthCheck: async () => false,
  updateUserProfile: () => {},
});

// Define props for the AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

// Create the AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true); // Start with loading true
  const [error, setError] = React.useState<string | null>(null);
  const [isInitialCheck, setIsInitialCheck] = React.useState<boolean>(true);
  const authCheckInProgressRef = React.useRef<boolean>(false);
  const authCheckTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const componentMountedRef = React.useRef<boolean>(true);
  const navigate = useNavigate();

  // Initialize auth service - using the class directly, not instantiating
  const authService = AuthService;
  
  // Log initial mount with timestamp
  React.useEffect(() => {
    const pageLoadInfo = {
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      isReload: isPageReload(),
      referrer: document.referrer,
      readyState: document.readyState
    };
    
    logAuthEvent('AuthProvider mounted', pageLoadInfo);
    
    // Set mounted ref and handle cleanup
    componentMountedRef.current = true;
    
    return () => {
      componentMountedRef.current = false;
      logAuthEvent('AuthProvider unmounted');
    };
  }, []);

  // Check if user is already logged in and set up token refresh
  // Debounced auth check function to prevent multiple simultaneous checks
  const debouncedAuthCheck = React.useCallback((immediate: boolean = false) => {
    logAuthEvent('Debounced auth check requested', { 
      immediate, 
      inProgress: authCheckInProgressRef.current,
      currentPath: window.location.pathname
    });
    
    // Clear any pending timeout
    if (authCheckTimeoutRef.current) {
      clearTimeout(authCheckTimeoutRef.current);
      authCheckTimeoutRef.current = null;
    }
    
    // If a check is already in progress, don't start another one
    if (authCheckInProgressRef.current) {
      logAuthEvent('Auth check already in progress, skipping');
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve) => {
      const delay = immediate ? 0 : 300; // Use 0 for immediate check, otherwise debounce
      
      authCheckTimeoutRef.current = setTimeout(() => {
        // Check if component is still mounted before proceeding
        if (!componentMountedRef.current) {
          logAuthEvent('Aborting auth check - component unmounted');
          resolve();
          return;
        }
        
        checkAuthStatus()
          .then(resolve)
          .catch((error) => {
            logAuthEvent('Auth check failed in debounced check', { error: error.message });
            resolve(); // Resolve anyway to prevent hanging promises
          });
      }, delay);
    });
  }, []);
  
  // Main auth check function
  const checkAuthStatus = async (): Promise<void> => {
    // If already checking, don't start another check
    if (authCheckInProgressRef.current) {
      logAuthEvent('Auth check already in progress, returning');
      return;
    }
    
    // Record performance and context information
    const startTime = performance.now();
    const pageContext = {
      isInitialCheck,
      path: window.location.pathname,
      referrer: document.referrer,
      readyState: document.readyState,
      isReload: isPageReload(),
      hasCookies: document.cookie.length > 0
    };
    
    logAuthEvent('Starting authentication check', pageContext);
    authCheckInProgressRef.current = true;
    
    // Set loading state only if this is the initial check or we're explicitly revalidating
    if (isInitialCheck) {
      setIsLoading(true);
    }
    
    try {
      // Perform authentication check with performance tracking
      const authCheckStartTime = performance.now();
      const isAuth = await authService.isAuthenticated();
      const authCheckDuration = Math.round(performance.now() - authCheckStartTime);
      
      logAuthEvent('Authentication check result', { 
        isAuth, 
        duration: authCheckDuration,
        timestamp: new Date().toISOString()
      });
      
      if (!componentMountedRef.current) {
        logAuthEvent('Component unmounted during auth check');
        return;
      }
      
      if (isAuth) {
        try {
          // Get user data with performance tracking
          const userDataStartTime = performance.now();
          const userData = await authService.getCurrentUser(isDemoMode());
          const userDataDuration = Math.round(performance.now() - userDataStartTime);
          
          logAuthEvent('User data retrieved', { 
            success: !!userData, 
            duration: userDataDuration,
            hasCookies: document.cookie.length > 0
          });
          
          if (!componentMountedRef.current) {
            logAuthEvent('Component unmounted during user data fetch');
            return;
          }
          
          if (userData) {
            // Track previous auth state for transition logging
            const wasAuthenticated = isAuthenticated;
            
            // Successfully authenticated with user data
            setUser(userData);
            setIsAuthenticated(true);
            
            // Log authentication state transition
            if (!wasAuthenticated) {
              logAuthEvent('Authentication state transition', { 
                from: 'unauthenticated', 
                to: 'authenticated',
                userId: userData.id,
                role: userData.role
              });
            }
            
            // Store detailed authentication success info
            const authSuccessInfo = {
              timestamp: new Date().toISOString(),
              userId: userData.id,
              role: userData.role,
              path: window.location.pathname,
              isReload: isPageReload(),
              totalDuration: Math.round(performance.now() - startTime)
            };
            
            sessionStorage.setItem('lastSuccessfulAuth', JSON.stringify(authSuccessInfo));
            logAuthEvent('Authentication successful', authSuccessInfo);
          } else {
            // Auth success but no user data - handle failure
            logAuthEvent('Auth success but no user data', { isInitialCheck });
            await handleAuthFailure('No user data received');
          }
        } catch (userErr) {
          // Error getting user data
          logAuthEvent('Error getting user data', { 
            error: userErr.message,
            stack: userErr.stack
          });
          
          await handleAuthFailure(`Failed to fetch user data: ${userErr.message}`);
        }
      } else {
        // Not authenticated
        logAuthEvent('User is not authenticated', {
          isInitialCheck,
          path: window.location.pathname,
          hasCookies: document.cookie.length > 0
        });
        
        if (componentMountedRef.current) {
          setUser(null);
          setIsAuthenticated(false);
          
          // Track authentication state transition
          if (isAuthenticated) {
            logAuthEvent('Authentication state transition', { 
              from: 'authenticated', 
              to: 'unauthenticated',
              reason: 'Auth check returned false'
            });
          }
          
          await handleAuthFailure('Not authenticated');
        }
      }
    } catch (err) {
      // Auth check failed completely
      logAuthEvent('Auth check error', { 
        error: err.message,
        stack: err.stack,
        isInitialCheck
      });
      
      if (componentMountedRef.current) {
        setUser(null);
        setIsAuthenticated(false);
        await handleAuthFailure(`Auth check error: ${err.message}`);
      }
    } finally {
      // Calculate total duration for performance tracking
      const totalDuration = Math.round(performance.now() - startTime);
      
      // Log completion with performance metrics
      logAuthEvent('Auth check completed', {
        duration: totalDuration,
        isAuthenticated,
        isInitialCheck,
        path: window.location.pathname
      });
      
      // Update loading and initial check state
      if (componentMountedRef.current) {
        setIsLoading(false);
        setIsInitialCheck(false);
      }
      
      // Mark auth check as complete
      authCheckInProgressRef.current = false;
    }
  };
  
  // Helper function to handle authentication failures
  const handleAuthFailure = async (reason: string): Promise<void> => {
    if (!componentMountedRef.current) return;
    
    // Store detailed failure information
    const failureInfo = {
      timestamp: new Date().toISOString(),
      reason,
      path: window.location.pathname,
      referrer: document.referrer,
      isReload: isPageReload(),
      hasCookies: document.cookie.length > 0,
      hasToken: document.cookie.includes('token'),
      readyState: document.readyState
    };
    
    // Log and store failure details
    logAuthEvent('Auth failure', failureInfo);
    sessionStorage.setItem('authFailureReason', reason);
    sessionStorage.setItem('authFailureInfo', JSON.stringify(failureInfo));
  };
  
  // Setup token refresh function
  const setupTokenRefresh = React.useCallback(() => {
    console.log('Setting up token refresh interval');
    const interval = setInterval(async () => {
      if (isAuthenticated) {
        try {
          console.log('Scheduled token refresh starting...');
          const refreshed = await authService.refreshToken();
          console.log('Token refresh result:', refreshed);
          
          if (!refreshed) {
            console.log('Token refresh failed, rechecking auth status');
            await debouncedAuthCheck(true);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          await debouncedAuthCheck(true);
        }
      } else {
        console.log('Not authenticated, skipping token refresh');
      }
    }, 14 * 60 * 1000); // 14 minutes
    
    return interval;
  }, [isAuthenticated, debouncedAuthCheck]);
  
  // Authentication setup effect
  React.useEffect(() => {
    console.log('Auth provider mounted, starting initial checks');
    let refreshInterval: NodeJS.Timeout | null = null;
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        await debouncedAuthCheck(true); // Immediate check
        
        if (!isMounted) return;
        
        // Only set up refresh interval if not in demo mode
        if (!isDemoMode()) {
          refreshInterval = setupTokenRefresh();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };
    
    initializeAuth();
    
    // Cleanup function
    return () => {
      console.log('Auth provider unmounting, cleaning up');
      isMounted = false;
      
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
        authCheckTimeoutRef.current = null;
      }
    };
  }, [debouncedAuthCheck, setupTokenRefresh]);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      
      // Check if login was successful
      if (response && response.success === true && response.user) {
        // Update state
        setUser(response.user);
        setIsAuthenticated(true);
        return response; // Return the response for the Login component to handle navigation
      } else {
        // Authentication failed with a response
        const errorMessage = response?.error || 'Authentication failed. Please check your credentials.';
        setError(errorMessage);
        return response; // Return the error response for handling
      }
    } catch (err: any) {
      // Unexpected error
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      
      // Update state
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  // Retry auth check function for recovery from failures
  const retryAuthCheck = async (): Promise<boolean> => {
    console.log('Manually retrying authentication check');
    setIsLoading(true);
    try {
      await debouncedAuthCheck(true); // Force immediate check
      return isAuthenticated; // Return the updated auth state
    } catch (err) {
      console.error('Manual auth retry failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log('Logout requested');
    setIsLoading(true);
    try {
      console.log('Logging out user...');
      await authService.logout();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      console.log('User logged out, redirecting to login');
      
      // Clear any stored auth failure info and debug data
      sessionStorage.removeItem('authFailureReason');
      sessionStorage.removeItem('lastSuccessfulAuth');
      sessionStorage.removeItem('lastAuthFailureInfo');
      sessionStorage.removeItem('redirectPath');
      sessionStorage.removeItem('authFailureTimestamp');
      
      // Clear any demo-mode related data if applicable
      if (isDemoMode()) {
        sessionStorage.removeItem('demoToken');
        sessionStorage.removeItem('demoRestaurantId');
        sessionStorage.removeItem('demoRestaurantName');
        sessionStorage.removeItem('demoEmail');
        sessionStorage.removeItem('isDemo');
      }
      
      // Navigate to login page
      navigate('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      
      // Even if logout fails with the server, clear local state
      setUser(null);
      setIsAuthenticated(false);
      setError(err.message || 'Logout failed on server but session was cleared locally.');
      
      // Force navigation to login even if there's an error
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = (): void => {
    setError(null);
  };

  // Update user profile function
  const updateUserProfile = (updatedUser: User): void => {
    setUser(updatedUser);
    // Also update session storage for consistency
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        setError,
        login,
        register,
        logout,
        clearError,
        retryAuthCheck,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
