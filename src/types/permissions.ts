// Permission types for CRUD operations
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

// Resource types that can be managed
export type ResourceType = 
  | 'business'
  | 'restaurant' 
  | 'user'
  | 'menu'
  | 'menuitem'
  | 'category'
  | 'subcategory'
  | 'subsubcategory'
  | 'modifier'
  | 'table'
  | 'venue'
  | 'zone'
  | 'order'
  | 'customer'
  | 'inventory'
  | 'invoice'
  | 'analytics'
  | 'settings'
  | 'rating';

// Permission interface
export interface Permission {
  _id: string;
  resource: ResourceType;
  action: PermissionAction;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Role interface with permissions
export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  businessId?: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User with role and permissions
export interface UserWithPermissions {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  businessId?: string;
  isActive: boolean;
  isSuperAdmin?: boolean;
}

// Resource definition for UI
export interface ResourceDefinition {
  name: ResourceType;
  displayName: string;
  routes: {
    list: string;
    create: string;
    edit: string;
    detail: string;
  };
  permissions: {
    [K in PermissionAction]: string; // Permission ID or name
  };
  icon: string;
  description: string;
}

// Permission check result
export interface PermissionCheckResult {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
} 