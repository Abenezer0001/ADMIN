import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  Business as BusinessIcon,
  Restaurant as RestaurantIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { Business } from '../../types/business';
import BusinessService from '../../services/BusinessService';

const BusinessDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const { user } = useAuth();
  const {
    currentBusiness,
    isLoading,
    error,
    loadCurrentBusiness,
    isBusinessOwner,
    isSuperAdmin
  } = useBusiness();

  const [specificBusiness, setSpecificBusiness] = React.useState<Business | null>(null);
  const [specificBusinessLoading, setSpecificBusinessLoading] = React.useState(false);
  const [specificBusinessError, setSpecificBusinessError] = React.useState<string | null>(null);

  // Load business data based on context
  React.useEffect(() => {
    if (businessId) {
      // Viewing specific business (from business list)
      loadSpecificBusiness();
    } else if (user?.businessId) {
      // Business owner viewing their own business
      loadCurrentBusiness();
    }
  }, [businessId, user?.businessId]);

  const loadSpecificBusiness = async () => {
    if (!businessId) return;
    
    setSpecificBusinessLoading(true);
    setSpecificBusinessError(null);
    
    try {
      const business = await BusinessService.getBusinessById(businessId);
      setSpecificBusiness(business);
    } catch (error: any) {
      console.error('Failed to load business:', error);
      setSpecificBusinessError(error.response?.data?.message || error.message || 'Failed to load business details');
    } finally {
      setSpecificBusinessLoading(false);
    }
  };

  const formatAddress = (address?: any) => {
    if (!address) return 'No address provided';
    const parts = [address.street, address.city, address.state, address.postalCode, address.country];
    return parts.filter(Boolean).join(', ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Determine which business to display
  const displayBusiness = specificBusiness || currentBusiness;
  const loading = specificBusinessLoading || isLoading;
  const displayError = specificBusinessError || error;

  // Check access permissions
  if (!businessId && !isBusinessOwner()) {
    return (
      <Alert severity="info">
        This dashboard is only available for business owners.
      </Alert>
    );
  }

  if (businessId && !isSuperAdmin() && !isBusinessOwner()) {
    return (
      <Alert severity="error">
        Access denied. You don't have permission to view this business.
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (displayError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {displayError}
      </Alert>
    );
  }

  if (!displayBusiness) {
    return (
      <Alert severity="warning">
        No business information found. Please contact your administrator.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        {businessId && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/business/list')}
            variant="outlined"
            size="small"
          >
            Back to List
          </Button>
        )}
        <BusinessIcon sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          {businessId ? 'Business Details' : 'Business Dashboard'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Business Information Card */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  Business Information
                </Typography>
                <Chip
                  label={displayBusiness.isActive ? 'Active' : 'Inactive'}
                  color={displayBusiness.isActive ? 'success' : 'default'}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Business Name
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
                    {displayBusiness.name}
                  </Typography>

                  {displayBusiness.legalName && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">
                        Legal Name
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {displayBusiness.legalName}
                      </Typography>
                    </>
                  )}

                  {displayBusiness.registrationNumber && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">
                        Registration Number
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {displayBusiness.registrationNumber}
                      </Typography>
                    </>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Owner Information
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body1">
                      {displayBusiness.owner?.firstName} {displayBusiness.owner?.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EmailIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body1">
                      {displayBusiness.owner?.email}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body1">
                      {formatDate(displayBusiness.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Contact Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={displayBusiness.contactInfo.email}
                      />
                    </ListItem>
                    {displayBusiness.contactInfo.phone && (
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Phone"
                          secondary={displayBusiness.contactInfo.phone}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Address"
                        secondary={formatAddress(displayBusiness.contactInfo.address)}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              {/* Business Settings */}
              {displayBusiness.settings && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Business Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Multi-Restaurant Support
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {displayBusiness.settings.multiRestaurant ? 'Enabled' : 'Disabled'}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Staff Management
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {displayBusiness.settings.allowStaffManagement ? 'Allowed' : 'Not Allowed'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Approval Required for New Staff
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {displayBusiness.settings.requireApprovalForNewStaff ? 'Yes' : 'No'}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Default Currency
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {displayBusiness.settings.defaultCurrency || 'Not set'}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary">
                        Default Timezone
                      </Typography>
                      <Typography variant="body1">
                        {displayBusiness.settings.defaultTimezone || 'Not set'}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats Card */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Stats
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon color="primary" />
                    <Typography variant="body2">
                      Restaurants
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary">
                    {displayBusiness.restaurantCount || displayBusiness.restaurants?.length || 0}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2">
                      Status
                    </Typography>
                  </Box>
                  <Chip
                    label={displayBusiness.isActive ? 'Active' : 'Inactive'}
                    color={displayBusiness.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(displayBusiness.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No recent activity to display.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Restaurants Overview */}
        {displayBusiness.restaurants && displayBusiness.restaurants.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Restaurants Overview ({displayBusiness.restaurants.length})
                </Typography>
                <Grid container spacing={2}>
                  {displayBusiness.restaurants.map((restaurant: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} key={restaurant._id || index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {restaurant.name}
                          </Typography>
                          {restaurant.locations && restaurant.locations.length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              {restaurant.locations[0].address}
                            </Typography>
                          )}
                          {restaurant.venues && (
                            <Typography variant="caption" display="block">
                              Venues: {restaurant.venues.length}
                            </Typography>
                          )}
                          {restaurant.schedule && (
                            <Typography variant="caption" display="block">
                              Operating Days: {restaurant.schedule.filter((s: any) => !s.isHoliday).length}/7
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default BusinessDashboard; 