import React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Skeleton,
  Fab,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  Kitchen,
  Add,
  Edit,
  Delete,
  Person,
  Restaurant,
  Schedule,
  TrendingUp,
  ExpandMore,
  PlayArrow,
  Stop,
  Settings,
  Group,
  Print,
  Computer
} from '@mui/icons-material';
import { kitchenService } from '../services/KitchenService';
import RestaurantVenueSelector from '../components/common/RestaurantVenueSelector';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

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
      id={`kitchen-tabpanel-${index}`}
      aria-labelledby={`kitchen-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const KitchenManagement: React.FC = () => {
  const { user } = useAuth();
  const { 
    selectedRestaurantId: globalRestaurantId, 
    selectedVenueId: globalVenueId,
    selectedBusinessId: globalBusinessId,
    setSelectedBusiness,
    setSelectedRestaurant,
    setSelectedVenue
  } = useRestaurant();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [kitchens, setKitchens] = useState<any[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<any>(null);
  
  // Use global context values with fallback to user context
  const selectedBusinessId = globalBusinessId || user?.businessId || '';
  const selectedRestaurantId = globalRestaurantId || '';
  const selectedVenueId = globalVenueId || '';
  
  
  // Dialog states
  const [kitchenDialogOpen, setKitchenDialogOpen] = useState(false);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [editingKitchen, setEditingKitchen] = useState<any>(null);
  
  // Form states
  const [kitchenForm, setKitchenForm] = useState({
    name: '',
    description: '',
    kitchenType: 'MAIN',
    restaurantId: '',
    venueIds: [],
    maxCapacity: 50,
    isActive: true,
    workingHours: {
      monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      saturday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
      sunday: { isOpen: true, openTime: '06:00', closeTime: '22:00' }
    }
  });

  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    position: 'CHEF',
    experienceLevel: 'INTERMEDIATE',
    hourlyRate: 20
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    type: 'OVEN',
    model: '',
    manufacturer: '',
    serialNumber: '',
    installationDate: '',
    warrantyExpiry: '',
    isActive: true
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update business ID when user is available
  useEffect(() => {
    if (user?.businessId && !selectedBusinessId) {
      setSelectedBusiness(user.businessId);
    }
  }, [user]);

  useEffect(() => {
    loadKitchens();
  }, [selectedBusinessId, selectedRestaurantId, selectedVenueId]);

  const loadKitchens = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (selectedRestaurantId) filters.restaurant = selectedRestaurantId;
      if (selectedVenueId) filters.venue = selectedVenueId;
      
      console.log('Loading kitchens with filters:', filters);
      const response = await kitchenService.getAllKitchens(filters);
      // Backend returns { success: true, kitchens: [...], total: number }
      console.log('Kitchen response:', response);
      setKitchens(response.kitchens || response);
    } catch (error: any) {
      setError('Failed to load kitchens: ' + error.message);
      console.error('Error loading kitchens:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKitchenDetails = async (kitchenId: string) => {
    try {
      const response = await kitchenService.getKitchenById(kitchenId);
      // Backend returns { success: true, kitchen: {...} }
      setSelectedKitchen(response.kitchen || response);
    } catch (error: any) {
      setError('Failed to load kitchen details: ' + error.message);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateKitchen = async () => {
    try {
      // Ensure all required fields are present
      if (!kitchenForm.name) {
        setError('Kitchen name is required');
        return;
      }

      if (!kitchenForm.restaurantId) {
        setError('Restaurant is required');
        return;
      }

      if (!kitchenForm.venueIds || kitchenForm.venueIds.length === 0) {
        setError('Venue is required');
        return;
      }

      // Transform workingHours from object format to array format expected by backend
      const workingHoursArray = Object.entries(kitchenForm.workingHours).map(([dayName, hours], index) => {
        const dayMap: { [key: string]: number } = {
          sunday: 0, monday: 1, tuesday: 2, wednesday: 3, 
          thursday: 4, friday: 5, saturday: 6
        };
        
        return {
          dayOfWeek: dayMap[dayName] ?? index,
          startTime: (hours as any).openTime || '06:00',
          endTime: (hours as any).closeTime || '22:00',
          isOpen: (hours as any).isOpen !== false
        };
      });

      const kitchenPayload = {
        name: kitchenForm.name,
        description: kitchenForm.description,
        kitchenType: kitchenForm.kitchenType,
        restaurantId: kitchenForm.restaurantId,
        venueId: kitchenForm.venueIds[0], // Backend expects venueId (singular)
        maxStaffCapacity: kitchenForm.maxCapacity,
        isActive: kitchenForm.isActive,
        workingHours: workingHoursArray
      };

      console.log('Creating kitchen with payload:', kitchenPayload);

      if (editingKitchen) {
        await kitchenService.updateKitchen(editingKitchen._id, kitchenPayload);
        setSuccess('Kitchen updated successfully');
      } else {
        await kitchenService.createKitchen(kitchenPayload);
        setSuccess('Kitchen created successfully');
      }

      setKitchenDialogOpen(false);
      setEditingKitchen(null);
      resetKitchenForm();
      loadKitchens();
    } catch (error: any) {
      setError('Failed to save kitchen: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddStaff = async () => {
    try {
      if (!selectedKitchen || !staffForm.firstName || !staffForm.lastName || !staffForm.email) {
        setError('Please fill in all required fields');
        return;
      }

      await kitchenService.addStaffToKitchen(selectedKitchen._id, staffForm);
      setSuccess('Staff member added successfully');
      setStaffDialogOpen(false);
      resetStaffForm();
      loadKitchenDetails(selectedKitchen._id);
    } catch (error: any) {
      setError('Failed to add staff: ' + error.message);
    }
  };

  const handleDeleteKitchen = async (kitchenId: string) => {
    if (window.confirm('Are you sure you want to delete this kitchen?')) {
      try {
        await kitchenService.deleteKitchen(kitchenId);
        setSuccess('Kitchen deleted successfully');
        loadKitchens();
      } catch (error: any) {
        setError('Failed to delete kitchen: ' + error.message);
      }
    }
  };

  const handleToggleKitchenStatus = async (kitchenId: string, isActive: boolean) => {
    try {
      // Convert boolean to valid status string
      const status = isActive ? 'OPEN' : 'CLOSED';
      await kitchenService.updateKitchenStatus(kitchenId, status);
      setSuccess('Kitchen status updated successfully');
      loadKitchens();
      if (selectedKitchen?._id === kitchenId) {
        loadKitchenDetails(kitchenId);
      }
    } catch (error: any) {
      setError('Failed to update kitchen status: ' + error.message);
    }
  };

  const resetKitchenForm = () => {
    setKitchenForm({
      name: '',
      description: '',
      kitchenType: 'MAIN',
      restaurantId: '',
      venueIds: [],
      maxCapacity: 50,
      isActive: true,
      workingHours: {
        monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        saturday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        sunday: { isOpen: true, openTime: '06:00', closeTime: '22:00' }
      }
    });
  };

  const resetStaffForm = () => {
    setStaffForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phoneNumber: '',
      position: 'CHEF',
      experienceLevel: 'INTERMEDIATE',
      hourlyRate: 20
    });
  };

  const openKitchenDialog = (kitchen?: any) => {
    // Ensure business ID is set for restaurant admins
    if (user?.businessId && !selectedBusinessId) {
      setSelectedBusiness(user.businessId);
    }
    
    if (kitchen) {
      setEditingKitchen(kitchen);
      setKitchenForm({
        name: kitchen.name || '',
        description: kitchen.description || '',
        kitchenType: kitchen.kitchenType || 'MAIN',
        restaurantId: kitchen.restaurantId || '',
        venueIds: kitchen.venueIds || [],
        maxCapacity: kitchen.maxCapacity || 50,
        isActive: kitchen.isActive !== false,
        workingHours: kitchen.workingHours || kitchenForm.workingHours
      });
    } else {
      setEditingKitchen(null);
      resetKitchenForm();
    }
    setKitchenDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'busy': return 'warning';
      case 'offline': return 'error';
      case 'maintenance': return 'info';
      default: return 'default';
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 90) return 'error';
    if (load >= 70) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Kitchen sx={{ fontSize: 32 }} />
        <Typography variant="h5" component="h1" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
          Kitchen Management
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filters
          </Typography>
          <RestaurantVenueSelector
            selectedBusinessId={selectedBusinessId}
            selectedRestaurantId={selectedRestaurantId}
            selectedVenueId={selectedVenueId}
            onBusinessChange={setSelectedBusiness}
            onRestaurantChange={setSelectedRestaurant}
            onVenueChange={setSelectedVenue}
            showBusinessSelector={true}
            showVenueSelector={true}
            size="small"
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Kitchens Overview" />
            <Tab label="Kitchen Details" />
            <Tab label="Performance Analytics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">All Kitchens</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => openKitchenDialog()}
            >
              Add Kitchen
            </Button>
          </Box>

          {loading ? (
            <Box>
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={80} sx={{ mb: 2 }} />
              ))}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {kitchens.map((kitchen) => (
                <Grid item xs={12} md={6} lg={4} key={kitchen._id}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => {
                    setSelectedKitchen(kitchen);
                    setTabValue(1);
                    loadKitchenDetails(kitchen._id);
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          {kitchen.name}
                        </Typography>
                        <Chip
                          label={kitchen.status || 'ACTIVE'}
                          color={getStatusColor(kitchen.status || 'ACTIVE')}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {kitchen.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Chip label={kitchen.kitchenType} size="small" variant="outlined" />
                        <Typography variant="body2">
                          Staff: {kitchen.staffCount || 0}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2">Load</Typography>
                          <Typography variant="body2">{kitchen.currentLoad || 0}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={kitchen.currentLoad || 0}
                          color={getLoadColor(kitchen.currentLoad || 0)}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              openKitchenDialog(kitchen);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteKitchen(kitchen._id);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                        <Switch
                          checked={kitchen.isActive !== false}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleKitchenStatus(kitchen._id, e.target.checked);
                          }}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {selectedKitchen ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">{selectedKitchen.name} - Details</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Group />}
                    onClick={() => setStaffDialogOpen(true)}
                  >
                    Add Staff
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Computer />}
                    onClick={() => setEquipmentDialogOpen(true)}
                  >
                    Add Equipment
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Kitchen Information
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Type:</strong> {selectedKitchen.kitchenType}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Capacity:</strong> {selectedKitchen.maxCapacity} orders
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Current Load:</strong> {selectedKitchen.currentLoad || 0}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> 
                        <Chip
                          label={selectedKitchen.status || 'ACTIVE'}
                          color={getStatusColor(selectedKitchen.status || 'ACTIVE')}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Performance Metrics
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Orders Today:</strong> {selectedKitchen.performance?.ordersToday || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Avg Prep Time:</strong> {selectedKitchen.performance?.averagePrepTime || 0} min
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Success Rate:</strong> {selectedKitchen.performance?.successRate || 0}%
                      </Typography>
                      <Typography variant="body2">
                        <strong>Efficiency Score:</strong> {selectedKitchen.performance?.efficiencyScore || 0}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Kitchen Staff
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Position</TableCell>
                              <TableCell>Experience</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedKitchen.staff?.map((staff: any) => (
                              <TableRow key={staff._id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar>{staff.firstName?.[0]}{staff.lastName?.[0]}</Avatar>
                                    {staff.firstName} {staff.lastName}
                                  </Box>
                                </TableCell>
                                <TableCell>{staff.position}</TableCell>
                                <TableCell>{staff.experienceLevel}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={staff.isActive ? 'Active' : 'Inactive'}
                                    color={staff.isActive ? 'success' : 'default'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton size="small">
                                    <Edit />
                                  </IconButton>
                                  <IconButton size="small" color="error">
                                    <Delete />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Select a kitchen to view details
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Performance Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Total Orders Today
                  </Typography>
                  <Typography variant="h3">
                    {kitchens.reduce((sum, k) => sum + (k.performance?.ordersToday || 0), 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Average Prep Time
                  </Typography>
                  <Typography variant="h3">
                    {Math.round(kitchens.reduce((sum, k) => sum + (k.performance?.averagePrepTime || 0), 0) / kitchens.length) || 0} min
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Overall Efficiency
                  </Typography>
                  <Typography variant="h3">
                    {Math.round(kitchens.reduce((sum, k) => sum + (k.performance?.efficiencyScore || 0), 0) / kitchens.length) || 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>

      {/* Kitchen Dialog */}
      <Dialog open={kitchenDialogOpen} onClose={() => setKitchenDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingKitchen ? 'Edit Kitchen' : 'Add Kitchen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Kitchen Name"
                value={kitchenForm.name}
                onChange={(e) => setKitchenForm({...kitchenForm, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Kitchen Type</InputLabel>
                <Select
                  value={kitchenForm.kitchenType}
                  onChange={(e) => setKitchenForm({...kitchenForm, kitchenType: e.target.value})}
                >
                  <MenuItem value="MAIN">Main Kitchen</MenuItem>
                  <MenuItem value="PREP">Prep Kitchen</MenuItem>
                  <MenuItem value="BAKERY">Bakery</MenuItem>
                  <MenuItem value="BEVERAGE">Beverage Station</MenuItem>
                  <MenuItem value="DESSERT">Dessert Station</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={kitchenForm.description}
                onChange={(e) => setKitchenForm({...kitchenForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Select Restaurant and Venue
              </Typography>
              <RestaurantVenueSelector
                selectedBusinessId={selectedBusinessId}
                selectedRestaurantId={kitchenForm.restaurantId}
                selectedVenueId={kitchenForm.venueIds[0] || ''}
                onBusinessChange={(businessId) => {
                  // Business change doesn't affect kitchen form directly
                }}
                onRestaurantChange={(restaurantId) => 
                  setKitchenForm({...kitchenForm, restaurantId})
                }
                onVenueChange={(venueId) => 
                  setKitchenForm({...kitchenForm, venueIds: venueId ? [venueId] : []})
                }
                showBusinessSelector={true}
                showVenueSelector={true}
                size="small"
                required={true}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Capacity"
                type="number"
                value={kitchenForm.maxCapacity}
                onChange={(e) => setKitchenForm({...kitchenForm, maxCapacity: parseInt(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={kitchenForm.isActive}
                    onChange={(e) => setKitchenForm({...kitchenForm, isActive: e.target.checked})}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKitchenDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateKitchen} variant="contained">
            {editingKitchen ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Dialog */}
      <Dialog open={staffDialogOpen} onClose={() => setStaffDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Kitchen Staff</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                value={staffForm.firstName}
                onChange={(e) => setStaffForm({...staffForm, firstName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={staffForm.lastName}
                onChange={(e) => setStaffForm({...staffForm, lastName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={staffForm.password}
                onChange={(e) => setStaffForm({...staffForm, password: e.target.value})}
                required
                helperText="Password for the staff member's account"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={staffForm.phoneNumber}
                onChange={(e) => setStaffForm({...staffForm, phoneNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  value={staffForm.position}
                  onChange={(e) => setStaffForm({...staffForm, position: e.target.value})}
                >
                  <MenuItem value="HEAD_CHEF">Head Chef</MenuItem>
                  <MenuItem value="SOUS_CHEF">Sous Chef</MenuItem>
                  <MenuItem value="CHEF">Chef</MenuItem>
                  <MenuItem value="LINE_COOK">Line Cook</MenuItem>
                  <MenuItem value="PREP_COOK">Prep Cook</MenuItem>
                  <MenuItem value="KITCHEN_ASSISTANT">Kitchen Assistant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={staffForm.experienceLevel}
                  onChange={(e) => setStaffForm({...staffForm, experienceLevel: e.target.value})}
                >
                  <MenuItem value="BEGINNER">Beginner</MenuItem>
                  <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                  <MenuItem value="EXPERIENCED">Experienced</MenuItem>
                  <MenuItem value="EXPERT">Expert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hourly Rate ($)"
                type="number"
                value={staffForm.hourlyRate}
                onChange={(e) => setStaffForm({...staffForm, hourlyRate: parseFloat(e.target.value)})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStaffDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddStaff} variant="contained">
            Add Staff
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KitchenManagement; 