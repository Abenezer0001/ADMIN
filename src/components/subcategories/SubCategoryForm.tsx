import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, FormControl, InputLabel,
  Select, MenuItem, FormControlLabel, Switch, CircularProgress, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, SelectChangeEvent
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { subCategoryService, CreateSubCategoryDto, UpdateSubCategoryDto, SubCategory } from '../../services/SubCategoryService';
import { categoryService, Category } from '../../services/CategoryService';

interface SubCategoryFormData {
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  order: number;
  category: string; // Store parent category ID
}

interface SubCategoryFormProps {
  title: string;
}

const SubCategoryForm = ({ title }: SubCategoryFormProps) => {
  const navigate = useNavigate();
  const { id: subCategoryId } = useParams<{ id: string }>(); // Get ID from URL
  const [formData, setFormData] = useState<SubCategoryFormData>({
    name: '',
    description: '',
    image: '',
    isActive: true,
    order: 0,
    category: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data: Category[] = await categoryService.getCategories();
        setCategories(data || []);
        // If creating a new subcategory and categories loaded, select the first one by default
        if (!subCategoryId && data && data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: data[0]._id }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [subCategoryId]); // Rerun if subCategoryId changes (though unlikely needed here)

  // Fetch subcategory data if in edit mode
  useEffect(() => {
    const fetchSubCategory = async () => {
      if (!subCategoryId) return; // Only run in edit mode

      try {
        setLoading(true);
        const data: SubCategory = await subCategoryService.getSubCategory(subCategoryId);
        if (data) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            image: data.image || '',
            isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
            order: data.order || 0,
            category: typeof data.category === 'string' ? data.category : data.category._id, // Handle populated vs ID
          });
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch sub-category details.');
        console.error('Error fetching sub-category:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategory();
  }, [subCategoryId]);

  const handleChange = (field: keyof SubCategoryFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const target = event.target as HTMLInputElement; // Type assertion
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     setFormData((prev) => ({ ...prev, isActive: event.target.checked }));
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    if (!formData.category) {
        setError('Parent category is required.');
        return;
    }
     if (!formData.name.trim()) {
        setError('Sub-category name is required.');
        return;
    }


    try {
      setLoading(true);
      const payload: CreateSubCategoryDto | UpdateSubCategoryDto = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        isActive: formData.isActive,
        order: formData.order,
        category: formData.category,
      };

      if (subCategoryId) {
        // Update existing subcategory
        await subCategoryService.updateSubCategory(subCategoryId, payload as UpdateSubCategoryDto);
      } else {
        // Create new subcategory
        await subCategoryService.createSubCategory(payload as CreateSubCategoryDto);
      }
      navigate('/subcategories/list'); // Navigate back to list after success
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save sub-category.');
      console.error('Error saving sub-category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subCategoryId) return;
    try {
      setLoading(true);
      await subCategoryService.deleteSubCategory(subCategoryId);
      setDeleteDialogOpen(false);
      navigate('/subcategories/list');
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      setError('Failed to delete sub-category.');
      setLoading(false); // Ensure loading is stopped on error
      setDeleteDialogOpen(false); // Close dialog on error
    }
    // No finally setLoading(false) here, as navigation happens on success
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          {subCategoryId && (
            <Button variant="outlined" color="error" onClick={handleDelete} disabled={loading}>
              Delete
            </Button>
          )}
        </Box>

        {loading && !categories.length ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
        ): (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required error={!formData.category && !!error}>
                <InputLabel>Parent Category</InputLabel>
                <Select
                value={formData.category}
                label="Parent Category"
                onChange={handleChange('category')}
                disabled={loadingCategories || !!subCategoryId} // Disable if editing
                >
                {loadingCategories ? (
                    <MenuItem value="" disabled><CircularProgress size={20} /></MenuItem>
                ) : (
                    categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                    </MenuItem>
                    ))
                )}
                </Select>
                 {!formData.category && !!error && <Typography color="error" variant="caption">Category is required</Typography>}
            </FormControl>

            <TextField
                required
                label="Sub-Category Name"
                value={formData.name}
                onChange={handleChange('name')}
                fullWidth
                error={!formData.name.trim() && !!error}
                helperText={!formData.name.trim() && !!error ? 'Name is required' : ''}
            />

            <TextField
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                fullWidth
                multiline
                rows={3}
            />

             <TextField
                label="Image URL"
                value={formData.image}
                onChange={handleChange('image')}
                fullWidth
                placeholder="https://example.com/image.jpg"
            />
             {formData.image && (
                 <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <img src={formData.image} alt="Preview" style={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain' }}/>
                 </Box>
             )}


            <TextField
                type="number"
                label="Order"
                value={formData.order}
                onChange={handleChange('order')}
                fullWidth
                inputProps={{ min: 0 }}
            />

            <FormControlLabel
                control={
                <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange} // Use specific handler for switch
                    name="isActive"
                />
                }
                label="Active"
            />

            {error && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                {error}
                </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
                Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </Box>
            </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sub-category? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" disabled={loading}>
             {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubCategoryForm;
