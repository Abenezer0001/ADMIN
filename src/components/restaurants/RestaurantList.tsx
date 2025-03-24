import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../common/DataTable';
import RestaurantDetail from './RestaurantDetail';
import { ColumnDef } from '@tanstack/react-table';

interface Restaurant {
  _id: string;
  name: string;
  locations: { address: string }[];
  venues: string[];
  tables: any[];
  menu: any[];
  schedule: any[];
  createdAt: string;
  updatedAt: string;
}

const RestaurantList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Restaurant>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Address',
      accessorFn: (row) => row.locations[0]?.address || '-',
      cell: ({ getValue }) => getValue(),
    },
    {
      header: 'Venues',
      accessorFn: (row) => row.venues?.length || 0,
      cell: ({ getValue }) => getValue(),
    },
    {
      header: 'Tables',
      accessorFn: (row) => row.tables?.length || 0,
      cell: ({ getValue }) => getValue(),
    },
  ];

  const handleView = (restaurant: Restaurant) => {
    navigate(`/restaurants/detail/${restaurant._id}`);
  };

  const handleEdit = (restaurant: Restaurant) => {
    navigate(`/restaurants/add/${restaurant._id}`);
  };

  const handleDelete = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!restaurantToDelete) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/restaurants/${restaurantToDelete._id}`);
      setRestaurants(restaurants.filter(r => r._id !== restaurantToDelete._id));
      setDeleteDialogOpen(false);
      setRestaurantToDelete(null);
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setRestaurantToDelete(null);
  };

  const handleAddNew = () => {
    navigate('/restaurants/add');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{ mt: 2, mb: 0 }}
        >
          Add New Restaurant
        </Button>
      </Box>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={restaurants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete restaurant "{restaurantToDelete?.name}"? This action cannot be undone.
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

export default RestaurantList;
