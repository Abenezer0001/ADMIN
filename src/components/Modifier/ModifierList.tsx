import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { modifierService, Modifier } from '../../services/ModifierService';

const ModifierList = () => {
  const navigate = useNavigate();
  const [selectedModifier, setSelectedModifier] = useState<Modifier | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modifierToDelete, setModifierToDelete] = useState<Modifier | null>(null);

  useEffect(() => {
    fetchModifiers();
  }, []);

  const fetchModifiers = async () => {
    try {
      setLoading(true);
      const data = await modifierService.getModifiers();
      setModifiers(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching modifiers:', error);
      setError('Failed to fetch modifiers');
      // Fallback to dummy data if API fails
      setModifiers([
        {
          _id: '1',
          name: 'Extra Cheese',
          description: 'Add extra cheese to your dish',
          price: 2.99,
          isAvailable: true,
          createdAt: '2024-02-22T10:00:00Z',
          updatedAt: '2024-02-22T10:00:00Z',
        },
        {
          _id: '2',
          name: 'Spicy Level',
          description: 'Adjust spiciness level',
          price: 0,
          isAvailable: true,
          createdAt: '2024-02-22T10:00:00Z',
          updatedAt: '2024-02-22T10:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (modifier: Modifier) => {
    navigate(`/modifiers/edit/${modifier._id}`);
  };

  const handleView = (modifier: Modifier) => {
    setSelectedModifier(modifier);
    setDetailDialogOpen(true);
  };

  const handleDelete = (modifier: Modifier) => {
    setModifierToDelete(modifier);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!modifierToDelete) return;

    try {
      await modifierService.deleteModifier(modifierToDelete._id);
      setModifiers(modifiers.filter(m => m._id !== modifierToDelete._id));
      setDeleteDialogOpen(false);
      setModifierToDelete(null);
    } catch (error) {
      console.error('Error deleting modifier:', error);
      setError('Failed to delete modifier');
    }
  };

  const columns: ColumnDef<Modifier>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: info => `$${info.getValue<number>().toFixed(2)}`,
    },
    {
      accessorKey: 'isAvailable',
      header: 'Status',
      cell: info => info.getValue<boolean>() ? 'Available' : 'Unavailable',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => handleView(row.original)} size="small">
            <ViewIcon />
          </IconButton>
          <IconButton onClick={() => handleEdit(row.original)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(row.original)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <h1>Modifiers</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/modifiers/add')}
        >
          Add Modifier
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={modifiers}
        loading={loading}
        error={error}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this modifier?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)}>
        <DialogTitle>Modifier Details</DialogTitle>
        <DialogContent>
          {selectedModifier && (
            <Box>
              <p><strong>Name:</strong> {selectedModifier.name}</p>
              <p><strong>Description:</strong> {selectedModifier.description}</p>
              <p><strong>Price:</strong> ${selectedModifier.price.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedModifier.isAvailable ? 'Available' : 'Unavailable'}</p>
              <p><strong>Created:</strong> {new Date(selectedModifier.createdAt).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(selectedModifier.updatedAt).toLocaleString()}</p>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModifierList;