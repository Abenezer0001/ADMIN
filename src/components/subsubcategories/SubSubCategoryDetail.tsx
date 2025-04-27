import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import ImageIcon from '@mui/icons-material/Image';
import { subSubCategoryService, SubSubCategory } from '../../services/SubSubCategoryService'; // Updated service and type

const SubSubCategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subSubCategory, setSubSubCategory] = useState<SubSubCategory | null>(null); // Updated state name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubSubCategory = async () => { // Updated function name
      try {
        if (!id) {
          setError('Sub-Subcategory ID is missing.');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        const data = await subSubCategoryService.getSubSubCategory(id); // Updated service call
        setSubSubCategory(data);
      } catch (error) {
        console.error('Error fetching sub-subcategory:', error);
        setError('Failed to fetch sub-subcategory details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubSubCategory();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  }

  if (!subSubCategory) {
    return <Alert severity="info" sx={{ m: 3 }}>Sub-Subcategory not found.</Alert>; // Updated message
  }

  // Helper to get parent subcategory name
  const getParentSubCategoryName = () => {
    if (!subSubCategory.subCategory) return 'N/A';
    return typeof subSubCategory.subCategory === 'object'
      ? subSubCategory.subCategory.name
      : subSubCategory.subCategory; // Display ID if not populated
  };


  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
           <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
             <ArrowBackIcon />
           </IconButton>
           <Typography variant="h5" component="h1">
             Sub-Subcategory Details {/* Updated title */}
           </Typography>
        </Box>
        <Button
          startIcon={<EditIcon />}
          variant="outlined"
          onClick={() => navigate(`/subsubcategories/edit/${subSubCategory._id}`)} // Updated path
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {subSubCategory.image ? (
              <img
                src={subSubCategory.image}
                alt={subSubCategory.name}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 300,
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 200,
                  bgcolor: 'grey.200',
                  borderRadius: '8px',
                }}
              >
                <ImageIcon color="disabled" sx={{ fontSize: 60 }} />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
               <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{subSubCategory.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {subSubCategory.description || 'No description provided.'}
                </Typography>
              </Grid>
               <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Parent SubCategory
                </Typography>
                <Typography variant="body1">{getParentSubCategoryName()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Display Order
                </Typography>
                <Typography variant="body1">{subSubCategory.order}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  icon={<CircleIcon fontSize="small" />}
                  label={subSubCategory.isActive ? 'Active' : 'Inactive'}
                  color={subSubCategory.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(subSubCategory.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(subSubCategory.updatedAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SubSubCategoryDetail;
