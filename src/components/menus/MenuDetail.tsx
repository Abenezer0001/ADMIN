import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Button, IconButton, CircularProgress,
  List, ListItem, ListItemText, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';

import { menuService, Menu } from '../../services/MenuService';
import { menuItemService, MenuItem as MenuItemData } from '../../services/MenuItemService';
import RestaurantService from '../../services/RestaurantService';

// Define MenuCategory interface since it's not exported
interface MenuCategory {
  _id: string;
  name: string;
  description?: string;
  items: MenuItemData[];
}

// Define Restaurant interface locally
interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

const MenuDetail = () => {
  const { id: menuId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menu, setMenu] = React.useState<Menu | null>(null);
  const [restaurant, setRestaurant] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMenuDetails = React.useCallback(async () => {
    if (!menuId) {
      setError('Menu ID is missing.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Fetch menu with populated categories and items
      const menuData: Menu = await menuService.getMenu(menuId);
      setMenu(menuData);

      if (menuData && menuData.restaurantId) {
        const restaurantId = typeof menuData.restaurantId === 'string' ? menuData.restaurantId : menuData.restaurantId._id;
        // Fetch restaurant details
        const restData = await RestaurantService.getRestaurantById(restaurantId);
        setRestaurant(restData);
      }
    } catch (err) {
      setError('Failed to fetch menu details.');
      console.error('Error fetching menu details:', err);
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  React.useEffect(() => {
    fetchMenuDetails();
  }, [fetchMenuDetails]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
  }

  if (!menu) {
    return <Typography sx={{ p: 3 }}>Menu not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Menu Details
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{menu.name}</Typography>
          <Box sx={{ display: 'flex', gap: 1}}>
             {/* <Chip
                icon={<CircleIcon fontSize="small" />}
                label={menu.isActive ? 'Active' : 'Inactive'}
                color={menu.isActive ? 'success' : 'default'}
                size="small"
            /> */}
            <Button
                startIcon={<EditIcon />}
                variant="outlined"
                size="small"
                onClick={() => navigate(`/menus/edit/${menu._id}`)}
            >
                Edit Info
            </Button>
          </Box>
        </Box>
         <Typography variant="body1" color="text.secondary" gutterBottom>
            {menu.description || 'No description.'}
        </Typography>
         <Typography variant="body2" color="text.secondary">
            Restaurant: {restaurant?.name || 'Loading...'}
        </Typography>
      </Paper>

       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Menu Structure</Typography>
       </Box>

      {(!menu.categories || menu.categories.length === 0) && (
        <Typography>No categories in this menu yet.</Typography>
      )}

      {menu.categories && menu.categories.map((category: MenuCategory) => (
        <Paper key={category._id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">{category.name}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{category.description}</Typography>
          <Divider sx={{ my: 1 }}/>
          {/* <List dense>
            {category.items && category.items.length > 0 ? (
               category.items.map((item: MenuItemData) => (
                  <ListItem key={item._id}>
                    <ListItemText primary={item.name} secondary={`£${item.price.toFixed(2)}`} />
                  </ListItem>
               ))
            ) : (
                <ListItem>
                    <ListItemText primary="No items in this category." />
                </ListItem>
            )}
          </List> */}
        </Paper>
      ))}
    </Box>
  );
};

export default MenuDetail;
