import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Button, IconButton, CircularProgress,
  List, ListItem, ListItemText, Divider, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Autocomplete, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';

import { menuService, Menu, MenuCategory, AddCategoryToMenuDto } from '../../services/MenuService';
import { menuItemService, MenuItem as MenuItemData } from '../../services/MenuItemService'; // Renamed import
import { restaurantService, Restaurant } from '../../services/RestaurantService';

// Interface for managing items within a category
interface CategoryItemManagement extends MenuCategory {
    availableItemsToAdd?: MenuItemData[]; // Use renamed type
}

const MenuDetail = () => {
  const { id: menuId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categoriesWithItems, setCategoriesWithItems] = useState<CategoryItemManagement[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allItemsForRestaurant, setAllItemsForRestaurant] = useState<MenuItemData[]>([]); // Use renamed type

  // Dialog states
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [selectedCategoryForAddItem, setSelectedCategoryForAddItem] = useState<string | null>(null);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<MenuItemData | null>(null); // Use renamed type


  const fetchMenuDetails = useCallback(async () => {
    if (!menuId) {
      setError('Menu ID is missing.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      // Fetch menu, populate categories and items within categories
      const menuData: Menu = await menuService.getMenu(menuId); // Assuming getMenu populates categories.items
      setMenu(menuData);

      if (menuData && menuData.restaurantId) {
        const restaurantId = typeof menuData.restaurantId === 'string' ? menuData.restaurantId : menuData.restaurantId._id;
        // Fetch restaurant details
        const restData: Restaurant = await restaurantService.getRestaurant(restaurantId);
        setRestaurant(restData);
        // Fetch all items for this restaurant to populate add item dropdown
        const allItems: MenuItemData[] = await menuItemService.getMenuItems({ restaurantId }); // Use renamed type
        setAllItemsForRestaurant(allItems || []);

         // Prepare categories state with available items to add
         const populatedCategories = menuData.categories.map((cat: MenuCategory) => { // Add type to cat
             // Ensure cat.items is treated as an array of populated items or IDs
             const currentItemIds = new Set(
                 (cat.items as (string | MenuItemData)[]) // Type assertion
                 .map(item => typeof item === 'string' ? item : item._id)
             );
             const availableItems = allItems.filter((item: MenuItemData) => !currentItemIds.has(item._id)); // Add type to item
             return { ...cat, availableItemsToAdd: availableItems };
         });
         setCategoriesWithItems(populatedCategories);

      } else {
          setCategoriesWithItems(menuData?.categories || []); // Use menu data directly if restaurant fetch fails
      }


    } catch (err) {
      setError('Failed to fetch menu details.');
      console.error('Error fetching menu details:', err);
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    fetchMenuDetails();
  }, [fetchMenuDetails]);

   // --- Category Management ---
  const handleOpenAddCategory = () => {
    setNewCategoryName('');
    setNewCategoryDesc('');
    setAddCategoryOpen(true);
  };

  const handleAddCategory = async () => {
    if (!menuId || !newCategoryName.trim()) return;
    try {
      const payload: AddCategoryToMenuDto = { name: newCategoryName, description: newCategoryDesc };
      await menuService.addCategoryToMenu(menuId, payload);
      setAddCategoryOpen(false);
      fetchMenuDetails(); // Refresh details
    } catch (err) {
      console.error("Error adding category:", err);
      setError("Failed to add category.");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
      if (!menuId || !categoryId) return;
      // Consider using a confirmation dialog instead of window.confirm for better UX
      if (window.confirm('Are you sure you want to delete this category and its item links from the menu?')) {
          try {
              await menuService.deleteMenuCategory(menuId, categoryId);
              fetchMenuDetails(); // Refresh details
          } catch (err) {
              console.error("Error deleting category:", err);
              setError("Failed to delete category.");
          }
      }
  };

  // --- Item Management ---
   const handleOpenAddItem = (categoryId: string) => {
       setSelectedCategoryForAddItem(categoryId);
       setSelectedItemToAdd(null); // Reset selection
       setAddItemOpen(true);
   };

   const handleAddItemReference = async () => {
       if (!menuId || !selectedCategoryForAddItem || !selectedItemToAdd) return;
       try {
           await menuService.addMenuItemReferenceToCategory(menuId, selectedCategoryForAddItem, { itemId: selectedItemToAdd._id });
           setAddItemOpen(false);
           fetchMenuDetails(); // Refresh details
       } catch (err) {
           console.error("Error adding item reference:", err);
           setError("Failed to add item reference.");
       }
  };

  const handleRemoveItemReference = async (categoryId: string, itemId: string) => {
        if (!menuId || !categoryId || !itemId) return;
        // Consider using a confirmation dialog
         if (window.confirm('Are you sure you want to remove this item from this category?')) {
            try {
                await menuService.removeMenuItemReferenceFromCategory(menuId, categoryId, itemId);
                fetchMenuDetails(); // Refresh details
            } catch (err) {
                console.error("Error removing item reference:", err);
                setError("Failed to remove item reference.");
            }
        }
   };


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
             <Chip
                icon={<CircleIcon fontSize="small" />}
                label={menu.isActive ? 'Active' : 'Inactive'}
                color={menu.isActive ? 'success' : 'default'}
                size="small"
            />
            <Button
                startIcon={<EditIcon />}
                variant="outlined"
                size="small"
                onClick={() => navigate(`/menus/edit/${menu._id}`)} // Navigate to basic menu edit
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
            <Button startIcon={<AddIcon />} onClick={handleOpenAddCategory}>Add Category</Button>
       </Box>


      {categoriesWithItems.length === 0 && <Typography>No categories added to this menu yet.</Typography>}

      {categoriesWithItems.map((category: CategoryItemManagement) => ( // Add type to category
        <Paper key={category._id} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">{category.name}</Typography>
            <Box>
                 <Button size="small" startIcon={<AddIcon />} onClick={() => handleOpenAddItem(category._id)} sx={{ mr: 1 }}>
                    Add Item
                 </Button>
                 {/* Add Edit Category Button if needed */}
                 <IconButton size="small" color="error" onClick={() => handleDeleteCategory(category._id)}>
                    <DeleteIcon fontSize="small"/>
                 </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{category.description}</Typography>
          <Divider sx={{ my: 1 }}/>
          <List dense>
            {(category.items as MenuItemData[])?.length > 0 ? ( // Use renamed type, assuming items are populated
               (category.items as MenuItemData[]).map((item: MenuItemData) => ( // Add type to item
                  <ListItem
                    key={item._id}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" size="small" onClick={() => handleRemoveItemReference(category._id, item._id)}>
                        <DeleteIcon fontSize="small"/>
                      </IconButton>
                    }
                  >
                    <ListItemText primary={item.name} secondary={`£${item.price.toFixed(2)}`} />
                  </ListItem>
               ))
            ) : (
                <ListItem>
                    <ListItemText primary="No items in this category." />
                </ListItem>
            )}
          </List>
        </Paper>
      ))}

       {/* Add Category Dialog */}
        <Dialog open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)}>
            <DialogTitle>Add New Category to Menu</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Category Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={newCategoryName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)} // Add type to e
                />
                 <TextField
                    margin="dense"
                    label="Description (Optional)"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={newCategoryDesc}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryDesc(e.target.value)} // Add type to e
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setAddCategoryOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>Add</Button>
            </DialogActions>
        </Dialog>

        {/* Add Item Dialog */}
        <Dialog open={addItemOpen} onClose={() => setAddItemOpen(false)} fullWidth maxWidth="xs">
             <DialogTitle>Add Item to Category</DialogTitle>
             <DialogContent>
                 <Autocomplete
                    options={categoriesWithItems.find((c: CategoryItemManagement) => c._id === selectedCategoryForAddItem)?.availableItemsToAdd || []} // Add type to c
                    getOptionLabel={(option: MenuItemData) => option.name} // Add type to option
                    value={selectedItemToAdd}
                    onChange={(_event: React.SyntheticEvent, newValue: MenuItemData | null) => { // Add types
                        setSelectedItemToAdd(newValue);
                    }}
                    isOptionEqualToValue={(option: MenuItemData, value: MenuItemData) => option._id === value._id} // Add types
                    renderInput={(params: any) => ( // Add type any for params or define specific type
                        <TextField {...params} label="Select Item" variant="standard" margin="dense" />
                    )}
                    noOptionsText="No available items found"
                    sx={{ mt: 1 }}
                 />
             </DialogContent>
             <DialogActions>
                <Button onClick={() => setAddItemOpen(false)}>Cancel</Button>
                <Button onClick={handleAddItemReference} disabled={!selectedItemToAdd}>Add Item</Button>
             </DialogActions>
        </Dialog>

    </Box>
  );
};

export default MenuDetail;
