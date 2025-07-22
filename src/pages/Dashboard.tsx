import React from 'react';
const { useState, useEffect } = React;
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  TrendingUp,
  Restaurant,
  ShoppingCart,
  AttachMoney,
  People,
  Analytics,
  Refresh
} from '@mui/icons-material';
import AnalyticsService, { 
  SalesDashboardData, 
  OrderPerformanceData, 
  MenuOverviewData,
  DashboardOverviewData
} from '../services/AnalyticsService';

const Dashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesDashboardData | null>(null);
  const [orderData, setOrderData] = useState<OrderPerformanceData | null>(null);
  const [menuData, setMenuData] = useState<MenuOverviewData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sales, orders, menu, dashboard] = await Promise.all([
        AnalyticsService.getSalesDashboard(),
        AnalyticsService.getOrderPerformanceOverview(),
        AnalyticsService.getMenuOverview(),
        AnalyticsService.getDashboardOverview()
      ]);
      
      setSalesData(sales);
      setOrderData(orders);
      setMenuData(menu);
      setDashboardData(dashboard);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getChangeColor = (direction: string) => {
    return direction === 'up' ? 'success' : direction === 'down' ? 'error' : 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DashboardIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton onClick={fetchAnalyticsData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Key Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Sales */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="primary">
                    {salesData ? formatCurrency(salesData.totalSales.amount) : '---'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {salesData?.totalSales.period || 'All time'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShoppingCart color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="secondary">
                    {orderData?.overview.totalOrders.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  {orderData && (
                    <Chip
                      size="small"
                      label={`${orderData.overview.totalOrders.change.direction === 'up' ? '+' : ''}${orderData.overview.totalOrders.change.percentage}%`}
                      color={getChangeColor(orderData.overview.totalOrders.change.direction) as any}
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Menu Items */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Restaurant color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="success.main">
                    {menuData?.overview.totalMenuItems.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Menu Items
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {menuData?.overview.totalMenuItems.label || 'Active items'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Unique Users */}
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" color="info.main">
                    {dashboardData?.metrics.uniqueUsers.count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique Users
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dashboardData?.dateRange ? 
                      `${dashboardData.dateRange.startDate} - ${dashboardData.dateRange.endDate}` : 
                      'Last 30 days'
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Average Order Value */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Order Performance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5">
                  {orderData ? formatCurrency(orderData.overview.averageOrderValue.amount) : '---'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Order Value
                </Typography>
                {orderData && (
                  <Chip
                    size="small"
                    icon={<TrendingUp />}
                    label={`${orderData.overview.averageOrderValue.change.direction === 'up' ? '+' : ''}${orderData.overview.averageOrderValue.change.percentage}%`}
                    color={getChangeColor(orderData.overview.averageOrderValue.change.direction) as any}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              <Box>
                <Typography variant="body1" sx={{ mb: 0.5 }}>
                  Completion Rate: {orderData?.overview.completionRate.percentage || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Processing Time: {orderData?.overview.processingTime.value || 0} {orderData?.overview.processingTime.unit || 'min'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Menu Analytics */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Menu Analytics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5">
                  {menuData?.overview.averageRating.value || 0}/5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Rating
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Top Category: {menuData?.overview.topCategory.name || 'No Data'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">
                  Profit Margin: {menuData?.overview.profitMargin.percentage || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {menuData?.overview.profitMargin.description || 'Average across menu'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Restaurant Overview */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Business Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5">
                  {dashboardData ? formatCurrency(dashboardData.metrics.totalRevenue.amount) : '---'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body1">
                  EPHI: {dashboardData?.metrics.ephi.value || 0}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">
                  Restaurants: {dashboardData ? dashboardData.restaurantTabs.length - 1 : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active locations
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top/Low Performers */}
      {(salesData?.topPerformer || salesData?.lowestPerformer) && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {salesData?.topPerformer && (
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                    🏆 Top Performer
                  </Typography>
                  <Typography variant="h5">
                    {salesData.topPerformer.name}
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    {formatCurrency(salesData.topPerformer.sales, salesData.topPerformer.currency)}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {salesData?.lowestPerformer && (
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main" sx={{ mb: 2 }}>
                    📊 Needs Attention
                  </Typography>
                  <Typography variant="h5">
                    {salesData.lowestPerformer.name}
                  </Typography>
                  <Typography variant="body1" color="warning.main">
                    {formatCurrency(salesData.lowestPerformer.sales, salesData.lowestPerformer.currency)}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard; 