import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import DataTable from '../common/DataTable';
import RestaurantVenueSelector from '../common/RestaurantVenueSelector';
import { useRestaurant } from '../../context/RestaurantContext';
import AnalyticsService from '../../services/AnalyticsService';

const columns = [
  { 
    header: 'Restaurant Name', 
    accessorKey: 'name' 
  },
  { 
    header: 'Total Sales', 
    accessorKey: 'totalSales',
    cell: ({ getValue }: any) => `$${getValue().toLocaleString()}`
  },
];

const handleEdit = (restaurant: any) => {
  console.log('Edit restaurant:', restaurant);
};

const handleDelete = (restaurant: any) => {
  console.log('Delete restaurant:', restaurant);
};

const handleView = (restaurant: any) => {
  console.log('View restaurant:', restaurant);
};

const Sales = () => {
  const { selectedRestaurantId } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesDashboard, setSalesDashboard] = useState({
    totalSales: 0,
    averageSales: 0,
    topPerformer: null as any,
    lowestPerformer: null as any
  });
  const [restaurantData, setRestaurantData] = useState<any[]>([]);
  const [selectionRange, setSelectionRange] = useState<[Date, Date]>([
    new Date(),
    new Date()
  ]);

  const handleSelect = (ranges: any) => {
    setSelectionRange([ranges.selection.startDate, ranges.selection.endDate]);
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prepare restaurant filter parameters
        const params = selectedRestaurantId ? { restaurantIds: [selectedRestaurantId] } : {};

        // Fetch sales dashboard data
        const dashboardResponse = await AnalyticsService.getSalesDashboard(params);
        if (dashboardResponse) {
          setSalesDashboard({
            totalSales: dashboardResponse.totalSales?.amount || 0,
            averageSales: dashboardResponse.averageSales?.amount || 0,
            topPerformer: dashboardResponse.topPerformer,
            lowestPerformer: dashboardResponse.lowestPerformer
          });
        }

        // Fetch restaurant sales data
        const restaurantResponse = await AnalyticsService.getSalesRestaurants(params);
        if (restaurantResponse?.restaurants) {
          const mappedData = restaurantResponse.restaurants.map((restaurant: any) => ({
            id: restaurant.id,
            name: restaurant.name,
            totalSales: restaurant.totalSales
          }));
          setRestaurantData(mappedData);
        }
      } catch (err: any) {
        console.error('Error fetching sales data:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [selectedRestaurantId]);

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
        <Typography variant="h5" component="h1" gutterBottom>
          Sales Dashboard
        </Typography>
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Sales Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Track and analyze your restaurant sales performance
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Sales
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                ${salesDashboard.totalSales.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedRestaurantId ? 'Selected restaurant' : 'All restaurants'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <StorefrontIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Avg. Sales
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                ${salesDashboard.averageSales.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2e7d32' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Top Performer
                </Typography>
              </Stack>
              <Typography variant="h5" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {salesDashboard.topPerformer?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${salesDashboard.topPerformer?.sales?.toLocaleString() || '0'} in sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ed6c02' }}>
                  <TrendingDownIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Lowest Performer
                </Typography>
              </Stack>
              <Typography variant="h5" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {salesDashboard.lowestPerformer?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${salesDashboard.lowestPerformer?.sales?.toLocaleString() || '0'} in sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={restaurantData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        dateRange={selectionRange}
      />
    </Box>
  );
}; 

export default Sales;