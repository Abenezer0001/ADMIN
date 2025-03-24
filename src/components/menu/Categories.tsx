import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import DataTable from '../common/DataTable';
import CategoryDetail from './CategoryDetail';
import { ColumnDef } from '@tanstack/react-table';

interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  // Dummy data
  const categories: Category[] = [
    {
      id: '1',
      name: 'Beverages',
      description: 'A category for beverages',
      isActive: true,
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2024-02-22T10:00:00Z',
    },
    {
      id: '2',
      name: 'Food',
      description: 'A category for food',
      isActive: true,
      createdAt: '2024-02-22T10:00:00Z',
      updatedAt: '2024-02-22T10:00:00Z',
    },
  ];
  const columns: ColumnDef<Category>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Description',
      accessorKey: 'description',
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => (row.original.isActive ? 'Active' : 'Inactive'),
    },
  ];
  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setDetailDialogOpen(true);
  };
  const handleEdit = (id: string) => {
    navigate(`/categories/${id}`);
  };
  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete category:', id);
  };
  const handleAddNew = () => {
    navigate('/categories/add');
  };
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add New Category
        </Button>
      </Box>
      <DataTable
        columns={columns}
        data={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedCategory && (
            <CategoryDetail category={selectedCategory} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CategoryList;
