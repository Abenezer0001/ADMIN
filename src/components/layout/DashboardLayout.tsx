import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Restaurant as RestaurantIcon,
  MenuBook as MenuIcon,
  ShoppingCart as OrderIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Businesses', path: '/businesses', icon: <BusinessIcon /> },
  { text: 'Users', path: '/users', icon: <PeopleIcon /> },
  { text: 'RBAC', path: '/rbac', icon: <SecurityIcon /> },
  { text: 'Restaurants', path: '/restaurants', icon: <RestaurantIcon /> },
  { text: 'Menu', path: '/menu', icon: <MenuIcon /> },
  { text: 'Orders', path: '/orders', icon: <OrderIcon /> },
  { text: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px` }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            INSEAT Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            INSEAT
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          marginTop: '64px', // AppBar height
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout; 