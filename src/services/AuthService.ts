import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Use the environment variable for API URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions?: string[];
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions?: string[];
  exp: number;
  iat: number;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Configure axios to include credentials
axios.defaults.withCredentials = true;

// Check if we're in demo mode (URL contains a demo token)
const isDemoMode = (): boolean => {
  const path = window.location.pathname;
  return path.includes('/demo/') || path.match(/\/[a-f0-9]{12}/) !== null;
};

// Extract demo token from URL if in demo mode
const getDemoToken = (): string | null => {
  if (!isDemoMode()) return null;
  
  const path = window.location.pathname;
  const match = path.match(/\/([a-f0-9]{12})/);
  return match ? match[1] : null;
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Check if we're in demo mode
      const demoToken = getDemoToken();
      
      if (demoToken) {
        // If in demo mode, validate demo credentials
        const response = await axios.post(`${API_URL}/demo/validate`, {
          demoId: demoToken,
          email: credentials.email,
          password: credentials.password
        });
        
        // Type assertion for the response data
        const data = response.data as {
          success?: boolean;
          user?: User;
          restaurantId?: string;
          restaurantName?: string;
          message?: string;
        };
        
        if (data.success) {
          // Store demo data in sessionStorage
          sessionStorage.setItem('demoToken', demoToken);
          if (data.restaurantId) sessionStorage.setItem('demoRestaurantId', data.restaurantId);
          if (data.restaurantName) sessionStorage.setItem('demoRestaurantName', data.restaurantName);
          sessionStorage.setItem('demoEmail', credentials.email);
          sessionStorage.setItem('isDemo', 'true');
          
          return {
            success: true,
            user: data.user
          };
        } else {
          // Demo login failed
          const errorMessage = data?.message || 'Demo authentication failed';
          console.error('Demo login failed:', errorMessage);
          return {
            success: false,
            error: errorMessage
          };
        }
      } else {
        // Regular login
        console.log('Attempting regular login to:', `${API_URL}/auth/login`);
        try {
          const response = await axios.post(`${API_URL}/auth/login`, credentials);
          
          // Check the response structure and status code
          console.log('Login response:', response.status, response.data);
          
          // Type assertion for the response data
          const data = response.data as {
            success?: boolean;
            user?: User;
            message?: string;
          };
          
          // Only return success if both: 
          // 1. Status is 200 (not 401/unauthorized)
          // 2. API explicitly returns success: true with user data
          if (response.status === 200 && data.success === true && data.user) {
            // All cookie handling is done on the server
            return {
              success: true,
              user: data.user
            };
          }
          
          // If API returns but without success flag or missing user data, treat as failure
          const errorMessage = data.message || 'Authentication failed. Please check your credentials.';
          console.error('Login failed despite 200 status:', errorMessage);
          
          // Return failure
          return {
            success: false,
            error: errorMessage
          };
        } catch (error: any) {
          // Handle response errors (e.g., 401 unauthorized)
          console.error('Login request error:', error);
          
          if (error.response && error.response.status === 401) {
            // Handle 401 Unauthorized errors specifically
            const data = error.response.data as { message?: string };
            return {
              success: false,
              error: data?.message || 'Invalid email or password. Please try again.'
            };
          }
          
          throw error; // Re-throw for outer catch block
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle generic errors
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed. Please try again.'
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      
      // Type assertion for the response data
      const data = response.data as {
        success?: boolean;
        user?: User;
        message?: string;
      };
      
      if (data.success) {
        return {
          success: true,
          user: data.user
        };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  }

  async getCurrentUser(isDemoMode = false): Promise<User | null> {
    if (isDemoMode) {
      const demoEmail = sessionStorage.getItem('demoEmail');
      if (demoEmail) {
        return {
          id: 'demo-user',
          email: demoEmail,
          firstName: 'Demo',
          lastName: 'User',
          role: 'admin'
        };
      }
      return null;
    }
    
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      const data = response.data as { success?: boolean; user?: User };
      if (data.success) {
        return data.user || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      // Only attempt API logout if not in demo mode
      if (!isDemoMode()) {
        try {
          await axios.post(`${API_URL}/auth/logout`);
        } catch (error) {
          console.error('Error calling logout API:', error);
          // Continue with local cleanup even if API fails
        }
      }
      
      // Redirect to login page after a short delay to ensure cleanup completes
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect to login even if there's an error
      window.location.href = '/login';
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`);
      const data = response.data as { success: boolean };
      return data.success;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (isDemoMode()) {
      // In demo mode, check for demo token
      return !!sessionStorage.getItem('demoToken');
    } else {
      // Regular mode, check auth status with the server
      try {
        const response = await axios.get(`${API_URL}/auth/check`);
        const data = response.data as { isAuthenticated: boolean };
        return data.isAuthenticated;
      } catch (error) {
        console.error('Auth check error:', error);
        return false;
      }
    }
  }

  // For demo mode only
  getDemoInfo() {
    if (!isDemoMode()) return null;
    
    return {
      demoToken: sessionStorage.getItem('demoToken'),
      restaurantId: sessionStorage.getItem('demoRestaurantId'),
      restaurantName: sessionStorage.getItem('demoRestaurantName')
    };
  }
}

// Export a singleton instance
export default new AuthService();

// Export utility functions for use in other services
export { isDemoMode, getDemoToken };


