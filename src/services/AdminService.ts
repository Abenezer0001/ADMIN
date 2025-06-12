import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles?: {
    _id: string;
    name: string;
    description?: string;
  }[];
  isActive: boolean;
  isPasswordSet?: boolean;
  businessId?: string | {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateResponse {
  success: boolean;
  message?: string;
  admin?: AdminUser;
  user?: AdminUser;
  emailSent?: boolean;
}

interface AdminListResponse {
  message: string;
  admins: AdminUser[];
}

// Configure axios to include credentials
axios.defaults.withCredentials = true;

class AdminService {
  /**
   * Get user role from API (recommended) or localStorage as fallback
   */
  private async getUserRole(): Promise<string | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true
      });
      const data = response.data as any;
      return data?.user?.role || data?.role || null;
    } catch (error) {
      console.error('AdminService - Failed to get user role from API:', error);
      // Fallback to localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.role || null;
        }
        return null;
      } catch (localError) {
        console.error('Error parsing user from localStorage:', localError);
        return null;
      }
    }
  }

  /**
   * Get business ID from API (recommended) or localStorage as fallback
   */
  private async getBusinessId(): Promise<string | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true
      });
      const data = response.data as any;
      return data?.user?.businessId || data?.businessId || null;
    } catch (error) {
      console.error('AdminService - Failed to get business ID from API:', error);
      // Fallback to localStorage
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          return user.businessId || null;
        }
        return null;
      } catch (localError) {
        console.error('Error parsing user from localStorage:', localError);
        return null;
      }
    }
  }

  /**
   * Create a new admin user (system admin only) or business user (restaurant admin)
   */
  async createAdmin(adminData: { email: string; firstName: string; lastName: string; role?: string }): Promise<AdminCreateResponse> {
    try {
      const userRole = await this.getUserRole();
      console.log('createAdmin: User role:', userRole);
      console.log('createAdmin: Data:', adminData);
      
      if (userRole === 'system_admin') {
        // System admin creating another admin - use auth service
        const response = await axios.post(`${API_BASE_URL}/auth/admin`, adminData, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
        console.log('createAdmin: System admin response:', response.data);
        return {
          success: true,
          admin: (response.data as any).admin || (response.data as any).user,
          message: (response.data as any).message || 'Admin created successfully',
          emailSent: (response.data as any).emailSent
        };
        
      } else if (userRole === 'restaurant_admin') {
        // Restaurant admin creating business user - use business service
        const businessId = await this.getBusinessId();
        if (!businessId) {
            return {
            success: false,
            message: 'No business ID found for restaurant admin'
          };
        }
        
        const response = await axios.post(`${API_BASE_URL}/businesses-admin/${businessId}/users`, {
          email: adminData.email,
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          roleIds: [] // Empty for now, can be expanded
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('createAdmin: Restaurant admin response:', response.data);
        return {
          success: true,
          user: (response.data as any).user,
          message: (response.data as any).message || 'Business user created successfully',
          emailSent: (response.data as any).emailSent
        };
        
      } else {
      return {
        success: false,
          message: 'Unauthorized: Admin role required'
      };
      }
      
    } catch (error: any) {
      console.error('Error creating admin:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create admin'
      };
    }
  }

  /**
   * Get list of admin users (system admin only)
   */
  async listAdmins(): Promise<AdminListResponse> {
    try {
      console.log('listAdmins: Starting request...');
      const userRole = await this.getUserRole();
      console.log('listAdmins: User role:', userRole);
      
      if (userRole === 'system_admin') {
        // System admin - get all admin users from auth service
        const response = await axios.get(`${API_BASE_URL}/auth/admins`, {
            withCredentials: true,
            headers: {
              'Accept': 'application/json'
            }
          });
          
        console.log('listAdmins: Response:', response.data);
          
          // Handle different response formats
        const data = response.data;
        if (Array.isArray(data)) {
          return {
            message: 'Admins retrieved successfully',
            admins: data
          };
        } else if (data.admins && Array.isArray(data.admins)) {
          return {
            message: data.message || 'Admins retrieved successfully',
            admins: data.admins
          };
        } else {
          console.log('listAdmins: Unexpected response format, returning empty array');
          return {
            message: 'No admins found',
            admins: []
          };
        }
        
      } else {
        throw new Error('Unauthorized: System admin role required');
      }
      
    } catch (error: any) {
      console.error('Error listing admins:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch admins');
    }
  }
  
  /**
   * Get business users for restaurant admin or specific business for system admin
   */
  async getBusinessUsers(businessId?: string): Promise<{ users: AdminUser[], count: number }> {
    try {
      const userRole = await this.getUserRole();
      const userBusinessId = await this.getBusinessId();
      
      let targetBusinessId = businessId;
      
      if (userRole === 'system_admin') {
        // System admin can access any business's users
        if (!targetBusinessId) {
          throw new Error('Business ID is required for system admin');
        }
      } else if (userRole === 'restaurant_admin') {
        // Restaurant admin can only access their own business users
        targetBusinessId = userBusinessId;
        if (!targetBusinessId) {
          throw new Error('No business associated with this user');
        }
      } else {
        throw new Error('Unauthorized: Admin role required');
      }
      
      console.log('getBusinessUsers: Fetching users for business:', targetBusinessId);
      
      const response = await axios.get(`${API_BASE_URL}/businesses-admin/${targetBusinessId}/users`, {
            withCredentials: true,
            headers: {
              'Accept': 'application/json'
            }
          });
          
      console.log('getBusinessUsers: Response:', response.data);
          
      // Handle the correct response format: {users: [], count: number}
      const data = response.data as { users: AdminUser[]; count: number };
      return {
        users: data.users || [],
        count: data.count || data.users?.length || 0
      };
      
    } catch (error: any) {
      console.error('Error fetching business users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch business users');
    }
  }

  /**
   * Create a business user
   */
  async createBusinessUser(businessId: string, userData: { email: string; firstName: string; lastName: string; roleIds?: string[] }): Promise<AdminCreateResponse> {
    try {
      const userRole = await this.getUserRole();
      const userBusinessId = await this.getBusinessId();
      
      if (userRole === 'system_admin') {
        // System admin can create users for any business
      } else if (userRole === 'restaurant_admin' && userBusinessId !== businessId) {
        return {
          success: false,
          message: 'Unauthorized: You can only create users for your own business'
        };
      } else if (userRole !== 'restaurant_admin') {
        return {
          success: false,
          message: 'Unauthorized: Admin role required'
        };
      }
      
      console.log('createBusinessUser: Creating user for business:', businessId, userData);
      
      const response = await axios.post(`${API_BASE_URL}/businesses-admin/${businessId}/users`, userData, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
      console.log('createBusinessUser: Response:', response.data);
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message || 'Business user created successfully',
        emailSent: response.data.emailSent
      };
      
    } catch (error: any) {
      console.error('Error creating business user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create business user'
      };
    }
  }

  /**
   * Get available roles
   */
  async getAvailableRoles(): Promise<string[]> {
    try {
      console.log('getAvailableRoles: Fetching roles...');
      
      const response = await axios.get(`${API_BASE_URL}/rbac/roles`, {
            withCredentials: true,
            headers: {
              'Accept': 'application/json'
            }
          });
          
      console.log('getAvailableRoles: Response:', response.data);
          
          // Handle different response formats
          const data = response.data;
      let rolesData = [];
      
          if (Array.isArray(data)) {
        rolesData = data;
          } else if (data.roles && Array.isArray(data.roles)) {
        rolesData = data.roles;
          } else if (data.data && Array.isArray(data.data)) {
        rolesData = data.data;
          }
          
      // Extract role names
      const roleNames = rolesData.map((role: any) => role.name || role).filter(Boolean);
      
      console.log('getAvailableRoles: Extracted role names:', roleNames);
      
      return roleNames.length > 0 ? roleNames : ['system_admin', 'restaurant_admin'];
      
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      // Return default roles on error
        return ['system_admin', 'restaurant_admin'];
    }
  }
}

export default new AdminService();
