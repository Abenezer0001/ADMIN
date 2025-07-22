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
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useBusiness } from '../../context/BusinessContext';
import inventoryService, { Recipe } from '../../services/InventoryService';

interface CostAnalysisData {
  recipe: Recipe;
  costBreakdown: {
    totalCost: number;
    costPerPortion: number;
    ingredients: Array<{
      ingredientId: string;
      ingredientName: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      percentage: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function RecipeCostAnalysis() {
  const { currentBusiness } = useBusiness();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string>('');
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Load recipes
  const loadRecipes = useCallback(async () => {
    if (!currentBusiness?._id) return;
    
    try {
      setLoadingRecipes(true);
      const recipesData = await inventoryService.getRecipes(currentBusiness._id);
      setRecipes(recipesData);
      if (recipesData.length > 0 && !selectedRecipe) {
        setSelectedRecipe(recipesData[0]._id);
      }
    } catch (err: any) {
      console.error('Failed to load recipes:', err);
      setError(err.message || 'Failed to load recipes');
      setSnackbarOpen(true);
    } finally {
      setLoadingRecipes(false);
    }
  }, [currentBusiness?._id, selectedRecipe]);

  // Load cost analysis for selected recipe
  const loadCostAnalysis = useCallback(async () => {
    if (!selectedRecipe || !currentBusiness?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const recipe = recipes.find(r => r._id === selectedRecipe);
      if (!recipe) return;
      
      const costBreakdown = await inventoryService.calculateRecipeCost(selectedRecipe, currentBusiness._id);
      
      // Calculate percentages
      const ingredientsWithPercentage = costBreakdown.ingredients.map(ingredient => ({
        ...ingredient,
        percentage: (ingredient.totalCost / costBreakdown.totalCost) * 100
      }));
      
      setCostAnalysis({
        recipe,
        costBreakdown: {
          ...costBreakdown,
          ingredients: ingredientsWithPercentage
        }
      });
      
    } catch (err: any) {
      console.error('Failed to load cost analysis:', err);
      setError(err.message || 'Failed to load cost analysis');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [selectedRecipe, currentBusiness?._id, recipes]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    if (selectedRecipe) {
      loadCostAnalysis();
    }
  }, [loadCostAnalysis]);

  const handleRecipeChange = (event: any) => {
    setSelectedRecipe(event.target.value);
  };

  const handleRefresh = () => {
    loadCostAnalysis();
  };

  const handleExport = () => {
    if (!costAnalysis) return;
    
    // Create CSV content
    const csvContent = [
      ['Recipe Cost Analysis'],
      ['Recipe Name', costAnalysis.recipe.name],
      ['Category', costAnalysis.recipe.category],
      ['Serving Size', costAnalysis.recipe.servingSize.toString()],
      ['Total Cost', `$${costAnalysis.costBreakdown.totalCost.toFixed(2)}`],
      ['Cost Per Portion', `$${costAnalysis.costBreakdown.costPerPortion.toFixed(2)}`],
      [''],
      ['Ingredient Breakdown'],
      ['Ingredient', 'Quantity', 'Unit Cost', 'Total Cost', 'Percentage'],
      ...costAnalysis.costBreakdown.ingredients.map(ing => [
        ing.ingredientName,
        ing.quantity.toString(),
        `$${ing.unitCost.toFixed(2)}`,
        `$${ing.totalCost.toFixed(2)}`,
        `${ing.percentage.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${costAnalysis.recipe.name}_cost_analysis.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setError(null);
  };

  // Prepare chart data
  const pieChartData = costAnalysis?.costBreakdown.ingredients.map(ingredient => ({
    name: ingredient.ingredientName,
    value: ingredient.totalCost,
    percentage: ingredient.percentage
  })) || [];

  const barChartData = costAnalysis?.costBreakdown.ingredients
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 10)
    .map(ingredient => ({
      name: ingredient.ingredientName.length > 15 
        ? ingredient.ingredientName.substring(0, 15) + '...' 
        : ingredient.ingredientName,
      cost: ingredient.totalCost,
      percentage: ingredient.percentage
    })) || [];

  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Alert severity="info">Please select a business to view cost analysis.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
            Recipe Cost Analysis
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Detailed cost breakdown and analysis for your recipes
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Select Recipe</InputLabel>
            <Select
              value={selectedRecipe}
              onChange={handleRecipeChange}
              label="Select Recipe"
              disabled={loadingRecipes}
            >
              {recipes.map((recipe) => (
                <MenuItem key={recipe._id} value={recipe._id}>
                  {recipe.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh Analysis">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to CSV">
            <IconButton onClick={handleExport} disabled={!costAnalysis}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loadingRecipes ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Calculating cost analysis...</Typography>
        </Box>
      ) : costAnalysis ? (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AttachMoneyIcon />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        Total Cost
                      </Typography>
                    </Stack>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${costAnalysis.costBreakdown.totalCost.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete recipe cost
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#2e7d32' }}>
                        <CalculateIcon />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        Cost Per Portion
                      </Typography>
                    </Stack>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                      ${costAnalysis.costBreakdown.costPerPortion.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Per serving cost
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#1976d2' }}>
                        <AssessmentIcon />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        Ingredients
                      </Typography>
                    </Stack>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {costAnalysis.costBreakdown.ingredients.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total ingredients
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#ff9800' }}>
                        <PieChartIcon />
                      </Avatar>
                      <Typography variant="h6" component="div">
                        Profit Margin
                      </Typography>
                    </Stack>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                      30%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Suggested margin
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Cost Distribution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => [`$${value.toFixed(2)}`, 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Top 10 Most Expensive Ingredients
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any) => [`$${value.toFixed(2)}`, 'Cost']} />
                  <Bar dataKey="cost" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Detailed Breakdown Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" gutterBottom>
                Detailed Cost Breakdown
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ingredient</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Cost</TableCell>
                      <TableCell align="right">Total Cost</TableCell>
                      <TableCell align="right">% of Recipe</TableCell>
                      <TableCell align="center">Impact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {costAnalysis.costBreakdown.ingredients
                      .sort((a, b) => b.totalCost - a.totalCost)
                      .map((ingredient, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {ingredient.ingredientName}
                          </TableCell>
                          <TableCell align="right">
                            {ingredient.quantity}
                          </TableCell>
                          <TableCell align="right">
                            ${ingredient.unitCost.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              ${ingredient.totalCost.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {ingredient.percentage.toFixed(1)}%
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              icon={ingredient.percentage > 20 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              label={ingredient.percentage > 20 ? 'High' : ingredient.percentage > 10 ? 'Medium' : 'Low'}
                              color={ingredient.percentage > 20 ? 'error' : ingredient.percentage > 10 ? 'warning' : 'success'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Alert severity="info">
            {recipes.length === 0 
              ? 'No recipes found. Create some recipes first.' 
              : 'Select a recipe to view cost analysis.'
            }
          </Alert>
        </Box>
      )}

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
          {error || 'Analysis completed successfully!'}
        </Alert>
      </Snackbar>
    </Box>
  );
}