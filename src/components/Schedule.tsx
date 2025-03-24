import React from 'react';
import { Box, Typography, Paper, FormControl, Select, MenuItem } from '@mui/material';

const Schedule = () => {
  const [schedule, setSchedule] = React.useState({
    openTime: '09:00 AM',
    closeTime: '10:00 PM',
    menuAvailability: 'Lunch',
    itemAvailability: 'Available',
  });

  const handleScheduleChange = (event) => {
    setSchedule({ ...schedule, [event.target.name]: event.target.value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Schedule
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Restaurant Hours</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Select
            name="openTime"
            value={schedule.openTime}
            onChange={handleScheduleChange}
          >
            <MenuItem value="09:00 AM">09:00 AM</MenuItem>
            <MenuItem value="10:00 AM">10:00 AM</MenuItem>
            <MenuItem value="11:00 AM">11:00 AM</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Select
            name="closeTime"
            value={schedule.closeTime}
            onChange={handleScheduleChange}
          >
            <MenuItem value="09:00 PM">09:00 PM</MenuItem>
            <MenuItem value="10:00 PM">10:00 PM</MenuItem>
            <MenuItem value="11:00 PM">11:00 PM</MenuItem>
          </Select>
        </FormControl>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Menu Availability</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Select
            name="menuAvailability"
            value={schedule.menuAvailability}
            onChange={handleScheduleChange}
          >
            <MenuItem value="Breakfast">Breakfast</MenuItem>
            <MenuItem value="Lunch">Lunch</MenuItem>
            <MenuItem value="Dinner">Dinner</MenuItem>
          </Select>
        </FormControl>
      </Paper>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Item Availability</Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <Select
            name="itemAvailability"
            value={schedule.itemAvailability}
            onChange={handleScheduleChange}
          >
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="86ed">86ed</MenuItem>
          </Select>
        </FormControl>
      </Paper>
    </Box>
  );
};

export default Schedule;
