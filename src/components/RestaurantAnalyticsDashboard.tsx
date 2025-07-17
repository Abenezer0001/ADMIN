import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  LiveTv as LiveOrdersIcon,
  Inventory as InventoryIcon,
  Group as CustomersIcon,
  Receipt as InvoicesIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  QueryStats as QueryStatsIcon,
  AutoGraph as AutoGraphIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { RestaurantService } from '../services/RestaurantService';
import { useAuth } from '../context/AuthContext';

// Types
interface Restaurant {
  _id: string;
  name: string;
  businessId?: string;
  locations: Array<{
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  }>;
  isActive?: boolean;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// Dummy data (will be replaced with real API calls later)
const generateMonthlyOrdersData = () => [
  { name: 'Jan', orders: 1245, revenue: 15600 },
  { name: 'Feb', orders: 1567, revenue: 19800 },
  { name: 'Mar', orders: 1890, revenue: 23750 },
  { name: 'Apr', orders: 2234, revenue: 28900 },
  { name: 'May', orders: 2156, revenue: 27200 },
  { name: 'Jun', orders: 2456, revenue: 31800 },
  { name: 'Jul', orders: 2789, revenue: 36200 },
  { name: 'Aug', orders: 2345, revenue: 30100 },
  { name: 'Sep', orders: 2567, revenue: 33400 },
  { name: 'Oct', orders: 2890, revenue: 37800 },
  { name: 'Nov', orders: 3123, revenue: 41000 },
  { name: 'Dec', orders: 3456, revenue: 45200 }
];

const generateOrderByHourData = () => [
  { hour: '6:00', orders: 12 },
  { hour: '7:00', orders: 23 },
  { hour: '8:00', orders: 45 },
  { hour: '9:00', orders: 67 },
  { hour: '10:00', orders: 89 },
  { hour: '11:00', orders: 123 },
  { hour: '12:00', orders: 234 },
  { hour: '13:00', orders: 189 },
  { hour: '14:00', orders: 156 },
  { hour: '15:00', orders: 134 },
  { hour: '16:00', orders: 167 },
  { hour: '17:00', orders: 198 },
  { hour: '18:00', orders: 267 },
  { hour: '19:00', orders: 298 },
  { hour: '20:00', orders: 334 },
  { hour: '21:00', orders: 234 },
  { hour: '22:00', orders: 123 },
  { hour: '23:00', orders: 67 }
];

const generateBestSellersData = () => [
  { name: 'Aquafina Water 500ml', sales: 23818, venue: 'CC AQ it' },
  { name: 'Popcorn', sales: 22666, venue: 'Cinema City' },
  { name: 'Regular Nachos', sales: 16689, venue: 'CC AQ it' },
  { name: 'AQUAFINA Water 500ml', sales: 13249, venue: 'Cinema City' },
  { name: 'Regular Salt Popcorn', sales: 12415, venue: 'CC AQ it' },
  { name: 'Regular Pepsi', sales: 12133, venue: 'CC AQ it' },
  { name: 'PEPSI', sales: 9465, venue: 'Cinema City' },
  { name: 'Large Salt Popcorn', sales: 9250, venue: 'CC AQ it' }
];

// Quick Links data
const quickLinks = [
  {
    label: 'Live Orders',
    icon: <LiveOrdersIcon sx={{ fontSize: 32 }} />,
    path: '/orders/live',
    color: '#3b82f6',
    description: 'Monitor real-time order activity'
  },
  {
    label: 'Inventory',
    icon: <InventoryIcon sx={{ fontSize: 32 }} />,
    path: '/inventory',
    color: '#10b981',
    description: 'Manage your food and drink inventory'
  },
  {
    label: 'Customers',
    icon: <CustomersIcon sx={{ fontSize: 32 }} />,
    path: '/customers',
    color: '#f59e0b',
    description: 'View and manage customer accounts'
  },
  {
    label: 'Invoices',
    icon: <InvoicesIcon sx={{ fontSize: 32 }} />,
    path: '/invoices',
    color: '#6b7280',
    description: 'Access invoice management for orders'
  }
];

// Analytics Links data
const analyticsLinks = [
  {
    label: 'Sales Overview',
    icon: <AnalyticsIcon sx={{ fontSize: 32 }} />,
    path: '/analytics/sales',
    color: '#3b82f6'
  },
  {
    label: 'Customer Insights',
    icon: <InsightsIcon sx={{ fontSize: 32 }} />,
    path: '/analytics/customer-insight',
    color: '#10b981'
  },
  {
    label: 'Order Performance',
    icon: <QueryStatsIcon sx={{ fontSize: 32 }} />,
    path: '/analytics/order-performance',
    color: '#f59e0b'
  },
  {
    label: 'Menu Reports',
    icon: <AutoGraphIcon sx={{ fontSize: 32 }} />,
    path: '/analytics/menu-report',
    color: '#6b7280'
  }
];

const RestaurantAnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
    endDate: new Date()
  });

  // Load restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        setLoading(true);
        const restaurantsData = await RestaurantService.getAllRestaurants();
        setRestaurants(restaurantsData);
        setError(null);
      } catch (err: any) {
        console.error('Error loading restaurants:', err);
        setError(err.message || 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  // Get current restaurant data (dummy data for now)
  const getRestaurantAnalytics = () => {
    const selectedRestaurantData = restaurants.find(r => r._id === selectedRestaurant);
    const restaurantName = selectedRestaurantData?.name || 'All Restaurants';
    
    return {
      restaurantName,
      monthlyOrders: generateMonthlyOrdersData(),
      ordersByHour: generateOrderByHourData(),
      bestSellers: generateBestSellersData(),
      uniqueUsers: selectedRestaurant === 'all' ? '124.0k' : '45.2k',
      sph: selectedRestaurant === 'all' ? '95.93' : '32.15',
      totalRevenue: selectedRestaurant === 'all' ? '4,133,810' : '1,245,600'
    };
  };

  const analytics = getRestaurantAnalytics();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          Historical Dashboard - {analytics.restaurantName}
        </Typography>
        
        {/* Date Range Selector */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <DatePicker
              label="Start Date"
              value={dateRange.startDate}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, startDate: newValue }))}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={dateRange.endDate}
              onChange={(newValue) => setDateRange(prev => ({ ...prev, endDate: newValue }))}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Stack>
        </LocalizationProvider>
      </Box>

      {/* Restaurant Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={selectedRestaurant} 
          onChange={(e, newValue) => setSelectedRestaurant(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="All Restaurants" value="all" />
          {restaurants.map((restaurant) => (
            <Tab 
              key={restaurant._id} 
              label={restaurant.name} 
              value={restaurant._id}
            />
          ))}
        </Tabs>
      </Box>

      {/* Analytics Grid */}
      <Grid container spacing={3}>
        {/* Key Metrics Row */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                {analytics.uniqueUsers}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Unique Users - {analytics.restaurantName}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>
                {analytics.sph}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                SPH - {analytics.restaurantName}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: theme.palette.warning.main }}>
                {analytics.totalRevenue}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Orders Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Monthly Orders - {analytics.restaurantName}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.light}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Best Sellers */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Best Sellers - {analytics.restaurantName}
              </Typography>
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {analytics.bestSellers.map((item, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 1,
                    borderBottom: index < analytics.bestSellers.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider'
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.venue}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.sales.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order by Hour Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Order by Hour of Day - {analytics.restaurantName}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.ordersByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="orders" fill={theme.palette.secondary.main} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Links Section */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Quick Links
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {quickLinks.map((link) => (
            <Grid item xs={12} sm={6} md={3} key={link.label}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  bgcolor: 'background.paper',
                  border: `2px solid ${link.color}`,
                  borderRadius: 2,
                  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' ? `0 8px 25px ${link.color}40` : `0 8px 25px ${link.color}20`,
                    borderColor: link.color
                  }
                }}
                onClick={() => navigate(link.path)}
              >
                <CardContent sx={{ 
                  textAlign: 'left',
                  p: 3,
                  minHeight: 120
                }}>
                  <Box sx={{ color: link.color, mb: 2 }}>
                    {link.icon}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'medium', color: 'text.primary' }}>
                    {link.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {link.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Analytics Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Analytics
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {analyticsLinks.map((link) => (
            <Grid item xs={12} sm={6} md={3} key={link.label}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  bgcolor: 'background.paper',
                  border: `2px solid ${link.color}`,
                  borderRadius: 2,
                  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark' ? `0 8px 25px ${link.color}40` : `0 8px 25px ${link.color}20`,
                    borderColor: link.color
                  }
                }}
                onClick={() => navigate(link.path)}
              >
                <CardContent sx={{ 
                  textAlign: 'center',
                  p: 4,
                  minHeight: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ color: link.color, mb: 2 }}>
                    {link.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                    {link.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default RestaurantAnalyticsDashboard;