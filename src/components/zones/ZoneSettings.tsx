import React from 'react';
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
  TextField,
  Alert,
  Box
} from '@mui/material';

function ZoneSettings() {
  // @ts-ignore
  const [settings, setSettings] = React.useState({
    autoAssignTables: false,
    maxCapacityPerTable: 8,
    defaultReservationDuration: 90,
    allowOverBooking: false,
    notificationPreferences: {
      email: true,
      sms: false,
      pushNotifications: true
    }
  });

  // @ts-ignore
  const [saved, setSaved] = React.useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleSwitch = (e: any) => {
    const { name, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked
        }
      }));
    } else {
      setSettings((prev: any) => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log('Zone Settings:', settings);
    // TODO: Implement save settings logic
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Zone Settings
        </Typography>
        
        {saved && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Settings saved successfully!
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoAssignTables}
                    onChange={handleToggleSwitch}
                    name="autoAssignTables"
                  />
                }
                label="Auto-assign Tables"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Automatically assign tables to reservations based on party size
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Capacity Per Table"
                name="maxCapacityPerTable"
                type="number"
                value={settings.maxCapacityPerTable}
                onChange={handleChange}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default Reservation Duration (minutes)"
                name="defaultReservationDuration"
                type="number"
                value={settings.defaultReservationDuration}
                onChange={handleChange}
                inputProps={{ min: 30, step: 15 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowOverBooking}
                    onChange={handleToggleSwitch}
                    name="allowOverBooking"
                  />
                }
                label="Allow Overbooking"
              />
              <Typography variant="caption" color="textSecondary" display="block">
                Allow reservations to exceed zone capacity
              </Typography>
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
                        name="notificationPreferences.email"
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
                        name="notificationPreferences.sms"
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
                        name="notificationPreferences.pushNotifications"
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Save Zone Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default ZoneSettings;