import React from 'react'; // Revert to default import
import {
  Box, Button, TextField, Typography, Paper, FormControl, InputLabel,
  Select, MenuItem, FormControlLabel, Switch, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, SelectChangeEvent,
  Autocomplete, List, ListItem, ListItemText, ListItemIcon, Collapse, IconButton, Chip, Divider,
  Card, CardHeader, CardContent, Grid
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { menuService, CreateMenuDto, UpdateMenuDto, Menu } from '../../services/MenuService';
import { restaurantService, Restaurant } from '../../services/RestaurantService';
import { categoryService, Category } from '../../services/CategoryService';
import { subCategoryService, SubCategory } from '../../services/SubCategoryService';
import { subSubCategoryService, SubSubCategory } from '../../services/SubSubCategoryService';
import { venueService, Venue } from '../../services/VenueService';
import { scheduleService, Schedule, DailySchedule, CreateScheduleRequest } from '../../services/ScheduleService';
// Import icons for expand/collapse functionality
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CategoryIcon from '@mui/icons-material/Category';
import ClassIcon from '@mui/icons-material/Class';

interface MenuFormData {
  name: string;
  description: string;
  isActive: boolean;
  restaurantId: string;
  venueId: string;
  categories: string[];
  subCategories: string[];
}

interface MenuFormProps {
  title: string;
}

// Track expanded categories
interface ExpandedState {
  [key: string]: boolean;
}

const MenuForm = ({ title }: MenuFormProps) => {
  const navigate = useNavigate();
  const { id: menuId } = useParams<{ id: string }>();
  const [formData, setFormData] = React.useState<MenuFormData>({ // Use React.useState
    name: '',
    description: '',
    isActive: true,
    restaurantId: '',
    venueId: '',
    categories: [],
    subCategories: [],
  });

  // State for tracking expanded categories
  const [expandedCategories, setExpandedCategories] = React.useState<ExpandedState>({}); // Use React.useState
  
  // State for selected category when adding subcategories
  const [selectedCategoryForSubcat, setSelectedCategoryForSubcat] = React.useState<string | null>(null); // Use React.useState
  
  // States for handling dialogs
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false); // Use React.useState
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = React.useState(false); // Use React.useState
  
  const [loading, setLoading] = React.useState(false); // Use React.useState
  const [error, setError] = React.useState<string | null>(null); // Use React.useState
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]); // Use React.useState
  const [loadingRestaurants, setLoadingRestaurants] = React.useState(false); // Use React.useState
  const [availableCategories, setAvailableCategories] = React.useState<Category[]>([]); // Use React.useState
  const [loadingCategories, setLoadingCategories] = React.useState(false); // Use React.useState
  const [availableSubCategories, setAvailableSubCategories] = React.useState<SubCategory[]>([]); // Use React.useState
  const [loadingSubCategories, setLoadingSubCategories] = React.useState(false); // Use React.useState
  const [availableVenues, setAvailableVenues] = React.useState<Venue[]>([]); // Use React.useState
  const [loadingVenues, setLoadingVenues] = React.useState(false); // Use React.useState
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false); // Use React.useState

  // State to hold subcategories fetched for the dialog
  const [subcategoriesForDialog, setSubcategoriesForDialog] = React.useState<SubCategory[]>([]); // Use React.useState

  // New states to store selected categories/subcategories in the dialogs
  const [selectedCategoriesToAdd, setSelectedCategoriesToAdd] = React.useState<Category[]>([]); // Use React.useState
  const [selectedSubcategoriesToAdd, setSelectedSubcategoriesToAdd] = React.useState<SubCategory[]>([]); // Use React.useState

  // Schedule state
  const [enableSchedule, setEnableSchedule] = React.useState(false);
  const [existingSchedule, setExistingSchedule] = React.useState<Schedule | null>(null);
  const [scheduleData, setScheduleData] = React.useState<DailySchedule[]>([
    { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '22:00' }, // Sunday
    { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Monday
    { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Tuesday
    { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Wednesday
    { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Thursday
    { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Friday
    { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '23:00' },  // Saturday
  ]);

  // Fetch restaurants for the dropdown
  React.useEffect(() => { // Use React.useEffect
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const data = await restaurantService.getRestaurants() as Restaurant[];
        setRestaurants(data || []);
        if (!menuId && data && data.length > 0 && !formData.restaurantId) {
          setFormData((prev: MenuFormData) => ({ ...prev, restaurantId: data[0]._id }));
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants.');
      } finally {
        setLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, [menuId]);

  // Fetch menu data if in edit mode
  React.useEffect(() => { // Use React.useEffect
    const fetchMenu = async () => {
      if (!menuId) return;

      try {
        setLoading(true);
        const data: Menu = await menuService.getMenu(menuId);
        if (data) {
          const categoryIds = (data.categories || []).map((cat: string | Category) => typeof cat === 'string' ? cat : cat._id);
          const subCategoryIds = (data.subCategories || []).map((sub: string | SubCategory) => typeof sub === 'string' ? sub : sub._id);

          setFormData((prev: MenuFormData) => ({
            ...prev,
            name: data.name || '',
            description: data.description || '',
            isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
            restaurantId: typeof data.restaurantId === 'string' ? data.restaurantId : data.restaurantId._id,
            venueId: typeof data.venueId === 'string' ? data.venueId : data.venueId._id,
            categories: categoryIds,
            subCategories: subCategoryIds,
          }));

          // Check for existing schedule
          if (menuId) {
            try {
              const schedules = await scheduleService.getAllSchedules({
                type: 'MENU',
                menu: menuId
              });

              console.log('Fetched menu schedules:', schedules);

              if (schedules && schedules.length > 0) {
                const menuSchedule = schedules[0];
                setExistingSchedule(menuSchedule);
                setEnableSchedule(true);
                
                console.log('Found existing menu schedule:', menuSchedule);
                
                // Convert backend schedule format to frontend format
                // Backend uses 'dailySchedule' (singular), not 'dailySchedules' (plural)
                const dailyScheduleData = (menuSchedule as any).dailySchedule || (menuSchedule as any).dailySchedules;
                
                if (dailyScheduleData && Array.isArray(dailyScheduleData)) {
                  console.log('Converting daily schedule data:', dailyScheduleData);
                  setScheduleData(dailyScheduleData.map((day: any) => ({
                    dayOfWeek: day.dayOfWeek,
                    isOpen: day.isOpen,
                    openTime: day.openTime || day.startTime || '09:00',
                    closeTime: day.closeTime || day.endTime || '22:00'
                  })));
                }
              }
            } catch (scheduleErr) {
              console.error('Error fetching menu schedule:', scheduleErr);
              // Don't fail the whole operation for schedule errors
            }
          }
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch menu details.');
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [menuId]);

  // Fetch Venues, Categories, and Subcategories when restaurantId changes
   React.useEffect(() => { // Use React.useEffect
    const fetchRelatedData = async () => {
      const currentRestaurantId = formData.restaurantId;
      if (!currentRestaurantId) {
        setAvailableVenues([]);
        setAvailableCategories([]);
        setAvailableSubCategories([]);
        return;
      }

      console.log('Fetching related data for restaurant ID:', currentRestaurantId);
      
      setAvailableVenues([]);
      setAvailableCategories([]);
      setAvailableSubCategories([]);
      setLoadingVenues(true);
      setLoadingCategories(true);
      setLoadingSubCategories(true);

      try {
        // Fetch all data in parallel for better performance
        const [venuesData, categoriesData, subCategoriesData] = await Promise.all([
          venueService.getVenues(currentRestaurantId),
          categoryService.getCategories(),
          subCategoryService.getSubCategories()
        ]);
        
        console.log('Venues data:', venuesData);
        console.log('Categories data:', categoriesData);
        console.log('SubCategories data:', subCategoriesData);
        
        // Process venues
        const venues = Array.isArray(venuesData) ? venuesData : [];
        setAvailableVenues(venues);
        
        // Process categories for the current restaurant
        const allCats = Array.isArray(categoriesData) ? categoriesData : [];
        const filteredCats = allCats.filter((cat: Category) => {
          // Handle both string and object references for restaurantId
          const restId = typeof cat.restaurantId === 'string'
            ? cat.restaurantId
            : (cat.restaurantId && typeof cat.restaurantId === 'object' && '_id' in cat.restaurantId
                ? cat.restaurantId._id
                : null);
          
          console.log(`Category ${cat.name} has restaurantId:`, restId);
          return restId === currentRestaurantId;
        });
        
        console.log('Filtered categories for this restaurant:', filteredCats);
        setAvailableCategories(filteredCats);
        
        // Get IDs of categories for this restaurant
        const restaurantCategoryIds = filteredCats.map((cat: Category) => cat._id);
        console.log('Restaurant category IDs:', restaurantCategoryIds);

        // Process subcategories relevant to the restaurant's categories
        const allSubCats = Array.isArray(subCategoriesData) ? subCategoriesData : [];
        const filteredSubCats = allSubCats.filter((sub: SubCategory) => {
          // Handle both string and object references for category
          const parentCategoryId = typeof sub.category === 'string'
            ? sub.category
            : (sub.category && typeof sub.category === 'object' && '_id' in sub.category
                ? sub.category._id
                : null);
          
          const isIncluded = parentCategoryId && restaurantCategoryIds.includes(parentCategoryId);
          console.log(`SubCategory ${sub.name} has parentCategoryId:`, parentCategoryId, 'included:', isIncluded);
          return isIncluded;
        });
        
        console.log('Filtered subcategories for this restaurant:', filteredSubCats);
        setAvailableSubCategories(filteredSubCats);

        // If we have venues but no venue selected, select the first one
        if (venues.length > 0 && !formData.venueId) {
          console.log('Setting default venue:', venues[0]);
          setFormData(prev => ({
            ...prev,
            venueId: venues[0]._id
          }));
        }

        setError(null);
      } catch (err) {
         console.error('Error fetching related data (venues/cats/subcats):', err);
         setError('Failed to load venues, categories, or subcategories.');
         setAvailableVenues([]);
         setAvailableCategories([]);
         setAvailableSubCategories([]);
      } finally {
         setLoadingVenues(false);
         setLoadingCategories(false);
         setLoadingSubCategories(false);
      }
    };
    
    fetchRelatedData();
  }, [formData.restaurantId]);

  const handleChange = (field: keyof MenuFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const target = event.target as HTMLInputElement;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    if (field !== 'categories' && field !== 'subCategories') {
      setFormData((prev: MenuFormData) => ({ ...prev, [field]: value }));
    }
  };

   const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: MenuFormData) => ({ ...prev, isActive: event.target.checked }));
  };

  // Schedule handlers
  const handleScheduleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnableSchedule(e.target.checked);
  };

  const handleScheduleDayChange = (dayIndex: number, field: keyof DailySchedule, value: any) => {
    setScheduleData((prev: DailySchedule[]) => {
      const newSchedule = [...prev];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        [field]: value
      };
      return newSchedule;
    });
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.restaurantId) {
        setError('Restaurant is required.');
        return;
    }
     if (!formData.name.trim()) {
        setError('Menu name is required.');
        return;
    }

    try {
      setLoading(true);
      const payload: CreateMenuDto | UpdateMenuDto = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        venueId: formData.venueId,
        categories: formData.categories,
        subCategories: formData.subCategories,
        restaurantId: formData.restaurantId,
      };

      let menuId_result = menuId;

      if (menuId) {
        const updatePayload: UpdateMenuDto = {
             name: formData.name,
             description: formData.description,
             isActive: formData.isActive,
             venueId: formData.venueId,
          categories: formData.categories,
          subCategories: formData.subCategories,
        };
        await menuService.updateMenu(menuId, updatePayload);
      } else {
        const newMenu = await menuService.createMenu(payload as CreateMenuDto);
        menuId_result = (newMenu as any)._id || (newMenu as any).id;
      }

      // Handle schedule if enabled
      if (enableSchedule && menuId_result) {
        try {
          if (existingSchedule) {
            // Update existing schedule
            await scheduleService.updateSchedule(existingSchedule._id, {
              dailySchedules: scheduleData,
              isActive: true
            });
          } else {
            // Create new schedule
            const schedulePayload: CreateScheduleRequest = {
              name: `${formData.name} Availability`,
              description: `Availability schedule for ${formData.name} menu`,
              type: 'MENU',
              restaurant: formData.restaurantId,
              menu: menuId_result,
              dailySchedules: scheduleData,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              effectiveFrom: new Date()
            };

            await scheduleService.createSchedule(schedulePayload);
          }
        } catch (scheduleErr) {
          console.error('Error managing schedule:', scheduleErr);
          // Don't throw, just log - menu was created/updated successfully
        }
      } else if (!enableSchedule && existingSchedule) {
        // Deactivate existing schedule
        try {
          await scheduleService.deactivateSchedule(existingSchedule._id);
        } catch (scheduleErr) {
          console.error('Error deactivating schedule:', scheduleErr);
        }
      }

      navigate('/menus/list');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save menu.');
      console.error('Error saving menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      await menuService.deleteMenu(menuId);
      setDeleteDialogOpen(false);
      navigate('/menus/list');
    } catch (err) {
      console.error('Error deleting menu:', err);
      setError('Failed to delete menu.');
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // New handlers for category expansion
  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories((prev: ExpandedState) => ({ // Add type for prev
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Open dialog to add categories
  const handleOpenCategoryDialog = () => {
    setSelectedCategoriesToAdd([]);
    setCategoryDialogOpen(true);
  };

  // Open dialog to add subcategories to a specific category - Now fetches subcategories on demand
  const handleOpenSubcategoryDialog = async (categoryId: string) => {
    setSelectedCategoryForSubcat(categoryId);
    setSelectedSubcategoriesToAdd([]);
    setSubcategoriesForDialog([]); // Clear previous dialog options
    setLoadingSubCategories(true); // Show loading indicator
    setSubcategoryDialogOpen(true); // Open dialog immediately to show loading state

    try {
      // Fetch *all* subcategories - assuming no specific endpoint exists yet
      // TODO: Ideally, replace with a service call like `subCategoryService.getSubCategoriesByCategoryId(categoryId)`
      const allSubCats = await subCategoryService.getSubCategories() as SubCategory[];

      // Filter for the specific category
      const relevantSubCats = (allSubCats || []).filter((sub: SubCategory) => {
        const parentCategoryId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
        return parentCategoryId === categoryId;
      });

      setSubcategoriesForDialog(relevantSubCats); // Set the fetched subcategories for the dialog
      setError(null); // Clear previous errors
    } catch (err) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, err);
      setError(`Failed to load subcategories for the selected category.`);
      setSubcategoriesForDialog([]); // Ensure it's empty on error
      // Keep dialog open to show error or handle differently? For now, it stays open.
    } finally {
      setLoadingSubCategories(false); // Hide loading indicator
    }
  };


  // Add selected categories to the menu
  const handleAddCategories = () => {
    const newCategoryIds = selectedCategoriesToAdd.map((cat: Category) => cat._id); // Add type for cat
    setFormData((prev: MenuFormData) => ({ // Add type for prev
      ...prev,
      categories: [...prev.categories, ...newCategoryIds].filter((v, i, a) => a.indexOf(v) === i) // Ensure uniqueness
    }));
    setCategoryDialogOpen(false);
  };

  // Add selected subcategories to the menu
  const handleAddSubcategories = () => {
    const newSubcategoryIds = selectedSubcategoriesToAdd.map((subcat: SubCategory) => subcat._id); // Add type for subcat
    setFormData((prev: MenuFormData) => ({ // Add type for prev
      ...prev,
      subCategories: [...prev.subCategories, ...newSubcategoryIds].filter((v, i, a) => a.indexOf(v) === i) // Ensure uniqueness
    }));
    setSubcategoryDialogOpen(false);
    setSelectedCategoryForSubcat(null);
  };

  // Remove a category from the menu
  const handleRemoveCategory = (categoryId: string) => {
    setFormData((prev: MenuFormData) => ({ // Add type for prev
      ...prev,
      categories: prev.categories.filter((id: string) => id !== categoryId), // Add type for id
      // Also remove subcategories belonging to this category
      subCategories: prev.subCategories.filter((subId: string) => { // Add type for subId
        const subCategory = availableSubCategories.find((sub: SubCategory) => sub._id === subId); // Add type for sub
        const parentCategoryId = typeof subCategory?.category === 'object' ? subCategory?.category?._id : subCategory?.category;
        return parentCategoryId !== categoryId;
      })
    }));
  };

  // Remove a subcategory from the menu
  const handleRemoveSubcategory = (subcategoryId: string) => {
    setFormData((prev: MenuFormData) => ({ // Add type for prev
      ...prev,
      subCategories: prev.subCategories.filter((id: string) => id !== subcategoryId) // Add type for id
    }));
  };

  // Get subcategories for a specific category that are included in the menu
  // This relies on `availableSubCategories` being populated by the useEffect hook
  const getSubcategoriesForCategory = (categoryId: string): SubCategory[] => {
     return availableSubCategories.filter((subCat: SubCategory) => { // Add type for subCat
         const parentCategoryId = typeof subCat.category === 'object' ? subCat.category?._id : subCat.category;
         return parentCategoryId === categoryId && formData.subCategories.includes(subCat._id);
     });
  };

  // Get available subcategories that can be added to a specific category (Used by Dialog)
  // This function is now effectively replaced by the logic within handleOpenSubcategoryDialog
  // and the filtering within the Dialog's Autocomplete component.
  // We can remove this function or leave it unused. Let's remove it for clarity.
  /*
  const getAvailableSubcategoriesForCategory = (categoryId: string): SubCategory[] => {
     // This logic is now handled by the dialog fetch and Autocomplete options filtering
     return []; // No longer directly used
  };
  */

  // Render the menu categories and subcategories hierarchy
  const renderCategoryHierarchy = () => {
    const menuCategories = availableCategories.filter((cat: Category) => formData.categories.includes(cat._id)); // Add type for cat
 
    if (menuCategories.length === 0) {
      return (
        <Typography color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          No categories have been added to this menu yet.
        </Typography>
      );
    }

    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {menuCategories.map((category: Category) => { // Add type for category
          const isExpanded = expandedCategories[category._id] || false;
          const subcategories = getSubcategoriesForCategory(category._id);
          
          return (
            <React.Fragment key={category._id}>
              <ListItem
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveCategory(category._id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon onClick={() => handleToggleCategory(category._id)} sx={{ cursor: 'pointer' }}>
                  {isExpanded ? <FolderOpenIcon /> : <FolderIcon />}
                </ListItemIcon>
                <ListItemText 
                  primary={category.name}
                  secondary={`${subcategories.length} subcategories`} 
                  onClick={() => handleToggleCategory(category._id)}
                  sx={{ cursor: 'pointer' }}
                />
                <IconButton onClick={() => handleToggleCategory(category._id)}>
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <IconButton onClick={() => handleOpenSubcategoryDialog(category._id)}>
                  <AddIcon />
                </IconButton>
              </ListItem>
              
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {subcategories.length > 0 ? (
                    subcategories.map((subcat: SubCategory) => ( // Add type for subcat
                      <ListItem
                        key={subcat._id}
                        sx={{ pl: 4 }}
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveSubcategory(subcat._id)}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <ClassIcon />
                        </ListItemIcon>
                        <ListItemText primary={subcat.name} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem sx={{ pl: 4 }}>
                      <ListItemText 
                        primary="No subcategories" 
                        primaryTypographyProps={{ color: 'text.secondary', fontStyle: 'italic' }} 
                      />
                    </ListItem>
                  )}
                </List>
              </Collapse>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          );
        })}
      </List>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          {menuId && (
            <Button variant="outlined" color="error" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          )}
        </Box>

        {loading && !restaurants.length && !menuId ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required error={!formData.restaurantId && !!error}>
                <InputLabel>Restaurant</InputLabel>
                <Select
                value={formData.restaurantId}
                label="Restaurant"
                onChange={handleChange('restaurantId')}
                disabled={loadingRestaurants || !!menuId}
                >
                {loadingRestaurants ? (
                    <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                ) : (
                  restaurants.map((r: Restaurant) => (
                    <MenuItem key={r._id} value={r._id}>
                        {r.name}
                    </MenuItem>
                    ))
                )}
                </Select>
                 {!formData.restaurantId && !!error && <Typography color="error" variant="caption">Restaurant is required</Typography>}
            </FormControl>

            <TextField
                required
                label="Menu Name"
                value={formData.name}
                onChange={handleChange('name')}
                fullWidth
                error={!formData.name.trim() && !!error}
                helperText={!formData.name.trim() && !!error ? 'Name is required' : ''}
            />

            <FormControl fullWidth required error={!formData.venueId && !!error}>
                <InputLabel>Venue</InputLabel>
                <Select
                    value={formData.venueId}
                    label="Venue"
                    onChange={handleChange('venueId')}
                disabled={loadingVenues || !formData.restaurantId}
                >
                    {loadingVenues ? (
                        <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                    ) : (
                  availableVenues.map((v: Venue) => (
                            <MenuItem key={v._id} value={v._id}>
                                {v.name}
                            </MenuItem>
                        ))
                    )}
                     {availableVenues.length === 0 && !loadingVenues && formData.restaurantId && (
                         <MenuItem value="" disabled>No venues found for this restaurant</MenuItem>
                     )}
                </Select>
                 {!formData.venueId && !!error && <Typography color="error" variant="caption">Venue is required</Typography>}
            </FormControl>

            <TextField
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                fullWidth
                multiline
                rows={3}
            />

            <FormControlLabel
                control={
                <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                />
                }
                label="Active"
            />

            {/* Category Hierarchy Section */}
            <Box sx={{ mt: 3, mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Menu Structure</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  onClick={handleOpenCategoryDialog}
                  disabled={!formData.restaurantId || loadingCategories}
                >
                  Add Categories
                </Button>
              </Box>
              
              {loadingCategories || loadingSubCategories ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                renderCategoryHierarchy()
              )}
            </Box>

            {/* Schedule Configuration */}
            <Box sx={{ mt: 3 }}>
              <Card>
                <CardHeader 
                  title="Menu Schedule"
                  subheader="Configure when this menu is available"
                  action={
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableSchedule}
                          onChange={handleScheduleToggle}
                        />
                      }
                      label="Enable Schedule"
                    />
                  }
                />
                {enableSchedule && (
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      When this menu is not available, all items in this menu will be hidden from customers.
                    </Typography>
                    <Grid container spacing={2}>
                      {scheduleData.map((day: DailySchedule, index: number) => (
                        <Grid item xs={12} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography sx={{ width: 100 }}>{getDayName(day.dayOfWeek)}</Typography>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={day.isOpen}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleDayChange(index, 'isOpen', e.target.checked)}
                                />
                              }
                              label="Available"
                              sx={{ mr: 2 }}
                            />
                            {day.isOpen && (
                              <>
                                <TextField
                                  type="time"
                                  label="From"
                                  value={day.openTime}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleDayChange(index, 'openTime', e.target.value)}
                                  size="small"
                                  sx={{ width: 150 }}
                                />
                                <TextField
                                  type="time"
                                  label="Until"
                                  value={day.closeTime}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleDayChange(index, 'closeTime', e.target.value)}
                                  size="small"
                                  sx={{ width: 150 }}
                                />
                              </>
                            )}
                          </Box>
                          {index < scheduleData.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                )}
              </Card>
            </Box>

            {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                {error}
                </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
                Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </Box>
            </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this menu? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" disabled={loading}>
             {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Categories Dialog */}
      <Dialog open={categoryDialogOpen} onClose={() => setCategoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Categories to Menu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select categories to add to this menu:
          </DialogContentText>
          <Autocomplete
            multiple
            id="add-categories-autocomplete"
            options={availableCategories.filter((cat: Category) => !formData.categories.includes(cat._id))} // Add type for cat
            value={selectedCategoriesToAdd}
            getOptionLabel={(option: Category) => option.name} // Add type for option
            isOptionEqualToValue={(option: Category, value: Category) => option._id === value._id} // Add types
            onChange={(_, newValue: Category[]) => setSelectedCategoriesToAdd(newValue)} // Add type for newValue
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Available Categories"
                placeholder="Select categories to add"
                fullWidth
                margin="normal"
              />
            )}
            renderTags={(tagValue: Category[], getTagProps) => // Add type for tagValue
              tagValue.map((option: Category, index: number) => ( // Add type for option
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option._id}
                  icon={<CategoryIcon />}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCategories} 
            variant="contained" 
            color="primary"
            disabled={selectedCategoriesToAdd.length === 0}
          >
            Add Categories
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Subcategories Dialog */}
      <Dialog open={subcategoryDialogOpen} onClose={() => setSubcategoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Add Subcategories to {selectedCategoryForSubcat ? // Add type for cat
            availableCategories.find((cat: Category) => cat._id === selectedCategoryForSubcat)?.name : ''}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select subcategories to add to this category:
          </DialogContentText>
          {loadingSubCategories ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
          ) : error ? (
             <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>
          ) : (
            <Autocomplete
              multiple
              id="add-subcategories-autocomplete"
              // Use the state variable holding specifically fetched subcategories
              options={subcategoriesForDialog.filter(
                (sub: SubCategory) => !formData.subCategories.includes(sub._id) // Filter out already added ones
              )}
              value={selectedSubcategoriesToAdd}
              getOptionLabel={(option: SubCategory) => option.name} // Add type for option
              isOptionEqualToValue={(option: SubCategory, value: SubCategory) => option._id === value._id} // Add types
           onChange={(_, newValue: SubCategory[]) => setSelectedSubcategoriesToAdd(newValue)} // Add type for newValue
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Available Subcategories"
                placeholder="Select subcategories to add"
                fullWidth
                margin="normal"
              />
            )}
            renderTags={(tagValue: SubCategory[], getTagProps) => // Add type for tagValue
              tagValue.map((option: SubCategory, index: number) => ( // Add type for option
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option._id}
                  icon={<ClassIcon />}
                />
              ))
            }
          />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSubcategoryDialogOpen(false); setError(null); /* Clear error on close */ }}>Cancel</Button>
          <Button 
            onClick={handleAddSubcategories} 
            variant="contained" 
            color="primary"
            disabled={selectedSubcategoriesToAdd.length === 0}
          >
            Add Subcategories
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuForm;
