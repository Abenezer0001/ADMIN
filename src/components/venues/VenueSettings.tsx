import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  Alert
} from '@mui/material';
import { venueService } from '../../services/VenueService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`venue-settings-tabpanel-${index}`}
      aria-labelledby={`venue-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `venue-settings-tab-${index}`,
    'aria-controls': `venue-settings-tabpanel-${index}`,
  };
}

const VenueSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        setLoading(true);
        const data = await venueService.getVenue(id || '');
        setVenue(data);
      } catch (err) {
        console.error('Error fetching venue:', err);
        setError('Failed to fetch venue details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenue();
    }
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !venue) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Venue not found'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/venues/list')} 
          sx={{ mt: 2 }}
        >
          Back to Venues
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {venue.name} - Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage settings for this venue
        </Typography>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="venue settings tabs"
          >
            <Tab label="General" {...a11yProps(0)} />
            <Tab label="Zones" {...a11yProps(1)} />
            <Tab label="Tables" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">Venue Information</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {venue.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Description:</strong> {venue.description || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Capacity:</strong> {venue.capacity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {venue.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(`/venues/add/${id}`)}
                  >
                    Edit Venue
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Zones Management
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Button 
            variant="contained" 
            onClick={() => navigate(`/zones/add/${id}`)}
            sx={{ mb: 2 }}
          >
            Add New Zone
          </Button>
          <Typography>
            Manage zones for this venue through the Zones section.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Tables Management
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Button 
            variant="contained" 
            onClick={() => navigate(`/tables/new`)}
            sx={{ mb: 2 }}
          >
            Add New Table
          </Button>
          <Typography>
            Manage tables for this venue through the Tables section.
          </Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default VenueSettings;
