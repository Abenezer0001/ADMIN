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
  Tab,
  Tabs,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import InventoryIcon from '@mui/icons-material/Inventory';
import DataTable from './common/DataTable';
import { useBusiness } from '../context/BusinessContext';
import inventoryService, { InventoryItem, CreateInventoryItemRequest, UpdateInventoryItemRequest } from '../services/InventoryService';
import InventoryItemModal from './inventory/InventoryItemModal';
import RecipeManagement from './inventory/RecipeManagement';
import SupplierManagement from './inventory/SupplierManagement';
import PurchaseOrderManagement from './inventory/PurchaseOrderManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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

const InventoryManagement: React.FC = () => {
  const { currentBusiness } = useBusiness();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchInventoryItems = useCallback(async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      const items = await inventoryService.getInventoryItems(currentBusiness._id);
      setInventory(items);
    } catch (err: any) {
      console.error('Failed to fetch inventory items:', err);
      setError(err.message || 'Failed to fetch inventory items');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?._id]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
        await inventoryService.createInventoryItem(itemData);
      }
      
      setSnackbarOpen(true);
      await fetchInventoryItems();
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
      setSnackbarOpen(true);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!currentBusiness?._id) return;
    
    try {
      await inventoryService.deleteInventoryItem(item._id, currentBusiness._id);
      setSnackbarOpen(true);
      await fetchInventoryItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      setSnackbarOpen(true);
    }
  };

  const handleView = (item: InventoryItem) => {
    console.log('View item:', item);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleRefresh = () => {
    fetchInventoryItems();
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError(null);
  };
  
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        Advanced Inventory Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Complete inventory management with recipes, suppliers, and analytics
      </Typography>

      {/* Tabs */}
      <Paper sx={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="inventory management tabs">
            <Tab label="Inventory Items" />
            <Tab label="Recipe Management" />
            <Tab label="Suppliers" />
            <Tab label="Purchase Orders" />
          </Tabs>
        </Box>

        {/* Inventory Items Tab */}
        <TabPanel value={tabValue} index={0}>
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
                onClick={handleAddNew}
              >
                Add Item
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ overflowX: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
              </Box>
            ) : (
              <DataTable
                columns={columns}
                data={filteredInventory.map(item => ({
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
        </TabPanel>

        {/* Recipe Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <RecipeManagement />
        </TabPanel>

        {/* Suppliers Tab */}
        <TabPanel value={tabValue} index={2}>
          <SupplierManagement />
        </TabPanel>

        {/* Purchase Orders Tab */}
        <TabPanel value={tabValue} index={3}>
          <PurchaseOrderManagement />
        </TabPanel>
      </Paper>
      
      {/* Inventory Item Modal */}
      <InventoryItemModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        item={selectedItem}
        restaurantId={currentBusiness?._id || ''}
        loading={modalLoading}
      />
      
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
};

export default InventoryManagement;