import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles: Role[];
  directPermissions: Permission[];
}

interface Role {
  _id: string;
  name: string;
  description: string;
}

interface Permission {
  _id: string;
  resource: string;
  action: string;
  description: string;
}

const UserRoleAssignment: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissionId, setSelectedPermissionId] = useState('');
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/roles`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/users/${userId}/permissions`);
      setUserPermissions(response.data);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
  };

  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleId('');
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
  };

  const handleOpenPermissionDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedPermissionId('');
    fetchUserPermissions(user._id);
    setOpenPermissionDialog(true);
  };

  const handleClosePermissionDialog = () => {
    setOpenPermissionDialog(false);
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setSelectedRoleId(event.target.value);
  };

  const handlePermissionChange = (event: SelectChangeEvent<string>) => {
    setSelectedPermissionId(event.target.value);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) return;

    try {
      await axios.post(`${API_BASE_URL}/auth/users/${selectedUser._id}/roles`, {
        roleId: selectedRoleId
      });
      fetchUsers();
      handleCloseRoleDialog();
    } catch (error) {
      console.error('Error assigning role:', error);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/users/${userId}/roles/${roleId}`);
      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  const handleAssignPermission = async () => {
    if (!selectedUser || !selectedPermissionId) return;

    try {
      await axios.post(`${API_BASE_URL}/auth/users/${selectedUser._id}/permissions`, {
        permissionId: selectedPermissionId
      });
      fetchUserPermissions(selectedUser._id);
    } catch (error) {
      console.error('Error assigning permission:', error);
    }
  };

  const handleRemovePermission = async (userId: string, permissionId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/users/${userId}/permissions/${permissionId}`);
      if (selectedUser && selectedUser._id === userId) {
        fetchUserPermissions(userId);
      }
    } catch (error) {
      console.error('Error removing permission:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Role Assignment
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>System Role</TableCell>
              <TableCell>RBAC Roles</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user._id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {user.roles?.map(role => (
                      <Chip
                        key={role._id}
                        label={role.name}
                        onDelete={() => handleRemoveRole(user._id, role._id)}
                        size="small"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => handleOpenRoleDialog(user)}
                  >
                    Assign Role
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleOpenPermissionDialog(user)}
                  >
                    Manage Permissions
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Assignment Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog}>
        <DialogTitle>
          Assign Role to {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRoleId}
              onChange={handleRoleChange}
              label="Role"
            >
              {roles.map(role => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name} - {role.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Cancel</Button>
          <Button
            onClick={handleAssignRole}
            variant="contained"
            disabled={!selectedRoleId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permission Management Dialog */}
      <Dialog
        open={openPermissionDialog}
        onClose={handleClosePermissionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Permissions for {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Permissions
            </Typography>
            <Grid container spacing={1}>
              {userPermissions.map(permission => (
                <Grid item key={permission._id}>
                  <Chip
                    label={`${permission.resource}:${permission.action}`}
                    onDelete={() => selectedUser && handleRemovePermission(selectedUser._id, permission._id)}
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Add Permission</InputLabel>
              <Select
                value={selectedPermissionId}
                onChange={handlePermissionChange}
                label="Add Permission"
              >
                {permissions.map(permission => (
                  <MenuItem key={permission._id} value={permission._id}>
                    {permission.resource}:{permission.action} - {permission.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAssignPermission}
              disabled={!selectedPermissionId}
            >
              Add
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRoleAssignment; 