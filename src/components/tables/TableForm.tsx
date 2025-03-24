import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { tableService, CreateTableDto, UpdateTableDto } from '../../services/TableService';
import { restaurantService, Restaurant } from '../../services/RestaurantService';
import { venueService, Venue } from '../../services/VenueService';

interface TableFormData {
  number: string;
  capacity: number;
  type: 'REGULAR' | 'VIP' | 'COUNTER' | 'LOUNGE';
  isActive: boolean;
  isOccupied?: boolean;
  qrCode?: string;
  restaurantId: string;
  venueId: string;
}

interface TableFormProps {
  tableId?: string;
  onSubmit?: () => void;
  title: string;
}

const TableForm = ({ onSubmit, title }: TableFormProps) => {
  const navigate = useNavigate();
  const { id: urlTableId } = useParams<{ id: string }>();
  // Use the ID from URL params if available, otherwise use the prop
  const tableId = urlTableId;
  const [formData, setFormData] = useState<TableFormData>({
    number: '',
    capacity: 2,
    type: 'REGULAR',
    isActive: true,
    isOccupied: false,
    restaurantId: '',
    venueId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch restaurants when component mounts
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoadingRestaurants(true);
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);
        
        // If we don't have a selected restaurant yet and we have restaurants, select the first one
        if (!formData.restaurantId && data.length > 0) {
          setFormData(prev => ({
            ...prev,
            restaurantId: data[0]._id
          }));
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
      if (!formData.restaurantId) return;
      
      try {
        setLoadingVenues(true);
        const data = await venueService.getVenues(formData.restaurantId);
        setVenues(data);
        
        // If we don't have a selected venue yet and we have venues, select the first one
        if (!formData.venueId && data.length > 0) {
          setFormData(prev => ({
            ...prev,
            venueId: data[0]._id
          }));
        }
      } catch (err) {
        console.error('Error fetching venues:', err);
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();
  }, [formData.restaurantId]);

  // When component mounts, check if we're in edit mode and fetch the table data
  useEffect(() => {
    console.log('TableForm - tableId:', tableId);
    
    const fetchTable = async () => {
      if (!tableId || tableId === 'undefined') {
        console.log('TableForm - No valid tableId, skipping fetch');
        return;
      }
      
      // We need a restaurantId and venueId to fetch the table
      if (!formData.restaurantId || !formData.venueId) {
        return;
      }
      
      try {
        setLoading(true);
        console.log('TableForm - Fetching table with ID:', tableId);
        const data = await tableService.getTable(formData.restaurantId, formData.venueId, tableId);
        console.log('TableForm - Fetched data:', data);
        
        // Make sure we have valid data before setting it
        if (data && (data.number || data.capacity)) {
          setFormData(prev => ({
            ...prev,
            number: data.number || '',
            capacity: data.capacity || 2,
            type: data.type || 'REGULAR',
            isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
            isOccupied: typeof data.isOccupied === 'boolean' ? data.isOccupied : false,
            qrCode: data.qrCode
          }));
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch table details. Please try again later.');
        console.error('Error fetching table:', err);
      } finally {
        setLoading(false);
      }
    };

    if (formData.restaurantId && formData.venueId) {
      fetchTable();
    }
  }, [tableId, formData.restaurantId, formData.venueId]);

  const handleChange = (field: keyof TableFormData) => (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const value = event.target.type === 'checkbox'
      ? (event.target as HTMLInputElement).checked
      : event.target.value;
      
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      console.log('TableForm - Submit with tableId:', tableId);
      
      // Validate form data
      if (!formData.number || formData.number.trim() === '') {
        setError('Table number is required');
        setLoading(false);
        return;
      }
      
      if (!formData.capacity || formData.capacity < 1) {
        setError('Capacity must be at least 1');
        setLoading(false);
        return;
      }

      if (!formData.restaurantId) {
        setError('Restaurant is required');
        setLoading(false);
        return;
      }

      if (!formData.venueId) {
        setError('Venue is required');
        setLoading(false);
        return;
      }
      
      if (tableId && tableId !== 'undefined') {
        // For update, only send the fields that are in UpdateTableDto
        const updateData: UpdateTableDto = {
          number: formData.number,
          capacity: formData.capacity,
          type: formData.type,
          isActive: formData.isActive,
          isOccupied: formData.isOccupied,
          venueId: formData.venueId
        };
        console.log('Updating table:', tableId, updateData);
        
        try {
          const updatedTable = await tableService.updateTable(
            formData.restaurantId,
            formData.venueId,
            tableId,
            updateData
          );
          console.log('Table updated successfully:', updatedTable);
          if (onSubmit) {
            onSubmit();
          } else {
            navigate('/tables/list');
          }
        } catch (updateError: any) {
          console.error('Error updating table:', updateError);
          setError(updateError?.response?.data?.message || 'Failed to update table. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        // For create, use the CreateTableDto structure
        const createData: CreateTableDto = {
          number: formData.number,
          capacity: formData.capacity,
          type: formData.type,
          isActive: formData.isActive,
          venueId: formData.venueId
        };
        console.log('Creating new table:', createData);
        
        try {
          const result = await tableService.createTable(
            formData.restaurantId,
            formData.venueId,
            createData
          );
          console.log('Table created successfully:', result);
          if (onSubmit) {
            onSubmit();
          } else {
            navigate('/tables/list');
          }
        } catch (createError: any) {
          console.error('Error creating table:', createError);
          setError(createError?.response?.data?.message || 'Failed to create table. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Call onSubmit if provided, otherwise navigate back to tables list
      if (onSubmit) {
        onSubmit();
      } else {
        navigate('/tables/list');
      }
    } catch (err) {
      setError('Failed to save table. Please try again later.');
      console.error('Error saving table:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tableId || !formData.restaurantId || !formData.venueId) return;
    
    try {
      setLoading(true);
      await tableService.deleteTable(formData.restaurantId, formData.venueId, tableId);
      setDeleteDialogOpen(false);
      navigate('/tables/list');
    } catch (err) {
      console.error('Error deleting table:', err);
      setError('Failed to delete table. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tableTypes = ['REGULAR', 'VIP', 'COUNTER', 'LOUNGE'];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          {tableId && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Restaurant</InputLabel>
            <Select
              value={formData.restaurantId}
              label="Restaurant"
              onChange={handleChange('restaurantId')}
              disabled={loadingRestaurants || !!tableId}
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

          <FormControl fullWidth>
            <InputLabel>Venue</InputLabel>
            <Select
              value={formData.venueId}
              label="Venue"
              onChange={handleChange('venueId')}
              disabled={loadingVenues || !formData.restaurantId || !!tableId}
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
            required
            label="Table Number"
            value={formData.number}
            onChange={handleChange('number')}
            fullWidth
          />

          <TextField
            required
            type="number"
            label="Capacity"
            value={formData.capacity}
            onChange={handleChange('capacity')}
            fullWidth
            inputProps={{ min: 1 }}
          />

          <FormControl fullWidth>
            <InputLabel>Table Type</InputLabel>
            <Select
              value={formData.type}
              label="Table Type"
              onChange={handleChange('type')}
            >
              {tableTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange('isActive')}
              />
            }
            label="Active"
          />

          {tableId && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isOccupied}
                  onChange={handleChange('isOccupied')}
                />
              }
              label="Occupied"
            />
          )}

          {formData.qrCode && (
            <Box sx={{ textAlign: 'center' }}>
              <img src={formData.qrCode} alt="Table QR Code" style={{ maxWidth: 200 }} />
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this table? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TableForm;
