import React from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

interface Permission {
  _id: string;
  resource: string;
  action: string;
  description: string;
}

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface RbacContextType {
  userRoles: Role[];
  userPermissions: Permission[];
  isLoading: boolean;
  error: string | null;
  checkPermission: (resource: string, action: string) => boolean;
  checkRole: (roleName: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

interface RbacProviderProps {
  children: React.ReactNode;
}

interface PermissionsResponse {
  success: boolean;
  permissions: Permission[];
}

interface UserResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const RbacContext = React.createContext<RbacContextType | undefined>(undefined);

export const RbacProvider = ({ children }: RbacProviderProps) => {
  const [userRoles, setUserRoles] = React.useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = React.useState<Permission[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUserPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the new /me/permissions endpoint with cookie authentication
      const permissionsResponse = await axios.get<PermissionsResponse>(`${API_BASE_URL}/auth/me/permissions`, {
        withCredentials: true // This ensures cookies are sent
      });
      
      if (permissionsResponse.data.success) {
        setUserPermissions(permissionsResponse.data.permissions);
      } else {
        setUserPermissions([]);
      }
      
      // Also get user info to check roles
      const userResponse = await axios.get<UserResponse>(`${API_BASE_URL}/auth/me`, {
        withCredentials: true
      });
      
      if (userResponse.data.success && userResponse.data.user) {
        const userId = userResponse.data.user.id;
        
        // Fetch user's roles
        try {
          const rolesResponse = await axios.get<Role[]>(`${API_BASE_URL}/auth/users/${userId}/roles`, {
            withCredentials: true
          });
          setUserRoles(rolesResponse.data || []);
        } catch (roleError) {
          console.warn('Could not fetch user roles:', roleError);
          setUserRoles([]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching RBAC data:', err);
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in.');
        setUserRoles([]);
        setUserPermissions([]);
      } else {
        setError('Failed to load permissions. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUserPermissions();
  }, []);

  const checkPermission = (resource: string, action: string): boolean => {
    return userPermissions.some(
      (permission: Permission) => permission.resource === resource && permission.action === action
    );
  };

  const checkRole = (roleName: string): boolean => {
    return userRoles.some((role: Role) => role.name === roleName);
  };

  const refreshPermissions = async (): Promise<void> => {
    await fetchUserPermissions();
  };

  const value = {
    userRoles,
    userPermissions,
    isLoading,
    error,
    checkPermission,
    checkRole,
    refreshPermissions
  };

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
};

export const useRbac = (): RbacContextType => {
  const context = React.useContext(RbacContext);
  
  if (context === undefined) {
    throw new Error('useRbac must be used within a RbacProvider');
  }
  
  return context;
};

export default RbacContext; 