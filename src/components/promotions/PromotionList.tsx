import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PromotionService, { IPromotion, IVenue, IRestaurant } from '../../services/PromotionService';
import { useAuth } from '../../context/AuthContext';
import { BusinessService } from '../../services/BusinessService';

interface PromotionListProps {
  restaurantId?: string;
}

const PromotionList: React.FC<PromotionListProps> = ({ restaurantId: propRestaurantId }: PromotionListProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [promotions, setPromotions] = React.useState<IPromotion[]>([]);
  const [venues, setVenues] = React.useState<IVenue[]>([]);
  const [restaurants, setRestaurants] = React.useState<IRestaurant[]>([]);
  const [businesses, setBusinesses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = React.useState<string>('all');
  const [selectedBusiness, setSelectedBusiness] = React.useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [promotionToDelete, setPromotionToDelete] = React.useState<string | null>(null);
  const [restaurantId, setRestaurantId] = React.useState<string>(propRestaurantId || '');

  React.useEffect(() => {
    const initializeData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        if (user.role === 'system_admin') {
          // System admin: Load businesses and all data
          const businessService = BusinessService.getInstance();
          const businessResponse = await businessService.getAllBusinesses();
          setBusinesses(businessResponse.businesses);

          // Load all restaurants for "All Restaurants" option
          const allRestaurants = await PromotionService.getAllRestaurants();
          setRestaurants(allRestaurants);

          // Load all venues for "All Venues" option
          try {
            const allVenues = await PromotionService.getAllVenues();
            setVenues(allVenues);
          } catch (venueError) {
            console.warn('Could not fetch all venues:', venueError);
            setVenues([]);
          }
        } else if (user.role === 'restaurant_admin') {
          // Restaurant admin: Try to get their business info
          try {
            // First, try to get the business info from the user profile
            if (user.businessId) {
              const businessRestaurants = await PromotionService.getRestaurantsByBusiness(user.businessId);
              setRestaurants(businessRestaurants);
              
              if (businessRestaurants.length > 0) {
                setRestaurantId(businessRestaurants[0]._id);
                setSelectedRestaurant(businessRestaurants[0]._id);
              }
            } else {
              // If no businessId in user profile, try to get user's business through API
              console.log('User does not have businessId in profile, restaurant admin needs business setup');
              setError('Your account is not properly linked to a business. Please contact your system administrator to complete your account setup.');
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error loading restaurant admin data:', err);
            setError('Failed to load restaurant data. Please ensure your business has restaurants configured.');
          }
        }

        setLoading(false);
        setInitialLoadComplete(true);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
        setInitialLoadComplete(true);
      }
    };

    initializeData();
  }, [user]);

  // Fetch restaurants when business is selected
  React.useEffect(() => {
    const fetchRestaurants = async () => {
      if (!selectedBusiness || selectedBusiness === 'all') return;

      try {
        setLoading(true);
        console.log('Fetching restaurants for business:', selectedBusiness);
        const businessRestaurants = await PromotionService.getRestaurantsByBusiness(selectedBusiness);
        setRestaurants(businessRestaurants);

        // Reset restaurant selection when business changes
        setSelectedRestaurant('all');
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'system_admin' && selectedBusiness && selectedBusiness !== 'all') {
      fetchRestaurants();
    } else if (user?.role === 'system_admin' && selectedBusiness === 'all') {
      // Load all restaurants when "All Businesses" is selected
      PromotionService.getAllRestaurants().then(allRestaurants => {
        setRestaurants(allRestaurants);
        setSelectedRestaurant('all');
      }).catch(err => {
        console.error('Error fetching all restaurants:', err);
      });
    }
  }, [selectedBusiness, user?.role]);

  // Fetch venues when restaurant is selected
  React.useEffect(() => {
    const fetchVenues = async () => {
      if (!selectedRestaurant || selectedRestaurant === 'all') {
        if (user?.role === 'system_admin') {
          // For system admin with "All Restaurants", load all venues
          try {
            const allVenues = await PromotionService.getAllVenues();
            setVenues(allVenues);
          } catch (venueError) {
            console.warn('Could not fetch all venues:', venueError);
            setVenues([]);
          }
        }
        return;
      }

      try {
        const restaurantVenues = await PromotionService.getVenues(selectedRestaurant);
        setVenues(restaurantVenues);
      } catch (err) {
        console.error('Error fetching venues for restaurant:', err);
        setVenues([]);
      }
    };

    if (user?.role === 'system_admin') {
      fetchVenues();
    }
  }, [selectedRestaurant, user?.role]);

  React.useEffect(() => {
    const fetchData = async () => {
      let currentRestaurantId = propRestaurantId;

      // For system admins, handle different selection scenarios
      if (user?.role === 'system_admin') {
        if (selectedRestaurant === 'all') {
          currentRestaurantId = undefined; // Get all promotions
        } else {
          currentRestaurantId = selectedRestaurant;
        }
      } else if (user?.role === 'restaurant_admin') {
        // For restaurant admin, use selected restaurant or fallback to stored restaurantId
        currentRestaurantId = selectedRestaurant !== 'all' ? selectedRestaurant : restaurantId;
        
        // If still no restaurantId, ensure we have one from the business restaurants
        if (!currentRestaurantId && restaurants.length > 0) {
          currentRestaurantId = restaurants[0]._id;
          setSelectedRestaurant(restaurants[0]._id);
        }
      }

      // For restaurant admins, ensure we have a restaurantId before making the API call
      if (user?.role === 'restaurant_admin' && !currentRestaurantId) {
        console.log('Restaurant admin requires restaurantId but none available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setRestaurantId(currentRestaurantId || '');

        console.log('Fetching promotions for restaurant:', currentRestaurantId || 'ALL');
        
        // Handle venue filtering
        const venueFilter = selectedVenue === 'all' ? undefined : selectedVenue;
        
        // Update to handle the new response structure
        const response = await PromotionService.getPromotions(currentRestaurantId, venueFilter);
        
        // Handle both old and new response structures
        if (response.promotions) {
          setPromotions(response.promotions);
          if (response.venues && response.venues.length > 0) {
            setVenues(response.venues);
          }
        } else {
          // Fallback for old structure
          setPromotions(Array.isArray(response) ? response : []);
        }

        // Fetch venues if not included in response and we have a specific restaurant
        if (!response.venues && currentRestaurantId) {
          try {
            const venueData = await PromotionService.getVenues(currentRestaurantId);
            setVenues(venueData);
          } catch (venueError) {
            console.warn('Could not fetch venues:', venueError);
            setVenues([]);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load promotions');
      } finally {
        setLoading(false);
      }
    };

    if (user && ((user.role === 'restaurant_admin') || (user.role === 'system_admin'))) {
      fetchData();
    }
  }, [user, propRestaurantId, selectedVenue, selectedRestaurant, selectedBusiness, restaurantId]);

  const handleDelete = async () => {
    if (!promotionToDelete) return;

    try {
      await PromotionService.deletePromotion(promotionToDelete);
      setPromotions(promotions.filter((p: IPromotion) => p._id !== promotionToDelete));
      setDeleteDialogOpen(false);
      setPromotionToDelete(null);
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete promotion');
    }
  };

  const handleToggleActive = async (promotion: IPromotion) => {
    try {
      const updatedPromotion = await PromotionService.updatePromotion(promotion._id!, {
        isActive: !promotion.isActive,
      });
      setPromotions(promotions.map((p: IPromotion) => 
        p._id === promotion._id ? updatedPromotion : p
      ));
    } catch (err) {
      console.error('Error updating promotion:', err);
      setError(err instanceof Error ? err.message : 'Failed to update promotion');
    }
  };

  const getStatusColor = (promotion: IPromotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) return 'default';
    if (now < startDate) return 'warning';
    if (now > endDate) return 'error';
    return 'success';
  };

  const getStatusText = (promotion: IPromotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (!promotion.isActive) return 'Inactive';
    if (now < startDate) return 'Scheduled';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  // Show error state for restaurant admins without business
  if (user?.role === 'restaurant_admin' && !user?.businessId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Business ID is required to view promotions. Please contact your system administrator.
        </Alert>
      </Container>
    );
  }

  // Show error if no restaurant selected for restaurant admin
  if (user?.role === 'restaurant_admin' && !restaurantId && !loading && initialLoadComplete) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {restaurants.length === 0
            ? 'No restaurants found for your business. Please create a restaurant first.'
            : 'Restaurant ID is required to view promotions'
          }
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
          Promotions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            const targetRestaurantId = user?.role === 'system_admin' && selectedRestaurant !== 'all' 
              ? selectedRestaurant 
              : restaurantId;
            navigate(`/promotions/add${targetRestaurantId ? `?restaurantId=${targetRestaurantId}` : ''}`);
          }}
        >
          Add Promotion
        </Button>
      </Box>

      {/* Filter Controls for System Admin */}
      {user?.role === 'system_admin' && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Filter Promotions
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Business</InputLabel>
              <Select
                value={selectedBusiness}
                label="Business"
                onChange={(e) => setSelectedBusiness(e.target.value)}
              >
                <MenuItem value="all">All Businesses</MenuItem>
                {businesses.map((business: any) => (
                  <MenuItem key={business.id} value={business.id}>
                    {business.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={selectedRestaurant}
                label="Restaurant"
                onChange={(e) => setSelectedRestaurant(e.target.value)}
              >
                <MenuItem value="all">All Restaurants</MenuItem>
                {restaurants.map((restaurant: IRestaurant) => (
                  <MenuItem key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Venue</InputLabel>
              <Select
                value={selectedVenue}
                label="Venue"
                onChange={(e) => setSelectedVenue(e.target.value)}
              >
                <MenuItem value="all">All Venues</MenuItem>
                {venues.map((venue: IVenue) => (
                  <MenuItem key={venue._id} value={venue._id}>
                    {venue.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}

      {/* Filter Controls for Restaurant Admin */}
      {user?.role === 'restaurant_admin' && restaurants.length > 1 && (
      <Box mb={3}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Restaurant</InputLabel>
            <Select
              value={selectedRestaurant}
              label="Restaurant"
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              {restaurants.map((restaurant: IRestaurant) => (
                <MenuItem key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Venue</InputLabel>
          <Select
            value={selectedVenue}
              label="Venue"
            onChange={(e) => setSelectedVenue(e.target.value)}
          >
            <MenuItem value="all">All Venues</MenuItem>
              {venues.map((venue: IVenue) => (
              <MenuItem key={venue._id} value={venue._id}>
                {venue.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : promotions.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No promotions found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {selectedVenue !== 'all' || selectedRestaurant !== 'all' || selectedBusiness !== 'all' 
              ? 'Try adjusting your filters or ' : ''}
            Create your first promotion to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
            onClick={() => {
              const targetRestaurantId = user?.role === 'system_admin' && selectedRestaurant !== 'all' 
                ? selectedRestaurant 
                : restaurantId;
              navigate(`/promotions/add${targetRestaurantId ? `?restaurantId=${targetRestaurantId}` : ''}`);
            }}
          >
            Add Promotion
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {promotions.map((promotion: IPromotion) => (
            <Grid item xs={12} sm={6} lg={4} key={promotion._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  {promotion.imageUrl ? (
                    <img
                      src={promotion.imageUrl}
                      alt={promotion.title}
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 200,
                        backgroundColor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Avatar sx={{ width: 64, height: 64, bgcolor: 'grey.400' }}>
                        <ImageIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                    </Box>
                  )}
                  
                  {/* Status and Splash indicators */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
                    <Chip
                      label={getStatusText(promotion)}
                      color={getStatusColor(promotion)}
                      size="small"
                    />
                    {promotion.displayOnSplash && (
                      <Chip
                        label="Splash"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {promotion.title}
                  </Typography>
                  
                  {promotion.description && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {promotion.description.length > 100
                        ? `${promotion.description.substring(0, 100)}...`
                        : promotion.description}
                    </Typography>
                  )}

                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Duration:</strong> {format(new Date(promotion.startDate), 'MMM dd, yyyy')} - {format(new Date(promotion.endDate), 'MMM dd, yyyy')}
                    </Typography>
                    
                    {promotion.combos.length > 0 && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        <strong>Combos:</strong> {promotion.combos.length} combo{promotion.combos.length > 1 ? 's' : ''}
                      </Typography>
                    )}

                    {promotion.enabledVenues.length > 0 && venues.length > 0 && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        <strong>Venues:</strong> {promotion.enabledVenues.length === venues.length ? 'All Venues' : `${promotion.enabledVenues.length} venues`}
                      </Typography>
                    )}
                  </Box>

                  <Box mt={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={promotion.isActive}
                          onChange={() => handleToggleActive(promotion)}
                          size="small"
                        />
                      }
                      label="Active"
                    />
                  </Box>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => navigate(`/promotions/detail/${promotion._id}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/promotions/edit/${promotion._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setPromotionToDelete(promotion._id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Promotion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this promotion? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PromotionList; 