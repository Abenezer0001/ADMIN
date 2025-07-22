import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Stack,
  Avatar
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  PeopleOutline as PeopleIcon,
  RestaurantMenu as RestaurantMenuIcon,
  AttachMoney as AttachMoneyIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { Recipe } from '../../services/InventoryService';
import inventoryService from '../../services/InventoryService';
import { useBusiness } from '../../context/BusinessContext';

interface RecipeDetailsProps {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  onEdit?: (recipe: Recipe) => void;
}

interface RecipeCostBreakdown {
  totalCost: number;
  costPerPortion: number;
  ingredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

export default function RecipeDetails({ 
  open, 
  onClose, 
  recipe, 
  onEdit 
}: RecipeDetailsProps) {
  const { currentBusiness } = useBusiness();
  const [costBreakdown, setCostBreakdown] = useState<RecipeCostBreakdown | null>(null);
  const [loadingCost, setLoadingCost] = useState(false);

  useEffect(() => {
    if (recipe && open && currentBusiness?._id) {
      loadCostBreakdown();
    }
  }, [recipe, open, currentBusiness?._id]);

  const loadCostBreakdown = async () => {
    if (!recipe || !currentBusiness?._id) return;
    
    try {
      setLoadingCost(true);
      const breakdown = await inventoryService.calculateRecipeCost(recipe._id, currentBusiness._id);
      setCostBreakdown(breakdown);
    } catch (err) {
      console.error('Failed to load cost breakdown:', err);
    } finally {
      setLoadingCost(false);
    }
  };

  const handleEdit = () => {
    if (recipe && onEdit) {
      onEdit(recipe);
    }
  };

  const handleDuplicate = () => {
    // TODO: Implement recipe duplication
    console.log('Duplicate recipe:', recipe);
  };

  const handleShare = () => {
    // TODO: Implement recipe sharing
    console.log('Share recipe:', recipe);
  };

  const handlePrint = () => {
    // TODO: Implement recipe printing
    window.print();
  };

  if (!recipe) return null;

  const totalTime = recipe.prepTime + recipe.cookTime;
  const difficultyColor = recipe.difficulty === 'Easy' ? 'success' : 
                         recipe.difficulty === 'Hard' ? 'error' : 'warning';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {recipe.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit Recipe">
              <IconButton onClick={handleEdit} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Duplicate Recipe">
              <IconButton onClick={handleDuplicate} color="primary">
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share Recipe">
              <IconButton onClick={handleShare} color="primary">
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Recipe">
              <IconButton onClick={handlePrint} color="primary">
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Recipe Overview */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', borderRadius: '10px' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PeopleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {recipe.servingSize}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Servings
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', borderRadius: '10px' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#1976d2' }}>
                        <AccessTimeIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {totalTime}m
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Time
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', borderRadius: '10px' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#2e7d32' }}>
                        <AttachMoneyIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          ${recipe.calculatedCostPerPortion.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cost/Portion
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', borderRadius: '10px' }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#ff9800' }}>
                        <RestaurantMenuIcon />
                      </Avatar>
                      <Box>
                        <Chip 
                          label={recipe.difficulty || 'Medium'} 
                          color={difficultyColor}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Difficulty
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Recipe Info */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '10px', height: '100%' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recipe Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                <Chip label={recipe.category} variant="outlined" size="small" sx={{ mt: 0.5 }} />
              </Box>
              
              {recipe.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {recipe.description}
                  </Typography>
                </Box>
              )}
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prep Time
                  </Typography>
                  <Typography variant="body1">
                    {recipe.prepTime} minutes
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cook Time
                  </Typography>
                  <Typography variant="body1">
                    {recipe.cookTime} minutes
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Cost Breakdown */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '10px', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Cost Analysis
                </Typography>
                <IconButton onClick={loadCostBreakdown} color="primary" size="small">
                  <CalculateIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {loadingCost ? (
                <Typography>Loading cost breakdown...</Typography>
              ) : costBreakdown ? (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Cost
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${costBreakdown.totalCost.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cost Per Portion
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${costBreakdown.costPerPortion.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Ingredient Costs
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                    {costBreakdown.ingredients.map((ingredient, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                        <Typography variant="body2">
                          {ingredient.ingredientName}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          ${ingredient.totalCost.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Click the calculate button to load cost breakdown
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Ingredients */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '10px' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Ingredients ({recipe.ingredients.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ingredient</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recipe.ingredients.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {ingredient.ingredientName || 'Unknown Ingredient'}
                        </TableCell>
                        <TableCell align="right">
                          {ingredient.quantity}
                        </TableCell>
                        <TableCell align="right">
                          {ingredient.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Instructions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: '10px' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Instructions ({recipe.instructions.length} steps)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {recipe.instructions.map((instruction, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                      <Chip 
                        label={index + 1} 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 0.5, flexShrink: 0 }}
                      />
                      <ListItemText 
                        primary={instruction}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            lineHeight: 1.5,
                            fontSize: '0.9rem'
                          }
                        }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recipe Metadata */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, borderRadius: '10px', bgcolor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recipe Version
                  </Typography>
                  <Typography variant="body2">
                    v{recipe.version}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(recipe.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(recipe.updatedAt).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button 
          onClick={handleEdit} 
          variant="contained"
          startIcon={<EditIcon />}
        >
          Edit Recipe
        </Button>
      </DialogActions>
    </Dialog>
  );
}