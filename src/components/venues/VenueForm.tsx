import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { venueService } from '../../services/VenueService';
import { restaurantService } from '../../services/RestaurantService';

interface VenueFormData {
  name: string;
  description: string;
  capacity: number;
  isActive: boolean;
}

const VenueForm = () => {
  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    description: '',
    capacity: 0,
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);
        
        // Select the first restaurant by default
        if (data.length > 0) {
          setSelectedRestaurantId(data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('Failed to fetch restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch venue data if editing
  useEffect(() => {
    if (id) {
      const fetchVenue = async () => {
        try {
          setLoading(true);
          const venueData = await venueService.getVenue(id);
          setFormData({
            name: venueData.name,
            description: venueData.description || '',
            capacity: venueData.capacity,
            isActive: venueData.isActive
          });
          
          // If the venue has a restaurantId, select it
          if (venueData.restaurantId) {
            setSelectedRestaurantId(venueData.restaurantId);
          }
        } catch (error) {
          console.error('Error fetching venue:', error);
          setError('Failed to fetch venue details');
        } finally {
          setLoading(false);
        }
      };

      fetchVenue();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      isActive: e.target.checked
    });
  };

  const handleRestaurantChange = (e: any) => {
    setSelectedRestaurantId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRestaurantId) {
      setError('Please select a restaurant');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      if (id) {
        // Update existing venue
        await venueService.updateVenue(id, formData);
      } else {
        // Create new venue
        await venueService.createVenue(selectedRestaurantId, formData);
      }
      
      navigate('/venues/list');
    } catch (error: any) {
      console.error('Error saving venue:', error);
      setError(error.response?.data?.error || 'Error saving venue');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !restaurants.length) {
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
          {id ? 'Edit Venue' : 'Add New Venue'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {!id && (
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
            )}

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Venue Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
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
                disabled={loading || !selectedRestaurantId}
              >
                {loading ? <CircularProgress size={24} /> : id ? 'Update Venue' : 'Create Venue'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default VenueForm;
