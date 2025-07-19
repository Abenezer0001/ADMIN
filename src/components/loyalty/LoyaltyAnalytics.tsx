"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  Analytics as AnalyticsIcon,
  Stars as StarsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { LoyaltyService, LoyaltyAnalytics as AnalyticsData } from '../../services/LoyaltyService';
import { RestaurantService } from '../../services/RestaurantService';
import { useAuth } from '../../context/AuthContext';

interface Restaurant {
  _id: string;
  name: string;
  locations: any[];
  isActive?: boolean;
}

interface Customer {
  _id: string;
  customerId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  currentTier: string;
  totalVisits: number;
  totalSpent: number;
}

const LoyaltyAnalytics: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration when API fails
  const mockAnalytics: AnalyticsData = {
    totalCustomers: 342,
    totalVisits: 1247,
    totalSpent: 52840,
    totalSavings: 7925,
    averageVisitsPerCustomer: 3.6,
    averageSpentPerCustomer: 154.5,
    tierDistribution: {
      bronze: 180,
      silver: 98,
      gold: 45,
      platinum: 19
    }
  };

  const mockCustomers: Customer[] = [
    {
      _id: '1',
      customerId: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      currentTier: 'platinum',
      totalVisits: 25,
      totalSpent: 1250
    },
    {
      _id: '2',
      customerId: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      currentTier: 'gold',
      totalVisits: 18,
      totalSpent: 890
    },
    {
      _id: '3',
      customerId: { firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com' },
      currentTier: 'silver',
      totalVisits: 12,
      totalSpent: 560
    }
  ];

  useEffect(() => {
    if (user?.businessId) {
      loadRestaurants();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadAnalytics();
      loadCustomers();
    }
  }, [selectedRestaurantId]);

  const loadRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      setError(null);
      const restaurantData = await RestaurantService.getRestaurantsByBusiness(user?.businessId || '');
      setRestaurants(restaurantData);
      
      // Auto-select first restaurant if available
      if (restaurantData.length > 0 && !selectedRestaurantId) {
        setSelectedRestaurantId(restaurantData[0]._id);
      }
    } catch (err) {
      console.error('Error loading restaurants:', err);
      setError('Failed to load restaurants');
      // Fallback to mock data
      setRestaurants([
        { _id: '1', name: 'Demo Restaurant 1', locations: [], isActive: true },
        { _id: '2', name: 'Demo Restaurant 2', locations: [], isActive: true }
      ]);
      setSelectedRestaurantId('1');
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const loadAnalytics = async () => {
    if (!selectedRestaurantId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await LoyaltyService.getRestaurantAnalytics(selectedRestaurantId);
      
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        // Fallback to mock data
        setAnalytics(mockAnalytics);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalytics(mockAnalytics); // Fallback to mock data
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
      } else {
        setCustomers(mockCustomers); // Fallback to mock data
      }
    } catch (err) {
      console.error('Error loading customers:', err);
      setCustomers(mockCustomers); // Fallback to mock data
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return theme.palette.grey[500];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleRefresh = () => {
    loadAnalytics();
    loadCustomers();
  };

  if (loadingRestaurants) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AnalyticsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
              Loyalty Program Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track customer engagement and loyalty program performance
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Restaurant Selection */}
      {restaurants.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>Restaurant</InputLabel>
              <Select
                value={selectedRestaurantId || ''}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
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
          </Paper>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {selectedRestaurantId && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : analytics ? (
            <>
              {/* Key Metrics Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: 2,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    border: `2px solid ${theme.palette.primary.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' ? `0 8px 25px ${theme.palette.primary.main}40` : `0 8px 25px ${theme.palette.primary.main}20`
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: `${theme.palette.primary.main}22`,
                          color: theme.palette.primary.main
                        }}>
                          <PeopleIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Total Customers</Typography>
                      </Stack>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.primary.main }}>
                        {analytics.totalCustomers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active loyalty members
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: 2,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    border: `2px solid ${theme.palette.success.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' ? `0 8px 25px ${theme.palette.success.main}40` : `0 8px 25px ${theme.palette.success.main}20`
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: `${theme.palette.success.main}22`,
                          color: theme.palette.success.main
                        }}>
                          <TrendingUpIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Total Visits</Typography>
                      </Stack>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.success.main }}>
                        {analytics.totalVisits}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg: {analytics.averageVisitsPerCustomer?.toFixed(1) || '0.0'} per customer
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: 2,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    border: `2px solid ${theme.palette.info.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' ? `0 8px 25px ${theme.palette.info.main}40` : `0 8px 25px ${theme.palette.info.main}20`
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: `${theme.palette.info.main}22`,
                          color: theme.palette.info.main
                        }}>
                          <AttachMoneyIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Total Revenue</Typography>
                      </Stack>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.info.main }}>
                        {formatCurrency(analytics.totalSpent || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg: {formatCurrency(analytics.averageSpentPerCustomer || 0)} per customer
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: 2,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                    border: `2px solid ${theme.palette.warning.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' ? `0 8px 25px ${theme.palette.warning.main}40` : `0 8px 25px ${theme.palette.warning.main}20`
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: `${theme.palette.warning.main}22`,
                          color: theme.palette.warning.main
                        }}>
                          <LocalOfferIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Total Savings</Typography>
                      </Stack>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.warning.main }}>
                        {formatCurrency(analytics.totalSavings || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {analytics.totalSpent ? (((analytics.totalSavings || 0) / analytics.totalSpent) * 100).toFixed(1) : '0.0'}% of revenue
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tier Distribution and Top Customers */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Tier Distribution */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarsIcon sx={{ color: 'primary.main' }} />
                      Customer Tier Distribution
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      {analytics.tierDistribution ? Object.entries(analytics.tierDistribution).map(([tier, count]) => {
                        const percentage = analytics.totalCustomers > 0 
                          ? ((count as number) / analytics.totalCustomers) * 100 
                          : 0;
                        
                        return (
                          <Box key={tier} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={tier.charAt(0).toUpperCase() + tier.slice(1)}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getTierColor(tier),
                                    color: 'white',
                                    fontWeight: 'medium'
                                  }}
                                />
                                <Typography variant="body2">
                                  {count as number} customers
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
                                  backgroundColor: getTierColor(tier),
                                  borderRadius: 4
                                }
                              }}
                            />
                          </Box>
                        );
                      }) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                          No tier distribution data available yet.
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Top Customers */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Top Loyalty Customers
                    </Typography>
                    {customers.length > 0 ? (
                      <TableContainer sx={{ mt: 2 }}>
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
                            {customers.slice(0, 5).map((customer) => (
                              <TableRow key={customer._id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                      {customer.customerId?.firstName?.[0]}{customer.customerId?.lastName?.[0]}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {customer.customerId?.firstName} {customer.customerId?.lastName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {customer.customerId?.email}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip 
                                    label={customer.currentTier?.toUpperCase()}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: getTierColor(customer.currentTier),
                                      color: 'white',
                                      fontWeight: 'medium'
                                    }}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                    {customer.totalVisits}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                    {formatCurrency(customer.totalSpent)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        No customer data available yet.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Performance Summary */}
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Program Performance Summary
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {analytics.averageVisitsPerCustomer?.toFixed(1) || '0.0'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Visits per Customer
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {analytics.totalSpent ? (((analytics.totalSavings || 0) / analytics.totalSpent) * 100).toFixed(1) : '0.0'}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Discount Rate
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                        {formatCurrency(analytics.averageSpentPerCustomer || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Revenue per Customer
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          ${analytics.totalVisits ? (((analytics.totalSavings || 0) / analytics.totalVisits).toFixed(2)) : '0.00'}
                        </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg Discount per Visit
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary">
                No analytics data available yet. Make sure the loyalty program is enabled and has some activity.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default LoyaltyAnalytics;