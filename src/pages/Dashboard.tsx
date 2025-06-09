import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <DashboardIcon sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Welcome to INSEAT Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your business operations from this central dashboard.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access frequently used features and tools.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                System Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All systems operational.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 