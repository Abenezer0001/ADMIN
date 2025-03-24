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
import { categoryService, Category } from '../../services/CategoryService';

const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      if (!id) return;
      
      setLoading(true);
      const data = await categoryService.getCategory(id);
      setCategory(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to fetch category details');
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

  if (!category) {
    return <Alert severity="info">No category found</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/categories')}
        sx={{ mb: 3 }}
      >
        Back to Categories
      </Button>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {category.name}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">
                {category.description || 'No description available'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Display Order
              </Typography>
              <Typography variant="body1">
                {category.order}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Status
              </Typography>
              <Typography variant="body1">
                {category.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Created At
              </Typography>
              <Typography variant="body1">
                {new Date(category.createdAt).toLocaleString()}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="textSecondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(category.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate(`/categories/edit/${category._id}`)}
            >
              Edit Category
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CategoryDetail;
