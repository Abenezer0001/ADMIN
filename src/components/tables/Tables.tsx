import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import TablesList from './TablesList';

// Define the table summary data
interface TableSummary {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  totalCapacity: number;
}

// Mock data for table summary
const mockTableSummary: TableSummary = {
  totalTables: 24,
  availableTables: 15,
  occupiedTables: 9,
  totalCapacity: 96
};

function Tables() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tables Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tables/edit/new')}
        >
          Add New Table
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <TableRestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  Total Tables
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {mockTableSummary.totalTables}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all restaurants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#2e7d32' }} />
                <Typography variant="h6" component="div">
                  Available
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {mockTableSummary.availableTables}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round((mockTableSummary.availableTables / mockTableSummary.totalTables) * 100)}% of total tables
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <DoNotDisturbIcon sx={{ fontSize: 40, color: '#c62828' }} />
                <Typography variant="h6" component="div">
                  Occupied
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {mockTableSummary.occupiedTables}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round((mockTableSummary.occupiedTables / mockTableSummary.totalTables) * 100)}% of total tables
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            }
          }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <EventSeatIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6" component="div">
                  Total Capacity
                </Typography>
              </Stack>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {mockTableSummary.totalCapacity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seats across all tables
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables List */}
      <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          All Tables
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <TablesList />
      </Paper>
    </Box>
  );
}

export default Tables;
