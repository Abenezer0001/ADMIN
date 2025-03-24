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
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useParams, useNavigate } from 'react-router-dom';

// Mock data for a specific invoice
const invoiceDetail = {
  id: 'INV-2025-001',
  customer: 'Tasty Bites',
  amount: 1287.50,
  date: '2025-02-15',
  dueDate: '2025-03-15',
  status: 'Paid',
  paymentMethod: 'Credit Card',
  paymentDate: '2025-02-20',
  notes: 'Monthly service invoice for restaurant management software and support.',
  customerDetails: {
    name: 'Tasty Bites Restaurant',
    contactPerson: 'John Smith',
    email: 'john@tastybites.com',
    phone: '+1 (555) 123-4567',
    address: '123 Culinary Street, Foodville, CA 94123'
  },
  items: [
    { id: 1, description: 'Restaurant Management Software - Standard Plan', quantity: 1, unitPrice: 899.00, total: 899.00 },
    { id: 2, description: 'Additional User Licenses', quantity: 3, unitPrice: 49.50, total: 148.50 },
    { id: 3, description: 'Premium Support Package', quantity: 1, unitPrice: 199.00, total: 199.00 },
    { id: 4, description: 'Menu Template Customization', quantity: 1, unitPrice: 41.00, total: 41.00 }
  ],
  paymentHistory: [
    { id: 'TRX123456', date: '2025-02-20', amount: 1287.50, method: 'Credit Card', status: 'Completed' }
  ]
};

// Function to get the appropriate status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Paid':
      return '#2e7d32'; // Green
    case 'Pending':
      return '#ed6c02'; // Orange
    case 'Overdue':
      return '#d32f2f'; // Red
    default:
      return '#1976d2'; // Blue
  }
};

function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  
  // In a real app, you would fetch the invoice details based on the invoiceId
  // For this example, we're using mock data

  // Calculate the subtotal and tax
  const subtotal = invoiceDetail.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.0; // No tax for this example
  const total = subtotal + tax;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          variant="outlined"
          onClick={() => navigate('/invoices')}
        >
          Back to Invoices
        </Button>
        <Typography variant="h4" component="h1">
          Invoice Details
        </Typography>
      </Stack>

      {/* Invoice Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <ReceiptIcon />
              </Avatar>
              <Box>
                <Typography variant="h5">{invoiceDetail.id}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {invoiceDetail.customer}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Chip 
              label={invoiceDetail.status} 
              sx={{ 
                fontSize: '1rem',
                padding: '20px 10px',
                bgcolor: `${getStatusColor(invoiceDetail.status)}15`,
                color: getStatusColor(invoiceDetail.status),
                fontWeight: 'bold'
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventIcon color="action" />
              <Typography variant="body2">Issue Date:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date(invoiceDetail.date).toLocaleDateString()}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventIcon color="action" />
              <Typography variant="body2">Due Date:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date(invoiceDetail.dueDate).toLocaleDateString()}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AttachMoneyIcon color="action" />
              <Typography variant="body2">Total Amount:</Typography>
              <Typography variant="body1" fontWeight="medium">
                ${invoiceDetail.amount.toLocaleString()}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Customer Information and Payment Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PersonOutlineIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={invoiceDetail.customerDetails.name} 
                  secondary={invoiceDetail.customerDetails.contactPerson} 
                />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <EmailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={invoiceDetail.customerDetails.email} />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PhoneIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={invoiceDetail.customerDetails.phone} />
              </ListItem>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <LocationOnIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={invoiceDetail.customerDetails.address} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Payment Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Payment Method</Typography>
              <Typography variant="body1" fontWeight="medium">{invoiceDetail.paymentMethod}</Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Payment Date</Typography>
              <Typography variant="body1" fontWeight="medium">
                {invoiceDetail.status === 'Paid' 
                  ? new Date(invoiceDetail.paymentDate).toLocaleDateString() 
                  : 'Pending'}
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Notes</Typography>
              <Typography variant="body1">{invoiceDetail.notes}</Typography>
            </Box>
            {invoiceDetail.status !== 'Paid' && (
              <Button 
                variant="contained" 
                color="primary"
                sx={{ mt: 2 }}
              >
                Process Payment
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Invoice Items */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <ShoppingBasketIcon color="primary" />
          <Typography variant="h6">
            Invoice Items
          </Typography>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceDetail.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography variant="subtitle1">Subtotal</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1">${subtotal.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography variant="subtitle1">Tax</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1">${tax.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>${total.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment History */}
      {invoiceDetail.status === 'Paid' && (
        <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" gutterBottom>
            Payment History
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceDetail.paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell align="right">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status} 
                        size="small"
                        sx={{ 
                          bgcolor: '#2e7d3215',
                          color: '#2e7d32',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default InvoiceDetail;