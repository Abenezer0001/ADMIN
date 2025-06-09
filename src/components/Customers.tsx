import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import CustomerService, { Customer, CustomersResponse } from '../services/CustomerService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Type definitions
interface CustomerFilter {
  search: string;
  status: 'all' | 'active' | 'inactive';
  business: string;
  restaurant: string;
}

interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  returnRate: number;
  averageSpend: number;
  loyaltyDistribution: Array<{ name: string; value: number; color: string }>;
  customerActivity: Array<{ name: string; signups: number }>;
  demographicData: any[];
}

function CustomersComponent() {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [businesses, setBusinesses] = useState<Array<{ _id: string; name: string }>>([]);
  const [restaurants, setRestaurants] = useState<Array<{ _id: string; name: string; businessId?: string }>>([]);
  const [context, setContext] = useState<'system_admin' | 'business_user'>('business_user');
  const [currentBusinessId, setCurrentBusinessId] = useState<string>('');

  const [filters, setFilters] = useState<CustomerFilter>({
    search: '',
    status: 'all',
    business: '',
    restaurant: ''
  });

  // Load customers and analytics
  useEffect(() => {
    loadCustomers();
    loadAnalytics();
  }, [filters.business, filters.restaurant]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: CustomersResponse = await CustomerService.getCustomers(
        filters.business || undefined,
        filters.restaurant || undefined
      );
      
      setCustomers(response.customers || []);
      setContext(response.context || 'business_user');
      setCurrentBusinessId(response.businessId || '');
      
      if (response.businesses) {
        setBusinesses(response.businesses);
      }
      
      if (response.restaurants) {
        setRestaurants(response.restaurants);
      }
      
    } catch (err: any) {
      console.error('Error loading customers:', err);
      setError(err.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await CustomerService.getCustomerAnalytics(
        filters.business || undefined
      );
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Error loading customer analytics:', err);
      // Analytics is optional, so don't show error to user
    }
  };

  // Filter customers based on search and status
  useEffect(() => {
    let filtered = [...customers];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.firstName?.toLowerCase().includes(searchLower) ||
        customer.lastName?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(customer => 
        filters.status === 'active' ? customer.isActive : !customer.isActive
      );
    }

    setFilteredCustomers(filtered);
    setPage(0); // Reset to first page when filtering
  }, [customers, filters]);

  const handleFilterChange = (key: keyof CustomerFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBusinessChange = (event: SelectChangeEvent<string>) => {
    handleFilterChange('business', event.target.value);
  };

  const handleRestaurantChange = (event: SelectChangeEvent<string>) => {
    handleFilterChange('restaurant', event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleToggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      await CustomerService.updateCustomerStatus(customerId, !currentStatus);
      await loadCustomers(); // Reload to get updated data
    } catch (err: any) {
      console.error('Error updating customer status:', err);
      setError(err.message || 'Failed to update customer status');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (isActive: boolean): 'success' | 'error' => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive: boolean): string => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customer Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <GroupIcon sx={{ color: theme.palette.primary.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{analytics.totalCustomers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Customers
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonAddIcon sx={{ color: theme.palette.success.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{analytics.newCustomers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      New This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ActiveIcon sx={{ color: theme.palette.info.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{analytics.activeCustomers}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Customers
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ color: theme.palette.warning.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{analytics.returnRate}%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activity Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Analytics Charts */}
      {analytics && analytics.loyaltyDistribution.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.loyaltyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.loyaltyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Customer Signups
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.customerActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="signups" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search customers..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {context === 'system_admin' && businesses.length > 0 && (
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <Select
                  value={filters.business}
                  onChange={handleBusinessChange}
                  displayEmpty
                >
                  <MenuItem value="">All Businesses</MenuItem>
                  {businesses.map((business) => (
                    <MenuItem key={business._id} value={business._id}>
                      {business.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          {context === 'system_admin' && restaurants.length > 0 && (
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <Select
                  value={filters.restaurant}
                  onChange={handleRestaurantChange}
                  displayEmpty
                >
                  <MenuItem value="">All Restaurants</MenuItem>
                  {restaurants.map((restaurant) => (
                    <MenuItem key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilters({ search: '', status: 'all', business: '', restaurant: '' })}
              fullWidth
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Customers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                {context === 'system_admin' && <TableCell>Business</TableCell>}
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((customer) => (
                  <TableRow key={customer._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {customer.firstName} {customer.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {customer._id.slice(-8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        {customer.email}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        {customer.phoneNumber || 'N/A'}
                      </Box>
                    </TableCell>
                    
                    {context === 'system_admin' && (
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                          {customer.businessId?.name || 'N/A'}
                        </Box>
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <Chip
                        label={getStatusText(customer.isActive)}
                        color={getStatusColor(customer.isActive)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        {formatDate(customer.createdAt)}
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={customer.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleCustomerStatus(customer._id, customer.isActive)}
                          color={customer.isActive ? 'error' : 'success'}
                        >
                          {customer.isActive ? <BlockIcon /> : <ActiveIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredCustomers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Customer Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Customer Details
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {selectedCustomer.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">
                  {selectedCustomer.phoneNumber || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={getStatusText(selectedCustomer.isActive)}
                  color={getStatusColor(selectedCustomer.isActive)}
                  size="small"
                />
              </Grid>
              
              {context === 'system_admin' && selectedCustomer.businessId && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Business
                  </Typography>
                  <Typography variant="body1">
                    {selectedCustomer.businessId.name}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1">
                  {selectedCustomer.role}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Joined Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedCustomer.createdAt)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedCustomer.updatedAt)}
                </Typography>
              </Grid>
              
              {selectedCustomer.lastLogin && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedCustomer.lastLogin)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CustomersComponent;