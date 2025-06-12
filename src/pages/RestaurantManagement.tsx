import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

const RestaurantManagement: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <RestaurantIcon sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Restaurant Management
        </Typography>
      </Box>
      
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            Restaurant Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage restaurants, locations, and dining areas.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RestaurantManagement; 