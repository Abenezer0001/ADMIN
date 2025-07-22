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
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import { 
  LineChart, 
  Line, 
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
import { useBusiness } from '../../context/BusinessContext';
import inventoryService, { WasteRecord } from '../../services/InventoryService';

// Waste reasons
const wasteReasons = [
  'Expiration',
  'Spoilage',
  'Over preparation',
  'Customer return',
  'Kitchen error',
  'Damage during transport',
  'Storage failure',
  'Other'
];

// Chart colors
const chartColors = ['#F44336', '#FF9800', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#795548', '#607D8B'];

interface WasteFormData {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  unit: string;
  reason: string;
  cost: number;
  notes: string;
  preventable: boolean;
}

function WasteTracking() {
  const { currentBusiness } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState<WasteFormData>({
    inventoryItemId: '',
    inventoryItemName: '',
    quantity: 0,
    unit: '',
    reason: '',
    cost: 0,
    notes: '',
    preventable: false
  });

  // Summary data
  const [wasteSummary, setWasteSummary] = useState({
    totalWaste: 0,
    totalCost: 0,
    preventableWaste: 0,
    preventableCost: 0
  });

  // Chart data
  const [wasteByReason, setWasteByReason] = useState<any[]>([]);
  const [wasteTrends, setWasteTrends] = useState<any[]>([]);

  // Load waste data
  const loadWasteData = useCallback(async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const records = await inventoryService.getWasteRecords(currentBusiness._id);
      setWasteRecords(records);
      
      // Calculate summary
      const summary = records.reduce((acc, record) => {
        acc.totalWaste += record.quantity;
        acc.totalCost += record.cost;
        if (record.preventable) {
          acc.preventableWaste += record.quantity;
          acc.preventableCost += record.cost;
        }
        return acc;
      }, {
        totalWaste: 0,
        totalCost: 0,
        preventableWaste: 0,
        preventableCost: 0
      });
      
      setWasteSummary(summary);
      
      // Process waste by reason for chart
      const reasonCounts: { [key: string]: number } = {};
      records.forEach(record => {
        reasonCounts[record.reason] = (reasonCounts[record.reason] || 0) + record.cost;
      });
      
      const reasonData = Object.entries(reasonCounts).map(([reason, cost], index) => ({
        name: reason,
        value: cost,
        color: chartColors[index % chartColors.length]
      }));
      
      setWasteByReason(reasonData);
      
      // Process trends data (mock data for now)
      const trendsData = [
        { month: 'Jan', waste: 120, cost: 450 },
        { month: 'Feb', waste: 98, cost: 380 },
        { month: 'Mar', waste: 145, cost: 520 },
        { month: 'Apr', waste: 87, cost: 320 },
        { month: 'May', waste: 165, cost: 590 },
        { month: 'Jun', waste: 132, cost: 480 }
      ];
      setWasteTrends(trendsData);
      
    } catch (err: any) {
      console.error('Failed to load waste data:', err);
      setError(err.message || 'Failed to load waste data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?._id]);

  useEffect(() => {
    loadWasteData();
  }, [loadWasteData]);

  const handleAddWaste = () => {
    setFormData({
      inventoryItemId: '',
      inventoryItemName: '',
      quantity: 0,
      unit: '',
      reason: '',
      cost: 0,
      notes: '',
      preventable: false
    });
    setModalOpen(true);
  };

  const handleSaveWaste = async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setModalLoading(true);
      
      const wasteData = {
        ...formData,
        restaurantId: currentBusiness._id
      };
      
      await inventoryService.recordWaste(wasteData);
      
      setModalOpen(false);
      setSnackbarOpen(true);
      await loadWasteData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to record waste');
      setSnackbarOpen(true);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredRecords = wasteRecords.filter(record =>
    record.inventoryItemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && wasteRecords.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Waste Tracking
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddWaste}
          >
            Record Waste
          </Button>
          <IconButton onClick={loadWasteData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#f44336' }}>
                  <DeleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{wasteSummary.totalWaste}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Waste Items
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#ff9800' }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">${wasteSummary.totalCost.toFixed(2)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Waste Cost
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#ffc107' }}>
                  <WarningAmberIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">{wasteSummary.preventableWaste}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preventable Waste
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#4caf50' }}>
                  <TrendingDownIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {wasteSummary.totalCost > 0 ? 
                      ((wasteSummary.preventableCost / wasteSummary.totalCost) * 100).toFixed(1) + '%' : 
                      '0%'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preventable %
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Waste by Reason</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteByReason}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {wasteByReason.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Waste Trends</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wasteTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#f44336" name="Waste Cost ($)" />
                <Line type="monotone" dataKey="waste" stroke="#ff9800" name="Waste Items" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Waste Records Table */}
      <Paper>
        <Box p={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Waste Records</Typography>
            <TextField
              size="small"
              placeholder="Search waste records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Preventable</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      {new Date(record.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.inventoryItemName}</TableCell>
                    <TableCell>{record.quantity} {record.unit}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.reason} 
                        size="small" 
                        color={record.preventable ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>${record.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={record.preventable ? 'Yes' : 'No'} 
                        size="small" 
                        color={record.preventable ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{record.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredRecords.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </Paper>

      {/* Add Waste Modal */}
      <Dialog 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Record Waste Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.inventoryItemName}
                onChange={(e) => setFormData({ ...formData, inventoryItemName: e.target.value })}
                placeholder="Enter inventory item name"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg, lbs, pieces, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Waste Reason</InputLabel>
                <Select
                  value={formData.reason}
                  label="Waste Reason"
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                >
                  {wasteReasons.map((reason) => (
                    <MenuItem key={reason} value={reason}>{reason}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Preventable</InputLabel>
                <Select
                  value={formData.preventable}
                  label="Preventable"
                  onChange={(e) => setFormData({ ...formData, preventable: e.target.value as boolean })}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about the waste event..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveWaste}
            variant="contained"
            disabled={modalLoading}
          >
            {modalLoading ? <CircularProgress size={20} /> : 'Record Waste'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={error ? 'error' : 'success'} onClose={() => setSnackbarOpen(false)}>
          {error || 'Waste record saved successfully'}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default WasteTracking;