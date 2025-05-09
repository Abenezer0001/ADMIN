import axios from 'axios';

// Use the environment variable for API URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AdminCreateResponse {
  success: boolean;
  message?: string;
  admin?: AdminUser;
}

// Configure axios to include credentials
axios.defaults.withCredentials = true;

class AdminService {
  /**
   * Create a new admin user (system admin privilege required)
   */
  async createAdmin(adminData: { email: string; firstName: string; lastName: string }): Promise<AdminCreateResponse> {
    try {
      console.log('Creating admin user:', adminData);
      const response = await axios.post(`${API_URL}/admin/admins`, adminData);
      
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
  async listAdmins(): Promise<AdminUser[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/admins`);
      const data = response.data as { success?: boolean; admins?: AdminUser[]; message?: string };
      if (data?.success && Array.isArray(data.admins)) {
        return data.admins;
      }
      
      return [];
    } catch (error) {
      console.error('Error listing admins:', error);
      return [];
    }
  }
}

export default new AdminService();
