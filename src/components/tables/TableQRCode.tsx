import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Divider, Typography, Box, CircularProgress } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { tableService } from '../../services/TableService';
import { useSnackbar } from 'notistack';

interface TableQRCodeProps {
  restaurantId: string;
  venueId: string;
  tableId: string;
  tableName: string;
  existingQrCode?: string | null;
  onClose?: () => void;
  onGenerate?: () => void;
}

const TableQRCode: React.FC<TableQRCodeProps> = ({ 
  restaurantId, 
  venueId, 
  tableId, 
  tableName, 
  existingQrCode,
  onClose,
  onGenerate
}) => {
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
      const response = await tableService.getQRCode(restaurantId, venueId, tableId);
      setQrCode(response.qrCode);
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
      const response = await tableService.generateQRCode(restaurantId, venueId, tableId);
      setQrCode(response.qrCode);
      enqueueSnackbar('QR code generated successfully', { variant: 'success' });
      // Call onGenerate callback if provided
      if (onGenerate) {
        onGenerate();
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      enqueueSnackbar('Failed to generate QR code', { variant: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const deleteQRCode = async () => {
    try {
      setLoading(true);
      await tableService.deleteQRCode(restaurantId, venueId, tableId);
      setQrCode(null);
      enqueueSnackbar('QR code deleted successfully', { variant: 'success' });
      // Call onGenerate callback to refresh the table list
      if (onGenerate) {
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
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qrcode-${tableName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate URL that can be used by customers
  const menuUrl = tableService.generateMenuUrl(tableId);

  useEffect(() => {
    // Only fetch if we don't already have it from props
    if (!existingQrCode) {
      fetchQRCode();
    }
  }, [restaurantId, venueId, tableId, existingQrCode]);

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            QR Code for Table: {tableName}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : qrCode ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <img 
              src={qrCode} 
              alt={`QR Code for table ${tableName}`} 
              style={{ maxWidth: '250px', marginBottom: '16px' }}
            />
            <Typography variant="subtitle2" gutterBottom>
              Customer URL: <code>{menuUrl}</code>
            </Typography>
            <Box display="flex" gap={2} mt={2}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={downloadQRCode}
                startIcon={<DownloadIcon />}
              >
                Download
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={deleteQRCode}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" my={3}>
            <Typography variant="subtitle1" gutterBottom>
              No QR code generated for this table yet.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={generateQRCode}
              disabled={generating}
              startIcon={generating ? <CircularProgress size={20} /> : <QrCodeIcon />}
            >
              {generating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="flex-end">
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={onClose}
            startIcon={<CloseIcon />}
          >
            Close
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TableQRCode;
