import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  Switch,
  Menu,
  MenuItem,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  ChevronRight as ChevronRightIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { mockMenuItemService } from '../../services/mockService';
import { MenuItem as MenuItemType } from '../../types/menuTypes';
import { usePreferences } from '../../context/PreferenceContext';

const MenuItemsList = () => {
  const theme = useTheme();
  const { preferences } = usePreferences();
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const data = await mockMenuItemService.getMenuItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredItems = items.filter(item =>
    item.mainItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item[`mainItemName_${preferences.secondaryLanguage.code}`]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (item: MenuItemType) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      try {
        await mockMenuItemService.deleteMenuItem(selectedItem.id);
        setItems(items.filter(item => item.id !== selectedItem.id));
        setDeleteDialogOpen(false);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleCopyItem = async (item: MenuItemType) => {
    try {
      const newItem = {
        ...item,
        mainItemName: `${item.mainItemName} (Copy)`,
        sku: `${item.sku}-copy`
      };
      await mockMenuItemService.createMenuItem(newItem);
      loadItems();
    } catch (error) {
      console.error('Error copying item:', error);
    }
  };

  const handleToggleAvailability = async (item: MenuItemType) => {
    try {
      const updatedItem = {
        ...item,
        isAvailable: !item.isAvailable
      };
      await mockMenuItemService.updateMenuItem(item.id, updatedItem);
      loadItems();
    } catch (error) {
      console.error('Error updating item availability:', error);
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
      borderRadius: 2,
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Menu Items</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
              }
            }}
          />
          <IconButton color="primary">
            <DownloadIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={handleFilterClick}
            sx={{
              color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              borderColor: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
            }}
          >
            Filter
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/menu/items/new"
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.dark',
              }
            }}
          >
            Add Menu Item
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer sx={{ 
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'background.paper',
        borderRadius: 2,
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>NO</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>IMAGE</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>NAME</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>{preferences.secondaryLanguage.name}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>MODIFIER GROUPS</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>BRAND</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>MENUS</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'bold' }}>ROUTING LABEL</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item, index) => (
              <TableRow 
                key={item.id}
                sx={{ 
                  '&:hover': { 
                    bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'background.default'
                  }
                }}
              >
                <TableCell>#{index + 1}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={item.image || '/placeholder-food.jpg'}
                      alt={item.mainItemName}
                      sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1">{item.mainItemName}</Typography>
                      <Box sx={{ mt: 1 }}>
                        {item.modifierGroups.map(group => (
                          <Chip
                            key={group.id}
                            label={`${group.name} (${group.modifiers.length})`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {item.modifierGroups.length > 0 
                    ? item.modifierGroups[0].name 
                    : 'Add-ons:'}
                </TableCell>
                <TableCell dir={preferences.secondaryLanguage.direction}>
                  {item[`mainItemName_${preferences.secondaryLanguage.code}`]}
                </TableCell>
                <TableCell>Novo Cinema</TableCell>
                <TableCell>Novo Cinemas - Doha</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Switch
                      size="small"
                      checked={item.isAvailable}
                      onChange={() => handleToggleAvailability(item)}
                      sx={{ 
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#4CAF50'
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#4CAF50'
                        }
                      }}
                    />
                    <IconButton 
                      size="small"
                      onClick={() => handleDeleteClick(item)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleCopyItem(item)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <FileCopyIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/menu/items/${item.id}`)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/menu/items/${item.id}`, { state: { copy: true } })}
                      sx={{ color: 'text.secondary' }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Filter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
          }
        }}
      >
        <MenuItem onClick={handleFilterClose}>All Items</MenuItem>
        <MenuItem onClick={handleFilterClose}>Available Only</MenuItem>
        <MenuItem onClick={handleFilterClose}>86'd Items</MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Menu Item
        </DialogTitle>
        <DialogContent>
          Are you sure you want to delete the menu item "{selectedItem?.mainItemName}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuItemsList;
