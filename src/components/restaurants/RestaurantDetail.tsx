import React, { useState } from 'react';
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
  Collapse,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  LocationOn,
  Store,
  TableRestaurant,
  AccessTime,
  Menu as MenuIcon,
  ExpandMore,
  ExpandLess,
  Restaurant,
  AttachMoney,
} from '@mui/icons-material';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Location {
  address: string;
  coordinates: Coordinates;
}

interface Modifier {
  name: string;
  options: string[];
  price: number;
}

interface MenuItem {
  name: string;
  description?: string;
  price: number;
  modifiers: Modifier[];
  isAvailable: boolean;
  schedule: any[]; // Using any for simplicity
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface RestaurantDetailProps {
  restaurant: {
    id: string;
    name: string;
    locations?: Location[];
    venues?: any[];
    tables?: any[];
    menu?: MenuCategory[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
}

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
      id={`restaurant-tabpanel-${index}`}
      aria-labelledby={`restaurant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ restaurant }) => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingsClick = () => {
    navigate(`/restaurants/${restaurant.id}`);
  };

  const handleCategoryClick = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const dummyData = {
    locations: [{ 
      address: '123 Main St, New York, NY 10001', 
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    }],
    venues: [],
    tables: [],
    menu: [
      {
        category: 'Appetizers',
        items: [
          {
            name: 'Bruschetta',
            description: 'Toasted bread topped with tomatoes, garlic, and basil',
            price: 9.99,
            modifiers: [],
            isAvailable: true,
            schedule: []
          },
          {
            name: 'Calamari',
            description: 'Fried squid served with marinara sauce',
            price: 12.99,
            modifiers: [],
            isAvailable: true,
            schedule: []
          }
        ]
      },
      {
        category: 'Main Courses',
        items: [
          {
            name: 'Spaghetti Carbonara',
            description: 'Classic Italian pasta with eggs, cheese, pancetta, and black pepper',
            price: 16.99,
            modifiers: [],
            isAvailable: true,
            schedule: []
          }
        ]
      }
    ],
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-06-15T00:00:00.000Z',
  };

  const data = { ...dummyData, ...restaurant };

  // Get the first location's coordinates for the map
  const mapLocation = data.locations && data.locations.length > 0 
    ? data.locations[0].coordinates 
    : { latitude: 40.7128, longitude: -74.0060 }; // Default to NYC coordinates

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
          <Tab label="Overview" id="restaurant-tab-0" aria-controls="restaurant-tabpanel-0" />
          <Tab label="Menu" id="restaurant-tab-1" aria-controls="restaurant-tabpanel-1" />
          <Tab label="Location" id="restaurant-tab-2" aria-controls="restaurant-tabpanel-2" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Restaurant Info
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOn color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.locations[0]?.address || 'No address available'}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Store color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.venues?.length || 0} Venues
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <TableRestaurant color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.tables?.length || 0} Tables
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <MenuIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.menu?.length || 0} Menu Categories
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Administration
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccessTime color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Created: {new Date(data.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center">
                  <AccessTime color="action" sx={{ mr: 1 }} />
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
              Menu Items
            </Typography>
            {data.menu && data.menu.length > 0 ? (
              <List>
                {data.menu.map((category) => (
                  <React.Fragment key={category.category}>
                    <ListItem button onClick={() => handleCategoryClick(category.category)}>
                      <ListItemIcon>
                        <Restaurant />
                      </ListItemIcon>
                      <ListItemText primary={category.category} />
                      {expandedCategory === category.category ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={expandedCategory === category.category} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {category.items.map((item) => (
                          <ListItem key={item.name} sx={{ pl: 4 }}>
                            <ListItemIcon>
                              <AttachMoney />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Box display="flex" justifyContent="space-between">
                                  <Typography variant="body1">{item.name}</Typography>
                                  <Typography variant="body1">${item.price.toFixed(2)}</Typography>
                                </Box>
                              } 
                              secondary={item.description}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1">No menu items available</Typography>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Restaurant Location
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <LocationOn color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
                {data.locations[0]?.address || 'No address available'}
              </Typography>
              
              {/* Restaurant Map */}
              <Box 
                sx={{ 
                  position: 'relative',
                  height: '400px', 
                  width: '100%', 
                  backgroundColor: '#e5e3df',
                  overflow: 'hidden',
                  borderRadius: 1
                }}
              >
                {/* Simple Map Representation */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LocationOn 
                      color="error" 
                      sx={{ 
                        fontSize: 40, 
                        animation: 'bounce 1s infinite alternate',
                        '@keyframes bounce': {
                          from: { transform: 'translateY(0)' },
                          to: { transform: 'translateY(-10px)' }
                        }
                      }} 
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Latitude: {mapLocation.latitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2">
                      Longitude: {mapLocation.longitude.toFixed(6)}
                    </Typography>
                  </Box>
                </Box>
                {/* Simulated Map Background */}
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#ccc" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </Box>
              
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                Note: This is a simulated map. In a production environment, integrate with a mapping API like Google Maps or Mapbox.
              </Typography>
            </Box>
          </Paper>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default RestaurantDetail;