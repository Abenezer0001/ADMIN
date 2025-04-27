import React, { useState, useEffect } from 'react'; // Standard import
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
  // Switch, // Removed as we replace it
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
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  // FileCopy as FileCopyIcon, // Removed unused
  // ChevronRight as ChevronRightIcon, // Removed unused
  Download as DownloadIcon,
  Edit as EditIcon,
  // ContentCopy as ContentCopyIcon, // Removed unused
  // Category as CategoryIcon, // Removed unused
  // Restaurant as RestaurantIcon, // Removed unused
  Visibility as VisibilityIcon, // Added for View Detail
 } from '@mui/icons-material';
 import { Link, useNavigate } from 'react-router-dom';
import { menuItemService, MenuItem as MenuItemData } from '../../services/MenuItemService';
import { restaurantService, Restaurant } from '../../services/RestaurantService';
import { subSubCategoryService, SubSubCategory } from '../../services/SubSubCategoryService';

const MenuItemsList = () => {
  const theme = useTheme();
  const [items, setItems] = useState<MenuItemData[]>([]); // Standard useState
  const [searchTerm, setSearchTerm] = useState(''); // Standard useState
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Standard useState
  const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null); // Standard useState
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Standard useState
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Standard useState
  const [error, setError] = useState<string | null>(null); // Standard useState

  // Add state for filters
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]); // Standard useState
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]); // Standard useState
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('all'); // Standard useState
  const [selectedSubSubCategoryId, setSelectedSubSubCategoryId] = useState<string>('all'); // Standard useState
  const [loadingFilters, setLoadingFilters] = useState(true); // Standard useState


  // Fetch initial filter data
  useEffect(() => { // Standard useEffect
    const fetchFilterData = async () => {
      setLoadingFilters(true);
      try {
        const [restaurantData, subSubCategoryData] = await Promise.all([
          restaurantService.getRestaurants(),
          subSubCategoryService.getSubSubCategories()
        ]);
        setRestaurants(restaurantData || []);
        setSubSubCategories(subSubCategoryData || []);
      } catch (err) {
        console.error('Error loading filter data:', err);
        setError('Failed to load filters.');
      } finally {
        setLoadingFilters(false);
      }
    };
    fetchFilterData();
  }, []);


  // Fetch items based on filters
  // NOTE: This fetches on mount and filter change. It won't automatically refetch
  // if items are added elsewhere without a page reload or filter change.
  useEffect(() => { // Standard useEffect
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (selectedRestaurantId !== 'all') params.restaurantId = selectedRestaurantId;
        if (selectedSubSubCategoryId !== 'all') params.subSubCategoryId = selectedSubSubCategoryId;

        const data: MenuItemData[] = await menuItemService.getMenuItems(params);
        setItems(data || []);
      } catch (error) {
        console.error('Error loading menu items:', error);
        setError('Failed to load menu items.');
      } finally {
        setLoading(false);
      }
    };
     if (!loadingFilters) {
        loadItems();
     }
  }, [selectedRestaurantId, selectedSubSubCategoryId, loadingFilters]);

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
   const filteredItems = items.filter((item: MenuItemData) => // Added type
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
        // Ensure state update uses the latest state
        setItems((currentItems: MenuItemData[]) => currentItems.filter((item: MenuItemData) => item._id !== selectedItem._id)); // Added type for currentItems
        setDeleteDialogOpen(false);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item.'); // Inform user
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  // Helper to get SubSubCategory Name
  const getSubSubCategoryName = (subSubCat: string | SubSubCategory | undefined): string => {
      if (!subSubCat) return 'N/A';
      if (typeof subSubCat === 'string') {
          // Find by ID if only ID is stored
          const found = subSubCategories.find((ssc: SubSubCategory) => ssc._id === subSubCat); // Added type
          return found ? found.name : 'Unknown ID';
      }
      // If object is populated
      return subSubCat.name;
  }

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
          <IconButton color="primary">
            <DownloadIcon />
          </IconButton>
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
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Active</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
                 <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
            ) : error ? (
                 <TableRow><TableCell colSpan={8} align="center" sx={{ color: 'error.main' }}>{error}</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (
                 <TableRow><TableCell colSpan={8} align="center">No menu items found.</TableCell></TableRow>
            ) : (
                filteredItems.map((item: MenuItemData) => ( // Ensure type annotation is correct
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
                    {/* Improved Availability Indicator */}
                    <Tooltip title={item.isAvailable ? 'Available' : 'Unavailable'}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: item.isAvailable ? 'success.main' : 'action.disabled',
                          display: 'inline-block',
                          ml: 1,
                        }}
                      />
                    </Tooltip>
                 </TableCell>
                 <TableCell>
                     <Chip
                        label={item.isActive ? 'Active' : 'Inactive'}
                        color={item.isActive ? 'success' : 'default'}
                        size="small"
                     />
                 </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                     {/* View Detail Icon */}
                      <Tooltip title="View Details">
                       <IconButton
                         size="small"
                         onClick={() => navigate(`/menu-items/detail/${item._id}`)} // Navigate to detail page
                         sx={{ color: 'text.secondary' }}
                       >
                         <VisibilityIcon fontSize="small"/>
                       </IconButton>
                     </Tooltip>
                     {/* Edit Icon */}
                     <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/menu/items/edit/${item._id}`)} // Navigate to edit page
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
    </Box>
  );
};

export default MenuItemsList;
