import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  _id: string;
  resource: string;
  action: string;
  description: string;
}

class RbacService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  // Role API calls
  async getRoles() {
    const response = await axios.get(`${API_BASE_URL}/auth/roles`, this.getAuthHeader());
    return response.data;
  }

  async getRole(id: string) {
    const response = await axios.get(`${API_BASE_URL}/auth/roles/${id}`, this.getAuthHeader());
    return response.data;
  }

  async createRole(data: { name: string; description: string }) {
    const response = await axios.post(`${API_BASE_URL}/auth/roles`, data, this.getAuthHeader());
    return response.data;
  }

  async updateRole(id: string, data: { name?: string; description?: string }) {
    const response = await axios.patch(`${API_BASE_URL}/auth/roles/${id}`, data, this.getAuthHeader());
    return response.data;
  }

  async deleteRole(id: string) {
    const response = await axios.delete(`${API_BASE_URL}/auth/roles/${id}`, this.getAuthHeader());
    return response.data;
  }

  async getRolePermissions(id: string) {
    const response = await axios.get(`${API_BASE_URL}/auth/roles/${id}/permissions`, this.getAuthHeader());
    return response.data;
  }

  async addPermissionsToRole(id: string, permissions: string[]) {
    const response = await axios.post(
      `${API_BASE_URL}/auth/roles/${id}/permissions`,
      { permissions },
      this.getAuthHeader()
    );
    return response.data;
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const response = await axios.delete(
      `${API_BASE_URL}/auth/roles/${roleId}/permissions/${permissionId}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  // Permission API calls
  async getPermissions() {
    const response = await axios.get(`${API_BASE_URL}/auth/permissions`, this.getAuthHeader());
    return response.data;
  }

  async getPermission(id: string) {
    const response = await axios.get(`${API_BASE_URL}/auth/permissions/${id}`, this.getAuthHeader());
    return response.data;
  }

  async createPermission(data: { resource: string; action: string; description?: string }) {
    const response = await axios.post(`${API_BASE_URL}/auth/permissions`, data, this.getAuthHeader());
    return response.data;
  }

  async createMultiplePermissions(permissions: { resource: string; action: string; description?: string }[]) {
    const response = await axios.post(
      `${API_BASE_URL}/auth/permissions/batch`,
      { permissions },
      this.getAuthHeader()
    );
    return response.data;
  }

  async updatePermission(id: string, data: { resource?: string; action?: string; description?: string }) {
    const response = await axios.patch(`${API_BASE_URL}/auth/permissions/${id}`, data, this.getAuthHeader());
    return response.data;
  }

  async deletePermission(id: string) {
    const response = await axios.delete(`${API_BASE_URL}/auth/permissions/${id}`, this.getAuthHeader());
    return response.data;
  }

  // User-Role API calls
  async getUserRoles(userId: string) {
    const response = await axios.get(`${API_BASE_URL}/auth/users/${userId}/roles`, this.getAuthHeader());
    return response.data;
  }

  async assignRoleToUser(userId: string, roleId: string) {
    const response = await axios.post(
      `${API_BASE_URL}/auth/users/${userId}/roles`,
      { roleId },
      this.getAuthHeader()
    );
    return response.data;
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const response = await axios.delete(
      `${API_BASE_URL}/auth/users/${userId}/roles/${roleId}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  // User-Permission API calls
  async getUserPermissions(userId: string) {
    const response = await axios.get(`${API_BASE_URL}/auth/users/${userId}/permissions`, this.getAuthHeader());
    return response.data;
  }

  async assignPermissionToUser(userId: string, permissionId: string) {
    const response = await axios.post(
      `${API_BASE_URL}/auth/users/${userId}/permissions`,
      { permissionId },
      this.getAuthHeader()
    );
    return response.data;
  }

  async removePermissionFromUser(userId: string, permissionId: string) {
    const response = await axios.delete(
      `${API_BASE_URL}/auth/users/${userId}/permissions/${permissionId}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  // Check permission
  async checkPermission(resource: string, action: string) {
    const response = await axios.post(
      `${API_BASE_URL}/auth/check-permission`,
      { resource, action },
      this.getAuthHeader()
    );
    return response.data.hasPermission;
  }
}

export default new RbacService(); 