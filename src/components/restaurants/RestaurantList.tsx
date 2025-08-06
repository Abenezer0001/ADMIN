import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService, Restaurant } from '../../services/RestaurantService';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material';
import DataTable from '../common/DataTable';
import RestaurantDetail from './RestaurantDetail';
import CSVImportModal from '../common/CSVImportModal';
import { ColumnDef } from '@tanstack/react-table';

// Using the Restaurant interface from RestaurantService

const RestaurantList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
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
    // {
    //   header: 'Tables',
    //   accessorFn: (row) => row.tables?.length || 0,
    //   cell: ({ getValue }) => getValue(),
    // },
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
      await restaurantService.deleteRestaurant(restaurantToDelete._id);
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

  const handleExportCSV = () => {
    // Implement CSV export logic here
    const headers = ['Name', 'Address', 'Venues'];
    const csvContent = [
      headers.join(','),
      ...restaurants.map((restaurant: Restaurant) => [
        restaurant.name,
        restaurant.locations[0]?.address || '',
        restaurant.venues?.length || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);  
    link.setAttribute('href', url);
    link.setAttribute('download', `restaurants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (data: any[]) => {
    try {
      const importedRestaurants = [];
      const errors = [];

      for (const row of data) {
        try {
          const restaurantData = {
            name: row.name || '',
            address: row.address || '',
            // Add other required fields based on your Restaurant interface
            locations: row.address ? [{
              address: row.address,
              coordinates: { latitude: 0, longitude: 0 }
            }] : [],
            venues: [],
            tables: [],
            schedule: [],
            adminIds: [],
            menu: [],
            isActive: row.is_active !== false, // default to true unless explicitly false
          };

          // Validate required fields
          if (!restaurantData.name) {
            errors.push(`Row missing required field: name`);
            continue;
          }

          const result = await restaurantService.createRestaurant(restaurantData);
          importedRestaurants.push(result);
        } catch (error) {
          console.error('Error importing restaurant row:', error);
          errors.push(`Error importing restaurant "${row.name || 'Unknown'}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Refresh the list
      await fetchRestaurants();

      return {
        success: importedRestaurants.length > 0,
        message: `Successfully imported ${importedRestaurants.length} restaurants${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: 'Failed to import restaurants',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  const handleOpenImportModal = () => {
    setImportModalOpen(true);
  };

  const handleCloseImportModal = () => {
    setImportModalOpen(false);
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem', mb: 3 }}>
        Restaurants
      </Typography>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3} gap={2}>
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon />}
          onClick={handleOpenImportModal}
          sx={{ mt: 2, mb: 0 }}
        >
          Import CSV
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportCSV}
          disabled={restaurants.length === 0}
          sx={{ mt: 2, mb: 0 }}
        >
          Export CSV
        </Button>
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

      <CSVImportModal
        open={importModalOpen}
        onClose={handleCloseImportModal}
        title="Restaurants"
        templateHeaders={['Name', 'Address', 'Is Active']}
        templateData={[
          { name: 'Example Restaurant', address: '123 Main St, City, State', is_active: 'true' }
        ]}
        onImport={handleImportCSV}
      />
    </Box>
  );
};

export default RestaurantList;
