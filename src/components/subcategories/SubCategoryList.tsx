import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, IconButton, Paper, Table as MUITable, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, Typography,
  Chip, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, CircularProgress, SelectChangeEvent, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIcon from '@mui/icons-material/Circle';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';

import { subCategoryService, SubCategory } from '../../services/SubCategoryService';
import { categoryService, Category } from '../../services/CategoryService'; // To filter by category

const SubCategoryList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<SubCategory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // 'all' or category ID
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories for filtering
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data: Category[] = await categoryService.getCategories();
        setCategories(data || []);
        setSelectedCategoryId('all'); // Default to showing all
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories based on selected category
  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryIdParam = selectedCategoryId === 'all' ? undefined : selectedCategoryId;
        const data: SubCategory[] = await subCategoryService.getSubCategories(categoryIdParam);
        setSubCategories(data || []);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        setError('Failed to fetch subcategories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    // Fetch only when categories have loaded and a selection (or 'all') is made
    if (!loadingCategories) {
       fetchSubCategories();
    }

  }, [selectedCategoryId, loadingCategories]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategoryId(event.target.value);
    setPage(0); // Reset page when filter changes
  };

  const getCategoryName = (categoryData: string | Category | undefined): string => {
    if (!categoryData) return 'N/A';
    if (typeof categoryData === 'string') {
      // If it's just an ID, find the name in the fetched categories
      const foundCategory = categories.find(c => c._id === categoryData);
      return foundCategory ? foundCategory.name : 'Unknown';
    }
    // If it's a populated object
    return categoryData.name;
  };


  const filteredSubCategories = subCategories.filter((sc: SubCategory) =>
    sc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sc.description && sc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getCategoryName(sc.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (subCategory: SubCategory) => {
    setSubCategoryToDelete(subCategory);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subCategoryToDelete) return;
    try {
      await subCategoryService.deleteSubCategory(subCategoryToDelete._id);
      setSubCategories(subCategories.filter(sc => sc._id !== subCategoryToDelete._id));
      setDeleteDialogOpen(false);
      setSubCategoryToDelete(null);
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      setError('Failed to delete subcategory. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setSubCategoryToDelete(null);
  };

  const handleToggleStatus = async (subCategoryId: string, currentStatus: boolean) => {
    try {
      setLoading(true); // Indicate loading state
      await subCategoryService.toggleSubCategoryStatus(subCategoryId);
      // Refetch or update state locally
      setSubCategories(prev =>
        prev.map(sc =>
          sc._id === subCategoryId ? { ...sc, isActive: !currentStatus } : sc
        )
      );
    } catch (err) {
      console.error('Error toggling subcategory status:', err);
      setError('Failed to update status.');
    } finally {
       setLoading(false);
    }
  };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Sub-Categories
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => navigate('/subcategories/add')} // Adjust route as needed
        >
          Add Sub-Category
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
         <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategoryId}
            label="Filter by Category"
            onChange={handleCategoryChange}
            disabled={loadingCategories}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {loadingCategories ? (
              <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
            ) : (
              categories.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search sub-categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {loading && subCategories.length === 0 ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <MUITable>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Parent Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubCategories
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((sc) => (
                  <TableRow key={sc._id}>
                     <TableCell>
                      {sc.image ? (
                        <img src={sc.image} alt={sc.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <ImageIcon color="disabled" sx={{ width: 50, height: 50 }} />
                      )}
                    </TableCell>
                    <TableCell>{sc.name}</TableCell>
                    <TableCell>{sc.description || '-'}</TableCell>
                    <TableCell>{getCategoryName(sc.category)}</TableCell>
                    <TableCell>
                       <Chip
                          icon={<CircleIcon fontSize="small" />}
                          label={sc.isActive ? 'Active' : 'Inactive'}
                          color={sc.isActive ? 'success' : 'default'}
                          size="small"
                          onClick={() => handleToggleStatus(sc._id, sc.isActive)}
                          sx={{ cursor: 'pointer' }}
                        />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => navigate(`/subcategories/detail/${sc._id}`)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/subcategories/edit/${sc._id}`)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(sc)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </MUITable>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredSubCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the sub-category "{subCategoryToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubCategoryList;
