import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Rating,
  LinearProgress,
  Chip,
  Alert,
  AlertTitle,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Star as StarIcon,
  Reviews as ReviewsIcon,
  Warning as WarningIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import RatingService, { RatingAnalytics, RatingAggregated } from '../../services/RatingService';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';
import PermissionDebugPanel from '../debug/PermissionDebugPanel';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const RatingAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { selectedRestaurant } = useRestaurant();
  
  const [analytics, setAnalytics] = useState<RatingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date()
  });
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    if (!selectedRestaurant?._id) return;
    
    try {
      setLoading(true);
      const data = await RatingService.getRestaurantRatingAnalytics(
        selectedRestaurant._id,
        {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        }
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load rating analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const exportReviews = async (format: 'csv' | 'pdf') => {
    if (!selectedRestaurant?._id) return;
    
    try {
      const blob = await RatingService.exportReviews(
        selectedRestaurant._id,
        {
          dateFrom: dateRange.startDate.toISOString(),
          dateTo: dateRange.endDate.toISOString()
        },
        format
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reviews-${selectedRestaurant.name}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export reviews:', error);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [selectedRestaurant, dateRange]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0.1) return <TrendingUpIcon color="success" />;
    if (trend < -0.1) return <TrendingDownIcon color="error" />;
    return <TrendingFlatIcon color="disabled" />;
  };

  const getDistributionChartData = (distribution: RatingAggregated['distribution']) => ({
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        data: [distribution[1], distribution[2], distribution[3], distribution[4], distribution[5]],
        backgroundColor: [
          '#f44336', // 1 star - red
          '#ff9800', // 2 stars - orange
          '#ffeb3b', // 3 stars - yellow
          '#4caf50', // 4 stars - light green
          '#2e7d32'  // 5 stars - dark green
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  });

  const getTrendsChartData = () => {
    if (!analytics?.reviewTrends) return { labels: [], datasets: [] };

    return {
      labels: analytics.reviewTrends.map(trend => 
        new Date(trend.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Average Rating',
          data: analytics.reviewTrends.map(trend => trend.averageRating),
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          yAxisID: 'rating'
        },
        {
          label: 'Review Count',
          data: analytics.reviewTrends.map(trend => trend.reviewCount),
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4,
          yAxisID: 'count'
        }
      ]
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Failed to load rating analytics. Please try again.
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Permission Debug Panel (temporary) */}
        <PermissionDebugPanel />
        
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Rating Analytics Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshData} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<FileDownloadIcon />}
              onClick={() => exportReviews('csv')}
              variant="outlined"
            >
              Export CSV
            </Button>
            <Button
              startIcon={<FileDownloadIcon />}
              onClick={() => exportReviews('pdf')}
              variant="outlined"
            >
              Export PDF
            </Button>
          </Stack>
        </Box>

        {/* Date Range Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(date) => date && setDateRange(prev => ({ ...prev, startDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(date) => date && setDateRange(prev => ({ ...prev, endDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={period}
                    label="Period"
                    onChange={(e) => setPeriod(e.target.value as any)}
                  >
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                    <MenuItem value="quarter">Quarter</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Overall Rating
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h4">
                        {analytics.restaurantOverview.average.toFixed(1)}
                      </Typography>
                      <Rating 
                        value={analytics.restaurantOverview.average} 
                        readOnly 
                        size="small"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      {getTrendIcon(analytics.restaurantOverview.recentTrend)}
                      <Typography variant="body2" color="textSecondary">
                        {analytics.restaurantOverview.recentTrend > 0 ? '+' : ''}
                        {analytics.restaurantOverview.recentTrend.toFixed(2)} recent trend
                      </Typography>
                    </Box>
                  </Box>
                  <StarIcon sx={{ fontSize: 40, color: '#ffb400' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Reviews
                    </Typography>
                    <Typography variant="h4">
                      {analytics.restaurantOverview.count.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      {analytics.customerInsights.reviewFrequency.daily} avg daily
                    </Typography>
                  </Box>
                  <ReviewsIcon sx={{ fontSize: 40, color: '#2196f3' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Wilson Score
                    </Typography>
                    <Typography variant="h4">
                      {(analytics.restaurantOverview.wilsonScore * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Confidence rating
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Alerts
                    </Typography>
                    <Typography variant="h4" color={analytics.alertItems.length > 0 ? 'error' : 'success'}>
                      {analytics.alertItems.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Items need attention
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ 
                    fontSize: 40, 
                    color: analytics.alertItems.length > 0 ? '#f44336' : '#4caf50' 
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alerts Section */}
        {analytics.alertItems.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Items Requiring Attention</AlertTitle>
            <Box>
              {analytics.alertItems.slice(0, 3).map((alert, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Chip
                    label={alert.severity}
                    size="small"
                    color={alert.severity === 'high' ? 'error' : 'warning'}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" component="span">
                    {alert.menuItemName}: {alert.message}
                  </Typography>
                </Box>
              ))}
              {analytics.alertItems.length > 3 && (
                <Typography variant="body2" color="textSecondary">
                  +{analytics.alertItems.length - 3} more alerts
                </Typography>
              )}
            </Box>
          </Alert>
        )}

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Rating Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rating Distribution
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut
                    data={getDistributionChartData(analytics.restaurantOverview.distribution)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Rating Trends */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rating Trends Over Time
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line
                    data={getTrendsChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index' as const,
                        intersect: false,
                      },
                      scales: {
                        rating: {
                          type: 'linear' as const,
                          display: true,
                          position: 'left' as const,
                          min: 1,
                          max: 5,
                          title: {
                            display: true,
                            text: 'Average Rating'
                          }
                        },
                        count: {
                          type: 'linear' as const,
                          display: true,
                          position: 'right' as const,
                          min: 0,
                          title: {
                            display: true,
                            text: 'Review Count'
                          },
                          grid: {
                            drawOnChartArea: false,
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Rating Breakdown */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Detailed Rating Breakdown
            </Typography>
            <Grid container spacing={2}>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = analytics.restaurantOverview.distribution[rating as keyof typeof analytics.restaurantOverview.distribution];
                const percentage = analytics.restaurantOverview.count > 0 
                  ? (count / analytics.restaurantOverview.count) * 100 
                  : 0;
                
                return (
                  <Grid item xs={12} key={rating}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center" gap={1} minWidth={80}>
                        <Typography variant="body2">{rating}</Typography>
                        <StarIcon sx={{ fontSize: 16, color: '#ffb400' }} />
                      </Box>
                      <Box flexGrow={1}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#f5f5f5',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: rating >= 4 ? '#4caf50' : rating >= 3 ? '#ff9800' : '#f44336'
                            }
                          }}
                        />
                      </Box>
                      <Box minWidth={60}>
                        <Typography variant="body2" color="textSecondary">
                          {count} ({percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>

        {/* Customer Insights Summary */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customer Insights Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Top Reviewers
                </Typography>
                {analytics.customerInsights.topReviewers.slice(0, 5).map((reviewer, index) => (
                  <Box key={index} display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {reviewer.userName}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="textSecondary">
                        {reviewer.reviewCount} reviews
                      </Typography>
                      <Rating value={reviewer.averageRating} readOnly size="small" />
                    </Box>
                  </Box>
                ))}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Review Activity
                </Typography>
                <Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Daily Average:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {analytics.customerInsights.reviewFrequency.daily}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Weekly Average:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {analytics.customerInsights.reviewFrequency.weekly}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Monthly Average:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {analytics.customerInsights.reviewFrequency.monthly}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default RatingAnalyticsDashboard;