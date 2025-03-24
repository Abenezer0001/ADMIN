// rs
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table as MUITable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIcon from '@mui/icons-material/Circle';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';

import { tableService } from '../../services/TableService';
import type { Table as TableData } from '../../services/TableService';
import { restaurantService, Restaurant } from '../../services/RestaurantService';
import { venueService, Venue } from '../../services/VenueService';



const TablesList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<TableData | null>(null);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);

  // Fetch restaurants when component mounts
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);
        
        // If we have restaurants, select the first one
        if (data.length > 0) {
          setSelectedRestaurantId(data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch venues when restaurant changes
  useEffect(() => {
    const fetchVenues = async () => {
      if (!selectedRestaurantId) return;
      
      try {
        setLoadingVenues(true);
        const data = await venueService.getVenues(selectedRestaurantId);
        setVenues(data);
        
        // If we have venues, select the first one
        if (data.length > 0) {
          setSelectedVenueId(data[0]._id);
        } else {
          setSelectedVenueId('');
        }
      } catch (err) {
        console.error('Error fetching venues:', err);
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();
  }, [selectedRestaurantId]);

  // Fetch tables when restaurant or venue changes
  useEffect(() => {
    const fetchTables = async () => {
      if (!selectedRestaurantId || !selectedVenueId) return;
      
      try {
        setLoading(true);
        const data = await tableService.getTables(selectedRestaurantId, selectedVenueId);
        console.log('Fetched tables:', data);
        setTables(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tables. Please try again later.');
        console.error('Error fetching tables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [selectedRestaurantId, selectedVenueId]);

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

  const handleVenueChange = (event: SelectChangeEvent) => {
    setSelectedVenueId(event.target.value);
  };

  const filteredTables = tables.filter((table) =>
    table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTable = (table: TableData) => {
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tableToDelete) return;
    
    try {
      await tableService.deleteTable(selectedRestaurantId, selectedVenueId, tableToDelete._id || tableToDelete.id);
      setTables(tables.filter(table => (table._id || table.id) !== (tableToDelete._id || tableToDelete.id)));
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    } catch (err) {
      console.error('Error deleting table:', err);
      setError('Failed to delete table. Please try again.');
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTableToDelete(null);
  };

  const handleShowQrCode = (qrCode: string) => {
    setSelectedQrCode(qrCode);
    setQrCodeModalOpen(true);
  };

  // Handle toggling table active status
  const handleToggleStatus = async (tableId: string, currentStatus: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the service to toggle the status
      const updatedTable = await tableService.toggleTableStatus(
        selectedRestaurantId,
        selectedVenueId,
        tableId,
        !currentStatus
      );
      
      // Update the tables state with the updated table
      setTables(tables.map(table => {
        if ((table._id || table.id) === tableId) {
          return { ...table, isActive: !currentStatus };
        }
        return table;
      }));
      
      // Show success message (optional)
      console.log(`Table status updated successfully to ${!currentStatus ? 'active' : 'inactive'}`);
    } catch (err) {
      console.error('Error toggling table status:', err);
      setError('Failed to update table status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && tables.length === 0) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Tables
        </Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => navigate('/tables/new')}
        >
          Add Table
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Restaurant</InputLabel>
          <Select
            value={selectedRestaurantId}
            label="Restaurant"
            onChange={handleRestaurantChange}
            disabled={loadingRestaurants}
          >
            {loadingRestaurants ? (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              restaurants.map((restaurant) => (
                <MenuItem key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Venue</InputLabel>
          <Select
            value={selectedVenueId}
            label="Venue"
            onChange={handleVenueChange}
            disabled={loadingVenues || !selectedRestaurantId}
          >
            {loadingVenues ? (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              venues.map((venue) => (
                <MenuItem key={venue._id} value={venue._id}>
                  {venue.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <MUITable>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>QR Code</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTables
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((table) => (
                  <TableRow key={table._id || table.id}>
                    <TableCell>{table.number}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EventSeatIcon sx={{ mr: 1, fontSize: 16 }} />
                        {table.capacity}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={table.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={<CircleIcon />}
                          label={table.isOccupied ? 'Occupied' : 'Available'}
                          color={table.isOccupied ? 'error' : 'success'}
                          size="small"
                        />
                        <Chip 
                          label={table.isActive ? 'Active' : 'Inactive'} 
                          color={table.isActive ? 'success' : 'default'} 
                          size="small"
                          onClick={() => handleToggleStatus(table._id || table.id, table.isActive)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      {table.qrCode ? (
                        <IconButton
                          size="small"
                          onClick={() => handleShowQrCode(table.qrCode as string)}
                        >
                          <QrCodeIcon color="primary" />
                        </IconButton>
                      ) : (
                        <QrCodeIcon color="disabled" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tables/${table._id || table.id}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tables/edit/${table._id || table.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTable(table)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </MUITable>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTables.length}
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
            Are you sure you want to delete table "{tableToDelete?.number}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Modal */}
      <Modal
        open={qrCodeModalOpen}
        onClose={() => setQrCodeModalOpen(false)}
        aria-labelledby="qr-code-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h6" component="h2" mb={2}>
            Table QR Code
          </Typography>
          {selectedQrCode && (
            <img src={selectedQrCode} alt="Table QR Code" style={{ maxWidth: '100%' }} />
          )}
          <Button
            onClick={() => setQrCodeModalOpen(false)}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default TablesList;
