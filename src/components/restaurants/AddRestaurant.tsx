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
      setFormData(response.data);
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

  const handleLocationChange = (index: number, field: string, value: string) => {
    const newLocations = [...formData.locations];
    if (field === 'address') {
      newLocations[index].address = value;
    } else if (field === 'latitude' || field === 'longitude') {
      newLocations[index].coordinates[field] = parseFloat(value) || 0;
    }
    setFormData({ ...formData, locations: newLocations });
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [
        ...formData.locations,
        { address: '', coordinates: { latitude: 0, longitude: 0 } },
      ],
    });
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

            {formData.locations.map((location, index) => (
              <Grid item xs={12} key={index}>
                <Typography variant="h6" gutterBottom>
                  Location {index + 1}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Address"
                      value={location.address}
                      onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Latitude"
                      type="number"
                      value={location.coordinates.latitude}
                      onChange={(e) => handleLocationChange(index, 'latitude', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Longitude"
                      type="number"
                      value={location.coordinates.longitude}
                      onChange={(e) => handleLocationChange(index, 'longitude', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={addLocation}
                fullWidth
              >
                Add Location
              </Button>
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
