import React from 'react';
const { useState, useEffect } = React;
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { CircularProgress } from '@mui/material';
import AnalyticsService from '../../services/AnalyticsService';

const categoryPerformance = [
  { category: 'Pizza', items: 12, sales: 1245, revenue: 14940, percentOfTotal: 28 },
  { category: 'Pasta', items: 8, sales: 875, revenue: 11375, percentOfTotal: 21 },
  { category: 'Burgers', items: 10, sales: 760, revenue: 9120, percentOfTotal: 17 },
  { category: 'Salads', items: 6, sales: 580, revenue: 4640, percentOfTotal: 11 },
  { category: 'Appetizers', items: 14, sales: 520, revenue: 4160, percentOfTotal: 10 },
  { category: 'Desserts', items: 9, sales: 420, revenue: 3360, percentOfTotal: 8 },
  { category: 'Beverages', items: 15, sales: 350, revenue: 1750, percentOfTotal: 5 }
];

const lowPerformingItems = [
  { name: 'Vegetable Soup', category: 'Appetizers', sales: 12, revenue: 96, daysOnMenu: 45 },
  { name: 'Quinoa Salad', category: 'Salads', sales: 18, revenue: 144, daysOnMenu: 60 },
  { name: 'Eggplant Parmesan', category: 'Main Dishes', sales: 15, revenue: 195, daysOnMenu: 30 },
  { name: 'Fruit Tart', category: 'Desserts', sales: 10, revenue: 80, daysOnMenu: 20 },
  { name: 'Sparkling Water', category: 'Beverages', sales: 25, revenue: 75, daysOnMenu: 90 }
];

function MenuReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuSummary, setMenuSummary] = useState({
    totalItems: 0,
    topSellingCategory: '',
    averageRating: 0,
    profitMargin: 0
  });
  const [topSellingItems, setTopSellingItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenuAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch menu overview
        const overviewResponse = await AnalyticsService.getMenuOverview();
        if (overviewResponse?.overview) {
          const data = overviewResponse.overview;
          setMenuSummary({
            totalItems: data.totalMenuItems?.count || 0,
            topSellingCategory: data.topCategory?.name || '',
            averageRating: data.averageRating?.value || 0,
            profitMargin: data.profitMargin?.percentage || 0
          });
        }

        // Fetch top selling items
        const topItemsResponse = await AnalyticsService.getTopSellingItems({ limit: 5 });
        if (topItemsResponse?.topSellingItems?.length > 0) {
          // Map the API response to our display format
          const mappedItems = topItemsResponse.topSellingItems.map((item: any, index: number) => ({
            id: item.id || index,
            name: item.name,
            category: item.category || 'Unknown',
            sales: item.sales,
            revenue: item.revenue,
            trend: Math.floor(Math.random() * 20) - 5 // Random trend for now since API doesn't provide it
          }));
          setTopSellingItems(mappedItems);
        }
      } catch (err: any) {
        console.error('Error fetching menu analytics:', err);
        console.error('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            baseURL: err.config?.baseURL
          }
        });
        setError(err.response?.data?.error || err.message || 'Failed to fetch menu analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuAnalytics();
  }, []);

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
          Menu Report
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
        Menu Report
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Analyze your menu performance and optimize your offerings
      </Typography>

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
                  <RestaurantMenuIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Menu Items
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {menuSummary.totalItems}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active items
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
                  Top Category
                </Typography>
              </Stack>
              <Typography variant="h5" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {menuSummary.topSellingCategory}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                By sales volume
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
                  <LocalOfferIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Avg. Rating
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {menuSummary.averageRating}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer satisfaction
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
                  <MoneyOffIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Profit Margin
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {menuSummary.profitMargin}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average across menu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Selling Items */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" gutterBottom>
          Top Selling Items
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Sales</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topSellingItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell align="right">{item.sales}</TableCell>
                  <TableCell align="right">${item.revenue.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Chip
                      icon={item.trend > 0 ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                      label={`${item.trend > 0 ? '+' : ''}${item.trend}%`}
                      color={item.trend > 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Category Performance and Low Performing Items */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Category Performance
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Items</TableCell>
                    <TableCell align="right">Sales</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">% of Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryPerformance.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'normal'}>
                          {category.category}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{category.items}</TableCell>
                      <TableCell align="right">{category.sales}</TableCell>
                      <TableCell align="right">${category.revenue.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {category.percentOfTotal}%
                          </Typography>
                          <Box sx={{ width: 100 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={category.percentOfTotal} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: 'rgba(0,0,0,0.05)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: index < 3 ? '#2e7d32' : index < 5 ? '#1976d2' : '#ed6c02'
                                }
                              }} 
                            />
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Low Performing Items
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <List>
              {lowPerformingItems.map((item, index) => (
                <ListItem key={index} divider={index < lowPerformingItems.length - 1}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight="medium">
                        {item.name}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {item.category}
                        </Typography>
                        {` — ${item.sales} sales ($${item.revenue})`}
                      </>
                    }
                  />
                  <Chip 
                    label={`${item.daysOnMenu} days`} 
                    size="small" 
                    color="warning" 
                    variant="outlined" 
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#fff9f0', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="warning.dark">
                Recommendation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Consider removing or revising these low-performing items to optimize your menu and reduce inventory costs.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MenuReport;