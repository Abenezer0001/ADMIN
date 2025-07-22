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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { CircularProgress } from '@mui/material';
import AnalyticsService from '../../services/AnalyticsService';

function OrderPerformance() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState({
    totalOrders: 0,
    averageValue: 0,
    completionRate: 0,
    processingTime: 0
  });
  const [hourlyOrderData, setHourlyOrderData] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrderAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch order performance overview
        const overviewResponse = await AnalyticsService.getOrderPerformanceOverview();
        if (overviewResponse?.overview) {
          const data = overviewResponse.overview;
          setOrderSummary({
            totalOrders: data.totalOrders?.count || 0,
            averageValue: data.averageOrderValue?.amount || 0,
            completionRate: data.completionRate?.percentage || 0,
            processingTime: data.processingTime?.value || 0
          });
        }

        // Fetch hourly distribution data
        const hourlyResponse = await AnalyticsService.getHourlyOrderDistribution();
        if (hourlyResponse?.hourlyDistribution?.length > 0) {
          // Map the API response to chart format
          const mappedData = hourlyResponse.hourlyDistribution.map((item: any) => ({
            hour: `${item.hour}:00`,
            orders: item.orderCount,
            revenue: item.revenue
          }));
          setHourlyOrderData(mappedData);
        }
      } catch (err: any) {
        console.error('Error fetching order analytics:', err);
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
        setError(err.response?.data?.error || err.message || 'Failed to fetch order analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAnalytics();
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
          Order Performance
        </Typography>
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      </Box>
    );
  }

  // Mock data for sections not yet connected to API
  const weeklyTrends = [
    { day: 'Mon', orders: 145, revenue: 5075, trend: 5 },
    { day: 'Wed', orders: 158, revenue: 5530, trend: 8 },
    { day: 'Fri', orders: 210, revenue: 7350, trend: 15 },
    { day: 'Sun', orders: 180, revenue: 6300, trend: -5 }
  ];

  const orderStatusData = [
    { status: 'Completed', count: Math.round(orderSummary.totalOrders * (orderSummary.completionRate / 100)), percentage: orderSummary.completionRate },
    { status: 'Cancelled', count: Math.round(orderSummary.totalOrders * 0.038), percentage: 3.8 },
    { status: 'Refunded', count: Math.round(orderSummary.totalOrders * 0.02), percentage: 2.0 }
  ];

  const orderTypeData = [
    { type: 'Dine-in', count: Math.round(orderSummary.totalOrders * 0.55), percentage: 55, trend: 8 },
    { type: 'Takeout', count: Math.round(orderSummary.totalOrders * 0.25), percentage: 25, trend: 12 },
    { type: 'Delivery', count: Math.round(orderSummary.totalOrders * 0.20), percentage: 20, trend: 15 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Order Performance
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Track and analyze your order metrics and trends
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ShoppingCartIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Orders
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {orderSummary.totalOrders.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2e7d32' }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Average Value
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                ${orderSummary.averageValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per order
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Completion Rate
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {orderSummary.completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successfully completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ed6c02' }}>
                  <AccessTimeIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Processing Time
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {orderSummary.processingTime} min
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average preparation time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hourly Order Chart */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" gutterBottom>
          Hourly Order Distribution
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyOrderData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Weekly Trends and Order Status */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Weekly Order Trends
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Order Status Breakdown
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <List>
              {orderStatusData.map((status, index) => (
                <ListItem key={index} divider={index < orderStatusData.length - 1}>
                  <ListItemIcon>
                    {status.status === 'Completed' ? (
                      <CheckCircleIcon color="success" />
                    ) : status.status === 'Cancelled' ? (
                      <CancelIcon color="error" />
                    ) : (
                      <ArrowDownwardIcon color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={status.status}
                    secondary={`${status.count} orders (${status.percentage}%)`}
                  />
                  <Box sx={{ width: '40%' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={status.percentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: status.status === 'Completed' ? '#2e7d32' : status.status === 'Cancelled' ? '#d32f2f' : '#ed6c02'
                        }
                      }} 
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Order Type Distribution
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <List>
              {orderTypeData.map((type, index) => (
                <ListItem key={index} divider={index < orderTypeData.length - 1}>
                  <ListItemIcon>
                    {type.type === 'Dine-in' ? (
                      <RestaurantIcon color="primary" />
                    ) : type.type === 'Takeout' ? (
                      <ShoppingCartIcon color="secondary" />
                    ) : (
                      <LocalShippingIcon color="info" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={type.type}
                    secondary={`${type.count} orders (${type.percentage}%)`}
                  />
                  <Chip
                    icon={type.trend > 0 ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    label={`${type.trend > 0 ? '+' : ''}${type.trend}%`}
                    color={type.trend > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default OrderPerformance;