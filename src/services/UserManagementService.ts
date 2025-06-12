import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  businessId?: {
    _id: string;
    name: string;
  };
  roles?: Array<{
    _id: string;
    name: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  _id: string;
  name: string;
  description: string;
  businessId?: string;
  isSystemRole: boolean;
}

export interface UsersResponse {
  users: User[];
  usersByRole?: {
    [roleName: string]: User[];
  };
  count: number;
  rolesSummary?: Array<{
    role: string;
    count: number;
  }>;
}

interface ApiResponse<T> {
  data: T;
}

class UserManagementService {
  private apiUrl = `${API_BASE_URL}`;

  /**
   * Get users with optional role filtering
   * For system admins: returns all users (except customers) categorized by roles
   * For business owners: returns only their business users categorized by roles
   */
  async getUsers(roleFilter?: string): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams();
      if (roleFilter) {
        params.append('role', roleFilter);
      }
      
      const response = await axios.get<UsersResponse>(`${this.apiUrl}/auth/users/business-users?${params.toString()}`, {
        withCredentials: true
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  /**
   * Get available roles for filtering
   * Returns different roles based on user type (system admin vs business owner)
   */
  async getAvailableRoles(): Promise<UserRole[]> {
    try {
      const response = await axios.get<{ roles: UserRole[] }>(`${this.apiUrl}/rbac/roles`, {
        withCredentials: true
      });

      return response.data.roles || [];
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch roles');
    }
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get<{ user: User }>(`${this.apiUrl}/auth/users/${userId}`, {
        withCredentials: true
      });

      return response.data.user;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  }

  /**
   * Create a new user (business owner only)
   */
  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    roleIds: string[];
  }): Promise<User> {
    try {
      const response = await axios.post<{ user: User }>(`${this.apiUrl}/businesses/my-business/users`, userData, {
        withCredentials: true
      });

      return response.data.user;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      await axios.put(`${this.apiUrl}/auth/users/${userId}/status`, 
        { isActive }, 
        { withCredentials: true }
      );
    } catch (error: any) {
      console.error('Error updating user status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/auth/users/${userId}/roles`, 
        { roleId }, 
        { withCredentials: true }
      );
    } catch (error: any) {
      console.error('Error assigning role:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign role');
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/auth/users/${userId}/roles/${roleId}`, {
        withCredentials: true
      });
    } catch (error: any) {
      console.error('Error removing role:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove role');
    }
  }

  /**
   * Generate password reset token for user
   */
  async generatePasswordResetToken(email: string): Promise<{ token: string; userId: string }> {
    try {
      const response = await axios.post<{ token: string; userId: string }>(`${this.apiUrl}/system-admin/admins/reset-token/by-email`, 
        { email }, 
        { withCredentials: true }
      );

      return {
        token: response.data.token,
        userId: response.data.userId
      };
    } catch (error: any) {
      console.error('Error generating password reset token:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate password reset token');
    }
  }
}

export default new UserManagementService(); 