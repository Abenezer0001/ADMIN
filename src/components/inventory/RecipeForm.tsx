import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  IconButton,
  Paper,
  Chip,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { Recipe, CreateRecipeRequest, InventoryItem, RecipeIngredient } from '../../services/InventoryService';
import inventoryService from '../../services/InventoryService';
import { useBusiness } from '../../context/BusinessContext';

interface RecipeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: CreateRecipeRequest) => Promise<void>;
  recipe?: Recipe | null;
  loading?: boolean;
}

const categories = [
  'Appetizers',
  'Main Course',
  'Side Dishes',
  'Desserts',
  'Beverages',
  'Salads',
  'Soups',
  'Pasta',
  'Pizza',
  'Sandwiches',
  'Breakfast',
  'Other'
];

const difficulties = ['Easy', 'Medium', 'Hard'];

export default function RecipeForm({
  open,
  onClose,
  onSave,
  recipe,
  loading = false
}: RecipeFormProps) {
  const { currentBusiness } = useBusiness();
  const [formData, setFormData] = useState<CreateRecipeRequest>({
    name: '',
    description: '',
    category: '',
    servingSize: 1,
    prepTime: 0,
    cookTime: 0,
    difficulty: 'Medium',
    instructions: [''],
    ingredients: [],
    restaurantId: currentBusiness?._id || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Load inventory items for ingredient selection
  const loadInventoryItems = useCallback(async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoadingInventory(true);
      const items = await inventoryService.getInventoryItems(currentBusiness._id);
      setInventoryItems(items);
    } catch (err) {
      console.error('Failed to load inventory items:', err);
    } finally {
      setLoadingInventory(false);
    }
  }, [currentBusiness?._id]);

  useEffect(() => {
    if (open) {
      loadInventoryItems();
    }
  }, [open, loadInventoryItems]);

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        category: recipe.category,
        servingSize: recipe.servingSize,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        difficulty: recipe.difficulty || 'Medium',
        instructions: recipe.instructions.length > 0 ? recipe.instructions : [''],
        ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [],
        restaurantId: currentBusiness?._id || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        servingSize: 1,
        prepTime: 0,
        cookTime: 0,
        difficulty: 'Medium',
        instructions: [''],
        ingredients: [],
        restaurantId: currentBusiness?._id || ''
      });
    }
    setErrors({});
  }, [recipe, currentBusiness?._id, open]);

  const handleChange = (field: keyof CreateRecipeRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'servingSize' || field === 'prepTime' || field === 'cookTime'
        ? Number(value)
        : value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, instructions: newInstructions }));
    }
  };

  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    const newIngredients = [...formData.ingredients];
    if (field === 'ingredientId' && typeof value === 'object' && value !== null) {
      // Handle Autocomplete selection
      newIngredients[index] = {
        ...newIngredients[index],
        ingredientId: value._id,
        ingredientName: value.name,
        unit: value.unit
      };
    } else {
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: field === 'quantity' ? Number(value) : value
      };
    }
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {
        ingredientId: '',
        ingredientName: '',
        quantity: 0,
        unit: ''
      }]
    }));
  };

  const removeIngredient = (index: number) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Recipe name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.servingSize <= 0) {
      newErrors.servingSize = 'Serving size must be greater than 0';
    }
    if (formData.prepTime < 0) {
      newErrors.prepTime = 'Prep time cannot be negative';
    }
    if (formData.cookTime < 0) {
      newErrors.cookTime = 'Cook time cannot be negative';
    }
    if (formData.instructions.some(instruction => !instruction.trim())) {
      newErrors.instructions = 'All instruction steps must be filled';
    }
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }
    if (formData.ingredients.some(ing => !ing.ingredientId || ing.quantity <= 0)) {
      newErrors.ingredients = 'All ingredients must have valid items and quantities';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      servingSize: 1,
      prepTime: 0,
      cookTime: 0,
      difficulty: 'Medium',
      instructions: [''],
      ingredients: [],
      restaurantId: currentBusiness?._id || ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          {recipe ? 'Edit Recipe' : 'Create New Recipe'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Recipe Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel required>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={2}
              />
            </Grid>

            {/* Recipe Details */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Recipe Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Serving Size"
                type="number"
                value={formData.servingSize}
                onChange={handleChange('servingSize')}
                error={!!errors.servingSize}
                helperText={errors.servingSize}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Prep Time (minutes)"
                type="number"
                value={formData.prepTime}
                onChange={handleChange('prepTime')}
                error={!!errors.prepTime}
                helperText={errors.prepTime}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Cook Time (minutes)"
                type="number"
                value={formData.cookTime}
                onChange={handleChange('cookTime')}
                error={!!errors.cookTime}
                helperText={errors.cookTime}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={formData.difficulty}
                  onChange={handleChange('difficulty')}
                  label="Difficulty"
                >
                  {difficulties.map((difficulty) => (
                    <MenuItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Ingredients */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Ingredients
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addIngredient}
                  size="small"
                >
                  Add Ingredient
                </Button>
              </Box>
              {errors.ingredients && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.ingredients}
                </Typography>
              )}
            </Grid>
            
            {formData.ingredients.map((ingredient, index) => (
              <Grid item xs={12} key={index}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={1}>
                      <DragIcon color="disabled" />
                    </Grid>
                    <Grid item xs={5}>
                      <Autocomplete
                        options={inventoryItems}
                        getOptionLabel={(option) => option.name}
                        value={inventoryItems.find(item => item._id === ingredient.ingredientId) || null}
                        onChange={(event, newValue) => {
                          handleIngredientChange(index, 'ingredientId', newValue);
                        }}
                        loading={loadingInventory}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Ingredient"
                            variant="outlined"
                            size="small"
                            required
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        size="small"
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        fullWidth
                        label="Unit"
                        value={ingredient.unit}
                        onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                        size="small"
                        disabled
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                        onClick={() => removeIngredient(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            {/* Instructions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Instructions
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addInstruction}
                  size="small"
                >
                  Add Step
                </Button>
              </Box>
              {errors.instructions && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {errors.instructions}
                </Typography>
              )}
            </Grid>
            
            {formData.instructions.map((instruction, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Chip 
                    label={index + 1} 
                    size="small" 
                    color="primary" 
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    fullWidth
                    label={`Step ${index + 1}`}
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    multiline
                    rows={2}
                    required
                  />
                  {formData.instructions.length > 1 && (
                    <IconButton
                      onClick={() => removeInstruction(index)}
                      color="error"
                      sx={{ mt: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {recipe ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}