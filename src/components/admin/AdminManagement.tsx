import React from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import AdminService, { AdminUser } from '../../services/AdminService';
import BusinessService from '../../services/BusinessService';
import DataTable from '../common/DataTable';
import { MRT_ColumnDef } from 'material-react-table';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';

interface AdminListResponse {
  message: string;
  admins: AdminUser[];
}

interface AdminFormData {
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const AdminManagement: React.FC = () => {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  
  // State
  const [admins, setAdmins] = React.useState<AdminUser[]>([]);
  const [businessUsers, setBusinessUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [formData, setFormData] = React.useState<AdminFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'restaurant_admin'
  });
  const [roles, setRoles] = React.useState<string[]>([]);
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [snackbar, setSnackbar] = React.useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Check if user is system admin
  const isSystemAdmin = user?.role === 'system_admin' || user?.roles?.some((role: any) => 
    typeof role === 'string' ? role === 'system_admin' : role.name === 'system_admin'
  );

  // Fetch admins and available roles on component mount
  React.useEffect(() => {
    if (isSystemAdmin) {
      fetchAdmins();
      fetchAvailableRoles();
    } else {
      // For restaurant admins, fetch business users
      fetchBusinessUsers();
      fetchAvailableRoles();
    }
  }, [isSystemAdmin, currentBusiness]);

  const fetchBusinessUsers = async () => {
    if (!currentBusiness?._id) {
      console.log('No current business found for fetching users');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching business users for business:', currentBusiness._id);
      console.log('User context:', { user, isSystemAdmin });
      
      // Use BusinessService with proper authentication and business ID
      const businessId = currentBusiness._id;
      const response = await BusinessService.getBusinessUsers(businessId);
      
      console.log('Business users response:', response);
      
      // Handle the new response format: {users: [], count: number}
      if (response && response.users && Array.isArray(response.users)) {
        setBusinessUsers(response.users);
        console.log(`Successfully loaded ${response.users.length} business users`);
        
        if (response.users.length > 0) {
        setSnackbar({
          open: true,
          message: `Loaded ${response.users.length} business users successfully.`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'No business users found for this business.',
          severity: 'info'
        });
      }
      } else {
        console.log('No users found in response:', response);
        setBusinessUsers([]);
        setSnackbar({
          open: true,
          message: 'No business users found.',
          severity: 'info'
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch business users:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        setSnackbar({
          open: true,
          message: 'Authentication failed. Please log in again.',
          severity: 'error'
        });
      } else if (error.response?.status === 403) {
        setSnackbar({
          open: true,
          message: 'Access denied. You do not have permission to view business users.',
          severity: 'error'
        });
      } else {
        // For other errors, show a fallback with current user
        console.log('Using fallback user data due to error:', error.message);
      setBusinessUsers([{
        _id: user?._id || '',
        email: user?.email || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        role: user?.role || 'restaurant_admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        roles: user?.roles || []
      }]);
      
      setSnackbar({
        open: true,
          message: `Unable to load business users: ${error.message}. Showing current user as fallback.`,
        severity: 'warning'
      });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      if (isSystemAdmin) {
        // Use the correct RBAC endpoint for system admin
        const response = await axios.get(`${API_BASE_URL}/rbac/roles`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('Roles response:', response.data);
        
        // Handle different response formats
        const data = response.data as any;
        let rolesData = [];
        if (Array.isArray(data)) {
          rolesData = data;
        } else if (data.roles && Array.isArray(data.roles)) {
          rolesData = data.roles;
        } else if (data.data && Array.isArray(data.data)) {
          rolesData = data.data;
        }
        
        // For system admin, show all roles
        const roleNames = rolesData.map((role: any) => role.name || role).filter(Boolean);
        
        if (roleNames.length > 0) {
          setRoles(roleNames);
          setFormData((prev: AdminFormData) => ({
            ...prev,
            role: roleNames.includes('restaurant_admin') ? 'restaurant_admin' : roleNames[0]
          }));
        } else {
          setRoles(['system_admin', 'restaurant_admin']);
        }
      } else {
        // Restaurant admin - get business-specific roles
        if (!currentBusiness?._id) {
          console.log('No current business found for fetching roles');
          setRoles(['restaurant_admin']);
          return;
        }

        try {
          const response = await axios.get(`${API_BASE_URL}/rbac/roles`, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('Business roles response:', response.data);
          
          const data = response.data as any;
          let rolesData = [];
          if (Array.isArray(data)) {
            rolesData = data;
          } else if (data.roles && Array.isArray(data.roles)) {
            rolesData = data.roles;
          } else if (data.data && Array.isArray(data.data)) {
            rolesData = data.data;
          }
          
          // Filter roles that belong to the current business or are system-level restaurant roles
          const businessRoles = rolesData.filter((role: any) => {
            const isBusiness = role.businessId === currentBusiness._id;
            const isRestaurantRole = role.name === 'restaurant_admin' && !role.businessId;
            return isBusiness || isRestaurantRole;
          });
          
          console.log('Filtered business roles:', businessRoles);
          
          // Extract role names
          const roleNames = businessRoles.map((role: any) => role.name || role).filter(Boolean);
          
          if (roleNames.length > 0) {
            setRoles(roleNames);
            setFormData((prev: AdminFormData) => ({
              ...prev,
              role: roleNames.includes('restaurant_admin') ? 'restaurant_admin' : roleNames[0]
            }));
          } else {
            // Fallback if no business roles found
            setRoles(['restaurant_admin']);
          }
        } catch (error) {
          console.error('Failed to fetch business roles:', error);
        setRoles(['restaurant_admin']);
        }
      }
    } catch (error) {
      console.error('Failed to fetch available roles:', error);
      // Fallback to default roles based on user role
      setRoles(isSystemAdmin ? ['system_admin', 'restaurant_admin'] : ['restaurant_admin']);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      if (isSystemAdmin) {
        const response = await AdminService.listAdmins();
        console.log('Fetched admins:', response);
        if (response?.admins && Array.isArray(response.admins)) {
          setAdmins(response.admins);
        } else {
          console.error('No admins data found or invalid format', response);
          setAdmins([]);
          setSnackbar({
            open: true,
            message: 'No admin users found',
            severity: 'info'
          });
        }
      } else {
        // For restaurant admins, show their business users or a message
        setSnackbar({
          open: true,
          message: 'Restaurant admin view - contact system administrator to manage users',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setSnackbar({
        open: true,
        message: isSystemAdmin ? 'Failed to load administrators' : 'Access restricted - contact system administrator',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form data and errors
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'restaurant_admin'
    });
    setFormErrors({
      email: '',
      firstName: '',
      lastName: '',
      role: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name as string]: value
      });
    }
    // Clear error when user types
    if (name && formErrors[name as string]) {
      setFormErrors({
        ...formErrors,
        [name as string]: ''
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors: Record<string, string> = {
      email: '',
      firstName: '',
      lastName: ''
    };

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    // First name validation
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
      isValid = false;
    }

    // Last name validation
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateAdmin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('Creating admin with data:', formData);
      
      let response: any;
      if (isSystemAdmin) {
        // System admin creating another admin
        response = await AdminService.createAdmin(formData);
      } else {
        // Restaurant admin creating business user
        if (!currentBusiness?._id) {
          setSnackbar({
            open: true,
            message: 'No business selected. Please select a business first.',
            severity: 'error'
          });
          return;
        }

        // Get the role ID for the selected role
        let roleIds: string[] = [];
        if (formData.role && formData.role !== 'restaurant_admin') {
          // Find the role ID from the available roles
          try {
            const rolesResponse = await axios.get(`${API_BASE_URL}/rbac/roles`, {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            const responseData = rolesResponse.data as any;
            const rolesData = Array.isArray(responseData) ? responseData : responseData.roles || [];
            const selectedRole = rolesData.find((role: any) => role.name === formData.role);
            
            if (selectedRole) {
              roleIds = [selectedRole._id];
              console.log('Found role ID for', formData.role, ':', selectedRole._id);
            }
          } catch (error) {
            console.error('Failed to fetch role ID:', error);
          }
        }
        
        // Use BusinessService instead of AdminService
        response = await BusinessService.createBusinessUser({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          roleIds: roleIds, // Pass the actual role IDs
          businessId: currentBusiness._id
        });
      }
      
      console.log('Create response:', response);
      
      // Handle the new response format from BusinessService
      const isSuccess = response.user || response.admin || response.success || !!response.message;
      if (isSuccess) {
        // First update state to close the dialog
        setOpenDialog(false);
        
        // Reset form data
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          role: 'restaurant_admin'
        });
        
        // Reset form errors
        setFormErrors({
          email: '',
          firstName: '',
          lastName: ''
        });
        
        // Then show success toast
        setTimeout(() => {
          setSnackbar({
            open: true,
            message: isSystemAdmin 
              ? 'Administrator created successfully! A setup email has been sent to their email address.'
              : 'Business user created successfully! A setup email has been sent to their email address.',
            severity: 'success'
          });
        }, 100);
        
        // Refresh the appropriate list
        if (isSystemAdmin) {
          fetchAdmins();
        } else {
          fetchBusinessUsers();
        }
      } else {
        // Show error toast but don't close dialog
        setSnackbar({
          open: true,
          message: response.message || 'Failed to create user',
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred while creating the user',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Define columns for DataTable
  const columns: MRT_ColumnDef<AdminUser>[] = [
    { 
      accessorKey: 'email', 
      header: 'Email',
      size: 200,
    },
    { 
      accessorKey: 'firstName', 
      header: 'First Name',
      size: 150,
    },
    { 
      accessorKey: 'lastName', 
      header: 'Last Name',
      size: 150,
    },
    { 
      accessorKey: 'role', 
      header: 'Role',
      size: 150,
    },
    { 
      accessorKey: 'isActive', 
      header: 'Status',
      size: 100,
      Cell: ({ cell }) => {
        const isActive = cell.getValue<boolean>();
        return (
          <Chip 
            label={isActive ? 'Active' : 'Inactive'} 
            color={isActive ? 'success' : 'default'} 
            size="small"
          />
        );
      },
    },
    {
      id: 'permissions',
      header: 'Permissions',
      size: 120,
      accessorFn: (row) => {
        // Calculate permissions from roles array
        const rolesCount = row.roles ? (Array.isArray(row.roles) ? row.roles.length : 1) : 0;
        return rolesCount;
      },
      Cell: ({ cell }) => (
        <Chip 
          label={`${cell.getValue<number>()} role(s)`} 
          color="primary" 
          size="small"
        />
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      size: 180,
      Cell: ({ cell }) => {
        const date = cell.getValue<string>();
        return date ? format(new Date(date), 'MMM dd, yyyy HH:mm') : '-';
      },
    }
  ] as MRT_ColumnDef<AdminUser>[];

  // Restaurant Admin View
  if (!isSystemAdmin) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
              Business Users
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Business User
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" paragraph>
            Managing users for: {currentBusiness?.name || 'Your Business'}
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : businessUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="textSecondary">
                No business users found.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2, height: 'calc(100vh - 300px)', overflow: 'auto' }}>
              <DataTable 
                columns={columns}
                data={businessUsers}
                enableColumnFilters={true}
                enableColumnOrdering={true}
                enablePinning={true}
                enableGrouping={false}
              />
            </Box>
          )}
        </Box>
        
        {/* Add User Dialog for Restaurant Admin */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Business User</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                autoFocus
              />
              <TextField
                fullWidth
                margin="normal"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
              <TextField
                select
                fullWidth
                margin="normal"
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                SelectProps={{
                  native: true,
                }}
                helperText="Select user role"
              >
                {roles.map((role: string) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Box sx={{ position: 'relative' }}>
              <Button 
                onClick={handleCreateAdmin} 
                color="primary" 
                variant="contained"
                disabled={loading}
              >
                Create
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>
          </DialogActions>
        </Dialog>
        
        {/* Notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  // System Admin View
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
            Admin Users
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add New Admin
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : admins.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="body1" color="textSecondary">
              No admin users found. Click the button above to add a new admin.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 2, height: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <DataTable 
              columns={columns}
              data={admins}
              enableColumnFilters={true}
              enableColumnOrdering={true}
              enablePinning={true}
              enableGrouping={false}
            />
          </Box>
        )}
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Administrator</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              autoFocus
            />
            <TextField
              fullWidth
              margin="normal"
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />
            <TextField
              select
              fullWidth
              margin="normal"
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              SelectProps={{
                native: true,
              }}
              helperText="Select admin role"
            >
              {roles.map((role: string) => (
                <option key={role} value={role}>
                  {role === 'system_admin' ? 'System Admin' : 'Restaurant Admin'}
                </option>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Box sx={{ position: 'relative' }}>
            <Button 
              onClick={handleCreateAdmin} 
              color="primary" 
              variant="contained"
              disabled={loading}
            >
              Create
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          '& .MuiAlert-root': { 
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          } 
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          color={snackbar.severity}
          sx={{ 
            width: '100%',
            fontSize: '1rem',
            alignItems: 'center',
            ...(snackbar.severity === 'success' && {
              backgroundColor: '#4caf50',
              color: '#fff'
            })
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminManagement;
