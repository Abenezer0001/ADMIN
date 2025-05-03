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
        
        if (response.data.success) {
          const demoData = response.data;
          
          // Store demo data in sessionStorage
          sessionStorage.setItem('demoToken', demoToken);
          sessionStorage.setItem('demoRestaurantId', demoData.restaurantId);
          sessionStorage.setItem('demoRestaurantName', demoData.restaurantName);
          sessionStorage.setItem('demoEmail', credentials.email);
          sessionStorage.setItem('isDemo', 'true');
          
          return {
            success: true,
            user: demoData.user
          };
        }
      } else {
        // Regular login
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        
        // Only return success if the API explicitly returns success: true
        if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success === true) {
          // All cookie handling is done on the server
          if ('user' in response.data && response.data.user) {
            return {
              success: true,
              user: response.data.user as User
            };
          }
        }
        
        // If API returns but without success flag or missing user data, treat as failure
        const responseData = response.data && typeof response.data === 'object' ? response.data : {};
        const errorMessage = 'message' in responseData ? String(responseData.message) : 'Authentication failed. Please check your credentials.';
        
        return { 
          success: false, 
          error: errorMessage
        };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // If we get a 401 error, it means unauthorized
      if (error.response && error.response.status === 401) {
        return {
          success: false,
          error: 'Invalid email or password. Please try again.'
        };
      }
      
      // Handle other errors
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, credentials);
      
      if (response.data.success) {
        return {
          success: true,
          user: response.data.user
        };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (isDemoMode()) {
      // Return demo user information
      return {
        id: 'demo',
        email: sessionStorage.getItem('demoEmail') || '',
        firstName: 'Demo',
        lastName: 'User',
        role: 'restaurant_admin'
      };
    } else {
      // For regular users, get from the /me endpoint
      try {
        const response = await axios.get(`${API_URL}/auth/me`);
        if (response.data.success) {
          return response.data.user;
        }
        return null;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
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
        
        // Clear all cookies manually using document.cookie
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
        
        // Clear any localStorage items related to auth
        localStorage.removeItem('currentRestaurantId');
        localStorage.removeItem('user');
      } else {
        // Clear demo data from sessionStorage
        sessionStorage.removeItem('demoToken');
        sessionStorage.removeItem('demoRestaurantId');
        sessionStorage.removeItem('demoRestaurantName');
        sessionStorage.removeItem('demoEmail');
        sessionStorage.removeItem('isDemo');
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
      return response.data.success;
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
        return response.data.isAuthenticated;
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


