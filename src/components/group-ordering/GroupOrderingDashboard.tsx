import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  PlayArrow as PlaceOrderIcon,
  PersonRemove as RemoveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import {
  GroupOrder,
  GroupOrderStats,
  GroupOrderAnalytics,
  groupOrderingService
} from '../../services/GroupOrderingService';
import { useBusiness } from '../../context/BusinessContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const GroupOrderingDashboard: React.FC = () => {
  const { businessId } = useBusiness();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeOrders, setActiveOrders] = useState<GroupOrder[]>([]);
  const [stats, setStats] = useState<GroupOrderStats | null>(null);
  const [analytics, setAnalytics] = useState<GroupOrderAnalytics | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<GroupOrder | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    if (businessId) {
      loadDashboardData();
    }
  }, [businessId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadActiveOrders(),
        loadStats(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveOrders = async () => {
    try {
      const response = await groupOrderingService.getActiveGroupOrders(businessId!);
      setActiveOrders(response.groupOrders);
    } catch (error) {
      console.error('Error loading active orders:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await groupOrderingService.getGroupOrderStats(businessId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await groupOrderingService.getGroupOrderAnalytics(
        undefined, 
        undefined, 
        businessId
      );
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleViewDetails = (order: GroupOrder) => {
    setSelectedOrder(order);
    setDetailsDialog(true);
  };

  const handleLockOrder = async (orderId: string) => {
    try {
      await groupOrderingService.lockGroupOrder(orderId);
      await loadActiveOrders();
    } catch (error) {
      console.error('Error locking order:', error);
    }
  };

  const handlePlaceOrder = async (orderId: string) => {
    try {
      await groupOrderingService.placeFinalOrder(orderId);
      await loadActiveOrders();
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      await groupOrderingService.cancelGroupOrder(selectedOrder._id, cancelReason);
      setCancelDialog(false);
      setCancelReason('');
      setSelectedOrder(null);
      await loadActiveOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleRemoveParticipant = async (orderId: string, participantId: string) => {
    try {
      await groupOrderingService.removeParticipant(orderId, participantId);
      await loadActiveOrders();
      if (selectedOrder?._id === orderId) {
        const updatedOrder = await groupOrderingService.getGroupOrder(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'locked': return 'warning';
      case 'placed': return 'info';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Group Ordering Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats?.totalActiveGroups || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Active Groups</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats?.totalParticipants || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Total Participants</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <MoneyIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography variant="h6">${stats?.totalRevenue?.toFixed(2) || '0.00'}</Typography>
                <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography variant="h6">{stats?.conversionRate?.toFixed(1) || '0.0'}%</Typography>
                <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Active Orders" />
          <Tab label="Analytics" />
          <Tab label="Popular Items" />
        </Tabs>
      </Box>

      {/* Active Orders Tab */}
      <TabPanel value={activeTab} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Join Code</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {order.joinCode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AvatarGroup max={4}>
                        {order.participants.map((participant, index) => (
                          <Avatar key={participant._id} sx={{ width: 32, height: 32, fontSize: 12 }}>
                            {participant.userName.charAt(0).toUpperCase()}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {order.participants.length}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status.toUpperCase()} 
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(order.expiresAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(order)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {order.status === 'active' && (
                        <Tooltip title="Lock Order">
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => handleLockOrder(order._id)}
                          >
                            <LockIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {order.status === 'locked' && (
                        <Tooltip title="Place Order">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handlePlaceOrder(order._id)}
                          >
                            <PlaceOrderIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Cancel Order">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedOrder(order);
                            setCancelDialog(true);
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Daily Group Orders</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="groupsCreated" stroke="#8884d8" name="Created" />
                    <Line type="monotone" dataKey="groupsCompleted" stroke="#82ca9d" name="Completed" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Hourly Distribution</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="groupsCreated" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Popular Items Tab */}
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Most Popular Items in Group Orders</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="right">Order Count</TableCell>
                    <TableCell align="right">Total Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.mostPopularItems?.map((item, index) => (
                    <TableRow key={item.menuItemId}>
                      <TableCell>{item.menuItemName}</TableCell>
                      <TableCell align="right">{item.orderCount}</TableCell>
                      <TableCell align="right">${item.totalRevenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Order Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Group Order Details - {selectedOrder?.joinCode}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedOrder.status.toUpperCase()} 
                    color={getStatusColor(selectedOrder.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="h6">${selectedOrder.totalAmount.toFixed(2)}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>Participants</Typography>
              {selectedOrder.participants.map((participant) => (
                <Card key={participant._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1">{participant.userName}</Typography>
                        <Typography variant="body2" color="text.secondary">{participant.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">${participant.totalAmount.toFixed(2)}</Typography>
                        <Chip 
                          label={participant.paymentStatus} 
                          size="small"
                          color={participant.paymentStatus === 'paid' ? 'success' : 'warning'}
                        />
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveParticipant(selectedOrder._id, participant._id)}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {participant.items.map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2">
                          {item.quantity}x {item.menuItemName}
                        </Typography>
                        <Typography variant="body2">${(item.price * item.quantity).toFixed(2)}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Cancel Group Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel this group order?
          </Typography>
          <TextField
            fullWidth
            label="Cancellation Reason (Optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>Cancel</Button>
          <Button onClick={handleCancelOrder} color="error">
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupOrderingDashboard;
