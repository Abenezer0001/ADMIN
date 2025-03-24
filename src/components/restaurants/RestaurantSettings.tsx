import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Switch, 
  FormControlLabel, 
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField
} from '@mui/material';

function RestaurantSettings() {
  const [settings, setSettings] = useState({
    multiRestaurantMode: false,
    defaultCurrency: 'USD',
    taxRate: 0,
    serviceCharge: 0,
    defaultTimeZone: 'UTC',
    notificationPreferences: {
      email: true,
      sms: false,
      pushNotifications: true
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleSwitch = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Restaurant Settings:', settings);
    // TODO: Implement save settings logic
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Restaurant Settings
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.multiRestaurantMode}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      multiRestaurantMode: e.target.checked
                    }))}
                    name="multiRestaurantMode"
                  />
                }
                label="Multi-Restaurant Mode"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Default Currency</InputLabel>
                <Select
                  name="defaultCurrency"
                  value={settings.defaultCurrency}
                  label="Default Currency"
                  onChange={handleChange}
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Default Time Zone</InputLabel>
                <Select
                  name="defaultTimeZone"
                  value={settings.defaultTimeZone}
                  label="Default Time Zone"
                  onChange={handleChange}
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">EST</MenuItem>
                  <MenuItem value="PST">PST</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                name="taxRate"
                type="number"
                value={settings.taxRate}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Charge (%)"
                name="serviceCharge"
                type="number"
                value={settings.serviceCharge}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationPreferences.email}
                        onChange={handleToggleSwitch}
                        name="email"
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationPreferences.sms}
                        onChange={handleToggleSwitch}
                        name="sms"
                      />
                    }
                    label="SMS Notifications"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationPreferences.pushNotifications}
                        onChange={handleToggleSwitch}
                        name="pushNotifications"
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Save Restaurant Settings
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default RestaurantSettings;
