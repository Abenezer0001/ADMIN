import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Rating,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Reviews as ReviewsIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import { Pie, Line, Bar } from 'react-chartjs-2';
import RatingService from '../../services/RatingService';
import { useRestaurant } from '../../context/RestaurantContext';

interface TopReviewer {
  userId: string;
  userName: string;
  reviewCount: number;
  averageRating: number;
  verifiedPurchases: number;
  helpfulVotes: number;
  joinDate: string;
  lastReview: string;
}

interface ReviewFrequencyData {
  daily: number;
  weekly: number;
  monthly: number;
}

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  averageRating: number;
  color: string;
}

const CustomerInsights: React.FC = () => {
  const { selectedRestaurant } = useRestaurant();
  
  const [loading, setLoading] = useState(true);
  const [topReviewers, setTopReviewers] = useState<TopReviewer[]>([]);
  const [reviewFrequency, setReviewFrequency] = useState<ReviewFrequencyData>({
    daily: 0,
    weekly: 0,
    monthly: 0
  });
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [reviewTrends, setReviewTrends] = useState<Array<{
    date: string;
    reviewCount: number;
    averageRating: number;
    verifiedCount: number;
  }>>([]);

  const loadCustomerInsights = async () => {
    if (!selectedRestaurant?._id) return;
    
    try {
      setLoading(true);
      
      // Load analytics data
      const analyticsData = await RatingService.getRestaurantRatingAnalytics(
        selectedRestaurant._id,
        {
          startDate: new Date(Date.now() - getDateRangeMs(timeRange)).toISOString(),
          endDate: new Date().toISOString()
        }
      );
      
      // Load review trends
      const trendsData = await RatingService.getRatingTrends(
        selectedRestaurant._id,
        timeRange
      );
      
      setTopReviewers(analyticsData.customerInsights.topReviewers);
      setReviewFrequency(analyticsData.customerInsights.reviewFrequency);
      setReviewTrends(trendsData);
      
      // Generate customer segments data
      generateCustomerSegments(analyticsData.customerInsights.topReviewers);
      
    } catch (error) {
      console.error('Failed to load customer insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeMs = (range: string) => {
    const day = 24 * 60 * 60 * 1000;
    switch (range) {
      case 'week': return 7 * day;
      case 'month': return 30 * day;
      case 'quarter': return 90 * day;
      case 'year': return 365 * day;
      default: return 30 * day;
    }
  };

  const generateCustomerSegments = (reviewers: TopReviewer[]) => {
    const totalReviewers = reviewers.length;
    const segments: CustomerSegment[] = [
      {
        segment: 'Power Reviewers',
        count: reviewers.filter(r => r.reviewCount >= 10).length,
        percentage: 0,
        averageRating: 0,
        color: '#4caf50'
      },
      {
        segment: 'Regular Customers',
        count: reviewers.filter(r => r.reviewCount >= 3 && r.reviewCount < 10).length,
        percentage: 0,
        averageRating: 0,
        color: '#2196f3'
      },
      {
        segment: 'Occasional Reviewers',
        count: reviewers.filter(r => r.reviewCount < 3).length,
        percentage: 0,
        averageRating: 0,
        color: '#ff9800'
      },
      {
        segment: 'Verified Customers',
        count: reviewers.filter(r => r.verifiedPurchases > 0).length,
        percentage: 0,
        averageRating: 0,
        color: '#9c27b0'
      }
    ];

    segments.forEach(segment => {
      segment.percentage = totalReviewers > 0 ? (segment.count / totalReviewers) * 100 : 0;
      
      const segmentReviewers = reviewers.filter(r => {
        switch (segment.segment) {
          case 'Power Reviewers': return r.reviewCount >= 10;
          case 'Regular Customers': return r.reviewCount >= 3 && r.reviewCount < 10;
          case 'Occasional Reviewers': return r.reviewCount < 3;
          case 'Verified Customers': return r.verifiedPurchases > 0;
          default: return false;
        }
      });
      
      segment.averageRating = segmentReviewers.length > 0
        ? segmentReviewers.reduce((sum, r) => sum + r.averageRating, 0) / segmentReviewers.length
        : 0;
    });

    setCustomerSegments(segments);
  };

  const getSegmentChartData = () => ({
    labels: customerSegments.map(s => s.segment),
    datasets: [
      {
        data: customerSegments.map(s => s.count),
        backgroundColor: customerSegments.map(s => s.color),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  });

  const getTrendsChartData = () => ({
    labels: reviewTrends.map(trend => new Date(trend.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Total Reviews',
        data: reviewTrends.map(trend => trend.reviewCount),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
        yAxisID: 'count'
      },
      {
        label: 'Verified Reviews',
        data: reviewTrends.map(trend => trend.verifiedCount),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        yAxisID: 'count'
      },
      {
        label: 'Average Rating',
        data: reviewTrends.map(trend => trend.averageRating),
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        yAxisID: 'rating'
      }
    ]
  });

  const getReviewerTypeIcon = (reviewer: TopReviewer) => {
    if (reviewer.reviewCount >= 10) return <StarIcon sx={{ color: '#ffb400' }} />;
    if (reviewer.verifiedPurchases > reviewer.reviewCount * 0.7) return <VerifiedIcon sx={{ color: '#4caf50' }} />;
    return <PersonIcon sx={{ color: '#757575' }} />;
  };

  const getReviewerBadge = (reviewer: TopReviewer) => {
    if (reviewer.reviewCount >= 20) return { label: 'Super Reviewer', color: 'primary' };
    if (reviewer.reviewCount >= 10) return { label: 'Power Reviewer', color: 'success' };
    if (reviewer.verifiedPurchases > reviewer.reviewCount * 0.7) return { label: 'Verified Customer', color: 'info' };
    return { label: 'Regular Customer', color: 'default' };
  };

  useEffect(() => {
    loadCustomerInsights();
  }, [selectedRestaurant, timeRange]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Customer Insights & Review Analytics
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Daily Reviews
                  </Typography>
                  <Typography variant="h4">
                    {reviewFrequency.daily}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average per day
                  </Typography>
                </Box>
                <TimelineIcon sx={{ fontSize: 40, color: '#2196f3' }} />
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
                    Weekly Reviews
                  </Typography>
                  <Typography variant="h4">
                    {reviewFrequency.weekly}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average per week
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
                    Monthly Reviews
                  </Typography>
                  <Typography variant="h4">
                    {reviewFrequency.monthly}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average per month
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#ff9800' }} />
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
                    Top Reviewers
                  </Typography>
                  <Typography variant="h4">
                    {topReviewers.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active customers
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Customer Segments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Segments
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Pie
                  data={getSegmentChartData()}
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
              
              <Box mt={2}>
                {customerSegments.map((segment, index) => (
                  <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: segment.color
                        }}
                      />
                      <Typography variant="body2">{segment.segment}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="medium">
                      {segment.count} ({segment.percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Review Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Activity Trends
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
                      count: {
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                        title: {
                          display: true,
                          text: 'Review Count'
                        }
                      },
                      rating: {
                        type: 'linear' as const,
                        display: true,
                        position: 'right' as const,
                        min: 1,
                        max: 5,
                        title: {
                          display: true,
                          text: 'Average Rating'
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

      {/* Customer Segments Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Customer Segment Analysis
          </Typography>
          <Grid container spacing={3}>
            {customerSegments.map((segment, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: `${segment.color}15`,
                    border: `2px solid ${segment.color}30`
                  }}
                >
                  <Typography variant="h6" color={segment.color} gutterBottom>
                    {segment.segment}
                  </Typography>
                  <Typography variant="h4" gutterBottom>
                    {segment.count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {segment.percentage.toFixed(1)}% of customers
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={segment.averageRating} readOnly size="small" />
                    <Typography variant="body2">
                      {segment.averageRating.toFixed(1)} avg
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Top Reviewers Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Reviewers
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Reviews</TableCell>
                  <TableCell>Average Rating</TableCell>
                  <TableCell>Verified Purchases</TableCell>
                  <TableCell>Helpful Votes</TableCell>
                  <TableCell>Last Review</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topReviewers.slice(0, 10).map((reviewer, index) => {
                  const badge = getReviewerBadge(reviewer);
                  const verificationRate = reviewer.reviewCount > 0 
                    ? (reviewer.verifiedPurchases / reviewer.reviewCount) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={reviewer.userId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {reviewer.userName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {reviewer.userName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Member since {new Date(reviewer.joinDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          {getReviewerTypeIcon(reviewer)}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="h6">
                          {reviewer.reviewCount}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          reviews
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating value={reviewer.averageRating} readOnly size="small" />
                          <Typography variant="body2" fontWeight="medium">
                            {reviewer.averageRating.toFixed(1)}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {reviewer.verifiedPurchases}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={verificationRate}
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                            {verificationRate.toFixed(0)}% verified
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <ThumbUpIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {reviewer.helpfulVotes}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(reviewer.lastReview).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={badge.label}
                          size="small"
                          color={badge.color}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerInsights;