import React, { createContext, useState, useEffect, useContext } from 'react';
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

const RbacContext = createContext<RbacContextType | undefined>(undefined);

export const RbacProvider: React.FC<{ children: any }> = ({ children }) => {
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUserRoles([]);
        setUserPermissions([]);
        setIsLoading(false);
        return;
      }
      
      // Get the current user's ID
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const userId = userResponse.data._id;
      
      // Fetch user's roles
      const rolesResponse = await axios.get(`${API_BASE_URL}/auth/users/${userId}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserRoles(rolesResponse.data);
      
      // Fetch user's effective permissions
      const permissionsResponse = await axios.get(`${API_BASE_URL}/auth/users/${userId}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserPermissions(permissionsResponse.data);
    } catch (err) {
      console.error('Error fetching RBAC data:', err);
      setError('Failed to load permissions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const checkPermission = (resource: string, action: string): boolean => {
    return userPermissions.some(
      permission => permission.resource === resource && permission.action === action
    );
  };

  const checkRole = (roleName: string): boolean => {
    return userRoles.some(role => role.name === roleName);
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
  const context = useContext(RbacContext);
  
  if (context === undefined) {
    throw new Error('useRbac must be used within a RbacProvider');
  }
  
  return context;
};

export default RbacContext; 