import React from 'react'; // Use default import for JSX
import { useState, useEffect } from 'react'; // Use named imports for hooks
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  subSubCategoryService,
  CreateSubSubCategoryDto,
  UpdateSubSubCategoryDto,
  SubSubCategory,
} from '../../services/SubSubCategoryService'; // Updated service and types
import { subCategoryService, SubCategory } from '../../services/SubCategoryService'; // Import SubCategory service

interface SubSubCategoryFormData {
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  order: number;
  subCategory: string; // ID of the parent SubCategory
}

const SubSubCategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<SubSubCategoryFormData>({
    name: '',
    description: '',
    image: '',
    isActive: true,
    order: 0,
    subCategory: '', // Initialize parent subCategory
  });
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]); // State for parent dropdown
  const [loading, setLoading] = useState(false);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(id);

  useEffect(() => {
    fetchSubCategories(); // Fetch parent subcategories on mount
    if (id) {
      fetchSubSubCategory();
    }
  }, [id]);

  const fetchSubCategories = async () => {
    try {
      setLoadingSubCategories(true);
      const data = await subCategoryService.getSubCategories(); // Fetch all subcategories
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setError('Failed to load parent subcategories.');
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const fetchSubSubCategory = async () => {
    try {
      setLoading(true);
      const subSubCategory = await subSubCategoryService.getSubSubCategory(id!);
      // Ensure subCategory is stored as ID
      const parentSubCategoryId = typeof subSubCategory.subCategory === 'object'
        ? subSubCategory.subCategory._id
        : subSubCategory.subCategory;

      setFormData({
        ...subSubCategory,
        subCategory: parentSubCategoryId || '', // Set the ID
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching sub-subcategory:', error);
      setError('Failed to fetch sub-subcategory details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subCategory) {
        setError('Parent SubCategory is required.');
        return;
    }
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        order: Number(formData.order) || 0, // Ensure order is a number
      };

      if (id) {
        await subSubCategoryService.updateSubSubCategory(id, payload as UpdateSubSubCategoryDto);
      } else {
        await subSubCategoryService.createSubSubCategory(payload as CreateSubSubCategoryDto);
      }

      navigate('/subsubcategories/list'); // Updated path
    } catch (error: any) {
      console.error('Error saving sub-subcategory:', error);
      setError(error?.response?.data?.error || 'Failed to save sub-subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof SubSubCategoryFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const target = event.target as HTMLInputElement; // Type assertion
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData((prev: SubSubCategoryFormData) => ({
      ...prev,
      [field]: value,
    }));
  };

   const handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = event.target.name as keyof SubSubCategoryFormData;
    setFormData({
      ...formData,
      [name]: event.target.value,
    });
  };


  if (loading && isEditMode) { // Only show main loading indicator when fetching existing data
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
       <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
         <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
           <ArrowBackIcon />
         </IconButton>
         <Typography variant="h5">
           {isEditMode ? 'Edit Sub-Subcategory' : 'Add Sub-Subcategory'} {/* Updated title */}
         </Typography>
       </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Image URL (Optional)"
                  value={formData.image || ''}
                  onChange={handleChange('image')}
                />
              </Grid>

              {/* Parent SubCategory Selection */}
              <Grid item xs={12}>
                 <FormControl fullWidth required error={!formData.subCategory && !!error}>
                   <InputLabel>Parent SubCategory</InputLabel>
                   <Select
                     name="subCategory"
                     value={formData.subCategory}
                     label="Parent SubCategory"
                     onChange={handleSelectChange}
                     disabled={loadingSubCategories}
                   >
                     {loadingSubCategories ? (
                        <MenuItem value="" disabled><em>Loading...</em></MenuItem>
                     ) : (
                       subCategories.map((subCat: SubCategory) => ( // Add explicit type
                         <MenuItem key={subCat._id} value={subCat._id}>
                           {subCat.name}
                         </MenuItem>
                       ))
                     )}
                   </Select>
                 </FormControl>
               </Grid>


              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Display Order"
                  type="number"
                  value={formData.order}
                  onChange={handleChange('order')}
                  required
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={handleChange('isActive')}
                    />
                  }
                  label="Active"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/subsubcategories/list')} // Updated path
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || loadingSubCategories}
                  >
                    {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update' : 'Create')} Sub-Subcategory {/* Updated button text */}
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

export default SubSubCategoryForm;
