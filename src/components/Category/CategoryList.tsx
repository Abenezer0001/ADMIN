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
import { categoryService, Category } from '../../services/CategoryService';

const CategoryList = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
      // Fallback to dummy data if API fails
      setCategories([
        {
          _id: '1',
          name: 'Main Course',
          description: 'Main dishes and entrees',
          isActive: true,
          order: 1,
          createdAt: '2024-02-22T10:00:00Z',
          updatedAt: '2024-02-22T10:00:00Z',
        },
        {
          _id: '2',
          name: 'Appetizers',
          description: 'Starters and small plates',
          isActive: true,
          order: 0,
          createdAt: '2024-02-22T10:00:00Z',
          updatedAt: '2024-02-22T10:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    navigate(`/categories/edit/${category._id}`);
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setDetailDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.deleteCategory(categoryToDelete._id);
      setCategories(categories.filter(c => c._id !== categoryToDelete._id));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'order',
      header: 'Display Order',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: info => info.getValue<boolean>() ? 'Active' : 'Inactive',
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
        <h1>Categories</h1>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/categories/add')}
        >
          Add Category
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        error={error}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)}>
        <DialogTitle>Category Details</DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Box>
              <p><strong>Name:</strong> {selectedCategory.name}</p>
              <p><strong>Description:</strong> {selectedCategory.description}</p>
              <p><strong>Display Order:</strong> {selectedCategory.order}</p>
              <p><strong>Status:</strong> {selectedCategory.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Created:</strong> {new Date(selectedCategory.createdAt).toLocaleString()}</p>
              <p><strong>Updated:</strong> {new Date(selectedCategory.updatedAt).toLocaleString()}</p>
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

export default CategoryList;
