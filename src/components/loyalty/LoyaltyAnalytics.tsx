import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  LocalOffer as LocalOfferIcon,
  AttachMoney as AttachMoneyIcon,
  Stars as StarsIcon
} from '@mui/icons-material';
import { LoyaltyService, LoyaltyAnalytics as AnalyticsData } from '../../services/LoyaltyService';
import { RestaurantService } from '../../services/RestaurantService';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';

const LoyaltyAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { selectedRestaurantId, setSelectedRestaurant } = useRestaurant();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurantData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.businessId) {
      loadRestaurants();
    } else if (user !== undefined) {
      setLoadingRestaurants(false);
      if (!user) {
        setError('Please log in to view loyalty analytics');
      } else if (!user.businessId) {
        setError('No business ID found. Please ensure you are logged in with a restaurant admin account.');
      }
    }
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoadingRestaurants(false);
      if (!user) {
        setError('Authentication timeout. Please refresh the page and log in again.');
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [user]);

  useEffect(() => {
    if (selectedRestaurantId && restaurants.length > 0) {
      const restaurant = restaurants.find(r => r._id === selectedRestaurantId);
      if (restaurant) {
        setSelectedRestaurantData(restaurant);
        loadAnalytics();
        loadCustomers();
      }
    }
  }, [selectedRestaurantId, restaurants]);

  const loadRestaurants = async () => {
    if (!user?.businessId) {
      setLoadingRestaurants(false);
      return;
    }

    setLoadingRestaurants(true);
    setError(null);
    
    try {
      // Use RestaurantService which has proper authentication
      const restaurantData = await RestaurantService.getRestaurantsByBusiness(user.businessId);
      setRestaurants(restaurantData);
      
      // Auto-select first restaurant for restaurant admins if none selected
      if (user?.role === 'restaurant_admin' && !selectedRestaurantId && restaurantData.length > 0) {
        setSelectedRestaurant(restaurantData[0]._id);
      }
    } catch (err: any) {
      console.error('Error loading restaurants:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view restaurants.');
      } else {
        setError('Failed to load restaurants. Please try again later.');
      }
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedRestaurantId) return;

    setLoading(true);
    setError(null);
    setAnalytics(null);
    
    try {
      const result = await LoyaltyService.getRestaurantAnalytics(selectedRestaurantId);
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        setError(result.message || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load loyalty analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    if (!selectedRestaurantId) return;

    try {
      const result = await LoyaltyService.getRestaurantCustomers(selectedRestaurantId, {
        limit: 10,
        sortBy: 'totalVisits',
        sortOrder: 'desc'
      });
      if (result.success && result.data?.customers) {
        setCustomers(result.data.customers);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return '#9E9E9E';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loadingRestaurants) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedRestaurantId || !selectedRestaurant) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loyalty Program Analytics
        </Typography>
        
        {restaurants.length > 0 ? (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Select a restaurant to view its loyalty analytics:
            </Typography>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={selectedRestaurantId || ''}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                label="Restaurant"
              >
                <MenuItem value="">
                  <em>Select a restaurant</em>
                </MenuItem>
                {restaurants.map((restaurant) => (
                  <MenuItem key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <Alert severity="warning">
            {error || 'No restaurants found. Please ensure you have restaurants set up in your business.'}
          </Alert>
        )}
        
        {/* Debug info - remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Debug Info: User: {user ? 'Authenticated' : 'Not authenticated'}, 
              Business ID: {user?.businessId || 'None'}, 
              Role: {user?.role || 'None'}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !analytics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
          Loyalty Program Analytics
        </Typography>
        
        {restaurants.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={selectedRestaurantId || ''}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                label="Restaurant"
              >
                {restaurants.map((restaurant) => (
                  <MenuItem key={restaurant._id} value={restaurant._id}>
                    {restaurant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedRestaurant && (
              <Typography variant="body1" color="text.secondary">
                Analytics for <strong>{selectedRestaurant.name}</strong>
              </Typography>
            )}
          </Box>
        )}
        
        <Alert severity="error">
          {error || 'No analytics data available. Make sure the loyalty program is enabled and has some activity.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Loyalty Program Analytics
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Restaurant</InputLabel>
          <Select
            value={selectedRestaurantId || ''}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            label="Restaurant"
          >
            {restaurants.map((restaurant) => (
              <MenuItem key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedRestaurant && (
          <Typography variant="body1" color="text.secondary">
            Analytics for <strong>{selectedRestaurant.name}</strong>
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Total Customers</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {analytics.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Total Visits</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {analytics.totalVisits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg: {analytics.averageVisitsPerCustomer} per customer
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {formatCurrency(analytics.totalSpent)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg: {formatCurrency(analytics.averageSpentPerCustomer)} per customer
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalOfferIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Total Savings</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(analytics.totalSavings)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((analytics.totalSavings / analytics.totalSpent) * 100).toFixed(1)}% of revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tier Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <StarsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Customer Tier Distribution
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(analytics.tierDistribution).map(([tier, count]) => {
                  const percentage = analytics.totalCustomers > 0 
                    ? (count / analytics.totalCustomers) * 100 
                    : 0;
                  
                  return (
                    <Box key={tier} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={tier.charAt(0).toUpperCase() + tier.slice(1)}
                            size="small"
                            sx={{ 
                              backgroundColor: getTierColor(tier),
                              color: 'white',
                              mr: 1
                            }}
                          />
                          <Typography variant="body2">
                            {count} customers
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getTierColor(tier)
                          }
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Loyalty Customers
              </Typography>
              {customers.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Customer</TableCell>
                        <TableCell align="center">Tier</TableCell>
                        <TableCell align="center">Visits</TableCell>
                        <TableCell align="right">Spent</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customers.slice(0, 5).map((customer, index) => (
                        <TableRow key={customer._id}>
                          <TableCell>
                            <Typography variant="body2">
                              {customer.customerId?.firstName} {customer.customerId?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {customer.customerId?.email}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={customer.currentTier}
                              size="small"
                              sx={{ 
                                backgroundColor: getTierColor(customer.currentTier),
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {customer.totalVisits}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(customer.totalSpent)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No customer data available yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Program Performance Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" color="primary">
                      {analytics.totalCustomers > 0 ? analytics.averageVisitsPerCustomer.toFixed(1) : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Visits per Customer
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" color="success.main">
                      {analytics.totalSpent > 0 ? ((analytics.totalSavings / analytics.totalSpent) * 100).toFixed(1) : '0'}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Discount Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" color="info.main">
                      {formatCurrency(analytics.averageSpentPerCustomer)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Revenue per Customer
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" color="warning.main">
                      {analytics.totalVisits > 0 ? (analytics.totalSavings / analytics.totalVisits).toFixed(2) : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Discount per Visit
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoyaltyAnalytics;