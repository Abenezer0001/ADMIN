import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import UserManagementService, { User, UserRole, UsersResponse } from '../services/UserManagementService';
import { useBusiness } from '../context/BusinessContext';

const AccessControl: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useBusiness();
  
  const [users, setUsers] = React.useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = React.useState<UserRole[]>([]);
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadData();
  }, [selectedRole]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load users with role filter
      const usersResponse: UsersResponse = await UserManagementService.getUsers(
        selectedRole === 'all' ? undefined : selectedRole
      );
      setUsers(usersResponse.users);

      // Load available roles for filtering
      const roles: UserRole[] = await UserManagementService.getAvailableRoles();
      setAvailableRoles(roles);

    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      toast.error(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
  };

  const handleView = (user: User) => {
    console.log('View user:', user);
    // Navigate to user detail page or open modal
  };

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
    // Navigate to edit page or open edit modal
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`)) {
      try {
        await UserManagementService.updateUserStatus(user._id, false);
        toast.success('User deactivated successfully');
        loadData(); // Refresh the list
      } catch (err: any) {
        toast.error(err.message || 'Failed to deactivate user');
      }
    }
  };

  const handleGenerateResetToken = async (user: User) => {
    try {
      const result = await UserManagementService.generatePasswordResetToken(user.email);
      toast.success(`Password reset token generated successfully. Token: ${result.token.substring(0, 16)}...`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate password reset token');
    }
  };

  const handleAddNew = () => {
    if (isSuperAdmin()) {
      navigate('/settings/admins/new');
    } else {
      navigate('/my-business/users/new');
    }
  };

  const getRoleBadgeColor = (role: string): 'error' | 'warning' | 'info' | 'success' | 'default' => {
    switch (role.toLowerCase()) {
      case 'system_admin':
        return 'error';
      case 'restaurant_admin':
        return 'warning';
      case 'manager':
        return 'info';
      case 'staff':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPageTitle = (): string => {
    if (isSuperAdmin()) {
      return 'User Management - All Users';
    } else {
      return 'User Management - My Business Users';
    }
  };

  const getPageSubtitle = (): string => {
    if (isSuperAdmin()) {
      return 'Manage all restaurant admins and other role users across the system (customers shown separately)';
    } else {
      return 'Manage users in your business (customers shown in the Customers page)';
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={() => loadData()} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
            {getPageTitle()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {getPageSubtitle()}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => loadData()} disabled={isLoading} title="Refresh">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            disabled={isLoading}
          >
            Add New User
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={selectedRole}
                  label="Filter by Role"
                  onChange={handleRoleFilterChange}
                  disabled={isLoading}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  {availableRoles.map((role: UserRole) => (
                    <MenuItem key={role._id} value={role.name}>
                      {role.name} {role.description && `(${role.description})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="body2" color="text.secondary">
                {isLoading ? 'Loading...' : `Showing ${users.length} user(s)`}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Additional Roles</TableCell>
                    {isSuperAdmin() && <TableCell>Business</TableCell>}
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={getRoleBadgeColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.roles && user.roles.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {user.roles.map((role: { _id: string; name: string; description: string }) => (
                              <Chip
                                key={role._id}
                                label={role.name}
                                size="small"
                                variant="outlined"
                                title={role.description}
                              />
                            ))}
                          </Box>
                        )}
                      </TableCell>
                      {isSuperAdmin() && (
                        <TableCell>
                          {user.businessId ? (
                            <Typography variant="body2">{user.businessId.name}</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No Business
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleView(user)}
                            title="View Details"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(user)}
                            title="Edit User"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleGenerateResetToken(user)}
                            title="Generate Password Reset"
                          >
                            <KeyIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(user)}
                            title="Deactivate User"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {users.length === 0 && (
                    <TableRow>
                      <TableCell 
                        component="td"
                        sx={{ textAlign: 'center', py: 4 }}
                        {...{ colSpan: isSuperAdmin() ? 7 : 6 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {selectedRole === 'all' ? 'No users found' : `No users found with role: ${selectedRole}`}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AccessControl;
