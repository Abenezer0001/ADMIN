import * as React from 'react';
const { useState, useEffect } = React;
import { Button, Card, CardContent, Divider, Typography, Box, CircularProgress } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { tableService, Table as TableData } from '../../services/TableService';
import { useSnackbar } from 'notistack';

interface TableQRCodeProps {
  table: TableData;
  fallbackRestaurantId?: string; // Added fallback restaurant ID to use if table.restaurantId is undefined
  onClose?: () => void;
  onGenerate?: () => void;
}

const TableQRCode: React.FC<TableQRCodeProps> = ({ 
  table,
  fallbackRestaurantId,
  onClose,
  onGenerate
}: TableQRCodeProps) => {
  // Extract needed properties from table object
  const { _id: tableId, restaurantId: tableRestaurantId, venueId, number: tableName, qrCode: existingQrCode } = table;
  // Use fallback restaurant ID if table's restaurantId is undefined
  const restaurantId = tableRestaurantId || fallbackRestaurantId;
  const [qrCode, setQrCode] = useState<string | null>(existingQrCode || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchQRCode = async () => {
    if (existingQrCode) {
      setQrCode(existingQrCode);
      return;
    }
    
    try {
      setLoading(true);
      // Make sure we have all required IDs before making the API call
      if (!restaurantId || !venueId || !tableId) {
        console.error('Missing required IDs for QR code:', { restaurantId, venueId, tableId });
        return;
      }
      const response = await tableService.getQRCode(restaurantId, venueId, tableId);
      if (response && typeof response === 'object' && 'qrCode' in response) {
        setQrCode(response.qrCode);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      // It's okay if QR code doesn't exist yet
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setGenerating(true);
      // Make sure we have all required IDs before making the API call
      if (!restaurantId || !venueId || !tableId) {
        console.error('Missing required IDs for QR code generation:', { restaurantId, venueId, tableId });
        enqueueSnackbar('Missing restaurant, venue or table information', { variant: 'error' });
        return;
      }
      const response = await tableService.generateQRCode(restaurantId, venueId, tableId);
      if (response && typeof response === 'object' && 'qrCode' in response) {
        setQrCode(response.qrCode);
        enqueueSnackbar('QR code generated successfully', { variant: 'success' });
        // Call onGenerate callback if provided
        if (onGenerate) {
          onGenerate();
        }
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      enqueueSnackbar('Failed to generate QR code', { variant: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const deleteQRCode = async () => {
    if (!qrCode) return;
    
    try {
      setLoading(true);
      await tableService.deleteQRCode(restaurantId, venueId, tableId);
      setQrCode(null);
      enqueueSnackbar('QR code deleted successfully', { variant: 'success' });
      if (onGenerate) {
        // We use onGenerate to refresh the data as well after deletion
        onGenerate();
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      enqueueSnackbar('Failed to delete QR code', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `table-qrcode-${tableId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate the customer-facing menu URL based on table ID
  const menuUrl = tableService.getCustomerTableUrl(tableId);

  useEffect(() => {
    fetchQRCode();
  }, [restaurantId, venueId, tableId, existingQrCode]);

  return (
    <Card variant="outlined" style={{ maxWidth: 500, margin: 'auto' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            QR Code for {tableName}
          </Typography>
          {onClose && (
            <Button size="small" startIcon={<CloseIcon />} onClick={onClose}>
              Close
            </Button>
          )}
        </Box>

        <Divider />

        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          my={3}
          minHeight={200}
        >
          {loading ? (
            <CircularProgress />
          ) : qrCode ? (
            <Box>
              <Box textAlign="center" mb={2}>
                <img 
                  src={qrCode} 
                  alt={`QR Code for table ${tableName}`} 
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
              <Box display="flex" justifyContent="center" gap={1}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<DownloadIcon />} 
                  onClick={downloadQRCode}
                >
                  Download
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small" 
                  startIcon={<DeleteIcon />}
                  onClick={deleteQRCode}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography variant="h6" color="textSecondary">
              No QR code generated for this table yet.
            </Typography>
          )}
        </Box>

        <Divider />

        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<QrCodeIcon />}
            onClick={generateQRCode}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TableQRCode;
