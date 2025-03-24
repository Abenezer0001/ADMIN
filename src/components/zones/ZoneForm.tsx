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
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { venueService, Venue } from '../../services/VenueService';
import { API_BASE_URL } from '../../utils/config';

interface ZoneFormData {
  name: string;
  description: string;
  venueId: string;
  capacity: number;
  isActive: boolean;
  tables: string[];
}

function ZoneForm() {
  const [formData, setFormData] = useState<ZoneFormData>({
    name: '',
    description: '',
    venueId: '',
    capacity: 0,
    isActive: true,
    tables: []
  });
  
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch restaurants first
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/restaurants`);
        setRestaurants(response.data);
        if (response.data.length > 0) {
          setSelectedRestaurantId(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch venues when restaurant changes
  useEffect(() => {
    if (selectedRestaurantId) {
      fetchVenues();
    }
  }, [selectedRestaurantId]);

  // Fetch zone data if editing
  useEffect(() => {
    if (id) {
      fetchZone();
    }
  }, [id]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await venueService.getVenues(selectedRestaurantId);
      setVenues(response);
      
      // If we have venues and no venue is selected yet, select the first one
      if (response.length > 0 && !formData.venueId) {
        setFormData(prev => ({ ...prev, venueId: response[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchZone = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/zones/${id}`);
      setFormData(response.data);
      
      // If the zone has a venueId, find the associated restaurant
      if (response.data.venueId) {
        try {
          const venueResponse = await axios.get(`${API_BASE_URL}/api/venues/${response.data.venueId}`);
          if (venueResponse.data.restaurantId) {
            setSelectedRestaurantId(venueResponse.data.restaurantId);
          }
        } catch (venueError) {
          console.error('Error fetching venue details:', venueError);
        }
      }
    } catch (error) {
      console.error('Error fetching zone:', error);
      setError('Failed to fetch zone details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        venueId: formData.venueId,
        tables: formData.tables || []
      };

      if (id) {
        await axios.put(`${API_BASE_URL}/api/zones/${id}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/api/zones`, payload);
      }
      navigate('/zones/list');
    } catch (error: any) {
      console.error('Error saving zone:', error);
      setError(error.response?.data?.error || 'Error saving zone');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantChange = (e: any) => {
    setSelectedRestaurantId(e.target.value);
    // Reset venue selection when restaurant changes
    setFormData(prev => ({ ...prev, venueId: '' }));
  };

  if (loading && !venues.length) {
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
          {id ? 'Edit Zone' : 'Add New Zone'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Restaurant</InputLabel>
                <Select
                  value={selectedRestaurantId}
                  label="Restaurant"
                  onChange={handleRestaurantChange}
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
                required
                fullWidth
                label="Zone Name"
                value={formData.name}
                onChange={(e) => 
                  setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => 
                  setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Venue</InputLabel>
                <Select
                  value={formData.venueId}
                  label="Venue"
                  onChange={(e) => 
                    setFormData({ ...formData, venueId: e.target.value as string })}
                  disabled={venues.length === 0}
                >
                  {venues.map((venue) => (
                    <MenuItem key={venue._id} value={venue._id}>
                      {venue.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {venues.length === 0 && selectedRestaurantId && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  No venues available for this restaurant. Please create a venue first.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => 
                  setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => 
                      setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth
                disabled={loading || !formData.venueId}
              >
                {loading ? <CircularProgress size={24} /> : id ? 'Update Zone' : 'Create Zone'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default ZoneForm;