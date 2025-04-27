import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Button, IconButton, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import CategoryIcon from '@mui/icons-material/Category'; // For parent category
import ImageIcon from '@mui/icons-material/Image';

import { subCategoryService, SubCategory } from '../../services/SubCategoryService';
import { categoryService, Category } from '../../services/CategoryService'; // To display parent category name

const SubCategoryDetail = () => {
  const { id: subCategoryId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!subCategoryId) {
        setError('Sub-Category ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data: SubCategory = await subCategoryService.getSubCategory(subCategoryId);
        setSubCategory(data);

        // Fetch parent category details if category is just an ID
        if (data && typeof data.category === 'string') {
          try {
            const parentData: Category = await categoryService.getCategory(data.category);
            setParentCategory(parentData);
          } catch (catErr) {
            console.error("Error fetching parent category:", catErr);
            // Set parent category to null or a placeholder if fetch fails
            setParentCategory(null);
          }
        } else if (data && typeof data.category === 'object') {
           setParentCategory(data.category); // Already populated
        }

      } catch (err) {
        setError('Failed to fetch sub-category details.');
        console.error('Error fetching sub-category details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [subCategoryId]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 3 }}>{error}</Typography>;
  }

  if (!subCategory) {
     return <Typography sx={{ p: 3 }}>Sub-Category not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Sub-Category Details
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">{subCategory.name}</Typography>
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            onClick={() => navigate(`/subcategories/edit/${subCategory._id}`)}
          >
            Edit
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
             {subCategory.image ? (
                <img src={subCategory.image} alt={subCategory.name} style={{ width: '100%', height: 'auto', maxHeight: 300, objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, bgcolor: 'grey.200', borderRadius: '8px' }}>
                    <ImageIcon color="disabled" sx={{ fontSize: 60 }} />
                 </Box>
              )}
          </Grid>
           <Grid item xs={12} md={8}>
               <Grid container spacing={2}>
                   <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                        <Typography variant="body1">{subCategory.description || 'No description provided.'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Parent Category</Typography>
                        <Typography variant="body1">
                            <CategoryIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                            {parentCategory ? parentCategory.name : (typeof subCategory.category === 'string' ? 'Loading...' : 'N/A')}
                        </Typography>
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Order</Typography>
                        <Typography variant="body1">{subCategory.order}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                        <Chip
                            icon={<CircleIcon fontSize="small" />}
                            label={subCategory.isActive ? 'Active' : 'Inactive'}
                            color={subCategory.isActive ? 'success' : 'default'}
                            size="small"
                        />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
                        <Typography variant="body1">{new Date(subCategory.createdAt).toLocaleString()}</Typography>
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                        <Typography variant="body1">{new Date(subCategory.updatedAt).toLocaleString()}</Typography>
                    </Grid>
               </Grid>
           </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SubCategoryDetail;
