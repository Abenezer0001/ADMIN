// TablesList.tsx
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
  SelectChangeEvent,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIcon from '@mui/icons-material/Circle';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CategoryIcon from '@mui/icons-material/Category';

import { tableService, TableType, Table as TableData } from '../../services/TableService';
import { restaurantService, Restaurant } from '../../services/RestaurantService';
import { venueService, Venue } from '../../services/VenueService';
import TableQRCode from './TableQRCode';

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
  const [tableForQR, setTableForQR] = useState<TableData | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadingTableTypes, setLoadingTableTypes] = useState(false);

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
      } finally {
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch venues when restaurant changes
  useEffect(() => {
    const fetchVenues = async () => {
      if (!selectedRestaurantId || selectedRestaurantId === 'all') {
        setVenues([]);
        return;
      }
      
      try {
        setLoadingVenues(true);
        const data = await venueService.getVenues(selectedRestaurantId);
        setVenues(data);

        // If we have venues, add an "All Venues" option and select it by default
        if (data && data.length > 0) {
          setSelectedVenueId('all');
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

  // Fetch table types for all restaurants or a specific restaurant
  useEffect(() => {
    const fetchTableTypes = async () => {
      try {
        setLoadingTableTypes(true);
        let allTableTypes: TableType[] = [];

        if (selectedRestaurantId === 'all') {
          // Fetch table types for all restaurants
          for (const restaurant of restaurants) {
            const data = await tableService.getTableTypes(restaurant._id);
            if (data) {
               allTableTypes = [...allTableTypes, ...data];
            }
          }
        } else if (selectedRestaurantId) {
          // Fetch table types for the selected restaurant
          const data = await tableService.getTableTypes(selectedRestaurantId);
          if (data) {
             allTableTypes = data;
          } else {
             allTableTypes = [];
          }
        }
        
        setTableTypes(allTableTypes);
      } catch (err) {
        console.error('Error fetching table types:', err);
      } finally {
        setLoadingTableTypes(false);
      }
    };

    fetchTableTypes();
  }, [selectedRestaurantId, restaurants]);

  // Fetch tables when restaurant or venue changes
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the filtered tables endpoint with appropriate parameters based on selection
        console.log(`Fetching tables with restaurant=${selectedRestaurantId}, venue=${selectedVenueId}`);
        
        if (!selectedRestaurantId || selectedRestaurantId === '') {
          // No restaurant selected yet
          setTables([]);
        } else if (selectedRestaurantId === 'all') {
          // Get all tables from all restaurants
          const allTables = await tableService.getFilteredTables();
          console.log(`Found ${allTables.length} tables across all restaurants`);
          setTables(allTables);
        } else if (selectedRestaurantId && (!selectedVenueId || selectedVenueId === 'all')) {
          // Get all tables for a specific restaurant
          const restaurantTables = await tableService.getFilteredTables(selectedRestaurantId);
          console.log(`Found ${restaurantTables.length} tables for restaurant ${selectedRestaurantId}`);
          setTables(restaurantTables);
        } else if (selectedRestaurantId && selectedVenueId) {
          // Get tables for a specific venue in a specific restaurant
          const venueTables = await tableService.getFilteredTables(selectedRestaurantId, selectedVenueId);
          console.log(`Found ${venueTables.length} tables for venue ${selectedVenueId} in restaurant ${selectedRestaurantId}`);
          setTables(venueTables);
        } else {
          setTables([]);
        }
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError('Failed to fetch tables. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Fetch tables whenever restaurant or venue selection changes
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

  const handleDeleteTable = (table: TableData) => {
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tableToDelete) return;
    
    try {
      const tableId = tableToDelete._id || tableToDelete.id;
      
      // Use restaurant and venue context if available, otherwise use direct approach
      if (selectedRestaurantId !== 'all' && selectedVenueId !== 'all' && selectedVenueId) {
        console.log(`Deleting table ${tableId} with restaurant/venue context`);
        await tableService.deleteTable(selectedRestaurantId, selectedVenueId, tableId);
      } else {
        // Fallback to direct deletion if we don't have specific restaurant and venue
        console.log(`Using direct table deletion endpoint for table ${tableId}`);
        await tableService.deleteTableDirect(tableId);
      }
      
      // Remove the deleted table from the tables array
      setTables(prevTables => prevTables.filter(table => 
        (table._id || table.id) !== tableId
      ));
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setTableToDelete(null);
  };

  const handleShowQrCode = (table: TableData) => {
    setTableForQR(table);
    setQrCodeModalOpen(true);
  };

  const handleToggleStatus = async (tableId: string, isActive: boolean) => {
    try {
      await tableService.updateTableStatus(tableId, !isActive);
      // Update the table status in the tables array
      setTables(prevTables => 
        prevTables.map(table => 
          (table._id || table.id) === tableId 
            ? { ...table, isActive: !isActive } 
            : table
        )
      );
    } catch (error) {
      console.error('Error toggling table status:', error);
    }
  };

  const getTableTypeName = (tableTypeId: any) => {
    // Case 1: tableTypeId is a TableType object with name property
    if (tableTypeId && typeof tableTypeId === 'object' && tableTypeId.name) {
      return tableTypeId.name;
    }
    
    // Case 2: tableTypeId is a string ID, look it up in the tableTypes array
    if (typeof tableTypeId === 'string') {
      const tableType = tableTypes.find(type => type._id === tableTypeId);
      return tableType ? tableType.name : 'Unknown';
    }
    
    // Default case: can't determine table type
    return 'Unknown';
  };

  // Filter tables based on search term
  const filteredTables = tables.filter(table => {
    const searchString = searchTerm.toLowerCase();
    const tableNumber = table.number?.toString().toLowerCase() || '';
    const capacity = table.capacity?.toString().toLowerCase() || '';
    const tableTypeName = getTableTypeName(table.tableTypeId).toLowerCase();
    
    return (
      tableNumber.includes(searchString) ||
      capacity.includes(searchString) ||
      tableTypeName.includes(searchString)
    );
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tables
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
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
            <MenuItem value="all">All Restaurants</MenuItem>
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
            disabled={loadingVenues || !selectedRestaurantId || selectedRestaurantId === 'all'}
          >
            <MenuItem value="all">All Venues</MenuItem>
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
                <TableCell>Table Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>QR Code</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredTables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">No tables found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTables
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CategoryIcon sx={{ mr: 1, fontSize: 16 }} />
                          {getTableTypeName(table.tableTypeId)}
                        </Box>
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
                        <Tooltip title={table.qrCode ? "View/Edit QR Code" : "Generate QR Code"}>
                          <IconButton
                            size="small"
                            onClick={() => handleShowQrCode(table)}
                          >
                            <QrCodeIcon color={table.qrCode ? "primary" : "action"} />
                          </IconButton>
                        </Tooltip>
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
                  ))
              )}
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
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          {tableForQR && (
            <TableQRCode
              table={tableForQR}
              fallbackRestaurantId={selectedRestaurantId}
              onClose={() => setQrCodeModalOpen(false)}
              onGenerate={() => {
                // Refresh the table data after QR code generation using the filtered endpoint
                console.log('Refreshing tables after QR code generation');
                if (!selectedRestaurantId || selectedRestaurantId === '') {
                  // No restaurant selected yet
                  setTables([]);
                } else if (selectedRestaurantId === 'all') {
                  tableService.getFilteredTables().then(data => {
                    console.log(`Refreshed: found ${data.length} tables across all restaurants`);
                    setTables(data);
                  });
                } else if (selectedRestaurantId && (!selectedVenueId || selectedVenueId === 'all')) {
                  tableService.getFilteredTables(selectedRestaurantId).then(data => {
                    console.log(`Refreshed: found ${data.length} tables for restaurant ${selectedRestaurantId}`);
                    setTables(data);
                  });
                } else if (selectedRestaurantId && selectedVenueId) {
                  tableService.getFilteredTables(selectedRestaurantId, selectedVenueId).then(data => {
                    console.log(`Refreshed: found ${data.length} tables for venue ${selectedVenueId} in restaurant ${selectedRestaurantId}`);
                    setTables(data);
                  });
                }
              }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default TablesList;
