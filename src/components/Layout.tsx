import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  useTheme, 
  alpha, 
  styled,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Tooltip,
  IconButton,
  Avatar,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  InputBase,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Apps as AppsIcon,
  Language as LanguageIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Check as CheckIcon,
  Translate as TranslateIcon,
  Power as PowerIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  Restaurant as MenuIcon2,
  Settings as SettingsIcon,
  MenuBook as MenuBookIcon,
  Edit as EditIcon,
  Category as CategoryIcon,
  AccountTree as AccountTreeIcon,
  SubdirectoryArrowRight as SubdirectoryArrowRightIcon,
  RestaurantMenu as RestaurantMenuIcon,
  History as HistoryIcon,
  AccountCircle as AccountCircleIcon,
  Tune as TuneIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  Search as SearchIcon,
  NotificationsActive as NotificationsActiveIcon,
  Sync as SyncIcon,
  Insights as InsightsIcon,
  Receipt as ReceiptIcon,
  VpnKey as KeyIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../context/AuthContext';
import LogoutButton from './common/LogoutButton';

const drawerWidth = 290;
const collapsedDrawerWidth = 80;

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.default, 0.1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.default, 0.2),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  '& .MuiSvgIcon-root': {
    fontSize: '1.8rem',
  },
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'collapsed' })<{
  open?: boolean;
  collapsed?: boolean;
}>(({ theme, open, collapsed }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
  ...(collapsed && {
    marginLeft: `${collapsedDrawerWidth}px`,
  }),
  backgroundColor: theme.palette.mode === 'dark' ? '#111827' : '#F5F7FA',
  minHeight: '100vh',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
}));

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'collapsed' })<{
  open?: boolean;
  collapsed?: boolean;
}>(({ theme, open, collapsed }) => ({
  height: '90px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f0f4f8',
  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  ...(collapsed && {
    width: `calc(100% - ${collapsedDrawerWidth}px)`,
    marginLeft: `${collapsedDrawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
  height: '70px'
}));

interface LayoutProps {
  children: React.ReactNode;
  toggleTheme: () => void;
  themeMode: 'light' | 'dark';
}

interface MenuItemType { // Renamed to avoid conflict with MUI MenuItem
  key: string;
  icon: React.ReactElement;
  label: string;
  children?: MenuItemType[]; // Use renamed type
  path?: string;
}

interface CategoryType { // Renamed to avoid conflict
  category: string;
  items: MenuItemType[]; // Use renamed type
}

const Layout: React.FC<LayoutProps> = ({ children, toggleTheme, themeMode }) => {
  const [open, setOpen] = React.useState(true);
  const [collapsed, setCollapsed] = React.useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [expandedMenus, setExpandedMenus] = React.useState<{ [key: string]: boolean }>({});
  const [notifications, setNotifications] = React.useState<Array<{id: string, message: string, read: boolean, date: Date}>>([{id: '1', message: 'New order received', read: false, date: new Date()}]);
  const [language, setLanguage] = React.useState('en');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState<null | HTMLElement>(null);
  const [appsAnchorEl, setAppsAnchorEl] = React.useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleDrawerToggle = () => {
    if (open) {
      setOpen(false);
      setCollapsed(true);
    } else {
      setOpen(true);
      setCollapsed(false);
    }
  };

  const handleMenuClick = (item: MenuItemType) => { // Use renamed type
    if (collapsed) {
      setOpen(true);
      setCollapsed(false);
    }

    if (item.children) {
      setExpandedMenus((prev: { [key: string]: boolean }) => ({ ...prev, [item.key]: !prev[item.key] })); // Add type for prev
    } else {
      navigate(item.path || '/' + item.key);
    }
  };

  const handleLogout = () => {
    setMenuAnchorEl(null);
    logout();
  };

  // Notification handlers
  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    // Mark notifications as read when opening the menu
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  // Language handlers
  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    handleLanguageClose();
  };

  // Apps menu handlers
  const handleAppsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAppsAnchorEl(event.currentTarget);
  };

  const handleAppsClose = () => {
    setAppsAnchorEl(null);
  };

  const categories: CategoryType[] = [ // Use renamed type
    {
      category: 'Overview',
      items: [
        {
          key: 'dashboard',
          icon: <DashboardIcon sx={{ fontSize: 24 }} />,
          label: 'Dashboard',
        },
        {
          key: 'analytics',
          icon: <InsightsIcon sx={{ fontSize: 24 }} />,
          label: 'Analytics',
          children: [
            {
              key: 'analytics/menu-report',
              icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
              label: 'Menu Report',
            },
            {
              key: 'analytics/order-performance',
              icon: <BarChartIcon sx={{ fontSize: 24 }} />,
              label: 'Order Performance',
            },
            {
              key: 'analytics/customer-insight',
              icon: <PeopleIcon sx={{ fontSize: 24 }} />,
              label: 'Customer Insight',
            },
          ],
        },
        {
          key: 'sales',
          icon: <ReceiptIcon sx={{ fontSize: 24 }} />,
          label: 'Sales',
        },
      ],
    },
    {
      category: 'Restaurant Management',
      items: [
        {
          key: 'restaurants/list',
          icon: <RestaurantIcon sx={{ fontSize: 24 }} />,
          label: 'Restaurants',
        },
        {
          key: 'tables/list',
          icon: <OrdersIcon sx={{ fontSize: 24 }} />,
          label: 'Tables',
        },
        // {
        //   key: 'zones/list',
        //   icon: <CategoryIcon sx={{ fontSize: 24 }} />,
        //   label: 'Zones',
        // },
        
        {
          key: 'venues/list',
          icon: <CategoryIcon sx={{ fontSize: 24 }} />,
          label: 'Venues',
        },
        
        {
          key: 'menu',
          icon: <MenuIcon2 sx={{ fontSize: 24 }} />,
          label: 'Menu & Categories',
          children: [
            {
              key: 'menu/items',
              icon: <MenuBookIcon sx={{ fontSize: 24 }} />,
              label: 'Menu Items',
            },
            {
              key: 'modifiers',
              icon: <TuneIcon sx={{ fontSize: 24 }} />,
              label: 'Modifiers',
              path: '/menu/modifiers'
            },
            {
              key: 'categories',
              icon: <CategoryIcon sx={{ fontSize: 24 }} />,
              label: 'Categories',
              path: '/categories'
            },
             { // Added SubCategory Link
              key: 'subcategories/list',
              icon: <AccountTreeIcon sx={{ fontSize: 24 }} />, // Better hierarchy representation
              label: 'Sub-Categories',
               path: '/subcategories/list'
            },
            { // Added SubSubCategory Link
              key: 'subsubcategories/list',
              icon: <SubdirectoryArrowRightIcon sx={{ fontSize: 24 }} />, // Shows deeper hierarchy
              label: 'Sub-Subcategories',
              path: '/subsubcategories/list'
            },
             { // Added Menus Link
               key: 'menus/list',
               icon: <RestaurantMenuIcon sx={{ fontSize: 24 }} />,
              label: 'Menus',
              path: '/menus/list'
            },
          ],
        },
      ],
    },
    {
      category: 'Order Management',
      items: [
        {
          key: 'orders',
          icon: <OrdersIcon sx={{ fontSize: 24 }} />,
          label: 'Orders',
          children: [
            {
              key: 'orders/live',
              icon: <SyncIcon sx={{ fontSize: 24 }} />,
              label: 'Live Orders',
            },
            {
              key: 'orders/history',
              icon: <HistoryIcon sx={{ fontSize: 24 }} />,
              label: 'Order History',
            },
          ],
        },
        {
          key: 'invoices',
          icon: <DescriptionIcon sx={{ fontSize: 24 }} />,
          label: 'Invoices',
        },
        {
          key: 'inventory',
          icon: <InventoryIcon sx={{ fontSize: 24 }} />,
          label: 'Inventory Management',
        },
        {
          key: 'customers',
          icon: <PeopleIcon sx={{ fontSize: 24 }} />,
          label: 'Customers',
        },
      ],
    },
    {
      category: 'Settings & Administration',
      items: [
        {
          key: 'settings/admins',
          icon: <PeopleIcon sx={{ fontSize: 24 }} />,
          label: 'Administrator Management',
        },
        {
          key: 'settings/rbac',
          icon: <SecurityIcon sx={{ fontSize: 24 }} />,
          label: 'Access Control',
        },
        {
          key: 'settings/system',
          icon: <SettingsIcon sx={{ fontSize: 24 }} />,
          label: 'System Settings',
        },
        // {
        //   key: 'settings/access-control',
        //   icon: <KeyIcon sx={{ fontSize: 24 }} />,
        //   label: 'Access Control',
        // },
        {
          key: 'settings/integration',
          icon: <PowerIcon sx={{ fontSize: 24 }} />,
          label: 'Integration',
        },
        {
          key: 'settings/notifications',
          icon: <NotificationsActiveIcon sx={{ fontSize: 24 }} />,
          label: 'Notifications',
        },
      ],
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBarStyled position="fixed" open={open} collapsed={collapsed}>
        <Toolbar sx={{ 
          minHeight: '70px !important', 
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          pt: 0
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2
          }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
         
          </Box>

          <Search sx={{ 
            maxWidth: '400px',
            mx: 2,
            my: 2,
            bgcolor: theme.palette.mode === 'light' ? 'background.paper' : 'background.default',
            boxShadow: theme.shadows[1],
            borderRadius: '8px'
          }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            {/* Theme Toggle */}
            <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton onClick={toggleTheme} color="inherit">
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Notifications Button */}
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit"
                onClick={handleNotificationClick}
              >
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Apps Menu Button */}
            <Tooltip title="Apps">
              <IconButton 
                color="inherit"
                onClick={handleAppsClick}
              >
                <AppsIcon />
              </IconButton>
            </Tooltip>

            {/* Language Selector */}
            <Tooltip title="Change language">
              <IconButton 
                color="inherit"
                onClick={handleLanguageClick}
              >
                <LanguageIcon />
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Tooltip title="Account">
              <IconButton
                onClick={(e: React.MouseEvent<HTMLElement>) => setMenuAnchorEl(e.currentTarget)}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBarStyled>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 320,
            maxHeight: 400,
            overflowY: 'auto',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem key={notification.id} onClick={handleNotificationClose}>
              <ListItemIcon>
                <NotificationsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={notification.message} 
                secondary={new Date(notification.date).toLocaleString()}
                primaryTypographyProps={{
                  color: notification.read ? 'textSecondary' : 'textPrimary',
                  fontWeight: notification.read ? 'normal' : 'bold'
                }}
              />
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        )}
      </Menu>

      {/* Language Menu */}
      <Menu
        anchorEl={languageAnchorEl}
        open={Boolean(languageAnchorEl)}
        onClose={handleLanguageClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 120,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        }}
      >
        {[
          { code: 'en', name: 'English' },
          { code: 'am', name: 'አማርኛ' },
          { code: 'or', name: 'Oromiffa' },
        ].map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => handleLanguageSelect(lang.code)}
            selected={language === lang.code}
          >
            <ListItemText>{lang.name}</ListItemText>
            {language === lang.code && (
              <CheckIcon fontSize="small" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))}
      </Menu>

      {/* Apps Menu */}
      <Menu
        anchorEl={appsAnchorEl}
        open={Boolean(appsAnchorEl)}
        onClose={handleAppsClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Apps
          </Typography>
        </Box>
        <MenuItem onClick={handleAppsClose}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dashboard</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAppsClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAppsClose}>
          <ListItemIcon>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Users</ListItemText>
        </MenuItem>
      </Menu>

      <Drawer
        sx={{
          width: open ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : collapsedDrawerWidth,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : (collapsed ? '#F5F7FA' : '#ffffff'),
            borderRight: '1px solid',
            borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiListItemButton-root': {
              borderRadius: '8px',
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'unset',
              position: 'relative',
              pr: open ? 3 : 1,
              pl: open ? 1 : 1.5,
              justifyContent: open ? 'flex-start' : 'center',
              '& .MuiListItemIcon-root': {
                minWidth: open ? 40 : 0,
                color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                mr: open ? 2 : 0,
              },
              '&.Mui-selected': {
                backgroundColor: '#255ee3',
                '&:hover': {
                  backgroundColor: '#255ee3',
                },
                '& .MuiListItemIcon-root': {
                  color: '#ffffff',
                },
                '& .MuiListItemText-primary': {
                  color: '#ffffff',
                  fontWeight: 500,
                },
              },
            },
            '& .MuiListItemText-primary': {
              color: theme.palette.mode === 'dark' ? '#e2e8f0' : '#1e293b',
              opacity: open ? 1 : 0,
              transition: theme.transitions.create(['opacity'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
            '& .MuiCollapse-root .MuiListItemButton-root': {
              pl: open ? 4 : 1.5,
              '&.Mui-selected': {
                backgroundColor: '#255ee3',
              },
            },
            '& .category-title': {
              opacity: open ? 1 : 0,
              height: open ? 'auto' : 0,
              marginBottom: open ? 1 : 0,
              transition: theme.transitions.create(['opacity', 'height', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
            '& .arrow-icon': {
              opacity: open ? 1 : 0,
              transition: theme.transitions.create(['opacity'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              position: 'absolute',
              right: 8,
            },
            position: 'fixed',
            height: '100%',
            zIndex: 1200
          },
        }}
        variant="permanent"
        open={open}
      >
        <DrawerHeader>
          {open ? (
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'var(--font-inseat-logo)', 
                color: theme.palette.mode === 'light' ? '#101825' : '#fefefe', 
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'linear-gradient(45deg, #255ee3 30%, #3b82f6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                pl: 2,
                flexGrow: 1,
              }}>
              INSEAT
            </Typography>
          ) : (
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'var(--font-inseat-logo)', 
                color: theme.palette.mode === 'light' ? '#101825' : '#fefefe', 
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: 'linear-gradient(45deg, #255ee3 30%, #3b82f6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                flexGrow: 1,
              }}>
              IN
            </Typography>
          )}
        </DrawerHeader>
        <Divider />
        <List component="nav" sx={{ px: 1, py: 2 }}>
          {categories.map((category, index) => (
            <React.Fragment key={category.category}>
              <Typography variant="h6" className="category-title" sx={{ 
                fontFamily: 'var(--font-inseat-logo)', 
                color: theme.palette.mode === 'light' ? '#64748B' : '#94a3b8', 
                fontWeight: 'bold',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                pl: 2,
                mb: open ? 1 : 0,
                mt: 2,
              }}>
                {category.category}
              </Typography>
              {category.items.map((item, itemIndex) => (
                <React.Fragment key={item.key}>
                  <Tooltip key={`tooltip-${item.key}-${itemIndex}`} title={!open ? item.label : ""} placement="right" arrow>
                    <ListItemButton
                      key={`item-${item.key}-${itemIndex}`}
                      onClick={() => handleMenuClick(item)}
                      selected={location.pathname === (item.path || '/' + item.key) || 
                              (item.children && item.children.some(child => location.pathname === (child.path || '/' + child.key)))}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: open ? 2.5 : 1,
                      }}
                    >
                      <StyledListItemIcon>
                        {item.icon}
                      </StyledListItemIcon>
                      <ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
                      {item.children && (
                        <Box className="arrow-icon">
                          {expandedMenus[item.key] ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                      )}
                    </ListItemButton>
                  </Tooltip>
                  {item.children && (
                    <Collapse in={open && expandedMenus[item.key]} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.children.map((child, childIndex) => (
                          <Tooltip key={`tooltip-${child.key}-${childIndex}`} title={!open ? child.label : ""} placement="right" arrow>
                            <ListItemButton
                              key={`item-${child.key}-${childIndex}`}
                              onClick={() => handleMenuClick(child)}
                              selected={location.pathname === (child.path || '/' + child.key)}
                              sx={{
                                minHeight: 40,
                                justifyContent: open ? 'initial' : 'center',
                                px: open ? 2.5 : 1,
                                pl: open ? 4 : 1,
                              }}
                            >
                              <StyledListItemIcon>
                                {child.icon}
                              </StyledListItemIcon>
                              <ListItemText primary={child.label} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                          </Tooltip>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Main open={open} collapsed={collapsed}>
        <DrawerHeader />
        {children}
      </Main>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 180,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          },
        }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;
