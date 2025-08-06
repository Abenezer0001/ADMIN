import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Divider,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const DropZone = styled(Paper)(({ theme, isDragOver }: { theme?: any; isDragOver: boolean }) => ({
  border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: isDragOver ? theme.palette.primary.light + '0A' : theme.palette.background.default,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '0A',
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

// Types
export interface CSVImportProps {
  open: boolean;
  onClose: () => void;
  title: string;
  templateHeaders: string[];
  templateData?: any[];
  onImport: (data: any[]) => Promise<{ success: boolean; message: string; errors?: string[] }>;
  acceptedFileTypes?: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  errors?: string[];
}

const CSVImportModal: React.FC<CSVImportProps> = ({
  open,
  onClose,
  title,
  templateHeaders,
  templateData = [],
  onImport,
  acceptedFileTypes = '.csv',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    onClose();
  };

  const generateTemplate = () => {
    let csvContent = templateHeaders.join(',') + '\n';
    
    // Add sample data if provided
    if (templateData.length > 0) {
      csvContent += templateData.map(row => 
        templateHeaders.map(header => {
          const value = row[header.toLowerCase().replace(/ /g, '_')] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      ).join('\n');
    } else {
      // Add empty row with example data types
      csvContent += templateHeaders.map(header => {
        switch (header.toLowerCase()) {
          case 'name':
            return '"Example Name"';
          case 'description':
            return '"Example Description"';
          case 'capacity':
          case 'price':
            return '100';
          case 'isactive':
          case 'is_active':
            return 'true';
          case 'email':
            return '"example@email.com"';
          default:
            return '"Example Value"';
        }
      }).join(',');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/ /g, '_')}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/ /g, '_');
        let value = values[index] || '';
        
        // Convert boolean strings
        if (value.toLowerCase() === 'true') value = true;
        else if (value.toLowerCase() === 'false') value = false;
        // Convert numbers
        else if (!isNaN(Number(value)) && value !== '') value = Number(value);
        
        row[key] = value;
      });
      
      data.push(row);
    }

    return data;
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setImportResult(null);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        setImportResult({
          success: false,
          message: 'No valid data found in CSV file',
        });
        return;
      }

      const result = await onImport(data);
      setImportResult(result);
      
      if (result.success) {
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Failed to process CSV file',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Import {title}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Upload a CSV file to import {title.toLowerCase()}. You can download a template to ensure proper formatting.
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={generateTemplate}
            sx={{ mb: 2 }}
          >
            Download Template
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <DropZone
          isDragOver={dragOver}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {selectedFile ? selectedFile.name : 'Drop your CSV file here'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Or click to browse files
          </Typography>
          
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileInput}
          />
        </DropZone>

        {importing && (
          <Box mt={3}>
            <Typography variant="body2" gutterBottom>
              Processing CSV file...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {importResult && (
          <Box mt={3}>
            <Alert 
              severity={importResult.success ? 'success' : 'error'}
              icon={importResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
            >
              <Typography variant="body2">
                {importResult.message}
              </Typography>
              {importResult.errors && importResult.errors.length > 0 && (
                <Box mt={1}>
                  <Typography variant="body2" fontWeight="bold">
                    Errors:
                  </Typography>
                  {importResult.errors.map((error, index) => (
                    <Typography key={index} variant="body2" color="error">
                      • {error}
                    </Typography>
                  ))}
                </Box>
              )}
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={importing}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!selectedFile || importing}
          startIcon={<CloudUploadIcon />}
        >
          {importing ? 'Importing...' : 'Import Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CSVImportModal;