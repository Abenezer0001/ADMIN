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
  Visibility as ViewIcon,
  Add as AddIcon,
  Circle as CircleIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import DataTable from '../common/DataTable'; // Assuming this uses material-react-table
import CSVImportModal from '../common/CSVImportModal';
import { MRT_ColumnDef, MRT_Cell, MRT_Row } from 'material-react-table'; // Import MRT types
import { categoryService, Category } from '../../services/CategoryService';

const CategoryList = () => {
  const navigate = useNavigate();
  // Removed unused state for dialogs and selected category
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => { // Revert to useEffect
    fetchCategories();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Name', 'Description', 'Display Order', 'Is Active'];
    const csvContent = [
      headers.join(','),
      ...categories.map((category: Category) => [
        category.name,
        category.description || '',
        category.order || 0,
        category.isActive ? 'true' : 'false'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (data: any[]) => {
    try {
      const importedCategories = [];
      const errors = [];

      for (const row of data) {
        try {
          const categoryData = {
            name: row.name || '',
            description: row.description || '',
            order: Number(row.display_order || row.order) || 0,
            isActive: row.is_active !== false,
            // Add other required fields based on your Category interface
          };

          // Validate required fields
          if (!categoryData.name) {
            errors.push(`Row missing required field: name`);
            continue;
          }

          const result = await categoryService.createCategory(categoryData);
          importedCategories.push(result);
        } catch (error) {
          console.error('Error importing category row:', error);
          errors.push(`Error importing category "${row.name || 'Unknown'}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Refresh the list
      await fetchCategories();

      return {
        success: importedCategories.length > 0,
        message: `Successfully imported ${importedCategories.length} categories${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: 'Failed to import categories',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  const handleOpenImportModal = () => {
    setImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Categories
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleOpenImportModal}
          >
            Import CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            disabled={categories.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/categories/add')}
          >
            Add Category
          </Button>
        </Box>
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
      
      <CSVImportModal
        open={importModalOpen}
        onClose={handleCloseImportModal}
        title="Categories"
        templateHeaders={['Name', 'Description', 'Display Order', 'Is Active']}
        templateData={[
          { name: 'Example Category', description: 'A sample category description', display_order: 1, is_active: 'true' }
        ]}
        onImport={handleImportCSV}
      />
    </Box>
  );
};

export default CategoryList;
