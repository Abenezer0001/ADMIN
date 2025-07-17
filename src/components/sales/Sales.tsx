import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import DataTable from '../common/DataTable';

const columns = [
  { 
    header: 'Restaurant Name', 
    accessorKey: 'name' 
  },
  { 
    header: 'Total Sales', 
    accessorKey: 'totalSales' 
  },
];

const data = [
  { name: 'Tasty Bites', totalSales: 1000 },
  { name: 'Spice Haven', totalSales: 2000 },
  { name: 'The Bistro', totalSales: 3000 },
];

const handleEdit = (restaurant: any) => {
  console.log('Edit restaurant:', restaurant);
};

const handleDelete = (restaurant: any) => {
  console.log('Delete restaurant:', restaurant);
};

const handleView = (restaurant: any) => {
  console.log('View restaurant:', restaurant);
};

const Sales = () => {
  const [selectionRange, setSelectionRange] = useState<[Date, Date]>([
    new Date(),
    new Date()
  ]);

  const handleSelect = (ranges: any) => {
    setSelectionRange([ranges.selection.startDate, ranges.selection.endDate]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Sales Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Track and analyze your restaurant sales performance
      </Typography>

      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <IconButton aria-label="insights">
          <InsightsOutlined />
        </IconButton>
      </Box> */}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Total Sales
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                $6,000
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All restaurants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#1976d2' }}>
                  <StorefrontIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Avg. Sales
                </Typography>
              </Stack>
              <Typography variant="h4" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                $2,000
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per restaurant
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2e7d32' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Top Performer
                </Typography>
              </Stack>
              <Typography variant="h5" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                The Bistro
              </Typography>
              <Typography variant="body2" color="text.secondary">
                $3,000 in sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ bgcolor: '#ed6c02' }}>
                  <TrendingDownIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Lowest Performer
                </Typography>
              </Stack>
              <Typography variant="h5" component="div" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500, mb: 1 }}>
                Tasty Bites
              </Typography>
              <Typography variant="body2" color="text.secondary">
                $1,000 in sales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        dateRange={selectionRange}
      />
    </Box>
  );
}; 

export default Sales;