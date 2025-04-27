import React from 'react'; // Use default import
import {
  Box, Paper, Typography, TextField, Button, IconButton, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Card,
  CardMedia, Switch, FormControlLabel, CircularProgress, FormControl,
  InputLabel, Select, MenuItem as MuiMenuItem, SelectChangeEvent,
  Autocomplete, Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Upload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { menuItemService, MenuItem as MenuItemData, CreateMenuItemDto, UpdateMenuItemDto } from '../../services/MenuItemService';
import { restaurantService, Restaurant } from '../../services/RestaurantService';
import { categoryService, Category } from '../../services/CategoryService';
import { subCategoryService, SubCategory } from '../../services/SubCategoryService';
import { subSubCategoryService, SubSubCategory } from '../../services/SubSubCategoryService';
import { venueService, Venue } from '../../services/VenueService';

// Simplified form data state matching DTOs + necessary UI state
interface MenuItemFormData {
  name: string;
  description: string;
  price: number | string; // Use string for input, convert on save
  preparationTime: number | string; // Use string for input, convert on save
  image?: string; // URL or empty string
  subSubCategory: string; // ID of the SubSubCategory
  categories: string[]; // Array of Category IDs
  subCategories: string[]; // Array of SubCategory IDs
  restaurantId: string; // ID of the Restaurant
  venueId: string; // ID of the Venue
  isAvailable: boolean;
  isActive: boolean;
  // Add allergens, nutritionalInfo if needed later
}

const initialForm: MenuItemFormData = {
  name: '',
  description: '',
  price: '',
  preparationTime: '',
  image: '',
  subSubCategory: '',
  categories: [],
  subCategories: [],
  restaurantId: '',
  venueId: '',
  isAvailable: true,
  isActive: true,
};

const MenuItems = () => {
  const { id: menuItemId } = useParams<{ id: string }>(); // Rename id to menuItemId for clarity
  const navigate = useNavigate();
  const isEditMode = menuItemId && menuItemId !== 'new';

  const [form, setForm] = React.useState<MenuItemFormData>(initialForm); // Use React.useState
  const [imagePreview, setImagePreview] = React.useState<string>(''); // Use React.useState
  const [imageFile, setImageFile] = React.useState<File | null>(null); // Use React.useState
  const [removeCurrentImage, setRemoveCurrentImage] = React.useState<boolean>(false); // Use React.useState
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false); // Use React.useState
  const [loading, setLoading] = React.useState(false); // Use React.useState
  const [error, setError] = React.useState<string | null>(null); // Use React.useState

  // Data for dropdowns
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]); // Use React.useState
  const [venues, setVenues] = React.useState<Venue[]>([]); // Use React.useState
  const [categories, setCategories] = React.useState<Category[]>([]); // Use React.useState
  const [subCategories, setSubCategories] = React.useState<SubCategory[]>([]); // Use React.useState
  const [subSubCategories, setSubSubCategories] = React.useState<SubSubCategory[]>([]); // Use React.useState
  const [loadingFilters, setLoadingFilters] = React.useState(true); // Use React.useState

  // Filtered options based on selections
  const [filteredVenues, setFilteredVenues] = React.useState<Venue[]>([]); // Use React.useState
  const [filteredCategories, setFilteredCategories] = React.useState<Category[]>([]); // Use React.useState
  const [filteredSubCategories, setFilteredSubCategories] = React.useState<SubCategory[]>([]); // Use React.useState
  const [filteredSubSubCategories, setFilteredSubSubCategories] = React.useState<SubSubCategory[]>([]); // Use React.useState
  const [loadingSubCategories, setLoadingSubCategories] = React.useState(false); // Use React.useState
  const [loadingSubSubCategories, setLoadingSubSubCategories] = React.useState(false); // Use React.useState

  // Fetch restaurants
  React.useEffect(() => { // Use React.useEffect
    const fetchRestaurants = async () => {
      try {
        setLoadingFilters(true);
        const data = await restaurantService.getRestaurants();
        const restaurantList = Array.isArray(data) ? data : [];
        setRestaurants(restaurantList);
        
        // If creating new and data is available, select first restaurant
        if (!isEditMode && restaurantList.length > 0 && !form.restaurantId) {
          setForm((prev: MenuItemFormData) => ({ ...prev, restaurantId: restaurantList[0]._id }));
        }
      } catch (err) {
        console.error('Error loading restaurants:', err);
        setError('Failed to load restaurants.');
      } finally {
        setLoadingFilters(false);
      }
    };
    fetchRestaurants();
  }, [isEditMode]); 

  // Fetch venues and categories when restaurant changes
  React.useEffect(() => { // Use React.useEffect
    const fetchRelatedData = async () => {
      if (!form.restaurantId) {
        setVenues([]);
        setCategories([]);
        setSubCategories([]);
        setSubSubCategories([]);
        setFilteredVenues([]);
        setFilteredCategories([]);
        setFilteredSubCategories([]);
        setFilteredSubSubCategories([]);
        return;
      }

      setLoadingFilters(true);
      try {
        console.log('Fetching data for restaurant:', form.restaurantId);
        
        // Fetch venues and categories for the selected restaurant
        // Use the API's filtering capability to get only relevant categories
        const [venuesData, categoriesData] = await Promise.all([
          venueService.getVenues(form.restaurantId),
          categoryService.getCategories(form.restaurantId) // Pass restaurantId directly to the API
        ]);

        console.log('Venues data:', venuesData);
        console.log('Categories data:', categoriesData);

        const allVenues = Array.isArray(venuesData) ? venuesData : [];
        const restaurantCategories = Array.isArray(categoriesData) ? categoriesData : [];
        
        console.log('Restaurant categories:', restaurantCategories);
        setCategories(restaurantCategories);
        setFilteredCategories(restaurantCategories);

        // Set venues for the restaurant
        setVenues(allVenues);
        setFilteredVenues(allVenues);

        // If no venue is selected yet, select the first one
        if (allVenues.length > 0 && !form.venueId) {
          setForm((prev: MenuItemFormData) => ({ ...prev, venueId: allVenues[0]._id }));
        }
      } catch (err) {
        console.error('Error loading restaurant data:', err);
        setError('Failed to load data for selected restaurant.');
      } finally {
        setLoadingFilters(false);
      }
    };
    
    fetchRelatedData();
  }, [form.restaurantId]); 

  // Fetch subcategories when categories are selected
  React.useEffect(() => { // Use React.useEffect
    const fetchSubCategories = async () => {
      // Clear previous subcategories when categories change
      setFilteredSubCategories([]);
      setSubCategories([]);
      setForm(prev => ({ ...prev, subCategories: [], subSubCategory: '' }));
      
      if (form.categories.length === 0) {
        return; // Don't fetch if no categories selected
      }
      
      try {
        setLoadingSubCategories(true);
        console.log('Fetching subcategories for categories:', form.categories);
        
        // Fetch subcategories for each selected category and combine results
        const subCategoryPromises = form.categories.map(categoryId => 
          subCategoryService.getSubCategories(categoryId)
        );
        
        const results = await Promise.all(subCategoryPromises);
        // Flatten the array of arrays and remove duplicates
        const allSubCategories = results.flat().filter((subCat, index, self) => 
          index === self.findIndex(s => s._id === subCat._id)
        );
        
        console.log('Fetched subcategories:', allSubCategories);
        setSubCategories(allSubCategories);
        setFilteredSubCategories(allSubCategories);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setError('Failed to load subcategories for selected categories.');
      } finally {
        setLoadingSubCategories(false);
      }
    };
    
    fetchSubCategories();
  }, [form.categories]); // Only depend on categories

  // Fetch sub-subcategories when subcategories are selected
  React.useEffect(() => { // Use React.useEffect
    const fetchSubSubCategories = async () => {
      // Clear previous subsubcategories when subcategories change
      setFilteredSubSubCategories([]);
      setSubSubCategories([]);
      setForm(prev => ({ ...prev, subSubCategory: '' }));
      
      if (form.subCategories.length === 0) {
        return; // Don't fetch if no subcategories selected
      }
      
      try {
        setLoadingSubSubCategories(true);
        console.log('Fetching subsubcategories for subcategories:', form.subCategories);
        
        // Fetch subsubcategories for each selected subcategory and combine results
        const subSubCategoryPromises = form.subCategories.map(subCategoryId => 
          subSubCategoryService.getSubSubCategories(subCategoryId)
        );
        
        const results = await Promise.all(subSubCategoryPromises);
        // Flatten the array of arrays and remove duplicates
        const allSubSubCategories = results.flat().filter((subSubCat, index, self) => 
          index === self.findIndex(s => s._id === subSubCat._id)
        );
        
        console.log('Fetched subsubcategories:', allSubSubCategories);
        setSubSubCategories(allSubSubCategories);
        setFilteredSubSubCategories(allSubSubCategories);
      } catch (error) {
        console.error('Error fetching subsubcategories:', error);
        setError('Failed to load subsubcategories for selected subcategories.');
      } finally {
        setLoadingSubSubCategories(false);
      }
    };
    
    fetchSubSubCategories();
  }, [form.subCategories]); // Only depend on subcategories

  // Fetch menu item data if in edit mode
  React.useEffect(() => { // Use React.useEffect
    const loadMenuItem = async () => {
      if (!isEditMode || !menuItemId) return;

      setLoading(true);
      try {
        const data: MenuItemData = await menuItemService.getMenuItem(menuItemId);
        setForm({
          name: data.name,
          description: data.description || '',
          price: data.price,
          preparationTime: data.preparationTime,
          image: data.image || '',
          // Handle populated vs non-populated subSubCategory
          subSubCategory: typeof data.subSubCategory === 'object' && data.subSubCategory?._id 
            ? data.subSubCategory._id 
            : (typeof data.subSubCategory === 'string' ? data.subSubCategory : ''),
          // Extract category and subcategory arrays
          categories: Array.isArray(data.categories) 
            ? data.categories.map((cat: string | Category) => typeof cat === 'string' ? cat : cat._id) 
            : [],
          subCategories: Array.isArray(data.subCategories) 
            ? data.subCategories.map((subCat: string | SubCategory) => typeof subCat === 'string' ? subCat : subCat._id) 
            : [],
          restaurantId: typeof data.restaurantId === 'string' 
            ? data.restaurantId 
            : data.restaurantId, // Assuming restaurantId is always string from backend
          venueId: typeof data.venueId === 'string' 
            ? data.venueId 
            : data.venueId._id, // Assuming venueId can be populated
          isAvailable: data.isAvailable,
          isActive: data.isActive,
        });
        setImagePreview(data.image || '');
        setImageFile(null); // Reset file input on load
        setError(null);
      } catch (error) {
        console.error('Error loading menu item:', error);
        setError('Failed to load menu item data.');
      } finally {
        setLoading(false);
      }
    };
    loadMenuItem();
  }, [menuItemId, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { // Use React.ChangeEvent
    const { name, value, type } = e.target;
    setForm((prev: MenuItemFormData) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm((prev: MenuItemFormData) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Use React.ChangeEvent
    const { name, checked } = e.target;
    setForm((prev: MenuItemFormData) => ({ ...prev, [name]: checked }));
  };

  const handleCategoriesChange = (_event: React.SyntheticEvent, newValue: Category[]) => { // Use React.SyntheticEvent
    setForm((prev: MenuItemFormData) => ({
      ...prev,
      categories: newValue.map((cat: Category) => cat._id),
      // Clear subcategories when categories change to avoid inconsistencies
      subCategories: [],
      // Clear subSubCategory when categories change
      subSubCategory: ''
    }));
  };

  const handleSubCategoriesChange = (_event: React.SyntheticEvent, newValue: SubCategory[]) => { // Use React.SyntheticEvent
    setForm((prev: MenuItemFormData) => ({
      ...prev,
      subCategories: newValue.map((subCat: SubCategory) => subCat._id),
      // Clear subSubCategory when subcategories change
      subSubCategory: ''
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Use React.ChangeEvent
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // Don't update form.image here, handle it during save with FormData
        setRemoveCurrentImage(false); // If a new image is selected, we are not removing the current one (we're replacing)
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setRemoveCurrentImage(true); // Mark that the image should be removed on update
  };

  const handleDelete = async () => {
    if (!menuItemId) return;
    try {
      setLoading(true);
      await menuItemService.deleteMenuItem(menuItemId);
      setDeleteDialogOpen(false);
      navigate('/menu/items');
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item.');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    
    // Basic Validation - SubSubCategory is now optional
    if (!form.name.trim() || !form.restaurantId || !form.venueId || form.categories.length === 0 || form.subCategories.length === 0 ||
        form.price === '' || form.preparationTime === '') {
      setError('Please fill in all required fields (Name, Restaurant, Venue, Categories, Subcategories, Price, Prep Time).');
      return;
    }
    
    const priceNum = parseFloat(String(form.price));
    const prepTimeNum = parseInt(String(form.preparationTime), 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setError('Please enter a valid non-negative price.');
      return;
    }
    
    if (isNaN(prepTimeNum) || prepTimeNum < 0) {
      setError('Please enter a valid non-negative preparation time.');
      return;
    }

    setLoading(true);
    try {
      // Use FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', String(priceNum));
      formData.append('preparationTime', String(prepTimeNum));
      if (form.subSubCategory) { // Only append if a sub-subcategory is selected
        formData.append('subSubCategory', form.subSubCategory); 
      }
      form.categories.forEach((catId: string) => formData.append('categories[]', catId)); 
      form.subCategories.forEach((subCatId: string) => formData.append('subCategories[]', subCatId)); // Send as array
      formData.append('venueId', form.venueId);
      formData.append('isAvailable', String(form.isAvailable));
      formData.append('isActive', String(form.isActive));
      
      // Handle image: append file if new one selected, send empty string if removed, otherwise don't send
      if (imageFile) {
        formData.append('image', imageFile); // Backend expects 'image' key
      } else if (isEditMode && removeCurrentImage) {
        formData.append('image', ''); // Signal backend to remove image
      }
      // If !imageFile && !(isEditMode && removeCurrentImage), don't append 'image' - backend keeps existing one

      if (isEditMode && menuItemId) {
        // Update requires restaurantId in the payload for backend validation/association
        formData.append('restaurantId', form.restaurantId);
        await menuItemService.updateMenuItem(menuItemId, formData); // Send FormData
      } else {
        // Create requires restaurantId
        formData.append('restaurantId', form.restaurantId);
        await menuItemService.createMenuItem(formData); // Send FormData
      }
      navigate('/menu/items');
    } catch (error: any) {
      console.error('Error saving item:', error);
      setError(error?.response?.data?.error || 'Failed to save menu item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/menu/items')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" sx={{ ml: 2 }}>
            {isEditMode ? `Edit: ${form.name || 'Menu Item'}` : 'New Menu Item'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEditMode && (
            <Tooltip title="Delete item">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={loading}
              >
                Delete
              </Button>
            </Tooltip>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading || loadingFilters}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Box>
      </Box>

      {loading && isEditMode ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ p: 3 }}>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Grid container spacing={3}>
            {/* Image Upload */}
            <Grid item xs={12} sm={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={imagePreview || '/placeholder-food.jpg'}
                  alt="Item image preview"
                  sx={{ objectFit: 'contain' }}
                />
                <Box sx={{ p: 1, textAlign: 'center' }}>
                  <input accept="image/*" style={{ display: 'none' }} id="image-upload" type="file" onChange={handleImageChange} />
                  <label htmlFor="image-upload">
                    <Button fullWidth size="small" variant="outlined" component="span" startIcon={<UploadIcon />}>
                      Upload Image
                    </Button>
                  </label>
                  {/* Remove Image Button - only show if there's an image preview and in edit mode */}
                  {isEditMode && imagePreview && (
                    <Button
                      fullWidth
                      size="small"
                      variant="text"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveImage}
                      sx={{ mt: 1 }}
                    >
                      Remove Image
                    </Button>
                  )}
                  {/* Keep URL field for potential future use or display, but disable direct editing if file is primary */}
                  {/* <TextField
                    label="Image URL (Display Only)"
                    name="image"
                    value={imagePreview} // Show preview URL or original URL
                    // onChange={handleInputChange} // Disable direct editing
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="Upload or paste URL"
                    InputProps={{
                      readOnly: true, // Make it read-only
                    }}
                  /> */}
                </Box>
              </Card>
            </Grid>

            {/* Main Fields */}
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth 
                    required 
                    label="Item Name" 
                    name="name"
                    value={form.name} 
                    onChange={handleInputChange}
                    error={!form.name.trim() && !!error}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth 
                    multiline 
                    rows={3} 
                    label="Description" 
                    name="description"
                    value={form.description} 
                    onChange={handleInputChange}
                  />
                </Grid>
                
                {/* Restaurant Selection */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!form.restaurantId && !!error}>
                    <InputLabel>Restaurant</InputLabel>
                    <Select
                      name="restaurantId" 
                      label="Restaurant"
                      value={form.restaurantId} 
                      onChange={handleSelectChange}
                      disabled={loadingFilters || isEditMode} 
                    >
                      {restaurants.map((r: Restaurant) => (
                        <MuiMenuItem key={r._id} value={r._id}>{r.name}</MuiMenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Venue Selection */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!form.venueId && !!error}>
                    <InputLabel>Venue</InputLabel>
                    <Select
                      name="venueId" 
                      label="Venue"
                      value={form.venueId} 
                      onChange={handleSelectChange}
                      disabled={loadingFilters || filteredVenues.length === 0 || !form.restaurantId}
                    >
                      {filteredVenues.map((venue: Venue) => (
                        <MuiMenuItem key={venue._id} value={venue._id}>{venue.name}</MuiMenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Category Selection */}
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={filteredCategories || []}
                    getOptionLabel={(option: Category) => option.name}
                    // Value prop: Find category objects from the *unfiltered* list matching the IDs in form state
                    value={form.categories.map((id: string) => categories.find((cat: Category) => cat._id === id)).filter(Boolean) as Category[]}
                    onChange={handleCategoriesChange}
                    isOptionEqualToValue={(option, value) => option._id === value._id} // Compare objects by ID
                    disabled={loadingFilters || categories.length === 0} // Disable if the base list is empty
                    renderTags={(value: readonly Category[], getTagProps) =>
                      value.map((option: Category, index: number) => (
                        <Chip label={option.name} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categories"
                        placeholder={filteredCategories.length === 0 ? "Select restaurant first" : "Select categories"} 
                        required
                        error={form.categories.length === 0 && !!error}
                      />
                    )}
                  />
                </Grid>

                {/* SubCategory Selection */}
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={filteredSubCategories || []}
                    getOptionLabel={(option: SubCategory) => option.name}
                    // Value prop: Find subcategory objects from the *unfiltered* list matching the IDs in form state
                    value={form.subCategories
                      .map((id: string) => {
                        const found = subCategories.find((subCat: SubCategory) => subCat._id === id);
                        return found || null;
                      })
                      .filter((item: SubCategory | null): item is SubCategory => item !== null)
                    }
                    onChange={handleSubCategoriesChange}
                    isOptionEqualToValue={(option, value) => option._id === value._id} // Compare objects by ID
                    disabled={loadingFilters || loadingSubCategories || form.categories.length === 0} // Disable during loading
                    loading={loadingSubCategories}
                    renderTags={(value: readonly SubCategory[], getTagProps) =>
                      value.map((option: SubCategory, index: number) => (
                        <Chip label={option.name} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subcategories"
                        placeholder={form.categories.length === 0 
                          ? "Select categories first" 
                          : loadingSubCategories 
                            ? "Loading subcategories..." 
                            : filteredSubCategories.length === 0 
                              ? "No subcategories found" 
                              : "Select subcategories"} 
                        required
                        error={form.subCategories.length === 0 && !!error} // Keep validation for required field
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loadingSubCategories ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                {/* Sub-Subcategory Selection (Now Optional) */}
                <Grid item xs={12}>
                  <FormControl fullWidth
                    disabled={loadingFilters || loadingSubSubCategories || form.subCategories.length === 0}
                  >
                    <InputLabel>Sub-Subcategory (Optional)</InputLabel>
                    <Select
                      name="subSubCategory" 
                      label="Sub-Subcategory (Optional)"
                      value={form.subSubCategory} 
                      onChange={handleSelectChange}
                      displayEmpty
                    >
                      <MuiMenuItem value=""><em>None</em></MuiMenuItem>
                      {loadingSubSubCategories ? (
                        <MuiMenuItem disabled>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <span>Loading sub-subcategories...</span>
                          </Box>
                        </MuiMenuItem>
                      ) : filteredSubSubCategories.length === 0 && form.subCategories.length > 0 ? (
                        <MuiMenuItem disabled>
                          <em>No sub-subcategories found</em>
                        </MuiMenuItem>
                      ) : (
                        filteredSubSubCategories.map((subSubCat: SubSubCategory) => (
                          <MuiMenuItem key={subSubCat._id} value={subSubCat._id}>{subSubCat.name}</MuiMenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Price and Prep Time */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth 
                    required 
                    label="Price (£)" 
                    name="price"
                    type="number"
                    value={form.price} 
                    onChange={handleInputChange}
                    error={form.price === '' && !!error}
                    InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth 
                    required 
                    label="Prep Time (mins)" 
                    name="preparationTime"
                    type="number"
                    value={form.preparationTime} 
                    onChange={handleInputChange}
                    error={form.preparationTime === '' && !!error}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                {/* Toggles */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: form.isAvailable ? 'rgba(46, 125, 50, 0.08)' : 'background.paper'
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">Available for Ordering</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {form.isAvailable ? 'Item is available to order' : 'Item is not available to order'}
                      </Typography>
                    </Box>
                    <Switch 
                      checked={form.isAvailable} 
                      onChange={handleSwitchChange} 
                      name="isAvailable"
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          '&.Mui-checked': {
                            color: '#2e7d32',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          },
                        },
                        '& .MuiSwitch-thumb': {
                          boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
                        },
                        '& .MuiSwitch-track': {
                          borderRadius: 26 / 2,
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: form.isActive ? 'rgba(25, 118, 210, 0.08)' : 'background.paper'
                  }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">Active</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {form.isActive ? 'Visible in admin panel' : 'Hidden in admin panel'}
                      </Typography>
                    </Box>
                    <Switch 
                      checked={form.isActive} 
                      onChange={handleSwitchChange} 
                      name="isActive"
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          '&.Mui-checked': {
                            color: '#1976d2',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#42a5f5',
                            },
                          },
                        },
                        '& .MuiSwitch-thumb': {
                          boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
                        },
                        '& .MuiSwitch-track': {
                          borderRadius: 26 / 2,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this menu item?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuItems;
