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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import DataTable from '../common/DataTable';
import { useBusiness } from '../../context/BusinessContext';
import inventoryService, { Supplier } from '../../services/InventoryService';

const columns = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Contact Person', accessorKey: 'contactName' },
  { header: 'Email', accessorKey: 'email' },
  { header: 'Phone', accessorKey: 'phone' },
  { header: 'Payment Terms', accessorKey: 'paymentTerms' },
  { header: 'Min Order', accessorKey: 'minimumOrderAmount' },
  { header: 'Rating', accessorKey: 'rating' },
  { header: 'Status', accessorKey: 'status' }
];

export default function SupplierManagement() {
  const { currentBusiness } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Load suppliers data
  const loadSuppliersData = useCallback(async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const suppliersData = await inventoryService.getSuppliers(currentBusiness._id);
      setSuppliers(suppliersData);
      
    } catch (err: any) {
      console.error('Failed to load suppliers data:', err);
      setError(err.message || 'Failed to load suppliers data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?._id]);
  
  // Load data on mount and when business changes
  useEffect(() => {
    loadSuppliersData();
  }, [loadSuppliersData]);

  const handleEdit = (supplier: Supplier) => {
    console.log('Edit supplier:', supplier);
    // TODO: Open edit modal
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!currentBusiness?._id) return;
    
    try {
      await inventoryService.deleteSupplier(supplier._id, currentBusiness._id);
      setSnackbarOpen(true);
      await loadSuppliersData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to delete supplier');
      setSnackbarOpen(true);
    }
  };

  const handleView = (supplier: Supplier) => {
    console.log('View supplier:', supplier);
    // TODO: Open detail view
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleRefresh = () => {
    loadSuppliersData();
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError(null);
  };
  
  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contactName && supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Calculate supplier statistics
  const supplierStats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.length, // All suppliers are considered active for now
    avgRating: suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length : 0,
    topRatedSuppliers: suppliers.filter(s => (s.rating || 0) >= 4).length
  };
  
  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Alert severity="info">Please select a business to view supplier data.</Alert>
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
                    <LocalShippingIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Total Suppliers
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {supplierStats.totalSuppliers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered suppliers
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
                    Active Suppliers
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {supplierStats.activeSuppliers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800' }}>
                    <StarIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Avg Rating
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {supplierStats.avgRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  out of 5 stars
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    <StarIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Top Rated (4+)
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {supplierStats.topRatedSuppliers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  highly rated suppliers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Suppliers Table */}
      <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Supplier Directory
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search suppliers"
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
              Add Supplier
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
              data={filteredSuppliers.map(supplier => ({
                ...supplier,
                minimumOrderAmount: supplier.minimumOrderAmount ? `$${supplier.minimumOrderAmount.toFixed(2)}` : 'N/A',
                rating: supplier.rating ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ color: '#ffc107', fontSize: '1rem' }} />
                    <Typography variant="body2">{supplier.rating.toFixed(1)}</Typography>
                  </Box>
                ) : 'N/A',
                status: (
                  <Chip 
                    label="Active" 
                    color="success"
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