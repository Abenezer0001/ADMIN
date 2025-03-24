import React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Grid, Paper, Typography, Card, CardContent, CardActions, IconButton } from '@mui/material';
import { Assessment as AssessmentIcon, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from '@mui/icons-material';

const Analytics = () => {
  const data = [
    { name: 'Restaurants', value: 40, icon: <AssessmentIcon />, trend: <TrendingUpIcon /> },
    { name: 'Orders', value: 30, icon: <TrendingUpIcon />, trend: <TrendingDownIcon /> },
    { name: 'Customers', value: 30, icon: <AssessmentIcon />, trend: <TrendingUpIcon /> },
  ];

  const StyledCard = styled(Card)<{ color: string }>`
    background-color: ${({ color }) => color};
    color: white;
  `;

  return (
    <Box sx={{ width: '100%', padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Grid container spacing={2} sx={{ marginTop: '20px' }}>
        {data.map((entry) => (
          <Grid item xs={12} sm={6} md={4} key={entry.name}>
            <StyledCard color={`#${entry.name === 'Restaurants' ? '4DAF7C' : entry.name === 'Orders' ? 'FFC107' : '4DAF7C'}`}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {entry.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {entry.value}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton aria-label="trend">
                  {entry.trend}
                </IconButton>
                <IconButton aria-label="assessment">
                  {entry.icon}
                </IconButton>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Analytics;
