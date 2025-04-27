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
  Chip, // Added Chip import
  Typography, // Added Typography import
  Paper, // Added Paper import
  TableContainer, // Added TableContainer import
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon, // Removed DeleteIcon import
  Add as AddIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import DataTable from '../common/DataTable'; // Assuming this uses material-react-table
import { MRT_ColumnDef, MRT_Cell, MRT_Row } from 'material-react-table'; // Import MRT types
import { categoryService, Category } from '../../services/CategoryService';

const CategoryList = () => {
  const navigate = useNavigate();
  // Removed unused state for dialogs and selected category
  const [categories, setCategories] = useState<Category[]>([]); // Revert to useState
  const [loading, setLoading] = useState(true); // Revert to useState
  const [error, setError] = useState<string | null>(null); // Revert to useState
  // Removed unused state for delete dialog

  useEffect(() => { // Revert to useEffect
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
    // Navigate to detail page instead of opening dialog
    navigate(`/categories/detail/${category._id}`);
  };

  // Removed confirmDelete function as delete functionality is removed from this component

  const columns: MRT_ColumnDef<Category>[] = [ // Use MRT_ColumnDef
    // Removed Image column
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      Cell: ({ cell }: { cell: MRT_Cell<Category, unknown> }) => { // Add explicit type
        const description = cell.getValue<string>();
        return description && description.length > 50
          ? `${description.substring(0, 50)}...`
          : description;
      },
    },
    {
      accessorKey: 'order',
      header: 'Display Order',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      Cell: ({ row }: { row: MRT_Row<Category> }) => { // Add explicit type
        const isActive = row.original.isActive;
        return (
          <Chip
            icon={<CircleIcon sx={{ fontSize: 10 }} />}
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'default'}
            size="small"
            variant="outlined"
            sx={{
              '& .MuiChip-icon': { color: isActive ? 'success.main' : 'action.disabled' },
              borderColor: isActive ? 'success.main' : 'action.disabled',
              color: isActive ? 'success.main' : 'text.secondary',
            }}
          />
        );
      },
    },
    // Removed Created At column
    // Removed Updated At column
    // Removed custom actions column. Actions are handled by DataTable props.
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}> {/* Added alignItems, adjusted mb */}
        <Typography variant="h5" component="h2"> {/* Changed h1 to Typography */}
          Categories
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/categories/add')}
        >
          Add Category
        </Button>
      </Box>

      {error && <Box sx={{ color: 'error.main', mb: 2 }}>Error: {error}</Box>}
      <TableContainer component={Paper}> {/* Added TableContainer with Paper */}
        <DataTable
          columns={columns}
          data={categories}
          onView={handleView} // Pass handleView to the onView prop
          onEdit={handleEdit} // Pass handleEdit to the onEdit prop
          // onDelete is omitted as we removed the delete functionality
          // Loading state is not directly supported by this DataTable wrapper
        />
      </TableContainer>
      {/* Removed Delete and Detail Dialogs */}
    </Box>
  );
};

export default CategoryList;
