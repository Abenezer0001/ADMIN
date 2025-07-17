import React, { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ListAltIcon from '@mui/icons-material/ListAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useNavigate } from 'react-router-dom';

// Mock data for invoices
const invoiceSummary = {
  totalInvoices: 845,
  totalAmount: 32650.75,
  paidInvoices: 720,
  overdueInvoices: 125
};

const invoiceData = [
  { id: 'INV-2025-001', customer: 'Tasty Bites', amount: 1287.50, date: '2025-02-15', dueDate: '2025-03-15', status: 'Paid' },
  { id: 'INV-2025-002', customer: 'Spice Haven', amount: 875.25, date: '2025-02-18', dueDate: '2025-03-18', status: 'Paid' },
  { id: 'INV-2025-003', customer: 'The Bistro', amount: 2340.00, date: '2025-02-20', dueDate: '2025-03-20', status: 'Pending' },
  { id: 'INV-2025-004', customer: 'Cafe Delight', amount: 1120.75, date: '2025-01-25', dueDate: '2025-02-25', status: 'Overdue' },
  { id: 'INV-2025-005', customer: 'Taste of Asia', amount: 1890.30, date: '2025-02-01', dueDate: '2025-03-01', status: 'Paid' },
  { id: 'INV-2025-006', customer: 'Urban Grill', amount: 2150.00, date: '2025-02-05', dueDate: '2025-03-05', status: 'Pending' },
  { id: 'INV-2025-007', customer: 'Green Garden', amount: 930.45, date: '2025-01-10', dueDate: '2025-02-10', status: 'Overdue' },
  { id: 'INV-2025-008', customer: 'Sunset Diner', amount: 1475.80, date: '2025-02-12', dueDate: '2025-03-12', status: 'Paid' }
];

const paymentTrends = [
  { month: 'Jan', onTime: 85, late: 15 },
  { month: 'Feb', onTime: 88, late: 12 },
  { month: 'Mar', onTime: 90, late: 10 },
  { month: 'Apr', onTime: 85, late: 15 }
];

function Invoices() {
  const navigate = useNavigate();

  const handleRowClick = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Invoices
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Track and manage your customer invoices
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ReceiptIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Invoices
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {invoiceSummary.totalInvoices.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 90 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2e7d32' }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Amount
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                ${invoiceSummary.totalAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invoiced amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <ListAltIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Paid Invoices
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {invoiceSummary.paidInvoices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {((invoiceSummary.paidInvoices / invoiceSummary.totalInvoices) * 100).toFixed(1)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ed6c02' }}>
                  <DateRangeIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Overdue Invoices
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {invoiceSummary.overdueInvoices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Require attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invoices Table */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Recent Invoices
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date Issued</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData.map((invoice) => (
                <TableRow 
                  key={invoice.id}
                  sx={{ 
                    '&:hover': { 
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleRowClick(invoice.id)}
                >
                  <TableCell>{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={invoice.status} 
                      size="small"
                      sx={{ 
                        bgcolor: `${getStatusColor(invoice.status)}15`,
                        color: getStatusColor(invoice.status),
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(invoice.id);
                      }}
                    >
                      <RemoveRedEyeIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment Trends */}
      <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Payment Trends
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {paymentTrends.map((item) => (
            <Grid item xs={6} sm={3} key={item.month}>
              <Card sx={{ bgcolor: 'background.default', boxShadow: 'none' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {item.month} 2025
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: '#2e7d32',
                      }}
                    />
                    <Typography variant="body2">
                      On-time: {item.onTime}%
                    </Typography>
                    <ArrowUpwardIcon
                      fontSize="small"
                      sx={{ 
                        color: '#2e7d32',
                        ml: 1
                      }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: '#d32f2f',
                      }}
                    />
                    <Typography variant="body2">
                      Late: {item.late}%
                    </Typography>
                    <ArrowDownwardIcon
                      fontSize="small"
                      sx={{ 
                        color: '#d32f2f',
                        ml: 1
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}

export default Invoices;