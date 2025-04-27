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

import { menuService, Menu } from '../../services/MenuService';
import { restaurantService, Restaurant } from '../../services/RestaurantService'; // To filter by restaurant

const MenuList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(''); // 'all' or restaurant ID
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Fetch restaurants for filtering
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const data: Restaurant[] = await restaurantService.getRestaurants();
        setRestaurants(data || []);
        setSelectedRestaurantId('all'); // Default to showing all
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants.');
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch menus based on selected restaurant
  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      setError(null);
      try {
        const restaurantIdParam = selectedRestaurantId === 'all' ? undefined : selectedRestaurantId;
        const data: Menu[] = await menuService.getMenus(restaurantIdParam);
        setMenus(data || []);
      } catch (err) {
        console.error('Error fetching menus:', err);
        setError('Failed to fetch menus. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
     // Fetch only when restaurants have loaded and a selection (or 'all') is made
    if (!loadingRestaurants) {
       fetchMenus();
    }
  }, [selectedRestaurantId, loadingRestaurants]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

   const handleRestaurantChange = (event: SelectChangeEvent) => {
    setSelectedRestaurantId(event.target.value);
    setPage(0); // Reset page when filter changes
  };

  const getRestaurantName = (restaurantData: string | Restaurant | undefined): string => {
    if (!restaurantData) return 'N/A';
    if (typeof restaurantData === 'string') {
      const foundRestaurant = restaurants.find(r => r._id === restaurantData);
      return foundRestaurant ? foundRestaurant.name : 'Unknown';
    }
    return restaurantData.name;
  };

  const filteredMenus = menus.filter((menu: Menu) =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (menu.description && menu.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    getRestaurantName(menu.restaurantId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (menu: Menu) => {
    setMenuToDelete(menu);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!menuToDelete) return;
    try {
      await menuService.deleteMenu(menuToDelete._id);
      setMenus(menus.filter(m => m._id !== menuToDelete._id));
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
    } catch (err) {
      console.error('Error deleting menu:', err);
      setError('Failed to delete menu. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setMenuToDelete(null);
  };

  // Note: Toggle status might need backend implementation if not already present
  // const handleToggleStatus = async (menuId: string, currentStatus: boolean) => { ... };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Menus
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => navigate('/menus/add')} // Adjust route as needed
        >
          Add Menu
        </Button>
      </Box>

       <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
         <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Restaurant</InputLabel>
          <Select
            value={selectedRestaurantId}
            label="Filter by Restaurant"
            onChange={handleRestaurantChange}
            disabled={loadingRestaurants}
          >
            <MenuItem value="all">All Restaurants</MenuItem>
            {loadingRestaurants ? (
              <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
            ) : (
              restaurants.map((restaurant) => (
                <MenuItem key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search menus..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {loading && menus.length === 0 ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <MUITable>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Restaurant</TableCell>
                 <TableCell>Categories</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMenus
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((menu) => (
                  <TableRow key={menu._id}>
                    <TableCell>{menu.name}</TableCell>
                    <TableCell>{menu.description || '-'}</TableCell>
                    <TableCell>{getRestaurantName(menu.restaurantId)}</TableCell>
                     <TableCell>{menu.categories?.length || 0}</TableCell>
                    <TableCell>
                       <Chip
                          icon={<CircleIcon fontSize="small" />}
                          label={menu.isActive ? 'Active' : 'Inactive'}
                          color={menu.isActive ? 'success' : 'default'}
                          size="small"
                          // onClick={() => handleToggleStatus(menu._id, menu.isActive)} // Add toggle handler if needed
                          // sx={{ cursor: 'pointer' }}
                        />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => navigate(`/menus/detail/${menu._id}`)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/menus/edit/${menu._id}`)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(menu)}>
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
            count={filteredMenus.length}
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
            Are you sure you want to delete the menu "{menuToDelete?.name}"? This action cannot be undone.
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

export default MenuList;
