import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MenusByRestaurant = () => {
  const [menus, setMenus] = React.useState([
    { id: 1, restaurant: 'Pizza Place', menu: 'Lunch Menu' },
    { id: 2, restaurant: 'Burger Joint', menu: 'Dinner Menu' },
  ]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Menus by Restaurant
      </Typography>
      {menus.map((menu) => (
        <Paper key={menu.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">{menu.restaurant}</Typography>
          <Typography>{menu.menu}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default MenusByRestaurant;
