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
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import CityAutocomplete, { City } from './CityAutocomplete';
import AddressAutocomplete from './AddressAutocomplete';
import RestaurantMap from './RestaurantMap';

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
  isActive?: boolean;
  tables?: any[];
  venues?: any[];
}

function AddRestaurant() {
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    locations: [{ address: '', coordinates: { latitude: 0, longitude: 0 } }],
    isActive: true,
    tables: [],
    venues: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/restaurants/${id}`);
      const restaurantData = response.data;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (id) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/restaurants/${id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/restaurants`, formData);
      }
      navigate('/restaurants/list');
    } catch (error) {
      console.error('Error saving restaurant:', error);
      setError('Failed to save restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: City | null) => {
    setSelectedCity(city);
    
    if (city) {
      // Clear address and location when city changes
      setFormData(prev => ({
        ...prev,
        locations: [{ address: '', coordinates: { latitude: 0, longitude: 0 } }]
      }));
      setSelectedLocation(null);
    } else {
      // Clear everything if city is cleared
      setFormData(prev => ({
        ...prev,
        locations: [{ address: '', coordinates: { latitude: 0, longitude: 0 } }]
      }));
      setSelectedLocation(null);
    }
  };

  const handleAddressSelect = (addressData: any) => {
    if (addressData) {
      // Update address and coordinates
      setFormData(prev => ({
        ...prev,
        locations: [{
          address: addressData.displayName,
          coordinates: {
            latitude: addressData.lat,
            longitude: addressData.lon
          }
        }]
      }));
      setSelectedLocation([addressData.lat, addressData.lon]);
    } else {
      // Clear address if selection is cleared
      setFormData(prev => ({
        ...prev,
        locations: [{ address: '', coordinates: { latitude: 0, longitude: 0 } }]
      }));
      setSelectedLocation(null);
    }
  };

  const handleMapLocationSelect = async (coordinates: [number, number]) => {
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
        setFormData(prev => ({
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
      setFormData(prev => ({
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
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Restaurant Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                City <span style={{ color: 'red' }}>*</span>
              </Typography>
              <CityAutocomplete
                onSelect={handleCitySelect}
                placeholder="Search for a city"
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
              <RestaurantMap
                selectedCity={selectedCity}
                markerPosition={selectedLocation}
                onLocationSelect={handleMapLocationSelect}
                isDisabled={!selectedCity}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                >
                  {id ? 'Update Restaurant' : 'Create Restaurant'}
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
