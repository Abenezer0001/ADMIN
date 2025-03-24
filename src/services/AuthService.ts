import api from '../utils/axiosConfig';
import { API_BASE_URL } from '../utils/config';
import axios from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user: {
    _id: string;
    id?: string;
    username?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    roles?: string[];
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Use axios directly for login to avoid interceptors
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    // Handle both token and accessToken naming conventions
    const token = response.data.token || response.data.accessToken;
    if (token) {
      localStorage.setItem('token', token);
    }
    
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    // Use axios directly for register to avoid interceptors
    const response = await axios.post(`${API_BASE_URL}/auth/register`, credentials);
    
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    // Handle both token and accessToken naming conventions
    const token = response.data.token || response.data.accessToken;
    if (token) {
      localStorage.setItem('token', token);
    }
    
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  async refreshToken(refreshToken: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
    return response.data;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export a singleton instance
export default new AuthService(); 