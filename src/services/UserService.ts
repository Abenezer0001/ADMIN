import axios from 'axios';
import { isDemoMode, getDemoToken } from './AuthService';

// Use the environment variable for API URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Extended User interface for the User Management system
export interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions?: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

// Interface for creating a new user
export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Optional as system might generate password
  role: string;
  permissions?: string[];
}

// Interface for updating a user
export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'active' | 'inactive';
  permissions?: string[];
}

// Interface for role assignment
export interface RoleAssignmentPayload {
  userId: string;
  role: string;
}

// Interface for permission update
export interface PermissionUpdatePayload {
  userId: string;
  permissions: string[];
}

// Interface for pagination and filtering parameters
export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: 'active' | 'inactive';
  role?: string;
}

// Generic response interface for user operations
export interface UserResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

class UserService {
  /**
   * Get users with pagination, sorting, and filtering
   */
  async getUsers(params: UserQueryParams = {}): Promise<UserResponse<UserDetails[]>> {
    try {
      // In demo mode, return mock data
      if (isDemoMode()) {
        const mockUsers = this.generateMockUsers();
        let filteredUsers = [...mockUsers];
        
        // Apply search filter
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.email.toLowerCase().includes(searchLower) || 
            user.firstName.toLowerCase().includes(searchLower) || 
            user.lastName.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply status filter
        if (params.status) {
          filteredUsers = filteredUsers.filter(user => user.status === params.status);
        }
        
        // Apply role filter
        if (params.role) {
          filteredUsers = filteredUsers.filter(user => user.role === params.role);
        }
        
        // Apply sorting
        if (params.sortBy) {
          filteredUsers.sort((a, b) => {
            // @ts-ignore - Dynamic access to properties
            const aValue = a[params.sortBy!] || '';
            // @ts-ignore - Dynamic access to properties
            const bValue = b[params.sortBy!] || '';
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return params.sortOrder === 'desc' 
                ? bValue.localeCompare(aValue) 
                : aValue.localeCompare(bValue);
            }
            return 0;
          });
        }
        
        // Apply pagination
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const start = (page - 1) * pageSize;
        const paginatedUsers = filteredUsers.slice(start, start + pageSize);
        
        return {
          success: true,
          data: paginatedUsers,
          totalCount: filteredUsers.length,
          page,
          pageSize
        };
      }
      
      // In regular mode, fetch from API
      // Construct query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.role) queryParams.append('role', params.role);
      
      const url = `${API_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url);
      
      return response.data as UserResponse<UserDetails[]>;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users'
      };
    }
  }
  
  /**
   * Create a new user
   */
  async createUser(userData: CreateUserPayload): Promise<UserResponse<UserDetails>> {
    try {
      // Mock for demo mode
      if (isDemoMode()) {
        const newUser: UserDetails = {
          ...userData,
          id: `demo-${Math.random().toString(36).substring(2, 10)}`,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'demo-admin',
          lastModifiedBy: 'demo-admin'
        };
        
        return {
          success: true,
          data: newUser
        };
      }
      
      // Regular API call
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data as UserResponse<UserDetails>;
    } catch (error: any) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create user'
      };
    }
  }
  
  /**
   * Update an existing user
   */
  async updateUser(userId: string, userData: UpdateUserPayload): Promise<UserResponse<UserDetails>> {
    try {
      // Mock for demo mode
      if (isDemoMode()) {
        // In a real app, you'd update the user in a store or database
        return {
          success: true,
          data: {
            id: userId,
            email: userData.email || 'user@example.com',
            firstName: userData.firstName || 'Demo',
            lastName: userData.lastName || 'User',
            role: userData.role || 'user',
            permissions: userData.permissions || [],
            status: userData.status || 'active',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
            lastModifiedBy: 'demo-admin'
          }
        };
      }
      
      // Regular API call
      const response = await axios.put(`${API_URL}/users/${userId}`, userData);
      return response.data as UserResponse<UserDetails>;
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user'
      };
    }
  }
  
  /**
   * Delete a user (or deactivate, depending on business logic)
   */
  async deleteUser(userId: string): Promise<UserResponse<void>> {
    try {
      // Mock for demo mode
      if (isDemoMode()) {
        // In a real app, you'd remove the user from a store or database
        return {
          success: true
        };
      }
      
      // Regular API call
      const response = await axios.delete(`${API_URL}/users/${userId}`);
      return response.data as UserResponse<void>;
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      };
    }
  }
  
  /**
   * Assign a role to a user
   */
  async assignRole(payload: RoleAssignmentPayload): Promise<UserResponse<UserDetails>> {
    try {
      // Mock for demo mode
      if (isDemoMode()) {
        return {
          success: true,
          data: {
            id: payload.userId,
            email: 'user@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: payload.role,
            permissions: [],
            status: 'active',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
            lastModifiedBy: 'demo-admin'
          }
        };
      }
      
      // Regular API call
      const response = await axios.post(`${API_URL}/users/role`, payload);
      return response.data as UserResponse<UserDetails>;
    } catch (error: any) {
      console.error('Error assigning role:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign role'
      };
    }
  }
  
  /**
   * Update user permissions
   */
  async updatePermissions(payload: PermissionUpdatePayload): Promise<UserResponse<UserDetails>> {
    try {
      // Mock for demo mode
      if (isDemoMode()) {
        return {
          success: true,
          data: {
            id: payload.userId,
            email: 'user@example.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'user',
            permissions: payload.permissions,
            status: 'active',
            createdAt: '2023-01-01T00:00:00Z',
            updatedAt: new Date().toISOString(),
            lastModifiedBy: 'demo-admin'
          }
        };
      }
      
      // Regular API call
      const response = await axios.post(`${API_URL}/users/permissions`, payload);
      return response.data as UserResponse<UserDetails>;
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update permissions'
      };
    }
  }
  
  /**
   * Get available roles
   */
  async getRoles(): Promise<UserResponse<string[]>> {
    try {
      // Mock for demo mode
      if (isDemoMode()) {
        return {
          success: true,
          data: ['admin', 'manager', 'staff', 'user']
        };
      }
      
      // Regular API call
      const response = await axios.get(`${API_URL}/roles`);
      return response.data as UserResponse<string[]>;
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch roles'
      };
    }
  }
  
  /**
   * Get available permissions
   */
  async getPermissions(): Promise<UserResponse<string[]>> {
    try {
      // Mock for demo mode
      if (isDemoMode()) {
        return {
          success: true,
          data: [
            'create:user', 'read:user', 'update:user', 'delete:user',
            'create:content', 'read:content', 'update:content', 'delete:content',
            'access:admin_panel', 'access:reports'
          ]
        };
      }
      
      // Regular API call
      const response = await axios.get(`${API_URL}/permissions`);
      return response.data as UserResponse<string[]>;
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch permissions'
      };
    }
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<UserResponse<UserDetails>> {
    try {
      // Mock for demo mode
      if (isDemoMode()) {
        const mockUsers = this.generateMockUsers();
        const user = mockUsers.find(u => u.id === userId);
        
        if (user) {
          return {
            success: true,
            data: user
          };
        }
        
        return {
          success: false,
          error: 'User not found'
        };
      }
      
      // Regular API call
      const response = await axios.get(`${API_URL}/users/${userId}`);
      return response.data as UserResponse<UserDetails>;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user'
      };
    }
  }
  
  // Private method to generate mock users for demo mode
  private generateMockUsers(): UserDetails[] {
    return [
      {
        id: 'demo-user-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: ['*'],
        status: 'active',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        createdBy: 'system',
        lastModifiedBy: 'system'
      },
      {
        id: 'demo-user-2',
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager',
        permissions: ['create:user', 'read:user', 'update:user', 'access:reports'],
        status: 'active',
        createdAt: '2023-01-02T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
        createdBy: 'admin@example.com',
        lastModifiedBy: 'admin@example.com'
      },
      {
        id: 'demo-user-3',
        email: 'staff@example.com',
        firstName: 'Staff',
        lastName: 'Member',
        role: 'staff',
        permissions: ['read:user', 'read:content'],
        status: 'active',
        createdAt: '2023-01-03T00:00:00Z',
        updatedAt: '2023-01-03T00:00:00Z',

import axios from 'axios';
import { isDemoMode } from './AuthService';
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

// Use the environment variable for API URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

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
              timestamp: new Date

