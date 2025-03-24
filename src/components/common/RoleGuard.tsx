import React from 'react';
import { useRole } from '../../hooks/useRole';

interface RoleGuardProps {
  role: string;
  children: any;
  fallback?: any;
}

/**
 * A component that conditionally renders its children based on whether the user has the specified role.
 * 
 * @param role The role name to check
 * @param children The content to render if the user has the role
 * @param fallback Optional content to render if the user doesn't have the role
 */
const RoleGuard = ({
  role,
  children,
  fallback = null
}: RoleGuardProps) => {
  const hasRole = useRole(role);

  return hasRole ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard; 