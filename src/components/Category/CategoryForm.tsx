import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  Switch, 
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import { ArrowBack, Save, Schedule as ScheduleIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { categoryService } from '../../services/CategoryService';
import { scheduleService, Schedule, DailySchedule, CreateScheduleRequest } from '../../services/ScheduleService';

interface CategoryFormData {
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
  restaurantId: string;
}

const CategoryForm = () => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image: '',
    isActive: true,
    order: 0,
    restaurantId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Schedule state
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState<Schedule | null>(null);
  const [scheduleData, setScheduleData] = useState<DailySchedule[]>([
    { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '22:00' }, // Sunday
    { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Monday
    { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Tuesday
    { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Wednesday
    { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Thursday
    { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Friday
    { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '23:00' },  // Saturday
  ]);

  const fetchRestaurants = async () => {
    try {
      const response = await axiosInstance.get('/restaurants');
      const data = response.data;
      const restaurantsList = Array.isArray(data.data) ? data.data : data.restaurants || data || [];
      setRestaurants(restaurantsList);
      
      if (restaurantsList.length > 0 && !formData.restaurantId) {
        setFormData(prev => ({ ...prev, restaurantId: restaurantsList[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurants');
    }
  };
  
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchCategory = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const category = await categoryService.getCategory(id);
      setFormData({
        name: category.name,
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive !== undefined ? category.isActive : true,
        order: category.order || 0,
        restaurantId: category.restaurantId || ''
      });

      // Check for existing schedule
      const schedules = await scheduleService.getAllSchedules({
        type: 'CATEGORY',
        category: id
      });

      console.log('Fetched category schedules:', schedules);

      if (schedules && schedules.length > 0) {
        const categorySchedule = schedules[0];
        setExistingSchedule(categorySchedule);
        setEnableSchedule(true);
        
        console.log('Found existing category schedule:', categorySchedule);
        
        // Convert backend schedule format to frontend format
        // Backend uses 'dailySchedule' (singular), not 'dailySchedules' (plural)
        const dailyScheduleData = (categorySchedule as any).dailySchedule || (categorySchedule as any).dailySchedules;
        
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
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to load category details');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      if (!formData.restaurantId) {
        setError('Please select a restaurant');
        return;
      }
      
      let categoryId = id;
      
      if (id) {
        await categoryService.updateCategory(id, formData);
      } else {
        const response = await categoryService.createCategory(formData);
        categoryId = response._id;
      }

      // Handle schedule if enabled
      if (enableSchedule && categoryId && formData.restaurantId) {
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
              description: `Availability schedule for ${formData.name} category`,
              type: 'CATEGORY',
              restaurant: formData.restaurantId,
              category: categoryId,
              dailySchedules: scheduleData,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              effectiveFrom: new Date()
            };

            await scheduleService.createSchedule(schedulePayload);
          }
        } catch (scheduleErr) {
          console.error('Error managing schedule:', scheduleErr);
          // Don't throw, just log - category was created/updated successfully
        }
      } else if (!enableSchedule && existingSchedule) {
        // Deactivate existing schedule
        try {
          await scheduleService.deactivateSchedule(existingSchedule._id);
        } catch (scheduleErr) {
          console.error('Error deactivating schedule:', scheduleErr);
        }
      }
      
      navigate('/categories');
    } catch (error: any) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CategoryFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [field]: field === 'order' ? parseInt(value) || 0 : value
    });
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

  if (loading && id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/categories')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {id ? 'Edit Category' : 'Create New Category'}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Restaurant</InputLabel>
                <Select
                  value={formData.restaurantId}
                  label="Restaurant"
                  onChange={handleChange('restaurantId') as (event: SelectChangeEvent) => void}
                >
                  {restaurants.map((restaurant) => (
                    <MenuItem key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={handleChange('image')}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Display Order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleChange('order')}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            {/* Schedule Configuration */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Card>
                <CardHeader 
                  title="Category Schedule"
                  subheader="Configure when items in this category are available"
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
                      When the category is not available, all items in this category will be hidden from customers.
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
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/categories')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={<Save />}
                >
                  {loading ? <CircularProgress size={24} /> : (id ? 'Update' : 'Create')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CategoryForm;

