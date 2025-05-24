import * as React from 'react';
const { useState } = React;
import { 
  Box, 
  Typography, 
  Paper, 
  Switch, 
  FormControlLabel, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  FormGroup,
  Grid,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  NotificationsActive as PushIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const NotificationSettings: React.FC = () => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    notifyNewOrders: true,
    notifyLowInventory: true,
    notifyReservations: true,
    notifyPromotions: false,
  });

  interface EmailNotification {
    id: number;
    type: string;
    email: string;
    active: boolean;
  }

  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([
    { id: 1, type: 'order', email: 'admin@example.com', active: true },
    { id: 2, type: 'inventory', email: 'inventory@example.com', active: true },
  ]);

  const [newEmail, setNewEmail] = useState<string>('');
  const [notificationType, setNotificationType] = useState<string>('order');

  const handleSettingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSettings((prev: any) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAddEmail = () => {
    if (newEmail && notificationType) {
      setEmailNotifications([
        ...emailNotifications,
        {
          id: Date.now(),
          type: notificationType,
          email: newEmail,
          active: true
        }
      ]);
      setNewEmail('');
    }
  };

  const toggleEmailActive = (id: number) => {
    setEmailNotifications(emailNotifications.map((item: EmailNotification) => 
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const deleteEmail = (id: number) => {
    setEmailNotifications(emailNotifications.filter((item: EmailNotification) => item.id !== id));
  };

  const handleNotificationTypeChange = (event: SelectChangeEvent<string>) => {
    setNotificationType(event.target.value);
  };
  
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NotificationsIcon sx={{ mr: 1 }} /> Notification Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Notification Methods</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Choose how you want to receive notifications
        </Typography>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailEnabled}
                onChange={handleSettingChange}
                name="emailEnabled"
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EmailIcon sx={{ mr: 1, color: settings.emailEnabled ? 'primary.main' : 'action.disabled' }} />
                Email Notifications
              </Box>
            }
            sx={{ mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.smsEnabled}
                onChange={handleSettingChange}
                name="smsEnabled"
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SmsIcon sx={{ mr: 1, color: settings.smsEnabled ? 'primary.main' : 'action.disabled' }} />
                SMS Notifications
              </Box>
            }
            sx={{ mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.pushEnabled}
                onChange={handleSettingChange}
                name="pushEnabled"
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PushIcon sx={{ mr: 1, color: settings.pushEnabled ? 'primary.main' : 'action.disabled' }} />
                Push Notifications
              </Box>
            }
          />
        </FormGroup>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Notification Types</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Select which types of notifications you want to receive
        </Typography>
        
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyNewOrders}
                onChange={handleSettingChange}
                name="notifyNewOrders"
                color="primary"
              />
            }
            label="New Orders"
            sx={{ mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyLowInventory}
                onChange={handleSettingChange}
                name="notifyLowInventory"
                color="primary"
              />
            }
            label="Low Inventory Alerts"
            sx={{ mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyReservations}
                onChange={handleSettingChange}
                name="notifyReservations"
                color="primary"
              />
            }
            label="Reservation Updates"
            sx={{ mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.notifyPromotions}
                onChange={handleSettingChange}
                name="notifyPromotions"
                color="primary"
              />
            }
            label="Promotions & Offers"
          />
        </FormGroup>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Email Notifications</Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Manage email addresses that will receive notifications
        </Typography>
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              size="small"
              value={newEmail}
              onChange={handleEmailChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="notification-type-label">Notification Type</InputLabel>
              <Select
                labelId="notification-type-label"
                value={notificationType}
                label="Notification Type"
                onChange={handleNotificationTypeChange}
              >
                <MenuItem value="order">Order Updates</MenuItem>
                <MenuItem value="inventory">Inventory Alerts</MenuItem>
                <MenuItem value="reservation">Reservations</MenuItem>
                <MenuItem value="all">All Notifications</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddEmail}
              disabled={!newEmail}
            >
              Add Email
            </Button>
          </Grid>
        </Grid>
        
        <List>
          {emailNotifications.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem>
                <ListItemText 
                  primary={item.email} 
                  secondary={`Type: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`} 
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => toggleEmailActive(item.id)}
                    color={item.active ? 'primary' : 'default'}
                  >
                    {item.active ? <NotificationsIcon color="primary" /> : <NotificationsIcon />}
                  </IconButton>
                  <IconButton edge="end" onClick={() => deleteEmail(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default NotificationSettings;
