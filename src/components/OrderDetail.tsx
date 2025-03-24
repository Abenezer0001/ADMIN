import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import RoomServiceIcon from '@mui/icons-material/RoomService';

// Mock order data for restaurant context
const orderData = {
  id: 'ORD-001',
  tableInfo: {
    tableNumber: '12',
    seatingArea: 'Main Dining',
    capacity: '4',
    waiter: 'Michael Brown'
  },
  date: '2024-02-20 14:30',
  status: 'served',
  total: 125.99,
  subtotal: 105.99,
  tax: 10.00,
  serviceCharge: 10.00,
  paymentMethod: 'Unpaid - Table Service',
  specialRequests: 'No onions in the salad, Extra spicy wings',
  items: [
    { id: 1, name: 'Margherita Pizza', quantity: 1, price: 15.99, total: 15.99 },
    { id: 2, name: 'Pepperoni Pizza', quantity: 2, price: 18.50, total: 37.00 },
    { id: 3, name: 'Garden Salad', quantity: 1, price: 8.00, total: 8.00, note: 'No onions' },
    { id: 4, name: 'Garlic Bread', quantity: 2, price: 5.50, total: 11.00 },
    { id: 5, name: 'Soda (2L)', quantity: 2, price: 3.50, total: 7.00 },
    { id: 6, name: 'Cheesecake', quantity: 2, price: 6.50, total: 13.00 },
    { id: 7, name: 'Chicken Wings', quantity: 1, price: 14.00, total: 14.00, note: 'Extra spicy' }
  ],
  timeline: [
    { time: '2024-02-20 14:30', status: 'Order Placed', description: 'Order submitted via QR code' },
    { time: '2024-02-20 14:35', status: 'Order Confirmed', description: 'Order accepted by kitchen' },
    { time: '2024-02-20 14:45', status: 'Preparation', description: 'Kitchen started preparing the order' },
    { time: '2024-02-20 15:15', status: 'Ready to Serve', description: 'Food ready for service' },
    { time: '2024-02-20 15:20', status: 'Served', description: 'Order served to table' }
  ]
};

// Status chip configuration for restaurant context
const getStatusChip = (status) => {
  let icon;
  let color;
  let label = status.charAt(0).toUpperCase() + status.slice(1);
  
  switch(status) {
    case 'served':
      icon = <CheckCircleIcon />;
      color = 'success';
      break;
    case 'pending':
      icon = <HourglassEmptyIcon />;
      color = 'primary';
      break;
    case 'preparing':
      icon = <RoomServiceIcon />;
      color = 'warning';
      break;
    case 'cancelled':
      icon = <CancelIcon />;
      color = 'error';
      break;
    default:
      icon = <HourglassEmptyIcon />;
      color = 'default';
  }
  
  return (
    <Chip 
      icon={icon} 
      label={label} 
      color={color} 
      size="medium" 
      sx={{ fontWeight: 'bold', px: 1 }}
    />
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // In a real app, you would fetch the order details based on orderId
  // For this demo, we'll use the mock data
  const order = orderData;
  
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<KeyboardBackspaceIcon />}
          onClick={() => navigate('/orders/history')}
        >
          Back to Orders
        </Button>
        <Typography variant="h4" component="h1">
          Order #{order.id}
        </Typography>
        {getStatusChip(order.status)}
      </Stack>
      
      {/* Order Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <RestaurantMenuIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Order ID
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {order.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.date}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2e7d32' }}>
                  <TableRestaurantIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Table
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                #{order.tableInfo.tableNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.tableInfo.seatingArea}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <ReceiptIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Items
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {order.items.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Menu items ordered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ed6c02' }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                ${order.total.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.paymentMethod}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Order Items Table */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell>Item</TableCell>
                <TableCell>Special Instructions</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell component="th" scope="row">
                    <Typography fontWeight="medium">{item.name}</Typography>
                  </TableCell>
                  <TableCell>{item.note || "-"}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell colSpan={3} />
                <TableCell align="right">
                  <Typography fontWeight="bold">Subtotal</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">${order.subtotal.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} />
                <TableCell align="right">Tax</TableCell>
                <TableCell align="right">${order.tax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} />
                <TableCell align="right">Service Charge</TableCell>
                <TableCell align="right">${order.serviceCharge.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} />
                <TableCell align="right">
                  <Typography fontWeight="bold" variant="h6">Total</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold" variant="h6">${order.total.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Table Details and Order Timeline */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Table Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Table Number</Typography>
                <Typography variant="body1">#{order.tableInfo.tableNumber}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Seating Area</Typography>
                <Typography variant="body1">{order.tableInfo.seatingArea}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Capacity</Typography>
                <Typography variant="body1">{order.tableInfo.capacity} persons</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Assigned Server</Typography>
                <Typography variant="body1">{order.tableInfo.waiter}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Special Requests</Typography>
                <Typography variant="body1">{order.specialRequests || "No special requests"}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Order Timeline
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ position: 'relative' }}>
              {/* Vertical timeline line */}
              <Box sx={{ 
                position: 'absolute', 
                left: 15, 
                top: 0, 
                bottom: 0, 
                width: 2, 
                bgcolor: 'divider' 
              }} />
              
              {order.timeline.map((event, index) => (
                <Stack 
                  key={index} 
                  direction="row" 
                  spacing={2} 
                  sx={{ 
                    mb: 3,
                    position: 'relative',
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: index === order.timeline.length - 1 ? 'success.main' : 'primary.main',
                      width: 32,
                      height: 32,
                      zIndex: 1
                    }}
                  >
                    {index === order.timeline.length - 1 ? 
                      <CheckCircleIcon fontSize="small" /> : 
                      (event.status === 'Ready to Serve' ? 
                        <RoomServiceIcon fontSize="small" /> : 
                        <AccessTimeIcon fontSize="small" />)
                    }
                  </Avatar>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {event.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.time}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">
                      {event.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" color="primary">
          Print Bill
        </Button>
        <Button variant="contained" color="warning">
          Add Items
        </Button>
        <Button variant="contained" color="success">
          Process Payment
        </Button>
      </Box>
    </Box>
  );
};

export default OrderDetail;