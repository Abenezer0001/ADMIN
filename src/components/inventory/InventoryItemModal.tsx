import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  InputAdornment,
  Typography,
  Divider
} from '@mui/material';
import { InventoryItem, CreateInventoryItemRequest } from '../../services/InventoryService';

interface InventoryItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: CreateInventoryItemRequest) => Promise<void>;
  item?: InventoryItem | null;
  restaurantId: string;
  loading?: boolean;
}

const categories = [
  'Fresh Produce',
  'Dairy',
  'Meat & Seafood',
  'Dry Goods',
  'Beverages',
  'Bakery',
  'Frozen',
  'Condiments & Spices',
  'Other'
];

const units = [
  'pieces',
  'kg',
  'g',
  'lbs',
  'oz',
  'liters',
  'ml',
  'gallons',
  'cups',
  'tbsp',
  'tsp',
  'boxes',
  'cans',
  'bottles',
  'bags'
];

export default function InventoryItemModal({
  open,
  onClose,
  onSave,
  item,
  restaurantId,
  loading = false
}: InventoryItemModalProps) {
  const [formData, setFormData] = useState<CreateInventoryItemRequest>({
    name: '',
    description: '',
    category: '',
    unit: '',
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    averageCost: 0,
    location: '',
    expirationDays: 0,
    restaurantId
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        category: item.category,
        unit: item.unit,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        maximumStock: item.maximumStock || 0,
        averageCost: item.averageCost,
        location: item.location || '',
        expirationDays: item.expirationDays || 0,
        restaurantId
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        unit: '',
        currentStock: 0,
        minimumStock: 0,
        maximumStock: 0,
        averageCost: 0,
        location: '',
        expirationDays: 0,
        restaurantId
      });
    }
    setErrors({});
  }, [item, restaurantId, open]);

  const handleChange = (field: keyof CreateInventoryItemRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'name' || field === 'description' || field === 'category' || field === 'unit' || field === 'location'
        ? value
        : Number(value)
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }
    if (formData.currentStock < 0) {
      newErrors.currentStock = 'Current stock cannot be negative';
    }
    if (formData.minimumStock < 0) {
      newErrors.minimumStock = 'Minimum stock cannot be negative';
    }
    if (formData.averageCost < 0) {
      newErrors.averageCost = 'Average cost cannot be negative';
    }
    if (formData.maximumStock && formData.maximumStock < formData.minimumStock) {
      newErrors.maximumStock = 'Maximum stock must be greater than minimum stock';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      averageCost: 0,
      location: '',
      expirationDays: 0,
      restaurantId
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel required>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={2}
              />
            </Grid>

            {/* Stock Information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Stock Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.unit}>
                <InputLabel required>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={handleChange('unit')}
                  label="Unit"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={formData.currentStock}
                onChange={handleChange('currentStock')}
                error={!!errors.currentStock}
                helperText={errors.currentStock}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Stock"
                type="number"
                value={formData.minimumStock}
                onChange={handleChange('minimumStock')}
                error={!!errors.minimumStock}
                helperText={errors.minimumStock}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Stock"
                type="number"
                value={formData.maximumStock}
                onChange={handleChange('maximumStock')}
                error={!!errors.maximumStock}
                helperText={errors.maximumStock}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Cost and Location */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Cost & Location
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Average Cost"
                type="number"
                value={formData.averageCost}
                onChange={handleChange('averageCost')}
                error={!!errors.averageCost}
                helperText={errors.averageCost}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Storage Location"
                value={formData.location}
                onChange={handleChange('location')}
                placeholder="e.g., Refrigerator, Pantry, Freezer"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expiration Days"
                type="number"
                value={formData.expirationDays}
                onChange={handleChange('expirationDays')}
                inputProps={{ min: 0 }}
                helperText="Days until expiration (0 for non-perishable)"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {item ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}