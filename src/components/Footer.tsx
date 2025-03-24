import React from 'react';
import { 
  Box, 
  Typography, 
  Link, 
  Container 
} from '@mui/material';
import InSeatLogo from '../assets/InSeatLogo';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => 
          theme.palette.mode === 'light' 
            ? theme.palette.grey[200] 
            : theme.palette.grey[800],
        textAlign: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <InSeatLogo width={40} height={40} />
        </Box>
        
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} InSeat. All Rights Reserved.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Built with ❤️ by{' '}
          <Link 
            href="https://achievengine.com" 
            target="_blank" 
            rel="noopener noreferrer"
            color="primary"
          >
            Achievengine
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
