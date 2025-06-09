import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles: string[];
  isActive: boolean;
  isPasswordSet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateResponse {
  success: boolean;
  message?: string;
  admin?: AdminUser;
}

interface AdminListResponse {
  message: string;
  admins: AdminUser[];
}

// Configure axios to include credentials
axios.defaults.withCredentials = true;

class AdminService {
  /**
   * Get the appropriate endpoint based on user role
   */
  private getEndpointPrefix(): string {
    const userRole = localStorage.getItem('userRole');
    console.log('AdminService - User role from localStorage:', userRole);
    
    if (userRole === 'system_admin') {
      return 'system-admin';
    } else if (userRole === 'restaurant_admin') {
      return 'business-admin';
    }
    
    // Fallback: check if user is logged in and try to detect from context
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('AdminService - User data from localStorage:', user);
        if (user.role === 'system_admin') {
          return 'system-admin';
        } else if (user.role === 'restaurant_admin') {
          return 'business-admin';
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
    
    console.log('AdminService - Defaulting to system-admin endpoint');
    return 'system-admin'; // Default fallback
  }

  /**
   * Create a new admin user (system admin privilege required)
   */
  async createAdmin(adminData: { email: string; firstName: string; lastName: string; role?: string }): Promise<AdminCreateResponse> {
    try {
      const endpoint = this.getEndpointPrefix();
      const url = `${API_BASE_URL}/${endpoint}/admins`;
      console.log('Creating admin user:', adminData);
      console.log('Sending request to:', url);
      console.log('User role:', localStorage.getItem('userRole'));
      
      const response = await axios.post(url, adminData);
      
      console.log('Create admin response:', response.status, response.data);
      
      // Type assertion for the response data
      const data = response.data as {
        success?: boolean;
        admin?: AdminUser;
        message?: string;
      };
      
      if (data?.success) {
        return {
          success: true,
          admin: data.admin,
          message: data.message || 'Admin created successfully'
        };
      }
      
      return {
        success: false,
        message: data?.message || 'Failed to create admin'
      };
    } catch (error: any) {
      console.error('Error creating admin:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create admin. Please try again.'
      };
    }
  }

  /**
   * Get list of admin users (system admin privilege required)
   */
  async listAdmins(): Promise<AdminListResponse> {
    try {
      const endpoint = this.getEndpointPrefix();
      const url = `${API_BASE_URL}/${endpoint}/admins`;
      console.log('Fetching admins from:', url);
      console.log('User role:', localStorage.getItem('userRole'));
      
      const response = await axios.get<AdminListResponse>(url);
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      return response.data;
    } catch (error: any) {
      console.error('Error listing admins:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return { 
        message: error.response?.data?.message || 'Failed to fetch admins', 
        admins: [] 
      };
    }
  }
  
  /**
   * Fetch available roles for creating admin users
   * Will respect user's permissions (system admin vs restaurant admin)
   */
  async getAvailableRoles(): Promise<string[]> {
    try {
      const endpoint = this.getEndpointPrefix();
      let url: string;
      
      if (endpoint === 'business-admin') {
        url = `${API_BASE_URL}/business-admin/available-roles`;
      } else {
        url = `${API_BASE_URL}/system-admin/roles/available`;
      }
      
      console.log('Fetching available roles from:', url);
      console.log('User role:', localStorage.getItem('userRole'));
      
      const response = await axios.get<{ roles: string[] }>(url);
      console.log('Available roles response:', response.data);
      return response.data.roles || [];
    } catch (error: any) {
      console.error('Error fetching available roles:', error);
      // Default fallback - should be filtered on the backend anyway
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'system_admin') {
        return ['system_admin', 'restaurant_admin'];
      }
      // Restaurant admins can only create restaurant_admin users
      return ['restaurant_admin'];
    }
  }
}

export default new AdminService();
