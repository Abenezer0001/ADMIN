import React from 'react';
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
  SelectChangeEvent
} from '@mui/material';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate, useParams } from 'react-router-dom';
import CityAutocomplete, { City } from './CityAutocomplete';
import AddressAutocomplete from './AddressAutocomplete';
import RestaurantMap from './RestaurantMap';
import { BusinessService } from '../../services/BusinessService';
import { useAuth } from '../../context/AuthContext';

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
}

interface Business {
  _id: string;
  name: string;
  isActive: boolean;
}

function AddRestaurant() {
  const [formData, setFormData] = React.useState<RestaurantFormData>({
    name: '',
    locations: [{ address: '', coordinates: { latitude: 0, longitude: 0 } }],
    isActive: true,
    tables: [],
    venues: []
  });
  
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCity, setSelectedCity] = React.useState<City | null>(null);
  const [selectedLocation, setSelectedLocation] = React.useState<[number, number] | null>(null);
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = React.useState<boolean>(false);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      const response = await BusinessService.getAllBusinesses();
      console.log('AddRestaurant - Business service response:', response);
      
      const businessList = response.businesses || response || [];
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
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/restaurants/${id}`);
      const restaurantData = response.data as RestaurantFormData;
      setFormData(restaurantData);
      
      // If we have location data, set up the map
      if (restaurantData.locations && restaurantData.locations[0]) {
        const location = restaurantData.locations[0];
        if (location.coordinates) {
          setSelectedLocation([location.coordinates.latitude, location.coordinates.longitude]);
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

      if (!selectedCity) {
        setError('Please select a city');
        return;
      }

      if (!formData.locations[0]?.address) {
        setError('Please select an address');
        return;
      }

      if (isSystemAdmin && !formData.businessId) {
        setError('Please select a business');
        return;
      }
      
      // Prepare data for submission
      const submitData = { ...formData };
      
      if (id) {
        await axiosInstance.put(`/restaurants/${id}`, submitData);
      } else {
        await axiosInstance.post('/restaurants', submitData);
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
