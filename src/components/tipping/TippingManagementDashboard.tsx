import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Tooltip,
  Alert,
  AlertTitle,
  Stack,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Payment as PaymentIcon,
  AccountBalance as PayoutIcon,
  Analytics as AnalyticsIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
import TippingService, { 
  TipStatistics, 
  TipRecord, 
  PayoutRecord,
  StaffMember 
} from '../../services/TippingService';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';

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
      id={`tipping-tabpanel-${index}`}
      aria-labelledby={`tipping-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TippingManagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const { selectedRestaurantId } = useRestaurant();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<TipStatistics | null>(null);
  const [tips, setTips] = useState<TipRecord[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date()
  });
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [selectedStaffForPayout, setSelectedStaffForPayout] = useState<StaffMember | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!selectedRestaurantId) {
      console.log('No restaurant selected, waiting...');
      return;
    }
    
    console.log('Loading tipping data for restaurant:', selectedRestaurantId);
    setLoading(true);
    
    // Load statistics with individual error handling
    try {
      const statsData = await TippingService.getTipStatistics({
        restaurantId: selectedRestaurantId,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
        groupBy: 'day'
      });
      setStatistics(statsData);
      console.log('Statistics loaded successfully');
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }

    // Load staff members with individual error handling
    try {
      const staffData = await TippingService.getRestaurantStaff(selectedRestaurantId);
      setStaffMembers(staffData);
      console.log('Staff data loaded successfully');
    } catch (error) {
      console.error('Failed to load staff data:', error);
    }

    // Load recent tips with individual error handling
    try {
      const tipsData = await TippingService.getRecentTips(selectedRestaurantId, {
        limit: 50,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      });
      setTips(tipsData);
      console.log('Tips data loaded successfully');
    } catch (error) {
      console.error('Failed to load tips data:', error);
    }

    // Load recent payouts with individual error handling
    try {
      const payoutsData = await TippingService.getPayoutHistory(selectedRestaurantId, {
        limit: 20
      });
      setPayouts(payoutsData);
      console.log('Payouts data loaded successfully');
    } catch (error) {
      console.error('Failed to load payouts data:', error);
    }

    console.log('Tipping data loading completed');
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleProcessPayout = async () => {
    if (!selectedStaffForPayout || !payoutAmount) return;
    
    try {
      const amount = parseFloat(payoutAmount) * 100; // Convert to cents
      
      await TippingService.processPayout({
        staffId: selectedStaffForPayout._id,
        amount,
        payoutMethod: 'bank_transfer',
        tipIds: [] // This would be populated with specific tip IDs
      });
      
      setPayoutDialogOpen(false);
      setSelectedStaffForPayout(null);
      setPayoutAmount('');
      await refreshData();
      
    } catch (error) {
      console.error('Failed to process payout:', error);
    }
  };

  const handleExportData = async (type: 'tips' | 'payouts', format: 'csv' | 'pdf') => {
    if (!selectedRestaurantId) return;
    
    try {
      const blob = await TippingService.exportData(
        selectedRestaurantId,
        type,
        {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        },
        format
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${"restaurant"}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRestaurantId, dateRange]);

  const getStaffPerformanceChartData = () => {
    if (!statistics?.topRecipients) return { labels: [], datasets: [] };

    return {
      labels: statistics.topRecipients.map(staff => staff.staffName),
      datasets: [
        {
          label: 'Total Tips ($)',
          data: statistics.topRecipients.map(staff => staff.totalTips / 100),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const getTipTrendsChartData = () => {
    if (!statistics?.breakdown) return { labels: [], datasets: [] };

    return {
      labels: statistics.breakdown.map(day => 
        new Date(day.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Daily Tips ($)',
          data: statistics.breakdown.map(day => day.tipAmount / 100),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        },
        {
          label: 'Tip Count',
          data: statistics.breakdown.map(day => day.tipCount),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4,
          yAxisID: 'count'
        }
      ]
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  // Show loading state when data is loading
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading tipping data...
        </Typography>
      </Box>
    );
  }

  // Show message when no restaurant is selected
  if (!selectedRestaurantId) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="400px">
        <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Please select a restaurant to view tipping data
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Tipping Management Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshData} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleExportData('tips', 'csv')}
              variant="outlined"
            >
              Export Tips
            </Button>
            <Button
              startIcon={<PayoutIcon />}
              onClick={() => setPayoutDialogOpen(true)}
              variant="contained"
              color="primary"
            >
              Process Payout
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
                  <InputLabel>Staff Member</InputLabel>
                  <Select
                    value={selectedStaff}
                    label="Staff Member"
                    onChange={(e) => setSelectedStaff(e.target.value)}
                  >
                    <MenuItem value="">All Staff</MenuItem>
                    {staffMembers.map((staff) => (
                      <MenuItem key={staff._id} value={staff._id}>
                        {staff.name} ({staff.role})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        {statistics && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Tips
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(statistics.totals.totalTipAmount)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {statistics.totals.totalTipCount} tips
                      </Typography>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, color: '#4caf50' }} />
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
                        Average Tip
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(statistics.totals.averageTipAmount)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {statistics.totals.averageTipPercentage.toFixed(1)}% avg
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
                        Staff Members
                      </Typography>
                      <Typography variant="h4">
                        {statistics.totals.totalStaffMembers}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Active recipients
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, color: '#2196f3' }} />
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
                        Orders with Tips
                      </Typography>
                      <Typography variant="h4">
                        {statistics.totals.totalOrders}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        This period
                      </Typography>
                    </Box>
                    <ReceiptIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab icon={<AnalyticsIcon />} label="Analytics" />
            <Tab icon={<PaymentIcon />} label="Recent Tips" />
            <Tab icon={<PayoutIcon />} label="Payouts" />
            <Tab icon={<PeopleIcon />} label="Staff Performance" />
          </Tabs>
        </Box>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            {/* Tip Trends Chart */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tip Trends Over Time
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <Line
                      data={getTipTrendsChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            type: 'linear' as const,
                            display: true,
                            position: 'left' as const,
                            title: {
                              display: true,
                              text: 'Tip Amount ($)'
                            }
                          },
                          count: {
                            type: 'linear' as const,
                            display: true,
                            position: 'right' as const,
                            title: {
                              display: true,
                              text: 'Tip Count'
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

            {/* Staff Performance Chart */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Performers
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <Bar
                      data={getStaffPerformanceChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y' as const,
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Recent Tips Tab */}
        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Tips
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Staff Member</TableCell>
                      <TableCell>Order</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tips.map((tip) => (
                      <TableRow key={tip._id}>
                        <TableCell>
                          {new Date(tip.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{tip.customerName}</TableCell>
                        <TableCell>{tip.staffName}</TableCell>
                        <TableCell>{tip.orderNumber}</TableCell>
                        <TableCell>{formatCurrency(tip.amount)}</TableCell>
                        <TableCell>{tip.percentage}%</TableCell>
                        <TableCell>
                          <Chip
                            label={tip.status}
                            color={getStatusColor(tip.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Payouts Tab */}
        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Payout History
                </Typography>
                <Button
                  startIcon={<PayoutIcon />}
                  onClick={() => setPayoutDialogOpen(true)}
                  variant="contained"
                >
                  New Payout
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Staff Member</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Processing Fee</TableCell>
                      <TableCell>Net Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Estimated Arrival</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout._id}>
                        <TableCell>
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payout.staffName}</TableCell>
                        <TableCell>{formatCurrency(payout.amount)}</TableCell>
                        <TableCell>{formatCurrency(payout.processingFee)}</TableCell>
                        <TableCell>{formatCurrency(payout.netAmount)}</TableCell>
                        <TableCell>
                          <Chip
                            label={payout.status}
                            color={getStatusColor(payout.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {payout.estimatedArrival ? 
                            new Date(payout.estimatedArrival).toLocaleDateString() : 
                            'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Staff Performance Tab */}
        <TabPanel value={activeTab} index={3}>
          {statistics && (
            <Grid container spacing={3}>
              {statistics.topRecipients.map((staff) => (
                <Grid item xs={12} md={6} lg={4} key={staff.staffId}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {staff.staffName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {staff.role}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">Total Tips:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(staff.totalTips)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">Tip Count:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {staff.tipCount}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">Average Tip:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(staff.averageTip)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={staff.ranking <= 3 ? (4 - staff.ranking) * 25 : 10}
                          sx={{ mt: 1 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          Ranking: #{staff.ranking}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Payout Dialog */}
        <Dialog open={payoutDialogOpen} onClose={() => setPayoutDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Process Staff Payout</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Staff Member</InputLabel>
                <Select
                  value={selectedStaffForPayout?._id || ''}
                  label="Staff Member"
                  onChange={(e) => {
                    const staff = staffMembers.find(s => s._id === e.target.value);
                    setSelectedStaffForPayout(staff || null);
                  }}
                >
                  {staffMembers.map((staff) => (
                    <MenuItem key={staff._id} value={staff._id}>
                      {staff.name} ({staff.role}) - {formatCurrency(staff.pendingTips || 0)} pending
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Payout Amount ($)"
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Enter amount in dollars (e.g., 125.50)"
              />
              
              {selectedStaffForPayout && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>Payout Information</AlertTitle>
                  <Box>
                    <Typography variant="body2">
                      Staff: {selectedStaffForPayout.name} ({selectedStaffForPayout.role})
                    </Typography>
                    <Typography variant="body2">
                      Pending Tips: {formatCurrency(selectedStaffForPayout.pendingTips || 0)}
                    </Typography>
                    <Typography variant="body2">
                      Processing Fee: ~{((parseFloat(payoutAmount) || 0) * 0.02).toFixed(2)} (2%)
                    </Typography>
                  </Box>
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPayoutDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleProcessPayout}
              variant="contained"
              disabled={!selectedStaffForPayout || !payoutAmount}
            >
              Process Payout
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TippingManagementDashboard;