import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { useBusiness } from '../../context/BusinessContext';
import inventoryService from '../../services/InventoryService';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'testing';
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function ApiTest() {
  const { currentBusiness } = useBusiness();
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const endpoints = [
    {
      name: 'Get Inventory Items',
      test: () => inventoryService.getInventoryItems(currentBusiness?._id || ''),
      endpoint: '/api/inventory/inventory'
    },
    {
      name: 'Get Recipes',
      test: () => inventoryService.getRecipes(currentBusiness?._id || ''),
      endpoint: '/api/inventory/recipes'
    },
    {
      name: 'Get Suppliers',
      test: () => inventoryService.getSuppliers(currentBusiness?._id || ''),
      endpoint: '/api/inventory/suppliers'
    },
    {
      name: 'Get Purchase Orders',
      test: () => inventoryService.getPurchaseOrders(currentBusiness?._id || ''),
      endpoint: '/api/inventory/purchase-orders'
    },
    {
      name: 'Get Inventory Analytics',
      test: () => inventoryService.getInventoryAnalytics(currentBusiness?._id || ''),
      endpoint: '/api/inventory/analytics'
    },
    {
      name: 'Get Low Stock Alerts',
      test: () => inventoryService.getLowStockAlerts(currentBusiness?._id || ''),
      endpoint: '/api/inventory/inventory/low-stock'
    }
  ];

  const runAllTests = async () => {
    if (!currentBusiness?._id) {
      alert('Please select a business first');
      return;
    }

    setTesting(true);
    const results: ApiTestResult[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      try {
        results.push({
          endpoint: endpoint.endpoint,
          status: 'testing'
        });
        setTestResults([...results]);

        const data = await endpoint.test();
        const responseTime = Date.now() - startTime;

        results[results.length - 1] = {
          endpoint: endpoint.endpoint,
          status: 'success',
          data: data,
          responseTime
        };
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        
        results[results.length - 1] = {
          endpoint: endpoint.endpoint,
          status: 'error',
          error: error.message,
          responseTime
        };
      }
      
      setTestResults([...results]);
    }

    setTesting(false);
  };

  const clearTests = () => {
    setTestResults([]);
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const avgResponseTime = testResults.length > 0 
    ? testResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / testResults.length
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
        🧪 Inventory API Integration Test
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Test all inventory management API endpoints to verify backend integration
      </Typography>

      {/* Control Panel */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: '10px' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Button 
            variant="contained" 
            onClick={runAllTests}
            disabled={testing || !currentBusiness}
          >
            {testing ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Run All Tests
          </Button>
          <Button variant="outlined" onClick={clearTests} disabled={testing}>
            Clear Results
          </Button>
        </Box>
        
        {!currentBusiness && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please select a business from the business context to run API tests
          </Alert>
        )}
        
        {currentBusiness && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Testing with Business: <strong>{currentBusiness.name}</strong> (ID: {currentBusiness._id})
          </Alert>
        )}
      </Paper>

      {/* Results Summary */}
      {testResults.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', borderRadius: '10px' }}>
              <CardContent>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {successCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Successful
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', borderRadius: '10px' }}>
              <CardContent>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                  {errorCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', borderRadius: '10px' }}>
              <CardContent>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {testResults.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tests
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', borderRadius: '10px' }}>
              <CardContent>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {avgResponseTime.toFixed(0)}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Response
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detailed Results */}
      {testResults.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: '10px' }}>
          <Typography variant="h6" gutterBottom>
            Detailed Test Results
          </Typography>
          <List>
            {testResults.map((result, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {result.endpoint}
                      </Typography>
                      <Chip 
                        label={result.status === 'testing' ? 'Testing...' : result.status}
                        color={
                          result.status === 'success' ? 'success' : 
                          result.status === 'error' ? 'error' : 'default'
                        }
                        size="small"
                      />
                      {result.responseTime && (
                        <Chip 
                          label={`${result.responseTime}ms`}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {result.status === 'success' && result.data && (
                        <Box>
                          <Typography variant="body2" color="success.main">
                            ✅ Success - Received {Array.isArray(result.data) ? result.data.length : 1} item(s)
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Data type: {Array.isArray(result.data) ? `Array[${result.data.length}]` : typeof result.data}
                          </Typography>
                        </Box>
                      )}
                      {result.status === 'error' && (
                        <Typography variant="body2" color="error.main">
                          ❌ Error: {result.error}
                        </Typography>
                      )}
                      {result.status === 'testing' && (
                        <Typography variant="body2" color="primary.main">
                          🔄 Testing in progress...
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}