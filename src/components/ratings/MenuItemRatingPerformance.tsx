import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Rating,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  Alert,
  Stack,
  Tooltip,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Reviews as ReviewsIcon
} from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
import RatingService from '../../services/RatingService';
import { useRestaurant } from '../../context/RestaurantContext';

interface MenuItemPerformance {
  menuItemId: string;
  name: string;
  category: string;
  averageRating: number;
  totalReviews: number;
  recentTrend: number;
  lastReviewDate: string;
  needsAttention: boolean;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

type SortField = 'rating' | 'review_count' | 'recent_activity';
type SortOrder = 'asc' | 'desc';

const MenuItemRatingPerformance: React.FC = () => {
  const { selectedRestaurant } = useRestaurant();
  
  const [items, setItems] = useState<MenuItemPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState<SortField>('rating');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItemPerformance | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadMenuItemsPerformance = async () => {
    if (!selectedRestaurant?._id) return;
    
    try {
      setLoading(true);
      const response = await RatingService.getMenuItemsRatingPerformance(
        selectedRestaurant._id,
        {
          sortBy,
          sortOrder,
          categoryId: categoryFilter || undefined,
          page: page + 1,
          limit: rowsPerPage
        }
      );
      setItems(response.items);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      console.error('Failed to load menu items performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(field);
    setPage(0);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0.1) return <TrendingUpIcon color="success" fontSize="small" />;
    if (trend < -0.1) return <TrendingDownIcon color="error" fontSize="small" />;
    return <TrendingFlatIcon color="disabled" fontSize="small" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0.1) return 'success';
    if (trend < -0.1) return 'error';
    return 'default';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4.0) return 'info';
    if (rating >= 3.0) return 'warning';
    return 'error';
  };

  const getPerformanceLevel = (rating: number, reviewCount: number) => {
    if (rating >= 4.5 && reviewCount >= 20) return { level: 'Excellent', color: 'success' };
    if (rating >= 4.0 && reviewCount >= 10) return { level: 'Good', color: 'info' };
    if (rating >= 3.0) return { level: 'Average', color: 'warning' };
    return { level: 'Needs Attention', color: 'error' };
  };

  const getDistributionChartData = (distribution: MenuItemPerformance['ratingDistribution']) => ({
    labels: ['1★', '2★', '3★', '4★', '5★'],
    datasets: [
      {
        data: [distribution[1], distribution[2], distribution[3], distribution[4], distribution[5]],
        backgroundColor: [
          '#f44336', // 1 star
          '#ff9800', // 2 stars
          '#ffeb3b', // 3 stars
          '#4caf50', // 4 stars
          '#2e7d32'  // 5 stars
        ],
        borderWidth: 1,
        borderColor: '#fff'
      }
    ]
  });

  useEffect(() => {
    loadMenuItemsPerformance();
  }, [selectedRestaurant, page, rowsPerPage, sortBy, sortOrder, categoryFilter]);

  if (loading && items.length === 0) {
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
          Menu Item Rating Performance
        </Typography>
        <Button
          startIcon={<AssessmentIcon />}
          variant="outlined"
          onClick={() => loadMenuItemsPerformance()}
          disabled={loading}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Top Rated Items
                  </Typography>
                  <Typography variant="h4">
                    {items.filter(item => item.averageRating >= 4.5).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    4.5+ stars
                  </Typography>
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
                    Need Attention
                  </Typography>
                  <Typography variant="h4" color="error">
                    {items.filter(item => item.needsAttention).length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Items with issues
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 40, color: '#f44336' }} />
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
                    Avg Rating
                  </Typography>
                  <Typography variant="h4">
                    {items.length > 0 
                      ? (items.reduce((sum, item) => sum + item.averageRating, 0) / items.length).toFixed(1)
                      : '0'
                    }
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Across all items
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, color: '#2196f3' }} />
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
                    {items.reduce((sum, item) => sum + item.totalReviews, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    All items combined
                  </Typography>
                </Box>
                <ReviewsIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category Filter</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category Filter"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="appetizers">Appetizers</MenuItem>
                  <MenuItem value="mains">Main Courses</MenuItem>
                  <MenuItem value="desserts">Desserts</MenuItem>
                  <MenuItem value="beverages">Beverages</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Items with Attention Needed */}
      {items.filter(item => item.needsAttention).length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Items Requiring Attention
          </Typography>
          <Grid container spacing={2}>
            {items.filter(item => item.needsAttention).slice(0, 3).map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid',
                    borderColor: 'warning.main',
                    borderRadius: 1,
                    backgroundColor: 'warning.light',
                    color: 'warning.contrastText'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {item.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Rating value={item.averageRating} readOnly size="small" />
                    <Typography variant="body2">
                      ({item.totalReviews} reviews)
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {item.averageRating < 3 ? 'Low rating' : 
                     item.totalReviews === 0 ? 'No reviews' : 
                     'Trending down'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Alert>
      )}

      {/* Performance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Menu Items Performance
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Menu Item</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'rating'}
                      direction={sortBy === 'rating' ? sortOrder : 'asc'}
                      onClick={() => handleSort('rating')}
                    >
                      Rating
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'review_count'}
                      direction={sortBy === 'review_count' ? sortOrder : 'asc'}
                      onClick={() => handleSort('review_count')}
                    >
                      Reviews
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Trend</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === 'recent_activity'}
                      direction={sortBy === 'recent_activity' ? sortOrder : 'asc'}
                      onClick={() => handleSort('recent_activity')}
                    >
                      Last Review
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No menu items found
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const performance = getPerformanceLevel(item.averageRating, item.totalReviews);
                    
                    return (
                      <TableRow key={item.menuItemId} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {item.name}
                            </Typography>
                            {item.needsAttention && (
                              <Chip
                                icon={<WarningIcon />}
                                label="Needs Attention"
                                size="small"
                                color="warning"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={item.category}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Rating value={item.averageRating} readOnly size="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {item.averageRating.toFixed(1)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.totalReviews.toLocaleString()}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getTrendIcon(item.recentTrend)}
                            <Chip
                              label={item.recentTrend > 0 ? `+${item.recentTrend.toFixed(2)}` : item.recentTrend.toFixed(2)}
                              size="small"
                              color={getTrendColor(item.recentTrend)}
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={performance.level}
                            size="small"
                            color={performance.color}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">
                            {item.lastReviewDate 
                              ? new Date(item.lastReviewDate).toLocaleDateString()
                              : 'No reviews'
                            }
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedItem(item);
                                setDetailsOpen(true);
                              }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={totalItems}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* Item Details Modal */}
      {selectedItem && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedItem.name} - Detailed Performance
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Rating Overview
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Rating value={selectedItem.averageRating} readOnly />
                  <Typography variant="h5">
                    {selectedItem.averageRating.toFixed(1)}/5.0
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Total Reviews: {selectedItem.totalReviews}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Recent Trend: {selectedItem.recentTrend > 0 ? '+' : ''}{selectedItem.recentTrend.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last Review: {selectedItem.lastReviewDate 
                      ? new Date(selectedItem.lastReviewDate).toLocaleDateString()
                      : 'No reviews'
                    }
                  </Typography>
                </Box>

                {/* Rating Distribution Bars */}
                <Typography variant="subtitle2" gutterBottom>
                  Rating Distribution
                </Typography>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = selectedItem.ratingDistribution[rating as keyof typeof selectedItem.ratingDistribution];
                  const percentage = selectedItem.totalReviews > 0 
                    ? (count / selectedItem.totalReviews) * 100 
                    : 0;
                  
                  return (
                    <Box key={rating} display="flex" alignItems="center" gap={2} mb={1}>
                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                        {rating}★
                      </Typography>
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
                      <Typography variant="body2" sx={{ minWidth: 50 }}>
                        {count} ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                  );
                })}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Visual Distribution
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut
                    data={getDistributionChartData(selectedItem.ratingDistribution)}
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
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MenuItemRatingPerformance;