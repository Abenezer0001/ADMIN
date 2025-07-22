import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
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
import { useBusiness } from '../context/BusinessContext';
import inventoryService, { InventoryItem, InventoryAnalytics, CreateInventoryItemRequest, UpdateInventoryItemRequest } from '../services/InventoryService';
import InventoryItemModal from './inventory/InventoryItemModal';

// Table columns configuration
const columns = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Category', accessorKey: 'category' },
  { header: 'Current Stock', accessorKey: 'currentStock' },
  { header: 'Unit', accessorKey: 'unit' },
  { header: 'Min Stock', accessorKey: 'minimumStock' },
  { header: 'Avg Cost', accessorKey: 'averageCost' },
  { header: 'Status', accessorKey: 'status' },
  { header: 'Location', accessorKey: 'location' }
];

// Chart colors for category distribution
const chartColors = ['#4CAF50', '#2196F3', '#F44336', '#FFC107', '#9C27B0', '#FF5722', '#795548', '#607D8B'];

function Inventory() {
  const { currentBusiness } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [inventoryTrends, setInventoryTrends] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Load inventory data
  const loadInventoryData = useCallback(async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [items, lowStock, analyticsData] = await Promise.all([
        inventoryService.getInventoryItems(currentBusiness._id),
        inventoryService.getLowStockAlerts(currentBusiness._id),
        inventoryService.getInventoryAnalytics(currentBusiness._id)
      ]);
      
      setInventoryItems(items);
      setLowStockItems(lowStock);
      setAnalytics(analyticsData);
      
      // Process category distribution for chart
      if (analyticsData.topCategories) {
        const categoryData = analyticsData.topCategories.map((cat, index) => ({
          name: cat.category,
          value: cat.value,
          color: chartColors[index % chartColors.length]
        }));
        setCategoryDistribution(categoryData);
      }
      
      // Process cost trends for chart
      if (analyticsData.costTrends) {
        const trendsData = analyticsData.costTrends.map(trend => ({
          month: new Date(trend.date).toLocaleDateString('en-US', { month: 'short' }),
          stock: trend.totalCost,
          consumed: Math.round(trend.totalCost * 0.3),
          ordered: Math.round(trend.totalCost * 0.4)
        }));
        setInventoryTrends(trendsData);
      }
      
    } catch (err: any) {
      console.error('Failed to load inventory data:', err);
      setError(err.message || 'Failed to load inventory data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?._id]);
  
  // Load data on mount and when business changes
  useEffect(() => {
    loadInventoryData();
  }, [loadInventoryData]);
  
  // Set up real-time updates with polling
  useEffect(() => {
    if (!currentBusiness?._id) return;
    
    const interval = setInterval(() => {
      // Only poll if not currently loading
      if (!loading) {
        loadInventoryData();
      }
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [currentBusiness?._id, loading, loadInventoryData]);
  
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };
  
  const handleAddNew = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };
  
  const handleSaveItem = async (itemData: CreateInventoryItemRequest) => {
    if (!currentBusiness?._id) return;
    
    try {
      setModalLoading(true);
      
      if (selectedItem) {
        // Update existing item
        const updateData: UpdateInventoryItemRequest = {
          name: itemData.name,
          description: itemData.description,
          category: itemData.category,
          minimumStock: itemData.minimumStock,
          maximumStock: itemData.maximumStock,
          averageCost: itemData.averageCost,
          location: itemData.location,
          expirationDays: itemData.expirationDays,
          restaurantId: currentBusiness._id
        };
        await inventoryService.updateInventoryItem(selectedItem._id, updateData);
      } else {
        // Create new item
        await inventoryService.createInventoryItem(itemData);
      }
      
      setSnackbarOpen(true);
      await loadInventoryData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
      setSnackbarOpen(true);
      throw err; // Re-throw to prevent modal from closing
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!currentBusiness?._id) return;
    
    try {
      await inventoryService.deleteInventoryItem(item._id, currentBusiness._id);
      setSnackbarOpen(true);
      await loadInventoryData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      setSnackbarOpen(true);
    }
  };

  const handleView = (item: InventoryItem) => {
    console.log('View item:', item);
    // TODO: Open detail view
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleRefresh = () => {
    loadInventoryData();
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError(null);
  };
  
  // Filter items based on search term
  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate summary data
  const inventorySummary = {
    totalItems: analytics?.totalItems || 0,
    lowStock: analytics?.lowStockItems || 0,
    incomingOrders: 0, // TODO: Get from purchase orders
    inventoryValue: analytics?.totalValue || 0
  };
  
  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Alert severity="info">Please select a business to view inventory data.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Inventory Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Track and manage your inventory levels and product stock
      </Typography>

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
      )}

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
            <IconButton 
              onClick={handleRefresh}
              color="primary"
              disabled={loading}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              color="primary"
              disabled={loading}
              onClick={handleAddNew}
            >
              Add Item
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
              data={filteredItems.map(item => ({
                ...item,
                averageCost: `$${item.averageCost.toFixed(2)}`,
                status: (
                  <Chip 
                    label={item.currentStock <= item.minimumStock ? 'Low Stock' : 'In Stock'} 
                    color={item.currentStock <= item.minimumStock ? 'error' : 'success'}
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
      
      {/* Inventory Item Modal */}
      <InventoryItemModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        item={selectedItem}
        restaurantId={currentBusiness?._id || ''}
        loading={modalLoading}
      />
    </Box>
  );
}

export default Inventory;