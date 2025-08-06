import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  LinearProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import stripeConnectService, {
  ConnectedAccount,
  PaymentAnalytics,
  PlatformFeeSettings,
  PaymentRecord
} from '../../services/StripeConnectService';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const StripeConnectDashboard: React.FC = () => {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  
  const [loading, setLoading] = useState(true);
  const [connectAccount, setConnectAccount] = useState<ConnectedAccount | null>(null);
  const [paymentAnalytics, setPaymentAnalytics] = useState<PaymentAnalytics | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [platformFeeConfig, setPlatformFeeConfig] = useState<PlatformFeeSettings | null>(null);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [feeConfigDialogOpen, setFeeConfigDialogOpen] = useState(false);
  const [newFeeRate, setNewFeeRate] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date()
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoading(true);
      
      try {
        // Load Stripe Connect account
        const accountData = await stripeConnectService.getConnectedAccount(currentBusiness._id);
        setConnectAccount(accountData);
      } catch (error) {
        console.error('Failed to load account:', error);
      }

      try {
        // Load payment analytics
        const analyticsData = await stripeConnectService.getPaymentAnalytics(
          currentBusiness._id,
          dateRange.startDate.toISOString(),
          dateRange.endDate.toISOString()
        );
        setPaymentAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }

      try {
        // Load payment records
        const paymentsData = await stripeConnectService.getPaymentRecords(
          currentBusiness._id,
          1,
          50,
          dateRange.startDate.toISOString(),
          dateRange.endDate.toISOString()
        );
        setPayments(paymentsData.payments);
      } catch (error) {
        console.error('Failed to load payments:', error);
      }

      try {
        // Load platform fee configuration
        const feeConfigData = await stripeConnectService.getFeeSettings(currentBusiness._id);
        setPlatformFeeConfig(feeConfigData);
        setNewFeeRate(feeConfigData.percentageRate.toString());
      } catch (error) {
        console.error('Failed to load fee settings:', error);
      }

    } catch (error) {
      console.error('Failed to load Stripe Connect data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSetupConnect = async () => {
    if (!currentBusiness?._id) return;
    
    try {
      const result = await stripeConnectService.createConnectedAccount({
        businessId: currentBusiness._id,
        businessName: currentBusiness.name || 'My Business',
        businessType: 'company',
        country: 'US',
        email: user?.email || ''
      });
      const onboardingUrl = result.onboardingUrl;
      
      // Redirect to Stripe onboarding
      window.open(onboardingUrl, '_blank');
      setSetupDialogOpen(false);
      
    } catch (error) {
      console.error('Failed to create Connect account:', error);
    }
  };

  const handleUpdateFeeConfig = async () => {
    if (!currentBusiness?._id || !newFeeRate) return;
    
    try {
      await stripeConnectService.updateFeeSettings(
        currentBusiness._id,
        {
          feeType: 'percentage',
          percentageRate: parseFloat(newFeeRate)
        }
      );
      
      setFeeConfigDialogOpen(false);
      await refreshData();
      
    } catch (error) {
      console.error('Failed to update fee configuration:', error);
    }
  };

  const handleGenerateReport = async (type: 'payments' | 'transfers' | 'fees', format: 'csv' | 'pdf') => {
    if (!currentBusiness?._id) return;
    
    try {
      // Report generation not implemented in service yet
      console.log('Report generation requested:', type, format);
      return;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${"restaurant"}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentBusiness?._id, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  const getAccountStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete': return 'success';
      case 'pending': return 'warning';
      case 'restricted': return 'error';
      default: return 'default';
    }
  };

  const getAccountStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete': return <CheckIcon color="success" />;
      case 'pending': return <WarningIcon color="warning" />;
      case 'restricted': return <ErrorIcon color="error" />;
      default: return <InfoIcon />;
    }
  };

  const getRevenueChartData = () => {
    if (!paymentAnalytics?.dailyBreakdown) return { labels: [], datasets: [] };

    return {
      labels: paymentAnalytics.dailyBreakdown.map(day => 
        new Date(day.date).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Gross Revenue ($)',
          data: paymentAnalytics.dailyBreakdown.map(day => day.revenue / 100),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4
        },
        {
          label: 'Platform Fees ($)',
          data: paymentAnalytics.dailyBreakdown.map(day => day.fees / 100),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4
        },
        {
          label: 'Net Revenue ($)',
          data: paymentAnalytics.dailyBreakdown.map(day => (day.revenue - day.fees) / 100),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" gutterBottom>
            Stripe Connect Dashboard
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={refreshData} disabled={refreshing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleGenerateReport('payments', 'csv')}
              variant="outlined"
            >
              Export Payments
            </Button>
            <Button
              startIcon={<SettingsIcon />}
              onClick={() => setFeeConfigDialogOpen(true)}
              variant="outlined"
            >
              Fee Settings
            </Button>
          </Stack>
        </Box>

        {/* Connection Status */}
        {!connectAccount && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Stripe Connect Not Set Up</AlertTitle>
            To receive payments and manage platform fees, you need to set up your Stripe Connect account.
            <Button
              variant="contained"
              color="primary"
              sx={{ ml: 2 }}
              onClick={() => setSetupDialogOpen(true)}
            >
              Set Up Now
            </Button>
          </Alert>
        )}

        {connectAccount && connectAccount.accountStatus !== 'complete' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Account Setup Incomplete</AlertTitle>
            Your Stripe Connect account setup is {connectAccount.accountStatus}. 
            {connectAccount.requirementsURL ? (
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                onClick={() => window.open(connectAccount.requirementsURL, '_blank')}
              >
                Complete Setup
              </Button>
            ) : connectAccount.accountStatus === 'not_connected' ? (
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                onClick={() => setSetupDialogOpen(true)}
              >
                Connect to Stripe
              </Button>
            ) : null}
          </Alert>
        )}

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
            </Grid>
          </CardContent>
        </Card>

        {/* Account Information */}
        {connectAccount && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getAccountStatusIcon(connectAccount.accountStatus)}
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Account Status
                      </Typography>
                      <Chip
                        label={connectAccount.accountStatus}
                        color={getAccountStatusColor(connectAccount.accountStatus) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="textSecondary">
                    Account ID
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {connectAccount.stripeAccountId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="textSecondary">
                    Country
                  </Typography>
                  <Typography variant="body1">
                    {connectAccount.country}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="textSecondary">
                    Created
                  </Typography>
                  <Typography variant="body1">
                    {new Date(connectAccount.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        {paymentAnalytics && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Gross Revenue
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(paymentAnalytics.totalRevenue)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {paymentAnalytics.transactionCount} transactions
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, color: '#4caf50' }} />
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
                        Platform Fees
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(paymentAnalytics.platformFees)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {platformFeeConfig?.percentageRate || 5}% fee rate
                      </Typography>
                    </Box>
                    <PaymentIcon sx={{ fontSize: 40, color: '#ff9800' }} />
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
                        Net Revenue
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(paymentAnalytics.restaurantEarnings)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        After platform fees
                      </Typography>
                    </Box>
                    <BankIcon sx={{ fontSize: 40, color: '#2196f3' }} />
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
                        Avg Transaction
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(paymentAnalytics.averageOrderValue)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Per order
                      </Typography>
                    </Box>
                    <ReceiptIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Revenue Chart */}
        {paymentAnalytics && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trends
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line
                  data={getRevenueChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index' as const,
                      intersect: false,
                    },
                    scales: {
                      y: {
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                        title: {
                          display: true,
                          text: 'Amount ($)'
                        }
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Recent Transfers */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Transfers
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Transfer ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Platform Fee</TableCell>
                    <TableCell>Net Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Arrival Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="textSecondary">
                          No transfers found for the selected date range
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell>
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {payment.stripePaymentIntentId || payment._id}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{formatCurrency(payment.platformFee || 0)}</TableCell>
                        <TableCell>{formatCurrency(payment.amount - (payment.platformFee || 0))}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={payment.status === 'succeeded' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {payment.processedAt ? 
                            new Date(payment.processedAt).toLocaleDateString() : 
                            'Pending'
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Platform Fee Configuration */}
        {platformFeeConfig && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Fee Configuration
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Fee Percentage
                  </Typography>
                  <Typography variant="h5">
                    {platformFeeConfig.percentageRate}%
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Fixed Fee
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(platformFeeConfig.fixedAmount || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={platformFeeConfig.isActive ? 'Active' : 'Inactive'}
                    color={platformFeeConfig.isActive ? 'success' : 'default'}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Setup Dialog */}
        <Dialog open={setupDialogOpen} onClose={() => setSetupDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Set Up Stripe Connect</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Setting up Stripe Connect will allow you to:
            </Typography>
            <ul>
              <li>Receive payments directly to your bank account</li>
              <li>Manage platform fees automatically</li>
              <li>Get detailed payment analytics</li>
              <li>Handle refunds and disputes</li>
            </ul>
            <Alert severity="info" sx={{ mt: 2 }}>
              You'll be redirected to Stripe to complete the setup process.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSetupDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSetupConnect} variant="contained">
              Set Up Connect Account
            </Button>
          </DialogActions>
        </Dialog>

        {/* Fee Configuration Dialog */}
        <Dialog open={feeConfigDialogOpen} onClose={() => setFeeConfigDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Platform Fee Configuration</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Fee Percentage (%)"
                type="number"
                value={newFeeRate}
                onChange={(e) => setNewFeeRate(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Platform fee percentage (e.g., 5 for 5%)"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
              
              <Alert severity="info">
                <Typography variant="body2">
                  Current configuration: {platformFeeConfig?.percentageRate}% + {formatCurrency(platformFeeConfig?.fixedAmount || 0)} per transaction
                </Typography>
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFeeConfigDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateFeeConfig} variant="contained">
              Update Configuration
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default StripeConnectDashboard;