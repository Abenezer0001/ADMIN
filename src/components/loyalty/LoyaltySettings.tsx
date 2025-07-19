"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Stack,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  LocalOffer as LocalOfferIcon,
  Schedule as ScheduleIcon,
  Stars as StarsIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { LoyaltyService } from '../../services/LoyaltyService';
import { useAuth } from '../../context/AuthContext';
import { RestaurantService } from '../../services/RestaurantService';

interface Restaurant {
  _id: string;
  name: string;
  locations: any[];
  isActive?: boolean;
}

interface TimeBasedDiscounts {
  within24Hours: number;
  within2To3Days: number;
  within4To5Days: number;
  after5Days: number;
}

interface VisitFrequencyTier {
  name: string;
  minVisits: number;
  maxVisits: number | null;
  bonus: number;
}

interface LoyaltySettingsState {
  firstTimeDiscount: number;
  timeBasedDiscounts: TimeBasedDiscounts;
  visitFrequencyTiers: VisitFrequencyTier[];
  maxDiscountCap: number;
  isEnabled: boolean;
}

const LoyaltySettings: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [settings, setSettings] = useState<LoyaltySettingsState>({
    firstTimeDiscount: 10,
    timeBasedDiscounts: {
      within24Hours: 15,
      within2To3Days: 10,
      within4To5Days: 5,
      after5Days: 0
    },
    visitFrequencyTiers: [
      { name: 'Bronze', minVisits: 1, maxVisits: 5, bonus: 2 },
      { name: 'Silver', minVisits: 6, maxVisits: 15, bonus: 5 },
      { name: 'Gold', minVisits: 16, maxVisits: 30, bonus: 8 },
      { name: 'Platinum', minVisits: 31, maxVisits: null, bonus: 10 }
    ],
    maxDiscountCap: 30,
    isEnabled: false  // Default to false instead of true
  });

  useEffect(() => {
    if (user?.businessId) {
      loadRestaurants();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadSettings();
    }
  }, [selectedRestaurantId]);

  const loadRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      setError(null);
      const restaurantData = await RestaurantService.getRestaurantsByBusiness(user?.businessId || '');
      setRestaurants(restaurantData);
      
      if (restaurantData.length > 0 && !selectedRestaurantId) {
        setSelectedRestaurantId(restaurantData[0]._id);
      }
    } catch (err) {
      console.error('Error loading restaurants:', err);
      setError('Failed to load restaurants');
      // Fallback data
      setRestaurants([
        { _id: '1', name: 'Demo Restaurant 1', locations: [], isActive: true },
        { _id: '2', name: 'Demo Restaurant 2', locations: [], isActive: true }
      ]);
      setSelectedRestaurantId('1');
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const loadSettings = async () => {
    if (!selectedRestaurantId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await LoyaltyService.getLoyaltySettings(selectedRestaurantId);
      
      if (result.success && result.data) {
        // Map API response to local state structure
        const apiSettings = result.data;
        setSettings(prev => ({
          ...prev,
          firstTimeDiscount: apiSettings.settings?.firstTimeDiscountPercent ?? prev.firstTimeDiscount,
          timeBasedDiscounts: apiSettings.settings?.timeBased ?? prev.timeBasedDiscounts,
          visitFrequencyTiers: apiSettings.settings?.frequencyTiers ?? prev.visitFrequencyTiers,
          maxDiscountCap: apiSettings.settings?.maxDiscountCap ?? prev.maxDiscountCap,
          isEnabled: Boolean(apiSettings.isEnabled) // Ensure boolean value
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRestaurantId) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const result = await LoyaltyService.updateLoyaltySettings(selectedRestaurantId, {
        isEnabled: settings.isEnabled,
        settings: {
          firstTimeDiscountPercent: settings.firstTimeDiscount,
          timeBased: settings.timeBasedDiscounts,
          frequencyTiers: settings.visitFrequencyTiers,
          maxDiscountCap: settings.maxDiscountCap,
          allowStackingWithPromotions: true
        }
      });

      if (result.success) {
        setSuccess('Loyalty program settings saved successfully!');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(result.message || 'Failed to save settings');
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    loadSettings();
  };

  const updateTimeBasedDiscount = (period: keyof TimeBasedDiscounts, value: number) => {
    setSettings(prev => ({
      ...prev,
      timeBasedDiscounts: {
        ...prev.timeBasedDiscounts,
        [period]: Math.max(0, Math.min(100, value))
      }
    }));
  };

  const updateTier = (index: number, field: keyof VisitFrequencyTier, value: any) => {
    setSettings(prev => ({
      ...prev,
      visitFrequencyTiers: prev.visitFrequencyTiers.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  const getTierColor = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      case 'platinum': return '#E5E4E2';
      default: return theme.palette.grey[500];
    }
  };

  if (loadingRestaurants) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
              Loyalty Program Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your restaurant's loyalty program rewards and tiers
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Settings">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || !selectedRestaurantId}
            sx={{ minWidth: 120 }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* Restaurant Selection */}
      {restaurants.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Restaurant</InputLabel>
            <Select
              value={selectedRestaurantId || ''}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              label="Restaurant"
            >
              <MenuItem value="">
                <em>Select a restaurant</em>
              </MenuItem>
              {restaurants.map((restaurant) => (
                <MenuItem key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {selectedRestaurantId && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Program Status */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, border: `2px solid ${theme.palette.primary.main}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: `${theme.palette.primary.main}22`,
                        color: theme.palette.primary.main
                      }}>
                        <LocalOfferIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                          Program Status
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Enable or disable the loyalty program for this restaurant
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={settings.isEnabled}
                            onChange={(e) => setSettings(prev => ({ ...prev, isEnabled: e.target.checked }))}
                            color="primary"
                          />
                        }
                        label={settings.isEnabled ? "Enabled" : "Disabled"}
                        sx={{ ml: 2 }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* First-Time Customer Discount */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: `${theme.palette.success.main}22`,
                        color: theme.palette.success.main
                      }}>
                        <LocalOfferIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        First-Time Customer Discount
                      </Typography>
                    </Stack>
                    <TextField
                      type="number"
                      value={settings.firstTimeDiscount}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        firstTimeDiscount: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      }))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      fullWidth
                      label="Discount Percentage"
                      helperText="Discount for new customers"
                      disabled={!settings.isEnabled}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Maximum Discount Cap */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%', borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: `${theme.palette.warning.main}22`,
                        color: theme.palette.warning.main
                      }}>
                        <PercentIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Maximum Discount Cap
                      </Typography>
                    </Stack>
                    <TextField
                      type="number"
                      value={settings.maxDiscountCap}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        maxDiscountCap: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                      }))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      fullWidth
                      label="Maximum Discount"
                      helperText="Maximum total discount allowed"
                      disabled={!settings.isEnabled}
                    />
                  </CardContent>
                </Card>
              </Grid>

              {/* Time-Based Return Discounts */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: `${theme.palette.info.main}22`,
                        color: theme.palette.info.main
                      }}>
                        <ScheduleIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Time-Based Return Discounts
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Set discount percentages based on how quickly customers return
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          type="number"
                          value={settings.timeBasedDiscounts.within24Hours}
                          onChange={(e) => updateTimeBasedDiscount('within24Hours', parseInt(e.target.value) || 0)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          label="Return within 24 hours"
                          disabled={!settings.isEnabled}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          type="number"
                          value={settings.timeBasedDiscounts.within2To3Days}
                          onChange={(e) => updateTimeBasedDiscount('within2To3Days', parseInt(e.target.value) || 0)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          label="Return within 2-3 days"
                          disabled={!settings.isEnabled}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          type="number"
                          value={settings.timeBasedDiscounts.within4To5Days}
                          onChange={(e) => updateTimeBasedDiscount('within4To5Days', parseInt(e.target.value) || 0)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          label="Return within 4-5 days"
                          disabled={!settings.isEnabled}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          type="number"
                          value={settings.timeBasedDiscounts.after5Days}
                          onChange={(e) => updateTimeBasedDiscount('after5Days', parseInt(e.target.value) || 0)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          fullWidth
                          label="Return after 5 days"
                          disabled={!settings.isEnabled}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Visit Frequency Tiers */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: `${theme.palette.secondary.main}22`,
                        color: theme.palette.secondary.main
                      }}>
                        <StarsIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Visit Frequency Tiers
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Configure loyalty tiers based on customer visit frequency
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {settings.visitFrequencyTiers.map((tier, index) => (
                        <Grid item xs={12} md={6} key={tier.name}>
                          <Paper sx={{ p: 2, border: `2px solid ${getTierColor(tier.name)}`, borderRadius: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                              <Chip 
                                label={tier.name}
                                sx={{ 
                                  backgroundColor: getTierColor(tier.name),
                                  color: 'white',
                                  fontWeight: 'medium'
                                }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                Visits: {tier.minVisits} - {tier.maxVisits || '∞'} | +{tier.bonus}% bonus
                              </Typography>
                            </Stack>
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <TextField
                                  type="number"
                                  value={tier.minVisits}
                                  onChange={(e) => updateTier(index, 'minVisits', parseInt(e.target.value) || 0)}
                                  fullWidth
                                  label="Min Visits"
                                  size="small"
                                  disabled={!settings.isEnabled}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  type="number"
                                  value={tier.maxVisits || ''}
                                  onChange={(e) => updateTier(index, 'maxVisits', e.target.value ? parseInt(e.target.value) : null)}
                                  fullWidth
                                  label="Max Visits"
                                  size="small"
                                  placeholder="∞"
                                  disabled={!settings.isEnabled}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  type="number"
                                  value={tier.bonus}
                                  onChange={(e) => updateTier(index, 'bonus', parseInt(e.target.value) || 0)}
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                  }}
                                  fullWidth
                                  label="Bonus"
                                  size="small"
                                  disabled={!settings.isEnabled}
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default LoyaltySettings;