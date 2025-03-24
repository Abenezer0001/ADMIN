import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  TableRestaurant,
  Store,
  LocationOn,
  MeetingRoom,
  Event,
} from '@mui/icons-material';

interface ZoneDetailProps {
  zone: {
    id: string;
    name: string;
    description?: string;
    venueId: string;
    venueName?: string;
    capacity: number;
    isActive: boolean;
    tables: any[];
    createdAt?: string;
    updatedAt?: string;
  };
}

interface TabPanelProps {
  children?: any;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`zone-tabpanel-${index}`}
      aria-labelledby={`zone-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ZoneDetail = ({ zone }: ZoneDetailProps) => {
  const navigate = useNavigate();
  // @ts-ignore
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingsClick = () => {
    navigate(`/zones/${zone.id}`);
  };

  const dummyData = {
    venueName: 'Main Restaurant',
    tables: [
      { id: 'table1', name: 'Table 1', capacity: 4 },
      { id: 'table2', name: 'Table 2', capacity: 2 },
      { id: 'table3', name: 'Table 3', capacity: 6 },
    ],
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-06-15T00:00:00.000Z',
  };

  const data = { ...dummyData, ...zone };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            {data.name}
          </Typography>
          <Box>
            <Chip
              label={data.isActive ? 'Active' : 'Inactive'}
              color={data.isActive ? 'success' : 'error'}
              size="small"
              sx={{ mr: 2 }}
            />
            <IconButton onClick={handleSettingsClick} color="primary">
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Overview" id="zone-tab-0" aria-controls="zone-tabpanel-0" />
          <Tab label="Tables" id="zone-tab-1" aria-controls="zone-tabpanel-1" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Zone Info
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Store color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Venue: {data.venueName || 'No venue assigned'}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <MeetingRoom color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    Capacity: {data.capacity} people
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <TableRestaurant color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.tables?.length || 0} Tables
                  </Typography>
                </Box>

                {data.description && (
                  <Box mt={3}>
                    <Typography variant="subtitle1" gutterBottom>
                      Description:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {data.description}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Administration
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <Event color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Created: {new Date(data.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center">
                  <Event color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Last Updated: {new Date(data.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tables in this Zone
            </Typography>
            {data.tables && data.tables.length > 0 ? (
              <List>
                {data.tables.map((table: any) => (
                  <ListItem key={table.id} divider>
                    <ListItemIcon>
                      <TableRestaurant />
                    </ListItemIcon>
                    <ListItemText
                      primary={table.name}
                      secondary={`Capacity: ${table.capacity} people`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1">No tables assigned to this zone</Typography>
            )}
          </Paper>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default ZoneDetail;