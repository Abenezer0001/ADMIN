import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { restaurantService } from '../../services/RestaurantService';
import { venueService } from '../../services/VenueService';
import { BusinessService } from '../../services/BusinessService';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';

interface Restaurant {
  _id: string;
  name: string;
  businessId?: string;
}

interface Venue {
  _id: string;
  name: string;
  restaurantId: string;
  description?: string;
}

interface Business {
  _id: string;
  name: string;
  legalName?: string;
}

interface RestaurantVenueSelectorProps {
  selectedRestaurantId?: string;
  selectedVenueId?: string;
  selectedBusinessId?: string;
  onRestaurantChange?: (restaurantId: string) => void;
  onVenueChange?: (venueId: string) => void;
  onBusinessChange?: (businessId: string) => void;
  showVenueSelector?: boolean;
  showBusinessSelector?: boolean;
  label?: string;
  size?: 'small' | 'medium';
  required?: boolean;
  disabled?: boolean;
}

const RestaurantVenueSelector: React.FC<RestaurantVenueSelectorProps> = ({
  selectedRestaurantId: propSelectedRestaurantId,
  selectedVenueId: propSelectedVenueId,
  selectedBusinessId: propSelectedBusinessId,
  onRestaurantChange,
  onVenueChange,
  onBusinessChange,
  showVenueSelector = true,
  showBusinessSelector = false,
  label,
  size = 'small',
  required = false,
  disabled = false
}) => {
  const { user } = useAuth();
  const { 
    selectedRestaurantId: contextRestaurantId,
    selectedVenueId: contextVenueId,
    selectedBusinessId: contextBusinessId,
    setSelectedRestaurant,
    setSelectedVenue,
    setSelectedBusiness
  } = useRestaurant();
  
  // Use context values as default, but allow props to override
  const selectedRestaurantId = propSelectedRestaurantId ?? contextRestaurantId;
  const selectedVenueId = propSelectedVenueId ?? contextVenueId;
  const selectedBusinessId = propSelectedBusinessId ?? contextBusinessId;
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create stable callback references that update both context and props
  const stableOnRestaurantChange = useCallback((restaurantId: string) => {
    if (onRestaurantChange) {
      onRestaurantChange(restaurantId);
    } else {
      setSelectedRestaurant(restaurantId);
    }
  }, [onRestaurantChange, setSelectedRestaurant]);
  
  const stableOnVenueChange = useCallback((venueId: string) => {
    if (onVenueChange) {
      onVenueChange(venueId);
    } else {
      setSelectedVenue(venueId);
    }
  }, [onVenueChange, setSelectedVenue]);
  
  const stableOnBusinessChange = useCallback((businessId: string) => {
    if (onBusinessChange) {
      onBusinessChange(businessId);
    } else {
      setSelectedBusiness(businessId);
    }
  }, [onBusinessChange, setSelectedBusiness]);

  // Fetch businesses for system admin
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!showBusinessSelector || user?.role !== 'system_admin') {
        return;
      }

      try {
        const businessService = BusinessService.getInstance();
        const businessResponse = await businessService.getAllBusinesses();
        setBusinesses(businessResponse.businesses);
        
        // Auto-select business if only one available
        if (businessResponse.businesses.length === 1 && !selectedBusinessId && stableOnBusinessChange) {
          stableOnBusinessChange(businessResponse.businesses[0]._id);
        }
      } catch (err: any) {
        console.error('Error fetching businesses:', err);
        setError(`Failed to load businesses: ${err.message || 'Unknown error'}`);
      }
    };

    if (user) {
      fetchBusinesses();
    }
  }, [user?.id, showBusinessSelector, selectedBusinessId]);

  // Fetch restaurants based on user role and selected business
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let restaurantData: Restaurant[] = [];

        if (user?.role === 'system_admin') {
          if (selectedBusinessId) {
            // System admin with specific business selected
            restaurantData = await restaurantService.getRestaurantsByBusiness(selectedBusinessId);
          } else {
            // System admin can see all restaurants
            restaurantData = await restaurantService.getAllRestaurants();
          }
        } else if (user?.role === 'restaurant_admin' && user?.businessId) {
          // Restaurant admin can only see their business restaurants
          restaurantData = await restaurantService.getRestaurantsByBusiness(user.businessId);
        }

        setRestaurants(restaurantData);
        
        // Only auto-select restaurant if there's no current selection and only one restaurant available
        // and we're not overriding user's choice
        if (restaurantData.length === 1 && !selectedRestaurantId && !propSelectedRestaurantId && stableOnRestaurantChange) {
          stableOnRestaurantChange(restaurantData[0]._id);
        }
      } catch (err: any) {
        console.error('Error fetching restaurants:', err);
        setError(`Failed to load restaurants: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRestaurants();
    }
  }, [user?.id, selectedBusinessId]);

  // Fetch venues when restaurant changes
  useEffect(() => {
    const fetchVenues = async () => {
      if (!selectedRestaurantId || !showVenueSelector) {
        setVenues([]);
        return;
      }

      try {
        const venueData = await venueService.getVenues(selectedRestaurantId);
        const venues = Array.isArray(venueData) ? venueData : [];
        setVenues(venues);
        
        // Only auto-select venue if there's no current selection and only one venue available
        if (venues.length === 1 && !selectedVenueId && !propSelectedVenueId && stableOnVenueChange) {
          stableOnVenueChange(venues[0]._id);
        }
      } catch (err: any) {
        console.error('Error fetching venues:', err);
        setError(`Failed to load venues: ${err.message || 'Unknown error'}`);
      }
    };

    fetchVenues();
  }, [selectedRestaurantId, showVenueSelector, selectedVenueId]);

  const handleRestaurantChange = (event: SelectChangeEvent<string>) => {
    const restaurantId = event.target.value;
    stableOnRestaurantChange(restaurantId);
    // Clear venue selection when restaurant changes
    stableOnVenueChange('');
  };

  const handleVenueChange = (event: SelectChangeEvent<string>) => {
    const venueId = event.target.value;
    stableOnVenueChange(venueId);
  };

  const handleBusinessChange = (event: SelectChangeEvent<string>) => {
    const businessId = event.target.value;
    stableOnBusinessChange(businessId);
    // Clear restaurant and venue selection when business changes
    stableOnRestaurantChange('');
    stableOnVenueChange('');
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading restaurants...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
      {/* Business Selector - Only for System Admin */}
      {showBusinessSelector && user?.role === 'system_admin' && (
        <FormControl size={size as 'small' | 'medium'} sx={{ minWidth: 200 }} required={required}>
          <InputLabel id="business-select-label">Business</InputLabel>
          <Select
            labelId="business-select-label"
            value={selectedBusinessId || ''}
            onChange={handleBusinessChange}
            label="Business"
            disabled={disabled || businesses.length === 0}
          >
            <MenuItem value="">
              <em>All Businesses</em>
            </MenuItem>
            {businesses.map((business: Business) => (
              <MenuItem key={business._id} value={business._id}>
                {business.name}
                {business.legalName && business.legalName !== business.name && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({business.legalName})
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Restaurant Selector */}
      <FormControl size={size as 'small' | 'medium'} sx={{ minWidth: 200 }} required={required}>
        <InputLabel id="restaurant-select-label">
          {label || 'Restaurant'}
        </InputLabel>
        <Select
          labelId="restaurant-select-label"
          value={selectedRestaurantId || ''}
          onChange={handleRestaurantChange}
          label={label || 'Restaurant'}
          disabled={disabled || restaurants.length === 0}
        >
          <MenuItem value="">
            <em>All Restaurants</em>
          </MenuItem>
          {restaurants.map((restaurant: Restaurant) => (
            <MenuItem key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Venue Selector */}
      {showVenueSelector && (
        <FormControl size={size as 'small' | 'medium'} sx={{ minWidth: 200 }} required={required}>
          <InputLabel id="venue-select-label">Venue</InputLabel>
          <Select
            labelId="venue-select-label"
            value={selectedVenueId || ''}
            onChange={handleVenueChange}
            label="Venue"
            disabled={disabled || !selectedRestaurantId || venues.length === 0}
          >
            <MenuItem value="">
              <em>All Venues</em>
            </MenuItem>
            {venues.map((venue: Venue) => (
              <MenuItem key={venue._id} value={venue._id}>
                {venue.name}
                {venue.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({venue.description})
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default RestaurantVenueSelector; 