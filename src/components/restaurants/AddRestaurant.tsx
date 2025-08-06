import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControlLabel,
  Switch,
  Slider,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import axiosInstance from '../../utils/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import CityAutocomplete, { City } from './CityAutocomplete';
import AddressAutocomplete from './AddressAutocomplete';
import RestaurantMap from './RestaurantMap';
import { scheduleService, Schedule, DailySchedule, CreateScheduleRequest } from '../../services/ScheduleService';

interface Location {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface RestaurantFormData {
  name: string;
  locations: Location[];
  businessId?: string; // Add businessId for system admin
  isActive?: boolean;
  tables?: any[];
  venues?: any[];
  service_charge?: {
    enabled: boolean;
    percentage: number;
  };
}

interface Business {
  _id: string;
  name: string;
  isActive: boolean;
}

function AddRestaurant() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState<boolean>(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  
  // Existing form data state
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    locations: [{
      address: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    }],
    businessId: '',
    isActive: true,
    tables: [],
    venues: [],
    service_charge: {
      enabled: false,
      percentage: 15
    }
  });

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

  // Check if user is system admin - make role comparison case-insensitive and add debugging
  React.useEffect(() => {
    console.log('AddRestaurant - Current user:', user);
    console.log('AddRestaurant - User role:', user?.role);
    console.log('AddRestaurant - Role type:', typeof user?.role);
  }, [user]);

  const isSystemAdmin = React.useMemo(() => {
    if (!user?.role) return false;
    
    const role = user.role.toLowerCase();
    const isAdmin = role === 'systemadmin' || 
                   role === 'system_admin' || 
                   role === 'superadmin' || 
                   role === 'super_admin' ||
                   role === 'admin';
    
    console.log('AddRestaurant - isSystemAdmin check:', {
      originalRole: user.role,
      normalizedRole: role,
      isAdmin: isAdmin
    });
    
    return isAdmin;
  }, [user?.role]);

  React.useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
    
    // Load businesses if user is system admin
    if (isSystemAdmin) {
      loadBusinesses();
    }
  }, [id, isSystemAdmin]);

  const loadBusinesses = async (): Promise<void> => {
    console.log('AddRestaurant - Starting to load businesses for system admin');
    try {
      setLoadingBusinesses(true);
      console.log('AddRestaurant - Calling BusinessService.getAllBusinesses()');
      const response = await axiosInstance.get('/businesses'); // Assuming BusinessService.getAllBusinesses is now axiosInstance.get('/businesses')
      console.log('AddRestaurant - Business service response:', response);
      
      const businessList = response.data.businesses || response.data || [];
      console.log('AddRestaurant - Processed business list:', businessList);
      
      setBusinesses(businessList);
      console.log('AddRestaurant - Successfully loaded', businessList.length, 'businesses');
    } catch (error: any) {
      console.error('AddRestaurant - Error loading businesses:', error);
      console.error('AddRestaurant - Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      setError(`Failed to load businesses: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoadingBusinesses(false);
      console.log('AddRestaurant - Finished loading businesses');
    }
  };

  const fetchRestaurant = async (): Promise<void> => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/restaurants/${id}`);
      const restaurantData = response.data as RestaurantFormData;
      
      // Ensure service_charge has default values if not present
      if (!restaurantData.service_charge) {
        restaurantData.service_charge = {
          enabled: false,
          percentage: 15
        };
      }
      
      setFormData(restaurantData);
      
      // If we have location data, set up the map
      if (restaurantData.locations && restaurantData.locations[0]) {
        const location = restaurantData.locations[0];
        if (location.coordinates) {
          setSelectedLocation([location.coordinates.latitude, location.coordinates.longitude]);
        }
      }

      // Check for existing schedule
      const schedules = await scheduleService.getAllSchedules({
        type: 'RESTAURANT',
        restaurant: id
      });

      console.log('Fetched restaurant schedules:', schedules);

      if (schedules && schedules.length > 0) {
        const restaurantSchedule = schedules[0];
        setExistingSchedule(restaurantSchedule);
        setEnableSchedule(true);
        
        console.log('Found existing restaurant schedule:', restaurantSchedule);
        
        // Convert backend schedule format to frontend format
        // Backend uses 'dailySchedule' (singular), not 'dailySchedules' (plural)
        const dailyScheduleData = (restaurantSchedule as any).dailySchedule || (restaurantSchedule as any).dailySchedules;
        
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
      console.error('Error fetching restaurant:', error);
      setError('Failed to fetch restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.name.trim()) {
        setError('Restaurant name is required');
        return;
      }

      // Only require city selection for new restaurants
      if (!id && !selectedCity) {
        setError('Please select a city');
        return;
      }

      // Only require address selection for new restaurants
      if (!id && !formData.locations[0]?.address) {
        setError('Please select an address');
        return;
      }

      if (isSystemAdmin && !formData.businessId) {
        setError('Please select a business');
        return;
      }
      
      // Prepare data for submission
      const submitData = { ...formData };
      let restaurantId = id;
      
      if (id) {
        await axiosInstance.put(`/restaurants/${id}`, submitData);
      } else {
        const response = await axiosInstance.post('/restaurants', submitData);
        restaurantId = response.data._id || response.data.id;
      }

      // Handle schedule if enabled
      if (enableSchedule && restaurantId) {
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
              name: `${formData.name} Operating Hours`,
              description: `Operating hours for ${formData.name}`,
              type: 'RESTAURANT',
              restaurant: restaurantId,
              dailySchedules: scheduleData,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              effectiveFrom: new Date()
            };

            await scheduleService.createSchedule(schedulePayload);
          }
        } catch (scheduleErr) {
          console.error('Error managing schedule:', scheduleErr);
          // Don't throw, just log - restaurant was created/updated successfully
        }
      } else if (!enableSchedule && existingSchedule) {
        // Deactivate existing schedule
        try {
          await scheduleService.deactivateSchedule(existingSchedule._id);
        } catch (scheduleErr) {
          console.error('Error deactivating schedule:', scheduleErr);
        }
      }

      navigate('/restaurants/list');
    } catch (error: any) {
      console.error('Error saving restaurant:', error);
      
      // Handle specific error messages
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to save restaurant');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: City | null): void => {
    setSelectedCity(city);
    
    if (city) {
      // Clear address and location when city changes, but keep the city
      setFormData((prev: RestaurantFormData) => ({
        ...prev,
        locations: [{ address: '', coordinates: { latitude: 0, longitude: 0 } }]
      }));
      setSelectedLocation(null);
    } else {
      // Clear everything if city is cleared
      setFormData((prev: RestaurantFormData) => ({
        ...prev,
        locations: [{ address: '', coordinates: { latitude: 0, longitude: 0 } }]
      }));
      setSelectedLocation(null);
    }
  };

  const handleAddressSelect = (addressData: any): void => {
    if (addressData) {
      // Update address and coordinates
      setFormData((prev: RestaurantFormData) => ({
        ...prev,
        locations: [{
          address: addressData.displayName,
          coordinates: {
            latitude: addressData.lat,
            longitude: addressData.lon
          }
        }]
      }));
      // Immediately activate the map with the new location
      setSelectedLocation([addressData.lat, addressData.lon]);
    } else {
      // Clear address if selection is cleared
      setFormData((prev: RestaurantFormData) => ({
        ...prev,
        locations: [{ address: '', coordinates: { latitude: 0, longitude: 0 } }]
      }));
      setSelectedLocation(null);
    }
  };

  const handleMapLocationSelect = async (coordinates: [number, number]): Promise<void> => {
    setSelectedLocation(coordinates);
    
    // Perform reverse geocoding to get the address name
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates[0]}&lon=${coordinates[1]}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'InseatApp'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const addressName = data.display_name || `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`;
        
        // Update form data with the new address and coordinates
        setFormData((prev: RestaurantFormData) => ({
          ...prev,
          locations: [{
            address: addressName,
            coordinates: {
              latitude: coordinates[0],
              longitude: coordinates[1]
            }
          }]
        }));
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      // Fall back to coordinates if geocoding fails
      const formattedCoordinates = `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`;
      setFormData((prev: RestaurantFormData) => ({
        ...prev,
        locations: [{
          address: formattedCoordinates,
          coordinates: {
            latitude: coordinates[0],
            longitude: coordinates[1]
          }
        }]
      }));
    }
  };

  const handleBusinessChange = (event: SelectChangeEvent): void => {
    setFormData((prev: RestaurantFormData) => ({
      ...prev,
      businessId: event.target.value
    }));
  };

  // Schedule handlers
  const handleScheduleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnableSchedule(e.target.checked);
  };

  // Calculate current restaurant status based on schedule
  const getCurrentStatus = () => {
    if (!enableSchedule || !scheduleData) return { isOpen: false, message: 'Schedule not configured' };
    
    try {
      const now = new Date();
      const dubaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));
      const currentDayOfWeek = dubaiTime.getDay(); // 0 = Sunday, 1 = Monday
      const currentHour = dubaiTime.getHours();
      const currentMinute = dubaiTime.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const todaySchedule = scheduleData.find(day => day.dayOfWeek === currentDayOfWeek);
      
      if (!todaySchedule || !todaySchedule.isOpen) {
        return { isOpen: false, message: 'Closed today' };
      }

      const [openHour, openMinute] = todaySchedule.openTime.split(':').map(Number);
      const [closeHour, closeMinute] = todaySchedule.closeTime.split(':').map(Number);
      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;

      const isCurrentlyOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
      
      return { 
        isOpen: isCurrentlyOpen, 
        message: isCurrentlyOpen ? 'Currently Open' : 'Currently Closed',
        checkedAt: dubaiTime.toLocaleString()
      };
    } catch (error) {
      console.error('Error calculating current status:', error);
      return { isOpen: false, message: 'Status unknown' };
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Restaurant' : 'Add New Restaurant'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={3}>
          

            {/* Business Selection for System Admin */}
            {isSystemAdmin && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="business-select-label">Select Business</InputLabel>
                  <Select
                    labelId="business-select-label"
                    id="business-select"
                    value={formData.businessId || ''}
                    label="Select Business"
                    onChange={handleBusinessChange}
                    disabled={loadingBusinesses}
                  >
                    {loadingBusinesses ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading businesses...
                      </MenuItem>
                    ) : businesses.length === 0 ? (
                      <MenuItem disabled>
                        No businesses available
                      </MenuItem>
                    ) : (
                      businesses.map((business: Business) => (
                        <MenuItem key={business._id} value={business._id}>
                          {business.name} {!business.isActive && '(Inactive)'}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Restaurant Name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                City or Area <span style={{ color: 'red' }}>*</span>
              </Typography>
              <CityAutocomplete
                onSelect={handleCitySelect}
                placeholder="Search for a city or area"
                value={selectedCity?.name || ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Address <span style={{ color: 'red' }}>*</span>
              </Typography>
              <AddressAutocomplete
                selectedCity={selectedCity}
                onSelect={handleAddressSelect}
                value={formData.locations[0]?.address || ''}
                placeholder="Search for an address"
                disabled={!selectedCity}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Map Location <span style={{ color: 'red' }}>*</span>
              </Typography>
              <RestaurantMap
                selectedCity={selectedCity}
                markerPosition={selectedLocation}
                onLocationSelect={handleMapLocationSelect}
                isDisabled={false} // Enable map when city is selected
              />
            </Grid>

            {/* Service Charge Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Service Charge Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Configure automatic service charge for orders at this restaurant
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.service_charge?.enabled || false}
                    onChange={(e) => 
                      setFormData({
                        ...formData,
                        service_charge: {
                          enabled: e.target.checked,
                          percentage: formData.service_charge?.percentage || 15
                        }
                      })
                    }
                  />
                }
                label="Enable Service Charge"
              />
            </Grid>

            {formData.service_charge?.enabled && (
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  Service Charge Percentage: {formData.service_charge?.percentage || 15}%
                </Typography>
                <Slider
                  value={formData.service_charge?.percentage || 15}
                  onChange={(_, newValue) =>
                    setFormData({
                      ...formData,
                      service_charge: {
                        enabled: formData.service_charge?.enabled || false,
                        percentage: newValue as number
                      }
                    })
                  }
                  min={10}
                  max={20}
                  step={0.5}
                  marks={[
                    { value: 10, label: '10%' },
                    { value: 15, label: '15%' },
                    { value: 20, label: '20%' }
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
                <Typography variant="caption" color="text.secondary">
                  Service charge will be automatically applied to all orders (10-20% range)
                </Typography>
              </Grid>
            )}

            {/* Schedule Configuration - Add after service charge section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Card>
                <CardHeader 
                  title="Operating Schedule"
                  action={
                    <FormControlLabel
                      control={
                        <Switch
                          checked={enableSchedule}
                          onChange={handleScheduleToggle}
                        />
                      }
                      label="Configure Schedule"
                    />
                  }
                />
                {enableSchedule && (() => {
                  const currentStatus = getCurrentStatus();
                  return (
                    <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Status: 
                        <Box 
                          component="span" 
                          sx={{ 
                            ml: 1,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            bgcolor: currentStatus.isOpen ? 'success.main' : 'error.main',
                            color: 'white'
                          }}
                        >
                          {currentStatus.isOpen ? 'OPEN' : 'CLOSED'}
                        </Box>
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {currentStatus.message} • Last checked: {currentStatus.checkedAt}
                      </Typography>
                    </Box>
                  );
                })()}
                {enableSchedule && (
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Set the operating hours for this restaurant. When closed, customers won't be able to place orders.
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
                              label="Open"
                              sx={{ mr: 2 }}
                            />
                            {day.isOpen && (
                              <>
                                <TextField
                                  type="time"
                                  label="Opens"
                                  value={day.openTime}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleDayChange(index, 'openTime', e.target.value)}
                                  size="small"
                                  sx={{ width: 150 }}
                                />
                                <TextField
                                  type="time"
                                  label="Closes"
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
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading || loadingBusinesses}
                >
                  {loading ? 'Saving...' : (id ? 'Update Restaurant' : 'Create Restaurant')}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/restaurants/list')}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default AddRestaurant;
