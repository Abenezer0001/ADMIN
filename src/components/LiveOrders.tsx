import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  InputBase,
  IconButton,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import {
  Search as SearchIcon,
  Circle as CircleIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { notification } from 'antd';
import { RootState } from '../redux/store';
import { fetchOrdersStart, setSelectedOrder, updateOrderStatusStart } from '../redux/orderSlice';
import { connectWebSocket, disconnectWebSocket } from '../sagas/websocketSagas';
import { Order, OrderStatus } from '../types/order';
import { formatCurrency, formatDate } from '../utils/formatters';

function LiveOrders() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setLocalSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    dispatch(connectWebSocket());
    dispatch(fetchOrdersStart());

    // Disconnect from WebSocket when component unmounts
    return () => {
      dispatch(disconnectWebSocket());
    };
  }, [dispatch]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.tableNumber && order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Open order details dialog
  const openOrderDetails = (order: Order) => {
    setLocalSelectedOrder(order);
    dispatch(setSelectedOrder(order));
    setIsOrderDetailsOpen(true);
  };

  // Close order details dialog
  const closeOrderDetails = () => {
    setLocalSelectedOrder(null);
    dispatch(setSelectedOrder(null));
    setIsOrderDetailsOpen(false);
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    dispatch(updateOrderStatusStart({ orderId, status }));
    closeOrderDetails();
    notification.success({ 
      message: `Order status updated to ${status}` 
    });
  };

  // Get next status based on current status
  const getNextStatus = (currentStatus: string): OrderStatus => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return OrderStatus.CONFIRMED;
      case OrderStatus.CONFIRMED:
        return OrderStatus.IN_PREPARATION;
      case OrderStatus.IN_PREPARATION:
        return OrderStatus.READY;
      case OrderStatus.READY:
        return OrderStatus.DELIVERED;
      case OrderStatus.DELIVERED:
        return OrderStatus.COMPLETED;
      default:
        return OrderStatus.CONFIRMED;
    }
  };

  // Get status display name
  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pending';
      case OrderStatus.CONFIRMED:
        return 'Confirmed';
      case OrderStatus.IN_PREPARATION:
        return 'In Preparation';
      case OrderStatus.READY:
        return 'Ready';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      case OrderStatus.COMPLETED:
        return 'Completed';
      case OrderStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Get status color
  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'default';
      case OrderStatus.CONFIRMED:
        return 'primary';
      case OrderStatus.IN_PREPARATION:
        return 'secondary';
      case OrderStatus.READY:
        return 'warning';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.COMPLETED:
        return 'info';
      case OrderStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Refresh orders
  const handleRefresh = () => {
    dispatch(fetchOrdersStart());
    notification.info({ message: 'Refreshing orders...' });
  };

  const OrderList = ({ orders, onViewDetails, onUpdateStatus }) => {
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.items.length} items</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusDisplayName(order.status)} 
                    color={getStatusColor(order.status)} 
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    edge="end" 
                    aria-label="details"
                    onClick={() => onViewDetails(order)}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="update status"
                    onClick={() => onUpdateStatus(order._id, getNextStatus(order.status))}
                  >
                    <CircleIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          Live Orders
        </Typography>
        <IconButton onClick={handleRefresh} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Paper 
        component="form" 
        sx={{ 
          borderRadius: '10px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
          mb: 4, 
          overflowX: 'auto', 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center' 
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search by order number or table"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {loading && (
        <Typography sx={{ mb: 2 }}>
          Loading orders...
        </Typography>
      )}

      {!loading && filteredOrders.length === 0 && (
        <Typography sx={{ mb: 2 }}>
          No orders found.
        </Typography>
      )}

      <OrderList 
        orders={filteredOrders} 
        onViewDetails={openOrderDetails} 
        onUpdateStatus={updateOrderStatus}
      />

      <Dialog 
        open={isOrderDetailsOpen} 
        onClose={closeOrderDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Order: {selectedOrder.orderNumber}</Typography>
                <Chip 
                  label={getStatusDisplayName(selectedOrder.status)} 
                  color={getStatusColor(selectedOrder.status)} 
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Table: {selectedOrder.tableNumber || 'N/A'}
                </Typography>
                <Typography variant="subtitle1">
                  Time: {formatDate(selectedOrder.createdAt)}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="h6" sx={{ mb: 1 }}>Items:</Typography>
              <List dense>
                {selectedOrder.items.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1">
                          {item.name || item.menuItem} x{item.quantity} - {formatCurrency(item.price)}
                        </Typography>
                      }
                      secondary={
                        item.modifiers && item.modifiers.length > 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            Modifiers: {item.modifiers.map(mod => 
                              mod.selections.map(sel => sel.name).join(', ')
                            ).join(', ')}
                          </Typography>
                        ) : null
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">{formatCurrency(selectedOrder.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax:</Typography>
                <Typography variant="body1">{formatCurrency(selectedOrder.tax)}</Typography>
              </Box>
              {selectedOrder.tip && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Tip:</Typography>
                  <Typography variant="body1">{formatCurrency(selectedOrder.tip)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">{formatCurrency(selectedOrder.total)}</Typography>
              </Box>

              {selectedOrder.specialInstructions && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1">Special Instructions:</Typography>
                  <Typography variant="body2">{selectedOrder.specialInstructions}</Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {selectedOrder.status !== OrderStatus.COMPLETED && 
               selectedOrder.status !== OrderStatus.CANCELLED && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    const nextStatus = getNextStatus(selectedOrder.status);
                    updateOrderStatus(selectedOrder._id, nextStatus);
                  }}
                >
                  Update to {getStatusDisplayName(getNextStatus(selectedOrder.status))}
                </Button>
              )}
              <Button onClick={closeOrderDetails} color="secondary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default LiveOrders;
