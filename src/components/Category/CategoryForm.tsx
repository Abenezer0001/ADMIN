import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent, // Import SelectChangeEvent
} from '@mui/material';
import { categoryService, CreateCategoryDto, UpdateCategoryDto, Category } from '../../services/CategoryService'; // Assuming Category type exists
import { restaurantService, Restaurant } from '../../services/RestaurantService';

interface CategoryFormData {
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
  restaurantId: string;
}

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = React.useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
    isActive: true,
    order: 0,
    restaurantId: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = React.useState(false);
  const isEditMode = Boolean(id);

  React.useEffect(() => {
    fetchRestaurants();
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      console.log('Fetching restaurants...');
      const data = await restaurantService.getRestaurants();
      console.log('Restaurants data received:', data);
      
      // Type guard to ensure data is an array of Restaurants
      if (Array.isArray(data)) {
        setRestaurants(data);
        console.log('Restaurants set in state:', data);
        
        // If in create mode and we have restaurants, set the first one as default
        if (!id && data.length > 0 && !formData.restaurantId) {
          console.log('Setting default restaurant:', data[0]);
          setFormData((prev: CategoryFormData) => ({ 
            ...prev, 
            restaurantId: data[0]._id 
          }));
        }
      } else {
        // Handle cases where data is not the expected array format
        console.error('Received unexpected data format for restaurants:', data);
        setRestaurants([]); // Set to empty array or handle error appropriately
        setError('Failed to load restaurants due to unexpected data format.');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurants');
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const category: Category | any = await categoryService.getCategory(id!); // Type category (use any as fallback)
      // Ensure category is an object before spreading and accessing properties
      if (typeof category === 'object' && category !== null) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          image: category.image || '',
          isActive: category.isActive !== undefined ? category.isActive : true,
          order: category.order || 0,
          restaurantId: typeof category.restaurantId === 'object' && category.restaurantId !== null
            ? category.restaurantId._id
            : category.restaurantId || '',
        });
      } else {
         setError('Failed to parse category data');
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to fetch category details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurantId) {
      setError('Restaurant is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        order: Number(formData.order) || 0,
      };

      if (id) {
        await categoryService.updateCategory(id, payload as UpdateCategoryDto);
      } else {
        await categoryService.createCategory(payload as CreateCategoryDto);
      }

      navigate('/categories');
    } catch (error: any) {
      console.error('Error saving category:', error);
      setError(error?.response?.data?.error || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

const handleChange = (field: keyof CategoryFormData) => (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
) => {
  // Handle Select change specifically for restaurantId
  if (field === 'restaurantId') {
    // Check if it's a SelectChangeEvent by looking for target.value
    // Ensure event and event.target are not null before accessing properties
    if (event && event.target && 'value' in event.target) {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        restaurantId: value,
      }));
    }
    return; // Prevent falling through to the next block
  }

  // Handle Switch change specifically for isActive
  // Ensure event and event.target are not null before accessing properties
  if (field === 'isActive' && event && event.target && 'checked' in event.target) {
     const target = event.target as HTMLInputElement; // Switch behaves like checkbox input
     const value = target.checked;
     setFormData((prev) => ({
       ...prev,
       isActive: value,
     }));
     return; // Prevent falling through
  }

  // Handle other standard input/textarea changes
  // Ensure event and event.target are not null before accessing properties
  if (event && event.target && 'value' in event.target) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    let value: string | number = target.value;

    // Ensure 'order' is stored as a number
    if (field === 'order') {
      value = Number(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }
};

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {id ? 'Edit Category' : 'Add Category'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required error={!formData.restaurantId && !!error}>
                  <InputLabel>Restaurant</InputLabel>
                  <Select
                    value={formData.restaurantId}
                    label="Restaurant"
                    onChange={handleChange('restaurantId')}
                    disabled={loadingRestaurants}
                  >
                    {loadingRestaurants ? (
                      <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                    ) : (
                      restaurants.map((restaurant: Restaurant) => ( // Type restaurant
                        <MenuItem key={restaurant._id} value={restaurant._id}>
                          {restaurant.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {!formData.restaurantId && !!error && 
                    <Typography color="error" variant="caption">Restaurant is required</Typography>
                  }
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL (Optional)"
                  value={formData.image || ''}
                  onChange={handleChange('image')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Order"
                  type="number"
                  value={formData.order}
                  onChange={handleChange('order')}
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleChange('isActive')}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'primary.main',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'primary.main',
                        },
                      }}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/categories')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || loadingRestaurants}
                  >
                    {loading ? <CircularProgress size={24} /> : (id ? 'Update' : 'Create')} Category
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CategoryForm;

