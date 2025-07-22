import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { kitchenService } from '../../services/KitchenService';

interface Kitchen {
  _id: string;
  name: string;
  description?: string;
  kitchenType: string;
  restaurantId: { _id: string; name: string } | string;
  venueId: { _id: string; name: string } | string;
  isActive: boolean;
}

interface KitchenSelectorProps {
  selectedKitchenId?: string;
  restaurantId?: string;
  onKitchenChange?: (kitchenId: string) => void;
  label?: string;
  size?: 'small' | 'medium';
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

const KitchenSelector: React.FC<KitchenSelectorProps> = ({
  selectedKitchenId,
  restaurantId,
  onKitchenChange,
  label = 'Kitchen',
  size = 'small',
  required = false,
  disabled = false,
  helperText
}) => {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKitchens = async () => {
      if (!restaurantId) {
        setKitchens([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch all kitchens and filter by restaurant
        const allKitchens = await kitchenService.getAllKitchens();
        
        // Filter kitchens by restaurant ID
        const filteredKitchens = allKitchens.filter((kitchen: Kitchen) => {
          const kitchenRestaurantId = typeof kitchen.restaurantId === 'object' ? kitchen.restaurantId._id : kitchen.restaurantId;
          return kitchen.isActive && kitchenRestaurantId === restaurantId;
        });
        
        setKitchens(filteredKitchens);
      } catch (err: any) {
        console.error('Error fetching kitchens:', err);
        setError(`Failed to load kitchens: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchKitchens();
  }, [restaurantId]);

  const handleKitchenChange = (event: SelectChangeEvent<string>) => {
    const kitchenId = event.target.value;
    if (onKitchenChange) {
      onKitchenChange(kitchenId);
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading kitchens...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <FormControl fullWidth size={size as 'small' | 'medium'} required={required}>
      <InputLabel id="kitchen-select-label">{label}</InputLabel>
      <Select
        labelId="kitchen-select-label"
        value={selectedKitchenId || ''}
        onChange={handleKitchenChange}
        label={label}
        disabled={disabled || !restaurantId || kitchens.length === 0}
      >
        <MenuItem value="">
          <em>Select a kitchen</em>
        </MenuItem>
        {kitchens.map((kitchen: Kitchen) => (
          <MenuItem key={kitchen._id} value={kitchen._id}>
            <Box>
              <Typography variant="body2">{kitchen.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {kitchen.kitchenType}
                {kitchen.description && ` - ${kitchen.description}`}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

export default KitchenSelector;