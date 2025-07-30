import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Chip, 
  Alert 
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { usePermissions } from '../../context/PermissionContext';
import { useAuth } from '../../context/AuthContext';

const PermissionDebugPanel: React.FC = () => {
  const { 
    userPermissions, 
    isLoading, 
    error, 
    refreshPermissions,
    hasPermission 
  } = usePermissions();
  const { user } = useAuth();

  const handleRefreshPermissions = async () => {
    console.log('[PermissionDebugPanel] Refreshing permissions...');
    await refreshPermissions();
    console.log('[PermissionDebugPanel] Permissions refreshed!');
  };

  const testRatingPermission = hasPermission('rating', 'read');

  return (
    <Paper sx={{ p: 2, m: 2, backgroundColor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>
        🔧 Permission Debug Panel
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          User: {user?.email} ({user?.role})
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Permissions Count: {userPermissions.length}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Loading: {isLoading ? 'Yes' : 'No'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshPermissions}
          disabled={isLoading}
        >
          Force Refresh Permissions
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Rating Permission Test:
        </Typography>
        <Chip
          label={`rating:read = ${testRatingPermission}`}
          color={testRatingPermission ? 'success' : 'error'}
          size="small"
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Current Permissions ({userPermissions.length}):
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 200, overflow: 'auto' }}>
          {userPermissions.map((permission, index) => (
            <Chip
              key={index}
              label={`${permission.resource}:${permission.action}`}
              size="small"
              variant="outlined"
              color={permission.resource === 'rating' ? 'primary' : 'default'}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default PermissionDebugPanel;