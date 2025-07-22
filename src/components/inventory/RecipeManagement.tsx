import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Tab,
  Tabs
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DataTable from '../common/DataTable';
import { useBusiness } from '../../context/BusinessContext';
import inventoryService, { Recipe } from '../../services/InventoryService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recipe-tabpanel-${index}`}
      aria-labelledby={`recipe-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const columns = [
  { header: 'Name', accessorKey: 'name' },
  { header: 'Category', accessorKey: 'category' },
  { header: 'Serving Size', accessorKey: 'servingSize' },
  { header: 'Prep Time', accessorKey: 'prepTime' },
  { header: 'Cook Time', accessorKey: 'cookTime' },
  { header: 'Difficulty', accessorKey: 'difficulty' },
  { header: 'Cost per Portion', accessorKey: 'costPerPortion' },
  { header: 'Total Cost', accessorKey: 'totalCost' }
];

export default function RecipeManagement() {
  const { currentBusiness } = useBusiness();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = (recipe: Recipe) => {
    console.log('Edit recipe:', recipe);
    // TODO: Open edit modal
  };

  const handleDelete = async (recipe: Recipe) => {
    if (!currentBusiness?._id) return;
    
    try {
      await inventoryService.deleteRecipe(recipe._id, currentBusiness._id);
      setSnackbarOpen(true);
      await loadRecipesData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to delete recipe');
      setSnackbarOpen(true);
    }
  };

  const handleView = (recipe: Recipe) => {
    console.log('View recipe:', recipe);
    // TODO: Open detail view
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
  
  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Recipe Management
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your recipes and calculate food costs
      </Typography>

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

      {/* Tabs */}
      <Paper sx={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="recipe management tabs">
            <Tab label="All Recipes" />
            <Tab label="Recipe Calculator" />
            <Tab label="Cost Analysis" />
          </Tabs>
        </Box>

        {/* All Recipes Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Recipe Library
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
              />
              <IconButton 
                onClick={handleRefresh}
                color="primary"
                disabled={loading}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                color="primary"
                disabled={loading}
              >
                Add Recipe
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ overflowX: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
              </Box>
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
          </Box>
        </TabPanel>

        {/* Recipe Calculator Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Recipe Cost Calculator
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Recipe calculator feature coming soon. This will allow you to calculate recipe costs based on current ingredient prices.
          </Alert>
        </TabPanel>

        {/* Cost Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Recipe Cost Analysis
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Cost analysis feature coming soon. This will provide detailed cost breakdowns and profitability analysis for your recipes.
          </Alert>
        </TabPanel>
      </Paper>
      
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