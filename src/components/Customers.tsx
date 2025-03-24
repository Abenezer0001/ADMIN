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
  Chip,
  LinearProgress,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupsIcon from '@mui/icons-material/Groups';
import RedeemIcon from '@mui/icons-material/Redeem';
import SearchIcon from '@mui/icons-material/Search';
import EventNoteIcon from '@mui/icons-material/EventNote';
// import DataTable from '../common/DataTable';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import DataTable from './common/DataTable';

// Mock data
const customerSummary = {
  totalCustomers: 3245,
  newCustomers: 124,
  returnRate: 68.5,
  averageSpend: 42.75
};

const loyaltyDistribution = [
  { name: 'Bronze', value: 1870, color: '#CD7F32' },
  { name: 'Silver', value: 972, color: '#C0C0C0' },
  { name: 'Gold', value: 340, color: '#FFD700' },
  { name: 'Platinum', value: 63, color: '#E5E4E2' }
];

const customerActivity = [
  { month: 'Jan', newCustomers: 96, returningCustomers: 230 },
  { month: 'Feb', newCustomers: 84, returningCustomers: 210 },
  { month: 'Mar', newCustomers: 105, returningCustomers: 245 },
  { month: 'Apr', newCustomers: 122, returningCustomers: 278 },
  { month: 'May', newCustomers: 114, returningCustomers: 265 }
];

const demographicData = [
  { ageGroup: '18-24', percentage: 15, trend: 4 },
  { ageGroup: '25-34', percentage: 32, trend: 7 },
  { ageGroup: '35-44', percentage: 28, trend: 2 },
  { ageGroup: '45-54', percentage: 18, trend: -3 },
  { ageGroup: '55+', percentage: 7, trend: -1 }
];

// Table data
const columns = [
  { header: 'Customer Name', accessorKey: 'name' },
  { header: 'Email', accessorKey: 'email' },
  { header: 'Orders', accessorKey: 'orders' },
  { header: 'Total Spent', accessorKey: 'spent' },
  { header: 'Loyalty', accessorKey: 'loyalty' },
  { header: 'Last Visit', accessorKey: 'lastVisit' }
];

const data = [
  { name: 'John Smith', email: 'john.smith@example.com', orders: 12, spent: '$526.40', loyalty: 'Gold', lastVisit: '2 days ago' },
  { name: 'Alice Johnson', email: 'alice.j@example.com', orders: 24, spent: '$1,284.75', loyalty: 'Platinum', lastVisit: '5 days ago' },
  { name: 'Michael Brown', email: 'mbrown@example.com', orders: 8, spent: '$312.20', loyalty: 'Silver', lastVisit: 'Today' },
  { name: 'Emma Wilson', email: 'emma.w@example.com', orders: 5, spent: '$186.50', loyalty: 'Bronze', lastVisit: '2 weeks ago' },
  { name: 'James Davis', email: 'jdavis@example.com', orders: 16, spent: '$729.90', loyalty: 'Gold', lastVisit: 'Yesterday' }
];

function Customer() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (customer: any) => {
    console.log('Edit customer:', customer);
  };

  const handleDelete = (customer: any) => {
    console.log('Delete customer:', customer);
  };

  const handleView = (customer: any) => {
    console.log('View customer:', customer);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Customer Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Manage customers and analyze customer metrics
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <GroupsIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Customers
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {customerSummary.totalCustomers.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2e7d32' }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  New Customers
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {customerSummary.newCustomers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <RedeemIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Return Rate
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {customerSummary.returnRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer retention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ed6c02' }}>
                  <EventNoteIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Average Spend
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                ${customerSummary.averageSpend}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per customer
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Customer Activity
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={customerActivity}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newCustomers" name="New Customers" fill="#8884d8" />
                  <Bar dataKey="returningCustomers" name="Returning Customers" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Loyalty Distribution
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={loyaltyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {loyaltyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                {loyaltyDistribution.map((entry, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        bgcolor: entry.color, 
                        borderRadius: '50%', 
                        mr: 1 
                      }} 
                    />
                    <Typography variant="body2">{entry.name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Demographics Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Customer Demographics
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {demographicData.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" component="div">
                  {item.ageGroup}
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {item.percentage}%
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {item.trend > 0 ? (
                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                  ) : (
                    <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                  )}
                  <Typography 
                    variant="body2" 
                    color={item.trend > 0 ? 'success.main' : 'error.main'}
                  >
                    {item.trend > 0 ? '+' : ''}{item.trend}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={item.percentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.05)'
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Customer Table */}
      <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Customer List
          </Typography>
          <TextField
            size="small"
            placeholder="Search customers"
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
            sx={{ width: 250 }}
          />
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ overflowX: 'auto' }}>
          <DataTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default Customer;