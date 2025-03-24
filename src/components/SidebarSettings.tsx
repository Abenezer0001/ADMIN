import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Switch, 
  FormControlLabel, 
  Button,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  TextField
} from '@mui/material';
import { 
  useTheme, 
  ThemeProvider, 
  createTheme 
} from '@mui/material/styles';

function SidebarSettings() {
  const theme = useTheme();
  const [sidebarSettings, setSidebarSettings] = useState({
    width: 250,
    opacity: 0.9,
    backgroundColor: theme.palette.background.default,
    showIcons: true,
    compactMode: false,
    customScrollbar: true,
    animatedHover: true,
    themeMode: theme.palette.mode
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSidebarSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (name) => (e, newValue) => {
    setSidebarSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleToggleSwitch = (e) => {
    const { name, checked } = e.target;
    setSidebarSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleColorChange = (e) => {
    setSidebarSettings(prev => ({
      ...prev,
      backgroundColor: e.target.value
    }));
  };

  const handleThemeModeChange = (mode) => {
    setSidebarSettings(prev => ({
      ...prev,
      themeMode: mode
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sidebar Settings:', sidebarSettings);
    // TODO: Implement save settings logic
    // You might want to dispatch these settings to a global state
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Sidebar Customization
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Sidebar Width */}
            <Grid item xs={12}>
              <Typography gutterBottom>
                Sidebar Width: {sidebarSettings.width}px
              </Typography>
              <Slider
                value={sidebarSettings.width}
                onChange={handleSliderChange('width')}
                min={200}
                max={400}
                valueLabelDisplay="auto"
              />
            </Grid>

            {/* Sidebar Opacity */}
            <Grid item xs={12}>
              <Typography gutterBottom>
                Sidebar Opacity: {sidebarSettings.opacity * 100}%
              </Typography>
              <Slider
                value={sidebarSettings.opacity}
                onChange={handleSliderChange('opacity')}
                min={0.5}
                max={1}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Grid>

            {/* Background Color */}
            <Grid item xs={12}>
              <Typography gutterBottom>
                Background Color
              </Typography>
              <TextField
                type="color"
                value={sidebarSettings.backgroundColor}
                onChange={handleColorChange}
                fullWidth
                variant="outlined"
              />
            </Grid>

            {/* Toggle Switches */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sidebarSettings.showIcons}
                        onChange={handleToggleSwitch}
                        name="showIcons"
                      />
                    }
                    label="Show Icons"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sidebarSettings.compactMode}
                        onChange={handleToggleSwitch}
                        name="compactMode"
                      />
                    }
                    label="Compact Mode"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sidebarSettings.customScrollbar}
                        onChange={handleToggleSwitch}
                        name="customScrollbar"
                      />
                    }
                    label="Custom Scrollbar"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sidebarSettings.animatedHover}
                        onChange={handleToggleSwitch}
                        name="animatedHover"
                      />
                    }
                    label="Animated Hover"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Theme Mode */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Theme Mode</InputLabel>
                <Select
                  value={sidebarSettings.themeMode}
                  label="Theme Mode"
                  onChange={(e) => handleThemeModeChange(e.target.value)}
                >
                  <MenuItem value="light">Light Mode</MenuItem>
                  <MenuItem value="dark">Dark Mode</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Apply Sidebar Settings
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default SidebarSettings;
