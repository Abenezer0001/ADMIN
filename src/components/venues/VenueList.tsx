import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions, 
  DialogContentText, 
  CircularProgress,
  Alert,
  Typography
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
import CSVImportModal from '../common/CSVImportModal';
import { ColumnDef } from '@tanstack/react-table';
import { venueService } from '../../services/VenueService';
import { message } from 'antd';

interface Venue {
  _id: string;
  name: string;
  description?: string;
  capacity: number;
  isActive: boolean;
  zones: string[];
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

const VenueList: React.FC = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await venueService.getAllVenues();
      setVenues(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError('Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Venue>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      header: 'Capacity',
      accessorKey: 'capacity',
    },
  ];

  const handleView = (venue: Venue) => {
    navigate(`/venues/detail/${venue._id}`);
  };

  const handleEdit = (venue: Venue) => {
    navigate(`/venues/add/${venue._id}`);
  };

  const handleDelete = (venue: Venue) => {
    setVenueToDelete(venue);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!venueToDelete) return;
    
    try {
      setLoading(true);
      await venueService.deleteVenue(venueToDelete._id);
      setVenues(venues.filter((v: Venue) => v._id !== venueToDelete._id));
      setDeleteDialogOpen(false);
      setVenueToDelete(null);
    } catch (error) {
      console.error('Error deleting venue:', error);
      setError('Failed to delete venue');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setVenueToDelete(null);
  };

  const handleExportCSV = () => {
    // Implement CSV export logic here
    const headers = ['Name', 'Description', 'Capacity'];
    const csvContent = [
      headers.join(','),
      ...venues.map((venue: Venue) => [
        venue.name,
        venue.description || '',
        venue.capacity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);  
    link.setAttribute('href', url);
    link.setAttribute('download', `venues_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('CSV exported successfully');
  };

  const handleImportCSV = async (data: any[]) => {
    try {
      const importedVenues = [];
      const errors = [];

      for (const row of data) {
        try {
          const venueData = {
            name: row.name || '',
            description: row.description || '',
            capacity: Number(row.capacity) || 0,
            isActive: row.is_active !== false,
            // Add other required fields based on your Venue interface
            zones: [],
            restaurantId: '', // This should be set based on context
          };

          // Validate required fields
          if (!venueData.name) {
            errors.push(`Row missing required field: name`);
            continue;
          }

          const result = await venueService.createVenue(venueData);
          importedVenues.push(result);
        } catch (error) {
          console.error('Error importing venue row:', error);
          errors.push(`Error importing venue "${row.name || 'Unknown'}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Refresh the list
      await fetchVenues();

      return {
        success: importedVenues.length > 0,
        message: `Successfully imported ${importedVenues.length} venues${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: 'Failed to import venues',
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
    <>
      <Box>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem', mb: 3 }}>
          Venues
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
            disabled={venues.length === 0}
            sx={{ mt: 2, mb: 0 }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/venues/add')}
            sx={{ mt: 2, mb: 0 }}
          >
            Add New Venue
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns as any}
            data={venues}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete venue "{venueToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <CSVImportModal
        open={importModalOpen}
        onClose={handleCloseImportModal}
        title="Venues"
        templateHeaders={['Name', 'Description', 'Capacity', 'Is Active']}
        templateData={[
          { name: 'Example Venue', description: 'A sample venue description', capacity: 100, is_active: 'true' }
        ]}
        onImport={handleImportCSV}
      />
    </>
  );
};

export default VenueList;
