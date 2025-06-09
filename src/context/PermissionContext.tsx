import React from 'react';
import { 
  Permission, 
  ResourceType, 
  PermissionAction, 
  PermissionCheckResult,
  UserWithPermissions 
} from '../types/permissions';
import PermissionService from '../services/PermissionService';
import { useAuth } from './AuthContext';

interface PermissionContextType {
  userPermissions: Permission[];
  isLoading: boolean;
  error: string | null;
  
  // Permission checking methods
  hasPermission: (resource: ResourceType, action: PermissionAction) => boolean;
  getResourcePermissions: (resource: ResourceType) => PermissionCheckResult;
  canAccess: (resource: ResourceType) => boolean;
  
  // Data management
  loadUserPermissions: () => Promise<void>;
  seedPermissions: () => Promise<void>;
  
  // Resource access helpers
  getAccessibleResources: () => ResourceType[];
  isResourceAccessible: (resource: ResourceType) => boolean;
}

const PermissionContext = React.createContext<PermissionContextType | undefined>(undefined);

export const usePermissions = () => {
  const context = React.useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

interface PermissionProviderProps {
  children: React.ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userPermissions, setUserPermissions] = React.useState<Permission[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Cache for permission checks to avoid repeated API calls
  const [permissionCache, setPermissionCache] = React.useState<Map<string, boolean>>(new Map());
  const [resourcePermissionCache, setResourcePermissionCache] = React.useState<Map<string, PermissionCheckResult>>(new Map());

  // Load user permissions on auth change
  React.useEffect(() => {
    if (isAuthenticated && user) {
      loadUserPermissions();
    } else {
      setUserPermissions([]);
      setPermissionCache(new Map());
      setResourcePermissionCache(new Map());
    }
  }, [isAuthenticated, user]);

  const loadUserPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const permissions = await PermissionService.getUserPermissions();
      setUserPermissions(permissions);
    } catch (err: any) {
      console.error('Failed to load user permissions:', err);
      setError(err.message || 'Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const seedPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await PermissionService.seedPermissions();
      // Reload permissions after seeding
      await loadUserPermissions();
    } catch (err: any) {
      console.error('Failed to seed permissions:', err);
      setError(err.message || 'Failed to seed permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (resource: ResourceType, action: PermissionAction): boolean => {
    // System admin has all permissions
    if (user?.role === 'system_admin') {
      return true;
    }

    const cacheKey = `${resource}:${action}`;
    
    // Check cache first
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!;
    }

    // Check permissions - removed isActive check since it doesn't exist in API response
    const hasAccess = userPermissions.some(permission => 
      permission.resource === resource && 
      permission.action === action
    );

    // Cache the result
    setPermissionCache(prev => new Map(prev).set(cacheKey, hasAccess));
    
    return hasAccess;
  };

  const getResourcePermissions = (resource: ResourceType): PermissionCheckResult => {
    // System admin has all permissions
    if (user?.role === 'system_admin') {
      return { canCreate: true, canRead: true, canUpdate: true, canDelete: true };
    }

    // Check cache first
    if (resourcePermissionCache.has(resource)) {
      return resourcePermissionCache.get(resource)!;
    }

    const permissions = {
      canCreate: hasPermission(resource, 'create'),
      canRead: hasPermission(resource, 'read'),
      canUpdate: hasPermission(resource, 'update'),
      canDelete: hasPermission(resource, 'delete')
    };

    // Cache the result
    setResourcePermissionCache(prev => new Map(prev).set(resource, permissions));

    return permissions;
  };

  const canAccess = (resource: ResourceType): boolean => {
    // System admin has access to everything
    if (user?.role === 'system_admin') {
      return true;
    }

    // User can access if they have at least read permission
    return hasPermission(resource, 'read');
  };

  const getAccessibleResources = (): ResourceType[] => {
    // System admin has access to all resources
    if (user?.role === 'system_admin') {
      return [
        'business', 'restaurant', 'user', 'menu', 'menuitem', 
        'category', 'subcategory', 'subsubcategory', 'modifier',
        'table', 'venue', 'zone', 'order', 'customer', 
        'inventory', 'invoice', 'analytics', 'settings'
      ];
    }

    const accessible: ResourceType[] = [];
    const resources: ResourceType[] = [
      'business', 'restaurant', 'user', 'menu', 'menuitem',
      'category', 'subcategory', 'subsubcategory', 'modifier',
      'table', 'venue', 'zone', 'order', 'customer',
      'inventory', 'invoice', 'analytics', 'settings'
    ];

    resources.forEach(resource => {
      if (canAccess(resource)) {
        accessible.push(resource);
      }
    });

    return accessible;
  };

  const isResourceAccessible = (resource: ResourceType): boolean => {
    return canAccess(resource);
  };

  const value: PermissionContextType = {
    userPermissions,
    isLoading,
    error,
    hasPermission,
    getResourcePermissions,
    canAccess,
    loadUserPermissions,
    seedPermissions,
    getAccessibleResources,
    isResourceAccessible
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext; 