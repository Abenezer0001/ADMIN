import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import RecipeList from '../components/inventory/RecipeList';
import RecipeForm from '../components/inventory/RecipeForm';
import RecipeDetails from '../components/inventory/RecipeDetails';
import RecipeCostAnalysis from '../components/inventory/RecipeCostAnalysis';
import { Recipe, CreateRecipeRequest } from '../services/InventoryService';
import inventoryService from '../services/InventoryService';
import { useBusiness } from '../context/BusinessContext';

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
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function RecipeManagement() {
  const { currentBusiness } = useBusiness();
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateRecipe = () => {
    setSelectedRecipe(null);
    setFormOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setFormOpen(true);
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDetailsOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedRecipe(null);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRecipe(null);
  };

  const handleSaveRecipe = async (recipeData: CreateRecipeRequest) => {
    if (!currentBusiness?._id) return;

    try {
      if (selectedRecipe) {
        // Update existing recipe
        await inventoryService.updateRecipe(selectedRecipe._id, recipeData);
      } else {
        // Create new recipe
        await inventoryService.createRecipe(recipeData);
      }
      
      // Trigger refresh of recipe list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save recipe:', error);
      throw error;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
        Recipe Management System
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Complete recipe management with cost analysis and scaling tools
      </Typography>

      {/* Tabs */}
      <Paper sx={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="recipe management tabs">
            <Tab label="Recipe Library" />
            <Tab label="Cost Analysis" />
            <Tab label="Recipe Scaling" />
            <Tab label="Nutritional Info" />
          </Tabs>
        </Box>

        {/* Recipe Library Tab */}
        <TabPanel value={tabValue} index={0}>
          <RecipeList
            key={refreshTrigger}
            onCreateRecipe={handleCreateRecipe}
            onEditRecipe={handleEditRecipe}
            onViewRecipe={handleViewRecipe}
          />
        </TabPanel>

        {/* Cost Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <RecipeCostAnalysis />
        </TabPanel>

        {/* Recipe Scaling Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Recipe Scaling Tool
            </Typography>
            <Typography color="text.secondary">
              Advanced recipe scaling functionality coming soon. This will allow you to scale recipes up or down based on desired serving sizes.
            </Typography>
          </Box>
        </TabPanel>

        {/* Nutritional Info Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Nutritional Information
            </Typography>
            <Typography color="text.secondary">
              Nutritional analysis and calorie calculations coming soon. This will provide detailed nutritional breakdowns for all your recipes.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Recipe Form Modal */}
      <RecipeForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveRecipe}
        recipe={selectedRecipe}
      />

      {/* Recipe Details Modal */}
      <RecipeDetails
        open={detailsOpen}
        onClose={handleCloseDetails}
        recipe={selectedRecipe}
        onEdit={handleEditRecipe}
      />
    </Box>
  );
}