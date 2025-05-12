
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Snackbar,
  Alert
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
  GridValueGetterParams,
  GridSortModel
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as RolesIcon,
  RefreshOutlined as ResetPasswordIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import UserService from '../../services/UserService';
import { User, UserStatus, UserListParams } from '../../types/user';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: 'createdAt',
      sort: 'desc'
    }
  ]);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  
  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch users data
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: UserListParams = {
        page: page + 1, // DataGrid uses 0-based indexing, API uses 1-based
        limit: pageSize,
        search: searchTerm,
        sortBy: sortModel.length > 0 ? sortModel[0].field : 'createdAt',
        sortOrder: sortModel.length > 0 ? sortModel[0].sort : 'desc'
      };
      
      if (statusFilter) {
        params.status = statusFilter as UserStatus;
      }
      
      if (roleFilter) {
        params.role = roleFilter;
      }
      
      const response = await UserService.getUsers(params);
      setUsers(response.users);
      setTotalUsers(response.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Failed to fetch users. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, statusFilter, roleFilter, sortModel]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Show snackbar notification
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle dialog open/close
  const handleDeleteDialogOpen = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setDeleteDialogOpen(true);
  };

  const handleResetPasswordDialogOpen = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setResetPasswordDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDeleteDialogOpen(false);
    setResetPasswordDialogOpen(false);
    setSelectedUserId(null);
    setSelectedUserName('');
  };

  // Handle user actions
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    
    try {
      const response = await UserService.deleteUser(selectedUserId);
      
      if (response.success) {
        showSnackbar('User deleted successfully', 'success');
        fetchUsers(); // Refresh the list
      } else {
        showSnackbar(response.message || 'Failed to delete user', 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('An error occurred while deleting the user', 'error');
    } finally {
      handleDialogClose();
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUserId) return;
    
    try {
      const response = await UserService.resetUserPassword(selectedUserId);
      
      if (response.success) {
        showSnackbar('Password reset email sent successfully', 'success');
      } else {
        showSnackbar(response.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      showSnackbar('An error occurred while resetting the password', 'error');
    } finally {
      handleDialogClose();
    }
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
    setPage(0); // Reset to first page when filter changes
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when search changes
  };

  // Status chip renderer
  const renderStatusChip = (params: GridRenderCellParams) => {
    const status = params.value as UserStatus || UserStatus.ACTIVE;
    
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
      case UserStatus.DELETED:
        color = 'default';
        break;
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        variant="outlined" 
      />
    );
  };
  
  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    { field: '_id', headerName: 'ID', width: 90, hide: true },
    { field: 'email', headerName: 'Email', width: 200, flex: 1 },
    { field: 'firstName', headerName: 'First Name', width: 150 },
    { field: 'lastName', headerName: 'Last Name', width: 150 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'N/A'} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: renderStatusChip
    },
    { 
      field: 'lastLogin', 
      headerName: 'Last Login', 
      width: 180,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value ? new Date(params.value).toLocaleString() : 'Never';
      }
    },
    { 
      field: 'createdAt', 
      headerName: 'Created', 
      width: 180,
      valueGetter: (params: GridValueGetterParams) => {
        return params.value ? new Date(params.value).toLocaleString() : 'N/A';
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const userId = params.row._id;
        const userName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim() || params.row.email;
        
        return (
          <Box>
            <Tooltip title="Edit">
              <IconButton 
                size="small" 
                onClick={() => navigate(`/users/edit/${userId}`)}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Manage Roles">
              <IconButton 
                size="small" 
                onClick={() => navigate(`/users/roles/${userId}`)}
                color="secondary"
              >
                <RolesIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Reset Password">
              <IconButton 
                size="small" 
                onClick={() => handleResetPasswordDialogOpen(userId, userName)}
                color="primary"
              >
                <ResetPasswordIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                onClick={() => handleDeleteDialogOpen(userId, userName)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    }
  ];

  return (
    <Paper sx={{ p: 3, height: 'calc(100vh - 150px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/users/new"
        >
          New User
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
        <TextField
          label="Search Users"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value={UserStatus.ACTIVE}>Active</MenuItem>
            <MenuItem value={UserStatus.INACTIVE}>Inactive</MenuItem>
            <MenuItem value={UserStatus.PENDING}>Pending</MenuItem>
            <MenuItem value={UserStatus.SUSPENDED}>Suspended</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            value={roleFilter}
            label="Role"
            onChange={handleRoleFilterChange}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row._id}
        rowCount={totalUsers}
        pageSizeOptions={[5, 10, 25, 50]}
        paginationMode="server"
        filterMode="server"
        sortingMode="server"
        loading={loading}
        keepNonExistentRowsSelected
        disableRowSelectionOnClick
        autoHeight
        page={page}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        onSortModelChange={(newSortModel) => setSortModel(newSortModel)}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          }
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user <strong>{selectedUserName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reset Password Confirmation Dialog */}
      <Dialog
        open={resetPasswordDialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset the password for <strong>{selectedUserName}</strong>? 
            A password reset email will be sent to the user.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleResetPassword} color="primary" variant="contained">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar Notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default UserList;
