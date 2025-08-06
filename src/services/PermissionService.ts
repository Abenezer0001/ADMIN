// import api from '../utils/axiosConfig';
import { API_BASE_URL } from '../utils/config';
import api from '../utils/axiosConfig';
import { 
  Permission, 
  Role, 
  UserWithPermissions, 
  ResourceType, 
  PermissionAction, 
  PermissionCheckResult,
  ResourceDefinition
} from '../types/permissions';

export class PermissionService {
  private baseUrl : string;
   
  constructor(){
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get all permissions
   */
  static async getAllPermissions(): Promise<Permission[]> {
    try {
      console.log('Fetching all permissions...');
      const response = await api.get('/auth/permissions');
      console.log('All permissions response:', response.data);
      return (response.data as any).permissions || response.data as Permission[];
    } catch (error: any) {
      console.error('Error fetching all permissions:', error);
      throw error;
    }
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(userId?: string): Promise<Permission[]> {
    try {
      const url = userId 
        ? `/auth/users/${userId}/permissions`
        : `/auth/me/permissions`;
      console.log('Fetching user permissions from:', url);
      
      const response = await api.get(url);
      console.log('User permissions response:', response.data);
      
      return (response.data as any).permissions || response.data as Permission[];
    } catch (error: any) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
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
      const hasPermission = permissions.some(permission => 
        permission.resource === resource && permission.action === action
      );
      console.log(`Permission check for ${resource}:${action}:`, hasPermission);
      return hasPermission;
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
    try {
      console.log('Seeding permissions...');
      const response = await api.post('/auth/permissions/seed');
      console.log('Seed permissions response:', response.data);
      return response.data as { message: string; permissions: Permission[] };
    } catch (error: any) {
      console.error('Error seeding permissions:', error);
      throw error;
    }
  }

  /**
   * Create a new permission
   */
  static async createPermission(permissionData: {
    resource: ResourceType;
    action: PermissionAction;
    description: string;
  }): Promise<Permission> {
    try {
      console.log('Creating permission:', permissionData);
      const response = await api.post('/auth/permissions', permissionData);
      console.log('Create permission response:', response.data);
      return (response.data as any).permission || response.data as Permission;
    } catch (error: any) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  /**
   * Update permission
   */
  static async updatePermission(
    permissionId: string, 
    updateData: Partial<Permission>
  ): Promise<Permission> {
    try {
      console.log('Updating permission:', permissionId, updateData);
      const response = await api.put(`/auth/permissions/${permissionId}`, updateData);
      console.log('Update permission response:', response.data);
      return (response.data as any).permission || response.data as Permission;
    } catch (error: any) {
      console.error('Error updating permission:', error);
      throw error;
    }
  }

  /**
   * Delete permission
   */
  static async deletePermission(permissionId: string): Promise<{ message: string }> {
    try {
      console.log('Deleting permission:', permissionId);
      const response = await api.delete(`/auth/permissions/${permissionId}`);
      console.log('Delete permission response:', response.data);
      return response.data as { message: string };
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      throw error;
    }
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
  },
  {
    name: 'rating',
    displayName: 'Rating & Reviews',
    routes: {
      list: '/ratings/analytics',
      create: '/ratings/reviews',
      edit: '/ratings/reviews',
      detail: '/ratings/analytics'
    },
    permissions: {
      create: 'rating:create',
      read: 'rating:read',
      update: 'rating:update',
      delete: 'rating:delete'
    },
    icon: 'Star',
    description: 'Manage ratings and reviews'
  }
];

export default PermissionService; 