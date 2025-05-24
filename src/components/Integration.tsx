// @ts-ignore
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  Collapse
} from '@mui/material';
import {
  CreditCard as PaymentIcon,
  Receipt as InvoiceIcon,
  Email as EmailIcon,
  Cloud as CloudIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Types
type IntegrationType = 'payment' | 'invoice' | 'email' | 'storage' | 'other';

interface IntegrationConfig {
  id: string;
  type: IntegrationType;
  name: string;
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  config?: Record<string, any>;
}

const INTEGRATION_TYPES: Record<IntegrationType, { name: string; icon: React.ReactNode }> = {
  payment: { name: 'Payment Gateway', icon: <PaymentIcon /> },
  invoice: { name: 'Invoicing', icon: <InvoiceIcon /> },
  email: { name: 'Email Service', icon: <EmailIcon /> },
  storage: { name: 'Cloud Storage', icon: <CloudIcon /> },
  other: { name: 'Other', icon: <CloudIcon /> },
};

const DEFAULT_CONFIGS: Record<IntegrationType, Partial<IntegrationConfig>> = {
  payment: {
    type: 'payment',
    name: 'Payment Gateway',
    enabled: false,
    config: {
      provider: 'stripe', // or 'paypal', 'razorpay', etc.
      testMode: true,
    },
  },
  invoice: {
    type: 'invoice',
    name: 'Invoicing Service',
    enabled: false,
    config: {
      autoGenerate: true,
      taxInclusive: true,
    },
  },
  email: {
    type: 'email',
    name: 'Email Service',
    enabled: false,
    config: {
      provider: 'smtp', // or 'sendgrid', 'mailgun', etc.
      fromEmail: 'noreply@example.com',
    },
  },
  storage: {
    type: 'storage',
    name: 'Cloud Storage',
    enabled: false,
    config: {
      provider: 'aws-s3', // or 'google-cloud', 'azure', etc.
      region: 'us-east-1',
    },
  },
  other: {
    type: 'other',
    name: 'Custom Integration',
    enabled: false,
    config: {},
  },
};

const Integration: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [activeTab, setActiveTab] = useState<IntegrationType>('payment');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load saved integrations on component mount
  useEffect(() => {
    // In a real app, this would be an API call
    const savedIntegrations = localStorage.getItem('integrations');
    if (savedIntegrations) {
      setIntegrations(JSON.parse(savedIntegrations));
    } else {
      // Initialize with default configs
      const defaultIntegrations = Object.values(DEFAULT_CONFIGS).map(config => ({
        ...config,
        id: `${config.type}-${Date.now()}`,
      })) as IntegrationConfig[];
      setIntegrations(defaultIntegrations);
    }
  }, []);

  const getDefaultConfig = (type: IntegrationType): IntegrationConfig => {
    const defaultConfig = DEFAULT_CONFIGS[type] || {};
    return {
      id: `${type}-${Date.now()}`,
      type,
      name: defaultConfig.name || type,
      enabled: false,
      ...defaultConfig
    };
  };

  const activeIntegration = integrations.find((i: IntegrationConfig) => i.type === activeTab) || 
    getDefaultConfig(activeTab);

  const handleTabChange = (tab: IntegrationType): void => {
    setActiveTab(tab);
    setSaved(false);
    setSaveError(null);
  };

  const handleConfigChange = (field: string, value: unknown) => {
    setIntegrations((prev: IntegrationConfig[]) => {
      const existingIndex = prev.findIndex(i => i.type === activeTab);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [field]: value,
        };
        return updated;
      }
      
      return [
        ...prev,
        {
          ...getDefaultConfig(activeTab),
          [field]: value,
        }
      ];
    });
  };

  const handleNestedConfigChange = (field: string, value: unknown) => {
    setIntegrations((prev: IntegrationConfig[]) => {
      const existingIndex = prev.findIndex(i => i.type === activeTab);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          config: {
            ...(updated[existingIndex].config || {}),
            [field]: value,
          },
        };
        return updated;
      }
      
      return [
        ...prev,
        {
          ...getDefaultConfig(activeTab),
          config: {
            [field]: value,
          },
        }
      ];
    });
  };

  const handleSave = (): void => {
    try {
      // In a real app, this would be an API call
      localStorage.setItem('integrations', JSON.stringify(integrations));
      setSaved(true);
      setSaveError(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaveError('Failed to save integrations. Please try again.');
      console.error('Error saving integrations:', error);
    }
  };

  // Helper function to handle input change events with proper typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const target = e.target as { name?: string; value: unknown };
    const { name, value } = target;
    if (name?.startsWith('config.')) {
      handleNestedConfigChange(name.replace('config.', ''), value);
    } else if (name) {
      handleConfigChange(name, value);
    }
  };

  // Handle switch change events with proper typing
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, isNested = false) => {
    const target = e.target as { checked?: boolean };
    const { checked } = target;
    if (isNested) {
      handleNestedConfigChange(field, checked);
    } else {
      handleConfigChange(field, checked);
    }
  };

  // Handle select change events with proper typing
  const handleSelectChange = (e: SelectChangeEvent<string>, isNested = false) => {
    const target = e.target as { name?: string; value: string };
    const { name, value } = target;
    if (name && isNested) {
      handleNestedConfigChange(name.replace('config.', ''), value);
    } else if (name) {
      handleConfigChange(name, value);
    }
  };

  // Helper to safely access integration type name
  const getIntegrationTypeName = (type: IntegrationType): string => {
    return INTEGRATION_TYPES[type]?.name || type;
  };

  const renderIntegrationForm = (): JSX.Element => {
    switch (activeTab) {
      case 'payment':
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={activeIntegration.enabled || false}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Payment Integration"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="payment-provider-label">Payment Provider</InputLabel>
              <Select
                labelId="payment-provider-label"
                value={activeIntegration.config?.provider || 'stripe'}
                onChange={(e) => handleNestedConfigChange('provider', e.target.value)}
                label="Payment Provider"
              >
                <MenuItem value="stripe">Stripe</MenuItem>
                <MenuItem value="paypal">PayPal</MenuItem>
                <MenuItem value="razorpay">Razorpay</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="API Key"
              value={activeIntegration.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              type="password"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="API Secret"
              value={activeIntegration.apiSecret || ''}
              onChange={(e) => handleConfigChange('apiSecret', e.target.value)}
              type="password"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={activeIntegration.config?.testMode || false}
                  onChange={(e) => handleNestedConfigChange('testMode', e.target.checked)}
                  color="primary"
                />
              }
              label="Test Mode"
            />
          </Box>
        );
        
      case 'invoice':
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={activeIntegration.enabled || false}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Invoicing"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="invoice-provider-label">Invoice Provider</InputLabel>
              <Select
                labelId="invoice-provider-label"
                value={activeIntegration.config?.provider || 'default'}
                onChange={(e) => handleNestedConfigChange('provider', e.target.value)}
                label="Invoice Provider"
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="quickbooks">QuickBooks</MenuItem>
                <MenuItem value="xero">Xero</MenuItem>
                <MenuItem value="zoho">Zoho Books</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={activeIntegration.config?.autoGenerate || false}
                  onChange={(e) => handleNestedConfigChange('autoGenerate', e.target.checked)}
                  color="primary"
                />
              }
              label="Auto-generate invoices"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={activeIntegration.config?.taxInclusive || false}
                  onChange={(e) => handleNestedConfigChange('taxInclusive', e.target.checked)}
                  color="primary"
                />
              }
              label="Prices include tax"
            />
          </Box>
        );
        
      case 'email':
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={activeIntegration.enabled || false}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Email Service"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="email-provider-label">Email Provider</InputLabel>
              <Select
                labelId="email-provider-label"
                value={activeIntegration.config?.provider || 'smtp'}
                onChange={(e) => handleNestedConfigChange('provider', e.target.value)}
                label="Email Provider"
              >
                <MenuItem value="smtp">SMTP</MenuItem>
                <MenuItem value="sendgrid">SendGrid</MenuItem>
                <MenuItem value="mailgun">Mailgun</MenuItem>
                <MenuItem value="ses">AWS SES</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="From Email"
              value={activeIntegration.config?.fromEmail || ''}
              onChange={(e) => handleNestedConfigChange('fromEmail', e.target.value)}
              type="email"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="API Key"
              value={activeIntegration.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              type="password"
            />
          </Box>
        );
        
      case 'storage':
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={activeIntegration.enabled || false}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Cloud Storage"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="storage-provider-label">Storage Provider</InputLabel>
              <Select
                labelId="storage-provider-label"
                value={activeIntegration.config?.provider || 'aws-s3'}
                onChange={(e) => handleNestedConfigChange('provider', e.target.value)}
                label="Storage Provider"
              >
                <MenuItem value="aws-s3">AWS S3</MenuItem>
                <MenuItem value="google-cloud">Google Cloud Storage</MenuItem>
                <MenuItem value="azure">Azure Blob Storage</MenuItem>
                <MenuItem value="digitalocean">DigitalOcean Spaces</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Access Key"
              value={activeIntegration.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              type="password"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Secret Key"
              value={activeIntegration.apiSecret || ''}
              onChange={(e) => handleConfigChange('apiSecret', e.target.value)}
              type="password"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Bucket Name"
              value={activeIntegration.config?.bucketName || ''}
              onChange={(e) => handleNestedConfigChange('bucketName', e.target.value)}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Region"
              value={activeIntegration.config?.region || ''}
              onChange={(e) => handleNestedConfigChange('region', e.target.value)}
            />
          </Box>
        );
        
      case 'other':
        return (
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={activeIntegration.enabled || false}
                  onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Custom Integration"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Integration Name"
              value={activeIntegration.name || ''}
              onChange={(e) => handleConfigChange('name', e.target.value)}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Webhook URL"
              value={activeIntegration.webhookUrl || ''}
              onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
              placeholder="https://example.com/webhook"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="API Key"
              value={activeIntegration.apiKey || ''}
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              type="password"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Custom Configuration (JSON)"
              value={JSON.stringify(activeIntegration.config || {}, null, 2)}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value);
                  handleConfigChange('config', config);
                } catch (error) {
                  console.error('Invalid JSON');
                }
              }}
              multiline
              rows={6}
              variant="outlined"
            />
          </Box>
        );
        
      default:
        return <Typography>Select an integration type to configure</Typography>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <CloudIcon sx={{ mr: 1 }} /> Integrations
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Connect and configure third-party services to extend the functionality of your INSEAT Admin panel.
      </Typography>
      
      <Collapse in={saveError !== null}>
        <Alert 
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSaveError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {saveError}
        </Alert>
      </Collapse>
      
      <Collapse in={saved}>
        <Alert 
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSaved(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Integration settings saved successfully!
        </Alert>
      </Collapse>
      
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', overflowX: 'auto' }}>
            {(Object.keys(INTEGRATION_TYPES) as IntegrationType[]).map((type) => (
              <Button
                key={type}
                onClick={() => handleTabChange(type)}
                sx={{
                  px: 3,
                  py: 2,
                  borderRadius: 0,
                  borderBottom: activeTab === type ? 2 : 0,
                  borderColor: 'primary.main',
                  color: activeTab === type ? 'primary.main' : 'text.primary',
                  bgcolor: activeTab === type ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  minWidth: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ mb: 0.5 }}>
                  {React.cloneElement(INTEGRATION_TYPES[type].icon as React.ReactElement, {
                    color: activeTab === type ? 'primary' : 'action',
                  })}
                </Box>
                <Typography variant="button" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                  {INTEGRATION_TYPES[type].name}
                </Typography>
              </Button>
            ))}
          </Box>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {getIntegrationTypeName(activeTab)} Settings
              </Typography>
            <Divider sx={{ mb: 3 }} />
            {renderIntegrationForm()}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!activeIntegration}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Integration Status</Typography>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {(Object.keys(INTEGRATION_TYPES) as IntegrationType[]).map((typeKey) => {
              const integration = integrations.find((i: IntegrationConfig) => i.type === typeKey);
              const isEnabled = integration?.enabled || false;
              const type = typeKey as IntegrationType;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={type}>
                  <Box
                    sx={{
                      p: 2,
                      borderLeft: 3,
                      borderColor: isEnabled ? 'success.main' : 'divider',
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      height: '100%',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 1, color: isEnabled ? 'success.main' : 'text.secondary' }}>
                        {INTEGRATION_TYPES[type].icon}
                      </Box>
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {INTEGRATION_TYPES[type].name}
                      </Typography>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: isEnabled ? 'success.main' : 'text.disabled',
                          ml: 1,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {isEnabled ? 'Active' : 'Inactive'}
                    </Typography>
                    {integration?.config?.provider && (
                      <Typography variant="body2" color="textSecondary">
                        Provider: {integration.config.provider}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Integration;
