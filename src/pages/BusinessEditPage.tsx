import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  ListItemText,
  OutlinedInput,
  Alert,
  Skeleton,
  Fab
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  ArrowBack,
  Person,
  Security,
  Business
} from '@mui/icons-material';
import { businessApi, roleApi, userApi } from '../services/api';

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
      id={`business-tabpanel-${index}`}
      aria-labelledby={`business-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BusinessEditPage: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  
  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editingRole, setEditingRole] = useState<any>(null);
  
  // Form states
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roleIds: []
  });
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (businessId) {
      loadBusinessData();
    }
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const [businessRes, usersRes, rolesRes, permissionsRes] = await Promise.all([
        businessApi.getBusinessById(businessId!),
        businessApi.getBusinessUsers(),
        roleApi.getAllRoles(),
        roleApi.getAllPermissions()
      ]);

      setBusiness(businessRes.data);
      setUsers(usersRes.data.users || []);
      setRoles(rolesRes.data.filter((role: any) => 
        role.businessId === businessId || role.isSystemRole
      ));
      setPermissions(permissionsRes.data.permissions || []);
    } catch (error: any) {
      setError('Failed to load business data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateUser = async () => {
    try {
      if (!userForm.email || !userForm.firstName || !userForm.lastName) {
        setError('Please fill in all required fields');
        return;
      }

      if (userForm.roleIds.length === 0) {
        setError('Please assign at least one role to the user');
        return;
      }

      await businessApi.createBusinessUser({
        email: userForm.email,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        roleIds: userForm.roleIds
      });

      setSuccess('User created successfully');
      setUserDialogOpen(false);
      setUserForm({ email: '', firstName: '', lastName: '', roleIds: [] });
      loadBusinessData(); // Reload to show new user
    } catch (error: any) {
      setError('Failed to create user: ' + error.message);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!roleForm.name) {
        setError('Please enter a role name');
        return;
      }

      const roleData = {
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions
      };

      if (editingRole) {
        await roleApi.updateRole(editingRole._id, roleData);
        setSuccess('Role updated successfully');
      } else {
        await roleApi.createRole(roleData);
        setSuccess('Role created successfully');
      }

      setRoleDialogOpen(false);
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissions: [] });
      loadBusinessData(); // Reload to show new role
    } catch (error: any) {
      setError('Failed to save role: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.deleteUser(userId);
        setSuccess('User deleted successfully');
        loadBusinessData();
      } catch (error: any) {
        setError('Failed to delete user: ' + error.message);
      }
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleApi.deleteRole(roleId);
        setSuccess('Role deleted successfully');
        loadBusinessData();
      } catch (error: any) {
        setError('Failed to delete role: ' + error.message);
      }
    }
  };

  const openUserDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleIds: user.roles?.map((role: any) => role._id) || []
      });
    } else {
      setEditingUser(null);
      setUserForm({ email: '', firstName: '', lastName: '', roleIds: [] });
    }
    setUserDialogOpen(true);
  };

  const openRoleDialog = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions?.map((perm: any) => perm._id) || []
      });
    } else {
      setEditingRole(null);
      setRoleForm({ name: '', description: '', permissions: [] });
    }
    setRoleDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  if (!business) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Business not found</Alert>
      </Box>
    );
  }

  const businessRoles = roles.filter(role => 
    role.businessId === businessId && !role.isSystemRole
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/businesses')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Business sx={{ mr: 2 }} />
        <Typography variant="h4" component="h1">
          {business.name}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Business Details" />
            <Tab label="Users" />
            <Tab label="Roles & Permissions" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>Business Information</Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
              <TextField
                label="Business Name"
                value={business.name}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Legal Name"
                value={business.legalName}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Registration Number"
                value={business.registrationNumber}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Email"
                value={business.contactInfo?.email}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Phone"
                value={business.contactInfo?.phone}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Address"
                value={business.contactInfo?.address}
                InputProps={{ readOnly: true }}
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Business Users ({users.length})</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openUserDialog()}
              disabled={businessRoles.length === 0}
            >
              Add User
            </Button>
          </Box>

          {businessRoles.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You need to create roles before adding users. Switch to the "Roles & Permissions" tab to create roles.
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.roles?.map((role: any) => (
                        <Chip
                          key={role._id}
                          label={role.name}
                          size="small"
                          sx={{ mr: 0.5 }}
                        />
                      )) || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => openUserDialog(user)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUser(user._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Business Roles ({businessRoles.length})</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openRoleDialog()}
            >
              Create Role
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Role Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {businessRoles.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      {role.permissions?.length || 0} permissions
                    </TableCell>
                    <TableCell>
                      {new Date(role.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => openRoleDialog(role)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRole(role._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {businessRoles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No roles found. Create your first role to start managing user permissions.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* User Creation/Edit Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
              disabled={!!editingUser}
            />
            <TextField
              label="First Name"
              value={userForm.firstName}
              onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
              required
            />
            <TextField
              label="Last Name"
              value={userForm.lastName}
              onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
              required
            />
            <FormControl>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={userForm.roleIds}
                onChange={(e) => setUserForm({ ...userForm, roleIds: e.target.value as string[] })}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) =>
                  selected.map((id) => 
                    businessRoles.find(role => role._id === id)?.name
                  ).join(', ')
                }
              >
                {businessRoles.map((role) => (
                  <MenuItem key={role._id} value={role._id}>
                    <Checkbox checked={userForm.roleIds.includes(role._id)} />
                    <ListItemText primary={role.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Creation/Edit Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="Role Name"
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              required
            />
            <TextField
              label="Description"
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              multiline
              rows={2}
            />
            <FormControl>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={roleForm.permissions}
                onChange={(e) => setRoleForm({ ...roleForm, permissions: e.target.value as string[] })}
                input={<OutlinedInput label="Permissions" />}
                renderValue={(selected) =>
                  `${selected.length} permission(s) selected`
                }
              >
                {permissions.map((permission) => (
                  <MenuItem key={permission._id} value={permission._id}>
                    <Checkbox checked={roleForm.permissions.includes(permission._id)} />
                    <ListItemText 
                      primary={`${permission.action} ${permission.resource}`}
                      secondary={permission.description}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRole} variant="contained">
            {editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessEditPage; 