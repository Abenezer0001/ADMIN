import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import KeyIcon from '@mui/icons-material/Key';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import RbacService, { Role, Permission, ResourceActions } from '../services/RbacService';
import UserManagementService from '../services/UserManagementService';

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
      id={`rbac-tabpanel-${index}`}
      aria-labelledby={`rbac-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function RbacDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [resourceActions, setResourceActions] = useState<ResourceActions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isCreatePermissionOpen, setIsCreatePermissionOpen] = useState(false);
  const [isUserAssignmentOpen, setIsUserAssignmentOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });
  const [newPermission, setNewPermission] = useState({ resource: '', action: '', description: '' });
  const [permissionMatrix, setPermissionMatrix] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [rolesData, permissionsData, resourceActionsData, usersData] = await Promise.all([
        RbacService.getRoles(),
        RbacService.getPermissions(),
        RbacService.getResourceActions(),
        UserManagementService.getUsers().catch(() => []) // Fallback if users endpoint fails
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);
      setResourceActions(resourceActionsData);
      setUsers(usersData);

    } catch (err: any) {
      console.error('Error loading RBAC data:', err);
      setError(err.message || 'Failed to load RBAC data');
      toast.error(err.message || 'Failed to load RBAC data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Role Management
  const handleCreateRole = async () => {
    try {
      if (!newRole.name.trim()) {
        toast.error('Role name is required');
        return;
      }

      await RbacService.createRole({
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions
      });

      toast.success('Role created successfully');
      setIsCreateRoleOpen(false);
      setNewRole({ name: '', description: '', permissions: [] });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;

    try {
      await RbacService.deleteRole(roleId);
      toast.success('Role deleted successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    }
  };

  // Permission Management
  const handleCreatePermission = async () => {
    try {
      if (!newPermission.resource.trim() || !newPermission.action.trim()) {
        toast.error('Resource and action are required');
        return;
      }

      await RbacService.createPermission({
        resource: newPermission.resource,
        action: newPermission.action,
        description: newPermission.description
      });

      toast.success('Permission created successfully');
      setIsCreatePermissionOpen(false);
      setNewPermission({ resource: '', action: '', description: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create permission');
    }
  };

  const handleCreatePermissionsFromMatrix = async () => {
    try {
      const permissionsToCreate = Object.entries(permissionMatrix)
        .filter(([key, selected]) => selected)
        .map(([key]) => {
          const [resource, action] = key.split(':');
          return {
            resource,
            action,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} access to ${resource}`
          };
        });

      if (permissionsToCreate.length === 0) {
        toast.error('Please select at least one permission to create');
        return;
      }

      const result = await RbacService.createMultiplePermissions(permissionsToCreate);
      toast.success(`${result.created} permissions created successfully${result.skipped > 0 ? `, ${result.skipped} skipped` : ''}`);
      setPermissionMatrix({});
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create permissions');
    }
  };

  const handlePermissionMatrixChange = (resource: string, action: string, checked: boolean) => {
    const key = `${resource}:${action}`;
    setPermissionMatrix(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  // User Role Assignment
  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      await RbacService.assignRoleToUser(userId, roleId);
      toast.success('Role assigned successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      await RbacService.removeRoleFromUser(userId, roleId);
      toast.success('Role removed successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove role');
    }
  };

  // Role Permission Assignment
  const handleRolePermissionChange = async (roleId: string, permissionId: string, assign: boolean) => {
    try {
      if (assign) {
        await RbacService.assignPermissionToRole(roleId, permissionId);
        toast.success('Permission assigned to role');
      } else {
        await RbacService.removePermissionFromRole(roleId, permissionId);
        toast.success('Permission removed from role');
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role permission');
    }
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <IconButton onClick={() => loadData()} sx={{ ml: 2 }}>
          <RefreshIcon />
        </IconButton>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Access Control Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage roles, permissions, and user access across the system
          </Typography>
        </Box>
        <IconButton onClick={() => loadData()} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <SecurityIcon color="primary" />
                <Box>
                  <Typography variant="h4">{roles.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Roles</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <KeyIcon color="success" />
                <Box>
                  <Typography variant="h4">{permissions.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Permissions</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <GroupIcon color="info" />
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Users</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <SecurityIcon color="warning" />
                <Box>
                  <Typography variant="h4">{Object.keys(resourceActions).length}</Typography>
                  <Typography variant="body2" color="text.secondary">Protected Resources</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Permissions" />
          <Tab label="Roles" />
          <Tab label="User Assignments" />
          <Tab label="Permission Matrix" />
        </Tabs>

        {/* Tab 1: Permission Management */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Permission Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreatePermissionOpen(true)}
            >
              Create Permission
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Resource</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission._id}>
                    <TableCell>{permission.resource}</TableCell>
                    <TableCell>
                      <Chip label={permission.action} size="small" />
                    </TableCell>
                    <TableCell>{permission.description || 'No description'}</TableCell>
                    <TableCell>{new Date(permission.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 2: Role Management */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Role Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateRoleOpen(true)}
            >
              Create Role
            </Button>
          </Box>

          {roles.map((role) => (
            <Accordion key={role._id} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <SecurityIcon />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{role.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${role.permissions.length} permissions`} 
                    size="small" 
                    color="primary" 
                  />
                  <Chip 
                    label={role.scope} 
                    size="small" 
                    color={role.scope === 'system' ? 'error' : 'info'} 
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" gutterBottom>
                      Assigned Permissions
                    </Typography>
                    <FormGroup>
                      {permissions.map((permission) => {
                        const isAssigned = role.permissions.some(p => p._id === permission._id);
                        return (
                          <FormControlLabel
                            key={permission._id}
                            control={
                              <Checkbox
                                checked={isAssigned}
                                onChange={(e) => handleRolePermissionChange(
                                  role._id, 
                                  permission._id, 
                                  e.target.checked
                                )}
                              />
                            }
                            label={`${permission.resource}:${permission.action}`}
                          />
                        );
                      })}
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" gutterBottom>
                      Role Details
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Created:</strong> {new Date(role.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>System Role:</strong> {role.isSystemRole ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Scope:</strong> {role.scope}
                      </Typography>
                    </Stack>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteRole(role._id)}
                        disabled={role.isSystemRole}
                      >
                        Delete Role
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>

        {/* Tab 3: User Assignments */}
        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" gutterBottom>
            User Role Assignments
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Current Roles</TableCell>
                  <TableCell>Business</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {(user.roles || []).map((role: any) => (
                          <Chip
                            key={role._id}
                            label={role.name}
                            size="small"
                            onDelete={() => handleRemoveRole(user._id, role._id)}
                          />
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {user.businessId?.name || 'No Business'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsUserAssignmentOpen(true);
                        }}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab 4: Permission Matrix */}
        <TabPanel value={currentTab} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Permission Matrix</Typography>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCreatePermissionsFromMatrix}
              disabled={Object.values(permissionMatrix).every(v => !v)}
            >
              Create Selected Permissions
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the permissions you want to create for each resource. This will generate the necessary permissions for your system.
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Resource</TableCell>
                  <TableCell>Create</TableCell>
                  <TableCell>Read</TableCell>
                  <TableCell>Update</TableCell>
                  <TableCell>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(resourceActions).map(([resource, actions]) => (
                  <TableRow key={resource}>
                    <TableCell>
                      <Typography variant="subtitle2">{resource}</Typography>
                    </TableCell>
                    {['create', 'read', 'update', 'delete'].map((action) => (
                      <TableCell key={action}>
                        {actions.includes(action) ? (
                          <Checkbox
                            checked={permissionMatrix[`${resource}:${action}`] || false}
                            onChange={(e) => handlePermissionMatrixChange(resource, action, e.target.checked)}
                            disabled={permissions.some(p => p.resource === resource && p.action === action)}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">N/A</Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleOpen} onClose={() => setIsCreateRoleOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Role Name"
              value={newRole.name}
              onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newRole.description}
              onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
            <Typography variant="h6">Assign Permissions</Typography>
            <FormGroup>
              {permissions.map((permission) => (
                <FormControlLabel
                  key={permission._id}
                  control={
                    <Checkbox
                      checked={newRole.permissions.includes(permission._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRole(prev => ({
                            ...prev,
                            permissions: [...prev.permissions, permission._id]
                          }));
                        } else {
                          setNewRole(prev => ({
                            ...prev,
                            permissions: prev.permissions.filter(id => id !== permission._id)
                          }));
                        }
                      }}
                    />
                  }
                  label={`${permission.resource}:${permission.action}`}
                />
              ))}
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRole} variant="contained">Create Role</Button>
        </DialogActions>
      </Dialog>

      {/* Create Permission Dialog */}
      <Dialog open={isCreatePermissionOpen} onClose={() => setIsCreatePermissionOpen(false)}>
        <DialogTitle>Create New Permission</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Resource</InputLabel>
              <Select
                value={newPermission.resource}
                label="Resource"
                onChange={(e) => setNewPermission(prev => ({ ...prev, resource: e.target.value }))}
              >
                {Object.keys(resourceActions).map((resource) => (
                  <MenuItem key={resource} value={resource}>{resource}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={newPermission.action}
                label="Action"
                onChange={(e) => setNewPermission(prev => ({ ...prev, action: e.target.value }))}
                disabled={!newPermission.resource}
              >
                {newPermission.resource && resourceActions[newPermission.resource]?.map((action) => (
                  <MenuItem key={action} value={action}>{action}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={newPermission.description}
              onChange={(e) => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreatePermissionOpen(false)}>Cancel</Button>
          <Button onClick={handleCreatePermission} variant="contained">Create Permission</Button>
        </DialogActions>
      </Dialog>

      {/* User Role Assignment Dialog */}
      <Dialog open={isUserAssignmentOpen} onClose={() => setIsUserAssignmentOpen(false)}>
        <DialogTitle>
          Assign Role to {selectedUser?.firstName} {selectedUser?.lastName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {roles.map((role) => {
              const isAssigned = selectedUser?.roles?.some((userRole: any) => userRole._id === role._id);
              return (
                <FormControlLabel
                  key={role._id}
                  control={
                    <Checkbox
                      checked={isAssigned}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAssignRole(selectedUser._id, role._id);
                        } else {
                          handleRemoveRole(selectedUser._id, role._id);
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle2">{role.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                    </Box>
                  }
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsUserAssignmentOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RbacDashboard; 