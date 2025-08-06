import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import { ArrowBack, Save, Delete, Schedule as ScheduleIcon } from '@mui/icons-material';
import { venueService } from '../../services/VenueService';
import RestaurantService from '../../services/RestaurantService';
import { scheduleService, Schedule, DailySchedule, CreateScheduleRequest } from '../../services/ScheduleService';

interface ServiceCharge {
  type: 'percentage' | 'flat';
  value: number;
  minAmount?: number;
  maxAmount?: number;
  enabled: boolean;
}

interface VenueFormData {
  name: string;
  description: string;
  capacity: number;
  serviceCharge?: ServiceCharge;
}

const VenueForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    description: '',
    capacity: 0,
    serviceCharge: {
      type: 'percentage',
      value: 0,
      enabled: false
    }
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Schedule state
  const [enableSchedule, setEnableSchedule] = useState(false);
  const [existingSchedule, setExistingSchedule] = useState<Schedule | null>(null);
  const [scheduleData, setScheduleData] = useState<DailySchedule[]>([
    { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '22:00' }, // Sunday
    { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Monday
    { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Tuesday
    { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Wednesday
    { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Thursday
    { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '22:00' },  // Friday
    { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '23:00' },  // Saturday
  ]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const data = await RestaurantService.getRestaurants();
        const restaurantArray = Array.isArray(data) ? data : 
          (data && typeof data === 'object' && 'restaurants' in data ? (data as any).restaurants : []);
        setRestaurants(restaurantArray);
      } catch (err: any) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const fetchVenue = async () => {
        try {
          setLoading(true);
          const venue: any = await venueService.getVenue(id);
          setFormData({
            name: venue.name || '',
            description: venue.description || '',
            capacity: venue.capacity || 0,
            serviceCharge: venue.serviceCharge || {
              type: 'percentage',
              value: 0,
              enabled: false
            }
          });
          setSelectedRestaurant(venue.restaurantId || '');

          // Check for existing schedule
          const schedules = await scheduleService.getAllSchedules({
            type: 'VENUE',
            venue: id
          });

          console.log('Fetched venue schedules:', schedules);

          if (schedules && schedules.length > 0) {
            const venueSchedule = schedules[0];
            setExistingSchedule(venueSchedule);
            setEnableSchedule(true);
            
            console.log('Found existing venue schedule:', venueSchedule);
            
            // Convert backend schedule format to frontend format
            // Backend uses 'dailySchedule' (singular), not 'dailySchedules' (plural)
            const dailyScheduleData = (venueSchedule as any).dailySchedule || (venueSchedule as any).dailySchedules;
            
            if (dailyScheduleData && Array.isArray(dailyScheduleData)) {
              console.log('Converting daily schedule data:', dailyScheduleData);
              setScheduleData(dailyScheduleData.map((day: any) => ({
                dayOfWeek: day.dayOfWeek,
                isOpen: day.isOpen,
                openTime: day.openTime || day.startTime || '09:00',
                closeTime: day.closeTime || day.endTime || '22:00'
              })));
            }
          }
        } catch (err: any) {
          console.error('Error fetching venue:', err);
          setError('Failed to load venue details');
        } finally {
          setLoading(false);
        }
      };

      fetchVenue();
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: VenueFormData) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleRestaurantChange = (e: any) => {
    setSelectedRestaurant(e.target.value);
  };

  const handleServiceChargeChange = (field: keyof ServiceCharge, value: any) => {
    setFormData((prev: VenueFormData) => ({
      ...prev,
      serviceCharge: {
        ...prev.serviceCharge!,
        [field]: field === 'value' || field === 'minAmount' || field === 'maxAmount' 
          ? parseFloat(value) || 0 
          : value
      }
    }));
  };

  const handleScheduleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnableSchedule(e.target.checked);
  };

  const handleScheduleDayChange = (dayIndex: number, field: keyof DailySchedule, value: any) => {
    setScheduleData((prev: DailySchedule[]) => {
      const newSchedule = [...prev];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        [field]: value
      };
      return newSchedule;
    });
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedRestaurant) {
      setError('Please select a restaurant');
      return;
    }

    try {
      setSaving(true);
      
      const venueData = {
        ...formData,
        restaurantId: selectedRestaurant
      };

      let venueId = id;

      if (isEdit && id) {
        await venueService.updateVenue(id, venueData);
        setSuccess('Venue updated successfully');
      } else {
        const newVenue: any = await venueService.createVenue(selectedRestaurant, venueData);
        venueId = newVenue._id;
        setSuccess('Venue created successfully');
      }

      // Handle schedule if enabled
      if (enableSchedule && venueId) {
        try {
          if (existingSchedule) {
            // Update existing schedule
            await scheduleService.updateSchedule(existingSchedule._id, {
              dailySchedules: scheduleData,
              isActive: true
            });
          } else {
            // Create new schedule
            const schedulePayload: CreateScheduleRequest = {
              name: `${formData.name} Operating Hours`,
              description: `Operating hours for ${formData.name}`,
              type: 'VENUE',
              restaurant: selectedRestaurant,
              venue: venueId,
              dailySchedules: scheduleData,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              effectiveFrom: new Date()
            };

            await scheduleService.createSchedule(schedulePayload);
          }
        } catch (scheduleErr) {
          console.error('Error managing schedule:', scheduleErr);
          // Don't throw, just log - venue was created/updated successfully
        }
      } else if (!enableSchedule && existingSchedule) {
        // Deactivate existing schedule
        try {
          await scheduleService.deactivateSchedule(existingSchedule._id);
        } catch (scheduleErr) {
          console.error('Error deactivating schedule:', scheduleErr);
        }
      }

      setTimeout(() => navigate('/venues/list'), 1000);
    } catch (err: any) {
      console.error('Error saving venue:', err);
      setError(err.message || 'Failed to save venue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/venues/list')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">{isEdit ? 'Edit Venue' : 'Create New Venue'}</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Venue Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Restaurant</InputLabel>
                      <Select
                        value={selectedRestaurant}
                        onChange={(e: SelectChangeEvent) => setSelectedRestaurant(e.target.value)}
                        label="Restaurant"
                      >
                        {restaurants.map((restaurant: any) => (
                          <MenuItem key={restaurant._id} value={restaurant._id}>
                            {restaurant.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Venue Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Service Charge" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.serviceCharge?.enabled || false}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChargeChange('enabled', e.target.checked)}
                        />
                      }
                      label="Enable Service Charge"
                    />
                  </Grid>

                  {formData.serviceCharge?.enabled && (
                    <>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Charge Type</InputLabel>
                          <Select
                            value={formData.serviceCharge.type}
                            onChange={(e: SelectChangeEvent) => handleServiceChargeChange('type', e.target.value)}
                            label="Charge Type"
                          >
                            <MenuItem value="percentage">Percentage</MenuItem>
                            <MenuItem value="flat">Flat Rate</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          type="number"
                          label={formData.serviceCharge.type === 'percentage' ? 'Percentage (%)' : 'Amount'}
                          value={formData.serviceCharge.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleServiceChargeChange('value', e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Schedule Configuration */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Operating Schedule"
                action={
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enableSchedule}
                        onChange={handleScheduleToggle}
                      />
                    }
                    label="Configure Schedule"
                  />
                }
              />
              {enableSchedule && (
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Set the operating hours for this venue. When closed, customers won't be able to access this venue.
                  </Typography>
                  <Grid container spacing={2}>
                    {scheduleData.map((day: DailySchedule, index: number) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography sx={{ width: 100 }}>{getDayName(day.dayOfWeek)}</Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={day.isOpen}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleDayChange(index, 'isOpen', e.target.checked)}
                              />
                            }
                            label="Open"
                            sx={{ mr: 2 }}
                          />
                          {day.isOpen && (
                            <>
                              <TextField
                                type="time"
                                label="Opens"
                                value={day.openTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleDayChange(index, 'openTime', e.target.value)}
                                size="small"
                                sx={{ width: 150 }}
                              />
                              <TextField
                                type="time"
                                label="Closes"
                                value={day.closeTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleScheduleDayChange(index, 'closeTime', e.target.value)}
                                size="small"
                                sx={{ width: 150 }}
                              />
                            </>
                          )}
                        </Box>
                        {index < scheduleData.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              )}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/venues/list')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : (isEdit ? 'Update' : 'Create')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default VenueForm;
