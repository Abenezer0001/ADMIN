import React, { useState } from 'react';
import { Alert, Button, Paper, Typography, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

const DemoNotification: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  // If user dismissed the notification, don't show it
  if (dismissed) {
    return null;
  }

  return (
    <Paper 
      elevation={0}
      sx={{
        p: 2, 
        mb: 2, 
        backgroundColor: '#f8f4e5', 
        border: '1px solid #e6dcc1',
        borderRadius: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <InfoIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            INSEAT Demo Mode
          </Typography>
          
          <Typography variant="body2" paragraph>
            You are currently experiencing a demo version of INSEAT. This environment allows you to explore the platform's features with pre-populated data. Any changes you make will not affect real data and will be reset periodically.
          </Typography>
          
          <Typography variant="body2">
            Feel free to test all functionality, including order management, menu editing, and staff settings.
          </Typography>
        </Box>
        
        <Button 
          size="small" 
          sx={{ minWidth: 'auto', p: 0.5 }}
          onClick={() => setDismissed(true)}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </Box>
    </Paper>
  );
};

export default DemoNotification; 