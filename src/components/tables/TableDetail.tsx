import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CircleIcon from '@mui/icons-material/Circle';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import CategoryIcon from '@mui/icons-material/Category';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PlaceIcon from '@mui/icons-material/Place';
import DownloadIcon from '@mui/icons-material/Download';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { tableService, Table, TableType } from '../../services/TableService';
import { API_BASE_URL } from '../../utils/config';
import { venueService } from '../../services/VenueService';
import { restaurantService } from '../../services/RestaurantService';

interface TableDetailsData {
  tableData: Table | null;
  restaurantName: string;
  venueName: string;
  tableTypeName: string;
  qrCode: string | null;
}

const TableDetail = () => {
  const { id: tableId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [table, setTable] = useState<Table | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [venueName, setVenueName] = useState<string>('');
  const [tableTypeName, setTableTypeName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    const fetchTableDetails = async () => {
      if (!tableId || tableId === 'undefined') {
        setError('Table ID is missing or invalid');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // First, try to get the table directly by ID
        const tableData = await tableService.getTableById(tableId);
        setTable(tableData);
        
        // Then fetch related data
        if (tableData) {
          // Get the restaurant name
          if (tableData.restaurantId) {
            try {
              const restaurants = await restaurantService.getRestaurants();
              const restaurant = restaurants.find(r => r._id === tableData.restaurantId);
              setRestaurantName(restaurant ? restaurant.name : 'Unknown Restaurant');
            } catch (err) {
              console.error('Error fetching restaurant:', err);
              setRestaurantName('Unknown Restaurant');
            }
          }
          
          // Get the venue name
          if (tableData.venueId) {
            try {
              const venue = await venueService.getVenue(tableData.venueId);
              setVenueName(venue.name || 'Unknown Venue');
            } catch (err) {
              console.error('Error fetching venue:', err);
              setVenueName('Unknown Venue');
            }
          }
          
          // Get the table type name
          if (tableData.tableTypeId && tableData.restaurantId) {
            try {
              const tableTypes = await tableService.getTableTypes(tableData.restaurantId);
              if (Array.isArray(tableTypes)) {
              const matchingType = tableTypes.find(type => type._id === tableData.tableTypeId);
              setTableTypeName(matchingType ? matchingType.name : 'Unknown Type');
              } else {
                setTableTypeName('Unknown Type');
              }
            } catch (err) {
              console.error('Error fetching table types:', err);
              setTableTypeName('Unknown Type');
            }
          }
          
          // Fetch QR code if available
          if (tableData.restaurantId && tableData.venueId) {
          try {
            const qrCodeData = await tableService.getTableQRCode(tableData.restaurantId, tableData.venueId, tableId);
            setQrCode(qrCodeData);
          } catch (qrErr) {
            console.error('Error fetching QR code:', qrErr);
            // Don't set an error for QR code failure, just log it
            }
          }
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch table details. Please try again later.');
        console.error('Error fetching table details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTableDetails();
  }, [tableId]);
  
  const generateQRCode = async () => {
    if (!table) return;
    
    try {
      setGeneratingQR(true);
      // First generate a new QR code on the server
      await tableService.generateQRCode(table.restaurantId, table.venueId, tableId);
      // Then fetch the new QR code
      const newQrCode = await tableService.getTableQRCode(table.restaurantId, table.venueId, tableId);
      setQrCode(newQrCode);
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setGeneratingQR(false);
    }
  };
  
  const downloadQRCode = () => {
    if (!qrCode || !table) return;
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `table-${table.number}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<KeyboardBackspaceIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  // Generate the customer-facing URL for this table
  const customerUrl = table ? tableService.getCustomerTableUrl(table.id || table._id) : '';

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button 
            variant="outlined"
            startIcon={<KeyboardBackspaceIcon />}
            onClick={() => navigate('/tables')}
          >
            Back to Tables
          </Button>
          <Typography variant="h4">Table Details</Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/tables/edit/${tableId}`)}
        >
          Edit Table
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Table Info Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Table Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableRestaurantIcon />
                  <Typography variant="subtitle1">
                    Table Number: <strong>{table?.number}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventSeatIcon />
                  <Typography variant="subtitle1">
                    Capacity: <strong>{table?.capacity}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CategoryIcon />
                  <Typography variant="subtitle1">
                    Type: <strong>{tableTypeName}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RestaurantIcon />
                  <Typography variant="subtitle1">
                    Restaurant: <strong>{restaurantName}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PlaceIcon />
                  <Typography variant="subtitle1">
                    Venue: <strong>{venueName}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Chip
                    icon={<CircleIcon sx={{ fontSize: '16px' }} />}
                    label={table?.isActive ? 'Active' : 'Inactive'}
                    color={table?.isActive ? 'success' : 'default'}
                  />
                  <Chip
                    icon={<CircleIcon sx={{ fontSize: '16px' }} />}
                    label={table?.isOccupied ? 'Occupied' : 'Available'}
                    color={table?.isOccupied ? 'error' : 'success'}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* QR Code Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">QR Code</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    onClick={generateQRCode}
                    disabled={generatingQR}
                    sx={{ mr: 1 }}
                  >
                    {generatingQR ? 'Generating...' : 'Generate New'}
                  </Button>
                  {qrCode && (
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={downloadQRCode}
                    >
                      Download
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {qrCode ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img src={qrCode} alt="Table QR Code" style={{ maxWidth: '200px', margin: '20px auto' }} />
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Customer URL: <code>{customerUrl}</code>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Customers can scan this QR code to access the menu and place orders from this table.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No QR code available. Generate one using the button above.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableDetail;
