import React from 'react';
const { useState, useEffect } = React;
import { styled } from '@mui/material/styles';
import { Box, Grid, Paper, Typography, Card, CardContent, CardActions, IconButton, CircularProgress } from '@mui/material';
import { Assessment as AssessmentIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Store as StoreIcon, ShoppingCart as ShoppingCartIcon, People as PeopleIcon } from '@mui/icons-material';
import AnalyticsService from '../../services/AnalyticsService';
import RestaurantVenueSelector from '../common/RestaurantVenueSelector';
import { useRestaurant } from '../../context/RestaurantContext';

const Analytics = () => {
  const { selectedRestaurantId } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    uniqueUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    ephi: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare restaurant filter parameters
        const params = selectedRestaurantId ? { restaurantIds: [selectedRestaurantId] } : {};
        
        // Fetch dashboard overview
        const overviewResponse = await AnalyticsService.getDashboardOverview(params);
        if (overviewResponse?.metrics) {
          const data = overviewResponse.metrics;
          setDashboardData({
            uniqueUsers: data.uniqueUsers?.count || 0,
            totalOrders: 0, // Will get from order overview
            totalRevenue: data.totalRevenue?.amount || 0,
            ephi: data.ephi?.value || 0
          });
        }

        // Fetch order overview for total orders count
        const orderResponse = await AnalyticsService.getOrderPerformanceOverview(params);
        if (orderResponse?.overview?.totalOrders) {
          setDashboardData(prev => ({
            ...prev,
            totalOrders: orderResponse.overview.totalOrders.count || 0
          }));
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedRestaurantId]);

  const StyledCard = styled(Card)<{ color: string }>`
    background-color: ${({ color }) => color};
    color: white;
  `;

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Analytics
        </Typography>
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      </Box>
    );
  }

  const data = [
    { 
      name: 'Customers', 
      value: dashboardData.uniqueUsers, 
      icon: <PeopleIcon />, 
      trend: <TrendingUpIcon />,
      color: '#4DAF7C'
    },
    { 
      name: 'Orders', 
      value: dashboardData.totalOrders, 
      icon: <ShoppingCartIcon />, 
      trend: <TrendingUpIcon />,
      color: '#FFC107'
    },
    { 
      name: 'Revenue', 
      value: `$${dashboardData.totalRevenue.toLocaleString()}`, 
      icon: <AssessmentIcon />, 
      trend: <TrendingUpIcon />,
      color: '#2196F3'
    },
  ];

  return (
    <Box sx={{ width: '100%', padding: '20px' }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
        Analytics Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Overview of your restaurant performance metrics
      </Typography>

      {/* Restaurant Filter */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Restaurant Filter
        </Typography>
        <RestaurantVenueSelector 
          showVenueSelector={false}
          showBusinessSelector={true}
          size="small"
        />
      </Paper>

      <Grid container spacing={3} sx={{ marginTop: '10px' }}>
        {data.map((entry) => (
          <Grid item xs={12} sm={6} md={4} key={entry.name}>
            <StyledCard color={entry.color}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {entry.name}
                </Typography>
                <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                  {entry.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {selectedRestaurantId ? 'Selected restaurant' : 'All restaurants'}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton aria-label="trend" sx={{ color: 'white' }}>
                  {entry.trend}
                </IconButton>
                <IconButton aria-label="assessment" sx={{ color: 'white' }}>
                  {entry.icon}
                </IconButton>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Analytics;
