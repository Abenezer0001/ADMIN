// TableTypeList.tsx
import * as React from 'react';
const { useState, useEffect } = React;
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { tableService, TableType } from '../../services/TableService';
import { restaurantService } from '../../services/RestaurantService';

interface Restaurant {
  _id: string;
  name: string;
}
import MUITableSkeleton from '../common/MUITableSkeleton';
import { exportToCSV, ExportColumn } from '../../utils/csvExport';

const TableTypeList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableTypeToDelete, setTableTypeToDelete] = useState<TableType | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Fetch restaurants when component mounts
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);

        // If we have restaurants, select the first one
        if (data && data.length > 0) {
          setSelectedRestaurantId(data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch table types when restaurant changes
  useEffect(() => {
    const fetchTableTypes = async () => {
      if (!selectedRestaurantId) {
        setTableTypes([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const data = await tableService.getTableTypes(selectedRestaurantId);
        setTableTypes(data);
      } catch (err) {
        console.error('Error fetching table types:', err);
        setError('Failed to load table types. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTableTypes();
  }, [selectedRestaurantId]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRestaurantChange = (event: SelectChangeEvent) => {
    setSelectedRestaurantId(event.target.value);
  };

  const handleDeleteTableType = (tableType: TableType) => {
    setTableTypeToDelete(tableType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tableTypeToDelete || !selectedRestaurantId) return;
    
    try {
      await tableService.updateTableType(
        selectedRestaurantId,
        tableTypeToDelete._id,
        { name: tableTypeToDelete.name + ' (deleted)', description: 'Deleted table type' }
      );
      
      // Refresh the table types list
      const updatedTableTypes = await tableService.getTableTypes(selectedRestaurantId);
      setTableTypes(updatedTableTypes);
      
      setDeleteDialogOpen(false);
      setTableTypeToDelete(null);
    } catch (err) {
      console.error('Error deleting table type:', err);
      setError('Failed to delete table type. Please try again later.');
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTableTypeToDelete(null);
  };

  const handleExportCSV = () => {
    if (tableTypes.length === 0) return;

    const columns: ExportColumn[] = [
      { key: '_id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      { key: 'restaurantId', label: 'Restaurant ID' }
    ];

    exportToCSV(tableTypes, columns, 'table_types');
  };

  // Filter table types based on search term
  const filteredTableTypes = tableTypes.filter((tableType: TableType) =>
    tableType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tableType.description && tableType.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginated table types
  const paginatedTableTypes = filteredTableTypes
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Get restaurant name by ID
  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find((r: Restaurant) => r._id === restaurantId);
    return restaurant ? restaurant.name : 'Unknown Restaurant';
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 2 
      }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
          Table Types
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/tabletypes/new')}
            disabled={!selectedRestaurantId}
          >
            Add New Table Type
          </Button>
          
          <Button 
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            disabled={tableTypes.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 2,
        gap: 2
      }}>
        {/* Restaurant Selection */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Restaurant</InputLabel>
          <Select
            value={selectedRestaurantId}
            label="Restaurant"
            onChange={handleRestaurantChange}
            disabled={loadingRestaurants || restaurants.length === 0}
          >
            {restaurants.map((restaurant: Restaurant) => (
              <MenuItem key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Search Field */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <TextField
            label="Search Table Types"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <MUITableSkeleton />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Restaurant</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTableTypes.length === 0 ? (
                <TableRow>
                  <TableCell sx={{ textAlign: 'center' }} colSpan={4}>
                    No table types found. {!selectedRestaurantId && 'Please select a restaurant.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTableTypes.map((tableType: TableType) => (
                  <TableRow key={tableType._id}>
                    <TableCell>{tableType.name}</TableCell>
                    <TableCell>{tableType.description || 'No description'}</TableCell>
                    <TableCell>{getRestaurantName(tableType.restaurantId)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/tabletypes/edit/${tableType._id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteTableType(tableType)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTableTypes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the table type "{tableTypeToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TableTypeList;
