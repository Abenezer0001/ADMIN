import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { API_BASE_URL } from '../../utils/config';
import { venueService } from '../../services/VenueService';
import ZoneList from '../zones/ZoneList';

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
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface Venue {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  isActive: boolean;
  restaurantId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

const VenueDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      setLoading(true);
      if (!id) {
        throw new Error('Venue ID is required');
      }
      const venueData = await venueService.getVenue(id);
      setVenue(venueData);
    } catch (error) {
      console.error('Error fetching venue details:', error);
      setError('Failed to fetch venue details');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !venue) {
    return (
      <Box p={3}>
        <Typography color="error">{error || 'Venue not found'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4">Venue Details</Typography>
      </Box>

      <Paper>
        <Box>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Details" />
            <Tab label="Zones" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">{venue.name}</Typography>
                  <Chip 
                    label={venue.isActive ? 'Active' : 'Inactive'} 
                    color={venue.isActive ? 'success' : 'default'}
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textSecondary">Description</Typography>
                <Typography>{venue.description}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Capacity</Typography>
                <Typography>{venue.capacity} people</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Restaurant</Typography>
                <Typography>{venue.restaurantId?.name || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Created At</Typography>
                <Typography>{new Date(venue.createdAt).toLocaleDateString()}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Last Updated</Typography>
                <Typography>{new Date(venue.updatedAt).toLocaleDateString()}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/venues/add/${venue._id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/venues/list')}
                  >
                    Back to List
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box mb={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/zones/add/${venue._id}`)}
              >
                Add New Zone
              </Button>
            </Box>
            <ZoneList venueId={venue._id} />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default VenueDetail;