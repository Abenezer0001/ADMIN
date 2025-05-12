import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Alert,
  Avatar,
  Tab,
  Tabs
} from '@mui/material';
import {
  Edit as EditIcon,
  VpnKey as RolesIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  AccessTime as AccessTimeIcon,
  Domain as DomainIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Event as EventIcon,
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { formatDistance, format } from 'date-fns';
import UserService from '../../services/UserService';
import { User, UserStatus, AuditLogEntry } from '../../types/user';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      const response = await UserService.getUser(userId);
      
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setError(response.message || 'Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('An error occurred while loading user data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/users/edit/${id}`);
    }
  };

  const handleManageRoles = () => {
    if (id) {
      navigate(`/users/roles/${id}`);
    }
  };

  const handleBack = () => {
    navigate('/users');
  };

  // Render audit log entry
  const renderAuditLogEntry = (entry: AuditLogEntry) => {
    return (
      <ListItem key={entry.timestamp} divider>
        <ListItemIcon>
          <HistoryIcon />
        </ListItemIcon>
        <ListItemText
          primary={entry.action}
          secondary={
            <>
              <Typography component="span" variant="body2" color="textPrimary">
                {format(new Date(entry.timestamp), 'PPpp')}
              </Typography>
              {entry.performedBy && (
                <Typography component="span" variant="body2" color="textSecondary">
                  {` by ${entry.performedBy}`}
                </Typography>
              )}
              {entry.details && (
                <Typography variant="body2" color="textSecondary" display="block">
                  {entry.details}
                </Typography>
              )}
            </>
          }
        />
      </ListItem>
    );
  };

  // Status chip with appropriate color
  const renderStatusChip = (status?: UserStatus) => {
    if (!status) return null;
    
    let color: 'success' | 'error' | 'warning' | 'default' | 'primary' | 'secondary' | 'info' = 'default';
    
    switch (status) {
      case UserStatus.ACTIVE:
        color = 'success';
        break;
      case UserStatus.INACTIVE:
        color = 'error';
        break;
      case UserStatus.PENDING:
        color = 'warning';
        break;
      case UserStatus.SUSPENDED:
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        color={color}
        size="small"
        sx={{ ml: 1 }}
      />
    );
  };

  // Format date or show placeholder
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp');
    } catch (e) {
      return dateString;
    }
  };

  // Format date as relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={handleBack}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          User not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={handleBack}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with actions */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          User Details {renderStatusChip(user.status)}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RolesIcon />}
            onClick={handleManageRoles}
          >
            Manage Roles
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit User
          </Button>
        </Stack>
      </Box>

      {/* User Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: user.isActive ? 'primary.main' : 'grey.500' 
                }}
              >
                {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.username || user.email
                }
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user.email}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : 'No Role')} 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={user.isActive ? 'Active' : 'Inactive'} 
                  color={user.isActive ? 'success' : 'error'} 
                  variant="outlined" 
                  size="small" 
                />
              </Box>
            </Grid>
            <Grid item>
              <Typography variant="caption" display="block" color="textSecondary">
                Member since:
              </Typography>
              <Typography variant="body2">
                {formatRelativeTime(user.createdAt)}
              </Typography>
              <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                Last login:
              </Typography>
              <Typography variant="body2">
                {user.lastLogin ? formatRelativeTime(user.lastLogin) : 'Never'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profile Information" />
          <Tab label="Roles & Permissions" />
          <Tab label="Audit History" />
        </Tabs>

        {/* Profile Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Personal Information" />
                <Divider />
                <CardContent>
                  <List disablePadding>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Full Name"
                        secondary={user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : 'Not provided'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Username"
                        secondary={user.username || 'Not set'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={user.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone Number"
                        secondary={user.phoneNumber || 'Not provided'}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Employment Details" />
                <Divider />
                <CardContent>
                  <List disablePadding>
                    <ListItem>
                      <ListItemIcon>
                        <DomainIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Department"
                        secondary={user.department || 'Not assigned'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WorkIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Position"
                        secondary={user.position || 'Not assigned'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BadgeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Employee ID"
                        secondary={user.employeeId || 'Not assigned'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <AccessTimeIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Status"
                        secondary={
                          <Chip
                            label={user.status || 'Unknown'}
                            size="small"
                            color={user.status === UserStatus.ACTIVE ? 'success' : 
                                  user.status === UserStatus.INACTIVE ? 'error' : 
                                  user.status === UserStatus.PENDING ? 'warning' : 'default'}
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {user.address && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Address Information" />
                  <Divider />
                  <CardContent>
                    <Typography variant="body1">
                      {user.address.street && `${user.address.street}, `}
                      {user.address.city && `${user.address.city}, `}
                      {user.address.state && `${user.address.state}, `}
                      {user.address.zipCode && `${user.address.zipCode}, `}
                      {user.address.country}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Card>
                <CardHeader title="Notes" />
                <Divider />
                <CardContent>
                  <Typography variant="body1">
                    {user.notes || 'No notes available for this user.'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Roles & Permissions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Assigned Roles" 
                  action={
                    <Tooltip title="Manage Roles">
                      <IconButton onClick={handleManageRoles}>
                        <RolesIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  {user.roles && user.roles.length > 0 ? (
                    <List>
                      {Array.isArray(user.roles) && user.roles.map((role, index) => {
                        // Handle both string roles and Role objects
                        const roleName = typeof role === 'string' ? role : (role as any).name || 'Unknown Role';
                        return (
                          <ListItem key={index} divider={index < (user.roles?.length || 0) - 1}>
                            <ListItemIcon>
                              <RolesIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                              secondary={typeof role !== 'string' && (role as any).description}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : user.role ? (
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <RolesIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                        />
                      </ListItem>
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No roles assigned
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader 
                  title="Direct Permissions" 
                  action={
                    <Tooltip title="Manage Permissions">
                      <IconButton onClick={handleManageRoles}>
                        <SecurityIcon />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <Divider />
                <CardContent>
                  {user.directPermissions && user.directPermissions.length > 0 ? (
                    <List>
                      {Array.isArray(user.directPermissions) && user.directPermissions.map((permission, index) => {
                        // Handle both string permissions and Permission objects
                        const permName = typeof permission === 'string' ? permission : (permission as any).name || 'Unknown Permission';
                        return (
                          <ListItem key={index} divider={index < (user.directPermissions?.length || 0) - 1}>
                            <ListItemIcon>
                              <SecurityIcon color="secondary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={permName.replace(/:/g, ' • ')}
                              secondary={typeof permission !== 'string' && (permission as any).description}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : user.permissions ? (
                    <List>
                      {Array.isArray(user.permissions) && user.permissions.map((permission, index) => (
                        <ListItem key={index} divider={index < (user.permissions?.length || 0) - 1}>
                          <ListItemIcon>
                            <SecurityIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText primary={permission.replace(/:/g, ' • ')} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No direct permissions assigned
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader title="Effective Permissions" />
                <Divider />
                <CardContent>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    All permissions available to this user, including those granted via roles
                  </Typography>
                  
                  {/* Group permissions by category (assuming format like "category:action") */}
                  {(() => {
                    // Get all permissions from both direct permissions and role-inherited permissions
                    let allPermissions: string[] = [];
                    
                    // Add direct permissions
                    if (user.permissions && Array.isArray(user.permissions)) {
                      allPermissions.push(...user.permissions);
                    }
                    
                    if (user.directPermissions && Array.isArray(user.directPermissions)) {
                      user.directPermissions.forEach(perm => {
                        const permName = typeof perm === 'string' ? perm : (perm as any).name;
                        if (permName && !allPermissions.includes(permName)) {
                          allPermissions.push(permName);
                        }
                      });
                    }
                    
                    // Early return if no permissions
                    if (allPermissions.length === 0) {
                      return (
                        <Typography variant="body2" color="textSecondary">
                          No permissions available
                        </Typography>
                      );
                    }
                    
                    // Group permissions by category (first part of the permission string)
                    const groupedPermissions: { [key: string]: string[] } = {};
                    
                    allPermissions.forEach(perm => {
                      const parts = perm.split(':');
                      const category = parts.length > 1 ? parts[0] : 'general';
                      
                      if (!groupedPermissions[category]) {
                        groupedPermissions[category] = [];
                      }
                      groupedPermissions[category].push(perm);
                    });
                    
                    // Render grouped permissions
                    return Object.entries(groupedPermissions).map(([category, permissions]) => (
                      <Box key={category} mb={2}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Typography>
                        <Grid container spacing={1}>
                          {permissions.map(perm => {
                            // Extract action part of permission (after the colon)
                            const action = perm.includes(':') ? perm.split(':').slice(1).join(':') : perm;
                            return (
                              <Grid item key={perm}>
                                <Chip 
                                  label={action} 
                                  size="small" 
                                  variant="outlined" 
                                  color="secondary"
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    ));
                  })()}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Authorization History" />
                <Divider />
                <CardContent>
                  <List>
                    {user.lastModifiedBy && (
                      <ListItem>
                        <ListItemIcon>
                          <EventIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Last Modified By"
                          secondary={user.lastModifiedBy}
                        />
                      </ListItem>
                    )}
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Last Updated"
                        secondary={formatDate(user.updatedAt)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Creation Date"
                        secondary={formatDate(user.createdAt)}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Audit History Tab */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader title="Account Activity Log" />
            <Divider />
            <CardContent>
              {user.auditLog && user.auditLog.length > 0 ? (
                <List>
                  {user.auditLog.map((entry, index) => renderAuditLogEntry(entry))}
                </List>
              ) : (
                <Box textAlign="center" py={3}>
                  <HistoryIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    No audit history is available for this user
                  </Typography>
                </Box>
              )}

              {/* Mock data for demonstration when no real audit log exists */}
              {(!user.auditLog || user.auditLog.length === 0) && (
                <Box mt={4}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Sample audit entries (for demonstration only):
                  </Typography>
                  <List>
                    {[
                      {
                        action: 'User account created',
                        timestamp: user.createdAt || new Date().toISOString(),
                        performedBy: 'admin@example.com',
                        details: 'Initial account creation'
                      },
                      {
                        action: 'Role assigned',
                        timestamp: user.updatedAt || new Date().toISOString(),
                        performedBy: 'admin@example.com',
                        details: `Role '${user.role || 'user'}' assigned to account`
                      },
                      {
                        action: 'Password reset requested',
                        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                        performedBy: user.email,
                        details: 'Password reset email sent'
                      }
                    ].map((entry, index) => renderAuditLogEntry(entry as AuditLogEntry))}
                  </List>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
                    Note: These are example entries and do not represent actual user activity.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default UserDetail;
