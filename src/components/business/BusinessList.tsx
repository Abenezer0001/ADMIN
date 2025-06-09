import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  SelectChangeEvent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { Business, CreateBusinessData, CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from '../../types/business';
import BusinessService from '../../services/BusinessService';
import { toast } from 'react-toastify';

const BusinessList: React.FC = () => {
  const navigate = useNavigate();
  const {
    businesses,
    isLoading,
    error,
    createBusiness,
    updateBusiness,
    deactivateBusiness,
    activateBusiness,
    isSuperAdmin,
    loadAllBusinesses
  } = useBusiness();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedBusiness, setSelectedBusiness] = React.useState<Business | null>(null);
  const [editingBusiness, setEditingBusiness] = React.useState<Business | null>(null);
  const [formData, setFormData] = React.useState<CreateBusinessData>({
    name: '',
    legalName: '',
    registrationNumber: '',
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    ownerEmail: '',
    settings: {
      multiRestaurant: true,
      allowStaffManagement: true,
      requireApprovalForNewStaff: false,
      defaultCurrency: 'AED',
      defaultTimezone: 'Asia/Dubai'
    }
  });

  React.useEffect(() => {
    if (isSuperAdmin()) {
      loadAllBusinesses();
    }
  }, []);

  const handleOpenDialog = (business?: Business) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        name: business.name,
        legalName: business.legalName || '',
        registrationNumber: business.registrationNumber || '',
        contactInfo: {
          email: business.contactInfo.email,
          phone: business.contactInfo.phone || '',
          address: business.contactInfo.address || ''
        },
        ownerEmail: business.owner?.email || '',
        settings: {
          multiRestaurant: business.settings?.multiRestaurant ?? true,
          allowStaffManagement: business.settings?.allowStaffManagement ?? true,
          requireApprovalForNewStaff: business.settings?.requireApprovalForNewStaff ?? false,
          defaultCurrency: business.settings?.defaultCurrency || 'AED',
          defaultTimezone: business.settings?.defaultTimezone || 'Asia/Dubai'
        }
      });
    } else {
      setEditingBusiness(null);
      setFormData({
        name: '',
        legalName: '',
        registrationNumber: '',
        contactInfo: {
          email: '',
          phone: '',
          address: ''
        },
        ownerEmail: '',
        settings: {
          multiRestaurant: true,
          allowStaffManagement: true,
          requireApprovalForNewStaff: false,
          defaultCurrency: 'AED',
          defaultTimezone: 'Asia/Dubai'
        }
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBusiness(null);
  };

  const handleSave = async () => {
    try {
      if (editingBusiness) {
        await updateBusiness(editingBusiness._id, {
          name: formData.name,
          legalName: formData.legalName,
          registrationNumber: formData.registrationNumber,
          contactInfo: formData.contactInfo,
          settings: formData.settings
        });
        toast.success('Business updated successfully!');
      } else {
        await createBusiness(formData);
        toast.success('Business created successfully!');
      }
      handleCloseDialog();
    } catch (error: any) {
      console.error('Failed to save business:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while saving the business';
      toast.error(errorMessage);
    }
  };

  const handleDeactivate = async (businessId: string) => {
    if (window.confirm('Are you sure you want to deactivate this business?')) {
      try {
        await deactivateBusiness(businessId);
        loadAllBusinesses();
        toast.success('Business deactivated successfully!');
      } catch (error: any) {
        console.error('Failed to deactivate business:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to deactivate business';
        toast.error(errorMessage);
      }
    }
  };

  const handleActivate = async (businessId: string) => {
    if (window.confirm('Are you sure you want to activate this business?')) {
      try {
        await activateBusiness(businessId);
        loadAllBusinesses();
        toast.success('Business activated successfully!');
      } catch (error: any) {
        console.error('Failed to activate business:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to activate business';
        toast.error(errorMessage);
      }
    }
  };

  const handleViewBusiness = (businessId: string) => {
    navigate(`/businesses/${businessId}/edit`);
  };

  const handleEditBusiness = (businessId: string) => {
    navigate(`/businesses/${businessId}/edit`);
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      try {
        await deactivateBusiness(businessId);
        loadAllBusinesses();
        toast.success('Business deleted successfully!');
      } catch (error: any) {
        console.error('Failed to delete business:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete business';
        toast.error(errorMessage);
      }
    }
  };

  const handleFormDataChange = (field: string, value: any) => {
    setFormData((prev: CreateBusinessData) => ({ ...prev, [field]: value }));
  };

  const handleContactInfoChange = (field: string, value: string) => {
    setFormData((prev: CreateBusinessData) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value }
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setFormData((prev: CreateBusinessData) => ({
      ...prev,
      settings: { ...prev.settings!, [field]: value }
    }));
  };

  if (!isSuperAdmin()) {
    return (
      <Alert severity="error">
        Access denied. Only Super Admins can manage businesses.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BusinessIcon sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Business Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={isLoading}
        >
          Add Business
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Business Name</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Restaurants</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {businesses.map((business) => (
                    <TableRow 
                      key={business._id} 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                      onClick={() => handleViewBusiness(business._id)}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {business.name}
                          </Typography>
                          {business.legalName && (
                            <Typography variant="body2" color="text.secondary">
                              {business.legalName}
                            </Typography>
                          )}
                          {business.registrationNumber && (
                            <Typography variant="caption" color="text.secondary">
                              Reg: {business.registrationNumber}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {business.owner?.firstName} {business.owner?.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {business.owner?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption">
                              {business.contactInfo.email}
                            </Typography>
                          </Box>
                          {business.contactInfo.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                {business.contactInfo.phone}
                              </Typography>
                            </Box>
                          )}
                          {business.contactInfo.address && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon sx={{ fontSize: 16 }} />
                              <Typography variant="caption">
                                {business.contactInfo.address}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {business.restaurants?.length || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <Chip
                            label={business.isActive ? 'Active' : 'Inactive'}
                            color={business.isActive ? 'success' : 'default'}
                            size="small"
                            onClick={() => business.isActive ? handleDeactivate(business._id) : handleActivate(business._id)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: business.isActive ? 'success.light' : 'error.light'
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditBusiness(business._id)}
                            color="primary"
                            title="Edit Business"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteBusiness(business._id)}
                            color="error"
                            title="Delete Business"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {businesses.length === 0 && (
                    <TableRow>
                      <TableCell sx={{ textAlign: 'center', borderBottom: 'none' }}>
                        <Typography variant="body2" color="text.secondary">
                          No businesses found
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}></TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}></TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}></TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}></TableCell>
                      <TableCell sx={{ borderBottom: 'none' }}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Business Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          {editingBusiness ? 'Edit Business' : 'Add New Business'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Name *"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormDataChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Legal Name"
                value={formData.legalName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormDataChange('legalName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormDataChange('registrationNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Owner Email *"
                type="email"
                value={formData.ownerEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFormDataChange('ownerEmail', e.target.value)}
                disabled={!!editingBusiness}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Contact Information</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Email *"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactInfoChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.contactInfo.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactInfoChange('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.contactInfo.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactInfoChange('address', e.target.value)}
              />
            </Grid>

            {/* Business Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Business Settings</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Multi-Restaurant Support</FormLabel>
                <RadioGroup
                  row
                  value={formData.settings?.multiRestaurant ? 'true' : 'false'}
                  onChange={(e) => handleSettingsChange('multiRestaurant', e.target.value === 'true')}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Allow Staff Management</FormLabel>
                <RadioGroup
                  row
                  value={formData.settings?.allowStaffManagement ? 'true' : 'false'}
                  onChange={(e) => handleSettingsChange('allowStaffManagement', e.target.value === 'true')}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Require Approval for New Staff</FormLabel>
                <RadioGroup
                  row
                  value={formData.settings?.requireApprovalForNewStaff ? 'true' : 'false'}
                  onChange={(e) => handleSettingsChange('requireApprovalForNewStaff', e.target.value === 'true')}
                >
                  <FormControlLabel value="true" control={<Radio />} label="Yes" />
                  <FormControlLabel value="false" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Default Currency</InputLabel>
                <Select
                  value={formData.settings?.defaultCurrency || ''}
                  label="Default Currency"
                  onChange={(e: SelectChangeEvent) => handleSettingsChange('defaultCurrency', e.target.value)}
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Default Timezone</InputLabel>
                <Select
                  value={formData.settings?.defaultTimezone || ''}
                  label="Default Timezone"
                  onChange={(e: SelectChangeEvent) => handleSettingsChange('defaultTimezone', e.target.value)}
                >
                  {TIMEZONE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || !formData.contactInfo.email || (!editingBusiness && !formData.ownerEmail)}
          >
            {editingBusiness ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BusinessList; 