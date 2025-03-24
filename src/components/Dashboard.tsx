import React, { useState, useMemo } from 'react';
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
  Chip
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
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
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
  Legend
} from 'recharts';

// Type definitions
type DataPoint = { name: string; value: number };
type MonthlyDataPoint = { name: string; value: number };
type DeviceData = { name: string; value: number; color: string };
type QuickLink = {
  label: string;
  icon: React.ReactElement;
  path: string;
  color: string;
  description: string;
};

type AnalyticsIcon = {
  label: string;
  icon: React.ReactElement;
  path: string;
  color: string;
};

// Sample data
const monthlyData = [
  { name: 'Jan', value: 12 },
  { name: 'Feb', value: 40 },
  { name: 'Mar', value: 35 },
  { name: 'Apr', value: 50 },
  { name: 'May', value: 23 },
  { name: 'Jun', value: 15 },
  { name: 'Jul', value: 20 },
  { name: 'Aug', value: 33 },
  { name: 'Sep', value: 15 }
];

const deviceData = [
  { name: 'Desktop', value: 35, color: '#3b82f6' },
  { name: 'Tablet', value: 48, color: '#ec4899' },
  { name: 'Mobile', value: 27, color: '#22c55e' }
];

const totalClicksData = [
  { name: '1', value: 10 },
  { name: '2', value: 15 },
  { name: '3', value: 20 },
  { name: '4', value: 25 },
  { name: '5', value: 30 },
  { name: '6', value: 35 },
  { name: '7', value: 40 },
  { name: '8', value: 45 },
  { name: '9', value: 50 },
  { name: '10', value: 55 }
];

const totalViewsData = [
  { name: '1', value: 55 },
  { name: '2', value: 60 },
  { name: '3', value: 50 },
  { name: '4', value: 65 },
  { name: '5', value: 55 },
  { name: '6', value: 70 },
  { name: '7', value: 65 },
  { name: '8', value: 60 },
  { name: '9', value: 70 }
];

const totalAccountsData = [
  { name: '1', value: 30 },
  { name: '2', value: 40 },
  { name: '3', value: 45 },
  { name: '4', value: 50 },
  { name: '5', value: 45 },
  { name: '6', value: 55 },
  { name: '7', value: 60 },
  { name: '8', value: 65 },
  { name: '9', value: 75 },
  { name: '10', value: 55 }
];

const monthlySalesData = monthlyData.map(data => ({ name: data.name, value: data.value * 100 }));

const salesData = [
  { name: 'Jan', revenue: 1000, orders: 50 },
  { name: 'Feb', revenue: 1200, orders: 60 },
  { name: 'Mar', revenue: 1500, orders: 70 },
  { name: 'Apr', revenue: 1800, orders: 80 },
  { name: 'May', revenue: 2000, orders: 90 },
  { name: 'Jun', revenue: 2200, orders: 100 },
  { name: 'Jul', revenue: 2500, orders: 110 },
  { name: 'Aug', revenue: 2800, orders: 120 },
  { name: 'Sep', revenue: 3000, orders: 130 },
];

const recentOrders = [
  { id: 1, customer: 'John Doe', time: '10 minutes ago', total: 100, status: 'Completed' },
  { id: 2, customer: 'Jane Doe', time: '30 minutes ago', total: 200, status: 'Pending' },
  { id: 3, customer: 'Bob Smith', time: '1 hour ago', total: 300, status: 'Completed' },
  { id: 4, customer: 'Alice Johnson', time: '2 hours ago', total: 400, status: 'Pending' },
  { id: 5, customer: 'Mike Brown', time: '3 hours ago', total: 500, status: 'Completed' },
];

const popularItems = [
  { name: 'Item 1', orders: 100, revenue: 1000 },
  { name: 'Item 2', orders: 80, revenue: 800 },
  { name: 'Item 3', orders: 70, revenue: 700 },
  { name: 'Item 4', orders: 60, revenue: 600 },
  { name: 'Item 5', orders: 50, revenue: 500 },
];

const CircularProgressIndicator = ({ percentage, color }) => {
  const circleSize = 150;
  const strokeWidth = 15;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percentage * circumference) / 100;

  return (
    <Box sx={{ position: 'relative', width: circleSize, height: circleSize, margin: '0 auto' }}>
      <svg width={circleSize} height={circleSize}>
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
          strokeLinecap="round"
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          {percentage}%
        </Typography>
      </Box>
    </Box>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const quickLinksData = useMemo(() => [
    {
      label: 'Live Orders',
      icon: <LiveOrdersIcon />,
      path: '/live-orders',
      color: theme.palette.primary.main,
      description: 'Monitor real-time order activity'
    },
    {
      label: 'Inventory',
      icon: <InventoryIcon />,
      path: '/inventory',
      color: theme.palette.success.main,
      description: 'Manage your food and drink inventory'
    },
    {
      label: 'Customers',
      icon: <UsersIcon />,
      path: '/customers',
      color: theme.palette.warning.main,
      description: 'View and manage customer accounts'
    },
    {
      label: 'Invoices',
      icon: <InvoiceIcon />,
      path: '/invoices',
      color: theme.palette.secondary.main,
      description: 'Access invoice management for orders'
    }
  ], [theme]);

  const analyticsLinksData = useMemo(() => [
    {
      label: 'Sales Overview',
      icon: <AnalyticsIcon />,
      path: '/sales',
      color: theme.palette.primary.main
    },
    {
      label: 'Customer Insights',
      icon: <InsightsIcon />,
      path: '/sales',
      color: theme.palette.success.main
    },
    {
      label: 'Order Performance',
      icon: <QueryStatsIcon />,
      path: '/analytics/order-performance',
      color: theme.palette.warning.main
    },
    {
      label: 'Menu Reports',
      icon: <AutoGraphIcon />,
      path: '/analytics/menu-reports',
      color: theme.palette.secondary.main
    }
  ], [theme]);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleChartClick = (chartId: string) => {
    setSelectedChart(chartId);
    navigate(`/analytics/${chartId}`);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      background: theme.palette.background.default,
      color: theme.palette.text.primary,
      minHeight: '100vh'
    }}>
      {/* Top Navigation Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 4 }}>Dashboard</Typography>
          <Button
            onClick={() => setActiveTab('dashboard')}
            variant={activeTab === 'dashboard' ? 'contained' : 'text'}
            sx={{ 
              mr: 1,
              bgcolor: activeTab === 'dashboard' ? theme.palette.action.selected : 'transparent',
              '&:hover': { bgcolor: activeTab === 'dashboard' ? theme.palette.action.selected : theme.palette.action.hover }
            }}
            startIcon={<Box sx={{ 
              width: 16, 
              height: 16, 
              borderRadius: '2px',
              bgcolor: theme.palette.text.primary
            }} />}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => setActiveTab('analysis')}
            variant={activeTab === 'analysis' ? 'contained' : 'text'}
            sx={{ 
              bgcolor: activeTab === 'analysis' ? theme.palette.action.selected : 'transparent',
              '&:hover': { bgcolor: activeTab === 'analysis' ? theme.palette.action.selected : theme.palette.action.hover }
            }}
            startIcon={<AnalyticsIcon />}
          >
            Analysis
          </Button>
        </Box>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          sx={{ 
            borderColor: theme.palette.divider,
            '&:hover': { borderColor: theme.palette.text.primary, bgcolor: theme.palette.action.hover }
          }}
          onClick={() => navigate('/settings/system')}
        >
          Settings
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, flex: 1 }}>
        {/* Welcome section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 60, 
              height: 60, 
              borderRadius: '50%', 
              bgcolor: theme.palette.primary.main, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mr: 2,
              overflow: 'hidden'
            }}>
              <img 
                src="https://randomuser.me/api/portraits/men/75.jpg" 
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Welcome back</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Jhon Anderson!</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              bgcolor: theme.palette.background.paper, 
              borderRadius: 2, 
              p: 2, 
              mr: 3, 
              display: 'flex', 
              flexDirection: 'column',
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.success.main }}>$65.4K</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Today's Sales</Typography>
              <Box sx={{ width: '100%', height: 4, bgcolor: theme.palette.success.main, mt: 1, borderRadius: 2 }} />
            </Box>
            <Box sx={{ 
              bgcolor: theme.palette.background.paper, 
              borderRadius: 2, 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.error.main }}>78.4%</Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Growth Rate</Typography>
              <Box sx={{ width: '100%', height: 4, bgcolor: theme.palette.error.main, mt: 1, borderRadius: 2 }} />
            </Box>
          </Box>
          <Box sx={{ 
            bgcolor: theme.palette.background.paper, 
            borderRadius: 2, 
            p: 2, 
            display: 'flex',
            alignItems: 'center',
            width: '30%',
            overflow: 'hidden'
          }}>
            <img 
              src="/api/placeholder/400/320"
              alt="Dashboard illustration"
              style={{ 
                maxHeight: '100%', 
                maxWidth: '100%', 
                objectFit: 'contain'
              }}
            />
          </Box>
        </Box>
            {/* Quick Links Section */}
            <Grid item xs={12}>
          <Paper sx={{ 
            bgcolor: theme.palette.background.paper, 
            borderRadius: 2, 
            p: 2,
            mb: 3
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <Typography variant="h6">Quick Links</Typography>
              <IconButton size="small" sx={{ color: theme.palette.text.primary }}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              {quickLinksData.map((link) => (
                <Grid item xs={12} sm={6} md={3} key={link.label}>
                  <Paper
                    onClick={() => navigate(link.path)}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    sx={{ 
                      p: 2,
                      bgcolor: hoveredLink === link.label ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: '1px solid',
                      borderColor: link.color,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 12px ${link.color}33`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box 
                        sx={{ 
                          p: 1, 
                          borderRadius: 1, 
                          bgcolor: `${link.color}22`,
                          color: link.color,
                          mr: 1
                        }}
                      >
                        {link.icon}
                      </Box>
                      <Typography variant="h6">{link.label}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {link.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Analytics Links Section */}
        <Grid item xs={12}>
          <Paper sx={{ 
            bgcolor: theme.palette.background.paper, 
            borderRadius: 2, 
            p: 2,
            mb: 3
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <Typography variant="h6">Analytics</Typography>
              <IconButton size="small" sx={{ color: theme.palette.text.primary }}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              {analyticsLinksData.map((link) => (
                <Grid item xs={12} sm={6} md={3} key={link.label}>
                  <Paper
                    onClick={() => navigate(link.path)}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    sx={{ 
                      p: 2,
                      bgcolor: hoveredLink === link.label ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: '1px solid',
                      borderColor: link.color,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 12px ${link.color}33`
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2,
                        borderRadius: 1,
                        bgcolor: `${link.color}22`,
                        color: link.color,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      {link.icon}
                      <Typography variant="body1" sx={{ mt: 1 }}>{link.label}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Dashboard metrics */}
        <Grid container spacing={3}>
          {/* User stats */}
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              display: 'flex',
              height: '100%'
            }}>
              <Paper
                sx={{ 
                  bgcolor: theme.palette.background.paper, 
                  borderRadius: 2, 
                  p: 2, 
                  flex: 1,
                  mr: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">42.5K</Typography>
                  <IconButton size="small" sx={{ color: theme.palette.text.primary }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Active Customers</Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', flex: 1, mt: 2 }}>
                  <CircularProgressIndicator percentage={78} color={theme.palette.error.main} />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    24K customers increased from last month
                  </Typography>
                </Box>
              </Paper>
              
              <Paper
                sx={{ 
                  bgcolor: theme.palette.background.paper, 
                  borderRadius: 2, 
                  p: 2, 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">97.4K</Typography>
                  <IconButton size="small" sx={{ color: theme.palette.text.primary }}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Total Customers</Typography>
                
                <Box sx={{ flex: 1, mt: 2 }}>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={totalViewsData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={theme.palette.success.main} 
                        strokeWidth={2} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.success.main, mr: 1 }}>12.5%</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    from last month
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
          
          {/* Monthly Revenue chart */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{ 
                bgcolor: theme.palette.background.paper, 
                borderRadius: 2, 
                p: 2,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Monthly Sales</Typography>
                <IconButton size="small" sx={{ color: theme.palette.text.primary }}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={monthlySalesData}
                    onClick={(data) => handleChartClick('monthly-sales')}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: theme.palette.text.secondary }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: theme.palette.text.secondary }} 
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <Box sx={{ 
                              bgcolor: theme.palette.background.paper, 
                              p: 1, 
                              border: '1px solid',
                              borderColor: theme.palette.divider,
                              borderRadius: 1
                            }}>
                              <Typography variant="body2">{label}</Typography>
                              <Typography variant="body2" color={theme.palette.text.primary}>
                                Value: {payload[0].value}
                              </Typography>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill={theme.palette.primary.main} 
                      radius={[4, 4, 0, 0]}
                      onMouseOver={(data) => {
                        if (data.tooltipPosition) {
                          data.tooltipPosition.stroke = theme.palette.primary.main;
                          data.tooltipPosition.strokeWidth = 2;
                        }
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 2 }}>
                Total sales for the month, tracking revenue growth.
              </Typography>
            </Paper>
          </Grid>
          
          {/* Device Type */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{ 
                bgcolor: theme.palette.background.paper, 
                borderRadius: 2, 
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Device Type</Typography>
                <IconButton size="small" sx={{ color: theme.palette.text.primary }}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', width: 200, height: 200 }}>
                  <CircularProgressIndicator percentage={68} color={theme.palette.primary.main} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 50, 
                      left: 0, 
                      right: 0, 
                      textAlign: 'center',
                      color: theme.palette.text.secondary
                    }}
                  >
                    Total Views
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 2 }}>
                {deviceData.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '40%' }}>
                      {item.name === 'Desktop' && <LaptopIcon sx={{ color: item.color, mr: 1 }} />}
                      {item.name === 'Tablet' && <TabletIcon sx={{ color: item.color, mr: 1 }} />}
                      {item.name === 'Mobile' && <MobileIcon sx={{ color: item.color, mr: 1 }} />}
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: item.color, flex: 1, textAlign: 'right' }}>
                      {item.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
          
          {/* Total Clicks */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{ 
                bgcolor: theme.palette.background.paper, 
                borderRadius: 2, 
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">82.7K</Typography>
                <IconButton size="small" sx={{ color: theme.palette.text.primary }}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Total Clicks</Typography>
              
              <Box sx={{ flex: 1, mt: 2 }}>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={totalClicksData}>
                    <Bar 
                      dataKey="value" 
                      fill={theme.palette.error.main} 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: theme.palette.success.main, mr: 1 }}>12.5%</Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  from last month
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Total Views */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{ 
                bgcolor: theme.palette.background.paper, 
                borderRadius: 2, 
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">68.4K</Typography>
                <IconButton size="small" sx={{ color: theme.palette.text.primary }}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Total Views</Typography>
              
              <Box sx={{ flex: 1, mt: 2 }}>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={totalViewsData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={theme.palette.secondary.main} 
                      strokeWidth={2}
                      dot={{ fill: theme.palette.secondary.main, stroke: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: theme.palette.secondary.main, stroke: theme.palette.secondary.main, strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  35K users increased from last month
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Total Accounts */}
          <Grid item xs={12}>
            <Paper
              sx={{ 
                bgcolor: theme.palette.background.paper, 
                borderRadius: 2, 
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h5">85,247</Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Total Accounts</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1" sx={{ color: theme.palette.error.main, mr: 1 }}>23.7%</Typography>
                  <TrendingUpIcon sx={{ color: theme.palette.error.main, transform: 'rotate(180deg)' }} />
                </Box>
              </Box>
              
              <Box sx={{ height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={totalAccountsData}>
                    <defs>
                      <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.warning.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.warning.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={theme.palette.warning.main} 
                      fillOpacity={1} 
                      fill="url(#colorAccounts)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Sales Overview */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Sales Overview
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="orders" stroke={theme.palette.success.main} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Recent Orders and Popular Items */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '100%', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {recentOrders.map((order) => (
                  <ListItem 
                    key={order.id}
                    secondaryAction={
                      <Chip 
                        label={order.status} 
                        color={order.status === 'Completed' ? 'success' : order.status === 'Pending' ? 'warning' : 'error'}
                        size="small"
                      />
                    }
                    sx={{ 
                      mb: 1, 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                    }}
                  >
                    <ListItemText
                      primary={`Order #${order.id}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {order.customer} • {order.time}
                          </Typography>
                          <Typography component="div" variant="body2" sx={{ fontWeight: 'bold' }}>
                            ${order.total}
                          </Typography>
                        </>
                      }
                    />
                    <Tooltip title="View Details">
                      <IconButton>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '100%', overflowX: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Popular Items
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularItems}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" scale="band" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill={theme.palette.primary.main} />
                    <Bar dataKey="revenue" fill={theme.palette.success.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;