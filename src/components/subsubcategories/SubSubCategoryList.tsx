import React, { useState, useEffect } from 'react'; // Combined import
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Chip,
  Typography,
  Paper,
  TableContainer,
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import DataTable from '../common/DataTable'; // Assuming this uses material-react-table
import { MRT_ColumnDef, MRT_Cell, MRT_Row } from 'material-react-table'; // Import MRT types
import { subSubCategoryService, SubSubCategory } from '../../services/SubSubCategoryService'; // Updated service and type

const SubSubCategoryList = () => {
  const navigate = useNavigate();
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]); // Updated state name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubSubCategories();
  }, []);

  const fetchSubSubCategories = async () => {
    try {
      setLoading(true);
      const data = await subSubCategoryService.getSubSubCategories(); // Updated service call
      setSubSubCategories(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching sub-subcategories:', error);
      setError('Failed to fetch sub-subcategories');
      // Optional: Add fallback dummy data if needed
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subSubCategory: SubSubCategory) => {
    navigate(`/subsubcategories/edit/${subSubCategory._id}`); // Updated path
  };

  const handleView = (subSubCategory: SubSubCategory) => {
    navigate(`/subsubcategories/detail/${subSubCategory._id}`); // Updated path
  };

  const columns: MRT_ColumnDef<SubSubCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      Cell: ({ cell }: { cell: MRT_Cell<SubSubCategory, unknown> }) => {
        const description = cell.getValue<string>();
        return description && description.length > 50
          ? `${description.substring(0, 50)}...`
          : description;
      },
    },
    {
      accessorKey: 'subCategory.name', // Access nested property for parent name
      header: 'Parent SubCategory',
      Cell: ({ row }: { row: MRT_Row<SubSubCategory> }) => {
        // Handle cases where subCategory might be just an ID or populated
        const subCategory = row.original.subCategory;
        return typeof subCategory === 'object' && subCategory?.name ? subCategory.name : 'N/A';
      },
    },
    {
      accessorKey: 'order',
      header: 'Display Order',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      Cell: ({ row }: { row: MRT_Row<SubSubCategory> }) => {
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
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Sub-Subcategories {/* Updated title */}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/subsubcategories/add')} // Updated path
        >
          Add Sub-Subcategory {/* Updated button text */}
        </Button>
      </Box>

      {error && <Box sx={{ color: 'error.main', mb: 2 }}>Error: {error}</Box>}
      <TableContainer component={Paper}>
        <DataTable
          columns={columns}
          data={subSubCategories}
          onView={handleView}
          onEdit={handleEdit}
          // onDelete is omitted
        />
      </TableContainer>
    </Box>
  );
};

export default SubSubCategoryList;
