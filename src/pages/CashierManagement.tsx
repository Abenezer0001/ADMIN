import * as React from 'react';
const { useState, useEffect } = React;
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
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
  Alert,
  Skeleton,
  Fab,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  FormHelperText
} from '@mui/material';
import {
  PointOfSale,
  Add,
  Edit,
  Delete,
  Person,
  Store,
  Schedule,
  TrendingUp,
  ExpandMore,
  PlayArrow,
  Stop,
  Settings,
  Group,
  AttachMoney,
  Receipt,
  AssignmentInd,
  AccessTime,
  Star,
  Work,
  Business
} from '@mui/icons-material';
import { cashierService, CashierUser, CashierShift, CashierAssignment, CashierPerformanceMetrics, CashierStats } from '../services/CashierService';
import { restaurantService } from '../services/RestaurantService';
import RestaurantVenueSelector from '../components/common/RestaurantVenueSelector';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cashier-tabpanel-${index}`}
      aria-labelledby={`cashier-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CashierManagement: React.FC = () => {
  const { user } = useAuth();
  const { 
    selectedRestaurantId: globalRestaurantId, 
    selectedVenueId: globalVenueId,
    selectedBusinessId: globalBusinessId,
    setSelectedBusiness,
    setSelectedRestaurant,
    setSelectedVenue
  } = useRestaurant();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedCashier, setSelectedCashier] = useState<CashierUser | null>(null);
  const [cashierAssignments, setCashierAssignments] = useState<CashierAssignment[]>([]);
  const [activeShifts, setActiveShifts] = useState<CashierShift[]>([]);
  const [cashierStats, setCashierStats] = useState<CashierStats | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<CashierPerformanceMetrics | null>(null);
  
  // Use global context values with fallback to user context
  const selectedBusinessId = globalBusinessId || user?.businessId || '';
  const selectedRestaurantId = globalRestaurantId || '';
  const selectedVenueId = globalVenueId || '';
  
  // Dialog states
  const [cashierDialogOpen, setCashierDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState<CashierUser | null>(null);
  
  // Form states
  const [cashierForm, setCashierForm] = useState<any>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    restaurantId: '',
    venueAssignments: []
  });

  const [assignmentForm, setAssignmentForm] = useState({
    venue: '',
    workingHours: {
      start: '09:00',
      end: '17:00'
    }
  });

  const [shiftForm, setShiftForm] = useState({
    venue: '',
    openingBalance: 0,
    notes: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock venues data - in real app, this would come from a venue service
  const venues = [
    { _id: '1', name: 'Main Location', address: '123 Main St' },
    { _id: '2', name: 'Downtown Branch', address: '456 Downtown Ave' },
    { _id: '3', name: 'Mall Location', address: '789 Mall Blvd' }
  ];

  useEffect(() => {
    loadCashiers();
    loadCashierStats();
    loadRestaurants();
    document.title = 'Cashier Management';
  }, []);
  
  // Load restaurants for dropdown selection
  const loadRestaurants = async () => {
    try {
      console.log('Fetching restaurants...');
      const response = await restaurantService.getAllRestaurants();
      console.log('Restaurants loaded:', response);
      if (Array.isArray(response)) {
        setRestaurants(response);
      } else {
        console.error('Unexpected restaurant data format:', response);
        setRestaurants([]);
      }
    } catch (error: any) {
      console.error('Error loading restaurants:', error);
      setError('Failed to load restaurants: ' + error.message);
      setRestaurants([]);
    }
  };

  const loadCashiers = async () => {
    try {
      setLoading(true);
      const response = await cashierService.getAllCashiers();
      // Ensure cashiers is always an array
      if (Array.isArray(response)) {
        setCashiers(response);
      } else if (response && typeof response === 'object') {
        console.warn('Received non-array cashiers data:', response);
        setCashiers([]);
      } else {
        setCashiers([]);
      }
    } catch (error: any) {
      setError('Failed to load cashiers: ' + error.message);
      setCashiers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCashierStats = async () => {
    try {
      const stats = await cashierService.getCashierStats();
      setCashierStats(stats);
    } catch (error: any) {
      console.error('Failed to load cashier stats:', error);
    }
  };

  const loadCashierDetails = async (cashierId: string) => {
    try {
      const [assignments, performance] = await Promise.all([
        cashierService.getCashierAssignments(cashierId),
        cashierService.getCashierPerformance(cashierId)
      ]);
      setCashierAssignments(assignments || []);
      setPerformanceMetrics(performance);
    } catch (error: any) {
      setError('Failed to load cashier details: ' + error.message);
    }
  };

  const loadActiveShifts = async () => {
    try {
      const shifts = await cashierService.getActiveShifts();
      setActiveShifts(shifts || []);
    } catch (error: any) {
      console.error('Failed to load active shifts:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 2) {
      loadActiveShifts();
    }
  };

  const handleCreateCashier = async () => {
    try {
      if (!cashierForm.email || !cashierForm.firstName || !cashierForm.lastName) {
        setError('Please fill in name and email fields');
        return;
      }

      if (!editingCashier && !cashierForm.password) {
        setError('Password is required for new cashiers');
        return;
      }

      if (!cashierForm.restaurantId) {
        setError('Restaurant selection is required');
        return;
      }

      if (editingCashier) {
        const updateData = {
          firstName: cashierForm.firstName,
          lastName: cashierForm.lastName,
          phone: cashierForm.phone,
          restaurantId: cashierForm.restaurantId
        };
        await cashierService.updateCashier(editingCashier._id, updateData);
        setSuccess('Cashier updated successfully');
      } else {
        // Create complete cashier payload with all required fields
        const cashierPayload = {
          ...cashierForm,
          restaurant: cashierForm.restaurantId // Backend expects 'restaurant' key
        };
        console.log('Creating cashier with payload:', cashierPayload);
        await cashierService.createCashier(cashierPayload);
        setSuccess('Cashier created successfully');
      }

      setCashierDialogOpen(false);
      setEditingCashier(null);
      resetCashierForm();
      loadCashiers();
      loadCashierStats();
    } catch (error: any) {
      setError('Failed to save cashier: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAssignVenue = async () => {
    try {
      if (!selectedCashier || !assignmentForm.venue) {
        setError('Please select a venue');
        return;
      }

      await cashierService.assignCashierToVenue(
        selectedCashier._id, 
        assignmentForm.venue, 
        assignmentForm.workingHours
      );
      setSuccess('Venue assigned successfully');
      setAssignmentDialogOpen(false);
      resetAssignmentForm();
      loadCashierDetails(selectedCashier._id);
    } catch (error: any) {
      setError('Failed to assign venue: ' + error.message);
    }
  };

  const handleStartShift = async () => {
    try {
      if (!selectedCashier || !shiftForm.venue) {
        setError('Please select a venue');
        return;
      }

      await cashierService.startShift(selectedCashier._id, shiftForm.venue, shiftForm.openingBalance);
      setSuccess('Shift started successfully');
      setShiftDialogOpen(false);
      resetShiftForm();
      loadActiveShifts();
    } catch (error: any) {
      setError('Failed to start shift: ' + error.message);
    }
  };

  const handleEndShift = async (shiftId: string, closingBalance: number, notes?: string) => {
    try {
      await cashierService.endShift(shiftId, closingBalance, notes);
      setSuccess('Shift ended successfully');
      loadActiveShifts();
      loadCashierStats();
    } catch (error: any) {
      setError('Failed to end shift: ' + error.message);
    }
  };

  const handleDeleteCashier = async (cashierId: string) => {
    try {
      if (!window.confirm('Are you sure you want to delete this cashier? This action cannot be undone.')) {
        return;
      }
      await cashierService.deleteCashier(cashierId);
      setSuccess('Cashier deleted successfully');
      loadCashiers();
      loadCashierStats();
    } catch (error: any) {
      setError('Failed to delete cashier: ' + error.message);
    }
  };

  const handleToggleCashierStatus = async (cashierId: string, isActive: boolean) => {
    try {
      await cashierService.updateCashier(cashierId, { isActive });
      setSuccess(`Cashier ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadCashiers();
    } catch (error: any) {
      setError('Failed to update cashier status: ' + error.message);
    }
  };

  const resetCashierForm = () => {
    setCashierForm({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      restaurantId: '',
      venueAssignments: []
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      venue: '',
      workingHours: {
        start: '09:00',
        end: '17:00'
      }
    });
  };

  const resetShiftForm = () => {
    setShiftForm({
      venue: '',
      openingBalance: 0,
      notes: ''
    });
  };

  const openCashierDialog = (cashier?: CashierUser) => {
    if (cashier) {
      setEditingCashier(cashier);
      setCashierForm({
        email: cashier.email,
        firstName: cashier.firstName,
        lastName: cashier.lastName,
        phone: cashier.phone || '',
        password: '', // Don't show password for editing
        venueAssignments: []
      });
    } else {
      setEditingCashier(null);
      resetCashierForm();
    }
    setCashierDialogOpen(true);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatTime = (time: string) => {
    return new Intl.DateTimeFormat('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    }).format(new Date(`1970-01-01T${time}`));
  };

  const getVenueName = (venueId: string) => {
    const venue = venues.find(v => v._id === venueId);
    return venue?.name || 'Unknown Venue';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PointOfSale sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h5" component="h1" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
            Cashier Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => openCashierDialog()}
        >
          Add Cashier
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filters
          </Typography>
          <RestaurantVenueSelector
            selectedBusinessId={selectedBusinessId}
            selectedRestaurantId={selectedRestaurantId}
            selectedVenueId={selectedVenueId}
            onBusinessChange={setSelectedBusiness}
            onRestaurantChange={setSelectedRestaurant}
            onVenueChange={setSelectedVenue}
            showBusinessSelector={true}
            showVenueSelector={true}
            size="small"
          />
        </CardContent>
      </Card>

      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats Cards */}
      {cashierStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Group sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6">{cashierStats.totalCashiers}</Typography>
                    <Typography color="textSecondary">Total Cashiers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Work sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h6">{cashierStats.activeCashiers}</Typography>
                    <Typography color="textSecondary">Active Cashiers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 2, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h6">{cashierStats.activeShifts}</Typography>
                    <Typography color="textSecondary">Active Shifts</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ mr: 2, color: 'info.main' }} />
                  <Box>
                    <Typography variant="h6">{formatCurrency(cashierStats.totalSalesToday)}</Typography>
                    <Typography color="textSecondary">Sales Today</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="cashier management tabs">
          <Tab icon={<Group />} label="Cashiers Overview" />
          <Tab icon={<Person />} label="Cashier Details" />
          <Tab icon={<TrendingUp />} label="Performance Analytics" />
        </Tabs>

        {/* Tab Panel 1: Cashiers Overview */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box>
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} variant="rectangular" height={80} sx={{ mb: 2 }} />
              ))}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {cashiers.map((cashier: any) => (
                <Grid item xs={12} md={6} lg={4} key={cashier._id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {cashier.firstName.charAt(0)}{cashier.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6">
                              {cashier.firstName} {cashier.lastName}
                            </Typography>
                            <Typography color="textSecondary" variant="body2">
                              {cashier.email}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={cashier.isActive ? 'Active' : 'Inactive'} 
                          color={getStatusColor(cashier.isActive)}
                          size="small"
                        />
                      </Box>

                      {cashier.phone && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          📞 {cashier.phone}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedCashier(cashier);
                              loadCashierDetails(cashier._id);
                              setTabValue(1);
                            }}
                          >
                            <Person />
                          </IconButton>
                          <IconButton size="small" onClick={() => openCashierDialog(cashier)}>
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteCashier(cashier._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={cashier.isActive}
                              onChange={(e) => handleToggleCashierStatus(cashier._id, e.target.checked)}
                              size="small"
                            />
                          }
                          label=""
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Tab Panel 2: Cashier Details */}
        <TabPanel value={tabValue} index={1}>
          {selectedCashier ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                        {selectedCashier.firstName.charAt(0)}{selectedCashier.lastName.charAt(0)}
                      </Avatar>
                      <Typography variant="h5">
                        {selectedCashier.firstName} {selectedCashier.lastName}
                      </Typography>
                      <Typography color="textSecondary">
                        {selectedCashier.email}
                      </Typography>
                      {selectedCashier.phone && (
                        <Typography color="textSecondary">
                          📞 {selectedCashier.phone}
                        </Typography>
                      )}
                      <Chip 
                        label={selectedCashier.isActive ? 'Active' : 'Inactive'} 
                        color={getStatusColor(selectedCashier.isActive)}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Store />}
                      onClick={() => setAssignmentDialogOpen(true)}
                      sx={{ mb: 1 }}
                    >
                      Assign Venue
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={() => setShiftDialogOpen(true)}
                    >
                      Start Shift
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Venue Assignments</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {cashierAssignments.length > 0 ? (
                      <List>
                        {cashierAssignments.map((assignment, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Business />
                            </ListItemIcon>
                            <ListItemText
                              primary={getVenueName(assignment.venue)}
                              secondary={`${formatTime(assignment.workingHours.start)} - ${formatTime(assignment.workingHours.end)}`}
                            />
                            <Chip 
                              label={assignment.isActive ? 'Active' : 'Inactive'} 
                              color={getStatusColor(assignment.isActive)}
                              size="small"
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="textSecondary">No venue assignments</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>

                {performanceMetrics && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6">Performance Metrics</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Total Sales</Typography>
                          <Typography variant="h6">{formatCurrency(performanceMetrics.totalSales)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Transactions</Typography>
                          <Typography variant="h6">{performanceMetrics.transactionCount}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Avg Transaction</Typography>
                          <Typography variant="h6">{formatCurrency(performanceMetrics.averageTransactionValue)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Shifts Completed</Typography>
                          <Typography variant="h6">{performanceMetrics.shiftsCompleted}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Avg Shift Duration</Typography>
                          <Typography variant="h6">{Math.round(performanceMetrics.averageShiftDuration)}h</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">Customer Rating</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6">{performanceMetrics.customerRating.toFixed(1)}</Typography>
                            <Star sx={{ ml: 0.5, color: 'warning.main' }} />
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Select a cashier to view details
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* Tab Panel 3: Performance Analytics */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Active Shifts</Typography>
                  {activeShifts.length > 0 ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Cashier</TableCell>
                            <TableCell>Venue</TableCell>
                            <TableCell>Start Time</TableCell>
                            <TableCell>Opening Balance</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activeShifts.map((shift) => (
                            <TableRow key={shift._id}>
                              <TableCell>
                                {typeof shift.cashier === 'object' 
                                  ? `${shift.cashier.firstName} ${shift.cashier.lastName}`
                                  : shift.cashier
                                }
                              </TableCell>
                              <TableCell>{getVenueName(shift.venue)}</TableCell>
                              <TableCell>
                                {new Date(shift.shiftStart).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>{formatCurrency(shift.openingBalance)}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Stop />}
                                  onClick={() => {
                                    const closingBalance = window.prompt('Enter closing balance:', '0');
                                    if (closingBalance !== null) {
                                      handleEndShift(shift._id, parseFloat(closingBalance) || 0);
                                    }
                                  }}
                                >
                                  End Shift
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="textSecondary">No active shifts</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Today's Statistics</Typography>
                  {cashierStats && (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {cashierStats.transactionsToday}
                          </Typography>
                          <Typography color="textSecondary">Transactions</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" color="success.main">
                            {formatCurrency(cashierStats.totalSalesToday)}
                          </Typography>
                          <Typography color="textSecondary">Total Sales</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Create/Edit Cashier Dialog */}
      <Dialog open={cashierDialogOpen} onClose={() => setCashierDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingCashier ? 'Edit Cashier' : 'Add New Cashier'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Restaurant selection - Required field */}
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Restaurant</InputLabel>
                <Select
                  value={cashierForm.restaurantId}
                  onChange={(e) => setCashierForm({...cashierForm, restaurantId: e.target.value})}
                  label="Restaurant"
                >
                  {restaurants && restaurants.length > 0 ? (
                    restaurants.map((restaurant: any) => (
                      <MenuItem key={restaurant._id} value={restaurant._id}>
                        {restaurant.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Loading restaurants...</MenuItem>
                  )}
                </Select>
                <FormHelperText>Required for cashier creation</FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={cashierForm.email}
                onChange={(e) => setCashierForm({...cashierForm, email: e.target.value})}
                disabled={!!editingCashier}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={cashierForm.firstName}
                onChange={(e) => setCashierForm({...cashierForm, firstName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={cashierForm.lastName}
                onChange={(e) => setCashierForm({...cashierForm, lastName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={cashierForm.phone}
                onChange={(e) => setCashierForm({...cashierForm, phone: e.target.value})}
              />
            </Grid>
            {!editingCashier && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={cashierForm.password}
                  onChange={(e) => setCashierForm({...cashierForm, password: e.target.value})}
                  required
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCashierDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCashier} variant="contained">
            {editingCashier ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Venue Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Venue</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select
                  value={assignmentForm.venue}
                  onChange={(e) => setAssignmentForm({...assignmentForm, venue: e.target.value})}
                  required
                >
                  {venues.map((venue) => (
                    <MenuItem key={venue._id} value={venue._id}>
                      {venue.name} - {venue.address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="time"
                value={assignmentForm.workingHours.start}
                onChange={(e) => setAssignmentForm({
                  ...assignmentForm, 
                  workingHours: {...assignmentForm.workingHours, start: e.target.value}
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="time"
                value={assignmentForm.workingHours.end}
                onChange={(e) => setAssignmentForm({
                  ...assignmentForm, 
                  workingHours: {...assignmentForm.workingHours, end: e.target.value}
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignVenue} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Start Shift Dialog */}
      <Dialog open={shiftDialogOpen} onClose={() => setShiftDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start Shift</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select
                  value={shiftForm.venue}
                  onChange={(e) => setShiftForm({...shiftForm, venue: e.target.value})}
                  required
                >
                  {venues.map((venue) => (
                    <MenuItem key={venue._id} value={venue._id}>
                      {venue.name} - {venue.address}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opening Balance"
                type="number"
                value={shiftForm.openingBalance}
                onChange={(e) => setShiftForm({...shiftForm, openingBalance: parseFloat(e.target.value) || 0})}
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={shiftForm.notes}
                onChange={(e) => setShiftForm({...shiftForm, notes: e.target.value})}
                placeholder="Any notes about the shift..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShiftDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStartShift} variant="contained">
            Start Shift
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CashierManagement; 