import axios from 'axios';
import { isDemoMode } from './authHelpers';
import { API_BASE_URL } from '../utils/config';
import {
  User,
  UserListParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UserRoleAssignmentRequest,
  UserPermissionAssignmentRequest,
  UserStatus
} from '../types/user';

const API_URL = API_BASE_URL;

// Helper for generating mock data in demo mode
const generateMockUsers = (count: number): User[] => {
  const roles = ['user', 'manager', 'admin', 'guest'];
  const statuses = [UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.PENDING];
  
  return Array(count).fill(null).map((_, index) => ({
    _id: `user-${index + 1}`,
    email: `user${index + 1}@example.com`,
    firstName: `First${index + 1}`,
    lastName: `Last${index + 1}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    isActive: Math.random() > 0.2,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 1000000000).toISOString() : undefined
  }));
};

class UserService {
  /**
   * Get users with pagination and filtering options
   * @param params Filtering, sorting, and pagination parameters
   * @returns Promise with paginated user list
   */
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    try {
      if (isDemoMode()) {
        // Return mock data for demo mode
        const mockUsers = generateMockUsers(25);
        const page = params.page || 1;
        const limit = params.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        let filteredUsers = [...mockUsers];
        
        // Apply search filter if provided
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.email.toLowerCase().includes(searchLower) ||
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.lastName?.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply status filter if provided
        if (params.status) {
          filteredUsers = filteredUsers.filter(user => user.status === params.status);
        }
        
        // Apply role filter if provided
        if (params.role) {
          filteredUsers = filteredUsers.filter(user => user.role === params.role);
        }
        
        // Apply sorting if provided
        if (params.sortBy) {
          filteredUsers.sort((a: any, b: any) => {
            if (!a[params.sortBy as keyof User] || !b[params.sortBy as keyof User]) return 0;
            
            const valueA = a[params.sortBy as keyof User];
            const valueB = b[params.sortBy as keyof User];
            
            if (typeof valueA === 'string' && typeof valueB === 'string') {
              return params.sortOrder === 'desc' 
                ? valueB.localeCompare(valueA)
                : valueA.localeCompare(valueB);
            }
            
            return params.sortOrder === 'desc'
              ? Number(valueB) - Number(valueA)
              : Number(valueA) - Number(valueB);
          });
        }
        
        return {
          users: filteredUsers.slice(startIndex, endIndex),
          total: filteredUsers.length,
          page,
          limit
        };
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);
      if (params.role) queryParams.append('role', params.role);
      
      const response = await axios.get(`${API_URL}/users?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      // Return empty result with error message
      return {
        users: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10
      };
    }
  }

  /**
   * Get a single user by ID
   * @param id User ID
   * @returns Promise with user data
   */
  async getUser(id: string): Promise<UserResponse> {
    try {
      if (isDemoMode()) {
        // Return mock data for demo mode
        const mockUsers = generateMockUsers(25);
        const user = mockUsers.find(u => u._id === id);
        
        if (user) {
          return {
            success: true,
            user
          };
        }
        
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      const response = await axios.get(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching user ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user'
      };
    }
  }

  /**
   * Create a new user
   * @param userData User data to create
   * @returns Promise with created user
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      console.log('Creating user:', userData);
      
      if (isDemoMode()) {
        // Simulate user creation in demo mode
        const mockUser: User = {
          _id: `user-${Date.now()}`,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          role: userData.role || 'user',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          status: UserStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return {
          success: true,
          user: mockUser,
          message: 'User created successfully'
        };
      }
      
      const response = await axios.post(`${API_URL}/users`, userData);
      
      // Type assertion for the response data
      const data = response.data as UserResponse;
      
      if (data.success) {
        return {
          success: true,
          user: data.user,
          message: data.message || 'User created successfully'
        };
      }
      
      return {
        success: false,
        message: data.message || 'Failed to create user'
      };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create user. Please try again.'
      };
    }
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param userData Updated user data
   * @returns Promise with updated user
   */
  async updateUser(id: string, userData: UpdateUserRequest): Promise<UserResponse> {
    try {
      console.log('Updating user:', id, userData);
      
      if (isDemoMode()) {
        // Simulate user update in demo mode
        const mockUsers = generateMockUsers(25);
        const userIndex = mockUsers.findIndex(u => u._id === id);
        
        if (userIndex >= 0) {
          const updatedUser = {
            ...mockUsers[userIndex],
            ...userData,
            updatedAt: new Date().toISOString()
          };
          
          return {
            success: true,
            user: updatedUser,
            message: 'User updated successfully'
          };
        }
        
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      const response = await axios.put(`${API_URL}/users/${id}`, userData);
      
      // Type assertion for the response data
      const data = response.data as UserResponse;
      
      if (data.success) {
        return {
          success: true,
          user: data.user,
          message: data.message || 'User updated successfully'
        };
      }
      
      return {
        success: false,
        message: data.message || 'Failed to update user'
      };
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user. Please try again.'
      };
    }
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Promise with success status
   */
  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Deleting user:', id);
      
      if (isDemoMode()) {
        // Simulate user deletion in demo mode
        return {
          success: true,
          message: 'User deleted successfully'
        };
      }
      
      const response = await axios.delete(`${API_URL}/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user. Please try again.'
      };
    }
  }

  /**
   * Reset user password
   * @param userId User ID
   * @returns Promise with success status
   */
  async resetUserPassword(userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      if (isDemoMode()) {
        // Simulate password reset in demo mode
        return {
          success: true,
          message: 'Password reset email sent successfully'
        };
      }
      
      const response = await axios.post(`${API_URL}/users/${userId}/reset-password`);
      return response.data;
    } catch (error: any) {
      console.error('Error resetting user password:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset user password. Please try again.'
      };
    }
  }

  /**
   * Assign roles to a user
   * @param request Assignment request with user ID and role IDs
   * @returns Promise with success status
   */
  async assignRolesToUser(request: UserRoleAssignmentRequest): Promise<{ success: boolean; message?: string }> {
    try {
      if (isDemoMode()) {
        // Simulate role assignment in demo mode
        return {
          success: true,
          message: 'Roles assigned successfully'
        };
      }
      
      const response = await axios.post(`${API_URL}/users/${request.userId}/roles`, {
        roleIds: request.roleIds
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error assigning roles to user:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to assign roles to user. Please try again.'
      };
    }
  }

  /**
   * Update user permissions
   * @param request Permission assignment request with user ID and permission IDs
   * @returns Promise with success status
   */
  async updatePermissions(request: UserPermissionAssignmentRequest): Promise<{ success: boolean; message?: string }> {
    try {
      if (isDemoMode()) {
        // Simulate permission update in demo mode
        return {
          success: true,
          message: 'Permissions updated successfully'
        };
      }
      
      const response = await axios.post(`${API_URL}/users/${request.userId}/permissions`, {
        permissionIds: request.permissionIds
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error updating user permissions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user permissions. Please try again.'
      };
    }
  }

  /**
   * Get user permissions
   * @param userId User ID
   * @returns Promise with user permissions
   */
  async getUserPermissions(userId: string): Promise<{ success: boolean; permissions?: string[]; message?: string }> {
    try {
      if (isDemoMode()) {
        // Return mock permissions in demo mode
        return {
          success: true,
          permissions: ['read:users', 'create:items', 'update:items', 'delete:items']
        };
      }
      
      const response = await axios.get(`${API_URL}/users/${userId}/permissions`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user permissions.'
      };
    }
  }

  /**
   * Change user status (activate/deactivate)
   * @param userId User ID
   * @param status New status
   * @returns Promise with success status
   */
  async changeUserStatus(userId: string, status: UserStatus): Promise<{ success: boolean; message?: string }> {
    try {
      if (isDemoMode()) {
        // Simulate status change in demo mode
        return {
          success: true,
          message: `User status changed to ${status} successfully`
        };
      }
      
      const response = await axios.patch(`${API_URL}/users/${userId}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error changing user status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change user status. Please try again.'
      };
    }
  }

  /**
   * Get user audit log
   * @param userId User ID
   * @returns Promise with user audit log
   */
  async getUserAuditLog(userId: string): Promise<{ success: boolean; auditLog?: any[]; message?: string }> {
    try {
      if (isDemoMode()) {
        // Return mock audit log in demo mode
        return {
          success: true,
          auditLog: [
            {
              action: 'User created',
              timestamp: new Date(Date.now() - 5000000).toISOString(),
              performedBy: 'admin@example.com',
              details: 'Initial user creation'
            },
            {
              action: 'Profile updated',
              timestamp: new Date(Date.now() - 3000000).toISOString(),
              performedBy: 'admin@example.com',
              details: 'Updated user profile information'
            },
            {
              action: 'Password reset',
              timestamp: new Date(Date.now() - 1000000).toISOString(),
              performedBy: userId,
              details: 'User requested password reset'
            }
          ]
        };
      }
      
      const response = await axios.get(`${API_URL}/users/${userId}/audit-log`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user audit log:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user audit log.'
      };
    }
  }
}

export default new UserService();
