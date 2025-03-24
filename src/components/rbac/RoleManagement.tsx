import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Grid
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';

interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  _id: string;
  resource: string;
  action: string;
  description: string;
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openPermissionDialog, setOpenPermissionDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

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

  const handleOpenRoleDialog = (role?: Role) => {
    if (role) {
      setSelectedRole(role);
      setRoleFormData({
        name: role.name,
        description: role.description || ''
      });
    } else {
      setSelectedRole(null);
      setRoleFormData({
        name: '',
        description: ''
      });
    }
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
  };

  const handleOpenPermissionDialog = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.map(p => p._id));
    setOpenPermissionDialog(true);
  };

  const handleClosePermissionDialog = () => {
    setOpenPermissionDialog(false);
  };

  const handleRoleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRoleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSubmitRole = async () => {
    try {
      if (selectedRole) {
        // Update existing role
        await axios.patch(`${API_BASE_URL}/auth/roles/${selectedRole._id}`, roleFormData);
      } else {
        // Create new role
        await axios.post(`${API_BASE_URL}/auth/roles`, roleFormData);
      }
      fetchRoles();
      handleCloseRoleDialog();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleSubmitPermissions = async () => {
    try {
      if (selectedRole) {
        await axios.post(`${API_BASE_URL}/auth/roles/${selectedRole._id}/permissions`, {
          permissions: selectedPermissions
        });
        fetchRoles();
        handleClosePermissionDialog();
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/roles/${roleId}`);
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleRemovePermission = async (roleId: string, permissionId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/roles/${roleId}/permissions/${permissionId}`);
      fetchRoles();
    } catch (error) {
      console.error('Error removing permission:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Role Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenRoleDialog()}
        >
          Add Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role._id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {role.permissions.map(permission => (
                      <Chip
                        key={permission._id}
                        label={`${permission.resource}:${permission.action}`}
                        onDelete={() => handleRemovePermission(role._id, permission._id)}
                        size="small"
                      />
                    ))}
                    <IconButton
                      size="small"
                      onClick={() => handleOpenPermissionDialog(role)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenRoleDialog(role)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteRole(role._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Dialog */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog}>
        <DialogTitle>{selectedRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Role Name"
            type="text"
            fullWidth
            value={roleFormData.name}
            onChange={handleRoleFormChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={roleFormData.description}
            onChange={handleRoleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Cancel</Button>
          <Button onClick={handleSubmitRole} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog
        open={openPermissionDialog}
        onClose={handleClosePermissionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Permissions for {selectedRole?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {permissions.map(permission => (
              <Grid item xs={6} key={permission._id}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: selectedPermissions.includes(permission._id)
                      ? 'primary.light'
                      : 'background.paper'
                  }}
                >
                  <CardContent
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handlePermissionChange(permission._id)}
                  >
                    <Typography variant="subtitle1">
                      {permission.resource}:{permission.action}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {permission.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePermissionDialog}>Cancel</Button>
          <Button onClick={handleSubmitPermissions} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement; 