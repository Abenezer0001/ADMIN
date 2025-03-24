import { useRbac } from '../context/RbacContext';

/**
 * Custom hook to check if the current user has a specific permission
 * @param resource The resource being accessed (e.g., 'orders', 'menu-items')
 * @param action The action being performed (e.g., 'create', 'read', 'update', 'delete')
 * @returns Boolean indicating if the user has the permission
 */
export const usePermission = (resource: string, action: string): boolean => {
  const { checkPermission } = useRbac();
  return checkPermission(resource, action);
}; 