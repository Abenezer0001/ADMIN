import React from 'react';
import AuthService, { User, LoginCredentials, RegisterCredentials } from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { isDemoMode } from '../services/authHelpers';

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
});

// Define props for the AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

// Create the AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize auth service - using the class directly, not instantiating
  const authService = AuthService;

  // Check if user is already logged in and set up token refresh
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        if (await authService.isAuthenticated()) {
          // Verify token and get user data
          const userData = await authService.getCurrentUser(isDemoMode());
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    
    // Set up token refresh interval
    let refreshInterval: NodeJS.Timeout;
    
    if (!isDemoMode()) {
      // Refresh token every 14 minutes (assuming 15-minute token expiry)
      refreshInterval = setInterval(async () => {
        try {
          const refreshed = await authService.refreshToken();
          if (!refreshed) {
            // If refresh fails, check authentication status again
            await checkAuthStatus();
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          await checkAuthStatus();
        }
      }, 14 * 60 * 1000); // 14 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

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
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Logout failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = (): void => {
    setError(null);
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
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
