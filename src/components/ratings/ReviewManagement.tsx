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
  Rating,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Alert,
  Collapse,
  Avatar,
  Divider,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  Flag as FlagIcon,
  CheckCircle as VerifiedIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import RatingService, { Review, ReviewFilters } from '../../services/RatingService';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatDistanceToNow } from 'date-fns';

const ReviewManagement: React.FC = () => {
  const { selectedRestaurant } = useRestaurant();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalReviews, setTotalReviews] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [expandedFilters, setExpandedFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 10,
    sortBy: 'recent'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | ''>('');
  const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null);
  const [dateToFilter, setDateToFilter] = useState<Date | null>(null);

  const loadReviews = async () => {
    if (!selectedRestaurant?._id) return;
    
    try {
      setLoading(true);
      const response = await RatingService.getRestaurantReviews(
        selectedRestaurant._id,
        {
          ...filters,
          page: page + 1,
          limit: rowsPerPage,
          searchTerm: searchTerm || undefined,
          minRating: ratingFilter || undefined,
          maxRating: ratingFilter || undefined,
          verifiedOnly: verifiedFilter === true ? true : undefined,
          dateFrom: dateFromFilter?.toISOString(),
          dateTo: dateToFilter?.toISOString()
        }
      );
      setReviews(response.reviews);
      setTotalReviews(response.pagination.totalReviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setPage(0);
    loadReviews();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRatingFilter('');
    setVerifiedFilter('');
    setDateFromFilter(null);
    setDateToFilter(null);
    setFilters({ page: 1, limit: 10, sortBy: 'recent' });
    setPage(0);
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    
    try {
      await RatingService.respondToReview(selectedReview._id, replyText);
      setReplyDialogOpen(false);
      setReplyText('');
      loadReviews(); // Refresh to show the reply
    } catch (error) {
      console.error('Failed to reply to review:', error);
    }
  };

  const handleFlag = async () => {
    if (!selectedReview) return;
    
    try {
      await RatingService.flagReview(selectedReview._id, flagReason);
      setFlagDialogOpen(false);
      setFlagReason('');
      loadReviews(); // Refresh to show flagged status
    } catch (error) {
      console.error('Failed to flag review:', error);
    }
  };

  const handleUnflag = async (review: Review) => {
    try {
      await RatingService.unflagReview(review._id);
      loadReviews(); // Refresh to show unflagged status
    } catch (error) {
      console.error('Failed to unflag review:', error);
    }
  };

  const getSeverityColor = (rating: number) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'warning';
    return 'error';
  };

  const getRatingText = (rating: number) => {
    const texts = {
      5: 'Excellent',
      4: 'Good',
      3: 'Average',
      2: 'Poor',
      1: 'Terrible'
    };
    return texts[rating as keyof typeof texts] || 'Unknown';
  };

  useEffect(() => {
    loadReviews();
  }, [selectedRestaurant, page, rowsPerPage, filters]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Review Management
          </Typography>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setExpandedFilters(!expandedFilters)}
            endIcon={expandedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expandedFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>

        {/* Filters Section */}
        <Collapse in={expandedFilters}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Filters & Search
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search Reviews"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    placeholder="Search in comments..."
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Rating</InputLabel>
                    <Select
                      value={ratingFilter}
                      label="Rating"
                      onChange={(e) => setRatingFilter(e.target.value as number | '')}
                    >
                      <MenuItem value="">All Ratings</MenuItem>
                      <MenuItem value={5}>5 Stars</MenuItem>
                      <MenuItem value={4}>4 Stars</MenuItem>
                      <MenuItem value={3}>3 Stars</MenuItem>
                      <MenuItem value={2}>2 Stars</MenuItem>
                      <MenuItem value={1}>1 Star</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Verified</InputLabel>
                    <Select
                      value={verifiedFilter}
                      label="Verified"
                      onChange={(e) => setVerifiedFilter(e.target.value as boolean | '')}
                    >
                      <MenuItem value="">All Reviews</MenuItem>
                      <MenuItem value={true}>Verified Only</MenuItem>
                      <MenuItem value={false}>Unverified Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="From Date"
                    value={dateFromFilter}
                    onChange={setDateFromFilter}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="To Date"
                    value={dateToFilter}
                    onChange={setDateToFilter}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
              </Grid>
              <Box mt={2}>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                  <Button variant="outlined" onClick={clearFilters}>
                    Clear All
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Reviews Table */}
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Menu Item</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Comment</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Loading reviews...
                      </TableCell>
                    </TableRow>
                  ) : reviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reviews.map((review) => (
                      <TableRow key={review._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {review.user?.firstName} {review.user?.lastName}
                              </Typography>
                              {review.verifiedPurchase && (
                                <Chip
                                  icon={<VerifiedIcon />}
                                  label="Verified"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {review.menuItem?.name || 'Unknown Item'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            ${review.menuItem?.price?.toFixed(2)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Chip
                              label={getRatingText(review.rating)}
                              size="small"
                              color={getSeverityColor(review.rating)}
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {review.comment}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {review.flagged && (
                              <Chip
                                icon={<WarningIcon />}
                                label="Flagged"
                                size="small"
                                color="error"
                              />
                            )}
                            {review.helpfulVotes.up > 0 && (
                              <Chip
                                icon={<ThumbUpIcon />}
                                label={review.helpfulVotes.up.toString()}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </TableCell>
                        
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Reply to Review">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedReview(review);
                                  setReplyDialogOpen(true);
                                }}
                              >
                                <ReplyIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {review.flagged ? (
                              <Tooltip title="Unflag Review">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleUnflag(review)}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Flag Review">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setFlagDialogOpen(true);
                                  }}
                                >
                                  <FlagIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              component="div"
              count={totalReviews}
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

        {/* View Review Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Review Details</DialogTitle>
          <DialogContent>
            {selectedReview && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Customer Information
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar>
                        {selectedReview.user?.firstName?.[0]}{selectedReview.user?.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedReview.user?.firstName} {selectedReview.user?.lastName}
                        </Typography>
                        {selectedReview.verifiedPurchase && (
                          <Chip
                            icon={<VerifiedIcon />}
                            label="Verified Purchase"
                            size="small"
                            color="success"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Review Date: {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </Typography>
                    
                    {selectedReview.orderId && (
                      <Typography variant="body2" color="textSecondary">
                        Order ID: {selectedReview.orderId}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Menu Item
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedReview.menuItem?.name || 'Unknown Item'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedReview.menuItem?.description}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Price: ${selectedReview.menuItem?.price?.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>
                  Rating & Review
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Rating value={selectedReview.rating} readOnly />
                  <Typography variant="h6">
                    {selectedReview.rating}/5 - {getRatingText(selectedReview.rating)}
                  </Typography>
                </Box>
                
                <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="body1">
                    "{selectedReview.comment}"
                  </Typography>
                </Paper>
                
                {selectedReview.helpfulVotes.up > 0 || selectedReview.helpfulVotes.down > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Helpful votes: {selectedReview.helpfulVotes.up} up, {selectedReview.helpfulVotes.down} down
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog
          open={replyDialogOpen}
          onClose={() => setReplyDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reply to Review</DialogTitle>
          <DialogContent>
            {selectedReview && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Your reply will be visible to all customers viewing this review.
                  </Typography>
                </Alert>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Replying to: "{selectedReview.comment}"
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Your Response"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for your feedback..."
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleReply}
              variant="contained"
              disabled={!replyText.trim()}
            >
              Send Reply
            </Button>
          </DialogActions>
        </Dialog>

        {/* Flag Dialog */}
        <Dialog
          open={flagDialogOpen}
          onClose={() => setFlagDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Flag Review</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Flagging a review will mark it for moderation. Please provide a reason.
              </Typography>
            </Alert>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason for Flagging"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Inappropriate content, spam, etc."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFlagDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleFlag}
              variant="contained"
              color="warning"
              disabled={!flagReason.trim()}
            >
              Flag Review
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ReviewManagement;