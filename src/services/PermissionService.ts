// import api from '../utils/axiosConfig';
import { API_BASE_URL } from '../utils/config';
import axios from 'axios';
import { 
  Permission, 
  Role, 
  UserWithPermissions, 
  ResourceType, 
  PermissionAction, 
  PermissionCheckResult,
  ResourceDefinition
} from '../types/permissions';
import api from 'utils/axiosConfig';
// import api from 'utils/axiosConfig';

export class PermissionService {
  private baseUrl : string;
   
  constructor(){
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get all permissions
   */
  static async getAllPermissions(): Promise<Permission[]> {
    const response = await axios.get(`${API_BASE_URL}/auth/permissions`);
    return (response.data as any).permissions || response.data as Permission[];
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(userId?: string): Promise<Permission[]> {
    const url = userId 
      ? `${API_BASE_URL}/auth/users/${userId}/permissions`
      : `${API_BASE_URL}/auth/me/permissions`;
    const response = await axios.get(url);
    return (response.data as any).permissions || response.data as Permission[];
  }

  /**
   * Check if user has permission for specific resource and action
   */
  static async checkPermission(
    resource: ResourceType, 
    action: PermissionAction, 
    userId?: string
  ): Promise<boolean> {
    try {
      // For now, we'll check permissions by getting all permissions and filtering
      const permissions = await this.getUserPermissions(userId);
      return permissions.some(permission => 
        permission.resource === resource && permission.action === action
      );
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a resource
   */
  static async getResourcePermissions(
    resource: ResourceType, 
    userId?: string
  ): Promise<PermissionCheckResult> {
    try {
      const [canCreate, canRead, canUpdate, canDelete] = await Promise.all([
        this.checkPermission(resource, 'create', userId),
        this.checkPermission(resource, 'read', userId),
        this.checkPermission(resource, 'update', userId),
        this.checkPermission(resource, 'delete', userId)
      ]);

      return { canCreate, canRead, canUpdate, canDelete };
    } catch (error) {
      console.error('Failed to get resource permissions:', error);
      return { canCreate: false, canRead: false, canUpdate: false, canDelete: false };
    }
  }

  /**
   * Seed permissions in the database
   */
  static async seedPermissions(): Promise<{ message: string; permissions: Permission[] }> {
    const response = await axios.post(`${API_BASE_URL}/auth/permissions/seed`);
    return response.data as { message: string; permissions: Permission[] };
  }

  /**
   * Create a new permission
   */
  static async createPermission(permissionData: {
    resource: ResourceType;
    action: PermissionAction;
    description: string;
  }): Promise<Permission> {
    const response = await axios.post(`${API_BASE_URL}/auth/permissions`, permissionData);
    return (response.data as any).permission || response.data as Permission;
  }

  /**
   * Update permission
   */
  static async updatePermission(
    permissionId: string, 
    updateData: Partial<Permission>
  ): Promise<Permission> {
    const response = await axios.put(`${API_BASE_URL}/auth/permissions/${permissionId}`, updateData);
    return (response.data as any).permission || response.data as Permission;
  }

  /**
   * Delete permission
   */
  static async deletePermission(permissionId: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/auth/permissions/${permissionId}`);
    return response.data as { message: string };
  }
}

// Resource definitions for the application
export const RESOURCE_DEFINITIONS: ResourceDefinition[] = [
  {
    name: 'business',
    displayName: 'Business Management',
    routes: {
      list: '/business/list',
      create: '/business/list',
      edit: '/business/detail/:id',
      detail: '/business/detail/:id'
    },
    permissions: {
      create: 'business:create',
      read: 'business:read',
      update: 'business:update',
      delete: 'business:delete'
    },
    icon: 'Business',
    description: 'Manage business entities and settings'
  },
  {
    name: 'restaurant',
    displayName: 'Restaurant Management',
    routes: {
      list: '/restaurants/list',
      create: '/restaurants/add',
      edit: '/restaurants/add/:id',
      detail: '/restaurants/detail/:id'
    },
    permissions: {
      create: 'restaurant:create',
      read: 'restaurant:read',
      update: 'restaurant:update',
      delete: 'restaurant:delete'
    },
    icon: 'Restaurant',
    description: 'Manage restaurant locations and details'
  },
  {
    name: 'user',
    displayName: 'User Management',
    routes: {
      list: '/users',
      create: '/users/new',
      edit: '/users/edit/:id',
      detail: '/users/:id'
    },
    permissions: {
      create: 'user:create',
      read: 'user:read',
      update: 'user:update',
      delete: 'user:delete'
    },
    icon: 'People',
    description: 'Manage system users and access'
  },
  {
    name: 'menu',
    displayName: 'Menu Management',
    routes: {
      list: '/menus/list',
      create: '/menus/add',
      edit: '/menus/edit/:id',
      detail: '/menus/detail/:id'
    },
    permissions: {
      create: 'menu:create',
      read: 'menu:read',
      update: 'menu:update',
      delete: 'menu:delete'
    },
    icon: 'MenuBook',
    description: 'Manage restaurant menus'
  },
  {
    name: 'menuitem',
    displayName: 'Menu Items',
    routes: {
      list: '/menu/items',
      create: '/menu/items/new',
      edit: '/menu/items/edit/:id',
      detail: '/menu-items/detail/:id'
    },
    permissions: {
      create: 'menuitem:create',
      read: 'menuitem:read',
      update: 'menuitem:update',
      delete: 'menuitem:delete'
    },
    icon: 'RestaurantMenu',
    description: 'Manage individual menu items'
  },
  {
    name: 'category',
    displayName: 'Categories',
    routes: {
      list: '/categories',
      create: '/categories/add',
      edit: '/categories/edit/:id',
      detail: '/categories/detail/:id'
    },
    permissions: {
      create: 'category:create',
      read: 'category:read',
      update: 'category:update',
      delete: 'category:delete'
    },
    icon: 'Category',
    description: 'Manage menu categories'
  },
  {
    name: 'subcategory',
    displayName: 'Sub Categories',
    routes: {
      list: '/subcategories/list',
      create: '/subcategories/add',
      edit: '/subcategories/edit/:id',
      detail: '/subcategories/detail/:id'
    },
    permissions: {
      create: 'subcategory:create',
      read: 'subcategory:read',
      update: 'subcategory:update',
      delete: 'subcategory:delete'
    },
    icon: 'Category',
    description: 'Manage menu sub-categories'
  },
  {
    name: 'subsubcategory',
    displayName: 'Sub-Sub Categories',
    routes: {
      list: '/subsubcategories/list',
      create: '/subsubcategories/add',
      edit: '/subsubcategories/edit/:id',
      detail: '/subsubcategories/detail/:id'
    },
    permissions: {
      create: 'subsubcategory:create',
      read: 'subsubcategory:read',
      update: 'subsubcategory:update',
      delete: 'subsubcategory:delete'
    },
    icon: 'Category',
    description: 'Manage menu sub-sub-categories'
  },
  {
    name: 'modifier',
    displayName: 'Modifiers',
    routes: {
      list: '/modifiers',
      create: '/modifiers/add',
      edit: '/modifiers/edit/:id',
      detail: '/modifiers/detail/:id'
    },
    permissions: {
      create: 'modifier:create',
      read: 'modifier:read',
      update: 'modifier:update',
      delete: 'modifier:delete'
    },
    icon: 'Edit',
    description: 'Manage menu item modifiers'
  },
  {
    name: 'table',
    displayName: 'Table Management',
    routes: {
      list: '/tables/list',
      create: '/tables/new',
      edit: '/tables/edit/:id',
      detail: '/tables/detail/:id'
    },
    permissions: {
      create: 'table:create',
      read: 'table:read',
      update: 'table:update',
      delete: 'table:delete'
    },
    icon: 'TableRestaurant',
    description: 'Manage restaurant tables'
  },
  {
    name: 'venue',
    displayName: 'Venue Management',
    routes: {
      list: '/venues/list',
      create: '/venues/add',
      edit: '/venues/add/:id',
      detail: '/venues/detail/:id'
    },
    permissions: {
      create: 'venue:create',
      read: 'venue:read',
      update: 'venue:update',
      delete: 'venue:delete'
    },
    icon: 'LocationOn',
    description: 'Manage restaurant venues'
  },
  {
    name: 'zone',
    displayName: 'Zone Management',
    routes: {
      list: '/zones/list',
      create: '/zones/add',
      edit: '/zones/add/:venueId/:id',
      detail: '/zones/detail/:id'
    },
    permissions: {
      create: 'zone:create',
      read: 'zone:read',
      update: 'zone:update',
      delete: 'zone:delete'
    },
    icon: 'Map',
    description: 'Manage restaurant zones'
  },
  {
    name: 'order',
    displayName: 'Order Management',
    routes: {
      list: '/orders/history',
      create: '/orders/live',
      edit: '/orders/history/:id',
      detail: '/orders/history/:id'
    },
    permissions: {
      create: 'order:create',
      read: 'order:read',
      update: 'order:update',
      delete: 'order:delete'
    },
    icon: 'ShoppingCart',
    description: 'Manage customer orders'
  },
  {
    name: 'customer',
    displayName: 'Customer Management',
    routes: {
      list: '/customers',
      create: '/customers',
      edit: '/customers',
      detail: '/customers'
    },
    permissions: {
      create: 'customer:create',
      read: 'customer:read',
      update: 'customer:update',
      delete: 'customer:delete'
    },
    icon: 'People',
    description: 'Manage customer information'
  },
  {
    name: 'inventory',
    displayName: 'Inventory Management',
    routes: {
      list: '/inventory',
      create: '/inventory',
      edit: '/inventory',
      detail: '/inventory'
    },
    permissions: {
      create: 'inventory:create',
      read: 'inventory:read',
      update: 'inventory:update',
      delete: 'inventory:delete'
    },
    icon: 'Inventory',
    description: 'Manage restaurant inventory'
  },
  {
    name: 'invoice',
    displayName: 'Invoice Management',
    routes: {
      list: '/invoices',
      create: '/invoices',
      edit: '/invoices/:id',
      detail: '/invoices/:id'
    },
    permissions: {
      create: 'invoice:create',
      read: 'invoice:read',
      update: 'invoice:update',
      delete: 'invoice:delete'
    },
    icon: 'Receipt',
    description: 'Manage invoices and billing'
  },
  {
    name: 'analytics',
    displayName: 'Analytics',
    routes: {
      list: '/analytics',
      create: '/analytics',
      edit: '/analytics',
      detail: '/analytics'
    },
    permissions: {
      create: 'analytics:create',
      read: 'analytics:read',
      update: 'analytics:update',
      delete: 'analytics:delete'
    },
    icon: 'Analytics',
    description: 'View business analytics and reports'
  },
  {
    name: 'settings',
    displayName: 'Settings',
    routes: {
      list: '/settings/preferences',
      create: '/settings/preferences',
      edit: '/settings/preferences',
      detail: '/settings/preferences'
    },
    permissions: {
      create: 'settings:create',
      read: 'settings:read',
      update: 'settings:update',
      delete: 'settings:delete'
    },
    icon: 'Settings',
    description: 'Manage system settings'
  }
];

export default PermissionService; 