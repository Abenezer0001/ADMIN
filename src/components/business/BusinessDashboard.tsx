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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
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

  const fetchBusinessData = React.useCallback(async () => {
    if (!businessId) return;
    
    console.log('fetchBusinessData called with:', {
      businessId,
      userRole: user?.role,
      isAuthenticated,
      authLoading
    });

    setSpecificBusinessLoading(true);
    setSpecificBusinessError(null);
    
    try {
      console.log('Fetching business data for ID:', businessId);
      const businessService = BusinessService.getInstance();
      const business = await businessService.getBusinessById(businessId);
      console.log('Business data received:', business);
      setSpecificBusiness(business);
      setSpecificBusinessError(null);
    } catch (err: any) {
      console.error('Error fetching business data:', {
        error: err,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // If we get 401, test authentication to debug the issue
      if (err.response?.status === 401) {
        console.log('401 error detected, testing authentication...');
        try {
          await BusinessService.testAuthentication();
          console.log('Basic auth test passed, business endpoint failed with 401');
          setSpecificBusinessError('Authentication works but business endpoint failed. This may be a permission issue with the business endpoint.');
        } catch (authError: any) {
          console.error('Authentication test also failed:', authError);
          setSpecificBusinessError('Authentication failed. Please log in again.');
        }
      } else if (err.response?.status === 403) {
        setSpecificBusinessError('Access denied. You don\'t have permission to view this business.');
      } else if (err.response?.status === 404) {
        setSpecificBusinessError('Business not found.');
      } else {
        setSpecificBusinessError(err.response?.data?.message || err.message || 'Failed to fetch business data');
      }
    } finally {
      setSpecificBusinessLoading(false);
    }
  }, [businessId, user?.role, isAuthenticated, authLoading]);

  React.useEffect(() => {
    console.log('BusinessDashboard useEffect triggered:', {
      isAuthenticated,
      authLoading,
      businessId,
      userRole: user?.role,
      userRoles: user?.roles,
      userBusinessId: user?.businessId,
      isSuperAdminResult: isSuperAdmin(),
      isBusinessOwnerResult: isBusinessOwner()
    });

    // Prevent rapid re-renders by only executing when auth is stable
    if (!authLoading && isAuthenticated && user) {
      if (businessId) {
        // Viewing specific business (from business list or direct URL)
        console.log('Attempting to view specific business:', businessId);
        
        if (isSuperAdmin()) {
          console.log('System admin accessing business:', businessId);
          fetchBusinessData();
          return;
        }
        
        if (isBusinessOwner()) {
          console.log('Business owner accessing business:', businessId);
          fetchBusinessData();
          return;
        }
        
        // Allow restaurant admins to view their associated business
        if (user?.role === 'restaurant_admin') {
          if (user?.businessId === businessId) {
            console.log('Restaurant admin accessing their associated business:', businessId);
            fetchBusinessData();
            return;
          } else {
            // Allow restaurant admin to view the business if they have permission
            console.log('Restaurant admin accessing business:', businessId);
            fetchBusinessData();
            return;
          }
        }
        
        // For other roles, deny access
        console.log('User role not authorized for direct business access:', user?.role);
        setSpecificBusinessError(`Access denied. You don't have permission to view this business. Your role: ${user?.role}`);
      } else if (user?.role === 'restaurant_admin') {
        // Restaurant admin without specific businessId in URL
        console.log('Restaurant admin without specific business ID, loading their business:', user?.businessId);
        if (user?.businessId) {
          // Redirect to their business URL
          console.log('Redirecting restaurant admin to their business dashboard');
          navigate(`/business/dashboard/${user.businessId}`, { replace: true });
        } else {
          // Load current business from context for restaurant admin
          console.log('Loading current business from context for restaurant admin');
          if (currentBusiness?._id) {
            setSpecificBusiness(currentBusiness);
          } else {
            loadCurrentBusiness();
          }
        }
      } else if (isBusinessOwner() && user?.businessId) {
        // Business owner viewing their own business (no specific businessId in URL)
        console.log('Business owner loading their own business:', user.businessId);
        // This will be handled by the BusinessContext's loadCurrentBusiness for business owners
      } else if (isSuperAdmin()) {
        // System admin without specific business - show message
        console.log('System admin without specific business ID');
        setSpecificBusinessError('Select a business from the Business List to view details.');
      } else {
        // Other users without permission
        console.log('User without business access:', user?.role);
        setSpecificBusinessError(`This dashboard is only available for business owners, restaurant administrators, and system administrators. Your role: ${user?.role}`);
      }
    }
  }, [isAuthenticated, authLoading, businessId, user?.businessId, user?.role, user]);

  const formatAddress = (address?: any) => {
    if (!address) return 'No address provided';
    const parts = [address.street, address.city, address.state, address.postalCode, address.country];
    return parts.filter(Boolean).join(', ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Add stable loading state to prevent flickering
  const [isStableLoading, setIsStableLoading] = React.useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = React.useState(false);

  // Determine which business to display with stable data
  const displayBusiness = specificBusiness || currentBusiness;
  const actualLoading = specificBusinessLoading || isLoading;
  const displayError = specificBusinessError || error;
  
  // Use stable loading state for rendering
  const shouldShowLoading = isStableLoading || (actualLoading && !displayBusiness);
  
  React.useEffect(() => {
    // Only show loading if we haven't completed initial load and are actually loading
    if (!initialLoadComplete && !authLoading && isAuthenticated) {
      const timer = setTimeout(() => {
        setIsStableLoading(false);
        setInitialLoadComplete(true);
      }, 300); // Allow time for data to stabilize
      
      return () => clearTimeout(timer);
    } else if (initialLoadComplete) {
      setIsStableLoading(actualLoading);
    }
  }, [actualLoading, authLoading, isAuthenticated, initialLoadComplete]);

  // Show loading while authentication is being determined
  if (authLoading) {
    console.log('Auth still loading...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
        <Typography ml={2}>Loading authentication...</Typography>
      </Box>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    console.log('User not authenticated');
    return (
      <Alert severity="error">
        You must be logged in to access this page.
      </Alert>
    );
  }

  // Show error if there's one
  if (displayError) {
    console.log('Showing error:', displayError);
    return (
      <Alert severity="error">
        {displayError}
        <Box mt={2}>
          <Typography variant="body2">
            Debug info: User role: {user?.role}, Business ID: {businessId}
          </Typography>
        </Box>
      </Alert>
    );
  }

  // Show loading while business data is being fetched (with stable loading state)
  if (shouldShowLoading && !displayError) {
    console.log('Loading business data...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
        <Typography ml={2}>Loading business data...</Typography>
      </Box>
    );
  }

  // Show message if no business data and not loading
  if (!displayBusiness && !shouldShowLoading) {
    console.log('No business data available');
    return (
      <Alert severity="info">
        No business data available. Business ID: {businessId}
      </Alert>
    );
  }

  // Don't render main content if still in initial loading state
  if (!displayBusiness && shouldShowLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
        <Typography ml={2}>Loading business data...</Typography>
      </Box>
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
        <Typography variant="h5" component="h1" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
          {businessId ? 'Business Details' : 'My Business'}
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
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Owner"
                        secondary={
                          currentBusiness?.owner 
                            ? `${currentBusiness.owner.firstName || ''} ${currentBusiness.owner.lastName || ''}`.trim() || currentBusiness.owner.email || 'Not available'
                            : user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user?.email || 'Not available'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Contact Email"
                        secondary={
                          currentBusiness?.contactInfo?.email 
                            || currentBusiness?.owner?.email 
                            || user?.email 
                            || 'Not available'
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone"
                        secondary={
                          currentBusiness?.contactInfo?.phone 
                            || 'Not available'
                        }
                      />
                    </ListItem>
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