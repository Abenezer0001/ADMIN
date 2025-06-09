import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  Restaurant as RestaurantIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Category as CategoryIcon,
  TableRestaurant as TableRestaurantIcon,
  LocationOn as LocationOnIcon,
  Map as MapIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../context/PermissionContext';
import { RESOURCE_DEFINITIONS } from '../services/PermissionService';
import { ResourceType } from '../types/permissions';

const iconMap: Record<string, React.ReactElement> = {
  Business: <BusinessIcon />,
  Restaurant: <RestaurantIcon />,
  People: <PeopleIcon />,
  MenuBook: <MenuBookIcon />,
  RestaurantMenu: <RestaurantMenuIcon />,
  Category: <CategoryIcon />,
  Edit: <EditIcon />,
  TableRestaurant: <TableRestaurantIcon />,
  LocationOn: <LocationOnIcon />,
  Map: <MapIcon />,
  ShoppingCart: <ShoppingCartIcon />,
  Inventory: <InventoryIcon />,
  Receipt: <ReceiptIcon />,
  Analytics: <AnalyticsIcon />,
  Settings: <SettingsIcon />
};

const ResourceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    getAccessibleResources, 
    getResourcePermissions, 
    isLoading, 
    error,
    seedPermissions,
    userPermissions 
  } = usePermissions();

  const accessibleResources = getAccessibleResources();

  const handleSeedPermissions = async () => {
    try {
      await seedPermissions();
    } catch (err) {
      console.error('Failed to seed permissions:', err);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SecurityIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Resource Management Dashboard
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleSeedPermissions}
          disabled={isLoading}
        >
          Seed Permissions
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Permissions Summary
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You have access to {accessibleResources.length} resource(s) with {userPermissions.length} total permissions.
        </Typography>
      </Box>

      {accessibleResources.length === 0 ? (
        <Alert severity="warning">
          You don't have access to any resources. Please contact your administrator to assign appropriate roles and permissions.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {RESOURCE_DEFINITIONS
            .filter(resource => accessibleResources.includes(resource.name))
            .map((resource) => {
              const permissions = getResourcePermissions(resource.name);
              const icon = iconMap[resource.icon] || <SecurityIcon />;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={resource.name}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {React.cloneElement(icon, { sx: { fontSize: 32, mr: 2, color: 'primary.main' } })}
                        <Typography variant="h6" component="h2">
                          {resource.displayName}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {resource.description}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Permissions:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {permissions.canRead && (
                            <Chip label="Read" size="small" color="success" variant="outlined" />
                          )}
                          {permissions.canCreate && (
                            <Chip label="Create" size="small" color="primary" variant="outlined" />
                          )}
                          {permissions.canUpdate && (
                            <Chip label="Update" size="small" color="warning" variant="outlined" />
                          )}
                          {permissions.canDelete && (
                            <Chip label="Delete" size="small" color="error" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {permissions.canRead && (
                          <Tooltip title="View/List">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleNavigate(resource.routes.list)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {permissions.canCreate && (
                          <Tooltip title="Create New">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleNavigate(resource.routes.create)}
                            >
                              <AddIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {permissions.canUpdate && (
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleNavigate(resource.routes.list)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Button 
                        size="small" 
                        variant="text"
                        onClick={() => handleNavigate(resource.routes.list)}
                        sx={{ ml: 'auto' }}
                      >
                        Manage
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      )}

      {/* Detailed Permissions List */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Permissions
        </Typography>
        <Card>
          <CardContent>
            <List dense>
              {userPermissions.map((permission: any, index: number) => (
                <ListItem key={`${permission.resource}-${permission.action}-${index}`}>
                  <ListItemIcon>
                    {iconMap[RESOURCE_DEFINITIONS.find(r => r.name === permission.resource)?.icon || 'Security'] || <SecurityIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${permission.action.toUpperCase()} ${permission.resource.toUpperCase()}`}
                    secondary={permission.description}
                  />
                  <Chip 
                    label={permission.isActive ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={permission.isActive ? 'success' : 'default'}
                  />
                </ListItem>
              ))}
              {userPermissions.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No permissions found"
                    secondary="Contact your administrator to assign permissions"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ResourceDashboard; 