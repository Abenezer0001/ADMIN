import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { modifierService, Modifier } from '../../services/ModifierService';

const ModifierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modifier, setModifier] = useState<Modifier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModifier();
  }, [id]);

  const fetchModifier = async () => {
    try {
      if (!id) return;
      
      setLoading(true);
      const data = await modifierService.getModifier(id);
      setModifier(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching modifier:', error);
      setError('Failed to fetch modifier details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!modifier) {
    return <Alert severity="info">No modifier found</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/modifiers')}
        sx={{ mb: 3 }}
      >
        Back to Modifiers
      </Button>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {modifier.name}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">
                {modifier.description || 'No description available'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Price
              </Typography>
              <Typography variant="body1">
                ${modifier.price.toFixed(2)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Status
              </Typography>
              <Typography variant="body1">
                {modifier.isAvailable ? 'Available' : 'Unavailable'}
              </Typography>
            </Grid>

            {modifier.arabicName && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Arabic Name
                </Typography>
                <Typography variant="body1" dir="rtl">
                  {modifier.arabicName}
                </Typography>
              </Grid>
            )}

            {modifier.arabicDescription && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Arabic Description
                </Typography>
                <Typography variant="body1" dir="rtl">
                  {modifier.arabicDescription}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(modifier.createdAt).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(modifier.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate(`/modifiers/edit/${modifier._id}`)}
            >
              Edit Modifier
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ModifierDetail;