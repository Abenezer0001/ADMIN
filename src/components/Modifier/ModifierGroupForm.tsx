import React from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ModifierGroupFormData, ModifierFormData } from '../../types/menuTypes';
import ModifierForm from './ModifierForm';

interface ModifierGroupFormProps {
  group: ModifierGroupFormData;
  onChange: (group: ModifierGroupFormData) => void;
  onDelete?: () => void;
}

const ModifierGroupForm: React.FC<ModifierGroupFormProps> = ({
  group,
  onChange,
  onDelete,
}) => {
  const handleChange = (field: keyof ModifierGroupFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...group,
      [field]: event.target.value,
    });
  };

  const handleNumberChange = (field: 'minSelect' | 'maxSelect') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onChange({
        ...group,
        [field]: value,
      });
    }
  };

  const handleModifierChange = (index: number) => (modifier: ModifierFormData) => {
    const newModifiers = [...group.modifiers];
    newModifiers[index] = modifier;
    onChange({
      ...group,
      modifiers: newModifiers,
    });
  };

  const handleAddModifier = () => {
    onChange({
      ...group,
      modifiers: [
        ...group.modifiers,
        {
          name: '',
          arabicName: '',
          price: 0,
          isAvailable: true,
        },
      ],
    });
  };

  const handleDeleteModifier = (index: number) => () => {
    onChange({
      ...group,
      modifiers: group.modifiers.filter((_, i) => i !== index),
    });
  };

  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Group Name"
            value={group.name}
            onChange={handleChange('name')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Arabic Group Name"
            value={group.arabicName}
            onChange={handleChange('arabicName')}
            required
            dir="rtl"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Description"
            value={group.description}
            onChange={handleChange('description')}
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Arabic Description"
            value={group.arabicDescription}
            onChange={handleChange('arabicDescription')}
            multiline
            rows={2}
            dir="rtl"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Minimum Selection"
            type="number"
            value={group.minSelect}
            onChange={handleNumberChange('minSelect')}
            required
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Maximum Selection"
            type="number"
            value={group.maxSelect}
            onChange={handleNumberChange('maxSelect')}
            required
            inputProps={{ min: group.minSelect }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControlLabel
            control={
              <Switch
                checked={group.isRequired}
                onChange={(e) => onChange({ ...group, isRequired: e.target.checked })}
              />
            }
            label="Required"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Modifiers
          </Typography>
          {group.modifiers.map((modifier, index) => (
            <ModifierForm
              key={index}
              modifier={modifier}
              onChange={handleModifierChange(index)}
              onDelete={handleDeleteModifier(index)}
            />
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddModifier}
            sx={{ mt: 1 }}
          >
            Add Modifier
          </Button>
        </Grid>

        {onDelete && (
          <Grid item xs={12}>
            <Button
              color="error"
              onClick={onDelete}
              startIcon={<DeleteIcon />}
              sx={{ mt: 2 }}
            >
              Delete Group
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ModifierGroupForm;
