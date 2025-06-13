import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

// Use the API_BASE_URL from config instead of process.env
// export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL 
// ;

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  businessId?: string;
  isSystemRole: boolean;
  scope: 'system' | 'business';
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles: Role[];
  directPermissions: Permission[];
  isActive: boolean;
  businessId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ResourceActions {
  [resource: string]: string[];
}

interface ApiResponse<T> {
  data: T;
}

class RbacService {
  private apiUrl = `${API_BASE_URL}`;

  private getAuthConfig() {
    return { withCredentials: true };
  }

  // Role Management
  async getRoles(): Promise<Role[]> {
    try {
      const response = await axios.get<Role[]>(`${this.apiUrl}/rbac/roles`, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch roles');
    }
  }

  async getRoleById(roleId: string): Promise<Role> {
    try {
      const response = await axios.get<Role>(`${this.apiUrl}/rbac/roles/${roleId}`, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      console.error('Error fetching role:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch role');
    }
  }

  async createRole(data: {
    name: string;
    description: string;
    permissions: string[];
  }): Promise<Role> {
    try {
      const response = await axios.post<Role>(`${this.apiUrl}/rbac/roles`, data, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      console.error('Error creating role:', error);
      throw new Error(error.response?.data?.message || 'Failed to create role');
    }
  }

  async updateRole(roleId: string, data: {
    name?: string;
    description?: string;
    permissions?: string[];
  }): Promise<Role> {
    try {
      const response = await axios.put<Role>(`${this.apiUrl}/rbac/roles/${roleId}`, data, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      console.error('Error updating role:', error);
      throw new Error(error.response?.data?.message || 'Failed to update role');
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/rbac/roles/${roleId}`, this.getAuthConfig());
    } catch (error: any) {
      console.error('Error deleting role:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete role');
    }
  }

  // Permission Management
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await axios.get<{ permissions: Permission[] }>(`${this.apiUrl}/rbac/permissions`, this.getAuthConfig());
      return response.data.permissions;
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }

  async getPermissionById(permissionId: string): Promise<Permission> {
    try {
      const response = await axios.get<Permission>(`${this.apiUrl}/rbac/permissions/${permissionId}`, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      console.error('Error fetching permission:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permission');
    }
  }

  async createPermission(data: {
    resource: string;
    action: string;
    description?: string;
  }): Promise<Permission> {
    try {
      const response = await axios.post<Permission>(`${this.apiUrl}/rbac/permissions`, data, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      console.error('Error creating permission:', error);
      throw new Error(error.response?.data?.message || 'Failed to create permission');
    }
  }

  async createMultiplePermissions(permissions: {
    resource: string;
    action: string;
    description?: string;
  }[]): Promise<{ created: number; skipped: number; permissions: Permission[] }> {
    try {
      const response = await axios.post<{ created: number; skipped: number; permissions: Permission[] }>(
        `${this.apiUrl}/rbac/permissions/batch`, 
        { permissions }, 
        this.getAuthConfig()
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating multiple permissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to create permissions');
    }
  }

  async updatePermission(permissionId: string, data: {
    resource?: string;
    action?: string;
    description?: string;
  }): Promise<Permission> {
    try {
      const response = await axios.put<Permission>(`${this.apiUrl}/rbac/permissions/${permissionId}`, data, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      console.error('Error updating permission:', error);
      throw new Error(error.response?.data?.message || 'Failed to update permission');
    }
  }

  async deletePermission(permissionId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/rbac/permissions/${permissionId}`, this.getAuthConfig());
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete permission');
    }
  }

  async getPermissionsByResource(resource: string): Promise<Permission[]> {
    try {
      const response = await axios.get<{ permissions: Permission[] }>(
        `${this.apiUrl}/rbac/permissions/by-resource/${resource}`, 
        this.getAuthConfig()
      );
      return response.data.permissions;
    } catch (error: any) {
      console.error('Error fetching permissions by resource:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permissions by resource');
    }
  }

  // Get available resources and actions
  async getResourceActions(): Promise<ResourceActions> {
    try {
      const response = await axios.get<{ resources: ResourceActions }>(
        `${this.apiUrl}/rbac/resources`, 
        this.getAuthConfig()
      );
      return response.data.resources;
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch resources');
    }
  }

  // User Role Assignment
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const response = await axios.get<Role[]>(`${this.apiUrl}/rbac/users/${userId}/roles`, this.getAuthConfig());
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user roles:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user roles');
    }
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/rbac/users/${userId}/assign-role`, { roleId }, this.getAuthConfig());
    } catch (error: any) {
      console.error('Error assigning role to user:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign role to user');
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/rbac/users/${userId}/remove-role/${roleId}`, this.getAuthConfig());
    } catch (error: any) {
      console.error('Error removing role from user:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove role from user');
    }
  }

  // User Permission Management
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const response = await axios.get<{ permissions: Permission[] }>(`${this.apiUrl}/rbac/users/${userId}/permissions`, this.getAuthConfig());
      return response.data.permissions;
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user permissions');
    }
  }

  // Role Permission Management
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/rbac/roles/${roleId}/permissions/${permissionId}`, {}, this.getAuthConfig());
    } catch (error: any) {
      console.error('Error assigning permission to role:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign permission to role');
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await axios.delete(`${this.apiUrl}/rbac/roles/${roleId}/permissions/${permissionId}`, this.getAuthConfig());
    } catch (error: any) {
      console.error('Error removing permission from role:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove permission from role');
    }
  }

  async assignMultiplePermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/rbac/roles/${roleId}/permissions/bulk`, { permissionIds }, this.getAuthConfig());
    } catch (error: any) {
      console.error('Error assigning multiple permissions to role:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign permissions to role');
    }
  }

  // Get current user's permissions
  async getMyPermissions(): Promise<Permission[]> {
    try {
      const response = await axios.get<{ success: boolean; permissions: Permission[] }>(
        `${this.apiUrl}/auth/me/permissions`, 
        this.getAuthConfig()
      );
      return response.data.permissions;
    } catch (error: any) {
      console.error('Error fetching my permissions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch permissions');
    }
  }
}

export default new RbacService(); 