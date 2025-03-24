import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from '@mui/material';

const TableSettings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Table Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Default Table Type</InputLabel>
              <Select
                value="seat"
                label="Default Table Type"
              >
                <MenuItem value="seat">Seat</MenuItem>
                <MenuItem value="table">Table</MenuItem>
                <MenuItem value="booth">Booth</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Default Zone</InputLabel>
              <Select
                value="club"
                label="Default Zone"
              >
                <MenuItem value="club">Club</MenuItem>
                <MenuItem value="vip">VIP</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Table Name Prefix"
              defaultValue="I-"
              helperText="This prefix will be added to all new table names"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Default Guest Capacity"
              defaultValue={4}
              helperText="Default number of guests per table"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined">
                Reset to Defaults
              </Button>
              <Button variant="contained">
                Save Settings
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TableSettings;
