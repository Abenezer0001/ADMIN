import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/config';
import {
  Box, Typography, Paper, Grid, Chip, Button, IconButton, CircularProgress, List, ListItem, ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import CategoryIcon from '@mui/icons-material/Category'; // For sub-subcategory
import ImageIcon from '@mui/icons-material/Image';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // For prep time
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // For allergens
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'; // For nutritional info

// Define the MenuItem type (ensure this matches your actual backend model)
interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  preparationTime?: number;
  isAvailable: boolean;
  isActive: boolean; // Consider if needed for display logic, not shown directly per refactor goal
  allergens?: string[];
  nutritionalInfo?: Record<string, string | number>;
  subSubCategory?: { _id: string; name: string }; // Assuming populated
  restaurantId: string;
  createdAt: string; // Assuming string from backend
  updatedAt: string; // Assuming string from backend
  // Add any other fields
}

const MenuItemDetail: React.FC = () => {
  const { id: menuItemId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!menuItemId) {
        setError("Menu Item ID not found in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching menu item with ID: ${menuItemId}`);
        // Adjust URL as needed
        const response = await axios.get<MenuItem>(`${API_BASE_URL}/menu-items/${menuItemId}`);
        console.log("API Response Data:", response.data);
        setMenuItem(response.data);
      } catch (err) {
        console.error("Error fetching menu item:", err);
        let message = 'An unknown error occurred';
        // Using property checks as a workaround for persistent Axios type errors
        if (typeof err === 'object' && err !== null) {
            const errorObj = err as any; // Use 'any' carefully as a workaround
            if (errorObj.response) {
                // Server responded with a status code outside 2xx range
                message = `Server error: ${errorObj.response.status} ${errorObj.response.statusText || ''}`;
                if (errorObj.response.status === 404) {
                    message = 'Menu item not found.';
                }
                console.error('Error response data:', errorObj.response.data);
                console.error('Error response status:', errorObj.response.status);
                console.error('Error response headers:', errorObj.response.headers);
            } else if (errorObj.request) {
                // Request was made but no response received
                message = 'Could not connect to the server. Please check your network connection.';
                console.error('Error request:', errorObj.request);
            } else if (errorObj.message) {
                 // Standard Error object or Axios setup error
                 message = errorObj.message;
                 console.error('Error message:', errorObj.message);
            } else {
                 message = 'An unknown error occurred.';
            }
        } else {
             message = 'An unexpected error occurred.';
        }
        setError(`Failed to load menu item details: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [menuItemId]);

  // --- Loading State ---
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  // --- Error State ---
  if (error) {
    return (
       <Box sx={{ p: 3 }}>
         <Typography color="error">{error}</Typography>
       </Box>
    );
  }

  // --- Not Found State ---
   if (!menuItem) {
     return (
         <Box sx={{ p: 3 }}>
              <Typography>Menu item not found.</Typography>
         </Box>
     );
   }

  // --- Success State ---
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
          Menu Item Details
        </Typography>
        <Button
          startIcon={<EditIcon />}
          variant="outlined"
          onClick={() => navigate(`/menuitems/edit/${menuItem._id}`)} // Corrected path
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}> {/* Increased spacing */}
          {/* Image Column */}
          <Grid item xs={12} md={4}>
             {menuItem.image ? (
                <Box
                  component="img"
                  src={menuItem.image}
                  alt={menuItem.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: { xs: 250, md: 350 }, // Adjusted height
                    objectFit: 'cover',
                    borderRadius: 2, // Corresponds to theme.shape.borderRadius * 2
                    boxShadow: 3, // Add subtle shadow
                  }}
                />
              ) : (
                 <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: { xs: 200, md: 300 }, bgcolor: 'grey.200', borderRadius: 2 }}>
                    <ImageIcon color="disabled" sx={{ fontSize: 60, mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">No Image</Typography>
                 </Box>
              )}
          </Grid>

          {/* Details Column */}
           <Grid item xs={12} md={8}>
               <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>{menuItem.name}</Typography>
               <Typography variant="h5" color="primary.main" gutterBottom sx={{ fontWeight: 'medium' }}>
                 ${menuItem.price.toFixed(2)}
               </Typography>
               <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                 {menuItem.description || 'No description provided.'}
               </Typography>

               <Grid container spacing={2} sx={{ mb: 3 }}>
                   {menuItem.subSubCategory && (
                       <Grid item xs={12} sm={6}>
                           <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                           <Box sx={{ display: 'flex', alignItems: 'center' }}>
                               <CategoryIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                               <Typography variant="body1">{menuItem.subSubCategory.name}</Typography>
                           </Box>
                       </Grid>
                   )}
                   {menuItem.preparationTime && (
                       <Grid item xs={12} sm={6}>
                           <Typography variant="subtitle2" color="text.secondary">Preparation Time</Typography>
                           <Box sx={{ display: 'flex', alignItems: 'center' }}>
                               <AccessTimeIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                               <Typography variant="body1">{menuItem.preparationTime} min</Typography>
                           </Box>
                       </Grid>
                   )}
                   <Grid item xs={12} sm={6}>
                       <Typography variant="subtitle2" color="text.secondary">Availability</Typography>
                       <Chip
                           icon={<CircleIcon fontSize="small" />}
                           label={menuItem.isAvailable ? 'Available' : 'Unavailable'}
                           color={menuItem.isAvailable ? 'success' : 'default'}
                           size="small"
                           sx={{ mt: 0.5 }}
                       />
                   </Grid>
                   <Grid item xs={12} sm={6}>
                       <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                       <Typography variant="body1">{new Date(menuItem.createdAt).toLocaleString()}</Typography>
                   </Grid>
                   <Grid item xs={12} sm={6}>
                       <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                       <Typography variant="body1">{new Date(menuItem.updatedAt).toLocaleString()}</Typography>
                   </Grid>
               </Grid>

               {/* Dietary Information Section */}
               {(menuItem.allergens && menuItem.allergens.length > 0) || menuItem.nutritionalInfo ? (
                 <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                   <Typography variant="h6" gutterBottom>Dietary Information</Typography>
                   {menuItem.allergens && menuItem.allergens.length > 0 && (
                     <Box sx={{ mb: 2 }}>
                       <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                         <WarningAmberIcon sx={{ mr: 1, color: 'warning.main' }} /> Allergens
                       </Typography>
                       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                         {menuItem.allergens.map((allergen: string) => (
                           <Chip key={allergen} label={allergen} size="small" variant="outlined" color="warning" />
                         ))}
                       </Box>
                     </Box>
                   )}

                   {menuItem.nutritionalInfo && Object.keys(menuItem.nutritionalInfo).length > 0 && (
                     <Box>
                       <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <RestaurantMenuIcon sx={{ mr: 1, color: 'info.main' }} /> Nutritional Info
                       </Typography>
                       <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
                         <List dense disablePadding>
                           {Object.entries(menuItem.nutritionalInfo).map(([key, value]) => (
                             <ListItem key={key} disableGutters sx={{ py: 0.5 }}>
                               <ListItemText
                                 primary={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                 secondary={String(value)}
                                 primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                 secondaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
                                 sx={{ m: 0 }}
                               />
                             </ListItem>
                           ))}
                         </List>
                       </Paper>
                     </Box>
                   )}
                 </Box>
               ) : null}
           </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default MenuItemDetail;