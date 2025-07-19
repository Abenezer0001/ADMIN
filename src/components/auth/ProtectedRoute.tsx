import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';
import { useBusiness } from '../../context/BusinessContext';
import { ResourceType, PermissionAction } from '../../types/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource?: ResourceType;
  action?: PermissionAction;
  requireSuperAdmin?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  resource,
  action = 'read',
  requireSuperAdmin = false,
  fallbackPath = '/dashboard'
}) => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { isSuperAdmin } = useBusiness();
  const location = useLocation();

  // Show loading while checking authentication and permissions
  if (authLoading || permissionsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. Super Admin privileges required.
        </Alert>
      </Box>
    );
  }

  // Check resource permission if specified
  // System admins should have access to everything, even during permission loading
  if (resource && user?.role !== 'system_admin' && !hasPermission(resource, action)) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. You don't have permission to {action} {resource} resources.
        </Alert>
      </Box>
    );
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 