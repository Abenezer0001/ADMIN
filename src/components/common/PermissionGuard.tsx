import React from 'react';
import { usePermission } from '../../hooks/usePermission';

interface PermissionGuardProps {
  resource: string;
  action: string;
  children: any;
  fallback?: any;
}

/**
 * A component that conditionally renders its children based on whether the user has the specified permission.
 * 
 * @param resource The resource being accessed (e.g., 'orders', 'menu-items')
 * @param action The action being performed (e.g., 'create', 'read', 'update', 'delete')
 * @param children The content to render if the user has permission
 * @param fallback Optional content to render if the user doesn't have permission
 */
const PermissionGuard = ({
  resource,
  action,
  children,
  fallback = null
}: PermissionGuardProps) => {
  const hasPermission = usePermission(resource, action);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard; 