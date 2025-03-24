import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';

interface Permission {
  _id: string;
  resource: string;
  action: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Common resources and actions for permissions
const commonResources = [
  'users',
  'roles',
  'permissions',
  'restaurants',
  'menus',
  'menu-items',
  'orders',
  'tables',
  'payments'
];

const commonActions = [
  'create',
  'read',
  'update',
  'delete',
  'list',
  'manage',
  'approve',
  'reject',
  'assign'
];

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState({
    resource: '',
    action: '',
    description: ''
  });
  const [batchMode, setBatchMode] = useState(false);
  const [batchResources, setBatchResources] = useState<string[]>([]);
  const [batchActions, setBatchActions] = useState<string[]>([]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleOpenDialog = (permission?: Permission) => {
    if (permission) {
      setSelectedPermission(permission);
      setFormData({
        resource: permission.resource,
        action: permission.action,
        description: permission.description || ''
      });
      setBatchMode(false);
    } else {
      setSelectedPermission(null);
      setFormData({
        resource: '',
        action: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setBatchMode(false);
    setBatchResources([]);
    setBatchActions([]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBatchResourceChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[];
    setBatchResources(value);
  };

  const handleBatchActionChange = (e: SelectChangeEvent<string[]>) => {
    const value = e.target.value as string[];
    setBatchActions(value);
  };

  const handleToggleBatchMode = () => {
    setBatchMode(!batchMode);
  };

  const handleSubmit = async () => {
    try {
      if (batchMode) {
        // Create multiple permissions
        const permissionsToCreate = [];
        for (const resource of batchResources) {
          for (const action of batchActions) {
            permissionsToCreate.push({
              resource,
              action,
              description: `Permission to ${action} ${resource}`
            });
          }
        }
        
        await axios.post(`${API_BASE_URL}/auth/permissions/batch`, {
          permissions: permissionsToCreate
        });
      } else if (selectedPermission) {
        // Update existing permission
        await axios.patch(`${API_BASE_URL}/auth/permissions/${selectedPermission._id}`, formData);
      } else {
        // Create new permission
        await axios.post(`${API_BASE_URL}/auth/permissions`, formData);
      }
      fetchPermissions();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/auth/permissions/${id}`);
      fetchPermissions();
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Permission Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Permission
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Resource</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map(permission => (
              <TableRow key={permission._id}>
                <TableCell>{permission.resource}</TableCell>
                <TableCell>{permission.action}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(permission)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(permission._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPermission ? 'Edit Permission' : batchMode ? 'Batch Create Permissions' : 'Add Permission'}
        </DialogTitle>
        <DialogContent>
          {!selectedPermission && (
            <Box sx={{ mb: 2 }}>
              <Button onClick={handleToggleBatchMode}>
                {batchMode ? 'Switch to Single Mode' : 'Switch to Batch Mode'}
              </Button>
            </Box>
          )}

          {batchMode ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Resources</InputLabel>
                <Select
                  multiple
                  value={batchResources}
                  onChange={handleBatchResourceChange}
                  label="Resources"
                >
                  {commonResources.map(resource => (
                    <MenuItem key={resource} value={resource}>
                      {resource}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Actions</InputLabel>
                <Select
                  multiple
                  value={batchActions}
                  onChange={handleBatchActionChange}
                  label="Actions"
                >
                  {commonActions.map(action => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary">
                This will create {batchResources.length * batchActions.length} permissions
                (one for each resource-action combination).
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Resource</InputLabel>
                <Select
                  name="resource"
                  value={formData.resource}
                  onChange={handleSelectChange}
                  label="Resource"
                >
                  {commonResources.map(resource => (
                    <MenuItem key={resource} value={resource}>
                      {resource}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">
                    <em>Custom (type below)</em>
                  </MenuItem>
                </Select>
              </FormControl>

              {formData.resource === 'custom' && (
                <TextField
                  name="resource"
                  label="Custom Resource"
                  value={formData.resource === 'custom' ? '' : formData.resource}
                  onChange={handleFormChange}
                  fullWidth
                />
              )}

              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  name="action"
                  value={formData.action}
                  onChange={handleSelectChange}
                  label="Action"
                >
                  {commonActions.map(action => (
                    <MenuItem key={action} value={action}>
                      {action}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">
                    <em>Custom (type below)</em>
                  </MenuItem>
                </Select>
              </FormControl>

              {formData.action === 'custom' && (
                <TextField
                  name="action"
                  label="Custom Action"
                  value={formData.action === 'custom' ? '' : formData.action}
                  onChange={handleFormChange}
                  fullWidth
                />
              )}

              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={2}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PermissionManagement; 