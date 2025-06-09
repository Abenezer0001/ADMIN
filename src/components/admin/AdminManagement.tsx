import { useState, useEffect } from 'react';
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
import DataTable from '../common/DataTable';
import { MRT_ColumnDef } from 'material-react-table';

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
  // State
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'restaurant_admin'
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch admins and available roles on component mount
  useEffect(() => {
    fetchAdmins();
    fetchAvailableRoles();
  }, []);
  
  const fetchAvailableRoles = async () => {
    try {
      const availableRoles = await AdminService.getAvailableRoles();
      if (availableRoles.length > 0) {
        setRoles(availableRoles);
        // Set default role to first available role
        setFormData((prev: AdminFormData) => ({
          ...prev,
          role: availableRoles[0]
        }));
      } else {
        // Fallback if no roles available
        const userRole = localStorage.getItem('userRole');
        const defaultRoles = userRole === 'system_admin' 
          ? ['system_admin', 'restaurant_admin'] 
          : ['restaurant_admin'];
        setRoles(defaultRoles);
      }
    } catch (error) {
      console.error('Failed to fetch available roles:', error);
      // Fallback to default roles
      setRoles(['restaurant_admin']);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load administrators',
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
      const response = await AdminService.createAdmin(formData);
      console.log('Create admin response:', response);
      
      if (response.success) {
        // First update state to close the dialog
        setOpenDialog(false);
        
        // Reset form data
        setFormData({
          email: '',
          firstName: '',
          lastName: ''
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
            message: 'Administrator created successfully! A setup email has been sent to their email address.',
            severity: 'success'
          });
        }, 100);
        
        // Refresh admin list
        fetchAdmins();
      } else {
        // Show error toast but don't close dialog
        setSnackbar({
          open: true,
          message: response.message || 'Failed to create administrator',
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred while creating the administrator',
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
        const totalPermissions = [
          ...(row.roles || []),
          ...(row.roles || [])
        ].length;
        return totalPermissions;
      },
      Cell: ({ cell }) => (
        <Chip 
          label={`${cell.getValue<number>()} permissions`} 
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
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
