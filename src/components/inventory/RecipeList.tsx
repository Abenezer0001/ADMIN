import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Stack,
  Avatar,
  Divider,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  RestaurantMenu as RestaurantMenuIcon,
  AccessTime as AccessTimeIcon,
  PeopleOutline as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import DataTable from '../common/DataTable';
import { useBusiness } from '../../context/BusinessContext';
import inventoryService, { Recipe } from '../../services/InventoryService';

const columns = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Category', accessorKey: 'category' },
  { header: 'Servings', accessorKey: 'servingSize' },
  { header: 'Prep Time', accessorKey: 'prepTime' },
  { header: 'Cook Time', accessorKey: 'cookTime' },
  { header: 'Difficulty', accessorKey: 'difficulty' },
  { header: 'Cost/Portion', accessorKey: 'costPerPortion' },
  { header: 'Total Cost', accessorKey: 'totalCost' }
];

interface RecipeListProps {
  onCreateRecipe?: () => void;
  onEditRecipe?: (recipe: Recipe) => void;
  onViewRecipe?: (recipe: Recipe) => void;
}

export default function RecipeList({ onCreateRecipe, onEditRecipe, onViewRecipe }: RecipeListProps) {
  const { currentBusiness } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load recipes data
  const loadRecipesData = useCallback(async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const recipesData = await inventoryService.getRecipes(currentBusiness._id);
      setRecipes(recipesData);
      
    } catch (err: any) {
      console.error('Failed to load recipes data:', err);
      setError(err.message || 'Failed to load recipes data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness?._id]);
  
  // Load data on mount and when business changes
  useEffect(() => {
    loadRecipesData();
  }, [loadRecipesData]);

  const handleEdit = (recipe: Recipe) => {
    if (onEditRecipe) {
      onEditRecipe(recipe);
    } else {
      console.log('Edit recipe:', recipe);
    }
  };

  const handleDelete = async (recipe: Recipe) => {
    if (!currentBusiness?._id) return;
    
    try {
      await inventoryService.deleteRecipe(recipe._id, currentBusiness._id);
      setSnackbarOpen(true);
      await loadRecipesData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete recipe');
      setSnackbarOpen(true);
    }
  };

  const handleView = (recipe: Recipe) => {
    if (onViewRecipe) {
      onViewRecipe(recipe);
    } else {
      console.log('View recipe:', recipe);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleRefresh = () => {
    loadRecipesData();
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError(null);
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newViewMode: 'list' | 'grid') => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };
  
  // Filter recipes based on search term and category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories
  const categories = ['all', ...Array.from(new Set(recipes.map(recipe => recipe.category)))];
  
  // Calculate recipe statistics
  const recipeStats = {
    totalRecipes: recipes.length,
    avgPrepTime: recipes.length > 0 ? Math.round(recipes.reduce((sum, r) => sum + r.prepTime, 0) / recipes.length) : 0,
    avgCookTime: recipes.length > 0 ? Math.round(recipes.reduce((sum, r) => sum + r.cookTime, 0) / recipes.length) : 0,
    avgCost: recipes.length > 0 ? recipes.reduce((sum, r) => sum + r.calculatedCostPerPortion, 0) / recipes.length : 0
  };
  
  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Alert severity="info">Please select a business to view recipe data.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
            Recipe Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your recipes and track food costs
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            color="primary"
            disabled={loading}
            onClick={onCreateRecipe}
          >
            Add Recipe
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', mb: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <RestaurantMenuIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Total Recipes
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {recipeStats.totalRecipes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active recipes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#1976d2' }}>
                    <AccessTimeIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Avg Prep Time
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {recipeStats.avgPrepTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800' }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Avg Cook Time
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {recipeStats.avgCookTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  minutes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#2e7d32' }}>
                    <AttachMoneyIcon />
                  </Avatar>
                  <Typography variant="h6" component="div">
                    Avg Cost/Portion
                  </Typography>
                </Stack>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  ${recipeStats.avgCost.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per serving
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Recipe Library ({filteredRecipes.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search recipes"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              sx={{ minWidth: 200 }}
            />
            <IconButton 
              onClick={handleRefresh}
              color="primary"
              disabled={loading}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Category Filter */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category === 'all' ? 'All Categories' : category}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        {/* Recipe Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'grid' ? (
          <Grid container spacing={3}>
            {filteredRecipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recipe._id}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: '10px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ 
                        fontWeight: 600, 
                        fontSize: '1rem',
                        lineHeight: 1.3,
                        color: 'text.primary'
                      }}>
                        {recipe.name}
                      </Typography>
                      <Chip 
                        label={recipe.difficulty || 'Medium'} 
                        color={
                          recipe.difficulty === 'Easy' ? 'success' : 
                          recipe.difficulty === 'Hard' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                    </Box>
                    
                    <Chip 
                      label={recipe.category} 
                      variant="outlined"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {recipe.servingSize} servings
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {recipe.prepTime + recipe.cookTime}min
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Cost/Portion: <strong>${recipe.calculatedCostPerPortion.toFixed(2)}</strong>
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(recipe)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(recipe)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(recipe)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <DataTable
            columns={columns}
            data={filteredRecipes.map(recipe => ({
              ...recipe,
              prepTime: `${recipe.prepTime} min`,
              cookTime: `${recipe.cookTime} min`,
              costPerPortion: `$${recipe.calculatedCostPerPortion.toFixed(2)}`,
              totalCost: `$${recipe.calculatedCost.toFixed(2)}`,
              difficulty: (
                <Chip 
                  label={recipe.difficulty || 'Medium'} 
                  color={
                    recipe.difficulty === 'Easy' ? 'success' : 
                    recipe.difficulty === 'Hard' ? 'error' : 'warning'
                  }
                  size="small"
                />
              )
            }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        )}
      </Paper>
      
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add recipe"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={onCreateRecipe}
      >
        <AddIcon />
      </Fab>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || 'Operation completed successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
}