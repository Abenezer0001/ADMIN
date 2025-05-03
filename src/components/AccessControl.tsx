import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminManagement: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admins`);
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to fetch admins');
      // Fallback to dummy data if API fails
      setAdmins([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          isActive: true,
          createdAt: '2024-02-22T10:00:00Z',
          updatedAt: '2024-02-22T10:00:00Z',
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          role: 'admin',
          isActive: true,
          createdAt: '2024-02-22T10:00:00Z',
          updatedAt: '2024-02-22T10:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Admin>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Role',
      accessorKey: 'role',
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => (row.original.isActive ? 'Active' : 'Inactive'),
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleView(row.original)}
            color="primary"
          >
            <ViewIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEdit(row.original.id)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row.original.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleView = (admin: Admin) => {
    setSelectedAdmin(admin);
    setDetailDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    navigate(`/admins/${id}`);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete admin:', id);
  };

  const handleAddNew = () => {
    navigate('/admins/add');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{ mt: 2, mb: 0 }}
        >
          Add New Admin
        </Button>
      </Box>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={admins}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {/* <DialogContent>
          {selectedAdmin && (
            <AdminDetail admin={selectedAdmin} />
          )}
        </DialogContent> */}
      </Dialog>
    </Box>
  );
};

export default AdminManagement;
