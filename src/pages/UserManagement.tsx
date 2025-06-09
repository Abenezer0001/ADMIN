import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';

const UserManagement: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PeopleIcon sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
      </Box>
      
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users, roles, and permissions across the system.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserManagement; 