import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ModifierGroup, Modifier } from '../../types/menuTypes';
import { mockMenuItemService } from '../../services/mockService';
import { usePreferences } from '../../context/PreferenceContext';
import { v4 as uuidv4 } from 'uuid';

interface ModifierDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (modifier: Modifier) => void;
  modifier?: Modifier;
  secondaryLanguage: { code: string; name: string; direction: 'ltr' | 'rtl' };
}

const ModifierDialog: React.FC<ModifierDialogProps> = ({
  open,
  onClose,
  onSave,
  modifier,
  secondaryLanguage,
}) => {
  const [form, setForm] = useState<Modifier>({
    id: modifier?.id || uuidv4(),
    name: modifier?.name || '',
    price: modifier?.price || 0,
    isAvailable: modifier?.isAvailable ?? true,
    [`name_${secondaryLanguage.code}`]: modifier?.[`name_${secondaryLanguage.code}`] || '',
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{modifier ? 'Edit Modifier' : 'Add Modifier'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={`Name (${secondaryLanguage.name})`}
              value={form[`name_${secondaryLanguage.code}`]}
              onChange={handleChange(`name_${secondaryLanguage.code}`)}
              dir={secondaryLanguage.direction}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Price"
              value={form.price}
              onChange={handleChange('price')}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isAvailable}
                  onChange={handleChange('isAvailable')}
                />
              }
              label="Available"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ModifierGroupEdit: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences } = usePreferences();
  const isCopy = location.state?.copy === true;
  
  const [form, setForm] = useState<ModifierGroup>({
    id: '',
    name: '',
    description: '',
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
    modifiers: [],
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModifier, setSelectedModifier] = useState<Modifier | undefined>();

  useEffect(() => {
    if (id && id !== 'new') {
      loadModifierGroup(id);
    }
  }, [id]);

  const loadModifierGroup = async (groupId: string) => {
    try {
      const data = await mockMenuItemService.getModifierGroup(groupId);
      if (isCopy) {
        const copiedData = {
          ...data,
          id: '',
          name: `${data.name} Copy`,
          [`name_${preferences.secondaryLanguage.code}`]: 
            data[`name_${preferences.secondaryLanguage.code}`] 
              ? `${data[`name_${preferences.secondaryLanguage.code}`]} ${preferences.secondaryLanguage.code === 'ar' ? 'نسخة' : 'Copy'}`
              : '',
        };
        setForm(copiedData);
      } else {
        setForm(data);
      }
    } catch (error) {
      console.error('Failed to load modifier group:', error);
      navigate('/menu/modifiers');
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (id === 'new' || isCopy) {
        await mockMenuItemService.createModifierGroup(form);
      } else {
        await mockMenuItemService.updateModifierGroup(id, form);
      }
      navigate('/menu/modifiers');
    } catch (error) {
      console.error('Failed to save modifier group:', error);
    }
  };

  const handleAddModifier = () => {
    setSelectedModifier(undefined);
    setDialogOpen(true);
  };

  const handleEditModifier = (modifier: Modifier) => {
    setSelectedModifier(modifier);
    setDialogOpen(true);
  };

  const handleDeleteModifier = (modifierId: string) => {
    setForm(prev => ({
      ...prev,
      modifiers: prev.modifiers.filter(m => m.id !== modifierId),
    }));
  };

  const handleSaveModifier = (modifier: Modifier) => {
    setForm(prev => ({
      ...prev,
      modifiers: selectedModifier
        ? prev.modifiers.map(m => m.id === modifier.id ? modifier : m)
        : [...prev.modifiers, modifier],
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/menu/modifiers')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">
          {id === 'new' ? 'New Modifier Group' : 
           isCopy ? 'Copy Modifier Group' :
           'Edit Modifier Group'}
        </Typography>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={handleChange('name')}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={`Name (${preferences.secondaryLanguage.name})`}
              value={form[`name_${preferences.secondaryLanguage.code}`] || ''}
              onChange={handleChange(`name_${preferences.secondaryLanguage.code}`)}
              dir={preferences.secondaryLanguage.direction}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={`Description (${preferences.secondaryLanguage.name})`}
              value={form[`description_${preferences.secondaryLanguage.code}`] || ''}
              onChange={handleChange(`description_${preferences.secondaryLanguage.code}`)}
              dir={preferences.secondaryLanguage.direction}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Selection"
              value={form.minSelect}
              onChange={handleChange('minSelect')}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Selection"
              value={form.maxSelect}
              onChange={handleChange('maxSelect')}
              inputProps={{ min: form.minSelect }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isRequired}
                  onChange={handleChange('isRequired')}
                />
              }
              label="Required"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Modifiers List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Modifiers</Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={handleAddModifier}
          >
            Add Modifier
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>{preferences.secondaryLanguage.name}</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Available</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.modifiers.map((modifier) => (
                <TableRow key={modifier.id}>
                  <TableCell>{modifier.name}</TableCell>
                  <TableCell dir={preferences.secondaryLanguage.direction}>
                    {modifier[`name_${preferences.secondaryLanguage.code}`]}
                  </TableCell>
                  <TableCell>{modifier.price}</TableCell>
                  <TableCell>{modifier.isAvailable ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditModifier(modifier)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteModifier(modifier.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Save Buttons */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/menu/modifiers')}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>

      {/* Modifier Dialog */}
      <ModifierDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveModifier}
        modifier={selectedModifier}
        secondaryLanguage={preferences.secondaryLanguage}
      />
    </Box>
  );
};

export default ModifierGroupEdit;
