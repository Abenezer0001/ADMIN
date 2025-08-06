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
  ListItemAvatar,
  CircularProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RepeatIcon from '@mui/icons-material/Repeat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AnalyticsService from '../../services/AnalyticsService';
import RestaurantVenueSelector from '../common/RestaurantVenueSelector';
import { useRestaurant } from '../../context/RestaurantContext';

function CustomerInsight() {
  const { selectedRestaurantId } = useRestaurant();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerSummary, setCustomerSummary] = useState({
    totalCustomers: 0,
    repeatRate: 0,
    averageSpend: 0,
    growthRate: 0
  });
  const [customerSegments, setCustomerSegments] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [customerFeedback, setCustomerFeedback] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomerAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Prepare restaurant filter parameters
        const params = selectedRestaurantId ? { restaurantIds: [selectedRestaurantId] } : {};
        
        // Fetch customer overview
        const overviewResponse = await AnalyticsService.getCustomerOverview(params);
        if (overviewResponse?.overview) {
          const data = overviewResponse.overview;
          setCustomerSummary({
            totalCustomers: data.totalCustomers?.count || 0,
            repeatRate: data.retentionRate?.percentage || 0,
            averageSpend: data.averageOrderValue?.amount || 0,
            growthRate: Math.floor(Math.random() * 20) + 5 // Mock growth rate for now
          });
        }

        // Set customer segments
        if (overviewResponse?.segments?.length > 0) {
          setCustomerSegments(overviewResponse.segments.map((segment: any) => ({
            segment: segment.segment,
            count: segment.count,
            percentOfTotal: segment.percentage,
            averageSpend: segment.averageSpend,
            visits: segment.averageVisits
          })));
        }

        // Fetch top customers
        const topCustomersResponse = await AnalyticsService.getTopCustomers({ ...params, limit: 5 });
        if (topCustomersResponse?.topCustomers?.length > 0) {
          const mappedCustomers = topCustomersResponse.topCustomers.map((customer: any) => ({
            id: customer.id,
            name: customer.name,
            visits: customer.visits,
            totalSpent: customer.totalSpent,
            lastVisit: customer.lastVisit,
            favoriteItem: customer.favoriteItem || 'N/A'
          }));
          setTopCustomers(mappedCustomers);
        }

        // Fetch customer feedback
        const feedbackResponse = await AnalyticsService.getCustomerFeedback({ ...params, limit: 4 });
        if (feedbackResponse?.feedback?.length > 0) {
          const mappedFeedback = feedbackResponse.feedback.map((feedback: any) => ({
            id: feedback.id,
            name: feedback.customerName,
            rating: feedback.rating,
            comment: feedback.comment,
            date: feedback.date
          }));
          setCustomerFeedback(mappedFeedback);
        }
      } catch (err: any) {
        console.error('Error fetching customer analytics:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch customer analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerAnalytics();
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
          Customer Insights
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
        Customer Insights
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Understand your customer base and optimize your service
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
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Customers
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {customerSummary.totalCustomers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
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
                  <RepeatIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Repeat Rate
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {customerSummary.repeatRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Return customers
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
                  <AttachMoneyIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Avg. Spend
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                ${customerSummary.averageSpend}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per customer
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
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Growth Rate
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                {customerSummary.growthRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Month over month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Segments */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" gutterBottom>
          Customer Segments
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Segment</TableCell>
                <TableCell align="right">Customers</TableCell>
                <TableCell align="right">Avg. Spend</TableCell>
                <TableCell align="right">Avg. Visits</TableCell>
                <TableCell align="right">% of Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerSegments.map((segment, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body1" fontWeight={index === 0 ? 'bold' : 'normal'}>
                      {segment.segment}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{segment.count}</TableCell>
                  <TableCell align="right">${segment.averageSpend}</TableCell>
                  <TableCell align="right">{segment.visits}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {segment.percentOfTotal}%
                      </Typography>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={segment.percentOfTotal} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(0,0,0,0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: index === 0 ? '#2e7d32' : index === 1 ? '#1976d2' : index === 2 ? '#ed6c02' : '#d32f2f'
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

      {/* Top Customers and Feedback */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Top Customers
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Visits</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell align="right">Last Visit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                            {customer.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {customer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Favorite: {customer.favoriteItem}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{customer.visits}</TableCell>
                      <TableCell align="right">${customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell align="right">{customer.lastVisit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Recent Customer Feedback
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <List>
              {customerFeedback.map((feedback) => (
                <ListItem key={feedback.id} divider={feedback.id < customerFeedback.length - 1}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: feedback.rating >= 4 ? '#2e7d32' : feedback.rating >= 3 ? '#ed6c02' : '#d32f2f' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {feedback.name}
                        </Typography>
                        <Chip 
                          label={`${feedback.rating}/5`} 
                          size="small" 
                          color={feedback.rating >= 4 ? 'success' : feedback.rating >= 3 ? 'warning' : 'error'} 
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {feedback.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {feedback.date}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary.dark">
                Customer Retention Tip
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Consider implementing a loyalty program to increase your repeat customer rate and average spend per visit.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CustomerInsight;
