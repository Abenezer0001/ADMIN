import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import { modifierService, CreateModifierDto, UpdateModifierDto } from '../../services/ModifierService';

interface ModifierFormData {
  name: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  price: number;
  isAvailable: boolean;
}

const ModifierForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = React.useState<ModifierFormData>({
    name: '',
    arabicName: '',
    description: '',
    arabicDescription: '',
    price: 0,
    isAvailable: true,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (id) {
      fetchModifier();
    }
  }, [id]);

  const fetchModifier = async () => {
    try {
      setLoading(true);
      const modifier = await modifierService.getModifier(id!);
      setFormData({
        name: modifier.name,
        arabicName: modifier.arabicName || '',
        description: modifier.description || '',
        arabicDescription: modifier.arabicDescription || '',
        price: modifier.price,
        isAvailable: modifier.isAvailable,
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching modifier:', error);
      setError('Failed to fetch modifier details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (id) {
        await modifierService.updateModifier(id, formData as UpdateModifierDto);
      } else {
        await modifierService.createModifier(formData as CreateModifierDto);
      }

      navigate('/modifiers');
    } catch (error) {
      console.error('Error saving modifier:', error);
      setError('Failed to save modifier');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ModifierFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : field === 'price' 
        ? parseFloat(event.target.value) 
        : event.target.value;
    
    setFormData((prev: ModifierFormData) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading && id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <h1>{id ? 'Edit Modifier' : 'Add Modifier'}</h1>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Arabic Name"
                  value={formData.arabicName}
                  onChange={handleChange('arabicName')}
                  dir="rtl"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange('price')}
                  required
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isAvailable}
                      onChange={handleChange('isAvailable')}
                    />
                  }
                  label="Available"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Arabic Description"
                  value={formData.arabicDescription}
                  onChange={handleChange('arabicDescription')}
                  multiline
                  rows={2}
                  dir="rtl"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/modifiers')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {id ? 'Update' : 'Create'} Modifier
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ModifierForm;
