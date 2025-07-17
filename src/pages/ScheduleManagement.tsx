import React, { useState, useEffect } from 'react';
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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Schedule,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Schedule as ScheduleIcon,
  Restaurant,
  Kitchen,
  Business,
  ExpandMore,
  PlayArrow,
  Stop,
  Pending,
  AccessTime,
  Today,
  Event,
  Warning,
  Info
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { scheduleService, Schedule as ScheduleType, CreateScheduleRequest, ScheduleException, DailySchedule } from '../services/ScheduleService';
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
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ScheduleManagement: React.FC = () => {
  const { user } = useAuth();
  const { 
    selectedRestaurantId: globalRestaurantId, 
    selectedVenueId: globalVenueId,
    selectedBusinessId: globalBusinessId 
  } = useRestaurant();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);
  
  // Dialog states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleType | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  
  // Local state for IDs with fallback to global context
  const [selectedBusinessId, setSelectedBusinessId] = useState(globalBusinessId || user?.businessId || '');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(globalRestaurantId || '');
  const [selectedVenueId, setSelectedVenueId] = useState(globalVenueId || '');
  
  // Form states
  const [scheduleForm, setScheduleForm] = useState<CreateScheduleRequest>({
    name: '',
    description: '',
    type: 'RESTAURANT',
    restaurant: '',
    venue: '',
    kitchen: '',
    menuItems: [],
    dailySchedules: [
      { dayOfWeek: 1, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
      { dayOfWeek: 2, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
      { dayOfWeek: 3, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
      { dayOfWeek: 4, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
      { dayOfWeek: 5, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
      { dayOfWeek: 6, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
      { dayOfWeek: 0, isOpen: true, openTime: '08:00', closeTime: '20:00', breaks: [] }
    ],
    exceptions: [],
    timezone: 'America/New_York',
    effectiveFrom: new Date()
  });

  const [exceptionForm, setExceptionForm] = useState<ScheduleException>({
    date: new Date(),
    isOpen: false,
    openTime: '',
    closeTime: '',
    reason: '',
    type: 'HOLIDAY'
  });

  const [approvalForm, setApprovalForm] = useState({
    action: 'approve',
    comments: '',
    reason: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSchedules();
  }, [filterType, filterStatus]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterType) filters.type = filterType;
      if (filterStatus) filters.approvalStatus = filterStatus;
      
      const response = await scheduleService.getAllSchedules(filters);
      setSchedules(Array.isArray(response) ? response : []);
    } catch (error: any) {
      setError('Failed to load schedules: ' + error.message);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleDetails = async (scheduleId: string) => {
    try {
      const response = await scheduleService.getScheduleById(scheduleId);
      setSelectedSchedule(response);
    } catch (error: any) {
      setError('Failed to load schedule details: ' + error.message);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateSchedule = async () => {
    try {
      if (!scheduleForm.name || !scheduleForm.restaurant) {
        setError('Please fill in all required fields');
        return;
      }

      if (editingSchedule) {
        const updateData = {
          name: scheduleForm.name,
          description: scheduleForm.description,
          dailySchedules: scheduleForm.dailySchedules,
          exceptions: scheduleForm.exceptions,
          timezone: scheduleForm.timezone,
          effectiveFrom: scheduleForm.effectiveFrom,
          effectiveTo: scheduleForm.effectiveTo
        };
        await scheduleService.updateSchedule(editingSchedule._id, updateData);
        setSuccess('Schedule updated successfully');
      } else {
        await scheduleService.createSchedule(scheduleForm);
        setSuccess('Schedule created successfully');
      }

      setScheduleDialogOpen(false);
      setEditingSchedule(null);
      resetScheduleForm();
      loadSchedules();
    } catch (error: any) {
      setError('Failed to save schedule: ' + error.message);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      await scheduleService.deleteSchedule(scheduleId);
      setSuccess('Schedule deleted successfully');
      loadSchedules();
      if (selectedSchedule?._id === scheduleId) {
        setSelectedSchedule(null);
      }
    } catch (error: any) {
      setError('Failed to delete schedule: ' + error.message);
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedSchedule) return;

    try {
      if (approvalForm.action === 'approve') {
        await scheduleService.approveSchedule(selectedSchedule._id, approvalForm.comments);
        setSuccess('Schedule approved successfully');
      } else {
        await scheduleService.rejectSchedule(selectedSchedule._id, approvalForm.reason);
        setSuccess('Schedule rejected successfully');
      }

      setApprovalDialogOpen(false);
      resetApprovalForm();
      loadSchedules();
      loadScheduleDetails(selectedSchedule._id);
    } catch (error: any) {
      setError('Failed to process approval: ' + error.message);
    }
  };

  const handleToggleScheduleStatus = async (scheduleId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await scheduleService.activateSchedule(scheduleId);
        setSuccess('Schedule activated successfully');
      } else {
        await scheduleService.deactivateSchedule(scheduleId);
        setSuccess('Schedule deactivated successfully');
      }
      loadSchedules();
      if (selectedSchedule?._id === scheduleId) {
        loadScheduleDetails(scheduleId);
      }
    } catch (error: any) {
      setError('Failed to update schedule status: ' + error.message);
    }
  };

  const handleAddException = async () => {
    if (!selectedSchedule) return;

    try {
      await scheduleService.addScheduleException(selectedSchedule._id, exceptionForm);
      setSuccess('Exception added successfully');
      setExceptionDialogOpen(false);
      resetExceptionForm();
      loadScheduleDetails(selectedSchedule._id);
    } catch (error: any) {
      setError('Failed to add exception: ' + error.message);
    }
  };

  const handleRemoveException = async (exceptionDate: Date) => {
    if (!selectedSchedule) return;

    try {
      await scheduleService.removeScheduleException(selectedSchedule._id, exceptionDate);
      setSuccess('Exception removed successfully');
      loadScheduleDetails(selectedSchedule._id);
    } catch (error: any) {
      setError('Failed to remove exception: ' + error.message);
    }
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      name: '',
      description: '',
      type: 'RESTAURANT',
      restaurant: '',
      venue: '',
      kitchen: '',
      menuItems: [],
      dailySchedules: [
        { dayOfWeek: 1, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
        { dayOfWeek: 2, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
        { dayOfWeek: 3, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
        { dayOfWeek: 4, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
        { dayOfWeek: 5, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
        { dayOfWeek: 6, isOpen: true, openTime: '06:00', closeTime: '22:00', breaks: [] },
        { dayOfWeek: 0, isOpen: true, openTime: '08:00', closeTime: '20:00', breaks: [] }
      ],
      exceptions: [],
      timezone: 'America/New_York',
      effectiveFrom: new Date()
    });
  };

  const resetExceptionForm = () => {
    setExceptionForm({
      date: new Date(),
      isOpen: false,
      openTime: '',
      closeTime: '',
      reason: '',
      type: 'HOLIDAY'
    });
  };

  const resetApprovalForm = () => {
    setApprovalForm({
      action: 'approve',
      comments: '',
      reason: ''
    });
  };

  const openScheduleDialog = (schedule?: ScheduleType) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setScheduleForm({
        name: schedule.name,
        description: schedule.description || '',
        type: schedule.type,
        restaurant: schedule.restaurant,
        venue: schedule.venue || '',
        kitchen: schedule.kitchen || '',
        menuItems: schedule.menuItems || [],
        dailySchedules: schedule.dailySchedules ?? [],
        exceptions: schedule.exceptions ?? [],
        timezone: schedule.timezone,
        effectiveFrom: schedule.effectiveFrom,
        effectiveTo: schedule.effectiveTo
      });
    } else {
      setEditingSchedule(null);
      resetScheduleForm();
    }
    setScheduleDialogOpen(true);
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING_APPROVAL': return 'warning';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RESTAURANT': return <Restaurant />;
      case 'KITCHEN': return <Kitchen />;
      case 'VENUE': return <Business />;
      case 'MENU_ITEM': return <Restaurant />;
      default: return <ScheduleIcon />;
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const getScheduleStats = () => {
    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter(s => s.isActive).length;
    const pendingApproval = schedules.filter(s => s.approvalStatus === 'PENDING_APPROVAL').length;
    const approvedSchedules = schedules.filter(s => s.approvalStatus === 'APPROVED').length;

    return { totalSchedules, activeSchedules, pendingApproval, approvedSchedules };
  };

  const { totalSchedules, activeSchedules, pendingApproval, approvedSchedules } = getScheduleStats();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
          Schedule Management
        </Typography>

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
              onBusinessChange={setSelectedBusinessId}
              onRestaurantChange={setSelectedRestaurantId}
              onVenueChange={setSelectedVenueId}
              showBusinessSelector={true}
              showVenueSelector={true}
              size="small"
            />
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Schedules
                </Typography>
                <Typography variant="h4">
                  {totalSchedules}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Schedules
                </Typography>
                <Typography variant="h4">
                  {activeSchedules}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Approval
                </Typography>
                <Typography variant="h4">
                  <Badge badgeContent={pendingApproval} color="warning">
                    {pendingApproval}
                  </Badge>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved Schedules
                </Typography>
                <Typography variant="h4">
                  {approvedSchedules}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Card */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="schedule management tabs">
              <Tab label="Schedules Overview" id="schedule-tab-0" aria-controls="schedule-tabpanel-0" />
              <Tab label="Schedule Details" id="schedule-tab-1" aria-controls="schedule-tabpanel-1" />
              <Tab label="Approval Management" id="schedule-tab-2" aria-controls="schedule-tabpanel-2" />
            </Tabs>
          </Box>

          {/* Tab 0: Schedules Overview */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="RESTAURANT">Restaurant</MenuItem>
                  <MenuItem value="KITCHEN">Kitchen</MenuItem>
                  <MenuItem value="VENUE">Venue</MenuItem>
                  <MenuItem value="MENU_ITEM">Menu Item</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ ml: 'auto' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => openScheduleDialog()}
                >
                  Create Schedule
                </Button>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Approval Status</TableCell>
                    <TableCell>Effective From</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from(new Array(5)).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton /></TableCell>
                        <TableCell><Skeleton /></TableCell>
                      </TableRow>
                    ))
                  ) : schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography color="textSecondary">No schedules found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((schedule) => (
                      <TableRow key={schedule._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTypeIcon(schedule.type)}
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {schedule.name}
                              </Typography>
                              {schedule.description && (
                                <Typography variant="caption" color="textSecondary">
                                  {schedule.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.type}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={schedule.isActive}
                                onChange={(e) => handleToggleScheduleStatus(schedule._id, e.target.checked)}
                                size="small"
                              />
                            }
                            label={schedule.isActive ? 'Active' : 'Inactive'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.approvalStatus}
                            color={getApprovalStatusColor(schedule.approvalStatus) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(schedule.effectiveFrom)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openScheduleDialog(schedule)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Details">
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  loadScheduleDetails(schedule._id);
                                  setTabValue(1);
                                }}
                              >
                                <Schedule fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {schedule.approvalStatus === 'PENDING_APPROVAL' && (
                              <Tooltip title="Review">
                                <IconButton 
                                  size="small" 
                                  color="warning"
                                  onClick={() => {
                                    setSelectedSchedule(schedule);
                                    setApprovalDialogOpen(true);
                                  }}
                                >
                                  <Pending fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteSchedule(schedule._id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Tab 1: Schedule Details */}
          <TabPanel value={tabValue} index={1}>
            {selectedSchedule ? (
              <Box>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5">{selectedSchedule.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setExceptionDialogOpen(true)}
                    >
                      Add Exception
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => openScheduleDialog(selectedSchedule)}
                    >
                      Edit Schedule
                    </Button>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Weekly Schedule
                        </Typography>
                        <List>
                          {(selectedSchedule?.dailySchedules && Array.isArray(selectedSchedule.dailySchedules) ? selectedSchedule.dailySchedules : []).map((day: any) => (
                            <ListItem key={day.dayOfWeek}>
                              <ListItemIcon>
                                {day.isOpen ? <CheckCircle color="success" /> : <Cancel color="error" />}
                              </ListItemIcon>
                              <ListItemText
                                primary={getDayName(day.dayOfWeek)}
                                secondary={
                                  day.isOpen 
                                    ? `${formatTime(day.openTime)} - ${formatTime(day.closeTime)}`
                                    : 'Closed'
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>

                    {(selectedSchedule?.exceptions ?? []).length > 0 && (
                      <Card sx={{ mt: 2 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Schedule Exceptions
                          </Typography>
                          <List>
                            {(selectedSchedule?.exceptions ?? []).map((exception, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <Warning color="warning" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={formatDate(exception.date)}
                                  secondary={
                                    exception.isOpen
                                      ? `Special hours: ${formatTime(exception.openTime!)} - ${formatTime(exception.closeTime!)}`
                                      : `Closed - ${exception.reason}`
                                  }
                                />
                                <IconButton 
                                  edge="end"
                                  onClick={() => handleRemoveException(exception.date)}
                                >
                                  <Delete />
                                </IconButton>
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Schedule Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Type
                            </Typography>
                            <Typography variant="body2">
                              {selectedSchedule.type}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Approval Status
                            </Typography>
                            <Chip
                              label={selectedSchedule.approvalStatus}
                              color={getApprovalStatusColor(selectedSchedule.approvalStatus) as any}
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Effective From
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(selectedSchedule.effectiveFrom)}
                            </Typography>
                          </Box>
                          {selectedSchedule.effectiveTo && (
                            <Box>
                              <Typography variant="caption" color="textSecondary">
                                Effective To
                              </Typography>
                              <Typography variant="body2">
                                {formatDate(selectedSchedule.effectiveTo)}
                              </Typography>
                            </Box>
                          )}
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Timezone
                            </Typography>
                            <Typography variant="body2">
                              {selectedSchedule.timezone}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              Status
                            </Typography>
                            <Chip
                              label={selectedSchedule.isActive ? 'Active' : 'Inactive'}
                              color={selectedSchedule.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Select a schedule from the overview to view details
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Tab 2: Approval Management */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Schedules Pending Approval
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Submitted Date</TableCell>
                    <TableCell>Submitted By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules
                    .filter(s => s.approvalStatus === 'PENDING_APPROVAL')
                    .map((schedule) => (
                      <TableRow key={schedule._id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {schedule.name}
                            </Typography>
                            {schedule.description && (
                              <Typography variant="caption" color="textSecondary">
                                {schedule.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{schedule.type}</TableCell>
                        <TableCell>{formatDate(schedule.createdAt!)}</TableCell>
                        <TableCell>{schedule.createdBy || 'Unknown'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              color="success"
                              variant="outlined"
                              startIcon={<CheckCircle />}
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setApprovalForm({ action: 'approve', comments: '', reason: '' });
                                setApprovalDialogOpen(true);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<Cancel />}
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setApprovalForm({ action: 'reject', comments: '', reason: '' });
                                setApprovalDialogOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>

        {/* Create/Edit Schedule Dialog */}
        <Dialog 
          open={scheduleDialogOpen} 
          onClose={() => setScheduleDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Schedule Name"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={scheduleForm.type}
                    label="Type"
                    onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as any })}
                  >
                    <MenuItem value="RESTAURANT">Restaurant</MenuItem>
                    <MenuItem value="KITCHEN">Kitchen</MenuItem>
                    <MenuItem value="VENUE">Venue</MenuItem>
                    <MenuItem value="MENU_ITEM">Menu Item</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                />
              </Grid>
              {/* Dynamic resource fields based on schedule type */}
              {scheduleForm.type === 'RESTAURANT' && (
                <Grid item xs={12}>
                  <RestaurantVenueSelector
                    selectedRestaurantId={scheduleForm.restaurant}
                    onRestaurantChange={(restaurantId) => setScheduleForm({ ...scheduleForm, restaurant: restaurantId })}
                    showVenueSelector={false}
                    required={true}
                    label="Restaurant"
                  />
                </Grid>
              )}
              
              {scheduleForm.type === 'KITCHEN' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Kitchen ID"
                      value={scheduleForm.kitchen}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, kitchen: e.target.value })}
                      required
                      helperText="Enter the kitchen ID for kitchen schedule"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RestaurantVenueSelector
                      selectedRestaurantId={scheduleForm.restaurant}
                      onRestaurantChange={(restaurantId) => setScheduleForm({ ...scheduleForm, restaurant: restaurantId })}
                      showVenueSelector={false}
                      required={true}
                      label="Restaurant"
                    />
                  </Grid>
                </>
              )}
              
              {scheduleForm.type === 'VENUE' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Venue ID"
                      value={scheduleForm.venue}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                      required
                      helperText="Enter the venue ID for venue schedule"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RestaurantVenueSelector
                      selectedRestaurantId={scheduleForm.restaurant}
                      onRestaurantChange={(restaurantId) => setScheduleForm({ ...scheduleForm, restaurant: restaurantId })}
                      showVenueSelector={false}
                      required={true}
                      label="Restaurant"
                    />
                  </Grid>
                </>
              )}
              
              {scheduleForm.type === 'MENU_ITEM' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Menu Item ID"
                      value={scheduleForm.menuItems?.[0] || ''}
                      onChange={(e) => setScheduleForm({ 
                        ...scheduleForm, 
                        menuItems: e.target.value ? [e.target.value] : [],
                        restaurant: scheduleForm.restaurant // Keep restaurant ID for menu items
                      })}
                      required
                      helperText="Enter the menu item ID for menu item schedule"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RestaurantVenueSelector
                      selectedRestaurantId={scheduleForm.restaurant}
                      onRestaurantChange={(restaurantId) => setScheduleForm({ ...scheduleForm, restaurant: restaurantId })}
                      showVenueSelector={false}
                      required={true}
                      label="Restaurant"
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Timezone"
                  value={scheduleForm.timezone}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, timezone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Effective From"
                  value={scheduleForm.effectiveFrom}
                  onChange={(date) => setScheduleForm({ ...scheduleForm, effectiveFrom: date || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Weekly Schedule
                </Typography>
                {scheduleForm.dailySchedules.map((day, index) => (
                  <Accordion key={day.dayOfWeek}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                          {getDayName(day.dayOfWeek)}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={day.isOpen}
                              onChange={(e) => {
                                const newSchedules = [...scheduleForm.dailySchedules];
                                newSchedules[index].isOpen = e.target.checked;
                                setScheduleForm({ ...scheduleForm, dailySchedules: newSchedules });
                              }}
                            />
                          }
                          label={day.isOpen ? 'Open' : 'Closed'}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      {day.isOpen && (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TimePicker
                              label="Open Time"
                              value={day.openTime ? new Date(`1970-01-01T${day.openTime}:00`) : null}
                              onChange={(time) => {
                                const newSchedules = [...scheduleForm.dailySchedules];
                                newSchedules[index].openTime = time 
                                  ? time.toTimeString().substring(0, 5)
                                  : '06:00';
                                setScheduleForm({ ...scheduleForm, dailySchedules: newSchedules });
                              }}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TimePicker
                              label="Close Time"
                              value={day.closeTime ? new Date(`1970-01-01T${day.closeTime}:00`) : null}
                              onChange={(time) => {
                                const newSchedules = [...scheduleForm.dailySchedules];
                                newSchedules[index].closeTime = time 
                                  ? time.toTimeString().substring(0, 5)
                                  : '22:00';
                                setScheduleForm({ ...scheduleForm, dailySchedules: newSchedules });
                              }}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              {editingSchedule ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Exception Dialog */}
        <Dialog open={exceptionDialogOpen} onClose={() => setExceptionDialogOpen(false)}>
          <DialogTitle>Add Schedule Exception</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <DatePicker
                  label="Exception Date"
                  value={exceptionForm.date}
                  onChange={(date) => setExceptionForm({ ...exceptionForm, date: date || new Date() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Exception Type</InputLabel>
                  <Select
                    value={exceptionForm.type}
                    label="Exception Type"
                    onChange={(e) => setExceptionForm({ ...exceptionForm, type: e.target.value as any })}
                  >
                    <MenuItem value="HOLIDAY">Holiday</MenuItem>
                    <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                    <MenuItem value="SPECIAL_EVENT">Special Event</MenuItem>
                    <MenuItem value="CLOSURE">Closure</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={exceptionForm.isOpen}
                      onChange={(e) => setExceptionForm({ ...exceptionForm, isOpen: e.target.checked })}
                    />
                  }
                  label="Open on this day"
                />
              </Grid>
              {exceptionForm.isOpen && (
                <>
                  <Grid item xs={6}>
                    <TimePicker
                      label="Open Time"
                      value={exceptionForm.openTime ? new Date(`1970-01-01T${exceptionForm.openTime}:00`) : null}
                      onChange={(time) => setExceptionForm({ 
                        ...exceptionForm, 
                        openTime: time ? time.toTimeString().substring(0, 5) : ''
                      })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TimePicker
                      label="Close Time"
                      value={exceptionForm.closeTime ? new Date(`1970-01-01T${exceptionForm.closeTime}:00`) : null}
                      onChange={(time) => setExceptionForm({ 
                        ...exceptionForm, 
                        closeTime: time ? time.toTimeString().substring(0, 5) : ''
                      })}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  value={exceptionForm.reason}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExceptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddException} variant="contained">
              Add Exception
            </Button>
          </DialogActions>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)}>
          <DialogTitle>
            {approvalForm.action === 'approve' ? 'Approve Schedule' : 'Reject Schedule'}
          </DialogTitle>
          <DialogContent>
            {selectedSchedule && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Schedule: {selectedSchedule.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Type: {selectedSchedule.type}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              label={approvalForm.action === 'approve' ? 'Approval Comments' : 'Rejection Reason'}
              multiline
              rows={3}
              value={approvalForm.comments}
              onChange={(e) => setApprovalForm({ ...approvalForm, comments: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApprovalAction} 
              variant="contained"
              color={approvalForm.action === 'approve' ? 'success' : 'error'}
            >
              {approvalForm.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add schedule"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => openScheduleDialog()}
        >
          <Add />
        </Fab>
      </Box>
    </LocalizationProvider>
  );
};

export default ScheduleManagement; 