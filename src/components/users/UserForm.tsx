import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import UserService from '../../services/UserService';
import { 
  User, 
  UserStatus, 
  CreateUserRequest, 
  UpdateUserRequest 
} from '../../types/user';

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  // Form data state
  const [formData, setFormData] = useState<CreateUserRequest | UpdateUserRequest>({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    role: 'user', // Default role
    isActive: true,
  });
  
  // Password field state (only for create mode)
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Available roles (could be fetched from an API)
  const [roles, setRoles] = useState<string[]>(['admin', 'manager', 'user']);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Fetch user data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchUser(id);
    }
    
    // Fetch available roles
    fetchRoles();
  }, [isEditMode, id]);

  // Fetch a single user by ID
  const fetchUser = async (userId: string) => {
    try {
      setInitialLoading(true);
      const response = await UserService.getUser(userId);
      
      if (response.success && response.user) {
        const user = response.user;
        setFormData({
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          username: user.username || '',
          role: user.role || '',
          isActive: user.isActive !== undefined ? user.isActive : true,
          status: user.status,
        });
      } else {
        setError('Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('An error occurred while loading user data');
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      // This could be replaced with an actual API call to get roles from the backend
      // const response = await UserService.getRoles();
      // if (response.success) {
      //   setRoles(response.data || []);
      // }
      
      // For now we'll use hardcoded roles
      setRoles(['admin', 'manager', 'staff', 'user']);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Handle input changes
  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = field === 'isActive' 
      ? (event.target as HTMLInputElement).checked 
      : (event.target as HTMLInputElement).value;
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
    
    // Clear any previous success/error messages
    setSuccess(null);
    setError(null);
  };

  // Handle password input change
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    
    // Clear validation error when field is modified
    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: '',
      }));
    }
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    // Password validation (only for create mode)
    if (!isEditMode && !password) {
      newErrors.password = 'Password is required for new users';
    } else if (!isEditMode && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let response;
      
      if (isEditMode && id) {
        // Update existing user
        response = await UserService.updateUser(id, formData as UpdateUserRequest);
        
        if (response.success) {
          setSuccess('User updated successfully');
        } else {
          setError(response.message || 'Failed to update user');
        }
      } else {
        // Create new user with password
        response = await UserService.createUser({
          ...formData as CreateUserRequest,
          password,
        });
        
        if (response.success) {
          setSuccess('User created successfully');
          
          // Reset form after successful creation
          setFormData({
            email: '',
            firstName: '',
            lastName: '',
            username: '',
            role: 'user',
            isActive: true,
          });
          setPassword('');
        } else {
          setError(response.message || 'Failed to create user');
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation back to user list
  const handleCancel = () => {
    navigate('/users');
  };

  // Show loading indicator during initial data fetch
  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h5">
          {isEditMode ? 'Edit User' : 'Create New User'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username (Optional)"
                  name="username"
                  value={formData.username || ''}
                  onChange={handleChange('username')}
                  error={!!errors.username}
                  helperText={errors.username}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleChange('firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  required
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleChange('lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  required
                  disabled={loading}
                />
              </Grid>

              {!isEditMode && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    required
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  error={!!errors.role}
                  disabled={loading || loadingRoles}
                  required
                >
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    value={formData.role || ''}
                    onChange={handleChange('role')}
                    label="Role"
                  >
                    {loadingRoles ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      roles.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                </FormControl>
              </Grid>

              {isEditMode && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth disabled={loading}>
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                      labelId="status-label"
                      value={formData.status || UserStatus.ACTIVE}
                      onChange={handleChange('status')}
                      label="Status"
                    >
                      <MenuItem value={UserStatus.ACTIVE}>Active</MenuItem>
                      <MenuItem value={UserStatus.INACTIVE}>Inactive</MenuItem>
                      <MenuItem value={UserStatus.PENDING}>Pending</MenuItem>
                      <MenuItem value={UserStatus.SUSPENDED}>Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive === undefined ? true : !!formData.isActive}
                      onChange={handleChange('isActive')}
                      disabled={loading}
                    />
                  }
                  label="Active Account"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {isEditMode ? 'Update User' : 'Create User'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserForm;

