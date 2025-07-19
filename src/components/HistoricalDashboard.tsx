import React from 'react';
import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
  Grid,
  Divider,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  LiveTv as LiveOrdersIcon,
  Inventory as InventoryIcon,
  Group as UsersIcon,
  Receipt as InvoiceIcon,
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  QueryStats as QueryStatsIcon,
  AutoGraph as AutoGraphIcon,
  Laptop as LaptopIcon,
  TabletMac as TabletIcon,
  PhoneAndroid as MobileIcon,
  Visibility as VisibilityIcon,
  Restaurant as RestaurantIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Historical data for past performance
const historicalData = [
  { month: 'Jan 2024', revenue: 45000, orders: 320 },
  { month: 'Feb 2024', revenue: 52000, orders: 380 },
  { month: 'Mar 2024', revenue: 48000, orders: 340 },
  { month: 'Apr 2024', revenue: 62000, orders: 420 },
  { month: 'May 2024', revenue: 58000, orders: 390 },
  { month: 'Jun 2024', revenue: 71000, orders: 480 },
  { month: 'Jul 2024', revenue: 68000, orders: 465 },
  { month: 'Aug 2024', revenue: 75000, orders: 510 },
  { month: 'Sep 2024', revenue: 82000, orders: 550 },
  { month: 'Oct 2024', revenue: 89000, orders: 590 },
  { month: 'Nov 2024', revenue: 95000, orders: 620 },
  { month: 'Dec 2024', revenue: 108000, orders: 710 },
];

const HistoricalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  const getUserDisplayName = () => {
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      } else {
        return user.email || 'User';
      }
    }
    return 'User';
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <HistoryIcon sx={{ color: theme.palette.primary.main, fontSize: '2rem' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Historical Dashboard
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
          Comprehensive view of your restaurant's historical performance and trends
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, flex: 1 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Welcome back, {getUserDisplayName()}!
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Here's your historical performance overview
          </Typography>
        </Box>

        {/* Historical Performance Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 1 }}>
                $892K
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Revenue (2024)
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
                +23.5% from 2023
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.success.main, mb: 1 }}>
                5,775
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Total Orders (2024)
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
                +18.2% from 2023
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.warning.main, mb: 1 }}>
                $154
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Average Order Value
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
                +4.8% from 2023
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.info.main, mb: 1 }}>
                96.2%
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Customer Satisfaction
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
                +2.1% from 2023
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Historical Charts */}
        <Grid container spacing={3}>
          {/* Revenue Trend */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue Trend - 2024
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Orders Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Orders - 2024
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar 
                      dataKey="orders" 
                      fill={theme.palette.success.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Year-over-Year Comparison */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Year-over-Year Performance Comparison
              </Typography>
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      name="Revenue ($)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="orders" 
                      stroke={theme.palette.success.main}
                      strokeWidth={3}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AnalyticsIcon />}
                onClick={() => navigate('/analytics')}
                sx={{ py: 1.5 }}
              >
                Detailed Analytics
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<InvoiceIcon />}
                onClick={() => navigate('/invoices')}
                sx={{ py: 1.5 }}
              >
                Export Reports
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RestaurantIcon />}
                onClick={() => navigate('/restaurants')}
                sx={{ py: 1.5 }}
              >
                Restaurant Details
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/settings')}
                sx={{ py: 1.5 }}
              >
                Settings
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default HistoricalDashboard;