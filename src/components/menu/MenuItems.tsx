import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Card,
  CardMedia,
  Switch,
  FormControlLabel,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Language as LanguageIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { mockMenuItemService } from '../../services/mockService';
import { MenuItem, MenuItemFormData, ModifierGroup, ModifierGroupFormData } from '../../types/menuTypes';
import { usePreferences } from '../../context/PreferenceContext';

const initialForm: MenuItemFormData = {
  mainItemName: '',
  arabicName: '',
  preparation: 10,
  description: '',
  arabicDescription: '',
  sku: '',
  barcode: '',
  price: 0,
  currency: 'QAR',
  ingredients: [],
  modifierGroups: [],
  classifications: [],
  allergens: [],
  nutritionalInfo: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  },
  instructions: [],
  tags: [],
  image: undefined,
  isAvailable: true,
  eightySixReason: '',
  menuId: 'novo-cinema-vendome',
  branchId: 'vendome-mall-lusail',
};

const defaultModifierGroup: ModifierGroupFormData = {
  name: '',
  arabicName: '',
  description: '',
  arabicDescription: '',
  minSelect: 0,
  maxSelect: 1,
  isRequired: false,
  modifiers: [],
};

const MenuItems = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences } = usePreferences();
  const isCopy = location.state?.copy === true;

  const [form, setForm] = useState<MenuItemFormData>(initialForm);
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [show86Dialog, setShow86Dialog] = useState(false);
  const [availableModifierGroups, setAvailableModifierGroups] = useState<ModifierGroup[]>([]);

  useEffect(() => {
    if (id && id !== 'new') {
      loadMenuItem(id);
    }
  }, [id]);

  useEffect(() => {
    const loadModifierGroups = async () => {
      try {
        const groups = await mockMenuItemService.getModifierGroups();
        setAvailableModifierGroups(groups);
      } catch (error) {
        console.error('Failed to load modifier groups:', error);
      }
    };
    loadModifierGroups();
  }, []);

  const loadMenuItem = async (itemId: string) => {
    try {
      const data = await mockMenuItemService.getMenuItem(itemId);
      if (isCopy) {
        const copiedData = {
          ...data,
          id: '',
          mainItemName: `${data.mainItemName} Copy`,
          arabicName: data.arabicName ? `${data.arabicName} ${preferences.secondaryLanguage.code === 'ar' ? 'نسخة' : 'Copy'}` : '',
        };
        setForm(copiedData);
      } else {
        setForm(data);
      }
      if (data.image) {
        setImagePreview(data.image);
      }
    } catch (error) {
      console.error('Error loading menu item:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = async () => {
    try {
      const newItem = {
        ...form,
        mainItemName: `${form.mainItemName} (Copy)`,
        sku: `${form.sku}-copy`
      };
      await mockMenuItemService.createMenuItem(newItem);
      navigate('/menu/items');
    } catch (error) {
      console.error('Error copying item:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (id) {
        await mockMenuItemService.deleteMenuItem(id);
        setDeleteDialogOpen(false);
        navigate('/menu/items');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (id && id !== 'new') {
        await mockMenuItemService.updateMenuItem(id, form);
      } else {
        await mockMenuItemService.createMenuItem(form);
      }
      navigate('/menu/items');
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleTagAdd = () => {
    if (newTag && !form.tags.includes(newTag)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const handleTagDelete = (tagToDelete: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handle86Toggle = () => {
    if (form.isAvailable) {
      setShow86Dialog(true);
    } else {
      setForm(prev => ({
        ...prev,
        isAvailable: true,
        eightySixReason: ''
      }));
    }
  };

  const handle86Confirm = (reason: string) => {
    setForm(prev => ({
      ...prev,
      isAvailable: false,
      eightySixReason: reason
    }));
    setShow86Dialog(false);
  };

  const handleModifierGroupsChange = (event: any) => {
    const selectedGroupIds = event.target.value;
    const selectedGroups = availableModifierGroups.filter(group => 
      selectedGroupIds.includes(group.id)
    );
    setForm(prev => ({
      ...prev,
      modifierGroups: selectedGroups,
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/menu/items" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton>
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <Typography variant="h5" sx={{ ml: 2 }}>
            {id === 'new' ? 'New Menu Item' : 
             isCopy ? 'Copy Menu Item' :
             form.mainItemName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {id && id !== 'new' && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isAvailable}
                    onChange={handle86Toggle}
                    color={form.isAvailable ? 'success' : 'error'}
                  />
                }
                label={form.isAvailable ? 'Available' : '86ed'}
                sx={{ mr: 2 }}
              />
              <Tooltip title="Create a copy">
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopy}
                >
                  Copy
                </Button>
              </Tooltip>
              <Tooltip title="Delete item">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </Button>
              </Tooltip>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Image Upload */}
          <Grid item xs={12}>
            <Card sx={{ maxWidth: 345, mx: 'auto', mb: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={imagePreview || '/placeholder-food.jpg'}
                alt={form.mainItemName}
                sx={{ objectFit: 'cover' }}
              />
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                  >
                    Upload Image
                  </Button>
                </label>
              </Box>
            </Card>
          </Grid>

          {/* Main Item Info */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Main Item Name"
              name="mainItemName"
              value={form.mainItemName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={`Main Item Name (${preferences.secondaryLanguage.name})`}
              name={`mainItemName_${preferences.secondaryLanguage.code}`}
              value={form[`mainItemName_${preferences.secondaryLanguage.code}`] || ''}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <LanguageIcon />
                  </InputAdornment>
                ),
              }}
              dir={preferences.secondaryLanguage.direction}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Preparation Time (minutes)"
              name="preparation"
              type="number"
              value={form.preparation}
              onChange={handleInputChange}
            />
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Description
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={`Description (${preferences.secondaryLanguage.name})`}
                name={`description_${preferences.secondaryLanguage.code}`}
                value={form[`description_${preferences.secondaryLanguage.code}`] || ''}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <LanguageIcon />
                    </InputAdornment>
                  ),
                }}
                dir={preferences.secondaryLanguage.direction}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Optional Fields
          </Typography>

          {/* Info Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Info</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={form.sku}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Barcode"
                  name="barcode"
                  value={form.barcode}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Pricing Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Pricing</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {form.currency}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Tags Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Tags</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {form.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTagAdd();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleTagAdd}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Modifier Groups Section */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Modifier Groups</InputLabel>
              <Select
                multiple
                value={form.modifierGroups.map(group => group.id)}
                onChange={handleModifierGroupsChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {form.modifierGroups.map((group) => (
                      <Chip 
                        key={group.id} 
                        label={`${group.name} (${group.modifiers.length})`}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableModifierGroups.map((group) => (
                  <MuiMenuItem key={group.id} value={group.id}>
                    {group.name} {group[`name_${preferences.secondaryLanguage.code}`] && 
                      `(${group[`name_${preferences.secondaryLanguage.code}`]})`}
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* 86 Dialog */}
      <Dialog
        open={show86Dialog}
        onClose={() => setShow86Dialog(false)}
      >
        <DialogTitle>86 Menu Item</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please provide a reason for 86ing "{form.mainItemName}":
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            value={form.eightySixReason}
            onChange={(e) => setForm(prev => ({ ...prev, eightySixReason: e.target.value }))}
            placeholder="e.g., Out of stock, Ingredients unavailable, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow86Dialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handle86Confirm(form.eightySixReason)}
            color="primary"
            variant="contained"
            disabled={!form.eightySixReason}
          >
            Confirm 86
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Menu Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{form.mainItemName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuItems;
