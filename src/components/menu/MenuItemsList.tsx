import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  Switch,
  Menu,
  MenuItem,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Tooltip,
  SelectChangeEvent,
  Popover,
  List,
  ListItem,
  ListItemText,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
 } from '@mui/icons-material';
 import { Link, useNavigate } from 'react-router-dom';
import { menuItemService, MenuItem as MenuItemData } from '../../services/MenuItemService';
import { restaurantService, Restaurant } from '../../services/RestaurantService';
import { subSubCategoryService, SubSubCategory } from '../../services/SubSubCategoryService';
import CSVImportModal from '../common/CSVImportModal';

const MenuItemsList = () => {
  const theme = useTheme();
  const [items, setItems] = useState<MenuItemData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Add state for filters
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('all');
  const [selectedSubSubCategoryId, setSelectedSubSubCategoryId] = useState<string>('all');
  const [loadingFilters, setLoadingFilters] = useState(true);

  useEffect(() => {
    Promise.all([fetchFilterData(), loadItems()]);
  }, []);

    const fetchFilterData = async () => {
      try {
      const [restaurantsData, subSubCategoriesData] = await Promise.all([
          restaurantService.getRestaurants(),
          subSubCategoryService.getSubSubCategories()
        ]);
      
      setRestaurants(restaurantsData || []);
      setSubSubCategories(subSubCategoriesData || []);
    } catch (error) {
      console.error('Error fetching filter data:', error);
      }
    };

    const loadItems = async () => {
    try {
      setLoading(true);
      // Get both available and unavailable items
      const data = await menuItemService.getMenuItems({ 
        restaurantId: selectedRestaurantId !== 'all' ? selectedRestaurantId : undefined,
        subSubCategoryId: selectedSubSubCategoryId !== 'all' ? selectedSubSubCategoryId : undefined,
        includeInactive: true // Include both available and unavailable items
      });
      setItems(data || []);
      setError(null);
      } catch (error) {
        console.error('Error loading menu items:', error);
      setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter items based on search term locally
  const filteredItems = items.filter((item: MenuItemData) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteClick = (item: MenuItemData) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      try {
        await menuItemService.deleteMenuItem(selectedItem._id);
        setItems((currentItems: MenuItemData[]) => currentItems.filter((item: MenuItemData) => item._id !== selectedItem._id));
        setDeleteDialogOpen(false);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item.');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  // Handle availability toggle
  const handleAvailabilityToggle = async (item: MenuItemData) => {
    try {
      const updatedItem = await menuItemService.toggleMenuItemAvailability(item._id);
      setItems((currentItems: MenuItemData[]) => 
        currentItems.map((currentItem: MenuItemData) => 
          currentItem._id === item._id ? updatedItem : currentItem
        )
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      setError('Failed to toggle availability.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Description', 'Price', 'Category', 'Is Available', 'Restaurant'];
    const csvContent = [
      headers.join(','),
      ...items.map((item: MenuItemData) => [
        item.name,
        item.description || '',
        item.price,
        getSubSubCategoryName(item.subSubCategoryId),
        item.isAvailable ? 'true' : 'false',
        item.restaurantId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `menu_items_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (data: any[]) => {
    try {
      const importedItems = [];
      const errors = [];

      for (const row of data) {
        try {
          const itemData = {
            name: row.name || '',
            description: row.description || '',
            price: Number(row.price) || 0,
            subSubCategoryId: row.category_id || '',
            isAvailable: row.is_available !== false,
            restaurantId: row.restaurant_id || '',
            // Add other required fields based on your MenuItem interface
          };

          // Validate required fields
          if (!itemData.name) {
            errors.push(`Row missing required field: name`);
            continue;
          }

          const result = await menuItemService.createMenuItem(itemData);
          importedItems.push(result);
        } catch (error) {
          console.error('Error importing menu item row:', error);
          errors.push(`Error importing menu item "${row.name || 'Unknown'}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Refresh the list
      await loadItems();

      return {
        success: importedItems.length > 0,
        message: `Successfully imported ${importedItems.length} menu items${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: 'Failed to import menu items',
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

  // Helper to get SubSubCategory Name
  const getSubSubCategoryName = (subSubCat: string | SubSubCategory | undefined): string => {
      if (!subSubCat) return 'N/A';
    
      if (typeof subSubCat === 'string') {
      const found = subSubCategories.find(cat => cat._id === subSubCat);
      return found ? found.name : 'Unknown';
      }
    
    return subSubCat.name || 'Unknown';
  };

  return (
    <Box sx={{
      p: 3,
      bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
      borderRadius: 2,
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Menu Items</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              }
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleOpenImportModal}
            sx={{
              color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              borderColor: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
            }}
          >
            Import CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            disabled={items.length === 0}
            sx={{
              color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              borderColor: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{
              color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              borderColor: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
            }}
          >
            Filter
          </Button>
           {/* Filter Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleFilterClose}
                PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
            >
                <Box sx={{ p: 2 }}>
                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <InputLabel>Restaurant</InputLabel>
                        <Select
                            value={selectedRestaurantId}
                            label="Restaurant"
                            onChange={(e: SelectChangeEvent<string>) => setSelectedRestaurantId(e.target.value)}
                            disabled={loadingFilters}
                        >
                            <MenuItem value="all">All Restaurants</MenuItem>
                            {restaurants.map((r: Restaurant) => (
                                <MenuItem key={r._id} value={r._id}>{r.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                     <FormControl fullWidth size="small">
                        <InputLabel>Sub-Sub-Category</InputLabel>
                        <Select
                            value={selectedSubSubCategoryId}
                            label="Sub-Sub-Category"
                            onChange={(e: SelectChangeEvent<string>) => setSelectedSubSubCategoryId(e.target.value)}
                            disabled={loadingFilters}
                        >
                            <MenuItem value="all">All Sub-Sub-Categories</MenuItem>
                            {subSubCategories.map((ssc: SubSubCategory) => (
                                <MenuItem key={ssc._id} value={ssc._id}>{ssc.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Menu>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/menu/items/new"
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark',
              }
            }}
          >
            Add Menu Item
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper',
        borderRadius: 2,
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Image</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Sub-Sub-Category</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Prep Time</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Available</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
                 <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
            ) : error ? (
                 <TableRow><TableCell colSpan={7} align="center" sx={{ color: 'error.main' }}>{error}</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (
                 <TableRow><TableCell colSpan={7} align="center">No menu items found.</TableCell></TableRow>
            ) : (
                filteredItems.map((item: MenuItemData) => (
              <TableRow
                key={item._id}
                sx={{
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'background.default'
                  }
                }}
              >
                 <TableCell>
                     <Box
                      component="img"
                      src={item.image || '/placeholder-food.jpg'}
                      alt={item.name}
                      sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                    />
                 </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{getSubSubCategoryName(item.subSubCategory)}</TableCell>
                <TableCell>£{item.price.toFixed(2)}</TableCell>
                <TableCell>{item.preparationTime} min</TableCell>
                 <TableCell>
                    <Switch
                      checked={item.isAvailable}
                      onChange={() => handleAvailabilityToggle(item)}
                      color={item.isAvailable ? "success" : "error"}
                      size="small"
                        sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: item.isAvailable ? '#4caf50' : '#f44336',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: item.isAvailable ? '#4caf50' : '#f44336',
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: item.isAvailable ? '#4caf50' : '#f44336',
                        },
                      }}
                     />
                 </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                     {/* View Detail Icon */}
                      <Tooltip title="View Details">
                       <IconButton
                         size="small"
                         onClick={() => navigate(`/menu-items/detail/${item._id}`)}
                         sx={{ color: 'text.secondary' }}
                       >
                         <VisibilityIcon fontSize="small"/>
                       </IconButton>
                     </Tooltip>
                     {/* Edit Icon */}
                     <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/menu/items/edit/${item._id}`)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <EditIcon fontSize="small"/>
                        </IconButton>
                     </Tooltip>
                     {/* Delete Icon */}
                     <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(item)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <DeleteIcon fontSize="small"/>
                        </IconButton>
                     </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>


      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Menu Item
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete the menu item "{selectedItem?.name}"?
          This action cannot be undone (soft delete by default).
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <CSVImportModal
        open={importModalOpen}
        onClose={handleCloseImportModal}
        title="Menu Items"
        templateHeaders={['Name', 'Description', 'Price', 'Category ID', 'Is Available', 'Restaurant ID']}
        templateData={[
          { 
            name: 'Example Item', 
            description: 'A sample menu item description', 
            price: 12.99, 
            category_id: '60f9b9b9b9b9b9b9b9b9b9b9', 
            is_available: 'true',
            restaurant_id: '60f9b9b9b9b9b9b9b9b9b9b9'
          }
        ]}
        onImport={handleImportCSV}
      />
    </Box>
  );
};

export default MenuItemsList;
