import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles: string[];
  permissions: string[];
  directPermissions: string[];
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
   * Create a new admin user (system admin privilege required)
   */
  async createAdmin(adminData: { email: string; firstName: string; lastName: string }): Promise<AdminCreateResponse> {
    try {
      const url = `${API_BASE_URL}/admin/admins`;
      console.log('Creating admin user:', adminData);
      console.log('Sending request to:', url);
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
      const url = `${API_BASE_URL}/admin/admins`;
      console.log('Fetching admins from:', url);
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
}

export default new AdminService();
