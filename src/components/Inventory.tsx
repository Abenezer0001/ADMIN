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
  IconButton,
  TextField,
  InputAdornment,
  Badge,
  Button
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DataTable from './common/DataTable';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock data
const inventorySummary = {
  totalItems: 458,
  lowStock: 23,
  incomingOrders: 12,
  inventoryValue: 24580
};

const inventoryTrends = [
  { month: 'Jan', stock: 420, consumed: 180, ordered: 200 },
  { month: 'Feb', stock: 440, consumed: 190, ordered: 210 },
  { month: 'Mar', stock: 460, consumed: 210, ordered: 230 },
  { month: 'Apr', stock: 480, consumed: 220, ordered: 240 },
  { month: 'May', stock: 458, consumed: 200, ordered: 178 }
];

const categoryDistribution = [
  { name: 'Fresh Produce', value: 120, color: '#4CAF50' },
  { name: 'Dairy', value: 85, color: '#2196F3' },
  { name: 'Meat & Seafood', value: 75, color: '#F44336' },
  { name: 'Dry Goods', value: 110, color: '#FFC107' },
  { name: 'Beverages', value: 68, color: '#9C27B0' }
];

// Table data
const columns = [
  { header: 'Item Code', accessorKey: 'code' },
  { header: 'Name', accessorKey: 'name' },
  { header: 'Category', accessorKey: 'category' },
  { header: 'In Stock', accessorKey: 'stock' },
  { header: 'Unit Price', accessorKey: 'price' },
  { header: 'Status', accessorKey: 'status' },
  { header: 'Last Updated', accessorKey: 'updated' }
];

const data = [
  { code: 'FP-001', name: 'Premium Tomatoes', category: 'Fresh Produce', stock: 45, price: '$2.99', status: 'In Stock', updated: '2 days ago' },
  { code: 'DR-032', name: 'Whole Milk', category: 'Dairy', stock: 12, price: '$3.49', status: 'Low Stock', updated: 'Yesterday' },
  { code: 'MS-117', name: 'Beef Ribeye', category: 'Meat & Seafood', stock: 8, price: '$12.99', status: 'Low Stock', updated: 'Today' },
  { code: 'DG-205', name: 'Jasmine Rice', category: 'Dry Goods', stock: 67, price: '$14.99', status: 'In Stock', updated: '1 week ago' },
  { code: 'BV-098', name: 'Craft Beer', category: 'Beverages', stock: 24, price: '$8.99', status: 'In Stock', updated: '3 days ago' }
];

function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
  };

  const handleDelete = (item: any) => {
    console.log('Delete item:', item);
  };

  const handleView = (item: any) => {
    console.log('View item:', item);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Inventory Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Track and manage your inventory levels and product stock
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <InventoryIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Items
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {inventorySummary.totalItems.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#d32f2f' }}>
                  <Badge badgeContent={inventorySummary.lowStock} color="error">
                    <WarningAmberIcon />
                  </Badge>
                </Avatar>
                <Typography variant="h6" component="div">
                  Low Stock Items
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {inventorySummary.lowStock}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need reordering
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <LocalShippingIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Incoming Orders
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {inventorySummary.incomingOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending deliveries
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
                  Inventory Value
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                ${inventorySummary.inventoryValue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total asset value
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
              Inventory Trends
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={inventoryTrends}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="stock" name="Stock Level" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="consumed" name="Consumed" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="ordered" name="Ordered" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ height: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2 }}>
                {categoryDistribution.map((entry, index) => (
                  <Chip 
                    key={index}
                    label={`${entry.name}: ${entry.value}`}
                    sx={{ 
                      bgcolor: entry.color,
                      color: 'white',
                      '& .MuiChip-label': { fontWeight: 'bold' }
                    }}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Inventory Items
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search inventory"
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
              variant="contained" 
              startIcon={<AddIcon />}
              color="primary"
            >
              Add Item
            </Button>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ overflowX: 'auto' }}>
          <DataTable
            columns={columns}
            data={data.map(item => ({
              ...item,
              status: (
                <Chip 
                  label={item.status} 
                  color={item.status === 'In Stock' ? 'success' : 'error'}
                  size="small"
                />
              )
            }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default Inventory;