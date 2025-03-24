import React from 'react';
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
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DataTable from '../common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { zoneService } from '../../services/ZoneService';
import { venueService } from '../../services/VenueService';

interface Zone {
  _id: string;
  name: string;
  description?: string;
  venueId: string;
  capacity: number;
  isActive: boolean;
  tables: string[];
  createdAt: string;
  updatedAt: string;
}

interface Venue {
  _id: string;
  name: string;
  restaurantId: string;
}

const ZoneList = () => {
  const navigate = useNavigate();
  const [zones, setZones] = React.useState<Zone[]>([]);
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [zoneToDelete, setZoneToDelete] = React.useState<Zone | null>(null);
  const [selectedVenueId, setSelectedVenueId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchVenues();
  }, []);

  React.useEffect(() => {
    if (selectedVenueId) {
      fetchZones(selectedVenueId);
    }
  }, [selectedVenueId]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const venuesData = await venueService.getAllVenues();
      setVenues(venuesData);
      
      // Select the first venue by default if available
      if (venuesData.length > 0) {
        setSelectedVenueId(venuesData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError('Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  const fetchZones = async (venueId: string) => {
    try {
      setLoading(true);
      const zonesData = await zoneService.getZones(venueId);
      setZones(zonesData);
      setError(null);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setError('Failed to fetch zones');
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Zone>[] = [
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
    {
      header: 'Tables',
      accessorFn: (row) => row.tables?.length || 0,
      cell: ({ getValue }) => getValue(),
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: ({ row }) => (row.original.isActive ? 'Active' : 'Inactive'),
    },
  ];

  const handleView = (zone: Zone) => {
    navigate(`/zones/detail/${zone._id}`);
  };

  const handleEdit = (zone: Zone) => {
    navigate(`/zones/add/${zone.venueId}/${zone._id}`);
  };

  const handleDelete = (zone: Zone) => {
    setZoneToDelete(zone);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!zoneToDelete) return;
    
    try {
      setLoading(true);
      await zoneService.deleteZone(zoneToDelete._id);
      setZones(zones.filter((z: Zone) => z._id !== zoneToDelete._id));
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
    } catch (error) {
      console.error('Error deleting zone:', error);
      setError('Failed to delete zone');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setZoneToDelete(null);
  };

  const handleAddNew = () => {
    navigate('/zones/add');
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
          Add New Zone
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
          data={zones}
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
            Are you sure you want to delete zone "{zoneToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ZoneList;