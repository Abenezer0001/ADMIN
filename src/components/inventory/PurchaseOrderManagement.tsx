import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Stack,
  Avatar,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DataTable from '../common/DataTable';
import { useBusiness } from '../../context/BusinessContext';
import inventoryService, { PurchaseOrder } from '../../services/InventoryService';

const columns = [
  { header: 'Order Number', accessorKey: 'orderNumber' },
  { header: 'Supplier', accessorKey: 'supplierName' },
  { header: 'Status', accessorKey: 'status' },
  { header: 'Items', accessorKey: 'itemCount' },
  { header: 'Subtotal', accessorKey: 'subtotal' },
  { header: 'Total', accessorKey: 'total' },
  { header: 'Expected Delivery', accessorKey: 'expectedDeliveryDate' },
  { header: 'Created', accessorKey: 'createdAt' }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'draft': return 'default';
    case 'pending': return 'warning';
    case 'approved': return 'info';
    case 'sent': return 'primary';
    case 'received': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

export default function PurchaseOrderManagement() {
  const { currentBusiness } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Load purchase orders data
  const loadPurchaseOrdersData = useCallback(async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const ordersData = await inventoryService.getPurchaseOrders(currentBusiness._id);
      setPurchaseOrders(ordersData);
      
    } catch (err: any) {
      console.error('Failed to load purchase orders data:', err);
      setError(err.message || 'Failed to load purchase orders data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?._id]);
  
  // Load data on mount and when business changes
  useEffect(() => {
    loadPurchaseOrdersData();
  }, [loadPurchaseOrdersData]);

  const handleEdit = (order: PurchaseOrder) => {
    console.log('Edit order:', order);
    // TODO: Open edit modal
  };

  const handleDelete = async (order: PurchaseOrder) => {
    if (!currentBusiness?._id) return;
    
    try {
      await inventoryService.deletePurchaseOrder(order._id, currentBusiness._id);
      setSnackbarOpen(true);
      await loadPurchaseOrdersData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to delete purchase order');
      setSnackbarOpen(true);
    }
  };

  const handleView = (order: PurchaseOrder) => {
    console.log('View order:', order);
    // TODO: Open detail view
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleRefresh = () => {
    loadPurchaseOrdersData();
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError(null);
  };
  
  // Filter orders based on search term
  const filteredOrders = purchaseOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate order statistics
  const orderStats = {
    totalOrders: purchaseOrders.length,
    pendingOrders: purchaseOrders.filter(o => ['pending', 'approved', 'sent'].includes(o.status)).length,
    completedOrders: purchaseOrders.filter(o => o.status === 'received').length,
    totalValue: purchaseOrders.reduce((sum, o) => sum + o.total, 0)
  };
  
  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Alert severity="info">Please select a business to view purchase order data.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', mb: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Total Orders
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {orderStats.totalOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All purchase orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800' }}>
                    <PendingIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Pending Orders
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {orderStats.pendingOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Awaiting fulfillment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#2e7d32' }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Completed Orders
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {orderStats.completedOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Successfully received
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Total Value
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${orderStats.totalValue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total order value
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Purchase Orders Table */}
      <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Purchase Orders
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search orders"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
            <Button 
              onClick={handleRefresh}
              color="primary"
              disabled={loading}
              startIcon={<RefreshIcon />}
              size="small"
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              color="primary"
              disabled={loading}
            >
              Create Order
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ overflowX: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={filteredOrders.map(order => ({
                ...order,
                itemCount: order.items.length,
                subtotal: `$${order.subtotal.toFixed(2)}`,
                total: `$${order.total.toFixed(2)}`,
                expectedDeliveryDate: order.expectedDeliveryDate 
                  ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                  : 'N/A',
                createdAt: new Date(order.createdAt).toLocaleDateString(),
                status: (
                  <Chip 
                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                )
              }))}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </Box>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || 'Operation completed successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
}