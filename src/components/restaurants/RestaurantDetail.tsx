import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Grid,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  CircularProgress,
  Alert,
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
import { restaurantService } from '../../services/RestaurantService';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import leaflet marker assets (Vite-compatible way)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default icon issue in Leaflet (Vite-compatible)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
  schedule: any[];
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface RestaurantData {
  _id: string;
  name: string;
  locations?: Location[];
  venues?: any[];
  tables?: any[];
  menu?: MenuCategory[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Simple Restaurant Map Component
const RestaurantLocationMap: React.FC<{ location: Location }> = ({ location }: { location: Location }) => {
  const { coordinates } = location;
  const position: [number, number] = [coordinates.latitude, coordinates.longitude];

  return (
    <Box sx={{ mt: 2, height: '300px', borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          url="https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=h35MxsAmF0Laz2IYnp6j"
          attribution='<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>'
          tileSize={512}
          zoomOffset={-1}
        />
        <Marker position={position} />
      </MapContainer>
    </Box>
  );
};

const RestaurantDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = React.useState<RestaurantData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);

  
  React.useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    if (!id) {
      setError('Restaurant ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const restaurantData = await restaurantService.getRestaurantById(id);
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      setError('Failed to fetch restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsClick = (): void => {
    if (restaurant) {
      navigate(`/restaurants/add/${restaurant._id}`);
    }
  };

  const handleCategoryClick = (category: string): void => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!restaurant) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Restaurant not found
      </Alert>
    );
  }

  // Use actual restaurant data
  const data = restaurant;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            {data.name}
          </Typography>
          {/* <Box>
            <Chip
              label={data.isActive ? 'Active' : 'Inactive'}
              color={data.isActive ? 'success' : 'error'}
              size="small"
              sx={{ mr: 2 }}
            />
            <IconButton onClick={handleSettingsClick} color="primary">
              <SettingsIcon />
            </IconButton>
          </Box> */}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Overview Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Restaurant Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Restaurant Info
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOn color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.locations && data.locations.length > 0 
                      ? data.locations[0].address 
                      : 'No address available'}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Store color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.venues?.length || 0} Venues
                  </Typography>
                </Box>

                {/* <Box display="flex" alignItems="center" mb={2}>
                  <TableRestaurant color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.tables?.length || 0} Tables
                  </Typography>
                </Box> */}

                {/* <Box display="flex" alignItems="center" mb={2}>
                  <MenuIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {data.menu?.length || 0} Menu Categories
                  </Typography>
                </Box> */}
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
                    Created: {data.createdAt 
                      ? new Date(data.createdAt).toLocaleDateString()
                      : 'Not available'}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center">
                  <AccessTime color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Last Updated: {data.updatedAt 
                      ? new Date(data.updatedAt).toLocaleDateString()
                      : 'Not available'}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Location Section with Map */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Restaurant Location
          </Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <LocationOn color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
                {data.locations && data.locations.length > 0
                  ? data.locations[0].address
                  : 'No address available'}
              </Typography>
              
              {data.locations && data.locations.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Coordinates:
                  </Typography>
                  <Typography variant="body2">
                    Latitude: {data.locations[0].coordinates.latitude.toFixed(6)}
                  </Typography>
                  <Typography variant="body2">
                    Longitude: {data.locations[0].coordinates.longitude.toFixed(6)}
                  </Typography>
                </Box>
              )}

              {/* Display the map with actual restaurant coordinates */}
              {data.locations && data.locations.length > 0 && data.locations[0].coordinates ? (
                <RestaurantLocationMap location={data.locations[0]} />
              ) : (
                <Box sx={{ 
                  height: '300px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'grey.100',
                  borderRadius: 1
                }}>
                  <Typography variant="body2" color="textSecondary">
                    No location coordinates available for this restaurant
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Menu Section */}
        {/* <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Menu Items
          </Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            {data.menu && data.menu.length > 0 ? (
              <List>
                {data.menu.map((category: MenuCategory) => (
                  <React.Fragment key={category.category}>
                    <ListItem 
                      button 
                      onClick={() => handleCategoryClick(category.category)}
                      sx={{ 
                        borderRadius: 1, 
                        mb: 1,
                        backgroundColor: expandedCategory === category.category ? 'action.hover' : 'transparent'
                      }}
                    >
                      <ListItemIcon>
                        <Restaurant />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="h6">
                            {category.category}
                          </Typography>
                        }
                        secondary={`${category.items.length} items`}
                      />
                      {expandedCategory === category.category ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={expandedCategory === category.category} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ ml: 2, mb: 2 }}>
                        {category.items.map((item: MenuItem) => (
                          <ListItem 
                            key={item.name} 
                            sx={{ 
                              pl: 4, 
                              py: 1,
                              borderLeft: '2px solid',
                              borderLeftColor: 'primary.main',
                              ml: 1,
                              backgroundColor: 'background.paper',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <ListItemIcon>
                              <AttachMoney color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body1" fontWeight="medium">
                                    {item.name}
                                  </Typography>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body1" fontWeight="bold" color="success.main">
                                      ${item.price.toFixed(2)}
                                    </Typography>
                                    <Chip 
                                      size="small" 
                                      label={item.isAvailable ? 'Available' : 'Unavailable'}
                                      color={item.isAvailable ? 'success' : 'error'}
                                      variant="outlined"
                                    />
                                  </Box>
                                </Box>
                              } 
                              secondary={
                                <Box>
                                  {item.description && (
                                    <Typography variant="body2" color="textSecondary">
                                      {item.description}
                                    </Typography>
                                  )}
                                  {item.modifiers && item.modifiers.length > 0 && (
                                    <Typography variant="caption" color="textSecondary">
                                      {item.modifiers.length} modifier(s) available
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <MenuIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No Menu Items Available
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Menu items will appear here once they are added to this restaurant.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box> */}
      </CardContent>
    </Card>
  );
};

export default RestaurantDetail;