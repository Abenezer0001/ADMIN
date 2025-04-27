import React from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CircleIcon from '@mui/icons-material/Circle';
import { tableService, Table } from '../../services/TableService';
import { API_BASE_URL } from '../../utils/config';

interface TableData {
  _id: string;
  number: string;
  capacity: number;
  type: 'REGULAR' | 'VIP' | 'COUNTER' | 'LOUNGE';
  qrCode: string;
  isOccupied: boolean;
  isActive: boolean;
  venueId: string;
}

const TableDetail = () => {
  const { id: tableId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [table, setTable] = React.useState<Table | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [qrCode, setQrCode] = React.useState<string | null>(null);

  // Using the same IDs as in TablesList for consistency
  const restaurantId = '67bac80623b878785c79615e';
  const venueId = '67c333cd6e8cd8c7c0b50bf1';

  React.useEffect(() => {
    const fetchTableDetails = async () => {
      if (!tableId || tableId === 'undefined') {
        setError('Table ID is missing or invalid');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const tableData = await tableService.getTable(restaurantId, venueId, tableId);
        setTable(tableData);
        
        // Only fetch QR code if we have a valid table
        if (tableData) {
          try {
            const qrCodeData = await tableService.getTableQRCode(restaurantId, venueId, tableId);
            setQrCode(qrCodeData);
          } catch (qrErr) {
            console.error('Error fetching QR code:', qrErr);
            // Don't set an error for QR code failure, just log it
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
  }, [tableId, restaurantId, venueId]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Table Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Table Information</Typography>
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={() => navigate(`/tables/edit/${table?._id || table?.id}`)}
              >
                Edit
              </Button>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Table Number
                </Typography>
                <Typography variant="body1">{table?.number}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Capacity
                </Typography>
                <Typography variant="body1">
                  <EventSeatIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {table?.capacity} seats
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                <Chip label={table?.type} size="small" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    icon={<CircleIcon />}
                    label={table?.isOccupied ? 'Occupied' : 'Available'}
                    color={table?.isOccupied ? 'error' : 'success'}
                    size="small"
                  />
                  {!table?.isActive && (
                    <Chip label="Inactive" color="default" size="small" />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">QR Code</Typography>
                <Tooltip title="Regenerate QR Code">
                  <IconButton
                    size="small"
                    onClick={async () => {
                      if (tableId && tableId !== 'undefined') {
                        try {
                          // First generate a new QR code on the server
                          await axios.post(`${API_BASE_URL}/api/tables/restaurant/${restaurantId}/venue/${venueId}/tables/${tableId}/qrcode`);
                          // Then fetch the new QR code
                          const newQrCode = await tableService.getTableQRCode(restaurantId, venueId, tableId);
                          setQrCode(newQrCode);
                        } catch (err) {
                          console.error('Error regenerating QR code:', err);
                        }
                      }
                    }}
                  >
                    <QrCodeIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              {qrCode ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img src={qrCode} alt="Table QR Code" style={{ maxWidth: '100%' }} />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary">No QR code available</Typography>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    sx={{ mt: 2 }}
                    onClick={async () => {
                      if (tableId && tableId !== 'undefined') {
                        try {
                          const newQrCode = await tableService.getTableQRCode(restaurantId, venueId, tableId);
                          setQrCode(newQrCode);
                        } catch (err) {
                          console.error('Error generating QR code:', err);
                        }
                      }
                    }}
                  >
                    Generate QR Code
                  </Button>
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
