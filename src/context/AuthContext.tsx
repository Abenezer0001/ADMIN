import React from 'react';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';

// Define types for auth responses
interface AuthResponse {
  success: boolean;
  user?: any;
  error?: string;
}

// Define the shape of our auth context
interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: any) => Promise<void>;
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
  const [user, setUser] = React.useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize auth service - using the class directly, not instantiating
  const authService = AuthService;

  // Check if user is already logged in
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        if (await authService.isAuthenticated()) {
          // Verify token and get user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth status check failed:', err);
        // Clear any invalid tokens
        authService.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      
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
  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
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